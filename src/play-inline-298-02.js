// play-inline-298 02 — add
// Lines 27-148 of readable/play-inline-298.pretty.js (statement-aligned).
  const PM = G._pm2;
  const K = PM.kit,
    D = PM.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const FZ = -107.5; // McKim building front
  const MX0 = 143,
    MX1 = 177,
    MH = 11.6; // McKim building x range, cornice top
  const PL = 1.3; // plinth / portico floor height
  const MY = 5.0,
    BY = 0.4; // interior: main floor, basement floor
  const T2 = 4.4,
    T3 = 8.4,
    EC = 13.4; // East Room tiers + ceiling (relative to MY)

  Object.assign(PM.flagDefaults, {
    morgan_bookcase: false,
    morgan_dewey_dead: false,
    morgan_combo: false,
  });

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function ionic(b, key, x, y, z, h, r) {
    b.box(key, x, y, z, r * 2.6, r * 0.45, r * 2.6, { seg: false, grime: 0.5 });
    b.cyl(key, x, y + r * 0.45, z, r * 1.15, r * 1.25, r * 0.3, 16, {
      hSeg: 1,
    });
    const sh = h - r * 0.75 - r * 0.9;
    b.cyl(key, x, y + r * 0.75, z, r * 0.86, r, sh, 20, {
      hSeg: Math.max(2, Math.round(sh / 2)),
      grime: 0.45,
    });
    b.box(key, x, y + h - r * 0.9, z, r * 2.5, r * 0.5, r * 1.8, {
      seg: false,
    }); // echinus/abacus block
    for (const sg of [-1, 1])
      b.cyl(
        key,
        x + sg * r * 1.15,
        y + h - r * 0.62,
        z,
        r * 0.36,
        r * 0.36,
        r * 1.9,
        10,
        { hSeg: 1, rx: HP },
      ); // volutes
    b.box(key, x, y + h - r * 0.35, z, r * 2.7, r * 0.35, r * 2.7, {
      seg: false,
    });
    PM.col(x, z, r * 2.2, r * 2.2, y, y + h, 0, { walkable: false });
  }
  /** Reclining lioness on a pedestal (facing ry). */
  function lioness(b, x, y, z, ry, broken) {
    const M = PM.m4(x, y, z, ry);
    const add = (g, m, k) =>
      b.add(k || "limestone", g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.55,
      });
    add(
      new THREE.CapsuleGeometry(0.42, 1.3, 4, 10),
      PM.m4(0, 0.5, -0.2, 0, HP, 0),
    ); // body, lying
    add(
      new THREE.SphereGeometry(0.46, 10, 8),
      PM.m4(0, 0.55, -0.85, 0, 0, 0, 1, 0.85, 1.1),
    ); // haunch
    add(
      new THREE.CapsuleGeometry(0.13, 0.7, 3, 6),
      PM.m4(-0.22, 0.14, 0.55, 0, HP, 0),
    ); // forepaws
    add(
      new THREE.CapsuleGeometry(0.13, 0.7, 3, 6),
      PM.m4(0.22, 0.14, 0.55, 0, HP, 0),
    );
    add(
      new THREE.CapsuleGeometry(0.1, 0.9, 3, 6),
      PM.m4(0.35, 0.12, -1.2, 0.6, HP, 0),
    ); // tail
    if (!broken) {
      add(
        new THREE.SphereGeometry(0.3, 10, 8),
        PM.m4(0, 1.05, 0.62, 0, 0, 0, 0.95, 1.05, 1.1),
      ); // head, raised
      add(new THREE.BoxGeometry(0.26, 0.2, 0.3), PM.m4(0, 0.97, 0.88)); // muzzle
      for (const sg of [-1, 1])
        add(
          new THREE.ConeGeometry(0.07, 0.12, 5),
          PM.m4(sg * 0.17, 1.33, 0.56),
        );
      add(
        new THREE.CylinderGeometry(0.2, 0.3, 0.4, 8),
        PM.m4(0, 0.8, 0.5, 0, -0.5, 0),
      ); // neck
    } else {
      add(
        new THREE.CylinderGeometry(0.2, 0.3, 0.3, 8),
        PM.m4(0, 0.78, 0.5, 0, -0.5, 0),
      );
      b.rock(
        "limestone",
        x + Math.sin(ry) * 0.9 + 0.6,
        y - 1.05,
        z + Math.cos(ry) * 0.9,
        0.28,
        { seed: 4 },
      ); // the head, fallen
    }
    b.box("limestone", x, y - 0.95, z, 1.3, 0.95, 2.6, {
      ry,
      seg: false,
      grime: 0.5,
    });
    PM.col(x, z, 1.3, 2.6, y - 0.95, y + 1.2, ry, { walkable: false });
  }
