/* src/textures/41_story.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: the main story's posters, notices, graffiti,
 * decals and lair surfaces (story/outline.json). All original.
 *
 * Posters  (G.tex.poster(id) / G.mats.poster(id), 320×480, torn edges):
 *   match_woman (1968 OCD wanted poster, "THE MATCH WOMAN", sketch of Nicole
 *   at 29; v1 = stamped FILE CLOSED), relief_station (1967 ration notice: no
 *   card, no issue), lower_level_closed (the 1968 OCD order), lost_persons
 *   (Grand Central's March 1967 list: "MEAD, Nicole … INQUIRE TRACK 61"),
 *   blackout_1965 (newspaper, 10 Nov 1965, candles in the dark concourse;
 *   v1 = the photograph alone), dawn_hour (Glowkeeper handbill), keep_light
 *   (WE KEEP THE LIGHT ON; v1 THE SUN DOES NOT CHOOSE), directive_7a
 *   (Continuity notice, Schedule C), second_sun (Sunday 9:47 broadside).
 * Decals   (G.tex.decal(name) / G.mats.decal(name)): graffiti_keep_light,
 *   graffiti_dimanche, graffiti_list, graffiti_ninety_days, graffiti_second_sun,
 *   graffiti_unkindled, chalk_sun, sun_doodle, candle_soot, wax_drips,
 *   candle_shrine, sun_mural (1024²), kindling_stone, pod7_scrap,
 *   sirocco_stencil, track61_stencil, clock_face, clock_face_0931,
 *   clock_face_0947, record_label_two_bits.
 * Surfaces (G.tex.get / G.mats.get): candle_stone, soot_vault, bomb_casing,
 *   converter_iron, knit_blanket.
 * Every Glowkeeper sun is X.art.sunDisc / sunRays: exactly TWELVE rays.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const X = G._tx;
  const A = X.art;
  const K = X.adkit;
  const TAU = Math.PI * 2;
  const INK = "#1d1712";

  // ------------------------------------------------------------------
  // Shared drawing
  // ------------------------------------------------------------------
  /** A hand-drawn twelve-ray sun (doodle / chalk / spray): circle + 12 straight rays, a little wobble. */
  function sunRays(ctx, cx, cy, rad, col, lw, r, o) {
    o = o || {};
    const wob = o.wobble === undefined ? 0.06 : o.wobble,
      rot = o.rot || -Math.PI / 2;
    ctx.save();
    ctx.strokeStyle = X.css(col);
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * TAU,
        k = 1 + (r() - 0.5) * wob;
      const px = cx + Math.cos(a) * rad * 0.5 * k,
        py = cy + Math.sin(a) * rad * 0.5 * k;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = rot + (i / 12) * TAU + (r() - 0.5) * wob * 0.5,
        r0 = rad * (0.62 + (r() - 0.5) * wob),
        r1 = rad * (0.95 + (r() - 0.5) * wob * 2);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.stroke();
    }
    if (o.dot) {
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 0.08, 0, TAU);
      ctx.fillStyle = X.css(col);
      ctx.fill();
    }
    ctx.restore();
  }
  A.sunRays = sunRays;
  /** Typewritten lines (left aligned) from y, step dy. */
  function typed(ctx, lines, x, y, dy, size, col, maxW) {
    lines.forEach((l, i) =>
      X.text(ctx, l, x, y + i * dy, {
        font: "typewriter",
        size,
        color: col || INK,
        align: "left",
        weight: "normal",
        maxW: maxW || 360,
      }),
    );
  }
  /** Pencil/charcoal portrait of a young woman (three-quarter, dark wavy hair, a small gap between the front teeth). */
  function sketchWoman(ctx, cx, cy, s, r) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const pen = (a, w) => {
      ctx.strokeStyle = "rgba(30,26,24," + a + ")";
      ctx.lineWidth = w;
    };
    // hair mass (behind): a dark wavy shoulder-length silhouette, then curved strokes following it
    ctx.fillStyle = "rgba(46,40,36,0.55)";
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.05, cy - s * 0.66);
    ctx.bezierCurveTo(
      cx - s * 0.62,
      cy - s * 0.62,
      cx - s * 0.62,
      cy + s * 0.1,
      cx - s * 0.58,
      cy + s * 0.55,
    );
    ctx.quadraticCurveTo(
      cx - s * 0.5,
      cy + s * 0.72,
      cx - s * 0.32,
      cy + s * 0.62,
    );
    ctx.lineTo(cx + s * 0.4, cy + s * 0.6);
    ctx.quadraticCurveTo(
      cx + s * 0.6,
      cy + s * 0.68,
      cx + s * 0.6,
      cy + s * 0.45,
    );
    ctx.bezierCurveTo(
      cx + s * 0.66,
      cy + s * 0.05,
      cx + s * 0.6,
      cy - s * 0.66,
      cx - s * 0.05,
      cy - s * 0.66,
    );
    ctx.fill();
    for (let k = 0; k < 70; k++) {
      const side = k % 2 ? 1 : -1,
        t = r(),
        x0 = cx + side * s * (0.12 + t * 0.36),
        y0 = cy - s * (0.62 - t * 0.12);
      pen(0.25 + r() * 0.35, 0.8 + r() * 1.2);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(
        x0 + side * s * 0.18,
        y0 + s * 0.3,
        x0 + side * s * (0.02 + r() * 0.1),
        y0 + s * 0.65,
        x0 + side * s * (0.08 + r() * 0.12),
        y0 + s * (0.95 + r() * 0.3),
      );
      ctx.stroke();
    }
    // face oval
    ctx.fillStyle = "rgba(230,222,205,0.9)";
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.03, cy, s * 0.4, s * 0.52, 0.05, 0, TAU);
    ctx.fill();
    pen(0.7, 2.2);
    ctx.beginPath();
    ctx.ellipse(
      cx + s * 0.03,
      cy,
      s * 0.4,
      s * 0.52,
      0.05,
      Math.PI * 0.05,
      Math.PI * 0.95,
    );
    ctx.stroke();
    // fringe swept to one side
    for (let k = 0; k < 22; k++) {
      const x0 = cx - s * 0.3 + k * s * 0.03;
      pen(0.3 + r() * 0.3, 1 + r());
      ctx.beginPath();
      ctx.moveTo(x0, cy - s * 0.6);
      ctx.quadraticCurveTo(
        x0 + s * 0.2,
        cy - s * 0.52,
        x0 + s * (0.34 + r() * 0.08),
        cy - s * (0.36 + r() * 0.06),
      );
      ctx.stroke();
    }
    // brows, eyes
    for (const d of [-1, 1]) {
      const ex = cx + s * 0.03 + d * s * 0.17,
        ey = cy - s * 0.1;
      pen(0.8, 2.6);
      ctx.beginPath();
      ctx.moveTo(ex - s * 0.1, ey - s * 0.09);
      ctx.quadraticCurveTo(ex, ey - s * 0.14, ex + s * 0.1, ey - s * 0.08);
      ctx.stroke();
      pen(0.85, 1.8);
      ctx.beginPath();
      ctx.ellipse(ex, ey, s * 0.075, s * 0.035, 0, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(20,16,14,0.85)";
      ctx.beginPath();
      ctx.arc(ex + s * 0.01, ey, s * 0.024, 0, TAU);
      ctx.fill();
    }
    // nose
    pen(0.55, 1.6);
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.04, cy - s * 0.04);
    ctx.lineTo(cx + s * 0.07, cy + s * 0.12);
    ctx.quadraticCurveTo(
      cx + s * 0.03,
      cy + s * 0.16,
      cx - s * 0.01,
      cy + s * 0.13,
    );
    ctx.stroke();
    // mouth: a half smile, two front teeth with a gap
    const my = cy + s * 0.27;
    pen(0.8, 2);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.13, my);
    ctx.quadraticCurveTo(
      cx + s * 0.03,
      my + s * 0.07,
      cx + s * 0.18,
      my - s * 0.02,
    );
    ctx.stroke();
    ctx.fillStyle = "rgba(245,240,228,0.95)";
    ctx.fillRect(cx - s * 0.03, my + s * 0.004, s * 0.04, s * 0.03);
    ctx.fillRect(cx + s * 0.025, my + s * 0.004, s * 0.04, s * 0.03);
    pen(0.5, 1);
    ctx.strokeRect(cx - s * 0.03, my + s * 0.004, s * 0.04, s * 0.03);
    ctx.strokeRect(cx + s * 0.025, my + s * 0.004, s * 0.04, s * 0.03);
    // the jaw drawn a little too square (Rose: "They drew her chin wrong")
    pen(0.6, 2);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy + s * 0.3);
    ctx.lineTo(cx - s * 0.1, cy + s * 0.5);
    ctx.lineTo(cx + s * 0.18, cy + s * 0.5);
    ctx.lineTo(cx + s * 0.38, cy + s * 0.28);
    ctx.stroke();
    // neck + collar
    pen(0.5, 2);
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.12, cy + s * 0.52);
    ctx.lineTo(cx - s * 0.14, cy + s * 0.75);
    ctx.moveTo(cx + s * 0.16, cy + s * 0.52);
    ctx.lineTo(cx + s * 0.18, cy + s * 0.75);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.5, cy + s * 0.95);
    ctx.lineTo(cx - s * 0.14, cy + s * 0.75);
    ctx.lineTo(cx, cy + s * 0.92);
    ctx.lineTo(cx + s * 0.18, cy + s * 0.75);
    ctx.lineTo(cx + s * 0.55, cy + s * 0.95);
    ctx.stroke();
    // cross-hatching on the shadow side
    pen(0.18, 1);
    for (let k = 0; k < 26; k++) {
      const y = cy - s * 0.35 + k * s * 0.03;
      ctx.beginPath();
      ctx.moveTo(cx + s * 0.22, y);
      ctx.lineTo(cx + s * 0.4, y + s * 0.12);
      ctx.stroke();
    }
    ctx.restore();
  }
  function stamp(ctx, text, x, y, rot, col, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = 0.75;
    X.setFont(ctx, text, size, "stencil", 360, "bold");
    const w = ctx.measureText(text).width;
    ctx.strokeStyle = col;
    ctx.lineWidth = size * 0.1;
    ctx.strokeRect(
      -w / 2 - size * 0.3,
      -size * 0.75,
      w + size * 0.6,
      size * 1.5,
    );
    X.text(ctx, text, 0, 0, {
      font: "stencil",
      size,
      color: col,
      noSafe: true,
    });
    ctx.restore();
  }
  function paperBg(ctx, col, r) {
    K.bg(ctx, 400, 600, "solid", col);
    X.blotches(ctx, 400, 600, r, {
      count: 10,
      color: "#6a5030",
      alpha: 0.12,
      rmin: 20,
      rmax: 90,
    });
  }

  // ------------------------------------------------------------------
  // POSTERS
  // ------------------------------------------------------------------
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
  if (X.EXTRA_POSTERS.long_winter_recruit) {
    X.EXTRA_POSTERS.long_winter_recruit = function (ctx) {
      K.bg(ctx, 400, 600, "solid", "#eef4f6");
      A.cryoPod(ctx, 120, 260, 70, {});
      A.longWinter(ctx, 285, 200, 90, {});
      X.text(ctx, "THEY SLEEP", 200, 430, {
        font: "deco",
        size: 38,
        color: "#1c2e52",
        maxW: 370,
      });
      X.text(ctx, "SO THE NATION MAY WAKE", 200, 475, {
        font: "deco",
        size: 28,
        color: "#e8742a",
        maxW: 370,
      });
      X.text(
        ctx,
        "Office of Civil Defense · Continuity of Government · 1968",
        200,
        540,
        {
          font: "condensed",
          size: 18,
          color: "#1c2e52",
          spacing: 1,
          maxW: 370,
        },
      );
    };
  }

  // ------------------------------------------------------------------
  // DECALS
  // ------------------------------------------------------------------
  const DEC = X.DECALS;
  const SIZE = (X.DECAL_SIZE = X.DECAL_SIZE || {});
  const gold = "#f2b23a";
  function decal(name, size, fn) {
    DEC[name] = fn;
    SIZE[name] = size;
  }
  decal("graffiti_keep_light", 512, (ctx, s, r) => {
    ctx.save();
    ctx.shadowColor = gold;
    ctx.shadowBlur = s * 0.02;
    sunRays(
      ctx,
      s / 2,
      s * 0.3,
      s * 0.2,
      "rgba(242,178,58,0.92)",
      s * 0.022,
      r,
      { wobble: 0.1 },
    );
    ctx.restore();
    X.spray(ctx, "SOMEBODY HAS TO", s / 2, s * 0.64, s * 0.085, gold, r, -0.02);
    X.spray(ctx, "KEEP THE LIGHT ON", s / 2, s * 0.8, s * 0.085, gold, r, 0.01);
  });
  decal("graffiti_dimanche", 256, (ctx, s, r) => {
    sunRays(
      ctx,
      s * 0.5,
      s * 0.3,
      s * 0.18,
      "rgba(244,240,224,0.9)",
      s * 0.02,
      r,
      { wobble: 0.12 },
    );
    X.spray(ctx, "A DIMANCHE", s / 2, s * 0.7, s * 0.14, "#f4f0e0", r, -0.05);
  });
  decal("graffiti_list", 256, (ctx, s, r) => {
    X.spray(ctx, "THE LIST", s / 2, s * 0.4, s * 0.15, "#f4f0e0", r, -0.04);
    X.spray(ctx, "HAS RETURNED", s / 2, s * 0.62, s * 0.11, "#f4f0e0", r, 0.02);
    sunRays(
      ctx,
      s * 0.84,
      s * 0.2,
      s * 0.09,
      "rgba(242,178,58,0.9)",
      s * 0.015,
      r,
      { wobble: 0.12 },
    );
  });
  decal("graffiti_ninety_days", 512, (ctx, s, r) => {
    X.spray(
      ctx,
      "90 DAYS OF WINTER",
      s / 2,
      s * 0.4,
      s * 0.09,
      "#e8eef2",
      r,
      -0.03,
    );
    X.spray(ctx, "& THEN THE SPRING", s / 2, s * 0.58, s * 0.09, gold, r, 0.02);
    sunRays(
      ctx,
      s / 2,
      s * 0.8,
      s * 0.08,
      "rgba(242,178,58,0.9)",
      s * 0.012,
      r,
      { wobble: 0.12 },
    );
  });
  decal("graffiti_second_sun", 512, (ctx, s, r) => {
    ctx.save();
    ctx.shadowColor = gold;
    ctx.shadowBlur = s * 0.03;
    A.sunDisc(ctx, s / 2, s * 0.34, s * 0.24, {
      color: "rgba(242,178,58,0.92)",
      ink: null,
    });
    ctx.restore();
    X.spray(ctx, "SUNDAY 9:47", s / 2, s * 0.78, s * 0.12, "#f4f0e0", r, -0.03);
  });
  decal("graffiti_unkindled", 256, (ctx, s, r) => {
    // a candle crossed out, and the runaways' motto
    ctx.save();
    ctx.strokeStyle = "rgba(230,226,214,0.9)";
    ctx.lineWidth = s * 0.03;
    ctx.lineCap = "round";
    ctx.strokeRect(s * 0.44, s * 0.2, s * 0.12, s * 0.3);
    ctx.beginPath();
    ctx.moveTo(s / 2, s * 0.2);
    ctx.quadraticCurveTo(s * 0.46, s * 0.12, s / 2, s * 0.06);
    ctx.stroke();
    ctx.strokeStyle = "rgba(216,38,26,0.95)";
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.moveTo(s * 0.32, s * 0.08);
    ctx.lineTo(s * 0.68, s * 0.52);
    ctx.stroke();
    ctx.restore();
    X.spray(ctx, "NO CANDLES", s / 2, s * 0.68, s * 0.12, "#d8261a", r, -0.04);
    X.spray(ctx, "SPARKS ONLY", s / 2, s * 0.86, s * 0.11, "#f4f0e0", r, 0.03);
  });
  /** White chalk twelve-ray sun (Track 61 bulkhead, the sealed stair, the Hall of Candles). */
  decal("chalk_sun", 512, (ctx, s, r) => {
    for (let pass = 0; pass < 3; pass++)
      sunRays(
        ctx,
        s / 2 + (r() - 0.5) * 3,
        s / 2 + (r() - 0.5) * 3,
        s * 0.42,
        "rgba(236,234,226," + (0.35 + pass * 0.15) + ")",
        s * (0.012 + pass * 0.004),
        r,
        { wobble: 0.08 },
      );
    // chalk grain: knock holes out of the strokes
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (let k = 0; k < 2600; k++) {
      ctx.fillStyle = "rgba(0,0,0," + (0.3 + r() * 0.6) + ")";
      ctx.fillRect(r() * s, r() * s, 1 + r() * 2, 1 + r() * 2);
    }
    ctx.restore();
  });
  /** Nicole's ballpoint signature: a quick twelve-ray sun in blue ink. */
  decal("sun_doodle", 256, (ctx, s, r) => {
    sunRays(ctx, s / 2, s / 2, s * 0.4, "rgba(36,52,120,0.9)", s * 0.018, r, {
      wobble: 0.14,
    });
  });
  /** A soot plume on a wall above a candle ledge (place with its bottom edge on the ledge). */
  decal("candle_soot", 512, (ctx, s, r) => {
    for (let k = 0; k < 14; k++) {
      const x = s * (0.5 + (r() - 0.5) * 0.25),
        y = s * (0.95 - r() * 0.75),
        w = s * (0.08 + r() * 0.16),
        h = s * (0.25 + r() * 0.4);
      const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h));
      g.addColorStop(0, "rgba(18,14,10," + (0.16 + r() * 0.14) + ")");
      g.addColorStop(1, "rgba(18,14,10,0)");
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(w / Math.max(w, h), h / Math.max(w, h));
      ctx.translate(-x, -y);
      ctx.fillStyle = g;
      ctx.fillRect(
        x - Math.max(w, h),
        y - Math.max(w, h),
        Math.max(w, h) * 2,
        Math.max(w, h) * 2,
      );
      ctx.restore();
    }
    const g = ctx.createLinearGradient(0, s * 0.7, 0, s);
    g.addColorStop(0, "rgba(10,8,6,0)");
    g.addColorStop(1, "rgba(10,8,6,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(s * 0.3, s * 0.7, s * 0.4, s * 0.3);
  });
  function waxDrip(ctx, x, y, len, w, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x - w * 0.35, y + len);
    ctx.arc(x, y + len, w * 0.4, Math.PI, 0, true);
    ctx.lineTo(x + w / 2, y);
    ctx.closePath();
    ctx.fill();
  }
  decal("wax_drips", 256, (ctx, s, r) => {
    const cols = [
      "rgba(238,226,196,0.95)",
      "rgba(226,204,150,0.95)",
      "rgba(200,60,40,0.9)",
      "rgba(246,240,224,0.95)",
    ];
    for (let k = 0; k < 9; k++) {
      ctx.fillStyle = cols[(r() * cols.length) | 0];
      X.smoothBlob(
        ctx,
        s * (0.2 + r() * 0.6),
        s * (0.25 + r() * 0.5),
        s * (0.05 + r() * 0.12),
        s * (0.04 + r() * 0.08),
        r,
        10,
        0.5,
      );
      ctx.fill();
    }
    for (let k = 0; k < 10; k++)
      waxDrip(
        ctx,
        s * (0.15 + r() * 0.7),
        s * 0.5,
        s * (0.08 + r() * 0.35),
        s * (0.02 + r() * 0.03),
        cols[(r() * 2) | 0],
      );
  });
  /** A ledge-full of melted candles under a chalk sun (the sealed stair in mq09; the Hall of Candles). */
  decal("candle_shrine", 512, (ctx, s, r) => {
    sunRays(
      ctx,
      s / 2,
      s * 0.26,
      s * 0.2,
      "rgba(236,234,226,0.75)",
      s * 0.012,
      r,
      { wobble: 0.08 },
    );
    const cols = ["#efe4c8", "#e2cc96", "#f6efe0", "#d8c08a"];
    for (let k = 0; k < 46; k++) {
      const x = s * (0.06 + r() * 0.88),
        base = s * (0.86 + r() * 0.1),
        h = s * (0.04 + r() * 0.18),
        w = s * (0.025 + r() * 0.03),
        c = cols[(r() * cols.length) | 0];
      ctx.fillStyle = c;
      ctx.fillRect(x - w / 2, base - h, w, h);
      for (let d = 0; d < 3; d++)
        waxDrip(
          ctx,
          x + (r() - 0.5) * w,
          base - h,
          h * (0.2 + r() * 0.7),
          w * 0.35,
          c,
        );
      ctx.fillStyle = "rgba(30,24,18,0.9)";
      ctx.fillRect(x - 1, base - h - s * 0.012, 2, s * 0.012);
    }
    ctx.fillStyle = "rgba(232,220,190,0.95)";
    X.smoothBlob(ctx, s / 2, s * 0.95, s * 0.48, s * 0.05, r, 18, 0.3);
    ctx.fill();
  });
  /** The great gilt sun painted across the M42 ceiling: twelve rays, flaking paint, soot at the edges. */
  decal("sun_mural", 1024, (ctx, s, r) => {
    const c = s / 2;
    const glow = ctx.createRadialGradient(c, c, s * 0.1, c, c, s * 0.5);
    glow.addColorStop(0, "rgba(200,120,30,0.5)");
    glow.addColorStop(1, "rgba(200,120,30,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, s, s);
    A.sunDisc(ctx, c, c, s * 0.46, {
      color: "#d89a2a",
      ink: "#3a2408",
      inner: "#8a5a12",
      core: "#f8e2a0",
    });
    // gilt highlights
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let k = 0; k < 300; k++) {
      const a = r() * TAU,
        rr = r() * s * 0.4;
      ctx.fillStyle = "rgba(255,220,140," + (0.05 + r() * 0.1) + ")";
      ctx.fillRect(
        c + Math.cos(a) * rr,
        c + Math.sin(a) * rr,
        2 + r() * 6,
        1 + r() * 2,
      );
    }
    ctx.restore();
    // flaking: chips knocked out of the paint
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (let k = 0; k < 160; k++) {
      X.blobPath(ctx, r() * s, r() * s, 2 + r() * 14, r, 7, 0.7);
      ctx.fillStyle = "rgba(0,0,0," + (0.5 + r() * 0.5) + ")";
      ctx.fill();
    }
    ctx.restore();
    X.blotches(ctx, s, s, r, {
      count: 14,
      color: "#120c06",
      alpha: 0.25,
      rmin: s * 0.04,
      rmax: s * 0.14,
    });
  });
  /** The Kindling stone in St. Patrick's garden. */
  decal("kindling_stone", 512, (ctx, s, r) => {
    ctx.fillStyle = "#7d7a72";
    X.rrect(ctx, s * 0.12, s * 0.08, s * 0.76, s * 0.86, s * 0.08);
    ctx.fill();
    X.speckle(ctx, s, s, r, {
      count: 3000,
      colors: ["#5a5852", "#9a978e", "#6e6b63"],
      min: 0.5,
      max: 2,
      alpha: 0.6,
    });
    ctx.save();
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "#000";
    X.rrect(ctx, s * 0.12, s * 0.08, s * 0.76, s * 0.86, s * 0.08);
    ctx.fill();
    ctx.restore();
    const carve = (t, y, sz) => {
      X.text(ctx, t, s / 2 + 1.5, y + 1.5, {
        font: "copper",
        size: sz,
        color: "rgba(220,216,206,0.5)",
        maxW: s * 0.66,
      });
      X.text(ctx, t, s / 2, y, {
        font: "copper",
        size: sz,
        color: "rgba(36,34,30,0.85)",
        maxW: s * 0.66,
      });
    };
    sunRays(ctx, s / 2, s * 0.25, s * 0.1, "rgba(36,34,30,0.8)", s * 0.012, r, {
      wobble: 0.02,
    });
    carve("NICOLE MEAD", s * 0.46, s * 0.085);
    carve("KINDLED", s * 0.58, s * 0.07);
    carve("5 III 1968", s * 0.7, s * 0.07);
    X.blotches(ctx, s, s, r, {
      count: 6,
      color: "#3a4a1e",
      alpha: 0.25,
      rmin: s * 0.03,
      rmax: s * 0.1,
    });
  });
  decal("pod7_scrap", 256, (ctx, s, r) => {
    ctx.save();
    ctx.translate(s / 2, s / 2);
    ctx.rotate(-0.12);
    ctx.fillStyle = "#e8dfc4";
    X.blobPath(ctx, 0, 0, s * 0.36, r, 9, 0.3);
    ctx.fill();
    X.text(ctx, "pod 7", 0, 0, {
      font: "script",
      size: s * 0.2,
      weight: "normal",
      color: "rgba(36,52,120,0.9)",
      noSafe: true,
    });
    ctx.restore();
    ctx.fillStyle = "rgba(200,180,120,0.35)";
    X.smoothBlob(ctx, s * 0.6, s * 0.6, s * 0.1, s * 0.06, r, 10, 0.4);
    ctx.fill(); // wax spot
  });
  decal("sirocco_stencil", 512, (ctx, s, r) => {
    X.text(ctx, "SIROCCO 2", s / 2, s * 0.38, {
      font: "stencil",
      size: s * 0.16,
      color: "rgba(30,30,28,0.88)",
      maxW: s * 0.92,
    });
    X.text(ctx, "N° 0141 · 1967", s / 2, s * 0.56, {
      font: "stencil",
      size: s * 0.07,
      color: "rgba(30,30,28,0.8)",
      maxW: s * 0.9,
    });
    for (let k = 0; k < 8; k++) {
      ctx.fillStyle = k % 2 ? "rgba(30,30,28,0.85)" : "rgba(220,170,30,0.85)";
      ctx.beginPath();
      const x = s * 0.06 + k * s * 0.11;
      ctx.moveTo(x, s * 0.7);
      ctx.lineTo(x + s * 0.11, s * 0.7);
      ctx.lineTo(x + s * 0.06, s * 0.8);
      ctx.lineTo(x - s * 0.05, s * 0.8);
      ctx.closePath();
      ctx.fill();
    }
    X.blotches(ctx, s, s, r, {
      count: 8,
      color: "#5a3a14",
      alpha: 0.3,
      rmin: s * 0.03,
      rmax: s * 0.1,
    });
  });
  decal("track61_stencil", 512, (ctx, s, r) => {
    X.text(ctx, "TRACK 61", s / 2, s * 0.24, {
      font: "stencil",
      size: s * 0.17,
      color: "rgba(240,236,224,0.9)",
      maxW: s * 0.9,
    });
    X.text(ctx, "NO ADMITTANCE", s / 2, s * 0.44, {
      font: "stencil",
      size: s * 0.09,
      color: "rgba(210,50,30,0.9)",
      maxW: s * 0.9,
    });
    X.text(ctx, "O.C.D. 1968", s / 2, s * 0.58, {
      font: "stencil",
      size: s * 0.07,
      color: "rgba(240,236,224,0.85)",
      maxW: s * 0.9,
    });
    for (const [x, y, z] of [
      [0.2, 0.8, 0.09],
      [0.5, 0.84, 0.07],
      [0.8, 0.78, 0.1],
    ])
      sunRays(ctx, s * x, s * y, s * z, "rgba(236,234,226,0.8)", s * 0.008, r, {
        wobble: 0.1,
      });
  });
  /** Opal-glass four-face clock face (Grand Central's information booth). hands: [h, m] or none. */
  function clockFace(ctx, s, r, hands) {
    const c = s / 2;
    const g = ctx.createRadialGradient(c, c * 0.9, s * 0.05, c, c, s * 0.48);
    g.addColorStop(0, "#fff6e0");
    g.addColorStop(1, "#e8dcc0");
    ctx.fillStyle = "#8a6a2a";
    ctx.beginPath();
    ctx.arc(c, c, s * 0.49, 0, TAU);
    ctx.fill();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(c, c, s * 0.45, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#2a2018";
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * TAU,
        big = i % 5 === 0;
      ctx.lineWidth = big ? s * 0.012 : s * 0.004;
      ctx.beginPath();
      ctx.moveTo(
        c + Math.cos(a) * s * (big ? 0.36 : 0.4),
        c + Math.sin(a) * s * (big ? 0.36 : 0.4),
      );
      ctx.lineTo(c + Math.cos(a) * s * 0.43, c + Math.sin(a) * s * 0.43);
      ctx.stroke();
    }
    for (let n = 1; n <= 12; n++) {
      const a = (n / 12) * TAU - Math.PI / 2;
      X.text(
        ctx,
        String(n),
        c + Math.cos(a) * s * 0.3,
        c + Math.sin(a) * s * 0.3,
        { font: "serif", size: s * 0.07, color: "#2a2018", noSafe: true },
      );
    }
    if (hands) {
      const hand = (frac, len, w) => {
        const a = frac * TAU - Math.PI / 2;
        ctx.strokeStyle = "#1a1410";
        ctx.lineWidth = w;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(c - Math.cos(a) * len * 0.15, c - Math.sin(a) * len * 0.15);
        ctx.lineTo(c + Math.cos(a) * len, c + Math.sin(a) * len);
        ctx.stroke();
      };
      hand(((hands[0] % 12) + hands[1] / 60) / 12, s * 0.22, s * 0.025);
      hand(hands[1] / 60, s * 0.34, s * 0.016);
      ctx.fillStyle = "#1a1410";
      ctx.beginPath();
      ctx.arc(c, c, s * 0.02, 0, TAU);
      ctx.fill();
    }
    X.blotches(ctx, s, s, r, {
      count: 5,
      color: "#5a4020",
      alpha: 0.15,
      rmin: s * 0.05,
      rmax: s * 0.15,
    });
  }
  decal("clock_face", 512, (ctx, s, r) => clockFace(ctx, s, r, null));
  decal("clock_face_0931", 512, (ctx, s, r) => clockFace(ctx, s, r, [9, 31]));
  decal("clock_face_0947", 512, (ctx, s, r) => clockFace(ctx, s, r, [9, 47]));
  decal("record_label_two_bits", 256, (ctx, s, r) => {
    const c = s / 2;
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(c, c, s * 0.5, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(80,80,80,0.5)";
    ctx.lineWidth = 1;
    for (let k = 0; k < 30; k++) {
      ctx.beginPath();
      ctx.arc(c, c, s * (0.22 + k * 0.009), 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = "#b8231c";
    ctx.beginPath();
    ctx.arc(c, c, s * 0.2, 0, TAU);
    ctx.fill();
    X.text(ctx, "LINDALE", c, c - s * 0.12, {
      font: "deco",
      size: s * 0.045,
      color: "#f4e8c8",
      noSafe: true,
    });
    X.text(ctx, "TWO BITS AND A KISS", c, c + s * 0.07, {
      font: "condensed",
      size: s * 0.045,
      color: "#f4e8c8",
      maxW: s * 0.34,
      noSafe: true,
    });
    X.text(ctx, "Ruby Castellano", c, c + s * 0.12, {
      font: "serif",
      size: s * 0.035,
      italic: true,
      color: "#f4e8c8",
      maxW: s * 0.3,
      noSafe: true,
    });
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(c, c, s * 0.03, 0, TAU);
    ctx.fill();
  });

  // ------------------------------------------------------------------
  // SURFACES (tileable)
  // ------------------------------------------------------------------
  /** Limestone ledges and floor of the Hall of Candles: wax pooled and dripped, soot, grit. */
  X.def("candle_stone", {
    w: 512,
    meters: 3,
    normal: 1.6,
    rough: 0.8,
    desc: "stone ledges / floor thick with candle wax and soot",
    gen(ctx, w, h, r, hc) {
      X.paintSurface && X.GEN.stone_limestone
        ? ctx.drawImage(
            X.paintSurface("stone_limestone", X.GEN.stone_limestone).c,
            0,
            0,
            w,
            h,
          )
        : ((ctx.fillStyle = "#b8b09a"), ctx.fillRect(0, 0, w, h));
      X.blotches(ctx, w, h, r, {
        count: 16,
        color: "#1a140e",
        alpha: 0.35,
        rmin: w * 0.04,
        rmax: w * 0.16,
      });
      const cols = ["#efe4c8", "#e2cc96", "#f6efe0", "#c8341e"];
      for (let k = 0; k < 70; k++) {
        const x = r() * w,
          y = r() * h,
          rad = 4 + Math.pow(r(), 2) * 40,
          col = cols[(r() * (r() < 0.1 ? 4 : 3)) | 0];
        X.wrap(w, h, x, y, rad * 1.3, (xx, yy) => {
          ctx.fillStyle = X.css(col, 0.95);
          X.smoothBlob(ctx, xx, yy, rad, rad * (0.6 + r() * 0.4), r, 10, 0.5);
          ctx.fill();
          if (hc) {
            hc.fillStyle = "#9a9a9a";
            X.smoothBlob(hc, xx, yy, rad, rad * 0.8, r, 10, 0.5);
            hc.fill();
          }
        });
      }
      X.speckle(ctx, w, h, r, {
        count: 1500,
        colors: ["#2a2218", "#d8ccb0"],
        min: 0.4,
        max: 1.4,
        alpha: 0.5,
      });
    },
  });
  /** A vault blackened by decades of candle smoke (walls / arched ceilings). */
  X.def("soot_vault", {
    w: 512,
    meters: 4,
    normal: 1.4,
    rough: 0.92,
    desc: "brick/stone vault blackened by candle smoke",
    gen(ctx, w, h, r, hc) {
      X.paintSurface && X.GEN.stone_limestone
        ? ctx.drawImage(
            X.paintSurface("stone_limestone", X.GEN.stone_limestone).c,
            0,
            0,
            w,
            h,
          )
        : ((ctx.fillStyle = "#9a9282"), ctx.fillRect(0, 0, w, h));
      ctx.fillStyle = "rgba(16,12,8,0.62)";
      ctx.fillRect(0, 0, w, h);
      X.blotches(ctx, w, h, r, {
        count: 30,
        color: "#060402",
        alpha: 0.5,
        rmin: w * 0.05,
        rmax: w * 0.22,
      });
      X.streaks(ctx, w, h, r, {
        count: 24,
        color: "#5a4a30",
        alpha: 0.12,
        maxLen: h * 0.5,
        maxW: 10,
      });
      X.speckle(ctx, w, h, r, {
        count: 800,
        colors: ["#8a7a5a", "#000000"],
        min: 0.4,
        max: 1.2,
        alpha: 0.35,
      });
    },
  });
  /** The Second Sun's casing: pale grey-green paint over steel, panel seams, rivets, chips (stencil with decal sirocco_stencil). */
  X.def("bomb_casing", {
    w: 512,
    meters: 2,
    normal: 1.8,
    rough: 0.6,
    metal: 0.4,
    desc: "pale painted steel bomb casing: seams, rivets, chips, leak stains",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#9aa48e";
      ctx.fillRect(0, 0, w, h);
      X.blotches(ctx, w, h, r, {
        count: 20,
        color: "#c8ccb8",
        alpha: 0.25,
        rmin: w * 0.05,
        rmax: w * 0.2,
      });
      ctx.strokeStyle = "rgba(40,44,36,0.7)";
      ctx.lineWidth = 2;
      for (const y of [0, h / 2]) {
        ctx.beginPath();
        ctx.moveTo(0, y + 1);
        ctx.lineTo(w, y + 1);
        ctx.stroke();
        if (hc) {
          hc.fillStyle = "#505050";
          hc.fillRect(0, y, w, 3);
        }
      }
      for (const y of [0, h / 2])
        for (let x = 8; x < w; x += 32)
          for (const dy of [-8, 10]) {
            ctx.fillStyle = "#7a846e";
            ctx.beginPath();
            ctx.arc(x, y + dy, 3.2, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "rgba(240,244,230,0.5)";
            ctx.beginPath();
            ctx.arc(x - 1, y + dy - 1, 1.3, 0, TAU);
            ctx.fill();
            if (hc) {
              hc.fillStyle = "#b0b0b0";
              hc.beginPath();
              hc.arc(x, y + dy, 3.2, 0, TAU);
              hc.fill();
            }
          }
      for (let k = 0; k < 40; k++) {
        const x = r() * w,
          y = r() * h,
          s = 2 + r() * 8;
        X.wrap(w, h, x, y, s, (xx, yy) => {
          X.blobPath(ctx, xx, yy, s, r, 8, 0.7);
          ctx.fillStyle = "#5a5e56";
          ctx.fill();
        });
      }
      X.streaks(ctx, w, h, r, {
        count: 14,
        color: "#6a5a20",
        alpha: 0.25,
        maxLen: h * 0.35,
        maxW: 6,
      });
    },
  });
  /** 1913 rotary converter housing: black enamel over cast iron, brass edge wear, rust blooms. */
  X.def("converter_iron", {
    w: 512,
    meters: 2,
    normal: 1.6,
    rough: 0.55,
    metal: 0.6,
    desc: "black enamelled cast iron, worn to metal at the edges, rust blooms",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#16161a";
      ctx.fillRect(0, 0, w, h);
      X.blotches(ctx, w, h, r, {
        count: 24,
        color: "#3a3a40",
        alpha: 0.35,
        rmin: w * 0.03,
        rmax: w * 0.14,
      });
      X.blotches(ctx, w, h, r, {
        count: 10,
        color: "#6a3414",
        alpha: 0.4,
        rmin: w * 0.02,
        rmax: w * 0.08,
        pow: 2,
      });
      X.speckle(ctx, w, h, r, {
        count: 1200,
        colors: ["#8a8a90", "#2a1a10"],
        min: 0.4,
        max: 1.2,
        alpha: 0.4,
      });
      X.streaks(ctx, w, h, r, {
        count: 10,
        color: "#5a2a10",
        alpha: 0.25,
        maxLen: h * 0.3,
        maxW: 5,
      });
    },
  });
  /** Hand-knitted wool (the cradle blanket): stocking stitch in cream with a rose stripe. */
  X.def("knit_blanket", {
    w: 256,
    meters: 0.4,
    normal: 1.2,
    rough: 1,
    desc: "hand-knitted wool, cream with a rose stripe",
    gen(ctx, w, h, r, hc) {
      ctx.fillStyle = "#e8dcc4";
      ctx.fillRect(0, 0, w, h);
      const sw = 16,
        sh = 16;
      for (let y = 0; y < h; y += sh)
        for (let x = 0; x < w; x += sw) {
          const stripe = ((y / sh) | 0) % 8 >= 5 && ((y / sh) | 0) % 8 <= 6;
          const col = stripe ? "#c87a7a" : "#efe4cc";
          for (const d of [-1, 1]) {
            ctx.fillStyle = X.css(X.shade(col, (r() - 0.5) * 0.12));
            ctx.beginPath();
            ctx.ellipse(
              x + sw / 2 + d * 3.5,
              y + sh / 2,
              4,
              7,
              d * 0.5,
              0,
              TAU,
            );
            ctx.fill();
            if (hc) {
              hc.fillStyle = "#b8b8b8";
              hc.beginPath();
              hc.ellipse(
                x + sw / 2 + d * 3.5,
                y + sh / 2,
                3,
                6,
                d * 0.5,
                0,
                TAU,
              );
              hc.fill();
            }
          }
        }
    },
  });
})();
