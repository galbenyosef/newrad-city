// play-inline-288 03 — ctx
// Lines 339-686 of readable/play-inline-288.pretty.js (statement-aligned).
  PM.signTex = function (key, lines, style, w, h, extra) {
    w = w || 512;
    h = h || 128;
    return PM.canvasTex(
      "pm2_sign_" + key,
      w,
      h,
      (ctx) => {
        const r = U.rng(U.hashStr(key));
        extra = extra || {};
        const fg = extra.fg,
          bg = extra.bg;
        if (style === "engraved") {
          ctx.fillStyle = bg || "#b9b09c";
          ctx.fillRect(0, 0, w, h);
          noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
            const n = (U.fbm2(x / 20, y / 20, 3) - 0.5) * 40;
            return [R + n, Gc + n, B + n];
          });
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor(h / (lines.length + 0.6));
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            '"Times New Roman", Georgia, serif',
          );
          ctx.font = "bold " + fs + 'px "Times New Roman", Georgia, serif';
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (lines.length - 1) / 2) * fs * 1.05;
            ctx.fillStyle = "rgba(255,255,255,0.35)";
            ctx.fillText(t, w / 2 + 1, y + 2);
            ctx.fillStyle = fg || "rgba(40,34,28,0.85)";
            ctx.fillText(t, w / 2, y);
          });
        } else if (style === "raider") {
          // corrugated scrap background with rust
          ctx.fillStyle = bg || "#6d6a5e";
          ctx.fillRect(0, 0, w, h);
          for (let x = 0; x < w; x += 16) {
            ctx.fillStyle = "rgba(0,0,0,0.18)";
            ctx.fillRect(x, 0, 6, h);
          }
          for (let i = 0; i < 40; i++) {
            ctx.fillStyle =
              "rgba(" +
              ((120 + r() * 50) | 0) +
              "," +
              ((60 + r() * 30) | 0) +
              ",20," +
              (0.2 + r() * 0.4) +
              ")";
            ctx.beginPath();
            ctx.ellipse(
              r() * w,
              r() * h,
              8 + r() * 50,
              5 + r() * 30,
              r() * 3,
              0,
              TAU,
            );
            ctx.fill();
          }
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor(h / (lines.length + 0.5));
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            'Impact, "Arial Black", sans-serif',
          );
          ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (lines.length - 1) / 2) * fs * 1.05;
            ctx.save();
            ctx.translate(w / 2, y);
            ctx.rotate((r() - 0.5) * 0.08);
            // spray-paint readability: a dark over-spray outline under the letters (extra.outline=false to skip)
            if (extra.outline !== false) {
              ctx.lineJoin = "round";
              ctx.strokeStyle = extra.outlineColor || "rgba(14,10,8,0.92)";
              ctx.lineWidth = Math.max(3, fs * 0.13);
              ctx.strokeText(t, 0, 0);
              ctx.shadowColor = "rgba(0,0,0,0.6)";
              ctx.shadowBlur = fs * 0.12;
            }
            ctx.fillStyle = fg || "#b3261c";
            ctx.fillText(t, 0, 0);
            ctx.shadowBlur = 0;
            // drips
            for (let k = 0; k < 10; k++) {
              const dx = (r() - 0.5) * w * 0.8;
              ctx.fillRect(dx, fs * 0.25, 3, 6 + r() * fs * 0.6);
            }
            ctx.restore();
          });
        } else if (style === "enamel") {
          ctx.fillStyle = bg || "#1d4a3a";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = fg || "#e8dfc4";
          ctx.lineWidth = Math.max(3, h * 0.05);
          ctx.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
          ctx.fillStyle = fg || "#e8dfc4";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor((h * 0.62) / lines.length);
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
          );
          ctx.font =
            "bold " +
            fs +
            'px "Futura", "Century Gothic", "Trebuchet MS", sans-serif';
          lines.forEach((t, i) =>
            ctx.fillText(
              t,
              w / 2,
              h / 2 + (i - (lines.length - 1) / 2) * fs * 1.1,
            ),
          );
          // chipped enamel
          for (let i = 0; i < 50; i++) {
            ctx.fillStyle =
              "rgba(" +
              ((60 + r() * 50) | 0) +
              "," +
              ((40 + r() * 20) | 0) +
              ",20," +
              (0.4 + r() * 0.5) +
              ")";
            ctx.beginPath();
            ctx.arc(r() * w, r() * h, 1 + r() * 6, 0, TAU);
            ctx.fill();
          }
        } else if (style === "bronze") {
          ctx.fillStyle = "#3d3222";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#8c7448";
          ctx.lineWidth = 8;
          ctx.strokeRect(8, 8, w - 16, h - 16);
          ctx.fillStyle = "#a88d58";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor((h * 0.7) / lines.length);
          fs = fitFont(ctx, lines, fs, w * 0.92, "Georgia, serif");
          ctx.font = "bold " + fs + "px Georgia, serif";
          lines.forEach((t, i) =>
            ctx.fillText(
              t,
              w / 2,
              h / 2 + (i - (lines.length - 1) / 2) * fs * 1.15,
            ),
          );
          noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
            const n = U.fbm2(x / 30, y / 30, 3);
            const v = Math.max(0, n - 0.55) * 2;
            return [
              R * (1 - v) + 70 * v,
              Gc * (1 - v) + 130 * v,
              B * (1 - v) + 105 * v,
            ];
          });
        } else if (style === "banner") {
          ctx.fillStyle = bg || "#8e2b25";
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = fg || "#eadcbc";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor(w * 0.16);
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
          );
          ctx.font =
            "bold " +
            fs +
            'px "Futura", "Century Gothic", "Trebuchet MS", sans-serif';
          lines.forEach((t, i) =>
            ctx.fillText(t, w / 2, h * 0.18 + i * fs * 1.25),
          );
          if (extra.emblem) extra.emblem(ctx, w, h);
          // sun-bleach & tears
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(255,240,200,0.25)");
          g.addColorStop(1, "rgba(40,30,20,0.35)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 30; i++) {
            ctx.fillStyle = "rgba(30,20,10," + (0.1 + r() * 0.25) + ")";
            ctx.beginPath();
            ctx.ellipse(
              r() * w,
              r() * h,
              6 + r() * 30,
              10 + r() * 60,
              0,
              0,
              TAU,
            );
            ctx.fill();
          }
        } else if (style === "neon") {
          ctx.fillStyle = "#080808";
          ctx.fillRect(0, 0, w, h);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = extra.size || Math.floor((h * 0.6) / lines.length);
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
          );
          ctx.font =
            "bold " +
            fs +
            'px "Futura", "Century Gothic", "Trebuchet MS", sans-serif';
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (lines.length - 1) / 2) * fs * 1.1;
            ctx.shadowColor = fg || "#ff5a2a";
            ctx.shadowBlur = 18;
            ctx.fillStyle = fg || "#ff7a3a";
            ctx.fillText(t, w / 2, y);
            ctx.shadowBlur = 4;
            ctx.fillStyle = "#fff4dc";
            ctx.fillText(t, w / 2, y);
          });
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = bg || "#222";
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = fg || "#ddd";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          let fs = Math.floor((h * 0.6) / lines.length);
          fs = fitFont(ctx, lines, fs, w * 0.92, "sans-serif");
          ctx.font = "bold " + fs + "px sans-serif";
          lines.forEach((t, i) =>
            ctx.fillText(
              t,
              w / 2,
              h / 2 + (i - (lines.length - 1) / 2) * fs * 1.1,
            ),
          );
        }
      },
      { clamp: true },
    );
  };

  /**
   * Transparent spray-paint graffiti (use with PM.texMat(key, tex, {transparent:true})). lines: text lines;
   * extra: {color, outline, drips, tag:'sun'|'skull'|'arrow'}.
   */
  PM.graffitiTex = function (key, lines, w, h, extra) {
    extra = extra || {};
    return PM.canvasTex(
      "pm2_graf_" + key,
      w || 512,
      h || 256,
      (ctx, W, H) => {
        const r = U.rng(U.hashStr(key));
        ctx.clearRect(0, 0, W, H);
        const col = extra.color || "#d8302a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fs = Math.floor((H * 0.78) / Math.max(1, lines.length));
        fs = fitFont(
          ctx,
          lines,
          fs,
          W * 0.9,
          'Impact, "Arial Black", sans-serif',
        );
        ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
        lines.forEach((t, i) => {
          const y = H / 2 + (i - (lines.length - 1) / 2) * fs * 1.02;
          ctx.save();
          ctx.translate(W / 2, y);
          ctx.rotate((r() - 0.5) * 0.12);
          ctx.lineJoin = "round";
          if (extra.outline) {
            ctx.strokeStyle = extra.outline;
            ctx.lineWidth = fs * 0.14;
            ctx.strokeText(t, 0, 0);
          }
          ctx.shadowColor = col;
          ctx.shadowBlur = fs * 0.08; // soft over-spray
          ctx.fillStyle = col;
          ctx.fillText(t, 0, 0);
          ctx.shadowBlur = 0;
          if (extra.drips !== false)
            for (let k = 0; k < 12; k++) {
              const dx = (r() - 0.5) * W * 0.8;
              ctx.fillRect(dx, fs * 0.2, 2 + r() * 2, 6 + r() * fs * 0.7);
            }
          ctx.restore();
        });
        if (extra.tag === "skull") {
          ctx.fillStyle = col;
          const cx = W * 0.88,
            cy = H * 0.3,
            rr = H * 0.14;
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, TAU);
          ctx.fill();
          ctx.fillRect(cx - rr * 0.6, cy + rr * 0.5, rr * 1.2, rr * 0.7);
          ctx.globalCompositeOperation = "destination-out";
          for (const sx of [-0.4, 0.4]) {
            ctx.beginPath();
            ctx.arc(cx + sx * rr, cy, rr * 0.28, 0, TAU);
            ctx.fill();
          }
          ctx.globalCompositeOperation = "source-over";
        }
        // speckle
        for (let i = 0; i < 160; i++) {
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.25 + r() * 0.4;
          ctx.fillRect(r() * W, r() * H, 1.5, 1.5);
        }
        ctx.globalAlpha = 1;
      },
      { clamp: true },
    );
  };

  // -------------------------------------------------------------------
  // Custom masonry / surface textures (fast canvas drawing, no per-pixel
  // noise) so every stone type in this segment reads differently even
  // when the textures module only offers one generic ashlar.
  // -------------------------------------------------------------------
  function hexToRgb(h) {
    return [(h >> 16) & 255, (h >> 8) & 255, h & 255];
  }
