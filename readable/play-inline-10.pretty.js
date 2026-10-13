/* src/textures/00_lib.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: shared procedural-art library
 * Owned by: textures.
 *
 * Internal toolkit used by every file in src/textures/. Lives on the
 * private namespace G._tx (never used by other modules). Provides:
 *   - canvas creation, colour helpers, colour ramps
 *   - TILEABLE value-noise fBm and Worley (cellular) noise
 *   - wrap-around drawing (so hand-drawn details tile seamlessly)
 *   - weathering brushes: grime, streaks, cracks, speckle, stains
 *   - height -> normal-map conversion
 *   - retro typography helpers (fit text, arc text, outlined text)
 * ===================================================================== */
(function () {
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
  X.blotches = function (ctx, w, h, r, opts) {
    const n = opts.count || 10,
      col = opts.color || "#000",
      a = opts.alpha === undefined ? 0.15 : opts.alpha;
    const rmin = opts.rmin || w * 0.04,
      rmax = opts.rmax || w * 0.15;
    // opts.pow > 1: power-law sizes (many small, few large — natural stains); opts.cluster = n: stains gather around n spots and
    // trail downwards along water-runoff paths instead of an even "leopard" scatter
    const pw = opts.pow || 1,
      cl = opts.cluster
        ? Array.from({ length: opts.cluster }, () => [r() * w, r() * h])
        : null;
    for (let i = 0; i < n; i++) {
      let x = r() * w,
        y = r() * h;
      if (cl) {
        const c = cl[(r() * cl.length) | 0];
        x = c[0] + (r() - 0.5) * w * 0.1;
        y = c[1] + Math.pow(r(), 1.5) * h * 0.35;
      }
      const radius = rmin + Math.pow(r(), pw) * (rmax - rmin);
      const sx = opts.stretchY ? 1 : 1,
        sy = opts.stretchY || 1;
      X.wrap(w, h, x, y, radius * Math.max(sx, sy), (xx, yy) => {
        const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, radius);
        g.addColorStop(0, X.css(col, a * (0.5 + r() * 0.5)));
        g.addColorStop(1, X.css(col, 0));
        ctx.save();
        ctx.translate(xx, yy);
        ctx.scale(sx, sy);
        ctx.translate(-xx, -yy);
        ctx.fillStyle = g;
        ctx.fillRect(xx - radius, yy - radius, radius * 2, radius * 2);
        ctx.restore();
      });
    }
  };
  /** Vertical grime/rain streaks running down (tile-safe vertically). */
  X.streaks = function (ctx, w, h, r, opts) {
    const n = opts.count || 30,
      col = opts.color || "#2a2418",
      a = opts.alpha === undefined ? 0.18 : opts.alpha;
    for (let i = 0; i < n; i++) {
      const x = r() * w,
        y = r() * h,
        len = (opts.minLen || h * 0.1) + r() * (opts.maxLen || h * 0.5),
        sw = (opts.minW || 1) + r() * (opts.maxW || 6);
      X.wrap(w, h, x, y + len / 2, Math.max(len, sw), (xx, yy) => {
        const y0 = yy - len / 2;
        const g = ctx.createLinearGradient(0, y0, 0, y0 + len);
        g.addColorStop(0, X.css(col, a));
        g.addColorStop(0.3, X.css(col, a * 0.7));
        g.addColorStop(1, X.css(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(xx - sw / 2, y0);
        ctx.lineTo(xx + sw / 2, y0);
        ctx.lineTo(xx + sw * 0.2, y0 + len);
        ctx.lineTo(xx - sw * 0.2, y0 + len);
        ctx.fill();
      });
    }
  };
  /** Branching cracks (random walk polylines). Draws to ctx and optional height ctx (dark = low). */
  X.cracks = function (ctx, w, h, r, opts, hctx) {
    const n = opts.count || 6,
      col = opts.color || "rgba(20,18,15,0.8)",
      lw = opts.width || 1.5;
    const segLen = opts.seg || w * 0.02,
      steps = opts.steps || 30;
    // A crack keeps a slowly drifting heading with a jagged zig-zag around it (a random walk of the heading itself
    // produced worm/tree-root shapes), tapers towards both ends and forks rarely.
    function branch(x, y, ang, width, depth, len) {
      const pts = [[x, y]];
      let head = ang;
      for (let s = 0; s < len; s++) {
        head += (r() - 0.5) * 0.24;
        const a = head + (r() - 0.5) * 0.8;
        const sl = segLen * (0.6 + r() * 0.8);
        x += Math.cos(a) * sl;
        y += Math.sin(a) * sl;
        pts.push([x, y]);
        if (depth < 2 && r() < 0.05)
          branch(
            x,
            y,
            head + (r() < 0.5 ? -1 : 1) * (0.45 + r() * 0.6),
            width * 0.55,
            depth + 1,
            ((len - s) * 0.45) | 0,
          );
      }
      if (pts.length < 2) return;
      const bx = Math.min(...pts.map((p) => p[0])),
        by = Math.min(...pts.map((p) => p[1]));
      const ex = Math.max(...pts.map((p) => p[0])),
        ey = Math.max(...pts.map((p) => p[1]));
      const cxm = (bx + ex) / 2,
        cym = (by + ey) / 2,
        radius = Math.max(ex - bx, ey - by) / 2 + 4;
      // opts.vary: the opening width wanders along the crack (0.4–1.7×) instead of one even line
      const vw = [];
      let vv = 1;
      for (let k = 0; k <= pts.length; k++) {
        vv = Math.max(0.4, Math.min(1.7, vv + (r() - 0.5) * 0.6));
        vw.push(opts.vary ? vv : 1);
      }
      const N = pts.length - 1,
        taper = (k) =>
          (0.3 +
            0.7 *
              Math.sqrt(Math.sin(Math.PI * Math.min(1, Math.max(0, k / N))))) *
          vw[Math.max(0, Math.min(vw.length - 1, Math.round(k)))];
      // opts.spall: chipped edges — small broken-out flakes along the crack (lighter/darker fill, lower in the height map)
      const chips = [];
      if (opts.spall)
        for (let k = 1; k < N; k++)
          if (r() < 0.22) {
            const p = pts[k],
              a = r() * Math.PI * 2,
              d = width * (0.8 + r() * 1.5);
            chips.push([
              p[0] + Math.cos(a) * d * 0.6,
              p[1] + Math.sin(a) * d * 0.6,
              width * (1.2 + r() * 2.2),
              (r() * 1e9) | 0,
            ]);
          }
      X.wrap(w, h, cxm, cym, radius, (xx, yy) => {
        const ox = xx - cxm,
          oy = yy - cym;
        for (const c of [
          [ctx, col, width],
          hctx ? [hctx, "#000", width * 1.6] : null,
        ]) {
          if (!c) continue;
          const g = c[0];
          g.strokeStyle = c[1];
          g.lineJoin = "round";
          g.lineCap = "round";
          for (let k = 1; k <= N; k++) {
            g.lineWidth = Math.max(0.5, c[2] * taper(k - 0.5));
            g.beginPath();
            g.moveTo(pts[k - 1][0] + ox, pts[k - 1][1] + oy);
            g.lineTo(pts[k][0] + ox, pts[k][1] + oy);
            g.stroke();
          }
        }
        for (const c of chips) {
          const rr = X.rng(c[3]);
          X.blobPath(ctx, c[0] + ox, c[1] + oy, c[2], rr, 7, 0.7);
          ctx.fillStyle = opts.spall;
          ctx.fill();
          if (hctx) {
            const rr2 = X.rng(c[3]);
            X.blobPath(hctx, c[0] + ox, c[1] + oy, c[2], rr2, 7, 0.7);
            hctx.fillStyle = "rgba(40,40,40,0.55)";
            hctx.fill();
          }
        }
        if (opts.highlight) {
          // light lip on one side sells depth
          ctx.strokeStyle = opts.highlight;
          ctx.lineWidth = Math.max(0.5, width * 0.5);
          ctx.beginPath();
          ctx.moveTo(pts[0][0] + ox + 1, pts[0][1] + oy + 1);
          for (let k = 1; k < pts.length; k++)
            ctx.lineTo(pts[k][0] + ox + 1, pts[k][1] + oy + 1);
          ctx.stroke();
        }
      });
    }
    for (let i = 0; i < n; i++)
      branch(
        r() * w,
        r() * h,
        r() * Math.PI * 2,
        lw * (0.6 + r() * 0.8),
        0,
        (steps * (0.5 + r())) | 0,
      );
  };
  /**
   * Masonry cracks that follow the mortar joints of a running-bond grid in a stepped diagonal (settlement cracks):
   * down one course along a head joint, sideways half a unit along the bed joint, occasionally straight through a unit.
   * o: {count, bw (unit width px), bh (course height px), width, color, lip (light edge colour or null)}. Tapered, tile-safe.
   */
  X.stepCracks = function (ctx, w, h, r, o, hctx) {
    const bw = o.bw,
      bh = o.bh,
      n = o.count || 2,
      col = o.color || "rgba(18,14,12,0.75)",
      lw = o.width || 1.2;
    for (let i = 0; i < n; i++) {
      const row = (r() * (h / bh)) | 0,
        off = ((row % 2) * bw) / 2;
      let x = off + ((r() * (w / bw)) | 0) * bw,
        y = row * bh,
        dir = r() < 0.5 ? -1 : 1;
      const pts = [[x, y]],
        steps = 4 + ((r() * (o.maxSteps || 9)) | 0);
      for (let k = 0; k < steps; k++) {
        if (r() < 0.12) {
          x += dir * bw * (0.3 + r() * 0.4);
          y += bh;
        } // through a unit
        else {
          y += bh;
          pts.push([x, y]);
          x += (dir * bw) / 2;
        } // down a head joint, then along the bed joint
        pts.push([x, y]);
        if (r() < 0.1) dir = -dir;
      }
      const N = pts.length - 1;
      const bx = Math.min(...pts.map((p) => p[0])),
        ex = Math.max(...pts.map((p) => p[0])),
        by = pts[0][1],
        ey = pts[N][1];
      X.wrap(
        w,
        h,
        (bx + ex) / 2,
        (by + ey) / 2,
        Math.max(ex - bx, ey - by) / 2 + 4,
        (xx, yy) => {
          const ox = xx - (bx + ex) / 2,
            oy = yy - (by + ey) / 2;
          for (const c of [
            [ctx, col, lw],
            hctx ? [hctx, "#1a1a1a", lw * 1.4] : null,
          ]) {
            if (!c) continue;
            const g = c[0];
            g.save();
            g.strokeStyle = c[1];
            g.lineCap = "round";
            g.lineJoin = "round";
            for (let k = 1; k <= N; k++) {
              const t = k / N;
              g.lineWidth = Math.max(
                0.5,
                c[2] * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, t * 1.1))),
              );
              g.beginPath();
              g.moveTo(pts[k - 1][0] + ox, pts[k - 1][1] + oy);
              g.lineTo(pts[k][0] + ox, pts[k][1] + oy);
              g.stroke();
            }
            g.restore();
          }
          if (o.lip) {
            ctx.save();
            ctx.strokeStyle = o.lip;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(pts[0][0] + ox + 0.8, pts[0][1] + oy + 0.8);
            for (let k = 1; k <= N; k++)
              ctx.lineTo(pts[k][0] + ox + 0.8, pts[k][1] + oy + 0.8);
            ctx.stroke();
            ctx.restore();
          }
        },
      );
    }
  };
  /**
   * Bullet strikes on masonry: bursts (a short sweep along a line) or loose scatters, varied calibres; each hit is a dark
   * soft crater inside a lighter, irregular spall (fresh material under the grime), shallow spall + deep core in the height.
   * o: {count (bursts), spread px, size px (core radius), spall:'r,g,b' lighter tone}.
   */
  X.bulletStrikes = function (ctx, w, h, r, o, hctx) {
    const sp = o.spall || "205,190,165",
      size = o.size || 1.2;
    for (let k = 0; k < (o.count || 3); k++) {
      const cx = o.cx !== undefined ? o.cx : r() * w,
        cy = o.cy !== undefined ? o.cy : r() * h,
        sweep = r() < 0.55,
        ang = (r() - 0.5) * 0.9 + (r() < 0.5 ? 0 : Math.PI),
        len = (o.spread || 50) * (0.6 + r());
      const hits = 3 + ((r() * (sweep ? 9 : 6)) | 0),
        cal = size * (0.7 + r() * 0.9);
      for (let q = 0; q < hits; q++) {
        let px, py;
        if (sweep) {
          const t = q / hits - 0.5 + (r() - 0.5) * 0.15;
          px = cx + Math.cos(ang) * len * t + (r() - 0.5) * len * 0.12;
          py = cy + Math.sin(ang) * len * t + (r() - 0.5) * len * 0.12;
        } else {
          const a = r() * Math.PI * 2,
            d = Math.pow(r(), 1.6) * len * 0.5;
          px = cx + Math.cos(a) * d;
          py = cy + Math.sin(a) * d;
        }
        const cr = cal * (0.6 + r() * 0.8),
          sr = cr * (2 + r() * 2.2);
        X.wrap(w, h, px, py, sr + 2, (xx, yy) => {
          ctx.save();
          X.blobPath(ctx, xx, yy, sr, r, 7, 0.7);
          ctx.clip();
          const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, sr);
          g.addColorStop(0, "rgba(" + sp + ",0.34)");
          g.addColorStop(0.6, "rgba(" + sp + ",0.18)");
          g.addColorStop(1, "rgba(" + sp + ",0)");
          ctx.fillStyle = g;
          ctx.fillRect(xx - sr, yy - sr, sr * 2, sr * 2);
          ctx.restore();
          const c = ctx.createRadialGradient(xx, yy, 0, xx, yy, cr * 1.3);
          c.addColorStop(0, "rgba(12,10,8,0.9)");
          c.addColorStop(0.55, "rgba(22,18,14,0.6)");
          c.addColorStop(1, "rgba(22,18,14,0)");
          ctx.fillStyle = c;
          ctx.fillRect(xx - cr * 1.3, yy - cr * 1.3, cr * 2.6, cr * 2.6);
          if (hctx) {
            const hg = hctx.createRadialGradient(xx, yy, 0, xx, yy, sr);
            hg.addColorStop(0, "rgba(20,20,20,0.9)");
            hg.addColorStop(cr / sr, "rgba(60,60,60,0.5)");
            hg.addColorStop(1, "rgba(90,90,90,0)");
            hctx.fillStyle = hg;
            hctx.fillRect(xx - sr, yy - sr, sr * 2, sr * 2);
          }
        });
      }
    }
  };
  /** Random small dots (aggregate, dirt, pits). Fast path: tiny dots are rects, colours pre-baked. */
  X.speckle = function (ctx, w, h, r, opts, hctx) {
    const n = opts.count || 500,
      cols = opts.colors || ["#000"],
      s0 = opts.min || 0.5,
      s1 = opts.max || 2,
      a = opts.alpha === undefined ? 1 : opts.alpha;
    const styles = cols.map((c) =>
      [0.5, 0.7, 0.85, 1].map((k) => X.css(c, a * k)),
    );
    for (let i = 0; i < n; i++) {
      const x = r() * w,
        y = r() * h,
        s = s0 + r() * r() * (s1 - s0);
      ctx.fillStyle = styles[(r() * cols.length) | 0][(r() * 4) | 0];
      if (s < 1.4) ctx.fillRect(x - s * 0.5, y - s * 0.5, s, s);
      else {
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      }
      if (hctx && opts.height !== undefined) {
        hctx.fillStyle = opts.height;
        if (s < 1.4) hctx.fillRect(x - s * 0.5, y - s * 0.5, s, s);
        else {
          hctx.beginPath();
          hctx.arc(x, y, s, 0, Math.PI * 2);
          hctx.fill();
        }
      }
    }
  };
  /** Irregular polygon blob path (for chips, peeled paint, puddles). */
  X.blobPath = function (ctx, x, y, radius, r, pts, rough) {
    pts = pts || 10;
    rough = rough === undefined ? 0.45 : rough;
    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const a = ((i % pts) / pts) * Math.PI * 2,
        rr = radius * (1 - rough / 2 + r() * rough);
      const px = x + Math.cos(a) * rr,
        py = y + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };
  /** Smooth blob using quadratic curves between jittered points. */
  X.smoothBlob = function (ctx, x, y, rx, ry, r, pts, rough) {
    pts = pts || 12;
    rough = rough === undefined ? 0.35 : rough;
    const P = [];
    for (let i = 0; i < pts; i++) {
      const a = (i / pts) * Math.PI * 2,
        k = 1 - rough / 2 + r() * rough;
      P.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]);
    }
    ctx.beginPath();
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let m = mid(P[pts - 1], P[0]);
    ctx.moveTo(m[0], m[1]);
    for (let i = 0; i < pts; i++) {
      const n = P[(i + 1) % pts],
        mm = mid(P[i], n);
      ctx.quadraticCurveTo(P[i][0], P[i][1], mm[0], mm[1]);
    }
    ctx.closePath();
  };

  // ------------------------------------------------------------------
  // Height -> normal map (tileable Sobel). height: Float32Array 0..1.
  // step: sample every `step` pixels (normal maps can be half-res).
  // ------------------------------------------------------------------
  X.heightFromCtx = function (hctx, w, h) {
    const d = hctx.getImageData(0, 0, w, h).data,
      out = new Float32Array(w * h);
    for (let i = 0, o = 0; i < out.length; i++, o += 4) out[i] = d[o] / 255;
    return out;
  };
  /** Tileable separable box blur (radius r) of a Float32 field, in place. */
  X.blurField = function (f, w, h, radius) {
    radius = radius || 1;
    const tmp = new Float32Array(w * h),
      k = 1 / (radius * 2 + 1);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let a = 0;
        for (let d = -radius; d <= radius; d++)
          a += f[y * w + ((x + d + w) % w)];
        tmp[y * w + x] = a * k;
      }
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let a = 0;
        for (let d = -radius; d <= radius; d++)
          a += tmp[((y + d + h) % h) * w + x];
        f[y * w + x] = a * k;
      }
    return f;
  };
  X.normalCanvas = function (height, w, h, strength, step) {
    step = step || 1;
    X.blurField(height, w, h, step); // kill per-pixel noise: normal maps should read as form, not static
    const nw = Math.max(1, (w / step) | 0),
      nh = Math.max(1, (h / step) | 0);
    const cv = X.canvas(nw, nh);
    const img = cv.ctx.createImageData(nw, nh),
      d = img.data;
    const H = (x, y) => height[(((y % h) + h) % h) * w + (((x % w) + w) % w)];
    const s = strength || 2;
    for (let y = 0; y < nh; y++)
      for (let x = 0; x < nw; x++) {
        const X0 = x * step,
          Y0 = y * step;
        const tl = H(X0 - step, Y0 - step),
          t = H(X0, Y0 - step),
          tr = H(X0 + step, Y0 - step);
        const l = H(X0 - step, Y0),
          rr = H(X0 + step, Y0);
        const bl = H(X0 - step, Y0 + step),
          b = H(X0, Y0 + step),
          br = H(X0 + step, Y0 + step);
        const dx = tr + 2 * rr + br - (tl + 2 * l + bl);
        const dy = bl + 2 * b + br - (tl + 2 * t + tr);
        let nx = -dx * s,
          ny = dy * s,
          nz = 1; // canvas y down -> flip for OpenGL-style normal maps
        const len = Math.hypot(nx, ny, nz);
        nx /= len;
        ny /= len;
        nz /= len;
        const o = (y * nw + x) * 4;
        d[o] = (nx * 0.5 + 0.5) * 255;
        d[o + 1] = (ny * 0.5 + 0.5) * 255;
        d[o + 2] = (nz * 0.5 + 0.5) * 255;
        d[o + 3] = 255;
      }
    cv.ctx.putImageData(img, 0, 0);
    return cv.c;
  };

  // ------------------------------------------------------------------
  // Typography
  // ------------------------------------------------------------------
  X.FONTS = {
    script:
      '"Brush Script MT","Brush Script Std","Snell Roundhand","Segoe Script","Lucida Handwriting",cursive',
    impact:
      'Impact,"Haettenschweiler","Arial Black","Arial Narrow Bold",sans-serif',
    condensed: '"Oswald","DIN Condensed","Arial Narrow",Impact,sans-serif',
    serif: 'Georgia,"Times New Roman",serif',
    didone: '"Bodoni 72","Didot","Bodoni MT","Big Caslon",Georgia,serif',
    slab: '"Rockwell","American Typewriter","Roboto Slab","Courier New",serif',
    deco: '"Futura","Century Gothic","Avenir Next","Trebuchet MS",sans-serif',
    copper:
      '"Copperplate","Copperplate Gothic Bold","Engravers MT",Georgia,serif',
    typewriter: '"Special Elite","American Typewriter","Courier New",monospace',
    mono: '"Share Tech Mono","Courier New",monospace',
    marker: '"Marker Felt","Chalkboard SE","Comic Sans MS",cursive',
    helv: '"Helvetica Neue",Helvetica,Arial,sans-serif',
    black: '"Arial Black","Helvetica Neue",Arial,sans-serif',
    rounded:
      '"Arial Rounded MT Bold","Arial Rounded","Varela Round","Trebuchet MS",sans-serif',
    stencil: '"Stencil","Stencil Std","Impact","Arial Black",sans-serif',
    fancy: '"Herculanum","Papyrus","Copperplate",fantasy',
  };
  /** ctx.font string with size clamped so text fits maxW. Returns final size. `extra(size)` = decoration width. */
  X.setFont = function (ctx, text, size, family, maxW, weight, italic, extra) {
    const f = X.FONTS[family] || family;
    let s = size;
    const mk = () =>
      (italic ? "italic " : "") +
      (weight || "bold") +
      " " +
      Math.round(s) +
      "px " +
      f;
    ctx.font = mk();
    if (maxW) {
      // two passes: decorations (stroke, skew, extrusion) scale with the size
      for (let pass = 0; pass < 2; pass++) {
        const m = ctx.measureText(text).width + (extra ? extra(s) : 0);
        if (m > maxW) {
          s = Math.max(6, (s * maxW) / m);
          ctx.font = mk();
        } else break;
      }
    }
    return s;
  };
  /**
   * Optional safe area for lettering, in the CURRENT drawing coordinates: {x0, x1}. While set (e.g. by the
   * billboard renderer), X.text shrinks any line that would cross it — so no slogan is ever cut by the frame.
   */
  X.textSafe = null;
  /**
   * Draw styled text. o: {size, font, weight, italic, color, stroke, strokeW, shadow ('#000'), shadowOff, align, base,
   *   maxW, skew (x shear), spacing (px), glow, extrude:{color, dx, dy, n}}
   * maxW is honoured INCLUDING letter-spacing, outline, skew and extrusion (all widen the ink).
   */
  X.text = function (ctx, str, x, y, o) {
    o = o || {};
    str = String(str);
    ctx.save();
    ctx.textAlign = o.align || "center";
    ctx.textBaseline = o.base || "middle";
    // letter-spacing must be active while measuring (it widens the line)
    const hasLS = "letterSpacing" in ctx;
    if (hasLS) ctx.letterSpacing = (o.spacing || 0) + "px";
    const extra = (s) => {
      const k = s / (o.size || 32);
      let e =
        (o.stroke ? (o.strokeW || s * 0.12) * k : 0) +
        Math.abs(o.skew || 0) * s * 0.8 +
        (o.italic ? s * 0.08 : 0);
      if (o.extrude) e += Math.abs(o.extrude.dx || 1) * (o.extrude.n || 6);
      if (o.shadow) e += o.shadowOff || s * 0.06;
      if (!hasLS && o.spacing) e += o.spacing * str.length;
      return e;
    };
    let maxW = o.maxW || 0;
    const safe = X.textSafe;
    if (safe && !o.noSafe) {
      const al = ctx.textAlign;
      const room =
        al === "center"
          ? 2 * Math.min(x - safe.x0, safe.x1 - x)
          : al === "left" || al === "start"
            ? safe.x1 - x
            : x - safe.x0;
      if (room > 10) maxW = maxW ? Math.min(maxW, room) : room;
    }
    const size = X.setFont(
      ctx,
      str,
      o.size || 32,
      o.font || "impact",
      maxW || null,
      o.weight,
      o.italic,
      extra,
    );
    ctx.translate(x, y);
    if (o.skew) ctx.transform(1, 0, o.skew, 1, 0, 0);
    if (o.scaleY) ctx.scale(1, o.scaleY);
    const sk = size / (o.size || 32);
    if (o.extrude) {
      // 3-D block letters, very 50s
      const e = o.extrude,
        n = e.n || 6;
      ctx.fillStyle = X.css(e.color || "#000");
      for (let i = n; i >= 1; i--)
        ctx.fillText(str, (e.dx || 1) * i, (e.dy || 1) * i);
    }
    if (o.shadow) {
      ctx.fillStyle = X.css(o.shadow, o.shadowA || 0.6);
      const so = o.shadowOff || size * 0.06;
      ctx.fillText(str, so, so);
    }
    if (o.glow) {
      ctx.shadowColor = X.css(o.glow);
      ctx.shadowBlur = o.glowBlur || size * 0.4;
    }
    if (o.stroke) {
      ctx.lineJoin = "round";
      ctx.strokeStyle = X.css(o.stroke);
      ctx.lineWidth =
        (o.strokeW || (o.size || 32) * 0.12) * Math.min(1, sk * 1.15);
      ctx.strokeText(str, 0, 0);
    }
    ctx.fillStyle = o.fill || X.css(o.color || "#fff");
    ctx.fillText(str, 0, 0);
    if (o.inner) {
      ctx.strokeStyle = X.css(o.inner);
      ctx.lineWidth = o.innerW || 1;
      ctx.strokeText(str, 0, 0);
    }
    if (X.textCapture) captureText(ctx, str, size, o);
    ctx.restore();
    return size;
  };
  /**
   * While X.textCapture is an array, every X.text call records its device-space bounding box
   * {x, y, w, h, size} (size in device px). 32_ads.js uses this to keep weathering off brand wordmarks.
   */
  X.textCapture = null;
  function captureText(ctx, str, size, o) {
    try {
      const w = ctx.measureText(str).width,
        h = size * 1.05;
      const al = ctx.textAlign,
        bl = ctx.textBaseline;
      const x0 =
        al === "center" ? -w / 2 : al === "right" || al === "end" ? -w : 0;
      const y0 =
        bl === "middle"
          ? -h / 2
          : bl === "top"
            ? 0
            : bl === "bottom"
              ? -h
              : -h * 0.8;
      const m = ctx.getTransform();
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const [px, py] of [
        [x0, y0],
        [x0 + w, y0],
        [x0, y0 + h],
        [x0 + w, y0 + h],
      ]) {
        const X1 = m.a * px + m.c * py + m.e,
          Y1 = m.b * px + m.d * py + m.f;
        minX = Math.min(minX, X1);
        maxX = Math.max(maxX, X1);
        minY = Math.min(minY, Y1);
        maxY = Math.max(maxY, Y1);
      }
      X.textCapture.push({
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY,
        size: maxY - minY,
      });
    } catch (e) {
      /* capture is best-effort */
    }
  }
  /** Text along a circular arc (centre cx,cy, radius), centred on angle `mid` (radians, -PI/2 = top). */
  X.arcText = function (ctx, str, cx, cy, radius, mid, o) {
    o = o || {};
    ctx.save();
    X.setFont(ctx, str, o.size || 30, o.font || "impact", null, o.weight);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const widths = Array.from(str).map(
      (ch) => ctx.measureText(ch).width + (o.spacing || 0),
    );
    const total = widths.reduce((a, b) => a + b, 0);
    const dir = o.inside ? -1 : 1;
    let ang = mid - (dir * (total / radius)) / 2;
    Array.from(str).forEach((ch, i) => {
      const a = ang + (dir * (widths[i] / 2)) / radius;
      ctx.save();
      ctx.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.rotate(a + (dir * Math.PI) / 2);
      if (o.stroke) {
        ctx.strokeStyle = X.css(o.stroke);
        ctx.lineWidth = o.strokeW || 3;
        ctx.lineJoin = "round";
        ctx.strokeText(ch, 0, 0);
      }
      ctx.fillStyle = X.css(o.color || "#fff");
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      ang += (dir * widths[i]) / radius;
    });
    ctx.restore();
  };

  // ------------------------------------------------------------------
  // Retro graphic primitives shared by billboards/posters/signs
  // ------------------------------------------------------------------
  /** Sunburst rays from (cx,cy). */
  X.sunburst = function (ctx, cx, cy, radius, n, c1, c2, rot) {
    ctx.save();
    ctx.fillStyle = X.css(c1);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = X.css(c2);
    for (let i = 0; i < n; i++) {
      const a0 = (rot || 0) + (i / n) * Math.PI * 2,
        a1 = a0 + Math.PI / n;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a0) * radius, cy + Math.sin(a0) * radius);
      ctx.lineTo(cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };
  /** Multi-point starburst ("NEW!" badge). */
  X.starburst = function (ctx, cx, cy, r0, r1, n, fill, stroke, lw) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2,
        rr = i % 2 ? r0 : r1;
      const px = cx + Math.cos(a) * rr,
        py = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = X.css(fill);
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = X.css(stroke);
      ctx.lineWidth = lw || 3;
      ctx.stroke();
    }
  };
  /** Classic 5-point star. */
  X.star = function (ctx, cx, cy, r, fill, stroke, lw, rot) {
    X.starPath(ctx, cx, cy, r, r * 0.42, 5, rot);
    if (fill) {
      ctx.fillStyle = X.css(fill);
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = X.css(stroke);
      ctx.lineWidth = lw || 2;
      ctx.stroke();
    }
  };
  X.starPath = function (ctx, cx, cy, r1, r0, n, rot) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (rot || 0) - Math.PI / 2 + (i / (n * 2)) * Math.PI * 2,
        rr = i % 2 ? r0 : r1;
      const px = cx + Math.cos(a) * rr,
        py = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };
  /** Rounded rectangle path. */
  X.rrect = function (ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };
  /** Halftone dot overlay inside a rect (print texture). */
  X.halftone = function (ctx, x, y, w, h, step, color, alpha, angle) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(angle || 0.4);
    ctx.fillStyle = X.css(color || "#000", alpha || 0.12);
    const R = Math.hypot(w, h) / 2;
    for (let yy = -R; yy < R; yy += step)
      for (let xx = -R; xx < R; xx += step) {
        ctx.beginPath();
        ctx.arc(xx, yy, step * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
    ctx.restore();
  };
  /** Ribbon banner with folded tails. */
  X.ribbon = function (ctx, cx, cy, w, h, fill, dark) {
    const t = h * 0.8;
    ctx.fillStyle = X.css(dark);
    ctx.beginPath(); // left tail
    ctx.moveTo(cx - w / 2 - t, cy - h / 2 + h * 0.25);
    ctx.lineTo(cx - w / 2 + t * 0.4, cy - h / 2 + h * 0.25);
    ctx.lineTo(cx - w / 2 + t * 0.4, cy + h / 2 + h * 0.25);
    ctx.lineTo(cx - w / 2 - t, cy + h / 2 + h * 0.25);
    ctx.lineTo(cx - w / 2 - t * 0.5, cy + h * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath(); // right tail
    ctx.moveTo(cx + w / 2 + t, cy - h / 2 + h * 0.25);
    ctx.lineTo(cx + w / 2 - t * 0.4, cy - h / 2 + h * 0.25);
    ctx.lineTo(cx + w / 2 - t * 0.4, cy + h / 2 + h * 0.25);
    ctx.lineTo(cx + w / 2 + t, cy + h / 2 + h * 0.25);
    ctx.lineTo(cx + w / 2 + t * 0.5, cy + h * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = X.css(fill);
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  };
  /** Radiation trefoil. */
  X.trefoil = function (ctx, cx, cy, r, color, bg) {
    ctx.save();
    if (bg) {
      ctx.fillStyle = X.css(bg);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = X.css(color);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a - Math.PI / 6, a + Math.PI / 6);
      ctx.arc(cx, cy, r * 0.3, a + Math.PI / 6, a - Math.PI / 6, true);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };
})();
