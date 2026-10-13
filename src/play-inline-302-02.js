// play-inline-302 02 — ctx
// Lines 18-306 of readable/play-inline-302.pretty.js (statement-aligned).
  const P = G._pe;
  const TAU = P.TAU,
    PI = P.PI;
  const SERIF = P.FONTS.SERIF,
    SANS = P.FONTS.SANS,
    DECO = P.FONTS.DECO;
  const MAT = P.MAT,
    CUSTOM = P.CUSTOM;

  // ------------------------------------------------------------------
  // small canvas helpers
  // ------------------------------------------------------------------
  function noiseFill(ctx, w, h, r, base, var_, n, sz) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      const v = (r() - 0.5) * var_;
      ctx.fillStyle =
        v > 0 ? "rgba(255,245,230," + v + ")" : "rgba(10,6,2," + -v + ")";
      const s = (sz || 2) * (0.5 + r());
      ctx.fillRect(r() * w, r() * h, s, s);
    }
  }
  P.noiseFill = noiseFill;

  // ------------------------------------------------------------------
  // CUSTOM surfaces (world-projected UVs unless keep)
  // ------------------------------------------------------------------
  // russet spandrel brick (between the First Journal windows)
  CUSTOM.dn_spandrel = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("dn_spandrel");
      ctx.fillStyle = "#5e3226";
      ctx.fillRect(0, 0, w, h);
      const bh = 16,
        bw = 64;
      for (let y = 0, row = 0; y < h; y += bh, row++) {
        for (let x = (-(row % 2) * bw) / 2; x < w; x += bw) {
          const k = 0.75 + r() * 0.35;
          ctx.fillStyle =
            "rgb(" +
            Math.round(128 * k) +
            "," +
            Math.round(62 * k) +
            "," +
            Math.round(46 * k) +
            ")";
          ctx.fillRect(x + 2, y + 2, bw - 3, bh - 3);
        }
      }
      P.blotches(ctx, w, h, r, 20, 0.2);
      P.speckle(ctx, w, h, r, 900);
    },
  ];
  // gilded pyramid tiles (overlapping fish scales)
  CUSTOM.gold_tiles = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("gold_tiles");
      ctx.fillStyle = "#7a5418";
      ctx.fillRect(0, 0, w, h);
      const s = 32;
      for (let y = -s; y < h + s; y += s * 0.55) {
        const row = Math.round(y / (s * 0.55));
        for (let x = -s; x < w + s; x += s) {
          const cx = x + ((row % 2) * s) / 2,
            cy = y;
          const g = ctx.createRadialGradient(
            cx - 6,
            cy - 4,
            2,
            cx,
            cy,
            s * 0.62,
          );
          const k = 0.8 + r() * 0.3,
            tarn = r() < 0.12;
          g.addColorStop(
            0,
            tarn
              ? "#6a6a40"
              : "rgb(" +
                  Math.round(250 * k) +
                  "," +
                  Math.round(214 * k) +
                  "," +
                  Math.round(120 * k) +
                  ")",
          );
          g.addColorStop(
            0.7,
            tarn
              ? "#3e4a2c"
              : "rgb(" +
                  Math.round(196 * k) +
                  "," +
                  Math.round(140 * k) +
                  "," +
                  Math.round(48 * k) +
                  ")",
          );
          g.addColorStop(1, "#4a3010");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, s * 0.55, 0, PI);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "rgba(60,36,8,0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, s * 0.55, 0, PI);
          ctx.stroke();
        }
      }
      P.blotches(ctx, w, h, r, 16, 0.25);
    },
  ];
  // gilded ceiling coffers (NY Life lobby)
  CUSTOM.coffer = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("coffer");
      ctx.fillStyle = "#6a4a18";
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#e8c870");
      g.addColorStop(0.5, "#b8862c");
      g.addColorStop(1, "#7a5418");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // recessed panel
      ctx.fillStyle = "#23384a";
      ctx.fillRect(34, 34, w - 68, h - 68);
      ctx.strokeStyle = "#f0d890";
      ctx.lineWidth = 6;
      ctx.strokeRect(22, 22, w - 44, h - 44);
      ctx.strokeStyle = "#5a3a10";
      ctx.lineWidth = 3;
      ctx.strokeRect(34, 34, w - 68, h - 68);
      // gilt rosette
      ctx.save();
      ctx.translate(w / 2, h / 2);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(TAU / 12);
        ctx.fillStyle = i % 2 ? "#e8c060" : "#b08030";
        ctx.beginPath();
        ctx.ellipse(0, -22, 8, 22, 0, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = "#fff0b0";
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, TAU);
      ctx.fill();
      ctx.restore();
      P.blotches(ctx, w, h, r, 20, 0.3);
      P.speckle(ctx, w, h, r, 500, 0.35);
    },
  ];
  // ash bear fur / nest bedding
  CUSTOM.fur = [
    256,
    256,
    (ctx, w, h) => {
      const r = P.rng("fur");
      ctx.fillStyle = "#2a2018";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) {
        const x = r() * w,
          y = r() * h,
          L = 4 + r() * 10,
          a = 1.2 + (r() - 0.5) * 0.8;
        const k = r();
        ctx.strokeStyle =
          k < 0.5
            ? "rgba(20,14,10,0.7)"
            : k < 0.85
              ? "rgba(80,60,40,0.55)"
              : "rgba(140,110,80,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L);
        ctx.stroke();
      }
      P.blotches(ctx, w, h, r, 10, 0.3);
    },
  ];
  // newsprint (dense columns of grey type) — stacks, bundles, press webs
  CUSTOM.newsprint = [
    512,
    512,
    (ctx, w, h) => {
      const r = P.rng("newsprint");
      ctx.fillStyle = "#d6cfb8";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(30,26,20,0.75)";
      ctx.font = "bold 34px " + SERIF;
      ctx.textAlign = "center";
      ctx.fillText(
        r() < 0.5 ? "THE DAILY RUIN" : "THE FIRST JOURNAL",
        w / 2,
        40,
        w - 30,
      );
      ctx.fillRect(10, 52, w - 20, 3);
      for (let c = 0; c < 6; c++) {
        const x0 = 12 + (c * (w - 24)) / 6;
        for (let y = 64; y < h - 10; y += 7) {
          if (r() < 0.04) {
            y += 30;
            ctx.fillStyle = "rgba(40,36,30,0.5)";
            ctx.fillRect(x0, y - 26, (w - 24) / 6 - 8, 22);
            ctx.fillStyle = "rgba(30,26,20,0.75)";
            continue;
          }
          ctx.fillRect(x0, y, ((w - 24) / 6 - 8) * (0.7 + r() * 0.3), 3);
        }
      }
      P.blotches(ctx, w, h, r, 30, 0.2);
    },
  ];
  // raider-daubed hide / cloth banner
  CUSTOM.tapestry = [
    256,
    512,
    (ctx, w, h) => {
      const r = P.rng("tapestry");
      ctx.fillStyle = "#5a1a18";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#c8a040";
      ctx.lineWidth = 8;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      // heraldic shield with a skull
      ctx.fillStyle = "#1a1414";
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.25);
      ctx.lineTo(w * 0.8, h * 0.25);
      ctx.lineTo(w * 0.8, h * 0.5);
      ctx.quadraticCurveTo(w * 0.5, h * 0.72, w * 0.2, h * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#d8ccb0";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.4, 30, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#1a1414";
      ctx.beginPath();
      ctx.arc(w * 0.44, h * 0.39, 8, 0, TAU);
      ctx.arc(w * 0.56, h * 0.39, 8, 0, TAU);
      ctx.fill();
      ctx.fillRect(w * 0.45, h * 0.44, w * 0.1, 10);
      // crown
      ctx.fillStyle = "#d8b040";
      ctx.beginPath();
      ctx.moveTo(w * 0.36, h * 0.2);
      ctx.lineTo(w * 0.36, h * 0.12);
      ctx.lineTo(w * 0.43, h * 0.17);
      ctx.lineTo(w * 0.5, h * 0.1);
      ctx.lineTo(w * 0.57, h * 0.17);
      ctx.lineTo(w * 0.64, h * 0.12);
      ctx.lineTo(w * 0.64, h * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e0d0a0";
      ctx.font = "bold 30px " + SERIF;
      ctx.textAlign = "center";
      ctx.fillText("KNEEL", w / 2, h * 0.84);
      // tatters
      ctx.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        const x = r() * w;
        ctx.moveTo(x, h);
        ctx.lineTo(x + 6 + r() * 12, h - 10 - r() * 60);
        ctx.lineTo(x + 14 + r() * 10, h);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      P.blotches(ctx, w, h, r, 30, 0.35);
    },
  ];

  // ------------------------------------------------------------------
  // Materials
  // ------------------------------------------------------------------
