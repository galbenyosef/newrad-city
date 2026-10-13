// play-inline-18 05 — ctx
// Lines 1327-1634 of readable/play-inline-18.pretty.js (statement-aligned).
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
