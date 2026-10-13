// play-inline-512 02 — math
// Lines 380-725 of readable/play-inline-512.pretty.js (statement-aligned).
  function downUpdate(a, dt) {
    const k = a._down,
      t = now();
    a.speed = 0;
    a.faceTarget = false;
    // the push: slide a little along the blast (walls stop it)
    if (Math.abs(k.vx) + Math.abs(k.vz) > 0.05) {
      const r = G.world.moveCircle(
        a.pos,
        Math.min(a.radius, 0.5),
        1.0,
        k.vx * dt,
        k.vz * dt,
      );
      if (isFinite(r.x) && isFinite(r.z)) {
        const gy = G.world.groundHeight(r.x, r.z, a.pos.y + 0.6, 0.2);
        if (gy > a.pos.y - 2.5 && gy > G.world.waterLevel - 0.3) {
          a.pos.x = r.x;
          a.pos.z = r.z;
        }
      }
      const damp = Math.exp(-7 * dt);
      k.vx *= damp;
      k.vz *= damp;
    }
    if (!k.up && t >= k.until) {
      k.up = t + (a.type === "brute" ? 1.8 : 1.45);
      try {
        a.char.revive("idle", { getup: true });
      } catch (e) {
        k.up = t;
      }
      a._anim = "idle";
      S.getups++;
      if (a.inCombat) barkNow(a, "getUp", 0.35);
    }
    if (k.up && t >= k.up) {
      a._down = null;
      if (a.inCombat) {
        a.aimT = t + 0.3 + Math.random() * 0.3;
        a.coverT = 0;
      }
      return 0;
    }
    return 2;
  }

  // ------------------------------------------------------------------
  // 3. SUPPRESSION & WHIZ — bullets passing close by
  // ------------------------------------------------------------------
  /**
   * A shot went from origin along dir for len metres (from = 'player' | actor). hitActor = who it
   * actually hit (no reaction for them — applyDamage handles that), impact = world hit point or null.
   */
  C.shotPassed = function (origin, dir, len, from, hitActor, impact) {
    if (!(len > 1)) return;
    const t = now(),
      isPlayer = from === "player";
    const minX = Math.min(origin.x, origin.x + dir.x * len) - 4,
      maxX = Math.max(origin.x, origin.x + dir.x * len) + 4;
    const minZ = Math.min(origin.z, origin.z + dir.z * len) - 4,
      maxZ = Math.max(origin.z, origin.z + dir.z * len) + 4;
    for (const a of C.list) {
      if (
        a === from ||
        a === hitActor ||
        a.dead ||
        !a.inScene ||
        a.burrowed ||
        a.state === "dormant" ||
        a.knockedOut
      )
        continue;
      if (a.pos.x < minX || a.pos.x > maxX || a.pos.z < minZ || a.pos.z > maxZ)
        continue;
      const cp = a.centerPos(_b);
      const rs = C.raySeg(origin, dir, len, cp, cp);
      const near = rs[1] < 1.7 * 1.7 && rs[0] > 1.5;
      const nearImpact =
        impact &&
        Math.hypot(impact.x - a.pos.x, impact.z - a.pos.z) < 3.5 &&
        Math.abs(impact.y - cp.y) < 3;
      if (!near && !nearImpact) continue;
      const enemy = isPlayer ? a.isEnemy("player") : from && a.isEnemy(from);
      if (a.state === "combat") {
        if (!enemy || !near) continue;
        // Suppressed: flinch, tuck in behind cover, worse aim for a moment
        const fresh = !(a.suppressT > t);
        a.suppressT = t + 1.4 + Math.random() * 0.6;
        if (fresh) {
          S.suppressed++;
          a.aimT = Math.max(a.aimT || 0, t + 0.2 + Math.random() * 0.25);
        }
        if (a.td.human && !a.holdPos) {
          if (
            a.coverPos &&
            a.coverPos.covered &&
            Math.hypot(a.coverPos.x - a.pos.x, a.coverPos.z - a.pos.z) < 0.9
          ) {
            a.ducked = true;
            a.duckUntil = Math.max(
              a.duckUntil || 0,
              t + 0.6 + Math.random() * 0.8,
            );
          } else if (!a.coverPos && Math.random() < 0.45)
            a.coverT = Math.min(a.coverT, 0.05);
        }
        if (
          fresh &&
          isPlayer &&
          a.voice &&
          Math.random() < 0.18 &&
          (!a._lastBark || t - a._lastBark > 4)
        )
          barkNow(a, "nearMiss");
        continue;
      }
      if (!isPlayer) continue;
      if (!enemy) {
        // a neutral nearly hit by the player: startled, looks at you, complains (friendly-fire tolerance lives in onAttacked)
        if (
          near &&
          a.td.human &&
          !a.talking &&
          (!a._whizT || t - a._whizT > 12)
        ) {
          a._whizT = t;
          a.faceTowards(G.player.pos.x, G.player.pos.z);
          barkNow(a, "nearMiss", 0.8);
        }
        continue;
      }
      if (a.warden && C.wardenHold && C.wardenHold(a)) {
        if (C.wardenNoise) C.wardenNoise(a, "gun", impact || origin);
        continue;
      }
      if (a.state === "search" && a.stateT < 0.6) continue; // already reacting to the gunshot itself
      // Unaware enemy: [CAUTION], then go and look — toward the impact, or back along the whiz
      let px, pz;
      if (nearImpact && !near) {
        px = impact.x;
        pz = impact.z;
        S.impactAlerts++;
      } else {
        const back = Math.min(rs[0], 12 + Math.random() * 10);
        const sx = cp.x - dir.x * back,
          sz = cp.z - dir.z * back;
        const j = Math.min(10, rs[0] * 0.15);
        px = sx + (Math.random() - 0.5) * j;
        pz = sz + (Math.random() - 0.5) * j;
        S.whizAlerts++;
      }
      a.awareness = Math.max(
        a.awareness || 0,
        Math.min(0.9, (a.awareness || 0) + (near ? 0.55 : 0.35)),
      );
      if (a.state === "idle" || a.state === "move" || a.state === "search") {
        if (a.state === "search") a.setState("idle");
        C.startSearch(a, { x: px, z: pz, y: a.pos.y });
        a.searchT = 14 + Math.random() * 6;
        a.faceTowards(px, pz);
        if (
          a.voice &&
          !a.isCreature &&
          (!a._cautionBarkT || t - a._cautionBarkT > 6)
        ) {
          a._cautionBarkT = t;
          a.say(C.cautionBark(a.voice), 2.2);
        }
      }
    }
  };

  // ------------------------------------------------------------------
  // 4. BODY FOUND — friends react to a kill they didn't see coming
  // ------------------------------------------------------------------
  function friends(o, a) {
    return (
      o.faction === a.faction ||
      G.combat.relation(o.faction, a.faction) === "ally"
    );
  }
  function searchFromBody(o, a, dir, shooterDist) {
    let px = a.pos.x,
      pz = a.pos.z;
    if (dir) {
      const back = Math.min(shooterDist || 20, 10 + Math.random() * 14);
      px -= dir.x * back;
      pz -= dir.z * back;
    }
    const j = 6;
    px += (Math.random() - 0.5) * j;
    pz += (Math.random() - 0.5) * j;
    o.awareness = Math.max(o.awareness || 0, 0.8);
    o.cautionUntil = 0;
    if (o.state === "search") o.setState("idle");
    C.startSearch(o, { x: px, z: pz, y: a.pos.y });
    o.searchT = 20 + Math.random() * 10;
  }
  /** Called from killActor (after the death is resolved). */
  C.allyKilled = function (a, info) {
    const killer = info && info.source;
    const P = G.player;
    let barked = false;
    const seen = a._bodySeenBy || (a._bodySeenBy = new Set());
    for (const o of C.list) {
      if (
        o === a ||
        o.dead ||
        !o.inScene ||
        o.state === "dormant" ||
        o.knockedOut ||
        o.talking
      )
        continue;
      if (!friends(o, a) || o.following === "player") continue;
      const d = o.distTo(a.pos);
      if (d > 35) continue;
      if (d > 6 && !G.world.lineOfSight(o.eyePos(_a), a.centerPos(_b)))
        continue;
      seen.add(o.uid);
      if (o.state === "combat") {
        if (!barked && o.voice) {
          o.bark("allyDown", 0.5);
          barked = true;
        }
        continue;
      }
      if (killer === "player") {
        if (!o.isEnemy("player")) {
          // a friendly settler watching the player murder their friend: onAttacked-style aggro is the rpg/faction's job;
          // here they just flee from the scene
          if (o.td.human && !o.weapon) {
            o.setState("cower");
            o.bark("cower", 0.5);
          }
          continue;
        }
        if (o.warden && C.wardenHold && C.wardenHold(o)) {
          if (C.provokeWarden) C.provokeWarden(o.warden, "attacked");
          continue;
        }
        const pd = o.distToPlayer();
        if (o.seesPlayer || pd < 10) {
          C.enterCombat(o, "player", 0.35 + Math.random() * 0.4);
          continue;
        }
        searchFromBody(
          o,
          a,
          info && info.dir,
          Math.hypot(P.pos.x - a.pos.x, P.pos.z - a.pos.z),
        );
        S.bodyFound++;
        if (!barked) barked = barkNow(o, "bodyFound", 0.9) || barked;
      } else if (
        killer &&
        killer !== "player" &&
        !killer.dead &&
        o.isEnemy(killer)
      ) {
        C.enterCombat(o, killer, 0.3 + Math.random() * 0.5);
      }
    }
  };
  /** Stumbling on a fresh body later (1 Hz, a few actors per tick). */
  let bodyT = 0;
  function scanBodies(dt) {
    bodyT -= dt;
    if (bodyT > 0) return;
    bodyT = 1.0;
    const t = now();
    const bodies = [];
    for (const b of C.list)
      if (
        b.dead &&
        b.inScene &&
        b.killer === "player" &&
        t - (b.deathT || 0) < 600 &&
        !b.disintegrated
      )
        bodies.push(b);
    if (!bodies.length) return;
    for (const o of C.list) {
      if (
        o.dead ||
        !o.inScene ||
        (o.state !== "idle" && o.state !== "move") ||
        o.isCreature ||
        !o.td.human ||
        o.talking
      )
        continue;
      if (!o.isEnemy("player") || (o.warden && C.wardenHold && C.wardenHold(o)))
        continue;
      for (const b of bodies) {
        if (!friends(o, b)) continue;
        const seen = b._bodySeenBy || (b._bodySeenBy = new Set());
        if (seen.has(o.uid)) continue;
        const d = o.distTo(b.pos);
        if (d > 14) continue;
        const dx = b.pos.x - o.pos.x,
          dz = b.pos.z - o.pos.z,
          dd = Math.hypot(dx, dz) || 1;
        if (d > 3 && (dx * -Math.sin(o.yaw) + dz * -Math.cos(o.yaw)) / dd < 0.2)
          continue; // behind them
        if (!G.world.lineOfSight(o.eyePos(_a), b.centerPos(_b))) continue;
        seen.add(o.uid);
        searchFromBody(o, b, null, 0);
        o.lastKnown.set(
          b.pos.x + (Math.random() - 0.5) * 8,
          b.pos.y,
          b.pos.z + (Math.random() - 0.5) * 8,
        );
        S.bodyFound++;
        barkNow(o, "bodyFound", 0.85);
        break;
      }
    }
  }

  // ------------------------------------------------------------------
  // 5. DISARMED — sidearm, or go get the gun back
  // ------------------------------------------------------------------
  function sidearmId(a) {
    for (const e of a.inventory || []) {
      const info = C.weaponInfo(e[0]);
      if (
        info &&
        !info.melee &&
        info.id !== "unarmed" &&
        e[0] !== a._lostWeapon
      )
        return e[0];
    }
    return null;
  }
  function pickupAlive(p) {
    if (!p || G.isStub("items") || typeof G.items.pickups !== "function")
      return false;
    try {
      return G.items.pickups().indexOf(p) >= 0;
    } catch (e) {
      return false;
    }
  }
