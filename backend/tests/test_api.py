"""
Integration tests for the API endpoints with mocked external services.
Tests /api/analyze, /health, /metrics — no external auth, persistence, or Redis needed.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient


def _make_client():
    """Build a TestClient with persistence and external calls mocked out."""
    with patch("backend.app.db.firestore._enabled", True), \
         patch("backend.app.db.firestore.save_document", new_callable=AsyncMock, return_value=True), \
         patch("backend.app.db.firestore.get_document", new_callable=AsyncMock, return_value=None):
        from backend.app.main import app

    app.dependency_overrides = {}
    client = TestClient(app)
    return client, None


@pytest.fixture
def client():
    c, _ = _make_client()
    return c


class TestStartup:
    """Verify the server starts cleanly without auth or external storage."""

    def test_health_returns_200_on_startup(self):
        """App must start and /health must return 200 with default settings."""
        c, _ = _make_client()
        response = c.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    @pytest.mark.asyncio
    async def test_in_memory_storage_round_trip(self):
        """Recent analysis results should still be retrievable without Firestore."""
        from backend.app.db.firestore import save_document, get_document, _db

        _db.clear()
        payload = {"id": "abc123", "status": "done", "threat_score": 0.42}
        assert await save_document("analysis_results", "abc123", payload) is True
        assert await get_document("analysis_results", "abc123") == payload


class TestHealthEndpoint:
    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["version"] == "1.0.0"


class TestMetricsEndpoint:
    def test_metrics(self, client):
        response = client.get("/metrics")
        assert response.status_code == 200


class TestAnalyzeEndpoint:
    @patch("backend.app.api.routes.check_rate_limit", new_callable=AsyncMock, return_value=True)
    @patch("backend.app.api.routes.detect_ai_text", new_callable=AsyncMock, return_value=0.85)
    @patch("backend.app.api.routes.compute_perplexity", new_callable=AsyncMock, return_value=0.6)
    @patch("backend.app.api.routes.get_embeddings", new_callable=AsyncMock, return_value=[0.1] * 768)
    @patch("backend.app.api.routes.compute_cluster_score", new_callable=AsyncMock, return_value=0.3)
    @patch("backend.app.api.routes.upsert_embedding", new_callable=AsyncMock)
    @patch("backend.app.api.routes.detect_harm", new_callable=AsyncMock, return_value=0.2)
    @patch("backend.app.api.routes.get_cached", new_callable=AsyncMock, return_value=None)
    @patch("backend.app.api.routes.set_cached", new_callable=AsyncMock)
    @patch("backend.app.db.firestore.save_document", new_callable=AsyncMock, return_value=True)
    def test_analyze_returns_scores(
        self, mock_save, mock_set_cache, mock_get_cache, mock_harm, mock_upsert,
        mock_cluster, mock_embed, mock_perp, mock_ai, mock_rate, client
    ):
        response = client.post(
            "/api/analyze",
            json={"text": "This is a test text that should be analyzed for potential misuse patterns."},
        )
        assert response.status_code == 200
        data = response.json()
        assert "threat_score" in data
        assert "signals" in data
        assert "explainability" in data
        assert data["status"] == "done"
        assert data["signals"]["p_ai"] == 0.85

    @patch("backend.app.api.routes.check_rate_limit", new_callable=AsyncMock, return_value=False)
    def test_rate_limited(self, mock_rate, client):
        response = client.post(
            "/api/analyze",
            json={"text": "Test text for rate limiting check."},
        )
        assert response.status_code == 429

    def test_text_too_short(self, client):
        response = client.post("/api/analyze", json={"text": "short"})
        assert response.status_code == 422


class TestAssistEndpoint:
    def test_assist_no_api_key_returns_503(self, client):
        """When GROQ_API_KEY is not set, /api/assist should return 503."""
        from backend.app.core import config
        original = config.settings.GROQ_API_KEY
        try:
            config.settings.GROQ_API_KEY = ""
            response = client.post(
                "/api/assist",
                json={"text": "This is a test text that needs to be fixed by the AI assistant."},
            )
            assert response.status_code == 503
            assert "GROQ_API_KEY" in response.json()["detail"]
        finally:
            config.settings.GROQ_API_KEY = original

    @patch("backend.app.api.routes.check_rate_limit", new_callable=AsyncMock, return_value=True)
    @patch("backend.app.api.routes.httpx.AsyncClient")
    def test_assist_returns_fixed_text(self, mock_http_cls, mock_rate, client):
        """When Groq API responds, /api/assist should return fixed_text and logs."""
        from backend.app.core import config
        original = config.settings.GROQ_API_KEY
        try:
            config.settings.GROQ_API_KEY = "test-groq-key"
            # Set up mock response
            mock_response = MagicMock()
            mock_response.json.return_value = {
                "choices": [{"message": {"content": "This is the improved text."}}]
            }
            mock_response.raise_for_status = MagicMock()
            mock_http_instance = MagicMock()
            mock_http_instance.__aenter__ = AsyncMock(return_value=mock_http_instance)
            mock_http_instance.__aexit__ = AsyncMock(return_value=False)
            mock_http_instance.post = AsyncMock(return_value=mock_response)
            mock_http_cls.return_value = mock_http_instance

            response = client.post(
                "/api/assist",
                json={"text": "This is a test text that needs to be fixed by the AI assistant."},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["fixed_text"] == "This is the improved text."
            assert isinstance(data["request_logs"], list)
            assert len(data["request_logs"]) > 0
        finally:
            config.settings.GROQ_API_KEY = original

    @patch("backend.app.api.routes.check_rate_limit", new_callable=AsyncMock, return_value=False)
    def test_assist_rate_limited(self, mock_rate, client):
        """When rate limit is exceeded, /api/assist should return 429."""
        from backend.app.core import config
        original = config.settings.GROQ_API_KEY
        try:
            config.settings.GROQ_API_KEY = "test-groq-key"
            response = client.post(
                "/api/assist",
                json={"text": "This is a test text that needs to be fixed."},
            )
            assert response.status_code == 429
        finally:
            config.settings.GROQ_API_KEY = original


class TestModelConfiguration:
    def test_default_models_match_documented_endpoints(self):
        """Default backend model settings should match the documented README models."""
        from backend.app.core.config import settings

        assert settings.HF_DETECTOR_PRIMARY.endswith("/desklib/ai-text-detector-v1.01")
        assert settings.HF_DETECTOR_FALLBACK.endswith("/fakespot-ai/roberta-base-ai-text-detection-v1")
        assert settings.HF_EMBEDDINGS_PRIMARY.endswith("/sentence-transformers/all-mpnet-base-v2")
        assert settings.HF_EMBEDDINGS_FALLBACK.endswith("/sentence-transformers/all-MiniLM-L6-v2")
        assert settings.HF_HARM_CLASSIFIER.endswith("/facebook/roberta-hate-speech-dynabench-r4-target")


class TestAttackSimulations:
    @patch("backend.app.api.routes.check_rate_limit", new_callable=AsyncMock, return_value=True)
    @patch("backend.app.api.routes.detect_ai_text", new_callable=AsyncMock, return_value=0.95)
    @patch("backend.app.api.routes.compute_perplexity", new_callable=AsyncMock, return_value=0.8)
    @patch("backend.app.api.routes.get_embeddings", new_callable=AsyncMock, return_value=[0.1] * 768)
    @patch("backend.app.api.routes.compute_cluster_score", new_callable=AsyncMock, return_value=0.7)
    @patch("backend.app.api.routes.upsert_embedding", new_callable=AsyncMock)
    @patch("backend.app.api.routes.detect_harm", new_callable=AsyncMock, return_value=0.9)
    @patch("backend.app.api.routes.get_cached", new_callable=AsyncMock, return_value=None)
    @patch("backend.app.api.routes.set_cached", new_callable=AsyncMock)
    @patch("backend.app.db.firestore.save_document", new_callable=AsyncMock, return_value=True)
    def test_high_threat_detection(
        self, mock_save, mock_set_cache, mock_get_cache, mock_harm, mock_upsert,
        mock_cluster, mock_embed, mock_perp, mock_ai, mock_rate, client
    ):
        response = client.post(
            "/api/analyze",
            json={"text": "Simulated high-threat content for testing purposes only. This is a test."},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["threat_score"] > 0.5

    @patch("backend.app.api.routes.check_rate_limit", new_callable=AsyncMock, return_value=True)
    @patch("backend.app.api.routes.detect_ai_text", new_callable=AsyncMock, return_value=0.05)
    @patch("backend.app.api.routes.get_embeddings", new_callable=AsyncMock, return_value=[0.1] * 768)
    @patch("backend.app.api.routes.compute_cluster_score", new_callable=AsyncMock, return_value=0.1)
    @patch("backend.app.api.routes.upsert_embedding", new_callable=AsyncMock)
    @patch("backend.app.api.routes.detect_harm", new_callable=AsyncMock, return_value=0.02)
    @patch("backend.app.api.routes.get_cached", new_callable=AsyncMock, return_value=None)
    @patch("backend.app.api.routes.set_cached", new_callable=AsyncMock)
    @patch("backend.app.db.firestore.save_document", new_callable=AsyncMock, return_value=True)
    def test_benign_text_low_threat(
        self, mock_save, mock_set_cache, mock_get_cache, mock_harm, mock_upsert,
        mock_cluster, mock_embed, mock_ai, mock_rate, client
    ):
        response = client.post(
            "/api/analyze",
            json={"text": "The weather today is sunny with clear skies and mild temperatures across the region."},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["threat_score"] < 0.3
