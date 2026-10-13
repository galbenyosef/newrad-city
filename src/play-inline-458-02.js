// play-inline-458 02 — math
// Lines 43-296 of readable/play-inline-458.pretty.js (statement-aligned).
  const L = G.chars._lib,
    H = L.human,
    P = L.prim;
  const clamp = L.clamp,
    lerp = L.lerp;
  const PI = Math.PI;
  const sm = (a0, a1, x) => {
    const t = clamp((x - a0) / (a1 - a0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const gau = (dx, dy, w) => Math.exp(-(dx * dx + dy * dy) / w);
  const band = (y, a, b, f) => sm(a - f, a + f, y) * sm(b + f, b - f, y);
  const segD = (px, py, ax, ay, bx, by) => {
    const vx = bx - ax,
      vy = by - ay;
    const t = clamp(
      ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy),
      0,
      1,
    );
    return Math.hypot(px - ax - vx * t, py - ay - vy * t);
  };

  // ==================================================================
  // HEAD PARAMETERISATION  (s, t) ∈ [0,1]²  ↔  unit-sphere direction
  //   s → longitude a ∈ [−π, π] (a = 0 at the FRONT, −Z; +a toward +X)
  //   t → polar angle θ ∈ [0, π] (θ = 0 at the crown)
  // Both axes are warped by a density (inverse CDF) that concentrates
  // samples on the face, so grid vertices AND texture pixels are densest
  // where the dialogue camera looks.
  // ==================================================================
  function cdfTable(lo, hi, dens, n) {
    const xs = new Float64Array(n + 1),
      cs = new Float64Array(n + 1);
    let acc = 0;
    for (let i = 0; i <= n; i++) {
      xs[i] = lo + ((hi - lo) * i) / n;
      if (i > 0) acc += (0.5 * (dens(xs[i]) + dens(xs[i - 1])) * (hi - lo)) / n;
      cs[i] = acc;
    }
    for (let i = 0; i <= n; i++) cs[i] /= acc;
    return { xs, cs, n, lo, hi };
  }
  /** parameter p (0..1) → angle */
  function fwd(T, p) {
    const cs = T.cs;
    let a = 0,
      b = T.n;
    if (p <= 0) return T.lo;
    if (p >= 1) return T.hi;
    while (b - a > 1) {
      const m = (a + b) >> 1;
      if (cs[m] < p) a = m;
      else b = m;
    }
    const f = (p - cs[a]) / Math.max(1e-12, cs[b] - cs[a]);
    return T.xs[a] + (T.xs[b] - T.xs[a]) * f;
  }
  /** angle → parameter p (0..1) */
  function inv(T, x) {
    const u = clamp((x - T.lo) / (T.hi - T.lo), 0, 1) * T.n;
    const i = Math.min(T.n - 1, Math.floor(u)),
      f = u - i;
    return T.cs[i] + (T.cs[i + 1] - T.cs[i]) * f;
  }
  const TA = cdfTable(
    -PI,
    PI,
    (a) => 0.5 + 2.7 * Math.exp(-Math.pow(a / 0.95, 2)),
    2048,
  );
  const TT = cdfTable(
    0,
    PI,
    (t) => 0.42 + 2.5 * Math.exp(-Math.pow((t - 1.74) / 0.6, 2)),
    2048,
  );
  // The skull uses texture rows [0, TV·FT); the strip below holds swatches
  // (iris, lip creases) that no skull vertex ever samples.
  const TV = 0.9;
  const FM = (H.faceMap = {
    /** (s,t) → unit direction [x,y,z] */
    dir(s, t, out) {
      const a = fwd(TA, s),
        th = fwd(TT, t);
      const st = Math.sin(th);
      out[0] = st * Math.sin(a);
      out[1] = Math.cos(th);
      out[2] = -st * Math.cos(a);
      return out;
    },
    /** any vector from the head centre (unit-head space) → [s,t] */
    param(x, y, z, out) {
      const r = Math.hypot(x, y, z) || 1;
      out[0] = inv(TA, Math.atan2(x, -z));
      out[1] = inv(TT, Math.acos(clamp(y / r, -1, 1))) * TV;
      return out;
    },
  });
  // Texture swatches live in the part of the map that lands UNDER the skull
  // (inside the neck): the iris and the lip creases.
  const FT = 512; // face texture resolution
  const SW = { iris: [4, FT - 48, 46, 46], lips: [56, FT - 46, 150, 42] };

  // ==================================================================
  // SKULL GRID + SCULPT
  // ==================================================================
  const GRID_M = 50,
    GRID_N = 38; // warped toward the face: ~3.7k tris (was 64×50 ≈ 6.3k)
  function headGrid(M, N) {
    const pos = [],
      uv = [],
      idx = [],
      d = [0, 0, 0];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      for (let j = 0; j <= M; j++) {
        const s = j / M;
        FM.dir(s, t, d);
        pos.push(d[0], d[1], d[2]);
        uv.push(s, t * TV);
      }
    }
    const W = M + 1;
    for (let i = 0; i < N; i++)
      for (let j = 0; j < M; j++) {
        const a = i * W + j,
          b = a + 1,
          c = a + W,
          e = c + 1;
        if (i > 0) idx.push(a, b, c); // (a,b,c) is CCW seen from outside
        if (i < N - 1) idx.push(b, e, c);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  }
  /** Average normals across coincident vertices (UV seam at the back, poles). */
  function weldNormals(g) {
    const pos = g.attributes.position,
      nor = g.attributes.normal,
      n = pos.count;
    const map = new Map();
    const key = (i) =>
      Math.round(pos.getX(i) * 1e5) +
      "," +
      Math.round(pos.getY(i) * 1e5) +
      "," +
      Math.round(pos.getZ(i) * 1e5);
    for (let i = 0; i < n; i++) {
      const k = key(i);
      let l = map.get(k);
      if (!l) {
        l = [];
        map.set(k, l);
      }
      l.push(i);
    }
    for (const l of map.values()) {
      if (l.length < 2) continue;
      let x = 0,
        y = 0,
        z = 0;
      for (const i of l) {
        x += nor.getX(i);
        y += nor.getY(i);
        z += nor.getZ(i);
      }
      const len = Math.hypot(x, y, z) || 1;
      for (const i of l) nor.setXYZ(i, x / len, y / len, z / len);
    }
    nor.needsUpdate = true;
  }

  // ---- BASE LOFT: cross-section knots over the height of the unit head.
  // X half-width, Zf front depth, Zb back depth, n superellipse exponent
  // (2 = round, >2 = flat front & side planes with a corner between them).
  //            y     X     Zf    Zb    n
  const LOFT = [
    [1.0, 0.0, 0.0, 0.0, 2.0],
    [0.85, 0.54, 0.52, 0.56, 2.05],
    [0.7, 0.745, 0.72, 0.79, 2.15],
    [0.35, 0.985, 0.945, 1.02, 2.35],
    [0.12, 0.985, 0.995, 1.07, 2.5],
    [-0.1, 0.97, 1.0, 1.0, 2.5],
    [-0.3, 0.895, 0.975, 0.86, 2.45],
    [-0.5, 0.79, 0.94, 0.64, 2.45],
    [-0.62, 0.685, 0.9, 0.48, 2.4],
    [-0.72, 0.53, 0.85, 0.36, 2.2],
    [-0.84, 0.3, 0.72, 0.26, 2.1],
    [-1.0, 0.0, 0.0, 0.0, 2.0],
  ];
  // (rev: the lower face tapers into a V from the cheekbones to the chin and
  // the cross-sections are rounder — the old near-square jaw read as a block.
  // r2: jaw → chin narrowed another ~4–7 %: the lower face read as a wide pear.)
  const _lo = [0, 0, 0],
    _lk = [0, 0, 0, 0];
  function loftKnots(y, o) {
    let i = 0;
    while (i < LOFT.length - 2 && y < LOFT[i + 1][0]) i++;
    const A = LOFT[i],
      B = LOFT[i + 1];
    let t = clamp((A[0] - y) / (A[0] - B[0]), 0, 1);
    t = t * t * (3 - 2 * t) * 0.6 + t * 0.4; // C1-ish blend, no plateaus
    for (let k = 0; k < 4; k++) o[k] = lerp(A[k + 1], B[k + 1], t);
    return o;
  }
  /** unit-sphere direction → lofted head point (per-seed widths from K) */
  function loft(K, x, y, z, out) {
    const k = loftKnots(y, _lk);
    const jw = sm(-0.2, -0.62, y); // 0 above the cheeks → 1 at the jaw
    let X =
        k[0] *
        lerp(y > 0.05 ? K.sw : lerp(K.sw, K.cw, sm(0.05, -0.1, y)), K.gw, jw),
      Zf = k[1],
      Zb = k[2];
    const n = K.mutant
      ? 2.2
      : lerp(k[3], 2.3, K.female ? 0.35 : 0) + (K.sq || 0) * jw;
    if (y < -0.6) {
      const c = sm(-0.6, -0.88, y);
      Zf *= 1 + (K.chinF - 1) * 0.06 * c;
      X *= lerp(1, K.chinW, c);
    }
    const a = Math.atan2(x, -z),
      sa = Math.abs(Math.sin(a)),
      ca = Math.cos(a);
    const Z = ca >= 0 ? Zf : Zb,
      cz = Math.abs(ca);
    const r =
      1 /
      Math.pow(
        Math.pow(sa / Math.max(1e-4, X), n) +
          Math.pow(cz / Math.max(1e-4, Z), n),
        1 / n,
      );
    const h = Math.hypot(x, z),
      q = h > 1e-6 ? r / h : 0;
    out[0] = x * q;
    out[2] = z * q;
    out[1] = y - (K.chinL || 0) * 0.04 * sm(-0.45, -0.85, y);
    return out;
  }

  /** Mouth geometry constants in unit-head space. */
  const MOUTH_Y = -0.43;

  /**
   * Sculpt one unit-sphere direction into the skull. Returns the displaced
   * unit-space point in out[0..2] and baked occlusion/warmth in out[3..5].
   * opts: {noSocket, noRecess}
   */
