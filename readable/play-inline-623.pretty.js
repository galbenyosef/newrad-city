/* src/render_perf/20_occlusion.js */
/* =====================================================================
 * RENDER_PERF — software occlusion culling (CPU "masked depth" buffer).
 *
 * Street canyons are the classic occlusion case: standing in Times Square the
 * renderer used to draw the Navy Yard, Ellis Island, the Seaport, Domino Sugar…
 * all hidden behind a mile of buildings. Every frame (after the camera is final)
 * the city's building masses are rasterised into a small inverse-depth buffer
 * (256×128), eroded by one texel and reduced to a min-pyramid; each cull unit's
 * AABB is projected and culled only if EVERY texel under it holds an occluder
 * that is clearly nearer (0.5 m + 0.4 %) than the unit's nearest corner.
 *
 * Occluders are conservative by construction:
 *  - only the map's city-fabric building masses (`building` colliders whose centre
 *    lies on a generic lot or a Broadway polygon lot) — never landmarks/POIs;
 *    collapsed lots and enterable shells are skipped, ruined rect lots only count
 *    up to 40 % of their height (their visible walls keep ≥ 45 %), tops sit 0.3 m
 *    under the roof;
 *  - the ground band (0–6 m, storefront bays with 3.2 m deep shop rooms) is
 *    inset 3.5 m from every façade, only the storeys above use the full footprint;
 *  - pixel-centre coverage + a 1-texel erosion → an occluder never claims a texel
 *    it only partly covers.
 * Shadow casters near the player are tested with their AABB stretched along the
 * sun direction to the ground, so a hidden caster whose shadow falls into view is
 * never removed.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.renderPerf || !G.renderPerf._) return;
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

  function rasterTri(x0, y0, z0, x1, y1, z1, x2, y2, z2) {
    let area = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
    if (area > -1e-6 && area < 1e-6) return;
    if (area < 0) {
      let t = x1;
      x1 = x2;
      x2 = t;
      t = y1;
      y1 = y2;
      y2 = t;
      t = z1;
      z1 = z2;
      z2 = t;
      area = -area;
    }
    const minY = Math.max(0, Math.ceil(Math.min(y0, y1, y2) - 0.5)),
      maxY = Math.min(H - 1, Math.floor(Math.max(y0, y1, y2) - 0.5));
    if (minY > maxY) return;
    const minXf = Math.min(x0, x1, x2),
      maxXf = Math.max(x0, x1, x2);
    if (maxXf < 0.5 || minXf > W - 0.5) return;
    const dzdx = ((z1 - z0) * (y2 - y0) - (z2 - z0) * (y1 - y0)) / area;
    const dzdy = ((z2 - z0) * (x1 - x0) - (z1 - z0) * (x2 - x0)) / area;
    // edges a→b: E = (xb-xa)(y-ya) - (yb-ya)(x-xa) ≥ 0 inside (CCW in this orientation)
    const e0a = -(y1 - y0),
      e1a = -(y2 - y1),
      e2a = -(y0 - y2);
    for (let py = minY; py <= maxY; py++) {
      const yc = py + 0.5;
      let lo = 0,
        hi = W - 1;
      // edge 0: v0→v1
      let b = (x1 - x0) * (yc - y0) - e0a * x0;
      if (e0a > 0) {
        const t = Math.ceil(-b / e0a - 0.5);
        if (t > lo) lo = t;
      } else if (e0a < 0) {
        const t = Math.floor(-b / e0a - 0.5);
        if (t < hi) hi = t;
      } else if (b < 0) continue;
      b = (x2 - x1) * (yc - y1) - e1a * x1;
      if (e1a > 0) {
        const t = Math.ceil(-b / e1a - 0.5);
        if (t > lo) lo = t;
      } else if (e1a < 0) {
        const t = Math.floor(-b / e1a - 0.5);
        if (t < hi) hi = t;
      } else if (b < 0) continue;
      b = (x0 - x2) * (yc - y2) - e2a * x2;
      if (e2a > 0) {
        const t = Math.ceil(-b / e2a - 0.5);
        if (t > lo) lo = t;
      } else if (e2a < 0) {
        const t = Math.floor(-b / e2a - 0.5);
        if (t < hi) hi = t;
      } else if (b < 0) continue;
      if (lo > hi) continue;
      let iz = z0 + dzdx * (lo + 0.5 - x0) + dzdy * (yc - y0);
      let idx = py * W + lo;
      for (let px = lo; px <= hi; px++, idx++, iz += dzdx)
        if (iz > buf[idx]) buf[idx] = iz;
    }
  }
  /** Rasterise a convex world-space polygon (n ≤ 12 vertices in cvx/cvy/cvz). */
  function rasterPoly(n) {
    // world → view
    for (let i = 0; i < n; i++) {
      const x = cvx[i],
        y = cvy[i],
        z = cvz[i];
      tvx[i] = V[0] * x + V[4] * y + V[8] * z + V[12];
      tvy[i] = V[1] * x + V[5] * y + V[9] * z + V[13];
      tvz[i] = -(V[2] * x + V[6] * y + V[10] * z + V[14]); // view depth (positive in front)
    }
    // clip against depth ≥ NEARC
    let m = 0,
      allIn = true,
      anyIn = false;
    for (let i = 0; i < n; i++) {
      if (tvz[i] < NEARC) allIn = false;
      else anyIn = true;
    }
    if (!anyIn) return;
    if (allIn) {
      for (let i = 0; i < n; i++) {
        cvx[i] = tvx[i];
        cvy[i] = tvy[i];
        cvz[i] = tvz[i];
      }
      m = n;
    } else {
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const ai = tvz[i] >= NEARC,
          aj = tvz[j] >= NEARC;
        if (ai) {
          cvx[m] = tvx[i];
          cvy[m] = tvy[i];
          cvz[m] = tvz[i];
          m++;
        }
        if (ai !== aj) {
          const t = (NEARC - tvz[i]) / (tvz[j] - tvz[i]);
          cvx[m] = tvx[i] + (tvx[j] - tvx[i]) * t;
          cvy[m] = tvy[i] + (tvy[j] - tvy[i]) * t;
          cvz[m] = NEARC;
          m++;
        }
      }
    }
    // project (general perspective matrix; view z = -depth)
    for (let i = 0; i < m; i++) {
      const x = cvx[i],
        y = cvy[i],
        vz = -cvz[i];
      const w = P[3] * x + P[7] * y + P[11] * vz + P[15];
      const nx = (P[0] * x + P[4] * y + P[8] * vz + P[12]) / w;
      const ny = (P[1] * x + P[5] * y + P[9] * vz + P[13]) / w;
      sx[i] = (nx * 0.5 + 0.5) * W;
      sy[i] = (ny * 0.5 + 0.5) * H;
      siz[i] = 1 / cvz[i];
    }
    for (let i = 1; i < m - 1; i++)
      rasterTri(
        sx[0],
        sy[0],
        siz[0],
        sx[i],
        sy[i],
        siz[i],
        sx[i + 1],
        sy[i + 1],
        siz[i + 1],
      );
  }
  function rasterPrism(o) {
    const xs = o.xs,
      zs = o.zs,
      n = o.n;
    // camera inside the footprint (and within its height)? then it can't occlude anything sensibly
    let inside = true;
    for (let i = 0; i < n; i++)
      if ((camX - xs[i]) * o.nx[i] + (camZ - zs[i]) * o.nz[i] > 0) {
        inside = false;
        break;
      }
    if (inside && camY > o.y0 - 1 && camY < o.y1 + 1) return;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const mx = (xs[i] + xs[j]) * 0.5,
        mz = (zs[i] + zs[j]) * 0.5;
      if ((camX - mx) * o.nx[i] + (camZ - mz) * o.nz[i] <= 0) continue; // back face
      cvx[0] = xs[i];
      cvy[0] = o.y0;
      cvz[0] = zs[i];
      cvx[1] = xs[j];
      cvy[1] = o.y0;
      cvz[1] = zs[j];
      cvx[2] = xs[j];
      cvy[2] = o.y1;
      cvz[2] = zs[j];
      cvx[3] = xs[i];
      cvy[3] = o.y1;
      cvz[3] = zs[i];
      rasterPoly(4);
    }
    if (camY > o.y1) {
      for (let i = 0; i < n; i++) {
        cvx[i] = xs[i];
        cvy[i] = o.y1;
        cvz[i] = zs[i];
      }
      rasterPoly(n);
    }
    O.rastered++;
  }

  // ------------------------------------------------------------------
  // Erosion + min pyramid
  // ------------------------------------------------------------------
  function buildPyramid() {
    const ero = O.ero;
    // 3×3 min (inverse depth: min = farthest; 0 = empty → an edge texel becomes empty)
    for (let y = 0; y < H; y++) {
      const y0 = y > 0 ? y - 1 : 0,
        y1 = y < H - 1 ? y + 1 : H - 1;
      for (let x = 0; x < W; x++) {
        const x0 = x > 0 ? x - 1 : 0,
          x1 = x < W - 1 ? x + 1 : W - 1;
        let m = buf[y * W + x];
        if (m > 0) {
          for (let yy = y0; yy <= y1 && m > 0; yy++) {
            const row = yy * W;
            for (let xx = x0; xx <= x1; xx++) {
              const v = buf[row + xx];
              if (v < m) m = v;
            }
          }
          // screen border: treat outside as empty only for real edges (x0/x1 clamp keeps border texels valid)
        }
        ero[y * W + x] = m;
      }
    }
    if (!O.pyr.length) {
      let w = W,
        h = H;
      O.pyr.push(ero);
      O.pw.push(w);
      O.ph.push(h);
      while (w > 2 || h > 2) {
        w = Math.max(1, (w + 1) >> 1);
        h = Math.max(1, (h + 1) >> 1);
        O.pyr.push(new Float32Array(w * h));
        O.pw.push(w);
        O.ph.push(h);
      }
    }
    for (let l = 1; l < O.pyr.length; l++) {
      const src = O.pyr[l - 1],
        sw = O.pw[l - 1],
        sh = O.ph[l - 1],
        dst = O.pyr[l],
        dw = O.pw[l],
        dh = O.ph[l];
      for (let y = 0; y < dh; y++) {
        const sy0 = y * 2,
          sy1 = Math.min(sh - 1, sy0 + 1);
        for (let x = 0; x < dw; x++) {
          const sx0 = x * 2,
            sx1 = Math.min(sw - 1, sx0 + 1);
          let m = src[sy0 * sw + sx0];
          let v = src[sy0 * sw + sx1];
          if (v < m) m = v;
          v = src[sy1 * sw + sx0];
          if (v < m) m = v;
          v = src[sy1 * sw + sx1];
          if (v < m) m = v;
          dst[y * dw + x] = m;
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Frame: gather + raster occluders
  // ------------------------------------------------------------------
  const cand = [];
  O.frame = function (cam) {
    O.valid = false;
    if (!O.ready) O.build();
    if (!O.list.length) return false;
    const t0 = performance.now();
    setCamera(cam);
    const XMIN = (G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 2500;
    if (camX >= XMIN - 50) return false; // indoors: no city occluders
    // texels per radian (vertical) for the size gate
    const fovR = ((cam.fov || 60) * Math.PI) / 180;
    const pxr =
      (H * 0.5) / Math.tan(fovR * 0.5) / (cam.zoom ? 1 / cam.zoom : 1);
    O.pxPerRad = pxr;
    cand.length = 0;
    const r = Math.ceil(OCC_R / CELL),
      gx = Math.floor(camX / CELL),
      gz = Math.floor(camZ / CELL);
    // forward vector for a cheap behind-the-camera reject
    const fx = -V[2],
      fy = -V[6],
      fz = -V[10]; // third row of the view matrix = camera back axis (negated → forward)
    for (let ix = gx - r; ix <= gx + r; ix++)
      for (let iz = gz - r; iz <= gz + r; iz++) {
        const a = O.grid.get(ix + "," + iz);
        if (!a) continue;
        for (let i = 0; i < a.length; i++) {
          const o = a[i];
          const dx = o.cx - camX,
            dy = o.cy - camY,
            dz = o.cz - camZ;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 > OCC_R * OCC_R) continue;
          const d = Math.sqrt(d2);
          if (dx * fx + dy * fy + dz * fz < -o.r) continue; // fully behind
          if (d > o.r && (o.r / d) * pxr < 2.5) continue; // tiny on screen
          o.d2 = d2;
          cand.push(o);
        }
      }
    cand.sort((a, b) => a.d2 - b.d2);
    buf.fill(0);
    O.rastered = 0;
    const n = Math.min(cand.length, MAX_OCC);
    for (let i = 0; i < n; i++) rasterPrism(cand[i]);
    buildPyramid();
    O.valid = O.rastered > 0;
    R.stats.rasterOccluders = O.rastered;
    O.lastMs = performance.now() - t0;
    return O.valid;
  };

  // ------------------------------------------------------------------
  // Box test. Returns true when the AABB is certainly hidden.
  // ------------------------------------------------------------------
  const px8 = new Float64Array(8),
    py8 = new Float64Array(8);
  O.boxOccluded = function (x0, y0, z0, x1, y1, z1) {
    if (!O.valid) return false;
    let minD = 1e9,
      mnx = 1e9,
      mny = 1e9,
      mxx = -1e9,
      mxy = -1e9;
    for (let i = 0; i < 8; i++) {
      const x = i & 1 ? x1 : x0,
        y = i & 2 ? y1 : y0,
        z = i & 4 ? z1 : z0;
      const vx = V[0] * x + V[4] * y + V[8] * z + V[12];
      const vy = V[1] * x + V[5] * y + V[9] * z + V[13];
      const vz = V[2] * x + V[6] * y + V[10] * z + V[14];
      const d = -vz;
      if (d < NEARC) return false;
      if (d < minD) minD = d;
      const w = P[3] * vx + P[7] * vy + P[11] * vz + P[15];
      const sxx =
        (((P[0] * vx + P[4] * vy + P[8] * vz + P[12]) / w) * 0.5 + 0.5) * W;
      const syy =
        (((P[1] * vx + P[5] * vy + P[9] * vz + P[13]) / w) * 0.5 + 0.5) * H;
      if (sxx < mnx) mnx = sxx;
      if (sxx > mxx) mxx = sxx;
      if (syy < mny) mny = syy;
      if (syy > mxy) mxy = syy;
      px8[i] = sxx;
      py8[i] = syy;
    }
    if (mxx < 0 || mxy < 0 || mnx > W || mny > H) return false; // off-screen: the renderer's frustum test handles it
    let rx0 = Math.max(0, Math.floor(mnx)),
      ry0 = Math.max(0, Math.floor(mny));
    let rx1 = Math.min(W - 1, Math.floor(mxx)),
      ry1 = Math.min(H - 1, Math.floor(mxy));
    // threshold: the occluder must be nearer than the unit's nearest corner by 0.5 m + 0.4 %
    const dt = minD * 0.996 - 0.5;
    if (dt <= NEARC) return false;
    const izT = 1 / dt;
    let L = 0;
    while (
      L < O.pyr.length - 1 &&
      ((rx1 >> L) - (rx0 >> L) > 3 || (ry1 >> L) - (ry0 >> L) > 3)
    )
      L++;
    const lv = O.pyr[L],
      lw = O.pw[L];
    const ax0 = rx0 >> L,
      ax1 = rx1 >> L,
      ay0 = ry0 >> L,
      ay1 = ry1 >> L;
    for (let y = ay0; y <= ay1; y++) {
      const row = y * lw;
      for (let x = ax0; x <= ax1; x++) if (!(lv[row + x] > izT)) return false;
    }
    return true;
  };
})();
