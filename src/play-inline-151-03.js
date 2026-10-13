// play-inline-151 03 — ctx
// Lines 337-377 of readable/play-inline-151.pretty.js (statement-aligned).
  function crackTex() {
    return P.canvasTex(
      "pu_crack",
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("crack");
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(230,240,240,0.85)";
        ctx.lineWidth = 2;
        const cx = w * 0.5,
          cy = h * 0.45;
        for (let i = 0; i < 16; i++) {
          let x = cx,
            y = cy;
          const a = (i / 16) * TAU + r() * 0.3;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let k = 0; k < 7; k++) {
            x += Math.cos(a + (r() - 0.5) * 0.6) * (20 + r() * 30);
            y += Math.sin(a + (r() - 0.5) * 0.6) * (20 + r() * 30);
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        for (const rr of [30, 70, 120]) {
          ctx.beginPath();
          for (let k = 0; k <= 16; k++) {
            const a = (k / 16) * TAU;
            const q = rr * (0.8 + r() * 0.4);
            ctx.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q);
          }
          ctx.stroke();
        }
      },
      { clamp: true },
    );
  }

  // every walkable interior floor must sit above the cell's terrain (y 0): the museum is lifted 5 m
  const FLOOR_Y = 5;
