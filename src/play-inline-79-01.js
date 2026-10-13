// play-inline-79 01 — math
// Lines 10-284 of readable/play-inline-79.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const M = G.map._;

  // -------------------------------------------------------------------
  // Polygon utilities (arrays of [x,z])
  // -------------------------------------------------------------------
  /** Clip polygon against half-plane: keep points p where (b-a)×(p-a) * sign >= 0. */
  function clipHalf(poly, ax, az, bx, bz, sign) {
    const out = [];
    const ex = bx - ax,
      ez = bz - az;
    const side = (p) => (ex * (p[1] - az) - ez * (p[0] - ax)) * sign;
    for (let i = 0; i < poly.length; i++) {
      const P = poly[i],
        Q = poly[(i + 1) % poly.length];
      const sp = side(P),
        sq = side(Q);
      if (sp >= 0) out.push(P);
      if (sp >= 0 !== sq >= 0) {
        const t = sp / (sp - sq);
        out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]);
      }
    }
    return out;
  }
  M.clipHalf = clipHalf;
  /** Subject polygon ∩ axis-aligned rect. */
  M.clipRect = function (poly, x0, z0, x1, z1) {
    let p = poly;
    p = clipHalf(p, x0, 0, x0, 1, -1);
    if (p.length < 3) return null; // keep x >= x0
    p = clipHalf(p, x1, 0, x1, 1, 1);
    if (p.length < 3) return null; // keep x <= x1
    p = clipHalf(p, 0, z0, 1, z0, 1);
    if (p.length < 3) return null; // keep z >= z0
    p = clipHalf(p, 0, z1, 1, z1, -1);
    if (p.length < 3) return null; // keep z <= z1
    return M.polyArea(p) === 0 ? null : p;
  };
  /** Verify half-plane sign conventions once (self-test), fix if needed. */
  (function selfTest() {
    const sq = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ];
    const r = M.clipRect(sq, 2, 2, 5, 5);
    if (!r) throw new Error("map clipRect self-test failed");
  })();
  /** Subtract convex polygon Q (any orientation) from polygon P → list of polygons. */
  M.subtractConvex = function (P, Q) {
    const out = [];
    const ccw = M.polyArea(Q) > 0;
    // interior of Q is on the left of each edge for CCW (in x→z shoelace sense)
    let rest = P;
    for (let i = 0; i < Q.length && rest && rest.length >= 3; i++) {
      const a = Q[i],
        b = Q[(i + 1) % Q.length];
      const inSign = ccw ? 1 : -1;
      const outside = clipHalf(rest, a[0], a[1], b[0], b[1], -inSign);
      if (outside.length >= 3 && Math.abs(M.polyArea(outside)) > 0.05)
        out.push(outside);
      rest = clipHalf(rest, a[0], a[1], b[0], b[1], inSign);
    }
    return out;
  };
  /** Polygon inset (for simple, mostly-convex outlines) by d metres. */
  M.insetPoly = function (poly, d) {
    const n = poly.length,
      ccw = M.polyArea(poly) > 0;
    const lines = [];
    for (let i = 0; i < n; i++) {
      const a = poly[i],
        b = poly[(i + 1) % n];
      const dx = b[0] - a[0],
        dz = b[1] - a[1],
        l = Math.hypot(dx, dz);
      // inward normal: for CCW (shoelace>0) outward is (dz,-dx) → inward (-dz,dx)
      let nx = -dz / l,
        nz = dx / l;
      if (!ccw) {
        nx = -nx;
        nz = -nz;
      }
      const di = typeof d === "function" ? d(a, b, i) : d; // per-edge distance allowed
      lines.push([a[0] + nx * di, a[1] + nz * di, dx, dz]);
    }
    const out = [];
    for (let i = 0; i < n; i++) {
      const L1 = lines[(i + n - 1) % n],
        L2 = lines[i];
      // intersect L1 (p1 + t*d1) with L2 (p2 + s*d2)
      const den = L1[2] * L2[3] - L1[3] * L2[2];
      if (Math.abs(den) < 1e-9) {
        out.push([L2[0], L2[1]]);
        continue;
      }
      const t = ((L2[0] - L1[0]) * L2[3] - (L2[1] - L1[1]) * L2[2]) / den;
      out.push([L1[0] + L1[2] * t, L1[1] + L1[3] * t]);
    }
    return out;
  };
  M.circlePoly = function (cx, cz, r, seg) {
    const p = [];
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      p.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
    }
    return p;
  };
  M.polyBBox = function (p) {
    let x0 = 1e9,
      x1 = -1e9,
      z0 = 1e9,
      z1 = -1e9;
    for (const q of p) {
      if (q[0] < x0) x0 = q[0];
      if (q[0] > x1) x1 = q[0];
      if (q[1] < z0) z0 = q[1];
      if (q[1] > z1) z1 = q[1];
    }
    return { x0, x1, z0, z1 };
  };
  /** Distance from point to polygon boundary. */
  M.distToPoly = function (x, z, poly) {
    let d = 1e9;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++)
      d = Math.min(
        d,
        G.LAYOUT.distToSeg(
          x,
          z,
          poly[j][0],
          poly[j][1],
          poly[i][0],
          poly[i][1],
        ),
      );
    return d;
  };

  // -------------------------------------------------------------------
  // Road network: LAYOUT roads + extra cross streets north of 59th St
  // -------------------------------------------------------------------
  M.buildRoadModel = function () {
    const L = G.LAYOUT;
    const avenues = L.avenues.slice();
    const streets = L.streets.filter((s) => !s.park).slice();
    const extra = [];
    // Upper West / East Side cross streets (the layout has none north of z=-410)
    const suffix = (n) =>
      n +
      (n % 10 === 1 && n % 100 !== 11
        ? "st"
        : n % 10 === 2 && n % 100 !== 12
          ? "nd"
          : n % 10 === 3 && n % 100 !== 13
            ? "rd"
            : "th");
    for (let i = 1; i <= 12; i++) {
      const z = L.STREET_Z0 - i * L.STREET_STEP;
      const name = suffix(59 + i * 2) + " Street";
      let start = null;
      for (let x = L.WORLD.minX; x <= L.WORLD.maxX + 1; x += 1) {
        const ok =
          x <= L.WORLD.maxX &&
          L.isManhattan(x, z - 7) &&
          L.isManhattan(x, z + 7) &&
          !L.inPark(x, z) &&
          !L.rectOverlapsSite(x - 0.5, z - 7, x + 0.5, z + 7, 1);
        if (ok && start === null) start = x;
        if (!ok && start !== null) {
          if (x - start > 20)
            extra.push({
              z,
              x0: start,
              x1: x - 1,
              width: L.ST_W,
              road: L.ST_ROAD,
              name,
              extra: true,
            });
          start = null;
        }
      }
    }
    M.roads = {
      avenues,
      streets: streets.concat(extra),
      extraStreets: extra,
      broadway: L.BROADWAY,
      circles: L.CIRCLES || [],
    };
    G.map.extraStreets = extra;
    return M.roads;
  };
  /** Roundabout part at (x,z): 'island' | 'ring' | 'walk' | null (see LAYOUT.circleAt). */
  M.circlePart = function (x, z) {
    const L = G.LAYOUT;
    if (!L.circleAt) return null;
    const c = L.circleAt(x, z);
    return c ? c.part : null;
  };
  /** Road-only test using the map's road model (incl. extra streets & Broadway). */
  M.isRoadOnly = function (x, z) {
    const R = M.roads,
      L = G.LAYOUT;
    const cp = M.circlePart(x, z);
    if (cp === "island") return false;
    if (cp === "ring") return true;
    for (const a of R.avenues)
      if (z >= a.z0 && z <= a.z1 && Math.abs(x - a.x) <= a.road / 2)
        return true;
    for (const s of R.streets)
      if (x >= s.x0 && x <= s.x1 && Math.abs(z - s.z) <= s.road / 2)
        return true;
    return L.onBroadway(x, z, true);
  };
  /** Any road corridor (incl. sidewalks) in the map's road model. */
  M.isCorridor = function (x, z) {
    const R = M.roads,
      L = G.LAYOUT;
    if (M.circlePart(x, z)) return true;
    for (const a of R.avenues)
      if (z >= a.z0 && z <= a.z1 && Math.abs(x - a.x) <= a.width / 2)
        return true;
    for (const s of R.streets)
      if (x >= s.x0 && x <= s.x1 && Math.abs(z - s.z) <= s.width / 2)
        return true;
    return L.onBroadway(x, z, false);
  };
  M.rectHitsCorridor = function (x0, z0, x1, z1) {
    const R = M.roads;
    for (const c of R.circles || []) {
      const qx = Math.max(x0, Math.min(c.x, x1)),
        qz = Math.max(z0, Math.min(c.z, z1));
      if (Math.hypot(qx - c.x, qz - c.z) < c.rOuter + 3.5) return true;
    }
    for (const a of R.avenues)
      if (
        z1 > a.z0 &&
        z0 < a.z1 &&
        x1 > a.x - a.width / 2 &&
        x0 < a.x + a.width / 2
      )
        return true;
    for (const s of R.streets)
      if (
        x1 > s.x0 &&
        x0 < s.x1 &&
        z1 > s.z - s.width / 2 &&
        z0 < s.z + s.width / 2
      )
        return true;
    // Broadway: sample
    const nx = Math.max(2, Math.ceil((x1 - x0) / 3)),
      nz = Math.max(2, Math.ceil((z1 - z0) / 3));
    for (let i = 0; i <= nx; i++)
      for (let j = 0; j <= nz; j++)
        if (
          G.LAYOUT.onBroadway(
            x0 + ((x1 - x0) * i) / nx,
            z0 + ((z1 - z0) * j) / nz,
            false,
          )
        )
          return true;
    return false;
  };

  // -------------------------------------------------------------------
  // Ground decomposition (Manhattan): rectilinear cells → merged rects
  // -------------------------------------------------------------------
