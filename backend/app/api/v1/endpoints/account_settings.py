import pyotp
from datetime import datetime, timezone
from typing import Any
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.firebase import db, firebase_app
from app.services.email_verification import (
    send_email_code,
    verify_email_code,
)

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


# -------------------------------------------------------------------
# Authentication and Firestore helpers
# -------------------------------------------------------------------

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


# -------------------------------------------------------------------
# Request models
# -------------------------------------------------------------------

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


class EmailCodeVerifyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str = Field(pattern=r"^\d{6}$")


# -------------------------------------------------------------------
# Preferences
# -------------------------------------------------------------------

def get_preferences_ref(uid: str):
    return (
        require_firestore()
        .collection("users")
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
        "timezone": saved.get(
            "timezone",
            DEFAULT_PREFERENCES["timezone"],
        ),
        "language": saved.get(
            "language",
            DEFAULT_PREFERENCES["language"],
        ),
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

    changes = updates.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide at least one preference to update",
        )

    current_snapshot = ref.get()
    current = (
        current_snapshot.to_dict()
        if current_snapshot.exists
        else {}
    )
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

    ref.set(saved, merge=True)

    return {
        "timezone": saved.get(
            "timezone",
            DEFAULT_PREFERENCES["timezone"],
        ),
        "language": saved.get(
            "language",
            DEFAULT_PREFERENCES["language"],
        ),
        "notifications": {
            **DEFAULT_PREFERENCES["notifications"],
            **(saved.get("notifications") or {}),
        },
        "updated_at": saved["updated_at"],
    }


# -------------------------------------------------------------------
# Connected accounts
# -------------------------------------------------------------------

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


# -------------------------------------------------------------------
# Security status
# -------------------------------------------------------------------

def get_security_settings_ref(uid: str):
    return (
        require_firestore()
        .collection("users")
        .document(uid)
        .collection("settings")
        .document("security")
    )


@router.get("/security")
def get_security_status(token: dict = Depends(verify_user)):
    uid = token["uid"]
    firebase_user = firebase_user_or_503(uid)

    multi_factor = getattr(firebase_user, "multi_factor", None)
    enrolled_factors = (
        getattr(multi_factor, "enrolled_factors", None) or []
    )

    security_ref = get_security_settings_ref(uid)
    security_snapshot = security_ref.get()
    security_settings = (
        security_snapshot.to_dict()
        if security_snapshot.exists
        else {}
    )
    security_settings = security_settings or {}

    return {
        "email": firebase_user.email,
        "email_verified": firebase_user.email_verified,
        "created_at": firebase_user.user_metadata.creation_timestamp,
        "last_sign_in_at": (
            firebase_user.user_metadata.last_sign_in_timestamp
        ),
        "providers": provider_response(firebase_user),

        # TOTP 2FA status (In-app RFC 6238 or Firebase MFA)
        "two_factor_enabled": bool(security_settings.get("totp_enabled", False)) or len(enrolled_factors) > 0,
        "two_factor_supported_by_app": True,
        "app_totp_enabled": bool(security_settings.get("totp_enabled", False)),

        # Separate application email-verification setting.
        "email_verification_enabled": security_settings.get(
            "email_verification_enabled",
            False,
        ),
        "email_verification_enabled_at": security_settings.get(
            "email_verification_enabled_at",
        ),

        "session_management_available": False,
        "password_reset": "firebase_email_flow",
    }


# -------------------------------------------------------------------
# Email-code verification setting
# -------------------------------------------------------------------

@router.post("/security/email-code/send")
def send_security_email_code(
    token: dict = Depends(verify_user),
):
    uid = token["uid"]
    firebase_user = firebase_user_or_503(uid)

    if not firebase_user.email or not firebase_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Verify your email address before enabling "
                "this security setting."
            ),
        )

    security_ref = get_security_settings_ref(uid)
    snapshot = security_ref.get()
    saved = snapshot.to_dict() if snapshot.exists else {}
    saved = saved or {}

    if saved.get("email_verification_enabled", False):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email verification is already enabled.",
        )

    send_email_code(uid, firebase_user.email)

    return {
        "message": (
            "Verification code sent to your verified email address."
        ),
    }


