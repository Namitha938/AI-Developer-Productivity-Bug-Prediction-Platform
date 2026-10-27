import base64
import logging
from uuid import uuid4
import cloudinary
import cloudinary.uploader
from fastapi import File, UploadFile
from app.core.config import settings

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from pydantic import BaseModel, ConfigDict, Field

from app.core.firebase import db, firebase_app

router = APIRouter(prefix="/profile", tags=["Profile"])
bearer_scheme = HTTPBearer()
logger = logging.getLogger(__name__)

PROFILE_FIELDS = {
    "full_name",
    "title",
    "company",
    "location",
    "bio",
    "timezone",
    "language",
    "social_links",
    "avatar_url",
}


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    full_name: str | None = Field(default=None, max_length=100)
    title: str | None = Field(default=None, max_length=100)
    company: str | None = Field(default=None, max_length=150)
    location: str | None = Field(default=None, max_length=150)
    bio: str | None = Field(default=None, max_length=1000)
    timezone: str | None = Field(default=None, max_length=100)
    language: str | None = Field(default=None, max_length=50)
    social_links: dict[str, str] | None = None
    avatar_url: str | None = None


def get_authenticated_uid(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    try:
        decoded = auth.verify_id_token(
            credentials.credentials,
            app=firebase_app,
        )
        uid = decoded.get("uid")

        if not uid:
            raise ValueError("Missing Firebase UID")

        return uid
    except Exception as exc:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase ID token",
        ) from exc


def get_profile_document(uid: str):
    if db is None:
        raise HTTPException(
            status_code=503,
            detail="Firestore is not available. Check Firebase configuration.",
        )

    user_ref = db.collection("users").document(uid)
    snapshot = user_ref.get()

    if not snapshot.exists:
        try:
            fb_user = auth.get_user(uid, app=firebase_app)
            new_data = {
                "email": fb_user.email or "",
                "full_name": fb_user.display_name or (fb_user.email.split("@")[0] if fb_user.email else "Developer"),
                "username": (fb_user.email.split("@")[0] if fb_user.email else "user"),
                "avatar_url": fb_user.photo_url or "",
                "title": "Developer",
                "is_active": True,
                "role": "user",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            user_ref.set(new_data)
            return user_ref, new_data
        except Exception:
            raise HTTPException(
                status_code=404,
                detail="User profile not found. Sign in again to initialize your profile.",
            )

    return user_ref, snapshot.to_dict() or {}


def profile_response(uid: str, data: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": uid,
        "username": data.get("username", ""),
        "email": data.get("email", ""),
        "full_name": data.get("full_name", ""),
        "avatar_url": data.get("avatar_url", ""),
        "title": data.get("title", "Developer"),
        "company": data.get("company", ""),
        "location": data.get("location", ""),
        "bio": data.get("bio", ""),
        "timezone": data.get("timezone", "UTC"),
        "language": data.get("language", "English"),
        "social_links": data.get("social_links", {}),
        "is_active": data.get("is_active", True),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }


@router.get("")
def get_profile(uid: str = Depends(get_authenticated_uid)):
    _, data = get_profile_document(uid)

    if not data.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is inactive")

    return profile_response(uid, data)


@router.patch("")
def update_profile(
    updates: ProfileUpdate,
    uid: str = Depends(get_authenticated_uid),
):
    user_ref, data = get_profile_document(uid)

    if not data.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is inactive")

    changes = updates.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one profile field to update",
        )

    for field, value in changes.items():
        if isinstance(value, str):
            value = value.strip()

            if field == "full_name" and not value:
                raise HTTPException(
                    status_code=422,
                    detail="Full name cannot be empty",
                )

        if field == "social_links" and value is not None:
            allowed_links = {"github", "linkedin", "twitter", "website", "stackoverflow"}

            if set(value.keys()) - allowed_links:
                raise HTTPException(
                    status_code=422,
                    detail="Unsupported social link field",
                )

        changes[field] = value

    changes["updated_at"] = datetime.now(timezone.utc).isoformat()
    user_ref.update(changes)

    updated = user_ref.get().to_dict() or {}
    return profile_response(uid, updated)


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    uid: str = Depends(get_authenticated_uid),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    contents = await file.read(5 * 1024 * 1024 + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Avatar image must be under 5 MB")

    avatar_url = None

    # Try Cloudinary if credentials are configured
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
        try:
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
                secure=True,
            )
            result = cloudinary.uploader.upload(
                contents,
                folder=f"bugpulse/avatars/{uid}",
                public_id=f"avatar_{uuid4().hex[:8]}",
                transformation=[
                    {"width": 400, "height": 400, "crop": "fill", "gravity": "face"}
                ],
                resource_type="image",
            )
            avatar_url = result.get("secure_url")
        except Exception as exc:
            logger.warning("Cloudinary upload failed, falling back to data URL: %s", exc)

    # Robust fallback: data URL so avatar upload always works even without external storage
    if not avatar_url:
        content_type = file.content_type or "image/png"
        b64_str = base64.b64encode(contents).decode("utf-8")
        avatar_url = f"data:{content_type};base64,{b64_str}"

    user_ref, data = get_profile_document(uid)
    now_iso = datetime.now(timezone.utc).isoformat()
    user_ref.update({"avatar_url": avatar_url, "updated_at": now_iso})

    return {
        "avatar_url": avatar_url,
        "message": "Avatar uploaded successfully",
    }


@router.delete("/avatar")
def delete_avatar(uid: str = Depends(get_authenticated_uid)):
    user_ref, data = get_profile_document(uid)
    now_iso = datetime.now(timezone.utc).isoformat()
    user_ref.update({"avatar_url": "", "updated_at": now_iso})

    return {"message": "Avatar removed successfully"}
