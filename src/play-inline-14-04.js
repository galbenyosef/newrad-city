// play-inline-14 04 — ctx
// Lines 904-1229 of readable/play-inline-14.pretty.js (statement-aligned).
  A.castle = function (ctx, cx, gy, w, o) {
    o = o || {};
    const lw = Math.max(1.2, w * 0.006),
      stone = o.stone || "#e2dac8",
      roofA = o.roof || "#2a4aa0",
      roofB = o.roof2 || "#c8302a",
      flag = o.flag || "#f2c43a";
    const sh = shade(stone, -0.18);
    ctx.save();
    ctx.lineJoin = "round";
    const crenel = (x0, x1, y, n) => {
      const step = (x1 - x0) / n;
      ctx.beginPath();
      ctx.moveTo(x0, y);
      for (let k = 0; k < n; k++) {
        const xa = x0 + k * step;
        if (k % 2 === 0) {
          ctx.lineTo(xa, y - step * 0.7);
          ctx.lineTo(xa + step, y - step * 0.7);
          ctx.lineTo(xa + step, y);
        } else ctx.lineTo(xa + step, y);
      }
      ctx.lineTo(x1, y);
      ctx.closePath();
      fs(ctx, stone, lw);
    };
    const tower = (tx, tw, th, roof, flagSide) => {
      ctx.beginPath();
      ctx.rect(tx - tw / 2, gy - th, tw, th);
      ctx.fillStyle = grad(ctx, tx - tw / 2, 0, tx + tw / 2, 0, [
        [0, stone],
        [1, sh],
      ]);
      ctx.fill();
      fs(ctx, null, lw);
      ctx.beginPath();
      ctx.moveTo(tx - tw * 0.62, gy - th);
      ctx.lineTo(tx, gy - th - tw * 1.35);
      ctx.lineTo(tx + tw * 0.62, gy - th);
      ctx.closePath();
      ctx.fillStyle = grad(ctx, tx - tw / 2, 0, tx + tw / 2, 0, [
        [0, shade(roof, 0.2)],
        [1, shade(roof, -0.3)],
      ]);
      ctx.fill();
      fs(ctx, null, lw);
      const fy = gy - th - tw * 1.35;
      lin(ctx, tx, fy, tx, fy - tw * 0.5, lw, INK);
      ctx.beginPath();
      ctx.moveTo(tx, fy - tw * 0.5);
      ctx.quadraticCurveTo(
        tx + flagSide * tw * 0.3,
        fy - tw * 0.52,
        tx + flagSide * tw * 0.55,
        fy - tw * 0.38,
      );
      ctx.lineTo(tx, fy - tw * 0.28);
      ctx.closePath();
      fs(ctx, flag, lw * 0.7);
      for (let k = 0; k < 2; k++) {
        X.rrect(
          ctx,
          tx - tw * 0.1,
          gy - th * (0.75 - k * 0.3),
          tw * 0.2,
          th * 0.12,
          tw * 0.1,
        );
        fs(ctx, "#2a2a3a", lw * 0.5);
      }
    };
    // curtain wall
    ctx.beginPath();
    ctx.rect(cx - w * 0.46, gy - w * 0.18, w * 0.92, w * 0.18);
    ctx.fillStyle = stone;
    ctx.fill();
    fs(ctx, null, lw);
    crenel(cx - w * 0.46, cx + w * 0.46, gy - w * 0.18, 23);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = lw * 0.6;
    for (let r = 1; r < 5; r++) {
      const y = gy - w * 0.18 + r * w * 0.036;
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.46, y);
      ctx.lineTo(cx + w * 0.46, y);
      ctx.stroke();
    }
    // keep
    ctx.beginPath();
    ctx.rect(cx - w * 0.14, gy - w * 0.42, w * 0.28, w * 0.42);
    ctx.fillStyle = grad(ctx, cx - w * 0.14, 0, cx + w * 0.14, 0, [
      [0, stone],
      [1, sh],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    crenel(cx - w * 0.14, cx + w * 0.14, gy - w * 0.42, 9);
    tower(cx - w * 0.1, w * 0.07, w * 0.56, roofB, -1);
    tower(cx + w * 0.1, w * 0.07, w * 0.56, roofB, 1);
    tower(cx, w * 0.09, w * 0.66, roofA, 1);
    tower(cx - w * 0.44, w * 0.09, w * 0.32, roofA, -1);
    tower(cx + w * 0.44, w * 0.09, w * 0.32, roofA, 1);
    tower(cx - w * 0.27, w * 0.06, w * 0.25, roofB, -1);
    tower(cx + w * 0.27, w * 0.06, w * 0.25, roofB, 1);
    // gate
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.05, gy);
    ctx.lineTo(cx - w * 0.05, gy - w * 0.09);
    ctx.arc(cx, gy - w * 0.09, w * 0.05, Math.PI, 0);
    ctx.lineTo(cx + w * 0.05, gy);
    ctx.closePath();
    fs(ctx, "#3a2414", lw);
    ctx.strokeStyle = "rgba(200,170,120,0.6)";
    ctx.lineWidth = lw * 0.6;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(cx + k * w * 0.018, gy);
      ctx.lineTo(cx + k * w * 0.018, gy - w * 0.12);
      ctx.stroke();
    }
    // window rose on the keep
    ell(ctx, cx, gy - w * 0.3, w * 0.03, w * 0.03);
    fs(ctx, "#f2c43a", lw * 0.6);
    ctx.restore();
  };
  /** Sword in a stone. gy = ground, s = unit (sword ≈ 2.2·s). */
  A.swordStone = function (ctx, cx, gy, s) {
    const lw = Math.max(1.2, s * 0.05);
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.06, gy - s * 0.4);
    ctx.lineTo(cx - s * 0.06, gy - s * 1.9);
    ctx.lineTo(cx, gy - s * 2.02);
    ctx.lineTo(cx + s * 0.06, gy - s * 1.9);
    ctx.lineTo(cx + s * 0.06, gy - s * 0.4);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, cx - s * 0.06, 0, cx + s * 0.06, 0, [
      [0, "#8a9aa4"],
      [0.5, "#ffffff"],
      [1, "#7a8a94"],
    ]);
    ctx.fill();
    fs(ctx, null, lw * 0.6);
    // swap: blade points down into the stone — draw hilt at the top
    ctx.restore();
    ctx.save();
    ctx.lineJoin = "round";
    X.rrect(ctx, cx - s * 0.36, gy - s * 1.98, s * 0.72, s * 0.1, s * 0.05);
    fs(ctx, "#d8b04a", lw * 0.7);
    ctx.beginPath();
    ctx.rect(cx - s * 0.05, gy - s * 2.4, s * 0.1, s * 0.42);
    fs(ctx, "#6a3a1a", lw * 0.7);
    ell(ctx, cx, gy - s * 2.44, s * 0.09, s * 0.09);
    fs(ctx, "#d8b04a", lw * 0.7);
    ctx.beginPath();
    spline(
      ctx,
      [
        [cx - s * 0.8, gy],
        [cx - s * 0.7, gy - s * 0.38],
        [cx - s * 0.25, gy - s * 0.62],
        [cx + s * 0.3, gy - s * 0.58],
        [cx + s * 0.75, gy - s * 0.3],
        [cx + s * 0.85, gy],
      ],
      true,
    );
    ctx.fillStyle = grad(ctx, 0, gy - s * 0.6, 0, gy, [
      [0, "#b8b4a8"],
      [1, "#6a665a"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.restore();
  };

  // ==================================================================
  // DR. THATCHER'S MIRACLE MANE
  // ==================================================================
  /** Square apothecary bottle with shoulders, a stopper and a paper label. */
  A.tonicBottle = function (ctx, cx, top, h, labelFn, o) {
    o = o || {};
    const w = h * 0.46,
      lw = Math.max(1.2, h * 0.014),
      glass = o.glass || "#2a4a9a";
    const body = () => {
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.16, top + h * 0.12);
      ctx.lineTo(cx - w * 0.16, top + h * 0.2);
      ctx.quadraticCurveTo(
        cx - w / 2,
        top + h * 0.22,
        cx - w / 2,
        top + h * 0.32,
      );
      ctx.lineTo(cx - w / 2, top + h * 0.97);
      ctx.quadraticCurveTo(cx - w / 2, top + h, cx - w * 0.45, top + h);
      ctx.lineTo(cx + w * 0.45, top + h);
      ctx.quadraticCurveTo(cx + w / 2, top + h, cx + w / 2, top + h * 0.97);
      ctx.lineTo(cx + w / 2, top + h * 0.32);
      ctx.quadraticCurveTo(
        cx + w / 2,
        top + h * 0.22,
        cx + w * 0.16,
        top + h * 0.2,
      );
      ctx.lineTo(cx + w * 0.16, top + h * 0.12);
      ctx.closePath();
    };
    ctx.save();
    ctx.lineJoin = "round";
    body();
    ctx.fillStyle = grad(ctx, cx - w / 2, 0, cx + w / 2, 0, [
      [0, shade(glass, -0.45)],
      [0.3, shade(glass, 0.25)],
      [0.6, glass],
      [1, shade(glass, -0.5)],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.save();
    body();
    ctx.clip();
    const lx = cx - w * 0.42,
      ly = top + h * 0.42,
      lwid = w * 0.84,
      lh = h * 0.44;
    ctx.fillStyle = o.label || "#f4ecd4";
    ctx.fillRect(lx, ly, lwid, lh);
    ctx.strokeStyle = o.labelInk || "#7a2a1a";
    ctx.lineWidth = lw * 0.6;
    ctx.strokeRect(lx + lwid * 0.05, ly + lh * 0.04, lwid * 0.9, lh * 0.92);
    if (labelFn) labelFn(ctx, lx, ly, lwid, lh);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(cx - w * 0.36, top + h * 0.25, w * 0.07, h * 0.7);
    ctx.restore();
    ctx.beginPath();
    ctx.rect(cx - w * 0.2, top + h * 0.08, w * 0.4, h * 0.05);
    fs(ctx, shade(glass, 0.1), lw);
    X.rrect(ctx, cx - w * 0.14, top, w * 0.28, h * 0.1, w * 0.06);
    fs(ctx, o.stopper || "#c8a060", lw);
    ctx.restore();
  };

  // ==================================================================
  // BIG APPLE MOTOR CAB
  // ==================================================================
  A.apple = function (ctx, cx, cy, r, o) {
    o = o || {};
    const lw = Math.max(1.2, r * 0.05);
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.62);
    ctx.bezierCurveTo(
      cx + r * 0.35,
      cy - r * 0.95,
      cx + r * 1.05,
      cy - r * 0.85,
      cx + r * 0.98,
      cy - r * 0.05,
    );
    ctx.bezierCurveTo(
      cx + r * 0.92,
      cy + r * 0.7,
      cx + r * 0.45,
      cy + r,
      cx + r * 0.2,
      cy + r * 0.92,
    );
    ctx.quadraticCurveTo(cx, cy + r * 0.85, cx - r * 0.2, cy + r * 0.92);
    ctx.bezierCurveTo(
      cx - r * 0.45,
      cy + r,
      cx - r * 0.92,
      cy + r * 0.7,
      cx - r * 0.98,
      cy - r * 0.05,
    );
    ctx.bezierCurveTo(
      cx - r * 1.05,
      cy - r * 0.85,
      cx - r * 0.35,
      cy - r * 0.95,
      cx,
      cy - r * 0.62,
    );
    ctx.closePath();
    ctx.fillStyle = rgrad(ctx, cx - r * 0.35, cy - r * 0.3, r * 0.05, r * 1.2, [
      [0, o.light || "#ff6a50"],
      [0.5, o.color || "#d0201a"],
      [1, o.dark || "#7a0a08"],
    ]);
    ctx.fill();
    fs(ctx, null, lw, o.ink || INK);
    ell(ctx, cx - r * 0.45, cy - r * 0.32, r * 0.14, r * 0.24, 0.5);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fill();
    lin(
      ctx,
      cx,
      cy - r * 0.6,
      cx + r * 0.08,
      cy - r * 1.05,
      lw * 1.2,
      "#5a3a1a",
    );
    ctx.beginPath();
    ctx.moveTo(cx + r * 0.06, cy - r * 0.85);
    ctx.quadraticCurveTo(
      cx + r * 0.45,
      cy - r * 1.25,
      cx + r * 0.75,
      cy - r * 0.95,
    );
    ctx.quadraticCurveTo(
      cx + r * 0.4,
      cy - r * 0.75,
      cx + r * 0.06,
      cy - r * 0.85,
    );
    fs(ctx, "#4a9a3a", lw * 0.8, o.ink || INK);
    ctx.restore();
  };
  /** Yellow cab: the period sedan in Big Apple Motor Cab livery (checker band, roof lamp, door roundel). */
