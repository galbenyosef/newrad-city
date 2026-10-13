// play-inline-15 03 — ctx
// Lines 702-868 of readable/play-inline-15.pretty.js (statement-aligned).
  def("vigil", {
    name: "VIGIL Defense",
    colors: ["#0c1820", "#cfeefa", "#ffb347"],
    slogans: [
      "Protecting America Always",
      "Standard Issue for Project Long Winter.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#0c1820", "#16303c");
      ctx.strokeStyle = "rgba(150,220,240,0.14)";
      ctx.lineWidth = 1;
      for (let k = -12; k <= 12; k++) {
        ctx.beginPath();
        ctx.moveTo(700 + k * 22, 300);
        ctx.lineTo(700 + k * 130, 500);
        ctx.stroke();
      }
      for (let y = 305, s = 5; y < 500; y += s, s *= 1.3) {
        ctx.beginPath();
        ctx.moveTo(380, y);
        ctx.lineTo(1000, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(150,220,240,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(700, 190, 150, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(700, 190, 60, 150, 0, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(700, 190, 150, 50, 0, 0, TAU);
      ctx.stroke();
      A.goggles(ctx, 700, 210, 105, {});
      X.text(ctx, "[ VIGIL ]", 225, 105, {
        font: "mono",
        size: 76,
        color: "#cfeefa",
        glow: "#9ae0f4",
        glowBlur: 14,
        spacing: 6,
        maxW: 400,
      });
      X.text(ctx, "D E F E N S E", 225, 180, {
        font: "mono",
        size: 40,
        color: "#ffb347",
        spacing: 6,
        maxW: 400,
      });
      X.text(ctx, this.slogans[0].toUpperCase(), 225, 255, {
        font: "mono",
        size: 28,
        color: "#cfeefa",
        maxW: 400,
      });
      X.text(ctx, "FIELD GOGGLES · MAP · RADIO · RANGEFINDER", 225, 320, {
        font: "mono",
        size: 22,
        color: "rgba(150,220,240,0.85)",
        spacing: 1,
        maxW: 400,
      });
      A.longWinter(ctx, 80, 430, 40, { text: false });
      K.fine(
        ctx,
        "ISSUED BY THE OFFICE OF CIVIL DEFENSE",
        290,
        432,
        "rgba(207,238,250,0.6)",
        16,
      );
    },
    art(ctx, cx, cy, s) {
      A.goggles(ctx, cx, cy, s * 0.62, {});
    },
    posterBg: ["gradient", "#0c1820", "#16303c"],
    posterInk: "#cfeefa",
    posterFont: "mono",
  });
  // ==================================================================
  // 1964 NEW YORK WORLD'S FAIR
  // ==================================================================
  def("worlds_fair", {
    name: "New York World’s Fair",
    colors: ["#1a3a6a", "#f2a83a", "#f4ecd8"],
    slogans: [
      "A Whole Wide World in Flushing Meadows!",
      "Come See Tomorrow — One Day at a Time.",
    ],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "gradient", "#0e1e44", "#5a3a7a");
      A.stars(ctx, 0, 0, 1000, 300, 140, r);
      for (let k = 0; k < 5; k++) {
        const fx = 80 + r() * 840,
          fy = 50 + r() * 150,
          fr = 30 + r() * 40,
          col = ["#f2a83a", "#ff6a8a", "#5ad0ff", "#fff"][k % 4];
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        for (let a = 0; a < 16; a++) {
          const an = (a / 16) * TAU;
          ctx.beginPath();
          ctx.moveTo(
            fx + Math.cos(an) * fr * 0.3,
            fy + Math.sin(an) * fr * 0.3,
          );
          ctx.lineTo(fx + Math.cos(an) * fr, fy + Math.sin(an) * fr);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "#0a0a20";
      ctx.fillRect(0, 455, 1000, 45);
      A.unisphere(ctx, 760, 240, 140, {});
      X.text(ctx, "NEW YORK", 290, 95, {
        font: "deco",
        size: 84,
        color: "#f4ecd8",
        spacing: 6,
        maxW: 480,
      });
      X.text(ctx, "WORLD’S FAIR", 290, 180, {
        font: "deco",
        size: 74,
        color: "#f2a83a",
        stroke: "#0e1e44",
        strokeW: 5,
        spacing: 4,
        maxW: 480,
      });
      X.text(ctx, "1964 · 1965", 290, 250, {
        font: "condensed",
        size: 42,
        color: "#f4ecd8",
        spacing: 10,
        maxW: 420,
      });
      X.text(ctx, this.slogans[0], 290, 320, {
        font: "serif",
        size: 30,
        italic: true,
        color: "#fff",
        maxW: 480,
      });
      K.fine(
        ctx,
        "Flushing Meadows, Queens · Take the No. 7 Train",
        290,
        478,
        "rgba(255,255,255,0.75)",
        17,
      );
    },
    art(ctx, cx, cy, s) {
      A.unisphere(ctx, cx, cy - s * 0.3, s * 0.9, {});
    },
    posterBg: ["gradient", "#0e1e44", "#5a3a7a"],
    posterInk: "#f2a83a",
    posterFont: "deco",
  });

  // The city's brand slate (and X.BRAND_ORDER / X.EXTRA_BRANDS / X.brandArt) is defined in 31b_brands_slate.js.

  // ==================================================================
  // Extra (non-brand) posters: faction notices, civil defence, wanted
  // ==================================================================
