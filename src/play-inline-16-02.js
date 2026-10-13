// play-inline-16 02 — ctx
// Lines 323-651 of readable/play-inline-16.pretty.js (statement-aligned).
  function homeguardLabel(ctx, x, y, w, h) {
    ctx.fillStyle = "#1e3a6a";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#c8201a";
    ctx.fillRect(x, y + h * 0.7, w, h * 0.08);
    ctx.fillStyle = "#f4f0e6";
    ctx.fillRect(x, y + h * 0.78, w, h * 0.05);
    const sx = x + w / 2,
      sy = y + h * 0.3,
      sw = w * 0.36;
    ctx.beginPath();
    ctx.moveTo(sx - sw / 2, sy - sw * 0.5);
    ctx.lineTo(sx + sw / 2, sy - sw * 0.5);
    ctx.lineTo(sx + sw / 2, sy);
    ctx.quadraticCurveTo(sx + sw / 2, sy + sw * 0.55, sx, sy + sw * 0.75);
    ctx.quadraticCurveTo(sx - sw / 2, sy + sw * 0.55, sx - sw / 2, sy);
    ctx.closePath();
    ctx.fillStyle = "#f4f0e6";
    ctx.fill();
    ctx.strokeStyle = "#c8201a";
    ctx.lineWidth = Math.max(1.5, w * 0.025);
    ctx.stroke();
    X.text(ctx, "H", sx, sy + sw * 0.05, {
      font: "impact",
      size: sw * 0.8,
      color: "#c8201a",
      maxW: sw,
      noSafe: true,
    });
    X.text(ctx, "HOMEGUARD", x + w / 2, y + h * 0.62, {
      font: "impact",
      size: w * 0.18,
      color: "#f4f0e6",
      maxW: w * 0.92,
      noSafe: true,
    });
    X.text(ctx, "CLEANSER", x + w / 2, y + h * 0.92, {
      font: "condensed",
      size: w * 0.1,
      color: "#f4f0e6",
      maxW: w * 0.9,
      noSafe: true,
    });
  }
  function maneLabel(ctx, x, y, w, h) {
    X.text(ctx, "DR. THATCHER’S", x + w / 2, y + h * 0.17, {
      font: "copper",
      size: w * 0.11,
      color: "#7a2a1a",
      maxW: w * 0.82,
      noSafe: true,
    });
    X.text(ctx, "Miracle", x + w / 2, y + h * 0.4, {
      font: "script",
      weight: "normal",
      size: w * 0.24,
      color: "#1e4a32",
      maxW: w * 0.82,
      noSafe: true,
    });
    X.text(ctx, "MANE", x + w / 2, y + h * 0.62, {
      font: "copper",
      size: w * 0.2,
      color: "#1e4a32",
      maxW: w * 0.82,
      noSafe: true,
    });
    X.text(ctx, "HAIR TONIC · 4 FL. OZ.", x + w / 2, y + h * 0.84, {
      font: "condensed",
      size: w * 0.08,
      color: "#7a2a1a",
      maxW: w * 0.82,
      noSafe: true,
    });
  }
  function pouchLabel(ctx, x, y, w, h) {
    ctx.fillStyle = "#0e1a44";
    X.rrect(ctx, x, y, w, h, w * 0.06);
    ctx.fill();
    X.text(ctx, "ASTRONAUT", x + w / 2, y + h * 0.13, {
      font: "deco",
      size: w * 0.15,
      color: "#fff",
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "ICE CREAM", x + w / 2, y + h * 0.27, {
      font: "deco",
      size: w * 0.13,
      color: "#ff9ab8",
      maxW: w * 0.9,
      noSafe: true,
    });
    A.neapolitan(ctx, x + w * 0.18, y + h * 0.38, w * 0.64, h * 0.28);
    X.text(ctx, "FREEZE-DRIED NEAPOLITAN", x + w / 2, y + h * 0.77, {
      font: "condensed",
      size: w * 0.075,
      color: "#cfe8ff",
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "JUNIOR ROCKETEER CO.", x + w / 2, y + h * 0.9, {
      font: "condensed",
      size: w * 0.075,
      color: "#f4d040",
      maxW: w * 0.9,
      noSafe: true,
    });
  }
  function kitFront(ctx, x, y, w, h) {
    ctx.fillStyle = A.grad(ctx, 0, y, 0, y + h, [
      [0, "#1e3a8a"],
      [1, "#5ab0e8"],
    ]);
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#c8201a";
    ctx.fillRect(x, y, w, h * 0.2);
    X.text(ctx, "JUNIOR", x + w / 2, y + h * 0.06, {
      font: "deco",
      size: w * 0.12,
      color: "#fff",
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "ROCKETEER", x + w / 2, y + h * 0.14, {
      font: "deco",
      size: w * 0.13,
      color: "#f4d040",
      maxW: w * 0.9,
      noSafe: true,
    });
    A.rocket(ctx, x + w * 0.5, y + h * 0.55, h * 0.42, -Math.PI / 2, {
      body: "#f4f0e6",
      accent: "#c8201a",
    });
    X.text(ctx, "MODEL ROCKET KIT No. 7", x + w / 2, y + h * 0.9, {
      font: "condensed",
      size: w * 0.08,
      color: "#fff",
      maxW: w * 0.9,
      noSafe: true,
    });
  }
  X.brandArt = {
    flakesFront,
    marinaraLabel,
    plainLabel,
    homeguardLabel,
    maneLabel,
    pouchLabel,
    kitFront,
    cloud,
    bubble,
    meatballPlate,
    steam,
    rider,
    stopwatch,
  };

  // ==================================================================
  // LIBERTY JETLINER (airline)
  // ==================================================================
  def("liberty_jetliner", {
    name: "Liberty Jetliner",
    colors: ["#13306a", "#f4f0e6", "#c8202a"],
    slogans: [
      "Fly the flag. Fly Liberty.",
      "Coast to coast in a single afternoon.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#2e6ab8", "#e4f0f8");
      ctx.fillStyle = A.rgrad(ctx, 880, 70, 10, 260, [
        [0, "rgba(255,250,220,0.9)"],
        [1, "rgba(255,250,220,0)"],
      ]);
      ctx.fillRect(600, 0, 400, 330);
      cloud(ctx, 560, 120, 26, "rgba(255,255,255,0.55)");
      cloud(ctx, 930, 300, 34, "rgba(255,255,255,0.7)");
      for (let k = 0; k < 9; k++)
        cloud(
          ctx,
          40 + k * 120,
          440 - (k % 2) * 16,
          46,
          "rgba(255,255,255,0.95)",
        );
      A.speedLines(ctx, 420, 180, 250, 110, 5, "rgba(255,255,255,0.7)");
      A.jetliner(ctx, 740, 215, 500, -0.1, { stripe: "#c8202a" });
      ctx.fillStyle = "#13306a";
      ctx.fillRect(0, 446, 1000, 54);
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = k % 2 ? "#f4f0e6" : "#c8202a";
        ctx.fillRect(0, 428 + k * 6, 1000, 6);
      }
      X.text(ctx, "LIBERTY", 250, 100, {
        font: "deco",
        size: 104,
        color: "#13306a",
        spacing: 8,
        stroke: "#f4f0e6",
        strokeW: 6,
        maxW: 420,
      });
      X.text(ctx, "J E T L I N E R", 250, 182, {
        font: "condensed",
        size: 42,
        color: "#c8202a",
        spacing: 4,
        maxW: 400,
      });
      X.text(ctx, this.slogans[0], 250, 262, {
        font: "serif",
        size: 40,
        italic: true,
        color: "#13306a",
        maxW: 430,
      });
      X.text(
        ctx,
        "NEW YORK · WASHINGTON · CHICAGO · DENVER · LOS ANGELES",
        500,
        474,
        {
          font: "condensed",
          size: 24,
          color: "#f4f0e6",
          spacing: 3,
          maxW: 900,
        },
      );
    },
    art(ctx, cx, cy, s) {
      A.jetliner(ctx, cx, cy, s * 3.0, -0.35, { stripe: "#c8202a" });
    },
    posterBg: ["gradient", "#2e6ab8", "#e4f0f8"],
    posterInk: "#13306a",
    posterFont: "deco",
  });

  // ==================================================================
  // THE FIRST JOURNAL (newspaper)
  // ==================================================================
  def("first_journal", {
    name: "The First Journal",
    colors: ["#efe8d6", "#141210", "#b81c1c"],
    slogans: ["You heard it here first.", "Morning, evening and Sunday."],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "solid", "#efe8d6");
      ctx.fillStyle = "rgba(40,36,30,0.07)";
      for (let x = 20; x < 1000; x += 64) ctx.fillRect(x, 0, 2, 500);
      A.newspaper(ctx, 770, 250, 320, 410, {
        rot: 0.05,
        head: "GEMINI CREW HOME SAFE",
        sub: "Splashdown on target in the Atlantic",
      });
      ctx.fillStyle = "#b81c1c";
      ctx.fillRect(40, 300, 470, 6);
      X.text(ctx, "The First", 285, 90, {
        font: "didone",
        size: 84,
        color: "#141210",
        maxW: 470,
      });
      X.text(ctx, "Journal", 285, 185, {
        font: "didone",
        size: 112,
        color: "#141210",
        maxW: 470,
      });
      X.text(ctx, this.slogans[0], 285, 262, {
        font: "serif",
        size: 44,
        italic: true,
        color: "#b81c1c",
        maxW: 470,
      });
      X.text(ctx, "MORNING · EVENING · SUNDAY", 285, 345, {
        font: "condensed",
        size: 30,
        color: "#141210",
        spacing: 6,
        maxW: 460,
      });
      K.fine(
        ctx,
        "Delivered before the coffee perks · Five cents at every newsstand",
        285,
        468,
        "rgba(20,18,16,0.7)",
        17,
      );
    },
    art(ctx, cx, cy, s) {
      A.newspaper(ctx, cx, cy, s * 2.6, s * 3.2, {
        rot: -0.06,
        head: "EXTRA!",
        sub: "You heard it here first.",
      });
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "solid", "#efe8d6");
      A.newspaper(ctx, 200, 300, 330, 430, {
        rot: v % 2 ? 0.04 : -0.04,
        head: v % 2 ? "MOON BY 1970?" : "EXTRA!",
        sub: v % 2 ? "Scientists say yes" : "You heard it here first.",
      });
      X.text(ctx, "THE FIRST JOURNAL", 200, 45, {
        font: "didone",
        size: 40,
        color: "#141210",
        maxW: 370,
      });
      K.ribbonText(
        ctx,
        "YOU HEARD IT HERE FIRST.",
        200,
        555,
        330,
        48,
        "#b81c1c",
        "#6a0e0e",
        "#fff",
      );
    },
  });

  // ==================================================================
  // PIZZA GALAXY (pizza chain)
  // ==================================================================
