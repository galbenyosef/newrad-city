/* src/poi_chelsea/90_main.js */
/* =====================================================================
 * NEW RAD CITY — POI CHELSEA — module registration (order 29).
 * Runs every POI builder in init (static geometry, colliders, doors),
 * registers content (items, terminals, dialogue, quests) and persistent
 * props at initDone, spawns named NPCs on newGame / after loading,
 * drives interior-cell visibility, animations and area triggers, and
 * saves the module flags under 'poi_chelsea'.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pch) return;
  const PF = G._pch;

  PF.publish();

  let built = false,
    ready = false;

  function init() {
    const root = new THREE.Group();
    root.name = "poi_chelsea";
    G.scene.add(root);
    PF.root = root;
    PF.builders.sort((a, b) => a.order - b.order);
    PF.stats = {};
    for (const bd of PF.builders) {
      const t0 = performance.now();
      try {
        bd.fn(PF, G.LAYOUT.getSite(bd.id), root);
      } catch (e) {
        G.reportError("init:poi_chelsea:" + bd.id, e);
      }
      PF.stats[bd.id] = Math.round(performance.now() - t0);
    }
    root.updateMatrixWorld(true);
    for (const k in PF.cells) PF.cells[k].root.updateMatrixWorld(true);
    PF.publish();
    built = true;
    if (G.DEBUG) console.log("[poi_chelsea] build ms", PF.stats);
  }

  function onInitDone() {
    if (ready) return;
    ready = true;
    PF.publish();
    PF.registerContent();
    PF.spawnProps();
    PF.spawnPickups();
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
        G.reportError("update:poi_chelsea", e);
      }
    }
    if (!G.worldRunning || !G.worldRunning()) return;
    for (const fn of PF.updaters) {
      try {
        fn(dt, realDt);
      } catch (e) {
        G.reportError("update:poi_chelsea", e);
      }
    }
  }

  G.registerModule({ name: "poi_chelsea", order: 29, init, update });
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
      G.save.register("poi_chelsea", {
        save() {
          const o = { flags: PF.flags, hooks: {} };
          for (const k in PF.saveHooks) {
            try {
              o.hooks[k] = PF.saveHooks[k].save();
            } catch (e) {
              G.reportError("save:poi_chelsea", e);
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
              G.reportError("load:poi_chelsea", e);
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
})();
