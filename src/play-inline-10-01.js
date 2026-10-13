// play-inline-10 01 — opts
// Lines 16-335 of readable/play-inline-10.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = (G._tx = G._tx || {});

  X.GEN = X.GEN || {}; // texture generator registry: name -> def
  X.stats = { generated: 0, ms: 0, bytes: 0 };

  // ------------------------------------------------------------------
  // RNG / canvas
  // ------------------------------------------------------------------
  X.rng = function (seed) {
    return G.util.rng(seed >>> 0 || 1);
  };
  X.seedOf = function (s) {
    return G.util.hashStr(String(s));
  };

  X.canvas = function (w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h || w;
    const ctx = c.getContext("2d", { willReadFrequently: true }); // CPU-backed: we read pixels back a lot; avoids GPU stalls
    return { c, ctx, w: c.width, h: c.height };
  };

  // ------------------------------------------------------------------
  // Colour helpers
  // ------------------------------------------------------------------
  X.hex = function (h) {
    if (Array.isArray(h)) return h;
    if (typeof h === "number")
      return [(h >> 16) & 255, (h >> 8) & 255, h & 255];
    if (typeof h === "string" && h.startsWith("rgb")) {
      const m = h.match(/[\d.]+/g) || [0, 0, 0];
      return [+m[0], +m[1], +m[2]];
    }
    let s = String(h).replace("#", "");
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    const n = parseInt(s, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  X.css = function (c, a) {
    if (typeof c === "string" && c.startsWith("rgba") && a === undefined)
      return c; // keep given alpha
    const v = X.hex(c);
    return a === undefined
      ? "rgb(" + (v[0] | 0) + "," + (v[1] | 0) + "," + (v[2] | 0) + ")"
      : "rgba(" +
          (v[0] | 0) +
          "," +
          (v[1] | 0) +
          "," +
          (v[2] | 0) +
          "," +
          a +
          ")";
  };
  X.mix = function (a, b, t) {
    a = X.hex(a);
    b = X.hex(b);
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ];
  };
  /** f > 0 lightens toward white, f < 0 darkens toward black. */
  X.shade = function (c, f) {
    return f >= 0 ? X.mix(c, [255, 255, 255], f) : X.mix(c, [0, 0, 0], -f);
  };
  X.jitter = function (c, r, amt) {
    const v = X.hex(c),
      k = (r() - 0.5) * 2 * amt;
    return [v[0] * (1 + k), v[1] * (1 + k), v[2] * (1 + k)];
  };
  /** Colour ramp from [[t, colour], ...] -> 256-entry LUT, returns fn(t)->[r,g,b]. */
  X.ramp = function (stops) {
    const lut = new Uint8ClampedArray(256 * 3);
    const st = stops.map((s) => [s[0], X.hex(s[1])]);
    for (let i = 0; i < 256; i++) {
      const t = i / 255;
      let k = 0;
      while (k < st.length - 2 && t > st[k + 1][0]) k++;
      const a = st[k],
        b = st[k + 1] || st[k];
      const f =
        b[0] === a[0]
          ? 0
          : Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0])));
      lut[i * 3] = a[1][0] + (b[1][0] - a[1][0]) * f;
      lut[i * 3 + 1] = a[1][1] + (b[1][1] - a[1][1]) * f;
      lut[i * 3 + 2] = a[1][2] + (b[1][2] - a[1][2]) * f;
    }
    const fn = (t) => {
      const i = (t <= 0 ? 0 : t >= 1 ? 255 : (t * 255) | 0) * 3;
      return [lut[i], lut[i + 1], lut[i + 2]];
    };
    fn.lut = lut;
    return fn;
  };

  // ------------------------------------------------------------------
  // Tileable noise
  // ------------------------------------------------------------------
  const noiseCache = new Map();
  /** One octave of periodic value noise with (px × py) lattice cells over a w×h image. */
  function latticeOctave(w, h, px, py, seed, out, amp) {
    const r = X.rng(seed);
    const lat = new Float32Array(px * py);
    for (let i = 0; i < lat.length; i++) lat[i] = r();
    const xi0 = new Int32Array(w),
      xi1 = new Int32Array(w),
      fx = new Float32Array(w);
    for (let x = 0; x < w; x++) {
      const u = (x / w) * px,
        i = Math.floor(u),
        f = u - i;
      xi0[x] = i % px;
      xi1[x] = (i + 1) % px;
      fx[x] = f * f * (3 - 2 * f);
    }
    for (let y = 0; y < h; y++) {
      const v = (y / h) * py,
        j = Math.floor(v),
        f0 = v - j,
        fy = f0 * f0 * (3 - 2 * f0);
      const r0 = (j % py) * px,
        r1 = ((j + 1) % py) * px;
      const o = y * w;
      for (let x = 0; x < w; x++) {
        const a = lat[r0 + xi0[x]],
          b = lat[r0 + xi1[x]],
          c = lat[r1 + xi0[x]],
          d = lat[r1 + xi1[x]];
        const top = a + (b - a) * fx[x],
          bot = c + (d - c) * fx[x];
        out[o + x] += (top + (bot - top) * fy) * amp;
      }
    }
  }
  /**
   * Tileable fBm value noise, normalized to [0,1].
   * opts: {scale: lattice cells across the width (int), octaves=4, persist=0.5, seed, sy: cells across height (default ∝ aspect)}
   */
  X.fbm = function (w, h, opts) {
    opts = opts || {};
    const scale = Math.max(1, Math.round(opts.scale || 4)),
      oct = opts.octaves || 4,
      persist = opts.persist === undefined ? 0.5 : opts.persist;
    const sy = Math.max(1, Math.round(opts.sy || (scale * h) / w));
    const seed = opts.seed || 1;
    const key = [w, h, scale, sy, oct, persist, seed].join(",");
    if (noiseCache.has(key)) return noiseCache.get(key);
    const out = new Float32Array(w * h);
    let amp = 1,
      px = scale,
      py = sy;
    for (let o = 0; o < oct; o++) {
      if (px > w || py > h) break;
      latticeOctave(w, h, px, py, seed * 131 + o * 977, out, amp);
      amp *= persist;
      px *= 2;
      py *= 2;
    }
    let mn = 1e9,
      mx = -1e9;
    for (let i = 0; i < out.length; i++) {
      const v = out[i];
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    const k = mx > mn ? 1 / (mx - mn) : 0;
    for (let i = 0; i < out.length; i++) out[i] = (out[i] - mn) * k;
    if (noiseCache.size > 64) noiseCache.clear();
    noiseCache.set(key, out);
    return out;
  };
  /**
   * Tileable Worley noise. opts: {cells (across width), cy?, seed, jitter=0.9}
   * Returns {f1, f2, id} (distances in cell units, id = per-cell random 0..1).
   */
  X.worley = function (w, h, opts) {
    opts = opts || {};
    const cx = Math.max(1, Math.round(opts.cells || 8)),
      cy = Math.max(1, Math.round(opts.cy || (cx * h) / w));
    const key =
      "w" + [w, h, cx, cy, opts.seed || 1, opts.jitter || 0.9].join(",");
    if (noiseCache.has(key)) return noiseCache.get(key);
    const r = X.rng(opts.seed || 7);
    const jit = opts.jitter === undefined ? 0.9 : opts.jitter;
    const ptx = new Float32Array(cx * cy),
      pty = new Float32Array(cx * cy),
      pid = new Float32Array(cx * cy);
    for (let i = 0; i < cx * cy; i++) {
      ptx[i] = 0.5 + (r() - 0.5) * jit;
      pty[i] = 0.5 + (r() - 0.5) * jit;
      pid[i] = r();
    }
    const f1 = new Float32Array(w * h),
      f2 = new Float32Array(w * h),
      id = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      const v = (y / h) * cy,
        j = Math.floor(v);
      for (let x = 0; x < w; x++) {
        const u = (x / w) * cx,
          i = Math.floor(u);
        let d1 = 9,
          d2 = 9,
          best = 0;
        for (let dj = -1; dj <= 1; dj++) {
          const jj = (((j + dj) % cy) + cy) % cy;
          for (let di = -1; di <= 1; di++) {
            const ii = (((i + di) % cx) + cx) % cx,
              k = jj * cx + ii;
            const px = i + di + ptx[k],
              py = j + dj + pty[k];
            const dx = px - u,
              dy = py - v,
              d = dx * dx + dy * dy;
            if (d < d1) {
              d2 = d1;
              d1 = d;
              best = k;
            } else if (d < d2) d2 = d;
          }
        }
        const o = y * w + x;
        f1[o] = Math.sqrt(d1);
        f2[o] = Math.sqrt(d2);
        id[o] = pid[best];
      }
    }
    const res = { f1, f2, id, cx, cy };
    noiseCache.set(key, res);
    return res;
  };

  // ------------------------------------------------------------------
  // Pixel helpers
  // ------------------------------------------------------------------
  X.pixels = function (ctx, w, h) {
    return ctx.getImageData(0, 0, w, h);
  };
  /** Fill canvas per-pixel: fn(i, x, y) -> [r,g,b] or writes into d directly (return undefined). */
  X.fillPixels = function (ctx, w, h, fn) {
    const img = ctx.createImageData(w, h),
      d = img.data;
    let i = 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++, i++) {
        const c = fn(i, x, y);
        const o = i * 4;
        d[o] = c[0];
        d[o + 1] = c[1];
        d[o + 2] = c[2];
        d[o + 3] = c[3] === undefined ? 255 : c[3];
      }
    ctx.putImageData(img, 0, 0);
  };
  /** Multiply existing pixels by (1 + (n-0.5)*amt) — cheap tonal variation from a noise field. */
  X.modulate = function (ctx, w, h, noise, amt, bias) {
    const img = ctx.getImageData(0, 0, w, h),
      d = img.data;
    bias = bias || 0;
    for (let i = 0, o = 0; i < w * h; i++, o += 4) {
      const k = 1 + (noise[i] - 0.5 + bias) * amt;
      d[o] *= k;
      d[o + 1] *= k;
      d[o + 2] *= k;
    }
    ctx.putImageData(img, 0, 0);
  };
  /** Tint pixels toward colour where mask(i) in [0,1]. */
  X.tintMask = function (ctx, w, h, color, maskFn) {
    const c = X.hex(color);
    const img = ctx.getImageData(0, 0, w, h),
      d = img.data;
    for (let i = 0, o = 0; i < w * h; i++, o += 4) {
      const m = maskFn(i);
      if (m <= 0) continue;
      d[o] += (c[0] - d[o]) * m;
      d[o + 1] += (c[1] - d[o + 1]) * m;
      d[o + 2] += (c[2] - d[o + 2]) * m;
    }
    ctx.putImageData(img, 0, 0);
  };
  /** Desaturate by amount (0..1). */
  X.desaturate = function (ctx, w, h, amt) {
    const img = ctx.getImageData(0, 0, w, h),
      d = img.data;
    for (let o = 0; o < d.length; o += 4) {
      const l = d[o] * 0.3 + d[o + 1] * 0.59 + d[o + 2] * 0.11;
      d[o] += (l - d[o]) * amt;
      d[o + 1] += (l - d[o + 1]) * amt;
      d[o + 2] += (l - d[o + 2]) * amt;
    }
    ctx.putImageData(img, 0, 0);
  };

  // ------------------------------------------------------------------
  // Wrap-around drawing: call fn(ox, oy) for every tile offset where a
  // shape centred at (x,y) with radius r would be visible.
  // ------------------------------------------------------------------
  X.wrap = function (w, h, x, y, r, fn) {
    for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx * w;
      if (xx + r < 0 || xx - r > w) continue;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy * h;
        if (yy + r < 0 || yy - r > h) continue;
        fn(xx, yy);
      }
    }
  };

  // ------------------------------------------------------------------
  // Weathering brushes (all tile-safe)
  // ------------------------------------------------------------------
  /** Soft blotches of colour (stains, soot, moss). */
