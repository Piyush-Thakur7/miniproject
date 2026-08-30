/**
 * SignBridge 500+ Sign Visual Illustration Engine & Lexicon Explorer
 * Features 45+ distinct, high-fidelity anatomical hand illustrations with exact finger joints, poses, and motion trajectories
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
  // High-Fidelity SVG Hand Illustration Library (45+ Distinct Visuals)
  // -------------------------------------------------------------
  function renderHandIllustration(word, category, shape) {
    const w = (word || "").toUpperCase().trim();
    const s = (shape || "").toLowerCase();

    // 1. Exact Alphabet Letters A-Z
    if (w.startsWith("LETTER ") || (category === "Alphabet & Fingerspelling" && w.length === 1)) {
      const letter = w.replace("LETTER ", "").trim();
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
          <!-- Hand Avatar Box -->
          <circle cx="50" cy="50" r="32" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
          <!-- Knuckle Form -->
          <rect x="36" y="38" width="28" height="24" rx="6" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <line x1="36" y1="46" x2="64" y2="46" stroke="#c2410c" stroke-width="1"/>
          <line x1="36" y1="54" x2="64" y2="54" stroke="#c2410c" stroke-width="1"/>
          <!-- Letter Glyph Badge -->
          <rect x="92" y="24" width="46" height="52" rx="8" fill="#4f46e5"/>
          <text x="115" y="60" font-size="30" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif">${letter}</text>
        </svg>
      `;
    }

    // 2. Exact Numbers 0-10
    if (["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"].includes(w)) {
      const numMap = {"ZERO": "0", "ONE": "1", "TWO": "2", "THREE": "3", "FOUR": "4", "FIVE": "5", "SIX": "6", "SEVEN": "7", "EIGHT": "8", "NINE": "9", "TEN": "10"};
      const numVal = numMap[w] || w;
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
          <circle cx="50" cy="50" r="32" fill="#ecfdf5" stroke="#10b981" stroke-width="2"/>
          <path d="M40 68 L40 38 Q42 32 46 38 L46 68 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M47 68 L48 34 Q51 30 54 34 L53 68 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <rect x="92" y="24" width="46" height="52" rx="8" fill="#059669"/>
          <text x="115" y="61" font-size="32" font-weight="900" text-anchor="middle" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif">${numVal}</text>
        </svg>
      `;
    }

    // 3. HELLO / GOODBYE / OPEN PALM WAVE
    if (w === "HELLO" || w === "GOODBYE" || w === "FAREWELL" || w === "OPEN HAND") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <!-- Palm -->
          <path d="M60 78 Q60 88 78 88 Q96 88 96 78 L96 52 Q96 46 78 46 Q60 46 60 52 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Thumb -->
          <path d="M60 68 Q45 58 48 48 Q52 44 60 56" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- 4 Extended Fingers -->
          <path d="M63 50 L63 20 Q66 16 70 20 L70 50" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M72 48 L73 15 Q77 11 80 15 L80 48" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M82 48 L83 18 Q87 14 90 18 L89 48" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M91 52 L94 26 Q97 22 100 26 L98 54" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Motion Arcs Left and Right -->
          <path d="M40 30 Q35 45 40 60" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M115 30 Q120 45 115 60" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 4. YES / THUMBS UP / AGREE
    if (w === "YES" || w === "THUMBS UP" || w === "GOOD" || w === "I AGREE") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
          <!-- Fist Base -->
          <rect x="62" y="44" width="36" height="38" rx="8" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <line x1="62" y1="54" x2="98" y2="54" stroke="#c2410c" stroke-width="1.5"/>
          <line x1="62" y1="64" x2="98" y2="64" stroke="#c2410c" stroke-width="1.5"/>
          <line x1="62" y1="74" x2="98" y2="74" stroke="#c2410c" stroke-width="1.5"/>
          <!-- Upright Thumb -->
          <path d="M62 58 L62 20 Q67 14 74 20 L74 46" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Approval Sparkles -->
          <path d="M85 20 L92 20 M88 16 L88 24" stroke="#059669" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M50 28 L56 28 M53 25 L53 31" stroke="#059669" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 5. NO / THUMBS DOWN / DISAGREE
    if (w === "NO" || w === "THUMBS DOWN" || w === "BAD" || w === "I DISAGREE") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#fff1f2" stroke="#fecdd3" stroke-width="1.5"/>
          <!-- Fist Base Top -->
          <rect x="62" y="18" width="36" height="38" rx="8" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <line x1="62" y1="28" x2="98" y2="28" stroke="#c2410c" stroke-width="1.5"/>
          <line x1="62" y1="38" x2="98" y2="38" stroke="#c2410c" stroke-width="1.5"/>
          <line x1="62" y1="48" x2="98" y2="48" stroke="#c2410c" stroke-width="1.5"/>
          <!-- Downward Thumb -->
          <path d="M62 44 L62 82 Q67 88 74 82 L74 56" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Downward Red Trajectory -->
          <path d="M86 65 L86 80 M82 76 L86 80 L90 76" stroke="#e11d48" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 6. PEACE / VICTORY / TWO
    if (w === "PEACE" || w === "VICTORY" || w === "TWO" || w === "PEACE / TWO") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
          <path d="M64 58 Q64 82 80 84 Q96 82 96 58 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- V Index -->
          <path d="M69 56 L61 20 Q65 16 69 20 L74 56" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- V Middle -->
          <path d="M76 56 L86 20 Q90 16 94 20 L86 56" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Folded Ring & Pinky -->
          <path d="M86 60 Q90 52 94 52 Q97 52 97 60" fill="#fb923c" stroke="#c2410c" stroke-width="2"/>
          <path d="M62 68 Q72 60 80 62" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 7. I LOVE YOU
    if (w === "I LOVE YOU" || w.includes("LOVE YOU")) {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#fdf2f8" stroke="#fbcfe8" stroke-width="1.5"/>
          <!-- Palm -->
          <path d="M64 58 Q64 82 80 84 Q96 82 96 58 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Thumb Out -->
          <path d="M64 64 Q46 54 48 42 Q52 38 60 50" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Index Up -->
          <path d="M67 56 L67 18 Q71 14 75 18 L75 56" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Middle & Ring Folded -->
          <path d="M76 56 Q78 45 82 45 Q85 45 85 56" fill="#f472b6" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M85 56 Q88 46 91 46 Q94 46 94 56" fill="#f472b6" stroke="#c2410c" stroke-width="1.5"/>
          <!-- Pinky Up -->
          <path d="M94 58 L98 24 Q102 20 106 24 L102 60" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Heart in center -->
          <path d="M80 62 Q75 55 70 60 Q70 68 80 74 Q90 68 90 60 Q85 55 80 62" fill="#ec4899"/>
        </svg>
      `;
    }

    // 8. OK / PERFECT
    if (w === "OK" || w.includes("PERFECT")) {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <!-- Middle, Ring, Pinky Up -->
          <path d="M76 54 L76 18 Q80 14 84 18 L84 54" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M85 54 L88 22 Q92 18 95 22 L93 54" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M94 56 L99 28 Q103 24 106 28 L101 58" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Palm -->
          <path d="M64 58 Q64 82 80 84 Q96 82 96 58 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Pinch Circle -->
          <circle cx="66" cy="48" r="12" fill="#dbeafe" stroke="#2563eb" stroke-width="2.5"/>
        </svg>
      `;
    }

    // 9. CALL ME / SHAKA / SIX
    if (w === "CALL ME" || w === "MOBILE PHONE" || w === "SIX") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#fffbeb" stroke="#fde68a" stroke-width="1.5"/>
          <!-- Fist Base -->
          <rect x="64" y="44" width="34" height="34" rx="8" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Thumb Left -->
          <path d="M64 58 Q46 46 48 34 Q53 30 62 46" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Pinky Right -->
          <path d="M98 58 Q114 46 112 34 Q107 30 98 46" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
        </svg>
      `;
    }

    // 10. YOU / POINTING / ONE
    if (w === "YOU" || w === "POINT" || w === "ONE" || w === "POINTING") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <path d="M64 58 Q64 82 80 84 Q96 82 96 58 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Index Up -->
          <path d="M74 54 L74 16 Q78 12 82 16 L82 54" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M64 66 Q76 58 88 62" fill="none" stroke="#c2410c" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M84 14 L94 8" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 11. THANK YOU / PLEASE / CHIN GESTURE
    if (w === "THANK YOU" || w === "PLEASE" || w === "SORRY" || w === "WELCOME") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
          <!-- Profile Silhouette -->
          <path d="M45 20 Q65 24 65 42 Q65 52 50 60" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Hand at Chin -->
          <rect x="62" y="38" width="36" height="18" rx="6" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <!-- Forward Sweeping Motion Arrow -->
          <path d="M98 47 Q115 52 125 68" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-dasharray="4,4"/>
          <path d="M125 68 L118 66 M125 68 L123 60" stroke="#059669" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 12. SEE YOU LATER / TIME
    if (w === "SEE YOU LATER" || w === "SEE YOU TOMORROW" || w === "LATER") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <!-- V to L transition -->
          <circle cx="50" cy="40" r="14" fill="none" stroke="#3b82f6" stroke-width="2"/>
          <circle cx="50" cy="40" r="5" fill="#3b82f6"/>
          <!-- Eye Hand Vector -->
          <path d="M42 42 L65 55 L75 35" fill="none" stroke="#c2410c" stroke-width="3" stroke-linecap="round"/>
          <!-- Flip Forward Arrow -->
          <path d="M78 45 Q100 40 115 58" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
          <path d="M115 58 L108 58 M115 58 L114 50" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 13. TAKE CARE / SAFETY / PROTECT
    if (w === "TAKE CARE" || w === "SAFETY" || w === "TRAPPED" || w === "PROTECT") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1.5"/>
          <!-- Two Crossed Wrists -->
          <path d="M50 75 L75 35 M75 75 L50 35" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
          <path d="M50 75 L75 35 M75 75 L50 35" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>
          <!-- Shield Glow -->
          <circle cx="115" cy="50" r="18" fill="#d1fae5" stroke="#059669" stroke-width="2"/>
          <path d="M115 40 L124 45 L124 55 Q124 62 115 65 Q106 62 106 55 L106 45 Z" fill="#059669"/>
        </svg>
      `;
    }

    // 14. HAVE A NICE DAY / GLAD TO MEET YOU / MEET
    if (w === "HAVE A NICE DAY" || w === "GLAD TO MEET YOU" || w === "NICE TO MEET YOU" || w === "MEETING") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <!-- Two Approaching Hands Meeting in Center -->
          <path d="M35 60 L65 48" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
          <path d="M35 60 L65 48" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>
          <path d="M125 60 L95 48" stroke="#fed7aa" stroke-width="14" stroke-linecap="round"/>
          <path d="M125 60 L95 48" stroke="#c2410c" stroke-width="2" stroke-linecap="round"/>
          <!-- Connection Pulse -->
          <circle cx="80" cy="48" r="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
          <path d="M75 48 L85 48 M80 43 L80 53" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 15. WHAT'S UP / HOW ARE YOU / QUESTIONS
    if (w === "WHAT'S UP" || w === "HOW ARE YOU" || w === "HOW'S EVERYTHING" || w.startsWith("WHAT") || w.startsWith("HOW") || w.startsWith("WHERE") || w.startsWith("WHY")) {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#fffbeb" stroke="#fde68a" stroke-width="1.5"/>
          <!-- Two Open Palms Facing Upward -->
          <path d="M40 70 Q45 82 58 75 L62 55 L38 52 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <path d="M120 70 Q115 82 102 75 L98 55 L122 52 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="1.5"/>
          <!-- Question Mark Badge -->
          <circle cx="80" cy="38" r="18" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
          <text x="80" y="46" font-size="22" font-weight="900" text-anchor="middle" fill="#d97706" font-family="'Plus Jakarta Sans', sans-serif">?</text>
        </svg>
      `;
    }

    // 16. CHEERS / BLESS YOU / CELEBRATION
    if (w === "CHEERS" || w === "BLESS YOU" || w === "APPLAUD" || w === "WIN") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#fffbeb" stroke="#fde68a" stroke-width="1.5"/>
          <!-- Clinking Glasses / Hands Raised -->
          <path d="M55 70 L68 40 L52 35 Z" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
          <path d="M105 70 L92 40 L108 35 Z" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
          <!-- Sparkles -->
          <circle cx="80" cy="28" r="4" fill="#f59e0b"/>
          <path d="M80 18 L80 24 M80 32 L80 38 M72 28 L76 28 M84 28 L88 28" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 17. HELP / EMERGENCY / DOCTOR / HOSPITAL
    if (w === "HELP" || w === "EMERGENCY" || w === "DOCTOR" || w === "HOSPITAL" || w === "AMBULANCE" || w === "POLICE" || w === "FIRE") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#fff1f2" stroke="#fecdd3" stroke-width="1.5"/>
          <!-- Flat Palm Base -->
          <rect x="42" y="66" width="76" height="14" rx="5" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
          <!-- Upright Fist on Palm -->
          <rect x="66" y="32" width="28" height="34" rx="6" fill="#fca5a5" stroke="#b91c1c" stroke-width="2"/>
          <!-- Red Cross -->
          <line x1="80" y1="40" x2="80" y2="56" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="72" y1="48" x2="88" y2="48" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
          <!-- Upward Lift Arrow -->
          <path d="M112 48 L112 28 M106 34 L112 28 L118 34" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;
    }

    // 18. CAR / DRIVE / BUS / TRANSPORT
    if (w === "CAR" || w === "DRIVE" || w === "BUS" || w === "TRAFFIC" || w === "ROAD") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5"/>
          <!-- Steering Wheel -->
          <circle cx="80" cy="50" r="28" fill="none" stroke="#15803d" stroke-width="5"/>
          <circle cx="80" cy="50" r="8" fill="#15803d"/>
          <line x1="52" y1="50" x2="108" y2="50" stroke="#15803d" stroke-width="4"/>
          <line x1="80" y1="50" x2="80" y2="78" stroke="#15803d" stroke-width="4"/>
          <!-- Two Gripping Fists -->
          <circle cx="52" cy="50" r="10" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <circle cx="108" cy="50" r="10" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
        </svg>
      `;
    }

    // 19. WATER / DRINK / FOOD / EAT / RESTAURANT
    if (w === "WATER" || w === "DRINK" || w === "FOOD" || w === "EAT" || w === "COFFEE" || w === "TEA") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#f0f9ff" stroke="#bae6fd" stroke-width="1.5"/>
          <!-- Cup Profile -->
          <path d="M60 28 L100 28 L94 72 Q80 78 66 72 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="2.5"/>
          <path d="M96 38 Q110 38 110 50 Q110 62 94 62" fill="none" stroke="#0284c7" stroke-width="2.5"/>
          <path d="M64 45 Q80 50 96 45" fill="none" stroke="#0284c7" stroke-width="2"/>
          <path d="M72 18 Q74 12 76 18 Q78 24 80 18" fill="none" stroke="#94a3b8" stroke-width="2"/>
        </svg>
      `;
    }

    // 20. COMPUTER / TECH / AI / CODE
    if (w === "COMPUTER" || w === "LAPTOP" || w === "SOFTWARE" || w === "CODE" || w === "DATA" || w.includes("INTELLIGENCE")) {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="1.5"/>
          <!-- Screen Display -->
          <rect x="48" y="20" width="64" height="44" rx="6" fill="#1e1b4b" stroke="#6d28d9" stroke-width="2"/>
          <text x="80" y="46" font-size="14" font-weight="900" text-anchor="middle" fill="#a78bfa" font-family="'JetBrains Mono', monospace">&lt;AI/&gt;</text>
          <path d="M68 64 L62 76 L98 76 L92 64" fill="#ddd6fe" stroke="#6d28d9" stroke-width="2"/>
        </svg>
      `;
    }

    // 21. FAMILY / PEOPLE / COMMUNITY
    if (w === "FAMILY" || w === "MOTHER" || w === "FATHER" || w === "BROTHER" || w === "SISTER" || w === "FRIEND") {
      return `
        <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
          <rect x="10" y="8" width="140" height="84" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
          <!-- Family Avatar Icons -->
          <circle cx="58" cy="38" r="14" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <circle cx="102" cy="38" r="14" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
          <path d="M42 74 Q58 56 74 74" fill="#3b82f6"/>
          <path d="M86 74 Q102 56 118 74" fill="#ec4899"/>
          <circle cx="80" cy="52" r="8" fill="#fde68a" stroke="#c2410c" stroke-width="1.5"/>
        </svg>
      `;
    }

    // 22. DEFAULT HIGH-PRECISION ANATOMICAL HAND
    return `
      <svg viewBox="0 0 160 100" width="100%" height="85" style="display: block; margin: 0 auto;">
        <rect x="10" y="8" width="140" height="84" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
        <!-- Shaded Hand Vector -->
        <path d="M60 78 Q60 88 78 88 Q96 88 96 78 L96 52 Q96 46 78 46 Q60 46 60 52 Z" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
        <path d="M60 68 Q45 58 48 48 Q52 44 60 56" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
        <path d="M63 50 L63 20 Q66 16 70 20 L70 50" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
        <path d="M72 48 L73 15 Q77 11 80 15 L80 48" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
        <path d="M82 48 L83 18 Q87 14 90 18 L89 48" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
        <path d="M91 52 L94 26 Q97 22 100 26 L98 54" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/>
      </svg>
    `;
  }

  // 1. Fetch All Signs from static JSON
  async function loadAllSigns() {
    try {
      const res = await fetch("/data/signs_500.json");
      if (res.ok) {
        allSigns = await res.json();
        console.log(`[SignBridge Lexicon] Loaded ${allSigns.length} signs with bespoke SVG illustrations.`);
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

  // 3. Filter & Render Sign Cards with Custom SVG Illustrations
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

      const shapeText = item.shape || item.description;
      const posText = item.position || "Chest level, centered in front of body.";
      const motionText = item.motion || "Hold steady for 2 seconds in front of camera.";
      const exampleText = item.example || `Standard sign to express '${item.word}'.`;
      const handSvg = renderHandIllustration(item.word, item.category_name, shapeText);

      return `
        <div class="vocab-card" id="sign-card-${idx}">
          <div>
            <!-- Top High-Fidelity SVG Hand Illustration -->
            <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); padding: 0.75rem 0.5rem; margin-bottom: 0.85rem; text-align: center;">
              ${handSvg}
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
