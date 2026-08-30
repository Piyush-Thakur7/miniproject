/**
 * SignBridge 500+ Vocabulary Explorer & UN SDG Execution Guide
 * Renders exact hand formation, positions, motions, and voice pronunciation for all 500 signs
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

  // Category Emoji Mapping
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

  // SDG Mapping
  function getSdgTag(category) {
    if (category.includes("Emergency") || category.includes("Health")) {
      return '<span class="sdg-badge-3">SDG 3 &bull; Health & Emergency</span>';
    }
    if (category.includes("Education") || category.includes("Work") || category.includes("Alphabet")) {
      return '<span class="sdg-badge-4">SDG 4 &bull; Inclusive Education</span>';
    }
    if (category.includes("Technology") || category.includes("AI")) {
      return '<span class="sdg-badge-9">SDG 9 &bull; Assistive Innovation</span>';
    }
    return '<span class="sdg-badge-10">SDG 10 &bull; Reduced Inequalities</span>';
  }

  // 1. Fetch All Signs from static JSON
  async function loadAllSigns() {
    try {
      const res = await fetch("/data/signs_500.json");
      if (res.ok) {
        allSigns = await res.json();
        console.log(`[SignBridge] Loaded ${allSigns.length} detailed signs from JSON!`);
        return;
      }
    } catch (e) {
      console.warn("Static JSON fetch failed, trying REST API:", e);
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
        🌟 All Signs (${allSigns.length})
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

  // 3. Filter & Render Sign Cards with Step-by-Step Instructions
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
      totalSignsCount.innerText = `${filtered.length} Signs Shown`;
    }

    if (filtered.length === 0) {
      vocabGrid.innerHTML = `
        <div style="color: var(--text-muted); grid-column: span 3; text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
          <h3 style="font-size: 1.15rem; color: var(--text-primary); font-weight: 700;">No matching signs found</h3>
          <p style="font-size: 0.88rem; margin-top: 0.25rem;">Try searching for "Hello", "Help", "Doctor", "Water", "Yes", or "A".</p>
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
      const sdgBadge = getSdgTag(item.category_name || "");

      const shapeText = item.shape || item.description;
      const posText = item.position || "Chest level, centered in front of body.";
      const motionText = item.motion || "Hold steady for 2 seconds in front of camera.";
      const exampleText = item.example || `Used to express '${item.word}' in daily communication.`;

      return `
        <div class="vocab-card" id="sign-card-${idx}">
          <div>
            <!-- Header Row -->
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.5rem; margin-bottom: 0.4rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.4rem;">${icon}</span>
                <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.01em;">
                  ${item.word}
                </h3>
              </div>
              <span class="badge ${diffClass}" style="font-size: 0.72rem;">${item.difficulty}</span>
            </div>
            
            <!-- Category & SDG Tag -->
            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
              <span style="font-size: 0.72rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">
                ${item.category_name}
              </span>
              ${sdgBadge}
            </div>

            <!-- Step-by-Step Hand Formation Breakdown -->
            <div style="background: var(--bg-surface-subtle); padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 0.75rem; font-size: 0.83rem;">
              <div style="margin-bottom: 0.4rem;">
                <strong style="color: var(--text-primary);"><i data-lucide="hand" style="width: 12px; display: inline-block; vertical-align: middle;"></i> Hand Shape:</strong>
                <span style="color: var(--text-secondary);">${shapeText}</span>
              </div>
              <div style="margin-bottom: 0.4rem;">
                <strong style="color: var(--text-primary);"><i data-lucide="map-pin" style="width: 12px; display: inline-block; vertical-align: middle;"></i> Position:</strong>
                <span style="color: var(--text-secondary);">${posText}</span>
              </div>
              <div>
                <strong style="color: var(--text-primary);"><i data-lucide="activity" style="width: 12px; display: inline-block; vertical-align: middle;"></i> Movement:</strong>
                <span style="color: var(--text-secondary);">${motionText}</span>
              </div>
            </div>

            <!-- Purpose & Real-World Example -->
            <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 0.75rem;">
              <strong>🎯 Purpose & Context:</strong> ${exampleText}
            </p>
          </div>

          <!-- Bottom Action Buttons -->
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; margin-top: 0.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
              <button onclick="SignBridgeAPI.speakText('${item.word}')" class="btn btn-secondary btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">
                <i data-lucide="volume-2" style="width: 13px;"></i> Pronounce
              </button>
              <a href="/?practice=${encodeURIComponent(item.word)}" class="btn btn-primary btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">
                Practice on Camera <i data-lucide="camera" style="width: 13px;"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  // 4. Search input debounce
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
