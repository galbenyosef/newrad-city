// play-inline-358 03 — ctx
// Lines 362-708 of readable/play-inline-358.pretty.js (statement-aligned).
  function parquetDraw(ctx, w, h) {
    const r = U.rng(61),
      n = 4,
      s = w / n,
      p = s / 4;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const vert = (i + j) % 2 === 0;
        for (let k = 0; k < 4; k++) {
          const col = jit([122, 86, 52], r, 0.22);
          const x = i * s + (vert ? k * p : 0),
            y = j * s + (vert ? 0 : k * p),
            ww = vert ? p : s,
            hh = vert ? s : p;
          ctx.fillStyle = rgb(col);
          ctx.fillRect(x, y, ww, hh);
          ctx.strokeStyle = "rgba(40,24,12,0.25)";
          ctx.lineWidth = 0.8;
          for (let g = 0; g < 4; g++) {
            ctx.beginPath();
            if (vert) {
              const gx = x + 3 + r() * (p - 6);
              ctx.moveTo(gx, y);
              ctx.bezierCurveTo(
                gx + 3,
                y + hh * 0.3,
                gx - 3,
                y + hh * 0.7,
                gx,
                y + hh,
              );
            } else {
              const gy = y + 3 + r() * (p - 6);
              ctx.moveTo(x, gy);
              ctx.bezierCurveTo(
                x + ww * 0.3,
                gy + 3,
                x + ww * 0.7,
                gy - 3,
                x + ww,
                gy,
              );
            }
            ctx.stroke();
          }
          ctx.strokeStyle = "rgba(20,12,6,0.6)";
          ctx.lineWidth = 1.2;
          ctx.strokeRect(x, y, ww, hh);
        }
      }
    weatherLite(ctx, w, h, r, { blotches: 40, dark: 0.16, specks: 600 });
  }
  /**
   * The window view: ruined Manhattan through dirty glass. Canvas top half = street level (towers rising,
   * broken tops, haze), bottom half = from 140 m up (rooftops below the horizon, the Woolworth's spire,
   * 40 Wall's green pyramid, the harbour haze).
   */
  function skylineDraw(ctx, W, H) {
    const r = U.rng(67),
      hh = H / 2;
    const sky = (y0, y1, hz) => {
      const g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, "#8a9a88");
      g.addColorStop(hz * 0.7, "#b8b894");
      g.addColorStop(hz, "#d8cfa4");
      g.addColorStop(1, "#c0b894");
      ctx.fillStyle = g;
      ctx.fillRect(0, y0, W, y1 - y0);
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = "rgba(245,240,215," + (0.05 + r() * 0.1) + ")";
        ctx.beginPath();
        ctx.ellipse(
          r() * W,
          y0 + r() * (y1 - y0) * hz * 0.8,
          40 + r() * 120,
          6 + r() * 14,
          0,
          0,
          TAU,
        );
        ctx.fill();
      }
    };
    const tower = (x, base, wd, ht, tone, top, rr) => {
      ctx.fillStyle = tone;
      ctx.fillRect(x, base - ht, wd, ht);
      if (top === "spire") {
        ctx.beginPath();
        ctx.moveTo(x, base - ht);
        ctx.lineTo(x + wd / 2, base - ht - wd * 1.6);
        ctx.lineTo(x + wd, base - ht);
        ctx.fill();
      } else if (top === "pyramid") {
        ctx.fillStyle = "#5a7a6a";
        ctx.beginPath();
        ctx.moveTo(x - 1, base - ht);
        ctx.lineTo(x + wd / 2, base - ht - wd * 1.1);
        ctx.lineTo(x + wd + 1, base - ht);
        ctx.fill();
        ctx.fillStyle = tone;
        ctx.fillRect(x + wd / 2 - 1, base - ht - wd * 1.6, 2, wd * 0.6);
      } else if (top === "broken") {
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.moveTo(x + wd * 0.2, base - ht - 1);
        ctx.lineTo(x + wd * 0.5, base - ht + wd * 0.6);
        ctx.lineTo(x + wd * 0.9, base - ht - 1);
        ctx.fill();
        ctx.restore();
      } else if (top === "setback") {
        ctx.fillRect(x + wd * 0.2, base - ht - wd * 0.5, wd * 0.6, wd * 0.5);
        ctx.fillRect(x + wd * 0.35, base - ht - wd * 0.8, wd * 0.3, wd * 0.3);
      }
      // windows: a grid of darker cells, the odd one knocked out
      for (let wy = base - ht + 4; wy < base - 3; wy += 5)
        for (let wx = x + 2; wx < x + wd - 2; wx += 4) {
          if (rr() < 0.55) {
            ctx.fillStyle =
              rr() < 0.1 ? "rgba(15,12,8,0.7)" : "rgba(40,40,34,0.35)";
            ctx.fillRect(wx, wy, 2, 3);
          }
        }
    };
    // ---------------- top half: street level ----------------
    sky(0, hh, 0.72);
    for (let layer = 0; layer < 3; layer++) {
      const base = hh,
        tone = ["#a8a690", "#7e7e6c", "#4a4a40"][layer];
      let x = -20;
      while (x < W + 20) {
        const wd = [34, 52, 80][layer] + r() * [30, 50, 70][layer];
        const ht = [150, 120, 80][layer] + r() * [80, 90, 70][layer];
        const roll = r();
        tower(
          x,
          base,
          wd,
          ht,
          tone,
          roll < 0.18
            ? "broken"
            : roll < 0.28
              ? "setback"
              : roll < 0.33
                ? "spire"
                : null,
          r,
        );
        x += wd + [4, 8, 14][layer] + r() * [10, 20, 30][layer];
      }
      ctx.fillStyle = "rgba(200,196,160," + [0.34, 0.2, 0.05][layer] + ")";
      ctx.fillRect(0, 0, W, hh); // atmospheric haze between layers
    }
    // ---------------- bottom half: from the Singer's lantern ----------------
    const hz = hh + hh * 0.42;
    sky(hh, H, 0.42);
    // distant skyline on the horizon, the landmarks picked out
    let x = 0;
    while (x < W) {
      const wd = 10 + r() * 22,
        ht = 6 + r() * 26;
      tower(x, hz, wd, ht, "#8c8c7c", r() < 0.1 ? "spire" : null, r);
      x += wd + 2 + r() * 8;
    }
    tower(W * 0.23, hz, 26, 70, "#9a9480", "spire", r); // the Woolworth
    tower(W * 0.62, hz, 22, 58, "#8a806a", "pyramid", r); // 40 Wall
    tower(W * 0.86, hz, 16, 44, "#7a7c78", "setback", r);
    ctx.fillStyle = "rgba(210,205,170,0.35)";
    ctx.fillRect(0, hz - 60, W, 60);
    // rooftops falling away below the horizon, street canyons
    for (let row = 0; row < 6; row++) {
      const y0 = hz + (row * (H - hz)) / 6,
        tone = 70 - row * 8;
      let xx = -r() * 40;
      while (xx < W) {
        const wd = 30 + r() * 70 + row * 12,
          dh = 8 + r() * 14;
        ctx.fillStyle = rgb([tone + 10, tone + 8, tone], 1);
        ctx.fillRect(xx, y0 - dh, wd, (H - hz) / 6 + dh);
        ctx.fillStyle = rgb([tone + 40, tone + 38, tone + 30], 1);
        ctx.fillRect(xx, y0 - dh, wd, 2); // lit roof edge
        if (r() < 0.3) {
          ctx.fillStyle = rgb([tone - 20, tone - 22, tone - 24]);
          ctx.fillRect(xx + wd * 0.3, y0 - dh - 6, 6, 6);
        } // water tank
        xx += wd + 6 + r() * 16;
      }
    }
    ctx.fillStyle = "rgba(200,196,160,0.16)";
    ctx.fillRect(0, hz, W, H - hz);
    // ---------------- dirty glass over both halves ----------------
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = "rgba(70,60,40," + (0.04 + r() * 0.1) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * W,
        r() * H,
        10 + r() * 60,
        8 + r() * 40,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    }
    for (let i = 0; i < 120; i++) {
      const sx = r() * W,
        sy = r() * H;
      const g = ctx.createLinearGradient(0, sy, 0, sy + 60);
      g.addColorStop(0, "rgba(60,50,36,0.2)");
      g.addColorStop(1, "rgba(60,50,36,0)");
      ctx.fillStyle = g;
      ctx.fillRect(sx, sy, 2 + r() * 3, 60);
    }
    ctx.strokeStyle = "rgba(235,240,235,0.45)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      let a = r() * TAU,
        px = r() * W,
        py = r() * H;
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (let k = 0; k < 5; k++) {
        a += (r() - 0.5) * 0.8;
        px += Math.cos(a) * (10 + r() * 40);
        py += Math.sin(a) * (10 + r() * 40);
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  /** Pressed-tin ceiling panels (embossed squares & rosettes), cream paint flaking to rust. */
  function tinDraw(ctx, w, h) {
    const r = U.rng(71),
      n = 4,
      s = w / n;
    ctx.fillStyle = "#c8c0a8";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const x = i * s,
          y = j * s;
        ctx.strokeStyle = "rgba(255,250,235,0.5)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 6, y + 6, s - 12, s - 12);
        ctx.strokeStyle = "rgba(60,50,36,0.45)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 9, y + 9, s - 18, s - 18);
        ctx.fillStyle = "rgba(255,250,235,0.35)";
        ctx.beginPath();
        ctx.arc(x + s / 2 - 1, y + s / 2 - 1, s * 0.2, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(60,50,36,0.35)";
        ctx.beginPath();
        ctx.arc(x + s / 2 + 2, y + s / 2 + 2, s * 0.2, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#c8c0a8";
        ctx.beginPath();
        ctx.arc(x + s / 2, y + s / 2, s * 0.18, 0, TAU);
        ctx.fill();
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * TAU;
          ctx.fillStyle = "rgba(60,50,36,0.3)";
          ctx.beginPath();
          ctx.arc(
            x + s / 2 + Math.cos(a) * s * 0.3,
            y + s / 2 + Math.sin(a) * s * 0.3,
            4,
            0,
            TAU,
          );
          ctx.fill();
        }
      }
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle =
        "rgba(" + ((110 + r() * 40) | 0) + ",70,40," + (0.12 + r() * 0.2) + ")";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        r() * h,
        4 + r() * 20,
        3 + r() * 10,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    } // rust blooms
    weatherLite(ctx, w, h, r, { blotches: 30, dark: 0.16, specks: 300 });
  }
  /** Guastavino tile vault: thin terracotta tiles in herringbone, buff mortar. */
  function guastavinoDraw(ctx, w, h) {
    const r = U.rng(73),
      tw = 64,
      th = 22;
    ctx.fillStyle = "#b8a888";
    ctx.fillRect(0, 0, w, h);
    for (let y = -th; y < h + th; y += th)
      for (let x = -tw; x < w + tw; x += tw) {
        const row = Math.round(y / th),
          off = ((row % 2) * tw) / 2;
        ctx.save();
        ctx.translate(x + off, y);
        ctx.rotate((row % 2 ? 1 : -1) * 0.12);
        ctx.fillStyle = rgb(jit([196, 150, 110], r, 0.18));
        ctx.fillRect(1.5, 1.5, tw - 3, th - 3);
        ctx.fillStyle = "rgba(255,240,220,0.12)";
        ctx.fillRect(1.5, 1.5, tw - 3, 3);
        ctx.restore();
      }
    weatherLite(ctx, w, h, r, { blotches: 40, dark: 0.12, specks: 500 });
  }
  /** Veined white marble panelling (Custom House halls). */
  function marblePanelDraw(ctx, w, h) {
    const r = U.rng(79);
    ctx.fillStyle = "#e0dbd0";
    ctx.fillRect(0, 0, w, h);
    for (let v = 0; v < 26; v++) {
      ctx.strokeStyle =
        "rgba(" +
        ((90 + r() * 40) | 0) +
        "," +
        ((88 + r() * 30) | 0) +
        ",80," +
        (0.15 + r() * 0.3) +
        ")";
      ctx.lineWidth = 0.6 + r() * 2;
      let x = r() * w,
        y = r() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 12; k++) {
        x += (r() - 0.3) * 60;
        y += (r() - 0.5) * 40;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(70,64,56,0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    ctx.strokeRect(w / 2, 1, 0.5, h - 2); // panel joints
    weatherLite(ctx, w, h, r, { blotches: 30, dark: 0.08, specks: 300 });
  }
