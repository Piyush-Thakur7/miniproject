"""
SignBridge: AI-Based Sign Language Recognition System
Configuration Module (Resilient for Local & Serverless Vercel / Cloud Run)
"""
import os
import shutil
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"
if not FRONTEND_DIR.exists():
    FRONTEND_DIR = Path.cwd() / "frontend"

MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

# Serverless environment detection (Vercel, AWS Lambda, Cloud Run)
IS_SERVERLESS = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))

if IS_SERVERLESS:
    TMP_DIR = Path("/tmp/signbridge")
    try:
        TMP_DIR.mkdir(parents=True, exist_ok=True)
    except Exception:
        TMP_DIR = Path("/tmp")
        
    DATABASE_PATH = TMP_DIR / "vocabulary.db"
    # Copy pre-seeded DB to /tmp if available
    bundled_db = DATA_DIR / "vocabulary.db"
    if bundled_db.exists() and not DATABASE_PATH.exists():
        try:
            shutil.copy(bundled_db, DATABASE_PATH)
        except Exception:
            pass
else:
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
    except Exception:
        pass
    DATABASE_PATH = DATA_DIR / "vocabulary.db"

MODEL_WEIGHTS_PATH = MODELS_DIR / "sign_model_weights.pth"

# Machine Learning & Sequence Configuration
SEQUENCE_LENGTH = 30           # Number of frames in a temporal sequence window
LANDMARK_HAND_POINTS = 21       # 21 points per hand
COORDINATE_DIMS = 3            # (x, y, z) per point
HANDS_COUNT = 2                # Left & Right hands (21 * 3 * 2 = 126 dims)
FEATURE_DIM = 126              # 126 total normalized landmark feature dimensions
TOTAL_CLASSES = 500            # 500+ vocabulary classes

# Neural Network Architecture
HIDDEN_DIM = 256
NUM_LAYERS = 2
DROPOUT = 0.3
BIDIRECTIONAL = True

# Inference & Confidence Thresholds
CONFIDENCE_THRESHOLD = 0.70
UNKNOWN_SIGN_THRESHOLD = 0.45
SMOOTHING_BUFFER_SIZE = 7
CONSECUTIVE_FRAMES_TRIGGER = 3

# Video Processing & Upload Limits
MAX_UPLOAD_SIZE_MB = 100
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".webm", ".mov", ".mkv"}
TARGET_FPS = 30

# Web Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
