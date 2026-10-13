// play-inline-259 02 — root
// Lines 15-174 of readable/play-inline-259.pretty.js (statement-aligned).
  const PF = G._pbr;

  PF.publish();

  let built = false,
    ready = false;

  /** Lib helpers (lamp posts, string lights…) queue plain glows in PF.glows: parent interior ones to their cell. */
  function flushLibGlows() {
    for (const g of PF.glows.splice(0)) {
      let parent = null;
      if (g.pos.x >= 2500) {
        for (const k in PF.cells) {
          const c = PF.cells[k];
          if (
            Math.abs(g.pos.x - c.origin.x) < 170 &&
            Math.abs(g.pos.z - c.origin.z) < 170
          ) {
            parent = c.root;
            break;
          }
        }
      }
      PF.glow(g.pos, g.color, g.size, parent, {
        intensity: g.intensity || 1.2,
      });
    }
  }

  function init() {
    const root = new THREE.Group();
    root.name = "poi_bridges";
    G.scene.add(root);
    PF.root = root;
    PF.builders.sort((a, b) => a.order - b.order);
    PF.stats = {};
    for (const bd of PF.builders) {
      const t0 = performance.now();
      try {
        bd.fn(PF, G.LAYOUT.getSite(bd.id), root);
      } catch (e) {
        G.reportError("init:poi_bridges:" + bd.id, e);
      }
      PF.stats[bd.id] = Math.round(performance.now() - t0);
    }
    root.updateMatrixWorld(true);
    for (const k in PF.cells) PF.cells[k].root.updateMatrixWorld(true);
    flushLibGlows();
    PF.publish();
    built = true;
    if (G.DEBUG) console.log("[poi_bridges] build ms", PF.stats);
  }

  function onInitDone() {
    if (ready) return;
    ready = true;
    PF.publish();
    PF.registerContent();
    PF.spawnProps();
    PF.spawnPickups();
    flushLibGlows();
    for (const g of PF.glowQ.splice(0)) PF.makeGlow(g);
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
        G.reportError("update:poi_bridges", e);
      }
    }
    if (!G.worldRunning || !G.worldRunning()) return;
    for (const fn of PF.updaters) {
      try {
        fn(dt, realDt);
      } catch (e) {
        G.reportError("update:poi_bridges", e);
      }
    }
  }

  G.registerModule({ name: "poi_bridges", order: 29, init, update });
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
      G.save.register("poi_bridges", {
        save() {
          const o = { flags: PF.flags, hooks: {} };
          for (const k in PF.saveHooks) {
            try {
              o.hooks[k] = PF.saveHooks[k].save();
            } catch (e) {
              G.reportError("save:poi_bridges", e);
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
              G.reportError("load:poi_bridges", e);
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
