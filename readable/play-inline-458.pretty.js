/* src/characters/22_face.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: dialogue-grade FACES
 * Owned by: characters.
 *
 * Replaces the old sculpted-sphere head (H.head) with a close-up quality
 * face built for the FO3/NV dialogue camera:
 *
 *  • SKULL: a custom lat/long grid whose rows & columns are concentrated on
 *    the face (≈3× the density of a uniform sphere around eyes, nose and
 *    mouth). Sculpted analytically: brow ridge, deep eye sockets, upper-lid
 *    fold, cheekbones, cheek hollows, nasolabial folds, a real nose (bridge,
 *    tip, alae), philtrum, a mouth recess (dark oral cavity that opens with
 *    the jaw), chin, square/soft jaw. Maniac (gaunt cheeks; the face
 *    texture adds the ash-grey cracks & burn scars) and brute (lumpy
 *    cranium, huge brow, underbite) variants.
 *  • FACE TEXTURE: the grid's (s,t) parameters ARE the face texture UVs, so
 *    the texture has the same "face-first" pixel density. A generic face
 *    (pores, tone variation, redness, under-eye darkness, lid creases,
 *    nostrils, oral cavity, T-zone/lip roughness in alpha) is painted once;
 *    each template near the camera gets its own copy with brows in the hair
 *    colour, stubble, age lines, freckles, scars, dirt, raider war paint,
 *    Maniac grime, scabs & tired bloodshot sockets, old fire burns, or brute veining.
 *    (see the CHAR_MAP shader chunk in 00_lib: uv.x ≥ 2 → face texture)
 *  • EYES: eyeballs on their own bones (saccades/eye contact), sclera
 *    shading, a domed iris with painted fibres/limbal ring/pupil, a fixed
 *    catchlight, upper & lower lids on bones (blinks, squint, wide), lash
 *    line + lashes, a wet lower-lid line.
 *  • MOUTH: separate upper & lower lips (cupid's bow, fuller lower lip),
 *    upper/lower teeth, tongue and a dark throat; chin/jaw skin is skinned
 *    to the anatomical jaw hinge, lip corners & cheeks to mouth-corner bones,
 *    forehead skin to brow bones — the face actually deforms.
 *
 * Face bones (children of 'head'): eyeL/R, lidL/R, lidLoL/R, browL/R,
 * mouthL/R, lipU (+ 'jaw' from the skeleton). Driven by L.FaceCtl
 * (15_face_anim.js). Template meta: meta.faceRig (rest data), meta.face.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !G.chars || !G.chars._lib || !G.chars._lib.human) return;
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
  function sculpt(face, x, y, z, out, opts) {
    const K = face._k;
    const mutant = K.mutant,
      female = K.female;
    let shade = 1,
      warm = 0;
    // BASE FORM: the unit sphere is re-lofted through per-height cross-sections
    // (flat-sided cranium, front/side planes on the face, a square jaw with a
    // gonial corner, forward chin). Features below are evaluated in the
    // ORIGINAL direction space (so they stay registered to the face texture)
    // and the loft delta is added at the end.
    loft(K, x, y, z, _lo);
    const dX = _lo[0] - x,
      dY = _lo[1] - y,
      dZ = _lo[2] - z;
    // temples: a shallow hollow behind the lateral brow (front half only)
    const gt = K.gaunt || 0; // 0 = ordinary, ~0.6 = a Maniac
    x *=
      1 -
      (0.025 + 0.035 * gt) *
        sm(0.7, 0.8, Math.abs(x)) *
        band(y, -0.2, 0.3, 0.08) *
        sm(0.2, -0.3, z);
    const f = sm(0.15, 0.7, -z); // front-facing weight
    if (f > 0) {
      // forehead: gently sloped back, fuller on women
      z += (female ? 0.0 : 0.02) * sm(0.45, 0.8, y) * f;
      // brow ridge
      const bw =
        Math.exp(-Math.pow((y - 0.29) / 0.085, 2)) * sm(0.8, 0.3, Math.abs(x));
      z -= ((female ? 0.07 : 0.088) * K.browK + (mutant ? 0.11 : 0)) * bw * f;
      shade -=
        0.16 *
        Math.exp(-Math.pow((y - 0.2) / 0.05, 2)) *
        sm(0.7, 0.3, Math.abs(x)) *
        f; // under the brow
      for (const sg of [-1, 1]) {
        const dx = x - sg * 0.355,
          dy = y - 0.125;
        // eye sockets: flat-bottomed, the eyeball sits in them
        if (!opts || !opts.noSocket) {
          const e = Math.exp(
            -Math.pow((dx * dx) / 0.016 + (dy * dy) / 0.0105, 1.5),
          );
          z += K.socket * e * f;
          shade -= 0.3 * e * f;
        }
        // upper-lid fold under the brow and a soft lower-lid bag
        if (!mutant) {
          z -=
            0.022 *
            Math.exp(
              -Math.pow(dx / 0.13, 2) - Math.pow((y - 0.215) / 0.035, 2),
            ) *
            f;
          z -=
            (0.012 + K.age * 0.012) *
            Math.exp(-Math.pow(dx / 0.11, 2) - Math.pow((y - 0.02) / 0.03, 2)) *
            f;
        }
        // cheekbones
        const cb = gau(x - sg * 0.5, y + 0.04, 0.026);
        z -= lerp(0.045, 0.012, gt) * K.zyg * cb * f;
        x += sg * 0.03 * K.zyg * cb;
        warm += mutant ? 0 : cb * (female ? 0.4 : 0.14);
        shade += 0.04 * K.zyg * cb * f; // the cheekbone plane catches the light
        // zygomatic arch running back to the ear, and the sub-zygomatic hollow under it
        const ax0 = Math.abs(x);
        const arch =
          Math.exp(-Math.pow((y + 0.02 - 0.06 * (ax0 - 0.6)) / 0.055, 2)) *
          sm(0.5, 0.72, ax0) *
          sm(0.35, -0.05, z) *
          (x * sg > 0 ? 1 : 0);
        x += sg * 0.022 * K.zyg * arch;
        const sub = gau(x - sg * 0.6, y + 0.28, 0.022) * sm(0.35, -0.3, z);
        x -= sg * lerp(0.018 + K.age * 0.015, 0.07, gt) * sub;
        shade -= lerp(0.05, 0.14, gt) * sub;
        // cheek hollows (gaunt on Maniacs)
        const hc = gau(x - sg * 0.48, y + 0.32, 0.03);
        z += lerp(0.02 + K.age * 0.02, 0.08, gt) * hc * f;
        shade -= lerp(0.05, 0.16, gt) * hc * f;
        // nasolabial folds
        const nd = segD(x, y, sg * 0.14, -0.21, sg * 0.3, -0.47);
        const nf = Math.exp(-Math.pow(nd / 0.03, 2)) * f;
        z += (0.02 + K.age * 0.018) * nf;
        shade -= 0.12 * nf * (1 + K.age * 0.6);
        // cheek volume beside the fold
        if (gt < 0.5)
          z -= 0.02 * (1 - gt) * gau(x - sg * 0.36, y + 0.3, 0.012) * f;
      }
      {
        // ---- NOSE: bridge → tip → columella, with alae
        const ns = K.nose;
        const nr = clamp((0.17 - y) / 0.34, 0, 1);
        // (r2: ~12 % more projection — in profile the nose read as a small bump on a flat face)
        let p =
          0.034 +
          0.152 * (0.5 * nr + 0.5 * Math.pow(nr, 1.7)) * K.noseL +
          0.016 * K.hump * Math.exp(-Math.pow((y - 0.0) / 0.07, 2)); // straight bridge (+ hump)
        p *= sm(0.34, 0.16, y);
        if (y < -0.17) p = 0.186 * Math.pow(sm(-0.29, -0.17, y), 0.55);
        if (mutant) p *= 0.75;
        const w =
          (0.062 + 0.058 * sm(0.05, -0.2, y)) *
          (mutant ? 1.5 : 1) *
          (0.9 + ns * 0.1);
        const nose = p * Math.exp(-Math.pow((x * x) / (w * w), 1.6)); // flat-topped bridge with distinct side planes
        z -= nose * f * ns;
        for (const sg of [-1, 1]) {
          const al = gau(x - sg * 0.1 * (mutant ? 1.3 : 1), y + 0.228, 0.0028);
          z -= 0.06 * al * f * ns;
          shade -=
            0.07 *
            Math.exp(
              -Math.pow(
                (Math.hypot(x - sg * 0.1, (y + 0.228) * 1.2) - 0.065) / 0.014,
                2,
              ),
            ) *
            f; // alar crease
        }
        z -= 0.03 * gau(x * 0.8, y + 0.185, 0.005) * f * ns; // rounded tip (bulb)
        shade +=
          0.05 * Math.exp(-(x * x) / 0.004) * band(y, -0.18, 0.15, 0.05) * f; // lit bridge
        // philtrum groove & ridges
        const ph = band(y, -0.37, -0.27, 0.02);
        z += 0.012 * Math.exp(-(x * x) / 0.0012) * ph * f;
        z -=
          0.006 *
          (Math.exp(-Math.pow((x - 0.05) / 0.02, 2)) +
            Math.exp(-Math.pow((x + 0.05) / 0.02, 2))) *
          ph *
          f;
      }
      // cavity occlusion that reads under flat/ambient light: sides of the
      // nose, under the nose, inner eye corners, mouth corners, temples
      if (!mutant) {
        const ax = Math.abs(x);
        shade -=
          0.13 *
          Math.exp(-Math.pow((ax - 0.14) / 0.045, 2)) *
          band(y, -0.2, 0.1, 0.05) *
          f;
        shade -=
          (female ? 0.035 : 0.06) *
          Math.exp(-(x * x) / 0.012) *
          Math.exp(-Math.pow((y + 0.3) / 0.03, 2)) *
          f; // (0.1 read as a moustache on pale skin)
        shade -=
          0.14 *
          Math.exp(-(Math.pow(ax - 0.2, 2) + Math.pow(y - 0.1, 2)) / 0.004) *
          f;
        shade -=
          0.2 *
          Math.exp(
            -(
              Math.pow(ax - K.mouthW * 1.02, 2) / 0.0018 +
              Math.pow(y - MOUTH_Y, 2) / 0.0025
            ),
          ) *
          f;
        shade -=
          0.07 *
          Math.exp(-Math.pow((ax - 0.78) / 0.12, 2)) *
          band(y, 0.05, 0.4, 0.1) *
          f;
      }
      // muzzle (orbicularis) and the MOUTH RECESS (oral cavity behind the lips)
      z -= (mutant ? 0.08 : 0.024) * gau(x * 0.8, y - MOUTH_Y, 0.03) * f;
      if (!opts || !opts.noRecess) {
        const rw = K.mouthW + 0.01;
        const rm =
          Math.exp(-Math.pow((x / rw) * (x / rw), 2.5)) *
          Math.exp(-Math.pow((y - MOUTH_Y) / 0.042, 2));
        z += 0.17 * rm * f;
        shade -= 0.45 * rm * f;
      }
      // chin
      const cn = gau(x * (female ? 1.3 : 1), y + 0.72, 0.03);
      z -= (female ? 0.04 : 0.07) * cn * f;
      if (!female) x *= 1 + 0.08 * cn;
      z += 0.018 * gau(x * 0.7, y + 0.6, 0.004) * f;
      shade -= 0.08 * gau(x, y + 0.6, 0.006) * f; // mentolabial sulcus
    }
    if (mutant) {
      if (y > 0.1) {
        const nn = L.noise3(x * 2.6 + 1.3, y * 2.6, z * 2.6) - 0.5;
        const k = sm(0.1, 0.25, y);
        x *= 1 + nn * 0.12 * k;
        y *= 1 + nn * 0.08 * k;
        z *= 1 + nn * 0.12 * k;
      }
      if (y < -0.4) {
        const k = sm(-0.4, -0.8, y);
        z -= 0.11 * k * sm(0.3, 0.1, z);
        x *= 1 + 0.12 * k;
      }
    }
    if (y < -0.62)
      shade -= 0.2 * sm(-0.66, -0.97, y) * (1 - 0.75 * sm(0.2, 0.7, -z));
    x += dX;
    y += dY;
    z += dZ;
    // under the jaw: a plane rising from the chin back to the throat (the
    // mandible's lower border reads as a crisp line from chin to gonion)
    if (y < -0.5) {
      const yu = -0.835 + 0.3 * sm(-0.75, 0.25, z) - 0.035 * (K.chinL || 0);
      const kk = 0.05,
        h = Math.max(kk - Math.abs(y - yu), 0) / kk;
      const ny = Math.max(y, yu) + h * h * kk * 0.25; // smooth max: points below the plane are lifted onto it
      shade -= 0.14 * clamp((ny - y) / 0.1, 0, 1);
      y = ny;
    }
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = clamp(shade, 0.4, 1.08);
    out[4] = warm;
    out[5] = 0;
    return out;
  }
  /** Sculpted surface point (unit space) roughly in front of (x, y). */
  function surfAt(face, x, y, opts) {
    const o = [0, 0, 0, 0, 0, 0];
    const z = -Math.sqrt(Math.max(0.02, 1 - x * x - y * y));
    return sculpt(face, x, y, z, o, opts);
  }

  // ==================================================================
  // FACE SKIN WEIGHTS (chin → jaw hinge, lip corners, brows, lids)
  // ==================================================================
  function faceSkin(K, ux, uy, uz, part) {
    const cand = [];
    const ax = Math.abs(ux),
      mw = K.mouthW;
    const side = ux < 0 ? "L" : "R"; // skeleton convention: 'L' is the −X side
    // ---- jaw: everything below a line from the mouth corners back to the ear lobes
    let jw = 0;
    if (part === "lowerLip" || part === "lowerTeeth") jw = 1;
    else if (part !== "upperLip") {
      const yl = MOUTH_Y + Math.max(0, ax - mw * 0.95) * 0.34;
      const inMouth = sm(mw + 0.05, mw - 0.02, ax) * sm(-0.2, -0.6, uz);
      const fe = lerp(0.075, 0.012, inMouth);
      jw = sm(yl + fe * 0.35, yl - fe, uy) * sm(0.45, 0.1, uz);
      if (uy < -0.93) jw *= sm(0.1, -0.3, uz); // bottom cap (inside the neck) mostly stays
    }
    if (jw > 0.004) cand.push(["jaw", jw]);
    // ---- mouth corners (and the cheeks they pull on)
    const sg = ux < 0 ? -1 : 1;
    let wc = 0;
    if (part === "upperLip" || part === "lowerLip")
      wc = sm(0.25, 1.0, ax / mw) * 0.95;
    else if (part !== "lowerTeeth" && part !== "teeth") {
      wc =
        0.85 *
          Math.exp(
            -(Math.pow(ux - sg * mw, 2) + Math.pow(uy - MOUTH_Y, 2)) / 0.02,
          ) +
        0.32 *
          Math.exp(
            -(Math.pow(ux - sg * 0.45, 2) + Math.pow(uy + 0.1, 2)) / 0.03,
          );
      wc *= sm(0.35, -0.2, uz);
    }
    if (wc > 0.004) cand.push(["mouth" + side, Math.min(1, wc)]);
    // ---- upper lip / philtrum
    let wu = 0;
    if (part === "upperLip") wu = (1 - sm(0.25, 1.0, ax / mw)) * 0.9;
    else if (!part)
      wu =
        0.55 *
        Math.exp(-((ux * ux) / 0.03 + Math.pow(uy + 0.345, 2) / 0.004)) *
        sm(MOUTH_Y - 0.01, MOUTH_Y + 0.03, uy) *
        sm(0.2, -0.3, uz);
    if (wu > 0.004) cand.push(["lipU", wu]);
    if (!part) {
      // ---- brows drag the forehead skin
      const dy = uy - 0.3;
      const wb =
        Math.exp(
          -(
            Math.pow(ux - sg * 0.33, 2) / 0.05 +
            (dy * dy) / (dy > 0 ? 0.07 : 0.009)
          ),
        ) *
        sm(0.14, 0.24, uy) *
        sm(0.4, -0.2, uz);
      if (wb > 0.004) cand.push(["brow" + side, wb * 0.95]);
      // ---- lower lids pull a little cheek skin with them (squint / smile)
      const wl =
        0.4 *
        Math.exp(
          -(
            Math.pow(ux - sg * 0.355, 2) / 0.012 +
            Math.pow(uy - 0.03, 2) / 0.005
          ),
        ) *
        sm(0.2, -0.5, uz);
      if (wl > 0.004) cand.push(["lidLo" + side, wl]);
    }
    cand.sort((a, b) => b[1] - a[1]);
    if (cand.length > 3) cand.length = 3;
    return cand;
  }

  // ==================================================================
  // LIP / TOOTH / LID GEOMETRY HELPERS
  // ==================================================================
  /**
   * Closed tube along the mouth width with an elliptical cross-section.
   * ctr(u) → [x,y,z] centre; radius(u) → [rv, rz]; tilt(u) → radians (front
   * points down for +tilt); u ∈ [−1,1]. uv → the lips swatch.
   */
  function lipTube(ctr, radius, tilt, US, VS, swatch) {
    const pos = [],
      uv = [],
      idx = [];
    for (let i = 0; i <= US; i++) {
      const u = -1 + (2 * i) / US;
      const c = ctr(u),
        r = radius(u),
        tl = tilt(u);
      const ct = Math.cos(tl),
        st = Math.sin(tl);
      for (let k = 0; k <= VS; k++) {
        const a = (k / VS) * PI * 2;
        const ly = r[0] * Math.sin(a),
          lz = -r[1] * Math.cos(a); // front at a = 0
        // rotate about x by -tilt (front goes down for +tilt)
        const yy = ly * ct + lz * st,
          zz = -ly * st + lz * ct;
        pos.push(c[0], c[1] + yy, c[2] + zz);
        uv.push(
          (swatch[0] + swatch[2] * (i / US)) / FT,
          (swatch[1] + swatch[3] * (0.5 + 0.5 * Math.sin(a))) / FT,
        );
      }
    }
    const W = VS + 1;
    for (let i = 0; i < US; i++)
      for (let k = 0; k < VS; k++) {
        const a = i * W + k,
          b = a + 1,
          c = a + W,
          d = c + 1;
        idx.push(a, b, c, b, d, c); // CCW seen from outside
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    weldNormals(g);
    return g;
  }
  /** Replace a geometry's uv with face-map params projected from the head centre. */
  function projectUV(g, toUnit) {
    const pos = g.attributes.position,
      n = pos.count;
    const uv = new Float32Array(n * 2),
      o = [0, 0],
      u = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      toUnit(pos.getX(i), pos.getY(i), pos.getZ(i), u);
      FM.param(u[0], u[1], u[2], o);
      uv[i * 2] = o[0];
      uv[i * 2 + 1] = o[1];
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return g;
  }
  /** Thin tube along an arc (lid margins, lash lines). */
  function arcTube(pts, r) {
    return P.sweep(pts, r, { seg: Math.max(6, pts.length), rs: 4 });
  }

  // ==================================================================
  // THE HEAD
  // ==================================================================
  /**
   * face: {skin, gender, hair, hairColor, beard, eyeColor, maniac, burn, scars,
   *        age (0..1), paint ('raider'|null), paintSeed, noseSize, jawW, brow,
   *        mutant, lipColor, angry, skinPaint, seed}
   */
  H.head = function (R, b, face) {
    const hs = b.headS;
    const C = [0, 0.105 * hs, -0.01 * hs];
    // (r2: skull 9 % narrower — 0.09 made a 19 cm wide head: faces read as wide
    //  potatoes with the eyes too close together for the face; hats & masks follow, see H.HEAD_X)
    const RX = 0.082 * hs,
      RY = 0.118 * hs,
      RZ = 0.103 * hs;
    const mutant = !!face.mutant,
      female = face.gender === "f",
      maniac = !!face.maniac;
    const K = (face._k = {
      mutant,
      female,
      maniac,
      gaunt: face.gaunt !== undefined ? face.gaunt : maniac ? 0.6 : 0,
      jawW: (face.jawW || (female ? 0.74 : 0.82)) * 0.97,
      browK: (face.brow || 1) * (female ? 0.7 : 1),
      nose: face.noseSize || 1,
      age: clamp(face.age || 0, 0, 1),
      mouthW: mutant ? 0.3 : female ? 0.235 : 0.25,
      socket: 0,
    });
    // per-seed skull & face proportions (templates differ in bone structure, not only colour)
    {
      const fr = L.rng(((face.seed || 7) * 2246822519 + 3266489917) >>> 0);
      const jw0 = face.jawW || (female ? 0.72 : 0.81);
      K.sw = (face.skullW || fr.range(0.955, 1.035)) * 1; // cranium breadth
      K.cw = K.sw * fr.range(0.975, 1.035) * (maniac ? 0.97 : 1); // cheek width
      K.gw =
        (female ? 0.9 : 1) *
        clamp(jw0 / (female ? 0.72 : 0.81), 0.86, 1.1) *
        (maniac ? 0.95 : 1) *
        (mutant ? 1.12 : 1); // jaw at the gonion
      K.chinW = female ? fr.range(0.82, 0.95) : fr.range(0.92, 1.12);
      K.chinF = mutant ? 1.3 : face.chinF || fr.range(0.6, 1.5); // chin projection
      K.chinL = fr.range(-0.6, 0.8); // chin length
      K.sq =
        face.sq !== undefined
          ? face.sq
          : female
            ? fr.range(-0.3, 0.1)
            : fr.range(-0.1, 0.45); // jaw squareness
      K.zyg = (face.zyg || fr.range(0.65, 1.4)) * (maniac ? 1.2 : 1); // cheekbones
      K.hump = female ? fr.range(-0.4, 0.3) : fr.range(-0.3, 1.0); // nasal hump
      K.noseL = fr.range(0.92, 1.1);
      if (!face.brow) K.browK *= fr.range(0.8, 1.25);
    }
    const at = (x, y, z) => [C[0] + x * RX, C[1] + y * RY, C[2] + z * RZ];
    const HW = R.world("head");
    const toUnitW = (wx, wy, wz, o) => {
      o[0] = (wx - HW[0] - C[0]) / RX;
      o[1] = (wy - HW[1] - C[1]) / RY;
      o[2] = (wz - HW[2] - C[2]) / RZ;
      return o;
    };
    const skinCol = face.skin;
    const skinPaint = face.skinPaint || null; // grime, scabs and burns on the face come from the face texture
    const skinBase = {
      color: skinCol,
      region: "skin",
      rough: 0.74,
      noise: maniac ? 0.06 : 0.03,
      grad: [0.94, 1.03],
      paint: skinPaint,
      cls: 2,
    };

    // ---- eye metrics (metres, head-local)
    const re = (mutant ? 0.0092 : 0.0118) * hs;
    K.socket = (re * (mutant ? 1.05 : 1.0)) / RZ;
    const eyePre = surfAt(face, 0.355, 0.125, { noSocket: true });
    const eyeC = at(0.355, 0.125, eyePre[2]);
    eyeC[2] += re * (mutant ? 1.25 : 1.0); // cornea apex level with the brow/cheek plane
    const eyeY = eyeC[1];

    // ---- face bones (children of head; jaw comes from the skeleton)
    const hasFaceBones = R.has("head") && !R.has("eyeL");
    const mouthPre = [];
    for (const sg of [-1, 1])
      mouthPre.push(surfAt(face, sg * K.mouthW, MOUTH_Y, { noRecess: true }));
    const mouthC = surfAt(face, 0, MOUTH_Y, { noRecess: true });
    const lipUc = surfAt(face, 0, MOUTH_Y + 0.07, { noRecess: true });
    if (hasFaceBones) {
      for (const [S, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        R.bone("eye" + S, "head", sg * eyeC[0], eyeC[1], eyeC[2], "head");
        R.bone("lid" + S, "head", sg * eyeC[0], eyeC[1], eyeC[2], "head");
        R.bone("lidLo" + S, "head", sg * eyeC[0], eyeC[1], eyeC[2], "head");
        const bp = surfAt(face, sg * 0.33, 0.3);
        R.bone(
          "brow" + S,
          "head",
          C[0] + bp[0] * RX,
          C[1] + bp[1] * RY,
          C[2] + bp[2] * RZ,
          "head",
        );
        const mp = mouthPre[sg < 0 ? 0 : 1];
        R.bone(
          "mouth" + S,
          "head",
          C[0] + mp[0] * RX,
          C[1] + mp[1] * RY,
          C[2] + mp[2] * RZ,
          "head",
        );
      }
      R.bone(
        "lipU",
        "head",
        C[0],
        C[1] + lipUc[1] * RY,
        C[2] + lipUc[2] * RZ,
        "head",
      );
    }
    const skinFn = (part) =>
      hasFaceBones
        ? (wx, wy, wz) => {
            const u = toUnitW(wx, wy, wz, [0, 0, 0]);
            return faceSkin(K, u[0], u[1], u[2], part);
          }
        : undefined;

    // ---- SKULL
    const g = headGrid(GRID_M, GRID_N);
    const posA = g.attributes.position,
      nV = posA.count;
    const vt = new Float32Array(nV * 3);
    const o6 = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < nV; i++) {
      sculpt(face, posA.getX(i), posA.getY(i), posA.getZ(i), o6);
      const shade = o6[3],
        warm = o6[4];
      vt[i * 3] = shade * (1 + warm * 0.06);
      vt[i * 3 + 1] = shade * (1 - warm * 0.025);
      vt[i * 3 + 2] = shade * (1 - warm * 0.035);
      posA.setXYZ(i, C[0] + o6[0] * RX, C[1] + o6[1] * RY, C[2] + o6[2] * RZ);
    }
    g.computeVertexNormals();
    weldNormals(g);
    R.add(
      "head",
      g,
      Object.assign({}, skinBase, {
        vtint: vt,
        faceUV: true,
        noDouble: true,
        skin: skinFn(null),
      }),
    );

    // ---- EYES
    const eyeWhite = maniac ? 0xe4b2a6 : mutant ? 0xd8c890 : 0xeae4da; // Maniacs: bloodshot
    const iris = face.eyeColor || 0x4a3422;
    const toUnitLocal = (ox, oy, oz) => (x, y, z, o) => {
      o[0] = (x + ox - C[0]) / RX;
      o[1] = (y + oy - C[1]) / RY;
      o[2] = (z + oz - C[2]) / RZ;
      return o;
    };
    const lidOpen = 0.3,
      lidLow = 0.44; // rest elevation of the upper / lower lid margins (radians)
    const rl = re * 1.085,
      rl2 = re * 1.07;
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      const eb = hasFaceBones ? "eye" + S : "head";
      const ex = sg * eyeC[0];
      const off = hasFaceBones ? [0, 0, 0] : [ex, eyeC[1], eyeC[2]];
      // sclera: whiter toward the iris, pinker & darker toward the corners
      const scl = P.xf(P.sphere(re, re, re, 12, 9), off[0], off[1], off[2]);
      R.add(eb, scl, {
        color: eyeWhite,
        rough: 0.16,
        noise: 0.015,
        grad: [1, 1],
        rigid: true,
        cls: 0,
        paint: (x, y, z, nx, ny, nz, out) => {
          const k = Math.pow(clamp(-nz, 0, 1), 0.6);
          out[0] *= lerp(0.8, 1, k);
          out[1] *= lerp(0.64, 1, k);
          out[2] *= lerp(0.62, 1, k);
        },
      });
      // iris: a slightly domed cap sampling the painted iris swatch (fibres, limbal ring, pupil)
      const ia = mutant ? 0.62 : 0.52;
      const ir = P.sphere(
        re * 1.012,
        re * 1.012,
        re * 1.012,
        14,
        4,
        0,
        PI * 2,
        0,
        ia,
      );
      P.xf(ir, 0, 0, 0, -PI / 2, 0, 0);
      {
        const pa = ir.attributes.position,
          uvA = new Float32Array(pa.count * 2),
          rr = re * Math.sin(ia);
        for (let i = 0; i < pa.count; i++) {
          const u = pa.getX(i) / rr,
            v = pa.getY(i) / rr;
          uvA[i * 2] = (SW.iris[0] + SW.iris[2] * (0.5 + 0.47 * u)) / FT;
          uvA[i * 2 + 1] = (SW.iris[1] + SW.iris[3] * (0.5 - 0.47 * v)) / FT;
          // cornea bulge
          const d = Math.min(1, Math.hypot(u, v));
          pa.setZ(i, pa.getZ(i) - re * 0.07 * (1 - d * d));
        }
        ir.setAttribute("uv", new THREE.BufferAttribute(uvA, 2));
        ir.computeVertexNormals();
      }
      P.xf(ir, off[0], off[1], off[2]);
      R.add(eb, ir, {
        color: iris,
        rough: 0.06,
        noise: 0,
        grad: [1, 1],
        faceUV: true,
        rigid: true,
        cls: 0,
        noDouble: true,
      });
      // catchlight (fixed to the head: highlights don't roll with the eye)
      R.add(
        "head",
        P.xf(
          P.sphere(re * 0.075, re * 0.075, re * 0.03, 6, 4),
          ex - re * 0.28,
          eyeY + re * 0.3,
          eyeC[2] - re * 1.02,
        ),
        { color: 0xffffff, emis: 0.7, rough: 0.05, noise: 0, grad: [1, 1] },
      );

      // ---- lids (upper on lid bone, lower on lidLo bone; both pivot at the eye centre)
      // ALMOND aperture: the margins are curves on the eyeball sphere, highest
      // (upper) / lowest (lower) slightly off-centre, meeting at the medial &
      // lateral canthi well inside the eyeball silhouette (lateral canthus a
      // touch higher = positive canthal tilt). Beyond the canthi the two lids
      // overlap, so no sclera ever shows round the sides ("staring" look).
      const ub = hasFaceBones ? "lid" + S : "head",
        lb = hasFaceBones ? "lidLo" + S : "head";
      const lidM = Object.assign({}, skinBase, {
        faceUV: true,
        rough: 0.55,
        noDouble: true,
      }); // inner side only ever faces the eyeball
      const lat = (ph) => ph * sg > 0; // lateral half (toward the ear)
      const phC = (ph) => (lat(ph) ? 0.4 : 0.35) * PI;
      const eC = (ph) =>
        (lat(ph) ? 0.03 + (female ? 0.03 : 0) : -0.07) + (mutant ? -0.05 : 0);
      const upPeak = -sg * 0.06,
        loPeak = sg * 0.08; // upper peak a little medial, lower dip a little lateral
      const mU = (ph) => {
        const q = Math.abs(ph - upPeak) / phC(ph);
        const e0 = lidOpen * (mutant ? 0.7 : 1);
        return q <= 1
          ? lerp(e0, eC(ph), Math.pow(q, 2.3))
          : eC(ph) - (q - 1) * 1.1;
      };
      const mL = (ph) => {
        const q = Math.abs(ph - loPeak) / phC(ph);
        return q <= 1
          ? lerp(-lidLow, eC(ph), Math.pow(q, 1.7))
          : eC(ph) + (q - 1) * 1.1;
      };
      /** lid shell: rows from the margin curve m(ph) to elevation `far`, cols over ±PH */
      const lidShell = (r, m, far, WS, HS) => {
        const PH = PI * 0.62,
          pos = [],
          idx = [];
        for (let j = 0; j <= HS; j++) {
          const t = Math.pow(j / HS, 1.5);
          for (let i = 0; i <= WS; i++) {
            const ph = -PH + (2 * PH * i) / WS,
              e = lerp(m(ph), far, t);
            pos.push(
              r * Math.cos(e) * Math.sin(ph) + off[0],
              r * Math.sin(e) + off[1],
              -r * Math.cos(e) * Math.cos(ph) + off[2],
            );
          }
        }
        const W = WS + 1;
        for (let j = 0; j < HS; j++)
          for (let i = 0; i < WS; i++) {
            const a = j * W + i;
            idx.push(a, a + 1, a + W, a + 1, a + W + 1, a + W);
          }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        // face outward (away from the eye centre)
        const nA = g.attributes.normal,
          k = Math.floor(W * (HS >> 1) + (WS >> 1));
        const ox = pos[k * 3] - off[0],
          oy = pos[k * 3 + 1] - off[1],
          oz = pos[k * 3 + 2] - off[2];
        if (nA.getX(k) * ox + nA.getY(k) * oy + nA.getZ(k) * oz < 0) {
          for (let q = 0; q < idx.length; q += 3) {
            const tq = idx[q + 1];
            idx[q + 1] = idx[q + 2];
            idx[q + 2] = tq;
          }
          g.setIndex(idx);
          g.computeVertexNormals();
        }
        return g;
      };
      const up = lidShell(rl, mU, PI * 0.5 + 0.3, 18, 6);
      projectUV(
        up,
        toUnitLocal(
          hasFaceBones ? ex : 0,
          hasFaceBones ? eyeC[1] : 0,
          hasFaceBones ? eyeC[2] : 0,
        ),
      );
      R.add(ub, up, lidM);
      const lo = lidShell(rl2, mL, -(PI * 0.5 + 0.2), 18, 5);
      projectUV(
        lo,
        toUnitLocal(
          hasFaceBones ? ex : 0,
          hasFaceBones ? eyeC[1] : 0,
          hasFaceBones ? eyeC[2] : 0,
        ),
      );
      R.add(lb, lo, lidM);
      // lid margins: dark lash line above, wet line below; upper lashes
      const rim = (r, m, a0, a1, n) => {
        const pts = [];
        for (let i = 0; i <= n; i++) {
          const ph = lerp(a0, a1, i / n),
            e = m(ph);
          pts.push([
            r * Math.cos(e) * Math.sin(ph) + off[0],
            r * Math.sin(e) + off[1],
            -r * Math.cos(e) * Math.cos(ph) + off[2],
          ]);
        }
        return pts;
      };
      const rimU = rim(
        rl * 1.004,
        mU,
        -phC(-0.01) * 1.02,
        phC(0.01) * 1.02,
        14,
      );
      R.add(ub, arcTube(rimU, re * 0.075), {
        color: maniac ? 0x3a1a12 : 0x1e130c,
        rough: 0.7,
        noise: 0.05,
        region: "fur",
        rigid: true,
        cls: 3,
      });
      if (!maniac && !mutant) {
        // lashes: a thin fringe curling out & up from the upper margin (longer toward the outer corner)
        const n = 14,
          lp = [],
          li = [];
        for (let i = 0; i <= n; i++) {
          const ph = lerp(-phC(-0.01) * 0.95, phC(0.01) * 0.95, i / n);
          const outer = lat(ph) ? 1.1 : 0.85;
          const len =
            (female ? 0.36 : 0.24) *
            re *
            (0.5 + 0.5 * Math.cos(ph * 1.15)) *
            outer;
          const e = mU(ph),
            ce = Math.cos(e),
            se = Math.sin(e);
          const bx = rl * ce * Math.sin(ph),
            by = rl * se,
            bz = -rl * ce * Math.cos(ph);
          const nx = Math.sin(ph),
            nz = -Math.cos(ph); // outward from the eye
          const tip = [
            bx + nx * len * 0.6,
            by + len * 0.62,
            bz + nz * len * 0.6,
          ];
          lp.push(
            bx + off[0],
            by + off[1],
            bz + off[2],
            tip[0] + off[0],
            tip[1] + off[1],
            tip[2] + off[2],
          );
        }
        for (let i = 0; i < n; i++) {
          const a = i * 2;
          li.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
        }
        const lg = new THREE.BufferGeometry();
        lg.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
        lg.setIndex(li);
        lg.computeVertexNormals();
        R.add(ub, lg, {
          color: L.shade(face.hairColor || 0x2a1a10, 0.5),
          rough: 0.9,
          noise: 0,
          region: "fur",
          rigid: true,
          keepDark: true,
          cls: 3,
        });
      }
      const rimL = rim(
        rl2 * 1.002,
        mL,
        -phC(-0.01) * 0.97,
        phC(0.01) * 0.97,
        12,
      );
      R.add(lb, arcTube(rimL, re * 0.05), {
        color: maniac ? 0x8a3a2c : 0xb87a6e,
        rough: 0.12,
        noise: 0.03,
        rigid: true,
        cls: 0,
      });
      // caruncle: the small pink fold in the inner corner
      if (!mutant) {
        const ph = -sg * phC(-sg) * 0.97,
          e = eC(-sg) - 0.02,
          r3 = rl2 * 0.99;
        R.add(
          "head",
          P.xf(
            P.sphere(re * 0.16, re * 0.2, re * 0.13, 6, 5),
            ex + r3 * Math.cos(e) * Math.sin(ph),
            eyeC[1] + r3 * Math.sin(e),
            eyeC[2] - r3 * Math.cos(e) * Math.cos(ph),
          ),
          {
            color: maniac ? 0x9a4a3c : 0xc27f78,
            rough: 0.2,
            noise: 0.03,
            rigid: true,
            cls: 0,
          },
        );
      }
    }

    // ---- MOUTH: cavity, teeth, tongue, lips
    const mw = K.mouthW;
    const mY = C[1] + MOUTH_Y * RY; // lip contact line (head-local)
    const surfZ = (ux) => {
      const p = surfAt(face, ux, MOUTH_Y, { noRecess: true });
      return C[2] + p[2] * RZ;
    };
    const zc = surfZ(0);
    const jawW = R.world("jaw");
    const jawLocal = [jawW[0] - HW[0], jawW[1] - HW[1], jawW[2] - HW[2]];
    const onJaw = (geo) => P.xf(geo, -jawLocal[0], -jawLocal[1], -jawLocal[2]); // head-local → jaw-local
    // (the throat is the mouth recess itself: painted dark & wet, it stretches open with the jaw)
    // teeth: slightly yellowed, some chipped / missing on Maniacs and raiders
    const trng = L.rng((face.seed || 7) * 31 + 5);
    const toothCol = maniac ? 0xc4b078 : mutant ? 0xcfc08a : 0xdcd2b4;
    const missing = (i) =>
      (maniac && trng() < 0.14) || (face.paint === "raider" && trng() < 0.12);
    const archZ = (u) => zc + 0.0078 * hs + u * u * 0.012 * hs;
    for (let i = 0; i < 10; i++) {
      const u = (i - 4.5) / 5.2;
      if (missing(i)) continue;
      const wdt =
        (Math.abs(u) < 0.25 ? 0.0078 : Math.abs(u) < 0.6 ? 0.0068 : 0.0072) *
        hs;
      const hgt = (Math.abs(u) < 0.25 ? 0.0105 : 0.0095) * hs;
      const tg = P.box(wdt, hgt, 0.0055 * hs, 0.0015 * hs, 1);
      P.xf(
        tg,
        u * mw * RX * 0.84 +
          (face.toothGap ? Math.sign(u) * face.toothGap * 0.0018 * hs : 0),
        mY + hgt * 0.5 + 0.0012 * hs - Math.abs(u) * 0.001 * hs,
        archZ(u),
        0,
        -u * 0.9,
        0,
      );
      R.add("head", tg, {
        color: L.shade(toothCol, 0.92 + trng() * 0.14),
        rough: 0.3,
        noise: 0.08,
        grad: [0.85, 1.05],
        rigid: true,
        cls: 0,
      });
    }
    // gums above the upper teeth (only visible when lips are drawn back)
    R.add(
      "head",
      P.xf(
        P.box(mw * RX * 1.7, 0.006 * hs, 0.008 * hs, 0.003 * hs, 1),
        0,
        mY + 0.0135 * hs,
        archZ(0) + 0.002 * hs,
      ),
      { color: 0x9a4a48, rough: 0.3, noise: 0.12, rigid: true, cls: 0 },
    );
    for (let i = 0; i < 10; i++) {
      const u = (i - 4.5) / 5.2;
      if (missing(i)) continue;
      const wdt = 0.0064 * hs,
        hgt = 0.0088 * hs;
      const tg = P.box(wdt, hgt, 0.005 * hs, 0.0014 * hs, 1);
      P.xf(
        tg,
        u * mw * RX * 0.78,
        mY - hgt * 0.5 - 0.0024 * hs,
        archZ(u) + 0.0028 * hs,
        0,
        -u * 0.9,
        0,
      );
      R.add("jaw", onJaw(tg), {
        color: L.shade(toothCol, 0.88 + trng() * 0.12),
        rough: 0.3,
        noise: 0.08,
        grad: [1.05, 0.85],
        rigid: true,
        cls: 0,
      });
    }
    // tongue
    R.add(
      "jaw",
      onJaw(
        P.xf(
          P.sphere(mw * RX * 0.7, 0.0062 * hs, 0.012 * hs, 8, 6),
          0,
          mY - 0.0085 * hs,
          zc + 0.0165 * hs,
        ),
      ),
      {
        color: 0xa04a48,
        rough: 0.28,
        noise: 0.06,
        grad: [0.8, 1.05],
        rigid: true,
        cls: 0,
      },
    );
    // lips: upper (cupid's bow, slopes forward-down) on head/lipU/corners; fuller lower lip on the jaw
    {
      const lipCol =
        face.lipColor ||
        (maniac
          ? L.mix(skinCol, 0x7a4a44, 0.4)
          : L.mix(skinCol, female ? 0x9a3a3c : 0x8e4a44, female ? 0.55 : 0.34));
      // lip shading: the upper lip faces down (darker), the contact line and
      // the inner lip roll into the mouth (dark), the lower lip catches light
      const lipShade = (upperLip) => (x, y, z, nx, ny, nz, out) => {
        let k = upperLip
          ? lerp(0.7, 1.0, L.smooth(-0.7, 0.4, ny))
          : lerp(0.82, 1.06, L.smooth(-0.2, 0.8, ny));
        k *= lerp(1, 0.38, L.smooth(-0.1, 0.55, nz)); // rolls inward → into the mouth
        k *= lerp(
          1,
          0.55,
          L.smooth(upperLip ? -0.35 : 0.35, upperLip ? -0.85 : 0.85, ny) *
            L.smooth(0.2, -0.4, nz) *
            0.6,
        ); // contact line
        out[0] *= k;
        out[1] *= k * 0.98;
        out[2] *= k * 0.98;
      };
      const lipM = {
        color: lipCol,
        rough: 0.42,
        noise: 0.03,
        grad: [1, 1],
        faceUV: true,
        cls: 2,
        noDouble: true,
      };
      const thin = maniac ? 0.9 : mutant ? 1.25 : 1;
      const zs = [];
      for (let i = 0; i <= 28; i++) zs.push(surfZ((-1 + (2 * i) / 28) * mw));
      const zAt = (u) => {
        const f = (u + 1) * 14,
          i = Math.min(27, Math.floor(f));
        return lerp(zs[i], zs[i + 1], f - i);
      };
      const upper = lipTube(
        (u) => {
          const rv = 0.0037 * hs * thin * (female ? 1.08 : 1);
          return [
            u * mw * RX,
            mY + rv * 0.95 * Math.pow(1 - u * u, 0.4) + 0.0003 * hs,
            zAt(u) + (0.0036 + 0.0045 * u * u) * hs,
          ];
        }, // sits on the dental arch; corners tuck into the cheeks
        (u) => {
          const k = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.3)), 0.55);
          const bow =
            1 -
            0.14 * Math.exp(-Math.pow(u / 0.13, 2)) +
            0.08 * Math.exp(-Math.pow((Math.abs(u) - 0.24) / 0.12, 2));
          const rv = 0.0037 * hs * thin * (female ? 1.08 : 1) * k * bow;
          return [rv, rv * 0.95 + 0.0006 * hs * k];
        },
        (u) => 0.32,
        20,
        8,
        SW.lips,
      );
      R.add(
        "head",
        upper,
        Object.assign({}, lipM, {
          color: L.shade(lipCol, 0.93),
          paint: lipShade(true),
          skin: skinFn("upperLip"),
        }),
      );
      const lower = lipTube(
        (u) => {
          const rv =
            0.004 * hs * thin * (female ? 1.12 : 1) * (mutant ? 1.3 : 1);
          return [
            u * mw * RX * 0.95,
            mY - rv * 0.9 * Math.pow(1 - u * u, 0.4) - 0.0002 * hs,
            zAt(u) + (0.0056 + 0.0045 * u * u) * hs,
          ];
        }, // lower lip BEHIND the upper
        (u) => {
          const k = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.2)), 0.65);
          const rv =
            0.004 * hs * thin * (female ? 1.12 : 1) * (mutant ? 1.3 : 1) * k;
          return [rv, rv * 0.9 + 0.0004 * hs * k];
        },
        (u) => -0.25,
        20,
        8,
        [
          SW.lips[0],
          SW.lips[1] + SW.lips[3] * 0.5,
          SW.lips[2],
          SW.lips[3] * 0.5,
        ],
      );
      R.add(
        "jaw",
        onJaw(lower),
        Object.assign({}, lipM, {
          color: L.shade(lipCol, 1.06),
          paint: lipShade(false),
          skin: skinFn("lowerLip"),
        }),
      );
    }

    // ---- EARS: flattened shell with a hollowed concha and a rolled helix
    for (const sg of [-1, 1]) {
      const e = at(sg * 0.975, -0.02, 0.06);
      const ear = P.sphere(
        0.0085 * hs,
        0.029 * hs * (mutant ? 0.8 : 1),
        0.018 * hs,
        10,
        8,
      );
      P.deform(ear, (v) => {
        // concha: push the outward face in, leaving a rolled rim
        const ry = v.y / (0.031 * hs),
          rz = v.z / (0.02 * hs);
        const d = Math.hypot(ry * 1.15, rz * 1.2 + 0.15);
        if (v.x > 0) v.x -= 0.0075 * hs * Math.exp(-Math.pow(d / 0.6, 4));
        if (v.x < 0) v.x *= 0.5; // flat against the skull
      });
      if (sg < 0) P.mirrorX(ear);
      P.xf(ear, e[0] + sg * 0.001 * hs, e[1], e[2], 0, sg * 0.22, 0);
      projectUV(ear, (x, y, z, o) => {
        o[0] = (x - C[0]) / RX;
        o[1] = (y - C[1]) / RY;
        o[2] = (z - C[2]) / RZ;
        return o;
      });
      R.add(
        "head",
        ear,
        Object.assign({}, skinBase, { faceUV: true, noDouble: true }),
      );
    }

    // ---- hair / beard (stubble is painted into the face texture)
    const hc = face.hairColor || 0x3a2616;
    // hair shells CONFORM to the sculpted skull (flat-sided cranium, forehead
    // slope, temples) instead of a plain ellipsoid: no gap/"helmet" rim at
    // the hairline, the kept edge ring lands exactly on the scalp
    face._skull = (x, y, z, o) =>
      sculpt(face, x, y, z, o, { noSocket: true, noRecess: true });
    if (face.hair && face.hair !== "none" && face.hair !== "bald")
      H.hair(R, b, face.hair, hc, C, RX, RY, RZ, face);
    face._skull = null;
    if (face.beard && face.beard !== "stubble") {
      if (!mutant)
        sculptedBeard(
          R,
          b,
          face,
          face.beard,
          hc,
          C,
          RX,
          RY,
          RZ,
          hasFaceBones ? skinFn(null) : null,
        );
      else
        H.beard(
          R,
          b,
          face.beard,
          hc,
          C,
          RX,
          RY,
          RZ,
          hasFaceBones ? skinFn(null) : undefined,
        );
    }

    // ---- metadata for the face controller and the face texture
    if (hasFaceBones) {
      R.meta.faceRig = {
        hs,
        re,
        lidOpen,
        lidLow,
        mouthW: mw * RX,
        mutant,
        maniac,
        female,
        mood:
          face.mood ||
          (face.angry || mutant ? "angry" : maniac ? "maniac" : null),
      };
    }
    // ---- eyewear fit: outfits add glasses BEFORE the head is built, so they
    // are deferred (b._pendingGlasses) and placed on the sculpted face here.
    {
      const sp = [0, 0, 0, 0, 0, 0];
      sculpt(face, 0.995, 0.125, -0.1, sp);
      const back = [0, 0, 0, 0, 0, 0];
      sculpt(face, 0, 0.125, 0.995, back);
      b._eyeFit = {
        x: eyeC[0],
        y: eyeY,
        cornea: eyeC[2] - re * (mutant ? 1.25 : 1.0) - re,
        re,
        side: C[0] + Math.abs(sp[0]) * RX,
        sideZ: C[2] + sp[2] * RZ,
        back: C[2] + back[2] * RZ * 1.04,
        brow: C[2] + surfAt(face, 0.2, 0.28)[2] * RZ,
        nose: C[2] + surfAt(face, 0, 0.14)[2] * RZ,
      };
      const pend = b._pendingGlasses;
      b._pendingGlasses = null;
      if (pend) for (const kind of pend) H.glasses(R, b, kind);
    }
    R.meta.face = {
      skin: skinCol,
      gender: face.gender,
      hairColor: hc,
      hair: face.hair,
      beard: face.beard,
      age: K.age,
      maniac,
      mutant,
      paint: face.paint || null,
      paintSeed: face.paintSeed || 0,
      seed: face.seed || face.paintSeed || 1,
      scars: face.scars,
      dirt: face.dirt,
      freckles: face.freckles,
      makeup: face.makeup,
      burn: face.burn || null,
      pallor: face.pallor || 0,
      eyeColor: iris,
      hairKeep: face._hairKeep || null,
    };
    return { C, RX, RY, RZ };
  };

  /**
   * SCULPTED BEARD: a shell that grows out of the sculpted face (instead of a
   * scaled sphere floating over it — that read as a black bandana/mask).
   * Coverage comes from the same beard mask the face texture paints stubble
   * with (plus a style mask), with a noisy, thinning edge: the ring next to the
   * edge lies ON the skin, so the beard grows out of a painted shadow instead
   * of ending in a cliff. Longer on the chin; lips stay clean; skinned to the
   * jaw / mouth-corner bones so it opens with the mouth.
   */
  function sculptedBeard(R, b, face, style, color, C, RX, RY, RZ, skin) {
    const ws = 46,
      hsg = 24;
    const th0 = Math.acos(-0.02); // shell starts below the eyes/lower lids (it would cover the eyeballs at 0.98)
    const g = P.shell(1, 1, 1, ws, hsg, 4.1, th0, PI - th0);
    const pos = g.attributes.position,
      n = pos.count;
    const mw = face._k.mouthW;
    const styleMask = (x, y, z) => {
      const mo =
        sm(mw + 0.08, mw - 0.02, Math.abs(x)) *
        band(y, MOUTH_Y + 0.045, MOUTH_Y + 0.13, 0.015) *
        sm(-0.55, -0.8, z); // moustache
      if (style === "moustache") return mo;
      let m = beardMask(x, y, z);
      if (style === "goatee")
        m *=
          Math.exp(-Math.pow(x / 0.3, 6)) *
          sm(MOUTH_Y + 0.02, MOUTH_Y - 0.04, y);
      return Math.max(m, mo);
    };
    // CONTINUOUS thickness from the (noisy) mask: outside it the shell lies
    // 2 % under the skin (hidden), inside it rises smoothly — the visible edge
    // is where the shell emerges from the skin, a smooth ragged contour
    // instead of grid-aligned stair steps from collapsed vertices.
    const o = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < n; i++) {
      const x = pos.getX(i),
        y = pos.getY(i),
        z = pos.getZ(i);
      const m =
        styleMask(x, y, z) +
        (L.noise3(x * 9 + 5, y * 9, z * 9) - 0.5) * 0.3 +
        (L.noise3(x * 31 + 2, y * 31, z * 31) - 0.5) * 0.12;
      const grow = sm(0.4, 0.78, m);
      sculpt(face, x, y, z, o, { noSocket: true, noRecess: true });
      const len =
        style === "full"
          ? 0.055 + 0.1 * sm(-0.55, -1.0, y)
          : style === "goatee"
            ? 0.05 + 0.07 * sm(-0.6, -1.0, y)
            : 0.045;
      // bare shell round the mouth is tucked deep (it must never span the open
      // mouth's cavity); elsewhere it stays just under the skin, so the rise
      // is gradual and the emergence contour smooth (a deep tuck next to a
      // grown vertex makes a steep wall whose skin crossing follows the grid)
      const mouthZone =
        Math.exp(
          -Math.pow(x / (mw + 0.05), 4) - Math.pow((y - MOUTH_Y) / 0.09, 4),
        ) * sm(-0.3, -0.7, z);
      const k = 0.98 + (len + 0.024) * grow - 0.26 * mouthZone * (1 - grow);
      let yy = o[1];
      if (style === "full" && y < -0.7)
        yy -= 0.12 * sm(-0.7, -0.98, y) * grow * grow; // chin beard hangs
      pos.setXYZ(
        i,
        C[0] + o[0] * RX * k,
        C[1] + yy * RY * k,
        C[2] + o[2] * RZ * k,
      );
    }
    g.computeVertexNormals();
    R.add("head", g, {
      color: L.shade(color, 0.92),
      region: "fur",
      rough: 0.95,
      noise: 0.16,
      grad: [0.9, 1.05],
      noDouble: true,
      skin: skin || undefined,
    });
  }

  // Beard shells follow the jaw (so full beards open with the mouth)
  const oldBeard = H.beard;
  H.beard = function (R, b, style, color, C, RX, RY, RZ, skin) {
    if (!skin) return oldBeard(R, b, style, color, C, RX, RY, RZ);
    const n0 = R.prims.length;
    oldBeard(R, b, style, color, C, RX, RY, RZ);
    // re-skin the beard prims just added (their geometry is already coloured & uv'd)
    for (let i = n0; i < R.prims.length; i++) {
      const p = R.prims[i],
        geo = p.geo,
        pos = geo.attributes.position,
        n = pos.count,
        bw = R.bones[p.bone].world;
      const idx = new Uint16Array(n * 4),
        w = new Float32Array(n * 4);
      for (let k = 0; k < n; k++) {
        const list = skin(
          pos.getX(k) + bw[0],
          pos.getY(k) + bw[1],
          pos.getZ(k) + bw[2],
        );
        let sum = 0,
          m = 0;
        idx[k * 4] = p.bone;
        for (const e of list) {
          const ob = R.map[e[0]];
          if (ob === undefined || m >= 3) continue;
          idx[k * 4 + 1 + m] = ob;
          w[k * 4 + 1 + m] = e[1];
          sum += e[1];
          m++;
        }
        if (sum > 1) {
          for (let q = 1; q <= m; q++) w[k * 4 + q] /= sum;
          sum = 1;
        }
        w[k * 4] = 1 - sum;
      }
      geo.userData.infl = { idx, w };
    }
  };

  // ==================================================================
  // FACE TEXTURES
  // ==================================================================
  // Pixel → direction lookup (per column / per row), built once.
  let colA = null,
    rowT = null;
  function ensureLUT() {
    if (colA) return;
    colA = new Float32Array(FT * 2);
    rowT = new Float32Array(FT * 2);
    for (let i = 0; i < FT; i++) {
      const a = fwd(TA, (i + 0.5) / FT),
        th = fwd(TT, Math.min(1, (i + 0.5) / (FT * TV)));
      colA[i * 2] = Math.sin(a);
      colA[i * 2 + 1] = Math.cos(a);
      rowT[i * 2] = Math.sin(th);
      rowT[i * 2 + 1] = Math.cos(th);
    }
  }
  const hash2 = (x, y) => {
    let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  /** unit-head point → canvas pixel */
  const _pp = [0, 0];
  function px(x, y, z) {
    FM.param(x, y, z, _pp);
    return [_pp[0] * FT, _pp[1] * FT];
  }
  function pxFront(x, y) {
    return px(x, y, -Math.sqrt(Math.max(0.02, 1 - x * x - y * y)));
  }

  /**
   * Generic face: every value is a MODULATION of the vertex skin colour
   * (0.5 = ×1), alpha = roughness multiplier.
   */
  function paintGeneric(ctx) {
    ensureLUT();
    const img = ctx.createImageData(FT, FT),
      D = img.data;
    for (let py = 0; py < FT; py++) {
      const st = rowT[py * 2],
        y = rowT[py * 2 + 1];
      for (let pxl = 0; pxl < FT; pxl++) {
        const x = st * colA[pxl * 2],
          z = -st * colA[pxl * 2 + 1];
        const f = sm(0.1, 0.6, -z);
        let r = 0.5,
          g = 0.5,
          b = 0.5,
          a = 1;
        // broad tone variation
        const n1 = L.noise3(x * 3.2 + 7, y * 3.2, z * 3.2) - 0.5;
        const n2 = L.noise3(x * 9 + 3, y * 9, z * 9) - 0.5;
        r *= 1 + 0.07 * n1 + 0.04 * n2;
        g *= 1 + 0.06 * n1 + 0.035 * n2;
        b *= 1 + 0.05 * n1 + 0.03 * n2;
        // redness: cheeks, nose tip, chin, ears, lower forehead near brows
        let red = 0;
        for (const sg of [-1, 1])
          red += 0.42 * gau((x - sg * 0.47) * 0.8, y + 0.16, 0.05); // broad & soft (tight blobs read as a doll's rouge)
        red +=
          1.0 * gau(x, y + 0.2, 0.006) +
          0.4 * gau(x, y + 0.72, 0.02) +
          0.6 * sm(0.85, 0.97, Math.abs(x)) * band(y, -0.3, 0.3, 0.1);
        red *= f + (Math.abs(x) > 0.85 ? 1 : 0);
        r *= 1 + 0.1 * red;
        g *= 1 - 0.07 * red;
        b *= 1 - 0.06 * red;
        // eye area: darker, cooler skin under and around the eyes; lid crease
        for (const sg of [-1, 1]) {
          const dx = x - sg * 0.355;
          const ue = Math.exp(
            -Math.pow(dx / 0.12, 2) - Math.pow((y - 0.03) / 0.05, 2),
          );
          r *= 1 - 0.13 * ue * f;
          g *= 1 - 0.15 * ue * f;
          b *= 1 - 0.06 * ue * f;
          const cr = Math.exp(
            -Math.pow(dx / 0.13, 2) - Math.pow((y - 0.205) / 0.012, 2),
          );
          r *= 1 - 0.18 * cr * f;
          g *= 1 - 0.2 * cr * f;
          b *= 1 - 0.18 * cr * f;
          const sock = Math.exp(
            -Math.pow((dx * dx) / 0.016 + Math.pow(y - 0.125, 2) / 0.0105, 1.5),
          );
          r *= 1 - 0.18 * sock * f;
          g *= 1 - 0.22 * sock * f;
          b *= 1 - 0.18 * sock * f;
          // nostrils (undersides of the alae)
          const no = Math.exp(
            -Math.pow((x - sg * 0.052) / 0.019, 2) -
              Math.pow((y + 0.27) / 0.011, 2),
          );
          r *= 1 - 0.55 * no * f;
          g *= 1 - 0.6 * no * f;
          b *= 1 - 0.6 * no * f;
          // nasolabial fold line
          const nd = segD(x, y, sg * 0.14, -0.21, sg * 0.3, -0.47);
          const nf = Math.exp(-Math.pow(nd / 0.014, 2)) * f;
          r *= 1 - 0.08 * nf;
          g *= 1 - 0.1 * nf;
          b *= 1 - 0.1 * nf;
        }
        // brows (generic: soft, medium-dark) — templates repaint in the hair colour
        // oral cavity: wet dark red, darker deeper in
        const rm =
          Math.exp(-Math.pow(Math.pow(x / 0.235, 2), 2.5)) *
          Math.exp(-Math.pow((y - MOUTH_Y) / 0.03, 2)) *
          f;
        if (rm > 0.01) {
          const k = clamp(rm * 1.3, 0, 1);
          r = lerp(r, 0.2, k);
          g = lerp(g, 0.07, k);
          b = lerp(b, 0.07, k);
          a = lerp(a, 0.45, k);
        }
        // pores: pixel-scale noise + dark pits (strongest on nose & cheeks)
        const hp = hash2(pxl, py),
          hq = hash2(pxl * 3 + 1, py * 7 + 2);
        const poreK =
          (0.6 +
            0.8 *
              (gau(x, y + 0.12, 0.03) +
                gau(x - 0.45, y + 0.1, 0.04) +
                gau(x + 0.45, y + 0.1, 0.04))) *
            f +
          0.3;
        const grain = (hp - 0.5) * 0.05 * poreK;
        r *= 1 + grain;
        g *= 1 + grain;
        b *= 1 + grain;
        if (hq > 0.955) {
          const k = 1 - 0.1 * poreK;
          r *= k;
          g *= k;
          b *= k;
        }
        // roughness: oily T-zone (forehead, nose), rougher cheeks
        const tz =
          (sm(0.3, 0.5, y) * sm(0.45, 0.2, Math.abs(x)) +
            Math.exp(-(x * x) / 0.012) * band(y, -0.25, 0.25, 0.05)) *
          f;
        a = Math.min(a, 1 - 0.14 * tz);
        D[(py * FT + pxl) * 4] = clamp(r, 0, 1) * 255;
        D[(py * FT + pxl) * 4 + 1] = clamp(g, 0, 1) * 255;
        D[(py * FT + pxl) * 4 + 2] = clamp(b, 0, 1) * 255;
        D[(py * FT + pxl) * 4 + 3] = clamp(a, 0.35, 1) * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    paintSwatches(ctx);
  }
  /** Iris (radial fibres, limbal ring, pupil) & lip creases. */
  function paintSwatches(ctx) {
    const [ix, iy, iw, ih] = SW.iris,
      cx = ix + iw / 2,
      cy = iy + ih / 2,
      R0 = iw / 2;
    ctx.save();
    ctx.fillStyle = "rgb(128,128,128)";
    ctx.fillRect(ix - 2, iy - 2, iw + 4, ih + 4);
    const R = L.rng(4242);
    const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, R0);
    gr.addColorStop(0, "rgb(20,20,20)");
    gr.addColorStop(0.3, "rgb(22,22,22)");
    gr.addColorStop(0.36, "rgb(96,90,84)");
    gr.addColorStop(0.55, "rgb(150,146,140)");
    gr.addColorStop(0.82, "rgb(118,116,112)");
    gr.addColorStop(0.93, "rgb(40,40,42)");
    gr.addColorStop(1, "rgb(70,70,72)");
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(cx, cy, R0, 0, PI * 2);
    ctx.fill();
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 140; i++) {
      // radial fibres
      const a = R() * PI * 2,
        r0 = R0 * (0.34 + R() * 0.1),
        r1 = R0 * (0.62 + R() * 0.3),
        v = 90 + ((R() * 120) | 0);
      ctx.strokeStyle = "rgba(" + v + "," + v + "," + (v - 6) + ",0.5)";
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(
        cx + Math.cos(a + (R() - 0.5) * 0.15) * r1,
        cy + Math.sin(a + (R() - 0.5) * 0.15) * r1,
      );
      ctx.stroke();
    }
    ctx.fillStyle = "rgb(8,8,8)";
    ctx.beginPath();
    ctx.arc(cx, cy, R0 * 0.31, 0, PI * 2);
    ctx.fill();
    // lips: vertical creases, a lighter wet centre band
    const [lx, ly, lw, lh] = SW.lips;
    ctx.fillStyle = "rgb(128,124,124)";
    ctx.fillRect(lx, ly, lw, lh);
    const lg = ctx.createLinearGradient(0, ly, 0, ly + lh);
    lg.addColorStop(0, "rgba(0,0,0,0.12)");
    lg.addColorStop(0.5, "rgba(255,240,240,0.10)");
    lg.addColorStop(1, "rgba(0,0,0,0.12)");
    ctx.fillStyle = lg;
    ctx.fillRect(lx, ly, lw, lh);
    ctx.strokeStyle = "rgba(40,20,20,0.3)";
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 70; i++) {
      const x = lx + R() * lw,
        y = ly + R() * lh;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (R() - 0.5) * 1.5, y + 2 + R() * 4);
      ctx.stroke();
    }
    ctx.restore();
  }
  function makeTex(cv) {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.NoColorSpace || "";
    t.anisotropy = 4;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.name = "faceTex";
    return t;
  }
  let baseCanvas = null,
    genericCanvas = null,
    genericTex = null;
  /** The per-pixel base (pores, tone, sockets, cavity) — painted once (~0.1 s). */
  function faceBase() {
    if (baseCanvas) return baseCanvas;
    baseCanvas = document.createElement("canvas");
    baseCanvas.width = baseCanvas.height = FT;
    paintGeneric(baseCanvas.getContext("2d"));
    return baseCanvas;
  }
  L.faceGeneric = function () {
    if (genericTex) return genericTex;
    if (typeof document === "undefined") return null;
    try {
      genericCanvas = document.createElement("canvas");
      genericCanvas.width = genericCanvas.height = FT;
      const ctx = genericCanvas.getContext("2d");
      ctx.drawImage(faceBase(), 0, 0);
      const mcv = document.createElement("canvas");
      mcv.width = mcv.height = FT;
      paintBrows(
        ctx,
        { hairColor: 0x3a2616, skin: L.SKIN.tan },
        L.rng(11),
        0.75,
        mcv.getContext("2d"),
      );
      markHair(ctx, mcv, null, 0x3a2616, 0x3a2616);
      genericTex = makeTex(genericCanvas);
      genericTex.userData = { shared: true };
    } catch (e) {
      if (G.reportError) G.reportError("chars.faceGeneric", e);
      genericTex = null;
    }
    return genericTex;
  };

  // ---- per-template overlays (2D canvas ops, a few ms) ----------------
  /** modulation byte for "want this colour on this skin" (linear ratio × 0.5) */
  function modCol(want, skin, alpha) {
    const w = L.col(want),
      s = L.col(skin);
    const f = (a, b) =>
      clamp(Math.round(((0.5 * (a + 0.004)) / (b + 0.004)) * 255), 3, 255);
    return (
      "rgba(" +
      f(w.r, s.r) +
      "," +
      f(w.g, s.g) +
      "," +
      f(w.b, s.b) +
      "," +
      (alpha === undefined ? 1 : alpha) +
      ")"
    );
  }
  const mulStyle = (r, g, b, a) =>
    "rgba(" +
    Math.round(r * 128) +
    "," +
    Math.round(g * 128) +
    "," +
    Math.round(b * 128) +
    "," +
    a +
    ")";
  /** stroke a polyline given in unit-head front coordinates */
  function strokeUnit(ctx, pts, width) {
    ctx.lineWidth = width;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const q = pxFront(p[0], p[1]);
      if (i) ctx.lineTo(q[0], q[1]);
      else ctx.moveTo(q[0], q[1]);
    });
    ctx.stroke();
  }
  function browColor(hc) {
    const bc = L.col(hc);
    const lum = bc.r * 0.3 + bc.g * 0.59 + bc.b * 0.11;
    return lum > 0.2 ? L.shade(hc, 0.72) : hc;
  } // light brows read a touch darker than the hair
  function paintBrows(ctx, F, R, weight, mctx) {
    const hc = F.hairColor || 0x3a2616;
    const browCol = browColor(hc);
    const thick =
      (F.gender === "f" ? 0.62 : 0.86) * (F.mutant ? 1.6 : 1) * (weight || 1); // (were caterpillar-heavy)
    ctx.save();
    ctx.lineCap = "round";
    for (const sg of [-1, 1]) {
      const path = [
        [0.11, 0.255],
        [0.24, 0.3],
        [0.38, 0.322],
        [0.5, 0.305],
        [0.6, 0.265],
      ].map((p) => [sg * p[0], p[1]]);
      // soft underlayer so the brow reads at distance
      ctx.strokeStyle = modCol(browCol, F.skin, 0.2);
      strokeUnit(ctx, path.slice(0, 4), 9 * thick);
      strokeUnit(ctx, path.slice(2), 6 * thick);
      if (mctx) {
        mctx.strokeStyle = "rgba(255,255,255,0.3)";
        mctx.lineCap = "round";
        strokeUnit(mctx, path.slice(0, 4), 7 * thick);
        strokeUnit(mctx, path.slice(2), 4.5 * thick);
      }
      // individual hairs
      const N = F.maniac ? 260 : 420;
      for (let i = 0; i < N; i++) {
        const u = R(),
          seg = Math.min(3, Math.floor(u * 4)),
          fu = u * 4 - seg;
        const a = path[seg],
          b = path[seg + 1];
        const x0 = lerp(a[0], b[0], fu),
          y0 = lerp(a[1], b[1], fu);
        const w = 0.03 * (1 - u * 0.55) * thick;
        const off = (R() - 0.5) * 2 * w;
        const tx = b[0] - a[0],
          ty = b[1] - a[1],
          tl = Math.hypot(tx, ty) || 1;
        // hairs point up/out at the head of the brow, along it toward the tail
        const up = (1 - u) * 0.9;
        const dx = (tx / tl) * (1 - up),
          dy = (ty / tl) * (1 - up) + up;
        const len = 0.035 + R() * 0.03;
        const p0 = pxFront(x0 - (ty / tl) * off, y0 + (tx / tl) * off * sg),
          p1 = pxFront(
            x0 - (ty / tl) * off + dx * len,
            y0 + (tx / tl) * off * sg + dy * len,
          );
        ctx.strokeStyle = modCol(
          L.shade(browCol, 0.75 + R() * 0.5),
          F.skin,
          0.35 + R() * 0.4,
        );
        ctx.lineWidth = 0.7 + R() * 0.6;
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.stroke();
        if (mctx) {
          mctx.strokeStyle = "rgba(255,255,255,0.45)";
          mctx.lineWidth = ctx.lineWidth;
          mctx.beginPath();
          mctx.moveTo(p0[0], p0[1]);
          mctx.lineTo(p1[0], p1[1]);
          mctx.stroke();
        }
      }
    }
    ctx.restore();
  }
  /**
   * HAIR MARKER: pixels covered by painted hair (brows, stubble) get alpha
   * 0.2 — the shader then re-tints them with the per-instance HAIR tint
   * instead of the skin tint, so brows always match the (tinted) hair.
   */
  function markHair(ctx, mcv, stub, hairHex, browHex) {
    // only the brow band carries hair marks: work on its bounding box
    const a = pxFront(-0.72, 0.5),
      b = pxFront(0.72, 0.1);
    const x0 = Math.max(0, Math.floor(Math.min(a[0], b[0])) - 4),
      x1 = Math.min(FT, Math.ceil(Math.max(a[0], b[0])) + 4);
    const y0 = Math.max(0, Math.floor(Math.min(a[1], b[1])) - 4),
      y1 = Math.min(FT, Math.ceil(Math.max(a[1], b[1])) + 4);
    const w = x1 - x0,
      h = y1 - y0;
    if (w <= 0 || h <= 0) return;
    const img = ctx.getImageData(x0, y0, w, h),
      D = img.data;
    const M = mcv ? mcv.getContext("2d").getImageData(x0, y0, w, h).data : null;
    const hb = L.col(browHex || hairHex || 0x3a2616),
      hh = L.col(hairHex || 0x3a2616);
    for (let i = 0, n = w * h; i < n; i++) {
      const mb = M ? M[i * 4 + 3] / 255 : 0,
        ms = stub ? stub[i] / 255 : 0;
      const m = Math.max(mb, ms);
      if (m <= 0.33) continue;
      const c = mb >= ms ? hb : hh;
      const k = (1.3 - 0.55 * m) * (0.75 + 0.5 * hash2(i, 77)); // denser = darker, per-hair variation
      D[i * 4] = Math.sqrt(clamp(c.r * k, 0, 1)) * 255;
      D[i * 4 + 1] = Math.sqrt(clamp(c.g * k, 0, 1)) * 255;
      D[i * 4 + 2] = Math.sqrt(clamp(c.b * k, 0, 1)) * 255;
      D[i * 4 + 3] = 51;
    }
    ctx.putImageData(img, x0, y0);
  }
  /** Iterate pixels in a param-space box; fn(x,y,z,idx) mutates ImageData. */
  function eachPixel(ctx, s0, s1, t0, t1, fn) {
    ensureLUT();
    const x0 = Math.max(0, Math.floor(s0 * FT)),
      x1 = Math.min(FT, Math.ceil(s1 * FT)),
      y0 = Math.max(0, Math.floor(t0 * TV * FT)),
      y1 = Math.min(Math.floor(FT * TV), Math.ceil(t1 * TV * FT));
    if (x1 <= x0 || y1 <= y0) return;
    const img = ctx.getImageData(x0, y0, x1 - x0, y1 - y0),
      D = img.data,
      w = x1 - x0;
    for (let py = y0; py < y1; py++) {
      const st = rowT[py * 2],
        y = rowT[py * 2 + 1];
      for (let pxl = x0; pxl < x1; pxl++) {
        const x = st * colA[pxl * 2],
          z = -st * colA[pxl * 2 + 1];
        fn(x, y, z, D, ((py - y0) * w + (pxl - x0)) * 4, pxl, py);
      }
    }
    ctx.putImageData(img, x0, y0);
  }
  /** Beard-shadow mask in unit-head space (0..1, soft edged). */
  function beardMask(x, y, z) {
    const ax = Math.abs(x);
    const yl = lerp(-0.32, -0.08, sm(0.3, 0.85, ax)); // cheek line: under the nose → sideburns (low on the cheek)
    let m = sm(yl + 0.03, yl - 0.12, y);
    m *=
      1 -
      Math.exp(
        -(Math.pow(x / 0.265, 6) + Math.pow((y - MOUTH_Y + 0.012) / 0.058, 6)),
      ); // lips stay clean
    m *= 1 - Math.exp(-(x * x) / 0.006) * band(y, -0.29, -0.1, 0.03); // nose tip / columella
    m *= sm(0.55, 0.15, z); // fades behind the jaw
    return m;
  }
  function paintStubble(ctx, F, R, kind) {
    const hc = L.col(F.hairColor || 0x2a1a10),
      sk = L.col(F.skin);
    // darken toward the hair colour (never brighten: blond stubble reads as shadow)
    const tr = clamp((hc.r + 0.01) / (sk.r + 0.01), 0.25, 1),
      tg = clamp((hc.g + 0.01) / (sk.g + 0.01), 0.25, 1),
      tb = clamp((hc.b + 0.01) / (sk.b + 0.01), 0.25, 1);
    const shadow = kind === "heavy" ? 0.42 : 0.17,
      dots = kind === "heavy" ? 0.45 : 0.26; // (light stubble at 0.3 read as a dirty smudge on the cheeks)
    eachPixel(ctx, 0.04, 0.96, 0.4, 1, (x, y, z, D, i, pxl, py) => {
      const m = beardMask(x, y, z);
      if (m <= 0.01) return;
      const h = hash2(pxl * 5 + 3, py * 11 + 1);
      const k = m * (shadow + (h < 0.35 ? dots * (0.6 + h) : 0));
      D[i] *= 1 - k * (1 - tr);
      D[i + 1] *= 1 - k * (1 - tg);
      D[i + 2] *= 1 - k * (1 - tb);
    });
  }
  function paintAge(ctx, F, R) {
    const k = F.age;
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = mulStyle(0.8, 0.74, 0.72, 0.35 * k);
    for (let i = 0; i < 3; i++) {
      const y = 0.45 + i * 0.07;
      strokeUnit(
        ctx,
        [
          [-0.35, y + 0.01],
          [-0.12, y - 0.01],
          [0.12, y + 0.012],
          [0.35, y - 0.005],
        ],
        1.2,
      );
    }
    for (const sg of [-1, 1]) {
      for (let i = 0; i < 3; i++)
        strokeUnit(
          ctx,
          [
            [sg * 0.55, 0.13 + (i - 1) * 0.04],
            [sg * 0.64, 0.14 + (i - 1) * 0.07],
          ],
          1.0,
        ); // crow's feet
      strokeUnit(
        ctx,
        [
          [sg * 0.25, 0.0],
          [sg * 0.35, -0.03],
          [sg * 0.45, 0.0],
        ],
        1.1,
      ); // under-eye bags
      strokeUnit(
        ctx,
        [
          [sg * 0.15, -0.22],
          [sg * 0.23, -0.34],
          [sg * 0.31, -0.48],
        ],
        1.6,
      ); // deeper nasolabial
      strokeUnit(
        ctx,
        [
          [sg * 0.28, -0.52],
          [sg * 0.31, -0.62],
        ],
        1.2,
      ); // marionette lines
    }
    // liver spots
    ctx.fillStyle = mulStyle(0.82, 0.72, 0.62, 0.45 * k);
    for (let i = 0; i < 26; i++) {
      const p = pxFront((R() - 0.5) * 1.3, 0.2 + R() * 0.55);
      ctx.beginPath();
      ctx.arc(p[0], p[1], 0.6 + R() * 1.4, 0, PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function paintFreckles(ctx, R) {
    ctx.save();
    for (let i = 0; i < 160; i++) {
      const x = (R() - 0.5) * 1.1,
        y = -0.05 - R() * 0.25 + Math.abs(x) * 0.1;
      if (Math.abs(x) < 0.05 && y > -0.1) continue;
      const p = pxFront(x, y);
      ctx.fillStyle = mulStyle(0.84, 0.7, 0.58, 0.35 + R() * 0.35);
      ctx.beginPath();
      ctx.arc(p[0], p[1], 0.5 + R() * 0.9, 0, PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function paintScar(ctx, R) {
    const sg = R() < 0.5 ? -1 : 1;
    const kind = R();
    let pts;
    if (kind < 0.4)
      pts = [
        [sg * 0.22, 0.42],
        [sg * 0.3, 0.3],
        [sg * 0.36, 0.2],
      ]; // through the brow
    else if (kind < 0.75)
      pts = [
        [sg * 0.55, 0.0],
        [sg * 0.45, -0.15],
        [sg * 0.36, -0.3],
      ]; // down the cheek
    else
      pts = [
        [sg * 0.05, -0.36],
        [sg * 0.1, -0.5],
        [sg * 0.14, -0.6],
      ]; // across the lip & chin
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = mulStyle(0.8, 0.62, 0.62, 0.55);
    strokeUnit(ctx, pts, 4.5);
    ctx.strokeStyle = mulStyle(1.28, 1.05, 1.02, 0.8);
    strokeUnit(ctx, pts, 1.8);
    for (let i = 0; i < 5; i++) {
      // stitch marks
      const u = (i + 0.5) / 5,
        a = pts[0],
        b = pts[pts.length - 1];
      const x = lerp(a[0], b[0], u),
        y = lerp(a[1], b[1], u);
      strokeUnit(
        ctx,
        [
          [x - 0.02, y - 0.012],
          [x + 0.02, y + 0.012],
        ],
        1.1,
      );
    }
    ctx.restore();
  }
  /**
   * Old healed FIRE burn (story cast: Sister Dawn): a shiny, puckered patch of
   * pink-brown graft-like skin from the jaw angle down the neck on one side
   * ('L' = the character's left, -x), with a paler ropey rim.
   */
  function paintBurn(ctx, F, R) {
    const sg = F.burn === "R" ? 1 : -1; // face-map x = head x (the character's left is -x)
    ctx.save();
    // the graft patch: a broad, reddened sheet from the cheek / jaw angle down onto the neck (reads at conversation distance)
    for (let i = 0; i < 16; i++) {
      const t = i / 15,
        p = pxFront(
          sg * (0.46 + t * 0.34 + (R() - 0.5) * 0.06),
          -0.14 - t * 0.62,
        ),
        rr = 20 + R() * 12;
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr);
      g.addColorStop(0, mulStyle(1.32, 0.74, 0.7, 0.6));
      g.addColorStop(1, mulStyle(1.32, 0.74, 0.7, 0));
      ctx.fillStyle = g;
      ctx.fillRect(p[0] - rr, p[1] - rr, rr * 2, rr * 2);
    }
    // mottling: shiny pink islands and darker, brownish puckers
    for (let i = 0; i < 150; i++) {
      const t = R(),
        x = sg * (0.4 + t * 0.46 + (R() - 0.5) * 0.16),
        y = -0.18 - t * 0.6 + (R() - 0.5) * 0.14;
      const p = pxFront(x, y),
        rr = 3 + R() * 7;
      ctx.fillStyle =
        R() < 0.55
          ? mulStyle(1.5, 0.8, 0.76, 0.7)
          : mulStyle(0.8, 0.5, 0.46, 0.65);
      ctx.beginPath();
      ctx.arc(p[0], p[1], rr, 0, PI * 2);
      ctx.fill();
    }
    // pale, ropey scar ridges running down the neck
    ctx.lineCap = "round";
    ctx.strokeStyle = mulStyle(1.5, 1.2, 1.12, 0.75);
    for (let i = 0; i < 9; i++) {
      let x = sg * (0.44 + R() * 0.3),
        y = -0.24 - R() * 0.12;
      const pts = [[x, y]];
      for (let s2 = 0; s2 < 6; s2++) {
        x += sg * (0.015 + R() * 0.05);
        y -= 0.06 + R() * 0.05;
        pts.push([x, y]);
      }
      strokeUnit(ctx, pts, 2.4);
    }
    ctx.restore();
  }
  /** Radiation-sickness pallor: grey-violet hollows under the eyes, drained lips & cheeks. */
  function paintPallor(ctx, F) {
    const k = clamp(F.pallor, 0, 1);
    ctx.save();
    for (const sg of [-1, 1]) {
      const p = pxFront(sg * 0.33, 0.04);
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 16);
      g.addColorStop(0, mulStyle(0.62, 0.58, 0.72, 0.7 * k));
      g.addColorStop(1, mulStyle(0.62, 0.58, 0.72, 0));
      ctx.fillStyle = g;
      ctx.fillRect(p[0] - 16, p[1] - 16, 32, 32);
      const c = pxFront(sg * 0.5, -0.2);
      const g2 = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], 20);
      g2.addColorStop(0, mulStyle(0.86, 0.86, 0.9, 0.4 * k));
      g2.addColorStop(1, mulStyle(0.86, 0.86, 0.9, 0));
      ctx.fillStyle = g2;
      ctx.fillRect(c[0] - 20, c[1] - 20, 40, 40);
    }
    ctx.restore();
  }
  function paintDirt(ctx, R, amt) {
    ctx.save();
    for (let i = 0; i < 18; i++) {
      const p = pxFront((R() - 0.5) * 1.4, (R() - 0.5) * 1.3);
      const rr = 6 + R() * 22;
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr);
      g.addColorStop(0, mulStyle(0.66, 0.6, 0.52, 0.45 * amt));
      g.addColorStop(1, mulStyle(0.66, 0.6, 0.52, 0));
      ctx.fillStyle = g;
      ctx.fillRect(p[0] - rr, p[1] - rr, rr * 2, rr * 2);
    }
    ctx.restore();
  }
  function paintWarPaint(ctx, F) {
    const mode = (F.paintSeed || 0) % 3;
    ctx.save();
    ctx.lineCap = "round";
    if (mode === 0) {
      ctx.strokeStyle = mulStyle(0.16, 0.15, 0.15, 0.9);
      strokeUnit(
        ctx,
        [
          [-0.7, 0.13],
          [-0.35, 0.14],
          [0, 0.12],
          [0.35, 0.14],
          [0.7, 0.13],
        ],
        20,
      );
    } else if (mode === 1) {
      ctx.strokeStyle = mulStyle(1.2, 0.28, 0.24, 0.85);
      for (const sg of [-1, 1])
        for (let i = 0; i < 3; i++)
          strokeUnit(
            ctx,
            [
              [sg * (0.3 + i * 0.08), 0.02],
              [sg * (0.33 + i * 0.08), -0.3],
            ],
            4,
          );
    } else {
      ctx.strokeStyle = mulStyle(0.18, 0.17, 0.17, 0.9);
      strokeUnit(
        ctx,
        [
          [0, 0.75],
          [0, 0.3],
          [0, -0.1],
        ],
        5,
      );
      strokeUnit(
        ctx,
        [
          [0, -0.5],
          [0, -0.8],
        ],
        5,
      );
    }
    ctx.restore();
  }
  /**
   * Maniac faces: an ordinary face gone to ruin. Tired, smudged, red-rimmed
   * sockets, ground-in dirt and soot, scabbed scratches, chapped lips; old
   * healed burns come from paintBurn (F.burn).
   */
  function paintManiac(ctx, F, R) {
    ctx.save();
    const cluster = (x, y, size, style, n) => {
      const p = pxFront(x, y);
      ctx.fillStyle = style;
      for (let k = 0; k < n; k++) {
        ctx.beginPath();
        ctx.ellipse(
          p[0] + (R() - 0.5) * size * 1.4,
          p[1] + (R() - 0.5) * size,
          size * (0.3 + R() * 0.5),
          size * (0.2 + R() * 0.4),
          R() * 3,
          0,
          PI * 2,
        );
        ctx.fill();
      }
    };
    ctx.lineCap = "round";
    // sleepless sockets: dark and a little red
    for (const sg of [-1, 1]) {
      const p = pxFront(sg * 0.36, 0.1),
        g0 = ctx.createRadialGradient(p[0], p[1], 2, p[0], p[1], 24);
      g0.addColorStop(0, mulStyle(0.7, 0.5, 0.5, 0.55));
      g0.addColorStop(1, mulStyle(0.7, 0.5, 0.5, 0));
      ctx.fillStyle = g0;
      ctx.fillRect(p[0] - 24, p[1] - 24, 48, 48);
    }
    // grime and soot smudges
    for (let i = 0; i < 18; i++)
      cluster(
        (R() - 0.5) * 1.5,
        (R() - 0.5) * 1.5,
        5 + R() * 10,
        mulStyle(0.56, 0.52, 0.48, 0.16 + R() * 0.2),
        4,
      );
    // scabbed scratches (fingernail rakes)
    ctx.strokeStyle = mulStyle(0.62, 0.32, 0.28, 0.65);
    for (let i = 0; i < 5; i++) {
      const x = (R() - 0.5) * 1.1,
        y = (R() - 0.5) * 1.1,
        a = R() * PI;
      for (let k = 0; k < 3; k++)
        strokeUnit(
          ctx,
          [
            [x + k * 0.03, y],
            [x + k * 0.03 + Math.cos(a) * 0.14, y + Math.sin(a) * 0.14],
          ],
          1.2,
        );
    }
    // chapped, cracked lips
    {
      const p = pxFront(0, -0.36);
      ctx.fillStyle = mulStyle(0.8, 0.6, 0.58, 0.35);
      ctx.beginPath();
      ctx.ellipse(p[0], p[1], 20, 7, 0, 0, PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function paintMutant(ctx, R) {
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 40; i++) {
      const p = pxFront((R() - 0.5) * 1.5, (R() - 0.5) * 1.5);
      const rr = 4 + R() * 14;
      ctx.fillStyle = mulStyle(0.85 + R() * 0.3, 0.9 + R() * 0.25, 0.8, 0.35);
      ctx.beginPath();
      ctx.arc(p[0], p[1], rr, 0, PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = mulStyle(0.62, 0.74, 0.55, 0.55);
    for (let i = 0; i < 16; i++) {
      let x = (R() - 0.5) * 1.2,
        y = 0.3 + R() * 0.5;
      const pts = [[x, y]];
      for (let s = 0; s < 6; s++) {
        x += (R() - 0.5) * 0.1;
        y -= R() * 0.07;
        pts.push([x, y]);
      }
      strokeUnit(ctx, pts, 1.4);
    }
    ctx.restore();
  }
  function paintMakeup(ctx, F) {
    ctx.save();
    for (const sg of [-1, 1]) {
      const p = pxFront(sg * 0.35, 0.2);
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 14);
      g.addColorStop(0, mulStyle(0.82, 0.74, 0.86, 0.5));
      g.addColorStop(1, mulStyle(0.82, 0.74, 0.86, 0));
      ctx.fillStyle = g;
      ctx.fillRect(p[0] - 14, p[1] - 14, 28, 28);
      const c = pxFront(sg * 0.5, -0.12);
      const g2 = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], 18);
      g2.addColorStop(0, mulStyle(1.12, 0.9, 0.9, 0.45));
      g2.addColorStop(1, mulStyle(1.12, 0.9, 0.9, 0));
      ctx.fillStyle = g2;
      ctx.fillRect(c[0] - 18, c[1] - 18, 36, 36);
    }
    ctx.restore();
  }

  /**
   * SCALP HAIR & SOFT HAIRLINE: the scalp under the hair shell is painted in
   * the hair colour (hair-marked texels, so the instance hair tint applies),
   * and below the shell edge the hair thins out over ~1.5 cm in short
   * strands (fine baby hairs at the front, sideburns & nape) instead of the
   * shell ending in a hard helmet line.
   */
  const HAIR_MATCH = 0.58;
  function paintHairline(ctx, F, R) {
    const keep = F.hairKeep;
    if (typeof keep !== "function") return;
    ensureLUT();
    const hc = L.col(F.hairColor || 0x3a2616),
      sk = L.col(F.skin);
    const yMax = Math.floor(FT * TV * 0.78); // rows below the ears/nape never carry hair
    const img = ctx.getImageData(0, 0, FT, yMax),
      D = img.data;
    const q = [0, 0, 0];
    const up = (x, y, z, d) => {
      const yy = y + d,
        l = Math.hypot(x, yy, z) || 1;
      q[0] = x / l;
      q[1] = yy / l;
      q[2] = z / l;
      return keep(q[0], q[1], q[2]);
    };
    // half-resolution coverage field: 0 bald … 1 fully covered
    const HW = FT >> 1,
      HH = (yMax >> 1) + 1,
      cov = new Float32Array(HW * HH);
    for (let j = 0; j < HH; j++) {
      const py = Math.min(yMax - 1, j * 2),
        st = rowT[py * 2],
        y = rowT[py * 2 + 1];
      if (y < -0.45) continue;
      for (let i = 0; i < HW; i++) {
        const px = i * 2,
          x = st * colA[px * 2],
          z = -st * colA[px * 2 + 1];
        let c = 0;
        if (keep(x, y, z)) c = 1;
        else if (up(x, y, z, 0.1))
          c = up(x, y, z, 0.03) ? 0.7 : up(x, y, z, 0.06) ? 0.4 : 0.15;
        cov[j * HW + i] = c;
      }
    }
    // blur the field (2× separable box, r=2): the face map is sparse at the
    // temples/behind the ears, where a hard 0/1 edge renders as blocky black
    // blotches; a soft field gives a thinning, strand-broken hairline instead.
    // (running-sum box: O(1) per texel per pass, edge-clamped)
    const tmp = new Float32Array(HW * HH);
    const box = (src, dst, n, count, stride, step) => {
      for (let l = 0; l < count; l++) {
        const o = l * stride;
        let s = src[o] * 3 + src[o + step] + src[o + 2 * step];
        for (let i = 0; i < n; i++) {
          dst[o + i * step] = s / 5;
          s +=
            src[o + Math.min(n - 1, i + 3) * step] -
            src[o + Math.max(0, i - 2) * step];
        }
      }
    };
    if (HW > 3 && HH > 3)
      for (let pass = 0; pass < 2; pass++) {
        box(cov, tmp, HW, HH, HW, 1);
        box(tmp, cov, HH, HW, 1, HW);
      }
    for (let py = 0; py < yMax; py++) {
      const j = py >> 1;
      for (let px = 0; px < FT; px++) {
        const c = cov[j * HW + (px >> 1)];
        if (c <= 0) continue;
        const k = (py * FT + px) * 4;
        // strand noise: streaks running down (crown → hairline), finer at the edge
        const h =
          hash2(px, Math.floor(py / 3)) * 0.6 + hash2(px * 7 + 1, py) * 0.4;
        if (c <= 0.02) continue;
        if (c >= 0.97 || h < (c - 0.15) * 1.05) {
          // × HAIR_MATCH: the hair SHELL is the hair colour × the sRGB fur atlas
          // (≈0.55 linear on average); painted scalp hair at the full colour
          // read ~1.6× brighter than the shell above it — a pale "headband"
          const v =
            (0.6 + 0.55 * h) * (c >= 0.97 ? 1 : 0.9 + 0.2 * c) * HAIR_MATCH;
          D[k] = Math.sqrt(clamp(hc.r * v, 0, 1)) * 255;
          D[k + 1] = Math.sqrt(clamp(hc.g * v, 0, 1)) * 255;
          D[k + 2] = Math.sqrt(clamp(hc.b * v, 0, 1)) * 255;
          D[k + 3] = 51;
        } else if (D[k + 3] > 60) {
          // bare skin between strands: shadowed & tinted toward the hair (hair roots)
          const t = c * 0.55;
          D[k] *= 1 - t * (1 - clamp((hc.r + 0.02) / (sk.r + 0.02), 0.3, 1));
          D[k + 1] *=
            1 - t * (1 - clamp((hc.g + 0.02) / (sk.g + 0.02), 0.3, 1));
          D[k + 2] *=
            1 - t * (1 - clamp((hc.b + 0.02) / (sk.b + 0.02), 0.3, 1));
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  L.paintHairline = paintHairline;

  /** Build the per-template face texture from meta.face. */
  function buildTemplateFace(F) {
    if (!L.faceGeneric()) return null;
    const cv = document.createElement("canvas");
    cv.width = cv.height = FT;
    const ctx = cv.getContext("2d");
    // start from the shared per-pixel base (no brows yet)
    ctx.drawImage(faceBase(), 0, 0);
    const R = L.rng(((F.seed || 1) * 2654435761) >>> 0);
    if (F.maniac) paintManiac(ctx, F, R);
    if (F.mutant) paintMutant(ctx, R);
    const mcv = document.createElement("canvas");
    mcv.width = mcv.height = FT;
    paintBrows(ctx, F, R, F.maniac ? 0.8 : 1, mcv.getContext("2d"));
    const male = F.gender !== "f";
    if (male && !F.mutant) {
      // (a full beard's shell grows out of a heavy painted shadow: gaps & edges read as hair, not skin)
      const st =
        F.beard === "stubble" || F.beard === "full"
          ? "heavy"
          : F.beard
            ? "light"
            : R() < 0.55
              ? "light"
              : null;
      if (st) paintStubble(ctx, F, R, st);
    }
    if (F.age > 0.35) paintAge(ctx, F, R);
    if (
      !F.maniac &&
      !F.mutant &&
      (F.freckles || (R() < 0.18 && L.col(F.skin).r > 0.55))
    )
      paintFreckles(ctx, R);
    if (
      F.scars !== false &&
      (F.scars || R() < (F.paint === "raider" || F.maniac ? 0.6 : 0.18))
    )
      paintScar(ctx, R);
    if (F.burn) paintBurn(ctx, F, R);
    if (F.pallor) paintPallor(ctx, F);
    if (F.paint === "raider") paintWarPaint(ctx, F);
    if (
      !male &&
      !F.maniac &&
      F.makeup !== false &&
      (F.makeup === true || R() < 0.8)
    )
      paintMakeup(ctx, F);
    paintDirt(
      ctx,
      R,
      F.dirt !== undefined ? F.dirt : F.paint === "raider" ? 1 : 0.55,
    );
    markHair(ctx, mcv, null, F.hairColor, browColor(F.hairColor || 0x3a2616));
    if (F.hairKeep) {
      try {
        paintHairline(ctx, F, R);
      } catch (e) {
        if (G.reportError) G.reportError("chars.hairline", e);
      }
    }
    return makeTex(cv);
  }

  // LRU of per-template textures (512² RGBA ≈ 1.4 MB with mips each)
  // The cache is ADAPTIVE: MAX_FACE_TEX is a soft cap — only faces no nearby
  // character asked for in the last ~2 s are evicted, so a crowd that needs
  // 25 distinct faces at once (The Neon's market) grows the cache (up to the
  // hard cap) instead of evicting and rebuilding faces every few frames.
  const FACE_LRU = new Map();
  L.MAX_FACE_TEX = 16;
  L.MAX_FACE_TEX_HARD = 40;
  const NEED_FRAMES = 120;
  /** Ensure `tpl` has its own face texture; returns it (or null). */
  let lastBuildFrame = -1;
  const frameNow = () =>
    G.time && G.time.frame !== undefined ? G.time.frame : -2;
  // Evicted faces are KEPT at 256² (≈0.35 MB with mips, LRU of 48): beyond
  // ~8 m nobody can tell, so a crowd that walks out of the hi-res budget keeps
  // its painted faces (no fall back to the generic face, no repaint wave when
  // it comes back); within 8 m / when talking the full 512² map is repainted.
  const LO_LRU = new Map();
  L.MAX_FACE_TEX_LO = 48;
  L.FACE_HI_D2 = 8 * 8;
  function keepLo(tpl, tex) {
    try {
      const src = tex && tex.image;
      if (!src || !src.width || tpl.disposed) return null;
      const cv = document.createElement("canvas");
      cv.width = cv.height = FT >> 1;
      const cx = cv.getContext("2d");
      cx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in cx) cx.imageSmoothingQuality = "high";
      cx.drawImage(src, 0, 0, cv.width, cv.height);
      const t = makeTex(cv);
      t.name = "faceTexLo";
      t.anisotropy = 2;
      if (tpl.faceTexLo) tpl.faceTexLo.dispose();
      tpl.faceTexLo = t;
      LO_LRU.delete(tpl.key);
      LO_LRU.set(tpl.key, tpl);
      while (LO_LRU.size > L.MAX_FACE_TEX_LO) {
        const [k0, t0] = LO_LRU.entries().next().value;
        LO_LRU.delete(k0);
        if (t0.faceTexLo) {
          const gen = L.faceGeneric();
          if (L.live)
            for (const ch of L.live)
              if (
                ch.tpl === t0 &&
                ch.material &&
                ch.material.userData.uniforms.uFaceMap.value === t0.faceTexLo
              )
                ch.material.userData.uniforms.uFaceMap.value = gen;
          t0.faceTexLo.dispose();
          t0.faceTexLo = null;
        }
      }
      return t;
    } catch (e) {
      if (G.reportError) G.reportError("chars.faceLo", e);
      return null;
    }
  }
  function evictFace(k, old) {
    FACE_LRU.delete(k);
    const lo = old.disposed ? null : keepLo(old, old.faceTex);
    const gen = lo || L.faceGeneric();
    if (L.live)
      for (const ch of L.live)
        if (ch.tpl === old && ch.material)
          ch.material.userData.uniforms.uFaceMap.value = gen;
    if (old.faceTex) {
      old.faceTex.dispose();
      old.faceTex = null;
    }
  }
  /** Drop a disposed template's low-res face (template LRU eviction). */
  L.faceTexDrop = function (tpl) {
    if (!tpl) return;
    if (tpl.faceTexLo) {
      tpl.faceTexLo.dispose();
      tpl.faceTexLo = null;
    }
    LO_LRU.delete(tpl.key);
    if (tpl.faceTex && FACE_LRU.get(tpl.key) === tpl) {
      FACE_LRU.delete(tpl.key);
      tpl.faceTex.dispose();
      tpl.faceTex = null;
    }
  };
  L.faceTexFor = function (tpl, force, d2) {
    if (!tpl || !tpl.meta || !tpl.meta.face || tpl.disposed) return null;
    const frame = frameNow();
    tpl._faceNeed = frame;
    if (tpl.faceTex) {
      FACE_LRU.delete(tpl.key);
      FACE_LRU.set(tpl.key, tpl);
      return tpl.faceTex;
    }
    // a kept 256² copy serves everyone beyond ~8 m (d2 undefined = no distance → hi-res wanted)
    if (tpl.faceTexLo && !force) {
      LO_LRU.delete(tpl.key);
      LO_LRU.set(tpl.key, tpl);
      if (d2 !== undefined && d2 > L.FACE_HI_D2) return tpl.faceTexLo;
      if (frame === lastBuildFrame && frame >= 0) return tpl.faceTexLo;
    }
    // budget: at most one new face texture per frame (unless a line is being spoken now)
    if (!force && frame === lastBuildFrame && frame >= 0) return null;
    lastBuildFrame = frame;
    try {
      tpl.faceTex = buildTemplateFace(tpl.meta.face);
    } catch (e) {
      if (G.reportError) G.reportError("chars.faceTex", e);
      tpl.faceTex = null;
    }
    if (!tpl.faceTex) return tpl.faceTexLo || null;
    FACE_LRU.set(tpl.key, tpl);
    while (FACE_LRU.size > L.MAX_FACE_TEX) {
      let victim = null;
      const hard = FACE_LRU.size > L.MAX_FACE_TEX_HARD;
      for (const [k, t] of FACE_LRU) {
        if (t === tpl) continue;
        if (
          hard ||
          frame < 0 ||
          t.disposed ||
          frame - (t._faceNeed === undefined ? -1e9 : t._faceNeed) > NEED_FRAMES
        ) {
          victim = [k, t];
          break;
        }
      }
      if (!victim) break; // every cached face is on screen right now: grow (≤ hard cap)
      evictFace(victim[0], victim[1]);
    }
    return tpl.faceTex;
  };
  /** Was a face texture built this frame? (idle-frame prefetch uses the spare budget) */
  L.faceBuiltThisFrame = () => lastBuildFrame === frameNow();
  L.faceTexCount = () => FACE_LRU.size;
  L.faceTexLoCount = () => LO_LRU.size;
  H.sculptFace = sculpt;
})();
