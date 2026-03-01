"""
Redis-based rate limiter using a sliding window approach.
Env vars: REDIS_URL, RATE_LIMIT_PER_MINUTE

If REDIS_URL is missing or invalid the module degrades gracefully:
  - rate limiting is disabled (always returns True / under limit)
  - caching is disabled (always returns None)
This prevents a bad/missing secret from crashing /api/analyze.
"""
import time
from typing import Optional

import redis.asyncio as aioredis

from backend.app.core.config import settings
from backend.app.core.logging import get_logger

logger = get_logger(__name__)

_redis_client: Optional[aioredis.Redis] = None
_redis_broken: bool = False  # set True once we know Redis is unavailable

VALID_SCHEMES = ("redis://", "rediss://", "unix://")


def _is_valid_redis_url(url: str) -> bool:
    return any(url.startswith(scheme) for scheme in VALID_SCHEMES)


async def get_redis() -> Optional[aioredis.Redis]:
    global _redis_client, _redis_broken
    if _redis_broken:
        return None
    if _redis_client is None:
        url = settings.REDIS_URL
        if not _is_valid_redis_url(url):
            logger.warning(
                "REDIS_URL has an invalid scheme – rate limiting and caching disabled. "
                f"Expected redis://, rediss://, or unix:// but got: {url[:40]!r}"
            )
            _redis_broken = True
            return None
        try:
            _redis_client = aioredis.from_url(
                url, decode_responses=True, socket_connect_timeout=5
            )
            # Verify the connection is actually reachable
            await _redis_client.ping()
        except Exception as e:
            logger.warning("Redis unavailable – rate limiting and caching disabled", error=str(e))
            _redis_client = None
            _redis_broken = True
            return None
    return _redis_client


async def check_rate_limit(key: str, limit: int = 0, window: int = 60) -> bool:
    """
    Returns True if under limit, False if rate-limited.
    Always returns True (allow) when Redis is unavailable.
    """
    r = await get_redis()
    if r is None:
        return True  # degrade gracefully – allow the request
    if limit <= 0:
        limit = settings.RATE_LIMIT_PER_MINUTE
    now = time.time()
    window_start = now - window
    try:
        pipe = r.pipeline()
        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zadd(key, {str(now): now})
        pipe.zcard(key)
        pipe.expire(key, window + 1)
        results = await pipe.execute()
        count = results[2]
        return count <= limit
    except Exception as e:
        logger.warning("Redis rate-limit check failed – allowing request", error=str(e))
        return True


async def get_cached(key: str) -> Optional[str]:
    r = await get_redis()
    if r is None:
        return None
    try:
        return await r.get(key)
    except Exception:
        return None


async def set_cached(key: str, value: str, ttl: int = 300):
    r = await get_redis()
    if r is None:
        return
    try:
        await r.setex(key, ttl, value)
    except Exception:
        pass
