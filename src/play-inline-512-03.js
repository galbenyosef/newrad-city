// play-inline-512 03 — pos
// Lines 726-1065 of readable/play-inline-512.pretty.js (statement-aligned).
  function disarmedUpdate(a, dt) {
    const t = now();
    if (a.weapon || a.state !== "combat" || !a.td.human) return 0;
    const r =
      a._rearm ||
      (a._rearm = { t0: t, sidearmT: t + 0.7 + Math.random() * 0.5, tries: 0 });
    // 1) a backup gun in the pockets
    const side = sidearmId(a);
    if (side && t > r.sidearmT) {
      a.equipWeapon(side);
      a.oneShot("reload");
      S.sidearms++;
      barkNow(a, "sidearm", 0.7);
      a._rearm = null;
      a.disarmed = false;
      a.aimT = t + 0.5;
      return 0;
    }
    if (side) {
      a.speed = 0;
      return 1;
    }
    // 2) the dropped gun, if it's still lying there and the fight isn't in our face
    const dp = a._droppedGun;
    if (!dp || !pickupAlive(dp.p) || t - r.t0 > 12) return 0;
    const tp = a.target === "player" ? G.player.pos : a.target && a.target.pos;
    if (tp && Math.hypot(tp.x - a.pos.x, tp.z - a.pos.z) < 3.5) return 0; // punch first
    const gx = dp.p.pos.x,
      gz = dp.p.pos.z,
      d = Math.hypot(gx - a.pos.x, gz - a.pos.z);
    if (d > 16 || Math.abs(dp.p.pos.y - a.pos.y) > 2) return 0;
    if (d > 0.9) {
      C.navMove(a, gx, gz, a.runSpeed, dt, 0.7);
      return 1;
    }
    try {
      G.items.removePickup(dp.p);
    } catch (e) {
      return 0;
    }
    a.inventory.push([dp.wid, 1]);
    a.equipWeapon(dp.wid);
    a.oneShot("reload");
    a._droppedGun = null;
    a._rearm = null;
    a.disarmed = false;
    a.aimT = t + 0.6;
    S.retrieved++;
    barkNow(a, "retrieve", 0.7);
    return 1;
  }

  // ------------------------------------------------------------------
  // 5b. LINE OF FIRE — a friend (or the friendly player) between the gun and its target
  // ------------------------------------------------------------------
  const _dir = new THREE.Vector3();
  C.friendInLine = function (a, aim) {
    const o = a.eyePos(_a);
    const dx = aim.x - o.x,
      dy = aim.y - o.y,
      dz = aim.z - o.z,
      L = Math.hypot(dx, dy, dz);
    if (L < 2.5) return null;
    _dir.set(dx / L, dy / L, dz / L);
    const minX = Math.min(o.x, aim.x) - 1.5,
      maxX = Math.max(o.x, aim.x) + 1.5,
      minZ = Math.min(o.z, aim.z) - 1.5,
      maxZ = Math.max(o.z, aim.z) + 1.5;
    for (const f of C.list) {
      if (
        f === a ||
        f === a.target ||
        f.dead ||
        !f.inScene ||
        f.burrowed ||
        f.state === "dormant"
      )
        continue;
      if (f.pos.x < minX || f.pos.x > maxX || f.pos.z < minZ || f.pos.z > maxZ)
        continue;
      if (a.isEnemy(f)) continue; // an enemy in the way is fair game
      // body as a vertical capsule (knees to crown)
      const r = Math.min(0.9, f.radius + 0.15);
      _b.set(f.pos.x, f.pos.y + Math.min(0.5, f.height * 0.3), f.pos.z);
      _c.set(f.pos.x, f.pos.y + f.height * 0.95, f.pos.z);
      const rs = C.raySeg(o, _dir, L - 0.6, _b, _c);
      if (rs[0] > 0.7 && rs[1] < r * r) return f;
    }
    // companions / allied NPCs don't shoot through the player either
    if (a.target !== "player" && !a.isEnemy("player") && G.player.alive) {
      const P = G.player.pos;
      if (P.x > minX && P.x < maxX && P.z > minZ && P.z < maxZ) {
        _b.set(P.x, P.y + 0.4, P.z);
        _c.set(P.x, P.y + 1.75, P.z);
        const rs = C.raySeg(o, _dir, L - 0.6, _b, _c);
        if (rs[0] > 0.7 && rs[1] < 0.55 * 0.55) return "player";
      }
    }
    return null;
  };

  // ------------------------------------------------------------------
  // 5c. PACK TACTICS — melee attackers fan out around their target instead of queueing
  // ------------------------------------------------------------------
  C.surroundSlot = function (a, tp, reach, out) {
    const t = now();
    if (!a._slot || t > a._slot.t) {
      const pack = [a];
      let cx = a.pos.x,
        cz = a.pos.z;
      for (const o of C.list) {
        if (
          o === a ||
          o.dead ||
          !o.inScene ||
          !o.inCombat ||
          o.target !== a.target ||
          o.hover ||
          o.holdPos
        )
          continue;
        if (o.weapon && !o.weapon.melee) continue;
        if (Math.hypot(o.pos.x - tp.x, o.pos.z - tp.z) > 12) continue;
        pack.push(o);
        cx += o.pos.x;
        cz += o.pos.z;
      }
      if (pack.length < 2) {
        a._slot = { t: t + 0.5, ang: null };
        return false;
      }
      pack.sort((p, q) => p.uid - q.uid);
      const n = pack.length,
        i = pack.indexOf(a);
      cx /= n;
      cz /= n;
      const base = Math.atan2(cx - tp.x, cz - tp.z);
      const step = Math.min(1.05, 5.2 / (n - 1 || 1)); // wider fan for bigger packs, never a full ring
      a._slot = {
        t: t + 0.35 + Math.random() * 0.2,
        ang: base + (i - (n - 1) / 2) * step,
      };
    }
    if (a._slot.ang === null) return false;
    const r = reach * 0.9 + 0.4;
    out.set(
      tp.x + Math.sin(a._slot.ang) * r,
      tp.y,
      tp.z + Math.cos(a._slot.ang) * r,
    );
    // don't pick a slot inside a wall
    if (
      !G.world.lineOfSight(
        _a.set(tp.x, tp.y + 0.8, tp.z),
        _b.set(out.x, tp.y + 0.8, out.z),
      )
    )
      return false;
    return true;
  };

  // ------------------------------------------------------------------
  // 5d. "POINT THAT SOMEWHERE ELSE": aiming a drawn gun at a friendly NPC
  // ------------------------------------------------------------------
  const AIMED = {
    _default: [
      "Hey! Point that somewhere else!",
      "Whoa, whoa! Easy with that thing!",
      "You aiming at me, friend? Don't.",
      "Lower the gun. Slowly.",
    ],
    neon: [
      "I've had worse aimed at me, topsider.",
      "Aim that somewhere I ain't standing.",
      "Real brave. Pointing a gun at an usher.",
    ],
    guard: [
      "Lower that weapon. Now.",
      "You want to point that at me? Think real hard.",
      "Barrel down, or I put you down.",
    ],
    merchant: [
      "Whoa! I'm open for business, not target practice!",
      "Put it down or no discount. Ever.",
    ],
    covenant: [
      "Lower your weapon, civilian.",
      "Aim that at me again and it'll be the last thing you aim.",
    ],
    raider: ["You pointin' that at me? Cute.", "Do it. I dare ya."],
  };
  function playerGunDrawn() {
    if (G.isStub("weapons") || typeof G.weapons.current !== "function")
      return false;
    try {
      if (G.weapons.isHolstered && G.weapons.isHolstered()) return false;
      const c = G.weapons.current();
      if (!c || !c.id || c.holstered || c.id === "unarmed") return false;
      const info = C.weaponInfo(c.id);
      return !!(info && !info.melee);
    } catch (e) {
      return false;
    }
  }
  let aimT = 0,
    aimedAt = null,
    aimedFor = 0;
  function aimedWatch(dt) {
    aimT -= dt;
    if (aimT > 0) return;
    const step = 0.25;
    aimT = step;
    if (
      G.state !== "play" ||
      !G.player.alive ||
      C.anyCombat ||
      !playerGunDrawn()
    ) {
      aimedAt = null;
      aimedFor = 0;
      return;
    }
    let h = null;
    try {
      h = G.combat.targetUnderCrosshair();
    } catch (e) {
      h = null;
    }
    const a = h && h.actor;
    if (
      !a ||
      a.dead ||
      a.hostile() ||
      a.isCreature ||
      a.isRobot ||
      !a.voice ||
      a.following === "player" ||
      a.talking ||
      h.dist > 14 ||
      (a.state !== "idle" && a.state !== "move")
    ) {
      aimedAt = null;
      aimedFor = 0;
      return;
    }
    if (a !== aimedAt) {
      aimedAt = a;
      aimedFor = 0;
    }
    aimedFor += step;
    if (aimedFor < 1.4 || (a._aimedWarnT && now() - a._aimedWarnT < 25)) return;
    a._aimedWarnT = now();
    aimedFor = 0;
    a.faceTowards(G.player.pos.x, G.player.pos.z);
    const lines =
      AIMED[a.neonGuard || a.safeGuard ? "guard" : a.voice] || AIMED._default;
    a.say(C.pick(lines), 3);
    if (!a.weapon && a.td.human && !a.merchant && Math.random() < 0.5)
      a.setState("cower");
  }

  // ------------------------------------------------------------------
  // Per-actor override (called by C.updateActor before its state switch).
  // Returns 0 = not handled, 1 = handled (caller picks the animation), 2 = handled incl. animation.
  // ------------------------------------------------------------------
  C.reactOverride = function (a, dt) {
    if (a.state === "knocked" || a.state === "dormant") return 0;
    if (a._down) return downUpdate(a, dt);
    if (a._evade) {
      const r = evadeUpdate(a, dt);
      if (r) return r;
    }
    if (a.disarmed && !a.weapon && a.state === "combat") {
      const r = disarmedUpdate(a, dt);
      if (r) return r;
    }
    return 0;
  };

  // ------------------------------------------------------------------
  // 6. WATCHDOG — nobody stays stuck (1 Hz, a slice of the list per tick)
  // ------------------------------------------------------------------
  const MOBILE_STATES = { combat: 1, search: 1, move: 1, follow: 1, flee: 1 };
  function freeNear(a, maxR, sameFloorY, needLos) {
    const y0 = sameFloorY;
    for (let r = 0.6; r <= maxR; r += 0.6) {
      const n = Math.max(8, Math.round(r * 6));
      const off = Math.random() * Math.PI * 2;
      for (let k = 0; k < n; k++) {
        const ang = off + (k / n) * Math.PI * 2;
        const x = a.pos.x + Math.sin(ang) * r,
          z = a.pos.z + Math.cos(ang) * r;
        const y = C.freeSpot(
          x,
          z,
          Math.max(0.2, Math.min(a.radius, 0.5)),
          y0,
          true,
        );
        if (y === null || Math.abs(y - y0) > 0.9) continue;
        if (!a.td.amphibious && y < G.world.waterLevel - 0.3) continue;
        if (
          needLos &&
          !G.world.lineOfSight(
            _a.set(a.pos.x, a.pos.y + 1.0, a.pos.z),
            _b.set(x, y + 1.0, z),
          )
        )
          continue;
        return { x, y, z };
      }
    }
    return null;
  }
  function insideSolid(a) {
    const cs = G.world.query(
      a.pos.x - 0.05,
      a.pos.z - 0.05,
      a.pos.x + 0.05,
      a.pos.z + 0.05,
    );
    const y = a.pos.y;
    for (const c of cs) {
      if (c.maxY <= y + 0.6 || c.minY >= y + Math.min(1.7, a.height * 0.9))
        continue;
      if (c.tag === "actor" || c.tag === "foliage" || c.tag === "trigger")
        continue;
      if (G.world.pointInCollider(c, a.pos.x, a.pos.z, -0.08)) return true;
    }
    return false;
  }
  function currentGoal(a) {
    if (a.state === "move" && a.moveGoal) return a.moveGoal;
    if (a.state === "combat" && a.coverPos) return a.coverPos;
    if (a.state === "search" && a.lastKnown) return a.lastKnown;
    if (a.nav && a.nav.path && a.nav.path.length)
      return a.nav.path[Math.min(a.nav.i, a.nav.path.length - 1)];
    if (a.wanderGoal) return a.wanderGoal;
    return null;
  }
