// play-inline-13 02 — ctx
// Lines 321-607 of readable/play-inline-13.pretty.js (statement-aligned).
  A.dad = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = s * 0.065,
      SKIN = o.skin || "#f0c8a0",
      SUIT = o.suit || "#5a6a7a",
      TIE = o.tie || "#b0302a";
    ctx.save();
    ctx.lineJoin = "round";
    bust(ctx, cx, cy, s, SUIT, lw);
    ctx.beginPath();
    ctx.moveTo(cx - 0.45 * s, cy + 1.22 * s);
    ctx.lineTo(cx, cy + 2.2 * s);
    ctx.lineTo(cx + 0.45 * s, cy + 1.22 * s);
    ctx.closePath();
    fs(ctx, "#f4f0e6", lw * 0.7);
    ctx.beginPath();
    ctx.moveTo(cx - 0.12 * s, cy + 1.3 * s);
    ctx.lineTo(cx + 0.12 * s, cy + 1.3 * s);
    ctx.lineTo(cx + 0.16 * s, cy + 2.2 * s);
    ctx.lineTo(cx, cy + 2.4 * s);
    ctx.lineTo(cx - 0.16 * s, cy + 2.2 * s);
    ctx.closePath();
    fs(ctx, TIE, lw * 0.6);
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + sd * 0.45 * s, cy + 1.22 * s);
      ctx.lineTo(cx + sd * 0.15 * s, cy + 2.0 * s);
      ctx.lineTo(cx + sd * 0.7 * s, cy + 1.7 * s);
      ctx.closePath();
      fs(ctx, X.css(X.shade(SUIT, -0.2)), lw * 0.6);
    }
    ctx.beginPath();
    ctx.rect(cx - 0.33 * s, cy + 0.6 * s, 0.66 * s, 0.65 * s);
    fs(ctx, SKIN, lw);
    ell(ctx, cx + 0.92 * s, cy + 0.1 * s, 0.18 * s, 0.26 * s);
    fs(ctx, SKIN, lw);
    ell(ctx, cx - 0.92 * s, cy + 0.1 * s, 0.18 * s, 0.26 * s);
    fs(ctx, SKIN, lw);
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx, cy - 0.95 * s],
        [cx + 0.85 * s, cy - 0.6 * s],
        [cx + 0.9 * s, cy + 0.3 * s],
        [cx + 0.7 * s, cy + 0.9 * s],
        [cx, cy + 1.05 * s],
        [cx - 0.7 * s, cy + 0.9 * s],
        [cx - 0.9 * s, cy + 0.3 * s],
        [cx - 0.85 * s, cy - 0.6 * s],
      ],
      true,
    );
    fs(ctx, SKIN, lw);
    // eyes (open, twinkling) & brows
    for (const sd of [-1, 1]) {
      ell(ctx, cx + sd * 0.34 * s, cy - 0.02 * s, 0.09 * s, 0.13 * s);
      fs(ctx, INK);
      ell(ctx, cx + sd * 0.32 * s, cy - 0.07 * s, 0.03 * s, 0.04 * s);
      fs(ctx, "#fff");
      lin(
        ctx,
        cx + sd * 0.18 * s,
        cy - 0.3 * s,
        cx + sd * 0.52 * s,
        cy - 0.34 * s,
        lw * 1.1,
      );
    }
    ctx.beginPath();
    ctx.moveTo(cx, cy + 0.05 * s);
    ctx.lineTo(cx + 0.12 * s, cy + 0.3 * s);
    ctx.lineTo(cx - 0.05 * s, cy + 0.32 * s);
    fs(ctx, null, lw * 0.6);
    ctx.beginPath();
    ctx.moveTo(cx - 0.5 * s, cy + 0.5 * s);
    ctx.quadraticCurveTo(cx, cy + 1.0 * s, cx + 0.5 * s, cy + 0.5 * s);
    ctx.closePath();
    fs(ctx, "#fff", lw * 0.7);
    lin(
      ctx,
      cx - 0.45 * s,
      cy + 0.56 * s,
      cx + 0.45 * s,
      cy + 0.56 * s,
      lw * 0.4,
    );
    if (o.hat !== false) {
      ctx.beginPath();
      ctx.moveTo(cx - 1.3 * s, cy - 0.55 * s);
      ctx.quadraticCurveTo(cx, cy - 0.85 * s, cx + 1.3 * s, cy - 0.55 * s);
      ctx.quadraticCurveTo(cx, cy - 0.45 * s, cx - 1.3 * s, cy - 0.55 * s);
      fs(ctx, o.hatColor || "#4a3e32", lw);
      ctx.beginPath();
      ctx.moveTo(cx - 0.8 * s, cy - 0.62 * s);
      ctx.lineTo(cx - 0.75 * s, cy - 1.35 * s);
      ctx.quadraticCurveTo(cx, cy - 1.15 * s, cx + 0.75 * s, cy - 1.35 * s);
      ctx.lineTo(cx + 0.8 * s, cy - 0.62 * s);
      ctx.closePath();
      fs(ctx, o.hatColor || "#4a3e32", lw);
      ctx.fillStyle = "#1a1410";
      ctx.fillRect(cx - 0.8 * s, cy - 0.8 * s, 1.6 * s, 0.16 * s);
    } else if (o.bald) {
      // shiny dome with a fringe over the ears (and a few brave strands)
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ell(ctx, cx - 0.25 * s, cy - 0.7 * s, 0.28 * s, 0.12 * s, -0.3);
      ctx.fill();
      for (const sd of [-1, 1]) {
        ctx.beginPath();
        spline(
          ctx,
          [
            [cx + sd * 0.92 * s, cy - 0.1 * s],
            [cx + sd * 0.86 * s, cy - 0.5 * s],
            [cx + sd * 0.7 * s, cy - 0.62 * s],
            [cx + sd * 0.74 * s, cy - 0.2 * s],
          ],
          true,
        );
        fs(ctx, o.hairColor || "#8a7a6a", lw * 0.7);
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 0.4;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(cx - 0.1 * s + k * 0.1 * s, cy - 0.94 * s);
        ctx.quadraticCurveTo(
          cx + k * 0.1 * s,
          cy - 1.12 * s,
          cx + 0.1 * s + k * 0.1 * s,
          cy - 0.98 * s,
        );
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      spline(
        ctx,
        [
          [cx - 0.9 * s, cy - 0.2 * s],
          [cx - 0.8 * s, cy - 0.85 * s],
          [cx, cy - 1.15 * s],
          [cx + 0.8 * s, cy - 0.85 * s],
          [cx + 0.9 * s, cy - 0.2 * s],
          [cx + 0.6 * s, cy - 0.65 * s],
          [cx - 0.6 * s, cy - 0.7 * s],
        ],
        true,
      );
      fs(ctx, o.hairColor || "#3a2a1a", lw);
    }
    if (o.cap) {
      // peaked service cap with a badge
      ctx.beginPath();
      ctx.moveTo(cx - 0.95 * s, cy - 0.55 * s);
      ctx.quadraticCurveTo(cx - 1.0 * s, cy - 1.25 * s, cx, cy - 1.3 * s);
      ctx.quadraticCurveTo(
        cx + 1.0 * s,
        cy - 1.25 * s,
        cx + 0.95 * s,
        cy - 0.55 * s,
      );
      ctx.closePath();
      fs(ctx, o.cap, lw);
      ctx.beginPath();
      ctx.moveTo(cx - 0.98 * s, cy - 0.55 * s);
      ctx.quadraticCurveTo(cx, cy - 0.3 * s, cx + 0.98 * s, cy - 0.55 * s);
      ctx.quadraticCurveTo(cx, cy - 0.62 * s, cx - 0.98 * s, cy - 0.55 * s);
      fs(ctx, "#1a1a1a", lw);
      ell(ctx, cx, cy - 0.85 * s, 0.18 * s, 0.14 * s);
      fs(ctx, o.badge || "#e8c040", lw * 0.6);
    }
    if (o.beard) {
      // full professorial beard and moustache
      ctx.beginPath();
      spline(
        ctx,
        [
          [cx - 0.88 * s, cy + 0.15 * s],
          [cx - 0.75 * s, cy + 0.95 * s],
          [cx, cy + 1.45 * s],
          [cx + 0.75 * s, cy + 0.95 * s],
          [cx + 0.88 * s, cy + 0.15 * s],
          [cx + 0.45 * s, cy + 0.62 * s],
          [cx, cy + 0.72 * s],
          [cx - 0.45 * s, cy + 0.62 * s],
        ],
        true,
      );
      fs(ctx, o.beard, lw);
      ctx.beginPath();
      ctx.moveTo(cx - 0.55 * s, cy + 0.48 * s);
      ctx.quadraticCurveTo(cx, cy + 0.28 * s, cx + 0.55 * s, cy + 0.48 * s);
      ctx.quadraticCurveTo(cx, cy + 0.44 * s, cx - 0.55 * s, cy + 0.48 * s);
      fs(ctx, o.beard, lw * 0.8);
    }
    ctx.restore();
  };

  /** Freckled kid (for cereal ads). */
  A.kid = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = s * 0.07,
      SKIN = "#f8d2ac";
    ctx.save();
    bust(ctx, cx, cy, s * 0.9, o.shirt || "#e84a3a", lw);
    ctx.save();
    bust(ctx, cx, cy, s * 0.9, null, 0);
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (let y = cy + 1.4 * s; y < cy + 3 * s; y += 0.35 * s)
      ctx.fillRect(cx - 2 * s, y, 4 * s, 0.15 * s);
    ctx.restore();
    ctx.beginPath();
    ctx.rect(cx - 0.3 * s, cy + 0.6 * s, 0.6 * s, 0.6 * s);
    fs(ctx, SKIN, lw);
    for (const sd of [-1, 1]) {
      ell(ctx, cx + sd * 0.95 * s, cy + 0.1 * s, 0.25 * s, 0.3 * s);
      fs(ctx, SKIN, lw);
    }
    ell(ctx, cx, cy, 0.95 * s, 1.0 * s);
    fs(ctx, SKIN, lw);
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx - 0.95 * s, cy - 0.1 * s],
        [cx - 0.8 * s, cy - 0.8 * s],
        [cx, cy - 1.05 * s],
        [cx + 0.8 * s, cy - 0.8 * s],
        [cx + 0.95 * s, cy - 0.1 * s],
        [cx + 0.5 * s, cy - 0.55 * s],
        [cx - 0.5 * s, cy - 0.55 * s],
      ],
      true,
    );
    fs(ctx, o.hair || "#c8642a", lw);
    ctx.beginPath();
    ctx.moveTo(cx + 0.1 * s, cy - 1.0 * s);
    ctx.quadraticCurveTo(
      cx + 0.3 * s,
      cy - 1.5 * s,
      cx + 0.5 * s,
      cy - 1.2 * s,
    );
    fs(ctx, null, lw, o.hair || "#c8642a");
    for (const sd of [-1, 1]) {
      ell(ctx, cx + sd * 0.33 * s, cy - 0.05 * s, 0.16 * s, 0.2 * s);
      fs(ctx, "#fff", lw * 0.6);
      ell(ctx, cx + sd * 0.3 * s, cy - 0.02 * s, 0.08 * s, 0.1 * s);
      fs(ctx, INK);
    }
    ctx.fillStyle = "#b8683a";
    for (let k = 0; k < 10; k++) {
      ell(
        ctx,
        cx + (k % 2 ? 1 : -1) * (0.3 + (k % 5) * 0.06) * s,
        cy + (0.25 + (k % 3) * 0.06) * s,
        0.025 * s,
        0.025 * s,
      );
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy + 0.38 * s, 0.4 * s, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.closePath();
    fs(ctx, "#8a2020", lw * 0.7);
    ell(ctx, cx, cy + 0.66 * s, 0.14 * s, 0.07 * s);
    fs(ctx, "#e87070");
    ctx.restore();
  };

  // ==================================================================
  // PRODUCTS
  // ==================================================================
  // Fizzo bottle: tall, straight-sided, ring-ribbed body, long neck, round medallion label.
  const FIZZO_PROF = [
    [0, 0.05],
    [0.04, 0.05],
    [0.07, 0.043],
    [0.2, 0.046],
    [0.31, 0.072],
    [0.39, 0.106],
    [0.46, 0.118],
    [0.96, 0.118],
    [1, 0.108],
  ];
