
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth

from app.core.firebase import firebase_app
from app.models.user import (
    create_user_if_missing,
    get_user,
    user_to_response,
)
from app.schemas.auth import UserResponse


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
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
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
