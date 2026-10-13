// play-inline-421 04 — math
// Lines 660-955 of readable/play-inline-421.pretty.js (statement-aligned).
  K.wagon = function (b, x, y, z, yaw, o) {
    o = o || {};
    const c = Math.cos(yaw),
      s = Math.sin(yaw),
      L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    const W = 1.7,
      Lb = 3.4,
      bedY = y + 0.75;
    const bc = L(0, 0);
    b.box("wood", bc[0], bedY, bc[1], W, 0.12, Lb, {
      yaw,
      tint: [0.55, 0.42, 0.3],
      faces: "nsewtb",
    });
    for (const e of [-1, 1]) {
      const p = L((e * W) / 2, 0);
      b.box("wood", p[0], bedY + 0.12, p[1], 0.06, 0.45, Lb, {
        yaw,
        tint: [0.5, 0.38, 0.26],
      });
    }
    const wheel = (lx, lz, r) => {
      const p = L(lx, lz);
      b.geo("wood_dark", K.unitCyl(12), {
        x: p[0],
        y: y + r,
        z: p[1],
        sx: r,
        sy: 0.08,
        sz: r,
        rz: HP,
        ry: yaw,
        tint: [0.45, 0.34, 0.24],
      });
      b.geo("black_iron", K.torusGeo(), {
        x: p[0],
        y: y + r,
        z: p[1],
        sx: r * 0.95,
        sy: r * 0.95,
        sz: 0.25,
        ry: yaw + HP,
      });
    };
    for (const e of [-1, 1]) {
      wheel(e * (W / 2 + 0.08), -1.1, 0.5);
      wheel(e * (W / 2 + 0.08), 1.1, 0.62);
    }
    // canvas cover: half-cylinder along the bed
    const n = 8,
      R = W / 2 + 0.05,
      ct = o.canvas || [0.78, 0.72, 0.58];
    for (let k = 0; k < n; k++) {
      const a0 = (PI * k) / n,
        a1 = (PI * (k + 1)) / n;
      const q0 = L(Math.cos(a0) * R, -Lb / 2 + 0.2),
        q1 = L(Math.cos(a1) * R, -Lb / 2 + 0.2),
        q2 = L(Math.cos(a1) * R, Lb / 2 - 0.2),
        q3 = L(Math.cos(a0) * R, Lb / 2 - 0.2);
      const y0 = bedY + 0.55 + Math.sin(a0) * 1.0,
        y1 = bedY + 0.55 + Math.sin(a1) * 1.0;
      const am = (a0 + a1) / 2,
        nxl = Math.cos(am),
        nyl = Math.sin(am);
      b.quadN(
        "canvas_tarp",
        [q0[0], y0, q0[1]],
        [q1[0], y1, q1[1]],
        [q2[0], y1, q2[1]],
        [q3[0], y0, q3[1]],
        [nxl * c, nyl, -nxl * s],
        { tint: ct, grime: 0.55 },
      );
    }
    for (const lz of [-Lb / 2 + 0.2, 0, Lb / 2 - 0.2])
      for (let k = 0; k < n; k++) {
        const a0 = (PI * k) / n,
          a1 = (PI * (k + 1)) / n,
          p0 = L(Math.cos(a0) * (R + 0.02), lz),
          p1 = L(Math.cos(a1) * (R + 0.02), lz);
        b.beam(
          "wood_dark",
          p0[0],
          bedY + 0.55 + Math.sin(a0),
          p0[1],
          p1[0],
          bedY + 0.55 + Math.sin(a1),
          p1[1],
          0.05,
          0.05,
        );
      }
    // shafts
    for (const e of [-1, 1]) {
      const a = L(e * 0.45, -Lb / 2),
        q = L(e * 0.35, -Lb / 2 - 2.2);
      b.beam("wood_dark", a[0], bedY, a[1], q[0], y + 0.5, q[1], 0.07, 0.07);
    }
    // cargo peeking out the back
    const cb = L(0, Lb / 2 - 0.5);
    b.box("wood", cb[0], bedY + 0.12, cb[1], 0.8, 0.5, 0.6, {
      yaw,
      tint: [0.6, 0.5, 0.36],
    });
    b.ocol(bc[0], bc[1], W + 0.3, Lb, y, bedY + 1.5, yaw, {
      tag: "wagon",
      surface: "wood",
      walkable: false,
    });
  };

  /** Scrap-sheet fence from A to B at floor y (corrugated + plywood panels, posts), with a collider. */
  K.fence = function (b, ax, az, bx, bz, y, o) {
    o = o || {};
    const h = o.h || 1.5,
      len = Math.hypot(bx - ax, bz - az);
    if (len < 0.2) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len,
      n = Math.max(1, Math.ceil(len / 1.6)),
      r = K.rng(o.seed || (ax * 3 + az * 7) | 0);
    for (let k = 0; k < n; k++) {
      const t0 = (len * k) / n,
        t1 = (len * (k + 1)) / n;
      const p0 = [ax + ux * t0, az + uz * t0],
        p1 = [ax + ux * t1, az + uz * t1];
      const mat = r() < 0.6 ? "corrugated" : r() < 0.5 ? "wood_rotten" : "rust";
      const hh = h * (0.8 + r() * 0.3),
        lean = (r() - 0.5) * 0.15;
      const nx = -uz,
        nz = ux;
      b.quadN(
        mat,
        [p0[0], y, p0[1]],
        [p1[0], y, p1[1]],
        [p1[0] + nx * lean, y + hh, p1[1] + nz * lean],
        [p0[0] + nx * lean, y + hh, p0[1] + nz * lean],
        [nx, 0, nz],
        { tint: [0.7 + r() * 0.2, 0.62, 0.5] },
      );
      b.quadN(
        mat,
        [p1[0], y, p1[1]],
        [p0[0], y, p0[1]],
        [p0[0] + nx * lean, y + hh, p0[1] + nz * lean],
        [p1[0] + nx * lean, y + hh, p1[1] + nz * lean],
        [-nx, 0, -nz],
        { tint: [0.55, 0.5, 0.42] },
      );
      b.box("wood_rotten", p0[0], y, p0[1], 0.1, h + 0.2, 0.1, {
        tint: [0.5, 0.42, 0.34],
      });
    }
    b.box("wood_rotten", bx, y, bz, 0.1, h + 0.2, 0.1, {
      tint: [0.5, 0.42, 0.34],
    });
    if (o.col !== false)
      b.ocol(
        (ax + bx) / 2,
        (az + bz) / 2,
        len,
        0.2,
        y,
        y + h,
        Math.atan2(-uz, ux),
        { tag: "fence", surface: "metal", walkable: false },
      );
  };

  /** Catenary string of bulbs through points [[x,y,z],…]. */
  K.stringLights = function (b, pts, o) {
    o = o || {};
    const col = K.tint(o.color || [1, 0.78, 0.45]),
      sag = o.sag || 0.5,
      step = o.step || 0.9;
    for (let i = 0; i < pts.length - 1; i++) {
      const A = pts[i],
        B = pts[i + 1],
        len = Math.hypot(B[0] - A[0], B[2] - A[2]),
        n = Math.max(2, Math.ceil(len / step));
      let prev = A;
      for (let k = 1; k <= n; k++) {
        const t = k / n,
          y = A[1] + (B[1] - A[1]) * t - sag * 4 * t * (1 - t);
        const p = [A[0] + (B[0] - A[0]) * t, y, A[2] + (B[2] - A[2]) * t];
        b.pipe(
          "black_iron",
          prev[0],
          prev[1],
          prev[2],
          p[0],
          p[1],
          p[2],
          0.008,
          3,
        );
        if (k < n) {
          const dead = o.deadEvery && k % o.deadEvery === 0;
          b.geo(dead ? "glass" : "lamp", K.sphereGeo(), {
            x: p[0],
            y: p[1] - 0.07,
            z: p[2],
            s: 0.045,
            tint: dead ? [0.3, 0.3, 0.3] : col,
          });
          if (!dead && k % 2 === 0)
            b.glow(
              p[0],
              p[1] - 0.07,
              p[2],
              col.map((v) => v * 0.55),
              o.glow || 0.7,
            );
          if (!dead && o.light && k % 4 === 0)
            b.light(p[0], p[1] - 0.3, p[2], col, o.light, o.radius || 5);
        }
        prev = p;
      }
    }
  };
  /** Stack of crates / boxes (no collider unless o.col). */
  K.crates = function (b, x, y, z, yaw, n, o) {
    o = o || {};
    const r = K.rng(o.seed || (x * 11 + z * 13) | 0),
      c = Math.cos(yaw),
      s = Math.sin(yaw);
    let h = 0;
    for (let k = 0; k < n; k++) {
      const w = 0.6 + r() * 0.35,
        lx = (r() - 0.5) * 0.4,
        lz = (r() - 0.5) * 0.4,
        hh = 0.45 + r() * 0.3;
      b.box(
        o.mat || "wood",
        x + lx * c + lz * s,
        y + h,
        z - lx * s + lz * c,
        w,
        hh,
        w * (0.8 + r() * 0.3),
        {
          yaw: yaw + (r() - 0.5) * 0.4,
          tint: r.pick([
            [0.62, 0.5, 0.36],
            [0.55, 0.45, 0.32],
            [0.7, 0.6, 0.45],
          ]),
        },
      );
      h += hh;
      if (r() < 0.35) break;
    }
    if (o.col)
      b.ocol(x, z, 0.9, 0.9, y, y + h, yaw, { tag: "crate", surface: "wood" });
    return h;
  };
  /** Sandbag wall A→B (courses of lumpy bags) + collider. */
  K.sandbags = function (b, ax, az, bx, bz, y, h, o) {
    o = o || {};
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.2) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len,
      yaw = Math.atan2(-uz, ux),
      r = K.rng(o.seed || (ax * 5 + bz * 9) | 0);
    const rows = Math.max(1, Math.round((h || 1.1) / 0.22));
    for (let j = 0; j < rows; j++) {
      const off = (j % 2) * 0.3,
        n = Math.floor((len - off) / 0.6);
      for (let k = 0; k < n; k++) {
        const t = off + 0.3 + k * 0.6;
        b.geo("canvas_tarp", K.sphereGeo(), {
          x: ax + ux * t,
          y: y + 0.11 + j * 0.21,
          z: az + uz * t,
          sx: 0.3,
          sy: 0.12,
          sz: 0.22,
          ry: yaw + (r() - 0.5) * 0.2,
          tint: [0.62 + r() * 0.1, 0.56, 0.42],
        });
      }
    }
    if (o.col !== false)
      b.ocol(
        (ax + bx) / 2,
        (az + bz) / 2,
        len,
        0.5,
        y,
        y + rows * 0.21 + 0.1,
        yaw,
        { tag: "sandbags", surface: "dirt" },
      );
  };
  /** Shellback nest: a slimy mound with a clutch of eggs, shell fragments and bones (glow optional). */
