"""
SignBridge Feature Extraction & Landmark Normalization Module
Standardizes 3D hand and body pose coordinates for scale, translation, and rotation invariance.
"""
import numpy as np
from typing import List, Dict, Any, Optional
from backend.config import LANDMARK_HAND_POINTS, COORDINATE_DIMS, HANDS_COUNT, FEATURE_DIM

class LandmarkFeatureExtractor:
    """
    Transforms raw MediaPipe hand landmark coordinates into centered, 
    scale-normalized 126-dimensional feature vectors.
    """

    @staticmethod
    def normalize_hand_landmarks(landmarks: Optional[List[Dict[str, float]]]) -> np.ndarray:
        """
        Normalizes 21 3D points of a single hand:
        1. Centers coordinates relative to the wrist (landmark 0).
        2. Normalizes scale by the maximum distance across hand landmarks.
        Returns array of shape (63,) -> 21 * 3
        """
        if not landmarks or len(landmarks) < LANDMARK_HAND_POINTS:
            return np.zeros(LANDMARK_HAND_POINTS * COORDINATE_DIMS, dtype=np.float32)

        coords = np.array([
            [lm.get("x", 0.0), lm.get("y", 0.0), lm.get("z", 0.0)]
            for lm in landmarks[:LANDMARK_HAND_POINTS]
        ], dtype=np.float32)

        # 1. Centering around Wrist (Point 0)
        wrist = coords[0].copy()
        centered_coords = coords - wrist

        # 2. Scale Invariance: Divide by max bounding radius from wrist
        max_dist = np.max(np.linalg.norm(centered_coords, axis=1))
        if max_dist > 1e-6:
            normalized_coords = centered_coords / max_dist
        else:
            normalized_coords = centered_coords

        return normalized_coords.flatten()

    @classmethod
    def extract_frame_features(
        cls,
        left_hand: Optional[List[Dict[str, float]]] = None,
        right_hand: Optional[List[Dict[str, float]]] = None
    ) -> np.ndarray:
        """
        Extracts combined feature vector for both hands.
        Returns 126-dimensional numpy array (63 left + 63 right).
        """
        left_features = cls.normalize_hand_landmarks(left_hand)
        right_features = cls.normalize_hand_landmarks(right_hand)
        
        combined = np.concatenate([left_features, right_features], axis=0)
        return combined.astype(np.float32)

    @classmethod
    def extract_from_raw_array(cls, raw_points: np.ndarray) -> np.ndarray:
        """
        Extracts normalized features when raw numpy array (N, 3) is provided.
        """
        if raw_points is None or raw_points.size == 0:
            return np.zeros(FEATURE_DIM, dtype=np.float32)
            
        if raw_points.shape == (FEATURE_DIM,):
            return raw_points.astype(np.float32)
            
        # If 42 points (2 hands x 21 x 3)
        if raw_points.shape == (42, 3):
            lh = raw_points[:21]
            rh = raw_points[21:]
            
            lh_norm = (lh - lh[0]) / (np.max(np.linalg.norm(lh - lh[0], axis=1)) + 1e-6)
            rh_norm = (rh - rh[0]) / (np.max(np.linalg.norm(rh - rh[0], axis=1)) + 1e-6)
            return np.concatenate([lh_norm.flatten(), rh_norm.flatten()]).astype(np.float32)
            
        # Pad or truncate to FEATURE_DIM
        flat = raw_points.flatten()
        if len(flat) < FEATURE_DIM:
            return np.pad(flat, (0, FEATURE_DIM - len(flat)), mode='constant').astype(np.float32)
        return flat[:FEATURE_DIM].astype(np.float32)
