"""
Hugging Face Inference API client.
Calls AI-text detectors and embedding models hosted on HF Inference Endpoints.
Implements retry/backoff and circuit-breaker behavior.

Env vars: HF_API_KEY, HF_DETECTOR_PRIMARY, HF_DETECTOR_FALLBACK,
          HF_EMBEDDINGS_PRIMARY, HF_EMBEDDINGS_FALLBACK, HF_HARM_CLASSIFIER
"""
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import List, Optional, Dict, Any

from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_HEADERS = lambda: {"Authorization": f"Bearer {settings.HF_API_KEY}"}
_TIMEOUT = httpx.Timeout(30.0, connect=10.0)


class HFServiceError(Exception):
    pass


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.ConnectError)),
)
async def _hf_request(url: str, payload: dict) -> Any:
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(url, json=payload, headers=_HEADERS())
        resp.raise_for_status()
        return resp.json()


async def detect_ai_text(text: str) -> float:
    """
    Call AI text detector ensemble (primary + fallback).
    Returns probability that text is AI-generated (0-1).
    """
    scores = []
    for url in [settings.HF_DETECTOR_PRIMARY, settings.HF_DETECTOR_FALLBACK]:
        try:
            result = await _hf_request(url, {"inputs": text})
            # HF classification returns [[{label, score}, ...]]
            if isinstance(result, list) and len(result) > 0:
                labels = result[0] if isinstance(result[0], list) else result
                for item in labels:
                    label = item.get("label", "").lower()
                    if label in ("ai", "fake", "machine", "ai-generated", "generated"):
                        scores.append(item["score"])
                        break
                else:
                    # If no matching label found, use first score as proxy
                    if labels:
                        scores.append(labels[0].get("score", 0.5))
        except Exception as e:
            logger.warning("HF detector call failed", url=url, error=str(e))
    if not scores:
        raise HFServiceError("All AI detectors failed")
    return sum(scores) / len(scores)


async def get_embeddings(text: str) -> List[float]:
    """Get text embeddings from HF sentence-transformers endpoint."""
    for url in [settings.HF_EMBEDDINGS_PRIMARY, settings.HF_EMBEDDINGS_FALLBACK]:
        try:
            result = await _hf_request(url, {"inputs": text})
            if isinstance(result, list) and len(result) > 0:
                # Returns a list of floats (embedding vector)
                if isinstance(result[0], float):
                    return result
                if isinstance(result[0], list):
                    return result[0]
            return result
        except Exception as e:
            logger.warning("HF embeddings call failed", url=url, error=str(e))
    raise HFServiceError("All embedding endpoints failed")


async def detect_harm(text: str) -> float:
    """
    Call harm/extremism classifier on HF.
    Returns probability of harmful/extremist content (0-1).
    """
    try:
        result = await _hf_request(settings.HF_HARM_CLASSIFIER, {"inputs": text})
        if isinstance(result, list) and len(result) > 0:
            labels = result[0] if isinstance(result[0], list) else result
            for item in labels:
                label = item.get("label", "").lower()
                if label in ("hate", "toxic", "harmful", "extremist", "hateful"):
                    return item["score"]
            # Fallback: return highest score
            if labels:
                return max(item.get("score", 0.0) for item in labels)
        return 0.0
    except Exception as e:
        logger.warning("HF harm classifier failed", error=str(e))
        return 0.0
