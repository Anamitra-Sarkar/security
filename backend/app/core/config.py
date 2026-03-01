"""
Configuration module for the LLM Misuse Detection backend.
NOTE on HF Inference API (updated July 2025):
  The old api-inference.huggingface.co returns 410 for most models.
  Use router.huggingface.co/hf-inference instead.
"""
from pydantic_settings import BaseSettings
from typing import Optional, List

_HF_ROUTER = "https://router.huggingface.co/hf-inference/models"


class Settings(BaseSettings):
    APP_NAME: str = "LLM Misuse Detector"
    DEBUG: bool = False

    # Firebase
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_CREDENTIALS_JSON: Optional[str] = None

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: str = "https://security-three-mu.vercel.app,http://localhost:3000"

    # HuggingFace
    HF_API_KEY: str = ""
    HF_DETECTOR_PRIMARY: str = f"{_HF_ROUTER}/roberta-base-openai-detector"
    HF_DETECTOR_FALLBACK: str = f"{_HF_ROUTER}/Hello-SimpleAI/chatgpt-detector-roberta"
    HF_EMBEDDINGS_PRIMARY: str = f"{_HF_ROUTER}/sentence-transformers/all-MiniLM-L6-v2"
    HF_EMBEDDINGS_FALLBACK: str = f"{_HF_ROUTER}/sentence-transformers/paraphrase-MiniLM-L3-v2"
    HF_HARM_CLASSIFIER: str = f"{_HF_ROUTER}/facebook/roberta-hate-speech-dynabench-r4-target"

    # Groq
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    # Qdrant
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION: str = "sentinel_embeddings"

    # Observability
    SENTRY_DSN: str = ""
    LOG_LEVEL: str = "INFO"

    # Ensemble weights
    WEIGHT_AI_DETECT: float = 0.30
    WEIGHT_PERPLEXITY: float = 0.20
    WEIGHT_EMBEDDING: float = 0.15
    WEIGHT_EXTREMISM: float = 0.20
    WEIGHT_STYLOMETRY: float = 0.10
    WEIGHT_WATERMARK: float = 0.05

    PERPLEXITY_THRESHOLD: float = 0.3
    RATE_LIMIT_PER_MINUTE: int = 30

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
