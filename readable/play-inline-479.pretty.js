/* src/rpg/48_art.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — ITEM & CONTAINER ART  (G.items._art)
 *
 * One procedural 1024×1536 "label atlas" (8×12 cells of 128 px) shared by every
 * world item mesh and fallback container model: brand labels (Fizzo Cola,
 * Prairie Root Beer, Rally Tonic, Golden Plain Jerky, Freedom Flakes…), stencils, decals and
 * grime/rust/wood tiles. Meshes stay ONE merged, vertex-coloured geometry and
 * ONE shared material each (texture × vertex colour): untextured parts point
 * their UVs at the atlas' white cell, labelled parts at their cell.
 *
 * G.items._art = {
 *   texture()            → shared CanvasTexture (null without a DOM)
 *   cell(name)           → {u0, v0, u1, v1} (inset, bleed-safe)
 *   kit()                → geometry kit: box/cyl/sph/lathe/torus/cone (+ label variants
 *                          boxL, cylL, discL, planeL, and grime variants via `cell` args)
 *   CELLS                → list of cell names
 * }
 * Canvas art and every brand on it are original.
 * ===================================================================== */
(function () {
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
  const PAINT = {
    white(c, x, y) {
      c.fillStyle = "#ffffff";
      c.fillRect(x, y, CELL, CELL);
    },
    grime(c, x, y) {
      grime(c, x, y, "#e9e6de", 1, 11, 0.35);
    },
    grime_rust(c, x, y) {
      grime(c, x, y, "#e4dfd4", 1.2, 23, 0.4);
      rust(c, x, y, 5, 16);
    },
    grime_dark(c, x, y) {
      grime(c, x, y, "#cfcac0", 1.6, 37, 0.55);
      rust(c, x, y, 9, 6);
    },
    wood(c, x, y) {
      c.fillStyle = "#e8d8c0";
      c.fillRect(x, y, CELL, CELL);
      const r = rng(77);
      for (let i = 0; i < 60; i++) {
        c.strokeStyle = "rgba(90,60,30," + (0.08 + r() * 0.18) + ")";
        c.lineWidth = 1 + r() * 1.5;
        const yy = y + r() * CELL;
        c.beginPath();
        c.moveTo(x, yy);
        c.bezierCurveTo(
          x + 40,
          yy + r() * 6 - 3,
          x + 90,
          yy + r() * 6 - 3,
          x + CELL,
          yy,
        );
        c.stroke();
      }
      for (let i = 1; i < 4; i++) {
        c.fillStyle = "rgba(40,24,10,0.55)";
        c.fillRect(x, y + i * 32 - 1, CELL, 2);
      }
      for (let i = 0; i < 5; i++) {
        c.fillStyle = "rgba(60,36,14,0.5)";
        c.beginPath();
        c.ellipse(
          x + r() * CELL,
          y + r() * CELL,
          3 + r() * 4,
          1.5 + r() * 2,
          0,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
      grime(c, x, y, "rgba(0,0,0,0)", 0.5, 81, 0.35);
    },
    paper(c, x, y) {
      c.fillStyle = "#e6dcc2";
      c.fillRect(x, y, CELL, CELL);
      wear(c, x, y, 3, 1.3);
    },
    cardboard(c, x, y) {
      c.fillStyle = "#b8925e";
      c.fillRect(x, y, CELL, CELL);
      wear(c, x, y, 13, 1.2);
      c.fillStyle = "rgba(80,50,20,0.35)";
      c.fillRect(x, y + CELL / 2 - 6, CELL, 12);
      text(c, "THIS SIDE UP", x + 64, y + 96, 11, "rgba(60,30,10,0.7)", {
        weight: "bold",
      });
    },
    olive(c, x, y) {
      grime(c, x, y, "#dfe4d0", 1.2, 91, 0.45);
    },
    fizzo(c, x, y) {
      band(c, x, y, "#1f7a4a", (bx, by, w) => {
        c.fillStyle = "#f4f0e0";
        c.fillRect(bx, by + 34, w, 44);
        text(c, "Fizzo", bx + w / 2, by + 52, 20, "#c8281c", {
          italic: true,
          font: 'Georgia, "Times New Roman", serif',
          maxW: w - 8,
        });
        text(c, "COLA", bx + w / 2, by + 70, 9, "#1f7a4a", { maxW: w - 8 });
        c.fillStyle = "#e8c040";
        for (let i = 0; i < 4; i++)
          c.fillRect(bx + 4 + i * (w / 4), by + 96, w / 8, 4);
      });
      wear(c, x, y, 21, 0.8);
    },
    fizzo_blue(c, x, y) {
      band(c, x, y, "#14306a", (bx, by, w) => {
        c.fillStyle = "#7ad0ff";
        c.beginPath();
        c.arc(bx + w / 2, by + 30, 11, 0, Math.PI * 2);
        c.fill();
        text(c, "Fizzo", bx + w / 2, by + 60, 16, "#ffffff", {
          italic: true,
          font: "Georgia, serif",
          maxW: w - 8,
        });
        text(c, "BLUE", bx + w / 2, by + 80, 12, "#9fe0ff", { maxW: w - 8 });
      });
    },
    fizzo_lime(c, x, y) {
      band(c, x, y, "#6aa828", (bx, by, w) => {
        c.fillStyle = "#f4f0e0";
        c.fillRect(bx, by + 34, w, 44);
        text(c, "Fizzo", bx + w / 2, by + 50, 16, "#2a5a10", {
          italic: true,
          font: "Georgia, serif",
          maxW: w - 8,
        });
        text(c, "LIME", bx + w / 2, by + 68, 11, "#c8281c", { maxW: w - 8 });
      });
      wear(c, x, y, 22, 0.8);
    },
    rootbeer(c, x, y) {
      band(c, x, y, "#5a2a12", (bx, by, w) => {
        c.fillStyle = "#e8d098";
        c.fillRect(bx + 4, by + 28, w - 8, 60);
        c.fillStyle = "#5a2a12";
        c.beginPath();
        c.arc(bx + w / 2, by + 62, 14, Math.PI, 0);
        c.fill();
        c.fillRect(bx + w / 2 - 16, by + 62, 32, 6);
        c.fillStyle = "#e8d098";
        c.beginPath();
        c.arc(bx + w / 2 - 9, by + 70, 4, 0, Math.PI * 2);
        c.arc(bx + w / 2 + 9, by + 70, 4, 0, Math.PI * 2);
        c.fill();
        text(c, "PRAIRIE", bx + w / 2, by + 38, 9, "#5a2a12", { maxW: w - 10 });
        text(c, "ROOT BEER", bx + w / 2, by + 82, 7, "#5a2a12", {
          maxW: w - 10,
        });
      });
      wear(c, x, y, 23, 0.8);
    },
    water(c, x, y) {
      band(c, x, y, "#2e64b4", (bx, by, w) => {
        c.fillStyle = "#e8f0f8";
        c.fillRect(bx, by + 44, w, 30);
        text(c, "PURIFIED", bx + w / 2, by + 59, 11, "#2e64b4", {
          maxW: w - 6,
        });
        c.fillStyle = "#9fd0f0";
        for (let i = 0; i < 3; i++) {
          c.beginPath();
          c.arc(bx + 14 + i * 18, by + 26, 5, 0, Math.PI * 2);
          c.fill();
        }
      });
    },
    beer(c, x, y) {
      band(c, x, y, "#efe0b0", (bx, by, w) => {
        c.strokeStyle = "#7a1a14";
        c.lineWidth = 3;
        c.strokeRect(bx + 6, by + 26, w - 12, 68);
        text(c, "EMPIRE", bx + w / 2, by + 44, 15, "#7a1a14", {
          maxW: w - 16,
          font: "Georgia, serif",
        });
        text(c, "BREW HOUSE", bx + w / 2, by + 62, 8, "#5a4a2a", {
          maxW: w - 16,
        });
        text(c, "LAGER", bx + w / 2, by + 80, 11, "#7a1a14", { maxW: w - 16 });
      });
      wear(c, x, y, 24, 1);
    },
    whiskey(c, x, y) {
      c.fillStyle = "#e8dcb0";
      c.fillRect(x, y, CELL, CELL);
      c.strokeStyle = "#3a2410";
      c.lineWidth = 3;
      c.strokeRect(x + 10, y + 10, CELL - 20, CELL - 20);
      text(c, "OLD", x + 64, y + 40, 16, "#3a2410");
      text(c, "WHISKEY", x + 64, y + 68, 18, "#7a1a10", { maxW: 100 });
      text(c, "KENTUCKY", x + 64, y + 94, 10, "#3a2410");
      wear(c, x, y, 25, 1.2);
    },
    vodka(c, x, y) {
      band(c, x, y, "#f4f4f4", (bx, by, w) => {
        c.fillStyle = "#c02020";
        c.fillRect(bx, by + 40, w, 34);
        text(c, "VODKA", bx + w / 2, by + 57, 14, "#ffffff", { maxW: w - 8 });
      });
    },
    wine(c, x, y) {
      band(c, x, y, "#ece4cc", (bx, by, w) => {
        text(c, "Vin", bx + w / 2, by + 50, 16, "#5a0a14", {
          italic: true,
          font: "Georgia, serif",
        });
        c.fillStyle = "#5a0a14";
        c.fillRect(bx + 10, by + 68, w - 20, 3);
      });
      wear(c, x, y, 26, 1);
    },
    milk(c, x, y) {
      band(c, x, y, "#f6f6f0", (bx, by, w) => {
        c.fillStyle = "#d02020";
        c.fillRect(bx, by + 30, w, 8);
        text(c, "MILK", bx + w / 2, by + 64, 16, "#d02020", { maxW: w - 8 });
      });
    },
    tonic(c, x, y) {
      // Dr. Halloran's Rally Tonic: a cream paper label with a scalloped border, wrapped twice round the bottle
      band(c, x, y, "#efe2c0", (bx, by, w) => {
        c.strokeStyle = "#7a1a10";
        c.lineWidth = 2;
        c.strokeRect(bx + 3, by + 14, w - 6, 100);
        c.fillStyle = "#7a1a10";
        for (let i = 0; i < 6; i++) {
          c.beginPath();
          c.arc(bx + 6 + i * ((w - 12) / 5), by + 14, 3, 0, Math.PI * 2);
          c.fill();
        }
        text(c, "DR. HALLORAN'S", bx + w / 2, by + 26, 7, "#3a2410", {
          maxW: w - 10,
          font: "Georgia, serif",
        });
        text(c, "RALLY", bx + w / 2, by + 46, 16, "#b0281a", {
          maxW: w - 8,
          font: "Georgia, serif",
        });
        text(c, "TONIC", bx + w / 2, by + 64, 13, "#3a2410", {
          maxW: w - 10,
          font: "Georgia, serif",
        });
        text(c, "Doctor recommended!", bx + w / 2, by + 82, 6, "#7a1a10", {
          maxW: w - 8,
          italic: true,
          font: "Georgia, serif",
        });
        text(c, "22% ALC. · 4 FL. OZ.", bx + w / 2, by + 100, 5, "#3a2410", {
          maxW: w - 10,
          weight: "normal",
          font: "Arial, sans-serif",
        });
      });
      wear(c, x, y, 27, 1);
    },
    iodine(c, x, y) {
      band(c, x, y, "#f6f0dc", (bx, by, w) => {
        c.fillStyle = "#7a3a9a";
        c.fillRect(bx, by + 28, w, 20);
        text(c, "IODINE", bx + w / 2, by + 38, 10, "#ffffff", { maxW: w - 8 });
        text(c, "KI 130mg", bx + w / 2, by + 72, 9, "#7a3a9a", { maxW: w - 8 });
      });
    },
    bull(c, x, y) {
      band(c, x, y, "#2a2a2a", (bx, by, w) => {
        c.fillStyle = "#f0d040";
        c.beginPath();
        c.moveTo(bx + w / 2 - 16, by + 30);
        c.lineTo(bx + w / 2 - 6, by + 42);
        c.lineTo(bx + w / 2 + 6, by + 42);
        c.lineTo(bx + w / 2 + 16, by + 30);
        c.lineTo(bx + w / 2 + 10, by + 52);
        c.lineTo(bx + w / 2 - 10, by + 52);
        c.closePath();
        c.fill();
        text(c, "BULL", bx + w / 2, by + 74, 14, "#f0d040", { maxW: w - 8 });
      });
    },
    syrette(c, x, y) {
      band(c, x, y, "#e8e4d0", (bx, by, w) => {
        c.fillStyle = "#5a6a3a";
        c.fillRect(bx, by + 36, w, 40);
        text(c, "MORPHINE", bx + w / 2, by + 50, 8, "#ffffff", { maxW: w - 8 });
        text(c, "1/2 GR", bx + w / 2, by + 66, 9, "#f0e0b0", { maxW: w - 8 });
      });
    },
    focus(c, x, y) {
      c.fillStyle = "#e8eef4";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#1f6aa0";
      c.beginPath();
      c.arc(x + 64, y + 48, 28, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#e8eef4";
      c.beginPath();
      c.arc(x + 64, y + 48, 16, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#1f6aa0";
      c.beginPath();
      c.arc(x + 64, y + 48, 6, 0, Math.PI * 2);
      c.fill();
      text(c, "FOCUS", x + 64, y + 92, 20, "#1f6aa0");
      text(c, "PEPPERMINT", x + 64, y + 112, 9, "#c02a1a");
      wear(c, x, y, 28, 0.7);
    },
    rush(c, x, y) {
      band(c, x, y, "#e8701a", (bx, by, w) => {
        c.fillStyle = "#ffffff";
        for (let i = 0; i < 3; i++)
          c.fillRect(bx + 6, by + 40 + i * 9, w - 12 - i * 8, 4);
        text(c, "RUSH", bx + w / 2, by + 84, 16, "#ffffff", { maxW: w - 8 });
      });
    },
    rage(c, x, y) {
      band(c, x, y, "#1a1a1a", (bx, by, w) => {
        c.fillStyle = "#d02020";
        c.beginPath();
        c.moveTo(bx + w / 2, by + 26);
        c.lineTo(bx + w / 2 + 14, by + 56);
        c.lineTo(bx + w / 2, by + 50);
        c.lineTo(bx + w / 2 - 14, by + 56);
        c.closePath();
        c.fill();
        text(c, "RAGE", bx + w / 2, by + 78, 14, "#d02020", { maxW: w - 6 });
      });
    },
    prussian(c, x, y) {
      // Prussian Blue capsules: a white pharmacy label with a deep blue band and the Civil Defense triangle
      band(c, x, y, "#f4f2ea", (bx, by, w) => {
        c.fillStyle = "#123a7a";
        c.fillRect(bx, by + 22, w, 30);
        text(c, "PRUSSIAN", bx + w / 2, by + 31, 9, "#ffffff", { maxW: w - 6 });
        text(c, "BLUE", bx + w / 2, by + 44, 10, "#ffffff", { maxW: w - 6 });
        c.fillStyle = "#d02020";
        c.beginPath();
        c.moveTo(bx + w / 2, by + 60);
        c.lineTo(bx + w / 2 + 9, by + 75);
        c.lineTo(bx + w / 2 - 9, by + 75);
        c.closePath();
        c.fill();
        text(c, "500 mg CAPSULES", bx + w / 2, by + 86, 5, "#123a7a", {
          maxW: w - 8,
          weight: "normal",
          font: "Arial, sans-serif",
        });
        text(c, "O.C.D. STOCKPILE", bx + w / 2, by + 98, 5, "#3a3a3a", {
          maxW: w - 8,
          weight: "normal",
          font: "Arial, sans-serif",
        });
      });
      wear(c, x, y, 30, 0.7);
    },
    tonic_x(c, x, y) {
      // Rally Tonic Extra: black and gold, "EXTRA STRENGTH"
      band(c, x, y, "#1a1410", (bx, by, w) => {
        c.strokeStyle = "#d8b048";
        c.lineWidth = 2;
        c.strokeRect(bx + 3, by + 14, w - 6, 100);
        text(c, "DR. HALLORAN'S", bx + w / 2, by + 26, 7, "#d8b048", {
          maxW: w - 10,
          font: "Georgia, serif",
        });
        text(c, "RALLY", bx + w / 2, by + 46, 16, "#f0d070", {
          maxW: w - 8,
          font: "Georgia, serif",
        });
        c.fillStyle = "#b0281a";
        c.fillRect(bx + 4, by + 58, w - 8, 14);
        text(c, "EXTRA", bx + w / 2, by + 65, 10, "#ffffff", { maxW: w - 10 });
        text(c, "STRENGTH", bx + w / 2, by + 84, 7, "#d8b048", {
          maxW: w - 10,
        });
        text(c, "For the man who cannot", bx + w / 2, by + 98, 5, "#d8b048", {
          maxW: w - 8,
          italic: true,
          font: "Georgia, serif",
        });
        text(c, "afford to be laid up!", bx + w / 2, by + 106, 5, "#d8b048", {
          maxW: w - 8,
          italic: true,
          font: "Georgia, serif",
        });
      });
      wear(c, x, y, 31, 0.8);
    },
    wf_seal(c, x, y) {
      // the 1964 World's Fair seal: a steel globe in three orbit rings on midnight blue
      c.fillStyle = "#16244a";
      c.fillRect(x, y, CELL, CELL);
      c.strokeStyle = "#d8dce4";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(x + 64, y + 58, 30, 0, Math.PI * 2);
      c.stroke();
      c.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) {
        c.beginPath();
        c.ellipse(
          x + 64,
          y + 58,
          Math.abs(30 - Math.abs(i) * 9) || 2,
          30,
          0,
          0,
          Math.PI * 2,
        );
        c.stroke();
        c.beginPath();
        c.moveTo(x + 34, y + 58 + i * 11);
        c.lineTo(x + 94, y + 58 + i * 11);
        c.stroke();
      }
      c.strokeStyle = "#e8b040";
      c.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.ellipse(x + 64, y + 58, 46, 12, -0.5 + i * 0.5, 0, Math.PI * 2);
        c.stroke();
      }
      text(c, "WORLD'S FAIR", x + 64, y + 104, 13, "#e8b040", { maxW: 112 });
      text(c, "1964 · 1965", x + 64, y + 119, 9, "#d8dce4", { maxW: 100 });
      wear(c, x, y, 32, 0.6);
    },
    wf_ribbon(c, x, y) {
      // a hatband ribbon: orange and blue Fair stripes
      c.fillStyle = "#1e3a8a";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#f08a1a";
      for (let i = 0; i < CELL; i += 32) c.fillRect(x, y + i + 8, CELL, 12);
      c.fillStyle = "#f4f0e0";
      for (let i = 0; i < CELL; i += 32) c.fillRect(x, y + i + 22, CELL, 3);
    },
    jerky(c, x, y) {
      // Golden Plain beef jerky: kraft bag, oxblood crimp, sunset label
      c.fillStyle = "#c89a5a";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#7a2a12";
      c.fillRect(x, y, CELL, 20);
      c.fillStyle = "rgba(255,255,255,0.3)";
      for (let i = 1; i < 12; i++) c.fillRect(x + i * 11, y + 2, 2, 16);
      c.fillStyle = "#f4e6c0";
      c.beginPath();
      c.ellipse(x + 64, y + 66, 52, 34, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#e8902a";
      c.beginPath();
      c.arc(x + 64, y + 76, 14, Math.PI, 0);
      c.fill();
      c.fillStyle = "#7a3a12";
      c.fillRect(x + 22, y + 76, 84, 12);
      text(c, "GOLDEN PLAIN", x + 64, y + 50, 13, "#7a2a12", {
        maxW: 96,
        font: "Georgia, serif",
      });
      text(c, "BEEF JERKY", x + 64, y + 112, 12, "#3a1808", { maxW: 110 });
      wear(c, x, y, 29, 0.9);
    },
    beans(c, x, y) {
      band(c, x, y, "#c85a2a", (bx, by, w) => {
        c.fillStyle = "#f0e0b0";
        c.fillRect(bx, by + 30, w, 56);
        text(c, "FRANKS &", bx + w / 2, by + 46, 11, "#6a2a10", {
          maxW: w - 6,
        });
        text(c, "BEANS", bx + w / 2, by + 68, 15, "#6a2a10", { maxW: w - 6 });
      });
      wear(c, x, y, 30, 0.9);
    },
    dogfood(c, x, y) {
      band(c, x, y, "#3a6a3a", (bx, by, w) => {
        text(c, "DOG", bx + w / 2, by + 44, 15, "#f0e0b0", { maxW: w - 6 });
        text(c, "CHOW", bx + w / 2, by + 70, 15, "#f0e0b0", { maxW: w - 6 });
      });
      wear(c, x, y, 31, 1);
    },
    chowder(c, x, y) {
      band(c, x, y, "#c02a2a", (bx, by, w) => {
        c.fillStyle = "#f0ecd8";
        c.fillRect(bx, by + 40, w, 36);
        text(c, "CHOWDER", bx + w / 2, by + 58, 10, "#c02a2a", { maxW: w - 6 });
      });
      wear(c, x, y, 32, 0.9);
    },
    flakes(c, x, y) {
      // Freedom Flakes (Brooklyn Sugar Works)
      c.fillStyle = "#f6eee0";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#1e3a8a";
      c.fillRect(x, y, CELL, 52);
      c.fillStyle = "#ffffff";
      for (let i = 0; i < 7; i++) {
        c.beginPath();
        c.arc(x + 10 + i * 18, y + 7, 2.2, 0, Math.PI * 2);
        c.fill();
      }
      for (let i = 0; i < 3; i++) {
        c.fillStyle = i % 2 ? "#f6eee0" : "#c8201a";
        c.fillRect(x, y + 52 + i * 5, CELL, 5);
      }
      text(c, "Freedom", x + 64, y + 24, 21, "#ffffff", {
        italic: true,
        maxW: 118,
      });
      text(c, "FLAKES", x + 64, y + 44, 15, "#f4c21e", { maxW: 118 });
      c.fillStyle = "#1e3a8a";
      c.beginPath();
      c.ellipse(x + 64, y + 96, 36, 16, 0, 0, Math.PI);
      c.fill();
      c.fillStyle = "#e8a83a";
      for (let i = 0; i < 9; i++) {
        c.beginPath();
        c.ellipse(
          x + 36 + (i % 5) * 14,
          y + 90 - Math.floor(i / 5) * 8,
          6,
          4,
          i,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
      text(c, "BROOKLYN SUGAR WORKS", x + 64, y + 120, 7, "#1e3a8a");
      wear(c, x, y, 33, 1);
    },
    zeppelin(c, x, y) {
      // Chocolate Zeppelin: silver foil wrapper print
      const g = c.createLinearGradient(x, y, x + CELL, y + CELL);
      g.addColorStop(0, "#8a949c");
      g.addColorStop(0.3, "#f4f8fa");
      g.addColorStop(0.6, "#a8b2ba");
      g.addColorStop(1, "#e8eef2");
      c.fillStyle = g;
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#5a2c12";
      c.beginPath();
      c.ellipse(x + 64, y + 72, 44, 15, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.moveTo(x + 24, y + 72);
      c.lineTo(x + 12, y + 58);
      c.lineTo(x + 30, y + 66);
      c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(x + 24, y + 72);
      c.lineTo(x + 12, y + 86);
      c.lineTo(x + 30, y + 78);
      c.closePath();
      c.fill();
      c.strokeStyle = "#fbf2dc";
      c.lineWidth = 2;
      c.beginPath();
      for (let i = 0; i <= 12; i++)
        c.lineTo(x + 34 + i * 5, y + 72 + Math.sin(i * 1.6) * 3);
      c.stroke();
      text(c, "Chocolate", x + 64, y + 26, 18, "#5a2c12", {
        italic: true,
        maxW: 116,
        font: "Georgia, serif",
      });
      text(c, "ZEPPELIN", x + 64, y + 46, 14, "#1e3a6a", { maxW: 116 });
      text(c, "LIGHTER THAN AIR", x + 64, y + 108, 9, "#5a2c12", { maxW: 116 });
      wear(c, x, y, 34, 0.6);
    },
    marinara(c, x, y) {
      // Mama Marinara's Instant Meatballs (can wrap)
      c.fillStyle = "#c8281e";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#f6ecd4";
      c.fillRect(x, y + 34, CELL, 44);
      c.fillStyle = "#2a7a3a";
      c.fillRect(x, y + 78, CELL, 6);
      text(c, "Mama", x + 64, y + 18, 22, "#f6ecd4", {
        italic: true,
        font: "Georgia, serif",
      });
      text(c, "MARINARA'S", x + 64, y + 48, 13, "#c8281e", { maxW: 116 });
      text(c, "INSTANT MEATBALLS", x + 64, y + 66, 8, "#2a7a3a", { maxW: 116 });
      c.fillStyle = "#6a3018";
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.arc(x + 25 + i * 26, y + 104, 9, 0, Math.PI * 2);
        c.fill();
      }
      wear(c, x, y, 35, 1);
    },
    frankbun(c, x, y) {
      // Forever Franks sticker on the Frank-in-a-Bun sleeve
      c.fillStyle = "#e8f0f4";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#c8201a";
      c.beginPath();
      c.arc(x + 64, y + 64, 58, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#fbf0d8";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(x + 64, y + 64, 50, 0, Math.PI * 2);
      c.stroke();
      text(c, "FOREVER", x + 64, y + 44, 14, "#fbf0d8", { maxW: 90 });
      text(c, "FRANKS", x + 64, y + 64, 18, "#f4c21e", { maxW: 90 });
      text(c, "MIRACLE-KEEP", x + 64, y + 86, 8, "#fbf0d8", { maxW: 86 });
    },
    astro(c, x, y) {
      // Astronaut Ice Cream foil pouch (Junior Rocketeer Co.)
      const g = c.createLinearGradient(x, y, x + CELL, y + CELL);
      g.addColorStop(0, "#7c868e");
      g.addColorStop(0.35, "#f4f8fa");
      g.addColorStop(0.7, "#9aa4ac");
      g.addColorStop(1, "#e8eef2");
      c.fillStyle = g;
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#0e1a44";
      c.fillRect(x + 12, y + 14, CELL - 24, CELL - 28);
      text(c, "ASTRONAUT", x + 64, y + 28, 12, "#ffffff", { maxW: 100 });
      text(c, "ICE CREAM", x + 64, y + 44, 12, "#ff9ab8", { maxW: 100 });
      const cols = ["#e88aa0", "#f6ecd0", "#6a3a1e"];
      for (let i = 0; i < 3; i++) {
        c.fillStyle = cols[i];
        c.fillRect(x + 30 + i * 23, y + 56, 23, 30);
      }
      text(c, "JUNIOR ROCKETEER", x + 64, y + 100, 8, "#f4d040", { maxW: 100 });
    },
    spare0(c, x, y) {
      c.fillStyle = "#ffffff";
      c.fillRect(x, y, CELL, CELL);
    },
    homeguard(c, x, y) {
      // Homeguard Cleanser canister wrap
      c.fillStyle = "#1e3a6a";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#c8201a";
      c.fillRect(x, y + 92, CELL, 8);
      c.fillStyle = "#f4f0e6";
      c.fillRect(x, y + 100, CELL, 5);
      c.fillStyle = "#f4f0e6";
      c.beginPath();
      c.moveTo(x + 48, y + 10);
      c.lineTo(x + 80, y + 10);
      c.lineTo(x + 80, y + 30);
      c.quadraticCurveTo(x + 80, y + 46, x + 64, y + 54);
      c.quadraticCurveTo(x + 48, y + 46, x + 48, y + 30);
      c.closePath();
      c.fill();
      text(c, "H", x + 64, y + 30, 22, "#c8201a");
      text(c, "HOMEGUARD", x + 64, y + 70, 18, "#f4f0e6", { maxW: 118 });
      text(c, "CLEANSER", x + 64, y + 116, 10, "#f4f0e6");
      wear(c, x, y, 39, 0.8);
    },
    noodle(c, x, y) {
      band(c, x, y, "#f0ece0", (bx, by, w) => {
        c.fillStyle = "#d02a2a";
        c.fillRect(bx, by + 28, w, 22);
        text(c, "NOODLES", bx + w / 2, by + 39, 10, "#ffffff", { maxW: w - 6 });
        text(c, "CHOW MEIN", bx + w / 2, by + 80, 12, "#d02a2a", {
          maxW: w - 8,
        });
      });
    },
    note(c, x, y) {
      c.fillStyle = "#e8e0c8";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "rgba(120,150,190,0.35)";
      for (let i = 0; i < 9; i++) c.fillRect(x, y + 20 + i * 12, CELL, 1);
      lines(c, x + 12, y + 14, 100, 104, 9, "rgba(30,30,60,0.75)", 5);
      c.fillStyle = "rgba(200,80,60,0.4)";
      c.fillRect(x + 8, y, 1, CELL);
      wear(c, x, y, 40, 1.2);
    },
    book(c, x, y) {
      c.fillStyle = "#5a2a1a";
      c.fillRect(x, y, CELL, CELL);
      c.strokeStyle = "#c8a040";
      c.lineWidth = 3;
      c.strokeRect(x + 10, y + 10, CELL - 20, CELL - 20);
      c.fillStyle = "#c8a040";
      c.fillRect(x + 24, y + 40, 80, 6);
      c.fillRect(x + 34, y + 54, 60, 4);
      c.fillRect(x + 30, y + 90, 68, 3);
      wear(c, x, y, 41, 1.4);
    },
    reel(c, x, y) {
      c.fillStyle = "#d8d0b8";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#c0a030";
      c.fillRect(x, y, CELL, 22);
      text(c, "TAPE REEL", x + 64, y + 11, 12, "#2a2a2a");
      lines(c, x + 14, y + 36, 100, 70, 5, "rgba(20,20,40,0.7)", 9);
      wear(c, x, y, 42, 1);
    },
    scrip_note(c, x, y) {
      c.fillStyle = "#d8dcc4";
      c.fillRect(x, y, CELL, CELL);
      c.strokeStyle = "#3a5a3a";
      c.lineWidth = 3;
      c.strokeRect(x + 8, y + 22, CELL - 16, CELL - 44);
      c.lineWidth = 1;
      c.strokeRect(x + 13, y + 27, CELL - 26, CELL - 54);
      text(c, "RATION SCRIP", x + 64, y + 42, 12, "#3a5a3a", {
        font: 'Georgia, "Times New Roman", serif',
        maxW: 100,
      });
      c.fillStyle = "#3a5a3a";
      c.beginPath();
      c.arc(x + 64, y + 68, 13, 0, Math.PI * 2);
      c.fill();
      text(c, "1", x + 64, y + 69, 16, "#d8dcc4", { font: "Georgia, serif" });
      text(c, "OFFICE OF CIVIL DEFENSE", x + 64, y + 94, 6, "#3a5a3a", {
        maxW: 100,
      });
      c.fillStyle = "rgba(60,80,60,0.18)";
      c.fillRect(x + 62, y, 4, CELL);
      wear(c, x, y, 43, 0.7);
    },
    ammo(c, x, y) {
      grime(c, x, y, "#5e6844", 1, 44, 0.45);
      c.strokeStyle = "rgba(240,210,90,0.9)";
      c.lineWidth = 3;
      c.strokeRect(x + 10, y + 34, CELL - 20, 60);
      text(c, "AMMUNITION", x + 64, y + 56, 13, "rgba(240,210,90,0.95)", {
        font: '"Courier New", monospace',
      });
      text(c, "CAL .308  M-2", x + 64, y + 78, 10, "rgba(240,210,90,0.9)", {
        font: '"Courier New", monospace',
      });
    },
    ammo_308(c, x, y) {
      grime(c, x, y, "#5e6844", 1, 45, 0.45);
      text(c, "10MM", x + 64, y + 50, 22, "rgba(240,210,90,0.95)", {
        font: '"Courier New", monospace',
      });
      text(c, "50 RDS", x + 64, y + 80, 14, "rgba(240,210,90,0.9)", {
        font: '"Courier New", monospace',
      });
    },
    redcross(c, x, y) {
      grime(c, x, y, "#f4f2ec", 0.6, 46, 0.3);
      c.fillStyle = "#c01a14";
      c.fillRect(x + 50, y + 22, 28, 84);
      c.fillRect(x + 22, y + 50, 84, 28);
      text(c, "FIRST AID", x + 64, y + 116, 10, "#c01a14");
    },
    fizzo_logo(c, x, y) {
      grime(c, x, y, "#efe8d8", 0.6, 47, 0.25);
      c.fillStyle = "#1f7a4a";
      c.beginPath();
      c.ellipse(x + 64, y + 64, 56, 36, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#e8c040";
      c.lineWidth = 4;
      c.beginPath();
      c.ellipse(x + 64, y + 64, 50, 30, 0, 0, Math.PI * 2);
      c.stroke();
      text(c, "Fizzo", x + 64, y + 62, 26, "#ffffff", {
        italic: true,
        font: "Georgia, serif",
        maxW: 90,
      });
      wear(c, x, y, 48, 0.8);
    },
    fridge_badge(c, x, y) {
      c.fillStyle = "#c8c8c0";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#2a2a2a";
      c.fillRect(x + 6, y + 40, CELL - 12, 48);
      text(c, "Frost-O-Matic", x + 64, y + 64, 16, "#e8e0c0", {
        italic: true,
        font: "Georgia, serif",
        maxW: 108,
      });
    },
    civdef(c, x, y) {
      c.fillStyle = "#e8e4d8";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#1e3a7a";
      c.beginPath();
      c.arc(x + 64, y + 52, 34, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.moveTo(x + 64, y + 26);
      c.lineTo(x + 88, y + 68);
      c.lineTo(x + 40, y + 68);
      c.closePath();
      c.fill();
      c.fillStyle = "#d02020";
      c.beginPath();
      c.moveTo(x + 64, y + 36);
      c.lineTo(x + 80, y + 63);
      c.lineTo(x + 48, y + 63);
      c.closePath();
      c.fill();
      text(c, "CIVIL DEFENSE", x + 64, y + 104, 12, "#1e3a7a", { maxW: 116 });
    },
    drycell(c, x, y) {
      band(c, x, y, "#6a6a60", (bx, by, w) => {
        c.fillStyle = "#e8c020";
        c.fillRect(bx, by + 36, w, 40);
        trefoil(c, bx + w / 2, by + 56, 14, "#1a1a1a", "#e8c020");
      });
    },
    paint(c, x, y) {
      band(c, x, y, "#d0c080", (bx, by, w) => {
        c.fillStyle = "#b02a1a";
        c.fillRect(bx, by + 20, w, 16);
        text(c, "PAINT", bx + w / 2, by + 70, 14, "#3a2a10", { maxW: w - 6 });
      });
      wear(c, x, y, 50, 1.5);
    },
    dial(c, x, y) {
      c.fillStyle = "#2a2c2e";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#b8b8b0";
      c.beginPath();
      c.arc(x + 64, y + 64, 56, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#2a2a2a";
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        const l = i % 5 ? 8 : 16;
        c.save();
        c.translate(x + 64, y + 64);
        c.rotate(a);
        c.fillRect(-1, -54, 2, l);
        c.restore();
      }
      c.fillStyle = "#8a8a82";
      c.beginPath();
      c.arc(x + 64, y + 64, 24, 0, Math.PI * 2);
      c.fill();
    },
    vent(c, x, y) {
      grime(c, x, y, "#d8d8d0", 1, 51, 0.4);
      c.fillStyle = "rgba(15,15,15,0.85)";
      for (let i = 0; i < 6; i++)
        c.fillRect(x + 14, y + 16 + i * 17, CELL - 28, 7);
    },
    drawer(c, x, y) {
      grime(c, x, y, "#dcdcd4", 1, 52, 0.55);
      c.fillStyle = "#f0ecd8";
      c.fillRect(x + 44, y + 28, 40, 22);
      c.strokeStyle = "#6a6a60";
      c.lineWidth = 2;
      c.strokeRect(x + 44, y + 28, 40, 22);
      lines(c, x + 50, y + 34, 28, 12, 2, "rgba(30,30,30,0.6)", 3);
    },
    mail(c, x, y) {
      grime(c, x, y, "#2a4a8a", 1, 53, 0.45);
      c.fillStyle = "#f4f0e8";
      c.fillRect(x + 20, y + 30, 88, 40);
      text(c, "U.S. MAIL", x + 64, y + 50, 16, "#1a3a8a");
      c.fillStyle = "#c02020";
      c.fillRect(x + 20, y + 80, 88, 8);
    },
    register(c, x, y) {
      c.fillStyle = "#1a1a1a";
      c.fillRect(x, y, CELL, CELL);
      for (let r = 0; r < 4; r++)
        for (let q = 0; q < 5; q++) {
          c.fillStyle = (r + q) % 3 ? "#e8e0c8" : "#c83a2a";
          c.beginPath();
          c.arc(x + 18 + q * 23, y + 26 + r * 25, 8, 0, Math.PI * 2);
          c.fill();
        }
    },
    trash(c, x, y) {
      grime(c, x, y, "#6f746c", 1.8, 54, 0.5);
      rust(c, x, y, 55, 10);
      c.fillStyle = "rgba(20,20,20,0.35)";
      for (let i = 0; i < 8; i++) c.fillRect(x + i * 16 + 4, y, 4, CELL);
      text(c, "DSNY", x + 64, y + 60, 20, "rgba(250,250,250,0.85)");
    },
    spare9(c, x, y) {
      c.fillStyle = "#ffffff";
      c.fillRect(x, y, CELL, CELL);
    },
    stencil_no(c, x, y) {
      grime(c, x, y, "#e0dcd0", 1, 56, 0.45);
      text(c, "No. 7", x + 64, y + 64, 30, "rgba(30,30,30,0.85)", {
        font: '"Courier New", monospace',
      });
    },
    toolbox(c, x, y) {
      grime(c, x, y, "#a82818", 1.3, 57, 0.45);
      rust(c, x, y, 58, 6);
      text(c, "CRAFTSMAN", x + 64, y + 64, 14, "rgba(240,240,240,0.8)");
    },
    medallion(c, x, y) {
      c.fillStyle = "#6a4a20";
      c.fillRect(x, y, CELL, CELL);
      const g = c.createRadialGradient(x + 52, y + 50, 6, x + 64, y + 64, 58);
      g.addColorStop(0, "#f0c878");
      g.addColorStop(0.6, "#b07a30");
      g.addColorStop(1, "#6a4418");
      c.fillStyle = g;
      c.beginPath();
      c.arc(x + 64, y + 64, 56, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(70,40,10,0.8)";
      c.lineWidth = 3;
      c.beginPath();
      c.arc(x + 64, y + 64, 40, 0, Math.PI * 2);
      c.stroke();
      c.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.ellipse(
          x + 64,
          y + 64,
          26,
          26 * Math.abs(Math.cos(i * 0.9)),
          0,
          0,
          Math.PI * 2,
        );
        c.stroke();
      }
      c.beginPath();
      c.moveTo(x + 38, y + 64);
      c.lineTo(x + 90, y + 64);
      c.stroke();
      text(c, "1964", x + 64, y + 112, 10, "rgba(70,40,10,0.9)");
    },
    teddy(c, x, y) {
      grime(c, x, y, "#e8d0b0", 2, 58, 0.3);
    },
    bloodpack(c, x, y) {
      c.fillStyle = "#8a0a0a";
      c.fillRect(x, y, CELL, CELL);
      c.fillStyle = "#f0ece0";
      c.fillRect(x + 24, y + 24, 80, 50);
      text(c, "BLOOD", x + 64, y + 42, 14, "#8a0a0a");
      text(c, "TYPE O-", x + 64, y + 62, 12, "#2a2a2a");
    },
    goggles(c, x, y) {
      c.fillStyle = "#081016";
      c.fillRect(x, y, CELL, CELL);
      lines(c, x + 12, y + 16, 104, 96, 8, "rgba(207,238,250,0.75)", 7);
      c.strokeStyle = "rgba(150,220,240,0.6)";
      c.lineWidth = 2;
      c.strokeRect(x + 6, y + 6, CELL - 12, CELL - 12);
    },
    shade(c, x, y) {
      grime(c, x, y, "#cfd4cc", 1, 59, 0.4);
      c.fillStyle = "#2a2a2a";
      c.fillRect(x + 14, y + 52, CELL - 28, 30);
      text(c, "U.S. ARMY", x + 64, y + 36, 14, "#2a3a2a");
      text(c, "SHADE FIELD", x + 64, y + 67, 12, "#d8d8c8", { maxW: 96 });
      text(c, "XM-9", x + 64, y + 100, 12, "#2a3a2a");
    },
  };

  // ------------------------------------------------------------------
  // Skill-manual covers (original art and titles). One 128 px cell each.
  // ------------------------------------------------------------------
  /** Tiny pictograms drawn in a cover's art box (cx, cy centre, s = size). */
  const PICTO = {
    padlock(c, cx, cy, s, fg) {
      c.strokeStyle = fg;
      c.lineWidth = s * 0.12;
      c.beginPath();
      c.arc(cx, cy - s * 0.18, s * 0.28, Math.PI, 0);
      c.stroke();
      c.fillStyle = fg;
      c.fillRect(cx - s * 0.42, cy - s * 0.18, s * 0.84, s * 0.62);
      c.fillStyle = "rgba(0,0,0,0.55)";
      c.beginPath();
      c.arc(cx, cy + s * 0.05, s * 0.08, 0, Math.PI * 2);
      c.fill();
      c.fillRect(cx - s * 0.03, cy + s * 0.05, s * 0.06, s * 0.22);
    },
    pistol(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.fillRect(cx - s * 0.5, cy - s * 0.2, s * 0.95, s * 0.2);
      c.fillRect(cx - s * 0.5, cy - s * 0.26, s * 0.12, s * 0.08);
      c.beginPath();
      c.moveTo(cx + s * 0.1, cy);
      c.lineTo(cx + s * 0.42, cy);
      c.lineTo(cx + s * 0.5, cy + s * 0.46);
      c.lineTo(cx + s * 0.22, cy + s * 0.46);
      c.closePath();
      c.fill();
      c.strokeStyle = fg;
      c.lineWidth = s * 0.05;
      c.beginPath();
      c.arc(cx + s * 0.02, cy + s * 0.06, s * 0.1, 0, Math.PI);
      c.stroke();
    },
    rifle(c, cx, cy, s, fg) {
      c.save();
      c.translate(cx, cy);
      c.rotate(-0.35);
      c.fillStyle = fg;
      c.fillRect(-s * 0.6, -s * 0.06, s * 1.2, s * 0.1);
      c.fillRect(s * 0.1, -s * 0.06, s * 0.5, s * 0.16);
      c.beginPath();
      c.moveTo(s * 0.35, s * 0.04);
      c.lineTo(s * 0.62, s * 0.04);
      c.lineTo(s * 0.66, s * 0.26);
      c.lineTo(s * 0.45, s * 0.2);
      c.closePath();
      c.fill();
      c.fillRect(-s * 0.2, -s * 0.16, s * 0.3, s * 0.08);
      c.restore();
    },
    bolt(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      c.moveTo(cx + s * 0.1, cy - s * 0.55);
      c.lineTo(cx - s * 0.3, cy + s * 0.05);
      c.lineTo(cx - s * 0.02, cy + s * 0.05);
      c.lineTo(cx - s * 0.15, cy + s * 0.55);
      c.lineTo(cx + s * 0.3, cy - s * 0.1);
      c.lineTo(cx + s * 0.02, cy - s * 0.1);
      c.closePath();
      c.fill();
    },
    orbit(c, cx, cy, s, fg) {
      c.strokeStyle = fg;
      c.lineWidth = s * 0.06;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.ellipse(cx, cy, s * 0.5, s * 0.18, (i * Math.PI) / 3, 0, Math.PI * 2);
        c.stroke();
      }
      c.fillStyle = fg;
      c.beginPath();
      c.arc(cx, cy, s * 0.1, 0, Math.PI * 2);
      c.fill();
    },
    mushroom(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy - s * 0.25, s * 0.42, s * 0.24, 0, 0, Math.PI * 2);
      c.fill();
      c.fillRect(cx - s * 0.1, cy - s * 0.1, s * 0.2, s * 0.5);
      c.beginPath();
      c.ellipse(cx, cy + s * 0.42, s * 0.5, s * 0.1, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(cx, cy + s * 0.08, s * 0.24, s * 0.06, 0, 0, Math.PI * 2);
      c.fill();
    },
    turtle(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy, s * 0.42, s * 0.28, 0, Math.PI, 0);
      c.fill();
      c.fillRect(cx - s * 0.46, cy - s * 0.02, s * 0.92, s * 0.08);
      c.beginPath();
      c.arc(cx + s * 0.52, cy - s * 0.02, s * 0.1, 0, Math.PI * 2);
      c.fill();
      c.fillRect(cx - s * 0.32, cy + s * 0.04, s * 0.1, s * 0.14);
      c.fillRect(cx + s * 0.22, cy + s * 0.04, s * 0.1, s * 0.14);
      c.strokeStyle = bg;
      c.lineWidth = s * 0.03;
      c.beginPath();
      c.moveTo(cx - s * 0.2, cy - s * 0.22);
      c.lineTo(cx, cy - s * 0.1);
      c.lineTo(cx + s * 0.2, cy - s * 0.22);
      c.stroke();
    },
    chevron(c, cx, cy, s, fg) {
      c.save();
      c.strokeStyle = fg;
      c.lineWidth = s * 0.12;
      c.lineCap = "round";
      c.lineJoin = "round";
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(cx - s * 0.36, cy - s * 0.05 + i * s * 0.2);
        c.lineTo(cx, cy - s * 0.3 + i * s * 0.2);
        c.lineTo(cx + s * 0.36, cy - s * 0.05 + i * s * 0.2);
        c.stroke();
      }
      c.restore();
    },
    glove(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy - s * 0.08, s * 0.36, s * 0.32, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(
        cx - s * 0.32,
        cy + s * 0.02,
        s * 0.14,
        s * 0.2,
        0.4,
        0,
        Math.PI * 2,
      );
      c.fill();
      c.fillRect(cx - s * 0.26, cy + s * 0.18, s * 0.5, s * 0.3);
      c.fillStyle = bg;
      c.fillRect(cx - s * 0.26, cy + s * 0.24, s * 0.5, s * 0.05);
    },
    cross(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.fillRect(cx - s * 0.13, cy - s * 0.42, s * 0.26, s * 0.84);
      c.fillRect(cx - s * 0.42, cy - s * 0.13, s * 0.84, s * 0.26);
    },
    tube(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy - s * 0.1, s * 0.22, s * 0.36, 0, 0, Math.PI * 2);
      c.fill();
      c.fillRect(cx - s * 0.24, cy + s * 0.2, s * 0.48, s * 0.2);
      c.strokeStyle = bg;
      c.lineWidth = s * 0.04;
      c.beginPath();
      c.moveTo(cx - s * 0.1, cy + s * 0.15);
      c.lineTo(cx - s * 0.1, cy - s * 0.2);
      c.lineTo(cx + s * 0.1, cy - s * 0.2);
      c.lineTo(cx + s * 0.1, cy + s * 0.15);
      c.stroke();
      for (const dx of [-0.16, -0.05, 0.05, 0.16])
        c.fillRect(cx + dx * s - s * 0.02, cy + s * 0.4, s * 0.04, s * 0.14);
    },
    wrench(c, cx, cy, s, fg, bg) {
      c.save();
      c.translate(cx, cy);
      c.rotate(-0.8);
      c.fillStyle = fg;
      c.fillRect(-s * 0.07, -s * 0.3, s * 0.14, s * 0.8);
      c.beginPath();
      c.arc(0, -s * 0.36, s * 0.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = bg;
      c.fillRect(-s * 0.07, -s * 0.6, s * 0.14, s * 0.26);
      c.restore();
    },
    dome(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      c.arc(cx, cy, s * 0.32, Math.PI, 0);
      c.fill();
      c.fillRect(cx - s * 0.5, cy, s, s * 0.1);
      for (let i = -3; i <= 3; i++)
        c.fillRect(
          cx + i * s * 0.13 - s * 0.03,
          cy + s * 0.1,
          s * 0.06,
          s * 0.28,
        );
      c.fillRect(cx - s * 0.55, cy + s * 0.38, s * 1.1, s * 0.1);
      c.fillRect(cx - s * 0.03, cy - s * 0.5, s * 0.06, s * 0.2);
    },
    star(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5,
          r = i % 2 ? s * 0.2 : s * 0.5;
        c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      c.closePath();
      c.fill();
    },
    hat(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy + s * 0.15, s * 0.55, s * 0.12, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.moveTo(cx - s * 0.3, cy + s * 0.12);
      c.quadraticCurveTo(cx - s * 0.3, cy - s * 0.42, cx, cy - s * 0.3);
      c.quadraticCurveTo(
        cx + s * 0.3,
        cy - s * 0.42,
        cx + s * 0.3,
        cy + s * 0.12,
      );
      c.fill();
    },
    compass(c, cx, cy, s, fg, bg) {
      c.strokeStyle = fg;
      c.lineWidth = s * 0.08;
      c.beginPath();
      c.arc(cx, cy, s * 0.42, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = fg;
      c.beginPath();
      c.moveTo(cx, cy - s * 0.36);
      c.lineTo(cx + s * 0.1, cy);
      c.lineTo(cx, cy + s * 0.36);
      c.lineTo(cx - s * 0.1, cy);
      c.closePath();
      c.fill();
      c.fillStyle = bg;
      c.beginPath();
      c.arc(cx, cy, s * 0.05, 0, Math.PI * 2);
      c.fill();
    },
    mask(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy, s * 0.5, s * 0.22, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = bg;
      c.beginPath();
      c.ellipse(cx - s * 0.2, cy, s * 0.1, s * 0.07, 0, 0, Math.PI * 2);
      c.fill();
      c.beginPath();
      c.ellipse(cx + s * 0.2, cy, s * 0.1, s * 0.07, 0, 0, Math.PI * 2);
      c.fill();
    },
    dollar(c, cx, cy, s, fg) {
      text(c, "$", cx, cy, Math.round(s * 1.1), fg, { font: "Georgia, serif" });
    },
    handshake(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.save();
      c.translate(cx, cy);
      c.rotate(-0.25);
      c.fillRect(-s * 0.55, -s * 0.1, s * 0.5, s * 0.2);
      c.fillRect(s * 0.05, -s * 0.1, s * 0.5, s * 0.2);
      c.beginPath();
      c.ellipse(0, 0, s * 0.2, s * 0.16, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    },
    sword(c, cx, cy, s, fg) {
      c.save();
      c.translate(cx, cy);
      c.rotate(0.7);
      c.fillStyle = fg;
      c.fillRect(-s * 0.04, -s * 0.55, s * 0.08, s * 0.8);
      c.fillRect(-s * 0.2, s * 0.22, s * 0.4, s * 0.06);
      c.fillRect(-s * 0.035, s * 0.28, s * 0.07, s * 0.2);
      c.restore();
    },
    tent(c, cx, cy, s, fg) {
      c.fillStyle = fg;
      c.beginPath();
      c.moveTo(cx - s * 0.5, cy + s * 0.35);
      c.lineTo(cx, cy - s * 0.4);
      c.lineTo(cx + s * 0.5, cy + s * 0.35);
      c.closePath();
      c.fill();
      for (const dx of [-0.35, 0.4]) {
        c.beginPath();
        c.moveTo(cx + dx * s - s * 0.12, cy + s * 0.35);
        c.lineTo(cx + dx * s, cy - s * 0.05);
        c.lineTo(cx + dx * s + s * 0.12, cy + s * 0.35);
        c.closePath();
        c.fill();
      }
    },
    grenade(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.ellipse(cx, cy + s * 0.08, s * 0.3, s * 0.36, 0, 0, Math.PI * 2);
      c.fill();
      c.fillRect(cx - s * 0.12, cy - s * 0.4, s * 0.24, s * 0.14);
      c.strokeStyle = fg;
      c.lineWidth = s * 0.05;
      c.beginPath();
      c.arc(cx + s * 0.22, cy - s * 0.36, s * 0.1, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = bg;
      c.lineWidth = s * 0.03;
      for (const dy of [-0.08, 0.1, 0.28]) {
        c.beginPath();
        c.moveTo(cx - s * 0.28, cy + dy * s);
        c.lineTo(cx + s * 0.28, cy + dy * s);
        c.stroke();
      }
    },
    eye(c, cx, cy, s, fg, bg) {
      c.fillStyle = fg;
      c.beginPath();
      c.moveTo(cx - s * 0.5, cy);
      c.quadraticCurveTo(cx, cy - s * 0.4, cx + s * 0.5, cy);
      c.quadraticCurveTo(cx, cy + s * 0.4, cx - s * 0.5, cy);
      c.fill();
      c.fillStyle = bg;
      c.beginPath();
      c.arc(cx, cy, s * 0.14, 0, Math.PI * 2);
      c.fill();
    },
  };
  /**
   * Cover recipes. style: 'mag' (masthead band + art + price bubble), 'comic' (burst + big title),
   * 'hard' (cloth binding with gold frame), 'journal' (white academic), 'pamphlet' (civil-defence).
   */
  const COVERS = {
    sb_riflemans_companion: {
      style: "hard",
      t: "THE RIFLEMAN'S",
      t2: "COMPANION",
      bg: "#3a4a2a",
      fg: "#e0c060",
      art: "rifle",
      ink: "#e8d890",
    },
    sb_super_sergeant: {
      style: "comic",
      t: "SUPER",
      t2: "SERGEANT #22",
      bg: "#1e3a6a",
      fg: "#f2c43a",
      art: "chevron",
      ink: "#c8201a",
    },
    sb_golden_gloves: {
      style: "mag",
      t: "GOLDEN GLOVES",
      t2: "ANNUAL",
      bg: "#e8e0c8",
      band: "#1e3a7a",
      fg: "#ffffff",
      art: "glove",
      ink: "#b02020",
    },
    sb_demolitions: {
      style: "pamphlet",
      t: "FM 5-25",
      t2: "DEMOLITIONS",
      bg: "#d8d0a8",
      fg: "#3a4a1a",
      art: "grenade",
      ink: "#3a4a1a",
    },
    sb_bellevue_manual: {
      style: "journal",
      t: "BELLEVUE HOSPITAL",
      t2: "EMERGENCY WARD",
      bg: "#f0ece2",
      fg: "#1e2a4a",
      art: "cross",
      ink: "#b01c18",
    },
    sb_motor_manual: {
      style: "mag",
      t: "HOLLIS MOTOR",
      t2: "REPAIR MANUAL",
      bg: "#d87a28",
      band: "#2a2a2a",
      fg: "#f0c050",
      art: "wrench",
      ink: "#2a1a0c",
    },
    sb_handyman: {
      style: "hard",
      t: "HANDYMAN'S",
      t2: "BIG BOOK",
      bg: "#7a2a1a",
      fg: "#e8d090",
      art: "wrench",
      ink: "#e8d090",
    },
    sb_radio_handbook: {
      style: "hard",
      t: "RADIO AMATEUR",
      t2: "HANDBOOK",
      bg: "#1e2c52",
      fg: "#d8b048",
      art: "bolt",
      ink: "#e8d070",
    },
    sb_popular_circuits: {
      style: "mag",
      t: "POPULAR",
      t2: "CIRCUITS",
      bg: "#20306a",
      band: "#f0c020",
      fg: "#1a1a3a",
      art: "tube",
      ink: "#f0f0ff",
    },
    sb_bureau_manual: {
      style: "hard",
      t: "BUREAU SEPT",
      t2: "MANUEL DE TERRAIN",
      bg: "#1a1a24",
      fg: "#c8c8d8",
      art: "eye",
      ink: "#c8c8d8",
    },
    sb_art_of_the_pitch: {
      style: "hard",
      t: "THE ART OF",
      t2: "THE PITCH",
      bg: "#1a2448",
      fg: "#d8d8e0",
      art: "handshake",
      ink: "#c8c8d8",
    },
    sb_pushcart_king: {
      style: "pamphlet",
      t: "PUSHCART",
      t2: "KING",
      bg: "#c89a60",
      fg: "#4a2410",
      art: "hat",
      ink: "#4a2410",
    },
    sb_survival_handbook: {
      style: "pamphlet",
      t: "SURVIVAL",
      t2: "HANDBOOK",
      bg: "#ece0bc",
      fg: "#1e3a7a",
      art: "tent",
      ink: "#3a5a2a",
    },
  };
  function paintCover(c, x, y, spec, seed) {
    const r = rng(seed);
    const art = PICTO[spec.art] || PICTO.star;
    c.fillStyle = spec.bg;
    c.fillRect(x, y, CELL, CELL);
    if (spec.style === "mag") {
      c.fillStyle = spec.band;
      c.fillRect(x, y, CELL, 38);
      text(c, spec.t, x + 64, y + 13, 15, spec.fg, { maxW: 118 });
      text(c, spec.t2, x + 64, y + 30, 13, spec.fg, {
        maxW: 118,
        italic: true,
      });
      // halftone backdrop behind the art
      c.fillStyle = "rgba(0,0,0,0.08)";
      for (let i = 0; i < 70; i++) {
        c.beginPath();
        c.arc(
          x + 20 + (i % 10) * 10,
          y + 48 + Math.floor(i / 10) * 10,
          2.2,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
      art(c, x + 64, y + 80, 58, spec.ink, spec.bg);
      c.fillStyle = spec.band;
      c.beginPath();
      c.arc(x + 108, y + 110, 13, 0, Math.PI * 2);
      c.fill();
      text(c, "25¢", x + 108, y + 110, 10, spec.fg);
      text(c, "MAR 1967", x + 30, y + 118, 8, spec.ink, {
        weight: "normal",
        font: "Arial, sans-serif",
      });
    } else if (spec.style === "comic") {
      c.fillStyle = spec.fg;
      c.beginPath();
      for (let i = 0; i < 18; i++) {
        const a = (i * Math.PI) / 9,
          rr = i % 2 ? 40 : 58;
        c.lineTo(x + 64 + Math.cos(a) * rr, y + 80 + Math.sin(a) * rr * 0.8);
      }
      c.closePath();
      c.fill();
      art(
        c,
        x + 64,
        y + 82,
        54,
        spec.ink === "#f0f0f0" ? spec.bg : spec.ink,
        spec.fg,
      );
      text(c, spec.t, x + 64, y + 16, 19, spec.fg, {
        maxW: 120,
        stroke: "#1a0a04",
        strokeW: 4,
      });
      text(c, spec.t2, x + 64, y + 34, 10, spec.ink, { maxW: 118 });
      c.fillStyle = "#ffffff";
      c.fillRect(x + 6, y + 6, 18, 14);
      text(c, "10¢", x + 15, y + 13, 8, "#1a1a1a");
    } else if (spec.style === "hard") {
      c.strokeStyle = spec.fg;
      c.lineWidth = 3;
      c.strokeRect(x + 9, y + 9, CELL - 18, CELL - 18);
      c.lineWidth = 1;
      c.strokeRect(x + 14, y + 14, CELL - 28, CELL - 28);
      text(c, spec.t, x + 64, y + 32, 14, spec.fg, {
        maxW: 96,
        font: 'Georgia, "Times New Roman", serif',
      });
      text(c, spec.t2, x + 64, y + 48, 10, spec.fg, {
        maxW: 96,
        font: 'Georgia, "Times New Roman", serif',
      });
      art(c, x + 64, y + 86, 44, spec.ink, spec.bg);
      // cloth weave
      c.fillStyle = "rgba(255,255,255,0.035)";
      for (let i = 0; i < CELL; i += 3) c.fillRect(x, y + i, CELL, 1);
    } else if (spec.style === "journal") {
      c.fillStyle = spec.fg;
      c.fillRect(x, y + 6, CELL, 4);
      c.fillRect(x, y + 44, CELL, 2);
      text(c, spec.t, x + 64, y + 20, 10, spec.fg, {
        maxW: 116,
        font: 'Georgia, "Times New Roman", serif',
      });
      text(c, spec.t2, x + 64, y + 34, 9, spec.fg, {
        maxW: 116,
        font: 'Georgia, "Times New Roman", serif',
        weight: "normal",
      });
      art(c, x + 64, y + 76, 40, spec.ink, spec.bg);
      lines(c, x + 14, y + 100, 100, 22, 4, "rgba(30,40,70,0.45)", seed + 5);
    } else {
      // pamphlet
      c.fillStyle = spec.fg;
      c.fillRect(x + 6, y + 6, CELL - 12, 40);
      text(c, spec.t, x + 64, y + 18, 15, spec.bg, { maxW: 110 });
      text(c, spec.t2, x + 64, y + 36, 13, spec.bg, { maxW: 110 });
      art(c, x + 64, y + 84, 56, spec.ink, spec.bg);
      text(c, "CIVIL DEFENSE SERIES", x + 64, y + 120, 7, spec.fg, {
        weight: "normal",
        font: "Arial, sans-serif",
      });
    }
    // age: sun-faded top, foxing, creased corner
    wear(c, x, y, seed, 1.1);
    c.fillStyle = "rgba(150,110,50,0.10)";
    for (let i = 0; i < 8; i++) {
      c.beginPath();
      c.arc(x + r() * CELL, y + r() * CELL, 2 + r() * 5, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "rgba(245,235,210,0.5)";
    c.beginPath();
    c.moveTo(x + CELL, y + CELL - 16);
    c.lineTo(x + CELL, y + CELL);
    c.lineTo(x + CELL - 16, y + CELL);
    c.closePath();
    c.fill();
  }
  Object.keys(COVERS).forEach((name, i) => {
    PAINT[name] = (c, x, y) => paintCover(c, x, y, COVERS[name], 200 + i * 13);
  });
  /** Stacked page edges (side faces of books, comics and pamphlets). */
  PAINT.page_edge = (c, x, y) => {
    c.fillStyle = "#e4dac0";
    c.fillRect(x, y, CELL, CELL);
    const r = rng(311);
    for (let i = 0; i < CELL; i += 2) {
      c.fillStyle = "rgba(90,70,40," + (0.06 + r() * 0.12) + ")";
      c.fillRect(x, y + i, CELL, 1);
    }
    wear(c, x, y, 312, 0.8);
  };

  function build() {
    if (built) return tex;
    built = true;
    if (typeof document === "undefined" || !THREE) return null;
    try {
      canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      for (const name of CELLS) {
        const p = cellXY(name);
        ctx.save();
        ctx.beginPath();
        ctx.rect(p.x, p.y, CELL, CELL);
        ctx.clip();
        try {
          (PAINT[name] || PAINT.white)(ctx, p.x, p.y);
        } catch (e) {
          ctx.fillStyle = "#fff";
          ctx.fillRect(p.x, p.y, CELL, CELL);
        }
        ctx.restore();
      }
      tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.userData = { shared: true };
    } catch (e) {
      G.reportError("rpg:art", e);
      tex = null;
    }
    return tex;
  }

  /** UV rect of a cell (inset so mip levels don't bleed the neighbours in). */
  function cell(name) {
    const p = cellXY(INDEX[name] !== undefined ? name : "white");
    const u0 = (p.x + INSET) / SIZE,
      u1 = (p.x + CELL - INSET) / SIZE;
    const v1 = 1 - (p.y + INSET) / SIZE_H,
      v0 = 1 - (p.y + CELL - INSET) / SIZE_H;
    return { u0, v0, u1, v1 };
  }
  const WHITE = (() => {
    const c = cell("white");
    return { u: (c.u0 + c.u1) / 2, v: (c.v0 + c.v1) / 2 };
  })();

  // ------------------------------------------------------------------
  // Geometry kit (vertex colour + atlas UVs; parts are merged into one mesh)
  // ------------------------------------------------------------------
  /** Vertex colour with subtle per-vertex grime variation (AO-ish, darker at the base). */
  function paintVar(g, color, jitter) {
    const c = new THREE.Color(color),
      n = g.attributes.position.count,
      a = new Float32Array(n * 3);
    const pos = g.attributes.position;
    for (let i = 0; i < n; i++) {
      const y = pos.getY(i);
      const k =
        1 -
        (jitter === undefined ? 0.08 : jitter) *
          U.hash2(i * 7 + 3, Math.round(y * 97)) -
        (y < 0.005 ? 0.12 : 0);
      a[i * 3] = c.r * k;
      a[i * 3 + 1] = c.g * k;
      a[i * 3 + 2] = c.b * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(a, 3));
    return g;
  }
  /** Point every UV at the white texel (plain vertex-coloured part). */
  function uvWhite(g) {
    const n = g.attributes.position.count,
      a = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      a[i * 2] = WHITE.u;
      a[i * 2 + 1] = WHITE.v;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(a, 2));
    return g;
  }
  /** Remap the geometry's own 0..1 UVs into a cell; `filter(i)` limits it to some vertices (others → white). */
  function uvCell(g, name, filter, flipU) {
    const r = cell(name);
    const uv = g.attributes.uv;
    if (!uv) return uvWhite(g);
    const n = uv.count,
      a = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) {
      if (filter && !filter(i)) {
        a[i * 2] = WHITE.u;
        a[i * 2 + 1] = WHITE.v;
        continue;
      }
      let u = U.clamp(uv.getX(i), 0, 1),
        v = U.clamp(uv.getY(i), 0, 1);
      if (flipU) u = 1 - u;
      a[i * 2] = r.u0 + u * (r.u1 - r.u0);
      a[i * 2 + 1] = r.v0 + v * (r.v1 - r.v0);
    }
    g.setAttribute("uv", new THREE.BufferAttribute(a, 2));
    return g;
  }
  // BoxGeometry(1 segment) face order: +x, -x, +y, -y, +z, -z — 4 vertices each
  const FACE = { x: 0, X: 1, y: 2, Y: 3, z: 4, Z: 5 };
  function boxFaceFilter(faces) {
    if (!faces || faces === "all") return null;
    const on = {};
    for (const ch of faces) if (FACE[ch] !== undefined) on[FACE[ch]] = true;
    return (i) => !!on[Math.floor(i / 4)];
  }

  function kit() {
    const parts = [];
    const push = (g, pos, ry, scale, rx, rz) => {
      parts.push(
        U.bake(
          g,
          pos,
          ry || 0,
          scale === undefined ? 1 : scale,
          rx || 0,
          rz || 0,
        ),
      );
    };
    const P = (x, y, z) => ({ x: x || 0, y: y || 0, z: z || 0 });
    const K = {
      parts,
      box(w, h, d, color, x, y, z, ry, rx, rz) {
        push(
          uvWhite(paintVar(new THREE.BoxGeometry(w, h, d), color)),
          P(x, y, z),
          ry,
          1,
          rx,
          rz,
        );
        return K;
      },
      cyl(rt, rb, h, color, x, y, z, seg, rx, rz, ry) {
        push(
          uvWhite(
            paintVar(new THREE.CylinderGeometry(rt, rb, h, seg || 12), color),
          ),
          P(x, y, z),
          ry,
          1,
          rx,
          rz,
        );
        return K;
      },
      sph(r, color, x, y, z, sx, sy, sz, seg) {
        push(
          uvWhite(
            paintVar(
              new THREE.SphereGeometry(
                r,
                seg || 10,
                Math.max(6, (seg || 10) - 2),
              ),
              color,
            ),
          ),
          P(x, y, z),
          0,
          new THREE.Vector3(sx || 1, sy || 1, sz || 1),
        );
        return K;
      },
      lathe(pts, color, x, y, z, seg, rx, rz) {
        push(
          uvWhite(
            paintVar(
              new THREE.LatheGeometry(
                pts.map((p) => new THREE.Vector2(p[0], p[1])),
                seg || 14,
              ),
              color,
            ),
          ),
          P(x, y, z),
          0,
          1,
          rx,
          rz,
        );
        return K;
      },
      torus(r, t, color, x, y, z, rx, ry, arc) {
        push(
          uvWhite(
            paintVar(
              new THREE.TorusGeometry(r, t, 6, 14, arc || Math.PI * 2),
              color,
            ),
          ),
          P(x, y, z),
          ry,
          1,
          rx,
        );
        return K;
      },
      cone(r, h, color, x, y, z, seg, rx, rz) {
        push(
          uvWhite(paintVar(new THREE.ConeGeometry(r, h, seg || 10), color)),
          P(x, y, z),
          0,
          1,
          rx,
          rz,
        );
        return K;
      },
      /** Box with a cell on some faces ('z' front, 'Z' back, 'y' top, 'all'…). Colour tints the whole box. */
      boxL(w, h, d, color, cellName, faces, x, y, z, ry, rx, rz) {
        push(
          uvCell(
            paintVar(new THREE.BoxGeometry(w, h, d), color, 0.04),
            cellName,
            boxFaceFilter(faces || "z"),
          ),
          P(x, y, z),
          ry,
          1,
          rx,
          rz,
        );
        return K;
      },
      /** Cylinder whose side wears the cell (wrap-around label); ends white. */
      cylL(rt, rb, h, color, cellName, x, y, z, seg, rx, rz, ry) {
        const g = new THREE.CylinderGeometry(rt, rb, h, seg || 14, 1, true);
        push(
          uvCell(paintVar(g, color, 0.03), cellName),
          P(x, y, z),
          ry,
          1,
          rx,
          rz,
        );
        return K;
      },
      /** Flat disc facing +y (can lids, cap tops, dials) wearing the cell. */
      discL(r, color, cellName, x, y, z, rx, rz, seg) {
        const g = new THREE.CircleGeometry(r, seg || 16);
        g.rotateX(-Math.PI / 2);
        push(
          uvCell(paintVar(g, color, 0.02), cellName),
          P(x, y, z),
          0,
          1,
          rx,
          rz,
        );
        return K;
      },
      /** Flat rectangle facing +z (decals, stickers) wearing the cell. */
      planeL(w, h, color, cellName, x, y, z, ry, rx) {
        const g = new THREE.PlaneGeometry(w, h);
        push(uvCell(paintVar(g, color, 0.02), cellName), P(x, y, z), ry, 1, rx);
        return K;
      },
      build() {
        const g = U.mergeGeometries(parts);
        parts.forEach((p) => p.dispose());
        return g;
      },
    };
    return K;
  }

  G.items._art = {
    texture: build,
    cell,
    kit,
    CELLS,
    paintVar,
    uvWhite,
    uvCell,
    COVERS,
    /** The atlas canvas (debug: G.items._art.canvas() → document.body.appendChild(...)). */
    canvas: () => {
      build();
      return canvas;
    },
  };
})();
