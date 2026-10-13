// play-inline-519 04 — pos
// Lines 1055-1117 of readable/play-inline-519.pretty.js (statement-aligned).
  K.system({
    name: "fauna",
    order: 10,
    init() {
      buildBirdMeshes();
      buildRatMesh();
      // Gunfire & explosions scatter ground birds; kills attract crows
      G.events.on("weaponFired", () => {
        if (K.playerOk()) scareNear(G.player.pos.x, G.player.pos.z, 75);
      });
      G.events.on("explosion", (pos) => {
        if (pos && pos.x !== undefined) scareNear(pos.x, pos.z, 120);
      });
      G.events.on("actorKilled", (a) => {
        try {
          if (!a || !a.pos || K.isInterior(a.pos.x)) return;
          corpses.push({ x: a.pos.x, y: a.pos.y, z: a.pos.z, t: K.now() });
          if (corpses.length > 4) corpses.shift();
        } catch (e) {
          /* ignore */
        }
      });
    },
    reset() {
      clearBirds();
      clearRats();
      nextFlockT = 0;
      lastPigeonT = lastCrowT = lastGullT = -99;
    },
    update(dt) {
      updateBirds(dt);
      updateRats(dt);
    },
  });

  // ------------------------------------------------------------------
  // Internal API (tests / other ambient files / debug)
  // ------------------------------------------------------------------
  K.fauna = {
    spawnFlock(kind, x, y, z, n, opts) {
      return spawnFlock(kind, x, y, z, n || 8, opts);
    },
    scare: scareNear,
    spawnRat,
    /** A rat swarm around (x,z): used by the "rat's nest" vignette. */
    swarm(n) {
      let k = 0;
      for (let i = 0; i < n; i++) if (spawnRat()) k++;
      return k;
    },
    stats: () => ({
      birds: activeBirds,
      flocks: FLOCKS.filter((f) => f.active).map(
        (f) => f.kind + ":" + f.members.length,
      ),
      rats: activeRats,
    }),
    clear() {
      clearBirds();
      clearRats();
    },
    birdPos: (i) => ({ x: px[i], y: py[i], z: pz[i], mode: mode[i] }),
  };
