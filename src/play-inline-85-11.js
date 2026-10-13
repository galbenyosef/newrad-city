// play-inline-85 11 — len
// Lines 2345-2578 of readable/play-inline-85.pretty.js (statement-aligned).
  function storefrontBand(lot, x0, z0, x1, z1, gf, o) {
    const r = o.r;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const fr = frontSides(lot);
    const sides = [
      ["n", x0, z0, x1, z0, 0, -1],
      ["e", x1, z0, x1, z1, 1, 0],
      ["s", x1, z1, x0, z1, 0, 1],
      ["w", x0, z1, x0, z0, -1, 0],
    ];
    const deco = o.style === "deco";
    const pilMat = deco
      ? o.trim || "granite"
      : r() < 0.5
        ? "stone_limestone"
        : "brick_red";
    const pilC = deco ? [0.75, 0.72, 0.68] : [0.9, 0.86, 0.8];
    for (const [k, ax, az, bx, bz, nx, nz] of sides) {
      const len = Math.hypot(bx - ax, bz - az);
      const ux = (bx - ax) / (len || 1),
        uz = (bz - az) / (len || 1);
      if (!fr[k] || len < 4) {
        // plain ground-floor wall
        const b = M.buf(pilMat, cx, cz);
        M.wall(
          b,
          ax,
          az,
          bx,
          bz,
          0,
          gf,
          0,
          len / 3,
          0,
          gf / 3,
          M.mulc(pilC, 0.65),
          pilC,
        );
        continue;
      }
      const b = M.buf(pilMat, cx, cz);
      const bays = Math.max(1, Math.round(len / (deco ? 6 : 4.8)));
      const bw = len / bays;
      for (let i = 0; i < bays; i++) {
        const t0 = i * bw,
          t1 = (i + 1) * bw;
        const P = (t, off) => [ax + ux * t + nx * off, az + uz * t + nz * off];
        // pilaster at bay start (and final)
        const pw = 0.45;
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
        const pc = P(t0, 0.12),
          pd = P(t0 + pw, 0.12);
        M.box(
          b,
          Math.min(pa[0], pb[0], pc[0], pd[0]),
          0,
          Math.min(pa[1], pb[1], pc[1], pd[1]),
          Math.max(pa[0], pb[0], pc[0], pd[0]),
          gf,
          Math.max(pa[1], pb[1], pc[1], pd[1]),
          { s: 2, c: pilC, skip: 8 },
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
        // sign band
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
        const roll = r();
        const kind = o.ruined
          ? roll < 0.25
            ? "boarded"
            : roll < 0.38
              ? "shutter"
              : roll < 0.75
                ? "open"
                : "glass"
          : roll < 0.24
            ? "boarded"
            : roll < 0.42
              ? "shutter"
              : roll < 0.54
                ? "open"
                : "glass";
        const depthAvail = (k === "n" || k === "s" ? z1 - z0 : x1 - x0) - 1.2;
        bay(
          b,
          P,
          bayL,
          bayR,
          gf - 1.3,
          nx,
          nz,
          kind,
          r,
          cx,
          cz,
          deco,
          depthAvail,
        );
        // shop sign on the band (atlas)
        if (!deco && r() < 0.75)
          shopSign(
            P,
            bayL + 0.1,
            bayR - 0.1,
            gf - 1.2,
            gf - 0.15,
            nx,
            nz,
            r,
            cx,
            cz,
          );
        // awning
        if (!deco && r() < 0.42)
          awning(P, bayL, bayR, gf - 1.35, nx, nz, r, cx, cz);
      }
      // deco: marquee canopy over the main entrance at the middle of the longest front
      if (deco && (k === "n" || k === "s" || len > 20)) {
        const mid = len / 2;
        const P = (t, off) => [ax + ux * t + nx * off, az + uz * t + nz * off];
        const ca = P(mid - 3, 0),
          cb2 = P(mid + 3, 0),
          cc = P(mid + 3, 2.6),
          cd = P(mid - 3, 2.6);
        const mb = M.buf("chrome", cx, cz, "detail");
        const y0 = gf - 1.6;
        M.quad(
          mb,
          [ca[0], y0 + 0.5, ca[1]],
          [cb2[0], y0 + 0.5, cb2[1]],
          [cc[0], y0 + 0.5, cc[1]],
          [cd[0], y0 + 0.5, cd[1]],
          [0, 1, 0],
          [0, 0, 3, 0, 3, 1, 0, 1],
          [0.7, 0.7, 0.68],
        );
        M.quad(
          mb,
          [cd[0], y0, cd[1]],
          [cc[0], y0, cc[1]],
          [cc[0], y0 + 0.5, cc[1]],
          [cd[0], y0 + 0.5, cd[1]],
          [nx, 0, nz],
          [0, 0, 3, 0, 3, 0.3, 0, 0.3],
          [0.6, 0.55, 0.45],
        );
        M.quad(
          mb,
          [cb2[0], y0, cb2[1]],
          [ca[0], y0, ca[1]],
          [cd[0], y0, cd[1]],
          [cc[0], y0, cc[1]],
          [0, -1, 0],
          [0, 0, 3, 0, 3, 1, 0, 1],
          [0.4, 0.4, 0.38],
        );
      }
      M.storefronts.push({ ax, az, bx, bz, nx, nz, gf, lot });
      // steel cellar hatch set into the sidewalk in front of the shop (very New York)
      if (!deco && r() < 0.4 && len > 5) {
        const t = r.range(1.5, len - 2.5),
          hx = ax + ux * t + nx * 1.0,
          hz = az + uz * t + nz * 1.0;
        const hb = M.buf("metal_painted", hx, hz, "fine");
        const hc = r.pick([
          [0.45, 0.42, 0.38],
          [0.35, 0.33, 0.3],
          [0.5, 0.36, 0.28],
        ]);
        M.obox(hb, hx, SY + 0.012, hz, 1.6, 0.03, 1.1, Math.atan2(ux, uz), {
          skip: 8,
          s: 0.6,
          c: hc,
        });
        M.obox(hb, hx, SY + 0.03, hz, 0.06, 0.02, 1.1, Math.atan2(ux, uz), {
          skip: 8,
          c: M.mulc(hc, 0.6),
        });
      }
    }
  }
