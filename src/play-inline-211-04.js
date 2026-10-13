// play-inline-211 04 — ctx
// Lines 655-964 of readable/play-inline-211.pretty.js (statement-aligned).
  function plasterTex() {
    return PH.canvasTex("ph_plaster", 512, 512, (ctx, w, h) => {
      noiseFill(ctx, w, h, (x, y) => {
        const n = tf(x, y, 70, 512),
          m = tf(x + 200, y, 18, 512),
          st = U.fbm2(x / 6, y / 120, 2);
        let v = 196 + n * 34 + (m - 0.5) * 14 - Math.max(0, st - 0.58) * 70;
        return [v, v * 0.97, v * 0.9];
      });
      const r = PH.rng("plaster");
      ctx.strokeStyle = "rgba(60,50,40,0.45)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        let x = r() * w,
          y = r() * h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let k = 0; k < 8; k++) {
          x += (r() - 0.5) * 40;
          y += r() * 30;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      for (let i = 0; i < 2; i++) {
        const x = r() * w,
          y = r() * h,
          rw = 10 + r() * 24,
          rh = 8 + r() * 18;
        ctx.fillStyle = "rgba(150,124,96,0.6)";
        ctx.beginPath();
        ctx.ellipse(x, y, rw, rh, r() * 3, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "rgba(70,52,36,0.7)";
        ctx.lineWidth = 2;
        for (let k = -2; k <= 2; k++) {
          ctx.beginPath();
          ctx.moveTo(x - rw * 0.8, y + k * rh * 0.3);
          ctx.lineTo(x + rw * 0.8, y + k * rh * 0.3);
          ctx.stroke();
        }
      }
      for (let i = 0; i < 8; i++) {
        const x = r() * w;
        const g = ctx.createLinearGradient(0, 0, 0, h * (0.3 + r() * 0.5));
        g.addColorStop(0, "rgba(90,70,40,0.35)");
        g.addColorStop(1, "rgba(90,70,40,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 6 + r() * 20, h);
      }
    });
  }
  /** Navy deck linoleum: dull green-grey 9-inch tiles, scuffs & wax build-up. */
  function linoTex() {
    return PH.canvasTex("ph_lino", 256, 256, (ctx, w, h) => {
      const r = PH.rng("lino"),
        T = 32;
      for (let y = 0; y < h; y += T)
        for (let x = 0; x < w; x += T) {
          const v = 0.85 + r() * 0.15,
            alt = ((x + y) / T) % 2;
          const c = alt ? [104, 112, 98] : [92, 100, 90];
          ctx.fillStyle =
            "rgb(" +
            ((c[0] * v) | 0) +
            "," +
            ((c[1] * v) | 0) +
            "," +
            ((c[2] * v) | 0) +
            ")";
          ctx.fillRect(x, y, T, T);
          ctx.fillStyle = "rgba(30,34,28,0.5)";
          ctx.fillRect(x, y, T, 1);
          ctx.fillRect(x, y, 1, T);
        }
      noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
        const n = tf(x, y, 40, 256);
        const k = 0.82 + n * 0.3;
        return [R * k, Gc * k, B * k];
      });
    });
  }
  PH.customTex = {
    lino: linoTex,
    plaster: plasterTex,
    redtile: redTileTex,
    guastavino: guastavinoTex,
    sugar: sugarTex,
    molasses: molassesTex,
    rawsugar: rawSugarTex,
    navyplate: navyPlateTex,
    hextile: hexTileTex,
    hullgrey: hullGreyTex,
    hullred: hullRedTex,
  };

  // -------------------------------------------------------------------
  // Sign textures (our own lettering; G.tex.sign is preferred when present)
  // -------------------------------------------------------------------
  function fitFont(ctx, lines, fs, maxW, fam, weight) {
    ctx.font = (weight || "bold") + " " + fs + "px " + fam;
    let mw = 0;
    for (const t of lines) mw = Math.max(mw, ctx.measureText(t).width);
    return mw > maxW ? Math.floor((fs * maxW) / mw) : fs;
  }
  /**
   * styles: enamel | engraved | raider | stencil | banner | neon_letters | chalk | paper
   * extra: {bg, fg, size, font}
   */
  PH.signTex = function (key, lines, style, w, h, extra) {
    w = w || 512;
    h = h || 128;
    extra = extra || {};
    return PH.canvasTex(
      "ph_sign_" + key,
      w,
      h,
      (ctx) => {
        const r = PH.rng(key);
        const fg = extra.fg,
          bg = extra.bg;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const draw = (fam, weight, fill, stroke, lh) => {
          let fs = extra.size || Math.floor((h * 0.7) / lines.length);
          fs = fitFont(ctx, lines, fs, w * 0.9, fam, weight);
          ctx.font = (weight || "bold") + " " + fs + "px " + fam;
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (lines.length - 1) / 2) * fs * (lh || 1.12);
            if (stroke) {
              ctx.lineJoin = "round";
              ctx.strokeStyle = stroke;
              ctx.lineWidth = Math.max(3, fs * 0.12);
              ctx.strokeText(t, w / 2, y);
            }
            ctx.fillStyle = fill;
            ctx.fillText(t, w / 2, y);
          });
          return fs;
        };
        if (style === "engraved") {
          ctx.fillStyle = bg || "#b9b09c";
          ctx.fillRect(0, 0, w, h);
          noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
            const n = (U.fbm2(x / 20, y / 20, 3) - 0.5) * 40;
            return [R + n, Gc + n, B + n];
          });
          ctx.fillStyle = "rgba(255,255,255,0.3)";
          draw(
            '"Times New Roman", Georgia, serif',
            "bold",
            fg || "rgba(40,34,28,0.88)",
            null,
          );
        } else if (style === "raider") {
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
          const fs = draw(
            'Impact, "Arial Black", sans-serif',
            "bold",
            fg || "#b3261c",
            "rgba(14,10,8,0.9)",
          );
          ctx.fillStyle = fg || "#b3261c";
          for (let k = 0; k < 14; k++)
            ctx.fillRect(
              w * 0.1 + r() * w * 0.8,
              h / 2 + fs * 0.3 * (r() - 0.2),
              3,
              6 + r() * fs * 0.5,
            );
        } else if (style === "stencil") {
          ctx.fillStyle = bg || "#5c6166";
          ctx.fillRect(0, 0, w, h);
          noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
            const n = (U.fbm2(x / 25, y / 25, 3) - 0.5) * 40;
            return [R + n, Gc + n, B + n];
          });
          draw(
            '"Arial Black", Impact, sans-serif',
            "bold",
            fg || "#e8e4d8",
            null,
          );
          for (let i = 0; i < 30; i++) {
            ctx.fillStyle =
              "rgba(" +
              ((100 + r() * 40) | 0) +
              ",50,20," +
              (0.2 + r() * 0.4) +
              ")";
            ctx.fillRect(r() * w, r() * h, 2 + r() * 5, 10 + r() * 40);
          }
        } else if (style === "banner") {
          ctx.fillStyle = bg || "#8e2b25";
          ctx.fillRect(0, 0, w, h);
          draw(
            '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
            "bold",
            fg || "#eadcbc",
            null,
            1.25,
          );
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(255,240,200,0.2)");
          g.addColorStop(1, "rgba(40,30,20,0.35)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          for (let i = 0; i < 24; i++) {
            ctx.fillStyle = "rgba(30,20,10," + (0.08 + r() * 0.2) + ")";
            ctx.beginPath();
            ctx.ellipse(
              r() * w,
              r() * h,
              6 + r() * 30,
              10 + r() * 50,
              0,
              0,
              TAU,
            );
            ctx.fill();
          }
        } else if (style === "chalk") {
          ctx.fillStyle = bg || "#1d2420";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#6a5a40";
          ctx.lineWidth = h * 0.06;
          ctx.strokeRect(0, 0, w, h);
          draw(
            '"Comic Sans MS", "Segoe Print", cursive',
            "normal",
            fg || "rgba(230,230,220,0.85)",
            null,
            1.2,
          );
        } else if (style === "paper") {
          ctx.fillStyle = bg || "#d8cfb4";
          ctx.fillRect(0, 0, w, h);
          noiseFill(ctx, w, h, (x, y, R, Gc, B) => {
            const n = (U.fbm2(x / 30, y / 30, 3) - 0.5) * 50;
            return [R + n, Gc + n, B + n - 8];
          });
          draw(
            '"Courier New", monospace',
            "bold",
            fg || "rgba(30,26,22,0.9)",
            null,
            1.25,
          );
        } else {
          // enamel
          ctx.fillStyle = bg || "#1d4a3a";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = fg || "#e8dfc4";
          ctx.lineWidth = Math.max(3, h * 0.05);
          ctx.strokeRect(h * 0.08, h * 0.08, w - h * 0.16, h - h * 0.16);
          draw(
            '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
            "bold",
            fg || "#e8dfc4",
            null,
          );
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
        }
      },
      { clamp: true },
    );
  };

  // -------------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------------
  // src = textures-module surface name (shared G.mats material); custom = our canvas; uv = metres per tile override
