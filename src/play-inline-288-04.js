// play-inline-288 04 — ctx
// Lines 687-989 of readable/play-inline-288.pretty.js (statement-aligned).
  function rgbStr(c, a) {
    return (
      "rgba(" +
      (c[0] | 0) +
      "," +
      (c[1] | 0) +
      "," +
      (c[2] | 0) +
      "," +
      (a === undefined ? 1 : a) +
      ")"
    );
  }
  function jitter(c, r, amt) {
    const k = (r() - 0.5) * amt;
    return [
      c[0] * (1 + k) + (r() - 0.5) * amt * 30,
      c[1] * (1 + k) + (r() - 0.5) * amt * 30,
      c[2] * (1 + k) + (r() - 0.5) * amt * 30,
    ];
  }
  /** Soft blotches + vertical run-off streaks + specks over whatever is drawn (weathering pass). */
  function weather(ctx, w, h, r, o) {
    o = o || {};
    for (let i = 0; i < (o.blotches || 70); i++) {
      const x = r() * w,
        y = r() * h,
        rr = 8 + r() * (o.blotchR || 60);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      const dark = r() < (o.darkRatio === undefined ? 0.6 : o.darkRatio);
      g.addColorStop(
        0,
        dark
          ? "rgba(40,32,22," + (0.05 + r() * (o.dark || 0.12)) + ")"
          : "rgba(255,248,230," + (0.04 + r() * (o.light || 0.08)) + ")",
      );
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (let i = 0; i < (o.streaks || 26); i++) {
      // rain run-off streaks (tile vertically)
      const x = r() * w,
        sw = 2 + r() * 9,
        a = 0.03 + r() * (o.streak || 0.09);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(30,24,16," + a + ")");
      g.addColorStop(0.5, "rgba(30,24,16," + a * 0.4 + ")");
      g.addColorStop(1, "rgba(30,24,16," + a + ")");
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, sw, h);
    }
    for (let i = 0; i < (o.specks || 1400); i++) {
      ctx.fillStyle =
        r() < 0.5
          ? "rgba(20,16,10," + r() * 0.35 + ")"
          : "rgba(255,250,235," + r() * 0.25 + ")";
      const s = 0.6 + r() * (o.speckR || 1.6);
      ctx.fillRect(r() * w, r() * h, s, s);
    }
  }
  /**
   * Coursed ashlar: running-bond blocks with slightly varied tone, recessed joints and
   * weathering. o: {base hex, rows, cols, joint px, jointCol hex, vary, chamfer}
   */
  function ashlarDraw(o) {
    return (ctx, w, h) => {
      const r = U.rng(o.seed || 7),
        base = hexToRgb(o.base);
      ctx.fillStyle = rgbStr(hexToRgb(o.jointCol || 0x6a6252));
      ctx.fillRect(0, 0, w, h);
      const bh = h / o.rows,
        jw = o.joint || 3;
      for (let row = 0; row < o.rows; row++) {
        const cols = o.cols + (o.colVar && row % 2 ? o.colVar : 0),
          bw = w / cols,
          off = (row % 2) * bw * 0.5;
        for (let c = -1; c < cols; c++) {
          const x0 = c * bw + off + jw / 2,
            y0 = row * bh + jw / 2,
            ww = bw - jw,
            hh = bh - jw;
          const col = jitter(base, r, o.vary || 0.12);
          ctx.fillStyle = rgbStr(col);
          ctx.fillRect(x0, y0, ww, hh);
          // face shading: lighter top edge, darker bottom edge (chamfer)
          const g = ctx.createLinearGradient(0, y0, 0, y0 + hh);
          g.addColorStop(0, "rgba(255,250,235," + (o.chamfer || 0.16) + ")");
          g.addColorStop(0.12, "rgba(255,250,235,0)");
          g.addColorStop(0.85, "rgba(0,0,0,0)");
          g.addColorStop(1, "rgba(0,0,0," + (o.chamfer || 0.16) * 1.4 + ")");
          ctx.fillStyle = g;
          ctx.fillRect(x0, y0, ww, hh);
          if (o.glaze && r() < 0.35) {
            ctx.fillStyle = "rgba(255,255,255," + r() * 0.08 + ")";
            ctx.fillRect(x0 + ww * 0.1, y0 + hh * 0.15, ww * 0.5, hh * 0.25);
          }
          if (o.chips && r() < o.chips) {
            ctx.fillStyle = rgbStr(hexToRgb(o.jointCol || 0x6a6252), 0.8);
            ctx.beginPath();
            ctx.arc(
              x0 + (r() < 0.5 ? 0 : ww),
              y0 + r() * hh,
              2 + r() * 5,
              0,
              TAU,
            );
            ctx.fill();
          }
        }
      }
      weather(ctx, w, h, r, o.weather);
    };
  }
  /** Rough rubble masonry (Manhattan schist): irregular stones in a lime mortar bed. */
  function rubbleDraw(o) {
    return (ctx, w, h) => {
      const r = U.rng(o.seed || 11),
        base = hexToRgb(o.base);
      ctx.fillStyle = rgbStr(hexToRgb(o.mortar || 0x8e8a80));
      ctx.fillRect(0, 0, w, h);
      const rows = o.rows || 9;
      for (let row = 0; row < rows; row++) {
        let x = -r() * 30;
        const yc = ((row + 0.5) * h) / rows;
        while (x < w + 10) {
          const sw = 28 + r() * 60,
            sh = (h / rows) * (0.62 + r() * 0.3);
          const cx = x + sw / 2,
            cy = yc + (r() - 0.5) * 8;
          const col = jitter(base, r, o.vary || 0.3);
          ctx.fillStyle = rgbStr(col);
          ctx.beginPath();
          const n = 7;
          for (let k = 0; k < n; k++) {
            const a = (k / n) * TAU,
              rr = 0.82 + r() * 0.18;
            ctx.lineTo(
              cx + ((Math.cos(a) * sw) / 2) * rr,
              cy + ((Math.sin(a) * sh) / 2) * rr,
            );
          }
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.fillRect(cx - sw * 0.4, cy + sh * 0.25, sw * 0.8, sh * 0.15); // underside shade
          for (let s = 0; s < 6; s++) {
            ctx.fillStyle = "rgba(220,225,230," + r() * 0.45 + ")";
            ctx.fillRect(
              cx + (r() - 0.5) * sw * 0.7,
              cy + (r() - 0.5) * sh * 0.6,
              1.5,
              1.5,
            );
          } // mica glints
          x += sw + 3 + r() * 4;
        }
      }
      weather(
        ctx,
        w,
        h,
        r,
        Object.assign({ blotches: 50, streaks: 18 }, o.weather),
      );
    };
  }
  /** Smooth render / stucco (Guggenheim): near-uniform cream with trowel marks & hairline cracks. */
  function stuccoDraw(ctx, w, h) {
    const r = U.rng(23);
    ctx.fillStyle = "#e8e1cf";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle =
        r() < 0.5 ? "rgba(255,252,240,0.06)" : "rgba(120,110,90,0.05)";
      ctx.beginPath();
      ctx.ellipse(
        r() * w,
        r() * h,
        20 + r() * 50,
        6 + r() * 12,
        r() * 3,
        0,
        TAU,
      );
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(80,70,55,0.22)";
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 5; i++) {
      let x = r() * w,
        y = r() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 8; k++) {
        x += (r() - 0.5) * 30;
        y += r() * 22;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    weather(ctx, w, h, r, {
      blotches: 26,
      dark: 0.045,
      light: 0.05,
      streaks: 7,
      streak: 0.035,
      specks: 300,
      speckR: 1.1,
    });
  }
  /** Marble floor: large polished slabs, alternating veined white / grey-green border tiles. */
  function marbleFloorDraw(ctx, w, h) {
    const r = U.rng(31),
      n = 4,
      s = w / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const dark = (i + j) % 2 === 1;
        ctx.fillStyle = dark ? "#6f7a70" : "#dcd6ca";
        ctx.fillRect(i * s, j * s, s, s);
        ctx.strokeStyle = dark
          ? "rgba(220,225,215,0.35)"
          : "rgba(110,105,95,0.35)";
        ctx.lineWidth = 1.2;
        for (let v = 0; v < 4; v++) {
          let x = i * s + r() * s,
            y = j * s;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let k = 0; k < 6; k++) {
            x += (r() - 0.5) * s * 0.35;
            y += s / 6;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(40,36,30,0.6)";
        ctx.lineWidth = 2;
        ctx.strokeRect(i * s, j * s, s, s);
      }
    weather(ctx, w, h, r, {
      blotches: 60,
      dark: 0.18,
      streaks: 0,
      specks: 900,
    });
  }
  /** Meridian CRT screen: dark phosphor glass, green text lines, scanlines (used as map + emissive map). */
  function screenDraw(ctx, w, h) {
    const r = U.rng(99);
    ctx.fillStyle = "#031006";
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7);
    g.addColorStop(0, "rgba(40,120,60,0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillStyle = "#7dffa8";
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789>$#%=:.-";
    for (let y = 14; y < h - 6; y += 15) {
      let line = "";
      const n = 4 + Math.floor(r() * 22);
      for (let i = 0; i < n; i++)
        line += r() < 0.15 ? " " : glyphs[Math.floor(r() * glyphs.length)];
      ctx.globalAlpha = 0.55 + r() * 0.45;
      ctx.fillText(line, 8, y);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
  }
  // seamless fbm: bilinear blend of the four wrapped copies (no visible tile seam when the texture scrolls)
  function sfbm(x, y, s, w, oct) {
    const u = x / w,
      v = y / w,
      f = (a, b2) => U.fbm2(a / s, b2 / s, oct || 3);
    return (
      f(x, y) * (1 - u) * (1 - v) +
      f(x - w, y) * u * (1 - v) +
      f(x, y - w) * (1 - u) * v +
      f(x - w, y - w) * u * v
    );
  }
  /** Toxic sludge: dark murky water with thin glowing filaments and yellow scum islands (scrolled at runtime). */
  function gooDraw(ctx, w, h) {
    noiseFill(ctx, w, h, (x, y) => {
      const n = sfbm(x, y, 34, w),
        sw = sfbm(x + 97, y + 31, 15, w);
      const band = Math.abs(Math.sin((n * 5 + sw * 3) * Math.PI));
      const toxic =
        Math.pow(Math.max(0, 1 - band), 12) * Math.max(0, n - 0.35) * 2.2;
      const scum = Math.max(0, sfbm(x + 300, y + 50, 22, w) - 0.62) * 3.0;
      const g0 = (U.hash2(x, y) - 0.5) * 8;
      return [
        16 + n * 22 + toxic * 70 + scum * 95 + g0,
        24 + n * 30 + toxic * 190 + scum * 88 + g0,
        10 + n * 8 + toxic * 24 + scum * 30 + g0,
      ];
    });
  }
  /** Curtain-wall glass pane (uv 0..1 per pane): sky reflection gradient, a soft sheen band, grime at the sill. */
