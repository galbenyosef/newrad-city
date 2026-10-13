// play-inline-273 06 — add
// Lines 1109-1433 of readable/play-inline-273.pretty.js (statement-aligned).
  X.seal = function (b, key, x, y, z, ry, s, pose) {
    s = s || 1;
    const M = P.m4(x, y, z, ry, 0, 0, s);
    const add = (g, m) =>
      b.geo(key, g, M.clone().multiply(m), { noAO: true, grime: 0.45 });
    if (pose === "lie") {
      add(
        new THREE.SphereGeometry(1, 12, 8),
        P.m4(0, 0.28, 0, 0, 0, 0, 0.32, 0.28, 0.9),
      );
      add(
        new THREE.SphereGeometry(0.2, 10, 8),
        P.m4(0, 0.42, 0.78, 0, 0, 0, 1, 0.9, 1.25),
      );
      add(new THREE.ConeGeometry(0.1, 0.16, 8).rotateX(HP), P.m4(0, 0.4, 1.02));
      for (const sd of [-1, 1])
        add(
          new THREE.BoxGeometry(0.34, 0.04, 0.16),
          P.m4(sd * 0.36, 0.08, 0.3, sd * 0.6, 0, sd * 0.3),
        );
      for (const sd of [-1, 1])
        add(
          new THREE.BoxGeometry(0.24, 0.03, 0.3),
          P.m4(sd * 0.12, 0.08, -0.95, sd * 0.4),
        );
      return;
    }
    // upright: body curves up from tail to raised head
    add(
      new THREE.SphereGeometry(1, 12, 8),
      P.m4(0, 0.38, -0.25, 0, -0.5, 0, 0.34, 0.3, 0.72),
    );
    add(
      new THREE.SphereGeometry(1, 12, 8),
      P.m4(0, 0.85, 0.12, 0, -1.1, 0, 0.27, 0.24, 0.5),
    );
    add(
      new THREE.SphereGeometry(0.19, 10, 8),
      P.m4(0, 1.32, 0.28, 0, -0.2, 0, 1, 0.95, 1.2),
    );
    add(
      new THREE.ConeGeometry(0.09, 0.18, 8).rotateX(HP),
      P.m4(0, 1.3, 0.5, 0, 0.15),
    );
    for (const sd of [-1, 1])
      add(new THREE.SphereGeometry(0.03, 5, 4), P.m4(sd * 0.09, 1.38, 0.42));
    for (const sd of [-1, 1])
      add(
        new THREE.BoxGeometry(0.36, 0.04, 0.18),
        P.m4(sd * 0.3, 0.62, 0.3, sd * 0.3, 0.5, sd * 0.6),
      );
    for (const sd of [-1, 1])
      add(
        new THREE.BoxGeometry(0.22, 0.03, 0.3),
        P.m4(sd * 0.13, 0.06, -0.85, sd * 0.35),
      );
  };

  /** Department-store mannequin (smooth, faceless). pose: 'stand'|'hip'|'wave'|'headless'|'fallen'. dress: fabric key or null */
  X.mannequin = function (b, x, y, z, ry, o) {
    o = o || {};
    const k = o.key || "mannequin",
      M = P.m4(x, y, z, ry, 0, 0, o.s || 1);
    if (o.pose === "fallen") M.multiply(P.m4(0, 0.18, 0, 0, HP * 0.98, 0.1));
    const add = (g, m, kk) =>
      b.geo(kk || k, g, M.clone().multiply(m || new THREE.Matrix4()), {
        noAO: true,
        grime: o.grime === undefined ? 0.3 : o.grime,
      });
    // stand base + rod
    if (o.pose !== "fallen" && o.stand !== false) {
      add(
        new THREE.CylinderGeometry(0.2, 0.22, 0.03, 12).translate(0, 0.015, 0),
        null,
        "chrome",
      );
      add(
        new THREE.CylinderGeometry(0.012, 0.012, 0.35, 4).translate(
          0,
          0.2,
          -0.05,
        ),
        null,
        "chrome",
      );
    }
    // legs
    for (const sd of [-1, 1])
      add(
        new THREE.CylinderGeometry(0.065, 0.045, 0.86, 7).translate(0, 0.46, 0),
        P.m4(sd * 0.09, 0.02, 0, 0, 0, sd * 0.04),
      );
    // hips, waist, chest
    add(
      new THREE.SphereGeometry(1, 10, 7),
      P.m4(0, 0.95, 0, 0, 0, 0, 0.17, 0.12, 0.12),
    );
    add(
      new THREE.CylinderGeometry(0.15, 0.12, 0.42, 9).translate(0, 0.21, 0),
      P.m4(0, 0.95, 0),
    );
    add(
      new THREE.SphereGeometry(1, 10, 7),
      P.m4(0, 1.33, 0.01, 0, 0, 0, 0.19, 0.13, 0.12),
    );
    add(
      new THREE.CylinderGeometry(0.04, 0.05, 0.12, 6).translate(0, 0.06, 0),
      P.m4(0, 1.42, 0),
    );
    if (o.pose !== "headless") {
      add(
        new THREE.SphereGeometry(0.1, 10, 8),
        P.m4(0, 1.62, 0.01, 0, 0.1, 0, 0.9, 1.2, 1),
      );
      if (o.wig)
        add(
          new THREE.SphereGeometry(0.108, 10, 6, 0, TAU, 0, PI * 0.55),
          P.m4(0, 1.64, -0.005),
          o.wig,
        );
      if (o.hat)
        add(
          new THREE.CylinderGeometry(0.16, 0.18, 0.04, 12),
          P.m4(0, 1.72, 0),
          o.hat,
        );
    }
    // arms
    const pose = o.pose || "stand";
    for (const sd of [-1, 1]) {
      const raise =
        pose === "wave" && sd > 0 ? -2.6 : pose === "hip" ? 0.5 : 0.12;
      if (o.armless && sd < 0) continue;
      add(
        new THREE.CylinderGeometry(0.035, 0.028, 0.62, 6).translate(
          0,
          -0.31,
          0,
        ),
        P.m4(sd * 0.2, 1.38, 0, 0, pose === "hip" ? 0.2 : 0, sd * raise),
      );
    }
    // garment
    if (o.dress)
      add(
        new THREE.CylinderGeometry(
          0.16,
          o.skirt ? 0.34 : 0.19,
          o.skirt ? 0.95 : 0.6,
          10,
          1,
          true,
        ).translate(0, o.skirt ? -0.05 : 0.2, 0),
        P.m4(0, o.skirt ? 1.0 : 1.05, 0),
        o.dress,
      );
    if (o.dress)
      add(
        new THREE.CylinderGeometry(0.18, 0.16, 0.36, 10, 1, true).translate(
          0,
          0.18,
          0,
        ),
        P.m4(0, 1.18, 0),
        o.dress,
      );
  };

  /** Chrome clothes rack with hanging garments. */
  X.rack = function (b, x, y, z, ry, o) {
    o = o || {};
    const M = P.m4(x, y, z, ry),
      L = o.len || 1.4,
      r = P.rng(x * 3 + z * 7);
    const add = (k, g) => b.geo(k, g, M, { noAO: true, grime: 0.35 });
    for (const s of [-1, 1]) {
      add(
        "chrome",
        new THREE.CylinderGeometry(0.015, 0.015, 1.45, 4).translate(
          (s * L) / 2,
          0.72,
          0,
        ),
      );
      add(
        "chrome",
        new THREE.BoxGeometry(0.04, 0.03, 0.5).translate((s * L) / 2, 0.02, 0),
      );
    }
    add(
      "chrome",
      new THREE.CylinderGeometry(0.012, 0.012, L, 4)
        .rotateZ(HP)
        .translate(0, 1.44, 0),
    );
    const n = Math.floor(L / 0.08);
    for (let i = 0; i < n; i++) {
      if (r() < (o.sparse || 0.3)) continue;
      const u = -L / 2 + 0.06 + (i * (L - 0.12)) / n,
        hh = 0.6 + r() * 0.45;
      add(
        "clothes",
        new THREE.BoxGeometry(0.025, hh, 0.42)
          .translate(u, 1.4 - hh / 2, 0)
          .rotateY((r() - 0.5) * 0.2),
      );
    }
    if (o.fallen)
      for (let i = 0; i < 4; i++)
        add(
          "clothes",
          new THREE.BoxGeometry(0.5, 0.03, 0.4)
            .rotateY(r() * 3)
            .translate((r() - 0.5) * L, 0.02, (r() - 0.5) * 1.2),
        );
  };

  /**
   * Escalator: from (x, y0, z) climbing toward dir ('n'|'s'|'e'|'w') to y1. Visual: steel steps, glass balustrades,
   * black rubber handrails, a steel truss underneath. Colliders: steps (walkable) + side walls.
   */
  X.escalator = function (S, x, z, dir, y0, y1, o) {
    o = o || {};
    const b = S.b,
      W = o.w || 1.3;
    const st = S.stairs("steel", x, z, dir, W, y0, y1, {
      rise: 0.25,
      run: 0.42,
      solid: false,
      nosing: "brass",
    });
    const dx = dir === "e" ? 1 : dir === "w" ? -1 : 0,
      dz = dir === "s" ? 1 : dir === "n" ? -1 : 0;
    const L = st.len,
      H = y1 - y0;
    const sx = dz ? 1 : 0,
      sz = dx ? 1 : 0; // side axis
    for (const s of [-1, 1]) {
      const ox = sx * s * (W / 2 + 0.08),
        oz = sz * s * (W / 2 + 0.08);
      // balustrade: glass panel strips + rubber handrail
      const nSeg = Math.max(2, Math.round(L / 1.2));
      for (let i = 0; i < nSeg; i++) {
        const t0 = i / nSeg,
          t1 = (i + 1) / nSeg;
        const ax = x + ox + dx * L * t0,
          az = z + oz + dz * L * t0,
          bx = x + ox + dx * L * t1,
          bz = z + oz + dz * L * t1;
        const ya = y0 + H * t0,
          yb = y0 + H * t1;
        const cx = (ax + bx) / 2,
          cz = (az + bz) / 2,
          cy = (ya + yb) / 2 + 0.5;
        const len = Math.hypot(bx - ax, bz - az, yb - ya);
        const ang = Math.atan2(yb - ya, Math.hypot(bx - ax, bz - az));
        const ryv = dx ? 0 : HP,
          rz = dx ? ang * dx : 0,
          rx = dz ? -ang * dz : 0;
        void ryv;
        b.box(
          i % 5 === 3 && o.broken ? "glass_broken" : "glass",
          cx - (dx ? len / 2 : 0.02),
          cy - 0.45,
          cz - (dz ? len / 2 : 0.02),
          cx + (dx ? len / 2 : 0.02),
          cy + 0.45,
          cz + (dz ? len / 2 : 0.02),
          { rz, rx, seg: false, noAO: true },
        );
      }
      b.rod(
        "rubber",
        [x + ox, y0 + 1.0, z + oz],
        [x + ox + dx * L, y1 + 1.0, z + oz + dz * L],
        0.045,
        5,
        { noAO: true },
      );
      b.rod(
        "steel",
        [x + ox, y0 + 0.02, z + oz],
        [x + ox + dx * L, y1 + 0.02, z + oz + dz * L],
        0.08,
        4,
        { noAO: true, square: true, r2: 0.12 },
      );
      // side collider (a rotated slab is hard: use stepped boxes)
      const n = Math.ceil(L / 0.8);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n,
          px = x + ox + dx * L * t,
          pz = z + oz + dz * L * t,
          py = y0 + H * t;
        S.col(
          px - (dx ? 0.45 : 0.06),
          py - 0.6,
          pz - (dz ? 0.45 : 0.06),
          px + (dx ? 0.45 : 0.06),
          py + 1.05,
          pz + (dz ? 0.45 : 0.06),
          { walkable: false, tag: "rail" },
        );
      }
    }
    // underside truss (steel box girder)
    const n2 = 6;
    for (let i = 0; i < n2; i++) {
      const t0 = i / n2,
        t1 = (i + 1) / n2;
      b.box(
        "steel",
        Math.min(x + dx * L * t0, x + dx * L * t1) - (dx ? 0 : W / 2 + 0.1),
        y0 + H * t0 - 0.9,
        Math.min(z + dz * L * t0, z + dz * L * t1) - (dz ? 0 : W / 2 + 0.1),
        Math.max(x + dx * L * t0, x + dx * L * t1) + (dx ? 0 : W / 2 + 0.1),
        y0 + H * t1 - 0.25,
        Math.max(z + dz * L * t0, z + dz * L * t1) + (dz ? 0 : W / 2 + 0.1),
        { seg: false, grime: 0.5 },
      );
    }
    return st;
  };

  /** Shop awning (sloped canvas + valance with lettering) on a facade F at u, above y. */
