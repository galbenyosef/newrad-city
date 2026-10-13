// play-inline-408 05 — yaw
// Lines 788-984 of readable/play-inline-408.pretty.js (statement-aligned).
  K.clutter = function (b, x0, z0, x1, z1, y, o) {
    o = o || {};
    const r = K.rng(o.seed || (x0 * 13 + z0 * 7) | 0);
    const kinds = o.kinds || [
      "chair",
      "paper",
      "box",
      "panel",
      "debris",
      "glass",
      "can",
    ];
    const avoid = o.avoid || [];
    const free = (x, z, pad) => {
      for (const a of avoid)
        if (
          x > a[0] - pad &&
          x < a[2] + pad &&
          z > a[1] - pad &&
          z < a[3] + pad
        )
          return false;
      return true;
    };
    const n = o.n || 20;
    for (let i = 0; i < n; i++) {
      const k = kinds[i % kinds.length];
      const x = x0 + 0.4 + r() * (x1 - x0 - 0.8),
        z = z0 + 0.4 + r() * (z1 - z0 - 0.8),
        yaw = r() * PI * 2;
      if (!free(x, z, 0.6)) continue;
      if (k === "chair")
        K.chair(b, x, y, z, yaw, {
          fallen: true,
          mat: o.chairMat || "wood_dark",
          tint: [0.5, 0.36, 0.24],
        });
      else if (k === "paper") {
        b.hplate(
          "decal",
          x,
          y + 0.011 + r() * 0.002,
          z,
          1.2 + r(),
          1 + r() * 0.6,
          yaw,
          K.decal("grime", 200 + (i % 6)),
        );
        for (let q = 0; q < 7; q++)
          b.box(
            "flat",
            x + (r() - 0.5) * 1.3,
            y + 0.004 + q * 0.0015,
            z + (r() - 0.5) * 1.1,
            0.21,
            0.002,
            0.29,
            {
              yaw: r() * 6,
              tint: r.pick([
                [0.86, 0.84, 0.76],
                [0.78, 0.76, 0.66],
                [0.9, 0.88, 0.82],
              ]),
            },
          );
      } else if (k === "box") {
        const h = 0.28,
          c = r.pick([
            [0.62, 0.5, 0.34],
            [0.55, 0.45, 0.3],
          ]);
        b.box("wood", x, y, z, 0.38, h, 0.3, { yaw, tint: c, faces: "nsewt" });
        if (r() < 0.6)
          b.box("wood", x + 0.08, y + h, z - 0.04, 0.38, h, 0.3, {
            yaw: yaw + (r() - 0.5) * 0.5,
            tint: c.map((v) => v * 0.92),
            faces: "nsewt",
          });
        for (let q = 0; q < 3; q++)
          b.box(
            "flat",
            x + (r() - 0.5) * 0.9,
            y + 0.004,
            z + (r() - 0.5) * 0.9,
            0.22,
            0.003,
            0.3,
            { yaw: r() * 6, tint: [0.84, 0.82, 0.74] },
          );
      } else if (k === "panel") {
        // a fallen acoustic/plaster ceiling panel, one edge propped on debris, + the dust it brought down
        const L = 1.2,
          W = 0.6,
          c = Math.cos(yaw),
          s = Math.sin(yaw),
          h = 0.12 + r() * 0.25,
          pt = o.panelTint || [0.72, 0.7, 0.64];
        const P = (u, v, yy) => [x + u * c + v * s, y + yy, z - u * s + v * c];
        b.quadN(
          o.panelMat || "plaster",
          P(-L / 2, -W / 2, 0.02),
          P(L / 2, -W / 2, h),
          P(L / 2, W / 2, h),
          P(-L / 2, W / 2, 0.02),
          [-(h / L) * c, 1, (h / L) * s],
          { tint: pt },
        );
        b.hplate(
          "decal",
          x,
          y + 0.012,
          z,
          1.6,
          1.4,
          yaw,
          K.decal("grime", 210 + (i % 4)),
        );
        b.box(
          "concrete",
          x + (L / 2 - 0.1) * c,
          y,
          z - (L / 2 - 0.1) * s,
          0.25,
          h,
          0.3,
          { yaw, tint: [0.62, 0.6, 0.56] },
        );
      } else if (k === "debris") {
        K.rubble(b, x, y, z, 0.45 + r() * 0.4, 0.25 + r() * 0.2, {
          seed: 300 + i,
          col: false,
          n: 5,
          tint: o.debrisTint || [0.78, 0.76, 0.72],
        });
      } else if (k === "glass") {
        for (let q = 0; q < 6; q++) {
          const gx = x + (r() - 0.5) * 1.2,
            gz = z + (r() - 0.5) * 1.2,
            gs = 0.08 + r() * 0.16;
          b.quadN(
            "glass",
            [gx, y + 0.006, gz],
            [gx + gs, y + 0.006, gz + r() * 0.05],
            [gx + gs * 0.6, y + 0.006, gz + gs],
            [gx, y + 0.006, gz + gs * 0.5],
            [0, 1, 0],
            { tint: [0.55, 0.62, 0.62] },
          );
        }
      } else if (k === "can") {
        for (let q = 0; q < 4; q++) {
          const cx = x + (r() - 0.5) * 0.9,
            cz = z + (r() - 0.5) * 0.9;
          if (r() < 0.5)
            b.cyl("rust", cx, y, cz, 0.035, 0.035, 0.12, 6, {
              tint: [0.7, 0.55, 0.4],
            });
          else
            b.geo("glass", K.unitCyl(6), {
              x: cx,
              y: y + 0.035,
              z: cz,
              rz: PI / 2,
              ry: r() * 6,
              sx: 0.035,
              sy: 0.24,
              sz: 0.035,
              tint: r.pick([
                [0.35, 0.5, 0.3],
                [0.5, 0.35, 0.18],
              ]),
            });
        }
      } else if (k === "books") {
        for (let q = 0; q < 6; q++)
          b.box(
            "leather",
            x + (r() - 0.5) * 0.6,
            y + (q > 3 ? 0.04 : 0),
            z + (r() - 0.5) * 0.6,
            0.16,
            0.04,
            0.24,
            {
              yaw: r() * 6,
              tint: r.pick([
                [0.45, 0.18, 0.12],
                [0.2, 0.28, 0.35],
                [0.3, 0.35, 0.2],
                [0.5, 0.42, 0.3],
              ]),
            },
          );
      }
    }
  };
