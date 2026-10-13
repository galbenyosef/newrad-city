// play-inline-218 02 — ship
// Lines 18-245 of readable/play-inline-218.pretty.js (statement-aligned).
  const PH = G._pharbor;
  const TAU = Math.PI * 2;

  const QY = 6; // quay top
  const Q = { x0: 562, x1: 716, z0: 740, z1: 820 };
  const PIT = { x0: 568, x1: 710, z0: 758, z1: 802 };
  const FLOOR = 0.25;
  const SHIP = { x0: 574, x1: 704, cz: 780, beam: 13, keel: 1.3, depth: 12 };
  const deckY = (x) => {
    const u = (x - SHIP.x0) / (SHIP.x1 - SHIP.x0);
    return (
      SHIP.keel +
      SHIP.depth +
      (u > 0.72 ? Math.pow((u - 0.72) / 0.28, 2) * 2.2 : 0)
    );
  };
  /** Half-beam at hull station u (0 stern .. 1 bow). */
  function halfBeam(u) {
    let b = 1;
    if (u < 0.16) b = 0.62 + 0.38 * Math.sin(((u / 0.16) * Math.PI) / 2);
    if (u > 0.62)
      b = Math.pow(Math.max(0, 1 - Math.pow((u - 0.62) / 0.38, 1.7)), 0.62);
    return SHIP.beam * b;
  }
  PH.NAVY = { QY, Q, PIT, SHIP, deckY, halfBeam };

  /** Lofted hull band between depth fractions h0..h1 (0 = deck edge, 1 = keel), one side (s = ±1). */
  function hullBand(b, key, s, h0, h1, opts) {
    const N = 64,
      M = 6,
      grow = (opts && opts.grow) || 0;
    const pos = [],
      idx = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N,
        x = SHIP.x0 + u * (SHIP.x1 - SHIP.x0);
      const B = halfBeam(u),
        top = deckY(x);
      // the forefoot: the keel sweeps up toward the stem, the counter stern tucks up
      const keelLift =
        u > 0.9
          ? Math.pow((u - 0.9) / 0.1, 2) * 7
          : u < 0.06
            ? Math.pow((0.06 - u) / 0.06, 2) * 4
            : 0;
      const D = top - SHIP.keel - keelLift;
      for (let j = 0; j <= M; j++) {
        const h = h0 + ((h1 - h0) * j) / M;
        const z =
          s *
          (B * Math.pow(Math.max(0, 1 - Math.pow(h, 3)), 1 / 3) +
            (B > 0.5 ? grow : 0));
        pos.push(x, top - D * h, SHIP.cz + z);
      }
    }
    for (let i = 0; i < N; i++)
      for (let j = 0; j < M; j++) {
        const a = i * (M + 1) + j,
          b2 = a + M + 1;
        if (s > 0) idx.push(a, a + 1, b2, a + 1, b2 + 1, b2);
        else idx.push(a, b2, a + 1, a + 1, b2, b2 + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const o = Object.assign(
      { grime: 0.55, ground: SHIP.keel, aoH: 5 },
      opts || {},
    );
    delete o.grow;
    b.add(key, g, o);
  }
  /** A point on the hull side at station u, depth fraction h, side s; returns {x,y,z,ry} with ry facing outward. */
  function hullPt(u, h, s, out) {
    const L = SHIP.x1 - SHIP.x0,
      x = SHIP.x0 + u * L,
      top = deckY(x);
    const keelLift =
      u > 0.9
        ? Math.pow((u - 0.9) / 0.1, 2) * 7
        : u < 0.06
          ? Math.pow((0.06 - u) / 0.06, 2) * 4
          : 0;
    const D = top - SHIP.keel - keelLift,
      f = Math.pow(Math.max(0, 1 - Math.pow(h, 3)), 1 / 3);
    const m =
      ((halfBeam(Math.min(1, u + 0.004)) - halfBeam(Math.max(0, u - 0.004))) *
        f) /
      (0.008 * L);
    const nx = -m,
      nz = 1,
      nl = Math.hypot(nx, nz);
    const o = out || 0;
    return {
      x: x + s * 0 + (nx / nl) * o * 1,
      y: top - D * h,
      z: SHIP.cz + s * (halfBeam(u) * f + (nz / nl) * o),
      ry: s > 0 ? Math.atan2(nx, nz) : Math.atan2(nx, -nz),
    };
  }
  /** Teak main deck surface (strip between the two deck edges). */
  function deckSurface(b) {
    const N = 64,
      pos = [],
      idx = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N,
        x = SHIP.x0 + u * (SHIP.x1 - SHIP.x0),
        B = halfBeam(u),
        y = deckY(x);
      pos.push(x, y, SHIP.cz - B, x, y, SHIP.cz + B);
    }
    for (let i = 0; i < N; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    b.add("wood", g, { grime: 0.6, noAO: true });
    // transom (flat stern) closing plate
    const B0 = halfBeam(0),
      y0 = deckY(SHIP.x0);
    const sh = new THREE.Shape();
    sh.moveTo(-B0, 0);
    sh.lineTo(B0, 0);
    sh.lineTo(B0 * 0.6, -3.5);
    sh.lineTo(-B0 * 0.6, -3.5);
    sh.closePath();
    b.add("navy", new THREE.ShapeGeometry(sh), {
      m: PH.m4(SHIP.x0, y0, SHIP.cz, -Math.PI / 2),
    });
  }
  /** Iowa-style 3-gun turret (local: guns point +x). */
  function turret(b, x, y, z, dir, elev) {
    const M = PH.m4(x, y, z, dir);
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.5 },
          o || {},
        ),
      );
    const prof = new THREE.Shape();
    prof.moveTo(-5.2, 0);
    prof.lineTo(5.0, 0);
    prof.lineTo(3.6, 3.3);
    prof.lineTo(-5.2, 3.3);
    prof.closePath();
    const tg = new THREE.ExtrudeGeometry(prof, {
      depth: 9.6,
      bevelEnabled: false,
    });
    tg.translate(0, 0, -4.8);
    add("navy", tg, PH.m4(0, 0, 0));
    add(
      "navy_dark",
      new THREE.BoxGeometry(1.2, 0.5, 11.4),
      PH.m4(-3.2, 3.55, 0),
    ); // rangefinder hood arms
    add(
      "navy",
      new THREE.CylinderGeometry(5.6, 5.8, 1.2, 24),
      PH.m4(0, -0.6, 0),
    );
    for (const gz of [-2.6, 0, 2.6]) {
      const e = elev + (gz === 2.6 ? -0.09 : 0);
      const gun = new THREE.CylinderGeometry(0.3, 0.46, 17, 12);
      gun.rotateZ(-Math.PI / 2);
      gun.translate(8.5, 0, 0);
      add("navy_dark", gun, PH.m4(4.2, 1.6, gz, 0, 0, e));
      const bag = new THREE.CylinderGeometry(0.75, 0.75, 1.3, 10);
      bag.rotateZ(Math.PI / 2);
      add("canvas", bag, PH.m4(4.3, 1.6, gz, 0, 0, e), { c: 0x8a8068 });
      const muz = new THREE.CylinderGeometry(0.34, 0.34, 0.5, 12);
      muz.rotateZ(Math.PI / 2);
      add(
        "navy_dark",
        muz,
        new THREE.Matrix4().multiplyMatrices(
          PH.m4(4.2, 1.6, gz, 0, 0, e),
          PH.m4(16.8, 0, 0),
        ),
      );
    }
    PH.col(x, z, 10.4, 10, y - 0.6, y + 3.3, dir, {
      walkable: false,
      surface: "metal",
    });
  }
  /** 5"/38 twin mount (enclosed). */
  function mount5(b, x, y, z, dir) {
    b.box("navy", x, y, z, 3.4, 2.4, 3.0, { ry: dir, seg: false });
    for (const dz of [-0.6, 0.6]) {
      const [px, pz] = PH.rot(x, z, dir, 1.6, dz);
      const [qx, qz] = PH.rot(x, z, dir, 6.5, dz);
      b.rod(
        "navy_dark",
        PH.v3(px, y + 1.3, pz),
        PH.v3(qx, y + 1.6, qz),
        0.13,
        8,
      );
    }
    PH.col(x, z, 3.4, 3.0, y, y + 2.4, dir, {
      walkable: false,
      surface: "metal",
    });
  }
  /** 40 mm quad Bofors tub. */
  function bofors(b, x, y, z, dir) {
    b.cyl("navy", x, y, z, 1.8, 1.8, 1.1, 16, { open: true, hSeg: 1 });
    b.cyl("navy_dark", x, y, z, 0.7, 0.8, 1.3, 10, { hSeg: 1 });
    for (const dz of [-0.45, -0.15, 0.15, 0.45]) {
      const [px, pz] = PH.rot(x, z, dir, 0.3, dz),
        [qx, qz] = PH.rot(x, z, dir, 3.4, dz);
      b.rod("iron", PH.v3(px, y + 1.2, pz), PH.v3(qx, y + 2.1, qz), 0.06, 6);
    }
    PH.col(x, z, 3.6, 3.6, y, y + 1.2, 0, {
      walkable: false,
      surface: "metal",
    });
  }

