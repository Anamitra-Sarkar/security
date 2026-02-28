"""
Stylometry analysis service.
Lightweight CPU-only feature extraction: char n-grams, function-word frequencies,
punctuation patterns, and read-time heuristics.
No external models required.
"""
import re
import math
from collections import Counter
from typing import Dict

# Common English function words
FUNCTION_WORDS = {
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their",
    "what", "so", "up", "out", "if", "about", "who", "get", "which", "go",
    "me", "when", "make", "can", "like", "time", "no", "just", "him",
    "know", "take", "people", "into", "year", "your", "good", "some",
}


def _char_ngrams(text: str, n: int = 3) -> Dict[str, int]:
    """Extract character n-gram frequency distribution."""
    ngrams = Counter()
    text_lower = text.lower()
    for i in range(len(text_lower) - n + 1):
        ngrams[text_lower[i:i + n]] += 1
    return dict(ngrams)


def _function_word_freq(text: str) -> float:
    """Compute ratio of function words to total words."""
    words = text.lower().split()
    if not words:
        return 0.0
    fw_count = sum(1 for w in words if w.strip(".,!?;:\"'") in FUNCTION_WORDS)
    return fw_count / len(words)


def _punctuation_pattern(text: str) -> Dict[str, float]:
    """Extract punctuation density and diversity metrics."""
    if not text:
        return {"density": 0.0, "diversity": 0.0}
    puncts = re.findall(r"[^\w\s]", text)
    density = len(puncts) / len(text)
    diversity = len(set(puncts)) / max(len(puncts), 1)
    return {"density": round(density, 4), "diversity": round(diversity, 4)}


def _readability_score(text: str) -> float:
    """Simple Automated Readability Index approximation."""
    sentences = max(len(re.split(r"[.!?]+", text)), 1)
    words = text.split()
    word_count = max(len(words), 1)
    char_count = sum(len(w) for w in words)
    ari = 4.71 * (char_count / word_count) + 0.5 * (word_count / sentences) - 21.43
    return max(0, min(20, ari))


def _sentence_length_variance(text: str) -> float:
    """Compute variance in sentence lengths (words per sentence)."""
    sentences = re.split(r"[.!?]+", text)
    lengths = [len(s.split()) for s in sentences if s.strip()]
    if len(lengths) < 2:
        return 0.0
    mean = sum(lengths) / len(lengths)
    variance = sum((l - mean) ** 2 for l in lengths) / len(lengths)
    return round(math.sqrt(variance), 4)


def compute_stylometry_score(text: str) -> float:
    """
    Compute a stylometry anomaly score (0-1).
    Higher scores indicate more anomalous writing patterns
    (potentially AI-generated or coordinated).

    Uses a combination of features compared against typical human baselines.
    """
    if not text or len(text) < 20:
        return 0.0

    features = []

    # Feature 1: Function word ratio (human ~0.4-0.55, AI tends to be more uniform)
    fw_ratio = _function_word_freq(text)
    fw_anomaly = abs(fw_ratio - 0.47) / 0.47  # Distance from typical human ratio
    features.append(min(1.0, fw_anomaly))

    # Feature 2: Punctuation patterns
    punct = _punctuation_pattern(text)
    # Very low or very high punctuation density is anomalous
    punct_anomaly = abs(punct["density"] - 0.06) / 0.06 if punct["density"] > 0 else 0.5
    features.append(min(1.0, punct_anomaly))

    # Feature 3: Sentence length variance (low variance = more AI-like)
    slv = _sentence_length_variance(text)
    # Typical human variance is 5-15 words; very low suggests AI
    slv_anomaly = max(0, 1.0 - slv / 10.0) if slv < 10 else 0.0
    features.append(slv_anomaly)

    # Feature 4: Readability consistency
    ari = _readability_score(text)
    # Very consistent readability (middle range) is more AI-like
    ari_anomaly = max(0, 1.0 - abs(ari - 10) / 10)
    features.append(ari_anomaly)

    # Feature 5: Character n-gram entropy
    ngrams = _char_ngrams(text, 3)
    if ngrams:
        total = sum(ngrams.values())
        probs = [c / total for c in ngrams.values()]
        entropy = -sum(p * math.log2(p) for p in probs if p > 0)
        max_entropy = math.log2(max(len(ngrams), 1))
        # Very high entropy = unusual; normalize
        norm_entropy = entropy / max_entropy if max_entropy > 0 else 0
        # AI text tends to have moderate-high entropy
        features.append(max(0, norm_entropy - 0.5) * 2)
    else:
        features.append(0.0)

    # Weighted average
    weights = [0.25, 0.15, 0.25, 0.15, 0.20]
    score = sum(f * w for f, w in zip(features, weights))
    return round(min(1.0, max(0.0, score)), 4)


def extract_features(text: str) -> Dict:
    """Extract all stylometry features for analysis."""
    return {
        "function_word_ratio": _function_word_freq(text),
        "punctuation": _punctuation_pattern(text),
        "readability_ari": _readability_score(text),
        "sentence_length_variance": _sentence_length_variance(text),
        "stylometry_score": compute_stylometry_score(text),
    }
