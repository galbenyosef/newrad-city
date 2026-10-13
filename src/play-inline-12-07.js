// play-inline-12 07 — ctx
// Lines 1611-1952 of readable/play-inline-12.pretty.js (statement-aligned).
  function genTrim(style, part) {
    return function (ctx, w, h, r, hc) {
      const wall = TRIM_WALL[style][0];
      paintWall(
        ctx,
        0,
        0,
        w,
        h,
        part === "base" && style !== "warehouse"
          ? style === "artdeco" || style === "office"
            ? "granite"
            : style === "brownstone"
              ? "brownstone"
              : "limestone"
          : wall,
        r,
        700 + (part === "top" ? 1 : 2) + style.length,
      );
      if (part === "top") {
        if (style === "tenement") {
          // pressed-metal cornice: crown moulding, modillion brackets, dentils, frieze
          ctx.fillStyle = "#6a6a62";
          ctx.fillRect(0, 0, w, 58);
          hc.fillStyle = "#e0e0e0";
          hc.fillRect(0, 0, w, 58);
          ledge(ctx, hc, 0, 16, "#8a8a80", w);
          brackets(ctx, hc, 16, 30, 16, "#7a7a72", w, true);
          dentils(ctx, hc, 46, 8, "#8a8a80", w);
          ctx.fillStyle = "#5a5a52";
          ctx.fillRect(0, 54, w, 6);
          rustRuns(ctx, 58, w, 60, r, 14);
          for (let x = 16; x < w; x += 64) {
            ctx.fillStyle = "rgba(200,190,160,0.35)";
            ctx.fillRect(x, 74, 36, 22);
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.strokeRect(x, 74, 36, 22);
          } // frieze panels
        } else if (style === "artdeco") {
          // stepped parapet + zigzag frieze + fluted pier tops
          ctx.fillStyle = "#c4bba2";
          for (let k = 0; k < 8; k++) {
            const x = k * 64;
            ctx.fillRect(x + 8, 0, 48, 20);
            ctx.fillRect(x + 16, 0, 32, 10);
          }
          ledge(ctx, hc, 20, 10, "#c4bba2", w);
          ctx.fillStyle = "#3a3a36";
          ctx.fillRect(0, 36, w, 34);
          hc.fillStyle = "#606060";
          hc.fillRect(0, 36, w, 34);
          ctx.strokeStyle = "#b09050";
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let x = 0; x <= w; x += 16) ctx.lineTo(x, x % 32 ? 40 : 66);
          ctx.stroke();
          ctx.fillStyle = "#b09050";
          ctx.fillRect(0, 36, w, 3);
          ctx.fillRect(0, 67, w, 3);
          for (let k = 0; k <= 4; k++) {
            const x = (k * w) / 4;
            ctx.fillStyle = "#d0c8b0";
            ctx.fillRect(x - 18, 70, 36, h - 70);
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            for (let f = -12; f <= 12; f += 6)
              ctx.fillRect(x + f, 74, 2, h - 74);
            hc.fillStyle = "#e8e8e8";
            hc.fillRect(x - 18, 70, 36, h - 70);
          }
        } else if (style === "brownstone") {
          // Italianate bracketed cornice
          ctx.fillStyle = "#3a2a22";
          ctx.fillRect(0, 0, w, 64);
          hc.fillStyle = "#e0e0e0";
          hc.fillRect(0, 0, w, 64);
          ledge(ctx, hc, 0, 14, "#5a4034", w);
          brackets(ctx, hc, 14, 44, 8, "#4a3228", w, true);
          for (let k = 0; k < 8; k++) {
            const x = k * 64 + 12;
            ctx.fillStyle = "rgba(120,90,70,0.5)";
            ctx.fillRect(x + 12, 22, 16, 26);
          } // recessed panels between brackets
          ctx.fillStyle = "#2a1e18";
          ctx.fillRect(0, 58, w, 8);
          rustRuns(ctx, 66, w, 50, r, 8);
        } else if (style === "warehouse") {
          // corbelled brick table + ghost sign
          for (let k = 0; k < 3; k++) {
            ctx.fillStyle = "rgba(0,0,0," + (0.18 + k * 0.08) + ")";
            ctx.fillRect(0, 22 + k * 9, w, 3);
          }
          for (let x = 0; x < w; x += 32) {
            ctx.fillStyle = "#6a2c20";
            ctx.fillRect(x + 4, 22, 24, 30);
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.fillRect(x + 4, 52, 24, 4);
            hc.fillStyle = "#e0e0e0";
            hc.fillRect(x + 4, 22, 24, 30);
          }
          ctx.fillStyle = "#8a8272";
          ctx.fillRect(0, 0, w, 10);
          hc.fillStyle = "#f0f0f0";
          hc.fillRect(0, 0, w, 10); // stone coping
          const ghost = [
            "STORAGE",
            "FIREPROOF",
            "& SONS",
            "WAREHOUSE",
            "MOVING",
          ][(r() * 5) | 0];
          X.text(ctx, ghost, w * 0.5, 92, {
            font: "impact",
            size: 44,
            color: "rgba(230,220,190,0.22)",
            spacing: 10,
            maxW: w * 0.9,
            noSafe: true,
          });
        } else {
          // office: aluminium coping + louvred mechanical band
          ledge(ctx, hc, 0, 10, "#a8aca8", w);
          ctx.fillStyle = "#4a4e4c";
          ctx.fillRect(0, 12, w, 60);
          hc.fillStyle = "#808080";
          hc.fillRect(0, 12, w, 60);
          for (let y = 16; y < 70; y += 5) {
            ctx.fillStyle = "rgba(0,0,0,0.45)";
            ctx.fillRect(0, y, w, 2);
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fillRect(0, y + 2, w, 1);
          }
          for (let x = 0; x < w; x += 64) {
            ctx.fillStyle = "#6a6e6c";
            ctx.fillRect(x, 12, 4, 60);
          }
          rustRuns(ctx, 72, w, 50, r, 10);
        }
      } else {
        // base
        if (style === "tenement") {
          // rusticated limestone base + water table
          rustication(ctx, hc, 0, 0, w, h - 18, "#a8a088", 22, r);
          ledge(ctx, hc, h - 20, 8, "#8a8474", w);
          ctx.fillStyle = "#5a564c";
          ctx.fillRect(0, h - 12, w, 12);
        } else if (style === "artdeco") {
          // polished granite plinth + bronze vent grilles
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#3a3a3c");
          g.addColorStop(1, "#1e1e20");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          X.speckle(ctx, w, h, r, {
            count: (w * h) / 25,
            colors: ["#8a8a8a", "#111", "#6a5a5a"],
            min: 0.3,
            max: 1,
            alpha: 0.5,
          });
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect(0, 0, w, 3);
          for (let x = 40; x < w; x += 128) {
            ctx.fillStyle = "#6a5228";
            ctx.fillRect(x, 60, 48, 36);
            ctx.fillStyle = "#2a2014";
            for (let k = 0; k < 6; k++) ctx.fillRect(x + 4, 64 + k * 5, 40, 2);
            hc.fillStyle = "#909090";
            hc.fillRect(x, 60, 48, 36);
          }
          for (let x = 0; x < w; x += 128) {
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(x, 0, 2, h);
          }
        } else if (style === "brownstone") {
          // rusticated basement + barred areaway windows + iron railing
          rustication(ctx, hc, 0, 0, w, h, "#5e4030", 20, r);
          for (let k = 0; k < 4; k++) {
            const x = k * 128 + 40,
              y = 36;
            drawWindow(ctx, hc, null, r, {
              x,
              y,
              w: 48,
              h: 40,
              state: r() < 0.5 ? "boarded" : "empty",
              panes: [2, 1],
              frame: "#1a1612",
              reveal: 4,
            });
            ctx.fillStyle = "#1a1612";
            for (let b = 0; b < 6; b++)
              ctx.fillRect(x + 3 + b * 8, y - 2, 2.5, 44);
          }
          ctx.fillStyle = "#141210";
          ctx.fillRect(0, h - 30, w, 3);
          for (let x = 0; x < w; x += 10) {
            ctx.fillRect(x, h - 30, 2, 30);
            ctx.beginPath();
            ctx.moveTo(x - 2, h - 30);
            ctx.lineTo(x + 1, h - 37);
            ctx.lineTo(x + 4, h - 30);
            ctx.fill();
          }
          hc.fillStyle = "#202020";
          hc.fillRect(0, h - 30, w, 3);
        } else if (style === "warehouse") {
          // loading docks: roll-up doors + concrete dock edge
          ctx.fillStyle = "#6e6a60";
          ctx.fillRect(0, h - 22, w, 22);
          hc.fillStyle = "#d0d0d0";
          hc.fillRect(0, h - 22, w, 22);
          for (let k = 0; k < 2; k++) {
            const x = k * 256 + 50,
              dw = 156,
              dy = 8,
              dh = h - 30;
            ctx.fillStyle = "#1a1814";
            ctx.fillRect(x - 6, dy - 4, dw + 12, dh + 4);
            const g = ctx.createLinearGradient(0, dy, 0, dy + dh);
            g.addColorStop(0, "#6e7068");
            g.addColorStop(1, "#4a4a44");
            const open = r() < 0.35 ? dh * (0.3 + r() * 0.5) : 0;
            ctx.fillStyle = g;
            ctx.fillRect(x, dy, dw, dh - open);
            for (let y = dy; y < dy + dh - open; y += 6) {
              ctx.fillStyle = "rgba(0,0,0,0.3)";
              ctx.fillRect(x, y, dw, 2);
              hc.fillStyle = "#808080";
              hc.fillRect(x, y, dw, 3);
            }
            if (open) {
              ctx.fillStyle = "#0c0a08";
              ctx.fillRect(x, dy + dh - open, dw, open);
            }
            X.blotches(ctx, w, h, r, {
              count: 3,
              color: "#6a3010",
              alpha: 0.3,
              rmin: 8,
              rmax: 24,
            });
            ctx.fillStyle = "#c8a020";
            for (let q = 0; q < 8; q++) {
              ctx.fillStyle = q % 2 ? "#1a1a18" : "#c8a020";
              ctx.fillRect(x + (q * dw) / 8, dy + dh, dw / 8, 6);
            }
          }
        } else {
          // office: dark granite + lobby glass band
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#2e3030");
          g.addColorStop(1, "#1a1c1c");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          for (let x = 0; x < w; x += 64)
            drawWindow(ctx, hc, null, r, {
              x: x + 3,
              y: 12,
              w: 58,
              h: h - 34,
              state: r() < 0.3 ? "empty" : r() < 0.4 ? "boarded" : "intact",
              panes: [1, 1],
              frame: "#a8aca8",
              reveal: 2,
            });
          ctx.fillStyle = "#a8aca8";
          ctx.fillRect(0, 8, w, 4);
          ctx.fillRect(0, h - 22, w, 4);
        }
      }
      weatherFacade(ctx, hc, w, h, r, part === "base" ? 0.9 : 0.8, 1);
      if (part === "base") {
        const bg = ctx.createLinearGradient(0, h - 50, 0, h);
        bg.addColorStop(0, "rgba(40,32,22,0)");
        bg.addColorStop(1, "rgba(40,32,22,0.6)");
        ctx.fillStyle = bg;
        ctx.fillRect(0, h - 50, w, 50);
      }
    };
  }
  for (const st in STYLES) {
    for (const part of ["top", "base"]) {
      X.def("facade_" + st + "_" + part, {
        w: 512,
        h: 128,
        normal: 2.4,
        normalStep: 1,
        rough: 0.85,
        meters: TILE.bays * TILE.bayW,
        metersV: TILE.floorH,
        macro: 0.7,
        desc:
          st +
          " " +
          (part === "top" ? "cornice/parapet" : "ground-floor") +
          " trim strip (14 m × 3.5 m, tiles in U)",
        gen: genTrim(st, part),
      });
    }
  }

  /**
   * Emissive (lit-window) texture for a facade name, or null. Static: night brightness is driven by the
   * material's emissiveIntensity through the clone-safe glow driver in 90_api.js (userData.txGlow), so no
   * per-dusk canvas redraws / re-uploads are needed and clones made by other modules glow too.
   */
  X.facadeEmissive = function (name) {
    if (emissiveTex[name] !== undefined) return emissiveTex[name];
    G.tex.get(name);
    let src = emissiveCanvas[name];
    if (!src) {
      const d = X.GEN[name];
      if (d && X.paintSurface) {
        X.paintSurface(name, d);
        src = emissiveCanvas[name];
      }
    }
    if (!src) {
      emissiveTex[name] = null;
      return null;
    }
    const regen = () => {
      const d = X.GEN[name];
      wantE[name] = true;
      try {
        X.paintSurface(name, d);
      } finally {
        wantE[name] = false;
      }
      const c = emissiveCanvas[name];
      delete emissiveCanvas[name];
      return c;
    };
    const tex = X.toTexture(src, { name: name + "_e", regen });
    delete emissiveCanvas[name]; // the texture owns it now (and can drop/re-paint it)
    emissiveTex[name] = tex;
    return tex;
  };
  /**
   * Interior-mapping window mask for a facade name (half-res, linear, NoColorSpace), or null. See maskCanvas above.
   * Trimmed from CPU RAM after upload like every other texture; re-painted deterministically if ever needed again.
   */
