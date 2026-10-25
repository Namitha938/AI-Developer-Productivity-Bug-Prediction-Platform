
import secrets
from cryptography.fernet import Fernet, InvalidToken
from fastapi import HTTPException, status

from app.core.config import settings


def get_token_cipher() -> Fernet:
    key = settings.GITHUB_TOKEN_ENCRYPTION_KEY.strip()

    if not key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub token encryption is not configured.",
        )

    try:
        return Fernet(key.encode("utf-8"))
    except (ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub token encryption key is invalid.",
        ) from exc


def encrypt_github_token(token: str) -> str:
    if not token:
        raise ValueError("GitHub access token cannot be empty.")

    return get_token_cipher().encrypt(token.encode("utf-8")).decode("utf-8")


def decrypt_github_token(encrypted_token: str) -> str:
    try:
        return get_token_cipher().decrypt(
            encrypted_token.encode("utf-8")
        ).decode("utf-8")
    except (InvalidToken, UnicodeDecodeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to decrypt the stored GitHub token.",
        ) from exc


def create_oauth_state() -> str:
    return secrets.token_urlsafe(32)
