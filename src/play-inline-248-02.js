// play-inline-248 02 — root
// Lines 15-182 of readable/play-inline-248.pretty.js (statement-aligned).
  const PR = G._pr;

  PR.publish();

  let built = false,
    ready = false;

  function init() {
    const root = new THREE.Group();
    root.name = "poi_roosevelt";
    G.scene.add(root);
    PR.root = root;
    PR.builders.sort((a, b) => a.order - b.order);
    PR.stats = {};
    for (const bd of PR.builders) {
      const t0 = performance.now();
      try {
        bd.fn(PR, G.LAYOUT.getSite(bd.id), root);
      } catch (e) {
        G.reportError("init:poi_roosevelt:" + bd.id, e);
      }
      PR.stats[bd.id] = Math.round(performance.now() - t0);
    }
    root.updateMatrixWorld(true);
    for (const k in PR.cells) PR.cells[k].root.updateMatrixWorld(true);
    PR.resetFlags();
    PR.publish();
    built = true;
    if (G.DEBUG) console.log("[poi_roosevelt] build ms", PR.stats);
  }

  function onInitDone() {
    if (ready) return;
    ready = true;
    PR.publish();
    PR.registerContent();
    PR.spawnProps();
    PR.spawnPickups();
    for (const g of PR.glows.splice(0)) {
      // parent to the interior cell the glow sits in (so it hides with the cell)
      let parent = null;
      for (const k in PR.cells) {
        const c = PR.cells[k];
        if (
          Math.abs(g.pos.x - c.origin.x) < 170 &&
          Math.abs(g.pos.z - c.origin.z) < 170
        ) {
          parent = c.root;
          break;
        }
      }
      PR.glow(g.pos, g.color, g.size, parent, {
        intensity: 1.0,
        flicker: 0.15,
      });
    }
    for (const g of PR.glowQ.splice(0)) PR.makeGlow(g);
    for (const f of PR.fires.splice(0)) {
      try {
        if (PR.live("fx") && G.fx.fire) G.fx.fire(f, 0.5);
      } catch (e) {
        /* optional */
      }
    }
    for (const fn of PR.onInitDone) PR.safe("initDone", fn);
  }

  let t = 0;
  const _cam = new THREE.Vector3();
  function update(dt, realDt) {
    if (!built) return;
    t += realDt;
    PR.updateCells();
    const cam = G.camera ? G.camera.getWorldPosition(_cam) : null;
    for (const a of PR.animators) {
      if (a.c && cam) {
        const dx = a.c.x - cam.x,
          dz = a.c.z - cam.z;
        if (dx * dx + dz * dz > a.r2) continue;
      }
      try {
        a.fn(t, realDt, cam);
      } catch (e) {
        a.fn = function () {};
        G.reportError("update:poi_roosevelt", e);
      }
    }
    if (!G.worldRunning || !G.worldRunning()) return;
    for (const fn of PR.updaters) {
      try {
        fn(dt, realDt);
      } catch (e) {
        G.reportError("update:poi_roosevelt", e);
      }
    }
  }

  G.registerModule({ name: "poi_roosevelt", order: 29, init, update });
  G.events.on("initDone", onInitDone);

  G.events.on("reset", () => {
    PR.npcs = {};
    PR.resetFlags();
    for (const fn of PR.onReset) PR.safe("reset", fn);
    for (const fn of PR.flagWatch) {
      try {
        fn("*", null);
      } catch (e) {
        /* ignore */
      }
    }
  });
  G.events.on("newGame", (o) => {
    if (!ready) onInitDone();
    PR.publish();
    PR.safe("respawnProps", () => PR.respawnMissing());
    for (const fn of PR.onNewGame) PR.safe("newGame", () => fn(o || {}));
    PR.spawnRoster();
  });
  G.events.on("loaded", (d) => {
    if (!ready) onInitDone();
    PR.publish();
    PR.safe("respawnProps", () => PR.respawnMissing());
    PR.spawnRoster();
    for (const fn of PR.onLoaded) PR.safe("loaded", () => fn(d));
  });

  try {
    if (G.save && typeof G.save.register === "function") {
      G.save.register("poi_roosevelt", {
        save() {
          const o = { flags: PR.flags, hooks: {} };
          for (const k in PR.saveHooks) {
            try {
              o.hooks[k] = PR.saveHooks[k].save();
            } catch (e) {
              G.reportError("save:poi_roosevelt", e);
            }
          }
          return o;
        },
        load(d) {
          if (!d) return;
          PR.flags = Object.assign(
            JSON.parse(JSON.stringify(PR.flagDefaults)),
            d.flags || {},
          );
          for (const k in PR.saveHooks) {
            if (!d.hooks || d.hooks[k] === undefined) continue;
            try {
              PR.saveHooks[k].load(d.hooks[k]);
            } catch (e) {
              G.reportError("load:poi_roosevelt", e);
            }
          }
          for (const fn of PR.flagWatch) {
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
