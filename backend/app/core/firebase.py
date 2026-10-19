import firebase_admin
from firebase_admin import credentials

from app.core.config import settings


def initialize_firebase():
    try:
        return firebase_admin.get_app()
    except ValueError:
        credential = credentials.Certificate(
            settings.FIREBASE_SERVICE_ACCOUNT_PATH
        )
        return firebase_admin.initialize_app(credential)


firebase_app = initialize_firebase()
