// play-inline-13 05 — ctx
// Lines 1202-1504 of readable/play-inline-13.pretty.js (statement-aligned).
  A.pillBottle = function (ctx, cx, cy, w, h, labelFn) {
    const lw = w * 0.03,
      x = cx - w / 2,
      y = cy - h / 2;
    ctx.save();
    X.rrect(ctx, x, y + h * 0.18, w, h * 0.82, w * 0.12);
    ctx.fillStyle = grad(ctx, x, 0, x + w, 0, [
      [0, "#6a3a0a"],
      [0.35, "#d8902a"],
      [1, "#5a2a06"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    X.rrect(ctx, x - w * 0.05, y, w * 1.1, h * 0.22, w * 0.06);
    ctx.fillStyle = grad(ctx, x, 0, x + w, 0, [
      [0, "#b8b8b0"],
      [0.4, "#ffffff"],
      [1, "#9a9a94"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    for (let k = 1; k < 10; k++)
      lin(
        ctx,
        x - w * 0.05 + k * w * 0.11,
        y + h * 0.02,
        x - w * 0.05 + k * w * 0.11,
        y + h * 0.2,
        lw * 0.4,
        "rgba(0,0,0,0.25)",
      );
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y + h * 0.35, w, h * 0.5);
    ctx.clip();
    ctx.fillStyle = "#f4f0e0";
    ctx.fillRect(x, y + h * 0.35, w, h * 0.5);
    if (labelFn) labelFn(ctx, x, y + h * 0.35, w, h * 0.5);
    ctx.restore();
    lin(ctx, x, y + h * 0.35, x + w, y + h * 0.35, lw * 0.6);
    lin(ctx, x, y + h * 0.85, x + w, y + h * 0.85, lw * 0.6);
    ctx.restore();
  };

  // ==================================================================
  // MACHINES
  // ==================================================================
  /** The Valet (household robot): boxy torso on ONE wheel, two jointed arms, flat-topped head with lamp eyes. cy = torso centre. */
  A.valet = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = s * 0.045,
      body = o.body || "#e4dcc6",
      trim = o.trim || "#c0392b",
      eye = o.eye || "#ffc04a";
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.22, cy + s * 0.7);
    ctx.lineTo(cx - s * 0.12, cy + s * 1.45);
    ctx.lineTo(cx + s * 0.12, cy + s * 1.45);
    ctx.lineTo(cx + s * 0.22, cy + s * 0.7);
    ctx.closePath();
    fs(ctx, "#7a7c78", lw);
    ell(ctx, cx, cy + s * 1.55, s * 0.36, s * 0.36);
    fs(ctx, "#1e1e1e", lw);
    ell(ctx, cx, cy + s * 1.55, s * 0.17, s * 0.17);
    ctx.fillStyle = rgrad(ctx, cx - s * 0.05, cy + s * 1.5, 1, s * 0.17, [
      [0, "#ffffff"],
      [1, "#8a9090"],
    ]);
    ctx.fill();
    fs(ctx, null, lw * 0.6);
    const arm = (sd, hold) => {
      const sx = cx + sd * s * 0.62,
        sy = cy - s * 0.35,
        ex = cx + sd * s * 1.05,
        ey = cy + s * 0.15;
      const hx = cx + sd * s * (hold === "tray" ? 1.25 : 0.95),
        hy = cy + (hold === "tray" ? -s * 0.25 : s * 0.62);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.lineTo(hx, hy);
      ctx.strokeStyle = INK;
      ctx.lineWidth = s * 0.17;
      ctx.stroke();
      ctx.strokeStyle = "#a8aaa4";
      ctx.lineWidth = s * 0.1;
      ctx.stroke();
      for (const [jx, jy] of [
        [sx, sy],
        [ex, ey],
      ]) {
        ell(ctx, jx, jy, s * 0.11, s * 0.11);
        fs(ctx, trim, lw * 0.6);
      }
      if (hold === "tray") {
        ctx.beginPath();
        ctx.rect(hx - s * 0.42, hy - s * 0.06, s * 0.84, s * 0.08);
        fs(ctx, "#d8dcd8", lw * 0.6);
        ctx.beginPath();
        ctx.moveTo(hx - s * 0.2, hy - s * 0.06);
        ctx.lineTo(hx - s * 0.16, hy - s * 0.38);
        ctx.lineTo(hx - s * 0.04, hy - s * 0.38);
        ctx.lineTo(hx, hy - s * 0.06);
        ctx.closePath();
        fs(ctx, "rgba(240,200,120,0.85)", lw * 0.5);
      } else {
        for (const d of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.quadraticCurveTo(
            hx + d * s * 0.16,
            hy + s * 0.1,
            hx + d * s * 0.06,
            hy + s * 0.24,
          );
          fs(ctx, null, s * 0.06);
        }
      }
    };
    arm(-1, "grip");
    arm(1, o.hold || "tray");
    X.rrect(ctx, cx - s * 0.65, cy - s * 0.7, s * 1.3, s * 1.45, s * 0.16);
    ctx.fillStyle = grad(ctx, cx - s * 0.65, 0, cx + s * 0.65, 0, [
      [0, X.css(X.shade(body, 0.25))],
      [0.5, body],
      [1, X.css(X.shade(body, -0.3))],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.fillStyle = trim;
    ctx.fillRect(cx - s * 0.65 + lw / 2, cy - s * 0.05, s * 1.3 - lw, s * 0.16);
    for (let k = 0; k < 4; k++)
      lin(
        ctx,
        cx - s * 0.38,
        cy + s * (0.28 + k * 0.1),
        cx + s * 0.1,
        cy + s * (0.28 + k * 0.1),
        lw * 0.6,
        "rgba(0,0,0,0.45)",
      );
    ell(ctx, cx + s * 0.36, cy + s * 0.4, s * 0.13, s * 0.13);
    fs(ctx, "#f4f0e0", lw * 0.6);
    lin(
      ctx,
      cx + s * 0.36,
      cy + s * 0.4,
      cx + s * 0.44,
      cy + s * 0.33,
      lw * 0.5,
    );
    ell(ctx, cx - s * 0.35, cy - s * 0.42, s * 0.06, s * 0.06);
    fs(ctx, "#7ad06a", lw * 0.4);
    ell(ctx, cx - s * 0.18, cy - s * 0.42, s * 0.06, s * 0.06);
    fs(ctx, "#e8402a", lw * 0.4);
    ctx.beginPath();
    ctx.rect(cx - s * 0.12, cy - s * 0.86, s * 0.24, s * 0.18);
    fs(ctx, "#8a8c88", lw * 0.7);
    X.rrect(ctx, cx - s * 0.42, cy - s * 1.36, s * 0.84, s * 0.52, s * 0.08);
    ctx.fillStyle = grad(ctx, 0, cy - s * 1.36, 0, cy - s * 0.84, [
      [0, X.css(X.shade(body, 0.3))],
      [1, X.css(X.shade(body, -0.2))],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    for (const d of [-1, 1]) {
      ell(ctx, cx + d * s * 0.18, cy - s * 1.14, s * 0.11, s * 0.11);
      fs(ctx, "#2a2a28", lw * 0.6);
      ell(ctx, cx + d * s * 0.18, cy - s * 1.14, s * 0.07, s * 0.07);
      ctx.fillStyle = rgrad(
        ctx,
        cx + d * s * 0.18,
        cy - s * 1.14,
        1,
        s * 0.07,
        [
          [0, "#fffbe0"],
          [1, eye],
        ],
      );
      ctx.fill();
    }
    for (let k = 0; k < 3; k++)
      lin(
        ctx,
        cx - s * 0.16,
        cy - s * (0.98 - k * 0.035),
        cx + s * 0.16,
        cy - s * (0.98 - k * 0.035),
        lw * 0.4,
        "rgba(0,0,0,0.5)",
      );
    ctx.beginPath();
    ctx.rect(cx - s * 0.3, cy - s * 1.44, s * 0.6, s * 0.08);
    fs(ctx, trim, lw * 0.6);
    ctx.restore();
  };
  /** Patrolman (police robot): square head with a peaked brim plate and visor slit, slab torso with a shield badge, twin tracks. */
  A.patrolman = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = s * 0.045,
      paint = o.paint || "#2c3e5c",
      trim = o.trim || "#c8ccd0",
      visor = o.visor || "#ff6a3a";
    ctx.save();
    ctx.lineJoin = "round";
    for (const d of [-1, 1]) {
      X.rrect(
        ctx,
        cx + d * s * 0.42 - s * 0.24,
        cy + s * 1.0,
        s * 0.48,
        s * 0.95,
        s * 0.12,
      );
      fs(ctx, "#2a2a28", lw);
      for (let k = 0; k < 6; k++)
        lin(
          ctx,
          cx + d * s * 0.42 - s * 0.22,
          cy + s * (1.08 + k * 0.14),
          cx + d * s * 0.42 + s * 0.22,
          cy + s * (1.08 + k * 0.14),
          lw * 0.5,
          "#5a5a56",
        );
    }
    for (const d of [-1, 1]) {
      const ax = cx + d * s * 0.82;
      X.rrect(ctx, ax - s * 0.14, cy - s * 0.45, s * 0.28, s * 1.15, s * 0.1);
      fs(ctx, trim, lw);
      lin(
        ctx,
        ax - s * 0.14,
        cy + s * 0.1,
        ax + s * 0.14,
        cy + s * 0.1,
        lw * 0.7,
      );
      X.rrect(ctx, ax - s * 0.17, cy + s * 0.68, s * 0.34, s * 0.22, s * 0.05);
      fs(ctx, "#4a4a46", lw);
    }
    X.rrect(ctx, cx - s * 0.68, cy - s * 0.6, s * 1.36, s * 1.65, s * 0.1);
    ctx.fillStyle = grad(ctx, cx - s * 0.68, 0, cx + s * 0.68, 0, [
      [0, X.css(X.shade(paint, 0.25))],
      [1, X.css(X.shade(paint, -0.35))],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.22, cy - s * 0.3);
    ctx.lineTo(cx + s * 0.22, cy - s * 0.3);
    ctx.lineTo(cx + s * 0.22, cy - s * 0.02);
    ctx.quadraticCurveTo(cx + s * 0.2, cy + s * 0.18, cx, cy + s * 0.28);
    ctx.quadraticCurveTo(
      cx - s * 0.2,
      cy + s * 0.18,
      cx - s * 0.22,
      cy - s * 0.02,
    );
    ctx.closePath();
    fs(ctx, "#e0b84a", lw * 0.7);
    X.star(ctx, cx, cy - s * 0.04, s * 0.1, "#7a5a1a");
    for (let k = 0; k < 3; k++)
      lin(
        ctx,
        cx - s * 0.45,
        cy + s * (0.55 + k * 0.13),
        cx + s * 0.45,
        cy + s * (0.55 + k * 0.13),
        lw * 0.5,
        "rgba(0,0,0,0.4)",
      );
    X.rrect(ctx, cx - s * 0.4, cy - s * 1.2, s * 0.8, s * 0.56, s * 0.06);
    fs(ctx, trim, lw);
    ctx.beginPath();
    ctx.rect(cx - s * 0.32, cy - s * 1.0, s * 0.64, s * 0.12);
    ctx.fillStyle = "#141414";
    ctx.fill();
    ctx.save();
    ctx.shadowColor = visor;
    ctx.shadowBlur = s * 0.2;
    ctx.fillStyle = visor;
    ctx.fillRect(cx - s * 0.28, cy - s * 0.97, s * 0.56, s * 0.06);
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.5, cy - s * 1.18);
    ctx.lineTo(cx + s * 0.5, cy - s * 1.18);
    ctx.lineTo(cx + s * 0.36, cy - s * 1.08);
    ctx.lineTo(cx - s * 0.36, cy - s * 1.08);
    ctx.closePath();
    fs(ctx, "#1a1a1a", lw * 0.7);
    ctx.beginPath();
    ctx.rect(cx - s * 0.38, cy - s * 1.42, s * 0.76, s * 0.24);
    fs(ctx, paint, lw);
    ell(ctx, cx, cy - s * 1.3, s * 0.07, s * 0.07);
    fs(ctx, "#e0b84a", lw * 0.5);
    ctx.restore();
  };
  /** VIGIL field goggles: twin round lenses in rubber cups, bridge, strap, brow lamp; lenses glow cyan-white. */
