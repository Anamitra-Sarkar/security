"""
Data models for the LLM Misuse Detection system.
Plain dataclasses – no ORM layer (Firestore is schemaless).
"""
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional, Any
import uuid


@dataclass
class AnalysisResult:
    """Mirrors the Firestore document structure stored under 'analysis_results'."""
    input_text: str
    text_hash: str

    # Per-signal scores
    p_ai: Optional[float] = None
    s_perp: Optional[float] = None
    s_embed_cluster: Optional[float] = None
    p_ext: Optional[float] = None
    s_styl: Optional[float] = None
    p_watermark: Optional[float] = None

    # Ensemble
    threat_score: Optional[float] = None
    explainability: Optional[Any] = None

    # Metadata
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    status: str = "done"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    processing_time_ms: Optional[int] = None

    def to_dict(self) -> dict:
        """Serialise to a plain dict suitable for Firestore."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "input_text": self.input_text[:10000],
            "text_hash": self.text_hash,
            "p_ai": self.p_ai,
            "s_perp": self.s_perp,
            "s_embed_cluster": self.s_embed_cluster,
            "p_ext": self.p_ext,
            "s_styl": self.s_styl,
            "p_watermark": self.p_watermark,
            "threat_score": self.threat_score,
            "explainability": self.explainability,
            "status": self.status,
            "created_at": self.created_at,
            "completed_at": self.completed_at,
            "processing_time_ms": self.processing_time_ms,
        }
