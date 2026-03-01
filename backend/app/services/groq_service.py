"""
Groq API client for perplexity scoring.
Uses llama-3.1-8b-instant which supports logprobs (70b does NOT on free tier).

Env vars: GROQ_API_KEY, GROQ_BASE_URL
"""
import math
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import Optional

from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_TIMEOUT = httpx.Timeout(60.0, connect=10.0)
# llama-3.1-8b-instant supports logprobs; llama-3.3-70b-versatile does NOT
_LOGPROBS_MODEL = "llama-3.1-8b-instant"


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=15),
    retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.ConnectError)),
)
async def _groq_chat_completion(text: str) -> dict:
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": _LOGPROBS_MODEL,
        "messages": [{"role": "user", "content": text[:1500]}],
        "max_tokens": 1,
        "temperature": 0,
        "logprobs": True,
        "top_logprobs": 1,
    }
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            f"{settings.GROQ_BASE_URL}/chat/completions",
            json=payload,
            headers=headers,
        )
        resp.raise_for_status()
        return resp.json()


async def compute_perplexity(text: str) -> Optional[float]:
    """
    Compute a normalized perplexity score (0-1) using Groq logprobs.
    Higher = more anomalous. Returns None on failure (non-fatal).
    """
    try:
        result = await _groq_chat_completion(text)
        choices = result.get("choices", [])
        if not choices:
            return None

        logprobs_data = choices[0].get("logprobs") or {}
        content = logprobs_data.get("content") or []

        if not content:
            usage = result.get("usage", {})
            prompt_tokens = usage.get("prompt_tokens", 0)
            if prompt_tokens > 0:
                text_len = max(len(text.split()), 1)
                ratio = prompt_tokens / text_len
                return round(min(1.0, max(0.0, (ratio - 1.0) / 2.0)), 4)
            return None

        log_probs = [t["logprob"] for t in content if t.get("logprob") is not None]
        if not log_probs:
            return None

        avg_log_prob = sum(log_probs) / len(log_probs)
        perplexity = math.exp(-avg_log_prob)
        normalized = min(1.0, max(0.0, math.log(perplexity + 1) / math.log(101)))
        return round(normalized, 4)
    except Exception as e:
        logger.warning("Groq perplexity computation failed", error=str(e))
        return None
