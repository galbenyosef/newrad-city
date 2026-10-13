// play-inline-476 07 — def
// Lines 1867-2179 of readable/play-inline-476.pretty.js (statement-aligned).
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
