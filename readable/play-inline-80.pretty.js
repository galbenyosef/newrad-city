/* src/map/10_ground.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 10 GROUND & WATERFRONT
 * Land plates (Manhattan, Brooklyn, Liberty & Ellis), raised sidewalk/
 * block islands with granite curbs, plazas, promenade, sea walls with
 * algae bands, esplanade railings, piers & pier sheds, boat ramps (the
 * only way out of the water), sunken boats, the USS Intrepid-style carrier,
 * Brooklyn Navy Yard cranes/freighter, and far-away skyline filler
 * (New Jersey, Harlem, Queens, Brooklyn interior) beyond the playable area.
 * Also installs G.world.terrainHeight / G.world.surfaceAt.
 * ===================================================================== */
(function () {
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
  function raisedPiece(p) {
    const n = p.length;
    const bb = M.polyBBox(p);
    const cx = (bb.x0 + bb.x1) / 2,
      cz = (bb.z0 + bb.z1) / 2;
    // exterior edges: sample the raster just outside the edge
    const ccw = M.polyArea(p) > 0;
    const ext = new Array(n);
    let convex = true;
    for (let i = 0; i < n; i++) {
      const a = p[i],
        c = p[(i + 1) % n],
        d = p[(i + 2) % n];
      const cr = (c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0]);
      if ((cr > 1e-6 && !ccw) || (cr < -1e-6 && ccw)) convex = false;
      const dx = c[0] - a[0],
        dz = c[1] - a[1],
        l = Math.hypot(dx, dz) || 1;
      let nx = dz / l,
        nz = -dx / l;
      if (!ccw) {
        nx = -nx;
        nz = -nz;
      }
      let outside = 0;
      for (const t of [0.2, 0.5, 0.8]) {
        const sx = a[0] + dx * t + nx * 0.7,
          sz = a[1] + dz * t + nz * 0.7;
        if (M.rasterAt(sx, sz) !== RC.RAISED) outside++;
      }
      ext[i] = outside >= 2 && l > 0.4;
    }
    const CW = 0.32; // curb width
    let top = p;
    if (convex) {
      // per-edge inset (0.32 on exterior edges, 0 elsewhere)
      const lines = [];
      for (let i = 0; i < n; i++) {
        const a = p[i],
          c = p[(i + 1) % n];
        const dx = c[0] - a[0],
          dz = c[1] - a[1],
          l = Math.hypot(dx, dz) || 1;
        let nx = -dz / l,
          nz = dx / l;
        if (!ccw) {
          nx = -nx;
          nz = -nz;
        }
        const d = ext[i] ? CW : 0;
        lines.push([a[0] + nx * d, a[1] + nz * d, dx, dz]);
      }
      top = [];
      for (let i = 0; i < n; i++) {
        const L1 = lines[(i + n - 1) % n],
          L2 = lines[i];
        const den = L1[2] * L2[3] - L1[3] * L2[2];
        if (Math.abs(den) < 1e-9) {
          top.push([L2[0], L2[1]]);
          continue;
        }
        const t = ((L2[0] - L1[0]) * L2[3] - (L2[1] - L1[1]) * L2[2]) / den;
        top.push([L1[0] + L1[2] * t, L1[1] + L1[3] * t]);
      }
      const bc = M.buf("granite", cx, cz, "near");
      for (let i = 0; i < n; i++) {
        if (!ext[i]) continue;
        const a = p[i],
          c = p[(i + 1) % n],
          qa = top[i],
          qc = top[(i + 1) % n];
        const run = Math.hypot(c[0] - a[0], c[1] - a[1]);
        M.quad(
          bc,
          [a[0], SY, a[1]],
          [c[0], SY, c[1]],
          [qc[0], SY, qc[1]],
          [qa[0], SY, qa[1]],
          [0, 1, 0],
          [0, 0, run / 1.5, 0, run / 1.5, CW / 1.5, 0, CW / 1.5],
          C_CURB,
        );
      }
    }
    // top slab (per-vertex subtle wear variation)
    const vary = 0.9 + M.hash(cx, cz, 3) * 0.12;
    M.poly(M.buf("sidewalk", cx, cz, "near"), top, SY, {
      s: M.sc("sidewalk"),
      c: M.mulc(C_SIDEWALK, vary),
      convex,
    });
    // curb faces
    const bs = M.buf("granite", cx, cz, "near");
    for (let i = 0; i < n; i++) {
      if (!ext[i]) continue;
      const a = p[i],
        c = p[(i + 1) % n];
      const dx = c[0] - a[0],
        dz = c[1] - a[1],
        l = Math.hypot(dx, dz) || 1;
      let nx = dz / l,
        nz = -dx / l;
      if (!ccw) {
        nx = -nx;
        nz = -nz;
      }
      M.quad(
        bs,
        [a[0], -0.05, a[1]],
        [c[0], -0.05, c[1]],
        [c[0], SY, c[1]],
        [a[0], SY, a[1]],
        [nx, 0, nz],
        [0, 0, l / 1.5, 0, l / 1.5, 0.12, 0, 0.12],
        [0.7, 0.68, 0.64],
        C_CURB,
      );
    }
  }

  // -------------------------------------------------------------------
  // Sea walls
  // -------------------------------------------------------------------
  function edgeHasRamp(ax, az, bx, bz) {
    const out = [];
    for (const r of M.ramps) {
      const d = G.LAYOUT.distToSeg(r.x, r.z, ax, az, bx, bz);
      if (d < 3) out.push(r);
    }
    return out;
  }
  function seaWall(poly, o) {
    o = o || {};
    const ccw = M.polyArea(poly) > 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i],
        c = poly[(i + 1) % poly.length];
      if (o.skipNorth && a[1] <= -999 && c[1] <= -999) continue;
      if (o.skipEastX && a[0] >= o.skipEastX && c[0] >= o.skipEastX) continue;
      const dx = c[0] - a[0],
        dz = c[1] - a[1],
        len = Math.hypot(dx, dz);
      const ux = dx / len,
        uz = dz / len;
      let nx = uz,
        nz = -ux;
      if (!ccw) {
        nx = -nx;
        nz = -nz;
      }
      // gaps for ramps
      const cuts = [];
      for (const r of edgeHasRamp(a[0], a[1], c[0], c[1])) {
        const t = (r.x - a[0]) * ux + (r.z - a[1]) * uz;
        cuts.push([t - r.w / 2, t + r.w / 2]);
      }
      cuts.sort((p, q) => p[0] - q[0]);
      let t0 = 0;
      const spans = [];
      for (const ct of cuts) {
        if (ct[0] > t0) spans.push([t0, ct[0]]);
        t0 = Math.max(t0, ct[1]);
      }
      if (t0 < len) spans.push([t0, len]);
      for (const sp of spans) {
        // split long spans into ≤ 40 m pieces so they land in local chunks
        const nseg = Math.max(1, Math.ceil((sp[1] - sp[0]) / 40));
        for (let k = 0; k < nseg; k++) {
          const s0 = sp[0] + ((sp[1] - sp[0]) * k) / nseg,
            s1 = sp[0] + ((sp[1] - sp[0]) * (k + 1)) / nseg;
          const px = a[0] + ux * s0,
            pz = a[1] + uz * s0,
            qx = a[0] + ux * s1,
            qz = a[1] + uz * s1;
          const mx = (px + qx) / 2,
            mz = (pz + qz) / 2;
          const b = M.buf("granite", mx, mz, "always");
          const l = s1 - s0;
          // upper dry band, algae band, submerged band
          M.quad(
            b,
            [px, -1.0, pz],
            [qx, -1.0, qz],
            [qx, 0.02, qz],
            [px, 0.02, pz],
            [nx, 0, nz],
            [s0 / 3, -1 / 3, s1 / 3, -1 / 3, s1 / 3, 0, s0 / 3, 0],
            [0.62, 0.64, 0.5],
            [0.95, 0.93, 0.88],
          );
          M.quad(
            b,
            [px, -1.7, pz],
            [qx, -1.7, qz],
            [qx, -1.0, qz],
            [px, -1.0, pz],
            [nx, 0, nz],
            [
              s0 / 3,
              -1.7 / 3,
              s1 / 3,
              -1.7 / 3,
              s1 / 3,
              -1 / 3,
              s0 / 3,
              -1 / 3,
            ],
            [0.3, 0.36, 0.22],
            [0.62, 0.64, 0.5],
          );
          M.quad(
            b,
            [px, -8, pz],
            [qx, -8, qz],
            [qx, -1.7, qz],
            [px, -1.7, pz],
            [nx, 0, nz],
            [
              s0 / 3,
              -8 / 3,
              s1 / 3,
              -8 / 3,
              s1 / 3,
              -1.7 / 3,
              s0 / 3,
              -1.7 / 3,
            ],
            [0.15, 0.17, 0.12],
            [0.3, 0.36, 0.22],
          );
          // coping stone ledge along the top
          const bc = M.buf("stone_limestone", mx, mz, "always");
          M.quad(
            bc,
            [px, 0.22, pz],
            [qx, 0.22, qz],
            [qx - nx * 0.55, 0.22, qz - nz * 0.55],
            [px - nx * 0.55, 0.22, pz - nz * 0.55],
            [0, 1, 0],
            [s0 / 2, 0, s1 / 2, 0, s1 / 2, 0.3, s0 / 2, 0.3],
            [0.98, 0.96, 0.9],
          );
          M.quad(
            bc,
            [px + nx * 0.02, 0.0, pz + nz * 0.02],
            [qx + nx * 0.02, 0.0, qz + nz * 0.02],
            [qx, 0.22, qz],
            [px, 0.22, pz],
            [nx, 0, nz],
            [s0 / 2, 0, s1 / 2, 0, s1 / 2, 0.12, s0 / 2, 0.12],
            [0.85, 0.83, 0.78],
          );
          M.quad(
            bc,
            [qx - nx * 0.55, 0.0, qz - nz * 0.55],
            [px - nx * 0.55, 0.0, pz - nz * 0.55],
            [px - nx * 0.55, 0.22, pz - nz * 0.55],
            [qx - nx * 0.55, 0.22, qz - nz * 0.55],
            [-nx, 0, -nz],
            [s0 / 2, 0, s1 / 2, 0, s1 / 2, 0.12, s0 / 2, 0.12],
            [0.8, 0.78, 0.72],
          );
        }
      }
    }
  }

  // -------------------------------------------------------------------
  // Esplanade railings (dark-green cast iron) with colliders & broken gaps
  // -------------------------------------------------------------------
  function railings(poly, inset) {
    const L = G.LAYOUT;
    const ccw = M.polyArea(poly) > 0;
    const col = [0.55, 0.68, 0.58];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i],
        c = poly[(i + 1) % poly.length];
      if (a[1] <= -999 && c[1] <= -999) continue;
      if (a[0] >= 799 && c[0] >= 799) continue;
      const dx = c[0] - a[0],
        dz = c[1] - a[1],
        len = Math.hypot(dx, dz);
      const ux = dx / len,
        uz = dz / len;
      let nx = uz,
        nz = -ux;
      if (!ccw) {
        nx = -nx;
        nz = -nz;
      }
      const SEG = 12;
      const nseg = Math.floor(len / SEG);
      let runStart = null;
      const flushRun = (t0, t1) => {
        if (t1 - t0 < 1) return;
        const mx = a[0] + (ux * (t0 + t1)) / 2 - nx * 0.75,
          mz = a[1] + (uz * (t0 + t1)) / 2 - nz * 0.75;
        M.ocol(mx, mz, t1 - t0, 0.25, 0, 1.15, Math.atan2(-uz, ux), {
          tag: "railing",
          surface: "metal",
        });
      };
      for (let k = 0; k < nseg; k++) {
        const t0 = k * SEG + (len - nseg * SEG) / 2,
          t1 = t0 + SEG;
        const mx = a[0] + (ux * (t0 + t1)) / 2,
          mz = a[1] + (uz * (t0 + t1)) / 2;
        const inSite = L.siteAt(mx, mz, 6);
        const nearRamp = M.ramps.some(
          (r) => Math.hypot(r.x - mx, r.z - mz) < r.w / 2 + SEG / 2 + 1,
        );
        const nearPier = (M.pierRoots || []).some(
          (r) => Math.hypot(r.x - mx, r.z - mz) < r.w / 2 + SEG / 2,
        );
        const h = M.hash(mx, mz, 11);
        const skip = inSite || nearRamp || nearPier;
        const broken = !skip && h < 0.1;
        if (skip || broken) {
          if (runStart !== null) {
            flushRun(runStart, t0);
            runStart = null;
          }
          if (broken) {
            // a bent, fallen section lying on the promenade
            const b = M.buf("metal_painted", mx, mz, "detail");
            const px = mx - nx * 1.6,
              pz = mz - nz * 1.6;
            M.beam(
              b,
              px - ux * 5,
              0.08,
              pz - uz * 5,
              px + ux * 4,
              0.3,
              pz + uz * 4.5,
              0.05,
              0.05,
              { c: M.mulc(col, 0.7) },
            );
            M.beam(
              b,
              px - ux * 5,
              0.05,
              pz - uz * 5 + 0.3,
              px + ux * 5,
              0.05,
              pz + uz * 5 + 0.3,
              0.05,
              0.05,
              { c: M.mulc(col, 0.6) },
            );
          }
          continue;
        }
        if (runStart === null) runStart = t0;
        const b = M.buf("metal_painted", mx, mz, "detail");
        const ox = -nx * 0.75,
          oz = -nz * 0.75;
        const ax = a[0] + ux * t0 + ox,
          az = a[1] + uz * t0 + oz,
          bx2 = a[0] + ux * t1 + ox,
          bz2 = a[1] + uz * t1 + oz;
        M.beam(b, ax, 1.05, az, bx2, 1.05, bz2, 0.07, 0.06, { c: col });
        M.beam(b, ax, 0.55, az, bx2, 0.55, bz2, 0.04, 0.04, { c: col });
        M.beam(b, ax, 0.18, az, bx2, 0.18, bz2, 0.04, 0.04, { c: col });
        for (let p = 0; p < 6; p++) {
          const tt = p / 6;
          const px = ax + (bx2 - ax) * tt,
            pz = az + (bz2 - az) * tt;
          M.box(b, px - 0.05, 0, pz - 0.05, px + 0.05, 1.12, pz + 0.05, {
            c: M.mulc(col, 0.9),
            s: 1,
            skip: 8,
          });
          // balusters (double-faced bars)
          for (let q = 1; q < 3; q++) {
            const t2 = tt + q / 18;
            const qx = ax + (bx2 - ax) * t2,
              qz = az + (bz2 - az) * t2;
            M.vbar(b, qx, qz, 0.18, 1.05, 0.03, nx, nz, col, true);
          }
        }
      }
      if (runStart !== null)
        flushRun(runStart, nseg * SEG + (len - nseg * SEG) / 2);
    }
  }

  // -------------------------------------------------------------------
  // Ramps (visual concrete boat ramps + raster)
  // -------------------------------------------------------------------
  function planRamps() {
    const L = G.LAYOUT;
    const man = L.MANHATTAN;
    for (const z of [-470, 25, 480]) {
      const x = M.shoreX(man, z, -1);
      if (x !== null) addRamp(x, z, -1, 0);
    }
    for (const z of [-620, 40, 470]) {
      const x = M.shoreX(man, z, 1);
      if (x !== null) addRamp(x, z, 1, 0);
    }
    for (const z of [540, 860]) {
      const x = M.shoreX(L.BROOKLYN, z, -1);
      if (x !== null) addRamp(x, z, -1, 0);
    }
    // Liberty (north side, facing Manhattan) & Ellis (east side)
    addRamp(L.LIBERTY.x + 18, L.LIBERTY.z - L.LIBERTY.r + 1, 0.15, -1, 6, 16);
    addRamp(L.ELLIS.x + L.ELLIS.r - 1, L.ELLIS.z + 8, 1, 0.1, 6, 16);
  }
  M.planRamps = planRamps;
  function buildRamps() {
    for (const r of M.ramps) {
      const b = M.buf("concrete", r.x, r.z);
      const px = -r.dz,
        pz = r.dx; // across
      const hw = r.w / 2;
      const segs = 6;
      for (let s = 0; s < segs; s++) {
        const a0 = -3 + ((r.len + 3) * s) / segs,
          a1 = -3 + ((r.len + 3) * (s + 1)) / segs;
        const h0 = a0 <= 0 ? 0.01 : (-3.4 * a0) / r.len + 0.01,
          h1 = a1 <= 0 ? 0.01 : (-3.4 * a1) / r.len + 0.01;
        const P = (a, c, h) => [
          r.x + r.dx * a + px * c,
          h,
          r.z + r.dz * a + pz * c,
        ];
        const ny = 1,
          nl = Math.hypot(3.4 / r.len, 1);
        M.quad(
          b,
          P(a0, -hw, h0),
          P(a1, -hw, h1),
          P(a1, hw, h1),
          P(a0, hw, h0),
          [(r.dx * 3.4) / r.len / nl, ny / nl, (r.dz * 3.4) / r.len / nl],
          [a0 / 2, -hw / 2, a1 / 2, -hw / 2, a1 / 2, hw / 2, a0 / 2, hw / 2],
          [0.8, 0.8, 0.74],
        );
        // side walls of the ramp cut
        for (const sd of [-1, 1]) {
          M.quad(
            b,
            P(a0, sd * hw, -8),
            P(a1, sd * hw, -8),
            P(a1, sd * hw, h1),
            P(a0, sd * hw, h0),
            [-px * sd, 0, -pz * sd],
            [a0 / 3, 0, a1 / 3, 0, a1 / 3, 1, a0 / 3, 1],
            [0.35, 0.37, 0.3],
          );
        }
      }
      // mark raster
      const poly = [
        [
          r.x - r.dz * (hw + 0.5) - r.dx * 3,
          r.z + r.dx * (hw + 0.5) - r.dz * 3,
        ],
        [
          r.x + r.dz * (hw + 0.5) - r.dx * 3,
          r.z - r.dx * (hw + 0.5) - r.dz * 3,
        ],
      ];
      poly.push(
        [poly[1][0] + r.dx * (r.len + 3), poly[1][1] + r.dz * (r.len + 3)],
        [poly[0][0] + r.dx * (r.len + 3), poly[0][1] + r.dz * (r.len + 3)],
      );
      M.rasterPoly(poly, RC.RAMP);
      // bollards at the top of the ramp
      const bd = M.buf("metal_painted", r.x, r.z, "detail");
      for (const sd of [-1, 1])
        M.cyl(
          bd,
          r.x - r.dx * 2.5 + px * sd * (hw + 0.4),
          0,
          r.z - r.dz * 2.5 + pz * sd * (hw + 0.4),
          0.18,
          0.15,
          0.7,
          8,
          { capTop: true, c: [0.35, 0.3, 0.25] },
        );
    }
  }

  // -------------------------------------------------------------------
  // Islands: Liberty (plate only; landmarks_b builds the fort & statue),
  // Ellis (map builds a ruined immigration station).
  // -------------------------------------------------------------------
  function buildIslands() {
    const L = G.LAYOUT;
    const lib = M.circlePoly(L.LIBERTY.x, L.LIBERTY.z, L.LIBERTY.r, 48);
    const libIn = M.circlePoly(L.LIBERTY.x, L.LIBERTY.z, L.LIBERTY.r - 6, 48);
    M.poly(M.buf("grass_dead", L.LIBERTY.x, L.LIBERTY.z, "always"), libIn, 0, {
      s: 6,
      c: [0.85, 0.82, 0.7],
    });
    M.poly(M.buf("concrete", L.LIBERTY.x, L.LIBERTY.z, "always"), lib, 0, {
      s: 4,
      holes: [libIn.slice().reverse()],
      c: [0.9, 0.88, 0.84],
    });
    seaWall(lib);
    railings(lib, libIn);
    const ell = M.circlePoly(L.ELLIS.x, L.ELLIS.z, L.ELLIS.r, 40);
    M.poly(M.buf("sidewalk", L.ELLIS.x, L.ELLIS.z, "always"), ell, 0, {
      s: 3,
      c: [0.85, 0.83, 0.8],
    });
    seaWall(ell);
    railings(ell, ell);
    buildEllisBuilding(L.ELLIS.x, L.ELLIS.z - 2);
    // Liberty ferry dock (north)
    pier(L.LIBERTY.x - 20, L.LIBERTY.z - L.LIBERTY.r + 2, 0, -1, 26, 9, {
      shed: false,
      key: "liberty",
    });
  }

  /** Ellis Island main building: red brick & limestone with four copper-domed towers. */
  function buildEllisBuilding(cx, cz) {
    const W = 34,
      D = 15,
      H = 16;
    const x0 = cx - W / 2,
      x1 = cx + W / 2,
      z0 = cz - D / 2,
      z1 = cz + D / 2;
    const bf = M.buf("facade/warehouse/1", cx, cz);
    const tile = M.facadeTile();
    const wallC = [0.95, 0.8, 0.72],
      wallT = [1, 0.92, 0.86];
    const sides = [
      [x0, z0, x1, z0],
      [x1, z0, x1, z1],
      [x1, z1, x0, z1],
      [x0, z1, x0, z0],
    ];
    for (const s of sides) {
      const l = Math.hypot(s[2] - s[0], s[3] - s[1]);
      M.wall(
        bf,
        s[0],
        s[1],
        s[2],
        s[3],
        3,
        H,
        0,
        l / tile.w,
        0,
        (H - 3) / tile.h,
        wallC,
        wallT,
      );
    }
    const bl = M.buf("stone_limestone", cx, cz);
    M.box(bl, x0 - 0.3, 0, z0 - 0.3, x1 + 0.3, 3, z1 + 0.3, {
      s: 3,
      c: [0.9, 0.88, 0.82],
    });
    M.box(bl, x0 - 0.5, H, z0 - 0.5, x1 + 0.5, H + 0.8, z1 + 0.5, {
      s: 3,
      c: [0.92, 0.9, 0.84],
    });
    // central arched entrance portico
    M.box(bl, cx - 4, 0, z1, cx + 4, 9, z1 + 1.2, { s: 3 });
    const bd = M.buf("glass_dirty", cx, cz);
    M.box(bd, cx - 3, 0.1, z1 + 1.2, cx + 3, 7.5, z1 + 1.25, {
      s: 3,
      c: [0.4, 0.4, 0.4],
      skip: 8 + 1 + 2 + 4 + 32,
    });
    // roof (hipped, ruined in places)
    const br = M.buf("metal_painted", cx, cz);
    const roofC = [0.45, 0.7, 0.6];
    M.quad(
      br,
      [x0, H + 0.8, z0],
      [x1, H + 0.8, z0],
      [x1 - 4, H + 5, cz],
      [x0 + 4, H + 5, cz],
      [0, 0.7, -0.7],
      [0, 0, 8, 0, 8, 2, 0, 2],
      roofC,
    );
    M.quad(
      br,
      [x1, H + 0.8, z1],
      [x0, H + 0.8, z1],
      [x0 + 12, H + 5, cz],
      [x1 - 4, H + 5, cz],
      [0, 0.7, 0.7],
      [0, 0, 8, 0, 8, 2, 0, 2],
      roofC,
    );
    M.tri(
      br,
      [x0, H + 0.8, z0],
      [x0 + 4, H + 5, cz],
      [x0, H + 0.8, z1],
      [-1, 0.5, 0],
      [0, 0, 1, 1, 0, 2],
      roofC,
    );
    M.tri(
      br,
      [x1, H + 0.8, z1],
      [x1 - 4, H + 5, cz],
      [x1, H + 0.8, z0],
      [1, 0.5, 0],
      [0, 0, 1, 1, 0, 2],
      roofC,
    );
    // collapsed roof hole — exposed rafters
    const bg = M.buf("rust", cx, cz, "detail");
    for (let k = 0; k < 5; k++)
      M.beam(
        bg,
        x0 + 5 + k * 1.6,
        H + 0.9,
        z1 - 1,
        x0 + 5 + k * 1.6,
        H + 4.5,
        cz,
        0.18,
        0.25,
        { c: [0.8, 0.8, 0.8] },
      );
    // four towers with domes
    for (const [tx, tz] of [
      [x0 + 1.5, z0 + 1.5],
      [x1 - 1.5, z0 + 1.5],
      [x0 + 1.5, z1 - 1.5],
      [x1 - 1.5, z1 - 1.5],
    ]) {
      M.box(bl, tx - 2, 0, tz - 2, tx + 2, H + 8, tz + 2, {
        s: 3,
        c: [0.92, 0.9, 0.86],
      });
      M.box(
        M.buf("brick_red", tx, tz),
        tx - 2.05,
        3,
        tz - 2.05,
        tx + 2.05,
        H + 6,
        tz + 2.05,
        { s: 3, skip: 12 },
      );
      M.cyl(br, tx, H + 8, tz, 2.2, 0.2, 3.6, 12, { c: [0.45, 0.75, 0.62] });
      M.cyl(br, tx, H + 11.4, tz, 0.12, 0.05, 2.2, 5, { c: [0.3, 0.3, 0.3] });
      M.box(bl, tx - 2.3, H + 7.4, tz - 2.3, tx + 2.3, H + 8, tz + 2.3, {
        s: 3,
      });
    }
    M.box3(x0, 0, z0, x1, H + 1, z1, { tag: "building" });
  }

  // -------------------------------------------------------------------
  // Piers
  // -------------------------------------------------------------------
  M.pierRoots = [];
  /** Pier from shore point (x,z) along (dx,dz), length len, width w. */
  function pier(x, z, dx, dz, len, w, o) {
    o = o || {};
    const l = Math.hypot(dx, dz);
    dx /= l;
    dz /= l;
    const px = -dz,
      pz = dx;
    M.pierRoots.push({ x, z, w });
    const ex = x + dx * len,
      ez = z + dz * len;
    const mx = (x + ex) / 2,
      mz = (z + ez) / 2;
    const yaw = Math.atan2(dx, dz);
    const broken = !!o.broken;
    const deckLen = broken ? len * 0.72 : len;
    const dmx = x + (dx * deckLen) / 2,
      dmz = z + (dz * deckLen) / 2;
    // deck (collider & visual)
    const bd = M.buf("concrete", mx, mz);
    M.obox(bd, dmx, -0.35, dmz, w, 0.7, deckLen + 1, yaw, {
      s: 4,
      c: [0.82, 0.8, 0.76],
      ct: [0.9, 0.88, 0.84],
    });
    M.ocol(dmx, dmz, w, deckLen + 1, -1.5, 0, yaw, {
      tag: "pier",
      surface: "concrete",
    });
    // fender timbers along the sides
    const bw = M.buf("wood_rotten", mx, mz, "detail");
    for (const sd of [-1, 1])
      M.obox(
        bw,
        dmx + px * sd * (w / 2 + 0.15),
        -0.55,
        dmz + pz * sd * (w / 2 + 0.15),
        0.3,
        0.5,
        deckLen,
        yaw,
        { s: 2, c: [0.7, 0.62, 0.52] },
      );
    // pilings
    const bp = M.buf("wood_rotten", mx, mz, "detail");
    for (let a = 3; a < len; a += 6)
      for (const sd of [-1, 1]) {
        const qx = x + dx * a + px * sd * (w / 2 - 0.6),
          qz = z + dz * a + pz * sd * (w / 2 - 0.6);
        M.cyl(bp, qx, -6, qz, 0.35, 0.33, a > deckLen ? 5.4 : 5.3, 7, {
          c: [0.45, 0.42, 0.35],
          capTop: a > deckLen,
        });
      }
    // bollards / cleats
    const bb = M.buf("rust", mx, mz, "detail");
    for (let a = 5; a < deckLen - 2; a += 9)
      for (const sd of [-1, 1]) {
        const qx = x + dx * a + px * sd * (w / 2 - 0.5),
          qz = z + dz * a + pz * sd * (w / 2 - 0.5);
        M.cyl(bb, qx, 0, qz, 0.22, 0.2, 0.55, 8, {
          capTop: true,
          c: [0.6, 0.5, 0.45],
        });
        M.cyl(bb, qx, 0.55, qz, 0.3, 0.3, 0.1, 8, {
          capTop: true,
          c: [0.6, 0.5, 0.45],
        });
      }
    if (broken) {
      // collapsed end section slumping into the river
      const a0 = deckLen + 2;
      const bx = x + dx * (a0 + len * 0.14),
        bz = z + dz * (a0 + len * 0.14);
      M.obox(bd, bx, -1.6, bz, w * 0.95, 0.7, len * 0.26, yaw + 0.05, {
        pitch: 0.16,
        roll: 0.06,
        s: 4,
        c: [0.6, 0.6, 0.55],
      });
    }
    // pier shed (corrugated hangar)
    if (o.shed) {
      const sl = deckLen * 0.62,
        sw = w - 3,
        sh = 8 + M.hash(x, z, 4) * 3;
      const sa = deckLen * 0.28;
      const scx = x + dx * (sa + sl / 2),
        scz = z + dz * (sa + sl / 2);
      const bs = M.buf("corrugated", scx, scz);
      M.setXF(M.mtx(scx, 0, scz, yaw));
      const tint =
        M.hash(x, z, 6) < 0.5 ? [0.75, 0.8, 0.78] : [0.85, 0.72, 0.62];
      // walls
      M.box(bs, -sw / 2, 0, -sl / 2, sw / 2, sh, sl / 2, {
        s: 3,
        c: tint,
        skip: 8 + 4,
      });
      // gable roof (arched approximation)
      const br = M.buf("rust", scx, scz);
      const seg = 6;
      for (let k = 0; k < seg; k++) {
        const a0 = (Math.PI * k) / seg,
          a1 = (Math.PI * (k + 1)) / seg;
        const X0 = (Math.cos(a0) * sw) / 2,
          Y0 = sh + Math.sin(a0) * 3.2,
          X1 = (Math.cos(a1) * sw) / 2,
          Y1 = sh + Math.sin(a1) * 3.2;
        const nx0 = Math.cos((a0 + a1) / 2),
          ny0 = Math.sin((a0 + a1) / 2);
        if (k === 2 && M.hash(x, z, 8) < 0.6) continue; // hole in the roof
        M.quad(
          br,
          [X0, Y0, -sl / 2],
          [X1, Y1, -sl / 2],
          [X1, Y1, sl / 2],
          [X0, Y0, sl / 2],
          [nx0, ny0, 0],
          [0, 0, 1, 0, 1, sl / 3, 0, sl / 3],
          [0.8, 0.72, 0.65],
        );
      }
      for (const e of [-1, 1]) {
        // gable ends
        for (let k = 0; k < seg; k++) {
          const a0 = (Math.PI * k) / seg,
            a1 = (Math.PI * (k + 1)) / seg;
          M.tri(
            bs,
            [0, sh, (e * sl) / 2],
            [(Math.cos(a0) * sw) / 2, sh + Math.sin(a0) * 3.2, (e * sl) / 2],
            [(Math.cos(a1) * sw) / 2, sh + Math.sin(a1) * 3.2, (e * sl) / 2],
            [0, 0, e],
            [0, 0, 1, 0, 0.5, 1],
            tint,
          );
        }
      }
      // big door openings (dark)
      const bdk = M.buf("glass_dirty", scx, scz);
      M.box(bdk, -3, 0, -sl / 2 - 0.05, 3, 6, -sl / 2 + 0.05, {
        c: [0.1, 0.1, 0.1],
        s: 3,
        skip: 8,
      });
      // painted pier number
      M.setXF(null);
      M.ocol(scx, scz, sw, sl, 0, sh + 3, yaw, {
        tag: "building",
        surface: "metal",
      });
    }
    M.setXF(null);
    return { x, z, ex, ez, dx, dz, yaw };
  }
  M.pier = pier;

  function buildPiers() {
    const L = G.LAYOUT,
      man = L.MANHATTAN;
    M.piers = M.piers || [];
    const west = [
      [-840, 70, 16, true],
      [-560, 80, 18, true],
      [-330, 95, 18, false],
      [-120, 75, 18, true],
      [140, 85, 20, true],
      [360, 70, 16, false],
      [560, 80, 18, true],
      [760, 55, 14, false],
    ];
    for (let i = 0; i < west.length; i++) {
      const [z, len, w, shed] = west[i];
      const x = M.shoreX(man, z, -1);
      if (x === null) continue;
      if (L.siteAt(x, z, 10)) continue;
      M.piers.push(
        pier(x + 0.5, z, -1, 0, len, w, {
          shed,
          broken: i === 5 || i === 7,
          key: "w" + i,
        }),
      );
    }
    const east = [
      [-800, 55, 14, true],
      [-560, 60, 16, false],
      [60, 55, 16, true],
      [250, 60, 14, true],
      [470, 50, 14, false],
      [780, 45, 16, false],
    ];
    for (let i = 0; i < east.length; i++) {
      const [z, len, w, shed] = east[i];
      const x = M.shoreX(man, z, 1);
      if (x === null) continue;
      if (L.siteAt(x, z, 10)) continue;
      M.piers.push(
        pier(x - 0.5, z, 1, 0, len, w, { shed, broken: i === 4, key: "e" + i }),
      );
    }
    // Brooklyn waterfront piers
    for (const [z, len] of [
      [430, 60],
      [700, 70],
      [930, 50],
    ]) {
      const x = M.shoreX(L.BROOKLYN, z, -1);
      if (x === null) continue;
      if (L.siteAt(x, z, 10)) continue;
      M.piers.push(
        pier(x + 0.5, z, -1, 0, len, 16, { shed: z === 430, key: "b" + z }),
      );
    }
  }

  // -------------------------------------------------------------------
  // Hull generator (boats, carrier, freighter)
  // -------------------------------------------------------------------
  /**
   * Lofted hull in local space: length along +Z (bow at +len/2), beam along X,
   * keel at y=-depth, deck at y=0. mat buffer b.
   */
  function hull(b, len, beam, depth, o) {
    o = o || {};
    const N = 10,
      c = o.c || [0.7, 0.4, 0.3],
      cTop = o.ct || c;
    const sections = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N; // 0 = stern, 1 = bow
      const z = -len / 2 + len * t;
      let wk = 1;
      if (t > 0.65) wk = Math.cos((((t - 0.65) / 0.35) * Math.PI) / 2); // taper to bow
      if (t < 0.1) wk = 0.85 + 0.15 * (t / 0.1);
      const hw = Math.max(0.05, (beam / 2) * wk);
      const keel = -depth * (t > 0.85 ? 1 - ((t - 0.85) / 0.15) * 0.5 : 1);
      sections.push([z, hw, keel]);
    }
    // each section: points around U: deck-left, bilge-left, keel, bilge-right, deck-right
    const ring = (s) => [
      [-s[1], 0.4],
      [-s[1] * 0.92, s[2] * 0.6],
      [0, s[2]],
      [s[1] * 0.92, s[2] * 0.6],
      [s[1], 0.4],
    ];
    for (let i = 0; i < N; i++) {
      const A = sections[i],
        B = sections[i + 1];
      const ra = ring(A),
        rb = ring(B);
      for (let k = 0; k < 4; k++) {
        const p0 = [ra[k][0], ra[k][1], A[0]],
          p1 = [ra[k + 1][0], ra[k + 1][1], A[0]],
          p2 = [rb[k + 1][0], rb[k + 1][1], B[0]],
          p3 = [rb[k][0], rb[k][1], B[0]];
        const mx = (p0[0] + p1[0] + p2[0] + p3[0]) / 4,
          my = (p0[1] + p1[1] + p2[1] + p3[1]) / 4 + depth * 0.3;
        const nl = Math.hypot(mx, my) || 1;
        M.quad(
          b,
          p0,
          p3,
          p2,
          p1,
          [mx / nl, my / nl, 0],
          [
            A[0] / 3,
            ra[k][1] / 3,
            B[0] / 3,
            ra[k][1] / 3,
            B[0] / 3,
            ra[k + 1][1] / 3,
            A[0] / 3,
            ra[k + 1][1] / 3,
          ],
          k < 2 ? c : cTop,
          k < 2 ? cTop : c,
        );
      }
      // deck
      if (!o.noDeck)
        M.quad(
          b,
          [-A[1], 0.4, A[0]],
          [A[1], 0.4, A[0]],
          [B[1], 0.4, B[0]],
          [-B[1], 0.4, B[0]],
          [0, 1, 0],
          [
            -A[1] / 3,
            A[0] / 3,
            A[1] / 3,
            A[0] / 3,
            B[1] / 3,
            B[0] / 3,
            -B[1] / 3,
            B[0] / 3,
          ],
          o.cd || c,
        );
    }
    // transom (stern plate)
    const S = sections[0],
      rs = ring(S);
    for (let k = 1; k < 4; k++)
      M.tri(
        b,
        [rs[0][0], rs[0][1], S[0]],
        [rs[k][0], rs[k][1], S[0]],
        [rs[k + 1][0], rs[k + 1][1], S[0]],
        [0, 0, -1],
        [0, 0, 1, 0, 1, 1],
        c,
      );
    return sections;
  }
  M.hull = hull;

  // -------------------------------------------------------------------
  // "USS Intrepid"-style aircraft carrier at the Hell's Kitchen pier
  // -------------------------------------------------------------------
  function buildIntrepid() {
    const L = G.LAYOUT;
    const pierX = M.shoreX(L.MANHATTAN, -330, -1);
    if (pierX === null) return;
    const cx = pierX - 58,
      cz = -357,
      yaw = -Math.PI / 2; // bow pointing west (local +Z → world -X)
    const LEN = 110,
      BEAM = 17,
      DEPTH = 9,
      FD = 6.5; // flight deck height above water line
    const b = M.buf("metal_painted", cx, cz, "mid");
    M.setXF(M.mtx(cx, -1.2 + 0.2, cz, yaw, 0, 0.035));
    hull(b, LEN, BEAM, DEPTH, {
      c: [0.8, 0.84, 0.88],
      ct: [0.95, 1.0, 1.04],
      cd: [0.7, 0.7, 0.7],
    });
    // hangar deck walls up to the flight deck
    M.box(
      b,
      -BEAM / 2 + 0.3,
      0.4,
      -LEN / 2 + 4,
      BEAM / 2 - 0.3,
      FD,
      LEN / 2 - 16,
      { s: 3, c: [0.88, 0.92, 0.96], skip: 8 },
    );
    // flight deck overhang (wood planking top)
    const fw = M.buf("wood_planks", cx, cz, "mid");
    M.box(
      fw,
      -BEAM / 2 - 4.5,
      FD,
      -LEN / 2 - 2,
      BEAM / 2 + 3,
      FD + 0.6,
      LEN / 2 - 4,
      { s: 3, c: [0.95, 0.9, 0.82], cy: [1.0, 0.95, 0.88], skip: 0 },
    );
    // runway markings (white dashes)
    const bm = M.buf("my/markings", cx, cz, "detail");
    for (let z = -LEN / 2 + 4; z < LEN / 2 - 10; z += 7)
      M.decal(bm, -1, FD + 0.62, z, 0.6, 3.5, 0, M.MARK.WHITE, null);
    // island superstructure (starboard = local +X side)
    const is = M.buf("metal_painted", cx, cz, "mid");
    M.box(is, BEAM / 2 - 1.5, FD + 0.6, -6, BEAM / 2 + 2.5, FD + 9, 10, {
      s: 3,
      c: [0.9, 0.94, 0.98],
    });
    M.box(is, BEAM / 2 - 1, FD + 9, -3, BEAM / 2 + 2, FD + 13, 6, {
      s: 3,
      c: [0.86, 0.9, 0.94],
    });
    M.box(is, BEAM / 2 - 0.6, FD + 13, -1, BEAM / 2 + 1.6, FD + 16, 4, {
      s: 3,
      c: [0.4, 0.42, 0.44],
    });
    M.cyl(is, BEAM / 2 + 0.5, FD + 16, 1.5, 0.25, 0.1, 9, 6, {
      c: [0.35, 0.35, 0.35],
    });
    const bgl = M.buf("glass_dirty", cx, cz);
    M.box(
      bgl,
      BEAM / 2 - 1.05,
      FD + 11,
      -3.05,
      BEAM / 2 + 2.05,
      FD + 12.2,
      6.05,
      { s: 3, c: [0.5, 0.55, 0.5], skip: 12 },
    );
    // wrecked aircraft on deck
    const pl = M.buf("metal_painted", cx, cz, "detail");
    for (const [px, pz, ry, broken] of [
      [-3, 25, 0.3, false],
      [3, 5, -0.2, true],
      [-5, -20, 2.9, false],
      [2, -35, 3.3, false],
    ]) {
      const m = M.mtx(cx, 0, cz, yaw).multiply(
        M.mtx(px, -1.2 + 0.2 + FD + 0.6 + 1.1, pz, ry, 0, broken ? 0.25 : 0),
      );
      const pc = [0.55, 0.62, 0.66];
      M.setXF(m);
      M.pipe(pl, 0, 0, -4.5, 0, 0, 4.5, 0.7, 8, { c: pc, r1: 0.45 }); // fuselage
      M.box(pl, -5.5, -0.1, -0.5, broken ? 0 : 5.5, 0.08, 1.8, { s: 2, c: pc }); // wings (one torn off)
      M.box(pl, -2, 0, -4.4, 2, 0.06, -3.4, { s: 2, c: pc }); // tailplane
      M.box(pl, -0.06, 0, -4.4, 0.06, 1.8, -3.3, { s: 2, c: pc }); // fin
      M.box(pl, -0.4, 0.5, 0.5, 0.4, 1.0, 2.5, { s: 2, c: [0.2, 0.25, 0.25] }); // canopy
      M.cyl(pl, 0, -0.35, 4.6, 0.35, 0.2, 0.3, 6, { c: [0.25, 0.25, 0.25] }); // prop hub
      M.setXF(null);
    }
    M.setXF(null);
    // colliders: hull (not walkable from the side), flight deck walkable
    M.ocol(cx, cz, BEAM + 7.5, LEN + 4, -8, -1.2 + 0.2 + FD + 0.6, yaw, {
      tag: "ship",
      surface: "metal",
    });
    // island superstructure blocks the deck (local x 7..11.5, z -6..10)
    {
      const ix = cx - 2,
        iz = cz + 9.25;
      M.ocol(ix, iz, 16, 4.5, 0, 25, 0, { tag: "ship", surface: "metal" });
    }
    // gangway stairs from the pier deck (y=0) up to the flight deck (~6.1)
    const topY = -1.2 + 0.2 + FD + 0.6;
    const gx = pierX - 30; // on the pier, heading north toward the carrier
    const steps = Math.ceil(topY / 0.45);
    const gs = M.buf("metal_panel", gx, -345);
    for (let s = 0; s < steps; s++) {
      const y = ((s + 1) * topY) / steps;
      const z0 = -338.6 - s * 0.55;
      M.box(gs, gx - 1.1, y - 0.12, z0 - 0.55, gx + 1.1, y, z0, {
        s: 2,
        c: [0.6, 0.6, 0.58],
      });
      M.box3(gx - 1.1, y - 0.4, z0 - 0.55, gx + 1.1, y, z0, {
        tag: "stairs",
        surface: "metal",
      });
    }
    const zTop = -338.6 - steps * 0.55;
    const gr = M.buf("rust", gx, -345, "detail");
    for (const sd of [-1.15, 1.15]) {
      M.beam(gr, gx + sd, 1.0, -338.6, gx + sd, topY + 1.0, zTop, 0.05, 0.05, {
        c: [0.6, 0.55, 0.5],
      });
      M.beam(gr, gx + sd, 0, -338.6, gx + sd, topY, zTop, 0.14, 0.3, {
        c: [0.5, 0.45, 0.4],
      });
      M.ocol(
        gx + sd * 1.1,
        (zTop - 338.6) / 2,
        0.15,
        Math.abs(zTop + 338.6),
        0,
        topY + 1.2,
        0,
        { tag: "railing" },
      );
    }
    M.intrepid = { x: cx, z: cz, deckY: topY, gangway: { x: gx, z: -336 } };
  }

  // -------------------------------------------------------------------
  // Brooklyn Navy Yard: gantry cranes, freighter, container stacks
  // -------------------------------------------------------------------
  function buildNavyYard() {
    const L = G.LAYOUT;
    // freighter moored (and half sunk) off the Brooklyn shore
    const shore = M.shoreX(L.BROOKLYN, 770, -1);
    if (shore !== null) {
      const cx = shore - 22,
        cz = 770;
      const b = M.buf("rust", cx, cz, "mid");
      M.setXF(M.mtx(cx, -3.2, cz, 0.04, 0.02, -0.09));
      hull(b, 90, 15, 10, {
        c: [0.55, 0.3, 0.22],
        ct: [0.35, 0.33, 0.3],
        cd: [0.5, 0.42, 0.36],
      });
      // superstructure aft
      M.box(b, -6, 0.4, -40, 6, 9, -28, { s: 3, c: [0.8, 0.78, 0.72] });
      M.box(b, -4, 9, -38, 4, 12, -31, { s: 3, c: [0.75, 0.72, 0.68] });
      M.cyl(b, 0, 12, -34, 1.4, 1.2, 5, 10, { c: [0.35, 0.18, 0.15] });
      // cargo hatches & containers
      const cb = M.buf("corrugated", cx, cz, "mid");
      const cc = [
        [0.6, 0.25, 0.2],
        [0.25, 0.4, 0.55],
        [0.7, 0.55, 0.25],
        [0.35, 0.5, 0.35],
      ];
      for (let k = 0; k < 7; k++) {
        const zz = -20 + k * 7.5;
        if (k === 4) continue;
        const layers = 1 + (k % 3);
        for (let y = 0; y < layers; y++)
          M.box(cb, -5, 0.4 + y * 2.6, zz - 3, 5, 3 + y * 2.6, zz + 3, {
            s: 2.5,
            c: cc[(k + y) % 4],
          });
      }
      // cargo cranes (booms)
      for (const zz of [-12, 12]) {
        M.cyl(b, 0, 0.4, zz, 0.5, 0.4, 10, 8, { c: [0.7, 0.6, 0.3] });
        M.beam(b, 0, 9, zz, 6, 4, zz + 8, 0.35, 0.35, { c: [0.7, 0.6, 0.3] });
      }
      M.setXF(null);
      M.ocol(cx, cz, 16, 92, -10, 5, 0.04, { tag: "ship", surface: "metal" });
    }
    // gantry cranes on the yard
    for (const [x, z] of [
      [505, 720],
      [540, 812],
    ]) {
      const b = M.buf("rust", x, z, "mid");
      const H = 34,
        span = 18;
      const col = [0.72, 0.55, 0.32];
      for (const sx of [-span / 2, span / 2])
        for (const sz of [-4, 4]) {
          M.beam(
            b,
            x + sx,
            0,
            z + sz,
            x + sx * 0.9,
            H,
            z + sz * 0.8,
            0.8,
            0.8,
            { c: col },
          );
          M.box3(x + sx - 0.5, 0, z + sz - 0.5, x + sx + 0.5, H, z + sz + 0.5, {
            tag: "crane",
            surface: "metal",
          });
        }
      for (const sx of [-span / 2, span / 2]) {
        M.beam(b, x + sx, 3, z - 4, x + sx, 3, z + 4, 0.6, 0.6, { c: col });
        M.beam(
          b,
          x + sx,
          0.5,
          z - 4,
          x + sx * 0.9,
          H * 0.6,
          z + 3.2,
          0.3,
          0.3,
          { c: col },
        );
      }
      // main girder extending out over the water (west)
      M.box(b, x - span / 2 - 32, H, z - 2, x + span / 2 + 10, H + 3, z + 2, {
        s: 3,
        c: col,
      });
      M.box(b, x - 4, H + 3, z - 2.5, x + 4, H + 7, z + 2.5, {
        s: 3,
        c: [0.6, 0.6, 0.55],
      });
      for (let k = -span / 2 - 30; k < span / 2 + 10; k += 4)
        M.beam(b, x + k, H, z - 2, x + k + 4, H + 3, z - 2, 0.2, 0.2, {
          c: col,
        });
      // trolley & cable hook
      M.box(b, x - 26, H - 1.5, z - 1.5, x - 22, H, z + 1.5, {
        s: 2,
        c: [0.4, 0.4, 0.4],
      });
      M.pipe(b, x - 24, H - 1.5, z, x - 24, H - 14, z, 0.06, 4, {
        c: [0.2, 0.2, 0.2],
      });
      M.box(b, x - 24.6, H - 15.2, z - 0.6, x - 23.4, H - 14, z + 0.6, {
        s: 1,
        c: [0.7, 0.6, 0.2],
      });
    }
    // container stacks
    const cb = M.buf("corrugated", 620, 760);
    const cc = [
      [0.6, 0.25, 0.2],
      [0.25, 0.4, 0.55],
      [0.7, 0.55, 0.25],
      [0.35, 0.5, 0.35],
      [0.5, 0.5, 0.48],
    ];
    const r = M.rng("containers");
    for (const [x0, z0] of [
      [590, 700],
      [640, 850],
    ]) {
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 3; j++) {
          const h = r.int(1, 3);
          const x = x0 + i * 3.2,
            z = z0 + j * 13;
          if (L.rectOverlapsSite(x - 1.5, z - 6.5, x + 1.5, z + 6.5, 2))
            continue;
          for (let y = 0; y < h; y++)
            M.box(
              cb,
              x - 1.25,
              SY + y * 2.6,
              z - 6,
              x + 1.25,
              SY + 2.55 + y * 2.6,
              z + 6,
              { s: 2.5, c: cc[r.int(0, 4)] },
            );
          M.box3(x - 1.25, 0, z - 6, x + 1.25, SY + h * 2.6, z + 6, {
            tag: "container",
            surface: "metal",
          });
        }
    }
  }

  // -------------------------------------------------------------------
  // Sunken boats around the harbour
  // -------------------------------------------------------------------
  function buildBoats() {
    const L = G.LAYOUT;
    const boats = [
      // x, z, yaw, len, beam, depth, sink, roll, pitch, type
      [-395, -560, 1.2, 22, 6, 3.5, 1.6, 0.35, 0.1, "tug"],
      [-380, 420, -0.4, 30, 9, 3, 2.2, -0.2, 0.18, "ferry"],
      [385, -200, 2.4, 18, 5, 3, 1.4, 0.5, 0.05, "tug"],
      [372, 820, 0.2, 40, 9, 4, 2.6, 0.12, 0.08, "tallship"],
      [-470, 1150, 0.8, 16, 5, 3, 1.2, 0.3, 0.2, "tug"],
      [420, 300, 1.7, 26, 8, 2.5, 1.8, -0.25, 0.06, "barge"],
      [-250, 1080, 2.2, 20, 6, 3, 1.5, 0.4, -0.12, "tug"],
      [455, 560, 3.0, 14, 4.5, 2.5, 1.0, 0.6, 0.1, "tug"],
    ];
    for (const [
      x,
      z,
      yaw,
      len,
      beam,
      depth,
      sink,
      roll,
      pitch,
      type,
    ] of boats) {
      if (L.isLand(x, z)) continue;
      const b = M.buf(
        type === "tallship" ? "wood_rotten" : "rust",
        x,
        z,
        "mid",
      );
      M.setXF(M.mtx(x, -1.2 - sink, z, yaw, pitch, roll));
      const col =
        type === "tug"
          ? [0.55, 0.25, 0.2]
          : type === "ferry"
            ? [0.75, 0.55, 0.3]
            : type === "tallship"
              ? [0.45, 0.35, 0.25]
              : [0.45, 0.4, 0.35];
      hull(b, len, beam, depth, {
        c: col,
        ct: M.mulc(col, 1.3),
        cd: [0.5, 0.45, 0.4],
      });
      if (type === "tug") {
        M.box(b, -beam * 0.3, 0.4, -len * 0.2, beam * 0.3, 3.2, len * 0.15, {
          s: 2,
          c: [0.85, 0.8, 0.72],
        });
        M.box(b, -beam * 0.25, 3.2, -len * 0.12, beam * 0.25, 4.6, len * 0.08, {
          s: 2,
          c: [0.8, 0.75, 0.7],
        });
        M.cyl(b, 0, 3.2, -len * 0.22, 0.6, 0.55, 2.5, 8, {
          c: [0.2, 0.2, 0.2],
        });
      } else if (type === "ferry") {
        M.box(b, -beam * 0.45, 0.4, -len * 0.4, beam * 0.45, 3.4, len * 0.35, {
          s: 2.5,
          c: [0.8, 0.62, 0.35],
        });
        M.box(b, -beam * 0.4, 3.4, -len * 0.3, beam * 0.4, 5.6, len * 0.25, {
          s: 2.5,
          c: [0.85, 0.7, 0.45],
        });
      } else if (type === "tallship") {
        for (const mz of [-12, 2, 14]) {
          const h = mz === 2 ? 26 : 22;
          M.cyl(b, 0, 0.4, mz, 0.35, 0.2, h, 8, { c: [0.35, 0.28, 0.2] });
          for (const yh of [h * 0.45, h * 0.7, h * 0.9])
            M.beam(b, -5 + yh * 0.05, yh, mz, 5 - yh * 0.05, yh, mz, 0.2, 0.2, {
              c: [0.35, 0.28, 0.2],
            });
          if (mz !== 14)
            M.pipe(b, 0, h, mz, 0, 1, mz + 12, 0.03, 3, {
              c: [0.15, 0.15, 0.12],
            });
        }
        M.pipe(b, 0, 0.4, len / 2, 0, 5, len / 2 + 9, 0.25, 6, {
          c: [0.35, 0.28, 0.2],
        }); // bowsprit
      } else {
        const cc = [
          [0.6, 0.25, 0.2],
          [0.25, 0.4, 0.55],
          [0.5, 0.5, 0.48],
        ];
        for (let k = 0; k < 3; k++)
          M.box(
            b,
            -3.5,
            0.4,
            -len * 0.35 + k * 7,
            3.5,
            3,
            -len * 0.35 + k * 7 + 6,
            { s: 2.5, c: cc[k] },
          );
      }
      M.setXF(null);
    }
  }

  // -------------------------------------------------------------------
  // Far skyline filler outside the playable area (no colliders)
  // -------------------------------------------------------------------
  function farBlock(b, bt, x0, z0, x1, z1, h, style, v) {
    const tile = M.facadeTile();
    const c = [0.78, 0.78, 0.76];
    const sides = [
      [x0, z0, x1, z0],
      [x1, z0, x1, z1],
      [x1, z1, x0, z1],
      [x0, z1, x0, z0],
    ];
    for (const s of sides) {
      const l = Math.hypot(s[2] - s[0], s[3] - s[1]);
      M.wall(
        b,
        s[0],
        s[1],
        s[2],
        s[3],
        0,
        h,
        0,
        l / tile.w,
        0,
        h / tile.h,
        M.mulc(c, 0.7),
        c,
      );
    }
    M.box(bt, x0, h, z0, x1, h + 0.6, z1, {
      s: 4,
      c: [0.6, 0.6, 0.58],
      skip: 8,
    });
  }
  function buildFarSkyline() {
    const r = M.rng("farskyline");
    const styles = ["apartment", "office", "warehouse", "artdeco"];
    // New Jersey waterfront (Hoboken / Jersey City) west of the Hudson
    const nj = M.buf("concrete_dark", -900, 0, "far");
    M.box(nj, -1150, -8, -1200, -790, 0.3, 1600, { s: 6, c: [0.7, 0.7, 0.66] });
    for (let z = -1150; z < 1550; z += r.range(24, 40)) {
      const w = r.range(18, 34),
        d = r.range(18, 40);
      const tall = z > 300 && z < 900 ? r.range(40, 120) : r.range(10, 45);
      const x0 = -860 - r.range(0, 60);
      const st = styles[r.int(0, 3)],
        v = r.int(1, 2);
      farBlock(
        M.buf("facade/" + st + "/" + v, -900, z, "far"),
        nj,
        x0 - w,
        z,
        x0,
        z + d,
        tall,
        st,
        v,
      );
      if (r() < 0.25)
        farBlock(
          M.buf("facade/warehouse/1", -900, z, "far"),
          nj,
          -815,
          z,
          -797,
          z + 18,
          r.range(8, 14),
          "warehouse",
          1,
        );
    }
    // cranes at Port Newark-ish
    const cr = M.buf("rust", -820, 1300, "far");
    for (const z of [1180, 1260, 1340]) {
      M.box(cr, -812, 0, z - 3, -808, 38, z + 3, { c: [0.8, 0.5, 0.3] });
      M.box(cr, -840, 36, z - 1.5, -775, 39, z + 1.5, { c: [0.8, 0.5, 0.3] });
    }
    // Harlem / Upper Manhattan north of the playable edge
    const hb = M.buf("concrete_dark", 0, -1100, "far");
    M.box(hb, -345, -8, -1400, 345, 0.02, -1000, {
      s: 6,
      c: [0.72, 0.72, 0.68],
      skip: 8 + 16,
    });
    for (let x = -330; x < 330; x += r.range(20, 34)) {
      for (let z = -1400; z < -1030; z += r.range(40, 70)) {
        if (Math.abs(x) < 115 && z > -1200) continue; // the park continues north (ridge)
        const w = r.range(14, 28),
          d = r.range(14, 30),
          h = r.range(14, 55);
        const st = styles[r.int(0, 1)],
          v = r.int(1, 3);
        farBlock(
          M.buf("facade/" + st + "/" + v, x, z, "far"),
          hb,
          x,
          z,
          x + w,
          z + d,
          h,
          st,
          v,
        );
      }
    }
    // Queens / Long Island City across the East River
    const qb = M.buf("concrete_dark", 1000, -300, "far");
    M.box(qb, 840, -8, -1200, 1300, 0.3, 380, { s: 6, c: [0.7, 0.7, 0.66] });
    for (let z = -1150; z < 360; z += r.range(26, 44)) {
      const w = r.range(20, 40),
        d = r.range(18, 36),
        h = z > -500 && z < 0 ? r.range(20, 90) : r.range(10, 35);
      const x0 = 870 + r.range(0, 60);
      farBlock(
        M.buf("facade/warehouse/" + r.int(1, 2), 1000, z, "far"),
        qb,
        x0,
        z,
        x0 + w,
        z + d,
        h,
        "warehouse",
        1,
      );
    }
    // Brooklyn beyond the playable edge
    const bb = M.buf("concrete_dark", 1000, 700, "far");
    M.box(bb, 800, -8, 380, 1300, 0.01, 1300, {
      s: 6,
      c: [0.7, 0.7, 0.66],
      skip: 8,
    });
    for (let x = 840; x < 1280; x += r.range(26, 44))
      for (let z = 400; z < 1280; z += r.range(30, 60)) {
        const w = r.range(18, 34),
          d = r.range(18, 34),
          h = r.range(8, 40);
        const st = r() < 0.6 ? "warehouse" : "apartment";
        farBlock(
          M.buf("facade/" + st + "/1", x, z, "far"),
          bb,
          x,
          z,
          x + w,
          z + d,
          h,
          st,
          1,
        );
      }
    // Staten Island / Bayonne low silhouette to the south
    const sb = M.buf("concrete_dark", -300, 1700, "far");
    M.box(sb, -1100, -8, 1650, 600, 0.5, 1900, { s: 6, c: [0.6, 0.6, 0.55] });
    for (let x = -1050; x < 580; x += r.range(40, 90))
      farBlock(
        M.buf("facade/warehouse/2", x, 1700, "far"),
        sb,
        x,
        1665,
        x + r.range(20, 40),
        1700,
        r.range(6, 22),
        "warehouse",
        2,
      );
  }

  // -------------------------------------------------------------------
  // World edges: impassable debris barricades (north edge & Brooklyn east)
  // -------------------------------------------------------------------
  function rubbleWall(ax, az, bx, bz, h, seed) {
    const r = M.rng(seed);
    const len = Math.hypot(bx - ax, bz - az),
      ux = (bx - ax) / len,
      uz = (bz - az) / len;
    for (let t = 0; t < len; t += 2.2) {
      const x = ax + ux * t + (r() - 0.5) * 3,
        z = az + uz * t + (r() - 0.5) * 3;
      const k = r();
      const key =
        k < 0.45
          ? "rubble"
          : k < 0.7
            ? "concrete"
            : k < 0.85
              ? "brick_red"
              : "rust";
      const b = M.buf(key, x, z);
      const s = r.range(1.2, 3.2);
      M.obox(
        b,
        x,
        r.range(0, h * 0.6),
        z,
        s * r.range(1, 2.2),
        s * r.range(0.6, 1.5),
        s * r.range(0.8, 1.8),
        r() * 6,
        {
          pitch: (r() - 0.5) * 0.8,
          roll: (r() - 0.5) * 0.8,
          s: 3,
          c: M.mulc([0.8, 0.78, 0.74], r.range(0.7, 1.05)),
        },
      );
      if (r() < 0.25) {
        const bg = M.buf("rust", x, z);
        M.beam(
          bg,
          x,
          0,
          z,
          x + (r() - 0.5) * 6,
          h + r() * 3,
          z + (r() - 0.5) * 4,
          0.35,
          0.5,
          { c: [0.8, 0.7, 0.6] },
        );
      }
    }
    // mound
    const bm = M.buf("rubble", (ax + bx) / 2, (az + bz) / 2);
    const nseg = Math.ceil(len / 20);
    for (let s = 0; s < nseg; s++) {
      const t0 = (s * len) / nseg,
        t1 = ((s + 1) * len) / nseg;
      const px = -uz,
        pz = ux;
      const P = (t, off, y) => [
        ax + ux * t + px * off,
        y,
        az + uz * t + pz * off,
      ];
      M.quad(
        bm,
        P(t0, -5, 0),
        P(t1, -5, 0),
        P(t1, 0, h * 0.7),
        P(t0, 0, h * 0.7),
        [-px, 0.6, -pz],
        [t0 / 3, 0, t1 / 3, 0, t1 / 3, 2, t0 / 3, 2],
        [0.7, 0.68, 0.64],
      );
      M.quad(
        bm,
        P(t0, 5, 0),
        P(t1, 5, 0),
        P(t1, 0, h * 0.7),
        P(t0, 0, h * 0.7),
        [px, 0.6, pz],
        [t0 / 3, 0, t1 / 3, 0, t1 / 3, 2, t0 / 3, 2],
        [0.7, 0.68, 0.64],
      );
    }
    M.ocol(
      (ax + bx) / 2,
      (az + bz) / 2,
      len,
      6,
      -1,
      h + 2,
      Math.atan2(-uz, ux),
      { tag: "barrier", walkable: false, surface: "rubble" },
    );
  }
  function buildWorldEdges() {
    const L = G.LAYOUT;
    // north edge across Manhattan except the park (park gets its own ridge in the park builder)
    rubbleWall(-330, -995, L.PARK.x0 - 2, -995, 5, "edgeNW");
    rubbleWall(L.PARK.x1 + 2, -995, 330, -995, 5, "edgeNE");
    // Brooklyn east edge
    rubbleWall(803, 385, 803, 978, 5, "edgeBK");
  }
  M.rubbleWall = rubbleWall;
})();
