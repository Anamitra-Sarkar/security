"""
Firestore client using the Firestore REST API over plain HTTPS.

Why REST instead of firebase-admin + gRPC:
  The firebase-admin SDK uses gRPC for Firestore. When FIREBASE_CREDENTIALS_JSON
  is stored as an env-var in HF Spaces, the private_key newlines are double-escaped
  (\\n instead of \n), causing 'invalid_grant: Invalid JWT Signature' errors that
  fire in a tight background loop and spam the logs. The REST approach uses
  google-auth (already installed) directly over HTTPS — no gRPC, no background
  token-refresh loop, and the newline fix is applied once at startup.

Env vars required:
  FIREBASE_CREDENTIALS_JSON  – service account JSON string
  FIREBASE_PROJECT_ID        – e.g. "fir-config-d3c36"
"""
from __future__ import annotations

import json
import httpx
from typing import Any

import google.oauth2.service_account as sa
import google.auth.transport.requests as ga_requests

from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_SCOPES = ["https://www.googleapis.com/auth/datastore"]
_FIRESTORE_BASE = "https://firestore.googleapis.com/v1"

_credentials: sa.Credentials | None = None
_project_id: str = ""
_enabled: bool = False


def _fix_private_key(d: dict) -> dict:
    """Unescape double-escaped newlines in private_key (common in env-var pastes)."""
    if "private_key" in d:
        d["private_key"] = d["private_key"].replace("\\n", "\n")
    return d


def init_firebase() -> None:
    """Load service-account credentials. Non-fatal if misconfigured."""
    global _credentials, _project_id, _enabled
    if not settings.FIREBASE_CREDENTIALS_JSON:
        logger.warning("FIREBASE_CREDENTIALS_JSON not set – Firestore disabled")
        return
    try:
        cred_dict = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
        cred_dict = _fix_private_key(cred_dict)
        _credentials = sa.Credentials.from_service_account_info(cred_dict, scopes=_SCOPES)
        _project_id = settings.FIREBASE_PROJECT_ID or cred_dict.get("project_id", "")
        _enabled = True
        logger.info("Firebase REST client initialised", project=_project_id)
    except Exception as e:
        logger.warning("Firebase init failed – Firestore disabled", error=str(e))


def _auth_headers() -> dict:
    """Return a fresh Bearer token header (refreshes automatically when needed)."""
    req = ga_requests.Request()
    _credentials.refresh(req)
    return {"Authorization": f"Bearer {_credentials.token}"}


def _collection_url(collection: str) -> str:
    return f"{_FIRESTORE_BASE}/projects/{_project_id}/databases/(default)/documents/{collection}"


def _doc_url(collection: str, doc_id: str) -> str:
    return f"{_collection_url(collection)}/{doc_id}"


def _to_firestore_value(v: Any) -> dict:
    """Convert a Python value to a Firestore REST value object."""
    if isinstance(v, bool):
        return {"booleanValue": v}
    if isinstance(v, int):
        return {"integerValue": str(v)}
    if isinstance(v, float):
        return {"doubleValue": v}
    if isinstance(v, str):
        return {"stringValue": v}
    if v is None:
        return {"nullValue": None}
    if isinstance(v, dict):
        return {"mapValue": {"fields": {k: _to_firestore_value(u) for k, u in v.items()}}}
    if isinstance(v, list):
        return {"arrayValue": {"values": [_to_firestore_value(i) for i in v]}}
    return {"stringValue": str(v)}


def _from_firestore_value(v: dict) -> Any:
    """Convert a Firestore REST value object to a Python value."""
    if "stringValue" in v: return v["stringValue"]
    if "integerValue" in v: return int(v["integerValue"])
    if "doubleValue" in v: return float(v["doubleValue"])
    if "booleanValue" in v: return v["booleanValue"]
    if "nullValue" in v: return None
    if "mapValue" in v: return {k: _from_firestore_value(u) for k, u in v["mapValue"].get("fields", {}).items()}
    if "arrayValue" in v: return [_from_firestore_value(i) for i in v["arrayValue"].get("values", [])]
    return None


# ---- Public helpers --------------------------------------------------------

async def save_document(collection: str, doc_id: str, data: dict) -> bool:
    """Create or overwrite a Firestore document. Returns True on success."""
    if not _enabled:
        return False
    try:
        fields = {k: _to_firestore_value(v) for k, v in data.items()}
        url = _doc_url(collection, doc_id)
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.patch(
                url,
                json={"fields": fields},
                headers=_auth_headers(),
            )
            resp.raise_for_status()
        return True
    except Exception as e:
        logger.warning("Firestore save_document failed", collection=collection, doc_id=doc_id, error=str(e))
        return False


async def get_document(collection: str, doc_id: str) -> dict | None:
    """Fetch a single Firestore document. Returns None if not found or disabled."""
    if not _enabled:
        return None
    try:
        url = _doc_url(collection, doc_id)
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=_auth_headers())
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            fields = resp.json().get("fields", {})
            return {k: _from_firestore_value(v) for k, v in fields.items()}
    except Exception as e:
        logger.warning("Firestore get_document failed", collection=collection, doc_id=doc_id, error=str(e))
        return None


def get_db():
    """Legacy shim for code that calls get_db(). Returns None if Firestore is disabled."""
    if not _enabled:
        return None
    return True  # callers should use save_document/get_document directly
