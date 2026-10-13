// play-inline-80 03 — liberty
// Lines 574-825 of readable/play-inline-80.pretty.js (statement-aligned).
  function railings(poly, inset) {
    const L = G.LAYOUT;
    const ccw = M.polyArea(poly) > 0;
    const col = [0.55, 0.68, 0.58];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i],
        c = poly[(i + 1) % poly.length];
      if (a[1] <= -999 && c[1] <= -999) continue;
      if (a[0] >= 799 && c[0] >= 799) continue;
      const dx = c[0] - a[0],
        dz = c[1] - a[1],
        len = Math.hypot(dx, dz);
      const ux = dx / len,
        uz = dz / len;
      let nx = uz,
        nz = -ux;
      if (!ccw) {
        nx = -nx;
        nz = -nz;
      }
      const SEG = 12;
      const nseg = Math.floor(len / SEG);
      let runStart = null;
      const flushRun = (t0, t1) => {
        if (t1 - t0 < 1) return;
        const mx = a[0] + (ux * (t0 + t1)) / 2 - nx * 0.75,
          mz = a[1] + (uz * (t0 + t1)) / 2 - nz * 0.75;
        M.ocol(mx, mz, t1 - t0, 0.25, 0, 1.15, Math.atan2(-uz, ux), {
          tag: "railing",
          surface: "metal",
        });
      };
      for (let k = 0; k < nseg; k++) {
        const t0 = k * SEG + (len - nseg * SEG) / 2,
          t1 = t0 + SEG;
        const mx = a[0] + (ux * (t0 + t1)) / 2,
          mz = a[1] + (uz * (t0 + t1)) / 2;
        const inSite = L.siteAt(mx, mz, 6);
        const nearRamp = M.ramps.some(
          (r) => Math.hypot(r.x - mx, r.z - mz) < r.w / 2 + SEG / 2 + 1,
        );
        const nearPier = (M.pierRoots || []).some(
          (r) => Math.hypot(r.x - mx, r.z - mz) < r.w / 2 + SEG / 2,
        );
        const h = M.hash(mx, mz, 11);
        const skip = inSite || nearRamp || nearPier;
        const broken = !skip && h < 0.1;
        if (skip || broken) {
          if (runStart !== null) {
            flushRun(runStart, t0);
            runStart = null;
          }
          if (broken) {
            // a bent, fallen section lying on the promenade
            const b = M.buf("metal_painted", mx, mz, "detail");
            const px = mx - nx * 1.6,
              pz = mz - nz * 1.6;
            M.beam(
              b,
              px - ux * 5,
              0.08,
              pz - uz * 5,
              px + ux * 4,
              0.3,
              pz + uz * 4.5,
              0.05,
              0.05,
              { c: M.mulc(col, 0.7) },
            );
            M.beam(
              b,
              px - ux * 5,
              0.05,
              pz - uz * 5 + 0.3,
              px + ux * 5,
              0.05,
              pz + uz * 5 + 0.3,
              0.05,
              0.05,
              { c: M.mulc(col, 0.6) },
            );
          }
          continue;
        }
        if (runStart === null) runStart = t0;
        const b = M.buf("metal_painted", mx, mz, "detail");
        const ox = -nx * 0.75,
          oz = -nz * 0.75;
        const ax = a[0] + ux * t0 + ox,
          az = a[1] + uz * t0 + oz,
          bx2 = a[0] + ux * t1 + ox,
          bz2 = a[1] + uz * t1 + oz;
        M.beam(b, ax, 1.05, az, bx2, 1.05, bz2, 0.07, 0.06, { c: col });
        M.beam(b, ax, 0.55, az, bx2, 0.55, bz2, 0.04, 0.04, { c: col });
        M.beam(b, ax, 0.18, az, bx2, 0.18, bz2, 0.04, 0.04, { c: col });
        for (let p = 0; p < 6; p++) {
          const tt = p / 6;
          const px = ax + (bx2 - ax) * tt,
            pz = az + (bz2 - az) * tt;
          M.box(b, px - 0.05, 0, pz - 0.05, px + 0.05, 1.12, pz + 0.05, {
            c: M.mulc(col, 0.9),
            s: 1,
            skip: 8,
          });
          // balusters (double-faced bars)
          for (let q = 1; q < 3; q++) {
            const t2 = tt + q / 18;
            const qx = ax + (bx2 - ax) * t2,
              qz = az + (bz2 - az) * t2;
            M.vbar(b, qx, qz, 0.18, 1.05, 0.03, nx, nz, col, true);
          }
        }
      }
      if (runStart !== null)
        flushRun(runStart, nseg * SEG + (len - nseg * SEG) / 2);
    }
  }

  // -------------------------------------------------------------------
  // Ramps (visual concrete boat ramps + raster)
  // -------------------------------------------------------------------
  function planRamps() {
    const L = G.LAYOUT;
    const man = L.MANHATTAN;
    for (const z of [-470, 25, 480]) {
      const x = M.shoreX(man, z, -1);
      if (x !== null) addRamp(x, z, -1, 0);
    }
    for (const z of [-620, 40, 470]) {
      const x = M.shoreX(man, z, 1);
      if (x !== null) addRamp(x, z, 1, 0);
    }
    for (const z of [540, 860]) {
      const x = M.shoreX(L.BROOKLYN, z, -1);
      if (x !== null) addRamp(x, z, -1, 0);
    }
    // Liberty (north side, facing Manhattan) & Ellis (east side)
    addRamp(L.LIBERTY.x + 18, L.LIBERTY.z - L.LIBERTY.r + 1, 0.15, -1, 6, 16);
    addRamp(L.ELLIS.x + L.ELLIS.r - 1, L.ELLIS.z + 8, 1, 0.1, 6, 16);
  }
  M.planRamps = planRamps;
  function buildRamps() {
    for (const r of M.ramps) {
      const b = M.buf("concrete", r.x, r.z);
      const px = -r.dz,
        pz = r.dx; // across
      const hw = r.w / 2;
      const segs = 6;
      for (let s = 0; s < segs; s++) {
        const a0 = -3 + ((r.len + 3) * s) / segs,
          a1 = -3 + ((r.len + 3) * (s + 1)) / segs;
        const h0 = a0 <= 0 ? 0.01 : (-3.4 * a0) / r.len + 0.01,
          h1 = a1 <= 0 ? 0.01 : (-3.4 * a1) / r.len + 0.01;
        const P = (a, c, h) => [
          r.x + r.dx * a + px * c,
          h,
          r.z + r.dz * a + pz * c,
        ];
        const ny = 1,
          nl = Math.hypot(3.4 / r.len, 1);
        M.quad(
          b,
          P(a0, -hw, h0),
          P(a1, -hw, h1),
          P(a1, hw, h1),
          P(a0, hw, h0),
          [(r.dx * 3.4) / r.len / nl, ny / nl, (r.dz * 3.4) / r.len / nl],
          [a0 / 2, -hw / 2, a1 / 2, -hw / 2, a1 / 2, hw / 2, a0 / 2, hw / 2],
          [0.8, 0.8, 0.74],
        );
        // side walls of the ramp cut
        for (const sd of [-1, 1]) {
          M.quad(
            b,
            P(a0, sd * hw, -8),
            P(a1, sd * hw, -8),
            P(a1, sd * hw, h1),
            P(a0, sd * hw, h0),
            [-px * sd, 0, -pz * sd],
            [a0 / 3, 0, a1 / 3, 0, a1 / 3, 1, a0 / 3, 1],
            [0.35, 0.37, 0.3],
          );
        }
      }
      // mark raster
      const poly = [
        [
          r.x - r.dz * (hw + 0.5) - r.dx * 3,
          r.z + r.dx * (hw + 0.5) - r.dz * 3,
        ],
        [
          r.x + r.dz * (hw + 0.5) - r.dx * 3,
          r.z - r.dx * (hw + 0.5) - r.dz * 3,
        ],
      ];
      poly.push(
        [poly[1][0] + r.dx * (r.len + 3), poly[1][1] + r.dz * (r.len + 3)],
        [poly[0][0] + r.dx * (r.len + 3), poly[0][1] + r.dz * (r.len + 3)],
      );
      M.rasterPoly(poly, RC.RAMP);
      // bollards at the top of the ramp
      const bd = M.buf("metal_painted", r.x, r.z, "detail");
      for (const sd of [-1, 1])
        M.cyl(
          bd,
          r.x - r.dx * 2.5 + px * sd * (hw + 0.4),
          0,
          r.z - r.dz * 2.5 + pz * sd * (hw + 0.4),
          0.18,
          0.15,
          0.7,
          8,
          { capTop: true, c: [0.35, 0.3, 0.25] },
        );
    }
  }

  // -------------------------------------------------------------------
  // Islands: Liberty (plate only; landmarks_b builds the fort & statue),
  // Ellis (map builds a ruined immigration station).
  // -------------------------------------------------------------------
  function buildIslands() {
    const L = G.LAYOUT;
    const lib = M.circlePoly(L.LIBERTY.x, L.LIBERTY.z, L.LIBERTY.r, 48);
    const libIn = M.circlePoly(L.LIBERTY.x, L.LIBERTY.z, L.LIBERTY.r - 6, 48);
    M.poly(M.buf("grass_dead", L.LIBERTY.x, L.LIBERTY.z, "always"), libIn, 0, {
      s: 6,
      c: [0.85, 0.82, 0.7],
    });
    M.poly(M.buf("concrete", L.LIBERTY.x, L.LIBERTY.z, "always"), lib, 0, {
      s: 4,
      holes: [libIn.slice().reverse()],
      c: [0.9, 0.88, 0.84],
    });
    seaWall(lib);
    railings(lib, libIn);
    const ell = M.circlePoly(L.ELLIS.x, L.ELLIS.z, L.ELLIS.r, 40);
    M.poly(M.buf("sidewalk", L.ELLIS.x, L.ELLIS.z, "always"), ell, 0, {
      s: 3,
      c: [0.85, 0.83, 0.8],
    });
    seaWall(ell);
    railings(ell, ell);
    buildEllisBuilding(L.ELLIS.x, L.ELLIS.z - 2);
    // Liberty ferry dock (north)
    pier(L.LIBERTY.x - 20, L.LIBERTY.z - L.LIBERTY.r + 2, 0, -1, 26, 9, {
      shed: false,
      key: "liberty",
    });
  }

  /** Ellis Island main building: red brick & limestone with four copper-domed towers. */
