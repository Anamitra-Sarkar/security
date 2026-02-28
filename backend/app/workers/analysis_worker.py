"""
Async worker for processing analysis jobs via Redis queue.
Handles heavy inference tasks that are offloaded from the main API.

Run: python -m backend.app.workers.analysis_worker
"""
import asyncio
import json

import redis

from backend.app.core.config import settings
from backend.app.core.logging import setup_logging, get_logger
from backend.app.services.hf_service import detect_ai_text, get_embeddings, detect_harm
from backend.app.services.groq_service import compute_perplexity
from backend.app.services.stylometry import compute_stylometry_score
from backend.app.services.ensemble import compute_ensemble
from backend.app.services.vector_db import compute_cluster_score, upsert_embedding

setup_logging(settings.LOG_LEVEL)
logger = get_logger(__name__)

QUEUE_NAME = "analysis_jobs"


def run_worker():
    """Blocking worker loop that processes analysis jobs from Redis queue."""
    r = redis.from_url(settings.REDIS_URL, decode_responses=True)
    logger.info("Worker started, listening on queue", queue=QUEUE_NAME)

    while True:
        try:
            _, raw = r.brpop(QUEUE_NAME, timeout=30)
            if raw is None:
                continue
            job = json.loads(raw)
            text = job.get("text", "")
            job_id = job.get("id", "unknown")
            logger.info("Processing job", job_id=job_id)

            result = asyncio.run(_process_job(text))
            r.setex(f"result:{job_id}", 3600, json.dumps(result))
            logger.info("Job completed", job_id=job_id)
        except Exception as e:
            logger.error("Worker error", error=str(e))


async def _process_job(text: str) -> dict:
    """Process a single analysis job."""
    try:
        p_ai = await detect_ai_text(text)
    except Exception:
        p_ai = None

    s_perp = None
    if p_ai is not None and p_ai > settings.PERPLEXITY_THRESHOLD:
        s_perp = await compute_perplexity(text)

    s_embed_cluster = None
    try:
        embeddings = await get_embeddings(text)
        s_embed_cluster = await compute_cluster_score(embeddings)
        await upsert_embedding(f"worker_{hash(text)}", embeddings)
    except Exception:
        pass

    p_ext = await detect_harm(text)
    s_styl = compute_stylometry_score(text)

    ensemble_result = compute_ensemble(
        p_ai=p_ai, s_perp=s_perp, s_embed_cluster=s_embed_cluster,
        p_ext=p_ext, s_styl=s_styl,
    )

    return {
        "p_ai": p_ai,
        "s_perp": s_perp,
        "s_embed_cluster": s_embed_cluster,
        "p_ext": p_ext,
        "s_styl": s_styl,
        "threat_score": ensemble_result["threat_score"],
        "explainability": ensemble_result["explainability"],
    }


if __name__ == "__main__":
    run_worker()
