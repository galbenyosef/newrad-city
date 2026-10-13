/* src/textures/30_art.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: 1950s–60s ad-illustration library
 * Owned by: textures.
 *
 * Flat, bold-outlined commercial art of the period, drawn with canvas
 * paths. Everything here is ORIGINAL artwork. All functions draw into a
 * context at the given position/scale and are used by the billboard /
 * poster / decal compositions.
 *
 *   X.art.housewife / dad / kid             period people (busts)
 *   X.art.fizzoBottle / amberBottle / car / tv / box3d / can / pillBottle / injector
 *   X.art.valet / patrolman / goggles / teletype / mainframe / cryoPod / jetliner / rocket
 *   X.art.mushroom / ferris / gasPump / snackCake / bowl
 *   X.art.skyline / crown / lightning / stars / speedLines / bulb / pylon / unisphere
 *   X.art.snowflake / ocd / longWinter / sunDisc / covenant / continuity  (emblems)
 *   (the city's brand-slate products & mascots live in 30b_art_slate.js)
 * ===================================================================== */
(function () {
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
  A.dad = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = s * 0.065,
      SKIN = o.skin || "#f0c8a0",
      SUIT = o.suit || "#5a6a7a",
      TIE = o.tie || "#b0302a";
    ctx.save();
    ctx.lineJoin = "round";
    bust(ctx, cx, cy, s, SUIT, lw);
    ctx.beginPath();
    ctx.moveTo(cx - 0.45 * s, cy + 1.22 * s);
    ctx.lineTo(cx, cy + 2.2 * s);
    ctx.lineTo(cx + 0.45 * s, cy + 1.22 * s);
    ctx.closePath();
    fs(ctx, "#f4f0e6", lw * 0.7);
    ctx.beginPath();
    ctx.moveTo(cx - 0.12 * s, cy + 1.3 * s);
    ctx.lineTo(cx + 0.12 * s, cy + 1.3 * s);
    ctx.lineTo(cx + 0.16 * s, cy + 2.2 * s);
    ctx.lineTo(cx, cy + 2.4 * s);
    ctx.lineTo(cx - 0.16 * s, cy + 2.2 * s);
    ctx.closePath();
    fs(ctx, TIE, lw * 0.6);
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + sd * 0.45 * s, cy + 1.22 * s);
      ctx.lineTo(cx + sd * 0.15 * s, cy + 2.0 * s);
      ctx.lineTo(cx + sd * 0.7 * s, cy + 1.7 * s);
      ctx.closePath();
      fs(ctx, X.css(X.shade(SUIT, -0.2)), lw * 0.6);
    }
    ctx.beginPath();
    ctx.rect(cx - 0.33 * s, cy + 0.6 * s, 0.66 * s, 0.65 * s);
    fs(ctx, SKIN, lw);
    ell(ctx, cx + 0.92 * s, cy + 0.1 * s, 0.18 * s, 0.26 * s);
    fs(ctx, SKIN, lw);
    ell(ctx, cx - 0.92 * s, cy + 0.1 * s, 0.18 * s, 0.26 * s);
    fs(ctx, SKIN, lw);
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx, cy - 0.95 * s],
        [cx + 0.85 * s, cy - 0.6 * s],
        [cx + 0.9 * s, cy + 0.3 * s],
        [cx + 0.7 * s, cy + 0.9 * s],
        [cx, cy + 1.05 * s],
        [cx - 0.7 * s, cy + 0.9 * s],
        [cx - 0.9 * s, cy + 0.3 * s],
        [cx - 0.85 * s, cy - 0.6 * s],
      ],
      true,
    );
    fs(ctx, SKIN, lw);
    // eyes (open, twinkling) & brows
    for (const sd of [-1, 1]) {
      ell(ctx, cx + sd * 0.34 * s, cy - 0.02 * s, 0.09 * s, 0.13 * s);
      fs(ctx, INK);
      ell(ctx, cx + sd * 0.32 * s, cy - 0.07 * s, 0.03 * s, 0.04 * s);
      fs(ctx, "#fff");
      lin(
        ctx,
        cx + sd * 0.18 * s,
        cy - 0.3 * s,
        cx + sd * 0.52 * s,
        cy - 0.34 * s,
        lw * 1.1,
      );
    }
    ctx.beginPath();
    ctx.moveTo(cx, cy + 0.05 * s);
    ctx.lineTo(cx + 0.12 * s, cy + 0.3 * s);
    ctx.lineTo(cx - 0.05 * s, cy + 0.32 * s);
    fs(ctx, null, lw * 0.6);
    ctx.beginPath();
    ctx.moveTo(cx - 0.5 * s, cy + 0.5 * s);
    ctx.quadraticCurveTo(cx, cy + 1.0 * s, cx + 0.5 * s, cy + 0.5 * s);
    ctx.closePath();
    fs(ctx, "#fff", lw * 0.7);
    lin(
      ctx,
      cx - 0.45 * s,
      cy + 0.56 * s,
      cx + 0.45 * s,
      cy + 0.56 * s,
      lw * 0.4,
    );
    if (o.hat !== false) {
      ctx.beginPath();
      ctx.moveTo(cx - 1.3 * s, cy - 0.55 * s);
      ctx.quadraticCurveTo(cx, cy - 0.85 * s, cx + 1.3 * s, cy - 0.55 * s);
      ctx.quadraticCurveTo(cx, cy - 0.45 * s, cx - 1.3 * s, cy - 0.55 * s);
      fs(ctx, o.hatColor || "#4a3e32", lw);
      ctx.beginPath();
      ctx.moveTo(cx - 0.8 * s, cy - 0.62 * s);
      ctx.lineTo(cx - 0.75 * s, cy - 1.35 * s);
      ctx.quadraticCurveTo(cx, cy - 1.15 * s, cx + 0.75 * s, cy - 1.35 * s);
      ctx.lineTo(cx + 0.8 * s, cy - 0.62 * s);
      ctx.closePath();
      fs(ctx, o.hatColor || "#4a3e32", lw);
      ctx.fillStyle = "#1a1410";
      ctx.fillRect(cx - 0.8 * s, cy - 0.8 * s, 1.6 * s, 0.16 * s);
    } else if (o.bald) {
      // shiny dome with a fringe over the ears (and a few brave strands)
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ell(ctx, cx - 0.25 * s, cy - 0.7 * s, 0.28 * s, 0.12 * s, -0.3);
      ctx.fill();
      for (const sd of [-1, 1]) {
        ctx.beginPath();
        spline(
          ctx,
          [
            [cx + sd * 0.92 * s, cy - 0.1 * s],
            [cx + sd * 0.86 * s, cy - 0.5 * s],
            [cx + sd * 0.7 * s, cy - 0.62 * s],
            [cx + sd * 0.74 * s, cy - 0.2 * s],
          ],
          true,
        );
        fs(ctx, o.hairColor || "#8a7a6a", lw * 0.7);
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 0.4;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(cx - 0.1 * s + k * 0.1 * s, cy - 0.94 * s);
        ctx.quadraticCurveTo(
          cx + k * 0.1 * s,
          cy - 1.12 * s,
          cx + 0.1 * s + k * 0.1 * s,
          cy - 0.98 * s,
        );
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      spline(
        ctx,
        [
          [cx - 0.9 * s, cy - 0.2 * s],
          [cx - 0.8 * s, cy - 0.85 * s],
          [cx, cy - 1.15 * s],
          [cx + 0.8 * s, cy - 0.85 * s],
          [cx + 0.9 * s, cy - 0.2 * s],
          [cx + 0.6 * s, cy - 0.65 * s],
          [cx - 0.6 * s, cy - 0.7 * s],
        ],
        true,
      );
      fs(ctx, o.hairColor || "#3a2a1a", lw);
    }
    if (o.cap) {
      // peaked service cap with a badge
      ctx.beginPath();
      ctx.moveTo(cx - 0.95 * s, cy - 0.55 * s);
      ctx.quadraticCurveTo(cx - 1.0 * s, cy - 1.25 * s, cx, cy - 1.3 * s);
      ctx.quadraticCurveTo(
        cx + 1.0 * s,
        cy - 1.25 * s,
        cx + 0.95 * s,
        cy - 0.55 * s,
      );
      ctx.closePath();
      fs(ctx, o.cap, lw);
      ctx.beginPath();
      ctx.moveTo(cx - 0.98 * s, cy - 0.55 * s);
      ctx.quadraticCurveTo(cx, cy - 0.3 * s, cx + 0.98 * s, cy - 0.55 * s);
      ctx.quadraticCurveTo(cx, cy - 0.62 * s, cx - 0.98 * s, cy - 0.55 * s);
      fs(ctx, "#1a1a1a", lw);
      ell(ctx, cx, cy - 0.85 * s, 0.18 * s, 0.14 * s);
      fs(ctx, o.badge || "#e8c040", lw * 0.6);
    }
    if (o.beard) {
      // full professorial beard and moustache
      ctx.beginPath();
      spline(
        ctx,
        [
          [cx - 0.88 * s, cy + 0.15 * s],
          [cx - 0.75 * s, cy + 0.95 * s],
          [cx, cy + 1.45 * s],
          [cx + 0.75 * s, cy + 0.95 * s],
          [cx + 0.88 * s, cy + 0.15 * s],
          [cx + 0.45 * s, cy + 0.62 * s],
          [cx, cy + 0.72 * s],
          [cx - 0.45 * s, cy + 0.62 * s],
        ],
        true,
      );
      fs(ctx, o.beard, lw);
      ctx.beginPath();
      ctx.moveTo(cx - 0.55 * s, cy + 0.48 * s);
      ctx.quadraticCurveTo(cx, cy + 0.28 * s, cx + 0.55 * s, cy + 0.48 * s);
      ctx.quadraticCurveTo(cx, cy + 0.44 * s, cx - 0.55 * s, cy + 0.48 * s);
      fs(ctx, o.beard, lw * 0.8);
    }
    ctx.restore();
  };

  /** Freckled kid (for cereal ads). */
  A.kid = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = s * 0.07,
      SKIN = "#f8d2ac";
    ctx.save();
    bust(ctx, cx, cy, s * 0.9, o.shirt || "#e84a3a", lw);
    ctx.save();
    bust(ctx, cx, cy, s * 0.9, null, 0);
    ctx.clip();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (let y = cy + 1.4 * s; y < cy + 3 * s; y += 0.35 * s)
      ctx.fillRect(cx - 2 * s, y, 4 * s, 0.15 * s);
    ctx.restore();
    ctx.beginPath();
    ctx.rect(cx - 0.3 * s, cy + 0.6 * s, 0.6 * s, 0.6 * s);
    fs(ctx, SKIN, lw);
    for (const sd of [-1, 1]) {
      ell(ctx, cx + sd * 0.95 * s, cy + 0.1 * s, 0.25 * s, 0.3 * s);
      fs(ctx, SKIN, lw);
    }
    ell(ctx, cx, cy, 0.95 * s, 1.0 * s);
    fs(ctx, SKIN, lw);
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx - 0.95 * s, cy - 0.1 * s],
        [cx - 0.8 * s, cy - 0.8 * s],
        [cx, cy - 1.05 * s],
        [cx + 0.8 * s, cy - 0.8 * s],
        [cx + 0.95 * s, cy - 0.1 * s],
        [cx + 0.5 * s, cy - 0.55 * s],
        [cx - 0.5 * s, cy - 0.55 * s],
      ],
      true,
    );
    fs(ctx, o.hair || "#c8642a", lw);
    ctx.beginPath();
    ctx.moveTo(cx + 0.1 * s, cy - 1.0 * s);
    ctx.quadraticCurveTo(
      cx + 0.3 * s,
      cy - 1.5 * s,
      cx + 0.5 * s,
      cy - 1.2 * s,
    );
    fs(ctx, null, lw, o.hair || "#c8642a");
    for (const sd of [-1, 1]) {
      ell(ctx, cx + sd * 0.33 * s, cy - 0.05 * s, 0.16 * s, 0.2 * s);
      fs(ctx, "#fff", lw * 0.6);
      ell(ctx, cx + sd * 0.3 * s, cy - 0.02 * s, 0.08 * s, 0.1 * s);
      fs(ctx, INK);
    }
    ctx.fillStyle = "#b8683a";
    for (let k = 0; k < 10; k++) {
      ell(
        ctx,
        cx + (k % 2 ? 1 : -1) * (0.3 + (k % 5) * 0.06) * s,
        cy + (0.25 + (k % 3) * 0.06) * s,
        0.025 * s,
        0.025 * s,
      );
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy + 0.38 * s, 0.4 * s, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.closePath();
    fs(ctx, "#8a2020", lw * 0.7);
    ell(ctx, cx, cy + 0.66 * s, 0.14 * s, 0.07 * s);
    fs(ctx, "#e87070");
    ctx.restore();
  };

  // ==================================================================
  // PRODUCTS
  // ==================================================================
  // Fizzo bottle: tall, straight-sided, ring-ribbed body, long neck, round medallion label.
  const FIZZO_PROF = [
    [0, 0.05],
    [0.04, 0.05],
    [0.07, 0.043],
    [0.2, 0.046],
    [0.31, 0.072],
    [0.39, 0.106],
    [0.46, 0.118],
    [0.96, 0.118],
    [1, 0.108],
  ];
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
  A.car = function (ctx, cx, cy, L, o) {
    o = o || {};
    const x0 = cx - L / 2,
      lw = L * 0.008,
      body = o.body || "#d24a3a",
      top = o.top || "#f2ecd8";
    const P = (a, b) => [x0 + a * L, cy - b * L];
    ctx.save();
    ctx.lineJoin = "round";
    // shadow
    ell(ctx, cx, cy, L * 0.52, L * 0.025);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fill();
    // cabin
    ctx.beginPath();
    let p = P(0.34, 0.235);
    ctx.moveTo(p[0], p[1]);
    p = P(0.43, 0.36);
    ctx.lineTo(p[0], p[1]);
    let c = P(0.46, 0.38);
    p = P(0.53, 0.38);
    ctx.quadraticCurveTo(c[0], c[1], p[0], p[1]);
    p = P(0.68, 0.38);
    ctx.lineTo(p[0], p[1]);
    c = P(0.73, 0.375);
    p = P(0.78, 0.24);
    ctx.quadraticCurveTo(c[0], c[1], p[0], p[1]);
    ctx.closePath();
    fs(ctx, top, lw);
    // windows
    ctx.save();
    ctx.clip();
    ctx.fillStyle = grad(ctx, 0, cy - 0.38 * L, 0, cy - 0.24 * L, [
      [0, "#cfe6ee"],
      [1, "#5a8aa0"],
    ]);
    ctx.beginPath();
    p = P(0.37, 0.245);
    ctx.moveTo(p[0], p[1]);
    p = P(0.445, 0.355);
    ctx.lineTo(p[0], p[1]);
    p = P(0.58, 0.36);
    ctx.lineTo(p[0], p[1]);
    p = P(0.58, 0.245);
    ctx.lineTo(p[0], p[1]);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    p = P(0.605, 0.245);
    ctx.moveTo(p[0], p[1]);
    p = P(0.605, 0.36);
    ctx.lineTo(p[0], p[1]);
    p = P(0.68, 0.36);
    ctx.lineTo(p[0], p[1]);
    p = P(0.745, 0.245);
    ctx.lineTo(p[0], p[1]);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    p = P(0.47, 0.35);
    ctx.moveTo(p[0], p[1]);
    p = P(0.5, 0.35);
    ctx.lineTo(p[0], p[1]);
    p = P(0.44, 0.25);
    ctx.lineTo(p[0], p[1]);
    p = P(0.41, 0.25);
    ctx.lineTo(p[0], p[1]);
    ctx.fill();
    ctx.restore();
    // lower body with tail fin
    ctx.beginPath();
    const pts = [
      [0.02, 0.1],
      [0.015, 0.185],
      [0.06, 0.232],
      [0.22, 0.24],
      [0.72, 0.245],
      [0.9, 0.275],
      [0.985, 0.31],
      [0.99, 0.22],
      [0.995, 0.11],
      [0.96, 0.065],
      [0.05, 0.065],
    ];
    pts.forEach((q, i) => {
      const pp = P(q[0], q[1]);
      if (i) ctx.lineTo(pp[0], pp[1]);
      else ctx.moveTo(pp[0], pp[1]);
    });
    ctx.closePath();
    ctx.fillStyle = grad(ctx, 0, cy - 0.3 * L, 0, cy - 0.06 * L, [
      [0, X.css(X.shade(body, 0.25))],
      [0.45, body],
      [1, X.css(X.shade(body, -0.35))],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    // two-tone sweep & chrome spear
    ctx.beginPath();
    p = P(0.3, 0.2);
    ctx.moveTo(p[0], p[1]);
    c = P(0.7, 0.22);
    p = P(0.97, 0.26);
    ctx.quadraticCurveTo(c[0], c[1], p[0], p[1]);
    p = P(0.97, 0.2);
    ctx.lineTo(p[0], p[1]);
    c = P(0.7, 0.17);
    p = P(0.3, 0.2);
    ctx.quadraticCurveTo(c[0], c[1], p[0], p[1]);
    fs(ctx, top, lw * 0.6);
    lin(ctx, ...P(0.06, 0.16), ...P(0.93, 0.175), L * 0.008, "#e8eef0");
    // wheels (rear under a fender skirt)
    for (const [wx, skirt] of [
      [0.2, false],
      [0.8, true],
    ]) {
      const [px, py] = P(wx, 0.075),
        rr = L * 0.075;
      ctx.beginPath();
      ctx.arc(px, py, rr * 1.15, Math.PI, 0);
      ctx.fillStyle = "#141414";
      ctx.fill();
      ell(ctx, px, py, rr, rr);
      fs(ctx, "#161616", lw);
      if (!skirt) {
        ell(ctx, px, py, rr * 0.72, rr * 0.72);
        ctx.fillStyle = "#f4f0e6";
        ctx.fill();
        ell(ctx, px, py, rr * 0.45, rr * 0.45);
        ctx.fillStyle = rgrad(
          ctx,
          px - rr * 0.15,
          py - rr * 0.15,
          1,
          rr * 0.45,
          [
            [0, "#ffffff"],
            [1, "#8a9090"],
          ],
        );
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(px - rr * 1.2, py - rr * 0.1);
        ctx.quadraticCurveTo(px, py - rr * 1.25, px + rr * 1.2, py - rr * 0.1);
        ctx.lineTo(px + rr * 1.2, py + rr * 0.2);
        ctx.lineTo(px - rr * 1.2, py + rr * 0.2);
        ctx.closePath();
        fs(ctx, body, lw);
      }
    }
    // bumpers, headlight, taillight
    X.rrect(ctx, ...P(-0.01, 0.105), L * 0.08, L * 0.035, L * 0.015);
    ctx.fillStyle = grad(ctx, 0, cy - 0.105 * L, 0, cy - 0.07 * L, [
      [0, "#ffffff"],
      [1, "#7a8888"],
    ]);
    ctx.fill();
    fs(ctx, null, lw * 0.6);
    X.rrect(ctx, ...P(0.93, 0.105), L * 0.08, L * 0.035, L * 0.015);
    ctx.fill();
    fs(ctx, null, lw * 0.6);
    ell(ctx, ...P(0.03, 0.19), L * 0.018, L * 0.024);
    fs(ctx, "#fff8d0", lw * 0.8);
    ctx.beginPath();
    const tl = P(0.975, 0.26);
    ctx.moveTo(tl[0], tl[1]);
    ctx.lineTo(tl[0] + L * 0.012, tl[1] - L * 0.03);
    ctx.lineTo(tl[0] + L * 0.014, tl[1] + L * 0.025);
    ctx.closePath();
    fs(ctx, "#ff2a1a", lw * 0.5);
    ctx.restore();
  };
  /** Console television with rabbit ears. Returns screen rect. */
  A.tv = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = s * 0.03,
      w = s * 1.6,
      h = s * 1.3,
      x = cx - w / 2,
      y = cy - h / 2;
    ctx.save();
    lin(ctx, cx, y, cx - s * 0.5, y - s * 0.7, lw * 0.8);
    lin(ctx, cx, y, cx + s * 0.55, y - s * 0.65, lw * 0.8);
    ell(ctx, cx - s * 0.5, y - s * 0.7, s * 0.04, s * 0.04);
    fs(ctx, "#c0c0c0", lw * 0.5);
    ell(ctx, cx + s * 0.55, y - s * 0.65, s * 0.04, s * 0.04);
    fs(ctx, "#c0c0c0", lw * 0.5);
    ell(ctx, cx, y, s * 0.15, s * 0.07);
    fs(ctx, "#3a3a3a", lw * 0.6);
    for (const lx of [x + w * 0.15, x + w * 0.85]) {
      ctx.beginPath();
      ctx.moveTo(lx, y + h);
      ctx.lineTo(lx + (lx < cx ? -1 : 1) * s * 0.12, y + h + s * 0.35);
      fs(ctx, null, lw * 1.5, "#3a2a1a");
    }
    X.rrect(ctx, x, y, w, h, s * 0.12);
    ctx.fillStyle = grad(ctx, x, y, x, y + h, [
      [0, o.cabinet || "#8a5a32"],
      [1, X.css(X.shade(o.cabinet || "#8a5a32", -0.4))],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    const sx = x + w * 0.08,
      sy = y + h * 0.1,
      sw = w * 0.64,
      sh = h * 0.78;
    X.rrect(
      ctx,
      sx - s * 0.03,
      sy - s * 0.03,
      sw + s * 0.06,
      sh + s * 0.06,
      s * 0.14,
    );
    fs(ctx, "#c8c0a8", lw * 0.6);
    X.rrect(ctx, sx, sy, sw, sh, s * 0.12);
    ctx.fillStyle = rgrad(ctx, sx + sw * 0.45, sy + sh * 0.4, 1, sw * 0.7, [
      [0, o.glow || "#d8f0e8"],
      [0.6, "#7a9a90"],
      [1, "#2a3a36"],
    ]);
    ctx.fill();
    fs(ctx, null, lw * 0.6);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ell(ctx, sx + sw * 0.3, sy + sh * 0.25, sw * 0.2, sh * 0.1, -0.4);
    ctx.fill();
    for (let k = 0; k < 2; k++) {
      ell(ctx, x + w * 0.86, y + h * (0.25 + k * 0.25), s * 0.08, s * 0.08);
      fs(ctx, "#d8c890", lw * 0.6);
    }
    for (let k = 0; k < 5; k++)
      lin(
        ctx,
        x + w * 0.78,
        y + h * (0.62 + k * 0.06),
        x + w * 0.94,
        y + h * (0.62 + k * 0.06),
        lw * 0.5,
        "rgba(0,0,0,0.5)",
      );
    ctx.restore();
    return { x: sx, y: sy, w: sw, h: sh };
  };
  /** 3/4 view product box. front(ctx,x,y,w,h) draws the face art (clipped). */
  A.box3d = function (ctx, x, y, w, h, d, front, side, topc) {
    const lw = Math.max(1.5, w * 0.015),
      dy = d * 0.55;
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + w + d, y - dy);
    ctx.lineTo(x + w + d, y + h - dy);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    fs(ctx, side || "#8a2a1a", lw);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + d, y - dy);
    ctx.lineTo(x + w + d, y - dy);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    fs(ctx, topc || "#e8e0c8", lw);
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.save();
    ctx.clip();
    front(ctx, x, y, w, h);
    ctx.restore();
    fs(ctx, null, lw);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(x + w * 0.85, y, w * 0.15, h);
    ctx.restore();
  };
  /** Tin can. label(ctx,x,y,w,h) draws the paper label (clipped). */
  A.can = function (ctx, cx, cy, w, h, label, lid) {
    const lw = w * 0.025,
      x = cx - w / 2,
      y = cy - h / 2,
      e = w * 0.16;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + h);
    ctx.ellipse(cx, y + h, w / 2, e, 0, Math.PI, 0, true);
    ctx.lineTo(x + w, y);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, x, 0, x + w, 0, [
      [0, "#6a6a68"],
      [0.3, "#e8e8e0"],
      [0.6, "#9a9a94"],
      [1, "#4a4a48"],
    ]);
    ctx.fill();
    ctx.save();
    ctx.clip();
    label(ctx, x, y + h * 0.1, w, h * 0.82);
    ctx.fillStyle = grad(ctx, x, 0, x + w, 0, [
      [0, "rgba(0,0,0,0.45)"],
      [0.3, "rgba(255,255,255,0.15)"],
      [0.6, "rgba(0,0,0,0)"],
      [1, "rgba(0,0,0,0.5)"],
    ]);
    ctx.fillRect(x, y, w, h + e);
    ctx.restore();
    fs(ctx, null, lw);
    ell(ctx, cx, y, w / 2, e);
    ctx.fillStyle = rgrad(ctx, cx - w * 0.15, y - e * 0.3, 1, w * 0.6, [
      [0, "#f8f8f0"],
      [1, lid || "#8a8a84"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ell(ctx, cx, y, w * 0.42, e * 0.8);
    fs(ctx, null, lw * 0.5, "rgba(0,0,0,0.4)");
    ctx.restore();
  };
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
  A.goggles = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = s * 0.04,
      rub = o.rubber || "#2a2c2e",
      glow = o.glow || "#cfeefa";
    ctx.save();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - s * 1.95, cy + s * 0.15);
    ctx.bezierCurveTo(
      cx - s * 2.2,
      cy - s * 0.7,
      cx - s * 1.5,
      cy - s * 0.3,
      cx - s * 1.1,
      cy - s * 0.15,
    );
    ctx.moveTo(cx + s * 1.95, cy + s * 0.15);
    ctx.bezierCurveTo(
      cx + s * 2.2,
      cy - s * 0.7,
      cx + s * 1.5,
      cy - s * 0.3,
      cx + s * 1.1,
      cy - s * 0.15,
    );
    ctx.strokeStyle = INK;
    ctx.lineWidth = s * 0.34;
    ctx.stroke();
    ctx.strokeStyle = "#6a5038";
    ctx.lineWidth = s * 0.26;
    ctx.stroke();
    X.rrect(ctx, cx - s * 1.25, cy - s * 0.55, s * 2.5, s * 1.1, s * 0.4);
    fs(ctx, "#4a4e50", lw);
    for (const d of [-1, 1]) {
      const lx = cx + d * s * 0.62;
      ell(ctx, lx, cy, s * 0.56, s * 0.56);
      fs(ctx, rub, lw);
      ell(ctx, lx, cy, s * 0.44, s * 0.44);
      ctx.fillStyle = rgrad(ctx, lx - s * 0.1, cy - s * 0.1, 1, s * 0.44, [
        [0, "#ffffff"],
        [0.35, glow],
        [1, "#1c5a6a"],
      ]);
      ctx.fill();
      fs(ctx, null, lw * 0.8, "#8a9094");
      ctx.save();
      ell(ctx, lx, cy, s * 0.42, s * 0.42);
      ctx.clip();
      for (let k = -3; k <= 3; k++)
        lin(
          ctx,
          lx - s * 0.5,
          cy + k * s * 0.12,
          lx + s * 0.5,
          cy + k * s * 0.12,
          Math.max(1, s * 0.01),
          "rgba(20,70,90,0.35)",
        );
      ctx.strokeStyle = "rgba(20,70,90,0.55)";
      ctx.lineWidth = Math.max(1, s * 0.015);
      ctx.beginPath();
      ctx.arc(lx, cy, s * 0.2, 0, TAU);
      ctx.stroke();
      lin(
        ctx,
        lx - s * 0.3,
        cy,
        lx + s * 0.3,
        cy,
        Math.max(1, s * 0.015),
        "rgba(20,70,90,0.55)",
      );
      ctx.restore();
      ell(ctx, lx - s * 0.16, cy - s * 0.18, s * 0.1, s * 0.05, -0.6);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fill();
    }
    ctx.beginPath();
    ctx.rect(cx - s * 0.12, cy - s * 0.15, s * 0.24, s * 0.2);
    fs(ctx, "#3a3e40", lw * 0.6);
    X.rrect(ctx, cx - s * 0.95, cy - s * 0.82, s * 0.5, s * 0.26, s * 0.06);
    fs(ctx, "#5a5e60", lw * 0.7);
    ell(ctx, cx - s * 0.7, cy - s * 0.69, s * 0.09, s * 0.09);
    fs(ctx, "#fff6d8", lw * 0.4);
    if (o.label !== false)
      X.text(ctx, "VIGIL", cx + s * 0.62, cy + s * 0.72, {
        font: "mono",
        size: s * 0.16,
        color: "#c8d0d4",
        spacing: s * 0.03,
        noSafe: true,
      });
    ctx.restore();
  };
  /** Teletype printer on a stand: keyboard, platen, a curl of printed paper. gy = floor. */
  A.teletype = function (ctx, cx, gy, s, o) {
    o = o || {};
    const lw = s * 0.03,
      body = o.body || "#9aa29a";
    ctx.save();
    ctx.lineJoin = "round";
    for (const d of [-1, 1])
      lin(
        ctx,
        cx + d * s * 0.8,
        gy - s * 0.9,
        cx + d * s * 0.9,
        gy,
        s * 0.08,
        "#3a3a38",
      );
    lin(
      ctx,
      cx - s * 0.85,
      gy - s * 0.3,
      cx + s * 0.85,
      gy - s * 0.3,
      s * 0.05,
      "#3a3a38",
    );
    ctx.beginPath();
    ctx.moveTo(cx - s * 1.0, gy - s * 0.9);
    ctx.lineTo(cx + s * 1.0, gy - s * 0.9);
    ctx.lineTo(cx + s * 0.9, gy - s * 1.6);
    ctx.lineTo(cx - s * 0.9, gy - s * 1.6);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, 0, gy - s * 1.6, 0, gy - s * 0.9, [
      [0, X.css(X.shade(body, 0.2))],
      [1, X.css(X.shade(body, -0.3))],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    for (let row = 0; row < 3; row++)
      for (let k = 0; k < 9 - row; k++) {
        ell(
          ctx,
          cx - s * 0.62 + row * s * 0.06 + k * s * 0.14,
          gy - s * (1.05 + row * 0.12),
          s * 0.05,
          s * 0.035,
        );
        fs(ctx, "#2a2a28", lw * 0.4);
      }
    X.rrect(ctx, cx - s * 0.8, gy - s * 1.95, s * 1.6, s * 0.38, s * 0.12);
    fs(ctx, X.css(X.shade(body, -0.1)), lw);
    ctx.beginPath();
    ctx.rect(cx - s * 0.7, gy - s * 1.98, s * 1.4, s * 0.1);
    fs(ctx, "#1a1a18", lw * 0.6);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.55, gy - s * 1.95);
    ctx.lineTo(cx - s * 0.5, gy - s * 2.7);
    ctx.quadraticCurveTo(
      cx - s * 0.45,
      gy - s * 2.95,
      cx - s * 0.2,
      gy - s * 2.9,
    );
    ctx.lineTo(cx + s * 0.6, gy - s * 2.9);
    ctx.quadraticCurveTo(
      cx + s * 0.5,
      gy - s * 2.75,
      cx + s * 0.55,
      gy - s * 2.6,
    );
    ctx.lineTo(cx + s * 0.55, gy - s * 1.95);
    ctx.closePath();
    fs(ctx, "#f6f0dc", lw * 0.7);
    for (let k = 0; k < 6; k++)
      lin(
        ctx,
        cx - s * 0.42,
        gy - s * (2.08 + k * 0.1),
        cx - s * 0.42 + s * (0.5 + ((k * 37) % 5) * 0.08),
        gy - s * (2.08 + k * 0.1),
        Math.max(1, s * 0.022),
        "rgba(40,40,40,0.65)",
      );
    ctx.restore();
  };
  /** Mainframe bank: cabinets with reel-to-reel tape drives and lamp panels. x,y = top-left. */
  A.mainframe = function (ctx, x, y, w, h, o) {
    o = o || {};
    const n = o.n || 3,
      cw = w / n,
      lw = Math.max(1.5, w * 0.006),
      body = o.body || "#c8ccc4";
    ctx.save();
    for (let i = 0; i < n; i++) {
      const x0 = x + i * cw;
      ctx.beginPath();
      ctx.rect(x0, y, cw, h);
      ctx.fillStyle = grad(ctx, x0, 0, x0 + cw, 0, [
        [0, X.css(X.shade(body, 0.15))],
        [1, X.css(X.shade(body, -0.25))],
      ]);
      ctx.fill();
      fs(ctx, null, lw);
      if (i % 2 === 0) {
        X.rrect(
          ctx,
          x0 + cw * 0.1,
          y + h * 0.08,
          cw * 0.8,
          h * 0.42,
          cw * 0.05,
        );
        fs(ctx, "#2a2e30", lw);
        for (const d of [-1, 1]) {
          const rx = x0 + cw * (0.5 + d * 0.2),
            ry = y + h * 0.29,
            rr = cw * 0.16;
          ell(ctx, rx, ry, rr, rr);
          fs(ctx, "#d8dcd8", lw * 0.6);
          ell(ctx, rx, ry, rr * 0.35, rr * 0.35);
          fs(ctx, "#5a5e60", lw * 0.5);
          for (let k = 0; k < 3; k++) {
            const a = (k / 3) * TAU + d;
            lin(
              ctx,
              rx + Math.cos(a) * rr * 0.4,
              ry + Math.sin(a) * rr * 0.4,
              rx + Math.cos(a) * rr * 0.9,
              ry + Math.sin(a) * rr * 0.9,
              lw * 0.6,
              "#6a6e70",
            );
          }
        }
      } else {
        for (let rw = 0; rw < 6; rw++)
          for (let c = 0; c < 4; c++) {
            const lit = (rw * 7 + c * 3 + i) % 5 < 2;
            ell(
              ctx,
              x0 + cw * (0.2 + c * 0.2),
              y + h * (0.1 + rw * 0.07),
              cw * 0.045,
              cw * 0.045,
            );
            fs(
              ctx,
              lit ? ["#ffb030", "#ff4a2a", "#f4f0d0"][(rw + c) % 3] : "#3a3a38",
              lw * 0.3,
            );
          }
      }
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      for (let k = 0; k < 5; k++)
        ctx.fillRect(
          x0 + cw * 0.12,
          y + h * (0.62 + k * 0.06),
          cw * 0.76,
          h * 0.02,
        );
    }
    ctx.restore();
  };
  /** Long Winter cryo pod (upright capsule) with a frosted window and a peaceful sleeper; cy = centre. */
  A.cryoPod = function (ctx, cx, cy, s, o) {
    o = o || {};
    const lw = s * 0.04,
      shell = o.shell || "#dfe6ea",
      band = o.band || "#e8742a";
    ctx.save();
    ctx.lineJoin = "round";
    X.rrect(ctx, cx - s * 0.6, cy - s * 1.6, s * 1.2, s * 3.2, s * 0.55);
    ctx.fillStyle = grad(ctx, cx - s * 0.6, 0, cx + s * 0.6, 0, [
      [0, "#ffffff"],
      [0.45, shell],
      [1, X.css(X.shade(shell, -0.35))],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    X.rrect(ctx, cx - s * 0.42, cy - s * 1.3, s * 0.84, s * 1.5, s * 0.38);
    fs(ctx, "#9ac8d8", lw * 0.8);
    ctx.save();
    X.rrect(ctx, cx - s * 0.42, cy - s * 1.3, s * 0.84, s * 1.5, s * 0.38);
    ctx.clip();
    if (o.sleeper !== false) {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.42, cy + s * 0.2);
      ctx.quadraticCurveTo(cx - s * 0.35, cy - s * 0.4, cx, cy - s * 0.42);
      ctx.quadraticCurveTo(
        cx + s * 0.35,
        cy - s * 0.4,
        cx + s * 0.42,
        cy + s * 0.2,
      );
      ctx.closePath();
      fs(ctx, "#d8dcdc", lw * 0.6);
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.2, cy - s * 0.42);
      ctx.quadraticCurveTo(cx, cy - s * 0.3, cx + s * 0.2, cy - s * 0.42);
      fs(ctx, null, s * 0.07, band);
      ell(ctx, cx, cy - s * 0.75, s * 0.24, s * 0.3);
      fs(ctx, "#f0d4bc", lw * 0.6);
      for (const d of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(
          cx + d * s * 0.09,
          cy - s * 0.8,
          s * 0.05,
          0.15 * Math.PI,
          0.85 * Math.PI,
        );
        fs(ctx, null, lw * 0.5);
      }
      ctx.beginPath();
      ctx.arc(cx, cy - s * 0.64, s * 0.06, 0.2 * Math.PI, 0.8 * Math.PI);
      fs(ctx, null, lw * 0.4);
    }
    ctx.fillStyle = "rgba(235,248,255,0.35)";
    ctx.fillRect(cx - s * 0.5, cy - s * 1.4, s, s * 1.7);
    for (let k = 0; k < 6; k++)
      A.snowflake(
        ctx,
        cx + (k % 2 ? 0.3 : -0.32) * s,
        cy + (k < 2 ? -1.15 : k < 4 ? 0.05 : -0.5) * s,
        s * 0.09,
        "rgba(255,255,255,0.75)",
        Math.max(1, s * 0.012),
      );
    ctx.restore();
    ctx.fillStyle = band;
    ctx.fillRect(cx - s * 0.6 + lw / 2, cy + s * 0.45, s * 1.2 - lw, s * 0.16);
    for (let k = 0; k < 3; k++) {
      ell(ctx, cx - s * 0.2 + k * s * 0.2, cy + s * 0.9, s * 0.05, s * 0.05);
      fs(ctx, ["#7ad0f0", "#f4f0d0", "#7ad06a"][k], lw * 0.4);
    }
    if (o.label)
      X.text(ctx, o.label, cx, cy + s * 1.25, {
        font: "stencil",
        size: s * 0.22,
        color: "#3a4448",
        maxW: s * 0.9,
        noSafe: true,
      });
    ctx.restore();
  };
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
  A.skyline = function (ctx, x0, gy, w, h, col, r) {
    ctx.save();
    ctx.fillStyle = col;
    let x = x0;
    const rr = r || X.rng(5);
    while (x < x0 + w) {
      const bw = w * (0.03 + rr() * 0.05),
        bh = h * (0.25 + rr() * 0.5);
      ctx.fillRect(x, gy - bh, bw, bh);
      if (rr() < 0.3)
        ctx.fillRect(x + bw * 0.25, gy - bh - h * 0.08, bw * 0.5, h * 0.08);
      x += bw * (0.9 + rr() * 0.3);
    }
    const es = x0 + w * 0.35; // Empire State
    ctx.fillRect(es - w * 0.03, gy - h * 0.8, w * 0.06, h * 0.8);
    ctx.fillRect(es - w * 0.02, gy - h * 0.92, w * 0.04, h * 0.12);
    ctx.fillRect(es - w * 0.01, gy - h * 1.0, w * 0.02, h * 0.08);
    ctx.fillRect(es - w * 0.002, gy - h * 1.15, w * 0.004, h * 0.15);
    const cb = x0 + w * 0.62; // Chrysler crown
    ctx.fillRect(cb - w * 0.025, gy - h * 0.7, w * 0.05, h * 0.7);
    ctx.beginPath();
    ctx.moveTo(cb - w * 0.025, gy - h * 0.7);
    ctx.quadraticCurveTo(cb - w * 0.02, gy - h * 0.9, cb, gy - h * 1.1);
    ctx.quadraticCurveTo(
      cb + w * 0.02,
      gy - h * 0.9,
      cb + w * 0.025,
      gy - h * 0.7,
    );
    ctx.fill();
    ctx.restore();
  };
  A.crown = function (ctx, cx, cy, w, col) {
    const h = w * 0.6,
      lw = w * 0.04;
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, cy + h / 2);
    ctx.lineTo(cx - w / 2, cy - h * 0.2);
    ctx.lineTo(cx - w * 0.25, cy + h * 0.05);
    ctx.lineTo(cx, cy - h / 2);
    ctx.lineTo(cx + w * 0.25, cy + h * 0.05);
    ctx.lineTo(cx + w / 2, cy - h * 0.2);
    ctx.lineTo(cx + w / 2, cy + h / 2);
    ctx.closePath();
    fs(ctx, col || "#f0c030", lw);
    for (const p of [
      [-0.5, -0.2],
      [0, -0.5],
      [0.5, -0.2],
    ]) {
      ell(ctx, cx + p[0] * w, cy + p[1] * h, w * 0.07, w * 0.07);
      fs(ctx, "#e83a2a", lw * 0.6);
    }
  };
  /** Light bulb with glow. */
  A.bulb = function (ctx, cx, cy, r, o) {
    o = o || {};
    ctx.save();
    if (o.glow !== false) {
      ctx.fillStyle = rgrad(ctx, cx, cy, r * 0.2, r * 2.4, [
        [0, "rgba(255,240,170,0.75)"],
        [1, "rgba(255,220,120,0)"],
      ]);
      ctx.fillRect(cx - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8);
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.8, Math.PI * 0.2);
    ctx.lineTo(cx + r * 0.38, cy + r * 1.15);
    ctx.lineTo(cx - r * 0.38, cy + r * 1.15);
    ctx.closePath();
    fs(ctx, o.color || "#fff6c8", r * 0.06);
    ctx.strokeStyle = "#c87a1a";
    ctx.lineWidth = r * 0.05;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.2, cy + r * 0.5);
    ctx.lineTo(cx - r * 0.12, cy - r * 0.1);
    ctx.lineTo(cx, cy + r * 0.15);
    ctx.lineTo(cx + r * 0.12, cy - r * 0.1);
    ctx.lineTo(cx + r * 0.2, cy + r * 0.5);
    ctx.stroke();
    for (let k = 0; k < 3; k++) {
      X.rrect(
        ctx,
        cx - r * 0.42,
        cy + r * (1.15 + k * 0.17),
        r * 0.84,
        r * 0.16,
        r * 0.05,
      );
      fs(ctx, "#a8aca8", r * 0.04);
    }
    ctx.beginPath();
    ctx.arc(cx, cy + r * 1.66, r * 0.2, 0, Math.PI);
    fs(ctx, "#3a3a38");
    ctx.restore();
  };
  /** Steel lattice transmission tower. gy = ground, h = height. */
  A.pylon = function (ctx, cx, gy, h, col) {
    ctx.save();
    ctx.strokeStyle = X.css(col || "#3a3e44");
    ctx.lineWidth = Math.max(1.2, h * 0.012);
    ctx.lineJoin = "round";
    const w0 = h * 0.22,
      w1 = h * 0.05,
      top = gy - h;
    const P2 = (pts) => {
      ctx.beginPath();
      pts.forEach((p, i) =>
        i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]),
      );
      ctx.stroke();
    };
    P2([
      [cx - w0, gy],
      [cx - w1, top + h * 0.15],
      [cx, top],
      [cx + w1, top + h * 0.15],
      [cx + w0, gy],
    ]);
    for (let k = 0; k < 7; k++) {
      const t0 = k / 7,
        t1 = (k + 1) / 7,
        y0 = gy - t0 * h * 0.85,
        y1 = gy - t1 * h * 0.85,
        a0 = w0 + (w1 - w0) * t0,
        a1 = w0 + (w1 - w0) * t1;
      P2([
        [cx - a0, y0],
        [cx + a1, y1],
      ]);
      P2([
        [cx + a0, y0],
        [cx - a1, y1],
      ]);
      P2([
        [cx - a1, y1],
        [cx + a1, y1],
      ]);
    }
    for (const [y, w] of [
      [top + h * 0.2, h * 0.3],
      [top + h * 0.38, h * 0.24],
    ]) {
      P2([
        [cx - w, y],
        [cx + w, y],
      ]);
      P2([
        [cx - w, y],
        [cx - w1 * 1.5, y + h * 0.06],
      ]);
      P2([
        [cx + w, y],
        [cx + w1 * 1.5, y + h * 0.06],
      ]);
      for (const d of [-1, 1])
        P2([
          [cx + d * w * 0.9, y],
          [cx + d * w * 0.9, y + h * 0.05],
        ]);
    }
    ctx.restore();
  };
  /** 1964 World's Fair globe: meridian/parallel lattice, continents, three offset orbit rings, tripod base. */
  A.unisphere = function (ctx, cx, cy, r, o) {
    o = o || {};
    const steel = o.steel || "#c8d0d4",
      land = o.land || "#9aa6aa",
      lw = Math.max(1.2, r * 0.018);
    ctx.save();
    ctx.lineJoin = "round";
    for (const d of [-1, 0, 1])
      lin(
        ctx,
        cx,
        cy + r * 0.9,
        cx + d * r * 0.45,
        cy + r * 1.35,
        lw * 2.2,
        steel,
      );
    ell(ctx, cx, cy + r * 1.38, r * 0.6, r * 0.08);
    fs(ctx, "rgba(0,0,0,0.25)");
    const rings = [
      [1.32, 0.42, -0.35],
      [1.22, 0.34, 0.5],
      [1.4, 0.28, 0.12],
    ];
    ctx.strokeStyle = steel;
    ctx.lineWidth = lw * 1.4;
    for (const [rx, ry, rot] of rings) {
      ctx.beginPath();
      ctx.ellipse(cx, cy - r * 0.05, r * rx, r * ry, rot, Math.PI, TAU);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.fillStyle = "rgba(200,220,230,0.12)";
    ctx.fill();
    ctx.strokeStyle = steel;
    ctx.lineWidth = lw * 1.5;
    ctx.stroke();
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    ctx.clip();
    ctx.fillStyle = land;
    const rr = X.rng(64);
    for (const [x, y, ax, ay] of [
      [-0.45, -0.3, 0.32, 0.36],
      [-0.25, 0.35, 0.18, 0.38],
      [0.25, -0.35, 0.36, 0.22],
      [0.35, 0.15, 0.18, 0.32],
      [0.6, -0.1, 0.2, 0.2],
    ]) {
      X.smoothBlob(ctx, cx + x * r, cy + y * r, ax * r, ay * r, rr, 10, 0.35);
      ctx.fill();
    }
    ctx.strokeStyle = steel;
    ctx.lineWidth = lw * 0.7;
    for (let k = -3; k <= 3; k++) {
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        Math.max(0.5, Math.abs(r * Math.sin(((k / 3.5) * Math.PI) / 2))),
        r,
        0,
        0,
        TAU,
      );
      ctx.stroke();
    }
    for (let k = -3; k <= 3; k++) {
      const y = cy + k * r * 0.26,
        hw = Math.sqrt(Math.max(0, r * r - (k * r * 0.26) ** 2));
      lin(ctx, cx - hw, y, cx + hw, y, lw * 0.7, steel);
    }
    ctx.restore();
    ctx.strokeStyle = steel;
    ctx.lineWidth = lw * 1.4;
    for (const [rx, ry, rot] of rings) {
      ctx.beginPath();
      ctx.ellipse(cx, cy - r * 0.05, r * rx, r * ry, rot, 0, Math.PI);
      ctx.stroke();
    }
    for (const [rx, ry, rot] of rings) {
      const a = 0.6,
        x =
          cx +
          Math.cos(rot) * Math.cos(a) * r * rx -
          Math.sin(rot) * Math.sin(a) * r * ry,
        y =
          cy -
          r * 0.05 +
          Math.sin(rot) * Math.cos(a) * r * rx +
          Math.cos(rot) * Math.sin(a) * r * ry;
      ell(ctx, x, y, r * 0.06, r * 0.06);
      fs(ctx, "#f4f0e0", lw * 0.6);
    }
    ctx.restore();
  };
  /** Six-armed frost crystal (Project Long Winter). */
  A.snowflake = function (ctx, cx, cy, r, col, lw) {
    ctx.save();
    ctx.strokeStyle = X.css(col || "#ffffff");
    ctx.lineWidth = lw || r * 0.12;
    ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU - Math.PI / 2,
        ca = Math.cos(a),
        sa = Math.sin(a);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + ca * r, cy + sa * r);
      ctx.stroke();
      for (const t of [0.45, 0.72]) {
        const bx = cx + ca * r * t,
          by = cy + sa * r * t,
          bl = r * (t < 0.5 ? 0.3 : 0.2);
        for (const d of [-1, 1]) {
          const b = a + (d * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(b) * bl, by + Math.sin(b) * bl);
          ctx.stroke();
        }
      }
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.12, 0, TAU);
    ctx.fillStyle = X.css(col || "#ffffff");
    ctx.fill();
    ctx.restore();
  };
  /** Office of Civil Defense mark: disc, white triangle, orange inner triangle, "OCD". */
  A.ocd = function (ctx, cx, cy, r, o) {
    o = o || {};
    const disc = o.disc || "#1c2e52";
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    fs(ctx, disc, r * 0.06, o.ink || INK);
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.78);
    ctx.lineTo(cx + r * 0.7, cy + r * 0.45);
    ctx.lineTo(cx - r * 0.7, cy + r * 0.45);
    ctx.closePath();
    ctx.fillStyle = o.tri || "#f4f0e4";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.5);
    ctx.lineTo(cx + r * 0.46, cy + r * 0.3);
    ctx.lineTo(cx - r * 0.46, cy + r * 0.3);
    ctx.closePath();
    ctx.strokeStyle = o.inner || "#e8742a";
    ctx.lineWidth = r * 0.07;
    ctx.stroke();
    X.text(ctx, "OCD", cx, cy + r * 0.1, {
      font: "deco",
      size: r * 0.28,
      color: disc,
      maxW: r * 0.62,
      noSafe: true,
    });
    ctx.restore();
  };
  /** Project Long Winter emblem: frost crystal in a ring, optional ring lettering. */
  A.longWinter = function (ctx, cx, cy, r, o) {
    o = o || {};
    const ring = o.ring || "#1c2e52",
      disc = o.disc || "#eef4f6",
      flake = o.flake || "#3a6a8a",
      acc = o.accent || "#e8742a";
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    fs(ctx, ring, r * 0.04, o.ink || INK);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.66, 0, TAU);
    fs(ctx, disc, r * 0.035, acc);
    A.snowflake(ctx, cx, cy, r * 0.5, flake, r * 0.07);
    if (o.text !== false && r > 30) {
      X.arcText(
        ctx,
        o.top || "PROJECT LONG WINTER",
        cx,
        cy,
        r * 0.83,
        -Math.PI / 2,
        { font: "deco", size: r * 0.16, color: disc },
      );
      X.arcText(
        ctx,
        o.bottom || "CIVIL DEFENSE",
        cx,
        cy,
        r * 0.83,
        Math.PI / 2,
        {
          font: "condensed",
          size: r * 0.14,
          color: acc,
          inside: true,
          spacing: r * 0.02,
        },
      );
    }
    ctx.restore();
  };
  /** Glowkeepers sun disc: solid disc, inner ring and TWELVE straight rays (alternating long and short) — Nicole's twelve-ray sun. */
  A.sunDisc = function (ctx, cx, cy, r, o) {
    o = o || {};
    const col = o.color || "#f2b23a",
      ink = o.ink === undefined ? INK : o.ink,
      n = o.rays || 12;
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU - Math.PI / 2,
        rr = i % 2 ? r * 0.8 : r,
        w = (TAU / n) * 0.22;
      ctx.moveTo(
        cx + Math.cos(a - w) * r * 0.5,
        cy + Math.sin(a - w) * r * 0.5,
      );
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      ctx.lineTo(
        cx + Math.cos(a + w) * r * 0.5,
        cy + Math.sin(a + w) * r * 0.5,
      );
      ctx.closePath();
    }
    ctx.fillStyle = X.css(col);
    ctx.fill();
    if (ink) {
      ctx.strokeStyle = X.css(ink);
      ctx.lineWidth = r * 0.025;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, TAU);
    ctx.fillStyle = X.css(col);
    ctx.fill();
    if (ink) {
      ctx.lineWidth = r * 0.03;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.36, 0, TAU);
    ctx.strokeStyle = X.css(o.inner || X.shade(col, -0.35));
    ctx.lineWidth = r * 0.06;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.18, 0, TAU);
    ctx.fillStyle = X.css(o.core || "#fff6d8");
    ctx.fill();
    ctx.restore();
  };
  /** Iron Covenant emblem: riveted heater shield, an upright lance with pennant gripped by an iron gauntlet. s = height. */
  A.covenant = function (ctx, cx, cy, s, pal) {
    pal = pal || {};
    const ink = pal.ink || "#15120e",
      iron = pal.iron || "#6e7276",
      field = pal.field || "#8a2a1e",
      steel = pal.steel || "#d8d4c8",
      lw = Math.max(1.5, s * 0.014);
    ctx.save();
    ctx.lineJoin = "round";
    const top = cy - s * 0.46,
      w = s * 0.4;
    const shield = (k) => {
      ctx.beginPath();
      ctx.moveTo(cx - w * k, top + s * (1 - k) * 0.06);
      ctx.lineTo(cx + w * k, top + s * (1 - k) * 0.06);
      ctx.lineTo(cx + w * k, cy + s * 0.02);
      ctx.quadraticCurveTo(
        cx + w * k * 0.95,
        cy + s * 0.32 * k,
        cx,
        cy + s * 0.48 * k,
      );
      ctx.quadraticCurveTo(
        cx - w * k * 0.95,
        cy + s * 0.32 * k,
        cx - w * k,
        cy + s * 0.02,
      );
      ctx.closePath();
    };
    shield(1);
    ctx.fillStyle = iron;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = lw * 1.4;
    ctx.stroke();
    shield(0.84);
    ctx.fillStyle = field;
    ctx.fill();
    ctx.lineWidth = lw;
    ctx.stroke();
    for (let k = 0; k < 7; k++) {
      ell(
        ctx,
        cx - w * 0.92 + k * w * 0.307,
        top + s * 0.035,
        s * 0.016,
        s * 0.016,
      );
      fs(ctx, steel, lw * 0.5, ink);
    }
    for (const d of [-1, 1])
      for (let k = 1; k < 4; k++) {
        ell(
          ctx,
          cx + d * w * 0.92,
          top + s * (0.035 + k * 0.13),
          s * 0.016,
          s * 0.016,
        );
        fs(ctx, steel, lw * 0.5, ink);
      }
    ctx.beginPath();
    ctx.rect(cx - s * 0.018, top + s * 0.1, s * 0.036, s * 0.72);
    fs(ctx, steel, lw, ink);
    ctx.beginPath();
    ctx.moveTo(cx, top - s * 0.04);
    ctx.lineTo(cx + s * 0.045, top + s * 0.11);
    ctx.lineTo(cx - s * 0.045, top + s * 0.11);
    ctx.closePath();
    fs(ctx, steel, lw, ink);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.018, top + s * 0.14);
    ctx.lineTo(cx - s * 0.26, top + s * 0.18);
    ctx.lineTo(cx - s * 0.18, top + s * 0.22);
    ctx.lineTo(cx - s * 0.26, top + s * 0.27);
    ctx.lineTo(cx - s * 0.018, top + s * 0.28);
    ctx.closePath();
    fs(ctx, steel, lw, ink);
    const fy = cy - s * 0.02;
    X.rrect(ctx, cx - s * 0.11, fy - s * 0.06, s * 0.22, s * 0.16, s * 0.04);
    fs(ctx, iron, lw, ink);
    for (let k = 0; k < 4; k++) {
      X.rrect(
        ctx,
        cx - s * 0.11 + k * s * 0.055,
        fy - s * 0.09,
        s * 0.05,
        s * 0.07,
        s * 0.02,
      );
      fs(ctx, X.css(X.shade(iron, 0.15)), lw * 0.7, ink);
    }
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.09, fy + s * 0.1);
    ctx.lineTo(cx + s * 0.09, fy + s * 0.1);
    ctx.lineTo(cx + s * 0.12, fy + s * 0.24);
    ctx.lineTo(cx - s * 0.12, fy + s * 0.24);
    ctx.closePath();
    fs(ctx, X.css(X.shade(iron, -0.15)), lw, ink);
    ctx.restore();
  };
  /** The Continuity seal: starred ring, a domed capitol, "1967". */
  A.continuity = function (ctx, cx, cy, r, pal) {
    pal = pal || {};
    const navy = pal.navy || "#1e3266",
      cream = pal.cream || "#efe8d4",
      red = pal.red || "#a8231c";
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, TAU);
    fs(ctx, navy, r * 0.04);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.7, 0, TAU);
    fs(ctx, cream, r * 0.03);
    for (let k = 0; k < 13; k++) {
      const a = -Math.PI / 2 + (k - 6) * 0.22;
      X.star(
        ctx,
        cx + Math.cos(a) * r * 0.85,
        cy + Math.sin(a) * r * 0.85,
        r * 0.06,
        cream,
      );
    }
    ctx.fillStyle = navy;
    ctx.fillRect(cx - r * 0.42, cy + r * 0.12, r * 0.84, r * 0.12);
    ctx.fillRect(cx - r * 0.24, cy - r * 0.02, r * 0.48, r * 0.15);
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.02, r * 0.2, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(cx - r * 0.02, cy - r * 0.32, r * 0.04, r * 0.1);
    ctx.fillStyle = cream;
    for (let k = 0; k < 6; k++)
      ctx.fillRect(
        cx - r * 0.2 + k * r * 0.08,
        cy + r * 0.02,
        r * 0.025,
        r * 0.1,
      );
    X.text(ctx, "1967", cx, cy + r * 0.42, {
      font: "copper",
      size: r * 0.18,
      color: red,
      maxW: r * 0.8,
      noSafe: true,
    });
    if (r > 30)
      X.arcText(
        ctx,
        pal.text || "THE CONTINUITY",
        cx,
        cy,
        r * 0.85,
        Math.PI / 2,
        { font: "copper", size: r * 0.13, color: cream, inside: true },
      );
    ctx.restore();
  };
  A.lightning = function (ctx, x, y, s, col) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + s * 0.5, y);
    ctx.lineTo(x + s * 0.2, y + s * 0.6);
    ctx.lineTo(x + s * 0.55, y + s * 0.6);
    ctx.lineTo(x - s * 0.1, y + s * 1.5);
    ctx.lineTo(x + s * 0.1, y + s * 0.8);
    ctx.lineTo(x - s * 0.2, y + s * 0.8);
    ctx.closePath();
    fs(ctx, col || "#f8e040", s * 0.05);
  };
  /** Starfield with a few big twinkles. */
  A.stars = function (ctx, x, y, w, h, n, r, col) {
    ctx.save();
    ctx.fillStyle = col || "#fff";
    for (let k = 0; k < n; k++) {
      const px = x + r() * w,
        py = y + r() * h,
        s = r() * 1.8 + 0.4;
      ctx.globalAlpha = 0.4 + r() * 0.6;
      ctx.fillRect(px, py, s, s);
    }
    ctx.globalAlpha = 1;
    for (let k = 0; k < n / 20; k++) {
      const px = x + r() * w,
        py = y + r() * h,
        s = 4 + r() * 6;
      X.starPath(ctx, px, py, s, s * 0.2, 4);
      ctx.fill();
    }
    ctx.restore();
  };
  /** Speed lines behind a moving object. */
  A.speedLines = function (ctx, x, y, w, h, n, col) {
    ctx.save();
    ctx.strokeStyle = col || "rgba(255,255,255,0.6)";
    ctx.lineCap = "round";
    for (let k = 0; k < n; k++) {
      const yy = y + ((k + 0.5) / n) * h;
      ctx.lineWidth = (h / n) * 0.25;
      ctx.beginPath();
      ctx.moveTo(x + w * (k % 3) * 0.1, yy);
      ctx.lineTo(x + w * (0.6 + (k % 2) * 0.3), yy);
      ctx.stroke();
    }
    ctx.restore();
  };
})();
