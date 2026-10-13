// play-inline-18 02 — ctx
// Lines 315-661 of readable/play-inline-18.pretty.js (statement-aligned).
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
