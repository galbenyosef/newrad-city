// play-inline-253 03 — math
// Lines 303-612 of readable/play-inline-253.pretty.js (statement-aligned).
  BK.rail = function (b, pts, opts) {
    opts = opts || {};
    const key = opts.key || "iron",
      h = opts.h || 1.15;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1];
      const A = V3(a[0], a[2], a[1]),
        C = V3(c[0], c[2], c[1]);
      b.beam(
        key,
        A.clone().setY(A.y + h),
        C.clone().setY(C.y + h),
        0.09,
        0.09,
        { grime: 0.4 },
      );
      b.beam(
        key,
        A.clone().setY(A.y + h * 0.55),
        C.clone().setY(C.y + h * 0.55),
        0.06,
        0.06,
        { grime: 0.4 },
      );
      if (opts.lattice) {
        // Queensboro-style X lattice panels
        const len = A.distanceTo(C),
          n = Math.max(1, Math.round(len / 1.2));
        for (let k = 0; k < n; k++) {
          const p0 = A.clone().lerp(C, k / n),
            p1 = A.clone().lerp(C, (k + 1) / n);
          b.beam(
            key,
            p0.clone().setY(p0.y + 0.1),
            p1.clone().setY(p1.y + h - 0.05),
            0.04,
            0.04,
            { noAO: true, grime: 0.3 },
          );
          b.beam(
            key,
            p0.clone().setY(p0.y + h - 0.05),
            p1.clone().setY(p1.y + 0.1),
            0.04,
            0.04,
            { noAO: true, grime: 0.3 },
          );
        }
        b.beam(
          key,
          A.clone().setY(A.y + 0.1),
          C.clone().setY(C.y + 0.1),
          0.07,
          0.07,
          { grime: 0.4 },
        );
      }
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      const n = Math.max(1, Math.round(len / (opts.post || 2.5)));
      for (let k = 0; k <= n; k++) {
        if (k === n && i < pts.length - 2) continue;
        const t = k / n;
        b.box(
          key,
          a[0] + (c[0] - a[0]) * t,
          a[2] + (c[2] - a[2]) * t,
          a[1] + (c[1] - a[1]) * t,
          0.12,
          h + 0.05,
          0.12,
          { seg: false, grime: 0.4 },
        );
      }
      if (opts.collide !== false)
        PF.colWall(
          a[0],
          a[1],
          c[0],
          c[1],
          0.3,
          Math.min(a[2], c[2]) - 1.2,
          Math.max(a[2], c[2]) + h,
          { walkable: false, surface: "metal" },
        );
    }
  };

  /**
   * Steel switch-back stair tower. Flights run along ±X between xA and xB (xA < xB) in alternating lanes
   * laneZ[0], laneZ[1] (centre z of each lane), width w. Climbs y0→y1 over nFlights flights starting in lane 0
   * at xA going +X. Landings at both ends (landing depth ld). Returns the top landing centre.
   */
  BK.switchback = function (b, key, xA, xB, laneZ, w, y0, y1, nFlights, opts) {
    opts = opts || {};
    const ld = opts.landing || 1.8;
    const rise = (y1 - y0) / nFlights;
    const run = xB - xA;
    const zMin = Math.min(laneZ[0], laneZ[1]) - w / 2,
      zMax = Math.max(laneZ[0], laneZ[1]) + w / 2;
    let y = y0;
    for (let f = 0; f < nFlights; f++) {
      const lane = laneZ[f % 2];
      const east = f % 2 === 0;
      const sx = east ? xA : xB;
      PF.stairs(
        b,
        key,
        sx,
        lane,
        east ? Math.PI / 2 : -Math.PI / 2,
        w,
        run,
        y,
        y + rise,
        {
          base: y + rise * 0 - 0.25 + 0,
          maxRise: 0.32,
          surface: "metal",
          grime: 0.5,
        },
      );
      y += rise;
      // landing at the far end (spans both lanes)
      const lx0 = east ? xB : xA - ld,
        lx1 = east ? xB + ld : xA;
      b.boxMM(key, lx0, y - 0.2, zMin, lx1, y, zMax, {
        grime: 0.5,
        seg: false,
      });
      PF.colMM(lx0, y - 0.3, zMin, lx1, y, zMax, { surface: "metal" });
      // landing railing (outer end)
      const ox = east ? lx1 : lx0;
      b.beam(
        "iron",
        V3(ox, y + 1.05, zMin),
        V3(ox, y + 1.05, zMax),
        0.06,
        0.06,
        {},
      );
      PF.colMM(ox - 0.1, y, zMin, ox + 0.1, y + 1.1, zMax, {
        walkable: false,
        surface: "metal",
      });
      // flight outer railings
      const railZ =
        f % 2 === 0
          ? laneZ[0] < laneZ[1]
            ? zMin
            : zMax
          : laneZ[1] < laneZ[0]
            ? zMin
            : zMax;
      const ya = y - rise,
        yb = y;
      const xa = east ? xA : xB,
        xb = east ? xB : xA;
      b.beam(
        "iron",
        V3(xa, ya + 1.0, railZ),
        V3(xb, yb + 1.0, railZ),
        0.06,
        0.06,
        {},
      );
      for (let k = 0; k <= 4; k++) {
        const t = k / 4;
        b.box(
          "iron",
          xa + (xb - xa) * t,
          ya + (yb - ya) * t,
          railZ,
          0.06,
          1.0,
          0.06,
          { seg: false },
        );
      }
      PF.colMM(
        Math.min(xa, xb),
        ya - 1,
        railZ - 0.08,
        Math.max(xa, xb),
        yb + 1.0,
        railZ + 0.08,
        { walkable: false, surface: "metal" },
      );
    }
    // corner posts of the tower frame
    for (const px of [xA - ld, xB + ld])
      for (const pz of [zMin, zMax])
        b.box(opts.frame || key, px, y0 - 0.5, pz, 0.25, y1 - y0 + 1.6, 0.25, {
          seg: false,
          grime: 0.5,
        });
    // central divider between the lanes (stringer wall)
    const midZ = (laneZ[0] + laneZ[1]) / 2;
    b.boxMM(opts.frame || key, xA, y0, midZ - 0.06, xB, y1, midZ + 0.06, {
      grime: 0.5,
    });
    PF.colMM(xA + 0.2, y0, midZ - 0.08, xB - 0.2, y1, midZ + 0.08, {
      walkable: false,
      surface: "metal",
    });
    return { x: nFlights % 2 ? xB + ld / 2 : xA - ld / 2, y: y1, z: midZ };
  };

  /** Ornamental cast-iron bridge lamp standard (fluted post, scrolled arm, globe). lit → emissive + glow sprite. */
  BK.lamp = function (b, x, y, z, ry, lit, parent) {
    b.cyl("iron", x, y, z, 0.2, 0.26, 0.9, 8, { hSeg: 1, grime: 0.5 });
    b.cyl("iron", x, y + 0.9, z, 0.09, 0.13, 4.6, 8, { hSeg: 2, grime: 0.4 });
    b.cyl("iron", x, y + 5.5, z, 0.16, 0.1, 0.3, 8, { hSeg: 1 });
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const ax = x + s * 1.2,
      az = z + c * 1.2;
    b.beam("iron", V3(x, y + 5.6, z), V3(ax, y + 5.9, az), 0.08, 0.08, {});
    b.beam(
      "iron",
      V3(x, y + 5.1, z),
      V3(ax * 0.5 + x * 0.5, y + 5.75, az * 0.5 + z * 0.5),
      0.05,
      0.05,
      {},
    );
    b.cyl("iron", ax, y + 5.6, az, 0.26, 0.08, 0.3, 8, { hSeg: 1 });
    b.sphere(lit ? "lamp" : "glass_broken", ax, y + 5.42, az, 0.22, {
      ws: 8,
      hs: 6,
      noAO: true,
      grime: 0,
    });
    if (lit)
      PF.glow(V3(ax, y + 5.35, az), 0xffd9a0, 2.6, parent || null, {
        intensity: 1.1,
        dayFactor: 0.2,
      });
  };

  /** Enamel highway sign panel on a steel gantry spanning z0..z1 at x, sign facing ry. */
  BK.gantry = function (b, x, y, z0, z1, h, texKey, signW, signH, ry) {
    for (const zz of [z0, z1]) {
      b.box("steel", x, y, zz, 0.3, h + 0.4, 0.3, { seg: false, grime: 0.5 });
      PF.col(x, zz, 0.4, 0.4, y, y + h, 0, {
        walkable: false,
        surface: "metal",
      });
    }
    b.boxMM(
      "steel",
      x - 0.2,
      y + h,
      Math.min(z0, z1),
      x + 0.2,
      y + h + 0.35,
      Math.max(z0, z1),
      { grime: 0.5, seg: false },
    );
    b.boxMM(
      "steel",
      x - 0.2,
      y + h + signH * 0.8,
      Math.min(z0, z1),
      x + 0.2,
      y + h + signH * 0.8 + 0.25,
      Math.max(z0, z1),
      { grime: 0.5, seg: false },
    );
    b.quad(
      texKey,
      x + Math.sin(ry) * 0.25,
      y + h + signH / 2 + 0.1,
      (z0 + z1) / 2,
      signW,
      signH,
      { ry, grime: 0.25 },
    );
  };

  /** Twisted girders drooping from a broken span end at x (dir = +1 east end, -1 west end), over zs. */
  BK.debris = function (b, key, x, y, zs, dir, seed) {
    const r = PF.rng(seed || 91);
    for (const z of zs) {
      let p = V3(x, y, z);
      let ang = -0.3 - r() * 0.3;
      for (let k = 0; k < 4; k++) {
        const len = 2.5 + r() * 3;
        ang -= 0.2 + r() * 0.35;
        const q = V3(
          p.x + dir * Math.cos(ang) * len,
          p.y + Math.sin(ang) * len,
          p.z + (r() - 0.5) * 1.2,
        );
        b.beam(key, p, q, 0.5, 0.7, { grime: 0.7 });
        p = q;
      }
    }
    // rebar / cable strands
    for (let i = 0; i < 18; i++) {
      const z = zs[0] + r() * (zs[zs.length - 1] - zs[0]);
      const a = V3(x, y - 0.3, z);
      const c = V3(
        x + dir * (0.5 + r() * 2.5),
        y - 1 - r() * 5,
        z + (r() - 0.5) * 1.5,
      );
      b.beam("rust", a, c, 0.05, 0.05, { noAO: true });
    }
  };
