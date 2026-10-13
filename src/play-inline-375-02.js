// play-inline-375 02 — ctx
// Lines 28-78 of readable/play-inline-375.pretty.js (statement-aligned).
  const P = G._m3,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  const F2 = 7.6,
    F3 = 12.6,
    CRY = 60;

  /** Hazy ruined-city daylight through a dusty window (emissive card; bright by day, dim at night). */
  function skyCard() {
    return P.texMat(
      "helms_sky",
      P.canvasTex(
        "m3_helms_sky",
        256,
        256,
        (ctx, w, h) => {
          const rr = P.rng("hsky");
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#c8d0b0");
          g.addColorStop(0.65, "#e0dcc0");
          g.addColorStop(1, "#a8a488");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = "rgba(70,72,64,0.75)";
          for (let x = 0; x < w;) {
            const bw = 12 + rr() * 30,
              bh = h * (0.12 + rr() * 0.35);
            ctx.fillRect(x, h - bh, bw - 2, bh);
            x += bw;
          }
          for (let i = 0; i < 30; i++) {
            ctx.fillStyle = "rgba(90,80,60," + rr() * 0.2 + ")";
            ctx.beginPath();
            ctx.arc(rr() * w, rr() * h, 6 + rr() * 30, 0, TAU);
            ctx.fill();
          }
          ctx.fillStyle = "#2a261e";
          ctx.fillRect(w / 2 - 4, 0, 8, h);
          ctx.fillRect(0, h * 0.45 - 4, w, 8);
          ctx.lineWidth = 10;
          ctx.strokeStyle = "#2a261e";
          ctx.strokeRect(0, 0, w, h);
        },
        { clamp: true },
      ),
      { rough: 0.6, emissive: 0.9, glow: [0.95, 0.15] },
    );
  }
