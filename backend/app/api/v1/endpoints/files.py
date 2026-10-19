
from uuid import uuid4

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from app.core.config import settings
from app.core.firebase import db, firebase_app


router = APIRouter(prefix="/files", tags=["Files"])
bearer_scheme = HTTPBearer()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def get_authenticated_uid(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    try:
        token = auth.verify_id_token(
            credentials.credentials,
            app=firebase_app,
        )
        uid = token.get("uid")
        if not uid:
            raise ValueError("Missing UID")
        return uid
    except Exception as exc:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase ID token",
        ) from exc


def configure_cloudinary():
    if not all([
        settings.CLOUDINARY_CLOUD_NAME,
        settings.CLOUDINARY_API_KEY,
        settings.CLOUDINARY_API_SECRET,
    ]):
        raise HTTPException(
            status_code=503,
            detail="Cloudinary is not configured",
        )

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    uid: str = Depends(get_authenticated_uid),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    contents = await file.read(MAX_FILE_SIZE + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="File is empty")

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Maximum file size is 10 MB",
        )

    configure_cloudinary()

    asset_id = str(uuid4())

    try:
        result = cloudinary.uploader.upload(
            contents,
            resource_type="auto",
            folder=f"bugpulse/{uid}",
            public_id=asset_id,
            overwrite=False,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="File upload failed",
        ) from exc
    finally:
        await file.close()

    metadata = {
        "id": asset_id,
        "owner_uid": uid,
        "filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("bytes", len(contents)),
        "resource_type": result.get("resource_type"),
        "format": result.get("format"),
        "cloudinary_public_id": result.get("public_id"),
        "url": result.get("secure_url"),
        "created_at": result.get("created_at"),
    }

    db.collection("users").document(uid).collection("files").document(
        asset_id
    ).set(metadata)

    return metadata
