// play-inline-479 01 — ctx
// Lines 22-354 of readable/play-inline-479.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const U = G.util;

  // 8 columns × 12 rows of 128 px cells (rows 8–11: skill-book covers, see COVERS)
  const SIZE = 1024,
    SIZE_H = 1536,
    CELL = 128,
    GRID = SIZE / CELL,
    INSET = 5;
  const CELLS = [
    "white",
    "grime",
    "grime_rust",
    "grime_dark",
    "wood",
    "paper",
    "cardboard",
    "olive",
    "fizzo",
    "fizzo_blue",
    "fizzo_lime",
    "rootbeer",
    "water",
    "beer",
    "whiskey",
    "vodka",
    "wine",
    "milk",
    "tonic",
    "iodine",
    "bull",
    "syrette",
    "focus",
    "rush",
    "prussian",
    "jerky",
    "beans",
    "dogfood",
    "chowder",
    "flakes",
    "zeppelin",
    "marinara",
    "frankbun",
    "astro",
    "spare0",
    "homeguard",
    "noodle",
    "note",
    "book",
    "reel",
    "scrip_note",
    "ammo",
    "redcross",
    "fizzo_logo",
    "civdef",
    "drycell",
    "paint",
    "rage",
    "dial",
    "vent",
    "drawer",
    "mail",
    "register",
    "trash",
    "spare9",
    "stencil_no",
    "fridge_badge",
    "ammo_308",
    "toolbox",
    "medallion",
    "teddy",
    "bloodpack",
    "goggles",
    "shade",
    // rows 8–11: one cover per skill manual (sb_<book>), the Rally Tonic Extra label and World's Fair art
    "sb_riflemans_companion",
    "sb_super_sergeant",
    "sb_golden_gloves",
    "sb_demolitions",
    "sb_bellevue_manual",
    "sb_motor_manual",
    "sb_handyman",
    "sb_radio_handbook",
    "sb_popular_circuits",
    "sb_bureau_manual",
    "sb_art_of_the_pitch",
    "sb_pushcart_king",
    "sb_survival_handbook",
    "tonic_x",
    "wf_seal",
    "wf_ribbon",
    "spare10",
    "spare11",
    "spare12",
    "spare13",
    "spare14",
    "spare15",
    "spare16",
    "page_edge",
    "spare1",
    "spare2",
    "spare3",
    "spare4",
    "spare5",
    "spare6",
    "spare7",
    "spare8",
  ];
  const INDEX = {};
  CELLS.forEach((n, i) => {
    INDEX[n] = i;
  });

  let tex = null,
    canvas = null,
    built = false;

  // ------------------------------------------------------------------
  // Canvas helpers
  // ------------------------------------------------------------------
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  function cellXY(name) {
    const i = INDEX[name] || 0;
    return { x: (i % GRID) * CELL, y: Math.floor(i / GRID) * CELL };
  }

  function grime(ctx, x, y, base, amount, seed, edge) {
    const r = rng(seed);
    ctx.fillStyle = base;
    ctx.fillRect(x, y, CELL, CELL);
    // blotchy value noise
    for (let i = 0; i < 90 * amount; i++) {
      const rx = x + r() * CELL,
        ry = y + r() * CELL,
        rr = 2 + r() * 14;
      ctx.fillStyle = "rgba(40,32,22," + (0.03 + r() * 0.07) + ")";
      ctx.beginPath();
      ctx.arc(rx, ry, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    // speckles & chips
    for (let i = 0; i < 260 * amount; i++) {
      ctx.fillStyle =
        r() < 0.7
          ? "rgba(30,24,18," + (0.1 + r() * 0.25) + ")"
          : "rgba(255,250,235," + (0.08 + r() * 0.15) + ")";
      ctx.fillRect(x + r() * CELL, y + r() * CELL, 1 + r() * 2, 1 + r() * 2);
    }
    // scratches
    ctx.lineWidth = 1;
    for (let i = 0; i < 10 * amount; i++) {
      ctx.strokeStyle =
        r() < 0.5 ? "rgba(255,255,255,0.14)" : "rgba(20,16,10,0.18)";
      const sx = x + r() * CELL,
        sy = y + r() * CELL,
        a = r() * Math.PI,
        l = 8 + r() * 30;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(a) * l, sy + Math.sin(a) * l);
      ctx.stroke();
    }
    // streaks running down (rain, drips)
    for (let i = 0; i < 6 * amount; i++) {
      const sx = x + r() * CELL,
        sy = y + r() * CELL * 0.4,
        l = 20 + r() * 70;
      const g = ctx.createLinearGradient(sx, sy, sx, sy + l);
      g.addColorStop(0, "rgba(50,38,24,0.16)");
      g.addColorStop(1, "rgba(50,38,24,0)");
      ctx.fillStyle = g;
      ctx.fillRect(sx, sy, 1 + r() * 3, l);
    }
    // edge darkening: every face gets dirty corners/edges (fake AO)
    if (edge) {
      const e = ctx.createRadialGradient(
        x + CELL / 2,
        y + CELL / 2,
        CELL * 0.25,
        x + CELL / 2,
        y + CELL / 2,
        CELL * 0.75,
      );
      e.addColorStop(0, "rgba(0,0,0,0)");
      e.addColorStop(1, "rgba(25,18,10," + edge + ")");
      ctx.fillStyle = e;
      ctx.fillRect(x, y, CELL, CELL);
    }
  }
  function rust(ctx, x, y, seed, n) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const rx = x + r() * CELL,
        ry = y + r() * CELL,
        rr = 3 + r() * 16;
      const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, rr);
      g.addColorStop(0, "rgba(120,52,18,0.75)");
      g.addColorStop(0.6, "rgba(150,80,30,0.35)");
      g.addColorStop(1, "rgba(150,80,30,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(rx, ry, rr, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  /** Worn overlay on a label: fading, scuffs and a torn corner. */
  function wear(ctx, x, y, seed, k) {
    const r = rng(seed * 7 + 3);
    k = k === undefined ? 1 : k;
    for (let i = 0; i < 40 * k; i++) {
      ctx.fillStyle = "rgba(235,225,200," + (0.05 + r() * 0.12) + ")";
      ctx.fillRect(x + r() * CELL, y + r() * CELL, 1 + r() * 6, 1 + r() * 3);
    }
    for (let i = 0; i < 30 * k; i++) {
      ctx.fillStyle = "rgba(30,20,10," + (0.05 + r() * 0.15) + ")";
      ctx.fillRect(x + r() * CELL, y + r() * CELL, 1 + r() * 3, 1 + r() * 3);
    }
    const g = ctx.createLinearGradient(x, y, x, y + CELL);
    g.addColorStop(0, "rgba(0,0,0,0.12)");
    g.addColorStop(0.5, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.fillStyle = g;
    ctx.fillRect(x, y, CELL, CELL);
  }
  function text(ctx, s, cx, cy, size, color, opts) {
    opts = opts || {};
    ctx.save();
    ctx.font =
      (opts.italic ? "italic " : "") +
      (opts.weight || "bold") +
      " " +
      size +
      "px " +
      (opts.font ||
        '"Arial Black", Impact, "Helvetica Neue", Arial, sans-serif');
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (opts.maxW) {
      const w = ctx.measureText(s).width;
      if (w > opts.maxW) {
        ctx.translate(cx, cy);
        ctx.scale(opts.maxW / w, 1);
        cx = 0;
        cy = 0;
      }
    }
    if (opts.stroke) {
      ctx.lineWidth = opts.strokeW || 3;
      ctx.strokeStyle = opts.stroke;
      ctx.strokeText(s, cx, cy);
    }
    ctx.fillStyle = color;
    ctx.fillText(s, cx, cy);
    ctx.restore();
  }
  /** Horizontal band label, drawn twice across the cell so it wraps around a bottle/can. */
  function band(ctx, x, y, bg, draw) {
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, CELL, CELL);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, CELL / 2, CELL);
    ctx.clip();
    draw(x, y, CELL / 2);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + CELL / 2, y, CELL / 2, CELL);
    ctx.clip();
    draw(x + CELL / 2, y, CELL / 2);
    ctx.restore();
  }
  function trefoil(ctx, cx, cy, r, fg, bg) {
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fg;
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r * 0.88, a - 0.52, a + 0.52);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }
  function swoosh(ctx, x, y, w, h, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = h * 0.06;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.05, y + h * 0.68);
    ctx.bezierCurveTo(
      x + w * 0.35,
      y + h * 0.5,
      x + w * 0.6,
      y + h * 0.9,
      x + w * 0.95,
      y + h * 0.62,
    );
    ctx.stroke();
  }
  function lines(ctx, x, y, w, h, n, color, seed) {
    const r = rng(seed);
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++)
      ctx.fillRect(
        x,
        y + i * (h / n),
        w * (0.55 + r() * 0.45),
        Math.max(1, (h / n) * 0.35),
      );
  }

  // ------------------------------------------------------------------
  // Cell painters
  // ------------------------------------------------------------------
