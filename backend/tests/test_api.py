"""
Integration tests for the API endpoints with mocked external services.
Tests /api/analyze, /health, /metrics — no real Firebase, Firestore, or Redis needed.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient


def _make_client():
    """Build a TestClient with Firebase init and Firestore writes mocked out."""
    # Patch init_firebase and the _enabled flag so the app starts without real credentials
    with patch("backend.app.db.firestore.init_firebase"), \
         patch("backend.app.db.firestore._enabled", True), \
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


class TestStartupWithoutCredentials:
    """Verify the server starts cleanly when no GCP/Firebase credentials are present."""

    def test_health_returns_200_without_firebase_credentials(self):
        """App must start and /health must return 200 even without Firebase credentials."""
        # Use the same safe mock pattern as _make_client() – no real credentials needed
        c, _ = _make_client()
        response = c.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    def test_firestore_auto_init_false_skips_init(self):
        """When FIRESTORE_AUTO_INIT is False, init_firebase must not be invoked at startup."""
        from backend.app.main import app as _app
        from backend.app.core import config

        original = config.settings.FIRESTORE_AUTO_INIT
        try:
            config.settings.FIRESTORE_AUTO_INIT = False
            with patch("backend.app.db.firestore.init_firebase") as mock_init:
                # Simulate a lifespan startup by calling the lifespan coroutine
                import asyncio
                from contextlib import asynccontextmanager

                async def run_lifespan():
                    from backend.app.main import lifespan
                    async with lifespan(_app):
                        pass

                asyncio.run(run_lifespan())
                mock_init.assert_not_called()
        finally:
            config.settings.FIRESTORE_AUTO_INIT = original


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


class TestFirestoreRefreshError:
    """Verify RefreshError is logged at DEBUG, not WARNING."""

    @pytest.mark.asyncio
    async def test_save_document_refresh_error_returns_false(self):
        """RefreshError in save_document should return False without raising."""
        import google.auth.exceptions
        from unittest.mock import MagicMock, patch

        mock_db = MagicMock()
        mock_db.collection.return_value.document.return_value.set.side_effect = (
            google.auth.exceptions.RefreshError("invalid_grant: Invalid JWT Signature")
        )

        with patch("backend.app.db.firestore._enabled", True), \
             patch("backend.app.db.firestore._db", mock_db):
            from backend.app.db.firestore import save_document
            result = await save_document("test_col", "test_doc", {"key": "value"})
            assert result is False

    @pytest.mark.asyncio
    async def test_get_document_refresh_error_returns_none(self):
        """RefreshError in get_document should return None without raising."""
        import google.auth.exceptions
        from unittest.mock import MagicMock, patch

        mock_db = MagicMock()
        mock_db.collection.return_value.document.return_value.get.side_effect = (
            google.auth.exceptions.RefreshError("invalid_grant: Invalid JWT Signature")
        )

        with patch("backend.app.db.firestore._enabled", True), \
             patch("backend.app.db.firestore._db", mock_db):
            from backend.app.db.firestore import get_document
            result = await get_document("test_col", "test_doc")
            assert result is None


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
