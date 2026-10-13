// play-inline-12 05 — ctx
// Lines 1160-1482 of readable/play-inline-12.pretty.js (statement-aligned).
  function genBrownstone(v) {
    const pal = [
      { wall: "brownstone", trim: "#6a4636", frame: "#2a1e18" },
      { wall: "brick_red", trim: "#5a3a2c", frame: "#e0dccc" },
      { wall: "stucco", trim: "#7a7266", frame: "#2c3a30" },
    ][v];
    return function (ctx, w, h, r, hc, def) {
      const S = STYLES.brownstone,
        E = makeCanvases(S);
      paintWall(ctx, 0, 0, w, h, pal.wall, r, 340 + v);
      const bw = w / S.bays,
        fh = h / S.floors;
      for (let f = 0; f < S.floors; f++) {
        const y0 = f * fh;
        for (let b = 0; b < S.bays; b++) {
          const ww = bw * 0.5,
            wh = fh * 0.62,
            x = b * bw + (bw - ww) / 2,
            y = y0 + fh * 0.2;
          // carved pediment / eyebrow lintel
          ctx.fillStyle = X.css(pal.trim);
          ctx.beginPath();
          ctx.moveTo(x - 10, y - 6);
          ctx.lineTo(x + ww + 10, y - 6);
          ctx.lineTo(x + ww + 6, y - 20);
          ctx.lineTo(x - 6, y - 20);
          ctx.closePath();
          ctx.fill();
          if (f % 2 === 0) {
            ctx.beginPath();
            ctx.moveTo(x - 8, y - 20);
            ctx.lineTo(x + ww / 2, y - 34);
            ctx.lineTo(x + ww + 8, y - 20);
            ctx.closePath();
            ctx.fill();
          }
          ctx.fillStyle = "rgba(255,240,220,0.15)";
          ctx.fillRect(x - 6, y - 20, ww + 12, 2);
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          ctx.fillRect(x - 10, y - 6, ww + 20, 3);
          hc.fillStyle = "#f0f0f0";
          hc.fillRect(x - 10, y - 20, ww + 20, 14);
          const st = pickState(
            r,
            INHABITED.brownstone === v
              ? settledWeights
              : {
                  intact: 0.5,
                  broken: 0.2,
                  boarded: 0.16,
                  burnt: 0.04,
                  empty: 0.06,
                  lit: 0.04,
                },
          );
          drawWindow(ctx, hc, E.ctx, r, {
            x,
            y,
            w: ww,
            h: wh,
            state: st,
            panes: [2, 4],
            sash: true,
            frame: pal.frame,
            arch: v === 1 && f % 2 === 1,
            ac: st === "intact" && r() < 0.15,
          });
          sill(ctx, hc, x - 6, y + wh, ww + 12, 7, pal.trim, r, true);
          // decorative iron window-box bracket (dead plants) occasionally
          if (r() < 0.12) {
            ctx.fillStyle = "#2a2420";
            ctx.fillRect(x, y + wh + 7, ww, 8);
            ctx.fillStyle = "#5a4a30";
            for (let k = 0; k < 6; k++)
              ctx.fillRect(x + 3 + (k * ww) / 6, y + wh + 1, 1.5, 7);
          }
        }
      }
      weatherFacade(ctx, hc, w, h, r, 1.1);
      storeE(def.name, E);
    };
  }
  function genWarehouse(v) {
    const pal = [
      { wall: "brick_red", trim: "#6a2c20", frame: "#2a2a28" },
      { wall: "brick_brown", trim: "#4a3226", frame: "#3a2a20" },
    ][v];
    return function (ctx, w, h, r, hc, def) {
      const S = STYLES.warehouse,
        E = makeCanvases(S);
      paintWall(ctx, 0, 0, w, h, pal.wall, r, 360 + v);
      const bw = w / S.bays,
        fh = h / S.floors;
      // brick pilasters
      for (let b = 0; b <= S.bays; b++) {
        X.wrap(w, h, b * bw, h / 2, 20, (cx) => {
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.fillRect(cx + 10, 0, 4, h);
          ctx.fillStyle = "rgba(255,230,210,0.06)";
          ctx.fillRect(cx - 12, 0, 22, h);
          hc.fillStyle = "#d0d0d0";
          hc.fillRect(cx - 12, 0, 24, h);
        });
      }
      for (let f = 0; f < S.floors; f++) {
        const y0 = f * fh;
        for (let b = 0; b < S.bays; b++) {
          const ww = bw * 0.7,
            wh = fh * 0.62,
            x = b * bw + (bw - ww) / 2,
            y = y0 + fh * 0.18;
          // segmental arch of soldier bricks
          ctx.fillStyle = X.css(pal.trim);
          ctx.beginPath();
          ctx.moveTo(x - 4, y + 6);
          ctx.quadraticCurveTo(x + ww / 2, y - 18, x + ww + 4, y + 6);
          ctx.lineTo(x + ww + 4, y + 14);
          ctx.quadraticCurveTo(x + ww / 2, y - 8, x - 4, y + 14);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.3)";
          ctx.lineWidth = 1;
          for (let k = 0; k <= 14; k++) {
            const t = k / 14,
              ax = x - 4 + t * (ww + 8),
              ay = y + 6 - Math.sin(t * Math.PI) * 12;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax, ay + 8);
            ctx.stroke();
          }
          // steel multi-pane factory sash: many individual panes broken/missing/painted
          ctx.fillStyle = "#3a3e3a";
          ctx.fillRect(x, y + 8, ww, wh - 8);
          const pc = 6,
            pr = 5,
            pw = ww / pc,
            ph = (wh - 8) / pr;
          // one sheet of wired/frosted glass reflecting the sky across the whole sash, then individual panes
          const gl = ctx.createLinearGradient(x, y + 8, x + ww * 0.5, y + wh);
          gl.addColorStop(0, "#8a968c");
          gl.addColorStop(0.5, "#5e6a64");
          gl.addColorStop(1, "#3a4440");
          // damage clusters: a few adjacent panes knocked out together (thrown bricks), not uniform noise
          const hole =
            r() < 0.55
              ? [(r() * pc) | 0, (r() * pr) | 0, 0.8 + r() * 1.4]
              : null;
          const painted = r() < 0.3; // whole lower rows painted over (blackout paint, 1940s)
          for (let i = 0; i < pc; i++)
            for (let j = 0; j < pr; j++) {
              const px = x + i * pw,
                py = y + 8 + j * ph,
                t = r();
              const dh = hole
                ? Math.hypot(i - hole[0], (j - hole[1]) * 1.3)
                : 99;
              let mk = MK_WIRED;
              if (dh < hole?.[2] || t < 0.04) {
                ctx.fillStyle = "#16140f";
                mk = MK_HOLE;
              } // missing
              else if (painted && j >= pr - 2) {
                ctx.fillStyle = "#5c6254";
                mk = MK_NONE;
              } // painted-over
              else if (t < 0.07) {
                ctx.fillStyle = "#6a5a44";
                mk = MK_NONE;
              } // plywood patch
              else {
                ctx.fillStyle = gl;
              }
              ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);
              E.m.ctx.fillStyle = mk;
              E.m.ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);
              if (ctx.fillStyle !== "#16140f" && r() < 0.12) {
                ctx.strokeStyle = "rgba(230,235,225,0.5)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(px + 1, py + r() * ph);
                ctx.lineTo(px + pw - 1, py + r() * ph);
                ctx.stroke();
              }
              if (r() < 0.25) {
                ctx.fillStyle = "rgba(60,50,35,0.25)";
                ctx.fillRect(px + 1, py + ph * 0.5, pw - 2, ph * 0.5 - 1);
              } // grime
            }
          ctx.strokeStyle = X.css(pal.frame);
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y + 8, ww, wh - 8);
          hc.fillStyle = "#404040";
          hc.fillRect(x, y + 8, ww, wh - 8);
          // lit factory window glow (rare)
          if (r() < 0.03) {
            E.ctx.fillStyle = "#ffc070";
            E.ctx.fillRect(x / 2, (y + 8) / 2, ww / 2, (wh - 8) / 2);
            ctx.fillStyle = "rgba(255,190,110,0.5)";
            ctx.fillRect(x, y + 8, ww, wh - 8);
          }
          sill(ctx, hc, x - 3, y + wh, ww + 6, 6, "#8a8272", r, true);
        }
        // faded painted band
        if (v === 0 && f === 0) {
          ctx.fillStyle = "rgba(210,200,180,0.12)";
          ctx.fillRect(0, y0 + fh * 0.02, w, fh * 0.1);
        }
      }
      weatherFacade(ctx, hc, w, h, r, 1.2);
      storeE(def.name, E);
    };
  }
  function genOffice(v) {
    const pal = [
      { mull: "#a8aca8", spand: "#3e7a7a", glass: 1 }, // 50s teal spandrel curtain wall
      { mull: "#6a6e6c", spand: "#8a8a82", glass: 1 }, // grey aluminium
      { mull: "#c0bcb0", spand: "#a09a8a", glass: 0 }, // ribbon windows between concrete bands
    ][v];
    return function (ctx, w, h, r, hc, def) {
      const S = STYLES.office,
        E = makeCanvases(S);
      paintWall(ctx, 0, 0, w, h, v === 2 ? "concrete" : "stucco", r, 380 + v);
      const bw = w / S.cols,
        fh = h / S.floors;
      const blast = [r(), r()];
      let run = 0,
        dress = null;
      for (let f = 0; f < S.floors; f++) {
        const y0 = f * fh,
          wh = fh * (v === 2 ? 0.5 : 0.64),
          sp = fh - wh;
        // spandrel band
        const sg = ctx.createLinearGradient(0, y0 + wh, 0, y0 + fh);
        sg.addColorStop(0, X.css(X.shade(pal.spand, 0.1)));
        sg.addColorStop(1, X.css(X.shade(pal.spand, -0.2)));
        ctx.fillStyle = sg;
        ctx.fillRect(0, y0 + wh, w, sp);
        hc.fillStyle = v === 2 ? "#e0e0e0" : "#8a8a8a";
        hc.fillRect(0, y0 + wh, w, sp);
        for (let b = 0; b < S.cols; b++) {
          const x = b * bw,
            t = r();
          // panel tone variation + missing spandrel panels exposing structure
          if (v !== 2 && r() < 0.08) {
            ctx.fillStyle = "#1a1814";
            ctx.fillRect(x + 2, y0 + wh + 2, bw - 4, sp - 4);
            ctx.fillStyle = "#4a3a2a";
            ctx.fillRect(x + bw * 0.45, y0 + wh + 2, 3, sp - 4);
          } else {
            ctx.fillStyle = X.css(r() < 0.5 ? "#000" : "#fff", r() * 0.08);
            ctx.fillRect(x, y0 + wh, bw, sp);
          }
          // damage clusters around a blast point instead of uniform salt-and-pepper breakage (~35% overall)
          const dx = (b + 0.5) / S.cols - blast[0],
            dy = (f + 0.5) / S.floors - blast[1];
          const near = Math.exp(-(dx * dx * 24 + dy * dy * 14));
          const pb = 0.05 + near * 0.45;
          // a blown-out curtain-wall pane is mostly just an empty frame; only some keep jagged shards
          const st =
            t < pb
              ? r() < 0.12
                ? "burnt"
                : r() < 0.55
                  ? "empty"
                  : "broken"
              : t < pb + 0.04
                ? "boarded"
                : t < pb + 0.065
                  ? "lit"
                  : t < pb + 0.1
                    ? "empty"
                    : "intact";
          // tenants: runs of 3–8 windows share blinds (at about the same height) or bare glass — a calm, dusty curtain wall
          // instead of a mosaic of random cells
          if (run-- <= 0) {
            run = 2 + ((r() * 6) | 0);
            const k = r();
            dress = {
              kind: k < 0.3 ? "blind" : k < 0.36 ? "curtain" : "none",
              level: 0.12 + r() * 0.4,
              col: r() < 0.6 ? "#b8ae92" : "#a09a88",
            };
          }
          drawWindow(ctx, hc, E.ctx, r, {
            x: x + 1,
            y: y0 + 1,
            w: bw - 2,
            h: wh - 1,
            state: st,
            panes: [1, 1],
            frame: pal.mull,
            reveal: 2,
            crack: 0.1 + near * 0.3,
            dress,
          });
        }
        // mullions
        for (let b = 0; b <= S.cols; b++) {
          ctx.fillStyle = X.css(pal.mull);
          ctx.fillRect(b * bw - 2, y0, 4, wh);
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(b * bw + 2, y0, 2, wh);
          hc.fillStyle = "#c0c0c0";
          hc.fillRect(b * bw - 2, y0, 4, wh);
        }
        ctx.fillStyle = X.css(pal.mull);
        ctx.fillRect(0, y0 + wh - 2, w, 4);
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, y0 + wh + 2, w, 3);
      }
      weatherFacade(ctx, hc, w, h, r, 0.9);
      storeE(def.name, E);
    };
  }

  const GENS = {
    tenement: genTenement,
    artdeco: genArtdeco,
    brownstone: genBrownstone,
    warehouse: genWarehouse,
    office: genOffice,
  };
