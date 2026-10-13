// play-inline-85 12 — topy
// Lines 2579-2881 of readable/play-inline-85.pretty.js (statement-aligned).
  function bay(b, P, tL, tR, topY, nx, nz, kind, r, cx, cz, deco, depthAvail) {
    const rec = 0.3;
    const A = P(tL, 0),
      B = P(tR, 0),
      Ai = P(tL, -rec),
      Bi = P(tR, -rec);
    // reveals (jambs)
    const bj = M.buf(deco ? "granite" : "concrete_dark", cx, cz);
    const jc = [0.5, 0.48, 0.45];
    const ul = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1,
      jux = (B[0] - A[0]) / ul,
      juz = (B[1] - A[1]) / ul;
    M.quad(
      bj,
      [A[0], 0, A[1]],
      [Ai[0], 0, Ai[1]],
      [Ai[0], topY, Ai[1]],
      [A[0], topY, A[1]],
      [jux, 0, juz],
      [0, 0, 0.1, 0, 0.1, 1, 0, 1],
      jc,
    );
    M.quad(
      bj,
      [Bi[0], 0, Bi[1]],
      [B[0], 0, B[1]],
      [B[0], topY, B[1]],
      [Bi[0], topY, Bi[1]],
      [-jux, 0, -juz],
      [0, 0, 0.1, 0, 0.1, 1, 0, 1],
      jc,
    );
    M.quad(
      bj,
      [Ai[0], topY, Ai[1]],
      [Bi[0], topY, Bi[1]],
      [B[0], topY, B[1]],
      [A[0], topY, A[1]],
      [0, -1, 0],
      [0, 0, 1, 0, 1, 0.1, 0, 0.1],
      jc,
    );
    const bulk = 0.65;
    if (kind === "open") {
      // gaping hole: a dim, looted shop interior behind it (not a black void)
      M.shopInterior(
        P,
        tL,
        tR,
        topY,
        nx,
        nz,
        r,
        cx,
        cz,
        Math.min(3.4, Math.max(1.6, depthAvail || 3)),
        "open",
      );
      return;
    }
    // bulkhead
    const bk = M.buf(deco ? "granite" : "metal_painted", cx, cz);
    M.quad(
      bk,
      [Ai[0], 0, Ai[1]],
      [Bi[0], 0, Bi[1]],
      [Bi[0], bulk, Bi[1]],
      [Ai[0], bulk, Ai[1]],
      [nx, 0, nz],
      [0, 0, (tR - tL) / 2, 0, (tR - tL) / 2, 0.3, 0, 0.3],
      deco
        ? [0.6, 0.58, 0.55]
        : r.pick([
            [0.35, 0.4, 0.38],
            [0.45, 0.3, 0.25],
            [0.3, 0.3, 0.35],
          ]),
    );
    if (kind === "boarded") {
      const bw = M.buf("wood_planks", cx, cz);
      M.quad(
        bw,
        [Ai[0] + nx * 0.2, bulk, Ai[1] + nz * 0.2],
        [Bi[0] + nx * 0.2, bulk, Bi[1] + nz * 0.2],
        [Bi[0] + nx * 0.2, topY, Bi[1] + nz * 0.2],
        [Ai[0] + nx * 0.2, topY, Ai[1] + nz * 0.2],
        [nx, 0, nz],
        [0, 0, (tR - tL) / 1.2, 0, (tR - tL) / 1.2, topY / 1.2, 0, topY / 1.2],
        [0.75, 0.68, 0.55],
      );
      // cross battens
      const bd = M.buf("wood_planks", cx, cz, "detail");
      M.beam(
        bd,
        Ai[0] + nx * 0.25,
        bulk + 0.3,
        Ai[1] + nz * 0.25,
        Bi[0] + nx * 0.25,
        topY - 0.4,
        Bi[1] + nz * 0.25,
        0.18,
        0.04,
        { c: [0.6, 0.52, 0.4] },
      );
    } else if (kind === "shutter") {
      const bs = M.buf("corrugated", cx, cz);
      const down = topY * r.range(0.35, 1);
      M.quad(
        bs,
        [Ai[0] + nx * 0.05, topY - down, Ai[1] + nz * 0.05],
        [Bi[0] + nx * 0.05, topY - down, Bi[1] + nz * 0.05],
        [Bi[0] + nx * 0.05, topY, Bi[1] + nz * 0.05],
        [Ai[0] + nx * 0.05, topY, Ai[1] + nz * 0.05],
        [nx, 0, nz],
        [0, 0, (tR - tL) / 2, 0, (tR - tL) / 2, down / 2, 0, down / 2],
        [0.7, 0.66, 0.6],
      );
      const gl = M.buf("glass_dirty", cx, cz);
      if (topY - down > bulk)
        M.quad(
          gl,
          [Ai[0], bulk, Ai[1]],
          [Bi[0], bulk, Bi[1]],
          [Bi[0], topY - down, Bi[1]],
          [Ai[0], topY - down, Ai[1]],
          [nx, 0, nz],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.15, 0.15, 0.15],
        );
    } else {
      const broken = r() < 0.62;
      // display window: the shop behind is visible — through dirty glass, or through the shattered pane
      M.shopInterior(
        P,
        tL,
        tR,
        topY,
        nx,
        nz,
        r,
        cx,
        cz,
        Math.min(3.4, Math.max(1.6, depthAvail || 3)),
        broken ? "broken" : "glass",
      );
      const gl = M.buf(
        broken ? "glass_dirty" : "glass_dirty@window",
        cx,
        cz,
        broken ? "detail" : "main",
      );
      if (broken) {
        // only jagged shards left in the frame
        const Pg = (t, y) => {
          const q = P(t, -rec + 0.02);
          return [q[0], y, q[1]];
        };
        for (let k = 0; k < 3; k++) {
          const t = tL + r() * (tR - tL - 0.5);
          M.tri(
            gl,
            Pg(t, bulk),
            Pg(t + 0.5, bulk),
            Pg(t + 0.2, bulk + r.range(0.3, 1.2)),
            [nx, 0, nz],
            [0, 0, 1, 0, 0.5, 1],
            [0.5, 0.55, 0.5],
          );
        }
        for (let k = 0; k < 2; k++) {
          const t = tL + r() * (tR - tL - 0.6);
          M.tri(
            gl,
            Pg(t, topY),
            Pg(t + 0.6, topY),
            Pg(t + 0.3, topY - r.range(0.3, 1)),
            [nx, 0, nz],
            [0, 0, 1, 0, 0.5, 1],
            [0.5, 0.55, 0.5],
          );
        }
      } else
        M.quad(
          gl,
          [Ai[0], bulk, Ai[1]],
          [Bi[0], bulk, Bi[1]],
          [Bi[0], topY, Bi[1]],
          [Ai[0], topY, Ai[1]],
          [nx, 0, nz],
          [
            0,
            0,
            (tR - tL) / 3,
            0,
            (tR - tL) / 3,
            (topY - bulk) / 3,
            0,
            (topY - bulk) / 3,
          ],
          [0.62, 0.66, 0.6],
        );
      // mullions
      const mb = M.buf("metal_painted", cx, cz, "detail");
      const tm = (tL + tR) / 2;
      const Mi = P(tm, -rec + 0.03);
      M.box(
        mb,
        Mi[0] - 0.04,
        bulk,
        Mi[1] - 0.04,
        Mi[0] + 0.04,
        topY,
        Mi[1] + 0.04,
        { s: 1, c: [0.25, 0.25, 0.25] },
      );
      const T0 = P(tL, -rec + 0.03),
        T1 = P(tR, -rec + 0.03);
      M.beam(
        mb,
        T0[0],
        topY - 0.9,
        T0[1],
        T1[0],
        topY - 0.9,
        T1[1],
        0.06,
        0.06,
        { c: [0.25, 0.25, 0.25] },
      );
    }
  }
  /**
   * 3-D stone sills & lintel hoods under/over the atlas windows of apartment & brownstone façades
   * (street fronts, the three lowest storeys of the window grid) — real relief at grazing angles.
   */
  function windowTrim(ax, az, bx, bz, y0, y1, vBase, uo, style) {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 4) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len,
      nx = uz,
      nz = -ux; // outward normal (M.wall convention)
    const F = M.FACADE,
      tile = TILE();
    const fh = F.floorH,
      bays = F.bays;
    const winW = F.bayW * (style === "brownstone" ? 0.5 : 0.46);
    const sillY = fh * 0.22,
      lintY = fh * 0.8;
    const cxm = (ax + bx) / 2,
      czm = (az + bz) / 2;
    const b = M.buf("stone_limestone", cxm, czm, "detail");
    const yaw = Math.atan2(ux, uz);
    const c = M.mulc(TRIM_C, 0.82);
    let k0 = Math.ceil((y0 - vBase) / fh - 1e-6),
      n = 0;
    for (let k = k0; n < 2; k++, n++) {
      const yb = vBase + k * fh;
      if (yb + lintY + 0.3 > y1) break;
      for (let j = -bays; j < bays * 40; j++) {
        const t = ((j + 0.5) / bays - uo) * tile.w;
        if (t < winW / 2 + 0.3) continue;
        if (t > len - winW / 2 - 0.3) break;
        const px = ax + ux * t + nx * 0.07,
          pz = az + uz * t + nz * 0.07;
        M.obox(b, px, yb + sillY - 0.05, pz, 0.14, 0.1, winW + 0.32, yaw, {
          s: 1,
          c,
          skip: 2 + 16 + 32,
        });
        if (n === 0)
          M.obox(
            b,
            px + nx * 0.02,
            yb + lintY + 0.09,
            pz + nz * 0.02,
            0.16,
            0.16,
            winW + 0.4,
            yaw,
            { s: 1, c: M.mulc(c, 1.05), skip: 2 + 16 + 32 },
          );
      }
    }
  }
  function shopSign(P, tL, tR, y0, y1, nx, nz, r, cx, cz) {
    const a = P(tL, 0.04),
      b = P(tR, 0.04);
    const i = r.int(0, M.SHOP_SIGN_COUNT - 1);
    const uv = M.cellUV(i, 2, 16);
    const bs = M.buf("my/shopsigns", cx, cz, "detail");
    // wall traversal a→b runs right-to-left as seen from outside → u runs b→a
    M.quad(
      bs,
      [a[0], y0, a[1]],
      [b[0], y0, b[1]],
      [b[0], y1, b[1]],
      [a[0], y1, a[1]],
      [nx, 0, nz],
      [uv[2], uv[1], uv[0], uv[1], uv[0], uv[3], uv[2], uv[3]],
      M.mulc([1, 1, 1], r.range(0.7, 1)),
    );
  }
