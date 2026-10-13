// play-inline-14 02 — ctx
// Lines 274-617 of readable/play-inline-14.pretty.js (statement-aligned).
  A.wrappedFrank = function (ctx, cx, cy, w, o) {
    o = o || {};
    const h = w * 0.34,
      lw = Math.max(1.2, w * 0.012);
    ctx.save();
    ctx.lineJoin = "round";
    // bun
    X.rrect(ctx, cx - w * 0.4, cy - h * 0.22, w * 0.8, h * 0.62, h * 0.3);
    ctx.fillStyle = grad(ctx, 0, cy - h * 0.25, 0, cy + h * 0.4, [
      [0, "#f0bc6c"],
      [0.6, "#d8913a"],
      [1, "#a8601e"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    // frank
    X.rrect(ctx, cx - w * 0.46, cy - h * 0.3, w * 0.92, h * 0.3, h * 0.15);
    ctx.fillStyle = grad(ctx, 0, cy - h * 0.3, 0, cy, [
      [0, "#d86a44"],
      [1, "#8a2e16"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.beginPath();
    for (let k = 0; k <= 30; k++) {
      const t = k / 30,
        x = cx - w * 0.36 + t * w * 0.72,
        y = cy - h * 0.17 + Math.sin(t * Math.PI * 8) * h * 0.06;
      if (k) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = "#f4c21e";
    ctx.lineWidth = h * 0.07;
    ctx.stroke();
    // plastic sleeve
    X.rrect(ctx, cx - w * 0.5, cy - h * 0.48, w, h * 0.98, h * 0.12);
    ctx.fillStyle = "rgba(225,238,248,0.22)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = lw;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = lw * 1.6;
    for (const [x0, y0, x1, y1] of [
      [-0.38, -0.36, -0.2, 0.3],
      [0.1, -0.4, 0.22, 0.05],
      [0.3, -0.38, 0.34, -0.2],
    ])
      lin(
        ctx,
        cx + x0 * w,
        cy + y0 * h,
        cx + x1 * w,
        cy + y1 * h,
        lw * 1.6,
        "rgba(255,255,255,0.55)",
      );
    for (const sd of [-1, 1]) {
      // crimped seals
      const x = cx + sd * w * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, cy - h * 0.48);
      for (let k = 0; k <= 8; k++)
        ctx.lineTo(
          x + sd * (k % 2 ? w * 0.04 : w * 0.015),
          cy - h * 0.48 + k * h * 0.1225,
        );
      ctx.lineTo(x, cy + h * 0.5);
      ctx.closePath();
      ctx.fillStyle = "rgba(235,242,248,0.7)";
      ctx.fill();
      ctx.strokeStyle = "rgba(120,140,150,0.6)";
      ctx.lineWidth = lw * 0.6;
      ctx.stroke();
    }
    if (o.sticker !== false) {
      const sx = cx + w * 0.22,
        sy = cy + h * 0.18,
        sr = h * 0.3;
      ell(ctx, sx, sy, sr, sr);
      fs(ctx, "#c8201a", lw * 0.8);
      ell(ctx, sx, sy, sr * 0.82, sr * 0.82);
      fs(ctx, null, lw * 0.5, "#f8e8c8");
      X.text(ctx, "FOREVER", sx, sy - sr * 0.25, {
        font: "condensed",
        size: sr * 0.36,
        color: "#f8e8c8",
        maxW: sr * 1.5,
        noSafe: true,
      });
      X.text(ctx, "FRANKS", sx, sy + sr * 0.18, {
        font: "condensed",
        size: sr * 0.36,
        color: "#f4c21e",
        maxW: sr * 1.5,
        noSafe: true,
      });
    }
    ctx.restore();
  };

  // ==================================================================
  // FOOD & DRINK
  // ==================================================================
  /** A tall, generous hamburger: sesame bun, lettuce frill, tomato, melting cheese, patty. cy = centre. */
  A.burger = function (ctx, cx, cy, w, o) {
    const lw = Math.max(1.2, w * 0.016),
      x0 = cx - w / 2;
    ctx.save();
    ctx.lineJoin = "round";
    X.rrect(ctx, x0 + w * 0.03, cy + w * 0.1, w * 0.94, w * 0.17, w * 0.08);
    ctx.fillStyle = grad(ctx, 0, cy + w * 0.1, 0, cy + w * 0.27, [
      [0, "#e8a854"],
      [1, "#a8601e"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    X.rrect(ctx, x0, cy - w * 0.02, w, w * 0.15, w * 0.07);
    ctx.fillStyle = grad(ctx, 0, cy - w * 0.02, 0, cy + w * 0.13, [
      [0, "#7a3e1c"],
      [1, "#3a1a08"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.fillStyle = "rgba(255,200,150,0.25)";
    for (let k = 0; k < 9; k++)
      ctx.fillRect(
        x0 + w * (0.08 + k * 0.1),
        cy + w * 0.01,
        w * 0.05,
        w * 0.012,
      );
    ctx.beginPath();
    ctx.moveTo(x0 - w * 0.01, cy - w * 0.05);
    for (let k = 0; k <= 6; k++) {
      const x = x0 + (k * w) / 6;
      ctx.lineTo(x - w / 24, cy - w * 0.04);
      ctx.lineTo(x, cy + (k % 2 ? w * 0.07 : w * 0.035));
    }
    ctx.lineTo(x0 + w * 1.01, cy - w * 0.05);
    ctx.closePath();
    fs(ctx, "#f6c026", lw);
    X.rrect(ctx, x0 + w * 0.04, cy - w * 0.1, w * 0.92, w * 0.06, w * 0.03);
    fs(ctx, "#d83a26", lw);
    ctx.beginPath();
    ctx.moveTo(x0 - w * 0.03, cy - w * 0.1);
    for (let k = 0; k <= 12; k++) {
      const x = x0 - w * 0.03 + (k * w * 1.06) / 12;
      ctx.quadraticCurveTo(
        x - w * 0.045,
        cy - w * (k % 2 ? 0.02 : 0.06),
        x,
        cy - w * 0.08,
      );
    }
    ctx.lineTo(x0 + w * 1.03, cy - w * 0.14);
    ctx.lineTo(x0 - w * 0.03, cy - w * 0.14);
    ctx.closePath();
    fs(ctx, "#5aa83a", lw);
    ctx.beginPath();
    ctx.moveTo(x0, cy - w * 0.12);
    ctx.bezierCurveTo(
      x0 - w * 0.01,
      cy - w * 0.5,
      x0 + w * 1.01,
      cy - w * 0.5,
      x0 + w,
      cy - w * 0.12,
    );
    ctx.closePath();
    ctx.fillStyle = rgrad(ctx, cx - w * 0.15, cy - w * 0.36, 2, w * 0.6, [
      [0, "#f8c87a"],
      [0.5, "#e09440"],
      [1, "#a8581a"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    const rr = X.rng(X.seedOf("sesame"));
    for (let k = 0; k < 16; k++) {
      const a = rr() * Math.PI,
        d = rr();
      ell(
        ctx,
        cx + Math.cos(a) * w * 0.38 * d * (rr() < 0.5 ? -1 : 1),
        cy - w * 0.2 - Math.sin(a) * w * 0.15 * (0.4 + d * 0.6),
        w * 0.016,
        w * 0.009,
        rr() * 3,
      );
      ctx.fillStyle = "#fff4d8";
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ell(ctx, cx - w * 0.18, cy - w * 0.32, w * 0.12, w * 0.04, -0.2);
    ctx.fill();
    ctx.restore();
  };

  /** Whole pizza seen at an angle (tilt = ry/rx). */
  A.pizza = function (ctx, cx, cy, r, o) {
    o = o || {};
    const t = o.tilt || 0.42,
      lw = Math.max(1.2, r * 0.02),
      rr = X.rng(X.seedOf("pizza" + (o.seed || 0)));
    ctx.save();
    ell(ctx, cx, cy + r * t * 0.12, r * 1.02, r * t * 1.02);
    ctx.fillStyle = "#9a5a1e";
    ctx.fill();
    ell(ctx, cx, cy, r, r * t);
    ctx.fillStyle = rgrad(ctx, cx, cy, r * 0.8, r, [
      [0, "#f0b86a"],
      [1, "#c8782a"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ell(ctx, cx, cy, r * 0.86, r * t * 0.86);
    ctx.fillStyle = "#c8321e";
    ctx.fill();
    ctx.save();
    ell(ctx, cx, cy, r * 0.84, r * t * 0.84);
    ctx.clip();
    for (let k = 0; k < 26; k++) {
      const a = rr() * TAU,
        d = Math.sqrt(rr()) * 0.8;
      X.smoothBlob(
        ctx,
        cx + Math.cos(a) * r * d,
        cy + Math.sin(a) * r * t * d,
        r * 0.16,
        r * t * 0.16,
        rr,
        8,
        0.4,
      );
      ctx.fillStyle = rr() < 0.5 ? "#f6dc8a" : "#f2cf72";
      ctx.fill();
    }
    for (let k = 0; k < (o.pepperoni || 11); k++) {
      const a = rr() * TAU,
        d = Math.sqrt(rr()) * 0.72,
        px = cx + Math.cos(a) * r * d,
        py = cy + Math.sin(a) * r * t * d;
      ell(ctx, px, py, r * 0.09, r * t * 0.09);
      ctx.fillStyle = "#a8241a";
      ctx.fill();
      ctx.strokeStyle = "#6a120a";
      ctx.lineWidth = lw * 0.6;
      ctx.stroke();
      ell(ctx, px - r * 0.02, py - r * t * 0.02, r * 0.02, r * t * 0.02);
      ctx.fillStyle = "rgba(255,200,180,0.5)";
      ctx.fill();
    }
    for (let k = 0; k < 6; k++) {
      const a = rr() * TAU,
        d = rr() * 0.7;
      ell(
        ctx,
        cx + Math.cos(a) * r * d,
        cy + Math.sin(a) * r * t * d,
        r * 0.04,
        r * t * 0.07,
        a,
      );
      ctx.fillStyle = "#3a8a2a";
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  };
  /** One slice of pizza pointing along `ang` (radians), tip at (x, y), with a cheese pull. */
  A.pizzaSlice = function (ctx, x, y, len, ang, o) {
    o = o || {};
    const lw = Math.max(1.2, len * 0.02),
      hw = len * 0.42;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang || 0);
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-len, -hw);
    ctx.quadraticCurveTo(-len * 1.08, 0, -len, hw);
    ctx.closePath();
    ctx.fillStyle = "#f2cf72";
    ctx.fill();
    fs(ctx, null, lw);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = "#c8321e";
    for (let k = 0; k < 5; k++) {
      X.smoothBlob(
        ctx,
        -len * (0.25 + k * 0.15),
        (k % 2 ? 1 : -1) * hw * 0.25,
        len * 0.05,
        len * 0.04,
        X.rng(k + 3),
        7,
        0.3,
      );
      ctx.fill();
    }
    for (const [px, py] of [
      [-0.45, -0.12],
      [-0.7, 0.18],
      [-0.78, -0.2],
    ]) {
      ell(ctx, len * px, hw * py * 2, len * 0.075, len * 0.075);
      ctx.fillStyle = "#a8241a";
      ctx.fill();
      ctx.strokeStyle = "#6a120a";
      ctx.lineWidth = lw * 0.5;
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(-len, -hw);
    ctx.quadraticCurveTo(-len * 1.12, 0, -len, hw);
    ctx.lineTo(-len * 0.93, hw * 0.93);
    ctx.quadraticCurveTo(-len * 1.02, 0, -len * 0.93, -hw * 0.93);
    ctx.closePath();
    ctx.fillStyle = "#d8913a";
    ctx.fill();
    fs(ctx, null, lw);
    if (o.pull) {
      ctx.strokeStyle = "#f6dc8a";
      ctx.lineWidth = lw * 1.4;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(-len * 0.05, (k - 1) * hw * 0.08);
        ctx.bezierCurveTo(
          len * 0.1,
          (k - 1) * hw * 0.1 + len * 0.1,
          len * 0.2,
          len * 0.25,
          len * (0.28 + k * 0.03),
          len * 0.32,
        );
        ctx.stroke();
      }
    }
    ctx.restore();
  };
  /** Frosted pilsner glass of lager with a foam head. cx, bottom (base line), h = height. */
