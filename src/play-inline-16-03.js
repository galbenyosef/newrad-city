// play-inline-16 03 — ctx
// Lines 652-1004 of readable/play-inline-16.pretty.js (statement-aligned).
  def("pizza_galaxy", {
    name: "Pizza Galaxy",
    colors: ["#2a1450", "#ffb030", "#5ad8ff"],
    slogans: [
      "Out of this world. Into your mouth in 30 minutes.",
      "Dine in · Take out · Rocket-fast delivery",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "radial", "#4a2480", "#0a0620", {
        cx: 700,
        cy: 250,
      });
      A.stars(ctx, 0, 0, 1000, 500, 160, r);
      const ring = (front) => {
        ctx.save();
        ctx.translate(700, 250);
        ctx.rotate(-0.18);
        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          250,
          62,
          0,
          front ? 0 : Math.PI,
          front ? Math.PI : TAU,
        );
        ctx.strokeStyle = "#ffb030";
        ctx.lineWidth = 12;
        ctx.stroke();
        ctx.strokeStyle = "#ffe08a";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      };
      ring(false);
      A.pizza(ctx, 700, 250, 180, { tilt: 0.55, seed: 1 });
      ring(true);
      A.rocket(ctx, 905, 85, 95, 0.35, { body: "#ffb030", accent: "#c8321e" });
      X.text(ctx, "PIZZA", 240, 100, {
        font: "deco",
        size: 110,
        color: "#ffb030",
        glow: "#ff8a20",
        glowBlur: 14,
        stroke: "#2a0a10",
        strokeW: 6,
        maxW: 400,
      });
      X.text(ctx, "GALAXY", 240, 200, {
        font: "deco",
        size: 86,
        color: "#5ad8ff",
        spacing: 8,
        glow: "#5ad8ff",
        glowBlur: 12,
        maxW: 400,
      });
      X.text(ctx, "Out of this world.", 240, 282, {
        font: "serif",
        size: 38,
        italic: true,
        color: "#ffffff",
        maxW: 400,
      });
      X.text(ctx, "Into your mouth in 30 minutes.", 240, 330, {
        font: "serif",
        size: 32,
        italic: true,
        color: "#ffd27a",
        maxW: 400,
      });
      K.fine(
        ctx,
        "Dine in · Take out · Rocket-fast delivery in all five boroughs",
        500,
        472,
        "rgba(220,200,255,0.8)",
        17,
      );
    },
    art(ctx, cx, cy, s) {
      A.pizza(ctx, cx, cy, s * 1.3, { tilt: 0.55, seed: 2 });
    },
    posterBg: ["radial", "#4a2480", "#0a0620"],
    posterInk: "#ffb030",
    posterFont: "deco",
  });

  // ==================================================================
  // EMPIRE BREW HOUSE (beer)
  // ==================================================================
  def("empire_brew", {
    name: "Empire Brew House",
    colors: ["#2a1408", "#e8c060", "#8a1a1a"],
    slogans: [
      "Brewed in Brooklyn. Poured everywhere.",
      "The lager New York ordered by name.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#3a1c0a", "#1a0c04");
      ctx.fillStyle = "rgba(140,70,30,0.18)";
      for (let y = 0, row = 0; y < 440; y += 26, row++)
        for (let x = (row % 2) * 40 - 40; x < 1000; x += 80)
          ctx.fillRect(x + 2, y + 2, 76, 22);
      ctx.fillStyle = A.rgrad(ctx, 300, 280, 10, 300, [
        [0, "rgba(255,200,110,0.55)"],
        [1, "rgba(255,200,110,0)"],
      ]);
      ctx.fillRect(0, 0, 640, 500);
      ctx.fillStyle = "#4a2410";
      ctx.fillRect(0, 445, 1000, 55);
      ctx.fillStyle = "rgba(255,220,160,0.35)";
      ctx.fillRect(0, 445, 1000, 4);
      A.amberBottle(ctx, 455, 120, 330, {
        label: "#f4ecd4",
        band: "#8a1a1a",
        text: "EMPIRE",
      });
      A.pilsner(ctx, 285, 448, 340, {});
      X.text(ctx, "EMPIRE", 735, 105, {
        font: "copper",
        size: 100,
        color: "#e8c060",
        stroke: "#1a0c04",
        strokeW: 6,
        spacing: 4,
        maxW: 420,
      });
      X.text(ctx, "BREW HOUSE", 735, 180, {
        font: "copper",
        size: 44,
        color: "#f4ecd4",
        spacing: 8,
        maxW: 400,
      });
      X.text(ctx, "Brewed in Brooklyn.", 735, 262, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#f4ecd4",
        maxW: 420,
      });
      X.text(ctx, "Poured everywhere.", 735, 312, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#e8c060",
        maxW: 420,
      });
      K.fine(
        ctx,
        "Empire Brew House · Bushwick, Brooklyn, N.Y. · Lager · Ale · Bock",
        735,
        472,
        "rgba(244,236,212,0.75)",
        16,
      );
    },
    art(ctx, cx, cy, s) {
      A.pilsner(ctx, cx - s * 0.35, cy + s * 1.3, s * 2.6, {});
      A.amberBottle(ctx, cx + s * 0.6, cy - s * 1.0, s * 2.3, {
        label: "#f4ecd4",
        band: "#8a1a1a",
        text: "EMPIRE",
      });
    },
    posterBg: ["gradient", "#3a1c0a", "#1a0c04"],
    posterInk: "#e8c060",
    posterFont: "copper",
  });

  // ==================================================================
  // SILVER TORCH (cigarettes)
  // ==================================================================
  def("silver_torch", {
    name: "Silver Torch",
    colors: ["#16264a", "#d8dde2", "#e8c050"],
    slogans: [
      "Light up like the lady in the harbor.",
      "King size. Filter tip. Silver all the way.",
    ],
    bill(ctx, v, r) {
      ctx.fillStyle = A.grad(ctx, 0, 0, 0, 420, [
        [0, "#0c1634"],
        [0.6, "#3a4a7a"],
        [1, "#d8906a"],
      ]);
      ctx.fillRect(0, 0, 1000, 500);
      A.stars(ctx, 0, 0, 1000, 160, 50, r);
      A.skyline(ctx, 300, 412, 700, 70, "#0a1028", X.rng(77));
      ctx.fillStyle = A.grad(ctx, 0, 410, 0, 500, [
        [0, "#1a2a4a"],
        [1, "#060a18"],
      ]);
      ctx.fillRect(0, 410, 1000, 90);
      ctx.fillStyle = "rgba(255,220,150,0.35)";
      for (let k = 0; k < 18; k++)
        ctx.fillRect(170 + r() * 80 - 40, 420 + k * 4.5, 30 + r() * 50, 2);
      // the lady's raised arm, in weathered copper
      ctx.beginPath();
      ctx.moveTo(110, 500);
      ctx.quadraticCurveTo(150, 430, 186, 392);
      ctx.lineTo(222, 392);
      ctx.quadraticCurveTo(230, 450, 260, 500);
      ctx.closePath();
      ctx.fillStyle = A.grad(ctx, 110, 0, 260, 0, [
        [0, "#4a8a78"],
        [0.5, "#8ac8b0"],
        [1, "#3a7a68"],
      ]);
      ctx.fill();
      A.fs(ctx, null, 4);
      ctx.strokeStyle = "rgba(20,50,40,0.5)";
      ctx.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(140 + k * 30, 500);
        ctx.quadraticCurveTo(170 + k * 18, 450, 196 + k * 10, 400);
        ctx.stroke();
      }
      A.torch(ctx, 204, 200, 125, {});
      A.cigPack(ctx, 840, 300, 150, 215, {});
      X.text(ctx, "SILVER", 505, 95, {
        font: "didone",
        size: 84,
        color: "#eef2f4",
        spacing: 10,
        maxW: 400,
      });
      X.text(ctx, "TORCH", 505, 180, {
        font: "didone",
        size: 84,
        color: "#e8c050",
        spacing: 10,
        maxW: 400,
      });
      X.text(ctx, this.slogans[0], 505, 258, {
        font: "serif",
        size: 30,
        italic: true,
        color: "#ffffff",
        maxW: 410,
      });
      X.text(ctx, "KING SIZE · FILTER TIP · 20 CLASS A CIGARETTES", 505, 312, {
        font: "condensed",
        size: 20,
        color: "#c8d0d8",
        spacing: 2,
        maxW: 400,
      });
      K.fine(
        ctx,
        "Silver Torch Tobacco Co. · Richmond, Virginia",
        600,
        476,
        "rgba(220,226,232,0.65)",
        15,
      );
    },
    art(ctx, cx, cy, s) {
      A.cigPack(ctx, cx + s * 0.3, cy + s * 0.25, s * 1.3, s * 1.9, {});
      A.torch(ctx, cx - s * 0.85, cy - s * 0.4, s * 0.8, {});
    },
    posterBg: ["gradient", "#0c1634", "#3a4a7a"],
    posterInk: "#eef2f4",
    posterFont: "didone",
  });

  // ==================================================================
  // BURGER BRIGADE (the first burger chain)
  // ==================================================================
  def("burger_brigade", {
    name: "Burger Brigade",
    colors: ["#c8201a", "#f4c21e", "#1e3a8a"],
    slogans: [
      "Fifteen cents. Fifteen seconds.",
      "Hot off the griddle, on the double.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "stripes", "#c8201a", "#b41a14", {
        w: 30,
        slant: 0.4,
      });
      ctx.fillStyle = "#f4c21e";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(500, 0);
      ctx.lineTo(430, 500);
      ctx.lineTo(0, 500);
      ctx.fill();
      ctx.fillStyle = "#1e3a8a";
      ctx.beginPath();
      ctx.moveTo(500, 0);
      ctx.lineTo(514, 0);
      ctx.lineTo(444, 500);
      ctx.lineTo(430, 500);
      ctx.fill();
      A.burger(ctx, 720, 285, 400);
      stopwatch(ctx, 905, 115, 62, "15 SEC.");
      X.text(ctx, "BURGER", 230, 100, {
        font: "impact",
        size: 110,
        color: "#c8201a",
        stroke: INK,
        strokeW: 8,
        maxW: 390,
        extrude: { color: "#6a0e0a", n: 6 },
      });
      X.text(ctx, "BRIGADE", 230, 200, {
        font: "impact",
        size: 92,
        color: "#1e3a8a",
        stroke: "#fff",
        strokeW: 7,
        maxW: 390,
      });
      X.text(ctx, "Fifteen cents.", 220, 285, {
        font: "impact",
        size: 46,
        italic: true,
        skew: -0.08,
        color: INK,
        maxW: 380,
      });
      X.text(ctx, "Fifteen seconds.", 215, 340, {
        font: "impact",
        size: 46,
        italic: true,
        skew: -0.08,
        color: "#c8201a",
        maxW: 370,
      });
      K.badge(ctx, ["ONLY", "15¢"], 370, 425, 54, "#1e3a8a", "#fff", -0.15);
      K.fine(
        ctx,
        "At 30 Brigade Posts in the Tri-State area",
        175,
        470,
        "rgba(0,0,0,0.65)",
        16,
      );
    },
    art(ctx, cx, cy, s) {
      A.burger(ctx, cx, cy, s * 2.6);
    },
    posterBg: ["stripes", "#c8201a", "#b41a14"],
    posterInk: "#f4c21e",
  });

  // ==================================================================
  // EXCALIBUR GARDENS (the park that was to open in the summer of '67)
  // ==================================================================
