import os
import logging
import firebase_admin
from firebase_admin import credentials, firestore

from app.core.config import settings

logger = logging.getLogger(__name__)


def initialize_firebase():
    try:
        return firebase_admin.get_app()
    except ValueError:
        path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
        if path and os.path.exists(path):
            try:
                credential = credentials.Certificate(path)
                return firebase_admin.initialize_app(credential)
            except Exception as e:
                logger.warning("Could not initialize Firebase with '%s': %s", path, e)
                return None
        else:
            logger.warning(
                "Firebase service account file not found at '%s'. "
                "Set FIREBASE_SERVICE_ACCOUNT_PATH in backend/.env to connect to Firebase.",
                path,
            )
            return None


def get_firestore_client(app):
    if not app:
        return None
    try:
        return firestore.client(app=app)
    except Exception as e:
        logger.warning("Could not initialize Firestore client: %s", e)
        return None


firebase_app = initialize_firebase()
db = get_firestore_client(firebase_app)
