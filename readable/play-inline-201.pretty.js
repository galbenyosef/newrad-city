/* src/poi_financial/00_lib.js */
/* =====================================================================
 * NEW RAD CITY — POI FINANCIAL (Trinity Church, Federal Reserve,
 * Fraunces Tavern, South Street Seaport)
 * 00_lib.js — geometry/material toolkit. Adapted (copied, with the
 * namespace renamed to G._pf) from landmarks_b/00_lib.js, as allowed by
 * the POI brief. Nothing here touches another module's objects.
 *
 *  - PF.mat(key)          : shared vertex-coloured materials (G.mats when
 *                           present, procedural fallbacks otherwise).
 *  - PF.batch(name)       : geometry collector → one merged mesh per material,
 *                           world-projected UVs, vertex AO/grime, optional
 *                           baked interior light ('@lit' materials).
 *  - PF.col / PF.stairs   : collider helpers.
 *  - PF.register          : publishes G.pois.<id> (shared POI registry).
 *
 * Internal namespace: G._pf (shared between the files of this module only).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const U = G.util;

  const PF = (G._pf = G._pf || {});
  PF.builders = PF.builders || [];
  PF.entries = PF.entries || {};
  PF.animators = PF.animators || [];
  PF.onReady = PF.onReady || []; // fns run at initDone (props/fx available)
  PF.onNewGame = PF.onNewGame || []; // fns run at newGame
  PF.onReset = PF.onReset || []; // fns run at 'reset' (before newGame and before a save is loaded)
  PF.onLoaded = PF.onLoaded || []; // fns run at 'loaded' (after every module's save data was applied)
  /** Per-feature persistent state: key → {save(): json, load(json)} (all saved under G.save key 'poi_financial'). */
  PF.saveHooks = PF.saveHooks || {};
  /** Register a landmark builder: fn(PF, site) → returns nothing; runs in init. */
  PF.addBuilder = function (id, fn, order) {
    PF.builders.push({ id, fn, order: order || 50 });
  };

  // -------------------------------------------------------------------
  // Small math helpers
  // -------------------------------------------------------------------
  const TAU = Math.PI * 2;
  PF.TAU = TAU;
  PF.v3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _s = new THREE.Vector3(),
    _p = new THREE.Vector3();
  /** Compose a Matrix4: translate(x,y,z) * rotY/rotX/rotZ (YXZ order) * scale. */
  PF.m4 = function (x, y, z, ry, rx, rz, sx, sy, sz) {
    _e.set(rx || 0, ry || 0, rz || 0, "YXZ");
    _q.setFromEuler(_e);
    _p.set(x || 0, y || 0, z || 0);
    _s.set(
      sx === undefined ? 1 : sx,
      sy === undefined ? (sx === undefined ? 1 : sx) : sy,
      sz === undefined ? (sx === undefined ? 1 : sx) : sz,
    );
    return new THREE.Matrix4().compose(_p, _q, _s);
  };
  PF.rng = (seed) => U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  PF.terrain = (x, z) => {
    try {
      const h = G.world.terrainHeight(x, z);
      return isFinite(h) ? h : 0;
    } catch (e) {
      return 0;
    }
  };
  PF.smooth = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  // -------------------------------------------------------------------
  // Canvas texture helpers (custom textures owned by this module)
  // -------------------------------------------------------------------
  const texCache = {};
  function canvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }
  function finishTex(c, opts) {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT =
      opts && opts.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }
  /** Cached custom canvas texture. draw(ctx, w, h). */
  PF.canvasTex = function (key, w, h, draw, opts) {
    if (texCache[key]) return texCache[key];
    const c = canvas(w, h);
    const ctx = c.getContext("2d");
    try {
      draw(ctx, w, h);
    } catch (e) {
      G.reportError("init:poi_financial", e);
    }
    return (texCache[key] = finishTex(c, opts));
  };
  /** Per-pixel noise fill helper (value noise via G.util). */
  function noiseFill(ctx, w, h, fn) {
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        const c = fn(x, y, d[o], d[o + 1], d[o + 2]);
        d[o] = c[0];
        d[o + 1] = c[1];
        d[o + 2] = c[2];
        d[o + 3] = 255;
      }
    ctx.putImageData(img, 0, 0);
  }
  // tileable-ish fbm using wrapped coordinates
  function tfbm(x, y, s, w) {
    return U.fbm2((((x % w) + w) % w) / s, (((y % w) + w) % w) / s, 4);
  }

  /** Generic grainy fallback texture (used when G.tex is absent). */
  PF.noiseTex = function () {
    return PF.canvasTex("pf_noise", 256, 256, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n =
          0.72 +
          0.28 * U.fbm2(x / 18, y / 18, 4) +
          (U.hash2(x, y) - 0.5) * 0.12;
        const v = Math.max(0, Math.min(255, n * 235));
        return [v, v, v];
      });
    });
  };
  /** Weathered copper-green patina with vertical run-off streaks. */
  PF.verdigrisTex = function () {
    return PF.canvasTex("pf_verdigris", 512, 512, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = U.fbm2(x / 40, y / 40, 5);
        const streak = U.fbm2(x / 3.5, y / 90, 3); // tall, thin vertical streaks
        const blotch = U.fbm2(x / 90 + 10, y / 70 + 3, 3);
        let r = 104 + n * 44,
          g = 168 + n * 36,
          b = 146 + n * 30; // pale teal-green base
        const dark = Math.max(0, streak - 0.48) * 2.2; // dark run-off streaks
        r -= dark * 45;
        g -= dark * 55;
        b -= dark * 45;
        const chalk = Math.max(0, blotch - 0.62) * 2.5; // chalky pale patches
        r += chalk * 60;
        g += chalk * 50;
        b += chalk * 45;
        const bronze = Math.max(0, 0.3 - n) * 2.4; // bronze showing through
        r += bronze * 40;
        g -= bronze * 40;
        b -= bronze * 55;
        const grain = (U.hash2(x, y) - 0.5) * 18;
        return [r + grain, g + grain, b + grain];
      });
    });
  };
  /** Rust-stained dark iron for bridge steel & ironwork (fallback detail). */
  PF.grimeTex = function () {
    return PF.canvasTex("pf_grime", 256, 256, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tfbm(x, y, 22, 256),
          s = U.fbm2(x / 3, y / 50, 2);
        const v =
          150 +
          n * 90 -
          Math.max(0, s - 0.55) * 120 +
          (U.hash2(x, y) - 0.5) * 20;
        return [v, v * 0.97, v * 0.92];
      });
    });
  };

  /** The old-world US flag: 13 stripes and 13 stars in a ring, faded & torn. */
  PF.flagTex = function (variant) {
    return PF.canvasTex(
      "pf_flag_" + (variant || 0),
      512,
      288,
      (ctx, w, h) => {
        const sh = h / 13;
        for (let i = 0; i < 13; i++) {
          ctx.fillStyle = i % 2 ? "#e4dccb" : "#9a2a24";
          ctx.fillRect(0, i * sh, w, sh + 1);
        }
        const cw = w * 0.42,
          ch = sh * 7;
        ctx.fillStyle = "#26345a";
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = "#e8e0cc";
        const cx = cw / 2,
          cy = ch / 2,
          R = ch * 0.34;
        for (let i = 0; i < 13; i++) {
          const a = (i / 13) * TAU - Math.PI / 2;
          drawStar(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R, ch * 0.06);
        }
        // weathering: grime, fading, holes
        const r = U.rng(77 + (variant || 0) * 13);
        ctx.globalCompositeOperation = "multiply";
        for (let i = 0; i < 90; i++) {
          ctx.fillStyle =
            "rgba(" +
            ((120 + r() * 60) | 0) +
            "," +
            ((100 + r() * 50) | 0) +
            ",70," +
            (0.08 + r() * 0.12) +
            ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            10 + r() * 60,
            6 + r() * 30,
            r() * 3,
            0,
            TAU,
          );
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
        if (variant) {
          // burnt holes (alpha is not used, paint as dark scorched)
          for (let i = 0; i < 6; i++) {
            ctx.fillStyle = "rgba(25,18,12,0.85)";
            ctx.beginPath();
            ctx.arc(r() * w, r() * h, 6 + r() * 16, 0, TAU);
            ctx.fill();
          }
        }
      },
      { clamp: true },
    );
  };
  function drawStar(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU - Math.PI / 2,
        rr = i % 2 ? r * 0.42 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
  PF.drawStar = drawStar;

  /**
   * Painted / engraved sign texture.  style: 'engraved' (stone lettering),
   * 'raider' (sloppy red paint on scrap), 'enamel' (retro enamel plate),
   * 'bronze' (historical plaque), 'banner' (museum banner), 'neon'.
   */
  function fitFont(ctx, lines, fs, maxW, fam) {
    ctx.font = "bold " + fs + "px " + fam;
    let mw = 0;
    for (const t of lines) mw = Math.max(mw, ctx.measureText(t).width);
    return mw > maxW ? Math.floor((fs * maxW) / mw) : fs;
  }
  PF.signTex = function (key, lines, style, w, h, extra) {
    w = w || 512;
    h = h || 128;
    return PF.canvasTex(
      "pf_sign_" + key,
      w,
      h,
      (ctx) => {
        const r = U.rng(U.hashStr(key));
        extra = extra || {};
        const fg = extra.fg,
          bg = extra.bg;
        if (style === "engraved") {
          ctx.fillStyle = bg || "#b9b09c";
          ctx.fillRect(0, 0, w, h);
          noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
            const n = (U.fbm2(x / 20, y / 20, 3) - 0.5) * 40;
            return [R + n, Gc + n, B + n];
          });
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor(h / (lines.length + 0.6));
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            '"Times New Roman", Georgia, serif',
          );
          ctx.font = "bold " + fs + 'px "Times New Roman", Georgia, serif';
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (lines.length - 1) / 2) * fs * 1.05;
            ctx.fillStyle = "rgba(255,255,255,0.35)";
            ctx.fillText(t, w / 2 + 1, y + 2);
            ctx.fillStyle = fg || "rgba(40,34,28,0.85)";
            ctx.fillText(t, w / 2, y);
          });
        } else if (style === "raider") {
          // corrugated scrap background with rust
          ctx.fillStyle = bg || "#6d6a5e";
          ctx.fillRect(0, 0, w, h);
          for (let x = 0; x < w; x += 16) {
            ctx.fillStyle = "rgba(0,0,0,0.18)";
            ctx.fillRect(x, 0, 6, h);
          }
          for (let i = 0; i < 40; i++) {
            ctx.fillStyle =
              "rgba(" +
              ((120 + r() * 50) | 0) +
              "," +
              ((60 + r() * 30) | 0) +
              ",20," +
              (0.2 + r() * 0.4) +
              ")";
            ctx.beginPath();
            ctx.ellipse(
              r() * w,
              r() * h,
              8 + r() * 50,
              5 + r() * 30,
              r() * 3,
              0,
              TAU,
            );
            ctx.fill();
          }
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor(h / (lines.length + 0.5));
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            'Impact, "Arial Black", sans-serif',
          );
          ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (lines.length - 1) / 2) * fs * 1.05;
            ctx.save();
            ctx.translate(w / 2, y);
            ctx.rotate((r() - 0.5) * 0.08);
            // spray-paint readability: a dark over-spray outline under the letters (extra.outline=false to skip)
            if (extra.outline !== false) {
              ctx.lineJoin = "round";
              ctx.strokeStyle = extra.outlineColor || "rgba(14,10,8,0.92)";
              ctx.lineWidth = Math.max(3, fs * 0.13);
              ctx.strokeText(t, 0, 0);
              ctx.shadowColor = "rgba(0,0,0,0.6)";
              ctx.shadowBlur = fs * 0.12;
            }
            ctx.fillStyle = fg || "#b3261c";
            ctx.fillText(t, 0, 0);
            ctx.shadowBlur = 0;
            // drips
            for (let k = 0; k < 10; k++) {
              const dx = (r() - 0.5) * w * 0.8;
              ctx.fillRect(dx, fs * 0.25, 3, 6 + r() * fs * 0.6);
            }
            ctx.restore();
          });
        } else if (style === "enamel") {
          ctx.fillStyle = bg || "#1d4a3a";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = fg || "#e8dfc4";
          ctx.lineWidth = Math.max(3, h * 0.05);
          ctx.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
          ctx.fillStyle = fg || "#e8dfc4";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor((h * 0.62) / lines.length);
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
          );
          ctx.font =
            "bold " +
            fs +
            'px "Futura", "Century Gothic", "Trebuchet MS", sans-serif';
          lines.forEach((t, i) =>
            ctx.fillText(
              t,
              w / 2,
              h / 2 + (i - (lines.length - 1) / 2) * fs * 1.1,
            ),
          );
          // chipped enamel
          for (let i = 0; i < 50; i++) {
            ctx.fillStyle =
              "rgba(" +
              ((60 + r() * 50) | 0) +
              "," +
              ((40 + r() * 20) | 0) +
              ",20," +
              (0.4 + r() * 0.5) +
              ")";
            ctx.beginPath();
            ctx.arc(r() * w, r() * h, 1 + r() * 6, 0, TAU);
            ctx.fill();
          }
        } else if (style === "bronze") {
          ctx.fillStyle = "#3d3222";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#8c7448";
          ctx.lineWidth = 8;
          ctx.strokeRect(8, 8, w - 16, h - 16);
          ctx.fillStyle = "#a88d58";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor((h * 0.7) / lines.length);
          fs = fitFont(ctx, lines, fs, w * 0.92, "Georgia, serif");
          ctx.font = "bold " + fs + "px Georgia, serif";
          lines.forEach((t, i) =>
            ctx.fillText(
              t,
              w / 2,
              h / 2 + (i - (lines.length - 1) / 2) * fs * 1.15,
            ),
          );
          noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
            const n = U.fbm2(x / 30, y / 30, 3);
            const v = Math.max(0, n - 0.55) * 2;
            return [
              R * (1 - v) + 70 * v,
              Gc * (1 - v) + 130 * v,
              B * (1 - v) + 105 * v,
            ];
          });
        } else if (style === "banner") {
          ctx.fillStyle = bg || "#8e2b25";
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = fg || "#eadcbc";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor(w * 0.16);
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
          );
          ctx.font =
            "bold " +
            fs +
            'px "Futura", "Century Gothic", "Trebuchet MS", sans-serif';
          lines.forEach((t, i) =>
            ctx.fillText(t, w / 2, h * 0.18 + i * fs * 1.25),
          );
          if (extra.emblem) extra.emblem(ctx, w, h);
          // sun-bleach & tears
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(255,240,200,0.25)");
          g.addColorStop(1, "rgba(40,30,20,0.35)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 30; i++) {
            ctx.fillStyle = "rgba(30,20,10," + (0.1 + r() * 0.25) + ")";
            ctx.beginPath();
            ctx.ellipse(
              r() * w,
              r() * h,
              6 + r() * 30,
              10 + r() * 60,
              0,
              0,
              TAU,
            );
            ctx.fill();
          }
        } else if (style === "neon") {
          ctx.fillStyle = "#080808";
          ctx.fillRect(0, 0, w, h);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor((h * 0.6) / lines.length);
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
          );
          ctx.font =
            "bold " +
            fs +
            'px "Futura", "Century Gothic", "Trebuchet MS", sans-serif';
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (lines.length - 1) / 2) * fs * 1.1;
            ctx.shadowColor = fg || "#ff5a2a";
            ctx.shadowBlur = 18;
            ctx.fillStyle = fg || "#ff7a3a";
            ctx.fillText(t, w / 2, y);
            ctx.shadowBlur = 4;
            ctx.fillStyle = "#fff4dc";
            ctx.fillText(t, w / 2, y);
          });
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = bg || "#222";
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = fg || "#ddd";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = Math.floor((h * 0.6) / lines.length);
          fs = fitFont(ctx, lines, fs, w * 0.92, "sans-serif");
          ctx.font = "bold " + fs + "px sans-serif";
          lines.forEach((t, i) =>
            ctx.fillText(
              t,
              w / 2,
              h / 2 + (i - (lines.length - 1) / 2) * fs * 1.1,
            ),
          );
        }
      },
      { clamp: true },
    );
  };

  /**
   * Transparent spray-paint graffiti (use with PF.texMat(key, tex, {transparent:true})). lines: text lines;
   * extra: {color, outline, drips, tag:'skull'|'arrow'}.
   */
  PF.graffitiTex = function (key, lines, w, h, extra) {
    extra = extra || {};
    return PF.canvasTex(
      "pf_graf_" + key,
      w || 512,
      h || 256,
      (ctx, W, H) => {
        const r = U.rng(U.hashStr(key));
        ctx.clearRect(0, 0, W, H);
        const col = extra.color || "#d8302a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fs = Math.floor((H * 0.78) / Math.max(1, lines.length));
        fs = fitFont(
          ctx,
          lines,
          fs,
          W * 0.9,
          'Impact, "Arial Black", sans-serif',
        );
        ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
        lines.forEach((t, i) => {
          const y = H / 2 + (i - (lines.length - 1) / 2) * fs * 1.02;
          ctx.save();
          ctx.translate(W / 2, y);
          ctx.rotate((r() - 0.5) * 0.12);
          ctx.lineJoin = "round";
          if (extra.outline) {
            ctx.strokeStyle = extra.outline;
            ctx.lineWidth = fs * 0.14;
            ctx.strokeText(t, 0, 0);
          }
          ctx.shadowColor = col;
          ctx.shadowBlur = fs * 0.08; // soft over-spray
          ctx.fillStyle = col;
          ctx.fillText(t, 0, 0);
          ctx.shadowBlur = 0;
          if (extra.drips !== false)
            for (let k = 0; k < 12; k++) {
              const dx = (r() - 0.5) * W * 0.8;
              ctx.fillRect(dx, fs * 0.2, 2 + r() * 2, 6 + r() * fs * 0.7);
            }
          ctx.restore();
        });
        if (extra.tag === "skull") {
          ctx.fillStyle = col;
          const cx = W * 0.88,
            cy = H * 0.3,
            rr = H * 0.14;
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, TAU);
          ctx.fill();
          ctx.fillRect(cx - rr * 0.6, cy + rr * 0.5, rr * 1.2, rr * 0.7);
          ctx.globalCompositeOperation = "destination-out";
          for (const sx of [-0.4, 0.4]) {
            ctx.beginPath();
            ctx.arc(cx + sx * rr, cy, rr * 0.28, 0, TAU);
            ctx.fill();
          }
          ctx.globalCompositeOperation = "source-over";
        }
        // speckle
        for (let i = 0; i < 160; i++) {
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.25 + r() * 0.4;
          ctx.fillRect(r() * W, r() * H, 1.5, 1.5);
        }
        ctx.globalAlpha = 1;
      },
      { clamp: true },
    );
  };

  // -------------------------------------------------------------------
  // Custom masonry / surface textures (fast canvas drawing, no per-pixel
  // noise) so every stone type in this segment reads differently even
  // when the textures module only offers one generic ashlar.
  // -------------------------------------------------------------------
  function hexToRgb(h) {
    return [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  }
  function rgbStr(c, a) {
    return (
      "rgba(" +
      (c[0] | 0) +
      "," +
      (c[1] | 0) +
      "," +
      (c[2] | 0) +
      "," +
      (a === undefined ? 1 : a) +
      ")"
    );
  }
  function jitter(c, r, amt) {
    const k = (r() - 0.5) * amt;
    return [
      c[0] * (1 + k) + (r() - 0.5) * amt * 30,
      c[1] * (1 + k) + (r() - 0.5) * amt * 30,
      c[2] * (1 + k) + (r() - 0.5) * amt * 30,
    ];
  }
  /** Soft blotches + vertical run-off streaks + specks over whatever is drawn (weathering pass). */
  function weather(ctx, w, h, r, o) {
    o = o || {};
    for (let i = 0; i < (o.blotches || 70); i++) {
      const x = r() * w,
        y = r() * h,
        rr = 8 + r() * (o.blotchR || 60);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      const dark = r() < (o.darkRatio === undefined ? 0.6 : o.darkRatio);
      g.addColorStop(
        0,
        dark
          ? "rgba(40,32,22," + (0.05 + r() * (o.dark || 0.12)) + ")"
          : "rgba(255,248,230," + (0.04 + r() * (o.light || 0.08)) + ")",
      );
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (let i = 0; i < (o.streaks || 26); i++) {
      // rain run-off streaks (tile vertically)
      const x = r() * w,
        sw = 2 + r() * 9,
        a = 0.03 + r() * (o.streak || 0.09);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(30,24,16," + a + ")");
      g.addColorStop(0.5, "rgba(30,24,16," + a * 0.4 + ")");
      g.addColorStop(1, "rgba(30,24,16," + a + ")");
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, sw, h);
    }
    for (let i = 0; i < (o.specks || 1400); i++) {
      ctx.fillStyle =
        r() < 0.5
          ? "rgba(20,16,10," + r() * 0.35 + ")"
          : "rgba(255,250,235," + r() * 0.25 + ")";
      const s = 0.6 + r() * (o.speckR || 1.6);
      ctx.fillRect(r() * w, r() * h, s, s);
    }
  }
  /**
   * Coursed ashlar: running-bond blocks with slightly varied tone, recessed joints and
   * weathering. o: {base hex, rows, cols, joint px, jointCol hex, vary, chamfer}
   */
  function ashlarDraw(o) {
    return (ctx, w, h) => {
      const r = U.rng(o.seed || 7),
        base = hexToRgb(o.base);
      ctx.fillStyle = rgbStr(hexToRgb(o.jointCol || 0x6a6252));
      ctx.fillRect(0, 0, w, h);
      const bh = h / o.rows,
        jw = o.joint || 3;
      for (let row = 0; row < o.rows; row++) {
        const cols = o.cols + (o.colVar && row % 2 ? o.colVar : 0),
          bw = w / cols,
          off = (row % 2) * bw * 0.5;
        for (let c = -1; c < cols; c++) {
          const x0 = c * bw + off + jw / 2,
            y0 = row * bh + jw / 2,
            ww = bw - jw,
            hh = bh - jw;
          const col = jitter(base, r, o.vary || 0.12);
          ctx.fillStyle = rgbStr(col);
          ctx.fillRect(x0, y0, ww, hh);
          // face shading: lighter top edge, darker bottom edge (chamfer)
          const g = ctx.createLinearGradient(0, y0, 0, y0 + hh);
          g.addColorStop(0, "rgba(255,250,235," + (o.chamfer || 0.16) + ")");
          g.addColorStop(0.12, "rgba(255,250,235,0)");
          g.addColorStop(0.85, "rgba(0,0,0,0)");
          g.addColorStop(1, "rgba(0,0,0," + (o.chamfer || 0.16) * 1.4 + ")");
          ctx.fillStyle = g;
          ctx.fillRect(x0, y0, ww, hh);
          if (o.glaze && r() < 0.35) {
            ctx.fillStyle = "rgba(255,255,255," + r() * 0.08 + ")";
            ctx.fillRect(x0 + ww * 0.1, y0 + hh * 0.15, ww * 0.5, hh * 0.25);
          }
          if (o.chips && r() < o.chips) {
            ctx.fillStyle = rgbStr(hexToRgb(o.jointCol || 0x6a6252), 0.8);
            ctx.beginPath();
            ctx.arc(
              x0 + (r() < 0.5 ? 0 : ww),
              y0 + r() * hh,
              2 + r() * 5,
              0,
              TAU,
            );
            ctx.fill();
          }
        }
      }
      weather(ctx, w, h, r, o.weather);
    };
  }
  /** Rough rubble masonry (Manhattan schist): irregular stones in a lime mortar bed. */
  function rubbleDraw(o) {
    return (ctx, w, h) => {
      const r = U.rng(o.seed || 11),
        base = hexToRgb(o.base);
      ctx.fillStyle = rgbStr(hexToRgb(o.mortar || 0x8e8a80));
      ctx.fillRect(0, 0, w, h);
      const rows = o.rows || 9;
      for (let row = 0; row < rows; row++) {
        let x = -r() * 30;
        const yc = ((row + 0.5) * h) / rows;
        while (x < w + 10) {
          const sw = 34 + r() * 60,
            sh = (h / rows) * (0.84 + r() * 0.12);
          const cx = x + sw / 2,
            cy = yc + (r() - 0.5) * 4;
          const col = jitter(base, r, o.vary || 0.3);
          ctx.fillStyle = rgbStr(col);
          ctx.beginPath();
          // squarish superellipse with a jittered rim: roughly dressed blocks packed tight, not pebbles
          const n = 14;
          for (let k = 0; k < n; k++) {
            const a = (k / n) * TAU,
              ca = Math.cos(a),
              sa = Math.sin(a),
              rr = 0.9 + r() * 0.1;
            ctx.lineTo(
              cx +
                ((Math.sign(ca) * Math.pow(Math.abs(ca), 0.4) * sw) / 2) * rr,
              cy +
                ((Math.sign(sa) * Math.pow(Math.abs(sa), 0.4) * sh) / 2) * rr,
            );
          }
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.07)";
          ctx.fillRect(cx - sw * 0.38, cy - sh * 0.42, sw * 0.76, sh * 0.12); // top-lit edge
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.fillRect(cx - sw * 0.4, cy + sh * 0.25, sw * 0.8, sh * 0.15); // underside shade
          for (let s = 0; s < 6; s++) {
            ctx.fillStyle = "rgba(220,225,230," + r() * 0.45 + ")";
            ctx.fillRect(
              cx + (r() - 0.5) * sw * 0.7,
              cy + (r() - 0.5) * sh * 0.6,
              1.5,
              1.5,
            );
          } // mica glints
          x += sw + 2 + r() * 3;
        }
      }
      weather(
        ctx,
        w,
        h,
        r,
        Object.assign({ blotches: 50, streaks: 18 }, o.weather),
      );
    };
  }
  /** Smooth render / stucco (Guggenheim): near-uniform cream with trowel marks & hairline cracks. */
  function stuccoDraw(ctx, w, h) {
    const r = U.rng(23);
    ctx.fillStyle = "#e8e1cf";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle =
        r() < 0.5 ? "rgba(255,252,240,0.06)" : "rgba(120,110,90,0.05)";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        r() * h,
        20 + r() * 50,
        6 + r() * 12,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(80,70,55,0.22)";
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 5; i++) {
      let x = r() * w,
        y = r() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 8; k++) {
        x += (r() - 0.5) * 30;
        y += r() * 22;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    weather(ctx, w, h, r, {
      blotches: 26,
      dark: 0.045,
      light: 0.05,
      streaks: 7,
      streak: 0.035,
      specks: 300,
      speckR: 1.1,
    });
  }
  /** Marble floor: large polished slabs, alternating veined white / grey-green border tiles. */
  function marbleFloorDraw(ctx, w, h) {
    const r = U.rng(31),
      n = 4,
      s = w / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const dark = (i + j) % 2 === 1;
        ctx.fillStyle = dark ? "#6f7a70" : "#dcd6ca";
        ctx.fillRect(i * s, j * s, s, s);
        ctx.strokeStyle = dark
          ? "rgba(220,225,215,0.35)"
          : "rgba(110,105,95,0.35)";
        ctx.lineWidth = 1.2;
        for (let v = 0; v < 4; v++) {
          let x = i * s + r() * s,
            y = j * s;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let k = 0; k < 6; k++) {
            x += (r() - 0.5) * s * 0.35;
            y += s / 6;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(40,36,30,0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(i * s, j * s, s, s);
      }
    weather(ctx, w, h, r, {
      blotches: 60,
      dark: 0.18,
      streaks: 0,
      specks: 900,
    });
  }
  /** Teletype CRT screen: dark glass, amber dot-matrix lines, scanlines (used as map + emissive map). */
  function screenDraw(ctx, w, h) {
    const r = U.rng(99);
    ctx.fillStyle = "#100802";
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, "rgba(140,90,24,0.5)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillStyle = "#ffb347";
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789>$#%=:.-";
    for (let y = 14; y < h - 6; y += 15) {
      let line = "";
      const n = 4 + Math.floor(r() * 22);
      for (let i = 0; i < n; i++)
        line += r() < 0.15 ? " " : glyphs[Math.floor(r() * glyphs.length)];
      ctx.globalAlpha = 0.55 + r() * 0.45;
      ctx.fillText(line, 8, y);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
  }
  // seamless fbm: bilinear blend of the four wrapped copies (no visible tile seam when the texture scrolls)
  function sfbm(x, y, s, w, oct) {
    const u = x / w,
      v = y / w,
      f = (a, b2) => U.fbm2(a / s, b2 / s, oct || 3);
    return (
      f(x, y) * (1 - u) * (1 - v) +
      f(x - w, y) * u * (1 - v) +
      f(x, y - w) * (1 - u) * v +
      f(x - w, y - w) * u * v
    );
  }
  /** Toxic sludge: dark murky water with thin glowing filaments and yellow scum islands (scrolled at runtime). */
  function gooDraw(ctx, w, h) {
    noiseFill(ctx, w, h, (x, y) => {
      const n = sfbm(x, y, 34, w),
        sw = sfbm(x + 97, y + 31, 15, w);
      const band = Math.abs(Math.sin((n * 5 + sw * 3) * Math.PI));
      const toxic =
        Math.pow(Math.max(0, 1 - band), 12) * Math.max(0, n - 0.35) * 2.2;
      const scum = Math.max(0, sfbm(x + 300, y + 50, 22, w) - 0.62) * 3.0;
      const g0 = (U.hash2(x, y) - 0.5) * 8;
      return [
        16 + n * 22 + toxic * 70 + scum * 95 + g0,
        24 + n * 30 + toxic * 190 + scum * 88 + g0,
        10 + n * 8 + toxic * 24 + scum * 30 + g0,
      ];
    });
  }
  /** Curtain-wall glass pane (uv 0..1 per pane): sky reflection gradient, a soft sheen band, grime at the sill. */
  function paneDraw(cracked) {
    return (ctx, w, h) => {
      const r = U.rng(cracked ? 61 : 59);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      if (cracked) {
        g.addColorStop(0, "#6a7678");
        g.addColorStop(0.5, "#3a4446");
        g.addColorStop(1, "#1c2224");
      } else {
        g.addColorStop(0, "#b4c0bc");
        g.addColorStop(0.45, "#7d8c8a");
        g.addColorStop(1, "#3c4846");
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      const s = ctx.createLinearGradient(0, h, w, 0);
      s.addColorStop(0.35, "rgba(255,255,245,0)");
      s.addColorStop(0.5, "rgba(255,255,245," + (cracked ? 0.08 : 0.2) + ")");
      s.addColorStop(0.62, "rgba(255,255,245,0)");
      ctx.fillStyle = s;
      ctx.fillRect(0, 0, w, h);
      const d = ctx.createLinearGradient(0, h * 0.7, 0, h);
      d.addColorStop(0, "rgba(70,58,40,0)");
      d.addColorStop(1, "rgba(70,58,40,0.55)");
      ctx.fillStyle = d;
      ctx.fillRect(0, h * 0.7, w, h * 0.3);
      for (let i = 0; i < 22; i++) {
        ctx.fillStyle = "rgba(60,50,36," + r() * 0.18 + ")";
        ctx.fillRect(
          r() * w,
          r() * h * 0.4,
          2 + r() * 5,
          h * (0.3 + r() * 0.7),
        );
      } // rain runs
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = "rgba(40,34,26," + r() * 0.3 + ")";
        ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
      }
      if (cracked) {
        const cx = w * (0.3 + r() * 0.4),
          cy = h * (0.3 + r() * 0.4);
        ctx.fillStyle = "#050606"; // punched-out hole
        ctx.beginPath();
        for (let k = 0; k < 9; k++) {
          const a = (k / 9) * TAU,
            rr = 14 + r() * 26;
          ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(225,235,235,0.75)";
        ctx.lineWidth = 1.4;
        for (let k = 0; k < 14; k++) {
          let a = r() * TAU,
            x = cx,
            y = cy;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let j = 0; j < 6; j++) {
            a += (r() - 0.5) * 0.5;
            const l = 12 + r() * 30;
            x += Math.cos(a) * l;
            y += Math.sin(a) * l;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        for (let k = 1; k <= 3; k++) {
          ctx.beginPath();
          ctx.arc(
            cx,
            cy,
            30 + k * 26 + r() * 10,
            r() * TAU,
            r() * TAU + 1.5 + r(),
          );
          ctx.stroke();
        }
      }
      ctx.strokeStyle = "rgba(15,18,18,0.8)";
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, w, h); // glazing gasket
    };
  }
  const CUSTOM_TEX = {
    goo: [192, 192, gooDraw],
    granite_ashlar: [
      512,
      512,
      ashlarDraw({
        base: 0x8e8a82,
        rows: 4,
        cols: 2,
        joint: 4,
        jointCol: 0x55524c,
        vary: 0.12,
        chips: 0.2,
        seed: 21,
        weather: { blotches: 70, dark: 0.18, streaks: 45 },
      }),
    ],
    screen: [256, 192, screenDraw],
    terracotta: [
      512,
      512,
      ashlarDraw({
        base: 0xe4dac2,
        rows: 8,
        cols: 3,
        joint: 3,
        jointCol: 0x9c9280,
        vary: 0.07,
        glaze: true,
        chips: 0.08,
        seed: 3,
        weather: { blotches: 55, dark: 0.1, streaks: 30 },
      }),
    ],
    buffstone: [
      512,
      512,
      ashlarDraw({
        base: 0xc8b08a,
        rows: 5,
        cols: 2,
        joint: 4,
        jointCol: 0x7a6a52,
        vary: 0.1,
        chips: 0.15,
        seed: 5,
      }),
    ],
    sandstone: [
      512,
      512,
      ashlarDraw({
        base: 0x9a6650,
        rows: 6,
        cols: 2,
        colVar: 1,
        joint: 4,
        jointCol: 0x5a4034,
        vary: 0.16,
        chips: 0.25,
        seed: 9,
        weather: { dark: 0.16 },
      }),
    ],
    limestone_fine: [
      512,
      512,
      ashlarDraw({
        base: 0xcdc3a8,
        rows: 6,
        cols: 2,
        joint: 2.5,
        jointCol: 0x8a826e,
        vary: 0.06,
        seed: 13,
      }),
    ],
    // the Met's Indiana-limestone walls: big coursed blocks, warm tone variation, rain streaks & soot blotches
    met_ashlar: [
      512,
      512,
      ashlarDraw({
        base: 0xcdc1a2,
        rows: 4,
        cols: 2,
        joint: 3,
        jointCol: 0x8a826c,
        vary: 0.08,
        chips: 0.12,
        seed: 31,
        weather: { blotches: 60, dark: 0.14, streaks: 70, streak: 0.11 },
      }),
    ],
    schist: [
      512,
      512,
      rubbleDraw({
        base: 0x6c6e66,
        mortar: 0x4a4740,
        rows: 7,
        vary: 0.2,
        seed: 17,
      }),
    ],
    stucco: [256, 256, stuccoDraw],
    marble_floor: [512, 512, marbleFloorDraw],
    glass_pane: [256, 256, paneDraw(false)],
    glass_crack: [256, 256, paneDraw(true)],
  };
  PF.customTex = function (name) {
    const d = CUSTOM_TEX[name];
    if (!d) return null;
    return PF.canvasTex("pf_c_" + name, d[0], d[1], d[2]);
  };

  // -------------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------------
  // key → { src: G.tex/G.mats surface name, custom: PF.customTex name (used when the src is missing, or always with
  //         prefer:'custom'), color (fallback), tint (material colour), rough, metal, uv: metres per tile (fallback),
  //         bump (custom-texture bump scale), emissive, noShadow }
  const MAT_DEFS = {
    granite: { src: "granite", color: 0x8d8880, rough: 0.9, uv: 5 },
    granite_dark: {
      src: "granite",
      color: 0x6c6862,
      tint: 0x8a847c,
      rough: 0.92,
      uv: 5,
    },
    limestone: {
      src: "stone_limestone",
      custom: "limestone_fine",
      color: 0xbdb39c,
      rough: 0.92,
      uv: 5,
    },
    met_ashlar: {
      custom: "met_ashlar",
      prefer: "custom",
      color: 0xc6ba9c,
      rough: 0.9,
      uv: 3.2,
      bump: 0.6,
    },
    marble: {
      src: "marble",
      color: 0xd9d4c8,
      tint: 0xf4f0e8,
      rough: 0.4,
      uv: 3,
      custom: "limestone_fine",
    },
    marble_dark: { src: "marble_dark", color: 0x3a463e, rough: 0.3, uv: 3 },
    marble_floor: {
      custom: "marble_floor",
      prefer: "custom",
      color: 0xd0cabe,
      rough: 0.35,
      uv: 4,
    },
    terracotta: {
      custom: "terracotta",
      prefer: "custom",
      color: 0xd8cfb8,
      rough: 0.7,
      uv: 3,
      bump: 0.6,
    },
    sandstone: {
      custom: "sandstone",
      prefer: "custom",
      color: 0xa0705a,
      rough: 0.95,
      uv: 3.5,
      bump: 0.8,
    },
    schist: {
      custom: "schist",
      prefer: "custom",
      color: 0x5f625c,
      rough: 0.95,
      uv: 3.5,
      bump: 1.2,
    },
    brownstone: {
      src: "stone_brownstone",
      color: 0x7a5646,
      rough: 0.95,
      uv: 4,
    },
    concrete: { src: "concrete", color: 0x8f8b82, rough: 0.95, uv: 6 },
    concrete_dark: {
      src: "concrete_dark",
      color: 0x5e5b55,
      rough: 0.95,
      uv: 6,
    },
    brick: { src: "brick_red", color: 0x7f4a3a, rough: 0.95, uv: 3 },
    brick_brown: { src: "brick_brown", color: 0x6a4a3a, rough: 0.95, uv: 3 },
    rust: { src: "rust", color: 0x6e4a32, rough: 0.85, metal: 0.35, uv: 3 },
    steel: {
      src: "metal_painted",
      color: 0x4d5048,
      tint: 0x6a6e64,
      rough: 0.7,
      metal: 0.45,
      uv: 3,
    },
    iron: {
      src: "metal_painted",
      color: 0x2f322f,
      tint: 0x3a3d39,
      rough: 0.6,
      metal: 0.55,
      uv: 2,
    },
    panel: {
      src: "metal_panel",
      color: 0x6a6a62,
      rough: 0.7,
      metal: 0.4,
      uv: 3,
    },
    corrugated: {
      src: "corrugated",
      color: 0x74705f,
      rough: 0.8,
      metal: 0.3,
      uv: 3,
    },
    planks: { src: "wood_planks", color: 0x6d5a44, rough: 0.9, uv: 3 },
    rotten: { src: "wood_rotten", color: 0x54473a, rough: 0.95, uv: 3 },
    plaster: { src: "plaster_stained", color: 0xa39c88, rough: 0.95, uv: 4 },
    dirt: { src: "dirt", color: 0x5d4f3c, rough: 1, uv: 6 },
    grass: { src: "grass_dead", color: 0x6b6a45, rough: 1, uv: 6 },
    rubble: { src: "rubble", color: 0x77716a, rough: 1, uv: 4 },
    asphalt: { src: "asphalt", color: 0x3c3b39, rough: 0.95, uv: 8 },
    sidewalk: { src: "sidewalk", color: 0x8a8680, rough: 0.95, uv: 4 },
    fabric: { src: "fabric", color: 0x7a7060, rough: 1, uv: 2 },
    tent: { src: "fabric", color: 0x4f5238, tint: 0x6a6e48, rough: 1, uv: 3 },
    sandbag: {
      src: "burlap",
      color: 0x8f7e5c,
      tint: 0xd8c8a0,
      rough: 1,
      uv: 1.2,
    },
    crate: { src: "crate_wood", color: 0x8a7050, rough: 0.9, uv: 1.2 },
    paper: { src: "paper", color: 0xd8d0b8, rough: 1, uv: 0.8, noShadow: true },
    carpet: { src: "carpet", color: 0x6a2a24, rough: 1, uv: 3 },
    terrazzo: { src: "terrazzo", color: 0xb8b0a0, rough: 0.5, uv: 3 },
    tile_floor: { src: "tile_floor", color: 0x9a9890, rough: 0.6, uv: 2 },
    wallpaper: { src: "wallpaper", color: 0x8a8a70, rough: 0.95, uv: 3 },
    diamond: {
      src: "metal_diamond",
      color: 0x707068,
      rough: 0.6,
      metal: 0.5,
      uv: 2,
    },
    screen: {
      custom: "screen",
      prefer: "custom",
      color: 0x6a4a1a,
      emissive: 0xffffff,
      emissiveIntensity: 1.1,
      emissiveMapCustom: true,
      rough: 0.3,
      uv: 1,
      noShadow: true,
    },
    stripe_red: { color: 0x9a3a30, rough: 0.95, uv: 2, plain: true },
    stripe_cream: { color: 0xd8ccae, rough: 0.95, uv: 2, plain: true },
    awning_green: {
      src: "fabric",
      color: 0x3e5a3a,
      tint: 0x4e7048,
      rough: 1,
      uv: 2,
    },
    awning_red: {
      src: "fabric",
      color: 0x8a3226,
      tint: 0xa84434,
      rough: 1,
      uv: 2,
    },
    gunmetal_dark: {
      src: "metal_panel",
      color: 0x202224,
      tint: 0x33363a,
      rough: 0.55,
      metal: 0.6,
      uv: 3,
    },
    paint_red: {
      src: "metal_painted",
      color: 0x7e2a22,
      tint: 0x9a3328,
      rough: 0.7,
      metal: 0.3,
      uv: 3,
    },
    paint_orange: {
      src: "metal_painted",
      color: 0xa85a22,
      tint: 0xc8702c,
      rough: 0.7,
      metal: 0.25,
      uv: 3,
    },
    paint_cream: {
      src: "metal_painted",
      color: 0xb8ae94,
      tint: 0xd8ceb0,
      rough: 0.7,
      metal: 0.25,
      uv: 3,
    },
    army: {
      src: "military",
      color: 0x48503a,
      tint: 0xb8c0a0,
      rough: 0.8,
      metal: 0.3,
      uv: 3,
    },
    paint_teal: {
      src: "metal_painted",
      color: 0x3e6a64,
      tint: 0x4f8a80,
      rough: 0.7,
      metal: 0.25,
      uv: 3,
    },
    chrome: { src: "chrome", color: 0x9a9a98, rough: 0.35, metal: 0.9, uv: 2 },
    glass_dark: {
      color: 0x151a18,
      rough: 0.25,
      metal: 0.6,
      uv: 2,
      plain: true,
    },
    glass_broken: {
      color: 0x07090a,
      rough: 0.9,
      metal: 0.0,
      uv: 2,
      plain: true,
    },
    // curtain-wall panes (uv 0..1 per pane — PF.glazing): reflective-looking without an env map
    pane: {
      custom: "glass_pane",
      prefer: "custom",
      color: 0x7d8c8a,
      rough: 0.15,
      metal: 0.1,
      uv: 1,
      noShadow: true,
    },
    pane_cracked: {
      custom: "glass_crack",
      prefer: "custom",
      color: 0x3a4446,
      rough: 0.3,
      metal: 0.05,
      uv: 1,
      noShadow: true,
    },
    window_lit: {
      color: 0x3a3524,
      emissive: 0xffc870,
      emissiveIntensity: 0.9,
      rough: 0.6,
      uv: 2,
      plain: true,
      noShadow: true,
    },
    lamp: {
      color: 0xfff0c8,
      emissive: 0xffe0a0,
      emissiveIntensity: 2.2,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    lamp_red: {
      color: 0xff5040,
      emissive: 0xff2a1a,
      emissiveIntensity: 2.4,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    lamp_green: {
      color: 0x70ff90,
      emissive: 0x30ff60,
      emissiveIntensity: 2.0,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    fire: {
      color: 0xffa040,
      emissive: 0xff7a20,
      emissiveIntensity: 3.0,
      rough: 1,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    // gilded torch flame: moderately metallic (there is no scene env map — full metal reads brown), emissive driven by the hour in 10_liberty
    gold: {
      color: 0xe0ac44,
      emissive: 0xff9a2a,
      emissiveIntensity: 0.9,
      rough: 0.3,
      metal: 0.45,
      uv: 2,
      plain: true,
    },
    gilt: { color: 0xa88638, rough: 0.4, metal: 0.8, uv: 2, plain: true },
    bronze: {
      src: "bronze",
      color: 0x4a3c2a,
      rough: 0.55,
      metal: 0.6,
      uv: 2,
      custom: "verdigris",
      tint: 0x7a6440,
    },
    verdigris: {
      color: 0x6aa892,
      rough: 0.75,
      metal: 0.25,
      uv: 6,
      custom: "verdigris",
    },
    copper_roof: {
      color: 0x5f9884,
      rough: 0.8,
      metal: 0.2,
      uv: 4,
      custom: "verdigris",
      tint: 0xb8d8cc,
    },
    water: {
      color: 0x2a3a22,
      rough: 0.12,
      metal: 0.3,
      uv: 8,
      plain: true,
      emissive: 0x1a3a10,
      emissiveIntensity: 0.35,
      noShadow: true,
    },
    goo: {
      custom: "goo",
      prefer: "custom",
      color: 0x4a7a20,
      tint: 0xd8e8c8,
      emissive: 0x7aff40,
      emissiveIntensity: 0.55,
      emissiveMapCustom: true,
      rough: 0.18,
      metal: 0.2,
      uv: 7,
      noShadow: true,
    },
    granite_block: {
      custom: "granite_ashlar",
      prefer: "custom",
      color: 0x8a867e,
      rough: 0.92,
      uv: 3.2,
      bump: 0.9,
    },
    bronze_patina: {
      color: 0x5f7a66,
      rough: 0.55,
      metal: 0.3,
      uv: 2,
      custom: "verdigris",
      tint: 0x86a08c,
    },
    rock: { color: 0x8a867c, rough: 1, uv: 3, forceFallback: true },
    buffstone: {
      custom: "buffstone",
      prefer: "custom",
      color: 0xb8a282,
      rough: 0.9,
      uv: 4,
      bump: 0.7,
    },
    stucco: {
      custom: "stucco",
      prefer: "custom",
      color: 0xefe8d6,
      rough: 0.85,
      uv: 6,
    },
    bark: { src: "bark", color: 0x3e342a, tint: 0x8a7a6a, rough: 1, uv: 2 },
    bone: { src: "bone", color: 0xcfc6ae, rough: 0.8, uv: 1 },
    tire: { src: "rubber", color: 0x1a1a1a, rough: 0.95, uv: 1 },
  };
  /** Base key without the '@lit' (baked-light) suffix. */
  const baseKey = (k) =>
    k.length > 4 && k.slice(-4) === "@lit" ? k.slice(0, -4) : k;
  PF.baseKey = baseKey;
  PF.MAT_DEFS = MAT_DEFS;
  const matCache = {};
  const NO_SHADOW = new Set();
  /**
   * Shared material for a key. Keys may be MAT_DEFS names, or 'tex:<cacheKey>' for
   * one-off textured quads (registered with PF.texMat).
   */
  const texInfoMeters = {};
  /** World metres per texture tile for a MAT_DEFS key (textures module's own scale when we use its surface). */
  function metersFor(key) {
    const def = MAT_DEFS[key];
    if (!def) return 4;
    if (texInfoMeters[key] !== undefined) return texInfoMeters[key];
    let m = def.uv || 4;
    const mat = PF.mat(key);
    if (mat && mat.userData.lbSrc && def.src) {
      try {
        const inf = G.tex.info(def.src);
        if (inf && inf.meters) m = inf.meters;
      } catch (e) {
        /* keep default */
      }
    }
    texInfoMeters[key] = m;
    return m;
  }
  /**
   * Material for a key. Keys: MAT_DEFS names, 'tex:<k>' (PF.texMat), 'brand:<id>' (PF.brandMat), each optionally
   * suffixed '@lit' → a clone that adds the per-vertex baked light (attribute `bake`) as emission (fake interior GI).
   */
  PF.mat = function (key) {
    if (matCache[key]) return matCache[key];
    if (baseKey(key) !== key)
      return (matCache[key] = makeBakedVariant(PF.mat(baseKey(key)), key));
    if (key.indexOf("tex:") === 0 || key.indexOf("brand:") === 0)
      return matCache[key] || PF.mat("concrete");
    const def = MAT_DEFS[key] || { color: 0x808080, rough: 0.9, uv: 4 };
    let m = null;
    const haveMats =
      !G.isStub("mats") && G.mats && typeof G.mats.get === "function";
    const haveSrc =
      def.src &&
      haveMats &&
      !def.forceFallback &&
      (() => {
        try {
          return !G.tex.has || G.tex.has(def.src);
        } catch (e) {
          return false;
        }
      })();
    if (haveSrc && def.prefer !== "custom") {
      try {
        // Shared, cached material from the textures module (keeps its anti-tiling macro variation).
        const o = { vertexColors: true };
        if (def.tint !== undefined) o.color = def.tint;
        if (def.metal !== undefined) o.metalness = def.metal;
        const base = G.mats.get(def.src, o);
        if (base && base.isMaterial) {
          m = base;
          m.userData.lbSrc = def.src;
        }
      } catch (e) {
        m = null;
      }
    }
    if (!m) {
      const opts = {
        color: def.color,
        roughness: def.rough === undefined ? 0.9 : def.rough,
        metalness: def.metal || 0,
        vertexColors: true,
      };
      const ct =
        def.custom && def.custom !== "verdigris"
          ? PF.customTex(def.custom)
          : null;
      if (def.custom === "verdigris") {
        opts.map = PF.verdigrisTex();
        opts.color = def.tint !== undefined ? def.tint : 0xffffff;
      } else if (ct) {
        opts.map = ct;
        opts.color = def.tint !== undefined ? def.tint : 0xffffff;
        if (def.bump) {
          opts.bumpMap = ct;
          opts.bumpScale = def.bump;
        }
      } else if (!def.plain)
        opts.map =
          def.src === "metal_painted" ||
          def.src === "rust" ||
          def.src === "metal_panel"
            ? PF.grimeTex()
            : PF.noiseTex();
      if (def.emissive !== undefined) {
        opts.emissive = def.emissive;
        opts.emissiveIntensity = def.emissiveIntensity || 1;
        if (def.emissiveMapCustom && ct) opts.emissiveMap = ct;
      }
      m = new THREE.MeshStandardMaterial(opts);
      m.userData.shared = true;
    }
    m.userData.lbKey = m.userData.lbKey || key;
    if (def.noShadow) NO_SHADOW.add(key);
    return (matCache[key] = m);
  };
  /** Clone a material and add `albedo * bake` (per-vertex baked lamp light) to its emission. */
  function makeBakedVariant(base, key) {
    const m = base.clone();
    m.vertexColors = true;
    m.userData = Object.assign({}, base.userData, {
      shared: true,
      lbKey: key,
      lbBaked: true,
    });
    m.onBeforeCompile = function (sh) {
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec3 bake;\nvarying vec3 vLbBake;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvLbBake = bake;",
        );
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vLbBake;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vLbBake * 1.6;",
        );
    };
    m.customProgramCacheKey = () => "pf_baked_v2";
    m.needsUpdate = true;
    return m;
  }
  /** Register a textured material (signs, flags, banners). Returns the key to use with batch/quad. */
  PF.texMat = function (key, tex, opts) {
    opts = opts || {};
    const k = "tex:" + key;
    if (!matCache[k]) {
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: opts.rough === undefined ? 0.85 : opts.rough,
        metalness: opts.metal || 0,
        side: opts.side || THREE.FrontSide,
        vertexColors: !!opts.vc,
      });
      if (opts.emissive) {
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveMap = tex;
        m.emissiveIntensity = opts.emissive;
      }
      if (opts.transparent) {
        m.transparent = true;
        m.alphaTest = 0.4;
      }
      if (opts.color !== undefined) m.color = new THREE.Color(opts.color);
      m.userData.shared = true;
      m.userData.uv = 1;
      m.userData.keepUV = true;
      matCache[k] = m;
      if (opts.noShadow) NO_SHADOW.add(k);
    }
    return k;
  };
  /** Use a billboard/brand material from G.mats if available (brand billboards). */
  PF.brandMat = function (brand) {
    const k = "brand:" + brand;
    if (matCache[k]) return k;
    let m = null;
    try {
      if (!G.isStub("mats") && G.mats.billboard)
        m = G.mats.billboard(brand, 0, { lit: true });
    } catch (e) {
      m = null;
    }
    if (!m || !m.isMaterial) {
      const t = PF.signTex(
        "brand_" + brand,
        [brand.replace(/_/g, " ").toUpperCase()],
        "enamel",
        512,
        256,
        { bg: "#7a2520" },
      );
      m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 });
    }
    m.userData = m.userData || {};
    m.userData.shared = true;
    m.userData.keepUV = true;
    matCache[k] = m;
    NO_SHADOW.add(k);
    return k;
  };

  // -------------------------------------------------------------------
  // Batch: collect geometry per material, bake UV + vertex colour, merge.
  // -------------------------------------------------------------------
  const _n = new THREE.Vector3(),
    _nm = new THREE.Matrix3();
  function Batch(name) {
    this.name = name;
    this.parts = new Map();
    this.M = null; // optional frame matrix (local → world)
    this.ground = 0; // AO reference height
    this.aoH = 3.0; // AO fade height
    this.grime = 0.55; // default grime strength
    this.tris = 0;
    this.lights = null; // baked interior lights [{p:Vector3, c:Color, r, i}] → '@lit' materials
    this.ambient = null; // baked ambient (THREE.Color) added everywhere in a lit batch
  }
  Batch.prototype.frame = function (m) {
    this.M = m || null;
    return this;
  };
  /**
   * Fake interior lighting: every geometry added afterwards gets a per-vertex `bake` colour
   * (sum of point lights with smooth falloff & wrap-lambert) that its '@lit' material adds as
   * emission — interiors read as lamp-lit instead of black under the sun's shadow map.
   * lights: [{x,y,z, color hex, r (radius), i (intensity)}], ambient: hex scaled by ambI.
   */
  Batch.prototype.setLights = function (lights, ambient, ambI) {
    this.lights = (lights || []).map((l) => ({
      p: new THREE.Vector3(l.x, l.y, l.z),
      c: new THREE.Color(l.color === undefined ? 0xffd8a0 : l.color),
      r: l.r || 12,
      i: l.i === undefined ? 1 : l.i,
    }));
    this.ambient =
      ambient === undefined
        ? null
        : new THREE.Color(ambient).multiplyScalar(
            ambI === undefined ? 1 : ambI,
          );
    return this;
  };
  /** Add a baked light to an already-lit batch (e.g. a lamp placed while dressing). */
  Batch.prototype.addLight = function (x, y, z, color, r, i) {
    if (!this.lights) this.lights = [];
    this.lights.push({
      p: new THREE.Vector3(x, y, z),
      c: new THREE.Color(color === undefined ? 0xffd8a0 : color),
      r: r || 10,
      i: i === undefined ? 1 : i,
    });
  };
  /**
   * Add a geometry (consumed). opts: {m: Matrix4 local transform, c: tint hex, grime, ground, aoH,
   * uv: 'box' (default, world triplanar) | 'keep', us, vs (keep-mode scale), uvRect [u0,v0,u1,v1] (keep-mode
   * sub-rectangle, e.g. one painting of an atlas), noAO, uvScale}
   * Geometries may carry a float attribute `aoMul` (per-vertex cavity occlusion) which is folded into the
   * vertex colour and then removed.
   */
  Batch.prototype.add = function (key, geom, opts) {
    opts = opts || {};
    let g = geom;
    if (g.index) g = g.toNonIndexed(); // per-face attributes for crisp projection
    if (opts.m) g.applyMatrix4(opts.m);
    if (this.M) g.applyMatrix4(this.M);
    if (!g.attributes.normal) g.computeVertexNormals();
    const mat = PF.matMeta(key);
    shadeGeometry(g, opts, this, mat);
    if (this.lights || this.ambient) {
      bakeLights(g, this);
      if (!emissiveKey(key)) key = key + "@lit";
    }
    let arr = this.parts.get(key);
    if (!arr) {
      arr = [];
      this.parts.set(key, arr);
    }
    arr.push(g);
    this.tris += g.attributes.position.count / 3;
    return g;
  };
  function emissiveKey(key) {
    const d = MAT_DEFS[key];
    return !!(d && d.emissive !== undefined);
  }
  PF.matMeta = function (key) {
    key = baseKey(key);
    if (key.indexOf("tex:") === 0 || key.indexOf("brand:") === 0)
      return { uv: 1, keep: true };
    return { uv: MAT_DEFS[key] ? metersFor(key) : 4, keep: false };
  };
  const _bl = new THREE.Vector3();
  function bakeLights(g, batch) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    const out = new Float32Array(cnt * 3);
    const amb = batch.ambient,
      L = batch.lights || [];
    for (let i = 0; i < cnt; i++) {
      let r = amb ? amb.r : 0,
        gg = amb ? amb.g : 0,
        b = amb ? amb.b : 0;
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i),
        nx = n.getX(i),
        ny = n.getY(i),
        nz = n.getZ(i);
      for (let k = 0; k < L.length; k++) {
        const l = L[k];
        const dx = l.p.x - x,
          dy = l.p.y - y,
          dz = l.p.z - z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > l.r * l.r) continue;
        const d = Math.sqrt(d2) || 1e-3;
        const f = 1 - d / l.r,
          att = f * f * l.i;
        const ndl = (nx * dx + ny * dy + nz * dz) / d;
        const w = att * (0.25 + 0.75 * Math.max(0, ndl));
        r += l.c.r * w;
        gg += l.c.g * w;
        b += l.c.b * w;
      }
      out[i * 3] = Math.min(1.6, r);
      out[i * 3 + 1] = Math.min(1.6, gg);
      out[i * 3 + 2] = Math.min(1.6, b);
    }
    g.setAttribute("bake", new THREE.BufferAttribute(out, 3));
    void _bl;
  }
  function segs(v, len, cap) {
    return Math.max(1, Math.min(cap || 8, Math.ceil(v / len)));
  }
  /** Box by bottom-centre: (cx, y0, cz) size w(x) h(y) d(z). opts.ry/rx/rz rotate about box centre. */
  Batch.prototype.box = function (key, cx, y0, cz, w, h, d, opts) {
    opts = opts || {};
    const sl = opts.segLen || 5;
    const geo = new THREE.BoxGeometry(
      w,
      h,
      d,
      opts.seg === false ? 1 : segs(w, sl),
      opts.seg === false ? 1 : segs(h, sl),
      opts.seg === false ? 1 : segs(d, sl),
    );
    const m = PF.m4(cx, y0 + h / 2, cz, opts.ry, opts.rx, opts.rz);
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Box from min/max corners (axis aligned). */
  Batch.prototype.boxMM = function (key, x0, y0, z0, x1, y1, z1, opts) {
    return this.box(
      key,
      (x0 + x1) / 2,
      y0,
      (z0 + z1) / 2,
      Math.abs(x1 - x0),
      y1 - y0,
      Math.abs(z1 - z0),
      opts,
    );
  };
  /** Cylinder by bottom centre. */
  Batch.prototype.cyl = function (key, x, y0, z, rTop, rBot, h, seg, opts) {
    opts = opts || {};
    const geo = new THREE.CylinderGeometry(
      rTop,
      rBot,
      h,
      seg || 12,
      opts.hSeg || segs(h, 5),
      !!opts.open,
      opts.thetaStart || 0,
      opts.thetaLen || TAU,
    );
    const m = PF.m4(
      x,
      y0 + h / 2,
      z,
      opts.ry,
      opts.rx,
      opts.rz,
      opts.sx,
      1,
      opts.sz === undefined ? opts.sx : opts.sz,
    );
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Cylinder between two points. */
  Batch.prototype.rod = function (key, a, b, r, seg, opts) {
    opts = opts || {};
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    if (len < 1e-4) return null;
    const geo = new THREE.CylinderGeometry(
      opts.r2 === undefined ? r : opts.r2,
      r,
      len,
      seg || 6,
      1,
      !!opts.open,
    );
    geo.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    const m = new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1));
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Thin square beam between two points (cheaper than rod: 12 tris). */
  Batch.prototype.beam = function (key, a, b, w, h, opts) {
    opts = opts || {};
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    if (len < 1e-4) return null;
    const geo = new THREE.BoxGeometry(w, len, h === undefined ? w : h);
    geo.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    if (opts.twist)
      q.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          opts.twist,
        ),
      );
    const m = new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1));
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  Batch.prototype.sphere = function (key, x, y, z, r, opts) {
    opts = opts || {};
    const geo = new THREE.SphereGeometry(
      r,
      opts.ws || 12,
      opts.hs || 8,
      0,
      TAU,
      opts.phiStart || 0,
      opts.phiLen || Math.PI,
    );
    if (opts.deform) deform(geo, opts.deform);
    const m = PF.m4(
      x,
      y,
      z,
      opts.ry,
      opts.rx,
      opts.rz,
      opts.sx || 1,
      opts.sy || opts.sx || 1,
      opts.sz || opts.sx || 1,
    );
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Lathe from [[r,y],...] profile. */
  Batch.prototype.lathe = function (key, prof, seg, x, y, z, opts) {
    opts = opts || {};
    const pts = prof.map(
      (p) => new THREE.Vector2(Math.max(0.0001, p[0]), p[1]),
    );
    const geo = new THREE.LatheGeometry(
      pts,
      seg || 16,
      opts.phiStart || 0,
      opts.phiLen || TAU,
    );
    if (opts.deform) deform(geo, opts.deform);
    const m = PF.m4(
      x,
      y,
      z,
      opts.ry,
      opts.rx,
      opts.rz,
      opts.sx || 1,
      opts.sy || 1,
      opts.sz || opts.sx || 1,
    );
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Extrude a THREE.Shape (in XY) by depth along +Z; opts.m places it. */
  Batch.prototype.extrude = function (key, shape, depth, opts) {
    opts = opts || {};
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: !!opts.bevel,
      bevelSize: opts.bevel || 0,
      bevelThickness: opts.bevel || 0,
      bevelSegments: 1,
      curveSegments: opts.curveSegments || 8,
    });
    return this.add(key, geo, opts);
  };
  /** Single textured quad (uv kept 0..1). (x,y,z) = centre; faces direction ry (0 → +Z). */
  Batch.prototype.quad = function (key, x, y, z, w, h, opts) {
    opts = opts || {};
    const geo = new THREE.PlaneGeometry(w, h, opts.wSeg || 1, opts.hSeg || 1);
    const m = PF.m4(x, y, z, opts.ry, opts.rx, opts.rz);
    if (opts.m) m.premultiply(opts.m);
    return this.add(
      key,
      geo,
      Object.assign({ uv: "keep", grime: 0.15 }, opts, { m }),
    );
  };
  Batch.prototype.geo = function (key, geo, m, opts) {
    return this.add(key, geo, Object.assign({}, opts || {}, { m }));
  };
  /** Irregular rock / rubble chunk (displaced icosahedron). */
  Batch.prototype.rock = function (key, x, y, z, r, opts) {
    opts = opts || {};
    const geo = new THREE.IcosahedronGeometry(
      r,
      opts.detail === undefined ? 1 : opts.detail,
    );
    const p = geo.attributes.position,
      seed = opts.seed || x * 13.1 + z * 7.7;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i),
        vy = p.getY(i),
        vz = p.getZ(i);
      const n =
        U.fbm2(
          ((vx * 0.6) / r) * 2 + seed,
          ((vz * 0.6) / r) * 2 + (vy * 0.5) / r,
        ) - 0.5;
      const k = 1 + n * (opts.rough === undefined ? 0.55 : opts.rough);
      p.setXYZ(i, vx * k, vy * k * (opts.flat || 1), vz * k);
    }
    geo.computeVertexNormals();
    const m = PF.m4(
      x,
      y,
      z,
      opts.ry || seed % 6,
      0,
      0,
      opts.sx || 1,
      opts.sy || 1,
      opts.sz || 1,
    );
    return this.add(key, geo, Object.assign({ grime: 0.4 }, opts, { m }));
  };
  function deform(geo, fn) {
    const p = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.set(p.getX(i), p.getY(i), p.getZ(i));
      fn(v, i);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    PF.weldNormals(geo); // seam-safe smooth normals (lathe/sphere wrap columns are duplicated vertices)
  }
  PF.deform = deform;

  /** Turn the collected parts into merged meshes under parent. */
  Batch.prototype.build = function (parent, opts) {
    opts = opts || {};
    const group = new THREE.Group();
    group.name = "pf_" + this.name;
    for (const [key, arr] of this.parts) {
      if (!arr.length) continue;
      // split into chunks of ≤ 400k verts to keep buffers sane
      let chunk = [],
        count = 0;
      const flush = () => {
        if (!chunk.length) return;
        const geo = mergeAll(chunk);
        for (const g of chunk) g.dispose();
        const mat = PF.mat(key);
        const bk = baseKey(key);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = this.name + ":" + key;
        const ns = NO_SHADOW.has(bk) || opts.noShadow;
        mesh.castShadow = !ns && opts.castShadow !== false;
        mesh.receiveShadow = opts.receiveShadow !== false;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        if (SMALL_NO_SHADOW.has(bk)) mesh.castShadow = false;
        group.add(mesh);
        // distance culling (draw-call budget):
        //  • small-detail materials (railings, bones, tyres, fabric, sandbags...) beyond ~190 m
        //  • interiors (baked-light batches) beyond ~75 m + their radius — they are enclosed anyway
        //  • any other small merged mesh (few triangles, compact) beyond ~240 m, except emissive landmarks
        //    (lamps, the gilded torch flame, lit windows) which must still read across the harbour
        if (!opts.noLOD) {
          try {
            if (!geo.boundingSphere) geo.computeBoundingSphere();
            const bs = geo.boundingSphere,
              triN = geo.attributes.position.count / 3;
            let d = 0;
            if (DETAIL_LOD.has(bk) || opts.lodAll)
              d = (opts.lodDist || 190) + bs.radius;
            else if (this.lights || this.ambient)
              d = (opts.lodDistInt || 75) + bs.radius;
            else if (triN < 1500 && bs.radius < 40 && !emissiveKey(bk))
              d = 240 + bs.radius;
            if (d > 0) G.world.addLOD(mesh, d, bs.center.clone());
          } catch (e) {
            /* core missing */
          }
        }
        chunk = [];
        count = 0;
      };
      for (const g of arr) {
        chunk.push(g);
        count += g.attributes.position.count;
        if (count > 400000) flush();
      }
      flush();
    }
    this.parts.clear();
    if (parent) parent.add(group);
    return group;
  };
  /**
   * Merge non-indexed geometries into one (non-indexed) geometry keeping EVERY attribute they all share
   * (position, normal, uv, color and our custom `bake`) — core's merger only keeps the standard four.
   */
  function mergeAll(geoms) {
    geoms = geoms.filter(Boolean);
    const names = Object.keys(geoms[0].attributes).filter((n) =>
      geoms.every(
        (g) =>
          g.attributes[n] &&
          g.attributes[n].itemSize === geoms[0].attributes[n].itemSize,
      ),
    );
    let count = 0;
    for (const g of geoms) count += g.attributes.position.count;
    const out = new THREE.BufferGeometry();
    for (const n of names) {
      const size = geoms[0].attributes[n].itemSize,
        arr = new Float32Array(count * size);
      let o = 0;
      for (const g of geoms) {
        const src = g.attributes[n].array;
        if (src.length === g.attributes.position.count * size) arr.set(src, o);
        o += g.attributes.position.count * size;
      }
      out.setAttribute(n, new THREE.BufferAttribute(arr, size));
    }
    out.computeBoundingSphere();
    out.computeBoundingBox();
    return out;
  }
  PF.mergeAll = mergeAll;
  PF.batch = (name) => new Batch(name);
  const DETAIL_LOD = new Set([
    "bone",
    "tire",
    "chrome",
    "fabric",
    "sandbag",
    "iron",
    "gilt",
    "fire",
    "lamp_red",
    "lamp_green",
    "bark",
    "paint_cream",
    "crate",
    "paper",
    "screen",
    "stripe_red",
    "stripe_cream",
    "awning_green",
    "awning_red",
    "carpet",
  ]);
  const SMALL_NO_SHADOW = new Set([
    "bone",
    "tire",
    "chrome",
    "glass_dark",
    "glass_broken",
    "pane",
    "pane_cracked",
    "gilt",
    "goo",
    "paper",
    "screen",
    "crate",
  ]);

  // -------------------------------------------------------------------
  // UV projection + vertex-colour AO / grime
  // -------------------------------------------------------------------
  const GRIME = new THREE.Color(0x2a2218);
  function shadeGeometry(g, opts, batch, meta) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    // --- UVs ---
    let uv = g.attributes.uv;
    const mode = opts.uv || (meta.keep ? "keep" : "box");
    if (mode === "box") {
      const s = 1 / (opts.uvScale || meta.uv || 4);
      const arr = new Float32Array(cnt * 2);
      for (let i = 0; i < cnt; i++) {
        const nx = Math.abs(n.getX(i)),
          ny = Math.abs(n.getY(i)),
          nz = Math.abs(n.getZ(i));
        const x = p.getX(i),
          y = p.getY(i),
          z = p.getZ(i);
        let u, v;
        if (ny >= nx && ny >= nz) {
          u = x;
          v = z;
        } else if (nx >= nz) {
          u = z;
          v = y;
        } else {
          u = x;
          v = y;
        }
        arr[i * 2] = u * s;
        arr[i * 2 + 1] = v * s;
      }
      g.setAttribute("uv", new THREE.BufferAttribute(arr, 2));
    } else if (mode === "keep") {
      if (!uv) {
        g.setAttribute(
          "uv",
          new THREE.BufferAttribute(new Float32Array(cnt * 2), 2),
        );
      } else if (opts.uvRect) {
        const R = opts.uvRect;
        for (let i = 0; i < cnt; i++)
          uv.setXY(
            i,
            R[0] + uv.getX(i) * (R[2] - R[0]),
            R[1] + uv.getY(i) * (R[3] - R[1]),
          );
      } else if (opts.us || opts.vs) {
        for (let i = 0; i < cnt; i++)
          uv.setXY(i, uv.getX(i) * (opts.us || 1), uv.getY(i) * (opts.vs || 1));
      }
    }
    const aoMul = g.attributes.aoMul || null;
    // --- vertex colours ---
    const col = new Float32Array(cnt * 3);
    const tint = new THREE.Color(opts.c === undefined ? 0xffffff : opts.c);
    const grime = opts.grime === undefined ? batch.grime : opts.grime;
    const ground = opts.ground === undefined ? batch.ground : opts.ground;
    const aoH = opts.aoH || batch.aoH;
    const noAO = !!opts.noAO;
    for (let i = 0; i < cnt; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      let k = aoMul ? aoMul.getX(i) : 1;
      if (!noAO) {
        const hgt = y - ground;
        k *= 0.58 + 0.42 * PF.smooth(-0.2, aoH, hgt);
      }
      let gr = 0;
      if (grime > 0) {
        const blot = U.fbm2(x * 0.11 + z * 0.05 + 3.1, y * 0.13 + z * 0.09, 3);
        const streak = U.noise2((x + z) * 0.9, y * 0.02 + 7.3); // vertical streaking
        gr =
          grime *
          (Math.max(0, blot - 0.42) * 1.3 + Math.max(0, streak - 0.55) * 0.9);
        if (n.getY(i) > 0.7) gr += grime * 0.25; // dust on horizontal surfaces
        gr = Math.min(0.85, gr);
        k *=
          0.9 +
          0.2 * U.hash2(Math.floor(x * 2.3), Math.floor(z * 2.3 + y * 1.7));
      }
      const r = tint.r * k,
        gg = tint.g * k,
        b = tint.b * k;
      col[i * 3] = r * (1 - gr) + GRIME.r * gr * k;
      col[i * 3 + 1] = gg * (1 - gr) + GRIME.g * gr * k;
      col[i * 3 + 2] = b * (1 - gr) + GRIME.b * gr * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    if (aoMul) g.deleteAttribute("aoMul");
  }

  // -------------------------------------------------------------------
  // Organic surfaces (statues): parametric grids with welded normals
  // -------------------------------------------------------------------
  /**
   * Smooth normals across duplicated seam vertices (lathe/sphere/grid wrap seams) by accumulating
   * area-weighted face normals per rounded position. Works on indexed or non-indexed geometry.
   */
  PF.weldNormals = function (geo) {
    const p = geo.attributes.position,
      idx = geo.index,
      cnt = p.count;
    // numeric spatial hash of the rounded position (2 mm grid) → accumulator slot
    const slot = new Int32Array(cnt),
      acc = [];
    const map = new Map();
    for (let i = 0; i < cnt; i++) {
      const xi = Math.round(p.getX(i) * 500),
        yi = Math.round(p.getY(i) * 500),
        zi = Math.round(p.getZ(i) * 500);
      const k = (xi * 73856093) ^ (yi * 19349663) ^ (zi * 83492791);
      let s = map.get(k);
      if (s === undefined) {
        s = acc.length / 3;
        acc.push(0, 0, 0);
        map.set(k, s);
      }
      slot[i] = s;
    }
    const P = p.array,
      triCount = idx ? idx.count / 3 : cnt / 3,
      I = idx ? idx.array : null;
    for (let t = 0; t < triCount; t++) {
      const i0 = I ? I[t * 3] : t * 3,
        i1 = I ? I[t * 3 + 1] : t * 3 + 1,
        i2 = I ? I[t * 3 + 2] : t * 3 + 2;
      const ax = P[i0 * 3],
        ay = P[i0 * 3 + 1],
        az = P[i0 * 3 + 2];
      const e1x = P[i1 * 3] - ax,
        e1y = P[i1 * 3 + 1] - ay,
        e1z = P[i1 * 3 + 2] - az;
      const e2x = P[i2 * 3] - ax,
        e2y = P[i2 * 3 + 1] - ay,
        e2z = P[i2 * 3 + 2] - az;
      const nx = e1y * e2z - e1z * e2y,
        ny = e1z * e2x - e1x * e2z,
        nz = e1x * e2y - e1y * e2x;
      for (const i of [i0, i1, i2]) {
        const s = slot[i] * 3;
        acc[s] += nx;
        acc[s + 1] += ny;
        acc[s + 2] += nz;
      }
    }
    const nrm = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) {
      const s = slot[i] * 3;
      const l = Math.hypot(acc[s], acc[s + 1], acc[s + 2]) || 1;
      nrm[i * 3] = acc[s] / l;
      nrm[i * 3 + 1] = acc[s + 1] / l;
      nrm[i * 3 + 2] = acc[s + 2] / l;
    }
    geo.setAttribute("normal", new THREE.BufferAttribute(nrm, 3));
    return geo;
  };
  /**
   * Parametric surface grid: fn(u, v, out:Vector3) → optional ao (0..1) return value.
   * u ∈ [0,1] across nu columns (wrap: column nu == column 0 → seamless normals), v ∈ [0,1] over nv rows.
   * UV = (u*us, v*vs) — choose integer us for a seamless texture wrap. Returns an indexed BufferGeometry
   * (with an `aoMul` attribute when fn returns numbers).
   */
  PF.surface = function (fn, nu, nv, opts) {
    opts = opts || {};
    const pos = new Float32Array((nu + 1) * (nv + 1) * 3),
      uvs = new Float32Array((nu + 1) * (nv + 1) * 2),
      ao = new Float32Array((nu + 1) * (nv + 1));
    const v3 = new THREE.Vector3();
    let anyAO = false;
    for (let j = 0; j <= nv; j++)
      for (let i = 0; i <= nu; i++) {
        const k = j * (nu + 1) + i,
          u = i / nu,
          v = j / nv;
        const r = fn(opts.wrap && i === nu ? 0 : u, v, v3.set(0, 0, 0));
        pos[k * 3] = v3.x;
        pos[k * 3 + 1] = v3.y;
        pos[k * 3 + 2] = v3.z;
        uvs[k * 2] = u * (opts.us || 1);
        uvs[k * 2 + 1] = v * (opts.vs || 1);
        ao[k] = typeof r === "number" ? ((anyAO = true), r) : 1;
      }
    const index = [];
    for (let j = 0; j < nv; j++)
      for (let i = 0; i < nu; i++) {
        const a = j * (nu + 1) + i,
          b = a + 1,
          c = a + nu + 1,
          d = c + 1;
        // default winding: normal = du × dv (outward for "u around (+z→+x), v up / along" parametrisations)
        if (opts.flip) index.push(a, c, b, b, c, d);
        else index.push(a, b, c, b, d, c);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    if (anyAO) g.setAttribute("aoMul", new THREE.BufferAttribute(ao, 1));
    g.setIndex(index);
    g.computeVertexNormals();
    if (opts.wrap) {
      // average the duplicated seam column (u=0 and u=1) so the wrap is invisible
      const n = g.attributes.normal;
      for (let j = 0; j <= nv; j++) {
        const a = j * (nu + 1),
          c = a + nu;
        const x = n.getX(a) + n.getX(c),
          y = n.getY(a) + n.getY(c),
          z = n.getZ(a) + n.getZ(c),
          l = Math.hypot(x, y, z) || 1;
        n.setXYZ(a, x / l, y / l, z / l);
        n.setXYZ(c, x / l, y / l, z / l);
      }
    }
    return g;
  };
  /**
   * Organic tube along a Catmull-Rom path with radius profile rad(t) (t 0..1) and an optional per-vertex
   * displacement disp(t, a) (a = angle around, returns radial offset in metres). Caps optional.
   * UV: u around (us repeats), v along (length / vScale).
   */
  PF.organicTube = function (points, rad, opts) {
    opts = opts || {};
    const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
    const nu = opts.radial || 12,
      nv = opts.seg || 16;
    const frames = curve.computeFrenetFrames(nv, false);
    const len = curve.getLength();
    const rowP = [];
    for (let j = 0; j <= nv; j++) rowP.push(curve.getPointAt(j / nv));
    const g = PF.surface(
      (u, v, out) => {
        const j = Math.round(v * nv),
          a = u * TAU;
        const P = rowP[j],
          N = frames.normals[j],
          B = frames.binormals[j];
        let r = rad(v, a);
        if (opts.disp) r += opts.disp(v, a);
        const ca = Math.cos(a),
          sa = Math.sin(a);
        out.set(
          P.x + (N.x * ca + B.x * sa) * r,
          P.y + (N.y * ca + B.y * sa) * r,
          P.z + (N.z * ca + B.z * sa) * r,
        );
        return opts.ao ? opts.ao(v, a) : undefined;
      },
      nu,
      nv,
      {
        wrap: true,
        flip: !!opts.flip,
        us: opts.us || 1,
        vs: Math.max(1, Math.round(len / (opts.vScale || 4))),
      },
    );
    return g;
  };

  // -------------------------------------------------------------------
  // Colliders (convention auto-detected against core's implementation)
  // -------------------------------------------------------------------
  let YAW_SIGN = null;
  function detectYawSign() {
    if (YAW_SIGN !== null) return YAW_SIGN;
    YAW_SIGN = -1; // core (v0.1) uses the opposite rotation sense to THREE's rotation.y
    try {
      const W = G.world;
      const a = 0.5;
      const probe = {
        cx: 0,
        cz: 0,
        hx: 1,
        hz: 0.05,
        cos: Math.cos(-a),
        sin: Math.sin(-a),
      };
      // point on THREE-rotated local +X axis at distance 0.9
      const px = Math.cos(a) * 0.9,
        pz = -Math.sin(a) * 0.9;
      const inPos = W.pointInCollider(probe, px, pz, 0);
      probe.cos = Math.cos(a);
      probe.sin = Math.sin(a);
      const inNeg = W.pointInCollider(probe, px, pz, 0);
      if (inPos && !inNeg) YAW_SIGN = 1;
      else if (inNeg && !inPos) YAW_SIGN = -1;
    } catch (e) {
      /* keep default */
    }
    return YAW_SIGN;
  }
  PF.colliders = [];
  /**
   * Box collider centred (cx,cz), size w (local X) × d (local Z), y0..y1, rotated like THREE rotation.y = ry.
   * opts: {surface, walkable, tag}
   */
  PF.col = function (cx, cz, w, d, y0, y1, ry, opts) {
    opts = opts || {};
    const yaw = (ry || 0) * detectYawSign();
    try {
      const c = G.world.addCollider(cx, cz, w, d, y0, y1, yaw, {
        tag: opts.tag || "landmark",
        walkable: opts.walkable !== false,
        surface: opts.surface || "concrete",
      });
      PF.colliders.push(c);
      return c;
    } catch (e) {
      return null;
    }
  };
  PF.colMM = (x0, y0, z0, x1, y1, z1, opts) =>
    PF.col(
      (x0 + x1) / 2,
      (z0 + z1) / 2,
      Math.abs(x1 - x0),
      Math.abs(z1 - z0),
      y0,
      y1,
      0,
      opts,
    );
  /** Wall collider between two XZ points (thickness t). */
  PF.colWall = function (x0, z0, x1, z1, t, y0, y1, opts) {
    const dx = x1 - x0,
      dz = z1 - z0,
      len = Math.hypot(dx, dz);
    if (len < 0.01) return null;
    const ry = Math.atan2(-dz, dx); // local X along the wall
    return PF.col((x0 + x1) / 2, (z0 + z1) / 2, len, t, y0, y1, ry, opts);
  };
  /**
   * Fill a (local-space) polygon with run-length box colliders.  poly: [[x,z],...] in the
   * frame (ox, oz, ry).  Rows every `step` metres along local Z.
   */
  PF.fillPoly = function (poly, ox, oz, ry, y0, y1, step, opts) {
    step = step || 1.5;
    let minX = 1e9,
      maxX = -1e9,
      minZ = 1e9,
      maxZ = -1e9;
    for (const p of poly) {
      minX = Math.min(minX, p[0]);
      maxX = Math.max(maxX, p[0]);
      minZ = Math.min(minZ, p[1]);
      maxZ = Math.max(maxZ, p[1]);
    }
    const dx = Math.min(0.5, step / 2);
    let n = 0;
    for (let z = minZ + step / 2; z < maxZ; z += step) {
      let start = null;
      for (let x = minX; x <= maxX + dx; x += dx) {
        const inside = x <= maxX && G.LAYOUT.pointInPoly(x, z, poly);
        if (inside && start === null) start = x;
        if (!inside && start !== null) {
          const x0 = start,
            x1 = x - dx;
          const cx = (x0 + x1) / 2;
          if (x1 - x0 > 0.2) {
            const [wx, wz] = PF.rot(ox, oz, ry, cx, z);
            PF.col(wx, wz, x1 - x0 + dx, step + 0.05, y0, y1, ry, opts);
            n++;
          }
          start = null;
        }
      }
    }
    return n;
  };
  /** Local → world helper for a frame (ox,oz, ry) → returns [x,z]. */
  PF.rot = function (ox, oz, ry, lx, lz) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    return [ox + lx * c + lz * s, oz - lx * s + lz * c];
  };

  /**
   * Flight of stairs with matching step colliders (rise ≤ 0.34 m).
   * Starts at (x,z) at height y0 climbing toward local +Z (rotated by ry) to y1 over `run` metres.
   * key: material, width: stair width. opts.solid (default true) fills to y0-0.1; opts.sideWalls key for cheeks.
   */
  PF.stairs = function (b, key, x, z, ry, width, run, y0, y1, opts) {
    opts = opts || {};
    const rise = y1 - y0;
    const n = Math.max(1, Math.ceil(Math.abs(rise) / (opts.maxRise || 0.34)));
    const stepRun = run / n,
      stepH = rise / n;
    const base = opts.base === undefined ? y0 - 0.2 : opts.base;
    for (let i = 0; i < n; i++) {
      const top = y0 + stepH * (i + 1);
      const lz = stepRun * (i + 0.5);
      const [wx, wz] = PF.rot(x, z, ry, 0, lz);
      b.box(key, wx, base, wz, width, top - base, stepRun + 0.02, {
        ry,
        seg: false,
        grime: opts.grime,
        c: opts.c,
      });
      if (!opts.noCollide)
        PF.col(wx, wz, width, stepRun + 0.02, base, top, ry, {
          surface: opts.surface || "concrete",
        });
    }
    if (opts.cheeks) {
      for (const sgn of [-1, 1]) {
        const [cx, cz] = PF.rot(x, z, ry, sgn * (width / 2 + 0.25), run / 2);
        const hh = Math.max(y0, y1) + 0.9 - base;
        // sloped cheek wall approximated by a rotated box (visual) + stepped colliders
        const len = Math.hypot(run, rise);
        const g = new THREE.BoxGeometry(0.5, 0.9, len);
        const m = PF.m4(
          cx,
          (y0 + y1) / 2 + 0.45,
          cz,
          ry,
          -Math.atan2(rise, run),
          0,
        );
        b.add(opts.cheeks, g, { m });
        void hh;
        for (let i = 0; i < n; i += 2) {
          const top = y0 + stepH * (i + 1) + 0.9;
          const [wx, wz] = PF.rot(
            x,
            z,
            ry,
            sgn * (width / 2 + 0.25),
            stepRun * (i + 1),
          );
          PF.col(wx, wz, 0.5, stepRun * 2, base, top, ry, { walkable: false });
        }
      }
    }
    return n;
  };
  /**
   * Walkable ramp made of thin step slabs (for bridge decks). Samples a height fn along local +Z.
   * heightAt(t) where t ∈ [0,1] → y. Each slab ≤ maxRise above the previous.
   */
  PF.stepPath = function (x, z, ry, width, len, heightAt, opts) {
    opts = opts || {};
    const maxRise = opts.maxRise || 0.3;
    let t = 0;
    const out = [];
    const dt = Math.min(0.02, 1 / Math.max(1, len));
    while (t < 1) {
      const yA = heightAt(t);
      let t2 = t; // advance until height changes by maxRise or segment length hits maxLen
      const maxLen = (opts.maxLen || 3) / len;
      while (t2 < 1 && Math.abs(heightAt(t2) - yA) < maxRise && t2 - t < maxLen)
        t2 += dt;
      t2 = Math.min(1, t2);
      const top =
        Math.max(heightAt(t), heightAt(t2)) * 0.5 +
        Math.min(heightAt(t), heightAt(t2)) * 0.5;
      const [wx, wz] = PF.rot(x, z, ry, 0, ((t + t2) / 2) * len);
      const thick = opts.thick || 1.0;
      out.push(
        PF.col(
          wx,
          wz,
          width,
          (t2 - t) * len + 0.05,
          opts.solid ? opts.base || 0 : top - thick,
          top,
          ry,
          { surface: opts.surface || "concrete" },
        ),
      );
      t = t2;
    }
    return out;
  };

  // -------------------------------------------------------------------
  // Anchors / registry / interactables
  // -------------------------------------------------------------------
  /** Publish this module's entries into the shared G.pois registry (add, never clobber). */
  PF.publish = function () {
    if (!G.pois || G.pois.__stub) G.pois = {};
    const P = G.pois;
    for (const id in PF.entries) P[id] = PF.entries[id];
    if (typeof P.getAnchor !== "function") {
      // Installed only if no other POI module defined it first. Searches every registered POI
      // by id or interiorKey; returns a fresh Vector3 carrying .yaw.
      P.getAnchor = function (idOrKey, name) {
        const R = G.pois;
        const cl = (v) => {
          const c = new THREE.Vector3(v.x, v.y, v.z);
          c.yaw = v.yaw || 0;
          return c;
        };
        let e = idOrKey ? R[idOrKey] : null;
        if (!e || !e.anchors) {
          for (const k in R) {
            const o = R[k];
            if (o && o.interiorKey === idOrKey && o.anchors) {
              e = o;
              break;
            }
          }
        }
        if (e && e.anchors && e.anchors[name]) return cl(e.anchors[name]);
        if (!idOrKey) {
          for (const k in R) {
            const o = R[k];
            if (o && o.anchors && o.anchors[name]) return cl(o.anchors[name]);
          }
        }
        return null;
      };
    }
  };
  /** Anchor point (world) with a facing yaw (player/actor convention: forward = (-sin yaw, 0, -cos yaw)). */
  PF.anchor = function (x, y, z, yaw) {
    const v = new THREE.Vector3(x, y, z);
    v.yaw = yaw || 0;
    return v;
  };
  /** Yaw that faces from (x,z) toward (tx,tz), actor convention. */
  PF.yawTo = function (x, z, tx, tz) {
    return Math.atan2(-(tx - x), -(tz - z));
  };
  /**
   * Register a finished POI: {id, root, interiorRoot, interiorKey, anchors}. aliases: extra ids
   * (e.g. the interior key) pointing at the same entry.
   */
  PF.register = function (id, root, anchors, opts) {
    opts = opts || {};
    const e = {
      id,
      root,
      interiorRoot: opts.interiorRoot || null,
      interiorKey: opts.interiorKey || null,
      anchors: anchors || {},
      owner: "poi_financial",
    };
    PF.entries[id] = e;
    PF.publish();
    return e;
  };
  // Loot-table ids we used historically / convenience names → real rpg tables (rpg/20_loot_tables.js).
  const LOOT_FIX = {
    museum: "wall_safe",
    common: "footlocker",
    continuity: "continuity_crate",
    raider: "raider_stash",
    ammo: "ammo_box",
    military: "weapon_crate",
  };
  /** Resolve a loot-table id against the live item registry (unknown ids → mapped alias → fallback → undefined). */
  PF.lootId = function (id, fallback) {
    if (!id) return id;
    let has = null;
    try {
      if (
        !G.isStub("items") &&
        G.items &&
        typeof G.items.hasLootTable === "function"
      )
        has = G.items.hasLootTable;
    } catch (e) {
      has = null;
    }
    if (!has) return LOOT_FIX[id] || id; // rpg absent: props uses its own fallback tables
    if (has(id)) return id;
    if (LOOT_FIX[id] && has(LOOT_FIX[id])) return LOOT_FIX[id];
    if (fallback && has(fallback)) return fallback;
    if (!PF._lootWarned) {
      PF._lootWarned = true;
      console.warn(
        '[poi_financial] unknown loot table "' +
          id +
          '" — using the prop default',
      );
    }
    return undefined; // props falls back to the prop type's own table
  };
  /**
   * Every prop this module spawns (spec + live handle). Specs are spawned `persistent` with a stable id, so the props
   * module restores them on 'reset' (turrets revived, explosives re-armed) and rpg resets their containers to pristine;
   * PF.respawnMissing() (run on newGame / loaded) re-creates any handle that some other system removed anyway.
   */
  PF.spawned = PF.spawned || [];
  /** Safe G.props.spawn wrapper (props may be absent or half-built). */
  PF.spawnProp = function (type, opts, onRespawn) {
    opts = Object.assign({}, opts || {});
    if (opts.loot) {
      const l = PF.lootId(opts.loot, opts.lootFallback);
      if (l) opts.loot = l;
      else delete opts.loot;
    }
    delete opts.lootFallback;
    if (opts.persistent === undefined) opts.persistent = true;
    if (!opts.id)
      opts.id =
        "pf:" +
        type +
        "@" +
        (+opts.x || 0).toFixed(1) +
        "," +
        (+opts.y || 0).toFixed(1) +
        "," +
        (+opts.z || 0).toFixed(1);
    const rec = { type, opts, handle: null, onRespawn: onRespawn || null };
    rec.handle = spawnRaw(type, opts);
    PF.spawned.push(rec);
    return rec.handle;
  };
  function spawnRaw(type, opts) {
    try {
      if (G.isStub("props") || !G.props || typeof G.props.spawn !== "function")
        return null;
      return G.props.spawn(type, opts);
    } catch (e) {
      if (!PF._propWarned) {
        PF._propWarned = true;
        console.warn(
          "[poi_financial] props.spawn failed for " +
            type +
            ": " +
            (e && e.message),
        );
      }
      return null;
    }
  }
  /** Re-create spawned props whose record was removed (by a reset elsewhere, or props rebuilding). Returns count. */
  PF.respawnMissing = function () {
    let n = 0;
    for (const rec of PF.spawned) {
      const h = rec.handle,
        r = h && h.record;
      const gone = h
        ? !!(r && r.removed)
        : !G.isStub("props") && G.props && typeof G.props.spawn === "function";
      if (!gone) continue;
      if (h && typeof h.remove === "function") {
        try {
          h.remove();
        } catch (e) {
          /* already gone */
        }
      }
      rec.handle = spawnRaw(rec.type, rec.opts);
      if (rec.onRespawn && rec.handle) {
        try {
          rec.onRespawn(rec.handle);
        } catch (e) {
          /* optional */
        }
      }
      n++;
    }
    return n;
  };
  /** Read-able plaque/interactable ('Read' → notify text). */
  PF.plaque = function (pos, title, text) {
    try {
      G.world.addInteractable({
        pos,
        radius: 0.7,
        label: title,
        verb: "Read",
        range: 2.5,
        onInteract() {
          G.notify(title + " — " + text, { duration: 9 });
          G.sfx.play("ui_click");
        },
      });
    } catch (e) {
      /* core missing */
    }
  };
  /** Animated things: fn(t, dt, camPos). center/radius gate by distance. */
  PF.animate = function (center, radius, fn) {
    PF.animators.push({ c: center, r2: radius * radius, fn });
  };

  // -------------------------------------------------------------------
  // Reusable detail kits
  // -------------------------------------------------------------------
  /**
   * Row of windows on a wall plane. Wall plane is defined by origin (x,z) of the wall's left end,
   * direction ry (local +X runs along the wall; the window faces local +Z), with `out` offset.
   * opts: {count, spacing, y0, floors, floorH, w, h, frame: key, sillKey, brokenRatio, boardedRatio, litRatio, seed}
   */
  PF.windows = function (b, x, z, ry, opts) {
    const r = PF.rng(opts.seed || x * 7 + z * 3);
    const fk = opts.frame || "limestone";
    const c = Math.cos(ry),
      s = Math.sin(ry);
    for (let f = 0; f < opts.floors; f++) {
      const y = opts.y0 + f * opts.floorH;
      for (let i = 0; i < opts.count; i++) {
        const lx = opts.start + i * opts.spacing;
        const wx = x + lx * c + (opts.out || 0.02) * s,
          wz = z - lx * s + (opts.out || 0.02) * c;
        const roll = r();
        let key = "glass_dark";
        if (roll < (opts.brokenRatio === undefined ? 0.25 : opts.brokenRatio))
          key = "glass_broken";
        else if (
          roll <
          (opts.brokenRatio || 0.25) + (opts.boardedRatio || 0.06)
        )
          key = "planks";
        else if (opts.litRatio && roll > 1 - opts.litRatio) key = "window_lit";
        b.quad(key, wx, y + opts.h / 2, wz, opts.w, opts.h, {
          ry,
          uv: "box",
          grime: 0.1,
          noAO: true,
        });
        if (opts.sill !== false) {
          const sx = x + lx * c + 0.12 * s,
            sz = z - lx * s + 0.12 * c;
          b.box(fk, sx, y - 0.14, sz, opts.w + 0.3, 0.14, 0.26, {
            ry,
            seg: false,
            grime: 0.3,
          });
        }
        if (opts.lintel) {
          const sx = x + lx * c + 0.08 * s,
            sz = z - lx * s + 0.08 * c;
          b.box(fk, sx, y + opts.h, sz, opts.w + 0.3, 0.22, 0.18, {
            ry,
            seg: false,
            grime: 0.3,
          });
        }
      }
    }
  };
  /** Crenellated parapet along a segment. */
  PF.crenels = function (b, key, x0, z0, x1, z1, y, t, h, merlonW, gapW) {
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    const step = merlonW + gapW;
    const n = Math.max(1, Math.floor(len / step));
    const pad = (len - n * step + gapW) / 2;
    b.box(key, (x0 + x1) / 2, y, (z0 + z1) / 2, len, h * 0.45, t, {
      ry,
      seg: false,
    });
    for (let i = 0; i < n; i++) {
      const lx = pad + i * step + merlonW / 2;
      const px = x0 + ((x1 - x0) * lx) / len,
        pz = z0 + ((z1 - z0) * lx) / len;
      b.box(key, px, y + h * 0.45, pz, merlonW, h * 0.55, t, {
        ry,
        seg: false,
      });
    }
  };
  /** Sandbag wall (stacked flattened capsules) along a segment. */
  PF.sandbags = function (b, x0, z0, x1, z1, rows, opts) {
    opts = opts || {};
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    const y0 = opts.y || 0;
    const bagL = 0.75;
    const n = Math.max(1, Math.round(len / bagL));
    for (let rI = 0; rI < (rows || 3); rI++) {
      const off = rI % 2 ? 0.5 : 0;
      for (let i = 0; i < n - (off ? 1 : 0); i++) {
        const t = (i + 0.5 + off) / n;
        const px = x0 + (x1 - x0) * t,
          pz = z0 + (z1 - z0) * t;
        const g = new THREE.SphereGeometry(0.4, 6, 4);
        g.scale(1.0, 0.36, 0.62);
        b.add("sandbag", g, {
          m: PF.m4(
            px,
            y0 + 0.14 + rI * 0.27,
            pz,
            ry + (U.hash2(i, rI) - 0.5) * 0.2,
          ),
          grime: 0.5,
          c: 0xffffff,
        });
      }
    }
    if (!opts.noCollide)
      PF.col(
        (x0 + x1) / 2,
        (z0 + z1) / 2,
        len,
        0.8,
        y0,
        y0 + (rows || 3) * 0.27 + 0.1,
        ry,
        { surface: "dirt" },
      );
  };
  /** Rusty oil drum (optionally burning). */
  PF.barrel = function (b, x, y, z, opts) {
    opts = opts || {};
    b.cyl(opts.key || "rust", x, y, z, 0.3, 0.3, 0.9, 10, {
      hSeg: 1,
      grime: 0.4,
    });
    b.cyl("iron", x, y + 0.28, z, 0.315, 0.315, 0.05, 10, { hSeg: 1 });
    b.cyl("iron", x, y + 0.6, z, 0.315, 0.315, 0.05, 10, { hSeg: 1 });
    if (opts.fire) {
      b.cyl("fire", x, y + 0.82, z, 0.22, 0.26, 0.12, 8, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      PF.fires.push(new THREE.Vector3(x, y + 1.0, z));
    }
    if (!opts.noCollide)
      PF.col(x, z, 0.62, 0.62, y, y + 0.9, 0, { surface: "metal" });
  };
  PF.fires = PF.fires || [];
  PF.glows = PF.glows || []; // [{pos, color, size}] glow sprites registered at initDone
  /** Scrap-metal wall panel run (raider fortifications). */
  PF.scrapWall = function (b, x0, z0, x1, z1, h, opts) {
    opts = opts || {};
    const r = PF.rng(opts.seed || x0 * 3 + z1 * 5);
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    const sn = Math.sin(ry),
      cs = Math.cos(ry);
    const y0 = opts.y || 0;
    const at = (tt, off) => [
      x0 + ((x1 - x0) * tt) / len + off * sn,
      z0 + ((z1 - z0) * tt) / len + off * cs,
    ];
    const TINTS = [
      undefined,
      0xc8b8a0,
      0x9aa890,
      0xb89478,
      0x8898a8,
      undefined,
    ];
    let t = 0,
      side = 1;
    while (t < len) {
      const pw = Math.min(len - t, 1.4 + r() * 1.8);
      const mid = t + pw / 2;
      const [px, pz] = at(mid, 0);
      const ph = h * (0.8 + r() * 0.35);
      const key = r.pick([
        "corrugated",
        "rust",
        "panel",
        "corrugated",
        "planks",
        "paint_red",
        "rust",
        "diamond",
        "paint_teal",
      ]);
      b.box(key, px, y0, pz, pw + 0.15, ph, 0.08, {
        ry,
        rz: (r() - 0.5) * 0.06,
        rx: (r() - 0.5) * 0.08,
        seg: false,
        grime: 0.7,
        c: r.pick(TINTS),
      });
      // patchwork: smaller sheets riveted over the joints, alternating faces
      if (r() < 0.55) {
        const pw2 = 0.6 + r() * 0.9,
          ph2 = 0.5 + r() * 1.0,
          tt = t + r() * pw;
        const [qx, qz] = at(tt, side * 0.07);
        b.box(
          r.pick([
            "rust",
            "corrugated",
            "paint_cream",
            "paint_orange",
            "steel",
          ]),
          qx,
          y0 + 0.3 + r() * (ph - ph2 - 0.3),
          qz,
          pw2,
          ph2,
          0.05,
          { ry, rz: (r() - 0.5) * 0.35, seg: false, grime: 0.8 },
        );
      }
      // a car door (painted shell + broken window) or a road sign bolted on
      if (r() < 0.16) {
        const [qx, qz] = at(mid, side * 0.1);
        b.box(
          r.pick(["paint_red", "paint_teal", "paint_cream", "rust"]),
          qx,
          y0 + 0.4,
          qz,
          1.1,
          1.05,
          0.1,
          { ry, rz: (r() - 0.5) * 0.2, seg: false, grime: 0.6 },
        );
        const [gx, gz] = at(mid, side * 0.16);
        b.quad("glass_broken", gx, y0 + 1.15, gz, 0.8, 0.36, {
          ry: ry + (side > 0 ? 0 : Math.PI),
          noAO: true,
        });
        b.box("chrome", qx, y0 + 0.95, qz, 0.2, 0.05, 0.16, { ry, seg: false });
      } else if (r() < 0.1) {
        const [qx, qz] = at(mid, side * 0.1);
        const sg = new THREE.CylinderGeometry(0.42, 0.42, 0.04, 8);
        sg.rotateX(Math.PI / 2);
        b.add("paint_red", sg, {
          m: PF.m4(qx, y0 + ph * 0.6, qz, ry, 0, Math.PI / 8),
          grime: 0.5,
        });
      }
      // horizontal batten
      if (r() < 0.35) {
        const [qx, qz] = at(mid, side * 0.08);
        b.box(
          "planks",
          qx,
          y0 + 0.6 + r() * (ph - 1.0),
          qz,
          pw + 0.3,
          0.16,
          0.05,
          { ry, rz: (r() - 0.5) * 0.1, seg: false },
        );
      }
      // rebar spikes / sharpened pipes along the top
      if (!opts.noSpikes && r() < 0.5)
        for (let k = 0; k < 3; k++) {
          const [qx, qz] = at(t + ((k + 0.5) * pw) / 3, 0);
          b.beam(
            "rust",
            new THREE.Vector3(qx, y0 + ph - 0.3, qz),
            new THREE.Vector3(
              qx + (r() - 0.5) * 0.2,
              y0 + ph + 0.35 + r() * 0.4,
              qz + (r() - 0.5) * 0.2,
            ),
            0.035,
            0.035,
            { noAO: true },
          );
        }
      // tyres stacked at the foot of the wall
      if (!opts.noClutter && r() < 0.12) {
        const [qx, qz] = at(mid, side * 0.55);
        for (let k = 0, n = 1 + ((r() * 3) | 0); k < n; k++) {
          const tg = new THREE.TorusGeometry(0.32, 0.12, 5, 10);
          tg.rotateX(Math.PI / 2);
          b.add("tire", tg, {
            m: PF.m4(qx + (r() - 0.5) * 0.08, y0 + 0.12 + k * 0.23, qz),
            noAO: true,
          });
        }
      }
      side = -side;
      t += pw;
    }
    // posts
    for (let p = 0; p <= len; p += 3) {
      const px = x0 + ((x1 - x0) * p) / len,
        pz = z0 + ((z1 - z0) * p) / len;
      b.box("rust", px, y0, pz, 0.14, h * 1.1, 0.14, { ry, seg: false });
    }
    if (!opts.noCollide)
      PF.colWall(x0, z0, x1, z1, 0.4, y0, y0 + h, {
        walkable: false,
        surface: "metal",
      });
  };
  /**
   * 1950s wrecked car shell (a generic finned sedan). Built from a few boxes + rounded bits.
   * (x,y,z) centre bottom, ry heading. opts.color: paint key.
   */
  PF.car = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const r = PF.rng(opts.seed || x * 31 + z * 17);
    const paint =
      opts.paint ||
      r.pick([
        "paint_red",
        "paint_teal",
        "paint_cream",
        "rust",
        "paint_orange",
        "rust",
      ]);
    const M = PF.m4(
      x,
      y + (opts.flipped ? 1.45 : 0),
      z,
      ry,
      0,
      opts.flipped ? Math.PI : opts.tilt || 0,
    );
    const add = (key, geo, m) =>
      b.add(key, geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.65,
      });
    // lower body: rounded slab (lathe-like capsule scaled)
    const body = new THREE.CapsuleGeometry(0.62, 3.1, 3, 10);
    body.rotateZ(Math.PI / 2);
    body.scale(1, 0.62, 1.45);
    add(paint, body, PF.m4(0, 0.72, 0, Math.PI / 2));
    // cabin
    const cab = new THREE.CapsuleGeometry(0.55, 1.1, 3, 8);
    cab.rotateZ(Math.PI / 2);
    cab.scale(1, 0.7, 1.35);
    add(paint, cab, PF.m4(0, 1.18, -0.15, Math.PI / 2));
    add(
      "glass_broken",
      new THREE.BoxGeometry(1.5, 0.42, 1.9),
      PF.m4(0, 1.2, -0.15),
    );
    // tail fins
    for (const sx of [-0.72, 0.72])
      add(
        paint,
        new THREE.BoxGeometry(0.08, 0.35, 1.0),
        PF.m4(sx, 1.02, 1.9, 0, -0.25),
      );
    // chrome bumpers
    add(
      "chrome",
      new THREE.BoxGeometry(1.95, 0.18, 0.16),
      PF.m4(0, 0.5, -2.45),
    );
    add("chrome", new THREE.BoxGeometry(1.95, 0.18, 0.16), PF.m4(0, 0.5, 2.45));
    // wheels (some missing)
    for (const wx of [-0.86, 0.86])
      for (const wz of [-1.5, 1.45]) {
        if (r() < 0.25) continue;
        const w = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 10);
        w.rotateZ(Math.PI / 2);
        add("tire", w, PF.m4(wx, 0.34 - (r() < 0.3 ? 0.12 : 0), wz));
      }
    if (!opts.noCollide)
      PF.col(x, z, 2.0, 5.0, y, y + 1.5, ry, { surface: "metal" });
  };
  /**
   * Freestanding 1950s billboard on rusty I-beam legs with catwalk + lamp hoods.
   * (x,z) centre at ground y, facing ry (0 → +Z). w×h panel, raised `lift` metres.
   */
  PF.billboard = function (b, brand, x, y, z, ry, w, h, lift) {
    w = w || 12;
    h = h || 5.5;
    lift = lift === undefined ? 5 : lift;
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    for (const lx of [-w * 0.35, w * 0.35]) {
      const [px, pz] = P(lx, -0.6);
      b.box("rust", px, y, pz, 0.35, lift + h + 0.3, 0.35, {
        ry,
        seg: false,
        grime: 0.6,
      });
      const [bx, bz] = P(lx, -1.8);
      b.beam(
        "rust",
        new THREE.Vector3(bx, y, bz),
        new THREE.Vector3(px, y + lift * 0.9, pz),
        0.18,
        0.18,
      );
      PF.col(px, pz, 0.5, 0.5, y, y + lift + h, ry, { walkable: false });
    }
    const [fx, fz] = P(0, -0.35);
    b.box("rust", fx, y + lift - 0.2, fz, w + 0.5, h + 0.5, 0.25, {
      ry,
      seg: false,
      grime: 0.6,
    });
    const [qx, qz] = P(0, -0.2);
    b.quad(PF.brandMat(brand), qx, y + lift + h / 2 + 0.05, qz, w, h, {
      ry,
      grime: 0.2,
    });
    // catwalk + lamp hoods
    const [cx, cz] = P(0, 0.4);
    b.box("iron", cx, y + lift - 0.35, cz, w + 0.6, 0.08, 0.9, {
      ry,
      seg: false,
    });
    for (let k = -1; k <= 1; k++) {
      const [lx2, lz2] = P(k * w * 0.33, 0.9);
      b.box("iron", lx2, y + lift - 0.3, lz2, 0.06, 0.8, 0.06, {
        ry,
        seg: false,
      });
      b.cyl("iron", lx2, y + lift + 0.4, lz2, 0.12, 0.3, 0.25, 6, { hSeg: 1 });
    }
  };
  /** Dead tree: trunk + a few forked branches (bark material). */
  PF.deadTree = function (b, x, y, z, h, seed) {
    const r = PF.rng(seed || x * 5 + z * 11);
    const base = new THREE.Vector3(x, y - 0.3, z);
    const top = new THREE.Vector3(
      x + (r() - 0.5) * 0.8,
      y + h * 0.55,
      z + (r() - 0.5) * 0.8,
    );
    b.rod("bark", base, top, 0.22 + h * 0.015, 6, { r2: 0.13, grime: 0.2 });
    const branch = (from, len, rad, depth) => {
      const n = depth > 1 ? 2 : 3;
      for (let i = 0; i < n; i++) {
        const a = r() * TAU,
          up = 0.5 + r() * 0.6;
        const to = new THREE.Vector3(
          from.x + Math.cos(a) * len * (1 - up * 0.5),
          from.y + len * up,
          from.z + Math.sin(a) * len * (1 - up * 0.5),
        );
        b.rod("bark", from, to, rad, 4, { r2: rad * 0.5, grime: 0.1 });
        if (depth < 2) branch(to, len * 0.6, rad * 0.55, depth + 1);
      }
    };
    branch(top, h * 0.35, 0.1, 0);
  };
  /** Victorian park lamp post (cast iron), optional glow bulb. */
  PF.lampPost = function (b, x, y, z, lit) {
    b.cyl("iron", x, y, z, 0.09, 0.16, 0.6, 8, { hSeg: 1 });
    b.cyl("iron", x, y + 0.6, z, 0.06, 0.08, 3.0, 6, { hSeg: 1 });
    b.cyl("iron", x, y + 3.55, z, 0.24, 0.12, 0.18, 6, { hSeg: 1 });
    b.cyl(lit ? "lamp" : "glass_broken", x, y + 3.73, z, 0.2, 0.2, 0.45, 6, {
      hSeg: 1,
      noAO: true,
      grime: 0,
    });
    b.cyl("iron", x, y + 4.18, z, 0.02, 0.28, 0.2, 6, { hSeg: 1 });
    if (lit)
      PF.glows.push({
        pos: new THREE.Vector3(x, y + 3.95, z),
        color: 0xffd9a0,
        size: 2.2,
      });
  };
  /** Park bench (wood slats on iron). */
  PF.bench = function (b, x, y, z, ry) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    for (let i = 0; i < 3; i++)
      b.box(
        "rotten",
        x + s * (i * 0.14 - 0.14),
        y + 0.45,
        z + c * (i * 0.14 - 0.14),
        1.8,
        0.04,
        0.12,
        { ry, seg: false },
      );
    for (let i = 0; i < 2; i++)
      b.box(
        "rotten",
        x - s * 0.24,
        y + 0.62 + i * 0.16,
        z - c * 0.24,
        1.8,
        0.1,
        0.03,
        { ry, seg: false },
      );
    for (const k of [-0.8, 0.8])
      b.box("iron", x + c * k, y, z - s * k, 0.06, 0.8, 0.5, {
        ry,
        seg: false,
      });
  };
  /** Human skeleton lying on the ground (cheap bones). */
  PF.skeleton = function (b, x, y, z, ry) {
    const M = PF.m4(x, y, z, ry);
    const add = (geo, m) =>
      b.add("bone", geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.3,
      });
    add(new THREE.SphereGeometry(0.11, 7, 5), PF.m4(0, 0.1, -0.8));
    for (let i = 0; i < 5; i++)
      add(
        new THREE.TorusGeometry(0.13 - i * 0.008, 0.012, 3, 8, Math.PI),
        PF.m4(0, 0.06, -0.55 + i * 0.07, 0, Math.PI / 2),
      );
    add(
      new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4),
      PF.m4(0, 0.04, -0.35, 0, Math.PI / 2),
    );
    add(new THREE.BoxGeometry(0.28, 0.08, 0.14), PF.m4(0, 0.05, 0));
    for (const sx of [-0.1, 0.1]) {
      add(
        new THREE.CylinderGeometry(0.022, 0.018, 0.85, 4),
        PF.m4(sx * 1.4, 0.03, 0.45, sx * 2, Math.PI / 2),
      );
      add(
        new THREE.CylinderGeometry(0.018, 0.015, 0.6, 4),
        PF.m4(sx * 3.2, 0.03, -0.35, sx * 6, Math.PI / 2),
      );
    }
  };
  /** Low chain/rail fence of iron posts with rails between points (closed=false). */
  PF.railing = function (b, pts, y, h, key, opts) {
    opts = opts || {};
    key = key || "iron";
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1];
      const ya = typeof a[2] === "number" ? a[2] : y,
        yc = typeof c[2] === "number" ? c[2] : y;
      b.beam(
        key,
        new THREE.Vector3(a[0], ya + h, a[1]),
        new THREE.Vector3(c[0], yc + h, c[1]),
        0.06,
        0.06,
        { grime: 0.2 },
      );
      b.beam(
        key,
        new THREE.Vector3(a[0], ya + h * 0.5, a[1]),
        new THREE.Vector3(c[0], yc + h * 0.5, c[1]),
        0.04,
        0.04,
        { grime: 0.2 },
      );
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      const n = Math.max(1, Math.round(len / (opts.postStep || 2)));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const px = a[0] + (c[0] - a[0]) * t,
          pz = a[1] + (c[1] - a[1]) * t,
          py = ya + (yc - ya) * t;
        b.box(key, px, py, pz, 0.08, h + 0.05, 0.08, {
          seg: false,
          grime: 0.2,
        });
      }
      if (opts.collide)
        PF.colWall(
          a[0],
          a[1],
          c[0],
          c[1],
          0.2,
          Math.min(ya, yc) - 0.5,
          Math.max(ya, yc) + h,
          { walkable: false, surface: "metal" },
        );
    }
  };
})();
