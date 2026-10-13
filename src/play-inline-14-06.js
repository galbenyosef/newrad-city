// play-inline-14 06 — ctx
// Lines 1540-1844 of readable/play-inline-14.pretty.js (statement-aligned).
  A.zeppelin = function (ctx, cx, cy, L, o) {
    o = o || {};
    const ry = L * 0.19,
      lw = Math.max(1.2, L * 0.012),
      choc = o.choc || "#5a2c12";
    ctx.save();
    ctx.lineJoin = "round";
    if (o.shadow !== false) {
      ell(ctx, cx, cy + ry * 1.6, L * 0.42, ry * 0.25);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fill();
    }
    // tail fins (foil)
    const tx = cx - L * 0.42;
    const fin = (dy) => {
      ctx.beginPath();
      ctx.moveTo(tx + L * 0.12, cy + dy * ry * 0.4);
      ctx.lineTo(tx - L * 0.06, cy + dy * ry * 1.25);
      ctx.lineTo(tx - L * 0.08, cy + dy * ry * 0.2);
      ctx.closePath();
      ctx.fillStyle = grad(ctx, tx - L * 0.08, 0, tx + L * 0.12, 0, [
        [0, "#9aa4ac"],
        [0.5, "#f4f6f8"],
        [1, "#8a949c"],
      ]);
      ctx.fill();
      fs(ctx, null, lw);
    };
    fin(-1);
    fin(1);
    ell(ctx, cx, cy, L / 2, ry);
    ctx.fillStyle = rgrad(
      ctx,
      cx + L * 0.1,
      cy - ry * 0.5,
      ry * 0.2,
      L * 0.55,
      [
        [0, shade(choc, 0.35)],
        [0.5, choc],
        [1, shade(choc, -0.45)],
      ],
    );
    ctx.fill();
    fs(ctx, null, lw);
    ell(ctx, cx + L * 0.08, cy - ry * 0.55, L * 0.24, ry * 0.16, -0.05);
    ctx.fillStyle = "rgba(255,240,220,0.35)";
    ctx.fill();
    // piped vanilla stripe along the envelope
    ctx.beginPath();
    for (let k = 0; k <= 40; k++) {
      const t = k / 40,
        x = cx - L * 0.4 + t * L * 0.8,
        env = Math.sqrt(Math.max(0, 1 - ((x - cx) / (L / 2)) ** 2)),
        y = cy - ry * 0.05 + Math.sin(t * Math.PI * 9) * ry * 0.12 * env;
      if (k) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.strokeStyle = o.cream || "#fbf2dc";
    ctx.lineWidth = Math.max(1.5, L * 0.02);
    ctx.stroke();
    // gondola
    X.rrect(ctx, cx - L * 0.07, cy + ry * 0.92, L * 0.14, ry * 0.28, ry * 0.1);
    fs(ctx, shade(choc, -0.2), lw * 0.8);
    if (o.cut) {
      const kx = cx + L * 0.5;
      ell(ctx, kx, cy, ry * 0.42, ry);
      ctx.fillStyle = "#3a1a08";
      ctx.fill();
      fs(ctx, null, lw);
      ell(ctx, kx, cy, ry * 0.36, ry * 0.86);
      ctx.fillStyle = "#7a4420";
      ctx.fill();
      ell(ctx, kx, cy, ry * 0.2, ry * 0.48);
      ctx.fillStyle = o.cream || "#fbf2dc";
      ctx.fill();
    }
    ctx.restore();
  };

  // ==================================================================
  // SUPER SERGEANT (Bowery Comics)
  // ==================================================================
  /** America's finest fighting man: olive-drab fatigues, sergeant's chevrons, steel helmet, fist up. gy = ground. */
  A.sergeant = function (ctx, cx, gy, s, o) {
    o = o || {};
    const lw = s * 0.05,
      SKIN = o.skin || "#e8b088",
      OD = o.uniform || "#5e6e3a",
      ODK = shade(o.uniform || "#5e6e3a", -0.3),
      BOOT = "#2a1e14",
      SCARF = o.scarf || "#c8201a";
    const P = (x, y) => [cx + x * s, gy - y * s];
    const poly = (pts, fill, w) => {
      ctx.beginPath();
      spline(
        ctx,
        pts.map((p) => P(p[0], p[1])),
        true,
      );
      fs(ctx, fill, w === undefined ? lw : w);
    };
    ctx.save();
    ctx.lineJoin = "round";
    // legs (wide heroic stance) + boots
    poly(
      [
        [-0.85, 0.25],
        [-0.45, 0.25],
        [-0.2, 1.6],
        [-0.05, 1.75],
        [-0.5, 1.85],
        [-0.75, 1.3],
      ],
      ODK,
    );
    poly(
      [
        [0.4, 0.25],
        [0.85, 0.25],
        [0.7, 1.3],
        [0.5, 1.85],
        [0.05, 1.75],
        [0.25, 1.4],
      ],
      OD,
    );
    poly(
      [
        [-1.0, 0],
        [-0.4, 0],
        [-0.42, 0.42],
        [-0.88, 0.42],
      ],
      BOOT,
    );
    poly(
      [
        [0.38, 0],
        [1.0, 0],
        [0.86, 0.42],
        [0.42, 0.42],
      ],
      BOOT,
    );
    // torso (broad V) + belt
    poly(
      [
        [-0.62, 1.75],
        [0.62, 1.75],
        [1.0, 3.25],
        [0.45, 3.5],
        [-0.45, 3.5],
        [-1.0, 3.25],
      ],
      OD,
    );
    ctx.beginPath();
    ctx.rect(...P(-0.66, 1.98), s * 1.32, s * 0.2);
    fs(ctx, "#6a4a22", lw * 0.7);
    ctx.beginPath();
    ctx.rect(...P(-0.12, 2.02), s * 0.24, s * 0.28);
    fs(ctx, "#d8b04a", lw * 0.6);
    // pocket flaps
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.rect(...P(sd * 0.48 - 0.2, 3.0), s * 0.4, s * 0.12);
      fs(ctx, ODK, lw * 0.6);
    }
    // chest insignia: triple chevron in a ring
    const [ix, iy] = P(0, 2.6);
    ell(ctx, ix, iy, s * 0.36, s * 0.36);
    fs(ctx, "#f2c43a", lw * 0.8);
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(ix - s * 0.24, iy - s * 0.02 + k * s * 0.13);
      ctx.lineTo(ix, iy - s * 0.18 + k * s * 0.13);
      ctx.lineTo(ix + s * 0.24, iy - s * 0.02 + k * s * 0.13);
      ctx.strokeStyle = SCARF;
      ctx.lineWidth = s * 0.07;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    // left arm: fist on hip
    poly(
      [
        [-0.95, 3.2],
        [-1.25, 2.9],
        [-1.15, 2.2],
        [-0.82, 2.15],
        [-0.86, 2.45],
        [-0.96, 2.85],
        [-0.72, 3.05],
      ],
      OD,
    );
    ell(ctx, ...P(-0.85, 2.15), s * 0.17, s * 0.16);
    fs(ctx, SKIN, lw);
    // right arm raised, fist high
    poly(
      [
        [0.7, 3.3],
        [1.0, 3.45],
        [1.38, 4.25],
        [1.22, 4.5],
        [1.0, 4.45],
        [0.98, 4.0],
        [0.62, 3.5],
      ],
      OD,
    );
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(...P(0.92 + k * 0.04, 3.62 + k * 0.12));
      ctx.lineTo(...P(1.07 + k * 0.04, 3.75 + k * 0.12));
      ctx.lineTo(...P(1.2 + k * 0.04, 3.58 + k * 0.12));
      ctx.strokeStyle = "#f2c43a";
      ctx.lineWidth = s * 0.05;
      ctx.stroke();
    }
    ell(ctx, ...P(1.2, 4.62), s * 0.22, s * 0.2);
    fs(ctx, SKIN, lw);
    lin(ctx, ...P(1.08, 4.7), ...P(1.3, 4.72), lw * 0.6);
    lin(ctx, ...P(1.08, 4.6), ...P(1.32, 4.62), lw * 0.6);
    // scarf
    poly(
      [
        [-0.35, 3.45],
        [0.35, 3.45],
        [0.3, 3.25],
        [0.1, 3.18],
        [-0.1, 3.18],
        [-0.3, 3.25],
      ],
      SCARF,
    );
    poly(
      [
        [0.25, 3.3],
        [0.75, 3.05],
        [0.95, 3.15],
        [0.7, 3.35],
        [0.35, 3.42],
      ],
      SCARF,
    );
    // head: square jaw, helmet
    ctx.beginPath();
    ctx.rect(...P(-0.16, 3.7), s * 0.32, s * 0.26);
    fs(ctx, SKIN, lw);
    ctx.beginPath();
    spline(
      ctx,
      [
        P(-0.3, 4.15),
        P(-0.3, 3.85),
        P(-0.22, 3.68),
        P(0, 3.62),
        P(0.22, 3.68),
        P(0.3, 3.85),
        P(0.3, 4.15),
      ],
      true,
    );
    fs(ctx, SKIN, lw);
    lin(ctx, ...P(-0.16, 3.98), ...P(-0.05, 3.96), lw);
    lin(ctx, ...P(0.05, 3.96), ...P(0.16, 3.98), lw);
    ell(ctx, ...P(-0.11, 3.92), s * 0.03, s * 0.025);
    fs(ctx, INK);
    ell(ctx, ...P(0.11, 3.92), s * 0.03, s * 0.025);
    fs(ctx, INK);
    lin(ctx, ...P(-0.1, 3.74), ...P(0.12, 3.76), lw * 0.8);
    lin(ctx, ...P(0, 3.72), ...P(0, 3.66), lw * 0.5);
    ctx.beginPath();
    ctx.moveTo(...P(-0.42, 4.08));
    ctx.quadraticCurveTo(...P(-0.4, 4.5), ...P(0, 4.52));
    ctx.quadraticCurveTo(...P(0.4, 4.5), ...P(0.42, 4.08));
    ctx.quadraticCurveTo(...P(0, 4.0), ...P(-0.42, 4.08));
    ctx.closePath();
    ctx.fillStyle = grad(ctx, cx - s * 0.4, 0, cx + s * 0.4, 0, [
      [0, ODK],
      [0.4, shade(o.uniform || "#5e6e3a", 0.2)],
      [1, ODK],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    const [hx, hy] = P(0, 4.28);
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      ctx.moveTo(hx - s * 0.12, hy + k * s * 0.08);
      ctx.lineTo(hx, hy - s * 0.08 + k * s * 0.08);
      ctx.lineTo(hx + s * 0.12, hy + k * s * 0.08);
      ctx.strokeStyle = "#f2c43a";
      ctx.lineWidth = s * 0.04;
      ctx.stroke();
    }
    lin(ctx, ...P(-0.3, 4.05), ...P(-0.26, 3.78), lw * 0.5, "#3a3a2a");
    lin(ctx, ...P(0.3, 4.05), ...P(0.26, 3.78), lw * 0.5, "#3a3a2a");
    ctx.restore();
  };

  // ==================================================================
  // EMBLEMS
  // ==================================================================
  /** Eagle Motors emblem: an eagle head over swept chrome wings. */
