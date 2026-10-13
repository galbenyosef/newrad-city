// play-inline-80 01 — the
// Lines 13-303 of readable/play-inline-80.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;
  const RC = M.RC;

  const SY = M.SIDEWALK_Y;
  const C_SIDEWALK = [0.93, 0.92, 0.88];
  const C_CURB = [1.0, 0.98, 0.94];

  // -------------------------------------------------------------------
  // Boat ramps (terrain slopes into the water so swimmers can get out)
  // -------------------------------------------------------------------
  M.ramps = [];
  function addRamp(x, z, dx, dz, w, len) {
    const l = Math.hypot(dx, dz);
    const r = { x, z, dx: dx / l, dz: dz / l, w: w || 7, len: len || 18 };
    M.ramps.push(r);
    return r;
  }
  function rampHeight(x, z) {
    for (const r of M.ramps) {
      const px = x - r.x,
        pz = z - r.z;
      const a = px * r.dx + pz * r.dz,
        c = -px * r.dz + pz * r.dx;
      if (Math.abs(c) <= r.w / 2 + 0.5 && a >= -3 && a <= r.len)
        return a <= 0 ? 0 : -3.4 * (a / r.len);
    }
    return null;
  }
  /** Shore point on a polygon along a horizontal ray at z (dir -1 = west shore, +1 = east shore). */
  M.shoreX = function (poly, z, dir) {
    let best = null;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[j],
        b = poly[i];
      if (a[1] > z !== b[1] > z) {
        const x = a[0] + ((z - a[1]) / (b[1] - a[1])) * (b[0] - a[0]);
        if (best === null || (dir < 0 ? x < best : x > best)) best = x;
      }
    }
    return best;
  };

  // -------------------------------------------------------------------
  // Terrain height / surface (installed on G.world at init)
  // -------------------------------------------------------------------
  function terrainHeight(x, z) {
    if (x >= G.LAYOUT.INTERIOR_X_MIN) return 0;
    const code = M.rasterAt(x, z);
    switch (code) {
      case RC.WATER: {
        const rh = M.ramps.length ? rampHeight(x, z) : null;
        return rh === null ? -6 : rh;
      }
      case RC.RAISED:
        return SY;
      case RC.PARK:
        return M.parkHeight ? M.parkHeight(x, z) : 0;
      case RC.RAMP: {
        const rh = rampHeight(x, z);
        return rh === null ? 0 : rh;
      }
      case 8:
        return M.parkHeight ? M.parkHeight(x, z) : 0; // park path
      case 9:
        return M.stairHeight ? M.stairHeight(x, z) : 0; // subway stairwell
      default:
        return 0;
    }
  }
  function surfaceAt(x, z) {
    const code = M.rasterAt(x, z);
    switch (code) {
      case RC.WATER:
        return "water";
      case RC.PARK:
        return M.parkSurface ? M.parkSurface(x, z) : "grass";
      case RC.GRASS:
        return "grass";
      case RC.DIRT:
        return "dirt";
      default:
        return "concrete";
    }
  }
  M.terrainHeight = terrainHeight;
  M.installTerrain = function () {
    G.world.terrainHeight = terrainHeight;
    G.world.surfaceAt = surfaceAt;
  };

  // -------------------------------------------------------------------
  // Main ground build
  // -------------------------------------------------------------------
  M.buildGround = function () {
    const L = G.LAYOUT;
    M.buildRoadModel();
    M.buildGroundModel();
    M.initRaster();
    planRamps();
    const man = L.MANHATTAN.map((p) => [p[0], p[1]]);
    const manIn = M.insetPoly(man, 8);
    M.manInset = manIn;
    const bk = L.BROOKLYN.map((p) => [p[0], p[1]]);
    const bkIn = M.insetPoly(bk, 6);
    M.bkInset = bkIn;
    // base plates: inset like the promenade except along the world-edge sides (north of Manhattan, east of Brooklyn)
    const manEdgeD = (a, b) => (a[1] <= -999 && b[1] <= -999 ? 0 : 8);
    const bkEdgeD = (a, b) => (a[0] >= 799 && b[0] >= 799 ? 0 : 6);
    const manBase = M.insetPoly(man, manEdgeD),
      bkBase = M.insetPoly(bk, bkEdgeD);
    const P = L.PARK;

    // ---- raster: land classes ----
    M.rasterPoly(man, RC.PLAZA); // promenade band default
    M.rasterPoly(manIn, RC.ROAD); // streets (base asphalt)
    M.rasterPoly(bk, RC.PLAZA);
    M.rasterPoly(bkIn, RC.ROAD);
    M.rasterPoly(
      M.circlePoly(L.LIBERTY.x, L.LIBERTY.z, L.LIBERTY.r, 48),
      RC.GRASS,
    );
    M.rasterPoly(M.circlePoly(L.ELLIS.x, L.ELLIS.z, L.ELLIS.r, 40), RC.PLAZA);
    for (const r of M.ground.plazaRects) {
      const c = M.clipRect(manIn, r.x0, r.z0, r.x1, r.z1);
      if (c) M.rasterPoly(c, RC.PLAZA);
    }
    M.rasterRect(P.x0, P.z0, P.x1, P.z1, RC.PARK);
    // Brooklyn east strip & Harlem strip: walkable filler right up to the clamp
    M.rasterRect(795, 380, 830, 980, RC.PLAZA);

    // ---- raised pieces ----
    const pieces = M.buildRaisedPieces(manIn);
    // Brooklyn raised blocks
    const bridge = L.getSite("brooklyn_bridge");
    for (const b of L.blocks) {
      if (b.district !== "brooklyn") continue;
      let polys = [
        [
          [b.x0 - 3, b.z0 - 3],
          [b.x1 + 3, b.z0 - 3],
          [b.x1 + 3, b.z1 + 3],
          [b.x0 - 3, b.z1 + 3],
        ],
      ];
      if (bridge) {
        const q = [
          [bridge.x0, bridge.z0 - 2],
          [bridge.x1, bridge.z0 - 2],
          [bridge.x1, bridge.z1 + 2],
          [bridge.x0, bridge.z1 + 2],
        ];
        const n = [];
        for (const p of polys) n.push(...M.subtractConvex(p, q));
        polys = n;
      }
      for (const p of polys) {
        const allIn = p.every((v) => M.inPoly(v[0], v[1], bkIn));
        const c = allIn
          ? p
          : (() => {
              const bb = M.polyBBox(p);
              return M.clipRect(bkIn, bb.x0, bb.z0, bb.x1, bb.z1);
            })();
        if (c && Math.abs(M.polyArea(c)) > 2) pieces.push(c);
      }
    }
    // cut the subway stairwell openings out of the sidewalks
    const holes = M.subwayHoles ? M.subwayHoles() : [];
    if (holes.length) {
      let cut = pieces;
      for (const h of holes) {
        const n = [];
        for (const p of cut) {
          const bb = M.polyBBox(p),
            hb = M.polyBBox(h);
          if (bb.x1 < hb.x0 || bb.x0 > hb.x1 || bb.z1 < hb.z0 || bb.z0 > hb.z1)
            n.push(p);
          else n.push(...M.subtractConvex(p, h));
        }
        cut = n;
      }
      pieces.length = 0;
      pieces.push(...cut);
    }
    M.raisedPieces = pieces;
    for (const p of pieces) M.rasterPoly(p, RC.RAISED);
    for (const h of holes) M.rasterPoly(h, 9);

    // ---- base plates ----
    // Manhattan base with a notch around Central Park (park terrain drawn by the park builder)
    // (no polygon offsets on always-visible ground: offsets grow with distance² and would sink it under the water)
    const baseMan = [];
    for (let i = 0; i < manBase.length; i++) {
      baseMan.push(manBase[i]);
      if (i === 0) {
        baseMan.push([P.x0, -1000], [P.x0, P.z1], [P.x1, P.z1], [P.x1, -1000]);
      }
    }
    M.poly(M.buf("asphalt", 0, 0, "always"), baseMan, 0, {
      s: M.sc("asphalt"),
      c: [0.92, 0.92, 0.9],
      holes: holes.map((h) => h.slice()),
    });
    M.poly(M.buf("asphalt", 640, 700, "always"), bkBase, 0, {
      s: M.sc("asphalt"),
      c: [0.9, 0.9, 0.88],
    });
    // Promenade rings (concrete): trapezoids between the shoreline and the base plate (no overlap)
    promenade(man, manBase, [0.95, 0.94, 0.9]);
    promenade(bk, bkBase, [0.92, 0.9, 0.86]);
    // Plazas (landmark site interiors & closed streets): the landmark modules pave their own sites; only
    // draw plain paving when no landmark module is loaded.
    if (G.isStub("landmarks"))
      for (const r of M.ground.plazaRects) {
        const c = M.clipRect(manIn, r.x0, r.z0, r.x1, r.z1);
        if (!c) continue;
        let ps = [c];
        for (const h of holes) {
          const hb = M.polyBBox(h);
          if (hb.x1 < r.x0 || hb.x0 > r.x1 || hb.z1 < r.z0 || hb.z0 > r.z1)
            continue;
          const n = [];
          for (const p of ps) n.push(...M.subtractConvex(p, h));
          ps = n;
        }
        for (const p of ps)
          M.poly(
            M.buf("sidewalk@plate", (r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2),
            p,
            0,
            { s: 4, c: [0.84, 0.82, 0.78] },
          );
      }
    // Raised islands with curbs
    for (const p of pieces) raisedPiece(p);

    // ---- waterfront ----
    buildRamps();
    buildPiers();
    seaWall(man, { skipNorth: true });
    seaWall(bk, { skipEastX: 799 });
    railings(man, manIn);
    railings(bk, bkIn);
    buildIslands();
    buildIntrepid();
    buildNavyYard();
    buildBoats();
    (M.buildFarSkyline || buildFarSkyline)(); // 12_farskyline.js (richer textured skyline); local fallback below
    buildWorldEdges();
  };

  // Promenade ring: trapezoids between the outer contour and its (per-edge) inset
  function promenade(outer, inner, c) {
    const b = M.buf("concrete", 0, 0, "always");
    const n = outer.length;
    for (let i = 0; i < n; i++) {
      const a = outer[i],
        d = outer[(i + 1) % n],
        ia = inner[i],
        id = inner[(i + 1) % n];
      if (
        Math.hypot(a[0] - ia[0], a[1] - ia[1]) < 0.01 &&
        Math.hypot(d[0] - id[0], d[1] - id[1]) < 0.01
      )
        continue;
      M.quad(
        b,
        [a[0], 0, a[1]],
        [d[0], 0, d[1]],
        [id[0], 0, id[1]],
        [ia[0], 0, ia[1]],
        [0, 1, 0],
        [
          a[0] / 4,
          a[1] / 4,
          d[0] / 4,
          d[1] / 4,
          id[0] / 4,
          id[1] / 4,
          ia[0] / 4,
          ia[1] / 4,
        ],
        c,
      );
    }
  }

  /** A raised sidewalk/block piece: top slab, granite curb strip + curb face on exterior edges. */
