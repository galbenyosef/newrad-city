// play-inline-13 04 — ctx
// Lines 883-1201 of readable/play-inline-13.pretty.js (statement-aligned).
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
