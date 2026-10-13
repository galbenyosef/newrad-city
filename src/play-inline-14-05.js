// play-inline-14 05 — ctx
// Lines 1230-1539 of readable/play-inline-14.pretty.js (statement-aligned).
  A.taxi = function (ctx, cx, cy, L, o) {
    o = o || {};
    A.car(ctx, cx, cy, L, {
      body: o.body || "#f2c21a",
      top: o.top || "#f6d64a",
    });
    const P = (a, b) => [cx - L / 2 + a * L, cy - b * L];
    ctx.save();
    const n = 28;
    for (let k = 0; k < n; k++)
      for (let row = 0; row < 2; row++) {
        if ((k + row) % 2) continue;
        const [px, py] = P(0.09 + (k * 0.82) / n, 0.14 - row * 0.016);
        ctx.fillStyle = "#151515";
        ctx.fillRect(px, py, (L * 0.82) / n, L * 0.016);
      }
    const [rx, ry] = P(0.53, 0.43);
    X.rrect(ctx, rx, ry, L * 0.1, L * 0.05, L * 0.012);
    ctx.fillStyle = "#fff8d8";
    ctx.fill();
    A.fs(ctx, null, L * 0.005);
    X.text(ctx, o.roof || "BIG APPLE", rx + L * 0.05, ry + L * 0.026, {
      font: "condensed",
      size: L * 0.026,
      color: "#c8201a",
      maxW: L * 0.088,
      noSafe: true,
    });
    const [dx, dy] = P(0.6, 0.2);
    A.apple(ctx, dx, dy, L * 0.03, {});
    ctx.restore();
  };

  // ==================================================================
  // THE FIRST JOURNAL
  // ==================================================================
  /** Front page of The First Journal. o: {head, sub, rot, photo:fn(ctx,x,y,w,h)} */
  A.newspaper = function (ctx, cx, cy, w, h, o) {
    o = o || {};
    const lw = Math.max(1, w * 0.004);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(o.rot || 0);
    const x = -w / 2,
      y = -h / 2;
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x + w * 0.015, y + w * 0.015, w, h);
    ctx.fillStyle = o.paper || "#f2ecdc";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = lw;
    ctx.strokeRect(x, y, w, h);
    X.text(ctx, "The First Journal", 0, y + h * 0.085, {
      font: "didone",
      size: w * 0.105,
      color: "#141210",
      maxW: w * 0.9,
      noSafe: true,
    });
    lin(
      ctx,
      x + w * 0.04,
      y + h * 0.15,
      x + w * 0.96,
      y + h * 0.15,
      lw * 2,
      "#141210",
    );
    X.text(
      ctx,
      '"YOU HEARD IT HERE FIRST."  ·  NEW YORK  ·  FIVE CENTS',
      0,
      y + h * 0.175,
      {
        font: "condensed",
        size: w * 0.026,
        color: "#3a3630",
        maxW: w * 0.9,
        noSafe: true,
      },
    );
    lin(
      ctx,
      x + w * 0.04,
      y + h * 0.195,
      x + w * 0.96,
      y + h * 0.195,
      lw,
      "#141210",
    );
    X.text(ctx, o.head || "EXTRA!", 0, y + h * 0.3, {
      font: "impact",
      size: w * 0.13,
      color: "#141210",
      maxW: w * 0.92,
      noSafe: true,
    });
    if (o.sub)
      X.text(ctx, o.sub, 0, y + h * 0.4, {
        font: "serif",
        size: w * 0.045,
        italic: true,
        color: "#2a2622",
        maxW: w * 0.9,
        noSafe: true,
      });
    const px = x + w * 0.05,
      py = y + h * 0.46,
      pw = w * 0.48,
      ph = h * 0.38;
    ctx.fillStyle = "#9a968c";
    ctx.fillRect(px, py, pw, ph);
    if (o.photo) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph);
      ctx.clip();
      o.photo(ctx, px, py, pw, ph);
      ctx.restore();
    }
    X.halftone(
      ctx,
      px,
      py,
      pw,
      ph,
      Math.max(3, w * 0.012),
      "#2a2620",
      0.18,
      0.4,
    );
    ctx.fillStyle = "rgba(40,36,30,0.5)";
    for (let col = 0; col < 2; col++)
      for (let k = 0; k < 14; k++) {
        const lx = x + w * (0.57 + col * 0.2),
          ly = py + (k * ph) / 14;
        ctx.fillRect(
          lx,
          ly,
          w * (0.17 - (k % 5 === 4 ? 0.06 : 0)),
          Math.max(1, h * 0.008),
        );
      }
    for (let k = 0; k < 4; k++)
      ctx.fillRect(
        px,
        py + ph + h * 0.03 + k * h * 0.025,
        pw * (k === 3 ? 0.6 : 1),
        Math.max(1, h * 0.008),
      );
    ctx.restore();
  };

  // ==================================================================
  // PACKAGED FOODS
  // ==================================================================
  /** Foil pouch (Astronaut Ice Cream): crimped top & bottom, crinkled silver, label panel drawn by labelFn. */
  A.foilPouch = function (ctx, cx, cy, w, h, labelFn, o) {
    o = o || {};
    const x = cx - w / 2,
      y = cy - h / 2,
      lw = Math.max(1.2, w * 0.015);
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.06);
    ctx.quadraticCurveTo(x - w * 0.05, cy, x, y + h * 0.94);
    ctx.lineTo(x + w, y + h * 0.94);
    ctx.quadraticCurveTo(x + w * 1.05, cy, x + w, y + h * 0.06);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, x, y, x + w, y + h, [
      [0, "#7c868e"],
      [0.25, "#f4f8fa"],
      [0.45, "#9aa4ac"],
      [0.7, "#e8eef2"],
      [1, "#6a747c"],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    const rr = X.rng(X.seedOf("foil" + (o.seed || 0)));
    ctx.save();
    ctx.clip();
    ctx.lineWidth = lw * 0.5;
    for (let k = 0; k < 18; k++) {
      const sx = x + rr() * w,
        sy = y + rr() * h;
      ctx.strokeStyle =
        rr() < 0.5 ? "rgba(255,255,255,0.7)" : "rgba(40,50,60,0.3)";
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (rr() - 0.5) * w * 0.3, sy + (rr() - 0.5) * h * 0.2);
      ctx.stroke();
    }
    if (labelFn) labelFn(ctx, x + w * 0.1, y + h * 0.18, w * 0.8, h * 0.66);
    ctx.restore();
    for (const yy of [y, y + h * 0.94]) {
      ctx.beginPath();
      ctx.moveTo(x - w * 0.02, yy + h * 0.06);
      for (let k = 0; k <= 16; k++)
        ctx.lineTo(
          x - w * 0.02 + (k * w * 1.04) / 16,
          yy + (k % 2 ? 0 : h * 0.02),
        );
      ctx.lineTo(x + w * 1.02, yy + h * 0.06);
      ctx.closePath();
      ctx.fillStyle = grad(ctx, x, 0, x + w, 0, [
        [0, "#a8b0b8"],
        [0.5, "#f4f6f8"],
        [1, "#8a949c"],
      ]);
      ctx.fill();
      fs(ctx, null, lw * 0.7);
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = lw * 0.4;
      for (let k = 1; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(x, yy + h * 0.02 * k);
        ctx.lineTo(x + w, yy + h * 0.02 * k);
        ctx.stroke();
      }
    }
    ctx.restore();
  };
  /** Neapolitan brick (strawberry / vanilla / chocolate), freeze-dried. */
  A.neapolitan = function (ctx, x, y, w, h) {
    const cols = ["#e88aa0", "#f6ecd0", "#6a3a1e"];
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = cols[k];
      ctx.fillRect(x + (k * w) / 3, y, w / 3 + 0.5, h);
    }
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    const rr = X.rng(7);
    for (let k = 0; k < 20; k++) ctx.fillRect(x + rr() * w, y + rr() * h, 2, 2);
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1, w * 0.02);
    ctx.strokeRect(x, y, w, h);
  };
  /** Kraft-paper jerky bag with a crimped header, label drawn by labelFn. */
  A.jerkyBag = function (ctx, cx, cy, w, h, labelFn, o) {
    o = o || {};
    const x = cx - w / 2,
      y = cy - h / 2,
      lw = Math.max(1.2, w * 0.016);
    ctx.save();
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.04, y + h * 0.12);
    ctx.quadraticCurveTo(x - w * 0.04, y + h * 0.6, x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.quadraticCurveTo(x + w * 1.04, y + h * 0.6, x + w * 0.96, y + h * 0.12);
    ctx.closePath();
    ctx.fillStyle = grad(ctx, x, 0, x + w, 0, [
      [0, shade(o.paper || "#c89a5a", -0.25)],
      [0.4, o.paper || "#c89a5a"],
      [1, shade(o.paper || "#c89a5a", -0.35)],
    ]);
    ctx.fill();
    fs(ctx, null, lw);
    ctx.save();
    ctx.clip();
    if (labelFn) labelFn(ctx, x, y + h * 0.18, w, h * 0.8);
    ctx.restore();
    ctx.beginPath();
    ctx.rect(x + w * 0.02, y, w * 0.96, h * 0.13);
    fs(ctx, o.header || "#7a2a12", lw);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = lw * 0.5;
    for (let k = 1; k < 12; k++) {
      ctx.beginPath();
      ctx.moveTo(x + w * 0.02 + k * w * 0.08, y + h * 0.01);
      ctx.lineTo(x + w * 0.02 + k * w * 0.08, y + h * 0.12);
      ctx.stroke();
    }
    ctx.restore();
  };
  /** A strip of smoked beef jerky. */
  A.jerkyStrip = function (ctx, x, y, len, ang, seed) {
    const rr = X.rng(X.seedOf("jerky" + (seed || 0))),
      wd = len * 0.18;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang || 0);
    ctx.beginPath();
    ctx.moveTo(-len / 2, -wd * 0.4);
    for (let k = 1; k <= 6; k++)
      ctx.lineTo(-len / 2 + (k * len) / 6, -wd * (0.4 + (rr() - 0.5) * 0.4));
    for (let k = 6; k >= 0; k--)
      ctx.lineTo(-len / 2 + (k * len) / 6, wd * (0.45 + (rr() - 0.5) * 0.4));
    ctx.closePath();
    ctx.fillStyle = grad(ctx, 0, -wd, 0, wd, [
      [0, "#8a4a22"],
      [0.5, "#5a2a10"],
      [1, "#3a1808"],
    ]);
    ctx.fill();
    fs(ctx, null, Math.max(1, len * 0.02));
    ctx.strokeStyle = "rgba(200,120,70,0.45)";
    ctx.lineWidth = Math.max(1, len * 0.012);
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      ctx.moveTo(-len * 0.4 + rr() * len * 0.2, (rr() - 0.5) * wd * 0.6);
      ctx.lineTo(len * 0.1 + rr() * len * 0.3, (rr() - 0.5) * wd * 0.6);
      ctx.stroke();
    }
    ctx.restore();
  };
  /**
   * Chocolate Zeppelin: an airship-shaped chocolate snack cake with a vanilla-cream filling, piped cream
   * stripe and little foil tail fins. Horizontal, nose to the right. o.cut shows the cream inside.
   */
