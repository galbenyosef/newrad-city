// play-inline-154 02 — ctx
// Lines 19-81 of readable/play-inline-154.pretty.js (statement-aligned).
  const P = G._pu,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  function flagTex(kind) {
    return P.canvasTex(
      "pu_flag_" + kind,
      512,
      300,
      (ctx, w, h) => {
        const r = P.rng("flag" + kind);
        if (kind === "us") {
          const sh = h / 13;
          for (let i = 0; i < 13; i++) {
            ctx.fillStyle = i % 2 ? "#e4dccb" : "#9a2a24";
            ctx.fillRect(0, i * sh, w, sh + 1);
          }
          const cw = w * 0.42,
            ch = sh * 7;
          ctx.fillStyle = "#26345a";
          ctx.fillRect(0, 0, cw, ch);
          ctx.fillStyle = "#e8e0cc";
          for (let i = 0; i < 13; i++) {
            const a = (i / 13) * TAU;
            ctx.beginPath();
            ctx.arc(
              cw / 2 + Math.cos(a) * ch * 0.33,
              ch / 2 + Math.sin(a) * ch * 0.33,
              ch * 0.05,
              0,
              TAU,
            );
            ctx.fill();
          }
        } else {
          ctx.fillStyle = kind === "plaza" ? "#1e3a2a" : "#6a1e1e";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#d8b860";
          ctx.lineWidth = 10;
          ctx.strokeRect(14, 14, w - 28, h - 28);
          ctx.fillStyle = "#e8c870";
          ctx.font = "bold 170px " + P.FONTS.SERIF;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(kind === "plaza" ? "P" : "★", w / 2, h / 2 + 8);
        }
        P.blotches(ctx, w, h, r, 40, 0.3);
        ctx.fillStyle = "rgba(20,14,8,0.8)";
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(w - r() * 60, r() * h, 6 + r() * 12, 0, TAU);
          ctx.fill();
        }
      },
      { clamp: true },
    );
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
