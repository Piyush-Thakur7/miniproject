"""
Integration & End-to-End API Route Tests
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    """Verifies that the /health endpoint returns 200 OK and valid status metadata."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "SignBridge AI Sign Language Recognition System"
    assert "inference_engine" in data

def test_model_info_endpoint():
    """Verifies /model/info specs."""
    response = client.get("/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["total_classes"] == 500
    assert data["input_features"] == 126
    assert data["sequence_length"] == 30

def test_vocabulary_list_and_filter():
    """Verifies /vocabulary querying and category/difficulty filtering."""
    response = client.get("/vocabulary?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "vocabulary" in data
    assert len(data["vocabulary"]) <= 10

    # Test category filter
    cat_res = client.get("/vocabulary?category=Greetings")
    assert cat_res.status_code == 200
    cat_data = cat_res.json()
    assert len(cat_data["vocabulary"]) > 0
    assert all(item["category_name"] == "Greetings" for item in cat_data["vocabulary"])

def test_vocabulary_categories():
    """Verifies /vocabulary/categories lists categories."""
    response = client.get("/vocabulary/categories")
    assert response.status_code == 200
    data = response.json()
    assert data["total_categories"] > 0
    assert len(data["categories"]) > 0

def test_predict_frame_endpoint():
    """Verifies /predict/frame returns a valid prediction response."""
    dummy_landmarks = {
        "left_hand": [{"x": 0.1, "y": 0.2, "z": 0.0} for _ in range(21)],
        "right_hand": [{"x": 0.3, "y": 0.4, "z": 0.0} for _ in range(21)]
    }
    response = client.post("/predict/frame", json={"landmarks": dummy_landmarks, "session_mode": "test"})
    assert response.status_code == 200
    data = response.json()
    assert "word" in data
    assert "confidence" in data
    assert "top_candidates" in data

def test_frontend_pages_serve_html():
    """Verifies that all frontend pages serve 200 OK HTML files."""
    pages = ["/", "/live", "/upload", "/meeting", "/vocab"]
    for page in pages:
        res = client.get(page)
        assert res.status_code == 200
        assert "text/html" in res.headers.get("content-type", "")
