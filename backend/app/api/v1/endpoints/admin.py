
import logging
import os
from collections import Counter
from datetime import datetime, timezone
from typing import Literal

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from pydantic import BaseModel, ConfigDict

from app.core.firebase import db, firebase_app

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])
bearer_scheme = HTTPBearer()

ML_SERVICE_URL = os.getenv(
    "BUGPULSE_ML_SERVICE_URL",
    "http://127.0.0.1:8001",
).rstrip("/")


def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Verify Firebase identity and enforce the active admin role."""
    if firebase_app is None or db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase authentication or Firestore is not configured.",
        )

    try:
        token = auth.verify_id_token(
            credentials.credentials,
            app=firebase_app,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    uid = token.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase identity has no user ID.",
        )

    snapshot = db.collection("users").document(uid).get()
    if not snapshot.exists:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A registered user profile is required.",
        )

    profile = snapshot.to_dict() or {}

    if not profile.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive.",
        )

    if profile.get("role", "user") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access is required.",
        )

    return {"uid": uid, "profile": profile}


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "admin"] | None = None
    is_active: bool | None = None


def _require_db() -> None:
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firestore is not configured.",
        )


def _active_admin_count() -> int:
    """Count active administrator profiles."""
    count = 0

    for snapshot in db.collection("users").stream():
        data = snapshot.to_dict() or {}
        if (
            data.get("role", "user") == "admin"
            and data.get("is_active", True)
        ):
            count += 1

    return count


def _risk_bucket(value: object) -> str:
    """Normalize stored prediction categories without inventing findings."""
    if not isinstance(value, str) or not value.strip():
        return "unknown"

    category = value.strip().lower()

    aliases = {
        "critical": "critical",
        "very high": "critical",
        "high": "high",
        "medium": "medium",
        "moderate": "medium",
        "low": "low",
    }

    return aliases.get(category, "unknown")


@router.get("/overview")
def get_admin_overview(
    _: dict = Depends(require_admin),
):
    """Aggregate actual user profiles and their saved analysis documents."""
    _require_db()

    try:
        user_count = 0
        active_users = 0
        inactive_users = 0
        admin_users = 0
        total_analyses = 0
        risks = Counter()
        recent = []

        users = list(db.collection("users").stream())
        user_count = len(users)

        for user_snapshot in users:
            user_data = user_snapshot.to_dict() or {}

            is_active = user_data.get("is_active", True)
            if is_active:
                active_users += 1
            else:
                inactive_users += 1

            if user_data.get("role", "user") == "admin" and is_active:
                admin_users += 1

            analyses_ref = (
                db.collection("users")
                .document(user_snapshot.id)
                .collection("analyses")
            )

            for analysis_snapshot in analyses_ref.stream():
                analysis = analysis_snapshot.to_dict() or {}
                total_analyses += 1

                bucket = _risk_bucket(analysis.get("risk_category"))
                risks[bucket] += 1

                # Return metadata only, never source code.
                recent.append({
                    "id": analysis_snapshot.id,
                    "user_id": user_snapshot.id,
                    "filename": analysis.get("filename", ""),
                    "language": analysis.get("language", ""),
                    "timestamp": analysis.get("timestamp"),
                    "risk_category": bucket,
                    "bug_risk_score": analysis.get("bug_risk_score"),
                    "mlModelVersion": analysis.get("mlModelVersion"),
                })

        recent.sort(
            key=lambda item: str(item.get("timestamp") or ""),
            reverse=True,
        )

        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "users": {
                "total": user_count,
                "active": active_users,
                "inactive": inactive_users,
                "active_admins": admin_users,
            },
            "analyses": {
                "total": total_analyses,
                "risk_distribution": {
                    category: risks.get(category, 0)
                    for category in ("critical", "high", "medium", "low", "unknown")
                },
                "recent": recent[:10],
            },
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Admin overview query failed.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not retrieve admin analytics from Firestore.",
        ) from exc


@router.get("/users")
def list_admin_users(
    q: str | None = Query(default=None, max_length=200),
    role: Literal["user", "admin"] | None = None,
    is_active: bool | None = None,
    limit: int = Query(default=50, ge=1, le=100),
    _: dict = Depends(require_admin),
):
    """List real user profiles with optional filters."""
    _require_db()

    try:
        search = q.strip().lower() if q else None
        results = []

        for snapshot in db.collection("users").stream():
            data = snapshot.to_dict() or {}
            user_role = data.get("role", "user")
            active = data.get("is_active", True)

            if role is not None and user_role != role:
                continue

            if is_active is not None and active != is_active:
                continue

            searchable = " ".join([
                str(snapshot.id),
                str(data.get("username", "")),
                str(data.get("email", "")),
                str(data.get("full_name", "")),
            ]).lower()

            if search and search not in searchable:
                continue

            results.append({
                "id": snapshot.id,
                "username": data.get("username", ""),
                "email": data.get("email", ""),
                "full_name": data.get("full_name"),
                "avatar_url": data.get("avatar_url", ""),
                "role": user_role if user_role in {"user", "admin"} else "user",
                "is_active": active,
                "created_at": data.get("created_at"),
            })

        results.sort(
            key=lambda item: str(item.get("created_at") or ""),
            reverse=True,
        )

        total = len(results)

        return {
            "items": results[:limit],
            "total": total,
            "limit": limit,
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Admin user listing failed.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not retrieve user profiles.",
        ) from exc


@router.patch("/users/{uid}")
def update_admin_user(
    uid: str,
    payload: UserUpdate,
    admin: dict = Depends(require_admin),
):
    """Update a profile's role or active status."""
    _require_db()

    changes = payload.model_dump(exclude_unset=True)

    if not changes or all(value is None for value in changes.values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide a role or is_active value to update.",
        )

    # Prevent locking the current administrator out of the system.
    if uid == admin["uid"]:
        if changes.get("role") == "user" or changes.get("is_active") is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot demote or deactivate your own account.",
            )

    try:
        user_ref = db.collection("users").document(uid)
        snapshot = user_ref.get()

        if not snapshot.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found.",
            )

        current = snapshot.to_dict() or {}
        current_role = current.get("role", "user")
        current_active = current.get("is_active", True)

        would_remove_admin = (
            current_role == "admin"
            and current_active
            and (
                changes.get("role") == "user"
                or changes.get("is_active") is False
            )
        )

        if would_remove_admin and _active_admin_count() <= 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cannot remove or deactivate the last active administrator.",
            )

        changes["updated_at"] = datetime.now(timezone.utc).isoformat()
        user_ref.update(changes)

        updated = user_ref.get().to_dict() or {}

        return {
            "id": uid,
            "username": updated.get("username", ""),
            "email": updated.get("email", ""),
            "full_name": updated.get("full_name"),
            "role": updated.get("role", "user"),
            "is_active": updated.get("is_active", True),
            "updated_at": updated.get("updated_at"),
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Admin user update failed.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not update the user profile.",
        ) from exc


@router.get("/health")
def get_admin_health(
    _: dict = Depends(require_admin),
):
    """Check service reachability; this is not a CPU/RAM monitor."""
    _require_db()

    firestore_status = "unavailable"
    ml_status = "unavailable"

    try:
        # A real Firestore read, rather than just checking db != None.
        db.collection("users").limit(1).get()
        firestore_status = "ok"
    except Exception:
        logger.exception("Firestore health check failed.")

    try:
        response = httpx.get(
            f"{ML_SERVICE_URL}/health",
            timeout=3.0,
        )
        ml_status = "ok" if response.is_success else "unhealthy"
    except httpx.RequestError:
        ml_status = "unavailable"

    return {
        "api": "ok",
        "firestore": firestore_status,
        "ml_service": ml_status,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
