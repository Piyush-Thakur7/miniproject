/**
 * SignBridge Video File Upload Client Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const dropzone = document.getElementById("videoDropzone");
  const fileInput = document.getElementById("videoFileInput");
  const previewPlayer = document.getElementById("previewVideoPlayer");
  const previewPlaceholder = document.getElementById("previewPlaceholder");

  const progressContainer = document.getElementById("progressContainer");
  const progressBarFill = document.getElementById("progressBarFill");
  const progressStatusLabel = document.getElementById("progressStatusLabel");
  const progressPercentage = document.getElementById("progressPercentage");

  const resultsSection = document.getElementById("resultsSection");
  const metaDuration = document.getElementById("metaDuration");
  const metaFrames = document.getElementById("metaFrames");
  const metaLatency = document.getElementById("metaLatency");
  const metaSignsCount = document.getElementById("metaSignsCount");
  const fullTranscript = document.getElementById("fullTranscriptText");
  const segmentsTableBody = document.getElementById("segmentsTableBody");

  const btnSpeak = document.getElementById("btnSpeakTranscript");
  const btnCopy = document.getElementById("btnCopyTranscript");
  const btnDownloadJson = document.getElementById("btnDownloadJson");

  let latestResponseData = null;

  // Drag & Drop Handlers
  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelected(files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  async function handleFileSelected(file) {
    // 1. Setup local video preview
    const videoUrl = URL.createObjectURL(file);
    previewPlayer.src = videoUrl;
    previewPlayer.style.display = "block";
    previewPlaceholder.style.display = "none";

    // 2. Show Progress Bar
    progressContainer.style.display = "block";
    progressBarFill.style.width = "10%";
    progressPercentage.innerText = "10%";
    progressStatusLabel.innerText = "Uploading & extracting video frames...";
    resultsSection.style.display = "none";

    try {
      // 3. Upload & Process Video
      const response = await SignBridgeAPI.uploadVideo(file, (pct) => {
        const scaled = Math.min(85, pct);
        progressBarFill.style.width = `${scaled}%`;
        progressPercentage.innerText = `${scaled}%`;
      });

      progressBarFill.style.width = "100%";
      progressPercentage.innerText = "100%";
      progressStatusLabel.innerText = "Analysis Complete!";

      latestResponseData = response;
      renderResults(response);
    } catch (err) {
      alert("Video processing failed: " + err.message);
      progressStatusLabel.innerText = "Error: " + err.message;
      progressBarFill.style.background = "var(--accent-rose)";
    }
  }

  function renderResults(data) {
    resultsSection.style.display = "block";
    metaDuration.innerText = `${data.duration_seconds}s`;
    metaFrames.innerText = data.total_frames;
    metaLatency.innerText = `${data.inference_time_ms} ms`;
    metaSignsCount.innerText = data.total_signs_detected;

    fullTranscript.innerText = data.recognized_text || "NO SIGN RECOGNIZED";

    // Render Segments Table
    if (data.segments && data.segments.length > 0) {
      segmentsTableBody.innerHTML = data.segments.map((seg) => {
        const confPct = Math.round(seg.confidence * 100);
        return `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
            <td style="padding: 0.75rem 1rem; color: var(--primary); font-weight: 600;">
              ${seg.timestamp_label}
            </td>
            <td style="padding: 0.75rem 1rem; font-weight: 700;">
              ${seg.word}
            </td>
            <td style="padding: 0.75rem 1rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 60px; height: 6px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden;">
                  <div style="width: ${confPct}%; height: 100%; background: var(--accent-emerald); border-radius: 99px;"></div>
                </div>
                <span>${confPct}%</span>
              </div>
            </td>
            <td style="padding: 0.75rem 1rem;">
              <span class="badge badge-beginner">Verified</span>
            </td>
          </tr>
        `;
      }).join("");
    } else {
      segmentsTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="padding: 1rem; text-align: center; color: var(--text-muted);">
            No clear sign language sequence detected above confidence threshold.
          </td>
        </tr>
      `;
    }

    resultsSection.scrollIntoView({ behavior: "smooth" });
  }

  btnSpeak.addEventListener("click", () => {
    if (latestResponseData && latestResponseData.recognized_text) {
      SignBridgeAPI.speakText(latestResponseData.recognized_text);
    }
  });

  btnCopy.addEventListener("click", () => {
    if (latestResponseData && latestResponseData.recognized_text) {
      navigator.clipboard.writeText(latestResponseData.recognized_text);
      alert("Transcript copied to clipboard!");
    }
  });

  btnDownloadJson.addEventListener("click", () => {
    if (!latestResponseData) return;
    const blob = new Blob([JSON.stringify(latestResponseData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signbridge_transcript_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
});
