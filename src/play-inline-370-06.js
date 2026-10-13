// play-inline-370 06 — three
// Lines 1154-1437 of readable/play-inline-370.pretty.js (statement-aligned).
  D.horse = function (b, key, x, y, z, ry, s, o) {
    o = o || {};
    s = s || 1;
    const M = P.m4(x, y, z, ry, 0, 0, s);
    const add = (g, m) =>
      b.geo(key, g, M.clone().multiply(m), { noAO: true, grime: 0.4 });
    add(
      new THREE.SphereGeometry(1, 10, 8),
      P.m4(0, 1.45, 0, 0, 0, 0, 0.42, 0.48, 1.0),
    );
    const rear = o.rear ? 0.35 : 0;
    for (const [lx, lz, lift] of [
      [-1, 1, o.stride ? 0.5 : 0],
      [1, 1, 0],
      [-1, -1, 0],
      [1, -1, o.stride ? -0.25 : 0],
    ]) {
      add(
        new THREE.CylinderGeometry(0.1, 0.07, 1.05, 6).translate(0, -0.52, 0),
        P.m4(lx * 0.22, 1.2, lz * 0.7, 0, lift),
      );
      add(
        new THREE.CylinderGeometry(0.09, 0.1, 0.1, 6).translate(0, -1.05, 0),
        P.m4(lx * 0.22, 1.2, lz * 0.7, 0, lift),
      );
    }
    add(
      new THREE.CylinderGeometry(0.2, 0.3, 0.95, 8).translate(0, 0.47, 0),
      P.m4(0, 1.6, 0.75, 0, 0.75 + rear),
    );
    add(
      new THREE.CylinderGeometry(0.12, 0.2, 0.62, 8).rotateX(HP),
      P.m4(0, 2.22 + rear, 1.3, 0, 0.35),
    );
    for (const sd of [-1, 1])
      add(
        new THREE.ConeGeometry(0.05, 0.15, 4),
        P.m4(sd * 0.08, 2.45 + rear, 1.12),
      );
    add(
      new THREE.CylinderGeometry(0.04, 0.1, 0.9, 5).translate(0, -0.45, 0),
      P.m4(0, 1.6, -0.95, 0, -0.4),
    );
  };

  // ---------------------------------------------------------------
  // Furniture
  // ---------------------------------------------------------------
  D.chair = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry, 0, 0, 1),
      wk = o.wood || "wood_dark",
      fk = o.seat || "velvet";
    const add = (k, g, m) =>
      b.geo(k, g, M.clone().multiply(m || new THREE.Matrix4()), {
        noAO: true,
        grime: 0.3,
      });
    if (o.toppled) {
      M.multiply(P.m4(0, 0.22, 0, 0, HP * 0.95));
    }
    for (const [lx, lz] of [
      [-0.2, -0.2],
      [0.2, -0.2],
      [-0.2, 0.2],
      [0.2, 0.2],
    ])
      add(wk, new THREE.BoxGeometry(0.04, 0.45, 0.04).translate(lx, 0.225, lz));
    add(fk, new THREE.BoxGeometry(0.46, 0.07, 0.46).translate(0, 0.48, 0));
    add(wk, new THREE.BoxGeometry(0.44, 0.5, 0.04).translate(0, 0.78, -0.21));
    if (o.arms)
      for (const s of [-1, 1])
        add(
          wk,
          new THREE.BoxGeometry(0.05, 0.05, 0.42).translate(s * 0.23, 0.68, 0),
        );
  };
  /** Round café / dining table. */
  D.table = function (b, x, y, z, o) {
    o = o || {};
    const r = o.r || 0.45,
      h = o.h || 0.75,
      tk = o.top || "marble",
      lk = o.leg || "iron";
    if (o.rect) {
      b.box(
        tk,
        x - o.rect[0] / 2,
        y + h - 0.05,
        z - o.rect[1] / 2,
        x + o.rect[0] / 2,
        y + h,
        z + o.rect[1] / 2,
        { seg: false, noAO: true },
      );
      for (const [lx, lz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.box(
          lk,
          x + lx * (o.rect[0] / 2 - 0.08) - 0.03,
          y,
          z + lz * (o.rect[1] / 2 - 0.08) - 0.03,
          x + lx * (o.rect[0] / 2 - 0.08) + 0.03,
          y + h - 0.05,
          z + lz * (o.rect[1] / 2 - 0.08) + 0.03,
          { seg: false },
        );
      if (o.cloth)
        b.box(
          o.cloth,
          x - o.rect[0] / 2 - 0.05,
          y + h - 0.35,
          z - o.rect[1] / 2 - 0.05,
          x + o.rect[0] / 2 + 0.05,
          y + h + 0.01,
          z + o.rect[1] / 2 + 0.05,
          { seg: false, noAO: true },
        );
    } else {
      b.cyl(tk, x, y + h - 0.04, z, r, r, 0.04, 16, { noAO: true });
      b.cyl(lk, x, y, z, 0.03, 0.05, h - 0.04, 6);
      b.cyl(lk, x, y, z, 0.25, 0.28, 0.03, 10);
      if (o.cloth)
        b.cyl(o.cloth, x, y + h - 0.3, z, r + 0.04, r + 0.12, 0.32, 16, {
          open: true,
          noAO: true,
        });
    }
  };
  /** Theatre seat row along ±x starting at (x0,z) facing -z (toward the stage) unless ry given. */
  D.seatRow = function (b, x0, x1, y, z, ry, o) {
    o = o || {};
    const n = Math.floor(Math.abs(x1 - x0) / 0.56);
    const r = P.rng(x0 * 3.1 + z * 7.7 + y);
    for (let i = 0; i < n; i++) {
      const x = Math.min(x0, x1) + 0.28 + i * 0.56;
      if (r() < (o.missing || 0.08)) continue;
      const tip = r() < 0.12 ? 0.6 : 0;
      const M = P.m4(x, y, z, ry || 0);
      b.geo(
        "iron",
        new THREE.BoxGeometry(0.05, 0.62, 0.5).translate(-0.27, 0.31, 0),
        M,
        { noAO: true },
      );
      b.geo(
        o.seat || "velvet",
        new THREE.BoxGeometry(0.46, 0.1, 0.44)
          .rotateX(tip)
          .translate(0, 0.44, 0.02),
        M,
        { noAO: true, grime: 0.35 },
      );
      b.geo(
        o.seat || "velvet",
        new THREE.BoxGeometry(0.48, 0.55, 0.08)
          .rotateX(-0.12)
          .translate(0, 0.72, -0.22),
        M,
        { noAO: true, grime: 0.35 },
      );
      b.geo(
        "wood_dark",
        new THREE.BoxGeometry(0.05, 0.05, 0.4).translate(0.27, 0.64, -0.02),
        M,
        { noAO: true },
      );
    }
  };
  D.sofa = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      fk = o.fabric || "velvet",
      w = o.w || 1.9;
    b.geo(fk, new THREE.BoxGeometry(w, 0.42, 0.8).translate(0, 0.26, 0), M, {
      noAO: true,
      grime: 0.35,
    });
    b.geo(
      fk,
      new THREE.BoxGeometry(w, 0.55, 0.2)
        .translate(0, 0.66, -0.32)
        .rotateX(-0.1),
      M,
      { noAO: true, grime: 0.35 },
    );
    for (const s of [-1, 1])
      b.geo(
        fk,
        new THREE.BoxGeometry(0.18, 0.28, 0.8).translate(
          s * (w / 2 - 0.09),
          0.58,
          0,
        ),
        M,
        { noAO: true },
      );
    for (const s of [-1, 1])
      for (const t of [-1, 1])
        b.geo(
          "wood_dark",
          new THREE.BoxGeometry(0.06, 0.08, 0.06).translate(
            s * (w / 2 - 0.08),
            0.02,
            t * 0.34,
          ),
          M,
          { noAO: true },
        );
  };
  /** Bed (single/double, optional four-poster). */
  D.bed = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      w = o.w || 1.5,
      L = 2.05,
      wk = o.wood || "wood_dark";
    b.geo(wk, new THREE.BoxGeometry(w, 0.3, L).translate(0, 0.25, 0), M, {
      noAO: true,
    });
    b.geo(
      o.sheet || "fabric_white",
      new THREE.BoxGeometry(w - 0.08, 0.18, L - 0.1).translate(0, 0.49, 0.02),
      M,
      { noAO: true, grime: 0.55 },
    );
    b.geo(
      o.cover || "velvet",
      new THREE.BoxGeometry(w - 0.02, 0.06, L * 0.6)
        .translate(0, 0.6, 0.35)
        .rotateX(0.02),
      M,
      { noAO: true, grime: 0.4 },
    );
    for (const s of [-1, 1])
      b.geo(
        "fabric_white",
        new THREE.BoxGeometry(w * 0.4, 0.12, 0.35).translate(
          s * w * 0.22,
          0.64,
          -L / 2 + 0.3,
        ),
        M,
        { noAO: true, grime: 0.5 },
      );
    b.geo(
      wk,
      new THREE.BoxGeometry(w + 0.1, 1.0, 0.08).translate(0, 0.6, -L / 2),
      M,
      { noAO: true },
    );
    b.geo(
      wk,
      new THREE.BoxGeometry(w + 0.1, 0.6, 0.08).translate(0, 0.4, L / 2),
      M,
      { noAO: true },
    );
    if (o.posts)
      for (const s of [-1, 1])
        for (const t of [-1, 1]) {
          b.geo(
            wk,
            new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6).translate(
              s * (w / 2 + 0.02),
              1.1,
              (t * L) / 2,
            ),
            M,
            { noAO: true },
          );
          if (o.canopy)
            b.geo(
              o.canopy,
              new THREE.BoxGeometry(w + 0.2, 0.3, L + 0.1).translate(0, 2.1, 0),
              M,
              { noAO: true },
            );
        }
  };
  /** Grand piano (lid propped). */
