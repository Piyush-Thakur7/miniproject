"""
SignBridge Single-Command Application Launcher
Initializes SQLite database, pre-warms ML neural inference, and starts Uvicorn web server.
"""
import sys
import uvicorn
from backend.config import HOST, PORT, DEBUG
from backend.database.db import init_db
from backend.database.seed_vocabulary import seed_database
from backend.models.sign_model import SignInferenceEngine

def main():
    print("=" * 70)
    print(" 🤟 SignBridge: AI Sign Language Recognition & Text Conversion")
    print("=" * 70)
    
    # 1. Initialize SQLite Database
    init_db()
    
    # 2. Pre-seed vocabulary if necessary
    from backend.database.db import get_stats
    stats = get_stats()
    if stats["total_words"] < 500:
        print("Seeding 500+ sign vocabulary database...")
        seed_database()
        
    # 3. Pre-warm Deep Learning Inference Model
    print("Initializing PyTorch Sequence Inference Engine...")
    engine = SignInferenceEngine.get_instance()
    print(f"Neural Model Active on: [{engine.device.upper()}] (Total Classes: 500)")
    
    print("\nAvailable Web Endpoints:")
    print(f"  ➜ Landing Page:       http://localhost:{PORT}/")
    print(f"  ➜ Live Webcam Studio: http://localhost:{PORT}/live")
    print(f"  ➜ Upload Video:       http://localhost:{PORT}/upload")
    print(f"  ➜ Meeting Mode:       http://localhost:{PORT}/meeting")
    print(f"  ➜ 500+ Dictionary:    http://localhost:{PORT}/vocab")
    print(f"  ➜ Swagger API Docs:   http://localhost:{PORT}/docs")
    print(f"  ➜ WebSocket Stream:   ws://localhost:{PORT}/ws/live")
    print("=" * 70)
    
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=DEBUG)

if __name__ == "__main__":
    main()
