"""
SignBridge Vercel Serverless Function Entry Point
"""
import sys
import os
import traceback
from pathlib import Path

# Add project root and backend to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "backend"))

try:
    from backend.main import app
except Exception as e:
    import fastapi
    from fastapi.responses import HTMLResponse
    app = fastapi.FastAPI(title="SignBridge Fallback Handler")
    err_trace = traceback.format_exc()
    print("[Vercel Startup Error]", err_trace)
    
    @app.get("/{full_path:path}")
    def fallback_handler(full_path: str):
        return HTMLResponse(f"<h2>SignBridge System Initializing</h2><pre>{err_trace}</pre>")

handler = app
