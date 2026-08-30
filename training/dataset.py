"""
SignBridge Dataset Module (Tensor Native)
Provides high-speed batch dataset loading.
"""
import numpy as np
from typing import Tuple, Optional, Any

try:
    import torch
    from torch.utils.data import Dataset, DataLoader
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    Dataset = object
    DataLoader = object

from backend.config import SEQUENCE_LENGTH, FEATURE_DIM, TOTAL_CLASSES

class SignSequenceDataset(Dataset):
    """
    Tensor-native Dataset for Sign Language Landmark Sequences.
    """
    def __init__(
        self,
        sequences: np.ndarray,
        labels: np.ndarray,
        user_ids: Optional[np.ndarray] = None,
        augment: bool = True
    ):
        if TORCH_AVAILABLE:
            self.sequences = torch.from_numpy(sequences).float()
            self.labels = torch.from_numpy(labels).long()
        else:
            self.sequences = sequences.astype(np.float32)
            self.labels = labels.astype(np.int64)
        self.augment = augment

    def __len__(self) -> int:
        return len(self.sequences)

    def __getitem__(self, idx: int) -> Tuple[Any, Any]:
        seq = self.sequences[idx]
        label = self.labels[idx]
        return seq, label
