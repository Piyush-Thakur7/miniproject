"""
SignBridge Database Management Module (SQLite)
"""
import sqlite3
import json
from typing import List, Dict, Any, Optional
from pathlib import Path
from backend.config import DATABASE_PATH

def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with Row factory enabled."""
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    """Initializes the database schema if tables do not exist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Categories Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                description TEXT,
                icon TEXT DEFAULT 'sparkles'
            )
        """)
        
        # Vocabulary Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS vocabulary (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_id INTEGER UNIQUE NOT NULL,
                word TEXT NOT NULL,
                category_id INTEGER,
                category_name TEXT NOT NULL,
                description TEXT,
                difficulty TEXT DEFAULT 'Beginner',
                tips TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories (id)
            )
        """)
        
        # Prediction & Session Logs Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS prediction_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT NOT NULL,
                confidence REAL NOT NULL,
                session_mode TEXT NOT NULL,
                inference_time_ms REAL NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Indexes for fast lookup
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_vocab_word ON vocabulary (word)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_vocab_category ON vocabulary (category_name)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_vocab_class ON vocabulary (class_id)")
        
        conn.commit()

def get_all_vocabulary(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 500,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """Retrieves vocabulary with optional filters."""
    query = "SELECT * FROM vocabulary WHERE 1=1"
    params = []
    
    if category and category.lower() != "all":
        query += " AND LOWER(category_name) = LOWER(?)"
        params.append(category)
        
    if difficulty and difficulty.lower() != "all":
        query += " AND LOWER(difficulty) = LOWER(?)"
        params.append(difficulty)
        
    if search:
        query += " AND (LOWER(word) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))"
        params.extend([f"%{search}%", f"%{search}%"])
        
    query += " ORDER BY class_id ASC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_vocabulary_by_class_id(class_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a single vocabulary entry by class_id."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM vocabulary WHERE class_id = ?", (class_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def get_categories() -> List[Dict[str, Any]]:
    """Retrieves all distinct categories and their word counts."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                category_name as name, 
                COUNT(*) as count,
                MIN(difficulty) as sample_difficulty
            FROM vocabulary 
            GROUP BY category_name 
            ORDER BY count DESC
        """)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_stats() -> Dict[str, Any]:
    """Retrieves overall vocabulary and system statistics."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total_words FROM vocabulary")
        total_words = cursor.fetchone()["total_words"]
        
        cursor.execute("SELECT COUNT(DISTINCT category_name) as total_categories FROM vocabulary")
        total_cats = cursor.fetchone()["total_categories"]
        
        cursor.execute("SELECT COUNT(*) as total_predictions FROM prediction_logs")
        total_preds = cursor.fetchone()["total_predictions"]
        
        return {
            "total_words": total_words,
            "total_categories": total_cats,
            "total_predictions": total_preds,
            "target_classes": 500
        }

def log_prediction(word: str, confidence: float, session_mode: str, inference_time_ms: float) -> None:
    """Logs a single model prediction for auditing & analytics."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO prediction_logs (word, confidence, session_mode, inference_time_ms)
            VALUES (?, ?, ?, ?)
        """, (word, confidence, session_mode, inference_time_ms))
        conn.commit()
