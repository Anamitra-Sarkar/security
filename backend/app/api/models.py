"""
Pydantic request/response models for the API.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=50000, description="Text to analyze")


class BulkAnalyzeRequest(BaseModel):
    texts: List[str] = Field(..., min_length=1, max_length=20)


class SignalScores(BaseModel):
    p_ai: Optional[float] = Field(None, description="AI-generation probability (ensemble)")
    s_perp: Optional[float] = Field(None, description="Normalized perplexity score")
    s_embed_cluster: Optional[float] = Field(None, description="Embedding cluster outlier score")
    p_ext: Optional[float] = Field(None, description="Extremism/harm probability")
    s_styl: Optional[float] = Field(None, description="Stylometry anomaly score")
    p_watermark: Optional[float] = Field(None, description="Watermark detection (negative signal)")


class ExplainabilityItem(BaseModel):
    signal: str
    value: float
    weight: float
    contribution: float
    description: str


class AnalyzeResponse(BaseModel):
    id: str
    status: str
    threat_score: Optional[float] = None
    signals: Optional[SignalScores] = None
    explainability: Optional[List[ExplainabilityItem]] = None
    processing_time_ms: Optional[int] = None


class AuthRequest(BaseModel):
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
