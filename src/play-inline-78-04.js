// play-inline-78 04 — ctx
// Lines 1067-1411 of readable/play-inline-78.pretty.js (statement-aligned).
  M.mtx = function (x, y, z, ry, rx, rz, sc) {
    _e.set(rx || 0, ry || 0, rz || 0, "YXZ");
    _q.setFromEuler(_e);
    if (sc === undefined) _s.set(1, 1, 1);
    else if (typeof sc === "number") _s.set(sc, sc, sc);
    else _s.set(sc[0], sc[1], sc[2]);
    _p.set(x, y, z);
    return new THREE.Matrix4().compose(_p, _q, _s);
  };

  // -------------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------------
  // Metres per texture repeat for world-planar mapped materials.
  // (matches the textures module's `meters per tile`, see src/textures/NOTES.md)
  M.TEX_SCALE = {
    asphalt: 8,
    asphalt_lines: 8,
    sidewalk: 3,
    concrete: 4,
    concrete_dark: 4,
    brick_red: 2.7,
    brick_brown: 2.7,
    brick_tan: 2.7,
    stone_limestone: 4,
    granite: 3,
    rust: 2,
    metal_painted: 2,
    metal_panel: 2,
    corrugated: 2,
    wood_rotten: 2,
    wood_planks: 2,
    plaster_stained: 3,
    tile_cryo: 2,
    cryo_wall: 4,
    dirt: 4,
    grass_dead: 4,
    rubble: 4,
    glass_dirty: 2,
    water: 12,
    fabric: 0.5,
    chrome: 2,
    cryo_grey: 2,
    cryo_orange: 2,
    paint_red: 2,
    paint_teal: 2,
    roof_tar: 4,
    curb: 2,
    tile_floor: 2,
    carpet: 2,
    wallpaper: 2,
    terrazzo: 2,
    marble: 3,
    marble_dark: 3,
    tile_subway: 1.2,
    metal_diamond: 1,
    crate_wood: 1,
    cardboard: 0.8,
    concrete_panel: 6,
    brick_white: 2.7,
    metal_scratched: 1,
    stone_brownstone: 3,
  };
  M.sc = (name) => M.TEX_SCALE[name] || 4;

  // Façade atlas layout assumption (one texture repeat = BAYS bays × FLOORS floors).
  // Adjusted at init if the textures module publishes G.tex.facadeInfo.
  M.FACADE = { bayW: 3.0, floorH: 3.5, bays: 4, floors: 4 };
  M.facadeTile = () => ({
    w: M.FACADE.bayW * M.FACADE.bays,
    h: M.FACADE.floorH * M.FACADE.floors,
  });

  const matCache = new Map();
  const texCache = new Map();
  /** Shared fallback / map-owned texture cache. */
  M.texCache = texCache;

  function finishTex(t, srgb) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  }
  M.finishTex = finishTex;
  /**
   * Cut-out atlases (weeds, twigs): a canvas upload loses the colour of fully transparent pixels (they become
   * black), so the GPU mip chain darkens every stroke towards black — tufts read as black silhouettes beyond
   * a few metres. This copies the canvas into a DataTexture whose transparent texels carry `fill` (RGB 0–255)
   * instead, so mips keep the straw colour. Rows are flipped to match a CanvasTexture's default flipY.
   */
  M.cutoutTex = function (cv, fill) {
    const w = cv.width,
      h = cv.height;
    const src = cv.getContext("2d").getImageData(0, 0, w, h).data;
    const out = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) {
      const sy = (h - 1 - y) * w * 4,
        dy = y * w * 4;
      for (let x = 0; x < w * 4; x += 4) {
        const a = src[sy + x + 3];
        if (a < 250) {
          // blend the (un-premultiplied) stroke colour into the fill by coverage: soft edges keep their hue
          const k = a / 255;
          out[dy + x] = src[sy + x] * k + fill[0] * (1 - k);
          out[dy + x + 1] = src[sy + x + 1] * k + fill[1] * (1 - k);
          out[dy + x + 2] = src[sy + x + 2] * k + fill[2] * (1 - k);
        } else {
          out[dy + x] = src[sy + x];
          out[dy + x + 1] = src[sy + x + 1];
          out[dy + x + 2] = src[sy + x + 2];
        }
        out[dy + x + 3] = a;
      }
    }
    const t = new THREE.DataTexture(out, w, h, THREE.RGBAFormat);
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.needsUpdate = true;
    return t;
  };
  M.canvas = function (w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };

  // --- Procedural fallback textures (used only when the textures module is absent) ---
  const FB = {
    asphalt: { base: "#3b3a37", noise: 38, speck: "#5a5750", cracks: 6 },
    asphalt_lines: { base: "#3b3a37", noise: 38, speck: "#5a5750", cracks: 6 },
    sidewalk: {
      base: "#8b877c",
      noise: 22,
      grid: 2,
      gridCol: "rgba(40,38,32,0.55)",
      cracks: 3,
    },
    concrete: { base: "#8a867b", noise: 26, blotch: 10 },
    concrete_dark: { base: "#57544d", noise: 26, blotch: 10 },
    brick_red: { brick: "#7a3b2a", mortar: "#8a8274" },
    brick_brown: { brick: "#5b3a2c", mortar: "#7d766a" },
    brick_tan: { brick: "#a08462", mortar: "#8e877a" },
    stone_limestone: { base: "#b3aa94", noise: 18, blocks: [2, 4] },
    granite: { base: "#77746d", noise: 34, blocks: [3, 3] },
    rust: { base: "#6b3f25", noise: 40, blotch: 22, blotchCol: "#8a5230" },
    metal_painted: {
      base: "#4f5a55",
      noise: 18,
      blotch: 12,
      blotchCol: "#6b3f25",
    },
    metal_panel: {
      base: "#676c68",
      noise: 14,
      grid: 2,
      gridCol: "rgba(20,20,20,0.6)",
    },
    corrugated: {
      base: "#6e6a60",
      stripes: 16,
      blotch: 10,
      blotchCol: "#6b3f25",
    },
    wood_rotten: { base: "#5a4630", planks: 6 },
    wood_planks: { base: "#7a6040", planks: 6 },
    plaster_stained: {
      base: "#a79f8c",
      noise: 16,
      blotch: 14,
      blotchCol: "#7e7461",
    },
    tile_cryo: {
      base: "#8d9496",
      noise: 10,
      grid: 4,
      gridCol: "rgba(30,34,36,0.7)",
    },
    cryo_wall: {
      base: "#5d6e78",
      noise: 12,
      grid: 1,
      gridCol: "rgba(20,26,30,0.7)",
      rivets: true,
    },
    dirt: { base: "#5c4f3a", noise: 34, blotch: 14 },
    grass_dead: { base: "#6b6440", noise: 40, blades: true },
    rubble: { base: "#6e675b", noise: 50, chunks: true },
    glass_dirty: { base: "#27302e", noise: 14 },
    water: { base: "#2e3a26", noise: 12 },
    fabric: { base: "#8a7e6a", noise: 20 },
  };
  function fallbackTexture(name) {
    if (texCache.has("fb:" + name)) return texCache.get("fb:" + name);
    const f = FB[name] || { base: "#808080", noise: 20 };
    const S = 256,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng("fb" + name);
    ctx.fillStyle = f.base || "#808080";
    ctx.fillRect(0, 0, S, S);
    if (f.brick) {
      ctx.fillStyle = f.mortar;
      ctx.fillRect(0, 0, S, S);
      const bh = 16,
        bw = 42;
      for (let y = 0; y < S; y += bh)
        for (let x = -bw; x < S; x += bw) {
          const off = (((y / bh) % 2) * bw) / 2;
          const k = 0.8 + r() * 0.35;
          const c = new THREE.Color(f.brick).multiplyScalar(k);
          ctx.fillStyle = "#" + c.getHexString();
          ctx.fillRect(x + off + 1, y + 1, bw - 3, bh - 3);
        }
    }
    if (f.noise) {
      const img = ctx.getImageData(0, 0, S, S),
        d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const n = (r() - 0.5) * f.noise;
        d[i] += n;
        d[i + 1] += n;
        d[i + 2] += n;
      }
      ctx.putImageData(img, 0, 0);
    }
    if (f.blotch)
      for (let i = 0; i < f.blotch; i++) {
        ctx.globalAlpha = 0.08 + r() * 0.15;
        ctx.fillStyle = f.blotchCol || "#000";
        ctx.beginPath();
        ctx.arc(r() * S, r() * S, 8 + r() * 40, 0, 7);
        ctx.fill();
      }
    ctx.globalAlpha = 1;
    if (f.grid) {
      ctx.strokeStyle = f.gridCol;
      ctx.lineWidth = 2;
      const st = S / f.grid;
      for (let i = 0; i <= f.grid; i++) {
        ctx.beginPath();
        ctx.moveTo(i * st, 0);
        ctx.lineTo(i * st, S);
        ctx.moveTo(0, i * st);
        ctx.lineTo(S, i * st);
        ctx.stroke();
      }
    }
    if (f.rivets) {
      ctx.fillStyle = "rgba(15,20,24,0.8)";
      for (let i = 8; i < S; i += 32) {
        ctx.fillRect(i, 6, 3, 3);
        ctx.fillRect(i, S - 9, 3, 3);
      }
    }
    if (f.blocks) {
      ctx.strokeStyle = "rgba(40,36,30,0.45)";
      ctx.lineWidth = 2;
      const bw = S / f.blocks[0],
        bh = S / f.blocks[1];
      for (let y = 0; y < f.blocks[1]; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * bh);
        ctx.lineTo(S, y * bh);
        ctx.stroke();
        for (let x = 0; x < f.blocks[0]; x++) {
          const xx = x * bw + ((y % 2) * bw) / 2;
          ctx.beginPath();
          ctx.moveTo(xx, y * bh);
          ctx.lineTo(xx, (y + 1) * bh);
          ctx.stroke();
        }
      }
    }
    if (f.stripes) {
      for (let i = 0; i < f.stripes; i++) {
        const x = (i * S) / f.stripes;
        const g = ctx.createLinearGradient(x, 0, x + S / f.stripes, 0);
        g.addColorStop(0, "rgba(0,0,0,0.25)");
        g.addColorStop(0.5, "rgba(255,255,255,0.12)");
        g.addColorStop(1, "rgba(0,0,0,0.25)");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, S / f.stripes, S);
      }
    }
    if (f.planks) {
      for (let i = 0; i < f.planks; i++) {
        ctx.fillStyle = "rgba(0,0,0," + (0.1 + r() * 0.2) + ")";
        ctx.fillRect(0, (i * S) / f.planks, S, 2);
        ctx.fillStyle = "rgba(255,230,190," + r() * 0.08 + ")";
        ctx.fillRect(0, (i * S) / f.planks + 3, S, S / f.planks - 5);
      }
    }
    if (f.cracks) {
      ctx.strokeStyle = "rgba(15,15,12,0.55)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < f.cracks; i++) {
        let x = r() * S,
          y = r() * S;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let k = 0; k < 8; k++) {
          x += (r() - 0.5) * 40;
          y += (r() - 0.5) * 40;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    if (f.speck) {
      ctx.fillStyle = f.speck;
      for (let i = 0; i < 500; i++) ctx.fillRect(r() * S, r() * S, 1.5, 1.5);
    }
    if (f.blades) {
      for (let i = 0; i < 900; i++) {
        ctx.strokeStyle =
          r() < 0.5 ? "rgba(120,110,60,0.5)" : "rgba(60,55,30,0.5)";
        const x = r() * S,
          y = r() * S;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (r() - 0.5) * 4, y - 4 - r() * 6);
        ctx.stroke();
      }
    }
    if (f.chunks) {
      for (let i = 0; i < 160; i++) {
        const k = (60 + r() * 90) | 0;
        ctx.fillStyle = "rgb(" + k + "," + (k - 6) + "," + (k - 14) + ")";
        ctx.fillRect(r() * S, r() * S, 3 + r() * 12, 3 + r() * 9);
      }
    }
    const t = finishTex(new THREE.CanvasTexture(cv));
    texCache.set("fb:" + name, t);
    return t;
  }
  M.fallbackTexture = fallbackTexture;

  /** Fallback façade atlas (4 bays × 4 floors) for style/variant. */
