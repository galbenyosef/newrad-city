// play-inline-87 02 — pilc
// Lines 368-493 of readable/play-inline-87.pretty.js (statement-aligned).
  function storeEdge(e, gf, r, cx, cz, lot, pilMat, pilC, ruined, depthAvail) {
    const B = M._bld;
    const b = M.buf(pilMat, cx, cz);
    const bays = Math.max(1, Math.round(e.len / 4.8));
    const bw = e.len / bays;
    const P = (t, off) => [
      e.ax + e.ux * t + e.nx * off,
      e.az + e.uz * t + e.nz * off,
    ];
    for (let i = 0; i < bays; i++) {
      const t0 = i * bw,
        t1 = (i + 1) * bw,
        pw = 0.45;
      const pa = P(t0, 0),
        pb = P(t0 + pw, 0);
      M.wall(
        b,
        pa[0],
        pa[1],
        pb[0],
        pb[1],
        0,
        gf,
        0,
        0.2,
        0,
        gf / 3,
        M.mulc(pilC, 0.6),
        pilC,
      );
      if (i === bays - 1) {
        const pe = P(t1 - pw, 0),
          pf = P(t1, 0);
        M.wall(
          b,
          pe[0],
          pe[1],
          pf[0],
          pf[1],
          0,
          gf,
          0,
          0.2,
          0,
          gf / 3,
          M.mulc(pilC, 0.6),
          pilC,
        );
      }
      const sa = P(t0 + pw, 0),
        sb = P(t1 - (i === bays - 1 ? pw : 0), 0);
      M.wall(
        b,
        sa[0],
        sa[1],
        sb[0],
        sb[1],
        gf - 1.3,
        gf,
        0,
        (bw - pw) / 3,
        (gf - 1.3) / 3,
        gf / 3,
        M.mulc(pilC, 0.85),
        pilC,
      );
      const bayL = t0 + pw + 0.05,
        bayR = t1 - 0.05 - (i === bays - 1 ? pw : 0);
      if (bayR - bayL < 1.2) continue;
      const roll = r();
      const kind = ruined
        ? roll < 0.25
          ? "boarded"
          : roll < 0.38
            ? "shutter"
            : roll < 0.75
              ? "open"
              : "glass"
        : roll < 0.3
          ? "boarded"
          : roll < 0.5
            ? "shutter"
            : roll < 0.63
              ? "open"
              : "glass";
      B.bay(
        b,
        P,
        bayL,
        bayR,
        gf - 1.3,
        e.nx,
        e.nz,
        kind,
        r,
        cx,
        cz,
        false,
        depthAvail,
      );
      if (r() < 0.75)
        B.shopSign(
          P,
          bayL + 0.1,
          bayR - 0.1,
          gf - 1.2,
          gf - 0.15,
          e.nx,
          e.nz,
          r,
          cx,
          cz,
        );
      if (r() < 0.4) B.awning(P, bayL, bayR, gf - 1.35, e.nx, e.nz, r, cx, cz);
    }
    M.storefronts.push({
      ax: e.ax,
      az: e.az,
      bx: e.bx,
      bz: e.bz,
      nx: e.nx,
      nz: e.nz,
      gf,
      lot,
    });
  }
