/* src/poi_eastside/01_mats.js */
/* =====================================================================
 * NEW RAD CITY — POI EASTSIDE · 01 materials & canvas art
 * Extra materials (P.MAT entries) and procedural canvas textures for the
 * First Journal Building, Tudor City and the New York Life Building:
 *   the First Journal striped brick (white piers / russet spandrels), the
 *   vintage WORLD GLOBE map, the bronze compass-rose lobby floor, clock /
 *   weather-instrument dials, newspaper front pages, the carved entrance
 *   relief, the TUDOR CITY neon letters, gilded pyramid tiles, gilded
 *   coffers, ash bear fur, newsprint.
 * All art original.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pe) return;
  const P = G._pe;
  const TAU = P.TAU,
    PI = P.PI;
  const SERIF = P.FONTS.SERIF,
    SANS = P.FONTS.SANS,
    DECO = P.FONTS.DECO;
  const MAT = P.MAT,
    CUSTOM = P.CUSTOM;

  // ------------------------------------------------------------------
  // small canvas helpers
  // ------------------------------------------------------------------
  function noiseFill(ctx, w, h, r, base, var_, n, sz) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      const v = (r() - 0.5) * var_;
      ctx.fillStyle =
        v > 0 ? "rgba(255,245,230," + v + ")" : "rgba(10,6,2," + -v + ")";
      const s = (sz || 2) * (0.5 + r());
      ctx.fillRect(r() * w, r() * h, s, s);
    }
  }
  P.noiseFill = noiseFill;

  // ------------------------------------------------------------------
  // CUSTOM surfaces (world-projected UVs unless keep)
  // ------------------------------------------------------------------
  // russet spandrel brick (between the First Journal windows)
  CUSTOM.dn_spandrel = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("dn_spandrel");
      ctx.fillStyle = "#5e3226";
      ctx.fillRect(0, 0, w, h);
      const bh = 16,
        bw = 64;
      for (let y = 0, row = 0; y < h; y += bh, row++) {
        for (let x = (-(row % 2) * bw) / 2; x < w; x += bw) {
          const k = 0.75 + r() * 0.35;
          ctx.fillStyle =
            "rgb(" +
            Math.round(128 * k) +
            "," +
            Math.round(62 * k) +
            "," +
            Math.round(46 * k) +
            ")";
          ctx.fillRect(x + 2, y + 2, bw - 3, bh - 3);
        }
      }
      P.blotches(ctx, w, h, r, 20, 0.2);
      P.speckle(ctx, w, h, r, 900);
    },
  ];
  // gilded pyramid tiles (overlapping fish scales)
  CUSTOM.gold_tiles = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("gold_tiles");
      ctx.fillStyle = "#7a5418";
      ctx.fillRect(0, 0, w, h);
      const s = 32;
      for (let y = -s; y < h + s; y += s * 0.55) {
        const row = Math.round(y / (s * 0.55));
        for (let x = -s; x < w + s; x += s) {
          const cx = x + ((row % 2) * s) / 2,
            cy = y;
          const g = ctx.createRadialGradient(
            cx - 6,
            cy - 4,
            2,
            cx,
            cy,
            s * 0.62,
          );
          const k = 0.8 + r() * 0.3,
            tarn = r() < 0.12;
          g.addColorStop(
            0,
            tarn
              ? "#6a6a40"
              : "rgb(" +
                  Math.round(250 * k) +
                  "," +
                  Math.round(214 * k) +
                  "," +
                  Math.round(120 * k) +
                  ")",
          );
          g.addColorStop(
            0.7,
            tarn
              ? "#3e4a2c"
              : "rgb(" +
                  Math.round(196 * k) +
                  "," +
                  Math.round(140 * k) +
                  "," +
                  Math.round(48 * k) +
                  ")",
          );
          g.addColorStop(1, "#4a3010");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, s * 0.55, 0, PI);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "rgba(60,36,8,0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, s * 0.55, 0, PI);
          ctx.stroke();
        }
      }
      P.blotches(ctx, w, h, r, 16, 0.25);
    },
  ];
  // gilded ceiling coffers (NY Life lobby)
  CUSTOM.coffer = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("coffer");
      ctx.fillStyle = "#6a4a18";
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#e8c870");
      g.addColorStop(0.5, "#b8862c");
      g.addColorStop(1, "#7a5418");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // recessed panel
      ctx.fillStyle = "#23384a";
      ctx.fillRect(34, 34, w - 68, h - 68);
      ctx.strokeStyle = "#f0d890";
      ctx.lineWidth = 6;
      ctx.strokeRect(22, 22, w - 44, h - 44);
      ctx.strokeStyle = "#5a3a10";
      ctx.lineWidth = 3;
      ctx.strokeRect(34, 34, w - 68, h - 68);
      // gilt rosette
      ctx.save();
      ctx.translate(w / 2, h / 2);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(TAU / 12);
        ctx.fillStyle = i % 2 ? "#e8c060" : "#b08030";
        ctx.beginPath();
        ctx.ellipse(0, -22, 8, 22, 0, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = "#fff0b0";
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, TAU);
      ctx.fill();
      ctx.restore();
      P.blotches(ctx, w, h, r, 20, 0.3);
      P.speckle(ctx, w, h, r, 500, 0.35);
    },
  ];
  // ash bear fur / nest bedding
  CUSTOM.fur = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("fur");
      ctx.fillStyle = "#2a2018";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) {
        const x = r() * w,
          y = r() * h,
          L = 4 + r() * 10,
          a = 1.2 + (r() - 0.5) * 0.8;
        const k = r();
        ctx.strokeStyle =
          k < 0.5
            ? "rgba(20,14,10,0.7)"
            : k < 0.85
              ? "rgba(80,60,40,0.55)"
              : "rgba(140,110,80,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L);
        ctx.stroke();
      }
      P.blotches(ctx, w, h, r, 10, 0.3);
    },
  ];
  // newsprint (dense columns of grey type) — stacks, bundles, press webs
  CUSTOM.newsprint = [
    512,
    512,
    (ctx, w, h) => {
      const r = P.rng("newsprint");
      ctx.fillStyle = "#d6cfb8";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(30,26,20,0.75)";
      ctx.font = "bold 34px " + SERIF;
      ctx.textAlign = "center";
      ctx.fillText(
        r() < 0.5 ? "THE DAILY RUIN" : "THE FIRST JOURNAL",
        w / 2,
        40,
        w - 30,
      );
      ctx.fillRect(10, 52, w - 20, 3);
      for (let c = 0; c < 6; c++) {
        const x0 = 12 + (c * (w - 24)) / 6;
        for (let y = 64; y < h - 10; y += 7) {
          if (r() < 0.04) {
            y += 30;
            ctx.fillStyle = "rgba(40,36,30,0.5)";
            ctx.fillRect(x0, y - 26, (w - 24) / 6 - 8, 22);
            ctx.fillStyle = "rgba(30,26,20,0.75)";
            continue;
          }
          ctx.fillRect(x0, y, ((w - 24) / 6 - 8) * (0.7 + r() * 0.3), 3);
        }
      }
      P.blotches(ctx, w, h, r, 30, 0.2);
    },
  ];
  // raider-daubed hide / cloth banner
  CUSTOM.tapestry = [
    256,
    512,
    (ctx, w, h) => {
      const r = P.rng("tapestry");
      ctx.fillStyle = "#5a1a18";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#c8a040";
      ctx.lineWidth = 8;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      // heraldic shield with a skull
      ctx.fillStyle = "#1a1414";
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.25);
      ctx.lineTo(w * 0.8, h * 0.25);
      ctx.lineTo(w * 0.8, h * 0.5);
      ctx.quadraticCurveTo(w * 0.5, h * 0.72, w * 0.2, h * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#d8ccb0";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.4, 30, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#1a1414";
      ctx.beginPath();
      ctx.arc(w * 0.44, h * 0.39, 8, 0, TAU);
      ctx.arc(w * 0.56, h * 0.39, 8, 0, TAU);
      ctx.fill();
      ctx.fillRect(w * 0.45, h * 0.44, w * 0.1, 10);
      // crown
      ctx.fillStyle = "#d8b040";
      ctx.beginPath();
      ctx.moveTo(w * 0.36, h * 0.2);
      ctx.lineTo(w * 0.36, h * 0.12);
      ctx.lineTo(w * 0.43, h * 0.17);
      ctx.lineTo(w * 0.5, h * 0.1);
      ctx.lineTo(w * 0.57, h * 0.17);
      ctx.lineTo(w * 0.64, h * 0.12);
      ctx.lineTo(w * 0.64, h * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e0d0a0";
      ctx.font = "bold 30px " + SERIF;
      ctx.textAlign = "center";
      ctx.fillText("KNEEL", w / 2, h * 0.84);
      // tatters
      ctx.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        const x = r() * w;
        ctx.moveTo(x, h);
        ctx.lineTo(x + 6 + r() * 12, h - 10 - r() * 60);
        ctx.lineTo(x + 14 + r() * 10, h);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      P.blotches(ctx, w, h, r, 30, 0.35);
    },
  ];

  // ------------------------------------------------------------------
  // Materials
  // ------------------------------------------------------------------
  Object.assign(MAT, {
    dn_brick: { src: "brick_white", tint: 0xfffcf4, color: 0xe8e2d4, uv: 1.1 },
    dn_brick_dirty: {
      src: "brick_white",
      tint: 0xb8b0a2,
      color: 0xa8a092,
      uv: 2.4,
    },
    dn_spandrel: { custom: "dn_spandrel", color: 0x6a3a2c, uv: 1.6 },
    black_glass: { color: 0x07090b, rough: 0.12, metal: 0.7, uv: 2 },
    black_marble: {
      src: "marble_dark",
      tint: 0x8a8c88,
      color: 0x2a2c2c,
      uv: 3,
      rough: 0.3,
    },
    marble_cream: {
      src: "marble",
      tint: 0xf2e4c8,
      color: 0xd8ccb0,
      uv: 3,
      rough: 0.4,
    },
    marble_rose: {
      src: "marble",
      tint: 0xe0b8a8,
      color: 0xc09888,
      uv: 3,
      rough: 0.4,
    },
    tudor_brick: { src: "brick_brown", tint: 0xc07c62, color: 0x8a5040, uv: 3 },
    tudor_brick_dark: {
      src: "brick_brown",
      tint: 0x7a4c3c,
      color: 0x5a3428,
      uv: 3,
    },
    gold_tiles: {
      custom: "gold_tiles",
      color: 0xc89a3a,
      uv: 2.2,
      metal: 0.65,
      rough: 0.38,
    },
    coffer: {
      custom: "coffer",
      color: 0xb8862c,
      uv: 1.6,
      metal: 0.4,
      rough: 0.5,
    },
    fur: { custom: "fur", color: 0x2a2018, uv: 1.4, rough: 1 },
    newsprint: { custom: "newsprint", color: 0xd0c8b0, uv: 0.9, rough: 1 },
    tapestry: {
      custom: "tapestry",
      color: 0x5a1a18,
      uv: 1,
      keep: true,
      rough: 1,
    },
    press_green: {
      src: "metal_painted",
      tint: 0x98b0a0,
      color: 0x5a7060,
      uv: 2,
      metal: 0.12,
      rough: 0.6,
    },
    lino: {
      src: "tile_floor",
      tint: 0x9a8a70,
      color: 0x6a5a48,
      uv: 1.2,
      rough: 0.7,
    },
    press_dark: {
      src: "metal_painted",
      tint: 0x5a625c,
      color: 0x2a302c,
      uv: 2,
      metal: 0.2,
      rough: 0.55,
    },
    ink: { color: 0x0b0b0d, rough: 0.35, metal: 0.2, uv: 1 },
    brass: {
      src: "gold",
      tint: 0xc8a060,
      color: 0xa8843a,
      uv: 1,
      metal: 0.8,
      rough: 0.35,
    },
    tar: { src: "roof_tar", color: 0x2a2826, uv: 4 },
    neon_red: {
      color: 0xff4030,
      emissive: 0xff2412,
      ei: 2.6,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    neon_dead: { color: 0x3a1a16, rough: 0.4, uv: 1 },
    neon_amber: {
      color: 0xffc070,
      emissive: 0xffa030,
      ei: 2.2,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    well_glow: {
      color: 0xa8e0ff,
      emissive: 0x6ab0ff,
      ei: 1.4,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    lamp_cool: {
      color: 0xe8f4ff,
      emissive: 0xd0e8ff,
      ei: 1.8,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    burlap: { src: "burlap", color: 0x8a7a58, uv: 1 },
    dayglass: {
      color: 0x8a9488,
      emissive: 0x8a9a86,
      ei: 0.75,
      plain: true,
      noShadow: true,
      uv: 2,
    },
    daylight: {
      color: 0xd8e0c8,
      emissive: 0xc8d4b8,
      ei: 1.3,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    gore: { src: "blood", color: 0x3a0806, uv: 1, rough: 0.3 },
  });

  // ------------------------------------------------------------------
  // Keep-UV textured materials (maps authored for a single quad / mesh)
  // ------------------------------------------------------------------
  // --- the WORLD GLOBE (equirectangular, 1930 vintage cartography) ---
  const LANDS = {
    namerica: [
      [-168, 65],
      [-160, 71],
      [-140, 70],
      [-120, 71],
      [-95, 72],
      [-85, 68],
      [-80, 62],
      [-78, 58],
      [-64, 60],
      [-60, 55],
      [-55, 50],
      [-60, 47],
      [-67, 45],
      [-70, 42],
      [-74, 40],
      [-76, 37],
      [-76, 35],
      [-81, 31],
      [-80, 26],
      [-82, 25],
      [-83, 29],
      [-89, 30],
      [-94, 29],
      [-97, 27],
      [-97, 22],
      [-94, 18],
      [-91, 19],
      [-87, 21],
      [-88, 16],
      [-84, 15],
      [-83, 10],
      [-79, 9],
      [-77, 8],
      [-80, 7],
      [-84, 9],
      [-86, 12],
      [-92, 14],
      [-96, 16],
      [-105, 20],
      [-106, 23],
      [-110, 24],
      [-112, 29],
      [-115, 30],
      [-117, 33],
      [-120, 35],
      [-123, 38],
      [-124, 42],
      [-124, 48],
      [-128, 51],
      [-133, 56],
      [-140, 60],
      [-148, 61],
      [-153, 59],
      [-158, 57],
      [-165, 55],
      [-162, 59],
      [-166, 62],
    ],
    greenland: [
      [-73, 78],
      [-60, 82],
      [-30, 83],
      [-20, 80],
      [-20, 72],
      [-26, 68],
      [-40, 64],
      [-44, 60],
      [-50, 62],
      [-54, 68],
      [-60, 75],
    ],
    samerica: [
      [-80, 10],
      [-72, 12],
      [-62, 11],
      [-58, 7],
      [-51, 4],
      [-50, 0],
      [-44, -2],
      [-35, -6],
      [-39, -14],
      [-40, -22],
      [-48, -26],
      [-53, -34],
      [-58, -38],
      [-62, -40],
      [-65, -45],
      [-67, -50],
      [-69, -55],
      [-74, -52],
      [-74, -44],
      [-72, -35],
      [-71, -25],
      [-70, -18],
      [-76, -14],
      [-81, -6],
      [-80, 0],
      [-78, 3],
      [-77, 7],
    ],
    europe: [
      [-10, 36],
      [-9, 43],
      [-2, 43.5],
      [-1, 46],
      [-4, 48],
      [0, 49.5],
      [3, 51],
      [5, 53],
      [8, 54],
      [9, 57],
      [11, 58],
      [5, 59],
      [5, 62],
      [10, 64],
      [15, 69],
      [20, 70],
      [28, 71],
      [33, 69],
      [40, 67],
      [44, 68],
      [42, 60],
      [40, 55],
      [36, 47],
      [30, 45],
      [29, 41],
      [26, 40],
      [23, 37],
      [21, 39],
      [19, 42],
      [16, 43.5],
      [13, 45.5],
      [12.5, 44],
      [16, 41],
      [18, 40],
      [16, 38],
      [12, 38],
      [10, 44],
      [7, 43.5],
      [3, 43],
      [0, 40],
      [-2, 37],
    ],
    scandinavia_hole: null,
    africa: [
      [-17, 21],
      [-16, 28],
      [-10, 30],
      [-6, 36],
      [3, 37],
      [10, 37],
      [11, 33],
      [20, 31],
      [30, 31],
      [32, 31],
      [34, 28],
      [38, 22],
      [43, 13],
      [51, 12],
      [51, 10],
      [44, 2],
      [40, -3],
      [40, -11],
      [36, -20],
      [35, -24],
      [32, -28],
      [27, -34],
      [20, -35],
      [18, -30],
      [15, -26],
      [12, -18],
      [13, -12],
      [12, -5],
      [9, -1],
      [9, 4],
      [5, 5],
      [-3, 5],
      [-8, 4.5],
      [-12, 7],
      [-15, 11],
      [-17, 15],
    ],
    madagascar: [
      [44, -25],
      [47, -25],
      [50, -15],
      [49, -12],
      [44, -17],
    ],
    asia: [
      [29, 41],
      [36, 36],
      [35, 32],
      [34, 28],
      [38, 22],
      [43, 13],
      [45, 13],
      [52, 17],
      [56, 18],
      [59, 23],
      [56, 26],
      [52, 25],
      [50, 30],
      [57, 26],
      [62, 25],
      [67, 24],
      [70, 21],
      [73, 17],
      [77, 8],
      [80, 10],
      [80, 15],
      [86, 21],
      [90, 22],
      [94, 17],
      [98, 16],
      [99, 9],
      [101, 3],
      [104, 1.5],
      [103, 8],
      [105, 9],
      [109, 12],
      [108, 17],
      [106, 20],
      [110, 21],
      [117, 23],
      [121, 29],
      [122, 32],
      [120, 36],
      [122, 40],
      [125, 40],
      [127, 36],
      [129, 35],
      [130, 42],
      [140, 48],
      [141, 53],
      [137, 54],
      [140, 59],
      [155, 59],
      [162, 62],
      [170, 60],
      [180, 65],
      [180, 69],
      [170, 70],
      [160, 70],
      [140, 72],
      [130, 71],
      [115, 74],
      [110, 77],
      [100, 79],
      [90, 76],
      [80, 73],
      [70, 73],
      [67, 69],
      [60, 69],
      [50, 68],
      [44, 68],
      [42, 60],
      [40, 55],
      [36, 47],
      [42, 42],
      [48, 42],
      [52, 44],
      [53, 40],
      [49, 37],
      [44, 38],
      [40, 40],
      [34, 42],
    ],
    arabia_fix: null,
    japan: [
      [130, 31],
      [132, 34],
      [136, 34],
      [140, 35],
      [141, 38],
      [142, 41],
      [140, 41],
      [139, 38],
      [137, 37],
      [133, 36],
    ],
    hokkaido: [
      [140, 42],
      [145, 43],
      [144, 45],
      [141, 45],
    ],
    uk: [
      [-5.5, 50],
      [1.5, 51],
      [1.5, 53],
      [0, 54],
      [-2, 56],
      [-2, 58.5],
      [-5, 58.5],
      [-6, 56.5],
      [-5, 55],
      [-3, 54],
      [-4.5, 53],
      [-4, 51.5],
    ],
    ireland: [
      [-10, 52],
      [-6, 52],
      [-6, 55],
      [-8, 55],
      [-10, 54],
    ],
    iceland: [
      [-24, 64],
      [-14, 64.5],
      [-14, 66],
      [-22, 66.4],
    ],
    australia: [
      [114, -22],
      [116, -20],
      [122, -18],
      [126, -14],
      [131, -12],
      [136, -12],
      [137, -15],
      [140, -17],
      [142, -11],
      [144, -14],
      [146, -19],
      [150, -22],
      [153, -26],
      [153, -32],
      [150, -37],
      [146, -39],
      [141, -38],
      [138, -35],
      [135, -34],
      [131, -31],
      [124, -33],
      [115, -34],
      [115, -30],
    ],
    nz: [
      [172, -34],
      [175, -37],
      [178, -38],
      [174, -42],
      [171, -45],
      [167, -46],
      [170, -42],
    ],
    indonesia: [
      [95, 5],
      [100, 1],
      [106, -6],
      [115, -8],
      [120, -9],
      [124, -8],
      [119, -5],
      [117, 1],
      [118, 5],
      [111, 2],
      [109, -2],
      [104, -1],
      [98, 3],
    ],
    newguinea: [
      [131, -1],
      [138, -2],
      [146, -6],
      [150, -10],
      [143, -9],
      [138, -8],
      [132, -4],
    ],
    philippines: [
      [120, 18],
      [122, 18],
      [126, 7],
      [124, 7],
      [121, 12],
    ],
    borneo_sum: null,
    cuba: [
      [-85, 22],
      [-80, 23],
      [-74, 20],
      [-78, 20],
    ],
    newfoundland: [
      [-59, 48],
      [-53, 47],
      [-55, 51],
      [-57, 51],
    ],
    srilanka: [
      [80, 6],
      [82, 7],
      [81, 10],
      [79.8, 9],
    ],
    taiwan: [
      [120, 22],
      [122, 25],
      [121.5, 25.2],
      [120, 23.5],
    ],
  };
  function globeTex() {
    return P.canvasTex("pe_globe", 1024, 512, (ctx, w, h) => {
      const r = P.rng("globe");
      const X = (lon) => ((lon + 180) / 360) * w,
        Y = (lat) => ((90 - lat) / 180) * h;
      // ocean: aged teal with depth mottling
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#6f8f8a");
      g.addColorStop(0.5, "#3e6a72");
      g.addColorStop(1, "#6f8f8a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      P.blotches(ctx, w, h, r, 60, 0.18);
      // coastlines + land
      for (const k in LANDS) {
        const poly = LANDS[k];
        if (!poly) continue;
        ctx.beginPath();
        poly.forEach((p, i) =>
          i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])),
        );
        ctx.closePath();
        // coastal wash
        ctx.strokeStyle = "rgba(160,200,190,0.5)";
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.fillStyle = k === "greenland" ? "#e8e4d4" : "#d8c898";
        ctx.fill();
        ctx.strokeStyle = "#5a4020";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
      // political tint patches (a 1930 map loves pink empires)
      const tint = (lon, lat, rr, c) => {
        const gr = ctx.createRadialGradient(
          X(lon),
          Y(lat),
          0,
          X(lon),
          Y(lat),
          rr,
        );
        gr.addColorStop(0, c);
        gr.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gr;
        ctx.fillRect(X(lon) - rr, Y(lat) - rr, rr * 2, rr * 2);
      };
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      tint(-100, 45, 60, "rgba(210,150,120,0.6)");
      tint(95, 60, 110, "rgba(200,120,110,0.55)");
      tint(20, 5, 50, "rgba(200,190,120,0.6)");
      tint(-60, -15, 55, "rgba(160,190,130,0.6)");
      tint(134, -25, 45, "rgba(220,160,170,0.65)");
      tint(105, 32, 50, "rgba(230,200,120,0.6)");
      tint(78, 22, 30, "rgba(220,160,170,0.65)");
      ctx.restore();
      // polar ice
      ctx.fillStyle = "rgba(236,236,226,0.95)";
      ctx.fillRect(0, Y(-68), w, h - Y(-68));
      for (let x = 0; x < w; x += 8) ctx.fillRect(x, Y(-68) - r() * 8, 8, 10);
      // graticule
      ctx.strokeStyle = "rgba(60,40,20,0.45)";
      ctx.lineWidth = 1;
      for (let lon = -180; lon <= 180; lon += 15) {
        ctx.beginPath();
        ctx.moveTo(X(lon), 0);
        ctx.lineTo(X(lon), h);
        ctx.stroke();
      }
      for (let lat = -75; lat <= 75; lat += 15) {
        ctx.beginPath();
        ctx.moveTo(0, Y(lat));
        ctx.lineTo(w, Y(lat));
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(150,40,20,0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, Y(0));
      ctx.lineTo(w, Y(0));
      ctx.stroke();
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      ctx.moveTo(0, Y(23.4));
      ctx.lineTo(w, Y(23.4));
      ctx.moveTo(0, Y(-23.4));
      ctx.lineTo(w, Y(-23.4));
      ctx.stroke();
      ctx.setLineDash([]);
      // labels
      ctx.fillStyle = "rgba(40,28,14,0.85)";
      ctx.textAlign = "center";
      const lab = (t, lon, lat, s, it) => {
        ctx.font = (it ? "italic " : "bold ") + s + "px " + SERIF;
        ctx.fillText(t, X(lon), Y(lat));
      };
      lab("UNITED STATES", -100, 40, 13);
      lab("CANADA", -105, 58, 13);
      lab("BRAZIL", -55, -10, 12);
      lab("AFRICA", 20, 8, 15);
      lab("SOVIET UNION", 90, 62, 15);
      lab("CHINA", 103, 34, 14);
      lab("AUSTRALIA", 134, -26, 12);
      lab("EUROPE", 15, 50, 10);
      lab("ATLANTIC OCEAN", -38, 28, 13, true);
      lab("PACIFIC OCEAN", -140, 10, 15, true);
      lab("PACIFIC OCEAN", 160, 12, 12, true);
      lab("INDIAN OCEAN", 80, -25, 13, true);
      lab("ARCTIC OCEAN", 0, 80, 11, true);
      // New York star + the First Journal cartouche
      ctx.fillStyle = "#a0201a";
      ctx.beginPath();
      ctx.arc(X(-74), Y(40.7), 4, 0, TAU);
      ctx.fill();
      ctx.font = "bold 10px " + SANS;
      ctx.fillText("NEW YORK", X(-74) + 22, Y(40.7) - 6);
      // post-Bombing scars: burn rings over the capitals
      ctx.save();
      ctx.globalCompositeOperation = "multiply";
      for (const c of [
        [-77, 38.9],
        [37.6, 55.7],
        [116, 40],
        [-122.4, 37.7],
        [-87.6, 41.8],
        [-0.1, 51.5],
        [139.7, 35.7],
      ]) {
        const gr = ctx.createRadialGradient(
          X(c[0]),
          Y(c[1]),
          0,
          X(c[0]),
          Y(c[1]),
          16,
        );
        gr.addColorStop(0, "rgba(30,20,10,0.8)");
        gr.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gr;
        ctx.fillRect(X(c[0]) - 16, Y(c[1]) - 16, 32, 32);
      }
      ctx.restore();
      P.speckle(ctx, w, h, r, 2500, 0.25, 0.1);
      // varnish yellowing
      ctx.fillStyle = "rgba(200,170,90,0.12)";
      ctx.fillRect(0, 0, w, h);
    });
  }
  P.globeTex = globeTex;
  P.globeMat = () =>
    P.texMat("pe_globe", globeTex(), { rough: 0.45, metal: 0.05, vc: true });

  // --- compass-rose lobby floor --------------------------------------
  P.compassMat = () =>
    P.texMat(
      "pe_compass",
      P.canvasTex(
        "pe_compass",
        1024,
        1024,
        (ctx, w, h) => {
          const r = P.rng("compass");
          const cx = w / 2,
            cy = h / 2,
            R = w * 0.49;
          // black terrazzo field with brass chips
          ctx.fillStyle = "#141614";
          ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 9000; i++) {
            const k = r();
            ctx.fillStyle =
              k < 0.6
                ? "rgba(90,90,84,0.5)"
                : k < 0.9
                  ? "rgba(200,190,170,0.35)"
                  : "rgba(200,150,60,0.5)";
            ctx.fillRect(r() * w, r() * h, 1 + r() * 2.5, 1 + r() * 2.5);
          }
          // outer bronze ring with degree ticks
          ctx.strokeStyle = "#b8883a";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(cx, cy, R - 6, 0, TAU);
          ctx.stroke();
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, R - 60, 0, TAU);
          ctx.stroke();
          for (let d = 0; d < 360; d += 5) {
            const a = (d / 180) * PI - PI / 2,
              L = d % 45 === 0 ? 34 : d % 15 === 0 ? 22 : 12;
            ctx.lineWidth = d % 45 === 0 ? 4 : 2;
            ctx.beginPath();
            ctx.moveTo(
              cx + Math.cos(a) * (R - 12),
              cy + Math.sin(a) * (R - 12),
            );
            ctx.lineTo(
              cx + Math.cos(a) * (R - 12 - L),
              cy + Math.sin(a) * (R - 12 - L),
            );
            ctx.stroke();
          }
          // ring inscription
          ctx.fillStyle = "#d8b060";
          ctx.font = "bold 22px " + SANS;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const ring =
            "THE FIRST JOURNAL · WORLD WEATHER STATION · NEW YORK · EST. 1930 · ";
          for (let i = 0; i < ring.length * 2; i++) {
            const ch = (ring + ring)[i],
              a = (i / (ring.length * 2)) * TAU - PI / 2;
            ctx.save();
            ctx.translate(
              cx + Math.cos(a) * (R - 82),
              cy + Math.sin(a) * (R - 82),
            );
            ctx.rotate(a + PI / 2);
            ctx.fillText(ch, 0, 0);
            ctx.restore();
          }
          // 32-point rose
          const pt = (a, len, wid, c1, c2) => {
            const ax = Math.cos(a),
              ay = Math.sin(a),
              px = -ay,
              py = ax;
            ctx.fillStyle = c1;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + px * wid, cy + py * wid);
            ctx.lineTo(cx + ax * len, cy + ay * len);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = c2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx - px * wid, cy - py * wid);
            ctx.lineTo(cx + ax * len, cy + ay * len);
            ctx.closePath();
            ctx.fill();
          };
          for (let i = 0; i < 32; i++) {
            const a = (i / 32) * TAU - PI / 2;
            if (i % 2) pt(a, R * 0.42, 14, "#6a5030", "#3a2a18");
          }
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * TAU - PI / 2;
            if (i % 2) pt(a, R * 0.55, 24, "#c8a868", "#8a6a38");
          }
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU - PI / 2;
            pt(
              a,
              i % 2 ? R * 0.62 : R * 0.8,
              i % 2 ? 34 : 46,
              "#e8d8b0",
              "#b89048",
            );
          }
          ctx.fillStyle = "#b8883a";
          ctx.beginPath();
          ctx.arc(cx, cy, 30, 0, TAU);
          ctx.fill();
          ctx.font = "bold 60px " + SERIF;
          for (const [t, dx, dy] of [
            ["N", 0, -1],
            ["S", 0, 1],
            ["E", 1, 0],
            ["W", -1, 0],
          ]) {
            const lx = cx + dx * (R - 118),
              ly = cy + dy * (R - 118);
            ctx.fillStyle = "#141614";
            ctx.beginPath();
            ctx.arc(lx, ly, 40, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = "#b8883a";
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.fillStyle = "#e8d8a8";
            ctx.fillText(t, lx, ly + 3);
          }
          P.blotches(ctx, w, h, r, 50, 0.2);
          P.speckle(ctx, w, h, r, 1500, 0.3);
        },
        { clamp: true },
      ),
      { rough: 0.5, metal: 0.1, vc: true },
    );

  // --- radiating floor line plaques: "LONDON 3,469 MILES" etc. -------
  P.distanceTex = function () {
    return P.canvasTex(
      "pe_distances",
      1024,
      512,
      (ctx, w, h) => {
        const r = P.rng("dist");
        ctx.fillStyle = "#141614";
        ctx.fillRect(0, 0, w, h);
        const cities = [
          "LONDON 3,469 MI",
          "MOSCOW 4,662 MI",
          "TOKYO 6,740 MI",
          "PEKING 6,825 MI",
          "PARIS 3,625 MI",
          "RIO 4,817 MI",
          "CAIRO 5,602 MI",
          "BERLIN 3,980 MI",
        ];
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let i = 0; i < 8; i++) {
          const y = ((i + 0.5) * h) / 8;
          ctx.fillStyle = "#b8883a";
          ctx.fillRect(0, y - 3, w, 6);
          ctx.fillStyle = "#141614";
          ctx.fillRect(w * 0.5 - 170, y - 22, 340, 44);
          ctx.fillStyle = "#d8b060";
          ctx.font = "bold 30px " + SANS;
          ctx.fillText(cities[i], w * 0.5, y + 1);
        }
        P.speckle(ctx, w, h, r, 1500, 0.3);
      },
      { clamp: true },
    );
  };

  // --- clock & weather-instrument dial atlas (4 × 2 cells) ------------
  P.DIALS = [
    "NEW YORK",
    "LONDON",
    "MOSCOW",
    "TOKYO",
    "SAN FRANCISCO",
    "BERLIN",
    "BAROMETER",
    "WIND",
  ];
  P.dialTex = function () {
    return P.canvasTex(
      "pe_dials",
      1024,
      512,
      (ctx, w, h) => {
        const r = P.rng("dials");
        const hours = {
          "NEW YORK": 9.78,
          LONDON: 14.78,
          MOSCOW: 17.78,
          TOKYO: 23.78,
          "SAN FRANCISCO": 6.78,
          BERLIN: 15.78,
        };
        for (let i = 0; i < 8; i++) {
          const cx = ((i % 4) + 0.5) * 256,
            cy = (Math.floor(i / 4) + 0.5) * 256,
            R = 104;
          ctx.fillStyle = "#1a1612";
          ctx.fillRect(cx - 128, cy - 128, 256, 256);
          const gb = ctx.createRadialGradient(
            cx - 20,
            cy - 20,
            10,
            cx,
            cy,
            R + 14,
          );
          gb.addColorStop(0, "#f0d890");
          gb.addColorStop(1, "#6a4a18");
          ctx.fillStyle = gb;
          ctx.beginPath();
          ctx.arc(cx, cy, R + 12, 0, TAU);
          ctx.fill();
          const face = ctx.createRadialGradient(cx, cy, 10, cx, cy, R);
          face.addColorStop(0, "#f2ead0");
          face.addColorStop(1, "#c8bc98");
          ctx.fillStyle = face;
          ctx.beginPath();
          ctx.arc(cx, cy, R, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#2a2016";
          ctx.fillStyle = "#2a2016";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const name = P.DIALS[i];
          if (i < 6) {
            for (let k = 0; k < 60; k++) {
              const a = (k / 60) * TAU;
              ctx.lineWidth = k % 5 ? 1.2 : 3;
              const L = k % 5 ? 6 : 12;
              ctx.beginPath();
              ctx.moveTo(
                cx + Math.sin(a) * (R - 4),
                cy - Math.cos(a) * (R - 4),
              );
              ctx.lineTo(
                cx + Math.sin(a) * (R - 4 - L),
                cy - Math.cos(a) * (R - 4 - L),
              );
              ctx.stroke();
            }
            ctx.font = "bold 20px " + SERIF;
            for (let k = 1; k <= 12; k++) {
              const a = (k / 12) * TAU;
              ctx.fillText(
                String(k),
                cx + Math.sin(a) * (R - 28),
                cy - Math.cos(a) * (R - 28),
              );
            }
            const hh = hours[name],
              mm = (hh % 1) * 60;
            const ha = ((hh % 12) / 12) * TAU,
              ma = (mm / 60) * TAU;
            ctx.lineCap = "round";
            ctx.lineWidth = 7;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(
              cx + Math.sin(ha) * R * 0.5,
              cy - Math.cos(ha) * R * 0.5,
            );
            ctx.stroke();
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(
              cx + Math.sin(ma) * R * 0.78,
              cy - Math.cos(ma) * R * 0.78,
            );
            ctx.stroke();
            ctx.font = "bold 13px " + SANS;
            ctx.fillText(name, cx, cy + R * 0.42);
          } else if (i === 6) {
            const lbl = ["STORMY", "RAIN", "CHANGE", "FAIR", "DRY", "V. DRY"];
            for (let k = 0; k < 41; k++) {
              const a = -2.3 + (k / 40) * 4.6;
              ctx.lineWidth = k % 5 ? 1 : 2.5;
              const L = k % 5 ? 6 : 12;
              ctx.beginPath();
              ctx.moveTo(
                cx + Math.sin(a) * (R - 4),
                cy - Math.cos(a) * (R - 4),
              );
              ctx.lineTo(
                cx + Math.sin(a) * (R - 4 - L),
                cy - Math.cos(a) * (R - 4 - L),
              );
              ctx.stroke();
            }
            ctx.font = "bold 12px " + SANS;
            lbl.forEach((t, k) => {
              const a = -2.1 + (k / 5) * 4.2;
              ctx.fillStyle = t === "STORMY" ? "#8a1a10" : "#2a2016";
              ctx.fillText(
                t,
                cx + Math.sin(a) * (R - 32),
                cy - Math.cos(a) * (R - 32),
              );
            });
            ctx.fillStyle = "#2a2016";
            ctx.font = "bold 14px " + SANS;
            ctx.fillText("BAROMETER", cx, cy + R * 0.45);
            ctx.strokeStyle = "#1a1a1a";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(
              cx + Math.sin(2.0) * R * 0.8,
              cy - Math.cos(2.0) * R * 0.8,
            );
            ctx.stroke();
            ctx.strokeStyle = "#a02010";
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(
              cx + Math.sin(-1.4) * R * 0.7,
              cy - Math.cos(-1.4) * R * 0.7,
            );
            ctx.stroke();
          } else {
            ctx.font = "bold 18px " + SERIF;
            ["N", "E", "S", "W"].forEach((t, k) => {
              const a = (k / 4) * TAU;
              ctx.fillText(
                t,
                cx + Math.sin(a) * (R - 22),
                cy - Math.cos(a) * (R - 22),
              );
            });
            for (let k = 0; k < 32; k++) {
              const a = (k / 32) * TAU;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(
                cx + Math.sin(a) * (R - 4),
                cy - Math.cos(a) * (R - 4),
              );
              ctx.lineTo(
                cx + Math.sin(a) * (R - 12),
                cy - Math.cos(a) * (R - 12),
              );
              ctx.stroke();
            }
            ctx.fillStyle = "#8a1a10";
            ctx.beginPath();
            ctx.moveTo(cx + 40, cy - 60);
            ctx.lineTo(cx + 8, cy + 4);
            ctx.lineTo(cx - 8, cy - 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#2a2016";
            ctx.font = "bold 13px " + SANS;
            ctx.fillText("WIND DIRECTION", cx, cy + R * 0.45);
          }
          ctx.fillStyle = "#2a2016";
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, TAU);
          ctx.fill();
          // cracked glass on two of them
          if (i === 2 || i === 5) {
            ctx.strokeStyle = "rgba(255,255,255,0.7)";
            ctx.lineWidth = 1.2;
            for (let k = 0; k < 7; k++) {
              ctx.beginPath();
              ctx.moveTo(cx - 30, cy - 20);
              let x = cx - 30,
                y = cy - 20;
              for (let s = 0; s < 4; s++) {
                x += (r() - 0.4) * 50;
                y += (r() - 0.4) * 50;
                ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          }
          P.blotches(ctx, 256, 256, r, 6, 0.2);
        }
        P.speckle(ctx, w, h, r, 1600, 0.25);
      },
      { clamp: true },
    );
  };
  /** uvRect for dial i of the 4×2 atlas. */
  P.dialRect = (i) => [
    (i % 4) / 4,
    1 - (Math.floor(i / 4) + 1) / 2,
    ((i % 4) + 1) / 4,
    1 - Math.floor(i / 4) / 2,
  ];

  // --- newspaper front pages atlas (2 × 2) -----------------------------
  const PAGES = [
    {
      mast: "THE FIRST JOURNAL",
      sub: "YOU HEARD IT HERE FIRST · MARCH 5, 1967 · FINAL",
      head: ["WAR!", "BOMBS FALLING"],
      dek: "Sirens across the five boroughs — planes reported over the Atlantic",
      bg: "#e2d8bc",
    },
    {
      mast: "THE FIRST JOURNAL",
      sub: "NEW YORK · MARCH 1967 · 5¢",
      head: ["PARIS", "RECALLS ENVOY"],
      dek: '"Bureau Sept" spy ring exposed in Washington; President urges calm',
      bg: "#dcd2b4",
    },
    {
      mast: "THE DAILY RUIN",
      sub: "THE VOICE OF 42ND STREET · PRINTED ON THE OLD PRESSES · 1 SCRIP",
      head: ["RAIDERS HOLD", "TUDOR CITY"],
      dek: 'Self-styled "Court" demands tribute from the Market',
      bg: "#cfc6a8",
    },
    {
      mast: "THE DAILY RUIN",
      sub: "THE VOICE OF 42ND STREET · 1 SCRIP",
      head: ["BEAR IN THE", "GOLDEN TOWER"],
      dek: 'Scavengers flee Madison Square: "It was wearing a crown of gold"',
      bg: "#d4caa8",
    },
  ];
  P.pagesTex = function () {
    return P.canvasTex(
      "pe_pages",
      1024,
      1024,
      (ctx, w, h) => {
        const r = P.rng("pages");
        for (let i = 0; i < 4; i++) {
          const pg = PAGES[i],
            x0 = (i % 2) * 512,
            y0 = Math.floor(i / 2) * 512;
          ctx.fillStyle = pg.bg;
          ctx.fillRect(x0, y0, 512, 512);
          ctx.fillStyle = "#1c1812";
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.font = "bold 60px " + (i < 2 ? SANS : SERIF);
          ctx.fillText(pg.mast, x0 + 256, y0 + 70, 480);
          ctx.fillRect(x0 + 16, y0 + 84, 480, 3);
          ctx.font = "13px " + SERIF;
          ctx.fillText(pg.sub, x0 + 256, y0 + 102);
          ctx.fillRect(x0 + 16, y0 + 110, 480, 2);
          ctx.font = 'bold 88px Impact, "Arial Black", ' + SANS;
          pg.head.forEach((t, k) => {
            let fs = 88;
            ctx.font = "bold " + fs + 'px Impact, "Arial Black", ' + SANS;
            while (ctx.measureText(t).width > 480 && fs > 30) {
              fs -= 4;
              ctx.font = "bold " + fs + 'px Impact, "Arial Black", ' + SANS;
            }
            ctx.fillText(t, x0 + 256, y0 + 200 + k * 88);
          });
          ctx.font = "italic 18px " + SERIF;
          ctx.fillText(pg.dek, x0 + 256, y0 + 312);
          // photo block + columns
          ctx.fillStyle = "rgba(40,36,28,0.75)";
          ctx.fillRect(x0 + 20, y0 + 330, 230, 160);
          ctx.fillStyle = "rgba(200,190,160,0.25)";
          if (i === 0) {
            ctx.beginPath();
            ctx.arc(x0 + 135, y0 + 440, 60, PI, TAU);
            ctx.fill();
            ctx.fillRect(x0 + 125, y0 + 380, 20, 60);
          } else if (i === 3) {
            ctx.beginPath();
            ctx.moveTo(x0 + 80, y0 + 480);
            ctx.lineTo(x0 + 135, y0 + 350);
            ctx.lineTo(x0 + 190, y0 + 480);
            ctx.fill();
          } else {
            for (let k = 0; k < 6; k++)
              ctx.fillRect(x0 + 40 + k * 34, y0 + 480 - 40 - r() * 80, 22, 200);
          }
          ctx.fillStyle = "rgba(30,26,20,0.7)";
          for (let c = 0; c < 2; c++)
            for (let y = y0 + 334; y < y0 + 496; y += 7)
              ctx.fillRect(x0 + 262 + c * 118, y, 106 * (0.6 + r() * 0.4), 3);
          P.blotches(ctx, 512, 512, r, 0, 0);
          for (let k = 0; k < 18; k++) {
            const bx = x0 + r() * 512,
              by = y0 + r() * 512,
              rr = 10 + r() * 60;
            const gr = ctx.createRadialGradient(bx, by, 0, bx, by, rr);
            gr.addColorStop(0, "rgba(120,90,40," + (0.05 + r() * 0.2) + ")");
            gr.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = gr;
            ctx.fillRect(bx - rr, by - rr, rr * 2, rr * 2);
          }
        }
        P.speckle(ctx, w, h, r, 3000, 0.2);
      },
      { clamp: true },
    );
  };
  P.pageRect = (i) => [
    (i % 2) / 2,
    1 - (Math.floor(i / 2) + 1) / 2,
    ((i % 2) + 1) / 2,
    1 - Math.floor(i / 2) / 2,
  ];

  // --- the carved entrance relief (sunburst over the tower, the crowd) ---
  P.reliefTex = function () {
    return P.canvasTex(
      "pe_relief",
      512,
      640,
      (ctx, w, h) => {
        const r = P.rng("relief");
        ctx.fillStyle = "#b4ab96";
        ctx.fillRect(0, 0, w, h);
        const carve = (fn, depth) => {
          ctx.save();
          ctx.translate(2, 3);
          ctx.fillStyle = "rgba(40,34,26," + 0.55 * depth + ")";
          fn();
          ctx.restore();
          ctx.save();
          ctx.translate(-1.5, -1.5);
          ctx.fillStyle = "rgba(255,250,236," + 0.35 * depth + ")";
          fn();
          ctx.restore();
          ctx.fillStyle = "#b8af9a";
          fn();
        };
        // sunburst rays from behind the tower
        const cx = w / 2,
          cy = h * 0.42;
        for (let i = 0; i < 26; i++) {
          const a0 = PI + (i / 26) * PI,
            a1 = a0 + PI / 52;
          carve(() => {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a0) * 300, cy + Math.sin(a0) * 300);
            ctx.lineTo(cx + Math.cos(a1) * 300, cy + Math.sin(a1) * 300);
            ctx.closePath();
            ctx.fill();
          }, 0.7);
        }
        carve(() => {
          ctx.beginPath();
          ctx.arc(cx, cy, 58, PI, TAU);
          ctx.fill();
        }, 1);
        // the striped tower itself
        carve(() => {
          ctx.fillRect(cx - 50, cy - 170, 100, 330);
          ctx.fillRect(cx - 34, cy - 200, 68, 40);
        }, 1.2);
        ctx.fillStyle = "rgba(50,40,30,0.4)";
        for (let k = -4; k <= 4; k++)
          ctx.fillRect(cx + k * 10.5 - 2, cy - 160, 4, 315);
        // the crowd along the bottom, looking up
        for (let i = 0; i < 9; i++) {
          const x = 40 + i * 54,
            y = h - 90 + (i % 2) * 8;
          carve(() => {
            ctx.beginPath();
            ctx.arc(x, y - 58, 12, 0, TAU);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x - 18, y + 60);
            ctx.lineTo(x - 14, y - 40);
            ctx.lineTo(x + 14, y - 40);
            ctx.lineTo(x + 18, y + 60);
            ctx.fill();
          }, 1);
        }
        // lettering band
        carve(() => {
          ctx.fillRect(20, h - 190, w - 40, 56);
        }, 0.6);
        ctx.fillStyle = "rgba(46,38,28,0.9)";
        ctx.font = "bold 44px " + DECO;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        try {
          ctx.letterSpacing = "14px";
        } catch (e) {
          /* old canvas */
        }
        ctx.fillText("THE JOURNAL", w / 2, h - 161, w - 50);
        ctx.font = "bold 13px " + SERIF;
        try {
          ctx.letterSpacing = "3px";
        } catch (e) {
          /* */
        }
        ctx.fillStyle = "rgba(46,38,28,0.8)";
        ctx.fillText("HE MADE SO MANY OF THEM", w / 2, h - 12);
        // grime streaks & a blast scorch
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = "rgba(40,34,26," + (0.05 + r() * 0.1) + ")";
          const x = r() * w;
          ctx.fillRect(x, r() * h * 0.3, 2 + r() * 5, 60 + r() * 300);
        }
        P.blotches(ctx, w, h, r, 40, 0.25);
        P.speckle(ctx, w, h, r, 3000, 0.4);
      },
      { clamp: true },
    );
  };

  // --- TUDOR CITY neon letters (transparent, emissive) ------------------
  P.neonLetterTex = function (text, dead) {
    return P.canvasTex(
      "pe_neon_" + text + "_" + (dead || ""),
      1024,
      192,
      (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fs = 150;
        ctx.font = "bold " + fs + "px " + SERIF;
        while (ctx.measureText(text).width > w * 0.96) {
          fs -= 6;
          ctx.font = "bold " + fs + "px " + SERIF;
        }
        const tw = ctx.measureText(text).width;
        let x = w / 2 - tw / 2;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i],
            cw = ctx.measureText(ch).width;
          const off = dead && dead.indexOf(i) >= 0;
          ctx.save();
          if (!off) {
            ctx.shadowColor = "#ff3018";
            ctx.shadowBlur = 22;
            ctx.fillStyle = "#ff5a3a";
          } else ctx.fillStyle = "#4a1e18";
          ctx.fillText(ch, x + cw / 2, h / 2 + 6);
          if (!off) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffd8c8";
            ctx.globalAlpha = 0.6;
            ctx.fillText(ch, x + cw / 2, h / 2 + 6);
          }
          ctx.restore();
          x += cw;
        }
      },
      { clamp: true },
    );
  };

  // --- bear claw marks / blood decals ------------------------------------
  P.clawTex = function () {
    return P.canvasTex(
      "pe_claws",
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("claws");
        ctx.clearRect(0, 0, w, h);
        for (let s = 0; s < 2; s++) {
          const ox = 40 + s * 90,
            oy = 30 + s * 40;
          for (let k = 0; k < 4; k++) {
            ctx.strokeStyle = "rgba(20,14,10,0.85)";
            ctx.lineWidth = 7 - k * 0.6;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(ox + k * 16, oy);
            ctx.quadraticCurveTo(
              ox + k * 16 + 20,
              oy + 80,
              ox + k * 14 + 34,
              oy + 150 + r() * 20,
            );
            ctx.stroke();
            ctx.strokeStyle = "rgba(230,220,200,0.35)";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      },
      { clamp: true },
    );
  };
  P.bloodTex = function () {
    return P.canvasTex(
      "pe_blood",
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("blood");
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < 26; i++) {
          const x = w / 2 + (r() - 0.5) * w * 0.7,
            y = h / 2 + (r() - 0.5) * h * 0.7,
            rr = 6 + r() * 36;
          const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
          g.addColorStop(0, "rgba(70,6,4,0.95)");
          g.addColorStop(0.7, "rgba(60,8,4,0.7)");
          g.addColorStop(1, "rgba(40,4,2,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, rr, 0, TAU);
          ctx.fill();
        }
      },
      { clamp: true },
    );
  };
})();
