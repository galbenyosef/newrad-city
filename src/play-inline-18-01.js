// play-inline-18 01 — ctx
// Lines 14-314 of readable/play-inline-18.pretty.js (statement-aligned).
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
