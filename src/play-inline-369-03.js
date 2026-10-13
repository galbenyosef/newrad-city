// play-inline-369 03 — ctx
// Lines 315-530 of readable/play-inline-369.pretty.js (statement-aligned).
  P.signTex = function (key, lines, style, w, h, o) {
    o = o || {};
    w = w || 512;
    h = h || 128;
    return P.canvasTex(
      "m3_sign_" + key,
      w,
      h,
      (ctx) => {
        const r = P.rng(key);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const L = lines.length;
        const draw = (fam, weight, col, shadow, lh) => {
          let fs =
            o.size || Math.floor((h * (o.fill || 0.7)) / (L * (lh || 1.1)));
          fs = fitFont(ctx, lines, fs, w * (o.maxW || 0.9), fam, weight);
          ctx.font = (weight || "bold") + " " + fs + "px " + fam;
          if (o.spacing)
            try {
              ctx.letterSpacing = o.spacing + "px";
            } catch (e) {
              /* old canvas */
            }
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (L - 1) / 2) * fs * (lh || 1.1);
            if (shadow) {
              ctx.fillStyle = shadow;
              ctx.fillText(t, w / 2 + 1.5, y + 2);
            }
            ctx.fillStyle = col;
            ctx.fillText(t, w / 2, y);
          });
          return fs;
        };
        if (style === "engraved") {
          ctx.fillStyle = o.bg || "#bdb49e";
          ctx.fillRect(0, 0, w, h);
          blotches(ctx, w, h, r, 30, 0.12);
          speckle(ctx, w, h, r, 900);
          draw(
            SERIF,
            "bold",
            o.fg || "rgba(52,44,34,0.9)",
            "rgba(255,250,235,0.35)",
            1.15,
          );
        } else if (style === "gilt") {
          ctx.fillStyle = o.bg || "#1b1712";
          ctx.fillRect(0, 0, w, h);
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#f6dc8a");
          g.addColorStop(0.5, "#c8952e");
          g.addColorStop(1, "#7a5518");
          draw(o.font || SERIF, "bold", g, "rgba(0,0,0,0.7)", 1.1);
          speckle(ctx, w, h, r, 300, 0.4, 0.05);
        } else if (style === "bronze") {
          ctx.clearRect(0, 0, w, h);
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, o.c0 || "#a8905a");
          g.addColorStop(1, o.c1 || "#4e3f24");
          draw(o.font || SANS, "bold", g, "rgba(0,0,0,0.55)", 1.1);
        } else if (style === "banner") {
          ctx.fillStyle = o.bg || "#8e2b25";
          ctx.fillRect(0, 0, w, h);
          if (o.emblem) {
            try {
              o.emblem(ctx, w, h, r);
            } catch (e) {
              /* ignore */
            }
          }
          ctx.fillStyle = o.fg || "#eadcbc";
          let fs = o.size || Math.floor(w * 0.15);
          fs = fitFont(ctx, lines, fs, w * 0.86, o.font || SANS, "bold");
          ctx.font = "bold " + fs + "px " + (o.font || SANS);
          lines.forEach((t, i) =>
            ctx.fillText(
              t,
              w / 2,
              h * (o.top || 0.12) + fs * 0.6 + i * fs * 1.2,
            ),
          );
          const gr = ctx.createLinearGradient(0, 0, 0, h);
          gr.addColorStop(0, "rgba(255,240,200,0.2)");
          gr.addColorStop(1, "rgba(30,20,10,0.4)");
          ctx.fillStyle = gr;
          ctx.fillRect(0, 0, w, h);
          blotches(ctx, w, h, r, 26, 0.25);
        } else if (style === "label") {
          ctx.fillStyle = o.bg || "#d9cfb4";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(40,30,20,0.6)";
          ctx.lineWidth = 3;
          ctx.strokeRect(6, 6, w - 12, h - 12);
          ctx.fillStyle = "#2a2218";
          ctx.textAlign = "left";
          let fs = Math.floor(h * 0.22);
          ctx.font = "bold " + fs + "px " + SERIF;
          ctx.fillText(lines[0] || "", 18, h * 0.24);
          ctx.font = "italic " + Math.floor(fs * 0.7) + "px " + SERIF;
          ctx.fillText(lines[1] || "", 18, h * 0.46);
          ctx.font = Math.floor(fs * 0.55) + "px " + SERIF;
          for (let i = 2; i < lines.length; i++)
            ctx.fillText(lines[i], 18, h * 0.62 + (i - 2) * fs * 0.62);
          blotches(ctx, w, h, r, 18, 0.25);
          speckle(ctx, w, h, r, 400);
        } else if (style === "poster") {
          ctx.fillStyle = o.bg || "#e2d3a8";
          ctx.fillRect(0, 0, w, h);
          if (o.art) {
            try {
              o.art(ctx, w, h, r);
            } catch (e) {
              /* ignore */
            }
          }
          ctx.fillStyle = o.fg || "#7a1f18";
          let fs = Math.floor(h * 0.1);
          fs = fitFont(ctx, lines, fs, w * 0.86, o.font || DECO, "bold");
          ctx.font = "bold " + fs + "px " + (o.font || DECO);
          lines.forEach((t, i) =>
            ctx.fillText(t, w / 2, h * (o.top || 0.14) + i * fs * 1.25),
          );
          blotches(ctx, w, h, r, 30, 0.3);
          speckle(ctx, w, h, r, 600);
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(0, h - 6, w, 6);
        } else if (style === "raider") {
          ctx.clearRect(0, 0, w, h);
          ctx.lineJoin = "round";
          let fs = Math.floor((h * 0.8) / L);
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            'Impact, "Arial Black", sans-serif',
            "bold",
          );
          ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (L - 1) / 2) * fs;
            ctx.save();
            ctx.translate(w / 2, y);
            ctx.rotate((r() - 0.5) * 0.1);
            ctx.strokeStyle = "rgba(10,8,6,0.8)";
            ctx.lineWidth = fs * 0.12;
            ctx.strokeText(t, 0, 0);
            ctx.fillStyle = o.fg || "#c42a1e";
            ctx.fillText(t, 0, 0);
            for (let k = 0; k < 10; k++)
              ctx.fillRect(
                (r() - 0.5) * w * 0.8,
                fs * 0.2,
                2 + r() * 2,
                5 + r() * fs * 0.6,
              );
            ctx.restore();
          });
        } else if (style === "marquee") {
          ctx.fillStyle = o.bg || "#1a1410";
          ctx.fillRect(0, 0, w, h);
          for (let x = 10; x < w; x += 22)
            for (const y of [8, h - 8]) {
              ctx.fillStyle = r() < 0.3 ? "#3a2c1a" : "#ffe2a0";
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, TAU);
              ctx.fill();
            }
          draw(
            o.font || DECO,
            "bold",
            o.fg || "#f4e4b8",
            "rgba(0,0,0,0.6)",
            1.15,
          );
        } else if (style === "brass") {
          const g = ctx.createLinearGradient(0, 0, w, h);
          g.addColorStop(0, "#b89a58");
          g.addColorStop(0.5, "#e0c47c");
          g.addColorStop(1, "#8a6c34");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(60,40,10,0.8)";
          ctx.lineWidth = 6;
          ctx.strokeRect(5, 5, w - 10, h - 10);
          draw(
            o.font || SERIF,
            "bold",
            "#3a2a10",
            "rgba(255,240,200,0.4)",
            1.1,
          );
          blotches(ctx, w, h, r, 20, 0.3);
        } else if (style === "neon") {
          ctx.fillStyle = "#060504";
          ctx.fillRect(0, 0, w, h);
          ctx.shadowColor = o.fg || "#ff7a3a";
          ctx.shadowBlur = 16;
          draw(o.font || DECO, "bold", o.fg || "#ffb070", null, 1.1);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = o.bg || "#222";
          ctx.fillRect(0, 0, w, h);
          draw(o.font || SANS, "bold", o.fg || "#ddd", null, 1.1);
        }
      },
      { clamp: true },
    );
  };

  // ===================================================================
  // Materials
  // ===================================================================
  // key → {src: G.mats/G.tex name, tint, color (fallback), rough, metal, uv (m/tile fallback), emissive, ei, custom, opts}
