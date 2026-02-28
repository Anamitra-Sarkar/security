"""
Unit tests for the ensemble scoring module.
"""
import pytest
from backend.app.services.ensemble import compute_ensemble, calibrate_weights


class TestComputeEnsemble:
    def test_all_signals_provided(self):
        result = compute_ensemble(
            p_ai=0.8, s_perp=0.6, s_embed_cluster=0.4,
            p_ext=0.3, s_styl=0.5, p_watermark=0.0
        )
        assert "threat_score" in result
        assert "explainability" in result
        assert 0.0 <= result["threat_score"] <= 1.0
        assert len(result["explainability"]) == 6

    def test_partial_signals(self):
        result = compute_ensemble(p_ai=0.9, s_styl=0.3)
        assert 0.0 <= result["threat_score"] <= 1.0
        assert len(result["explainability"]) == 2

    def test_no_signals(self):
        result = compute_ensemble()
        assert result["threat_score"] == 0.0
        assert result["explainability"] == []

    def test_watermark_reduces_score(self):
        without_wm = compute_ensemble(p_ai=0.8, p_ext=0.5)
        with_wm = compute_ensemble(p_ai=0.8, p_ext=0.5, p_watermark=1.0)
        assert with_wm["threat_score"] < without_wm["threat_score"]

    def test_high_threat_signals(self):
        result = compute_ensemble(
            p_ai=1.0, s_perp=1.0, s_embed_cluster=1.0,
            p_ext=1.0, s_styl=1.0, p_watermark=0.0
        )
        assert result["threat_score"] > 0.8

    def test_low_threat_signals(self):
        result = compute_ensemble(
            p_ai=0.0, s_perp=0.0, s_embed_cluster=0.0,
            p_ext=0.0, s_styl=0.0, p_watermark=1.0
        )
        assert result["threat_score"] == 0.0

    def test_explainability_structure(self):
        result = compute_ensemble(p_ai=0.5, p_ext=0.3)
        for item in result["explainability"]:
            assert "signal" in item
            assert "value" in item
            assert "weight" in item
            assert "contribution" in item
            assert "description" in item


class TestCalibrateWeights:
    def test_empty_samples(self):
        weights = calibrate_weights([])
        assert "WEIGHT_AI_DETECT" in weights

    def test_with_samples(self):
        samples = [
            {"p_ai": 0.9, "s_perp": 0.5, "p_ext": 0.1, "s_styl": 0.3},
            {"p_ai": 0.1, "s_perp": 0.8, "p_ext": 0.9, "s_styl": 0.2},
            {"p_ai": 0.5, "s_perp": 0.3, "p_ext": 0.5, "s_styl": 0.7},
        ]
        weights = calibrate_weights(samples)
        total = sum(weights.values())
        assert total > 0
        for v in weights.values():
            assert v >= 0
