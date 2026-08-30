# ==============================================================================
# SignBridge Production Dockerfile
# Multi-stage containerized build for cloud deployment (GCP Cloud Run / Render / AWS)
# ==============================================================================
FROM python:3.11-slim as base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install native computer vision system dependencies (libGL, libglib, ffmpeg)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Seed SQLite database
RUN python -m backend.database.seed_vocabulary

# Expose HTTP / WebSocket port
EXPOSE 8000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Launch FastAPI Uvicorn Server
CMD ["python", "run.py"]
