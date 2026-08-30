"""
SignBridge: Desktop OpenCV Application for Local VS Code Demonstration
Runs native computer vision with zero latency, real-time skeleton overlay, and TTS audio.
"""
import sys
import os
import time
import cv2
import numpy as np
from collections import deque

# Ensure UTF-8 console output
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from backend.config import SEQUENCE_LENGTH, FEATURE_DIM
from backend.models.sign_model import SignInferenceEngine
from backend.vision.hand_detector import HandDetector
from backend.utils.smoothing import TemporalSmoother
from backend.database.db import init_db, get_vocabulary_by_class_id

def speak_async(text):
    """Speaks text asynchronously using Windows SAPI voice."""
    if not text or sys.platform != "win32":
        return
    import threading
    def _speak():
        try:
            import win32com.client
            speaker = win32com.client.Dispatch("SAPI.SpVoice")
            speaker.Speak(text)
        except Exception:
            try:
                import subprocess
                clean = text.replace('"', '')
                subprocess.Popen(["powershell", "-Command", f'Add-Type –AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak("{clean}")'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            except Exception:
                pass
    threading.Thread(target=_speak, daemon=True).start()

def draw_hud(frame, smooth_state, top_candidates, fps, hands_count):
    """Renders a modern Cyber-HUD over the OpenCV frame."""
    h, w, _ = frame.shape
    
    # 1. Top Header Ribbon
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 65), (10, 13, 20), -1)
    cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)
    
    cv2.putText(frame, "SignBridge AI [LIVE STUDIO]", (20, 32), cv2.FONT_HERSHEY_DUPLEX, 0.75, (56, 189, 248), 2)
    cv2.putText(frame, f"FPS: {fps:.0f} | Hands: {hands_count} | 500+ Vocabulary Active", (20, 52), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (148, 163, 184), 1)

    # 2. Main Recognized Sign Box (Top Right)
    box_w, box_h = 320, 140
    box_x = w - box_w - 20
    box_y = 75
    
    overlay = frame.copy()
    cv2.rectangle(overlay, (box_x, box_y), (box_x + box_w, box_y + box_h), (15, 23, 42), -1)
    cv2.addWeighted(overlay, 0.88, frame, 0.12, 0, frame)
    cv2.rectangle(frame, (box_x, box_y), (box_x + box_w, box_y + box_h), (56, 189, 248), 1)

    word = smooth_state.get("display_word", "WAITING...")
    conf = smooth_state.get("confidence", 0.0)
    conf_pct = int(conf * 100)
    
    cv2.putText(frame, "RECOGNIZED SIGN", (box_x + 15, box_y + 25), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (148, 163, 184), 1)
    
    color = (56, 189, 248) if conf >= 0.65 else ((245, 158, 11) if conf >= 0.45 else (244, 63, 94))
    cv2.putText(frame, str(word)[:14], (box_x + 15, box_y + 70), cv2.FONT_HERSHEY_DUPLEX, 1.1, color, 2)

    # Confidence Bar
    cv2.rectangle(frame, (box_x + 15, box_y + 90), (box_x + box_w - 15, box_y + 102), (30, 41, 59), -1)
    bar_width = int((box_w - 30) * (conf_pct / 100.0))
    if bar_width > 0:
        cv2.rectangle(frame, (box_x + 15, box_y + 90), (box_x + 15 + bar_width, box_y + 102), (52, 211, 153), -1)
    cv2.putText(frame, f"Accuracy: {conf_pct}%", (box_x + 15, box_y + 122), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)

    # 3. Bottom Sentence Transcript Panel
    bottom_h = 75
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, h - bottom_h), (w, h), (10, 13, 20), -1)
    cv2.addWeighted(overlay, 0.90, frame, 0.10, 0, frame)
    cv2.line(frame, (0, h - bottom_h), (w, h - bottom_h), (56, 189, 248), 1)

    sentence = smooth_state.get("current_sentence", "") or "Perform signs to construct sentence transcript..."
    cv2.putText(frame, "TRANSLATED SENTENCE (Press 'S' to Speak | 'C' to Clear | 'Q' to Quit):", (20, h - bottom_h + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (56, 189, 248), 1)
    cv2.putText(frame, sentence[:75], (20, h - 20), cv2.FONT_HERSHEY_DUPLEX, 0.65, (255, 255, 255), 2)

    return frame

def main():
    print("=" * 70)
    print(" [*] SignBridge Desktop Studio (OpenCV Native Mode)")
    print("=" * 70)
    
    init_db()
    print("Initializing PyTorch Sequence Model & MediaPipe Detector...")
    engine = SignInferenceEngine.get_instance()
    detector = HandDetector(static_image_mode=False)
    smoother = TemporalSmoother()

    sequence_buffer = deque(maxlen=SEQUENCE_LENGTH)
    for _ in range(SEQUENCE_LENGTH):
        sequence_buffer.append(np.zeros(FEATURE_DIM, dtype=np.float32))

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[-] Error: Could not access webcam. Trying camera index 1...")
        cap = cv2.VideoCapture(1)
        if not cap.isOpened():
            print("[-] No camera device available. Please plug in a webcam.")
            return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    print("[+] Camera stream active! Press 'Q' on the video window to quit.")
    
    prev_time = time.time()
    last_spoken_word = None

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Flip horizontally for natural mirror feel
        frame = cv2.flip(frame, 1)
        curr_time = time.time()
        fps = 1.0 / max(curr_time - prev_time, 0.001)
        prev_time = curr_time

        # 1. MediaPipe Hand Detection & Skeleton Draw
        res = detector.process_frame(frame)
        features = res["features"]
        hands_count = res["hands_detected_count"]
        frame = res["annotated_frame"]

        sequence_buffer.append(features)

        # 2. PyTorch Sequence Prediction
        if hands_count == 0 and np.all(features == 0.0):
            raw_word = "NONE"
            raw_confidence = 0.1
            top_candidates = []
        else:
            seq_array = np.array(sequence_buffer, dtype=np.float32)
            pred = engine.predict(seq_array)
            vocab_item = get_vocabulary_by_class_id(pred["class_id"])
            raw_word = vocab_item["word"] if vocab_item else f"SIGN_{pred['class_id']}"
            raw_confidence = pred["confidence"]
            top_candidates = pred["top_candidates"]

        # 3. Temporal Debouncing
        smooth_state = smoother.update(raw_word, raw_confidence)

        # Auto-speech when new word committed
        if smooth_state.get("is_new_word") and smooth_state["display_word"] != last_spoken_word:
            last_spoken_word = smooth_state["display_word"]
            speak_async(last_spoken_word)

        # 4. Render Sleek Cyber HUD
        frame = draw_hud(frame, smooth_state, top_candidates, fps, hands_count)

        cv2.imshow("SignBridge AI — Gesture Recognition Studio", frame)

        # Keyboard Controls
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q') or key == 27: # Q or ESC
            break
        elif key == ord('c'):
            smoother.clear_sentence()
        elif key == ord('s'):
            sentence = smooth_state.get("current_sentence", "")
            if sentence:
                speak_async(sentence)

    cap.release()
    cv2.destroyAllWindows()
    detector.close()
    print("[*] SignBridge Studio closed gracefully.")

if __name__ == "__main__":
    main()
