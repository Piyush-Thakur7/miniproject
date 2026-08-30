/**
 * SignBridge 500+ Vocabulary Explorer
 * Clean, fast client-side JSON search with exact hand formation and motion instructions
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

  // 1. Fetch All Signs from static JSON
  async function loadAllSigns() {
    try {
      const res = await fetch("/data/signs_500.json");
      if (res.ok) {
        allSigns = await res.json();
        console.log(`[SignBridge] Loaded ${allSigns.length} signs from static JSON.`);
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

  // 3. Filter & Render Sign Cards
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

      return `
        <div class="vocab-card" id="sign-card-${idx}">
          <div>
            <!-- Header Row -->
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.5rem; margin-bottom: 0.35rem;">
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span style="font-size: 1.25rem;">${icon}</span>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">
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
              <div style="margin-bottom: 0.3rem;">
                <strong style="color: var(--text-primary);">✋ Hand Shape:</strong>
                <span style="color: var(--text-secondary);">${shapeText}</span>
              </div>
              <div style="margin-bottom: 0.3rem;">
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
              <a href="/?practice=${encodeURIComponent(item.word)}" class="btn btn-primary btn-sm" style="padding: 0.3rem 0.55rem; font-size: 0.75rem;">
                Practice on Camera <i data-lucide="camera" style="width: 12px;"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (typeof lucide !== "undefined") lucide.createIcons();
  }

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
