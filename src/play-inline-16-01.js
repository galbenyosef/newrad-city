// play-inline-16 01 — ctx
// Lines 16-322 of readable/play-inline-16.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._tx;
  const A = X.art;
  const K = X.adkit;
  const B = X.BRANDS;
  const TAU = Math.PI * 2;
  const INK = "#1d1712";
  const def = (id, spec) => {
    spec.id = id;
    B[id] = spec;
  };

  /** Puffy cumulus cloud made of overlapping circles. */
  function cloud(ctx, x, y, s, col) {
    ctx.fillStyle = col || "rgba(255,255,255,0.9)";
    for (const [dx, dy, r] of [
      [-1.1, 0.15, 0.6],
      [-0.45, -0.25, 0.8],
      [0.35, -0.35, 0.9],
      [1.05, 0.05, 0.65],
      [0, 0.25, 0.7],
    ]) {
      ctx.beginPath();
      ctx.arc(x + dx * s, y + dy * s, r * s, 0, TAU);
      ctx.fill();
    }
  }
  /** Small speech bubble with a tail toward (tx, ty). */
  function bubble(ctx, cx, cy, w, h, tx, ty) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, TAU);
    ctx.moveTo(cx + w * 0.12, cy + h * 0.3);
    ctx.lineTo(tx, ty);
    ctx.lineTo(cx + w * 0.26, cy + h * 0.2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2 - 2, h / 2 - 2, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  /** Plate of meatballs in marinara (top-ish view). */
  function meatballPlate(ctx, cx, cy, rx) {
    const ry = rx * 0.32;
    A.ell(ctx, cx, cy, rx, ry);
    A.fs(ctx, "#f8f4ea", 4);
    A.ell(ctx, cx, cy - ry * 0.05, rx * 0.72, ry * 0.68);
    ctx.fillStyle = "#b8281a";
    ctx.fill();
    const pts = [
      [-0.38, -0.05],
      [0.0, -0.18],
      [0.36, -0.02],
      [-0.16, 0.18],
      [0.2, 0.2],
    ];
    for (const [dx, dy] of pts) {
      const x = cx + dx * rx,
        y = cy + dy * ry * 2 - ry * 0.25;
      A.ell(ctx, x, y, rx * 0.17, rx * 0.15);
      ctx.fillStyle = A.rgrad(ctx, x - rx * 0.05, y - rx * 0.05, 1, rx * 0.17, [
        [0, "#a8683a"],
        [1, "#5a2a10"],
      ]);
      ctx.fill();
      A.fs(ctx, null, 2.5);
      A.ell(ctx, x - rx * 0.05, y - rx * 0.05, rx * 0.04, rx * 0.025);
      ctx.fillStyle = "rgba(255,220,180,0.6)";
      ctx.fill();
    }
    for (let k = 0; k < 5; k++) {
      A.ell(
        ctx,
        cx + (k - 2) * rx * 0.18,
        cy - ry * 0.55 + (k % 2) * ry * 0.2,
        rx * 0.04,
        rx * 0.025,
        k,
      );
      ctx.fillStyle = "#3a8a2a";
      ctx.fill();
    }
  }
  /** Steam curls. */
  function steam(ctx, x, y, n, h) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    for (let k = 0; k < n; k++) {
      const sx = x + (k - (n - 1) / 2) * 40;
      ctx.beginPath();
      ctx.moveTo(sx, y);
      ctx.bezierCurveTo(sx - 18, y - h * 0.3, sx + 18, y - h * 0.6, sx, y - h);
      ctx.stroke();
    }
    ctx.restore();
  }
  /** Lone rider on horseback, in silhouette. gy = ground. */
  function rider(ctx, cx, gy, s, col) {
    ctx.save();
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    ctx.lineCap = "round";
    A.ell(ctx, cx, gy - s * 1.15, s * 0.85, s * 0.38);
    ctx.fill();
    ctx.lineWidth = s * 0.16;
    for (const [x0, x1] of [
      [-0.6, -0.75],
      [-0.4, -0.3],
      [0.45, 0.55],
      [0.65, 0.9],
    ]) {
      ctx.beginPath();
      ctx.moveTo(cx + x0 * s, gy - s * 1.0);
      ctx.lineTo(cx + x1 * s, gy);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.6, gy - s * 1.3);
    ctx.quadraticCurveTo(
      cx + s * 0.95,
      gy - s * 1.9,
      cx + s * 1.25,
      gy - s * 1.8,
    );
    ctx.lineTo(cx + s * 1.35, gy - s * 1.55);
    ctx.lineTo(cx + s * 0.85, gy - s * 1.15);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.8, gy - s * 1.3);
    ctx.quadraticCurveTo(
      cx - s * 1.3,
      gy - s * 1.1,
      cx - s * 1.2,
      gy - s * 0.5,
    );
    ctx.lineWidth = s * 0.14;
    ctx.stroke();
    A.ell(ctx, cx + s * 0.05, gy - s * 1.85, s * 0.2, s * 0.42);
    ctx.fill();
    A.ell(ctx, cx + s * 0.08, gy - s * 2.35, s * 0.13, s * 0.14);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.08, gy - s * 2.45, s * 0.36, s * 0.07, 0, 0, TAU);
    ctx.fill();
    ctx.fillRect(cx - s * 0.08, gy - s * 2.72, s * 0.32, s * 0.25);
    ctx.restore();
  }
  /** Clock-face badge (stopwatch). */
  function stopwatch(ctx, cx, cy, r, label) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - r * 0.14, cy - r * 1.32, r * 0.28, r * 0.3);
    A.fs(ctx, "#c8c8c0", 4);
    A.ell(ctx, cx, cy, r, r);
    A.fs(ctx, "#f8f6f0", r * 0.08);
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * TAU;
      A.lin(
        ctx,
        cx + Math.cos(a) * r * 0.78,
        cy + Math.sin(a) * r * 0.78,
        cx + Math.cos(a) * r * 0.9,
        cy + Math.sin(a) * r * 0.9,
        r * 0.05,
      );
    }
    A.lin(ctx, cx, cy, cx + r * 0.55, cy - r * 0.32, r * 0.07, "#c8201a");
    X.text(ctx, label, cx, cy + r * 0.42, {
      font: "condensed",
      size: r * 0.3,
      color: INK,
      maxW: r * 1.3,
      noSafe: true,
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------- package faces (shared with 33_brands_v1.js)
  function flakesFront(ctx, x, y, w, h) {
    ctx.fillStyle = "#f6eee0";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#1e3a8a";
    ctx.fillRect(x, y, w, h * 0.38);
    ctx.fillStyle = "#fff";
    for (let k = 0; k < 9; k++) {
      X.starPath(
        ctx,
        x + w * (0.1 + (k % 5) * 0.2),
        y + h * (0.05 + Math.floor(k / 5) * 0.06),
        w * 0.03,
        w * 0.012,
        5,
      );
      ctx.fill();
    }
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = k % 2 ? "#f6eee0" : "#c8201a";
      ctx.fillRect(x, y + h * (0.38 + k * 0.03), w, h * 0.03);
    }
    X.text(ctx, "FREEDOM", x + w / 2, y + h * 0.2, {
      font: "rounded",
      size: w * 0.2,
      color: "#fff",
      stroke: INK,
      strokeW: w * 0.018,
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "FLAKES", x + w / 2, y + h * 0.31, {
      font: "rounded",
      size: w * 0.2,
      color: "#f4c21e",
      stroke: INK,
      strokeW: w * 0.018,
      maxW: w * 0.9,
      noSafe: true,
    });
    A.bowl(ctx, x + w / 2, y + h * 0.68, w * 0.72, "cereal", {
      color: "#1e3a8a",
    });
    X.text(ctx, "BROOKLYN SUGAR WORKS", x + w / 2, y + h * 0.93, {
      font: "condensed",
      size: w * 0.07,
      color: INK,
      maxW: w * 0.9,
      noSafe: true,
    });
  }
  function marinaraLabel(ctx, x, y, w, h) {
    ctx.fillStyle = "#c8281e";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#f6ecd4";
    ctx.fillRect(x, y + h * 0.3, w, h * 0.36);
    ctx.fillStyle = "#2a7a3a";
    ctx.fillRect(x, y + h * 0.66, w, h * 0.06);
    X.text(ctx, "Mama", x + w / 2, y + h * 0.16, {
      font: "script",
      weight: "normal",
      size: w * 0.3,
      color: "#f6ecd4",
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "MARINARA’S", x + w / 2, y + h * 0.4, {
      font: "slab",
      size: w * 0.15,
      color: "#c8281e",
      maxW: w * 0.9,
      noSafe: true,
    });
    X.text(ctx, "INSTANT MEATBALLS", x + w / 2, y + h * 0.56, {
      font: "condensed",
      size: w * 0.09,
      color: "#2a7a3a",
      maxW: w * 0.9,
      noSafe: true,
    });
    for (let k = 0; k < 3; k++) {
      A.ell(ctx, x + w * (0.3 + k * 0.2), y + h * 0.84, w * 0.07, w * 0.06);
      ctx.fillStyle = "#6a3018";
      ctx.fill();
    }
  }
  function plainLabel(ctx, x, y, w, h) {
    ctx.fillStyle = "#f4e6c0";
    ctx.fillRect(x + w * 0.08, y + h * 0.04, w * 0.84, h * 0.62);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + w * 0.08, y + h * 0.04, w * 0.84, h * 0.62);
    ctx.clip();
    X.sunburst(ctx, x + w / 2, y + h * 0.5, h * 0.6, 14, "#f4e6c0", "#f2d68a");
    A.ell(ctx, x + w / 2, y + h * 0.5, w * 0.16, w * 0.16);
    ctx.fillStyle = "#e8902a";
    ctx.fill();
    ctx.fillStyle = "#7a3a12";
    ctx.fillRect(x, y + h * 0.5, w, h * 0.2);
    ctx.restore();
    X.text(ctx, "GOLDEN", x + w / 2, y + h * 0.13, {
      font: "slab",
      size: w * 0.15,
      color: "#7a2a12",
      maxW: w * 0.78,
      noSafe: true,
    });
    X.text(ctx, "PLAIN", x + w / 2, y + h * 0.27, {
      font: "slab",
      size: w * 0.19,
      color: "#7a2a12",
      maxW: w * 0.78,
      noSafe: true,
    });
    X.text(ctx, "BEEF JERKY", x + w / 2, y + h * 0.6, {
      font: "condensed",
      size: w * 0.1,
      color: "#f4e6c0",
      maxW: w * 0.78,
      noSafe: true,
    });
  }
