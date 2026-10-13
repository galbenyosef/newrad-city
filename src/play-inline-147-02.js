// play-inline-147 02 — root
// Lines 15-197 of readable/play-inline-147.pretty.js (statement-aligned).
  const LB = G._lb;

  LB.publish(); // make sure G.landmarks exists with getAnchor even before init

  let root = null;
  let built = false;
  const readyDone = { v: false };

  function init() {
    root = new THREE.Group();
    root.name = "landmarks_b";
    G.scene.add(root);
    LB.root = root;
    const L = G.LAYOUT;
    LB.builders.sort((a, b) => a.order - b.order);
    LB.stats = {};
    for (const bd of LB.builders) {
      const t0 = performance.now();
      try {
        const site = L.getSite(bd.id);
        bd.fn(LB, site, root);
      } catch (e) {
        G.reportError("init:landmarks_b", e);
      }
      LB.stats[bd.id] = Math.round(performance.now() - t0);
    }
    root.updateMatrixWorld(true);
    // per-landmark triangle / draw-call stats (debug + perf budgeting)
    LB.tris = {};
    for (const id in LB.entries) {
      const e = LB.entries[id];
      if (!e.root || LB.tris[e.id] !== undefined) continue;
      let t = 0,
        m = 0;
      e.root.traverse((o) => {
        if (o.isMesh && o.geometry) {
          m++;
          t +=
            (o.geometry.index
              ? o.geometry.index.count
              : o.geometry.attributes.position.count) / 3;
        }
      });
      LB.tris[e.id] = { tris: Math.round(t), meshes: m };
    }
    LB.publish();
    built = true;
    if (G.DEBUG) console.log("[landmarks_b] build times (ms)", LB.stats);
  }

  // ---- runtime extras once everything exists ----------------------
  function onReady() {
    if (readyDone.v) return;
    readyDone.v = true;
    LB.publish();
    // fires (burning barrels, braziers)
    if (!G.isStub("fx")) {
      for (const p of LB.fires) {
        try {
          G.fx.fire(p.clone(), 0.6);
        } catch (e) {
          /* optional */
        }
      }
      for (const gl of LB.glows) {
        try {
          const s = G.fx.glowSprite(gl.pos.clone(), gl.color, gl.size, gl.opts);
          if (s && s.isObject3D && !s.parent) G.scene.add(s);
        } catch (e) {
          /* optional */
        }
      }
    }
    for (const fn of LB.onReady) {
      try {
        fn();
      } catch (e) {
        G.reportError("event:initDone", e);
      }
    }
  }

  // ---- animation --------------------------------------------------
  const cam = new THREE.Vector3();
  let t = 0,
    gooMat = null;
  function update(dt, realDt) {
    if (!built) return;
    t += realDt;
    if (G.camera) G.camera.getWorldPosition(cam);
    // shared GPU-side animation: waving flags (vertex shader time) and the slowly drifting toxic sludge
    if (LB.flagTime) LB.flagTime.value = t;
    if (!gooMat) {
      try {
        gooMat = LB.mat("goo");
      } catch (e) {
        gooMat = false;
      }
    }
    if (gooMat && gooMat.map) {
      gooMat.map.offset.set((t * 0.011) % 1, (t * 0.007) % 1);
    }
    for (const a of LB.animators) {
      if (a.c) {
        const dx = a.c.x - cam.x,
          dz = a.c.z - cam.z;
        if (dx * dx + dz * dz > a.r2) continue;
      }
      try {
        a.fn(t, realDt, cam);
      } catch (e) {
        a.fn = function () {};
        G.reportError("update:landmarks_b", e);
      }
    }
  }

  G.registerModule({ name: "landmarks_b", order: 25, init, update });
  G.events.on("initDone", onReady);
  // ---- lifecycle (CONTRACT §0.5): dynamic state cleared on 'reset', rebuilt on 'newGame' / restored on 'loaded' ----
  const runAll = (list, tag, arg) => {
    for (const fn of list) {
      try {
        fn(arg);
      } catch (e) {
        G.reportError(tag, e);
      }
    }
  };
  G.events.on("reset", (o) => runAll(LB.onReset, "event:reset", o));
  G.events.on("newGame", (o) => {
    LB.publish();
    if (readyDone.v) {
      try {
        LB.respawnMissing();
      } catch (e) {
        G.reportError("event:newGame", e);
      }
    }
    runAll(LB.onNewGame, "event:newGame", o);
  });
  G.events.on("loaded", (d) => {
    LB.publish();
    if (readyDone.v) {
      try {
        LB.respawnMissing();
      } catch (e) {
        G.reportError("event:loaded", e);
      }
    }
    runAll(LB.onLoaded, "event:loaded", d);
  });
  // One save block for every stateful feature (toll gate, Liberty defenses...). load() runs after 'reset'.
  try {
    if (G.save && typeof G.save.register === "function") {
      G.save.register("landmarks_b", {
        save() {
          const o = {};
          for (const k in LB.saveHooks) {
            try {
              o[k] = LB.saveHooks[k].save();
            } catch (e) {
              G.reportError("save:landmarks_b", e);
            }
          }
          return o;
        },
        load(d) {
          if (!d) return;
          for (const k in LB.saveHooks) {
            if (d[k] === undefined) continue;
            try {
              LB.saveHooks[k].load(d[k]);
            } catch (e) {
              G.reportError("load:landmarks_b", e);
            }
          }
        },
      });
    }
  } catch (e) {
    /* core without save */
  }
