/* src/textures/31_brands.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: brand advertising art (old-world New York, 1950s–60s)
 * Owned by: textures.
 *
 * Ad kit + the heritage brands (Fizzo, Project Long Winter, Prairie Root
 * Beer, Sky Patrol, VIGIL Defense, the World's Fair) + the non-brand
 * posters. The rest of the city's slate lives in 31b_brands_slate.js, which
 * also sets X.BRAND_ORDER (28 canonical ids = the city's billboard list,
 * G.LAYOUT.BRANDS, 1:1). Each brand draws a
 * full billboard composition into a virtual 1000×500 canvas (bill) and
 * optionally a poster into a virtual 400×600 canvas (poster; otherwise a
 * generic layout built from `art` is used). The odd-variant composition
 * lives in 33_brands_v1.js. All brands, slogans and copy are original.
 * Weathering is applied afterwards by 32_ads.js.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const X = G._tx;
  const A = X.art;
  const TAU = Math.PI * 2;
  const INK = "#1d1712";

  // ------------------------------------------------------------------
  // Ad kit: backgrounds, logos, ribbons, badges, fine print
  // ------------------------------------------------------------------
  const K = (X.adkit = {});
  K.bg = function (ctx, W, H, type, c1, c2, o) {
    o = o || {};
    if (type === "sunburst") {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
      X.sunburst(
        ctx,
        o.cx === undefined ? W * 0.7 : o.cx,
        o.cy === undefined ? H * 0.6 : o.cy,
        Math.hypot(W, H),
        o.rays || 28,
        c1,
        c2,
        o.rot || 0,
      );
    } else if (type === "stripes") {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = c2;
      const sw = o.w || 40;
      for (let x = -H; x < W + H; x += sw * 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + sw, 0);
        ctx.lineTo(x + sw - H * (o.slant || 0.5), H);
        ctx.lineTo(x - H * (o.slant || 0.5), H);
        ctx.fill();
      }
    } else if (type === "gradient") {
      ctx.fillStyle = A.grad(
        ctx,
        0,
        0,
        o.horizontal ? W : 0,
        o.horizontal ? 0 : H,
        [
          [0, c1],
          [1, c2],
        ],
      );
      ctx.fillRect(0, 0, W, H);
    } else if (type === "radial") {
      ctx.fillStyle = A.rgrad(
        ctx,
        o.cx === undefined ? W / 2 : o.cx,
        o.cy === undefined ? H / 2 : o.cy,
        1,
        Math.hypot(W, H) * 0.6,
        [
          [0, c1],
          [1, c2],
        ],
      );
      ctx.fillRect(0, 0, W, H);
    } else if (type === "dots") {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = c2;
      const s = o.s || 26;
      for (let y = 0; y < H + s; y += s)
        for (let x = ((((y / s) | 0) % 2) * s) / 2; x < W + s; x += s) {
          ctx.beginPath();
          ctx.arc(x, y, s * 0.18, 0, TAU);
          ctx.fill();
        }
    } else if (type === "grid") {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = c2;
      ctx.lineWidth = 1;
      const s = o.s || 25;
      for (let x = 0; x < W; x += s) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += s) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = c1;
      ctx.fillRect(0, 0, W, H);
    }
  };
  /** Boomerang swoosh band across the ad. */
  K.swoosh = function (ctx, x0, y0, x1, y1, thick, col, bend) {
    const mx = (x0 + x1) / 2,
      my = (y0 + y1) / 2 - (bend || 60);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(mx, my, x1, y1);
    ctx.lineTo(x1, y1 + thick * 0.3);
    ctx.quadraticCurveTo(mx, my + thick, x0, y0 + thick);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  };
  K.ribbonText = function (ctx, text, cx, cy, w, h, fill, dark, ink, font) {
    X.ribbon(ctx, cx, cy, w, h, fill, dark);
    X.text(ctx, text, cx, cy + 2, {
      font: font || "impact",
      size: h * 0.62,
      maxW: w * 0.92,
      color: ink || "#fff",
    });
  };
  K.badge = function (ctx, lines, cx, cy, r, fill, ink, rot) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot || -0.2);
    X.starburst(ctx, 0, 0, r * 0.82, r, 18, fill, INK, r * 0.05);
    lines.forEach((l, i) =>
      X.text(ctx, l, 0, (i - (lines.length - 1) / 2) * r * 0.42, {
        font: "impact",
        size: r * (i === 0 && lines.length > 1 ? 0.34 : 0.42),
        maxW: r * 1.45,
        color: ink || "#fff",
      }),
    );
    ctx.restore();
  };
  K.fine = function (ctx, text, x, y, col, size, align) {
    X.text(ctx, text, x, y, {
      font: "helv",
      size: size || 13,
      weight: "normal",
      color: col || "rgba(0,0,0,0.6)",
      align: align || "center",
    });
  };
  K.panel = function (ctx, x, y, w, h, fill, lw) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    A.fs(ctx, fill, lw || 4);
  };
  /** Big retro logotype with drop-shadow & outline. */
  K.logo = function (ctx, text, x, y, o) {
    return X.text(
      ctx,
      text,
      x,
      y,
      Object.assign(
        {
          font: "impact",
          size: 110,
          color: "#fff",
          stroke: INK,
          strokeW: 10,
          shadow: "#000",
          shadowA: 0.35,
          shadowOff: 8,
        },
        o || {},
      ),
    );
  };
  K.scriptLogo = function (ctx, text, x, y, size, col, outline, o) {
    o = o || {};
    X.text(ctx, text, x + size * 0.05, y + size * 0.06, {
      font: "script",
      size,
      weight: "normal",
      color: "rgba(0,0,0,0.35)",
      maxW: o.maxW,
      skew: o.skew,
    });
    return X.text(ctx, text, x, y, {
      font: "script",
      size,
      weight: "normal",
      color: col,
      stroke: outline,
      strokeW: size * 0.1,
      maxW: o.maxW,
      skew: o.skew,
    });
  };
  /** Rising soda bubbles (rings with a highlight). */
  K.bubbles = function (ctx, x, y, w, h, n, r, col) {
    ctx.save();
    ctx.strokeStyle = col || "rgba(255,255,255,0.8)";
    for (let k = 0; k < n; k++) {
      const bx = x + r() * w,
        by = y + r() * h,
        br = 4 + r() * r() * 22;
      ctx.lineWidth = Math.max(1.5, br * 0.14);
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx - br * 0.35, by - br * 0.35, br * 0.22, 0, TAU);
      ctx.fillStyle = col || "rgba(255,255,255,0.8)";
      ctx.fill();
    }
    ctx.restore();
  };
  /** TV test card (concentric circles + bars) clipped into a screen rect. */
  K.testCard = function (ctx, scr, ink) {
    ctx.save();
    ctx.beginPath();
    X.rrect(ctx, scr.x, scr.y, scr.w, scr.h, Math.min(scr.w, scr.h) * 0.12);
    ctx.clip();
    ctx.fillStyle = "#d8e4e0";
    ctx.fillRect(scr.x, scr.y, scr.w, scr.h);
    const cx = scr.x + scr.w / 2,
      cy = scr.y + scr.h / 2;
    ctx.strokeStyle = ink || "#2a3a38";
    ctx.lineWidth = Math.max(1.5, scr.h * 0.02);
    for (let k = 1; k <= 3; k++) {
      ctx.beginPath();
      ctx.arc(cx, cy, scr.h * 0.13 * k, 0, TAU);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(scr.x, cy);
    ctx.lineTo(scr.x + scr.w, cy);
    ctx.moveTo(cx, scr.y);
    ctx.lineTo(cx, scr.y + scr.h);
    ctx.stroke();
    for (let k = 0; k < 6; k++) {
      ctx.fillStyle = k % 2 ? "#3a4a48" : "#f4f8f4";
      ctx.fillRect(
        scr.x + scr.w * (0.08 + k * 0.03),
        cy - scr.h * 0.35,
        scr.w * 0.03,
        scr.h * 0.7,
      );
    }
    for (let y = scr.y; y < scr.y + scr.h; y += 4) {
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.fillRect(scr.x, y, scr.w, 2);
    }
    ctx.restore();
  };

  const B = (X.BRANDS = {});
  const def = (id, spec) => {
    spec.id = id;
    B[id] = spec;
  };

  // ==================================================================
  // 1 · FIZZO COLA (diner cream / teal / cherry red, bubbles)
  // ==================================================================
  def("fizzo_cola", {
    name: "Fizzo Cola",
    colors: ["#c8241c", "#f6eed8", "#2a8a84"],
    slogans: ["Pop the Cap on a Brighter Day!", "Bubbles You Can Hear!"],
    bill(ctx, v, r) {
      K.bg(ctx, 1000, 500, "stripes", "#f6eed8", "#e8dcc0", {
        w: 34,
        slant: 0,
      });
      ctx.fillStyle = "#2a8a84";
      ctx.beginPath();
      ctx.moveTo(600, 0);
      ctx.lineTo(1000, 0);
      ctx.lineTo(1000, 500);
      ctx.lineTo(520, 500);
      ctx.fill();
      ctx.fillStyle = "#c8241c";
      ctx.fillRect(0, 410, 1000, 90);
      ctx.fillStyle = "#f6eed8";
      ctx.fillRect(0, 404, 1000, 6);
      K.bubbles(ctx, 600, 20, 380, 380, 26, r, "rgba(246,238,216,0.85)");
      A.fizzoBottle(ctx, 800, 50, 400);
      K.scriptLogo(ctx, "Fizzo", 290, 120, 170, "#c8241c", "#f6eed8", {
        maxW: 470,
      });
      X.text(ctx, "C O L A", 290, 225, {
        font: "deco",
        size: 54,
        color: "#2a8a84",
        spacing: 10,
        maxW: 420,
      });
      X.text(ctx, this.slogans[0], 290, 310, {
        font: "impact",
        size: 46,
        color: INK,
        italic: true,
        skew: -0.1,
        maxW: 500,
      });
      X.text(ctx, "ICE COLD · 6¢ · AT EVERY LUNCH COUNTER", 300, 455, {
        font: "condensed",
        size: 30,
        color: "#f6eed8",
        spacing: 3,
        maxW: 540,
      });
    },
    art(ctx, cx, cy, s) {
      A.fizzoBottle(ctx, cx, cy - s * 1.15, s * 2.3);
    },
    poster(ctx, v, r) {
      K.bg(ctx, 400, 600, "solid", "#2a8a84");
      K.bubbles(ctx, 20, 120, 360, 380, 22, r, "rgba(246,238,216,0.7)");
      K.scriptLogo(ctx, "Fizzo", 200, 80, 100, "#f6eed8", "#7a1410", {
        maxW: 340,
      });
      A.fizzoBottle(ctx, 200, 150, 330);
      K.ribbonText(
        ctx,
        v % 2 ? "BUBBLES YOU CAN HEAR!" : "POP THE CAP!",
        200,
        530,
        300,
        56,
        "#c8241c",
        "#7a1410",
        "#f6eed8",
      );
    },
  });
  // ==================================================================
  // 2 · FIZZO BLUE (the glowing blue one)
  // ==================================================================
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
  X.EXTRA_POSTERS = {
    wanted(ctx, v, r) {
      K.bg(ctx, 400, 600, "solid", "#e0d0a8");
      X.text(ctx, "WANTED", 200, 70, {
        font: "slab",
        size: 84,
        color: INK,
        maxW: 370,
      });
      X.text(ctx, "DEAD OR ALIVE", 200, 130, {
        font: "slab",
        size: 30,
        color: "#8a1a10",
        spacing: 4,
      });
      ctx.fillStyle = "#b8a888";
      ctx.fillRect(90, 160, 220, 240);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.strokeRect(90, 160, 220, 240);
      A.dad(ctx, 200, 260, 55, { hat: true, suit: "#4a3a2a", tie: "#2a2a2a" });
      X.text(ctx, v % 2 ? '"MAD" MICKEY FLYNN' : "BIG TONY DELUCA", 200, 440, {
        font: "slab",
        size: 34,
        color: INK,
        maxW: 370,
      });
      X.text(ctx, "REWARD", 200, 495, {
        font: "slab",
        size: 40,
        color: "#8a1a10",
      });
      X.text(ctx, (v % 2 ? 300 : 500) + " SCRIP", 200, 545, {
        font: "slab",
        size: 50,
        color: INK,
      });
    },
    covenant_recruit(ctx) {
      K.bg(ctx, 400, 600, "sunburst", "#4a4440", "#3e3834", {
        cx: 200,
        cy: 250,
      });
      A.covenant(ctx, 200, 235, 260, {});
      X.text(ctx, "THE IRON COVENANT", 200, 55, {
        font: "copper",
        size: 34,
        color: "#e8e0cc",
        maxW: 370,
      });
      X.text(ctx, "IRON ENDURES", 200, 425, {
        font: "impact",
        size: 58,
        color: "#e8e0cc",
        stroke: INK,
        strokeW: 6,
        maxW: 370,
      });
      X.text(ctx, "Acolytes wanted — report to the Warden", 200, 490, {
        font: "typewriter",
        size: 20,
        color: "#e8e0cc",
        maxW: 370,
      });
      X.text(ctx, "Rockefeller Center", 200, 540, {
        font: "serif",
        size: 26,
        italic: true,
        color: "#c8b890",
      });
    },
    continuity(ctx) {
      K.bg(ctx, 400, 600, "solid", "#e8e4d8");
      ctx.fillStyle = "#1e3266";
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = "#a8231c";
      for (let k = 0; k < 4; k++) ctx.fillRect(0, 312 + k * 22, 400, 11);
      A.continuity(ctx, 200, 155, 120, {});
      X.text(ctx, "THE GOVERNMENT", 200, 430, {
        font: "deco",
        size: 40,
        color: "#1e3266",
        maxW: 370,
      });
      X.text(ctx, "NEVER STOPPED.", 200, 478, {
        font: "deco",
        size: 40,
        color: "#a8231c",
        maxW: 370,
      });
      X.text(ctx, "Tune to Continuity Radio · Obey curfew", 200, 540, {
        font: "condensed",
        size: 22,
        color: INK,
        spacing: 2,
        maxW: 370,
      });
    },
    missing(ctx, v, r) {
      K.bg(ctx, 400, 600, "solid", "#f0ece0");
      X.text(ctx, "MISSING", 200, 70, {
        font: "marker",
        size: 80,
        color: "#1a1a1a",
      });
      ctx.fillStyle = "#cfc8b8";
      ctx.fillRect(100, 130, 200, 220);
      A.kid(ctx, 200, 210, 55, { shirt: "#3a7ad0" });
      X.text(
        ctx,
        v % 2 ? "Have you seen our Timmy?" : "Our dog RUFUS",
        200,
        400,
        { font: "marker", size: 30, color: "#1a1a1a", maxW: 370 },
      );
      X.text(ctx, "Last seen near Grand Central", 200, 450, {
        font: "marker",
        size: 24,
        color: "#3a3a3a",
        maxW: 370,
      });
      X.text(ctx, "Please ask for Martha", 200, 520, {
        font: "marker",
        size: 26,
        color: "#8a1a1a",
        maxW: 370,
      });
      ctx.save();
      ctx.translate(200, 580);
      for (let k = 0; k < 8; k++) {
        ctx.fillStyle = "#e8e4d8";
        ctx.fillRect(-190 + k * 48, -30, 40, 40);
      }
      ctx.restore();
    },
    propaganda(ctx) {
      K.bg(ctx, 400, 600, "sunburst", "#1c2e52", "#24386a", {
        cx: 200,
        cy: 600,
      });
      ctx.strokeStyle = "rgba(232,240,246,0.5)";
      ctx.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(60 + k * 30, 80 + k * 40);
        ctx.lineTo(300 + k * 20, 40 + k * 30);
        ctx.stroke();
      }
      A.dad(ctx, 200, 230, 70, {
        hat: true,
        suit: "#3a4a5a",
        hatColor: "#2a3440",
      });
      X.text(ctx, "WATCH THE", 200, 430, {
        font: "impact",
        size: 58,
        color: "#fff",
        stroke: INK,
        strokeW: 6,
      });
      X.text(ctx, "SKIES!", 200, 500, {
        font: "impact",
        size: 70,
        color: "#e8742a",
        stroke: INK,
        strokeW: 6,
      });
      X.text(ctx, "Report unknown aircraft to your Block Warden", 200, 560, {
        font: "condensed",
        size: 18,
        color: "#fff",
        maxW: 380,
      });
      A.ocd(ctx, 350, 60, 32, {});
    },
    long_winter_recruit(ctx) {
      K.bg(ctx, 400, 600, "solid", "#eef4f6");
      A.cryoPod(ctx, 120, 260, 70, {});
      A.longWinter(ctx, 285, 200, 90, {});
      X.text(ctx, "ONE WINTER’S SLEEP", 200, 430, {
        font: "deco",
        size: 36,
        color: "#1c2e52",
        maxW: 370,
      });
      X.text(ctx, "A LIFETIME OF SPRINGS", 200, 475, {
        font: "deco",
        size: 30,
        color: "#e8742a",
        maxW: 370,
      });
      X.text(ctx, "Volunteer at the Municipal Building · Room 1967", 200, 540, {
        font: "condensed",
        size: 20,
        color: "#1c2e52",
        spacing: 1,
        maxW: 370,
      });
    },
    glowkeepers(ctx) {
      K.bg(ctx, 400, 600, "radial", "#8a4a1a", "#1a0a04", { cx: 200, cy: 250 });
      ctx.save();
      ctx.shadowColor = "#ffc860";
      ctx.shadowBlur = 40;
      A.sunDisc(ctx, 200, 240, 140, { color: "#f2b23a" });
      ctx.restore();
      X.text(ctx, "THE BOMB", 200, 435, {
        font: "copper",
        size: 46,
        color: "#fff2c8",
        glow: "#ffc860",
      });
      X.text(ctx, "WAS A SUNRISE", 200, 490, {
        font: "copper",
        size: 40,
        color: "#fff2c8",
        glow: "#ffc860",
      });
      X.text(ctx, "Walk in the Glow · The Glowkeepers", 200, 555, {
        font: "typewriter",
        size: 20,
        color: "#f2b23a",
        maxW: 380,
      });
    },
    radio_free(ctx) {
      K.bg(ctx, 400, 600, "solid", "#1a1a1a");
      ctx.strokeStyle = "#f2c43a";
      ctx.lineWidth = 6;
      for (let k = 1; k < 5; k++) {
        ctx.beginPath();
        ctx.arc(200, 220, k * 40, -Math.PI * 0.85, -Math.PI * 0.15);
        ctx.stroke();
      }
      ctx.fillStyle = "#c8c8c0";
      ctx.beginPath();
      ctx.moveTo(200, 220);
      ctx.lineTo(160, 360);
      ctx.lineTo(240, 360);
      ctx.closePath();
      ctx.fill();
      X.text(ctx, "RADIO FREE", 200, 420, {
        font: "impact",
        size: 58,
        color: "#f2c43a",
      });
      X.text(ctx, "MANHATTAN", 200, 485, {
        font: "impact",
        size: 58,
        color: "#fff",
      });
      X.text(ctx, "The Voice of the Big Apple · Radio City", 200, 545, {
        font: "condensed",
        size: 20,
        color: "#c8c8c0",
        maxW: 380,
      });
    },
    rally_tonic(ctx) {
      // Dr. Halloran's Rally Tonic: a patent-medicine broadside — a brown bottle in a sunburst, a doctor's endorsement
      K.bg(ctx, 400, 600, "radial", "#f6e6b8", "#d8a858", { cx: 200, cy: 230 });
      ctx.save();
      ctx.strokeStyle = "rgba(160,60,20,0.25)";
      ctx.lineWidth = 10;
      for (let k = 0; k < 18; k++) {
        const a = (k * Math.PI) / 9;
        ctx.beginPath();
        ctx.moveTo(200 + Math.cos(a) * 70, 230 + Math.sin(a) * 70);
        ctx.lineTo(200 + Math.cos(a) * 190, 230 + Math.sin(a) * 190);
        ctx.stroke();
      }
      ctx.restore();
      A.amberBottle(ctx, 200, 90, 290, {
        label: "#f2e2b4",
        band: "#b0281a",
        text: "RALLY",
      });
      X.text(ctx, "DR. HALLORAN'S", 200, 400, {
        font: "serif",
        size: 26,
        color: "#5a2a0a",
        maxW: 360,
      });
      X.text(ctx, "RALLY TONIC", 200, 445, {
        font: "impact",
        size: 64,
        color: "#b0281a",
        maxW: 370,
      });
      X.text(ctx, "Doctor recommended!", 200, 495, {
        font: "serif",
        size: 30,
        italic: true,
        color: INK,
        maxW: 370,
      });
      K.fine(
        ctx,
        "Restores the vital spirits · 22% alc. · Civil Defense first-aid kits",
        200,
        545,
        "rgba(0,0,0,0.6)",
        15,
      );
    },
    prussian_blue(ctx) {
      // Prussian Blue capsules: a cool public-health notice in the pigment's own colour
      K.bg(ctx, 400, 600, "gradient", "#1c3c7a", "#0c1a3c");
      X.trefoil(ctx, 200, 220, 120, "rgba(255,255,255,0.08)");
      A.pillBottle(ctx, 200, 225, 130, 210, (c, x, y, w, h) => {
        c.fillStyle = "#123a7a";
        c.fillRect(x, y + h * 0.18, w, h * 0.4);
        X.text(c, "PRUSSIAN", x + w / 2, y + h * 0.38, {
          font: "impact",
          size: w * 0.17,
          color: "#fff",
          maxW: w * 0.9,
          noSafe: true,
        });
        X.text(c, "500 mg", x + w / 2, y + h * 0.78, {
          font: "condensed",
          size: w * 0.13,
          color: "#123a7a",
          maxW: w * 0.9,
          noSafe: true,
        });
      });
      X.text(ctx, "PRUSSIAN BLUE", 200, 420, {
        font: "impact",
        size: 58,
        color: "#f4f0e0",
        maxW: 370,
      });
      X.text(ctx, "It works while you wait.", 200, 478, {
        font: "serif",
        size: 30,
        italic: true,
        color: "#c8d8f0",
        maxW: 370,
      });
      K.fine(
        ctx,
        "Office of Civil Defense · Two capsules after exposure",
        200,
        540,
        "rgba(255,255,255,0.65)",
        17,
      );
    },
  };
})();
