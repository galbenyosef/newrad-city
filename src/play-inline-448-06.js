// play-inline-448 06 — car
// Lines 1462-1778 of readable/play-inline-448.pretty.js (statement-aligned).
  function makePool(pr, capacity, name) {
    const m = new THREE.InstancedMesh(carGeo(pr), X.carMaterial(), capacity);
    m.name = name;
    m.castShadow = true;
    m.receiveShadow = true;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < capacity; i++) {
      m.setMatrixAt(i, ZERO);
      m.setColorAt(i, WHITE);
    }
    m.count = 0;
    return { pr, mesh: m, meshes: { car: m }, capacity, n: 0 };
  }
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const _burnt = new THREE.Color();
  function writeSlot(slot, m, car, hidden) {
    const mesh = slot.pool.mesh;
    mesh.setMatrixAt(slot.i, hidden ? ZERO : m);
    if (car.state === "burnt")
      mesh.setColorAt(
        slot.i,
        _burnt.setRGB(-BURNT_PAINT.r, -BURNT_PAINT.g, -BURNT_PAINT.b),
      );
    else mesh.setColorAt(slot.i, car.paint);
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }
  /**
   * Two representations per car: a low-detail instance in its chunk pool
   * ("far") and — while within NEAR_R of the camera — a full-detail instance
   * in a small shared pool ("near"). Only one is visible at a time.
   */
  /**
   * Three representations per car, only one visible at a time:
   *   near (≤ NEAR_R): full-detail model in a small shared pool per prototype (+ shadows)
   *   mid  (≤ MID_R):  ~320-tri twin in a shared pool per kind
   *   far:             ~90-tri twin in its 400 m chunk pool (always allocated; zero-scaled while near/mid)
   * Pools are re-assigned 5×/s around the camera.
   */
  function writeInstance(car) {
    const a = car.anim;
    const m = carMatrix(car, a ? a.y : 0, a ? a.roll : 0, a ? a.pitch : 0);
    if (car.near) writeSlot(car.near, m, car, car.removed);
    if (car.loDy) m.elements[13] += car.loDy;
    if (car.mid) writeSlot(car.mid, m, car, car.removed);
    if (car.far)
      writeSlot(car.far, m, car, car.removed || !!car.near || !!car.mid);
    if (car.loDy) m.elements[13] -= car.loDy;
  }
  X.writeCar = writeInstance;
  function farProto(car) {
    return X.proto("carvlo_" + car.kind, 0);
  }

  /** Build instanced meshes for all queued cars (called once in init). */
  X.buildCars = function (parent) {
    const root = new THREE.Group();
    root.name = "props_cars";
    parent.add(root);
    CARS.root = root;
    const buckets = new Map();
    for (const car of CARS.list) {
      if (car.removed) continue; // towed away before the build (Army posts): no instance slot
      car.loDy = car.pr.variant >= 1 ? LO_DY[car.kind] || -0.14 : 0;
      const key =
        Math.floor(car.x / CHUNK) +
        "," +
        Math.floor(car.z / CHUNK) +
        "|" +
        car.kind;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(car);
    }
    const chunkGroups = new Map();
    for (const [key, cars] of buckets) {
      const ck = key.split("|")[0];
      let cg = chunkGroups.get(ck);
      if (!cg) {
        cg = new THREE.Group();
        cg.name = "props_cars_" + ck;
        root.add(cg);
        chunkGroups.set(ck, cg);
        const [cx, cz] = ck.split(",").map(Number);
        G.world.addLOD(
          cg,
          380 + CHUNK * 0.7,
          new THREE.Vector3((cx + 0.5) * CHUNK, 0, (cz + 0.5) * CHUNK),
        );
      }
      const pool = makePool(farProto(cars[0]), cars.length, "cars_" + key);
      for (const car of cars) car.far = { pool, i: pool.n++ };
      pool.mesh.count = pool.n;
      pool.mesh.castShadow = false;
      cg.add(pool.mesh);
      for (const car of cars) writeInstance(car);
      pool.mesh.computeBoundingSphere();
    }
    CARS.built = true;
    CARS.dynPools = new Map();
    CARS.nearPools = new Map();
    CARS.midPools = new Map();
  };
  function placeDynamic(car) {
    car.loDy = car.pr.variant >= 1 ? LO_DY[car.kind] || -0.14 : 0;
    const fp = farProto(car);
    let pool = CARS.dynPools.get(fp.id);
    if (!pool || pool.n >= pool.capacity) {
      pool = makePool(fp, 24, "cars_dyn_" + fp.id);
      pool.mesh.frustumCulled = false;
      pool.mesh.castShadow = false;
      CARS.root.add(pool.mesh);
      CARS.dynPools.set(fp.id, pool);
    }
    car.far = { pool, i: pool.n++ };
    pool.mesh.count = pool.n;
    writeInstance(car);
    CARS.nearDirty = true;
  }
  // ---------------- near / mid pool management ----------------
  const NEAR_R = 42,
    NEAR_CAP = 24,
    MID_R = 135,
    MID_CAP = 110;
  let nearTimer = 0;
  const _cp = new THREE.Vector3();
  function sharedPool(map, pr, cap, name, shadow) {
    let pool = map.get(pr.id);
    if (!pool) {
      pool = makePool(pr, cap, name + pr.id);
      pool.mesh.frustumCulled = false;
      pool.mesh.castShadow = shadow;
      CARS.root.add(pool.mesh);
      map.set(pr.id, pool);
    }
    return pool;
  }
  X.updateNearCars = function (realDt) {
    if (!CARS.built) return;
    nearTimer -= realDt;
    if (nearTimer > 0 && !CARS.nearDirty) return;
    nearTimer = 0.2;
    CARS.nearDirty = false;
    G.camera.getWorldPosition(_cp);
    const cand = [];
    const R = MID_R;
    const x0 = Math.floor((_cp.x - R) / 20),
      x1 = Math.floor((_cp.x + R) / 20),
      z0 = Math.floor((_cp.z - R) / 20),
      z1 = Math.floor((_cp.z + R) / 20);
    for (let gx = x0; gx <= x1; gx++)
      for (let gz = z0; gz <= z1; gz++) {
        const arr = CARS.grid.get(gx + "," + gz);
        if (!arr) continue;
        for (const car of arr) {
          if (car.removed) continue;
          const d = Math.hypot(car.x - _cp.x, car.z - _cp.z);
          if (d < R) cand.push({ car, d });
        }
      }
    cand.sort((a, b) => a.d - b.d);
    for (const pool of CARS.nearPools.values()) pool.n = 0;
    for (const pool of CARS.midPools.values()) pool.n = 0;
    const was = CARS.nearSet || new Set(),
      now = new Set();
    for (const { car, d } of cand) {
      car.near = null;
      car.mid = null;
      if (d < NEAR_R) {
        const pool = sharedPool(
          CARS.nearPools,
          car.pr,
          NEAR_CAP,
          "cars_near_",
          true,
        );
        if (pool.n < pool.capacity) {
          car.near = { pool, i: pool.n++ };
          now.add(car);
          continue;
        }
      }
      const pool = sharedPool(
        CARS.midPools,
        X.proto("carlo_" + car.kind, 0),
        MID_CAP,
        "cars_mid_",
        false,
      );
      if (pool.n < pool.capacity) {
        car.mid = { pool, i: pool.n++ };
        now.add(car);
      }
    }
    for (const car of was)
      if (!now.has(car)) {
        car.near = null;
        car.mid = null;
        writeInstance(car);
      }
    for (const car of now) writeInstance(car);
    for (const pool of CARS.nearPools.values()) pool.mesh.count = pool.n;
    for (const pool of CARS.midPools.values()) pool.mesh.count = pool.n;
    CARS.nearSet = now;
  };
  /** Hide a car (removes collider) — used for session-scoped spawned cars on reset. */
  X.removeCar = function (car) {
    if (car.collider) {
      G.world.removeCollider(car.collider);
      car.collider = null;
    }
    stopCarFx(car);
    car.removed = true;
    writeInstance(car);
    CARS.nearDirty = true;
    CARS.active.delete(car);
    const gk = Math.floor(car.x / 20) + "," + Math.floor(car.z / 20);
    const arr = CARS.grid.get(gk);
    if (arr) {
      const i = arr.indexOf(car);
      if (i >= 0) arr.splice(i, 1);
    }
    CARS.byId.delete(car.id);
  };

  /** Cars whose footprint is within r of p. */
  X.carsNear = function (p, r) {
    const out = [];
    const x0 = Math.floor((p.x - r - 6) / 20),
      x1 = Math.floor((p.x + r + 6) / 20),
      z0 = Math.floor((p.z - r - 6) / 20),
      z1 = Math.floor((p.z + r + 6) / 20);
    for (let gx = x0; gx <= x1; gx++)
      for (let gz = z0; gz <= z1; gz++) {
        const arr = CARS.grid.get(gx + "," + gz);
        if (!arr) continue;
        for (const car of arr) {
          if (car.removed) continue;
          // distance from p to the car's oriented footprint
          const dx = p.x - car.x,
            dz = p.z - car.z,
            c = Math.cos(-car.yaw),
            s = Math.sin(-car.yaw);
          const lx = dx * c - dz * s,
            lz = dx * s + dz * c;
          const qx = Math.max(0, Math.abs(lx) - car.size[0] / 2),
            qz = Math.max(0, Math.abs(lz) - car.size[1] / 2);
          const dy = Math.max(
            0,
            (p.y !== undefined ? p.y : car.y) - (car.y + car.size[2]),
            car.y - (p.y !== undefined ? p.y : car.y),
          );
          const d = Math.hypot(qx, qz, dy);
          if (d <= r) out.push({ car, d });
        }
      }
    return out;
  };

  // ------------------------------------------------------------------
  // Damage → fire → explosion
  // ------------------------------------------------------------------
  X.damageCar = function (car, dmg, info) {
    if (!car || car.removed || car.state === "burnt" || !car.explodable)
      return false;
    car.hp -= dmg;
    // hit feedback: sparks on metal
    if (car.state === "intact" && car.hp < car.maxHp * 0.5 && !car.smoke) {
      car.smoke = X.flames
        ? X.flames.add(
            car.x + Math.sin(car.yaw) * -car.size[1] * 0.35,
            car.y + car.size[2] * 0.7,
            car.z + Math.cos(car.yaw) * -car.size[1] * 0.35,
            0.6,
            { flames: 0, smokeCount: 5, smokeScale: 0.6 },
          )
        : null;
    }
    if (car.hp <= 0 && car.state === "intact") {
      car.state = "burning";
      car.fuse = info && info.instant ? 0.15 : 2.5 + Math.random() * 2.5;
      const fp = carPoint(car, 0, 0.75, -car.size[1] * 0.33);
      car.fire = X.flames
        ? X.flames.add(fp.x, fp.y, fp.z, 1.1, { flames: 10, smokeCount: 6 })
        : null;
      car.fireGlow = X.glow
        ? X.glow.add(fp.x, fp.y + 0.6, fp.z, 0xff8a3a, 6, 0.3)
        : -1;
      car.sound = X.sfx("fire_loop", { pos: fp, loop: true, volume: 0.8 });
      X.sfx("caution", { pos: fp, volume: 0.6 });
      CARS.active.add(car);
    }
    return true;
  };
  /** local (lx metres, lyFrac of height, lz metres; -z = front) → world */
  function carPoint(car, lx, ly, lz) {
    const c = Math.cos(car.yaw),
      s = Math.sin(car.yaw);
    return new THREE.Vector3(
      car.x + lx * c + lz * s,
      car.y + ly * car.size[2],
      car.z - lx * s + lz * c,
    );
  }
  X.carPoint = carPoint;
  function stopCarFx(car) {
    if (car.fire && car.fire.stop) car.fire.stop();
    if (car.smoke && car.smoke.stop) car.smoke.stop();
    if (car.fireGlow >= 0 && X.glow) X.glow.remove(car.fireGlow);
    if (car.sound && car.sound.stop)
      try {
        car.sound.stop();
      } catch (e) {
        /* ignore */
      }
    car.fire = car.smoke = car.sound = null;
    car.fireGlow = -1;
  }
