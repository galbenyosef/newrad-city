// play-inline-215 04 — ctx
// Lines 1997-2038 of readable/play-inline-215.pretty.js (statement-aligned).
  function eyeChartTex() {
    return PH.canvasTex("ph_eyechart", 256, 360, (ctx, w, h) => {
      ctx.fillStyle = "#e6dfcc";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#1a1a1a";
      ctx.textAlign = "center";
      const rows = [
        "E",
        "F P",
        "T O Z",
        "L P E D",
        "P E C F D",
        "E D F C Z P",
        "F E L O P Z D",
        "R A D S O K",
      ];
      rows.forEach((t, i) => {
        const fs = 70 - i * 8.2;
        ctx.font = "bold " + fs + "px Georgia, serif";
        ctx.fillText(
          t,
          w / 2,
          20 +
            rows
              .slice(0, i + 1)
              .reduce((a, _, k) => a + (70 - k * 8.2) * 0.95, 0),
        );
      });
      ctx.fillStyle = "rgba(80,60,30,0.25)";
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * w,
          Math.random() * h,
          5 + Math.random() * 25,
          0,
          TAU,
        );
        ctx.fill();
      }
    });
  }
