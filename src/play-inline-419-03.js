// play-inline-419 03 — tint
// Lines 346-684 of readable/play-inline-419.pretty.js (statement-aligned).
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
  K.column = function (b, x, y0, z, r, h, o) {
    o = o || {};
    const kind = o.kind || "doric",
      mat = o.mat || "limestone",
      tint = o.tint;
    const capH =
      kind === "ionic" ? r * 0.9 : kind === "iron" ? r * 1.6 : r * 0.7;
    const baseH = o.base === false ? 0 : r * 0.6;
    if (baseH) {
      b.box(mat, x, y0, z, r * 2.5, baseH * 0.5, r * 2.5, { tint });
      b.cyl(mat, x, y0 + baseH * 0.5, z, r * 1.2, r * 1.05, baseH * 0.5, 14, {
        tint,
      });
    }
    const sh = h - capH - baseH;
    if (o.flutes !== false && kind !== "iron")
      K.flutedShaft(
        b,
        o.shaftMat || mat,
        x,
        y0 + baseH,
        z,
        r,
        r * 0.86,
        sh,
        o.nFlutes || (kind === "doric" ? 20 : 24),
        tint,
      );
    else
      b.cyl(
        mat,
        x,
        y0 + baseH,
        z,
        r,
        r * (kind === "iron" ? 1 : 0.86),
        sh,
        kind === "iron" ? 10 : 16,
        { tint, top: false },
      );
    const yc = y0 + h - capH;
    if (kind === "iron") {
      b.cyl(mat, x, yc, z, r * 0.9, r * 1.8, capH * 0.7, 10, { tint });
      b.box(mat, x, yc + capH * 0.7, z, r * 3.4, capH * 0.3, r * 3.4, { tint });
    } else if (kind === "ionic") {
      b.cyl(mat, x, yc, z, r * 0.9, r * 1.05, capH * 0.35, 14, { tint });
      b.box(mat, x, yc + capH * 0.35, z, r * 2.5, capH * 0.3, r * 2.0, {
        tint,
      });
      for (const s of [-1, 1])
        b.geo(mat, K.unitCyl(10), {
          x: x + s * r * 1.15,
          y: yc + capH * 0.42,
          z,
          sx: capH * 0.32,
          sy: r * 2.1,
          sz: capH * 0.32,
          rx: PI / 2,
          tint,
        }); // volutes
      b.box(mat, x, yc + capH * 0.65, z, r * 2.7, capH * 0.35, r * 2.7, {
        tint,
      });
    } else {
      b.cyl(mat, x, yc, z, r * 0.88, r * 1.2, capH * 0.5, 14, { tint });
      b.box(mat, x, yc + capH * 0.5, z, r * 2.6, capH * 0.5, r * 2.6, { tint });
    }
  };

  /**
   * Fluted, tapering shaft: n concave flutes (two facets meeting 7 % inside the surface, shaded darker) separated by
   * narrow arrises at full radius — reads as real fluting at any distance (flat-shaded facets catch the sun).
   */
  K.flutedShaft = function (b, mat, x, y0, z, r0, r1, h, n, tint) {
    const t = tint || [1, 1, 1],
      tf = t.map((v) => v * 0.8),
      y1 = y0 + h,
      span = (PI * 2) / n;
    const P = (a, rr, y) => [x + Math.cos(a) * rr, y, z - Math.sin(a) * rr];
    for (let i = 0; i < n; i++) {
      const a0 = i * span,
        a1 = a0 + span * 0.16,
        a2 = a1 + (span - span * 0.16) / 2,
        a3 = (i + 1) * span;
      const quad = (aa, ab, ra, rb, tn) => {
        const am = (aa + ab) / 2;
        b.quadN(
          mat,
          P(aa, r0 * ra, y0),
          P(ab, r0 * rb, y0),
          P(ab, r1 * rb, y1),
          P(aa, r1 * ra, y1),
          [Math.cos(am), 0, -Math.sin(am)],
          { tint: tn },
        );
      };
      quad(a0, a1, 1, 1, t);
      quad(a1, a2, 1, 0.93, tf);
      quad(
        a2,
        a3,
        0.93,
        1,
        tf.map((v) => v * 1.1),
      );
    }
  };

  /** Flat pilaster on a façade (x,z on wall surface, facing nx,nz). */
  K.pilaster = function (b, x, y0, z, nx, nz, w, h, o) {
    o = o || {};
    const yaw = Math.atan2(nx, nz),
      d = o.depth || 0.25,
      mat = o.mat || "limestone";
    b.box(mat, x + (nx * d) / 2, y0, z + (nz * d) / 2, w, h, d, {
      yaw,
      tint: o.tint,
    });
    b.box(
      mat,
      x + nx * (d / 2 + 0.05),
      y0 + h - 0.35,
      z + nz * (d / 2 + 0.05),
      w + 0.2,
      0.35,
      d + 0.1,
      { yaw, tint: o.tint },
    );
    b.box(
      mat,
      x + nx * (d / 2 + 0.05),
      y0,
      z + nz * (d / 2 + 0.05),
      w + 0.2,
      0.3,
      d + 0.1,
      { yaw, tint: o.tint },
    );
  };

  /**
   * Cornice along a façade from A to B (wall surface line) at height y, projecting towards (nx,nz).
   * o: {mat, tint, depth (projection), h (total height), brackets (spacing, 0 = none), bracketMat}
   */
  K.cornice = function (b, ax, az, bx, bz, y, nx, nz, o) {
    o = o || {};
    const mat = o.mat || "limestone",
      tint = o.tint,
      dep = o.depth || 0.8,
      H = o.h || 0.9;
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.05) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len,
      yaw = Math.atan2(nx, nz);
    const cx = (ax + bx) / 2,
      cz = (az + bz) / 2;
    // bed moulding, corona, cymatium (stepping out)
    const steps = [
      [0.0, 0.18, 0.2],
      [0.18, 0.2, 0.38],
      [0.5, 0.26, dep],
      [0.76, 0.14, dep + 0.08],
    ];
    for (const [yo, hh, dd] of steps) {
      if (yo >= H) break;
      b.box(
        mat,
        cx + (nx * dd) / 2,
        y + yo * (H / 0.9),
        cz + (nz * dd) / 2,
        len + dd * 0.9,
        hh * (H / 0.9),
        dd,
        { yaw, tint, faces: "nsewtb" },
      );
    }
    const sp = o.brackets === undefined ? 1.1 : o.brackets;
    if (sp > 0) {
      const n = Math.floor(len / sp);
      for (let i = 0; i <= n; i++) {
        const t = -len / 2 + (len - n * sp) / 2 + i * sp;
        const px = cx + ux * t,
          pz = cz + uz * t;
        b.box(
          o.bracketMat || mat,
          px + nx * 0.22,
          y - 0.35,
          pz + nz * 0.22,
          0.14,
          0.52,
          0.42,
          { yaw, tint },
        );
      }
    }
  };

  /** Cylindrical wall from angle a0 to a1 (radians, 0 = +x, counter-clockwise seen from above → −z). inward: normals toward the centre. */
