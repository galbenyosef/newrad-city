// play-inline-80 02 — math
// Lines 304-573 of readable/play-inline-80.pretty.js (statement-aligned).
  function raisedPiece(p) {
    const n = p.length;
    const bb = M.polyBBox(p);
    const cx = (bb.x0 + bb.x1) / 2,
      cz = (bb.z0 + bb.z1) / 2;
    // exterior edges: sample the raster just outside the edge
    const ccw = M.polyArea(p) > 0;
    const ext = new Array(n);
    let convex = true;
    for (let i = 0; i < n; i++) {
      const a = p[i],
        c = p[(i + 1) % n],
        d = p[(i + 2) % n];
      const cr = (c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0]);
      if ((cr > 1e-6 && !ccw) || (cr < -1e-6 && ccw)) convex = false;
      const dx = c[0] - a[0],
        dz = c[1] - a[1],
        l = Math.hypot(dx, dz) || 1;
      let nx = dz / l,
        nz = -dx / l;
      if (!ccw) {
        nx = -nx;
        nz = -nz;
      }
      let outside = 0;
      for (const t of [0.2, 0.5, 0.8]) {
        const sx = a[0] + dx * t + nx * 0.7,
          sz = a[1] + dz * t + nz * 0.7;
        if (M.rasterAt(sx, sz) !== RC.RAISED) outside++;
      }
      ext[i] = outside >= 2 && l > 0.4;
    }
    const CW = 0.32; // curb width
    let top = p;
    if (convex) {
      // per-edge inset (0.32 on exterior edges, 0 elsewhere)
      const lines = [];
      for (let i = 0; i < n; i++) {
        const a = p[i],
          c = p[(i + 1) % n];
        const dx = c[0] - a[0],
          dz = c[1] - a[1],
          l = Math.hypot(dx, dz) || 1;
        let nx = -dz / l,
          nz = dx / l;
        if (!ccw) {
          nx = -nx;
          nz = -nz;
        }
        const d = ext[i] ? CW : 0;
        lines.push([a[0] + nx * d, a[1] + nz * d, dx, dz]);
      }
      top = [];
      for (let i = 0; i < n; i++) {
        const L1 = lines[(i + n - 1) % n],
          L2 = lines[i];
        const den = L1[2] * L2[3] - L1[3] * L2[2];
        if (Math.abs(den) < 1e-9) {
          top.push([L2[0], L2[1]]);
          continue;
        }
        const t = ((L2[0] - L1[0]) * L2[3] - (L2[1] - L1[1]) * L2[2]) / den;
        top.push([L1[0] + L1[2] * t, L1[1] + L1[3] * t]);
      }
      const bc = M.buf("granite", cx, cz, "near");
      for (let i = 0; i < n; i++) {
        if (!ext[i]) continue;
        const a = p[i],
          c = p[(i + 1) % n],
          qa = top[i],
          qc = top[(i + 1) % n];
        const run = Math.hypot(c[0] - a[0], c[1] - a[1]);
        M.quad(
          bc,
          [a[0], SY, a[1]],
          [c[0], SY, c[1]],
          [qc[0], SY, qc[1]],
          [qa[0], SY, qa[1]],
          [0, 1, 0],
          [0, 0, run / 1.5, 0, run / 1.5, CW / 1.5, 0, CW / 1.5],
          C_CURB,
        );
      }
    }
    // top slab (per-vertex subtle wear variation)
    const vary = 0.9 + M.hash(cx, cz, 3) * 0.12;
    M.poly(M.buf("sidewalk", cx, cz, "near"), top, SY, {
      s: M.sc("sidewalk"),
      c: M.mulc(C_SIDEWALK, vary),
      convex,
    });
    // curb faces
    const bs = M.buf("granite", cx, cz, "near");
    for (let i = 0; i < n; i++) {
      if (!ext[i]) continue;
      const a = p[i],
        c = p[(i + 1) % n];
      const dx = c[0] - a[0],
        dz = c[1] - a[1],
        l = Math.hypot(dx, dz) || 1;
      let nx = dz / l,
        nz = -dx / l;
      if (!ccw) {
        nx = -nx;
        nz = -nz;
      }
      M.quad(
        bs,
        [a[0], -0.05, a[1]],
        [c[0], -0.05, c[1]],
        [c[0], SY, c[1]],
        [a[0], SY, a[1]],
        [nx, 0, nz],
        [0, 0, l / 1.5, 0, l / 1.5, 0.12, 0, 0.12],
        [0.7, 0.68, 0.64],
        C_CURB,
      );
    }
  }

  // -------------------------------------------------------------------
  // Sea walls
  // -------------------------------------------------------------------
  function edgeHasRamp(ax, az, bx, bz) {
    const out = [];
    for (const r of M.ramps) {
      const d = G.LAYOUT.distToSeg(r.x, r.z, ax, az, bx, bz);
      if (d < 3) out.push(r);
    }
    return out;
  }
  function seaWall(poly, o) {
    o = o || {};
    const ccw = M.polyArea(poly) > 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i],
        c = poly[(i + 1) % poly.length];
      if (o.skipNorth && a[1] <= -999 && c[1] <= -999) continue;
      if (o.skipEastX && a[0] >= o.skipEastX && c[0] >= o.skipEastX) continue;
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
      // gaps for ramps
      const cuts = [];
      for (const r of edgeHasRamp(a[0], a[1], c[0], c[1])) {
        const t = (r.x - a[0]) * ux + (r.z - a[1]) * uz;
        cuts.push([t - r.w / 2, t + r.w / 2]);
      }
      cuts.sort((p, q) => p[0] - q[0]);
      let t0 = 0;
      const spans = [];
      for (const ct of cuts) {
        if (ct[0] > t0) spans.push([t0, ct[0]]);
        t0 = Math.max(t0, ct[1]);
      }
      if (t0 < len) spans.push([t0, len]);
      for (const sp of spans) {
        // split long spans into ≤ 40 m pieces so they land in local chunks
        const nseg = Math.max(1, Math.ceil((sp[1] - sp[0]) / 40));
        for (let k = 0; k < nseg; k++) {
          const s0 = sp[0] + ((sp[1] - sp[0]) * k) / nseg,
            s1 = sp[0] + ((sp[1] - sp[0]) * (k + 1)) / nseg;
          const px = a[0] + ux * s0,
            pz = a[1] + uz * s0,
            qx = a[0] + ux * s1,
            qz = a[1] + uz * s1;
          const mx = (px + qx) / 2,
            mz = (pz + qz) / 2;
          const b = M.buf("granite", mx, mz, "always");
          const l = s1 - s0;
          // upper dry band, algae band, submerged band
          M.quad(
            b,
            [px, -1.0, pz],
            [qx, -1.0, qz],
            [qx, 0.02, qz],
            [px, 0.02, pz],
            [nx, 0, nz],
            [s0 / 3, -1 / 3, s1 / 3, -1 / 3, s1 / 3, 0, s0 / 3, 0],
            [0.62, 0.64, 0.5],
            [0.95, 0.93, 0.88],
          );
          M.quad(
            b,
            [px, -1.7, pz],
            [qx, -1.7, qz],
            [qx, -1.0, qz],
            [px, -1.0, pz],
            [nx, 0, nz],
            [
              s0 / 3,
              -1.7 / 3,
              s1 / 3,
              -1.7 / 3,
              s1 / 3,
              -1 / 3,
              s0 / 3,
              -1 / 3,
            ],
            [0.3, 0.36, 0.22],
            [0.62, 0.64, 0.5],
          );
          M.quad(
            b,
            [px, -8, pz],
            [qx, -8, qz],
            [qx, -1.7, qz],
            [px, -1.7, pz],
            [nx, 0, nz],
            [
              s0 / 3,
              -8 / 3,
              s1 / 3,
              -8 / 3,
              s1 / 3,
              -1.7 / 3,
              s0 / 3,
              -1.7 / 3,
            ],
            [0.15, 0.17, 0.12],
            [0.3, 0.36, 0.22],
          );
          // coping stone ledge along the top
          const bc = M.buf("stone_limestone", mx, mz, "always");
          M.quad(
            bc,
            [px, 0.22, pz],
            [qx, 0.22, qz],
            [qx - nx * 0.55, 0.22, qz - nz * 0.55],
            [px - nx * 0.55, 0.22, pz - nz * 0.55],
            [0, 1, 0],
            [s0 / 2, 0, s1 / 2, 0, s1 / 2, 0.3, s0 / 2, 0.3],
            [0.98, 0.96, 0.9],
          );
          M.quad(
            bc,
            [px + nx * 0.02, 0.0, pz + nz * 0.02],
            [qx + nx * 0.02, 0.0, qz + nz * 0.02],
            [qx, 0.22, qz],
            [px, 0.22, pz],
            [nx, 0, nz],
            [s0 / 2, 0, s1 / 2, 0, s1 / 2, 0.12, s0 / 2, 0.12],
            [0.85, 0.83, 0.78],
          );
          M.quad(
            bc,
            [qx - nx * 0.55, 0.0, qz - nz * 0.55],
            [px - nx * 0.55, 0.0, pz - nz * 0.55],
            [px - nx * 0.55, 0.22, pz - nz * 0.55],
            [qx - nx * 0.55, 0.22, qz - nz * 0.55],
            [-nx, 0, -nz],
            [s0 / 2, 0, s1 / 2, 0, s1 / 2, 0.12, s0 / 2, 0.12],
            [0.8, 0.78, 0.72],
          );
        }
      }
    }
  }

  // -------------------------------------------------------------------
  // Esplanade railings (dark-green cast iron) with colliders & broken gaps
  // -------------------------------------------------------------------
