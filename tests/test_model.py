"""
Unit Tests for SignBridge PyTorch Sequence Model Architecture & Inference Engine
"""
import pytest
import numpy as np
from backend.config import SEQUENCE_LENGTH, FEATURE_DIM, TOTAL_CLASSES
from backend.models.sign_model import SignSequenceClassifier, SignInferenceEngine, TORCH_AVAILABLE

if TORCH_AVAILABLE:
    import torch

def test_model_forward_pass_dimensions():
    """Verifies that the PyTorch BiGRU model outputs logits of shape (batch, 500)."""
    if not TORCH_AVAILABLE:
        pytest.skip("PyTorch not installed")

    batch_size = 4
    model = SignSequenceClassifier(
        input_dim=FEATURE_DIM,
        hidden_dim=64,
        num_layers=1,
        num_classes=TOTAL_CLASSES
    )
    model.eval()

    dummy_input = torch.randn(batch_size, SEQUENCE_LENGTH, FEATURE_DIM)
    with torch.no_grad():
        output = model(dummy_input)

    assert output.shape == (batch_size, TOTAL_CLASSES), f"Expected {(batch_size, TOTAL_CLASSES)}, got {output.shape}"

def test_inference_engine_predict_structure():
    """Verifies that the SignInferenceEngine returns structured predictions."""
    engine = SignInferenceEngine.get_instance()
    dummy_seq = np.random.randn(SEQUENCE_LENGTH, FEATURE_DIM).astype(np.float32)

    result = engine.predict(dummy_seq, top_k=5)

    assert "class_id" in result
    assert "confidence" in result
    assert "top_candidates" in result
    assert 0 <= result["class_id"] < TOTAL_CLASSES
    assert 0.0 <= result["confidence"] <= 1.0
    assert len(result["top_candidates"]) == 5
    assert result["top_candidates"][0]["class_id"] == result["class_id"]
