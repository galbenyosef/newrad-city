// play-inline-212 03 — box
// Lines 342-456 of readable/play-inline-212.pretty.js (statement-aligned).
  PH.cropRow = function (b, x0, z0, x1, z1, seed) {
    const r = PH.rng("crop" + seed);
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    b.box("soil", (x0 + x1) / 2, -0.05, (z0 + z1) / 2, len, 0.3, 0.8, {
      ry,
      seg: false,
      grime: 0.2,
      rx: 0,
    });
    const n = Math.max(2, Math.floor(len / 0.9));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n,
        x = x0 + (x1 - x0) * t,
        z = z0 + (z1 - z0) * t;
      if (r() < 0.12) continue; // failed plant
      const s = 0.25 + r() * 0.22;
      if (seed % 2) {
        // gnarlberry bush: knotted stems + leaf clumps + a fruit or two
        b.rod(
          "bark",
          PH.v3(x, 0.2, z),
          PH.v3(x + (r() - 0.5) * 0.3, 0.2 + s * 2.2, z + (r() - 0.5) * 0.3),
          0.03,
          4,
          { r2: 0.015 },
        );
        b.rock("foliage", x, 0.25 + s * 1.6, z, s * 0.9, {
          detail: 0,
          rough: 0.8,
          c: [0xffffff, 0xd8c8a0, 0xb8b090][i % 3],
          grime: 0.15,
          sy: 0.75,
        });
        if (r() < 0.5)
          b.sphere("fruit", x + 0.15, 0.25 + s * 1.3, z + 0.1, 0.07, {
            ws: 6,
            hs: 4,
          });
      } else {
        // potato: low spiky clumps
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * TAU + r();
          b.rod(
            "foliage",
            PH.v3(x, 0.2, z),
            PH.v3(x + Math.cos(a) * s, 0.2 + s * 1.3, z + Math.sin(a) * s),
            0.035,
            4,
            { r2: 0.01, c: 0xa8a070 },
          );
        }
        b.sphere("fruit", x, 0.26, z, 0.09, { ws: 6, hs: 4, c: 0x8a7a50 });
      }
    }
  };

  /** Settlement water tower: riveted tank on four braced legs, ladder, drip pipe. */
  PH.waterTower = function (b, x, z, h, opts) {
    opts = opts || {};
    const R = opts.r || 2.2,
      TH = opts.th || 3.2;
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]) {
      const lx = x + sx * R * 0.72,
        lz = z + sz * R * 0.72;
      b.rod(
        "rust",
        PH.v3(lx + sx * 0.4, 0, lz + sz * 0.4),
        PH.v3(lx, h, lz),
        0.11,
        6,
      );
      PH.col(lx + sx * 0.2, lz + sz * 0.2, 0.35, 0.35, 0, h, 0, {
        walkable: false,
      });
    }
    for (const yy of [h * 0.35, h * 0.7]) {
      const k = R * 0.72 + 0.4 * (1 - yy / h);
      b.box("rust", x, yy, z - k, k * 2, 0.1, 0.08, { seg: false });
      b.box("rust", x, yy, z + k, k * 2, 0.1, 0.08, { seg: false });
      b.box("rust", x - k, yy, z, 0.08, 0.1, k * 2, { seg: false });
      b.box("rust", x + k, yy, z, 0.08, 0.1, k * 2, { seg: false });
    }
    b.cyl("rust", x, h, z, R * 1.05, R * 1.05, 0.25, 16, { hSeg: 1 });
    b.cyl("metal", x, h + 0.25, z, R, R, TH, 16, { hSeg: 3, c: 0x9aa0a0 });
    for (let k = 0; k < 3; k++)
      b.cyl("rust", x, h + 0.5 + k * 1.05, z, R + 0.04, R + 0.04, 0.08, 16, {
        hSeg: 1,
      });
    b.cyl("rust", x, h + 0.25 + TH, z, 0.3, R * 1.08, 0.9, 16, { hSeg: 1 });
    // ladder
    for (let yy = 0.4; yy < h + TH; yy += 0.35)
      b.box("iron", x, yy, z + R + 0.35, 0.5, 0.04, 0.04, { seg: false });
    for (const s of [-1, 1])
      b.box("iron", x + s * 0.25, 0, z + R + 0.35, 0.05, h + TH, 0.05, {
        seg: false,
      });
    // down pipe with a tap and a bucket
    b.rod(
      "iron",
      PH.v3(x - R * 0.6, h, z - R * 0.3),
      PH.v3(x - R * 0.6, 0.9, z - R * 0.3),
      0.06,
      6,
    );
    b.cyl("metal", x - R * 0.6, 0, z - R * 0.3 - 0.1, 0.22, 0.18, 0.4, 8, {
      hSeg: 1,
      c: 0x8a8a7a,
    });
  };
