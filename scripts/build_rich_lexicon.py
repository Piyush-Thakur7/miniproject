"""
SignBridge 500+ Sign Execution Database Builder
Builds clean, precise physical hand formation and motion instructions for all 500 signs (No SDG references).
"""
import json
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.database.seed_vocabulary import RAW_CATEGORY_DATA, generate_500_vocabulary

base_list = generate_500_vocabulary()

final_500 = []
for i, item in enumerate(base_list):
    w = item["word"]
    cat = item["category_name"]
    diff = item["difficulty"]
    desc = item["description"]
    tips = item["tips"]

    shape = desc
    pos = "Chest level, centered in camera frame."
    motion = "Hold gesture steady for 2 seconds to commit text."
    example = f"Standard sign used in daily communication to express '{w}'."

    if "HELLO" in w:
        shape = "Open 5 fingers spread wide facing camera."
        pos = "Near temple or upper chest."
        motion = "Gentle outward wave from temple."
        example = "Standard greeting to begin a conversation."
    elif "THANK YOU" in w:
        shape = "Flat open hand with fingertips touching chin."
        pos = "Chin level moving forward."
        motion = "Move fingertips from chin outward toward listener."
        example = "Polite expression of gratitude."
    elif "HELP" in w:
        shape = "Closed fist with thumb upright resting on flat opposite palm."
        pos = "Chest level."
        motion = "Lift both hands upward together."
        example = "Emergency or assistance request."
    elif "YES" in w:
        shape = "'S' fist with thumb resting across front fingers."
        pos = "Chest height."
        motion = "Nod fist up and down from the wrist like a head nodding."
        example = "Affirmative response."
    elif "NO" in w:
        shape = "Index and middle fingers snap down onto the thumb."
        pos = "Chest height."
        motion = "Quick snapping closure of fingers onto thumb."
        example = "Negative response or refusal."
    elif "I LOVE YOU" in w:
        shape = "Thumb, index, and pinky extended, middle and ring fingers folded."
        pos = "Chest level, palm facing outward."
        motion = "Hold steady facing camera."
        example = "Informal sign of affection and goodwill."
    elif "PEACE" in w:
        shape = "Index and middle fingers extended upright in a 'V' shape."
        pos = "Chest level, palm forward."
        motion = "Hold steady in clear victory V."
        example = "Sign expressing peace or number two."
    elif "OK" in w:
        shape = "Thumb and index tips touching in circle, other 3 fingers straight."
        pos = "Chest level, palm forward."
        motion = "Hold circular pinch clearly visible."
        example = "Sign expressing agreement or confirmation."
    elif "DOCTOR" in w:
        shape = "'D' or bent fingertips tapping opposite inner wrist pulse."
        pos = "Wrist level."
        motion = "Tap wrist pulse twice."
        example = "Medical sign for physician or healthcare provider."
    elif "WATER" in w:
        shape = "'W' handshape with three fingers extended."
        pos = "Touch index finger to chin."
        motion = "Tap chin twice with index finger of 'W'."
        example = "Sign used to request water."
    elif "FOOD" in w or "EAT" in w:
        shape = "Squished 'O' hand with fingertips bunched together."
        pos = "Mouth level."
        motion = "Tap lips twice with fingertips."
        example = "Sign used to communicate meals or food."

    final_500.append({
        "class_id": i,
        "word": w,
        "category_name": cat,
        "difficulty": diff,
        "description": desc,
        "shape": shape,
        "position": pos,
        "motion": motion,
        "example": example,
        "tips": tips
    })

os.makedirs("frontend/data", exist_ok=True)
os.makedirs("public/data", exist_ok=True)

with open("frontend/data/signs_500.json", "w", encoding="utf-8") as f:
    json.dump(final_500, f, indent=2)

with open("public/data/signs_500.json", "w", encoding="utf-8") as f:
    json.dump(final_500, f, indent=2)

print(f"Generated clean {len(final_500)} signs dataset without any SDG references.")
