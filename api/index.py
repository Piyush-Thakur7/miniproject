"""
SignBridge Vercel Serverless Function Entry Point
"""
import sys
import os
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.main import app

# Vercel serverless ASGI handler
app = app
