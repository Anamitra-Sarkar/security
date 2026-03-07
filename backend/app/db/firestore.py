"""
Lightweight in-process storage helpers for analysis results.

Firebase/Firestore auth has been removed from the runtime because the app no
longer uses login/signup, and startup must not depend on external credentials.
The public helper API is preserved so the analysis routes can keep storing and
retrieving recent results without any deployment-time setup.
"""
from __future__ import annotations

from collections import OrderedDict
from typing import Any

from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_STORE_LIMIT = 512
_db: "OrderedDict[str, dict[str, Any]]" = OrderedDict()
_enabled: bool = True


def init_firebase() -> None:
    """Legacy no-op kept for compatibility with existing imports/tests."""
    logger.info("Using in-memory analysis result storage")


async def save_document(collection: str, doc_id: str, data: dict) -> bool:
    """Store a recent analysis result in memory."""
    if not _enabled:
        return False

    key = f"{collection}:{doc_id}"
    _db[key] = dict(data)
    _db.move_to_end(key)
    if len(_db) > _STORE_LIMIT:
        _db.popitem(last=False)
    return True


async def get_document(collection: str, doc_id: str) -> dict | None:
    """Fetch a previously stored analysis result from memory."""
    if not _enabled:
        return None

    key = f"{collection}:{doc_id}"
    data = _db.get(key)
    return dict(data) if data is not None else None


def get_db():
    """Legacy shim. Returns the current in-memory store."""
    return _db if _enabled else None
