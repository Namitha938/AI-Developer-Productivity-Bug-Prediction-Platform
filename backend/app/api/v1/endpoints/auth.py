import pyotp
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from pydantic import BaseModel
from app.core.firebase import firebase_app, db
from app.models.user import (
    create_user_if_missing,
    get_user,
    user_to_response,
)
from app.schemas.auth import UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])
bearer_scheme = HTTPBearer()


def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials,
) -> dict:
    try:
        return auth.verify_id_token(
            credentials.credentials,
            app=firebase_app,
        )
    except Exception as exc:
        logger.error("Firebase token verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase ID token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/session", response_model=UserResponse)
def create_firebase_session(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = verify_firebase_token(credentials)

    uid = token.get("uid")
    email = token.get("email")

    if not uid or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase account must have a UID and email",
        )

    try:
        data = create_user_if_missing(
            uid=uid,
            email=email,
            full_name=token.get("name"),
            avatar_url=token.get("picture", ""),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc

    return user_to_response(uid, data)


@router.get("/me", response_model=UserResponse)
def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = verify_firebase_token(credentials)
    uid = token.get("uid")

    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase identity",
        )

    data = get_user(uid)

    if not data or not data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User profile not found; create a Firebase session first",
        )

    return user_to_response(uid, data)


class Verify2FARequest(BaseModel):
    code: str


@router.post("/verify-2fa")
def verify_2fa_login(
    payload: Verify2FARequest,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = verify_firebase_token(credentials)
    uid = token.get("uid")

    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase identity",
        )

    code = payload.code.strip().replace(" ", "")
    if not code.isdigit() or len(code) != 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter a valid 6-digit verification code.",
        )

    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        )

    sec_doc = db.collection("users").document(uid).collection("settings").document("security").get()
    sec_data = sec_doc.to_dict() if sec_doc.exists else {}
    secret = sec_data.get("totp_secret")

    if not secret:
        # If user does not have in-app TOTP enabled, verify succeeds
        return {"success": True, "verified": True}

    totp = pyotp.TOTP(secret)
    if not totp.verify(code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid two-factor authentication code. Please check your authenticator app and try again.",
        )

    return {"success": True, "verified": True}
