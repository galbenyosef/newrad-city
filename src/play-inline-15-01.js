// play-inline-15 01 — ctx
// Lines 18-351 of readable/play-inline-15.pretty.js (statement-aligned).
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
