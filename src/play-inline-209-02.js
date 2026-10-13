// play-inline-209 02 — anchors
// Lines 15-188 of readable/play-inline-209.pretty.js (statement-aligned).
  const PF = G._pf;

  PF.publish();

  let built = false,
    ready = false;

  function init() {
    const root = new THREE.Group();
    root.name = "poi_financial";
    G.scene.add(root);
    PF.root = root;
    PF.builders.sort((a, b) => a.order - b.order);
    PF.stats = {};
    for (const bd of PF.builders) {
      const t0 = performance.now();
      try {
        bd.fn(PF, G.LAYOUT.getSite(bd.id), root);
      } catch (e) {
        G.reportError("init:poi_financial:" + bd.id, e);
      }
      PF.stats[bd.id] = Math.round(performance.now() - t0);
    }
    root.updateMatrixWorld(true);
    for (const k in PF.cells) PF.cells[k].root.updateMatrixWorld(true);
    PF.publish();
    shareSpawnAnchors();
    built = true;
    if (G.DEBUG) console.log("[poi_financial] build ms", PF.stats);
  }

  /**
   * combat places LOCATIONS[].spawns of interior dungeons at G.map.getAnchor(interiorKey, 'spawnN'), which only
   * reads the map's public anchor table. Share our authored spawn1..6 there (our own interior keys only, never
   * overwriting an existing entry) so robots / shellbacks start at the designed spots instead of random points.
   */
  function shareSpawnAnchors() {
    try {
      if (
        G.isStub("map") ||
        !G.map.anchors ||
        typeof G.map.anchors !== "object"
      )
        return;
      for (const id of ["federal_reserve", "seaport"]) {
        const p = G.pois && G.pois[id];
        if (!p || !p.anchors) continue;
        const key = p.interiorKey || id;
        if (G.map.anchors[key]) continue;
        const o = {};
        for (let i = 1; i <= 6; i++) {
          const v = p.anchors["spawn" + i];
          if (v) o["spawn" + i] = new THREE.Vector3(v.x, v.y, v.z);
        }
        if (p.anchors.boss)
          o.boss = new THREE.Vector3(
            p.anchors.boss.x,
            p.anchors.boss.y,
            p.anchors.boss.z,
          );
        G.map.anchors[key] = o;
      }
    } catch (e) {
      /* map without an anchor table: combat falls back to its own interior points */
    }
  }

  function onInitDone() {
    if (ready) return;
    ready = true;
    PF.publish();
    PF.registerContent();
    PF.spawnProps();
    PF.spawnPickups();
    for (const g of PF.glowQ.splice(0)) PF.makeGlow(g);
    PF.safe("fires", () => PF.startFires());
    for (const fn of PF.onInitDone) PF.safe("initDone", fn);
  }

  let t = 0;
  function update(dt, realDt) {
    if (!built) return;
    t += realDt;
    PF.updateCells();
    const cam = G.camera
      ? G.camera.getWorldPosition(new THREE.Vector3())
      : null;
    for (const a of PF.animators) {
      if (a.c && cam) {
        const dx = a.c.x - cam.x,
          dz = a.c.z - cam.z;
        if (dx * dx + dz * dz > a.r2) continue;
      }
      try {
        a.fn(t, realDt, cam);
      } catch (e) {
        a.fn = function () {};
        G.reportError("update:poi_financial", e);
      }
    }
    if (!G.worldRunning || !G.worldRunning()) return;
    for (const fn of PF.updaters) {
      try {
        fn(dt, realDt);
      } catch (e) {
        G.reportError("update:poi_financial", e);
      }
    }
  }

  G.registerModule({ name: "poi_financial", order: 28, init, update });
  G.events.on("initDone", onInitDone);

  G.events.on("reset", () => {
    PF.npcs = {};
    PF.resetFlags();
    for (const fn of PF.onReset) PF.safe("reset", fn);
  });
  G.events.on("newGame", (o) => {
    if (!ready) onInitDone();
    PF.publish();
    PF.safe("respawnProps", () => PF.respawnMissing());
    for (const fn of PF.onNewGame) PF.safe("newGame", () => fn(o || {}));
    PF.spawnRoster();
  });
  G.events.on("loaded", (d) => {
    if (!ready) onInitDone();
    PF.publish();
    PF.safe("respawnProps", () => PF.respawnMissing());
    PF.spawnRoster();
    for (const fn of PF.onLoaded) PF.safe("loaded", () => fn(d));
  });

  try {
    if (G.save && typeof G.save.register === "function") {
      G.save.register("poi_financial", {
        save() {
          const o = { flags: PF.flags, hooks: {} };
          for (const k in PF.saveHooks) {
            try {
              o.hooks[k] = PF.saveHooks[k].save();
            } catch (e) {
              G.reportError("save:poi_financial", e);
            }
          }
          return o;
        },
        load(d) {
          if (!d) return;
          PF.flags = Object.assign(
            JSON.parse(JSON.stringify(PF.flagDefaults)),
            d.flags || {},
          );
          for (const k in PF.saveHooks) {
            if (!d.hooks || d.hooks[k] === undefined) continue;
            try {
              PF.saveHooks[k].load(d.hooks[k]);
            } catch (e) {
              G.reportError("load:poi_financial", e);
            }
          }
          for (const fn of PF.flagWatch) {
            try {
              fn("*", null);
            } catch (e) {
              /* ignore */
            }
          }
        },
      });
    }
  } catch (e) {
    /* core without save */
  }
