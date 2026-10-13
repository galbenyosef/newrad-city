// play-inline-511 01 — info
// Lines 16-355 of readable/play-inline-511.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const C = G.__cmb;
  const CB = G.combat;
  const U = G.util;
  const now = () => G.time.elapsed;

  const _o = new THREE.Vector3(),
    _d = new THREE.Vector3(),
    _p = new THREE.Vector3(),
    _q = new THREE.Vector3(),
    _e = new THREE.Vector3(),
    _r = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);
  const GORE_COLOR = {
    red: 0x7a0808,
    green: 0x4f8a14,
    violet: 0x4a1a4a,
    blue: 0x1e3c86,
    oil: 0x141414,
  };
  /** Blood kind for G.fx.blood (string keys: red, green, oil). Brutes bleed dark violet (drawn as red). */
  const goreKey = (a) => a.gore || "red";
  const bloodDecal = (a) =>
    a.gore === "green"
      ? "blood_green"
      : a.gore === "oil" || a.gore === "blue"
        ? "oil"
        : "blood";
  C.goreKey = goreKey;

  // ------------------------------------------------------------------
  // Faction relations
  // ------------------------------------------------------------------
  C.relOverride = {}; // 'a|b' → relation (saved)
  /** relation(a,b) → 'ally'|'neutral'|'hostile'. Accepts faction ids or actors ('player' ok). */
  CB.relation = function (a, b) {
    const fa = typeof a === "string" ? a : (a && a.faction) || "player";
    const fb = typeof b === "string" ? b : (b && b.faction) || "player";
    const k = fa + "|" + fb;
    if (C.relOverride[k]) return C.relOverride[k];
    if (C.DEFAULT_REL[k]) return C.DEFAULT_REL[k];
    if (fa === fb) return "ally";
    // Maniacs attack anything that isn't one of them, quest-made factions included
    return fa === C.MANIAC_FACTION || fb === C.MANIAC_FACTION
      ? "hostile"
      : "neutral";
  };
  /** Change a relation (symmetric). Quests use this (e.g. join the Covenant → Continuity hostile). */
  CB.setRelation = function (a, b, rel) {
    C.relOverride[a + "|" + b] = rel;
    C.relOverride[b + "|" + a] = rel;
    for (const act of C.list)
      if (!act.dead && act.target === "player" && !act.hostile())
        C.leaveCombat(act, "idle");
    G.events.emit("relationChanged", a, b, rel);
  };
  CB.resetRelations = function () {
    C.relOverride = {};
  };
  CB.factions = () => C.FACTIONS.slice();

  // ------------------------------------------------------------------
  // Ray vs capsule tests
  // ------------------------------------------------------------------
  /** Closest approach between ray (o + d*s, s∈[0,L]) and segment A-B. Returns [s, dist2]. */
  function raySeg(o, d, L, A, B) {
    const ex = B.x - A.x,
      ey = B.y - A.y,
      ez = B.z - A.z;
    const rx = o.x - A.x,
      ry = o.y - A.y,
      rz = o.z - A.z;
    const b = d.x * ex + d.y * ey + d.z * ez,
      c = d.x * rx + d.y * ry + d.z * rz;
    const e = ex * ex + ey * ey + ez * ez,
      f = ex * rx + ey * ry + ez * rz;
    let s, t;
    if (e < 1e-9) {
      t = 0;
      s = C.clamp(-c, 0, L);
    } else {
      const denom = e - b * b;
      s = denom > 1e-9 ? C.clamp((b * f - c * e) / denom, 0, L) : 0;
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = C.clamp(-c, 0, L);
      } else if (t > 1) {
        t = 1;
        s = C.clamp(b - c, 0, L);
      }
    }
    const px = o.x + d.x * s - (A.x + ex * t),
      py = o.y + d.y * s - (A.y + ey * t),
      pz = o.z + d.z * s - (A.z + ez * t);
    return [s, px * px + py * py + pz * pz];
  }
  C.raySeg = raySeg;

  /**
   * Ray vs every actor's part capsules. opts: {exclude:actor, includeDead=true, aliveOnly}
   * → {actor, hp (hit part), key, t} nearest, or null.
   */
  C.rayActors = function (o, d, L, opts) {
    opts = opts || {};
    let best = null,
      bestT = L;
    for (const a of C.list) {
      if (!a.inScene || a === opts.exclude || a.burrowed || a.disintegrated)
        continue;
      if (a.dead && opts.aliveOnly) continue;
      if (opts.skip && opts.skip(a)) continue;
      // broad phase: bounding sphere
      const cy = a.pos.y + (a.dead ? 0.3 : a.height * 0.5);
      const br =
        (a.dead
          ? Math.max(a.height * 0.6, 0.6)
          : Math.max(a.height * 0.6, a.radius + 0.3)) + 0.4;
      const tx = a.pos.x - o.x,
        ty = cy - o.y,
        tz = a.pos.z - o.z;
      const proj = tx * d.x + ty * d.y + tz * d.z;
      if (proj < -br || proj > bestT + br) continue;
      const cx = tx - d.x * proj,
        cyy = ty - d.y * proj,
        cz = tz - d.z * proj;
      if (cx * cx + cyy * cyy + cz * cz > br * br) continue;
      // narrow phase: part capsules
      const parts = C.updateHitParts(a);
      if (!a.char.placeholder && typeof a.char.raycast === "function") {
        // G.chars skinned rig: per-bone capsules
        let r = null,
          bodyHit = false;
        try {
          r = a.char.raycast(o, d, bestT);
        } catch (e) {
          r = null;
        }
        if (r && r.dist < bestT) {
          const hp =
            parts.find((p) => p.key === r.part) ||
            parts.find((p) => p.key === "torso") ||
            parts[0];
          if (hp) {
            bestT = r.dist;
            best = { actor: a, hp, key: hp.key, t: r.dist };
            bodyHit = true;
          }
        }
        // The held gun (virtual 'weapon' part) only takes the bullet when the shot misses the body —
        // i.e. you aimed at the gun sticking out. Otherwise a
        // raised rifle in front of the chest soaked up most torso shots for 0 damage (integration fix).
        if (!a.dead && !opts.noVirtual && (!bodyHit || opts.preferVirtual)) {
          for (const hp of parts) {
            if (!hp.virtual) continue;
            const res = raySeg(o, d, bestT, hp.wa, hp.wb);
            if (res[1] <= hp.r * hp.r) {
              const t = Math.max(
                0,
                res[0] - Math.sqrt(Math.max(0, hp.r * hp.r - res[1])),
              );
              if (t < bestT) {
                bestT = t;
                best = { actor: a, hp, key: hp.key, t };
              }
            }
          }
        }
        continue;
      }
      for (const hp of parts) {
        if (hp.virtual && (a.dead || opts.noVirtual)) continue;
        const res = raySeg(o, d, L, hp.wa, hp.wb);
        const r = hp.r;
        if (res[1] > r * r) continue;
        const t = Math.max(0, res[0] - Math.sqrt(Math.max(0, r * r - res[1])));
        if (t < bestT) {
          bestT = t;
          best = { actor: a, hp, key: hp.key, t };
        }
      }
    }
    return best;
  };
  /** Ray vs player capsule → {t, part} or null. */
  C.rayPlayer = function (o, d, L) {
    const P = G.player;
    if (!P.alive) return null;
    const top = P.pos.y + (P.sneaking ? 1.15 : 1.72);
    _p.set(P.pos.x, P.pos.y + 0.3, P.pos.z);
    _q.set(P.pos.x, top - 0.25, P.pos.z);
    const r = 0.36;
    const res = raySeg(o, d, L, _p, _q);
    if (res[1] > r * r) return null;
    const t = Math.max(0, res[0] - Math.sqrt(Math.max(0, r * r - res[1])));
    const hy = o.y + d.y * t;
    const part =
      hy > top - 0.3
        ? "head"
        : hy < P.pos.y + (P.sneaking ? 0.5 : 0.85)
          ? Math.random() < 0.5
            ? "leftLeg"
            : "rightLeg"
          : Math.random() < 0.8
            ? "torso"
            : Math.random() < 0.5
              ? "leftArm"
              : "rightArm";
    return { t, part };
  };

  // ------------------------------------------------------------------
  // Player damage math
  // ------------------------------------------------------------------
  function weaponSkillId(info) {
    const s = info && info.skill;
    if (s === "firearms" || s === "explosives" || s === "melee") return s;
    return "firearms";
  }
  function currentCondition(wid) {
    if (G.isStub("weapons") || typeof G.weapons.current !== "function")
      return 1;
    try {
      const c = G.weapons.current();
      if (!c || c.id !== wid || typeof c.condition !== "number") return 1;
      return c.condition > 1.001 ? c.condition / 100 : c.condition;
    } catch (e) {
      return 1;
    }
  }
  /** Item def for a weapon info (falls back to a bare weapon block). */
  function weaponDefOf(info) {
    let def = null;
    try {
      def = info && info.id && !G.isStub("items") ? G.items.get(info.id) : null;
    } catch (e) {
      def = null;
    }
    return (
      def || {
        id: info && info.id,
        weapon: {
          skill: weaponSkillId(info),
          melee: !!(info && info.melee),
          damageType: info && info.damageType,
          unarmed: !!(info && info.unarmed),
        },
      }
    );
  }
  /** Player crit chance in [0,1] for weapon info (rpg: Senses + Talents, in percent). */
  C.playerCritChance = function (info) {
    let pct = null;
    if (!G.isStub("rpg") && typeof G.rpg.critChance === "function") {
      try {
        pct = G.rpg.critChance(weaponDefOf(info));
      } catch (e) {
        pct = null;
      }
      if (typeof pct !== "number" || !isFinite(pct)) pct = null;
    }
    if (pct === null) pct = 2 + C.attr("senses", 5) * 0.8;
    return C.clamp(
      (pct / 100) * (info && info.critChance ? info.critChance : 1),
      0,
      0.95,
    );
  };
  /** Player critical-damage multiplier vs a target (rpg Talents: Executioner, Trapper, Shadow Step on sneak crits). */
  C.playerCritDamageMult = function (a, sneak) {
    if (G.isStub("rpg") || typeof G.rpg.critDamageMult !== "function") return 1;
    try {
      const m = G.rpg.critDamageMult(a, { sneak: !!sneak });
      return typeof m === "number" && isFinite(m) ? m : 1;
    } catch (e) {
      return 1;
    }
  };
  /** Is this target unaware of the player (sneak attack crit)? */
  C.isUnaware = function (a) {
    if (!a || a.dead || !G.player.sneaking) return false;
    if (a.state === "combat" && a.target === "player") return false;
    return a.awareness < 0.95 || !a.isEnemy("player");
  };
  /**
   * Player hit damage: raw weapon damage × rpg's multiplier (skill scaling 0.6 + skill/250, Talents, chems and
   * per-target bonuses) × weapon condition, plus the flat melee bonus (Brawn).
   */
  function playerDamage(base, info, a, opts) {
    const wdef = weaponDefOf(info);
    let dmg = base,
      scaled = false;
    if (!G.isStub("rpg") && typeof G.rpg.damageMult === "function") {
      try {
        const m = G.rpg.damageMult(wdef, a || null);
        if (typeof m === "number" && isFinite(m)) {
          dmg *= m;
          scaled = true;
        }
      } catch (e) {
        /* ignore */
      }
    }
    if (!scaled) dmg *= 0.75 + (0.5 * C.skill(weaponSkillId(info), 25)) / 100;
    if (opts && typeof opts.condition === "number")
      dmg *=
        0.6 +
        0.4 * (opts.condition > 1.001 ? opts.condition / 100 : opts.condition);
    else if (info && info.id) dmg *= 0.6 + 0.4 * currentCondition(info.id);
    if (info && info.melee) {
      let mb = null;
      try {
        if (!G.isStub("rpg") && typeof G.rpg.meleeDamageBonus === "function")
          mb = G.rpg.meleeDamageBonus(wdef);
      } catch (e) {
        mb = null;
      }
      dmg +=
        typeof mb === "number" && isFinite(mb) ? mb : C.attr("brawn", 5) * 0.35;
    }
    return dmg;
  }
  C.playerDamage = playerDamage;

  /** Normalise a damage source to 'player' | Actor | null (props, traps, 'prop' strings → null). */
  C.normSource = function (s) {
    if (s === "player" || s === G.player) return "player";
    if (s && typeof s === "object" && s instanceof C.Actor) return s;
    return null;
  };

  // ------------------------------------------------------------------
  // Damage application
  // ------------------------------------------------------------------
  /**
   * Apply damage to an actor. info: {type, source:'player'|actor, part, crit, sneak, weaponId, dir, point,
   * explosion, raw (skip DR), silent}. Returns final damage.
   */
