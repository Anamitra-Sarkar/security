"""
Hugging Face Inference API client (router.huggingface.co/hf-inference).

Key notes:
  - sentence-transformers on the HF router expects {"inputs": "<plain string>"}
    NOT {"inputs": ["text"]} (list causes 400 Bad Request)
  - Hello-SimpleAI/chatgpt-detector-roberta returns 200 (use as primary detector)
  - roberta-base-openai-detector returns 404 on the router (keep as fallback, will silently fail)
  - facebook/roberta-hate-speech-dynabench-r4-target returns 200

Env vars: HF_API_KEY, HF_DETECTOR_PRIMARY, HF_DETECTOR_FALLBACK,
          HF_EMBEDDINGS_PRIMARY, HF_EMBEDDINGS_FALLBACK, HF_HARM_CLASSIFIER
"""
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import List, Optional, Any

from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_TIMEOUT = httpx.Timeout(30.0, connect=10.0)


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


async def detect_ai_text(text: str) -> float:
    """
    Returns probability that text is AI-generated (0-1).
    Tries primary then fallback; returns average of successful scores.
    """
    scores: List[float] = []
    for url in [settings.HF_DETECTOR_PRIMARY, settings.HF_DETECTOR_FALLBACK]:
        try:
            result = await _hf_post(url, {"inputs": text})
            if isinstance(result, list) and len(result) > 0:
                labels = result[0] if isinstance(result[0], list) else result
                for item in labels:
                    label = item.get("label", "").lower()
                    if any(k in label for k in ("ai", "fake", "machine", "generated", "chatgpt", "gpt", "class_1", "label_1")):
                        scores.append(float(item["score"]))
                        break
                else:
                    # No matching label – take highest score as proxy
                    best = max(labels, key=lambda x: x.get("score", 0))
                    scores.append(float(best.get("score", 0.5)))
        except Exception as e:
            logger.warning("HF detector call failed", url=url, error=str(e))

    if not scores:
        raise Exception("All AI detectors failed")
    return round(sum(scores) / len(scores), 4)


async def get_embeddings(text: str) -> List[float]:
    """
    Returns a flat list of floats (embedding vector).
    IMPORTANT: HF router sentence-transformers expects inputs as a plain string,
    not a list. Passing a list causes 400 Bad Request.
    """
    for url in [settings.HF_EMBEDDINGS_PRIMARY, settings.HF_EMBEDDINGS_FALLBACK]:
        try:
            # Plain string input — required by HF router feature-extraction
            result = await _hf_post(url, {"inputs": text})
            # Response shape: [float, ...] or [[float, ...]] or [[[float, ...]]]
            while isinstance(result, list) and isinstance(result[0], list):
                result = result[0]
            if isinstance(result, list) and isinstance(result[0], float):
                return result
        except Exception as e:
            logger.warning("HF embeddings call failed", url=url, error=str(e))

    raise Exception("All embedding endpoints failed")


async def detect_harm(text: str) -> float:
    """Returns probability of harmful content (0-1). Non-fatal on failure."""
    try:
        result = await _hf_post(settings.HF_HARM_CLASSIFIER, {"inputs": text})
        if isinstance(result, list) and len(result) > 0:
            labels = result[0] if isinstance(result[0], list) else result
            for item in labels:
                label = item.get("label", "").lower()
                if any(k in label for k in ("hate", "toxic", "harmful", "hateful", "target")):
                    return float(item["score"])
            # fallback: return highest score
            return float(max(labels, key=lambda x: x.get("score", 0)).get("score", 0.0))
        return 0.0
    except Exception as e:
        logger.warning("HF harm classifier failed", error=str(e))
        return 0.0
