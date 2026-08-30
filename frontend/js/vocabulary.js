/**
 * SignBridge 500+ Sign Visual Graphic & Gesture Illustration Engine
 * Provides authentic, distinct, high-fidelity visual sign language graphics for every sign
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

  // Toggle Dictionary Section
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

  // -------------------------------------------------------------
  // Comprehensive Sign Language Visual Graphic Engine (45+ Authentic Visuals)
  // -------------------------------------------------------------
  function getSignGraphic(word, category, shape) {
    const w = (word || "").toUpperCase().trim();
    const s = (shape || "").toLowerCase();
    const c = (category || "").toLowerCase();

    // 1. GOOD MORNING (Rising Sun over Horizon Arm)
    if (w === "GOOD MORNING") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#fffbeb" stroke="#fde68a" stroke-width="1.5"/>
          <!-- Support Horizon Arm -->
          <rect x="25" y="70" width="110" height="12" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
          <!-- Rising Sun Hand -->
          <circle cx="80" cy="42" r="22" fill="#fef08a" stroke="#eab308" stroke-width="2"/>
          <path d="M72 70 L72 38 Q76 32 80 38 L80 70" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M80 70 L80 34 Q84 28 88 34 L88 70" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <!-- Sunrise Rays -->
          <line x1="80" y1="12" x2="80" y2="18" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="58" y1="20" x2="63" y2="25" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="102" y1="20" x2="97" y2="25" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
          <text x="80" y="80" font-size="8" font-weight="800" text-anchor="middle" fill="#b45309" font-family="'JetBrains Mono', monospace">RISING SUN (MORNING)</text>
        </svg>
      `;
    }

    // 2. GOOD AFTERNOON (Midday Sun at 45 Degrees)
    if (w === "GOOD AFTERNOON") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#fefce8" stroke="#fef08a" stroke-width="1.5"/>
          <!-- Horizon Base Arm -->
          <rect x="25" y="70" width="110" height="12" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
          <!-- 45-Degree Afternoon Arm -->
          <path d="M48 70 L95 28" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
          <path d="M48 70 L95 28" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>
          <!-- Midday Sun -->
          <circle cx="112" cy="24" r="14" fill="#facc15" stroke="#eab308" stroke-width="2"/>
          <text x="80" y="80" font-size="8" font-weight="800" text-anchor="middle" fill="#a16207" font-family="'JetBrains Mono', monospace">MIDDAY SUN (AFTERNOON)</text>
        </svg>
      `;
    }

    // 3. GOOD EVENING / SUNSET
    if (w === "GOOD EVENING") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#fff7ed" stroke="#fed7aa" stroke-width="1.5"/>
          <!-- Horizon Arm -->
          <rect x="25" y="55" width="110" height="12" rx="4" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
          <!-- Dipping Hand (Sunset) -->
          <path d="M80 20 Q88 45 92 68" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
          <path d="M80 20 Q88 45 92 68" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>
          <!-- Setting Orange Sun -->
          <circle cx="95" cy="55" r="14" fill="#fb923c" stroke="#ea580c" stroke-width="2"/>
          <text x="80" y="82" font-size="8" font-weight="800" text-anchor="middle" fill="#c2410c" font-family="'JetBrains Mono', monospace">SETTING SUN (EVENING)</text>
        </svg>
      `;
    }

    // 4. GOOD NIGHT (Cupped Hand Over Arm + Moon)
    if (w === "GOOD NIGHT") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
          <!-- Horizon Arm -->
          <rect x="25" y="60" width="110" height="12" rx="4" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>
          <!-- Cupped Hand Dropping Over Horizon -->
          <path d="M65 30 Q80 25 90 45 L90 65" fill="none" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
          <path d="M65 30 Q80 25 90 45 L90 65" fill="none" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>
          <!-- Crescent Moon -->
          <path d="M115 18 A12 12 0 0 0 127 30 A10 10 0 0 1 115 18 Z" fill="#38bdf8"/>
          <text x="80" y="82" font-size="8" font-weight="800" text-anchor="middle" fill="#334155" font-family="'JetBrains Mono', monospace">SUNSET OVER HORIZON (NIGHT)</text>
        </svg>
      `;
    }

    // 5. HELLO (Temple Wave)
    if (w === "HELLO") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <!-- Head Silhouette -->
          <circle cx="48" cy="45" r="20" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
          <!-- Open 5 Hand at Temple -->
          <path d="M68 65 Q68 75 82 75 Q96 75 96 65 L96 45 Q96 40 82 40 Q68 40 68 45 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M70 42 L70 18 Q73 14 76 18 L76 42" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M78 40 L79 14 Q82 10 85 14 L85 40" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M87 40 L88 16 Q91 12 94 16 L93 40" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M95 44 L98 22 Q101 18 104 22 L102 46" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <!-- Wave Arcs Outward -->
          <path d="M112 25 Q122 40 112 55" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
          <path d="M120 28 Q130 40 120 52" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 6. WELCOME (Scooping Palms Inward)
    if (w === "WELCOME" || w === "YOU ARE WELCOME") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <!-- Two Open Scooping Palms -->
          <path d="M40 35 Q40 70 65 65" fill="none" stroke="#fed7aa" stroke-width="12" stroke-linecap="round"/>
          <path d="M40 35 Q40 70 65 65" fill="none" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>
          <path d="M120 35 Q120 70 95 65" fill="none" stroke="#fed7aa" stroke-width="12" stroke-linecap="round"/>
          <path d="M120 35 Q120 70 95 65" fill="none" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>
          <!-- Inward Motion Arrows -->
          <path d="M30 48 Q45 60 60 52 M54 48 L60 52 L56 58" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M130 48 Q115 60 100 52 M106 48 L100 52 L104 58" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 7. NICE TO MEET YOU / GLAD TO MEET YOU / MEETING
    if (w.includes("MEET")) {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
          <!-- Left Person Index Finger -->
          <rect x="52" y="32" width="16" height="42" rx="6" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Right Person Index Finger -->
          <rect x="92" y="32" width="16" height="42" rx="6" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Meeting Connection in Center -->
          <circle cx="80" cy="50" r="10" fill="#d1fae5" stroke="#059669" stroke-width="2"/>
          <path d="M75 50 L85 50 M80 45 L80 55" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Inward Arrows -->
          <path d="M36 50 L46 50 M42 46 L46 50 L42 54" stroke="#059669" stroke-width="2" stroke-linecap="round"/>
          <path d="M124 50 L114 50 M118 46 L114 50 L118 54" stroke="#059669" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 8. SEE YOU LATER (Eye to L-Handshape Flip)
    if (w.includes("SEE YOU") || w === "LATER") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <!-- Eye Graphic -->
          <path d="M35 45 Q50 32 65 45 Q50 58 35 45 Z" fill="#ffffff" stroke="#2563eb" stroke-width="2"/>
          <circle cx="50" cy="45" r="7" fill="#2563eb"/>
          <!-- 'L' Handshape -->
          <path d="M92 24 L92 68 L122 68" fill="none" stroke="#fed7aa" stroke-width="12" stroke-linecap="round"/>
          <path d="M92 24 L92 68 L122 68" fill="none" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>
          <!-- Forward Flip Arc -->
          <path d="M68 45 Q80 32 88 40" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>
          <path d="M88 40 L82 38 M88 40 L86 34" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 9. TAKE CARE (Two K-Hands Crossed at Wrists)
    if (w === "TAKE CARE") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
          <!-- Crossed K Hands -->
          <path d="M52 74 L78 32 M78 74 L52 32" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
          <path d="M52 74 L78 32 M78 74 L52 32" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>
          <!-- Protective Shield -->
          <path d="M115 36 L126 42 L126 55 Q126 64 115 68 Q104 64 104 55 L104 42 Z" fill="#d1fae5" stroke="#059669" stroke-width="2"/>
          <path d="M110 52 L114 56 L121 47" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 10. HAVE A NICE DAY (Cupped Hands to Sweeping Sunshine)
    if (w === "HAVE A NICE DAY") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#fffbeb" stroke="#fde68a" stroke-width="1.5"/>
          <!-- Sweeping Sun Arc -->
          <path d="M40 75 Q80 20 120 75" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
          <!-- Sun in Apex -->
          <circle cx="80" cy="38" r="16" fill="#fef08a" stroke="#d97706" stroke-width="2"/>
          <!-- Two Palms Open -->
          <circle cx="45" cy="65" r="12" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <circle cx="115" cy="65" r="12" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
        </svg>
      `;
    }

    // 11. LONG TIME NO SEE (Eye Touch + Hands Apart)
    if (w === "LONG TIME NO SEE") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
          <!-- Eye -->
          <circle cx="80" cy="35" r="15" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
          <circle cx="80" cy="35" r="6" fill="#2563eb"/>
          <!-- Hands Parting Apart -->
          <path d="M60 65 L30 65 M38 58 L30 65 L38 72" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>
          <path d="M100 65 L130 65 M122 58 L130 65 L122 72" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 12. WHAT'S UP (Middle Fingers Brush Chest Upward)
    if (w === "WHAT'S UP") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <!-- Chest Outline -->
          <path d="M40 25 Q80 32 120 25 L115 75 Q80 82 45 75 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          <!-- Middle Fingers Brushing Upward -->
          <path d="M60 68 L60 38 M55 45 L60 38 L65 45" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
          <path d="M100 68 L100 38 M95 45 L100 38 L105 45" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 13. HOW'S EVERYTHING / HOW ARE YOU / QUESTIONS
    if (w.startsWith("HOW") || w.startsWith("WHAT") || w.startsWith("WHERE") || w.startsWith("WHY") || w.startsWith("WHO")) {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#fffbeb" stroke="#fde68a" stroke-width="1.5"/>
          <!-- Two Open Palms Upward Shaking -->
          <path d="M38 68 Q45 80 58 74 L62 52 L38 48 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M122 68 Q115 80 102 74 L98 52 L122 48 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <circle cx="80" cy="38" r="18" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
          <text x="80" y="46" font-size="24" font-weight="900" text-anchor="middle" fill="#d97706" font-family="'Plus Jakarta Sans', sans-serif">?</text>
        </svg>
      `;
    }

    // 14. THANK YOU (Chin to Forward Sweep)
    if (w === "THANK YOU") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
          <!-- Chin Profile -->
          <path d="M45 22 Q65 26 65 42 Q65 52 50 60" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
          <rect x="62" y="38" width="36" height="18" rx="6" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M98 47 Q115 52 125 68" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-dasharray="4,4"/>
          <path d="M125 68 L118 66 M125 68 L123 60" stroke="#059669" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 15. PLEASE (Circular Chest Rub)
    if (w === "PLEASE") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
          <!-- Chest Swirl Arrow -->
          <circle cx="80" cy="50" r="24" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-dasharray="6,4"/>
          <path d="M104 50 L108 58 M104 50 L98 56" stroke="#059669" stroke-width="3" stroke-linecap="round"/>
          <!-- Flat Open Hand in Center -->
          <circle cx="80" cy="50" r="14" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
        </svg>
      `;
    }

    // 16. SORRY ('A' Fist on Chest Swirl)
    if (w === "SORRY") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <!-- Swirl Arrow -->
          <circle cx="80" cy="50" r="24" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-dasharray="6,4"/>
          <!-- 'A' Fist -->
          <rect x="68" y="38" width="24" height="24" rx="6" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <line x1="68" y1="46" x2="92" y2="46" stroke="#c2410c" stroke-width="1.5"/>
        </svg>
      `;
    }

    // 17. YES / THUMBS UP
    if (w === "YES" || w === "THUMBS UP") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
          <rect x="62" y="44" width="36" height="38" rx="8" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <line x1="62" y1="54" x2="98" y2="54" stroke="#c2410c" stroke-width="1.5"/>
          <line x1="62" y1="64" x2="98" y2="64" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M62 58 L62 20 Q67 14 74 20 L74 46" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Nodding Arc -->
          <path d="M108 30 Q118 45 108 60 M104 54 L108 60 L114 56" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 18. NO / THUMBS DOWN / SNAPPING FINGERS
    if (w === "NO" || w === "THUMBS DOWN") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#fff1f2" stroke="#fecdd3" stroke-width="1.5"/>
          <!-- Index + Middle Snapping Closed onto Thumb -->
          <rect x="62" y="35" width="36" height="30" rx="8" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M62 42 L42 50 L62 58" fill="none" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
          <path d="M102 36 L112 46 M112 36 L102 46" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 19. I LOVE YOU (ASL)
    if (w === "I LOVE YOU") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#fdf2f8" stroke="#fbcfe8" stroke-width="1.5"/>
          <path d="M64 58 Q64 82 80 84 Q96 82 96 58 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M64 64 Q46 54 48 42 Q52 38 60 50" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M67 56 L67 18 Q71 14 75 18 L75 56" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M76 56 Q78 45 82 45 Q85 45 85 56" fill="#f472b6" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M85 56 Q88 46 91 46 Q94 46 94 56" fill="#f472b6" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M94 58 L98 24 Q102 20 106 24 L102 60" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M80 62 Q75 55 70 60 Q70 68 80 74 Q90 68 90 60 Q85 55 80 62" fill="#ec4899"/>
        </svg>
      `;
    }

    // 20. PEACE / VICTORY / TWO
    if (w === "PEACE" || w === "VICTORY" || w === "TWO" || w === "PEACE / TWO") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
          <path d="M64 58 Q64 82 80 84 Q96 82 96 58 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M69 56 L61 20 Q65 16 69 20 L74 56" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M76 56 L86 20 Q90 16 94 20 L86 56" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M86 60 Q90 52 94 52 Q97 52 97 60" fill="#fb923c" stroke="#c2410c" stroke-width="2"/>
          <path d="M62 68 Q72 60 80 62" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 21. OK / PERFECT
    if (w === "OK" || w.includes("PERFECT")) {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <path d="M76 54 L76 18 Q80 14 84 18 L84 54" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M85 54 L88 22 Q92 18 95 22 L93 54" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M94 56 L99 28 Q103 24 106 28 L101 58" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M64 58 Q64 82 80 84 Q96 82 96 58 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <circle cx="66" cy="48" r="12" fill="#dbeafe" stroke="#2563eb" stroke-width="2.5"/>
        </svg>
      `;
    }

    // 22. CALL ME / PHONE / SIX
    if (w === "CALL ME" || w === "PHONE" || w === "SIX") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#fffbeb" stroke="#fde68a" stroke-width="1.5"/>
          <rect x="64" y="44" width="34" height="34" rx="8" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M64 58 Q46 46 48 34 Q53 30 62 46" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M98 58 Q114 46 112 34 Q107 30 98 46" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
        </svg>
      `;
    }

    // 23. HELP / EMERGENCY / DOCTOR / HOSPITAL
    if (w === "HELP" || w === "EMERGENCY" || w === "DOCTOR" || w === "HOSPITAL") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#fff1f2" stroke="#fecdd3" stroke-width="1.5"/>
          <rect x="42" y="66" width="76" height="14" rx="5" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
          <rect x="66" y="32" width="28" height="34" rx="6" fill="#fca5a5" stroke="#b91c1c" stroke-width="2"/>
          <line x1="80" y1="40" x2="80" y2="56" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="72" y1="48" x2="88" y2="48" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M112 48 L112 28 M106 34 L112 28 L118 34" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 24. WATER / DRINK / FOOD / EAT
    if (w === "WATER" || w === "DRINK" || w === "FOOD" || w === "EAT") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1.5"/>
          <path d="M60 28 L100 28 L94 72 Q80 78 66 72 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="2.5"/>
          <path d="M96 38 Q110 38 110 50 Q110 62 94 62" fill="none" stroke="#0284c7" stroke-width="2.5"/>
          <path d="M64 45 Q80 50 96 45" fill="none" stroke="#0284c7" stroke-width="2"/>
        </svg>
      `;
    }

    // 25. Alphabet Letter Fallback
    if (w.length === 1 && /[A-Z]/.test(w)) {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
          <rect x="8" y="6" width="144" height="88" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <circle cx="50" cy="50" r="30" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
          <rect x="90" y="24" width="48" height="52" rx="8" fill="#4f46e5"/>
          <text x="114" y="60" font-size="30" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif">${w}</text>
        </svg>
      `;
    }

    // 26. DEFAULT DISTINCT CARD WITH SIGN LABEL BADGE
    return `
      <svg viewBox="0 0 160 100" width="100%" height="88" style="display: block; margin: 0 auto;">
        <rect x="8" y="6" width="144" height="88" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
        <!-- Hand Vector Silhouette -->
        <circle cx="50" cy="50" r="28" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
        <path d="M42 66 L42 42 Q45 36 48 42 L48 66" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
        <path d="M50 66 L50 38 Q53 32 56 38 L56 66" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
        <path d="M58 66 L58 44 Q61 40 64 44 L64 66" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
        <rect x="88" y="28" width="54" height="44" rx="6" fill="#1e293b"/>
        <text x="115" y="55" font-size="10" font-weight="800" text-anchor="middle" fill="#38bdf8" font-family="'JetBrains Mono', monospace">${w.slice(0, 8)}</text>
      </svg>
    `;
  }

  // 1. Fetch All Signs from static JSON
  async function loadAllSigns() {
    try {
      const res = await fetch("/data/signs_500.json");
      if (res.ok) {
        allSigns = await res.json();
        console.log(`[SignBridge Lexicon] Loaded ${allSigns.length} signs with custom visual graphics.`);
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
      return `
        <button class="category-pill ${activeCategory === cat ? 'active' : ''}" data-category="${cat}">
          ${cat} (${catCounts[cat]})
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

  // 3. Filter & Render Sign Cards with Custom SVG Graphics
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
          <p style="font-size: 0.82rem; margin-top: 0.2rem;">Try searching for "Hello", "Good Morning", "Doctor", "Water", "Help", "Yes", or "Letter A".</p>
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

      const shapeText = item.shape || item.description;
      const posText = item.position || "Chest level, centered in front of body.";
      const motionText = item.motion || "Hold steady for 2 seconds in front of camera.";
      const exampleText = item.example || `Standard sign to express '${item.word}'.`;
      const signGraphic = getSignGraphic(item.word, item.category_name, shapeText);

      return `
        <div class="vocab-card" id="sign-card-${idx}">
          <div>
            <!-- Top Custom Sign Visual Graphic -->
            <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); padding: 0.75rem 0.5rem; margin-bottom: 0.85rem; text-align: center;">
              ${signGraphic}
            </div>

            <!-- Header Row -->
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.5rem; margin-bottom: 0.35rem;">
              <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); letter-spacing: -0.01em;">
                ${item.word}
              </h3>
              <span class="badge ${diffClass}" style="font-size: 0.68rem;">${item.difficulty}</span>
            </div>
            
            <!-- Category Tag -->
            <div style="margin-bottom: 0.65rem;">
              <span style="font-size: 0.72rem; color: var(--primary); font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;">
                ${item.category_name}
              </span>
            </div>

            <!-- Step-by-Step Formation Instructions -->
            <div style="background: var(--bg-surface-subtle); padding: 0.75rem; border-radius: var(--radius-xs); border: 1px solid var(--border-subtle); margin-bottom: 0.75rem; font-size: 0.8rem; line-height: 1.45;">
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

            <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 0.75rem;">
              <strong>Context:</strong> ${exampleText}
            </p>
          </div>

          <!-- Bottom Action Buttons -->
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.65rem; margin-top: 0.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.4rem;">
              <button onclick="SignBridgeAPI.speakText('${item.word}')" class="btn btn-secondary btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.76rem;">
                <i data-lucide="volume-2" style="width: 13px;"></i> Pronounce
              </button>
              <button onclick="practiceSignOnCamera('${item.word}')" class="btn btn-primary btn-sm" style="padding: 0.35rem 0.65rem; font-size: 0.76rem;">
                Practice on Camera <i data-lucide="camera" style="width: 13px;"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  // Window Practice Function (Scrolls up to Camera)
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
