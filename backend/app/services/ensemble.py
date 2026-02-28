"""
Ensemble scoring module.
Combines all signal scores into a final threat_score with explainability.

Configurable weights via environment variables.
"""
from typing import Optional, List, Dict
from backend.app.core.config import settings


def compute_ensemble(
    p_ai: Optional[float] = None,
    s_perp: Optional[float] = None,
    s_embed_cluster: Optional[float] = None,
    p_ext: Optional[float] = None,
    s_styl: Optional[float] = None,
    p_watermark: Optional[float] = None,
) -> Dict:
    """
    Deterministic ensemble scoring.
    Returns threat_score (0-1) and explainability breakdown.
    """
    signals = {
        "p_ai": {"value": p_ai, "weight": settings.WEIGHT_AI_DETECT, "desc": "AI-generated text probability"},
        "s_perp": {"value": s_perp, "weight": settings.WEIGHT_PERPLEXITY, "desc": "Perplexity anomaly score"},
        "s_embed_cluster": {"value": s_embed_cluster, "weight": settings.WEIGHT_EMBEDDING, "desc": "Embedding cluster outlier score"},
        "p_ext": {"value": p_ext, "weight": settings.WEIGHT_EXTREMISM, "desc": "Extremism/harm probability"},
        "s_styl": {"value": s_styl, "weight": settings.WEIGHT_STYLOMETRY, "desc": "Stylometry anomaly score"},
        "p_watermark": {"value": p_watermark, "weight": settings.WEIGHT_WATERMARK, "desc": "Watermark detection (negative signal)"},
    }

    total_weight = 0.0
    weighted_sum = 0.0
    explainability: List[Dict] = []

    for name, sig in signals.items():
        value = sig["value"]
        if value is None:
            continue

        weight = sig["weight"]

        # Watermark is a negative signal: if detected, reduce threat
        if name == "p_watermark":
            contribution = -value * weight
        else:
            contribution = value * weight

        weighted_sum += contribution
        total_weight += weight

        explainability.append({
            "signal": name,
            "value": round(value, 4),
            "weight": round(weight, 4),
            "contribution": round(contribution, 4),
            "description": sig["desc"],
        })

    # Normalize
    if total_weight > 0:
        threat_score = max(0.0, min(1.0, weighted_sum / total_weight))
    else:
        threat_score = 0.0

    return {
        "threat_score": round(threat_score, 4),
        "explainability": explainability,
    }


def calibrate_weights(sample_results: List[Dict]) -> Dict[str, float]:
    """
    Auto-calibrate weights based on sample dataset.
    This does NOT train any model - just adjusts weight vector using
    signal variance and correlation heuristics.
    Returns updated weight dict.
    """
    if not sample_results:
        return {
            "WEIGHT_AI_DETECT": settings.WEIGHT_AI_DETECT,
            "WEIGHT_PERPLEXITY": settings.WEIGHT_PERPLEXITY,
            "WEIGHT_EMBEDDING": settings.WEIGHT_EMBEDDING,
            "WEIGHT_EXTREMISM": settings.WEIGHT_EXTREMISM,
            "WEIGHT_STYLOMETRY": settings.WEIGHT_STYLOMETRY,
            "WEIGHT_WATERMARK": settings.WEIGHT_WATERMARK,
        }

    # Compute variance per signal to weight higher-variance signals more
    signal_names = ["p_ai", "s_perp", "s_embed_cluster", "p_ext", "s_styl", "p_watermark"]
    variances = {}
    for sig in signal_names:
        vals = [r.get(sig) for r in sample_results if r.get(sig) is not None]
        if len(vals) >= 2:
            mean = sum(vals) / len(vals)
            var = sum((v - mean) ** 2 for v in vals) / len(vals)
            variances[sig] = var
        else:
            variances[sig] = 0.01

    # Normalize variances to sum to 1
    total_var = sum(variances.values())
    if total_var > 0:
        weights = {k: v / total_var for k, v in variances.items()}
    else:
        weights = {k: 1.0 / len(signal_names) for k in signal_names}

    return {
        "WEIGHT_AI_DETECT": round(weights.get("p_ai", 0.3), 4),
        "WEIGHT_PERPLEXITY": round(weights.get("s_perp", 0.2), 4),
        "WEIGHT_EMBEDDING": round(weights.get("s_embed_cluster", 0.15), 4),
        "WEIGHT_EXTREMISM": round(weights.get("p_ext", 0.2), 4),
        "WEIGHT_STYLOMETRY": round(weights.get("s_styl", 0.1), 4),
        "WEIGHT_WATERMARK": round(weights.get("p_watermark", 0.05), 4),
    }
