// play-inline-92 01 — the
// Lines 12-308 of readable/play-inline-92.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const M = G.map._;
  const SY = M.SIDEWALK_Y;

  // Reserved rectangles: no generic buildings are placed here (see lotValid).
  // Height limits keep classic sight-lines open (Empire State seen up the avenue from Madison Square)
  M.HEIGHT_CAPS = [{ x0: 45, x1: 115, z0: -48, z1: 47, maxH: 16 }];
  M.OPEN_SPACES = [
    // Round 1 (revised twice): Broadway crosses 5th Ave inside the 23rd St junction (centre lines z≈72, Flatiron prow on
    // 23rd's south kerb). Madison Square Park fills the NE quadrant: west edge on 5th Ave, south edge on 23rd St, its
    // SW corner clipped by Broadway's kerb. Worth Square is the small triangle in the V NORTH of the crossing
    // (Broadway west, 5th Ave east, 26th St north) — bounded by the three carriageways, as in NYC.
    {
      id: "madison_square",
      name: "Madison Square Park",
      kind: "park",
      x0: 130,
      x1: 190,
      z0: 47,
      z1: 78,
      poly: [
        [130, 47],
        [190, 47],
        [190, 78],
        [143.25, 78],
        [130, 69.1],
      ],
    },
    {
      id: "worth_square",
      name: "Worth Square",
      kind: "island",
      x0: 87.5,
      x1: 114,
      z0: 44,
      z1: 61.9,
      poly: [
        [87.5, 44],
        [114, 44],
        [114, 61.9],
      ],
    },
    {
      id: "pershing_square",
      name: "Pershing Square",
      kind: "plaza",
      x0: 210,
      x1: 270,
      z0: -178,
      z1: -147,
    },
    {
      id: "bridge_plaza",
      name: "Brooklyn Bridge Plaza",
      kind: "plaza",
      x0: 130,
      x1: 190,
      z0: 652,
      z1: 663,
    },
    // The James A. Farley Post Office (poi_penn site x −180..−140) faces EAST onto 8th Avenue: the 10 m strip between its
    // steps and the 8th Ave building line is its forecourt, open to the avenue and Penn Station opposite (the street-wall
    // infill had put a collapsed shop + a brick tenement in front of the colonnade). Covers the block's whole 8th Ave
    // frontage (33rd → 31st St kerbs); `clear` = the approach in front of the flight of steps, kept free of anything solid.
    {
      id: "farley_forecourt",
      name: "Farley Post Office forecourt",
      kind: "forecourt",
      x0: -140,
      x1: -130,
      z0: -133,
      z1: -102,
      clear: { z0: -129.6, z1: -108.4 },
    },
  ];

  function lawn(o) {
    const b = M.buf("grass_dead", (o.x0 + o.x1) / 2, (o.z0 + o.z1) / 2);
    M.quad(
      b,
      [o.x0 + 1.5, SY + 0.03, o.z1 - 1.5],
      [o.x1 - 1.5, SY + 0.03, o.z1 - 1.5],
      [o.x1 - 1.5, SY + 0.03, o.z0 + 1.5],
      [o.x0 + 1.5, SY + 0.03, o.z0 + 1.5],
      [0, 1, 0],
      [
        o.x0 / 4,
        o.z1 / 4,
        o.x1 / 4,
        o.z1 / 4,
        o.x1 / 4,
        o.z0 / 4,
        o.x0 / 4,
        o.z0 / 4,
      ],
      [0.8, 0.75, 0.55],
    );
  }
  function lowFence(o, gaps, yBase) {
    const SY = yBase === undefined ? M.SIDEWALK_Y : yBase; // eslint-disable-line no-shadow
    const b = M.buf(
      "metal_painted",
      (o.x0 + o.x1) / 2,
      (o.z0 + o.z1) / 2,
      "detail",
    );
    const c = [0.22, 0.25, 0.22];
    const pts = [
      [o.x0 + 1.2, o.z0 + 1.2],
      [o.x1 - 1.2, o.z0 + 1.2],
      [o.x1 - 1.2, o.z1 - 1.2],
      [o.x0 + 1.2, o.z1 - 1.2],
    ];
    for (let i = 0; i < 4; i++) {
      const a = pts[i],
        d = pts[(i + 1) % 4];
      const len = Math.hypot(d[0] - a[0], d[1] - a[1]),
        ux = (d[0] - a[0]) / len,
        uz = (d[1] - a[1]) / len;
      const nx = uz,
        nz = -ux;
      let t = 0;
      const mid = len / 2;
      const segs = [
        [0, mid - 2.5],
        [mid + 2.5, len],
      ]; // entrance gap in the middle of every side
      for (const [t0, t1] of segs) {
        M.beam(
          b,
          a[0] + ux * t0,
          SY + 0.9,
          a[1] + uz * t0,
          a[0] + ux * t1,
          SY + 0.9,
          a[1] + uz * t1,
          0.04,
          0.04,
          { c },
        );
        for (t = t0; t <= t1; t += 0.28)
          M.vbar(
            b,
            a[0] + ux * t,
            a[1] + uz * t,
            SY,
            SY + 1.0,
            0.03,
            nx,
            nz,
            c,
            true,
          );
        M.ocol(
          a[0] + (ux * (t0 + t1)) / 2,
          a[1] + (uz * (t0 + t1)) / 2,
          t1 - t0,
          0.12,
          0,
          1.0,
          Math.atan2(-uz, ux),
          { tag: "fence", surface: "metal" },
        );
      }
    }
    void gaps;
  }
  function paths(o) {
    const cx = (o.x0 + o.x1) / 2,
      cz = (o.z0 + o.z1) / 2;
    const b = M.buf("sidewalk", cx, cz);
    const y = SY + 0.05;
    // cross paths + a ring
    M.quad(
      b,
      [cx - 1.6, y, o.z1 - 1.3],
      [cx + 1.6, y, o.z1 - 1.3],
      [cx + 1.6, y, o.z0 + 1.3],
      [cx - 1.6, y, o.z0 + 1.3],
      [0, 1, 0],
      [0, 0, 1, 0, 1, 8, 0, 8],
      [0.82, 0.8, 0.75],
    );
    M.quad(
      b,
      [o.x0 + 1.3, y, cz + 1.6],
      [o.x1 - 1.3, y, cz + 1.6],
      [o.x1 - 1.3, y, cz - 1.6],
      [o.x0 + 1.3, y, cz - 1.6],
      [0, 1, 0],
      [0, 0, 16, 0, 16, 1, 0, 1],
      [0.82, 0.8, 0.75],
    );
    M.cyl(M.buf("granite", cx, cz), cx, SY, cz, 5, 5, 0.07, 20, {
      capTop: true,
      c: [0.8, 0.78, 0.72],
    });
  }

  /** Clip a convex polygon to the oriented rectangle a→b (half-width hw) → convex polygon or null. */
  function stripClip(poly, ax, az, bx, bz, hw) {
    const dx = bx - ax,
      dz = bz - az,
      l = Math.hypot(dx, dz),
      nx = -dz / l,
      nz = dx / l;
    let p = M.clipHalf(
      poly,
      ax + nx * hw,
      az + nz * hw,
      bx + nx * hw,
      bz + nz * hw,
      -1,
    );
    if (p.length >= 3)
      p = M.clipHalf(
        p,
        ax - nx * hw,
        az - nz * hw,
        bx - nx * hw,
        bz - nz * hw,
        1,
      );
    if (p.length >= 3) p = M.clipHalf(p, ax, az, ax + nx, az + nz, -1); // beyond a
    if (p.length >= 3) p = M.clipHalf(p, bx, bz, bx + nx, bz + nz, 1); // before b
    return p.length >= 3 && Math.abs(M.polyArea(p)) > 0.2 ? p : null;
  }
  /** Low iron hoop fence round polygon pts with openings (gap m wide) where the given points touch an edge. */
  function gappedFence(pts, y, openings, gap) {
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length,
      cz = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const b = M.buf("metal_painted", cx, cz, "detail");
    const c = [0.22, 0.25, 0.22];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        d = pts[(i + 1) % pts.length];
      const len = Math.hypot(d[0] - a[0], d[1] - a[1]);
      if (len < 0.8) continue;
      const ux = (d[0] - a[0]) / len,
        uz = (d[1] - a[1]) / len,
        nx = uz,
        nz = -ux;
      const cutsT = [];
      for (const o of openings) {
        const t = (o[0] - a[0]) * ux + (o[1] - a[1]) * uz,
          off = Math.abs((o[0] - a[0]) * nx + (o[1] - a[1]) * nz);
        if (off < 1.2 && t > -0.5 && t < len + 0.5) cutsT.push(t);
      }
      cutsT.sort((p, q) => p - q);
      const segs = [];
      let t0 = 0.15;
      for (const t of cutsT) {
        if (t - gap / 2 - t0 > 0.6) segs.push([t0, t - gap / 2]);
        t0 = Math.max(t0, t + gap / 2);
      }
      if (len - 0.15 - t0 > 0.6) segs.push([t0, len - 0.15]);
      for (const [s0, s1] of segs) {
        M.beam(
          b,
          a[0] + ux * s0,
          y + 0.85,
          a[1] + uz * s0,
          a[0] + ux * s1,
          y + 0.85,
          a[1] + uz * s1,
          0.04,
          0.04,
          { c },
        );
        for (let t = s0; t <= s1; t += 0.3)
          M.vbar(
            b,
            a[0] + ux * t,
            a[1] + uz * t,
            y,
            y + 0.95,
            0.03,
            nx,
            nz,
            c,
            true,
          );
        M.ocol(
          a[0] + (ux * (s0 + s1)) / 2,
          a[1] + (uz * (s0 + s1)) / 2,
          s1 - s0,
          0.12,
          y,
          y + 0.95,
          Math.atan2(-uz, ux),
          { tag: "fence", surface: "metal" },
        );
      }
    }
  }
  /** A bronze statue on a granite pedestal (Farragut / Seward), facing yaw (0 = north). */
