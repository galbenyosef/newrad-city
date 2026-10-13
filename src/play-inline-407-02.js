// play-inline-407 02 — tint
// Lines 20-315 of readable/play-inline-407.pretty.js (statement-aligned).
  const EV = G._pf3;
  const K = EV.kit;
  const PI = Math.PI;

  /**
   * Round-arched window. (x,z) = centre on the wall surface, yb = bottom of the opening,
   * facing (nx,nz). w = width, h = total height (arch included).
   * o: {state 'glass'|'broken'|'boarded'|'dark'|'lit', surround mat, surroundTint, fw (surround width),
   *     depth, keystone (bool), sill (bool), mullion (bool), seg (arch segments), paneTint}
   */
  K.archWin = function (b, x, yb, z, nx, nz, w, h, o) {
    o = o || {};
    const rx = nz,
      rz = -nx;
    const R = w / 2,
      hr = Math.max(0.1, h - R);
    const d0 = 0.015;
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
        ? [0.42, 0.5, 0.5]
        : st === "lit"
          ? [0.95, 0.66, 0.36]
          : st === "boarded"
            ? [0.55, 0.47, 0.4]
            : [0.035, 0.035, 0.035]);
    const N = o.seg || 8;
    // pane: rectangle + fan
    b.quadN(back, P(-R, 0, d0), P(R, 0, d0), P(R, hr, d0), P(-R, hr, d0), n, {
      tint,
      grime: 0.2,
    });
    for (let i = 0; i < N; i++) {
      const a0 = (PI * i) / N,
        a1 = (PI * (i + 1)) / N;
      const C = P(0, hr, d0),
        A = P(Math.cos(a0) * R, hr + Math.sin(a0) * R, d0),
        B = P(Math.cos(a1) * R, hr + Math.sin(a1) * R, d0);
      b.quadN(back, C, A, B, B, n, { tint, grime: 0.2 });
    }
    if (st === "broken") {
      const r = K.rng((x * 17 + yb * 5 + z * 3) | 0);
      for (let k = 0; k < 3; k++) {
        const u = (r() - 0.5) * w * 0.7;
        b.quadN(
          "glass",
          P(u - 0.12, 0, d0 + 0.004),
          P(u + 0.16, 0, d0 + 0.004),
          P(u + 0.04, 0.3 + r() * 0.6, d0 + 0.004),
          P(u, 0.25 + r() * 0.5, d0 + 0.004),
          n,
          { tint: [0.45, 0.52, 0.52] },
        );
      }
    }
    const fm = o.frame || "paint_black";
    if (st !== "boarded" && o.mullion !== false) {
      // glazing bars: centre mullion, transom at the springing line, radial bars in the fan
      const m0 = P(0, 0, d0 + 0.03),
        m1 = P(0, hr + R, d0 + 0.03);
      b.beam(fm, m0[0], m0[1], m0[2], m1[0], m1[1], m1[2], 0.05, 0.04, {
        grime: 0.2,
      });
      const t0 = P(-R, hr, d0 + 0.03),
        t1 = P(R, hr, d0 + 0.03);
      b.beam(fm, t0[0], t0[1], t0[2], t1[0], t1[1], t1[2], 0.05, 0.04, {
        grime: 0.2,
      });
      if (hr > 1.2) {
        const q0 = P(-R, hr * 0.5, d0 + 0.03),
          q1 = P(R, hr * 0.5, d0 + 0.03);
        b.beam(fm, q0[0], q0[1], q0[2], q1[0], q1[1], q1[2], 0.04, 0.04, {
          grime: 0.2,
        });
      }
    }
    if (st === "boarded") {
      const r = K.rng((x * 13 + yb * 7 + z * 5) | 0);
      for (let i = 0; i < 3; i++) {
        const yy = 0.3 + (i * (hr - 0.3)) / 2 + (r() - 0.5) * 0.2;
        const a = P(-R - 0.08, yy + (r() - 0.5) * 0.25, 0.12),
          c = P(R + 0.08, yy + (r() - 0.5) * 0.25, 0.12);
        b.beam("wood_rotten", a[0], a[1], a[2], c[0], c[1], c[2], 0.22, 0.03, {
          tint: [0.7, 0.6, 0.5],
        });
      }
    }
    // surround: jambs + arch moulding + keystone + sill
    const sm = o.surround || "brownstone",
      stn = o.surroundTint,
      fw = o.fw || 0.16,
      dep = o.depth !== undefined ? o.depth : 0.16;
    for (const s of [-1, 1]) {
      const a = P(s * (R + fw / 2), 0, dep / 2),
        c = P(s * (R + fw / 2), hr, dep / 2);
      b.beam(sm, a[0], a[1], a[2], c[0], c[1], c[2], fw, dep, { tint: stn });
    }
    for (let i = 0; i < N; i++) {
      const a0 = (PI * i) / N,
        a1 = (PI * (i + 1)) / N,
        rr = R + fw / 2;
      const A = P(Math.cos(a0) * rr, hr + Math.sin(a0) * rr, dep / 2),
        B = P(Math.cos(a1) * rr, hr + Math.sin(a1) * rr, dep / 2);
      // extend a hair so the segments overlap
      const ex = 0.02,
        dx = B[0] - A[0],
        dy = B[1] - A[1],
        dz = B[2] - A[2],
        L = Math.hypot(dx, dy, dz) || 1;
      b.beam(
        sm,
        A[0] - (dx / L) * ex,
        A[1] - (dy / L) * ex,
        A[2] - (dz / L) * ex,
        B[0] + (dx / L) * ex,
        B[1] + (dy / L) * ex,
        B[2] + (dz / L) * ex,
        fw,
        dep,
        { tint: stn },
      );
    }
    if (o.keystone !== false) {
      const k = P(0, hr + R + fw * 0.2, dep * 0.6);
      b.box(sm, k[0], k[1] - 0.22, k[2], w * 0.14 + 0.08, 0.44, dep * 1.2, {
        yaw: Math.atan2(nx, nz),
        tint: stn,
      });
    }
    if (o.sill !== false) {
      const s = P(0, -0.06, dep * 0.6);
      b.box(
        o.sillMat || sm,
        s[0],
        s[1] - 0.06,
        s[2],
        w + fw * 2 + 0.2,
        0.12,
        dep * 1.4,
        { yaw: Math.atan2(nx, nz), tint: stn },
      );
    }
  };

  /** Georgian sash window: w×h opening, muntins (cols×rows per sash), limestone lintel with keystone. o: {state, frame, lintel, surround} */
  K.sash = function (b, x, yb, z, nx, nz, w, h, o) {
    o = o || {};
    const rx = nz,
      rz = -nx,
      d0 = 0.015,
      n = [nx, 0, nz];
    const P = (u, v, d) => [x + rx * u + nx * d, yb + v, z + rz * u + nz * d];
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
      st === "glass"
        ? [0.36, 0.42, 0.42]
        : st === "lit"
          ? o.litTint || [0.95, 0.66, 0.36]
          : st === "boarded"
            ? [0.55, 0.47, 0.4]
            : [0.035, 0.035, 0.035];
    b.quadN(
      back,
      P(-w / 2, 0, d0),
      P(w / 2, 0, d0),
      P(w / 2, h, d0),
      P(-w / 2, h, d0),
      n,
      { tint, grime: 0.2 },
    );
    if (st === "lit" && o.drapes) {
      // lamplit room behind heavy drapes: pulled-back curtains either side, a pelmet, a half-drawn blind
      const dc = o.drapeTint || [0.45, 0.1, 0.08];
      for (const e of [-1, 1])
        b.quadN(
          "fabric",
          P((e * w) / 2, 0, d0 + 0.006),
          P(e * w * 0.22, 0, d0 + 0.006),
          P(e * w * 0.3, h, d0 + 0.006),
          P((e * w) / 2, h, d0 + 0.006),
          n,
          { tint: dc, grime: 0.1 },
        );
      b.quadN(
        "fabric",
        P(-w / 2, h * 0.78, d0 + 0.007),
        P(w / 2, h * 0.78, d0 + 0.007),
        P(w / 2, h, d0 + 0.007),
        P(-w / 2, h, d0 + 0.007),
        n,
        { tint: [0.78, 0.66, 0.46], grime: 0.1 },
      );
    }
    const fm = o.frame || "paint_white";
    if (st !== "boarded") {
      const cols = o.cols || 3,
        rows = o.rows || 4;
      for (let i = 1; i < cols; i++) {
        const u = -w / 2 + (w * i) / cols;
        const a = P(u, 0, d0 + 0.025),
          c = P(u, h, d0 + 0.025);
        b.beam(fm, a[0], a[1], a[2], c[0], c[1], c[2], 0.035, 0.03, {
          grime: 0.15,
        });
      }
      for (let j = 1; j < rows; j++) {
        const v = (h * j) / rows;
        const a = P(-w / 2, v, d0 + 0.025),
          c = P(w / 2, v, d0 + 0.025);
        b.beam(
          fm,
          a[0],
          a[1],
          a[2],
          c[0],
          c[1],
          c[2],
          j === rows / 2 ? 0.07 : 0.035,
          0.03,
          { grime: 0.15 },
        );
      }
    } else {
      const r = K.rng((x * 11 + yb * 3 + z * 7) | 0);
      for (let i = 0; i < 3; i++) {
        const yy = 0.3 + (i * (h - 0.6)) / 2;
        const a = P(-w / 2 - 0.08, yy + (r() - 0.5) * 0.25, 0.1),
          c = P(w / 2 + 0.08, yy + (r() - 0.5) * 0.25, 0.1);
        b.beam("wood_rotten", a[0], a[1], a[2], c[0], c[1], c[2], 0.22, 0.03, {
          tint: [0.7, 0.6, 0.5],
        });
      }
    }
    if (st === "broken") {
      const r = K.rng((x * 17 + yb * 5 + z * 3) | 0);
      for (let k = 0; k < 2; k++) {
        const u = (r() - 0.5) * w * 0.6;
        b.quadN(
          "glass",
          P(u - 0.12, 0, d0 + 0.004),
          P(u + 0.16, 0, d0 + 0.004),
          P(u + 0.04, 0.4 + r() * 0.5, d0 + 0.004),
          P(u, 0.3 + r() * 0.5, d0 + 0.004),
          n,
          { tint: [0.45, 0.52, 0.52] },
        );
      }
    }
    const yaw = Math.atan2(nx, nz),
      sm = o.surround || "limestone",
      stn = o.surroundTint || [0.86, 0.82, 0.74];
    // jambs (thin), lintel with keystone, sill
    for (const s of [-1, 1]) {
      const a = P(s * (w / 2 + 0.06), h / 2, 0.06);
      b.box(sm, a[0], yb, a[2], 0.12, h, 0.12, { yaw, tint: stn });
    }
    const L = P(0, h, 0.09);
    b.box(sm, L[0], yb + h, L[2], w + 0.5, o.lintel || 0.32, 0.18, {
      yaw,
      tint: stn,
    });
    const Kk = P(0, h, 0.14);
    b.box(
      sm,
      Kk[0],
      yb + h - 0.04,
      Kk[2],
      0.26,
      (o.lintel || 0.32) + 0.12,
      0.24,
      { yaw, tint: stn },
    );
    const S = P(0, 0, 0.1);
    b.box(sm, S[0], yb - 0.12, S[2], w + 0.3, 0.12, 0.22, { yaw, tint: stn });
  };

  /** Classical column. kind: 'doric'|'ionic'|'iron'. o: {mat, tint, capMat, base (bool), flutes} */
