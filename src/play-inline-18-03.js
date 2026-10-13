// play-inline-18 03 — ctx
// Lines 662-1001 of readable/play-inline-18.pretty.js (statement-aligned).
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
