// play-inline-513 06 — actors
// Lines 1716-1954 of readable/play-inline-513.pretty.js (statement-aligned).
  function updateRoaming() {
    const P = G.player;
    // Despawn far-away roamers
    for (let i = C.roam.groups.length - 1; i >= 0; i--) {
      const g = C.roam.groups[i];
      g.actors = g.actors.filter((a) => !a.removed);
      const alive = g.actors.filter((a) => !a.dead);
      const far = g.actors.every(
        (a) =>
          a.distToPlayer() > DESPAWN_ROAM_R ||
          G.LAYOUT.isInterior(a.pos.x) !== G.LAYOUT.isInterior(P.pos.x),
      );
      const stale =
        !alive.length &&
        G.time.elapsed - (g.deadT || (g.deadT = G.time.elapsed)) > 600;
      if (!g.actors.length || far || stale) {
        if (!g.actors.some((a) => a.following === "player")) {
          for (const a of g.actors) G.actors.remove(a);
          C.roam.groups.splice(i, 1);
        }
        continue;
      }
      try {
        updateHunters(g);
      } catch (e) {
        G.reportError("combat:hunters", e);
      }
    }
    if (G.LAYOUT.isInterior(P.pos.x) || !P.alive) return;
    if (G.time.elapsed < C.roam.nextT) return;
    C.roam.nextT = G.time.elapsed + 35 + Math.random() * 45;
    const liveGroups = C.roam.groups.filter((g) =>
      g.actors.some((a) => !a.dead),
    ).length;
    if (liveGroups >= 3) return;
    // Fewer encounters while fighting
    if (C.anyCombat) return;
    if (trySpecialEncounter()) return;
    spawnRoamGroup();
  }

  /** Active location upkeep: re-level scaled sites while the player is away; wake up the den. */
  function upkeepGroup(g, loc, d) {
    const t = now();
    if (d < 110 || (g.relevelT && t < g.relevelT)) return;
    g.relevelT = t + 8;
    if (g.actors.some((a) => !a.dead && a.inCombat)) return;
    const L = scaledLevel(loc);
    if (L !== null)
      for (const a of g.actors)
        if (!a.dead && !a.removed && Math.abs(a.level - L) >= 2)
          C.relevelActor(a, L + (a.holdPos ? 1 : 0));
    // North Woods: the rest of the pack comes home once the player can deal with it
    if (loc.id === DEN_ID && g.deferred > 0 && denOpen() && d > 150) {
      const home = g.actors.find((a) => !a.dead) || null;
      const cx = home ? home.pos.x : loc.x,
        cz = home ? home.pos.z : loc.z;
      for (let i = 0; i < g.deferred; i++) {
        let p = null;
        for (let k = 0; k < 20 && !p; k++) {
          const ang = Math.random() * 6.283,
            rr = 3 + Math.random() * 8;
          const x = cx + Math.sin(ang) * rr,
            z = cz + Math.cos(ang) * rr;
          const y = C.freeSpot(x, z, 0.7, home ? home.pos.y : 0, false);
          if (y !== null) p = { x, y, z };
        }
        if (!p) continue;
        const a = G.actors.spawn({
          type: "ripjaw",
          level: Math.max(1, (loc.level || 12) + C.randInt(-1, 1)),
          pos: p,
          yaw: Math.random() * 6.28,
          ai: "wander",
          faction: "creatures",
          home: { x: loc.x, z: loc.z, r: Math.max(10, loc.r * 0.7) },
          _group: g.id,
        });
        if (a) {
          makeDormant(a, 13);
          g.actors.push(a);
        }
      }
      g.deferred = 0;
    }
  }

  // ------------------------------------------------------------------
  // Group streaming / clearing / respawn (runs ~1×/s)
  // ------------------------------------------------------------------
  let popT = 0;
  C.updatePopulation = function (dt) {
    try {
      updateWardens(dt);
    } catch (e) {
      G.reportError("combat:wardens", e);
    }
    popT -= dt;
    if (popT > 0) return;
    popT = 1.0;
    const P = G.player;
    const inInt = G.LAYOUT.isInterior(P.pos.x);
    let spawnBest = null,
      spawnD = 1e9; // spawn at most one group per tick (nearest first) to avoid hitches
    for (const g of C.groups.values()) {
      const loc = g.data;
      let lx = loc.x,
        lz = loc.z;
      if (loc.interior) {
        const it = G.LAYOUT.INTERIORS[loc.interior];
        if (it) {
          lx = it.origin.x;
          lz = it.origin.z;
        }
      }
      const d = Math.hypot(P.pos.x - lx, P.pos.z - lz);
      if (g.state === "pending") {
        const near = loc.interior ? inInt && d < 160 : !inInt && d < SPAWN_R;
        if (near && d < spawnD) {
          spawnD = d;
          spawnBest = g;
        }
      } else if (g.state === "active" && g.kind === "location") {
        g.actors = g.actors.filter((a) => !a.removed);
        if (g.actors.length && g.actors.every((a) => a.dead)) {
          g.state = "cleared";
          g.clearedDay = gameDay();
          G.events.emit("locationCleared", loc);
        } else upkeepGroup(g, loc, d);
      } else if (g.state === "cleared" && g.kind === "location") {
        if (gameDay() - g.clearedDay >= RESPAWN_DAYS && d > 300) {
          for (const a of g.actors) G.actors.remove(a);
          g.actors = [];
          g.state = "pending";
          g.clearedDay = null;
          g.restore = null;
          g.deferred = 0;
        } else if (g.restore) {
          const near = loc.interior ? inInt && d < 160 : !inInt && d < SPAWN_R;
          if (near && d < spawnD) {
            spawnD = d;
            spawnBest = g;
          }
        }
      }
    }
    if (spawnBest) {
      const g = spawnBest;
      try {
        if (g.restore) restoreGroup(g);
        else if (g.kind === "location") spawnLocationGroup(g);
        else spawnSettlementGroup(g);
      } catch (e) {
        G.reportError("combat:populate " + g.id, e);
        if (g.state === "pending") g.state = "active";
      }
      popT = 0.25; // keep streaming the rest quickly
    }
    updateRoaming();
  };
  C.clearPopulation = function () {
    C.groups.clear();
    C.roam.groups = [];
    C.roam.n = 0;
    C.roam.lastSpecialDay = -99;
    C.wardens.clear();
    clearSetPieces();
    if (C.navReset) C.navReset();
  };

  /** Public helpers for quests/UI. */
  G.combat.isLocationCleared = (id) => {
    const g = C.groups.get(id);
    return !!g && g.state === "cleared";
  };
  G.combat.locationActors = (id) => {
    const g = C.groups.get(id);
    return g ? g.actors.slice() : [];
  };
  /** Force-spawn a roaming encounter now (debug / quests). */
  G.combat.spawnEncounter = () => spawnRoamGroup();

  // ------------------------------------------------------------------
  // Save / load
  // ------------------------------------------------------------------
  G.save.register("combat", {
    save() {
      const groups = {};
      const snaps = (g) =>
        g.actors
          .filter((a) => !a.removed && !a.stableId && !a.disintegrated)
          .map(C.memberSnap);
      for (const g of C.groups.values()) {
        const e = {};
        if (g.state === "cleared") e.cleared = g.clearedDay;
        if (g.restore)
          e.m = g.restore; // not re-created yet since the last load
        else if (g.state !== "pending" && g.actors.length) {
          // everyone (living and dead) so a partly fought group comes back exactly as it was
          e.m = snaps(g);
          // a fully disintegrated / removed group that was being fought still counts as touched
          if (!e.m.length && g.state === "active") e.m = undefined;
        }
        if (g.deferred && g.state !== "cleared") e.def = g.deferred;
        if (e.cleared !== undefined || (e.m && e.m.length)) groups[g.id] = e;
      }
      // Roaming encounters with someone still alive (or fresh corpses) near the player
      const roam = [];
      for (const g of C.roam.groups) {
        if (
          !g.actors.some(
            (a) => !a.removed && (!a.dead || G.time.elapsed - a.deathT < 300),
          )
        )
          continue;
        const m = snaps(g);
        if (m.length) roam.push({ id: g.id, m });
      }
      const named = {};
      for (const a of C.list) if (a.stableId) named[a.id] = C.actorSaveState(a);
      for (const [id, s] of C.pendingState) if (!named[id]) named[id] = s;
      return {
        rel: C.relOverride,
        groups,
        named,
        roam,
        roamN: C.roam.n,
        special: C.roam.lastSpecialDay,
      };
    },
    load(d) {
      C.relOverride = d.rel || {};
      C.groupSave = d.groups || {};
      C.pendingState = new Map(Object.entries(d.named || {}));
      C.roamSave = Array.isArray(d.roam) ? d.roam : [];
      C.roamSaveN = d.roamN || 0;
      C.roam.lastSpecialDay = typeof d.special === "number" ? d.special : -99;
    },
  });
