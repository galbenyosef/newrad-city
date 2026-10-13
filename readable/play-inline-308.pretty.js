/* src/poi_eastside/25_tudor_story.js */
/* =====================================================================
 * NEW RAD CITY — POI EASTSIDE · 25 Tudor City: the main story's rooms
 * (story/outline.json: mq07 "The Court of Tudor City", mq18, mq29, mq32)
 *
 * Additions to Tudor City (20_tudor_city.js builds the Court):
 *   - APARTMENT 9C, upstairs from the Court ("Stair — Upper Floors"):
 *     Nicole Mead's and Nell Brady's apartment, shut since 1968 and used as
 *     a bolt-hole by "Flint" (Rose). Nicole's calendar, Nell's desk, the
 *     record player, the bedroom alcove, the window onto the fire escape
 *     (a door to the roof, beside Rose's nook).
 *   - SOL'S DESK: the doorman's desk in the mail & elevator hall (lobby).
 *   - ROSE'S NOOK: a lean-to on the tower roof behind the TUDOR CITY sign,
 *     north of the penthouse, beside the sign's breaker. Rose is the Court's
 *     "Royal Lamplighter": she keeps the sign lit and holds the roof.
 *   - THE FIRE ESCAPE: a drop-ladder on the tower's south face, terrace ⇄ roof
 *     (the outline's "come in via the roof sign": roof → 9C window, no Court).
 *   - The big sign is LIT now (the Lamplighter keeps it so) + glow sprites.
 * The main story (src/quests) spawns Sol, Rose and the Unkindled and places
 * the clue notes at these anchors (G.pois.getAnchor('tudor_city', name)):
 *   apt_9c, apt_9c_calendar, apt_9c_desk, apt_9c_record, apt_9c_window, apt_9c_bed,
 *   sol_desk, rose_nook, unkindled1..4, dawn_gantry (the Windsor-wing sign, across the gap),
 *   fire_escape_bottom, fire_escape_top, court_stair (the Court end of the 9C stair).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pe) return;
  const P = G._pe,
    D = P.dress,
    E = P.dress2;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  const TC = (P.tc = P.tc || {});
  // keep in step with 20_tudor_city.js
  const TY = 4.5,
    AX0 = 312,
    AX1 = 328,
    AZ0 = -176,
    AZ1 = -158,
    ATOP = 64,
    BZ1 = -165,
    BTOP = 40,
    F3 = 10;
  const Y9 = 30; // apartment 9C floor level in the cell (a separate storey, reached by a door)

  // ------------------------------------------------------------------
  // textures
  // ------------------------------------------------------------------
  function calendarTex() {
    return P.texMat(
      "tc_9c_calendar",
      P.canvasTex("tc_9c_calendar", 256, 360, (x, w, h) => {
        x.fillStyle = "#efe6cc";
        x.fillRect(0, 0, w, h);
        x.fillStyle = "#7a2a22";
        x.fillRect(0, 0, w, 96);
        x.fillStyle = "#f4ecd4";
        x.textAlign = "center";
        x.font = "bold 18px " + P.FONTS.SERIF;
        x.fillText("TUDOR CITY PHARMACY", w / 2, 26);
        x.font = "italic 13px " + P.FONTS.SERIF;
        x.fillText(
          '"Your Neighbourhood Druggist" · MUrray Hill 2-0417',
          w / 2,
          46,
        );
        x.font = "bold 30px " + P.FONTS.SERIF;
        x.fillText("MARCH 1967", w / 2, 84);
        x.fillStyle = "#2a2218";
        x.font = "bold 11px " + P.FONTS.SANS;
        const days = ["S", "M", "T", "W", "T", "F", "S"];
        for (let i = 0; i < 7; i++) x.fillText(days[i], 22 + i * 35, 116);
        x.font = "15px " + P.FONTS.SERIF;
        // March 1967 starts on a Wednesday
        for (let d = 1; d <= 31; d++) {
          const c = (d + 2) % 7,
            r = Math.floor((d + 2) / 7);
          const cx = 22 + c * 35,
            cy = 142 + r * 34;
          x.fillStyle = "#2a2218";
          x.fillText(String(d), cx, cy);
          if (d === 4) {
            x.strokeStyle = "#b8261e";
            x.lineWidth = 2.5;
            x.beginPath();
            x.ellipse(cx, cy - 5, 15, 12, 0, 0, TAU);
            x.stroke();
            x.fillStyle = "#b8261e";
            x.font = "bold 10px " + P.FONTS.SANS;
            x.fillText("OUI!!", cx, cy + 12);
            x.font = "15px " + P.FONTS.SERIF;
          }
          if (d === 5) {
            x.strokeStyle = "rgba(40,30,20,0.5)";
            x.lineWidth = 1;
            x.beginPath();
            x.moveTo(cx - 12, cy - 14);
            x.lineTo(cx + 12, cy + 6);
            x.stroke();
          }
        }
        // the twelve-ray sun doodled in the margin
        const sx = w - 34,
          sy = h - 30;
        x.strokeStyle = "#1e3a7a";
        x.lineWidth = 1.6;
        x.beginPath();
        x.arc(sx, sy, 6, 0, TAU);
        x.stroke();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU;
          x.beginPath();
          x.moveTo(sx + Math.cos(a) * 9, sy + Math.sin(a) * 9);
          x.lineTo(sx + Math.cos(a) * 15, sy + Math.sin(a) * 15);
          x.stroke();
        }
        P.blotches(x, w, h, P.rng("cal9c"), 14, 0.18);
      }),
      { rough: 0.9 },
    );
  }
  function windowTex() {
    // the view from 9C: 42nd Street at dusk, the dark slab of the Secretariat, a red glow from the sign above
    return P.texMat(
      "tc_9c_view",
      P.canvasTex(
        "tc_9c_view",
        512,
        384,
        (x, w, h) => {
          const g = x.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#2a2438");
          g.addColorStop(0.55, "#6a3a3a");
          g.addColorStop(1, "#1a1418");
          x.fillStyle = g;
          x.fillRect(0, 0, w, h);
          const r = P.rng("9cview");
          for (let i = 0; i < 70; i++) {
            x.fillStyle = "rgba(255,240,220," + r() * 0.6 + ")";
            x.fillRect(r() * w, r() * h * 0.4, 1.5, 1.5);
          }
          x.fillStyle = "#121016";
          x.fillRect(w * 0.55, h * 0.18, w * 0.22, h * 0.82); // the Secretariat slab
          for (let yy = h * 0.2; yy < h; yy += 9)
            for (let xx = w * 0.56; xx < w * 0.76; xx += 7)
              if (r() < 0.04) {
                x.fillStyle = "#e8c070";
                x.fillRect(xx, yy, 3, 4);
              }
          let xx = 0;
          while (xx < w) {
            const bw = 20 + r() * 50,
              bh = 60 + r() * 140;
            x.fillStyle = "#0e0c12";
            x.fillRect(xx, h - bh, bw, bh);
            xx += bw + 3;
          }
          const rg = x.createRadialGradient(w * 0.2, 0, 0, w * 0.2, 0, h * 0.7);
          rg.addColorStop(0, "rgba(255,60,40,0.55)");
          rg.addColorStop(1, "rgba(255,60,40,0)");
          x.fillStyle = rg;
          x.fillRect(0, 0, w, h);
        },
        { clamp: true },
      ),
      { emissive: 0.85, rough: 1 },
    );
  }
  function sunScratchTex() {
    return P.texMat(
      "tc_9c_sun",
      P.canvasTex(
        "tc_9c_sun",
        256,
        256,
        (x, w, h) => {
          x.clearRect(0, 0, w, h);
          const c = w / 2;
          x.strokeStyle = "rgba(232,220,190,0.85)";
          x.lineWidth = 5;
          x.beginPath();
          x.arc(c, c, 34, 0, TAU);
          x.stroke();
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * TAU;
            x.beginPath();
            x.moveTo(c + Math.cos(a) * 46, c + Math.sin(a) * 46);
            x.lineTo(c + Math.cos(a) * 96, c + Math.sin(a) * 96);
            x.stroke();
          }
          x.strokeStyle = "rgba(30,24,20,0.9)";
          x.lineWidth = 9; // crossed out, hard
          x.beginPath();
          x.moveTo(30, 30);
          x.lineTo(w - 30, h - 30);
          x.moveTo(w - 30, 30);
          x.lineTo(30, h - 30);
          x.stroke();
        },
        { clamp: true },
      ),
      { transparent: true, rough: 1 },
    );
  }

  // ------------------------------------------------------------------
  // INTERIOR: apartment 9C + Sol's desk + the Court end of the stair
  // ------------------------------------------------------------------
  function buildInterior() {
    const O = P.I("tudor_city");
    const S = P.site("tc_story_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x4e4844,
      ambI: 0.36,
      interiorKey: "tudor_city",
    });
    const b = S.b;

    // ---------- the Court: a door to the upper floors (north wall, east of the dais) ----------
    b.box("wood_dark", 9.8, F3, -13.86, 11.2, F3 + 2.3, -13.78, { seg: false });
    b.box("wood_oak", 9.6, F3 + 2.3, -13.9, 11.4, F3 + 2.45, -13.72, {
      seg: false,
    });
    for (const xx of [9.65, 11.35])
      b.box("wood_oak", xx - 0.08, F3, -13.9, xx + 0.08, F3 + 2.3, -13.72, {
        seg: false,
      });
    b.box("brass", 11.0, F3 + 1.0, -13.74, 11.08, F3 + 1.08, -13.68, {
      seg: false,
      noAO: true,
    });
    D.label(
      b,
      "tc_upstairs",
      ["STAIR", "UPPER FLOORS · 4–11"],
      10.5,
      F3 + 2.75,
      -13.7,
      1.0,
      0.36,
      0,
      "brass",
    );

    // ---------- SOL'S DESK (mail & elevator hall) ----------
    E.desk(b, 14.8, 0, 15.3, PI, { w: 1.7, typewriter: false });
    S.col(13.95, 0, 14.92, 15.65, 0.8, 15.68, { walkable: false });
    D.chair(b, 14.8, 0, 16.3, PI, { seat: "leather", wood: "wood_dark" });
    E.deskLamp(S, 14.2, 0.765, 15.2, true);
    E.phone(b, 15.4, 0.765, 15.3, 0.4);
    b.box("wood_oak", 15.0, 0.765, 14.95, 15.5, 0.81, 15.3, {
      seg: false,
      noAO: true,
    }); // the logbook
    b.box("paper", 15.05, 0.81, 15.0, 15.45, 0.815, 15.25, {
      seg: false,
      noAO: true,
    });
    // doorman's cap on a hook + the key board with one empty hook (9C)
    b.rod("brass", [17.8, 1.9, 16.6], [17.6, 1.9, 16.6], 0.015, 4);
    b.cyl("paint_blue", 17.55, 1.8, 16.6, 0.13, 0.14, 0.09, 12, { noAO: true });
    b.box("wood_dark", 17.82, 1.2, 14.2, 17.88, 1.9, 15.6, { seg: false });
    for (let i = 0; i < 12; i++) {
      const kx = 14.35 + (i % 6) * 0.2,
        ky = 1.75 - Math.floor(i / 6) * 0.3;
      if (i === 8) continue;
      b.rod("brass", [17.8, ky, kx], [17.7, ky - 0.08, kx], 0.012, 3, {
        noAO: true,
      });
    }
    D.label(
      b,
      "tc_frontdesk",
      ["TUDOR CITY", "FRONT DESK · S. ABRAMOWITZ"],
      14.8,
      1.25,
      14.88,
      1.1,
      0.34,
      PI,
      "brass",
    );
    S.light(14.2, 1.3, 15.4, 0xffd8a0, 4.5, 0.7);

    // ---------- APARTMENT 9C ----------
    const X0 = 24,
      X1 = 36,
      Z0 = -8,
      Z1 = 4,
      H = 3.0;
    S.light(34.6, Y9 + 0.7, 1.4, 0xffc070, 6, 0.75); // Flint's battery lantern by the window
    S.light(35.2, Y9 + 1.6, 1.0, 0xff6a50, 6, 0.55); // the sign's red glow through the window
    S.light(27, Y9 + 2.4, -4, 0xcac2b4, 7, 0.35); // grey daylight, soft
    S.light(33, Y9 + 2.2, -5.5, 0xbab2a8, 4, 0.3);
    S.room({
      x0: X0,
      z0: Z0,
      x1: X1,
      z1: Z1,
      y: Y9,
      h: H,
      wall: "wallpaper_rose",
      floor: "parquet",
      ceil: "plaster",
      trim: "wood_dark",
      holes: { w: [[-2.6, -1.4, 0, 2.2]], e: [[-0.6, 2.6, 0.9, 2.3]] },
    });
    // the bedroom alcove partition (x 30..36, z -8..-3) with a doorway
    S.wallZ("wallpaper_rose", 30, Z0, -3, Y9, Y9 + H, 0.15, [
      [-6.2, -5.0, 0, 2.15],
    ]);
    S.wallX("wallpaper_rose", -3, 30, X1, Y9, Y9 + H, 0.15, [
      [30.4, 31.6, 0, 2.15],
    ]);
    // entrance door (west, from the stair): frame + chain lock hanging loose
    b.box("wood_dark", X0 - 0.08, Y9, -2.6, X0 + 0.04, Y9 + 2.2, -2.5, {
      seg: false,
    });
    b.box("wood_dark", X0 - 0.08, Y9 + 2.2, -2.7, X0 + 0.04, Y9 + 2.32, -1.3, {
      seg: false,
    });
    D.label(
      b,
      "tc_9c_door",
      ["9C"],
      X0 + 0.2,
      Y9 + 1.75,
      -2.85,
      0.24,
      0.16,
      HP,
      "brass",
    );
    // the window (east): two sashes, a sill, the painted view behind, the fire-escape platform outside
    b.quad(windowTex(), X1 + 0.6, Y9 + 1.6, 1.0, 3.6, 2.2, { ry: -HP });
    for (const zz of [-0.6, 1.0, 2.6])
      b.box(
        "wood",
        X1 - 0.08,
        Y9 + 0.9,
        zz - 0.05,
        X1 + 0.05,
        Y9 + 2.3,
        zz + 0.05,
        { seg: false },
      );
    b.box("wood", X1 - 0.08, Y9 + 1.58, -0.6, X1 + 0.05, Y9 + 1.64, 2.6, {
      seg: false,
    });
    b.box("wood_oak", X1 - 0.3, Y9 + 0.86, -0.7, X1 + 0.1, Y9 + 0.92, 2.7, {
      seg: false,
    }); // sill
    b.box("glass", X1 + 0.02, Y9 + 1.64, 1.05, X1 + 0.03, Y9 + 2.25, 2.55, {
      seg: false,
      noAO: true,
    });
    S.col(X1 - 0.05, Y9 + 0.85, -0.7, X1 + 0.1, Y9 + 2.4, 2.7, {
      walkable: false,
    }); // nobody falls out of the window: the way out is the door below   // the upper sash (the lower one is up: the way out)
    for (let i = 0; i < 6; i++)
      b.box(
        "iron",
        X1 + 0.2,
        Y9 + 0.88,
        -0.8 + i * 0.7,
        X1 + 1.2,
        Y9 + 0.92,
        -0.75 + i * 0.7,
        { seg: false },
      );
    b.rod(
      "iron",
      [X1 + 1.2, Y9 + 0.9, -0.8],
      [X1 + 1.2, Y9 + 1.9, -0.8],
      0.02,
      4,
    );
    b.rod(
      "iron",
      [X1 + 1.2, Y9 + 0.9, 2.7],
      [X1 + 1.2, Y9 + 1.9, 2.7],
      0.02,
      4,
    );
    b.rod(
      "iron",
      [X1 + 1.2, Y9 + 1.9, -0.8],
      [X1 + 1.2, Y9 + 1.9, 2.7],
      0.02,
      4,
    );
    b.rod(
      "fabric",
      [X1 + 0.9, Y9 + 0.9, 2.2],
      [X1 + 0.9, Y9 + 3.4, 2.2],
      0.03,
      4,
    ); // a knotted rope up toward the roof
    // kitchenette (north-west)
    b.box("paint_cream", X0 + 0.2, Y9, Z0 + 0.2, X0 + 4.4, Y9 + 0.9, Z0 + 0.8, {
      seg: false,
    });
    b.box(
      "marble",
      X0 + 0.15,
      Y9 + 0.9,
      Z0 + 0.15,
      X0 + 4.45,
      Y9 + 0.95,
      Z0 + 0.85,
      { seg: false, noAO: true },
    );
    b.box("paint_white", X0 + 4.6, Y9, Z0 + 0.2, X0 + 5.4, Y9 + 1.6, Z0 + 0.9, {
      seg: false,
    }); // the icebox
    b.box(
      "chrome",
      X0 + 5.3,
      Y9 + 0.9,
      Z0 + 0.88,
      X0 + 5.34,
      Y9 + 1.3,
      Z0 + 0.92,
      { seg: false, noAO: true },
    );
    b.cyl("chrome", X0 + 1.2, Y9 + 0.95, Z0 + 0.5, 0.1, 0.12, 0.18, 10, {
      noAO: true,
    }); // the kettle
    b.box(
      "paint_black",
      X0 + 2.4,
      Y9 + 0.95,
      Z0 + 0.25,
      X0 + 3.4,
      Y9 + 0.98,
      Z0 + 0.75,
      { seg: false, noAO: true },
    );
    for (let i = 0; i < 4; i++)
      b.cyl(
        "paint_white",
        X0 + 3.6 + (i % 2) * 0.18,
        Y9 + 0.95 + Math.floor(i / 2) * 0.03,
        Z0 + 0.5,
        0.09,
        0.08,
        0.03,
        10,
        { noAO: true },
      );
    // Nicole's calendar on the north wall (March 1967, the 4th circled), a UN poster beside it
    b.quad(calendarTex(), 29.2, Y9 + 1.6, Z0 + 0.17, 0.5, 0.7, { ry: 0 });
    const unp = P.texMat(
      "tc_9c_unposter",
      P.signTex(
        "tc_9c_unposter",
        ["UNITED NATIONS", "NEW YORK · 1966", "Interpreters' Benefit"],
        "poster",
        256,
        360,
        { bg: "#d8e0e4", fg: "#1e3a6a" },
      ),
      { rough: 0.9 },
    );
    b.quad(unp, 27.8, Y9 + 1.7, Z0 + 0.17, 0.55, 0.78, { ry: 0 });
    // the sitting room: sofa under a dust sheet, armchair, rug, coffee table, coat rack
    D.rug(b, 26.5, -1.5, 33.5, 3.2, Y9 + 0.012, "carpet");
    D.sofa(b, 29.6, Y9, 1.2, HP, { fabric: "fabric_white", w: 2.0 });
    D.table(b, 31.6, Y9, 1.0, {
      rect: [0.7, 1.2],
      h: 0.42,
      top: "wood_oak",
      leg: "wood_dark",
    });
    b.box("paper", 31.4, Y9 + 0.42, 0.7, 31.8, Y9 + 0.43, 1.05, {
      seg: false,
      noAO: true,
    }); // a folded World-Telegram
    D.chair(b, 32.6, Y9, -1.4, -2.4, { seat: "velvet", arms: true });
    b.rod(
      "wood_dark",
      [X0 + 0.6, Y9, 2.9],
      [X0 + 0.6, Y9 + 1.85, 2.9],
      0.03,
      6,
    );
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU;
      b.rod(
        "wood_dark",
        [X0 + 0.6, Y9 + 1.75, 2.9],
        [X0 + 0.6 + Math.cos(a) * 0.22, Y9 + 1.65, 2.9 + Math.sin(a) * 0.22],
        0.012,
        3,
      );
    }
    b.geo(
      "fabric",
      new THREE.BoxGeometry(0.42, 0.9, 0.12).translate(0, -0.45, 0),
      P.m4(X0 + 0.82, Y9 + 1.7, 2.9, 0.4),
      { noAO: true, grime: 0.4 },
    ); // a man's grey scarf, left behind
    // Nell's desk (south wall, west): typewriter, press card, clippings pinned above
    E.desk(b, 25.9, Y9, 3.45, PI, { w: 1.5 });
    D.chair(b, 25.9, Y9, 2.6, PI, { seat: "wood", wood: "wood" });
    const clip = P.texMat(
      "tc_9c_clips",
      P.signTex(
        "tc_9c_clips",
        [
          "WORLD-TELEGRAM",
          "N. BRADY — STAFF",
          "\"Blackwell's, committed Feb 19.",
          'Long Winter?"',
        ],
        "label",
        384,
        256,
      ),
      { rough: 0.9 },
    );
    b.quad(clip, 25.9, Y9 + 1.55, Z1 - 0.17, 0.8, 0.53, { ry: PI });
    // the record player on the sideboard (south wall, east)
    b.box("wood_oak", 31.2, Y9, Z1 - 0.62, 33.4, Y9 + 0.82, Z1 - 0.15, {
      seg: false,
    });
    b.box("wood_dark", 31.5, Y9 + 0.82, Z1 - 0.58, 32.3, Y9 + 0.95, Z1 - 0.2, {
      seg: false,
    });
    b.cyl("paint_black", 31.9, Y9 + 0.95, Z1 - 0.39, 0.15, 0.15, 0.01, 20, {
      noAO: true,
    });
    b.cyl("paint_red", 31.9, Y9 + 0.962, Z1 - 0.39, 0.05, 0.05, 0.004, 12, {
      noAO: true,
    });
    b.rod(
      "chrome",
      [32.2, Y9 + 0.98, Z1 - 0.25],
      [31.98, Y9 + 0.98, Z1 - 0.36],
      0.008,
      4,
      { noAO: true },
    );
    for (let i = 0; i < 6; i++)
      b.box(
        i % 2 ? "paper" : "paint_cream",
        32.6 + i * 0.03,
        Y9 + 0.82,
        Z1 - 0.55,
        32.62 + i * 0.03,
        Y9 + 1.14,
        Z1 - 0.24,
        { seg: false, noAO: true },
      );
    // the bedroom alcove: the bed (made, untouched), a vanity with a cracked mirror, a dresser
    D.bed(b, 33.2, Y9, -5.4, 0, { w: 0.95, cover: "velvet" }); // Nicole's: made, untouched since 1968
    D.bed(b, 35.15, Y9, -5.4, 0, { w: 0.95, cover: "fabric" }); // Nell's: unmade (Flint sleeps on it)
    b.geo(
      "fabric",
      new THREE.BoxGeometry(0.9, 0.16, 1.1).rotateZ(0.12).rotateY(0.3),
      P.m4(35.1, Y9 + 0.62, -5.0),
      { noAO: true, grime: 0.5 },
    ); // a kicked-back blanket
    b.box("wood_oak", 30.3, Y9, -7.75, 31.6, Y9 + 0.78, -7.3, { seg: false });
    b.box("chrome", 30.5, Y9 + 0.9, -7.8, 31.4, Y9 + 1.7, -7.77, {
      seg: false,
      noAO: true,
    });
    b.box("wood_dark", 32.2, Y9, -7.8, 33.4, Y9 + 1.1, -7.3, { seg: false });
    // Rose's bolt-hole by the window: bedroll, the rifle-cleaning kit, a tin of sparks, no candles anywhere
    E.mattress(b, 34.9, Y9 + 0.01, 0.4, 0, { key: "burlap" });
    b.box("crate", 33.6, Y9, 2.4, 34.3, Y9 + 0.5, 3.1, { seg: false });
    b.box("fabric", 33.7, Y9 + 0.5, 2.5, 34.2, Y9 + 0.52, 3.0, {
      seg: false,
      noAO: true,
    });
    b.rod("steel", [33.65, Y9 + 0.54, 2.6], [34.25, Y9 + 0.54, 2.9], 0.01, 4, {
      noAO: true,
    }); // cleaning rod
    b.cyl("rust", 34.0, Y9 + 0.5, 2.55, 0.05, 0.05, 0.06, 8, { noAO: true }); // the sparks tin (flint and steel)
    b.cyl("lamp", 34.6, Y9 + 0.5, 1.6, 0.07, 0.09, 0.22, 8, { noAO: true }); // battery lantern
    S.glow(34.6, Y9 + 0.65, 1.6, 0xffc070, 0.8);
    for (let i = 0; i < 9; i++)
      b.box(
        "paint_white",
        35.8,
        Y9 + 1.0 + Math.floor(i / 5) * 0.12,
        -2.2 + (i % 5) * 0.05,
        35.84,
        Y9 + 1.09 + Math.floor(i / 5) * 0.12,
        -2.19 + (i % 5) * 0.05,
        { seg: false, noAO: true },
      ); // chalk tally
    b.quad(sunScratchTex(), X1 - 0.17, Y9 + 1.55, -2.2, 0.55, 0.55, {
      ry: -HP,
    });
    // dust, a few fallen plaster bits, the ceiling light (dead)
    D.papers(b, 28, Y9 + 0.01, -3, 3, 10);
    E.hangLamp(S, 28.5, Y9 + H, 0, {
      chain: 0.5,
      shade: "paint_cream",
      color: 0xffd8a0,
      lit: false,
    });

    // ---------- anchors (local → world, added to the tudor_city record) ----------
    S.anchor("apt_9c", 30.2, Y9, -1.4, -HP); // the room's middle (the main story's 6 m "entered 9C" check covers door and window)
    S.anchor("apt_9c_calendar", 29.2, Y9, Z0 + 1.1, 0);
    S.anchor("apt_9c_desk", 25.9, Y9, 2.2, PI);
    S.anchor("apt_9c_record", 31.9, Y9, Z1 - 1.3, PI);
    S.anchor("apt_9c_window", X1 - 1.0, Y9, 1.0, -HP);
    S.anchor("apt_9c_bed", 34.2, Y9, -5.4, -HP);
    S.anchor("apt_9c_center", 30.5, Y9, 0.0, -HP);
    S.anchor("sol_desk", 14.8, 0, 16.6, 0);
    S.anchor("court_stair", 10.5, F3, -12.6, PI);
    S.build({ interior: true });
    return S;
  }

  // ------------------------------------------------------------------
  // EXTERIOR: Rose's nook, the fire escape, the lit sign
  // ------------------------------------------------------------------
  function buildExterior() {
    const S = P.site("tc_story_ext", { grime: 0.5 });
    const b = S.b;
    // ---------- Rose's nook (roof, north of the penthouse, beside the breaker) ----------
    const NX0 = 318.2,
      NX1 = 323.6,
      NZ0 = -175.5,
      NZ1 = -173.0;
    b.geo(
      "burlap",
      new THREE.BoxGeometry(NX1 - NX0 + 0.4, 0.04, 2.9).rotateX(-0.62),
      P.m4((NX0 + NX1) / 2, ATOP + 1.85, -174.1),
      { grime: 0.7, noAO: true },
    ); // the tarp lean-to
    for (const xx of [NX0, (NX0 + NX1) / 2, NX1])
      b.rod(
        "wood_rotten",
        [xx, ATOP, NZ0 + 0.2],
        [xx, ATOP + 1.2, NZ0 + 0.2],
        0.04,
        4,
      );
    E.mattress(b, 319.2, ATOP + 0.02, -174.2, HP, { key: "burlap" });
    S.col(321.2, ATOP, -175.3, 322.0, ATOP + 1.05, -174.5, { walkable: false });
    b.box("crate", 321.2, ATOP, -175.3, 322.0, ATOP + 0.6, -174.5, {
      seg: false,
    });
    b.box("crate", 321.25, ATOP + 0.6, -175.2, 321.9, ATOP + 1.05, -174.6, {
      seg: false,
    });
    b.rod(
      "paint_black",
      [322.4, ATOP + 0.1, -175.4],
      [322.5, ATOP + 1.3, -175.5],
      0.03,
      6,
    ); // a rifle propped in the corner
    b.rod(
      "paint_black",
      [322.45, ATOP + 1.0, -175.45],
      [322.6, ATOP + 1.15, -175.48],
      0.025,
      6,
    ); // its scope
    b.cyl("lamp", 321.6, ATOP + 1.05, -174.9, 0.07, 0.09, 0.22, 8, {
      noAO: true,
    });
    S.light(321.6, ATOP + 1.3, -174.9, 0xffc070, 4, 0.7);
    S.glow(321.6, ATOP + 1.2, -174.9, 0xffc070, 0.9, { flicker: 0.1 });
    for (let i = 0; i < 5; i++)
      b.box(
        "paper",
        320.3 + i * 0.12,
        ATOP,
        -175.4,
        320.4 + i * 0.12,
        ATOP + 0.22 + (i % 3) * 0.03,
        -175.1,
        { seg: false },
      ); // borrowed books
    const sign = P.texMat(
      "tc_nook_sign",
      P.signTex(
        "tc_nook_sign",
        ["ROYAL", "LAMPLIGHTER", "KNOCK FIRST"],
        "raider",
        384,
        256,
        { fg: "#f0e0b0" },
      ),
      { transparent: true },
    );
    b.quad(sign, (NX0 + NX1) / 2, ATOP + 1.05, NZ0 + 0.05, 1.1, 0.72, {
      ry: 0,
    });
    // ---------- the fire escape: a drop ladder on the tower's south face (terrace ⇄ roof) ----------
    const FX = 321.7,
      FZ = AZ1 + 0.28;
    for (const s of [-0.3, 0.3])
      b.rod("iron", [FX + s, TY + 2.4, FZ], [FX + s, ATOP + 1.1, FZ], 0.025, 4);
    for (let y = TY + 2.6; y < ATOP + 0.8; y += 0.42)
      b.rod("iron", [FX - 0.3, y, FZ], [FX + 0.3, y, FZ], 0.014, 3);
    for (let y = TY + 8; y < ATOP - 4; y += 9.6) {
      b.box("iron", FX - 1.0, y, AZ1, FX + 1.0, y + 0.05, AZ1 + 0.9, {
        seg: false,
      });
      b.rod(
        "iron",
        [FX - 1.0, y + 0.9, AZ1 + 0.9],
        [FX + 1.0, y + 0.9, AZ1 + 0.9],
        0.02,
        3,
      );
    }
    b.rod(
      "rust",
      [FX - 0.3, ATOP + 1.1, FZ],
      [FX - 0.3, ATOP + 1.1, AZ1 - 0.4],
      0.03,
      4,
    );
    b.rod(
      "rust",
      [FX + 0.3, ATOP + 1.1, FZ],
      [FX + 0.3, ATOP + 1.1, AZ1 - 0.4],
      0.03,
      4,
    ); // the hoops over the parapet
    const fe = P.texMat(
      "tc_fe_sign",
      P.signTex(
        "tc_fe_sign",
        ["FIRE ESCAPE", "THE ROOF IS SPOKEN FOR"],
        "raider",
        384,
        160,
        { fg: "#e8d8b0" },
      ),
      { transparent: true },
    );
    b.quad(fe, FX, TY + 2.2, AZ1 + 0.06, 1.3, 0.54, { ry: 0 });
    // the 9C fire escape: a hook ladder over the north parapet down to the 9th-floor landing
    b.rod(
      "rust",
      [319.3, ATOP + 1.15, AZ0 + 0.1],
      [319.3, ATOP - 3.5, AZ0 - 0.25],
      0.025,
      4,
    );
    b.rod(
      "rust",
      [319.9, ATOP + 1.15, AZ0 + 0.1],
      [319.9, ATOP - 3.5, AZ0 - 0.25],
      0.025,
      4,
    );
    for (let k = 0; k < 10; k++)
      b.rod(
        "rust",
        [319.3, ATOP + 0.9 - k * 0.45, AZ0 + 0.05 - k * 0.03],
        [319.9, ATOP + 0.9 - k * 0.45, AZ0 + 0.05 - k * 0.03],
        0.012,
        3,
      );

    // ---------- anchors ----------
    S.anchor("rose_nook", 320.6, ATOP, -174.2, HP);
    S.anchor("unkindled1", 322.4, ATOP, -161.8, PI);
    S.anchor("unkindled2", 326.4, ATOP, -165.6, -HP);
    S.anchor("unkindled3", 316.6, ATOP, -161.4, HP);
    S.anchor("unkindled4", 325.4, ATOP, -175.0, PI * 0.75);
    S.anchor("dawn_gantry", 303.5, BTOP + 0.9, BZ1 - 2.6, -HP); // behind the Windsor wing's TUDOR CITY sign, across the gap
    S.anchor("fire_escape_bottom", FX, TY, AZ1 + 1.6, 0);
    S.anchor("fire_escape_top", 320.6, ATOP, AZ1 - 1.6, 0);
    S.anchor("roof_9c_ladder", 319.6, ATOP, AZ0 + 1.2, 0);
    S.build({ shadow: true, lod: 260 });
    return { S, FX };
  }

  // ------------------------------------------------------------------
  // builder: rooms, doors, anchors, the lit sign
  // ------------------------------------------------------------------
  P.addBuilder(
    "tudor_story",
    function () {
      const I = buildInterior();
      const EXT = buildExterior();
      const O = P.I("tudor_city");
      P.addInterior("tudor_city", I.root);
      const W = (x, y, z, yaw) => ({ x: O.x + x, y: O.y + y, z: O.z + z, yaw });
      // the Court ⇄ 9C stair
      I.door(
        10.5,
        F3 + 1.3,
        -13.6,
        "Stair — Upper Floors (Apartment 9C)",
        W(25.4, Y9, -2.0, -HP),
        { id: "pe_tc_9c_up", verb: "Climb", radius: 1.3 },
      );
      I.door(
        24.25,
        Y9 + 1.2,
        -2.0,
        "Stair — Down to the Court",
        W(10.5, F3, -12.4, PI),
        { id: "pe_tc_9c_down", verb: "Descend", radius: 1.3 },
      );
      // 9C window ⇄ the roof (beside Rose's nook)
      I.door(
        35.75,
        Y9 + 1.3,
        1.0,
        "Window — Fire Escape to the Roof",
        { x: 319.6, y: ATOP, z: AZ0 + 1.3, yaw: PI },
        { id: "pe_tc_9c_window", verb: "Climb out", radius: 1.3 },
      );
      EXT.S.door(
        319.6,
        ATOP + 1.0,
        AZ0 + 0.45,
        "Fire Escape — Apartment 9C (window)",
        W(34.6, Y9, 1.0, HP),
        { id: "pe_tc_9c_roof", verb: "Climb down to", radius: 1.2 },
      );
      // terrace ⇄ roof (the drop ladder)
      EXT.S.door(
        EXT.FX,
        TY + 1.4,
        AZ1 + 0.45,
        "Fire Escape — Climb to the Roof",
        { x: 320.6, y: ATOP, z: AZ1 - 1.6, yaw: 0 },
        { id: "pe_tc_fe_up", verb: "Climb", radius: 1.3 },
      );
      EXT.S.door(
        EXT.FX,
        ATOP + 1.0,
        AZ1 - 0.45,
        "Fire Escape — Down to the Terrace",
        { x: EXT.FX, y: TY, z: AZ1 + 1.6, yaw: PI },
        { id: "pe_tc_fe_down", verb: "Climb down", radius: 1.2 },
      );
      // publish the anchors on the Tudor City record
      const rec = G.pois && G.pois.tudor_city;
      if (rec && rec.anchors)
        Object.assign(rec.anchors, I.anchors, EXT.S.anchors);
      for (const k in I.anchors) I.anchors[k].interior = "tudor_city";
      // the Lamplighter keeps the big sign lit
      if (TC.signLit && TC.signDim) {
        TC.signLit.visible = true;
        TC.signDim.visible = false;
      }
      P.onReady = P.onReady || [];
      P.onReady.push(() => {
        if (G.isStub("fx") || !G.fx.glowSprite || !TC.glowSpots || !TC.extRoot)
          return;
        for (const g of TC.glowSpots)
          P.safe("signglow", () =>
            G.fx.glowSprite(g.pos, 0xff3a2a, 4.2, {
              parent: TC.extRoot,
              intensity: 1.1,
              dayFactor: 0.25,
            }),
          );
      });
    },
    21,
  );
})();
