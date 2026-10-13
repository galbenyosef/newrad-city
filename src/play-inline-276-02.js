// play-inline-276 02 — ctx
// Lines 29-108 of readable/play-inline-276.pretty.js (statement-aligned).
  const P = G._uw,
    D = P.dress,
    X = P.parts;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  // deco surfaces
  Object.assign(P.CUSTOM, {
    deco_spandrel: [
      256,
      128,
      (ctx, w, h) => {
        const r = P.rng("dsp");
        ctx.fillStyle = "#23201c";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#6a5a3a";
        ctx.lineWidth = 5;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          for (let x = 0; x <= w; x += 32)
            ctx.lineTo(x, h * 0.2 + i * 22 + ((x / 32) % 2) * 16);
          ctx.stroke();
        }
        ctx.fillStyle = "rgba(160,130,70,0.5)";
        ctx.fillRect(0, 0, w, 6);
        ctx.fillRect(0, h - 6, w, 6);
        P.blotches(ctx, w, h, r, 16, 0.35);
        P.speckle(ctx, w, h, r, 400, 0.3, 0.05);
      },
    ],
    deco_frieze: [
      512,
      128,
      (ctx, w, h) => {
        const r = P.rng("dfz");
        ctx.fillStyle = "#cfc4ac";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(70,60,45,0.55)";
        for (let x = 0; x < w; x += 64) {
          ctx.beginPath();
          ctx.moveTo(x, h);
          ctx.lineTo(x + 32, h * 0.15);
          ctx.lineTo(x + 64, h);
          ctx.lineTo(x + 52, h);
          ctx.lineTo(x + 32, h * 0.45);
          ctx.lineTo(x + 12, h);
          ctx.fill();
        }
        for (let x = 0; x < w; x += 16) {
          ctx.fillRect(x, 4, 8, 10);
        }
        P.blotches(ctx, w, h, r, 30, 0.3);
        P.speckle(ctx, w, h, r, 900);
      },
    ],
  });
  Object.assign(P.MAT, {
    spandrel: {
      custom: "deco_spandrel",
      color: 0x2a2620,
      uv: 1.45,
      rough: 0.5,
      metal: 0.3,
    },
    frieze: { custom: "deco_frieze", color: 0xc8bca0, uv: 4, rough: 0.9 },
  });

  const X0 = 211,
    X1 = 269,
    Z0 = -454,
    Z1 = -418,
    XC = 240;
  const BASE = 6.5,
    TOP = 33.6,
    CROWN = 36.2;

  // ===================================================================
  // EXTERIOR
  // ===================================================================
