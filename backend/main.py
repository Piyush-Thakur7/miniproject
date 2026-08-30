"""
SignBridge: AI-Based Sign Language Recognition and Real-Time Text Conversion System
Main Application Entrypoint (FastAPI)
"""
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.config import FRONTEND_DIR
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
    print("Initializing SignBridge Database & ML Inference Engine...")
    init_db()
    # Pre-seed database if empty
    from backend.database.db import get_stats
    stats = get_stats()
    if stats["total_words"] < 500:
        seed_database()
        
    # Pre-warm model inference engine
    engine = SignInferenceEngine.get_instance()
    print(f"SignBridge Ready on {engine.device.upper()} with 500+ sign vocabulary!")
    yield
    print("SignBridge Server shutting down.")

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

# Static Assets Mounting
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

# Web Application Page Routes
@app.get("/")
def serve_index_page():
    return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/live")
def serve_live_page():
    return FileResponse(FRONTEND_DIR / "live.html")

@app.get("/upload")
def serve_upload_page():
    return FileResponse(FRONTEND_DIR / "upload.html")

@app.get("/meeting")
def serve_meeting_page():
    return FileResponse(FRONTEND_DIR / "meeting.html")

@app.get("/dictionary")
@app.get("/vocab")
@app.get("/explore")
def serve_vocabulary_page():
    return FileResponse(FRONTEND_DIR / "vocabulary.html")

if __name__ == "__main__":
    import uvicorn
    from backend.config import HOST, PORT
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
