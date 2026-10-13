// play-inline-18 04 — ctx
// Lines 1002-1326 of readable/play-inline-18.pretty.js (statement-aligned).
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
