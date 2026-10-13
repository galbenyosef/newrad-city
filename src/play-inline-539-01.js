// play-inline-539 01 — pal
// Lines 12-344 of readable/play-inline-539.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const AR = G.arcade._;

  // ------------------------------------------------------------------
  // Palettes. pal.c / hi / dim / al[i] = the game's "main" ink (al[i] = alpha i/10),
  // plus a fixed full-colour arcade set: pal.red, orange, yellow, cyan, blue, magenta,
  // white, grey, brown, purple, silver, skin — each with an alpha table pal.A.<name>[i].
  // All strings precomputed (no per-frame string building).
  // ------------------------------------------------------------------
  const COLS = {
    red: [255, 74, 61],
    orange: [255, 140, 40],
    yellow: [255, 214, 64],
    cyan: [96, 224, 255],
    blue: [64, 120, 255],
    magenta: [255, 80, 170],
    white: [255, 255, 255],
    grey: [140, 146, 160],
    brown: [150, 98, 60],
    purple: [150, 90, 230],
    silver: [200, 210, 220],
    skin: [240, 192, 144],
    teal: [60, 190, 200],
  };
  const alphas = (r, g, b) => {
    const a = [];
    for (let i = 0; i <= 10; i++)
      a.push("rgba(" + r + "," + g + "," + b + "," + i / 10 + ")");
    return a;
  };
  function makePalette(rgb, bg) {
    const [r, g, b] = rgb;
    const al = alphas(r, g, b);
    const mix = (k) =>
      "rgb(" +
      Math.round(r + (255 - r) * k) +
      "," +
      Math.round(g + (255 - g) * k) +
      "," +
      Math.round(b + (255 - b) * k) +
      ")";
    const P = {
      rgb,
      al,
      c: "rgb(" + r + "," + g + "," + b + ")", // main ink
      hi: mix(0.62), // over-driven highlight
      dim: al[5],
      dark: al[2],
      faint: al[1],
      bg: bg || "rgb(6,8,16)",
      A: {},
    };
    for (const k in COLS) {
      const q = COLS[k];
      P[k] = "rgb(" + q[0] + "," + q[1] + "," + q[2] + ")";
      P.A[k] = alphas(q[0], q[1], q[2]);
    }
    return P;
  }
  AR.makePalette = makePalette;
  const GAME_PAL = {
    skypatrol: makePalette([190, 232, 255], "rgb(6,9,30)"),
    catacomb: makePalette([255, 216, 160], "rgb(10,6,4)"),
    steelworks: makePalette([255, 226, 192], "rgb(12,6,20)"),
  };
  const DEFAULT_PAL = makePalette([230, 236, 255], "rgb(6,8,16)");
  /** The raster palette of a game (full colour; the main ink differs per cabinet). */
  AR.palette = (gameId) => GAME_PAL[gameId] || DEFAULT_PAL;
  /** The ledger (goggles look): cyan-white ink on near-black. */
  AR.ledgerPal = makePalette([207, 238, 250], "rgb(4,10,14)");

  // ------------------------------------------------------------------
  // Pixel sprites: rows of chars → canvas.
  //   '#' = main ink (bright: highlight), '+' = half ink, '-' = faint ink, '.' / ' ' = clear
  //   letters = colours: r red, o orange, y yellow, c cyan, b blue, m magenta, w white,
  //   g grey, n brown, p purple, s silver, k skin, t teal
  //   bright=false → the dim variant (hit flash / remembered tiles): everything at 55 %
  // ------------------------------------------------------------------
  const LETTER = {
    r: "red",
    o: "orange",
    y: "yellow",
    c: "cyan",
    b: "blue",
    m: "magenta",
    w: "white",
    g: "grey",
    n: "brown",
    p: "purple",
    s: "silver",
    k: "skin",
    t: "teal",
  };
  AR.spriteCache = new Map();
  AR.sprite = function (key, rows, px, pal, bright) {
    const k = key + "|" + px + "|" + (bright ? 1 : 0) + "|" + pal.c;
    let c = AR.spriteCache.get(k);
    if (c) return c;
    const w = rows[0].length,
      h = rows.length;
    c = document.createElement("canvas");
    c.width = w * px;
    c.height = h * px;
    const x = c.getContext("2d");
    x.globalAlpha = bright ? 1 : 0.55;
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const ch = rows[j][i];
        if (ch === "#") x.fillStyle = bright ? pal.hi : pal.c;
        else if (ch === "+") x.fillStyle = pal.al[6];
        else if (ch === "-") x.fillStyle = pal.al[3];
        else if (LETTER[ch]) x.fillStyle = pal[LETTER[ch]];
        else continue;
        x.fillRect(i * px, j * px, px, px);
      }
    AR.spriteCache.set(k, c);
    return c;
  };

  // ------------------------------------------------------------------
  // Landmark silhouettes (unit space: x ∈ ~[-0.5, 0.5] around the centre, y up from 0)
  // ------------------------------------------------------------------
  const L = {};
  L.empire = {
    poly: [
      [-0.5, 0],
      [-0.5, 1.2],
      [-0.4, 1.2],
      [-0.4, 1.9],
      [-0.3, 1.9],
      [-0.3, 2.3],
      [-0.2, 2.3],
      [-0.2, 2.55],
      [-0.11, 2.55],
      [-0.11, 2.75],
      [-0.035, 2.75],
      [-0.035, 3.25],
      [0.035, 3.25],
      [0.035, 2.75],
      [0.11, 2.75],
      [0.11, 2.55],
      [0.2, 2.55],
      [0.2, 2.3],
      [0.3, 2.3],
      [0.3, 1.9],
      [0.4, 1.9],
      [0.4, 1.2],
      [0.5, 1.2],
      [0.5, 0],
    ],
    windows: { x0: -0.4, x1: 0.4, y0: 0.15, y1: 2.2, cols: 5, rows: 11 },
  };
  L.chrysler = {
    poly: [
      [-0.4, 0],
      [-0.4, 1.6],
      [-0.3, 1.6],
      [-0.3, 2.1],
      [-0.26, 2.25],
      [-0.2, 2.36],
      [-0.16, 2.5],
      [-0.11, 2.62],
      [-0.07, 2.76],
      [-0.025, 2.92],
      [0, 3.4],
      [0.025, 2.92],
      [0.07, 2.76],
      [0.11, 2.62],
      [0.16, 2.5],
      [0.2, 2.36],
      [0.26, 2.25],
      [0.3, 2.1],
      [0.3, 1.6],
      [0.4, 1.6],
      [0.4, 0],
    ],
    windows: { x0: -0.3, x1: 0.3, y0: 0.15, y1: 2.0, cols: 4, rows: 10 },
    arcs: [
      [0, 2.1, 0.26],
      [0, 2.3, 0.19],
      [0, 2.5, 0.13],
    ],
  };
  L.flatiron = {
    poly: [
      [-0.46, 0],
      [-0.46, 1.28],
      [-0.43, 1.36],
      [0.43, 1.36],
      [0.46, 1.28],
      [0.46, 0],
    ],
    windows: { x0: -0.4, x1: 0.4, y0: 0.12, y1: 1.2, cols: 7, rows: 8 },
    lines: [[0.3, 0, 0.3, 1.36]],
  };
  L.woolworth = {
    poly: [
      [-0.48, 0],
      [-0.48, 1.1],
      [-0.22, 1.1],
      [-0.22, 2.1],
      [-0.17, 2.2],
      [-0.17, 2.34],
      [-0.1, 2.44],
      [0, 2.8],
      [0.1, 2.44],
      [0.17, 2.34],
      [0.17, 2.2],
      [0.22, 2.1],
      [0.22, 1.1],
      [0.48, 1.1],
      [0.48, 0],
    ],
    windows: { x0: -0.18, x1: 0.18, y0: 1.15, y1: 2.0, cols: 3, rows: 7 },
    lines: [
      [-0.2, 2.1, -0.2, 2.28],
      [0.2, 2.1, 0.2, 2.28],
    ],
  };
  L.liberty = {
    poly: [
      [-0.42, 0],
      [-0.3, 0.12],
      [-0.22, 0.12],
      [-0.22, 0.85],
      [-0.12, 0.9],
      [-0.1, 1.45],
      [-0.14, 1.52],
      [-0.07, 1.62],
      [-0.05, 1.72],
      [-0.02, 1.8],
      [0.03, 1.8],
      [0.06, 1.7],
      [0.08, 1.62],
      [0.12, 1.62],
      [0.14, 1.95],
      [0.1, 2.02],
      [0.14, 2.12],
      [0.19, 2.02],
      [0.17, 1.95],
      [0.16, 1.55],
      [0.1, 1.45],
      [0.12, 0.9],
      [0.22, 0.85],
      [0.22, 0.12],
      [0.3, 0.12],
      [0.42, 0],
    ],
    lines: [
      [-0.06, 1.76, -0.13, 1.84],
      [0.0, 1.8, 0.0, 1.9],
      [0.05, 1.77, 0.12, 1.84],
    ],
  };
  L.grand_central = {
    poly: [
      [-0.7, 0],
      [-0.7, 0.62],
      [-0.2, 0.62],
      [-0.2, 0.74],
      [-0.08, 0.86],
      [0.08, 0.86],
      [0.2, 0.74],
      [0.2, 0.62],
      [0.7, 0.62],
      [0.7, 0],
    ],
    arches: [
      [-0.35, 0.05, 0.13, 0.45],
      [0, 0.05, 0.13, 0.45],
      [0.35, 0.05, 0.13, 0.45],
    ],
    clock: [0, 0.72, 0.07],
  };
  L.times_square = {
    poly: [
      [-0.62, 0],
      [-0.62, 0.9],
      [-0.36, 0.9],
      [-0.36, 1.35],
      [-0.12, 1.35],
      [-0.12, 1.7],
      [0, 1.78],
      [0.12, 1.7],
      [0.12, 1.2],
      [0.4, 1.2],
      [0.4, 0.7],
      [0.62, 0.7],
      [0.62, 0],
    ],
    boards: [
      [-0.58, 0.35, 0.18, 0.3],
      [-0.33, 0.95, 0.18, 0.25],
      [-0.09, 1.1, 0.18, 0.4],
      [0.16, 0.8, 0.2, 0.3],
      [0.43, 0.25, 0.15, 0.35],
    ],
    ball: [0, 1.86, 0.05],
  };
  L.central_park = {
    poly: [
      [-0.6, 0],
      [-0.6, 0.1],
      [-0.35, 0.18],
      [-0.1, 0.2],
      [-0.07, 0.62],
      [-0.2, 0.8],
      [-0.05, 0.72],
      [-0.02, 0.9],
      [0.02, 0.9],
      [0.05, 0.72],
      [0.2, 0.8],
      [0.07, 0.62],
      [0.1, 0.2],
      [0.35, 0.18],
      [0.6, 0.1],
      [0.6, 0],
    ],
    trees: [
      [-0.48, 0.1, 0.13],
      [0.5, 0.1, 0.12],
      [-0.3, 0.14, 0.09],
    ],
  };
  L.bridge = { towers: [-0.3, 0.3], deckY: 0.55, towerH: 1.6, towerW: 0.16 };
  AR.LANDMARK_KINDS = Object.keys(L);

  /**
   * Draw a landmark silhouette.
   * cx, baseY: canvas coords of the base centre; s: pixels per unit; fill/stroke: styles (null to skip)
   * opts.windows: draw lit windows (flicker seed t); opts.lw: line width
   */
