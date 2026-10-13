// play-inline-82 02 — math
// Lines 266-590 of readable/play-inline-82.pretty.js (statement-aligned).
  function buildMarkings() {
    const L = G.LAYOUT;
    const r = M.rng("markings");
    const X = intersections();
    // avenue lane lines, segmented between intersections
    for (const a of M.roads.avenues) {
      const cuts = X.filter((q) => q.a === a)
        .map((q) => q.z)
        .sort((p, q) => p - q);
      let z = a.z0;
      const segs = [];
      for (const cz of cuts) {
        segs.push([z, cz - 8]);
        z = cz + 8;
      }
      segs.push([z, a.z1]);
      for (const [z0, z1] of segs) {
        if (z1 - z0 < 6) continue;
        dashes(a.x - 2, z0 + 1, a.x - 2, z1 - 1, 0.14, 3, 6, MK.WHITE, 0.42, r);
        dashes(a.x + 2, z0 + 1, a.x + 2, z1 - 1, 0.14, 3, 6, MK.WHITE, 0.42, r);
        solid(a.x - 5.6, z0 + 1, a.x - 5.6, z1 - 1, 0.12, MK.WHITE, r, 0.5);
        solid(a.x + 5.6, z0 + 1, a.x + 5.6, z1 - 1, 0.12, MK.WHITE, r, 0.5);
        // right-hand traffic: northbound lanes (east half, reading toward -z) approach the intersection at z0,
        // southbound lanes (west half, rotated π) approach it at z1
        if (z1 - z0 > 20 && r() < 0.35) {
          const zz = z0 + 8;
          M.decal(
            M.buf("my/markings", a.x + 4, zz, "detail"),
            a.x + 4,
            Y_MARK,
            zz,
            2.4,
            2.6,
            0,
            MK.ONLY,
            M.mulc([1, 1, 1], r.range(0.25, 0.45)),
          );
        }
        if (z1 - z0 > 20 && r() < 0.35) {
          const zz = z1 - 8;
          M.decal(
            M.buf("my/markings", a.x - 4, zz, "detail"),
            a.x - 4,
            Y_MARK,
            zz,
            2.4,
            2.6,
            Math.PI,
            MK.ONLY,
            M.mulc([1, 1, 1], r.range(0.25, 0.45)),
          );
        }
        if (z1 - z0 > 24 && r() < 0.45) {
          const zz = z0 + 13;
          M.decal(
            M.buf("my/markings", a.x + 3.8, zz, "detail"),
            a.x + 3.8,
            Y_MARK,
            zz,
            1.4,
            3.2,
            0,
            MK.ARROW,
            M.mulc([1, 1, 1], r.range(0.25, 0.45)),
          );
        }
        if (z1 - z0 > 24 && r() < 0.45) {
          const zz = z1 - 13;
          M.decal(
            M.buf("my/markings", a.x - 3.8, zz, "detail"),
            a.x - 3.8,
            Y_MARK,
            zz,
            1.4,
            3.2,
            Math.PI,
            MK.ARROW,
            M.mulc([1, 1, 1], r.range(0.25, 0.45)),
          );
        }
      }
    }
    // street centre lines
    for (const s of M.roads.streets) {
      const cuts = X.filter((q) => q.s === s)
        .map((q) => q.x)
        .sort((p, q) => p - q);
      let x = s.x0;
      for (const cx of cuts.concat([s.x1 + 6])) {
        const x0 = x + 1,
          x1 = cx - 7;
        if (x1 - x0 > 6)
          dashes(
            x0,
            s.z,
            x1,
            s.z,
            0.13,
            3,
            5,
            s.extra ? MK.WHITE : MK.YELLOW,
            0.45,
            r,
          );
        x = cx + 7;
      }
    }
    // Broadway double yellow
    const B = L.BROADWAY;
    for (let i = 0; i < B.length - 1; i++) {
      const a = B[i],
        b = B[i + 1];
      const dx = b[0] - a[0],
        dz = b[1] - a[1],
        l = Math.hypot(dx, dz),
        px = (-dz / l) * 0.15,
        pz = (dx / l) * 0.15;
      if (L.inPark(a[0], a[1]) && L.inPark(b[0], b[1])) continue;
      // where Broadway rides inside an avenue's carriageway for a block (8th Ave at Columbus Circle, 6th Ave at
      // Herald Sq) the avenue's own lane paint is the paint — no second set of lines on top of it
      if (
        M.roads.avenues.some(
          (av) =>
            Math.abs(a[0] - av.x) < 2.5 &&
            Math.abs(b[0] - av.x) < 2.5 &&
            Math.min(a[1], b[1]) >= av.z0 - 20 &&
            Math.max(a[1], b[1]) <= av.z1 + 20,
        )
      )
        continue;
      solid(a[0] + px, a[1] + pz, b[0] + px, b[1] + pz, 0.1, MK.YELLOW, r, 0.2);
      solid(a[0] - px, a[1] - pz, b[0] - px, b[1] - pz, 0.1, MK.YELLOW, r, 0.2);
    }
    // crosswalks + stop lines at every intersection
    for (const q of X) {
      const a = q.a,
        s = q.s;
      const hwA = a.road / 2,
        hwS = s.road / 2;
      if (L.siteAt(q.x, q.z, 0) && L.siteAt(q.x, q.z, 0).closesStreets)
        continue;
      if (M.circlePart && M.circlePart(q.x, q.z)) continue; // roundabout: see roundaboutMarkings()
      for (const sd of [-1, 1]) {
        // across the avenue (north/south of the intersection): bars run N-S
        const zc = q.z + sd * (hwS + 2.2);
        if (r() < 0.85)
          for (let x = a.x - hwA + 0.6; x < a.x + hwA - 0.4; x += 1.3) {
            if (r() < 0.35) continue;
            M.decal(
              M.buf("my/markings", x, zc, "detail"),
              x,
              Y_MARK,
              zc,
              0.6,
              3.0 * (r() < 0.25 ? r.range(0.4, 0.8) : 1),
              0,
              MK.WHITE,
              M.mulc([1, 1, 1], r.range(0.2, 0.48)),
              r() < 0.5,
            );
          }
        // stop line for oncoming traffic
        if (r() < 0.7)
          M.decal(
            M.buf("my/markings", a.x, zc + sd * 2.3, "detail"),
            a.x,
            Y_MARK,
            zc + sd * 2.3,
            a.road - 0.6,
            0.4,
            0,
            MK.WHITE,
            M.mulc([1, 1, 1], r.range(0.22, 0.42)),
          );
        // across the street (east/west): bars run E-W
        const xc = q.x + sd * (hwA + 2.2);
        if (r() < 0.8)
          for (let z = s.z - hwS + 0.6; z < s.z + hwS - 0.4; z += 1.3) {
            if (r() < 0.35) continue;
            M.decal(
              M.buf("my/markings", xc, z, "detail"),
              xc,
              Y_MARK,
              z,
              3.0 * (r() < 0.25 ? r.range(0.4, 0.8) : 1),
              0.6,
              0,
              MK.WHITE,
              M.mulc([1, 1, 1], r.range(0.2, 0.48)),
              r() < 0.5,
            );
          }
      }
    }
  }

  /**
   * Roundabout paint: faded dashed lane divider around the ring, a solid edge line along the island,
   * yield "shark teeth" + zebra crossings on every approach arm (avenue N/S, street E/W, Broadway).
   */
  function roundaboutMarkings() {
    const L = G.LAYOUT,
      r = M.rng("roundabout");
    for (const c of M.roads.circles || []) {
      const mid = (c.rIsland + c.rOuter) / 2;
      const nSeg = Math.round((Math.PI * 2 * mid) / 4.5);
      for (let i = 0; i < nSeg; i++) {
        if (r() < 0.3) continue;
        const a = ((i + 0.25) / nSeg) * Math.PI * 2,
          x = c.x + Math.cos(a) * mid,
          z = c.z + Math.sin(a) * mid;
        M.decal(
          M.buf("my/markings", x, z, "detail"),
          x,
          Y_MARK,
          z,
          0.14,
          2.2,
          Math.atan2(-Math.sin(a), Math.cos(a)),
          MK.WHITE,
          M.mulc([1, 1, 1], r.range(0.2, 0.45)),
        );
      }
      const nE = Math.round((Math.PI * 2 * (c.rIsland + 0.6)) / 1.6);
      for (let i = 0; i < nE; i++) {
        if (r() < 0.15) continue;
        const a = (i / nE) * Math.PI * 2,
          rr = c.rIsland + 0.55,
          x = c.x + Math.cos(a) * rr,
          z = c.z + Math.sin(a) * rr;
        M.decal(
          M.buf("my/markings", x, z, "detail"),
          x,
          Y_MARK,
          z,
          0.12,
          1.65,
          Math.atan2(-Math.sin(a), Math.cos(a)),
          MK.YELLOW,
          M.mulc([1, 1, 1], r.range(0.25, 0.5)),
        );
      }
      // approach arms: unit direction + carriageway width
      const arms = [];
      for (const a of M.roads.avenues)
        if (
          Math.abs(a.x - c.x) < a.road &&
          c.z > a.z0 - c.rOuter &&
          c.z < a.z1 + c.rOuter
        ) {
          if (a.z0 < c.z - c.rOuter) arms.push([0, -1, a.road]);
          if (a.z1 > c.z + c.rOuter) arms.push([0, 1, a.road]);
        }
      for (const s of M.roads.streets)
        if (
          Math.abs(s.z - c.z) < s.road &&
          c.x > s.x0 - c.rOuter &&
          c.x < s.x1 + c.rOuter
        ) {
          if (s.x0 < c.x - c.rOuter) arms.push([-1, 0, s.road]);
          if (s.x1 > c.x + c.rOuter) arms.push([1, 0, s.road]);
        }
      const B = L.BROADWAY;
      for (let i = 0; i + 1 < B.length; i++) {
        if (Math.hypot(B[i][0] - c.x, B[i][1] - c.z) < 1) {
          const dx = B[i + 1][0] - B[i][0],
            dz = B[i + 1][1] - B[i][1],
            l = Math.hypot(dx, dz);
          // Broadway leaving along an avenue arm (8th Ave south of Columbus Circle) shares that arm's paint
          if (!arms.some((q) => (q[0] * dx) / l + (q[1] * dz) / l > 0.95))
            arms.push([dx / l, dz / l, L.BROADWAY_ROAD]);
        }
      }
      for (const [ux, uz, w] of arms) {
        const px = -uz,
          pz = ux,
          yaw = Math.atan2(ux, uz);
        // yield teeth just outside the ring on the inbound half (right-hand traffic: inbound = the half on the driver's right)
        const tr = c.rOuter + 0.9;
        for (let k = 0; k < w / 2 - 0.6; k += 1.0) {
          const off = -(k + 0.6);
          const x = c.x + ux * tr + px * off,
            z = c.z + uz * tr + pz * off;
          if (r() < 0.25) continue;
          M.decal(
            M.buf("my/markings", x, z, "detail"),
            x,
            Y_MARK,
            z,
            0.6,
            0.9,
            yaw,
            MK.WHITE,
            M.mulc([1, 1, 1], r.range(0.25, 0.5)),
          );
        }
        // zebra crossing a few metres out
        const zr = c.rOuter + 4.2;
        for (let k = -w / 2 + 0.6; k < w / 2 - 0.4; k += 1.3) {
          if (r() < 0.3) continue;
          const x = c.x + ux * zr + px * k,
            z = c.z + uz * zr + pz * k;
          M.decal(
            M.buf("my/markings", x, z, "detail"),
            x,
            Y_MARK,
            z,
            0.6,
            3.0 * (r() < 0.25 ? r.range(0.4, 0.8) : 1),
            yaw,
            MK.WHITE,
            M.mulc([1, 1, 1], r.range(0.2, 0.48)),
            r() < 0.5,
          );
        }
      }
    }
  }
  M.roundaboutMarkings = roundaboutMarkings;

  // -------------------------------------------------------------------
  // Road damage: potholes, cracks, stains, patches, manholes, craters
  // -------------------------------------------------------------------
  M.manholes = [];
  M.craters = [];
