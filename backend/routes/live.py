"""
SignBridge Real-Time Live Webcam & WebSocket Recognition Route
"""
import time
import json
import numpy as np
from collections import deque
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.config import SEQUENCE_LENGTH, FEATURE_DIM
from backend.models.sign_model import SignInferenceEngine
from backend.vision.hand_detector import HandDetector
from backend.vision.feature_extractor import LandmarkFeatureExtractor
from backend.utils.preprocessing import decode_base64_frame
from backend.utils.smoothing import TemporalSmoother
from backend.database.db import get_vocabulary_by_class_id, log_prediction

router = APIRouter(tags=["Real-Time Recognition"])

class FramePredictionRequest(BaseModel):
    image_base64: Optional[str] = None
    landmarks: Optional[Dict[str, Any]] = None
    session_mode: Optional[str] = "live"

@router.post("/predict/frame")
def predict_single_frame(payload: FramePredictionRequest):
    """
    Evaluates a single frame or landmark set.
    """
    engine = SignInferenceEngine.get_instance()
    detector = HandDetector(static_image_mode=True)
    t0 = time.time()
    
    if payload.landmarks:
        left_hand = payload.landmarks.get("left_hand", [])
        right_hand = payload.landmarks.get("right_hand", [])
        features = LandmarkFeatureExtractor.extract_frame_features(left_hand, right_hand)
    elif payload.image_base64:
        frame = decode_base64_frame(payload.image_base64)
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid base64 image data.")
        result = detector.process_frame(frame)
        features = result["features"]
    else:
        raise HTTPException(status_code=400, detail="Must provide either image_base64 or landmarks payload.")

    # Create sequence replication for single frame evaluation
    seq = np.tile(features, (SEQUENCE_LENGTH, 1)) # (30, 126)
    pred = engine.predict(seq)
    
    vocab_entry = get_vocabulary_by_class_id(pred["class_id"])
    word = vocab_entry["word"] if vocab_entry else f"SIGN_{pred['class_id']}"
    inference_time = (time.time() - t0) * 1000

    log_prediction(word, pred["confidence"], payload.session_mode or "live", inference_time)

    return {
        "word": word,
        "class_id": pred["class_id"],
        "confidence": round(pred["confidence"], 4),
        "inference_time_ms": round(inference_time, 2),
        "top_candidates": [
            {
                "word": (get_vocabulary_by_class_id(c["class_id"]) or {}).get("word", f"SIGN_{c['class_id']}"),
                "confidence": round(c["confidence"], 4)
            }
            for c in pred["top_candidates"]
        ]
    }

@router.websocket("/predict/live")
@router.websocket("/ws/live")
async def live_websocket_stream(websocket: WebSocket):
    """
    Duplex WebSocket connection for real-time video landmark streaming and live gesture translation.
    """
    await websocket.accept()
    engine = SignInferenceEngine.get_instance()
    detector = HandDetector(static_image_mode=False)
    smoother = TemporalSmoother()
    sequence_buffer: deque = deque(maxlen=SEQUENCE_LENGTH)
    
    # Pre-fill sequence buffer with neutral zeros
    for _ in range(SEQUENCE_LENGTH):
        sequence_buffer.append(np.zeros(FEATURE_DIM, dtype=np.float32))

    try:
        while True:
            data_str = await websocket.receive_text()
            t0 = time.time()
            
            try:
                msg = json.loads(data_str)
            except Exception:
                continue

            msg_type = msg.get("type", "frame")

            if msg_type == "clear":
                smoother.clear_sentence()
                await websocket.send_json({
                    "type": "cleared",
                    "sentence": ""
                })
                continue
                
            if msg_type == "reset":
                smoother.reset()
                sequence_buffer.clear()
                for _ in range(SEQUENCE_LENGTH):
                    sequence_buffer.append(np.zeros(FEATURE_DIM, dtype=np.float32))
                await websocket.send_json({
                    "type": "reset",
                    "sentence": ""
                })
                continue

            landmarks_out = {"left_hand": [], "right_hand": []}
            hands_count = 0

            # 1. Feature extraction from frame or landmarks
            if msg_type == "landmarks" and "data" in msg:
                raw_lms = msg["data"]
                lh = raw_lms.get("left_hand", [])
                rh = raw_lms.get("right_hand", [])
                features = LandmarkFeatureExtractor.extract_frame_features(lh, rh)
                landmarks_out = {"left_hand": lh, "right_hand": rh}
                hands_count = (1 if lh else 0) + (1 if rh else 0)
            elif "image" in msg or "data" in msg:
                img_data = msg.get("image") or msg.get("data")
                frame = decode_base64_frame(img_data)
                if frame is not None:
                    res = detector.process_frame(frame)
                    features = res["features"]
                    landmarks_out = res["landmarks_raw"]
                    hands_count = res["hands_detected_count"]
                else:
                    features = np.zeros(FEATURE_DIM, dtype=np.float32)
            else:
                features = np.zeros(FEATURE_DIM, dtype=np.float32)

            sequence_buffer.append(features)

            # 2. Sequence Neural Network Prediction
            seq_array = np.array(sequence_buffer, dtype=np.float32) # (30, 126)
            
            # Check if any hands active
            if np.all(features == 0.0) and hands_count == 0:
                raw_word = "NONE"
                raw_confidence = 0.1
                top_candidates_formatted = []
            else:
                pred = engine.predict(seq_array)
                vocab_item = get_vocabulary_by_class_id(pred["class_id"])
                raw_word = vocab_item["word"] if vocab_item else f"SIGN_{pred['class_id']}"
                raw_confidence = pred["confidence"]
                top_candidates_formatted = [
                    {
                        "word": (get_vocabulary_by_class_id(c["class_id"]) or {}).get("word", f"SIGN_{c['class_id']}"),
                        "confidence": round(c["confidence"], 3)
                    }
                    for c in pred["top_candidates"][:3]
                ]

            # 3. Temporal Smoothing & Sentence Assembly
            smooth_state = smoother.update(raw_word, raw_confidence)
            inference_ms = round((time.time() - t0) * 1000, 1)

            # 4. Stream response back to client
            response_payload = {
                "type": "prediction",
                "word": smooth_state["display_word"],
                "confidence": smooth_state["confidence"],
                "status": smooth_state["status"],
                "message": smooth_state["message"],
                "is_new_word": smooth_state["is_new_word"],
                "sentence": smooth_state["current_sentence"],
                "top_candidates": top_candidates_formatted,
                "hands_detected": hands_count,
                "landmarks": landmarks_out,
                "inference_time_ms": inference_ms
            }

            await websocket.send_json(response_payload)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"[WebSocket Error] {e}")
    finally:
        detector.close()
