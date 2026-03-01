"""
Firebase Admin SDK initialisation and Firestore client.

Fixes:
  - Handles escaped newlines in private_key when FIREBASE_CREDENTIALS_JSON
    is pasted as a single-line string (\\n must become \n for JWT signing).

Priority for credentials:
  1. FIREBASE_CREDENTIALS_JSON env var (JSON string, production)
  2. GOOGLE_APPLICATION_CREDENTIALS env var (path to file, local dev)
"""
import json
import os

import firebase_admin
from firebase_admin import credentials, firestore

from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_app: firebase_admin.App | None = None
_db = None


def _fix_private_key(cred_dict: dict) -> dict:
    """
    When a service account JSON is pasted as a single-line env var, the
    private_key newlines get double-escaped as \\n instead of \n.
    This causes 'Invalid JWT Signature' errors at runtime.
    Fix: replace literal \\n with real newline in private_key only.
    """
    if "private_key" in cred_dict:
        cred_dict["private_key"] = cred_dict["private_key"].replace("\\n", "\n")
    return cred_dict


def init_firebase() -> None:
    """Initialise the Firebase Admin SDK (idempotent)."""
    global _app, _db
    if _app is not None:
        return

    if settings.FIREBASE_CREDENTIALS_JSON:
        cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
        cred_dict = _fix_private_key(cred_dict)
        cred = credentials.Certificate(cred_dict)
    elif os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
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
    logger.info("Firebase Admin SDK initialised", project=settings.FIREBASE_PROJECT_ID)


def get_db():
    if _db is None:
        raise RuntimeError("Firestore not initialised. Call init_firebase() on startup.")
    return _db
