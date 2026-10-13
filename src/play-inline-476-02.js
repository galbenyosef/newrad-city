// play-inline-476 02 — def
// Lines 367-704 of readable/play-inline-476.pretty.js (statement-aligned).
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
