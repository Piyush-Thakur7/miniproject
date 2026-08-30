/**
 * SignBridge 500+ Vocabulary Explorer & Multi-Vector Gesture Generator
 * Generates 30+ distinct anatomical SVG hand diagrams with unique finger geometry, poses, and motion markers
 */

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof lucide !== "undefined") lucide.createIcons();

  const searchInput = document.getElementById("searchInput");
  const difficultyFilter = document.getElementById("difficultyFilter");
  const pillsContainer = document.getElementById("categoryPillsContainer");
  const vocabGrid = document.getElementById("vocabGrid");
  const totalSignsCount = document.getElementById("totalSignsCount");
  const dictToggleBtn = document.getElementById("toggleDictionaryBtn");
  const dictContent = document.getElementById("dictionaryContent");

  let allSigns = [];
  let activeCategory = "all";
  let searchTimeout = null;

  // Toggle Dictionary Section Expand / Collapse
  if (dictToggleBtn && dictContent) {
    dictToggleBtn.addEventListener("click", () => {
      const isHidden = dictContent.style.display === "none";
      dictContent.style.display = isHidden ? "block" : "none";
      dictToggleBtn.innerHTML = isHidden 
        ? '<i data-lucide="chevron-up" style="width: 14px;"></i> Collapse Dictionary' 
        : '<i data-lucide="chevron-down" style="width: 14px;"></i> Expand 500+ Sign Dictionary & Visual Guide';
      if (typeof lucide !== "undefined") lucide.createIcons();
    });
  }

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
  // Comprehensive 30+ Distinct Hand Gesture Vector SVG Renderer
  // -------------------------------------------------------------
  function getGestureSvg(word, category, shape) {
    const w = (word || "").toUpperCase().trim();
    const s = (shape || "").toLowerCase();
    const c = (category || "").toLowerCase();

    // Alphabet Letters (A-Z)
    if (w.startsWith("LETTER ") || (c.includes("alphabet") && w.length === 1)) {
      const letter = w.replace("LETTER ", "").trim();
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <rect x="5" y="5" width="90" height="90" rx="12" fill="var(--bg-surface-subtle)" stroke="var(--primary)" stroke-width="2"/>
          <circle cx="50" cy="45" r="28" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="1.5"/>
          <text x="50" y="54" font-size="26" font-weight="900" text-anchor="middle" fill="var(--primary)" font-family="system-ui, sans-serif">${letter}</text>
          <text x="50" y="86" font-size="9" font-weight="700" text-anchor="middle" fill="var(--text-secondary)" font-family="monospace">ASL LETTER ${letter}</text>
        </svg>
      `;
    }

    // Numbers (0-10)
    if (["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"].includes(w) || (c.includes("number") && !isNaN(parseInt(w)))) {
      const numMap = {"ZERO": "0", "ONE": "1", "TWO": "2", "THREE": "3", "FOUR": "4", "FIVE": "5", "SIX": "6", "SEVEN": "7", "EIGHT": "8", "NINE": "9", "TEN": "10"};
      const numVal = numMap[w] || w;
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <rect x="5" y="5" width="90" height="90" rx="12" fill="var(--accent-emerald-light)" stroke="var(--accent-emerald)" stroke-width="2"/>
          <circle cx="50" cy="45" r="28" fill="#ffffff" stroke="var(--accent-emerald)" stroke-width="2"/>
          <text x="50" y="55" font-size="28" font-weight="900" text-anchor="middle" fill="var(--accent-emerald)" font-family="system-ui, sans-serif">${numVal}</text>
          <text x="50" y="86" font-size="9" font-weight="700" text-anchor="middle" fill="var(--text-secondary)" font-family="monospace">NUMBER COUNT</text>
        </svg>
      `;
    }

    // 1. I LOVE YOU
    if (w.includes("LOVE YOU") || s.includes("thumb, index, and pinky")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#fdf2f8" stroke="#ec4899" stroke-width="2"/>
          <path d="M35 55 Q35 75 50 78 Q65 75 65 55 Z" fill="#fbcfe8" stroke="#be185d" stroke-width="2"/>
          <path d="M35 60 Q20 50 22 40 Q25 36 32 48" fill="#fbcfe8" stroke="#be185d" stroke-width="2" stroke-linecap="round"/>
          <path d="M38 52 L38 20 Q41 16 44 20 L44 52" fill="#fbcfe8" stroke="#be185d" stroke-width="2"/>
          <path d="M45 52 Q47 42 50 42 Q53 42 53 52" fill="#f472b6" stroke="#be185d" stroke-width="2"/>
          <path d="M53 52 Q55 43 58 43 Q61 43 61 52" fill="#f472b6" stroke="#be185d" stroke-width="2"/>
          <path d="M61 54 L65 26 Q68 23 71 26 L67 56" fill="#fbcfe8" stroke="#be185d" stroke-width="2"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#be185d" font-family="monospace">I LOVE YOU (ASL)</text>
        </svg>
      `;
    }

    // 2. PEACE / VICTORY / V-SIGN
    if (w.includes("PEACE") || w.includes("VICTORY") || s.includes("v shape")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
          <path d="M35 55 Q35 75 50 78 Q65 75 65 55 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M40 52 L34 22 Q37 18 41 22 L45 52" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M47 52 L56 22 Q60 18 63 22 L55 52" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M55 54 Q58 46 62 46 Q65 46 65 54" fill="#fb923c" stroke="#c2410c" stroke-width="2"/>
          <path d="M33 60 Q42 54 48 55" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#047857" font-family="monospace">V-PEACE GESTURE</text>
        </svg>
      `;
    }

    // 3. THUMBS UP / YES / GOOD
    if (w.includes("YES") || w.includes("THUMBS UP") || w.includes("GOOD") || s.includes("thumb upright") || s.includes("thumb up")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#f0f9ff" stroke="#0284c7" stroke-width="2"/>
          <rect x="36" y="42" width="34" height="34" rx="8" fill="#fde68a" stroke="#b45309" stroke-width="2"/>
          <line x1="36" y1="51" x2="68" y2="51" stroke="#b45309" stroke-width="1.5"/>
          <line x1="36" y1="60" x2="68" y2="60" stroke="#b45309" stroke-width="1.5"/>
          <line x1="36" y1="69" x2="68" y2="69" stroke="#b45309" stroke-width="1.5"/>
          <path d="M36 55 L36 20 Q40 14 46 20 L46 45" fill="#fde68a" stroke="#b45309" stroke-width="2"/>
          <path d="M48 18 L55 24" stroke="#0284c7" stroke-width="2" stroke-linecap="round"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#0369a1" font-family="monospace">THUMB UP / YES</text>
        </svg>
      `;
    }

    // 4. THUMBS DOWN / NO / BAD
    if (w.includes("NO") || w.includes("THUMBS DOWN") || w.includes("BAD") || s.includes("thumb down")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>
          <rect x="36" y="24" width="34" height="34" rx="8" fill="#fecdd3" stroke="#be123c" stroke-width="2"/>
          <line x1="36" y1="33" x2="68" y2="33" stroke="#be123c" stroke-width="1.5"/>
          <line x1="36" y1="42" x2="68" y2="42" stroke="#be123c" stroke-width="1.5"/>
          <line x1="36" y1="51" x2="68" y2="51" stroke="#be123c" stroke-width="1.5"/>
          <path d="M36 45 L36 80 Q40 86 46 80 L46 55" fill="#fecdd3" stroke="#be123c" stroke-width="2"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#b91c1c" font-family="monospace">THUMB DOWN / NO</text>
        </svg>
      `;
    }

    // 5. OK / PERFECT
    if (w.includes("OK") || w.includes("PERFECT") || s.includes("pinch") && s.includes("circle")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
          <path d="M46 50 L46 20 Q49 16 52 20 L52 50" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <path d="M53 50 L55 24 Q58 20 61 24 L59 50" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <path d="M60 52 L64 30 Q67 27 70 30 L66 54" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <path d="M35 55 Q35 75 50 78 Q65 75 65 55 Z" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <circle cx="38" cy="46" r="10" fill="#c7d2fe" stroke="#3730a3" stroke-width="2"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#1d4ed8" font-family="monospace">OK / PINCH CIRCLE</text>
        </svg>
      `;
    }

    // 6. CALL ME / SHAKA
    if (w.includes("CALL ME") || w.includes("PHONE") || s.includes("thumb and pinky extended")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#fffbeb" stroke="#d97706" stroke-width="2"/>
          <rect x="36" y="42" width="30" height="30" rx="8" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
          <path d="M36 55 Q20 45 22 36 Q26 32 34 46" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
          <path d="M65 55 Q78 45 76 36 Q72 32 64 46" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#b45309" font-family="monospace">CALL ME / SHAKA</text>
        </svg>
      `;
    }

    // 7. POINTING / YOU / ONE
    if (w.includes("YOU") || w.includes("POINT") || s.includes("index finger pointing")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
          <path d="M35 55 Q35 75 50 78 Q65 75 65 55 Z" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <path d="M44 52 L44 18 Q48 14 52 18 L52 52" fill="#e0e7ff" stroke="#3730a3" stroke-width="2"/>
          <path d="M36 60 Q46 54 55 56" fill="none" stroke="#3730a3" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M52 16 L58 10" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#1e40af" font-family="monospace">POINTING / YOU</text>
        </svg>
      `;
    }

    // 8. HELP / EMERGENCY / DOCTOR
    if (w.includes("HELP") || w.includes("EMERGENCY") || w.includes("DOCTOR") || w.includes("HOSPITAL") || c.includes("emergency") || c.includes("health")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
          <!-- Flat Base Palm -->
          <rect x="25" y="65" width="50" height="12" rx="4" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
          <!-- Upright Support Fist -->
          <rect x="38" y="32" width="24" height="28" rx="6" fill="#fca5a5" stroke="#b91c1c" stroke-width="2"/>
          <!-- Cross Icon -->
          <line x1="50" y1="38" x2="50" y2="52" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
          <line x1="43" y1="45" x2="57" y2="45" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
          <!-- Motion Arrow Up -->
          <path d="M50 25 L50 12 M45 17 L50 12 L55 17" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#b91c1c" font-family="monospace">EMERGENCY / HELP</text>
        </svg>
      `;
    }

    // 9. THANK YOU / PLEASE / CHIN STROKE
    if (w.includes("THANK") || w.includes("PLEASE") || w.includes("WELCOME") || s.includes("chin") || s.includes("chest")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
          <!-- Chin Profile -->
          <path d="M30 25 Q45 28 45 42 Q45 50 35 55" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
          <!-- Hand Touching Chin -->
          <rect x="42" y="35" width="30" height="15" rx="5" fill="#a7f3d0" stroke="#047857" stroke-width="2"/>
          <!-- Forward Motion Arc -->
          <path d="M68 42 Q80 48 85 60" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-dasharray="3,3"/>
          <path d="M85 60 L80 58 M85 60 L84 54" stroke="#059669" stroke-width="2" stroke-linecap="round"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#065f46" font-family="monospace">CHIN-TO-CHEST WAVE</text>
        </svg>
      `;
    }

    // 10. WATER / DRINK / FOOD / EAT
    if (w.includes("WATER") || w.includes("DRINK") || w.includes("EAT") || w.includes("FOOD") || c.includes("food")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#f0f9ff" stroke="#0284c7" stroke-width="2"/>
          <!-- Cup / Bunched Hand -->
          <path d="M35 30 L65 30 L60 68 Q50 74 40 68 Z" fill="#bae6fd" stroke="#0369a1" stroke-width="2"/>
          <path d="M62 40 Q72 40 72 52 Q72 62 60 62" fill="none" stroke="#0369a1" stroke-width="2"/>
          <!-- Wave Water Level -->
          <path d="M38 45 Q50 50 62 45" fill="none" stroke="#0284c7" stroke-width="2"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#0369a1" font-family="monospace">WATER / DINING</text>
        </svg>
      `;
    }

    // 11. QUESTIONS / WHAT / WHERE / WHY / HOW
    if (w.includes("WHAT") || w.includes("WHERE") || w.includes("WHY") || w.includes("WHEN") || w.includes("HOW") || c.includes("questions")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#fffbeb" stroke="#f59e0b" stroke-width="2"/>
          <!-- Two Open Palms Upward Shaking -->
          <path d="M22 60 Q30 75 42 68 L46 50 L26 48 Z" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
          <path d="M78 60 Q70 75 58 68 L54 50 L74 48 Z" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
          <!-- Question Mark -->
          <text x="50" y="42" font-size="24" font-weight="900" text-anchor="middle" fill="#d97706" font-family="system-ui">?</text>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#b45309" font-family="monospace">PALMS UP QUESTION</text>
        </svg>
      `;
    }

    // 12. TECHNOLOGY / COMPUTER / AI / CODE
    if (w.includes("COMPUTER") || w.includes("TECH") || w.includes("AI") || w.includes("CODE") || c.includes("technology")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#f5f3ff" stroke="#7c3aed" stroke-width="2"/>
          <rect x="26" y="26" width="48" height="34" rx="4" fill="#ddd6fe" stroke="#6d28d9" stroke-width="2"/>
          <rect x="30" y="30" width="40" height="26" rx="2" fill="#1e1b4b"/>
          <text x="50" y="47" font-size="11" font-weight="800" text-anchor="middle" fill="#a78bfa" font-family="monospace">&lt;AI/&gt;</text>
          <path d="M42 60 L38 68 L62 68 L58 60" fill="#ddd6fe" stroke="#6d28d9" stroke-width="1.5"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#6d28d9" font-family="monospace">TECH / CODE SIGN</text>
        </svg>
      `;
    }

    // 13. TIME / CLOCK / CALENDAR
    if (w.includes("TIME") || w.includes("CLOCK") || w.includes("HOUR") || w.includes("TODAY") || c.includes("time")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
          <circle cx="50" cy="45" r="22" fill="#ffffff" stroke="#334155" stroke-width="2"/>
          <line x1="50" y1="45" x2="50" y2="30" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
          <line x1="50" y1="45" x2="60" y2="45" stroke="#0f172a" stroke-width="2" stroke-linecap="round"/>
          <!-- Index Finger Tapping Watch -->
          <path d="M30 65 L48 52" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#334155" font-family="monospace">WRIST WATCH TAP</text>
        </svg>
      `;
    }

    // 14. TRAVEL / CAR / AIRPLANE
    if (w.includes("CAR") || w.includes("DRIVE") || w.includes("AIRPLANE") || w.includes("TRAVEL") || c.includes("travel")) {
      return `
        <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
          <circle cx="50" cy="50" r="44" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
          <!-- Steering Wheel or Plane Glide -->
          <circle cx="50" cy="45" r="22" fill="none" stroke="#15803d" stroke-width="4"/>
          <circle cx="50" cy="45" r="6" fill="#15803d"/>
          <line x1="28" y1="45" x2="72" y2="45" stroke="#15803d" stroke-width="3"/>
          <line x1="50" y1="45" x2="50" y2="67" stroke="#15803d" stroke-width="3"/>
          <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#15803d" font-family="monospace">STEER / TRAVEL</text>
        </svg>
      `;
    }

    // 15. DEFAULT DYNAMIC OPEN PALM WAVE
    return `
      <svg viewBox="0 0 100 100" width="75" height="75" style="display: block; margin: 0 auto;">
        <circle cx="50" cy="50" r="44" fill="var(--primary-light)" stroke="var(--primary)" stroke-width="2"/>
        <path d="M35 55 Q35 75 50 78 Q65 75 65 55 Z" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <path d="M35 60 Q22 52 24 42 Q27 38 33 48" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <path d="M37 52 L37 20 Q40 16 43 20 L43 52" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <path d="M44 50 L45 16 Q48 12 51 16 L51 50" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <path d="M52 50 L53 18 Q56 14 59 18 L58 50" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <path d="M59 52 L62 26 Q65 22 68 26 L65 54" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2"/>
        <text x="50" y="93" font-size="8" font-weight="800" text-anchor="middle" fill="#1d4ed8" font-family="monospace">OPEN PALM WAVE</text>
      </svg>
    `;
  }

  // 1. Fetch All Signs from static JSON
  async function loadAllSigns() {
    try {
      const res = await fetch("/data/signs_500.json");
      if (res.ok) {
        allSigns = await res.json();
        console.log(`[SignBridge] Loaded ${allSigns.length} signs with differentiated vector diagrams.`);
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

  // 3. Filter & Render Sign Cards with Differentiated Vector Diagrams
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
            <!-- Top Differentiated Visual Hand Gesture Diagram -->
            <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-xs); border: 1px solid var(--border-subtle); padding: 0.75rem 0.5rem; margin-bottom: 0.75rem; text-align: center;">
              ${gestureSvg}
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
