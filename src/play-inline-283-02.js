// play-inline-283 02 — ctx
// Lines 26-118 of readable/play-inline-283.pretty.js (statement-aligned).
  const P = G._pt,
    D = P.dress,
    K = P.parts;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  const X0 = -189.5,
    X1 = -130.5,
    Z0 = -268.5,
    Z1 = -236.5;
  const TX0 = -175,
    TX1 = -145; // theatre front
  const DOOR_X = -160; // centre entrance

  function playPoster(i) {
    const T = [
      {
        t: [
          "OUR GLOWING TOWN",
          "a new play in three acts",
          "by the LYCEUM PLAYERS",
          "Nightly · 5 scrip",
        ],
        bg: "#1e3a2a",
        fg: "#b8ff8a",
      },
      {
        t: [
          "THE LYCEUM PLAYERS",
          "Since the Bombs",
          "Tragedy! Comedy!",
          "Occasional Dancing!",
        ],
        bg: "#e8d8a8",
        fg: "#6a1a14",
      },
      {
        t: ["HAMLET", "Prince of Radiation", "Revival — Next Season"],
        bg: "#2a1a2a",
        fg: "#e8c878",
      },
    ][i % 3];
    return P.signTex("ly_poster" + i, T.t, "poster", 320, 480, {
      bg: T.bg,
      fg: T.fg,
      top: 0.12,
      art: (ctx, w, h) => {
        ctx.fillStyle = T.fg;
        ctx.strokeStyle = T.fg;
        ctx.lineWidth = 4;
        if (i % 3 === 0) {
          ctx.beginPath();
          ctx.arc(w / 2, h * 0.74, 60, 0, TAU);
          ctx.globalAlpha = 0.35;
          ctx.fill();
          ctx.globalAlpha = 1;
          for (let k = 0; k < 5; k++) {
            ctx.fillRect(
              40 + k * 50,
              h * 0.8 - (k % 2) * 30,
              30,
              60 + (k % 2) * 30,
            );
          }
        } else if (i % 3 === 1) {
          ctx.beginPath();
          ctx.arc(w * 0.38, h * 0.74, 40, 0, TAU);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(w * 0.62, h * 0.74, 40, 0, TAU);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(w * 0.38, h * 0.78, 20, 0, PI);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(w * 0.62, h * 0.82, 20, PI, TAU);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(w / 2, h * 0.72, 44, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#2a1a2a";
          ctx.fillRect(w / 2 - 22, h * 0.7, 12, 12);
          ctx.fillRect(w / 2 + 10, h * 0.7, 12, 12);
        }
      },
    });
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
