// play-inline-421 03 — tint
// Lines 372-659 of readable/play-inline-421.pretty.js (statement-aligned).
  K.tireFender = function (b, x, y, z, nx, nz) {
    const ry = Math.atan2(nx, nz);
    b.geo("rubber", K.torusGeo(), {
      x: x + nx * 0.2,
      y,
      z: z + nz * 0.2,
      sx: 0.4,
      sy: 0.4,
      sz: 0.55,
      ry,
      tint: [0.12, 0.12, 0.12],
    });
    b.pipe(
      "rope",
      x,
      y + 0.35,
      z,
      x + nx * 0.2,
      y + 0.45,
      z + nz * 0.2,
      0.02,
      4,
    );
  };
  /** Iron ladder on a wall face (nx,nz) from y0 to y1. */
  K.ladder = function (b, x, z, y0, y1, nx, nz, o) {
    o = o || {};
    const ux = nz,
      uz = -nx,
      w = o.w || 0.45,
      off = 0.12;
    for (const e of [-1, 1])
      b.beam(
        o.mat || "rust",
        x + (ux * e * w) / 2 + nx * off,
        y0,
        z + (uz * e * w) / 2 + nz * off,
        x + (ux * e * w) / 2 + nx * off,
        y1 + (o.hoop ? 0.9 : 0),
        z + (uz * e * w) / 2 + nz * off,
        0.05,
        0.05,
      );
    for (let y = y0 + 0.25; y < y1; y += 0.3)
      b.beam(
        o.mat || "rust",
        x - (ux * w) / 2 + nx * off,
        y,
        z - (uz * w) / 2 + nz * off,
        x + (ux * w) / 2 + nx * off,
        y,
        z + (uz * w) / 2 + nz * off,
        0.03,
        0.03,
      );
  };

  /** Riveted steel lattice tower (w × d footprint, 4 legs, X-bracing each face every `bay` m). */
  K.lattice = function (b, x, z, w, d, y0, h, o) {
    o = o || {};
    const mat = o.mat || "rust",
      bay = o.bay || 2.2,
      t = o.t || 0.16;
    const leg = [
      [-w / 2, -d / 2],
      [w / 2, -d / 2],
      [w / 2, d / 2],
      [-w / 2, d / 2],
    ];
    for (const [lx, lz] of leg)
      b.box(mat, x + lx, y0, z + lz, t, h, t, { tint: o.tint });
    const n = Math.max(1, Math.round(h / bay));
    for (let k = 0; k <= n; k++) {
      const y = y0 + (h * k) / n;
      for (let i = 0; i < 4; i++) {
        const A = leg[i],
          Bq = leg[(i + 1) % 4];
        b.beam(
          mat,
          x + A[0],
          y,
          z + A[1],
          x + Bq[0],
          y,
          z + Bq[1],
          t * 0.6,
          t * 0.6,
          { tint: o.tint },
        );
      }
      if (k < n) {
        const y1 = y0 + (h * (k + 1)) / n;
        for (let i = 0; i < 4; i++) {
          const A = leg[i],
            Bq = leg[(i + 1) % 4];
          b.beam(
            mat,
            x + A[0],
            y,
            z + A[1],
            x + Bq[0],
            y1,
            z + Bq[1],
            t * 0.4,
            t * 0.4,
            { tint: o.tint },
          );
          b.beam(
            mat,
            x + Bq[0],
            y,
            z + Bq[1],
            x + A[0],
            y1,
            z + A[1],
            t * 0.4,
            t * 0.4,
            { tint: o.tint },
          );
        }
      }
    }
    if (o.col !== false)
      b.col(x - w / 2, y0, z - d / 2, x + w / 2, y0 + h, z + d / 2, {
        tag: "structure",
        surface: "metal",
        walkable: false,
      });
  };

  // ------------------------------------------------------------------
  // Settlement dressing
  // ------------------------------------------------------------------
  const GOODS = [
    [0.62, 0.48, 0.3],
    [0.5, 0.52, 0.4],
    [0.7, 0.3, 0.22],
    [0.35, 0.42, 0.5],
    [0.75, 0.68, 0.5],
  ];
  /** Trader's stall: 4 posts, sloping tarp, counter of planks on crates, goods on it. Faces local −z at yaw 0. */
  K.stall = function (b, x, y, z, yaw, w, d, o) {
    o = o || {};
    const r = K.rng(o.seed || (x * 13 + z * 5) | 0),
      c = Math.cos(yaw),
      s = Math.sin(yaw);
    const L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    const hF = o.h || 2.4,
      hB = hF + 0.5;
    for (const [lx, lz, h] of [
      [-w / 2, -d / 2, hF],
      [w / 2, -d / 2, hF],
      [-w / 2, d / 2, hB],
      [w / 2, d / 2, hB],
    ]) {
      const p = L(lx, lz);
      b.box("wood_rotten", p[0], y, p[1], 0.1, h, 0.1, {
        yaw,
        tint: [0.6, 0.5, 0.4],
      });
    }
    const tarp = o.tarp || "canvas_tarp";
    const p0 = L(-w / 2 - 0.2, -d / 2 - 0.35),
      p1 = L(w / 2 + 0.2, -d / 2 - 0.35),
      p2 = L(w / 2 + 0.2, d / 2 + 0.1),
      p3 = L(-w / 2 - 0.2, d / 2 + 0.1);
    b.quadN(
      tarp,
      [p0[0], y + hF - 0.12, p0[1]],
      [p1[0], y + hF - 0.12, p1[1]],
      [p2[0], y + hB + 0.05, p2[1]],
      [p3[0], y + hB + 0.05, p3[1]],
      [0, 1, 0],
      { tint: o.tarpTint, grime: 0.5 },
    );
    b.quadN(
      tarp,
      [p0[0], y + hF - 0.14, p0[1]],
      [p1[0], y + hF - 0.14, p1[1]],
      [p2[0], y + hB + 0.03, p2[1]],
      [p3[0], y + hB + 0.03, p3[1]],
      [0, -1, 0],
      {
        tint: (o.tarpTint || [0.66, 0.59, 0.43]).map
          ? (o.tarpTint || [0.66, 0.59, 0.43]).map((v) => v * 0.6)
          : o.tarpTint,
        grime: 0.3,
      },
    );
    // scalloped front valance
    for (let k = 0; k < 6; k++) {
      const a = L(-w / 2 - 0.2 + ((w + 0.4) * k) / 6, -d / 2 - 0.36),
        e = L(-w / 2 - 0.2 + ((w + 0.4) * (k + 1)) / 6, -d / 2 - 0.36);
      b.quadN(
        tarp,
        [a[0], y + hF - 0.45, a[1]],
        [e[0], y + hF - 0.45, e[1]],
        [e[0], y + hF - 0.12, e[1]],
        [a[0], y + hF - 0.12, a[1]],
        [-s, 0, -c],
        {
          tint: k % 2 ? o.tarpTint : o.tarpTint2 || [0.8, 0.76, 0.66],
          grime: 0.4,
        },
      );
    }
    // counter: plank top on two crates
    const cp = L(0, -d / 2 + 0.35);
    b.box("wood", cp[0], y + 0.9, cp[1], w - 0.2, 0.07, 0.6, {
      yaw,
      tint: [0.6, 0.48, 0.36],
      faces: "nsewtb",
    });
    for (const e of [-1, 1]) {
      const q = L(e * (w / 2 - 0.45), -d / 2 + 0.35);
      b.box("wood", q[0], y, q[1], 0.6, 0.9, 0.55, {
        yaw,
        tint: [0.5, 0.42, 0.3],
      });
    }
    // goods
    for (let k = 0; k < 7; k++) {
      const q = L(-w / 2 + 0.3 + r() * (w - 0.6), -d / 2 + 0.2 + r() * 0.3),
        kk = r();
      if (kk < 0.35)
        b.cyl("rust", q[0], y + 0.97, q[1], 0.05, 0.05, 0.13, 6, {
          tint: r.pick(GOODS),
        });
      else if (kk < 0.6)
        b.cyl("glass", q[0], y + 0.97, q[1], 0.04, 0.04, 0.24, 6, {
          tint: r.pick([
            [0.3, 0.5, 0.3],
            [0.5, 0.3, 0.15],
            [0.8, 0.8, 0.7],
          ]),
        });
      else if (kk < 0.8)
        b.box("fabric", q[0], y + 0.97, q[1], 0.25, 0.12 + r() * 0.1, 0.2, {
          yaw: yaw + r() * 0.6,
          tint: r.pick(GOODS),
        });
      else
        b.box("metal_dark", q[0], y + 0.97, q[1], 0.35, 0.08, 0.12, {
          yaw: yaw + r() * 0.4,
          tint: [0.4, 0.4, 0.38],
        });
    }
    // back shelf of stock
    const sp = L(0, d / 2 - 0.25);
    K.shelf(b, sp[0], y, sp[1], yaw, w - 0.4, {
      h: 1.6,
      d: 0.35,
      levels: 3,
      mat: "wood_rotten",
      col: false,
      items: o.items || ["can", "jar", "bottle", "box"],
      seed: (x * 7 + z) | 0,
    });
    if (o.sign) {
      const q = L(0, -d / 2 - 0.37);
      b.plate(
        "art",
        q[0],
        y + hF - 0.05,
        q[1],
        -s,
        -c,
        Math.min(w, 2.2),
        0.5,
        o.sign,
        { off: 0.02 },
      );
    }
    if (o.col !== false)
      b.ocol(cp[0], cp[1], w, 0.7, y, y + 1.0, yaw, {
        tag: "furniture",
        surface: "wood",
      });
    if (o.lamp !== false) {
      const q = L(0, -d / 2 + 0.2);
      K.lamp(b, q[0], y + hF - 0.35, q[1], "cage", [1, 0.75, 0.45], 0, 0, {
        ceil: y + hF - 0.12,
        glowSize: 1.2,
      });
    }
  };

  /** Covered caravan wagon: bed, 4 wheels, canvas hoops, shafts toward local −z. */
