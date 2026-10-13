// play-inline-171 03 — addcolorstop
// Lines 347-691 of readable/play-inline-171.pretty.js (statement-aligned).
  function plasterCanvas() {
    const S = 512,
      c = K.canvas(S, S),
      x = c.getContext("2d"),
      r = K.rng(4242);
    x.fillStyle = "#dcd6c8";
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 220; i++) {
      const px = r() * S,
        py = r() * S,
        rad = 6 + r() * 40,
        g = x.createRadialGradient(px, py, 0, px, py, rad);
      const t = r() < 0.5 ? "255,250,240" : "170,160,140";
      g.addColorStop(0, "rgba(" + t + ",0.10)");
      g.addColorStop(1, "rgba(" + t + ",0)");
      x.fillStyle = g;
      x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
    // water stains drip from the top edge, hairline cracks
    for (let i = 0; i < 5; i++) {
      const px = r() * S,
        w = 20 + r() * 60,
        g = x.createLinearGradient(0, 0, 0, S * (0.2 + r() * 0.4));
      g.addColorStop(0, "rgba(120,100,70,0.22)");
      g.addColorStop(1, "rgba(120,100,70,0)");
      x.fillStyle = g;
      x.fillRect(px, 0, w, S * 0.6);
    }
    x.strokeStyle = "rgba(80,70,60,0.35)";
    x.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      x.beginPath();
      let px = r() * S,
        py = r() * S;
      x.moveTo(px, py);
      for (let k = 0; k < 7; k++) {
        px += (r() - 0.5) * 50;
        py += (r() - 0.4) * 40;
        x.lineTo(px, py);
      }
      x.stroke();
    }
    K.grain(x, S, S, 10, 4243);
    return c;
  }
  /** Office / hospital drop ceiling: 60 cm acoustic tiles in a T-bar grid, a few stained or missing. */
  function ceilTileCanvas() {
    const S = 512,
      N = 4,
      c = K.canvas(S, S),
      x = c.getContext("2d"),
      r = K.rng(7311),
      cs = S / N;
    x.fillStyle = "#6a6a64";
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const px = i * cs,
          py = j * cs,
          miss = r() < 0.07;
        if (miss) {
          x.fillStyle = "#1a1a18";
          x.fillRect(px + 3, py + 3, cs - 6, cs - 6);
          x.fillStyle = "rgba(90,80,60,0.6)";
          for (let k = 0; k < 4; k++)
            x.fillRect(
              px + 8 + r() * (cs - 30),
              py + 8 + r() * (cs - 30),
              4,
              20,
            );
          continue;
        }
        const v = 206 + Math.floor(r() * 18);
        x.fillStyle = "rgb(" + v + "," + (v - 3) + "," + (v - 12) + ")";
        x.fillRect(px + 3, py + 3, cs - 6, cs - 6);
        x.fillStyle = "rgba(90,86,76,0.35)";
        for (let k = 0; k < 90; k++)
          x.fillRect(
            px + 5 + r() * (cs - 10),
            py + 5 + r() * (cs - 10),
            1.5,
            1.5,
          ); // pinholes
        if (r() < 0.3) {
          const g = x.createRadialGradient(
            px + cs / 2,
            py + cs / 2,
            2,
            px + cs / 2,
            py + cs / 2,
            cs * 0.5,
          );
          g.addColorStop(0, "rgba(130,100,50,0.45)");
          g.addColorStop(0.7, "rgba(150,120,70,0.25)");
          g.addColorStop(1, "rgba(150,120,70,0)");
          x.fillStyle = g;
          x.fillRect(px + 3, py + 3, cs - 6, cs - 6);
        }
        if (r() < 0.15) {
          x.save();
          x.translate(px + cs / 2, py + cs / 2);
          x.rotate((r() - 0.5) * 0.1);
          x.fillStyle = "rgba(0,0,0,0.25)";
          x.fillRect(-cs / 2 + 3, cs / 2 - 10, cs - 6, 7);
          x.restore();
        } // sagging tile edge
      }
    x.strokeStyle = "#c8c8c0";
    x.lineWidth = 2;
    for (let i = 0; i <= N; i++) {
      x.beginPath();
      x.moveTo(i * cs, 0);
      x.lineTo(i * cs, S);
      x.stroke();
      x.beginPath();
      x.moveTo(0, i * cs);
      x.lineTo(S, i * cs);
      x.stroke();
    }
    K.grain(x, S, S, 8, 7312);
    return c;
  }
  K.initAtlases = function () {
    if (K.atlases.paint) return;
    K.defineMat("ceil_tile", {
      map: K.texFromCanvas(ceilTileCanvas()),
      color: 0xffffff,
      tile: [2.4, 2.4],
      rough: 0.95,
    });
    K.defineMat("plaster_base", {
      map: K.texFromCanvas(plasterCanvas()),
      color: 0xffffff,
      tile: [3, 3],
      rough: 0.95,
    });
    // warm neutral reflection environment for metals (brass, bronze, chrome) — without it they read as black indoors
    const ev = K.canvas(256, 128),
      ex = ev.getContext("2d");
    const eg = ex.createLinearGradient(0, 0, 0, 128);
    eg.addColorStop(0, "#f0e2c4");
    eg.addColorStop(0.35, "#b09a7a");
    eg.addColorStop(0.5, "#6a5c4a");
    eg.addColorStop(0.62, "#4a4034");
    eg.addColorStop(1, "#5a5044");
    ex.fillStyle = eg;
    ex.fillRect(0, 0, 256, 128);
    for (let i = 0; i < 10; i++) {
      const px = i * 26 + 8,
        g2 = ex.createRadialGradient(px, 26, 0, px, 26, 12);
      g2.addColorStop(0, "rgba(255,244,220,1)");
      g2.addColorStop(1, "rgba(255,244,220,0)");
      ex.fillStyle = g2;
      ex.fillRect(px - 12, 14, 24, 24);
    }
    K.envTex = K.texFromCanvas(ev, { clamp: false });
    K.envTex.mapping = THREE.EquirectangularReflectionMapping;
    const paint = (K.atlases.paint = new K.Atlas("paint", 2048, null, 2048));
    const lit = (K.atlases.lit = new K.Atlas("lit", 2048, "#000", 2048)); // 1024 overflowed (Bellevue tanks)
    const neon = (K.atlases.neon = new K.Atlas("neon", 2048, "#000", 1024));
    const flags = (K.atlases.flags = new K.Atlas("flags", 1024, null, 1024));
    K.defineMat("atlas_paint", {
      map: paint.tex,
      color: 0xffffff,
      rough: 0.8,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
    });
    K.defineMat("atlas_lit", {
      basic: true,
      map: lit.tex,
      color: 0xffffff,
      toneMapped: true,
      noShadow: true,
      unlit: true,
    });
    K.defineMat("atlas_neon", {
      basic: true,
      map: neon.tex,
      color: 0xffffff,
      transparent: true,
      additive: true,
      fog: false,
      toneMapped: false,
      side: THREE.FrontSide,
      noShadow: true,
    });
    const fm = new THREE.MeshStandardMaterial({
      map: flags.tex,
      vertexColors: true,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
      roughness: 1,
    });
    fm.userData.uTime = { value: 0 };
    fm.onBeforeCompile = function (sh) {
      sh.uniforms.uTime = fm.userData.uTime;
      sh.vertexShader =
        "uniform float uTime;\n" +
        sh.vertexShader.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\n" +
            "  float fT = fract(uv.x * 4.0);\n" +
            "  float ph = position.x * 0.21 + position.z * 0.17 + position.y * 0.05;\n" +
            "  transformed += normal * (sin(uTime * 2.1 + fT * 5.5 + ph) * 0.35 + sin(uTime * 5.3 + fT * 11.0 + ph) * 0.08) * fT * 0.5;",
        );
    };
    fm.customProgramCacheKey = () => "pmid_flag_wave";
    K.defineMat("flags", { material: fm, noShadow: true });
    K.flagMat = fm;
    // additive light shafts (gradient along v)
    const sc = K.canvas(64, 256),
      sx = sc.getContext("2d");
    const sg = sx.createLinearGradient(0, 0, 0, 256);
    sg.addColorStop(0, "rgba(255,240,200,0.0)");
    sg.addColorStop(0.08, "rgba(255,240,200,0.55)");
    sg.addColorStop(0.5, "rgba(255,235,190,0.25)");
    sg.addColorStop(1, "rgba(255,230,180,0)");
    sx.fillStyle = sg;
    sx.fillRect(0, 0, 64, 256);
    const hg = sx.createLinearGradient(0, 0, 64, 0);
    hg.addColorStop(0, "rgba(0,0,0,1)");
    hg.addColorStop(0.2, "rgba(0,0,0,0)");
    hg.addColorStop(0.8, "rgba(0,0,0,0)");
    hg.addColorStop(1, "rgba(0,0,0,1)");
    sx.globalCompositeOperation = "destination-out";
    sx.fillStyle = hg;
    sx.fillRect(0, 0, 64, 256);
    K.defineMat("shaft", {
      basic: true,
      map: K.texFromCanvas(sc, { clamp: true }),
      color: 0x8a8068,
      transparent: true,
      additive: true,
      fog: true,
      side: THREE.DoubleSide,
      noShadow: true,
    });
  };

  /** Painted slot (opaque sign/relief/clock). draw(ctx,w,h). Returns uv rect. */
  K.paint = function (key, w, h, draw) {
    const at = K.atlases.paint;
    if (at.slots[key]) return at.slots[key].rect;
    const area = w * h,
      sc = area > 250000 ? 0.5 : area > 90000 ? 0.62 : area > 40000 ? 0.8 : 1;
    return at.alloc(
      key,
      w * sc,
      h * sc,
      draw
        ? (x) => {
            x.scale(sc, sc);
            draw(x, w, h);
          }
        : null,
    ).rect;
  };
  /** Self-lit slot (unlit material, not additive). */
  K.litPaint = function (key, w, h, draw) {
    const at = K.atlases.lit;
    if (at.slots[key]) return at.slots[key].rect;
    const area = w * h,
      sc = area > 250000 ? 0.5 : area > 90000 ? 0.66 : 1;
    return at.alloc(
      key,
      w * sc,
      h * sc,
      draw
        ? (x) => {
            x.scale(sc, sc);
            draw(x, w, h);
          }
        : null,
    ).rect;
  };
  /** Flag slot (cloth, alpha-tested, waving). */
  K.flag = function (key, w, h, draw) {
    const at = K.atlases.flags;
    if (at.slots[key]) return at.slots[key].rect;
    return at.alloc(key, w, h, draw).rect;
  };

  /** Neon text on black (additive). opts {font, size, color, glow, tube:boolean, border} */
  K.neon = function (key, text, color, opts) {
    opts = opts || {};
    const font = opts.font || 'bold 64px "Arial Black", Impact, sans-serif';
    const ctx0 = K.atlases.neon.ctx;
    ctx0.font = font;
    const tw = Math.ceil(ctx0.measureText(text).width);
    // long signs keep more resolution so the glyphs stay legible at street distance
    const sc = opts.sc || (tw > 520 ? 0.85 : NEON_SC);
    const h = opts.h || 110,
      w = Math.min(2040 / sc, opts.w || tw + 70);
    if (K.atlases.neon.slots[key]) return K.atlases.neon.slots[key].rect;
    return K.atlases.neon.alloc(key, w * sc, h * sc, (x0) => {
      x0.scale(sc, sc);
      const x = x0,
        W = w,
        H = h;
      x.fillStyle = "#000";
      x.fillRect(0, 0, W, H);
      x.font = font;
      x.textAlign = "center";
      x.textBaseline = "middle";
      const col = K.hex(color);
      if (opts.border) {
        x.strokeStyle = col;
        x.lineWidth = 4;
        x.shadowColor = col;
        x.shadowBlur = 12;
        x.strokeRect(8, 8, W - 16, H - 16);
      }
      // one soft halo pass, then crisp coloured glyphs, then a thin hot tube core traced along each stroke
      x.shadowColor = col;
      x.shadowBlur = opts.glow || 12;
      x.fillStyle = col;
      x.globalAlpha = 0.55;
      x.fillText(text, W / 2, H / 2 + 2);
      x.shadowBlur = 0;
      x.globalAlpha = 0.95;
      x.fillText(text, W / 2, H / 2 + 2);
      x.globalAlpha = 1;
      if (opts.tube !== false) {
        // hot white-ish core inside each glyph
        x.globalCompositeOperation = "lighter";
        x.fillStyle = "rgba(150,150,140,0.55)";
        x.fillText(text, W / 2, H / 2 + 2);
        x.globalCompositeOperation = "source-over";
      }
    }).rect;
  };
  const NEON_SC = 0.6;
  /** Generic neon drawing (shapes). */
  K.neonDraw = function (key, w, h, draw) {
    if (K.atlases.neon.slots[key]) return K.atlases.neon.slots[key].rect;
    return K.atlases.neon.alloc(key, w * NEON_SC, h * NEON_SC, (x) => {
      x.scale(NEON_SC, NEON_SC);
      x.fillStyle = "#000";
      x.fillRect(0, 0, w, h);
      draw(x, w, h);
    }).rect;
  };

