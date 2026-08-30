"""
Unit Tests for Landmark Feature Extractor & Video Preprocessing
"""
import pytest
import numpy as np
from backend.config import FEATURE_DIM
from backend.vision.feature_extractor import LandmarkFeatureExtractor
from backend.utils.preprocessing import validate_video_file

def test_landmark_normalization_shape():
    """Verifies that 21 landmarks normalize into exactly 63 coordinate dims."""
    dummy_landmarks = [{"x": float(i) * 0.05, "y": float(i) * 0.02, "z": 0.0} for i in range(21)]
    norm_features = LandmarkFeatureExtractor.normalize_hand_landmarks(dummy_landmarks)

    assert norm_features.shape == (63,)
    assert norm_features.dtype == np.float32
    # Wrist (point 0) centered to (0,0,0)
    assert np.allclose(norm_features[:3], [0.0, 0.0, 0.0])

def test_missing_landmarks_graceful_handling():
    """Verifies that missing or incomplete landmarks return zero vectors without crashing."""
    empty_features = LandmarkFeatureExtractor.normalize_hand_landmarks([])
    assert empty_features.shape == (63,)
    assert np.all(empty_features == 0.0)

    combined = LandmarkFeatureExtractor.extract_frame_features(None, None)
    assert combined.shape == (FEATURE_DIM,)
    assert np.all(combined == 0.0)

def test_scale_invariance():
    """Verifies that scaling landmark coordinates yields identical normalized features."""
    lm1 = [{"x": 0.1 * i, "y": 0.2 * i, "z": 0.0} for i in range(21)]
    lm2 = [{"x": 0.3 * i, "y": 0.6 * i, "z": 0.0} for i in range(21)] # Scaled 3x

    f1 = LandmarkFeatureExtractor.normalize_hand_landmarks(lm1)
    f2 = LandmarkFeatureExtractor.normalize_hand_landmarks(lm2)

    assert np.allclose(f1, f2, atol=1e-4), "Landmark normalizer should be scale invariant"

def test_video_validation():
    """Verifies video format and payload validation logic."""
    valid, _ = validate_video_file("test.mp4", 1024 * 1024)
    assert valid is True

    invalid_ext, msg = validate_video_file("test.exe", 1024)
    assert invalid_ext is False
    assert "Unsupported file format" in msg

    oversized, msg = validate_video_file("large.mp4", 200 * 1024 * 1024)
    assert oversized is False
    assert "exceeds limit" in msg
