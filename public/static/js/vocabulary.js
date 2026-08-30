/**
 * SignBridge 500+ Vocabulary Explorer & SDG Purpose Guide
 * Zero-latency local JSON search with voice pronunciation and camera deep-links
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

  // Category Emoji Mapping for Senior Visual Polish
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
    "General Conversation": "🗣️"
  };

  // SDG Mapping based on category
  function getSdgTag(category) {
    if (category.includes("Emergency") || category.includes("Health")) {
      return '<span class="sdg-badge-3">SDG 3 &bull; Health</span>';
    }
    if (category.includes("Education") || category.includes("Work")) {
      return '<span class="sdg-badge-4">SDG 4 &bull; Education</span>';
    }
    if (category.includes("Technology") || category.includes("AI")) {
      return '<span class="sdg-badge-9">SDG 9 &bull; Innovation</span>';
    }
    return '<span class="sdg-badge-10">SDG 10 &bull; Inclusion</span>';
  }

  // 1. Fetch All Signs (Static JSON first, then REST API fallback)
  async function loadAllSigns() {
    try {
      const res = await fetch("/data/signs_500.json");
      if (res.ok) {
        allSigns = await res.json();
        console.log(`[SignBridge] Loaded ${allSigns.length} signs from static JSON!`);
        return;
      }
    } catch (e) {
      console.warn("Static JSON fetch fallback, trying REST API:", e);
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

    // Count per category
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

    // Pill click listener
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
          <h3 style="font-size: 1.1rem; color: var(--text-primary);">No matching signs found</h3>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Try searching for "Hello", "Doctor", "Water", "School", or "Yes".</p>
        </div>
      `;
      return;
    }

    vocabGrid.innerHTML = filtered.map((item) => {
      const diffClass = item.difficulty === "Beginner" 
        ? "badge-beginner" 
        : item.difficulty === "Intermediate" 
          ? "badge-intermediate" 
          : "badge-advanced";

      const icon = categoryIcons[item.category_name] || "🤟";
      const sdgBadge = getSdgTag(item.category_name || "");

      return `
        <div class="vocab-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.5rem; margin-bottom: 0.4rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.35rem;">${icon}</span>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.01em;">
                  ${item.word}
                </h3>
              </div>
              <span class="badge ${diffClass}" style="font-size: 0.72rem;">${item.difficulty}</span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.65rem;">
              <span style="font-size: 0.72rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">
                ${item.category_name}
              </span>
              ${sdgBadge}
            </div>

            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.65rem;">
              ${item.description}
            </p>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.65rem; margin-top: 0.65rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.6rem;">
              💡 <em>${item.tips || "Maintain clear finger positions."}</em>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
              <button onclick="SignBridgeAPI.speakText('${item.word}')" class="btn btn-secondary btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">
                <i data-lucide="volume-2" style="width: 13px;"></i> Pronounce
              </button>
              <a href="/?practice=${encodeURIComponent(item.word)}" class="btn btn-primary btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;">
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
