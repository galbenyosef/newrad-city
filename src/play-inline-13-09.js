// play-inline-13 09 — ctx
// Lines 2516-2815 of readable/play-inline-13.pretty.js (statement-aligned).
  A.longWinter = function (ctx, cx, cy, r, o) {
    o = o || {};
    const ring = o.ring || "#1c2e52",
      disc = o.disc || "#eef4f6",
      flake = o.flake || "#3a6a8a",
      acc = o.accent || "#e8742a";
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    fs(ctx, ring, r * 0.04, o.ink || INK);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.66, 0, TAU);
    fs(ctx, disc, r * 0.035, acc);
    A.snowflake(ctx, cx, cy, r * 0.5, flake, r * 0.07);
    if (o.text !== false && r > 30) {
      X.arcText(
        ctx,
        o.top || "PROJECT LONG WINTER",
        cx,
        cy,
        r * 0.83,
        -Math.PI / 2,
        { font: "deco", size: r * 0.16, color: disc },
      );
      X.arcText(
        ctx,
        o.bottom || "CIVIL DEFENSE",
        cx,
        cy,
        r * 0.83,
        Math.PI / 2,
        {
          font: "condensed",
          size: r * 0.14,
          color: acc,
          inside: true,
          spacing: r * 0.02,
        },
      );
    }
    ctx.restore();
  };
  /** Glowkeepers sun disc: solid disc, inner ring and TWELVE straight rays (alternating long and short) — Nicole's twelve-ray sun. */
  A.sunDisc = function (ctx, cx, cy, r, o) {
    o = o || {};
    const col = o.color || "#f2b23a",
      ink = o.ink === undefined ? INK : o.ink,
      n = o.rays || 12;
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU - Math.PI / 2,
        rr = i % 2 ? r * 0.8 : r,
        w = (TAU / n) * 0.22;
      ctx.moveTo(
        cx + Math.cos(a - w) * r * 0.5,
        cy + Math.sin(a - w) * r * 0.5,
      );
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      ctx.lineTo(
        cx + Math.cos(a + w) * r * 0.5,
        cy + Math.sin(a + w) * r * 0.5,
      );
      ctx.closePath();
    }
    ctx.fillStyle = X.css(col);
    ctx.fill();
    if (ink) {
      ctx.strokeStyle = X.css(ink);
      ctx.lineWidth = r * 0.025;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, TAU);
    ctx.fillStyle = X.css(col);
    ctx.fill();
    if (ink) {
      ctx.lineWidth = r * 0.03;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.36, 0, TAU);
    ctx.strokeStyle = X.css(o.inner || X.shade(col, -0.35));
    ctx.lineWidth = r * 0.06;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.18, 0, TAU);
    ctx.fillStyle = X.css(o.core || "#fff6d8");
    ctx.fill();
    ctx.restore();
  };
  /** Iron Covenant emblem: riveted heater shield, an upright lance with pennant gripped by an iron gauntlet. s = height. */
  A.covenant = function (ctx, cx, cy, s, pal) {
    pal = pal || {};
    const ink = pal.ink || "#15120e",
      iron = pal.iron || "#6e7276",
      field = pal.field || "#8a2a1e",
      steel = pal.steel || "#d8d4c8",
      lw = Math.max(1.5, s * 0.014);
    ctx.save();
    ctx.lineJoin = "round";
    const top = cy - s * 0.46,
      w = s * 0.4;
    const shield = (k) => {
      ctx.beginPath();
      ctx.moveTo(cx - w * k, top + s * (1 - k) * 0.06);
      ctx.lineTo(cx + w * k, top + s * (1 - k) * 0.06);
      ctx.lineTo(cx + w * k, cy + s * 0.02);
      ctx.quadraticCurveTo(
        cx + w * k * 0.95,
        cy + s * 0.32 * k,
        cx,
        cy + s * 0.48 * k,
      );
      ctx.quadraticCurveTo(
        cx - w * k * 0.95,
        cy + s * 0.32 * k,
        cx - w * k,
        cy + s * 0.02,
      );
      ctx.closePath();
    };
    shield(1);
    ctx.fillStyle = iron;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = lw * 1.4;
    ctx.stroke();
    shield(0.84);
    ctx.fillStyle = field;
    ctx.fill();
    ctx.lineWidth = lw;
    ctx.stroke();
    for (let k = 0; k < 7; k++) {
      ell(
        ctx,
        cx - w * 0.92 + k * w * 0.307,
        top + s * 0.035,
        s * 0.016,
        s * 0.016,
      );
      fs(ctx, steel, lw * 0.5, ink);
    }
    for (const d of [-1, 1])
      for (let k = 1; k < 4; k++) {
        ell(
          ctx,
          cx + d * w * 0.92,
          top + s * (0.035 + k * 0.13),
          s * 0.016,
          s * 0.016,
        );
        fs(ctx, steel, lw * 0.5, ink);
      }
    ctx.beginPath();
    ctx.rect(cx - s * 0.018, top + s * 0.1, s * 0.036, s * 0.72);
    fs(ctx, steel, lw, ink);
    ctx.beginPath();
    ctx.moveTo(cx, top - s * 0.04);
    ctx.lineTo(cx + s * 0.045, top + s * 0.11);
    ctx.lineTo(cx - s * 0.045, top + s * 0.11);
    ctx.closePath();
    fs(ctx, steel, lw, ink);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.018, top + s * 0.14);
    ctx.lineTo(cx - s * 0.26, top + s * 0.18);
    ctx.lineTo(cx - s * 0.18, top + s * 0.22);
    ctx.lineTo(cx - s * 0.26, top + s * 0.27);
    ctx.lineTo(cx - s * 0.018, top + s * 0.28);
    ctx.closePath();
    fs(ctx, steel, lw, ink);
    const fy = cy - s * 0.02;
    X.rrect(ctx, cx - s * 0.11, fy - s * 0.06, s * 0.22, s * 0.16, s * 0.04);
    fs(ctx, iron, lw, ink);
    for (let k = 0; k < 4; k++) {
      X.rrect(
        ctx,
        cx - s * 0.11 + k * s * 0.055,
        fy - s * 0.09,
        s * 0.05,
        s * 0.07,
        s * 0.02,
      );
      fs(ctx, X.css(X.shade(iron, 0.15)), lw * 0.7, ink);
    }
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.09, fy + s * 0.1);
    ctx.lineTo(cx + s * 0.09, fy + s * 0.1);
    ctx.lineTo(cx + s * 0.12, fy + s * 0.24);
    ctx.lineTo(cx - s * 0.12, fy + s * 0.24);
    ctx.closePath();
    fs(ctx, X.css(X.shade(iron, -0.15)), lw, ink);
    ctx.restore();
  };
  /** The Continuity seal: starred ring, a domed capitol, "1967". */
  A.continuity = function (ctx, cx, cy, r, pal) {
    pal = pal || {};
    const navy = pal.navy || "#1e3266",
      cream = pal.cream || "#efe8d4",
      red = pal.red || "#a8231c";
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    fs(ctx, navy, r * 0.04);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.7, 0, TAU);
    fs(ctx, cream, r * 0.03);
    for (let k = 0; k < 13; k++) {
      const a = -Math.PI / 2 + (k - 6) * 0.22;
      X.star(
        ctx,
        cx + Math.cos(a) * r * 0.85,
        cy + Math.sin(a) * r * 0.85,
        r * 0.06,
        cream,
      );
    }
    ctx.fillStyle = navy;
    ctx.fillRect(cx - r * 0.42, cy + r * 0.12, r * 0.84, r * 0.12);
    ctx.fillRect(cx - r * 0.24, cy - r * 0.02, r * 0.48, r * 0.15);
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.02, r * 0.2, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - r * 0.02, cy - r * 0.32, r * 0.04, r * 0.1);
    ctx.fillStyle = cream;
    for (let k = 0; k < 6; k++)
      ctx.fillRect(
        cx - r * 0.2 + k * r * 0.08,
        cy + r * 0.02,
        r * 0.025,
        r * 0.1,
      );
    X.text(ctx, "1967", cx, cy + r * 0.42, {
      font: "copper",
      size: r * 0.18,
      color: red,
      maxW: r * 0.8,
      noSafe: true,
    });
    if (r > 30)
      X.arcText(
        ctx,
        pal.text || "THE CONTINUITY",
        cx,
        cy,
        r * 0.85,
        Math.PI / 2,
        { font: "copper", size: r * 0.13, color: cream, inside: true },
      );
    ctx.restore();
  };
  A.lightning = function (ctx, x, y, s, col) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + s * 0.5, y);
    ctx.lineTo(x + s * 0.2, y + s * 0.6);
    ctx.lineTo(x + s * 0.55, y + s * 0.6);
    ctx.lineTo(x - s * 0.1, y + s * 1.5);
    ctx.lineTo(x + s * 0.1, y + s * 0.8);
    ctx.lineTo(x - s * 0.2, y + s * 0.8);
    ctx.closePath();
    fs(ctx, col || "#f8e040", s * 0.05);
  };
  /** Starfield with a few big twinkles. */
  A.stars = function (ctx, x, y, w, h, n, r, col) {
    ctx.save();
    ctx.fillStyle = col || "#fff";
    for (let k = 0; k < n; k++) {
      const px = x + r() * w,
        py = y + r() * h,
        s = r() * 1.8 + 0.4;
      ctx.globalAlpha = 0.4 + r() * 0.6;
      ctx.fillRect(px, py, s, s);
    }
    ctx.globalAlpha = 1;
    for (let k = 0; k < n / 20; k++) {
      const px = x + r() * w,
        py = y + r() * h,
        s = 4 + r() * 6;
      X.starPath(ctx, px, py, s, s * 0.2, 4);
      ctx.fill();
    }
    ctx.restore();
  };
  /** Speed lines behind a moving object. */
  A.speedLines = function (ctx, x, y, w, h, n, col) {
    ctx.save();
    ctx.strokeStyle = col || "rgba(255,255,255,0.6)";
    ctx.lineCap = "round";
    for (let k = 0; k < n; k++) {
      const yy = y + ((k + 0.5) / n) * h;
      ctx.lineWidth = (h / n) * 0.25;
      ctx.beginPath();
      ctx.moveTo(x + w * (k % 3) * 0.1, yy);
      ctx.lineTo(x + w * (0.6 + (k % 2) * 0.3), yy);
      ctx.stroke();
    }
    ctx.restore();
  };
