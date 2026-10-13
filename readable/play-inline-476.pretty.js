/* src/rpg/30_rpg_core.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — CORE CHARACTER SYSTEMS  (G.rpg)
 *
 *  Six attributes (Brawn, Reflex, Grit, Wits, Senses, Presence, 1–10)
 *  · ten use-based skills (0–100) · XP & levels (+1 Talent per level,
 *  +1 attribute point every 2 levels) · Talent engine (defs in
 *  32_talents.js) · derived stats · Standing · radiation sickness · timed
 *  effects / chems / addiction & withdrawal · limb condition · DR/DT
 *  mitigation · carry weight · barter pricing (Trade + Presence) · skill
 *  & attribute checks · sleeping / doctors · Hardcore needs.
 *
 * All modifiers (apparel, Talents, chems, withdrawal, rad sickness, limbs,
 * Hardcore needs) are funnelled through ONE aggregation pass (recalc) so every
 * query returns consistent numbers. Recalc is cheap and throttled.
 * ===================================================================== */
(function () {
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
  function talentName(def) {
    if (typeof def === "string") def = TALENT_MAP.get(talentKey(def));
    return def ? (typeof def.name === "function" ? def.name() : def.name) : "";
  }
  function talentDesc(def) {
    if (typeof def === "string") def = TALENT_MAP.get(talentKey(def));
    return def ? (typeof def.desc === "function" ? def.desc() : def.desc) : "";
  }

  // ------------------------------------------------------------------
  // Modifier aggregation
  // ------------------------------------------------------------------
  function emptyMods() {
    return {
      attrs: {},
      skills: {},
      dr: 0,
      dt: 0,
      radResist: 0,
      energyResist: 0,
      fireResist: 0,
      poisonResist: 0,
      hp: 0,
      stamina: 0,
      carry: 0,
      crit: 0,
      critMelee: 0,
      critDmg: 0,
      critDmgVs: {},
      dmgMult: 0,
      dmgType: {},
      dmgVs: {},
      dmgSkill: {},
      dmgOneHand: 0,
      dmgTwoHand: 0,
      radMedMult: 0,
      staminaRegenMult: 0,
      hpRegen: 0,
      speedMult: 0,
      xpMult: 0,
      sneak: 0,
      limbDmgMult: 0,
      lootScrip: 0,
      lootAmmo: 0,
      barterMult: 0,
      sellMult: 0,
      medMult: 0,
      foodRadMult: 0,
      chemDurationMult: 0,
      addictionMult: 0,
      practiceMult: 0,
      bookBonus: 0,
      unarmedDmg: 0,
      meleeDmg: 0,
      sneakAttackMult: 0,
      stealth: 0,
      foodHealMult: 0,
      spreadMult: 0,
      reloadMult: 0,
      standingMult: 0,
      luckyBreak: 0,
    };
  }
  function addMods(M, m) {
    if (!m) return;
    for (const k in m) {
      let v = m[k];
      if (v === undefined || v === null) continue;
      let key = k;
      if (k === "attrs") v = normAttrs(v);
      else if (k === "skills") v = normSkills(v);
      if (typeof v === "object") {
        const t = M[key] || (M[key] = {});
        for (const kk in v) t[kk] = (t[kk] || 0) + v[kk];
      } else if (typeof v === "number") M[key] = (M[key] || 0) + v;
      else if (typeof v === "boolean" && v) M[key] = (M[key] || 0) + 1;
    }
  }

  let dirty = true,
    lastCalc = -1;
  const D = {
    M: emptyMods(),
    attrs: {},
    skills: {},
    exoRig: false,
    crippled: {},
  };

  /** Context for conditional Talents. */
  function ctx() {
    const P = G.player;
    const hour = G.time ? G.time.hour : 12;
    const indoors = P && G.LAYOUT ? G.LAYOUT.isInterior(P.pos.x) : false;
    return {
      hpFrac: P && P.maxHp ? P.hp / P.maxHp : 1,
      night: hour < 6 || hour >= 18,
      sunlight: !indoors && hour >= 6.5 && hour < 18.5,
      indoors,
      rads: P ? P.rads : 0,
      standing: S.standing,
      level: S.level,
      sneaking: !!(P && P.sneaking),
    };
  }

  function recalc(force) {
    const now = G.time ? G.time.real : 0;
    if (!force && !dirty && now - lastCalc < 0.25) return D;
    lastCalc = now;
    dirty = false;
    const M = emptyMods();
    const c = ctx();

    // 1) Apparel (from player inventory)
    let rig = false;
    try {
      if (!G.isStub("inventory") && G.inventory.equippedApparel) {
        for (const e of G.inventory.equippedApparel()) {
          const d = e.def;
          if (!d) continue;
          const cond = d.hasCondition
            ? U.clamp(e.condition === undefined ? 1 : e.condition, 0, 1)
            : 1;
          const cm = 0.5 + 0.5 * cond; // worn armour protects less
          if (d.dr) M.dr += d.dr * cm;
          if (d.dt) M.dt += d.dt * cm;
          if (d.radResist) M.radResist += d.radResist;
          if (d.energyResist) M.energyResist += d.energyResist;
          if (d.fireResist) M.fireResist += d.fireResist;
          if (d.carry) M.carry += d.carry;
          if (d.attrs) addMods(M, { attrs: d.attrs });
          if (d.skills) addMods(M, { skills: d.skills });
          if (d.exoRig && d.slot === "body") rig = true;
        }
      }
    } catch (e) {
      /* inventory mid-load */
    }
    D.exoRig = rig;

    // 2) Talents
    for (const id in S.talents) {
      const def = TALENT_MAP.get(id);
      const r = S.talents[id];
      if (!def || !r || !def.mods) continue;
      try {
        addMods(M, def.mods(r, c, S.talentChoices[id] || []));
      } catch (e) {
        G.reportError("rpg:talent:" + id, e);
      }
    }

    // 3) Timed effects (chems, food buffs, well rested…)
    const activeAddictionIds = {};
    for (const ef of S.effects) {
      if (ef.mods) addMods(M, ef.mods);
      if (ef.addictionId) activeAddictionIds[ef.addictionId] = true;
    }

    // 4) Addiction withdrawal (only while the chem is not active)
    for (const id in S.addictions) {
      if (activeAddictionIds[id]) continue;
      addMods(M, S.addictions[id].withdrawal);
    }

    // 5) Radiation sickness
    const tier = RAD_TIERS[radTier()];
    if (tier && tier.attrs) addMods(M, { attrs: tier.attrs });

    // 6) Crippled limbs
    D.crippled = {};
    for (const l of LIMBS) if (S.limbs[l] <= 0) D.crippled[l] = true;
    if (D.crippled.head) addMods(M, { attrs: { senses: -2 } });
    if (D.crippled.torso) M.staminaRegenMult -= 0.3;
    if (D.crippled.leftArm) M.spreadMult += 0.35;
    if (D.crippled.rightArm) M.spreadMult += 0.35;
    const legs = (D.crippled.leftLeg ? 1 : 0) + (D.crippled.rightLeg ? 1 : 0);
    if (legs) M.speedMult -= legs === 2 ? 0.4 : 0.2;

    // 6b) Hardcore needs
    if (S.needs && S.needs.on)
      for (const k of NEED_KEYS) {
        const t = needTier(k);
        if (t > 0) addMods(M, NEEDS[k].tiers[t].mods);
      }

    // Effective attributes
    const at = {};
    for (const k of ATTRS)
      at[k] = U.clamp(Math.round(S.attrs[k] + (M.attrs[k] || 0)), 1, 10);
    // Skills: 5 + 3×governing attribute + practice + manuals + modifiers
    const sk = {};
    for (const k of SKILLS) {
      let v = 5 + 3 * at[SKILL_INFO[k].gov];
      v +=
        Math.floor(S.practice[k] || 0) +
        (S.bookPts[k] || 0) +
        (M.skills[k] || 0);
      sk[k] = U.clamp(Math.round(v), 0, 100);
    }
    D.M = M;
    D.attrs = at;
    D.skills = sk;
    return D;
  }
  function markDirty() {
    dirty = true;
  }

  /** Base (permanent) skill value without temporary effects. */
  function skillBase(id) {
    id = skillId(id);
    if (!SKILL_INFO[id]) return 0;
    const gov = SKILL_INFO[id].gov;
    let v = 5 + 3 * U.clamp(S.attrs[gov], 1, 10);
    v += Math.floor(S.practice[id] || 0) + (S.bookPts[id] || 0);
    return U.clamp(v, 0, 100);
  }

  // ------------------------------------------------------------------
  // Use-based skill growth
  // ------------------------------------------------------------------
  /**
   * Practise a skill. amount ≈ "one solid use" = 1. The gain shrinks as the skill rises and
   * grows with Wits (and the Quick Study Talent). Every 5th point is announced.
   */
  function practice(id, amount, reason) {
    id = skillId(id);
    if (!SKILL_INFO[id] || !(amount > 0)) return 0;
    const d = recalc();
    const before = skillBase(id);
    if (before >= 100) return 0;
    const rate =
      (1 + (d.attrs.wits - 5) * 0.08) *
      (1 + d.M.practiceMult) *
      Math.max(0.12, 1 - before / 115);
    const gain = 0.35 * amount * rate;
    S.practice[id] = (S.practice[id] || 0) + gain;
    const after = skillBase(id);
    if (after !== before) {
      dirty = true;
      G.events.emit("skillsChanged", id);
      if (Math.floor(after / 5) !== Math.floor(before / 5))
        G.notify(SKILL_INFO[id].name + " improved to " + after + ".", {
          kind: "skill",
          skill: id,
          reason: reason || "",
        });
    }
    return gain;
  }
  /** Fraction (0..1) of the way to the next skill point. */
  function skillProgress(id) {
    id = skillId(id);
    const p = S.practice[id] || 0;
    return p - Math.floor(p);
  }

  // ------------------------------------------------------------------
  // Radiation
  // ------------------------------------------------------------------
  function radTier() {
    const r = G.player ? G.player.rads : 0;
    let t = 0;
    for (let i = 0; i < RAD_TIERS.length; i++) if (r >= RAD_TIERS[i].at) t = i;
    return t;
  }
  /** Add rads bypassing rad resistance (ingested radiation: food, water). */
  function addRadsDirect(n) {
    const P = G.player;
    if (!P || !n) return;
    P.rads = U.clamp(P.rads + n, 0, 1000);
    G.events.emit("radsChanged", P.rads, n);
    if (P.rads >= 1000 && P.die) P.die({ type: "rad" });
  }
  function removeRads(n) {
    const P = G.player;
    if (!P) return;
    P.rads = Math.max(0, P.rads - Math.abs(n));
    G.events.emit("radsChanged", P.rads, -Math.abs(n));
  }
  function checkRadTier() {
    const t = radTier();
    if (t !== S.radTier) {
      if (t > S.radTier && RAD_TIERS[t].name) {
        G.notify(RAD_TIERS[t].name + ".", { kind: "radiation", tier: t });
        G.sfx.play("geiger", { volume: 0.8 });
      } else if (t < S.radTier && t === 0)
        G.notify("Your radiation sickness has passed.", {
          kind: "radiation",
          tier: 0,
        });
      S.radTier = t;
      dirty = true;
      G.events.emit("effectsChanged");
    }
  }

  // ------------------------------------------------------------------
  // XP & levelling
  // ------------------------------------------------------------------
  /** Total XP needed to REACH level n: 60·(n−1)² + 150·(n−1) → 210, 540, 990, 1560… */
  function xpForLevel(n) {
    return n <= 1 ? 0 : 60 * (n - 1) * (n - 1) + 150 * (n - 1);
  }
  function addXP(n, reason) {
    n = Number(n) || 0;
    if (n <= 0) return 0;
    const d = recalc();
    n = Math.max(1, Math.round(n * (1 + d.M.xpMult)));
    S.xp += n;
    G.events.emit("xpGained", n, reason || "");
    checkLevelUp();
    return n;
  }
  function checkLevelUp() {
    let gained = 0;
    while (S.level < LEVEL_CAP && S.xp >= xpForLevel(S.level + 1)) {
      S.level++;
      gained++;
      S.talentPicks += 1;
      if (S.level % 2 === 0) S.attrPoints += 1;
      dirty = true;
      const P = G.player;
      if (P && P.alive) {
        recalc(true);
        P.maxHp = maxHp();
        if (!R.options || R.options.levelUpHeal !== false) P.hp = P.maxHp;
      }
      G.events.emit("levelUp", S.level, {
        talents: S.talentPicks,
        attrPoints: S.attrPoints,
      });
    }
    return gained;
  }
  /** Spend an attribute point (granted every second level). */
  function spendAttrPoint(id) {
    id = attrId(id);
    if (!ATTR_INFO[id] || S.attrPoints <= 0 || S.attrs[id] >= 10) return false;
    S.attrs[id]++;
    S.attrPoints--;
    dirty = true;
    G.events.emit("attrsChanged", id);
    G.notify(ATTR_INFO[id].name + " increased to " + S.attrs[id] + ".", {
      kind: "attr",
      attr: id,
    });
    const P = G.player;
    if (P) {
      recalc(true);
      P.maxHp = maxHp();
    }
    return true;
  }
  /** Permanently raise a skill (manuals, quest rewards, trainers). */
  function boostSkill(id, n, source) {
    id = skillId(id);
    if (!SKILL_INFO[id]) return 0;
    const room = 100 - skillBase(id);
    const k = Math.max(0, Math.min(n, room));
    S.bookPts[id] = (S.bookPts[id] || 0) + k;
    dirty = true;
    G.events.emit("skillsChanged", id);
    if (source !== "silent")
      G.notify(SKILL_INFO[id].name + " increased to " + skillBase(id) + ".", {
        kind: "skill",
        skill: id,
      });
    return k;
  }

  // ------------------------------------------------------------------
  // Talents
  // ------------------------------------------------------------------
  function talentEligibility(def) {
    const r = talentRank(def.id);
    if (def.hidden) return { ok: false, reason: "Earned in the field" };
    if (r >= def.ranks) return { ok: false, reason: "Max rank" };
    const lvlReq = def.reqLevel + (def.levelStep ? r * def.levelStep : 0);
    if (S.level < lvlReq)
      return { ok: false, reason: "Requires level " + lvlReq };
    for (const k in def.reqAttrs)
      if (S.attrs[k] < def.reqAttrs[k])
        return {
          ok: false,
          reason: "Requires " + ATTR_INFO[k].name + " " + def.reqAttrs[k],
        };
    for (const k in def.reqSkills)
      if (skillBase(k) < def.reqSkills[k])
        return {
          ok: false,
          reason: "Requires " + SKILL_INFO[k].name + " " + def.reqSkills[k],
        };
    if (def.reqStanding === "good" && S.standing < 250)
      return { ok: false, reason: "Requires Respected standing" };
    if (def.reqStanding === "bad" && S.standing > -250)
      return { ok: false, reason: "Requires Distrusted standing" };
    if (def.canTake && !def.canTake())
      return { ok: false, reason: def.cantReason || "Unavailable" };
    if (def.needsHook && !HOOKS[def.needsHook])
      return { ok: false, reason: "Not yet available" };
    return { ok: true, reason: "" };
  }
  /** World features other modules declare they honour (e.g. 'traps' for Light Feet). */
  const HOOKS = {};
  function declareHook(name) {
    if (name) {
      HOOKS[name] = true;
      dirty = true;
    }
  }
  function talentsEligible() {
    return TALENTS.filter((p) => talentEligibility(p).ok);
  }
  function talentsAvailable() {
    return S.talentPicks > 0 ? talentsEligible() : [];
  }
  /** Every selectable Talent with eligibility info, for the level-up screen. */
  function talentList() {
    return TALENTS.filter((p) => !p.hidden).map((p) => {
      const el = talentEligibility(p);
      return {
        id: p.id,
        name: talentName(p),
        desc: talentDesc(p),
        icon: p.icon,
        rank: talentRank(p.id),
        ranks: p.ranks,
        reqLevel: p.reqLevel,
        eligible: el.ok,
        reason: el.reason,
        choice: p.choice || null,
        def: p,
      };
    });
  }
  function takeTalent(id, choice, opts) {
    id = talentKey(id);
    const def = TALENT_MAP.get(id);
    if (!def) return false;
    opts = opts || {};
    if (!opts.free) {
      if (S.talentPicks <= 0) return false;
      if (!talentEligibility(def).ok) return false;
    }
    S.talents[id] = (S.talents[id] || 0) + 1;
    if (!opts.free) S.talentPicks--;
    if (choice !== undefined && choice !== null)
      (S.talentChoices[id] = S.talentChoices[id] || []).push(choice);
    dirty = true;
    try {
      if (def.apply) def.apply(choice, S.talents[id]);
    } catch (e) {
      G.reportError("rpg:talentApply:" + id, e);
    }
    dirty = true;
    G.events.emit("talentTaken", id, S.talents[id]);
    return true;
  }
  /** Quest / scripted grant (ignores requirements & picks), e.g. exo-rig certification. */
  function grantTalent(id, silent) {
    id = talentKey(id);
    const def = TALENT_MAP.get(id);
    if (!def) return false;
    if (talentRank(id) >= def.ranks) return false;
    takeTalent(id, undefined, { free: true });
    if (!silent)
      G.notify("Talent gained: " + talentName(def), {
        kind: "talent",
        talent: id,
      });
    return true;
  }
  function playerTalents() {
    const out = [];
    for (const id in S.talents) {
      const def = TALENT_MAP.get(id);
      if (!def || !S.talents[id]) continue;
      out.push({
        id,
        name: talentName(def),
        desc: talentDesc(def),
        rank: S.talents[id],
        ranks: def.ranks,
        icon: def.icon,
        def,
      });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }

  // ------------------------------------------------------------------
  // Derived stats
  // ------------------------------------------------------------------
  function maxHp() {
    const d = recalc();
    return Math.round(80 + d.attrs.grit * 15 + S.level * 8 + d.M.hp);
  }
  /** Sprint stamina pool (G.player.stamina / maxStamina). */
  function maxStamina() {
    const d = recalc();
    return Math.round(60 + d.attrs.reflex * 4 + d.attrs.grit * 2 + d.M.stamina);
  }
  function staminaRegen() {
    const d = recalc();
    return Math.max(2, (8 + d.attrs.reflex * 0.8) * (1 + d.M.staminaRegenMult));
  }
  function carryWeight() {
    const d = recalc();
    return Math.round(140 + d.attrs.brawn * 12 + d.M.carry);
  }
  /** Critical chance in percent (Senses + Talents; the caller multiplies by the weapon's crit multiplier). */
  function critChance(weaponDef) {
    const d = recalc();
    let c = 2 + d.attrs.senses * 0.8 + d.M.crit;
    if (weaponDef === undefined) weaponDef = currentWeaponDef();
    const w = weaponBlock(weaponDef);
    if (w && (w.skill === "melee" || w.melee)) c += d.M.critMelee;
    return U.clamp(c, 0, 100);
  }
  /** Critical damage multiplier: Talents (Executioner, Trapper vs creatures, Shadow Step on sneak crits). */
  function critDamageMult(target, info) {
    const d = recalc();
    const M = d.M;
    let m = 1 + M.critDmg;
    const cls =
      target && typeof target === "object" ? classifyTarget(target) : null;
    if (cls && cls.creature && M.critDmgVs.creature) m += M.critDmgVs.creature;
    if (info && info.sneak) m += M.sneakAttackMult;
    return m;
  }
  function currentWeaponDef() {
    try {
      if (!G.isStub("weapons") && G.weapons.current) {
        const c = G.weapons.current();
        if (c && c.id) return G.items.get(c.id) || c;
      }
      if (!G.isStub("inventory")) {
        const id = G.inventory.equipped("weapon");
        if (id) return G.items.get(id);
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  }
  function speedMult() {
    const d = recalc();
    return U.clamp(1 + d.M.speedMult, 0.3, 1.6);
  }
  function radResist() {
    const d = recalc();
    return U.clamp(d.attrs.grit * 2 + d.M.radResist, 0, 85);
  }
  function getDR(type) {
    const d = recalc();
    let dr = d.M.dr;
    if (
      type === "energy" ||
      type === "laser" ||
      type === "plasma" ||
      type === "ray" ||
      type === "arc"
    )
      dr += d.M.energyResist;
    if (type === "fire") dr += d.M.fireResist;
    if (type === "poison") return U.clamp(d.M.poisonResist, 0, 85);
    return U.clamp(dr, 0, 85);
  }
  function getDT() {
    return Math.max(0, recalc().M.dt);
  }
  function inventoryWeight() {
    try {
      return G.isStub("inventory") ? 0 : G.inventory.weight();
    } catch (e) {
      return 0;
    }
  }
  function isOverencumbered() {
    return inventoryWeight() > carryWeight();
  }
  function isStealthed() {
    return recalc().M.stealth > 0;
  }
  function sneakBonus() {
    const d = recalc();
    return d.skills.stealth + d.M.sneak;
  }
  function sneakAttackMult() {
    return 2 * (1 + recalc().M.sneakAttackMult);
  }
  function lootScripMult() {
    return 1 + recalc().M.lootScrip;
  }
  function lootAmmoMult() {
    return 1 + recalc().M.lootAmmo;
  }
  function wearingExoRig() {
    recalc();
    return D.exoRig;
  }
  /** Reload time multiplier (Reflex + Quick Hands). */
  function reloadMult() {
    const d = recalc();
    return U.clamp(
      (1.15 - d.attrs.reflex * 0.03) * (1 + d.M.reloadMult),
      0.5,
      1.3,
    );
  }
  /** Recoil multiplier (Reflex). */
  function recoilMult() {
    const d = recalc();
    return U.clamp(1.2 - d.attrs.reflex * 0.04, 0.7, 1.2);
  }

  // ------------------------------------------------------------------
  // Weapon-facing multipliers (queried by weapons / combat)
  // ------------------------------------------------------------------
  function weaponBlock(def) {
    if (!def) return null;
    if (typeof def === "string") {
      const d = G.items.get(def);
      return d ? d.weapon || null : null;
    }
    return def.weapon || (def.skill ? def : null);
  }
  function weaponSkill(def) {
    const w = weaponBlock(def);
    return w && w.skill ? skillId(w.skill) : null;
  }
  function isOneHanded(def) {
    const w = weaponBlock(def) || {};
    if (w.oneHanded !== undefined) return !!w.oneHanded;
    if (w.twoHanded !== undefined) return !w.twoHanded;
    const id = (def && (def.id || "")) + " " + (w.viewmodel || "");
    return /pistol|revolver|magnum|44|knuckle|knife|fist/.test(id);
  }
  /** Skill scaling only: damage × (0.6 + skill/250). */
  function skillDamageMult(weaponDef) {
    const sk = weaponSkill(weaponDef);
    if (!sk || !SKILL_INFO[sk]) return 1;
    return 0.6 + recalc().skills[sk] / 250;
  }
  // ------------------------------------------------------------------
  // Target classification: who a Talent's "+X% damage vs …" applies to
  // ------------------------------------------------------------------
  const EVIL_FACTIONS = { raiders: 1, continuity: 1, slavers: 1 };
  const GOOD_FACTIONS = {
    settlers: 1,
    cryo: 1,
    covenant: 1,
    citizens: 1,
    merchants: 1,
  };
  /**
   * Classify an actor (combat Actor, or any {type, faction, def, td}) for Talent bonuses.
   * Returns {robot, insect, creature, animal, human, maniac, brute, evil, good}.
   */
  function classifyTarget(t) {
    if (!t || typeof t !== "object") return null;
    if (t._rpgCls && t._rpgClsT === S.standing) return t._rpgCls; // cheap per-actor cache
    const tt = String(t.type || (t.def && t.def.type) || "");
    const fac = t.faction;
    const td = t.td || null;
    let info = null;
    try {
      info = !G.isStub("chars") && G.chars.info ? G.chars.info(tt) : null;
    } catch (e) {
      info = null;
    }
    const robot =
      !!(t.isRobot || (td && td.isRobot) || (info && info.isRobot)) ||
      /patrolman|valet|sky_eye|bulwark|striker|thinker|robot|turret/.test(tt) ||
      fac === "robots";
    const insect =
      !robot &&
      /roach|gasfly|giant_ant|fire_ant|shellback|stinger|scorpion/.test(tt);
    const maniac = /maniac/.test(tt) || fac === "maniacs";
    const brute = /brute|colossus|lurcher/.test(tt) || fac === "brutes";
    const creatureFlag = !!(
      t.isCreature ||
      (td && td.isCreature) ||
      (info && info.isCreature)
    );
    const creature =
      !robot &&
      !brute &&
      !maniac &&
      (creatureFlag ||
        insect ||
        /roach|burrow_rat|gasfly|shellback|ripjaw|dog|hound|ash_bear|pack_ox|coyote/.test(
          tt,
        ));
    const animal =
      creature &&
      /dog|hound|burrow_rat|pack_ox|ash_bear|ripjaw|coyote/.test(tt);
    const human = !robot && !creature && !brute; // Maniacs are people too
    let sd = t.standing !== undefined ? t.standing : t.def && t.def.standing;
    const evil =
      human &&
      (!!EVIL_FACTIONS[fac] ||
        !!(t.def && t.def.evil) ||
        (typeof sd === "number" && sd > 0));
    const good =
      human &&
      !evil &&
      (!!GOOD_FACTIONS[fac] || (typeof sd === "number" && sd < 0));
    const cls = {
      robot,
      insect,
      creature,
      animal,
      human,
      maniac,
      brute,
      evil,
      good,
    };
    try {
      t._rpgCls = cls;
      t._rpgClsT = S.standing;
    } catch (e) {
      /* frozen object */
    }
    return cls;
  }
  /** Additive damage bonus (fraction) that Talents give against this target. */
  function targetDamageBonus(target, M) {
    const cls = classifyTarget(target);
    if (!cls) return 0;
    M = M || recalc().M;
    const V = M.dmgVs;
    let b = 0;
    for (const k of [
      "robot",
      "insect",
      "human",
      "maniac",
      "brute",
      "creature",
      "evil",
      "good",
    ])
      if (cls[k] && V[k]) b += V[k];
    return b;
  }
  function damageTypeOf(w) {
    const sk = w.skill ? skillId(w.skill) : null;
    return (
      w.damageType ||
      (sk === "explosives"
        ? "explosive"
        : sk === "melee"
          ? "melee"
          : "ballistic")
    );
  }
  /** Talent / chem damage multiplier (no skill scaling). target: actor (optional). */
  function talentDamageMult(weaponDef, target) {
    const d = recalc();
    const M = d.M;
    const w = weaponBlock(weaponDef) || {};
    let m = 1 + M.dmgMult;
    const dt = damageTypeOf(w);
    if (M.dmgType[dt]) m += M.dmgType[dt];
    if (dt === "laser" || dt === "plasma" || dt === "energy") {
      if (M.dmgType.energy && dt !== "energy") m += M.dmgType.energy;
    }
    if (
      dt !== "explosive" &&
      M.dmgType.explosive &&
      (w.explosionRadius || w.explosive)
    )
      m += M.dmgType.explosive;
    const sk = w.skill ? skillId(w.skill) : null;
    if (sk && M.dmgSkill[sk]) m += M.dmgSkill[sk];
    if (sk === "firearms")
      m += isOneHanded(weaponDef) ? M.dmgOneHand : M.dmgTwoHand;
    if (target) m += targetDamageBonus(target, M);
    return m;
  }
  /**
   * Full damage multiplier for a player weapon: skill × Talents/chems (× target bonuses when the
   * target is given). damageMult(weaponDef, target?, {noSkill})
   */
  function damageMult(weaponDef, target, opts) {
    if (
      typeof weaponDef === "string" &&
      SKILL_INFO[skillId(weaponDef)] &&
      !G.items.get(weaponDef)
    )
      weaponDef = { skill: skillId(weaponDef) };
    const s = opts && opts.noSkill ? 1 : skillDamageMult(weaponDef);
    return s * talentDamageMult(weaponDef, target);
  }
  function isActorLike(o) {
    return !!(
      o &&
      typeof o === "object" &&
      (o.faction !== undefined || o.char !== undefined || o.td !== undefined) &&
      (o.hp !== undefined || o.type !== undefined)
    );
  }

  /** Tracks who started a fight (Standing loss for murdering bystanders). Registered in 90_module. */
  function onActorDamaged(a, dmg, info) {
    if (!a || !info) return 0;
    if (info.source !== "player" && info.source !== G.player) return 0;
    try {
      if (!a.dead) {
        if (typeof a.hostile === "function" && a.hostile())
          a._rpgSeenHostile = true;
        else if (!a._rpgSeenHostile) a._rpgPlayerStarted = true;
      }
    } catch (e) {
      /* ignore */
    }
    return 0;
  }
  /** Flat melee damage bonus (Brawn/2, plus Brawler). */
  function meleeDamageBonus(weaponDef) {
    const d = recalc();
    const w = weaponBlock(weaponDef) || {};
    const sk = w.skill ? skillId(w.skill) : null;
    if (
      !sk ||
      (sk === "melee" &&
        (w.unarmed || /fist|knuckle|unarmed/.test(String(w.viewmodel || ""))))
    )
      return d.attrs.brawn * 0.5 + d.M.unarmedDmg;
    if (sk === "melee") return d.attrs.brawn * 0.5 + d.M.meleeDmg;
    return 0;
  }
  /** Weapon spread multiplier from skill, Senses and crippled arms. */
  function spreadMult(weaponDef) {
    const d = recalc();
    const sk = weaponSkill(weaponDef);
    const v = sk && SKILL_INFO[sk] ? d.skills[sk] : 50;
    return (
      (1.5 - v / 100) * (1.1 - d.attrs.senses * 0.02) * (1 + d.M.spreadMult)
    );
  }

  /**
   * One-stop combat query for a player attack:
   *   G.rpg.combatMods(weaponDef, targetActor?, {sneak}) →
   *   { dmg (skill × Talents × target), talentDmg (without skill), crit (percent), critDmg (multiplier),
   *     spread, sneakMult, meleeBonus, reload, recoil }
   */
  function combatMods(weaponDef, target, o) {
    o = o || {};
    const t = talentDamageMult(weaponDef, target || null);
    return {
      dmg: skillDamageMult(weaponDef) * t,
      talentDmg: t,
      crit: critChance(weaponDef || null),
      critDmg: critDamageMult(target, { sneak: !!o.sneak }),
      spread: spreadMult(weaponDef),
      sneakMult: sneakAttackMult(),
      meleeBonus: meleeDamageBonus(weaponDef),
      reload: reloadMult(),
      recoil: recoilMult(),
    };
  }

  // ------------------------------------------------------------------
  // Standing
  // ------------------------------------------------------------------
  function standingTier() {
    const k = S.standing;
    return k >= 750 ? 0 : k >= 250 ? 1 : k > -250 ? 2 : k > -750 ? 3 : 4;
  }
  function standingLabel() {
    return STANDING_TIERS[standingTier()];
  }
  function standingTitle() {
    const row =
      STANDING_TITLES.find((r) => S.level <= r.max) ||
      STANDING_TITLES[STANDING_TITLES.length - 1];
    return row.t[standingTier()];
  }
  function addStanding(n, reason) {
    n = Number(n) || 0;
    if (n > 0) n *= 1 + recalc().M.standingMult;
    n = Math.round(n);
    if (!n) return S.standing;
    const beforeTitle = standingTitle();
    S.standing = U.clamp(S.standing + n, -1000, 1000);
    dirty = true;
    G.events.emit("standingChanged", S.standing, n, reason || "");
    G.notify(
      n > 0 ? "Your standing has improved." : "Your standing has dropped.",
      { kind: "standing", delta: n, reason: reason || "" },
    );
    const t = standingTitle();
    if (t !== beforeTitle)
      G.notify("Standing: " + t, { kind: "standing_title", title: t });
    return S.standing;
  }

  // ------------------------------------------------------------------
  // Timed effects
  // ------------------------------------------------------------------
  let effSeq = 0;
  /**
   * def: {id, name, duration (sec), mods?, kind?:'chem'|'food'|'buff'|'debuff'|'rest', source?, desc?,
   *       tick?: {hp, rads} per second, addictionId?, after?:{name,duration,attrs}, shade?}
   * Same id refreshes the timer instead of stacking.
   */
  function addEffect(def) {
    if (!def) return null;
    const id = def.id || "fx" + ++effSeq;
    let ef = S.effects.find((e) => e.id === id && !def.stack);
    const shade = !!(def.shade || def.stealth);
    if (ef) {
      ef.remaining = Math.max(ef.remaining, def.duration || 0);
      ef.total = Math.max(ef.total, def.duration || 0);
    } else {
      ef = {
        id,
        name: def.name || id,
        kind: def.kind || "buff",
        total: def.duration || 0,
        remaining: def.duration || 0,
        mods: def.mods || null,
        source: def.source || null,
        desc: def.desc || "",
        tick: def.tick || null,
        addictionId: def.addictionId || null,
        after: def.after || null,
      };
      if (def.sway) ef.sway = def.sway;
      if (shade) {
        ef.mods = ef.mods || {};
        ef.mods.stealth = 1;
      }
      S.effects.push(ef);
      if (shade) {
        G.events.emit("shadeField", true);
        G.notify("Shade field active.", { kind: "effect" });
      }
    }
    dirty = true;
    G.events.emit("effectsChanged");
    return ef;
  }
  function removeEffect(id) {
    const i = S.effects.findIndex((e) => e.id === id);
    if (i < 0) return false;
    const ef = S.effects[i];
    S.effects.splice(i, 1);
    onEffectEnd(ef);
    dirty = true;
    G.events.emit("effectsChanged");
    return true;
  }
  function onEffectEnd(ef) {
    if (ef.mods && ef.mods.stealth) {
      G.events.emit("shadeField", false);
      G.notify("Shade field depleted.", { kind: "effect" });
    }
    if (ef.after)
      addEffect({
        id: ef.id + "_after",
        name: ef.after.name,
        duration: ef.after.duration || 60,
        kind: "debuff",
        mods: {
          attrs: normAttrs(ef.after.attrs) || {},
          skills: ef.after.skills || {},
        },
      });
  }
  function updateEffects(dt) {
    if (dt <= 0) return;
    const P = G.player;
    let changed = false;
    for (let i = S.effects.length - 1; i >= 0; i--) {
      const ef = S.effects[i];
      const step = Math.min(dt, Math.max(0, ef.remaining));
      if (ef.tick && step > 0) {
        if (ef.tick.hp && P && P.alive)
          P.hp = Math.min(P.maxHp, P.hp + ef.tick.hp * step);
        if (ef.tick.rads) {
          if (ef.tick.rads < 0) removeRads(-ef.tick.rads * step);
          else addRadsDirect(ef.tick.rads * step);
        }
        if (ef.tick.limbs) healLimbs(ef.tick.limbs * step);
      }
      if (ef.total > 0) {
        ef.remaining -= dt;
        if (ef.remaining <= 0) {
          S.effects.splice(i, 1);
          onEffectEnd(ef);
          changed = true;
          if (ef.kind === "chem")
            G.notify(ef.name + " has worn off.", { kind: "effect" });
        }
      }
    }
    // Passive regen from Talents (Second Wind, Sun Worshipper…)
    const d = recalc();
    if (d.M.hpRegen && P && P.alive && P.hp < P.maxHp)
      P.hp = Math.min(P.maxHp, P.hp + d.M.hpRegen * dt);
    if (changed) {
      dirty = true;
      G.events.emit("effectsChanged");
    }
  }
  // Tonic sway: while a Rally Tonic works the aim drifts in a slow, lopsided figure-eight (a patent medicine is mostly
  // alcohol). Applied as DELTAS to the player's yaw/pitch so it never accumulates; faded in over 0.6 s and out over the
  // last third of the effect, and only touched in state 'play' (dialogue / goggles / cutscenes keep their camera).
  const SWAY = { t: 0, yaw: 0, pitch: 0, amp: 0 };
  function updateSway(dt) {
    const P = G.player;
    if (!P || !(dt > 0)) return;
    let target = 0;
    if (P.alive !== false) {
      for (const ef of S.effects) {
        if (!ef.sway || !(ef.remaining > 0)) continue;
        const fin =
          ef.total > 0 ? Math.min(1, (ef.total - ef.remaining) / 0.6) : 1;
        const fout =
          ef.total > 0 ? Math.min(1, ef.remaining / (ef.total * 0.33)) : 1;
        target = Math.max(target, ef.sway * Math.min(fin, fout));
      }
    }
    SWAY.amp += (target - SWAY.amp) * Math.min(1, dt * 3);
    if (SWAY.amp < 0.002 && !target) SWAY.amp = 0;
    SWAY.t += dt;
    const ny =
      SWAY.amp * 0.045 * Math.sin(SWAY.t * 1.15) +
      SWAY.amp * 0.012 * Math.sin(SWAY.t * 3.1);
    const np = SWAY.amp * 0.022 * Math.sin(SWAY.t * 2.3 + 0.7);
    if (G.state !== "play" || P.camOverride) return;
    P.yaw += ny - SWAY.yaw;
    P.pitch = U.clamp(P.pitch + (np - SWAY.pitch), -1.5, 1.5);
    SWAY.yaw = ny;
    SWAY.pitch = np;
  }
  /** Current tonic sway amplitude 0..1 (HUD / tests). */
  function swayAmount() {
    return SWAY.amp;
  }
  function modsSummary(m) {
    if (!m) return "";
    const parts = [];
    const at = m.attrs;
    if (at)
      for (const k of ATTRS)
        if (at[k])
          parts.push(ATTR_INFO[k].short + " " + (at[k] > 0 ? "+" : "") + at[k]);
    const sk = normSkills(m.skills);
    if (sk)
      for (const k in sk)
        if (sk[k])
          parts.push(SKILL_INFO[k].name + " " + (sk[k] > 0 ? "+" : "") + sk[k]);
    if (m.dr) parts.push("DR " + (m.dr > 0 ? "+" : "") + Math.round(m.dr));
    if (m.radResist)
      parts.push(
        "Rad Resist " + (m.radResist > 0 ? "+" : "") + m.radResist + "%",
      );
    if (m.dmgMult)
      parts.push(
        "Damage " +
          (m.dmgMult > 0 ? "+" : "") +
          Math.round(m.dmgMult * 100) +
          "%",
      );
    if (m.critChance || m.crit)
      parts.push(
        "Crit " +
          ((m.crit || m.critChance) > 0 ? "+" : "") +
          (m.crit || m.critChance) +
          "%",
      );
    if (m.carry) parts.push("Carry " + (m.carry > 0 ? "+" : "") + m.carry);
    if (m.xpMult) parts.push("XP +" + Math.round(m.xpMult * 100) + "%");
    if (m.staminaRegenMult)
      parts.push(
        "Stamina Regen " +
          (m.staminaRegenMult > 0 ? "+" : "") +
          Math.round(m.staminaRegenMult * 100) +
          "%",
      );
    if (m.speedMult)
      parts.push(
        "Speed " +
          (m.speedMult > 0 ? "+" : "") +
          Math.round(m.speedMult * 100) +
          "%",
      );
    if (m.reloadMult)
      parts.push(
        "Reload " +
          (m.reloadMult < 0 ? "faster " : "slower ") +
          Math.abs(Math.round(m.reloadMult * 100)) +
          "%",
      );
    if (m.stealth) parts.push("Shade Field");
    return parts.join(", ");
  }
  /** Everything currently affecting the player, for the goggles STATUS → Effects list. */
  function activeEffects() {
    const out = [];
    for (const ef of S.effects)
      out.push({
        id: ef.id,
        name: ef.name,
        kind: ef.kind,
        remaining: Math.max(0, ef.remaining),
        total: ef.total,
        desc: ef.desc || modsSummary(ef.mods),
        mods: ef.mods,
      });
    const t = radTier();
    if (t > 0)
      out.push({
        id: "radiation",
        name: RAD_TIERS[t].name,
        kind: "radiation",
        remaining: 0,
        total: 0,
        desc: modsSummary({ attrs: RAD_TIERS[t].attrs }),
      });
    const actives = {};
    for (const ef of S.effects)
      if (ef.addictionId) actives[ef.addictionId] = true;
    for (const id in S.addictions) {
      const a = S.addictions[id];
      out.push({
        id: "addiction_" + id,
        name: a.name + (actives[id] ? "" : " (Withdrawal)"),
        kind: "addiction",
        remaining: 0,
        total: 0,
        desc: actives[id] ? "Satisfied, for now." : modsSummary(a.withdrawal),
      });
    }
    recalc();
    for (const l in D.crippled)
      out.push({
        id: "crippled_" + l,
        name: "Crippled " + LIMB_NAMES[l],
        kind: "limb",
        remaining: 0,
        total: 0,
        desc:
          l === "head"
            ? "SNS -2"
            : l === "torso"
              ? "Stamina Regen -30%"
              : /Leg/.test(l)
                ? "Movement speed reduced"
                : "Aim is unsteady",
      });
    if (S.needs && S.needs.on)
      for (const k of NEED_KEYS) {
        const t2 = needTier(k);
        if (t2 > 0)
          out.push({
            id: "need_" + k,
            name: NEEDS[k].tiers[t2].name,
            kind: "need",
            remaining: 0,
            total: 0,
            desc: modsSummary(NEEDS[k].tiers[t2].mods),
          });
      }
    if (isOverencumbered())
      out.push({
        id: "overencumbered",
        name: "Overencumbered",
        kind: "debuff",
        remaining: 0,
        total: 0,
        desc: "Cannot run or fast travel.",
      });
    return out;
  }

  // ------------------------------------------------------------------
  // Aid use (called by G.inventory.use for type 'aid')
  // ------------------------------------------------------------------
  function applyAid(def) {
    if (!def) return false;
    const ef = def.effects || {};
    const P = G.player;
    const d = recalc();
    const M = d.M;
    const tags = def.tags || [];
    const medical = tags.indexOf("medical") >= 0;
    const chem = tags.indexOf("chem") >= 0;
    const food = tags.indexOf("food") >= 0 || tags.indexOf("drink") >= 0;
    const hardcore = !!(S.needs && S.needs.on);
    if (ef.hp) {
      let hp = ef.hp;
      if (medical) hp *= (0.7 + d.skills.medicine / 100) * (1 + M.medMult);
      else if (food) hp *= 1 + d.skills.survival / 200 + M.foodHealMult;
      if (hardcore && medical && hp > 0)
        addEffect({
          id: "heal_" + def.id + "_" + ++effSeq,
          name: def.name,
          kind: "buff",
          duration: 6,
          tick: { hp: hp / 6 },
          stack: true,
        });
      else if (P && P.heal) P.heal(Math.round(hp));
    }
    if (ef.hpOverTime) {
      const amt =
          ef.hpOverTime[0] * (1 + d.skills.survival / 200 + M.foodHealMult),
        secs = Math.max(0.5, ef.hpOverTime[1]);
      addEffect({
        id: "heal_" + def.id + "_" + ++effSeq,
        name: def.name,
        kind: "food",
        duration: secs,
        tick: { hp: amt / secs },
        stack: true,
      });
    }
    // Medical heal over time (Rally Tonic): scaled by Medicine like an instant heal, mends limbs as it goes
    // (not in Hardcore: only a field surgery kit, a doctor or sleep mends limbs there) and sways the view while it works.
    if (ef.healOverTime || ef.limbsOverTime) {
      const tick = {};
      let secs = 0.5;
      if (ef.healOverTime) {
        const amt =
          ef.healOverTime[0] *
          (medical ? (0.7 + d.skills.medicine / 100) * (1 + M.medMult) : 1);
        secs = Math.max(secs, ef.healOverTime[1] || 0.5);
        tick.hp = amt / Math.max(0.5, ef.healOverTime[1] || 0.5);
      }
      if (ef.limbsOverTime && !hardcore) {
        const amt =
          ef.limbsOverTime[0] * (medical ? 0.7 + d.skills.medicine / 100 : 1);
        secs = Math.max(secs, ef.limbsOverTime[1] || 0.5);
        tick.limbs = amt / Math.max(0.5, ef.limbsOverTime[1] || 0.5);
      }
      addEffect({
        id: "heal_" + def.id + "_" + ++effSeq,
        name: def.name,
        kind: "buff",
        duration: secs,
        tick,
        stack: true,
        sway: ef.sway || 0,
        after: ef.after || null,
        desc:
          "Healing" +
          (tick.limbs ? " and mending limbs" : "") +
          " over " +
          Math.round(secs) +
          " s",
      });
    }
    if (ef.rads) {
      if (ef.rads > 0) addRadsDirect(ef.rads * (food ? 1 + M.foodRadMult : 1));
      else
        removeRads(
          -ef.rads *
            (medical
              ? (0.8 + d.skills.medicine / 250) * (1 + M.radMedMult)
              : 1),
        );
    }
    if (ef.radsOverTime) {
      const amt =
          ef.radsOverTime[0] *
          (medical ? (0.8 + d.skills.medicine / 250) * (1 + M.radMedMult) : 1),
        secs = Math.max(0.5, ef.radsOverTime[1]);
      addEffect({
        id: "rads_" + def.id,
        name: def.name,
        kind: "chem",
        duration: secs,
        tick: { rads: amt / secs },
      });
    }
    const stam = ef.stamina;
    if (stam && P)
      P.stamina = Math.min(
        (P.maxStamina || 100) + stam,
        (P.stamina || 0) + stam,
      );
    // Hardcore: only a field surgery kit, a doctor or a night's sleep mends crippled limbs
    if (ef.limbs && (!hardcore || def.id === "field_surgery_kit"))
      healLimbs(ef.limbs * (medical ? 0.7 + d.skills.medicine / 100 : 1));
    if (ef.cureAddiction) cureAddictions(true);
    if (ef.duration) {
      const mods = {};
      [
        "radResist",
        "dr",
        "dmgMult",
        "carry",
        "staminaRegenMult",
        "speedMult",
        "sneak",
        "xpMult",
        "reloadMult",
      ].forEach((k) => {
        if (ef[k]) mods[k] = ef[k];
      });
      if (medical && mods.radResist && M.radMedMult)
        mods.radResist = Math.round(mods.radResist * (1 + M.radMedMult));
      if (ef.critChance) mods.crit = ef.critChance;
      const at = ef.attrs;
      if (at) mods.attrs = Object.assign({}, at);
      if (ef.skills) mods.skills = normSkills(ef.skills);
      const dur = ef.duration * (chem ? 1 + M.chemDurationMult : 1);
      addEffect({
        id: def.id,
        name: def.name,
        kind: chem ? "chem" : food ? "food" : "buff",
        duration: dur,
        mods,
        desc: modsSummary(mods),
        addictionId: ef.addiction ? ef.addiction.id : null,
        after: ef.after || null,
        shade: !!(ef.shade || ef.stealth),
      });
    } else if (ef.after && !ef.healOverTime && !ef.limbsOverTime) {
      // over-time heals carry their comedown on the heal effect
      addEffect({
        id: def.id + "_after",
        name: ef.after.name,
        duration: ef.after.duration || 60,
        kind: "debuff",
        mods: { attrs: normAttrs(ef.after.attrs) || {} },
      });
    }
    if (
      ef.addiction &&
      !S.addictions[ef.addiction.id] &&
      !(ef.addiction.id === "alcohol" && M.hardDrinker)
    ) {
      const chance = ef.addiction.chance * Math.max(0, 1 + M.addictionMult);
      if (Math.random() < chance) {
        const w = ef.addiction.withdrawal || {};
        S.addictions[ef.addiction.id] = {
          name: ef.addiction.name,
          day: G.time.day,
          withdrawal: {
            attrs: normAttrs(w.attrs) || {},
            skills: normSkills(w.skills) || {},
          },
        };
        S.stats.timesAddicted++;
        G.notify(
          "You are hooked on " + ef.addiction.name.replace(/ Habit$/, "") + ".",
          { kind: "addiction" },
        );
        G.events.emit("addicted", ef.addiction.id);
      }
    }
    if (def.id === "rally_tonic" || def.id === "rally_tonic_extra")
      S.stats.tonicsUsed++;
    if (def.id === "prussian_blue") S.stats.prussianBlueUsed++;
    if (chem) S.stats.chemsTaken++;
    if (medical)
      practice(
        "medicine",
        ef.hp || ef.healOverTime || ef.radsOverTime ? 1.2 : 0.6,
        "aid",
      );
    else if (food) practice("survival", 0.3, "food");
    if (S.needs && S.needs.on) {
      const drink = tags.indexOf("drink") >= 0,
        eats = tags.indexOf("food") >= 0;
      const water = /water/.test(def.id);
      if (eats)
        S.needs.food = Math.max(
          0,
          S.needs.food -
            (ef.food !== undefined ? ef.food : 60 + (ef.hp || 0) * 2),
        );
      if (drink)
        S.needs.water = Math.max(
          0,
          S.needs.water -
            (ef.water !== undefined ? ef.water : water ? 150 : 50),
        );
      if (tags.indexOf("alcohol") >= 0)
        S.needs.water = Math.min(1000, S.needs.water + 10);
      if (def.id === "fizzo_blue" || tags.indexOf("caffeine") >= 0)
        S.needs.sleep = Math.max(0, S.needs.sleep - 40);
    }
    dirty = true;
    G.events.emit("effectsChanged");
    G.events.emit("aidUsed", def.id);
    return true;
  }
  function cureAddictions(silent) {
    const n = Object.keys(S.addictions).length;
    S.addictions = {};
    dirty = true;
    G.events.emit("effectsChanged");
    if (n && !silent)
      G.notify("Your cravings are gone.", { kind: "addiction" });
    else if (n) G.notify("You feel your cravings fade.", { kind: "addiction" });
    return n;
  }
  /** A habit lasts until cured (Clean Slate, a doctor). options.addictionsExpire lets them burn out after a week. */
  function updateAddictions() {
    if (!R.options.addictionsExpire) return;
    for (const id in S.addictions) {
      if (G.time.day - (S.addictions[id].day || 0) >= 7) {
        delete S.addictions[id];
        dirty = true;
        G.events.emit("effectsChanged");
        G.notify("You have kicked the habit.", { kind: "addiction" });
      }
    }
  }

  // ------------------------------------------------------------------
  // Limbs
  // ------------------------------------------------------------------
  const PART_MAP = {
    head: "head",
    torso: "torso",
    body: "torso",
    chest: "torso",
    leftArm: "leftArm",
    rightArm: "rightArm",
    leftLeg: "leftLeg",
    rightLeg: "rightLeg",
    left_arm: "leftArm",
    right_arm: "rightArm",
    left_leg: "leftLeg",
    right_leg: "rightLeg",
    arm: "rightArm",
    leg: "leftLeg",
    legs: "leftLeg",
    arms: "rightArm",
  };
  function damageLimb(part, amount) {
    const l = PART_MAP[part] || part;
    if (!S.limbs.hasOwnProperty(l) || amount <= 0) return;
    const before = S.limbs[l];
    if (before <= 0) return;
    S.limbs[l] = Math.max(0, before - amount);
    if (S.limbs[l] <= 0) {
      dirty = true;
      G.notify("Your " + LIMB_NAMES[l] + " has been crippled.", {
        kind: "limb",
        limb: l,
      });
      G.events.emit("limbCrippled", l);
      G.events.emit("effectsChanged");
    }
  }
  function healLimbs(amount) {
    let fixed = false;
    for (const l of LIMBS) {
      const was = S.limbs[l];
      S.limbs[l] = Math.min(
        100,
        S.limbs[l] + (amount === undefined ? 100 : amount),
      );
      if (was <= 0 && S.limbs[l] > 0) fixed = true;
    }
    if (fixed) {
      dirty = true;
      G.events.emit("effectsChanged");
    }
  }
  function limbCondition(l) {
    return l ? S.limbs[PART_MAP[l] || l] || 0 : Object.assign({}, S.limbs);
  }
  function isCrippled(l) {
    return (S.limbs[PART_MAP[l] || l] || 0) <= 0;
  }

  // ------------------------------------------------------------------
  // Damage mitigation (called by G.player.damage)
  // ------------------------------------------------------------------
  const DIFFICULTY = {
    very_easy: 0.5,
    easy: 0.75,
    normal: 1,
    hard: 1.5,
    very_hard: 2,
  };
  // Limb pool as a fraction of max HP (see mitigate)
  const LIMB_POOL = {
    head: 0.6,
    torso: 1.2,
    leftArm: 0.8,
    rightArm: 0.8,
    leftLeg: 0.85,
    rightLeg: 0.85,
  };
  function mitigate(amount, type, info) {
    info = info || {};
    const d = recalc();
    const M = d.M;
    let dmg = amount;
    if (type === "fall") {
      dmg *= 1 + M.limbDmgMult * 0.5;
      damageLimb("leftLeg", dmg * 1.6 * (1 + M.limbDmgMult));
      damageLimb("rightLeg", dmg * 1.6 * (1 + M.limbDmgMult));
      S.stats.damageTaken += dmg;
      return dmg;
    }
    const dr = getDR(type) / 100;
    const dt = type === "poison" ? 0 : getDT();
    dmg = Math.max(amount * 0.2, amount - dt) * (1 - dr);
    dmg *= DIFFICULTY[S.difficulty] || 1;
    // Lucky Break: now and then a hit only grazes you
    if (M.luckyBreak && type !== "rad" && Math.random() < 0.06 * M.luckyBreak) {
      dmg *= 0.5;
      G.notify("Lucky break!", { kind: "talent" });
    }
    try {
      if (!G.isStub("inventory") && G.inventory.wearArmor)
        G.inventory.wearArmor(amount);
    } catch (e) {
      /* ignore */
    }
    // Limb damage: each limb has its own pool sized from max HP; the mitigated damage reaches the limb.
    const hpMax = Math.max(60, maxHp());
    let part = info.part;
    if (!part || !PART_MAP[part]) {
      const r = Math.random();
      part =
        r < 0.45
          ? "torso"
          : r < 0.55
            ? "head"
            : r < 0.66
              ? "leftArm"
              : r < 0.77
                ? "rightArm"
                : r < 0.885
                  ? "leftLeg"
                  : "rightLeg";
    }
    const lm = 1 + M.limbDmgMult;
    if (type === "explosive") {
      for (const l of LIMBS)
        damageLimb(l, (dmg / (hpMax * LIMB_POOL[l])) * 100 * 0.3 * lm);
    } else if (type !== "rad" && type !== "poison") {
      const l = PART_MAP[part];
      damageLimb(l, (dmg / (hpMax * LIMB_POOL[l])) * 100 * lm);
    }
    S.stats.damageTaken += dmg;
    return dmg;
  }

  // ------------------------------------------------------------------
  // Barter (Trade + Presence)
  // ------------------------------------------------------------------
  function itemValue(def, cond) {
    if (typeof def === "string") def = G.items.get(def);
    if (!def) return 0;
    let v = def.value || 0;
    if (def.hasCondition && cond !== undefined && cond !== null)
      v *= 0.15 + 0.85 * Math.pow(U.clamp(cond, 0, 1), 1.5);
    return v;
  }
  /** 0..1 haggling factor: Trade skill plus a Presence bonus. */
  function barterFactor() {
    const d = recalc();
    return U.clamp((d.skills.trade + (d.attrs.presence - 5) * 3) / 100, 0, 1);
  }
  /**
   * A vendor's price attitude. Quests/POIs use three knobs on actor.merchant (or a bare object):
   *   markup     multiplies what the player PAYS (membership discounts: 0.85–0.93)
   *   priceMult  the vendor's overall price level (a posh restaurant 1.4, a betrayed bartender 2):
   *              buy × priceMult, and when > 1 the vendor also pays less (sell ÷ priceMult)
   *   sellMult   multiplies what the vendor PAYS the player (a fence/pawn shop 1.2)
   */
  function vendorAttitude(merchant) {
    const m = merchant ? merchant.merchant || merchant : null;
    const num = (v) => (typeof v === "number" && isFinite(v) && v > 0 ? v : 1);
    if (!m || typeof m !== "object") return { buy: 1, sell: 1 };
    const pm = num(m.priceMult);
    return {
      buy: num(m.markup) * pm,
      sell: num(m.sellMult) / (pm > 1 ? pm : 1),
    };
  }
  /** Price the player pays a merchant. merchant: actor | {markup, priceMult} | undefined. cond: optional condition. */
  function priceBuy(def, merchant, cond) {
    if (typeof def === "string") def = G.items.get(def);
    if (!def) return 0;
    if (def.id === "scrip") return 1;
    const t = barterFactor();
    const mult =
      (1.5 - 0.45 * t) *
      (1 + recalc().M.barterMult) *
      vendorAttitude(merchant).buy;
    const v = itemValue(def, cond);
    return v <= 0 ? 0 : Math.max(1, Math.round(v * mult));
  }
  /** Price a merchant pays the player (always below what they'd charge for it). */
  function priceSell(def, merchant, cond) {
    if (typeof def === "string") def = G.items.get(def);
    if (!def) return 0;
    if (def.id === "scrip") return 1;
    const t = barterFactor();
    const mult =
      (0.45 + 0.4 * t) *
      (1 + recalc().M.sellMult) *
      vendorAttitude(merchant).sell;
    const v = itemValue(def, cond);
    if (v <= 0) return 0;
    return Math.max(
      1,
      Math.min(Math.round(v * mult), priceBuy(def, merchant, cond) - 1 || 1),
    );
  }

  // ------------------------------------------------------------------
  // Skill / attribute checks (dialogue, scripted events)
  // ------------------------------------------------------------------
  /**
   * check('persuasion', 50) | check('presence', 6) | check({skill|attr, value}, {random}).
   * random:true gives a percentage roll for Persuasion/Trade (have/need), else a plain threshold.
   * Returns {success, have, need, chance, label, kind:'skill'|'attr', id}.
   */
  function check(chk, value, opts) {
    if (typeof chk === "string") chk = { id: chk, value };
    else opts = value;
    opts = opts || {};
    if (!chk) return { success: true, have: 0, need: 0, chance: 1, label: "" };
    const d = recalc();
    const raw = chk.attr || chk.id || chk.skill;
    const need = chk.value || 0;
    const aid = attrId(raw);
    if ((chk.attr || !chk.skill) && ATTR_INFO[aid]) {
      const have = d.attrs[aid] || 0;
      return {
        success: have >= need,
        have,
        need,
        chance: have >= need ? 1 : 0,
        label: "[" + ATTR_INFO[aid].name + " " + need + "]",
        kind: "attr",
        id: aid,
      };
    }
    const sk = skillId(raw);
    const have = d.skills[sk] || 0;
    const name = SKILL_INFO[sk] ? SKILL_INFO[sk].name : sk;
    if (opts.random && (sk === "persuasion" || sk === "trade")) {
      const chance = U.clamp(need > 0 ? have / need : 1, 0.02, 1);
      const success = Math.random() < chance;
      return {
        success,
        have,
        need,
        chance,
        label: "[" + name + " " + Math.round(chance * 100) + "%]",
        kind: "skill",
        id: sk,
      };
    }
    return {
      success: have >= need,
      have,
      need,
      chance: have >= need ? 1 : 0,
      label: "[" + name + " " + need + "]",
      kind: "skill",
      id: sk,
    };
  }

  // ------------------------------------------------------------------
  // Sleep & doctors
  // ------------------------------------------------------------------
  function sleep(hours, opts) {
    opts = opts || {};
    hours = U.clamp(hours || 8, 1, 24);
    const P = G.player;
    passHours(hours, true);
    if (P) {
      P.hp = P.maxHp = maxHp();
      P.stamina = P.maxStamina = maxStamina();
    }
    healLimbs(100);
    if ((opts.owned !== false || recalc().M.deepSleep) && hours >= 6) {
      addEffect({
        id: "well_rested",
        name: "Well Rested",
        kind: "rest",
        duration: 16 * 60,
        mods: { xpMult: 0.1 },
        desc: "XP +10%",
      });
      G.notify("You feel well rested.", { kind: "effect" });
    }
    G.events.emit("slept", hours);
    return true;
  }
  /**
   * Pass game time (sleeping / waiting): advances the clock through G.atmos.advanceHours and
   * fast-forwards chem/food/buff timers and habits by the equivalent world-seconds.
   */
  function passHours(hours, sleeping) {
    hours = Math.max(0, Number(hours) || 0);
    if (!hours) return;
    growNeeds(hours, !!sleeping);
    let viaAtmos = false;
    try {
      if (!G.isStub("atmos") && typeof G.atmos.advanceHours === "function") {
        G.atmos.advanceHours(hours);
        viaAtmos = true;
      }
    } catch (e) {
      G.reportError("rpg:advanceHours", e);
    }
    if (!viaAtmos) {
      let h = (G.time.hour || 0) + hours;
      while (h >= 24) {
        h -= 24;
        G.time.day = (G.time.day || 1) + 1;
        G.events.emit("dayChanged", G.time.day);
      }
      G.time.hour = h;
      G.events.emit("hourChanged", h);
    }
    const mps = (G.time && G.time.minutesPerSecond) || 0.5;
    updateEffects((hours * 60) / mps);
    checkRadTier();
    updateAddictions();
    dirty = true;
  }
  // ------------------------------------------------------------------
  // Hardcore needs
  // ------------------------------------------------------------------
  const NEED_KEYS = ["food", "water", "sleep"];
  const NEEDS = {
    food: {
      perHour: 12,
      tiers: [
        null,
        { at: 200, name: "Hungry", mods: { attrs: { reflex: -1 } } },
        {
          at: 400,
          name: "Famished",
          mods: { attrs: { reflex: -2, brawn: -1 } },
        },
        {
          at: 600,
          name: "Starving",
          mods: { attrs: { reflex: -2, brawn: -2, grit: -1 } },
        },
        {
          at: 800,
          name: "Wasting Away",
          mods: { attrs: { reflex: -3, brawn: -3, grit: -2 } },
        },
      ],
    },
    water: {
      perHour: 20,
      tiers: [
        null,
        { at: 200, name: "Thirsty", mods: { attrs: { senses: -1 } } },
        { at: 400, name: "Parched", mods: { attrs: { senses: -2, grit: -1 } } },
        {
          at: 600,
          name: "Dehydrated",
          mods: { attrs: { senses: -2, grit: -2, brawn: -1 } },
        },
        {
          at: 800,
          name: "Delirious with Thirst",
          mods: { attrs: { senses: -3, grit: -3, brawn: -2 } },
        },
      ],
    },
    sleep: {
      perHour: 16,
      tiers: [
        null,
        { at: 200, name: "Drowsy", mods: { attrs: { wits: -1 } } },
        {
          at: 400,
          name: "Bleary",
          mods: { attrs: { wits: -2, presence: -1 } },
        },
        {
          at: 600,
          name: "Exhausted",
          mods: { attrs: { wits: -2, presence: -2, reflex: -1 } },
        },
        {
          at: 800,
          name: "Sleepwalking",
          mods: { attrs: { wits: -3, presence: -3, reflex: -2 } },
        },
      ],
    },
  };
  function needTier(k) {
    const v = S.needs[k] || 0;
    const T = NEEDS[k].tiers;
    let t = 0;
    for (let i = 1; i < T.length; i++) if (v >= T[i].at) t = i;
    return t;
  }
  const lastNeedTier = { food: 0, water: 0, sleep: 0 };
  function growNeeds(hours, sleeping) {
    const N = S.needs;
    if (!N || !N.on || !(hours > 0)) return;
    N.food = Math.min(1000, N.food + NEEDS.food.perHour * hours);
    N.water = Math.min(
      1000,
      N.water + NEEDS.water.perHour * hours * (sleeping ? 0.6 : 1),
    );
    if (sleeping) N.sleep = Math.max(0, N.sleep - hours * 125);
    else N.sleep = Math.min(1000, N.sleep + NEEDS.sleep.perHour * hours);
    let changed = false;
    for (const k of NEED_KEYS) {
      const t = needTier(k);
      if (t !== lastNeedTier[k]) {
        if (t > lastNeedTier[k])
          G.notify("You are " + NEEDS[k].tiers[t].name.toLowerCase() + ".", {
            kind: "need",
            need: k,
            tier: t,
          });
        lastNeedTier[k] = t;
        changed = true;
      }
      if (N[k] >= 1000 && G.player && G.player.alive && G.player.die)
        G.player.die({
          type:
            k === "food"
              ? "starvation"
              : k === "water"
                ? "dehydration"
                : "exhaustion",
        });
    }
    if (changed) {
      dirty = true;
      G.events.emit("effectsChanged");
    }
  }
  function updateNeeds(dt) {
    if (!S.needs || !S.needs.on || !(dt > 0)) return;
    growNeeds((dt * ((G.time && G.time.minutesPerSecond) || 0.5)) / 60, false);
  }
  function setHardcore(on) {
    S.needs = S.needs || { on: false, food: 0, water: 0, sleep: 0 };
    S.needs.on = !!on;
    dirty = true;
    G.events.emit("effectsChanged");
    try {
      if (G.inventory && G.inventory._invalidateWeight)
        G.inventory._invalidateWeight();
    } catch (e) {
      /* ignore */
    }
    return S.needs.on;
  }

  /** Doctor services. what: {hp, rads, limbs, addictions} (all true by default). */
  function doctorHeal(what) {
    what = what || { hp: true, rads: true, limbs: true, addictions: true };
    const P = G.player;
    if (what.hp && P) P.hp = P.maxHp;
    if (what.rads && P) {
      P.rads = 0;
      G.events.emit("radsChanged", 0, 0);
    }
    if (what.limbs) healLimbs(100);
    if (what.addictions) cureAddictions(false);
    dirty = true;
    G.events.emit("effectsChanged");
  }

  // ------------------------------------------------------------------
  // Hero profile (fixed protagonist; no allocation screen)
  // ------------------------------------------------------------------
  function setAttrs(obj) {
    const a = normAttrs(obj);
    if (!a) return;
    for (const k in a)
      S.attrs[k] = U.clamp(
        Math.round(obj[k] !== undefined ? obj[k] : a[k]),
        1,
        10,
      );
    dirty = true;
    G.events.emit("attrsChanged");
  }

  // ------------------------------------------------------------------
  // Medallions & manuals
  // ------------------------------------------------------------------
  /**
   * A World's Fair medallion was found. Medallions grant nothing by themselves: the set is a collection the
   * Fair's last curator (src/quests/55_medallions.js) pays for. S.medallions remembers every one ever found
   * (so a medallion handed over is never offered twice); the quest keeps the hand-in count.
   */
  function collectMedallion(def) {
    if (typeof def === "string")
      def = G.items.get(def) || G.items.get(G.items.medallionId(def));
    if (!def || !def.medallion) return false;
    S.medallions[def.id] = true;
    S.stats.medallions = Object.keys(S.medallions).length;
    dirty = true;
    G.events.emit("medallionFound", def.id, S.stats.medallions);
    G.notify(def.name + " found (" + S.stats.medallions + "/20).", {
      kind: "medallion",
      icon: "medallion",
    });
    return true;
  }
  function hasMedallion(id) {
    const d = G.items.get(id);
    return !!(d && S.medallions[d.id]);
  }
  /** Skill manual: a permanent +2 (+1 more and 75 XP with Bookworm). */
  function readBook(def) {
    if (!def || !def.book) return false;
    const bw = recalc().M.bookBonus || 0;
    boostSkill(def.book.skill, 2 + bw, "book");
    S.stats.booksRead++;
    if (bw) addXP(75, "Bookworm");
    return true;
  }

  // ------------------------------------------------------------------
  // Save / reset
  // ------------------------------------------------------------------
  function serialize() {
    return {
      v: 2,
      attrs: S.attrs,
      practice: S.practice,
      bookPts: S.bookPts,
      medallions: S.medallions,
      level: S.level,
      xp: S.xp,
      attrPoints: S.attrPoints,
      talentPicks: S.talentPicks,
      talents: S.talents,
      talentChoices: S.talentChoices,
      standing: S.standing,
      effects: S.effects,
      addictions: S.addictions,
      limbs: S.limbs,
      radTier: S.radTier,
      difficulty: S.difficulty,
      stats: S.stats,
      needs: S.needs,
    };
  }
  function deserialize(d) {
    S = freshState();
    SWAY.yaw = SWAY.pitch = SWAY.amp = 0;
    if (!d) return;
    for (const k in d)
      if (d[k] !== undefined && S.hasOwnProperty(k)) S[k] = d[k];
    if (d.v !== 2) {
      // an older save: carry the level / XP / effects over, rebuild the character sheet
      S.attrPoints = Math.floor((S.level || 1) / 2);
      S.talentPicks = Math.max(0, (S.level || 1) - 1);
      S.talents = {};
      S.talentChoices = {};
    }
    const f = freshState();
    for (const k of ATTRS)
      if (typeof S.attrs[k] !== "number") S.attrs[k] = f.attrs[k];
    for (const k of SKILLS) {
      if (S.practice[k] === undefined) S.practice[k] = 0;
      if (S.bookPts[k] === undefined) S.bookPts[k] = 0;
    }
    for (const l of LIMBS) if (S.limbs[l] === undefined) S.limbs[l] = 100;
    S.needs = Object.assign(f.needs, S.needs || {});
    for (const k of NEED_KEYS) lastNeedTier[k] = S.needs.on ? needTier(k) : 0;
    S.stats = Object.assign(f.stats, S.stats || {});
    // stats from before the medicine rename / magazine removal
    if (S.stats.medJetsUsed) S.stats.tonicsUsed += S.stats.medJetsUsed;
    if (S.stats.purgeUsed) S.stats.prussianBlueUsed += S.stats.purgeUsed;
    delete S.stats.medJetsUsed;
    delete S.stats.purgeUsed;
    delete S.stats.magazinesRead;
    S.medallions = S.medallions || {};
    dirty = true;
  }
  function reset() {
    S = freshState();
    dirty = true;
    for (const k of NEED_KEYS) lastNeedTier[k] = 0;
    SWAY.yaw = SWAY.pitch = SWAY.amp = 0;
  }

  // ------------------------------------------------------------------
  // Public namespace
  // ------------------------------------------------------------------
  const R = {
    ATTRS,
    ATTR_INFO,
    SKILLS,
    SKILL_INFO,
    LIMBS,
    LIMB_NAMES,
    LEVEL_CAP,
    RAD_TIERS,
    KILL_XP,
    INNOCENT_FACTIONS,
    STANDING_TIERS,
    // attributes
    attr: (k) => recalc().attrs[attrId(k)] || 0,
    attrBase: (k) => (k ? S.attrs[attrId(k)] : Object.assign({}, S.attrs)),
    attrName: (k) => (ATTR_INFO[attrId(k)] ? ATTR_INFO[attrId(k)].name : k),
    setAttrs,
    attrPoints: () => S.attrPoints,
    spendAttrPoint,
    // skills
    skill: (id) => recalc().skills[skillId(id)] || 0,
    skillBase,
    skillName: (id) =>
      SKILL_INFO[skillId(id)] ? SKILL_INFO[skillId(id)].name : id,
    skillProgress,
    practice,
    useSkill: practice,
    boostSkill,
    // XP / level
    xpForLevel,
    addXP,
    xpToNext: () => (S.level >= LEVEL_CAP ? 0 : xpForLevel(S.level + 1) - S.xp),
    levelProgress: () =>
      S.level >= LEVEL_CAP
        ? 1
        : (S.xp - xpForLevel(S.level)) /
          (xpForLevel(S.level + 1) - xpForLevel(S.level)),
    getLevel: () => S.level,
    getXP: () => S.xp,
    // talents
    talents: TALENTS,
    defineTalent,
    talentDef: (id) => TALENT_MAP.get(talentKey(id)) || null,
    talentName,
    talentDesc,
    talentRank,
    hasTalent,
    talentsAvailable,
    talentsEligible,
    talentList,
    takeTalent,
    grantTalent,
    playerTalents,
    talentEligibility,
    talentPoints: () => S.talentPicks,
    declareHook,
    hasHook: (n) => !!HOOKS[n],
    // derived
    maxHp,
    maxStamina,
    staminaRegen,
    carryWeight,
    critChance,
    critDamageMult,
    speedMult,
    radResist,
    getDR,
    getDT,
    isOverencumbered,
    inventoryWeight,
    isStealthed,
    sneakBonus,
    sneakAttackMult,
    lootScripMult,
    lootAmmoMult,
    wearingExoRig,
    reloadMult,
    recoilMult,
    damageMult,
    skillDamageMult,
    talentDamageMult,
    meleeDamageBonus,
    spreadMult,
    accuracyMult: spreadMult,
    isOneHanded,
    weaponSkill,
    combatMods,
    classifyTarget,
    targetDamageBonus,
    /** Options (not saved): addictionsExpire (habits burn out after 7 days), levelUpHeal. */
    options: { addictionsExpire: false, levelUpHeal: true },
    // standing
    addStanding,
    standingTitle,
    standingLabel,
    standingTier,
    getStanding: () => S.standing,
    // effects / radiation / limbs
    addEffect,
    removeEffect,
    activeEffects,
    applyAid,
    cureAddictions,
    modsSummary,
    radTier,
    radSicknessName: () => RAD_TIERS[radTier()].name,
    addRadsDirect,
    removeRads,
    damageLimb,
    healLimbs,
    limbCondition,
    isCrippled,
    cureLimbs: () => healLimbs(100),
    mitigate,
    // barter / checks / services
    itemValue,
    priceBuy,
    priceSell,
    barterFactor,
    vendorAttitude,
    check,
    sleep,
    doctorHeal,
    wait: passHours,
    passHours,
    collectMedallion,
    hasMedallion,
    readBook,
    /** Generic modifier query, e.g. G.rpg.mod('animalFriend'), mod('lightStep'), mod('silentRun'). */
    mod: (name) => recalc().M[name] || 0,
    setDifficulty: (d) => {
      if (DIFFICULTY[d]) S.difficulty = d;
    },
    getDifficulty: () => S.difficulty,
    stat: (k) => S.stats[k],
    stats: () => S.stats,
    bumpStat: (k, n) => {
      S.stats[k] = (S.stats[k] || 0) + (n === undefined ? 1 : n);
    },
    setHardcore,
    isHardcore: () => !!(S.needs && S.needs.on),
    needs: () => Object.assign({}, S.needs),
    needTier,
    // internals (for the rest of the rpg module)
    _recalc: recalc,
    _dirty: markDirty,
    _state: () => S,
    _serialize: serialize,
    _deserialize: deserialize,
    _reset: reset,
    _updateEffects: updateEffects,
    _updateSway: updateSway,
    swayAmount,
    _checkRadTier: checkRadTier,
    _updateAddictions: updateAddictions,
    _checkLevelUp: checkLevelUp,
    _onActorDamaged: onActorDamaged,
    _updateNeeds: updateNeeds,
  };
  // Live read-only properties
  Object.defineProperties(R, {
    level: { get: () => S.level, enumerable: true },
    xp: { get: () => S.xp, enumerable: true },
    standing: { get: () => S.standing, enumerable: true },
    attrs: { get: () => Object.assign({}, recalc().attrs), enumerable: true },
    attributes: {
      get: () => Object.assign({}, recalc().attrs),
      enumerable: false,
    },
    skills: { get: () => Object.assign({}, recalc().skills), enumerable: true },
    effects: { get: () => S.effects, enumerable: true },
    addictions: {
      get: () => Object.assign({}, S.addictions),
      enumerable: true,
    },
    limbs: { get: () => Object.assign({}, S.limbs), enumerable: true },
    difficulty: { get: () => S.difficulty, enumerable: true },
  });

  G.rpg = R;
})();
