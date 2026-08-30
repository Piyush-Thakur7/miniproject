/**
 * SignBridge Meeting Mode & MediaPipe Client Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const video = document.getElementById("meetingWebcam");
  const canvas = document.getElementById("meetingCanvas");
  const ctx = canvas.getContext("2d");
  const placeholder = document.getElementById("meetingCamPlaceholder");
  const btnCam = document.getElementById("btnMeetingCam");

  const wordDisplay = document.getElementById("meetingDetectedWord");
  const confDisplay = document.getElementById("meetingConfidence");
  const sentenceDisplay = document.getElementById("meetingSentence");
  const captionText = document.getElementById("captionText");
  const autoTtsToggle = document.getElementById("autoSpeechToggle");

  const chatFeed = document.getElementById("chatFeed");
  const chatInput = document.getElementById("chatInput");
  const btnSend = document.getElementById("btnSendChat");

  let stream = null;
  let handsModel = null;
  let isPredicting = false;
  let lastPredictionTime = 0;
  let committedWords = [];
  let lastCommittedWord = null;
  let consecutiveCount = 0;
  let currentCandidate = null;

  // Initialize MediaPipe Hands for Meeting Mode
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

        handsModel.onResults(onMeetingHandResults);
      } catch (err) {
        console.warn("Meeting MediaPipe init error:", err);
      }
    }
  }
  initMediaPipe();

  // Camera toggle
  btnCam.addEventListener("click", async () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
      video.srcObject = null;
      placeholder.style.display = "flex";
      btnCam.innerHTML = '<i data-lucide="video"></i> Start Camera';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lucide.createIcons();
    } else {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        video.srcObject = stream;
        placeholder.style.display = "none";
        btnCam.innerHTML = '<i data-lucide="video-off"></i> Stop Camera';
        lucide.createIcons();

        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          startMeetingTrackingLoop();
        };
      } catch (err) {
        alert("Camera error: " + err.message);
      }
    }
  });

  async function startMeetingTrackingLoop() {
    async function loop() {
      if (!stream) return;
      if (handsModel && video.readyState >= 2) {
        try {
          await handsModel.send({ image: video });
        } catch (e) {}
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  async function onMeetingHandResults(results) {
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

    const now = Date.now();
    if (handsCount > 0 && now - lastPredictionTime > 130 && !isPredicting) {
      lastPredictionTime = now;
      isPredicting = true;

      const payload = {
        landmarks: { left_hand: leftHand, right_hand: rightHand },
        session_mode: "meeting"
      };

      const res = await SignBridgeAPI.predictFrame(payload);
      isPredicting = false;

      if (res && res.word) {
        handleMeetingPrediction(res.word, res.confidence);
      }
    } else if (handsCount === 0) {
      wordDisplay.innerText = "NONE";
      confDisplay.innerText = "0%";
    }
  }

  function handleMeetingPrediction(word, confidence) {
    if (confidence < 0.45) return;

    wordDisplay.innerText = word;
    const pct = Math.round(confidence * 100);
    confDisplay.innerText = `${pct}%`;

    if (confidence >= 0.65) {
      if (word === currentCandidate) {
        consecutiveCount++;
      } else {
        currentCandidate = word;
        consecutiveCount = 1;
      }

      if (consecutiveCount >= 2 && word !== lastCommittedWord) {
        lastCommittedWord = word;
        committedWords.push(word);

        let fullSentence = committedWords.join(" ").toLowerCase();
        fullSentence = fullSentence.charAt(0).toUpperCase() + fullSentence.slice(1);
        if (!fullSentence.endsWith(".") && !fullSentence.endsWith("?")) {
          const first = committedWords[0].toUpperCase();
          if (["WHAT", "WHERE", "WHEN", "WHY", "WHO", "HOW", "CAN", "ARE", "DO"].includes(first)) {
            fullSentence += "?";
          } else {
            fullSentence += ".";
          }
        }

        sentenceDisplay.innerText = fullSentence;
        captionText.innerText = fullSentence;

        if (autoTtsToggle.checked) {
          SignBridgeAPI.speakText(word);
        }

        if (fullSentence.endsWith(".") || fullSentence.endsWith("?")) {
          postChatMessage("You (via SignBridge)", fullSentence, true);
        }
      }
    }
  }

  function postChatMessage(sender, text, isMe = false) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${isMe ? 'chat-bubble-me' : 'chat-bubble-other'}`;
    bubble.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatFeed.appendChild(bubble);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  btnSend.addEventListener("click", () => {
    const msg = chatInput.value.trim();
    if (msg) {
      postChatMessage("You", msg, true);
      chatInput.value = "";
    }
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnSend.click();
  });
});
