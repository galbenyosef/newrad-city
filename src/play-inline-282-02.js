// play-inline-282 02 — ctx
// Lines 28-122 of readable/play-inline-282.pretty.js (statement-aligned).
  const P = G._pt,
    D = P.dress,
    K = P.parts;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  // world geometry of the site
  const X0 = -189.5,
    X1 = -130.5,
    Z0 = -358.5,
    Z1 = -326.5;
  const TX0 = -152; // tower (office block) west edge
  const TH = 28.5; // tower main roof
  const AH = 16.5; // auditorium roof
  const DOOR_Z = -342.5; // main entrance (east facade, Eighth Avenue)
  const STAGE_DOOR_X = -173.5; // stage door (south facade, 53rd Street)

  function posterTex(i) {
    const P0 = [
      {
        t: ["THE TOMORROW HOUR", "LIVE from STUDIO 50", "Sundays 8 PM"],
        bg: "#e8d8a8",
        fg: "#1d3f7a",
        art: "gear",
      },
      {
        t: [
          "CIVIL DEFENSE PRESENTS",
          "A FAMILY SPECTACULAR",
          "Prepare for the Future!",
        ],
        bg: "#244a8a",
        fg: "#f4d04a",
        art: "gear",
      },
      {
        t: ["JOLLY JACK JOHNSON", "& his ATOMIC ORCHESTRA", "Tonight!"],
        bg: "#e2c060",
        fg: "#7a1f18",
        art: "notes",
      },
      {
        t: ["SEE THE AMAZING", "MR. SHOWTIME", "The Robot Who Sings!"],
        bg: "#2a2a2a",
        fg: "#ff8a30",
        art: "robot",
      },
    ][i];
    return P.signTex("es_poster" + i, P0.t, "poster", 320, 480, {
      bg: P0.bg,
      fg: P0.fg,
      top: 0.1,
      art: (ctx, w, h) => {
        ctx.strokeStyle = P0.fg;
        ctx.fillStyle = P0.fg;
        ctx.lineWidth = 5;
        if (P0.art === "gear") {
          ctx.beginPath();
          ctx.arc(w / 2, h * 0.66, 70, 0, TAU);
          ctx.stroke();
          for (let k = 0; k < 12; k++) {
            const a = (k / 12) * TAU;
            ctx.fillRect(
              w / 2 + Math.cos(a) * 78 - 8,
              h * 0.66 + Math.sin(a) * 78 - 8,
              16,
              16,
            );
          }
          ctx.beginPath();
          ctx.arc(w / 2, h * 0.66, 30, 0, TAU);
          ctx.fill();
        } else if (P0.art === "notes") {
          for (let k = 0; k < 4; k++) {
            ctx.beginPath();
            ctx.ellipse(70 + k * 60, h * 0.72 - k * 18, 14, 10, -0.4, 0, TAU);
            ctx.fill();
            ctx.fillRect(82 + k * 60, h * 0.5 - k * 18, 4, h * 0.22);
          }
        } else {
          ctx.strokeRect(w / 2 - 50, h * 0.5, 100, 90);
          ctx.strokeRect(w / 2 - 36, h * 0.72, 72, 90);
          ctx.beginPath();
          ctx.arc(w / 2 - 20, h * 0.58, 12, 0, TAU);
          ctx.arc(w / 2 + 20, h * 0.58, 12, 0, TAU);
          ctx.fill();
        }
      },
    });
  }

  // ===================================================================
  // EXTERIOR
  // ===================================================================
