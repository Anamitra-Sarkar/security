"""
Main API routes for the LLM Misuse Detection system.
Endpoints: /api/analyze, /api/analyze/bulk, /api/results/{id}
"""
import hashlib
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.api.models import (
    AnalyzeRequest, AnalyzeResponse, BulkAnalyzeRequest,
    SignalScores, ExplainabilityItem,
)
from backend.app.core.auth import get_current_user
from backend.app.core.config import settings
from backend.app.core.redis import check_rate_limit, get_cached, set_cached
from backend.app.db.session import get_session
from backend.app.models.schemas import AnalysisResult
from backend.app.services.ensemble import compute_ensemble
from backend.app.services.hf_service import detect_ai_text, get_embeddings, detect_harm
from backend.app.services.groq_service import compute_perplexity
from backend.app.services.stylometry import compute_stylometry_score
from backend.app.services.vector_db import compute_cluster_score, upsert_embedding
from backend.app.core.logging import get_logger

import json

logger = get_logger(__name__)
router = APIRouter(prefix="/api", tags=["analysis"])


async def _analyze_text(text: str, user_id: str = None, session: AsyncSession = None) -> dict:
    """Core analysis pipeline for a single text."""
    start_time = time.time()
    text_hash = hashlib.sha256(text.encode()).hexdigest()

    # Check cache
    cached = await get_cached(f"analysis:{text_hash}")
    if cached:
        return json.loads(cached)

    # Step 1: AI detection (always run)
    try:
        p_ai = await detect_ai_text(text)
    except Exception:
        p_ai = None

    # Step 2: Perplexity (only if p_ai > threshold for cost control)
    s_perp = None
    if p_ai is not None and p_ai > settings.PERPLEXITY_THRESHOLD:
        s_perp = await compute_perplexity(text)

    # Step 3: Embeddings + cluster score
    s_embed_cluster = None
    try:
        embeddings = await get_embeddings(text)
        s_embed_cluster = await compute_cluster_score(embeddings)
        # Store embedding for future clustering
        await upsert_embedding(text_hash[:16], embeddings, {"text_preview": text[:200]})
    except Exception:
        pass

    # Step 4: Harm/extremism detection
    p_ext = await detect_harm(text)

    # Step 5: Stylometry
    s_styl = compute_stylometry_score(text)

    # Step 6: Watermark (placeholder - check for known provider watermarks)
    p_watermark = None

    # Step 7: Ensemble
    ensemble_result = compute_ensemble(
        p_ai=p_ai,
        s_perp=s_perp,
        s_embed_cluster=s_embed_cluster,
        p_ext=p_ext,
        s_styl=s_styl,
        p_watermark=p_watermark,
    )

    processing_time_ms = int((time.time() - start_time) * 1000)

    result = {
        "text_hash": text_hash,
        "p_ai": p_ai,
        "s_perp": s_perp,
        "s_embed_cluster": s_embed_cluster,
        "p_ext": p_ext,
        "s_styl": s_styl,
        "p_watermark": p_watermark,
        "threat_score": ensemble_result["threat_score"],
        "explainability": ensemble_result["explainability"],
        "processing_time_ms": processing_time_ms,
    }

    # Cache result
    try:
        await set_cached(f"analysis:{text_hash}", json.dumps(result), ttl=600)
    except Exception:
        pass

    # Persist to DB
    if session:
        db_result = AnalysisResult(
            user_id=user_id,
            input_text=text[:10000],  # Truncated to 10k chars for DB storage
            text_hash=text_hash,
            p_ai=p_ai,
            s_perp=s_perp,
            s_embed_cluster=s_embed_cluster,
            p_ext=p_ext,
            s_styl=s_styl,
            p_watermark=p_watermark,
            threat_score=ensemble_result["threat_score"],
            explainability=ensemble_result["explainability"],
            status="done",
            completed_at=datetime.now(timezone.utc),
            processing_time_ms=processing_time_ms,
        )
        session.add(db_result)
        await session.commit()
        result["id"] = db_result.id

    return result


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(
    request: AnalyzeRequest,
    session: AsyncSession = Depends(get_session),
):
    """Analyze a single text for LLM misuse indicators."""
    # Rate limiting (use IP or a generic key for unauthenticated)
    rate_ok = await check_rate_limit("analyze:global")
    if not rate_ok:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    result = await _analyze_text(request.text, session=session)

    return AnalyzeResponse(
        id=result.get("id", result.get("text_hash", "")),
        status="done",
        threat_score=result["threat_score"],
        signals=SignalScores(
            p_ai=result["p_ai"],
            s_perp=result["s_perp"],
            s_embed_cluster=result["s_embed_cluster"],
            p_ext=result["p_ext"],
            s_styl=result["s_styl"],
            p_watermark=result["p_watermark"],
        ),
        explainability=[
            ExplainabilityItem(**e) for e in result["explainability"]
        ],
        processing_time_ms=result["processing_time_ms"],
    )


@router.post("/analyze/bulk")
async def bulk_analyze(
    request: BulkAnalyzeRequest,
    session: AsyncSession = Depends(get_session),
):
    """Analyze multiple texts (max 20)."""
    rate_ok = await check_rate_limit("analyze:bulk:global", limit=5)
    if not rate_ok:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    results = []
    for text in request.texts:
        try:
            r = await _analyze_text(text, session=session)
            results.append({"status": "done", **r})
        except Exception as e:
            results.append({"status": "error", "error": str(e)})
    return {"results": results}


@router.get("/results/{result_id}")
async def get_result(result_id: str, session: AsyncSession = Depends(get_session)):
    """Get a previously computed analysis result by ID."""
    stmt = select(AnalysisResult).where(AnalysisResult.id == result_id)
    row = await session.execute(stmt)
    result = row.scalar_one_or_none()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return AnalyzeResponse(
        id=result.id,
        status=result.status,
        threat_score=result.threat_score,
        signals=SignalScores(
            p_ai=result.p_ai,
            s_perp=result.s_perp,
            s_embed_cluster=result.s_embed_cluster,
            p_ext=result.p_ext,
            s_styl=result.s_styl,
            p_watermark=result.p_watermark,
        ),
        explainability=[
            ExplainabilityItem(**e) for e in (result.explainability or [])
        ],
        processing_time_ms=result.processing_time_ms,
    )
