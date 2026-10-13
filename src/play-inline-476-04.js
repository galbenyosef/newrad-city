// play-inline-476 04 — def
// Lines 1029-1343 of readable/play-inline-476.pretty.js (statement-aligned).
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
