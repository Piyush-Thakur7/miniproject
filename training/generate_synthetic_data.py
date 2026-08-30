"""
SignBridge High-Fidelity Dataset Generator (Vectorized NumPy)
Generates multi-user 3D landmark sequence data for 500+ sign classes in seconds.
"""
import numpy as np
from typing import Tuple
from backend.config import SEQUENCE_LENGTH, FEATURE_DIM, TOTAL_CLASSES, DATA_DIR

def build_dataset(samples_per_class: int = 6, num_users: int = 4) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Vectorized dataset generator for 500+ classes.
    """
    total_samples = TOTAL_CLASSES * samples_per_class
    print(f"Generating vectorized dataset: {total_samples} samples across {TOTAL_CLASSES} classes...", flush=True)

    labels = np.repeat(np.arange(TOTAL_CLASSES), samples_per_class)
    user_ids = np.tile(np.arange(samples_per_class) % num_users, TOTAL_CLASSES)

    t = np.linspace(0, np.pi * 2, SEQUENCE_LENGTH, dtype=np.float32) # (30,)

    # Class & user harmonic frequencies
    freq1 = (1.0 + (labels % 7) * 0.3).astype(np.float32)[:, None, None] # (N, 1, 1)
    phase = ((labels * 0.15) + (user_ids * 0.05)).astype(np.float32)[:, None, None]
    amplitude = (0.5 + 0.3 * np.sin(labels * 0.2)).astype(np.float32)[:, None, None]

    t_grid = t[None, :, None] # (1, 30, 1)
    feat_indices = np.arange(FEATURE_DIM, dtype=np.float32)[None, None, :] # (1, 1, 126)

    # Vectorized continuous trajectory tensor calculation
    harmonics = np.sin(freq1 * t_grid + phase + feat_indices * 0.1) * amplitude
    noise = np.random.normal(0, 0.02, size=(total_samples, SEQUENCE_LENGTH, FEATURE_DIM)).astype(np.float32)
    sequences = harmonics + noise

    # Centering & Standardization per sample
    mean = np.mean(sequences, axis=1, keepdims=True)
    std = np.std(sequences, axis=1, keepdims=True) + 1e-5
    sequences = (sequences - mean) / std

    print(f"Vectorized dataset ready: Shape {sequences.shape} (N={total_samples})", flush=True)
    return sequences.astype(np.float32), labels.astype(np.int64), user_ids.astype(np.int32)

if __name__ == "__main__":
    X, y, users = build_dataset(samples_per_class=6, num_users=4)
    out_file = DATA_DIR / "dataset_500_classes.npz"
    np.savez_compressed(out_file, sequences=X, labels=y, user_ids=users)
    print(f"Saved dataset artifact to: {out_file}", flush=True)
