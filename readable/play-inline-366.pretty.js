/* src/poi_wallst/42_customhouse_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI WALL STREET — 42_customhouse_interior.js
 * ALEXANDER HAMILTON U.S. CUSTOM HOUSE interior (cell 'custom_house',
 * origin 9400,0,2000) — the Custom House Trading Post, a friendly convoy
 * hub run by Hattie Fenwick.
 *
 * Levels (y):  MAIN 4.5  entrance hall; the GREAT OVAL ROTUNDA (26 × 18 m)
 *                        with its drum of harbour murals, the skylit dome
 *                        and the traders' ring of stalls around "the
 *                        Exchange"; the ambulatory; the Collector's Office
 *                        (Hattie); the convoy bunkhouse; the canteen; the
 *                        guards' armoury; the ledger room.
 *              BASE 0    the Customs SEIZURE ROOM: contraband cages, a burrow
 *                        rat nest, the locked Evidence Cage (reward).
 * Loop: rotunda → north ambulatory → NE stair ↓ → seizure room → NW
 * stair ↑ → rotunda.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pws) return;
  const PF = G._pws;
  const D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const KEY = "custom_house";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const MAIN = 4.5,
    BASE = 0,
    AMB = MAIN + 6.2; // ambulatory ceiling
  const RA = 13,
    RC = 9; // rotunda semi-axes (x, z)
  const DRUM0 = MAIN + 8,
    DRUM1 = MAIN + 11,
    CROWN = MAIN + 16.5;
  const XW = -21,
    XE = 21,
    ZN = -16,
    ZS = 20;

  PF.addBuilder(
    "customhouse_int",
    function () {
      const cell = PF.cell(KEY);
      const root = cell.root;
      const b = PF.batch("ch_int");
      b.ground = BASE;
      b.aoH = 2.4;
      const r = PF.rng("ch_int");

      const L = [];
      const light = (x, y, z, color, rad, i) =>
        L.push({ x: X(x), y, z: Z(z), color, r: rad, i });
      light(0, CROWN - 2, 0, 0xe8ecd8, 22, 0.9); // skylight
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        light(
          Math.cos(a) * 8,
          MAIN + 2.6,
          Math.sin(a) * 5.6,
          0xffc070,
          7,
          0.75,
        );
      } // stall lamps
      light(0, MAIN + 1.6, 0, 0xffa050, 7, 0.9); // the Exchange brazier
      light(0, MAIN + 3, 16.5, 0xd8dcc8, 8, 0.8); // entrance hall daylight
      light(18, MAIN + 2.6, 0, 0xffd090, 9, 0.9); // collector's office (fireplace)
      light(-18, MAIN + 2.6, -3, 0xffc080, 8, 0.7);
      light(-18, MAIN + 2.6, 5, 0xffc080, 8, 0.6); // bunkhouse
      light(0, MAIN + 2.6, -13.5, 0xffb060, 8, 0.9); // canteen
      light(14, MAIN + 2.6, 15.5, 0xffd8a0, 8, 0.7);
      light(-14, MAIN + 2.6, 15.5, 0xffd8a0, 8, 0.7);
      for (const [x, z] of [
        [-17, -12],
        [17, -12],
        [-17, 12],
        [17, 12],
      ])
        light(x, MAIN + 3.5, z * 0.8, 0xc8ccc0, 8, 0.4); // ambulatory windows
      for (const x of [-14, -4, 6, 16])
        light(x, BASE + 2.4, -12.5, 0xffd090, 7, 0.6); // seizure room work lamps
      b.setLights(L, 0x9a948c, 0.15);

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
      const A = {};

      // =====================================================================
      // FLOORS & SHELL
      // =====================================================================
      // the main floor stands on a solid plinth except over the seizure room (z < -9) with the two stair holes
      solid("granite_ch", XW, BASE, -9, XE, MAIN - 0.35, ZS, {
        seg: false,
        walk: true,
        surface: "concrete",
      });
      slab("marble_ws", XW, -9, XE, ZS, MAIN, 0.35, { surface: "concrete" });
      slab("marble_ws", XW, ZN, XE, -14.4, MAIN, 0.35, { surface: "concrete" });
      slab("marble_ws", XW, -12.6, XE, -9, MAIN, 0.35, { surface: "concrete" });
      slab("marble_ws", -9, -14.4, 9, -12.6, MAIN, 0.35, {
        surface: "concrete",
      });
      slab("marble_ws", XW, -14.4, -16, -12.6, MAIN, 0.35, {
        surface: "concrete",
      });
      slab("marble_ws", 16, -14.4, XE, -12.6, MAIN, 0.35, {
        surface: "concrete",
      });
      // room floors laid over the marble: mosaic entrance hall, parquet ledger room, planks in the bunkhouse, canteen & armoury
      bmm("ch_mosaic", -6, MAIN, 10.5, 6, MAIN + 0.004, ZS, {
        seg: false,
        noAO: true,
      });
      bmm("parquet_ws", XW, MAIN, 11, -6.4, MAIN + 0.012, ZS, {
        seg: false,
        noAO: true,
      });
      bmm("oak_ws", 6.4, MAIN, 11, XE, MAIN + 0.012, ZS, {
        seg: false,
        noAO: true,
      });
      bmm("oak_ws", XW, MAIN, -9, -15, MAIN + 0.012, 9, {
        seg: false,
        noAO: true,
      });
      bmm("oak_ws", -6, MAIN, ZN, 6, MAIN + 0.012, -11.2, {
        seg: false,
        noAO: true,
      });
      // outer walls (basement → ambulatory ceiling)
      wall("granite_ch", "x", XW, XE, ZN - 0.6, ZN, BASE, AMB, []);
      wall("granite_ch", "x", XW, XE, ZS, ZS + 0.6, MAIN, AMB, [
        { c: 0, w: 3.2, y0: MAIN, h: 3.8 },
      ]);
      wall("granite_ch", "z", ZN, ZS, XW - 0.6, XW, BASE, AMB, []);
      wall("granite_ch", "z", ZN, ZS, XE, XE + 0.6, BASE, AMB, []);
      // ambulatory ceiling (flat, coffered) with the rotunda's oval hole
      {
        const sh = new THREE.Shape();
        sh.moveTo(XW, -ZS);
        sh.lineTo(XE, -ZS);
        sh.lineTo(XE, -ZN);
        sh.lineTo(XW, -ZN);
        sh.closePath();
        const hole = new THREE.Path();
        hole.absellipse(0, 0, RA + 0.3, RC + 0.3, 0, TAU, true);
        sh.holes.push(hole);
        const g = new THREE.ExtrudeGeometry(sh, {
          depth: 0.4,
          bevelEnabled: false,
          curveSegments: 40,
        });
        g.rotateX(-HP);
        b.add("sp_white", g, {
          m: PF.m4(X(0), AMB, Z(0)),
          grime: 0.2,
          noAO: true,
        });
        for (let x = XW + 3; x < XE; x += 3) {
          if (Math.abs(x) > RA + 0.5)
            bmm("sp_white", x - 0.12, AMB - 0.35, ZN, x + 0.12, AMB, ZS, {
              seg: false,
              noAO: true,
            });
        }
      }
      // tall windows on the outer walls (daylight), with granite reveals
      for (const [x, ry] of [
        [XW + 0.03, HP],
        [XE - 0.03, -HP],
      ])
        for (let z = -12; z <= 16; z += 4) {
          if (z > -10 && z < 10) continue; // the side rooms have their own
          const bk = r() < 0.2;
          quad(bk ? "planks" : "sky_view", x, MAIN + 3.0, z, 1.6, 3.8, {
            ry,
            noAO: true,
            uvRect: bk ? undefined : PF.skyRect(r, 1.6, 3.8),
          });
        }
      for (let x = -16; x <= 16; x += 4) {
        const bk = r() < 0.2;
        quad(bk ? "planks" : "sky_view", x, MAIN + 3.0, ZN + 0.03, 1.6, 3.8, {
          ry: 0,
          noAO: true,
          uvRect: bk ? undefined : PF.skyRect(r, 1.6, 3.8),
        });
      }

      // =====================================================================
      // THE GREAT OVAL ROTUNDA
      // =====================================================================
      {
        const segs = 40,
          t = 0.6;
        const openings = [
          [HP, 2.2],
          [-HP, 1.7],
          [0, 1.6],
          [PI, 1.6],
        ]; // angle (atan2(z/RC, x/RA)), half-width (m) — south / north / east / west
        const isOpen = (a, x, z) =>
          openings.some(([oa, hw]) => {
            const d = Math.abs(((((a - oa + PI) % TAU) + TAU) % TAU) - PI);
            const ox = Math.cos(oa) * RA,
              oz = Math.sin(oa) * RC;
            return d < 0.5 && Math.hypot(x - ox, z - oz) < hw;
          });
        for (let i = 0; i < segs; i++) {
          const a0 = (i / segs) * TAU,
            a1 = ((i + 1) / segs) * TAU,
            am = (a0 + a1) / 2;
          const x0 = Math.cos(a0) * RA,
            z0 = Math.sin(a0) * RC,
            x1 = Math.cos(a1) * RA,
            z1 = Math.sin(a1) * RC;
          const xm = (x0 + x1) / 2,
            zm = (z0 + z1) / 2,
            len = Math.hypot(x1 - x0, z1 - z0);
          const ry = Math.atan2(-(z1 - z0), x1 - x0);
          const nx = Math.cos(am) / RA,
            nz = Math.sin(am) / RC,
            nl = Math.hypot(nx, nz);
          const ox = ((nx / nl) * t) / 2,
            oz = ((nz / nl) * t) / 2;
          const open = isOpen(am, xm, zm);
          const y0 = open ? MAIN + 4.2 : MAIN;
          b.box(
            "marble_soft",
            X(xm + ox),
            y0,
            Z(zm + oz),
            len + 0.08,
            DRUM1 - y0,
            t,
            { ry, seg: false, grime: 0.3 },
          );
          if (!open)
            PF.colWall(
              X(x0 + ox),
              Z(z0 + oz),
              X(x1 + ox),
              Z(z1 + oz),
              t,
              MAIN,
              DRUM0,
              { walkable: false },
            );
          // base & dado
          if (!open)
            b.box(
              "marble_ws",
              X(xm - ox * 0.2),
              MAIN,
              Z(zm - oz * 0.2),
              len + 0.08,
              1.1,
              0.1,
              { ry, seg: false, grime: 0.4 },
            );
        }
        // bronze lintels over the four openings
        for (const [oa, hw] of openings) {
          const ox = Math.cos(oa) * (RA - 0.05),
            oz = Math.sin(oa) * (RC - 0.05);
          b.box(
            "bronze_door",
            X(ox),
            MAIN + 4.0,
            Z(oz),
            Math.abs(Math.cos(oa)) > 0.5 ? 0.4 : hw * 2 + 0.4,
            0.3,
            Math.abs(Math.cos(oa)) > 0.5 ? hw * 2 + 0.4 : 0.4,
            { seg: false, grime: 0.3 },
          );
        }
        // cornice at the spring, the drum of murals (8) alternating with portrait medallions (8)
        const ring = (y, dr, h, key) => {
          for (let i = 0; i < segs; i++) {
            const a0 = (i / segs) * TAU,
              a1 = ((i + 1) / segs) * TAU,
              am = (a0 + a1) / 2;
            const x0 = Math.cos(a0) * (RA - dr),
              z0 = Math.sin(a0) * (RC - dr),
              x1 = Math.cos(a1) * (RA - dr),
              z1 = Math.sin(a1) * (RC - dr);
            b.box(
              key,
              X((x0 + x1) / 2),
              y,
              Z((z0 + z1) / 2),
              Math.hypot(x1 - x0, z1 - z0) + 0.1,
              h,
              0.5,
              { ry: Math.atan2(-(z1 - z0), x1 - x0), seg: false, grime: 0.3 },
            );
            void am;
          }
        };
        ring(DRUM0 - 0.5, 0.2, 0.5, "sp_white");
        ring(DRUM0 - 0.1, 0.35, 0.2, "gold_leaf");
        ring(DRUM1 - 0.1, 0.25, 0.4, "sp_white");
        const mk = PF.muralKey();
        for (let i = 0; i < 16; i++) {
          const am = ((i + 0.5) / 16) * TAU;
          const x = Math.cos(am) * (RA - 0.12),
            z = Math.sin(am) * (RC - 0.12);
          const nx = -Math.cos(am) / RA,
            nz = -Math.sin(am) / RC;
          const ry = Math.atan2(nx, nz);
          if (i % 2 === 0)
            quad(
              mk,
              x,
              (DRUM0 + DRUM1) / 2 + 0.1,
              z,
              i % 4 === 0 ? 4.2 : 3.4,
              2.4,
              { ry, uvRect: PF.muralRect(i / 2), grime: 0.2, noAO: true },
            );
          else {
            b.cyl(
              "gold_leaf",
              X(x),
              (DRUM0 + DRUM1) / 2 + 0.1,
              Z(z),
              0.75,
              0.75,
              0.06,
              14,
              { rx: HP, ry, hSeg: 1, noAO: true },
            );
            quad(
              D.paintingsKey(),
              x - nx * 0.05,
              (DRUM0 + DRUM1) / 2 + 0.1,
              z - nz * 0.05,
              1.1,
              1.1,
              {
                ry,
                uvRect: [(i % 4) / 4, 0.5, (i % 4) / 4 + 0.25, 1.0],
                noAO: true,
              },
            );
          }
        }
        // the dome: inner elliptical shell from the drum to the crown, with the skylight oculus
        PF.innerLathe(
          b,
          "sp_white",
          [
            [RA - 0.3, 0],
            [RA - 0.8, 1.6],
            [RA - 2.2, 3.2],
            [RA - 4.4, 4.5],
            [5.2, 5.3],
            [4.6, 5.5],
          ],
          40,
          X(0),
          DRUM1 + 0.3,
          Z(0),
          (v) => {
            v.z *= RC / RA;
          },
          { grime: 0.2 },
        );
        // coffers suggested by rib lines on the dome (16 ribs)
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * TAU,
            pts = [
              [RA - 0.35, 0],
              [RA - 0.85, 1.6],
              [RA - 2.25, 3.2],
              [RA - 4.45, 4.5],
              [5.1, 5.3],
            ];
          let prev = null;
          for (const [rr, yy] of pts) {
            const q = P(
              Math.cos(a) * rr,
              DRUM1 + 0.3 + yy - 0.05,
              (Math.sin(a) * rr * RC) / RA,
            );
            if (prev) b.beam("gold_leaf", prev, q, 0.12, 0.12, { noAO: true });
            prev = q;
          }
        }
        // skylight: glazed oculus lantern (daylight) + iron glazing bars
        const sk = new THREE.CircleGeometry(4.6, 32);
        sk.rotateX(HP);
        sk.scale(1, 1, RC / RA);
        b.add("daylight", sk, {
          m: PF.m4(X(0), DRUM1 + 0.3 + 5.5 + 0.9, Z(0)),
          noAO: true,
          grime: 0,
        });
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU;
          b.beam(
            "iron",
            P(0, DRUM1 + 6.65, 0),
            P(Math.cos(a) * 4.6, DRUM1 + 6.6, (Math.sin(a) * 4.6 * RC) / RA),
            0.05,
            0.05,
            { noAO: true },
          );
        }
        bmm("sp_white", -5, DRUM1 + 6.7, -4, 5, DRUM1 + 6.9, 4, {
          seg: false,
          noAO: true,
        });
        const eg = new THREE.CylinderGeometry(4.6, 4.6, 0.9, 32, 1, true);
        eg.scale(1, 1, RC / RA);
        b.add("sp_white", eg, {
          m: PF.m4(X(0), DRUM1 + 6.25, Z(0)),
          noAO: true,
        });
        // Reginald Marsh's harbour frescoes carried up onto the dome: 16 panels between the gilt ribs (stained & flaking)
        {
          const mk2 = PF.muralKey();
          const y0 = DRUM1 + 0.45,
            y1 = DRUM1 + 3.1,
            R0 = RA - 0.5,
            R1 = RA - 2.3;
          for (let i = 0; i < 16; i++) {
            const a0 = (i / 16) * TAU + 0.03,
              a1 = ((i + 1) / 16) * TAU - 0.03;
            const pt = (a, rr, y) => [
              X(Math.cos(a) * rr),
              y,
              Z((Math.sin(a) * rr * RC) / RA),
            ];
            const BL = pt(a0, R0, y0),
              BR = pt(a1, R0, y0),
              TR = pt(a1, R1, y1),
              TL = pt(a0, R1, y1);
            const g = new THREE.BufferGeometry();
            g.setAttribute(
              "position",
              new THREE.Float32BufferAttribute(
                [...BL, ...BR, ...TR, ...BL, ...TR, ...TL],
                3,
              ),
            );
            g.setAttribute(
              "uv",
              new THREE.Float32BufferAttribute(
                [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
                2,
              ),
            );
            g.computeVertexNormals();
            b.add(mk2, g, {
              uv: "keep",
              uvRect: PF.muralRect((i * 3) % 8),
              grime: 0.45,
              noAO: true,
            });
          }
        }
        // broken skylight panes (dark sectors), a soft shaft of daylight, pigeon mess & glass on the floor below
        for (const [a, w] of [
          [0.6, 0.5],
          [2.4, 0.35],
          [4.1, 0.6],
          [5.3, 0.3],
        ]) {
          const sg = new THREE.CircleGeometry(4.55, 6, a, w);
          sg.rotateX(HP);
          sg.scale(1, 1, RC / RA);
          b.add("glass_broken", sg, {
            m: PF.m4(X(0), DRUM1 + 0.3 + 5.5 + 0.88, Z(0)),
            noAO: true,
            grime: 0,
          });
        }
        PF.lightShaft(
          root,
          X(0),
          DRUM1 + 6.6,
          Z(0),
          4.0,
          5.2,
          DRUM1 + 6.6 - MAIN,
          { sz: RC / RA, opacity: 0.09 },
        );
        PF.decal(b, 7, X(-2.2), MAIN + 0.02, Z(-3.2), 2.6, 2.6, 0, {
          floor: true,
        });
        for (let k = 0; k < 18; k++)
          b.box(
            r() < 0.5 ? "glass_broken" : "paper",
            X(-3.6 + r() * 3),
            MAIN + 0.015,
            Z(-4.4 + r() * 2.4),
            0.06 + r() * 0.12,
            0.01,
            0.05 + r() * 0.1,
            { ry: r() * 3, seg: false, noAO: true },
          );
        A.rotunda = PF.anchor(X(0), MAIN + 0.05, Z(4.5), 0);
      }
      // the rotunda floor: compass-rose inlay, the traders' ring of stalls, the Exchange, string lights
      {
        const rose = PF.texMat(
          "ch_rose",
          PF.canvasTex("pws_rose", 512, 512, (ctx, w, h) => {
            ctx.fillStyle = "#b8b0a0";
            ctx.fillRect(0, 0, w, h);
            const cx = w / 2,
              cy = h / 2;
            ctx.strokeStyle = "#5a4a3a";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(cx, cy, w * 0.45, 0, TAU);
            ctx.stroke();
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, w * 0.38, 0, TAU);
            ctx.stroke();
            for (let i = 0; i < 16; i++) {
              const a = (i / 16) * TAU,
                rr = i % 4 === 0 ? w * 0.44 : i % 2 === 0 ? w * 0.3 : w * 0.2;
              ctx.fillStyle = i % 2 ? "#8a6a3a" : "#3a3028";
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(
                cx + Math.cos(a - 0.12) * rr * 0.3,
                cy + Math.sin(a - 0.12) * rr * 0.3,
              );
              ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
              ctx.lineTo(
                cx + Math.cos(a + 0.12) * rr * 0.3,
                cy + Math.sin(a + 0.12) * rr * 0.3,
              );
              ctx.fill();
            }
            ctx.fillStyle = "#2a2018";
            ctx.font = "bold 40px Georgia, serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("N", cx, cy - w * 0.41);
            ctx.fillText("S", cx, cy + w * 0.41);
            ctx.fillText("E", cx + w * 0.41, cy);
            ctx.fillText("W", cx - w * 0.41, cy);
          }),
          { rough: 0.4 },
        );
        {
          const mg = new THREE.CircleGeometry(RA - 0.7, 40);
          mg.rotateX(-HP);
          mg.scale(1, 1, RC / RA);
          b.add("ch_mosaic", mg, {
            m: PF.m4(X(0), MAIN + 0.006, Z(0)),
            noAO: true,
            grime: 0.5,
          });
        }
        quad(rose, 0, MAIN + 0.012, 0, 9, ((9 * RC) / RA) * 1.1, {
          rx: -HP,
          grime: 0.4,
          noAO: true,
        });
        // the Exchange: round trade table with scales, a ledger and a brazier
        b.cyl("oak_ws", X(0), MAIN, Z(0), 1.8, 1.8, 0.95, 24, { hSeg: 1 });
        b.cyl("oak_ws", X(0), MAIN + 0.95, Z(0), 1.95, 1.95, 0.08, 24, {
          hSeg: 1,
        });
        PF.col(X(0), Z(0), 3.6, 3.6, MAIN, MAIN + 1.0, 0, { walkable: false });
        for (const a of [0.4, 2.3, 4.1]) {
          const x = Math.cos(a) * 1.2,
            z = Math.sin(a) * 1.2;
          b.cyl("brass_ws", X(x), MAIN + 1.03, Z(z), 0.06, 0.12, 0.55, 6, {
            hSeg: 1,
          });
          b.box("brass_ws", X(x), MAIN + 1.55, Z(z), 0.7, 0.03, 0.04, {
            ry: a,
            seg: false,
          });
          for (const s of [-0.33, 0.33])
            b.cyl(
              "brass_ws",
              X(x + Math.cos(a) * s),
              MAIN + 1.3,
              Z(z - Math.sin(a) * s),
              0.12,
              0.08,
              0.04,
              8,
              { hSeg: 1 },
            );
        }
        bmm("paper", -0.4, MAIN + 1.03, 0.6, 0.4, MAIN + 1.06, 1.2, {
          seg: false,
        });
        PF.barrel(b, X(0), MAIN + 1.03, Z(-0.2), {
          fire: true,
          noCollide: true,
          key: "iron",
        });
        // six stalls in a ring, facing the Exchange
        const stalls = [
          ["GUNS & AMMO", "guns", 0x3a4a5a],
          ["GENERAL GOODS", "cans", 0x5a4a2a],
          ["MEDS & PILLS", "meds", 0x6a2a2a],
          ["(closed)", "junk", 0x4a4a3a],
          ["FOOD & WATER", "bottles", 0x3a5a3a],
          ["(closed)", "junk", 0x5a3a5a],
        ];
        A.stalls = [];
        stalls.forEach(([name, goods, c], i) => {
          const a = ((i + 0.5) / 6) * TAU + PI / 6;
          const sx = Math.cos(a) * (RA - 3.4),
            sz = Math.sin(a) * (RC - 2.8);
          if (Math.abs(sx) < 3 || Math.abs(sz) < 2) return; // keep the four axes (doors) clear
          const ry = Math.atan2(-sx, -sz);
          D.stall(b, X(sx), Z(sz), ry, 3.2, 1.8, {
            seed: 400 + i,
            goods,
            sign: name,
            signStyle: "enamel",
            signColors: {
              bg: "#" + c.toString(16).padStart(6, "0"),
              fg: "#e8dcb8",
            },
            y: MAIN,
            awning: i % 2 ? "awning_red" : "awning_green",
          });
          const [fx, fz] = [sx - Math.sin(ry) * -0.2, sz - Math.cos(ry) * -0.2];
          A.stalls.push(
            PF.anchor(
              X(sx - Math.sin(ry) * 0.2),
              MAIN + 0.05,
              Z(sz - Math.cos(ry) * 0.2),
              ry + PI,
            ),
          );
          void fx;
          void fz;
        });
        // string lights across the rotunda (from the drum cornice)
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * PI;
          D.stringLights(
            b,
            P(Math.cos(a) * (RA - 0.6), DRUM0 - 0.8, Math.sin(a) * (RC - 0.6)),
            P(
              -Math.cos(a) * (RA - 0.6),
              DRUM0 - 0.8,
              -Math.sin(a) * (RC - 0.6),
            ),
            2.2,
            18,
            0xffc070,
          );
        }
        // trade-route map on an easel + chalk price board
        const map = PF.texMat(
          "ch_routes",
          PF.signTex(
            "ch_routes",
            [
              "CONVOY ROUTES",
              "BATTERY → WALL ST → CITY HALL",
              "GRAND CENTRAL · 34TH ST · THE NEON",
              "BROOKLYN BRIDGE (TOLL!) · SEAPORT",
              "NO RUNS PAST 59TH — RIPJAWS",
            ],
            "enamel",
            512,
            320,
            { bg: "#d8c8a0", fg: "#3a2a1a" },
          ),
          {},
        );
        b.beam(
          "oak_ws",
          P(3.6, MAIN, 6.8),
          P(3.9, MAIN + 2.2, 6.9),
          0.06,
          0.06,
          {},
        );
        b.beam(
          "oak_ws",
          P(5.0, MAIN, 6.4),
          P(4.7, MAIN + 2.2, 6.5),
          0.06,
          0.06,
          {},
        );
        quad(map, 4.3, MAIN + 1.6, 6.66, 1.8, 1.12, {
          ry: PI - 0.35,
          grime: 0.3,
        });
      }

      // =====================================================================
      // ENTRANCE HALL (x -6..6, z 14..20): vaulted, mosaic floor, bronze doors
      // =====================================================================
      {
        wall("marble_pnl", "z", 10.5, ZS, -6.4, -6, MAIN, AMB, [
          { c: 15.5, w: 1.6, y0: MAIN, h: 2.8 },
        ]);
        wall("marble_pnl", "z", 10.5, ZS, 6, 6.4, MAIN, AMB, [
          { c: 15.5, w: 1.6, y0: MAIN, h: 2.8 },
        ]);
        for (const sx of [-1, 1]) {
          bmm(
            "granite_dark",
            sx * 5.99 - 0.02,
            MAIN,
            10.5,
            sx * 5.99 + 0.02,
            MAIN + 0.25,
            ZS,
            { seg: false, noAO: true },
          );
          bmm(
            "marble_ws",
            sx * 5.98 - 0.04,
            MAIN + 1.1,
            10.5,
            sx * 5.98 + 0.04,
            MAIN + 1.2,
            ZS,
            { seg: false, noAO: true },
          );
          // bronze lunette grille over each side door
          for (let k = 0; k < 7; k++)
            box(
              "bronze_door",
              sx * 6.0,
              MAIN + 2.85,
              14.8 + k * 0.23,
              0.06,
              0.95,
              0.03,
              { seg: false },
            );
          box("bronze_door", sx * 6.0, MAIN + 2.8, 15.5, 0.08, 0.08, 1.7, {
            seg: false,
          });
          box("bronze_door", sx * 6.0, MAIN + 3.8, 15.5, 0.08, 0.08, 1.7, {
            seg: false,
          });
        }
        {
          // Guastavino tile barrel vault along the hall (inward faces)
          const xc = 0,
            hw = 6.0,
            rise = AMB - 0.15 - (MAIN + 4.2),
            sy0 = MAIN + 4.2,
            z0 = 10.5,
            z1 = ZS,
            n = 16,
            pos = [];
          const pt = (z, j) => {
            const t = (PI * j) / n;
            return [X(xc - hw * Math.cos(t)), sy0 + rise * Math.sin(t), Z(z)];
          };
          for (let j = 0; j < n; j++) {
            const a = pt(z0, j),
              bq = pt(z1, j),
              c = pt(z1, j + 1),
              d = pt(z0, j + 1);
            pos.push(...a, ...c, ...bq, ...a, ...d, ...c);
          }
          const g = new THREE.BufferGeometry();
          g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
          g.computeVertexNormals();
          b.add("guastavino", g, { grime: 0.3, noAO: true });
          bmm("marble_ws", -6, sy0 - 0.25, z0, 6, sy0, z0 + 0.24, {
            seg: false,
            noAO: true,
          });
        }
        for (const sg of [-1, 1])
          bmm(
            "bronze_door",
            sg * 0.05,
            MAIN,
            ZS - 0.1,
            sg * 1.55,
            MAIN + 3.6,
            ZS - 0.02,
            { seg: false },
          );
        quad("daylight", 0, MAIN + 4.4, ZS - 0.05, 3.0, 1.2, {
          ry: PI,
          noAO: true,
        });
        bmm(
          "carpet_red",
          -1.5,
          MAIN + 0.005,
          10.5,
          1.5,
          MAIN + 0.02,
          ZS - 0.2,
          { seg: false, noAO: true, grime: 0.7 },
        );
        const wk = PF.texMat(
          "ch_welcome",
          PF.signTex(
            "ch_welcome",
            [
              "WELCOME TO THE TRADING POST",
              "Fair scales · Honest scrip · Guns stay holstered",
              "— H. Fenwick, Convoy Master",
            ],
            "banner",
            512,
            256,
            { bg: "#2a3a5a", fg: "#e8d8a8", size: 34 },
          ),
          { side: THREE.DoubleSide },
        );
        // two-faced banner: reads correctly from the entrance (ry 0) and from the rotunda side (ry PI)
        quad(wk, 0, MAIN + 4.2, 11.03, 3.6, 1.8, { ry: 0, grime: 0.3 });
        quad(wk, 0, MAIN + 4.2, 10.97, 3.6, 1.8, { ry: PI, grime: 0.3 });
        for (const x of [-4.6, 4.6]) {
          b.cyl("bronze_door", X(x), MAIN, Z(17.5), 0.12, 0.2, 2.2, 8, {
            hSeg: 1,
          });
          b.sphere("lamp_ws", X(x), MAIN + 2.35, Z(17.5), 0.22, {
            ws: 8,
            hs: 6,
            noAO: true,
          });
          PF.glow(P(x, MAIN + 2.4, 17.5), 0xffd8a0, 1.6, root, {
            intensity: 1.0,
          });
        }
        A.entrance = PF.anchor(X(0), MAIN + 0.05, Z(17.6), 0);
      }
      // SW LEDGER ROOM (x -21..-6.4, z 11..20) & SE GUARDS' ARMOURY (x 6.4..21, z 11..20)
      {
        wall("granite_ch", "x", XW, -6.4, 10.6, 11, MAIN, AMB, [
          { c: -9, w: 1.6, y0: MAIN, h: 2.8 },
        ]);
        wall("granite_ch", "x", 6.4, XE, 10.6, 11, MAIN, AMB, [
          { c: 9, w: 1.6, y0: MAIN, h: 2.8 },
        ]);
        // ledger room: desks, file cabinets, the convoy ledgers, a safe
        for (let k = 0; k < 3; k++) {
          solid(
            "oak_ws",
            -19 + k * 4,
            MAIN,
            14.4,
            -16.4 + k * 4,
            MAIN + 0.8,
            15.6,
            { seg: false },
          );
          D.chair(b, X(-17.7 + k * 4), MAIN, Z(16.3), PI, k === 2, "oak_ws");
          D.papers(b, X(-17.7 + k * 4), MAIN + 0.8, Z(15), 0.4, 5, 410 + k);
        }
        for (let k = 0; k < 5; k++)
          D.shelf(b, X(-19.8 + k * 2.3), MAIN, Z(19.5), PI, 2.0, 4, 420 + k);
        const lk = PF.texMat(
          "ch_ledger",
          PF.signTex(
            "ch_ledger",
            ["LEDGER ROOM", "all trades recorded"],
            "enamel",
            256,
            96,
            { bg: "#2a3a5a", fg: "#e8d8a8" },
          ),
          {},
        );
        quad(lk, -9, MAIN + 3.2, 10.58, 1.4, 0.52, { ry: PI, grime: 0.2 });
        // armoury: gun racks, crates of ammo, bunks for the night watch
        for (let k = 0; k < 4; k++) {
          bmm(
            "iron",
            8 + k * 2.2,
            MAIN,
            19.4,
            9.8 + k * 2.2,
            MAIN + 2.0,
            19.8,
            { seg: false },
          );
          for (let g = 0; g < 4; g++)
            box(
              "iron",
              8.3 + k * 2.2 + g * 0.4,
              MAIN + 0.5,
              19.35,
              0.06,
              1.2,
              0.05,
              { rz: 0.08, seg: false },
            );
        }
        col(8, MAIN, 19.4, 16.6, MAIN + 2.0, 19.8);
        for (let k = 0; k < 3; k++)
          D.crates(b, X(18.5), MAIN, Z(12.5 + k * 1.3), 2, 430 + k);
        for (let k = 0; k < 2; k++) {
          solid("rust", 12 + k * 3, MAIN, 12.2, 14 + k * 3, MAIN + 0.45, 13.1, {
            seg: false,
            walk: true,
            surface: "metal",
          });
          bmm(
            "canvas_ws",
            12 + k * 3,
            MAIN + 0.45,
            12.2,
            14 + k * 3,
            MAIN + 0.55,
            13.1,
            { seg: false },
          );
        }
        A.armory = PF.anchor(X(12), MAIN + 0.05, Z(16), PI);
        A.ledger = PF.anchor(X(-14), MAIN + 0.05, Z(13), PI);
      }
      // EAST: THE COLLECTOR'S OFFICE (x 15..21, z -9..9) — Hattie Fenwick's office: oak panelling, fireplace, the great desk
      {
        wall("oak_ws", "z", -9, 9, 14.6, 15, MAIN, AMB, [
          { c: 0, w: 1.8, y0: MAIN, h: 2.9 },
        ]);
        wall("oak_ws", "x", 14.6, XE, -9.4, -9, MAIN, AMB, []);
        wall("oak_ws", "x", 14.6, XE, 9, 9.4, MAIN, AMB, []);
        bmm("oak_ws", 15, MAIN, -9, XE - 0.05, MAIN + 2.4, -8.9, {
          seg: false,
        });
        bmm("carpet_red", 15.4, MAIN + 0.005, -8.4, 20.6, MAIN + 0.02, 8.4, {
          seg: false,
          noAO: true,
        });
        PF.coffers(b, "oak_ws", X(15), Z(-9), X(XE), Z(9), AMB - 0.05, 2.2, {
          panel: "oak_ws",
          beam: 0.3,
          depth: 0.4,
        });
        // fireplace on the east wall
        solid("marble_ws", 20.3, MAIN, -1.8, XE, MAIN + 2.4, 1.8, {
          seg: false,
        });
        bmm("black_enamel", 20.25, MAIN, -0.9, 20.35, MAIN + 1.3, 0.9, {
          seg: false,
        });
        b.box("fire", X(20.5), MAIN + 0.1, Z(0), 0.4, 0.35, 1.2, {
          seg: false,
          noAO: true,
          grime: 0,
        });
        PF.fires.push(P(20.4, MAIN + 0.4, 0));
        D.painting(b, 2, X(20.25), MAIN + 3.4, Z(0), 1.6, 1.2, -HP);
        // the Collector's great desk, chairs, a globe, the portrait of Hamilton (a painted canvas) and ledgers
        solid("mahog_ws", 16.6, MAIN, -4.2, 18.0, MAIN + 0.85, -1.2, {
          seg: false,
        });
        D.chair(b, X(18.6), MAIN, Z(-2.7), -HP, false, "mahog_ws");
        for (const z of [-3.4, -2.0])
          D.chair(b, X(16.0), MAIN, Z(z), HP, false, "mahog_ws");
        b.sphere("paint_teal", X(16.2), MAIN + 1.3, Z(5.6), 0.35, {
          ws: 12,
          hs: 8,
        });
        b.cyl("bronze_door", X(16.2), MAIN, Z(5.6), 0.12, 0.25, 0.95, 8, {
          hSeg: 1,
        });
        D.painting(b, 6, X(15.07), MAIN + 2.4, Z(-5.5), 1.2, 1.6, HP);
        for (let k = 0; k < 2; k++)
          PF.bookcase(
            b,
            X(17.6 + k * 2),
            MAIN,
            Z(8.6),
            PI,
            1.8,
            5,
            440 + k,
            "oak_ws",
          );
        PF.deskClutter(b, X(17.3), MAIN + 0.85, Z(-3.3), -HP, "hattie", {
          typewriter: false,
          lit: true,
          parent: root,
        });
        PF.rug(b, X(17.6), MAIN + 0.02, Z(4.0), 3.2, 2.4, HP, 1);
        PF.clubChair(b, X(18.4), MAIN, Z(3.2), -2.4);
        PF.clubChair(b, X(18.6), MAIN, Z(5.2), -0.7);
        b.cyl("oak_ws", X(19.4), MAIN, Z(4.2), 0.32, 0.32, 0.55, 10, {
          hSeg: 1,
        });
        for (let k = 0; k < 3; k++)
          b.cyl(
            "china",
            X(19.3 + k * 0.1),
            MAIN + 0.55,
            Z(4.1 + (k % 2) * 0.15),
            0.04,
            0.035,
            0.08,
            8,
            { hSeg: 1 },
          );
        // the convoy map pinned up, and the old customs duty board
        D.papers(b, X(16.2), MAIN, Z(-6.6), 1.2, 10, 445);
        PF.poster(b, 2, X(15.07), MAIN + 2.0, Z(-7.6), 0.7, 1.4, HP, -0.04);
        const ck = PF.texMat(
          "ch_collector",
          PF.signTex(
            "ch_collector",
            ["COLLECTOR'S OFFICE", "Convoy Master — knock"],
            "bronze",
            512,
            128,
          ),
          {},
        );
        quad(ck, 14.55, MAIN + 3.2, 0, 1.6, 0.4, { ry: -HP, grime: 0.2 });
        A.hattie = PF.anchor(X(18.6), MAIN + 0.05, Z(-2.7), -HP + PI);
        A.office = PF.anchor(X(17), MAIN + 0.05, Z(2), HP);
      }
      // WEST: THE CONVOY BUNKHOUSE (x -21..-15, z -9..9)
      {
        wall("granite_ch", "z", -9, 9, -15, -14.6, MAIN, AMB, [
          { c: 0, w: 1.8, y0: MAIN, h: 2.9 },
        ]);
        wall("granite_ch", "x", XW, -14.6, -9.4, -9, MAIN, AMB, []);
        wall("granite_ch", "x", XW, -14.6, 9, 9.4, MAIN, AMB, []);
        bmm("sp_white", XW, MAIN + 4.2, -9, -15, MAIN + 4.4, 9, {
          seg: false,
          noAO: true,
        });
        for (let k = 0; k < 4; k++) {
          const z = -7.4 + k * 4.2;
          for (const lvl of [0, 1.4]) {
            solid(
              "rust",
              -20.6,
              MAIN + 0.35 + lvl,
              z - 0.5,
              -18.6,
              MAIN + 0.5 + lvl,
              z + 0.5,
              { seg: false, walk: true, surface: "metal" },
            );
            bmm(
              "canvas_ws",
              -20.6,
              MAIN + 0.5 + lvl,
              z - 0.48,
              -18.6,
              MAIN + 0.6 + lvl,
              z + 0.48,
              { seg: false, c: [0xc8b890, 0x8a7a60, 0xb8a888, 0x9a8a70][k] },
            );
          }
          for (const [dx, dz] of [
            [-20.6, -0.5],
            [-18.6, -0.5],
            [-20.6, 0.5],
            [-18.6, 0.5],
          ])
            box("rust", dx, MAIN, z + dz, 0.06, 2.1, 0.06, { seg: false });
          PF.prop("footlocker", {
            x: X(-17.9),
            y: MAIN,
            z: Z(z),
            yaw: -HP,
            loot: "footlocker",
            id: "pws_ch_bunk" + k,
            owner: "settlers",
            name: "Teamster's Footlocker",
          });
        }
        PF.barrel(b, X(-16), MAIN, Z(-7.6), { fire: true });
        for (let k = 0; k < 3; k++)
          b.box("canvas_ws", X(-15.8), MAIN, Z(6.4 + k * 0.6), 0.6, 0.45, 0.5, {
            seg: false,
            c: 0xa89070,
          });
        // life in the bunkhouse: bedrolls, kit bags, a card game, laundry, pin-ups, lanterns
        D.mattress(b, X(-16.4), MAIN + 0.01, Z(-3.6), 0.1, 0x7a6a50);
        D.mattress(b, X(-16.2), MAIN + 0.01, Z(3.2), -0.12, 0x6a5a48);
        for (const [x, z] of [
          [-17.6, -5.4],
          [-17.8, -1.2],
          [-17.6, 3.0],
          [-17.9, 7.2],
        ]) {
          b.sphere("canvas_ws", X(x), MAIN + 0.25, Z(z), 0.3, {
            ws: 8,
            hs: 6,
            sy: 0.8,
            sz: 0.7,
            c: 0x8a7a58,
          });
        }
        solid("oak_ws", -17.6, MAIN, 0.2, -16.4, MAIN + 0.75, 1.4, {
          seg: false,
        });
        bmm("felt", -17.55, MAIN + 0.75, 0.25, -16.45, MAIN + 0.77, 1.35, {
          seg: false,
          noAO: true,
        });
        for (let k = 0; k < 9; k++)
          b.box(
            "paper",
            X(-17.3 + r() * 0.7),
            MAIN + 0.775,
            Z(0.4 + r() * 0.8),
            0.06,
            0.003,
            0.09,
            { ry: r() * 3, seg: false, noAO: true },
          );
        for (let k = 0; k < 3; k++)
          b.cyl(
            "glass_dark",
            X(-17.4 + k * 0.4),
            MAIN + 0.77,
            Z(1.2 - k * 0.3),
            0.035,
            0.04,
            0.24,
            6,
            { hSeg: 1 },
          );
        D.chair(b, X(-16.0), MAIN, Z(0.8), -HP, false, "rotten");
        D.chair(b, X(-17.0), MAIN, Z(-0.2), 0, false, "rotten");
        {
          const a = P(-20.6, MAIN + 2.4, 8.6),
            c = P(-15.2, MAIN + 2.3, 8.6);
          b.beam("rope", a, c, 0.012, 0.012, { noAO: true });
          for (let k = 1; k < 6; k++) {
            const q = a.clone().lerp(c, k / 6);
            b.box(
              k % 2 ? "linen_ws" : "canvas_ws",
              q.x,
              q.y - 0.65,
              q.z,
              0.5,
              0.6,
              0.02,
              {
                seg: false,
                c: [0xe8e0d0, 0x8a6a50, 0xc8c0b0, 0x6a7a8a, 0xe0d0b0][k - 1],
              },
            );
          }
        }
        PF.poster(b, 0, X(-20.93), MAIN + 1.9, Z(-5.4), 0.6, 1.2, HP, 0.06);
        PF.poster(b, 1, X(-20.93), MAIN + 1.9, Z(1.2), 0.6, 1.2, HP, -0.04);
        PF.poster(b, 0, X(-20.93), MAIN + 1.8, Z(5.6), 0.6, 1.2, HP, -0.1);
        for (const z of [-3.5, 4.5])
          PF.cageLamp(b, X(-17.6), MAIN + 3.6, Z(z), 0xffc080, root);
        A.bunk = PF.anchor(X(-17.6), MAIN + 0.05, Z(-1.8), HP);
      }
      // NORTH: the canteen (x -6..6, z -16..-11) between the two stairwells
      {
        wall("granite_ch", "x", -6, 6, -11.2, -10.8, MAIN, AMB, [
          { c: 0, w: 2.0, y0: MAIN, h: 2.9 },
        ]);
        wall("granite_ch", "z", ZN, -10.8, -6.4, -6, MAIN, AMB, []);
        wall("granite_ch", "z", ZN, -10.8, 6, 6.4, MAIN, AMB, []);
        solid("oak_ws", -4.6, MAIN, -15.6, 4.6, MAIN + 0.95, -14.8, {
          seg: false,
        }); // counter
        for (let k = 0; k < 4; k++)
          b.cyl(
            "iron",
            X(-3.5 + k * 2.2),
            MAIN + 0.95,
            Z(-15.2),
            0.3,
            0.3,
            0.4,
            10,
            { hSeg: 1 },
          );
        PF.barrel(b, X(-5.2), MAIN, Z(-13), { fire: true });
        for (const x of [-2.5, 2.5]) {
          solid("oak_ws", x - 1.2, MAIN, -13.4, x + 1.2, MAIN + 0.8, -12.4, {
            seg: false,
          });
          D.chair(b, X(x - 0.7), MAIN, Z(-11.8), PI, false, "oak_ws");
          D.chair(b, X(x + 0.7), MAIN, Z(-11.8), PI, x > 0, "oak_ws");
        }
        for (let k = 0; k < 4; k++) {
          b.cyl(
            "iron",
            X(-3.4 + k * 2.2),
            MAIN,
            Z(-14.2),
            0.03,
            0.03,
            0.62,
            5,
            { hSeg: 1 },
          );
          b.cyl(
            "oak_ws",
            X(-3.4 + k * 2.2),
            MAIN + 0.62,
            Z(-14.2),
            0.18,
            0.18,
            0.06,
            10,
            { hSeg: 1 },
          );
        } // counter stools
        // the stew pot on its tripod over the fire barrel, crates of Fizzo Cola, plates & cups on the tables
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * TAU;
          b.beam(
            "iron",
            P(-5.2 + Math.cos(a) * 0.55, MAIN, -13 + Math.sin(a) * 0.55),
            P(-5.2, MAIN + 1.7, -13),
            0.03,
            0.03,
            {},
          );
        }
        b.beam(
          "iron",
          P(-5.2, MAIN + 1.7, -13),
          P(-5.2, MAIN + 1.2, -13),
          0.01,
          0.01,
          {},
        );
        b.lathe(
          "iron",
          [
            [0.02, 0],
            [0.28, 0.02],
            [0.32, 0.25],
            [0.3, 0.38],
            [0.001, 0.38],
          ],
          10,
          X(-5.2),
          MAIN + 0.95,
          Z(-13),
          {},
        );
        for (let k = 0; k < 3; k++) {
          b.box(
            "paint_red",
            X(4.9),
            MAIN + k * 0.36,
            Z(-12.4 - (k % 2) * 0.1),
            0.62,
            0.34,
            0.44,
            { ry: k * 0.1, seg: false },
          );
          for (let q = 0; q < 6; q++)
            b.cyl(
              "glass_dark",
              X(4.72 + (q % 3) * 0.18),
              MAIN + k * 0.36 + 0.34,
              Z(-12.52 + Math.floor(q / 3) * 0.2),
              0.03,
              0.035,
              0.1,
              6,
              { hSeg: 1 },
            );
        }
        for (const x of [-2.5, 2.5])
          for (let k = 0; k < 4; k++) {
            b.cyl(
              "china",
              X(x - 0.8 + k * 0.55),
              MAIN + 0.8,
              Z(-12.9 + (k % 2) * 0.1),
              0.13,
              0.11,
              0.02,
              12,
              { hSeg: 1 },
            );
            if (k % 2)
              b.cyl(
                "china",
                X(x - 0.7 + k * 0.55),
                MAIN + 0.8,
                Z(-12.6),
                0.04,
                0.035,
                0.08,
                8,
                { hSeg: 1 },
              );
          }
        const menu = PF.texMat(
          "ch_menu",
          PF.signTex(
            "ch_menu",
            [
              "CANTEEN",
              "Ox stew ............. 8",
              "Shellback cake ....... 12",
              "Pigeon-on-a-stick .... 5",
              "Water (clean!) ....... 10",
              "NO CREDIT. NO REFUNDS.",
            ],
            "enamel",
            320,
            320,
            { bg: "#1a1a1a", fg: "#e8e0c8" },
          ),
          {},
        );
        quad(menu, 0, MAIN + 2.4, ZN + 0.05, 1.6, 1.6, { ry: 0, grime: 0.2 });
        A.canteen = PF.anchor(X(1.2), MAIN + 0.05, Z(-14.2), 0);
      }
      // STAIRWELLS to the seizure room: NE (x 9..16) and NW (x -16..-9) at z -14.4..-12.6, descending outward
      for (const sg of [1, -1]) {
        const x0 = sg * 9;
        PF.stairs(
          b,
          "granite_ch",
          X(sg * 16),
          Z(-13.5),
          sg > 0 ? -HP : HP,
          1.8,
          7.0,
          BASE + 0.05,
          MAIN,
          { base: BASE, grime: 0.5 },
        );
        PF.rail(b, X(x0), Z(-12.55), X(sg * 16), Z(-12.55), MAIN, {
          key: "bronze_door",
        });
        PF.rail(b, X(x0), Z(-14.45), X(sg * 16), Z(-14.45), MAIN, {
          key: "bronze_door",
        });
        const sk = PF.texMat(
          "ch_down" + sg,
          PF.signTex(
            "ch_down" + sg,
            ["↓ SEIZURE VAULT", "RATS! — take a stick"],
            "raider",
            512,
            160,
            { bg: "#d8d0b8", fg: "#7a1a14", outline: false },
          ),
          {},
        );
        quad(sk, x0 + sg * 3.5, MAIN + 2.4, -16 + 0.63, 1.8, 0.56, {
          ry: 0,
          grime: 0.2,
        });
      }
      // ambulatory: veined marble veneer, dado rail and dark base on every wall facing the corridor
      {
        const ven = (x0, z0, x1, z1) => {
          bmm("marble_pnl", x0, MAIN, z0, x1, AMB - 0.4, z1, {
            seg: false,
            noAO: true,
          });
          const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0),
            ex = alongX ? 0 : 0.03,
            ez = alongX ? 0.03 : 0;
          bmm(
            "marble_ws",
            x0 - ex,
            MAIN + 1.05,
            z0 - ez,
            x1 + ex,
            MAIN + 1.15,
            z1 + ez,
            { seg: false, noAO: true },
          );
          bmm(
            "granite_dark",
            x0 - ex,
            MAIN,
            z0 - ez,
            x1 + ex,
            MAIN + 0.22,
            z1 + ez,
            { seg: false, noAO: true },
          );
        };
        ven(-14.6, -9, -14.56, -0.9);
        ven(-14.6, 0.9, -14.56, 9);
        ven(14.56, -9, 14.6, -0.9);
        ven(14.56, 0.9, 14.6, 9);
        ven(-6, -10.8, -1.0, -10.76);
        ven(1.0, -10.8, 6, -10.76);
        ven(-14.6, 10.56, -9.8, 10.6);
        ven(-8.2, 10.56, -6.4, 10.6);
        ven(6.4, 10.56, 8.2, 10.6);
        ven(9.8, 10.56, 14.6, 10.6);
      }
      // columns in the ambulatory corners (granite, Doric-ish) and benches / crates / hitching for porters
      for (const [x, z] of [
        [-16, -10],
        [16, -10],
        [-16, 10],
        [16, 10],
        [-9, 12],
        [9, 12],
        [-9, -12],
        [9, -12],
      ]) {
        if (Math.abs(z) === 12 && Math.abs(x) === 9 && z < 0) continue;
        b.cyl("granite_ch", X(x), MAIN, Z(z), 0.45, 0.5, AMB - MAIN, 14, {
          hSeg: 2,
        });
        PF.col(X(x), Z(z), 1.0, 1.0, MAIN, AMB, 0, { walkable: false });
      }
      D.crates(b, X(-11), MAIN, Z(-9.6), 3, 450);
      D.crates(b, X(11.4), MAIN, Z(9.8), 2, 451);
      PF.bench(b, X(-8.4), MAIN, Z(9.6), PI);
      PF.bench(b, X(8.4), MAIN, Z(-9.4), 0);

      // =====================================================================
      // BASEMENT: the Customs SEIZURE VAULT (x -21..21, z -16..-9, y 0..4.15)
      // =====================================================================
      {
        slab("flagstone", XW, ZN, XE, -9, BASE + 0.05, 0.3, {});
        wall("granite_ch", "x", XW, XE, -9.3, -9, BASE, MAIN - 0.35, []);
        for (const [x0, z0, x1, z1] of [
          [XW, ZN, XE, -14.4],
          [XW, -12.6, XE, -9.3],
          [-9, -14.4, 9, -12.6],
          [XW, -14.4, -16, -12.6],
          [16, -14.4, XE, -12.6],
        ])
          bmm("granite_ch", x0, MAIN - 0.36, z0, x1, MAIN - 0.35, z1, {
            segLen: 6,
            noAO: true,
          });
        // chain-link contraband cages along the north wall (crates, barrels, a seized car engine)
        for (let k = 0; k < 6; k++) {
          const x0 = -19 + k * 6.4,
            x1 = x0 + 5.6;
          if (k === 2 || k === 3) continue; // centre: the Evidence Cage (below)
          for (let x = x0; x <= x1; x += 0.15)
            box("iron", x, BASE + 0.05, -12.4, 0.02, 2.6, 0.02, {
              seg: false,
              noAO: true,
            });
          bmm("iron", x0, BASE + 2.6, -12.45, x1, BASE + 2.7, -12.35, {
            seg: false,
          });
          col(x0, BASE, -12.5, x1, BASE + 2.7, -12.3);
          D.crates(b, X(x0 + 1.2), BASE + 0.05, Z(-14.8), 2, 460 + k);
          D.crates(b, X(x0 + 2.6), BASE + 0.05, Z(-15.0), 3, 470 + k);
          PF.barrel(b, X(x0 + 4.2), BASE + 0.05, Z(-14.6), {
            key: k % 2 ? "paint_red" : "rust",
          });
          const tag = PF.texMat(
            "ch_cage" + k,
            PF.signTex(
              "ch_cage" + k,
              ["SEIZED", "CASE " + (1900 + k * 37) + "-77"],
              "enamel",
              256,
              96,
              { bg: "#e8e0c8", fg: "#7a1a14" },
            ),
            {},
          );
          quad(tag, (x0 + x1) / 2, BASE + 1.6, -12.28, 0.8, 0.3, {
            ry: 0,
            grime: 0.3,
          });
        }
        // the Evidence Cage (lock 75): the good stuff
        {
          const x0 = -6.2,
            x1 = 6.2;
          for (let x = x0; x <= x1; x += 0.15)
            if (Math.abs(x) > 0.7)
              box("iron", x, BASE + 0.05, -12.4, 0.025, 2.6, 0.025, {
                seg: false,
                noAO: true,
              });
          bmm("iron", x0, BASE + 2.6, -12.45, x1, BASE + 2.7, -12.35, {
            seg: false,
          });
          col(x0, BASE, -12.5, -0.7, BASE + 2.7, -12.3);
          col(0.7, BASE, -12.5, x1, BASE + 2.7, -12.3);
          const ek = PF.texMat(
            "ch_evidence",
            PF.signTex(
              "ch_evidence",
              ["EVIDENCE — HIGH VALUE", "U.S. CUSTOMS SERVICE"],
              "enamel",
              512,
              128,
              { bg: "#7a1a14", fg: "#f0e0c0" },
            ),
            {},
          );
          quad(ek, 0, BASE + 3.0, -12.3, 2.2, 0.55, { ry: 0, grime: 0.2 });
          solid("steel", -4.2, BASE + 0.05, -15.6, 4.2, BASE + 0.95, -14.6, {
            seg: false,
            surface: "metal",
          });
          for (let k = 0; k < 6; k++)
            if (k > 1)
              b.box(
                k % 2 ? "goldbar" : "crate",
                X(-3.4 + k * 1.3),
                BASE + 0.95,
                Z(-15.1),
                0.6,
                0.3,
                0.5,
                { seg: false },
              );
          // seized goods: a bullion rack, confiscated paintings, a crate of Fizzo Blue still glowing, radios
          PF.bullionShelf(b, X(5.3), BASE + 0.05, Z(-14.3), -HP, 2.6, 3, 7, {
            cash: true,
          });
          D.painting(b, 3, X(-5.6), BASE + 0.75, Z(-15.72), 1.2, 0.9, 0.08, {
            tilt: 0.05,
          });
          b.box("crate", X(-5.2), BASE + 0.05, Z(-13.6), 0.7, 0.4, 0.5, {
            ry: 0.2,
            seg: false,
          });
          for (let q = 0; q < 6; q++)
            b.cyl(
              "lamp_blue",
              X(-5.4 + (q % 3) * 0.18),
              BASE + 0.45,
              Z(-13.7 + Math.floor(q / 3) * 0.2),
              0.03,
              0.035,
              0.14,
              6,
              { hSeg: 1, noAO: true, grime: 0 },
            );
          PF.glow(P(-5.2, BASE + 0.7, -13.6), 0x40a0ff, 1.2, root, {
            intensity: 1.0,
            flicker: 0.1,
          });
          for (let k = 0; k < 3; k++)
            b.box(
              "paint_cream",
              X(2.6 + k * 0.1),
              BASE + 0.05 + k * 0.32,
              Z(-13.4),
              0.5,
              0.3,
              0.3,
              { ry: k * 0.2, seg: false },
            );
          PF.fw = PF.fw || {};
          PF.ch = PF.ch || {};
          PF.ch.cageDoor = P(0, BASE + 1.2, -12.3);
        }
        // the burrow rat burrow: a hole broken through the south wall under the rotunda, dirt spilled across the floor
        bmm("black_enamel", -1.4, BASE + 0.05, -9.33, 1.4, BASE + 1.6, -9.28, {
          seg: false,
        });
        b.rock("dirt", X(0), BASE - 0.2, Z(-10.2), 1.6, {
          flat: 0.4,
          seed: 480,
        });
        for (let k = 0; k < 8; k++)
          b.rock(
            "dirt",
            X(-3 + r() * 6),
            BASE,
            Z(-10.5 - r() * 2.5),
            0.3 + r() * 0.3,
            { flat: 0.4, detail: 0, seed: 481 + k },
          );
        PF.skeleton(b, X(9.5), BASE + 0.05, Z(-10.6), 0.6);
        for (const x of [-14, -4, 6, 16])
          PF.cageLamp(b, X(x), MAIN - 0.9, Z(-11.2), 0xffd090, root);
        A.seizure = PF.anchor(X(0), BASE + 0.1, Z(-10.8), PI);
        A.evidence = PF.anchor(X(0), BASE + 0.1, Z(-14), PI);
      }

      PF.flushGlows(root);
      PF.flushFires();
      b.build(root, { lodDistInt: 400 });

      // =====================================================================
      // doors, gates, props, NPCs
      // =====================================================================
      const CHX = PF.CH;
      const door0 = CHX.door;
      PF.door({
        id: "pws_ch_in",
        pos: door0,
        label: "Custom House Trading Post",
        verb: "Enter",
        radius: 1.6,
        target: { x: A.entrance.x, y: A.entrance.y, z: A.entrance.z, yaw: 0 },
        sound: "door_open",
      });
      PF.door({
        id: "pws_ch_out",
        pos: P(0, MAIN + 1.5, ZS - 0.3),
        label: "Bridge Street",
        verb: "Exit",
        radius: 1.5,
        target: { x: CHX.XC, y: CHX.MAIN + 0.05, z: CHX.ZF + 1.2, yaw: PI },
        sound: "door_open",
      });
      // the Evidence Cage gate (Hattie gives the key after "Safe Deposit")
      {
        const gCol = PF.colMM(
          X(-0.7),
          BASE,
          Z(-12.5),
          X(0.7),
          BASE + 2.7,
          Z(-12.3),
          { walkable: false },
        );
        const setGate = (o) => {
          if (gCol) {
            gCol.minY = o ? -99 : BASE;
            gCol.maxY = o ? -98 : BASE + 2.7;
          }
        };
        PF.use({
          pos: PF.ch.cageDoor,
          radius: 0.8,
          range: 2.6,
          label: () =>
            PF.flag("ch_cage_open") ? "Evidence Cage (open)" : "Evidence Cage",
          verb: () => (PF.flag("ch_cage_open") ? "Look" : "Open"),
          locked: () =>
            PF.flag("ch_cage_open") || PF.inv.count("pws_evidence_key") > 0
              ? null
              : "Locked — Hattie Fenwick has the key",
          onInteract() {
            if (PF.flag("ch_cage_open")) {
              G.notify("Customs seized it in 1967. Finders keepers in 1989.");
              return;
            }
            const ok = (msg) => {
              PF.setFlag("ch_cage_open", true);
              G.notify(msg);
              PF.sfx("door_open", PF.ch.cageDoor);
            };
            PF.lockOpen("pws_lk_ch_cage", () =>
              ok("Hattie's old customs key turns with a squeal."),
            );
          },
        });
        PF.flagWatch.push((k) => {
          if (k === "ch_cage_open" || k === "*")
            setGate(!!PF.flag("ch_cage_open"));
        });
        PF.onReset.push(() => setGate(false));
      }
      PF.prop("terminal", {
        x: X(17.3),
        y: MAIN + 0.85,
        z: Z(-2.0),
        yaw: -HP,
        terminalId: "pws_ch_collector",
        mount: "bare",
        id: "pws_ch_term",
      });
      PF.prop("safe", {
        x: X(-20.6),
        y: MAIN,
        z: Z(12.4),
        yaw: HP,
        lock: PF.lockSpec("pws_lk_ch_safe"),
        loot: "safe",
        id: "pws_ch_safe",
        owner: "settlers",
        name: "Ledger Room Safe",
      });
      PF.prop("footlocker", {
        x: X(-2.8),
        y: BASE + 0.95,
        z: Z(-15.1),
        yaw: 0,
        items: [
          ["pws_duty_collector", 1],
          ["ammo_44", 24],
          ["fizzo_cola", 3],
          ["rush", 2],
          ["old_dollars", 12],
          ["pws_note_seizure", 1],
        ],
        id: "pws_ch_evidence",
        name: "Evidence Locker",
      });
      PF.prop("ammo_box", {
        x: X(15),
        y: MAIN,
        z: Z(19.1),
        yaw: PI,
        loot: "ammo_box",
        id: "pws_ch_ammo",
        owner: "settlers",
      });
      PF.prop("bed", {
        x: X(-19.6),
        y: MAIN + 0.5,
        z: Z(-7.4),
        yaw: HP,
        id: "pws_ch_bed",
        owner: "settlers",
        name: "Teamster's Bunk",
      });
      PF.prop("radio", {
        x: X(-19.2),
        y: MAIN + 0.8,
        z: Z(14.9),
        yaw: PI,
        id: "pws_ch_radio",
      });
      PF.prop("first_aid", {
        x: X(XE - 0.1),
        y: MAIN + 1.4,
        z: Z(15),
        yaw: -HP,
        id: "pws_ch_aid",
        owner: "settlers",
      });
      PF.pickup("pws_note_manifest", 1, P(-17.6, MAIN + 0.82, 15.0));
      PF.pickup("pws_reel_marsh", 1, P(17.2, MAIN + 0.87, -3.6));
      // loose goods (owned by the traders — taking them is stealing)
      for (const [id, n, x, y, z] of [
        ["purified_water", 1, -16.9, MAIN + 0.78, 14.8],
        ["pencil", 1, -13.4, MAIN + 0.82, 15.2],
        ["clipboard", 1, -9.4, MAIN + 0.82, 14.9],
        ["golden_plain_jerky", 1, 3.8, MAIN + 0.97, -15.2],
        ["fizzo_cola", 1, 4.8, MAIN + 1.1, -12.5],
        ["ox_meat", 1, -1.2, MAIN + 0.97, -15.1],
        ["cigarettes", 1, -17.1, MAIN + 0.78, 0.9],
        ["whiskey", 1, -16.8, MAIN + 0.78, 1.1],
        ["duct_tape", 1, 19.1, MAIN + 0.56, 4.3],
        ["rally_tonic", 1, 14.2, MAIN + 0.05, 16.0],
        ["fizzo_cola", 1, -5.3, BASE + 0.5, -13.7],
      ])
        PF.pickup(id, n, P(x, y, z), { owner: "settlers" });

      // ---------- NPCs: Hattie Fenwick, three merchants, a guard, teamsters; burrow rats below ----------
      const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
      PF.npc({
        id: "pws_ch_hattie",
        type: "human",
        name: "Hattie Fenwick",
        outfit: "merchant",
        gender: "f",
        faction: "settlers",
        level: 10,
        pos: pos(A.hattie),
        yaw: A.hattie.yaw,
        ai: "guard",
        home: { x: A.hattie.x, z: A.hattie.z, r: 1.6 },
        dialogue: "pws_dlg_hattie",
        essential: true,
        weapon: "magnum_44",
        seed: 7601,
        voice: "female",
        barks: [
          "Scrip on the table, friend.",
          "Hamilton built this place to count money. I just carry on the tradition.",
          "Convoy from the Seaport's late again.",
        ],
      });
      const st = A.stalls || [];
      const merch = [
        [
          "pws_ch_cyrus",
          "Cyrus Belle",
          "m",
          "leather_armor",
          "pws_dlg_cyrus",
          {
            scrip: 600,
            stock: [
              ["ammo_10mm", 60],
              ["ammo_556", 40],
              ["ammo_12ga", 30],
              ["ammo_308", 20],
              ["hunting_rifle", 1],
              ["combat_shotgun", 1],
              ["pistol_10mm", 2],
              ["frag_grenade", 3],
            ],
            restock: 3,
          },
          ["Guns, ammo, bad decisions.", "Cash only. Well — scrip only."],
        ],
        [
          "pws_ch_lin",
          "Lin Hua",
          "f",
          "merchant",
          "pws_dlg_lin",
          {
            scrip: 400,
            stock: [
              ["purified_water", 6],
              ["golden_plain_jerky", 5],
              ["freedom_flakes", 3],
              ["dry_cell", 2],
              ["scrap_electronics", 3],
              ["scrap_metal", 6],
              ["cigarettes", 4],
            ],
            restock: 3,
          },
          [
            "Everything a survivor needs!",
            "Sewing needles, three for a scrip. Well. Four.",
          ],
        ],
        [
          "pws_ch_gorski",
          "Doc Gorski",
          "m",
          "doctor",
          "pws_dlg_gorski",
          {
            scrip: 350,
            stock: [
              ["rally_tonic", 5],
              ["prussian_blue", 3],
              ["iodine_tabs", 4],
              ["morphine_syrette", 2],
              ["bull_tabs", 1],
              ["focus_pills", 1],
              ["rage", 1],
            ],
            restock: 3,
          },
          [
            "Rally Tonic! Fresh-ish!",
            "Iodine tabs before, Prussian Blue after. Doctor's orders.",
          ],
        ],
      ];
      merch.forEach(([id, name, g, outfit, dlg, stock, barks], i) => {
        const a = st[i] || A.rotunda;
        PF.npc({
          id,
          type: "human",
          name,
          outfit,
          gender: g,
          faction: "settlers",
          level: 6 + i,
          pos: pos(a),
          yaw: a.yaw,
          ai: "guard",
          home: { x: a.x, z: a.z, r: 1.0 },
          dialogue: dlg,
          merchant: stock,
          weapon: i === 0 ? "pistol_10mm" : "none",
          seed: 7610 + i,
          barks,
        });
      });
      PF.npc({
        id: "pws_ch_tex",
        type: "human",
        name: "Tex (Convoy Guard)",
        outfit: "combat_armor",
        gender: "m",
        faction: "settlers",
        level: 9,
        pos: pos(PF.anchor(X(2.6), MAIN + 0.05, Z(13.0), PI)),
        yaw: PI,
        ai: "guard",
        home: { x: X(2.6), z: Z(13), r: 2.5 },
        weapon: "assault_rifle",
        seed: 7620,
        barks: [
          "Holster it, pardner.",
          "Hattie pays me to be ugly at people.",
          "Quiet day. I like quiet days.",
        ],
      });
      PF.npc({
        id: "pws_ch_juniper",
        type: "human",
        name: "Juniper (Teamster)",
        outfit: "survivor",
        gender: "f",
        faction: "settlers",
        level: 5,
        pos: pos(A.bunk),
        yaw: A.bunk.yaw,
        ai: "sit",
        home: { x: A.bunk.x, z: A.bunk.z, r: 0.5 },
        weapon: "none",
        seed: 7621,
        dialogue: "pws_dlg_juniper",
        barks: [
          "Ox has got a limp. Two limps. He's showing off.",
          "Next run's Brooklyn. Pray for us.",
        ],
      });
      PF.npc({
        id: "pws_ch_cook",
        type: "human",
        name: "Big Sal",
        outfit: "settler",
        gender: "m",
        faction: "settlers",
        level: 4,
        pos: pos(A.canteen),
        yaw: A.canteen.yaw,
        ai: "guard",
        home: { x: A.canteen.x, z: A.canteen.z, r: 1.5 },
        weapon: "none",
        seed: 7622,
        barks: ["Stew's on!", "Don't ask what's in it. It's stew."],
      });
      const E = PF.CH.anchors || {};
      if (E.guard1)
        PF.npc({
          id: "pws_ch_guard1",
          type: "human",
          name: "Convoy Guard",
          outfit: "leather_armor",
          gender: "f",
          faction: "settlers",
          level: 8,
          pos: pos(E.guard1),
          yaw: E.guard1.yaw || 0,
          ai: "guard",
          home: { x: E.guard1.x, z: E.guard1.z, r: 2 },
          weapon: "hunting_rifle",
          seed: 7630,
          barks: [
            "Welcome to the Trading Post.",
            "Keep your hands where I can see 'em.",
          ],
        });
      if (E.guard2)
        PF.npc({
          id: "pws_ch_guard2",
          type: "human",
          name: "Convoy Guard",
          outfit: "combat_armor",
          gender: "m",
          faction: "settlers",
          level: 8,
          pos: pos(E.guard2),
          yaw: E.guard2.yaw || 0,
          ai: "guard",
          home: { x: E.guard2.x, z: E.guard2.z, r: 3 },
          weapon: "combat_shotgun",
          seed: 7631,
          barks: [
            "Wagons stay in the yard.",
            "Seen raiders on Beaver Street. Keep your eyes open.",
          ],
        });
      if (E.convoy1)
        PF.npc({
          id: "pws_ch_wagoner",
          type: "human",
          name: "Wagoner Pete",
          outfit: "survivor",
          gender: "m",
          faction: "settlers",
          level: 4,
          pos: pos(E.convoy1),
          yaw: E.convoy1.yaw || 0,
          ai: "guard",
          home: { x: E.convoy1.x, z: E.convoy1.z, r: 2 },
          weapon: "none",
          seed: 7632,
          barks: [
            "Two hundred pounds of Golden Plain Jerky, and not a strip to spare.",
            "Axle's cracked again.",
          ],
        });
      const dead = (id) => () => !PF.flag("dead_" + id);
      [
        [-7, -10.8],
        [3.5, -11.4],
        [12, -10.4],
      ].forEach(([x, z], i) => {
        const id = "pws_ch_burrowrat" + i;
        PF.npc({
          id,
          type: "burrow_rat",
          faction: "creatures",
          hostile: true,
          level: 3,
          pos: { x: X(x), y: BASE + 0.1, z: Z(z) },
          yaw: r() * TAU,
          ai: "guard",
          home: { x: X(x), z: Z(z), r: 5 },
          loot: "burrow_rat",
          seed: 7640 + i,
          when: dead(id),
          onDeath: () => PF.setFlag("dead_" + id, true),
        });
      });

      Object.assign(A, {
        npc1: A.hattie,
        npc2: st[0] || A.rotunda,
        npc3: st[2] || A.rotunda,
        npc4: A.canteen,
        merchant: st[0] || A.rotunda,
        spawn1: A.rotunda,
        spawn2: A.armory,
        spawn3: A.ledger,
        spawn4: A.seizure,
        spawn5: A.bunk,
        spawn6: A.canteen,
        loot1: A.evidence,
        loot2: A.armory,
        loot3: A.ledger,
      });
      delete A.stalls;
      PF.register(
        "custom_house",
        PF.root || null,
        Object.assign({}, CHX.anchors || {}, A, {
          exterior_entrance: (CHX.anchors || {}).entrance,
        }),
        { interiorRoot: root, interiorKey: KEY },
      );
    },
    42,
  );
})();
