"""
SignBridge AI: Standalone Python Desktop Visualizer & Voice Synthesizer
Run this file directly in VS Code: python main_gui_app.py
"""
import sys
import os
import time
import math
import threading
import subprocess
import cv2
import numpy as np

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Optional imports for deep learning
from backend.config import SEQUENCE_LENGTH, FEATURE_DIM
from backend.models.sign_model import SignInferenceEngine
from backend.vision.hand_detector import HandDetector
from backend.vision.feature_extractor import LandmarkFeatureExtractor
from backend.utils.smoothing import TemporalSmoother
from backend.database.db import init_db, get_vocabulary_by_class_id


class SpeechEngine:
    """Thread-safe, non-blocking offline Text-to-Speech engine."""
    def __init__(self):
        self.lock = threading.Lock()
        self.last_spoken = ""
        self.last_spoken_time = 0
        self.is_speaking = False

    def speak(self, text, force=False):
        now = time.time()
        # Prevent repeating same word within 2.0 seconds unless forced
        if not force and text == self.last_spoken and (now - self.last_spoken_time < 2.5):
            return

        self.last_spoken = text
        self.last_spoken_time = now

        def _worker():
            with self.lock:
                self.is_speaking = True
                try:
                    # Windows Native SAPI (Zero dependency, instant response)
                    import win32com.client
                    speaker = win32com.client.Dispatch("SAPI.SpVoice")
                    speaker.Rate = 1 # Slightly faster natural speed
                    speaker.Speak(text)
                except Exception:
                    try:
                        # PowerShell System.Speech fallback
                        clean_text = text.replace('"', '').replace("'", "")
                        cmd = f'Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak("{clean_text}")'
                        subprocess.run(["powershell", "-Command", cmd], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    except Exception as e:
                        print(f"[TTS Error] {e}")
                finally:
                    self.is_speaking = False

        thread = threading.Thread(target=_worker, daemon=True)
        thread.start()


class GeometricGestureRecognizer:
    """
    High-accuracy geometric rule engine for core universal sign gestures.
    Works concurrently with the deep neural sequence classifier.
    """
    @staticmethod
    def is_finger_extended(landmarks, tip_idx, pip_idx, mcp_idx=0):
        # Tip is higher (smaller y) than PIP joint for upright hands
        tip = landmarks[tip_idx]
        pip = landmarks[pip_idx]
        return tip.y < pip.y

    @staticmethod
    def get_distance(pt1, pt2):
        return math.sqrt((pt1.x - pt2.x)**2 + (pt1.y - pt2.y)**2 + (pt1.z - pt2.z)**2)

    @classmethod
    def classify_gesture(cls, landmarks):
        if not landmarks or len(landmarks) < 21:
            return None, 0.0

        # Landmarks: 0: Wrist, 4: ThumbTip, 8: IndexTip, 12: MiddleTip, 16: RingTip, 20: PinkyTip
        # Joints: 3: ThumbIP, 6: IndexPIP, 10: MiddlePIP, 14: RingPIP, 18: PinkyPIP
        wrist = landmarks[0]
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        ring_tip = landmarks[16]
        pinky_tip = landmarks[20]

        index_up = landmarks[8].y < landmarks[6].y
        middle_up = landmarks[12].y < landmarks[10].y
        ring_up = landmarks[16].y < landmarks[14].y
        pinky_up = landmarks[20].y < landmarks[18].y

        # Thumb extension (distance from palm)
        thumb_extended = cls.get_distance(thumb_tip, landmarks[2]) > cls.get_distance(landmarks[3], landmarks[2])

        # Distance between index tip and thumb tip
        thumb_index_dist = cls.get_distance(thumb_tip, index_tip)
        thumb_pinky_dist = cls.get_distance(thumb_tip, pinky_tip)

        # 1. Open Palm -> HELLO / GREETINGS
        if index_up and middle_up and ring_up and pinky_up and thumb_extended:
            return "HELLO", 0.95

        # 2. Thumbs Up -> GOOD / YES / AGREE
        if thumb_tip.y < landmarks[3].y and not index_up and not middle_up and not ring_up and not pinky_up:
            return "YES / GOOD", 0.96

        # 3. Thumbs Down -> NO / BAD
        if thumb_tip.y > wrist.y and not index_up and not middle_up and not ring_up and not pinky_up:
            return "NO / BAD", 0.94

        # 4. Victory / Peace -> PEACE / TWO
        if index_up and middle_up and not ring_up and not pinky_up:
            return "PEACE", 0.95

        # 5. Pointing Up -> YOU / ONE / ATTENTION
        if index_up and not middle_up and not ring_up and not pinky_up and not thumb_extended:
            return "YOU / POINT", 0.93

        # 6. I Love You (ASL) -> I LOVE YOU (Thumb, Index, Pinky extended, Middle/Ring closed)
        if thumb_extended and index_up and not middle_up and not ring_up and pinky_up:
            return "I LOVE YOU", 0.98

        # 7. OK Sign -> OKAY / PERFECT (Index and Thumb touching, other 3 extended)
        if thumb_index_dist < 0.06 and middle_up and ring_up and pinky_up:
            return "OKAY / FINE", 0.96

        # 8. Call Me / Shaka -> CALL ME / HELP (Thumb and Pinky extended, others closed)
        if thumb_extended and not index_up and not middle_up and not ring_up and pinky_up:
            return "CALL ME", 0.95

        # 9. Closed Fist -> STOP / WAIT
        if not index_up and not middle_up and not ring_up and not pinky_up and not thumb_extended:
            return "STOP / WAIT", 0.92

        # 10. Rock On -> COOL / ROCK
        if index_up and not middle_up and not ring_up and pinky_up and not thumb_extended:
            return "COOL / ROCK", 0.93

        # 11. Three Fingers -> THREE
        if index_up and middle_up and ring_up and not pinky_up:
            return "THREE", 0.94

        # 12. Four Fingers -> FOUR
        if index_up and middle_up and ring_up and pinky_up and not thumb_extended:
            return "FOUR", 0.94

        return None, 0.0


def draw_studio_ui(frame, display_word, confidence, sentence, fps, hands_count, is_speaking):
    """Draws a high-end, cyberpunk glassmorphic UI overlay on the OpenCV frame."""
    h, w, _ = frame.shape

    # 1. Top Header Glass Bar
    header_h = 70
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, header_h), (10, 13, 20), -1)
    cv2.addWeighted(overlay, 0.88, frame, 0.12, 0, frame)
    cv2.line(frame, (0, header_h), (w, header_h), (56, 189, 248), 1)

    # Title & Subtitle
    cv2.putText(frame, "SignBridge AI", (25, 34), cv2.FONT_HERSHEY_DUPLEX, 0.85, (56, 189, 248), 2)
    cv2.putText(frame, "| Real-Time Sign Language & Voice Synthesizer", (215, 33), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (226, 232, 240), 1)
    
    # Status badges
    voice_color = (52, 211, 153) if is_speaking else (148, 163, 184)
    voice_status = "VOICE: SPEAKING..." if is_speaking else "VOICE: ACTIVE"
    cv2.putText(frame, f"{voice_status}  |  FPS: {fps:.0f}  |  Hands: {hands_count}", (25, 56), cv2.FONT_HERSHEY_SIMPLEX, 0.45, voice_color, 1)

    # 2. Main Live Recognition Card (Top Right)
    box_w, box_h = 360, 150
    box_x = w - box_w - 25
    box_y = header_h + 20

    overlay = frame.copy()
    cv2.rectangle(overlay, (box_x, box_y), (box_x + box_w, box_y + box_h), (15, 23, 42), -1)
    cv2.addWeighted(overlay, 0.90, frame, 0.10, 0, frame)
    
    # Glowing border
    card_border_color = (52, 211, 153) if confidence >= 0.65 else ((56, 189, 248) if confidence >= 0.45 else (148, 163, 184))
    cv2.rectangle(frame, (box_x, box_y), (box_x + box_w, box_y + box_h), card_border_color, 2)

    cv2.putText(frame, "DETECTED SIGN GESTURE", (box_x + 18, box_y + 28), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (148, 163, 184), 1)

    # Word text
    text_color = (255, 255, 255) if confidence >= 0.65 else (203, 213, 225)
    cv2.putText(frame, str(display_word)[:16], (box_x + 18, box_y + 75), cv2.FONT_HERSHEY_DUPLEX, 1.05, text_color, 2)

    # Accuracy Meter
    conf_pct = int(confidence * 100)
    cv2.rectangle(frame, (box_x + 18, box_y + 98), (box_x + box_w - 18, box_y + 110), (30, 41, 59), -1)
    fill_w = int((box_w - 36) * (conf_pct / 100.0))
    if fill_w > 0:
        bar_color = (52, 211, 153) if conf_pct >= 65 else (56, 189, 248)
        cv2.rectangle(frame, (box_x + 18, box_y + 98), (box_x + 18 + fill_w, box_y + 110), bar_color, -1)
    cv2.putText(frame, f"Confidence: {conf_pct}%  (500+ Lexicon)", (box_x + 18, box_y + 132), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (148, 163, 184), 1)

    # 3. Bottom Synthesized Sentence Card
    bottom_h = 90
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, h - bottom_h), (w, h), (10, 13, 20), -1)
    cv2.addWeighted(overlay, 0.92, frame, 0.08, 0, frame)
    cv2.line(frame, (0, h - bottom_h), (w, h - bottom_h), (56, 189, 248), 1)

    # Controls hint
    cv2.putText(frame, "TRANSLATED SENTENCE  |  [S] Read Aloud  |  [C] Clear  |  [Q] Exit", (25, h - bottom_h + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (56, 189, 248), 1)

    # Sentence text
    display_sentence = sentence if sentence else "Perform sign gestures in front of the camera..."
    sent_color = (255, 255, 255) if sentence else (100, 116, 139)
    cv2.putText(frame, display_sentence[:80], (25, h - 25), cv2.FONT_HERSHEY_DUPLEX, 0.75, sent_color, 2)

    return frame


def run_app():
    print("=" * 70)
    print(" [*] SignBridge AI — Standalone Visualizer & Voice Synthesizer")
    print("=" * 70)
    print(" -> Initializing SQLite 500+ Sign Database...")
    init_db()

    print(" -> Loading MediaPipe 3D Landmark Detector...")
    detector = HandDetector(static_image_mode=False)

    print(" -> Loading PyTorch BiGRU Sequence Neural Engine...")
    engine = SignInferenceEngine.get_instance()
    smoother = TemporalSmoother()
    speech = SpeechEngine()

    # Sequence buffer for PyTorch sequence model
    from collections import deque
    seq_buffer = deque(maxlen=SEQUENCE_LENGTH)
    for _ in range(SEQUENCE_LENGTH):
        seq_buffer.append(np.zeros(FEATURE_DIM, dtype=np.float32))

    # Open Camera
    print(" -> Connecting to Camera...")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Camera index 0 unavailable, trying camera index 1...")
        cap = cv2.VideoCapture(1)
        if not cap.isOpened():
            print("[-] No camera found. Please connect a webcam.")
            return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    # Play startup greeting
    speech.speak("Sign Bridge A I online. Ready to translate.", force=True)

    print("\n" + "=" * 70)
    print(" [✓] SignBridge Studio Running!")
    print("  • Show gestures to the camera")
    print("  • The system will detect and SPEAK aloud automatically!")
    print("  • Press 'S' to re-speak the sentence")
    print("  • Press 'C' to clear transcript")
    print("  • Press 'Q' or ESC to exit")
    print("=" * 70 + "\n")

    prev_time = time.time()
    last_committed_word = None
    committed_words = []
    consecutive_match = 0
    candidate_word = None

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Mirror view
        frame = cv2.flip(frame, 1)
        curr_time = time.time()
        fps = 1.0 / max(curr_time - prev_time, 0.001)
        prev_time = curr_time

        # 1. MediaPipe Detection & Skeleton Rendering
        res = detector.process_frame(frame)
        features = res["features"]
        hands_count = res["hands_detected_count"]
        frame = res["annotated_frame"]
        landmarks_raw = res["landmarks_raw"]

        seq_buffer.append(features)

        # 2. Dual Classification (Geometric Rules + PyTorch Sequence Model)
        detected_word = "NO HANDS DETECTED"
        confidence = 0.0

        if hands_count > 0:
            # Check geometric rules on primary hand
            primary_lms = landmarks_raw.get("right_hand") or landmarks_raw.get("left_hand")
            if primary_lms:
                # Convert dict format to object format for geometric rules
                class Point:
                    def __init__(self, d):
                        self.x = d.get("x", 0.0)
                        self.y = d.get("y", 0.0)
                        self.z = d.get("z", 0.0)
                pts_obj = [Point(p) for p in primary_lms]
                geom_word, geom_conf = GeometricGestureRecognizer.classify_gesture(pts_obj)
                if geom_word and geom_conf >= 0.75:
                    detected_word = geom_word
                    confidence = geom_conf

            # If geometric didn't match, run PyTorch 500-class Sequence Model
            if detected_word == "NO HANDS DETECTED" or confidence < 0.70:
                seq_array = np.array(seq_buffer, dtype=np.float32)
                pred = engine.predict(seq_array)
                vocab_item = get_vocabulary_by_class_id(pred["class_id"])
                nn_word = vocab_item["word"] if vocab_item else f"SIGN_{pred['class_id']}"
                if pred["confidence"] >= 0.45:
                    detected_word = nn_word
                    confidence = pred["confidence"]
                else:
                    detected_word = "HOLDING GESTURE..."
                    confidence = pred["confidence"]

        # 3. Debounce & Automatic Voice Output
        if confidence >= 0.65 and detected_word not in ["NO HANDS DETECTED", "HOLDING GESTURE...", "UNKNOWN SIGN"]:
            if detected_word == candidate_word:
                consecutive_match += 1
            else:
                candidate_word = detected_word
                consecutive_match = 1

            # Commit word and trigger VOICE SPEECH
            if consecutive_match >= 3 and detected_word != last_committed_word:
                last_committed_word = detected_word
                clean_word = detected_word.split("/")[0].strip()
                committed_words.append(clean_word)
                
                # Speak the recognized word aloud immediately!
                speech.speak(clean_word)

        # Assemble full English sentence
        sentence_str = ""
        if committed_words:
            sentence_str = " ".join(committed_words).capitalize()
            if not sentence_str.endswith((".", "?")):
                sentence_str += "."

        # 4. Render Studio UI
        frame = draw_studio_ui(frame, detected_word, confidence, sentence_str, fps, hands_count, speech.is_speaking)

        cv2.imshow("SignBridge AI — Real-Time Sign Recognition & Voice Output", frame)

        # Keyboard Controls
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27: # Q or ESC
            break
        elif key == ord('c'): # Clear
            committed_words.clear()
            last_committed_word = None
            consecutive_match = 0
            candidate_word = None
        elif key == ord('s'): # Speak sentence
            if sentence_str:
                speech.speak(sentence_str, force=True)

    cap.release()
    cv2.destroyAllWindows()
    detector.close()
    print("[*] SignBridge Application Closed.")


if __name__ == "__main__":
    run_app()
