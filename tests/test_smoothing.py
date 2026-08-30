"""
Unit Tests for Temporal Smoothing, Debounce & Sentence Assembler
"""
import pytest
from backend.utils.smoothing import TemporalSmoother

def test_temporal_smoother_debouncing():
    """Verifies that consecutive frames are required before committing a new word."""
    smoother = TemporalSmoother(consecutive_trigger=3, confidence_threshold=0.70)

    # Frame 1: HELLO
    res1 = smoother.update("HELLO", 0.95)
    assert res1["is_new_word"] is False
    assert smoother.get_sentence() == ""

    # Frame 2: HELLO
    res2 = smoother.update("HELLO", 0.95)
    assert res2["is_new_word"] is False
    assert smoother.get_sentence() == ""

    # Frame 3: HELLO (triggers consecutive threshold)
    res3 = smoother.update("HELLO", 0.95)
    assert res3["is_new_word"] is True
    assert "Hello" in smoother.get_sentence()

def test_duplicate_suppression():
    """Verifies that holding the same sign does not spam repeated words."""
    smoother = TemporalSmoother(consecutive_trigger=2, confidence_threshold=0.70)

    for _ in range(10):
        smoother.update("HELLO", 0.95)

    assert smoother.get_sentence() == "Hello."
    assert len(smoother.sentence_words) == 1

def test_unknown_sign_handling():
    """Verifies that low confidence frames are tagged as UNKNOWN SIGN and not committed."""
    smoother = TemporalSmoother(unknown_threshold=0.45)

    res = smoother.update("SOME_SIGN", 0.20)
    assert res["display_word"] == "UNKNOWN SIGN"
    assert res["status"] == "uncertain"
    assert smoother.get_sentence() == ""

def test_sentence_punctuation_and_questions():
    """Verifies that questions receive question marks and statements receive periods."""
    smoother = TemporalSmoother(consecutive_trigger=1, confidence_threshold=0.5)

    smoother.update("HOW", 0.9)
    smoother.update("ARE", 0.9)
    smoother.update("YOU", 0.9)

    sentence = smoother.get_sentence()
    assert sentence == "How are you?"

    smoother.clear_sentence()
    smoother.update("NICE", 0.9)
    smoother.update("DAY", 0.9)

    sentence2 = smoother.get_sentence()
    assert sentence2 == "Nice day."
