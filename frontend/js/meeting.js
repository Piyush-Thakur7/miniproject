/**
 * SignBridge Meeting Mode Client Logic
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
  let socket = null;
  let sendInterval = null;
  let offscreen = document.createElement("canvas");
  let offCtx = offscreen.getContext("2d");
  let lastCommittedSentence = "";

  function initWS() {
    socket = SignBridgeAPI.connectLiveWebSocket(
      (data) => handleMeetingPrediction(data),
      (err) => console.error("Meeting WS err:", err),
      () => setTimeout(initWS, 3000)
    );
  }
  initWS();

  // Camera toggle
  btnCam.addEventListener("click", async () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
      video.srcObject = null;
      placeholder.style.display = "flex";
      btnCam.innerHTML = '<i data-lucide="video"></i> Start Camera';
      clearInterval(sendInterval);
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
          offscreen.width = 320;
          offscreen.height = 240;

          clearInterval(sendInterval);
          sendInterval = setInterval(() => {
            if (!stream || !socket || socket.readyState !== WebSocket.OPEN) return;
            offCtx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
            socket.send(JSON.stringify({
              type: "frame",
              image: offscreen.toDataURL("image/jpeg", 0.5)
            }));
          }, 70);
        };
      } catch (err) {
        alert("Camera error: " + err.message);
      }
    }
  });

  // Handle predictions in meeting mode
  function handleMeetingPrediction(data) {
    if (data.type !== "prediction") return;

    wordDisplay.innerText = data.word || "NONE";
    const pct = Math.round((data.confidence || 0) * 100);
    confDisplay.innerText = `${pct}%`;

    // Render Canvas Landmarks
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (data.landmarks) {
      if (data.landmarks.left_hand && data.landmarks.left_hand.length > 0) {
        SignBridgeAPI.drawHandMesh(ctx, data.landmarks.left_hand, canvas.width, canvas.height, "#38bdf8");
      }
      if (data.landmarks.right_hand && data.landmarks.right_hand.length > 0) {
        SignBridgeAPI.drawHandMesh(ctx, data.landmarks.right_hand, canvas.width, canvas.height, "#34d399");
      }
    }

    if (data.sentence) {
      sentenceDisplay.innerText = data.sentence;
      captionText.innerText = data.sentence;

      // On new committed word / sentence
      if (data.is_new_word && data.sentence !== lastCommittedSentence) {
        lastCommittedSentence = data.sentence;

        if (autoTtsToggle.checked) {
          SignBridgeAPI.speakText(data.word);
        }

        // Auto post to meeting chat if sentence finished
        if (data.sentence.endsWith(".") || data.sentence.endsWith("?")) {
          postChatMessage("You (via SignBridge)", data.sentence, true);
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
