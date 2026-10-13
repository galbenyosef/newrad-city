// play-inline-490 01 — ctx
// Lines 15-195 of readable/play-inline-490.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;

  // ------------------------------------------------------------------
  // Canvas textures
  // ------------------------------------------------------------------
  const texCache = {};
  function canvasTex(name, size, paint, opts) {
    if (texCache[name]) return texCache[name];
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    paint(ctx, size);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (!opts || !opts.linear) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    texCache[name] = t;
    return t;
  }
  function rngFor(name) {
    return G.util.rng(G.util.hashStr(name));
  }

  /** Fill with tileable-ish value noise between lo and hi (0..255 grey), tinted by rgb multipliers. */
  function noiseFill(ctx, s, freq, lo, hi, tint, oct) {
    const img = ctx.getImageData(0, 0, s, s),
      d = img.data;
    const U = G.util;
    tint = tint || [1, 1, 1];
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        // wrap noise by sampling on a torus-ish blend so edges tile reasonably
        const u = x / s,
          v = y / s;
        const n =
          U.fbm2(u * freq, v * freq, oct || 4) * (1 - u) * (1 - v) +
          U.fbm2((u - 1) * freq, v * freq, oct || 4) * u * (1 - v) +
          U.fbm2(u * freq, (v - 1) * freq, oct || 4) * (1 - u) * v +
          U.fbm2((u - 1) * freq, (v - 1) * freq, oct || 4) * u * v;
        const g = lo + (hi - lo) * n;
        const i = (y * s + x) * 4;
        d[i] = Math.min(255, g * tint[0]);
        d[i + 1] = Math.min(255, g * tint[1]);
        d[i + 2] = Math.min(255, g * tint[2]);
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  function scratches(ctx, s, n, rng, color, maxLen, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 1;
    for (let i = 0; i < n; i++) {
      const x = rng() * s,
        y = rng() * s,
        a = rng() * Math.PI * 2,
        l = 4 + rng() * (maxLen || 30);
      ctx.globalAlpha = 0.15 + rng() * 0.45;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function blotches(ctx, s, n, rng, color, rMax) {
    for (let i = 0; i < n; i++) {
      const x = rng() * s,
        y = rng() * s,
        r = 3 + rng() * (rMax || 20);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.3 + rng() * 0.5;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------------
  // Enamel paint (military olive, cola red, civil-defense blue ...)
  // Painted in the actual base colour so chips can show *bare, lighter*
  // steel instead of black holes. Every colour uses the same seed, so the
  // chips line up with the shared bump texture (chips are recessed).
  // Look: soft mottled enamel, grime pooling in gradients, sparse small
  // chips clustered along a few "edges", fine light scuffs. Low contrast.
  // ------------------------------------------------------------------
  let noiseCanvas = null;
  function getNoiseCanvas(s) {
    if (noiseCanvas && noiseCanvas.width === s) return noiseCanvas;
    noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = noiseCanvas.height = s;
    noiseFill(noiseCanvas.getContext("2d"), s, 9, 70, 190, null, 4);
    return noiseCanvas;
  }
  function drawEnamel(c, s, base, bump) {
    const r = rngFor("enamel");
    // 1) base coat + soft mottling (overlay keeps the hue)
    c.fillStyle = bump ? "#c8c8c8" : base;
    c.fillRect(0, 0, s, s);
    c.globalCompositeOperation = bump ? "source-over" : "overlay";
    c.globalAlpha = bump ? 0.18 : 0.32;
    c.drawImage(getNoiseCanvas(s), 0, 0);
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    // 2) grime: broad, faint darkening gradients (dirt pooling), a few faded sun-bleached patches
    for (let i = 0; i < 9; i++) {
      const x = r() * s,
        y = r() * s,
        rad = 20 + r() * 60;
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() < 0.7;
      g.addColorStop(
        0,
        bump
          ? "rgba(0,0,0,0)"
          : dark
            ? "rgba(40,32,20,0.22)"
            : "rgba(235,225,200,0.10)",
      );
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // 3) chips: few and small, clustered along random lines (panel edges / corners)
    for (let e = 0; e < 5; e++) {
      const horiz = r() < 0.5,
        line = r() * s,
        from = r() * s,
        len = 30 + r() * 90;
      const n = 3 + Math.floor(r() * 5);
      for (let i = 0; i < n; i++) {
        const t = from + r() * len,
          off = (r() - 0.5) * 6;
        const x = (horiz ? t : line + off) % s,
          y = (horiz ? line + off : t) % s;
        const w = 0.8 + r() * 2.6,
          h = 0.6 + r() * 1.6,
          a = r() * 3;
        // darker rim (paint edge) then bare steel inside
        c.fillStyle = bump ? "rgba(90,90,90,0.9)" : "rgba(30,28,24,0.35)";
        c.beginPath();
        c.ellipse(x, y, w + 0.7, h + 0.7, a, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = bump ? "rgba(70,70,70,1)" : "rgba(150,148,142,0.92)";
        c.beginPath();
        c.ellipse(x, y, w, h, a, 0, Math.PI * 2);
        c.fill();
      }
    }
    // a handful of isolated pin chips
    for (let i = 0; i < 12; i++) {
      const x = r() * s,
        y = r() * s;
      c.fillStyle = bump ? "rgba(80,80,80,1)" : "rgba(140,138,132,0.8)";
      c.fillRect(x, y, 1 + (r() < 0.3 ? 1 : 0), 1);
    }
    // 4) fine scuffs (light, low alpha) and a few darker scratches
    if (!bump) {
      scratches(c, s, 40, r, "rgba(255,255,245,0.5)", 10, 1);
      scratches(c, s, 14, r, "rgba(20,20,20,0.5)", 8, 1);
    }
    c.globalAlpha = 1;
  }
  /** Enamel texture in a given base colour (hex number). */
  function paintTex(key, hex) {
    const css = "#" + ("000000" + hex.toString(16)).slice(-6);
    return canvasTex("wpn_paint_" + key, 256, (c, s) =>
      drawEnamel(c, s, css, false),
    );
  }
  const paintBumpTex = () =>
    canvasTex("wpn_paint_bump", 256, (c, s) => drawEnamel(c, s, null, true), {
      linear: true,
    });

