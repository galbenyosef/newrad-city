/* src/textures/30b_art_slate.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: product & mascot illustrations for the city's
 * brand slate (1960s commercial art, flat colour, bold outline).
 * Owned by: textures. Everything here is ORIGINAL artwork.
 *
 *   X.art.hourglass / frankMascot / wrappedFrank      Forever Franks
 *   X.art.burger / pizza / pizzaSlice / pilsner        Burger Brigade, Pizza Galaxy, Empire Brew House
 *   X.art.cigPack / torch                              Silver Torch
 *   X.art.castle / swordStone                          Excalibur Gardens
 *   X.art.tonicBottle                                  Dr. Thatcher's Miracle Mane
 *   X.art.apple / taxi                                 Big Apple Motor Cab
 *   X.art.newspaper                                    The First Journal
 *   X.art.foilPouch / jerkyBag / jerkyStrip / zeppelin Astronaut Ice Cream, Golden Plain, Chocolate Zeppelin
 *   X.art.sergeant                                     Super Sergeant (Bowery Comics)
 *   X.art.eagle / automatonMark / harryMark            Eagle Motors, American Automaton Co., Hi-Octane Harry's
 * ===================================================================== */
(function () {
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
  A.pilsner = function (ctx, cx, bottom, h, o) {
    o = o || {};
    const top = bottom - h,
      wt = h * 0.2,
      wb = h * 0.12,
      lw = Math.max(1.2, h * 0.012);
    const body = () => {
      ctx.beginPath();
      ctx.moveTo(cx - wt, top);
      ctx.lineTo(cx - wb, bottom - h * 0.06);
      ctx.quadraticCurveTo(cx - wb, bottom, cx - wb * 1.25, bottom);
      ctx.lineTo(cx + wb * 1.25, bottom);
      ctx.quadraticCurveTo(cx + wb, bottom, cx + wb, bottom - h * 0.06);
      ctx.lineTo(cx + wt, top);
      ctx.closePath();
    };
    ctx.save();
    ctx.lineJoin = "round";
    body();
    ctx.fillStyle = grad(ctx, cx - wt, 0, cx + wt, 0, [
      [0, "#c8781a"],
      [0.35, o.beer || "#f4c040"],
      [0.6, "#f8d466"],
      [1, "#b8680e"],
    ]);
    ctx.fill();
    ctx.save();
    body();
    ctx.clip();
    const rr = X.rng(X.seedOf("pils"));
    ctx.strokeStyle = "rgba(255,250,220,0.75)";
    ctx.lineWidth = Math.max(1, h * 0.004);
    for (let k = 0; k < 30; k++) {
      ctx.beginPath();
      ctx.arc(
        cx + (rr() - 0.5) * wb * 1.6,
        top + h * (0.2 + rr() * 0.75),
        h * (0.004 + rr() * 0.006),
        0,
        TAU,
      );
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(cx - wt * 0.7, top, wt * 0.18, h);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    for (let k = 0; k < 22; k++) {
      ell(
        ctx,
        cx + (rr() - 0.5) * wt * 1.8,
        top + h * (0.2 + rr() * 0.7),
        h * 0.008,
        h * 0.012,
      );
      ctx.fill();
    }
    ctx.restore();
    body();
    fs(ctx, null, lw);
    // foam head spilling over the rim
    ctx.beginPath();
    ctx.moveTo(cx - wt * 1.04, top + h * 0.1);
    for (let k = 0; k <= 7; k++) {
      const x = cx - wt * 1.04 + (k * wt * 2.08) / 7;
      ctx.quadraticCurveTo(
        x - wt * 0.15,
        top - h * (0.08 + (k % 2) * 0.04),
        x,
        top - h * 0.02,
      );
    }
    ctx.lineTo(cx + wt * 1.04, top + h * 0.1);
    ctx.quadraticCurveTo(cx, top + h * 0.13, cx - wt * 1.04, top + h * 0.1);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, 0, top - h * 0.1, 0, top + h * 0.12, [
      [0, "#ffffff"],
      [1, "#efe4c8"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.beginPath();
    ctx.moveTo(cx + wt * 0.6, top + h * 0.08);
    ctx.quadraticCurveTo(
      cx + wt * 0.75,
      top + h * 0.2,
      cx + wt * 0.66,
      top + h * 0.26,
    );
    fs(ctx, null, lw * 2.4, "#f6f0e0");
    ctx.restore();
  };

  // ==================================================================
  // SILVER TORCH
  // ==================================================================
  /** The torch: gilded handle, fluted cup, tall flame with a glow. cy = rim of the cup. */
  A.torch = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = Math.max(1.2, s * 0.03),
      gold = o.gold || "#d8b04a";
    ctx.save();
    ctx.lineJoin = "round";
    if (o.glow !== false) {
      ctx.fillStyle = rgrad(ctx, cx, cy - s * 0.55, 1, s * 1.2, [
        [0, "rgba(255,230,150,0.6)"],
        [1, "rgba(255,200,90,0)"],
      ]);
      ctx.fillRect(cx - s * 1.3, cy - s * 1.8, s * 2.6, s * 2.4);
    }
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx, cy - s * 1.25],
        [cx + s * 0.22, cy - s * 0.75],
        [cx + s * 0.3, cy - s * 0.25],
        [cx + s * 0.18, cy],
        [cx - s * 0.18, cy],
        [cx - s * 0.3, cy - s * 0.3],
        [cx - s * 0.12, cy - s * 0.65],
        [cx - s * 0.05, cy - s * 0.95],
      ],
      true,
    );
    ctx.fillStyle = grad(ctx, 0, cy - s * 1.25, 0, cy, [
      [0, "#fff2b0"],
      [0.4, "#ffc84a"],
      [1, "#f07a1a"],
    ]);
    ctx.fill();
    fs(ctx, null, lw * 0.8, o.flameInk || "#a8501a");
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx + s * 0.02, cy - s * 0.85],
        [cx + s * 0.14, cy - s * 0.45],
        [cx + s * 0.08, cy - s * 0.06],
        [cx - s * 0.08, cy - s * 0.06],
        [cx - s * 0.12, cy - s * 0.4],
      ],
      true,
    );
    ctx.fillStyle = "#fffbe0";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.36, cy);
    ctx.lineTo(cx + s * 0.36, cy);
    ctx.lineTo(cx + s * 0.2, cy + s * 0.34);
    ctx.lineTo(cx - s * 0.2, cy + s * 0.34);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, cx - s * 0.36, 0, cx + s * 0.36, 0, [
      [0, shade(gold, -0.4)],
      [0.4, shade(gold, 0.35)],
      [1, shade(gold, -0.45)],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    for (let k = -2; k <= 2; k++)
      lin(
        ctx,
        cx + k * s * 0.12,
        cy + s * 0.02,
        cx + k * s * 0.07,
        cy + s * 0.32,
        lw * 0.5,
        "rgba(60,40,10,0.55)",
      );
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.13, cy + s * 0.34);
    ctx.lineTo(cx + s * 0.13, cy + s * 0.34);
    ctx.lineTo(cx + s * 0.08, cy + s * 1.55);
    ctx.lineTo(cx - s * 0.08, cy + s * 1.55);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, cx - s * 0.13, 0, cx + s * 0.13, 0, [
      [0, shade(gold, -0.45)],
      [0.45, shade(gold, 0.3)],
      [1, shade(gold, -0.5)],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    for (const y of [0.55, 0.95, 1.35]) {
      ctx.beginPath();
      ctx.rect(cx - s * 0.12, cy + s * y, s * 0.24, s * 0.06);
      fs(ctx, shade(gold, 0.1), lw * 0.6);
    }
    ctx.restore();
  };
  /** Silver Torch cigarette pack (front + a sliver of side), three cigarettes standing proud. */
  A.cigPack = function (ctx, cx, cy, w, h, o) {
    o = o || {};
    const x = cx - w / 2,
      y = cy - h / 2,
      lw = Math.max(1.2, w * 0.018),
      bg = o.bg || "#16264a";
    ctx.save();
    ctx.lineJoin = "round";
    for (let k = 0; k < 3; k++) {
      // cigarettes
      const px = x + w * (0.22 + k * 0.2),
        top = y - h * (0.16 + (k === 1 ? 0.1 : 0) + k * 0.02);
      ctx.beginPath();
      ctx.rect(px, top, w * 0.16, h * 0.3);
      fs(ctx, "#f8f6f0", lw * 0.7);
      ctx.beginPath();
      ctx.rect(px, top, w * 0.16, h * 0.1);
      fs(ctx, "#d8a060", lw * 0.7);
      ctx.fillStyle = "rgba(120,70,20,0.4)";
      for (let d = 0; d < 6; d++)
        ctx.fillRect(
          px + w * 0.02 + d * w * 0.022,
          top + h * 0.02 + (d % 2) * h * 0.04,
          w * 0.01,
          w * 0.01,
        );
    }
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w + w * 0.12, y - h * 0.04);
    ctx.lineTo(x + w + w * 0.12, y + h - h * 0.04);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    fs(ctx, shade(bg, -0.35), lw);
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = grad(ctx, x, 0, x + w, 0, [
      [0, shade(bg, -0.15)],
      [0.5, bg],
      [1, shade(bg, -0.3)],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.fillStyle = grad(ctx, x, y, x + w, y + h * 0.25, [
      [0, "#8a949e"],
      [0.3, "#f4f8fa"],
      [0.55, "#a8b2ba"],
      [0.8, "#eef2f4"],
      [1, "#7a848c"],
    ]);
    ctx.fillRect(x, y, w, h * 0.2);
    ctx.strokeStyle = "rgba(60,70,80,0.35)";
    ctx.lineWidth = lw * 0.4;
    for (let k = 0; k < 6; k++) {
      ctx.beginPath();
      ctx.moveTo(x + (w * k) / 6, y);
      ctx.lineTo(x + (w * (k + 0.6)) / 6, y + h * 0.2);
      ctx.stroke();
    }
    ctx.fillStyle = "#c8ccd2";
    ctx.fillRect(x, y + h * 0.2, w, h * 0.025);
    A.torch(ctx, cx, y + h * 0.42, h * 0.16, { glow: false });
    X.text(ctx, "SILVER", cx, y + h * 0.73, {
      font: "deco",
      size: w * 0.2,
      color: "#eef2f4",
      spacing: w * 0.02,
      maxW: w * 0.86,
      noSafe: true,
    });
    X.text(ctx, "TORCH", cx, y + h * 0.83, {
      font: "deco",
      size: w * 0.2,
      color: "#e8c050",
      spacing: w * 0.02,
      maxW: w * 0.86,
      noSafe: true,
    });
    X.text(ctx, "KING SIZE · FILTER", cx, y + h * 0.93, {
      font: "condensed",
      size: w * 0.075,
      color: "#c8d0d8",
      maxW: w * 0.86,
      noSafe: true,
    });
    ctx.restore();
    ctx.restore();
  };

  // ==================================================================
  // EXCALIBUR GARDENS
  // ==================================================================
  /** Storybook castle: curtain wall, gatehouse, keep and four turrets with pennants. gy = ground, w = width. */
  A.castle = function (ctx, cx, gy, w, o) {
    o = o || {};
    const lw = Math.max(1.2, w * 0.006),
      stone = o.stone || "#e2dac8",
      roofA = o.roof || "#2a4aa0",
      roofB = o.roof2 || "#c8302a",
      flag = o.flag || "#f2c43a";
    const sh = shade(stone, -0.18);
    ctx.save();
    ctx.lineJoin = "round";
    const crenel = (x0, x1, y, n) => {
      const step = (x1 - x0) / n;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      for (let k = 0; k < n; k++) {
        const xa = x0 + k * step;
        if (k % 2 === 0) {
          ctx.lineTo(xa, y - step * 0.7);
          ctx.lineTo(xa + step, y - step * 0.7);
          ctx.lineTo(xa + step, y);
        } else ctx.lineTo(xa + step, y);
      }
      ctx.lineTo(x1, y);
      ctx.closePath();
      fs(ctx, stone, lw);
    };
    const tower = (tx, tw, th, roof, flagSide) => {
      ctx.beginPath();
      ctx.rect(tx - tw / 2, gy - th, tw, th);
      ctx.fillStyle = grad(ctx, tx - tw / 2, 0, tx + tw / 2, 0, [
        [0, stone],
        [1, sh],
      ]);
      ctx.fill();
      fs(ctx, null, lw);
      ctx.beginPath();
      ctx.moveTo(tx - tw * 0.62, gy - th);
      ctx.lineTo(tx, gy - th - tw * 1.35);
      ctx.lineTo(tx + tw * 0.62, gy - th);
      ctx.closePath();
      ctx.fillStyle = grad(ctx, tx - tw / 2, 0, tx + tw / 2, 0, [
        [0, shade(roof, 0.2)],
        [1, shade(roof, -0.3)],
      ]);
      ctx.fill();
      fs(ctx, null, lw);
      const fy = gy - th - tw * 1.35;
      lin(ctx, tx, fy, tx, fy - tw * 0.5, lw, INK);
      ctx.beginPath();
      ctx.moveTo(tx, fy - tw * 0.5);
      ctx.quadraticCurveTo(
        tx + flagSide * tw * 0.3,
        fy - tw * 0.52,
        tx + flagSide * tw * 0.55,
        fy - tw * 0.38,
      );
      ctx.lineTo(tx, fy - tw * 0.28);
      ctx.closePath();
      fs(ctx, flag, lw * 0.7);
      for (let k = 0; k < 2; k++) {
        X.rrect(
          ctx,
          tx - tw * 0.1,
          gy - th * (0.75 - k * 0.3),
          tw * 0.2,
          th * 0.12,
          tw * 0.1,
        );
        fs(ctx, "#2a2a3a", lw * 0.5);
      }
    };
    // curtain wall
    ctx.beginPath();
    ctx.rect(cx - w * 0.46, gy - w * 0.18, w * 0.92, w * 0.18);
    ctx.fillStyle = stone;
    ctx.fill();
    fs(ctx, null, lw);
    crenel(cx - w * 0.46, cx + w * 0.46, gy - w * 0.18, 23);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = lw * 0.6;
    for (let r = 1; r < 5; r++) {
      const y = gy - w * 0.18 + r * w * 0.036;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.46, y);
      ctx.lineTo(cx + w * 0.46, y);
      ctx.stroke();
    }
    // keep
    ctx.beginPath();
    ctx.rect(cx - w * 0.14, gy - w * 0.42, w * 0.28, w * 0.42);
    ctx.fillStyle = grad(ctx, cx - w * 0.14, 0, cx + w * 0.14, 0, [
      [0, stone],
      [1, sh],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    crenel(cx - w * 0.14, cx + w * 0.14, gy - w * 0.42, 9);
    tower(cx - w * 0.1, w * 0.07, w * 0.56, roofB, -1);
    tower(cx + w * 0.1, w * 0.07, w * 0.56, roofB, 1);
    tower(cx, w * 0.09, w * 0.66, roofA, 1);
    tower(cx - w * 0.44, w * 0.09, w * 0.32, roofA, -1);
    tower(cx + w * 0.44, w * 0.09, w * 0.32, roofA, 1);
    tower(cx - w * 0.27, w * 0.06, w * 0.25, roofB, -1);
    tower(cx + w * 0.27, w * 0.06, w * 0.25, roofB, 1);
    // gate
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.05, gy);
    ctx.lineTo(cx - w * 0.05, gy - w * 0.09);
    ctx.arc(cx, gy - w * 0.09, w * 0.05, Math.PI, 0);
    ctx.lineTo(cx + w * 0.05, gy);
    ctx.closePath();
    fs(ctx, "#3a2414", lw);
    ctx.strokeStyle = "rgba(200,170,120,0.6)";
    ctx.lineWidth = lw * 0.6;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(cx + k * w * 0.018, gy);
      ctx.lineTo(cx + k * w * 0.018, gy - w * 0.12);
      ctx.stroke();
    }
    // window rose on the keep
    ell(ctx, cx, gy - w * 0.3, w * 0.03, w * 0.03);
    fs(ctx, "#f2c43a", lw * 0.6);
    ctx.restore();
  };
  /** Sword in a stone. gy = ground, s = unit (sword ≈ 2.2·s). */
  A.swordStone = function (ctx, cx, gy, s) {
    const lw = Math.max(1.2, s * 0.05);
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.06, gy - s * 0.4);
    ctx.lineTo(cx - s * 0.06, gy - s * 1.9);
    ctx.lineTo(cx, gy - s * 2.02);
    ctx.lineTo(cx + s * 0.06, gy - s * 1.9);
    ctx.lineTo(cx + s * 0.06, gy - s * 0.4);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, cx - s * 0.06, 0, cx + s * 0.06, 0, [
      [0, "#8a9aa4"],
      [0.5, "#ffffff"],
      [1, "#7a8a94"],
    ]);
    ctx.fill();
    fs(ctx, null, lw * 0.6);
    // swap: blade points down into the stone — draw hilt at the top
    ctx.restore();
    ctx.save();
    ctx.lineJoin = "round";
    X.rrect(ctx, cx - s * 0.36, gy - s * 1.98, s * 0.72, s * 0.1, s * 0.05);
    fs(ctx, "#d8b04a", lw * 0.7);
    ctx.beginPath();
    ctx.rect(cx - s * 0.05, gy - s * 2.4, s * 0.1, s * 0.42);
    fs(ctx, "#6a3a1a", lw * 0.7);
    ell(ctx, cx, gy - s * 2.44, s * 0.09, s * 0.09);
    fs(ctx, "#d8b04a", lw * 0.7);
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx - s * 0.8, gy],
        [cx - s * 0.7, gy - s * 0.38],
        [cx - s * 0.25, gy - s * 0.62],
        [cx + s * 0.3, gy - s * 0.58],
        [cx + s * 0.75, gy - s * 0.3],
        [cx + s * 0.85, gy],
      ],
      true,
    );
    ctx.fillStyle = grad(ctx, 0, gy - s * 0.6, 0, gy, [
      [0, "#b8b4a8"],
      [1, "#6a665a"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.restore();
  };

  // ==================================================================
  // DR. THATCHER'S MIRACLE MANE
  // ==================================================================
  /** Square apothecary bottle with shoulders, a stopper and a paper label. */
  A.tonicBottle = function (ctx, cx, top, h, labelFn, o) {
    o = o || {};
    const w = h * 0.46,
      lw = Math.max(1.2, h * 0.014),
      glass = o.glass || "#2a4a9a";
    const body = () => {
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.16, top + h * 0.12);
      ctx.lineTo(cx - w * 0.16, top + h * 0.2);
      ctx.quadraticCurveTo(
        cx - w / 2,
        top + h * 0.22,
        cx - w / 2,
        top + h * 0.32,
      );
      ctx.lineTo(cx - w / 2, top + h * 0.97);
      ctx.quadraticCurveTo(cx - w / 2, top + h, cx - w * 0.45, top + h);
      ctx.lineTo(cx + w * 0.45, top + h);
      ctx.quadraticCurveTo(cx + w / 2, top + h, cx + w / 2, top + h * 0.97);
      ctx.lineTo(cx + w / 2, top + h * 0.32);
      ctx.quadraticCurveTo(
        cx + w / 2,
        top + h * 0.22,
        cx + w * 0.16,
        top + h * 0.2,
      );
      ctx.lineTo(cx + w * 0.16, top + h * 0.12);
      ctx.closePath();
    };
    ctx.save();
    ctx.lineJoin = "round";
    body();
    ctx.fillStyle = grad(ctx, cx - w / 2, 0, cx + w / 2, 0, [
      [0, shade(glass, -0.45)],
      [0.3, shade(glass, 0.25)],
      [0.6, glass],
      [1, shade(glass, -0.5)],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.save();
    body();
    ctx.clip();
    const lx = cx - w * 0.42,
      ly = top + h * 0.42,
      lwid = w * 0.84,
      lh = h * 0.44;
    ctx.fillStyle = o.label || "#f4ecd4";
    ctx.fillRect(lx, ly, lwid, lh);
    ctx.strokeStyle = o.labelInk || "#7a2a1a";
    ctx.lineWidth = lw * 0.6;
    ctx.strokeRect(lx + lwid * 0.05, ly + lh * 0.04, lwid * 0.9, lh * 0.92);
    if (labelFn) labelFn(ctx, lx, ly, lwid, lh);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(cx - w * 0.36, top + h * 0.25, w * 0.07, h * 0.7);
    ctx.restore();
    ctx.beginPath();
    ctx.rect(cx - w * 0.2, top + h * 0.08, w * 0.4, h * 0.05);
    fs(ctx, shade(glass, 0.1), lw);
    X.rrect(ctx, cx - w * 0.14, top, w * 0.28, h * 0.1, w * 0.06);
    fs(ctx, o.stopper || "#c8a060", lw);
    ctx.restore();
  };

  // ==================================================================
  // BIG APPLE MOTOR CAB
  // ==================================================================
  A.apple = function (ctx, cx, cy, r, o) {
    o = o || {};
    const lw = Math.max(1.2, r * 0.05);
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.62);
    ctx.bezierCurveTo(
      cx + r * 0.35,
      cy - r * 0.95,
      cx + r * 1.05,
      cy - r * 0.85,
      cx + r * 0.98,
      cy - r * 0.05,
    );
    ctx.bezierCurveTo(
      cx + r * 0.92,
      cy + r * 0.7,
      cx + r * 0.45,
      cy + r,
      cx + r * 0.2,
      cy + r * 0.92,
    );
    ctx.quadraticCurveTo(cx, cy + r * 0.85, cx - r * 0.2, cy + r * 0.92);
    ctx.bezierCurveTo(
      cx - r * 0.45,
      cy + r,
      cx - r * 0.92,
      cy + r * 0.7,
      cx - r * 0.98,
      cy - r * 0.05,
    );
    ctx.bezierCurveTo(
      cx - r * 1.05,
      cy - r * 0.85,
      cx - r * 0.35,
      cy - r * 0.95,
      cx,
      cy - r * 0.62,
    );
    ctx.closePath();
    ctx.fillStyle = rgrad(ctx, cx - r * 0.35, cy - r * 0.3, r * 0.05, r * 1.2, [
      [0, o.light || "#ff6a50"],
      [0.5, o.color || "#d0201a"],
      [1, o.dark || "#7a0a08"],
    ]);
    ctx.fill();
    fs(ctx, null, lw, o.ink || INK);
    ell(ctx, cx - r * 0.45, cy - r * 0.32, r * 0.14, r * 0.24, 0.5);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fill();
    lin(
      ctx,
      cx,
      cy - r * 0.6,
      cx + r * 0.08,
      cy - r * 1.05,
      lw * 1.2,
      "#5a3a1a",
    );
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.06, cy - r * 0.85);
    ctx.quadraticCurveTo(
      cx + r * 0.45,
      cy - r * 1.25,
      cx + r * 0.75,
      cy - r * 0.95,
    );
    ctx.quadraticCurveTo(
      cx + r * 0.4,
      cy - r * 0.75,
      cx + r * 0.06,
      cy - r * 0.85,
    );
    fs(ctx, "#4a9a3a", lw * 0.8, o.ink || INK);
    ctx.restore();
  };
  /** Yellow cab: the period sedan in Big Apple Motor Cab livery (checker band, roof lamp, door roundel). */
  A.taxi = function (ctx, cx, cy, L, o) {
    o = o || {};
    A.car(ctx, cx, cy, L, {
      body: o.body || "#f2c21a",
      top: o.top || "#f6d64a",
    });
    const P = (a, b) => [cx - L / 2 + a * L, cy - b * L];
    ctx.save();
    const n = 28;
    for (let k = 0; k < n; k++)
      for (let row = 0; row < 2; row++) {
        if ((k + row) % 2) continue;
        const [px, py] = P(0.09 + (k * 0.82) / n, 0.14 - row * 0.016);
        ctx.fillStyle = "#151515";
        ctx.fillRect(px, py, (L * 0.82) / n, L * 0.016);
      }
    const [rx, ry] = P(0.53, 0.43);
    X.rrect(ctx, rx, ry, L * 0.1, L * 0.05, L * 0.012);
    ctx.fillStyle = "#fff8d8";
    ctx.fill();
    A.fs(ctx, null, L * 0.005);
    X.text(ctx, o.roof || "BIG APPLE", rx + L * 0.05, ry + L * 0.026, {
      font: "condensed",
      size: L * 0.026,
      color: "#c8201a",
      maxW: L * 0.088,
      noSafe: true,
    });
    const [dx, dy] = P(0.6, 0.2);
    A.apple(ctx, dx, dy, L * 0.03, {});
    ctx.restore();
  };

  // ==================================================================
  // THE FIRST JOURNAL
  // ==================================================================
  /** Front page of The First Journal. o: {head, sub, rot, photo:fn(ctx,x,y,w,h)} */
  A.newspaper = function (ctx, cx, cy, w, h, o) {
    o = o || {};
    const lw = Math.max(1, w * 0.004);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(o.rot || 0);
    const x = -w / 2,
      y = -h / 2;
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x + w * 0.015, y + w * 0.015, w, h);
    ctx.fillStyle = o.paper || "#f2ecdc";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = lw;
    ctx.strokeRect(x, y, w, h);
    X.text(ctx, "The First Journal", 0, y + h * 0.085, {
      font: "didone",
      size: w * 0.105,
      color: "#141210",
      maxW: w * 0.9,
      noSafe: true,
    });
    lin(
      ctx,
      x + w * 0.04,
      y + h * 0.15,
      x + w * 0.96,
      y + h * 0.15,
      lw * 2,
      "#141210",
    );
    X.text(
      ctx,
      '"YOU HEARD IT HERE FIRST."  ·  NEW YORK  ·  FIVE CENTS',
      0,
      y + h * 0.175,
      {
        font: "condensed",
        size: w * 0.026,
        color: "#3a3630",
        maxW: w * 0.9,
        noSafe: true,
      },
    );
    lin(
      ctx,
      x + w * 0.04,
      y + h * 0.195,
      x + w * 0.96,
      y + h * 0.195,
      lw,
      "#141210",
    );
    X.text(ctx, o.head || "EXTRA!", 0, y + h * 0.3, {
      font: "impact",
      size: w * 0.13,
      color: "#141210",
      maxW: w * 0.92,
      noSafe: true,
    });
    if (o.sub)
      X.text(ctx, o.sub, 0, y + h * 0.4, {
        font: "serif",
        size: w * 0.045,
        italic: true,
        color: "#2a2622",
        maxW: w * 0.9,
        noSafe: true,
      });
    const px = x + w * 0.05,
      py = y + h * 0.46,
      pw = w * 0.48,
      ph = h * 0.38;
    ctx.fillStyle = "#9a968c";
    ctx.fillRect(px, py, pw, ph);
    if (o.photo) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();
      o.photo(ctx, px, py, pw, ph);
      ctx.restore();
    }
    X.halftone(
      ctx,
      px,
      py,
      pw,
      ph,
      Math.max(3, w * 0.012),
      "#2a2620",
      0.18,
      0.4,
    );
    ctx.fillStyle = "rgba(40,36,30,0.5)";
    for (let col = 0; col < 2; col++)
      for (let k = 0; k < 14; k++) {
        const lx = x + w * (0.57 + col * 0.2),
          ly = py + (k * ph) / 14;
        ctx.fillRect(
          lx,
          ly,
          w * (0.17 - (k % 5 === 4 ? 0.06 : 0)),
          Math.max(1, h * 0.008),
        );
      }
    for (let k = 0; k < 4; k++)
      ctx.fillRect(
        px,
        py + ph + h * 0.03 + k * h * 0.025,
        pw * (k === 3 ? 0.6 : 1),
        Math.max(1, h * 0.008),
      );
    ctx.restore();
  };

  // ==================================================================
  // PACKAGED FOODS
  // ==================================================================
  /** Foil pouch (Astronaut Ice Cream): crimped top & bottom, crinkled silver, label panel drawn by labelFn. */
  A.foilPouch = function (ctx, cx, cy, w, h, labelFn, o) {
    o = o || {};
    const x = cx - w / 2,
      y = cy - h / 2,
      lw = Math.max(1.2, w * 0.015);
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.06);
    ctx.quadraticCurveTo(x - w * 0.05, cy, x, y + h * 0.94);
    ctx.lineTo(x + w, y + h * 0.94);
    ctx.quadraticCurveTo(x + w * 1.05, cy, x + w, y + h * 0.06);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, x, y, x + w, y + h, [
      [0, "#7c868e"],
      [0.25, "#f4f8fa"],
      [0.45, "#9aa4ac"],
      [0.7, "#e8eef2"],
      [1, "#6a747c"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    const rr = X.rng(X.seedOf("foil" + (o.seed || 0)));
    ctx.save();
    ctx.clip();
    ctx.lineWidth = lw * 0.5;
    for (let k = 0; k < 18; k++) {
      const sx = x + rr() * w,
        sy = y + rr() * h;
      ctx.strokeStyle =
        rr() < 0.5 ? "rgba(255,255,255,0.7)" : "rgba(40,50,60,0.3)";
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (rr() - 0.5) * w * 0.3, sy + (rr() - 0.5) * h * 0.2);
      ctx.stroke();
    }
    if (labelFn) labelFn(ctx, x + w * 0.1, y + h * 0.18, w * 0.8, h * 0.66);
    ctx.restore();
    for (const yy of [y, y + h * 0.94]) {
      ctx.beginPath();
      ctx.moveTo(x - w * 0.02, yy + h * 0.06);
      for (let k = 0; k <= 16; k++)
        ctx.lineTo(
          x - w * 0.02 + (k * w * 1.04) / 16,
          yy + (k % 2 ? 0 : h * 0.02),
        );
      ctx.lineTo(x + w * 1.02, yy + h * 0.06);
      ctx.closePath();
      ctx.fillStyle = grad(ctx, x, 0, x + w, 0, [
        [0, "#a8b0b8"],
        [0.5, "#f4f6f8"],
        [1, "#8a949c"],
      ]);
      ctx.fill();
      fs(ctx, null, lw * 0.7);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = lw * 0.4;
      for (let k = 1; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(x, yy + h * 0.02 * k);
        ctx.lineTo(x + w, yy + h * 0.02 * k);
        ctx.stroke();
      }
    }
    ctx.restore();
  };
  /** Neapolitan brick (strawberry / vanilla / chocolate), freeze-dried. */
  A.neapolitan = function (ctx, x, y, w, h) {
    const cols = ["#e88aa0", "#f6ecd0", "#6a3a1e"];
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = cols[k];
      ctx.fillRect(x + (k * w) / 3, y, w / 3 + 0.5, h);
    }
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    const rr = X.rng(7);
    for (let k = 0; k < 20; k++) ctx.fillRect(x + rr() * w, y + rr() * h, 2, 2);
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1, w * 0.02);
    ctx.strokeRect(x, y, w, h);
  };
  /** Kraft-paper jerky bag with a crimped header, label drawn by labelFn. */
  A.jerkyBag = function (ctx, cx, cy, w, h, labelFn, o) {
    o = o || {};
    const x = cx - w / 2,
      y = cy - h / 2,
      lw = Math.max(1.2, w * 0.016);
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.04, y + h * 0.12);
    ctx.quadraticCurveTo(x - w * 0.04, y + h * 0.6, x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.quadraticCurveTo(x + w * 1.04, y + h * 0.6, x + w * 0.96, y + h * 0.12);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, x, 0, x + w, 0, [
      [0, shade(o.paper || "#c89a5a", -0.25)],
      [0.4, o.paper || "#c89a5a"],
      [1, shade(o.paper || "#c89a5a", -0.35)],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.save();
    ctx.clip();
    if (labelFn) labelFn(ctx, x, y + h * 0.18, w, h * 0.8);
    ctx.restore();
    ctx.beginPath();
    ctx.rect(x + w * 0.02, y, w * 0.96, h * 0.13);
    fs(ctx, o.header || "#7a2a12", lw);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = lw * 0.5;
    for (let k = 1; k < 12; k++) {
      ctx.beginPath();
      ctx.moveTo(x + w * 0.02 + k * w * 0.08, y + h * 0.01);
      ctx.lineTo(x + w * 0.02 + k * w * 0.08, y + h * 0.12);
      ctx.stroke();
    }
    ctx.restore();
  };
  /** A strip of smoked beef jerky. */
  A.jerkyStrip = function (ctx, x, y, len, ang, seed) {
    const rr = X.rng(X.seedOf("jerky" + (seed || 0))),
      wd = len * 0.18;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang || 0);
    ctx.beginPath();
    ctx.moveTo(-len / 2, -wd * 0.4);
    for (let k = 1; k <= 6; k++)
      ctx.lineTo(-len / 2 + (k * len) / 6, -wd * (0.4 + (rr() - 0.5) * 0.4));
    for (let k = 6; k >= 0; k--)
      ctx.lineTo(-len / 2 + (k * len) / 6, wd * (0.45 + (rr() - 0.5) * 0.4));
    ctx.closePath();
    ctx.fillStyle = grad(ctx, 0, -wd, 0, wd, [
      [0, "#8a4a22"],
      [0.5, "#5a2a10"],
      [1, "#3a1808"],
    ]);
    ctx.fill();
    fs(ctx, null, Math.max(1, len * 0.02));
    ctx.strokeStyle = "rgba(200,120,70,0.45)";
    ctx.lineWidth = Math.max(1, len * 0.012);
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      ctx.moveTo(-len * 0.4 + rr() * len * 0.2, (rr() - 0.5) * wd * 0.6);
      ctx.lineTo(len * 0.1 + rr() * len * 0.3, (rr() - 0.5) * wd * 0.6);
      ctx.stroke();
    }
    ctx.restore();
  };
  /**
   * Chocolate Zeppelin: an airship-shaped chocolate snack cake with a vanilla-cream filling, piped cream
   * stripe and little foil tail fins. Horizontal, nose to the right. o.cut shows the cream inside.
   */
  A.zeppelin = function (ctx, cx, cy, L, o) {
    o = o || {};
    const ry = L * 0.19,
      lw = Math.max(1.2, L * 0.012),
      choc = o.choc || "#5a2c12";
    ctx.save();
    ctx.lineJoin = "round";
    if (o.shadow !== false) {
      ell(ctx, cx, cy + ry * 1.6, L * 0.42, ry * 0.25);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fill();
    }
    // tail fins (foil)
    const tx = cx - L * 0.42;
    const fin = (dy) => {
      ctx.beginPath();
      ctx.moveTo(tx + L * 0.12, cy + dy * ry * 0.4);
      ctx.lineTo(tx - L * 0.06, cy + dy * ry * 1.25);
      ctx.lineTo(tx - L * 0.08, cy + dy * ry * 0.2);
      ctx.closePath();
      ctx.fillStyle = grad(ctx, tx - L * 0.08, 0, tx + L * 0.12, 0, [
        [0, "#9aa4ac"],
        [0.5, "#f4f6f8"],
        [1, "#8a949c"],
      ]);
      ctx.fill();
      fs(ctx, null, lw);
    };
    fin(-1);
    fin(1);
    ell(ctx, cx, cy, L / 2, ry);
    ctx.fillStyle = rgrad(
      ctx,
      cx + L * 0.1,
      cy - ry * 0.5,
      ry * 0.2,
      L * 0.55,
      [
        [0, shade(choc, 0.35)],
        [0.5, choc],
        [1, shade(choc, -0.45)],
      ],
    );
    ctx.fill();
    fs(ctx, null, lw);
    ell(ctx, cx + L * 0.08, cy - ry * 0.55, L * 0.24, ry * 0.16, -0.05);
    ctx.fillStyle = "rgba(255,240,220,0.35)";
    ctx.fill();
    // piped vanilla stripe along the envelope
    ctx.beginPath();
    for (let k = 0; k <= 40; k++) {
      const t = k / 40,
        x = cx - L * 0.4 + t * L * 0.8,
        env = Math.sqrt(Math.max(0, 1 - ((x - cx) / (L / 2)) ** 2)),
        y = cy - ry * 0.05 + Math.sin(t * Math.PI * 9) * ry * 0.12 * env;
      if (k) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = o.cream || "#fbf2dc";
    ctx.lineWidth = Math.max(1.5, L * 0.02);
    ctx.stroke();
    // gondola
    X.rrect(ctx, cx - L * 0.07, cy + ry * 0.92, L * 0.14, ry * 0.28, ry * 0.1);
    fs(ctx, shade(choc, -0.2), lw * 0.8);
    if (o.cut) {
      const kx = cx + L * 0.5;
      ell(ctx, kx, cy, ry * 0.42, ry);
      ctx.fillStyle = "#3a1a08";
      ctx.fill();
      fs(ctx, null, lw);
      ell(ctx, kx, cy, ry * 0.36, ry * 0.86);
      ctx.fillStyle = "#7a4420";
      ctx.fill();
      ell(ctx, kx, cy, ry * 0.2, ry * 0.48);
      ctx.fillStyle = o.cream || "#fbf2dc";
      ctx.fill();
    }
    ctx.restore();
  };

  // ==================================================================
  // SUPER SERGEANT (Bowery Comics)
  // ==================================================================
  /** America's finest fighting man: olive-drab fatigues, sergeant's chevrons, steel helmet, fist up. gy = ground. */
  A.sergeant = function (ctx, cx, gy, s, o) {
    o = o || {};
    const lw = s * 0.05,
      SKIN = o.skin || "#e8b088",
      OD = o.uniform || "#5e6e3a",
      ODK = shade(o.uniform || "#5e6e3a", -0.3),
      BOOT = "#2a1e14",
      SCARF = o.scarf || "#c8201a";
    const P = (x, y) => [cx + x * s, gy - y * s];
    const poly = (pts, fill, w) => {
      ctx.beginPath();
      spline(
        ctx,
        pts.map((p) => P(p[0], p[1])),
        true,
      );
      fs(ctx, fill, w === undefined ? lw : w);
    };
    ctx.save();
    ctx.lineJoin = "round";
    // legs (wide heroic stance) + boots
    poly(
      [
        [-0.85, 0.25],
        [-0.45, 0.25],
        [-0.2, 1.6],
        [-0.05, 1.75],
        [-0.5, 1.85],
        [-0.75, 1.3],
      ],
      ODK,
    );
    poly(
      [
        [0.4, 0.25],
        [0.85, 0.25],
        [0.7, 1.3],
        [0.5, 1.85],
        [0.05, 1.75],
        [0.25, 1.4],
      ],
      OD,
    );
    poly(
      [
        [-1.0, 0],
        [-0.4, 0],
        [-0.42, 0.42],
        [-0.88, 0.42],
      ],
      BOOT,
    );
    poly(
      [
        [0.38, 0],
        [1.0, 0],
        [0.86, 0.42],
        [0.42, 0.42],
      ],
      BOOT,
    );
    // torso (broad V) + belt
    poly(
      [
        [-0.62, 1.75],
        [0.62, 1.75],
        [1.0, 3.25],
        [0.45, 3.5],
        [-0.45, 3.5],
        [-1.0, 3.25],
      ],
      OD,
    );
    ctx.beginPath();
    ctx.rect(...P(-0.66, 1.98), s * 1.32, s * 0.2);
    fs(ctx, "#6a4a22", lw * 0.7);
    ctx.beginPath();
    ctx.rect(...P(-0.12, 2.02), s * 0.24, s * 0.28);
    fs(ctx, "#d8b04a", lw * 0.6);
    // pocket flaps
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.rect(...P(sd * 0.48 - 0.2, 3.0), s * 0.4, s * 0.12);
      fs(ctx, ODK, lw * 0.6);
    }
    // chest insignia: triple chevron in a ring
    const [ix, iy] = P(0, 2.6);
    ell(ctx, ix, iy, s * 0.36, s * 0.36);
    fs(ctx, "#f2c43a", lw * 0.8);
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(ix - s * 0.24, iy - s * 0.02 + k * s * 0.13);
      ctx.lineTo(ix, iy - s * 0.18 + k * s * 0.13);
      ctx.lineTo(ix + s * 0.24, iy - s * 0.02 + k * s * 0.13);
      ctx.strokeStyle = SCARF;
      ctx.lineWidth = s * 0.07;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    // left arm: fist on hip
    poly(
      [
        [-0.95, 3.2],
        [-1.25, 2.9],
        [-1.15, 2.2],
        [-0.82, 2.15],
        [-0.86, 2.45],
        [-0.96, 2.85],
        [-0.72, 3.05],
      ],
      OD,
    );
    ell(ctx, ...P(-0.85, 2.15), s * 0.17, s * 0.16);
    fs(ctx, SKIN, lw);
    // right arm raised, fist high
    poly(
      [
        [0.7, 3.3],
        [1.0, 3.45],
        [1.38, 4.25],
        [1.22, 4.5],
        [1.0, 4.45],
        [0.98, 4.0],
        [0.62, 3.5],
      ],
      OD,
    );
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(...P(0.92 + k * 0.04, 3.62 + k * 0.12));
      ctx.lineTo(...P(1.07 + k * 0.04, 3.75 + k * 0.12));
      ctx.lineTo(...P(1.2 + k * 0.04, 3.58 + k * 0.12));
      ctx.strokeStyle = "#f2c43a";
      ctx.lineWidth = s * 0.05;
      ctx.stroke();
    }
    ell(ctx, ...P(1.2, 4.62), s * 0.22, s * 0.2);
    fs(ctx, SKIN, lw);
    lin(ctx, ...P(1.08, 4.7), ...P(1.3, 4.72), lw * 0.6);
    lin(ctx, ...P(1.08, 4.6), ...P(1.32, 4.62), lw * 0.6);
    // scarf
    poly(
      [
        [-0.35, 3.45],
        [0.35, 3.45],
        [0.3, 3.25],
        [0.1, 3.18],
        [-0.1, 3.18],
        [-0.3, 3.25],
      ],
      SCARF,
    );
    poly(
      [
        [0.25, 3.3],
        [0.75, 3.05],
        [0.95, 3.15],
        [0.7, 3.35],
        [0.35, 3.42],
      ],
      SCARF,
    );
    // head: square jaw, helmet
    ctx.beginPath();
    ctx.rect(...P(-0.16, 3.7), s * 0.32, s * 0.26);
    fs(ctx, SKIN, lw);
    ctx.beginPath();
    spline(
      ctx,
      [
        P(-0.3, 4.15),
        P(-0.3, 3.85),
        P(-0.22, 3.68),
        P(0, 3.62),
        P(0.22, 3.68),
        P(0.3, 3.85),
        P(0.3, 4.15),
      ],
      true,
    );
    fs(ctx, SKIN, lw);
    lin(ctx, ...P(-0.16, 3.98), ...P(-0.05, 3.96), lw);
    lin(ctx, ...P(0.05, 3.96), ...P(0.16, 3.98), lw);
    ell(ctx, ...P(-0.11, 3.92), s * 0.03, s * 0.025);
    fs(ctx, INK);
    ell(ctx, ...P(0.11, 3.92), s * 0.03, s * 0.025);
    fs(ctx, INK);
    lin(ctx, ...P(-0.1, 3.74), ...P(0.12, 3.76), lw * 0.8);
    lin(ctx, ...P(0, 3.72), ...P(0, 3.66), lw * 0.5);
    ctx.beginPath();
    ctx.moveTo(...P(-0.42, 4.08));
    ctx.quadraticCurveTo(...P(-0.4, 4.5), ...P(0, 4.52));
    ctx.quadraticCurveTo(...P(0.4, 4.5), ...P(0.42, 4.08));
    ctx.quadraticCurveTo(...P(0, 4.0), ...P(-0.42, 4.08));
    ctx.closePath();
    ctx.fillStyle = grad(ctx, cx - s * 0.4, 0, cx + s * 0.4, 0, [
      [0, ODK],
      [0.4, shade(o.uniform || "#5e6e3a", 0.2)],
      [1, ODK],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    const [hx, hy] = P(0, 4.28);
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      ctx.moveTo(hx - s * 0.12, hy + k * s * 0.08);
      ctx.lineTo(hx, hy - s * 0.08 + k * s * 0.08);
      ctx.lineTo(hx + s * 0.12, hy + k * s * 0.08);
      ctx.strokeStyle = "#f2c43a";
      ctx.lineWidth = s * 0.04;
      ctx.stroke();
    }
    lin(ctx, ...P(-0.3, 4.05), ...P(-0.26, 3.78), lw * 0.5, "#3a3a2a");
    lin(ctx, ...P(0.3, 4.05), ...P(0.26, 3.78), lw * 0.5, "#3a3a2a");
    ctx.restore();
  };

  // ==================================================================
  // EMBLEMS
  // ==================================================================
  /** Eagle Motors emblem: an eagle head over swept chrome wings. */
  A.eagle = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = Math.max(1.2, s * 0.04),
      metal = o.metal || "#d8dde2",
      ink = o.ink || INK;
    ctx.save();
    ctx.lineJoin = "round";
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + sd * s * 0.2, cy - s * 0.05);
      ctx.quadraticCurveTo(
        cx + sd * s * 0.9,
        cy - s * 0.5,
        cx + sd * s * 1.6,
        cy - s * 0.35,
      );
      for (let k = 0; k < 5; k++) {
        const t = k / 4;
        ctx.lineTo(
          cx + sd * s * (1.5 - t * 1.05),
          cy - s * (0.22 - t * 0.12) + s * 0.12,
        );
        ctx.lineTo(cx + sd * s * (1.42 - t * 1.05), cy - s * (0.25 - t * 0.12));
      }
      ctx.lineTo(cx + sd * s * 0.2, cy + s * 0.25);
      ctx.closePath();
      ctx.fillStyle = grad(ctx, cx, cy - s * 0.5, cx, cy + s * 0.3, [
        [0, "#ffffff"],
        [0.5, metal],
        [1, shade(metal, -0.4)],
      ]);
      ctx.fill();
      fs(ctx, null, lw, ink);
    }
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx - s * 0.22, cy + s * 0.35],
        [cx - s * 0.26, cy - s * 0.2],
        [cx - s * 0.05, cy - s * 0.5],
        [cx + s * 0.28, cy - s * 0.42],
        [cx + s * 0.5, cy - s * 0.3],
        [cx + s * 0.25, cy - s * 0.18],
        [cx + s * 0.2, cy + s * 0.35],
      ],
      true,
    );
    ctx.fillStyle = o.head || "#f8f6f0";
    ctx.fill();
    fs(ctx, null, lw, ink);
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.28, cy - s * 0.42);
    ctx.quadraticCurveTo(
      cx + s * 0.55,
      cy - s * 0.42,
      cx + s * 0.56,
      cy - s * 0.22,
    );
    ctx.lineTo(cx + s * 0.4, cy - s * 0.26);
    ctx.lineTo(cx + s * 0.25, cy - s * 0.3);
    ctx.closePath();
    fs(ctx, o.beak || "#e8b030", lw, ink);
    ell(ctx, cx + s * 0.12, cy - s * 0.33, s * 0.04, s * 0.04);
    fs(ctx, ink);
    ctx.restore();
  };
  /** American Automaton Co. roundel: "AA" monogram in a ring with an orbit swash. */
  A.automatonMark = function (ctx, cx, cy, r, fill, ink) {
    ctx.save();
    ell(ctx, cx, cy, r, r);
    fs(ctx, fill || "#1e3a6a", r * 0.08, ink || INK);
    ell(ctx, cx, cy, r * 0.84, r * 0.84);
    fs(ctx, null, r * 0.05, ink === undefined ? "#f4ecd8" : "#f4ecd8");
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.35, r * 0.34, -0.35, 0, TAU);
    ctx.strokeStyle = "#c8201a";
    ctx.lineWidth = r * 0.1;
    ctx.stroke();
    X.text(ctx, "AA", cx, cy + r * 0.04, {
      font: "deco",
      size: r * 0.95,
      color: "#f4ecd8",
      spacing: -r * 0.04,
      maxW: r * 1.5,
      noSafe: true,
    });
    ctx.restore();
  };
  /** Hi-Octane Harry's roundel: a winged wheel with an H and a checkered rim. */
  A.harryMark = function (ctx, cx, cy, r, o) {
    o = o || {};
    const lw = Math.max(1.2, r * 0.06);
    ctx.save();
    ctx.lineJoin = "round";
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + sd * r * 0.8, cy - r * 0.15);
      for (let k = 0; k < 4; k++) {
        ctx.lineTo(cx + sd * r * (1.9 - k * 0.22), cy - r * (0.55 - k * 0.22));
        ctx.lineTo(cx + sd * r * (1.3 - k * 0.12), cy - r * (0.3 - k * 0.2));
      }
      ctx.lineTo(cx + sd * r * 0.8, cy + r * 0.35);
      ctx.closePath();
      fs(ctx, o.wing || "#f4f0e0", lw);
    }
    ell(ctx, cx, cy, r, r);
    fs(ctx, "#151515", lw);
    const n = 16;
    for (let k = 0; k < n; k++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r * 0.95, (k / n) * TAU, ((k + 1) / n) * TAU);
      ctx.closePath();
      ctx.fillStyle = k % 2 ? "#151515" : "#f4f0e0";
      ctx.fill();
    }
    ell(ctx, cx, cy, r * 0.74, r * 0.74);
    fs(ctx, o.fill || "#d8261a", lw);
    X.text(ctx, "H", cx, cy + r * 0.04, {
      font: "impact",
      size: r * 1.05,
      color: "#ffd23a",
      stroke: INK,
      strokeW: r * 0.08,
      maxW: r * 1.2,
      noSafe: true,
    });
    ctx.restore();
  };
})();
