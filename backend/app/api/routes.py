"""
Main API routes for the LLM Misuse Detection system.
Endpoints: /api/analyze, /api/analyze/bulk, /api/results/{id}
Persistence: Firestore via REST helpers.
"""
import hashlib
import json
import time
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from backend.app.api.models import (
    AnalyzeRequest,
    AnalyzeResponse,
    BulkAnalyzeRequest,
    ExplainabilityItem,
    SignalScores,
)
from backend.app.core.config import settings
from backend.app.core.logging import get_logger
from backend.app.core.redis import check_rate_limit, get_cached, set_cached
from backend.app.db.firestore import get_document, save_document
from backend.app.models.schemas import AnalysisResult
from backend.app.services.ensemble import compute_ensemble
from backend.app.services.groq_service import compute_perplexity
from backend.app.services.hf_service import detect_ai_text, detect_harm, get_embeddings
from backend.app.services.stylometry import compute_stylometry_score
from backend.app.services.vector_db import compute_cluster_score, upsert_embedding

logger = get_logger(__name__)
router = APIRouter(prefix="/api", tags=["analysis"])

COLLECTION = "analysis_results"


async def _analyze_text(text: str, user_id: str | None = None) -> dict:
    """Core analysis pipeline for a single text."""
    start_time = time.time()
    text_hash = hashlib.sha256(text.encode()).hexdigest()

    cached = await get_cached(f"analysis:{text_hash}")
    if cached:
        return json.loads(cached)

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
        await upsert_embedding(text_hash[:16], embeddings, {"text_preview": text[:200]})
    except Exception:
        pass

    p_ext = await detect_harm(text)
    s_styl = compute_stylometry_score(text)
    p_watermark = None

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

    try:
        await set_cached(f"analysis:{text_hash}", json.dumps(result), ttl=600)
    except Exception:
        pass

    try:
        doc = AnalysisResult(
            input_text=text,
            text_hash=text_hash,
            user_id=user_id,
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
        saved = await save_document(COLLECTION, doc.id, doc.to_dict())
        result["id"] = doc.id if saved else text_hash
    except Exception as e:
        logger.warning("Firestore persist failed", error=str(e))
        result["id"] = text_hash

    return result


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    """Analyze a single text for LLM misuse indicators."""
    rate_ok = await check_rate_limit("analyze:global")
    if not rate_ok:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    result = await _analyze_text(request.text)

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
        explainability=[ExplainabilityItem(**e) for e in result["explainability"]],
        processing_time_ms=result["processing_time_ms"],
    )


@router.post("/analyze/bulk")
async def bulk_analyze(request: BulkAnalyzeRequest):
    """Analyze multiple texts (max 20)."""
    rate_ok = await check_rate_limit("analyze:bulk:global", limit=5)
    if not rate_ok:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    results = []
    for text in request.texts:
        try:
            r = await _analyze_text(text)
            results.append({"status": "done", **r})
        except Exception as e:
            results.append({"status": "error", "error": str(e)})
    return {"results": results}


@router.get("/results/{result_id}", response_model=AnalyzeResponse)
async def get_result(result_id: str):
    """Fetch a previously computed analysis result by Firestore document ID."""
    data = await get_document(COLLECTION, result_id)
    if not data:
        raise HTTPException(status_code=404, detail="Result not found")

    return AnalyzeResponse(
        id=data["id"],
        status=data.get("status", "done"),
        threat_score=data.get("threat_score"),
        signals=SignalScores(
            p_ai=data.get("p_ai"),
            s_perp=data.get("s_perp"),
            s_embed_cluster=data.get("s_embed_cluster"),
            p_ext=data.get("p_ext"),
            s_styl=data.get("s_styl"),
            p_watermark=data.get("p_watermark"),
        ),
        explainability=[ExplainabilityItem(**e) for e in (data.get("explainability") or [])],
        processing_time_ms=data.get("processing_time_ms"),
    )
