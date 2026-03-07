"""
Firestore client using the official firebase-admin SDK.

Why firebase-admin (not REST):
  The REST approach required google.auth to sign JWTs directly, which
  failed with 'invalid_grant: Invalid JWT Signature' when the private_key
  in FIREBASE_CREDENTIALS_JSON had double-escaped newlines (\\n) from
  HF Spaces env-var storage. The firebase-admin SDK handles credential
  refresh internally without surface-level JWT errors, and the
  _fix_private_key helper below corrects the newline escaping before the
  SDK ever touches the key.

Env vars required:
  FIREBASE_CREDENTIALS_JSON  – service account JSON string
  FIREBASE_PROJECT_ID        – e.g. "fir-config-d3c36"
"""
from __future__ import annotations

import json
import threading
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore as fb_firestore
import google.auth.exceptions

from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_db: Any = None
_enabled: bool = False


def _fix_private_key(d: dict) -> dict:
    """Unescape double-escaped newlines in private_key (common in HF Spaces env-var pastes)."""
    if "private_key" in d:
        d["private_key"] = d["private_key"].replace("\\\\n", "\\n").replace("\\n", "\n")
    return d


def _init_firebase_with_timeout():
    """Internal function to initialize Firebase with a timeout."""
    global _db, _enabled
    
    try:
        cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
        cred_dict = _fix_private_key(cred_dict)

        # Avoid re-initialising if already done (e.g. hot reload in dev)
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)

        _db = fb_firestore.client()
        _enabled = True
        project = settings.FIREBASE_PROJECT_ID or cred_dict.get("project_id", "")
        logger.info("Firebase + Firestore initialised", project=project)
    except Exception:
        _db = None
        _enabled = False


def init_firebase() -> None:
    """Initialise firebase-admin app and Firestore client. Non-fatal if misconfigured.
    
    Uses threading with a 5-second timeout to prevent hanging.
    """
    global _db, _enabled

    if not settings.FIREBASE_CREDENTIALS_JSON:
        # Silently disable if not configured
        _enabled = False
        return

    # Use threading for timeout instead of signal (more portable)
    init_thread = threading.Thread(target=_init_firebase_with_timeout, daemon=True)
    init_thread.start()
    init_thread.join(timeout=5.0)  # Wait max 5 seconds
    
    if init_thread.is_alive():
        # Timeout reached - thread still running
        _db = None
        _enabled = False
        logger.info("Firebase init timed out - disabled (non-critical)")


# ---- Public helpers --------------------------------------------------------

async def save_document(collection: str, doc_id: str, data: dict) -> bool:
    """Create or overwrite a Firestore document. Returns True on success."""
    if not _enabled or _db is None:
        return False
    try:
        _db.collection(collection).document(doc_id).set(data)
        return True
    except (google.auth.exceptions.RefreshError, Exception):
        # Silently fail - no logs, just return False
        return False


async def get_document(collection: str, doc_id: str) -> dict | None:
    """Fetch a single Firestore document. Returns None if not found or disabled."""
    if not _enabled or _db is None:
        return None
    try:
        doc = _db.collection(collection).document(doc_id).get()
        return doc.to_dict() if doc.exists else None
    except (google.auth.exceptions.RefreshError, Exception):
        # Silently fail - no logs, just return None
        return None


def get_db():
    """Legacy shim. Returns the Firestore client or None if disabled."""
    return _db if _enabled else None
