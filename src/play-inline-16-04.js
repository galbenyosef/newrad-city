// play-inline-16 04 — ctx
// Lines 1005-1313 of readable/play-inline-16.pretty.js (statement-aligned).
  function planks(ctx, r) {
    for (let x = 0, k = 0; x < 1000; x += 100, k++) {
      ctx.fillStyle = ["#c8a46a", "#bf9a60", "#d0ac74", "#c4a066"][k % 4];
      ctx.fillRect(x, 0, 100, 500);
      ctx.strokeStyle = "rgba(90,60,30,0.25)";
      ctx.lineWidth = 1.5;
      for (let g = 0; g < 6; g++) {
        const gx = x + 10 + g * 15 + r() * 6;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.bezierCurveTo(gx + 6, 160, gx - 6, 330, gx + 3, 500);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(40,24,10,0.55)";
      ctx.fillRect(x, 0, 3, 500);
      ctx.fillStyle = "#5a4a3a";
      for (const y of [30, 250, 470]) {
        ctx.beginPath();
        ctx.arc(x + 50, y, 3.5, 0, TAU);
        ctx.fill();
      }
    }
  }
  function hazard(ctx, y, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y, 1000, h);
    ctx.clip();
    ctx.fillStyle = "#f2c43a";
    ctx.fillRect(0, y, 1000, h);
    ctx.fillStyle = "#1d1712";
    for (let x = -h; x < 1000 + h; x += h * 1.4) {
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + h * 0.7, y);
      ctx.lineTo(x + h * 1.4, y);
      ctx.lineTo(x + h * 0.7, y + h);
      ctx.fill();
    }
    ctx.restore();
  }
  def("excalibur_gardens", {
    name: "Excalibur Gardens",
    colors: ["#1e3a6a", "#f2c43a", "#8a1a1a"],
    slogans: [
      "COMING SOON · Summer 1967. Your kingdom awaits.",
      "Knights, castles and a dragon’s lair.",
    ],
    bill(ctx, v, r) {
      planks(ctx, r);
      hazard(ctx, 448, 52);
      // pasted artist's rendering
      ctx.save();
      ctx.translate(745, 200);
      ctx.rotate(0.025);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(-212, -152, 430, 310);
      ctx.fillStyle = A.grad(ctx, 0, -155, 0, 150, [
        [0, "#7ab8e8"],
        [1, "#fdf0d8"],
      ]);
      ctx.fillRect(-215, -155, 430, 305);
      ctx.fillStyle = "#6aa84a";
      ctx.beginPath();
      ctx.moveTo(-215, 150);
      ctx.lineTo(-215, 100);
      ctx.quadraticCurveTo(0, 50, 215, 95);
      ctx.lineTo(215, 150);
      ctx.fill();
      A.castle(ctx, 0, 110, 300, {});
      ctx.fillStyle = "#f4ecd8";
      ctx.fillRect(-215, 118, 430, 32);
      X.text(ctx, "ARTIST’S RENDERING", 0, 134, {
        font: "condensed",
        size: 20,
        color: INK,
        spacing: 4,
        maxW: 380,
        noSafe: true,
      });
      ctx.strokeStyle = "#f4ecd8";
      ctx.lineWidth = 6;
      ctx.strokeRect(-215, -155, 430, 305);
      ctx.fillStyle = "rgba(220,205,150,0.8)";
      for (const [tx, ty, a] of [
        [-200, -150, -0.6],
        [200, -150, 0.6],
      ]) {
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(a);
        ctx.fillRect(-30, -9, 60, 18);
        ctx.restore();
      }
      ctx.restore();
      X.text(ctx, "COMING SOON", 280, 80, {
        font: "stencil",
        size: 72,
        color: "#1d1712",
        spacing: 4,
        maxW: 440,
      });
      X.text(ctx, "EXCALIBUR", 280, 162, {
        font: "copper",
        size: 66,
        color: "#8a1a1a",
        stroke: "#f4ecd8",
        strokeW: 5,
        maxW: 440,
      });
      X.text(ctx, "GARDENS", 280, 228, {
        font: "copper",
        size: 54,
        color: "#1e3a6a",
        stroke: "#f4ecd8",
        strokeW: 4,
        spacing: 6,
        maxW: 420,
      });
      X.text(ctx, "Summer 1967", 280, 302, {
        font: "script",
        weight: "normal",
        size: 66,
        color: "#1e3a6a",
        maxW: 420,
      });
      X.text(ctx, "Your kingdom awaits.", 280, 368, {
        font: "serif",
        size: 36,
        italic: true,
        color: "#1d1712",
        maxW: 420,
      });
      X.text(
        ctx,
        "SITE OF THE FUTURE EXCALIBUR GARDENS · POST NO BILLS",
        280,
        420,
        {
          font: "stencil",
          size: 18,
          color: "rgba(29,23,18,0.8)",
          spacing: 1,
          maxW: 440,
        },
      );
    },
    art(ctx, cx, cy, s) {
      A.castle(ctx, cx, cy + s * 1.1, s * 2.8, {});
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "gradient", "#7ab8e8", "#fdf0d8");
      ctx.fillStyle = "#6aa84a";
      ctx.beginPath();
      ctx.moveTo(0, 600);
      ctx.lineTo(0, 400);
      ctx.quadraticCurveTo(200, 340, 400, 400);
      ctx.lineTo(400, 600);
      ctx.fill();
      A.castle(ctx, 200, 420, 330, {});
      A.swordStone(ctx, 330, 540, 40);
      X.text(ctx, "EXCALIBUR", 200, 52, {
        font: "copper",
        size: 50,
        color: "#8a1a1a",
        stroke: "#fff",
        strokeW: 4,
        maxW: 360,
      });
      X.text(ctx, "GARDENS", 200, 100, {
        font: "copper",
        size: 38,
        color: "#1e3a6a",
        spacing: 4,
        maxW: 340,
      });
      ctx.save();
      ctx.translate(200, 480);
      ctx.rotate(-0.08);
      K.ribbonText(
        ctx,
        "COMING SOON · SUMMER 1967",
        0,
        0,
        340,
        46,
        "#c8201a",
        "#7a0e0a",
        "#fff",
      );
      ctx.restore();
      X.text(ctx, "Your kingdom awaits.", 150, 560, {
        font: "serif",
        size: 26,
        italic: true,
        color: "#1d1712",
        maxW: 240,
      });
    },
  });

  // ==================================================================
  // JUNIOR ROCKETEER CO. (toys)
  // ==================================================================
  def("junior_rocketeer", {
    name: "Junior Rocketeer Co.",
    colors: ["#1e3a8a", "#c8201a", "#f4d040"],
    slogans: [
      "Real science. Real rockets.",
      "Model rocket kits for ages 8 to 80.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "sunburst", "#5ab0e8", "#6abcf0", {
        cx: 770,
        cy: 470,
        rays: 30,
      });
      cloud(ctx, 560, 70, 22, "rgba(255,255,255,0.8)");
      ctx.fillStyle = "#5a9a3a";
      ctx.beginPath();
      ctx.moveTo(0, 420);
      ctx.quadraticCurveTo(500, 395, 1000, 420);
      ctx.lineTo(1000, 500);
      ctx.lineTo(0, 500);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (let k = 0; k < 9; k++) {
        ctx.beginPath();
        ctx.arc(
          700 + (k - 4) * 26 + r() * 10,
          405 - Math.abs(k - 4) * 6 - r() * 10,
          24 + r() * 12,
          0,
          TAU,
        );
        ctx.fill();
      }
      A.lin(ctx, 770, 395, 735, 425, 5, "#4a4a48");
      A.lin(ctx, 770, 395, 805, 425, 5, "#4a4a48");
      A.lin(ctx, 770, 395, 770, 330, 3, "#8a8a88");
      A.rocket(ctx, 770, 200, 230, -Math.PI / 2, {
        body: "#f4f0e6",
        accent: "#c8201a",
        flameLen: 0.15,
      });
      A.kid(ctx, 575, 300, 58, { shirt: "#c8201a" });
      X.text(ctx, "JUNIOR", 245, 88, {
        font: "deco",
        size: 76,
        color: "#c8201a",
        stroke: "#fff",
        strokeW: 6,
        spacing: 6,
        maxW: 400,
      });
      X.text(ctx, "ROCKETEER", 245, 162, {
        font: "deco",
        size: 70,
        color: "#1e3a8a",
        stroke: "#fff",
        strokeW: 6,
        maxW: 400,
      });
      X.text(ctx, "Real science.", 245, 245, {
        font: "impact",
        size: 50,
        color: "#fff",
        stroke: INK,
        strokeW: 6,
        maxW: 400,
      });
      X.text(ctx, "Real rockets.", 245, 303, {
        font: "impact",
        size: 50,
        color: "#f4d040",
        stroke: INK,
        strokeW: 6,
        maxW: 400,
      });
      X.text(ctx, "MODEL ROCKET KITS · AGES 8 TO 80", 245, 360, {
        font: "condensed",
        size: 24,
        color: "#1e3a8a",
        spacing: 2,
        maxW: 400,
      });
      K.fine(
        ctx,
        "Junior Rocketeer Co. · Hempstead, Long Island · Launch with a grown-up, in an open field",
        500,
        474,
        "rgba(255,255,255,0.85)",
        15,
      );
    },
    art(ctx, cx, cy, s) {
      A.rocket(ctx, cx, cy, s * 2.4, -Math.PI / 2, {
        body: "#f4f0e6",
        accent: "#c8201a",
      });
    },
    posterBg: ["sunburst", "#5ab0e8", "#6abcf0"],
    posterInk: "#c8201a",
    posterFont: "deco",
  });

  // ==================================================================
  // DR. THATCHER'S MIRACLE MANE (hair tonic)
  // ==================================================================
