/**
 * SignBridge Live Webcam & MediaPipe Client-Side Gesture Engine
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
  const fpsDisplay = document.getElementById("fpsDisplay");
  const wsStatus = document.getElementById("wsStatusText");

  let stream = null;
  let socket = null;
  let isPaused = false;
  let handsModel = null;
  let cameraUtil = null;
  let isPredicting = false;
  let lastPredictionTime = 0;
  let committedWords = [];
  let lastCommittedWord = null;
  let consecutiveCount = 0;
  let currentCandidate = null;

  // Initialize MediaPipe Hands
  function initMediaPipe() {
    if (typeof Hands !== "undefined") {
      try {
        handsModel = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        handsModel.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        handsModel.onResults(onHandResults);
        fpsDisplay.innerText = "MediaPipe Active";
        console.log("Client-Side MediaPipe Hands initialized!");
      } catch (err) {
        console.warn("MediaPipe init error:", err);
      }
    }
  }
  initMediaPipe();

  // Initialize optional WebSocket
  function initWebSocket() {
    socket = SignBridgeAPI.connectLiveWebSocket(
      (data) => handleServerPrediction(data),
      () => {
        wsStatus.innerText = "REST Stream Active";
      },
      () => {
        wsStatus.innerText = "REST Stream Active";
      }
    );
  }
  initWebSocket();

  // Start / Stop Camera
  btnStart.addEventListener("click", async () => {
    if (stream) {
      // Stop Camera
      if (cameraUtil) {
        try { cameraUtil.stop(); } catch(e){}
      }
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
      video.srcObject = null;
      placeholder.style.display = "flex";
      btnStart.innerHTML = '<i data-lucide="camera"></i> Start Webcam';
      btnPause.disabled = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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

          // If MediaPipe is active, start continuous tracking loop
          startTrackingLoop();
        };
      } catch (err) {
        alert("Camera access denied or camera not found: " + err.message);
      }
    }
  });

  // Continuous Camera Frame Processing Loop
  async function startTrackingLoop() {
    async function processFrame() {
      if (!stream || isPaused) {
        if (stream) requestAnimationFrame(processFrame);
        return;
      }

      if (handsModel && video.readyState >= 2) {
        try {
          await handsModel.send({ image: video });
        } catch (e) {
          // Fallback if MediaPipe busy
        }
      }
      requestAnimationFrame(processFrame);
    }
    requestAnimationFrame(processFrame);
  }

  // Handle MediaPipe Hand Detection Results
  async function onHandResults(results) {
    if (isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let leftHand = [];
    let rightHand = [];
    let handsCount = 0;

    if (results.multiHandLandmarks && results.multiHandedness) {
      handsCount = results.multiHandLandmarks.length;

      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const lms = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i];
        const label = (handedness && handedness.label) ? handedness.label.toLowerCase() : "right";

        const pts = lms.map((pt) => ({ x: pt.x, y: pt.y, z: pt.z || 0.0 }));

        if (label.includes("left")) {
          leftHand = pts;
          SignBridgeAPI.drawHandMesh(ctx, pts, canvas.width, canvas.height, "#38bdf8");
        } else {
          rightHand = pts;
          SignBridgeAPI.drawHandMesh(ctx, pts, canvas.width, canvas.height, "#34d399");
        }
      }
    }

    handsDisplay.innerText = `${handsCount} detected`;

    // Send prediction request at controlled frequency (every 120ms)
    const now = Date.now();
    if (handsCount > 0 && now - lastPredictionTime > 120 && !isPredicting) {
      lastPredictionTime = now;
      isPredicting = true;
      const t0 = performance.now();

      const payload = {
        landmarks: { left_hand: leftHand, right_hand: rightHand },
        session_mode: "live"
      };

      const res = await SignBridgeAPI.predictFrame(payload);
      const dt = Math.round(performance.now() - t0);
      latencyDisplay.innerText = `${dt} ms`;
      isPredicting = false;

      if (res && res.word) {
        handlePredictionOutput(res.word, res.confidence, res.top_candidates || []);
      }
    } else if (handsCount === 0) {
      signDisplay.innerText = "NO HANDS DETECTED";
      confLabel.innerText = "0%";
      confBar.style.width = "0%";
      statusBadge.className = "badge badge-intermediate";
      statusBadge.innerText = "Waiting";
      statusMsg.innerText = "Position hands in front of camera";
    }
  }

  // Client-Side Temporal Smoothing & Sentence Assembly
  function handlePredictionOutput(word, confidence, candidates) {
    const confPct = Math.round(confidence * 100);
    confLabel.innerText = `${confPct}%`;
    confBar.style.width = `${confPct}%`;

    // 1. Unknown sign check
    if (confidence < 0.45 || word.toUpperCase().includes("UNKNOWN")) {
      signDisplay.innerText = "UNKNOWN SIGN";
      statusBadge.className = "badge badge-advanced";
      statusBadge.innerText = "Uncertain";
      statusMsg.innerText = "Sign not recognized. Please repeat steadily.";
      confBar.style.background = "linear-gradient(90deg, #f43f5e, #a855f7)";
      consecutiveCount = 0;
      currentCandidate = null;
      return;
    }

    signDisplay.innerText = word;

    // 2. High confidence recognized
    if (confidence >= 0.65) {
      statusBadge.className = "badge badge-beginner";
      statusBadge.innerText = "Recognized";
      statusMsg.innerText = `Sign recognized with ${confPct}% accuracy`;
      confBar.style.background = "linear-gradient(90deg, #38bdf8, #10b981)";

      // Temporal Debouncing (requires 2 consecutive triggers)
      if (word === currentCandidate) {
        consecutiveCount++;
      } else {
        currentCandidate = word;
        consecutiveCount = 1;
      }

      if (consecutiveCount >= 2 && word !== lastCommittedWord) {
        lastCommittedWord = word;
        committedWords.push(word);
        updateSentenceDisplay();
      }
    } else {
      statusBadge.className = "badge badge-intermediate";
      statusBadge.innerText = "Holding...";
      statusMsg.innerText = "Hold gesture steady...";
    }

    // 3. Render Top Candidates
    if (candidates && candidates.length > 0) {
      candidatesList.innerHTML = candidates.slice(0, 3).map((c) => {
        const pct = Math.round((c.confidence || 0) * 100);
        return `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.15rem;">
              <span><strong>${c.word}</strong></span>
              <span style="color: var(--text-secondary);">${pct}%</span>
            </div>
            <div style="width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: var(--primary); border-radius: 99px;"></div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  function updateSentenceDisplay() {
    if (committedWords.length === 0) {
      sentenceDisplay.innerText = "Your translated conversation will appear here...";
      wordCount.innerText = "0 words";
      return;
    }

    let sentence = committedWords.join(" ").toLowerCase();
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    if (!sentence.endsWith(".") && !sentence.endsWith("?")) {
      const first = committedWords[0].toUpperCase();
      if (["WHAT", "WHERE", "WHEN", "WHY", "WHO", "HOW", "CAN", "ARE", "DO"].includes(first)) {
        sentence += "?";
      } else {
        sentence += ".";
      }
    }

    sentenceDisplay.innerText = sentence;
    wordCount.innerText = `${committedWords.length} words`;
  }

  // Toggle Pause
  btnPause.addEventListener("click", () => {
    isPaused = !isPaused;
    btnPause.innerHTML = isPaused ? '<i data-lucide="play"></i>' : '<i data-lucide="pause"></i>';
    btnPause.classList.toggle("btn-primary", isPaused);
    btnPause.classList.toggle("btn-secondary", !isPaused);
    lucide.createIcons();
  });

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
    committedWords = [];
    lastCommittedWord = null;
    consecutiveCount = 0;
    currentCandidate = null;
    updateSentenceDisplay();
  });
});
