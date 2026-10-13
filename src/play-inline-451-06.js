// play-inline-451 06 — rng
// Lines 1414-1691 of readable/play-inline-451.pretty.js (statement-aligned).
  function dressArmyPosts() {
    let booths = 0,
      tanks = 0,
      nests = 0,
      lights = 0;
    const SITES = [];
    const tankV = () => {
      const t = rng();
      return t < 0.45 ? 0 : t < 0.75 ? 1 : 2;
    };
    for (const cp of CHECKPOINTS) {
      const { a, s, cx, cz } = cp;
      const half = s.width / 2;
      // guard booth + boom: front toward the traffic coming in, boom reaching over the near lane to the centre line
      const opts = [
        [-1, -1],
        [1, 1],
      ];
      if (rng() < 0.5) opts.reverse();
      let boothDir = 0;
      for (const [dir, sgn] of opts) {
        const z = cz + dir * (half + 5 + rng() * 4),
          x = a.x + sgn * 4.9,
          yaw = dir < 0 ? 0 : PI;
        if (z < a.z0 + 4 || z > a.z1 - 4) continue;
        const pts = [[x, z]],
          tow = [];
        for (let t = 1.6; t <= 5.2; t += 0.9) pts.push([x - sgn * t, z]);
        if (!armyClear(pts, 1.4, tow)) continue;
        towCars(tow);
        if (
          !put(
            "army_checkpoint",
            rng() < 0.6 ? 0 : 1,
            x,
            z,
            yaw + (rng() - 0.5) * 0.04,
            { r: 0, force: true, lootChance: 0.45 },
          )
        )
          continue;
        PLACED_IDX = null;
        occMark(x, z, 1.4);
        for (let t = 1.6; t <= 5.2; t += 0.9) occMark(x - sgn * t, z, 0.5);
        booths++;
        boothDir = dir;
        SITES.push(["booth", +x.toFixed(1), +z.toFixed(1)]);
        // searchlight on the kerb beside the booth, aimed at the sky (or knocked flat)
        const sx = a.x + sgn * (a.road / 2 + 0.7),
          sz = z + dir * 2.6;
        if (
          put(
            "searchlight",
            rng() < 0.7 ? 0 : 1,
            sx,
            sz,
            yaw + (rng() - 0.5) * 1.2,
            { r: 0.6 },
          )
        )
          lights++;
        break;
      }
      // a tank on the opposite approach, parked along the kerb with its gun on the crossing
      if (rng() < 0.6) {
        const dir = boothDir ? -boothDir : rng() < 0.5 ? -1 : 1;
        for (const sgn of rng() < 0.5 ? [-1, 1] : [1, -1]) {
          const z = cz + dir * (half + TANK_LEN / 2 + 2 + rng() * 3),
            x = a.x + sgn * 4.2;
          const yaw = (dir > 0 ? 0 : PI) + (rng() - 0.5) * 0.06; // nose (and gun) toward the crossing
          if (z < a.z0 + 5 || z > a.z1 - 5) continue;
          if (putTank(tankV(), x, z, yaw)) {
            tanks++;
            SITES.push(["cp_tank", +x.toFixed(1), +z.toFixed(1)]);
            break;
          }
        }
      }
      // an MG nest in the parking lane covering the crossing
      if (rng() < 0.55) {
        const dir = rng() < 0.5 ? -1 : 1,
          sgn = rng() < 0.5 ? -1 : 1;
        const x = a.x + sgn * 4.6,
          z = cz + dir * (half + 2.5 + rng() * 2);
        const tow = [];
        if (
          z > a.z0 + 3 &&
          z < a.z1 - 3 &&
          armyClear([[x, z]], 1.8, tow) &&
          (towCars(tow), true) &&
          put("mg_nest", rng() < 0.7 ? 0 : 1, x, z, dir < 0 ? PI : 0, {
            r: 0,
            force: true,
            lootChance: 0.5,
          })
        ) {
          nests++;
          PLACED_IDX = null;
          occMark(x, z, 1.8);
          put(
            "skeleton",
            1,
            x + (rng() - 0.5) * 0.8,
            z - dir * 0.5,
            dir < 0 ? PI : 0,
            { r: 0, noCollide: true, force: true },
          );
        }
      }
    }
    // last stands along the avenues: a tank, sandbags, the crew
    let want = 10,
      tries = 0;
    const stands = [];
    while (want > 0 && tries++ < 600) {
      const a = L.avenues[(rng() * L.avenues.length) | 0];
      const z = a.z0 + 15 + rng() * (a.z1 - a.z0 - 30);
      const sgn = rng() < 0.5 ? -1 : 1,
        x = a.x + sgn * 4.2;
      const yaw = (sgn > 0 ? PI : 0) + (rng() - 0.5) * 0.1;
      if (
        inCrossingRoad(x, z, a) ||
        inCrossingRoad(x, z - 5, a) ||
        inCrossingRoad(x, z + 5, a) ||
        nearLocation(x, z, 20, (l) => !l.hostile)
      )
        continue;
      if (stands.some((p) => Math.hypot(p[0] - x, p[1] - z) < 160)) continue; // spread across the city
      const v = tankV();
      if (!putTank(v, x, z, yaw)) continue;
      stands.push([x, z]);
      tanks++;
      want--;
      SITES.push(["tank_" + v, +x.toFixed(1), +z.toFixed(1)]);
      const fz = yaw === 0 || Math.abs(yaw) < 0.2 ? -1 : 1; // tank front along z
      const ex = a.x + sgn * (a.road / 2 - 0.9);
      put("sandbags", 0, ex, z + fz * (TANK_LEN / 2 + 1.6), PI / 2, { r: 1.1 });
      put(
        "skeleton",
        rng() < 0.5 ? 0 : 2,
        a.x + sgn * 1.4,
        z + (rng() - 0.5) * 5,
        rng() * 6,
        { r: 0.6 },
      );
      if (rng() < 0.6)
        put("skeleton", 1, ex, z - fz * (TANK_LEN / 2 + 1.2), yaw, { r: 0.5 });
      if (rng() < 0.7)
        spawnDyn("ammo_box", {
          x: ex,
          z: z - fz * (TANK_LEN / 2 + 2.2),
          yaw: rng() * 6,
          r: 0.4,
          name: "Army Ammo Box",
        });
      for (let k = 0; k < 3; k++)
        put(
          "car_debris",
          (rng() * 3) | 0,
          a.x + sgn * (1 + rng() * 3),
          z + (rng() - 0.5) * 9,
          rng() * 6,
          { r: 0.3, noCollide: true },
        );
    }
    stats.armyPosts = {
      checkpoints: CHECKPOINTS.length,
      booths,
      tanks,
      nests,
      lights,
      sites: SITES,
    };
  }

  // ------------------------------------------------------------------
  // Freestanding billboards
  // ------------------------------------------------------------------
  let brandIdx = 0;
  X.BILLBOARDS = [];
  function putBillboard(variant, x, z, yaw, brand) {
    const placed = put("billboard_frame", variant, x, z, yaw, {
      r: variant === 1 ? 3 : 1.5,
    });
    if (!placed) return null;
    const pr = placed.pr,
      f = pr.meta.face;
    brand = brand || L.BRANDS[brandIdx++ % L.BRANDS.length];
    const mat = X.billboardMaterial(brand);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(f.w, f.h), mat);
    // face toward local -z → plane (faces +z) rotated by PI
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    const lz = f.z - 0.08;
    m.position.set(x + lz * s, placed.y + f.y, z + lz * c);
    m.rotation.set(0, yaw + PI, 0, "YXZ");
    m.rotateX(-(f.rx || 0));
    m.receiveShadow = true;
    m.name = "props_billboard_" + brand;
    X.billboardRoot.add(m);
    G.world.addLOD(m, variant === 1 ? 900 : 480, m.position.clone());
    X.BILLBOARDS.push({ brand, x, z, mesh: m });
    // lamps under a few big ones glow at night
    if (variant === 1 && X.glow)
      for (let i = 0; i < 4; i++) {
        const lx = -f.w / 2 + ((i + 0.5) * f.w) / 4;
        X.glow.add(
          x + lx * c + -1.1 * s,
          placed.y + f.y - f.h / 2 - 0.4,
          z - lx * s + -1.1 * c,
          0xffe0a0,
          4,
          rng() < 0.3 ? 0.6 : 0,
        );
      }
    return m;
  }
  function dressBillboards() {
    // (a) street-end vistas: big billboards where a street meets the waterfront
    let n = 0;
    for (const s of L.streets) {
      if (s.park) continue;
      for (const end of [0, 1]) {
        const x = end ? s.x1 - 7 : s.x0 + 7;
        const beyond = end ? s.x1 + 10 : s.x0 - 10;
        if (L.isLand(beyond, s.z)) continue; // not a waterfront end
        if (rng() < 0.45) continue;
        if (putBillboard(1, x, s.z, end ? PI / 2 : -PI / 2)) n++;
      }
    }
    // (b) intersection corners: small twin-pole boards angled at the crossing
    for (const a of L.avenues)
      for (const s of L.streets) {
        if (s.park || a.x < s.x0 || a.x > s.x1 || s.z < a.z0 || s.z > a.z1)
          continue;
        if (rng() > 0.1) continue;
        const sx = rng() < 0.5 ? -1 : 1,
          sz = rng() < 0.5 ? -1 : 1;
        const x = a.x + sx * (a.width / 2 - 1.2),
          z = s.z + sz * (s.width / 2 - 1.2);
        // face diagonally toward the intersection centre
        const yaw = Math.atan2(sx, sz); // forward (-sin, -cos) points back toward the centre
        putBillboard(rng() < 0.2 ? 2 : 0, x, z, yaw);
      }
    // (c) Brooklyn waterfront, facing Manhattan across the East River
    for (const z of [430, 545, 760, 870, 950]) {
      let x = 470;
      while (x < 560 && !L.isBrooklyn(x, z)) x += 2;
      putBillboard(1, x + 5, z, PI / 2);
    }
    stats.billboards = X.BILLBOARDS.length;
  }

  // ------------------------------------------------------------------
  // Faction / location dressing
  // ------------------------------------------------------------------
  function approachPoints(l) {
    const pts = [];
    const d = l.r + 10;
    for (const a of L.avenues) {
      if (Math.abs(a.x - l.x) > l.r + 25) continue;
      for (const sg of [-1, 1]) {
        const z = l.z + sg * d;
        if (z >= a.z0 && z <= a.z1)
          pts.push({ x: a.x, z, along: "ns", corr: a });
      }
    }
    for (const s of L.streets) {
      if (s.park || Math.abs(s.z - l.z) > l.r + 25) continue;
      for (const sg of [-1, 1]) {
        const x = l.x + sg * d;
        if (x >= s.x0 && x <= s.x1)
          pts.push({ x, z: s.z, along: "ew", corr: s });
      }
    }
    return pts.filter((p) => ok(p.x, p.z) && !inCrossing(p.x, p.z, p.corr, 3));
  }
  /** Barricade line across a corridor at p. style: raider|brute|covenant|continuity|settler. */
