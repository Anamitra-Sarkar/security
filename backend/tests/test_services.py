"""
Integration tests for HF and Groq service modules (mocked).
Tests retry behavior and error handling.
"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
import httpx

from backend.app.services.hf_service import detect_ai_text, get_embeddings, detect_harm
from backend.app.services.groq_service import compute_perplexity


class TestHFService:
    @pytest.mark.asyncio
    @patch("backend.app.services.hf_service._hf_post", new_callable=AsyncMock)
    async def test_detect_ai_text_success(self, mock_post):
        mock_post.return_value = [[
            {"label": "AI", "score": 0.92},
            {"label": "Human", "score": 0.08},
        ]]
        score = await detect_ai_text("Test text for detection")
        assert 0.0 <= score <= 1.0

    @pytest.mark.asyncio
    @patch("backend.app.services.hf_service._hf_post", new_callable=AsyncMock)
    async def test_detect_ai_text_fallback(self, mock_post):
        """If primary fails, should try fallback."""
        mock_post.side_effect = [
            Exception("Primary failed"),
            [[{"label": "FAKE", "score": 0.75}]],
        ]
        score = await detect_ai_text("Test text")
        assert 0.0 <= score <= 1.0

    @pytest.mark.asyncio
    @patch("backend.app.services.hf_service._hf_post", new_callable=AsyncMock)
    async def test_get_embeddings_success(self, mock_post):
        mock_post.return_value = [0.1] * 768
        result = await get_embeddings("Test text")
        assert len(result) == 768

    @pytest.mark.asyncio
    @patch("backend.app.services.hf_service._hf_post", new_callable=AsyncMock)
    async def test_detect_harm_success(self, mock_post):
        mock_post.return_value = [[
            {"label": "hate", "score": 0.15},
            {"label": "not_hate", "score": 0.85},
        ]]
        score = await detect_harm("Test text")
        assert 0.0 <= score <= 1.0


class TestGroqService:
    @pytest.mark.asyncio
    @patch("backend.app.services.groq_service._groq_chat_completion", new_callable=AsyncMock)
    async def test_compute_perplexity_with_logprobs(self, mock_groq):
        mock_groq.return_value = {
            "choices": [{
                "logprobs": {
                    "content": [
                        {"logprob": -2.5},
                        {"logprob": -1.8},
                        {"logprob": -3.2},
                    ]
                }
            }]
        }
        score = await compute_perplexity("Test text for perplexity")
        assert score is not None
        assert 0.0 <= score <= 1.0

    @pytest.mark.asyncio
    @patch("backend.app.services.groq_service._groq_chat_completion", new_callable=AsyncMock)
    async def test_compute_perplexity_no_logprobs(self, mock_groq):
        mock_groq.return_value = {
            "choices": [{}],
            "usage": {"prompt_tokens": 15},
        }
        score = await compute_perplexity("Test text without logprobs available")
        assert score is None or 0.0 <= score <= 1.0

    @pytest.mark.asyncio
    @patch("backend.app.services.groq_service._groq_chat_completion", new_callable=AsyncMock)
    async def test_compute_perplexity_error(self, mock_groq):
        mock_groq.side_effect = Exception("Groq API error")
        score = await compute_perplexity("Test text")
        assert score is None
