// play-inline-20 05 — ctx
// Lines 1510-1664 of readable/play-inline-20.pretty.js (statement-aligned).
  X.def("bomb_casing", {
    w: 512,
    meters: 2,
    normal: 1.8,
    rough: 0.6,
    metal: 0.4,
    desc: "pale painted steel bomb casing: seams, rivets, chips, leak stains",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#9aa48e";
      ctx.fillRect(0, 0, w, h);
      X.blotches(ctx, w, h, r, {
        count: 20,
        color: "#c8ccb8",
        alpha: 0.25,
        rmin: w * 0.05,
        rmax: w * 0.2,
      });
      ctx.strokeStyle = "rgba(40,44,36,0.7)";
      ctx.lineWidth = 2;
      for (const y of [0, h / 2]) {
        ctx.beginPath();
        ctx.moveTo(0, y + 1);
        ctx.lineTo(w, y + 1);
        ctx.stroke();
        if (hc) {
          hc.fillStyle = "#505050";
          hc.fillRect(0, y, w, 3);
        }
      }
      for (const y of [0, h / 2])
        for (let x = 8; x < w; x += 32)
          for (const dy of [-8, 10]) {
            ctx.fillStyle = "#7a846e";
            ctx.beginPath();
            ctx.arc(x, y + dy, 3.2, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "rgba(240,244,230,0.5)";
            ctx.beginPath();
            ctx.arc(x - 1, y + dy - 1, 1.3, 0, TAU);
            ctx.fill();
            if (hc) {
              hc.fillStyle = "#b0b0b0";
              hc.beginPath();
              hc.arc(x, y + dy, 3.2, 0, TAU);
              hc.fill();
            }
          }
      for (let k = 0; k < 40; k++) {
        const x = r() * w,
          y = r() * h,
          s = 2 + r() * 8;
        X.wrap(w, h, x, y, s, (xx, yy) => {
          X.blobPath(ctx, xx, yy, s, r, 8, 0.7);
          ctx.fillStyle = "#5a5e56";
          ctx.fill();
        });
      }
      X.streaks(ctx, w, h, r, {
        count: 14,
        color: "#6a5a20",
        alpha: 0.25,
        maxLen: h * 0.35,
        maxW: 6,
      });
    },
  });
  /** 1913 rotary converter housing: black enamel over cast iron, brass edge wear, rust blooms. */
  X.def("converter_iron", {
    w: 512,
    meters: 2,
    normal: 1.6,
    rough: 0.55,
    metal: 0.6,
    desc: "black enamelled cast iron, worn to metal at the edges, rust blooms",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#16161a";
      ctx.fillRect(0, 0, w, h);
      X.blotches(ctx, w, h, r, {
        count: 24,
        color: "#3a3a40",
        alpha: 0.35,
        rmin: w * 0.03,
        rmax: w * 0.14,
      });
      X.blotches(ctx, w, h, r, {
        count: 10,
        color: "#6a3414",
        alpha: 0.4,
        rmin: w * 0.02,
        rmax: w * 0.08,
        pow: 2,
      });
      X.speckle(ctx, w, h, r, {
        count: 1200,
        colors: ["#8a8a90", "#2a1a10"],
        min: 0.4,
        max: 1.2,
        alpha: 0.4,
      });
      X.streaks(ctx, w, h, r, {
        count: 10,
        color: "#5a2a10",
        alpha: 0.25,
        maxLen: h * 0.3,
        maxW: 5,
      });
    },
  });
  /** Hand-knitted wool (the cradle blanket): stocking stitch in cream with a rose stripe. */
  X.def("knit_blanket", {
    w: 256,
    meters: 0.4,
    normal: 1.2,
    rough: 1,
    desc: "hand-knitted wool, cream with a rose stripe",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#e8dcc4";
      ctx.fillRect(0, 0, w, h);
      const sw = 16,
        sh = 16;
      for (let y = 0; y < h; y += sh)
        for (let x = 0; x < w; x += sw) {
          const stripe = ((y / sh) | 0) % 8 >= 5 && ((y / sh) | 0) % 8 <= 6;
          const col = stripe ? "#c87a7a" : "#efe4cc";
          for (const d of [-1, 1]) {
            ctx.fillStyle = X.css(X.shade(col, (r() - 0.5) * 0.12));
            ctx.beginPath();
            ctx.ellipse(
              x + sw / 2 + d * 3.5,
              y + sh / 2,
              4,
              7,
              d * 0.5,
              0,
              TAU,
            );
            ctx.fill();
            if (hc) {
              hc.fillStyle = "#b8b8b8";
              hc.beginPath();
              hc.ellipse(
                x + sw / 2 + d * 3.5,
                y + sh / 2,
                3,
                6,
                d * 0.5,
                0,
                TAU,
              );
              hc.fill();
            }
          }
        }
    },
  });
