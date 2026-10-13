// play-inline-13 03 — ctx
// Lines 608-882 of readable/play-inline-13.pretty.js (statement-aligned).
  A.fizzoBottle = function (ctx, cx, top, h, o) {
    o = o || {};
    const blue = !!o.blue,
      lw = h * 0.016;
    ctx.save();
    profile(ctx, cx, top, h, h, FIZZO_PROF);
    const liquid = blue
      ? [
          [0, "#c8f6ff"],
          [0.45, "#36bce8"],
          [1, "#0b3a84"],
        ]
      : [
          [0, "#8a3416"],
          [0.5, "#46160a"],
          [1, "#1c0704"],
        ];
    ctx.fillStyle = grad(ctx, cx - 0.12 * h, 0, cx + 0.12 * h, 0, liquid);
    ctx.fill();
    if (blue) {
      ctx.save();
      ctx.shadowColor = "#5ad8ff";
      ctx.shadowBlur = Math.min(26, h * 0.07);
      ctx.strokeStyle = "rgba(150,235,255,0.9)";
      ctx.lineWidth = lw * 1.4;
      ctx.stroke();
      ctx.restore();
    }
    fs(ctx, null, lw);
    ctx.save();
    profile(ctx, cx, top, h, h, FIZZO_PROF);
    ctx.clip();
    ctx.fillStyle = blue ? "rgba(220,250,255,0.55)" : "rgba(210,230,220,0.45)";
    ctx.fillRect(cx - 0.1 * h, top, 0.2 * h, 0.12 * h); // headspace
    for (let y = top + 0.5 * h; y < top + 0.97 * h; y += 0.034 * h) {
      // ring ribs
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillRect(cx - 0.13 * h, y, 0.26 * h, 0.008 * h);
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(cx - 0.13 * h, y + 0.008 * h, 0.26 * h, 0.006 * h);
    }
    const rr = X.rng(X.seedOf("fizzo" + (blue ? "b" : "c")));
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = Math.max(1, h * 0.004);
    for (let k = 0; k < 18; k++) {
      const bx = cx + (rr() - 0.5) * 0.18 * h,
        by = top + (0.15 + rr() * 0.8) * h;
      ctx.beginPath();
      ctx.arc(bx, by, h * (0.005 + rr() * 0.01), 0, TAU);
      ctx.stroke();
    }
    const ly = top + 0.66 * h,
      ink = blue ? "#1a5aa8" : "#c8241c";
    ell(ctx, cx, ly, 0.105 * h, 0.075 * h);
    fs(ctx, "#f6eed8", lw * 0.6);
    ell(ctx, cx, ly, 0.092 * h, 0.062 * h);
    fs(ctx, null, lw * 0.4, ink);
    X.text(ctx, "Fizzo", cx, ly - 0.004 * h, {
      font: "script",
      size: 0.06 * h,
      weight: "normal",
      color: ink,
      maxW: 0.17 * h,
      noSafe: true,
    });
    X.text(ctx, blue ? "BLUE" : "COLA", cx, ly + 0.04 * h, {
      font: "condensed",
      size: 0.022 * h,
      color: "#1d3a3a",
      spacing: 2,
      maxW: 0.12 * h,
      noSafe: true,
    });
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    ctx.fillRect(cx - 0.085 * h, top, 0.022 * h, h);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(cx + 0.06 * h, top, 0.012 * h, h);
    ctx.restore();
    ctx.beginPath();
    ctx.rect(cx - 0.058 * h, top - 0.03 * h, 0.116 * h, 0.04 * h);
    fs(ctx, blue ? "#e8f4f8" : "#2a8a84", lw * 0.8);
    for (let k = 0; k < 6; k++)
      lin(
        ctx,
        cx - 0.05 * h + k * 0.02 * h,
        top - 0.026 * h,
        cx - 0.05 * h + k * 0.02 * h,
        top + 0.006 * h,
        lw * 0.35,
        "rgba(0,0,0,0.35)",
      );
    ctx.restore();
  };
  /** Stubby brown root-beer bottle with a wheat-sheaf label. */
  const AMBER_PROF = [
    [0, 0.055],
    [0.05, 0.055],
    [0.09, 0.05],
    [0.24, 0.056],
    [0.38, 0.14],
    [0.48, 0.165],
    [0.95, 0.165],
    [1, 0.155],
  ];
  A.amberBottle = function (ctx, cx, top, h, o) {
    o = o || {};
    const lw = h * 0.018;
    ctx.save();
    profile(ctx, cx, top, h, h, AMBER_PROF);
    ctx.fillStyle = grad(ctx, cx - h * 0.17, 0, cx + h * 0.17, 0, [
      [0, "#7a4416"],
      [0.4, "#4e2408"],
      [1, "#220e02"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.save();
    profile(ctx, cx, top, h, h, AMBER_PROF);
    ctx.clip();
    const ly = top + 0.56 * h,
      lh = 0.26 * h;
    ctx.fillStyle = o.label || "#f2e2b4";
    ctx.fillRect(cx - h * 0.17, ly, h * 0.34, lh);
    ctx.fillStyle = o.band || "#7a2a12";
    ctx.fillRect(cx - h * 0.17, ly + lh * 0.7, h * 0.34, lh * 0.18);
    ctx.strokeStyle = "#b8862a";
    ctx.lineWidth = Math.max(1, h * 0.006);
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(cx, ly + lh * 0.62);
      ctx.quadraticCurveTo(
        cx + k * h * 0.012,
        ly + lh * 0.4,
        cx + k * h * 0.03,
        ly + lh * 0.14,
      );
      ctx.stroke();
      ell(ctx, cx + k * h * 0.03, ly + lh * 0.14, h * 0.008, h * 0.02, k * 0.3);
      ctx.fillStyle = "#d8a83a";
      ctx.fill();
    }
    X.text(ctx, o.text || "PRAIRIE", cx, ly + lh * 0.79, {
      font: "slab",
      size: h * 0.032,
      color: "#f2e2b4",
      maxW: h * 0.3,
      noSafe: true,
    });
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(cx - h * 0.1, top, h * 0.035, h);
    ctx.restore();
    ctx.beginPath();
    ctx.rect(cx - 0.07 * h, top - 0.03 * h, 0.14 * h, 0.05 * h);
    fs(ctx, "#c8a040", lw);
    ctx.restore();
  };
  /** Hypodermic auto-injector: white pen body, red band with a cross, thumb plunger, needle guard; along angle ang. */
  A.injector = function (ctx, cx, cy, L, ang, o) {
    o = o || {};
    const lw = L * 0.02;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang || 0);
    X.rrect(ctx, -L * 0.5, -L * 0.03, L * 0.12, L * 0.06, L * 0.01);
    fs(ctx, "#5a5e60", lw);
    X.rrect(ctx, -L * 0.4, -L * 0.075, L * 0.72, L * 0.15, L * 0.06);
    ctx.fillStyle = grad(ctx, 0, -L * 0.075, 0, L * 0.075, [
      [0, "#ffffff"],
      [0.5, "#e8ecec"],
      [1, "#a8b0b0"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.fillStyle = o.band || "#c8201a";
    ctx.fillRect(-L * 0.12, -L * 0.07, L * 0.16, L * 0.14);
    ctx.fillStyle = "#fff";
    ctx.fillRect(-L * 0.06, -L * 0.05, L * 0.04, L * 0.1);
    ctx.fillRect(-L * 0.09, -L * 0.02, L * 0.1, L * 0.04);
    X.rrect(ctx, L * 0.2, -L * 0.04, L * 0.05, L * 0.08, L * 0.01);
    fs(ctx, "rgba(120,200,230,0.8)", lw * 0.5);
    ctx.beginPath();
    ctx.moveTo(L * 0.32, -L * 0.05);
    ctx.lineTo(L * 0.42, -L * 0.03);
    ctx.lineTo(L * 0.42, L * 0.03);
    ctx.lineTo(L * 0.32, L * 0.05);
    ctx.closePath();
    fs(ctx, "#f2c43a", lw);
    lin(ctx, L * 0.42, 0, L * 0.5, 0, lw * 0.6, "#9aa0a0");
    ctx.restore();
  };
  /** Finned rocket along an angle. len = body length. */
  A.rocket = function (ctx, cx, cy, len, ang, o) {
    o = o || {};
    const body = o.body || "#e8e4d8",
      acc = o.accent || "#c8281e",
      lw = len * 0.02;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang || 0);
    if (o.flame !== false) {
      const fl = len * (0.5 + (o.flameLen || 0));
      ctx.beginPath();
      ctx.moveTo(-len * 0.42, -len * 0.07);
      ctx.quadraticCurveTo(
        -len * 0.42 - fl * 0.6,
        -len * 0.1,
        -len * 0.42 - fl,
        0,
      );
      ctx.quadraticCurveTo(
        -len * 0.42 - fl * 0.6,
        len * 0.1,
        -len * 0.42,
        len * 0.07,
      );
      ctx.closePath();
      ctx.fillStyle = grad(ctx, -len * 0.42, 0, -len * 0.42 - fl, 0, [
        [0, "#fff8c0"],
        [0.3, "#ffc030"],
        [0.7, "#ff5a10"],
        [1, "rgba(255,60,0,0)"],
      ]);
      ctx.fill();
    }
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-len * 0.15, sd * len * 0.11);
      ctx.quadraticCurveTo(
        -len * 0.35,
        sd * len * 0.2,
        -len * 0.48,
        sd * len * 0.3,
      );
      ctx.lineTo(-len * 0.45, sd * len * 0.08);
      ctx.closePath();
      fs(ctx, acc, lw);
    }
    ctx.beginPath();
    ctx.moveTo(len * 0.5, 0);
    ctx.bezierCurveTo(
      len * 0.35,
      -len * 0.16,
      0,
      -len * 0.15,
      -len * 0.42,
      -len * 0.08,
    );
    ctx.lineTo(-len * 0.42, len * 0.08);
    ctx.bezierCurveTo(0, len * 0.15, len * 0.35, len * 0.16, len * 0.5, 0);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, 0, -len * 0.15, 0, len * 0.15, [
      [0, "#ffffff"],
      [0.35, body],
      [1, X.css(X.shade(body, -0.45))],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = acc;
    ctx.fillRect(len * 0.28, -len * 0.2, len * 0.3, len * 0.4);
    ctx.fillRect(-len * 0.1, -len * 0.2, len * 0.05, len * 0.4);
    ctx.restore();
    ell(ctx, len * 0.1, -len * 0.01, len * 0.055, len * 0.055);
    fs(ctx, "#7ac8e8", lw * 0.8);
    ell(ctx, len * 0.09, -len * 0.025, len * 0.018, len * 0.018);
    fs(ctx, "#fff");
    ctx.beginPath();
    ctx.moveTo(-len * 0.1, 0);
    ctx.lineTo(-len * 0.44, 0);
    ctx.lineTo(-len * 0.46, len * 0.02);
    fs(ctx, null, lw * 0.6);
    ctx.restore();
  };
  /** 1950s finned sedan, side view. cy = ground line, L = length. */
