"""
SignBridge Vercel Serverless Entrypoint
"""
import sys
from pathlib import Path
from fastapi import FastAPI

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.main import app as main_app

# Top-level FastAPI instance for Vercel CLI
app: FastAPI = main_app
