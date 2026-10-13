// play-inline-158 02 — ctx
// Lines 19-101 of readable/play-inline-158.pretty.js (statement-aligned).
  const P = G._pu,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  function clockTex() {
    return P.canvasTex(
      "pu_tif_clock",
      256,
      256,
      (ctx, w, h) => {
        const g = ctx.createRadialGradient(
          w / 2,
          h / 2,
          10,
          w / 2,
          h / 2,
          w / 2,
        );
        g.addColorStop(0, "#f0e8d0");
        g.addColorStop(1, "#c8b890");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, w / 2 - 4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#2a2418";
        ctx.font = "bold 22px " + P.FONTS.SERIF;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const R = [
          "XII",
          "I",
          "II",
          "III",
          "IIII",
          "V",
          "VI",
          "VII",
          "VIII",
          "IX",
          "X",
          "XI",
        ];
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU - HP;
          ctx.fillText(
            R[i],
            w / 2 + Math.cos(a) * 96,
            h / 2 + Math.sin(a) * 96,
          );
        }
        // stopped at 9:47 — the moment the bombs fell
        ctx.strokeStyle = "#1a1410";
        ctx.lineCap = "round";
        ctx.lineWidth = 7;
        const ah = ((9 + 47 / 60) / 12) * TAU - HP;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + Math.cos(ah) * 55, h / 2 + Math.sin(ah) * 55);
        ctx.stroke();
        ctx.lineWidth = 4;
        const am = (47 / 60) * TAU - HP;
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(w / 2 + Math.cos(am) * 80, h / 2 + Math.sin(am) * 80);
        ctx.stroke();
        ctx.strokeStyle = "rgba(40,30,20,0.6)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 9; i++) {
          ctx.beginPath();
          ctx.moveTo(w * 0.55, h * 0.3);
          ctx.lineTo(w * 0.55 + Math.cos(i) * 60, h * 0.3 + Math.sin(i) * 60);
          ctx.stroke();
        }
      },
      { clamp: true },
    );
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
