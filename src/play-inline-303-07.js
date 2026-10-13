// play-inline-303 07 — noao
// Lines 1565-1900 of readable/play-inline-303.pretty.js (statement-aligned).
  D.crib = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    b.geo(
      "paint_white",
      new THREE.BoxGeometry(0.7, 0.08, 1.25).translate(0, 0.45, 0),
      M,
      { noAO: true, grime: 0.6 },
    );
    b.geo(
      "fabric_pink",
      new THREE.BoxGeometry(0.62, 0.1, 1.15).translate(0, 0.52, 0),
      M,
      { noAO: true, grime: 0.6 },
    );
    for (const s of [-1, 1]) {
      b.geo(
        "paint_white",
        new THREE.BoxGeometry(0.72, 0.05, 0.05).translate(0, 1.0, s * 0.62),
        M,
        { noAO: true },
      );
      b.geo(
        "paint_white",
        new THREE.BoxGeometry(0.05, 0.05, 1.28).translate(s * 0.35, 1.0, 0),
        M,
        { noAO: true },
      );
      for (let i = 0; i < 9; i++)
        b.geo(
          "paint_white",
          new THREE.CylinderGeometry(0.012, 0.012, 0.55, 4).translate(
            s * 0.35,
            0.72,
            -0.55 + i * 0.137,
          ),
          M,
          { noAO: true },
        );
      for (let i = 0; i < 4; i++)
        b.geo(
          "paint_white",
          new THREE.CylinderGeometry(0.012, 0.012, 0.55, 4).translate(
            -0.24 + i * 0.16,
            0.72,
            s * 0.62,
          ),
          M,
          { noAO: true },
        );
      for (const t of [-1, 1])
        b.geo(
          "paint_white",
          new THREE.BoxGeometry(0.05, 1.0, 0.05).translate(
            s * 0.35,
            0.5,
            t * 0.62,
          ),
          M,
          { noAO: true },
        );
    }
    // mobile
    b.geo(
      "iron",
      new THREE.CylinderGeometry(0.008, 0.008, 0.6, 3).translate(0.35, 1.3, 0),
      M,
      { noAO: true },
    );
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU;
      b.geo(
        ["paint_blue", "paint_red", "gold", "paint_green"][i],
        new THREE.OctahedronGeometry(0.05).translate(
          0.15 + Math.cos(a) * 0.18,
          1.35,
          Math.sin(a) * 0.18,
        ),
        M,
        { noAO: true },
      );
    }
  };
  D.rockingChair = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    for (const s of [-1, 1]) {
      b.geo(
        "wood_dark",
        new THREE.TorusGeometry(0.9, 0.025, 4, 12, 0.9)
          .rotateY(HP)
          .rotateX(PI + 0.45)
          .translate(s * 0.24, 0.92, 0.05),
        M,
        { noAO: true },
      );
      b.geo(
        "wood_dark",
        new THREE.BoxGeometry(0.04, 1.05, 0.04)
          .translate(s * 0.24, 0.62, -0.28)
          .rotateX(-0.12),
        M,
        { noAO: true },
      );
      b.geo(
        "wood_dark",
        new THREE.BoxGeometry(0.04, 0.4, 0.04).translate(s * 0.24, 0.26, 0.2),
        M,
        { noAO: true },
      );
    }
    b.geo(
      "wood_dark",
      new THREE.BoxGeometry(0.5, 0.05, 0.5).translate(0, 0.46, 0),
      M,
      { noAO: true },
    );
    for (let i = 0; i < 5; i++)
      b.geo(
        "wood_dark",
        new THREE.BoxGeometry(0.02, 0.6, 0.02)
          .translate(-0.18 + i * 0.09, 0.85, -0.3)
          .rotateX(-0.12),
        M,
        { noAO: true },
      );
    b.geo(
      "wood_dark",
      new THREE.BoxGeometry(0.52, 0.06, 0.05).translate(0, 1.15, -0.34),
      M,
      { noAO: true },
    );
  };
  D.tub = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    const g = new THREE.CylinderGeometry(0.38, 0.32, 0.55, 12, 1, true)
      .scale(1, 1, 2.1)
      .translate(0, 0.42, 0);
    b.geo("paint_white", g, M, { noAO: true, grime: 0.7 });
    b.geo(
      "paint_white",
      new THREE.CylinderGeometry(0.32, 0.32, 0.04, 12)
        .scale(1, 1, 2.1)
        .translate(0, 0.16, 0),
      M,
      { noAO: true, grime: 0.8 },
    );
    for (const [lx, lz] of [
      [-0.25, -0.6],
      [0.25, -0.6],
      [-0.25, 0.6],
      [0.25, 0.6],
    ])
      b.geo(
        "gold",
        new THREE.SphereGeometry(0.06, 5, 4).translate(lx, 0.1, lz),
        M,
        { noAO: true },
      );
  };
  /** Jewellery / museum display case: base cabinet + steel-framed glass top (optionally smashed). */
  D.case = function (b, x, y, z, w, d, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry);
    b.geo(
      o.base || "wood_dark",
      new THREE.BoxGeometry(w, 0.9, d).translate(0, 0.45, 0),
      M,
      { noAO: true, grime: 0.3 },
    );
    b.geo(
      o.velvet || "velvet",
      new THREE.BoxGeometry(w - 0.08, 0.02, d - 0.08).translate(0, 0.91, 0),
      M,
      { noAO: true },
    );
    const fk = o.frame || "chrome";
    for (const s of [-1, 1])
      for (const t of [-1, 1])
        b.geo(
          fk,
          new THREE.BoxGeometry(0.03, 0.4, 0.03).translate(
            s * (w / 2 - 0.015),
            1.1,
            t * (d / 2 - 0.015),
          ),
          M,
          { noAO: true },
        );
    for (const t of [-1, 1])
      b.geo(
        fk,
        new THREE.BoxGeometry(w, 0.03, 0.03).translate(
          0,
          1.3,
          t * (d / 2 - 0.015),
        ),
        M,
        { noAO: true },
      );
    for (const s of [-1, 1])
      b.geo(
        fk,
        new THREE.BoxGeometry(0.03, 0.03, d).translate(
          s * (w / 2 - 0.015),
          1.3,
          0,
        ),
        M,
        { noAO: true },
      );
    if (!o.smashed)
      b.geo(
        "glass",
        new THREE.BoxGeometry(w - 0.04, 0.38, d - 0.04).translate(0, 1.1, 0),
        M,
        { noAO: true, grime: 0.2 },
      );
    else {
      const r = P.rng(x * 5 + z * 9);
      for (let i = 0; i < 6; i++)
        b.geo(
          "glass",
          new THREE.BufferGeometry()
            .setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0.1 + r() * 0.2, 0, r() * 0.1),
              new THREE.Vector3(r() * 0.1, 0, 0.1 + r() * 0.2),
            ])
            .translate(
              (r() - 0.5) * w * 1.6,
              0.012 - y + (y || 0),
              (r() - 0.5) * d * 2.4,
            ),
          M,
          { noAO: true },
        );
    }
    if (o.goods) {
      const r = P.rng(x * 3 + z * 13);
      for (let i = 0; i < o.goods; i++)
        b.geo(
          r() < 0.5 ? "gold" : "chrome",
          new THREE.TorusGeometry(0.03, 0.008, 4, 8)
            .rotateX(HP)
            .translate((r() - 0.5) * (w - 0.3), 0.93, (r() - 0.5) * (d - 0.2)),
          M,
          { noAO: true },
        );
    }
  };
  /** Planter with a dead palm. */
  D.palm = function (b, x, y, z, h, o) {
    o = o || {};
    const r = P.rng(x * 7 + z * 11);
    b.lathe(
      o.pot || "terracotta",
      [
        [0.001, 0],
        [0.4, 0],
        [0.48, 0.1],
        [0.55, 0.7],
        [0.6, 0.78],
        [0.001, 0.72],
      ],
      10,
      x,
      y,
      z,
    );
    b.cyl("dirt", x, y + 0.68, z, 0.5, 0.5, 0.06, 10, { noAO: true });
    let px = x,
      pz = z,
      py = y + 0.72;
    const lean = (r() - 0.5) * 0.5,
      la = r() * TAU;
    const top = [
      x + Math.cos(la) * lean * h * 0.4,
      y + 0.72 + h,
      z + Math.sin(la) * lean * h * 0.4,
    ];
    b.rod("wood_rotten", [px, py, pz], top, 0.09, 6, {
      rTop: 0.07,
      noAO: true,
    });
    const n = o.fronds || 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + r() * 0.4,
        up = i < 3 ? 0.35 : 0,
        L = h * (0.4 + r() * 0.25),
        dead = r() < 0.55;
      const pts = [];
      for (let k = 0; k <= 4; k++) {
        const t = k / 4;
        pts.push([
          top[0] + Math.cos(a) * L * t,
          top[1] + (up + 0.35) * L * t - (0.9 + r() * 0.3) * L * t * t,
          top[2] + Math.sin(a) * L * t,
        ]);
      }
      for (let k = 0; k < 4; k++) {
        b.rod(
          dead ? "wood_rotten" : o.frond || "grass",
          pts[k],
          pts[k + 1],
          0.012,
          3,
          { noAO: true },
        );
        // leaflets: a flat blade either side of the rib
        const mx = (pts[k][0] + pts[k + 1][0]) / 2,
          my = (pts[k][1] + pts[k + 1][1]) / 2,
          mz = (pts[k][2] + pts[k + 1][2]) / 2,
          w2 = 0.16 * (1 - k / 5);
        b.box(
          dead ? "wood_rotten" : o.frond || "grass",
          mx - w2,
          my - 0.01,
          mz - 0.03,
          mx + w2,
          my + 0.01,
          mz + 0.03,
          { ry: -a + HP, rz: k % 2 ? 0.4 : -0.4, seg: false, noAO: true },
        );
      }
    }
    void px;
    void py;
    void pz;
  };
  D.rug = function (b, x0, z0, x1, z1, y, key) {
    b.box(key || "carpet_red", x0, y, z0, x1, y + 0.015, z1, {
      seg: false,
      noAO: true,
      grime: 0.5,
    });
  };
  /** Fireplace against a wall (back at z, facing ry). */
