// play-inline-395 02 — tint
// Lines 21-352 of readable/play-inline-395.pretty.js (statement-aligned).
  const PV = G._pv3;
  const K = PV.kit;
  const PI = Math.PI;

  /**
   * Pointed (equilateral) Gothic window. (x,z) centre on the wall surface, yb = sill, facing (nx,nz),
   * w wide, h total height to the apex. o: {state, paneTint, surround, tintA, tintB (alternating voussoirs),
   * fw, depth, sill, mullion, rose (small oculus in the head)}
   */
  K.lancet = function (b, x, yb, z, nx, nz, w, h, o) {
    o = o || {};
    const rx = nz,
      rz = -nx,
      R = w / 2;
    const apex = w * 0.866;
    const hr = Math.max(0.15, h - apex);
    const P = (u, v, d) => [x + rx * u + nx * d, yb + v, z + rz * u + nz * d];
    const n = [nx, 0, nz];
    const st = o.state || "glass";
    const back =
      st === "glass"
        ? "glass"
        : st === "lit"
          ? "lamp"
          : st === "boarded"
            ? "wood_rotten"
            : "paint_black";
    const tint =
      o.paneTint ||
      (st === "glass"
        ? [0.36, 0.44, 0.44]
        : st === "lit"
          ? [0.95, 0.66, 0.36]
          : st === "boarded"
            ? [0.55, 0.47, 0.4]
            : [0.03, 0.03, 0.03]);
    const d0 = 0.015,
      N = 6;
    // arch curve points (left half then right half), u/v in wall space
    const arc = [];
    for (let i = 0; i <= N; i++) {
      const t = PI - ((PI / 3) * i) / N;
      arc.push([R + w * Math.cos(t), hr + w * Math.sin(t)]);
    }
    for (let i = N - 1; i >= 0; i--) {
      const q = arc[i];
      arc.push([-q[0], q[1]]);
    }
    b.quadN(back, P(-R, 0, d0), P(R, 0, d0), P(R, hr, d0), P(-R, hr, d0), n, {
      tint,
      grime: 0.2,
    });
    for (let i = 0; i < arc.length - 1; i++) {
      const A = P(arc[i][0], arc[i][1], d0),
        B = P(arc[i + 1][0], arc[i + 1][1], d0),
        C = P(0, hr, d0);
      b.quadN(back, C, A, B, B, n, { tint, grime: 0.2 });
    }
    if (st === "broken") {
      const r = K.rng((x * 13 + yb * 7 + z * 3) | 0);
      for (let k = 0; k < 3; k++) {
        const u = (r() - 0.5) * w * 0.7;
        b.quadN(
          "glass",
          P(u - 0.1, 0, d0 + 0.004),
          P(u + 0.14, 0, d0 + 0.004),
          P(u + 0.03, 0.3 + r() * 0.6, d0 + 0.004),
          P(u, 0.2 + r() * 0.5, d0 + 0.004),
          n,
          { tint: [0.45, 0.52, 0.52] },
        );
      }
    }
    if (st === "boarded") {
      const r = K.rng((x * 11 + yb * 5 + z * 7) | 0);
      for (let i = 0; i < 3; i++) {
        const yy = 0.3 + (i * (hr - 0.3)) / 2;
        const a = P(-R - 0.08, yy + (r() - 0.5) * 0.2, 0.1),
          c = P(R + 0.08, yy + (r() - 0.5) * 0.2, 0.1);
        b.beam("wood_rotten", a[0], a[1], a[2], c[0], c[1], c[2], 0.22, 0.03, {
          tint: [0.7, 0.6, 0.5],
        });
      }
    } else if (o.mullion !== false) {
      const fm = o.frame || "paint_black";
      const m0 = P(0, 0, d0 + 0.03),
        m1 = P(0, hr + apex * 0.55, d0 + 0.03);
      b.beam(fm, m0[0], m0[1], m0[2], m1[0], m1[1], m1[2], 0.06, 0.05, {
        grime: 0.2,
      });
      for (const v of [hr * 0.5, hr]) {
        const t0 = P(-R, v, d0 + 0.03),
          t1 = P(R, v, d0 + 0.03);
        b.beam(fm, t0[0], t0[1], t0[2], t1[0], t1[1], t1[2], 0.05, 0.04, {
          grime: 0.2,
        });
      }
      if (o.rose !== false && w > 0.9) {
        const c = P(0, hr + apex * 0.5, d0 + 0.035);
        b.geo(fm, new THREE.TorusGeometry(R * 0.36, 0.035, 4, 12), {
          x: c[0],
          y: c[1],
          z: c[2],
          ry: Math.atan2(nx, nz),
          grime: 0.2,
        });
      }
    }
    // polychrome surround: jambs + voussoirs alternating light stone / red brick
    const sm = o.surround || "limestone",
      fw = o.fw || 0.2,
      dep = o.depth !== undefined ? o.depth : 0.14;
    const tA = o.tintA || [0.9, 0.86, 0.76],
      tB = o.tintB || [0.72, 0.38, 0.3];
    for (const s of [-1, 1]) {
      const a = P(s * (R + fw / 2), 0, dep / 2),
        c = P(s * (R + fw / 2), hr, dep / 2);
      b.beam(sm, a[0], a[1], a[2], c[0], c[1], c[2], fw, dep, { tint: tA });
    }
    const ring = [];
    const Rr = w + fw / 2; // radius of the voussoir ring centreline
    for (let i = 0; i <= N; i++) {
      const t = PI - ((PI / 3) * i) / N;
      ring.push([R + Rr * Math.cos(t), hr + Rr * Math.sin(t)]);
    }
    for (let i = N - 1; i >= 0; i--) {
      const q = ring[i];
      ring.push([-q[0], q[1]]);
    }
    for (let i = 0; i < ring.length - 1; i++) {
      const A = P(ring[i][0], ring[i][1], dep / 2),
        B = P(ring[i + 1][0], ring[i + 1][1], dep / 2);
      b.beam(sm, A[0], A[1], A[2], B[0], B[1], B[2], fw, dep, {
        tint: i % 2 ? tB : tA,
      });
    }
    if (o.sill !== false) {
      const s = P(0, -0.07, dep * 0.6);
      b.box(
        o.sillMat || sm,
        s[0],
        s[1] - 0.06,
        s[2],
        w + fw * 2 + 0.2,
        0.13,
        dep * 1.5,
        { yaw: Math.atan2(nx, nz), tint: tA },
      );
    }
  };

  /**
   * Gabled roof over x0..x1 / z0..z1. axis 'x' → ridge runs along x (slopes face ±z). yE eave, yR ridge.
   * o: {mat (roof), tint, gable (wall mat for the triangle ends, false = none), gableTint, over (eave overhang),
   *     crest (iron cresting on the ridge), ends: 'both'|'a'|'b'|'none'}
   */
  K.pitchRoof = function (b, x0, x1, z0, z1, yE, yR, axis, o) {
    o = o || {};
    const mat = o.mat || "slate",
      t = o.tint || [0.42, 0.44, 0.48],
      ov = o.over !== undefined ? o.over : 0.4;
    const ends = o.ends || "both";
    if (axis === "x") {
      const zm = (z0 + z1) / 2;
      b.quadN(
        mat,
        [x0 - ov, yE - 0.15, z1 + ov],
        [x1 + ov, yE - 0.15, z1 + ov],
        [x1 + ov, yR, zm],
        [x0 - ov, yR, zm],
        [0, 1, 1],
        { tint: t, grime: 0.4 },
      );
      b.quadN(
        mat,
        [x1 + ov, yE - 0.15, z0 - ov],
        [x0 - ov, yE - 0.15, z0 - ov],
        [x0 - ov, yR, zm],
        [x1 + ov, yR, zm],
        [0, 1, -1],
        { tint: t.map((v) => v * 0.85), grime: 0.4 },
      );
      if (o.gable !== false) {
        const gm = o.gable || "brick_red",
          gt = o.gableTint || [0.8, 0.5, 0.4];
        if (ends === "both" || ends === "a")
          b.quadN(
            gm,
            [x0, yE, z1],
            [x0, yE, z0],
            [x0, yR - 0.05, zm],
            [x0, yR - 0.05, zm],
            [-1, 0, 0],
            { tint: gt },
          );
        if (ends === "both" || ends === "b")
          b.quadN(
            gm,
            [x1, yE, z0],
            [x1, yE, z1],
            [x1, yR - 0.05, zm],
            [x1, yR - 0.05, zm],
            [1, 0, 0],
            { tint: gt },
          );
      }
      b.beam(
        "black_iron",
        x0 - ov,
        yR + 0.05,
        zm,
        x1 + ov,
        yR + 0.05,
        zm,
        0.14,
        0.12,
        { tint: [0.25, 0.24, 0.22] },
      );
      if (o.crest)
        for (let x = x0; x <= x1; x += 0.35)
          b.beam(
            "black_iron",
            x,
            yR + 0.1,
            zm,
            x,
            yR + 0.45 + (Math.round((x - x0) / 0.35) % 3 === 0 ? 0.2 : 0),
            zm,
            0.03,
            0.03,
          );
    } else {
      const xm = (x0 + x1) / 2;
      b.quadN(
        mat,
        [x1 + ov, yE - 0.15, z1 + ov],
        [x1 + ov, yE - 0.15, z0 - ov],
        [xm, yR, z0 - ov],
        [xm, yR, z1 + ov],
        [1, 1, 0],
        { tint: t, grime: 0.4 },
      );
      b.quadN(
        mat,
        [x0 - ov, yE - 0.15, z0 - ov],
        [x0 - ov, yE - 0.15, z1 + ov],
        [xm, yR, z1 + ov],
        [xm, yR, z0 - ov],
        [-1, 1, 0],
        { tint: t.map((v) => v * 0.85), grime: 0.4 },
      );
      if (o.gable !== false) {
        const gm = o.gable || "brick_red",
          gt = o.gableTint || [0.8, 0.5, 0.4];
        if (ends === "both" || ends === "a")
          b.quadN(
            gm,
            [x0, yE, z0],
            [x1, yE, z0],
            [xm, yR - 0.05, z0],
            [xm, yR - 0.05, z0],
            [0, 0, -1],
            { tint: gt },
          );
        if (ends === "both" || ends === "b")
          b.quadN(
            gm,
            [x1, yE, z1],
            [x0, yE, z1],
            [xm, yR - 0.05, z1],
            [xm, yR - 0.05, z1],
            [0, 0, 1],
            { tint: gt },
          );
      }
      b.beam(
        "black_iron",
        xm,
        yR + 0.05,
        z0 - ov,
        xm,
        yR + 0.05,
        z1 + ov,
        0.14,
        0.12,
        { tint: [0.25, 0.24, 0.22] },
      );
      if (o.crest)
        for (let z = z0; z <= z1; z += 0.35)
          b.beam(
            "black_iron",
            xm,
            yR + 0.1,
            z,
            xm,
            yR + 0.45 + (Math.round((z - z0) / 0.35) % 3 === 0 ? 0.2 : 0),
            z,
            0.03,
            0.03,
          );
    }
  };

  /** Pyramid roof / spire over a w×d rectangle centred (cx,cz), base y0, height h. o: {mat, tint, over, apex:[dx,dz]} */
  K.pyramid = function (b, cx, cz, w, d, y0, h, o) {
    o = o || {};
    const mat = o.mat || "slate",
      t = o.tint || [0.42, 0.44, 0.48],
      ov = o.over || 0;
    const hw = w / 2 + ov,
      hd = d / 2 + ov,
      A = [cx, y0 + h, cz];
    const c = [
      [cx - hw, y0, cz + hd],
      [cx + hw, y0, cz + hd],
      [cx + hw, y0, cz - hd],
      [cx - hw, y0, cz - hd],
    ];
    const nrm = [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, -1],
      [-1, 1, 0],
    ];
    for (let i = 0; i < 4; i++)
      b.quadN(mat, c[i], c[(i + 1) % 4], A, A, nrm[i], {
        tint: t.map((v) => v * (0.8 + 0.07 * i)),
        grime: o.grime !== undefined ? o.grime : 0.35,
      });
  };

  /** Stone string-courses along a façade line A→B (wall surface), projecting to (nx,nz), at the given heights. */
