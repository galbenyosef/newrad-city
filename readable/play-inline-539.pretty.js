/* src/arcade/15_art.js */
/* =====================================================================
 * arcade — 15_art.js
 * Shared 2D vector / pixel art for the cabinet screens and the ledger:
 * NYC landmark silhouettes (Sky Patrol's cities and the miniature
 * viewer), multi-colour pixel sprites from ASCII rows, the raster
 * palettes (one full-colour palette per game; the ledger uses the
 * goggles' cyan-white), marquee title art.
 * Everything is drawn with plain canvas calls — no per-frame allocations.
 * ===================================================================== */
(function () {
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
  AR.drawLandmark = function (c, kind, cx, baseY, s, fill, stroke, opts) {
    const d = L[kind];
    if (!d) return;
    opts = opts || {};
    c.lineWidth = opts.lw || 1.5;
    if (kind === "bridge") {
      drawBridge(c, d, cx, baseY, s, fill, stroke);
      return;
    }
    c.beginPath();
    const p = d.poly;
    c.moveTo(cx + p[0][0] * s, baseY - p[0][1] * s);
    for (let i = 1; i < p.length; i++)
      c.lineTo(cx + p[i][0] * s, baseY - p[i][1] * s);
    c.closePath();
    if (fill) {
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.stroke();
    }
    const det = opts.detail || stroke;
    if (!det) return;
    c.strokeStyle = det;
    c.fillStyle = det;
    if (d.windows && opts.windows !== false) {
      const w = d.windows,
        cw = (w.x1 - w.x0) / w.cols,
        rh = (w.y1 - w.y0) / w.rows,
        ww = Math.max(1, cw * s * 0.4),
        wh = Math.max(1, rh * s * 0.45);
      const seed = opts.seed || 0;
      for (let j = 0; j < w.rows; j++)
        for (let i = 0; i < w.cols; i++) {
          if ((i * 7 + j * 13 + seed) % 5 === 0) continue; // dark windows
          c.fillRect(
            cx + (w.x0 + (i + 0.3) * cw) * s,
            baseY - (w.y0 + (j + 0.7) * rh) * s,
            ww,
            wh,
          );
        }
    }
    if (d.lines) {
      c.beginPath();
      for (const l of d.lines) {
        c.moveTo(cx + l[0] * s, baseY - l[1] * s);
        c.lineTo(cx + l[2] * s, baseY - l[3] * s);
      }
      c.stroke();
    }
    if (d.arcs) {
      for (const a of d.arcs) {
        c.beginPath();
        c.arc(cx + a[0] * s, baseY - a[1] * s, a[2] * s, Math.PI, 0);
        c.stroke();
      }
    }
    if (d.arches) {
      for (const a of d.arches) {
        const x = cx + a[0] * s,
          y0 = baseY - a[1] * s,
          hw = a[2] * s,
          h = a[3] * s;
        c.beginPath();
        c.moveTo(x - hw, y0);
        c.lineTo(x - hw, y0 - h + hw);
        c.arc(x, y0 - h + hw, hw, Math.PI, 0);
        c.lineTo(x + hw, y0);
        c.stroke();
      }
    }
    if (d.clock) {
      c.beginPath();
      c.arc(
        cx + d.clock[0] * s,
        baseY - d.clock[1] * s,
        d.clock[2] * s,
        0,
        Math.PI * 2,
      );
      c.stroke();
    }
    if (d.boards)
      for (const b of d.boards)
        c.strokeRect(
          cx + b[0] * s,
          baseY - (b[1] + b[3]) * s,
          b[2] * s,
          b[3] * s,
        );
    if (d.ball) {
      c.beginPath();
      c.arc(
        cx + d.ball[0] * s,
        baseY - d.ball[1] * s,
        d.ball[2] * s,
        0,
        Math.PI * 2,
      );
      c.fill();
    }
    if (d.trees)
      for (const t of d.trees) {
        const x = cx + t[0] * s,
          y = baseY - t[1] * s,
          r = t[2] * s;
        c.beginPath();
        c.moveTo(x, y - r * 3.2);
        c.lineTo(x + r, y);
        c.lineTo(x - r, y);
        c.closePath();
        c.stroke();
      }
  };
  function drawBridge(c, d, cx, baseY, s, fill, stroke) {
    const deck = baseY - d.deckY * s,
      th = d.towerH * s,
      tw = d.towerW * s;
    c.strokeStyle = stroke || fill;
    c.fillStyle = fill || stroke;
    // deck
    c.beginPath();
    c.moveTo(cx - 0.75 * s, deck);
    c.lineTo(cx + 0.75 * s, deck);
    c.stroke();
    for (const tx of d.towers) {
      const x = cx + tx * s;
      if (fill) c.fillRect(x - tw / 2, baseY - th, tw, th);
      c.strokeRect(x - tw / 2, baseY - th, tw, th);
      // twin pointed arches
      c.beginPath();
      c.moveTo(x - tw * 0.35, deck);
      c.lineTo(x - tw * 0.35, baseY - th * 0.72);
      c.lineTo(x - tw * 0.12, baseY - th * 0.8);
      c.lineTo(x - tw * 0.12, deck);
      c.moveTo(x + tw * 0.12, deck);
      c.lineTo(x + tw * 0.12, baseY - th * 0.8);
      c.lineTo(x + tw * 0.35, baseY - th * 0.72);
      c.lineTo(x + tw * 0.35, deck);
      c.stroke();
    }
    // main cables (sagging) + suspenders
    const t0 = cx + d.towers[0] * s,
      t1 = cx + d.towers[1] * s,
      top = baseY - th * 0.97;
    c.beginPath();
    c.moveTo(cx - 0.75 * s, deck - 2);
    c.lineTo(t0, top);
    c.quadraticCurveTo((t0 + t1) / 2, deck + (top - deck) * -0.2 + 6, t1, top);
    c.lineTo(cx + 0.75 * s, deck - 2);
    c.stroke();
    c.beginPath();
    for (let i = 1; i < 8; i++) {
      const x = t0 + ((t1 - t0) * i) / 8,
        u = i / 8,
        y = top + (1 - (1 - 2 * u) * (1 - 2 * u)) * (deck - top) * 0.62;
      c.moveTo(x, y);
      c.lineTo(x, deck);
    }
    c.stroke();
  }

  /** Key to the City icon (SVG string) for the ledger: trefoil bow, collar, long shaft, stepped bit (horizontal). */
  AR.keySVG =
    '<svg viewBox="0 0 64 24" class="arc-key">' +
    '<circle cx="9" cy="12" r="6.2" class="arc-kb"/><circle cx="9" cy="4.6" r="2.4" class="arc-kb"/><circle cx="9" cy="19.4" r="2.4" class="arc-kb"/>' +
    '<circle cx="9" cy="12" r="2.4" class="arc-kh"/>' +
    '<path d="M15.5 10.4h3v3.2h-3zM20 10.6h1.6v2.8H20z" class="arc-kc"/>' +
    '<path d="M21.6 11h30v2h-30z" class="arc-ks"/>' +
    '<path d="M44 13h8v6h-2.5v-3H47v4.5h-3z" class="arc-kt"/></svg>';

  // ------------------------------------------------------------------
  // Marquee title art (used by the cabinet screen header AND the 3D cabinets' lit marquee).
  // Original 1960s arcade look: sunburst / starfield / girder backdrop, chunky outlined title.
  // ------------------------------------------------------------------
  AR.drawMarquee = function (x, w, h, def) {
    const A = def.art;
    x.save();
    x.fillStyle = A.bg;
    x.fillRect(0, 0, w, h);
    if (def.id === "skypatrol") {
      const r = G.util && G.util.rng ? G.util.rng(17) : Math.random;
      for (let i = 0; i < 90; i++) {
        x.fillStyle = "rgba(255,255,255," + (0.3 + r() * 0.7) + ")";
        x.fillRect(r() * w, r() * h, 1.5, 1.5);
      }
      // two saucers + a city strip
      for (const s of [
        [w * 0.12, h * 0.32, 1],
        [w * 0.88, h * 0.28, -1],
      ]) {
        x.fillStyle = "#c8d0d8";
        x.beginPath();
        x.ellipse(s[0], s[1], h * 0.16, h * 0.05, 0, 0, Math.PI * 2);
        x.fill();
        x.fillStyle = A.c;
        x.beginPath();
        x.ellipse(s[0], s[1] - h * 0.04, h * 0.07, h * 0.05, 0, Math.PI, 0);
        x.fill();
        x.fillStyle = A.b;
        for (let k = -2; k <= 2; k++)
          x.fillRect(s[0] + k * h * 0.05 - 1.5, s[1] - 1.5, 3, 3);
      }
      x.fillStyle = "#121a40";
      for (let i = 0; i < 26; i++) {
        const bw = w / 26,
          bh = h * (0.12 + ((i * 37) % 11) / 40);
        x.fillRect(i * bw, h - bh, bw - 1, bh);
      }
    } else if (def.id === "catacomb") {
      // torch-lit stone arch
      const g = x.createRadialGradient(
        w / 2,
        h * 1.1,
        0,
        w / 2,
        h * 1.1,
        w * 0.6,
      );
      g.addColorStop(0, "rgba(255,150,40,0.55)");
      g.addColorStop(1, "rgba(255,150,40,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "rgba(160,110,70,0.55)";
      x.lineWidth = Math.max(1, h * 0.02);
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 12; i++)
          x.strokeRect(
            (i * w) / 12 + ((j % 2) * w) / 24,
            (j * h) / 4,
            w / 12,
            h / 4,
          );
      for (const tx of [w * 0.07, w * 0.93]) {
        x.fillStyle = "#ffd23a";
        x.beginPath();
        x.moveTo(tx - h * 0.05, h * 0.55);
        x.quadraticCurveTo(tx, h * 0.15, tx + h * 0.05, h * 0.55);
        x.fill();
        x.fillStyle = "#6a4a2a";
        x.fillRect(tx - 2, h * 0.55, 4, h * 0.3);
      }
    } else {
      // dusk sky + red girders
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#2a0c2a");
      g.addColorStop(1, "#ff7a3a");
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#c8321e";
      x.lineWidth = Math.max(2, h * 0.05);
      for (let k = 0; k < 3; k++) {
        const y = h * (0.25 + k * 0.3);
        x.beginPath();
        x.moveTo(0, y + (k % 2 ? -4 : 4));
        x.lineTo(w, y - (k % 2 ? -4 : 4));
        x.stroke();
      }
      x.lineWidth = Math.max(1, h * 0.015);
      for (let i = 0; i < 24; i++) {
        const xx = (i * w) / 24;
        x.beginPath();
        x.moveTo(xx, h * 0.25);
        x.lineTo(xx + w / 48, h * 0.55);
        x.lineTo(xx + w / 24, h * 0.25);
        x.stroke();
      }
    }
    // title: chunky, outlined, slight drop shadow
    const fs = Math.round(h * 0.5);
    x.font = "900 " + fs + 'px "Arial Black", Impact, "Oswald", sans-serif';
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.lineJoin = "round";
    x.lineWidth = Math.max(3, fs * 0.16);
    x.strokeStyle = "#000";
    x.strokeText(def.title, w / 2 + fs * 0.05, h * 0.47 + fs * 0.06, w * 0.84);
    x.lineWidth = Math.max(2, fs * 0.08);
    x.strokeStyle = A.b;
    x.strokeText(def.title, w / 2, h * 0.47, w * 0.84);
    const tg = x.createLinearGradient(
      0,
      h * 0.47 - fs / 2,
      0,
      h * 0.47 + fs / 2,
    );
    tg.addColorStop(0, "#ffffff");
    tg.addColorStop(0.5, A.a);
    tg.addColorStop(1, A.b);
    x.fillStyle = tg;
    x.fillText(def.title, w / 2, h * 0.47, w * 0.84);
    x.font = "700 " + Math.round(h * 0.13) + 'px "Oswald", Arial, sans-serif';
    x.fillStyle = A.c;
    x.fillText(def.sub, w / 2, h * 0.86, w * 0.9);
    x.restore();
  };
})();
