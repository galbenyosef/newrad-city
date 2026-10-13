// play-inline-623 02 — math
// Lines 31-349 of readable/play-inline-623.pretty.js (statement-aligned).
  const R = G.renderPerf._;

  const W = 256,
    H = 128; // buffer (non-square texels are fine: rects are tested in the same space)
  const NEARC = 1.0; // occluder near clip (m); units with a corner closer than this are visible
  const BAND = 6.0,
    INSET = 3.5; // storefront band height / inset
  const OCC_R = 520; // occluders gathered within this radius
  const MAX_OCC = 320; // raster at most this many per frame (nearest first)
  const CELL = 80;

  const O = (R.occ = {
    W,
    H,
    ready: false,
    list: [],
    grid: new Map(),
    buf: new Float32Array(W * H),
    ero: new Float32Array(W * H),
    pyr: [],
    pw: [],
    ph: [],
    valid: false,
    lastMs: 0,
    rastered: 0,
  });

  // ------------------------------------------------------------------
  // Occluder extraction (lazy, once the map exists)
  // ------------------------------------------------------------------
  function lotIndex(lots, cut) {
    const grid = new Map();
    const add = (l) => {
      for (let x = Math.floor(l.x0 / 60); x <= Math.floor(l.x1 / 60); x++)
        for (let z = Math.floor(l.z0 / 60); z <= Math.floor(l.z1 / 60); z++) {
          const k = x + "," + z;
          let a = grid.get(k);
          if (!a) grid.set(k, (a = []));
          a.push(l);
        }
    };
    for (const l of lots) if (l && isFinite(l.x0)) add(l);
    for (const l of cut) if (l && isFinite(l.x0)) add(l);
    return (x, z) => {
      const a = grid.get(Math.floor(x / 60) + "," + Math.floor(z / 60));
      if (!a) return null;
      for (const l of a) {
        if (
          x < l.x0 - 0.01 ||
          x > l.x1 + 0.01 ||
          z < l.z0 - 0.01 ||
          z > l.z1 + 0.01
        )
          continue;
        if (
          l.poly &&
          G.LAYOUT &&
          G.LAYOUT.pointInPoly &&
          !G.LAYOUT.pointInPoly(x, z, l.poly)
        )
          continue;
        return l;
      }
      return null;
    };
  }
  /** Convex prism occluder from a footprint polygon (any winding, n ≥ 3) between y0 and y1. */
  function addPrism(xs, zs, y0, y1) {
    const n = xs.length;
    if (n < 3 || n > 12 || y1 - y0 < 1.5) return;
    let cx = 0,
      cz = 0;
    for (let i = 0; i < n; i++) {
      cx += xs[i];
      cz += zs[i];
    }
    cx /= n;
    cz /= n;
    let r2 = 0;
    for (let i = 0; i < n; i++)
      r2 = Math.max(r2, (xs[i] - cx) ** 2 + (zs[i] - cz) ** 2);
    const hy = (y1 - y0) / 2;
    // outward edge normals (centroid test; footprints are convex)
    const nx = new Float32Array(n),
      nz = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n,
        dx = xs[j] - xs[i],
        dz = zs[j] - zs[i];
      let ax = dz,
        az = -dx;
      const mx = (xs[i] + xs[j]) / 2 - cx,
        mz = (zs[i] + zs[j]) / 2 - cz;
      if (ax * mx + az * mz < 0) {
        ax = -ax;
        az = -az;
      }
      nx[i] = ax;
      nz[i] = az;
    }
    const o = {
      n,
      xs: Float32Array.from(xs),
      zs: Float32Array.from(zs),
      nx,
      nz,
      y0,
      y1,
      cx,
      cz,
      cy: y0 + hy,
      r: Math.sqrt(r2 + hy * hy),
      d2: 0,
    };
    O.list.push(o);
    const k = Math.floor(cx / CELL) + "," + Math.floor(cz / CELL);
    let a = O.grid.get(k);
    if (!a) O.grid.set(k, (a = []));
    a.push(o);
  }
  /** Inset a convex polygon ([[x,z],…]) by a per-edge distance; null when it collapses. */
  function insetConvex(poly, dist) {
    const n = poly.length;
    let area = 0;
    for (let i = 0; i < n; i++) {
      const a = poly[i],
        b = poly[(i + 1) % n];
      area += a[0] * b[1] - b[0] * a[1];
    }
    const ccw = area > 0;
    const lines = [];
    for (let i = 0; i < n; i++) {
      const a = poly[i],
        b = poly[(i + 1) % n];
      const dx = b[0] - a[0],
        dz = b[1] - a[1],
        l = Math.hypot(dx, dz) || 1;
      let ix = -dz / l,
        iz = dx / l;
      if (!ccw) {
        ix = -ix;
        iz = -iz;
      } // inward normal
      const d = dist(i);
      lines.push([a[0] + ix * d, a[1] + iz * d, dx, dz]);
    }
    const out = [];
    for (let i = 0; i < n; i++) {
      const L1 = lines[(i + n - 1) % n],
        L2 = lines[i];
      const den = L1[2] * L2[3] - L1[3] * L2[2];
      if (Math.abs(den) < 1e-9) {
        out.push([L2[0], L2[1]]);
        continue;
      }
      const t = ((L2[0] - L1[0]) * L2[3] - (L2[1] - L1[1]) * L2[2]) / den;
      out.push([L1[0] + L1[2] * t, L1[1] + L1[3] * t]);
    }
    // collapsed / flipped? every inset edge must keep its direction and the area must stay positive
    let a2 = 0;
    for (let i = 0; i < n; i++) {
      const a = out[i],
        b = out[(i + 1) % n];
      a2 += a[0] * b[1] - b[0] * a[1];
      const ex = b[0] - a[0],
        ez = b[1] - a[1];
      if (ex * lines[i][2] + ez * lines[i][3] <= 0) return null;
    }
    if (a2 > 0 !== ccw || Math.abs(a2) * 0.5 < 4) return null;
    return out;
  }
  const edgeKey = (a, b) => {
    const k1 = Math.round(a[0] * 5) + ":" + Math.round(a[1] * 5),
      k2 = Math.round(b[0] * 5) + ":" + Math.round(b[1] * 5);
    return k1 < k2 ? k1 + "|" + k2 : k2 + "|" + k1;
  };
  O.build = function () {
    O.list = [];
    O.grid = new Map();
    O.ready = true;
    const map = G.map;
    if (!map || G.isStub("map") || !G.world || !G.world.colliders) return 0;
    const M = map._ || {};
    const lots = map.lots || M.lots || [],
      cut = M.cutLots || [];
    if (!lots.length && !cut.length) return 0;
    const XMIN = (G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 2500;
    // ---- generic rect lots: their `building` colliders (setback towers = one box per tier) ----
    const find = lotIndex(lots, []);
    const SX = [-1, 1, 1, -1],
      SZ = [-1, -1, 1, 1];
    for (const c of G.world.colliders) {
      if (
        c.tag !== "building" ||
        !(c.hx > 0.5) ||
        !(c.hz > 0.5) ||
        c.cx >= XMIN
      )
        continue;
      const lot = find(c.cx, c.cz);
      if (!lot || lot.kind === "collapsed" || lot.kind === "shell") continue;
      const y0 = Math.max(0, c.minY);
      let y1 = c.maxY - 0.3;
      if (lot.ruined) y1 = Math.min(y1, 0.4 * (lot.h || c.maxY));
      if (!(y1 - y0 > 2.5)) continue;
      const cs = c.cos,
        sn = c.sin;
      const xs = [],
        zs = [];
      for (let i = 0; i < 4; i++) {
        const lx = SX[i] * c.hx,
          lz = SZ[i] * c.hz;
        xs.push(c.cx + lx * cs + lz * sn);
        zs.push(c.cz - lx * sn + lz * cs);
      }
      if (y0 < BAND) {
        // storefront band: inset only the street fronts (party walls are shared with the neighbour → no gap)
        const bx = [],
          bz = [];
        if (Math.abs(c.yaw) < 1e-6 && lot.front) {
          let x0 = c.cx - c.hx,
            x1 = c.cx + c.hx,
            z0 = c.cz - c.hz,
            z1 = c.cz + c.hz;
          const f = lot.front;
          if (f.w) x0 += INSET;
          if (f.e) x1 -= INSET;
          if (f.n) z0 += INSET;
          if (f.s) z1 -= INSET;
          if (x1 - x0 >= 1.5 && z1 - z0 >= 1.5) {
            bx.push(x0, x1, x1, x0);
            bz.push(z0, z0, z1, z1);
          }
        } else if (c.hx - INSET > 0.75 && c.hz - INSET > 0.75) {
          for (let i = 0; i < 4; i++) {
            const lx = SX[i] * (c.hx - INSET),
              lz = SZ[i] * (c.hz - INSET);
            bx.push(c.cx + lx * cs + lz * sn);
            bz.push(c.cz - lx * sn + lz * cs);
          }
        }
        if (bx.length) addPrism(bx, bz, y0, Math.min(y1, BAND));
        if (y1 > BAND + 1) addPrism(xs, zs, BAND, y1);
      } else addPrism(xs, zs, y0, y1);
    }
    // ---- Broadway polygon lots: the lot polygon itself (flat-topped prisms; walls stay full height when ruined) ----
    const shared = new Map();
    for (const l of cut)
      if (l && l.poly)
        for (let i = 0; i < l.poly.length; i++) {
          const k = edgeKey(l.poly[i], l.poly[(i + 1) % l.poly.length]);
          shared.set(k, (shared.get(k) || 0) + 1);
        }
    for (const l of cut) {
      if (!l || !l.poly || l.poly.length < 3 || !(l.h > 3) || l.x0 >= XMIN)
        continue;
      const P = l.poly,
        n = P.length;
      const y1 = l.h - 0.3;
      if (y1 > BAND + 1)
        addPrism(
          P.map((p) => p[0]),
          P.map((p) => p[1]),
          BAND,
          y1,
        );
      // band: inset street edges only (edges shared with another polygon lot are party walls)
      const ins = insetConvex(P, (i) =>
        shared.get(edgeKey(P[i], P[(i + 1) % n])) > 1 ? 0 : INSET,
      );
      if (ins)
        addPrism(
          ins.map((p) => p[0]),
          ins.map((p) => p[1]),
          0,
          Math.min(y1, BAND),
        );
    }
    R.stats.occluders = O.list.length;
    return O.list.length;
  };

  // ------------------------------------------------------------------
  // Per-frame camera state
  // ------------------------------------------------------------------
  const V = new Float64Array(16),
    P = new Float64Array(16);
  let camX = 0,
    camY = 0,
    camZ = 0;
  O.pxPerRad = 300;
  function setCamera(cam) {
    const v = cam.matrixWorldInverse.elements,
      p = cam.projectionMatrix.elements;
    for (let i = 0; i < 16; i++) {
      V[i] = v[i];
      P[i] = p[i];
    }
    const e = cam.matrixWorld.elements;
    camX = e[12];
    camY = e[13];
    camZ = e[14];
  }

  // ------------------------------------------------------------------
  // Rasteriser (inverse depth, max = nearest)
  // ------------------------------------------------------------------
  // clip buffers (an n-gon clipped by one plane has ≤ n+1 vertices; footprints have ≤ 12)
  const cvx = new Float64Array(16),
    cvy = new Float64Array(16),
    cvz = new Float64Array(16);
  const tvx = new Float64Array(16),
    tvy = new Float64Array(16),
    tvz = new Float64Array(16);
  const sx = new Float64Array(16),
    sy = new Float64Array(16),
    siz = new Float64Array(16);
  const buf = O.buf;

