// play-inline-144 02 — ctx
// Lines 19-71 of readable/play-inline-144.pretty.js (statement-aligned).
  const LB = G._lb;
  const TAU = Math.PI * 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // encaustic Minton tile ceiling texture for the arcade
  function mintonTex() {
    return LB.canvasTex("lb_minton", 256, 256, (ctx, w, h) => {
      const n = 4,
        s = w / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const x = i * s,
            y = j * s;
          ctx.fillStyle = (i + j) % 2 ? "#b8894a" : "#c9a468";
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = "#7a2e22";
          ctx.beginPath();
          ctx.arc(x + s / 2, y + s / 2, s * 0.36, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#1f4a5a";
          for (let k = 0; k < 4; k++) {
            const a = (k * Math.PI) / 2;
            ctx.beginPath();
            ctx.ellipse(
              x + s / 2 + Math.cos(a) * s * 0.2,
              y + s / 2 + Math.sin(a) * s * 0.2,
              s * 0.12,
              s * 0.07,
              a,
              0,
              TAU,
            );
            ctx.fill();
          }
          ctx.fillStyle = "#e8d8a8";
          ctx.beginPath();
          ctx.arc(x + s / 2, y + s / 2, s * 0.07, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#3a2a1a";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, s, s);
        }
      const r = G.util.rng(5);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = "rgba(40,30,20," + r() * 0.35 + ")";
        ctx.fillRect(r() * w, r() * h, 4 + r() * 30, 4 + r() * 30);
      }
    });
  }

  // =====================================================================
  // BETHESDA TERRACE + ANGEL OF THE WATERS
  // =====================================================================
