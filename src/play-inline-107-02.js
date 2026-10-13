// play-inline-107 02 — wx0
// Lines 15-358 of readable/play-inline-107.pretty.js (statement-aligned).
  const K = G.LMA.kit;
  const U = G.util;

  // ------------------------------------------------------------------
  // Façade textures
  // ------------------------------------------------------------------
  /**
   * K.facade(key, spec) → defines material `key` with a window-grid texture.
   * spec: {bays, floors, bayW, floorH, px (canvas px), wall, wall2?, pier (0..1 of bay), win:{x0,x1,y0,y1} fractions of a bay/floor,
   *        frame, glass, spandrel (colour → vertical metal strips), broken, boarded, lit, litColor, mullions (n vertical), hBand (colour of
   *        horizontal floor band), brick:boolean, seed, rough, metal, emissiveIntensity}
   */
  K.facade = function (key, s) {
    const W = s.pxW || 512,
      H = s.pxH || 512;
    const c = K.canvas(W, H),
      x = c.getContext("2d");
    const bw = W / s.bays,
      fh = H / s.floors;
    const r = K.rng(s.seed || key);
    const lit = s.lit || 0;
    let ec = null,
      ex = null;
    if (lit > 0) {
      ec = K.canvas(W / 2, H / 2);
      ex = ec.getContext("2d");
      ex.fillStyle = "#000";
      ex.fillRect(0, 0, W / 2, H / 2);
    }
    // wall base
    x.fillStyle = s.wall;
    x.fillRect(0, 0, W, H);
    if (s.brick) {
      const bh = Math.max(2, fh / 12),
        bwid = bh * 2.6;
      for (let yy = 0; yy < H; yy += bh)
        for (let xx = -bwid; xx < W; xx += bwid) {
          const off = ((Math.floor(yy / bh) % 2) * bwid) / 2;
          x.fillStyle = K.shadeHex(s.wall, 0.82 + r() * 0.3);
          x.fillRect(xx + off + 1, yy + 1, bwid - 2, bh - 1.5);
        }
    } else if (s.blocks !== false) {
      // ashlar joints
      x.strokeStyle = "rgba(40,36,30,0.18)";
      x.lineWidth = 1;
      const jh = fh / 3;
      for (let yy = 0; yy < H; yy += jh) {
        x.beginPath();
        x.moveTo(0, yy);
        x.lineTo(W, yy);
        x.stroke();
      }
    }
    for (let fy = 0; fy < s.floors; fy++) {
      const y0 = H - (fy + 1) * fh; // canvas y (top of this floor)
      if (s.hBand) {
        x.fillStyle = s.hBand;
        x.fillRect(0, y0 + fh * (s.hBandY || 0.9), W, fh * (s.hBandH || 0.1));
      }
      for (let bx = 0; bx < s.bays; bx++) {
        const X0 = bx * bw;
        const w = s.win || { x0: 0.25, x1: 0.75, y0: 0.2, y1: 0.8 };
        const wx0 = X0 + bw * w.x0,
          wx1 = X0 + bw * w.x1,
          wy0 = y0 + fh * (1 - w.y1),
          wy1 = y0 + fh * (1 - w.y0);
        if (s.spandrel) {
          x.fillStyle = s.spandrel;
          x.fillRect(wx0, y0, wx1 - wx0, fh);
        }
        if (s.pierShade) {
          x.fillStyle = "rgba(0,0,0," + s.pierShade + ")";
          x.fillRect(wx0 - 3, y0, 3, fh);
          x.fillStyle = "rgba(255,255,255," + s.pierShade * 0.6 + ")";
          x.fillRect(wx1, y0, 2, fh);
        }
        // frame
        x.fillStyle = s.frame || "#3a3a36";
        x.fillRect(wx0 - 2, wy0 - 2, wx1 - wx0 + 4, wy1 - wy0 + 4);
        const roll = r();
        let kind = "glass";
        if (roll < (s.broken || 0)) kind = "broken";
        else if (roll < (s.broken || 0) + (s.boarded || 0)) kind = "boarded";
        else if (roll < (s.broken || 0) + (s.boarded || 0) + lit) kind = "lit";
        if (kind === "glass" || kind === "lit") {
          const g = x.createLinearGradient(wx0, wy0, wx1, wy1);
          const gl = s.glass || "#2b3a3a";
          g.addColorStop(0, K.shadeHex(gl, 1.35 + r() * 0.3));
          g.addColorStop(0.55, gl);
          g.addColorStop(1, K.shadeHex(gl, 0.65));
          x.fillStyle = g;
          x.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
          if (kind === "lit") {
            x.fillStyle = s.litColor || "#ffcf80";
            x.globalAlpha = 0.85;
            x.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
            x.globalAlpha = 1;
            ex.fillStyle = s.litColor || "#ffcf80";
            ex.fillRect(wx0 / 2, wy0 / 2, (wx1 - wx0) / 2, (wy1 - wy0) / 2);
          }
          // mullions
          const mn = s.mullions === undefined ? 1 : s.mullions;
          x.fillStyle = s.frame || "#3a3a36";
          for (let m = 1; m <= mn; m++)
            x.fillRect(
              wx0 + ((wx1 - wx0) * m) / (mn + 1) - 1,
              wy0,
              2,
              wy1 - wy0,
            );
          if (s.transom !== false)
            x.fillRect(wx0, wy0 + (wy1 - wy0) * 0.38, wx1 - wx0, 2);
          // grime at sill
          x.fillStyle = "rgba(0,0,0,0.25)";
          x.fillRect(wx0, wy1 - 3, wx1 - wx0, 3);
        } else if (kind === "broken") {
          x.fillStyle = "#0b0c0b";
          x.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
          // jagged shards left in frame
          x.fillStyle = K.shadeHex(s.glass || "#2b3a3a", 1.2);
          x.beginPath();
          x.moveTo(wx0, wy0);
          x.lineTo(wx0 + (wx1 - wx0) * (0.2 + r() * 0.5), wy0);
          x.lineTo(wx0, wy0 + (wy1 - wy0) * (0.2 + r() * 0.4));
          x.fill();
          x.beginPath();
          x.moveTo(wx1, wy1);
          x.lineTo(wx1 - (wx1 - wx0) * (0.2 + r() * 0.4), wy1);
          x.lineTo(wx1, wy1 - (wy1 - wy0) * r() * 0.5);
          x.fill();
        } else {
          x.fillStyle = "#5a4630";
          x.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
          x.fillStyle = "rgba(0,0,0,0.35)";
          const n = 3 + Math.floor(r() * 3);
          for (let k = 0; k < n; k++)
            x.fillRect(
              wx0,
              wy0 + ((wy1 - wy0) * (k + 1)) / (n + 1),
              wx1 - wx0,
              2,
            );
        }
        // sill/lintel ornament
        if (s.sill) {
          x.fillStyle = s.sill;
          x.fillRect(wx0 - 4, wy1 + 1, wx1 - wx0 + 8, 4);
          if (s.lintel) x.fillRect(wx0 - 4, wy0 - 6, wx1 - wx0 + 8, 4);
        }
      }
      if (s.deco) s.deco(x, W, H, fy, y0, fh, bw, r);
    }
    // weathering
    K.streaks(x, W, H, 70, (s.seed || 1) + 11, 0.2);
    K.stains(x, W, H, 16, (s.seed || 1) + 12, 0.22);
    K.grain(x, W, H, 16, (s.seed || 1) + 13);
    const map = K.texFromCanvas(c);
    const def = {
      map,
      color: 0xffffff,
      tile: [s.bays * s.bayW, s.floors * s.floorH],
      rough: s.rough || 0.85,
      metal: s.metal || 0,
    };
    if (ec) {
      def.emissiveMap = K.texFromCanvas(ec);
      def.emissiveColor = 0xffffff;
      def.emissiveIntensity = 0.05;
      K.nightEmissive(key, 0.04, s.emissiveIntensity || 0.9);
    }
    K.defineMat(key, def);
    return def;
  };

  // ------------------------------------------------------------------
  // Atlases
  // ------------------------------------------------------------------
  K.initAtlases = function () {
    if (K.atlases.paint) return;
    const paint = (K.atlases.paint = new K.Atlas("paint", 2048, null, 2560)); // 2048×2560: round-1 signage filled 2048²
    const neon = (K.atlases.neon = new K.Atlas("neon", 2048, "#000", 1024));
    const ads = (K.atlases.ads = new K.Atlas("ads", 2048, "#222", 1536)); // 5×7 cells of 400×200: all 28 brands + a few alternates
    const flags = (K.atlases.flags = new K.Atlas("flags", 512, null, 512));
    K.defineMat("atlas_paint", {
      map: paint.tex,
      color: 0xffffff,
      rough: 0.8,
      alphaTest: 0.45,
      side: THREE.DoubleSide,
    });
    K.defineMat("atlas_paint_glow", {
      map: paint.tex,
      color: 0xffffff,
      rough: 0.6,
      alphaTest: 0.45,
      emissiveMap: paint.tex,
      emissiveColor: 0xffffff,
      emissiveIntensity: 0.55,
    });
    // Front-side only: a double-sided additive quad would superimpose a mirrored ghost of every sign
    // (two-sided signs use panel({both:true, off}) instead).
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
    K.defineMat("atlas_ads", {
      map: ads.tex,
      color: 0xffffff,
      rough: 0.75,
      emissiveMap: ads.tex,
      emissiveColor: 0xffffff,
      emissiveIntensity: 0.15,
    });
    // flags: standard material with a wind-wave vertex shader
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
            "  transformed += normal * (sin(uTime * 3.1 + fT * 6.5 + ph) * 0.55 + sin(uTime * 7.3 + fT * 13.0 + ph) * 0.12) * fT * 0.55;",
        );
    };
    fm.customProgramCacheKey = () => "lma_flag_wave";
    K.defineMat("flags", { material: fm, noShadow: true });
    K.flagMat = fm;
    // sky-light shafts (additive, gradient along v)
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
