// play-inline-13 06 — ctx
// Lines 1505-1845 of readable/play-inline-13.pretty.js (statement-aligned).
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
