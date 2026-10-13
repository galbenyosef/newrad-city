// play-inline-150 02 — ctx
// Lines 20-83 of readable/play-inline-150.pretty.js (statement-aligned).
  const P = G._pu,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  function bannerEmblem(kind) {
    return (ctx, w, h) => {
      ctx.save();
      ctx.fillStyle = "rgba(240,225,190,0.85)";
      if (kind === "dino") {
        // T. rex silhouette
        ctx.translate(w * 0.5, h * 0.62);
        ctx.scale(w / 256, w / 256);
        ctx.beginPath();
        ctx.moveTo(-90, 10);
        ctx.quadraticCurveTo(-20, -40, 30, -30);
        ctx.lineTo(60, -60);
        ctx.lineTo(95, -55);
        ctx.lineTo(90, -38);
        ctx.lineTo(55, -35);
        ctx.quadraticCurveTo(40, 0, 20, 10);
        ctx.lineTo(25, 60);
        ctx.lineTo(10, 60);
        ctx.lineTo(0, 20);
        ctx.lineTo(-20, 20);
        ctx.lineTo(-25, 60);
        ctx.lineTo(-40, 60);
        ctx.lineTo(-40, 15);
        ctx.closePath();
        ctx.fill();
      } else if (kind === "whale") {
        ctx.translate(w * 0.5, h * 0.6);
        ctx.scale(w / 256, w / 256);
        ctx.beginPath();
        ctx.ellipse(0, 0, 90, 26, 0, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-85, 0);
        ctx.lineTo(-120, -25);
        ctx.lineTo(-110, 0);
        ctx.lineTo(-120, 25);
        ctx.fill();
      } else {
        // planetarium: ringed planet + stars
        ctx.translate(w * 0.5, h * 0.6);
        ctx.scale(w / 256, w / 256);
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "rgba(240,225,190,0.85)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.ellipse(0, 0, 95, 22, -0.3, 0, TAU);
        ctx.stroke();
        for (let i = 0; i < 12; i++)
          ctx.fillRect(-110 + ((i * 53) % 220), -110 + ((i * 37) % 60), 5, 5);
      }
      ctx.restore();
    };
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
