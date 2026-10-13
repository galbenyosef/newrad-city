/* src/textures/33_brands_v1.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: alternate billboard compositions (v1)
 * Owned by: textures.
 *
 * Every brand gets a SECOND, genuinely different layout for odd variants
 * (different hero illustration, mirrored composition, different palette /
 * background style), so a city with 40+ boards doesn't read as copies.
 * Virtual canvas 1000×500 like 31_brands.js; lettering stays inside
 * X.textSafe (set by the renderer) and clear of the art.
 * All copy is original.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const X = G._tx;
  const A = X.art;
  const K = X.adkit;
  const B = X.BRANDS;
  const BA = X.brandArt;
  const TAU = Math.PI * 2;
  const INK = "#1d1712";

  /** Install fn as the odd-variant composition of brand `id` (even variants keep the original). */
  function alt(id, fn) {
    const b = B[id];
    if (!b) return;
    const v0 = b.bill;
    b.bill = function (ctx, v, r) {
      return v % 2 ? fn.call(b, ctx, r) : v0.call(b, ctx, v, r);
    };
    b.hasAlt = true;
  }
  /** Checkerboard floor band. */
  function checker(ctx, y0, y1, s, c1, c2) {
    ctx.fillStyle = c1;
    ctx.fillRect(0, y0, 1000, y1 - y0);
    ctx.fillStyle = c2;
    for (let y = y0, row = 0; y < y1; y += s, row++)
      for (let x = (row % 2) * s; x < 1000; x += s * 2)
        ctx.fillRect(x, y, s, Math.min(s, y1 - y));
  }
  /** Speech bubble with a tail pointing at (tx,ty). */
  function bubble(ctx, cx, cy, w, h, tx, ty, fill) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, TAU);
    ctx.moveTo(cx + (tx < cx ? -w * 0.18 : w * 0.08), cy + h * 0.38);
    ctx.lineTo(tx, ty);
    ctx.lineTo(cx + (tx < cx ? -w * 0.05 : w * 0.2), cy + h * 0.42);
    ctx.fillStyle = fill || "#fff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2 - 2, h / 2 - 2, 0, 0, TAU);
    ctx.fillStyle = fill || "#fff";
    ctx.fill();
    ctx.restore();
  }
  /** Comic "sound effect" burst. */
  function sfx(ctx, text, cx, cy, r, fill, ink, rot) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot || 0);
    X.starburst(ctx, 0, 0, r * 0.62, r, 14, fill, INK, 4);
    X.text(ctx, text, 0, 2, {
      font: "impact",
      size: r * 0.55,
      color: ink || "#fff",
      stroke: INK,
      strokeW: 5,
      maxW: r * 1.3,
    });
    ctx.restore();
  }

  // ------------------------------------------------------------------ FIZZO COLA (picnic: the whole gang, mirrored)
  alt("fizzo_cola", function (ctx, r) {
    K.bg(ctx, 1000, 500, "sunburst", "#c8241c", "#b01c16", {
      cx: 230,
      cy: 280,
      rays: 30,
    });
    checker(ctx, 400, 500, 34, "#f6eed8", "#c8241c");
    A.fizzoBottle(ctx, 230, 70, 330);
    A.fizzoBottle(ctx, 320, 120, 280);
    K.bubbles(ctx, 120, 40, 300, 330, 20, r, "rgba(255,240,220,0.7)");
    A.housewife(ctx, 870, 200, 60, { dress: "#2a8a84", hair: "#e8b848" });
    K.scriptLogo(ctx, "Fizzo Cola", 610, 105, 110, "#f6eed8", "#7a1410", {
      maxW: 400,
    });
    X.text(ctx, this.slogans[1], 600, 205, {
      font: "impact",
      size: 46,
      color: "#f2d060",
      stroke: INK,
      strokeW: 6,
      italic: true,
      skew: -0.1,
      maxW: 380,
    });
    X.text(ctx, "THE PICNIC ISN’T PICNIC WITHOUT IT", 600, 270, {
      font: "condensed",
      size: 26,
      color: "#f6eed8",
      spacing: 2,
      maxW: 380,
    });
    K.badge(ctx, ["KING", "SIZE!"], 640, 360, 50, "#2a8a84", "#fff", -0.15);
  });

  // ------------------------------------------------------------------ FIZZO BLUE (halftone daylight, hostess)
  alt("fizzo_blue", function (ctx, r) {
    K.bg(ctx, 1000, 500, "solid", "#f4ecd8");
    X.halftone(ctx, 0, 0, 1000, 500, 16, "#5ad8ff", 0.25, 0.4);
    ctx.fillStyle = "#0b1e46";
    ctx.beginPath();
    ctx.moveTo(430, 0);
    ctx.lineTo(1000, 0);
    ctx.lineTo(1000, 500);
    ctx.lineTo(330, 500);
    ctx.fill();
    A.stars(ctx, 440, 0, 560, 500, 90, r);
    A.housewife(ctx, 160, 190, 78, { dress: "#2a6ab0", hair: "#c8401a" });
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = A.rgrad(ctx, 330, 290, 5, 170, [
      [0, "rgba(90,216,255,0.75)"],
      [1, "rgba(0,80,200,0)"],
    ]);
    ctx.fillRect(160, 120, 340, 340);
    ctx.restore();
    A.fizzoBottle(ctx, 330, 150, 290, { blue: true });
    K.scriptLogo(ctx, "Fizzo", 690, 100, 104, "#ffffff", "#0a1a4a", {
      maxW: 400,
    });
    X.text(ctx, "BLUE", 690, 195, {
      font: "deco",
      size: 100,
      color: "#5ad8ff",
      glow: "#5ad8ff",
      glowBlur: 16,
      stroke: "#08204a",
      strokeW: 6,
      spacing: 12,
      maxW: 460,
    });
    X.text(ctx, this.slogans[1], 680, 290, {
      font: "impact",
      size: 44,
      color: "#fff",
      italic: true,
      skew: -0.12,
      maxW: 500,
    });
    X.text(ctx, "Cool as a cellar, blue as a June sky.", 680, 345, {
      font: "serif",
      size: 22,
      italic: true,
      weight: "normal",
      color: "#bfe8ff",
      maxW: 500,
    });
    K.badge(ctx, ["NEW", "FLAVOR!"], 900, 430, 56, "#5ad8ff", "#0a1a3a", 0.2);
  });

  // ------------------------------------------------------------------ LONG WINTER (public notice: the family that plans ahead)
  alt("long_winter", function (ctx, r) {
    K.bg(ctx, 1000, 500, "solid", "#1c2e52");
    for (let k = 0; k < 50; k++)
      A.snowflake(
        ctx,
        r() * 1000,
        r() * 500,
        3 + r() * 7,
        "rgba(255,255,255,0.35)",
        1.2,
      );
    ctx.fillStyle = "#eef4f6";
    ctx.beginPath();
    ctx.moveTo(470, 0);
    ctx.lineTo(1000, 0);
    ctx.lineTo(1000, 500);
    ctx.lineTo(400, 500);
    ctx.fill();
    ctx.fillStyle = "#e8742a";
    ctx.beginPath();
    ctx.moveTo(452, 0);
    ctx.lineTo(470, 0);
    ctx.lineTo(400, 500);
    ctx.lineTo(382, 500);
    ctx.fill();
    A.cryoPod(ctx, 600, 260, 78, {});
    A.cryoPod(ctx, 760, 270, 70, {});
    A.cryoPod(ctx, 900, 285, 60, {});
    A.longWinter(ctx, 110, 100, 72, {});
    X.text(ctx, "THE FAMILY THAT", 260, 210, {
      font: "deco",
      size: 36,
      color: "#eef4f6",
      spacing: 2,
      maxW: 340,
    });
    X.text(ctx, "PLANS AHEAD", 250, 260, {
      font: "deco",
      size: 46,
      color: "#e8742a",
      spacing: 2,
      maxW: 340,
    });
    X.text(ctx, "SLEEPS AHEAD.", 250, 315, {
      font: "deco",
      size: 46,
      color: "#eef4f6",
      spacing: 2,
      maxW: 340,
    });
    X.text(ctx, this.slogans[1], 240, 390, {
      font: "serif",
      size: 22,
      italic: true,
      color: "#c8d8e8",
      maxW: 340,
    });
    A.ocd(ctx, 940, 450, 34, {});
    K.fine(
      ctx,
      "Office of Civil Defense · Ask at any post office",
      700,
      470,
      "rgba(28,46,82,0.8)",
      16,
    );
  });

  // ------------------------------------------------------------------ PRAIRIE ROOT BEER (rope border, barn dance)
  alt("prairie_root_beer", function (ctx, r) {
    K.bg(ctx, 1000, 500, "stripes", "#f2e2b4", "#ead098", { w: 26, slant: 0 });
    ctx.save();
    ctx.strokeStyle = "#8a5a2a";
    ctx.lineWidth = 10;
    ctx.setLineDash([14, 6]);
    ctx.strokeRect(40, 40, 920, 420);
    ctx.restore();
    ctx.fillStyle = "#7a2a12";
    ctx.fillRect(0, 410, 1000, 90);
    // red barn
    ctx.fillStyle = "#a8301a";
    ctx.beginPath();
    ctx.moveTo(90, 410);
    ctx.lineTo(90, 270);
    ctx.lineTo(180, 200);
    ctx.lineTo(270, 270);
    ctx.lineTo(270, 410);
    ctx.fill();
    A.fs(ctx, null, 4);
    ctx.strokeStyle = "#f2e2b4";
    ctx.lineWidth = 6;
    ctx.strokeRect(140, 320, 80, 90);
    ctx.beginPath();
    ctx.moveTo(140, 320);
    ctx.lineTo(220, 410);
    ctx.moveTo(220, 320);
    ctx.lineTo(140, 410);
    ctx.stroke();
    A.amberBottle(ctx, 820, 90, 300, {});
    A.amberBottle(ctx, 910, 140, 250, {});
    X.text(ctx, "PRAIRIE", 540, 100, {
      font: "slab",
      size: 96,
      color: "#7a2a12",
      spacing: 4,
      maxW: 380,
    });
    X.text(ctx, "ROOT BEER", 540, 180, {
      font: "slab",
      size: 54,
      color: "#d88a2a",
      stroke: "#5a1e08",
      strokeW: 4,
      spacing: 3,
      maxW: 380,
    });
    K.ribbonText(
      ctx,
      this.slogans[1].toUpperCase(),
      540,
      265,
      380,
      50,
      "#7a2a12",
      "#4a1408",
      "#f2e2b4",
    );
    X.text(ctx, "Saturday-Night Fresh!", 540, 340, {
      font: "script",
      weight: "normal",
      size: 46,
      color: "#8a1a10",
      maxW: 380,
    });
    K.fine(
      ctx,
      "Prairie Beverage Co. · Bottled in Newark, N.J.",
      500,
      455,
      "rgba(255,230,180,0.8)",
      16,
    );
  });

  // ------------------------------------------------------------------ SKY PATROL (arcade cabinet)
  alt("sky_patrol", function (ctx, r) {
    K.bg(ctx, 1000, 500, "gradient", "#1a0a2a", "#3a0a3a");
    ctx.strokeStyle = "rgba(255,74,208,0.45)";
    ctx.lineWidth = 2;
    for (let k = -10; k <= 10; k++) {
      ctx.beginPath();
      ctx.moveTo(500 + k * 20, 330);
      ctx.lineTo(500 + k * 140, 500);
      ctx.stroke();
    }
    for (let y = 340, s = 6; y < 500; y += s, s *= 1.35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1000, y);
      ctx.stroke();
    }
    const cx = 760;
    ctx.fillStyle = "#2a2a2a";
    ctx.beginPath();
    ctx.moveTo(cx - 110, 40);
    ctx.lineTo(cx + 110, 40);
    ctx.lineTo(cx + 120, 470);
    ctx.lineTo(cx - 120, 470);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#3ad0ff";
    ctx.stroke();
    ctx.fillStyle = "#f4d040";
    ctx.fillRect(cx - 100, 55, 200, 45);
    X.text(ctx, "SKY PATROL", cx, 78, {
      font: "mono",
      size: 26,
      color: "#0a0a1a",
      maxW: 190,
      noSafe: true,
    });
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(cx - 90, 115, 180, 160);
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - 90, 115, 180, 160);
    ctx.clip();
    for (let k = 0; k < 5; k++) {
      const sx = cx - 90 + r() * 180,
        ex = cx - 90 + r() * 180;
      ctx.strokeStyle = "#ffb030";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, 115);
      ctx.lineTo(ex, 200 + r() * 60);
      ctx.stroke();
    }
    A.rocket(ctx, cx, 200, 60, -Math.PI / 2, {
      body: "#3ad0ff",
      accent: "#f4d040",
      flame: false,
    });
    ctx.fillStyle = "#3ad0ff";
    for (let k = 0; k < 4; k++) ctx.fillRect(cx - 80 + k * 45, 255, 25, 14);
    ctx.restore();
    ctx.fillStyle = "#4a4a4a";
    ctx.beginPath();
    ctx.moveTo(cx - 115, 290);
    ctx.lineTo(cx + 115, 290);
    ctx.lineTo(cx + 125, 340);
    ctx.lineTo(cx - 125, 340);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 50, 312, 12, 0, TAU);
    ctx.fillStyle = "#ff4ad0";
    ctx.fill();
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.arc(cx + 10 + k * 30, 315, 9, 0, TAU);
      ctx.fillStyle = ["#3ad0ff", "#f4d040", "#ff8a2a"][k];
      ctx.fill();
    }
    ctx.fillStyle = "#ff4ad0";
    ctx.fillRect(cx - 20, 380, 40, 50);
    ctx.fillStyle = "#f4d040";
    ctx.fillRect(cx - 4, 392, 8, 26);
    X.text(ctx, "SKY", 290, 100, {
      font: "mono",
      size: 110,
      color: "#3ad0ff",
      glow: "#3ad0ff",
      glowBlur: 20,
      maxW: 440,
    });
    X.text(ctx, "PATROL", 290, 195, {
      font: "mono",
      size: 92,
      color: "#f4d040",
      glow: "#f4d040",
      glowBlur: 20,
      maxW: 440,
    });
    X.text(ctx, this.slogans[1], 290, 280, {
      font: "mono",
      size: 28,
      color: "#ff4ad0",
      maxW: 440,
    });
    X.text(ctx, "HI-SCORE 0048120", 290, 330, {
      font: "mono",
      size: 26,
      color: "#fff",
      maxW: 400,
    });
    X.text(ctx, "AT FINE ARCADES & BOWLING ALLEYS", 290, 455, {
      font: "mono",
      size: 20,
      color: "rgba(255,200,255,0.85)",
      maxW: 440,
    });
  });

  // ------------------------------------------------------------------ VIGIL (the issue card: cryo pod + goggles)
  alt("vigil", function (ctx, r) {
    K.bg(ctx, 1000, 500, "solid", "#0a1218");
    for (let y = 0; y < 500; y += 3) {
      ctx.fillStyle = "rgba(150,220,240,0.04)";
      ctx.fillRect(0, y, 1000, 1);
    }
    ctx.strokeStyle = "rgba(150,220,240,0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 940, 440);
    ctx.beginPath();
    ctx.moveTo(30, 90);
    ctx.lineTo(970, 90);
    ctx.stroke();
    X.text(ctx, "[ PROJECT LONG WINTER · FIELD ISSUE ]", 500, 60, {
      font: "mono",
      size: 30,
      color: "#cfeefa",
      spacing: 3,
      maxW: 900,
    });
    A.goggles(ctx, 300, 260, 90, {});
    for (const [y, t] of [
      [150, "> MAP .......... OK"],
      [195, "> LOG .......... OK"],
      [240, "> RADIO ........ OK"],
      [285, "> LAMP ......... OK"],
      [330, "> RANGE ........ OK"],
    ])
      X.text(ctx, t, 620, y, {
        font: "mono",
        size: 26,
        color: "#cfeefa",
        align: "left",
        maxW: 330,
      });
    X.text(ctx, "VIGIL", 760, 395, {
      font: "mono",
      size: 64,
      color: "#ffb347",
      glow: "#ffb347",
      glowBlur: 10,
      spacing: 8,
      maxW: 340,
    });
    X.text(ctx, this.slogans[1].toUpperCase(), 300, 430, {
      font: "mono",
      size: 18,
      color: "rgba(207,238,250,0.75)",
      maxW: 520,
    });
  });

  // ------------------------------------------------------------------ WORLD'S FAIR (daytime fairground)
  alt("worlds_fair", function (ctx, r) {
    K.bg(ctx, 1000, 500, "gradient", "#6ac0f0", "#f4ecd8");
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (const [x, y] of [
      [140, 70],
      [560, 50],
      [880, 90],
    ]) {
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.arc(x + k * 30 - 45, y + (k % 2) * 8, 28, 0, TAU);
        ctx.fill();
      }
    }
    ctx.fillStyle = "#6a9a4a";
    ctx.fillRect(0, 440, 1000, 60);
    A.ferris(ctx, 900, 300, 100, { color: "#1a3a6a" });
    A.unisphere(ctx, 680, 260, 120, { steel: "#4a5a66", land: "#7a8a8a" });
    // fountain jets
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 3;
    for (let k = 0; k < 9; k++) {
      const x = 560 + k * 30;
      ctx.beginPath();
      ctx.moveTo(x, 440);
      ctx.quadraticCurveTo(x + 5, 380, x + 12, 400);
      ctx.stroke();
    }
    X.text(ctx, "WORLD’S FAIR", 250, 100, {
      font: "deco",
      size: 80,
      color: "#f2a83a",
      stroke: "#1a3a6a",
      strokeW: 8,
      maxW: 430,
      extrude: { color: "#1a3a6a", n: 5 },
    });
    X.text(ctx, "NEW YORK · 1964", 250, 180, {
      font: "condensed",
      size: 40,
      color: "#1a3a6a",
      spacing: 6,
      maxW: 430,
    });
    X.text(ctx, this.slogans[1], 250, 245, {
      font: "serif",
      size: 30,
      italic: true,
      color: "#1a1a4a",
      maxW: 430,
    });
    A.kid(ctx, 150, 360, 42, {});
    A.dad(ctx, 270, 350, 44, { hat: true, suit: "#2a5a8a" });
    A.housewife(ctx, 380, 358, 40, { dress: "#e8702a" });
    ctx.fillStyle = "#1a3a6a";
    ctx.fillRect(0, 455, 440, 45);
    X.text(ctx, "FLUSHING MEADOWS · QUEENS", 220, 477, {
      font: "impact",
      size: 26,
      color: "#fff",
      maxW: 380,
    });
  });

  // ------------------------------------------------------------------ LIBERTY JETLINER (the stewardess & the boarding pass)
  alt("liberty_jetliner", function (ctx, r) {
    K.bg(ctx, 1000, 500, "solid", "#f4ecd8");
    ctx.fillStyle = "#13306a";
    ctx.beginPath();
    ctx.moveTo(640, 0);
    ctx.lineTo(1000, 0);
    ctx.lineTo(1000, 500);
    ctx.lineTo(560, 500);
    ctx.fill();
    ctx.fillStyle = "#c8202a";
    ctx.beginPath();
    ctx.moveTo(622, 0);
    ctx.lineTo(640, 0);
    ctx.lineTo(560, 500);
    ctx.lineTo(542, 500);
    ctx.fill();
    A.stars(ctx, 650, 0, 350, 500, 60, r, "rgba(255,255,255,0.5)");
    A.housewife(ctx, 800, 215, 78, { dress: "#13306a", hair: "#e8b848" });
    X.rrect(ctx, 752, 82, 96, 32, 12);
    A.fs(ctx, "#c8202a", 4);
    ctx.fillStyle = "#f2c43a";
    ctx.beginPath();
    ctx.moveTo(770, 352);
    ctx.lineTo(830, 352);
    ctx.lineTo(815, 360);
    ctx.lineTo(785, 360);
    ctx.fill();
    A.jetliner(ctx, 860, 450, 170, -0.25, { stripe: "#c8202a" });
    K.scriptLogo(ctx, "Liberty", 290, 82, 108, "#c8202a", "#f4ecd8", {
      maxW: 420,
    });
    X.text(ctx, "J E T L I N E R", 290, 158, {
      font: "deco",
      size: 34,
      color: "#13306a",
      maxW: 400,
    });
    X.text(ctx, this.slogans[0], 290, 212, {
      font: "serif",
      size: 34,
      italic: true,
      color: "#13306a",
      maxW: 440,
    });
    // boarding pass
    ctx.save();
    ctx.translate(290, 345);
    ctx.rotate(-0.03);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(-212, -82, 430, 170);
    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(-218, -88, 430, 170);
    ctx.strokeStyle = "#13306a";
    ctx.lineWidth = 3;
    ctx.strokeRect(-218, -88, 430, 170);
    ctx.fillStyle = "#13306a";
    ctx.fillRect(-218, -88, 430, 34);
    X.text(ctx, "BOARDING PASS · LIBERTY JETLINER", -3, -70, {
      font: "condensed",
      size: 22,
      color: "#f4ecd8",
      spacing: 3,
      maxW: 400,
      noSafe: true,
    });
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(110, -54);
    ctx.lineTo(110, 82);
    ctx.stroke();
    ctx.setLineDash([]);
    X.text(ctx, "NEW YORK  →  LOS ANGELES", -55, -22, {
      font: "typewriter",
      size: 24,
      color: INK,
      maxW: 300,
      noSafe: true,
    });
    X.text(ctx, "FLIGHT 1 · SEAT 4A · 9:15 A.M.", -55, 16, {
      font: "typewriter",
      size: 20,
      color: INK,
      maxW: 300,
      noSafe: true,
    });
    X.text(ctx, "LUNCH SERVED ALOFT", -55, 50, {
      font: "typewriter",
      size: 18,
      color: "#c8202a",
      maxW: 300,
      noSafe: true,
    });
    X.text(ctx, "4A", 160, 14, {
      font: "impact",
      size: 52,
      color: "#13306a",
      maxW: 90,
      noSafe: true,
    });
    ctx.restore();
    K.fine(
      ctx,
      "See your travel agent or call Liberty Jetliner reservations",
      290,
      470,
      "rgba(19,48,106,0.7)",
      15,
    );
  });

  // ------------------------------------------------------------------ THE FIRST JOURNAL (the newsboy: EXTRA!)
  alt("first_journal", function (ctx, r) {
    K.bg(ctx, 1000, 500, "sunburst", "#f2d64a", "#f8e27a", {
      cx: 780,
      cy: 300,
      rays: 30,
    });
    A.kid(ctx, 790, 215, 72, { shirt: "#2a4a8a", hair: "#8a4a1a" });
    A.ell(ctx, 790, 150, 80, 30);
    A.fs(ctx, "#5a4a3a", 4);
    A.ell(ctx, 840, 166, 48, 11);
    A.fs(ctx, "#4a3a2a", 3);
    A.newspaper(ctx, 640, 410, 170, 120, { rot: -0.12, head: "EXTRA!" });
    A.newspaper(ctx, 880, 418, 140, 104, { rot: 0.12, head: "EXTRA!" });
    BA.bubble(ctx, 580, 110, 220, 100, 720, 175);
    X.text(ctx, "EXTRA!", 580, 100, {
      font: "impact",
      size: 52,
      color: "#b81c1c",
      maxW: 180,
    });
    X.text(ctx, "Read all about it in", 255, 90, {
      font: "serif",
      size: 36,
      italic: true,
      color: INK,
      maxW: 420,
    });
    X.text(ctx, "THE FIRST", 255, 160, {
      font: "didone",
      size: 66,
      color: "#141210",
      maxW: 420,
    });
    X.text(ctx, "JOURNAL", 255, 235, {
      font: "didone",
      size: 84,
      color: "#141210",
      maxW: 420,
    });
    ctx.fillStyle = "#141210";
    ctx.fillRect(60, 285, 390, 4);
    K.scriptLogo(ctx, this.slogans[0], 255, 335, 50, "#b81c1c", "#f8e27a", {
      maxW: 420,
    });
    X.text(ctx, "HOME DELIVERY 35¢ A WEEK · ASK YOUR NEWSDEALER", 255, 405, {
      font: "condensed",
      size: 22,
      color: INK,
      spacing: 2,
      maxW: 420,
    });
  });

  // ------------------------------------------------------------------ PIZZA GALAXY (the close-up: a slice lifting off)
  alt("pizza_galaxy", function (ctx, r) {
    ctx.fillStyle = "#f6eee0";
    ctx.fillRect(0, 0, 1000, 500);
    ctx.fillStyle = "rgba(200,50,30,0.85)";
    for (let y = 0; y < 500; y += 50)
      for (let x = ((y / 50) % 2) * 50; x < 600; x += 100)
        ctx.fillRect(x, y, 50, 50);
    ctx.fillStyle = A.rgrad(ctx, 290, 300, 50, 420, [
      [0, "rgba(0,0,0,0)"],
      [1, "rgba(30,10,5,0.55)"],
    ]);
    ctx.fillRect(0, 0, 600, 500);
    A.ell(ctx, 280, 345, 245, 112);
    A.fs(ctx, "#8a5a2a", 5);
    A.pizza(ctx, 280, 330, 215, { tilt: 0.45, seed: 3 });
    A.pizzaSlice(ctx, 480, 112, 190, -0.57, {});
    K.panel(ctx, 600, 0, 400, 500, "#1a1240", 0);
    A.stars(ctx, 600, 0, 400, 500, 70, r);
    ctx.fillStyle = "#ffb030";
    ctx.fillRect(600, 0, 8, 500);
    X.text(ctx, "PIZZA", 800, 85, {
      font: "deco",
      size: 84,
      color: "#ffb030",
      glow: "#ff8a20",
      glowBlur: 12,
      maxW: 340,
    });
    X.text(ctx, "GALAXY", 800, 162, {
      font: "deco",
      size: 66,
      color: "#5ad8ff",
      spacing: 6,
      maxW: 340,
    });
    X.text(ctx, "Out of this world.", 800, 240, {
      font: "serif",
      size: 32,
      italic: true,
      color: "#fff",
      maxW: 340,
    });
    X.text(ctx, "Into your mouth", 800, 285, {
      font: "serif",
      size: 32,
      italic: true,
      color: "#ffd27a",
      maxW: 340,
    });
    X.text(ctx, "in 30 minutes.", 800, 328, {
      font: "serif",
      size: 32,
      italic: true,
      color: "#ffd27a",
      maxW: 340,
    });
    BA.stopwatch(ctx, 800, 420, 46, "30 MIN.");
  });

  // ------------------------------------------------------------------ EMPIRE BREW HOUSE (the engraved label)
  alt("empire_brew", function (ctx, r) {
    K.bg(ctx, 1000, 500, "solid", "#efe4c8");
    ctx.strokeStyle = "#7a1a14";
    ctx.lineWidth = 8;
    ctx.strokeRect(42, 42, 916, 416);
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, 888, 388);
    for (const [x, y] of [
      [56, 56],
      [944, 56],
      [56, 444],
      [944, 444],
    ]) {
      A.ell(ctx, x, y, 14, 14);
      A.fs(ctx, "#c8a040", 3);
    }
    A.ell(ctx, 500, 200, 150, 112);
    A.fs(ctx, "#7a1a14", 6);
    A.ell(ctx, 500, 200, 136, 98);
    A.fs(ctx, null, 2, "#e8c060");
    ctx.save();
    A.ell(ctx, 500, 200, 134, 96);
    ctx.clip();
    ctx.fillStyle = "#efe4c8";
    ctx.fillRect(458, 120, 84, 160);
    for (const ax of [478, 522]) {
      ctx.beginPath();
      ctx.moveTo(ax - 12, 280);
      ctx.lineTo(ax - 12, 175);
      ctx.quadraticCurveTo(ax, 150, ax + 12, 175);
      ctx.lineTo(ax + 12, 280);
      ctx.fillStyle = "#7a1a14";
      ctx.fill();
    }
    ctx.strokeStyle = "#efe4c8";
    ctx.lineWidth = 2;
    for (let k = 0; k < 7; k++) {
      ctx.beginPath();
      ctx.moveTo(458, 128);
      ctx.lineTo(360, 160 + k * 16);
      ctx.moveTo(542, 128);
      ctx.lineTo(640, 160 + k * 16);
      ctx.stroke();
    }
    ctx.fillStyle = "#efe4c8";
    ctx.fillRect(360, 252, 280, 8);
    ctx.restore();
    X.text(ctx, "EST. 1897", 210, 175, {
      font: "copper",
      size: 34,
      color: "#7a1a14",
      maxW: 220,
    });
    X.text(ctx, "BUSHWICK", 210, 225, {
      font: "condensed",
      size: 24,
      color: "#5a4a2a",
      spacing: 6,
      maxW: 220,
    });
    X.text(ctx, "BROOKLYN", 790, 175, {
      font: "copper",
      size: 34,
      color: "#7a1a14",
      maxW: 220,
    });
    X.text(ctx, "NEW YORK", 790, 225, {
      font: "condensed",
      size: 24,
      color: "#5a4a2a",
      spacing: 6,
      maxW: 220,
    });
    X.text(ctx, "EMPIRE BREW HOUSE", 500, 352, {
      font: "copper",
      size: 58,
      color: "#7a1a14",
      spacing: 2,
      maxW: 760,
    });
    X.text(ctx, "L A G E R   B E E R", 500, 400, {
      font: "condensed",
      size: 28,
      color: "#5a4a2a",
      maxW: 600,
    });
    X.text(ctx, this.slogans[0], 500, 436, {
      font: "serif",
      size: 24,
      italic: true,
      color: "#3a2a1a",
      maxW: 760,
    });
  });

  // ------------------------------------------------------------------ SILVER TORCH (silver on navy, three packs)
  alt("silver_torch", function (ctx, r) {
    K.bg(ctx, 1000, 500, "solid", "#0f1c38");
    ctx.strokeStyle = "rgba(216,221,226,0.08)";
    ctx.lineWidth = 2;
    for (let x = 0; x < 1000; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 500);
      ctx.stroke();
    }
    ctx.fillStyle = A.grad(ctx, 0, 0, 1000, 0, [
      [0, "#7a848c"],
      [0.3, "#f4f8fa"],
      [0.55, "#a8b2ba"],
      [0.8, "#eef2f4"],
      [1, "#7a848c"],
    ]);
    ctx.fillRect(0, 228, 1000, 4);
    A.torch(ctx, 500, 70, 42, {});
    K.scriptLogo(ctx, "Silver Torch", 500, 160, 104, "#eef2f4", "#3a4a6a", {
      maxW: 640,
    });
    X.text(ctx, "“" + this.slogans[0] + "”", 500, 268, {
      font: "serif",
      size: 32,
      italic: true,
      color: "#e8c050",
      maxW: 760,
    });
    A.cigPack(ctx, 330, 410, 88, 126, {});
    A.cigPack(ctx, 500, 400, 96, 138, {});
    A.cigPack(ctx, 670, 410, 88, 126, {});
    for (const [x, t] of [
      [140, "KING SIZE"],
      [860, "FILTER TIP"],
    ]) {
      X.rrect(ctx, x - 90, 380, 180, 54, 27);
      A.fs(ctx, "#d8dde2", 3, "#3a4a6a");
      X.text(ctx, t, x, 408, {
        font: "deco",
        size: 26,
        color: "#0f1c38",
        maxW: 160,
      });
    }
  });

  // ------------------------------------------------------------------ BURGER BRIGADE (the brigade on parade)
  alt("burger_brigade", function (ctx, r) {
    K.bg(ctx, 1000, 500, "gradient", "#7ac0ec", "#e8f4f8");
    ctx.fillStyle = "#6aa84a";
    ctx.fillRect(0, 380, 1000, 60);
    ctx.fillStyle = "#c8201a";
    ctx.fillRect(0, 440, 1000, 60);
    for (let k = 0; k < 5; k++) {
      const x = 180 + k * 160,
        y = 310,
        w = 112,
        step = k % 2 ? 1 : -1;
      for (const sd of [-1, 1]) {
        A.lin(
          ctx,
          x + sd * 16,
          y + 28,
          x + sd * 16 + step * sd * 10,
          y + 70,
          7,
          INK,
        );
        A.ell(ctx, x + sd * 16 + step * sd * 10 + 8, y + 74, 14, 7);
        A.fs(ctx, "#1a1a1a", 2);
      }
      A.burger(ctx, x, y, w);
      A.lin(
        ctx,
        x - w * 0.5,
        y - 10,
        x - w * 0.75,
        y + (k === 0 ? -50 : 20),
        6,
        INK,
      );
      A.lin(ctx, x + w * 0.5, y - 10, x + w * 0.75, y + 20, 6, INK);
      if (k === 0) {
        A.lin(ctx, x - w * 0.75, y - 50, x - w * 0.95, y - 110, 4, "#f2c43a");
        A.ell(ctx, x - w * 0.95, y - 112, 8, 8);
        A.fs(ctx, "#f2c43a", 2);
      }
      for (const sd of [-1, 1]) {
        A.ell(ctx, x + sd * 16, y - 28, 6, 7);
        A.fs(ctx, "#fff", 2);
        A.ell(ctx, x + sd * 16, y - 27, 2.5, 3);
        A.fs(ctx, INK);
      }
      X.rrect(ctx, x - 18, y - 92, 36, 46, 6);
      A.fs(ctx, "#c8201a", 3);
      ctx.fillStyle = "#f2c43a";
      ctx.fillRect(x - 18, y - 60, 36, 6);
      A.ell(ctx, x, y - 100, 7, 12);
      A.fs(ctx, "#fff", 2);
    }
    K.ribbonText(
      ctx,
      "BURGER BRIGADE",
      500,
      75,
      760,
      96,
      "#c8201a",
      "#7a0e0a",
      "#fff",
    );
    X.text(ctx, this.slogans[0], 500, 170, {
      font: "impact",
      size: 46,
      color: "#1e3a8a",
      stroke: "#fff",
      strokeW: 6,
      maxW: 820,
    });
    X.text(
      ctx,
      "NOW SERVING AT 30 BRIGADE POSTS · DRIVE IN OR WALK UP",
      500,
      470,
      { font: "condensed", size: 28, color: "#fff", spacing: 3, maxW: 900 },
    );
  });

  // ------------------------------------------------------------------ EXCALIBUR GARDENS (the artist's rendering)
  alt("excalibur_gardens", function (ctx, r) {
    K.bg(ctx, 1000, 500, "gradient", "#8ac8f0", "#fdf0d8");
    BA.cloud(ctx, 620, 70, 26, "rgba(255,255,255,0.85)");
    ctx.fillStyle = "#7ab85a";
    ctx.beginPath();
    ctx.moveTo(0, 420);
    ctx.quadraticCurveTo(300, 360, 520, 395);
    ctx.quadraticCurveTo(760, 430, 1000, 380);
    ctx.lineTo(1000, 500);
    ctx.lineTo(0, 500);
    ctx.fill();
    ctx.fillStyle = "#5a9a3a";
    ctx.beginPath();
    ctx.moveTo(0, 470);
    ctx.quadraticCurveTo(500, 430, 1000, 470);
    ctx.lineTo(1000, 500);
    ctx.lineTo(0, 500);
    ctx.fill();
    ctx.fillStyle = "#e8d8b0";
    ctx.beginPath();
    ctx.moveTo(690, 395);
    ctx.quadraticCurveTo(640, 450, 560, 500);
    ctx.lineTo(640, 500);
    ctx.quadraticCurveTo(690, 450, 712, 395);
    ctx.fill();
    A.castle(ctx, 700, 395, 430, {});
    A.swordStone(ctx, 900, 470, 34);
    X.text(ctx, "EXCALIBUR", 260, 160, {
      font: "copper",
      size: 74,
      color: "#1e3a6a",
      stroke: "#fff",
      strokeW: 6,
      maxW: 420,
    });
    X.text(ctx, "GARDENS", 260, 232, {
      font: "copper",
      size: 58,
      color: "#c8302a",
      stroke: "#fff",
      strokeW: 5,
      spacing: 6,
      maxW: 400,
    });
    K.scriptLogo(ctx, "Your kingdom awaits.", 260, 312, 54, "#1e3a6a", "#fff", {
      maxW: 420,
    });
    ctx.save();
    ctx.translate(255, 60);
    ctx.rotate(-0.06);
    K.ribbonText(
      ctx,
      "COMING SOON · SUMMER 1967",
      0,
      0,
      380,
      56,
      "#c8201a",
      "#7a0e0a",
      "#fff",
    );
    ctx.restore();
    X.text(
      ctx,
      "Knights, castles and a dragon’s lair · forty minutes from Times Square",
      300,
      465,
      {
        font: "serif",
        size: 20,
        italic: true,
        weight: "normal",
        color: "#fff",
        maxW: 520,
      },
    );
  });

  // ------------------------------------------------------------------ JUNIOR ROCKETEER (the kit box & Astronaut Ice Cream)
  alt("junior_rocketeer", function (ctx, r) {
    K.bg(ctx, 1000, 500, "radial", "#1e3a7a", "#060c24", { cx: 300, cy: 260 });
    A.stars(ctx, 0, 0, 1000, 500, 140, r);
    ctx.strokeStyle = "rgba(150,200,255,0.25)";
    ctx.lineWidth = 2;
    for (let k = 1; k < 4; k++) {
      ctx.beginPath();
      ctx.ellipse(300, 270, 120 + k * 70, 40 + k * 22, -0.25, 0, TAU);
      ctx.stroke();
    }
    A.ell(ctx, 930, 60, 70, 70);
    ctx.fillStyle = A.rgrad(ctx, 905, 40, 5, 80, [
      [0, "#f8d8a0"],
      [1, "#c87a3a"],
    ]);
    ctx.fill();
    A.box3d(ctx, 80, 120, 200, 290, 60, BA.kitFront, "#8a1410", "#f4f0e6");
    A.foilPouch(ctx, 425, 300, 150, 230, BA.pouchLabel, {});
    X.text(ctx, "ASTRONAUT", 760, 100, {
      font: "deco",
      size: 66,
      color: "#fff",
      spacing: 4,
      maxW: 400,
    });
    X.text(ctx, "ICE CREAM", 760, 170, {
      font: "deco",
      size: 58,
      color: "#ff9ab8",
      spacing: 4,
      maxW: 400,
    });
    X.text(ctx, "Freeze-dried Neapolitan, ready for orbit.", 760, 238, {
      font: "serif",
      size: 26,
      italic: true,
      color: "#cfe8ff",
      maxW: 400,
    });
    X.text(ctx, "from JUNIOR ROCKETEER CO.", 760, 290, {
      font: "condensed",
      size: 28,
      color: "#f4d040",
      spacing: 3,
      maxW: 400,
    });
    X.text(ctx, this.slogans[0], 760, 365, {
      font: "impact",
      size: 44,
      color: "#fff",
      stroke: "#0a1a4a",
      strokeW: 5,
      maxW: 400,
    });
    K.fine(
      ctx,
      "No spoon, no freezer. Just open the pouch and enjoy.",
      760,
      470,
      "rgba(207,232,255,0.75)",
      16,
    );
  });

  // ------------------------------------------------------------------ MIRACLE MANE (the apothecary label)
  alt("miracle_mane", function (ctx, r) {
    K.bg(ctx, 1000, 500, "solid", "#16382a");
    ctx.strokeStyle = "#c8a040";
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 940, 440);
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, 912, 412);
    for (const [x, y, sx, sy] of [
      [44, 44, 1, 1],
      [956, 44, -1, 1],
      [44, 456, 1, -1],
      [956, 456, -1, -1],
    ]) {
      ctx.beginPath();
      ctx.arc(x + sx * 24, y + sy * 24, 18, 0, TAU);
      ctx.strokeStyle = "#c8a040";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    A.ell(ctx, 195, 210, 112, 140);
    A.fs(ctx, "#e8d8b0", 8, "#c8a040");
    ctx.save();
    A.ell(ctx, 195, 210, 106, 134);
    ctx.clip();
    ctx.fillStyle = A.rgrad(ctx, 195, 190, 10, 150, [
      [0, "#f4e8c8"],
      [1, "#c8b088"],
    ]);
    ctx.fillRect(80, 70, 230, 290);
    A.dad(ctx, 195, 205, 52, {
      hat: false,
      hairColor: "#e8e4dc",
      beard: "#e8e4dc",
      suit: "#2a2a2a",
      tie: "#7a1a14",
    });
    ctx.restore();
    X.text(ctx, "DR. E. THATCHER", 195, 385, {
      font: "copper",
      size: 28,
      color: "#e8c060",
      maxW: 260,
    });
    X.text(ctx, "Chemist · Philadelphia", 195, 420, {
      font: "serif",
      size: 20,
      italic: true,
      color: "#f4ecd4",
      maxW: 260,
    });
    A.tonicBottle(ctx, 500, 62, 370, BA.maneLabel, { glass: "#2a7a4a" });
    X.text(ctx, "MIRACLE", 795, 115, {
      font: "copper",
      size: 58,
      color: "#e8c060",
      maxW: 300,
    });
    X.text(ctx, "MANE", 795, 188, {
      font: "copper",
      size: 76,
      color: "#f4ecd4",
      maxW: 300,
    });
    X.text(ctx, "Grows hair on anything.", 795, 268, {
      font: "serif",
      size: 28,
      italic: true,
      color: "#f4ecd4",
      maxW: 300,
    });
    K.scriptLogo(ctx, "Anything.", 795, 330, 54, "#e8c060", "#0a1e14", {
      maxW: 300,
    });
    X.text(ctx, "NO GREASE · NO ALCOHOL · 69¢", 795, 400, {
      font: "condensed",
      size: 22,
      color: "#c8a040",
      spacing: 3,
      maxW: 300,
    });
  });

  // ------------------------------------------------------------------ BIG APPLE MOTOR CAB (taxi yellow, all type)
  alt("big_apple_cab", function (ctx, r) {
    K.bg(ctx, 1000, 500, "solid", "#f2c21a");
    for (const y0 of [0, 452])
      for (let row = 0; row < 2; row++)
        for (let x = 0; x < 1000; x += 24)
          if ((x / 24 + row) % 2) {
            ctx.fillStyle = "#151515";
            ctx.fillRect(x, y0 + row * 24, 24, 24);
          }
    X.sunburst(
      ctx,
      240,
      250,
      360,
      20,
      "rgba(0,0,0,0)",
      "rgba(255,255,255,0.18)",
    );
    A.apple(ctx, 240, 260, 150, {});
    X.text(ctx, "Just get in", 660, 150, {
      font: "impact",
      size: 96,
      color: "#151515",
      maxW: 560,
    });
    X.text(ctx, "already!", 660, 255, {
      font: "impact",
      size: 116,
      color: "#c8201a",
      stroke: "#151515",
      strokeW: 6,
      maxW: 560,
      extrude: { color: "#151515", n: 5 },
    });
    X.text(ctx, "BIG APPLE MOTOR CAB", 660, 348, {
      font: "condensed",
      size: 42,
      color: "#151515",
      spacing: 6,
      maxW: 560,
    });
    X.text(
      ctx,
      "Five boroughs. Twelve hundred cabs. One number: PLaza 7-1000",
      660,
      405,
      {
        font: "serif",
        size: 22,
        italic: true,
        weight: "normal",
        color: "#151515",
        maxW: 560,
      },
    );
  });

  // ------------------------------------------------------------------ MAMA MARINARA'S (supper on the table)
  alt("mama_marinara", function (ctx, r) {
    K.bg(ctx, 1000, 500, "solid", "#f8f0e0");
    ctx.fillStyle = "rgba(200,40,30,0.5)";
    for (let x = 0; x < 1000; x += 50) ctx.fillRect(x, 300, 25, 200);
    for (let y = 300; y < 500; y += 50) ctx.fillRect(0, y, 1000, 25);
    ctx.fillStyle = "#2a7a3a";
    ctx.fillRect(0, 0, 1000, 70);
    ctx.fillStyle = "#c8281e";
    ctx.fillRect(0, 70, 1000, 8);
    BA.meatballPlate(ctx, 330, 395, 210);
    BA.steam(ctx, 330, 340, 4, 70);
    A.can(ctx, 820, 270, 210, 290, BA.marinaraLabel, "#c8c8c0");
    X.text(ctx, "SUNDAY SUPPER, ANY NIGHT OF THE WEEK", 500, 38, {
      font: "condensed",
      size: 30,
      color: "#f8f0e0",
      spacing: 4,
      maxW: 900,
    });
    K.scriptLogo(ctx, "Just add water.", 330, 135, 72, "#c8281e", "#fff", {
      maxW: 560,
    });
    X.text(ctx, "Mama will never know.", 330, 222, {
      font: "serif",
      size: 40,
      italic: true,
      color: "#2a3a2a",
      maxW: 560,
    });
    X.text(ctx, "MAMA MARINARA’S INSTANT MEATBALLS", 330, 272, {
      font: "condensed",
      size: 28,
      color: "#2a7a3a",
      spacing: 2,
      maxW: 560,
    });
    K.badge(ctx, ["READY IN", "5 MIN."], 625, 425, 52, "#2a7a3a", "#fff", 0.05);
  });

  // ------------------------------------------------------------------ HI-OCTANE HARRY'S (open all night)
  alt("hi_octane", function (ctx, r) {
    K.bg(ctx, 1000, 500, "gradient", "#0e1a3a", "#4a5a8a");
    A.stars(ctx, 0, 0, 1000, 260, 90, r);
    ctx.fillStyle = "#2a2a30";
    ctx.fillRect(0, 430, 1000, 70);
    ctx.fillStyle = A.rgrad(ctx, 640, 430, 10, 360, [
      [0, "rgba(255,240,200,0.55)"],
      [1, "rgba(255,240,200,0)"],
    ]);
    ctx.fillRect(260, 180, 760, 320);
    ctx.fillStyle = "#d8261a";
    ctx.beginPath();
    ctx.moveTo(300, 150);
    ctx.lineTo(980, 150);
    ctx.lineTo(960, 215);
    ctx.lineTo(320, 215);
    ctx.fill();
    for (let k = 0; k < 34; k++) {
      ctx.fillStyle = k % 2 ? "#151515" : "#f4f0e0";
      ctx.fillRect(312 + k * 19.5, 200, 19.5, 10);
    }
    ctx.fillStyle = "#b8b8b0";
    for (const px of [360, 640, 920]) ctx.fillRect(px - 7, 215, 14, 215);
    A.gasPump(ctx, 470, 430, 140, "#d8261a");
    A.gasPump(ctx, 560, 430, 140, "#ffd23a");
    A.gasPump(ctx, 790, 430, 140, "#d8261a");
    X.text(ctx, "HI-OCTANE HARRY’S", 640, 176, {
      font: "impact",
      size: 44,
      italic: true,
      skew: -0.2,
      color: "#fff",
      maxW: 560,
    });
    A.harryMark(ctx, 160, 260, 70, {});
    X.text(ctx, "OPEN ALL NIGHT", 640, 80, {
      font: "deco",
      size: 52,
      color: "#ffe24a",
      glow: "#ffb020",
      glowBlur: 18,
      spacing: 6,
      maxW: 560,
    });
    X.text(ctx, this.slogans[0], 600, 465, {
      font: "deco",
      size: 28,
      color: "#f8f4e8",
      maxW: 680,
    });
  });

  // ------------------------------------------------------------------ FREEDOM FLAKES (the big box, mirrored)
  alt("freedom_flakes", function (ctx, r) {
    K.bg(ctx, 1000, 500, "radial", "#f8e070", "#e8902a", { cx: 220, cy: 250 });
    X.sunburst(
      ctx,
      220,
      250,
      700,
      20,
      "rgba(0,0,0,0)",
      "rgba(255,255,255,0.18)",
    );
    for (let k = 0; k < 12; k++) {
      const a = r() * TAU,
        d = 150 + r() * 110;
      A.ell(ctx, 220 + Math.cos(a) * d, 250 + Math.sin(a) * d * 0.8, 12, 8, a);
      A.fs(ctx, "#e8a83a", 2);
    }
    A.box3d(ctx, 110, 90, 180, 290, 55, BA.flakesFront, "#14286a", "#f4e8c8");
    A.kid(ctx, 880, 210, 62, { shirt: "#c8201a" });
    X.text(ctx, "FREEDOM", 570, 100, {
      font: "rounded",
      size: 92,
      color: "#fff",
      stroke: INK,
      strokeW: 9,
      maxW: 330,
      extrude: { color: "#0a1a4a", n: 6 },
    });
    X.text(ctx, "FLAKES!", 570, 200, {
      font: "rounded",
      size: 100,
      color: "#c8201a",
      stroke: INK,
      strokeW: 9,
      maxW: 350,
      extrude: { color: "#5a0a0a", n: 6 },
    });
    K.ribbonText(
      ctx,
      this.slogans[0].toUpperCase(),
      580,
      300,
      420,
      52,
      "#1e3a8a",
      "#0a1a4a",
      "#fff",
    );
    X.text(ctx, "FROM BROOKLYN SUGAR WORKS", 590, 375, {
      font: "impact",
      size: 34,
      color: INK,
      maxW: 380,
    });
    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(0, 440, 1000, 60);
    K.fine(
      ctx,
      "Seven vitamins and a free Junior Rocketeer decal in every box!",
      500,
      470,
      "rgba(255,255,255,0.9)",
      16,
    );
  });

  // ------------------------------------------------------------------ CHOCOLATE ZEPPELIN (the close-up: cut to show the cream)
  alt("chocolate_zeppelin", function (ctx, r) {
    K.bg(ctx, 1000, 500, "radial", "#6a3418", "#1e0c04", { cx: 330, cy: 280 });
    ctx.fillStyle = A.grad(ctx, 0, 0, 1000, 0, [
      [0, "#9aa4ac"],
      [0.5, "#f4f6f8"],
      [1, "#8a949c"],
    ]);
    ctx.beginPath();
    ctx.moveTo(560, 0);
    ctx.lineTo(620, 0);
    ctx.lineTo(520, 500);
    ctx.lineTo(460, 500);
    ctx.fill();
    A.ell(ctx, 300, 390, 250, 58);
    A.fs(ctx, "#f8f6f0", 5);
    A.ell(ctx, 300, 390, 200, 40);
    A.fs(ctx, null, 2, "rgba(0,0,0,0.15)");
    A.zeppelin(ctx, 245, 250, 250, { shadow: false });
    A.zeppelin(ctx, 290, 330, 300, { cut: true, shadow: false });
    X.text(ctx, "CHOCOLATE", 790, 92, {
      font: "deco",
      size: 58,
      color: "#fbf2dc",
      spacing: 4,
      maxW: 360,
    });
    X.text(ctx, "ZEPPELIN", 790, 165, {
      font: "deco",
      size: 74,
      color: "#d8dde2",
      spacing: 4,
      maxW: 360,
    });
    K.scriptLogo(ctx, "Lighter than air.", 790, 245, 50, "#f6c8a0", "#2a0e04", {
      maxW: 360,
    });
    K.scriptLogo(ctx, "Sweeter than pie.", 790, 310, 50, "#fbf2dc", "#2a0e04", {
      maxW: 360,
    });
    K.badge(ctx, ["TWIN", "PACK!"], 905, 420, 50, "#c8201a", "#fff", 0.2);
    X.text(ctx, "A vanilla-cream heart in every one", 720, 425, {
      font: "serif",
      size: 22,
      italic: true,
      weight: "normal",
      color: "#f4e4cc",
      maxW: 300,
    });
  });

  // ------------------------------------------------------------------ GOLDEN PLAIN (on the chuck-wagon board)
  alt("golden_plain", function (ctx, r) {
    for (let y = 0, k = 0; y < 500; y += 62, k++) {
      ctx.fillStyle = ["#5a3a1e", "#6a4424", "#52341a"][k % 3];
      ctx.fillRect(0, y, 1000, 62);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, y, 1000, 3);
      ctx.strokeStyle = "rgba(255,220,170,0.1)";
      ctx.lineWidth = 2;
      for (let g = 0; g < 4; g++) {
        ctx.beginPath();
        ctx.moveTo(0, y + 12 + g * 12);
        ctx.bezierCurveTo(
          300,
          y + 8 + g * 12 + r() * 8,
          700,
          y + 16 + g * 12,
          1000,
          y + 12 + g * 12,
        );
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#b8201a";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(170, 0);
    ctx.lineTo(0, 150);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (let k = 0; k < 8; k++) {
      ctx.beginPath();
      ctx.arc(20 + k * 18, 20 + (k % 3) * 22, 4, 0, TAU);
      ctx.fill();
    }
    A.jerkyBag(ctx, 240, 265, 230, 330, BA.plainLabel, {});
    for (let k = 0; k < 5; k++)
      A.jerkyStrip(
        ctx,
        470 + k * 60,
        400 + (k % 2) * 25,
        120,
        -0.4 + k * 0.2,
        k + 5,
      );
    X.text(ctx, "Tough enough", 700, 105, {
      font: "impact",
      size: 72,
      color: "#f4e6c0",
      stroke: "#1a0a04",
      strokeW: 6,
      maxW: 460,
    });
    X.text(ctx, "for any trail.", 700, 185, {
      font: "impact",
      size: 72,
      color: "#f4d27a",
      stroke: "#1a0a04",
      strokeW: 6,
      maxW: 460,
    });
    X.text(ctx, "GOLDEN PLAIN BEEF JERKY", 700, 262, {
      font: "slab",
      size: 36,
      color: "#f4e6c0",
      maxW: 460,
    });
    K.badge(ctx, ["HICKORY", "SMOKED"], 905, 345, 58, "#b8201a", "#fff", 0.05);
  });

  // ------------------------------------------------------------------ HOMEGUARD (before / after)
  alt("homeguard", function (ctx, r) {
    ctx.fillStyle = "#7a6a4a";
    ctx.fillRect(0, 0, 500, 500);
    X.blotches(ctx, 500, 500, r, {
      count: 18,
      color: "#3a2a14",
      alpha: 0.45,
      rmin: 20,
      rmax: 70,
    });
    ctx.fillStyle = "#eef6f4";
    ctx.fillRect(500, 0, 500, 500);
    for (let k = 0; k < 14; k++) {
      const x = 560 + r() * 400,
        y = 150 + r() * 250;
      X.starPath(ctx, x, y, 12 + r() * 16, 3, 4);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#8ab8d8";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.fillStyle = "#1e3a6a";
    ctx.fillRect(0, 0, 1000, 125);
    ctx.fillStyle = "#c8201a";
    ctx.fillRect(0, 125, 1000, 8);
    X.text(ctx, "HOMEGUARD CLEANSER", 500, 66, {
      font: "impact",
      size: 80,
      color: "#fff",
      stroke: INK,
      strokeW: 7,
      maxW: 900,
      extrude: { color: "#0a1a3a", n: 5 },
    });
    X.text(ctx, "BEFORE", 200, 190, {
      font: "marker",
      size: 60,
      color: "#f4ecd8",
      maxW: 320,
    });
    X.text(ctx, "AFTER", 800, 190, {
      font: "marker",
      size: 60,
      color: "#1e3a6a",
      maxW: 320,
    });
    A.can(ctx, 500, 300, 140, 200, BA.homeguardLabel, "#c8c8c0");
    ctx.strokeStyle = "rgba(40,24,8,0.6)";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(200, 320, 60, 0, TAU);
    ctx.stroke();
    K.ribbonText(
      ctx,
      this.slogans[0].toUpperCase(),
      500,
      445,
      640,
      50,
      "#c8201a",
      "#7a1a08",
      "#fff",
    );
  });

  // ------------------------------------------------------------------ LONLY (family night)
  alt("lonly_tv", function (ctx, r) {
    K.bg(ctx, 1000, 500, "dots", "#e8d8b0", "#dcc898", { s: 28 });
    ctx.fillStyle = "#7a4a2a";
    ctx.fillRect(0, 410, 1000, 90);
    ctx.fillStyle = "#5a321a";
    for (let x = 0; x < 1000; x += 60) ctx.fillRect(x, 410, 3, 90);
    const scr = A.tv(ctx, 230, 285, 160, { cabinet: "#5a3a1e" });
    ctx.save();
    ctx.beginPath();
    X.rrect(ctx, scr.x, scr.y, scr.w, scr.h, 18);
    ctx.clip();
    ctx.fillStyle = A.rgrad(
      ctx,
      scr.x + scr.w / 2,
      scr.y + scr.h / 2,
      4,
      scr.w * 0.7,
      [
        [0, "#e8f4f0"],
        [1, "#6a8a88"],
      ],
    );
    ctx.fillRect(scr.x, scr.y, scr.w, scr.h);
    BA.lonlyMark(
      ctx,
      scr.x + scr.w / 2,
      scr.y + scr.h * 0.6,
      scr.w * 0.7,
      "#2a3a3a",
      "#d8ece6",
    );
    for (let y = scr.y; y < scr.y + scr.h; y += 4) {
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.fillRect(scr.x, y, scr.w, 2);
    }
    ctx.restore();
    ctx.fillStyle = "#3a6a5a";
    X.rrect(ctx, 520, 330, 440, 100, 30);
    ctx.fill();
    A.dad(ctx, 600, 255, 48, { suit: "#4a5a6a", hat: false });
    A.housewife(ctx, 740, 262, 45, { dress: "#d84a4a" });
    A.kid(ctx, 870, 290, 36, {});
    X.text(ctx, "LONLY", 700, 72, {
      font: "deco",
      size: 74,
      color: "#2a4a5a",
      spacing: 14,
      maxW: 520,
    });
    K.scriptLogo(ctx, this.slogans[0], 700, 142, 46, "#c8401a", "#f4ecd8", {
      maxW: 500,
    });
    X.text(ctx, "GATHER ’ROUND · 23-INCH CONSOLES FROM $239", 500, 462, {
      font: "condensed",
      size: 28,
      color: "#f0c040",
      spacing: 3,
      maxW: 900,
    });
  });

  // ------------------------------------------------------------------ EAGLE MOTORS (the showroom)
  alt("eagle_motors", function (ctx, r) {
    K.bg(ctx, 1000, 500, "gradient", "#1e4a5a", "#0a1a22");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const sx of [250, 500, 750]) {
      const g = ctx.createLinearGradient(sx, 0, sx, 460);
      g.addColorStop(0, "rgba(255,250,220,0.35)");
      g.addColorStop(1, "rgba(255,250,220,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(sx - 20, 0);
      ctx.lineTo(sx + 20, 0);
      ctx.lineTo(sx + 170, 460);
      ctx.lineTo(sx - 170, 460);
      ctx.fill();
    }
    ctx.restore();
    A.ell(ctx, 500, 455, 400, 40);
    A.fs(ctx, "#c8c8c0", 4);
    A.ell(ctx, 500, 450, 380, 32);
    ctx.fillStyle = "#e8e8e0";
    ctx.fill();
    A.car(ctx, 500, 450, 560, { body: "#2a8a8a", top: "#f4ecd8" });
    A.eagle(ctx, 500, 45, 40, {});
    X.text(ctx, "EAGLE MOTORS", 500, 110, {
      font: "copper",
      size: 66,
      color: "#f4ecd8",
      spacing: 6,
      maxW: 560,
    });
    X.text(ctx, "THE ROYALE · HARDTOP V8", 500, 175, {
      font: "deco",
      size: 40,
      color: "#f2c43a",
      spacing: 6,
      maxW: 520,
    });
    K.scriptLogo(ctx, this.slogans[0], 500, 235, 52, "#fff", "#0a1a22", {
      maxW: 520,
    });
    K.badge(ctx, ["SEE IT", "TODAY!"], 120, 110, 60, "#f2c43a", INK, -0.15);
    K.badge(ctx, ["NEW", "FOR ’67"], 880, 110, 60, "#c8201a", "#fff", 0.15);
  });

  // ------------------------------------------------------------------ SUPER SERGEANT (the splash page)
  alt("super_sergeant", function (ctx, r) {
    K.bg(ctx, 1000, 500, "sunburst", "#c8201a", "#b01810", {
      cx: 230,
      cy: 300,
      rays: 22,
    });
    ctx.fillStyle = "#3a3a2a";
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(0, 440);
    ctx.lineTo(120, 410);
    ctx.lineTo(300, 430);
    ctx.lineTo(430, 400);
    ctx.lineTo(430, 500);
    ctx.fill();
    A.sergeant(ctx, 210, 470, 80, {});
    K.panel(ctx, 430, 0, 570, 500, "#1e3a6a", 0);
    ctx.fillStyle = INK;
    ctx.fillRect(426, 0, 8, 500);
    X.text(ctx, "SUPER SERGEANT", 715, 80, {
      font: "impact",
      size: 74,
      color: "#f2c43a",
      stroke: INK,
      strokeW: 8,
      maxW: 520,
      extrude: { color: INK, n: 6 },
    });
    X.text(ctx, "Issue #31:", 715, 160, {
      font: "marker",
      size: 40,
      color: "#fff",
      maxW: 460,
    });
    X.text(ctx, "Operation", 715, 215, {
      font: "marker",
      size: 48,
      color: "#fff",
      stroke: INK,
      strokeW: 3,
      maxW: 480,
    });
    X.text(ctx, "Thunderhead!", 715, 275, {
      font: "marker",
      size: 58,
      color: "#f2c43a",
      stroke: INK,
      strokeW: 4,
      maxW: 480,
    });
    sfx(ctx, "POW!", 560, 395, 68, "#f2e040", "#c8201a", -0.2);
    sfx(ctx, "KA-BAM!", 875, 395, 72, "#fff", "#1e3a6a", 0.15);
    K.panel(ctx, 650, 360, 130, 70, "#fff", 4);
    X.text(ctx, "BOWERY", 715, 385, {
      font: "impact",
      size: 26,
      color: "#1e3a6a",
    });
    X.text(ctx, "COMICS · 12¢", 715, 412, {
      font: "impact",
      size: 18,
      color: INK,
    });
    K.fine(
      ctx,
      this.slogans[0] + " · Approved by the Comics Standards Board",
      715,
      470,
      "rgba(255,240,200,0.8)",
      14,
    );
  });

  // ------------------------------------------------------------------ AMERICAN AUTOMATON (the Valet does the chores)
  alt("american_automaton", function (ctx, r) {
    K.bg(ctx, 1000, 500, "sunburst", "#f2c43a", "#f8d45a", {
      cx: 220,
      cy: 260,
      rays: 26,
    });
    checker(ctx, 410, 500, 45, "#f4ecd8", "#1e3a6a");
    A.valet(ctx, 200, 230, 95, { hold: "grip" });
    A.housewife(ctx, 380, 300, 34, { dress: "#c8201a", hair: "#3a2010" });
    K.scriptLogo(ctx, "The Valet", 650, 95, 100, "#c8201a", "#fff", {
      maxW: 480,
    });
    X.text(ctx, "by American Automaton Co.", 650, 172, {
      font: "serif",
      size: 28,
      italic: true,
      color: "#1a2a4a",
      maxW: 480,
    });
    X.text(ctx, "Cooks · Sweeps · Mows · Fetches the Paper", 650, 232, {
      font: "serif",
      size: 28,
      italic: true,
      weight: "normal",
      color: "#1a2a4a",
      maxW: 520,
    });
    X.text(ctx, this.slogans[1], 650, 288, {
      font: "condensed",
      size: 28,
      color: "#c8201a",
      spacing: 1,
      maxW: 520,
    });
    X.text(ctx, this.slogans[0], 650, 345, {
      font: "impact",
      size: 36,
      color: "#1e3a6a",
      maxW: 520,
    });
    K.badge(ctx, ["EASY", "TERMS!"], 900, 430, 56, "#1e3a6a", "#fff", 0.2);
  });

  // ------------------------------------------------------------------ FOREVER FRANKS (Frank-in-a-Bun, sealed fresh)
  alt("forever_franks", function (ctx, r) {
    K.bg(ctx, 1000, 500, "solid", "#fbf0d8");
    for (let x = 0; x < 1000; x += 60) {
      ctx.fillStyle = (x / 60) % 2 ? "#fbf0d8" : "#c8201a";
      ctx.fillRect(x, 0, 60, 70);
    }
    for (let x = 0; x < 1000; x += 60) {
      ctx.beginPath();
      ctx.arc(x + 30, 70, 30, 0, Math.PI);
      ctx.fillStyle = (x / 60) % 2 ? "#fbf0d8" : "#c8201a";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    X.sunburst(ctx, 300, 260, 360, 18, "rgba(0,0,0,0)", "rgba(200,32,26,0.08)");
    A.wrappedFrank(ctx, 300, 235, 420, {});
    A.frankMascot(ctx, 150, 478, 36, {});
    BA.bubble(ctx, 360, 400, 300, 86, 205, 380);
    X.text(ctx, "So good they’ll", 360, 384, {
      font: "marker",
      size: 30,
      color: INK,
      maxW: 260,
    });
    X.text(ctx, "outlive you!", 360, 420, {
      font: "marker",
      size: 34,
      color: "#c8201a",
      maxW: 260,
    });
    X.text(ctx, "FRANK-IN-A-BUN", 765, 140, {
      font: "impact",
      size: 62,
      color: "#c8201a",
      stroke: INK,
      strokeW: 5,
      maxW: 380,
    });
    X.text(ctx, "Sealed fresh with Miracle-Keep", 765, 205, {
      font: "serif",
      size: 28,
      italic: true,
      color: INK,
      maxW: 380,
    });
    X.text(ctx, "Hot or cold, it’s ready when you are.", 765, 250, {
      font: "serif",
      size: 24,
      italic: true,
      color: "#5a3a2a",
      maxW: 380,
    });
    X.text(ctx, "FOREVER FRANKS", 765, 330, {
      font: "rounded",
      size: 52,
      color: "#f4c21e",
      stroke: INK,
      strokeW: 6,
      maxW: 380,
    });
    X.text(ctx, "10¢ AT EVERY FOREVER FRANKS CART", 765, 395, {
      font: "condensed",
      size: 24,
      color: "#c8201a",
      spacing: 2,
      maxW: 380,
    });
  });
})();
