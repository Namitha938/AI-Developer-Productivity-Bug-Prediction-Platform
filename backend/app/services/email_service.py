
import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_verification_code(recipient: str, code: str) -> None:
    """Send a short-lived BugPulse AI email verification code."""

    required_settings = {
        "SMTP_USER": settings.SMTP_USER,
        "SMTP_PASSWORD": settings.SMTP_PASSWORD,
        "MAIL_FROM": settings.MAIL_FROM,
    }

    missing = [
        name for name, value in required_settings.items()
        if not value or not value.strip()
    ]

    if missing:
        raise RuntimeError(
            "Email delivery is not configured. Missing: "
            + ", ".join(missing)
        )

    message = EmailMessage()
    message["Subject"] = "Your BugPulse AI verification code"
    message["From"] = settings.MAIL_FROM
    message["To"] = recipient
    message.set_content(
        f"""Hello,

Your BugPulse AI email verification code is: {code}

This code expires in 10 minutes. If you did not request it,
you can safely ignore this email.

Never share this code with anyone.

— BugPulse AI Security
"""
    )

    try:
        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
            timeout=15,
        ) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.ehlo()
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    
    except (OSError, smtplib.SMTPException) as exc:
        print(
            f"SMTP diagnostic: {type(exc).__name__}: {exc}",
            flush=True,
        )
        raise RuntimeError(
            "Could not send the verification email."
        ) from exc

