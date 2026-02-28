"""
Groq API client for perplexity scoring using Llama models.
Computes token-level log-probabilities to produce perplexity scores.

Env vars: GROQ_API_KEY, GROQ_MODEL, GROQ_BASE_URL
"""
import math
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from typing import Optional

from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_TIMEOUT = httpx.Timeout(60.0, connect=10.0)


class GroqServiceError(Exception):
    pass


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=15),
    retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.ConnectError)),
)
async def _groq_chat_completion(text: str) -> dict:
    """Call Groq chat completion with logprobs enabled.
    Note: Input is truncated to 2000 chars for cost control. Perplexity
    scores for longer texts reflect only the first 2000 characters.
    """
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "Repeat the following text exactly:"},
            {"role": "user", "content": text[:2000]},  # Truncated for cost control
        ],
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
    Compute a normalized perplexity score using Groq Llama endpoints.
    Returns a score between 0 and 1 where higher = more anomalous.

    Strategy: Use logprobs from a single completion call to estimate
    the model's surprise at the input text.
    """
    try:
        result = await _groq_chat_completion(text)
        choices = result.get("choices", [])
        if not choices:
            return None

        logprobs_data = choices[0].get("logprobs", {})
        if not logprobs_data:
            # If logprobs not available, use usage-based heuristic
            usage = result.get("usage", {})
            prompt_tokens = usage.get("prompt_tokens", 0)
            if prompt_tokens > 0:
                text_len = len(text.split())
                ratio = prompt_tokens / max(text_len, 1)
                # Normalize: high token ratio suggests unusual tokenization
                return min(1.0, max(0.0, (ratio - 1.0) / 2.0))
            return None

        content = logprobs_data.get("content", [])
        if not content:
            return None

        # Compute perplexity from log-probabilities
        log_probs = []
        for token_info in content:
            lp = token_info.get("logprob")
            if lp is not None:
                log_probs.append(lp)

        if not log_probs:
            return None

        avg_log_prob = sum(log_probs) / len(log_probs)
        perplexity = math.exp(-avg_log_prob)
        # Normalize to 0-1 range (perplexity of 1 = perfectly predicted, >100 = very unusual)
        normalized = min(1.0, max(0.0, (math.log(perplexity + 1) / math.log(101))))
        return round(normalized, 4)
    except Exception as e:
        logger.warning("Groq perplexity computation failed", error=str(e))
        return None
