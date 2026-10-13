// play-inline-11 12 — ctx
// Lines 3475-3717 of readable/play-inline-11.pretty.js (statement-aligned).
  def("tile_cryo", {
    roughVar: 0.7,
    meters: 2,
    normal: 3,
    rough: 0.55,
    metal: 0.6,
    desc: "Cryo facility floor: steel plates, 4×4 per tile, bolted corners",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#4a5058"],
          [0.5, "#5e656c"],
          [1, "#727a80"],
        ],
        { scale: 3, seed: 561, grain: 8, dscale: 64 },
      );
      heightFrom(hc, w, h, (i) => 0.62 + (n2[i] - 0.5) * 0.05);
      const n = 4,
        s = w / n;
      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
          const x = i * s,
            y = j * s;
          ctx.fillStyle =
            r() < 0.5 ? X.css("#000", r() * 0.1) : X.css("#fff", r() * 0.05);
          ctx.fillRect(x, y, s, s);
          // bevelled edge
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fillRect(x + 3, y + 3, s - 6, 3);
          ctx.fillRect(x + 3, y + 3, 3, s - 6);
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(x + 3, y + s - 6, s - 6, 3);
          ctx.fillRect(x + s - 6, y + 3, 3, s - 6);
          ctx.fillStyle = "#1a1c1e";
          ctx.fillRect(x, y, s, 3);
          ctx.fillRect(x, y, 3, s);
          hc.fillStyle = "#202020";
          hc.fillRect(x - 1, y - 1, s + 2, 5);
          hc.fillRect(x - 1, y - 1, 5, s + 2);
          // anti-slip dimples on alternating plates
          if ((i + j) % 2 === 0)
            for (let a = 1; a < 6; a++)
              for (let b = 1; b < 6; b++) {
                const dx = x + (a * s) / 6,
                  dy = y + (b * s) / 6;
                ctx.fillStyle = "rgba(0,0,0,0.25)";
                ctx.beginPath();
                ctx.arc(dx + 0.6, dy + 0.6, 2.4, 0, TAU);
                ctx.fill();
                ctx.fillStyle = "rgba(200,210,215,0.25)";
                ctx.beginPath();
                ctx.arc(dx, dy, 2, 0, TAU);
                ctx.fill();
                hc.fillStyle = "#b0b0b0";
                hc.beginPath();
                hc.arc(dx, dy, 2.2, 0, TAU);
                hc.fill();
              }
          for (const [bx, by] of [
            [x + 12, y + 12],
            [x + s - 12, y + 12],
            [x + 12, y + s - 12],
            [x + s - 12, y + s - 12],
          ]) {
            ctx.fillStyle = "#2a2e30";
            ctx.beginPath();
            ctx.arc(bx, by, 4, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = "rgba(200,205,210,0.5)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bx - 3, by);
            ctx.lineTo(bx + 3, by);
            ctx.stroke();
            hc.fillStyle = "#d0d0d0";
            hc.beginPath();
            hc.arc(bx, by, 4, 0, TAU);
            hc.fill();
          }
        }
      // scuffs & boot traffic
      ctx.lineCap = "round";
      for (let k = 0; k < 80; k++) {
        const x = r() * w,
          y = r() * h,
          a = r() * TAU,
          l = 6 + r() * 30;
        ctx.strokeStyle = "rgba(20,20,20,0.25)";
        ctx.lineWidth = 1 + r() * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        ctx.stroke();
      }
      X.blotches(ctx, w, h, r, { count: 6, color: "#101418", alpha: 0.25 });
      macroGrime(ctx, w, h, 0.2, 565);
    },
  });
  def("cryo_wall", {
    roughVar: 0.5,
    meters: 4,
    normal: 3,
    rough: 0.5,
    metal: 0.5,
    desc: "Cryo facility wall: riveted grey-white enamelled steel panels with a rib",
    gen(ctx, w, h, r, hc) {
      const { n2 } = noiseBase(
        ctx,
        w,
        h,
        r,
        [
          [0, "#9ca2a4"],
          [0.5, "#b4b9ba"],
          [1, "#c8cccc"],
        ],
        { scale: 3, seed: 571, grain: 6, dscale: 64 },
      );
      heightFrom(hc, w, h, (i) => 0.55 + (n2[i] - 0.5) * 0.04);
      const cols = 4,
        pw = w / cols;
      for (let i = 0; i < cols; i++) {
        const x = i * pw;
        ctx.fillStyle =
          r() < 0.5 ? X.css("#000", r() * 0.08) : X.css("#fff", r() * 0.05);
        ctx.fillRect(x, 0, pw, h);
        // inset field
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(x + 14, 14, pw - 28, h / 2 - 28);
        ctx.fillRect(x + 14, h / 2 + 14, pw - 28, h / 2 - 28);
        ctx.strokeStyle = "rgba(230,240,245,0.22)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 14, 14, pw - 28, h / 2 - 28);
        ctx.strokeRect(x + 14, h / 2 + 14, pw - 28, h / 2 - 28);
        hc.fillStyle = "#6a6a6a";
        hc.fillRect(x + 14, 14, pw - 28, h / 2 - 28);
        hc.fillRect(x + 14, h / 2 + 14, pw - 28, h / 2 - 28);
        // vertical seam
        ctx.fillStyle = "#20262c";
        ctx.fillRect(x, 0, 4, h);
        ctx.fillStyle = "rgba(220,230,235,0.25)";
        ctx.fillRect(x + 4, 0, 2, h);
        hc.fillStyle = "#202020";
        hc.fillRect(x - 1, 0, 6, h);
        // rivet rows
        for (let y = 8; y < h; y += 24)
          for (const rx of [x + 7, x + pw - 7]) {
            ctx.fillStyle = "#3a444c";
            ctx.beginPath();
            ctx.arc(rx, y, 3.2, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "rgba(230,235,240,0.5)";
            ctx.beginPath();
            ctx.arc(rx - 0.8, y - 0.8, 1.3, 0, TAU);
            ctx.fill();
            hc.fillStyle = "#f0f0f0";
            hc.beginPath();
            hc.arc(rx, y, 3.2, 0, TAU);
            hc.fill();
          }
      }
      // horizontal rib at mid height
      const g = ctx.createLinearGradient(0, h / 2 - 8, 0, h / 2 + 8);
      g.addColorStop(0, "#dadedf");
      g.addColorStop(0.5, "#9aa0a2");
      g.addColorStop(1, "#5a6062");
      ctx.fillStyle = g;
      ctx.fillRect(0, h / 2 - 8, w, 16);
      hc.fillStyle = "#e0e0e0";
      hc.fillRect(0, h / 2 - 8, w, 16);
      X.streaks(ctx, w, h, r, {
        count: 16,
        color: "#3a3020",
        alpha: 0.18,
        maxW: 10,
      });
      X.blotches(ctx, w, h, r, {
        count: 5,
        color: "#5a3a1a",
        alpha: 0.18,
        rmin: 5,
        rmax: 25,
      });
      macroGrime(ctx, w, h, 0.18, 575);
    },
  });
  def("cryo_trim", {
    w: 512,
    h: 128,
    meters: 4,
    metersV: 1,
    normal: 0,
    rough: 0.5,
    metal: 0.4,
    desc: 'Long Winter slate band with safety-orange stripes, crystal marks & "CRYO UNIT C-9" stencil (u along wall)',
    gen(ctx, w, h, r) {
      ctx.fillStyle = "#2e3a46";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#e8742a";
      ctx.fillRect(0, 10, w, 10);
      ctx.fillRect(0, h - 20, w, 10);
      for (const cx of [w * 0.06, w * 0.56])
        X.art.snowflake(ctx, cx, h / 2, 24, "#e6eef2", 4);
      X.text(ctx, "CRYO UNIT C-9", w * 0.29, h / 2, {
        font: "stencil",
        size: 40,
        color: "#e6eef2",
        weight: "bold",
        spacing: 3,
        maxW: w / 2 - 80,
      });
      X.text(ctx, "CRYO UNIT C-9", w * 0.79, h / 2, {
        font: "stencil",
        size: 40,
        color: "#e6eef2",
        weight: "bold",
        spacing: 3,
        maxW: w / 2 - 80,
      });
      X.blotches(ctx, w, h, r, {
        count: 8,
        color: "#0c1420",
        alpha: 0.25,
        rmin: 10,
        rmax: 40,
      });
      X.streaks(ctx, w, h, r, {
        count: 12,
        color: "#101820",
        alpha: 0.2,
        maxW: 8,
      });
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      for (let k = 0; k < 20; k++) {
        const x = r() * w;
        ctx.fillRect(x, r() * h, 1 + r() * 8, 1 + r() * 3);
      }
    },
  });
