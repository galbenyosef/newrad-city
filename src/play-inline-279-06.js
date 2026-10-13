// play-inline-279 06 — ctx
// Lines 922-1704 of readable/play-inline-279.pretty.js (statement-aligned).
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
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("dam");
        ctx.fillStyle = "#6e5e3e";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(180,150,90,0.45)";
        for (let i = 0; i < 2; i++)
          for (let j = 0; j < 2; j++) {
            const cx = (i * w) / 2 + ((j % 2) * w) / 4 + w / 8,
              cy = (j * h) / 2 + h / 4;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 44);
            ctx.bezierCurveTo(cx + 34, cy - 30, cx + 30, cy + 10, cx, cy + 44);
            ctx.bezierCurveTo(cx - 30, cy + 10, cx - 34, cy - 30, cx, cy - 44);
            ctx.fill();
            ctx.fillStyle = "rgba(80,60,30,0.5)";
            ctx.beginPath();
            ctx.arc(cx, cy, 8, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "rgba(180,150,90,0.45)";
          }
        // peeling / water stains
        for (let i = 0; i < 6; i++) {
          const x = r() * w;
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(40,30,15,0.35)");
          g.addColorStop(1, "rgba(40,30,15,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, 6 + r() * 20, h * (0.4 + r() * 0.6));
        }
        speckle(ctx, w, h, r, 500);
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
    // ---- theater district surfaces ----
    glazed_brick: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("gbrick");
        ctx.fillStyle = "#5a5044";
        ctx.fillRect(0, 0, w, h);
        const bh = 16,
          bw = 48;
        for (let y = 0; y < h; y += bh)
          for (let x = -bw; x < w + bw; x += bw) {
            const ox = (((y / bh) % 2) * bw) / 2,
              c = 150 + r() * 40;
            ctx.fillStyle =
              "rgb(" +
              (c | 0) +
              "," +
              ((c * 0.93) | 0) +
              "," +
              ((c * 0.8) | 0) +
              ")";
            ctx.fillRect(x + ox + 1, y + 1, bw - 2, bh - 2);
            ctx.fillStyle = "rgba(255,255,240,0.12)";
            ctx.fillRect(x + ox + 2, y + 2, bw - 6, 3);
          }
        blotches(ctx, w, h, r, 30, 0.3);
        speckle(ctx, w, h, r, 800);
      },
    ],
    checker: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("check"),
          n = 8,
          s = w / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const dark = (i + j) % 2 === 0,
              c = dark ? 40 + r() * 20 : 190 + r() * 30;
            ctx.fillStyle =
              "rgb(" +
              (c | 0) +
              "," +
              ((c * 0.97) | 0) +
              "," +
              ((c * 0.9) | 0) +
              ")";
            ctx.fillRect(i * s, j * s, s, s);
            if (r() < 0.08) {
              ctx.strokeStyle = "rgba(20,16,10,0.6)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(i * s + r() * s, j * s);
              ctx.lineTo(i * s + r() * s, j * s + s);
              ctx.stroke();
            }
          }
        ctx.strokeStyle = "rgba(30,26,20,0.5)";
        ctx.lineWidth = 1.5;
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
        blotches(ctx, w, h, r, 40, 0.3);
        speckle(ctx, w, h, r, 1500);
      },
    ],
    hex_tile: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("hex");
        ctx.fillStyle = "#4a463e";
        ctx.fillRect(0, 0, w, h);
        const R = 10,
          dx = R * Math.sqrt(3),
          dy = R * 1.5;
        for (let row = -1; row < h / dy + 1; row++)
          for (let col = -1; col < w / dx + 1; col++) {
            const cx = col * dx + (row % 2 ? dx / 2 : 0),
              cy = row * dy;
            const c = r() < 0.06 ? 90 : 205 + r() * 30;
            ctx.fillStyle =
              "rgb(" +
              (c | 0) +
              "," +
              ((c * 0.97) | 0) +
              "," +
              ((c * 0.9) | 0) +
              ")";
            ctx.beginPath();
            for (let k = 0; k < 6; k++) {
              const a = PI / 6 + (k * PI) / 3;
              ctx.lineTo(
                cx + Math.cos(a) * (R - 1),
                cy + Math.sin(a) * (R - 1),
              );
            }
            ctx.closePath();
            ctx.fill();
          }
        blotches(ctx, w, h, r, 40, 0.3);
        speckle(ctx, w, h, r, 1000);
      },
    ],
    cream_tile: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("ctile"),
          s = 32;
        ctx.fillStyle = "#6a6250";
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += s / 2)
          for (let x = 0; x < w; x += s) {
            const c = 205 + r() * 25;
            ctx.fillStyle =
              "rgb(" +
              (c | 0) +
              "," +
              ((c * 0.96) | 0) +
              "," +
              ((c * 0.84) | 0) +
              ")";
            ctx.fillRect(x + 1, y + 1, s - 2, s / 2 - 2);
            ctx.fillStyle = "rgba(255,255,250,0.2)";
            ctx.fillRect(x + 2, y + 2, s - 6, 2);
            if (r() < 0.035) {
              ctx.fillStyle = "rgba(70,60,40,0.28)";
              ctx.fillRect(x + 1, y + 1, s - 2, s / 2 - 2);
            }
          }
        for (let i = 0; i < 8; i++) {
          const x = r() * w;
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(60,45,20,0.35)");
          g.addColorStop(1, "rgba(60,45,20,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, 4 + r() * 14, h * (0.3 + r() * 0.7));
        }
        speckle(ctx, w, h, r, 800);
      },
    ],
    plush: [
      128,
      128,
      (ctx, w, h) => {
        const r = P.rng("plush");
        ctx.fillStyle = "#c8c0b8";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 2500; i++) {
          const c = 150 + r() * 90;
          ctx.fillStyle =
            "rgba(" + (c | 0) + "," + (c | 0) + "," + (c | 0) + ",0.5)";
          ctx.fillRect(r() * w, r() * h, 1, 2);
        }
        ctx.fillStyle = "rgba(40,30,20,0.25)";
        for (let y = 0; y < h; y += 32) ctx.fillRect(0, y, w, 2);
        blotches(ctx, w, h, r, 10, 0.4);
      },
    ],
    curtain: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("curt");
        for (let x = 0; x < w; x++) {
          const f =
            0.55 +
            0.45 * Math.sin((x / w) * TAU * 6 + Math.sin(x * 0.05) * 0.6);
          const c = 90 + f * 150;
          ctx.fillStyle =
            "rgb(" +
            (c | 0) +
            "," +
            ((c * 0.92) | 0) +
            "," +
            ((c * 0.88) | 0) +
            ")";
          ctx.fillRect(x, 0, 1, h);
        }
        blotches(ctx, w, h, r, 30, 0.35);
        for (let i = 0; i < 14; i++) {
          ctx.fillStyle = "rgba(20,10,5,0.35)";
          ctx.fillRect(r() * w, h * (0.7 + r() * 0.3), 3 + r() * 10, h);
        }
        speckle(ctx, w, h, r, 500);
      },
    ],
    gilt: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("gilt");
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, "#e8cc80");
        g.addColorStop(0.5, "#b8903a");
        g.addColorStop(1, "#d8b460");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(90,60,20,0.5)";
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            const cx = ((i + 0.5) * w) / 4,
              cy = ((j + 0.5) * h) / 4;
            ctx.beginPath();
            ctx.arc(cx, cy, 18, 0, TAU);
            ctx.stroke();
            for (let k = 0; k < 6; k++) {
              const a = (k / 6) * TAU;
              ctx.beginPath();
              ctx.ellipse(
                cx + Math.cos(a) * 24,
                cy + Math.sin(a) * 24,
                8,
                4,
                a,
                0,
                TAU,
              );
              ctx.stroke();
            }
          }
        blotches(ctx, w, h, r, 40, 0.45);
        speckle(ctx, w, h, r, 1200, 0.5, 0.1);
      },
    ],
    bus_paint: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("bus");
        ctx.fillStyle = "#d8d0b0";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 70; i++) {
          const x = r() * w,
            y = r() * h,
            rr = 6 + r() * 34;
          const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
          g.addColorStop(0, "rgba(120,58,22," + (0.4 + r() * 0.5) + ")");
          g.addColorStop(0.7, "rgba(90,40,16,0.25)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
        }
        for (let i = 0; i < 20; i++) {
          const x = r() * w;
          ctx.fillStyle = "rgba(100,50,20,0.35)";
          ctx.fillRect(x, r() * h * 0.5, 2 + r() * 3, h * (0.2 + r() * 0.5));
        }
        speckle(ctx, w, h, r, 1500, 0.4, 0.1);
      },
    ],
    hazard: [
      128,
      128,
      (ctx, w, h) => {
        const r = P.rng("haz");
        ctx.fillStyle = "#e8b820";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#1a1a1a";
        for (let k = -2; k < 4; k++) {
          ctx.beginPath();
          ctx.moveTo(k * 64, 0);
          ctx.lineTo(k * 64 + 32, 0);
          ctx.lineTo(k * 64 + 32 + h, h);
          ctx.lineTo(k * 64 + h, h);
          ctx.closePath();
          ctx.fill();
        }
        blotches(ctx, w, h, r, 14, 0.4);
        speckle(ctx, w, h, r, 500, 0.4, 0.1);
      },
    ],
    formica: [
      128,
      128,
      (ctx, w, h) => {
        const r = P.rng("form");
        ctx.fillStyle = "#e0e4d8";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 60; i++) {
          ctx.strokeStyle = [
            "rgba(90,140,150,0.5)",
            "rgba(200,90,70,0.4)",
            "rgba(60,60,60,0.4)",
          ][i % 3];
          ctx.lineWidth = 1.5;
          const x = r() * w,
            y = r() * h;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (r() - 0.5) * 16, y + (r() - 0.5) * 16);
          ctx.stroke();
        }
        blotches(ctx, w, h, r, 10, 0.3);
      },
    ],
    enamel: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("enam");
        ctx.fillStyle = "#d8d8d8";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 40; i++) {
          const x = r() * w,
            y = r() * h,
            rr = 4 + r() * 18;
          ctx.fillStyle = "rgba(70,40,20," + (0.3 + r() * 0.5) + ")";
          ctx.beginPath();
          ctx.ellipse(x, y, rr, rr * (0.5 + r()), r() * 3, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "rgba(40,40,40,0.5)";
          ctx.beginPath();
          ctx.arc(x, y, rr * 0.4, 0, TAU);
          ctx.fill();
        }
        speckle(ctx, w, h, r, 900);
      },
    ],
  };
