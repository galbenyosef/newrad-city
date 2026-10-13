// play-inline-511 02 — info
// Lines 356-705 of readable/play-inline-511.pretty.js (statement-aligned).
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
