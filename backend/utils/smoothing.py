"""
SignBridge Temporal Smoothing, Debouncing & Sentence Synthesizer Module
Prevents duplicate frame chatter, filters low confidence predictions, and builds natural sentences.
"""
from collections import deque
from typing import List, Dict, Any, Optional, Tuple
from backend.config import (
    CONFIDENCE_THRESHOLD, UNKNOWN_SIGN_THRESHOLD, 
    SMOOTHING_BUFFER_SIZE, CONSECUTIVE_FRAMES_TRIGGER
)

class TemporalSmoother:
    """
    Temporal debouncer & hysteresis state machine for real-time sign recognition.
    """
    def __init__(
        self,
        buffer_size: int = SMOOTHING_BUFFER_SIZE,
        consecutive_trigger: int = CONSECUTIVE_FRAMES_TRIGGER,
        confidence_threshold: float = CONFIDENCE_THRESHOLD,
        unknown_threshold: float = UNKNOWN_SIGN_THRESHOLD
    ):
        self.buffer_size = buffer_size
        self.consecutive_trigger = consecutive_trigger
        self.confidence_threshold = confidence_threshold
        self.unknown_threshold = unknown_threshold
        
        self.prediction_buffer: deque = deque(maxlen=buffer_size)
        self.confidence_buffer: deque = deque(maxlen=buffer_size)
        self.last_committed_word: Optional[str] = None
        self.sentence_words: List[str] = []
        self.consecutive_count: int = 0
        self.current_candidate: Optional[str] = None

    def update(self, word: str, confidence: float) -> Dict[str, Any]:
        """
        Ingests a frame prediction and returns smoothed output state.
        """
        self.prediction_buffer.append(word)
        self.confidence_buffer.append(confidence)
        
        # 1. Check for Unknown Sign condition
        if confidence < self.unknown_threshold or word.upper() in ("UNKNOWN", "UNKNOWN SIGN", "NONE", "BACKGROUND"):
            self.consecutive_count = 0
            self.current_candidate = None
            return {
                "display_word": "UNKNOWN SIGN",
                "status": "uncertain",
                "message": "Sign not recognized. Please position hands clearly.",
                "confidence": round(confidence, 2),
                "is_new_word": False,
                "current_sentence": self.get_sentence()
            }

        # 2. Check if confidence meets standard threshold
        if confidence < self.confidence_threshold:
            return {
                "display_word": word,
                "status": "low_confidence",
                "message": "Hold sign steadily...",
                "confidence": round(confidence, 2),
                "is_new_word": False,
                "current_sentence": self.get_sentence()
            }

        # 3. Temporal Debounce & Hysteresis Counter
        if word == self.current_candidate:
            self.consecutive_count += 1
        else:
            self.current_candidate = word
            self.consecutive_count = 1

        is_new_word = False
        
        # 4. Commit Word if held for sufficient consecutive frames
        if self.consecutive_count >= self.consecutive_trigger:
            if word != self.last_committed_word:
                self.last_committed_word = word
                self.sentence_words.append(word)
                is_new_word = True

        return {
            "display_word": word,
            "status": "recognized",
            "message": "Sign recognized",
            "confidence": round(confidence, 2),
            "is_new_word": is_new_word,
            "current_sentence": self.get_sentence()
        }

    def get_sentence(self) -> str:
        """Returns the assembled sentence with proper casing and spacing."""
        if not self.sentence_words:
            return ""
        
        # Assemble words
        raw_text = " ".join(self.sentence_words)
        # Proper Capitalization & basic punctuation
        formatted = raw_text.capitalize()
        if not formatted.endswith((".", "?", "!")):
            # If starts with question words, add question mark
            first_word = self.sentence_words[0].upper()
            if first_word in ("WHAT", "WHERE", "WHEN", "WHY", "WHO", "HOW", "WHICH", "CAN", "ARE", "DO"):
                formatted += "?"
            else:
                formatted += "."
        return formatted

    def clear_sentence(self) -> None:
        """Clears accumulated sentence."""
        self.sentence_words.clear()
        self.last_committed_word = None
        self.consecutive_count = 0
        self.current_candidate = None

    def reset(self) -> None:
        """Resets all buffers and state."""
        self.prediction_buffer.clear()
        self.confidence_buffer.clear()
        self.clear_sentence()
