// play-inline-20 02 — ctx
// Lines 299-854 of readable/play-inline-20.pretty.js (statement-aligned).
  Object.assign(X.EXTRA_POSTERS, {
    match_woman(ctx, v, r) {
      paperBg(ctx, "#e4d7b6", r);
      X.text(
        ctx,
        "OFFICE OF CIVIL DEFENSE · GRAND CENTRAL RELIEF STATION",
        200,
        26,
        { font: "condensed", size: 15, color: INK, spacing: 1, maxW: 380 },
      );
      X.text(ctx, "WANTED", 200, 76, {
        font: "slab",
        size: 74,
        color: INK,
        maxW: 370,
      });
      X.text(ctx, "THE MATCH WOMAN", 200, 128, {
        font: "slab",
        size: 34,
        color: "#8a1a10",
        spacing: 2,
        maxW: 370,
      });
      ctx.fillStyle = "#efe6cc";
      ctx.fillRect(95, 150, 210, 250);
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.strokeRect(95, 150, 210, 250);
      sketchWoman(ctx, 200, 255, 92, r);
      X.text(ctx, "MEAD, N.", 200, 428, {
        font: "slab",
        size: 40,
        color: INK,
        maxW: 370,
      });
      X.text(ctx, "ARSON · 12 DEAD · 5 MARCH 1968", 200, 466, {
        font: "typewriter",
        size: 20,
        color: INK,
        maxW: 370,
      });
      X.text(
        ctx,
        "Female, 29, dark hair, burns to the hand. Canadian national. May carry an infant.",
        200,
        498,
        {
          font: "typewriter",
          size: 13,
          color: "#3a3026",
          weight: "normal",
          maxW: 370,
        },
      );
      X.text(ctx, "REWARD 500 SCRIP", 200, 548, {
        font: "slab",
        size: 40,
        color: "#8a1a10",
        maxW: 370,
      });
      if (v % 2)
        stamp(
          ctx,
          "FILE CLOSED · PRESUMED DEAD",
          200,
          330,
          -0.35,
          "#a8231c",
          24,
        );
    },
    relief_station(ctx, v, r) {
      paperBg(ctx, "#ecebe2", r);
      A.ocd(ctx, 200, 70, 44, {});
      X.text(ctx, "OFFICE OF CIVIL DEFENSE", 200, 140, {
        font: "deco",
        size: 26,
        color: "#1c2e52",
        maxW: 370,
      });
      X.text(ctx, "RELIEF STATION", 200, 178, {
        font: "impact",
        size: 46,
        color: INK,
        maxW: 370,
      });
      X.text(ctx, "GRAND CENTRAL TERMINAL · MAIN CONCOURSE", 200, 212, {
        font: "condensed",
        size: 18,
        color: INK,
        spacing: 1,
        maxW: 370,
      });
      ctx.fillStyle = "#a8231c";
      ctx.fillRect(30, 232, 340, 4);
      typed(
        ctx,
        [
          "RATIONS AND MEDICINE ARE ISSUED",
          "ON PRESENTATION OF A VALID",
          "1967 ENROLMENT CARD ONLY.",
          "",
          "Persons not enrolled will be",
          "referred to the Registration Desk.",
          "Do not queue without a card.",
        ],
        40,
        262,
        26,
        19,
        INK,
      );
      X.text(ctx, "NO CARD — NO ISSUE", 200, 470, {
        font: "impact",
        size: 44,
        color: "#a8231c",
        maxW: 370,
      });
      X.text(
        ctx,
        "By order: Capt. L. Crane, Station Commander · April 1967",
        200,
        545,
        {
          font: "typewriter",
          size: 14,
          color: "#3a3026",
          weight: "normal",
          maxW: 370,
        },
      );
    },
    lower_level_closed(ctx, v, r) {
      paperBg(ctx, "#f0ede4", r);
      ctx.fillStyle = "#a8231c";
      ctx.fillRect(0, 0, 400, 120);
      X.text(ctx, "LOWER LEVEL", 200, 48, {
        font: "stencil",
        size: 56,
        color: "#f4f0e0",
        maxW: 370,
      });
      X.text(ctx, "CLOSED", 200, 98, {
        font: "stencil",
        size: 40,
        color: "#f4f0e0",
        spacing: 6,
        maxW: 370,
      });
      A.ocd(ctx, 200, 200, 50, {});
      X.text(ctx, "BY ORDER OF THE O.C.D.", 200, 290, {
        font: "impact",
        size: 34,
        color: INK,
        maxW: 370,
      });
      typed(
        ctx,
        [
          "RELIEF STATION RIOT, 5 MARCH 1968.",
          "THE STAIR TO THE LOWER LEVEL",
          "AND TRACKS 61-67 IS SEALED.",
          "NO ADMITTANCE BEYOND THIS POINT.",
          "Survivors report to the concourse desk.",
        ],
        40,
        340,
        30,
        18,
        INK,
      );
      X.text(ctx, "OFFICE OF CIVIL DEFENSE · NEW YORK", 200, 556, {
        font: "condensed",
        size: 18,
        color: "#1c2e52",
        spacing: 2,
        maxW: 370,
      });
    },
    lost_persons(ctx, v, r) {
      paperBg(ctx, "#e8e2d0", r);
      X.text(ctx, "GRAND CENTRAL", 200, 36, {
        font: "deco",
        size: 30,
        color: INK,
        maxW: 370,
      });
      X.text(ctx, "LOST & FOUND PERSONS", 200, 72, {
        font: "impact",
        size: 38,
        color: "#8a1a10",
        maxW: 370,
      });
      X.text(ctx, "MARCH 1967 · ask at the Information Booth", 200, 102, {
        font: "typewriter",
        size: 15,
        color: INK,
        weight: "normal",
        maxW: 370,
      });
      const rows = [
        "ABRAMOWITZ, Saul - Tudor City - ask Sol",
        "BRADY, Eleanor (Nell) - reporter - not seen since Feb 19",
        "CARUSO, Angela & 2 children - FOUND",
        "DOYLE, Frank - Five Boroughs lineman - Bronx side",
        "FELDSTEIN, Mort - FOUND, Oyster Bar",
        "GALLAGHER, Peg - nurse, Bellevue",
        "KOWALSKI, Stanley - longshoreman",
        "LINDQVIST, Vera - singer",
        "MEAD, Nicole - interpreter, U.N. - INQUIRE TRACK 61",
        "NAKASHIMA, George - Penn Station",
        "OKAFOR, Delphine (age 8) - FOUND",
        "PRUZAN, Ida - looking for her husband",
        "RUIZ, Hector - taxi 4471",
        "SANTANGELO, Lou - Fulton Market",
        "WEXLER, family of five - Murray Hill",
      ];
      rows.forEach((t, i) => {
        const y = 138 + i * 29,
          hot = t.indexOf("MEAD") === 0;
        X.text(ctx, t, 30, y, {
          font: "typewriter",
          size: 15,
          color: hot ? "#1a1a3a" : INK,
          weight: "normal",
          align: "left",
          maxW: 345,
        });
        if (/FOUND/.test(t)) {
          ctx.strokeStyle = "rgba(30,26,24,0.6)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(28, y);
          ctx.lineTo(372, y + 2);
          ctx.stroke();
        }
      });
      // somebody pencilled a little sun beside one name
      sunRays(ctx, 382, 138 + 8 * 29, 9, "rgba(40,50,110,0.8)", 1.4, r, {
        wobble: 0.15,
      });
    },
    blackout_1965(ctx, v, r) {
      const photo = (x, y, w, h) => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.fillStyle = "#121110";
        ctx.fillRect(x, y, w, h);
        // the great arched windows, barely grey
        for (let k = 0; k < 3; k++) {
          const wx = x + w * (0.2 + k * 0.3);
          ctx.fillStyle = "rgba(80,80,78,0.35)";
          ctx.fillRect(wx - w * 0.07, y + h * 0.05, w * 0.14, h * 0.45);
          ctx.beginPath();
          ctx.arc(wx, y + h * 0.05, w * 0.07, Math.PI, 0);
          ctx.fill();
        }
        // crowd silhouettes lit from below by candles
        for (let k = 0; k < 26; k++) {
          const px = x + r() * w,
            py = y + h * (0.62 + r() * 0.3),
            ps = h * (0.12 + r() * 0.08);
          ctx.fillStyle = "rgba(40,36,30,0.95)";
          ctx.beginPath();
          ctx.arc(px, py - ps * 0.6, ps * 0.18, 0, TAU);
          ctx.fill();
          ctx.fillRect(px - ps * 0.2, py - ps * 0.45, ps * 0.4, ps * 0.6);
          if (r() < 0.6) {
            const g = ctx.createRadialGradient(
              px + ps * 0.15,
              py - ps * 0.3,
              0,
              px + ps * 0.15,
              py - ps * 0.3,
              ps * 0.5,
            );
            g.addColorStop(0, "rgba(255,236,190,0.9)");
            g.addColorStop(1, "rgba(255,236,190,0)");
            ctx.fillStyle = g;
            ctx.fillRect(px - ps, py - ps, ps * 2, ps * 2);
          }
        }
        // one figure in the middle with a match held up
        const fx = x + w * 0.52,
          fy = y + h * 0.72;
        ctx.fillStyle = "rgba(30,26,22,1)";
        ctx.beginPath();
        ctx.arc(fx, fy - h * 0.12, h * 0.035, 0, TAU);
        ctx.fill();
        ctx.fillRect(fx - h * 0.04, fy - h * 0.09, h * 0.08, h * 0.15);
        ctx.strokeStyle = "rgba(30,26,22,1)";
        ctx.lineWidth = h * 0.018;
        ctx.beginPath();
        ctx.moveTo(fx + h * 0.03, fy - h * 0.07);
        ctx.lineTo(fx + h * 0.07, fy - h * 0.2);
        ctx.stroke();
        const g2 = ctx.createRadialGradient(
          fx + h * 0.075,
          fy - h * 0.22,
          0,
          fx + h * 0.075,
          fy - h * 0.22,
          h * 0.14,
        );
        g2.addColorStop(0, "rgba(255,248,220,1)");
        g2.addColorStop(1, "rgba(255,240,200,0)");
        ctx.fillStyle = g2;
        ctx.fillRect(fx - h * 0.1, fy - h * 0.4, h * 0.35, h * 0.35);
        X.speckle(ctx, w, h, r, {
          count: 900,
          colors: ["#ffffff", "#000000"],
          min: 0.3,
          max: 0.9,
          alpha: 0.12,
        });
        ctx.restore();
      };
      if (v % 2) {
        // the photograph alone, in a frame
        K.bg(ctx, 400, 600, "solid", "#2a2018");
        ctx.fillStyle = "#e8e2d2";
        ctx.fillRect(28, 60, 344, 420);
        photo(44, 76, 312, 360);
        X.text(ctx, "Grand Central, 9 Nov. 1965", 200, 458, {
          font: "script",
          size: 26,
          weight: "normal",
          color: "#2a3a6a",
          maxW: 300,
        });
        sunRays(ctx, 330, 456, 12, "rgba(40,58,120,0.85)", 1.6, r, {
          wobble: 0.12,
        });
        return;
      }
      paperBg(ctx, "#e6e0cc", r);
      X.text(ctx, "THE METROPOLITAN LEDGER", 200, 30, {
        font: "didone",
        size: 34,
        color: INK,
        maxW: 380,
      });
      ctx.fillStyle = INK;
      ctx.fillRect(14, 50, 372, 2);
      ctx.fillRect(14, 72, 372, 1);
      X.text(
        ctx,
        "NEW YORK, WEDNESDAY, NOVEMBER 10, 1965 · TEN CENTS",
        200,
        62,
        { font: "serif", size: 11, color: INK, maxW: 370 },
      );
      X.text(ctx, "CITY GOES DARK", 200, 108, {
        font: "didone",
        size: 56,
        color: INK,
        maxW: 380,
      });
      X.text(
        ctx,
        "Millions Stranded as Power Fails Across the Northeast",
        200,
        146,
        { font: "serif", size: 17, italic: true, color: INK, maxW: 380 },
      );
      photo(24, 162, 352, 250);
      X.text(
        ctx,
        "Strangers share candles in the darkened concourse at Grand Central.",
        200,
        426,
        { font: "serif", size: 13, italic: true, color: INK, maxW: 370 },
      );
      ctx.fillStyle = "rgba(30,26,22,0.55)";
      for (let c = 0; c < 3; c++)
        for (let l = 0; l < 9; l++)
          ctx.fillRect(24 + c * 120, 446 + l * 15, 108 - (l === 8 ? 40 : 0), 6);
      // a doodle in blue ink in the margin
      sunRays(ctx, 360, 112, 14, "rgba(40,58,120,0.85)", 1.6, r, {
        wobble: 0.12,
      });
    },
    dawn_hour(ctx, v, r) {
      K.bg(ctx, 400, 600, "radial", "#3a2410", "#0e0804", { cx: 200, cy: 220 });
      ctx.save();
      ctx.shadowColor = "#ffc860";
      ctx.shadowBlur = 30;
      A.sunDisc(ctx, 200, 210, 120, { color: "#f2b23a" });
      ctx.restore();
      X.text(ctx, "THE DAWN HOUR", 200, 380, {
        font: "copper",
        size: 44,
        color: "#fff2c8",
        glow: "#ffc860",
        maxW: 370,
      });
      X.text(ctx, "5:47 · EVERY MORNING", 200, 428, {
        font: "typewriter",
        size: 24,
        color: "#f2b23a",
        maxW: 370,
      });
      X.text(ctx, "Somebody has to keep the light on.", 200, 480, {
        font: "serif",
        size: 24,
        italic: true,
        color: "#f4e4c0",
        maxW: 370,
      });
      X.text(ctx, "tune in before the sun · the Glowkeepers", 200, 545, {
        font: "typewriter",
        size: 16,
        color: "#c89a50",
        weight: "normal",
        maxW: 370,
      });
    },
    keep_light(ctx, v, r) {
      K.bg(ctx, 400, 600, "radial", "#8a4a1a", "#1a0a04", { cx: 200, cy: 250 });
      ctx.save();
      ctx.shadowColor = "#ffc860";
      ctx.shadowBlur = 40;
      A.sunDisc(ctx, 200, 240, 140, { color: "#f2b23a" });
      ctx.restore();
      if (v % 2) {
        X.text(ctx, "THE SUN", 200, 440, {
          font: "copper",
          size: 50,
          color: "#fff2c8",
          glow: "#ffc860",
        });
        X.text(ctx, "DOES NOT CHOOSE", 200, 495, {
          font: "copper",
          size: 38,
          color: "#fff2c8",
          glow: "#ffc860",
          maxW: 370,
        });
      } else {
        X.text(ctx, "WE KEEP", 200, 440, {
          font: "copper",
          size: 50,
          color: "#fff2c8",
          glow: "#ffc860",
        });
        X.text(ctx, "THE LIGHT ON", 200, 495, {
          font: "copper",
          size: 44,
          color: "#fff2c8",
          glow: "#ffc860",
          maxW: 370,
        });
      }
      X.text(ctx, "Cathedral of the Second Sun · Fifth Avenue", 200, 556, {
        font: "typewriter",
        size: 18,
        color: "#f2b23a",
        maxW: 380,
      });
    },
    directive_7a(ctx, v, r) {
      paperBg(ctx, "#ece8dc", r);
      ctx.fillStyle = "#1e3266";
      ctx.fillRect(0, 0, 400, 150);
      A.continuity(ctx, 200, 75, 56, {});
      X.text(ctx, "PUBLIC NOTICE", 200, 186, {
        font: "deco",
        size: 36,
        color: "#1e3266",
        spacing: 3,
        maxW: 370,
      });
      X.text(ctx, "DIRECTIVE 7-A", 200, 236, {
        font: "impact",
        size: 52,
        color: "#a8231c",
        maxW: 370,
      });
      X.text(ctx, "PUBLIC HEALTH REGISTRATION", 200, 274, {
        font: "condensed",
        size: 22,
        color: INK,
        spacing: 2,
        maxW: 370,
      });
      typed(
        ctx,
        [
          "All persons not entered on the 1967",
          "enrolment rolls (SCHEDULE C) will",
          "present themselves at the nearest",
          "Continuity post for a health measure.",
          "",
          "Enrolled citizens need take no action.",
        ],
        40,
        312,
        27,
        18,
        INK,
      );
      X.text(
        ctx,
        "By order of the Acting President · 30 November 1988",
        200,
        548,
        {
          font: "typewriter",
          size: 14,
          color: "#3a3026",
          weight: "normal",
          maxW: 370,
        },
      );
    },
    second_sun(ctx, v, r) {
      K.bg(ctx, 400, 600, "sunburst", "#c86a1a", "#e08a2a", {
        cx: 200,
        cy: 230,
        rays: 12,
      });
      ctx.save();
      ctx.shadowColor = "#fff2c8";
      ctx.shadowBlur = 50;
      A.sunDisc(ctx, 200, 230, 150, {
        color: "#fff0c0",
        inner: "#c86a1a",
        core: "#ffffff",
      });
      ctx.restore();
      X.text(ctx, "THE SECOND SUN", 200, 430, {
        font: "copper",
        size: 44,
        color: "#1a0a04",
        maxW: 370,
      });
      X.text(ctx, "SUNDAY · 9:47", 200, 486, {
        font: "impact",
        size: 56,
        color: "#fff2c8",
        stroke: "#1a0a04",
        strokeW: 6,
        maxW: 370,
      });
      X.text(ctx, "Nobody will be chosen. A dimanche.", 200, 548, {
        font: "serif",
        size: 20,
        italic: true,
        color: "#1a0a04",
        maxW: 340,
      });
    },
  });
  // Long Winter was a secret 90-day trial: the old recruitment poster becomes post-1968 Continuity propaganda.
