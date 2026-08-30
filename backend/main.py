"""
SignBridge: AI-Based Sign Language Recognition and Real-Time Text Conversion System
Main Application Entrypoint (FastAPI)
"""
import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response

# Dynamic root discovery for local and Vercel serverless environments
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
if not FRONTEND_DIR.exists():
    FRONTEND_DIR = Path.cwd() / "frontend"

from backend.database.db import init_db
from backend.database.seed_vocabulary import seed_database
from backend.models.sign_model import SignInferenceEngine
from backend.routes.health import router as health_router
from backend.routes.vocabulary import router as vocabulary_router
from backend.routes.live import router as live_router
from backend.routes.video import router as video_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for initialization and shutdown."""
    init_db()
    from backend.database.db import get_stats
    stats = get_stats()
    if stats["total_words"] < 500:
        seed_database()
        
    engine = SignInferenceEngine.get_instance()
    print(f"SignBridge Ready on {engine.device.upper()} with 500+ sign vocabulary!")
    yield

app = FastAPI(
    title="SignBridge AI",
    description="Production AI Sign Language Recognition & Real-Time Text Conversion System",
    version="1.0.0",
    lifespan=lifespan
)

# Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health_router)
app.include_router(health_router, prefix="/api")

app.include_router(vocabulary_router)
app.include_router(vocabulary_router, prefix="/api")

app.include_router(live_router)
app.include_router(live_router, prefix="/api")

app.include_router(video_router)
app.include_router(video_router, prefix="/api")

# Static file serving with strict MIME types for Vercel / Cloud Run
@app.get("/static/{file_path:path}")
@app.get("/frontend/{file_path:path}")
def serve_static_asset(file_path: str):
    target = FRONTEND_DIR / file_path
    if not target.exists():
        raise HTTPException(status_code=404, detail=f"Static asset {file_path} not found")
        
    media_type = "text/plain"
    if file_path.endswith(".css"):
        media_type = "text/css"
    elif file_path.endswith(".js"):
        media_type = "application/javascript"
    elif file_path.endswith(".png"):
        media_type = "image/png"
    elif file_path.endswith(".jpg") or file_path.endswith(".jpeg"):
        media_type = "image/jpeg"
    elif file_path.endswith(".svg"):
        media_type = "image/svg+xml"
        
    with open(target, "rb") as f:
        return Response(content=f.read(), media_type=media_type)

# Web Application Page Routes
@app.get("/")
def serve_index_page():
    return FileResponse(FRONTEND_DIR / "index.html", media_type="text/html")

@app.get("/live")
def serve_live_page():
    return FileResponse(FRONTEND_DIR / "live.html", media_type="text/html")

@app.get("/upload")
def serve_upload_page():
    return FileResponse(FRONTEND_DIR / "upload.html", media_type="text/html")

@app.get("/meeting")
def serve_meeting_page():
    return FileResponse(FRONTEND_DIR / "meeting.html", media_type="text/html")

@app.get("/dictionary")
@app.get("/vocab")
@app.get("/explore")
def serve_vocabulary_page():
    return FileResponse(FRONTEND_DIR / "vocabulary.html", media_type="text/html")

if __name__ == "__main__":
    import uvicorn
    from backend.config import HOST, PORT
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
