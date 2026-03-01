"""Groq API client for optional perplexity scoring."""

from __future__ import annotations

import math
from typing import Optional

import httpx

from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_TIMEOUT = httpx.Timeout(30.0, connect=10.0)
_LOGPROBS_MODEL = "llama-3.1-8b-instant"


async def _groq_chat_completion(text: str) -> Optional[dict]:
    if not settings.GROQ_API_KEY:
        return None

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
        # 4xx means unsupported model/params for this key-tier; do not spam retries.
        if 400 <= resp.status_code < 500:
            logger.info("Groq perplexity unavailable for current deployment", status_code=resp.status_code)
            return None
        resp.raise_for_status()
        return resp.json()


async def compute_perplexity(text: str) -> Optional[float]:
    """Compute a normalized perplexity score (0-1). Returns None on failure."""
    try:
        result = await _groq_chat_completion(text)
        if not result:
            return None

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
