
from datetime import datetime, timezone
from typing import Any

from google.api_core.exceptions import AlreadyExists

from app.core.firebase import db


USERS_COLLECTION = "users"
DEFAULT_ROLE = "user"
VALID_ROLES = {"user", "admin"}


def user_to_response(uid: str, data: dict[str, Any]) -> dict[str, Any]:
    role = data.get("role", "user")

    if role not in {"user", "admin"}:
        role = "user"

    return {
        "id": uid,
        "username": data.get("username", ""),
        "email": data.get("email", ""),
        "full_name": data.get("full_name"),
        "is_active": data.get("is_active", True),
        "avatar_url": data.get("avatar_url", ""),
        "created_at": data.get("created_at"),
        "role": role,
    }

def get_user(uid: str) -> dict[str, Any] | None:
    snapshot = db.collection(USERS_COLLECTION).document(uid).get()
    return snapshot.to_dict() if snapshot.exists else None


def create_user_if_missing(
    uid: str,
    email: str,
    full_name: str | None = None,
    avatar_url: str = "",
) -> dict[str, Any]:
    email = email.strip().lower()
    user_ref = db.collection(USERS_COLLECTION).document(uid)

    snapshot = user_ref.get()
    if snapshot.exists:
        data = snapshot.to_dict() or {}

        if data.get("email", "").strip().lower() != email:
            raise ValueError(
                "The Firebase account email does not match its profile."
            )

        # Preserve an explicitly assigned role; don't promote existing users.
        return data

    matches = (
        db.collection(USERS_COLLECTION)
        .where("email", "==", email)
        .limit(1)
        .stream()
    )
    if any(match.id != uid for match in matches):
        raise ValueError(
            "This email already belongs to another user profile. "
            "Resolve account linking before continuing."
        )

    username = email.split("@")[0][:50] or f"user_{uid[:8]}"
    now = datetime.now(timezone.utc).isoformat()

    data = {
        "username": username,
        "email": email,
        "full_name": full_name or username,
        "avatar_url": avatar_url,
        "is_active": True,
        "role": DEFAULT_ROLE,
        "created_at": now,
        "updated_at": now,
    }

    try:
        user_ref.create(data)
        return data
    except AlreadyExists:
        latest = user_ref.get()
        existing = latest.to_dict() or {}

        if existing.get("email", "").strip().lower() != email:
            raise ValueError(
                "The Firebase account email does not match its profile."
            )

        return existing
