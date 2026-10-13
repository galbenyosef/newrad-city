// play-inline-451 05 — rng
// Lines 1096-1413 of readable/play-inline-451.pretty.js (statement-aligned).
  function dressIntersections() {
    for (const a of L.avenues)
      for (const s of L.streets) {
        if (s.park) continue;
        if (a.x < s.x0 || a.x > s.x1 || s.z < a.z0 || s.z > a.z1) continue;
        const cx = a.x,
          cz = s.z;
        if (!ok(cx, cz)) continue;
        const t = rng();
        if (t < 0.24) {
          // crash pile-up: 3-5 cars smashed together at angles, a gap left on one side
          const n = 3 + ((rng() * 3) | 0);
          const gapSide = rng() < 0.5 ? -1 : 1;
          for (let i = 0; i < n; i++) {
            const ox = (rng() - 0.5) * 7 - gapSide * 2.5,
              oz = (rng() - 0.5) * 7;
            const u = rng();
            putCar(
              pickCarKind(L.districtAt(cx, cz), "traffic"),
              cx + ox,
              cz + oz,
              rng() * PI * 2,
              {
                burnt: rng() < 0.55,
                flipped: u < 0.1,
                onSide: u > 0.1 && u < 0.24 ? (rng() < 0.5 ? 1 : -1) : 0,
              },
            );
          }
          put(
            "debris",
            2,
            cx + gapSide * -3,
            cz + (rng() - 0.5) * 4,
            rng() * 6,
            { r: 0.8 },
          );
          for (let i = 0; i < 3; i++)
            put(
              "car_debris",
              (rng() * 3) | 0,
              cx + (rng() - 0.5) * 9,
              cz + (rng() - 0.5) * 9,
              rng() * 6,
              { r: 0.3, noCollide: true },
            );
        } else if (t < 0.3 && !nearLocation(cx, cz, 30)) {
          // abandoned army checkpoint: jersey barriers + sandbags + crates, a gap for traffic
          CHECKPOINTS.push({ a, s, cx, cz }); // (the Army post pass dresses its approaches later, own stream)
          const along = rng() < 0.5; // barrier line across the avenue (E-W) or across the street (N-S)
          for (let i = -2; i <= 2; i++) {
            if (i === (rng() < 0.5 ? -1 : 1)) continue;
            const bx = along ? cx + i * 3.1 : cx,
              bz = along ? cz : cz + i * 3.1;
            put(
              "jersey_barrier",
              rng() < 0.3 ? 2 : 0,
              bx,
              bz,
              along ? 0 : PI / 2,
              { r: 1.2 },
            );
          }
          put("sandbags", 1, cx + 7, cz + 7, PI, { r: 1.2 });
          put("crate", 2, cx + 7.5, cz - 7, rng() * 6, { r: 0.7 });
          put("sawhorse", 2, cx - 7, cz + 7.5, PI / 4, { r: 1.2 });
          put("skeleton", 0, cx - 6.5, cz - 6, rng() * 6, { r: 0.7 });
          spawnDyn("ammo_box", {
            x: cx + 7.8,
            z: cz - 5.8,
            yaw: rng() * 6,
            r: 0.4,
          });
          // the police Patrolman posted here, run down where it stood guard
          if (rng() < 0.5)
            put(
              "robot_wreck",
              rng() < 0.6 ? 6 : 7,
              cx + (rng() < 0.5 ? -1 : 1) * (4.5 + rng() * 2),
              cz + (rng() < 0.5 ? -1 : 1) * (4.5 + rng() * 2),
              rng() * 6,
              { r: 1.3, lootChance: 0.85 },
            );
          // the Army truck that brought them, and the board that kept the crowds back
          {
            const ty = along ? PI / 2 : 0,
              off = (rng() < 0.5 ? -1 : 1) * 7.5;
            putTruck(
              rng() < 0.45 ? 0 : rng() < 0.6 ? 1 : 2,
              along ? cx + (rng() - 0.5) * 3 : cx + off * 0.45,
              along ? cz + off * 0.45 : cz + (rng() - 0.5) * 3,
              ty + (rng() < 0.5 ? PI : 0) + (rng() - 0.5) * 0.2,
            );
            const qs = along
              ? { x: cx + 5, z: cz + 2.2 }
              : { x: cx + 2.2, z: cz + 5 };
            put(
              "quarantine_sign",
              rng() < 0.3 ? 1 : 0,
              qs.x,
              qs.z,
              along ? 0 : PI / 2,
              { r: 1.0 },
            );
          }
        }
      }
  }

  // ------------------------------------------------------------------
  // ARMY POSTS (round 2, own RNG stream, runs after every other pass so it
  // moves nothing): the intersection checkpoints get their guard booth and
  // boom on an avenue approach (the far lane stays open), a searchlight on
  // the kerb, often a tank parked on the other approach and an MG nest in
  // the parking lane; plus a handful of tanks abandoned mid-avenue where a
  // unit made a stand (sandbags, skeletons, an ammo can). Tanks, booths and
  // nests sit in the parking lane / near lane only — 6 m of carriageway and
  // both sidewalks always stay clear.
  // ------------------------------------------------------------------
  let CHECKPOINTS = [];
  const TANK_HALF_W = 1.7,
    TANK_LEN = 7.0;
  // The Army cleared its own lane: parked street wrecks in a post's footprint are towed (removed with
  // their trunk container) — but never a static prop, a scene's car or another module's collider.
  let PLACED_IDX = null;
  const PCELL = 8;
  function placedIndex() {
    if (PLACED_IDX) return PLACED_IDX;
    PLACED_IDX = new Map();
    for (const rec of X.PLACED) {
      const k = Math.floor(rec.x / PCELL) * 100003 + Math.floor(rec.z / PCELL);
      let a = PLACED_IDX.get(k);
      if (!a) PLACED_IDX.set(k, (a = []));
      a.push(rec);
    }
    return PLACED_IDX;
  }
  const FLAT_OK = new Set([
    "litter",
    "car_debris",
    "grate",
    "skeleton",
    "tire",
  ]);
  /** Is the ground round each pt (radius r) free of static props (flat litter aside)? Collects the scatter cars to tow. */
  function armyClear(pts, r, tow) {
    const idx = placedIndex();
    for (const [px, pz] of pts) {
      if (!ok(px, pz) || blocked(px, pz, Math.min(r, 1.4))) return false;
      for (
        let gx = Math.floor((px - r - 6) / PCELL);
        gx <= Math.floor((px + r + 6) / PCELL);
        gx++
      )
        for (
          let gz = Math.floor((pz - r - 6) / PCELL);
          gz <= Math.floor((pz + r + 6) / PCELL);
          gz++
        ) {
          for (const rec of idx.get(gx * 100003 + gz) || []) {
            if (rec.hidden || FLAT_OK.has(rec.name) || rec.pr.box.max.y < 0.3)
              continue;
            const b = rec.pr.box,
              rr =
                Math.max(b.max.x - b.min.x, b.max.z - b.min.z) *
                0.5 *
                (rec.s || 1);
            if (Math.hypot(rec.x - px, rec.z - pz) < r + rr * 0.8) return false;
          }
        }
      if (X.carsNear)
        for (const { car } of X.carsNear({ x: px, z: pz }, r)) {
          if (car.removed) continue;
          if (!car.sc || car.scene) return false;
          if (tow.indexOf(car) < 0) tow.push(car);
        }
    }
    return true;
  }
  function towCars(tow) {
    for (const car of tow) {
      X.removeCar(car);
      if (car.trunkSc) {
        const i = X.SC_CONTAINERS.indexOf(car.trunkSc);
        if (i >= 0) X.SC_CONTAINERS.splice(i, 1);
        car.trunkSc = null;
      }
      stats.armyTowed = (stats.armyTowed || 0) + 1;
    }
  }
  /** Footprint points for a tank centred at x,z with yaw (turret lying at local +x for v1). */
  function tankPts(v, x, z, yaw) {
    const fx = -Math.sin(yaw),
      fz = -Math.cos(yaw),
      rx = Math.cos(yaw),
      rz = -Math.sin(yaw);
    const pts = [];
    for (let i = 0; i < 4; i++) {
      const t = (i / 3 - 0.5) * (TANK_LEN - 2.4);
      pts.push([x + fx * t, z + fz * t]);
    }
    if (v === 1) pts.push([x + rx * 3.2 - fx * 1.4, z + rz * 3.2 - fz * 1.4]);
    return pts;
  }
  function putTank(v, x, z, yaw, o) {
    const pts = tankPts(v, x, z, yaw),
      tow = [];
    if (!armyClear(pts, TANK_HALF_W, tow)) return null;
    towCars(tow);
    const placed = put(
      "army_tank",
      v,
      x,
      z,
      yaw,
      Object.assign({ force: true, r: 0, lootChance: 0.7 }, o || {}),
    );
    if (placed) {
      for (const [px, pz] of pts) occMark(px, pz, TANK_HALF_W + 0.2);
      PLACED_IDX = null;
    }
    return placed;
  }
  // ------------------------------------------------------------------
  // Hi-Octane Harry's filling stations (29_filling_station.js) on open ground off the corridors:
  // the West Village waterfront corner of 10th Ave × 11th St (facing 11th St) and the East River
  // side between 14th and 11th St east of Lexington (facing 11th St). Each anchor is searched
  // outward in 2 m steps until the whole pad is land, off every road/sidewalk, clear of sites,
  // locations, doors and other modules' colliders. Runs first so later passes flow around it.
  // ------------------------------------------------------------------
  const FILLING_STATIONS = [
    {
      id: "west_village",
      x: -309,
      z: 373,
      yaw: 0,
      v: 0,
      car: { lx: 2.0, lz: -5.8, kind: "sedan" },
    },
    {
      id: "east_village",
      x: 303,
      z: 334,
      yaw: PI,
      v: 1,
      car: { lx: -1.0, lz: -5.8, kind: "coupe" },
    },
  ];
  X.FILLING_STATIONS = [];
  function dressFillingStations() {
    const S = X.FILLING_STATION_SIZE || { w: 22, d: 16 };
    const toW = (cx, cz, yaw, lx, lz) => {
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      return [cx + lx * c + lz * s, cz - lx * s + lz * c];
    };
    const padFree = (cx, cz, yaw) => {
      for (let lx = -S.w / 2; lx <= S.w / 2 + 0.01; lx += 2)
        for (let lz = -S.d / 2; lz <= S.d / 2 + 0.01; lz += 2) {
          const [x, z] = toW(cx, cz, yaw, lx, lz);
          if (
            !ok(x, z) ||
            L.isRoad(x, z) ||
            (L.locationAt && L.locationAt(x, z)) ||
            !occFree(x, z, 0.8) ||
            blocked(x, z, 0.5)
          )
            return false;
        }
      return true;
    };
    for (const st of FILLING_STATIONS) {
      let at = null;
      for (let ring = 0; ring <= 7 && !at; ring++) {
        for (let i = -ring; i <= ring && !at; i++)
          for (let j = -ring; j <= ring && !at; j++) {
            if (Math.max(Math.abs(i), Math.abs(j)) !== ring) continue;
            if (padFree(st.x + i * 2, st.z + j * 2, st.yaw))
              at = [st.x + i * 2, st.z + j * 2];
          }
      }
      if (!at) {
        stats.fillingStationMissed = (stats.fillingStationMissed || 0) + 1;
        continue;
      }
      const [cx, cz] = at;
      // the wreck by the pumps first (its own footprint checks), then the station claims the whole pad
      if (st.car) {
        const [x, z] = toW(cx, cz, st.yaw, st.car.lx, st.car.lz);
        putCar(st.car.kind, x, z, st.yaw + PI / 2 + (rng() - 0.5) * 0.2, {
          force: true,
          stripped: true,
          wreck: false,
          burnt: false,
        });
      }
      const placed = put("filling_station", st.v, cx, cz, st.yaw, {
        force: true,
        r: 0,
        container: {},
      });
      if (!placed) continue;
      for (let lx = -S.w / 2; lx <= S.w / 2 + 0.01; lx += 1.5)
        for (let lz = -S.d / 2; lz <= S.d / 2 + 0.01; lz += 1.5) {
          const [x, z] = toW(cx, cz, st.yaw, lx, lz);
          occMark(x, z, 0.8);
        }
      CLEAR.push([cx - S.w / 2, cz - S.w / 2, cx + S.w / 2, cz + S.w / 2]); // no parked cars nosed into the forecourt
      X.FILLING_STATIONS.push({
        id: st.id,
        x: cx,
        y: placed.y,
        z: cz,
        yaw: st.yaw,
      });
    }
  }

