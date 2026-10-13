// play-inline-14 07 — ctx
// Lines 1845-1974 of readable/play-inline-14.pretty.js (statement-aligned).
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
