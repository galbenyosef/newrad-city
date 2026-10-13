// play-inline-476 05 — sway
// Lines 1344-1554 of readable/play-inline-476.pretty.js (statement-aligned).
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
