"""
SignBridge Health & Model Telemetry Route
"""
import time
from fastapi import APIRouter
from backend.config import (
    TOTAL_CLASSES, SEQUENCE_LENGTH, FEATURE_DIM, 
    HIDDEN_DIM, NUM_LAYERS, CONFIDENCE_THRESHOLD
)
from backend.models.sign_model import SignInferenceEngine
from backend.database.db import get_stats

router = APIRouter(tags=["System & Telemetry"])
START_TIME = time.time()

@router.get("/health")
def health_check():
    """System health check and runtime telemetry."""
    engine = SignInferenceEngine.get_instance()
    stats = get_stats()
    uptime_sec = round(time.time() - START_TIME, 2)
    
    return {
        "status": "healthy",
        "service": "SignBridge AI Sign Language Recognition System",
        "version": "1.0.0",
        "uptime_seconds": uptime_sec,
        "inference_engine": engine.predict(np_zeros:=__import__("numpy").zeros((1, SEQUENCE_LENGTH, FEATURE_DIM)))["engine"],
        "device": engine.device,
        "model_loaded": engine.is_loaded,
        "database_words": stats["total_words"],
        "database_categories": stats["total_categories"]
    }

@router.get("/model/info")
def model_info():
    """Detailed architectural specifications of the deep sequence model."""
    engine = SignInferenceEngine.get_instance()
    return {
        "model_architecture": "Bi-Directional GRU with Temporal Self-Attention",
        "input_features": FEATURE_DIM,
        "sequence_length": SEQUENCE_LENGTH,
        "hidden_dimensions": HIDDEN_DIM,
        "recurrent_layers": NUM_LAYERS,
        "total_classes": TOTAL_CLASSES,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "device": engine.device,
        "weights_path": str(engine.model_path)
    }
