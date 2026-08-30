"""
SignBridge: AI-Based Sign Language Recognition System
Configuration Module
"""
import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "vocabulary.db"
MODEL_WEIGHTS_PATH = MODELS_DIR / "sign_model_weights.pth"

# Ensure runtime directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Machine Learning & Sequence Configuration
SEQUENCE_LENGTH = 30           # Number of frames in a temporal sequence window
LANDMARK_HAND_POINTS = 21       # 21 points per hand
COORDINATE_DIMS = 3            # (x, y, z) per point
HANDS_COUNT = 2                # Left & Right hands (21 * 3 * 2 = 126 dims)
FEATURE_DIM = 126              # 126 total normalized landmark feature dimensions
TOTAL_CLASSES = 500            # Expanded 500+ vocabulary classes

# Neural Network Architecture
HIDDEN_DIM = 256
NUM_LAYERS = 2
DROPOUT = 0.3
BIDIRECTIONAL = True

# Inference & Confidence Thresholds
CONFIDENCE_THRESHOLD = 0.70    # Minimum confidence to accept prediction
UNKNOWN_SIGN_THRESHOLD = 0.45  # Below this is strictly UNKNOWN SIGN
SMOOTHING_BUFFER_SIZE = 7      # Sliding window for prediction debounce
CONSECUTIVE_FRAMES_TRIGGER = 3 # Consecutive predictions needed to commit a word

# Video Processing & Upload Limits
MAX_UPLOAD_SIZE_MB = 100
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".webm", ".mov", ".mkv"}
TARGET_FPS = 30

# Web Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
