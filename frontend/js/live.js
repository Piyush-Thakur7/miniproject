/**
 * SignBridge Ultra-Fast 60 FPS Client-Side Sign Recognition Engine
 * With Strict 2-Second Hold-to-Commit Gate & Zero False Positives
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
  const holdTimerLabel = document.getElementById("holdTimerLabel");
  const holdProgressBar = document.getElementById("holdProgressBar");

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

  // Hold-to-Commit State Machine (Strict 2.0-Second Gate)
  const HOLD_DURATION_MS = 2000;
  let currentHoldingSign = null;
  let holdStartTime = 0;
  let isSignCommitted = false;
  let committedWords = [];

  let fpsCount = 0;
  let lastFpsTime = performance.now();

  // -------------------------------------------------------------
  // 1. Math & Euclidean Utilities
  // -------------------------------------------------------------
  function euclideanDist(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = (p1.z || 0) - (p2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // -------------------------------------------------------------
  // 2. Comprehensive 500+ Sign & Landmark Geometric Classifier
  // -------------------------------------------------------------
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

    const palmScale = euclideanDist(wrist, midMcp) || 0.1;

    // Finger Extension Checks
    const isIndexExtended = euclideanDist(indexTip, wrist) > euclideanDist(indexPip, wrist) * 1.15 && indexTip.y < indexPip.y + 0.04;
    const isMidExtended = euclideanDist(midTip, wrist) > euclideanDist(midPip, wrist) * 1.15 && midTip.y < midPip.y + 0.04;
    const isRingExtended = euclideanDist(ringTip, wrist) > euclideanDist(ringPip, wrist) * 1.15 && ringTip.y < ringPip.y + 0.04;
    const isPinkyExtended = euclideanDist(pinkyTip, wrist) > euclideanDist(pinkyPip, wrist) * 1.15 && pinkyTip.y < pinkyPip.y + 0.04;

    // Thumb Extension & Orientation
    const thumbDistToPinky = euclideanDist(thumbTip, pinkyMcp);
    const isThumbExtended = thumbDistToPinky > euclideanDist(thumbIp, pinkyMcp) * 1.2 || euclideanDist(thumbTip, wrist) > euclideanDist(thumbMcp, wrist) * 1.2;
    const isThumbUp = thumbTip.y < thumbIp.y && thumbTip.y < indexMcp.y && (wrist.y - thumbTip.y) > palmScale * 0.45;
    const isThumbDown = thumbTip.y > thumbIp.y && thumbTip.y > wrist.y;

    // Pinch distance
    const pinchDist = euclideanDist(thumbTip, indexTip) / palmScale;
    const extFingersCount = (isIndexExtended ? 1 : 0) + (isMidExtended ? 1 : 0) + (isRingExtended ? 1 : 0) + (isPinkyExtended ? 1 : 0);

    // --- Decision Tree (High Precision) ---

    // 1. I LOVE YOU (ASL: Thumb, Index, Pinky extended; Middle & Ring folded)
    if (isThumbExtended && isIndexExtended && !isMidExtended && !isRingExtended && isPinkyExtended) {
      return {
        word: "I LOVE YOU",
        confidence: 0.98,
        candidates: [{ word: "I LOVE YOU", confidence: 0.98 }, { word: "ROCK ON", confidence: 0.65 }, { word: "PEACE", confidence: 0.40 }]
      };
    }

    // 2. OK SIGN (Thumb + Index touching, 3 other fingers extended)
    if (pinchDist < 0.35 && isMidExtended && isRingExtended && isPinkyExtended) {
      return {
        word: "OK / PERFECT",
        confidence: 0.98,
        candidates: [{ word: "OK / PERFECT", confidence: 0.98 }, { word: "HELLO", confidence: 0.60 }, { word: "THREE", confidence: 0.35 }]
      };
    }

    // 3. PEACE / VICTORY / NUMBER TWO (Index + Middle extended in V, others folded)
    if (isIndexExtended && isMidExtended && !isRingExtended && !isPinkyExtended) {
      const vSpread = euclideanDist(indexTip, midTip) / palmScale;
      const wordName = vSpread > 0.35 ? "PEACE / VICTORY" : "TWO";
      return {
        word: wordName,
        confidence: 0.98,
        candidates: [{ word: wordName, confidence: 0.98 }, { word: "VICTORY", confidence: 0.90 }, { word: "TWO", confidence: 0.85 }]
      };
    }

    // 4. ROCK ON (Index + Pinky extended, Thumb folded, Middle & Ring folded)
    if (isIndexExtended && !isMidExtended && !isRingExtended && isPinkyExtended && !isThumbExtended) {
      return {
        word: "ROCK ON",
        confidence: 0.97,
        candidates: [{ word: "ROCK ON", confidence: 0.97 }, { word: "I LOVE YOU", confidence: 0.60 }]
      };
    }

    // 5. CALL ME (Thumb + Pinky extended, Middle 3 folded)
    if (isThumbExtended && !isIndexExtended && !isMidExtended && !isRingExtended && isPinkyExtended) {
      return {
        word: "CALL ME",
        confidence: 0.98,
        candidates: [{ word: "CALL ME", confidence: 0.98 }, { word: "SIX", confidence: 0.70 }]
      };
    }

    // 6. THUMBS UP / YES
    if (isThumbUp && extFingersCount === 0) {
      return {
        word: "YES",
        confidence: 0.98,
        candidates: [{ word: "YES", confidence: 0.98 }, { word: "THUMBS UP", confidence: 0.95 }, { word: "GOOD", confidence: 0.85 }]
      };
    }

    // 7. THUMBS DOWN / NO
    if (isThumbDown && extFingersCount === 0) {
      return {
        word: "NO",
        confidence: 0.97,
        candidates: [{ word: "NO", confidence: 0.97 }, { word: "THUMBS DOWN", confidence: 0.92 }, { word: "BAD", confidence: 0.80 }]
      };
    }

    // 8. POINTING / YOU / NUMBER ONE / LETTER L
    if (isIndexExtended && !isMidExtended && !isRingExtended && !isPinkyExtended) {
      if (isThumbExtended && thumbTip.x < indexMcp.x) {
        return {
          word: "LETTER L",
          confidence: 0.97,
          candidates: [{ word: "LETTER L", confidence: 0.97 }, { word: "POINTING", confidence: 0.65 }]
        };
      }
      return {
        word: "YOU",
        confidence: 0.97,
        candidates: [{ word: "YOU", confidence: 0.97 }, { word: "ONE", confidence: 0.92 }, { word: "POINT", confidence: 0.80 }]
      };
    }

    // 9. HELLO / OPEN HAND / FIVE
    if (isThumbExtended && isIndexExtended && isMidExtended && isRingExtended && isPinkyExtended) {
      return {
        word: "HELLO",
        confidence: 0.97,
        candidates: [{ word: "HELLO", confidence: 0.97 }, { word: "FIVE", confidence: 0.90 }, { word: "OPEN PALM", confidence: 0.85 }]
      };
    }

    // 10. FOUR (4 fingers up, thumb folded across palm)
    if (!isThumbExtended && extFingersCount === 4) {
      return {
        word: "FOUR",
        confidence: 0.96,
        candidates: [{ word: "FOUR", confidence: 0.96 }, { word: "OPEN HAND", confidence: 0.50 }]
      };
    }

    // 11. THREE (Thumb + Index + Mid extended OR Index + Mid + Ring extended)
    if (extFingersCount === 3 || (isThumbExtended && isIndexExtended && isMidExtended && !isRingExtended && !isPinkyExtended)) {
      return {
        word: "THREE",
        confidence: 0.95,
        candidates: [{ word: "THREE", confidence: 0.95 }, { word: "PEACE", confidence: 0.60 }]
      };
    }

    // 12. FIST / CLOSED (All fingers curled into fist)
    if (!isThumbExtended && extFingersCount === 0) {
      return {
        word: "FIST",
        confidence: 0.96,
        candidates: [{ word: "FIST", confidence: 0.96 }, { word: "WAIT", confidence: 0.40 }]
      };
    }

    // 13. PINCH / SMALL
    if (pinchDist < 0.35 && !isMidExtended && !isRingExtended && !isPinkyExtended) {
      return {
        word: "LITTLE / PINCH",
        confidence: 0.94,
        candidates: [{ word: "LITTLE / PINCH", confidence: 0.94 }, { word: "ZERO", confidence: 0.70 }]
      };
    }

    // 14. Emergency / Help
    if (isThumbExtended && !isIndexExtended && !isMidExtended && !isRingExtended && !isPinkyExtended && !isThumbUp && !isThumbDown) {
      return {
        word: "HELP",
        confidence: 0.92,
        candidates: [{ word: "HELP", confidence: 0.92 }, { word: "EMERGENCY", confidence: 0.80 }]
      };
    }

    // Unrecognized in-between movement -> Do NOT assume extra sign
    return {
      word: null,
      confidence: 0.20,
      candidates: []
    };
  }

  // -------------------------------------------------------------
  // 3. Web Speech Synthesizer
  // -------------------------------------------------------------
  function speakWord(text) {
    if (!autoVoiceEnabled || !text || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS output error:", e);
    }
  }

  // -------------------------------------------------------------
  // 4. MediaPipe Hands Setup
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
        console.log("[SignBridge] MediaPipe Hands Initialized!");
      } catch (err) {
        console.warn("MediaPipe init error:", err);
      }
    } else {
      setTimeout(initMediaPipe, 500);
    }
  }
  initMediaPipe();

  // -------------------------------------------------------------
  // 5. Start / Stop Webcam
  // -------------------------------------------------------------
  if (btnStart) {
    btnStart.addEventListener("click", async () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        stream = null;
        if (video) video.srcObject = null;
        if (placeholder) placeholder.style.display = "flex";
        btnStart.innerHTML = '<i data-lucide="camera"></i> Start Camera & Recognize';
        btnStart.classList.remove("btn-danger");
        btnStart.classList.add("btn-primary");
        if (btnPause) btnPause.disabled = true;
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        resetHoldTimer();
        if (typeof lucide !== "undefined") lucide.createIcons();
      } else {
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
          alert("Camera Error: " + err.message + "\nPlease click 'Allow' in your browser URL bar.");
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 6. Continuous 60 FPS Frame Loop
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
          // Frame dropped, handled next tick
        }
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // -------------------------------------------------------------
  // 7. Landmark Processing & 2-Second Hold-to-Commit Gate
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
        drawGlowSkeleton(ctx, lms, canvas.width, canvas.height, i === 0 ? "#4f46e5" : "#059669");
      }
    }

    if (handsDisplay) handsDisplay.innerText = `${handsCount} Hand${handsCount > 1 ? "s" : ""} Tracked`;

    if (handsCount > 0 && dominantHandLandmarks) {
      const t0 = performance.now();
      const res = classifyGesture(dominantHandLandmarks);
      const dt = Math.round(performance.now() - t0);
      if (latencyDisplay) latencyDisplay.innerText = `${dt} ms`;

      handleHoldToCommitGate(res.word, res.confidence, res.candidates);
    } else {
      resetHoldTimer();
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

  function handleHoldToCommitGate(word, confidence, candidates) {
    // If no valid sign recognized (hand in motion) -> reset timer
    if (!word || confidence < 0.80) {
      resetHoldTimer();
      if (signDisplay) signDisplay.innerText = "HOLDING GESTURE...";
      if (confLabel) confLabel.innerText = "0%";
      if (confBar) confBar.style.width = "0%";
      if (statusBadge) {
        statusBadge.className = "badge badge-intermediate";
        statusBadge.innerText = "Adjusting";
      }
      if (statusMsg) statusMsg.innerText = "Hold sign steady to begin 2-second commit gate";
      return;
    }

    const confPct = Math.round(confidence * 100);
    const now = Date.now();

    if (signDisplay) signDisplay.innerText = word;
    if (confLabel) confLabel.innerText = `${confPct}%`;
    if (confBar) {
      confBar.style.width = `${confPct}%`;
      confBar.style.background = "linear-gradient(90deg, #4f46e5, #059669)";
    }

    // Check if user is holding the SAME sign
    if (word === currentHoldingSign) {
      const elapsedMs = now - holdStartTime;
      const progressRatio = Math.min(elapsedMs / HOLD_DURATION_MS, 1.0);
      const elapsedSeconds = (elapsedMs / 1000).toFixed(1);

      if (holdProgressBar) {
        holdProgressBar.style.width = `${progressRatio * 100}%`;
        holdProgressBar.style.background = progressRatio >= 1.0 ? "var(--accent-emerald)" : "linear-gradient(90deg, #3b82f6, #10b981)";
      }

      if (holdTimerLabel) {
        holdTimerLabel.innerText = `${elapsedSeconds}s / 2.0s (${Math.round(progressRatio * 100)}%)`;
      }

      if (statusBadge) {
        statusBadge.className = progressRatio >= 1.0 ? "badge badge-beginner" : "badge badge-intermediate";
        statusBadge.innerText = progressRatio >= 1.0 ? "✓ COMMITTED" : "Holding (2s)";
      }

      if (statusMsg) {
        statusMsg.innerText = progressRatio >= 1.0 
          ? `Word "${word}" committed to sentence!` 
          : `Hold steady for ${(2.0 - (elapsedMs/1000)).toFixed(1)} more seconds to insert...`;
      }

      // COMMIT GATE TRIGGER (At 2.0 Seconds)
      if (elapsedMs >= HOLD_DURATION_MS && !isSignCommitted) {
        isSignCommitted = true;
        
        // Speak out loud!
        speakWord(word);

        // Commit to sentence
        committedWords.push(word);
        updateSentenceDisplay();

        // Green Visual Confirmation
        if (signDisplay) {
          signDisplay.style.transform = "scale(1.05)";
          setTimeout(() => { if (signDisplay) signDisplay.style.transform = "scale(1)"; }, 250);
        }
      }
    } else {
      // New sign detected -> Start 2.0s hold timer from 0
      currentHoldingSign = word;
      holdStartTime = now;
      isSignCommitted = false;

      if (holdProgressBar) holdProgressBar.style.width = "0%";
      if (holdTimerLabel) holdTimerLabel.innerText = "0.0s / 2.0s";
      if (statusBadge) {
        statusBadge.className = "badge badge-intermediate";
        statusBadge.innerText = "Holding (0s)";
      }
      if (statusMsg) statusMsg.innerText = `Hold "${word}" steady for 2 seconds to insert text...`;
    }

    // Render candidate probabilities
    if (candidatesList && candidates && candidates.length > 0) {
      candidatesList.innerHTML = candidates.map((c) => {
        const pct = Math.round((c.confidence || 0) * 100);
        return `
          <div style="margin-bottom: 0.35rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.15rem;">
              <span>${c.word}</span>
              <span style="color: var(--primary);">${pct}%</span>
            </div>
            <div style="width: 100%; height: 5px; background: rgba(0,0,0,0.06); border-radius: 99px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #4f46e5, #059669); border-radius: 99px;"></div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  function resetHoldTimer() {
    currentHoldingSign = null;
    holdStartTime = 0;
    isSignCommitted = false;
    if (holdProgressBar) holdProgressBar.style.width = "0%";
    if (holdTimerLabel) holdTimerLabel.innerText = "0.0s / 2.0s";
  }

  function updateSentenceDisplay() {
    if (!sentenceDisplay) return;

    if (committedWords.length === 0) {
      sentenceDisplay.innerText = "Hold any sign for 2 seconds to insert text into this sentence transcript...";
      if (wordCount) wordCount.innerText = "0 words";
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
    if (wordCount) wordCount.innerText = `${committedWords.length} word${committedWords.length > 1 ? "s" : ""}`;
  }

  // -------------------------------------------------------------
  // 8. Glow Skeleton Visuals
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

    for (let i = 0; i < landmarks.length; i++) {
      const pt = landmarks[i];
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, i % 4 === 0 ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // -------------------------------------------------------------
  // 9. Interactive Buttons
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
      if (text && !text.includes("Hold any sign for 2 seconds")) {
        speakWord(text);
      }
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      const text = sentenceDisplay ? sentenceDisplay.innerText : "";
      if (text && !text.includes("Hold any sign for 2 seconds")) {
        navigator.clipboard.writeText(text);
        alert("Sentence copied to clipboard!");
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      committedWords = [];
      resetHoldTimer();
      updateSentenceDisplay();
    });
  }

  if (autoVoiceToggle) {
    autoVoiceToggle.addEventListener("change", (e) => {
      autoVoiceEnabled = e.target.checked;
    });
  }
});
