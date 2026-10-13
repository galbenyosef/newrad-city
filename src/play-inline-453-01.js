// play-inline-453 01 — list
// Lines 8-202 of readable/play-inline-453.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.props;
  const X = P._;

  // ---------------- public helpers ----------------
  P.stats = function () {
    return {
      scatter: X.scatterStats || null,
      cars: X.CARS.list.length,
      carsBurning: X.CARS.active.size,
      spawned: X.SPAWNED.length,
      containers:
        X.SC_CONTAINERS.length + X.SPAWNED.filter((r) => r.cdef).length,
      explosives: X.EXPLOSIVES.length,
      turrets: X.TURRETS.length,
      glows: X.glow ? X.glow.n : 0,
      doorGuard: X.doorGuard || null,
      protos: X.protoStats(),
    };
  };
  P.getContainers = function () {
    return X.SC_CONTAINERS.map((c) => ({
      id: c.id,
      name: c.name,
      pos: c.pos.clone(),
      container: c.container,
    })).concat(
      X.SPAWNED.filter((r) => r.cdef).map((r) => ({
        id: r.cdef.id,
        name: r.cdef.name,
        pos: r.ipos.clone(),
        container: r.container,
      })),
    );
  };
  P.nearestCar = function (pos, maxDist) {
    const list = X.carsNear(pos, maxDist || 30);
    list.sort((a, b) => a.d - b.d);
    return list.length
      ? {
          id: list[0].car.id,
          kind: list[0].car.kind,
          pos: new THREE.Vector3(list[0].car.x, list[0].car.y, list[0].car.z),
          state: list[0].car.state,
          dist: list[0].d,
        }
      : null;
  };
  /** Place a car (alias of spawn('car')). */
  P.addCar = function (kind, x, z, yaw, o) {
    return P.spawn("car", Object.assign({ kind, x, z, yaw }, o || {}));
  };
  P.billboards = function () {
    return (X.BILLBOARDS || []).map((b) => ({
      brand: b.brand,
      x: b.x,
      z: b.z,
    }));
  };

  // ---------------- fire sound loops near the player ----------------
  const loops = new Map();
  let loopTimer = 0;
  function updateFireSounds(realDt) {
    loopTimer -= realDt;
    if (loopTimer > 0) return;
    loopTimer = 0.5;
    if (G.isStub("sfx")) return;
    const p = G.player.pos;
    const near = [];
    for (const f of X.FIRE_SPOTS) {
      if (!f.h || !f.h.alive) continue;
      const d = Math.hypot(f.x - p.x, f.z - p.z);
      if (d < 14) near.push({ f, d });
    }
    near.sort((a, b) => a.d - b.d);
    const want = new Set(near.slice(0, 3).map((n) => n.f));
    for (const [f, h] of loops)
      if (!want.has(f)) {
        try {
          h && h.stop && h.stop();
        } catch (e) {
          /* ignore */
        }
        loops.delete(f);
      }
    for (const f of want)
      if (!loops.has(f))
        loops.set(
          f,
          X.sfx("fire_loop", {
            pos: new THREE.Vector3(f.x, f.y, f.z),
            loop: true,
            volume: 0.45,
          }),
        );
  }
  function stopLoops() {
    for (const [, h] of loops) {
      try {
        h && h.stop && h.stop();
      } catch (e) {
        /* ignore */
      }
    }
    loops.clear();
  }

  // ---------------- module ----------------
  G.registerModule({
    name: "props",
    order: 30,
    init(G) {
      const t0 = performance.now();
      X.buildAtlas();
      const root = new THREE.Group();
      root.name = "props_root";
      G.scene.add(root);
      X.root = root;
      X.spawnRoot = new THREE.Group();
      X.spawnRoot.name = "props_spawned";
      root.add(X.spawnRoot);
      X.glow = new X.GlowField(4096);
      root.add(X.glow.points);
      X.flames = new X.FlameField();
      root.add(X.flames.group);
      // city dressing (static batches + car placements)
      const st = X.safe(() => X.scatterCity(root), "scatter");
      X.safe(() => X.buildCars(root), "cars");
      X._initDone = true;
      X.initMs = Math.round(performance.now() - t0);
      if (G.DEBUG || G.SMOKE)
        console.log(
          "[props] init " + X.initMs + "ms",
          JSON.stringify(st && st.batches),
          "cars=" + X.CARS.list.length,
          "containers=" + X.SC_CONTAINERS.length,
        );
    },
    update(dt, realDt) {
      const time = G.time.elapsed;
      if (X.glow)
        X.glow.update(
          time,
          X.nightFactor(),
          G.renderer ? G.renderer.getSize(new THREE.Vector2()).y : 720,
        );
      if (X.flames) X.flames.update(time);
      X.updateCars(dt);
      X.updateNearCars(realDt);
      X.updateSpawn(dt, realDt);
      updateFireSounds(realDt);
    },
  });

  // ---------------- lifecycle ----------------
  G.on("reset", () => {
    X.safe(() => {
      stopLoops();
      X.onReset();
    }, "reset");
  });
  // Containers are created once every module has initialised (rpg is order 40), before the
  // first reset, so rpg treats them as static world containers (pristine on new game, saved by id).
  // The door guard runs first: it clears the aprons of doors other modules added after the city was
  // dressed (and drops the containers of anything it removes) before they are registered.
  G.on("initDone", () => {
    X.containersReady = true;
    X.safe(() => X.runDoorGuard("initDone"), "doorGuard");
    X.safe(() => X.ensureContainers(), "initDone");
  });
  G.on("newGame", () => {
    X.safe(() => X.runDoorGuard("newGame"), "doorGuard");
    X.safe(() => X.ensureContainers(), "newGame");
  });
  G.on("loaded", () => {
    X.safe(() => X.ensureContainers(), "loaded");
  });
  // explosions announced by other modules (fx / combat may emit this)
  G.on("explosion", (pos, radius, damage) => {
    if (!pos || typeof pos.x !== "number") return;
    X.safe(
      () => P.damageAt(pos, damage || 60, { radius: radius || 5 }),
      "explosionEvent",
    );
  });

  G.save.register("props", {
    save: () => X.collectSave(),
    load: (d) => {
      X.safe(() => X.applySave(d), "load");
    },
  });
