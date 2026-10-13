// play-inline-15 02 — ctx
// Lines 352-701 of readable/play-inline-15.pretty.js (statement-aligned).
  def("fizzo_blue", {
    name: "Fizzo Blue",
    colors: ["#0b1e46", "#5ad8ff", "#f6eed8"],
    slogans: [
      "The Cool Blue Glow of Tomorrow!",
      "Twice the Fizz. Half the Fuss.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "radial", "#1a3a7a", "#040818", {
        cx: 260,
        cy: 250,
      });
      A.stars(ctx, 0, 0, 1000, 500, 200, r);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = A.rgrad(ctx, 250, 270, 10, 250, [
        [0, "rgba(90,216,255,0.8)"],
        [0.45, "rgba(40,140,255,0.3)"],
        [1, "rgba(0,40,120,0)"],
      ]);
      ctx.fillRect(0, 0, 520, 500);
      ctx.restore();
      K.bubbles(ctx, 120, 40, 260, 420, 20, r, "rgba(160,236,255,0.8)");
      A.fizzoBottle(ctx, 250, 60, 400, { blue: true });
      K.scriptLogo(ctx, "Fizzo", 680, 115, 130, "#f6eed8", "#0a1a4a", {
        maxW: 440,
      });
      X.text(ctx, "BLUE", 680, 220, {
        font: "deco",
        size: 110,
        color: "#5ad8ff",
        glow: "#5ad8ff",
        glowBlur: 16,
        stroke: "#08204a",
        strokeW: 6,
        spacing: 14,
        maxW: 460,
      });
      X.text(ctx, this.slogans[0], 680, 318, {
        font: "impact",
        size: 40,
        color: "#fff",
        italic: true,
        skew: -0.1,
        maxW: 500,
      });
      K.fine(
        ctx,
        "SPARKLING WITH SPACE-AGE MINERALS*",
        680,
        380,
        "rgba(180,230,255,0.9)",
        22,
      );
      K.fine(
        ctx,
        "*Ask your druggist about our minerals.",
        680,
        468,
        "rgba(180,230,255,0.6)",
        15,
      );
    },
    art(ctx, cx, cy, s) {
      A.fizzoBottle(ctx, cx, cy - s * 1.15, s * 2.3, { blue: true });
    },
    posterBg: ["radial", "#1a3a7a", "#040818"],
    posterInk: "#5ad8ff",
  });
  // ==================================================================
  // 3 · PROJECT LONG WINTER — Office of Civil Defense (recruitment / notices)
  // ==================================================================
  def("long_winter", {
    name: "Project Long Winter",
    colors: ["#1c2e52", "#eef4f6", "#e8742a"],
    slogans: [
      "Sleep Safe. Wake to Tomorrow.",
      "Volunteer Today — Rest Easy for the Nation.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#9cc4dc", "#eef4f6");
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      for (let k = 0; k < 40; k++) {
        const x = r() * 1000,
          y = r() * 380;
        A.snowflake(ctx, x, y, 4 + r() * 8, "rgba(255,255,255,0.85)", 1.5);
      }
      A.skyline(ctx, 0, 440, 1000, 150, "#7a92a8", X.rng(31));
      ctx.fillStyle = "#f4f8fa";
      ctx.fillRect(0, 432, 1000, 68);
      A.longWinter(ctx, 155, 205, 125, {});
      A.cryoPod(ctx, 860, 245, 110, { label: "C-9" });
      X.text(ctx, "PROJECT LONG WINTER", 520, 85, {
        font: "deco",
        size: 54,
        color: "#1c2e52",
        spacing: 4,
        maxW: 520,
      });
      X.text(ctx, "Sleep Safe.", 520, 170, {
        font: "serif",
        size: 72,
        italic: true,
        color: "#1c2e52",
        maxW: 500,
      });
      X.text(ctx, "Wake to Tomorrow.", 520, 245, {
        font: "serif",
        size: 60,
        italic: true,
        color: "#e8742a",
        stroke: "#1c2e52",
        strokeW: 3,
        maxW: 500,
      });
      X.text(ctx, "CIVIL-SERVICE VOLUNTEERS WANTED", 520, 320, {
        font: "condensed",
        size: 30,
        color: "#1c2e52",
        spacing: 3,
        maxW: 500,
      });
      A.ocd(ctx, 940, 455, 34, {});
      K.fine(
        ctx,
        "Apply at your local Office of Civil Defense · A program of the United States Government",
        470,
        467,
        "rgba(28,46,82,0.8)",
        16,
      );
    },
    art(ctx, cx, cy, s) {
      A.longWinter(ctx, cx, cy - s * 0.1, s * 1.25, {});
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "gradient", "#1c2e52", "#3a5a82");
      for (let k = 0; k < 24; k++)
        A.snowflake(
          ctx,
          r() * 400,
          r() * 600,
          3 + r() * 6,
          "rgba(255,255,255,0.5)",
          1.2,
        );
      A.longWinter(ctx, 200, 210, 130, {});
      X.text(ctx, v % 2 ? "REST EASY" : "SLEEP SAFE.", 200, 400, {
        font: "serif",
        size: 52,
        italic: true,
        color: "#eef4f6",
        maxW: 360,
      });
      X.text(ctx, v % 2 ? "FOR THE NATION" : "WAKE TO TOMORROW.", 200, 455, {
        font: "deco",
        size: 30,
        color: "#e8742a",
        spacing: 2,
        maxW: 360,
      });
      X.text(ctx, "Volunteer at your Office of Civil Defense", 200, 535, {
        font: "typewriter",
        size: 18,
        color: "#eef4f6",
        maxW: 360,
      });
      A.ocd(ctx, 350, 560, 22, {});
    },
  });
  // ==================================================================
  // 4 · PRAIRIE ROOT BEER
  // ==================================================================
  def("prairie_root_beer", {
    name: "Prairie Root Beer",
    colors: ["#7a2a12", "#f2e2b4", "#d88a2a"],
    slogans: ["Old-time flavor, poured cold.", "Brewed Slow Since 1911."],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#e88a3a", "#f8e0a0");
      ctx.fillStyle = A.rgrad(ctx, 700, 330, 10, 220, [
        [0, "#fff6c8"],
        [0.5, "rgba(255,214,120,0.8)"],
        [1, "rgba(255,170,80,0)"],
      ]);
      ctx.beginPath();
      ctx.arc(700, 330, 220, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#8a5a2a";
      ctx.beginPath();
      ctx.moveTo(0, 360);
      ctx.quadraticCurveTo(260, 300, 520, 350);
      ctx.quadraticCurveTo(780, 400, 1000, 330);
      ctx.lineTo(1000, 500);
      ctx.lineTo(0, 500);
      ctx.fill();
      ctx.fillStyle = "#6a3a16";
      ctx.beginPath();
      ctx.moveTo(0, 420);
      ctx.quadraticCurveTo(400, 380, 1000, 430);
      ctx.lineTo(1000, 500);
      ctx.lineTo(0, 500);
      ctx.fill();
      // windmill on the horizon
      A.lin(ctx, 880, 340, 865, 250, 4, "#3a1e0e");
      A.lin(ctx, 880, 340, 895, 250, 4, "#3a1e0e");
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        A.lin(
          ctx,
          880,
          245,
          880 + Math.cos(a) * 34,
          245 + Math.sin(a) * 34,
          4,
          "#3a1e0e",
        );
      }
      ctx.strokeStyle = "#d8a83a";
      ctx.lineWidth = 3;
      for (let k = 0; k < 40; k++) {
        const x = r() * 1000;
        ctx.beginPath();
        ctx.moveTo(x, 500);
        ctx.quadraticCurveTo(x + 6, 470, x + (r() - 0.5) * 20, 430 + r() * 20);
        ctx.stroke();
      }
      A.amberBottle(ctx, 150, 90, 340, {});
      X.text(ctx, "PRAIRIE", 520, 110, {
        font: "slab",
        size: 112,
        color: "#f2e2b4",
        stroke: "#5a1e08",
        strokeW: 9,
        spacing: 6,
        maxW: 520,
        extrude: { color: "#5a1e08", n: 6 },
      });
      X.text(ctx, "ROOT BEER", 520, 205, {
        font: "slab",
        size: 60,
        color: "#7a2a12",
        spacing: 10,
        maxW: 460,
      });
      X.text(ctx, this.slogans[0], 520, 280, {
        font: "serif",
        size: 40,
        italic: true,
        color: INK,
        maxW: 500,
      });
      K.fine(
        ctx,
        "Brewed with sassafras, wintergreen & honest prairie sunshine",
        560,
        470,
        "rgba(255,236,200,0.8)",
        16,
      );
    },
    art(ctx, cx, cy, s) {
      A.amberBottle(ctx, cx, cy - s * 1.1, s * 2.2, {});
    },
    posterBg: ["gradient", "#e88a3a", "#f8e0a0"],
    posterInk: "#7a2a12",
    posterFont: "slab",
  });
  // ==================================================================
  // SKY PATROL arcade cabinet
  // ==================================================================
  def("sky_patrol", {
    name: "Sky Patrol",
    colors: ["#0a0a1a", "#f4d040", "#3ad0ff"],
    slogans: ["Defend the Skyline! 10¢ a Play", "Can YOU Beat the High Score?"],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "solid", "#0a0a1a");
      A.stars(ctx, 0, 0, 1000, 330, 120, r, "rgba(200,230,255,0.8)");
      ctx.lineWidth = 3;
      for (let k = 0; k < 6; k++) {
        const sx = 450 + r() * 550,
          ey = 140 + r() * 160,
          ex = 470 + r() * 500;
        ctx.strokeStyle = k % 2 ? "#ff4ad0" : "#ffb030";
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.fillRect(ex - 3, ey - 3, 6, 6);
      }
      A.rocket(ctx, 760, 260, 200, -0.5, {
        body: "#3ad0ff",
        accent: "#f4d040",
        flameLen: 0.1,
      });
      ctx.fillStyle = "#3ad0ff";
      for (let k = 0; k < 6; k++) {
        const x = 460 + k * 90;
        ctx.fillRect(x, 430, 60, 40);
        ctx.fillRect(x + 10, 410, 14, 20);
        ctx.fillRect(x + 32, 400, 14, 30);
      }
      ctx.fillStyle = "#f4d040";
      ctx.fillRect(420, 470, 580, 30);
      X.text(ctx, "SKY", 220, 110, {
        font: "mono",
        size: 120,
        color: "#3ad0ff",
        glow: "#3ad0ff",
        glowBlur: 20,
        maxW: 420,
      });
      X.text(ctx, "PATROL", 220, 215, {
        font: "mono",
        size: 100,
        color: "#f4d040",
        glow: "#f4d040",
        glowBlur: 20,
        maxW: 420,
      });
      X.text(ctx, this.slogans[0], 220, 310, {
        font: "mono",
        size: 30,
        color: "#ff4ad0",
        maxW: 420,
      });
      X.text(ctx, "INSERT COIN", 220, 420, {
        font: "mono",
        size: 44,
        color: "#fff",
        maxW: 420,
      });
      for (let y = 0; y < 500; y += 4) {
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(0, y, 1000, 2);
      }
    },
    art(ctx, cx, cy, s) {
      A.rocket(ctx, cx, cy, s * 2.2, -0.8, {
        body: "#3ad0ff",
        accent: "#f4d040",
      });
    },
    posterBg: ["solid", "#0a0a1a", "#0a0a1a"],
    posterInk: "#3ad0ff",
    posterFont: "mono",
  });
  // ==================================================================
  // VIGIL DEFENSE: the goggle maker (Project Long Winter field issue)
  // ==================================================================
