/* src/poi_chelsea/32_webster_int.js */
/* =====================================================================
 * NEW RAD CITY — POI CHELSEA — 32_webster_int.js
 * WEBSTER HALL interior (cell 'webster_hall', origin 9000,0,400):
 * a working dance hall twenty-two years after the bombs.
 *
 * Levels (local y):  STUDIO 0 (the basement club: DJ booth, bar, the
 *                       sputtering Hearth generator, storage, back stair)
 *                    MAIN 4.5 (lobby: box office, coat-check clinic,
 *                       grand stair; the GRAND BALLROOM: stage with the
 *                       band, parquet dance floor, bar, tables)
 *                    BALC 10 (horseshoe balconies; VIP lounge, the
 *                       band's green room, settlers' bunk room)
 * Loop: lobby → east stair down to the Studio → back stair up to the
 * stage wing → ballroom → lobby; grand stair → balconies → rooms.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pch) return;
  const PF = G._pch;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const KEY = "webster_hall";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const STU = 0,
    MAIN = 4.5,
    BALC = 10,
    CEIL = 16.5,
    STAGE = MAIN + 1.2;
  const XW = -22,
    XE = 22,
    ZN = -16,
    ZS = 16;

  PF.addBuilder(
    "webster_int",
    function () {
      const cell = PF.cell(KEY);
      const root = cell.root;
      const b = PF.batch("wh_int");
      b.ground = 0;
      b.aoH = 2.2;
      // ---------- light plan (warm, lived-in) ----------
      const L = [];
      const light = (x, y, z, color, r, i) =>
        L.push({ x: X(x), y, z: Z(z), color, r, i });
      for (const z of [-8, -1, 5]) light(0, CEIL - 5.5, z, 0xffd8a0, 13, 0.6); // chandeliers (lighting the floor, not the ceiling)
      light(0, STAGE + 3, -13, 0xff90c0, 10, 0.9); // stage wash (pink)
      light(-8, STAGE + 2, -12, 0x80b0ff, 8, 0.6);
      light(8, STAGE + 2, -12, 0xffc070, 8, 0.7);
      light(18, MAIN + 2.4, -2, 0xffb060, 9, 0.9); // bar
      light(-18, MAIN + 2, -2, 0xffa050, 9, 0.7); // tables (candles)
      for (const x of [-12, 0, 12]) light(x, MAIN + 3, 12, 0xffd090, 8, 0.7); // lobby
      light(18, MAIN + 2.4, 12, 0xf0f8ff, 7, 0.7); // clinic
      for (const x of [-19, 19])
        for (const z of [-10, 0]) light(x, BALC + 2.4, z, 0xffc880, 8, 0.55);
      light(0, BALC + 2.4, 5, 0xffc880, 9, 0.5);
      light(-9, BALC + 2.2, 12, 0xff9060, 8, 0.8); // VIP lounge
      light(5, BALC + 2.2, 12, 0xffe0b0, 7, 0.8); // green room (mirror bulbs)
      light(16, BALC + 2.2, 12, 0xffc070, 7, 0.6); // bunks
      light(0, STU + 3, -8, 0xff4ab0, 10, 0.9);
      light(0, STU + 3, 2, 0x40a0ff, 10, 0.8); // studio neon
      light(-17, STU + 2.5, -12.5, 0x90d0ff, 8, 0.9); // generator
      light(17, STU + 2.5, -10, 0xffc070, 7, 0.5); // storage
      light(10.5, STU + 2.5, 12, 0xffd090, 6, 0.6); // stair foot
      b.setLights(L, 0x9a8a78, 0.16);

      const box = (k, x, y, z, w, h, d, o) =>
        b.box(k, X(x), y, Z(z), w, h, d, o);
      const bmm = (k, x0, y0, z0, x1, y1, z1, o) =>
        b.boxMM(k, X(x0), y0, Z(z0), X(x1), y1, Z(z1), o);
      const col = (x0, y0, z0, x1, y1, z1, o) =>
        PF.colMM(
          X(x0),
          y0,
          Z(z0),
          X(x1),
          y1,
          Z(z1),
          Object.assign({ walkable: false }, o || {}),
        );
      const solid = (k, x0, y0, z0, x1, y1, z1, o) => {
        bmm(k, x0, y0, z0, x1, y1, z1, o);
        col(x0, y0, z0, x1, y1, z1, {
          walkable: !!(o && o.walk),
          surface: (o && o.surface) || "wood",
        });
      };
      const slab = (k, x0, z0, x1, z1, y, t, o) =>
        PF.slab(b, k, X(x0), Z(z0), X(x1), Z(z1), y, t, o);
      const wall = (k, axis, a0, a1, f0, f1, y0, y1, gaps, o) => {
        const off = axis === "x" ? OX : OZ,
          foff = axis === "x" ? OZ : OX;
        PF.wall(
          b,
          k,
          axis,
          a0 + off,
          a1 + off,
          f0 + foff,
          f1 + foff,
          y0,
          y1,
          (gaps || []).map((g) => ({ c: g.c + off, w: g.w, y0: g.y0, h: g.h })),
          o,
        );
      };
      const quad = (k, x, y, z, w, h, o) => b.quad(k, X(x), y, Z(z), w, h, o);

      // =====================================================================
      // SHELL
      // =====================================================================
      wall("ball_wall", "x", XW, XE, ZN - 0.5, ZN, STU, CEIL, []);
      wall("ball_wall", "x", XW, XE, ZS, ZS + 0.5, STU, CEIL, [
        { c: 0, w: 3.4, y0: MAIN, h: 3.6 },
      ]);
      wall("ball_wall", "z", ZN, ZS, XW - 0.5, XW, STU, CEIL, []);
      wall("ball_wall", "z", ZN, ZS, XE, XE + 0.5, STU, CEIL, []);
      // front doors (inside) + transom glow
      for (const sx of [-1, 1])
        bmm(
          "oak",
          sx * 0.05,
          MAIN,
          ZS - 0.05,
          sx * 1.65,
          MAIN + 2.9,
          ZS + 0.02,
          { seg: false },
        );
      quad("window_lit", 0, MAIN + 3.3, ZS - 0.06, 3.2, 0.6, {
        ry: PI,
        noAO: true,
        grime: 0.2,
      });
      // tall arched ballroom windows high on the east/west walls (boarded, daylight leaking)
      for (const [x, ry] of [
        [XW + 0.05, HP],
        [XE - 0.05, -HP],
      ])
        for (const z of [-11, -3, 5]) {
          PF.archBay(b, X(x), BALC + 1.2, Z(z), ry, 2.4, 4.6, {
            pane: "window_lit",
            ring: "gold_trim",
            sash: true,
          });
          for (let k = 0; k < 3; k++)
            box(
              "planks",
              x + (ry > 0 ? 0.08 : -0.08),
              BALC + 1.8 + k * 1.1,
              z + (k - 1) * 0.2,
              0.05,
              0.22,
              2.5,
              { rx: (k - 1) * 0.2, seg: false },
            );
        }
      // floors: studio floor, MAIN slab (holes: east studio stair 9..12 × 9.5..14.5; back stair -18.2..-16 × -9.8..-3.5)
      slab("tile_floor", XW, ZN, XE, ZS, STU + 0.02, 0.3, {});
      const mainRects = [
        [XW, ZN, XE, -9.8],
        [XW, -9.8, -18.2, -3.5],
        [-16, -9.8, XE, -3.5],
        [XW, -3.5, XE, 9.5],
        [XW, 9.5, 9, 14.5],
        [12, 9.5, XE, 14.5],
        [XW, 14.5, XE, ZS],
      ];
      for (const [x0, z0, x1, z1] of mainRects)
        slab("parquet", x0, z0, x1, z1, MAIN, 0.4, { surface: "wood" });
      // studio ceiling plane (underside of the main slab) painted black with pipes
      bmm("stage_black", XW, MAIN - 0.45, ZN, XE, MAIN - 0.4, ZS, {
        segLen: 8,
        noAO: true,
      });
      for (const z of [-12, -4, 4, 12])
        b.cyl("iron", X(0), MAIN - 0.7, Z(z), 0.12, 0.12, 44, 8, {
          rz: HP,
          hSeg: 4,
        });
      // coffered ceiling
      bmm("ball_red", XW, CEIL - 0.2, ZN, XE, CEIL, ZS, {
        segLen: 8,
        c: 0x8a6a60,
      });
      for (let x = XW + 4; x < XE; x += 4)
        bmm("gold_trim", x - 0.15, CEIL - 0.7, ZN, x + 0.15, CEIL - 0.2, ZS, {
          seg: false,
        });
      for (let z = ZN + 4; z < ZS; z += 4)
        bmm("gold_trim", XW, CEIL - 0.7, z - 0.15, XE, CEIL - 0.2, z + 0.15, {
          seg: false,
        });
      bmm(
        "ball_red",
        XW + 0.02,
        MAIN,
        ZN + 0.02,
        XE - 0.02,
        MAIN + 1.1,
        ZN + 0.1,
        { seg: false },
      ); // wainscot
      for (const x of [XW + 0.02, XE - 0.1])
        bmm("ball_red", x, MAIN, ZN, x + 0.08, MAIN + 1.1, 8, { seg: false });
      for (const x of [XW + 0.02, XE - 0.1])
        bmm("gold_trim", x, MAIN + 1.1, ZN, x + 0.1, MAIN + 1.2, 8, {
          seg: false,
        });

      // =====================================================================
      // LOBBY (z 8..16, MAIN)
      // =====================================================================
      wall("ball_red", "x", XW, XE, 7.8, 8.1, MAIN, BALC - 0.4, [
        { c: -8, w: 3, y0: MAIN, h: 3.2 },
        { c: 0, w: 3.4, y0: MAIN, h: 3.4 },
        { c: 8, w: 3, y0: MAIN, h: 3.2 },
      ]);
      bmm("gold_trim", -1.9, MAIN + 3.4, 7.75, 1.9, MAIN + 3.7, 8.15, {
        seg: false,
      });
      bmm("carpet", -12, MAIN + 0.01, 8.2, 12, MAIN + 0.03, ZS - 0.2, {
        seg: false,
        noAO: true,
      });
      // box office booth with brass grille + the terminal
      {
        const x0 = -6,
          x1 = -1.8,
          z0 = 9.6,
          z1 = 12.2;
        solid("mahogany", x0, MAIN, z1 - 0.1, x1, MAIN + 1.05, z1 + 0.1, {
          seg: false,
        });
        bmm("mahogany", x0, MAIN, z0, x0 + 0.15, MAIN + 2.6, z1, {
          seg: false,
        });
        bmm("mahogany", x1 - 0.15, MAIN, z0, x1, MAIN + 2.6, z1, {
          seg: false,
        });
        col(x0, MAIN, z0, x0 + 0.15, MAIN + 2.6, z1);
        col(x1 - 0.15, MAIN, z0, x1, MAIN + 2.6, z1);
        bmm("mahogany", x0, MAIN + 2.6, z0, x1, MAIN + 2.8, z1 + 0.2, {
          seg: false,
        });
        for (let x = x0 + 0.3; x < x1 - 0.2; x += 0.15)
          box("brass", x, MAIN + 1.05, z1 + 0.05, 0.02, 1.55, 0.02, {
            seg: false,
          });
        const bo = PF.texMat(
          "wh_boxoffice",
          PF.signTex("wh_boxoffice", ["BOX OFFICE"], "enamel", 512, 96, {
            bg: "#5a1a1a",
            fg: "#f0d890",
          }),
          {},
        );
        quad(bo, (x0 + x1) / 2, MAIN + 2.95, z1 + 0.22, 3, 0.55, {
          ry: 0,
          grime: 0.2,
        });
        solid("oak", x0 + 0.4, MAIN, z0 + 0.3, x1 - 0.4, MAIN + 0.8, z0 + 1.0, {
          seg: false,
        });
      }
      // coat check → clinic (x 13..22, z 8..16)
      wall("ball_red", "z", 8.1, ZS, 12.8, 13.05, MAIN, BALC - 0.4, [
        { c: 9.4, w: 1.4, y0: MAIN, h: 2.4 },
        { c: 13, w: 4, y0: MAIN + 1.0, h: 1.4 },
      ]);
      solid("oak", 13.05, MAIN, 11, 13.6, MAIN + 1.0, 15, { seg: false });
      for (const [x, z] of [
        [18, 14.2],
        [21, 11.5],
      ]) {
        solid("linen", x - 1, MAIN, z - 0.45, x + 1, MAIN + 0.6, z + 0.45, {
          seg: false,
        });
        box("linen", x - 0.7, MAIN + 0.6, z, 0.4, 0.15, 0.7, { seg: false });
      }
      for (let k = 0; k < 3; k++)
        box("white_paint", 21.5, MAIN, 8.6 + k * 0.9, 0.8, 1.9, 0.8, {
          seg: false,
          grime: 0.4,
        });
      col(21, MAIN, 8.2, XE, MAIN + 1.9, 10.9);
      const clinicKey = PF.texMat(
        "wh_clinic",
        PF.signTex(
          "wh_clinic",
          ["COAT CHECK", "now: DOC WENDT — STITCHES & RAD FLUSH"],
          "enamel",
          512,
          160,
          { bg: "#e8e0c8", fg: "#7a1a1a" },
        ),
        {},
      );
      quad(clinicKey, 12.75, MAIN + 2.9, 13, 3, 0.95, { ry: -HP, grime: 0.2 });
      // grand stair (west): MAIN → BALC, climbing north from z 15.4
      PF.steelStair(b, X(-20), Z(15.4), PI, 3.2, 19 * 0.33, MAIN, BALC, {
        key: "mahogany",
        tread: "carpet",
        railKey: "gold_trim",
      });
      // stair down to the studio (east): top at z 9.5 (MAIN) descending south to z 14.5 (STU)
      PF.steelStair(b, X(10.5), Z(14.5), PI, 2.8, 15 * 0.333, STU, MAIN, {
        key: "mahogany",
        tread: "planks",
        railKey: "gold_trim",
      });
      PF.rail(b, X(8.9), Z(9.5), X(8.9), Z(14.6), MAIN, { key: "gold_trim" });
      PF.rail(b, X(12.1), Z(9.5), X(12.1), Z(14.6), MAIN, { key: "gold_trim" });
      PF.rail(b, X(8.9), Z(14.6), X(12.1), Z(14.6), MAIN, { key: "gold_trim" });
      const downKey = PF.texMat(
        "wh_down",
        PF.signTex("wh_down", ["↓ THE STUDIO ↓"], "neon", 512, 96, {
          fg: "#ff4ab0",
        }),
        { emissive: 1.4 },
      );
      quad(downKey, 10.5, MAIN + 3.0, 8.2, 2.6, 0.5, { ry: 0, grime: 0 });
      // lobby lamps: sconces
      for (const x of [-14, -6, 6, 14]) {
        box("brass", x, MAIN + 2.4, ZS - 0.1, 0.2, 0.4, 0.15, { seg: false });
        b.sphere("bulb", X(x), MAIN + 2.75, Z(ZS - 0.2), 0.1, {
          ws: 6,
          hs: 4,
          noAO: true,
        });
        PF.glow(P(x, MAIN + 2.8, ZS - 0.4), 0xffd090, 1.2, root, {
          intensity: 1.0,
        });
      }
      // gig posters in the lobby
      [
        ["p1", "THE RADIUM|RHYTHM KINGS", "DANCING NIGHTLY", "#1c2a4a"],
        ["p2", "LULU|MONROE", "THE CANARY OF 11th ST", "#4a1c2a"],
        ["p3", "SWING|NIGHT", "EVERY SATURDAY", "#2a3a1c"],
      ].forEach(([k, t, s, bg], i) => {
        const pk = PF.texMat("wh_" + k, PF.posterTex(k, t, s, bg), {
          rough: 0.9,
        });
        quad(pk, -16 + i * 1.6, MAIN + 1.9, 8.25, 1.1, 1.65, {
          ry: 0,
          grime: 0.2,
        });
      });

      // =====================================================================
      // GRAND BALLROOM (z -16..8, MAIN)
      // =====================================================================
      // inlaid dance floor border
      for (const [x0, z0, x1, z1] of [
        [-12, -8, 12, -7.8],
        [-12, 3.8, 12, 4],
        [-12, -8, -11.8, 4],
        [11.8, -8, 12, 4],
      ])
        bmm("mahogany", x0, MAIN + 0.005, z0, x1, MAIN + 0.02, z1, {
          seg: false,
          noAO: true,
        });
      // --- stage ---
      solid("stage_black", -12, MAIN, ZN, 12, STAGE, -10, {
        walk: true,
        segLen: 6,
      });
      solid("stage_black", -18.2, MAIN, ZN, -12, STAGE, -9.8, {
        walk: true,
        segLen: 6,
      }); // stage-left wing (back stair arrives here)
      bmm("gold_trim", -12, STAGE - 0.1, -10.05, 12, STAGE, -9.9, {
        seg: false,
      });
      for (const sx of [-1, 1])
        PF.stairs(
          b,
          "stage_black",
          X(sx * 10),
          Z(-8.3),
          PI,
          2.2,
          1.6,
          MAIN,
          STAGE,
          { surface: "wood" },
        );
      // footlights
      for (let x = -11.5; x <= 11.5; x += 0.8) {
        b.box("brass", X(x), STAGE, Z(-10.2), 0.25, 0.12, 0.2, { seg: false });
        b.sphere("bulb", X(x), STAGE + 0.1, Z(-10.25), 0.06, {
          ws: 5,
          hs: 3,
          noAO: true,
        });
      }
      for (const x of [-8, 0, 8])
        PF.glow(P(x, STAGE + 0.2, -10.4), 0xffe0a0, 1.4, root, {
          intensity: 0.9,
        });
      // proscenium arch: gold-framed piers + segmental top + valance
      for (const sx of [-1, 1]) {
        solid(
          "gold_trim",
          sx * 12.3 - 0.4,
          STAGE,
          -10.4,
          sx * 12.3 + 0.4,
          STAGE + 8.6,
          -9.8,
          { seg: false, surface: "wood" },
        );
      }
      {
        const N = 14;
        for (let i = 0; i < N; i++) {
          const t = i / (N - 1) - 0.5;
          const x = t * 24.6;
          const y = STAGE + 8.4 + Math.cos(t * PI) * 1.2;
          box("gold_trim", x, y, -10.1, 24.6 / N + 0.1, 0.6, 0.5, {
            rz: -t * 0.35,
            seg: false,
          });
        }
        bmm("ball_red", -12.3, STAGE + 8.4, -10.3, 12.3, CEIL - 0.7, -10.0, {
          seg: false,
        });
        const valN = 24;
        for (let i = 0; i < valN; i++)
          box(
            "curtain",
            -11.8 + i * 1.0,
            STAGE + 7.6,
            -10.3,
            1.0,
            1.0,
            0.12 + (i % 2) * 0.08,
            { seg: false },
          );
      }
      // curtains gathered at the sides (fluted columns of fabric)
      for (const sx of [-1, 1])
        for (let k = 0; k < 7; k++)
          b.cyl(
            "curtain",
            X(sx * (11.4 - k * 0.32)),
            STAGE,
            Z(-10.6 - (k % 2) * 0.15),
            0.2,
            0.26,
            7.6,
            7,
            { hSeg: 2 },
          );
      // backdrop banner
      const bdKey = PF.texMat(
        "wh_backdrop",
        PF.canvasTex(
          "pch_wh_backdrop",
          1024,
          384,
          (ctx, w, h) => {
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, "#1a1030");
            g.addColorStop(1, "#3a1a3a");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
            ctx.save();
            ctx.translate(w / 2, h * 1.05);
            for (let i = 0; i < 26; i++) {
              ctx.rotate(PI / 26);
              ctx.fillStyle =
                i % 2 ? "rgba(255,200,120,0.14)" : "rgba(255,255,255,0.03)";
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(-40, -900);
              ctx.lineTo(40, -900);
              ctx.fill();
            }
            ctx.restore();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "italic bold 96px Georgia, serif";
            ctx.fillStyle = "#ffd070";
            ctx.shadowColor = "#ff8a3a";
            ctx.shadowBlur = 20;
            ctx.fillText("The Radium", w / 2, h * 0.34);
            ctx.font = 'bold 110px Impact, "Arial Black", sans-serif';
            ctx.fillStyle = "#f0e8d8";
            ctx.fillText("RHYTHM KINGS", w / 2, h * 0.68);
            ctx.shadowBlur = 0;
            for (let i = 0; i < 80; i++) {
              ctx.fillStyle = "rgba(0,0,0," + Math.random() * 0.25 + ")";
              ctx.beginPath();
              ctx.ellipse(
                Math.random() * w,
                Math.random() * h,
                5 + Math.random() * 40,
                3 + Math.random() * 20,
                0,
                0,
                TAU,
              );
              ctx.fill();
            }
          },
          { clamp: true },
        ),
        { rough: 0.9, emissive: 0.25 },
      );
      quad(bdKey, 0, STAGE + 4.2, ZN + 0.12, 18, 6.75, { ry: 0, grime: 0.2 });
      // band instruments
      {
        // drum kit (Hot Rod) at x 4, z -14.5
        const dx = 4,
          dz = -14.2;
        b.cyl("paint_red", X(dx), STAGE + 0.35, Z(dz), 0.45, 0.45, 0.5, 14, {
          rx: HP,
          hSeg: 1,
        }); // bass drum
        b.cyl(
          "linen",
          X(dx),
          STAGE + 0.35,
          Z(dz + 0.27),
          0.42,
          0.42,
          0.02,
          14,
          { rx: HP, hSeg: 1 },
        );
        for (const [ox, oz, r, h] of [
          [-0.7, 0.2, 0.25, 0.25],
          [0.7, 0.1, 0.28, 0.28],
          [0.25, -0.3, 0.2, 0.18],
          [-0.25, -0.3, 0.2, 0.18],
        ]) {
          b.cyl(
            "paint_red",
            X(dx + ox),
            STAGE + 0.55,
            Z(dz + oz),
            r,
            r,
            h,
            12,
            { hSeg: 1 },
          );
          b.cyl("steel", X(dx + ox), STAGE, Z(dz + oz), 0.02, 0.02, 0.55, 4, {
            hSeg: 1,
          });
        }
        for (const [ox, oz, y] of [
          [-1.1, -0.2, 1.1],
          [1.2, -0.5, 1.25],
        ]) {
          b.cyl(
            "brass",
            X(dx + ox),
            STAGE + y,
            Z(dz + oz),
            0.36,
            0.36,
            0.015,
            14,
            { hSeg: 1 },
          );
          b.cyl("steel", X(dx + ox), STAGE, Z(dz + oz), 0.015, 0.015, y, 4, {
            hSeg: 1,
          });
        }
        // upright bass (Slim) at x -4
        b.lathe(
          "mahogany",
          [
            [0.02, 0],
            [0.3, 0.1],
            [0.36, 0.45],
            [0.22, 0.75],
            [0.3, 1.1],
            [0.22, 1.35],
            [0.05, 1.45],
          ],
          12,
          X(-4.6),
          STAGE + 0.15,
          Z(-14.2),
          { sz: 0.45 },
        );
        b.beam(
          "stage_black",
          P(-4.6, STAGE + 1.5, -14.2),
          P(-4.6, STAGE + 2.3, -14.2),
          0.06,
          0.05,
          {},
        );
        // grand piano (house) at x -8
        solid("stage_black", -9.6, STAGE + 0.7, -15, -7.4, STAGE + 1.0, -12.6, {
          seg: false,
        });
        bmm("stage_black", -9.6, STAGE + 1.0, -15, -9.5, STAGE + 1.9, -12.6, {
          rz: 0.5,
          seg: false,
        });
        for (const [x, z] of [
          [-9.4, -14.8],
          [-7.6, -14.8],
          [-8.5, -12.8],
        ])
          box("stage_black", x, STAGE, z, 0.12, 0.7, 0.12, { seg: false });
        bmm("linen", -9.5, STAGE + 0.85, -12.6, -7.5, STAGE + 0.9, -12.3, {
          seg: false,
        });
        // mic stand + music stands + a trumpet on a chair
        b.cyl("chrome", X(0), STAGE, Z(-11.2), 0.2, 0.2, 0.03, 10, { hSeg: 1 });
        b.cyl("chrome", X(0), STAGE, Z(-11.2), 0.015, 0.015, 1.55, 4, {
          hSeg: 1,
        });
        b.sphere("chrome", X(0), STAGE + 1.6, Z(-11.2), 0.06, {
          sy: 1.4,
          ws: 6,
          hs: 4,
        });
        for (const x of [-5.6, -2.2, 2.2]) {
          b.cyl("iron", X(x), STAGE, Z(-12.6), 0.012, 0.012, 1.1, 4, {
            hSeg: 1,
          });
          box("iron", x, STAGE + 1.1, -12.6, 0.5, 0.35, 0.02, {
            rx: -0.3,
            seg: false,
          });
        }
        b.cyl("brass", X(1.2), STAGE + 0.52, Z(-13), 0.05, 0.12, 0.35, 8, {
          rz: HP,
          hSeg: 1,
        });
        PF.dress.chair(b, X(1.2), STAGE, Z(-13), PI, false, "mahogany");
        // speaker cabinets & a spotlight on a stand
        for (const sx of [-1, 1]) {
          solid(
            "stage_black",
            sx * 10.2 - 0.6,
            STAGE,
            -15.8,
            sx * 10.2 + 0.6,
            STAGE + 1.8,
            -14.9,
            { seg: false },
          );
          quad("fabric", sx * 10.2, STAGE + 0.9, -14.88, 1.0, 1.5, {
            ry: 0,
            grime: 0.4,
            c: 0x302828,
          });
        }
      }
      // --- chandeliers + mirror ball ---
      for (const z of [-8, -1, 5]) {
        b.beam(
          "iron",
          P(0, CEIL - 0.7, z),
          P(0, CEIL - 2.6, z),
          0.03,
          0.03,
          {},
        );
        b.cyl("gold_trim", X(0), CEIL - 3.2, Z(z), 1.4, 0.5, 0.6, 16, {
          hSeg: 1,
        });
        b.cyl("gold_trim", X(0), CEIL - 2.7, Z(z), 0.3, 0.8, 0.3, 12, {
          hSeg: 1,
        });
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * TAU;
          b.sphere(
            "bulb",
            X(Math.cos(a) * 1.35),
            CEIL - 2.55,
            Z(z + Math.sin(a) * 1.35),
            0.09,
            { ws: 5, hs: 3, noAO: true },
          );
          b.beam(
            "gold_trim",
            P(Math.cos(a) * 1.35, CEIL - 2.6, z + Math.sin(a) * 1.35),
            P(Math.cos(a) * 0.5, CEIL - 3.1, z + Math.sin(a) * 0.5),
            0.03,
            0.03,
            {},
          );
        }
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * TAU + 0.2;
          b.beam(
            "glass_dark",
            P(Math.cos(a) * 1.2, CEIL - 3.2, z + Math.sin(a) * 1.2),
            P(Math.cos(a) * 1.2, CEIL - 3.8, z + Math.sin(a) * 1.2),
            0.03,
            0.03,
            {},
          );
        }
        PF.glow(P(0, CEIL - 2.8, z), 0xffe0a0, 4.4, root, { intensity: 1.1 });
      }
      {
        const ball = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.75, 2),
          PF.mat("mirror"),
        );
        ball.geometry.setAttribute(
          "color",
          new THREE.BufferAttribute(
            new Float32Array(ball.geometry.attributes.position.count * 3).fill(
              1,
            ),
            3,
          ),
        );
        ball.position.copy(P(0, CEIL - 5.0, -2));
        root.add(ball);
        b.beam(
          "iron",
          P(0, CEIL - 0.7, -2),
          P(0, CEIL - 4.3, -2),
          0.02,
          0.02,
          {},
        );
        PF.animate(P(0, MAIN, -2), 80, (t) => {
          ball.rotation.y = t * 0.4;
        });
        PF.glow(P(0, CEIL - 5.0, -2), 0xffffff, 1.6, root, {
          intensity: 0.9,
          flicker: 0.4,
        });
        // dance-floor light spots (colored glows on the floor)
        const spots = [];
        for (let k = 0; k < 6; k++)
          spots.push(
            PF.glow(
              P(Math.cos(k) * 5, MAIN + 0.05, -2 + Math.sin(k) * 4),
              [0xff4ab0, 0x40b8ff, 0xffd060][k % 3],
              1.8,
              root,
              { intensity: 0.8 },
            ),
          );
        PF.animate(P(0, MAIN, -2), 60, (t) => {
          spots.forEach((sp, k) => {
            const s = sp.sprite;
            if (!s) return;
            const a = t * 0.4 + k * 1.05;
            s.position.set(
              X(Math.cos(a) * (3 + (k % 3) * 2)),
              MAIN + 0.05,
              Z(-2 + Math.sin(a) * (2.5 + (k % 2) * 2)),
            );
          });
        });
      }
      // --- the bar (east, under the balcony) ---
      {
        solid("mahogany", 14.2, MAIN, -8, 15, MAIN + 1.1, 5, { seg: false });
        bmm("marble_bar", 14.0, MAIN + 1.1, -8.1, 15.2, MAIN + 1.18, 5.1, {
          seg: false,
        });
        bmm("brass", 13.95, MAIN + 0.12, -8, 14.02, MAIN + 0.18, 5, {
          seg: false,
        }); // foot rail
        solid("mahogany", 14.2, MAIN, 5, 21.8, MAIN + 1.1, 5.8, { seg: false });
        // back bar: shelves, mirror, bottles, taps
        PF.dress.shelf(b, X(21.5), MAIN, Z(-5), -HP, 4, 4, 91);
        PF.dress.shelf(b, X(21.5), MAIN, Z(0), -HP, 4, 4, 92);
        bmm("mirror", 21.9, MAIN + 2.0, -7.5, 21.95, MAIN + 3.4, 2.5, {
          seg: false,
        });
        bmm("gold_trim", 21.8, MAIN + 3.4, -7.6, 22, MAIN + 3.6, 2.6, {
          seg: false,
        });
        for (let k = 0; k < 4; k++) {
          b.cyl(
            "brass",
            X(14.7),
            MAIN + 1.18,
            Z(-2 + k * 0.4),
            0.04,
            0.04,
            0.45,
            6,
            { hSeg: 1 },
          );
          box("stage_black", 14.7, MAIN + 1.6, -2 + k * 0.4, 0.06, 0.18, 0.06, {
            seg: false,
          });
        }
        for (let z = -7; z <= 4; z += 1.2) {
          b.cyl("chrome", X(13.4), MAIN, Z(z), 0.04, 0.04, 0.72, 6, {
            hSeg: 1,
          });
          b.cyl("velvet", X(13.4), MAIN + 0.72, Z(z), 0.22, 0.2, 0.08, 10, {
            hSeg: 1,
          });
        }
        const barKey = PF.neonKey("wh_bar", "COCKTAILS", "#ffb040", {
          w: 1024,
          h: 200,
          italic: true,
          font: "Georgia, serif",
        });
        quad(barKey, 21.9, MAIN + 4.1, -2.5, 5, 1.0, {
          ry: -HP,
          noAO: true,
          grime: 0,
        });
        PF.glow(P(21.3, MAIN + 4.1, -2.5), 0xffb040, 3, root, {
          intensity: 0.9,
        });
        for (const z of [-6, -2, 2]) {
          b.cyl("brass", X(17.5), BALC - 0.5, Z(z), 0.2, 0.05, 0.25, 8, {
            hSeg: 1,
            open: true,
          });
          b.sphere("bulb", X(17.5), BALC - 0.6, Z(z), 0.08, {
            ws: 5,
            hs: 3,
            noAO: true,
          });
          PF.glow(P(17.5, BALC - 0.75, z), 0xffc070, 1.2, root, {
            intensity: 1.0,
          });
        }
      }
      // --- tables & chairs (west, under the balcony) with candles ---
      for (const [x, z] of [
        [-20.2, -12.6],
        [-20.2, -7],
        [-20.2, -1.6],
        [-19.5, 3.5],
        [-13.8, -1.5],
        [-14.5, 5.5],
        [13.3, 6.8],
      ]) {
        b.cyl("mahogany", X(x), MAIN, Z(z), 0.08, 0.25, 0.72, 8, { hSeg: 1 });
        b.cyl("linen", X(x), MAIN + 0.72, Z(z), 0.55, 0.55, 0.04, 14, {
          hSeg: 1,
        });
        col(x - 0.45, MAIN, z - 0.45, x + 0.45, MAIN + 0.76, z + 0.45);
        for (let k = 0; k < 3; k++)
          PF.dress.chair(
            b,
            X(x + Math.cos(k * 2.1) * 0.95),
            MAIN,
            Z(z + Math.sin(k * 2.1) * 0.95),
            -k * 2.1 - HP,
            (x * 3 + z + k) % 7 === 0,
            "mahogany",
          );
        PF.candles(b, X(x), MAIN + 0.76, Z(z), 2, (x * 7 + z) | 0, root);
      }
      // balcony support columns (cast iron with gilded capitals)
      for (const x of [-16, 16])
        for (const z of [-12, -6, 0, 6]) {
          b.cyl(
            "stage_black",
            X(x),
            MAIN,
            Z(z),
            0.2,
            0.24,
            BALC - MAIN - 0.6,
            10,
            { hSeg: 2 },
          );
          b.cyl("gold_trim", X(x), BALC - 0.9, Z(z), 0.42, 0.22, 0.5, 10, {
            hSeg: 1,
          });
          col(x - 0.28, MAIN, z - 0.28, x + 0.28, BALC, z + 0.28);
        }
      for (const x of [-8, 0, 8]) {
        b.cyl(
          "stage_black",
          X(x),
          MAIN,
          Z(2),
          0.2,
          0.24,
          BALC - MAIN - 0.6,
          10,
          { hSeg: 2 },
        );
        b.cyl("gold_trim", X(x), BALC - 0.9, Z(2), 0.42, 0.22, 0.5, 10, {
          hSeg: 1,
        });
        col(x - 0.28, MAIN, 1.72, x + 0.28, BALC, 2.28);
      }
      // back-stair opening in the ballroom floor (under the west balcony) railing
      PF.rail(b, X(-15.9), Z(-9.8), X(-15.9), Z(-3.5), MAIN, {
        key: "gold_trim",
      });
      PF.rail(b, X(-18.3), Z(-3.4), X(-15.9), Z(-3.4), MAIN, {
        key: "gold_trim",
      });
      PF.rail(b, X(-18.3), Z(-9.8), X(-18.3), Z(-3.4), MAIN, {
        key: "gold_trim",
      });

      // =====================================================================
      // BALCONIES (BALC 10) + upstairs rooms
      // =====================================================================
      slab("parquet", XW, ZN, -16, 8, BALC, 0.5, { surface: "wood" });
      slab("parquet", 16, ZN, XE, 8, BALC, 0.5, { surface: "wood" });
      slab("parquet", -16, 2, 16, 8, BALC, 0.5, { surface: "wood" });
      slab("parquet", -18.2, 8, XE, ZS, BALC, 0.5, { surface: "wood" });
      slab("parquet", XW, 8, -18.2, 9.3, BALC, 0.5, { surface: "wood" }); // grand-stair landing
      // balcony fronts: panelled parapet with gold rail, colliders
      const front = (x0, z0, x1, z1) => {
        bmm(
          "ball_red",
          Math.min(x0, x1) - 0.1,
          BALC - 0.9,
          Math.min(z0, z1) - 0.1,
          Math.max(x0, x1) + 0.1,
          BALC + 0.9,
          Math.max(z0, z1) + 0.1,
          { seg: false },
        );
        bmm(
          "gold_trim",
          Math.min(x0, x1) - 0.15,
          BALC + 0.9,
          Math.min(z0, z1) - 0.15,
          Math.max(x0, x1) + 0.15,
          BALC + 1.0,
          Math.max(z0, z1) + 0.15,
          { seg: false },
        );
        bmm(
          "gold_trim",
          Math.min(x0, x1) - 0.14,
          BALC - 0.5,
          Math.min(z0, z1) - 0.14,
          Math.max(x0, x1) + 0.14,
          BALC - 0.4,
          Math.max(z0, z1) + 0.14,
          { seg: false },
        );
        col(
          Math.min(x0, x1) - 0.1,
          BALC - 0.9,
          Math.min(z0, z1) - 0.1,
          Math.max(x0, x1) + 0.1,
          BALC + 1.0,
          Math.max(z0, z1) + 0.1,
        );
      };
      front(-16, ZN, -16, 2);
      front(16, ZN, 16, 2);
      front(-16, 2, 16, 2);
      // balcony seating: benches in rows
      for (const x of [-20.5, -18.3, 18.3, 20.5])
        for (let z = -14; z < 0; z += 2.4) {
          box("velvet", x, BALC, z, 1.6, 0.45, 1.8, { seg: false });
          box(
            "velvet",
            x + (x < 0 ? -0.7 : 0.7),
            BALC + 0.45,
            z,
            0.2,
            0.5,
            1.8,
            { seg: false },
          );
        }
      for (let x = -12; x <= 12; x += 3) {
        box("velvet", x, BALC, 5.5, 2.4, 0.45, 0.6, { seg: false });
        box("velvet", x, BALC + 0.45, 5.9, 2.4, 0.5, 0.2, { seg: false });
      }
      // upstairs rooms over the lobby (z 8..16): partition wall with doors
      wall("ball_red", "x", XW, XE, 7.9, 8.15, BALC, CEIL, [
        { c: -20.2, w: 3.2, y0: BALC, h: 2.8 },
        { c: -9, w: 1.4, y0: BALC, h: 2.4 },
        { c: 5, w: 1.4, y0: BALC, h: 2.4 },
        { c: 16, w: 1.4, y0: BALC, h: 2.4 },
      ]);
      wall("ball_red", "z", 8.15, ZS, -18.2, -17.95, BALC, CEIL, []);
      wall("ball_red", "z", 8.15, ZS, 0, 0.25, BALC, CEIL, []);
      wall("ball_red", "z", 8.15, ZS, 11, 11.25, BALC, CEIL, []);
      // stair hall opening: the grand stair arrives at z 9.1 in x -21.6..-18.4
      // VIP lounge (x -18..0): velvet sofas, pool table, bar cart, portraits
      bmm("carpet", -17.9, BALC + 0.01, 8.2, -0.1, BALC + 0.03, ZS - 0.1, {
        seg: false,
        noAO: true,
        c: 0x6a4a8a,
      });
      solid("mahogany", -11, BALC, 11, -7, BALC + 0.8, 13, { seg: false });
      bmm("felt", -10.8, BALC + 0.8, 11.2, -7.2, BALC + 0.84, 12.8, {
        seg: false,
      });
      for (const [x, z, c] of [
        [-9.5, 11.6, "paint_red"],
        [-8.2, 12.3, "cake_cream"],
        [-8.9, 11.9, "boxcar_yel"],
      ])
        b.sphere(c, X(x), BALC + 0.9, Z(z), 0.06, { ws: 6, hs: 4 });
      for (const [x, z, r] of [
        [-16.5, 11, HP],
        [-3, 14.8, PI],
        [-15, 14.8, PI],
      ]) {
        box(
          "velvet",
          x,
          BALC,
          z,
          r === HP ? 0.9 : 2.4,
          0.45,
          r === HP ? 2.4 : 0.9,
          { seg: false },
        );
        col(
          x - (r === HP ? 0.45 : 1.2),
          BALC,
          z - (r === HP ? 1.2 : 0.45),
          x + (r === HP ? 0.45 : 1.2),
          BALC + 0.8,
          z + (r === HP ? 1.2 : 0.45),
        );
      }
      PF.dress.painting(b, 2, X(-9), BALC + 2.2, Z(ZS - 0.05), 2.0, 1.4, PI);
      PF.dress.painting(b, 6, X(-17.9), BALC + 2.1, Z(12), 1.3, 1.6, HP);
      // green room (x 0..11): mirror with bulbs, costume rack, the band's lockers
      bmm("oak", 0.5, BALC, 15, 6, BALC + 0.8, 15.8, { seg: false });
      col(0.5, BALC, 15, 6, BALC + 0.8, 15.8);
      bmm("mirror", 0.8, BALC + 1.1, 15.85, 5.7, BALC + 2.1, 15.9, {
        seg: false,
      });
      for (let x = 1; x <= 5.5; x += 0.5)
        for (const y of [BALC + 1.0, BALC + 2.2])
          b.sphere("bulb", X(x), y, Z(15.8), 0.05, {
            ws: 4,
            hs: 3,
            noAO: true,
          });
      PF.glow(P(3.2, BALC + 1.6, 15.5), 0xffe8c0, 2.2, root, {
        intensity: 0.9,
      });
      b.beam(
        "chrome",
        P(8, BALC + 1.8, 9),
        P(8, BALC + 1.8, 13),
        0.03,
        0.03,
        {},
      );
      for (let z = 9.3; z < 12.8; z += 0.35)
        box(
          ["curtain", "velvet", "linen", "felt"][((z * 3) | 0) % 4],
          8,
          BALC + 0.7,
          z,
          0.5,
          1.05,
          0.08,
          { seg: false },
        );
      for (const z of [9, 10]) {
        b.cyl("iron", X(8), BALC, Z(z - 0.5 + 0.5 * 0), 0.02, 0.02, 1.8, 4, {
          hSeg: 1,
        });
      }
      // bunk room (x 11..22): bunk beds for the settlers
      for (const x of [13.5, 17, 20.5]) {
        for (const y of [BALC + 0.4, BALC + 1.8]) {
          box("rust", x, y, 13.5, 0.95, 0.1, 2.0, { seg: false });
          box("fabric", x, y + 0.1, 13.5, 0.9, 0.15, 1.9, {
            seg: false,
            c: 0xa89878,
          });
        }
        for (const [dx, dz] of [
          [-0.45, -1],
          [0.45, -1],
          [-0.45, 1],
          [0.45, 1],
        ])
          box("rust", x + dx, BALC, 13.5 + dz, 0.05, 2.3, 0.05, { seg: false });
        col(x - 0.5, BALC, 12.5, x + 0.5, BALC + 2.3, 14.5);
      }
      // windows over the lobby (south) on upper rooms: glow panes
      for (const x of [-14, -6, 4, 16])
        quad("window_lit", x, BALC + 2.2, ZS - 0.05, 1.6, 2.2, {
          ry: PI,
          noAO: true,
          grime: 0.3,
        });

      // =====================================================================
      // THE STUDIO (basement, y 0..4.05)
      // =====================================================================
      // DJ booth (raised) against the north wall, turntables, record crates, transmitter
      solid("stage_black", -4, STU, ZN, 4, STU + 0.6, -12.5, {
        walk: true,
        seg: false,
      });
      PF.stairs(
        b,
        "stage_black",
        X(0),
        Z(-11.1),
        PI,
        1.8,
        1.2,
        STU,
        STU + 0.6,
        {},
      );
      solid("stage_black", -3, STU + 0.6, -13.6, 3, STU + 1.6, -12.9, {
        seg: false,
      });
      for (const x of [-1.6, 1.6]) {
        box("panel", x, STU + 1.6, -13.25, 0.9, 0.12, 0.6, { seg: false });
        b.cyl(
          "stage_black",
          X(x),
          STU + 1.72,
          Z(-13.25),
          0.26,
          0.26,
          0.02,
          16,
          { hSeg: 1 },
        );
      }
      for (let i = 0; i < 6; i++)
        box("crate", -3.4 + i * 0.25, STU + 0.6, -15.5, 0.24, 0.35, 0.35, {
          seg: false,
        });
      solid("army", 2.2, STU + 0.6, -15.9, 3.9, STU + 2.4, -15.2, {
        seg: false,
      });
      for (let k = 0; k < 5; k++)
        quad(
          k % 2 ? "lamp_green" : "screen",
          2.5 + (k % 3) * 0.5,
          STU + 1.3 + Math.floor(k / 3) * 0.5,
          -15.18,
          0.3,
          0.2,
          { ry: 0, noAO: true },
        );
      const studioKey = PF.neonKey("wh_studio", "THE STUDIO", "#ff4ab0", {
        w: 1024,
        h: 200,
      });
      quad(studioKey, 0, STU + 3.2, ZN + 0.08, 6, 1.2, {
        ry: 0,
        noAO: true,
        grime: 0,
      });
      PF.glow(P(0, STU + 3.2, ZN + 0.6), 0xff4ab0, 4, root, { intensity: 1.0 });
      // checkerboard dance floor
      for (let i = -5; i < 5; i++)
        for (let k = -4; k < 3; k++)
          if ((i + k) % 2 === 0)
            bmm(
              "stage_black",
              i * 1.2,
              STU + 0.021,
              -8 + k * 1.2,
              i * 1.2 + 1.2,
              STU + 0.03,
              -8 + k * 1.2 + 1.2,
              { seg: false, noAO: true },
            );
      // studio bar (east) + booths (west)
      solid("mahogany", 10, STU, -2, 11, STU + 1.05, 7, { seg: false });
      bmm("marble_bar", 9.8, STU + 1.05, -2.1, 11.2, STU + 1.12, 7.1, {
        seg: false,
      });
      PF.dress.shelf(b, X(12.6), STU, Z(2.5), -HP, 4, 3, 93);
      for (const z of [-4, 0, 4]) {
        box("velvet", -12, STU, z, 2.4, 0.45, 0.6, { seg: false });
        box("velvet", -12, STU + 0.45, z - 0.5, 2.4, 0.7, 0.2, { seg: false });
        b.cyl("mahogany", X(-12), STU, Z(z + 0.9), 0.4, 0.4, 0.72, 10, {
          hSeg: 1,
        });
        col(-13.2, STU, z - 0.6, -10.8, STU + 0.9, z + 1.3);
      }
      const blueKey = PF.neonKey("wh_dance", "DANCE", "#40b8ff", {
        w: 512,
        h: 160,
      });
      quad(blueKey, XW + 0.08, STU + 2.6, 0, 3, 0.9, {
        ry: HP,
        noAO: true,
        grime: 0,
      });
      PF.glow(P(XW + 0.5, STU + 2.6, 0), 0x40b8ff, 3, root, { intensity: 0.9 });
      // generator room (x -22..-12, z -16..-6): the sputtering Hearth generator
      wall("concrete", "x", XW, -12, -10.2, -9.9, STU, MAIN - 0.45, [
        { c: -14, w: 1.6, y0: STU, h: 2.4 },
      ]);
      wall("concrete", "z", ZN, -10.2, -12.3, -12, STU, MAIN - 0.45, []);
      {
        const gx = -17.5,
          gz = -13.2;
        b.cyl("vault_dark", X(gx), STU, Z(gz), 1.3, 1.5, 0.6, 16, { hSeg: 1 });
        b.cyl("chrome", X(gx), STU + 0.6, Z(gz), 1.0, 1.0, 1.8, 16, {
          hSeg: 2,
        });
        for (let k = 0; k < 5; k++)
          b.cyl(
            "brass",
            X(gx),
            STU + 0.8 + k * 0.35,
            Z(gz),
            1.06,
            1.06,
            0.1,
            16,
            { hSeg: 1 },
          );
        b.cyl("vault_dark", X(gx), STU + 2.4, Z(gz), 0.8, 1.1, 0.6, 16, {
          hSeg: 1,
        });
        b.sphere("lamp_blue", X(gx), STU + 3.1, Z(gz), 0.35, {
          ws: 10,
          hs: 6,
          noAO: true,
        });
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * TAU;
          b.cyl(
            "iron",
            X(gx + Math.cos(a) * 1.8),
            STU,
            Z(gz + Math.sin(a) * 1.8),
            0.1,
            0.1,
            MAIN - 0.5,
            6,
            { hSeg: 1 },
          );
          PF.dress.cable(
            b,
            [
              P(gx + Math.cos(a) * 1.0, STU + 2.2, gz + Math.sin(a) * 1.0),
              P(gx + Math.cos(a) * 1.8, STU + 3.6, gz + Math.sin(a) * 1.8),
            ],
            0.25,
          );
        }
        col(gx - 1.5, STU, gz - 1.5, gx + 1.5, STU + 3.4, gz + 1.5);
        solid("panel", -14.6, STU, -15.9, -12.6, STU + 1.4, -15.2, {
          seg: false,
        });
        quad("screen", -13.6, STU + 1.1, -15.18, 1.2, 0.5, {
          ry: 0,
          noAO: true,
        });
        PF.wh = PF.wh || {};
        PF.wh.genPos = P(-13.6, STU + 1.2, -14.9);
        PF.wh.genGlow = PF.glow(P(gx, STU + 3.1, gz), 0x80c8ff, 2.6, root, {
          intensity: 1.2,
          flicker: 0.6,
        });
        const gk = PF.texMat(
          "wh_gen",
          PF.signTex(
            "wh_gen",
            ['CONSOLIDATED DYNAMO "HEARTH" 40kW', "DANGER — HIGH VOLTAGE"],
            "enamel",
            512,
            160,
            { bg: "#c8a020", fg: "#1a1a1a" },
          ),
          {},
        );
        quad(gk, gx, STU + 2.2, gz + 1.52, 1.8, 0.56, { ry: 0, grime: 0.2 });
      }
      // storage (x 12..22, z -16..-4): kegs, crates, Gina's stash
      wall("concrete", "x", 12, XE, -4.2, -3.9, STU, MAIN - 0.45, [
        { c: 14, w: 1.6, y0: STU, h: 2.4 },
      ]);
      wall("concrete", "z", ZN, -4.2, 11.7, 12, STU, MAIN - 0.45, []);
      for (let i = 0; i < 8; i++) {
        b.cyl(
          "oak",
          X(14 + (i % 4) * 1.1),
          STU + (i >= 4 ? 0.9 : 0),
          Z(-15),
          0.4,
          0.4,
          0.9,
          12,
          { hSeg: 1, rz: HP },
        );
      }
      col(13.4, STU, -15.6, 18.2, STU + 1.8, -14.4);
      PF.dress.crates(b, X(19.5), STU, Z(-13), 3, 94);
      PF.dress.crates(b, X(20.6), STU, Z(-9), 2, 95);
      // back stair: studio → stage-left wing (x -18.2..-16, z -3.5 → -9.8)
      PF.steelStair(b, X(-17.1), Z(-3.5), PI, 2.1, 19 * 0.333, STU, STAGE, {
        key: "stage_black",
        tread: "planks",
        railKey: "iron",
      });
      const stageDoor = PF.texMat(
        "wh_stagedoor",
        PF.signTex(
          "wh_stagedoor",
          ["STAGE ↑", "PERFORMERS ONLY"],
          "enamel",
          256,
          128,
          { bg: "#1a1a1a", fg: "#f0d890" },
        ),
        {},
      );
      quad(stageDoor, -17.1, STU + 2.6, -3.3, 1.2, 0.6, { ry: 0, grime: 0.2 });
      // studio dressing: skeleton of a old-world DJ still at a booth; records scattered
      PF.skeleton(b, X(-11.8), STU + 0.45, Z(4), HP);
      PF.dress.papers(b, X(1), STU, Z(-9), 3, 20, 97);

      PF.flushGlows(root);
      b.build(root, { lodDistInt: 400 });
      PF.fires.splice(0);

      // =====================================================================
      // anchors, doors, props, NPC placement
      // =====================================================================
      const A = {
        entrance: PF.anchor(X(0), MAIN + 0.05, Z(13.6), 0),
        dizzy: PF.anchor(X(-1.2), STAGE, Z(-12.2), PI),
        slim: PF.anchor(X(-4.6), STAGE, Z(-13.4), PI),
        hotrod: PF.anchor(X(4), STAGE, Z(-15.2), PI),
        lulu: PF.anchor(X(0), STAGE, Z(-11.8), PI),
        bartender: PF.anchor(X(17.6), MAIN, Z(-1.5), HP),
        doctor: PF.anchor(X(16.5), MAIN, Z(12.5), HP),
        dj: PF.anchor(X(0), STU + 0.6, Z(-14), PI),
        patron1: PF.anchor(X(-2), MAIN, Z(-3), 0.6),
        patron2: PF.anchor(X(2.5), MAIN, Z(-1), -2.2),
        patron3: PF.anchor(X(12.8), MAIN, Z(-5), -HP),
        patron4: PF.anchor(X(-19), BALC, Z(-6), -HP),
        bed: PF.anchor(X(17), BALC + 0.6, Z(13.5), PI),
      };
      Object.assign(A, {
        npc1: A.dizzy,
        npc2: A.bartender,
        npc3: A.doctor,
        npc4: A.dj,
        merchant: A.bartender,
        spawn1: A.patron1,
        spawn2: A.patron2,
        spawn3: P(-18, BALC, 0),
        spawn4: P(18, BALC, 0),
        spawn5: P(0, STU, 0),
        spawn6: P(-6, MAIN, 12),
        loot1: P(17, STU, -13),
        loot2: P(3, BALC, 15.2),
        loot3: P(-4, MAIN, 10.2),
      });
      PF.wh = PF.wh || {};
      PF.wh.int = A;
      const WHX = PF.WH;
      const door0 = WHX.door || V3(160, 1.6, 303.9);
      PF.door({
        id: "pch_wh_in",
        pos: door0,
        label: "Webster Hall",
        verb: "Enter",
        radius: 1.5,
        target: { x: A.entrance.x, y: A.entrance.y, z: A.entrance.z, yaw: 0 },
        sound: "door_open",
      });
      PF.door({
        id: "pch_wh_out",
        pos: P(0, MAIN + 1.4, ZS - 0.3),
        label: "14th Street",
        verb: "Exit",
        radius: 1.5,
        target: { x: door0.x, y: 0.35, z: door0.z + 2.4, yaw: PI },
        sound: "door_open",
      });
      // containers, terminal, bed
      PF.prop("terminal", {
        x: X(-3.9),
        y: MAIN + 0.8,
        z: Z(10.3),
        yaw: 0,
        terminalId: "pch_wh_boxoffice",
        mount: "bare",
        id: "pch_wh_term",
      });
      PF.prop("cash_register", {
        x: X(-4.8),
        y: MAIN + 1.05,
        z: Z(12.1),
        yaw: 0,
        id: "pch_wh_till",
        owner: "settlers",
        loot: "cash_register",
      });
      PF.prop("footlocker", {
        x: X(17),
        y: STU,
        z: Z(-11.5),
        yaw: -HP,
        lock: PF.regLock({
          id: "pch_lk_wh_stash",
          label: "Gina's Stash",
          kind: "container",
          key: "pch_rosa_key",
          hint: "Gina Bellini keeps the key in her apron.",
        }),
        loot: "scrip_stash",
        id: "pch_wh_rosa_stash",
        name: "Gina's Stash",
        owner: "settlers",
      });
      PF.prop("footlocker", {
        x: X(3),
        y: BALC,
        z: Z(9),
        yaw: 0,
        items: [
          ["pch_note_setlist", 1],
          ["cigarettes", 2],
          ["whiskey", 1],
        ],
        id: "pch_wh_dizzy_trunk",
        name: "Dizzy's Trunk",
        owner: "settlers",
      });
      PF.prop("first_aid", {
        x: X(21.8),
        y: MAIN + 1.3,
        z: Z(14.5),
        yaw: -HP,
        id: "pch_wh_aid",
        owner: "settlers",
      });
      PF.prop("bed", {
        x: A.bed.x,
        y: BALC,
        z: A.bed.z + 1.5,
        yaw: PI,
        id: "pch_wh_bed",
        owner: "settlers",
      });
      PF.prop("radio", {
        x: X(-3),
        y: STU + 1.6,
        z: Z(-13.3),
        yaw: PI,
        id: "pch_wh_radio",
      });
      PF.prop("fizzo_machine", {
        x: X(-21.3),
        y: MAIN,
        z: Z(11),
        yaw: HP,
        id: "pch_wh_fizzo",
      });
      PF.pickup("pch_poster_lulu", 1, P(-9.5, BALC + 0.85, 12.4));

      // generator: repair it to bring the neon back to full strength
      PF.use({
        pos: PF.wh.genPos,
        radius: 0.8,
        range: 2.6,
        label: () =>
          PF.flag("wh_power")
            ? "Hearth Generator (humming)"
            : "Hearth Generator (sputtering)",
        verb: () => (PF.flag("wh_power") ? "Inspect" : "Repair"),
        onInteract() {
          if (PF.flag("wh_power")) {
            G.notify(
              "The old Hearth unit purrs. Upstairs, the neon burns steady.",
            );
            return;
          }
          const rep = PF.skill("mechanics");
          if (rep >= 40) {
            fixGen(
              "You tighten the injector coupling and reseat the coolant line. The hum steadies.",
            );
            return;
          }
          if (PF.inv.count("dry_cell") > 0) {
            PF.inv.remove("dry_cell", 1);
            fixGen(
              "You wire in a fresh dry cell as a buffer. Crude, but the flicker stops.",
            );
            return;
          }
          if (PF.inv.count("scrap_electronics") > 0) {
            PF.inv.remove("scrap_electronics", 1);
            fixGen("You patch the regulator with scrap electronics. It holds.");
            return;
          }
          G.notify(
            "[Mechanics 40] The regulator is shot. A dry cell or some scrap electronics would do as a patch.",
          );
          PF.sfx("ui_error");
        },
      });
      function fixGen(msg) {
        PF.setFlag("wh_power", true);
        PF.xp(60, "Webster Hall generator");
        G.notify(msg);
        PF.sfx("hum_electric", PF.wh.genPos);
        PF.say(
          "pch_wh_static",
          "Hey! Lights are back! Whoever did that — first spin's on me, baby!",
          5,
        );
        PF.news(
          "Word from 14th Street: the lights of Webster Hall are burning bright again. Somebody fixed the old generator. Dance, Manhattan, dance.",
        );
      }
      // neon: flickers while the generator sputters
      const neonMats = [];
      PF.onInitDone.push(() => {
        for (const m of WHX.neon || [])
          if (m.material && neonMats.indexOf(m.material) < 0)
            neonMats.push(m.material);
        for (const k of ["neon_wh_studio", "neon_wh_bar", "neon_wh_dance"]) {
          const mm = PF.mat("tex:" + k);
          if (mm && neonMats.indexOf(mm) < 0) neonMats.push(mm);
        }
      });
      let nT = 0,
        nOn = true;
      PF.animate(V3(160, 5, 300), 400, (t, dt) => {
        if (!neonMats.length) return;
        if (PF.flag("wh_power")) {
          if (!nOn) {
            for (const m of neonMats) m.emissiveIntensity = 1.8;
            nOn = true;
          }
          return;
        }
        nT -= dt;
        if (nT > 0) return;
        nT = 0.05 + Math.random() * 0.4;
        const v = Math.random() < 0.25 ? 0.15 : 1.1 + Math.random() * 0.7;
        for (const m of neonMats) m.emissiveIntensity = v;
        nOn = false;
        if (
          PF.wh.genGlow &&
          PF.wh.genGlow.sprite &&
          PF.wh.genGlow.sprite.setIntensity
        )
          PF.wh.genGlow.sprite.setIntensity(v * 0.8);
      });
      // the band plays when you're near the stage: occasional stingers + barks are on the NPCs
      PF.animate(P(0, STAGE, -12), 30, (t, dt, cam) => {
        PF.wh.bandT = (PF.wh.bandT || 0) - dt;
        if (PF.wh.bandT > 0 || !PF.inCell(KEY)) return;
        PF.wh.bandT = 9 + Math.random() * 6;
        try {
          if (!G.isStub("music") && G.music.setMood)
            G.music.setMood("settlement");
        } catch (e) {
          /* optional */
        }
      });

      PF.register(
        "webster_hall",
        PF.root || null,
        Object.assign({}, WHX.anchors || {}, A, {
          exterior_entrance: (WHX.anchors || {}).entrance,
        }),
        { interiorRoot: root, interiorKey: KEY },
      );
    },
    32,
  );
})();
