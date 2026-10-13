// play-inline-148 05 — ctx
// Lines 852-1476 of readable/play-inline-148.pretty.js (statement-aligned).
  const CUSTOM = {
    oak_panel: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("oak");
        ctx.fillStyle = "#5a3c22";
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 2) {
          ctx.fillStyle =
            "rgba(" +
            ((90 + r() * 40) | 0) +
            "," +
            ((58 + r() * 24) | 0) +
            ",30," +
            (0.12 + r() * 0.2) +
            ")";
          ctx.fillRect(0, y, w, 1 + r() * 2);
        }
        // raised panels
        for (let i = 0; i < 2; i++)
          for (let j = 0; j < 2; j++) {
            const x0 = (i * w) / 2 + 18,
              y0 = (j * h) / 2 + 18,
              pw = w / 2 - 36,
              ph = h / 2 - 36;
            ctx.strokeStyle = "rgba(20,10,4,0.7)";
            ctx.lineWidth = 5;
            ctx.strokeRect(x0, y0, pw, ph);
            ctx.strokeStyle = "rgba(200,150,90,0.25)";
            ctx.lineWidth = 2;
            ctx.strokeRect(x0 + 4, y0 + 4, pw - 8, ph - 8);
          }
        blotches(ctx, w, h, r, 20, 0.2);
      },
    ],
    parquet: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("parq"),
          n = 8,
          s = w / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const hor = (i + j) % 2 === 0;
            for (let k = 0; k < 4; k++) {
              const c = 110 + r() * 40;
              ctx.fillStyle =
                "rgb(" +
                (c | 0) +
                "," +
                ((c * 0.72) | 0) +
                "," +
                ((c * 0.45) | 0) +
                ")";
              if (hor) ctx.fillRect(i * s, j * s + (k * s) / 4, s, s / 4 - 1);
              else ctx.fillRect(i * s + (k * s) / 4, j * s, s / 4 - 1, s);
            }
          }
        blotches(ctx, w, h, r, 40, 0.3);
        speckle(ctx, w, h, r, 1500);
      },
    ],
    carpet_red: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("carp");
        ctx.fillStyle = "#6e1e1a";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(210,160,70,0.55)";
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            const cx = ((i + 0.5) * w) / 4,
              cy = ((j + 0.5) * h) / 4;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 34, 20, 0, 0, TAU);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - 50, cy);
            ctx.lineTo(cx, cy - 40);
            ctx.lineTo(cx + 50, cy);
            ctx.lineTo(cx, cy + 40);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = "rgba(30,50,60,0.5)";
            ctx.beginPath();
            ctx.arc(cx, cy, 8, 0, TAU);
            ctx.fill();
          }
        blotches(ctx, w, h, r, 50, 0.3);
        speckle(ctx, w, h, r, 2500, 0.35, 0.08);
      },
    ],
    damask: [
      512,
      512,
      (ctx, w, h) => {
        // round 2: finer tone-on-tone damask (the old 2×2 cartoon ovals with dark dots read as polka dots at 1.1 m):
        // 4 × 4 half-drop repeats of a symmetric fleuron — central flame, two acanthus scrolls, a bud and a stem —
        // in a slightly lighter/sheen tone with a thin darker outline, over a faint moiré stripe, then age.
        const r = P.rng("dam");
        ctx.fillStyle = "#6a5a3c";
        ctx.fillRect(0, 0, w, h);
        for (let x = 0; x < w; x += 4) {
          ctx.fillStyle =
            (x / 4) % 2 ? "rgba(255,240,200,0.025)" : "rgba(0,0,0,0.025)";
          ctx.fillRect(x, 0, 2, h);
        }
        const N = 4,
          cw = w / N,
          ch = h / N;
        const fleur = (cx, cy, s) => {
          ctx.beginPath();
          ctx.moveTo(cx, cy - 0.46 * s);
          ctx.bezierCurveTo(
            cx + 0.16 * s,
            cy - 0.3 * s,
            cx + 0.2 * s,
            cy - 0.08 * s,
            cx + 0.06 * s,
            cy + 0.08 * s,
          );
          ctx.bezierCurveTo(
            cx + 0.3 * s,
            cy - 0.06 * s,
            cx + 0.42 * s,
            cy + 0.1 * s,
            cx + 0.34 * s,
            cy + 0.24 * s,
          );
          ctx.bezierCurveTo(
            cx + 0.28 * s,
            cy + 0.14 * s,
            cx + 0.16 * s,
            cy + 0.14 * s,
            cx + 0.1 * s,
            cy + 0.26 * s,
          );
          ctx.bezierCurveTo(
            cx + 0.06 * s,
            cy + 0.34 * s,
            cx + 0.03 * s,
            cy + 0.42 * s,
            cx,
            cy + 0.46 * s,
          );
          ctx.bezierCurveTo(
            cx - 0.03 * s,
            cy + 0.42 * s,
            cx - 0.06 * s,
            cy + 0.34 * s,
            cx - 0.1 * s,
            cy + 0.26 * s,
          );
          ctx.bezierCurveTo(
            cx - 0.16 * s,
            cy + 0.14 * s,
            cx - 0.28 * s,
            cy + 0.14 * s,
            cx - 0.34 * s,
            cy + 0.24 * s,
          );
          ctx.bezierCurveTo(
            cx - 0.42 * s,
            cy + 0.1 * s,
            cx - 0.3 * s,
            cy - 0.06 * s,
            cx - 0.06 * s,
            cy + 0.08 * s,
          );
          ctx.bezierCurveTo(
            cx - 0.2 * s,
            cy - 0.08 * s,
            cx - 0.16 * s,
            cy - 0.3 * s,
            cx,
            cy - 0.46 * s,
          );
          ctx.closePath();
        };
        for (let i = 0; i < N; i++)
          for (let j = 0; j < N + 1; j++) {
            const cx = (i + 0.5) * cw,
              cy = (j + (i % 2 ? 0 : 0.5)) * ch;
            fleur(cx, cy, ch * 0.92);
            ctx.fillStyle = "rgba(196,168,112,0.30)";
            ctx.fill();
            ctx.strokeStyle = "rgba(48,36,18,0.35)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // vein + small diamond bud between repeats
            ctx.strokeStyle = "rgba(60,46,24,0.3)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 0.3 * ch);
            ctx.lineTo(cx, cy + 0.3 * ch);
            ctx.stroke();
            const bx = cx + cw / 2,
              by = cy + ch / 2;
            ctx.fillStyle = "rgba(190,160,100,0.22)";
            ctx.beginPath();
            ctx.moveTo(bx, by - 9);
            ctx.lineTo(bx + 6, by);
            ctx.lineTo(bx, by + 9);
            ctx.lineTo(bx - 6, by);
            ctx.closePath();
            ctx.fill();
          }
        // sun fade toward the top, water stains running down, peeling seams
        const fade = ctx.createLinearGradient(0, 0, 0, h);
        fade.addColorStop(0, "rgba(230,210,170,0.10)");
        fade.addColorStop(1, "rgba(0,0,0,0.06)");
        ctx.fillStyle = fade;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 7; i++) {
          const x = r() * w;
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(40,30,15,0.32)");
          g.addColorStop(1, "rgba(40,30,15,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, 8 + r() * 26, h * (0.3 + r() * 0.6));
        }
        for (let i = 0; i < 2; i++) {
          const x = ((i + 0.5) * w) / 2 + (r() - 0.5) * 20;
          ctx.fillStyle = "rgba(20,14,6,0.35)";
          ctx.fillRect(x, 0, 1.5, h);
          ctx.fillStyle = "rgba(210,196,160,0.35)";
          ctx.fillRect(x + 1.5, h * r() * 0.3, 5, 30 + r() * 60);
        }
        speckle(ctx, w, h, r, 1600);
      },
    ],
    slate: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("slate");
        ctx.fillStyle = "#2e3034";
        ctx.fillRect(0, 0, w, h);
        const rowH = 16,
          sw = 22;
        for (let y = 0; y < h; y += rowH)
          for (let x = -sw; x < w + sw; x += sw) {
            const ox = (((y / rowH) % 2) * sw) / 2,
              c = 60 + r() * 30;
            ctx.fillStyle =
              "rgb(" +
              ((c * 0.95) | 0) +
              "," +
              (c | 0) +
              "," +
              ((c * 1.08) | 0) +
              ")";
            ctx.beginPath();
            ctx.moveTo(x + ox, y);
            ctx.lineTo(x + ox + sw - 2, y);
            ctx.lineTo(x + ox + sw - 2, y + rowH - 5);
            ctx.arc(x + ox + sw / 2 - 1, y + rowH - 5, sw / 2 - 1, 0, PI);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(x + ox, y + rowH - 2, sw, 2);
          }
        blotches(ctx, w, h, r, 20, 0.25);
      },
    ],
    tiffany_blue: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("tb");
        ctx.fillStyle = "#7fcfc4";
        ctx.fillRect(0, 0, w, h);
        blotches(ctx, w, h, r, 30, 0.3);
        speckle(ctx, w, h, r, 900, 0.4, 0.1);
      },
    ],
    plaster_fine: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("plf");
        ctx.fillStyle = "#d8d2c4";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 90; i++) {
          const x = r() * w,
            y = r() * h,
            rr = 40 + r() * 120;
          const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
          const d = r() < 0.55;
          g.addColorStop(
            0,
            d
              ? "rgba(90,80,60," + (0.02 + r() * 0.04) + ")"
              : "rgba(255,252,240," + (0.02 + r() * 0.04) + ")",
          );
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
        }
        // water runs
        for (let i = 0; i < 6; i++) {
          const x = r() * w,
            ww = 4 + r() * 18;
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(70,56,30," + (0.03 + r() * 0.06) + ")");
          g.addColorStop(r() * 0.6 + 0.3, "rgba(70,56,30,0)");
          g.addColorStop(1, "rgba(70,56,30,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, ww, h);
        }
        // hairline cracks
        ctx.strokeStyle = "rgba(50,44,34,0.35)";
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 7; i++) {
          let x = r() * w,
            y = r() * h;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let k = 0; k < 10; k++) {
            x += (r() - 0.5) * 40;
            y += (r() - 0.3) * 30;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        speckle(ctx, w, h, r, 1800, 0.12, 0.08);
      },
    ],
    stripes: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("stripes");
        ctx.fillStyle = "#d8ccb4";
        ctx.fillRect(0, 0, w, h);
        for (let x = 0; x < w; x += 32) {
          ctx.fillStyle = "rgba(150,120,90,0.35)";
          ctx.fillRect(x, 0, 12, h);
          ctx.fillStyle = "rgba(120,90,60,0.25)";
          ctx.fillRect(x + 14, 0, 2, h);
        }
        for (let y = 16; y < h; y += 42)
          for (let x = 22; x < w; x += 32) {
            ctx.fillStyle = "rgba(140,70,60,0.45)";
            ctx.beginPath();
            ctx.arc(x + ((y / 42) % 2) * 0, y, 4, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "rgba(80,110,60,0.45)";
            ctx.beginPath();
            ctx.ellipse(x - 4, y + 5, 4, 2, 0.6, 0, TAU);
            ctx.fill();
          }
        for (let i = 0; i < 5; i++) {
          const x = r() * w;
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(60,45,25,0.3)");
          g.addColorStop(1, "rgba(60,45,25,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, 8 + r() * 24, h * (0.3 + r() * 0.6));
        }
        speckle(ctx, w, h, r, 600, 0.2, 0.08);
      },
    ],
    zebra: [
      256,
      256,
      (ctx, w, h) => {
        ctx.fillStyle = "#e4dccb";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#1c1a18";
        for (let x = -20; x < w + 20; x += 26) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          for (let y = 0; y <= h; y += 16)
            ctx.lineTo(x + Math.sin(y / 30 + x) * 6, y);
          for (let y = h; y >= 0; y -= 16)
            ctx.lineTo(x + 11 + Math.sin(y / 30 + x) * 6, y);
          ctx.fill();
        }
      },
    ],
    spots: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("spots");
        ctx.fillStyle = "#c8985a";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 90; i++) {
          const x = r() * w,
            y = r() * h,
            s = 5 + r() * 7;
          ctx.strokeStyle = "#2a1c10";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, s, 0, TAU * 0.8);
          ctx.stroke();
        }
      },
    ],
    foliage: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("fol");
        ctx.fillStyle = "#26361c";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 500; i++) {
          ctx.fillStyle =
            "rgb(" +
            ((40 + r() * 50) | 0) +
            "," +
            ((60 + r() * 60) | 0) +
            "," +
            ((20 + r() * 30) | 0) +
            ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            3 + r() * 8,
            2 + r() * 4,
            r() * 3,
            0,
            TAU,
          );
          ctx.fill();
        }
      },
    ],
    stained_glass: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("sg");
        ctx.fillStyle = "#1a1208";
        ctx.fillRect(0, 0, w, h);
        const pal = [
          "#e8b858",
          "#d89a38",
          "#f0d890",
          "#8ab870",
          "#6a9ac8",
          "#c8a060",
          "#f4e4b0",
          "#b8d8a0",
        ];
        const n = 12,
          s = w / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const dx = i - n / 2 + 0.5,
              dy = j - n / 2 + 0.5,
              d = Math.hypot(dx, dy);
            const ring = Math.floor(d * 1.2);
            let c =
              pal[
                (ring + (Math.abs(dx) === Math.abs(dy) ? 2 : 0)) % pal.length
              ];
            if (r() < 0.06) c = "#2a2014"; // missing / painted-over panes
            ctx.fillStyle = c;
            ctx.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
            ctx.fillStyle = "rgba(255,255,255," + r() * 0.15 + ")";
            ctx.fillRect(i * s + 4, j * s + 4, s * 0.4, s * 0.3);
          }
        // central medallion + leading
        ctx.strokeStyle = "#1a1208";
        ctx.lineWidth = 8;
        for (const rr of [60, 110, 170, 230]) {
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, rr, 0, TAU);
          ctx.stroke();
        }
        ctx.fillStyle = "#f8e8b0";
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 52, 0, TAU);
        ctx.fill();
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * TAU;
          ctx.beginPath();
          ctx.moveTo(w / 2 + Math.cos(a) * 60, h / 2 + Math.sin(a) * 60);
          ctx.lineTo(w / 2 + Math.cos(a) * 240, h / 2 + Math.sin(a) * 240);
          ctx.stroke();
        }
        ctx.lineWidth = 3;
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
        blotches(ctx, w, h, r, 40, 0.35);
      },
    ],
    stars: [
      1024,
      512,
      (ctx, w, h) => {
        const r = P.rng("stars");
        ctx.fillStyle = "#01030a";
        ctx.fillRect(0, 0, w, h);
        // milky way band
        for (let i = 0; i < 900; i++) {
          const x = r() * w,
            y =
              h * 0.45 +
              Math.sin((x / w) * TAU) * h * 0.18 +
              (r() - 0.5) * h * 0.16;
          const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
          g.addColorStop(0, "rgba(120,130,170,0.05)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - 14, y - 14, 28, 28);
        }
        for (let i = 0; i < 2600; i++) {
          const x = r() * w,
            y = r() * h,
            b = r();
          ctx.fillStyle =
            "rgba(" +
            ((200 + r() * 55) | 0) +
            "," +
            ((210 + r() * 45) | 0) +
            ",255," +
            (0.3 + b * 0.7) +
            ")";
          const s = b > 0.97 ? 2.6 : b > 0.85 ? 1.6 : 1;
          ctx.fillRect(x, y, s, s);
        }
        // constellation stick figures (projector overlay)
        ctx.strokeStyle = "rgba(120,200,255,0.35)";
        ctx.lineWidth = 1.2;
        for (let c = 0; c < 9; c++) {
          let x = r() * w,
            y = h * 0.15 + r() * h * 0.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let k = 0; k < 5; k++) {
            x += (r() - 0.5) * 90;
            y += (r() - 0.5) * 60;
            ctx.lineTo(x, y);
            ctx.fillStyle = "#fff";
            ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
          }
          ctx.stroke();
        }
      },
    ],
    // blue whale hide: u = around the body (0.25 top, 0.75 belly), v = tail(0) → snout(1)
    whale_skin: [
      1024,
      512,
      (ctx, w, h) => {
        const r = P.rng("whale");
        for (let x = 0; x < w; x++) {
          const u = x / w,
            top = Math.cos((u - 0.25) * TAU) * 0.5 + 0.5; // 1 = spine, 0 = belly
          const c0 = [58, 72, 92],
            c1 = [150, 162, 176];
          const k = Math.pow(top, 0.7);
          ctx.fillStyle =
            "rgb(" +
            ((c1[0] + (c0[0] - c1[0]) * k) | 0) +
            "," +
            ((c1[1] + (c0[1] - c1[1]) * k) | 0) +
            "," +
            ((c1[2] + (c0[2] - c1[2]) * k) | 0) +
            ")";
          ctx.fillRect(x, 0, 1, h);
        }
        // mottling (the model's painted spots) + 1970s repaint streaks
        for (let i = 0; i < 1400; i++) {
          const x = r() * w,
            y = r() * h,
            s = 1 + r() * 4;
          ctx.fillStyle =
            "rgba(" +
            ((170 + r() * 50) | 0) +
            "," +
            ((185 + r() * 40) | 0) +
            ",205," +
            (0.08 + r() * 0.18) +
            ")";
          ctx.beginPath();
          ctx.ellipse(x, y, s * 1.6, s, 0, 0, TAU);
          ctx.fill();
        }
        // throat pleats on the belly, front half (canvas y 0 = snout)
        ctx.strokeStyle = "rgba(40,46,56,0.55)";
        ctx.lineWidth = 2;
        for (let x = w * 0.6; x < w * 0.9; x += 9) {
          ctx.beginPath();
          ctx.moveTo(x, h * 0.02);
          ctx.lineTo(x + (r() - 0.5) * 4, h * 0.42 + r() * 20);
          ctx.stroke();
        }
        // mouth line
        ctx.strokeStyle = "rgba(18,20,26,0.8)";
        ctx.lineWidth = 4;
        for (const x of [w * 0.02, w * 0.48]) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h * 0.16);
          ctx.stroke();
        }
        // grime, flaking paint, a raider's tag
        blotches(ctx, w, h, r, 30, 0.25);
        ctx.fillStyle = "rgba(160,30,20,0.7)";
        ctx.font = "bold 40px sans-serif";
        ctx.save();
        ctx.translate(w * 0.12, h * 0.5);
        ctx.rotate(HP);
        ctx.fillText("MOBY WAS HERE", 0, 0);
        ctx.restore();
      },
    ],
  };
