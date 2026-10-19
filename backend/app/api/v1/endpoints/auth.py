
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.firebase import firebase_app
from app.models.user import User
from app.schemas.auth import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])
bearer_scheme = HTTPBearer()


@router.post("/session", response_model=UserResponse)
def create_firebase_session(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    try:
        token = auth.verify_id_token(
            credentials.credentials,
            app=firebase_app,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    firebase_uid = token.get("uid")
    email = token.get("email")

    if not firebase_uid or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Firebase account must have a UID and email",
        )

    email = email.strip().lower()


    user = db.scalar(
        select(User).where(User.firebase_uid == firebase_uid)
    )

    if user is None:
        existing_user = db.scalar(
            select(User).where(User.email == email)
        )

        if existing_user is not None:
            if not token.get("email_verified", False):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=(
                        "An account with this email already exists. "
                        "Verify the email in Firebase before linking accounts."
                    ),
                )

            if existing_user.firebase_uid:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This email is already linked to another Firebase account",
                )

            existing_user.firebase_uid = firebase_uid
            user = existing_user

        else:
            base_username = email.split("@")[0][:40] or "user"
            username = base_username

            username_exists = db.scalar(
                select(User.id).where(User.username == username)
            )

            if username_exists is not None:
                username = f"{base_username}_{firebase_uid[:8]}"

            user = User(
                username=username,
                email=email,
                full_name=token.get("name") or base_username,
                firebase_uid=firebase_uid,
                # Firebase manages the password; this field is not used
                # for authentication.
                hashed_password="",
            )
            db.add(user)

    else:
        # Keep the profile email in sync with the verified token identity.
        user.email = email

    try:
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise

    return user


@router.get("/me", response_model=UserResponse)
def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
):
    try:
        token = auth.verify_id_token(
            credentials.credentials,
            app=firebase_app,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    firebase_uid = token.get("uid")

    if not firebase_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase identity",
        )

    user = db.scalar(
        select(User).where(User.firebase_uid == firebase_uid)
    )

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User profile not found; create a Firebase session first",
        )

    return user
