/* src/map/05_grid.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 05 GRID
 * Road network model used by the map (LAYOUT roads + the map's extra
 * Upper West/East Side cross streets), polygon clipping utilities, the
 * ground decomposition (roads / raised sidewalks+blocks / plazas / park)
 * and the 1 m ground raster that backs G.world.terrainHeight.
 * ===================================================================== */
(function () {
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
  M.buildGroundModel = function () {
    const L = G.LAYOUT,
      R = M.roads;
    const P = L.PARK;
    // road-only rects
    const roadRects = [];
    for (const a of R.avenues)
      roadRects.push({
        x0: a.x - a.road / 2,
        x1: a.x + a.road / 2,
        z0: a.z0,
        z1: a.z1,
      });
    for (const s of R.streets)
      roadRects.push({
        x0: s.x0,
        x1: s.x1,
        z0: s.z - s.road / 2,
        z1: s.z + s.road / 2,
      });
    const sites = L.SITES.filter(
      (s) =>
        L.isManhattan((s.x0 + s.x1) / 2, (s.z0 + s.z1) / 2) ||
        L.isManhattan(s.x0, s.z0) ||
        L.isManhattan(s.x1, s.z1),
    )
      // old footprints of moved sites stay flat landmark ground until the owner refits (LAYOUT.PENDING_REFIT)
      .concat(
        (L.PENDING_REFIT || []).map((p) => Object.assign({ pending: true }, p)),
      );
    const xsSet = new Set([-350, 350, P.x0, P.x1]),
      zsSet = new Set([-1000, 1015, P.z0, P.z1]);
    for (const r of roadRects) {
      xsSet.add(r.x0);
      xsSet.add(r.x1);
      zsSet.add(r.z0);
      zsSet.add(r.z1);
    }
    for (const s of sites) {
      xsSet.add(s.x0);
      xsSet.add(s.x1);
      zsSet.add(s.z0);
      zsSet.add(s.z1);
    }
    const xs = Array.from(xsSet)
      .filter((x) => x >= -350 && x <= 350)
      .sort((a, b) => a - b);
    const zs = Array.from(zsSet)
      .filter((z) => z >= -1000 && z <= 1015)
      .sort((a, b) => a - b);
    const NX = xs.length - 1,
      NZ = zs.length - 1;
    const cls = new Uint8Array(NX * NZ); // 0 none(water/out), 1 road, 2 raised, 3 park, 6 site
    const siteId = new Int16Array(NX * NZ).fill(-1);
    for (let j = 0; j < NZ; j++) {
      const cz = (zs[j] + zs[j + 1]) / 2;
      for (let i = 0; i < NX; i++) {
        const cx = (xs[i] + xs[i + 1]) / 2;
        let c = 0;
        // Cells touching land at any corner/centre count (shore cells are clipped later).
        const land =
          L.isManhattan(cx, cz) ||
          L.isManhattan(xs[i], zs[j]) ||
          L.isManhattan(xs[i + 1], zs[j]) ||
          L.isManhattan(xs[i], zs[j + 1]) ||
          L.isManhattan(xs[i + 1], zs[j + 1]);
        if (land) {
          let road = false;
          for (const r of roadRects)
            if (cx > r.x0 && cx < r.x1 && cz > r.z0 && cz < r.z1) {
              road = true;
              break;
            }
          if (road) c = 1;
          else {
            let si = -1;
            for (let k = 0; k < sites.length; k++) {
              const s = sites[k];
              if (cx > s.x0 && cx < s.x1 && cz > s.z0 && cz < s.z1) {
                si = k;
                break;
              }
            }
            // sidewalks keep running past landmarks (unless the site closes the street or is a pedestrian plaza)
            if (
              si >= 0 &&
              !sites[si].closesStreets &&
              !sites[si].plaza &&
              M.isCorridor(cx, cz)
            )
              si = -1;
            if (si >= 0 && !L.inPark(cx, cz)) {
              c = 6;
              siteId[j * NX + i] = si;
            } else if (L.inPark(cx, cz)) c = 3;
            else c = 2;
          }
        }
        cls[j * NX + i] = c;
      }
    }
    // Greedy merge cells of a class into rects (row runs, then vertical merge)
    function merge(want) {
      const rects = [];
      let open = new Map(); // key "i0,i1" → rect
      for (let j = 0; j < NZ; j++) {
        const runs = [];
        let i = 0;
        while (i < NX) {
          if (cls[j * NX + i] === want) {
            let k = i;
            while (k + 1 < NX && cls[j * NX + k + 1] === want) k++;
            runs.push([i, k]);
            i = k + 1;
          } else i++;
        }
        const next = new Map();
        for (const r of runs) {
          const key = r[0] + "," + r[1];
          const prev = open.get(key);
          if (prev) {
            prev.z1 = zs[j + 1];
            next.set(key, prev);
            open.delete(key);
          } else {
            const rc = {
              x0: xs[r[0]],
              x1: xs[r[1] + 1],
              z0: zs[j],
              z1: zs[j + 1],
            };
            rects.push(rc);
            next.set(key, rc);
          }
        }
        open = next;
      }
      return rects;
    }
    const raised = merge(2),
      plazas = merge(6),
      roadCells = merge(1);
    const g = (M.ground = {
      xs,
      zs,
      cls,
      raisedRects: raised,
      plazaRects: plazas,
      roadRects: roadCells,
    });
    return g;
  };

  /**
   * Turn raised rects into final polygons: clip to the shoreline inset (the
   * promenade band stays flat) and subtract the Broadway roadway.
   */
  M.buildRaisedPieces = function (inset) {
    const L = G.LAYOUT;
    const pieces = [];
    const hw = L.BROADWAY_ROAD / 2;
    const bw = [];
    const B = L.BROADWAY;
    for (let i = 0; i < B.length - 1; i++) {
      const a = B[i],
        b = B[i + 1];
      const dx = b[0] - a[0],
        dz = b[1] - a[1],
        l = Math.hypot(dx, dz),
        ux = dx / l,
        uz = dz / l,
        nx = -uz,
        nz = ux;
      const e = hw; // extend ends to cover joints
      const q = [
        [a[0] - ux * e - nx * hw, a[1] - uz * e - nz * hw],
        [b[0] + ux * e - nx * hw, b[1] + uz * e - nz * hw],
        [b[0] + ux * e + nx * hw, b[1] + uz * e + nz * hw],
        [a[0] - ux * e + nx * hw, a[1] - uz * e + nz * hw],
      ];
      bw.push({ q, bb: M.polyBBox(q) });
    }
    M.broadwayQuads = bw;
    const insetBB = M.polyBBox(inset);
    for (const r of M.ground.raisedRects) {
      let polys;
      const corners = [
        [r.x0, r.z0],
        [r.x1, r.z0],
        [r.x1, r.z1],
        [r.x0, r.z1],
      ];
      let inside = corners.every((c) => M.inPoly(c[0], c[1], inset));
      if (inside)
        for (const v of inset)
          if (v[0] > r.x0 && v[0] < r.x1 && v[1] > r.z0 && v[1] < r.z1) {
            inside = false;
            break;
          }
      if (inside) polys = [corners];
      else {
        if (r.x1 < insetBB.x0 || r.x0 > insetBB.x1) continue;
        const c = M.clipRect(inset, r.x0, r.z0, r.x1, r.z1);
        if (!c || Math.abs(M.polyArea(c)) < 1) continue;
        polys = [c];
      }
      // subtract Broadway
      for (const s of bw) {
        if (
          s.bb.x1 < r.x0 ||
          s.bb.x0 > r.x1 ||
          s.bb.z1 < r.z0 ||
          s.bb.z0 > r.z1
        )
          continue;
        const next = [];
        for (const p of polys) next.push(...M.subtractConvex(p, s.q));
        polys = next;
      }
      // roundabouts: the ring carriageway cuts a curved kerb into the corner blocks
      for (const c of M.roads.circles || []) {
        if (
          c.x + c.rOuter < r.x0 ||
          c.x - c.rOuter > r.x1 ||
          c.z + c.rOuter < r.z0 ||
          c.z - c.rOuter > r.z1
        )
          continue;
        const q = M.circlePoly(c.x, c.z, c.rOuter, 48);
        const next = [];
        for (const p of polys) next.push(...M.subtractConvex(p, q));
        polys = next;
      }
      for (const p of polys) if (Math.abs(M.polyArea(p)) > 0.5) pieces.push(p);
    }
    // Wedge sites (exact `poly`: the Flatiron, Carnegie Hall): the ground model is rectilinear, so their whole bbox
    // came out as flat landmark ground — Broadway's sidewalk along the diagonal face had no kerb. The part of the
    // bbox OUTSIDE the polygon becomes ordinary raised sidewalk minus every carriageway (grid roads, Broadway,
    // roundabouts). Skipped while an unrefitted old footprint (PENDING_REFIT) still covers the bbox.
    const pend = L.PENDING_REFIT || [];
    for (const s of L.SITES) {
      if (!s.poly || !L.isManhattan((s.x0 + s.x1) / 2, (s.z0 + s.z1) / 2))
        continue;
      if (
        pend.some(
          (p) => p.x1 > s.x0 && p.x0 < s.x1 && p.z1 > s.z0 && p.z0 < s.z1,
        )
      )
        continue;
      const sp = M.polyArea(s.poly) > 0 ? s.poly : s.poly.slice().reverse();
      let polys = M.subtractConvex(
        [
          [s.x0, s.z0],
          [s.x1, s.z0],
          [s.x1, s.z1],
          [s.x0, s.z1],
        ],
        sp,
      );
      const cutters = [];
      for (const a of M.roads.avenues)
        cutters.push([
          [a.x - a.road / 2, a.z0],
          [a.x + a.road / 2, a.z0],
          [a.x + a.road / 2, a.z1],
          [a.x - a.road / 2, a.z1],
        ]);
      for (const st of M.roads.streets)
        cutters.push([
          [st.x0, st.z - st.road / 2],
          [st.x1, st.z - st.road / 2],
          [st.x1, st.z + st.road / 2],
          [st.x0, st.z + st.road / 2],
        ]);
      for (const q of bw) cutters.push(q.q);
      for (const c of M.roads.circles || [])
        cutters.push(M.circlePoly(c.x, c.z, c.rOuter, 48));
      for (const r of M.ground.raisedRects)
        cutters.push([
          [r.x0, r.z0],
          [r.x1, r.z0],
          [r.x1, r.z1],
          [r.x0, r.z1],
        ]); // already raised
      for (const q of cutters) {
        const qb = M.polyBBox(q);
        if (qb.x1 < s.x0 || qb.x0 > s.x1 || qb.z1 < s.z0 || qb.z0 > s.z1)
          continue;
        const next = [];
        for (const p of polys) next.push(...M.subtractConvex(p, q));
        polys = next;
      }
      for (const p of polys)
        if (
          Math.abs(M.polyArea(p)) > 1.5 &&
          p.every((v) => M.inPoly(v[0], v[1], inset))
        )
          pieces.push(p);
    }
    // roundabout centre islands (raised, kerbed; the monument stands on them — 47_openspaces)
    for (const c of M.roads.circles || [])
      pieces.push(M.circlePoly(c.x, c.z, c.rIsland, 36));
    return pieces;
  };

  // -------------------------------------------------------------------
  // Ground raster (1 m) — backs terrainHeight & surfaceAt
  // -------------------------------------------------------------------
  M.RC = {
    WATER: 0,
    ROAD: 1,
    RAISED: 2,
    PARK: 3,
    RAMP: 4,
    GRASS: 5,
    PLAZA: 6,
    DIRT: 7,
  };
  M.initRaster = function () {
    const W = G.LAYOUT.WORLD;
    const X0 = W.minX - 40,
      Z0 = W.minZ - 10,
      RW = Math.ceil(W.maxX - X0 + 40),
      RH = Math.ceil(W.maxZ - Z0 + 10);
    M.raster = { X0, Z0, RW, RH, data: new Uint8Array(RW * RH) };
  };
  /** Fill polygon (array of [x,z]) with code (scanline at cell centres). */
  M.rasterPoly = function (poly, code) {
    const r = M.raster,
      d = r.data;
    const bb = M.polyBBox(poly);
    const j0 = Math.max(0, Math.floor(bb.z0 - r.Z0)),
      j1 = Math.min(r.RH - 1, Math.ceil(bb.z1 - r.Z0));
    const xsI = [];
    for (let j = j0; j <= j1; j++) {
      const z = r.Z0 + j + 0.5;
      xsI.length = 0;
      for (let i = 0, k = poly.length - 1; i < poly.length; k = i++) {
        const a = poly[k],
          b = poly[i];
        if (a[1] > z !== b[1] > z)
          xsI.push(a[0] + ((z - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xsI.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xsI.length; k += 2) {
        const i0 = Math.max(0, Math.ceil(xsI[k] - r.X0 - 0.5)),
          i1 = Math.min(r.RW - 1, Math.floor(xsI[k + 1] - r.X0 - 0.5));
        const row = j * r.RW;
        for (let i = i0; i <= i1; i++) d[row + i] = code;
      }
    }
  };
  M.rasterRect = function (x0, z0, x1, z1, code) {
    M.rasterPoly(
      [
        [x0, z0],
        [x1, z0],
        [x1, z1],
        [x0, z1],
      ],
      code,
    );
  };
  M.rasterAt = function (x, z) {
    const r = M.raster;
    if (!r) return 1;
    const i = Math.floor(x - r.X0),
      j = Math.floor(z - r.Z0);
    if (i < 0 || j < 0 || i >= r.RW || j >= r.RH) return 0;
    return r.data[j * r.RW + i];
  };
})();
