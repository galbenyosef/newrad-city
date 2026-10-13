// play-inline-79 02 — road
// Lines 285-611 of readable/play-inline-79.pretty.js (statement-aligned).
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
