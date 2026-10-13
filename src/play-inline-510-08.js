// play-inline-510 08 — math
// Lines 2306-2551 of readable/play-inline-510.pretty.js (statement-aligned).
  function combatBehaviour(a) {
    const ai = a.td.ai;
    if (ai === "humanoid") return B.humanoid;
    return B[ai] || B.brawler;
  }

  // ------------------------------------------------------------------
  // Non-combat behaviours
  // ------------------------------------------------------------------
  function idleBehaviour(a, dt) {
    const t = now();
    a.faceTarget = false;
    const mode = a.aiMode;
    // Friendly NPCs look at the player when close (head-tracking)
    const dp = a.distToPlayer();
    if (
      !a.isEnemy("player") &&
      dp < 5 &&
      a.seesPlayer !== false &&
      !a.isCreature
    ) {
      try {
        if (a.char.lookAt)
          a.char.lookAt(
            _a.set(G.player.pos.x, G.player.pos.y + 1.55, G.player.pos.z),
          );
      } catch (e) {
        /* ignore */
      }
      a._looking = true;
    } else if (a._looking) {
      a._looking = false;
      try {
        if (a.char.lookAt) a.char.lookAt(null);
      } catch (e) {
        /* ignore */
      }
    }
    if (
      mode === "static" ||
      mode === "sit" ||
      mode === "kneel" ||
      mode === "merchant"
    ) {
      a.speed = 0;
      if (mode === "merchant" && dp < 4 && !a.isEnemy("player"))
        a.faceTowards(G.player.pos.x, G.player.pos.z, 2, dt);
      if (t > a.nextThink) {
        a.nextThink = t + 12 + Math.random() * 20;
        if (dp < 18) a.bark("idle", 0.35);
      }
      return;
    }
    if (mode === "guard") {
      if (C.navMove(a, a.home.x, a.home.z, a.walkSpeed, dt, 1.0)) {
        a.speed = 0;
        // look around the post
        if (t > a.nextThink) {
          a.nextThink = t + 3 + Math.random() * 5;
          a._lookYaw = a.homeYaw + (Math.random() - 0.5) * 2.2;
          if (dp < 16) a.bark("idle", 0.12);
        }
        if (a._lookYaw !== undefined) {
          a.yaw += C.clamp(U.angleDiff(a.yaw, a._lookYaw), -1.2 * dt, 1.2 * dt);
          a.applyYaw();
        }
      }
      return;
    }
    if (mode === "patrol" && a.patrol && a.patrol.length) {
      const p = a.patrol[a.patrolIdx % a.patrol.length];
      if (C.navMove(a, p.x, p.z, a.walkSpeed, dt, 1.2)) {
        a.patrolIdx++;
        a.nextThink = t + 1 + Math.random() * 2;
      }
      if (t > a.nextThink && dp < 20) {
        a.nextThink = t + 15 + Math.random() * 15;
        a.bark("idle", 0.3);
      }
      return;
    }
    // wander (default): walk to random spots around home, pause, repeat
    if (!a.wanderGoal || t > a.nextThink) {
      if (!a.wanderGoal || Math.random() < 0.6) {
        const ang = Math.random() * Math.PI * 2,
          r = Math.random() * (a.home.r || 10);
        const gx = a.home.x + Math.sin(ang) * r,
          gz = a.home.z + Math.cos(ang) * r;
        const gg = G.world.groundHeight(gx, gz, a.pos.y + 0.6, 0.2);
        if (
          (gg > G.world.waterLevel && gg > a.pos.y - 2.5) ||
          a.td.amphibious ||
          a.hover
        )
          a.wanderGoal = { x: gx, z: gz };
      }
      a.nextThink = t + 5 + Math.random() * 9;
      if (dp < 20 && Math.random() < 0.3) a.bark("idle", 0.5);
      if (a.td.sounds && a.td.sounds.idle && dp < 25 && Math.random() < 0.25)
        C.sfx(a.td.sounds.idle, { pos: a.pos, volume: 0.35 });
    }
    if (a.wanderGoal) {
      if (C.navMove(a, a.wanderGoal.x, a.wanderGoal.z, a.walkSpeed, dt, 0.8))
        a.wanderGoal = null;
      else if (a.nav && a.nav.failUntil > t && a.stuckT > 0.6)
        a.wanderGoal = null; // unreachable spot: pick another
    } else a.speed = 0;
  }

  /** [CAUTION] sub-state: stop, turn toward the half-seen shape, peer at it. */
  function cautionBehaviour(a, dt) {
    a.speed = 0;
    a.faceTarget = true;
    const p = a.cautionAt || G.player.pos;
    a.faceTowards(p.x, p.z, 3.5, dt);
    if (!a.isCreature) {
      try {
        if (a.char.lookAt) a.char.lookAt(_a.set(p.x, p.y + 1.4, p.z));
        a._looking = true;
      } catch (e) {
        /* ignore */
      }
    }
  }

  function followBehaviour(a, dt) {
    const P = G.player;
    const ft =
      a.followTarget === "player" || a.followTarget === G.player
        ? P
        : a.followTarget;
    if (!ft || ft.dead) {
      a.setState("idle");
      return;
    }
    const fp = ft.pos;
    const d = Math.hypot(fp.x - a.pos.x, fp.z - a.pos.z);
    // Companions fight what the player fights
    if (a.following === "player" && now() > (a._nextFollowScan || 0)) {
      a._nextFollowScan = now() + 0.7;
      let best = null,
        bd = 30;
      for (const o of C.list)
        if (
          !o.dead &&
          o.inScene &&
          o.hostile() &&
          o.inCombat &&
          o.target === "player"
        ) {
          const dd = o.distTo(a.pos);
          if (dd < bd) {
            bd = dd;
            best = o;
          }
        }
      if (best) {
        C.enterCombat(a, best);
        return;
      }
    }
    // Catch-up teleport: through doors / other space at once; otherwise only when pathing can't close
    // the gap (far behind for a while, or no path) — companions walk around the block first.
    const otherSpace =
      G.LAYOUT.isInterior(fp.x) !== G.LAYOUT.isInterior(a.pos.x);
    if (d > 45) a._farT = (a._farT || 0) + dt;
    else a._farT = 0;
    const noPath = a.nav && a.nav.failUntil > now() && !a.nav.path;
    if (otherSpace || d > 110 || (d > 60 && (a._farT > 6 || noPath))) {
      const back = new THREE.Vector3(
        Math.sin(P.yaw) * 2.5,
        0,
        Math.cos(P.yaw) * 2.5,
      );
      a.pos.set(
        fp.x + back.x,
        G.world.groundHeight(fp.x + back.x, fp.z + back.z, fp.y + 1),
        fp.z + back.z,
      );
      if (a.nav) {
        a.nav.path = null;
        a.nav.search = null;
      }
      a._farT = 0;
      a.attach();
      return;
    }
    if (d > 3.5)
      C.navMove(a, fp.x, fp.z, d > 9 ? a.runSpeed : a.walkSpeed * 1.4, dt, 3.2);
    else a.speed = 0;
  }

  function fleeBehaviour(a, dt) {
    const src =
      a.fleeFrom === "player" || !a.fleeFrom ? G.player.pos : a.fleeFrom.pos;
    const dx = a.pos.x - src.x,
      dz = a.pos.z - src.z;
    const d = Math.hypot(dx, dz) || 0.01;
    if (a.holdPos) {
      a.speed = 0;
      a.setState(a.target && targetValid(a) ? "combat" : "idle");
      return;
    }
    a.faceTarget = false;
    C.steer(a, dx, dz, a.runSpeed, dt);
    if (Math.random() < 0.004) a.bark("flee", 1);
    // They come back once they've got some distance (and courage)
    if (a.stateT > 9 || d > 45) {
      a.heal(a.maxHp * 0.15);
      if (a.target && targetValid(a)) {
        a.setState("combat");
        a.inCombat = true;
      } else C.leaveCombat(a, "idle");
    }
  }

  function searchBehaviour(a, dt) {
    a.faceTarget = false;
    a.searchT -= dt;
    const lk = a.holdPos ? a.home : a.lastKnown;
    if (
      lk &&
      C.navMove(a, lk.x, lk.z, a.walkSpeed * 1.35, dt, a.holdPos ? 0.8 : 1.5)
    ) {
      // look around
      a.speed = 0;
      if (!a._lookAroundT || now() > a._lookAroundT) {
        a._lookAroundT = now() + 1.2 + Math.random();
        a._lookYaw = a.yaw + (Math.random() - 0.5) * 3;
      }
      if (a._lookYaw !== undefined) {
        a.yaw += C.clamp(U.angleDiff(a.yaw, a._lookYaw), -2 * dt, 2 * dt);
        a.applyYaw();
      }
    }
    if (a.searchT <= 0) {
      a.bark("lost", 0.7);
      a.awareness = Math.min(a.awareness, 0.2);
      C.leaveCombat(a, "idle");
      a.wanderGoal = { x: a.home.x, z: a.home.z };
    }
  }

  // ------------------------------------------------------------------
  // Per-frame update of one (in-scene, alive) actor
  // ------------------------------------------------------------------
