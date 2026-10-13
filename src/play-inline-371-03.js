// play-inline-371 03 — ctx
// Lines 340-635 of readable/play-inline-371.pretty.js (statement-aligned).
  C.mahogany = [
    512,
    512,
    (ctx, w, h) => {
      const r = P.rng("mahog");
      ctx.fillStyle = "#4a2216";
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle =
          "rgba(" +
          ((100 + r() * 50) | 0) +
          "," +
          ((40 + r() * 20) | 0) +
          ",22," +
          (0.1 + r() * 0.2) +
          ")";
        ctx.fillRect(0, y, w, 1 + r() * 2);
      }
      // raised panels + a rail
      for (let i = 0; i < 2; i++) {
        const x0 = (i * w) / 2 + 20,
          pw = w / 2 - 40;
        ctx.strokeStyle = "rgba(15,6,2,0.75)";
        ctx.lineWidth = 6;
        ctx.strokeRect(x0, 40, pw, h - 110);
        ctx.strokeStyle = "rgba(210,140,90,0.22)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x0 + 5, 45, pw - 10, h - 120);
      }
      ctx.fillStyle = "rgba(20,8,3,0.6)";
      ctx.fillRect(0, h - 44, w, 8);
      P.blotches(ctx, w, h, r, 24, 0.22);
    },
  ];

  // =====================================================================
  // texture helpers
  // =====================================================================
  /**
   * Window-bay facade atlas: nx × ny bays per tile (uv 0..1 = one tile). o: {wall, trim, win (0..1 of bay width), winH, sill,
   * arch, spandrel, lit (0..1 chance), cold (share of lit bays with cold-white Continuity light), broken, boarded, burnt (0..1
   * chance a whole ROW is a burnt-out floor), res} — every bay gets its own state so the repeat is hard to read.
   * P.bayLitTex(key, o) = the matching emissive mask (lit panes only) for a night-glow material.
   */
  const bayStateCache = {};
  function bayStates(key, o) {
    if (bayStateCache[key]) return bayStateCache[key];
    const r = P.rng("baystate" + key),
      nx = o.nx || 4,
      ny = o.ny || 4,
      st = [];
    const burntRow = [];
    for (let j = 0; j < ny; j++) burntRow.push(r() < (o.burnt || 0));
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < ny; j++) {
        const roll = r();
        let kind = "dark";
        if (burntRow[j] && r() < 0.85) kind = "burnt";
        else if (roll < (o.lit || 0)) kind = "lit";
        else if (roll < (o.lit || 0) + (o.broken || 0.25)) kind = "broken";
        st.push({
          i,
          j,
          kind,
          cold: r() < (o.cold || 0),
          boarded: kind !== "lit" && r() < (o.boarded || 0.08),
          blind: r(),
          soot: r() < 0.6,
          tint: r(),
        });
      }
    return (bayStateCache[key] = { st, burntRow, nx, ny });
  }
  function bayGeom(o, W, H, nx, ny, s) {
    const bw = W / nx,
      bh = H / ny;
    const ww = bw * (o.win || 0.52),
      wh = bh * (o.winH || 0.62);
    const wx = s.i * bw + (bw - ww) / 2,
      wy = s.j * bh + bh * (o.winTop || 0.16);
    return { bw, bh, ww, wh, wx, wy, x0: s.i * bw, y0: s.j * bh };
  }
  P.bayTex = function (key, o) {
    o = o || {};
    const nx = o.nx || 4,
      ny = o.ny || 4,
      W = o.res || 512,
      H = o.res || 512;
    return P.canvasTex("m3_bay_" + key, W, H, (ctx) => {
      const r = P.rng("bay" + key);
      const B = bayStates(key, o),
        k = W / 512;
      ctx.fillStyle = o.wall || "#b8a07a";
      ctx.fillRect(0, 0, W, H);
      // brick / stone texture: coursing + per-brick tone
      ctx.strokeStyle = o.joint || "rgba(60,44,30,0.28)";
      ctx.lineWidth = 1;
      const ch = (o.course || 6) * k;
      for (let y = 0; y < H; y += ch) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      for (let y = 0, row = 0; y < H; y += ch, row++)
        for (let x = (row % 2) * ch * 1.5; x < W; x += ch * 3) {
          ctx.fillStyle =
            "rgba(" +
            (r() < 0.5 ? "40,28,18," : "250,235,210,") +
            r() * 0.07 +
            ")";
          ctx.fillRect(x, y, ch * 3 - 1, ch - 1);
        }
      for (const s of B.st) {
        const g0 = bayGeom(o, W, H, nx, ny, s),
          { bw, bh, ww, wh, wx, wy } = g0;
        if (o.spandrel) {
          ctx.fillStyle = o.spandrel;
          ctx.fillRect(wx - 2 * k, wy + wh + 4 * k, ww + 4 * k, bh * 0.12);
        }
        // reveal (deep shadow on the top/left = recessed window) + glass
        ctx.fillStyle = "rgba(20,16,12,0.85)";
        ctx.fillRect(wx - 3 * k, wy - 3 * k, ww + 6 * k, wh + 6 * k);
        let glass;
        if (s.kind === "lit") {
          const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
          if (s.cold) {
            g.addColorStop(0, "#dfe8f0");
            g.addColorStop(1, "#6a7a88");
          } else {
            g.addColorStop(0, "#f0c070");
            g.addColorStop(1, "#8a5a24");
          }
          glass = g;
        } else if (s.kind === "broken" || s.kind === "burnt") glass = "#07090a";
        else {
          const g = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
          const t = 0.8 + s.tint * 0.4;
          g.addColorStop(
            0,
            "rgb(" +
              ((60 * t) | 0) +
              "," +
              ((74 * t) | 0) +
              "," +
              ((80 * t) | 0) +
              ")",
          );
          g.addColorStop(0.5, "#1c2428");
          g.addColorStop(1, "#2c363a");
          glass = g;
        }
        ctx.fillStyle = glass;
        ctx.fillRect(wx, wy, ww, wh);
        if (o.arch) {
          ctx.beginPath();
          ctx.arc(wx + ww / 2, wy, ww / 2, Math.PI, 0);
          ctx.fill();
        }
        // reveal shadow inside the opening (reads as depth)
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(wx, wy, ww, wh * 0.12);
        ctx.fillRect(wx, wy, ww * 0.1, wh);
        // pulled blinds on some intact panes
        if (s.kind === "dark" && s.blind < 0.4) {
          ctx.fillStyle = "rgba(200,190,160,0.55)";
          ctx.fillRect(wx, wy, ww, wh * (0.2 + s.blind));
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          for (let y = wy + 3 * k; y < wy + wh * (0.2 + s.blind); y += 4 * k)
            ctx.fillRect(wx, y, ww, 1);
        }
        if (s.kind === "lit") {
          ctx.fillStyle = "rgba(40,24,10,0.5)";
          ctx.fillRect(wx + ww * 0.15, wy + wh * 0.55, ww * 0.3, wh * 0.45);
        }
        // broken pane shards
        if (s.kind === "broken") {
          ctx.strokeStyle = "rgba(160,180,180,0.5)";
          ctx.lineWidth = 1.2 * k;
          for (let q = 0; q < 3; q++) {
            ctx.beginPath();
            ctx.moveTo(wx + r() * ww, wy);
            ctx.lineTo(wx + r() * ww, wy + r() * wh * 0.6);
            ctx.lineTo(wx + r() * ww, wy + wh * 0.2);
            ctx.stroke();
          }
        }
        // mullions / sash (burnt-out floors lost theirs)
        if (s.kind !== "burnt") {
          ctx.fillStyle = o.frame || "#2a241c";
          ctx.fillRect(wx + ww / 2 - 1.5 * k, wy, 3 * k, wh);
          ctx.fillRect(wx, wy + wh * 0.5 - 1.5 * k, ww, 3 * k);
        } else {
          ctx.fillStyle = "#2a1e14";
          ctx.fillRect(wx + r() * ww * 0.6, wy + wh * 0.3, ww * 0.35, 2.5 * k);
        }
        if (s.boarded) {
          ctx.fillStyle = "#5a4630";
          for (let q = 0; q < 4; q++) {
            ctx.save();
            ctx.translate(wx + ww / 2, wy + ((q + 0.6) * wh) / 4.4);
            ctx.rotate((r() - 0.5) * 0.25);
            ctx.fillRect(-ww / 2 - 3 * k, -4 * k, ww + 6 * k, 8 * k);
            ctx.restore();
          }
        }
        // sill + lintel
        ctx.fillStyle = o.trim || "#d8ccb0";
        ctx.fillRect(wx - 5 * k, wy + wh + 1 * k, ww + 10 * k, 5 * k);
        if (!o.arch) ctx.fillRect(wx - 4 * k, wy - 8 * k, ww + 8 * k, 6 * k);
        // soot above broken windows; heavy scorch plumes above burnt floors
        if (s.kind === "broken" && s.soot) {
          const g = ctx.createLinearGradient(0, wy - bh * 0.4, 0, wy);
          g.addColorStop(0, "rgba(10,8,6,0)");
          g.addColorStop(1, "rgba(10,8,6,0.55)");
          ctx.fillStyle = g;
          ctx.fillRect(wx - 4 * k, wy - bh * 0.4, ww + 8 * k, bh * 0.4);
        }
        if (s.kind === "burnt") {
          const g = ctx.createLinearGradient(0, wy - bh * 0.9, 0, wy + wh);
          g.addColorStop(0, "rgba(8,6,4,0)");
          g.addColorStop(0.6, "rgba(8,6,4,0.7)");
          g.addColorStop(1, "rgba(8,6,4,0.9)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(wx - 6 * k, wy + wh);
          ctx.lineTo(wx - bw * 0.25, wy - bh * 0.9);
          ctx.lineTo(wx + ww + bw * 0.25, wy - bh * 0.9);
          ctx.lineTo(wx + ww + 6 * k, wy + wh);
          ctx.fill();
        }
      }
      // pier shading between bays
      const bw = W / nx;
      for (let i = 0; i <= nx; i++) {
        const g = ctx.createLinearGradient(
          i * bw - 6 * k,
          0,
          i * bw + 6 * k,
          0,
        );
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(0.5, "rgba(0,0,0,0.12)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(i * bw - 6 * k, 0, 12 * k, H);
      }
      // streaks & grime
      for (let i = 0; i < (16 * nx) / 4; i++) {
        const x = r() * W,
          g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(30,24,16," + (0.05 + r() * 0.12) + ")");
        g.addColorStop(1, "rgba(30,24,16,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x, r() * H * 0.5, (3 + r() * 10) * k, H);
      }
      P.blotches(ctx, W, H, r, (30 * nx) / 4, 0.2);
      P.speckle(ctx, W, H, r, 1500 * k * k, 0.2, 0.05);
    });
  };
  P.bayLitTex = function (key, o) {
    o = o || {};
    const nx = o.nx || 4,
      ny = o.ny || 4,
      W = (o.res || 512) / 2,
      H = (o.res || 512) / 2;
    return P.canvasTex("m3_baylit_" + key, W, H, (ctx) => {
      const B = bayStates(key, o),
        k = W / 512;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      for (const s of B.st) {
        if (s.kind !== "lit") continue;
        const { ww, wh, wx, wy } = bayGeom(o, W, H, nx, ny, s);
        const g = ctx.createLinearGradient(0, wy, 0, wy + wh);
        if (s.cold) {
          g.addColorStop(0, "#b8d0e8");
          g.addColorStop(1, "#40586a");
        } else {
          g.addColorStop(0, "#ffc870");
          g.addColorStop(1, "#7a4a18");
        }
        ctx.fillStyle = g;
        ctx.fillRect(wx, wy + wh * 0.12, ww, wh * 0.88);
        ctx.fillStyle = "#000";
        ctx.fillRect(wx + ww / 2 - 1.5 * k, wy, 3 * k, wh);
        ctx.fillRect(wx, wy + wh * 0.5 - 1.5 * k, ww, 3 * k);
        ctx.fillRect(wx + ww * 0.15, wy + wh * 0.55, ww * 0.3, wh * 0.45);
      }
    });
  };

  /**
   * Soot / grime decal sheet (transparent). uv regions: [0,0.5]×[0,1] = fire-scorch plume (bottom = window line),
   * [0.5,1]×[0,1] = water & rust streaks hanging from a cornice (top edge = cornice line).
   */
