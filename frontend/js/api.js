/**
 * SignBridge Client API & Helper Utilities
 */

const API_BASE = window.location.origin;

const SignBridgeAPI = {
  /**
   * Fetches system health and ML status
   */
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch (err) {
      console.error("Health check failed:", err);
      return { status: "offline", inference_engine: "unavailable" };
    }
  },

  /**
   * Fetches vocabulary with optional filtering
   */
  async getVocabulary(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/vocabulary?${query}`);
    return await res.json();
  },

  /**
   * Fetches vocabulary categories
   */
  async getCategories() {
    const res = await fetch(`${API_BASE}/vocabulary/categories`);
    return await res.json();
  },

  /**
   * Uploads a video file for sign recognition
   */
  async uploadVideo(file, onProgress) {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.open("POST", `${API_BASE}/predict/video`);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error("Invalid JSON response from server"));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.detail || "Upload failed"));
          } catch {
            reject(new Error(`Server error: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error("Network connection error during upload."));
      xhr.send(formData);
    });
  },

  /**
   * Connects to the real-time WebSocket live recognition stream
   */
  connectLiveWebSocket(onMessage, onError, onClose) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("Connected to SignBridge Live WebSocket!");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (err) {
        console.error("Failed to parse WS payload:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      if (onError) onError(err);
    };

    socket.onclose = () => {
      console.warn("WebSocket closed.");
      if (onClose) onClose();
    };

    return socket;
  },

  /**
   * Browser Text-to-Speech synthesizer
   */
  speakText(text) {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  },

  /**
   * Renders 21-point hand skeleton on an overlay HTML5 canvas
   */
  drawHandMesh(ctx, landmarks, width, height, color = "#38bdf8") {
    if (!landmarks || landmarks.length < 21) return;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.fillStyle = "#34d399";

    // MediaPipe Hand Connection Graph (bones)
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [0, 13], [13, 14], [14, 15], [15, 16],// Ring
      [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [5, 9], [9, 13], [13, 17]             // Palm base
    ];

    // Draw Bones
    for (const [start, end] of connections) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    }

    // Draw Joints
    for (const pt of landmarks) {
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
};
