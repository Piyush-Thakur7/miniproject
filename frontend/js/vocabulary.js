/**
 * SignBridge 500+ Vocabulary Explorer Logic
 */

document.addEventListener("DOMContentLoaded", async () => {
  lucide.createIcons();

  const searchInput = document.getElementById("searchInput");
  const difficultyFilter = document.getElementById("difficultyFilter");
  const pillsContainer = document.getElementById("categoryPillsContainer");
  const vocabGrid = document.getElementById("vocabGrid");
  const totalSignsCount = document.getElementById("totalSignsCount");

  let activeCategory = "all";
  let searchTimeout = null;

  // Load Categories & Render Pills
  async function loadCategories() {
    const data = await SignBridgeAPI.getCategories();
    if (data.categories && data.categories.length > 0) {
      pillsContainer.innerHTML = `
        <button class="category-pill ${activeCategory === 'all' ? 'active' : ''}" data-category="all">
          All Categories
        </button>
      ` + data.categories.map((cat) => `
        <button class="category-pill ${activeCategory === cat.name ? 'active' : ''}" data-category="${cat.name}">
          ${cat.name} (${cat.count})
        </button>
      `).join("");

      // Add click listeners to pills
      document.querySelectorAll(".category-pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".category-pill").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          activeCategory = btn.getAttribute("data-category");
          fetchAndRenderVocabulary();
        });
      });
    }
  }

  // Fetch & Render Vocabulary Cards
  async function fetchAndRenderVocabulary() {
    vocabGrid.innerHTML = `
      <div style="color: var(--text-muted); grid-column: span 3; text-align: center; padding: 3rem;">
        Searching dictionary...
      </div>
    `;

    const params = {
      category: activeCategory,
      difficulty: difficultyFilter.value,
      search: searchInput.value.trim(),
      limit: 500
    };

    const res = await SignBridgeAPI.getVocabulary(params);
    const items = res.vocabulary || [];

    totalSignsCount.innerText = `${res.count} Signs Shown`;

    if (items.length === 0) {
      vocabGrid.innerHTML = `
        <div style="color: var(--text-muted); grid-column: span 3; text-align: center; padding: 3rem;">
          No sign matches found for "${searchInput.value}". Try another keyword or category.
        </div>
      `;
      return;
    }

    vocabGrid.innerHTML = items.map((item) => {
      const diffClass = item.difficulty === "Beginner" 
        ? "badge-beginner" 
        : item.difficulty === "Intermediate" 
          ? "badge-intermediate" 
          : "badge-advanced";

      return `
        <div class="vocab-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
              <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">
                ${item.word}
              </h3>
              <span class="badge ${diffClass}">${item.difficulty}</span>
            </div>
            
            <div style="font-size: 0.75rem; color: var(--primary); font-weight: 600; text-transform: uppercase; margin-bottom: 0.75rem;">
              📁 ${item.category_name}
            </div>

            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 0.75rem;">
              ${item.description}
            </p>
          </div>

          <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; margin-top: 0.75rem;">
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem;">
              💡 <em>${item.tips || "Maintain clear hand visibility."}</em>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <button onclick="SignBridgeAPI.speakText('${item.word}')" class="btn btn-secondary btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
                <i data-lucide="volume-2" style="width: 12px;"></i> Speak
              </button>
              <a href="/live" class="btn btn-primary btn-sm" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
                Practice <i data-lucide="arrow-right" style="width: 12px;"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join("");

    lucide.createIcons();
  }

  // Search input debounce
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchAndRenderVocabulary, 250);
  });

  // Difficulty filter change
  difficultyFilter.addEventListener("change", fetchAndRenderVocabulary);

  // Initial loads
  await loadCategories();
  await fetchAndRenderVocabulary();
});
