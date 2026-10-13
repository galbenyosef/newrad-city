// play-inline-16 06 — ctx
// Lines 1652-1984 of readable/play-inline-16.pretty.js (statement-aligned).
  def("freedom_flakes", {
    name: "Freedom Flakes",
    colors: ["#1e3a8a", "#c8201a", "#f4c21e"],
    slogans: [
      "The breakfast of a free nation.",
      "Sugar-toasted golden corn, crisp to the last spoonful.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "sunburst", "#fbf2dc", "#f2e2b8", {
        cx: 470,
        cy: 560,
        rays: 34,
      });
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(0, 0, 1000, 26);
      ctx.fillStyle = "#c8201a";
      ctx.fillRect(0, 26, 1000, 8);
      for (let k = 0; k < 14; k++) {
        const x = r() * 1000,
          y = 60 + r() * 380;
        A.ell(ctx, x, y, 13, 9, r() * 3);
        A.fs(ctx, "#e8a83a", 2);
      }
      A.kid(ctx, 165, 200, 82, { shirt: "#1e3a8a", hair: "#e8b848" });
      A.bowl(ctx, 165, 440, 200, "cereal", { color: "#c8201a" });
      A.box3d(ctx, 745, 105, 170, 275, 50, flakesFront, "#14286a", "#f4e8c8");
      X.text(ctx, "FREEDOM", 480, 112, {
        font: "rounded",
        size: 104,
        color: "#1e3a8a",
        stroke: "#fff",
        strokeW: 9,
        maxW: 420,
        extrude: { color: "#0a1a4a", n: 6 },
      });
      X.text(ctx, "FLAKES", 480, 215, {
        font: "rounded",
        size: 110,
        color: "#c8201a",
        stroke: "#fff",
        strokeW: 9,
        maxW: 420,
        extrude: { color: "#6a0e0a", n: 6 },
      });
      K.ribbonText(
        ctx,
        this.slogans[0],
        480,
        322,
        440,
        56,
        "#1e3a8a",
        "#0a1a4a",
        "#fff",
      );
      K.fine(
        ctx,
        "Brooklyn Sugar Works · Part of a hearty breakfast with milk, toast and juice",
        560,
        474,
        "rgba(30,58,138,0.85)",
        15,
      );
    },
    art(ctx, cx, cy, s) {
      A.box3d(
        ctx,
        cx - s * 0.8,
        cy - s * 1.2,
        s * 1.4,
        s * 2.2,
        s * 0.4,
        flakesFront,
        "#14286a",
        "#f4e8c8",
      );
    },
    posterBg: ["sunburst", "#fbf2dc", "#f2e2b8"],
    posterInk: "#1e3a8a",
    posterFont: "rounded",
  });

  // ==================================================================
  // CHOCOLATE ZEPPELIN snack cakes (National Biscuit Co.)
  // ==================================================================
  def("chocolate_zeppelin", {
    name: "Chocolate Zeppelin",
    colors: ["#5a2c12", "#d8dde2", "#fbf2dc"],
    slogans: [
      "Lighter than air. Sweeter than pie.",
      "Chocolate cake with a vanilla-cream heart.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#8ac8ee", "#fdeed8");
      cloud(ctx, 520, 90, 30);
      cloud(ctx, 930, 230, 26, "rgba(255,255,255,0.8)");
      cloud(ctx, 610, 360, 24, "rgba(255,255,255,0.75)");
      A.skyline(ctx, 0, 500, 1000, 150, "rgba(90,110,150,0.55)", X.rng(23));
      A.zeppelin(ctx, 690, 205, 400, {});
      A.zeppelin(ctx, 885, 345, 160, { shadow: false });
      A.zeppelin(ctx, 520, 395, 120, { shadow: false });
      K.scriptLogo(ctx, "Chocolate", 240, 100, 96, "#5a2c12", "#fbf2dc", {
        maxW: 400,
      });
      X.text(ctx, "ZEPPELIN", 240, 188, {
        font: "deco",
        size: 78,
        color: "#5a2c12",
        stroke: "#fbf2dc",
        strokeW: 6,
        spacing: 6,
        maxW: 400,
      });
      X.text(ctx, "Lighter than air.", 240, 268, {
        font: "serif",
        size: 38,
        italic: true,
        color: "#1e3a6a",
        maxW: 400,
      });
      X.text(ctx, "Sweeter than pie.", 240, 316, {
        font: "serif",
        size: 38,
        italic: true,
        color: "#a8401a",
        maxW: 400,
      });
      K.fine(
        ctx,
        "Chocolate cake · vanilla-cream filling · baked by National Biscuit Co., Chelsea",
        500,
        476,
        "rgba(255,255,255,0.92)",
        16,
      );
    },
    art(ctx, cx, cy, s) {
      A.zeppelin(ctx, cx, cy, s * 3.1, { cut: false });
    },
    posterBg: ["gradient", "#8ac8ee", "#fdeed8"],
    posterInk: "#5a2c12",
    posterFont: "deco",
  });

  // ==================================================================
  // GOLDEN PLAIN beef jerky
  // ==================================================================
  def("golden_plain", {
    name: "Golden Plain Jerky",
    colors: ["#7a2a12", "#f4d27a", "#c8401a"],
    slogans: [
      "Tough enough for any trail.",
      "Hickory-smoked and cut thick in Omaha.",
    ],
    bill(ctx, v, r) {
      ctx.fillStyle = A.grad(ctx, 0, 0, 0, 420, [
        [0, "#5a1a2a"],
        [0.45, "#c8401a"],
        [1, "#f4a83a"],
      ]);
      ctx.fillRect(0, 0, 1000, 500);
      A.ell(ctx, 330, 365, 120, 120);
      ctx.fillStyle = A.rgrad(ctx, 330, 365, 20, 130, [
        [0, "#fff2b0"],
        [0.6, "#ffc84a"],
        [1, "rgba(255,170,60,0.4)"],
      ]);
      ctx.fill();
      ctx.fillStyle = "#2a0e08";
      ctx.beginPath();
      ctx.moveTo(0, 420);
      ctx.quadraticCurveTo(250, 380, 520, 405);
      ctx.quadraticCurveTo(780, 430, 1000, 395);
      ctx.lineTo(1000, 500);
      ctx.lineTo(0, 500);
      ctx.fill();
      rider(ctx, 430, 404, 30, "#2a0e08");
      A.jerkyBag(ctx, 820, 255, 200, 290, plainLabel, {});
      A.jerkyStrip(ctx, 700, 420, 120, -0.2, 1);
      A.jerkyStrip(ctx, 930, 425, 110, 0.25, 2);
      X.text(ctx, "GOLDEN PLAIN", 300, 92, {
        font: "slab",
        size: 78,
        color: "#f4d27a",
        stroke: "#3a0e06",
        strokeW: 7,
        maxW: 500,
        extrude: { color: "#3a0e06", n: 5 },
      });
      X.text(ctx, "B E E F   J E R K Y", 300, 165, {
        font: "slab",
        size: 40,
        color: "#fbf0d8",
        maxW: 460,
      });
      X.text(ctx, this.slogans[0], 300, 235, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#fbf0d8",
        maxW: 480,
      });
      K.fine(
        ctx,
        "Hickory-smoked · Cut thick in Omaha, Nebraska · Keeps on the trail, in the glovebox, in the pantry",
        500,
        474,
        "rgba(255,230,190,0.75)",
        15,
      );
    },
    art(ctx, cx, cy, s) {
      A.jerkyBag(ctx, cx, cy, s * 1.6, s * 2.3, plainLabel, {});
    },
    posterBg: ["gradient", "#5a1a2a", "#f4a83a"],
    posterInk: "#f4d27a",
    posterFont: "slab",
  });

  // ==================================================================
  // HOMEGUARD household cleanser
  // ==================================================================
  def("homeguard", {
    name: "Homeguard Cleanser",
    colors: ["#1e3a6a", "#c8201a", "#f4f0e6"],
    slogans: [
      "Defending the American kitchen.",
      "Tough on grease. Gentle on your good china.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "solid", "#cde8e0");
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for (let x = 0; x < 1000; x += 50) ctx.fillRect(x, 0, 2, 380);
      for (let y = 380, row = 0; y < 500; y += 30, row++)
        for (let x = (row % 2) * 30; x < 1000; x += 60) {
          ctx.fillStyle = "#1e3a6a";
          ctx.fillRect(x, y, 30, 30);
        }
      ctx.fillStyle = "#f4f0e6";
      ctx.fillRect(0, 376, 1000, 6);
      ctx.fillStyle = "#1e3a6a";
      ctx.fillRect(0, 0, 1000, 56);
      ctx.fillStyle = "#c8201a";
      ctx.fillRect(0, 56, 1000, 6);
      A.housewife(ctx, 165, 205, 74, { dress: "#c8201a", hair: "#e8b848" });
      A.can(ctx, 820, 255, 190, 270, homeguardLabel, "#c8c8c0");
      for (let k = 0; k < 10; k++) {
        const x = 680 + r() * 300,
          y = 90 + r() * 300;
        X.starPath(ctx, x, y, 10 + r() * 14, 3, 4);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
      X.text(ctx, "NEW GRIT-FREE SCOURING ACTION", 500, 30, {
        font: "condensed",
        size: 28,
        color: "#f4f0e6",
        spacing: 6,
        maxW: 900,
      });
      X.text(ctx, "HOMEGUARD", 485, 130, {
        font: "impact",
        size: 92,
        color: "#1e3a6a",
        stroke: "#fff",
        strokeW: 8,
        maxW: 380,
        extrude: { color: "#0a1a3a", n: 5 },
      });
      X.text(ctx, "C L E A N S E R", 485, 205, {
        font: "condensed",
        size: 38,
        color: "#c8201a",
        maxW: 360,
      });
      X.text(ctx, "Defending the", 485, 268, {
        font: "serif",
        size: 36,
        italic: true,
        color: INK,
        maxW: 360,
      });
      X.text(ctx, "American kitchen.", 485, 316, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#c8201a",
        maxW: 370,
      });
    },
    art(ctx, cx, cy, s) {
      A.can(ctx, cx, cy, s * 1.3, s * 1.9, homeguardLabel, "#c8c8c0");
    },
    posterBg: ["solid", "#cde8e0", "#cde8e0"],
    posterInk: "#1e3a6a",
  });

  // ==================================================================
  // LONLY (television)
  // ==================================================================
  /** LONLY mark: the wordmark set in a rounded screen with two antenna strokes. */
  function lonlyMark(ctx, cx, cy, w, ink, fill) {
    const h = w * 0.42;
    A.lin(
      ctx,
      cx - w * 0.08,
      cy - h / 2,
      cx - w * 0.24,
      cy - h * 1.05,
      Math.max(2, w * 0.025),
      ink,
    );
    A.lin(
      ctx,
      cx + w * 0.08,
      cy - h / 2,
      cx + w * 0.26,
      cy - h * 1.0,
      Math.max(2, w * 0.025),
      ink,
    );
    X.rrect(ctx, cx - w / 2, cy - h / 2, w, h, h * 0.3);
    A.fs(ctx, fill, Math.max(2, w * 0.03), ink);
    X.text(ctx, "LONLY", cx, cy + h * 0.03, {
      font: "deco",
      size: h * 0.62,
      color: ink,
      spacing: w * 0.03,
      maxW: w * 0.86,
      noSafe: true,
    });
  }
  X.brandArt.lonlyMark = lonlyMark;
