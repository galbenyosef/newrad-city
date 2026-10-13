// play-inline-13 08 — ctx
// Lines 2188-2515 of readable/play-inline-13.pretty.js (statement-aligned).
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
