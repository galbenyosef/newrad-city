// play-inline-87 03 — math
// Lines 494-884 of readable/play-inline-87.pretty.js (statement-aligned).
  function buildCutLot(lot, r) {
    const B = M._bld,
      L = G.LAYOUT;
    const p = lot.poly,
      E = edges(p);
    const c = centroid(p),
      cx = c[0],
      cz = c[1];
    const ds = L.DISTRICT_STYLE[lot.district] || { minH: 15, maxH: 40 };
    let H = B.heightFor(lot, r);
    const area = Math.abs(M.polyArea(p)),
      th = thickness(p);
    // slender wedges stay low (real Broadway flatirons are 4–12 storeys); broad ones may rise
    H = Math.min(H, 14 + th * 4.2, lot.district === "midtown" ? 72 : 60);
    if (lot.district === "greenwich_village") H = Math.min(H, 26);
    H = Math.max(H, Math.min(ds.minH, 16));
    const style =
      lot.district === "greenwich_village"
        ? r() < 0.6
          ? "apartment"
          : "brownstone"
        : lot.district === "midtown" || lot.district === "financial_district"
          ? r() < 0.55
            ? "artdeco"
            : "office"
          : r() < 0.55
            ? "office"
            : "apartment";
    const fmat = "facade/" + style + "/" + B.chunkVariant(style, cx, cz);
    const tint = r.pick(B.TINTS[style]);
    const burnK = lot.burnt ? 0.52 : 1;
    const gf = 4.8;
    const kinds = E.map((e) =>
      edgeKind(e.ax, e.az, e.bx, e.bz, e.nx, e.nz, lot),
    );
    // ---- ground floor
    // (stone only: brick_red would add a material → a draw call per chunk)
    const pilMat = "stone_limestone",
      pilC = r() < 0.5 ? [0.9, 0.86, 0.8] : [0.78, 0.6, 0.5];
    const ruined = r() < 0.22;
    if (ruined) lot.ruined = true;
    E.forEach((e, i) => {
      if (kinds[i] === "f" && e.len >= 3.2)
        storeEdge(
          e,
          gf,
          r,
          cx,
          cz,
          lot,
          pilMat,
          pilC,
          ruined,
          Math.min(3.2, th * 1.3),
        );
      else
        M.wall(
          M.buf(pilMat, cx, cz),
          e.ax,
          e.az,
          e.bx,
          e.bz,
          0,
          gf,
          0,
          e.len / 3,
          0,
          gf / 3,
          M.mulc(pilC, 0.62 * burnK),
          M.mulc(pilC, burnK),
        );
    });
    // ---- upper storeys: façade atlas on street edges, blank brick on party walls, weathering gradient
    const tile = B.TILE();
    const hsh = M.hash(Math.round(cx * 3), Math.round(cz * 3), 17);
    const vBase = gf - Math.floor(hsh * M.FACADE.floors) * M.FACADE.floorH;
    const topC = M.mulc(tint, 0.92 * burnK),
      midC = M.mulc(tint, burnK),
      lowC = M.mulc(tint, 0.55 * burnK);
    const colAt = (y) =>
      y <= 7
        ? M.mixc(lowC, midC, M.clamp((y - 1) / 6, 0, 1))
        : y <= 20
          ? M.mixc(M.mulc(midC, 0.84), midC, (y - 7) / 13)
          : M.mixc(midC, topC, M.clamp((y - 20) / 60, 0, 1));
    const bf = M.buf(fmat, cx, cz),
      bb = M.buf("brick_brown", cx, cz);
    const cuts = [gf];
    for (const yc of [7, 20]) if (yc > gf + 0.5 && yc < H - 0.5) cuts.push(yc);
    cuts.push(H);
    E.forEach((e, i) => {
      M.wallLog.push({
        ax: e.ax,
        az: e.az,
        bx: e.bx,
        bz: e.bz,
        nx: e.nx,
        nz: e.nz,
        y0: gf,
        y1: H,
        f: kinds[i],
        lot,
        top: true,
      });
      if (kinds[i] === "f") {
        const uo =
          Math.floor(M.hash(e.ax, e.az, 23) * M.FACADE.bays) / M.FACADE.bays;
        for (let q = 0; q < cuts.length - 1; q++)
          M.wall(
            bf,
            e.ax,
            e.az,
            e.bx,
            e.bz,
            cuts[q],
            cuts[q + 1],
            uo,
            uo + e.len / tile.w,
            (cuts[q] - vBase) / tile.h,
            (cuts[q + 1] - vBase) / tile.h,
            colAt(cuts[q]),
            colAt(cuts[q + 1]),
          );
      } else {
        const s = M.sc("brick_brown");
        M.wall(
          bb,
          e.ax,
          e.az,
          e.bx,
          e.bz,
          gf,
          H,
          0,
          e.len / s,
          gf / s,
          H / s,
          M.mulc(tint, 0.7 * burnK),
          M.mulc(tint, 0.95 * burnK),
        );
      }
    });
    // ---- trims: belt course over the shops, cornice with a stepped profile, parapet, roof
    const trim = M.buf("stone_limestone", cx, cz),
      tc = M.mulc(B.TRIM_C, 0.9 * burnK);
    for (const e of E) {
      const yaw = Math.atan2(e.ux, e.uz),
        mx = (e.ax + e.bx) / 2,
        mz = (e.az + e.bz) / 2;
      M.obox(
        trim,
        mx + e.nx * 0.12,
        gf - 0.08,
        mz + e.nz * 0.12,
        0.24,
        0.42,
        e.len + 0.24,
        yaw,
        { s: 2, c: M.mulc(tc, 0.85) },
      );
      if (!ruined) {
        M.obox(
          trim,
          mx + e.nx * 0.2,
          H - 0.95,
          mz + e.nz * 0.2,
          0.4,
          0.5,
          e.len + 0.4,
          yaw,
          { s: 2, c: M.mulc(tc, 0.85) },
        );
        M.obox(
          trim,
          mx + e.nx * 0.45,
          H - 0.45,
          mz + e.nz * 0.45,
          0.9,
          0.55,
          e.len + 0.9,
          yaw,
          { s: 2, c: tc, cb: M.mulc(tc, 0.7) },
        );
      }
      M.obox(
        trim,
        mx - e.nx * 0.15,
        H + 0.45,
        mz - e.nz * 0.15,
        0.3,
        0.9,
        e.len,
        yaw,
        { s: 2, c: tc },
      );
    }
    M.poly(M.buf("roof_tar", cx, cz), p, H + 0.02, {
      s: 4,
      c: [0.85, 0.83, 0.8],
      convex: true,
    });
    // ruined crown: broken parapet chunks & a shell hole or two on the long street face
    if (ruined) {
      const longest = E.reduce(
        (a, e, i) => (kinds[i] === "f" && e.len > a.len ? e : a),
        { len: 0 },
      );
      if (longest.len > 6 && M.shellHole)
        M.shellHole(
          longest.ax,
          longest.az,
          longest.bx,
          longest.bz,
          r.range(0.3, 0.7),
          r.range(8, Math.max(9, H - 4)),
          r.range(2, 4),
          r.range(2, 3.5),
          longest.nx,
          longest.nz,
        );
      if (longest.len > 6)
        M.rubblePile(
          longest.ax + (longest.bx - longest.ax) * 0.5 + longest.nx * 2.5,
          longest.az + (longest.bz - longest.az) * 0.5 + longest.nz * 2.5,
          r.range(1.8, 3.2),
          r.range(0.6, 1.3),
          r,
        );
    }
    // ---- rooftop: stair bulkhead, water tower on bigger roofs, vents
    const inner = M.insetPoly(p, Math.min(2.2, th * 0.45));
    const ib = M.polyBBox(inner);
    if (th > 3.2 && area > 90) {
      const bx0 = cx - 1.5,
        bz0 = cz - 1.7;
      if (M.inPoly(bx0, bz0, inner) && M.inPoly(bx0 + 3, bz0 + 3.5, inner)) {
        M.box(
          M.buf("brick_brown", cx, cz),
          bx0,
          H,
          bz0,
          bx0 + 3,
          H + 3,
          bz0 + 3.5,
          { s: 2.5, c: [0.8, 0.75, 0.7] },
        );
        M.box(
          M.buf("stone_limestone", cx, cz),
          bx0 - 0.1,
          H + 3,
          bz0 - 0.1,
          bx0 + 3.1,
          H + 3.2,
          bz0 + 3.6,
          { s: 3, c: [0.5, 0.5, 0.48] },
        );
      }
      if (r() < 0.5 && M.waterTower && H < 60) {
        for (let k = 0; k < 6; k++) {
          const tx = r.range(ib.x0 + 2.2, ib.x1 - 2.2),
            tz = r.range(ib.z0 + 2.2, ib.z1 - 2.2);
          if (
            M.inPoly(tx, tz, inner) &&
            Math.hypot(tx - cx, tz - cz) > 3.5 &&
            M.distToPoly(tx, tz, p) > 2.4
          ) {
            M.waterTower(tx, H, tz, r.range(0.8, 1.05), r() < 0.12);
            break;
          }
        }
      }
      const vb = M.buf("metal_painted", cx, cz, "detail");
      for (let k = 0; k < 3; k++) {
        const vx = r.range(ib.x0 + 1, ib.x1 - 1),
          vz = r.range(ib.z0 + 1, ib.z1 - 1);
        if (M.inPoly(vx, vz, inner))
          M.box(
            vb,
            vx - 0.5,
            H,
            vz - 0.4,
            vx + 0.5,
            H + r.range(0.6, 1.4),
            vz + 0.4,
            { s: 1.5, c: [0.5, 0.5, 0.48] },
          );
      }
    }
    // ---- colliders: exact wall ring + solid interior slices (for LOS / the impostor)
    // (a party wall shared by two slices of the same block gets ONE collider, centred on the shared edge and
    //  as tall as the taller neighbour — the second lot extends the first instead of stacking a twin on it)
    for (const e of E) {
      const k = edgeKey(e);
      const prev = wallCols.get(k);
      if (prev) {
        if (H > prev.maxY) prev.maxY = H;
        prev.minY = 0;
        continue;
      }
      const shared = kinds[E.indexOf(e)] === "b";
      const off = shared ? 0 : 0.35,
        w = shared ? 1.2 : 0.7;
      const mx = (e.ax + e.bx) / 2 - e.nx * off,
        mz = (e.az + e.bz) / 2 - e.nz * off;
      const c = M.ocol(mx, mz, w, e.len, 0, H, Math.atan2(e.ux, e.uz), {
        tag: "building_wall",
        surface: "concrete",
        walkable: false,
      });
      wallCols.set(k, c);
    }
    // solid interior (LOS / "inside a building" tests): ≤4 oriented strips along the longest edge, each the
    // largest rectangle between the chords at its two ends (convex lot → the strip is fully inside)
    {
      const e0 = E.reduce((a, e) => (e.len > a.len ? e : a), E[0]);
      const ux = e0.ux,
        uz = e0.uz,
        wx = -e0.nx,
        wz = -e0.nz; // along the edge / inward
      const ox = e0.ax,
        oz = e0.az;
      let s1 = 0;
      for (const q of p) s1 = Math.max(s1, (q[0] - ox) * wx + (q[1] - oz) * wz);
      const chord = (sv) => {
        let t0 = 1e9,
          t1 = -1e9;
        const px = ox + wx * sv,
          pz = oz + wz * sv;
        for (let i = 0; i < p.length; i++) {
          const a = p[i],
            b = p[(i + 1) % p.length];
          const fa = (a[0] - px) * wx + (a[1] - pz) * wz,
            fb = (b[0] - px) * wx + (b[1] - pz) * wz;
          if (fa > 0 === fb > 0 || fa === fb) continue;
          const k = fa / (fa - fb),
            ix = a[0] + (b[0] - a[0]) * k,
            iz = a[1] + (b[1] - a[1]) * k;
          const t = (ix - ox) * ux + (iz - oz) * uz;
          if (t < t0) t0 = t;
          if (t > t1) t1 = t;
        }
        return [t0, t1];
      };
      const n = Math.max(1, Math.min(4, Math.ceil(s1 / 6)));
      for (let k = 0; k < n; k++) {
        const sa = (s1 * k) / n + (k === 0 ? 0.4 : 0),
          sb = (s1 * (k + 1)) / n - (k === n - 1 ? 0.4 : 0);
        if (sb - sa < 0.6) continue;
        const ca = chord(sa + 0.01),
          cb = chord(sb - 0.01);
        const t0 = Math.max(ca[0], cb[0]) + 0.3,
          t1 = Math.min(ca[1], cb[1]) - 0.3;
        if (t1 - t0 < 0.6) continue;
        const tm = (t0 + t1) / 2,
          sm = (sa + sb) / 2;
        M.ocol(
          ox + ux * tm + wx * sm,
          oz + uz * tm + wz * sm,
          t1 - t0,
          sb - sa,
          0,
          H,
          Math.atan2(-uz, ux),
          { tag: "building", surface: "concrete" },
        );
      }
    }
    // ---- far impostor (polygon prism in the imp layer)
    const imp = M.buf("my/farfacade", cx, cz, "imp");
    const it = M.mulc(B.IMP_TINT.commercial, 0.9 + M.hash(cx, cz, 7) * 0.2);
    for (const e of E)
      M.wall(
        imp,
        e.ax,
        e.az,
        e.bx,
        e.bz,
        0,
        H,
        0,
        e.len / tile.w,
        0,
        H / tile.h,
        M.mulc(it, 0.7),
        it,
      );
    M.poly(imp, p, H, { s: 100, c: M.mulc(it, 0.45), convex: true });
    return { h: H };
  }

  /** Build every claimed block's polygon lots (called at the end of M.buildCity). */
