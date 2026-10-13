// play-inline-85 05 — math
// Lines 949-1244 of readable/play-inline-85.pretty.js (statement-aligned).
  function jaggedTop(x0, z0, x1, z1, y0, y1, fmat, tint, r, o) {
    o = o || {};
    const tile = TILE();
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const bf = M.buf(fmat, cx, cz);
    const sides = [
      [x0, z0, x1, z0, 0, -1],
      [x1, z0, x1, z1, 1, 0],
      [x1, z1, x0, z1, 0, 1],
      [x0, z1, x0, z0, -1, 0],
    ];
    const drop = y1 - y0;
    const strip = 3;
    const tops = [];
    for (const [ax, az, bx, bz, nx, nz] of sides) {
      const len = Math.hypot(bx - ax, bz - az),
        n = Math.max(1, Math.round(len / strip));
      let prevTop = y1 - r() * drop * 0.3;
      for (let i = 0; i < n; i++) {
        const t0 = i / n,
          t1 = (i + 1) / n;
        const top = M.clamp(prevTop + (r() - 0.5) * drop * 0.6, y0 + 1, y1);
        prevTop = top;
        const px = ax + (bx - ax) * t0,
          pz = az + (bz - az) * t0,
          qx = ax + (bx - ax) * t1,
          qz = az + (bz - az) * t1;
        M.wall(
          bf,
          px,
          pz,
          qx,
          qz,
          y0,
          top,
          (len * t0) / tile.w,
          (len * t1) / tile.w,
          (y0 - (o.vBase || 0)) / tile.h,
          (top - (o.vBase || 0)) / tile.h,
          tint,
          M.mulc(tint, 0.8),
        );
        // inner face (so the broken wall has thickness when seen from inside)
        const bi = M.buf("concrete_dark", cx, cz);
        M.wall(
          bi,
          qx - nx * 0.35,
          qz - nz * 0.35,
          px - nx * 0.35,
          pz - nz * 0.35,
          y0,
          top,
          0,
          1,
          0,
          1,
          [0.5, 0.48, 0.45],
        );
        // broken top edge cap
        M.quad(
          bi,
          [px, top, pz],
          [qx, top, qz],
          [qx - nx * 0.35, top, qz - nz * 0.35],
          [px - nx * 0.35, top, pz - nz * 0.35],
          [0, 1, 0],
          [0, 0, 1, 0, 1, 0.1, 0, 0.1],
          [0.55, 0.52, 0.5],
        );
        tops.push(top);
      }
    }
    // exposed floor slabs (some partially collapsed)
    const slabB = M.buf("concrete", cx, cz);
    const floorH = 3.6;
    for (let y = y0 + floorH; y < y1 - 1; y += floorH) {
      if (r() < 0.35) continue;
      const cut = r.range(0.3, 1);
      const sx1 = x0 + (x1 - x0) * cut;
      M.box(slabB, x0 + 0.3, y - 0.25, z0 + 0.3, sx1, y, z1 - 0.3, {
        s: 3,
        c: [0.62, 0.6, 0.57],
      });
      if (cut < 0.95 && r() < 0.5) {
        // slab snapped and hanging down
        M.obox(
          slabB,
          sx1 + 1.5,
          y - 1.2,
          (z0 + z1) / 2,
          3.2,
          0.25,
          (z1 - z0) * 0.8,
          0,
          { roll: -0.7, s: 3, c: [0.55, 0.53, 0.5] },
        );
      }
    }
    // roof deck over the lowest remaining part
    const bd = M.buf("rubble", cx, cz);
    M.box(bd, x0 + 0.3, y0 - 0.2, z0 + 0.3, x1 - 0.3, y0 + 0.4, z1 - 0.3, {
      s: 3,
      c: [0.7, 0.66, 0.6],
      skip: 8,
    });
    // girder columns sticking up at a regular grid, bent at random
    const gb = M.buf("rust", cx, cz, o.girderLayer || "main");
    const gx = Math.max(2, Math.round((x1 - x0) / 6)),
      gz = Math.max(2, Math.round((z1 - z0) / 6));
    for (let i = 0; i <= gx; i++)
      for (let j = 0; j <= gz; j++) {
        if (r() < 0.45) continue;
        const px = x0 + 0.6 + ((x1 - x0 - 1.2) * i) / gx,
          pz = z0 + 0.6 + ((z1 - z0 - 1.2) * j) / gz;
        const h = r.range(2, y1 - y0 + 6);
        const bend = r() < 0.3;
        M.beam(
          gb,
          px,
          y0,
          pz,
          px + (bend ? r.range(-2, 2) : 0),
          y0 + h,
          pz + (bend ? r.range(-2, 2) : 0),
          0.35,
          0.35,
          { c: [0.75, 0.62, 0.52] },
        );
        if (r() < 0.4 && i < gx)
          M.beam(
            gb,
            px,
            y0 + h * 0.7,
            pz,
            x0 + 0.6 + ((x1 - x0 - 1.2) * (i + 1)) / gx,
            y0 + h * 0.6 + r.range(-1, 1),
            pz,
            0.28,
            0.4,
            { c: [0.72, 0.6, 0.5] },
          );
      }
    // girders and snapped slabs dangling over the broken edge (the bombed-city ruin silhouette)
    const nh = r.int(1, 3);
    for (let i = 0; i < nh; i++) {
      const [ax, az, bx, bz, nx, nz] = sides[r.int(0, 3)];
      const t = r.range(0.15, 0.85),
        px = ax + (bx - ax) * t,
        pz = az + (bz - az) * t;
      const yA = y0 + (y1 - y0) * r.range(0.05, 0.35);
      const out = r.range(1.2, 3.2),
        drop = r.range(2, 6);
      if (r() < 0.6)
        M.beam(
          gb,
          px - nx * 1.2,
          yA,
          pz - nz * 1.2,
          px + nx * out,
          yA - drop,
          pz + nz * out,
          0.3,
          0.42,
          { c: [0.7, 0.56, 0.46] },
        );
      else
        M.obox(
          slabB,
          px + nx * out * 0.5,
          yA - drop * 0.45,
          pz + nz * out * 0.5,
          Math.abs(nz) > 0.5 ? r.range(3, 6) : 0.25,
          drop,
          Math.abs(nx) > 0.5 ? r.range(3, 6) : 0.25,
          0,
          { pitch: nz * 0.45, roll: -nx * 0.45, s: 3, c: [0.55, 0.53, 0.5] },
        );
      // rebar whiskers
      for (let k = 0; k < 4; k++)
        M.beam(
          gb,
          px + r.range(-1, 1) * Math.abs(nz),
          yA,
          pz + r.range(-1, 1) * Math.abs(nx),
          px + nx * r.range(0.4, 1.4) + r.range(-0.4, 0.4),
          yA - r.range(0.3, 1.6),
          pz + nz * r.range(0.4, 1.4) + r.range(-0.4, 0.4),
          0.035,
          0.035,
          { c: [0.62, 0.45, 0.36] },
        );
    }
    return tops;
  }
  M.jaggedTop = jaggedTop;

  /** Blown-out floor band: dark void with columns and ragged slab edges. */
  function blownBand(x0, z0, x1, z1, y0, y1) {
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const inset = 1.6;
    const bd = M.buf("concrete_dark", cx, cz);
    // interior dark box (recessed)
    const dk = [0.12, 0.12, 0.12];
    M.box(bd, x0 + inset, y0, z0 + inset, x1 - inset, y1, z1 - inset, {
      s: 3,
      c: dk,
      skip: 4 + 8,
    });
    // slabs at bottom & top of band protruding
    M.box(bd, x0 - 0.05, y0 - 0.35, z0 - 0.05, x1 + 0.05, y0, z1 + 0.05, {
      s: 3,
      c: [0.55, 0.53, 0.5],
    });
    M.box(bd, x0 - 0.05, y1, z0 - 0.05, x1 + 0.05, y1 + 0.35, z1 + 0.05, {
      s: 3,
      c: [0.55, 0.53, 0.5],
    });
    // columns
    const bc = M.buf("concrete", cx, cz);
    const nX = Math.max(2, Math.round((x1 - x0) / 5)),
      nZ = Math.max(2, Math.round((z1 - z0) / 5));
    for (let i = 0; i <= nX; i++)
      for (const z of [z0 + 0.3, z1 - 0.3]) {
        const x = x0 + 0.3 + ((x1 - x0 - 0.6) * i) / nX;
        M.box(bc, x - 0.3, y0, z - 0.3, x + 0.3, y1, z + 0.3, {
          s: 2,
          c: [0.65, 0.63, 0.6],
          skip: 12,
        });
      }
    for (let j = 1; j < nZ; j++)
      for (const x of [x0 + 0.3, x1 - 0.3]) {
        const z = z0 + 0.3 + ((z1 - z0 - 0.6) * j) / nZ;
        M.box(bc, x - 0.3, y0, z - 0.3, x + 0.3, y1, z + 0.3, {
          s: 2,
          c: [0.65, 0.63, 0.6],
          skip: 12,
        });
      }
    // rebar tangles
    const gb = M.buf("rust", cx, cz, "detail");
    const r = M.rng("blown" + Math.round(x0) + "," + Math.round(z0));
    for (let i = 0; i < 8; i++) {
      const side = r.int(0, 3);
      const t = r();
      const px = side < 2 ? x0 + (x1 - x0) * t : side === 2 ? x0 : x1,
        pz = side >= 2 ? z0 + (z1 - z0) * t : side === 0 ? z0 : z1;
      M.beam(
        gb,
        px,
        y1,
        pz,
        px + r.range(-1.5, 1.5),
        y1 - r.range(0.5, 2.2),
        pz + r.range(-1.5, 1.5),
        0.05,
        0.05,
        { c: [0.7, 0.5, 0.4] },
      );
    }
  }
  M.blownBand = blownBand;

  // -------------------------------------------------------------------
  // Building families
  // -------------------------------------------------------------------
  function heightFor(lot, r) {
    const L = G.LAYOUT;
    const ds = L.DISTRICT_STYLE[lot.district] || { minH: 15, maxH: 40 };
    const cx = (lot.x0 + lot.x1) / 2,
      cz = (lot.z0 + lot.z1) / 2;
    for (const c of M.HEIGHT_CAPS || [])
      if (cx > c.x0 && cx < c.x1 && cz > c.z0 && cz < c.z1)
        return Math.min(c.maxH, 10 + r() * (c.maxH - 10));
    // street-wall infill (thin lots): a proportionate walk-up, never a 6 m-deep slab tower
    if (lot.infill) {
      const mn = Math.min(lot.x1 - lot.x0, lot.z1 - lot.z0);
      return Math.min(ds.minH + r() * 14, 12 + mn * 2.2);
    }
    let t = Math.pow(r(), 1.6);
    if (lot.district === "midtown")
      t = Math.min(
        1,
        t * (0.7 + 0.9 * Math.exp(-Math.hypot(cx - 120, cz + 190) / 260)),
      );
    if (lot.district === "financial_district")
      t = Math.min(
        1,
        t * (0.75 + 0.8 * Math.exp(-Math.hypot(cx - 20, cz - 790) / 220)),
      );
    return ds.minH + (ds.maxH - ds.minH) * t;
  }

  /** Art-deco setback skyscraper. */
