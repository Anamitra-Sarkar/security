"""
Redis-based rate limiter using a sliding window approach.
Env vars: REDIS_URL, RATE_LIMIT_PER_MINUTE
"""
import time
from typing import Optional

import redis.asyncio as aioredis

from backend.app.core.config import settings

_redis_client: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL, decode_responses=True, socket_connect_timeout=5
        )
    return _redis_client


async def check_rate_limit(key: str, limit: int = 0, window: int = 60) -> bool:
    """
    Returns True if under limit, False if rate-limited.
    Uses sorted set with timestamps for sliding window.
    """
    if limit <= 0:
        limit = settings.RATE_LIMIT_PER_MINUTE
    r = await get_redis()
    now = time.time()
    window_start = now - window
    pipe = r.pipeline()
    pipe.zremrangebyscore(key, 0, window_start)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window + 1)
    results = await pipe.execute()
    count = results[2]
    return count <= limit


async def get_cached(key: str) -> Optional[str]:
    r = await get_redis()
    return await r.get(key)


async def set_cached(key: str, value: str, ttl: int = 300):
    r = await get_redis()
    await r.setex(key, ttl, value)
