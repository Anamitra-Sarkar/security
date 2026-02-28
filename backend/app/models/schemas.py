"""
Database models for the LLM Misuse Detection system.
Uses SQLAlchemy ORM with async support.
"""
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Float, DateTime, Text, Boolean, Integer, JSON
)
from sqlalchemy.orm import DeclarativeBase
import uuid


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True, index=True)
    input_text = Column(Text, nullable=False)
    text_hash = Column(String(64), nullable=False, index=True)

    # Per-signal scores
    p_ai = Column(Float, nullable=True)
    s_perp = Column(Float, nullable=True)
    s_embed_cluster = Column(Float, nullable=True)
    p_ext = Column(Float, nullable=True)
    s_styl = Column(Float, nullable=True)
    p_watermark = Column(Float, nullable=True)

    # Ensemble
    threat_score = Column(Float, nullable=True)
    explainability = Column(JSON, nullable=True)

    # Metadata
    status = Column(String(20), default="pending")  # pending, processing, done, error
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
