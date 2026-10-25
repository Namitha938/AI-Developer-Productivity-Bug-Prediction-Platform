
from datetime import datetime, timezone
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.firebase import db, firebase_app

router = APIRouter(prefix="/account", tags=["Account Settings"])
bearer_scheme = HTTPBearer()

DEFAULT_PREFERENCES = {
    "timezone": "Asia/Kolkata",
    "language": "English (US)",
    "notifications": {
        "email": True,
        "in_app": True,
        "security_alerts": True,
        "weekly_report": False,
    },
}

ALLOWED_LANGUAGES = {
    "English (US)",
    "English (UK)",
    "German",
    "French",
}


def verify_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict[str, Any]:
    try:
        token = auth.verify_id_token(
            credentials.credentials,
            app=firebase_app,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    uid = token.get("uid")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase identity",
        )

    return token


def require_firestore():
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firestore is not configured",
        )
    return db


class NotificationPreferences(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: bool = True
    in_app: bool = True
    security_alerts: bool = True
    weekly_report: bool = False


class NotificationPreferencesUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: bool | None = None
    in_app: bool | None = None
    security_alerts: bool | None = None
    weekly_report: bool | None = None


class PreferencesUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    timezone: str | None = Field(default=None, min_length=1, max_length=100)
    language: str | None = Field(default=None, min_length=1, max_length=30)
    notifications: NotificationPreferencesUpdate | None = None

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str | None) -> str | None:
        if value is None:
            return value

        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError) as exc:
            raise ValueError(
                "Use a valid IANA timezone, such as Asia/Kolkata"
            ) from exc

        return value

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str | None) -> str | None:
        if value is not None and value not in ALLOWED_LANGUAGES:
            raise ValueError("Unsupported language")

        return value


def get_preferences_ref(uid: str):
    firestore = require_firestore()
    return (
        firestore.collection("users")
        .document(uid)
        .collection("settings")
        .document("preferences")
    )


@router.get("/preferences")
def get_preferences(token: dict = Depends(verify_user)):
    uid = token["uid"]
    snapshot = get_preferences_ref(uid).get()

    saved = snapshot.to_dict() if snapshot.exists else {}
    saved = saved or {}

    notifications = {
        **DEFAULT_PREFERENCES["notifications"],
        **(saved.get("notifications") or {}),
    }

    return {
        "timezone": saved.get("timezone", DEFAULT_PREFERENCES["timezone"]),
        "language": saved.get("language", DEFAULT_PREFERENCES["language"]),
        "notifications": notifications,
        "updated_at": saved.get("updated_at"),
    }


@router.patch("/preferences")
def update_preferences(
    updates: PreferencesUpdate,
    token: dict = Depends(verify_user),
):
    uid = token["uid"]
    ref = get_preferences_ref(uid)

    changes = updates.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least one preference to update",
        )

    current_snapshot = ref.get()
    current = current_snapshot.to_dict() if current_snapshot.exists else {}
    current = current or {}

    if "notifications" in changes:
        changes["notifications"] = {
            **DEFAULT_PREFERENCES["notifications"],
            **(current.get("notifications") or {}),
            **changes["notifications"],
        }

    saved = {
        **current,
        **changes,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    # Merge prevents a timezone update from deleting notification settings.
    ref.set(saved, merge=True)

    return {
        "timezone": saved.get("timezone", DEFAULT_PREFERENCES["timezone"]),
        "language": saved.get("language", DEFAULT_PREFERENCES["language"]),
        "notifications": {
            **DEFAULT_PREFERENCES["notifications"],
            **(saved.get("notifications") or {}),
        },
        "updated_at": saved["updated_at"],
    }


def firebase_user_or_503(uid: str):
    if firebase_app is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firebase Admin is not configured",
        )

    try:
        return auth.get_user(uid, app=firebase_app)
    except auth.UserNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Firebase user was not found",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not retrieve Firebase account information",
        ) from exc


def provider_response(firebase_user):
    providers = []

    for provider in firebase_user.provider_data:
        providers.append(
            {
                "provider_id": provider.provider_id,
                "email": provider.email,
                "uid": provider.uid,
                "display_name": provider.display_name,
                "photo_url": provider.photo_url,
            }
        )

    return providers


@router.get("/connected-accounts")
def get_connected_accounts(token: dict = Depends(verify_user)):
    firebase_user = firebase_user_or_503(token["uid"])

    return {
        "providers": provider_response(firebase_user),
        "email": firebase_user.email,
        "email_verified": firebase_user.email_verified,
    }


@router.get("/security")
def get_security_status(token: dict = Depends(verify_user)):
    firebase_user = firebase_user_or_503(token["uid"])

    multi_factor = getattr(firebase_user, "multi_factor", None)
    enrolled_factors = getattr(multi_factor, "enrolled_factors", None) or []

    return {
        "email": firebase_user.email,
        "email_verified": firebase_user.email_verified,
        "created_at": firebase_user.user_metadata.creation_timestamp,
        "last_sign_in_at": firebase_user.user_metadata.last_sign_in_timestamp,
        "providers": provider_response(firebase_user),
        "two_factor_enabled": len(enrolled_factors) > 0,
        "two_factor_supported_by_app": False,
        "session_management_available": False,
        "password_reset": "firebase_email_flow",
    }
