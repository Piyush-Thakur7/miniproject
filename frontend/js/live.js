/**
 * SignBridge Live Webcam Client Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const video = document.getElementById("webcamVideo");
  const canvas = document.getElementById("overlayCanvas");
  const ctx = canvas.getContext("2d");
  const placeholder = document.getElementById("cameraPlaceholder");
  
  const btnStart = document.getElementById("btnStartCamera");
  const btnPause = document.getElementById("btnTogglePause");
  const btnSpeak = document.getElementById("btnSpeak");
  const btnCopy = document.getElementById("btnCopy");
  const btnClear = document.getElementById("btnClear");

  const signDisplay = document.getElementById("detectedSignDisplay");
  const confLabel = document.getElementById("confidenceLabel");
  const confBar = document.getElementById("confidenceBar");
  const statusBadge = document.getElementById("statusBadge");
  const statusMsg = document.getElementById("statusMessage");
  const sentenceDisplay = document.getElementById("sentenceDisplay");
  const wordCount = document.getElementById("wordCountDisplay");
  const candidatesList = document.getElementById("candidatesList");
  const latencyDisplay = document.getElementById("latencyDisplay");
  const handsDisplay = document.getElementById("handsCountDisplay");
  const wsStatus = document.getElementById("wsStatusText");

  let stream = null;
  let socket = null;
  let isPaused = false;
  let sendInterval = null;
  let offscreenCanvas = document.createElement("canvas");
  let offscreenCtx = offscreenCanvas.getContext("2d");
  let lastSentence = "";

  // Initialize WebSocket
  function initWebSocket() {
    socket = SignBridgeAPI.connectLiveWebSocket(
      (data) => handleLivePrediction(data),
      (err) => {
        wsStatus.innerText = "WebSocket: Error";
        wsStatus.style.color = "var(--accent-rose)";
      },
      () => {
        wsStatus.innerText = "WebSocket: Disconnected";
        setTimeout(initWebSocket, 3000); // Reconnect loop
      }
    );
    wsStatus.innerText = "WebSocket: Connected";
  }
  initWebSocket();

  // Start / Stop Camera
  btnStart.addEventListener("click", async () => {
    if (stream) {
      // Stop Camera
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
      video.srcObject = null;
      placeholder.style.display = "flex";
      btnStart.innerHTML = '<i data-lucide="camera"></i> Start Webcam';
      btnPause.disabled = true;
      clearInterval(sendInterval);
      lucide.createIcons();
    } else {
      // Start Camera
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
        });
        video.srcObject = stream;
        placeholder.style.display = "none";
        btnStart.innerHTML = '<i data-lucide="camera-off"></i> Stop Webcam';
        btnPause.disabled = false;
        lucide.createIcons();

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          offscreenCanvas.width = 320;
          offscreenCanvas.height = 240;
          startFrameStreaming();
        };
      } catch (err) {
        alert("Camera permission denied or no camera device found: " + err.message);
      }
    }
  });

  // Pause / Resume Stream
  btnPause.addEventListener("click", () => {
    isPaused = !isPaused;
    if (isPaused) {
      btnPause.innerHTML = '<i data-lucide="play"></i> Resume Stream';
      btnPause.classList.add("btn-primary");
      btnPause.classList.remove("btn-secondary");
    } else {
      btnPause.innerHTML = '<i data-lucide="pause"></i> Pause Stream';
      btnPause.classList.remove("btn-primary");
      btnPause.classList.add("btn-secondary");
    }
    lucide.createIcons();
  });

  // Stream video frames across WebSocket
  function startFrameStreaming() {
    clearInterval(sendInterval);
    sendInterval = setInterval(() => {
      if (!stream || isPaused || !socket || socket.readyState !== WebSocket.OPEN) return;

      offscreenCtx.drawImage(video, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
      const base64Data = offscreenCanvas.toDataURL("image/jpeg", 0.5);

      socket.send(JSON.stringify({
        type: "frame",
        image: base64Data
      }));
    }, 66); // ~15 FPS transmission
  }

  // Process server prediction response
  function handleLivePrediction(data) {
    if (data.type !== "prediction") return;

    // 1. Prediction Word & Confidence
    signDisplay.innerText = data.word || "WAITING...";
    const confPct = Math.round((data.confidence || 0) * 100);
    confLabel.innerText = `${confPct}%`;
    confBar.style.width = `${confPct}%`;

    // 2. Status Badge Styling
    if (data.status === "recognized") {
      statusBadge.className = "badge badge-beginner";
      statusBadge.innerText = "Recognized";
      confBar.style.background = "linear-gradient(90deg, #38bdf8, #10b981)";
    } else if (data.status === "low_confidence") {
      statusBadge.className = "badge badge-intermediate";
      statusBadge.innerText = "Holding...";
      confBar.style.background = "linear-gradient(90deg, #f59e0b, #38bdf8)";
    } else {
      statusBadge.className = "badge badge-advanced";
      statusBadge.innerText = "Uncertain";
      confBar.style.background = "linear-gradient(90deg, #f43f5e, #a855f7)";
    }

    statusMsg.innerText = data.message || "";
    latencyDisplay.innerText = `${data.inference_time_ms || 0} ms`;
    handsDisplay.innerText = `${data.hands_detected || 0} detected`;

    // 3. Sentence Update & Speech
    if (data.sentence) {
      sentenceDisplay.innerText = data.sentence;
      const count = data.sentence.trim().split(/\s+/).filter(Boolean).length;
      wordCount.innerText = `${count} words`;

      if (data.is_new_word && data.sentence !== lastSentence) {
        lastSentence = data.sentence;
        // Optionally auto-speak newly recognized words
      }
    }

    // 4. Render Hand Landmark Skeletons
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (data.landmarks) {
      if (data.landmarks.left_hand && data.landmarks.left_hand.length > 0) {
        SignBridgeAPI.drawHandMesh(ctx, data.landmarks.left_hand, canvas.width, canvas.height, "#38bdf8");
      }
      if (data.landmarks.right_hand && data.landmarks.right_hand.length > 0) {
        SignBridgeAPI.drawHandMesh(ctx, data.landmarks.right_hand, canvas.width, canvas.height, "#34d399");
      }
    }

    // 5. Candidate Distribution List
    if (data.top_candidates && data.top_candidates.length > 0) {
      candidatesList.innerHTML = data.top_candidates.map((c) => {
        const pct = Math.round(c.confidence * 100);
        return `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.2rem;">
              <span><strong>${c.word}</strong></span>
              <span style="color: var(--text-secondary);">${pct}%</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: var(--primary); border-radius: 99px;"></div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // Buttons Actions
  btnSpeak.addEventListener("click", () => {
    const text = sentenceDisplay.innerText;
    if (text && !text.includes("Your translated")) {
      SignBridgeAPI.speakText(text);
    }
  });

  btnCopy.addEventListener("click", () => {
    const text = sentenceDisplay.innerText;
    if (text && !text.includes("Your translated")) {
      navigator.clipboard.writeText(text);
      alert("Translated sentence copied to clipboard!");
    }
  });

  btnClear.addEventListener("click", () => {
    sentenceDisplay.innerText = "Your translated conversation will appear here...";
    wordCount.innerText = "0 words";
    lastSentence = "";
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "clear" }));
    }
  });
});
