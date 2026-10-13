// play-inline-85 14 — the
// Lines 2991-3323 of readable/play-inline-85.pretty.js (statement-aligned).
  function lobbyEntrance(px, pz, nx, nz, ux, uz, cx, cz) {
    const r = M.rng("lobby" + Math.round(px * 3) + "," + Math.round(pz * 3));
    const hw = DOOR_HW,
      H = DOOR_H,
      vd = 1.0,
      LD = 4.6,
      LW = 3.2;
    // local frame: t along the façade (ux,uz), d into the building (−n)
    const P = (t, d, y) => [px + ux * t - nx * d, y, pz + uz * t - nz * d];
    const Q = (b, t0, d0, t1, d1, y0, y1, n, c, cTop) =>
      M.quad(
        b,
        P(t0, d0, y0),
        P(t1, d1, y0),
        P(t1, d1, y1),
        P(t0, d0, y1),
        n,
        [0, 0, 1, 0, 1, 1, 0, 1],
        c,
        cTop || c,
      );
    const st = M.buf("stone_limestone", cx, cz),
      cn = M.buf("concrete", cx, cz);
    const inward = [-nx, 0, -nz];
    // vestibule: stone reveals, soffit, worn step
    Q(
      st,
      -hw,
      0,
      -hw,
      vd,
      0,
      H,
      [ux, 0, uz],
      [0.5, 0.48, 0.44],
      [0.62, 0.6, 0.55],
    );
    Q(
      st,
      hw,
      vd,
      hw,
      0,
      0,
      H,
      [-ux, 0, -uz],
      [0.5, 0.48, 0.44],
      [0.62, 0.6, 0.55],
    );
    M.quad(
      st,
      P(-hw, 0, H),
      P(hw, 0, H),
      P(hw, vd, H),
      P(-hw, vd, H),
      [0, -1, 0],
      [0, 0, 1, 0, 1, 0.3, 0, 0.3],
      [0.42, 0.4, 0.37],
    );
    M.quad(
      st,
      P(-hw, 0, 0.14),
      P(hw, 0, 0.14),
      P(hw, vd, 0.14),
      P(-hw, vd, 0.14),
      [0, 1, 0],
      [0, 0, 1, 0, 1, 0.3, 0, 0.3],
      [0.62, 0.6, 0.56],
    );
    M.quad(
      st,
      P(-hw, -0.02, 0),
      P(hw, -0.02, 0),
      P(hw, -0.02, 0.14),
      P(-hw, -0.02, 0.14),
      [nx, 0, nz],
      [0, 0, 1, 0, 1, 0.05, 0, 0.05],
      [0.55, 0.53, 0.5],
    );
    // door wall at the back of the vestibule (above/around the doors), transom glass
    const bz = M.buf("metal_painted", cx, cz, "detail");
    const BR = [0.32, 0.26, 0.18];
    Q(st, -hw, vd, -hw + 0.08, vd, 0, H, [nx, 0, nz], [0.45, 0.43, 0.4]);
    Q(st, hw - 0.08, vd, hw, vd, 0, H, [nx, 0, nz], [0.45, 0.43, 0.4]);
    M.beam(
      bz,
      P(-hw, vd, 2.85)[0],
      2.85,
      P(-hw, vd, 2.85)[2],
      P(hw, vd, 2.85)[0],
      2.85,
      P(hw, vd, 2.85)[2],
      0.12,
      0.12,
      { c: BR },
    );
    M.quad(
      M.buf("glass_dirty", cx, cz),
      P(-hw + 0.08, vd + 0.02, 2.92),
      P(hw - 0.08, vd + 0.02, 2.92),
      P(hw - 0.08, vd + 0.02, H - 0.05),
      P(-hw + 0.08, vd + 0.02, H - 0.05),
      [nx, 0, nz],
      [0, 0, 1, 0, 1, 0.3, 0, 0.3],
      [0.2, 0.22, 0.2],
    );
    // two door leaves (1.2 m each): left closed with a broken pane, right swung inward
    const leaf = (hx, hz, dirx, dirz, open) => {
      const w = hw - 0.1,
        h = 2.8;
      const a = open,
        ca = Math.cos(a),
        sa = Math.sin(a);
      // leaf runs from the hinge along (dirx,dirz) rotated by `open` towards the inside
      const ex = dirx * ca + -nx * sa,
        ez = dirz * ca + -nz * sa;
      const E = (t, y) => [hx + ex * t, y, hz + ez * t];
      const fr = (a0, a1, y0, y1) =>
        M.beam(
          bz,
          E(a0, y0)[0],
          y0,
          E(a0, y0)[2],
          E(a1, y1)[0],
          y1,
          E(a1, y1)[2],
          0.1,
          0.07,
          { c: BR },
        );
      fr(0.05, 0.05, 0, h);
      fr(w - 0.05, w - 0.05, 0, h);
      fr(0.05, w - 0.05, h - 0.05, h - 0.05);
      fr(0.05, w - 0.05, 0.9, 0.9);
      fr(0.05, w - 0.05, 0.05, 0.05);
      M.quad(
        bz,
        E(0.1, 0.1),
        E(w - 0.1, 0.1),
        E(w - 0.1, 0.85),
        E(0.1, 0.85),
        [-ez, 0, ex].map((v) => v * (dirx * nz - dirz * nx >= 0 ? 1 : -1)),
        [0, 0, 1, 0, 1, 1, 0, 1],
        M.mulc(BR, 1.2),
      );
      if (!open || r() < 0.6)
        M.quad(
          M.buf("glass_dirty", cx, cz, "detail"),
          E(0.1, 0.95),
          E(w - 0.1, 0.95),
          E(w - 0.1, h - 0.1),
          E(0.1, h - 0.1),
          [nx, 0, nz],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.35, 0.38, 0.36],
        );
    };
    const hl = P(-hw + 0.08, vd + 0.02, 0),
      hr = P(hw - 0.08, vd + 0.02, 0);
    leaf(hl[0], hl[2], ux, uz, r() < 0.3 ? 0.4 : 0);
    leaf(hr[0], hr[2], -ux, -uz, r.range(0.9, 1.4));
    // the lobby (dim): floor, walls with a dado, ceiling
    const lw = LW,
      d0 = vd + 0.05,
      d1 = vd + LD;
    const fl = M.buf("concrete", cx, cz);
    const FC = r.pick([
      [0.42, 0.4, 0.36],
      [0.38, 0.36, 0.34],
      [0.46, 0.42, 0.36],
    ]);
    M.quad(
      fl,
      P(-lw, d0, 0.02),
      P(lw, d0, 0.02),
      P(lw, d1, 0.02),
      P(-lw, d1, 0.02),
      [0, 1, 0],
      [0, 0, 2, 0, 2, 2, 0, 2],
      FC,
      M.mulc(FC, 0.7),
    );
    const WC = r.pick([
      [0.36, 0.33, 0.28],
      [0.3, 0.32, 0.3],
      [0.38, 0.32, 0.28],
    ]);
    Q(
      cn,
      -lw,
      d1,
      -lw,
      d0,
      0,
      4.2,
      [ux, 0, uz],
      M.mulc(WC, 0.7),
      M.mulc(WC, 0.5),
    );
    Q(
      cn,
      lw,
      d0,
      lw,
      d1,
      0,
      4.2,
      [-ux, 0, -uz],
      M.mulc(WC, 0.7),
      M.mulc(WC, 0.5),
    );
    Q(
      cn,
      -lw,
      d1,
      lw,
      d1,
      0,
      4.2,
      [nx, 0, nz],
      M.mulc(WC, 0.62),
      M.mulc(WC, 0.42),
    );
    M.quad(
      cn,
      P(-lw, d0, 4.2),
      P(-lw, d1, 4.2),
      P(lw, d1, 4.2),
      P(lw, d0, 4.2),
      [0, -1, 0],
      [0, 0, 1, 0, 1, 1, 0, 1],
      [0.2, 0.19, 0.18],
    );
    // dado rail & dark wood wainscot on the back wall
    const wd = M.buf("wood_rotten", cx, cz, "detail");
    Q(
      wd,
      -lw,
      d1 - 0.03,
      lw,
      d1 - 0.03,
      0,
      1.1,
      [nx, 0, nz],
      [0.26, 0.2, 0.16],
      [0.3, 0.24, 0.18],
    );
    // brass mailbox bank on the back wall
    const mbx = r() < 0.5 ? -lw + 0.4 : 0.3,
      rows = 4,
      colsN = 6;
    const myaw = Math.atan2(-uz, ux); // obox local X → the façade tangent
    for (let i = 0; i < rows; i++) {
      // one strip per row of little doors (a few sprung open: dark)
      const q = P(mbx + colsN * 0.15, d1 - 0.06, 0),
        y = 1.3 + i * 0.26;
      M.obox(bz, q[0], y + 0.11, q[2], colsN * 0.3, 0.22, 0.05, myaw, {
        c: M.mulc([0.5, 0.42, 0.24], 0.8 + r() * 0.3),
        s: 1,
        skip: 32,
      });
    }
    for (let j = 0; j <= colsN; j++) {
      const q = P(mbx + j * 0.3, d1 - 0.1, 0);
      M.box(
        bz,
        q[0] - 0.015,
        1.3,
        q[2] - 0.015,
        q[0] + 0.015,
        1.3 + rows * 0.26,
        q[2] + 0.015,
        { s: 1, c: [0.2, 0.16, 0.1], skip: 8 + 4 },
      );
    }
    // foot of the stairs on the far side
    const sx0 = mbx < 0 ? lw - 1.3 : -lw + 0.1;
    for (let i = 0; i < 6; i++) {
      const y1 = (i + 1) * 0.18,
        dd = d1 - 0.3 - i * 0.28;
      M.box(
        M.buf("stone_limestone", cx, cz, "detail"),
        Math.min(P(sx0, dd, 0)[0], P(sx0 + 1.2, dd - 0.28, 0)[0]),
        0,
        Math.min(P(sx0, dd, 0)[2], P(sx0 + 1.2, dd - 0.28, 0)[2]),
        Math.max(P(sx0, dd, 0)[0], P(sx0 + 1.2, dd - 0.28, 0)[0]),
        y1,
        Math.max(P(sx0, dd, 0)[2], P(sx0 + 1.2, dd - 0.28, 0)[2]),
        { s: 1, c: M.mulc([0.52, 0.5, 0.46], 1 - i * 0.05) },
      );
    }
    // dead pendant lamp, leaves & grime drifted in, a daylight pool from the open door
    const lp = P(0, (d0 + d1) / 2, 0);
    M.pipe(bz, lp[0], 4.2, lp[2], lp[0], 3.4, lp[2], 0.015, 3, {
      c: [0.2, 0.2, 0.2],
    });
    M.cyl(
      M.buf("glass_dirty", cx, cz, "detail"),
      lp[0],
      3.1,
      lp[2],
      0.12,
      0.28,
      0.3,
      8,
      { c: [0.4, 0.38, 0.3] },
    );
    const mk = M.buf("my/markings", cx, cz, "fine");
    for (let i = 0; i < 3; i++) {
      const q = P(r.range(-lw + 0.8, lw - 0.8), r.range(d0 + 0.5, d1 - 0.6), 0);
      M.decal(
        mk,
        q[0],
        0.04,
        q[2],
        r.range(1, 2),
        r.range(1, 2),
        r() * 6,
        r() < 0.6 ? M.MARK.LEAVES : M.MARK.DIRT,
      );
    }
    const pool = P(0.3, d0 + 1.1, 0);
    M.lightPool(
      M.buf("my/lightfx", cx, cz, "detail"),
      pool[0],
      0.05,
      pool[2],
      1.5,
      1.5,
      [0.11, 0.1, 0.08],
    );
    void inward;
  }
