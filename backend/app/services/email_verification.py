
import hashlib
import secrets
import time
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status

from app.core.firebase import db
from app.services.email_service import send_verification_code


CODE_TTL_SECONDS = 600
RESEND_COOLDOWN_SECONDS = 30
MAX_VERIFY_ATTEMPTS = 10
MAX_SENDS_PER_HOUR = 10


def _verification_ref(uid: str):
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firestore is not configured",
        )

    return (
        db.collection("users")
        .document(uid)
        .collection("security")
        .document("email_verification")
    )


def _hash_code(uid: str, code: str, salt: str) -> str:
    return hashlib.sha256(
        f"{uid}:{salt}:{code}".encode("utf-8")
    ).hexdigest()


def send_email_code(uid: str, email: str) -> None:
    ref = _verification_ref(uid)
    now = int(time.time())
    snapshot = ref.get()
    data = snapshot.to_dict() or {} if snapshot.exists else {}

    last_sent = int(data.get("last_sent_at", 0))
    if now - last_sent < RESEND_COOLDOWN_SECONDS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait before requesting another code.",
        )

    send_history = [
        int(timestamp)
        for timestamp in data.get("send_history", [])
        if now - int(timestamp) < 3600
    ]

    if len(send_history) >= MAX_SENDS_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many codes requested. Try again later.",
        )

    code = f"{secrets.randbelow(1_000_000):06d}"
    salt = secrets.token_hex(16)
    expires_at = now + CODE_TTL_SECONDS

    # Persist the challenge before sending so failed delivery can be retried
    # after the cooldown. Never persist the plaintext code.
    ref.set(
        {
            "code_hash": _hash_code(uid, code, salt),
            "salt": salt,
            "expires_at": expires_at,
            "attempts": 0,
            "last_sent_at": now,
            "send_history": [*send_history, now],
            "used": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
        merge=True,
    )

    try:
        send_verification_code(email, code)
    except RuntimeError as exc:
        # Invalidate the challenge when delivery fails.
        ref.set(
            {"used": True, "code_hash": "", "salt": ""},
            merge=True,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not send the verification email. Try again later.",
        ) from exc


def verify_email_code(uid: str, code: str) -> None:
    ref = _verification_ref(uid)
    snapshot = ref.get()

    if not snapshot.exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request a verification code first.",
        )

    data = snapshot.to_dict() or {}
    now = int(time.time())

    if data.get("used") or now > int(data.get("expires_at", 0)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The verification code has expired. Request a new one.",
        )

    attempts = int(data.get("attempts", 0))
    if attempts >= MAX_VERIFY_ATTEMPTS:
        ref.set({"used": True}, merge=True)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many incorrect attempts. Request a new code.",
        )

    # Increment before comparing, so incorrect attempts are counted.
    ref.set({"attempts": attempts + 1}, merge=True)

    salt = str(data.get("salt", ""))
    expected_hash = str(data.get("code_hash", ""))
    actual_hash = _hash_code(uid, code, salt)

    if not secrets.compare_digest(actual_hash, expected_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code.",
        )

    ref.set(
        {
            "used": True,
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "code_hash": "",
            "salt": "",
        },
        merge=True,
    )
