// play-inline-16 05 — ctx
// Lines 1314-1651 of readable/play-inline-16.pretty.js (statement-aligned).
  def("miracle_mane", {
    name: "Dr. Thatcher’s Miracle Mane",
    colors: ["#1e4a32", "#e8c060", "#f4ecd4"],
    slogans: [
      "Grows hair on anything. Anything.",
      "Ask your druggist for the green bottle.",
    ],
    bill(ctx, v, r) {
      ctx.fillStyle = "#8a9aa8";
      ctx.fillRect(0, 0, 1000, 500);
      ctx.fillStyle = "#f2d38a";
      ctx.beginPath();
      ctx.moveTo(360, 0);
      ctx.lineTo(1000, 0);
      ctx.lineTo(1000, 500);
      ctx.lineTo(320, 500);
      ctx.fill();
      X.sunburst(
        ctx,
        540,
        260,
        520,
        22,
        "rgba(0,0,0,0)",
        "rgba(255,255,255,0.18)",
      );
      ctx.fillStyle = "#c8201a";
      ctx.beginPath();
      ctx.moveTo(352, 0);
      ctx.lineTo(368, 0);
      ctx.lineTo(328, 500);
      ctx.lineTo(312, 500);
      ctx.fill();
      A.dad(ctx, 180, 215, 66, {
        hat: false,
        bald: true,
        suit: "#5a5a5e",
        tie: "#3a3a3a",
      });
      A.dad(ctx, 545, 215, 66, {
        hat: false,
        hairColor: "#2a1a0e",
        suit: "#2a4a7a",
        tie: "#c8201a",
      });
      A.tonicBottle(ctx, 830, 40, 340, maneLabel, { glass: "#2a7a4a" });
      X.text(ctx, "BEFORE", 180, 50, {
        font: "marker",
        size: 44,
        color: "#f4f4f0",
        maxW: 260,
      });
      X.text(ctx, "AFTER", 545, 50, {
        font: "marker",
        size: 44,
        color: "#1e4a32",
        maxW: 260,
      });
      ctx.fillStyle = "#1e4a32";
      ctx.fillRect(0, 380, 1000, 120);
      ctx.fillStyle = "#e8c060";
      ctx.fillRect(0, 380, 1000, 5);
      X.text(ctx, "DR. THATCHER’S MIRACLE MANE", 500, 418, {
        font: "copper",
        size: 50,
        color: "#e8c060",
        spacing: 2,
        maxW: 900,
      });
      X.text(ctx, this.slogans[0], 500, 466, {
        font: "serif",
        size: 32,
        italic: true,
        color: "#f4ecd4",
        maxW: 880,
      });
    },
    art(ctx, cx, cy, s) {
      A.tonicBottle(ctx, cx, cy - s * 1.35, s * 2.7, maneLabel, {
        glass: "#2a7a4a",
      });
    },
    posterBg: ["solid", "#1e4a32", "#1e4a32"],
    posterInk: "#e8c060",
    posterFont: "copper",
  });

  // ==================================================================
  // BIG APPLE MOTOR CAB (taxis)
  // ==================================================================
  def("big_apple_cab", {
    name: "Big Apple Motor Cab",
    colors: ["#f2c21a", "#151515", "#c8201a"],
    slogans: [
      "Just get in already!",
      "Five boroughs. One number. PLaza 7-1000.",
    ],
    bill(ctx, v, r) {
      ctx.fillStyle = A.grad(ctx, 0, 0, 0, 400, [
        [0, "#6a4a8a"],
        [0.7, "#f2a85a"],
        [1, "#f8d090"],
      ]);
      ctx.fillRect(0, 0, 1000, 500);
      A.skyline(ctx, 0, 405, 1000, 190, "#3a2a4a", X.rng(12));
      ctx.fillStyle = "rgba(255,220,130,0.8)";
      for (let k = 0; k < 120; k++)
        ctx.fillRect(r() * 1000, 260 + r() * 140, 3, 4);
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(0, 400, 1000, 100);
      ctx.strokeStyle = "#f2c21a";
      ctx.lineWidth = 5;
      ctx.setLineDash([34, 26]);
      ctx.beginPath();
      ctx.moveTo(0, 488);
      ctx.lineTo(1000, 488);
      ctx.stroke();
      ctx.setLineDash([]);
      A.taxi(ctx, 640, 455, 560, {});
      A.apple(ctx, 880, 95, 58, {});
      X.text(ctx, "BIG APPLE", 360, 90, {
        font: "impact",
        size: 104,
        color: "#f2c21a",
        stroke: INK,
        strokeW: 9,
        maxW: 620,
        extrude: { color: "#151515", n: 6 },
      });
      X.text(ctx, "M O T O R   C A B", 360, 170, {
        font: "condensed",
        size: 40,
        color: "#fff",
        spacing: 2,
        maxW: 520,
      });
      bubble(ctx, 190, 290, 290, 104, 380, 330);
      X.text(ctx, "Just get in", 190, 270, {
        font: "marker",
        size: 38,
        color: INK,
        maxW: 240,
      });
      X.text(ctx, "already!", 190, 312, {
        font: "marker",
        size: 42,
        color: "#c8201a",
        maxW: 240,
      });
      K.fine(
        ctx,
        "Radio-dispatched day & night · Call PLaza 7-1000",
        500,
        470,
        "rgba(255,255,255,0.75)",
        16,
      );
    },
    art(ctx, cx, cy, s) {
      A.taxi(ctx, cx, cy + s * 0.5, s * 3.2, {});
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "solid", "#f2c21a");
      for (let k = 0; k < 2; k++)
        for (let x = 0; x < 400; x += 20)
          if ((x / 20 + k) % 2) {
            ctx.fillStyle = "#151515";
            ctx.fillRect(x, 20 + k * 20, 20, 20);
            ctx.fillRect(x, 540 + k * 20, 20, 20);
          }
      A.apple(ctx, 200, 230, 110, {});
      X.text(ctx, "Just get in", 200, 405, {
        font: "impact",
        size: 52,
        color: INK,
        maxW: 360,
      });
      X.text(ctx, "already!", 200, 462, {
        font: "impact",
        size: 62,
        color: "#c8201a",
        maxW: 360,
      });
      X.text(ctx, "BIG APPLE MOTOR CAB", 200, 515, {
        font: "condensed",
        size: 28,
        color: INK,
        spacing: 3,
        maxW: 360,
      });
    },
  });

  // ==================================================================
  // MAMA MARINARA'S INSTANT MEATBALLS
  // ==================================================================
  def("mama_marinara", {
    name: "Mama Marinara’s Instant Meatballs",
    colors: ["#c8281e", "#f6ecd4", "#2a7a3a"],
    slogans: [
      "Just add water. Mama will never know.",
      "Sunday supper, any night of the week.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "solid", "#f6ecd4");
      ctx.fillStyle = "rgba(200,40,30,0.12)";
      for (let y = 0; y < 470; y += 40)
        for (let x = ((y / 40) % 2) * 40; x < 1000; x += 80)
          ctx.fillRect(x, y, 40, 40);
      for (let k = 0; k < 3; k++) {
        ctx.fillStyle = ["#2a7a3a", "#f6ecd4", "#c8281e"][k];
        ctx.fillRect((k * 1000) / 3, 470, 1000 / 3 + 1, 30);
      }
      A.housewife(ctx, 175, 190, 76, { dress: "#2a7a3a", hair: "#d8d4cc" });
      A.can(ctx, 830, 255, 190, 260, marinaraLabel, "#c8c8c0");
      meatballPlate(ctx, 515, 415, 120);
      steam(ctx, 515, 380, 3, 50);
      K.scriptLogo(ctx, "Mama", 515, 80, 100, "#c8281e", "#f6ecd4", {
        maxW: 360,
      });
      X.text(ctx, "MARINARA’S", 515, 162, {
        font: "slab",
        size: 56,
        color: "#2a7a3a",
        maxW: 370,
      });
      X.text(ctx, "INSTANT MEATBALLS", 515, 210, {
        font: "condensed",
        size: 30,
        color: "#c8281e",
        spacing: 4,
        maxW: 370,
      });
      X.text(ctx, "Just add water.", 515, 268, {
        font: "serif",
        size: 36,
        italic: true,
        color: INK,
        maxW: 370,
      });
      X.text(ctx, "Mama will never know.", 515, 314, {
        font: "serif",
        size: 36,
        italic: true,
        color: "#c8281e",
        maxW: 370,
      });
    },
    art(ctx, cx, cy, s) {
      A.can(ctx, cx, cy, s * 1.4, s * 1.9, marinaraLabel, "#c8c8c0");
    },
    posterBg: ["solid", "#f6ecd4", "#f6ecd4"],
    posterInk: "#c8281e",
    posterFont: "script",
  });

  // ==================================================================
  // HI-OCTANE HARRY'S (gas stations)
  // ==================================================================
  def("hi_octane", {
    name: "Hi-Octane Harry’s",
    colors: ["#d8261a", "#ffd23a", "#151515"],
    slogans: [
      "Full service. Full tank. Full speed ahead.",
      "Open six to midnight, every day of the year.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#4a9ae0", "#eaf4f6");
      cloud(ctx, 860, 250, 22, "rgba(255,255,255,0.8)");
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(0, 410, 1000, 90);
      ctx.strokeStyle = "#ffd23a";
      ctx.lineWidth = 6;
      ctx.setLineDash([36, 28]);
      ctx.beginPath();
      ctx.moveTo(0, 455);
      ctx.lineTo(1000, 455);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#e8e4d8";
      ctx.fillRect(470, 405, 210, 10);
      A.gasPump(ctx, 520, 408, 160, "#d8261a");
      A.gasPump(ctx, 625, 408, 160, "#151515");
      A.car(ctx, 840, 446, 300, { body: "#2a8a8a", top: "#f4ecd8" });
      A.harryMark(ctx, 600, 128, 66, {});
      X.text(ctx, "HI-OCTANE", 245, 98, {
        font: "impact",
        size: 104,
        italic: true,
        skew: -0.16,
        color: "#d8261a",
        stroke: "#fff",
        strokeW: 9,
        maxW: 420,
        extrude: { color: "#5a0a06", dx: 1, dy: 1, n: 6 },
      });
      K.scriptLogo(ctx, "Harry’s", 245, 190, 84, "#151515", "#ffd23a", {
        maxW: 380,
      });
      X.text(ctx, "Full service. Full tank.", 245, 272, {
        font: "deco",
        size: 32,
        color: INK,
        maxW: 420,
      });
      X.text(ctx, "Full speed ahead.", 245, 322, {
        font: "deco",
        size: 40,
        color: "#d8261a",
        maxW: 420,
      });
      X.text(ctx, "NEXT EXIT", 165, 455, {
        font: "impact",
        size: 40,
        color: "#fff",
        maxW: 240,
      });
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(300, 440);
      ctx.lineTo(350, 440);
      ctx.lineTo(350, 425);
      ctx.lineTo(385, 455);
      ctx.lineTo(350, 485);
      ctx.lineTo(350, 470);
      ctx.lineTo(300, 470);
      ctx.fill();
    },
    art(ctx, cx, cy, s) {
      A.harryMark(ctx, cx, cy, s * 0.7, {});
    },
    posterBg: ["gradient", "#4a9ae0", "#eaf4f6"],
    posterInk: "#d8261a",
  });

  // ==================================================================
  // FREEDOM FLAKES cereal (Brooklyn Sugar Works)
  // ==================================================================
