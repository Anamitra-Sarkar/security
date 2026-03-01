"""
Firebase Admin SDK initialisation and Firestore client.

Priority for credentials (in order):
  1. FIREBASE_CREDENTIALS_JSON env var  – JSON string of the service account
     (paste the whole file contents as a single escaped string in Render/CI)
  2. GOOGLE_APPLICATION_CREDENTIALS env var – path to the JSON file on disk
     (recommended for local development)

Call `get_db()` anywhere to obtain the Firestore async client.
"""
import json
import os

import firebase_admin
from firebase_admin import credentials, firestore

from backend.app.core.config import settings

_app: firebase_admin.App | None = None
_db = None


def init_firebase() -> None:
    """Initialise the Firebase Admin SDK (idempotent)."""
    global _app, _db
    if _app is not None:
        return

    if settings.FIREBASE_CREDENTIALS_JSON:
        # Credentials supplied as a JSON string (production / Render)
        cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
        cred = credentials.Certificate(cred_dict)
    elif os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        # Path to JSON file on disk (local dev)
        cred = credentials.ApplicationDefault()
    else:
        raise RuntimeError(
            "Firebase credentials not configured. "
            "Set FIREBASE_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS."
        )

    _app = firebase_admin.initialize_app(
        cred,
        {"projectId": settings.FIREBASE_PROJECT_ID},
    )
    _db = firestore.client()


def get_db():
    """Return the Firestore client. Call init_firebase() first."""
    if _db is None:
        raise RuntimeError("Firestore not initialised. Call init_firebase() on startup.")
    return _db
