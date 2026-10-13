// play-inline-16 07 — ctx
// Lines 1985-2321 of readable/play-inline-16.pretty.js (statement-aligned).
  def("lonly_tv", {
    name: "LONLY Television",
    colors: ["#14262e", "#f0c040", "#efe6d0"],
    slogans: [
      "The best company in the house.",
      "Twenty-three inches of picture, and every one of them sharp.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "radial", "#2a5a6a", "#0a1418", {
        cx: 720,
        cy: 260,
      });
      X.sunburst(
        ctx,
        720,
        260,
        520,
        24,
        "rgba(0,0,0,0)",
        "rgba(240,192,64,0.08)",
      );
      const scr = A.tv(ctx, 720, 285, 190, { cabinet: "#c8a46a" });
      K.testCard(ctx, scr);
      lonlyMark(ctx, 285, 125, 340, "#f0c040", "#14262e");
      X.text(ctx, "T E L E V I S I O N", 285, 240, {
        font: "condensed",
        size: 40,
        color: "#efe6d0",
        maxW: 460,
      });
      X.text(ctx, "The best company", 285, 305, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#efe6d0",
        maxW: 460,
      });
      X.text(ctx, "in the house.", 285, 352, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#f0c040",
        maxW: 460,
      });
      K.fine(
        ctx,
        "23-INCH PICTURE · WALNUT OR BLOND OAK · LONLY ELECTRIC CORP., NEWARK, N.J.",
        500,
        470,
        "rgba(240,192,64,0.85)",
        17,
      );
    },
    art(ctx, cx, cy, s) {
      const scr = A.tv(ctx, cx, cy, s * 1.2, { cabinet: "#c8a46a" });
      K.testCard(ctx, scr);
    },
    posterBg: ["radial", "#2a5a6a", "#0a1418"],
    posterInk: "#f0c040",
    posterFont: "deco",
  });

  // ==================================================================
  // EAGLE MOTORS (cars)
  // ==================================================================
  def("eagle_motors", {
    name: "Eagle Motors",
    colors: ["#1e2e4a", "#c8402a", "#e8eef0"],
    slogans: [
      "Freedom to Explore",
      "The 1967 Eagle Royale. Built for the long way home.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#5aa8e0", "#fbf0dc");
      ctx.fillStyle = "#8a7ab0";
      ctx.beginPath();
      ctx.moveTo(0, 330);
      ctx.lineTo(140, 230);
      ctx.lineTo(260, 300);
      ctx.lineTo(420, 190);
      ctx.lineTo(560, 290);
      ctx.lineTo(720, 170);
      ctx.lineTo(880, 280);
      ctx.lineTo(1000, 220);
      ctx.lineTo(1000, 360);
      ctx.lineTo(0, 360);
      ctx.fill();
      ctx.fillStyle = "#f4f4f8";
      for (const [x, y] of [
        [420, 190],
        [720, 170],
      ]) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 40, y + 28);
        ctx.lineTo(x - 12, y + 20);
        ctx.lineTo(x, y + 30);
        ctx.lineTo(x + 16, y + 20);
        ctx.lineTo(x + 42, y + 30);
        ctx.fill();
      }
      ctx.fillStyle = "#6a9a4a";
      ctx.fillRect(0, 350, 1000, 150);
      ctx.fillStyle = "#4a4a4c";
      ctx.beginPath();
      ctx.moveTo(220, 500);
      ctx.lineTo(690, 352);
      ctx.lineTo(712, 352);
      ctx.lineTo(1000, 500);
      ctx.fill();
      ctx.strokeStyle = "#f2c43a";
      ctx.lineWidth = 5;
      ctx.setLineDash([24, 20]);
      ctx.beginPath();
      ctx.moveTo(610, 500);
      ctx.lineTo(701, 354);
      ctx.stroke();
      ctx.setLineDash([]);
      A.car(ctx, 600, 470, 520, { body: "#c8402a", top: "#f4ecd8" });
      A.eagle(ctx, 860, 100, 82, {});
      X.text(ctx, "EAGLE MOTORS", 285, 78, {
        font: "copper",
        size: 64,
        color: "#1e2e4a",
        stroke: "#fff",
        strokeW: 5,
        spacing: 3,
        maxW: 480,
      });
      K.scriptLogo(ctx, "Freedom to Explore", 285, 160, 64, "#c8402a", "#fff", {
        maxW: 470,
      });
      X.text(ctx, "THE 1967 EAGLE ROYALE · V8", 285, 228, {
        font: "deco",
        size: 28,
        color: "#1e2e4a",
        spacing: 4,
        maxW: 460,
      });
    },
    art(ctx, cx, cy, s) {
      A.car(ctx, cx, cy + s * 0.6, s * 2.8, { body: "#c8402a" });
      A.eagle(ctx, cx, cy - s * 0.9, s * 0.45, {});
    },
    posterBg: ["gradient", "#5aa8e0", "#fbf0dc"],
    posterInk: "#1e2e4a",
    posterFont: "copper",
  });

  // ==================================================================
  // SUPER SERGEANT (Bowery Comics)
  // ==================================================================
  def("super_sergeant", {
    name: "Super Sergeant",
    colors: ["#f2c43a", "#5e6e3a", "#c8201a"],
    slogans: [
      "America’s finest fighting man!",
      "Issue #31: Operation Thunderhead!",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "sunburst", "#f2c43a", "#f8d45a", {
        cx: 720,
        cy: 300,
        rays: 26,
      });
      ctx.fillStyle = "#c8b890";
      ctx.beginPath();
      ctx.moveTo(440, 500);
      ctx.lineTo(520, 430);
      ctx.lineTo(640, 450);
      ctx.lineTo(760, 410);
      ctx.lineTo(880, 440);
      ctx.lineTo(1000, 420);
      ctx.lineTo(1000, 500);
      ctx.fill();
      A.sergeant(ctx, 720, 475, 82, {});
      K.panel(ctx, 0, 0, 420, 500, "#1e3a6a", 0);
      ctx.fillStyle = "#c8201a";
      ctx.fillRect(420, 0, 10, 500);
      X.text(ctx, "SUPER", 210, 92, {
        font: "impact",
        size: 96,
        color: "#f2c43a",
        stroke: INK,
        strokeW: 9,
        maxW: 390,
        extrude: { color: INK, n: 7 },
      });
      X.text(ctx, "SERGEANT", 210, 190, {
        font: "impact",
        size: 84,
        color: "#fff",
        stroke: INK,
        strokeW: 9,
        maxW: 390,
        extrude: { color: INK, n: 7 },
      });
      X.text(ctx, "America’s finest", 210, 272, {
        font: "marker",
        size: 40,
        color: "#fff",
        maxW: 380,
      });
      X.text(ctx, "fighting man!", 210, 322, {
        font: "marker",
        size: 46,
        color: "#f2c43a",
        stroke: INK,
        strokeW: 4,
        maxW: 380,
      });
      K.panel(ctx, 20, 395, 150, 85, "#fff", 4);
      X.text(ctx, "BOWERY", 95, 425, {
        font: "impact",
        size: 28,
        color: "#1e3a6a",
      });
      X.text(ctx, "COMICS", 95, 455, { font: "impact", size: 22, color: INK });
      K.badge(ctx, ["ONLY", "12¢"], 330, 440, 55, "#c8201a", "#fff", 0.15);
    },
    art(ctx, cx, cy, s) {
      A.sergeant(ctx, cx - s * 0.2, cy + s * 1.6, s * 0.72, {});
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "sunburst", "#f2c43a", "#f8d45a", {
        cx: 200,
        cy: 380,
      });
      A.sergeant(ctx, 185, 575, 82, {});
      ctx.fillStyle = "#1e3a6a";
      ctx.fillRect(0, 0, 400, 130);
      ctx.fillStyle = "#c8201a";
      ctx.fillRect(0, 130, 400, 8);
      X.text(ctx, "SUPER SERGEANT", 200, 52, {
        font: "impact",
        size: 52,
        color: "#f2c43a",
        stroke: INK,
        strokeW: 6,
        maxW: 370,
      });
      X.text(
        ctx,
        v % 2 ? "ISSUE #31 · ON SALE NOW" : "AMERICA’S FINEST FIGHTING MAN!",
        200,
        100,
        { font: "marker", size: 24, color: "#fff", maxW: 370 },
      );
      K.badge(ctx, ["BOWERY", "12¢"], 330, 200, 44, "#c8201a", "#fff", 0.15);
    },
  });

  // ==================================================================
  // AMERICAN AUTOMATON CO. (the Valet, the Patrolman, Valet-M)
  // ==================================================================
  def("american_automaton", {
    name: "American Automaton Co.",
    colors: ["#1e3a6a", "#e4dcc6", "#c8201a"],
    slogans: [
      "Built in America, to serve America.",
      "The Valet does the chores. You do the living.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#eef2f0", "#c4d0d8");
      ctx.fillStyle = "#1e3a6a";
      ctx.beginPath();
      ctx.moveTo(560, 0);
      ctx.lineTo(1000, 0);
      ctx.lineTo(1000, 500);
      ctx.lineTo(480, 500);
      ctx.fill();
      ctx.fillStyle = "#c8201a";
      ctx.beginPath();
      ctx.moveTo(540, 0);
      ctx.lineTo(560, 0);
      ctx.lineTo(480, 500);
      ctx.lineTo(460, 500);
      ctx.fill();
      A.stars(ctx, 600, 0, 400, 160, 30, r, "rgba(255,255,255,0.5)");
      A.patrolman(ctx, 690, 230, 90, {});
      A.valet(ctx, 885, 250, 78, { hold: "grip" });
      A.automatonMark(ctx, 100, 102, 46, "#1e3a6a", INK);
      X.text(ctx, "AMERICAN", 335, 82, {
        font: "deco",
        size: 72,
        color: "#1e3a6a",
        spacing: 4,
        maxW: 270,
      });
      X.text(ctx, "AUTOMATON CO.", 335, 152, {
        font: "condensed",
        size: 46,
        color: "#c8201a",
        spacing: 6,
        maxW: 280,
      });
      X.text(ctx, "Built in America,", 245, 250, {
        font: "serif",
        size: 38,
        italic: true,
        color: INK,
        maxW: 410,
      });
      X.text(ctx, "to serve America.", 245, 298, {
        font: "serif",
        size: 38,
        italic: true,
        color: "#c8201a",
        maxW: 410,
      });
      X.text(ctx, "THE VALET · THE PATROLMAN · VALET-M", 245, 360, {
        font: "condensed",
        size: 26,
        color: "#1e3a6a",
        spacing: 2,
        maxW: 410,
      });
      K.fine(
        ctx,
        "American Automaton Co. · Schenectady, New York · Service in every state",
        245,
        470,
        "rgba(0,0,0,0.55)",
        14,
      );
    },
    art(ctx, cx, cy, s) {
      A.valet(ctx, cx - s * 0.2, cy - s * 0.1, s * 0.62, {});
    },
    posterBg: ["gradient", "#eef2f0", "#c4d0d8"],
    posterInk: "#1e3a6a",
    posterFont: "deco",
  });

  // ==================================================================
  // FOREVER FRANKS (hot dog chain)
  // ==================================================================
