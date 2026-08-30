"""
SignBridge Hand & Pose Detection Vision Pipeline
Wraps MediaPipe Holistic & Hands with OpenCV processing.
"""
import numpy as np
from typing import Tuple, Dict, Any, List, Optional

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    import mediapipe as mp
    MP_AVAILABLE = True
except ImportError:
    MP_AVAILABLE = False

from backend.vision.feature_extractor import LandmarkFeatureExtractor

class HandDetector:
    """
    Robust Hand and Landmark Detector wrapping MediaPipe Hands / Holistic.
    """
    def __init__(
        self,
        static_image_mode: bool = False,
        max_num_hands: int = 2,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5
    ):
        self.mp_available = MP_AVAILABLE
        self.mp_hands = None
        self.hands_detector = None
        self.mp_draw = None

        if MP_AVAILABLE:
            try:
                self.mp_hands = mp.solutions.hands
                self.hands_detector = self.mp_hands.Hands(
                    static_image_mode=static_image_mode,
                    max_num_hands=max_num_hands,
                    min_detection_confidence=min_detection_confidence,
                    min_tracking_confidence=min_tracking_confidence
                )
                self.mp_draw = mp.solutions.drawing_utils
            except Exception as e:
                print(f"[Warning] MediaPipe hands initialization failed: {e}. Running in lightweight fallback mode.")
                self.mp_available = False

    def process_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Processes a single BGR OpenCV frame:
        Returns:
            - features: 126-dimensional normalized landmark vector
            - landmarks_raw: dict with left and right hand keypoints (x, y, z)
            - hands_detected_count: int
        """
        if frame is None or not self.mp_available or self.hands_detector is None:
            # Synthetic / Simulated frame feature fallback
            return {
                "features": np.zeros(126, dtype=np.float32),
                "landmarks_raw": {"left_hand": [], "right_hand": []},
                "hands_detected_count": 0
            }

        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if CV2_AVAILABLE else frame
        results = self.hands_detector.process(rgb_frame)

        left_hand_pts = []
        right_hand_pts = []

        if results.multi_hand_landmarks and results.multi_handedness:
            for hand_lms, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                label = handedness.classification[0].label.lower() # 'left' or 'right'
                pts = [{"x": lm.x, "y": lm.y, "z": lm.z} for lm in hand_lms.landmark]
                
                if "left" in label:
                    left_hand_pts = pts
                else:
                    right_hand_pts = pts

        features = LandmarkFeatureExtractor.extract_frame_features(left_hand_pts, right_hand_pts)
        hands_count = (1 if left_hand_pts else 0) + (1 if right_hand_pts else 0)

        return {
            "features": features,
            "landmarks_raw": {
                "left_hand": left_hand_pts,
                "right_hand": right_hand_pts
            },
            "hands_detected_count": hands_count
        }

    def close(self):
        if self.hands_detector:
            self.hands_detector.close()
