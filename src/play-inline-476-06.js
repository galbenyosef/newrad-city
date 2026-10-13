// play-inline-476 06 — def
// Lines 1555-1866 of readable/play-inline-476.pretty.js (statement-aligned).
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
