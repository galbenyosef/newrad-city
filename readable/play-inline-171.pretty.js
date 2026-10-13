/* src/poi_midtown/02_mats.js */
/* =====================================================================
 * NEW RAD CITY — poi_midtown / 02_mats.js
 * Materials (G.tex surfaces with procedural fallbacks), façade window
 * grids (K.facade, adapted from landmarks_a), the POI atlases:
 *   'paint'  — opaque painted signs, plaques, clock faces, murals, posters
 *   'lit'    — self-lit (unlit) art: back-lit clock dials, marquee boards,
 *              departure boards, lamp shades, K-agent tank glow
 *   'neon'   — additive glowing tubes / text
 * plus the waving-flag material and additive light shafts.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.PMID) return;
  const K = G.PMID.kit;
  const U = G.util;

  // ------------------------------------------------------------------
  // Surface materials (G.tex names; fallbacks drawn by the kit)
  // ------------------------------------------------------------------
  const M = K.MATDEF;
  Object.assign(M, {
    marble_t: {
      custom: "marble",
      color: 0xffffff,
      tile: [2.4, 2.4],
      rough: 0.3,
    },
    marble_black: {
      custom: "marble",
      color: 0x4a4644,
      tile: [2.4, 2.4],
      rough: 0.22,
    },
    burlap: {
      tex: "burlap",
      fb: "fabric",
      color: 0xffffff,
      tile: [0.8, 0.8],
      rough: 1,
    },
    terrazzo: {
      tex: "terrazzo",
      fb: "blocks",
      color: 0xd8d2c4,
      tile: [2, 2],
      rough: 0.5,
    },
    wallpaper: {
      tex: "wallpaper",
      fb: "fabric",
      color: 0xffffff,
      tile: [2, 2],
      rough: 0.95,
    },
    tile_white: {
      tex: "tile_subway",
      fb: "blocks",
      color: 0xf2f0e8,
      tile: [1.2, 1.2],
      rough: 0.4,
    },
    tile_floor: {
      tex: "tile_floor",
      fb: "blocks",
      color: 0xffffff,
      tile: [2, 2],
      rough: 0.55,
    },
    carpet_t: {
      tex: "carpet",
      fb: "fabric",
      color: 0xffffff,
      tile: [2, 2],
      rough: 1,
    },
    copper: {
      tex: "copper_patina",
      fb: "metal",
      color: 0xffffff,
      tile: [3, 3],
      rough: 0.7,
      metal: 0.3,
    },
    bronze_t: {
      tex: "bronze",
      fb: "metal",
      color: 0xffffff,
      tile: [2, 2],
      rough: 0.45,
      metal: 0.6,
    },
    plate: {
      tex: "metal_diamond",
      fb: "metal",
      color: 0xb8bab4,
      tile: [1, 1],
      rough: 0.55,
      metal: 0.5,
    },
    concrete_panel: {
      tex: "concrete_panel",
      fb: "noise",
      color: 0xc8c4bc,
      tile: [6, 6],
      rough: 0.95,
    },
    glass_dirty: {
      tex: "glass_dirty",
      fb: "noise",
      color: 0x9aa8a4,
      tile: [2, 2],
      rough: 0.2,
      metal: 0.5,
    },
    brick_white: {
      tex: "brick_white",
      fb: "brick",
      color: 0xe0dcd0,
      tile: [3, 3],
      rough: 0.95,
    },
    lamp_warm: { basic: true, color: 0xffffff, unlit: true, noShadow: true },
    black: { color: 0x0a0a0a, rough: 1, flat: true },
    glass_clear: {
      color: 0xb8e0c8,
      rough: 0.08,
      metal: 0.4,
      flat: true,
      transparent: true,
      opacity: 0.22,
      noShadow: true,
    },
    paper_base: { color: 0xffffff, rough: 0.95, flat: true },
  });
  Object.assign(K.ALIASES, {
    marble_green: ["marble_t", 0x6a8a74],
    marble_rose: ["marble_t", 0xd8a898],
    marble_cream: ["marble_t", 0xf2e6cc],
    carpet_red: ["carpet_t", 0xb04040],
    carpet_blue: ["carpet_t", 0x5a6a9a],
    carpet_green: ["carpet_t", 0x6a8a5a],
    wall_green: ["plaster_base", 0x8aa08a],
    wall_cream: ["plaster_base", 0xe0d4b4],
    wall_hosp: ["plaster_base", 0xb8c8b4],
    wall_grey: ["plaster_base", 0xa8a8a0],
    tile_green: ["tile_white", 0xa8c8b0],
    tile_cream: ["tile_white", 0xe8dcc0],
    mahogany: ["wood", 0x6a3a26],
    oak: ["wood", 0xa07a50],
    walnut: ["wood", 0x4e3222],
    leather_red: ["fabric", 0x7a2a22],
    leather_brown: ["fabric", 0x5a3a26],
    velvet_red: ["fabric", 0x8a1a1a],
    cloth_white: ["fabric", 0xe8e4d8],
    cloth_green: ["fabric", 0x7a9a80],
    continuity_black: ["metal_dark", 0x1c1e20],
    army_green: ["metal", 0x4a5638],
    hosp_green: ["metal", 0x7a9a84],
    hosp_white: ["metal", 0xd8dcd4],
    lamp_amber: ["lamp_warm", 0xffc070],
    lamp_white: ["lamp_warm", 0xf0f4ff],
    lamp_green: ["lamp_warm", 0x70ff90],
    lamp_red: ["lamp_warm", 0xff4030],
    lamp_blue: ["lamp_warm", 0x80b0ff],
    lamp_fev: ["lamp_warm", 0x60ff70],
    nickel: ["steel", 0xd0d4d0],
    paper: ["paper_base", 0xd8d0b8],
    gunmetal: ["metal_dark", 0x3a3e40],
    gold_leaf: ["brass_base", 0xe8c060],
    copper_cap: ["copper", 0xffffff],
  });

  // ------------------------------------------------------------------
  // Façades (window grids) — adapted from landmarks_a/02_textures.js
  // ------------------------------------------------------------------
  K.facadeSpecs = K.facadeSpecs || {};
  K.facade = function (key, s) {
    K.facadeSpecs[key] = s; // K.reveals reads the window grid back to add 3D surrounds that line up with the paint
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
  /** Clean procedural plaster (the shared 'plaster_stained' reads as leopard spots at interior scale). */
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

  K.star = function (x, cx, cy, R, r, col) {
    x.fillStyle = col;
    x.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r : R,
        a = -Math.PI / 2 + (i * Math.PI) / 5;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    x.closePath();
    x.fill();
  };
  K.skull = function (x, cx, cy, s, col) {
    x.fillStyle = col;
    x.beginPath();
    x.arc(cx, cy - s * 0.15, s * 0.6, Math.PI, 0);
    x.lineTo(cx + s * 0.45, cy + s * 0.35);
    x.lineTo(cx - s * 0.45, cy + s * 0.35);
    x.fill();
    x.fillRect(cx - s * 0.3, cy + s * 0.3, s * 0.6, s * 0.3);
    x.fillStyle = "#111";
    x.beginPath();
    x.arc(cx - s * 0.22, cy, s * 0.14, 0, 7);
    x.arc(cx + s * 0.22, cy, s * 0.14, 0, 7);
    x.fill();
    x.fillRect(cx - s * 0.04, cy + s * 0.12, s * 0.08, s * 0.14);
    x.strokeStyle = col;
    x.lineWidth = s * 0.1;
    x.beginPath();
    x.moveTo(cx - s, cy - s * 0.6);
    x.lineTo(cx + s, cy + s);
    x.moveTo(cx + s, cy - s * 0.6);
    x.lineTo(cx - s, cy + s);
    x.stroke();
  };

  /** Painted text helper: fits `text` into width w at max size px. */
  K.fitText = function (x, text, cx, cy, w, px, font, fill, stroke, lw) {
    let size = px;
    x.font =
      (font || "bold ") +
      size +
      "px " +
      (K.FONT || 'Georgia, "Times New Roman", serif');
    while (x.measureText(text).width > w && size > 8) {
      size -= 2;
      x.font =
        (font || "bold ") +
        size +
        "px " +
        (K.FONT || 'Georgia, "Times New Roman", serif');
    }
    x.textAlign = "center";
    x.textBaseline = "middle";
    if (stroke) {
      x.strokeStyle = stroke;
      x.lineWidth = lw || 4;
      x.strokeText(text, cx, cy);
    }
    if (fill) {
      x.fillStyle = fill;
      x.fillText(text, cx, cy);
    }
    return size;
  };
  K.FONT = 'Georgia, "Times New Roman", serif';
  K.SANS = '"Arial Black", Impact, "Helvetica Neue", sans-serif';
  /** Weathering pass for painted slots. */
  K.weather = function (x, w, h, seed, amt) {
    K.stains(x, w, h, Math.round(6 * (amt || 1)), seed || 7, 0.28 * (amt || 1));
    K.streaks(
      x,
      w,
      h,
      Math.round(12 * (amt || 1)),
      (seed || 7) + 1,
      0.16 * (amt || 1),
    );
    K.grain(x, w, h, 18, (seed || 7) + 2);
  };
})();
