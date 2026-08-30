"""
SignBridge Neural Network Training Pipeline
Trains BiGRU sequence network on 500+ sign classes and saves model checkpoint.
"""
import time
import numpy as np
from pathlib import Path
from typing import Dict, Any

try:
    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

from backend.config import (
    TOTAL_CLASSES, HIDDEN_DIM, NUM_LAYERS, 
    FEATURE_DIM, SEQUENCE_LENGTH, MODEL_WEIGHTS_PATH, MODELS_DIR
)
from backend.models.sign_model import SignSequenceClassifier
from training.dataset import SignSequenceDataset
from training.generate_synthetic_data import build_dataset

def train_model(
    epochs: int = 5,
    batch_size: int = 128,
    learning_rate: float = 2e-3,
    samples_per_class: int = 6
) -> Dict[str, Any]:
    """Executes the training loop and exports serialized PyTorch weights."""
    if not TORCH_AVAILABLE:
        print("[Warning] PyTorch not available. Skipping neural network training.", flush=True)
        return {"status": "skipped", "reason": "torch_not_installed"}

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Starting SignBridge Training on device: {device}...", flush=True)

    # 1. Dataset Generation & Splitting
    X, y, users = build_dataset(samples_per_class=samples_per_class, num_users=4)
    
    # User-based splitting (Users 0, 1, 2 -> Train/Val, User 3 -> Unseen Test User)
    train_mask = users != 3
    test_mask = users == 3

    X_train, y_train = X[train_mask], y[train_mask]
    X_test, y_test = X[test_mask], y[test_mask]

    val_split_idx = int(len(X_train) * 0.85)
    train_dataset = SignSequenceDataset(X_train[:val_split_idx], y_train[:val_split_idx])
    val_dataset = SignSequenceDataset(X_train[val_split_idx:], y_train[val_split_idx:])
    test_dataset = SignSequenceDataset(X_test, y_test)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

    # 2. Model Initialization
    model = SignSequenceClassifier(
        input_dim=FEATURE_DIM,
        hidden_dim=HIDDEN_DIM,
        num_layers=NUM_LAYERS,
        num_classes=TOTAL_CLASSES
    ).to(device)

    criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)

    best_val_acc = 0.0
    t_start = time.time()

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss, correct, total = 0.0, 0, 0

        for batch_x, batch_y in train_loader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            optimizer.zero_grad()
            logits = model(batch_x)
            loss = criterion(logits, batch_y)
            loss.backward()
            optimizer.step()

            total_loss += loss.item() * batch_x.size(0)
            preds = torch.argmax(logits, dim=1)
            correct += (preds == batch_y).sum().item()
            total += batch_x.size(0)

        train_acc = correct / max(1, total)

        # Validation
        model.eval()
        val_correct, val_total = 0, 0
        with torch.no_grad():
            for vx, vy in val_loader:
                vx, vy = vx.to(device), vy.to(device)
                v_preds = torch.argmax(model(vx), dim=1)
                val_correct += (v_preds == vy).sum().item()
                val_total += vx.size(0)

        val_acc = val_correct / max(1, val_total)
        print(f"Epoch [{epoch:02d}/{epochs:02d}] | Train Acc: {train_acc*100:.2f}% | Val Acc: {val_acc*100:.2f}%", flush=True)

        if val_acc >= best_val_acc or epoch == epochs:
            best_val_acc = val_acc
            MODELS_DIR.mkdir(parents=True, exist_ok=True)
            torch.save({
                "state_dict": model.state_dict(),
                "epoch": epoch,
                "val_acc": val_acc,
                "total_classes": TOTAL_CLASSES,
                "timestamp": time.time()
            }, MODEL_WEIGHTS_PATH)

    # 4. Final Unseen User Evaluation
    model.eval()
    test_correct, test_total = 0, 0
    with torch.no_grad():
        for tx, ty in test_loader:
            tx, ty = tx.to(device), ty.to(device)
            t_preds = torch.argmax(model(tx), dim=1)
            test_correct += (t_preds == ty).sum().item()
            test_total += tx.size(0)

    unseen_test_acc = test_correct / max(1, test_total)
    total_time = round(time.time() - t_start, 2)

    print(f"\nTraining Complete in {total_time}s!", flush=True)
    print(f"Best Validation Accuracy: {best_val_acc*100:.2f}%", flush=True)
    print(f"Unseen User Test Accuracy: {unseen_test_acc*100:.2f}%", flush=True)
    print(f"Model saved to: {MODEL_WEIGHTS_PATH}", flush=True)

    return {
        "status": "success",
        "best_val_acc": round(best_val_acc, 4),
        "unseen_test_acc": round(unseen_test_acc, 4),
        "total_time_seconds": total_time,
        "weights_path": str(MODEL_WEIGHTS_PATH)
    }

if __name__ == "__main__":
    train_model(epochs=5, batch_size=128, samples_per_class=6)
