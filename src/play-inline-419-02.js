// play-inline-419 02 — tint
// Lines 20-345 of readable/play-inline-419.pretty.js (statement-aligned).
  const EV = G._ph2;
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
    // pane: rectangle + fan. With o.view (a K.roomView neon rect) a lit window shows the painted, lamplit room behind
    // it instead of a blank lightbox: dark backing + additive room painting in the rectangle, a warm fanlight above.
    const view = st === "lit" && o.view;
    if (view) {
      b.quadN(
        "paint_black",
        P(-R, 0, d0),
        P(R, 0, d0),
        P(R, hr, d0),
        P(-R, hr, d0),
        n,
        { tint: [0.03, 0.03, 0.03] },
      );
      b.quad(
        "neon",
        P(-R, 0, d0 + 0.006),
        P(R, 0, d0 + 0.006),
        P(R, hr, d0 + 0.006),
        P(-R, hr, d0 + 0.006),
        { rect: view, grime: 0, tint: o.viewTint || [1, 1, 1] },
      );
    } else
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
      b.quadN(back, C, A, B, B, n, {
        tint: view ? tint.map((v) => v * 0.55) : tint,
        grime: 0.2,
      });
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

  /**
   * INTERIOR-side daylight window (round 2): a glowing pane seen from inside a lit room, with a real frame, muntins,
   * a deep sill/reveal and (optionally) a segmental brick arch head, torn blind or iron bars — instead of a bare white
   * rectangle. (x, yb, z) = bottom centre ON the wall plane, (nx,nz) = the wall's INWARD normal (into the room).
   * o: {cols, rows, frame (mat), frameTint, sky (pane tint), dirty (0..1 grime streak), arch (brick mat or false),
   *     archTint, bars (bool), blind (0..1 drawn fraction), shutter (true = one leaf of an iron shutter hangs open),
   *     light (intensity; bakes a soft spill into the room), lightR, box}
   */
  K.intWindow = function (b, x, yb, z, nx, nz, w, h, o) {
    o = o || {};
    // (x,z) lies on the wall's INNER surface: the pane sits just in front of it, the casing/reveal stands proud into the room
    const rx = -nz,
      rz = nx,
      n = [nx, 0, nz],
      yaw = Math.atan2(nx, nz);
    const P = (u, v, d) => [x + rx * u + nx * d, yb + v, z + rz * u + nz * d];
    const sky = o.sky || [0.6, 0.64, 0.62],
      fm = o.frame || "wood_dark",
      ft = o.frameTint || [0.36, 0.3, 0.24];
    const rev = o.reveal || 0.2,
      d0 = 0.03,
      rm = o.revealMat || "plaster",
      rt = o.revealTint || [0.5, 0.46, 0.4];
    // pane (emissive daylight) + a dirt band across the lower third
    b.quadN(
      "lamp",
      P(-w / 2, 0, d0),
      P(w / 2, 0, d0),
      P(w / 2, h, d0),
      P(-w / 2, h, d0),
      n,
      { tint: sky },
    );
    b.quadN(
      "lamp",
      P(-w / 2, 0, d0 + 0.004),
      P(w / 2, 0, d0 + 0.004),
      P(w / 2, h * 0.28, d0 + 0.004),
      P(-w / 2, h * 0.28, d0 + 0.004),
      n,
      { tint: sky.map((v) => v * 0.55) },
    );
    // casing box: jambs + head soffit standing proud of the wall, trim boards on the room face, sill board
    for (const e of [-1, 1])
      b.quadN(
        rm,
        P((e * w) / 2, 0, d0),
        P((e * w) / 2, 0, rev),
        P((e * w) / 2, h, rev),
        P((e * w) / 2, h, d0),
        [-rx * e, 0, -rz * e],
        { tint: rt },
      );
    b.quadN(
      rm,
      P(-w / 2, h, rev),
      P(w / 2, h, rev),
      P(w / 2, h, d0),
      P(-w / 2, h, d0),
      [0, -1, 0],
      { tint: rt.map((v) => v * 0.8) },
    );
    for (const e of [-1, 1]) {
      const c = P(e * (w / 2 + 0.06), h / 2, rev);
      b.box(fm, c[0], yb - 0.02, c[2], 0.12, h + 0.14, 0.05, { yaw, tint: ft });
    }
    {
      const c = P(0, h, rev);
      b.box(fm, c[0], yb + h, c[2], w + 0.26, 0.14, 0.05, { yaw, tint: ft });
    }
    {
      const S = P(0, 0, rev * 0.5 + 0.05);
      b.box(o.sillMat || fm, S[0], yb - 0.06, S[2], w + 0.3, 0.06, rev + 0.12, {
        yaw,
        tint: ft,
      });
    }
    // sash frame + muntins on the glass
    const cols = o.cols || 2,
      rows = o.rows || 3,
      df = d0 + 0.03;
    const bar = (a, c, t) =>
      b.beam(fm, a[0], a[1], a[2], c[0], c[1], c[2], t, 0.04, {
        tint: ft,
        grime: 0.2,
      });
    bar(P(-w / 2 + 0.04, 0, df), P(-w / 2 + 0.04, h, df), 0.08);
    bar(P(w / 2 - 0.04, 0, df), P(w / 2 - 0.04, h, df), 0.08);
    bar(P(-w / 2, h - 0.04, df), P(w / 2, h - 0.04, df), 0.08);
    bar(P(-w / 2, 0.04, df), P(w / 2, 0.04, df), 0.08);
    for (let i = 1; i < cols; i++) {
      const u = -w / 2 + (w * i) / cols;
      bar(P(u, 0, df), P(u, h, df), 0.04);
    }
    for (let j = 1; j < rows; j++) {
      const v = (h * j) / rows;
      bar(
        P(-w / 2, v, df),
        P(w / 2, v, df),
        j === Math.round(rows / 2) && rows > 2 ? 0.065 : 0.04,
      );
    }
    if (o.bars)
      for (let i = 1; i < 5; i++) {
        const u = -w / 2 + (w * i) / 5,
          a = P(u, -0.02, rev - 0.04),
          c = P(u, h + 0.02, rev - 0.04);
        b.pipe("black_iron", a[0], a[1], a[2], c[0], c[1], c[2], 0.018, 4);
      }
    if (o.blind) {
      const bh = h * o.blind;
      b.quadN(
        "canvas_tarp",
        P(-w / 2 + 0.03, h - bh, df + 0.03),
        P(w / 2 - 0.03, h - bh * 0.85, df + 0.03),
        P(w / 2 - 0.03, h, df + 0.03),
        P(-w / 2 + 0.03, h, df + 0.03),
        n,
        { tint: [0.62, 0.56, 0.42], grime: 0.4 },
      );
    }
    if (o.arch)
      for (let k = 0; k < 7; k++) {
        const t0 = -1 + (2 * k) / 7,
          t1 = -1 + (2 * (k + 1)) / 7,
          a = P(t0 * (w / 2 + 0.14), h + 0.14 + 0.2 * (1 - t0 * t0), 0.04),
          c = P(t1 * (w / 2 + 0.14), h + 0.14 + 0.2 * (1 - t1 * t1), 0.04);
        b.beam(o.arch, a[0], a[1], a[2], c[0], c[1], c[2], 0.24, 0.07, {
          tint: o.archTint || [0.5, 0.36, 0.3],
        });
      }
    // daylight spill: a soft baked light a metre into the room
    if (o.light !== 0) {
      const L = P(0, h * 0.55, 1.3);
      b.light(
        L[0],
        L[1],
        L[2],
        o.lightColor || [0.72, 0.76, 0.76],
        o.light || 0.6,
        o.lightR || 6,
        { box: o.box },
      );
    }
  };

  /** Georgian sash window: w×h opening, muntins (cols×rows per sash), limestone lintel with keystone. o: {state, frame, lintel, surround} */
