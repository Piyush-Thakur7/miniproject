"""
SignBridge Preprocessing Utilities
Handles image decoding, format verification, and temporal sequence buffering.
"""
import io
import base64
import numpy as np
from typing import Optional, Tuple
from pathlib import Path

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

from backend.config import ALLOWED_VIDEO_EXTENSIONS, MAX_UPLOAD_SIZE_MB

def decode_base64_frame(base64_str: str) -> Optional[np.ndarray]:
    """
    Decodes a base64 encoded image string (e.g. data:image/jpeg;base64,...) 
    into an OpenCV BGR numpy array.
    """
    if not base64_str:
        return None

    try:
        if "," in base64_str:
            base64_str = base64_str.split(",", 1)[1]
            
        img_bytes = base64.b64decode(base64_str)
        
        if CV2_AVAILABLE:
            np_arr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            return frame
        else:
            # Fallback placeholder dummy array
            return np.zeros((480, 640, 3), dtype=np.uint8)
    except Exception as e:
        print(f"[Error] Failed to decode base64 frame: {e}")
        return None

def encode_frame_base64(frame: np.ndarray, format: str = ".jpg") -> str:
    """Encodes an OpenCV image frame to base64 jpeg string."""
    if frame is None or not CV2_AVAILABLE:
        return ""
    success, buffer = cv2.imencode(format, frame)
    if not success:
        return ""
    return base64.b64encode(buffer).decode("utf-8")

def validate_video_file(filename: str, file_size_bytes: int) -> Tuple[bool, str]:
    """Validates uploaded video file extension and payload size limit."""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        return False, f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        
    max_bytes = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size_bytes > max_bytes:
        return False, f"File size ({file_size_bytes / (1024*1024):.1f}MB) exceeds limit of {MAX_UPLOAD_SIZE_MB}MB."
        
    return True, "Valid"
