/* src/poi_midtown/20_msg.js */
/* =====================================================================
 * NEW RAD CITY — poi_midtown / 20_msg.js
 * MADISON SQUARE GARDEN (the 1925 Garden on Eighth Avenue, 49th–50th).
 * Exterior: four-storey brick & limestone front with giant pilasters, the
 *   famous full-width bulb MARQUEE — "MADISON SQUARE GARDEN" over
 *   "BOXING TONIGHT" — barrel roof over the arena, settlement barricades.
 * Interior (INTERIORS.msg, origin 5400,0,400) — "THE PIT", a friendly
 *   fight-club settlement:
 *   Lobby (ticket windows, turnstiles, concession stand) → vomitory tunnel
 *   → ARENA BOWL (stepped lower tier, concourse ring, upper deck, steel
 *   roof trusses, hanging four-sided scoreboard, the boxing RING at the
 *   centre, scrap shacks & market on the floor) → concourse → BOOKIE OFFICE
 *   (betting window) → staff stairs → Cutman's clinic → lobby (loop);
 *   fighters' LOCKER ROOM west of the lobby.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.PMID) return;
  const K = G.PMID.kit,
    F = K.f,
    T = K.T;
  const PI = Math.PI,
    HP = PI / 2;

  function art() {
    K.facade("msg_brick", {
      bays: 4,
      floors: 5,
      bayW: 3.4,
      floorH: 3.6,
      wall: "#8e5a44",
      brick: true,
      seed: 41,
      win: { x0: 0.28, x1: 0.72, y0: 0.2, y1: 0.85 },
      frame: "#2e2a24",
      glass: "#232a28",
      broken: 0.4,
      boarded: 0.25,
      mullions: 1,
      sill: "#c8bca0",
      pierShade: 0.2,
    });
    // marquee faces (self-lit): top band + event board
    K.litPaint("msg_marquee", 1536, 256, (x, w, h) => {
      x.fillStyle = "#16120c";
      x.fillRect(0, 0, w, h);
      // bulb border
      for (let i = 12; i < w; i += 22)
        for (const y of [10, h - 10]) {
          x.fillStyle = (i / 22) % 5 < 1 ? "#5a4020" : "#ffd890";
          x.beginPath();
          x.arc(i, y, 6, 0, 7);
          x.fill();
        }
      for (let j = 32; j < h - 20; j += 22)
        for (const xx of [10, w - 10]) {
          x.fillStyle = "#ffd890";
          x.beginPath();
          x.arc(xx, j, 6, 0, 7);
          x.fill();
        }
      x.fillStyle = "#e8e0c8";
      x.fillRect(30, 30, w - 60, h - 60);
      x.fillStyle = "#1a1612";
      K.fitText(
        x,
        "BOXING  TONIGHT",
        w / 2,
        h * 0.38,
        w - 120,
        96,
        "bold ",
        "#1a1612",
        null,
      );
      K.fitText(
        x,
        "THE PIT  ·  ALL COMERS  ·  3 ROUNDS  ·  BETS AT THE WINDOW",
        w / 2,
        h * 0.72,
        w - 140,
        44,
        "bold ",
        "#8a1a14",
        null,
      );
      // missing letters (black gaps)
      x.fillStyle = "#16120c";
      x.fillRect(w * 0.62, h * 0.24, 46, 70);
      x.fillRect(w * 0.18, h * 0.62, 30, 40);
      K.stains(x, w, h, 10, 43, 0.3);
    });
    K.litPaint("msg_marquee_top", 1536, 160, (x, w, h) => {
      x.fillStyle = "#12100c";
      x.fillRect(0, 0, w, h);
      x.save();
      x.shadowColor = "#ffb040";
      x.shadowBlur = 18;
      K.fitText(
        x,
        "MADISON  SQUARE  GARDEN",
        w / 2,
        h / 2 + 4,
        w - 60,
        128,
        "bold ",
        "#ffd070",
        null,
      );
      x.restore();
      K.fitText(
        x,
        "MADISON  SQUARE  GARDEN",
        w / 2,
        h / 2 + 4,
        w - 60,
        128,
        "bold ",
        "#fff0c8",
        null,
      );
      // a few dead bulbs in the letters
      x.fillStyle = "rgba(20,16,12,0.8)";
      for (let i = 0; i < 18; i++)
        x.fillRect((i * 97) % w, 30 + ((i * 37) % 90), 16, 16);
    });
    K.litPaint("msg_marquee_side", 512, 256, (x, w, h) => {
      x.fillStyle = "#12100c";
      x.fillRect(0, 0, w, h);
      for (let i = 14; i < w; i += 24)
        for (const y of [12, h - 12]) {
          x.fillStyle = "#ffd890";
          x.beginPath();
          x.arc(i, y, 6, 0, 7);
          x.fill();
        }
      K.fitText(
        x,
        "M S G",
        w / 2,
        h / 2,
        w - 60,
        150,
        "bold ",
        "#ff6a3a",
        null,
      );
    });
    K.paint("msg_name", 1400, 160, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      K.fitText(
        x,
        "MADISON  SQUARE  GARDEN",
        w / 2,
        h / 2 + 4,
        w - 40,
        120,
        "bold ",
        "#e8dcc0",
        "#3a2a1a",
        6,
      );
    });
    K.paint("msg_pitsign", 700, 260, (x, w, h) => {
      x.fillStyle = "#6a5a44";
      x.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) {
        x.fillStyle = i % 2 ? "#7a6a52" : "#5e4e3a";
        x.fillRect(0, (i * h) / 6, w, h / 6 - 3);
      }
      K.fitText(
        x,
        "THE PIT",
        w / 2,
        h * 0.36,
        w - 60,
        110,
        "bold ",
        "#d8202a",
        "#1a0a08",
        6,
      );
      K.fitText(
        x,
        "FRIENDLY FOLKS · FIST FIGHTS · NO GUNS IN THE RING",
        w / 2,
        h * 0.76,
        w - 50,
        30,
        "bold ",
        "#f0e8d0",
        "#1a0a08",
        3,
      );
      K.weather(x, w, h, 44, 1.2);
    });
    // fight posters (original)
    const posters = [
      ["KID KEARNS", "vs", "IRON MIKE MOLLOY", "#b8281e"],
      ["GOLDEN GLOVES", "FINALS", "1958", "#2a4a8a"],
      [
        "BRICK BRUNO",
        "CHAMPION OF THE PIT",
        '"NOBODY GOES THE DISTANCE"',
        "#3a6a2a",
      ],
      ["FRIDAY NIGHT", "FIGHTS", "PRESENTED BY FIZZO COLA", "#8a1a14"],
    ];
    posters.forEach((p, i) =>
      K.paint("msg_poster" + i, 256, 384, (x, w, h) => {
        x.fillStyle = "#e4d8b8";
        x.fillRect(0, 0, w, h);
        x.fillStyle = p[3];
        x.fillRect(0, 0, w, h * 0.22);
        x.fillRect(0, h * 0.86, w, h * 0.14);
        K.fitText(
          x,
          p[0],
          w / 2,
          h * 0.11,
          w - 20,
          40,
          "bold ",
          "#f4ecd8",
          null,
        );
        x.fillStyle = "#2a2420";
        x.beginPath();
        x.ellipse(w * 0.32, h * 0.46, 34, 60, -0.2, 0, 7);
        x.fill();
        x.beginPath();
        x.ellipse(w * 0.68, h * 0.46, 34, 60, 0.2, 0, 7);
        x.fill();
        x.fillStyle = "#8a1a14";
        x.beginPath();
        x.arc(w * 0.44, h * 0.4, 16, 0, 7);
        x.arc(w * 0.56, h * 0.42, 16, 0, 7);
        x.fill();
        K.fitText(
          x,
          p[1],
          w / 2,
          h * 0.7,
          w - 30,
          30,
          "bold ",
          "#2a2420",
          null,
        );
        K.fitText(
          x,
          p[2],
          w / 2,
          h * 0.93,
          w - 20,
          20,
          "bold ",
          "#f4ecd8",
          null,
        );
        K.weather(x, w, h, 50 + i, 1.3);
      }),
    );
    // bookie chalkboard (odds)
    K.paint("msg_odds", 512, 320, (x, w, h) => {
      x.fillStyle = "#1e2a22";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#6a4a2a";
      x.lineWidth = 16;
      x.strokeRect(0, 0, w, h);
      x.fillStyle = "#e8e8dc";
      x.font = 'bold 30px "Comic Sans MS", cursive';
      x.textAlign = "left";
      x.fillText("TONIGHT'S ODDS", 30, 50);
      x.font = '24px "Comic Sans MS", cursive';
      [
        "Sully vs NEWCOMER ...... 3 to 1",
        "Burrow Rat Melee ........... 4 to 1",
        "BRICK vs anybody ........ 9 to 1",
        "House takes 10%. No IOUs.",
        "NO CHEMS BEFORE THE BELL",
      ].forEach((l, i) => x.fillText(l, 30, 100 + i * 42));
      x.globalAlpha = 0.25;
      x.fillStyle = "#e8e8dc";
      for (let i = 0; i < 30; i++)
        x.fillRect(Math.random() * w, Math.random() * h, 40, 2);
      x.globalAlpha = 1;
    });
    // scoreboard faces (self-lit)
    K.litPaint("msg_score", 512, 256, (x, w, h) => {
      x.fillStyle = "#0c0e0c";
      x.fillRect(0, 0, w, h);
      x.strokeStyle = "#8a8a80";
      x.lineWidth = 8;
      x.strokeRect(4, 4, w - 8, h - 8);
      K.fitText(x, "GARDEN", w / 2, 40, w - 60, 40, "bold ", "#ffcf60", null);
      const bulbs = (tx, ox, oy) => {
        x.fillStyle = "#ff5a2a";
        x.font = "bold 60px monospace";
        x.textAlign = "center";
        x.fillText(tx, ox, oy);
      };
      x.fillStyle = "#e8e0c8";
      x.font = "bold 22px " + K.SANS;
      x.textAlign = "center";
      x.fillText("ROUND", w * 0.25, 90);
      x.fillText("TIME", w * 0.75, 90);
      bulbs("3", w * 0.25, 160);
      bulbs("0:00", w * 0.75, 160);
      x.fillStyle = "#6aff7a";
      x.font = "bold 22px " + K.SANS;
      x.fillText("HOME  ●●●○○   VISITOR  ●○○○○", w / 2, 220);
    });
    // lobby sign & concession menu
    K.paint("msg_concession", 700, 200, (x, w, h) => {
      x.fillStyle = "#c8281e";
      x.fillRect(0, 0, w, h);
      x.fillStyle = "#f4e8c8";
      x.fillRect(10, 10, w - 20, h - 20);
      K.fitText(
        x,
        "CARLA'S CONCESSIONS",
        w / 2,
        h * 0.3,
        w - 40,
        60,
        "bold ",
        "#c8281e",
        null,
      );
      K.fitText(
        x,
        "SQUIRREL ON A STICK 8¢ · FIZZO 20¢ · PURIFIED WATER 20¢ · BEEF JERKY 12¢",
        w / 2,
        h * 0.7,
        w - 40,
        26,
        "bold ",
        "#2a2420",
        null,
      );
      K.weather(x, w, h, 61, 0.9);
    });
    K.paint("msg_tickets", 512, 128, (x, w, h) => {
      x.fillStyle = "#2a1e14";
      x.fillRect(0, 0, w, h);
      K.fitText(
        x,
        "TICKETS",
        w / 2,
        h / 2,
        w - 40,
        80,
        "bold ",
        "#e8c870",
        null,
      );
    });
  }

  // ------------------------------------------------------------------
  // EXTERIOR
  // ------------------------------------------------------------------
  function buildExterior(rec) {
    const s = K.site("msg");
    const b = K.builder("msg_ext", { grime: 0.6 });
    const glows = K.glowSet("msg_ext");
    const X0 = s.x0,
      X1 = s.x1,
      Z0 = s.z0,
      Z1 = s.z1; // -190..-130, -314..-281
    const cz = (Z0 + Z1) / 2,
      FX = X1; // front on Eighth Avenue (east)
    // main block
    K.block(b, "msg_brick", X0, Z0, X1 - 0.6, Z1, 7, 21, {
      roof: "concrete_dark",
      col: false,
    });
    K.block(b, "wa_stone", X0, Z0, X1 - 0.6, Z1, 0, 7, {
      roof: false,
      col: false,
    });
    K.colBox(X0, 0, Z0, X1, 22, Z1, { surface: "concrete" });
    K.band(b, "limestone", X0, Z0, X1 - 0.6, Z1, 6.8, 0.5, 0.3);
    K.band(b, "limestone", X0, Z0, X1 - 0.6, Z1, 20.3, 1.2, 0.5);
    b.box(
      "limestone",
      (X0 + X1) / 2,
      21.5,
      cz,
      X1 - X0 + 0.6,
      1.4,
      Z1 - Z0 + 0.6,
      { faces: "nsewt", tint: 0xcfc4ac },
    );
    // giant pilasters across the Eighth Avenue front — on the window grid's bay boundaries — and real 3D
    // window surrounds (stone sills + lintels, hooded base windows) on every face
    K.reveals(b, "msg_brick", X0, Z0, X1 - 0.6, Z1, 7, 21, {
      tint: 0xc8bca0,
      proj: 0.12,
      maxY: 20.2,
      piers: {
        mat: "limestone",
        tint: 0xd6ccb4,
        w: 1.0,
        d: 0.5,
        y0: 7,
        y1: 20.3,
        skip: (x, z, f) => f !== "e",
      },
    });
    K.reveals(b, "wa_stone", X0, Z0, X1 - 0.6, Z1, 0, 7, {
      faces: "nsw",
      tint: 0xd8d0bc,
      proj: 0.16,
      hood: "cornice",
    });
    // name carved into the attic
    const nr = K.paint("msg_name", 1400, 160);
    b.panel("atlas_paint", FX + 0.35, 21.9, cz, 24, 1.1, HP, {
      rect: nr,
      grime: 0.3,
    });
    // arena barrel roof
    const RX0 = X0 + 4,
      RX1 = X1 - 8;
    for (let i = 0; i < 12; i++) {
      const a0 = (PI * i) / 12,
        a1 = (PI * (i + 1)) / 12,
        R = (Z1 - Z0 - 6) / 2;
      const p0 = [cz + Math.cos(a0) * R, 22.6 + Math.sin(a0) * R * 0.35],
        p1 = [cz + Math.cos(a1) * R, 22.6 + Math.sin(a1) * R * 0.35];
      b.quad(
        "corrugated",
        [RX0, p0[1], p0[0]],
        [RX1, p0[1], p0[0]],
        [RX1, p1[1], p1[0]],
        [RX0, p1[1], p1[0]],
        {
          tint: i % 5 === 2 ? 0x6a4a36 : 0x5e5a52,
          grime: 0.6,
          rect: [0, 0, (RX1 - RX0) / 2, 2],
        },
      );
    }
    b.box(
      "brick_brown",
      (RX0 + RX1) / 2,
      22.6,
      cz,
      RX1 - RX0,
      0.4,
      Z1 - Z0 - 6,
      { faces: "nsew" },
    );
    // round 2: the roof read as a flat brown slab from the air — add the exposed bowstring ribs every 6 m,
    // the glazed crown monitor (clerestory skylight strip, mostly smashed) and rust-streaked gable ends
    {
      const R = (Z1 - Z0 - 6) / 2,
        RISE = 0.35;
      const arcY = (a) => 22.6 + Math.sin(a) * R * RISE + 0.12,
        arcZ = (a) => cz + Math.cos(a) * R;
      for (let x = RX0 + 3; x < RX1 - 1; x += 6)
        for (let i = 0; i < 12; i++) {
          const a0 = (PI * i) / 12,
            a1 = (PI * (i + 1)) / 12;
          b.beam("rust", x, arcY(a0), arcZ(a0), x, arcY(a1), arcZ(a1), 0.26, {
            tint: 0x5a4030,
          });
        }
      const CYr = 22.6 + R * RISE; // crown
      b.box(
        "black_metal",
        (RX0 + RX1) / 2,
        CYr - 0.1,
        cz,
        RX1 - RX0 - 4,
        1.3,
        3.4,
        { faces: "nsew", tint: 0x2a2826 },
      );
      for (const sg of [-1, 1])
        b.box(
          sg < 0 ? "glass_broken" : "glass",
          (RX0 + RX1) / 2,
          CYr + 0.1,
          cz + sg * 1.72,
          RX1 - RX0 - 4.4,
          0.9,
          0.02,
          { grime: 0.6, faces: sg < 0 ? "n" : "s" },
        );
      b.box(
        "corrugated",
        (RX0 + RX1) / 2,
        CYr + 1.2,
        cz,
        RX1 - RX0 - 3.6,
        0.08,
        4.2,
        { faces: "tb", tint: 0x5e5a52 },
      );
      for (let x = RX0 + 3; x < RX1 - 2; x += 3)
        b.box("black_metal", x, CYr + 0.1, cz, 0.1, 1.1, 3.5, {
          tint: 0x2a2826,
        });
      // gable ends (west and east edge of the barrel): brick lunette infill so the arch doesn't show sky through it
      for (const gx of [RX0, RX1]) {
        const pts = [];
        for (let i = 0; i <= 12; i++) {
          const a = (PI * i) / 12;
          pts.push([arcZ(a), arcY(a) - 0.12]);
        }
        for (let i = 0; i < 12; i++)
          b.quad(
            "brick_brown",
            [gx, 22.6, pts[i][0]],
            [gx, 22.6, pts[i + 1][0]],
            [gx, pts[i + 1][1], pts[i + 1][0]],
            [gx, pts[i][1], pts[i][0]],
            { tint: 0x7a5040, double: true },
          );
      }
    }
    // flat roof strip behind the Eighth Avenue parapet: water tank, HVAC, vents (visible over the marquee)
    K.roofKit(b, X1 - 8, Z0 + 1.5, X1 - 0.8, Z1 - 1.5, 22.92, "msg_roof", {
      bulkhead: false,
      n: 2,
    });
    // collapsed hole in the roof (dark gap + twisted trusses)
    b.box("black", RX0 + 12, 27.5, cz - 2, 6, 0.05, 5, {
      faces: "t",
      grime: 0,
    });
    for (let k = 0; k < 4; k++)
      b.beam(
        "rust",
        RX0 + 9 + k * 2,
        28.2,
        cz - 4,
        RX0 + 10 + k * 2,
        25,
        cz + 1,
        0.2,
      );
    // round 2: cast-iron fire escapes on the 49th / 50th Street faces (landings just under the window sills;
    // the brick façade's window grid is 3.4 m bays × 3.6 m floors, so escapes span two bays on bay boundaries)
    for (const u of [5, 12])
      F.fireEscape(
        b,
        X0 + 3.4 * u,
        Z1 + 0.15,
        0,
        1,
        6.4,
        [7.8, 11.4, 15.0, 18.6],
      );
    for (const u of [4, 11])
      F.fireEscape(
        b,
        X1 - 0.6 - 3.4 * u,
        Z0 - 0.15,
        0,
        -1,
        6.4,
        [7.8, 11.4, 15.0, 18.6],
      );
    // ---- the MARQUEE ----
    const MZ0 = Z0 + 3,
      MZ1 = Z1 - 3,
      MW = MZ1 - MZ0,
      MY = 4.3,
      MH = 2.4;
    b.box("black_metal", FX + 1.6, MY, cz, 3.2, MH, MW, { tint: 0x2a2620 });
    const mt = K.litPaint("msg_marquee_top", 1536, 160),
      mb = K.litPaint("msg_marquee", 1536, 256),
      ms = K.litPaint("msg_marquee_side", 512, 256);
    b.panel("atlas_lit", FX + 3.22, MY + 1.75, cz, MW - 0.4, 1.1, HP, {
      rect: mt,
      grime: 0,
    });
    b.panel("atlas_lit", FX + 3.22, MY + 0.62, cz, MW - 0.4, 1.1, HP, {
      rect: mb,
      grime: 0,
    });
    for (const sgn of [-1, 1])
      b.panel(
        "atlas_lit",
        FX + 1.6,
        MY + 1.2,
        cz + sgn * (MW / 2 + 0.02),
        3.0,
        2.2,
        sgn > 0 ? 0 : PI,
        { rect: ms, grime: 0 },
      );
    b.box("bronze", FX + 1.6, MY + MH, cz, 3.4, 0.25, MW + 0.3, {
      tint: 0x6a5030,
    });
    // soffit bulbs
    for (let z = MZ0 + 1; z < MZ1; z += 1.5)
      for (const dx of [0.6, 2.6]) {
        b.geo("lamp_amber", T.sphereLo, {
          x: FX + dx,
          y: MY - 0.05,
          z,
          s: 0.09,
          grime: 0,
        });
        if ((z * 3 + dx) % 3 < 1.5)
          glows.add(FX + dx, MY - 0.1, z, 0xffc070, "s");
      }
    for (let z = MZ0 + 2; z < MZ1; z += 4)
      glows.add(FX + 3.4, MY + 1.2, z, 0xffd080, "m");
    // tie rods
    for (const z of [MZ0 + 2, MZ1 - 2])
      b.beam("black_metal", FX + 3, MY + MH, z, FX, MY + MH + 3.5, z, 0.08);
    // entrance doors (five bronze & glass pairs)
    for (let k = -2; k <= 2; k++) {
      const z = cz + k * 4.2;
      b.box("bronze", FX + 0.05, 0, z, 0.15, 3.2, 2.6, { tint: 0x7a5a30 });
      b.box(k === 0 ? "black" : "glass", FX + 0.14, 0.3, z, 0.02, 2.6, 2.1, {
        faces: "e",
        grime: 0.3,
      });
      if (k !== 0)
        for (let j = 0; j < 4; j++)
          b.box("wood_rotten", FX + 0.2, 0.4 + j * 0.65, z, 0.06, 0.22, 2.4, {
            yaw: 0,
            rz: 0.05,
            tint: 0x7a6248,
          });
    }
    // posters on the front piers
    for (let i = 0; i < 4; i++) {
      const r = K.paint("msg_poster" + i, 256, 384);
      b.panel(
        "atlas_paint",
        FX + 0.24,
        2.0,
        cz + (i < 2 ? -10.5 - i * 4.2 : 10.5 + (i - 2) * 4.2) + 2.1,
        0.9,
        1.35,
        HP,
        { rect: r, grime: 0.4 },
      );
    }
    // "THE PIT" settlement sign hung over the central door, scrap barricade wings, guard nest, burning barrels
    const ps = K.paint("msg_pitsign", 700, 260);
    b.panel("atlas_paint", FX + 3.4, MY - 0.9, cz, 3.4, 1.25, HP, {
      rect: ps,
      grime: 0.3,
    });
    for (const sgn of [-1, 1]) {
      const z0 = cz + sgn * 5.5,
        z1 = cz + sgn * 15;
      for (let k = 0; k < 7; k++) {
        const z = z0 + ((z1 - z0) * k) / 7;
        b.box(
          k % 2 ? "corrugated" : "rust",
          FX + 7.2,
          0,
          z,
          0.2,
          2.2 + (k % 3) * 0.3,
          Math.abs(z1 - z0) / 7 + 0.3,
          { yaw: ((k % 2) - 0.5) * 0.12, tint: k % 2 ? 0x8a7a62 : 0x8a5a3a },
        );
      }
      K.colBox(FX + 7.0, 0, Math.min(z0, z1), FX + 7.4, 2.4, Math.max(z0, z1), {
        surface: "metal",
      });
      b.beam("wood", FX + 7.2, 0, z0, FX + 7.2, 3.4, z0, 0.18);
    }
    F.sandbags(b, FX + 6, 0, cz + 17.5, 0.4, 3, 3);
    b.box("wood", FX + 6.2, 3.2, cz + 17, 2.8, 0.15, 2.4, { tint: 0x7a6248 });
    for (const dz of [-1, 1])
      b.beam("wood", FX + 5, 0, cz + 17 + dz, FX + 5, 3.2, cz + 17 + dz, 0.14);
    // string lights across the entrance
    const pts = b.cable(
      "black_metal",
      FX + 7.2,
      3.4,
      cz - 5.5,
      FX + 7.2,
      3.4,
      cz + 5.5,
      0.6,
      0.02,
      10,
    );
    for (const p of pts) glows.add(p[0], p[1] - 0.1, p[2], 0xffd090, "s");
    // rubble & litter against the side walls
    F.debris(b, X0 + 3, 0, Z0 - 1.5, 2.2, 10);
    F.debris(b, X0 + 20, 0, Z1 + 1.2, 1.8, 8);
    b.burn(FX, 18, cz - 12, 6, 0.6);
    b.finish(rec.root, { lod: 1200 });
    glows.finish(rec.root, {
      dayOpacity: 0.45,
      nightOpacity: 1,
      flicker: 0.15,
    });
    rec.anchor("entrance", FX + 4.5, 0, cz, -HP);
    rec.anchor("guard1", FX + 6, 0, cz + 7, -HP);
    rec.anchor("guard2", FX + 6, 0, cz - 7, -HP);
    return {
      doorPos: new THREE.Vector3(FX + 0.4, 1.6, cz),
      outside: { x: FX + 3.2, y: 0, z: cz, yaw: -HP },
    };
  }

  // ------------------------------------------------------------------
  // INTERIOR
  // ------------------------------------------------------------------
  function buildInterior(rec) {
    const O = G.LAYOUT.INTERIORS.msg.origin;
    const ox = O.x,
      oz = O.z;
    const b = K.builder("msg_int", {
      grime: 0.35,
      ambient: 1.15,
      maxLight: 3.0,
      gain: 1.4,
    });
    const glows = K.glowSet("msg_int");
    // ---- baked lights ----
    b.light(ox, 11, oz, 30, 0xfff0d0, 1.6); // ring floods under the scoreboard
    b.light(ox, 3, oz, 12, 0xffffff, 0.6);
    b.light(ox, 5.2, oz, 7.5, 0xfff8e8, 1.3); // hot pool on the canvas (under the floods)
    for (const p of [
      [-22, -20],
      [22, -20],
      [-22, 18],
      [22, 18],
    ])
      b.light(ox + p[0], 8, oz + p[1], 18, 0xffc880, 0.9);
    for (const p of [
      [-27, 0],
      [27, 0],
      [0, -23],
      [-14, -23],
      [14, -23],
      [-14, 23],
      [14, 23],
    ])
      b.light(ox + p[0], 7, oz + p[1], 11, 0xffd8a0, 0.8);
    b.light(ox, 3, oz + 37, 16, 0xffd8a0, 1.0); // lobby
    b.light(ox - 21, 2.8, oz + 37, 10, 0xe0ecff, 0.8); // locker room
    b.light(ox + 21, 2.8, oz + 37, 10, 0xf0f8ff, 1.0); // clinic
    b.light(ox, 7, oz - 29, 8, 0xffc070, 1.0); // bookie office
    for (const p of [
      [-10, 8],
      [9, -9],
      [12, 9],
      [-12, -8],
    ])
      b.light(ox + p[0], 1.2, oz + p[1], 6, 0xff8a30, 0.8); // barrel fires
    // round 1b: work lamps strung over the lower tiers & concourse so the stands read (they were a black void)
    for (const p of [
      [-24, -18],
      [-8, -19],
      [8, -19],
      [24, -18],
      [-24, 18],
      [-8, 19],
      [8, 19],
      [24, 18],
      [-26, 0],
      [26, 0],
    ]) {
      b.light(ox + p[0], 7.2, oz + p[1], 15, 0xffcf90, 0.85);
      glows.add(ox + p[0], 7.4, oz + p[1], 0xffd8a0, "m");
      b.box("black_metal", ox + p[0], 7.55, oz + p[1], 0.45, 0.22, 0.45, {
        grime: 0.3,
      });
      b.box("lamp_amber", ox + p[0], 7.42, oz + p[1], 0.24, 0.13, 0.24, {
        grime: 0,
      });
      b.beam(
        "black_metal",
        ox + p[0],
        7.77,
        oz + p[1],
        ox + p[0],
        12,
        oz + p[1],
        0.03,
      );
    }

    // =========================== LOBBY ===========================
    const LY = 0;
    K.room(b, {
      x0: ox - 14,
      x1: ox + 14,
      z0: oz + 30,
      z1: oz + 44,
      y: LY,
      h: 5.5,
      floor: "terrazzo",
      wall: "wall_cream",
      ceil: "plaster",
      doors: {
        s: [{ at: 14, w: 3, h: 3.2 }],
        n: [{ at: 14, w: 4, h: 3.2 }],
        w: [{ at: 7, w: 1.8, h: 2.5 }],
        e: [{ at: 7, w: 1.8, h: 2.5 }],
      },
      base: "walnut",
      cornice: "brass",
      floorTint: 0xc8b898,
      wallTint: 0xb8a888,
      wain: { mat: "walnut", h: 1.2, tint: 0x5a3a24 },
    });
    // ticket windows (south wall, both sides of the doors)
    const tk = K.paint("msg_tickets", 512, 128);
    for (const sgn of [-1, 1]) {
      const x = ox + sgn * 8;
      b.box("mahogany", x, 0, oz + 42.6, 6, 1.1, 1.2, { tint: 0x5a3020 });
      b.box("brass", x, 1.1, oz + 42.2, 6, 1.4, 0.05, {
        tint: 0x9a7a40,
        faces: "n",
      });
      for (let k = -2; k <= 2; k++)
        b.beam(
          "brass",
          x + k * 1.1,
          1.1,
          oz + 42.15,
          x + k * 1.1,
          2.5,
          oz + 42.15,
          0.04,
        );
      b.panel("atlas_paint", x, 3.0, oz + 43.82, 3, 0.75, PI, {
        rect: tk,
        grime: 0.3,
      });
      K.colBox(x - 3, 0, oz + 42, x + 3, 2.6, oz + 43.8, { surface: "wood" });
    }
    // turnstiles before the tunnel
    for (let k = -3; k <= 3; k++) {
      if (k === 0) continue;
      const x = ox + k * 1.1;
      b.cyl("chrome", x, 0, oz + 32.5, 0.18, 0.18, 0.95, 8, { grime: 0.3 });
      for (let a = 0; a < 3; a++)
        b.beam(
          "chrome",
          x,
          0.9,
          oz + 32.5,
          x + Math.cos(a * 2.1) * 0.5,
          0.9,
          oz + 32.5 + Math.sin(a * 2.1) * 0.5,
          0.04,
        );
      K.colBox(x - 0.2, 0, oz + 32.3, x + 0.2, 1, oz + 32.7, {
        surface: "metal",
      });
    }
    // concession stand (NW corner of the lobby) — Carla's counter
    b.box("paint_red", ox - 9, 0, oz + 32.2, 7, 1.05, 1.1, { tint: 0x9a2a1e });
    b.box("chrome", ox - 9, 1.05, oz + 32.2, 7.2, 0.06, 1.3);
    K.colBox(ox - 12.5, 0, oz + 31.6, ox - 5.5, 1.1, oz + 32.8, {
      surface: "metal",
    });
    const cc = K.paint("msg_concession", 700, 200);
    b.panel("atlas_paint", ox - 9, 3.4, oz + 30.17, 5.2, 1.5, 0, {
      rect: cc,
      grime: 0.3,
    });
    b.box("chrome", ox - 11.2, 1.1, oz + 31.4, 1.2, 1.1, 0.8, {
      tint: 0xa8aca0,
    }); // popcorn machine
    b.box("glass", ox - 11.2, 1.3, oz + 31.8, 1.0, 0.8, 0.02, {
      faces: "s",
      tint: 0xd8c880,
      grime: 0.2,
    });
    glows.add(ox - 11.2, 1.8, oz + 31.4, 0xffd070, "s");
    for (let x = ox - 12; x <= ox - 6; x += 2) {
      b.cyl("chrome", x, 0, oz + 33.4, 0.05, 0.05, 0.7, 6);
      b.cyl("leather_red", x, 0.7, oz + 33.4, 0.2, 0.2, 0.08, 10);
    }
    // fight posters along the lobby walls
    for (let i = 0; i < 4; i++) {
      const r = K.paint("msg_poster" + i, 256, 384);
      b.panel("atlas_paint", ox + 4 + i * 2.4, 2.4, oz + 30.17, 1.1, 1.65, 0, {
        rect: r,
        grime: 0.4,
      });
    }
    // lobby lamps
    for (const x of [-9, 0, 9]) {
      b.beam("brass", ox + x, 5.5, oz + 37, ox + x, 4.2, oz + 37, 0.03);
      b.geo("lamp_amber", T.sphereLo, {
        x: ox + x,
        y: 4.1,
        z: oz + 37,
        s: 0.25,
        grime: 0,
      });
      glows.add(ox + x, 4.1, oz + 37, 0xffc070, "m");
    }
    // settlers' benches & crates
    F.bench(b, ox + 8, 0, oz + 34, 0, 3.5, {});
    F.crate(b, ox + 12.4, 0, oz + 31.2, 0.2, 0.9);
    F.papers(b, ox - 13, oz + 31, ox + 13, oz + 43, 0, 16);

    // =========================== VOMITORY TUNNEL ===========================
    K.room(b, {
      x0: ox - 2,
      x1: ox + 2,
      z0: oz + 22,
      z1: oz + 30,
      y: 0,
      h: 3.2,
      floor: "concrete",
      wall: "concrete_panel",
      ceil: "concrete",
      walls: "we",
      floorTint: 0x8a8680,
      wallTint: 0x9a9488,
    });
    K.skin(
      b,
      "concrete_panel",
      ox - 2,
      oz + 30,
      ox + 2,
      oz + 30,
      0,
      3.2,
      [ox, oz + 26],
      [{ at: 2, w: 4, h: 3.2 }],
      { tint: 0x9a9488, col: false },
    );
    b.box("lamp_white", ox, 3.15, oz + 26, 0.2, 0.05, 1.6, { grime: 0 });
    glows.add(ox, 3.05, oz + 26, 0xe8f0ff, "s");
    b.panel("atlas_paint", ox, 2.6, oz + 29.8, 3.2, 0.9, PI, {
      rect: K.paint("msg_pitsign", 700, 260),
      grime: 0.3,
    });

    // =========================== ARENA BOWL ===========================
    const FX0 = -18,
      FX1 = 18,
      FZ0 = -14,
      FZ1 = 14; // floor
    const ROWS = 10,
      RD = 0.8,
      RH = 0.45; // lower tier rows
    const CY = ROWS * RH; // concourse height 4.5
    const WX = 30,
      WZN = -26,
      WZS = 26; // outer walls (x ±30, z -26..26)
    K.slab(
      b,
      "concrete",
      ox + FX0 - 8.5,
      oz + FZ0 - 8.5,
      ox + FX1 + 8.5,
      oz + FZ1 + 8.5,
      0,
      { th: 0.4, faces: "t", tint: 0x8a8478, surface: "concrete" },
    );
    b.box("dirt", ox, 0.005, oz, 34, 0.01, 26, {
      faces: "t",
      tint: 0x7a6a52,
      grime: 0.7,
    });
    // lower tier rows (stepped concrete with wooden bench seats); tunnel cut on the south side at |x| < 2
    const seatTint = [0x8a2a22, 0x2a4a7a];
    for (let k = 0; k < ROWS; k++) {
      const top = (k + 1) * RH,
        inset = k * RD;
      const x0 = FX0 - inset - RD,
        x1 = FX1 + inset + RD,
        z0 = FZ0 - inset - RD,
        z1 = FZ1 + inset + RD;
      const st = { faces: "nsewt", tint: 0x9a948a };
      // north & south strips (full width), west & east strips (between)
      b.box(
        "concrete",
        ox + (x0 + x1) / 2,
        0,
        oz + z0 + RD / 2,
        x1 - x0,
        top,
        RD,
        st,
      );
      K.colBox(ox + x0, 0, oz + z0, ox + x1, top, oz + z0 + RD, {
        surface: "concrete",
      });
      for (const seg of [
        [x0, -2],
        [2, x1],
      ]) {
        b.box(
          "concrete",
          ox + (seg[0] + seg[1]) / 2,
          0,
          oz + z1 - RD / 2,
          seg[1] - seg[0],
          top,
          RD,
          st,
        );
        K.colBox(ox + seg[0], 0, oz + z1 - RD, ox + seg[1], top, oz + z1, {
          surface: "concrete",
        });
      }
      b.box(
        "concrete",
        ox + x0 + RD / 2,
        0,
        oz + (z0 + z1) / 2,
        RD,
        top,
        z1 - z0 - 2 * RD,
        st,
      );
      K.colBox(ox + x0, 0, oz + z0 + RD, ox + x0 + RD, top, oz + z1 - RD, {
        surface: "concrete",
      });
      b.box(
        "concrete",
        ox + x1 - RD / 2,
        0,
        oz + (z0 + z1) / 2,
        RD,
        top,
        z1 - z0 - 2 * RD,
        st,
      );
      K.colBox(ox + x1 - RD, 0, oz + z0 + RD, ox + x1, top, oz + z1 - RD, {
        surface: "concrete",
      });
      // bench seats (every other row gets wooden folding seats; some missing)
      if (k % 1 === 0) {
        const sy = top,
          r = K.rng(900 + k);
        const seat = (x, z, yaw) => {
          if (r() < 0.22) return;
          b.box("wood", x, sy, z, 0.46, 0.42, 0.42, {
            yaw,
            tint: seatTint[k % 2],
            grime: 0.6,
          });
          b.box(
            "wood",
            x + Math.sin(yaw) * -0.2,
            sy + 0.42,
            z + Math.cos(yaw) * -0.2,
            0.46,
            0.4,
            0.05,
            { yaw, tint: seatTint[k % 2], grime: 0.6 },
          );
        };
        for (let x = x0 + 1.2; x < x1 - 1; x += 1.4) {
          seat(ox + x, oz + z0 + RD * 0.45, PI);
          if (Math.abs(x) > 2.5) seat(ox + x, oz + z1 - RD * 0.45, 0);
        }
        for (let z = z0 + 1.6; z < z1 - 1.2; z += 1.4) {
          seat(ox + x0 + RD * 0.45, oz + z, -HP);
          seat(ox + x1 - RD * 0.45, oz + z, HP);
        }
      }
    }
    // tunnel roof bridging the south rows above head height (rows 7..9) + concourse over it
    b.box("concrete", ox, 3.3, oz + FZ1 + 6.4, 4, CY - 3.3, 26 - FZ1 - 6.4, {
      faces: "nsewtb",
      tint: 0x8a8478,
    });
    K.colBox(ox - 2, 3.3, oz + FZ1 + 6.4, ox + 2, CY, oz + 26, {
      surface: "concrete",
    });
    for (const sgn of [-1, 1]) {
      b.box(
        "concrete_panel",
        ox + sgn * 2.02,
        0,
        oz + FZ1 + 3.2,
        0.04,
        3.3,
        6.4,
        { faces: sgn < 0 ? "e" : "w", tint: 0x8a8478 },
      );
    }
    b.box("concrete", ox, 3.3, oz + FZ1 + 6.4, 4, 0.02, 0.1, { faces: "n" });
    // concourse ring (y = CY) between the top row and the outer walls
    const cx0 = FX0 - ROWS * RD,
      cx1 = FX1 + ROWS * RD,
      cz0 = FZ0 - ROWS * RD,
      cz1 = FZ1 + ROWS * RD; // -26..26, -22..22
    const ring = [
      [-WX, WZN, WX, cz0],
      [-WX, cz1, -2, WZS],
      [2, cz1, WX, WZS],
      [-WX, cz0, cx0, cz1],
      [cx1, cz0, WX, cz1],
    ];
    for (const r of ring)
      K.slab(b, "terrazzo", ox + r[0], oz + r[1], ox + r[2], oz + r[3], CY, {
        th: CY,
        faces: "t",
        tint: 0xa8a090,
        surface: "concrete",
      });
    // concourse railing along the top row (with gaps at the aisles)
    for (const seg of [
      [cx0, cz0, cx1, cz0],
      [cx0, cz1, -1.6, cz1],
      [1.6, cz1, cx1, cz1],
    ])
      F.railing(b, ox + seg[0], oz + seg[1], ox + seg[2], oz + seg[3], CY, {
        mat: "black_metal",
        h: 0.95,
        step: 1.2,
        col: false,
      });
    // upper deck on east & west (8 rows, 0.6 rise) up the outer walls
    for (const sgn of [-1, 1])
      for (let k = 0; k < 8; k++) {
        const x0 = sgn < 0 ? -WX + (7 - k) * 0 : 0;
        const xin = sgn * (cx1 + 1 + k * 0.5),
          xout = sgn * WX;
        const top = CY + 0.5 + k * 0.5;
        const xa = Math.min(xin, xout),
          xb = Math.max(xin, xout);
        b.box("concrete", ox + (xa + xb) / 2, CY, oz, xb - xa, top - CY, 36, {
          faces: "nsewt",
          tint: 0x8a847a,
        });
        K.colBox(ox + xa, CY, oz - 18, ox + xb, top, oz + 18, {
          surface: "concrete",
        });
        void x0;
      }
    // outer walls of the bowl (tall), roof trusses & roof
    const RH2 = 20;
    K.room(b, {
      x0: ox - WX,
      x1: ox + WX,
      z0: oz + WZN,
      z1: oz + WZS,
      y: 0,
      h: RH2,
      floor: null,
      wall: "brick_red",
      ceil: "corrugated",
      doors: {
        s: [{ at: WX, w: 4, h: 3.2 }],
        n: [
          { at: WX, w: 2, h: 2.4, y: CY },
          { at: WX + 3.5, w: 2.4, h: 1.1, y: CY + 1.1 },
        ],
      },
      wallTint: 0x7a5a48,
      ceilTint: 0x4a4a44,
      grime: 0.6,
    });
    for (let x = -WX + 5; x < WX; x += 7.5) {
      // bowstring trusses spanning north-south
      const pts = [];
      for (let i = 0; i <= 10; i++) {
        const t = i / 10,
          z = WZN + (WZS - WZN) * t,
          y = RH2 - 5 + Math.sin(t * PI) * 4.4;
        pts.push([ox + x, y, oz + z]);
      }
      for (let i = 0; i < 10; i++)
        b.beam(
          "rust",
          pts[i][0],
          pts[i][1],
          pts[i][2],
          pts[i + 1][0],
          pts[i + 1][1],
          pts[i + 1][2],
          0.35,
          { tint: 0x6a5a4a },
        );
      b.beam(
        "rust",
        ox + x,
        RH2 - 5,
        oz + WZN,
        ox + x,
        RH2 - 5,
        oz + WZS,
        0.25,
        { tint: 0x6a5a4a },
      );
      for (let i = 1; i < 10; i++)
        b.beam(
          "rust",
          pts[i][0],
          RH2 - 5,
          pts[i][2],
          pts[i][0],
          pts[i][1],
          pts[i][2],
          0.1,
          { tint: 0x6a5a4a },
        );
    }
    // daylight through the collapsed roof (east of the ring)
    F.shaft(b, ox + 12, RH2 - 0.2, oz - 4, 0.2, 5, 18, 0.25, {
      tint: 0x9aa880,
    });
    F.shaft(b, ox + 14, RH2 - 0.2, oz - 1, 0.25, 3, 17, 0.3, {
      tint: 0x8a9a70,
    });
    F.debris(b, ox + 15, 0, oz - 6, 2.5, 18, {
      mound: true,
      col: true,
      colH: 0.9,
      mats: ["rubble", "rust", "corrugated"],
    });
    for (const p of [
      [-27, 0, HP],
      [27, 0, -HP],
      [0, -23, 0],
      [-14, -23, 0],
      [14, -23, 0],
      [-14, 23, PI],
      [14, 23, PI],
    ]) {
      const wx = p[0] === 27 ? WX - 0.2 : p[0] === -27 ? -WX + 0.2 : p[0],
        wz = p[1] === -23 ? WZN + 0.2 : p[1] === 23 ? WZS - 0.2 : p[1];
      b.box("black_metal", ox + wx, 7.2, oz + wz, 0.6, 0.4, 0.6, { yaw: p[2] });
      b.geo("lamp_warm", T.sphereLo, {
        x: ox + wx,
        y: 7.0,
        z: oz + wz,
        s: 0.22,
        grime: 0,
      });
      glows.add(ox + wx, 7.0, oz + wz, 0xffd8a0, "m");
    }
    // ---- the RING ----
    const RY = 1.2,
      RS = 7;
    b.box("wood", ox, 0, oz, RS + 0.6, RY - 0.05, RS + 0.6, {
      faces: "nsewt",
      tint: 0x4a3a2a,
    });
    b.box("cloth_white", ox, RY - 0.05, oz, RS, 0.06, RS, {
      faces: "nsewt",
      tint: 0xc8bca0,
      grime: 0.7,
    });
    b.box("velvet_red", ox, 0.05, oz, RS + 0.62, 0.9, RS + 0.62, {
      faces: "nsew",
      tint: 0x5a1a14,
      grime: 0.5,
    }); // apron skirt
    K.colBox(
      ox - RS / 2 - 0.3,
      0,
      oz - RS / 2 - 0.3,
      ox + RS / 2 + 0.3,
      RY,
      oz + RS / 2 + 0.3,
      { surface: "wood" },
    );
    b.geo("flesh", T.cyl12, {
      x: ox + 1.2,
      y: RY + 0.02,
      z: oz - 0.8,
      sx: 1.1,
      sy: 0.005,
      sz: 0.8,
      tint: 0x5a1a14,
      grime: 0,
    }); // old blood on the canvas
    const cornerPads = [0xc8281e, 0x2a4a9a, 0xe8e0d0, 0xe8e0d0];
    const corners = [
      [-1, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
    ];
    corners.forEach((c, i) => {
      const px = ox + (c[0] * RS) / 2,
        pz = oz + (c[1] * RS) / 2;
      b.cyl("chrome", px, RY, pz, 0.08, 0.08, 1.5, 8, { grime: 0.3 });
      b.box(
        "velvet_red",
        px - c[0] * 0.12,
        RY + 0.3,
        pz - c[1] * 0.12,
        0.25,
        1.1,
        0.25,
        { tint: cornerPads[i], grime: 0.5 },
      );
      K.colBox(px - 0.12, RY, pz - 0.12, px + 0.12, RY + 1.5, pz + 0.12, {
        surface: "metal",
      });
    });
    for (let r = 0; r < 3; r++) {
      const y = RY + 0.5 + r * 0.4;
      for (let s = 0; s < 4; s++) {
        const a = corners[[0, 2, 1, 3][s]],
          c2 = corners[[2, 1, 3, 0][s]];
        b.cable(
          "velvet_red",
          ox + (a[0] * RS) / 2,
          y,
          oz + (a[1] * RS) / 2,
          ox + (c2[0] * RS) / 2,
          y,
          oz + (c2[1] * RS) / 2,
          0.06,
          0.05,
          6,
        );
      }
    }
    // ring steps (two corners), stools & water buckets
    for (const c of [
      [-1, 1],
      [1, -1],
    ])
      b.stairs(
        "wood",
        ox + c[0] * 2.4,
        oz + c[1] * (RS / 2 + 0.3 + 1.0),
        0,
        -c[1],
        1.3,
        1.0,
        0,
        RY,
        3,
        { tint: 0x5a4a38 },
      );
    for (const c of [
      [-1, -1],
      [1, 1],
    ]) {
      const sx = ox + c[0] * (RS / 2 + 0.9),
        sz = oz + c[1] * (RS / 2 + 0.9);
      b.cyl("wood", sx, 0, sz, 0.22, 0.2, 0.6, 8, { tint: 0x6a5238 });
      b.cyl("rust", sx + 0.5, 0, sz, 0.18, 0.2, 0.35, 8);
    }
    // bell on a post
    b.cyl("wood", ox - RS / 2 - 1.8, 0, oz - 0.5, 0.08, 0.08, 1.4, 6);
    b.geo("brass", T.sphereLo, {
      x: ox - RS / 2 - 1.8,
      y: 1.5,
      z: oz - 0.5,
      sx: 0.22,
      sy: 0.16,
      sz: 0.22,
      grime: 0.2,
    });
    // hanging four-sided scoreboard
    const SBY = 9.5;
    b.box("black_metal", ox, SBY, oz, 5.2, 3.2, 5.2, {
      faces: "nsewtb",
      tint: 0x26241f,
    });
    const sc = K.litPaint("msg_score", 512, 256);
    for (let i = 0; i < 4; i++) {
      const a = i * HP;
      b.panel(
        "atlas_lit",
        ox + Math.sin(a) * 2.62,
        SBY + 1.6,
        oz + Math.cos(a) * 2.62,
        4.8,
        2.4,
        a,
        { rect: sc, grime: 0 },
      );
    }
    for (const c of corners)
      b.cable(
        "black_metal",
        ox + c[0] * 2.4,
        SBY + 3.2,
        oz + c[1] * 2.4,
        ox + c[0] * 6,
        RH2 - 1,
        oz + c[1] * 6,
        0.1,
        0.04,
        3,
      );
    // flood lamps under the scoreboard
    for (const c of corners) {
      b.box(
        "black_metal",
        ox + c[0] * 2.2,
        SBY - 0.45,
        oz + c[1] * 2.2,
        0.6,
        0.45,
        0.6,
        { yaw: 0.78 },
      );
      b.geo("lamp_white", T.cyl8, {
        x: ox + c[0] * 2.2,
        y: SBY - 0.47,
        z: oz + c[1] * 2.2,
        s: 0.26,
        sy: 0.02,
        grime: 0,
      });
      glows.add(ox + c[0] * 2.2, SBY - 0.6, oz + c[1] * 2.2, 0xfff4e0, "l");
    }
    // fight-night floods: four hard cones of light from the scoreboard lamps onto the canvas
    for (const c of corners)
      F.cone(
        b,
        ox + c[0] * 2.2,
        SBY - 0.55,
        oz + c[1] * 2.2,
        ox - c[0] * 1.2,
        RY,
        oz - c[1] * 1.2,
        0.3,
        2.6,
        { tint: 0xb8b0a0 },
      );
    // ---- settlement on the floor ----
    const shack = (x, z, w, d, yaw, h) => {
      const r = K.rng(Math.round(x * 3 + z * 7));
      const mats = ["corrugated", "rust", "wood_rotten", "corrugated"];
      for (let side = 0; side < 4; side++) {
        const len = side % 2 ? d : w;
        const n = Math.max(2, Math.round(len / 1.2));
        for (let k = 0; k < n; k++) {
          if (side === 0 && k === Math.floor(n / 2)) continue; // doorway
          const u = -len / 2 + ((k + 0.5) * len) / n;
          let lx, lz;
          if (side === 0) {
            lx = u;
            lz = d / 2;
          } else if (side === 2) {
            lx = u;
            lz = -d / 2;
          } else if (side === 1) {
            lx = w / 2;
            lz = u;
          } else {
            lx = -w / 2;
            lz = u;
          }
          const p = F.rot(ox + x, oz + z, yaw, lx, lz);
          const pw = side % 2 ? 0.1 : len / n + 0.08,
            pd = side % 2 ? len / n + 0.08 : 0.1;
          b.box(
            mats[(k + side) % 4],
            p[0],
            0,
            p[1],
            pw,
            h - 0.2 + r() * 0.4,
            pd,
            {
              yaw: yaw + (r() - 0.5) * 0.06,
              tint: [0x8a7a62, 0x8a5a3a, 0x6a5642, 0x9a8a72][(k + side) % 4],
              grime: 0.7,
            },
          );
        }
      }
      b.box("corrugated", ox + x, h + 0.1, oz + z, w + 0.6, 0.08, d + 0.6, {
        yaw,
        rx: 0.08,
        tint: 0x7a6a52,
        grime: 0.7,
        faces: "nsewtb",
      });
      K.colRot(ox + x, oz + z - 0, w, d, 0, h, yaw, { surface: "metal" });
      void r;
    };
    shack(-13, -10, 4, 3.4, 0.1, 2.6);
    shack(-13.5, 9.5, 3.6, 3.2, -0.12, 2.5);
    shack(13, 9.5, 4.2, 3.4, PI + 0.08, 2.7);
    // barrel fires
    for (const p of [
      [-10, 8],
      [9, -9],
      [12, 9],
      [-12, -8],
    ]) {
      b.cyl("rust", ox + p[0], 0, oz + p[1], 0.3, 0.3, 0.9, 10, {
        tint: 0x6a4a34,
      });
      K.colBox(
        ox + p[0] - 0.3,
        0,
        oz + p[1] - 0.3,
        ox + p[0] + 0.3,
        0.9,
        oz + p[1] + 0.3,
        { surface: "metal" },
      );
    }
    // string lights from the scoreboard cables to the upper tiers
    for (const c of corners) {
      const pts = b.cable(
        "black_metal",
        ox + c[0] * 3,
        SBY - 0.2,
        oz + c[1] * 3,
        ox + c[0] * 24,
        CY + 3.5,
        oz + c[1] * 19,
        1.6,
        0.02,
        12,
      );
      for (let i = 1; i < pts.length; i++)
        glows.add(
          pts[i][0],
          pts[i][1] - 0.1,
          pts[i][2],
          i % 3 ? 0xffd090 : 0xff7050,
          "s",
        );
    }
    // laundry line, tables, mattresses, crates around the floor
    b.cable(
      "fabric",
      ox - 16,
      2.2,
      oz - 3,
      ox - 16,
      2.2,
      oz + 5,
      0.3,
      0.015,
      6,
    );
    for (let k = 0; k < 4; k++)
      b.box("cloth_white", ox - 16, 1.3, oz - 2 + k * 2, 0.02, 0.8, 0.9, {
        tint: [0xc8c0a8, 0x8a9aa8, 0xa86a5a, 0xc8b890][k],
        grime: 0.5,
      });
    F.table(b, ox + 8, 0, oz + 12.5, 0.3, {
      w: 1.6,
      d: 0.9,
      mat: "wood_rotten",
    });
    for (const a of [0, PI])
      F.chair(
        b,
        ox + 8 + Math.cos(a + 0.3) * 1.1,
        0,
        oz + 12.5 - Math.sin(a + 0.3) * 1.1,
        a + 0.3 + HP,
        { mat: "wood_rotten" },
      );
    for (let k = 0; k < 3; k++)
      F.crate(b, ox - 16.5 + k * 0.9, 0, oz - 12.5, 0.1 * k, 0.8);
    F.papers(b, ox - 17, oz - 13, ox + 17, oz + 13, 0.01, 30, {
      tint: 0xa89878,
    });
    // ---- BOOKIE OFFICE (north concourse, behind the outer wall) ----
    const BY = CY;
    K.room(b, {
      x0: ox - 6,
      x1: ox + 6,
      z0: oz - 33,
      z1: oz + WZN,
      y: BY,
      h: 3.2,
      floor: "oak",
      wall: "wallpaper",
      ceil: "plaster",
      doors: {
        s: [
          { at: 6, w: 2, h: 2.4 },
          { at: 9.5, w: 2.4, h: 1.1, y: 1.1 },
        ],
        e: [{ at: 3.5, w: 1.4, h: 2.3 }],
      },
      base: "walnut",
      wallTint: 0x8a7a5a,
      floorTint: 0x7a5a3a,
      surface: "wood",
    });
    b.box("mahogany", ox + 3.5, BY, oz - 26.6, 3, 1.1, 0.8, { tint: 0x5a3020 }); // betting counter behind the window
    b.box("brass", ox + 3.5, BY + 1.1, oz - 26.2, 2.6, 1.1, 0.04, {
      faces: "s",
      tint: 0x9a7a40,
    });
    for (let k = -2; k <= 2; k++)
      b.beam(
        "brass",
        ox + 3.5 + k * 0.5,
        BY + 1.1,
        oz - 26.18,
        ox + 3.5 + k * 0.5,
        BY + 2.2,
        oz - 26.18,
        0.03,
      );
    K.colBox(ox + 2, BY, oz - 27, ox + 5, BY + 1.15, oz - 26.2, {
      surface: "wood",
    });
    const od = K.paint("msg_odds", 512, 320);
    b.panel("atlas_paint", ox - 2.5, BY + 1.8, oz - 32.82, 2.6, 1.6, 0, {
      rect: od,
      grime: 0.2,
    });
    F.desk(b, ox - 3, BY, oz - 30.5, 0, { mat: "walnut", phone: true });
    F.chair(b, ox - 3, BY, oz - 31.4, 0, {
      mat: "walnut",
      seat: "leather_brown",
    });
    F.cabinets(b, ox + 5.2, BY, oz - 31, -HP, 2);
    b.beam("brass", ox, BY + 3.2, oz - 29.5, ox, BY + 2.4, oz - 29.5, 0.03);
    b.geo("lamp_amber", T.cone8, {
      x: ox,
      y: BY + 2.35,
      z: oz - 29.5,
      s: 0.3,
      sy: 0.25,
      rx: PI,
      grime: 0,
    });
    glows.add(ox, BY + 2.3, oz - 29.5, 0xffc070, "m");
    // a lit "BETS" sign over the window on the concourse side
    b.panel("atlas_neon", ox + 3.5, BY + 2.7, oz - 25.8, 2.2, 0.55, PI, {
      rect: K.neon("msg_bets", "BETS", 0xff5030, { h: 110 }),
      grime: 0,
    });
    // staff stair lobby (east of the bookie office)
    K.room(b, {
      x0: ox + 6,
      x1: ox + 10,
      z0: oz - 33,
      z1: oz - 28,
      y: BY,
      h: 3,
      floor: "concrete",
      wall: "wall_grey",
      ceil: "concrete",
      doors: { w: [{ at: 1.5, w: 1.4, h: 2.3 }] },
      wallTint: 0x8a8a80,
    });
    b.box("metal_dark", ox + 9.8, BY, oz - 30.5, 0.2, 2.3, 1.2, {
      tint: 0x5a5a50,
    });
    glows.add(ox + 9.6, BY + 2.5, oz - 30.5, 0x60ff80, "s");

    // =========================== LOCKER ROOM (west) ===========================
    K.room(b, {
      x0: ox - 28,
      x1: ox - 14,
      z0: oz + 30,
      z1: oz + 44,
      y: 0,
      h: 3.4,
      floor: "tile_floor",
      wall: "tile_cream",
      ceil: "ceil_tile",
      doors: { e: [{ at: 7, w: 1.8, h: 2.5 }] },
      floorTint: 0xa8a8a0,
      wallTint: 0xc8c0a8,
      base: "tile_green",
    });
    for (let k = 0; k < 8; k++) {
      b.box("army_green", ox - 27.6, 0, oz + 31.5 + k * 0.62, 0.55, 1.9, 0.58, {
        tint: 0x5a6a4a,
      });
      for (let j = 0; j < 3; j++)
        b.box(
          "black_metal",
          ox - 27.3,
          1.3 + j * 0.06,
          oz + 31.5 + k * 0.62,
          0.02,
          0.03,
          0.4,
          { faces: "e" },
        );
    }
    K.colBox(ox - 27.9, 0, oz + 31.2, ox - 27.3, 1.9, oz + 36.3, {
      surface: "metal",
    });
    F.bench(b, ox - 24, 0, oz + 34, HP, 4, { back: false });
    F.bench(b, ox - 20, 0, oz + 34, HP, 4, { back: false });
    // showers (north-west): tiled stall with pipes
    for (let k = 0; k < 4; k++) {
      const x = ox - 26.5 + k * 1.6;
      F.pipe(b, x, 2.2, oz + 30.2, x, 2.2, oz + 30.8, 0.03, { mat: "chrome" });
      b.geo("chrome", T.cone8, {
        x,
        y: 2.15,
        z: oz + 30.8,
        s: 0.08,
        sy: 0.08,
        rx: PI,
      });
    }
    // heavy bag & speed bag
    b.beam("black_metal", ox - 18, 3.4, oz + 41, ox - 18, 2.4, oz + 41, 0.03);
    b.cyl("leather_red", ox - 18, 1.0, oz + 41, 0.3, 0.3, 1.4, 12, {
      tint: 0x6a2018,
      bottom: true,
    });
    K.colBox(ox - 18.3, 1.0, oz + 40.7, ox - 17.7, 2.4, oz + 41.3, {
      surface: "wood",
    });
    b.box("walnut", ox - 15.5, 1.6, oz + 43.7, 1, 0.6, 0.2);
    b.geo("leather_red", T.sphereLo, {
      x: ox - 15.5,
      y: 1.5,
      z: oz + 43.4,
      sx: 0.12,
      sy: 0.18,
      sz: 0.12,
    });
    // ring robes on hooks, taped gloves
    for (let k = 0; k < 3; k++)
      b.box("velvet_red", ox - 22 + k * 1.2, 1.2, oz + 43.7, 0.7, 1.1, 0.12, {
        tint: [0x8a1a14, 0x2a3a7a, 0xc8b890][k],
        grime: 0.5,
      });
    b.box("lamp_white", ox - 21, 3.35, oz + 37, 0.2, 0.05, 2.2, { grime: 0 });
    glows.add(ox - 21, 3.25, oz + 37, 0xe0ecff, "m");
    F.papers(b, ox - 27, oz + 31, ox - 15, oz + 43, 0, 8, { tint: 0xb8b0a0 });

    // =========================== CUTMAN'S CLINIC (east) ===========================
    K.room(b, {
      x0: ox + 14,
      x1: ox + 28,
      z0: oz + 30,
      z1: oz + 44,
      y: 0,
      h: 3.4,
      floor: "tile_floor",
      wall: "tile_white",
      ceil: "ceil_tile",
      doors: {
        w: [{ at: 7, w: 1.8, h: 2.5 }],
        n: [{ at: 11, w: 1.4, h: 2.3 }],
      },
      floorTint: 0xb8b8b0,
      wallTint: 0xd8dcd0,
      base: "tile_green",
    });
    for (let k = 0; k < 3; k++)
      F.bed(b, ox + 17 + k * 3.4, 0, oz + 41.5, PI, {
        hospital: true,
        sheetTint: 0xd8d0c0,
        blood: k === 1,
      });
    b.box("hosp_white", ox + 27.5, 0, oz + 34, 0.6, 1.9, 2.4, {
      tint: 0xc8ccc4,
    }); // medicine cabinet
    b.box("glass", ox + 27.19, 1.0, oz + 34, 0.02, 0.8, 2.0, {
      faces: "w",
      grime: 0.3,
    });
    K.colBox(ox + 27.2, 0, oz + 32.8, ox + 27.8, 1.9, oz + 35.2, {
      surface: "metal",
    });
    F.table(b, ox + 21, 0, oz + 34, 0, {
      w: 2.0,
      d: 0.9,
      mat: "hosp_white",
      h: 0.9,
      cloth: "cloth_white",
    });
    b.box("chrome", ox + 20.6, 0.9, oz + 34, 0.5, 0.05, 0.3, { yaw: 0.2 });
    for (let x = ox + 17; x < ox + 28; x += 5) {
      b.box("lamp_white", x, 3.35, oz + 37, 0.2, 0.05, 2.2, { grime: 0 });
      glows.add(x, 3.25, oz + 37, 0xf0f8ff, "m");
    }
    // staff stair door (north wall of the clinic, leads up to the bookie's)
    b.box("metal_dark", ox + 25, 0, oz + 30.2, 1.2, 2.3, 0.15, {
      tint: 0x5a5a50,
    });
    glows.add(ox + 25, 2.5, oz + 30.4, 0x60ff80, "s");

    b.finish(rec.interiorRoot, { cast: false });
    glows.finish(rec.interiorRoot, {
      interior: true,
      nightOpacity: 0.95,
      flicker: 0.05,
    });

    // ---- anchors ----
    const A = (n, x, y, z, yaw) => rec.anchor(n, x, y, z, yaw);
    A("entrance", ox, 0, oz + 42, 0);
    A("ring", ox, RY, oz, 0);
    A("ring_red", ox - 2.4, RY, oz - 2.4, -PI * 0.75);
    A("ring_blue", ox + 2.4, RY, oz + 2.4, PI * 0.25);
    A("promoter", ox - 5.2, 0, oz + 4.5, -HP * 0.5);
    A("bookie", ox + 3.5, BY, oz - 27.6, 0);
    A("merchant", ox - 8.9, 0, oz + 31.1, PI);
    A("doctor", ox + 21, 0, oz + 36, PI);
    A("hector", ox + 20.5, CY - RH * 3, oz + 3.5, HP);
    A("champ", ox - 21, 0, oz + 38, HP);
    A("npc1", ox - 12, 0, oz + 5, 0);
    A("npc2", ox + 10, 0, oz - 12, 0);
    A("guard1", ox, 0, oz + 34.5, PI);
    A("guard2", ox - 22, CY, oz - 23, 0);
    A("crowd1", ox - 22.9, CY - RH * 3, oz - 2.7, -HP);
    A("crowd2", ox - 22.8, CY - RH * 3, oz + 1.6, -HP); // round 1b: off the seat benches
    // round 2: crowd3/crowd4 were swallowed by the comment above → two Pit fans never spawned
    A("crowd3", ox + 4, CY - RH * 3, oz - 16.4, 0);
    A("crowd4", ox - 6, CY - RH * 4, oz + 17, PI);
    for (let i = 1; i <= 6; i++)
      A(
        "spawn" + i,
        ox + [-12, 12, -8, 8, -14, 14][i - 1],
        0,
        oz + [-8, -8, 10, 10, 0, 0][i - 1],
        0,
      );
    return {
      arrival: { x: ox, y: 0, z: oz + 42.6, yaw: 0 },
      exitPos: new THREE.Vector3(ox, 1.6, oz + 43.7),
      staffUpDoor: new THREE.Vector3(ox + 25, 1.4, oz + 30.4),
      staffUpArrival: {
        x: ox + 8.2,
        y: BY,
        z: oz - 31.5,
        yaw: HP,
      } /* round 2: in line with the office doorway (was 1 m off → faced a wall) */,
      staffDownDoor: new THREE.Vector3(ox + 9.6, BY + 1.4, oz - 30.5),
      staffDownArrival: { x: ox + 25, y: 0, z: oz + 31.6, yaw: PI },
      ox,
      oz,
      RY,
      CY,
      BY,
    };
  }

  // ------------------------------------------------------------------
  // Content
  // ------------------------------------------------------------------
  function content(rec, I) {
    const C = K.content("msg", rec);
    const { ox, oz, BY, CY } = I;
    C.prop("mattress", ox - 13, 0, oz - 10, 0.1, {});
    C.prop("mattress", ox + 13, 0, oz + 9.5, PI, {});
    C.prop("bed", ox + 17, 0, oz + 41.5, PI, { owned: true });
    C.prop("workbench", ox - 16.5, 0, oz + 10.5, HP, {});
    C.prop("market_stall", ox + 14, 0, oz - 10.5, -HP * 0.9, {});
    C.prop("barrel", ox - 10, 0, oz + 8, 0, { burning: true, collide: false });
    C.prop("barrel", ox + 9, 0, oz - 9, 0, { burning: true, collide: false });
    C.prop("barrel", ox + 12, 0, oz + 9, 0, { burning: true, collide: false });
    C.prop("barrel", ox - 12, 0, oz - 8, 0, { burning: true, collide: false });
    C.prop("radio", ox + 8, 0.76, oz + 12.5, 0.3, {});
    C.prop("first_aid", ox + 27.7, 1.3, oz + 38, -HP, {
      name: "Cutman's Kit",
      owner: "settlers",
      loot: "medical_cabinet",
    });
    C.prop("locker", ox - 27.5, 0, oz + 38.5, HP, {
      count: 2,
      name: "Fighter Locker",
      owner: "settlers",
      loot: "locker",
    });
    C.prop("footlocker", ox - 13.2, 0, oz - 8.2, -HP, {
      name: "Squatter Footlocker",
      owner: "settlers",
      loot: "footlocker",
    });
    C.prop("safe", ox - 5.6, BY, oz - 32.4, 0, {
      name: "Bookie's Strongbox",
      owner: "settlers",
      locked: 0,
      lock: K.LOCKS.msg_strongbox,
      items: [
        ["scrip", 420],
        ["old_dollars", 6],
        ["q_pmid_ledger", 1],
      ],
    });
    C.prop("cash_register", ox - 8, 1.12, oz + 32.2, PI, {
      name: "Concession Till",
      owner: "settlers",
      mount: "bare",
    });
    C.prop("fizzo_machine", ox - 13.4, 0, oz + 35, HP, { owner: "settlers" });
    C.terminal("pmid_msg_promoter", ox - 1, BY + 0.77, oz - 30.5, 0, "bare");
    C.prop("skeleton", ox + 22, CY + 1.0, oz - 9, HP, { pose: "seated" }); // a fan who never left his seat
    C.prop("skeleton", ox - 22.2, CY + 1.5, oz + 6, -HP, { pose: "seated" });
    C.note("pmid_msg_rules", ox + 7.4, 0.77, oz + 12.2, {
      name: "House Rules of The Pit",
      title: "THE PIT — HOUSE RULES (nailed to the table)",
      text: "1. No guns in the ring. Fists, knuckles, clubs, whatever God gave you.\n2. When Mickey rings the bell, you stop. When Brick rings the bell, you run.\n3. Losers buy the next round. Winners buy the round after that.\n4. Bets are settled at Ondine's window, on the concourse. No IOUs, no pills, no old-world money unless it's got a President on it.\n5. Nobody sleeps in the ring.\n6. If you die, you forfeit.\n— Management (Mickey)\n\n(Pencilled in the margin, in Ondine's tiny hand: strongbox 5-7-0-0. Brick's record. Nobody's ever beaten it either.)",
      learn: "pmid_msg_strongbox",
    });
    C.pickup("tunnel_rat_skewer", 2, ox - 10.5, 1.12, oz + 32.0);
    C.pickup("purified_water", 1, ox + 21.4, 0.95, oz + 34.1);
    C.pickup("rally_tonic", 1, ox + 20.2, 0.95, oz + 33.8);
  }

  K.defineSite("msg", 20, function () {
    art();
    const rec = K.record("msg", "msg");
    const ext = buildExterior(rec);
    const I = buildInterior(rec);
    K.door(rec, {
      id: "pmid_msg_front",
      pos: ext.doorPos,
      label: "Madison Square Garden — The Pit",
      verb: "Enter",
      target: I.arrival,
      onEnter: () => K.discover("msg"),
    });
    K.door(rec, {
      id: "pmid_msg_exit",
      pos: I.exitPos,
      label: "Eighth Avenue",
      verb: "Exit to",
      target: ext.outside,
    });
    K.door(rec, {
      id: "pmid_msg_staff_up",
      pos: I.staffUpDoor,
      label: "Staff Stairs — Bookie's Office",
      verb: "Climb",
      target: I.staffUpArrival,
    });
    K.door(rec, {
      id: "pmid_msg_staff_down",
      pos: I.staffDownDoor,
      label: "Staff Stairs — Clinic",
      verb: "Descend",
      target: I.staffDownArrival,
    });
    G.PMID.msgInt = I;
    content(rec, I);
  });
})();
