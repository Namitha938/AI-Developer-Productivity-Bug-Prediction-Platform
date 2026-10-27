
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "BugPulse AI API"
    APP_ENV: str = "development"
    FRONTEND_URL: str = "http://localhost:5173"

    FIREBASE_SERVICE_ACCOUNT_PATH: str = "secrets/firebase-service-account.json"

    # Cloudinary is used for file uploads, not database storage.
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-5-mini"

    # GitHub OAuth
    GITHUB_CLIENT_ID: str = ""
    GITHUB_CLIENT_SECRET: str = ""
    GITHUB_CALLBACK_URL: str = "http://localhost:5173/github/callback"

    # Encryption key for GitHub access tokens stored in Firestore
    GITHUB_TOKEN_ENCRYPTION_KEY: str = ""
    SMTP_HOST: str = "smtp-relay.brevo.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    MAIL_FROM: str = ""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        
    )


settings = Settings()
