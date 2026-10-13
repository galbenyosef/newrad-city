// play-inline-18 06 — ctx
// Lines 1635-1929 of readable/play-inline-18.pretty.js (statement-aligned).
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
