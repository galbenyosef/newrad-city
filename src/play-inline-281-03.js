// play-inline-281 03 — noao
// Lines 351-699 of readable/play-inline-281.pretty.js (statement-aligned).
  K.batten = function (b, a, c, y, o) {
    o = o || {};
    b.rod("iron", [a[0], y, a[1]], [c[0], y, c[1]], 0.035, 6, { noAO: true });
    const L = Math.hypot(c[0] - a[0], c[1] - a[1]),
      n = Math.floor(L / (o.step || 1.2));
    const r = P.rng(a[0] + a[1] * 3 + y);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      if (r() < 0.2) continue;
      K.lantern(
        b,
        a[0] + (c[0] - a[0]) * t,
        y - 0.3,
        a[1] + (c[1] - a[1]) * t,
        (o.ry || 0) + (r() - 0.5) * 0.5,
        0.5 + r() * 0.5,
        { lit: o.lit && r() < (o.litFrac || 0.4), lens: o.lens },
      );
    }
    // lift lines to the grid
    if (o.lines !== false)
      for (const t of [0.15, 0.5, 0.85])
        b.rod(
          "iron",
          [a[0] + (c[0] - a[0]) * t, y, a[1] + (c[1] - a[1]) * t],
          [
            a[0] + (c[0] - a[0]) * t,
            y + (o.lineH || 6),
            a[1] + (c[1] - a[1]) * t,
          ],
          0.008,
          3,
          { noAO: true },
        );
  };
  /** Studio boom microphone stand. */
  K.boom = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU;
      b.geo(
        "iron",
        new THREE.BoxGeometry(0.04, 0.04, 0.5)
          .translate(0, 0.05, 0.25)
          .rotateY(a),
        M,
        { noAO: true },
      );
    }
    b.geo(
      "steel",
      new THREE.CylinderGeometry(0.03, 0.03, 1.9, 6).translate(0, 0.95, 0),
      M,
      { noAO: true },
    );
    b.geo(
      "steel",
      new THREE.CylinderGeometry(0.02, 0.02, 2.6, 5)
        .rotateX(HP - 0.25)
        .translate(0, 1.95, 0.9),
      M,
      { noAO: true },
    );
    b.geo(
      "chrome",
      new THREE.CapsuleGeometry()
        ? new THREE.CapsuleGeometry(0.05, 0.14, 3, 6).rotateX(HP)
        : new THREE.CylinderGeometry(0.05, 0.05, 0.2, 6).rotateX(HP),
      P.m4(0, 2.25, 2.15).premultiply(M),
      { noAO: true },
    );
  };
  /** Old-fashioned standing microphone (vintage broadcast mic). */
  K.standMic = function (b, x, y, z, ry) {
    const M = P.m4(x, y, z, ry);
    b.geo("iron", new THREE.CylinderGeometry(0.14, 0.16, 0.03, 10), M, {
      noAO: true,
    });
    b.geo(
      "chrome",
      new THREE.CylinderGeometry(0.012, 0.012, 1.45, 5).translate(0, 0.72, 0),
      M,
      { noAO: true },
    );
    b.geo(
      "chrome",
      new THREE.BoxGeometry(0.1, 0.16, 0.06).translate(0, 1.5, 0),
      M,
      { noAO: true },
    );
    b.geo(
      "iron",
      new THREE.BoxGeometry(0.08, 0.12, 0.065).translate(0, 1.5, 0),
      M,
      { noAO: true },
    );
  };

  // ---------------------------------------------------------------
  // Rooftop / facade furniture
  // ---------------------------------------------------------------
  /** Classic NYC wooden water tower on a steel stand. */
  K.waterTower = function (b, x, y, z, r, h, o) {
    o = o || {};
    const legH = o.legH || 3;
    for (const [lx, lz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      b.box(
        "rust",
        x + lx * r * 0.7 - 0.12,
        y,
        z + lz * r * 0.7 - 0.12,
        x + lx * r * 0.7 + 0.12,
        y + legH,
        z + lz * r * 0.7 + 0.12,
        { seg: false },
      );
    for (const s of [-1, 1]) {
      b.rod(
        "rust",
        [x - r * 0.7, y + 0.4, z + s * r * 0.7],
        [x + r * 0.7, y + legH - 0.3, z + s * r * 0.7],
        0.03,
        3,
      );
      b.rod(
        "rust",
        [x + s * r * 0.7, y + 0.4, z - r * 0.7],
        [x + s * r * 0.7, y + legH - 0.3, z + r * 0.7],
        0.03,
        3,
      );
    }
    b.box(
      "rust",
      x - r - 0.1,
      y + legH,
      z - r - 0.1,
      x + r + 0.1,
      y + legH + 0.2,
      z + r + 0.1,
      { seg: false },
    );
    b.cyl(o.key || "wood_rotten", x, y + legH + 0.2, z, r * 0.96, r, h, 14, {
      hSeg: 3,
    });
    for (let k = 0; k < 4; k++)
      b.torus(
        "iron",
        x,
        y + legH + 0.5 + (k * (h - 0.6)) / 3,
        z,
        r + 0.02,
        0.03,
        TAU,
        { rx: HP, ts: 18, rs: 3, noAO: true },
      );
    b.cyl(
      o.roof || "wood_rotten",
      x,
      y + legH + 0.2 + h,
      z,
      0.08,
      r * 1.08,
      r * 0.7,
      14,
      {},
    );
    b.rod(
      "iron",
      [x, y + legH + 0.2 + h, z],
      [x, y + legH + h + r * 0.7 + 0.8, z],
      0.03,
      4,
    );
    b.rod(
      "iron",
      [x + r, y + legH + 0.2, z],
      [x + r + 0.05, y + legH + h, z],
      0.02,
      3,
    );
  };
  /** Lattice broadcast mast (triangular section). Adds a red aircraft light (visual only). */
  K.mast = function (b, x, y, z, h, w, o) {
    o = o || {};
    const pts = [0, 1, 2].map((k) => [
      x + Math.cos((k / 3) * TAU) * w,
      z + Math.sin((k / 3) * TAU) * w,
    ]);
    const segs = Math.round(h / 1.6);
    for (let k = 0; k < 3; k++) {
      const a = pts[k],
        c = pts[(k + 1) % 3];
      b.rod(
        o.key || "rust",
        [a[0], y, a[1]],
        [a[0] * 0.85 + x * 0.15, y + h, a[1] * 0.85 + z * 0.15],
        0.05,
        4,
        { noAO: true },
      );
      for (let s = 0; s < segs; s++) {
        const t0 = s / segs,
          t1 = (s + 1) / segs,
          sh0 = 1 - 0.15 * t0,
          sh1 = 1 - 0.15 * t1;
        const A0 = [x + (a[0] - x) * sh0, y + h * t0, z + (a[1] - z) * sh0],
          C1 = [x + (c[0] - x) * sh1, y + h * t1, z + (c[1] - z) * sh1];
        b.rod(o.key || "rust", A0, C1, 0.018, 3, { noAO: true });
        if (s % 2 === 0) {
          const C0 = [x + (c[0] - x) * sh0, y + h * t0, z + (c[1] - z) * sh0];
          b.rod(o.key || "rust", A0, C0, 0.018, 3, { noAO: true });
        }
      }
    }
    b.sphere(o.dead ? "glass_dark" : "lamp_red", x, y + h + 0.15, z, 0.14, {
      ws: 6,
      hs: 4,
      noAO: true,
      noBake: true,
    });
  };
  /** Fire escape on a facade F: stacked platforms with zig-zag stairs, from floor yFirst every dy, n levels, u0..u1 wide. */
  K.fireEscape = function (F, u0, u1, yFirst, dy, n, o) {
    o = o || {};
    const k = o.key || "rust";
    for (let i = 0; i < n; i++) {
      const y = yFirst + i * dy;
      F.box(k, u0, u1, y - 0.08, y, 0.05, 1.3, { seg: false });
      // railing
      F.box(k, u0, u1, y + 0.95, y + 1.0, 1.25, 1.3, { seg: false });
      for (let u = u0; u <= u1 + 0.01; u += 0.5)
        F.box(k, u - 0.015, u + 0.015, y, y + 0.95, 1.26, 1.29, { seg: false });
      for (const uu of [u0, u1])
        F.box(k, uu - 0.02, uu + 0.02, y, y + 1.0, 0.05, 1.3, { seg: false });
      // stair to the next platform (diagonal)
      if (i < n - 1) {
        const dir = i % 2 ? 1 : -1,
          ua = dir > 0 ? u0 + 0.3 : u1 - 0.3,
          ub = dir > 0 ? u1 - 1.2 : u0 + 1.2;
        const A = F.pt(ua, 0.75),
          B = F.pt(ub, 0.75);
        F.S.b.rod(k, [A[0], y, A[1]], [B[0], y + dy, B[1]], 0.35, 4, {
          square: true,
          r2: 0.03,
        });
      }
      // brackets
      for (const uu of [u0 + 0.3, u1 - 0.3]) {
        const A = F.pt(uu, 0.05),
          B = F.pt(uu, 1.2);
        F.S.b.rod(k, [A[0], y - 0.9, A[1]], [B[0], y - 0.05, B[1]], 0.02, 3);
      }
    }
    // drop ladder
    const L = F.pt(u1 - 0.4, 1.2);
    F.S.b.rod(k, [L[0], yFirst - 2.6, L[1]], [L[0], yFirst, L[1]], 0.02, 3);
  };
  /** Gothic pinnacle (square shaft + pyramid). */
  K.pinnacle = function (b, key, x, y, z, s, h) {
    b.box(key, x - s, y, z - s, x + s, y + h * 0.55, z + s, { seg: false });
    b.geo(
      key,
      new THREE.ConeGeometry(s * 1.2, h * 0.45, 4).rotateY(PI / 4),
      P.m4(x, y + h * 0.55 + h * 0.225, z),
      { noAO: true },
    );
    b.sphere(key, x, y + h + 0.05, z, s * 0.45, { ws: 5, hs: 4, noAO: true });
  };
  /** Pointed (gothic) arch ring, extruded, in a facade F at u, springing at y, half-width r, ring thickness th, depth d0..d1. */
  function archPts(r, R, cx, N, rightToLeft) {
    // left arc: centre (+cx, 0), radius R, from (-r', 0) up to the apex
    const a1 = Math.acos(-cx / R),
      out = [];
    for (let i = 0; i <= N; i++) {
      const a = PI + (a1 - PI) * (i / N);
      out.push([cx + Math.cos(a) * R, Math.sin(a) * R]);
    }
    return rightToLeft ? out : out;
  }
  K.gothicArch = function (F, key, u, y, r, th, d0, d1, o) {
    const R = r * 1.6,
      cx = R - r,
      R2 = R + th,
      N = 8;
    const outerL = archPts(r + th, R2, cx, N),
      innerL = archPts(r, R, cx, N);
    const sh = new THREE.Shape();
    sh.moveTo(outerL[0][0], 0);
    for (const p of outerL) sh.lineTo(p[0], p[1]);
    for (let i = N; i >= 0; i--) sh.lineTo(-outerL[i][0], outerL[i][1]);
    sh.lineTo(-innerL[0][0], 0);
    for (let i = 0; i <= N; i++) sh.lineTo(-innerL[i][0], innerL[i][1]);
    for (let i = N; i >= 0; i--) sh.lineTo(innerL[i][0], innerL[i][1]);
    sh.closePath();
    return F.S.b.extrude(
      key,
      sh,
      d1 - d0,
      F.mat(u, y, d0),
      Object.assign({ curve: 4 }, o || {}),
    );
  };
  /** Filled pointed-arch panel (glass / tympanum) matching K.gothicArch's opening. */
  K.gothicFill = function (F, key, u, y, r, d, o) {
    const R = r * 1.6,
      cx = R - r,
      N = 8,
      L = archPts(r, R, cx, N);
    const sh = new THREE.Shape();
    sh.moveTo(L[0][0], 0);
    for (const p of L) sh.lineTo(p[0], p[1]);
    for (let i = N; i >= 0; i--) sh.lineTo(-L[i][0], L[i][1]);
    sh.closePath();
    return F.S.b.geo(
      key,
      new THREE.ShapeGeometry(sh, 4),
      F.mat(u, y, d),
      Object.assign({ uv: "box", noAO: true, grime: 0.1 }, o || {}),
    );
  };
  /** Same pointed-arch outline as a standalone shape (for interior prosceniums / windows), local XY. */
  K.gothicShape = function (r, R0) {
    const R = R0 || r * 1.6,
      cx = R - r,
      N = 10,
      L = archPts(r, R, cx, N);
    const sh = new THREE.Shape();
    sh.moveTo(L[0][0], 0);
    for (const p of L) sh.lineTo(p[0], p[1]);
    for (let i = N; i >= 0; i--) sh.lineTo(-L[i][0], L[i][1]);
    sh.closePath();
    return sh;
  };
  /** Pointed arch height above springing for half-width r (matches gothicArch). */
  K.gothicRise = (r) => {
    const R = r * 1.6,
      cx = R - r;
    return Math.sqrt(R * R - cx * cx);
  };

  // ---------------------------------------------------------------
  // 1950s transit bus (GM "old look"-style), rusted. Length along local +z (front at +z).
  // ---------------------------------------------------------------
