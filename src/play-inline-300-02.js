// play-inline-300 02 — root
// Lines 15-151 of readable/play-inline-300.pretty.js (statement-aligned).
  const PM = G._pm2;

  PM.publish();

  let built = false,
    ready = false;

  function init() {
    const root = new THREE.Group();
    root.name = "poi_midtown2";
    G.scene.add(root);
    PM.root = root;
    PM.builders.sort((a, b) => a.order - b.order);
    PM.stats = {};
    for (const bd of PM.builders) {
      const t0 = performance.now();
      try {
        bd.fn(PM, G.LAYOUT.getSite(bd.id), root);
      } catch (e) {
        G.reportError("init:poi_midtown2:" + bd.id, e);
      }
      PM.stats[bd.id] = Math.round(performance.now() - t0);
    }
    PM.safe("kitGlows", () => PM.flushKitGlows && PM.flushKitGlows());
    root.updateMatrixWorld(true);
    for (const k in PM.cells) PM.cells[k].root.updateMatrixWorld(true);
    PM.publish();
    built = true;
    if (G.DEBUG) console.log("[poi_midtown2] build ms", PM.stats);
  }

  function onInitDone() {
    if (ready) return;
    ready = true;
    PM.publish();
    PM.registerContent();
    PM.spawnProps();
    PM.spawnPickups();
    for (const g of PM.glowQ.splice(0)) PM.makeGlow(g);
    for (const fn of PM.onInitDone) PM.safe("initDone", fn);
  }

  let t = 0;
  function update(dt, realDt) {
    if (!built) return;
    t += realDt;
    PM.updateCells();
    const cam = G.camera
      ? G.camera.getWorldPosition(new THREE.Vector3())
      : null;
    for (const a of PM.animators) {
      if (a.c && cam) {
        const dx = a.c.x - cam.x,
          dz = a.c.z - cam.z;
        if (dx * dx + dz * dz > a.r2) continue;
      }
      try {
        a.fn(t, realDt, cam);
      } catch (e) {
        a.fn = function () {};
        G.reportError("update:poi_midtown2", e);
      }
    }
    if (!G.worldRunning || !G.worldRunning()) return;
    for (const fn of PM.updaters) {
      try {
        fn(dt, realDt);
      } catch (e) {
        G.reportError("update:poi_midtown2", e);
      }
    }
  }

  G.registerModule({ name: "poi_midtown2", order: 29.4, init, update });
  G.events.on("initDone", onInitDone);

  G.events.on("reset", () => {
    PM.npcs = {};
    PM.resetFlags();
    for (const fn of PM.onReset) PM.safe("reset", fn);
  });
  G.events.on("newGame", (o) => {
    if (!ready) onInitDone();
    PM.publish();
    PM.safe("respawnProps", () => PM.respawnMissing());
    for (const fn of PM.onNewGame) PM.safe("newGame", () => fn(o || {}));
    PM.spawnRoster();
  });
  G.events.on("loaded", (d) => {
    if (!ready) onInitDone();
    PM.publish();
    PM.safe("respawnProps", () => PM.respawnMissing());
    PM.spawnRoster();
    for (const fn of PM.onLoaded) PM.safe("loaded", () => fn(d));
  });

  try {
    if (G.save && typeof G.save.register === "function") {
      G.save.register("poi_midtown2", {
        save() {
          const o = { flags: PM.flags, hooks: {} };
          for (const k in PM.saveHooks) {
            try {
              o.hooks[k] = PM.saveHooks[k].save();
            } catch (e) {
              G.reportError("save:poi_midtown2", e);
            }
          }
          return o;
        },
        load(d) {
          if (!d) return;
          PM.flags = Object.assign(
            JSON.parse(JSON.stringify(PM.flagDefaults)),
            d.flags || {},
          );
          for (const k in PM.saveHooks) {
            if (!d.hooks || d.hooks[k] === undefined) continue;
            try {
              PM.saveHooks[k].load(d.hooks[k]);
            } catch (e) {
              G.reportError("load:poi_midtown2", e);
            }
          }
          for (const fn of PM.flagWatch) {
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
