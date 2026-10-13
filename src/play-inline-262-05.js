// play-inline-262 05 — ctx
// Lines 971-1287 of readable/play-inline-262.pretty.js (statement-aligned).
  C.brick_flemish = [
    512,
    512,
    (ctx, w, h) => {
      // Flemish bond: header/stretcher alternating, glazed dark headers
      const r = P.rng("flem");
      ctx.fillStyle = "#b8ab98";
      ctx.fillRect(0, 0, w, h);
      const bh = 16,
        sl = 48,
        hl = 22;
      for (let j = 0; j * bh < h; j++) {
        let x = ((j % 2) * -(sl + hl)) / 2;
        let st = true;
        while (x < w) {
          const L = st ? sl : hl;
          const dark = !st && r() < 0.8;
          const c = dark ? 60 + r() * 25 : 120 + r() * 40;
          ctx.fillStyle =
            "rgb(" +
            ((c * 1.12) | 0) +
            "," +
            ((c * 0.52) | 0) +
            "," +
            ((c * 0.38) | 0) +
            ")";
          ctx.fillRect(x + 1, j * bh + 1, L - 2, bh - 3);
          x += L;
          st = !st;
        }
      }
      B(ctx, w, h, r, 40, 0.2);
      SP(ctx, w, h, r, 2500, 0.25, 0.08);
    },
  ];
  C.clapboard = [
    256,
    256,
    (ctx, w, h) => {
      // pale yellow painted clapboard, peeling
      const r = P.rng("clap");
      const bh = 24;
      for (let j = 0; j * bh < h; j++) {
        const g = ctx.createLinearGradient(0, j * bh, 0, (j + 1) * bh);
        g.addColorStop(0, "#e8d898");
        g.addColorStop(0.8, "#d8c480");
        g.addColorStop(1, "#8a7a4a");
        ctx.fillStyle = g;
        ctx.fillRect(0, j * bh, w, bh);
      }
      for (let i = 0; i < 26; i++) {
        const x = r() * w,
          y = r() * h;
        ctx.fillStyle = "rgba(120,100,70," + (0.3 + r() * 0.4) + ")";
        ctx.fillRect(x, y, 6 + r() * 30, 2 + r() * 8);
      }
      B(ctx, w, h, r, 14, 0.25);
      SP(ctx, w, h, r, 900, 0.2, 0.1);
    },
  ];
  C.silk_red = [
    256,
    256,
    (ctx, w, h) =>
      damaskDraw(ctx, w, h, "#6e1c18", "rgba(170,70,50,0.5)", "silkr"),
  ];
  C.silk_green = [
    256,
    256,
    (ctx, w, h) =>
      damaskDraw(ctx, w, h, "#2e4a34", "rgba(110,150,100,0.45)", "silkg"),
  ];
  C.silk_gold = [
    256,
    256,
    (ctx, w, h) =>
      damaskDraw(ctx, w, h, "#7a6030", "rgba(210,180,110,0.45)", "silky"),
  ];
  function damaskDraw(ctx, w, h, bg, fg, seed) {
    const r = P.rng(seed);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fg;
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        const cx = (i * w) / 2 + ((j % 2) * w) / 4 + w / 8,
          cy = (j * h) / 2 + h / 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 46);
        ctx.bezierCurveTo(cx + 36, cy - 28, cx + 30, cy + 12, cx, cy + 46);
        ctx.bezierCurveTo(cx - 30, cy + 12, cx - 36, cy - 28, cx, cy - 46);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy - 52, 6, 0, TAU);
        ctx.fill();
      }
    for (let i = 0; i < 5; i++) {
      const x = r() * w;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(20,14,8,0.4)");
      g.addColorStop(1, "rgba(20,14,8,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, 6 + r() * 20, h * (0.3 + r() * 0.6));
    }
    SP(ctx, w, h, r, 700, 0.3, 0.06);
  }
  C.teak = [
    512,
    512,
    (ctx, w, h) => {
      // carved teak panels (lattice + medallions)
      const r = P.rng("teak");
      ctx.fillStyle = "#5a3a1c";
      ctx.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 2) {
        ctx.fillStyle =
          "rgba(" +
          ((110 + r() * 40) | 0) +
          "," +
          ((70 + r() * 20) | 0) +
          ",30," +
          (0.12 + r() * 0.15) +
          ")";
        ctx.fillRect(0, y, w, 1 + r() * 2);
      }
      ctx.strokeStyle = "rgba(25,12,4,0.7)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          const cx = ((i + 0.5) * w) / 4,
            cy = ((j + 0.5) * h) / 4;
          ctx.beginPath();
          ctx.arc(cx, cy, 34, 0, TAU);
          ctx.stroke();
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * TAU;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * 34, cy + Math.sin(a) * 34);
            ctx.stroke();
          }
          ctx.strokeRect(cx - 60, cy - 60, 120, 120);
        }
      ctx.strokeStyle = "rgba(210,150,80,0.22)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
          const cx = ((i + 0.5) * w) / 4 + 2,
            cy = ((j + 0.5) * h) / 4 + 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 34, 0, TAU);
          ctx.stroke();
        }
      B(ctx, w, h, r, 24, 0.2);
    },
  ];
  C.checker = [
    256,
    256,
    (ctx, w, h) => {
      // black & white marble checkerboard (diagonal)
      const r = P.rng("chk"),
        n = 4,
        s = w / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const blk = (i + j) % 2 === 0;
          ctx.fillStyle = blk ? "#1c1c1e" : "#e6e0d4";
          ctx.fillRect(i * s, j * s, s, s);
          ctx.strokeStyle = blk
            ? "rgba(200,200,200,0.12)"
            : "rgba(80,80,80,0.18)";
          ctx.lineWidth = 1;
          for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.moveTo(i * s + r() * s, j * s);
            ctx.bezierCurveTo(
              i * s + r() * s,
              j * s + s * 0.3,
              i * s + r() * s,
              j * s + s * 0.6,
              i * s + r() * s,
              j * s + s,
            );
            ctx.stroke();
          }
        }
      ctx.strokeStyle = "rgba(40,36,30,0.6)";
      ctx.lineWidth = 2;
      for (let i = 0; i <= n; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s, 0);
        ctx.lineTo(i * s, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * s);
        ctx.lineTo(w, i * s);
        ctx.stroke();
      }
      B(ctx, w, h, r, 20, 0.25);
    },
  ];
  C.zuber = [
    1024,
    256,
    (ctx, w, h) => {
      // scenic panoramic wallpaper: river, trees, distant hills, sepia-green
      const r = P.rng("zuber");
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#c8d0b8");
      g.addColorStop(0.55, "#e0dcc0");
      g.addColorStop(0.56, "#8a9a6a");
      g.addColorStop(1, "#5a6a44");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9aa888";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.55);
      for (let x = 0; x <= w; x += 32)
        ctx.lineTo(x, h * (0.42 + 0.08 * Math.sin(x / 90) + r() * 0.03));
      ctx.lineTo(w, h * 0.55);
      ctx.fill();
      ctx.fillStyle = "#8aa0a8";
      ctx.fillRect(0, h * 0.62, w, h * 0.08);
      for (let i = 0; i < 24; i++) {
        const x = r() * w;
        ctx.fillStyle = "#4a5a34";
        ctx.fillRect(x - 3, h * 0.5, 6, h * 0.3);
        for (let k = 0; k < 5; k++) {
          ctx.fillStyle = ["#3a5a2a", "#5a7a3a", "#4a6a30"][k % 3];
          ctx.beginPath();
          ctx.arc(
            x + (r() - 0.5) * 40,
            h * (0.3 + r() * 0.2),
            14 + r() * 16,
            0,
            TAU,
          );
          ctx.fill();
        }
      }
      for (let i = 0; i < 6; i++) {
        const x = r() * w;
        ctx.fillStyle = "#e8e0d0";
        ctx.fillRect(x, h * 0.5, 20, 12);
        ctx.fillStyle = "#8a4a3a";
        ctx.beginPath();
        ctx.moveTo(x - 3, h * 0.5);
        ctx.lineTo(x + 10, h * 0.44);
        ctx.lineTo(x + 23, h * 0.5);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(120,100,60,0.2)";
      ctx.fillRect(0, 0, w, h);
      B(ctx, w, h, r, 40, 0.25);
      SP(ctx, w, h, r, 1500, 0.2, 0.06);
    },
  ];
  C.travertine = [
    512,
    512,
    (ctx, w, h) => {
      const r = P.rng("trav");
      ctx.fillStyle = "#d8cbb0";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) {
        ctx.fillStyle =
          "rgba(" +
          ((150 + r() * 40) | 0) +
          "," +
          ((130 + r() * 30) | 0) +
          ",100," +
          (0.15 + r() * 0.25) +
          ")";
        ctx.fillRect(r() * w, r() * h, 10 + r() * 60, 1 + r() * 3);
      }
      ctx.strokeStyle = "rgba(80,70,50,0.45)";
      ctx.lineWidth = 2;
      for (let i = 0; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo((i * w) / 2, 0);
        ctx.lineTo((i * w) / 2, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, (i * h) / 2);
        ctx.lineTo(w, (i * h) / 2);
        ctx.stroke();
      }
      B(ctx, w, h, r, 30, 0.2);
    },
  ];
  C.drill_floor = [
    512,
    512,
    (ctx, w, h) => {
      // worn maple drill-hall boards with painted marching lines
      const r = P.rng("drill");
      for (let j = 0; j < 32; j++) {
        const c = 120 + r() * 40;
        ctx.fillStyle =
          "rgb(" +
          (c | 0) +
          "," +
          ((c * 0.78) | 0) +
          "," +
          ((c * 0.5) | 0) +
          ")";
        ctx.fillRect(0, j * 16, w, 15);
        ctx.fillStyle = "rgba(30,20,10,0.5)";
        ctx.fillRect(r() * w, j * 16, 2, 16);
      }
      ctx.fillStyle = "rgba(230,220,190,0.55)";
      ctx.fillRect(0, h * 0.5 - 3, w, 6);
      B(ctx, w, h, r, 40, 0.3);
      SP(ctx, w, h, r, 2000, 0.3, 0.05);
    },
  ];
