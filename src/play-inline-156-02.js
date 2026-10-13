// play-inline-156 02 — ctx
// Lines 19-77 of readable/play-inline-156.pretty.js (statement-aligned).
  const P = G._pu,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  function posterTex(i) {
    const titles = [
      ["THE CARNEGIE CONSORT", "TONIGHT", "All Welcome", "No Guns In The Hall"],
      ["NEW YORK PHILHARMONIC", "Winter Season 1967", "Beethoven · Brahms"],
      ["JAZZ AT CARNEGIE", "One Night Only", "The Atomic Swing Orchestra"],
      ["DR. STRANGEWOOD'S", "THEREMIN", "SPECTACULAR"],
    ];
    const cols = [
      ["#e0d0a0", "#7a1f18"],
      ["#1e2a4a", "#e8d8b0"],
      ["#e8c860", "#1a1a1a"],
      ["#3a1e3a", "#f0c060"],
    ];
    return P.signTex("carn_poster" + i, titles[i], "poster", 320, 480, {
      bg: cols[i][0],
      fg: cols[i][1],
      art: (ctx, w, h, r) => {
        ctx.strokeStyle = cols[i][1];
        ctx.lineWidth = 4;
        if (i === 0 || i === 1) {
          for (let k = 0; k < 5; k++) {
            ctx.beginPath();
            ctx.moveTo(30, h * 0.62 + k * 12);
            ctx.lineTo(w - 30, h * 0.62 + k * 12);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(w * 0.4, h * 0.66, 10, 0, TAU);
          ctx.fill();
        } else if (i === 2) {
          ctx.beginPath();
          ctx.moveTo(w * 0.3, h * 0.9);
          ctx.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.7, h * 0.55);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(w * 0.7, h * 0.55, 20, 0, TAU);
          ctx.stroke();
        } else {
          for (let k = 0; k < 6; k++) {
            ctx.beginPath();
            ctx.arc(w / 2, h * 0.7, 14 + k * 14, PI * 1.1, PI * 1.9);
            ctx.stroke();
          }
        }
        void r;
      },
    });
  }
  P.carnegiePosterTex = posterTex; // shared with 40_carnegie_interior.js (lobby posters)

  // ===================================================================
  // EXTERIOR
  // ===================================================================
