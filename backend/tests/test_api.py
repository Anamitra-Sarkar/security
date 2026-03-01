"""
Integration tests for the API endpoints with mocked external services.
Tests /api/analyze, /health, /metrics — no real Firebase, Firestore, or Redis needed.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient


def _make_client():
    """Build a TestClient with Firebase init and Firestore writes mocked out."""
    # Patch firebase_admin before app is imported to prevent SDK initialisation
    with patch("backend.app.db.firestore.firebase_admin"), \
         patch("backend.app.db.firestore.firestore"):
        from backend.app.main import app

    # Mock get_db() so Firestore document writes are no-ops
    mock_db = MagicMock()
    mock_collection = MagicMock()
    mock_doc_ref = MagicMock()
    mock_db.collection.return_value = mock_collection
    mock_collection.document.return_value = mock_doc_ref
    mock_doc_ref.set.return_value = None

    # Mock get_result Firestore read
    mock_existing_doc = MagicMock()
    mock_existing_doc.exists = False
    mock_doc_ref.get.return_value = mock_existing_doc

    app.dependency_overrides = {}
    with patch("backend.app.api.routes.get_db", return_value=mock_db), \
         patch("backend.app.db.firestore.init_firebase"):
        client = TestClient(app)
    return client, mock_db


@pytest.fixture
def client():
    c, _ = _make_client()
    return c


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
    @patch("backend.app.api.routes.get_db")
    def test_analyze_returns_scores(
        self, mock_get_db, mock_set_cache, mock_get_cache, mock_harm, mock_upsert,
        mock_cluster, mock_embed, mock_perp, mock_ai, mock_rate, client
    ):
        mock_db = MagicMock()
        mock_db.collection.return_value.document.return_value.set.return_value = None
        mock_get_db.return_value = mock_db

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
    @patch("backend.app.api.routes.get_db")
    def test_high_threat_detection(
        self, mock_get_db, mock_set_cache, mock_get_cache, mock_harm, mock_upsert,
        mock_cluster, mock_embed, mock_perp, mock_ai, mock_rate, client
    ):
        mock_db = MagicMock()
        mock_db.collection.return_value.document.return_value.set.return_value = None
        mock_get_db.return_value = mock_db

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
    @patch("backend.app.api.routes.get_db")
    def test_benign_text_low_threat(
        self, mock_get_db, mock_set_cache, mock_get_cache, mock_harm, mock_upsert,
        mock_cluster, mock_embed, mock_ai, mock_rate, client
    ):
        mock_db = MagicMock()
        mock_db.collection.return_value.document.return_value.set.return_value = None
        mock_get_db.return_value = mock_db

        response = client.post(
            "/api/analyze",
            json={"text": "The weather today is sunny with clear skies and mild temperatures across the region."},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["threat_score"] < 0.3
