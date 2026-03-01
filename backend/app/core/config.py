"""
Configuration module for the LLM Misuse Detection backend.
Reads all settings from environment variables.

Env vars: FIREBASE_PROJECT_ID, FIREBASE_CREDENTIALS_JSON,
          REDIS_URL, HF_API_KEY, GROQ_API_KEY,
          SENTRY_DSN, CORS_ORIGINS
"""
from pydantic_settings import BaseSettings
from typing import Optional
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "LLM Misuse Detector"
    DEBUG: bool = False

    # Firebase
    # Set FIREBASE_PROJECT_ID to your Firebase project ID.
    # Set FIREBASE_CREDENTIALS_JSON to the *contents* of your service account
    # JSON (as a single-line escaped string), OR set GOOGLE_APPLICATION_CREDENTIALS
    # to the path of the JSON file on disk. The latter is preferred for local dev.
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_CREDENTIALS_JSON: Optional[str] = None  # JSON string (for Render env vars)

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # HuggingFace
    HF_API_KEY: str = ""
    HF_DETECTOR_PRIMARY: str = "https://api-inference.huggingface.co/models/desklib/ai-text-detector-v1.01"
    HF_DETECTOR_FALLBACK: str = "https://api-inference.huggingface.co/models/fakespot-ai/roberta-base-ai-text-detection-v1"
    HF_EMBEDDINGS_PRIMARY: str = "https://api-inference.huggingface.co/models/sentence-transformers/all-mpnet-base-v2"
    HF_EMBEDDINGS_FALLBACK: str = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
    HF_HARM_CLASSIFIER: str = "https://api-inference.huggingface.co/models/facebook/roberta-hate-speech-dynabench-r4-target"

    # Groq
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    # Vector DB (Qdrant)
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION: str = "sentinel_embeddings"

    # Observability
    SENTRY_DSN: str = ""
    LOG_LEVEL: str = "INFO"

    # Ensemble weights (defaults)
    WEIGHT_AI_DETECT: float = 0.30
    WEIGHT_PERPLEXITY: float = 0.20
    WEIGHT_EMBEDDING: float = 0.15
    WEIGHT_EXTREMISM: float = 0.20
    WEIGHT_STYLOMETRY: float = 0.10
    WEIGHT_WATERMARK: float = 0.05

    # Cost control
    PERPLEXITY_THRESHOLD: float = 0.3

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 30

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
