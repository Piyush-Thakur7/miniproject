"""
SignBridge: AI-Based Sign Language Recognition and Real-Time Text Conversion System
Main Application Entrypoint (FastAPI)
"""
import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response

from backend.config import FRONTEND_DIR, BASE_DIR, IS_SERVERLESS
from backend.database.db import init_db
from backend.routes.health import router as health_router
from backend.routes.vocabulary import router as vocabulary_router
from backend.routes.live import router as live_router
from backend.routes.video import router as video_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for initialization."""
    if not IS_SERVERLESS:
        try:
            init_db()
            from backend.database.db import get_stats
            stats = get_stats()
            if stats.get("total_words", 0) < 500:
                from backend.database.seed_vocabulary import seed_database
                seed_database()
        except Exception as e:
            print(f"[Lifespan Notice] {e}")
            
        try:
            from backend.models.sign_model import SignInferenceEngine
            engine = SignInferenceEngine.get_instance()
            print(f"SignBridge Ready on {engine.device.upper()} with 500+ sign vocabulary!")
        except Exception as e:
            print(f"[Model Prewarm Notice] {e}")
            
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

def get_html_content(filename: str) -> str:
    """Reads HTML file safely across local and Vercel serverless directories."""
    paths_to_try = [
        FRONTEND_DIR / filename,
        BASE_DIR / "frontend" / filename,
        Path.cwd() / "frontend" / filename,
        Path("/var/task/frontend") / filename
    ]
    for p in paths_to_try:
        if p.exists():
            return p.read_text(encoding="utf-8")
    return f"<h1>SignBridge AI</h1><p>File {filename} is loading...</p>"

# Static file serving with strict MIME types for Vercel / Cloud Run
@app.get("/static/{file_path:path}")
@app.get("/frontend/{file_path:path}")
def serve_static_asset(file_path: str):
    paths_to_try = [
        FRONTEND_DIR / file_path,
        BASE_DIR / "frontend" / file_path,
        Path.cwd() / "frontend" / file_path,
        Path("/var/task/frontend") / file_path
    ]
    target = None
    for p in paths_to_try:
        if p.exists():
            target = p
            break
            
    if not target:
        raise HTTPException(status_code=404, detail=f"Static asset {file_path} not found")
        
    media_type = "text/plain"
    if file_path.endswith(".css"):
        media_type = "text/css"
    elif file_path.endswith(".js"):
        media_type = "application/javascript"
    elif file_path.endswith(".png"):
        media_type = "image/png"
    elif file_path.endswith((".jpg", ".jpeg")):
        media_type = "image/jpeg"
    elif file_path.endswith(".svg"):
        media_type = "image/svg+xml"
        
    with open(target, "rb") as f:
        return Response(content=f.read(), media_type=media_type)

# Web Application Page Routes
@app.get("/")
def serve_index_page():
    return HTMLResponse(content=get_html_content("index.html"))

@app.get("/live")
def serve_live_page():
    return HTMLResponse(content=get_html_content("live.html"))

@app.get("/upload")
def serve_upload_page():
    return HTMLResponse(content=get_html_content("upload.html"))

@app.get("/meeting")
def serve_meeting_page():
    return HTMLResponse(content=get_html_content("meeting.html"))

@app.get("/dictionary")
@app.get("/vocab")
@app.get("/explore")
def serve_vocabulary_page():
    return HTMLResponse(content=get_html_content("vocabulary.html"))

if __name__ == "__main__":
    import uvicorn
    from backend.config import HOST, PORT
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
