// play-inline-12 01 — ctx
// Lines 20-293 of readable/play-inline-12.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._tx;
  const TAU = Math.PI * 2;

  // Every style shares ONE physical tile (4 bays × 6 storeys of 3.5 m = 14 m × 21 m) so that a
  // building can switch style without re-UVing and storeys line up across the whole city.
  // `cols` is the number of window columns actually drawn (office curtain walls use 2 per bay).
  const TILE = { bays: 4, floors: 6, bayW: 3.5, floorH: 3.5, w: 512, h: 768 };
  const STYLES = {
    tenement: Object.assign({ cols: 4, variants: 4 }, TILE),
    artdeco: Object.assign({ cols: 4, variants: 4 }, TILE),
    brownstone: Object.assign({ cols: 4, variants: 3 }, TILE),
    warehouse: Object.assign({ cols: 4, variants: 2 }, TILE),
    office: Object.assign({ cols: 8, variants: 3 }, TILE),
  };
  X.FACADE_STYLES = STYLES;
  const emissiveCanvas = {}; // facade name -> half-res emissive canvas
  const emissiveTex = {};
  const wantE = {}; // facade name -> true while an emissive re-paint is in progress
  // Interior-mapping window mask (half-res, linear): R = how much of the room shows through (glass ≈0.55–0.85,
  // holes 1, blinds/curtains/boards/frames 0), G = no glass (broken/empty/burnt hole, gaps between boards),
  // B = charred interior (burnt-out window). Read by the fake-room parallax branch of the façade shader (90_api.js).
  const maskCanvas = {},
    maskTex = {},
    wantM = {};
  /** Keep freshly painted emissive/mask canvases only if nobody has consumed them yet (or a re-paint asked for them). */
  let curE = null; // canvases of the façade being painted (paintWall snapshot → wall field)
  function storeE(name, E) {
    if (curE === E) curE = null;
    if (emissiveTex[name] === undefined || wantE[name])
      emissiveCanvas[name] = E.c;
    if (E.m && (maskTex[name] === undefined || wantM[name]))
      maskCanvas[name] = E.m.c;
  }
  // Mask colours: [R, G, B] as above.
  const MK_GLASS = "rgb(184,0,0)",
    MK_GLASS_LIT = "rgb(214,0,0)",
    MK_HOLE = "rgb(255,255,0)",
    MK_BURNT = "rgb(255,255,255)",
    MK_SHARD = "rgb(150,0,0)",
    MK_WIRED = "rgb(96,0,0)",
    MK_NONE = "#000";

  // ------------------------------------------------------------------
  // Wall fill at facade scale (≈ 30–40 px per metre)
  // ------------------------------------------------------------------
  // Ashlar kinds use a REGULAR grid (rows per 21 m tile × blocks per 14 m tile, running bond unless stagger:false) so the
  // façade shader's procedural wall detail (X.facadeWallSpec) can draw crisp joints exactly on top of the painted ones.
  const WALLS = {
    brick_red: {
      base: "#7e3a2a",
      var: 0.16,
      course: 3,
      joint: 8,
      mortar: "rgba(170,160,145,0.22)",
    },
    brick_tan: {
      base: "#a58c66",
      var: 0.12,
      course: 3,
      joint: 8,
      mortar: "rgba(90,80,65,0.22)",
    },
    brick_brown: {
      base: "#5a3e2e",
      var: 0.16,
      course: 3,
      joint: 8,
      mortar: "rgba(150,140,125,0.2)",
    },
    brick_cream: {
      base: "#b9ae94",
      var: 0.1,
      course: 3,
      joint: 8,
      mortar: "rgba(80,75,65,0.2)",
    },
    brick_dark: {
      base: "#3e2e26",
      var: 0.18,
      course: 3,
      joint: 8,
      mortar: "rgba(140,130,115,0.18)",
    },
    limestone: {
      base: "#b3aa92",
      var: 0.07,
      rows: 32,
      cols: 12,
      joint: "rgba(40,36,30,0.35)",
    },
    granite: {
      base: "#7a746e",
      var: 0.08,
      rows: 28,
      cols: 12,
      joint: "rgba(25,22,20,0.4)",
      speck: true,
    },
    brownstone: {
      base: "#5a3a2c",
      var: 0.1,
      rows: 24,
      cols: 10,
      joint: "rgba(25,15,10,0.35)",
    },
    stucco: { base: "#9a9282", var: 0.1 },
    concrete: {
      base: "#86837a",
      var: 0.1,
      rows: 12,
      cols: 4,
      stagger: false,
      joint: "rgba(30,28,24,0.3)",
    },
  };
  // Procedural wall detail for the façade shader (90_api.js): [kind (1 brick, 2 ashlar/panels, 3 render), units per tile U,
  // courses per tile V, stagger] and [offset U, offset V (cell units, aligns with the painted joints), joint half-width m, relief m].
  const WALL_SPEC = {
    brick: [
      [1, 64, 256, 1],
      [0.0625, -1 / 6, 0.0055, 0.009],
    ],
    limestone: [
      [2, 12, 32, 1],
      [0, 0, 0.0035, 0.007],
    ],
    granite: [
      [2, 12, 28, 1],
      [0, 0, 0.003, 0.006],
    ],
    brownstone: [
      [2, 10, 24, 1],
      [0, 0, 0.004, 0.008],
    ],
    concrete: [
      [2, 4, 12, 0],
      [0, 0, 0.008, 0.008],
    ],
    stucco: [
      [3, 1, 1, 0],
      [0, 0, 0, 0.0035],
    ],
  };
  const FACADE_TILE_PX = 768; // ashlar block height is defined per 768-px façade tile (trims share the px scale)
  function paintWall(ctx, x0, y0, w, h, kind, r, seed) {
    const K = WALLS[kind] || WALLS.stucco;
    const W = ctx.canvas.width,
      H = ctx.canvas.height;
    const n = X.fbm(W, H, { scale: 4, octaves: 5, seed: seed || 7 }),
      n2 = X.fbm(W, H, { scale: 48, octaves: 2, seed: (seed || 7) + 1 });
    const c = X.hex(K.base);
    const img = ctx.getImageData(x0, y0, w, h),
      d = img.data;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = (y0 + y) * W + (x0 + x),
          o = (y * w + x) * 4;
        const k =
          1 +
          (n[i] - 0.5) * K.var * 2.2 +
          (n2[i] - 0.5) * K.var +
          (r() - 0.5) * 0.06;
        d[o] = c[0] * k;
        d[o + 1] = c[1] * k;
        d[o + 2] = c[2] * k;
        d[o + 3] = 255;
      }
    ctx.putImageData(img, x0, y0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, y0, w, h);
    ctx.clip();
    if (K.course) {
      // brick coursing & per-brick tone
      for (let y = y0; y < y0 + h; y += K.course) {
        ctx.fillStyle = K.mortar;
        ctx.fillRect(x0, y, w, 1);
        const off = ((y / K.course) | 0) % 2 ? K.joint / 2 : 0;
        for (let x = x0 - off; x < x0 + w; x += K.joint) {
          if (r() < 0.35) {
            ctx.fillStyle =
              r() < 0.5 ? "rgba(0,0,0,0.12)" : "rgba(255,230,200,0.08)";
            ctx.fillRect(x, y + 1, K.joint - 1, K.course - 1);
          }
        }
      }
    }
    if (K.rows) {
      // regular ashlar / panel joints (per-block tone first, then the joints on top)
      const bh = FACADE_TILE_PX / K.rows,
        bw = W / K.cols;
      for (let k = Math.floor(y0 / bh); k * bh < y0 + h; k++) {
        const y = k * bh,
          off = K.stagger === false ? 0 : ((k % 2) * bw) / 2;
        for (let x = -off; x < W; x += bw) {
          const t = r();
          if (t < 0.6) {
            ctx.fillStyle =
              t < 0.3
                ? "rgba(0,0,0," + (0.03 + r() * 0.06).toFixed(3) + ")"
                : "rgba(255,245,225," + (0.02 + r() * 0.05).toFixed(3) + ")";
            ctx.fillRect(x, y, bw, bh);
          }
        }
        ctx.fillStyle = K.joint;
        ctx.fillRect(x0, y - 0.75, w, 1.5);
        for (let x = -off; x < W + bw; x += bw)
          ctx.fillRect(x - 0.75, y, 1.5, bh);
      }
    }
    if (K.speck)
      X.speckle(ctx, W, H, r, {
        count: (w * h) / 60,
        colors: ["#222", "#ddd", "#8a6a60"],
        min: 0.3,
        max: 0.9,
        alpha: 0.5,
      });
    ctx.restore();
    // façade atlases: remember the bare wall so weatherFacade can mark the untouched wall field in the window mask (B)
    if (curE && !curE.snap && x0 === 0 && y0 === 0 && w === W && h === H)
      curE.snap = ctx.getImageData(0, 0, W, H);
  }
  /**
   * Wall field → window-mask B channel (only where no window, R = G = 0): 255 where the atlas still shows the bare wall
   * painted by paintWall (or the same wall merely shaded/tinted), 0 on sills, lintels, frames, spandrels, AC units…
   * The façade shader draws procedural brick / ashlar joints and relief only on this field.
   */
  function markWallField(ctx, E, w, h) {
    const a = E.snap.data,
      b = ctx.getImageData(0, 0, w, h).data;
    const M = E.m,
      mw = M.w,
      mh = M.h,
      img = M.ctx.getImageData(0, 0, mw, mh),
      d = img.data;
    for (let y = 0; y < mh; y++)
      for (let x = 0; x < mw; x++) {
        const o = (y * mw + x) * 4;
        if (d[o] > 3 || d[o + 1] > 3) continue;
        let s = 0;
        for (let q = 0; q < 4; q++) {
          const i = (((y << 1) + (q >> 1)) * w + (x << 1) + (q & 1)) * 4;
          const kr = (b[i] + 2) / (a[i] + 2),
            kg = (b[i + 1] + 2) / (a[i + 1] + 2),
            kb = (b[i + 2] + 2) / (a[i + 2] + 2);
          const mx = Math.max(kr, kg, kb),
            mn = Math.min(kr, kg, kb);
          if (mn > 0.5 && mx < 1.4 && mx < mn * 1.16) s++;
        }
        d[o + 2] = s * 63.75;
      }
    M.ctx.putImageData(img, 0, 0);
  }
  X.paintWall = paintWall;

  // ------------------------------------------------------------------
  // Window renderer
  // ------------------------------------------------------------------
  const CURTAINS = [
    "#8a6a4a",
    "#6a7a5a",
    "#9a8a6a",
    "#7a4a3a",
    "#5a6a7a",
    "#a89a78",
    "#6a5a6a",
  ];
  /**
   * Cracked (but intact) pane. Three distinct shapes so a curtain wall never shows the same starburst twice:
   * a bullet spiderweb (radial + ring segments), a long stress crack corner-to-edge, or a small corner chip.
   */