@router.post("/security/email-code/verify")
def verify_security_email_code(
    payload: EmailCodeVerifyRequest,
    token: dict = Depends(verify_user),
):
    uid = token["uid"]
    firebase_user = firebase_user_or_503(uid)

    if not firebase_user.email or not firebase_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A verified email address is required.",
        )

    # Validate the code before enabling the setting.
    verify_email_code(uid, payload.code)

    security_ref = get_security_settings_ref(uid)
    enabled_at = datetime.now(timezone.utc).isoformat()

    security_ref.set(
        {
            "email_verification_enabled": True,
            "email_verification_enabled_at": enabled_at,
        },
        merge=True,
    )

    return {
        "email_verification_enabled": True,
        "email_verification_enabled_at": enabled_at,
        "message": "Email verification setting enabled successfully.",
    }


@router.post("/security/email-code/disable")
def disable_security_email_verification(
    token: dict = Depends(verify_user),
):
    uid = token["uid"]
    security_ref = get_security_settings_ref(uid)
    snapshot = security_ref.get()
    saved = snapshot.to_dict() if snapshot.exists else {}
    saved = saved or {}

    if not saved.get("email_verification_enabled", False):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email verification is already disabled.",
        )

    security_ref.set(
        {
            "email_verification_enabled": False,
            "email_verification_enabled_at": None,
            "email_verification_disabled_at": (
                datetime.now(timezone.utc).isoformat()
            ),
        },
        merge=True,
    )

    return {
        "email_verification_enabled": False,
        "message": "Email verification setting disabled.",
    }


# -------------------------------------------------------------------
# In-App RFC 6238 TOTP Two-Factor Authentication
# -------------------------------------------------------------------

class TotpSetupResponse(BaseModel):
    secret: str
    qr_code_url: str
    account_name: str
    issuer: str


class TotpVerifyRequest(BaseModel):
    code: str


@router.post("/security/totp/setup", response_model=TotpSetupResponse)
def setup_totp(token: dict = Depends(verify_user)):
    uid = token["uid"]
    email = token.get("email", "")
    secret = pyotp.random_base32()
    issuer = "BugPulse AI"
    account_name = email or uid
    totp = pyotp.TOTP(secret)
    qr_code_url = totp.provisioning_uri(name=account_name, issuer_name=issuer)

    security_ref = get_security_settings_ref(uid)
    security_ref.set(
        {
            "pending_totp_secret": secret,
            "pending_totp_created_at": datetime.now(timezone.utc).isoformat(),
        },
        merge=True,
    )

    return {
        "secret": secret,
        "qr_code_url": qr_code_url,
        "account_name": account_name,
        "issuer": issuer,
    }


@router.post("/security/totp/verify")
def verify_totp(
    payload: TotpVerifyRequest,
    token: dict = Depends(verify_user),
):
    uid = token["uid"]
    code = payload.code.strip().replace(" ", "")

    if not code.isdigit() or len(code) != 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter a valid 6-digit code from your authenticator app.",
        )

    security_ref = get_security_settings_ref(uid)
    snapshot = security_ref.get()
    data = snapshot.to_dict() if snapshot.exists else {}
    pending_secret = data.get("pending_totp_secret") or data.get("totp_secret")

    if not pending_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No TOTP setup in progress. Please click 'Set up authenticator' again.",
        )

    totp = pyotp.TOTP(pending_secret)
    if not totp.verify(code, valid_window=1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Check your authenticator app clock and try again.",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    security_ref.set(
        {
            "totp_enabled": True,
            "totp_secret": pending_secret,
            "pending_totp_secret": None,
            "totp_enabled_at": now_iso,
        },
        merge=True,
    )

    # Also sync onto user doc
    fs = require_firestore()
    fs.collection("users").document(uid).set(
        {"two_factor_enabled": True},
        merge=True,
    )

    return {
        "success": True,
        "message": "Two-factor authentication successfully enabled.",
        "two_factor_enabled": True,
    }


@router.delete("/security/totp")
def disable_totp(token: dict = Depends(verify_user)):
    uid = token["uid"]
    security_ref = get_security_settings_ref(uid)
    now_iso = datetime.now(timezone.utc).isoformat()

    security_ref.set(
        {
            "totp_enabled": False,
            "totp_secret": None,
            "pending_totp_secret": None,
            "totp_disabled_at": now_iso,
        },
        merge=True,
    )

    fs = require_firestore()
    fs.collection("users").document(uid).set(
        {"two_factor_enabled": False},
        merge=True,
    )

    return {
        "success": True,
        "message": "Two-factor authentication has been disabled.",
        "two_factor_enabled": False,
    }
