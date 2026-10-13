// play-inline-368 02 — anchors
// Lines 16-198 of readable/play-inline-368.pretty.js (statement-aligned).
  const PF = G._pws;

  PF.publish();

  let built = false,
    ready = false;

  function init() {
    const root = new THREE.Group();
    root.name = "poi_wallst";
    G.scene.add(root);
    PF.root = root;
    PF.builders.sort((a, b) => a.order - b.order);
    PF.stats = {};
    for (const bd of PF.builders) {
      const t0 = performance.now();
      try {
        bd.fn(PF, G.LAYOUT.getSite(bd.id), root);
      } catch (e) {
        G.reportError("init:poi_wallst:" + bd.id, e);
      }
      PF.stats[bd.id] = Math.round(performance.now() - t0);
    }
    root.updateMatrixWorld(true);
    for (const k in PF.cells) PF.cells[k].root.updateMatrixWorld(true);
    PF.publish();
    shareAnchors();
    built = true;
    if (G.DEBUG) console.log("[poi_wallst] build ms", PF.stats);
  }

  /**
   * combat places a dungeon's LOCATIONS[].spawns at G.map.getAnchor(interiorKey, 'spawnN') and its raider boss at
   * G.landmarks.getAnchor(siteId, 'boss'). Share our authored anchors there (own keys only, never overwriting).
   */
  function shareAnchors() {
    for (const id of ["singer_building", "forty_wall"]) {
      const p = G.pois && G.pois[id];
      if (!p || !p.anchors) continue;
      const key = p.interiorKey || id;
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
      try {
        if (
          !G.isStub("map") &&
          G.map.anchors &&
          typeof G.map.anchors === "object" &&
          !G.map.anchors[key]
        )
          G.map.anchors[key] = o;
      } catch (e) {
        /* optional */
      }
      try {
        if (!G.isStub("landmarks") && G.landmarks && !G.landmarks[id]) {
          const a = {};
          if (o.boss) {
            a.boss = o.boss.clone();
            a.boss.yaw = p.anchors.boss.yaw || 0;
          }
          G.landmarks[id] = { id, anchors: a, owner: "poi_wallst" };
        }
      } catch (e) {
        /* optional */
      }
    }
  }

  function onInitDone() {
    if (ready) return;
    ready = true;
    PF.publish();
    shareAnchors();
    PF.registerContent();
    PF.spawnProps();
    PF.spawnPickups();
    for (const g of PF.glowQ.splice(0)) PF.makeGlow(g);
    for (const fn of PF.onInitDone) PF.safe("initDone", fn);
  }

  let t = 0;
  const _cam = new THREE.Vector3();
  function update(dt, realDt) {
    if (!built) return;
    t += realDt;
    PF.updateCells();
    const cam = G.camera ? G.camera.getWorldPosition(_cam) : null;
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
        G.reportError("update:poi_wallst", e);
      }
    }
    if (!G.worldRunning || !G.worldRunning()) return;
    for (const fn of PF.updaters) {
      try {
        fn(dt, realDt);
      } catch (e) {
        G.reportError("update:poi_wallst", e);
      }
    }
  }

  G.registerModule({ name: "poi_wallst", order: 29, init, update });
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
      G.save.register("poi_wallst", {
        save() {
          const o = { flags: PF.flags, hooks: {} };
          for (const k in PF.saveHooks) {
            try {
              o.hooks[k] = PF.saveHooks[k].save();
            } catch (e) {
              G.reportError("save:poi_wallst", e);
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
              G.reportError("load:poi_wallst", e);
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
