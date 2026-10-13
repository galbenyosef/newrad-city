// play-inline-14 01 — ctx
// Lines 19-273 of readable/play-inline-14.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._tx;
  const A = X.art;
  const TAU = Math.PI * 2;
  const INK = "#1d1712";
  const fs = A.fs,
    ell = A.ell,
    lin = A.lin,
    spline = A.spline,
    grad = A.grad,
    rgrad = A.rgrad;
  const shade = (c, f) => X.css(X.shade(c, f));

  // ==================================================================
  // FOREVER FRANKS
  // ==================================================================
  /** Hourglass with turned-wood end plates; sand mostly run through. cy = centre, h = height. */
  A.hourglass = function (ctx, cx, cy, h, o) {
    o = o || {};
    const w = h * 0.62,
      lw = Math.max(1.2, h * 0.03),
      wood = o.wood || "#8a5a2a";
    const gt = cy - h * 0.42,
      gb = cy + h * 0.42;
    ctx.save();
    ctx.lineJoin = "round";
    const glass = () => {
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.4, gt);
      ctx.bezierCurveTo(
        cx - w * 0.44,
        cy - h * 0.14,
        cx - w * 0.06,
        cy - h * 0.07,
        cx - w * 0.045,
        cy,
      );
      ctx.bezierCurveTo(
        cx - w * 0.06,
        cy + h * 0.07,
        cx - w * 0.44,
        cy + h * 0.14,
        cx - w * 0.4,
        gb,
      );
      ctx.lineTo(cx + w * 0.4, gb);
      ctx.bezierCurveTo(
        cx + w * 0.44,
        cy + h * 0.14,
        cx + w * 0.06,
        cy + h * 0.07,
        cx + w * 0.045,
        cy,
      );
      ctx.bezierCurveTo(
        cx + w * 0.06,
        cy - h * 0.07,
        cx + w * 0.44,
        cy - h * 0.14,
        cx + w * 0.4,
        gt,
      );
      ctx.closePath();
    };
    glass();
    ctx.fillStyle = "rgba(214,236,246,0.6)";
    ctx.fill();
    ctx.save();
    glass();
    ctx.clip();
    ctx.fillStyle = o.sand || "#e8b84a";
    ctx.fillRect(cx - w * 0.5, cy - h * 0.2, w, h * 0.2);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.5, gb);
    ctx.quadraticCurveTo(cx, gb - h * 0.42, cx + w * 0.5, gb);
    ctx.fill();
    ctx.fillRect(cx - w * 0.015, cy - h * 0.02, w * 0.03, h * 0.3);
    ctx.restore();
    glass();
    fs(ctx, null, lw);
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillRect(cx - w * 0.3, gt + h * 0.05, w * 0.06, h * 0.18);
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.rect(cx + sd * w * 0.48 - h * 0.025, gt, h * 0.05, gb - gt);
      fs(ctx, wood, lw * 0.8);
    }
    X.rrect(ctx, cx - w * 0.58, gt - h * 0.08, w * 1.16, h * 0.09, h * 0.03);
    fs(ctx, wood, lw);
    X.rrect(ctx, cx - w * 0.58, gb - h * 0.01, w * 1.16, h * 0.09, h * 0.03);
    fs(ctx, wood, lw);
    ctx.restore();
  };

  /**
   * The Forever Franks mascot: a cheerful frank standing in his bun, top hat at a jaunty tilt, white gloves,
   * holding up an hourglass. gy = ground line, s = unit (≈ 4.7·s tall with the hat).
   */
  A.frankMascot = function (ctx, cx, gy, s, o) {
    o = o || {};
    const lw = s * 0.06,
      P = (x, y) => [cx + x * s, gy - y * s];
    const FRANK = o.frank || "#c8502e",
      BUN = o.bun || "#e4a654",
      HAT = o.hat || "#1a1a22",
      BAND = o.band || "#c8201a";
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ell(ctx, ...P(0, 0.02), s * 0.9, s * 0.12);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fill();
    // legs & shoes
    for (const sd of [-1, 1]) {
      lin(ctx, ...P(sd * 0.24, 0.95), ...P(sd * 0.3, 0.14), s * 0.13, INK);
      ell(ctx, ...P(sd * 0.4, 0.1), s * 0.25, s * 0.11);
      fs(ctx, "#2a2420", lw * 0.6);
      ell(ctx, ...P(sd * 0.44, 0.14), s * 0.08, s * 0.03);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fill();
    }
    // bun (back half)
    X.rrect(ctx, ...P(-0.82, 2.25), s * 1.64, s * 1.5, s * 0.5);
    ctx.fillStyle = grad(ctx, cx - s * 0.8, 0, cx + s * 0.8, 0, [
      [0, shade(BUN, -0.3)],
      [0.5, BUN],
      [1, shade(BUN, -0.35)],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    // the frank
    ctx.beginPath();
    X.rrect(ctx, ...P(-0.5, 3.75), s * 1.0, s * 2.95, s * 0.5);
    ctx.fillStyle = grad(ctx, cx - s * 0.5, 0, cx + s * 0.5, 0, [
      [0, shade(FRANK, -0.35)],
      [0.35, shade(FRANK, 0.12)],
      [1, shade(FRANK, -0.4)],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    X.rrect(ctx, ...P(-0.3, 3.5), s * 0.12, s * 1.6, s * 0.06);
    ctx.fill();
    // mustard ribbon
    ctx.beginPath();
    for (let k = 0; k <= 24; k++) {
      const t = k / 24,
        x = -0.42 + t * 0.84,
        y = 2.32 + Math.sin(t * Math.PI * 5) * 0.07;
      const p = P(x, y);
      if (k) ctx.lineTo(p[0], p[1]);
      else ctx.moveTo(p[0], p[1]);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = s * 0.15;
    ctx.stroke();
    ctx.strokeStyle = "#f4c21e";
    ctx.lineWidth = s * 0.1;
    ctx.stroke();
    // bun (front lips)
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      spline(
        ctx,
        [
          P(sd * 0.36, 0.78),
          P(sd * 0.9, 0.95),
          P(sd * 0.98, 1.6),
          P(sd * 0.82, 2.15),
          P(sd * 0.42, 2.05),
          P(sd * 0.36, 1.4),
        ],
        true,
      );
      ctx.fillStyle = grad(ctx, ...P(sd * 0.4, 2), ...P(sd * 0.95, 1), [
        [0, shade(BUN, 0.15)],
        [1, shade(BUN, -0.3)],
      ]);
      ctx.fill();
      fs(ctx, null, lw);
    }
    // face
    for (const sd of [-1, 1]) {
      ell(ctx, ...P(sd * 0.18, 3.08), s * 0.13, s * 0.17);
      fs(ctx, "#fffaf0", lw * 0.6);
      ell(ctx, ...P(sd * 0.16, 3.05), s * 0.06, s * 0.08);
      fs(ctx, INK);
      ell(ctx, ...P(sd * 0.14, 3.09), s * 0.02, s * 0.025);
      fs(ctx, "#fff");
      ctx.beginPath();
      ctx.moveTo(...P(sd * 0.06, 3.32));
      ctx.quadraticCurveTo(...P(sd * 0.2, 3.4), ...P(sd * 0.32, 3.3));
      fs(ctx, null, lw * 0.7);
      ell(ctx, ...P(sd * 0.33, 2.82), s * 0.09, s * 0.06);
      ctx.fillStyle = "rgba(255,120,110,0.55)";
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(...P(-0.27, 2.86));
    ctx.quadraticCurveTo(...P(0, 2.55), ...P(0.27, 2.86));
    ctx.quadraticCurveTo(...P(0, 2.74), ...P(-0.27, 2.86));
    fs(ctx, "#7a1a12", lw * 0.7);
    // arms + gloves: left waves, right raises the hourglass
    ctx.beginPath();
    ctx.moveTo(...P(-0.48, 2.6));
    ctx.quadraticCurveTo(...P(-1.05, 2.35), ...P(-1.15, 2.95));
    ctx.strokeStyle = INK;
    ctx.lineWidth = s * 0.12;
    ctx.stroke();
    ell(ctx, ...P(-1.15, 3.08), s * 0.17, s * 0.17);
    fs(ctx, "#fbf8f0", lw * 0.8);
    for (let k = 0; k < 3; k++)
      lin(
        ctx,
        ...P(-1.22 + k * 0.07, 3.18),
        ...P(-1.2 + k * 0.07, 3.27),
        lw * 0.5,
      );
    ctx.beginPath();
    ctx.moveTo(...P(0.48, 2.6));
    ctx.quadraticCurveTo(...P(1.0, 2.5), ...P(1.12, 2.95));
    ctx.strokeStyle = INK;
    ctx.lineWidth = s * 0.12;
    ctx.stroke();
    if (o.hourglass !== false) A.hourglass(ctx, ...P(1.16, 3.62), s * 1.05, {});
    ell(ctx, ...P(1.12, 3.0), s * 0.17, s * 0.15);
    fs(ctx, "#fbf8f0", lw * 0.8);
    // top hat, tilted
    ctx.save();
    ctx.translate(...P(0.05, 3.72));
    ctx.rotate(-0.14);
    ell(ctx, 0, 0, s * 0.62, s * 0.12);
    fs(ctx, HAT, lw);
    ctx.beginPath();
    ctx.moveTo(-s * 0.38, -s * 0.02);
    ctx.lineTo(-s * 0.42, -s * 0.9);
    ctx.quadraticCurveTo(0, -s * 0.98, s * 0.42, -s * 0.9);
    ctx.lineTo(s * 0.38, -s * 0.02);
    ctx.quadraticCurveTo(0, s * 0.06, -s * 0.38, -s * 0.02);
    fs(ctx, HAT, lw);
    ctx.beginPath();
    ctx.moveTo(-s * 0.385, -s * 0.12);
    ctx.lineTo(-s * 0.395, -s * 0.28);
    ctx.quadraticCurveTo(0, -s * 0.33, s * 0.395, -s * 0.28);
    ctx.lineTo(s * 0.385, -s * 0.12);
    ctx.quadraticCurveTo(0, -s * 0.06, -s * 0.385, -s * 0.12);
    fs(ctx, BAND, lw * 0.6);
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(-s * 0.28, -s * 0.85, s * 0.08, s * 0.55);
    ctx.restore();
    ctx.restore();
  };

  /** A Frank-in-a-Bun sealed in its clear plastic sleeve, crimped ends and a round Forever Franks sticker. Horizontal. */
