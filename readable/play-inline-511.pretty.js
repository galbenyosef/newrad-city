/* src/combat/30_combat.js */
/* =====================================================================
 * NEW RAD CITY — COMBAT: damage resolution
 * Owned by: combat.
 *
 * G.combat: relation(), fire() (hitscan against per-part hit capsules,
 * pellets, spread, projectile weapons), explode(), melee(),
 * spawnProjectile() (grenade arcs w/ bounce & sticky charges, missile,
 * flamer, spit), damage math (skill, condition,
 * DR/DT, part multipliers, limb crippling, crits, sneak-attack crits,
 * headshots), deaths (ragdoll-ish knockback, explosive tumbles), BLOODY
 * MESS gibs & exploding heads, ash-pile disintegration (scripted),
 * burning, targetUnderCrosshair(), detection().
 * ===================================================================== */
(function () {
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
  C.applyDamage = function (a, amount, info) {
    if (a.removed) return 0;
    const src = C.normSource(info.source);
    if (info.source !== src) info = Object.assign({}, info, { source: src });
    const part = info.part || "torso";
    // Corpses: only gore
    if (a.dead) {
      if (amount > 8 && !a.disintegrated && part !== "weapon") {
        const p = info.point || a.centerPos();
        C.fx("blood", p.clone ? p.clone() : p, info.dir || UP, 1, goreKey(a));
        if ((amount > 30 || info.type === "explosive") && Math.random() < 0.3)
          C.dismember(
            a,
            part === "torso"
              ? C.pick(["head", "leftArm", "rightArm", "leftLeg", "rightLeg"])
              : part,
            info.dir,
          );
        if (info.explosion) C.throwCorpse(a, info);
      }
      return 0;
    }
    if (a.state === "dormant") C.wake(a);
    // Weapon part: knock it out of their hands
    if (part === "weapon") {
      if (Math.random() < (info.crit ? 0.9 : 0.55)) a.disarm();
      C.sfx("ricochet", { pos: info.point || a.pos, volume: 0.6 });
      C.onAttacked(a, src, info);
      return 0;
    }
    let dmg = amount;
    // Part multiplier (headshots ×2, shellback underside/carapace…)
    let pm = C.partMult(a.type, part);
    if (a.shellUp && part === "head") pm = 0.3;
    if (
      info.type !== "explosive" &&
      info.type !== "fire" &&
      info.type !== "poison" &&
      info.type !== "rad" &&
      info.type !== "sonic"
    )
      dmg *= pm;
    // Crits
    if (info.crit)
      dmg +=
        amount *
        (info.critMult || 1) *
        (src === "player" ? C.playerCritDamageMult(a, info.sneak) : 1);
    if (info.sneak && info.melee) dmg *= 1.5;
    // DR / DT (one model: see C.mitigate)
    if (!info.raw) dmg = C.mitigate(a, dmg, info);
    // Essential NPCs are knocked unconscious instead of dying
    let knocked = false;
    if (a.essential && a.hp - dmg < 1) {
      dmg = Math.max(0, a.hp - 1);
      knocked = !a.knockedOut;
    }
    dmg = Math.max(0, dmg);
    a.hp -= dmg;
    a.lastDamageT = now();
    a.lastAttacker = src;
    // Limb condition → crippling
    const limb = a.limbs[part];
    if (limb && !limb.crippled && part !== "torso") {
      limb.hp -= dmg * (info.type === "explosive" ? 0.5 : 1);
      if (limb.hp <= 0) C.cripple(a, part, src);
    }
    // Feedback
    const p = info.point || C.partCenter(a, part, new THREE.Vector3());
    if (!info.silent) {
      if (
        info.type !== "fire" &&
        info.type !== "poison" &&
        info.type !== "rad" &&
        info.type !== "sonic"
      ) {
        C.fx(
          "blood",
          p.clone ? p.clone() : p,
          info.dir ? info.dir.clone().negate() : UP,
          Math.min(3, 0.6 + dmg / 25),
          goreKey(a),
        );
        if (info.type === "energy")
          C.sfx("laser_impact", { pos: p, volume: 0.6 });
        else if (info.type !== "explosive")
          C.sfx(a.isRobot ? "ricochet" : "bullet_flesh", {
            pos: p,
            volume: 0.7,
          });
      }
      if (dmg > a.maxHp * 0.06 && Math.random() < 0.6) {
        try {
          a.char.playOneShot("hit", { dir: info.dir || null, part });
        } catch (e) {
          /* ignore */
        }
      }
      if (dmg > a.maxHp * 0.25 && !a.td.boss) a.slowT = now() + 0.35;
      if (Math.random() < 0.35 && a.td.sounds && a.td.sounds.hurt)
        C.sfx(a.td.sounds.hurt, {
          pos: a.pos,
          volume: 0.7,
          pitch: 0.9 + Math.random() * 0.2,
        });
      if (a.hp > 0 && dmg > 3) a.bark("hurt", 0.25);
    }
    G.events.emit(
      "actorDamaged",
      a,
      dmg,
      Object.assign({}, info, { part, killed: a.hp <= 0 }),
    );
    if (src === "player" && !info.silent && info.crit)
      G.events.emit("criticalHit", a, part);
    if (a.hp <= 0 && !a.essential) {
      C.killActor(a, Object.assign({}, info, { part, finalDamage: dmg }));
      return dmg;
    }
    if (knocked) {
      C.knockOut(a);
      return dmg;
    }
    if (a.knockedOut) return dmg;
    C.onAttacked(a, src, info);
    return dmg;
  };

  /**
   * Damage mitigation — ONE model per hit (no multiplicative DR×DT stacking, which made
   * exo-rigs immune to common guns):
   *   - no DT:   dmg × (1 − DR%)                      (cap 85 %)
   *   - with DT: max(20 % of dmg, dmg − DT) × (1 − DR%/2)   (DT first, then only half the DR)
   * Reference (player level ~15, skill 45-60, weapon condition 80-90 %): a Continuity trooper (DR 28,
   * 231 HP at level 14) takes ≈ 6-7 per 10mm hit and ≈ 13-16 per laser-rifle hit → ~15-18 laser hits.
   */
  C.mitigate = function (a, dmg, info) {
    let dr = a.dr + (a.shellUp ? 40 : 0);
    if (info && info.type === "energy" && a.isRobot) dr *= 0.8;
    if (info && info.type === "fire" && a.type === "shellback") dr *= 1.2;
    if (a.dt > 0) {
      const afterDt = Math.max(dmg * 0.2, dmg - a.dt);
      return afterDt * (1 - Math.min(0.85, dr / 200));
    }
    return dmg * (1 - Math.min(0.85, dr / 100));
  };

  /** Reaction to being attacked: aggro, faction hostility, retaliation. */
  C.onAttacked = function (a, src, info) {
    if (a.dead || !src) return;
    if (src === "player") {
      // Trespass garrison (UN Plaza): shooting one of them ends the warnings for the whole post
      if (a.warden && C.provokeWarden) C.provokeWarden(a.warden, "attacked");
      // Friendly-fire tolerance: one small accidental hit gets a warning, not a war
      if (!a.hostile() && !info.friendlyOk && !info.crit && !info.explosion) {
        const t = now();
        if (!a._ffWarnT || t - a._ffWarnT > 30) {
          if (a.hp / a.maxHp > 0.8 && !G.player.sneaking) {
            a._ffWarnT = t;
            a.say(
              C.pick([
                "Hey! Watch where you're pointing that thing!",
                "Whoa! Easy with the trigger!",
                "Do that again and see what happens.",
                "Friendly! FRIENDLY!",
              ]),
              3,
            );
            a.faceTowards(G.player.pos.x, G.player.pos.z);
            return;
          }
        }
      }
      if (!a.hostile() && !info.friendlyOk) {
        // Attacking a neutral: it and its friends nearby turn hostile (local faction hostility)
        a.wasFriendly = true;
        a.setHostile(true);
        a.bark("alert", 1);
        for (const o of C.list) {
          if (o === a || o.dead || (o.hostOverride === false && o.essential))
            continue;
          if (
            (o.faction === a.faction ||
              (G.combat.relation(o.faction, a.faction) === "ally" &&
                o.faction !== "player")) &&
            o.distTo(a.pos) < 80 &&
            o.following !== "player"
          ) {
            o.wasFriendly = o.wasFriendly || !o.hostile();
            o.setHostile(true);
            C.enterCombat(o, "player", 0.3 + Math.random() * 0.6);
          }
        }
        G.events.emit("factionAngered", a.faction, a);
      }
      if (
        a.state !== "combat" ||
        (a.target !== "player" && Math.random() < 0.6)
      ) {
        a.awareness = 1;
        C.enterCombat(a, "player");
      } else {
        a.lastSeenT = now();
        a.lastKnown = (a.lastKnown || new THREE.Vector3()).copy(G.player.pos);
      }
      return;
    }
    if (src && src !== a && !src.dead && a.isEnemy(src)) {
      if (a.state !== "combat" || (a.target !== src && Math.random() < 0.4))
        C.enterCombat(a, src);
    }
  };

  /** Cripple a limb ("crippled!" effects). */
  C.cripple = function (a, part, src) {
    const limb = a.limbs[part];
    if (!limb || limb.crippled) return;
    limb.crippled = true;
    if (part === "head") {
      a.headCrippled = true;
      // Robots: crippled combat inhibitor → frenzy (attacks everyone)
      if (a.isRobot || a.type === "giant_roach") {
        a.frenzied = true;
        if (a.isRobot)
          a.say("ERR-ERROR. COMBAT INHIBITOR OFFLINE. ALL TARGETS HOSTILE.", 3);
      }
    } else if (part === "leftLeg" || part === "rightLeg") a.legsCrippled = true;
    else if (part === "leftArm" || part === "rightArm") {
      if (a.isCreature) {
        if (a.type === "giant_roach") a.frenzied = true;
        else if (a.type === "dog" || a.type === "burrow_rat")
          a.legsCrippled = true;
        else a.damageMult *= 0.7;
      } else {
        a.armCrippled = true;
        if ((part === "rightArm" || Math.random() < 0.5) && a.weaponId)
          a.disarm();
      }
    }
    if (src === "player" && a.hp > 0) {
      G.events.emit("actorCrippled", a, part);
      C.fx(
        "floatingText",
        C.partCenter(a, part, new THREE.Vector3()),
        "CRIPPLED",
        "#ff5a3a",
      );
    }
  };

  /** Essential NPCs don't die: they get knocked out for a while. */
  // ------------------------------------------------------------------
  // Poison (stinger tails): damage over time on the player.
  // A new sting refreshes the timer and keeps the stronger dose.
  // ------------------------------------------------------------------
  // Public wrappers for other modules (the weapons module's hit effects used G.__cmb directly)
  CB.cripple = function (actor, part, src) {
    if (actor && actor.limbs && actor.limbs[part])
      C.cripple(actor, part, src || "player");
  };
  CB.ignite = function (actor, secs, dps, src) {
    if (actor && !actor.dead) C.ignite(actor, secs, dps, src || "player");
  };
  CB.poisonPlayer = function (dose, src) {
    C.poisonPlayer(dose, src);
  };
  /** Is the player's current weapon fitted with a silencer (weapons' mod system)? */
  C.playerSilenced = function () {
    if (G.isStub("weapons") || typeof G.weapons.current !== "function")
      return false;
    try {
      const c = G.weapons.current();
      return !!(c && c.weapon && c.weapon.silenced);
    } catch (e) {
      return false;
    }
  };
  C.poison = { dps: 0, t: 0, acc: 0, src: null };
  C.poisonPlayer = function (dose, src) {
    if (!dose || !G.player.alive) return;
    const Pz = C.poison;
    Pz.dps = Math.max(Pz.t > 0 ? Pz.dps : 0, dose.dps || 1);
    Pz.t = Math.max(Pz.t, dose.dur || 5);
    Pz.src = src || null;
    try {
      G.player.shake(0.2, 0.2);
    } catch (e) {
      /* ignore */
    }
    if (!G.isStub("rpg") && typeof G.rpg.addEffect === "function") {
      try {
        G.rpg.addEffect({
          id: "cmb_poison",
          name: "Poisoned",
          kind: "debuff",
          duration: Pz.t,
          desc: "Losing health to stinger venom.",
        });
      } catch (e) {
        /* optional */
      }
    }
    if (!Pz.notified) {
      Pz.notified = true;
      G.notify("You have been poisoned.");
    }
  };
  C.updatePoison = function (dt) {
    const Pz = C.poison;
    if (Pz.t <= 0) return;
    Pz.t -= dt;
    Pz.acc += dt;
    if (Pz.acc >= 1) {
      Pz.acc -= 1;
      if (G.player.alive)
        G.player.damage(Pz.dps, {
          type: "poison",
          source: Pz.src,
          part: "torso",
          dot: true,
        });
    }
    if (Pz.t <= 0) {
      Pz.t = 0;
      Pz.acc = 0;
      Pz.dps = 0;
      Pz.notified = false;
      Pz.src = null;
    }
  };
  G.events.on("reset", () => {
    C.poison.t = 0;
    C.poison.dps = 0;
    C.poison.acc = 0;
    C.poison.notified = false;
    C.poison.src = null;
  });
  C.knockOut = function (a) {
    if (a.knockedOut) return;
    a.knockedOut = true;
    a.hp = 1;
    a.knockT = now() + 9;
    C.leaveCombat(a, "knocked");
    a.anim("dead");
    a.say("Ugh...", 2);
  };

  // ------------------------------------------------------------------
  // Death
  // ------------------------------------------------------------------
  C.killActor = function (a, info) {
    if (a.dead) return;
    const killer = info.source || null;
    a.dead = true;
    a.hp = 0;
    a.deathT = now();
    a.killer = killer;
    a.inCombat = false;
    a.target = null;
    a.state = "dead";
    a.pendingMelee = null;
    a.speed = 0;
    if (a.burrowed) {
      a.burrowed = false;
      a.char.root.visible = true;
    }
    if (a.hoverBoost) a.hoverBoost = 0;
    C.hideBark(a);
    // a pickpocketed NPC's pockets become an ordinary corpse
    for (const c of [a.container, a._rpgContainer])
      if (c) {
        c.owner = null;
        c.pickpocket = false;
        c.onTake = null;
      }
    try {
      if (a.char.lookAt) a.char.lookAt(null);
    } catch (e) {
      /* ignore */
    }
    if (info.restore) {
      a.anim("dead");
      a.pos.y = G.world.groundHeight(a.pos.x, a.pos.z, a.pos.y + 0.5);
      return;
    }
    {
      let ddir = info.dir || null;
      if (info.explosion)
        ddir = new THREE.Vector3(
          a.pos.x - info.explosion.center.x,
          0,
          a.pos.z - info.explosion.center.z,
        ).normalize();
      try {
        a.char.setAim && a.char.setAim(false);
        a.char.setAnim("death", {
          dir: ddir,
          force: info.finalDamage || 0,
          explosive: info.type === "explosive",
          blast: !!info.explosion,
        });
      } catch (e) {
        /* ignore */
      }
      a._anim = "death";
    }
    if (a.td.sounds && a.td.sounds.death)
      C.sfx(a.td.sounds.death, {
        pos: a.pos,
        volume: 0.9,
        pitch: a.td.boss ? 0.6 : 0.9 + Math.random() * 0.15,
      });
    // Hovering things drop out of the sky
    if (a.hover) {
      a.corpse = { vx: 0, vy: 0, vz: 0, spin: 0 };
      a.hover = 0;
    }
    // Robots spark, sky-eye drones pop
    if (a.isRobot) {
      C.fx("sparks", a.centerPos());
      C.fx("smoke", a.centerPos(), 0.6);
      // delayed pop on the game clock (pauses in menus, cleared on load)
      if (a.type === "sky_eye" || Math.random() < 0.25)
        C.later(a.type === "sky_eye" ? 0.25 : 0.9, () => {
          if (!a.removed)
            CB.explode(
              a.centerPos(),
              a.type === "sky_eye" ? 2.5 : 3.5,
              a.type === "sky_eye" ? 15 : 30,
              { source: null, kind: "normal", small: true },
            );
        });
    }
    // Gore & disintegration
    const bloody = false; // (extra-gore option; off)
    if (!info.noGore && info.type !== "sonic") {
      if (
        info.type === "explosive" &&
        (info.finalDamage > a.maxHp * 0.6 || bloody || Math.random() < 0.35) &&
        !a.td.boss
      )
        C.gib(a, info, bloody ? 4 : 2 + Math.floor(Math.random() * 3));
      else if (
        info.part === "head" &&
        info.crit &&
        info.type !== "energy" &&
        (bloody || Math.random() < 0.65)
      )
        C.dismember(a, "head", info.dir, true);
      else if (
        info.crit &&
        info.part &&
        info.part !== "torso" &&
        (bloody || Math.random() < 0.5)
      )
        C.dismember(a, info.part, info.dir);
      else if (bloody && Math.random() < 0.4)
        C.dismember(
          a,
          info.part && info.part !== "torso"
            ? info.part
            : C.pick(["leftArm", "rightArm", "leftLeg", "rightLeg", "head"]),
          info.dir,
        );
      else if (
        info.part === "head" &&
        (info.finalDamage || 0) > a.maxHp * 1.2 &&
        Math.random() < 0.4
      )
        C.dismember(a, "head", info.dir, true);
    }
    // Knockback / tumble
    if (!a.disintegrated) C.throwCorpse(a, info);
    // (Standing for murdering bystanders & kill XP are awarded by the rpg module on actorKilled)
    // Allies notice: "Man down!", and friends who saw it happen go looking for the shooter (35_reactions)
    if (C.allyKilled) {
      try {
        C.allyKilled(a, info);
      } catch (e) {
        G.reportError("combat:allyKilled", e);
      }
    } else
      for (const o of C.list)
        if (
          o !== a &&
          !o.dead &&
          o.inScene &&
          o.faction === a.faction &&
          o.distTo(a.pos) < 20
        ) {
          o.bark("allyDown", 0.35);
          break;
        }
    // Callbacks & events
    if (a.onDeath) {
      try {
        a.onDeath(a, killer);
      } catch (e) {
        G.reportError("combat:onDeath", e);
      }
    }
    G.events.emit("actorKilled", a, killer);
    if (
      killer &&
      killer !== "player" &&
      !killer.dead &&
      typeof killer.bark === "function"
    )
      killer.bark("kill", 0.5); // (killer can be a terminal / hazard object)
  };

  /** Launch the corpse ragdoll-ish (bullet push, or explosion tumble). */
  C.throwCorpse = function (a, info) {
    const rig = !a.char.placeholder;
    if (rig && !info.explosion) return; // the G.chars death animation handles the fall direction
    const c = a.corpse || (a.corpse = { vx: 0, vy: 0, vz: 0, spin: 0 });
    if (info.explosion) {
      const ex = info.explosion;
      const dx = a.pos.x - ex.center.x,
        dz = a.pos.z - ex.center.z;
      const d = Math.hypot(dx, dz) || 0.1;
      const f =
        C.clamp(1 - d / ex.radius, 0.15, 1) *
        (a.td.boss ? 0.2 : a.td.small ? 1.6 : 1);
      c.vx = (dx / d) * 9 * f;
      c.vz = (dz / d) * 9 * f;
      c.vy = 4 + 6 * f;
      c.spin = rig ? 0 : (Math.random() < 0.5 ? -1 : 1) * (4 + 6 * f);
    } else if (info.dir && !a.td.boss) {
      const k = C.clamp(
        (info.finalDamage || 10) * 0.07,
        0.5,
        a.td.small ? 7 : 4,
      );
      c.vx += info.dir.x * k;
      c.vz += info.dir.z * k;
      c.vy += a.td.small ? k * 0.6 : 0.3;
    }
  };
  /** Per-frame corpse motion. */
  C.updateCorpse = function (a, dt) {
    const c = a.corpse;
    if (!c) return;
    a.pos.x += c.vx * dt;
    a.pos.z += c.vz * dt;
    // don't fly through walls
    const r = G.world.moveCircle(a.pos, Math.min(a.radius, 0.5), 0.5, 0, 0);
    a.pos.x = r.x;
    a.pos.z = r.z;
    c.vy -= 20 * dt;
    a.pos.y += c.vy * dt;
    const gh = G.world.groundHeight(a.pos.x, a.pos.z, a.pos.y + 0.5, 0.2);
    let floor = gh;
    if (
      G.world.terrainHeight(a.pos.x, a.pos.z) < G.world.waterLevel &&
      gh < G.world.waterLevel
    )
      floor = gh; // sinks in water
    if (c.spin) a.char.root.rotation.x += c.spin * dt;
    if (a.pos.y <= floor) {
      a.pos.y = floor;
      if (c.vy < -6 && !a._thudded) {
        a._thudded = true;
        C.fx("dust", a.pos.clone());
        C.sfx("land", { pos: a.pos, volume: 0.5, pitch: 0.7 });
      }
      c.vy = 0;
      c.vx *= Math.max(0, 1 - 8 * dt);
      c.vz *= Math.max(0, 1 - 8 * dt);
      if (c.spin) {
        c.spin = 0;
      }
    }
    // settle rotation back after landing
    if (!c.spin && a.char.root.rotation.x !== 0) {
      a.char.root.rotation.x = U.damp(a.char.root.rotation.x, 0, 6, dt);
      if (Math.abs(a.char.root.rotation.x) < 0.01) a.char.root.rotation.x = 0;
    }
    if (
      a.pos.y <= floor &&
      Math.abs(c.vx) + Math.abs(c.vz) < 0.05 &&
      !c.spin &&
      a.char.root.rotation.x === 0
    )
      a.corpse = null;
  };

  // ------------------------------------------------------------------
  // Gibs (Bloody Mess)
  // ------------------------------------------------------------------
  const gibs = [];
  let gibGeos = null,
    gibMats = null;
  function gibAssets() {
    if (gibGeos) return;
    gibGeos = [
      new THREE.DodecahedronGeometry(0.09, 0),
      new THREE.BoxGeometry(0.16, 0.08, 0.1),
      new THREE.IcosahedronGeometry(0.07, 0),
      new THREE.CylinderGeometry(0.035, 0.03, 0.26, 5),
    ];
    const mk = (c, o) => {
      const m = new THREE.MeshStandardMaterial(
        Object.assign({ color: c, roughness: 0.55, metalness: 0.05 }, o || {}),
      );
      m.userData.shared = true;
      return m;
    };
    gibMats = {
      red: [mk(0x6a0d0d), mk(0x8a1a14), mk(0xcfc6b0)],
      green: [mk(0x3d6a14), mk(0x5a8a22), mk(0xb8b89a)],
      oil: [
        mk(0x5a5a58, { metalness: 0.7 }),
        mk(0x3a3a3a, { metalness: 0.6 }),
        mk(0x8a6a2a, { metalness: 0.5 }),
      ],
      violet: [mk(0x4a1a4a), mk(0x6a2a5a), mk(0xc8c0b8)],
      blue: [mk(0x1e3c86), mk(0x6a5a3a, { roughness: 0.35 }), mk(0xb8b090)],
    };
  }
  function addGibPhysics(obj, pos, vel, life) {
    obj.position.copy(pos);
    if (!obj.parent) G.scene.add(obj);
    gibs.push({
      obj,
      vel,
      spin: new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 18,
      ),
      life: life || 25,
      t: 0,
      rest: false,
    });
    while (gibs.length > 70) {
      const g = gibs.shift();
      if (g.obj.parent) g.obj.parent.remove(g.obj);
    }
  }
  /** Spawn n generic gib chunks at pos. */
  C.spawnGibs = function (pos, dir, n, gore, force) {
    gibAssets();
    const mats = gibMats[gore] || gibMats.red;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(
        gibGeos[i % gibGeos.length],
        mats[i % 3 === 2 ? 2 : Math.floor(Math.random() * 2)],
      );
      m.scale.setScalar(0.7 + Math.random() * 0.9);
      m.castShadow = false;
      const f = force || 4;
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * f,
        1.5 + Math.random() * f * 0.8,
        (Math.random() - 0.5) * f,
      );
      if (dir) v.addScaledVector(dir, f * 0.5);
      addGibPhysics(m, pos, v, 22 + Math.random() * 8);
    }
  };
  /** Sever a part (exploding head when part==='head' & explode). */
  C.dismember = function (a, part, dir, explode) {
    if (!a.char.parts || !a.char.parts[part]) part = "head";
    if (a.dismembered && a.dismembered.has(part)) return;
    (a.dismembered = a.dismembered || new Set()).add(part);
    const p = C.partCenter(a, part, new THREE.Vector3());
    if (!a.char.placeholder && typeof a.char.dismember === "function") {
      // G.chars severs the bone, spawns & simulates its own gibs and stump
      try {
        a.char.dismember(part, { dir: dir || null, explode: !!explode });
      } catch (e) {
        G.reportError("combat:dismember", e);
      }
      C.fx(
        "blood",
        p.clone(),
        dir ? dir.clone() : UP.clone(),
        explode ? 4 : 2.5,
        goreKey(a),
      );
      C.fx(
        "decal",
        new THREE.Vector3(p.x, G.world.groundHeight(p.x, p.z, p.y) + 0.02, p.z),
        UP.clone(),
        bloodDecal(a),
      );
      C.sfx("bullet_flesh", { pos: p, volume: 1, pitch: 0.7 });
      if (part === "head") a.headless = true;
      return;
    }
    let chunks = null;
    try {
      chunks = a.char.dismember ? a.char.dismember(part) : null;
    } catch (e) {
      G.reportError("combat:dismember", e);
    }
    let n = 0;
    if (Array.isArray(chunks)) {
      for (const ch of chunks) {
        if (!ch || !ch.isObject3D) continue;
        n++;
        if (ch.userData.selfAnimated) {
          if (!ch.parent) G.scene.add(ch);
          continue;
        }
        const wp = ch.parent
          ? ch.getWorldPosition(new THREE.Vector3())
          : ch.position.clone();
        if (ch.parent && ch.parent !== G.scene) {
          G.scene.attach(ch);
        }
        const v = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          2 + Math.random() * 3,
          (Math.random() - 0.5) * 3,
        );
        if (dir) v.addScaledVector(dir, 3);
        addGibPhysics(ch, wp, v, 30);
      }
    }
    const gore = a.gore;
    C.spawnGibs(p, dir, explode ? 7 : n ? 2 : 4, gore, explode ? 5 : 3.5);
    C.fx(
      "blood",
      p.clone(),
      dir ? dir.clone() : UP.clone(),
      explode ? 4 : 2.5,
      goreKey(a),
    );
    if (explode) C.fx("blood", p.clone(), UP.clone(), 3, goreKey(a));
    C.fx(
      "decal",
      new THREE.Vector3(p.x, G.world.groundHeight(p.x, p.z, p.y) + 0.02, p.z),
      UP.clone(),
      bloodDecal(a),
    );
    C.sfx("bullet_flesh", { pos: p, volume: 1, pitch: 0.7 });
    if (part === "head") a.headless = true;
  };
  /** Full explosive gib: several limbs + chunk shower. */
  C.gib = function (a, info, limbs) {
    const gdir =
      info.dir ||
      (info.explosion
        ? new THREE.Vector3()
            .subVectors(a.pos, info.explosion.center)
            .normalize()
        : null);
    if (
      !a.char.placeholder &&
      typeof a.char.dismember === "function" &&
      (limbs >= 4 || info.finalDamage > a.maxHp * 1.5)
    ) {
      try {
        a.char.dismember("all", { dir: gdir });
      } catch (e) {
        G.reportError("combat:gib", e);
      }
      a.gibbed = true;
      C.fx("blood", a.centerPos(), UP.clone(), 4, goreKey(a));
      return;
    }
    const keys = ["head", "leftArm", "rightArm", "leftLeg", "rightLeg"]
      .sort(() => Math.random() - 0.5)
      .slice(0, limbs);
    for (const k of keys)
      C.dismember(
        a,
        k,
        info.dir ||
          (info.explosion
            ? _e.subVectors(a.pos, info.explosion.center).normalize().clone()
            : null),
        k === "head",
      );
    C.spawnGibs(a.centerPos(), null, 6, a.gore, 6);
  };
  function updateGibs(dt) {
    for (let i = gibs.length - 1; i >= 0; i--) {
      const g = gibs[i];
      g.t += dt;
      if (g.t > g.life) {
        g.obj.position.y -= dt * 0.1;
        if (g.t > g.life + 3) {
          gibs.splice(i, 1);
          if (g.obj.parent) g.obj.parent.remove(g.obj);
        }
        continue;
      }
      if (g.rest) continue;
      g.vel.y -= 18 * dt;
      g.obj.position.addScaledVector(g.vel, dt);
      g.obj.rotation.x += g.spin.x * dt;
      g.obj.rotation.y += g.spin.y * dt;
      g.obj.rotation.z += g.spin.z * dt;
      const gh = G.world.groundHeight(
        g.obj.position.x,
        g.obj.position.z,
        g.obj.position.y + 0.3,
      );
      if (g.obj.position.y < gh + 0.04) {
        g.obj.position.y = gh + 0.04;
        if (g.vel.y < -3 && Math.random() < 0.3)
          C.fx(
            "decal",
            new THREE.Vector3(g.obj.position.x, gh + 0.02, g.obj.position.z),
            UP.clone(),
            "blood",
          );
        g.vel.y = -g.vel.y * 0.3;
        g.vel.x *= 0.6;
        g.vel.z *= 0.6;
        g.spin.multiplyScalar(0.5);
        if (Math.abs(g.vel.y) < 0.6 && Math.hypot(g.vel.x, g.vel.z) < 0.3)
          g.rest = true;
      }
    }
  }
  C.clearGibs = function () {
    for (const g of gibs) if (g.obj.parent) g.obj.parent.remove(g.obj);
    gibs.length = 0;
  };

  // ------------------------------------------------------------------
  // Disintegration (ash pile) — not triggered by any weapon; kept for scripted deaths
  // ------------------------------------------------------------------
  const disints = [];
  let ashMat = null,
    pileGeo = null;
  function disintAssets() {
    if (ashMat) return;
    ashMat = new THREE.MeshStandardMaterial({
      color: 0x3a3632,
      roughness: 1,
      emissive: 0xff5a10,
      emissiveIntensity: 0.6,
    });
    ashMat.userData.shared = true;
    pileGeo = new THREE.ConeGeometry(0.45, 0.28, 9, 1);
    pileGeo.translate(0, 0.14, 0);
  }
  C.disintegrate = function (a) {
    const kind = "ash";
    disintAssets();
    a.disintegrated = kind;
    a.name = "Ash Pile";
    if (!a.char.placeholder && typeof a.char.disintegrate === "function") {
      // G.chars dissolves the body with glowing edges and leaves the ash pile
      try {
        a.char.disintegrate(kind, 1.6);
      } catch (e) {
        G.reportError("combat:disintegrate", e);
      }
      C.fx("flash", a.centerPos(), 0xff6a20, 3, 0.8);
      C.sfx("laser_impact", { pos: a.pos, volume: 0.8, pitch: 0.5 });
      return;
    }
    const fxOk = !G.isStub("fx") && typeof G.fx[kind] === "function";
    if (fxOk) {
      try {
        G.fx[kind](a.char.root);
      } catch (e) {
        G.reportError("combat:fx." + kind, e);
      }
    }
    // Our own dissolve: swap to glowing ash material & collapse, then leave a pile
    const mat = ashMat.clone();
    if (!fxOk)
      a.char.root.traverse((o) => {
        if (o.isMesh) {
          o.material = mat;
        }
      });
    if (!fxOk) {
      // the fx module leaves its own pile
      const pile = new THREE.Mesh(pileGeo, ashMat);
      pile.scale.setScalar(Math.max(0.6, a.height / 1.8) * 0.01);
      pile.position.set(
        a.pos.x,
        G.world.groundHeight(a.pos.x, a.pos.z, a.pos.y + 0.5) + 0.01,
        a.pos.z,
      );
      G.scene.add(pile);
      a.pile = pile;
    }
    disints.push({
      a,
      t: 0,
      mat,
      fxOk,
      kind,
      s: Math.max(0.6, a.height / 1.8),
    });
    C.fx("flash", a.centerPos(), 0xff6a20, 3, 0.8);
    C.sfx("laser_impact", { pos: a.pos, volume: 0.8, pitch: 0.5 });
  };
  function updateDisints(dt) {
    for (let i = disints.length - 1; i >= 0; i--) {
      const d = disints[i];
      d.t += dt;
      const k = C.clamp(d.t / 1.4, 0, 1);
      const root = d.a.char.root;
      if (!d.fxOk) {
        root.scale.set(1 + k * 0.15, Math.max(0.02, 1 - k), 1 + k * 0.15);
        d.mat.emissiveIntensity = 1.4 * (1 - k * 0.8);
      }
      if (d.a.pile) d.a.pile.scale.setScalar(d.s * Math.max(0.01, k));
      if (d.a.pile) ashMat.emissiveIntensity = 0.25;
      if (k >= 1) {
        root.visible = false;
        disints.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------------
  // Burning (flamers / fire)
  // ------------------------------------------------------------------
  let fireTex = null;
  function glowTexture() {
    if (fireTex) return fireTex;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.35, "rgba(255,255,255,0.6)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    fireTex = new THREE.CanvasTexture(c);
    return fireTex;
  }
  C.glowTexture = glowTexture;
  function spriteMat(color, opacity) {
    const m = new THREE.SpriteMaterial({
      map: glowTexture(),
      color,
      transparent: true,
      opacity: opacity === undefined ? 1 : opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return m;
  }
  C.spriteMat = spriteMat;
  C.ignite = function (a, secs, dps, src) {
    if (a.dead && !a.corpseBurn) return;
    a.burnT = Math.max(a.burnT || 0, secs);
    a.burnDps = Math.max(a.burnDps || 0, dps);
    a.burnSrc = src;
    if (!a.burnFx) {
      const g = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const s = new THREE.Sprite(spriteMat(i ? 0xff7a20 : 0xffc040, 0.9));
        s.scale.setScalar(0.6);
        g.add(s);
      }
      a.char.root.add(g);
      a.burnFx = g;
    }
  };
  C.stopBurnFx = function (a) {
    if (a.burnFx) {
      if (a.burnFx.parent) a.burnFx.parent.remove(a.burnFx);
      a.burnFx.children.forEach((s) => s.material.dispose());
      a.burnFx = null;
    }
  };
  function updateBurn(a, dt) {
    if (!a.burnT) return;
    a.burnT -= dt;
    if (!a.dead)
      C.applyDamage(a, a.burnDps * dt, {
        type: "fire",
        source: a.burnSrc,
        part: "torso",
        silent: true,
        raw: false,
      });
    if (a.burnFx) {
      const t = now();
      a.burnFx.children.forEach((s, i) => {
        s.position.set(
          Math.sin(t * 7 + i * 2) * 0.2,
          (a.dead ? 0.25 : a.height * (0.3 + i * 0.25)) +
            Math.sin(t * 11 + i) * 0.1,
          Math.cos(t * 5 + i) * 0.2,
        );
        s.scale.setScalar(
          (a.dead ? 0.5 : 0.7) + Math.sin(t * 13 + i * 3) * 0.2,
        );
      });
    }
    if (a.burnT <= 0) {
      a.burnT = 0;
      C.stopBurnFx(a);
    }
  }

  // ------------------------------------------------------------------
  // G.combat.fire — hitscan / pellets / projectile weapons
  // ------------------------------------------------------------------
  function randomCone(dir, spread, out) {
    if (!spread) return out.copy(dir);
    // uniform-ish in a disc of radius tan(spread)
    const r = Math.sqrt(Math.random()) * Math.tan(spread),
      th = Math.random() * Math.PI * 2;
    const up = Math.abs(dir.y) < 0.95 ? UP : _r.set(1, 0, 0);
    const ax = _p.crossVectors(dir, up).normalize(),
      ay = _q.crossVectors(ax, dir).normalize();
    return out
      .copy(dir)
      .addScaledVector(ax, Math.cos(th) * r)
      .addScaledVector(ay, Math.sin(th) * r)
      .normalize();
  }
  let lastNoiseFrame = -1;
  /**
   * opts: {from:'player'|actor, origin:Vector3, dir:Vector3 (normalised), weaponId, damage, spread, pellets, range,
   *        projectile, crit?, muzzle?, damageType?, beam?, projectileSpeed?, explosionRadius?}
   * → {hits:[{actor, part, damage, crit, killed, point}], hit (first), world (raycast hit|null), end (Vector3)}
   */
  CB.fire = function (opts) {
    opts = opts || {};
    const from = C.normSource(opts.from || "player") || "player";
    const isPlayer = from === "player";
    const info =
      C.weaponInfo(opts.weaponId) ||
      (isPlayer ? C.weaponInfo("unarmed") : null);
    const origin = opts.origin
      ? opts.origin.clone()
      : isPlayer
        ? G.player.eye.clone()
        : from.muzzlePos();
    const dir = opts.dir
      ? opts.dir.clone().normalize()
      : isPlayer
        ? G.player.forward.clone()
        : from.forward();
    const proj =
      opts.projectile !== undefined
        ? opts.projectile === "hitscan"
          ? null
          : opts.projectile
        : info && info.projectile;
    const damageType =
      opts.damageType || (info && info.damageType) || "ballistic";
    // Hearing: the player's gunfire (in case the weapons module didn't emit weaponFired)
    if (isPlayer && G.time.frame !== lastNoiseFrame && !(info && info.melee)) {
      lastNoiseFrame = G.time.frame;
      C.noise(
        G.player.pos,
        C.loudness(info) * (C.playerSilenced() ? 0.3 : 1),
        "player",
        "gun",
      );
    }
    // Projectile weapons
    if (proj) {
      const speed =
        opts.projectileSpeed ||
        (info && info.projectileSpeed) ||
        (proj === "missile" ? 40 : 18);
      const out = [];
      const n = proj === "flame" ? 1 : Math.max(1, opts.pellets || 1);
      for (let i = 0; i < n; i++) {
        const d = randomCone(dir, opts.spread || 0, new THREE.Vector3());
        const spawnPos = opts.muzzle
          ? opts.muzzle.clone()
          : origin.clone().addScaledVector(d, isPlayer ? 0.6 : 0.1);
        const grav =
          proj === "grenade"
            ? 9.8
            : proj === "spit"
              ? 9.8
              : proj === "flame"
                ? -1
                : 0;
        const vel = d.clone().multiplyScalar(speed);
        out.push(
          CB.spawnProjectile({
            kind: proj,
            pos: spawnPos,
            vel,
            gravity: grav,
            damage:
              opts.damage !== undefined ? opts.damage : info ? info.damage : 10,
            radius:
              opts.explosionRadius ||
              (info && info.explosionRadius) ||
              (proj === "missile" ? 5 : 1),
            from,
            weaponId: opts.weaponId,
            crit: opts.crit,
            explosionKind: info && info.explosionKind,
            fuse: opts.fuse,
            life:
              proj === "flame"
                ? ((info && info.range) || 12) / speed
                : undefined,
          }),
        );
      }
      return { projectiles: out, hits: [], hit: null };
    }
    const pellets = Math.max(1, opts.pellets || (info && info.pellets) || 1);
    const range = opts.range || (info && info.range) || 150;
    const baseDmg =
      opts.damage !== undefined ? opts.damage : info ? info.damage : 10;
    const results = { hits: [], hit: null, world: null, end: null };
    const d = new THREE.Vector3();
    for (let i = 0; i < pellets; i++) {
      randomCone(dir, opts.spread || 0, d);
      const wh = G.world.raycast(origin, d, range, {
        ignoreTags: ["actor", "interactable_self", "foliage"],
      });
      const wd = wh ? wh.dist : range;
      // Actors (skip the shooter)
      const ah = C.rayActors(origin, d, wd, {
        exclude: isPlayer ? null : from,
      });
      // Player (NPC shots)
      let ph = null;
      if (!isPlayer) {
        ph = C.rayPlayer(origin, d, ah ? ah.t : wd);
      }
      let endPoint;
      if (ph) {
        endPoint = origin.clone().addScaledVector(d, ph.t);
        let dmg = baseDmg; // per pellet
        if (ph.part === "head") dmg *= 1.5;
        G.player.damage(dmg, {
          type:
            damageType === "energy"
              ? "energy"
              : damageType === "fire"
                ? "fire"
                : damageType === "explosive"
                  ? "explosive"
                  : "ballistic",
          source: from,
          part: ph.part,
          dir: d.clone(),
        });
        C.sfx("bullet_flesh", { pos: endPoint, volume: 0.5 });
        results.hits.push({
          actor: null,
          player: true,
          part: ph.part,
          damage: dmg,
          point: endPoint,
        });
      } else if (ah) {
        endPoint = origin.clone().addScaledVector(d, ah.t);
        const a = ah.actor;
        let dmg = baseDmg,
          crit = !!opts.crit,
          sneak = false;
        if (isPlayer) {
          dmg = playerDamage(baseDmg, info, a, opts);
          if (!crit && Math.random() < C.playerCritChance(info)) crit = true;
          if (!a.dead && C.isUnaware(a)) {
            crit = true;
            sneak = true;
          }
        } else {
          if (!a.dead && Math.random() < 0.03) crit = true;
        }
        const wasDead = a.dead;
        const final = C.applyDamage(a, dmg, {
          type: damageType === "fire" ? "fire" : damageType,
          source: from,
          part: ah.key,
          crit,
          critMult: info ? info.critMult : 1,
          sneak,
          weaponId: opts.weaponId,
          dir: d.clone(),
          point: endPoint.clone(),
          projectile: null,
        });
        if (sneak && isPlayer && !wasDead && i === 0) {
          G.notify("Sneak attack critical!");
          C.sfx("bullet_flesh", { volume: 0.6 });
        }
        const hitRec = {
          actor: a,
          part: ah.key,
          damage: final,
          crit,
          sneak,
          killed: !wasDead && a.dead,
          point: endPoint,
        };
        results.hits.push(hitRec);
        if (!results.hit) results.hit = hitRec;
      } else if (wh) {
        endPoint = wh.point;
        results.world = wh;
        C.fx(
          "impact",
          wh.point.clone(),
          wh.normal.clone(),
          wh.surface || "concrete",
        );
        C.fx(
          "decal",
          wh.point.clone(),
          wh.normal.clone(),
          damageType === "energy"
            ? "laser"
            : wh.surface === "metal"
              ? "bullet_metal"
              : wh.surface === "wood"
                ? "bullet_wood"
                : "bullet",
        );
        if (i === 0 || Math.random() < 0.3) {
          if (damageType === "energy")
            C.sfx("laser_impact", { pos: wh.point, volume: 0.45 });
          else
            C.sfx(
              wh.surface === "metal" && Math.random() < 0.5
                ? "ricochet"
                : "bullet_impact",
              { pos: wh.point, volume: 0.45 },
            );
        }
        if (!G.isStub("props") && typeof G.props.damageAt === "function") {
          try {
            G.props.damageAt(wh.point, baseDmg / pellets);
          } catch (e) {
            /* ignore */
          }
        }
      } else endPoint = _miss.copy(origin).addScaledVector(d, range);
      results.end = endPoint;
      // Tracers / beams
      const muzzle = opts.muzzle
        ? opts.muzzle
        : isPlayer
          ? playerMuzzleGuess()
          : origin;
      if (opts.beam || (info && info.beam)) {
        if (i === 0)
          C.fx(
            "laserBeam",
            muzzle.clone(),
            endPoint.clone(),
            opts.beam || info.beam,
          );
      } else if (
        damageType === "ballistic" &&
        (!isPlayer || Math.random() < (pellets > 1 ? 0.15 : 0.35))
      ) {
        C.fx(
          "tracer",
          muzzle.clone(),
          endPoint.clone(),
          isPlayer ? 0xffe0a0 : 0xffd080,
        );
      }
      // Rounds cracking past NPCs: suppression / [CAUTION] for unaware enemies (35_reactions)
      if (i === 0 && C.shotPassed) {
        try {
          C.shotPassed(
            origin,
            d,
            endPoint.distanceTo(origin),
            from,
            ah ? ah.actor : null,
            !ph && !ah && wh ? wh.point : null,
          );
        } catch (e) {
          G.reportError("combat:shotPassed", e);
        }
      }
      // Near-miss whiz past the player's head
      if (!isPlayer && !ph && i === 0) {
        const res = raySeg(origin, d, wd, G.player.eye, G.player.eye);
        if (res[1] < 2.2 * 2.2 && res[0] > 3)
          C.sfx("ricochet", {
            pos: origin.clone().addScaledVector(d, res[0]),
            volume: 0.35,
            pitch: 1.4,
          });
      }
    }
    if (results.end === _miss) results.end = _miss.clone();
    return results;
  };
  const _pm = new THREE.Vector3(),
    _miss = new THREE.Vector3();
  function playerMuzzleGuess() {
    const P = G.player,
      f = P.forward;
    const right = _r.set(-f.z, 0, f.x).normalize();
    _pm.copy(P.eye).addScaledVector(f, 0.7).addScaledVector(right, 0.14);
    _pm.y -= 0.13;
    return _pm; // scratch — callers clone what they keep
  }
  /** How far the player's weapon is heard. */
  C.loudness = function (info) {
    if (!info) return 50;
    if (info.melee) return 8;
    if (info.projectile === "missile") return 110;
    if (info.damageType === "energy") return 40;
    if (/sniper/.test(info.id || "")) return 55;
    return info.automatic ? 70 : 60;
  };

  // ------------------------------------------------------------------
  // Explosions
  // ------------------------------------------------------------------
  const tempRads = [];
  /** explode(pos, radius, damage, {source, kind:'normal'|'nuke'|'fire'|'gas', small?, weaponId}) — damages the player too.
   *  kind 'gas' (riot gas) is a cloud, not a blast: handed to G.weapons.gasCloud. */
  CB.explode = function (pos, radius, damage, opts) {
    opts = opts || {};
    const kind = opts.kind || "normal";
    if (
      kind === "gas" &&
      !G.isStub("weapons") &&
      typeof G.weapons.gasCloud === "function"
    ) {
      try {
        G.weapons.gasCloud(pos, radius, {
          source: C.normSource(opts.source),
          weaponId: opts.weaponId,
        });
      } catch (e) {
        G.reportError("combat:gas", e);
      }
      return;
    }
    const src = C.normSource(opts.source);
    const center = pos.clone
      ? pos.clone()
      : new THREE.Vector3(pos.x, pos.y, pos.z);
    C.fx("explosion", center.clone(), radius, kind);
    C.sfx(kind === "nuke" ? "explosion_nuke" : "explosion", {
      pos: center,
      volume: opts.small ? 0.6 : 1,
      pitch: opts.small ? 1.3 : 0.9 + Math.random() * 0.2,
    });
    if (G.isStub("fx")) {
      /* nothing visual */
    }
    C.fx(
      "decal",
      new THREE.Vector3(
        center.x,
        G.world.groundHeight(center.x, center.z, center.y + 0.5) + 0.02,
        center.z,
      ),
      UP.clone(),
      "scorch",
    );
    C.noise(center, kind === "nuke" ? 250 : 110, src || "player", "explosion"); // unknown sources (props) are blamed on the player: you shot the car
    const ex = { center, radius };
    const isPlayer = src === "player";
    // Actors
    for (const a of C.list.slice()) {
      if (!a.inScene) continue;
      const cp = a.centerPos(_p);
      const d = cp.distanceTo(center);
      if (d > radius + a.radius) continue;
      let f = C.clamp(
        1 - Math.pow(Math.max(0, d - a.radius) / radius, 1.4),
        0,
        1,
      );
      if (f <= 0) continue;
      if (
        !G.world.lineOfSight(
          center.clone().add(new THREE.Vector3(0, 0.3, 0)),
          cp,
        )
      )
        f *= 0.35;
      let dmg = damage * f;
      if (isPlayer)
        dmg = playerDamage(
          dmg,
          C.weaponInfo(opts.weaponId) || { skill: "explosives" },
          a,
          {},
        );
      const bdir = _d.subVectors(cp, center).normalize().clone();
      C.applyDamage(a, dmg, {
        type: "explosive",
        source: src,
        part: "torso",
        explosion: ex,
        dir: bdir,
        weaponId: opts.weaponId,
        explosionKind: kind,
        raw: false,
      });
      // survivors close to the blast are thrown off their feet (35_reactions)
      if (!a.dead && C.tryKnockdown && !opts.small)
        C.tryKnockdown(a, f * (kind === "nuke" ? 1.5 : 1), bdir);
      if (kind === "nuke" && !a.dead) C.ignite(a, 4, 6, src);
    }
    // Player
    const P = G.player;
    const pd = P.pos.distanceTo(center);
    if (pd < radius * 1.1 && P.alive && !opts.ignorePlayer) {
      let f = C.clamp(1 - Math.pow(pd / radius, 1.4), 0, 1);
      if (
        !G.world.lineOfSight(
          center.clone().add(new THREE.Vector3(0, 0.3, 0)),
          _p.set(P.pos.x, P.pos.y + 1, P.pos.z),
        )
      )
        f *= 0.35;
      if (f > 0) {
        let dmg = damage * f * (src && src !== "player" ? 0.6 : 0.8);
        P.damage(dmg, { type: "explosive", source: src });
        // knockback
        const kx = P.pos.x - center.x,
          kz = P.pos.z - center.z,
          kd = Math.hypot(kx, kz) || 1;
        P.vel.x += (kx / kd) * 7 * f;
        P.vel.z += (kz / kd) * 7 * f;
        P.vel.y += 3 * f;
        P.onGround = false;
      }
    }
    if (pd < radius * 6)
      P.shake(
        C.clamp((kind === "nuke" ? 2 : 1) * (1 - pd / (radius * 6)), 0.1, 1),
        kind === "nuke" ? 1.5 : 0.5,
      );
    // Cars & props chain reactions
    if (!G.isStub("props") && typeof G.props.damageAt === "function") {
      try {
        G.props.damageAt(center, damage, radius);
      } catch (e) {
        /* ignore */
      }
    }
    // Nuke-class blasts leave a hot zone for a while
    if (kind === "nuke") {
      const src2 = G.world.addRadSource({
        x: center.x,
        y: center.y,
        z: center.z,
        radius: radius * 2,
        strength: 14,
      });
      tempRads.push({ src: src2, t: 30, s0: 14 });
    }
    // Flash light
    C.fx(
      "flash",
      center.clone(),
      0xffa040,
      kind === "nuke" ? 12 : 5,
      kind === "nuke" ? 1.5 : 0.35,
    );
    // Fallback visual if the fx module is missing: a quick fireball sprite
    if (G.isStub("fx")) fallbackBurst(center, radius, kind);
  };
  function updateTempRads(dt) {
    for (let i = tempRads.length - 1; i >= 0; i--) {
      const r = tempRads[i];
      r.t -= dt;
      r.src.strength = r.s0 * C.clamp(r.t / 30, 0, 1);
      if (r.t <= 0) {
        G.world.removeRadSource(r.src);
        tempRads.splice(i, 1);
      }
    }
  }
  const bursts = [];
  function fallbackBurst(center, radius, kind) {
    const s = new THREE.Sprite(
      spriteMat(kind === "nuke" ? 0xfff0c0 : 0xffa040, 1),
    );
    s.position.copy(center);
    s.scale.setScalar(0.5);
    G.scene.add(s);
    bursts.push({ s, t: 0, r: radius * (kind === "nuke" ? 2.5 : 1.3) });
  }
  function updateBursts(dt) {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.t += dt;
      const k = b.t / 0.6;
      b.s.scale.setScalar(b.r * Math.min(1, k * 2));
      b.s.material.opacity = Math.max(0, 1 - k);
      if (k >= 1) {
        G.scene.remove(b.s);
        b.s.material.dispose();
        bursts.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------------
  // Melee
  // ------------------------------------------------------------------
  /**
   * melee({from, range, arc, damage, weaponId, type?, knock?, slam?, rads?, power?})
   * Player: hits the best actor in the swing arc (per-part via a ray, else torso).
   * Actor: hits its target (player or actor) if in reach & arc; slams hit everyone nearby.
   * Returns {hit: actor|'player'|null, part, damage}.
   */
  CB.melee = function (opts) {
    opts = opts || {};
    const from = opts.from || "player";
    const range = opts.range || 2;
    const arc = opts.arc || 1.0;
    if (from === "player") {
      const P = G.player;
      const info = C.weaponInfo(opts.weaponId) || C.weaponInfo("unarmed");
      const eye = opts.origin || P.eye,
        fwd = opts.dir || P.forward;
      const fromWeapons = !!opts.weapon; // the weapons module plays its own hit sounds
      // Precise ray first
      let hit = C.rayActors(eye, fwd, range + 0.4, { noVirtual: true });
      let part = hit ? hit.key : "torso",
        target = hit ? hit.actor : null;
      if (!target) {
        let best = null,
          bs = -1e9;
        for (const a of C.list) {
          if (!a.inScene || a.disintegrated) continue;
          const dx = a.pos.x - P.pos.x,
            dz = a.pos.z - P.pos.z,
            d = Math.hypot(dx, dz) - a.radius;
          if (d > range) continue;
          const dy = a.pos.y - P.pos.y;
          if (dy > 2 || dy < -2.2) continue;
          const ang = Math.acos(
            C.clamp(
              (dx * fwd.x + dz * fwd.z) /
                (Math.hypot(dx, dz) * Math.hypot(fwd.x, fwd.z) || 1),
              -1,
              1,
            ),
          );
          if (ang > arc) continue;
          const s = -d - ang * 2 - (a.dead ? 5 : 0);
          if (s > bs) {
            bs = s;
            best = a;
          }
        }
        target = best;
      }
      if (!target) {
        const wh = G.world.raycast(eye, fwd, range, { ignoreTags: ["actor"] });
        if (wh) {
          C.fx(
            "impact",
            wh.point.clone(),
            wh.normal.clone(),
            wh.surface || "concrete",
          );
          if (!fromWeapons)
            C.sfx(wh.surface === "metal" ? "ricochet" : "melee_hit", {
              pos: wh.point,
              volume: 0.4,
            });
          if (!G.isStub("props") && typeof G.props.damageAt === "function") {
            try {
              G.props.damageAt(wh.point, (opts.damage || 5) * 0.5);
            } catch (e) {
              /* ignore */
            }
          }
        }
        C.noise(P.pos, 8, "player", "step");
        return { hit: null };
      }
      // (power attacks: the weapons module already doubles opts.damage)
      let dmg = playerDamage(
        opts.damage !== undefined ? opts.damage : info.damage,
        info,
        target,
        opts,
      );
      let crit = Math.random() < C.playerCritChance(info),
        sneak = false;
      if (!target.dead && C.isUnaware(target)) {
        crit = true;
        sneak = true;
      }
      const wasDead = target.dead;
      const pt = hit
        ? eye.clone().addScaledVector(fwd, hit.t)
        : target.centerPos();
      const final = C.applyDamage(target, dmg, {
        type: "melee",
        source: "player",
        part,
        crit,
        critMult: info.critMult,
        sneak,
        melee: true,
        weaponId: opts.weaponId,
        dir: fwd.clone(),
        point: pt,
      });
      if (!fromWeapons)
        C.sfx(info.unarmed || info.id === "unarmed" ? "punch" : "melee_hit", {
          pos: pt,
          volume: 0.9,
        });
      if (sneak && !wasDead) G.notify("Sneak attack critical!");
      // Knock the victim back a bit (power fist / sledge)
      if (!target.dead && (opts.power || info.damage > 25) && !target.td.boss) {
        target.slowT = now() + 0.5;
      }
      // heavy power attacks (sledgehammer, fire axe) and crits can floor them (35_reactions)
      if (
        !target.dead &&
        C.tryKnockdown &&
        ((opts.power && (crit || info.damage > 30)) ||
          (crit && info.damage > 45))
      )
        C.tryKnockdown(target, opts.power ? 0.7 : 0.5, fwd);
      return {
        hit: target,
        part,
        damage: final,
        crit,
        killed: !wasDead && target.dead,
      };
    }
    // ---- NPC melee ----
    const a = from;
    const t = a.target;
    const dmg = opts.damage || 5;
    const f = a.forward(_d);
    const hitsPlayer = () => {
      const P = G.player;
      if (!P.alive) return false;
      const dx = P.pos.x - a.pos.x,
        dz = P.pos.z - a.pos.z,
        d = Math.hypot(dx, dz);
      if (
        d > range + P.radius ||
        Math.abs(P.pos.y - a.pos.y) > Math.max(2.2, a.height * 0.8)
      )
        return false;
      if (opts.slam) return true;
      return (dx * f.x + dz * f.z) / (d || 1) > Math.cos(arc);
    };
    let result = { hit: null };
    if ((t === "player" || opts.slam || a.frenzied) && hitsPlayer()) {
      const P = G.player;
      const d = dmg;
      P.damage(d, { type: opts.type || "melee", source: a, part: "torso" });
      C.sfx(
        a.isCreature
          ? "bullet_flesh"
          : a.weapon && a.weapon.skill === "melee"
            ? "melee_hit"
            : "punch",
        { pos: P.pos, volume: 0.9 },
      );
      if (opts.knock) {
        const dx = P.pos.x - a.pos.x,
          dz = P.pos.z - a.pos.z,
          dd = Math.hypot(dx, dz) || 1;
        P.vel.x += (dx / dd) * opts.knock;
        P.vel.z += (dz / dd) * opts.knock;
        P.vel.y += opts.knock * 0.35;
        P.onGround = false;
        P.shake(0.6, 0.35);
      } else P.shake(0.25, 0.2);
      if (opts.rads) P.addRads(opts.rads);
      if (opts.poison) C.poisonPlayer(opts.poison, a);
      result = { hit: "player", damage: d };
    } else if (t && t !== "player" && !t.dead) {
      const dx = t.pos.x - a.pos.x,
        dz = t.pos.z - a.pos.z,
        d = Math.hypot(dx, dz);
      if (d < range + t.radius) {
        C.applyDamage(t, dmg, {
          type: opts.type || "melee",
          source: a,
          part: C.pick(["torso", "torso", "head", "leftArm", "rightArm"]),
          dir: f.clone(),
          point: t.centerPos(),
        });
        C.sfx("melee_hit", { pos: t.pos, volume: 0.8 });
        if (opts.knock && !t.dead && C.tryKnockdown)
          C.tryKnockdown(t, Math.min(1, 0.35 + opts.knock * 0.06), f);
        result = { hit: t, damage: dmg };
      }
    }
    if (opts.slam) {
      const c = a.pos.clone().addScaledVector(f, range * 0.6);
      C.fx("dust", c.clone());
      C.fx("impact", c.clone(), UP.clone(), "rubble");
      C.sfx("explosion", { pos: c, volume: 0.5, pitch: 0.5 });
      const pd = G.player.pos.distanceTo(c);
      if (pd < opts.slam * 3)
        G.player.shake(C.clamp(1 - pd / (opts.slam * 3), 0.1, 0.8), 0.5);
      if (!G.isStub("props") && typeof G.props.damageAt === "function") {
        try {
          G.props.damageAt(c, dmg * 0.5, opts.slam);
        } catch (e) {
          /* ignore */
        }
      }
    }
    return result;
  };

  // ------------------------------------------------------------------
  // Projectiles
  // ------------------------------------------------------------------
  const projectiles = [];
  let PG = null; // shared projectile assets
  function projAssets() {
    if (PG) return PG;
    const std = (c, o) => {
      const m = new THREE.MeshStandardMaterial(
        Object.assign({ color: c, roughness: 0.5, metalness: 0.4 }, o || {}),
      );
      m.userData.shared = true;
      return m;
    };
    const grenade = new THREE.Group();
    grenade.add(
      new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), std(0x3a4a2a)),
    );
    const pin = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.05, 0.03),
      std(0x888888),
    );
    pin.position.y = 0.07;
    grenade.add(pin);
    const missile = new THREE.Group();
    const mb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.7, 8),
      std(0x6a6a5a),
    );
    mb.rotation.x = Math.PI / 2;
    missile.add(mb);
    const tip = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.18, 8),
      std(0xaa3322),
    );
    tip.rotation.x = -Math.PI / 2;
    tip.position.z = -0.44;
    missile.add(tip);
    PG = { grenade, missile };
    return PG;
  }
  const _seg = new THREE.Vector3();
  /**
   * spawnProjectile({kind:'grenade'|'missile'|'flame'|'spit', pos, vel, gravity, damage, radius, from, fuse?,
   *   explosionKind?, weaponId?, life?, type?}) → projectile record
   */
  CB.spawnProjectile = function (o) {
    projAssets();
    o = Object.assign({}, o, {
      from: C.normSource(o.from === undefined ? "player" : o.from),
    });
    const kind = o.kind || "grenade";
    const p = {
      kind,
      pos: o.pos.clone(),
      vel: o.vel ? o.vel.clone() : new THREE.Vector3(),
      gravity:
        o.gravity !== undefined
          ? o.gravity
          : kind === "grenade" || kind === "spit"
            ? 9.8
            : 0,
      damage: o.damage || 20,
      radius: o.radius || 3,
      from: o.from || null,
      t: 0,
      fuse: o.fuse || (kind === "grenade" ? 2.8 : 0),
      life: o.life || (kind === "flame" ? 0.7 : 8),
      explosionKind: o.explosionKind || "normal",
      weaponId: o.weaponId || null,
      crit: o.crit,
      type: o.type,
      hitSet: null,
      stuck: null,
      obj: null,
      trailT: 0,
    };
    if (
      kind === "grenade" &&
      (o.mine || (p.weaponId && /mine/.test(p.weaponId)))
    ) {
      p.mine = true;
      p.fuse = 1e9;
    }
    if (o.sticky !== undefined) p.sticky = !!o.sticky;
    p.restitution = o.bounce !== undefined ? o.bounce : 0.4;
    // Visuals
    let obj;
    if (kind === "grenade") {
      obj = PG.grenade.clone();
    } else if (kind === "missile") {
      obj = PG.missile.clone();
      const s = new THREE.Sprite(spriteMat(0xffa040, 1));
      s.scale.setScalar(0.5);
      s.position.z = 0.45;
      obj.add(s);
    } else if (kind === "flame") {
      obj = new THREE.Sprite(
        spriteMat(Math.random() < 0.5 ? 0xff8a20 : 0xffc040, 0.9),
      );
      obj.scale.setScalar(0.25);
      p.hitSet = new Set();
    } else if (kind === "spit") {
      obj = new THREE.Sprite(spriteMat(0x9adf40, 1));
      obj.scale.setScalar(0.3);
    } else obj = new THREE.Sprite(spriteMat(0xffffff, 1));
    obj.position.copy(p.pos);
    G.scene.add(obj);
    p.obj = obj;
    projectiles.push(p);
    if (kind === "missile")
      C.sfx("gun_missile", { pos: p.pos, volume: 0.4, pitch: 1.4 });
    return p;
  };
  function removeProjectile(i) {
    const p = projectiles[i];
    if (p.obj) {
      G.scene.remove(p.obj);
      p.obj.traverse((o) => {
        if (o.material && !o.material.userData.shared) o.material.dispose();
      });
    }
    projectiles.splice(i, 1);
  }
  function detonate(p) {
    const pos = p.pos.clone();
    CB.explode(pos, p.radius, p.damage, {
      source: p.from,
      kind: p.explosionKind,
      weaponId: p.weaponId,
    });
  }
  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.t += dt;
      if (p.stuck) {
        // Sticky charge riding on its victim (spawnProjectile({sticky:true}))
        if (p.stuck.removed) p.stuck = null;
        else
          p.pos.set(
            p.stuck.pos.x + p.stickOff.x,
            p.stuck.pos.y + p.stickOff.y,
            p.stuck.pos.z + p.stickOff.z,
          );
      } else if (!p.resting) {
        p.vel.y -= p.gravity * dt;
        const step = p.vel.length() * dt;
        if (step > 1e-5) {
          _seg.copy(p.vel).normalize();
          const hitResult = sweep(p, _seg, step);
          if (hitResult === "removed") {
            removeProjectile(i);
            continue;
          }
          if (!hitResult) p.pos.addScaledVector(p.vel, dt);
        }
      }
      // Orientation & visuals
      if (p.obj) {
        p.obj.position.copy(p.pos);
        if (p.kind === "missile" && p.vel.lengthSq() > 0.01)
          p.obj.lookAt(_p.copy(p.pos).sub(p.vel));
        if (p.kind === "grenade" && !p.resting) {
          p.obj.rotation.x += dt * 8;
          p.obj.rotation.z += dt * 5;
        }
        if (p.kind === "flame") {
          const k = p.t / p.life;
          p.obj.scale.setScalar(0.25 + k * 1.3);
          p.obj.material.opacity = 0.9 * (1 - k);
          p.obj.material.color.setHex(
            k < 0.3 ? 0xffc040 : k < 0.7 ? 0xff7a20 : 0x663322,
          );
        }
      }
      // Trails
      if (p.kind === "missile") {
        p.trailT -= dt;
        if (p.trailT <= 0) {
          p.trailT = 0.04;
          spawnTrail(p.pos, 0xbbbbbb);
        }
      }
      // Fuses & lifetime
      if (p.kind === "grenade") {
        if (p.mine) {
          if (p.resting && p.t > 1.5 && mineTriggered(p)) {
            detonate(p);
            removeProjectile(i);
            continue;
          }
          if (p.t > 600) {
            removeProjectile(i);
            continue;
          }
        } else if (p.t >= p.fuse) {
          detonate(p);
          removeProjectile(i);
          continue;
        }
      } else if (p.t >= p.life) {
        if (p.kind === "missile") detonate(p);
        removeProjectile(i);
        continue;
      }
    }
    updateTrails(dt);
  }
  function mineTriggered(p) {
    const P = G.player;
    if (p.from !== "player" && P.pos.distanceTo(p.pos) < 2.5) return true;
    for (const a of C.list)
      if (
        !a.dead &&
        a.inScene &&
        a !== p.from &&
        a.pos.distanceTo(p.pos) < 2.2 &&
        (p.from !== "player" || a.hostile() || true)
      )
        return true;
    return false;
  }
  /** Move a projectile along dir by len; handle collisions. Returns 'removed', true (handled), or false. */
  function sweep(p, dir, len) {
    const origin = p.pos;
    const isPlayerShot = p.from === "player";
    const wh = G.world.raycast(origin, dir, len + 0.05, {
      ignoreTags: ["actor", "foliage"],
      includeWater: p.kind !== "flame",
    });
    const wd = wh ? wh.dist : len;
    // Actors
    const ah =
      p.kind === "grenade" && p.t < 0.08
        ? null
        : C.rayActors(origin, dir, wd, {
            exclude: isPlayerShot ? null : p.from,
            aliveOnly: p.kind === "flame" || p.kind === "spit",
            noVirtual: true,
            skip: p.hitSet ? (a) => p.hitSet.has(a) : null,
          });
    const ph = !isPlayerShot ? C.rayPlayer(origin, dir, ah ? ah.t : wd) : null;
    // Flames: area burn, pass through
    if (p.kind === "flame") {
      const fr = 0.3 + (p.t / p.life) * 0.8;
      for (const a of C.list) {
        if (a.dead || !a.inScene || a === p.from || p.hitSet.has(a)) continue;
        if (a.centerPos(_q).distanceTo(origin) < fr + a.radius) {
          p.hitSet.add(a);
          let dmg = p.damage;
          if (isPlayerShot)
            dmg = playerDamage(
              dmg,
              C.weaponInfo(p.weaponId) || { skill: "firearms" },
              a,
              {},
            );
          C.applyDamage(a, dmg, {
            type: "fire",
            source: p.from,
            part: "torso",
            weaponId: p.weaponId,
            silent: false,
          });
          C.ignite(a, 3, isPlayerShot ? 4 : 3, p.from);
        }
      }
      if (!isPlayerShot && !p.hitSet.has("player")) {
        const P = G.player;
        if (
          _q.set(P.pos.x, P.pos.y + 1, P.pos.z).distanceTo(origin) <
          fr + 0.45
        ) {
          p.hitSet.add("player");
          P.damage(p.damage, { type: "fire", source: p.from });
        }
      }
      if (wh) {
        p.pos.copy(wh.point).addScaledVector(wh.normal, 0.1);
        p.vel.multiplyScalar(0.2);
        p.gravity = -2;
        return true;
      }
      return false;
    }
    if (ph) {
      const hp = origin.clone().addScaledVector(dir, ph.t);
      if (p.kind === "grenade") {
        bounce(p, new THREE.Vector3(-dir.x, 0.3, -dir.z).normalize(), hp);
        return true;
      }
      if (p.kind === "missile") {
        p.pos.copy(hp);
        detonate(p);
        return "removed";
      }
      const t = p.kind === "spit" ? p.type || "poison" : "energy";
      G.player.damage(p.damage, { type: t, source: p.from, part: ph.part });
      if (p.kind === "spit") {
        C.fx("blood", hp.clone(), UP.clone(), 1, 0x9adf40);
      }
      return "removed";
    }
    if (ah) {
      const hp = origin.clone().addScaledVector(dir, ah.t);
      const a = ah.actor;
      if (p.kind === "grenade") {
        if (p.sticky && !a.dead) {
          p.stuck = a;
          p.stickOff = hp.clone().sub(a.pos);
          p.pos.copy(hp);
          p.resting = true;
          C.sfx("bullet_flesh", { pos: hp, volume: 0.6 });
          return true;
        }
        bounce(p, new THREE.Vector3(-dir.x, 0.2, -dir.z).normalize(), hp);
        return true;
      }
      if (p.kind === "missile") {
        // direct hit bonus
        C.applyDamage(a, p.damage * 0.25, {
          type: "explosive",
          source: p.from,
          part: ah.key,
          weaponId: p.weaponId,
          dir: dir.clone(),
          point: hp.clone(),
        });
        p.pos.copy(hp);
        detonate(p);
        return "removed";
      }
      if (p.kind === "spit") {
        C.applyDamage(a, p.damage, {
          type: "poison",
          source: p.from,
          part: ah.key,
          point: hp.clone(),
          dir: dir.clone(),
        });
        return "removed";
      }
      return "removed";
    }
    if (wh) {
      const hp = wh.point.clone();
      if (p.kind === "grenade") {
        if (p.sticky && wh.dist < len + 0.05) {
          p.pos.copy(hp).addScaledVector(wh.normal, 0.05);
          p.resting = true;
          return true;
        }
        bounce(p, wh.normal, hp);
        return true;
      }
      if (p.kind === "missile") {
        p.pos.copy(hp).addScaledVector(wh.normal, 0.2);
        detonate(p);
        return "removed";
      }
      if (p.kind === "spit") {
        C.fx("decal", hp.clone(), wh.normal.clone(), "puddle");
        C.fx("impact", hp.clone(), wh.normal.clone(), "water");
        return "removed";
      }
      return "removed";
    }
    return false;
  }
  function bounce(p, n, point) {
    const v = p.vel;
    const vn = v.dot(n);
    v.addScaledVector(n, -1.6 * vn).multiplyScalar(p.restitution || 0.4);
    p.pos.copy(point).addScaledVector(n, 0.07);
    if (Math.abs(vn) > 2)
      C.sfx("empty_click", { pos: point, volume: 0.35, pitch: 0.6 });
    if (v.length() < 0.8 && n.y > 0.5) {
      v.set(0, 0, 0);
      p.resting = true;
    }
  }
  // Smoke trails (pooled sprites)
  const trails = [];
  function spawnTrail(pos, color) {
    let s;
    if (trails.length > 80) {
      s = trails.shift().s;
    } else {
      s = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture(),
          color,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        }),
      );
      G.scene.add(s);
    }
    if (!s.parent) G.scene.add(s);
    s.position.copy(pos);
    s.scale.setScalar(0.3);
    s.material.opacity = 0.5;
    s.material.color.setHex(color);
    trails.push({ s, t: 0 });
  }
  function updateTrails(dt) {
    for (let i = trails.length - 1; i >= 0; i--) {
      const tr = trails[i];
      tr.t += dt;
      tr.s.scale.setScalar(0.3 + tr.t * 1.6);
      tr.s.material.opacity = Math.max(0, 0.5 - tr.t * 0.35);
      tr.s.position.y += dt * 0.4;
      if (tr.t > 1.4) {
        G.scene.remove(tr.s);
        tr.s.material.dispose();
        trails.splice(i, 1);
      }
    }
  }
  C.clearProjectiles = function () {
    while (projectiles.length) removeProjectile(projectiles.length - 1);
    for (const tr of trails) {
      G.scene.remove(tr.s);
      tr.s.material.dispose();
    }
    trails.length = 0;
    for (const b of bursts) {
      G.scene.remove(b.s);
    }
    bursts.length = 0;
    for (const r of tempRads) G.world.removeRadSource(r.src);
    tempRads.length = 0;
    for (const d of disints) {
      if (d.a.pile && d.a.pile.parent) d.a.pile.parent.remove(d.a.pile);
    }
    disints.length = 0;
  };
  CB.projectiles = () => projectiles;

  // ------------------------------------------------------------------
  // Crosshair target (HUD enemy health bar)
  // ------------------------------------------------------------------
  let chFrame = -1,
    chResult = null;
  CB.targetUnderCrosshair = function (maxDist) {
    if (chFrame === G.time.frame && !maxDist) return chResult;
    chFrame = G.time.frame;
    chResult = null;
    if (!G.camera) return null;
    const eye = G.player.eye,
      fwd = G.player.forward;
    const L = maxDist || 200;
    const wh = G.world.raycast(eye, fwd, L, {
      ignoreTags: ["actor", "foliage"],
    });
    const ah = C.rayActors(eye, fwd, wh ? wh.dist : L, {
      aliveOnly: true,
      noVirtual: true,
    });
    if (ah)
      chResult = {
        actor: ah.actor,
        part: ah.key,
        dist: ah.t,
        label: ah.hp.label,
      };
    return chResult;
  };

  // ------------------------------------------------------------------
  // Sneak detection for the HUD
  // ------------------------------------------------------------------
  let detT = 0,
    detVal = "hidden",
    detMax = 0;
  C.computeDetection = function (dt) {
    detT -= dt;
    if (detT > 0) return;
    detT = 0.15;
    let danger = false,
      caution = 0;
    for (const a of C.list) {
      if (a.dead || !a.inScene || !a.hostile()) continue;
      if (a.distToPlayer() > 160) continue;
      if (a.state === "combat" && a.target === "player") {
        danger = true;
        break;
      }
      if (a.state === "search" || a.awareness > 0.2)
        caution = Math.max(caution, a.awareness);
    }
    detMax = danger ? 1 : caution;
    const prev = detVal;
    detVal = danger ? "danger" : caution > 0.2 ? "caution" : "hidden";
    if (prev !== detVal) {
      // sneak-attack stingers
      if (G.player.sneaking && G.state === "play") {
        if (detVal === "danger") C.sfx("sneak_detected", { volume: 0.8 });
        else if (detVal === "caution" && prev === "hidden")
          C.sfx("caution", { volume: 0.5 });
      }
      G.events.emit("detectionChanged", detVal, prev);
    }
  };
  /** 'hidden' | 'caution' | 'danger' — [HIDDEN] / [CAUTION] / [DANGER] */
  CB.detection = () => detVal;
  /** 0..1 how close the nearest hostile is to detecting the player. */
  CB.detectionLevel = () => detMax;

  // ------------------------------------------------------------------
  // Per-frame update pieces (called by 90_main)
  // ------------------------------------------------------------------
  /** Game-time delayed callbacks (scaled dt: frozen in menus, dropped on reset). */
  const delayed = [];
  C.later = function (sec, fn) {
    delayed.push({ t: sec, fn });
  };
  function updateDelayed(dt) {
    for (let i = delayed.length - 1; i >= 0; i--) {
      const d = delayed[i];
      d.t -= dt;
      if (d.t <= 0) {
        delayed.splice(i, 1);
        try {
          d.fn();
        } catch (e) {
          G.reportError("update:combat:delayed", e);
        }
      }
    }
  }
  C.updateCombatFx = function (dt) {
    updateDelayed(dt);
    updateProjectiles(dt);
    updateGibs(dt);
    updateDisints(dt);
    updateTempRads(dt);
    updateBursts(dt);
  };
  C.updateBurn = updateBurn;
  C.clearCombatFx = function () {
    C.clearProjectiles();
    C.clearGibs();
    delayed.length = 0;
  };
})();
