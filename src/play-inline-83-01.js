// play-inline-83 01 — math
// Lines 1-2333 of readable/play-inline-83.pretty.js (statement-aligned).
/* src/map/30_park.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 30 CENTRAL PARK
 * Rolling terrain (precomputed 2 m heightfield → G.world.terrainHeight),
 * The Lake & Reservoir (shallow irradiated water), the park drives, the
 * Mall with its dead elms, paths, dead trees (8 procedural variants),
 * Manhattan-schist outcrops, cast-iron lamp posts, benches, the perimeter
 * stone wall with entrances, the 79th St transverse with retaining walls,
 * the reservoir embankment/fence/gatehouse and the North Woods ridge.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;
  const RC = M.RC;
  RC.PARKPATH = 8;

  const U = () => G.util;
  let PH = null; // heightfield {x0, z0, step, nx, nz, h}
  // The park drive loop (East / West Drive) — shared by the height model (flattened) and the path builder
  const DRIVE = [
    [-60, -421],
    [-80, -470],
    [-88, -560],
    [-92, -640],
    [-90, -700],
    [-88, -752],
    [-86, -768],
    [-90, -820],
    [-100, -905],
    [-86, -960],
    [-40, -985],
    [20, -985],
    [70, -962],
    [92, -900],
    [96, -815],
    [90, -768],
    [88, -752],
    [96, -700],
    [98, -640],
    [96, -560],
    [80, -470],
    [60, -421],
  ];
  function driveDist(x, z) {
    let d = 1e9;
    for (let i = 0; i < DRIVE.length - 1; i++)
      d = Math.min(
        d,
        G.LAYOUT.distToSeg(
          x,
          z,
          DRIVE[i][0],
          DRIVE[i][1],
          DRIVE[i + 1][0],
          DRIVE[i + 1][1],
        ),
      );
    return d;
  }

  // -------------------------------------------------------------------
  // Height model
  // -------------------------------------------------------------------
  function rectDist(x, z, r) {
    const dx = Math.max(r.x0 - x, 0, x - r.x1),
      dz = Math.max(r.z0 - z, 0, z - r.z1);
    return Math.hypot(dx, dz);
  }
  /** Signed distance to a rounded rect (negative inside). */
  function sdRoundRect(x, z, r, rds) {
    const cx = (r.x0 + r.x1) / 2,
      cz = (r.z0 + r.z1) / 2;
    const hx = (r.x1 - r.x0) / 2 - rds,
      hz = (r.z1 - r.z0) / 2 - rds;
    const qx = Math.abs(x - cx) - hx,
      qz = Math.abs(z - cz) - hz;
    return (
      Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) +
      Math.min(Math.max(qx, qz), 0) -
      rds
    );
  }
  function lakeSD(x, z) {
    const F = G.LAYOUT.PARK_FEATURES;
    return (
      sdRoundRect(x, z, F.lake, 14) +
      (U().fbm2(x * 0.03 + 5, z * 0.03 - 2, 3) - 0.5) * 16
    );
  }
  function resSD(x, z) {
    const F = G.LAYOUT.PARK_FEATURES;
    return sdRoundRect(x, z, F.reservoir, 30);
  }
  M.lakeSD = lakeSD;
  M.resSD = resSD;
  let PARK_SITES = null;
  // keep-clear boxes for trees / deadfall / decals. Met west lawn: landmarks_b's Temple of Dendur breach
  // (rubble ramp reaches x≈49.5) must stay visible and walkable from the park.
  M.parkExcl = [{ x0: 36, x1: 57, z0: -705, z1: -605 }];
  const inExcl = (x, z, pad) => {
    pad = pad || 0;
    return M.parkExcl.some(
      (e) =>
        x > e.x0 - pad && x < e.x1 + pad && z > e.z0 - pad && z < e.z1 + pad,
    );
  };
  function rawHeight(x, z) {
    const L = G.LAYOUT,
      P = L.PARK,
      F = L.PARK_FEATURES;
    const u = U();
    const de = Math.min(x - P.x0, P.x1 - x, z - P.z0, P.z1 - z);
    let amp = 6.5;
    if (z < -915) amp = 9.5; // North Woods: rugged
    const sm = F.sheepMeadow;
    if (x > sm.x0 - 10 && x < sm.x1 + 10 && z > sm.z0 - 10 && z < sm.z1 + 10)
      amp = 1.2;
    if (x > -10 && x < 70 && z > -755 && z < -712) amp = 1.0; // Great Lawn
    let h =
      Math.max(0, u.fbm2(x * 0.012 + 3.1, z * 0.012 - 7.3, 4) - 0.43) *
      amp *
      2.2;
    h += (u.noise2(x * 0.08, z * 0.08) - 0.5) * 0.35; // micro undulation
    // The Ramble: rocky knolls north of the lake
    if (x > -75 && x < 25 && z > -690 && z < -650)
      h += Math.max(0, u.fbm2(x * 0.05, z * 0.05, 3) - 0.35) * 5;
    let mask = M.smooth(0, 24, de);
    if (!PARK_SITES)
      PARK_SITES = L.SITES.filter((s) =>
        L.inPark((s.x0 + s.x1) / 2, (s.z0 + s.z1) / 2),
      );
    for (const s of PARK_SITES) {
      if (x < s.x0 - 16 || x > s.x1 + 16 || z < s.z0 - 16 || z > s.z1 + 16)
        continue;
      mask *= M.smooth(3, 16, rectDist(x, z, s));
    }
    // map set pieces (31_parkpieces.js: Rotorcraft crash, Needle, Bandshell, Carousel, playground) sit on level ground
    for (const k in M.PARK_PIECES || {}) {
      const s = M.PARK_PIECES[k];
      if (x > s.x0 - 14 && x < s.x1 + 14 && z > s.z0 - 14 && z < s.z1 + 14)
        mask *= M.smooth(1, 12, rectDist(x, z, s));
    }
    mask *= M.smooth(7, 18, Math.abs(z + 760)); // transverse
    if (Math.abs(x) > 44 || z > -440 || z < -965)
      mask *= M.smooth(5, 16, driveDist(x, z)); // keep the drives level
    mask *= M.smooth(5, 14, Math.abs(x) + (z > -540 && z < -460 ? 0 : 99)); // the Mall axis
    h *= mask;
    // lake
    const lk = F.lake;
    const ld =
      x > lk.x0 - 30 && x < lk.x1 + 30 && z > lk.z0 - 30 && z < lk.z1 + 30
        ? lakeSD(x, z)
        : 99;
    if (ld < 10) {
      // bowl: a muddy bank (the water sank over 22 neglected years) then the lake at the core water level (-1.2):
      // wading near the shore, swimming (core: bed < -2.4) in the middle
      h =
        ld < 0
          ? Math.max(-3.6, ld * 0.3 - 0.25)
          : M.lerp(-0.25, h, M.smooth(0, 10, ld));
    }
    // reservoir: stone-lined basin
    const rv = F.reservoir;
    const rd =
      x > rv.x0 - 16 && x < rv.x1 + 16 && z > rv.z0 - 16 && z < rv.z1 + 16
        ? resSD(x, z)
        : 99;
    if (rd < 14) {
      if (rd < 0) h = rd < -3 ? -3.8 : M.lerp(-0.1, -3.8, M.smooth(0, 3, -rd));
      else h = M.lerp(0, h, M.smooth(6, 14, rd));
    }
    return h;
  }
  function buildHeightfield() {
    const P = G.LAYOUT.PARK;
    const step = 2,
      x0 = P.x0,
      z0 = P.z0;
    const nx = Math.round((P.x1 - P.x0) / step) + 1,
      nz = Math.round((P.z1 - P.z0) / step) + 1;
    const h = new Float32Array(nx * nz);
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++)
        h[j * nx + i] = rawHeight(x0 + i * step, z0 + j * step);
    // edges exactly 0 (matches the surrounding sidewalks/roads)
    for (let i = 0; i < nx; i++) {
      h[i] = 0;
      h[(nz - 1) * nx + i] = 0;
    }
    for (let j = 0; j < nz; j++) {
      h[j * nx] = 0;
      h[j * nx + nx - 1] = 0;
    }
    PH = { x0, z0, step, nx, nz, h };
    M.parkHF = PH;
  }
  /** Bilinear park height. */
  M.parkHeight = function (x, z) {
    if (!PH) return 0;
    let fx = (x - PH.x0) / PH.step,
      fz = (z - PH.z0) / PH.step;
    if (fx < 0) fx = 0;
    if (fz < 0) fz = 0;
    if (fx > PH.nx - 1.001) fx = PH.nx - 1.001;
    if (fz > PH.nz - 1.001) fz = PH.nz - 1.001;
    const i = Math.floor(fx),
      j = Math.floor(fz),
      tx = fx - i,
      tz = fz - j;
    const k = j * PH.nx + i,
      H = PH.h;
    return (
      (H[k] * (1 - tx) + H[k + 1] * tx) * (1 - tz) +
      (H[k + PH.nx] * (1 - tx) + H[k + PH.nx + 1] * tx) * tz
    );
  };
  M.parkSurface = function (x, z) {
    if (M.parkHeight(x, z) < M.LAKE_Y - 0.05) return "water";
    return M.rasterAt(x, z) === RC.PARKPATH ? "dirt" : "grass";
  };
  function slopeAt(x, z) {
    const e = 1.5;
    return (
      Math.hypot(
        M.parkHeight(x + e, z) - M.parkHeight(x - e, z),
        M.parkHeight(x, z + e) - M.parkHeight(x, z - e),
      ) /
      (2 * e)
    );
  }

  // -------------------------------------------------------------------
  // Terrain mesh (per 120 m chunk, shared grid → seamless)
  // -------------------------------------------------------------------
  function buildTerrainMesh() {
    const u = U();
    const C0 = [0.86, 0.82, 0.62],
      C_DRY = [0.95, 0.86, 0.6],
      C_DIRT = [0.72, 0.6, 0.45],
      C_ROCK = [0.66, 0.66, 0.62],
      C_MUD = [0.42, 0.44, 0.32];
    let slopeOverride = -1;
    const colAt = (x, z, h) => {
      const n = u.fbm2(x * 0.04, z * 0.04, 3),
        n2 = u.noise2(x * 0.25, z * 0.25);
      let c = M.mixc(C0, C_DRY, M.smooth(0.45, 0.7, n));
      c = M.mixc(
        c,
        C_DIRT,
        M.smooth(0.55, 0.8, u.noise2(x * 0.02 + 9, z * 0.02 - 3)) * 0.8,
      );
      const sl = slopeOverride >= 0 ? slopeOverride : slopeAt(x, z);
      c = M.mixc(c, C_ROCK, M.smooth(0.35, 0.75, sl));
      if (h < 0.1) c = M.mixc(c, C_MUD, M.smooth(0.1, -0.8, h));
      return M.mulc(c, 0.85 + n2 * 0.25);
    };
    const nx = PH.nx,
      nz = PH.nz,
      st = PH.step;
    const CH = M.CHUNK;
    // iterate chunks
    const cx0 = Math.floor(PH.x0 / CH),
      cx1 = Math.floor((PH.x0 + (nx - 1) * st) / CH);
    const cz0 = Math.floor(PH.z0 / CH),
      cz1 = Math.floor((PH.z0 + (nz - 1) * st) / CH);
    for (let cz = cz0; cz <= cz1; cz++)
      for (let cx = cx0; cx <= cx1; cx++) {
        const i0 = Math.max(0, Math.floor((cx * CH - PH.x0) / st)),
          i1 = Math.min(nx - 1, Math.ceil(((cx + 1) * CH - PH.x0) / st));
        const j0 = Math.max(0, Math.floor((cz * CH - PH.z0) / st)),
          j1 = Math.min(nz - 1, Math.ceil(((cz + 1) * CH - PH.z0) / st));
        if (i1 <= i0 || j1 <= j0) continue;
        const b = M.buf(
          "grass_dead",
          (cx + 0.5) * CH,
          (cz + 0.5) * CH,
          "always",
        );
        const w = i1 - i0 + 1;
        b.reserve(w * (j1 - j0 + 1), (i1 - i0) * (j1 - j0) * 6);
        const base = b.vn;
        const s = M.sc("grass_dead");
        for (let j = j0; j <= j1; j++)
          for (let i = i0; i <= i1; i++) {
            const x = PH.x0 + i * st,
              z = PH.z0 + j * st,
              h = PH.h[j * nx + i];
            const hl = PH.h[j * nx + Math.max(0, i - 1)],
              hr = PH.h[j * nx + Math.min(nx - 1, i + 1)];
            const hd = PH.h[Math.max(0, j - 1) * nx + i],
              hu = PH.h[Math.min(nz - 1, j + 1) * nx + i];
            const ndx = (hl - hr) / (2 * st),
              ndz = (hd - hu) / (2 * st),
              nl = Math.hypot(ndx, 1, ndz);
            slopeOverride = Math.hypot(hl - hr, hd - hu) / (2 * st);
            const c = colAt(x, z, h);
            b.v(
              x,
              h,
              z,
              ndx / nl,
              1 / nl,
              ndz / nl,
              x / s,
              z / s,
              c[0],
              c[1],
              c[2],
            );
          }
        for (let j = 0; j < j1 - j0; j++)
          for (let i = 0; i < i1 - i0; i++) {
            const a = base + j * w + i,
              bb = a + 1,
              c = a + w,
              d = c + 1;
            // faces up: (a, c, bb) winding check: a(x,z) c(x,z+st) bb(x+st,z) → cross>0? use consistent CCW-from-above
            b.tri(a, c, bb);
            b.tri(bb, c, d);
          }
      }
  }

  // -------------------------------------------------------------------
  // Water surfaces (lake & reservoir)
  // -------------------------------------------------------------------
  function buildWater() {
    const F = G.LAYOUT.PARK_FEATURES;
    for (const r of [F.lake, F.reservoir]) {
      const pad = 14;
      const b = M.buf(
        "water@gloss",
        (r.x0 + r.x1) / 2,
        (r.z0 + r.z1) / 2,
        "always",
      );
      // the atmosphere's world water plane (same y) also covers the park: sit 3 cm under it so the two coplanar
      // surfaces never z-fight (the stair-stepped seam across The Lake); without atmosphere this sheet is the water
      const wy = G.isStub("atmos") ? M.LAKE_Y : M.LAKE_Y - 0.03;
      M.poly(
        b,
        [
          [r.x0 - pad, r.z0 - pad],
          [r.x1 + pad, r.z0 - pad],
          [r.x1 + pad, r.z1 + pad],
          [r.x0 - pad, r.z1 + pad],
        ],
        wy,
        { s: 14, c: [0.7, 0.8, 0.62], convex: true },
      );
    }
    // floating scum & reeds at the lake margins
    const bd = M.buf("my/markings", F.lake.x0, F.lake.z0, "fine");
    const r = M.rng("lakescum");
    for (let k = 0; k < 40; k++) {
      const x = r.range(F.lake.x0, F.lake.x1),
        z = r.range(F.lake.z0, F.lake.z1);
      const d = lakeSD(x, z);
      if (d > -2 || d < -14) continue;
      M.decal(
        bd,
        x,
        M.LAKE_Y + 0.02,
        z,
        r.range(3, 8),
        r.range(3, 8),
        r() * 6,
        r() < 0.5 ? M.MARK.MOSS : M.MARK.LEAVES,
      );
    }
  }

  // -------------------------------------------------------------------
  // Paths (ribbons draped over the terrain)
  // -------------------------------------------------------------------
  function catmull(pts, spacing) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)],
        p1 = pts[i],
        p2 = pts[i + 1],
        p3 = pts[Math.min(pts.length - 1, i + 2)];
      const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      const n = Math.max(1, Math.ceil(len / spacing));
      for (let k = 0; k < n; k++) {
        const t = k / n,
          t2 = t * t,
          t3 = t2 * t;
        const f = (a, b, c, d) =>
          0.5 *
          (2 * b +
            (-a + c) * t +
            (2 * a - 5 * b + 4 * c - d) * t2 +
            (-a + 3 * b - 3 * c + d) * t3);
        out.push([
          f(p0[0], p1[0], p2[0], p3[0]),
          f(p0[1], p1[1], p2[1], p3[1]),
        ]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  M.catmull = catmull;
  M.parkPaths = [];
  function ribbon(pts, width, mat, col, o) {
    o = o || {};
    const sp = catmull(pts, 2.0);
    M.parkPaths.push({ pts: sp, width });
    const hw = width / 2;
    let run = 0;
    for (let i = 0; i < sp.length - 1; i++) {
      const a = sp[i],
        b = sp[i + 1];
      const pa = sp[Math.max(0, i - 1)],
        pb = sp[Math.min(sp.length - 1, i + 2)];
      const ta = [b[0] - pa[0], b[1] - pa[1]],
        tb = [pb[0] - a[0], pb[1] - a[1]];
      const la = Math.hypot(ta[0], ta[1]) || 1,
        lb = Math.hypot(tb[0], tb[1]) || 1;
      const na = [-ta[1] / la, ta[0] / la],
        nb = [-tb[1] / lb, tb[0] / lb];
      const seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const A0 = [a[0] - na[0] * hw, a[1] - na[1] * hw],
        A1 = [a[0] + na[0] * hw, a[1] + na[1] * hw];
      const B0 = [b[0] - nb[0] * hw, b[1] - nb[1] * hw],
        B1 = [b[0] + nb[0] * hw, b[1] + nb[1] * hw];
      const y = (p) =>
        Math.max(M.parkHeight(p[0], p[1]), M.LAKE_Y + 0.25) + 0.05;
      const buf = M.buf(mat, a[0], a[1]);
      const cc = M.mulc(col, 0.9 + M.hash(a[0], a[1], 2) * 0.15);
      M.quad(
        buf,
        [A0[0], y(A0), A0[1]],
        [A1[0], y(A1), A1[1]],
        [B1[0], y(B1), B1[1]],
        [B0[0], y(B0), B0[1]],
        [0, 1, 0],
        [
          0,
          run / 4,
          width / 4,
          run / 4,
          width / 4,
          (run + seg) / 4,
          0,
          (run + seg) / 4,
        ],
        cc,
      );
      // curb edging for the drives
      if (o.curb) {
        const bc = M.buf("granite", a[0], a[1], "detail");
        for (const [P0, P1] of [
          [A0, B0],
          [A1, B1],
        ])
          M.quad(
            bc,
            [P0[0], y(P0) - 0.1, P0[1]],
            [P1[0], y(P1) - 0.1, P1[1]],
            [P1[0], y(P1) + 0.12, P1[1]],
            [P0[0], y(P0) + 0.12, P0[1]],
            [0, 1, 0],
            [0, 0, seg / 2, 0, seg / 2, 0.1, 0, 0.1],
            [0.8, 0.78, 0.72],
          );
      }
      run += seg;
      // raster the path for footstep surface
      M.rasterPoly([A0, A1, B1, B0], RC.PARKPATH);
    }
    return sp;
  }
  function buildPaths() {
    const L = G.LAYOUT,
      P = L.PARK,
      F = L.PARK_FEATURES;
    const asphaltC = [0.8, 0.8, 0.78],
      dirtC = [0.85, 0.75, 0.6];
    // The park drive loop (East / West Drive)
    M.parkDrive = ribbon(DRIVE, 8, "asphalt@fwd", asphaltC, { curb: true });
    // The Mall (straight paved promenade to Bethesda Terrace)
    ribbon(
      [
        [0, -421],
        [0, -470],
        [0, -505],
        [0, -539],
      ],
      11,
      "sidewalk@fwd",
      [0.88, 0.85, 0.8],
    );
    // Lake loop
    const lk = F.lake;
    ribbon(
      [
        [lk.x0 - 12, lk.z1 + 8],
        [lk.x0 - 16, (lk.z0 + lk.z1) / 2],
        [lk.x0 - 8, lk.z0 - 12],
        [(lk.x0 + lk.x1) / 2, lk.z0 - 16],
        [lk.x1 + 12, lk.z0 - 8],
        [lk.x1 + 16, (lk.z0 + lk.z1) / 2],
        [lk.x1 + 8, lk.z1 + 10],
        [30, -560],
      ],
      3.5,
      "dirt@fwd",
      dirtC,
    );
    // Reservoir running track
    const rs = F.reservoir;
    ribbon(
      [
        [rs.x0 - 8, (rs.z0 + rs.z1) / 2],
        [rs.x0 - 4, rs.z0 - 6],
        [(rs.x0 + rs.x1) / 2, rs.z0 - 9],
        [rs.x1 + 4, rs.z0 - 6],
        [rs.x1 + 8, (rs.z0 + rs.z1) / 2],
        [rs.x1 + 4, rs.z1 + 7],
        [(rs.x0 + rs.x1) / 2, rs.z1 + 9],
        [rs.x0 - 4, rs.z1 + 7],
        [rs.x0 - 8, (rs.z0 + rs.z1) / 2],
      ],
      4,
      "dirt@fwd",
      [0.9, 0.72, 0.55],
    );
    // Ramble trails: the rocky knolls → lake shore, and → Belvedere → Great Lawn
    ribbon(
      [
        [-65, -709],
        [-57, -695],
        [-35, -670],
        [-40, -655],
      ],
      3,
      "dirt@fwd",
      dirtC,
    );
    ribbon(
      [
        [-57, -695],
        [-30, -680],
        [-5, -682],
        [20, -700],
        [40, -720],
        [60, -740],
      ],
      3,
      "dirt@fwd",
      dirtC,
    );
    // Bethesda Terrace ↔ east/west drive
    ribbon(
      [
        [-88, -560],
        [-60, -565],
        [-30, -562],
      ],
      3.5,
      "sidewalk@fwd",
      [0.85, 0.83, 0.78],
    );
    ribbon(
      [
        [30, -562],
        [60, -566],
        [96, -560],
      ],
      3.5,
      "sidewalk@fwd",
      [0.85, 0.83, 0.78],
    );
    // Sheep meadow edge path
    const sm = F.sheepMeadow;
    ribbon(
      [
        [sm.x0 - 6, sm.z1 + 6],
        [sm.x0 - 6, sm.z0 - 5],
        [sm.x1 + 6, sm.z0 - 5],
        [sm.x1 + 6, sm.z1 + 6],
        [sm.x0 - 6, sm.z1 + 6],
      ],
      3,
      "dirt@fwd",
      dirtC,
    );
    // North woods trails
    ribbon(
      [
        [-86, -960],
        [-60, -940],
        [-20, -950],
        [10, -930],
        [40, -950],
        [70, -962],
      ],
      2.5,
      "dirt@fwd",
      [0.75, 0.65, 0.5],
    );
    ribbon(
      [
        [-20, -950],
        [-30, -975],
        [-10, -990],
      ],
      2.5,
      "dirt@fwd",
      [0.75, 0.65, 0.5],
    );
    // Great lawn & Met link
    ribbon(
      [
        [60, -740],
        [90, -768],
      ],
      3,
      "dirt@fwd",
      dirtC,
    );
    ribbon(
      [
        [40, -720],
        [52, -690],
        [55, -650],
      ],
      3,
      "sidewalk@fwd",
      [0.85, 0.83, 0.78],
    );
    // Entrance paths from the avenues (street entrances)
    for (const z of [-455, -545, -635, -725, -815, -905]) {
      ribbon(
        [
          [P.x0, z],
          [P.x0 + 14, z + 3],
          [-86, z + 6],
        ],
        3,
        "sidewalk@fwd",
        [0.85, 0.83, 0.78],
      );
      ribbon(
        [
          [P.x1, z],
          [P.x1 - 14, z + 3],
          [92, z + 6],
        ],
        3,
        "sidewalk@fwd",
        [0.85, 0.83, 0.78],
      );
    }
    // Transverse road (asphalt)
    ribbon(
      [
        [P.x0, -760],
        [P.x1, -760],
      ],
      8,
      "asphalt@fwd",
      asphaltC,
    );
  }

  // -------------------------------------------------------------------
  // Dead trees — round 1 (fan-out): real tapered, gnarled stems instead of straight 4–7-sided beams
  //   * one continuous tube per limb (parallel-transported rings, 3–4 kinked sub-segments) → no square
  //     cross-sections, no gaps at the joints, crooked like long-dead elms and oaks
  //   * lobed root flare + surface roots, leaders that carry the stem on to a pointed tip, jagged snapped tops
  //   * a map-owned furrowed-bark atlas (`my/bark`, fissures + lichen, bump from the colour map) replaces
  //     the plank texture (`wood_rotten`) that made every tree read as a stack of boards
  //   * HLOD split: trunk + primary limbs in the 'mid' layer (900 m), secondary limbs & twigs in 'detail'
  //     (300 m) — distant trees keep their silhouette, only the near ones pay for the fine branching
  // -------------------------------------------------------------------
  const BARK_U = 0.7,
    BARK_V = 1.4; // metres per bark tile (around × along the stem)
  M.defineAtlas("bark", function () {
    const W = 256,
      H = 512,
      cv = M.canvas(W, H),
      ctx = cv.getContext("2d");
    const r = M.rng("barkatlas");
    const wrap = (fn) => {
      for (const ox of [-W, 0, W])
        for (const oy of [-H, 0, H]) {
          ctx.save();
          ctx.translate(ox, oy);
          fn();
          ctx.restore();
        }
    };
    ctx.fillStyle = "rgb(122,110,96)";
    ctx.fillRect(0, 0, W, H);
    // broad vertical tone streaks (sun-bleached / rain-darkened runs)
    for (let i = 0; i < 44; i++) {
      const x = r() * W,
        w = 5 + r() * 24,
        a = (0.05 + r() * 0.12).toFixed(2),
        light = r() < 0.5;
      wrap(() => {
        ctx.fillStyle =
          (light ? "rgba(196,186,170," : "rgba(42,36,30,") + a + ")";
        ctx.fillRect(x, 0, w, H);
      });
    }
    // bark plates between deep wandering vertical fissures (periodic in y → the tile repeats along the stem)
    const cols = 12;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let c = 0; c < cols; c++) {
      const x0 = ((c + r() * 0.6) * W) / cols,
        A = 2 + r() * 6,
        k = 1 + r.int(0, 2),
        ph = r() * 6.28,
        B = 1 + r() * 3,
        k2 = 3 + r.int(0, 3),
        ph2 = r() * 6.28;
      const X = (y) =>
        x0 +
        A * Math.sin((2 * Math.PI * k * y) / H + ph) +
        B * Math.sin((2 * Math.PI * k2 * y) / H + ph2);
      const w = 2.5 + r() * 4.5;
      wrap(() => {
        ctx.strokeStyle = "rgba(24,19,15,0.92)";
        ctx.lineWidth = w;
        ctx.beginPath();
        for (let y = 0; y <= H; y += 8) {
          const px = X(y);
          if (y === 0) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();
        ctx.strokeStyle = "rgba(206,196,178,0.2)";
        ctx.lineWidth = w * 0.45;
        ctx.beginPath();
        for (let y = 0; y <= H; y += 8) {
          const px = X(y) + w * 0.95;
          if (y === 0) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();
      });
    }
    // cross-checks splitting the plates, a few long diagonal splits
    for (let i = 0; i < 80; i++) {
      const x = r() * W,
        y = r() * H,
        l = 6 + r() * 16,
        lw = 1 + r() * 1.8,
        dy = (r() - 0.5) * 6;
      wrap(() => {
        ctx.strokeStyle = "rgba(30,24,19,0.75)";
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + l, y + dy);
        ctx.stroke();
      });
    }
    // bare, silver-grey wood where the bark has sloughed off; pale lichen rosettes; dark rot
    for (let i = 0; i < 14; i++) {
      const x = r() * W,
        y = r() * H,
        w = 8 + r() * 22,
        h = 30 + r() * 90;
      wrap(() => {
        ctx.fillStyle = "rgba(176,170,158,0.55)";
        ctx.beginPath();
        ctx.ellipse(x, y, w / 2, h / 2, 0, 0, 7);
        ctx.fill();
        ctx.strokeStyle = "rgba(120,112,100,0.5)";
        ctx.lineWidth = 1;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(x + (k * w) / 6, y - h / 2 + 4);
          ctx.lineTo(x + (k * w) / 6 + 1, y + h / 2 - 4);
          ctx.stroke();
        }
      });
    }
    for (let i = 0; i < 40; i++) {
      const x = r() * W,
        y = r() * H,
        rds = 2 + r() * 7,
        col =
          r() < 0.6
            ? "rgba(150,156,122,"
            : r() < 0.5
              ? "rgba(180,176,150,"
              : "rgba(46,40,30,";
      const a = (0.3 + r() * 0.4).toFixed(2);
      wrap(() => {
        ctx.fillStyle = col + a + ")";
        for (let k = 0; k < 4; k++) {
          ctx.beginPath();
          ctx.arc(
            x + (k - 1.5) * rds * 0.5,
            y + (((k * 7) % 3) - 1) * rds * 0.4,
            rds * (0.5 + (k % 2) * 0.3),
            0,
            7,
          );
          ctx.fill();
        }
      });
    }
    // fine grain noise
    const img = ctx.getImageData(0, 0, W, H),
      d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * 26;
      d[i] = M.clamp(d[i] + n, 0, 255);
      d[i + 1] = M.clamp(d[i + 1] + n, 0, 255);
      d[i + 2] = M.clamp(d[i + 2] + n * 0.9, 0, 255);
    }
    ctx.putImageData(img, 0, 0);
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    return { texture: t, roughness: 0.95, bump: 1.1 };
  });

  const v3n = (a) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  /**
   * Tube along the polyline P (radii R) with `seg` sides: parallel-transported frames (no twisting), bark UVs
   * in atlas units (u wraps an integer number of tiles around), per-ring colour cf(t), optional radial
   * modulation rmod(ringIndex, angle) (root flare lobes) and an optional jagged cap (snapped stems).
   */
  function tube(b, P, R, seg, cf, o) {
    o = o || {};
    const n = P.length;
    if (n < 2) return;
    const T = [];
    for (let i = 0; i < n; i++) {
      const a = P[Math.max(0, i - 1)],
        c = P[Math.min(n - 1, i + 1)];
      T.push(v3n([c[0] - a[0], c[1] - a[1], c[2] - a[2]]));
    }
    let Nv = v3n(cross(Math.abs(T[0][1]) < 0.95 ? [0, 1, 0] : [1, 0, 0], T[0]));
    const uRep = Math.max(1, Math.round((2 * Math.PI * R[0]) / BARK_U));
    b.reserve(
      n * (seg + 1) + (o.cap ? seg + 2 : 0),
      (n - 1) * seg * 6 + (o.cap ? seg * 3 : 0),
    );
    const base = b.vn;
    let vAcc = o.v0 || 0,
      lastBv = null;
    for (let i = 0; i < n; i++) {
      if (i > 0) {
        vAcc += Math.hypot(
          P[i][0] - P[i - 1][0],
          P[i][1] - P[i - 1][1],
          P[i][2] - P[i - 1][2],
        );
        const t = T[i],
          d = Nv[0] * t[0] + Nv[1] * t[1] + Nv[2] * t[2];
        Nv = v3n([Nv[0] - t[0] * d, Nv[1] - t[1] * d, Nv[2] - t[2] * d]);
      }
      const Bv = cross(T[i], Nv);
      lastBv = Bv;
      const c = cf(i / (n - 1));
      for (let k = 0; k <= seg; k++) {
        const a = (k / seg) * Math.PI * 2,
          ca = Math.cos(a),
          sa = Math.sin(a);
        const nx = Nv[0] * ca + Bv[0] * sa,
          ny = Nv[1] * ca + Bv[1] * sa,
          nz = Nv[2] * ca + Bv[2] * sa;
        const rr = R[i] * (o.rmod ? o.rmod(i, a) : 1);
        // lower half of every ring a touch darker (self-shadow under limbs), top catches the sky
        const sh = 0.86 + 0.14 * M.clamp(ny + 0.5, 0, 1);
        b.v(
          P[i][0] + nx * rr,
          P[i][1] + ny * rr,
          P[i][2] + nz * rr,
          nx,
          ny,
          nz,
          (k / seg) * uRep,
          vAcc / BARK_V,
          c[0] * sh,
          c[1] * sh,
          c[2] * sh,
        );
      }
    }
    for (let i = 0; i < n - 1; i++)
      for (let k = 0; k < seg; k++) {
        const a = base + i * (seg + 1) + k,
          a1 = a + 1,
          c = a + seg + 1,
          c1 = c + 1;
        b.tri(a, a1, c1);
        b.tri(a, c1, c);
      }
    if (o.cap) {
      // snapped end: pale splintered heartwood, ragged rim (each rim vertex pushed up or down the stem)
      const e = P[n - 1],
        t = T[n - 1],
        rr = R[n - 1],
        ctr = b.vn;
      const hc = [0.78, 0.68, 0.52];
      b.v(
        e[0] - t[0] * rr * 0.2,
        e[1] - t[1] * rr * 0.2,
        e[2] - t[2] * rr * 0.2,
        t[0],
        t[1],
        t[2],
        0.5,
        0.5,
        hc[0] * 0.8,
        hc[1] * 0.8,
        hc[2] * 0.8,
      );
      for (let k = 0; k <= seg; k++) {
        const a = (k / seg) * Math.PI * 2,
          ca = Math.cos(a),
          sa = Math.sin(a);
        const nx = Nv[0] * ca + lastBv[0] * sa,
          ny = Nv[1] * ca + lastBv[1] * sa,
          nz = Nv[2] * ca + lastBv[2] * sa;
        const j = (k % seg === 0 ? 0 : ((k * 7919) % 5) / 4 - 0.5) * rr * 1.6;
        b.v(
          e[0] + nx * rr * 0.97 + t[0] * j,
          e[1] + ny * rr * 0.97 + t[1] * j,
          e[2] + nz * rr * 0.97 + t[2] * j,
          t[0],
          t[1],
          t[2],
          0.5 + ca * 0.1,
          0.5 + sa * 0.1,
          hc[0],
          hc[1],
          hc[2],
        );
      }
      for (let k = 0; k < seg; k++) b.tri(ctr, ctr + 1 + k, ctr + 2 + k);
    }
  }

  function makeTree(seed, kind) {
    const r = M.rng("tree" + seed);
    const bM = new M.GeoBuf(),
      bF = new M.GeoBuf();
    // per-template bark tone: grey-brown dead elm … bleached silver … darker, damp oak
    const tone = r.pick([
      [1, 1, 1],
      [1.06, 1.05, 1.04],
      [0.9, 0.86, 0.82],
      [1.02, 0.98, 0.9],
    ]);
    const BARK_D = M.mulc([0.52, 0.47, 0.41], tone[0]),
      BARK = M.mulc([0.8, 0.74, 0.66], tone[1]),
      BLEACH = M.mulc([0.94, 0.92, 0.88], tone[2]);
    const MOSS = [0.46, 0.5, 0.36];
    const colFor = (depth) => (t) => {
      const k = M.clamp((depth + t) / 3, 0, 1);
      return k < 0.4
        ? M.mixc(BARK_D, BARK, k / 0.4)
        : M.mixc(BARK, BLEACH, (k - 0.4) / 0.6);
    };
    const maxDepth =
      kind === "tall" ? 3 : kind === "sapling" || kind === "shrub" ? 1 : 2;
    const weeping = kind === "weeping";
    /** Kinked polyline from p along d: the first sub-segment keeps the heading, later ones wander. */
    function wander(p, d, len, nSub, gnarl, bias) {
      const P = [p.slice()];
      let dd = d.slice();
      for (let s = 1; s <= nSub; s++) {
        if (s > 1)
          dd = v3n([
            dd[0] + (r() - 0.5) * gnarl,
            dd[1] + (r() - 0.5) * gnarl * 0.6 + bias,
            dd[2] + (r() - 0.5) * gnarl,
          ]);
        const q = P[P.length - 1],
          l = (len / nSub) * (0.8 + r() * 0.4);
        P.push([q[0] + dd[0] * l, q[1] + dd[1] * l, q[2] + dd[2] * l]);
      }
      return P;
    }
    function at(P, R, t) {
      const f = t * (P.length - 1),
        i = Math.min(P.length - 2, Math.floor(f)),
        k = f - i;
      const a = P[i],
        c = P[i + 1];
      return {
        p: [
          a[0] + (c[0] - a[0]) * k,
          a[1] + (c[1] - a[1]) * k,
          a[2] + (c[2] - a[2]) * k,
        ],
        r: R[i] + (R[i + 1] - R[i]) * k,
        d: v3n([c[0] - a[0], c[1] - a[1], c[2] - a[2]]),
      };
    }
    function twig(p, d) {
      const P = wander(
        p,
        v3n([
          d[0] + (r() - 0.5) * 1.4,
          d[1] + r() * 0.8 - (weeping ? 0.9 : 0.1),
          d[2] + (r() - 0.5) * 1.4,
        ]),
        r.range(0.4, 1.0),
        2,
        1.1,
        0,
      );
      tube(bF, P, [0.028, 0.018, 0.006], 3, () => BLEACH);
    }
    /** One limb (and recursively its leader & side limbs). */
    function limb(p, d, len, rds, depth, o) {
      o = o || {};
      const terminal = depth >= maxDepth || rds < 0.03;
      const nSub = depth === 0 ? 3 : depth === 1 ? (len > 2.2 ? 3 : 2) : 2;
      const seg = depth === 0 ? 7 : depth === 1 ? 5 : depth === 2 ? 4 : 3;
      const gnarl =
        (depth === 0 ? 0.22 : 0.5) *
        (kind === "oak" ? 1.6 : kind === "tall" ? 0.7 : 1);
      const bias = weeping ? -0.16 * depth : depth > 0 ? 0.05 : 0;
      const P = o.P || wander(p, d, len, nSub, gnarl, bias);
      const tipK = terminal ? 0.12 : o.snap ? 0.85 : 0.5;
      const R = P.map(
        (_, i) => rds * (1 - (1 - tipK) * Math.pow(i / (P.length - 1), 0.9)),
      );
      const buf = depth >= 2 ? bF : bM;
      tube(buf, P, R, seg, o.cf || colFor(depth), {
        rmod: o.rmod,
        cap: !!o.snap,
        v0: o.v0,
      });
      if (o.snap) return { P, R };
      if (terminal) {
        const e = at(P, R, 1);
        const nt = depth >= 1 ? 1 : 0;
        for (let i = 0; i < nt; i++) twig(e.p, e.d);
        if (depth >= 1 && r() < 0.4) {
          const m = at(P, R, r.range(0.4, 0.8));
          twig(m.p, m.d);
        }
        return { P, R };
      }
      // leader: carries the stem on towards a tip (no blunt ends)
      const e = at(P, R, 1);
      limb(
        e.p,
        v3n([
          e.d[0] + (r() - 0.5) * 0.3,
          e.d[1] + (weeping ? -0.15 : 0.05),
          e.d[2] + (r() - 0.5) * 0.3,
        ]),
        len * r.range(0.45, 0.6),
        e.r * 0.95,
        depth + 1,
      );
      // side limbs
      const nSide =
        depth === 0
          ? r.int(2, 4)
          : kind === "tall" && depth === 2
            ? r.int(0, 1)
            : r.int(1, 2);
      for (let i = 0; i < nSide; i++) {
        const q = at(
          P,
          R,
          depth === 0 ? r.range(0.4, 0.9) : r.range(0.35, 0.9),
        );
        const ang = r() * Math.PI * 2;
        let nd = v3n([
          q.d[0] * 0.35 + Math.cos(ang) * r.range(0.55, 1.0),
          q.d[1] * 0.45 + r.range(0.1, 0.65) - (weeping ? 0.45 : 0),
          q.d[2] * 0.35 + Math.sin(ang) * r.range(0.55, 1.0),
        ]);
        limb(
          q.p,
          nd,
          len * r.range(0.4, 0.62),
          Math.min(q.r * 0.72, rds * r.range(0.42, 0.6)),
          depth + 1,
        );
      }
      return { P, R };
    }
    /** Lobed root flare on the first two rings of a trunk. */
    const flarePh = r() * 6;
    const flare = (i, a) =>
      i === 0
        ? 1.75 + 0.4 * Math.cos(5 * a + flarePh)
        : i === 1
          ? 1.12 + 0.08 * Math.cos(5 * a + flarePh)
          : 1;
    const baseCol = (t) =>
      M.mixc(
        M.mixc(BARK_D, MOSS, 0.35 * (1 - M.smooth(0, 0.35, t))),
        BARK,
        M.smooth(0.2, 1, t) * 0.6,
      );
    function roots(rds, n) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + r() * 0.8,
          l = r.range(0.9, 1.8) * rds * 4;
        const P = [
          [Math.cos(a) * rds * 0.6, 0.35, Math.sin(a) * rds * 0.6],
          [
            Math.cos(a) * (rds + l * 0.45),
            0.05,
            Math.sin(a) * (rds + l * 0.45),
          ],
          [Math.cos(a + 0.2) * (rds + l), -0.18, Math.sin(a + 0.2) * (rds + l)],
        ];
        tube(bM, P, [rds * 0.45, rds * 0.26, rds * 0.08], 4, () => BARK_D);
      }
    }
    /** Trunk: short flared foot + a wandering bole. */
    function trunk(rds, h, lean, o) {
      o = o || {};
      const d0 = v3n([lean[0], 1, lean[1]]);
      const P = [
        [0, -0.3, 0],
        [d0[0] * 0.3, 0.35, d0[2] * 0.3],
      ];
      const rest = wander(
        P[1],
        d0,
        h - 0.6,
        o.nSub || 3,
        0.22 * (o.gnarl || 1),
        0,
      );
      for (let i = 1; i < rest.length; i++) P.push(rest[i]);
      return P;
    }

    if (kind === "shrub") {
      // dead thicket: a low cluster of twiggy stems
      const n = r.int(6, 10);
      for (let i = 0; i < n; i++) {
        const a = r() * Math.PI * 2,
          dd = r.range(0, 0.5);
        limb(
          [Math.cos(a) * dd, -0.05, Math.sin(a) * dd],
          v3n([
            Math.cos(a) * r.range(0.2, 0.6),
            1,
            Math.sin(a) * r.range(0.2, 0.6),
          ]),
          r.range(0.8, 1.7),
          0.04,
          1,
        );
      }
    } else if (kind === "oak") {
      // gnarled old oak: short, very thick bole, heavy near-horizontal crooked limbs
      const h = r.range(2.2, 3.4),
        rds = 0.6;
      const P = trunk(rds, h, [r.range(-0.15, 0.15), r.range(-0.15, 0.15)], {
        nSub: 2,
        gnarl: 1.5,
      });
      limb(null, null, 0, rds, 0, { P, rmod: flare, cf: baseCol, snap: true });
      roots(rds, 5);
      const top = P[P.length - 1];
      const n = r.int(4, 6);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + r.range(-0.3, 0.3);
        const y0 = top[1] * r.range(0.72, 1);
        limb(
          [top[0] * 0.8, y0, top[2] * 0.8],
          v3n([Math.cos(a), r.range(0.15, 0.55), Math.sin(a)]),
          r.range(3, 5.5),
          0.3,
          1,
        );
      }
    } else if (kind === "fork") {
      // twin trunks splitting low (lightning-split)
      const rds = 0.38;
      const P = trunk(rds, 1.6, [0, 0], { nSub: 1 });
      limb(null, null, 0, rds, 0, { P, rmod: flare, cf: baseCol, snap: true });
      roots(rds, 4);
      const a = r() * Math.PI;
      for (const sgn of [-1, 1])
        limb(
          [0, 1.3, 0],
          v3n([Math.cos(a) * 0.4 * sgn, 1, Math.sin(a) * 0.4 * sgn]),
          r.range(4.5, 7),
          0.28,
          0,
        );
    } else if (kind === "broken") {
      // snapped trunk: splintered top, a couple of stubby limbs, the top lying at its foot
      const h = r.range(2.8, 4.6),
        rds = 0.36;
      const P = trunk(rds, h, [r.range(-0.1, 0.1), r.range(-0.1, 0.1)], {
        nSub: 3,
      });
      limb(null, null, 0, rds, 0, { P, rmod: flare, cf: baseCol, snap: true });
      roots(rds, 4);
      const e = P[P.length - 1];
      for (let i = 0; i < 5; i++) {
        const a = r() * 6;
        tube(
          bM,
          [
            [
              e[0] + Math.cos(a) * rds * 0.6,
              e[1] - 0.1,
              e[2] + Math.sin(a) * rds * 0.6,
            ],
            [
              e[0] + Math.cos(a) * rds * 0.5,
              e[1] + r.range(0.3, 1.0),
              e[2] + Math.sin(a) * rds * 0.5,
            ],
          ],
          [0.09, 0.006],
          3,
          () => [0.8, 0.7, 0.54],
        );
      } // splinters
      for (let i = 0; i < 2; i++) {
        const a = r() * 6;
        limb(
          [0, h * r.range(0.4, 0.8), 0],
          v3n([Math.cos(a), 0.6, Math.sin(a)]),
          r.range(1.2, 2.2),
          0.12,
          1,
        );
      }
      // the fallen crown: a log with a ragged butt and a few limbs stuck in the ground
      const a = r() * 6,
        fl = r.range(4, 6);
      const FP = [
        [Math.cos(a) * 0.8, 0.28, Math.sin(a) * 0.8],
        [Math.cos(a) * (fl * 0.5 + 0.8), 0.3, Math.sin(a) * (fl * 0.5 + 0.8)],
        [Math.cos(a) * (fl + 0.8), 0.22, Math.sin(a) * (fl + 0.8)],
      ];
      tube(bM, FP.slice().reverse(), [0.12, 0.2, 0.26], 7, colFor(1), {
        cap: true,
      });
      limb(
        [Math.cos(a) * (fl * 0.6), 0.3, Math.sin(a) * (fl * 0.6)],
        v3n([Math.cos(a + 0.8), 0.5, Math.sin(a + 0.8)]),
        2,
        0.1,
        1,
      );
    } else if (kind === "log") {
      const len = r.range(6, 9);
      const P = [
        [-len / 2 - 0.3, 0.4, 0],
        [-len / 4, 0.36, r.range(-0.2, 0.2)],
        [len / 4, 0.32, r.range(-0.3, 0.3)],
        [len / 2, 0.28, 0],
      ];
      // root plate end flares out (lobes), the snapped end is splintered
      tube(bM, P, [0.36, 0.33, 0.29, 0.25], 8, colFor(0.5), {
        rmod: (i, an) => (i === 0 ? 2.6 + 0.6 * Math.cos(5 * an + flarePh) : 1),
        cap: true,
      });
      for (let i = 0; i < 3; i++) {
        const x = r.range(-len / 2 + 1, len / 2);
        limb(
          [x, 0.45, 0],
          v3n([r.range(-0.6, 0.6), 1, r.range(-1, 1)]),
          r.range(1.2, 2.2),
          0.09,
          1,
        );
      }
    } else if (kind === "stump") {
      const h = r.range(0.8, 2.0),
        rds = 0.55;
      const P = [
        [0, -0.3, 0],
        [0, 0.35, 0],
        [r.range(-0.05, 0.05), h, r.range(-0.05, 0.05)],
      ];
      limb(null, null, 0, rds, 0, { P, rmod: flare, cf: baseCol, snap: true });
      roots(rds * 0.8, 4);
      limb([0, h * 0.6, 0], v3n([0.7, 1, 0.2]), 1.6, 0.1, 1);
    } else {
      const h =
        kind === "tall"
          ? r.range(7, 10)
          : kind === "sapling"
            ? r.range(2.5, 4)
            : r.range(4, 7);
      const lk = kind === "lean" ? 0.55 : 0.12;
      let lean = [r.range(-lk, lk), r.range(-lk, lk)];
      if (kind === "lean") {
        const a = r() * 6;
        lean = [Math.cos(a) * 0.5, Math.sin(a) * 0.5];
      }
      const rds = kind === "tall" ? 0.42 : kind === "sapling" ? 0.12 : 0.32;
      if (kind === "sapling")
        limb([0, -0.1, 0], v3n([lean[0], 1, lean[1]]), h, rds, 0);
      else {
        // bole to ~55 % of the height, then the crown limbs (leader + sides) from limb()
        const P = trunk(rds, h * 0.58, lean);
        const R = P.map((_, i) => rds * (1 - (0.35 * i) / (P.length - 1)));
        tube(bM, P, R, 8, baseCol, { rmod: flare });
        roots(rds, kind === "lean" ? 4 : 3);
        const top = at(P, R, 1);
        limb(top.p, top.d, h * 0.5, top.r, 0);
        // a couple of low, dead side limbs on the bole
        for (let i = 0; i < r.int(1, 2); i++) {
          const q = at(P, R, r.range(0.45, 0.85)),
            a = r() * 6;
          limb(
            q.p,
            v3n([Math.cos(a), r.range(0.2, 0.6), Math.sin(a)]),
            h * r.range(0.25, 0.4),
            q.r * 0.5,
            2,
          );
        }
      }
    }
    return { main: bM.toGeometry(), fine: bF.empty ? null : bF.toGeometry() };
  }
  let TREES = null;
  function treeSet() {
    if (TREES) return TREES;
    TREES = [];
    for (let i = 0; i < 5; i++) TREES.push(makeTree(i, "normal"));
    for (let i = 5; i < 8; i++) TREES.push(makeTree(i, "tall"));
    TREES.push(makeTree(9, "weeping"));
    TREES.push(makeTree(10, "log"));
    TREES.push(makeTree(11, "stump"));
    // 11.. : broken, lean, fork, oak ×2, sapling, shrub, broken, lean, shrub
    TREES.push(
      makeTree(12, "broken"),
      makeTree(13, "lean"),
      makeTree(14, "fork"),
      makeTree(15, "oak"),
      makeTree(16, "oak"),
      makeTree(17, "sapling"),
      makeTree(18, "shrub"),
      makeTree(19, "broken"),
      makeTree(20, "lean"),
      makeTree(21, "shrub"),
    );
    return TREES;
  }
  let TREE_GEOMS = null;
  /** Whole-tree geometries (main + fine merged) for callers that place a template themselves (interior planters). */
  function treeTemplates() {
    if (TREE_GEOMS) return TREE_GEOMS;
    TREE_GEOMS = treeSet().map((t) => {
      if (!t.fine) return t.main;
      try {
        const g = G.util.mergeGeometries([t.main, t.fine]);
        if (g) return g;
      } catch (e) {
        /* fall through */
      }
      return t.main;
    });
    return TREE_GEOMS;
  }
  M.treeTemplates = treeTemplates;
  M.treeSet = treeSet;
  /** Place a dead tree (variant index or random) at x,z; returns nothing. */
  const NO_COL = { 9: 1, 10: 1, 17: 1, 20: 1 };
  M.TREE_KINDS = {
    standing: [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 18, 19],
    log: 9,
    stump: 10,
    shrubs: [17, 20],
    broken: [11, 18],
    oak: [14, 15],
  };
  M.placeTree = function (x, z, variant, yaw, scale, layer) {
    const T = treeSet();
    const vi = variant % T.length;
    (M.treePos = M.treePos || []).push(x, z, scale || 1); // goggles world-map canopy dots (70_mapimage.js)
    const t = T[vi];
    const y = G.world.terrainHeight(x, z);
    const sc = scale || 1;
    // non-uniform scale & a slight random tilt: no two trees of one template read the same
    const h = M.hash(x, z, 31),
      h2 = M.hash(z, x, 37);
    const sxz = sc * (0.85 + h * 0.3),
      sy = sc * (0.85 + h2 * 0.35);
    const tilt = vi === 9 || vi === 10 ? 0 : (h - 0.5) * 0.14,
      tilt2 = vi === 9 || vi === 10 ? 0 : (h2 - 0.5) * 0.14;
    const m = M.mtx(x, y - 0.05, z, yaw, tilt, tilt2, [
      sxz,
      sy,
      sxz * (0.9 + h2 * 0.2),
    ]);
    // per-tree value jitter (bleached / sooty neighbours) through the vertex colours
    const k = 0.86 + M.hash(x * 1.7, z * 1.3, 41) * 0.26,
      tint = [k, k * (0.98 + h * 0.03), k * (0.95 + h2 * 0.06)];
    const cf = (X, Y, Z, i) => {
      const a = t._c || (t._c = t.main.attributes.color);
      return [a.getX(i) * tint[0], a.getY(i) * tint[1], a.getZ(i) * tint[2]];
    };
    M.geom(M.buf("my/bark", x, z, layer || "mid"), t.main, m, { cf });
    if (t.fine) {
      const cff = (X, Y, Z, i) => {
        const a = t._cf || (t._cf = t.fine.attributes.color);
        return [a.getX(i) * tint[0], a.getY(i) * tint[1], a.getZ(i) * tint[2]];
      };
      M.geom(M.buf("my/bark", x, z, "detail"), t.fine, m, { cf: cff });
    }
    if (!NO_COL[vi])
      M.ocol(x, z, 0.6 * sxz, 0.6 * sxz, y, y + 6, 0, {
        tag: "tree",
        surface: "wood",
      });
  };
  function nearPath(x, z, pad) {
    const code = M.rasterAt(x, z);
    if (code === RC.PARKPATH) return true;
    if (pad)
      for (const [dx, dz] of [
        [pad, 0],
        [-pad, 0],
        [0, pad],
        [0, -pad],
      ])
        if (M.rasterAt(x + dx, z + dz) === RC.PARKPATH) return true;
    return false;
  }
  M.nearParkPath = nearPath;
  function buildTrees() {
    const L = G.LAYOUT,
      P = L.PARK,
      F = L.PARK_FEATURES;
    const r = M.rng("parktrees");
    const T = treeSet();
    let placed = 0;
    // The Mall: two rows of dead elms each side
    // (the elm allée survives as a ragged double row: some snapped, some gone to stumps, one fallen across the lawn)
    for (let z = -428; z > -532; z -= 9)
      for (const x of [-9, -15, 9, 15]) {
        const k = r(),
          px = x + r.range(-1.1, 1.1),
          pz = z + r.range(-1.6, 1.6);
        if (k < 0.08) continue;
        const v =
          k < 0.16
            ? 10
            : k < 0.2
              ? 9
              : k < 0.32
                ? r.pick([11, 18])
                : k < 0.45
                  ? r.pick([12, 13, 19])
                  : 5 + (placed % 3);
        M.placeTree(px, pz, v, r() * 6, r.range(0.8, 1.2));
        placed++;
      }
    // scattered
    let tries = 0;
    while (placed < 560 && tries++ < 9000) {
      const x = r.range(P.x0 + 4, P.x1 - 4),
        z = r.range(P.z0 + 4, P.z1 - 4);
      const woods = z < -915,
        ramble = x > -75 && x < 25 && z > -690 && z < -650;
      const sm = F.sheepMeadow;
      const meadow =
        (x > sm.x0 && x < sm.x1 && z > sm.z0 && z < sm.z1) ||
        (x > -10 && x < 70 && z > -755 && z < -712);
      const dens = woods ? 1 : ramble ? 0.9 : meadow ? 0.04 : 0.35;
      if (r() > dens) continue;
      if (lakeSD(x, z) < 3 || resSD(x, z) < 10 || inExcl(x, z, 2.5)) continue;
      if (Math.abs(z + 760) < 9) continue;
      if (L.siteAt(x, z, 6)) continue;
      if (nearPath(x, z, 2.5)) continue;
      if (Math.abs(x) < 20 && z > -540) continue; // Mall corridor
      const k = r();
      const v =
        k < 0.07
          ? 9 + r.int(0, 1)
          : k < 0.2
            ? r.pick(M.TREE_KINDS.shrubs)
            : k < 0.3
              ? r.pick(M.TREE_KINDS.oak)
              : r.pick(M.TREE_KINDS.standing);
      M.placeTree(x, z, v, r() * 6, r.range(0.75, 1.35));
      // small groves: a sapling or thicket often grows at the foot of a big tree
      if (!woods && r() < 0.3) {
        const a = r() * 6,
          d = r.range(2.5, 5);
        const qx = x + Math.cos(a) * d,
          qz = z + Math.sin(a) * d;
        if (!nearPath(qx, qz, 2) && lakeSD(qx, qz) > 3)
          M.placeTree(
            qx,
            qz,
            r() < 0.5 ? 16 : r.pick(M.TREE_KINDS.shrubs),
            r() * 6,
            r.range(0.7, 1.1),
          );
      }
      placed++;
    }
    M.parkTreeCount = placed;
    void T;
  }

  // -------------------------------------------------------------------
  // Rock outcrops (Manhattan schist)
  // -------------------------------------------------------------------
  const rockGeoms = [];
  /**
   * Boulder template: an indexed sphere displaced by 3-D-ish fBm (smooth normals — no faceted "tent"
   * look), flattened into a slab like weathered, foliated schist, with a few sheared-off faces.
   */
  function rockGeom(seed) {
    if (rockGeoms[seed]) return rockGeoms[seed];
    const g = new THREE.SphereGeometry(1, 18, 12);
    const p = g.attributes.position;
    const r = M.rng("rock" + seed);
    const u = G.util;
    const ox = r() * 50,
      oz = r() * 50,
      oy = r() * 50;
    // 2 random cutting planes (sheared faces)
    const cuts = [0, 1].map(() => {
      const a = r() * 6.28,
        e = r.range(-0.3, 0.5);
      return [
        Math.cos(a) * Math.cos(e),
        Math.sin(e),
        Math.sin(a) * Math.cos(e),
        r.range(0.55, 0.8),
      ];
    });
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const n = u.fbm2(x * 1.4 + ox + y * 0.7, z * 1.4 + oz - y * 0.5, 4);
      const n2 = u.fbm2(x * 3.1 + oy, z * 3.1 + y * 2.3, 2);
      let f = 0.66 + n * 0.62 + (n2 - 0.5) * 0.14;
      x *= f;
      y *= f;
      z *= f;
      for (const c of cuts) {
        const d = x * c[0] + y * c[1] + z * c[2];
        if (d > c[3]) {
          const k = d - c[3];
          x -= c[0] * k;
          y -= c[1] * k;
          z -= c[2] * k;
        }
      }
      p.setXYZ(i, x * 1.05, Math.max(y * 0.88, -0.35), z);
    }
    g.computeVertexNormals();
    rockGeoms[seed] = g;
    return g;
  }
  M.rockGeom = rockGeom;
  /** Rock at x,z of size (sx,sy,sz) with collider. */
  M.placeRock = function (x, z, sx, sy, sz, yaw, seed, o) {
    o = o || {};
    const y =
      (o.y !== undefined ? o.y : G.world.terrainHeight(x, z)) - sy * 0.25;
    const tint =
      o.c || M.mulc([0.78, 0.76, 0.72], 0.85 + M.hash(x, z, 9) * 0.25);
    M.geom(
      M.buf("my/rock", x, z, o.layer || "main"),
      rockGeom(seed % 6),
      M.mtx(x, y, z, yaw, 0, 0, [sx, sy, sz]),
      {
        cf: (X, Y) =>
          M.mulc(tint, 0.75 + M.clamp((Y - y) / (sy * 1.2), 0, 1) * 0.35),
        us: Math.max(1.2, (sx + sz) / 4),
      },
    );
    if (!o.noCollide) {
      const cyaw = yaw;
      M.ocol(x, z, sx * 1.5, sz * 1.5, y, y + sy * 0.95, cyaw, {
        tag: "rock",
        surface: "concrete",
        walkable: sy < 1.4,
      });
    }
  };
  function buildRocks() {
    const L = G.LAYOUT,
      P = L.PARK;
    const r = M.rng("parkrocks");
    let n = 0,
      tries = 0;
    while (n < 70 && tries++ < 3000) {
      const x = r.range(P.x0 + 10, P.x1 - 10),
        z = r.range(P.z0 + 10, P.z1 - 10);
      if (
        lakeSD(x, z) < 4 ||
        resSD(x, z) < 12 ||
        L.siteAt(x, z, 8) ||
        nearPath(x, z, 3) ||
        Math.abs(z + 760) < 10 ||
        inExcl(x, z)
      )
        continue;
      if (Math.abs(x) < 20 && z > -540) continue;
      const sl = slopeAt(x, z);
      if (sl < 0.12 && r() < 0.75) continue; // prefer hillsides
      const s = r.range(1.5, 4.5);
      if (inExcl(x, z, s * 2.4)) continue; // the whole slab stays off the keep-clear boxes (set pieces, Met lawn)
      if (r() < 0.7)
        M.placeOutcrop(
          x,
          z,
          s * r.range(1.4, 2.4),
          s * r.range(0.45, 0.8),
          s * r.range(0.9, 1.4),
          r() * 6,
          n,
        );
      else
        M.placeRock(
          x,
          z,
          s * r.range(1, 1.8),
          s * r.range(0.5, 0.9),
          s,
          r() * 6,
          n,
        );
      if (r() < 0.6)
        M.placeRock(
          x + r.range(-3, 3),
          z + r.range(-3, 3),
          s * 0.5,
          s * 0.35,
          s * 0.6,
          r() * 6,
          n + 3,
          { noCollide: true },
        );
      n++;
    }
    // big glacier-polished whalebacks on the hillsides (Umpire Rock, Rat Rock, the Ramble)
    let big = 0;
    for (let k = 0; k < 800 && big < 14; k++) {
      const x = r.range(P.x0 + 16, P.x1 - 16),
        z = r.range(P.z0 + 16, P.z1 - 16);
      if (
        lakeSD(x, z) < 8 ||
        resSD(x, z) < 16 ||
        L.siteAt(x, z, 14) ||
        nearPath(x, z, 6) ||
        Math.abs(z + 760) < 16 ||
        inExcl(x, z)
      )
        continue;
      if (Math.abs(x) < 26 && z > -545) continue;
      if (slopeAt(x, z) < 0.08) continue;
      const s = r.range(4, 7.5);
      if (inExcl(x, z, s * 2.6)) continue;
      M.placeOutcrop(
        x,
        z,
        s * r.range(1.6, 2.6),
        s * r.range(0.35, 0.55),
        s * r.range(1.1, 1.6),
        r() * 6,
        big + 7,
      );
      big++;
    }
    // North ridge along the world edge (impassable)
    for (let x = P.x0 + 2; x < P.x1 - 2; x += 4.5) {
      const s = r.range(3, 6);
      M.placeRock(
        x,
        -997 + r.range(-1, 2),
        s * 1.3,
        s * r.range(1.1, 1.8),
        s,
        r() * 6,
        (x | 0) & 7,
        { noCollide: true },
      );
      if (r() < 0.4)
        M.placeTree(
          x + r.range(-2, 2),
          -990 + r.range(0, 4),
          r.int(0, 7),
          r() * 6,
          r.range(0.9, 1.3),
        );
    }
    M.ocol(0, -997, P.x1 - P.x0, 6, -2, 12, 0, {
      tag: "barrier",
      walkable: false,
      surface: "concrete",
    });
  }

  // -------------------------------------------------------------------
  // Lamps, benches, perimeter wall, transverse, reservoir furniture
  // -------------------------------------------------------------------
  function lamp(x, z, fallen) {
    const y = G.world.terrainHeight(x, z);
    const b = M.buf("metal_painted", x, z, "detail");
    const c = [0.35, 0.38, 0.36];
    if (fallen) {
      const a = M.hash(x, z, 5) * 6;
      M.pipe(
        b,
        x,
        y + 0.15,
        z,
        x + Math.cos(a) * 3.6,
        y + 0.2,
        z + Math.sin(a) * 3.6,
        0.07,
        6,
        { c },
      );
      M.cyl(b, x, y, z, 0.2, 0.16, 0.5, 8, { c, capTop: true });
      return;
    }
    M.cyl(b, x, y, z, 0.2, 0.15, 0.6, 8, { c, capTop: true }); // base
    M.cyl(b, x, y + 0.6, z, 0.08, 0.06, 3.0, 6, { c }); // post
    M.cyl(b, x, y + 3.55, z, 0.08, 0.22, 0.2, 8, { c }); // collar
    const bg = M.buf("glass_dirty", x, z, "detail");
    M.cyl(bg, x, y + 3.75, z, 0.22, 0.26, 0.55, 8, {
      c: [0.7, 0.72, 0.6],
      capTop: false,
    });
    M.cyl(b, x, y + 4.3, z, 0.3, 0.05, 0.25, 8, { c }); // cap
    M.box3(x - 0.15, y, z - 0.15, x + 0.15, y + 4.4, z + 0.15, {
      tag: "lamp",
      surface: "metal",
    });
  }
  M.parkLamp = lamp;
  function bench(x, z, yaw, broken) {
    const y = G.world.terrainHeight(x, z);
    const bw = M.buf("wood_planks", x, z, "detail"),
      bm = M.buf("metal_painted", x, z, "detail");
    M.setXF(M.mtx(x, y, z, yaw));
    const c = [0.7, 0.6, 0.5];
    for (let k = 0; k < 3; k++) {
      if (broken && k === 1) continue;
      M.box(bw, -0.9, 0.42, -0.25 + k * 0.17, 0.9, 0.46, -0.13 + k * 0.17, {
        s: 1,
        c,
      });
    }
    for (let k = 0; k < 2; k++)
      M.obox(bw, 0, 0.62 + k * 0.17, 0.3 + k * 0.05, 1.8, 0.1, 0.035, 0, {
        pitch: -0.2,
        s: 1,
        c,
      });
    for (const sx of [-0.8, 0.8]) {
      M.box(bm, sx - 0.03, 0, -0.25, sx + 0.03, 0.45, 0.25, {
        s: 1,
        c: [0.3, 0.3, 0.3],
      });
      M.obox(bm, sx, 0.62, 0.3, 0.05, 0.5, 0.05, 0, {
        pitch: -0.2,
        c: [0.3, 0.3, 0.3],
      });
    }
    M.setXF(null);
    M.ocol(x, z, 1.9, 0.7, y, y + 0.5, yaw, { tag: "bench", surface: "wood" });
  }
  M.parkBench = bench;
  function buildFurniture() {
    const L = G.LAYOUT,
      P = L.PARK,
      F = L.PARK_FEATURES;
    const r = M.rng("parkfurn");
    // lamps along paths (every ~32 m)
    for (const p of M.parkPaths) {
      let acc = 16;
      for (let i = 1; i < p.pts.length; i++) {
        const a = p.pts[i - 1],
          b = p.pts[i];
        acc += Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (acc < 32) continue;
        acc = 0;
        const dx = b[0] - a[0],
          dz = b[1] - a[1],
          l = Math.hypot(dx, dz) || 1;
        const side = (i % 2 ? 1 : -1) * (p.width / 2 + 0.8);
        const x = b[0] - (dz / l) * side,
          z = b[1] + (dx / l) * side;
        if (
          M.parkHeight(x, z) < M.LAKE_Y + 0.2 ||
          L.siteAt(x, z, 2) ||
          inExcl(x, z)
        )
          continue;
        lamp(x, z, r() < 0.15);
        if (r() < 0.3)
          bench(
            b[0] - (dz / l) * -side * 1.05,
            b[1] + (dx / l) * -side * 1.05,
            Math.atan2(-dx, -dz) + (side > 0 ? 0 : Math.PI),
            r() < 0.2,
          );
      }
    }
    // Mall benches
    for (let z = -432; z > -530; z -= 12) {
      bench(-6.3, z, -Math.PI / 2, r() < 0.2);
      bench(6.3, z, Math.PI / 2, r() < 0.2);
    }
  }

  function stoneWall(ax, az, bx, bz, h, gaps) {
    const len = Math.hypot(bx - ax, bz - az),
      ux = (bx - ax) / len,
      uz = (bz - az) / len;
    // compute spans excluding gaps (gaps as [t0,t1])
    gaps = (gaps || []).slice().sort((p, q) => p[0] - q[0]);
    const spans = [];
    let t = 0;
    for (const g of gaps) {
      if (g[0] > t) spans.push([t, g[0]]);
      t = Math.max(t, g[1]);
    }
    if (t < len) spans.push([t, len]);
    for (const [t0, t1] of spans) {
      const n = Math.max(1, Math.ceil((t1 - t0) / 30));
      for (let k = 0; k < n; k++) {
        const s0 = t0 + ((t1 - t0) * k) / n,
          s1 = t0 + ((t1 - t0) * (k + 1)) / n;
        const x0 = ax + ux * s0,
          z0 = az + uz * s0,
          x1 = ax + ux * s1,
          z1 = az + uz * s1;
        const mx = (x0 + x1) / 2,
          mz = (z0 + z1) / 2;
        const b = M.buf("granite", mx, mz);
        const yaw = Math.atan2(ux, uz);
        const hh = h * (0.9 + M.hash(mx, mz, 1) * 0.15);
        M.obox(b, mx, hh / 2 - 0.2, mz, 0.55, hh + 0.4, s1 - s0, yaw, {
          s: 1.6,
          cb: [0.62, 0.6, 0.55],
          ct: [0.85, 0.82, 0.76],
        });
        M.obox(b, mx, hh + 0.28, mz, 0.72, 0.16, s1 - s0, yaw, {
          s: 1.6,
          c: [0.9, 0.88, 0.82],
        }); // coping
        M.ocol(mx, mz, 0.6, s1 - s0, -0.5, hh + 0.35, yaw, {
          tag: "wall",
          surface: "concrete",
        });
      }
    }
  }
  M.stoneWall = stoneWall;
  function buildWalls() {
    const L = G.LAYOUT,
      P = L.PARK;
    const gapsAt = (zs, w) => zs.map((z) => [z - w / 2, z + w / 2]);
    const entranceZs = [-455, -545, -635, -725, -760, -815, -905];
    // west & east walls (run south→north; t measured from P.z1 going north)
    const toT = (z) => P.z1 - z;
    const g = entranceZs.map(toT).map((t) => [t - 5, t + 5]);
    g.push([P.z1 - -470 - 6, P.z1 - -470 + 6]); // drive entrances near 60th
    stoneWall(P.x0 + 0.4, P.z1, P.x0 + 0.4, P.z0 + 4, 1.0, g);
    stoneWall(P.x1 - 0.4, P.z1, P.x1 - 0.4, P.z0 + 4, 1.0, g);
    // south wall along 59th street with gates at the Mall, drives and avenues
    const sg = [
      [-60, -55],
      [-6, 6],
      [55, 60],
      [-45, -35],
      [35, 45],
    ].map(([a, b]) => [a - P.x0 - 4, b - P.x0 + 4]);
    stoneWall(P.x0 + 0.4, P.z1 - 0.4, P.x1 - 0.4, P.z1 - 0.4, 1.0, sg);
    // transverse retaining walls
    stoneWall(P.x0 + 1, -754.5, P.x1 - 1, -754.5, 1.3, [
      [20, 30],
      [104, 114],
      [190, 200],
    ]);
    stoneWall(P.x0 + 1, -765.5, P.x1 - 1, -765.5, 1.3, [
      [20, 30],
      [104, 114],
      [190, 200],
    ]);
  }

  function buildReservoir() {
    const F = G.LAYOUT.PARK_FEATURES,
      rs = F.reservoir;
    // embankment ring (stone face from basin bed to 0.9 m above ground) along the rounded rect
    const pts = [];
    const cx = (rs.x0 + rs.x1) / 2,
      cz = (rs.z0 + rs.z1) / 2,
      hx = (rs.x1 - rs.x0) / 2,
      hz = (rs.z1 - rs.z0) / 2,
      rds = 30;
    for (let q = 0; q < 4; q++) {
      const ccx = cx + (q === 0 || q === 3 ? hx - rds : -(hx - rds)),
        ccz = cz + (q < 2 ? hz - rds : -(hz - rds));
      const a0 = [0, Math.PI / 2, Math.PI, Math.PI * 1.5][q];
      for (let k = 0; k <= 6; k++) {
        const a = a0 + ((k / 6) * Math.PI) / 2;
        pts.push([
          ccx + Math.cos(a) * (rds + 0.5),
          ccz + Math.sin(a) * (rds + 0.5),
        ]);
      }
    }
    const b = M.buf("granite", cx, cz);
    M.polySides(b, pts, -3, 0.7, {
      s: 2,
      cb: [0.4, 0.42, 0.35],
      ct: [0.85, 0.83, 0.78],
      inward: true,
    });
    // top coping & iron fence with colliders
    const bf = M.buf("metal_painted", cx, cz, "detail");
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        c = pts[(i + 1) % pts.length];
      const l = Math.hypot(c[0] - a[0], c[1] - a[1]);
      if (l < 0.5) continue;
      const yaw = Math.atan2(c[0] - a[0], c[1] - a[1]);
      M.obox(
        M.buf("granite", a[0], a[1]),
        (a[0] + c[0]) / 2,
        0.8,
        (a[1] + c[1]) / 2,
        0.8,
        0.2,
        l,
        yaw,
        { s: 2, c: [0.9, 0.88, 0.84] },
      );
      M.beam(bf, a[0], 2.0, a[1], c[0], 2.0, c[1], 0.06, 0.06, {
        c: [0.3, 0.33, 0.3],
      });
      M.beam(bf, a[0], 1.1, a[1], c[0], 1.1, c[1], 0.05, 0.05, {
        c: [0.3, 0.33, 0.3],
      });
      const n = Math.max(1, Math.round(l / 0.35));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const px = a[0] + (c[0] - a[0]) * t,
          pz = a[1] + (c[1] - a[1]) * t;
        M.box(bf, px - 0.02, 0.9, pz - 0.02, px + 0.02, 2.15, pz + 0.02, {
          s: 1,
          c: [0.3, 0.33, 0.3],
          skip: 12,
        });
      }
      M.ocol((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, 0.4, l, -3, 2.2, yaw, {
        tag: "fence",
        surface: "metal",
      });
    }
    // south gatehouse (stone, slate roof)
    const gx = 40,
      gz = rs.z1 + 3;
    const bs = M.buf("stone_limestone", gx, gz);
    M.box(bs, gx - 6, 0, gz - 3, gx + 6, 6, gz + 4, {
      s: 2.5,
      c: [0.8, 0.78, 0.72],
    });
    M.box(bs, gx - 6.3, 6, gz - 3.3, gx + 6.3, 6.5, gz + 4.3, {
      s: 2.5,
      c: [0.9, 0.88, 0.82],
    });
    const br = M.buf("metal_painted", gx, gz);
    M.quad(
      br,
      [gx - 6.5, 6.5, gz - 3.5],
      [gx + 6.5, 6.5, gz - 3.5],
      [gx + 6.5, 9, gz + 0.5],
      [gx - 6.5, 9, gz + 0.5],
      [0, 0.8, -0.6],
      [0, 0, 5, 0, 5, 1, 0, 1],
      [0.35, 0.4, 0.42],
    );
    M.quad(
      br,
      [gx + 6.5, 6.5, gz + 4.5],
      [gx - 6.5, 6.5, gz + 4.5],
      [gx - 6.5, 9, gz + 0.5],
      [gx + 6.5, 9, gz + 0.5],
      [0, 0.8, 0.6],
      [0, 0, 5, 0, 5, 1, 0, 1],
      [0.35, 0.4, 0.42],
    );
    const bdk = M.buf("glass_dirty", gx, gz);
    for (const wx of [-3.5, 0, 3.5])
      M.box(bdk, gx + wx - 0.7, 1.5, gz + 4, gx + wx + 0.7, 4.2, gz + 4.05, {
        s: 2,
        c: [0.3, 0.3, 0.3],
        skip: 8 + 32,
      });
    M.box3(gx - 6, 0, gz - 3, gx + 6, 9, gz + 4, { tag: "building" });
    // warning signage (radiation) at the fence
    M.reservoirGate = { x: gx, z: gz + 6 };
  }

  // -------------------------------------------------------------------
  // Ground clutter decals in the park (leaves, dirt, puddles, blood)
  // -------------------------------------------------------------------
  function buildParkDecals() {
    const P = G.LAYOUT.PARK;
    const r = M.rng("parkdecals");
    for (let k = 0; k < 420; k++) {
      const x = r.range(P.x0 + 3, P.x1 - 3),
        z = r.range(P.z0 + 3, P.z1 - 3);
      const h = M.parkHeight(x, z);
      if (h < M.LAKE_Y + 0.3) continue;
      const cell =
        r() < 0.45
          ? M.MARK.LEAVES
          : r() < 0.6
            ? M.MARK.DIRT
            : r() < 0.8
              ? M.MARK.MOSS
              : r() < 0.9
                ? M.MARK.PUDDLE
                : M.MARK.LITTER;
      const s = r.range(2, 6);
      // sample 4 corners to hug the slope roughly
      const b = M.buf("my/markings", x, z, "fine");
      const yaw = r() * 6,
        cs = Math.cos(yaw),
        sn = Math.sin(yaw),
        hs = s / 2;
      const P4 = [
        [-hs, hs],
        [hs, hs],
        [hs, -hs],
        [-hs, -hs],
      ].map(([lx, lz]) => {
        const X = x + lx * cs + lz * sn,
          Z = z - lx * sn + lz * cs;
        return [X, M.parkHeight(X, Z) + 0.07, Z];
      });
      const uv = M.markUV(cell);
      M.quad(
        b,
        P4[0],
        P4[1],
        P4[2],
        P4[3],
        [0, 1, 0],
        [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
      );
    }
  }

  // -------------------------------------------------------------------
  // Manhattan-schist outcrops: glacier-polished whalebacks with foliated,
  // stepped strata (not blobs) — the rock the whole park sits on
  // -------------------------------------------------------------------
  const outcropGeoms = [];
  function outcropGeom(seed) {
    if (outcropGeoms[seed]) return outcropGeoms[seed];
    const g = new THREE.BoxGeometry(2, 1, 2, 10, 5, 10);
    const p = g.attributes.position;
    const r = M.rng("outcrop" + seed),
      u = G.util;
    const ox = r() * 40,
      oz = r() * 40;
    // dipping foliation plane (schist layers tilt ~20-45°)
    const dipA = r() * Math.PI * 2,
      dip = r.range(0.35, 0.8);
    const dn = [
      Math.sin(dip) * Math.cos(dipA),
      Math.cos(dip),
      Math.sin(dip) * Math.sin(dipA),
    ];
    const layers = r.range(5, 8);
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i),
        y = p.getY(i) + 0.5,
        z = p.getZ(i);
      // whaleback: round off the top, taper the ends (glacial polish), keep the base wide
      const rr = Math.hypot(x, z);
      const top =
        Math.max(0, 1 - rr * rr * 0.4) *
        (0.7 + u.fbm2(x * 0.9 + ox, z * 0.9 + oz, 3) * 0.7); // rounder humps (read as slabs from above at 0.28)
      y = y * top;
      const k = 0.82 + u.fbm2(x * 1.3 + oz, z * 1.3 - ox, 3) * 0.35;
      x *= k;
      z *= k;
      // terraces along the foliation: quantise the distance along the dip normal
      const d = x * dn[0] + y * dn[1] + z * dn[2];
      const q = Math.floor(d * layers) / layers,
        f = d * layers - Math.floor(d * layers);
      const stepD = q + Math.min(1, f * 1.8) / layers - d;
      if (y > 0.02) {
        x += dn[0] * stepD * 0.9;
        y += dn[1] * stepD * 0.9;
        z += dn[2] * stepD * 0.9;
      }
      p.setXYZ(i, x, Math.max(-0.2, y - 0.2), z);
    }
    g.computeVertexNormals();
    outcropGeoms[seed] = g;
    return g;
  }
  M.placeOutcrop = function (x, z, sx, sy, sz, yaw, seed, o) {
    o = o || {};
    const y = G.world.terrainHeight(x, z) - sy * 0.12;
    const tint = M.mulc([0.74, 0.74, 0.72], 0.82 + M.hash(x, z, 5) * 0.28);
    M.geom(
      M.buf("my/rock", x, z, o.layer || "main"),
      outcropGeom(seed % 5),
      M.mtx(x, y, z, yaw, r0(), r0(), [sx, sy, sz]),
      {
        cf: (X, Y, Z) =>
          M.mulc(
            tint,
            0.62 +
              M.clamp((Y - y) / (sy * 0.9), 0, 1) * 0.45 +
              (G.util.noise2(X * 0.4, Z * 0.4) - 0.5) * 0.18,
          ),
        us: Math.max(1.5, (sx + sz) / 3),
      },
    );
    // mica glints / lichen & moss on the flanks, leaf litter drifted against the uphill side
    if (!o.noDecal)
      M.decal(
        M.buf("my/markings", x, z, "fine"),
        x + sx * 0.5,
        y + 0.1,
        z,
        sx * 1.2,
        sz * 0.9,
        yaw,
        M.MARK.LEAVES,
        M.mulc(M.WHITE, 0.85),
      );
    if (!o.noCollide) {
      M.ocol(x, z, sx * 1.4, sz * 1.4, y, y + sy * 0.45, yaw, {
        tag: "rock",
        surface: "concrete",
        walkable: true,
      });
      M.ocol(x, z, sx * 0.8, sz * 0.8, y, y + sy * 0.8, yaw, {
        tag: "rock",
        surface: "concrete",
        walkable: true,
      });
    }
    function r0() {
      return (M.hash(x * 3, z * 3, seed) - 0.5) * 0.12;
    }
  };
  /** Terrain-draped decal (3×3 grid following the park heightfield). */
  function drapedDecal(x, z, w, d, yaw, cell, c, layer) {
    const uv = M.markUV(cell);
    const b = M.buf("my/markings", x, z, layer || "fine");
    const cs = Math.cos(yaw),
      sn = Math.sin(yaw),
      N = 3;
    const P = (i, j) => {
      const lx = (i / N - 0.5) * w,
        lz = (j / N - 0.5) * d;
      const px = x + lx * cs + lz * sn,
        pz = z - lx * sn + lz * cs;
      return [px, Math.max(M.parkHeight(px, pz), M.LAKE_Y + 0.05) + 0.045, pz];
    };
    for (let j = 0; j < N; j++)
      for (let i = 0; i < N; i++) {
        const u0 = uv[0] + ((uv[2] - uv[0]) * i) / N,
          u1 = uv[0] + ((uv[2] - uv[0]) * (i + 1)) / N;
        const v0 = uv[1] + ((uv[3] - uv[1]) * j) / N,
          v1 = uv[1] + ((uv[3] - uv[1]) * (j + 1)) / N;
        M.quad(
          b,
          P(i, j + 1),
          P(i + 1, j + 1),
          P(i + 1, j),
          P(i, j),
          [0, 1, 0],
          [u0, v1, u1, v1, u1, v0, u0, v0],
          c || M.WHITE,
        );
      }
  }
  /** Dead grass tufts, weeds, thickets, leaf litter, mud & puddles over the park lawns. */
  function buildGroundCover() {
    const L = G.LAYOUT,
      P = L.PARK,
      F = L.PARK_FEATURES;
    const r = M.rng("parkcover");
    let tufts = 0,
      decals = 0;
    // tufts: clumped (noise-driven density), taller & denser in meadows and at path edges
    for (let i = 0; i < 26000 && tufts < 11000; i++) {
      const x = r.range(P.x0 + 3, P.x1 - 3),
        z = r.range(P.z0 + 3, P.z1 - 3);
      const dens = G.util.fbm2(x * 0.05 + 11, z * 0.05 - 7, 3);
      if (r() > dens * dens * 2.2) continue;
      if (
        lakeSD(x, z) < 1.5 ||
        resSD(x, z) < 6 ||
        inExcl(x, z) ||
        L.siteAt(x, z, 2)
      )
        continue;
      if (M.rasterAt(x, z) === RC.PARKPATH || Math.abs(z + 760) < 6) continue;
      const y = M.parkHeight(x, z);
      if (y < M.LAKE_Y + 0.1) continue;
      const sm = F.sheepMeadow,
        meadow = x > sm.x0 && x < sm.x1 && z > sm.z0 && z < sm.z1;
      const h = r.range(0.35, 0.8) * (meadow ? 1.4 : 1) * (0.6 + dens);
      const b = M.buf("my/weeds", x, z, "detail");
      const v = r.int(0, 3),
        u0 = v * 0.25 + 0.005,
        u1 = (v + 1) * 0.25 - 0.005;
      const a = r() * Math.PI,
        w = h * 0.6;
      const c = M.mulc([1, 0.96, 0.85], r.range(0.65, 1.0));
      for (let k = 0; k < 2; k++) {
        const aa = a + (k * Math.PI) / 2,
          dx = Math.cos(aa) * w,
          dz = Math.sin(aa) * w;
        M.quad(
          b,
          [x - dx, y - 0.03, z - dz],
          [x + dx, y - 0.03, z + dz],
          [x + dx, y + h, z + dz],
          [x - dx, y + h, z - dz],
          [0, 1, 0],
          [u0, 0.01, u1, 0.01, u1, 0.99, u0, 0.99],
          c,
        );
      }
      tufts++;
    }
    // leaf litter under the trees, mud & moss in hollows, puddles in the lowest spots, trampled dirt near paths
    for (let i = 0; i < 2600 && decals < 700; i++) {
      const x = r.range(P.x0 + 4, P.x1 - 4),
        z = r.range(P.z0 + 4, P.z1 - 4);
      if (
        lakeSD(x, z) < 2 ||
        resSD(x, z) < 8 ||
        inExcl(x, z) ||
        L.siteAt(x, z, 4) ||
        Math.abs(z + 760) < 8
      )
        continue;
      const y = M.parkHeight(x, z);
      if (y < M.LAKE_Y + 0.15) continue;
      const hollow =
        (M.parkHeight(x + 3, z) +
          M.parkHeight(x - 3, z) +
          M.parkHeight(x, z + 3) +
          M.parkHeight(x, z - 3)) /
          4 -
        y;
      let cell,
        s = r.range(2.5, 6);
      if (hollow > 0.18 && r() < 0.6) {
        cell = r() < 0.55 ? M.MARK.PUDDLE : M.MARK.MOSS;
        s *= 0.8;
      } else if (M.nearParkPath(x, z, 2))
        cell = r() < 0.6 ? M.MARK.DIRT : M.MARK.LITTER;
      else
        cell =
          r() < 0.55
            ? M.MARK.LEAVES
            : r() < 0.5
              ? M.MARK.DIRT
              : r() < 0.5
                ? M.MARK.MOSS
                : M.MARK.GRIME;
      drapedDecal(
        x,
        z,
        s * r.range(0.8, 1.3),
        s,
        r() * 6,
        cell,
        M.mulc(M.WHITE, r.range(0.7, 1)),
        cell === M.MARK.PUDDLE ? "detail" : "fine",
      );
      decals++;
    }
    M.parkCover = { tufts, decals };
  }

  // -------------------------------------------------------------------
  M.buildPark = function () {
    buildHeightfield();
    buildTerrainMesh();
    buildWater();
    buildPaths();
    buildWalls();
    buildReservoir();
    if (M.buildBoathouse) M.buildBoathouse();
    if (M.buildParkPieces) M.buildParkPieces();
    buildTrees();
    buildRocks();
    try {
      buildGroundCover();
    } catch (e) {
      G.reportError("map:parkcover", e);
    }
    buildFurniture();
    buildParkDecals();
  };
})();

/* ---------------------------------------------------------------------
 * The Loeb Boathouse on the Lake: colonnaded pavilion with a copper
 * roof, a dock over the water and a few half-sunk rowboats.
 * ------------------------------------------------------------------- */
