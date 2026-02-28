"""
Unit tests for the stylometry analysis service.
"""
import pytest
from backend.app.services.stylometry import (
    compute_stylometry_score,
    extract_features,
    _function_word_freq,
    _punctuation_pattern,
    _readability_score,
    _sentence_length_variance,
)


class TestStylometry:
    def test_compute_score_normal_text(self):
        text = (
            "The Federal Reserve announced today that it will maintain current "
            "interest rates through the end of the quarter, citing stable employment "
            "numbers and moderate inflation indicators."
        )
        score = compute_stylometry_score(text)
        assert 0.0 <= score <= 1.0

    def test_compute_score_empty(self):
        assert compute_stylometry_score("") == 0.0

    def test_compute_score_short_text(self):
        assert compute_stylometry_score("Hello") == 0.0

    def test_function_word_frequency(self):
        text = "the dog and the cat are on the mat"
        ratio = _function_word_freq(text)
        assert 0.0 <= ratio <= 1.0
        assert ratio > 0.3  # High function word density

    def test_punctuation_pattern(self):
        text = "Hello, world! How are you? I'm fine."
        result = _punctuation_pattern(text)
        assert "density" in result
        assert "diversity" in result
        assert result["density"] > 0

    def test_readability(self):
        text = "This is a simple test sentence. It has easy words."
        score = _readability_score(text)
        assert score >= 0

    def test_sentence_length_variance(self):
        text = "Short. This is a longer sentence with more words. Tiny."
        var = _sentence_length_variance(text)
        assert var >= 0

    def test_extract_features(self):
        text = "This is a test of the feature extraction system for analysis."
        features = extract_features(text)
        assert "function_word_ratio" in features
        assert "punctuation" in features
        assert "readability_ari" in features
        assert "stylometry_score" in features

    def test_different_text_styles(self):
        formal = (
            "The comprehensive analysis of macroeconomic indicators suggests that "
            "the prevailing monetary policy framework requires substantial revision "
            "in light of unprecedented fiscal challenges."
        )
        casual = (
            "yo so I was thinking maybe we should grab some food later? "
            "idk what u want but pizza sounds good to me lol"
        )
        score_formal = compute_stylometry_score(formal)
        score_casual = compute_stylometry_score(casual)
        # Both should produce valid scores
        assert 0.0 <= score_formal <= 1.0
        assert 0.0 <= score_casual <= 1.0
