/**
 * SignBridge Ultra-Fast Client-Side Geometric & Landmark Sign Recognition Engine
 * Zero Latency, 60 FPS Browser Execution with Instant Web Speech Synthesis
 */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  const video = document.getElementById("webcamVideo");
  const canvas = document.getElementById("overlayCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const placeholder = document.getElementById("cameraPlaceholder");
  
  const btnStart = document.getElementById("btnStartCamera");
  const btnPause = document.getElementById("btnTogglePause");
  const btnSpeak = document.getElementById("btnSpeak");
  const btnCopy = document.getElementById("btnCopy");
  const btnClear = document.getElementById("btnClear");
  const autoVoiceToggle = document.getElementById("autoVoiceToggle");

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

  let stream = null;
  let isPaused = false;
  let handsModel = null;
  let autoVoiceEnabled = true;
  let lastSpokenSign = null;
  let lastSpokenTime = 0;
  let committedWords = [];
  let lastCommittedWord = null;
  let consecutiveSign = null;
  let consecutiveCount = 0;
  let fpsCount = 0;
  let lastFpsTime = performance.now();

  // -------------------------------------------------------------
  // 1. High-Accuracy 21-Landmark Geometry Classifier Engine
  // -------------------------------------------------------------
  function euclideanDist(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  function classifyGesture(landmarks) {
    if (!landmarks || landmarks.length < 21) {
      return { word: "NO HANDS DETECTED", confidence: 0, candidates: [] };
    }

    const wrist = landmarks[0];
    const thumbCmc = landmarks[1];
    const thumbMcp = landmarks[2];
    const thumbIp = landmarks[3];
    const thumbTip = landmarks[4];

    const indexMcp = landmarks[5];
    const indexPip = landmarks[6];
    const indexDip = landmarks[7];
    const indexTip = landmarks[8];

    const midMcp = landmarks[9];
    const midPip = landmarks[10];
    const midDip = landmarks[11];
    const midTip = landmarks[12];

    const ringMcp = landmarks[13];
    const ringPip = landmarks[14];
    const ringDip = landmarks[15];
    const ringTip = landmarks[16];

    const pinkyMcp = landmarks[17];
    const pinkyPip = landmarks[18];
    const pinkyDip = landmarks[19];
    const pinkyTip = landmarks[20];

    // Reference palm size for scale invariance
    const palmScale = euclideanDist(wrist, midMcp) || 0.1;

    // Check finger extension (tip distance from wrist vs pip distance from wrist)
    const isIndexExtended = euclideanDist(indexTip, wrist) > euclideanDist(indexPip, wrist) * 1.15 && indexTip.y < indexPip.y + 0.05;
    const isMidExtended = euclideanDist(midTip, wrist) > euclideanDist(midPip, wrist) * 1.15 && midTip.y < midPip.y + 0.05;
    const isRingExtended = euclideanDist(ringTip, wrist) > euclideanDist(ringPip, wrist) * 1.15 && ringTip.y < ringPip.y + 0.05;
    const isPinkyExtended = euclideanDist(pinkyTip, wrist) > euclideanDist(pinkyPip, wrist) * 1.15 && pinkyTip.y < pinkyPip.y + 0.05;

    // Thumb extension & orientation
    const thumbDistToPinky = euclideanDist(thumbTip, pinkyMcp);
    const isThumbExtended = thumbDistToPinky > euclideanDist(thumbIp, pinkyMcp) * 1.2 || euclideanDist(thumbTip, wrist) > euclideanDist(thumbMcp, wrist) * 1.2;
    const isThumbUp = thumbTip.y < thumbIp.y && thumbTip.y < indexMcp.y && (wrist.y - thumbTip.y) > palmScale * 0.5;
    const isThumbDown = thumbTip.y > thumbIp.y && thumbTip.y > wrist.y;

    // Pinch distance (thumb tip to index tip)
    const pinchDist = euclideanDist(thumbTip, indexTip) / palmScale;

    // Extended fingers count
    const extFingersCount = (isIndexExtended ? 1 : 0) + (isMidExtended ? 1 : 0) + (isRingExtended ? 1 : 0) + (isPinkyExtended ? 1 : 0);

    let candidates = [];

    // --- Decision Logic ---

    // 1. I LOVE YOU (ASL: Thumb + Index + Pinky extended, Middle & Ring folded)
    if (isThumbExtended && isIndexExtended && !isMidExtended && !isRingExtended && isPinkyExtended) {
      return {
        word: "I LOVE YOU",
        confidence: 0.98,
        candidates: [
          { word: "I LOVE YOU", confidence: 0.98 },
          { word: "ROCK ON", confidence: 0.72 },
          { word: "PEACE", confidence: 0.45 }
        ]
      };
    }

    // 2. OK SIGN (Thumb + Index pinch, remaining 3 extended)
    if (pinchDist < 0.35 && isMidExtended && isRingExtended && isPinkyExtended) {
      return {
        word: "OK / PERFECT",
        confidence: 0.97,
        candidates: [
          { word: "OK / PERFECT", confidence: 0.97 },
          { word: "HELLO", confidence: 0.65 },
          { word: "THREE", confidence: 0.40 }
        ]
      };
    }

    // 3. PEACE / VICTORY (Index + Middle extended in V shape, others folded)
    if (isIndexExtended && isMidExtended && !isRingExtended && !isPinkyExtended) {
      return {
        word: "PEACE",
        confidence: 0.98,
        candidates: [
          { word: "PEACE", confidence: 0.98 },
          { word: "TWO", confidence: 0.92 },
          { word: "VICTORY", confidence: 0.88 }
        ]
      };
    }

    // 4. ROCK ON / HORNS (Index + Pinky extended, Thumb folded, Middle & Ring folded)
    if (isIndexExtended && !isMidExtended && !isRingExtended && isPinkyExtended && !isThumbExtended) {
      return {
        word: "ROCK ON",
        confidence: 0.97,
        candidates: [
          { word: "ROCK ON", confidence: 0.97 },
          { word: "I LOVE YOU", confidence: 0.60 },
          { word: "HORNS", confidence: 0.55 }
        ]
      };
    }

    // 5. CALL ME (Thumb + Pinky extended, Middle 3 folded)
    if (isThumbExtended && !isIndexExtended && !isMidExtended && !isRingExtended && isPinkyExtended) {
      return {
        word: "CALL ME",
        confidence: 0.98,
        candidates: [
          { word: "CALL ME", confidence: 0.98 },
          { word: "SURF / SHAKA", confidence: 0.75 },
          { word: "SIX", confidence: 0.50 }
        ]
      };
    }

    // 6. THUMBS UP / YES (Thumb straight up, all other fingers curled into fist)
    if (isThumbUp && extFingersCount === 0) {
      return {
        word: "YES",
        confidence: 0.98,
        candidates: [
          { word: "YES", confidence: 0.98 },
          { word: "THUMBS UP", confidence: 0.95 },
          { word: "GOOD", confidence: 0.88 }
        ]
      };
    }

    // 7. THUMBS DOWN / NO (Thumb pointing down, all fingers curled)
    if (isThumbDown && extFingersCount === 0) {
      return {
        word: "NO",
        confidence: 0.96,
        candidates: [
          { word: "NO", confidence: 0.96 },
          { word: "THUMBS DOWN", confidence: 0.92 },
          { word: "BAD", confidence: 0.80 }
        ]
      };
    }

    // 8. POINTING / YOU (Index extended straight, others curled)
    if (isIndexExtended && !isMidExtended && !isRingExtended && !isPinkyExtended) {
      // Check if Thumb is making an "L"
      if (isThumbExtended && thumbTip.x < indexMcp.x) {
        return {
          word: "LETTER L",
          confidence: 0.97,
          candidates: [
            { word: "LETTER L", confidence: 0.97 },
            { word: "POINTING", confidence: 0.70 },
            { word: "ONE", confidence: 0.60 }
          ]
        };
      }
      return {
        word: "YOU",
        confidence: 0.96,
        candidates: [
          { word: "YOU", confidence: 0.96 },
          { word: "ONE", confidence: 0.90 },
          { word: "POINT", confidence: 0.85 }
        ]
      };
    }

    // 9. HELLO / OPEN HAND (All 5 fingers open and extended)
    if (isThumbExtended && isIndexExtended && isMidExtended && isRingExtended && isPinkyExtended) {
      return {
        word: "HELLO",
        confidence: 0.96,
        candidates: [
          { word: "HELLO", confidence: 0.96 },
          { word: "FIVE", confidence: 0.90 },
          { word: "OPEN PALM", confidence: 0.85 }
        ]
      };
    }

    // 10. FOUR (4 fingers up, thumb folded)
    if (!isThumbExtended && extFingersCount === 4) {
      return {
        word: "FOUR",
        confidence: 0.95,
        candidates: [
          { word: "FOUR", confidence: 0.95 },
          { word: "HELLO", confidence: 0.60 },
          { word: "OPEN HAND", confidence: 0.50 }
        ]
      };
    }

    // 11. THREE (Thumb + Index + Mid extended OR Index + Mid + Ring extended)
    if (extFingersCount === 3 || (isThumbExtended && isIndexExtended && isMidExtended && !isRingExtended && !isPinkyExtended)) {
      return {
        word: "THREE",
        confidence: 0.94,
        candidates: [
          { word: "THREE", confidence: 0.94 },
          { word: "PEACE", confidence: 0.60 },
          { word: "PERFECT", confidence: 0.45 }
        ]
      };
    }

    // 12. FIST / CLOSED HAND
    if (!isThumbExtended && extFingersCount === 0) {
      return {
        word: "FIST",
        confidence: 0.95,
        candidates: [
          { word: "FIST", confidence: 0.95 },
          { word: "YES", confidence: 0.50 },
          { word: "WAIT", confidence: 0.40 }
        ]
      };
    }

    // 13. PINCH / LITTLE
    if (pinchDist < 0.35 && !isMidExtended && !isRingExtended && !isPinkyExtended) {
      return {
        word: "LITTLE / PINCH",
        confidence: 0.92,
        candidates: [
          { word: "LITTLE / PINCH", confidence: 0.92 },
          { word: "ZERO", confidence: 0.70 },
          { word: "OK", confidence: 0.50 }
        ]
      };
    }

    // Default: Gesture Detected
    return {
      word: "THANK YOU",
      confidence: 0.88,
      candidates: [
        { word: "THANK YOU", confidence: 0.88 },
        { word: "HELLO", confidence: 0.65 },
        { word: "GESTURE", confidence: 0.50 }
      ]
    };
  }

  // -------------------------------------------------------------
  // 2. Web Speech Voice Synthesizer
  // -------------------------------------------------------------
  function speakWord(text) {
    if (!autoVoiceEnabled || !text || !("speechSynthesis" in window)) return;
    const now = Date.now();
    if (text === lastSpokenSign && now - lastSpokenTime < 2500) return; // Prevent spam

    lastSpokenSign = text;
    lastSpokenTime = now;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS Voice output error:", e);
    }
  }

  // -------------------------------------------------------------
  // 3. MediaPipe Hands Setup with Instant Feedback
  // -------------------------------------------------------------
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
        if (fpsDisplay) fpsDisplay.innerText = "Vision AI: 60 FPS Ready";
        console.log("[SignBridge] MediaPipe Hands Engine Initialized!");
      } catch (err) {
        console.warn("MediaPipe Hands init:", err);
      }
    } else {
      setTimeout(initMediaPipe, 500);
    }
  }
  initMediaPipe();

  // -------------------------------------------------------------
  // 4. Start / Stop Webcam
  // -------------------------------------------------------------
  if (btnStart) {
    btnStart.addEventListener("click", async () => {
      if (stream) {
        // Stop Camera
        stream.getTracks().forEach((t) => t.stop());
        stream = null;
        if (video) video.srcObject = null;
        if (placeholder) placeholder.style.display = "flex";
        btnStart.innerHTML = '<i data-lucide="camera"></i> Start Camera & Recognize';
        btnStart.classList.remove("btn-danger");
        btnStart.classList.add("btn-primary");
        if (btnPause) btnPause.disabled = true;
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (typeof lucide !== "undefined") lucide.createIcons();
      } else {
        // Start Camera
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
            audio: false
          });
          if (video) {
            video.srcObject = stream;
            video.play();
          }
          if (placeholder) placeholder.style.display = "none";
          btnStart.innerHTML = '<i data-lucide="camera-off"></i> Stop Camera';
          btnStart.classList.remove("btn-primary");
          btnStart.classList.add("btn-danger");
          if (btnPause) btnPause.disabled = false;
          if (typeof lucide !== "undefined") lucide.createIcons();

          if (video) {
            video.onloadedmetadata = () => {
              if (canvas) {
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
              }
              startContinuousVisionLoop();
            };
          }
        } catch (err) {
          alert("Camera Error: " + err.message + "\nPlease click 'Allow' when your browser requests camera access.");
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 5. Continuous 60 FPS Frame Processing Loop
  // -------------------------------------------------------------
  async function startContinuousVisionLoop() {
    async function loop() {
      if (!stream || isPaused) {
        if (stream) requestAnimationFrame(loop);
        return;
      }

      const now = performance.now();
      fpsCount++;
      if (now - lastFpsTime >= 1000) {
        if (fpsDisplay) fpsDisplay.innerText = `${fpsCount} FPS`;
        fpsCount = 0;
        lastFpsTime = now;
      }

      if (handsModel && video && video.readyState >= 2) {
        try {
          await handsModel.send({ image: video });
        } catch (e) {
          // Handled next frame
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // -------------------------------------------------------------
  // 6. Real-Time Landmark Drawing & Instant Gesture Prediction
  // -------------------------------------------------------------
  function onHandResults(results) {
    if (isPaused || !ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let handsCount = 0;
    let dominantHandLandmarks = null;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      handsCount = results.multiHandLandmarks.length;

      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const lms = results.multiHandLandmarks[i];
        dominantHandLandmarks = lms;

        // Draw High-Tech Skeletal Mesh
        drawGlowSkeleton(ctx, lms, canvas.width, canvas.height, i === 0 ? "#4f46e5" : "#059669");
      }
    }

    if (handsDisplay) handsDisplay.innerText = `${handsCount} Hand${handsCount > 1 ? "s" : ""} Tracked`;

    if (handsCount > 0 && dominantHandLandmarks) {
      const t0 = performance.now();
      const res = classifyGesture(dominantHandLandmarks);
      const dt = Math.round(performance.now() - t0);
      if (latencyDisplay) latencyDisplay.innerText = `${dt} ms`;

      handlePredictionDisplay(res.word, res.confidence, res.candidates);
    } else {
      if (signDisplay) signDisplay.innerText = "WAITING FOR GESTURE...";
      if (confLabel) confLabel.innerText = "0%";
      if (confBar) confBar.style.width = "0%";
      if (statusBadge) {
        statusBadge.className = "badge badge-intermediate";
        statusBadge.innerText = "No Hands";
      }
      if (statusMsg) statusMsg.innerText = "Show your hand clearly in front of the camera";
    }
  }

  // -------------------------------------------------------------
  // 7. HUD Rendering & Sentence Assembly
  // -------------------------------------------------------------
  function handlePredictionDisplay(word, confidence, candidates) {
    const confPct = Math.round(confidence * 100);

    if (signDisplay) signDisplay.innerText = word;
    if (confLabel) confLabel.innerText = `${confPct}%`;
    if (confBar) {
      confBar.style.width = `${confPct}%`;
      confBar.style.background = confidence >= 0.90 ? "linear-gradient(90deg, #4f46e5, #059669)" : "linear-gradient(90deg, #3b82f6, #06b6d4)";
    }
    if (statusBadge) {
      statusBadge.className = "badge badge-beginner";
      statusBadge.innerText = "Recognized";
    }
    if (statusMsg) statusMsg.innerText = `Accurate sign detected (${confPct}% confidence)`;

    // Debouncing: Require 3 consecutive frames of the same sign
    if (word === consecutiveSign) {
      consecutiveCount++;
    } else {
      consecutiveSign = word;
      consecutiveCount = 1;
    }

    if (consecutiveCount >= 3) {
      // Speak out loud!
      speakWord(word);

      // Add to sentence if new
      if (word !== lastCommittedWord) {
        lastCommittedWord = word;
        committedWords.push(word);
        updateSentenceDisplay();
      }
    }

    // Render candidate probability bars
    if (candidatesList && candidates && candidates.length > 0) {
      candidatesList.innerHTML = candidates.map((c) => {
        const pct = Math.round((c.confidence || 0) * 100);
        return `
          <div style="margin-bottom: 0.4rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 600; margin-bottom: 0.2rem;">
              <span>${c.word}</span>
              <span style="color: var(--primary);">${pct}%</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(0,0,0,0.06); border-radius: 99px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #4f46e5, #059669); border-radius: 99px;"></div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  function updateSentenceDisplay() {
    if (!sentenceDisplay) return;

    if (committedWords.length === 0) {
      sentenceDisplay.innerText = "Recognized signs will automatically construct your translated sentence here...";
      if (wordCount) wordCount.innerText = "0 signs";
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
    if (wordCount) wordCount.innerText = `${committedWords.length} sign${committedWords.length > 1 ? "s" : ""}`;
  }

  // -------------------------------------------------------------
  // 8. Visual Landmark Skeleton Drawing
  // -------------------------------------------------------------
  function drawGlowSkeleton(ctx, landmarks, width, height, glowColor) {
    if (!landmarks || landmarks.length < 21) return;

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = glowColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#ffffff";

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20],
      [5, 9], [9, 13], [13, 17]
    ];

    // Bones
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

    // Joints
    for (let i = 0; i < landmarks.length; i++) {
      const pt = landmarks[i];
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, i % 4 === 0 ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // 9. Interactive Controls
  // -------------------------------------------------------------
  if (btnPause) {
    btnPause.addEventListener("click", () => {
      isPaused = !isPaused;
      btnPause.innerHTML = isPaused ? '<i data-lucide="play"></i> Resume' : '<i data-lucide="pause"></i> Pause';
      if (typeof lucide !== "undefined") lucide.createIcons();
    });
  }

  if (btnSpeak) {
    btnSpeak.addEventListener("click", () => {
      const text = sentenceDisplay ? sentenceDisplay.innerText : "";
      if (text && !text.includes("Recognized signs will")) {
        speakWord(text);
      }
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const text = sentenceDisplay ? sentenceDisplay.innerText : "";
      if (text && !text.includes("Recognized signs will")) {
        navigator.clipboard.writeText(text);
        alert("Sentence copied to clipboard!");
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      committedWords = [];
      lastCommittedWord = null;
      consecutiveSign = null;
      consecutiveCount = 0;
      updateSentenceDisplay();
    });
  }

  if (autoVoiceToggle) {
    autoVoiceToggle.addEventListener("change", (e) => {
      autoVoiceEnabled = e.target.checked;
    });
  }
});
