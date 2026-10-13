// play-inline-458 08 — ctx
// Lines 2164-2467 of readable/play-inline-458.pretty.js (statement-aligned).
  function paintScar(ctx, R) {
    const sg = R() < 0.5 ? -1 : 1;
    const kind = R();
    let pts;
    if (kind < 0.4)
      pts = [
        [sg * 0.22, 0.42],
        [sg * 0.3, 0.3],
        [sg * 0.36, 0.2],
      ]; // through the brow
    else if (kind < 0.75)
      pts = [
        [sg * 0.55, 0.0],
        [sg * 0.45, -0.15],
        [sg * 0.36, -0.3],
      ]; // down the cheek
    else
      pts = [
        [sg * 0.05, -0.36],
        [sg * 0.1, -0.5],
        [sg * 0.14, -0.6],
      ]; // across the lip & chin
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = mulStyle(0.8, 0.62, 0.62, 0.55);
    strokeUnit(ctx, pts, 4.5);
    ctx.strokeStyle = mulStyle(1.28, 1.05, 1.02, 0.8);
    strokeUnit(ctx, pts, 1.8);
    for (let i = 0; i < 5; i++) {
      // stitch marks
      const u = (i + 0.5) / 5,
        a = pts[0],
        b = pts[pts.length - 1];
      const x = lerp(a[0], b[0], u),
        y = lerp(a[1], b[1], u);
      strokeUnit(
        ctx,
        [
          [x - 0.02, y - 0.012],
          [x + 0.02, y + 0.012],
        ],
        1.1,
      );
    }
    ctx.restore();
  }
  /**
   * Old healed FIRE burn (story cast: Sister Dawn): a shiny, puckered patch of
   * pink-brown graft-like skin from the jaw angle down the neck on one side
   * ('L' = the character's left, -x), with a paler ropey rim.
   */
  function paintBurn(ctx, F, R) {
    const sg = F.burn === "R" ? 1 : -1; // face-map x = head x (the character's left is -x)
    ctx.save();
    // the graft patch: a broad, reddened sheet from the cheek / jaw angle down onto the neck (reads at conversation distance)
    for (let i = 0; i < 16; i++) {
      const t = i / 15,
        p = pxFront(
          sg * (0.46 + t * 0.34 + (R() - 0.5) * 0.06),
          -0.14 - t * 0.62,
        ),
        rr = 20 + R() * 12;
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr);
      g.addColorStop(0, mulStyle(1.32, 0.74, 0.7, 0.6));
      g.addColorStop(1, mulStyle(1.32, 0.74, 0.7, 0));
      ctx.fillStyle = g;
      ctx.fillRect(p[0] - rr, p[1] - rr, rr * 2, rr * 2);
    }
    // mottling: shiny pink islands and darker, brownish puckers
    for (let i = 0; i < 150; i++) {
      const t = R(),
        x = sg * (0.4 + t * 0.46 + (R() - 0.5) * 0.16),
        y = -0.18 - t * 0.6 + (R() - 0.5) * 0.14;
      const p = pxFront(x, y),
        rr = 3 + R() * 7;
      ctx.fillStyle =
        R() < 0.55
          ? mulStyle(1.5, 0.8, 0.76, 0.7)
          : mulStyle(0.8, 0.5, 0.46, 0.65);
      ctx.beginPath();
      ctx.arc(p[0], p[1], rr, 0, PI * 2);
      ctx.fill();
    }
    // pale, ropey scar ridges running down the neck
    ctx.lineCap = "round";
    ctx.strokeStyle = mulStyle(1.5, 1.2, 1.12, 0.75);
    for (let i = 0; i < 9; i++) {
      let x = sg * (0.44 + R() * 0.3),
        y = -0.24 - R() * 0.12;
      const pts = [[x, y]];
      for (let s2 = 0; s2 < 6; s2++) {
        x += sg * (0.015 + R() * 0.05);
        y -= 0.06 + R() * 0.05;
        pts.push([x, y]);
      }
      strokeUnit(ctx, pts, 2.4);
    }
    ctx.restore();
  }
  /** Radiation-sickness pallor: grey-violet hollows under the eyes, drained lips & cheeks. */
  function paintPallor(ctx, F) {
    const k = clamp(F.pallor, 0, 1);
    ctx.save();
    for (const sg of [-1, 1]) {
      const p = pxFront(sg * 0.33, 0.04);
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 16);
      g.addColorStop(0, mulStyle(0.62, 0.58, 0.72, 0.7 * k));
      g.addColorStop(1, mulStyle(0.62, 0.58, 0.72, 0));
      ctx.fillStyle = g;
      ctx.fillRect(p[0] - 16, p[1] - 16, 32, 32);
      const c = pxFront(sg * 0.5, -0.2);
      const g2 = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], 20);
      g2.addColorStop(0, mulStyle(0.86, 0.86, 0.9, 0.4 * k));
      g2.addColorStop(1, mulStyle(0.86, 0.86, 0.9, 0));
      ctx.fillStyle = g2;
      ctx.fillRect(c[0] - 20, c[1] - 20, 40, 40);
    }
    ctx.restore();
  }
  function paintDirt(ctx, R, amt) {
    ctx.save();
    for (let i = 0; i < 18; i++) {
      const p = pxFront((R() - 0.5) * 1.4, (R() - 0.5) * 1.3);
      const rr = 6 + R() * 22;
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr);
      g.addColorStop(0, mulStyle(0.66, 0.6, 0.52, 0.45 * amt));
      g.addColorStop(1, mulStyle(0.66, 0.6, 0.52, 0));
      ctx.fillStyle = g;
      ctx.fillRect(p[0] - rr, p[1] - rr, rr * 2, rr * 2);
    }
    ctx.restore();
  }
  function paintWarPaint(ctx, F) {
    const mode = (F.paintSeed || 0) % 3;
    ctx.save();
    ctx.lineCap = "round";
    if (mode === 0) {
      ctx.strokeStyle = mulStyle(0.16, 0.15, 0.15, 0.9);
      strokeUnit(
        ctx,
        [
          [-0.7, 0.13],
          [-0.35, 0.14],
          [0, 0.12],
          [0.35, 0.14],
          [0.7, 0.13],
        ],
        20,
      );
    } else if (mode === 1) {
      ctx.strokeStyle = mulStyle(1.2, 0.28, 0.24, 0.85);
      for (const sg of [-1, 1])
        for (let i = 0; i < 3; i++)
          strokeUnit(
            ctx,
            [
              [sg * (0.3 + i * 0.08), 0.02],
              [sg * (0.33 + i * 0.08), -0.3],
            ],
            4,
          );
    } else {
      ctx.strokeStyle = mulStyle(0.18, 0.17, 0.17, 0.9);
      strokeUnit(
        ctx,
        [
          [0, 0.75],
          [0, 0.3],
          [0, -0.1],
        ],
        5,
      );
      strokeUnit(
        ctx,
        [
          [0, -0.5],
          [0, -0.8],
        ],
        5,
      );
    }
    ctx.restore();
  }
  /**
   * Maniac faces: an ordinary face gone to ruin. Tired, smudged, red-rimmed
   * sockets, ground-in dirt and soot, scabbed scratches, chapped lips; old
   * healed burns come from paintBurn (F.burn).
   */
  function paintManiac(ctx, F, R) {
    ctx.save();
    const cluster = (x, y, size, style, n) => {
      const p = pxFront(x, y);
      ctx.fillStyle = style;
      for (let k = 0; k < n; k++) {
        ctx.beginPath();
        ctx.ellipse(
          p[0] + (R() - 0.5) * size * 1.4,
          p[1] + (R() - 0.5) * size,
          size * (0.3 + R() * 0.5),
          size * (0.2 + R() * 0.4),
          R() * 3,
          0,
          PI * 2,
        );
        ctx.fill();
      }
    };
    ctx.lineCap = "round";
    // sleepless sockets: dark and a little red
    for (const sg of [-1, 1]) {
      const p = pxFront(sg * 0.36, 0.1),
        g0 = ctx.createRadialGradient(p[0], p[1], 2, p[0], p[1], 24);
      g0.addColorStop(0, mulStyle(0.7, 0.5, 0.5, 0.55));
      g0.addColorStop(1, mulStyle(0.7, 0.5, 0.5, 0));
      ctx.fillStyle = g0;
      ctx.fillRect(p[0] - 24, p[1] - 24, 48, 48);
    }
    // grime and soot smudges
    for (let i = 0; i < 18; i++)
      cluster(
        (R() - 0.5) * 1.5,
        (R() - 0.5) * 1.5,
        5 + R() * 10,
        mulStyle(0.56, 0.52, 0.48, 0.16 + R() * 0.2),
        4,
      );
    // scabbed scratches (fingernail rakes)
    ctx.strokeStyle = mulStyle(0.62, 0.32, 0.28, 0.65);
    for (let i = 0; i < 5; i++) {
      const x = (R() - 0.5) * 1.1,
        y = (R() - 0.5) * 1.1,
        a = R() * PI;
      for (let k = 0; k < 3; k++)
        strokeUnit(
          ctx,
          [
            [x + k * 0.03, y],
            [x + k * 0.03 + Math.cos(a) * 0.14, y + Math.sin(a) * 0.14],
          ],
          1.2,
        );
    }
    // chapped, cracked lips
    {
      const p = pxFront(0, -0.36);
      ctx.fillStyle = mulStyle(0.8, 0.6, 0.58, 0.35);
      ctx.beginPath();
      ctx.ellipse(p[0], p[1], 20, 7, 0, 0, PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function paintMutant(ctx, R) {
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < 40; i++) {
      const p = pxFront((R() - 0.5) * 1.5, (R() - 0.5) * 1.5);
      const rr = 4 + R() * 14;
      ctx.fillStyle = mulStyle(0.85 + R() * 0.3, 0.9 + R() * 0.25, 0.8, 0.35);
      ctx.beginPath();
      ctx.arc(p[0], p[1], rr, 0, PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = mulStyle(0.62, 0.74, 0.55, 0.55);
    for (let i = 0; i < 16; i++) {
      let x = (R() - 0.5) * 1.2,
        y = 0.3 + R() * 0.5;
      const pts = [[x, y]];
      for (let s = 0; s < 6; s++) {
        x += (R() - 0.5) * 0.1;
        y -= R() * 0.07;
        pts.push([x, y]);
      }
      strokeUnit(ctx, pts, 1.4);
    }
    ctx.restore();
  }
  function paintMakeup(ctx, F) {
    ctx.save();
    for (const sg of [-1, 1]) {
      const p = pxFront(sg * 0.35, 0.2);
      const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 14);
      g.addColorStop(0, mulStyle(0.82, 0.74, 0.86, 0.5));
      g.addColorStop(1, mulStyle(0.82, 0.74, 0.86, 0));
      ctx.fillStyle = g;
      ctx.fillRect(p[0] - 14, p[1] - 14, 28, 28);
      const c = pxFront(sg * 0.5, -0.12);
      const g2 = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], 18);
      g2.addColorStop(0, mulStyle(1.12, 0.9, 0.9, 0.45));
      g2.addColorStop(1, mulStyle(1.12, 0.9, 0.9, 0));
      ctx.fillStyle = g2;
      ctx.fillRect(c[0] - 18, c[1] - 18, 36, 36);
    }
    ctx.restore();
  }

  /**
   * SCALP HAIR & SOFT HAIRLINE: the scalp under the hair shell is painted in
   * the hair colour (hair-marked texels, so the instance hair tint applies),
   * and below the shell edge the hair thins out over ~1.5 cm in short
   * strands (fine baby hairs at the front, sideburns & nape) instead of the
   * shell ending in a hard helmet line.
   */
  const HAIR_MATCH = 0.58;
