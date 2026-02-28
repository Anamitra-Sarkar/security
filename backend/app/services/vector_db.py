"""
Vector DB integration using Qdrant for semantic embedding storage and similarity search.
Env vars: QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION
"""
import httpx
from typing import List, Optional, Dict
from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_TIMEOUT = httpx.Timeout(15.0, connect=5.0)


def _headers() -> Dict[str, str]:
    h = {"Content-Type": "application/json"}
    if settings.QDRANT_API_KEY:
        h["api-key"] = settings.QDRANT_API_KEY
    return h


async def ensure_collection(vector_size: int = 768):
    """Create collection if it doesn't exist."""
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.get(
                f"{settings.QDRANT_URL}/collections/{settings.QDRANT_COLLECTION}",
                headers=_headers(),
            )
            if resp.status_code == 404:
                await client.put(
                    f"{settings.QDRANT_URL}/collections/{settings.QDRANT_COLLECTION}",
                    json={"vectors": {"size": vector_size, "distance": "Cosine"}},
                    headers=_headers(),
                )
                logger.info("Created Qdrant collection", collection=settings.QDRANT_COLLECTION)
    except Exception as e:
        logger.warning("Qdrant collection setup failed (non-fatal)", error=str(e))


async def upsert_embedding(point_id: str, vector: List[float], payload: Optional[Dict] = None):
    """Store an embedding vector in Qdrant."""
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            await client.put(
                f"{settings.QDRANT_URL}/collections/{settings.QDRANT_COLLECTION}/points",
                json={
                    "points": [
                        {"id": point_id, "vector": vector, "payload": payload or {}}
                    ]
                },
                headers=_headers(),
            )
    except Exception as e:
        logger.warning("Qdrant upsert failed (non-fatal)", error=str(e))


async def search_similar(vector: List[float], top_k: int = 5) -> List[Dict]:
    """Search for similar embeddings in Qdrant."""
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.post(
                f"{settings.QDRANT_URL}/collections/{settings.QDRANT_COLLECTION}/points/search",
                json={"vector": vector, "limit": top_k, "with_payload": True},
                headers=_headers(),
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("result", [])
    except Exception as e:
        logger.warning("Qdrant search failed (non-fatal)", error=str(e))
        return []


async def compute_cluster_score(vector: List[float]) -> float:
    """
    Compute a cluster density score for the given vector.
    Higher score = more similar to existing content (potential coordinated campaign).
    Returns 0 if no similar items found.
    """
    similar = await search_similar(vector, top_k=10)
    if not similar:
        return 0.0
    scores = [item.get("score", 0.0) for item in similar]
    avg_similarity = sum(scores) / len(scores)
    return round(min(1.0, avg_similarity), 4)
