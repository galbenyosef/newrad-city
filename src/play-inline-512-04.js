// play-inline-512 04 — pos
// Lines 1066-1241 of readable/play-inline-512.pretty.js (statement-aligned).
  function playerCanSee(x, y, z) {
    const P = G.player;
    const dx = x - P.pos.x,
      dz = z - P.pos.z,
      d = Math.hypot(dx, dz);
    if (d > 120) return false;
    const f = P.forward || _c.set(-Math.sin(P.yaw), 0, -Math.cos(P.yaw));
    if (d > 4 && (dx * f.x + dz * f.z) / d < 0.35) return false; // outside ~70° either side
    return G.world.lineOfSight(
      _a.set(P.pos.x, P.pos.y + 1.6, P.pos.z),
      _b.set(x, y + 1.0, z),
    );
  }
  let wdIdx = 0,
    wdT = 0;
  function watchdog(dt) {
    wdT -= dt;
    if (wdT > 0) return;
    wdT = 0.25;
    const L = C.list,
      n = L.length;
    if (!n) return;
    const t = now();
    const per = Math.max(1, Math.ceil(n / 4)); // every actor about once a second
    for (let k = 0; k < per; k++) {
      const a = L[wdIdx++ % n];
      if (
        !a ||
        a.dead ||
        !a.inScene ||
        a.hover ||
        a.burrowed ||
        a.talking ||
        a._down ||
        a.state === "dormant" ||
        a.state === "knocked"
      )
        continue;
      const mobile =
        !!MOBILE_STATES[a.state] ||
        a.aiMode === "wander" ||
        a.aiMode === "patrol";
      // (a) fell under the street (exteriors only: interiors have floors over floors)
      if (!G.LAYOUT.isInterior(a.pos.x) && !a.td.amphibious) {
        const th = G.world.terrainHeight(a.pos.x, a.pos.z);
        if (th > G.world.waterLevel && a.pos.y < th - 1.5) {
          a.pos.y = G.world.groundHeight(a.pos.x, a.pos.z, th + 0.6, 0.2);
          a.vy = 0;
          S.unstuckFell++;
        }
      }
      if (a.holdPos) continue;
      // (b) inside solid geometry (spawned into a wall, shoved by separation, bad anchor)
      if (mobile && insideSolid(a)) {
        a._insideN = (a._insideN || 0) + 1;
        if (a._insideN >= 2) {
          const s = freeNear(a, 4.2, a.pos.y, false);
          if (s) {
            a.pos.set(s.x, s.y, s.z);
            S.unstuckInside++;
            if (a.nav) {
              a.nav.path = null;
              a.nav.search = null;
            }
          }
          a._insideN = 0;
        }
      } else a._insideN = 0;
      // (c) trying to walk but going nowhere
      const w = a._wd || (a._wd = { x: a.pos.x, z: a.pos.z, t, tries: 0 });
      const trying = t - (a._wantMoveT || -99) < 0.6;
      if (!trying || Math.hypot(a.pos.x - w.x, a.pos.z - w.z) > 1.2) {
        w.x = a.pos.x;
        w.z = a.pos.z;
        w.t = t;
        if (!trying) w.tries = 0;
        continue;
      }
      if (t - w.t < 7) continue;
      // stalled for 7 s: re-plan, then nudge, then (out of sight) arrive
      w.t = t;
      w.tries++;
      S.unstuckStall++;
      if (a.nav) {
        a.nav.path = null;
        a.nav.search = null;
        a.nav.failUntil = 0;
        a.nav.need = true;
        a.nav.checkT = 0;
      }
      a.detourT = 0;
      a.avoid = null;
      a.stuckT = 0;
      if (a.state === "combat") a.coverPos = null;
      if (a.state === "idle" || a.aiMode === "wander") a.wanderGoal = null;
      const goal = currentGoal(a);
      if (
        w.tries >= 2 &&
        goal &&
        a.state !== "combat" &&
        a.following !== "player"
      ) {
        const gd = Math.hypot(goal.x - a.pos.x, goal.z - a.pos.z);
        const gy = C.freeSpot(
          goal.x,
          goal.z,
          0.3,
          isFinite(goal.y) ? goal.y : a.pos.y,
          true,
        );
        if (
          gd < 80 &&
          gy !== null &&
          Math.abs(gy - (isFinite(goal.y) ? goal.y : a.pos.y)) < 2.5 &&
          !playerCanSee(a.pos.x, a.pos.y, a.pos.z) &&
          !playerCanSee(goal.x, gy, goal.z)
        ) {
          a.pos.set(goal.x, gy, goal.z);
          S.arrivedOffscreen++;
          w.tries = 0;
          continue;
        }
      }
      if (w.tries >= 2) {
        const s = freeNear(a, 3.0, a.pos.y, true);
        if (s) {
          a.pos.set(s.x, s.y, s.z);
        }
      }
      if (w.tries >= 4 && a.state === "search") {
        a.searchT = 0;
      }
      if (w.tries >= 4 && a.state === "move") {
        a.moveGoal = null;
        a.setState(a.following ? "follow" : "idle");
        w.tries = 0;
      }
    }
  }

  // ------------------------------------------------------------------
  // Per-frame entry (90_main) & wiring
  // ------------------------------------------------------------------
  C.updateReactions = function (dt) {
    if (dt <= 0) return;
    try {
      scanGrenades(dt);
    } catch (e) {
      G.reportError("combat:react.grenade", e);
    }
    try {
      scanBodies(dt);
    } catch (e) {
      G.reportError("combat:react.bodies", e);
    }
    try {
      watchdog(dt);
    } catch (e) {
      G.reportError("combat:react.watchdog", e);
    }
    try {
      aimedWatch(dt);
    } catch (e) {
      G.reportError("combat:react.aimed", e);
    }
  };
  G.events.on("reset", () => {
    gScanT = 0;
    bodyT = 0;
    wdT = 0;
    wdIdx = 0;
    aimedAt = null;
    aimedFor = 0;
    for (const k in S) S[k] = 0;
  });
  void THREE;
