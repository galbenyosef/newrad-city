// play-inline-11 06 — ctx
// Lines 1547-1890 of readable/play-inline-11.pretty.js (statement-aligned).
  def("metal_panel", {
    roughVar: 0.5,
    meters: 2,
    normal: 3,
    rough: 0.5,
    metal: 0.7,
    desc: "riveted steel plates (1 m panels)",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#5d6266"],
          [0.5, "#767b7e"],
          [1, "#8c9092"],
        ],
        { scale: 4, seed: 191, grain: 8, dscale: 64 },
      );
      heightFrom(hc, w, h, (i) => 0.6 + (n2[i] - 0.5) * 0.05);
      const n = 2,
        s = w / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const x = i * s,
            y = j * s;
          ctx.fillStyle =
            r() < 0.5 ? X.css("#000", r() * 0.12) : X.css("#fff", r() * 0.06);
          ctx.fillRect(x, y, s, s);
          // brushed direction per plate
          ctx.strokeStyle = "rgba(255,255,255,0.03)";
          ctx.lineWidth = 1;
          for (let q = 0; q < 60; q++) {
            const yy = y + r() * s;
            ctx.beginPath();
            ctx.moveTo(x, yy);
            ctx.lineTo(x + s, yy + (r() - 0.5) * 3);
            ctx.stroke();
          }
          // seam
          ctx.fillStyle = "rgba(15,15,15,0.9)";
          ctx.fillRect(x, y, s, 3);
          ctx.fillRect(x, y, 3, s);
          ctx.fillStyle = "rgba(200,205,205,0.25)";
          ctx.fillRect(x + 3, y + 3, s - 3, 1.5);
          ctx.fillRect(x + 3, y + 3, 1.5, s - 3);
          hc.fillStyle = "#202020";
          hc.fillRect(x - 1, y - 1, s + 2, 5);
          hc.fillRect(x - 1, y - 1, 5, s + 2);
          // rivets
          const nr = 8;
          for (let k = 0; k < nr; k++) {
            for (const [rx, ry] of [
              [x + 12, y + 12 + (k * (s - 24)) / (nr - 1)],
              [x + 12 + (k * (s - 24)) / (nr - 1), y + 12],
            ]) {
              const g = ctx.createRadialGradient(
                rx - 1.5,
                ry - 1.5,
                0.5,
                rx,
                ry,
                5,
              );
              g.addColorStop(0, "#c8cccc");
              g.addColorStop(0.6, "#6a6e70");
              g.addColorStop(1, "rgba(20,20,20,0.9)");
              ctx.fillStyle = g;
              ctx.beginPath();
              ctx.arc(rx, ry, 4.5, 0, TAU);
              ctx.fill();
              hc.fillStyle = "#f0f0f0";
              hc.beginPath();
              hc.arc(rx, ry, 4, 0, TAU);
              hc.fill();
              if (r() < 0.35)
                X.streaks(ctx, w, h, r, {
                  count: 1,
                  color: "#6a3010",
                  alpha: 0.35,
                  minLen: 10,
                  maxLen: 60,
                  maxW: 5,
                });
            }
          }
        }
      X.blotches(ctx, w, h, r, {
        count: 7,
        color: "#5a2c10",
        alpha: 0.28,
        rmin: 8,
        rmax: 40,
      });
      X.blotches(ctx, w, h, r, { count: 8, color: "#161616", alpha: 0.2 });
      macroGrime(ctx, w, h, 0.25, 193);
    },
  });
  def("metal_scratched", {
    roughVar: 0.5,
    meters: 1,
    normal: 0,
    rough: 0.4,
    metal: 0.9,
    desc: "brushed/scratched bare steel",
    gen(ctx, w, h, r) {
      const n = X.fbm(w, h, { scale: 64, sy: 2, octaves: 3, seed: 201 });
      X.fillPixels(ctx, w, h, (i) => {
        const v = 150 + n[i] * 40 + (r() - 0.5) * 20;
        return [v, v + 2, v + 4];
      });
      ctx.lineCap = "round";
      for (let k = 0; k < 400; k++) {
        const x = r() * w,
          y = r() * h,
          a = r() * TAU,
          l = 3 + r() * 30;
        ctx.strokeStyle =
          r() < 0.5 ? "rgba(240,240,240,0.25)" : "rgba(40,40,40,0.25)";
        ctx.lineWidth = 0.5 + r() * 0.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        ctx.stroke();
      }
      X.blotches(ctx, w, h, r, { count: 10, color: "#3a3228", alpha: 0.25 });
      X.blotches(ctx, w, h, r, {
        count: 4,
        color: "#7a3c14",
        alpha: 0.25,
        rmin: 5,
        rmax: 25,
      });
    },
  });
  def("metal_diamond", {
    roughVar: 0.55,
    meters: 1,
    normal: 3,
    rough: 0.45,
    metal: 0.8,
    desc: "diamond tread plate",
    gen(ctx, w, h, r, hc) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#484a4a"],
          [1, "#6e706e"],
        ],
        { scale: 4, seed: 211, grain: 8 },
      );
      heightFrom(hc, w, h, () => 0.4);
      const s = w / 12;
      for (let j = 0; j < 12; j++)
        for (let i = 0; i < 12; i++) {
          const cx = i * s + ((j % 2) * s) / 2,
            cy = j * s + s / 2,
            a = (j % 2 ? 1 : -1) * 0.785;
          X.wrap(w, h, cx, cy, s, (x, y) => {
            for (const [g2, c] of [
              [ctx, "rgba(210,212,208,0.7)"],
              [hc, "#e0e0e0"],
            ]) {
              g2.save();
              g2.translate(x, y);
              g2.rotate(a);
              g2.fillStyle = c;
              X.rrect(g2, -s * 0.36, -s * 0.07, s * 0.72, s * 0.14, s * 0.07);
              g2.fill();
              g2.restore();
            }
            ctx.save();
            ctx.translate(x + 1.2, y + 1.2);
            ctx.rotate(a);
            ctx.fillStyle = "rgba(0,0,0,0.35)";
            X.rrect(ctx, -s * 0.36, -s * 0.07, s * 0.72, s * 0.14, s * 0.07);
            ctx.fill();
            ctx.restore();
          });
        }
      X.blotches(ctx, w, h, r, {
        count: 8,
        color: "#5a2c10",
        alpha: 0.3,
        rmin: 10,
        rmax: 60,
      });
      X.blotches(ctx, w, h, r, { count: 6, color: "#101010", alpha: 0.3 });
    },
  });
  def("corrugated", {
    roughVar: 0.6,
    meters: 2,
    normal: 5,
    rough: 0.55,
    metal: 0.6,
    desc: "galvanized corrugated sheet (ridges along V)",
    gen(ctx, w, h, r, hc) {
      const ridges = 16;
      const n = X.fbm(w, h, { scale: 4, octaves: 5, seed: 221 }),
        sp = X.fbm(w, h, { scale: 32, octaves: 2, seed: 222 });
      const rustN = X.fbm(w, h, { scale: 3, octaves: 5, seed: 223 });
      const rr = X.ramp([
        [0, "#3a1c0c"],
        [0.5, "#7a3a16"],
        [1, "#a8662c"],
      ]);
      X.fillPixels(ctx, w, h, (i, x) => {
        const s = Math.sin((x / w) * ridges * TAU),
          shade = 0.78 + s * 0.22;
        let c = [128 + sp[i] * 40, 132 + sp[i] * 40, 134 + sp[i] * 38];
        const rust = rustN[i] * 0.8 + n[i] * 0.3;
        if (rust > 0.62) {
          const t = Math.min(1, (rust - 0.62) * 5);
          const rc = rr(n[i]);
          c = [
            c[0] + (rc[0] - c[0]) * t,
            c[1] + (rc[1] - c[1]) * t,
            c[2] + (rc[2] - c[2]) * t,
          ];
        }
        const g = (r() - 0.5) * 10;
        return [c[0] * shade + g, c[1] * shade + g, c[2] * shade + g];
      });
      heightFrom(
        hc,
        w,
        h,
        (i) => 0.5 + 0.45 * Math.sin(((i % w) / w) * ridges * TAU),
      );
      X.streaks(ctx, w, h, r, {
        count: 40,
        color: "#4a2210",
        alpha: 0.3,
        maxLen: h * 0.7,
        maxW: 6,
      });
      // nail/screw line & a lap seam
      for (let k = 0; k < ridges; k++) {
        const x = ((k + 0.25) / ridges) * w;
        for (const y of [h * 0.1, h * 0.6]) {
          ctx.fillStyle = "#2a2a2a";
          ctx.beginPath();
          ctx.arc(x, y, 2.4, 0, TAU);
          ctx.fill();
          X.streaks(ctx, w, h, r, {
            count: r() < 0.4 ? 1 : 0,
            color: "#7a3810",
            alpha: 0.3,
            minLen: 10,
            maxLen: 50,
            maxW: 4,
          });
        }
      }
      // a few nail holes/bullet holes letting light through (dark)
      for (let k = 0; k < 5; k++) {
        ctx.fillStyle = "#0c0c0c";
        ctx.beginPath();
        ctx.arc(r() * w, r() * h, 1.5 + r() * 2, 0, TAU);
        ctx.fill();
      }
      macroGrime(ctx, w, h, 0.3, 225);
    },
  });
  def("copper_patina", {
    roughVar: 0.3,
    meters: 3,
    normal: 1.8,
    rough: 0.75,
    metal: 0.25,
    desc: "oxidised copper verdigris (Statue of Liberty)",
    gen(ctx, w, h, r, hc) {
      const n = X.fbm(w, h, { scale: 4, octaves: 6, seed: 231 }),
        n2 = X.fbm(w, h, { scale: 20, octaves: 3, seed: 232 });
      const ramp = X.ramp([
        [0, "#3a5a48"],
        [0.35, "#4f8a72"],
        [0.6, "#6aa88a"],
        [0.8, "#8cc2a2"],
        [1, "#b0d8bc"],
      ]);
      X.fillPixels(ctx, w, h, (i) => {
        const c = ramp(n[i] * 0.7 + n2[i] * 0.3),
          g = (r() - 0.5) * 10;
        return [c[0] + g, c[1] + g, c[2] + g];
      });
      heightFrom(hc, w, h, (i) => 0.5 + (n2[i] - 0.5) * 0.3);
      // dark streaks where rain runs + bronze-brown spots where patina has worn
      X.streaks(ctx, w, h, r, {
        count: 40,
        color: "#23352c",
        alpha: 0.3,
        maxLen: h * 0.6,
        maxW: 10,
      });
      X.blotches(ctx, w, h, r, {
        count: 6,
        color: "#5a4028",
        alpha: 0.3,
        rmin: 5,
        rmax: 30,
      });
      // faint riveted sheet seams
      ctx.strokeStyle = "rgba(30,50,40,0.45)";
      ctx.lineWidth = 1.5;
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.moveTo(0, (k * h) / 4 + 10);
        for (let x = 0; x <= w; x += 16)
          ctx.lineTo(x, (k * h) / 4 + 10 + Math.sin(x * 0.02 + k) * 6);
        ctx.stroke();
      }
    },
  });
  def("bronze", {
    roughVar: 0.45,
    meters: 2,
    normal: 0,
    rough: 0.45,
    metal: 0.85,
    desc: "aged statuary bronze",
    gen(ctx, w, h, r) {
      noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#3a2814"],
          [0.5, "#6a4a24"],
          [0.8, "#8a6a34"],
          [1, "#4a6a50"],
        ],
        { scale: 4, seed: 241, grain: 10 },
      );
      X.blotches(ctx, w, h, r, { count: 10, color: "#3c6a58", alpha: 0.35 });
      X.streaks(ctx, w, h, r, { count: 20, color: "#2a4a3a", alpha: 0.35 });
    },
  });
