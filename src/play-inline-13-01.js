// play-inline-13 01 — ctx
// Lines 20-320 of readable/play-inline-13.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._tx;
  const TAU = Math.PI * 2;
  const INK = "#1d1712";
  const A = (X.art = {});

  // ------------------------------------------------------------------
  // small helpers
  // ------------------------------------------------------------------
  function fs(ctx, fill, lw, stroke) {
    if (fill) {
      ctx.fillStyle =
        typeof fill === "string" && fill[0] !== "#" && !fill.startsWith("rgb")
          ? fill
          : fill;
      ctx.fill();
    }
    if (lw) {
      ctx.strokeStyle = stroke || INK;
      ctx.lineWidth = lw;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }
  A.fs = fs;
  function ell(ctx, x, y, rx, ry, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU);
  }
  A.ell = ell;
  function lin(ctx, x0, y0, x1, y1, lw, col) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = col || INK;
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  A.lin = lin;
  /** Smooth closed/open curve through points (Catmull-Rom → bezier). */
  function spline(ctx, pts, closed) {
    const n = pts.length;
    if (n < 2) return;
    const P = (i) =>
      pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
    ctx.moveTo(pts[0][0], pts[0][1]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1),
        p1 = P(i),
        p2 = P(i + 1),
        p3 = P(i + 2);
      ctx.bezierCurveTo(
        p1[0] + (p2[0] - p0[0]) / 6,
        p1[1] + (p2[1] - p0[1]) / 6,
        p2[0] - (p3[0] - p1[0]) / 6,
        p2[1] - (p3[1] - p1[1]) / 6,
        p2[0],
        p2[1],
      );
    }
    if (closed) ctx.closePath();
  }
  A.spline = spline;
  /** Symmetric body of revolution silhouette from half-profile [[y, halfWidth], ...] (y 0..1 top→bottom). */
  function profile(ctx, cx, top, h, s, prof) {
    const right = prof.map((p) => [cx + p[1] * s, top + p[0] * h]);
    const left = prof
      .slice()
      .reverse()
      .map((p) => [cx - p[1] * s, top + p[0] * h]);
    ctx.beginPath();
    spline(ctx, right.concat(left), true);
  }
  A.profile = profile;
  function grad(ctx, x0, y0, x1, y1, stops) {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach((s) => g.addColorStop(s[0], s[1]));
    return g;
  }
  A.grad = grad;
  function rgrad(ctx, x, y, r0, r1, stops) {
    const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
    stops.forEach((s) => g.addColorStop(s[0], s[1]));
    return g;
  }
  A.rgrad = rgrad;

  // ==================================================================
  // PEOPLE
  // ==================================================================
  /** Shoulders/torso bust shape. */
  function bust(ctx, cx, cy, s, col, lw) {
    ctx.beginPath();
    ctx.moveTo(cx - 1.75 * s, cy + 3.1 * s);
    ctx.bezierCurveTo(
      cx - 1.8 * s,
      cy + 1.7 * s,
      cx - 1.2 * s,
      cy + 1.3 * s,
      cx - 0.42 * s,
      cy + 1.22 * s,
    );
    ctx.lineTo(cx + 0.42 * s, cy + 1.22 * s);
    ctx.bezierCurveTo(
      cx + 1.2 * s,
      cy + 1.3 * s,
      cx + 1.8 * s,
      cy + 1.7 * s,
      cx + 1.75 * s,
      cy + 3.1 * s,
    );
    ctx.closePath();
    fs(ctx, col, lw);
  }
  /** 50s homemaker: bouffant curls, closed-eye smile, pearls. Returns hand anchor {x,y}. */
  A.housewife = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = s * 0.06,
      SKIN = o.skin || "#f6d4b4",
      HAIR = o.hair || "#6a3a1e",
      DRESS = o.dress || "#d64b45",
      LIPS = o.lips || "#c81e2a";
    ctx.save();
    ctx.lineJoin = "round";
    // hair back mass
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx - 1.25 * s, cy + 0.9 * s],
        [cx - 1.3 * s, cy - 0.4 * s],
        [cx - 0.8 * s, cy - 1.3 * s],
        [cx, cy - 1.5 * s],
        [cx + 0.8 * s, cy - 1.3 * s],
        [cx + 1.3 * s, cy - 0.4 * s],
        [cx + 1.25 * s, cy + 0.9 * s],
        [cx, cy + 0.5 * s],
      ],
      true,
    );
    fs(ctx, HAIR, lw);
    bust(ctx, cx, cy, s * 0.95, DRESS, lw);
    // polka dots
    ctx.save();
    bust(ctx, cx, cy, s * 0.95, null, 0);
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    for (let yy = cy + 1.3 * s; yy < cy + 3.2 * s; yy += 0.36 * s)
      for (
        let xx = cx - 1.8 * s + (((yy / (0.36 * s)) | 0) % 2) * 0.18 * s;
        xx < cx + 1.8 * s;
        xx += 0.36 * s
      ) {
        ell(ctx, xx, yy, 0.06 * s, 0.06 * s);
        ctx.fill();
      }
    ctx.restore();
    // peter-pan collar
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy + 1.3 * s);
      ctx.quadraticCurveTo(
        cx + sd * 0.7 * s,
        cy + 1.1 * s,
        cx + sd * 0.8 * s,
        cy + 1.45 * s,
      );
      ctx.quadraticCurveTo(cx + sd * 0.5 * s, cy + 1.75 * s, cx, cy + 1.45 * s);
      fs(ctx, "#fbf6ea", lw * 0.8);
    }
    // neck & head
    ctx.beginPath();
    ctx.rect(cx - 0.28 * s, cy + 0.55 * s, 0.56 * s, 0.75 * s);
    fs(ctx, SKIN, lw);
    for (let k = 0; k < 9; k++) {
      const t = k / 8,
        px = cx - 0.45 * s + t * 0.9 * s,
        py = cy + 1.2 * s + Math.sin(t * Math.PI) * 0.18 * s;
      ell(ctx, px, py, 0.065 * s, 0.065 * s);
      fs(ctx, "#fffaf0", lw * 0.35);
    }
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx, cy - 1.0 * s],
        [cx + 0.8 * s, cy - 0.5 * s],
        [cx + 0.82 * s, cy + 0.25 * s],
        [cx + 0.45 * s, cy + 0.85 * s],
        [cx, cy + 0.98 * s],
        [cx - 0.45 * s, cy + 0.85 * s],
        [cx - 0.82 * s, cy + 0.25 * s],
        [cx - 0.8 * s, cy - 0.5 * s],
      ],
      true,
    );
    fs(ctx, SKIN, lw);
    // front curls / bangs
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx - 0.9 * s, cy - 0.1 * s],
        [cx - 0.85 * s, cy - 0.8 * s],
        [cx - 0.2 * s, cy - 1.2 * s],
        [cx + 0.6 * s, cy - 1.05 * s],
        [cx + 0.92 * s, cy - 0.4 * s],
        [cx + 0.55 * s, cy - 0.6 * s],
        [cx + 0.1 * s, cy - 0.55 * s],
        [cx - 0.35 * s, cy - 0.7 * s],
        [cx - 0.65 * s, cy - 0.4 * s],
      ],
      true,
    );
    fs(ctx, HAIR, lw);
    ctx.strokeStyle = X.css(X.shade(HAIR, 0.25));
    ctx.lineWidth = lw * 0.6;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      ctx.arc(
        cx - 0.6 * s + k * 0.4 * s,
        cy - 0.85 * s + Math.abs(k - 1.5) * 0.1 * s,
        0.18 * s,
        Math.PI * 0.9,
        Math.PI * 2.1,
      );
      ctx.stroke();
    }
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx + sd * 1.05 * s, cy + 0.55 * s, 0.25 * s, 0, TAU);
      fs(ctx, HAIR, lw);
      ctx.beginPath();
      ctx.arc(cx + sd * 1.05 * s, cy + 0.55 * s, 0.1 * s, 0, TAU);
      ctx.strokeStyle = X.css(X.shade(HAIR, 0.25));
      ctx.lineWidth = lw * 0.6;
      ctx.stroke();
    }
    // closed happy eyes with lashes
    for (const sd of [-1, 1]) {
      const ex = cx + sd * 0.34 * s,
        ey = cy - 0.02 * s;
      ctx.beginPath();
      ctx.arc(ex, ey - 0.1 * s, 0.17 * s, Math.PI * 0.15, Math.PI * 0.85);
      fs(ctx, null, lw);
      for (let k = 0; k < 3; k++) {
        const a = Math.PI * (0.25 + k * 0.25);
        lin(
          ctx,
          ex + Math.cos(a) * 0.17 * s,
          ey - 0.1 * s + Math.sin(a) * 0.17 * s,
          ex + Math.cos(a) * 0.26 * s,
          ey - 0.1 * s + Math.sin(a) * 0.26 * s,
          lw * 0.5,
        );
      }
      ctx.beginPath();
      ctx.arc(ex, ey - 0.25 * s, 0.2 * s, Math.PI * 1.15, Math.PI * 1.85);
      fs(ctx, null, lw * 0.7);
      ell(ctx, ex + sd * 0.1 * s, cy + 0.32 * s, 0.14 * s, 0.09 * s);
      ctx.fillStyle = "rgba(230,110,110,0.45)";
      ctx.fill();
      ell(ctx, cx + sd * 0.86 * s, cy + 0.35 * s, 0.06 * s, 0.06 * s);
      fs(ctx, "#fffaf0", lw * 0.4);
    }
    // lips
    ctx.beginPath();
    ctx.moveTo(cx - 0.3 * s, cy + 0.5 * s);
    ctx.quadraticCurveTo(cx - 0.12 * s, cy + 0.4 * s, cx, cy + 0.46 * s);
    ctx.quadraticCurveTo(
      cx + 0.12 * s,
      cy + 0.4 * s,
      cx + 0.3 * s,
      cy + 0.5 * s,
    );
    ctx.quadraticCurveTo(cx, cy + 0.72 * s, cx - 0.3 * s, cy + 0.5 * s);
    fs(ctx, LIPS, lw * 0.5);
    ctx.beginPath();
    ctx.moveTo(cx - 0.2 * s, cy + 0.52 * s);
    ctx.quadraticCurveTo(cx, cy + 0.6 * s, cx + 0.2 * s, cy + 0.52 * s);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = lw * 0.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 0.02 * s, cy + 0.12 * s);
    ctx.quadraticCurveTo(
      cx + 0.1 * s,
      cy + 0.28 * s,
      cx - 0.04 * s,
      cy + 0.3 * s,
    );
    fs(ctx, null, lw * 0.5);
    ctx.restore();
    return { x: cx + 1.5 * s, y: cy + 1.5 * s };
  };

  /** Grinning 50s dad: square jaw, fedora, suit & tie. o: {hat:false, bald, hairColor, cap:'#col', badge, beard:'#col'} */
