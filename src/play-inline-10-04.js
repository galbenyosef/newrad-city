// play-inline-10 04 — ctx
// Lines 993-1172 of readable/play-inline-10.pretty.js (statement-aligned).
  X.arcText = function (ctx, str, cx, cy, radius, mid, o) {
    o = o || {};
    ctx.save();
    X.setFont(ctx, str, o.size || 30, o.font || "impact", null, o.weight);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const widths = Array.from(str).map(
      (ch) => ctx.measureText(ch).width + (o.spacing || 0),
    );
    const total = widths.reduce((a, b) => a + b, 0);
    const dir = o.inside ? -1 : 1;
    let ang = mid - (dir * (total / radius)) / 2;
    Array.from(str).forEach((ch, i) => {
      const a = ang + (dir * (widths[i] / 2)) / radius;
      ctx.save();
      ctx.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.rotate(a + (dir * Math.PI) / 2);
      if (o.stroke) {
        ctx.strokeStyle = X.css(o.stroke);
        ctx.lineWidth = o.strokeW || 3;
        ctx.lineJoin = "round";
        ctx.strokeText(ch, 0, 0);
      }
      ctx.fillStyle = X.css(o.color || "#fff");
      ctx.fillText(ch, 0, 0);
      ctx.restore();
      ang += (dir * widths[i]) / radius;
    });
    ctx.restore();
  };

  // ------------------------------------------------------------------
  // Retro graphic primitives shared by billboards/posters/signs
  // ------------------------------------------------------------------
  /** Sunburst rays from (cx,cy). */
  X.sunburst = function (ctx, cx, cy, radius, n, c1, c2, rot) {
    ctx.save();
    ctx.fillStyle = X.css(c1);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = X.css(c2);
    for (let i = 0; i < n; i++) {
      const a0 = (rot || 0) + (i / n) * Math.PI * 2,
        a1 = a0 + Math.PI / n;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a0) * radius, cy + Math.sin(a0) * radius);
      ctx.lineTo(cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };
  /** Multi-point starburst ("NEW!" badge). */
  X.starburst = function (ctx, cx, cy, r0, r1, n, fill, stroke, lw) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2,
        rr = i % 2 ? r0 : r1;
      const px = cx + Math.cos(a) * rr,
        py = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = X.css(fill);
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = X.css(stroke);
      ctx.lineWidth = lw || 3;
      ctx.stroke();
    }
  };
  /** Classic 5-point star. */
  X.star = function (ctx, cx, cy, r, fill, stroke, lw, rot) {
    X.starPath(ctx, cx, cy, r, r * 0.42, 5, rot);
    if (fill) {
      ctx.fillStyle = X.css(fill);
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = X.css(stroke);
      ctx.lineWidth = lw || 2;
      ctx.stroke();
    }
  };
  X.starPath = function (ctx, cx, cy, r1, r0, n, rot) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (rot || 0) - Math.PI / 2 + (i / (n * 2)) * Math.PI * 2,
        rr = i % 2 ? r0 : r1;
      const px = cx + Math.cos(a) * rr,
        py = cy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };
  /** Rounded rectangle path. */
  X.rrect = function (ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };
  /** Halftone dot overlay inside a rect (print texture). */
  X.halftone = function (ctx, x, y, w, h, step, color, alpha, angle) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(angle || 0.4);
    ctx.fillStyle = X.css(color || "#000", alpha || 0.12);
    const R = Math.hypot(w, h) / 2;
    for (let yy = -R; yy < R; yy += step)
      for (let xx = -R; xx < R; xx += step) {
        ctx.beginPath();
        ctx.arc(xx, yy, step * 0.28, 0, Math.PI * 2);
        ctx.fill();
      }
    ctx.restore();
  };
  /** Ribbon banner with folded tails. */
  X.ribbon = function (ctx, cx, cy, w, h, fill, dark) {
    const t = h * 0.8;
    ctx.fillStyle = X.css(dark);
    ctx.beginPath(); // left tail
    ctx.moveTo(cx - w / 2 - t, cy - h / 2 + h * 0.25);
    ctx.lineTo(cx - w / 2 + t * 0.4, cy - h / 2 + h * 0.25);
    ctx.lineTo(cx - w / 2 + t * 0.4, cy + h / 2 + h * 0.25);
    ctx.lineTo(cx - w / 2 - t, cy + h / 2 + h * 0.25);
    ctx.lineTo(cx - w / 2 - t * 0.5, cy + h * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath(); // right tail
    ctx.moveTo(cx + w / 2 + t, cy - h / 2 + h * 0.25);
    ctx.lineTo(cx + w / 2 - t * 0.4, cy - h / 2 + h * 0.25);
    ctx.lineTo(cx + w / 2 - t * 0.4, cy + h / 2 + h * 0.25);
    ctx.lineTo(cx + w / 2 + t, cy + h / 2 + h * 0.25);
    ctx.lineTo(cx + w / 2 + t * 0.5, cy + h * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = X.css(fill);
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  };
  /** Radiation trefoil. */
  X.trefoil = function (ctx, cx, cy, r, color, bg) {
    ctx.save();
    if (bg) {
      ctx.fillStyle = X.css(bg);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = X.css(color);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a - Math.PI / 6, a + Math.PI / 6);
      ctx.arc(cx, cy, r * 0.3, a + Math.PI / 6, a - Math.PI / 6, true);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };
