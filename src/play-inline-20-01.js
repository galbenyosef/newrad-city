// play-inline-20 01 — ctx
// Lines 26-298 of readable/play-inline-20.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._tx;
  const A = X.art;
  const K = X.adkit;
  const TAU = Math.PI * 2;
  const INK = "#1d1712";

  // ------------------------------------------------------------------
  // Shared drawing
  // ------------------------------------------------------------------
  /** A hand-drawn twelve-ray sun (doodle / chalk / spray): circle + 12 straight rays, a little wobble. */
  function sunRays(ctx, cx, cy, rad, col, lw, r, o) {
    o = o || {};
    const wob = o.wobble === undefined ? 0.06 : o.wobble,
      rot = o.rot || -Math.PI / 2;
    ctx.save();
    ctx.strokeStyle = X.css(col);
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * TAU,
        k = 1 + (r() - 0.5) * wob;
      const px = cx + Math.cos(a) * rad * 0.5 * k,
        py = cy + Math.sin(a) * rad * 0.5 * k;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = rot + (i / 12) * TAU + (r() - 0.5) * wob * 0.5,
        r0 = rad * (0.62 + (r() - 0.5) * wob),
        r1 = rad * (0.95 + (r() - 0.5) * wob * 2);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.stroke();
    }
    if (o.dot) {
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 0.08, 0, TAU);
      ctx.fillStyle = X.css(col);
      ctx.fill();
    }
    ctx.restore();
  }
  A.sunRays = sunRays;
  /** Typewritten lines (left aligned) from y, step dy. */
  function typed(ctx, lines, x, y, dy, size, col, maxW) {
    lines.forEach((l, i) =>
      X.text(ctx, l, x, y + i * dy, {
        font: "typewriter",
        size,
        color: col || INK,
        align: "left",
        weight: "normal",
        maxW: maxW || 360,
      }),
    );
  }
  /** Pencil/charcoal portrait of a young woman (three-quarter, dark wavy hair, a small gap between the front teeth). */
  function sketchWoman(ctx, cx, cy, s, r) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const pen = (a, w) => {
      ctx.strokeStyle = "rgba(30,26,24," + a + ")";
      ctx.lineWidth = w;
    };
    // hair mass (behind): a dark wavy shoulder-length silhouette, then curved strokes following it
    ctx.fillStyle = "rgba(46,40,36,0.55)";
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.05, cy - s * 0.66);
    ctx.bezierCurveTo(
      cx - s * 0.62,
      cy - s * 0.62,
      cx - s * 0.62,
      cy + s * 0.1,
      cx - s * 0.58,
      cy + s * 0.55,
    );
    ctx.quadraticCurveTo(
      cx - s * 0.5,
      cy + s * 0.72,
      cx - s * 0.32,
      cy + s * 0.62,
    );
    ctx.lineTo(cx + s * 0.4, cy + s * 0.6);
    ctx.quadraticCurveTo(
      cx + s * 0.6,
      cy + s * 0.68,
      cx + s * 0.6,
      cy + s * 0.45,
    );
    ctx.bezierCurveTo(
      cx + s * 0.66,
      cy + s * 0.05,
      cx + s * 0.6,
      cy - s * 0.66,
      cx - s * 0.05,
      cy - s * 0.66,
    );
    ctx.fill();
    for (let k = 0; k < 70; k++) {
      const side = k % 2 ? 1 : -1,
        t = r(),
        x0 = cx + side * s * (0.12 + t * 0.36),
        y0 = cy - s * (0.62 - t * 0.12);
      pen(0.25 + r() * 0.35, 0.8 + r() * 1.2);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(
        x0 + side * s * 0.18,
        y0 + s * 0.3,
        x0 + side * s * (0.02 + r() * 0.1),
        y0 + s * 0.65,
        x0 + side * s * (0.08 + r() * 0.12),
        y0 + s * (0.95 + r() * 0.3),
      );
      ctx.stroke();
    }
    // face oval
    ctx.fillStyle = "rgba(230,222,205,0.9)";
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.03, cy, s * 0.4, s * 0.52, 0.05, 0, TAU);
    ctx.fill();
    pen(0.7, 2.2);
    ctx.beginPath();
    ctx.ellipse(
      cx + s * 0.03,
      cy,
      s * 0.4,
      s * 0.52,
      0.05,
      Math.PI * 0.05,
      Math.PI * 0.95,
    );
    ctx.stroke();
    // fringe swept to one side
    for (let k = 0; k < 22; k++) {
      const x0 = cx - s * 0.3 + k * s * 0.03;
      pen(0.3 + r() * 0.3, 1 + r());
      ctx.beginPath();
      ctx.moveTo(x0, cy - s * 0.6);
      ctx.quadraticCurveTo(
        x0 + s * 0.2,
        cy - s * 0.52,
        x0 + s * (0.34 + r() * 0.08),
        cy - s * (0.36 + r() * 0.06),
      );
      ctx.stroke();
    }
    // brows, eyes
    for (const d of [-1, 1]) {
      const ex = cx + s * 0.03 + d * s * 0.17,
        ey = cy - s * 0.1;
      pen(0.8, 2.6);
      ctx.beginPath();
      ctx.moveTo(ex - s * 0.1, ey - s * 0.09);
      ctx.quadraticCurveTo(ex, ey - s * 0.14, ex + s * 0.1, ey - s * 0.08);
      ctx.stroke();
      pen(0.85, 1.8);
      ctx.beginPath();
      ctx.ellipse(ex, ey, s * 0.075, s * 0.035, 0, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(20,16,14,0.85)";
      ctx.beginPath();
      ctx.arc(ex + s * 0.01, ey, s * 0.024, 0, TAU);
      ctx.fill();
    }
    // nose
    pen(0.55, 1.6);
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.04, cy - s * 0.04);
    ctx.lineTo(cx + s * 0.07, cy + s * 0.12);
    ctx.quadraticCurveTo(
      cx + s * 0.03,
      cy + s * 0.16,
      cx - s * 0.01,
      cy + s * 0.13,
    );
    ctx.stroke();
    // mouth: a half smile, two front teeth with a gap
    const my = cy + s * 0.27;
    pen(0.8, 2);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.13, my);
    ctx.quadraticCurveTo(
      cx + s * 0.03,
      my + s * 0.07,
      cx + s * 0.18,
      my - s * 0.02,
    );
    ctx.stroke();
    ctx.fillStyle = "rgba(245,240,228,0.95)";
    ctx.fillRect(cx - s * 0.03, my + s * 0.004, s * 0.04, s * 0.03);
    ctx.fillRect(cx + s * 0.025, my + s * 0.004, s * 0.04, s * 0.03);
    pen(0.5, 1);
    ctx.strokeRect(cx - s * 0.03, my + s * 0.004, s * 0.04, s * 0.03);
    ctx.strokeRect(cx + s * 0.025, my + s * 0.004, s * 0.04, s * 0.03);
    // the jaw drawn a little too square (Rose: "They drew her chin wrong")
    pen(0.6, 2);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy + s * 0.3);
    ctx.lineTo(cx - s * 0.1, cy + s * 0.5);
    ctx.lineTo(cx + s * 0.18, cy + s * 0.5);
    ctx.lineTo(cx + s * 0.38, cy + s * 0.28);
    ctx.stroke();
    // neck + collar
    pen(0.5, 2);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, cy + s * 0.52);
    ctx.lineTo(cx - s * 0.14, cy + s * 0.75);
    ctx.moveTo(cx + s * 0.16, cy + s * 0.52);
    ctx.lineTo(cx + s * 0.18, cy + s * 0.75);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.5, cy + s * 0.95);
    ctx.lineTo(cx - s * 0.14, cy + s * 0.75);
    ctx.lineTo(cx, cy + s * 0.92);
    ctx.lineTo(cx + s * 0.18, cy + s * 0.75);
    ctx.lineTo(cx + s * 0.55, cy + s * 0.95);
    ctx.stroke();
    // cross-hatching on the shadow side
    pen(0.18, 1);
    for (let k = 0; k < 26; k++) {
      const y = cy - s * 0.35 + k * s * 0.03;
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.22, y);
      ctx.lineTo(cx + s * 0.4, y + s * 0.12);
      ctx.stroke();
    }
    ctx.restore();
  }
  function stamp(ctx, text, x, y, rot, col, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = 0.75;
    X.setFont(ctx, text, size, "stencil", 360, "bold");
    const w = ctx.measureText(text).width;
    ctx.strokeStyle = col;
    ctx.lineWidth = size * 0.1;
    ctx.strokeRect(
      -w / 2 - size * 0.3,
      -size * 0.75,
      w + size * 0.6,
      size * 1.5,
    );
    X.text(ctx, text, 0, 0, {
      font: "stencil",
      size,
      color: col,
      noSafe: true,
    });
    ctx.restore();
  }
  function paperBg(ctx, col, r) {
    K.bg(ctx, 400, 600, "solid", col);
    X.blotches(ctx, 400, 600, r, {
      count: 10,
      color: "#6a5030",
      alpha: 0.12,
      rmin: 20,
      rmax: 90,
    });
  }

  // ------------------------------------------------------------------
  // POSTERS
  // ------------------------------------------------------------------
