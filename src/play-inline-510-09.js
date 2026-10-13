// play-inline-510 09 — math
// Lines 2552-2765 of readable/play-inline-510.pretty.js (statement-aligned).
  C.updateActor = function (a, dt) {
    if (a.dead) return;
    if (!a._aiStarted) {
      a._aiStarted = true;
      a.homeYaw = a.yaw;
    } // quests may set yaw right after spawn
    a.stateT += dt;
    const t = now();
    // Perception (throttled & staggered)
    if (t >= a.nextPerceive) {
      const dtp = Math.max(0.05, t - (a._lastPerceive || t - 0.25));
      a._lastPerceive = t;
      a.nextPerceive =
        t + (a.state === "combat" ? 0.18 : 0.3) + Math.random() * 0.08;
      if (a.state !== "dormant") perceive(a, dtp);
    }
    // Reactions layer (35_reactions): knocked down, dodging a grenade, going for a dropped gun
    if (C.reactOverride) {
      const r = C.reactOverride(a, dt);
      if (r) {
        if (!a.burrowed) vertical(a, dt);
        a.applyYaw();
        if (r === 1) pickAnim(a);
        return;
      }
    }
    if (a.pendingMelee) resolvePendingMelee(a);
    a.faceTarget = false;
    switch (a.state) {
      case "knocked": {
        // essential NPC knocked unconscious: gets back up after a while
        a.speed = 0;
        if (t > (a.knockT || 0)) {
          a.knockedOut = false;
          a.hp = Math.max(a.hp, a.maxHp * 0.3);
          a.setState("idle");
          a.anim("idle");
          C.calmEssential(a);
        }
        return;
      }
      case "dormant": {
        a.speed = 0;
        const d = a.distToPlayer();
        const P = G.player;
        // den sleepers (North Woods ripjaws) wake a little farther out, but a careful sneaker can slip past
        const wr = P.sneaking
          ? a.denWake
            ? 3 + (1 - C.skill("stealth", 15) / 100) * 5
            : 4 + (1 - C.skill("stealth", 15) / 100) * 6
          : a.denWake || 11;
        if (a.isEnemy("player") && P.alive && d < wr) C.wake(a);
        else if (a.td.maniac && t > (a._dormScanT || 0)) {
          // Maniacs lying among the dead also rise for anyone else who walks too close (raiders, animals, patrols…)
          a._dormScanT = t + 0.5 + Math.random() * 0.3;
          for (const o of C.list) {
            if (
              o === a ||
              o.dead ||
              o.state === "dormant" ||
              !o.inScene ||
              o.burrowed
            )
              continue;
            if (
              Math.abs(o.pos.x - a.pos.x) > 7 ||
              Math.abs(o.pos.z - a.pos.z) > 7 ||
              !a.isEnemy(o)
            )
              continue;
            if (Math.hypot(o.pos.x - a.pos.x, o.pos.z - a.pos.z) < 6.5) {
              C.wake(a);
              if (a.state !== "dormant") C.enterCombat(a, o, 0.4);
              break;
            }
          }
        } else if (a.denWake && d < 45 && t > (a._snoreT || 0)) {
          // slow, heavy breathing from the den — the player hears them before seeing them
          a._snoreT = t + 4 + Math.random() * 4;
          if (a.td.sounds && a.td.sounds.idle)
            C.sfx(a.td.sounds.idle, {
              pos: a.pos,
              volume: 0.22,
              pitch: 0.45 + Math.random() * 0.1,
            });
        }
        break;
      }
      case "combat": {
        if (!targetValid(a)) {
          const killed = a.target && a.target !== "player" && a.target.dead;
          const nt = pickNewTarget(a);
          if (nt) {
            a.target = nt;
            break;
          }
          if (killed || (a.target === "player" && !G.player.alive))
            a.bark("kill", 0.6);
          C.leaveCombat(a, "idle");
          break;
        }
        // Lost the target for a while → search
        if (
          !a.canSeeTarget &&
          t - a.lastSeenT >
            (a.target === "player" && G.player.sneaking ? 5 : 12)
        ) {
          const lk = a.lastKnown
            ? a.lastKnown.clone()
            : targetPos(a, new THREE.Vector3());
          C.leaveCombat(a, "idle");
          a.awareness = 0.6;
          C.startSearch(a, lk);
          break;
        }
        // Occasionally re-evaluate to a closer enemy
        if (t > (a._retargetT || 0)) {
          a._retargetT = t + 1.5 + Math.random();
          if (a.target !== "player") {
            const nt = pickNewTarget(a);
            if (
              nt === "player" &&
              a.distToPlayer() < a.distTo(a.target.pos) * 0.7
            )
              a.target = nt;
          }
        }
        try {
          if (a.char.lookAt) a.char.lookAt(targetAimPoint(a, _b));
        } catch (e) {
          /* ignore */
        }
        combatBehaviour(a)(a, dt);
        break;
      }
      case "flee":
        fleeBehaviour(a, dt);
        break;
      case "search":
        searchBehaviour(a, dt);
        break;
      case "follow":
        followBehaviour(a, dt);
        break;
      case "move": {
        if (a.cautionUntil > t) {
          cautionBehaviour(a, dt);
          break;
        }
        if (
          !a.moveGoal ||
          C.navMove(
            a,
            a.moveGoal.x,
            a.moveGoal.z,
            a.moveRun ? a.runSpeed : a.walkSpeed,
            dt,
            0.6,
          )
        ) {
          a.moveGoal = null;
          a.setState(a.following ? "follow" : "idle");
        }
        break;
      }
      case "cower": {
        a.speed = 0;
        if (a.stateT > 8 + Math.random() * 4) a.setState("idle");
        break;
      }
      default:
        if (a.cautionUntil > t) cautionBehaviour(a, dt);
        else idleBehaviour(a, dt);
    }
    if (!a.burrowed) vertical(a, dt);
    a.applyYaw();
    // Animation
    pickAnim(a);
  };

  function pickAnim(a) {
    if (a.state === "dormant" || a.burrowed) return;
    // Weapon raised while fighting (G.chars aim pose/IK), lowered otherwise
    const aiming = a.state === "combat" && !!a.weapon && !a.weapon.melee;
    if (aiming !== a._aiming) {
      a._aiming = aiming;
      try {
        if (a.char.setAim) a.char.setAim(aiming);
      } catch (e) {
        /* ignore */
      }
    }
    if (a.shellUp) {
      a.anim("cower");
      return;
    }
    const sp = a.speed || 0;
    if (sp > 0.25) {
      if (sp > a.walkSpeed * 1.35)
        a.anim("run", C.clamp(sp / Math.max(1, a.runSpeed), 0.6, 1.6));
      else
        a.anim(
          a.state === "search" && a.td.human ? "stealth" : "walk",
          C.clamp(sp / Math.max(0.5, a.walkSpeed), 0.6, 1.8),
        );
      return;
    }
    if (a.state === "cower") a.anim("cower");
    else if ((a.aiMode === "sit" || a.aiMode === "kneel") && a.state === "idle")
      a.anim(a.aiMode);
    else if (a.state === "combat" && a.ducked) a.anim("stealth");
    else if (a.state === "combat" && a.weapon && !a.weapon.melee) a.anim("aim");
    else a.anim("idle");
  }
