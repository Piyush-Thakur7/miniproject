"""
SignBridge Vocabulary API Routes
Provides endpoints for querying, filtering, and searching the 500+ sign dictionary.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
from backend.database.db import (
    get_all_vocabulary, get_vocabulary_by_class_id, 
    get_categories, get_stats
)

router = APIRouter(prefix="/vocabulary", tags=["Vocabulary"])

@router.get("", response_model=Dict[str, Any])
def list_vocabulary(
    category: Optional[str] = Query(None, description="Filter by category name"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: Beginner, Intermediate, Advanced"),
    search: Optional[str] = Query(None, description="Search keyword in word or description"),
    limit: int = Query(500, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """Lists vocabulary words with filtering and search capabilities."""
    items = get_all_vocabulary(
        category=category,
        difficulty=difficulty,
        search=search,
        limit=limit,
        offset=offset
    )
    return {
        "count": len(items),
        "limit": limit,
        "offset": offset,
        "vocabulary": items
    }

@router.get("/categories")
def list_categories():
    """Retrieves all distinct vocabulary categories with sign counts."""
    categories = get_categories()
    return {
        "total_categories": len(categories),
        "categories": categories
    }

@router.get("/stats")
def vocabulary_statistics():
    """Returns database size, word counts, and prediction logs stats."""
    return get_stats()

@router.get("/{class_id}")
def get_sign_detail(class_id: int):
    """Retrieves details of a single sign by class index."""
    item = get_vocabulary_by_class_id(class_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Sign with class_id {class_id} not found.")
    return item
