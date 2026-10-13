// play-inline-171 02 — wx0
// Lines 17-346 of readable/play-inline-171.pretty.js (statement-aligned).
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
