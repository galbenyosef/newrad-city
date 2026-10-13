// play-inline-476 01 — def
// Lines 18-366 of readable/play-inline-476.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const U = G.util;
  // Transition: old ids (skills, attributes, talents) resolve through src/core/compat.js.

  // ------------------------------------------------------------------
  // Static data
  // ------------------------------------------------------------------
  const ATTRS = ["brawn", "reflex", "grit", "wits", "senses", "presence"];
  const ATTR_INFO = {
    brawn: {
      name: "Brawn",
      short: "BRN",
      desc: "Muscle and leverage. Melee damage and how much you can carry.",
    },
    reflex: {
      name: "Reflex",
      short: "RFX",
      desc: "Hand speed and footwork. Reload speed, sprint stamina and recoil control.",
    },
    grit: {
      name: "Grit",
      short: "GRT",
      desc: "Toughness. Health, radiation resistance and how well you shrug off wounds.",
    },
    wits: {
      name: "Wits",
      short: "WIT",
      desc: "Quick thinking. How fast your skills grow, and your knack for crafting.",
    },
    senses: {
      name: "Senses",
      short: "SNS",
      desc: "Sharp eyes and ears. Accuracy, spotting danger, and landing critical hits.",
    },
    presence: {
      name: "Presence",
      short: "PRS",
      desc: "The room turns when you walk in. Persuasion, prices and followers.",
    },
  };
  const SKILLS = [
    "firearms",
    "melee",
    "explosives",
    "medicine",
    "mechanics",
    "electronics",
    "stealth",
    "persuasion",
    "trade",
    "survival",
  ];
  const SKILL_INFO = {
    firearms: {
      name: "Firearms",
      gov: "senses",
      desc: "Pistols, rifles, shotguns and ray guns. Grows by shooting things that shoot back.",
    },
    melee: {
      name: "Melee",
      gov: "brawn",
      desc: "Fists, blades, bats and hammers. Grows with every blow that lands.",
    },
    explosives: {
      name: "Explosives",
      gov: "senses",
      desc: "Grenades, mines, missiles and recoilless rounds. Grows by blowing things up.",
    },
    medicine: {
      name: "Medicine",
      gov: "wits",
      desc: "How much Rally Tonic and Prussian Blue do for you. Grows by patching yourself up.",
    },
    mechanics: {
      name: "Mechanics",
      gov: "wits",
      desc: "Keeping weapons and armour in working order. Grows by repairing and crafting.",
    },
    electronics: {
      name: "Electronics",
      gov: "wits",
      desc: "Terminals, keypads and radios. Grows every time you work one.",
    },
    stealth: {
      name: "Stealth",
      gov: "reflex",
      desc: "Moving unseen and unheard. Grows by staying hidden near danger and by sneak attacks.",
    },
    persuasion: {
      name: "Persuasion",
      gov: "presence",
      desc: "Talking people round. Grows by winning arguments.",
    },
    trade: {
      name: "Trade",
      gov: "presence",
      desc: "Getting a fair deal, or better. Grows with every trade.",
    },
    survival: {
      name: "Survival",
      gov: "grit",
      desc: "Food, water and finding your way. Grows by eating, cooking and exploring.",
    },
  };
  const LIMBS = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"];
  const LIMB_NAMES = {
    head: "head",
    torso: "torso",
    leftArm: "left arm",
    rightArm: "right arm",
    leftLeg: "left leg",
    rightLeg: "right leg",
  };
  const LEVEL_CAP = 30;
  const DEFAULT_ATTRS = {
    brawn: 5,
    reflex: 6,
    grit: 6,
    wits: 6,
    senses: 6,
    presence: 5,
  };

  const RAD_TIERS = [
    { at: 0, name: null, attrs: {} },
    { at: 200, name: "Radiation Sickness (Mild)", attrs: { grit: -1 } },
    {
      at: 400,
      name: "Radiation Sickness (Serious)",
      attrs: { grit: -2, reflex: -1 },
    },
    {
      at: 600,
      name: "Radiation Sickness (Severe)",
      attrs: { grit: -3, reflex: -2, brawn: -1 },
    },
    {
      at: 800,
      name: "Radiation Sickness (Terminal)",
      attrs: { grit: -3, reflex: -2, brawn: -2 },
    },
  ];

  /**
   * Standing: what the city thinks of you, −1000 … +1000. Five tiers, each with a title
   * that sharpens as your level (and reputation) grows.
   */
  const STANDING_TIERS = [
    "Trusted",
    "Respected",
    "Unknown",
    "Distrusted",
    "Feared",
  ];
  const STANDING_TITLES = [
    {
      max: 4,
      t: [
        "Good Neighbour",
        "Fair Dealer",
        "New Face",
        "Shady Type",
        "Bad News",
      ],
    },
    {
      max: 9,
      t: ["Block Captain", "Square Shooter", "Drifter", "Hustler", "Heavy"],
    },
    {
      max: 14,
      t: [
        "Borough Champion",
        "Straight Arrow",
        "Lone Operator",
        "Racketeer",
        "Enforcer",
      ],
    },
    {
      max: 20,
      t: [
        "Pillar of the City",
        "Man of His Word",
        "Wildcard",
        "Boss of the Docks",
        "Terror of the Avenues",
      ],
    },
    {
      max: 99,
      t: [
        "The City's Last Hope",
        "Living Legend",
        "The Long Sleeper",
        "King of the Ruins",
        "The Reckoning",
      ],
    },
  ];

  // XP for killing things, by actor type, scaled by actor level
  const KILL_XP = {
    giant_roach: 3,
    burrow_rat: 5,
    gasfly: 5,
    dog: 6,
    brute_hound: 10,
    maniac: 8,
    maniac_bruiser: 25,
    shellback: 15,
    shellback_matriarch: 120,
    ripjaw: 60,
    brute: 20,
    colossus: 150,
    raider: 10,
    human: 10,
    continuity_soldier: 30,
    covenant_warden: 30,
    patrolman: 15,
    valet: 15,
    valet_m: 18,
    sky_eye: 8,
    bulwark: 60,
  };
  const INNOCENT_FACTIONS = {
    settlers: 1,
    cryo: 1,
    covenant: 1,
    glowkeepers: 1,
  };

  // ------------------------------------------------------------------
  // Mutable character state (reset on 'reset', saved via G.save)
  // ------------------------------------------------------------------
  function heroAttrs() {
    const h = G.HERO && (G.HERO.attributes || G.HERO.attrs);
    const out = Object.assign({}, DEFAULT_ATTRS);
    if (h)
      for (const k of ATTRS)
        if (typeof h[k] === "number") out[k] = U.clamp(Math.round(h[k]), 1, 10);
    return out;
  }
  function freshState() {
    const s = {
      attrs: heroAttrs(),
      practice: {}, // skill -> practice points earned by use (float)
      bookPts: {}, // skill -> permanent bonus from manuals / quests
      medallions: {}, // medallion item id -> true
      level: 1,
      xp: 0,
      attrPoints: 0,
      talentPicks: 0,
      talents: {}, // id -> rank
      talentChoices: {}, // id -> [choices]
      standing: 0,
      effects: [], // timed effects
      addictions: {}, // id -> {name, day, withdrawal}
      limbs: {},
      radTier: 0,
      difficulty: "normal",
      stats: {
        kills: {},
        totalKills: 0,
        humanKills: 0,
        creatureKills: 0,
        robotKills: 0,
        locations: 0,
        questsCompleted: 0,
        tonicsUsed: 0,
        prussianBlueUsed: 0,
        chemsTaken: 0,
        timesAddicted: 0,
        scripFound: 0,
        itemsStolen: 0,
        checksPassed: 0,
        checksFailed: 0,
        medallions: 0,
        booksRead: 0,
        damageTaken: 0,
        criticalHits: 0,
        sneakAttacks: 0,
        murders: 0,
        itemsBought: 0,
        itemsSold: 0,
      },
      // Hardcore mode: hunger / thirst / sleep deprivation, 0..1000. Off by default.
      needs: { on: false, food: 0, water: 0, sleep: 0 },
    };
    const hs = (G.HERO && G.HERO.skills) || {};
    for (const k of SKILLS) {
      s.practice[k] = 0;
      s.bookPts[k] = typeof hs[k] === "number" ? hs[k] : 0;
    }
    for (const l of LIMBS) s.limbs[l] = 100;
    return s;
  }
  let S = freshState();

  /** Normalise an attribute object (lower-case ids; unknown keys are dropped). */
  function normAttrs(o) {
    if (!o) return null;
    const out = {};
    for (const k in o) {
      const nk = String(k).toLowerCase();
      if (ATTR_INFO[nk]) out[nk] = (out[nk] || 0) + o[k];
    }
    return out;
  }
  function normSkills(o) {
    if (!o) return null;
    const out = {};
    for (const k in o) {
      const nk = String(k).toLowerCase();
      if (SKILL_INFO[nk]) out[nk] = (out[nk] || 0) + o[k];
    }
    return out;
  }
  const skillId = (id) => String(id || "").toLowerCase();
  const attrId = (id) => String(id || "").toLowerCase();

  // ------------------------------------------------------------------
  // Talent registry (definitions live in 32_talents.js)
  // ------------------------------------------------------------------
  const TALENTS = [];
  const TALENT_MAP = new Map();
  const talentKey = (id) => id;
  function defineTalent(def) {
    if (!def || !def.id) return null;
    def.ranks = def.ranks || 1;
    def.reqLevel = def.reqLevel || 2;
    def.reqAttrs = def.reqAttrs || {};
    def.reqSkills = def.reqSkills || {};
    def.icon = def.icon || "talent";
    if (typeof def.apply !== "function") def.apply = function () {};
    const i = TALENTS.findIndex((p) => p.id === def.id);
    if (i >= 0) TALENTS[i] = def;
    else TALENTS.push(def);
    TALENT_MAP.set(def.id, def);
    dirty = true;
    return def;
  }
  function talentRank(id) {
    return S.talents[talentKey(id)] || 0;
  }
  function hasTalent(id) {
    return talentRank(id) > 0;
  }
