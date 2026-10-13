// play-inline-273 03 — ctx
// Lines 134-429 of readable/play-inline-273.pretty.js (statement-aligned).
  Object.assign(P.CUSTOM, {
    tile_green: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("tg");
        const n = 8,
          s = w / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const c = 80 + r() * 30;
            ctx.fillStyle =
              "rgb(" +
              ((c * 0.55) | 0) +
              "," +
              ((c * 1.15) | 0) +
              "," +
              ((c * 0.85) | 0) +
              ")";
            ctx.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
            if (r() < 0.06) {
              ctx.fillStyle = "rgba(20,20,10,0.6)";
              ctx.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
            }
          }
        ctx.fillStyle = "rgba(230,225,200,0.5)";
        for (let i = 0; i <= n; i++) {
          ctx.fillRect(i * s - 1, 0, 2, h);
          ctx.fillRect(0, i * s - 1, w, 2);
        }
        bl(ctx, w, h, r, 30, 0.3);
        sp(ctx, w, h, r, 700);
      },
    ],
    tile_bath: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("tbath");
        const n = 12,
          s = w / n;
        ctx.fillStyle = "#6a6a60";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const c = 200 + r() * 30;
            const blue = (i + j) % 7 === 0;
            ctx.fillStyle = blue
              ? "rgb(70,110,120)"
              : "rgb(" + (c | 0) + "," + (c | 0) + "," + ((c * 0.94) | 0) + ")";
            ctx.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
          }
        for (let i = 0; i < 8; i++) {
          const x = r() * w;
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(90,70,30,0.3)");
          g.addColorStop(1, "rgba(90,70,30,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, 4 + r() * 16, h);
        }
        bl(ctx, w, h, r, 30, 0.3);
        sp(ctx, w, h, r, 900);
      },
    ],
    checker: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("chk");
        const n = 4,
          s = w / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const dark = (i + j) % 2 === 0;
            const g = ctx.createLinearGradient(
              i * s,
              j * s,
              i * s + s,
              j * s + s,
            );
            if (dark) {
              g.addColorStop(0, "#1a1a1c");
              g.addColorStop(1, "#2c2a2a");
            } else {
              g.addColorStop(0, "#e4e0d6");
              g.addColorStop(1, "#cfcac0");
            }
            ctx.fillStyle = g;
            ctx.fillRect(i * s, j * s, s, s);
            ctx.strokeStyle = dark
              ? "rgba(200,200,200,0.12)"
              : "rgba(80,70,60,0.25)";
            ctx.lineWidth = 1;
            for (let k = 0; k < 3; k++) {
              ctx.beginPath();
              let x = i * s + r() * s,
                y = j * s + r() * s;
              ctx.moveTo(x, y);
              for (let q = 0; q < 5; q++) {
                x += (r() - 0.5) * 30;
                y += (r() - 0.5) * 30;
                ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          }
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        for (let i = 0; i <= n; i++) {
          ctx.fillRect(i * s - 1, 0, 2, h);
          ctx.fillRect(0, i * s - 1, w, 2);
        }
        bl(ctx, w, h, r, 26, 0.3);
        sp(ctx, w, h, r, 900, 0.3, 0.1);
      },
    ],
    mosaic: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("mos");
        ctx.fillStyle = "#b8ab90";
        ctx.fillRect(0, 0, w, h);
        const pal = [
          "#c8b898",
          "#a89878",
          "#d8ccb0",
          "#7a8a78",
          "#4a6a70",
          "#b89a60",
        ];
        for (let y = 0; y < h; y += 8)
          for (let x = 0; x < w; x += 8) {
            const cx = x - w / 2,
              cy = y - h / 2,
              d = Math.hypot(cx, cy),
              a = Math.atan2(cy, cx);
            let c =
              pal[
                (Math.floor(d / 34) + (Math.floor(a / (PI / 8) + 16) % 2)) %
                  pal.length
              ];
            if (d < 60) c = "#3a5a68";
            if (Math.abs(d - 200) < 10) c = "#2a3a40";
            ctx.fillStyle = c;
            ctx.fillRect(x + 0.5, y + 0.5, 7, 7);
          }
        bl(ctx, w, h, r, 40, 0.3);
        sp(ctx, w, h, r, 1600);
      },
    ],
    canvas_black: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("cvb");
        ctx.fillStyle = "#18181a";
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 2) {
          ctx.fillStyle = "rgba(255,255,255," + r() * 0.04 + ")";
          ctx.fillRect(0, y, w, 1);
        }
        for (let i = 0; i < 12; i++) {
          const x = r() * w;
          ctx.fillStyle = "rgba(120,100,70,0.12)";
          ctx.fillRect(x, 0, 3 + r() * 10, h);
        }
        bl(ctx, w, h, r, 20, 0.25);
      },
    ],
    canvas_tan: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("cvt");
        ctx.fillStyle = "#8a7a58";
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 2) {
          ctx.fillStyle = "rgba(40,30,10," + r() * 0.08 + ")";
          ctx.fillRect(0, y, w, 1);
        }
        bl(ctx, w, h, r, 30, 0.3);
        sp(ctx, w, h, r, 500);
      },
    ],
    crop_dead: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("crop");
        ctx.fillStyle = "#3a2e1c";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 260; i++) {
          ctx.strokeStyle =
            "rgba(" +
            ((120 + r() * 60) | 0) +
            "," +
            ((95 + r() * 40) | 0) +
            "," +
            ((50 + r() * 20) | 0) +
            ",0.8)";
          ctx.lineWidth = 1 + r() * 2;
          const x = r() * w,
            y = r() * h;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (r() - 0.5) * 20, y - 10 - r() * 30);
          ctx.stroke();
        }
      },
    ],
    hay: [
      128,
      128,
      (ctx, w, h) => {
        const r = P.rng("hay");
        ctx.fillStyle = "#8a7438";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 300; i++) {
          ctx.strokeStyle =
            "rgba(" +
            ((180 + r() * 60) | 0) +
            "," +
            ((150 + r() * 50) | 0) +
            ",80,0.7)";
          ctx.beginPath();
          const x = r() * w,
            y = r() * h;
          ctx.moveTo(x, y);
          ctx.lineTo(x + (r() - 0.5) * 30, y + (r() - 0.5) * 8);
          ctx.stroke();
        }
      },
    ],
    clothes: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("clo");
        const pal = [
          "#6a2a2a",
          "#2a3a5a",
          "#8a7a5a",
          "#3a4a3a",
          "#aa8a6a",
          "#5a3a5a",
          "#c8b8a0",
          "#2a2a2a",
          "#8a4a2a",
        ];
        for (let x = 0; x < w;) {
          const cw = 6 + r() * 16;
          ctx.fillStyle = pal[Math.floor(r() * pal.length)];
          ctx.fillRect(x, 0, cw, h);
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(x, 0, 1.5, h);
          x += cw;
        }
        for (let y = 0; y < h; y += 3) {
          ctx.fillStyle = "rgba(255,255,255," + r() * 0.05 + ")";
          ctx.fillRect(0, y, w, 1);
        }
        bl(ctx, w, h, r, 30, 0.4);
      },
    ],
    shoebox: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("shoe");
        const pal = [
          "#d8c8a8",
          "#8a6a4a",
          "#e0dcd0",
          "#b04a3a",
          "#2a2a2a",
          "#c8a060",
        ];
        for (let y = 0; y < h; y += 32)
          for (let x = 0; x < w; x += 42) {
            if (r() < 0.14) {
              ctx.fillStyle = "#1a1612";
              ctx.fillRect(x, y, 42, 32);
              continue;
            }
            ctx.fillStyle = pal[Math.floor(r() * pal.length)];
            ctx.fillRect(x + 1, y + 1, 40, 30);
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.fillRect(x + 12, y + 12, 18, 7);
          }
        bl(ctx, w, h, r, 20, 0.35);
      },
    ],
    backdrop_park: [2048, 512, (ctx, w, h) => X.paintSkyline(ctx, w, h)],
  });

  /** Painted view from a Central Park West penthouse: sickly dusk sky, the dead park, the ruined skyline. */
