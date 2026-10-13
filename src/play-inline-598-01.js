// play-inline-598 01 — test
// Lines 16-287 of readable/play-inline-598.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const H = G.hud._;

  // ------------------------------------------------------------------
  // UI glyphs (24×24, stroke = currentColor). Classes: g-l line, g-f faint fill, g-s solid
  // ------------------------------------------------------------------
  const GL = {
    info: '<rect x="3" y="3" width="18" height="18" class="g-l"/><path d="M12 10 v7 M12 6.5 v1" class="g-l"/>',
    check:
      '<rect x="3" y="3" width="18" height="18" class="g-l"/><path d="M7 12.5 l3.2 3.2 L17 8.5" class="g-l"/>',
    fail: '<rect x="3" y="3" width="18" height="18" class="g-l"/><path d="M8 8 l8 8 M16 8 l-8 8" class="g-l"/>',
    warn: '<path d="M12 3 L22 20 H2 Z" class="g-f"/><path d="M12 9 v6 M12 17 v1" class="g-l"/>',
    item: '<path d="M3 8 L12 3 L21 8 V17 L12 21 L3 17 Z" class="g-f"/><path d="M3 8 L12 12.5 L21 8 M12 12.5 V21" class="g-l"/>',
    weapon:
      '<circle cx="12" cy="12" r="7" class="g-l"/><path d="M12 2 v6 M12 16 v6 M2 12 h6 M16 12 h6" class="g-l"/><circle cx="12" cy="12" r="1.2" class="g-s"/>',
    ammo: '<path d="M6 9 q2 -6 4 0 v11 h-4 z M14 9 q2 -6 4 0 v11 h-4 z" class="g-f"/><path d="M6 15 h4 M14 15 h4" class="g-l"/>',
    quest:
      '<path d="M6 21 V3" class="g-l"/><path d="M6 4 H19 L16 8 L19 12 H6" class="g-f"/>',
    map: '<path d="M3 6 L9 3 L15 6 L21 3 V18 L15 21 L9 18 L3 21 Z" class="g-f"/><path d="M9 3 V18 M15 6 V21" class="g-l"/>',
    pin: '<path d="M12 22 C 6 14 5 11 5 9 a7 7 0 0 1 14 0 c0 2 -1 5 -7 13 z" class="g-f"/><circle cx="12" cy="9" r="2.5" class="g-l"/>',
    radar:
      '<circle cx="12" cy="12" r="9" class="g-l"/><circle cx="12" cy="12" r="5" class="g-l thin"/><path d="M12 12 L19 6" class="g-l"/><circle cx="16" cy="15" r="1.2" class="g-s"/>',
    radiation:
      '<circle cx="12" cy="12" r="2" class="g-s"/><path d="M12 9 L9 3.8 A9 9 0 0 1 15 3.8 Z M14.6 13.5 L20.6 13.5 A9 9 0 0 1 17.6 18.7 Z M9.4 13.5 L6.4 18.7 A9 9 0 0 1 3.4 13.5 Z" class="g-f"/>',
    heal: '<rect x="3" y="3" width="18" height="18" class="g-l"/><path d="M12 7 v10 M7 12 h10" class="g-l"/>',
    level: '<path d="M5 13 L12 6 L19 13 M5 19 L12 12 L19 19" class="g-l"/>',
    skill:
      '<path d="M3 21 H21" class="g-l"/><path d="M5 21 V15 h3 V21 M10.5 21 V11 h3 V21 M16 21 V6 h3 V21" class="g-f"/>',
    talent:
      '<path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17 L6 21.5 L8 14 L2 9.5 L9.5 9 Z" class="g-f"/>',
    attr: '<path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" class="g-l"/><path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" class="g-f"/>',
    save: '<rect x="3" y="5" width="18" height="14" rx="1.5" class="g-l"/><circle cx="8.5" cy="12" r="2.6" class="g-l"/><circle cx="15.5" cy="12" r="2.6" class="g-l"/><path d="M8.5 9.4 H15.5" class="g-l thin"/>',
    dead: '<path d="M2 13 H7 L9 8 L12 17 L14 11 L15.5 13 H22" class="g-l"/>',
    lock: '<rect x="5" y="11" width="14" height="10" class="g-f"/><path d="M8 11 V7.5 a4 4 0 0 1 8 0 V11" class="g-l"/><path d="M12 15 v2.5" class="g-l"/>',
    key: '<circle cx="7" cy="12" r="4" class="g-l"/><path d="M11 12 H22 M18 12 v4 M21 12 v3" class="g-l"/>',
    code: '<rect x="4" y="2.5" width="16" height="19" class="g-l"/><path d="M7 6 h10" class="g-l thin"/><path d="M7.5 10 h1 M11.5 10 h1 M15.5 10 h1 M7.5 13.5 h1 M11.5 13.5 h1 M15.5 13.5 h1 M7.5 17 h1 M11.5 17 h1 M15.5 17 h1" class="g-l"/>',
    radio:
      '<rect x="3" y="10" width="18" height="11" class="g-f"/><path d="M7 10 L17 3" class="g-l"/><circle cx="15.5" cy="15.5" r="2.5" class="g-l"/><path d="M6 14 h4 M6 17 h4" class="g-l thin"/>',
    tape: '<circle cx="12" cy="12" r="9" class="g-l"/><circle cx="12" cy="12" r="2.2" class="g-s"/><path d="M12 5 v3 M18 12 h-3 M12 19 v-3 M6 12 h3" class="g-l"/>',
    note: '<path d="M5 2.5 H15 L19 6.5 V21.5 H5 Z" class="g-f"/><path d="M15 2.5 V6.5 H19 M8 10 h8 M8 13.5 h8 M8 17 h5" class="g-l"/>',
    scrip:
      '<path d="M2 7 H22 V17 H2 Z" class="g-f"/><path d="M12 7 V17" class="g-l thin"/><circle cx="7" cy="12" r="2" class="g-l"/><path d="M15 10 h4 M15 14 h4" class="g-l"/>',
    food: '<path d="M7 2 V22 M4 2 V8 a3 3 0 0 0 6 0 V2" class="g-l"/><path d="M17 22 V2 c-3 2 -4 6 -4 10 h4" class="g-f"/>',
    drink:
      '<path d="M10 2 h4 V6 c3 2 3 4 3 7 V21 H7 V13 c0 -3 0 -5 3 -7 Z" class="g-f"/><path d="M7 14 h10" class="g-l"/>',
    sleep: '<path d="M16 3 a9 9 0 1 0 5 13 a7 7 0 0 1 -5 -13 z" class="g-f"/>',
    sneak:
      '<path d="M2 12 C 6 5 18 5 22 12" class="g-l"/><path d="M5 12 C 8 16 16 16 19 12" class="g-l thin"/><circle cx="12" cy="11" r="2.4" class="g-s"/>',
    standing:
      '<path d="M12 3 V21 M6 21 h12 M4 7 h16" class="g-l"/><path d="M4 7 L1.5 13 h5 Z M20 7 L17.5 13 h5 Z" class="g-f"/>',
    effect: '<path d="M2 12 H6 L8.5 5 L12 19 L15 9 L17 12 H22" class="g-l"/>',
    time: '<circle cx="12" cy="12" r="9" class="g-l"/><path d="M12 6 V12 L16 14" class="g-l"/>',
    travel:
      '<path d="M3 19 C 8 19 8 5 13 5 H21 M17 1.5 L21 5 L17 8.5" class="g-l"/><circle cx="3.5" cy="19" r="1.5" class="g-s"/>',
    hint: '<path d="M7 3 H4 V21 H7 M17 3 H20 V21 H17" class="g-l"/><path d="M9.5 9 a2.5 2.5 0 1 1 3.5 2.3 c-1 .5 -1 1 -1 2.2 M12 16.5 v.5" class="g-l"/>',
    lamp: '<path d="M8 3 H16 L18 9 H6 Z" class="g-f"/><path d="M12 9 V13 M5 16 L8 13.5 M19 16 L16 13.5 M12 15 V21" class="g-l"/>',
    goggles:
      '<circle cx="7" cy="12" r="4.5" class="g-l"/><circle cx="17" cy="12" r="4.5" class="g-l"/><path d="M11.5 12 h1 M2.5 12 H1 M21.5 12 H23" class="g-l"/><circle cx="7" cy="12" r="1.5" class="g-s"/><circle cx="17" cy="12" r="1.5" class="g-s"/>',
    globe:
      '<circle cx="12" cy="12" r="9" class="g-l"/><ellipse cx="12" cy="12" rx="4" ry="9" class="g-l thin"/><path d="M3 12 H21 M4.5 7.5 H19.5 M4.5 16.5 H19.5" class="g-l thin"/>',
    sun: '<circle cx="12" cy="12" r="5" class="g-f"/><path d="M12 1.5 V4.5 M12 19.5 V22.5 M1.5 12 H4.5 M19.5 12 H22.5 M4.6 4.6 L6.7 6.7 M17.3 17.3 L19.4 19.4 M4.6 19.4 L6.7 17.3 M17.3 6.7 L19.4 4.6" class="g-l"/>',
    craft:
      '<path d="M4 20 L14 10 M14 10 a4 4 0 1 1 3 -6 l-3 3 l1.5 1.5 l3 -3 a4 4 0 0 1 -6 3" class="g-l"/>',
    medallion:
      '<circle cx="12" cy="13" r="7.5" class="g-f"/><circle cx="12" cy="13" r="4" class="g-l thin"/><path d="M9 2 L12 5.5 L15 2" class="g-l"/>',
  };
  // Names other modules still pass (poses, kinds, skill / talent ids…) → glyph.
  const ALIAS = {
    thumbsup: "check",
    thumbs_up: "check",
    ok: "check",
    done: "check",
    success: "check",
    worried: "warn",
    error: "warn",
    caution: "warn",
    carry: "item",
    pickup: "item",
    loot: "item",
    container: "item",
    map: "map",
    location: "pin",
    discover: "radar",
    discovered: "radar",
    cleared: "check",
    levelup: "level",
    xp: "level",
    think: "hint",
    tutorial: "hint",
    dead: "dead",
    death: "dead",
    heart: "standing",
    good: "standing",
    evil: "standing",
    reputation: "standing",
    eat: "food",
    hunger: "food",
    thirst: "drink",
    water: "drink",
    fatigue: "sleep",
    book: "note",
    reading: "note",
    notes: "note",
    wrench: "craft",
    repair: "craft",
    mechanics: "craft",
    science: "effect",
    injured: "heal",
    limb: "heal",
    medicine: "heal",
    aid: "heal",
    shrug: "info",
    stand: "info",
    wave: "info",
    point: "info",
    run: "travel",
    fasttravel: "travel",
    autosave: "save",
    saved: "save",
    keypad: "code",
    codes: "code",
    passcode: "code",
    terminal: "code",
    reel: "tape",
    tapes: "tape",
    audio: "tape",
    broadcast: "radio",
    money: "scrip",
    barter: "scrip",
    trade: "scrip",
    firearms: "weapon",
    guns: "weapon",
    melee: "weapon",
    explosives: "weapon",
    survival: "sun",
    persuasion: "standing",
    electronics: "code",
    stealth: "sneak",
    talent: "talent",
    skillbook: "note",
    brawn: "attr",
    reflex: "attr",
    grit: "attr",
    wits: "attr",
    senses: "attr",
    presence: "attr",
    time: "time",
    wait: "time",
    quest_done: "check",
    goggles: "goggles",
    lamp: "lamp",
    light: "lamp",
    medallion: "medallion",
    collectible: "medallion",
    glowkeeper: "sun",
  };
  function glyphName(n) {
    n = String(n || "").toLowerCase();
    if (GL[n]) return n;
    if (ALIAS[n]) return ALIAS[n];
    if (/^radi|prussian|iodine|geiger/.test(n)) return "radiation";
    if (/heal|med|cure|limb/.test(n)) return "heal";
    if (/quest|objective/.test(n)) return "quest";
    if (/key/.test(n)) return "key";
    if (/code|pin|pass/.test(n)) return "code";
    if (/radio|signal/.test(n)) return "radio";
    if (/tape|reel/.test(n)) return "tape";
    if (/note|book|letter/.test(n)) return "note";
    if (/gun|rifle|pistol|weapon|shot/.test(n)) return "weapon";
    if (/skill/.test(n)) return "skill";
    return "info";
  }
  H.glyphName = glyphName;
  H.glyph = function (name, cls) {
    return (
      '<svg class="gg-glyph' +
      (cls ? " " + cls : "") +
      '" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      GL[glyphName(name)] +
      "</svg>"
    );
  };

  // ------------------------------------------------------------------
  // Item plates (120 × 80). Classes: ic-l (line), ic-f (dim fill), ic-s (solid)
  // ------------------------------------------------------------------
  const K = {
    pistol:
      '<path d="M18 26 h66 v12 h-40 l-6 26 h-16 l6 -26 h-10 z" class="ic-f"/><path d="M84 28 h14 v6 h-14" class="ic-l"/><path d="M40 38 q2 10 10 10 h6" class="ic-l"/><path d="M26 30 h46 M26 34 h46" class="ic-l thin"/><circle cx="30" cy="52" r="2" class="ic-s"/>',
    revolver:
      '<path d="M16 28 h30 l6 -4 h20 v14 h-20 l-6 -2 h-6 l-8 28 h-16 l8 -28 h-8 z" class="ic-f"/><path d="M72 28 h32 v6 h-32" class="ic-l"/><circle cx="58" cy="31" r="7" class="ic-l"/><path d="M40 40 q2 8 10 8" class="ic-l"/>',
    rifle:
      '<path d="M4 40 l20 -8 h40 v-6 h18 v6 h34 v6 h-58 l-6 8 h-10 l2 -6 h-14 l-20 14 z" class="ic-f"/><rect x="50" y="18" width="26" height="6" rx="3" class="ic-l"/><path d="M56 24 v2 M70 24 v2" class="ic-l"/><path d="M30 40 h26" class="ic-l thin"/>',
    shotgun:
      '<path d="M4 42 l22 -10 h86 v10 h-60 l-6 6 h-10 l2 -6 h-12 l-20 12 z" class="ic-f"/><path d="M60 42 h40 v5 h-40 z" class="ic-l"/><path d="M36 36 h70" class="ic-l thin"/>',
    smg: '<path d="M14 30 h70 v12 h-24 l-4 26 h-12 l4 -26 h-10 l-4 14 h-12 l4 -14 h-12 z" class="ic-f"/><path d="M84 32 h22 v6 h-22" class="ic-l"/><path d="M60 42 v18 h8 v-18" class="ic-l"/>',
    ray: '<path d="M14 28 h56 l10 4 h10 v12 h-10 l-10 4 h-22 l-6 20 h-16 l6 -20 h-18 z" class="ic-f"/><path d="M90 34 h18 M90 42 h18" class="ic-l"/><path d="M108 30 l6 8 l-6 8" class="ic-l"/><path d="M26 32 h40 M26 44 h40" class="ic-l thin"/>',
    arc: '<path d="M4 44 l18 -10 h50 v-8 h16 v8 h8 v14 h-48 l-6 12 h-12 l4 -12 h-10 l-18 10 z" class="ic-f"/><path d="M98 34 l6 -6 l4 8 l6 -6 M98 46 l6 6 l4 -8 l6 6" class="ic-l"/><circle cx="80" cy="41" r="5" class="ic-l"/>',
    heavy:
      '<rect x="20" y="26" width="70" height="26" rx="6" class="ic-f"/><path d="M90 30 h24 M90 36 h24 M90 42 h24 M90 48 h24" class="ic-l"/><path d="M40 52 v14 h20 v-14" class="ic-l"/><path d="M28 26 v-8 h30 v8" class="ic-l"/>',
    launcher:
      '<rect x="10" y="28" width="100" height="18" rx="4" class="ic-f"/><path d="M40 46 v16 h10 v-16 M70 46 v10 h8 v-10" class="ic-l"/><path d="M104 24 v26" class="ic-l"/><circle cx="30" cy="37" r="4" class="ic-l"/>',
    mortar:
      '<path d="M30 66 L70 14 L80 20 L42 70 Z" class="ic-f"/><path d="M20 70 h44 M44 54 l26 16" class="ic-l"/><circle cx="74" cy="17" r="5" class="ic-l"/>',
    knife:
      '<path d="M10 42 h30 v-8 h-30 z" class="ic-f"/><path d="M40 32 h6 v12 h-6 z" class="ic-l"/><path d="M46 34 l60 -2 q-6 12 -60 12 z" class="ic-f"/><path d="M52 38 h40" class="ic-l thin"/>',
    torch:
      '<path d="M10 42 h34 v-8 h-34 z" class="ic-f"/><path d="M44 30 h6 v16 h-6 z" class="ic-l"/><path d="M50 36 h56 M50 40 h52" class="ic-l"/><path d="M58 32 q6 -6 12 0 q6 -6 12 0 q6 -6 12 0" class="ic-l thin"/>',
    bat: '<path d="M8 42 l96 -12 q10 4 2 14 l-98 4 z" class="ic-f"/><path d="M8 40 v10" class="ic-l"/><path d="M20 44 l10 -1" class="ic-l thin"/>',
    hammer:
      '<path d="M10 42 h70" class="ic-l" style="stroke-width:6"/><rect x="78" y="22" width="30" height="36" rx="3" class="ic-f"/><path d="M84 22 v36 M102 22 v36" class="ic-l thin"/>',
    saber:
      '<path d="M10 44 h26 v-10 h-26 z" class="ic-f"/><path d="M36 30 h68 l8 9 l-8 9 h-68 z" class="ic-f"/><path d="M40 30 l4 -4 M52 30 l4 -4 M64 30 l4 -4 M76 30 l4 -4 M88 30 l4 -4 M40 48 l4 4 M52 48 l4 4 M64 48 l4 4 M76 48 l4 4 M88 48 l4 4" class="ic-l"/>',
    fist: '<path d="M30 20 h50 q10 0 10 10 v24 q0 10 -10 10 h-50 q-10 0 -10 -10 v-24 q0 -10 10 -10 z" class="ic-f"/><path d="M40 20 v16 M54 20 v16 M68 20 v16" class="ic-l"/><path d="M30 40 h50" class="ic-l thin"/>',
    grenade:
      '<ellipse cx="60" cy="46" rx="20" ry="22" class="ic-f"/><path d="M42 36 h36 M40 46 h40 M42 56 h36" class="ic-l thin"/><rect x="52" y="16" width="16" height="10" class="ic-l"/><path d="M68 18 q16 -6 18 10" class="ic-l"/><circle cx="84" cy="30" r="4" class="ic-l"/>',
    mine: '<ellipse cx="60" cy="48" rx="34" ry="12" class="ic-f"/><path d="M26 44 q34 -24 68 0" class="ic-l"/><circle cx="60" cy="34" r="5" class="ic-s"/>',
    armor:
      '<path d="M38 12 l-22 10 l6 22 l10 -4 v32 h56 v-32 l10 4 l6 -22 l-22 -10 q-8 10 -22 10 q-14 0 -22 -10 z" class="ic-f"/><path d="M60 22 v50 M44 40 h32 M44 54 h32" class="ic-l thin"/>',
    cryosuit:
      '<path d="M40 12 l-22 10 l6 22 l10 -4 v34 h52 v-34 l10 4 l6 -22 l-22 -10 z" class="ic-f"/><ellipse cx="60" cy="13" rx="14" ry="5" class="ic-l" style="stroke-width:3"/><path d="M34 34 h52 M34 52 h52 M60 18 v56" class="ic-l thin"/>',
    exorig:
      '<path d="M40 8 h40 v22 h-40 z" class="ic-f"/><path d="M46 18 h28" class="ic-l" style="stroke-width:3"/><path d="M50 30 v6 h20 v-6" class="ic-l"/><path d="M20 40 h80 l-6 32 h-68 z" class="ic-f"/><path d="M40 40 v32 M80 40 v32 M20 52 h80" class="ic-l thin"/>',
    helmet:
      '<path d="M26 50 q0 -36 34 -36 q34 0 34 36 z" class="ic-f"/><path d="M20 50 h80 v6 h-80 z" class="ic-l"/><path d="M40 30 q20 -10 40 0" class="ic-l thin"/>',
    hat: '<path d="M16 54 q44 -14 88 0 q-10 -6 -18 -6 v-24 q-26 -10 -52 0 v24 q-8 0 -18 6 z" class="ic-f"/><path d="M34 42 h52" class="ic-l" style="stroke-width:4"/>',
    glasses:
      '<circle cx="40" cy="42" r="16" class="ic-f"/><circle cx="80" cy="42" r="16" class="ic-f"/><path d="M56 40 q4 -6 8 0 M24 38 l-12 -6 M96 38 l12 -6" class="ic-l"/>',
    mask: '<path d="M30 20 q30 -12 60 0 v26 q-30 26 -60 0 z" class="ic-f"/><circle cx="46" cy="34" r="7" class="ic-l"/><circle cx="74" cy="34" r="7" class="ic-l"/><rect x="52" y="48" width="16" height="14" rx="3" class="ic-l"/>',
    goggles:
      '<path d="M14 28 h92 v26 h-92 z" class="ic-f"/><circle cx="40" cy="41" r="11" class="ic-l"/><circle cx="80" cy="41" r="11" class="ic-l"/><path d="M4 38 h10 M106 38 h10" class="ic-l"/><circle cx="40" cy="41" r="4" class="ic-s"/><circle cx="80" cy="41" r="4" class="ic-s"/>',
    injector:
      '<rect x="28" y="32" width="56" height="16" rx="3" class="ic-f"/><path d="M84 40 h24" class="ic-l"/><rect x="12" y="28" width="16" height="24" rx="2" class="ic-l"/><path d="M42 32 v16 M56 32 v16 M70 32 v16" class="ic-l thin"/><path d="M48 20 h16 M56 14 v12" class="ic-l"/>',
    ivbag:
      '<path d="M38 8 h44 v44 q0 10 -10 10 h-24 q-10 0 -10 -10 z" class="ic-f"/><path d="M60 62 v14" class="ic-l"/><path d="M48 24 h24 M48 34 h24 M48 44 h16" class="ic-l thin"/>',
    pills:
      '<rect x="42" y="18" width="36" height="54" rx="6" class="ic-f"/><rect x="38" y="10" width="44" height="10" rx="2" class="ic-l"/><rect x="46" y="34" width="28" height="22" class="ic-l thin"/><path d="M54 45 h12 M60 39 v12" class="ic-l"/>',
    syrette:
      '<path d="M20 40 h62 l10 -4 v8 l-10 -4" class="ic-l"/><rect x="30" y="34" width="44" height="12" rx="6" class="ic-f"/><path d="M92 40 h18" class="ic-l thin"/>',
    inhaler:
      '<path d="M40 20 h30 v30 h14 v16 h-44 z" class="ic-f"/><path d="M44 20 v-8 h22 v8" class="ic-l"/><path d="M48 32 h16" class="ic-l thin"/>',
    bottle:
      '<path d="M54 4 h12 v14 q10 4 10 14 v8 q-4 4 0 8 v8 q-4 4 0 8 v8 q0 4 -4 4 h-24 q-4 0 -4 -4 v-8 q4 -4 0 -8 v-8 q4 -4 0 -8 v-8 q0 -10 10 -14 z" class="ic-f"/><path d="M52 4 h16" class="ic-l" style="stroke-width:4"/>',
    can: '<rect x="36" y="16" width="48" height="56" rx="4" class="ic-f"/><ellipse cx="60" cy="16" rx="24" ry="5" class="ic-l"/><path d="M36 32 h48 M36 56 h48" class="ic-l thin"/>',
    box: '<rect x="30" y="14" width="60" height="58" rx="3" class="ic-f"/><path d="M30 26 h60" class="ic-l"/><path d="M42 40 h36 M42 50 h36 M42 60 h24" class="ic-l thin"/>',
    meat: '<path d="M30 50 q-6 -30 26 -34 q30 -2 34 22 q2 22 -30 26 q-24 2 -30 -14 z" class="ic-f"/><path d="M84 56 l16 12" class="ic-l" style="stroke-width:5"/><circle cx="102" cy="70" r="5" class="ic-l"/>',
    scrip:
      '<path d="M18 20 h84 v40 h-84 z" class="ic-f"/><path d="M60 20 v40" class="ic-l thin"/><circle cx="36" cy="40" r="9" class="ic-l"/><path d="M70 32 h22 M70 40 h22 M70 48 h14" class="ic-l"/><path d="M18 20 l8 -6 h84 v40 l-8 6" class="ic-l thin"/>',
    key: '<circle cx="34" cy="40" r="16" class="ic-f"/><circle cx="34" cy="40" r="6" class="ic-l"/><path d="M50 40 h56 v10 M92 40 v8 M78 40 v10" class="ic-l" style="stroke-width:4"/>',
    keycard:
      '<rect x="24" y="14" width="72" height="52" rx="5" class="ic-f"/><rect x="34" y="24" width="20" height="14" class="ic-l"/><path d="M34 50 h52 M34 56 h36" class="ic-l thin"/>',
    note: '<path d="M30 8 h46 l14 14 v52 h-60 z" class="ic-f"/><path d="M76 8 v14 h14" class="ic-l"/><path d="M40 34 h40 M40 44 h40 M40 54 h30 M40 64 h36" class="ic-l thin"/>',
    reel: '<circle cx="60" cy="40" r="32" class="ic-f"/><circle cx="60" cy="40" r="7" class="ic-l"/><path d="M60 14 a26 26 0 0 1 22 12 l-10 6 a14 14 0 0 0 -12 -6 z M38 26 a26 26 0 0 0 0 28 l10 -6 a14 14 0 0 1 0 -16 z M82 54 a26 26 0 0 1 -22 12 v-12 a14 14 0 0 0 12 -6 z" class="ic-s" style="opacity:.55"/>',
    ammo: '<path d="M26 30 h14 v38 h-14 z M50 26 h14 v42 h-14 z M74 30 h14 v38 h-14 z" class="ic-f"/><path d="M26 30 q7 -16 14 0 M50 26 q7 -16 14 0 M74 30 q7 -16 14 0" class="ic-l"/><path d="M26 56 h14 M50 56 h14 M74 56 h14" class="ic-l thin"/>',
    cell: '<rect x="36" y="14" width="48" height="54" rx="6" class="ic-f"/><rect x="50" y="8" width="20" height="6" class="ic-l"/><path d="M62 24 l-10 18 h12 l-8 18" class="ic-l"/>',
    shell:
      '<path d="M40 22 h40 v38 h-40 z" class="ic-f"/><rect x="36" y="60" width="48" height="10" class="ic-l"/><path d="M40 34 h40" class="ic-l thin"/>',
    rocket:
      '<path d="M14 40 l16 -10 h66 l14 10 l-14 10 h-66 z" class="ic-f"/><path d="M30 30 l-10 -10 M30 50 l-10 10" class="ic-l"/>',
    mshell:
      '<path d="M30 40 q0 -16 30 -16 h30 v32 h-30 q-30 0 -30 -16 z" class="ic-f"/><path d="M90 26 l14 -6 v40 l-14 -6" class="ic-l"/><path d="M60 24 v32" class="ic-l thin"/>',
    teddy:
      '<circle cx="60" cy="28" r="14" class="ic-f"/><circle cx="46" cy="16" r="6" class="ic-l"/><circle cx="74" cy="16" r="6" class="ic-l"/><ellipse cx="60" cy="56" rx="18" ry="18" class="ic-f"/><circle cx="55" cy="26" r="2" class="ic-s"/><circle cx="65" cy="26" r="2" class="ic-s"/>',
    book: '<path d="M16 16 q22 -6 44 6 q22 -12 44 -6 v52 q-22 -6 -44 6 q-22 -12 -44 -6 z" class="ic-f"/><path d="M60 22 v52" class="ic-l"/><path d="M24 30 h28 M24 40 h28 M68 30 h28 M68 40 h28" class="ic-l thin"/>',
    medallion:
      '<circle cx="60" cy="44" r="26" class="ic-f"/><circle cx="60" cy="44" r="16" class="ic-l thin"/><path d="M60 30 v28 M46 44 h28" class="ic-l thin"/><ellipse cx="60" cy="44" rx="8" ry="16" class="ic-l thin"/><path d="M48 6 l12 12 l12 -12" class="ic-l"/>',
    junk: '<path d="M20 60 l18 -30 l18 14 l14 -24 l30 40 z" class="ic-f"/><circle cx="40" cy="60" r="8" class="ic-l"/><path d="M70 36 l6 -18 M80 44 h20" class="ic-l thin"/>',
    misc: '<rect x="28" y="20" width="64" height="44" rx="4" class="ic-f"/><path d="M28 32 h64 M52 20 v12 M68 20 v12" class="ic-l thin"/>',
  };

  /** Choose an icon kind for an item def (new item ids; generic words as fallback). */
