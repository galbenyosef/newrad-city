// play-inline-14 03 — ctx
// Lines 618-903 of readable/play-inline-14.pretty.js (statement-aligned).
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
