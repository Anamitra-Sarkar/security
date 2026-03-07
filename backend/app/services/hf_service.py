"""Hugging Face Inference API helpers with resilient fallbacks."""

from __future__ import annotations

import hashlib
from typing import Any

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_TIMEOUT = httpx.Timeout(30.0, connect=10.0)
_LOCAL_EMBEDDING_DIM = 384


def _headers() -> dict:
    return {"Authorization": f"Bearer {settings.HF_API_KEY}"}


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.ConnectError)),
)
async def _hf_post(url: str, payload: dict) -> Any:
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(url, json=payload, headers=_headers())
        resp.raise_for_status()
        return resp.json()


def _configured_urls(*urls: str) -> list[str]:
    return [url for url in urls if url and url.strip()]


def _local_embedding(text: str, dim: int = _LOCAL_EMBEDDING_DIM) -> list[float]:
    """Deterministic no-network embedding fallback to keep pipeline stable."""
    seed = hashlib.sha256(text.encode("utf-8")).digest()
    values: list[float] = []
    block = seed
    while len(values) < dim:
        block = hashlib.sha256(block + text.encode("utf-8")).digest()
        for byte in block:
            values.append((byte / 127.5) - 1.0)
            if len(values) == dim:
                break
    return values


async def detect_ai_text(text: str) -> float:
    """Returns probability that text is AI-generated (0-1)."""
    scores: list[float] = []
    for url in _configured_urls(settings.HF_DETECTOR_PRIMARY, settings.HF_DETECTOR_FALLBACK):
        try:
            result = await _hf_post(url, {"inputs": text})
            if isinstance(result, list) and len(result) > 0:
                labels = result[0] if isinstance(result[0], list) else result
                for item in labels:
                    label = item.get("label", "").lower()
                    if any(
                        k in label
                        for k in (
                            "ai",
                            "fake",
                            "machine",
                            "generated",
                            "chatgpt",
                            "gpt",
                            "class_1",
                            "label_1",
                        )
                    ):
                        scores.append(float(item["score"]))
                        break
                else:
                    best = max(labels, key=lambda x: x.get("score", 0))
                    scores.append(float(best.get("score", 0.5)))
        except Exception as e:
            logger.warning("HF detector call failed", url=url, error=str(e))

    if not scores:
        raise Exception("All AI detectors failed")
    return round(sum(scores) / len(scores), 4)


async def get_embeddings(text: str) -> list[float]:
    """Returns embedding vector, falling back to deterministic local embedding."""
    for url in _configured_urls(settings.HF_EMBEDDINGS_PRIMARY, settings.HF_EMBEDDINGS_FALLBACK):
        try:
            result = await _hf_post(url, {"inputs": text})
            while isinstance(result, list) and result and isinstance(result[0], list):
                result = result[0]
            if isinstance(result, list) and result and isinstance(result[0], (float, int)):
                return [float(v) for v in result]
        except Exception as e:
            logger.warning("HF embeddings call failed", url=url, error=str(e))

    logger.info("Using local deterministic embeddings fallback")
    return _local_embedding(text)


async def detect_harm(text: str) -> float:
    """Returns probability of harmful content (0-1). Non-fatal on failure.
    
    The RoBERTa hate speech model returns two types of labels:
    - Labels indicating HARMFUL content: 'hate', 'hateful', 'toxic', 'harmful', 'offensive'
    - Labels indicating SAFE content: 'nothate', 'not hate', 'not harmful', 'safe', 'neutral'
    
    CRITICAL: We must return the probability of HARMFUL content.
    If the model says "95% nothate", we return 5% (1 - 0.95).
    If the model says "95% hate", we return 95%.
    """
    if not settings.HF_HARM_CLASSIFIER:
        return 0.0

    try:
        result = await _hf_post(settings.HF_HARM_CLASSIFIER, {"inputs": text})
        if isinstance(result, list) and len(result) > 0:
            labels = result[0] if isinstance(result[0], list) else result
            
            # Strategy: Find the label that clearly indicates harm status
            harmful_score = None
            safe_score = None
            
            for item in labels:
                label = item.get("label", "").lower()
                score = float(item.get("score", 0))
                
                # Check if this is a HARMFUL label (without negation)
                is_harmful_label = any(k in label for k in ("hate", "hateful", "toxic", "harmful", "offensive", "label_1", "class_1"))
                has_negation = any(neg in label for neg in ("not", "no", "non", "nothate"))
                
                if is_harmful_label and not has_negation:
                    # This is a harmful label: use its score directly
                    harmful_score = score
                    break
                elif has_negation or any(safe in label for safe in ("safe", "neutral", "label_0", "class_0")):
                    # This is a safe label: we'll invert it if needed
                    safe_score = score
            
            # Return the harmful probability
            if harmful_score is not None:
                return round(harmful_score, 4)
            elif safe_score is not None:
                # If we only have a "safe" probability, return 1 - safe_probability
                return round(1.0 - safe_score, 4)
            
            # Fallback: If we can't determine, assume safe (return 0)
            logger.warning("Could not determine harm classification from labels", labels=labels)
            return 0.0
            
        return 0.0
    except Exception as e:
        logger.warning("HF harm classifier failed", error=str(e))
        return 0.0
