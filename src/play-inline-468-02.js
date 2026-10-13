// play-inline-468 02 — opts
// Lines 25-374 of readable/play-inline-468.pretty.js (statement-aligned).
  const C = G.chars,
    L = C._lib,
    A = L.anim;
  const clamp = L.clamp,
    lerp = L.lerp,
    smooth = L.smooth;
  const PI = Math.PI;

  const GORE = {
    red: 0x5e0a06,
    green: 0x4a6a12,
    oil: 0x141412,
    blue: 0x2a4a6a,
    violet: 0x3e1640,
  };
  L.GORE = GORE;

  // ------------------------------------------------------------------
  // Type table (humans here; creatures/robots registered by 30_/40_)
  // ------------------------------------------------------------------
  const HUMAN_OUTFITS = [
    "cryo_suit",
    "raider",
    "raider_heavy",
    "settler",
    "drifter",
    "merchant",
    "doctor",
    "covenant_exo_rig",
    "continuity_exo_rig",
    "continuity_uniform",
    "combat_armor",
    "leather_armor",
    "survivor_layers",
    "glowkeeper_robes",
    "lab_coat",
    "director_suit",
    "dj",
  ];
  L.HUMAN_OUTFITS = HUMAN_OUTFITS;
  const BIPED_STYLE = {
    hunch: 0,
    armOut: 0.07,
    armFwd: 0.0,
    elbow: 0.14,
    stride: 1,
    armSwing: 1,
    stance: 0.02,
    shrug: 0,
  };
  L.infos.human = {
    kind: "biped",
    height: 1.8,
    radius: 0.35,
    gore: "red",
    isRobot: false,
    isCreature: false,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"],
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Arm",
      rightArm: "Right Arm",
      leftLeg: "Left Leg",
      rightLeg: "Right Leg",
    },
    gait: { walkStep: 0.72, runStep: 1.25, walkSpeed: 1.6, runSpeed: 4.6 },
    style: BIPED_STYLE,
    variants: 16,
    build: (opts, seed) => L.human.build(opts, seed),
  };

  /** Resolve public type names / aliases into {base, opts}. */
  function resolveId(type, opts) {
    opts = Object.assign({}, opts || {});
    let t = String(type || "human");
    if (L.CAST && L.CAST[t] && L.castOpts)
      return { base: "human", opts: L.castOpts(t, opts) }; // story cast presets (24_cast.js)
    if (HUMAN_OUTFITS.indexOf(t) >= 0) {
      opts.outfit = opts.outfit || t;
      return { base: "human", opts };
    }
    switch (t) {
      case "human":
      case "npc":
        return { base: "human", opts };
      case "raider": {
        const r = L.rng((opts.seed || 1) * 7 + 3);
        opts.outfit =
          opts.outfit ||
          (opts.variant === "heavy" ||
          (opts.variant === undefined && r.chance(0.25))
            ? "raider_heavy"
            : "raider");
        if (typeof opts.variant === "string") delete opts.variant;
        return { base: "human", opts };
      }
      case "continuity_soldier":
      case "continuity":
        opts.outfit = "continuity_exo_rig";
        return { base: "human", opts };
      case "continuity_officer":
        opts.outfit = "continuity_uniform";
        return { base: "human", opts };
      case "covenant_warden":
      case "covenant":
        opts.outfit = "covenant_exo_rig";
        if (opts.variant === undefined) opts.variant = "mk2";
        return { base: "human", opts };
      case "covenant_lancer":
        opts.outfit = "covenant_exo_rig";
        return { base: "human", opts };
      case "covenant_archivist":
      case "covenant_acolyte":
        opts.outfit = opts.outfit || "lab_coat";
        return { base: "human", opts };
      case "director":
        opts.outfit = "director_suit";
        return { base: "human", opts };
      case "glowkeeper":
        opts.outfit = "glowkeeper_robes";
        return { base: "human", opts };
      case "brute_hound":
        opts.variant = opts.variant || "wild";
        return { base: "dog", opts };
      case "biscuit":
        opts.variant = opts.variant || "biscuit";
        return { base: "dog", opts };
      case "roach":
        return { base: "giant_roach", opts };
      case "rat":
        return { base: "burrow_rat", opts };
      case "ant":
      case "giantant":
        return { base: "giant_ant", opts };
      case "fireant":
        return { base: "fire_ant", opts };
      case "bear":
        return { base: "ash_bear", opts };
      case "ox":
      case "oxen":
        opts.pack = opts.pack !== false;
        return { base: "pack_ox", opts };
      case "cow":
        return { base: "pack_ox", opts };
      case "coyote_dark":
        opts.variant = "dark";
        return { base: "coyote", opts };
      case "deer":
        return { base: "stag", opts };
      case "crawlers":
        return { base: "crawler", opts };
    }
    if (L.infos[t]) return { base: t, opts };
    return null; // unknown type: callers (combat) fall back to their own placeholder
  }
  function resolveType(type, opts) {
    return resolveId(type, opts);
  }
  /** Closest known type for an unknown name (used by create's fallback). */
  function fallbackType(type) {
    const t = String(type || "").toLowerCase();
    const rules = [
      [/coyote|jackal/, "coyote"],
      [/stag|deer|elk|moose/, "stag"],
      [/\bcrawler|tunnel/, "crawler"],
      [/sandhog|miner/, "sandhog"],
      [/bruiser/, "maniac_bruiser"],
      [/maniac|madman|lunatic/, "maniac"],
      [/colossus|giant_brute/, "colossus"],
      [/brute|overlord/, "brute"],
      [/ripjaw|lizard|croc/, "ripjaw"],
      [/matriarch/, "shellback_matriarch"],
      [/shell|crab|lobster/, "shellback"],
      [/sting|scorp/, "stinger"],
      [/fire.?ant/, "fire_ant"],
      [/\bant\b|ant_|_ant/, "giant_ant"],
      [/bear/, "ash_bear"],
      [/lurch/, "lurcher"],
      [/roach|bug|insect/, "giant_roach"],
      [/rat/, "burrow_rat"],
      [/fly|mosquito|wasp|gas/, "gasfly"],
      [/dog|hound|wolf/, "dog"],
      [/\box|cow|cattle|bull/, "pack_ox"],
      [/eye|drone/, "sky_eye"],
      [/valet_m|military_valet/, "valet_m"],
      [/valet|butler|nurse/, "valet"],
      [/striker/, "striker"],
      [/thinker|brain/, "thinker"],
      [/bulwark|turret|tank/, "bulwark"],
      [/robo|bot|patrol|android|machine/, "patrolman"],
      [/continuity|federal|soldier/, "continuity_soldier"],
      [/covenant|warden|lancer|knight/, "covenant_lancer"],
      [/raider|gang|bandit|slaver|merc/, "raider"],
      [/doctor|medic/, "doctor"],
      [/scien/, "lab_coat"],
      [/cryo|sleeper/, "cryo_suit"],
      [/trader|merchant|vendor/, "merchant"],
    ];
    for (const [re, v] of rules) if (re.test(t)) return v;
    return "settler";
  }
  const warnedTypes = new Set();
  function warnUnknown(type, where) {
    const k = String(type);
    if (warnedTypes.has(k)) return;
    warnedTypes.add(k);
    console.warn(
      '[characters] unknown character type "' +
        k +
        '" (' +
        where +
        ") — known: " +
        PUBLIC_TYPES.concat(HUMAN_OUTFITS).join(", "),
    );
  }

  /**
   * Template cache key. Tint-like options are QUANTISED so arbitrary per-NPC
   * colours/scales can't create unbounded templates: skin tones & hair colours
   * snap to the nearest palette entry (the exact colour is restored per
   * instance through the material-class tint uniforms, see applyVariety),
   * other colours snap to 3 bits per channel and scale to 0.05 steps.
   */
  const _qc1 = new THREE.Color(),
    _qc2 = new THREE.Color();
  function nearestPalette(hex, list) {
    _qc1.setHex(hex);
    let best = list[0],
      bd = 1e9;
    for (const c of list) {
      _qc2.setHex(c);
      const d =
        (_qc1.r - _qc2.r) ** 2 +
        (_qc1.g - _qc2.g) ** 2 +
        (_qc1.b - _qc2.b) ** 2;
      if (d < bd) {
        bd = d;
        best = c;
      }
    }
    return best;
  }
  function ratioOf(want, got) {
    _qc1.setHex(want);
    _qc2.setHex(got);
    const f = (a, b) => clamp((a + 0.02) / (b + 0.02), 0.4, 2.5);
    return [f(_qc1.r, _qc2.r), f(_qc1.g, _qc2.g), f(_qc1.b, _qc2.b)];
  }
  const q3 = (hex) => {
    const r = (hex >> 16) & 255,
      g = (hex >> 8) & 255,
      b = hex & 255;
    const q = (v) => Math.min(255, (v >> 5) * 32 + 16);
    return (q(r) << 16) | (q(g) << 8) | q(b);
  };
  function quantiseOpts(opts) {
    const o = Object.assign({}, opts);
    if (typeof o.skinTone === "number") {
      const n = nearestPalette(o.skinTone, Object.values(L.SKIN));
      o._skinRatio = ratioOf(o.skinTone, n);
      o.skinTone = n;
    }
    if (typeof o.hairColor === "number") {
      const n = nearestPalette(o.hairColor, L.HAIR);
      o._hairRatio = ratioOf(o.hairColor, n);
      o.hairColor = n;
    }
    if (typeof o.hatColor === "number") o.hatColor = q3(o.hatColor);
    if (typeof o.color === "number") o.color = q3(o.color);
    if (typeof o.scale === "number")
      o.scale = Math.round(clamp(o.scale, 0.3, 4) * 20) / 20;
    return o;
  }
  function templateFor(base, opts) {
    const info = L.infos[base];
    let seed =
      opts.seed === undefined
        ? Math.floor(Math.random() * 1e9)
        : typeof opts.seed === "string"
          ? L.hashStr(opts.seed)
          : Math.floor(Math.abs(Number(opts.seed) || 0)) >>> 0;
    const nv = info.variants || 4;
    const vseed = (seed % nv) + 1;
    const qo = quantiseOpts(opts);
    const keyOpts = {};
    if (typeof qo.age === "number")
      qo.age = Math.round(clamp(qo.age, 0, 1) * 4) / 4; // 5 age bands
    if (typeof qo.outfitColor === "number") qo.outfitColor = q3(qo.outfitColor);
    for (const k of [
      "outfit",
      "gender",
      "skinTone",
      "hair",
      "hairColor",
      "beard",
      "burn",
      "scars",
      "variant",
      "hat",
      "hatColor",
      "glasses",
      "scale",
      "security",
      "utility",
      "sleeve",
      "color",
      "pack",
      "age",
      "outfitColor",
      "acc",
      "preset",
    ])
      if (qo[k] !== undefined && qo[k] !== null) keyOpts[k] = qo[k];
    const key = base + "|" + vseed + "|" + JSON.stringify(keyOpts);
    const tpl = L.getTemplate(key, () => {
      const t0 = performance.now();
      const t = info.build(qo, vseed * 7919 + L.hashStr(base));
      t.buildMs = performance.now() - t0;
      return t;
    });
    return {
      tpl,
      info,
      seed,
      ratios: { skin: qo._skinRatio || null, hair: qo._hairRatio || null },
    };
  }

  // ------------------------------------------------------------------
  // Per-instance variety: templates are shared (≤16 per outfit), so every
  // character gets its own tint per material class + grime from the FULL
  // seed. Near-unlimited variety at zero geometry cost.
  // ------------------------------------------------------------------
  const HAIR_SHIFT = [
    [1, 1, 1],
    [1, 1, 1],
    [0.55, 0.52, 0.5],
    [1.35, 1.12, 0.85],
    [1.25, 0.78, 0.6],
    [1.6, 1.55, 1.5],
    [0.78, 0.72, 0.68],
    [1.15, 1.05, 0.9],
  ];
  const BLOOD_COLORS = {
    red: [0.2, 0.012, 0.008],
    green: [0.07, 0.15, 0.015],
    oil: [0.018, 0.018, 0.016],
    blue: [0.03, 0.06, 0.12],
  };
