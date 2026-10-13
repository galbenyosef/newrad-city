/* src/map/47_openspaces.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 47 OPEN SPACES
 * Small parks & plazas carved out of the building fabric so the city
 * breathes and classic sight-lines stay open: Madison Square Park (Worth
 * obelisk, dead plane trees — frames the Empire State from the south),
 * the Grand Central forecourt (Pershing Square), the Brooklyn Bridge
 * approach plaza, and Columbus Circle's monument column at the SW corner
 * of Central Park.
 * ===================================================================== */
(function () {
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
  function statue(x, z, yaw, h, seated) {
    const y0 = SY,
      bg = M.buf("granite", x, z),
      bb = M.buf("metal_painted", x, z, "detail");
    const bronze = [0.34, 0.47, 0.41];
    M.box(bg, x - 1.7, y0, z - 1.7, x + 1.7, y0 + 0.35, z + 1.7, {
      s: 2,
      c: [0.7, 0.68, 0.64],
    });
    M.box(bg, x - 1.25, y0 + 0.35, z - 1.25, x + 1.25, y0 + h, z + 1.25, {
      s: 2,
      c: [0.74, 0.72, 0.67],
    });
    M.box(bg, x - 1.4, y0 + h, z - 1.4, x + 1.4, y0 + h + 0.25, z + 1.4, {
      s: 2,
      c: [0.78, 0.76, 0.7],
    });
    const top = y0 + h + 0.25,
      sx = Math.sin(yaw),
      sz = -Math.cos(yaw);
    if (seated) {
      M.obox(bb, x, top + 0.45, z, 1.1, 0.9, 1.2, yaw, {
        c: M.mulc(bronze, 0.8),
      }); // chair
      M.obox(bb, x + sx * 0.25, top + 1.25, z + sz * 0.25, 0.7, 0.9, 0.5, yaw, {
        c: bronze,
      }); // torso
      M.obox(
        bb,
        x + sx * 0.55,
        top + 0.75,
        z + sz * 0.55,
        0.7,
        0.25,
        0.7,
        yaw,
        { c: bronze },
      ); // lap
    } else {
      M.cyl(bb, x, top, z, 0.42, 0.3, 1.55, 8, { c: bronze }); // coat / legs
      M.cyl(bb, x, top + 1.55, z, 0.3, 0.26, 0.55, 8, { c: bronze }); // chest
      M.obox(
        bb,
        x - sz * 0.32,
        top + 1.7,
        z + sx * 0.32,
        0.14,
        0.14,
        0.6,
        yaw,
        { pitch: 0.5, c: bronze },
      ); // arm (spyglass)
    }
    M.cyl(
      bb,
      x + (seated ? sx * 0.25 : 0),
      top + (seated ? 1.7 : 2.1),
      z + (seated ? sz * 0.25 : 0),
      0.16,
      0.15,
      0.3,
      8,
      { c: bronze, capTop: true },
    );
    M.box3(x - 1.7, 0, z - 1.7, x + 1.7, top + 2.3, z + 1.7, {
      tag: "monument",
      surface: "concrete",
    });
  }

  function madisonSquare(o) {
    const r = M.rng("madison");
    const P = M.polyArea(o.poly) > 0 ? o.poly : o.poly.slice().reverse();
    const inner = M.insetPoly(P, 1.4),
      lawnP = M.insetPoly(P, 1.9);
    // hub of the path star: south-centre (the real park's central oval), fountain on it
    const hx = 165,
      hz = 63;
    // dead lawn over the whole park, stone-edged
    M.poly(M.buf("grass_dead", hx, hz), lawnP, SY + 0.03, {
      s: 4,
      c: [0.8, 0.75, 0.55],
      convex: true,
    });
    const pb = M.buf("sidewalk", hx, hz),
      y = SY + 0.05,
      pc = [0.82, 0.8, 0.75];
    // paths: to the 5th Ave / 26th St corner (Farragut), the Broadway / 23rd St corner (Seward — faces the Flatiron),
    // to Madison Ave (east), 26th St (north), 23rd St (south) and 5th Ave (west, towards Worth Square)
    const ends = [
      [134, 50.5],
      [138.2, 73.4],
      [188.5, hz],
      [hx, 47.5],
      [hx, 77.5],
      [130.5, 58],
      [188.5, 48.5],
      [188.5, 77],
    ];
    for (const [ex, ez] of ends) {
      const q = stripClip(
        inner,
        hx,
        hz,
        ex + (ex - hx) * 0.2,
        ez + (ez - hz) * 0.2,
        1.5,
      );
      if (q) M.poly(pb, q, y, { s: 4, c: pc, convex: true });
    }
    // central oval: granite ring + dry fountain basin
    M.cyl(M.buf("granite", hx, hz), hx, SY, hz, 6.5, 6.5, 0.07, 28, {
      capTop: true,
      c: [0.78, 0.76, 0.7],
    });
    const bf = M.buf("stone_limestone", hx, hz);
    M.cyl(bf, hx, SY, hz, 3.2, 3.2, 0.7, 20, { c: [0.8, 0.78, 0.72] });
    M.cyl(M.buf("dirt", hx, hz), hx, SY + 0.5, hz, 3.0, 3.0, 0.05, 20, {
      capTop: true,
      c: [0.45, 0.4, 0.32],
    });
    M.cyl(bf, hx, SY, hz, 0.5, 0.35, 2.2, 10, {
      c: [0.75, 0.73, 0.68],
      capTop: true,
    });
    M.ocol(hx, hz, 6.4, 6.4, 0, SY + 0.7, 0, { tag: "fountain" });
    // fence with openings at every path end
    gappedFence(
      M.insetPoly(P, 0.5),
      SY,
      ends.map(([ex, ez]) => [ex, ez]),
      3.2,
    );
    // monuments: Farragut (NW, 26th St & 5th) and Seward (SW, seated, on the Broadway / 23rd St corner, facing the prow)
    statue(135.5, 53.5, -Math.PI / 4 - Math.PI / 2 + Math.PI, 2.6, false);
    statue(141.5, 70.8, Math.PI + 0.62, 2.2, true);
    // dead plane trees in the lawns (clear of paths / hub / statues)
    const nearPath = (x, z) => {
      if (Math.hypot(x - hx, z - hz) < 8.5) return true;
      for (const [ex, ez] of ends)
        if (G.LAYOUT.distToSeg(x, z, hx, hz, ex, ez) < 3.2) return true;
      return M.distToPoly(x, z, inner) < 3;
    };
    let placed = 0;
    for (let i = 0; i < 60 && placed < 16; i++) {
      const x = r.range(o.x0 + 3, o.x1 - 3),
        z = r.range(o.z0 + 3, o.z1 - 3);
      if (
        !M.inPoly(x, z, lawnP) ||
        nearPath(x, z) ||
        Math.hypot(x - 135.5, z - 53.5) < 4 ||
        Math.hypot(x - 141.5, z - 70.8) < 4
      )
        continue;
      M.placeTree(x, z, r.int(0, 8), r() * 6, r.range(0.9, 1.3));
      placed++;
    }
    // benches along the paths, lamps at the path ends
    for (const [ex, ez] of ends.slice(0, 6)) {
      const dx = ex - hx,
        dz = ez - hz,
        l = Math.hypot(dx, dz),
        ux = dx / l,
        uz = dz / l;
      const t = Math.min(l * 0.55, l - 5);
      if (t < 9) continue;
      const bx = hx + ux * t - uz * 2.3,
        bz = hz + uz * t + ux * 2.3;
      if (M.inPoly(bx, bz, inner))
        M.parkBench(bx, bz, Math.atan2(ux, uz) + Math.PI / 2, r() < 0.3);
      const lx = hx + ux * (l - 3) + uz * 2.2,
        lz = hz + uz * (l - 3) - ux * 2.2;
      if (M.inPoly(lx, lz, inner)) M.parkLamp(lx, lz, r() < 0.25);
    }
    // leaves & trash
    for (let i = 0; i < 20; i++) {
      const x = r.range(o.x0 + 2, o.x1 - 2),
        z = r.range(o.z0 + 2, o.z1 - 2);
      if (M.inPoly(x, z, inner))
        M.decal(
          M.buf("my/markings", hx, hz, "fine"),
          x,
          SY + 0.06,
          z,
          r.range(2, 5),
          r.range(2, 5),
          r() * 6,
          r.pick([M.MARK.LEAVES, M.MARK.DIRT, M.MARK.LITTER]),
        );
    }
  }

  function plaza(o) {
    const r = M.rng(o.id);
    const cx = (o.x0 + o.x1) / 2,
      cz = (o.z0 + o.z1) / 2;
    const w = o.x1 - o.x0,
      d = o.z1 - o.z0;
    // planters with dead trees
    const pb = M.buf("concrete", cx, cz);
    const nP = Math.max(2, Math.floor(w / 14));
    for (let i = 0; i < nP; i++) {
      const x = o.x0 + ((i + 0.5) * w) / nP,
        z = o.z0 + (d > 18 ? 4 : 2.2);
      M.box(pb, x - 1.3, SY, z - 1.3, x + 1.3, SY + 0.7, z + 1.3, {
        s: 2,
        c: [0.72, 0.7, 0.66],
      });
      M.box(
        M.buf("dirt", x, z),
        x - 1.2,
        SY + 0.7,
        z - 1.2,
        x + 1.2,
        SY + 0.72,
        z + 1.2,
        { s: 1, c: [0.5, 0.42, 0.32] },
      );
      M.ocol(x, z, 2.6, 2.6, 0, SY + 0.7, 0, { tag: "planter" });
      if (r() < 0.8) M.placeTree(x, z, r.int(0, 4), r() * 6, 0.7);
    }
    // benches, a newsstand kiosk, rubble, lamps
    for (let i = 0; i < 3; i++)
      M.parkBench(
        r.range(o.x0 + 4, o.x1 - 4),
        r.range(o.z0 + 3, o.z1 - 3),
        r() < 0.5 ? 0 : Math.PI,
        r() < 0.4,
      );
    if (d > 18) {
      const kx = cx + r.range(-8, 8),
        kz = cz + 4;
      const kb = M.buf("metal_painted", kx, kz);
      M.box(kb, kx - 1.6, SY, kz - 1.1, kx + 1.6, SY + 2.5, kz + 1.1, {
        s: 1.5,
        c: [0.35, 0.45, 0.4],
      });
      M.box(kb, kx - 1.9, SY + 2.5, kz - 1.4, kx + 1.9, SY + 2.7, kz + 1.4, {
        s: 1.5,
        c: [0.3, 0.38, 0.34],
      });
      M.quad(
        M.buf("glass_dirty", kx, kz),
        [kx - 1.4, SY + 1.1, kz + 1.11],
        [kx + 1.4, SY + 1.1, kz + 1.11],
        [kx + 1.4, SY + 2.2, kz + 1.11],
        [kx - 1.4, SY + 2.2, kz + 1.11],
        [0, 0, 1],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.3, 0.3, 0.3],
      );
      M.box3(kx - 1.6, 0, kz - 1.1, kx + 1.6, SY + 2.7, kz + 1.1, {
        tag: "kiosk",
      });
    }
    M.rubblePile(
      r.range(o.x0 + 5, o.x1 - 5),
      r.range(o.z0 + 3, o.z1 - 3),
      r.range(1.5, 3),
      r.range(0.6, 1.2),
      r,
    );
    for (const [x, z] of [
      [o.x0 + 2, o.z0 + 2],
      [o.x1 - 2, o.z1 - 2],
    ])
      M.parkLamp(x, z, r() < 0.3);
    for (let i = 0; i < 12; i++)
      M.decal(
        M.buf("my/markings", cx, cz, "fine"),
        r.range(o.x0 + 2, o.x1 - 2),
        SY + 0.015,
        r.range(o.z0 + 2, o.z1 - 2),
        r.range(1.5, 4),
        r.range(1.5, 4),
        r() * 6,
        r.pick([M.MARK.CRACKS, M.MARK.LITTER, M.MARK.STAIN, M.MARK.DIRT]),
      );
  }

  /**
   * Columbus Circle: the rostral column & statue on the raised centre island of the LAYOUT roundabout
   * (8th Ave × 59th St; Broadway leaves on its own SSE arm). The island kerb/slab is a raised ground piece (05_grid).
   */
  function columbusCircle() {
    const L = G.LAYOUT;
    const C = (L.CIRCLES || []).find((c) => c.id === "columbus_circle") || {
      x: -121.5,
      z: -408.5,
      rIsland: 7,
      rOuter: 16,
    };
    const x = C.x,
      z = C.z,
      y0 = SY;
    const b = M.buf("granite", x, z);
    // stepped granite plinth ring + dead lawn on the island
    M.cyl(b, x, y0, z, C.rIsland - 1.2, C.rIsland - 1.2, 0.25, 32, {
      capTop: true,
      c: [0.72, 0.7, 0.66],
    });
    M.cyl(
      M.buf("grass_dead", x, z),
      x,
      y0 + 0.25,
      z,
      C.rIsland - 1.5,
      C.rIsland - 1.5,
      0.04,
      32,
      { capTop: true, c: [0.62, 0.58, 0.44] },
    );
    M.cyl(b, x, y0 + 0.25, z, 3.4, 3.4, 0.35, 24, {
      capTop: true,
      c: [0.74, 0.72, 0.67],
    });
    M.box(b, x - 2.6, y0 + 0.6, z - 2.6, x + 2.6, y0 + 1.5, z + 2.6, {
      s: 2,
      c: [0.75, 0.73, 0.68],
    });
    M.box(b, x - 1.9, y0 + 1.5, z - 1.9, x + 1.9, y0 + 5.4, z + 1.9, {
      s: 2,
      c: [0.78, 0.76, 0.7],
    });
    M.box(b, x - 2.1, y0 + 5.4, z - 2.1, x + 2.1, y0 + 5.9, z + 2.1, {
      s: 2,
      c: [0.8, 0.78, 0.72],
    });
    M.cyl(b, x, y0 + 5.9, z, 0.95, 0.8, 17, 14, { c: [0.8, 0.78, 0.72], s: 2 });
    // rostral ship prows on the column (verdigris bronze)
    const bb = M.buf("metal_painted", x, z);
    for (const h of [9, 12.5])
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + h;
        M.obox(
          bb,
          x + Math.cos(a) * 1.1,
          y0 + 5.9 + h,
          z + Math.sin(a) * 1.1,
          0.5,
          0.35,
          1.3,
          -a + Math.PI / 2,
          { c: [0.45, 0.6, 0.52] },
        );
      }
    // the fountain-side prow & angel group at the base (south face, towards Broadway)
    M.obox(bb, x + 0.8, y0 + 1.9, z + 2.9, 1.6, 1.1, 1.2, 0.4, {
      c: [0.4, 0.55, 0.48],
    });
    M.box(b, x - 1.2, y0 + 22.9, z - 1.2, x + 1.2, y0 + 23.6, z + 1.2, {
      s: 1,
      c: [0.8, 0.78, 0.72],
    });
    // the statue (simplified cloaked figure)
    const sb = M.buf("stone_limestone", x, z);
    M.cyl(sb, x, y0 + 23.6, z, 0.55, 0.4, 2.1, 10, { c: [0.85, 0.83, 0.78] });
    M.cyl(sb, x, y0 + 25.7, z, 0.22, 0.2, 0.45, 8, {
      c: [0.85, 0.83, 0.78],
      capTop: true,
    });
    M.beam(sb, x + 0.3, y0 + 25.0, z, x + 0.7, y0 + 25.9, z - 0.2, 0.14, 0.14, {
      c: [0.85, 0.83, 0.78],
    });
    // four cast-iron lamp standards on the island, benches facing out, a burnt-out car nosed into the kerb
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2;
      M.parkLamp(
        x + Math.cos(a) * (C.rIsland - 2.2),
        z + Math.sin(a) * (C.rIsland - 2.2),
        k === 2,
      );
    }
    for (let k = 0; k < 3; k++) {
      const a = 0.4 + k * 2.1;
      M.parkBench(
        x + Math.cos(a) * 4.8,
        z + Math.sin(a) * 4.8,
        -a - Math.PI / 2,
        k === 1,
      );
    }
    M.ocol(x, z, 5.2, 5.2, 0, y0 + 24, 0, {
      tag: "monument",
      surface: "concrete",
    });
    M.ocol(x, z, 7.6, 7.6, 0, y0 + 1.5, 0, {
      tag: "monument",
      surface: "concrete",
    });
    M.columbusCircle = { x, z, rIsland: C.rIsland, rOuter: C.rOuter };
  }

  /** Worth Square: the triangle in the V north of the Broadway × 5th Ave crossing, with the Worth Monument obelisk. */
  function worthSquare(o) {
    const r = M.rng("worth");
    const P = o.poly;
    // incentre of the island (the obelisk stands on it)
    const side = (i) => {
      const a = P[(i + 1) % 3],
        b = P[(i + 2) % 3];
      return Math.hypot(b[0] - a[0], b[1] - a[1]);
    };
    const la = side(0),
      lb = side(1),
      lc = side(2),
      per = la + lb + lc;
    const cx = (la * P[0][0] + lb * P[1][0] + lc * P[2][0]) / per,
      cz = (la * P[0][1] + lb * P[1][1] + lc * P[2][1]) / per;
    // granite setts over the island's sidewalk (kerbs are the raised piece's own)
    M.poly(
      M.buf("granite", cx, cz),
      M.insetPoly(M.polyArea(P) > 0 ? P : P.slice().reverse(), 0.45),
      SY + 0.02,
      { s: 1.2, c: [0.62, 0.6, 0.56], convex: true },
    );
    // the obelisk on a stepped base, ringed by a low iron fence
    const bs = M.buf("granite", cx, cz);
    M.box(bs, cx - 2.3, SY, cz - 2.3, cx + 2.3, SY + 0.35, cz + 2.3, {
      s: 2,
      c: [0.7, 0.68, 0.64],
    });
    M.box(bs, cx - 1.9, SY + 0.35, cz - 1.9, cx + 1.9, SY + 0.95, cz + 1.9, {
      s: 2,
      c: [0.72, 0.7, 0.66],
    });
    M.box(bs, cx - 1.3, SY + 0.95, cz - 1.3, cx + 1.3, SY + 2.75, cz + 1.3, {
      s: 2,
      c: [0.75, 0.73, 0.68],
    });
    M.cyl(bs, cx, SY + 2.75, cz, 0.9, 0.5, 11, 4, {
      c: [0.78, 0.76, 0.7],
      a0: Math.PI / 4,
      a1: Math.PI / 4 + Math.PI * 2,
    });
    M.cyl(bs, cx, SY + 13.75, cz, 0.5, 0.0, 1.2, 4, {
      c: [0.78, 0.76, 0.7],
      a0: Math.PI / 4,
      a1: Math.PI / 4 + Math.PI * 2,
    });
    const pb = M.buf("metal_painted", cx, cz, "detail");
    for (const [dx, dz, w, d] of [
      [0, -1.32, 1.4, 0.05],
      [0, 1.32, 1.4, 0.05],
      [-1.32, 0, 0.05, 1.4],
      [1.32, 0, 0.05, 1.4],
    ])
      M.box(
        pb,
        cx + dx - w / 2,
        SY + 1.4,
        cz + dz - d / 2,
        cx + dx + w / 2,
        SY + 2.3,
        cz + dz + d / 2,
        { s: 1, c: [0.36, 0.5, 0.44] },
      );
    M.box3(cx - 2.3, 0, cz - 2.3, cx + 2.3, SY + 15, cz + 2.3, {
      tag: "monument",
      surface: "concrete",
    });
    polyFence(
      [
        [cx - 3.5, cz - 3.5],
        [cx + 3.5, cz - 3.5],
        [cx + 3.5, cz + 3.5],
        [cx - 3.5, cz + 3.5],
      ],
      SY,
      "worth",
      false,
      1.6,
    );
    // lamp standards at the two northern tips, a bench, litter
    const tip = (i, k) => [
      P[i][0] + (cx - P[i][0]) * k,
      P[i][1] + (cz - P[i][1]) * k,
    ];
    for (const i of [0, 1]) {
      const q = tip(i, 0.35);
      M.parkLamp(q[0], q[1], r() < 0.3);
    }
    {
      const q = tip(2, 0.45);
      M.parkBench(q[0], q[1], Math.PI * 0.8, true);
    }
    for (let i = 0; i < 6; i++) {
      const k = r.range(0.2, 0.8),
        j = r.int(0, 2),
        q = tip(j, k);
      M.decal(
        M.buf("my/markings", cx, cz, "fine"),
        q[0],
        SY + 0.035,
        q[1],
        r.range(1.2, 2.5),
        r.range(1.2, 2.5),
        r() * 6,
        r.pick([M.MARK.LEAVES, M.MARK.DIRT, M.MARK.LITTER, M.MARK.CRACKS]),
      );
    }
  }

  /** Low iron fence along a closed polygon (gap of `gap` m in the middle of the longest edge unless closed). */
  function polyFence(pts, y, seed, closed, gap) {
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length,
      cz = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const b = M.buf("metal_painted", cx, cz, "detail");
    const c = [0.22, 0.25, 0.22];
    let longest = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        d = pts[(i + 1) % pts.length];
      if (
        Math.hypot(d[0] - a[0], d[1] - a[1]) >
        Math.hypot(
          pts[(longest + 1) % pts.length][0] - pts[longest][0],
          pts[(longest + 1) % pts.length][1] - pts[longest][1],
        )
      )
        longest = i;
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        d = pts[(i + 1) % pts.length];
      const len = Math.hypot(d[0] - a[0], d[1] - a[1]);
      if (len < 0.8) continue;
      const ux = (d[0] - a[0]) / len,
        uz = (d[1] - a[1]) / len,
        nx = uz,
        nz = -ux;
      const g = gap || 2.4;
      const segs =
        !closed && i === longest && len > g + 2
          ? [
              [0, len / 2 - g / 2],
              [len / 2 + g / 2, len],
            ]
          : [[0, len]];
      for (const [t0, t1] of segs) {
        M.beam(
          b,
          a[0] + ux * t0,
          y + 0.85,
          a[1] + uz * t0,
          a[0] + ux * t1,
          y + 0.85,
          a[1] + uz * t1,
          0.04,
          0.04,
          { c },
        );
        for (let t = t0; t <= t1; t += 0.3)
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
          a[0] + (ux * (t0 + t1)) / 2,
          a[1] + (uz * (t0 + t1)) / 2,
          t1 - t0,
          0.12,
          y,
          y + 0.95,
          Math.atan2(-uz, ux),
          { tag: "fence", surface: "metal" },
        );
      }
    }
    void seed;
  }

  /**
   * Union Square (map-owned LAYOUT site, east of Broadway between 17th and 15th St).
   * Ruined set piece: diagonal path grid radiating to the Independence Flagpole, six fenced dead lawns,
   * the Lincoln statue, the 1932 pavilion (colonnade, canopy half collapsed) with a raider lookout on its roof,
   * the Greenmarket on the north plaza (collapsed stalls, torn awnings, crates), a raider barricade camp
   * in the east lawn (scrap walls, car hulks, tents, burn barrels, a cage), the south plaza with seat-steps and
   * the equestrian George Washington, subway kiosks.
   */
  function unionSquare() {
    const L = G.LAYOUT,
      S = L.getSite && L.getSite("union_square");
    if (!S) return;
    const r = M.rng("union_square");
    const o = { x0: S.x0, x1: S.x1, z0: S.z0, z1: S.z1 };
    const cx = (o.x0 + o.x1) / 2,
      y = 0;
    // park area (between the north market plaza and the south plaza); centre = the flagpole
    const P = { x0: o.x0 + 4, x1: o.x1 - 4, z0: o.z0 + 16, z1: o.z1 - 22 };
    const pcz = (P.z0 + P.z1) / 2,
      pcx = cx;
    // paving over the whole square with a granite kerb band
    const pv = M.buf("sidewalk", cx, pcz);
    M.quad(
      pv,
      [o.x0, y + 0.04, o.z1],
      [o.x1, y + 0.04, o.z1],
      [o.x1, y + 0.04, o.z0],
      [o.x0, y + 0.04, o.z0],
      [0, 1, 0],
      [
        o.x0 / 3,
        o.z1 / 3,
        o.x1 / 3,
        o.z1 / 3,
        o.x1 / 3,
        o.z0 / 3,
        o.x0 / 3,
        o.z0 / 3,
      ],
      [0.8, 0.78, 0.72],
    );
    const gr = M.buf("granite", cx, pcz);
    // ---- lawns: the park rect cut by both diagonals and the N-S axis path, apexes cut by the central oval
    const H = 2.2; // path half width
    const rect = [
      [P.x0, P.z0],
      [P.x1, P.z0],
      [P.x1, P.z1],
      [P.x0, P.z1],
    ];
    const cen = (p) => [
      p.reduce((a, q) => a + q[0], 0) / p.length,
      p.reduce((a, q) => a + q[1], 0) / p.length,
    ];
    /** keep the part of polygon p where a*x + b*z + c >= 0 */
    const clipF = (p, a, b, c) => {
      const out = [];
      for (let i = 0; i < p.length; i++) {
        const P1 = p[i],
          P2 = p[(i + 1) % p.length],
          f1 = a * P1[0] + b * P1[1] + c,
          f2 = a * P2[0] + b * P2[1] + c;
        if (f1 >= 0) out.push(P1);
        if (f1 >= 0 !== f2 >= 0) {
          const t = f1 / (f1 - f2);
          out.push([P1[0] + (P2[0] - P1[0]) * t, P1[1] + (P2[1] - P1[1]) * t]);
        }
      }
      return out;
    };
    // diagonal lines through the centre (NW→SE and SW→NE), unit normals
    const dg = [
      [P.x1 - P.x0, P.z1 - P.z0],
      [P.x1 - P.x0, P.z0 - P.z1],
    ].map((d) => {
      const l = Math.hypot(d[0], d[1]);
      return [-d[1] / l, d[0] / l];
    });
    const fD = (k, x, z) => dg[k][0] * (x - pcx) + dg[k][1] * (z - pcz);
    const wedgeAt = (mx, mz) => {
      let p = rect;
      for (let k = 0; k < 2 && p.length >= 3; k++) {
        const sg = Math.sign(fD(k, mx, mz)) || 1;
        p = clipF(
          p,
          sg * dg[k][0],
          sg * dg[k][1],
          -sg * (dg[k][0] * pcx + dg[k][1] * pcz) - H,
        );
      }
      return p;
    };
    const lawns = [];
    const APEX = 9.5;
    const addLawn = (p) => {
      if (p.length >= 3 && Math.abs(M.polyArea(p)) > 20)
        lawns.push(M.polyArea(p) > 0 ? p : p.slice().reverse());
    };
    // north & south wedges, each split by the N-S axis path; the west wedge whole; the east wedge = the raider camp
    const wn = clipF(wedgeAt(pcx, P.z0), 0, -1, pcz - APEX),
      ws = clipF(wedgeAt(pcx, P.z1), 0, 1, -(pcz + APEX));
    for (const w of [wn, ws])
      if (w.length >= 3) {
        addLawn(clipF(w, -1, 0, pcx - H));
        addLawn(clipF(w, 1, 0, -(pcx + H)));
      }
    addLawn(clipF(wedgeAt(P.x0, pcz), -1, 0, pcx - APEX));
    const campLawn = (() => {
      const p = clipF(wedgeAt(P.x1, pcz), 1, 0, -(pcx + APEX));
      return p.length >= 3 ? p : null;
    })();
    const lb = M.buf("grass_dead", cx, pcz);
    for (const q of lawns) {
      const qq = M.polyArea(q) > 0 ? q : q.slice().reverse();
      M.polySides(gr, qq, y, y + 0.2, { s: 2, c: [0.62, 0.6, 0.56] });
      M.poly(lb, qq, y + 0.2, { s: 4, c: [0.7, 0.64, 0.46], convex: true });
      polyFence(M.insetPoly(qq, 0.5), y + 0.2, "us", false, 3);
      // dead London planes & shrubs inside
      const bb = M.polyBBox(qq);
      for (let i = 0, n = 0; i < 20 && n < 3; i++) {
        const tx = r.range(bb.x0 + 2, bb.x1 - 2),
          tz = r.range(bb.z0 + 2, bb.z1 - 2);
        if (!M.inPoly(tx, tz, M.insetPoly(qq, 2))) continue;
        M.placeTree(
          tx,
          tz,
          n === 2 ? r.pick(M.TREE_KINDS.shrubs) : r.pick(M.TREE_KINDS.standing),
          r() * 6,
          r.range(1.0, 1.4),
        );
        n++;
      }
      for (let i = 0; i < 4; i++) {
        const tx = r.range(bb.x0, bb.x1),
          tz = r.range(bb.z0, bb.z1);
        if (M.inPoly(tx, tz, qq))
          M.decal(
            M.buf("my/markings", tx, tz, "fine"),
            tx,
            y + 0.215,
            tz,
            r.range(2, 4),
            r.range(2, 4),
            r() * 6,
            r.pick([M.MARK.LEAVES, M.MARK.DIRT]),
          );
      }
    }
    // ---- central oval: granite ring & the Independence Flagpole (tattered flag), benches around it
    M.cyl(gr, pcx, y, pcz, 7.2, 7.2, 0.06, 36, {
      capTop: true,
      c: [0.66, 0.64, 0.6],
    });
    M.cyl(gr, pcx, y, pcz, 2.6, 2.9, 1.1, 16, {
      capTop: true,
      c: [0.72, 0.7, 0.66],
    });
    M.cyl(
      M.buf("metal_painted", pcx, pcz, "detail"),
      pcx,
      y + 1.1,
      pcz,
      0.16,
      0.09,
      16,
      8,
      { c: [0.3, 0.3, 0.28] },
    );
    {
      const fb = M.buf("fabric", pcx, pcz, "detail"),
        fc = [0.55, 0.22, 0.2];
      M.quad(
        fb,
        [pcx, y + 14.6, pcz],
        [pcx + 3.2, y + 14.3, pcz + 0.4],
        [pcx + 2.4, y + 12.6, pcz + 0.6],
        [pcx, y + 12.8, pcz],
        [0, 0, 1],
        [0, 0, 1, 0, 1, 1, 0, 1],
        fc,
        fc,
      );
      M.quad(
        fb,
        [pcx + 3.2, y + 14.3, pcz + 0.4],
        [pcx, y + 14.6, pcz],
        [pcx, y + 12.8, pcz],
        [pcx + 2.4, y + 12.6, pcz + 0.6],
        [0, 0, -1],
        [0, 0, 1, 0, 1, 1, 0, 1],
        fc,
        fc,
      );
    }
    M.ocol(pcx, pcz, 5.6, 5.6, 0, y + 1.1, 0, {
      tag: "monument",
      surface: "concrete",
    });
    M.box3(pcx - 0.2, 0, pcz - 0.2, pcx + 0.2, 17, pcz + 0.2, {
      tag: "monument",
      surface: "metal",
    });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.26;
      M.parkBench(
        pcx + Math.cos(a) * 5.4,
        pcz + Math.sin(a) * 5.4,
        -a + Math.PI / 2,
        r() < 0.3,
      );
    }
    // ---- Lincoln (north lawn edge, on the axis path, facing south)
    {
      const lx = pcx - 4.5,
        lz = P.z0 + 3.5;
      const gb = M.buf("granite", lx, lz),
        bz = M.buf("metal_painted", lx, lz);
      M.box(gb, lx - 1.2, y, lz - 1.2, lx + 1.2, y + 2.3, lz + 1.2, {
        s: 2,
        c: [0.7, 0.68, 0.64],
      });
      M.cyl(bz, lx, y + 2.3, lz, 0.42, 0.34, 1.6, 10, {
        c: [0.32, 0.44, 0.38],
      });
      M.cyl(bz, lx, y + 3.9, lz, 0.2, 0.18, 0.4, 8, {
        c: [0.32, 0.44, 0.38],
        capTop: true,
      });
      M.ocol(lx, lz, 2.4, 2.4, 0, y + 4.3, 0, { tag: "monument" });
    }
    // ---- the pavilion (north end of the park): granite podium, cast-iron colonnade, canopy half collapsed,
    //      a raider lookout (plank deck, sandbags, a rusted searchlight) on the surviving half
    {
      const px = pcx,
        pz = P.z0 - 1,
        w = 16,
        d = 7;
      const pb = M.buf("stone_limestone", px, pz),
        ib = M.buf("metal_painted", px, pz),
        cc = [0.24, 0.3, 0.27];
      M.box(pb, px - w / 2, y, pz - d / 2, px + w / 2, y + 0.6, pz + d / 2, {
        s: 2,
        c: [0.74, 0.72, 0.67],
      });
      for (let k = 0; k < 3; k++)
        M.box(
          pb,
          px - 2.5,
          y + k * 0.2,
          pz + d / 2 + 0.9 - k * 0.3,
          px + 2.5,
          y + 0.2 + k * 0.2,
          pz + d / 2 + 1.2 - k * 0.3,
          { s: 2, c: [0.72, 0.7, 0.66] },
        );
      M.ocol(px, pz, w, d, 0, y + 0.6, 0, {
        tag: "pavilion",
        surface: "concrete",
        walkable: true,
      });
      const cols = [];
      for (let k = 0; k < 6; k++)
        for (const sd of [-1, 1])
          cols.push([
            px - w / 2 + 0.8 + (k * (w - 1.6)) / 5,
            pz + sd * (d / 2 - 0.6),
          ]);
      for (const [x, z] of cols) {
        const fallen = x > px + 3 && z > pz; // the SE columns buckled
        if (fallen) {
          M.beam(ib, x, y + 0.6, z, x + 1.6, y + 0.9, z + 2.8, 0.22, 0.22, {
            c: cc,
          });
          continue;
        }
        M.cyl(ib, x, y + 0.6, z, 0.18, 0.14, 4.2, 8, { c: cc });
        M.cyl(ib, x, y + 4.6, z, 0.14, 0.3, 0.35, 8, { c: cc });
        M.box3(x - 0.2, y, z - 0.2, x + 0.2, y + 4.9, z + 0.2, {
          tag: "pavilion",
          surface: "metal",
        });
      }
      // canopy: west half flat, east half tilted down onto the buckled columns
      M.box(
        ib,
        px - w / 2 - 0.6,
        y + 4.95,
        pz - d / 2 - 0.6,
        px + 1,
        y + 5.3,
        pz + d / 2 + 0.6,
        { s: 2, c: [0.28, 0.33, 0.3] },
      );
      M.obox(
        ib,
        px + w / 4 + 0.6,
        y + 3.5,
        pz + 0.4,
        w / 2 + 0.8,
        0.3,
        d + 1.2,
        0,
        { roll: 0.32, s: 2, c: [0.26, 0.3, 0.28] },
      );
      M.box3(
        px - w / 2 - 0.6,
        y + 4.95,
        pz - d / 2 - 0.6,
        px + 1,
        y + 5.3,
        pz + d / 2 + 0.6,
        { tag: "pavilion", surface: "metal", walkable: true },
      );
      // lookout on the roof: plank deck, sandbag ring, searchlight, a ladder of planks up the west end
      const wb = M.buf("wood_planks", px, pz, "detail"),
        sb = M.buf("fabric", px, pz, "detail");
      M.box(wb, px - 6.5, y + 5.3, pz - 2.6, px - 1, y + 5.42, pz + 2.6, {
        s: 1,
        c: [0.6, 0.5, 0.4],
      });
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 1.6 + 0.5,
          sx = px - 3.6 + Math.cos(a) * 2.3,
          sz = pz + Math.sin(a) * 2.1;
        M.pipe(
          sb,
          sx - Math.sin(a) * 0.4,
          y + 5.6,
          sz + Math.cos(a) * 0.4,
          sx + Math.sin(a) * 0.4,
          y + 5.6,
          sz - Math.cos(a) * 0.4,
          0.22,
          6,
          { c: [0.52, 0.48, 0.36] },
        );
      }
      const lb2 = M.buf("rust", px, pz, "detail");
      M.cyl(lb2, px - 3.6, y + 5.42, pz, 0.12, 0.12, 1.0, 6, {
        c: [0.4, 0.34, 0.3],
      });
      M.obox(lb2, px - 3.6, y + 6.6, pz - 0.2, 0.9, 0.8, 0.9, 0.3, {
        pitch: 0.3,
        c: [0.42, 0.36, 0.3],
      });
      for (let k = 0; k < 7; k++)
        M.box(
          wb,
          px - w / 2 - 1.3,
          y + 0.5 + k * 0.7,
          pz - 0.6,
          px - w / 2 - 0.9,
          y + 0.6 + k * 0.7,
          pz + 0.6,
          { s: 1, c: [0.55, 0.45, 0.36] },
        );
      for (const dz of [-0.6, 0.6])
        M.beam(
          wb,
          px - w / 2 - 1.1,
          y,
          pz + dz,
          px - w / 2 - 1.1,
          y + 5.4,
          pz + dz,
          0.1,
          0.1,
          { c: [0.5, 0.42, 0.34] },
        );
      // boarded infill on the north side (the raiders' store room)
      for (let k = 0; k < 3; k++)
        M.box(
          wb,
          px - w / 2 + 0.9 + k * 2.6,
          y + 0.6,
          pz - d / 2 + 0.45,
          px - w / 2 + 3.3 + k * 2.6,
          y + 3.6,
          pz - d / 2 + 0.6,
          { s: 1, c: [0.5, 0.42, 0.34] },
        );
      M.box3(
        px - w / 2 + 0.9,
        y,
        pz - d / 2 + 0.4,
        px - w / 2 + 8.6,
        y + 3.6,
        pz - d / 2 + 0.65,
        { tag: "wall", surface: "wood" },
      );
    }
    // ---- Greenmarket (north plaza): two rows of collapsed stalls, torn striped awnings, crates, a toppled table
    {
      const fb = M.buf("fabric", cx, o.z0 + 6),
        wb = M.buf("wood_planks", cx, o.z0 + 6, "detail"),
        mb = M.buf("metal_painted", cx, o.z0 + 6, "detail");
      const awn = [
        [0.62, 0.24, 0.2],
        [0.3, 0.42, 0.3],
        [0.7, 0.62, 0.42],
        [0.32, 0.36, 0.5],
      ];
      let n = 0;
      for (const zr of [o.z0 + 4.5, o.z0 + 11])
        for (let x = o.x0 + 6; x < o.x1 - 5; x += 8.5) {
          if (Math.abs(x - cx) < 4) continue; // keep the axis walk open
          const k = n++,
            collapsed = k % 3 === 1,
            c = awn[k % awn.length],
            face = zr < o.z0 + 8 ? 1 : -1;
          const w = 4.2,
            d = 2.6,
            h = 2.3;
          // frame posts
          for (const [dx, dz] of [
            [-w / 2, -d / 2],
            [w / 2, -d / 2],
            [-w / 2, d / 2],
            [w / 2, d / 2],
          ]) {
            if (collapsed && dx > 0) continue;
            M.cyl(
              mb,
              x + dx,
              y,
              zr + dz,
              0.05,
              0.05,
              h + (dz * face > 0 ? 0 : 0.4),
              5,
              { c: [0.3, 0.3, 0.28] },
            );
          }
          // awning (sagging / slumped when collapsed) — both faces
          const y0 = y + h + 0.4,
            y1 = y + h,
            zA = zr - (d / 2) * face,
            zB = zr + (d / 2) * face;
          const xs = collapsed
            ? [x - w / 2, x + w / 2 - 0.3]
            : [x - w / 2, x + w / 2];
          const yR = collapsed ? y + 0.5 : y1;
          M.quad(
            fb,
            [xs[0], y0, zA],
            [xs[1], collapsed ? y + 0.9 : y0, zA],
            [xs[1], yR, zB + face * 0.3],
            [xs[0], y1, zB + face * 0.3],
            [0, 1, 0],
            [0, 0, 1, 0, 1, 1, 0, 1],
            c,
            M.mulc(c, 0.8),
          );
          M.quad(
            fb,
            [xs[1], collapsed ? y + 0.9 : y0, zA],
            [xs[0], y0, zA],
            [xs[0], y1, zB + face * 0.3],
            [xs[1], yR, zB + face * 0.3],
            [0, -1, 0],
            [0, 0, 1, 0, 1, 1, 0, 1],
            M.mulc(c, 0.6),
            M.mulc(c, 0.5),
          );
          // counter + crates
          if (!collapsed)
            M.box(
              wb,
              x - w / 2 + 0.2,
              y + 0.8,
              zr + face * (d / 2 - 0.5),
              x + w / 2 - 0.2,
              y + 0.9,
              zr + face * (d / 2 - 0.1),
              { s: 1, c: [0.55, 0.45, 0.35] },
            );
          else
            M.obox(wb, x + 0.5, y + 0.45, zr, 3.2, 0.08, 0.9, 0.2, {
              roll: 1.2,
              s: 1,
              c: [0.5, 0.42, 0.33],
            });
          for (let i = 0; i < 3; i++) {
            if (r() < 0.35) continue;
            const bx = x + r.range(-w / 2, w / 2),
              bz = zr - face * r.range(0.3, 1.2),
              sz = r.range(0.45, 0.65);
            M.obox(
              wb,
              bx,
              y + sz / 2 + (i === 2 ? sz : 0),
              bz,
              sz * 1.3,
              sz,
              sz,
              r() * 0.6,
              { s: 1, c: [0.58, 0.47, 0.33] },
            );
          }
          M.ocol(x, zr, w + 0.2, d + 0.2, 0, y + 1.0, 0, {
            tag: "stall",
            surface: "wood",
          });
        }
      for (let i = 0; i < 14; i++)
        M.decal(
          M.buf("my/markings", cx, o.z0 + 8, "fine"),
          r.range(o.x0 + 3, o.x1 - 3),
          y + 0.05,
          r.range(o.z0 + 2, o.z0 + 14),
          r.range(1.5, 3.5),
          r.range(1.5, 3.5),
          r() * 6,
          r.pick([M.MARK.LITTER, M.MARK.STAIN, M.MARK.DIRT, M.MARK.LEAVES]),
        );
    }
    // ---- raider camp in the east wedge: dirt ground, scrap-sheet walls & two car hulks as a barricade ring,
    //      lean-to tents, mattresses, burn barrels, a caged skeleton, a spike with a warning sign
    if (campLawn) {
      const q0 =
        M.polyArea(campLawn) > 0 ? campLawn : campLawn.slice().reverse();
      const q = M.insetPoly(q0, 0.2);
      const c = cen(q),
        bb = M.polyBBox(q);
      M.poly(M.buf("dirt", c[0], c[1]), q, y + 0.06, {
        s: 3,
        c: [0.52, 0.45, 0.35],
        convex: true,
      });
      const cor = M.buf("corrugated", c[0], c[1]),
        wb = M.buf("wood_planks", c[0], c[1], "detail"),
        rb = M.buf("rust", c[0], c[1], "detail");
      // scrap walls along the wedge edges (gap at the apex = the camp gate)
      for (let i = 0; i < q.length; i++) {
        const a = q[i],
          d = q[(i + 1) % q.length],
          len = Math.hypot(d[0] - a[0], d[1] - a[1]);
        if (len < 3) continue;
        const ux = (d[0] - a[0]) / len,
          uz = (d[1] - a[1]) / len;
        const isOuter = Math.abs(ux) < 0.2; // the east side (on the avenue) is the solid back wall
        for (let t = 0.3; t < len - 1.2; t += 2.1) {
          // gates: the middle of every edge — the diagonal ones into the square, the outer one onto 4th Ave (Park Ave S)
          // so the camp reads as a settlement with entrances, not a blank wall along the avenue
          const mid = t + 1.05;
          if (Math.abs(mid - len / 2) < 2.2) continue;
          const x0 = a[0] + ux * t,
            z0 = a[1] + uz * t,
            x1 = a[0] + ux * (t + 2.1),
            z1 = a[1] + uz * (t + 2.1);
          const hh = r.range(1.9, 2.6),
            lean = r.range(-0.12, 0.12);
          const nx = uz * lean,
            nz = -ux * lean;
          M.quad(
            cor,
            [x0, y, z0],
            [x1, y, z1],
            [x1 + nx, y + hh, z1 + nz],
            [x0 + nx, y + hh * r.range(0.85, 1), z0 + nz],
            [uz, 0, -ux],
            [0, 0, 1, 0, 1, 1.4, 0, 1.4],
            [0.55, 0.42, 0.34],
            [0.62, 0.5, 0.4],
          );
          M.quad(
            cor,
            [x1, y, z1],
            [x0, y, z0],
            [x0 + nx, y + hh * 0.95, z0 + nz],
            [x1 + nx, y + hh, z1 + nz],
            [-uz, 0, ux],
            [0, 0, 1, 0, 1, 1.4, 0, 1.4],
            [0.45, 0.35, 0.3],
            [0.52, 0.42, 0.36],
          );
          M.beam(wb, x0, y, z0, x0 + nx, y + hh + 0.2, z0 + nz, 0.1, 0.1, {
            c: [0.45, 0.38, 0.3],
          });
          M.ocol(
            (x0 + x1) / 2,
            (z0 + z1) / 2,
            2.1,
            0.2,
            0,
            y + hh,
            Math.atan2(-uz, ux),
            { tag: "wall", surface: "metal" },
          );
        }
      }
      // the avenue gate: two timber posts, a lintel with a hand-painted sign plank, one scrap leaf swung open
      for (let i = 0; i < q.length; i++) {
        const a = q[i],
          d = q[(i + 1) % q.length],
          len = Math.hypot(d[0] - a[0], d[1] - a[1]);
        const ux = (d[0] - a[0]) / len,
          uz = (d[1] - a[1]) / len;
        if (len < 6 || Math.abs(ux) >= 0.2) continue;
        const gx = a[0] + (ux * len) / 2,
          gz = a[1] + (uz * len) / 2;
        for (const sgn of [-1, 1]) {
          const px = gx + ux * sgn * 2.1,
            pz = gz + uz * sgn * 2.1;
          M.beam(wb, px, y, pz, px, y + 3.2, pz, 0.18, 0.18, {
            c: [0.4, 0.33, 0.26],
          });
          M.ocol(px, pz, 0.3, 0.3, 0, y + 3.2, 0, {
            tag: "post",
            surface: "wood",
          });
        }
        M.beam(
          wb,
          gx - ux * 2.4,
          y + 3.1,
          gz - uz * 2.4,
          gx + ux * 2.4,
          y + 3.1,
          gz + uz * 2.4,
          0.16,
          0.22,
          { c: [0.4, 0.33, 0.26] },
        );
        M.obox(
          wb,
          gx + uz * 0.12,
          y + 2.6,
          gz - ux * 0.12,
          3.2,
          0.55,
          0.06,
          Math.atan2(-uz, ux),
          { s: 1, c: [0.62, 0.52, 0.4] },
        );
        // open leaf: hinged on the north post, swung out towards the avenue
        const hx = gx - ux * 2.0,
          hz = gz - uz * 2.0,
          oa = 1.1,
          lx = hx + (ux * Math.cos(oa) + uz * Math.sin(oa)) * 1.9,
          lz = hz + (uz * Math.cos(oa) - ux * Math.sin(oa)) * 1.9;
        M.quad(
          cor,
          [hx, y + 0.1, hz],
          [lx, y + 0.1, lz],
          [lx, y + 2.2, lz],
          [hx, y + 2.2, hz],
          [1, 0, 0],
          [0, 0, 1, 0, 1, 1.4, 0, 1.4],
          [0.55, 0.42, 0.34],
          [0.62, 0.5, 0.4],
        );
        M.quad(
          cor,
          [lx, y + 0.1, lz],
          [hx, y + 0.1, hz],
          [hx, y + 2.2, hz],
          [lx, y + 2.2, lz],
          [-1, 0, 0],
          [0, 0, 1, 0, 1, 1.4, 0, 1.4],
          [0.45, 0.35, 0.3],
          [0.52, 0.42, 0.36],
        );
        M.ocol(
          (hx + lx) / 2,
          (hz + lz) / 2,
          1.9,
          0.15,
          0,
          y + 2.2,
          Math.atan2(-(lz - hz), lx - hx),
          { tag: "wall", surface: "metal" },
        );
      }
      if (M.carHulk) {
        M.carHulk(bb.x1 - 2.2, 0, c[1] - 7, 0.1 + Math.PI / 2, r, {
          burnt: true,
        });
        /* clear of the avenue gate */ M.carHulk(
          c[0] + 1.5,
          0,
          bb.z1 - 3.2,
          2.9,
          r,
          { burnt: true, roll: Math.PI / 2 },
        );
      }
      // tents: tarp lean-tos against the back wall
      const fb = M.buf("fabric", c[0], c[1], "detail");
      for (const [tx, tz, tc] of [
        [bb.x1 - 3.2, c[1] + 6.5, [0.42, 0.44, 0.32]],
        [c[0] + 3, bb.z0 + 4.5, [0.5, 0.36, 0.26]],
      ]) {
        M.quad(
          fb,
          [tx - 1.6, y + 2.0, tz - 1.4],
          [tx - 1.6, y + 2.0, tz + 1.4],
          [tx + 1.2, y + 0.05, tz + 1.5],
          [tx + 1.2, y + 0.05, tz - 1.5],
          [-0.6, 0.8, 0],
          [0, 0, 1, 0, 1, 1, 0, 1],
          tc,
          M.mulc(tc, 0.75),
        );
        M.quad(
          fb,
          [tx - 1.6, y + 2.0, tz + 1.4],
          [tx - 1.6, y + 2.0, tz - 1.4],
          [tx + 1.2, y + 0.05, tz - 1.5],
          [tx + 1.2, y + 0.05, tz + 1.5],
          [0.6, -0.8, 0],
          [0, 0, 1, 0, 1, 1, 0, 1],
          M.mulc(tc, 0.5),
          M.mulc(tc, 0.4),
        );
        M.beam(
          wb,
          tx - 1.6,
          y,
          tz - 1.4,
          tx - 1.6,
          y + 2.05,
          tz - 1.4,
          0.08,
          0.08,
          { c: [0.45, 0.38, 0.3] },
        );
        M.beam(
          wb,
          tx - 1.6,
          y,
          tz + 1.4,
          tx - 1.6,
          y + 2.05,
          tz + 1.4,
          0.08,
          0.08,
          { c: [0.45, 0.38, 0.3] },
        );
        M.box(fb, tx - 1.3, y + 0.06, tz - 0.9, tx + 0.6, y + 0.24, tz + 0.9, {
          s: 1,
          c: [0.55, 0.5, 0.42],
        }); // mattress
        M.ocol(tx - 0.2, tz, 2.8, 3.0, 0, y + 1.2, 0, {
          tag: "tent",
          surface: "fabric",
        });
      }
      // burn barrels (charred rims, soot inside) + a crude table of planks on crates
      for (const [bx, bz] of [
        [c[0] - 1, c[1]],
        [c[0] + 2.5, c[1] - 4],
      ]) {
        M.cyl(rb, bx, y, bz, 0.34, 0.32, 0.95, 10, { c: [0.42, 0.3, 0.24] });
        M.cyl(
          M.buf("rubble", bx, bz, "detail"),
          bx,
          y + 0.9,
          bz,
          0.3,
          0.3,
          0.02,
          10,
          { capTop: true, c: [0.12, 0.1, 0.09] },
        );
        M.ocol(bx, bz, 0.7, 0.7, 0, y + 0.95, 0, {
          tag: "barrel",
          surface: "metal",
        });
      }
      M.box(
        wb,
        c[0] + 1.2,
        y + 0.75,
        c[1] + 2,
        c[0] + 3.2,
        y + 0.82,
        c[1] + 3,
        { s: 1, c: [0.55, 0.45, 0.35] },
      );
      for (const dx of [1.4, 3.0])
        M.box(
          wb,
          c[0] + dx - 0.25,
          y,
          c[1] + 2.25,
          c[0] + dx + 0.25,
          y + 0.75,
          c[1] + 2.75,
          { s: 1, c: [0.58, 0.47, 0.33] },
        );
      M.ocol(c[0] + 2.2, c[1] + 2.5, 2.0, 1.0, 0, y + 0.82, 0, {
        tag: "table",
        surface: "wood",
      });
      // hanging cage on a gallows beam with bones inside
      {
        const gx = bb.x1 - 2,
          gz = bb.z0 + 3;
        M.beam(wb, gx, y, gz, gx, y + 4.2, gz, 0.18, 0.18, {
          c: [0.42, 0.35, 0.28],
        });
        M.beam(wb, gx, y + 4.1, gz, gx - 2.2, y + 4.1, gz, 0.14, 0.14, {
          c: [0.42, 0.35, 0.28],
        });
        M.beam(rb, gx - 2.1, y + 4.1, gz, gx - 2.1, y + 3.2, gz, 0.02, 0.02, {
          c: [0.3, 0.26, 0.22],
        });
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          M.beam(
            rb,
            gx - 2.1 + Math.cos(a) * 0.45,
            y + 1.3,
            gz + Math.sin(a) * 0.45,
            gx - 2.1 + Math.cos(a) * 0.4,
            y + 3.2,
            gz + Math.sin(a) * 0.4,
            0.03,
            0.03,
            { c: [0.35, 0.28, 0.24] },
          );
        }
        M.cyl(rb, gx - 2.1, y + 1.28, gz, 0.46, 0.46, 0.05, 10, {
          capTop: true,
          c: [0.35, 0.28, 0.24],
        });
        const bn = M.buf("stone_limestone", gx, gz, "detail");
        M.cyl(bn, gx - 2.1, y + 1.33, gz, 0.18, 0.16, 0.5, 6, {
          c: [0.85, 0.82, 0.72],
        });
        M.cyl(bn, gx - 2.05, y + 1.9, gz + 0.05, 0.12, 0.12, 0.22, 6, {
          c: [0.88, 0.85, 0.76],
          capTop: true,
        });
        M.box3(gx - 0.2, 0, gz - 0.2, gx + 0.2, y + 4.2, gz + 0.2, {
          tag: "post",
          surface: "wood",
        });
      }
      M.rubblePile(c[0] - 3, c[1] + 4, 1.4, 0.6, r, { noCollide: true });
    }
    // ---- south plaza: granite seat-steps across the park's south edge (gap on the axis), Washington on horseback
    {
      const sz = P.z1 + 1.5,
        gb = M.buf("granite", cx, sz);
      for (const [xa, xb] of [
        [o.x0 + 3, cx - 5],
        [cx + 5, o.x1 - 3],
      ]) {
        for (let k = 0; k < 3; k++) {
          const z0 = sz - 1.4 + k * 0.9;
          M.box(gb, xa, y, z0 - 0.9, xb, y + 0.45 * (3 - k), z0, {
            s: 2,
            c: M.mulc([0.74, 0.72, 0.67], 0.92 + k * 0.03),
          });
        }
        M.ocol((xa + xb) / 2, sz - 1.5, xb - xa, 1.8, 0, y + 1.35, 0, {
          tag: "steps",
          surface: "concrete",
          walkable: true,
        });
        M.ocol((xa + xb) / 2, sz - 0.45, xb - xa, 0.9, 0, y + 0.9, 0, {
          tag: "steps",
          surface: "concrete",
          walkable: true,
        });
        M.ocol((xa + xb) / 2, sz + 0.45, xb - xa, 0.9, 0, y + 0.45, 0, {
          tag: "steps",
          surface: "concrete",
          walkable: true,
        });
      }
      const ex = cx,
        ez = o.z1 - 9;
      const eb = M.buf("granite", ex, ez);
      M.box(eb, ex - 3.2, y, ez - 2.2, ex + 3.2, y + 0.5, ez + 2.2, {
        s: 2,
        c: [0.7, 0.68, 0.64],
      });
      M.box(eb, ex - 2.6, y + 0.5, ez - 1.6, ex + 2.6, y + 3.6, ez + 1.6, {
        s: 2,
        c: [0.74, 0.72, 0.67],
      });
      M.box(eb, ex - 2.8, y + 3.6, ez - 1.8, ex + 2.8, y + 3.9, ez + 1.8, {
        s: 2,
        c: [0.78, 0.76, 0.7],
      });
      const hb = M.buf("metal_painted", ex, ez),
        hc = { c: [0.3, 0.42, 0.36] };
      M.obox(hb, ex, y + 5.5, ez, 1.1, 1.3, 3.0, 0, hc); // horse barrel
      M.beam(hb, ex, y + 6.0, ez + 1.4, ex, y + 7.2, ez + 2.1, 0.55, 0.7, hc); // neck
      M.obox(hb, ex, y + 7.3, ez + 2.5, 0.45, 0.55, 1.1, 0, hc); // head
      for (const [dx, dz, lift] of [
        [-0.4, -1.1, 0],
        [0.4, -1.1, 0],
        [-0.4, 1.1, 0],
        [0.4, 1.1, 0.7],
      ])
        M.beam(
          hb,
          ex + dx,
          y + 4.9,
          ez + dz,
          ex + dx,
          y + 3.9 + lift,
          ez + dz + lift * 0.6,
          0.22,
          0.22,
          hc,
        ); // legs (one raised)
      M.obox(hb, ex, y + 6.9, ez - 0.1, 0.6, 1.3, 0.55, 0, hc); // rider
      M.cyl(hb, ex, y + 7.55, ez - 0.1, 0.18, 0.16, 0.35, 8, {
        c: hc.c,
        capTop: true,
      });
      M.beam(
        hb,
        ex + 0.3,
        y + 7.2,
        ez,
        ex + 0.9,
        y + 8.1,
        ez + 0.6,
        0.12,
        0.12,
        hc,
      ); // outstretched arm
      M.ocol(ex, ez, 6.4, 4.4, 0, y + 8.2, 0, { tag: "monument" });
      // raider paint on the pedestal + a sandbag nest at its foot
      const sb = M.buf("fabric", ex, ez, "detail");
      for (let k = 0; k < 7; k++) {
        const a = Math.PI * 0.2 + (k / 6) * Math.PI * 0.6,
          px2 = ex + Math.cos(a) * 4.2,
          pz2 = ez + Math.sin(a) * 3.4;
        M.pipe(
          sb,
          px2 - Math.sin(a) * 0.45,
          y + 0.22 + (k % 2) * 0.02,
          pz2 + Math.cos(a) * 0.45,
          px2 + Math.sin(a) * 0.45,
          y + 0.22,
          pz2 - Math.cos(a) * 0.45,
          0.22,
          6,
          { c: [0.52, 0.48, 0.36] },
        );
      }
      M.ocol(ex, ez + 3.6, 6.0, 1.0, 0, y + 0.5, 0, {
        tag: "sandbags",
        surface: "fabric",
      });
    }
    // subway kiosks at both south corners, benches along the axis walk, lamps, rubble, leaves
    for (const kx of [o.x0 + 5, o.x1 - 5]) {
      const kz = o.z1 - 5,
        kb = M.buf("metal_painted", kx, kz);
      M.box(kb, kx - 1.6, y, kz - 2.4, kx + 1.6, y + 1.1, kz + 2.4, {
        s: 1.5,
        c: [0.24, 0.32, 0.26],
      });
      for (const dz of [-2.4, 2.4]) {
        M.cyl(kb, kx, y + 1.1, kz + dz, 0.05, 0.05, 1.4, 6, {
          c: [0.2, 0.26, 0.22],
        });
        M.cyl(
          M.buf("glass_dirty", kx, kz),
          kx,
          y + 2.6,
          kz + dz,
          0.22,
          0.22,
          0.3,
          10,
          { c: [0.35, 0.55, 0.35], capTop: true },
        );
      }
      M.box3(kx - 1.6, 0, kz - 2.4, kx + 1.6, y + 1.1, kz + 2.4, {
        tag: "kiosk",
      });
    }
    for (const bz of [P.z0 + 6, P.z1 - 6])
      for (const sd of [-1, 1])
        M.parkBench(
          cx + sd * 3.4,
          bz,
          sd > 0 ? -Math.PI / 2 : Math.PI / 2,
          r() < 0.3,
        );
    for (const [x, z] of [
      [o.x0 + 2, o.z0 + 2],
      [o.x1 - 2, o.z0 + 2],
      [o.x0 + 2, o.z1 - 2],
      [o.x1 - 2, o.z1 - 2],
      [P.x0 + 1, P.z0 + 1],
      [P.x1 - 1, P.z1 - 1],
      [P.x0 + 1, P.z1 - 1],
    ])
      M.parkLamp(x, z, r() < 0.3);
    M.rubblePile(
      r.range(o.x0 + 6, cx - 8),
      r.range(P.z1 + 4, o.z1 - 14),
      2.2,
      0.9,
      r,
    );
    for (let i = 0; i < 26; i++)
      M.decal(
        M.buf("my/markings", cx, pcz, "fine"),
        r.range(o.x0 + 2, o.x1 - 2),
        y + 0.055,
        r.range(o.z0 + 2, o.z1 - 2),
        r.range(2, 5),
        r.range(2, 5),
        r() * 6,
        r.pick([M.MARK.LEAVES, M.MARK.DIRT, M.MARK.LITTER, M.MARK.CRACKS]),
      );
    M.unionSquare = {
      x: cx,
      z: pcz,
      statue: { x: cx, z: o.z1 - 9 },
      pavilion: { x: pcx, z: P.z0 - 1 },
      flagpole: { x: pcx, z: pcz },
      camp: campLawn ? cen(campLawn) : null,
      lawns: lawns.length,
    };
  }

  /**
   * A landmark's street forecourt (kind 'forecourt'): plain sidewalk apron between a building's front steps and the
   * avenue, granite-paved in front of the steps. The approach (o.clear, a z-span across the full width) gets only flat
   * paving + litter decals; the two ends get a street tree in a granite pit, a bench, newspaper litter and a little rubble.
   */
  function forecourt(o) {
    const r = M.rng(o.id);
    const cx = (o.x0 + o.x1) / 2,
      cz = (o.z0 + o.z1) / 2;
    const C = o.clear || { z0: cz, z1: cz };
    const y = SY + 0.012;
    // granite paving across the approach, flush with the sidewalk
    M.quad(
      M.buf("granite", cx, cz),
      [o.x0, y, C.z1],
      [o.x1, y, C.z1],
      [o.x1, y, C.z0],
      [o.x0, y, C.z0],
      [0, 1, 0],
      [
        o.x0 / 3,
        C.z1 / 3,
        o.x1 / 3,
        C.z1 / 3,
        o.x1 / 3,
        C.z0 / 3,
        o.x0 / 3,
        C.z0 / 3,
      ],
      [0.78, 0.76, 0.71],
    );
    // the ends (north: o.z0..C.z0, south: C.z1..o.z1)
    const ends = [
      [o.z0, C.z0],
      [C.z1, o.z1],
    ].filter(([a, b]) => b - a > 2.5);
    for (const [a, b] of ends) {
      const ez = (a + b) / 2;
      // street tree in a granite pit near the kerb
      const tx = o.x1 - 2.6;
      const pb = M.buf("granite", tx, ez);
      for (const [x0, z0, x1, z1] of [
        [tx - 1.1, ez - 1.1, tx + 1.1, ez - 0.9],
        [tx - 1.1, ez + 0.9, tx + 1.1, ez + 1.1],
        [tx - 1.1, ez - 0.9, tx - 0.9, ez + 0.9],
        [tx + 0.9, ez - 0.9, tx + 1.1, ez + 0.9],
      ]) {
        M.box(pb, x0, SY, z0, x1, SY + 0.14, z1, {
          s: 2,
          c: [0.7, 0.68, 0.64],
        });
      }
      M.box(
        M.buf("dirt", tx, ez),
        tx - 0.9,
        SY - 0.02,
        ez - 0.9,
        tx + 0.9,
        SY + 0.04,
        ez + 0.9,
        { s: 1, c: [0.45, 0.39, 0.3] },
      );
      M.placeTree(tx, ez, r.pick(M.TREE_KINDS.standing), r() * 6, 0.62);
      // bench against the forecourt's back edge (facing the avenue), a broken one at one end
      const deep = b - a > 5;
      M.parkBench(o.x0 + 3.2, deep ? b - 1.6 : ez, -Math.PI / 2, r() < 0.5); // own collider
      // a deeper end also gets a little rubble at the pavilion's foot (spalled stone from the cornice)
      if (deep)
        M.rubblePile(
          o.x0 + 1.7,
          a + 1.7,
          r.range(0.9, 1.2),
          r.range(0.35, 0.55),
          r,
        );
    }
    // litter, cracks and leaves everywhere (flat decals only on the approach)
    const db = M.buf("my/markings", cx, cz, "fine");
    for (let i = 0; i < 16; i++)
      M.decal(
        db,
        r.range(o.x0 + 1, o.x1 - 1),
        SY + 0.02,
        r.range(o.z0 + 1, o.z1 - 1),
        r.range(1.4, 3.2),
        r.range(1.4, 3.2),
        r() * 6,
        r.pick([
          M.MARK.CRACKS,
          M.MARK.LITTER,
          M.MARK.LEAVES,
          M.MARK.DIRT,
          M.MARK.STAIN,
        ]),
      );
  }

  M.buildOpenSpaces = function () {
    for (const o of M.OPEN_SPACES) {
      if (o.kind === "park") madisonSquare(o);
      else if (o.kind === "island") worthSquare(o);
      else if (o.kind === "forecourt") forecourt(o);
      else plaza(o);
    }
    columbusCircle();
    unionSquare();
  };
})();
