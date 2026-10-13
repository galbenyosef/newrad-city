// play-inline-13 07 — ctx
// Lines 1846-2187 of readable/play-inline-13.pretty.js (statement-aligned).
  A.jetliner = function (ctx, cx, cy, L, ang, o) {
    o = o || {};
    const lw = L * 0.01,
      body = o.body || "#eeeee8",
      stripe = o.stripe || "#2a5aa8";
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ang || 0);
    ctx.beginPath();
    ctx.moveTo(-L * 0.05, -L * 0.03);
    ctx.lineTo(-L * 0.28, -L * 0.3);
    ctx.lineTo(-L * 0.2, -L * 0.3);
    ctx.lineTo(L * 0.1, -L * 0.03);
    ctx.closePath();
    fs(ctx, X.css(X.shade(body, -0.15)), lw);
    ctx.beginPath();
    ctx.moveTo(-L * 0.4, -L * 0.02);
    ctx.lineTo(-L * 0.5, -L * 0.14);
    ctx.lineTo(-L * 0.44, -L * 0.14);
    ctx.lineTo(-L * 0.33, -L * 0.02);
    ctx.closePath();
    fs(ctx, stripe, lw);
    X.rrect(ctx, -L * 0.5, -L * 0.045, L, L * 0.09, L * 0.045);
    ctx.fillStyle = grad(ctx, 0, -L * 0.045, 0, L * 0.045, [
      [0, "#ffffff"],
      [0.5, body],
      [1, X.css(X.shade(body, -0.3))],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.fillStyle = stripe;
    ctx.fillRect(-L * 0.46, -L * 0.005, L * 0.9, L * 0.018);
    for (let k = 0; k < 14; k++) {
      ell(ctx, -L * 0.3 + k * L * 0.05, -L * 0.018, L * 0.008, L * 0.01);
      fs(ctx, "#3a5a7a");
    }
    ctx.beginPath();
    ctx.moveTo(-L * 0.02, L * 0.02);
    ctx.lineTo(-L * 0.25, L * 0.3);
    ctx.lineTo(-L * 0.16, L * 0.3);
    ctx.lineTo(L * 0.14, L * 0.02);
    ctx.closePath();
    fs(ctx, body, lw);
    for (const ex of [-L * 0.1, -L * 0.18]) {
      X.rrect(
        ctx,
        ex,
        L * (ex < -L * 0.15 ? 0.2 : 0.12),
        L * 0.1,
        L * 0.035,
        L * 0.015,
      );
      fs(ctx, "#9a9a94", lw * 0.7);
    }
    ctx.beginPath();
    ctx.moveTo(L * 0.42, -L * 0.03);
    ctx.quadraticCurveTo(L * 0.47, -L * 0.03, L * 0.48, -L * 0.005);
    ctx.lineTo(L * 0.43, -L * 0.005);
    ctx.closePath();
    fs(ctx, "#3a5a7a");
    ctx.restore();
  };

  // ==================================================================
  // HEROES / SCENES
  // ==================================================================
  A.mushroom = function (ctx, cx, gy, s) {
    ctx.save();
    const stem = grad(ctx, cx - s * 0.2, 0, cx + s * 0.2, 0, [
      [0, "#8a3a10"],
      [0.5, "#ffb040"],
      [1, "#8a3a10"],
    ]);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, gy);
    ctx.bezierCurveTo(
      cx - s * 0.25,
      gy - s * 0.6,
      cx - s * 0.08,
      gy - s * 1.1,
      cx - s * 0.15,
      gy - s * 1.5,
    );
    ctx.lineTo(cx + s * 0.15, gy - s * 1.5);
    ctx.bezierCurveTo(
      cx + s * 0.08,
      gy - s * 1.1,
      cx + s * 0.25,
      gy - s * 0.6,
      cx + s * 0.12,
      gy,
    );
    ctx.closePath();
    ctx.fillStyle = stem;
    ctx.fill();
    ell(ctx, cx, gy - s * 1.0, s * 0.45, s * 0.1);
    ctx.fillStyle = "rgba(255,200,120,0.7)";
    ctx.fill();
    const puffs = [
      [0, -1.75, 0.5],
      [-0.4, -1.6, 0.35],
      [0.4, -1.6, 0.35],
      [-0.25, -1.95, 0.35],
      [0.25, -1.95, 0.35],
      [0, -2.1, 0.3],
      [-0.55, -1.75, 0.25],
      [0.55, -1.75, 0.25],
    ];
    for (const p of puffs) {
      ell(ctx, cx + p[0] * s, gy + p[1] * s, p[2] * s, p[2] * s * 0.85);
      ctx.fillStyle = rgrad(
        ctx,
        cx + p[0] * s,
        gy + p[1] * s + p[2] * s * 0.3,
        1,
        p[2] * s,
        [
          [0, "#fff0a0"],
          [0.4, "#ff9a20"],
          [1, "#8a2a08"],
        ],
      );
      ctx.fill();
    }
    ell(ctx, cx, gy, s * 0.8, s * 0.12);
    ctx.fillStyle = "rgba(120,60,20,0.8)";
    ctx.fill();
    ctx.restore();
  };
  A.ferris = function (ctx, cx, cy, r, o) {
    o = o || {};
    const lw = r * 0.02,
      col = o.color || "#e8e0c8";
    ctx.save();
    lin(ctx, cx, cy, cx - r * 0.5, cy + r * 1.15, lw * 2, col);
    lin(ctx, cx, cy, cx + r * 0.5, cy + r * 1.15, lw * 2, col);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.strokeStyle = col;
    ctx.lineWidth = lw * 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.9, 0, TAU);
    ctx.lineWidth = lw;
    ctx.stroke();
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * TAU;
      lin(
        ctx,
        cx,
        cy,
        cx + Math.cos(a) * r,
        cy + Math.sin(a) * r,
        lw * 0.7,
        col,
      );
    }
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * TAU,
        gx = cx + Math.cos(a) * r,
        gy = cy + Math.sin(a) * r;
      X.rrect(ctx, gx - r * 0.07, gy, r * 0.14, r * 0.12, r * 0.03);
      fs(ctx, ["#e8402a", "#2a8ad0", "#f0c030"][k % 3], lw * 0.6);
    }
    ell(ctx, cx, cy, r * 0.08, r * 0.08);
    fs(ctx, col, lw);
    ctx.restore();
  };
  A.gasPump = function (ctx, cx, gy, h, col) {
    const lw = h * 0.02,
      w = h * 0.4;
    ctx.save();
    X.rrect(ctx, cx - w / 2, gy - h * 0.8, w, h * 0.8, w * 0.1);
    fs(ctx, col, lw);
    ctx.beginPath();
    ctx.rect(cx - w * 0.35, gy - h * 0.7, w * 0.7, h * 0.18);
    fs(ctx, "#f4f0e0", lw * 0.7);
    X.text(ctx, "0.29", cx, gy - h * 0.61, {
      font: "mono",
      size: h * 0.08,
      color: "#1a1a1a",
    });
    ell(ctx, cx, gy - h * 0.9, w * 0.42, h * 0.12);
    fs(ctx, "#f8f4e8", lw);
    X.text(ctx, "FUEL", cx, gy - h * 0.9, {
      font: "impact",
      size: h * 0.08,
      color: col,
    });
    ctx.beginPath();
    ctx.moveTo(cx + w / 2, gy - h * 0.5);
    ctx.quadraticCurveTo(
      cx + w * 1.2,
      gy - h * 0.4,
      cx + w * 0.9,
      gy - h * 0.15,
    );
    fs(ctx, null, lw * 2, "#1a1a1a");
    ctx.restore();
  };
  /** Frosted, cream-filled snack cake (cylinder with dripping icing & a squiggle). */
  A.snackCake = function (ctx, cx, cy, w, o) {
    o = o || {};
    const lw = w * 0.022,
      h = w * 0.55,
      e = w * 0.2; // body height, ellipse half-height
    const top = cy - h / 2,
      bot = cy + h / 2;
    ctx.save();
    ctx.lineJoin = "round";
    // cake body
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, top);
    ctx.lineTo(cx - w / 2, bot);
    ctx.ellipse(cx, bot, w / 2, e, 0, Math.PI, 0, true);
    ctx.lineTo(cx + w / 2, top);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, cx - w / 2, 0, cx + w / 2, 0, [
      [0, "#3a1a08"],
      [0.35, o.cake || "#7a4420"],
      [1, "#2a1004"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    // cream filling peeking out of a bite
    if (o.bite !== false) {
      ell(ctx, cx + w * 0.36, cy + h * 0.05, w * 0.16, h * 0.22);
      fs(ctx, "#fbf4e4", lw * 0.7);
    }
    // icing cap with drips
    const ic = o.frost || "#f6e6ee";
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, top);
    const drips = 7;
    for (let k = 0; k <= drips; k++) {
      const t = k / drips,
        x = cx - w / 2 + t * w,
        dd = (k % 2 ? 0.35 : 0.15) * h * (0.6 + 0.4 * Math.sin(k * 2.3) ** 2);
      const yEdge = top + Math.sin(t * Math.PI) * e;
      ctx.quadraticCurveTo(
        x - w / drips / 2,
        yEdge + dd * 1.4,
        x,
        yEdge + (k % 2 ? dd * 0.3 : dd * 0.1),
      );
    }
    ctx.ellipse(cx, top, w / 2, e, 0, 0, Math.PI, true);
    ctx.closePath();
    fs(ctx, ic, lw);
    ell(ctx, cx, top, w / 2, e);
    ctx.fillStyle = grad(ctx, cx - w / 2, top - e, cx + w / 2, top + e, [
      [0, "#ffffff"],
      [1, ic],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    // signature loop-de-loop squiggle
    ctx.beginPath();
    for (let k = 0; k <= 40; k++) {
      const t = k / 40,
        x = cx - w * 0.36 + t * w * 0.72,
        y =
          top +
          Math.sin(t * Math.PI * 7) * e * 0.28 +
          Math.cos(t * Math.PI * 7) * w * 0.02;
      if (k) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = o.swirl || "#e8508a";
    ctx.lineWidth = lw * 1.6;
    ctx.stroke();
    if (o.cherry) {
      ell(ctx, cx, top - e * 0.35, w * 0.08, w * 0.08);
      fs(ctx, "#d8201a", lw * 0.6);
      A.lin(
        ctx,
        cx,
        top - e * 0.35 - w * 0.08,
        cx + w * 0.05,
        top - e * 0.35 - w * 0.2,
        lw * 0.6,
        "#3a5a1a",
      );
    }
    ctx.restore();
  };
  /** Bowl (cereal / mac & cheese). fill: 'cereal' | 'mac'. */
  A.bowl = function (ctx, cx, cy, w, fill, o) {
    o = o || {};
    const lw = w * 0.02,
      h = w * 0.45;
    ctx.save();
    ell(ctx, cx, cy, w / 2, h * 0.25);
    fs(ctx, fill === "mac" ? "#f0b830" : "#f4f0e0", lw);
    const pcol =
      fill === "mac"
        ? ["#f8c840", "#e8a020", "#ffd860"]
        : ["#c87a2a", "#e89a3a", "#a85a1a"];
    for (let k = 0; k < 40; k++) {
      const a = k * 2.39996,
        rr = Math.sqrt(k / 40);
      const px = cx + Math.cos(a) * w * 0.44 * rr,
        py = cy + Math.sin(a) * h * 0.2 * rr - h * 0.05;
      ctx.fillStyle = pcol[k % 3];
      if (fill === "mac") {
        ctx.beginPath();
        ctx.arc(px, py, w * 0.035, 0.2, Math.PI * 1.2);
        ctx.lineWidth = w * 0.022;
        ctx.strokeStyle = pcol[k % 3];
        ctx.stroke();
      } else {
        ell(ctx, px, py, w * 0.035, w * 0.025, a);
        ctx.fill();
        ctx.strokeStyle = "rgba(90,40,10,0.6)";
        ctx.lineWidth = lw * 0.4;
        ctx.stroke();
      }
    }
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, cy);
    ctx.bezierCurveTo(
      cx - w * 0.48,
      cy + h * 1.0,
      cx + w * 0.48,
      cy + h * 1.0,
      cx + w / 2,
      cy,
    );
    ctx.ellipse(cx, cy, w / 2, h * 0.25, 0, 0, Math.PI);
    ctx.fillStyle = grad(ctx, cx - w / 2, 0, cx + w / 2, 0, [
      [0, X.css(X.shade(o.color || "#2a7ad0", -0.3))],
      [0.35, o.color || "#2a7ad0"],
      [1, X.css(X.shade(o.color || "#2a7ad0", -0.45))],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ell(ctx, cx - w * 0.28, cy + h * 0.35, w * 0.06, h * 0.18, -0.3);
    ctx.fill();
    ctx.restore();
  };
  /** NYC skyline silhouette (Empire State, Chrysler) along a ground line. */
