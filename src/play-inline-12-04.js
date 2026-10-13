// play-inline-12 04 — ctx
// Lines 823-1159 of readable/play-inline-12.pretty.js (statement-aligned).
  X.drawWindow = drawWindow;

  function pickState(r, weights) {
    const t = r();
    let acc = 0;
    for (const k in weights) {
      acc += weights[k];
      if (t < acc) return k;
    }
    return "intact";
  }
  /** Sill (raised stone ledge) with shadow below and dirty runoff streaks. */
  function sill(ctx, hc, x, y, w, t, col, r, streak) {
    ctx.fillStyle = X.css(col);
    ctx.fillRect(x, y, w, t);
    ctx.fillStyle = "rgba(255,250,235,0.25)";
    ctx.fillRect(x, y, w, 1.5);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(x + 1, y + t, w - 2, Math.max(2, t * 0.6));
    hc.fillStyle = "#e8e8e8";
    hc.fillRect(x, y, w, t);
    if (streak) {
      // runoff streaks from sill ends
      for (const sx of [x + 2, x + w * (0.3 + r() * 0.4), x + w - 4]) {
        if (r() < 0.4) continue;
        const len = 20 + r() * 60,
          g = ctx.createLinearGradient(0, y + t, 0, y + t + len);
        g.addColorStop(0, "rgba(25,20,14,0.45)");
        g.addColorStop(1, "rgba(25,20,14,0)");
        ctx.fillStyle = g;
        ctx.fillRect(sx - 2, y + t, 4 + r() * 5, len);
      }
    }
  }
  function lintel(ctx, hc, x, y, w, t, col, keystone) {
    ctx.fillStyle = X.css(col);
    ctx.fillRect(x, y, w, t);
    ctx.fillStyle = "rgba(255,250,235,0.22)";
    ctx.fillRect(x, y, w, 1.5);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(x, y + t, w, 2);
    hc.fillStyle = "#d8d8d8";
    hc.fillRect(x, y, w, t);
    if (keystone) {
      ctx.fillStyle = X.css(X.shade(col, 0.08));
      ctx.beginPath();
      ctx.moveTo(x + w / 2 - t * 0.5, y - 1);
      ctx.lineTo(x + w / 2 + t * 0.5, y - 1);
      ctx.lineTo(x + w / 2 + t * 0.35, y + t + 3);
      ctx.lineTo(x + w / 2 - t * 0.35, y + t + 3);
      ctx.closePath();
      ctx.fill();
      hc.fillStyle = "#f4f4f4";
      hc.fillRect(x + w / 2 - t * 0.4, y, t * 0.8, t + 3);
    }
  }
  /** Shared finishing: rain streaks, soot, bullet pocks, cracks, macro grime (tile-safe). */
  function weatherFacade(ctx, hc, w, h, r, amt, pocks) {
    if (curE && curE.snap) {
      markWallField(ctx, curE, w, h);
      curE.snap = null;
    }
    X.streaks(ctx, w, h, r, {
      count: 26,
      color: "#1a1610",
      alpha: 0.16 * amt,
      minLen: 30,
      maxLen: h * 0.5,
      maxW: 14,
    });
    X.blotches(ctx, w, h, r, {
      count: 10,
      color: "#15120e",
      alpha: 0.2 * amt,
      rmin: 30,
      rmax: 120,
    });
    X.blotches(ctx, w, h, r, {
      count: 4,
      color: "#dcd4c0",
      alpha: 0.08,
      rmin: 30,
      rmax: 90,
    });
    // bullet strikes: sweeps & scatters of varied calibre, soft craters in irregular spalls (no symmetric dot clusters)
    X.bulletStrikes(
      ctx,
      w,
      h,
      r,
      {
        count: pocks === undefined ? 3 : Math.ceil(pocks * 0.75),
        spread: 60,
        size: 1.1,
      },
      hc,
    );
    X.cracks(
      ctx,
      w,
      h,
      r,
      { count: 2, width: 0.8, seg: 5, steps: 30, color: "rgba(20,16,12,0.45)" },
      hc,
    );
    // soot/dirt gathers under every ledge line & at the bottom of each storey; top-lit so upper parts bleach
    X.streaks(ctx, w, h, r, {
      count: 40,
      color: "#241e16",
      alpha: 0.1 * amt,
      minLen: 10,
      maxLen: 80,
      minW: 2,
      maxW: 30,
    });
    X.macroGrime(ctx, w, h, 0.34 * amt, 900 + ((r() * 100) | 0));
    X.desaturate(ctx, w, h, 0.18);
  }

  // ------------------------------------------------------------------
  // Style generators
  // ------------------------------------------------------------------
  function makeCanvases(S) {
    const E = X.canvas(S.w / 2, S.h / 2);
    curE = E;
    E.ctx.fillStyle = "#000";
    E.ctx.fillRect(0, 0, E.w, E.h);
    // window mask at the same half resolution, drawn in full-res coordinates (scaled context)
    const Mk = X.canvas(S.w / 2, S.h / 2);
    Mk.ctx.fillStyle = MK_NONE;
    Mk.ctx.fillRect(0, 0, Mk.w, Mk.h);
    Mk.ctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
    E.m = Mk;
    E.ctx.txMask = Mk.ctx; // drawWindow finds the mask through the emissive context it is handed
    return E;
  }
  const baseWeights = {
    intact: 0.5,
    broken: 0.22,
    boarded: 0.1,
    burnt: 0.05,
    empty: 0.1,
    lit: 0.03,
  };
  // "Inhabited" variants (settlements, squats, walled market towns): far more boarded-up but lit rooms,
  // so a lived-in block reads as a cluster of warm windows at night. Variant index is 0-based here.
  const settledWeights = {
    intact: 0.36,
    broken: 0.12,
    boarded: 0.2,
    burnt: 0.04,
    empty: 0.06,
    lit: 0.22,
  };
  const INHABITED = {
    tenement: 3,
    brownstone: 2,
    artdeco: 3,
    office: -1,
    warehouse: -1,
  };
  const weightsFor = (style, v) =>
    INHABITED[style] === v ? settledWeights : baseWeights;

  function genTenement(v) {
    const pal = [
      { wall: "brick_red", trim: "#b8b09a", frame: "#d8d2c0" },
      { wall: "brick_tan", trim: "#d0c6ae", frame: "#3a4a3a" },
      { wall: "brick_brown", trim: "#9a9486", frame: "#e0dccc" },
      { wall: "brick_cream", trim: "#8a8474", frame: "#5a2a1e" },
    ][v];
    return function (ctx, w, h, r, hc, def) {
      const S = STYLES.tenement,
        E = makeCanvases(S);
      paintWall(ctx, 0, 0, w, h, pal.wall, r, 300 + v);
      const bw = w / S.bays,
        fh = h / S.floors;
      const beltEvery = v % 2 ? 3 : 0;
      for (let f = 0; f < S.floors; f++) {
        const y0 = f * fh;
        if (beltEvery && f % beltEvery === 0) {
          // continuous string course
          ctx.fillStyle = X.css(pal.trim);
          ctx.fillRect(0, y0 + fh - 8, w, 7);
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.fillRect(0, y0 + fh - 1, w, 3);
          hc.fillStyle = "#e0e0e0";
          hc.fillRect(0, y0 + fh - 8, w, 7);
        }
        for (let b = 0; b < S.bays; b++) {
          const ww = bw * 0.46,
            wh = fh * 0.58,
            x = b * bw + (bw - ww) / 2,
            y = y0 + fh * 0.2;
          const st = pickState(r, weightsFor("tenement", v));
          lintel(
            ctx,
            hc,
            x - 5,
            y - 9,
            ww + 10,
            8,
            pal.trim,
            v === 0 || v === 2,
          );
          drawWindow(ctx, hc, E.ctx, r, {
            x,
            y,
            w: ww,
            h: wh,
            state: st,
            panes: v === 1 ? [2, 4] : [1, 2],
            sash: true,
            frame: pal.frame,
            ac: st === "intact" && r() < 0.18,
          });
          sill(ctx, hc, x - 4, y + wh, ww + 8, 5, pal.trim, r, true);
        }
      }
      weatherFacade(ctx, hc, w, h, r, 1);
      storeE(def.name, E);
    };
  }
  function genArtdeco(v) {
    const pal = [
      {
        wall: "limestone",
        pier: "#c4bba2",
        spand: "#3a3a36",
        motif: "#8a7a50",
        frame: "#2a2a28",
      },
      {
        wall: "brick_tan",
        pier: "#b89c72",
        spand: "#8a5a3a",
        motif: "#c8a060",
        frame: "#3a3228",
      },
      {
        wall: "granite",
        pier: "#8e8882",
        spand: "#52585a",
        motif: "#a8acac",
        frame: "#1e2224",
      },
      {
        wall: "brick_dark",
        pier: "#5a4234",
        spand: "#2a2420",
        motif: "#b08a40",
        frame: "#1a1612",
      },
    ][v];
    return function (ctx, w, h, r, hc, def) {
      const S = STYLES.artdeco,
        E = makeCanvases(S);
      paintWall(ctx, 0, 0, w, h, pal.wall, r, 320 + v);
      const bw = w / S.bays,
        fh = h / S.floors;
      // continuous vertical piers between window columns (the deco "verticality")
      for (let b = 0; b <= S.bays; b++) {
        const px = b * bw - bw * 0.14,
          pw = bw * 0.28;
        X.wrap(w, h, px + pw / 2, h / 2, pw, (cx) => {
          const g = ctx.createLinearGradient(cx - pw / 2, 0, cx + pw / 2, 0);
          g.addColorStop(0, X.css(X.shade(pal.pier, 0.15)));
          g.addColorStop(0.35, X.css(pal.pier));
          g.addColorStop(1, X.css(X.shade(pal.pier, -0.3)));
          ctx.fillStyle = g;
          ctx.globalAlpha = 0.9;
          ctx.fillRect(cx - pw / 2, 0, pw, h);
          ctx.globalAlpha = 1;
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          ctx.fillRect(cx - 1, 0, 2, h); // fluting
          hc.fillStyle = "#e8e8e8";
          hc.fillRect(cx - pw / 2, 0, pw, h);
        });
      }
      for (let f = 0; f < S.floors; f++) {
        const y0 = f * fh;
        for (let b = 0; b < S.bays; b++) {
          const x = b * bw + bw * 0.16,
            ww = bw * 0.68,
            wh = fh * 0.6,
            y = y0 + fh * 0.08;
          // recessed spandrel panel with chevron/zigzag motif
          const sy = y + wh + 2,
            sh = fh - wh - fh * 0.08 - 4;
          ctx.fillStyle = X.css(pal.spand);
          ctx.fillRect(x, sy, ww, sh);
          hc.fillStyle = "#505050";
          hc.fillRect(x, sy, ww, sh);
          ctx.strokeStyle = X.css(pal.motif, 0.8);
          ctx.lineWidth = 2;
          const motif = v % 2;
          if (motif === 0) {
            for (let k = 0; k < 3; k++) {
              ctx.beginPath();
              const yy = sy + sh * (0.25 + k * 0.25);
              ctx.moveTo(x + 4, yy + 5);
              ctx.lineTo(x + ww / 2, yy - 5);
              ctx.lineTo(x + ww - 4, yy + 5);
              ctx.stroke();
            }
          } else {
            ctx.beginPath();
            for (let k = 0; k <= 8; k++) {
              const xx = x + 4 + (k * (ww - 8)) / 8,
                yy = sy + sh / 2 + (k % 2 ? -sh * 0.28 : sh * 0.28);
              if (!k) ctx.moveTo(xx, yy);
              else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
            ctx.fillStyle = X.css(pal.motif, 0.7);
            ctx.fillRect(x + 4, sy + 3, ww - 8, 2);
            ctx.fillRect(x + 4, sy + sh - 5, ww - 8, 2);
          }
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(x, sy, ww, 3);
          const st = pickState(r, weightsFor("artdeco", v));
          drawWindow(ctx, hc, E.ctx, r, {
            x,
            y,
            w: ww,
            h: wh,
            state: st,
            panes: [2, 3],
            frame: pal.frame,
            reveal: 5,
          });
        }
      }
      weatherFacade(ctx, hc, w, h, r, 1);
      storeE(def.name, E);
    };
  }
