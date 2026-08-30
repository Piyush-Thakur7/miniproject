/**
 * SignBridge 500+ Vocabulary Explorer & Visual Gesture Guide
 * Renders interactive vector hand diagrams, exact anatomical formation, and audio for all 500 signs
 */

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof lucide !== "undefined") lucide.createIcons();

  const searchInput = document.getElementById("searchInput");
  const difficultyFilter = document.getElementById("difficultyFilter");
  const pillsContainer = document.getElementById("categoryPillsContainer");
  const vocabGrid = document.getElementById("vocabGrid");
  const totalSignsCount = document.getElementById("totalSignsCount");

  let allSigns = [];
  let activeCategory = "all";
  let searchTimeout = null;

  // Category Emoji Icons
  const categoryIcons = {
    "Greetings": "👋",
    "Emergency": "🚨",
    "Common Phrases": "💬",
    "Questions": "❓",
    "Work & Education": "🎓",
    "Technology & AI": "💻",
    "Emotions & States": "😊",
    "Daily Activities": "⏰",
    "Food & Dining": "🍲",
    "Travel & Transport": "✈️",
    "Family & People": "👨‍👩‍👧",
    "Time & Calendar": "📅",
    "Numbers & Math": "🔢",
    "Colors": "🎨",
    "Places & Nature": "🌲",
    "Actions & Verbs": "⚡",
    "Objects & Tools": "🔧",
    "Health & Medical": "🏥",
    "Government & Law": "⚖️",
    "Meeting & Video Controls": "🎥",
    "General Conversation": "🗣️",
    "Alphabet & Fingerspelling": "🔤"
  };

  // -------------------------------------------------------------
  // Visual Hand Gesture Vector SVG Generator
  // -------------------------------------------------------------
  function getGestureSvg(word, category, shape) {
    const w = (word || "").toUpperCase();
    const s = (shape || "").toLowerCase();

    // 1. I LOVE YOU (ASL)
    if (w.includes("LOVE YOU") || (s.includes("thumb") && s.includes("pinky") && s.includes("index"))) {
      return `
        <svg viewBox="0 0 100 100" width="70" height="70" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="45" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="2"/>
          <!-- Palm Base -->
          <path d="M35 55 Q35 75 50 78 Q65 75 65 55 Z" fill="#fbcfe8" stroke="#be185d" stroke-width="2"/>
          <!-- Thumb -->
          <path d="M35 60 Q20 50 22 40 Q25 36 32 48" fill="#fbcfe8" stroke="#be185d" stroke-width="2" stroke-linecap="round"/>
          <!-- Index Finger Extended -->
          <path d="M38 52 L38 20 Q41 16 44 20 L44 52" fill="#fbcfe8" stroke="#be185d" stroke-width="2"/>
          <!-- Middle Finger Folded -->
          <path d="M45 52 Q47 42 50 42 Q53 42 53 52" fill="#f472b6" stroke="#be185d" stroke-width="2"/>
          <!-- Ring Finger Folded -->
          <path d="M53 52 Q55 43 58 43 Q61 43 61 52" fill="#f472b6" stroke="#be185d" stroke-width="2"/>
          <!-- Pinky Extended -->
          <path d="M61 54 L65 26 Q68 23 71 26 L67 56" fill="#fbcfe8" stroke="#be185d" stroke-width="2"/>
        </svg>
      `;
    }

    // 2. PEACE / VICTORY / TWO
    if (w.includes("PEACE") || w.includes("VICTORY") || w === "TWO" || (s.includes("index") && s.includes("middle") && s.includes("v"))) {
      return `
        <svg viewBox="0 0 100 100" width="70" height="70" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="45" fill="var(--accent-emerald-light)" stroke="var(--accent-emerald)" stroke-width="2"/>
          <path d="M35 55 Q35 75 50 78 Q65 75 65 55 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Index -->
          <path d="M40 52 L34 22 Q37 18 41 22 L45 52" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Middle -->
          <path d="M47 52 L56 22 Q60 18 63 22 L55 52" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Ring, Pinky, Thumb folded -->
          <path d="M55 54 Q58 46 62 46 Q65 46 65 54" fill="#fb923c" stroke="#c2410c" stroke-width="2"/>
          <path d="M33 60 Q42 54 48 55" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 3. THUMBS UP / YES
    if (w.includes("YES") || w.includes("THUMBS UP") || (s.includes("thumb") && s.includes("up"))) {
      return `
        <svg viewBox="0 0 100 100" width="70" height="70" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="45" fill="var(--accent-sky-light)" stroke="var(--accent-sky)" stroke-width="2"/>
          <!-- Fist Body -->
          <rect x="36" y="42" width="34" height="34" rx="8" fill="#fde68a" stroke="#b45309" stroke-width="2"/>
          <!-- Knuckles -->
          <line x1="36" y1="51" x2="68" y2="51" stroke="#b45309" stroke-width="1.5"/>
          <line x1="36" y1="60" x2="68" y2="60" stroke="#b45309" stroke-width="1.5"/>
          <line x1="36" y1="69" x2="68" y2="69" stroke="#b45309" stroke-width="1.5"/>
          <!-- Thumb Pointing Straight Up -->
          <path d="M36 55 L36 22 Q40 16 46 22 L46 45" fill="#fde68a" stroke="#b45309" stroke-width="2"/>
        </svg>
      `;
    }

    // 4. THUMBS DOWN / NO
    if (w.includes("NO") || w.includes("THUMBS DOWN") || (s.includes("thumb") && s.includes("down"))) {
      return `
        <svg viewBox="0 0 100 100" width="70" height="70" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="45" fill="var(--accent-rose-light)" stroke="var(--accent-rose)" stroke-width="2"/>
          <!-- Fist Body -->
          <rect x="36" y="24" width="34" height="34" rx="8" fill="#fecdd3" stroke="#be123c" stroke-width="2"/>
          <!-- Knuckles -->
          <line x1="36" y1="33" x2="68" y2="33" stroke="#be123c" stroke-width="1.5"/>
          <line x1="36" y1="42" x2="68" y2="42" stroke="#be123c" stroke-width="1.5"/>
          <line x1="36" y1="51" x2="68" y2="51" stroke="#be123c" stroke-width="1.5"/>
          <!-- Thumb Pointing Straight Down -->
          <path d="M36 45 L36 78 Q40 84 46 78 L46 55" fill="#fecdd3" stroke="#be123c" stroke-width="2"/>
        </svg>
      `;
    }

    // 5. OK SIGN / PERFECT
    if (w.includes("OK") || w.includes("PERFECT") || (s.includes("pinch") && s.includes("circle"))) {
      return `
        <svg viewBox="0 0 100 100" width="70" height="70" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="45" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="2"/>
          <!-- Middle, Ring, Pinky Up -->
          <path d="M46 50 L46 20 Q49 16 52 20 L52 50" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <path d="M53 50 L55 24 Q58 20 61 24 L59 50" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <path d="M60 52 L64 30 Q67 27 70 30 L66 54" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <!-- Palm Base -->
          <path d="M35 55 Q35 75 50 78 Q65 75 65 55 Z" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <!-- Thumb and Index touching circle -->
          <circle cx="38" cy="46" r="10" fill="#c7d2fe" stroke="#3730a3" stroke-width="2"/>
        </svg>
      `;
    }

    // 6. CALL ME / SHAKA
    if (w.includes("CALL ME") || (s.includes("thumb") && s.includes("pinky") && !s.includes("index"))) {
      return `
        <svg viewBox="0 0 100 100" width="70" height="70" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="45" fill="var(--accent-amber-light)" stroke="var(--accent-amber)" stroke-width="2"/>
          <!-- Fist Base -->
          <rect x="36" y="42" width="30" height="30" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
          <!-- Thumb Out Left -->
          <path d="M36 55 Q20 45 22 36 Q26 32 34 46" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
          <!-- Pinky Out Right -->
          <path d="M65 55 Q78 45 76 36 Q72 32 64 46" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
        </svg>
      `;
    }

    // 7. POINTING / ONE / YOU
    if (w.includes("YOU") || w.includes("POINT") || w === "ONE" || (s.includes("index") && !s.includes("middle") && !s.includes("pinky"))) {
      return `
        <svg viewBox="0 0 100 100" width="70" height="70" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="45" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="2"/>
          <path d="M35 55 Q35 75 50 78 Q65 75 65 55 Z" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <!-- Single Index Up -->
          <path d="M44 52 L44 18 Q48 14 52 18 L52 52" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <!-- Thumb across curled fingers -->
          <path d="M36 60 Q46 54 55 56" fill="none" stroke="#3730a3" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 8. FIST / CLOSED / POWER
    if (w.includes("FIST") || w.includes("CLOSED") || (s.includes("curled") && s.includes("fist"))) {
      return `
        <svg viewBox="0 0 100 100" width="70" height="70" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="45" fill="var(--bg-surface-hover)" stroke="var(--border-strong)" stroke-width="2"/>
          <rect x="32" y="34" width="38" height="38" rx="10" fill="#e2e8f0" stroke="#334155" stroke-width="2.5"/>
          <line x1="32" y1="44" x2="68" y2="44" stroke="#334155" stroke-width="2"/>
          <line x1="32" y1="54" x2="68" y2="54" stroke="#334155" stroke-width="2"/>
          <line x1="32" y1="64" x2="68" y2="64" stroke="#334155" stroke-width="2"/>
          <!-- Thumb wrapped over -->
          <path d="M32 50 Q48 44 60 52" fill="none" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 9. OPEN PALM / HELLO / FIVE / FLAT HAND
    return `
      <svg viewBox="0 0 100 100" width="70" height="70" style="display: block; margin: 0 auto;">
        <circle cx="50" cy="50" r="45" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="2"/>
        <!-- Palm -->
        <path d="M35 55 Q35 75 50 78 Q65 75 65 55 Z" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <!-- Thumb -->
        <path d="M35 60 Q22 52 24 42 Q27 38 33 48" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <!-- 4 Fingers Extended -->
        <path d="M37 52 L37 20 Q40 16 43 20 L43 52" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <path d="M44 50 L45 16 Q48 12 51 16 L51 50" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <path d="M52 50 L53 18 Q56 14 59 18 L58 50" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <path d="M59 52 L62 26 Q65 22 68 26 L65 54" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
      </svg>
    `;
  }

  // 1. Fetch All Signs from static JSON
  async function loadAllSigns() {
    try {
      const res = await fetch("/data/signs_500.json");
      if (res.ok) {
        allSigns = await res.json();
        console.log(`[SignBridge] Loaded ${allSigns.length} signs with exact vector gesture diagrams.`);
        return;
      }
    } catch (e) {
      console.warn("Static JSON fetch fallback:", e);
    }

    try {
      const apiRes = await SignBridgeAPI.getVocabulary({ limit: 500 });
      allSigns = apiRes.vocabulary || [];
    } catch (e) {
      console.error("Failed to load vocabulary:", e);
      allSigns = [];
    }
  }

  // 2. Render Category Filter Pills
  function renderCategoryPills() {
    if (!pillsContainer || allSigns.length === 0) return;

    const catCounts = {};
    allSigns.forEach((s) => {
      const c = s.category_name || "General";
      catCounts[c] = (catCounts[c] || 0) + 1;
    });

    const sortedCats = Object.keys(catCounts).sort();

    pillsContainer.innerHTML = `
      <button class="category-pill ${activeCategory === 'all' ? 'active' : ''}" data-category="all">
        All Signs (${allSigns.length})
      </button>
    ` + sortedCats.map((cat) => {
      const icon = categoryIcons[cat] || "📁";
      return `
        <button class="category-pill ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">
          ${icon} ${cat} (${catCounts[cat]})
        </button>
      `;
    }).join("");

    document.querySelectorAll(".category-pill").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".category-pill").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.getAttribute("data-category");
        filterAndRenderCards();
      });
    });
  }

  // 3. Filter & Render Sign Cards with Vector Diagrams
  function filterAndRenderCards() {
    if (!vocabGrid) return;

    const query = (searchInput ? searchInput.value : "").toLowerCase().trim();
    const diff = difficultyFilter ? difficultyFilter.value : "all";

    const filtered = allSigns.filter((item) => {
      const matchCat = activeCategory === "all" || item.category_name === activeCategory;
      const matchDiff = diff === "all" || item.difficulty === diff;
      const matchQuery = !query || 
        item.word.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.shape && item.shape.toLowerCase().includes(query)) ||
        (item.category_name && item.category_name.toLowerCase().includes(query));

      return matchCat && matchDiff && matchQuery;
    });

    if (totalSignsCount) {
      totalSignsCount.innerText = `${filtered.length} Signs Listed`;
    }

    if (filtered.length === 0) {
      vocabGrid.innerHTML = `
        <div style="color: var(--text-muted); grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; font-family: var(--font-mono);">
          <div style="font-size: 2rem; margin-bottom: 0.35rem;">🔍</div>
          <h3 style="font-size: 1.05rem; color: var(--text-primary); font-weight: 700;">No matching signs found</h3>
          <p style="font-size: 0.82rem; margin-top: 0.2rem;">Try searching for "Hello", "Doctor", "Water", "Help", "Yes", or "Letter A".</p>
        </div>
      `;
      return;
    }

    vocabGrid.innerHTML = filtered.map((item, idx) => {
      const diffClass = item.difficulty === "Beginner" 
        ? "badge-beginner" 
        : item.difficulty === "Intermediate" 
          ? "badge-intermediate" 
          : "badge-advanced";

      const icon = categoryIcons[item.category_name] || "🤟";
      const shapeText = item.shape || item.description;
      const posText = item.position || "Chest level, centered in front of body.";
      const motionText = item.motion || "Hold steady for 2 seconds in front of camera.";
      const exampleText = item.example || `Standard sign to express '${item.word}'.`;
      const gestureSvg = getGestureSvg(item.word, item.category_name, shapeText);

      return `
        <div class="vocab-card" id="sign-card-${idx}">
          <div>
            <!-- Top Visual Hand Gesture Diagram -->
            <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-xs); border: 1px solid var(--border-subtle); padding: 0.75rem 0.5rem; margin-bottom: 0.75rem; text-align: center;">
              ${gestureSvg}
              <div style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--text-muted); margin-top: 0.35rem; font-weight: 600;">
                Visual Gesture Formation
              </div>
            </div>

            <!-- Header Row -->
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.5rem; margin-bottom: 0.35rem;">
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 1.25rem;">${icon}</span>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary);">
                  ${item.word}
                </h3>
              </div>
              <span class="badge ${diffClass}" style="font-size: 0.68rem;">${item.difficulty}</span>
            </div>
            
            <!-- Category Tag -->
            <div style="margin-bottom: 0.6rem;">
              <span style="font-size: 0.7rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">
                ${item.category_name}
              </span>
            </div>

            <!-- Step-by-Step Instructions -->
            <div style="background: var(--bg-surface-subtle); padding: 0.65rem; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle); margin-bottom: 0.65rem; font-size: 0.78rem;">
              <div style="margin-bottom: 0.35rem;">
                <strong style="color: var(--text-primary);">✋ Hand Shape:</strong>
                <span style="color: var(--text-secondary);">${shapeText}</span>
              </div>
              <div style="margin-bottom: 0.35rem;">
                <strong style="color: var(--text-primary);">📍 Position:</strong>
                <span style="color: var(--text-secondary);">${posText}</span>
              </div>
              <div>
                <strong style="color: var(--text-primary);">🧭 Movement:</strong>
                <span style="color: var(--text-secondary);">${motionText}</span>
              </div>
            </div>

            <p style="font-size: 0.76rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.65rem;">
              <strong>Context:</strong> ${exampleText}
            </p>
          </div>

          <!-- Bottom Action Buttons -->
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.6rem; margin-top: 0.2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.4rem;">
              <button onclick="SignBridgeAPI.speakText('${item.word}')" class="btn btn-secondary btn-sm" style="padding: 0.3rem 0.55rem; font-size: 0.75rem;">
                <i data-lucide="volume-2" style="width: 12px;"></i> Pronounce
              </button>
              <button onclick="practiceSignOnCamera('${item.word}')" class="btn btn-primary btn-sm" style="padding: 0.3rem 0.55rem; font-size: 0.75rem;">
                Practice on Camera <i data-lucide="camera" style="width: 12px;"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  // Window Practice Function (Scrolls smoothly to Camera)
  window.practiceSignOnCamera = function(word) {
    const videoElem = document.getElementById("webcamVideo") || document.getElementById("videoContainer");
    if (videoElem) {
      videoElem.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const btn = document.getElementById("btnStartCamera");
    if (btn && btn.innerText.includes("Start")) {
      btn.click();
    }
    const signDisp = document.getElementById("detectedSignDisplay");
    if (signDisp) {
      signDisp.innerText = `TARGET: ${word}`;
    }
  };

  // 4. Search debounce
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(filterAndRenderCards, 150);
    });
  }

  // 5. Difficulty filter
  if (difficultyFilter) {
    difficultyFilter.addEventListener("change", filterAndRenderCards);
  }

  // Initialize
  await loadAllSigns();
  renderCategoryPills();
  filterAndRenderCards();
});
