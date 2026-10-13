/* src/poi_wallst/22_singer_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI WALL STREET — 22_singer_interior.js
 * SINGER BUILDING interior (cell 'singer_building', origin 9400,0,1200)
 * — the Stitchers' tower (raiders, level 7).
 *
 * Areas (local coords, load doors between floors):
 *   LOBBY      (x -14..14, z -6..6, y 0)  Ernest Flagg's lobby: marble
 *              piers with bronze capitals, five saucer-domed bays, the
 *              bronze elevator bank (one car forced open), the tenant
 *              directory; the Stitchers' toll barricade.
 *   FLOOR 2    (x 30..58, z -8..8, y 0)   the Singer showroom & offices,
 *              now the Stitchers' "sweatshop": sewing tables turned
 *              armour benches, dress-form gallery, the foreman's office
 *              (terminal), bunks.
 *   THE DOME   (centre 0,40, y 30)        inside the mansard dome: four
 *              great oeil-de-boeuf windows, steel ribs, catwalk ring,
 *              the raiders' armoury, the elevator machine room.
 *   LANTERN    (centre 0,40, y 54)        the sniper nest: Madame Bobbin,
 *              the stolen Great Seal of St. Paul's, the view; door out to
 *              the exterior lantern gallery (140 m above the street).
 * Critical path: lobby → stairwell → floor 2 → stairwell → dome →
 * catwalk → lantern. Loop back: dome machine room → the elevator cable
 * → the open car in the lobby.
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

  const KEY = "singer_building";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const LH = 6.2; // lobby ceiling (bottom of the saucer bays)
  const F2 = { x0: 30, x1: 58, z0: -8, z1: 8, h: 4.2 };
  const DM = { cx: 0, cz: 40, y: 30, h: 9 }; // dome: floor y, half-size
  const LN = { cx: 0, cz: 40, y: 54, h: 2.6 }; // lantern

  function sq(a, p) {
    const c = Math.abs(Math.cos(a)),
      s = Math.abs(Math.sin(a));
    return 1 / Math.pow(Math.pow(c, p) + Math.pow(s, p), 1 / p);
  }
  /** Lathe seen from INSIDE: profile [[r,y]...] from the rim up to the crown; faces point inward. */
  function innerLathe(b, key, prof, seg, x, y, z, deformFn, opts) {
    const pts = prof
      .slice()
      .reverse()
      .map((p) => new THREE.Vector2(Math.max(0.0001, p[0]), p[1]));
    const g = new THREE.LatheGeometry(pts, seg);
    if (deformFn) PF.deform(g, deformFn);
    return b.add(
      key,
      g,
      Object.assign({ m: PF.m4(x, y, z), grime: 0.3, noAO: true }, opts || {}),
    );
  }
  PF.innerLathe = innerLathe;

  PF.addBuilder(
    "singer_int",
    function () {
      const cell = PF.cell(KEY);
      const root = cell.root;
      const b = PF.batch("sg_int");
      b.ground = 0;
      b.aoH = 2.4;
      const r = PF.rng("sg_int");

      const L = [];
      const light = (x, y, z, color, rad, i) =>
        L.push({ x: X(x), y, z: Z(z), color, r: rad, i });
      // lobby: raider fires & bulbs, daylight from the portal
      light(12, 3, 0, 0xd0d8c8, 10, 0.8);
      light(5.5, 2.2, 3.5, 0xffa050, 8, 1.0);
      light(-2, 4.5, 0, 0xffd090, 9, 0.6);
      light(-10, 3.5, -2, 0xffb060, 8, 0.7);
      light(-5.6, 2.5, -5, 0x8090a0, 5, 0.4);
      // floor 2: window daylight + work lamps + fires
      for (let x = 32; x <= 56; x += 6) {
        light(x, 2.4, F2.z0 + 1, 0xc8d0c0, 7, 0.55);
        light(x, 2.4, F2.z1 - 1, 0xc8d0c0, 7, 0.55);
      }
      light(40, 3.2, 0, 0xffd090, 8, 0.7);
      light(50, 3.2, -2, 0xffd090, 8, 0.7);
      light(34, 2.0, 5, 0xffa050, 7, 0.9);
      light(54, 2.4, -5.5, 0xffc080, 6, 0.8);
      // dome: four great round windows, fire barrels
      for (const [dx, dz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ])
        light(
          DM.cx + dx * 7.5,
          DM.y + 4.8,
          DM.cz + dz * 7.5,
          0xd8dcc8,
          11,
          0.8,
        );
      light(DM.cx, DM.y + 2.5, DM.cz, 0xffa050, 9, 0.8);
      light(DM.cx, DM.y + 12, DM.cz, 0xc8ccc0, 12, 0.4);
      light(-6, DM.y + 2.4, DM.cz - 6, 0xffc080, 6, 0.8);
      // lantern: daylight all around
      light(LN.cx, LN.y + 2.4, LN.cz, 0xe0e4d4, 7, 1.1);
      b.setLights(L, 0x9a9088, 0.13);

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
      // LOBBY
      // =====================================================================
      {
        const x0 = -14,
          x1 = 14,
          z0 = -6,
          z1 = 6;
        slab("sg_floor", x0, z0, x1, z1, 0.05, 0.3, { surface: "concrete" });
        wall("marble_soft", "x", x0, x1, z0 - 0.5, z0, 0, LH + 1.4, [
          { c: -5.6, w: 2.0, y0: 0, h: 3.0 },
        ]);
        wall("marble_soft", "x", x0, x1, z1, z1 + 0.5, 0, LH + 1.4, []);
        wall("marble_soft", "z", z0, z1, x0 - 0.5, x0, 0, LH + 1.4, []);
        wall("marble_soft", "z", z0, z1, x1, x1 + 0.5, 0, LH + 1.4, []);
        // bronze base band & dado
        bmm("bronze_door", x0, 0.05, z0 + 0.01, x1, 0.35, z0 + 0.06, {
          seg: false,
          noAO: true,
        });
        bmm("bronze_door", x0, 0.05, z1 - 0.06, x1, 0.35, z1 - 0.01, {
          seg: false,
          noAO: true,
        });
        // saucer-domed bays: a thick ceiling with circular holes + inner shallow domes, arches between bays
        for (let i = 0; i < 5; i++) {
          const cx = x0 + 2.8 + i * 5.6;
          const sh = new THREE.Shape();
          sh.moveTo(-2.8, -6);
          sh.lineTo(2.8, -6);
          sh.lineTo(2.8, 6);
          sh.lineTo(-2.8, 6);
          sh.closePath();
          const hole = new THREE.Path();
          hole.absellipse(0, 0, 2.5, 4.4, 0, TAU, true);
          sh.holes.push(hole);
          const g = new THREE.ExtrudeGeometry(sh, {
            depth: 1.2,
            bevelEnabled: false,
            curveSegments: 20,
          });
          g.rotateX(-HP);
          b.add("sp_white", g, {
            m: PF.m4(X(cx), LH, Z(0)),
            grime: 0.3,
            noAO: true,
          });
          innerLathe(
            b,
            "sp_white",
            [
              [2.5, 0],
              [2.3, 0.4],
              [1.7, 0.85],
              [0.9, 1.12],
              [0.001, 1.2],
            ],
            20,
            X(cx),
            LH,
            Z(0),
            (v) => {
              v.z *= 4.4 / 2.5;
            },
          );
          // painted medallion (the Singer "S") at each crown + a hanging pendant lamp (some lit by the raiders)
          b.cyl("gold_leaf", X(cx), LH + 1.12, Z(0), 0.5, 0.5, 0.06, 12, {
            hSeg: 1,
            noAO: true,
          });
          const lit = i % 2 === 0;
          b.beam("iron", P(cx, LH + 1.1, 0), P(cx, LH - 1.4, 0), 0.02, 0.02, {
            noAO: true,
          });
          b.lathe(
            lit ? "lamp_ws" : "glass_broken",
            [
              [0.05, 0],
              [0.35, 0.1],
              [0.4, 0.35],
              [0.2, 0.5],
              [0.05, 0.55],
            ],
            10,
            X(cx),
            LH - 1.95,
            Z(0),
            { noAO: true, grime: 0 },
          );
          b.cyl("bronze_door", X(cx), LH - 1.45, Z(0), 0.08, 0.36, 0.12, 10, {
            hSeg: 1,
          });
          if (lit)
            PF.glow(P(cx, LH - 1.7, 0), 0xffd8a0, 2.2, root, {
              intensity: 0.9,
            });
        }
        bmm("sp_white", x0, LH + 1.2, z0, x1, LH + 1.4, z1, {
          segLen: 8,
          noAO: true,
        });
        // marble piers with bronze capitals along both walls at the bay edges, transverse arches
        for (const px of [-8.4, -2.8, 2.8, 8.4]) {
          for (const pz of [z0 + 0.4, z1 - 0.4]) {
            solid(
              "marble_ws",
              px - 0.45,
              0.05,
              pz - 0.4,
              px + 0.45,
              LH,
              pz + 0.4,
              { seg: false, surface: "concrete" },
            );
            bmm(
              "bronze_door",
              px - 0.55,
              LH - 0.6,
              pz - 0.5,
              px + 0.55,
              LH,
              pz + 0.5,
              { seg: false },
            );
            bmm(
              "bronze_door",
              px - 0.55,
              0.05,
              pz - 0.5,
              px + 0.55,
              0.5,
              pz + 0.5,
              { seg: false },
            );
          }
          bmm("sp_white", px - 0.35, LH - 0.35, z0, px + 0.35, LH + 0.05, z1, {
            seg: false,
            noAO: true,
          });
        }
        // the elevator bank (north wall): four bronze doors with indicator dials, one car forced open
        for (const [i, ex] of [
          [0, -11.2],
          [1, -5.6],
          [2, 0],
          [3, 5.6],
        ]) {
          const open = i === 1;
          bmm(
            "bronze_door",
            ex - 1.25,
            0.05,
            z0 + 0.02,
            ex + 1.25,
            3.4,
            z0 + 0.12,
            { seg: false },
          );
          if (open) {
            bmm(
              "glass_broken",
              ex - 0.95,
              0.05,
              z0 - 0.4,
              ex + 0.95,
              3.0,
              z0 - 0.38,
              { seg: false, noAO: true },
            );
            col(ex - 1.1, 0, z0 - 0.62, ex + 1.1, 3.2, z0 - 0.38);
            b.beam(
              "iron",
              P(ex + 0.3, 3.0, z0 - 0.3),
              P(ex + 0.2, 0.3, z0 - 0.3),
              0.04,
              0.04,
              {},
            );
            b.beam(
              "iron",
              P(ex - 0.4, 3.0, z0 - 0.3),
              P(ex - 0.5, 0.8, z0 - 0.35),
              0.03,
              0.03,
              {},
            );
            bmm(
              "bronze_door",
              ex - 1.0,
              0.05,
              z0 + 0.12,
              ex - 0.9,
              3.0,
              z0 + 0.2,
              { seg: false, rz: 0.1 },
            );
          } else {
            bmm(
              "bronze_door",
              ex - 0.95,
              0.05,
              z0 + 0.12,
              ex + 0.95,
              3.0,
              z0 + 0.17,
              { seg: false, c: 0xd8b888 },
            );
            bmm("iron", ex - 0.02, 0.05, z0 + 0.17, ex + 0.02, 3.0, z0 + 0.19, {
              seg: false,
            });
          }
          b.cyl("gilt", X(ex), 3.8, Z(z0 + 0.14), 0.35, 0.35, 0.05, 12, {
            rx: HP,
            hSeg: 1,
          });
          b.box("iron", X(ex + 0.1), 3.8, Z(z0 + 0.18), 0.3, 0.03, 0.02, {
            rz: 0.8 + i,
            seg: false,
          });
        }
        // directory board (south wall)
        const dir = PF.texMat(
          "sg_dir",
          PF.signTex(
            "sg_dir",
            [
              "THE SINGER BUILDING — DIRECTORY",
              "SINGER MANUFACTURING CO. ........ 2–10",
              "HI-OCTANE HARRY'S PETROLEUM CO. ... 14",
              "LIBERTY SEWING SCHOOL .............. 18",
              "MANHATTAN MUTUAL INSURANCE ...... 20–26",
              "OBSERVATION LANTERN ................. 41",
              '"THE SINGER TOWER — TALLEST IN THE WORLD 1908"',
            ],
            "enamel",
            512,
            384,
            { bg: "#1a1a1a", fg: "#e8dcb8" },
          ),
          {},
        );
        quad(dir, 0, 2.2, z1 - 0.06, 2.4, 1.8, { ry: PI, grime: 0.3 });
        bmm("bronze_door", -1.35, 1.2, z1 - 0.1, 1.35, 3.2, z1 - 0.02, {
          seg: false,
        });
        // the old reception desk (marble & bronze), overturned chairs, papers
        solid("marble_ws", -9.2, 0.05, 2.8, -5.2, 1.1, 3.6, { seg: false });
        D.chair(b, X(-7), 0.05, Z(4.4), 0.4, true, "iron");
        D.papers(b, X(-3), 0.05, Z(1.5), 3, 18, 201);
        // portal doors (inside) and daylight fan
        bmm("bronze_door", x1 - 0.12, 0.05, -1.8, x1 - 0.02, 3.2, 1.8, {
          seg: false,
        });
        PF.archBay(b, X(x1 - 0.05), 3.3, Z(0), -HP, 3.4, 3.2, {
          pane: "sky_view",
          paneRect: PF.skyRect(r, 3.4, 3.2),
          ring: "marble_ws",
          ringW: 0.3,
          n: 11,
          sash: true,
          sashKey: "bronze_door",
        });
        // STITCHERS barricade across the lobby at x 6..7 with a gap (the toll)
        PF.scrapWall(b, X(6.5), Z(z0 + 1), X(6.5), Z(-1.3), 2.4, { seed: 301 });
        PF.scrapWall(b, X(6.5), Z(1.3), X(6.5), Z(z1 - 1), 2.4, { seed: 302 });
        PF.sandbags(b, X(4.8), Z(-1.2), X(4.8), Z(1.2), 2, {
          y: 0.05,
          noCollide: true,
        });
        solid("planks", 8.0, 0.05, -3.4, 9.6, 0.9, -2.2, { seg: false }); // toll table
        D.papers(b, X(8.8), 0.95, Z(-2.8), 0.5, 5, 202);
        b.cyl("paint_cream", X(8.4), 0.95, Z(-2.9), 0.12, 0.12, 0.25, 8, {
          hSeg: 1,
        });
        const toll = PF.texMat(
          "sg_toll",
          PF.signTex(
            "sg_toll",
            ["TOLL: 50 SCRIP", "OR A PINT OF BLOOD", "MANAGEMENT"],
            "raider",
            512,
            256,
            {},
          ),
          {},
        );
        quad(toll, 6.3, 2.0, -3.6, 1.6, 0.8, { ry: HP, grime: 0.3 });
        // raider camp in the west bays: mattresses, fire barrel, dress-form totems, sewing machines as junk
        D.mattress(b, X(-12.6), 0.05, Z(-3.8), 0.2, 0x8a6a50);
        D.mattress(b, X(-12.4), 0.05, Z(3.8), -0.3, 0x6a6048);
        PF.barrel(b, X(-10), 0.05, Z(-0.6), { fire: true });
        for (const [x, z, g] of [
          [-13.2, 0, true],
          [4.2, -4.6, false],
          [4.2, 4.6, true],
          [11.8, -4.8, true],
          [11.8, 4.8, false],
        ])
          PF.dressForm(b, X(x), 0.05, Z(z), r() * TAU, { gore: g, skull: g });
        for (let k = 0; k < 5; k++)
          PF.sewingMachine(
            b,
            X(-6 + k * 0.9),
            0.05,
            Z(-4.6 + (k % 2) * 0.3),
            r() * 0.6,
            { noStand: k % 2 === 0, tipped: k === 3 },
          );
        D.stringLights(
          b,
          P(-13.5, 4.4, -5.5),
          P(5.5, 4.2, -5.5),
          0.6,
          14,
          0xffc070,
        );
        const bn = PF.texMat(
          "sg_banner",
          PF.signTex(
            "sg_banner",
            ["STITCHERS", "WE SEW WHAT WE REAP"],
            "raider",
            512,
            256,
            { bg: "#3a2a22", fg: "#d8c8a0" },
          ),
          { side: THREE.DoubleSide },
        );
        quad(bn, -2.77, 4.6, 0, 3.4, 1.7, { ry: HP, grime: 0.3 });
        quad(bn, -2.83, 4.6, 0, 3.4, 1.7, { ry: -HP, grime: 0.3 }); // back face reads correctly too
        quad(
          PF.grafKey("sg_i1", ["FRESH MEAT", "FRESH THREAD"], "#c8281e"),
          -8.4,
          1.8,
          z1 - 0.12,
          3.2,
          1.6,
          { ry: PI, grime: 0.1 },
        );
        D.rubble(b, X(12.4), 0.05, Z(4.2), 0.8, 6, 203);
        // bullet-pocked marble, a blood trail dragged from the toll gap to the stairwell, scorch by the fire barrel
        for (const [x, y, z, ry, k] of [
          [-2.8, 2.1, z1 - 0.07, PI, 0],
          [9.2, 1.6, z0 + 0.07, 0, 1],
          [x1 - 0.07, 2.2, 3.8, -HP, 0],
          [-11.5, 3.0, z0 + 0.07, 0, 2],
        ])
          PF.decal(b, k, X(x), y, Z(z), 1.6, 1.6, ry);
        for (let k = 0; k < 7; k++)
          PF.decal(
            b,
            5,
            X(5.5 - k * 2.6),
            0.05,
            Z(0.4 + Math.sin(k) * 0.4),
            0.9,
            2.4,
            0,
            { floor: true, rz: HP + Math.sin(k * 1.3) * 0.25 },
          );
        PF.decal(b, 4, X(-10), 0.05, Z(-0.6), 2.4, 2.4, 0, { floor: true });
        // raider bedding: beer bottles, chem boxes, needles
        for (let k = 0; k < 9; k++)
          b.cyl(
            k % 3 ? "glass_dark" : "paint_cream",
            X(-12.2 + r() * 1.8),
            0.05,
            Z(-2.2 + r() * 1.6),
            0.035,
            0.04,
            0.24,
            6,
            { hSeg: 1, rz: r() < 0.5 ? HP : 0, ry: r() * 3 },
          );
        for (let k = 0; k < 3; k++)
          b.box(
            "paint_red",
            X(-11.4 + k * 0.3),
            0.05,
            Z(2.4 + k * 0.2),
            0.18,
            0.08,
            0.12,
            { ry: r(), seg: false },
          );
        PF.readable(
          P(8.7, 1.0, -2.9),
          "Toll Ledger",
          '"PAID: 50 scrip — some drifter. 50 scrip — tin can salesman. 1 pint — Thimble\'s cousin (volunteer). NOT PAID: the Custom House guy. He is now a dress form. —T."',
        );
        // stairwell door (west wall) with a painted arrow
        bmm("iron", x0 + 0.02, 0.05, -0.9, x0 + 0.12, 2.6, 0.9, {
          seg: false,
          c: 0x8a9080,
        });
        quad(
          PF.grafKey("sg_i2", ["UP ↑ SWEATSHOP"], "#e0d0b0"),
          x0 + 0.14,
          3.1,
          0,
          2.2,
          1.1,
          { ry: HP, grime: 0.1 },
        );
        A.entrance = PF.anchor(X(12.3), 0.1, Z(0), HP);
        A.lobby_elev = PF.anchor(X(-5.6), 0.1, Z(-4.4), PI);
        A.stair_l = PF.anchor(X(x0 + 1.4), 0.1, Z(0), -HP);
        A.toll = PF.anchor(X(8.8), 0.1, Z(-1.6), -HP);
        A.lobby_camp = PF.anchor(X(-10.5), 0.1, Z(2.2), HP);
        PF.sg = PF.sg || {};
        PF.sg.lobbyStair = P(x0 + 0.3, 1.5, 0);
        PF.sg.lobbyElev = P(-5.6, 1.5, z0 + 0.3);
      }

      // =====================================================================
      // FLOOR 2: the showroom & offices → the Stitchers' sweatshop
      // =====================================================================
      {
        const { x0, x1, z0, z1, h } = F2;
        slab("planks", x0, z0, x1, z1, 0.05, 0.3, { surface: "wood" });
        bmm("tin_ceil", x0, h, z0, x1, h + 0.3, z1, { segLen: 8, noAO: true });
        wall("wall_clean", "x", x0, x1, z0 - 0.4, z0, 0, h, []);
        wall("wall_clean", "x", x0, x1, z1, z1 + 0.4, 0, h, []);
        wall("wall_clean", "z", z0, z1, x0 - 0.4, x0, 0, h, []);
        wall("wall_clean", "z", z0, z1, x1, x1 + 0.4, 0, h, []);
        bmm("oak_ws", x0, 0.05, z0, x1, 0.25, z0 + 0.04, {
          seg: false,
          noAO: true,
        });
        bmm("oak_ws", x0, 0.05, z1 - 0.04, x1, 0.25, z1, {
          seg: false,
          noAO: true,
        });
        // windows on both long walls: the view down Liberty St through filthy glass, many boarded; timber frames
        for (let x = x0 + 2.5; x < x1 - 1; x += 3.2)
          for (const [z, ry] of [
            [z0 + 0.02, 0],
            [z1 - 0.02, PI],
          ]) {
            const boarded = r() < 0.35;
            quad(boarded ? "planks" : "sky_view", x, 2.1, z, 1.7, 2.2, {
              ry,
              noAO: true,
              uvRect: boarded ? undefined : PF.skyRect(r, 1.7, 2.2),
            });
            const dz = ry === 0 ? 0.05 : -0.05;
            for (const sx of [-0.9, 0, 0.9])
              box("oak_ws", x + sx, 0.95, z + dz, 0.1, 2.3, 0.08, {
                seg: false,
                grime: 0.5,
              });
            box("oak_ws", x, 3.2, z + dz, 1.9, 0.1, 0.08, {
              seg: false,
              grime: 0.5,
            });
            box("oak_ws", x, 2.15, z + dz, 1.8, 0.06, 0.06, { seg: false });
            bmm("sp_white", x - 1.0, 0.95, z - 0.08, x + 1.0, 1.05, z + 0.08, {
              seg: false,
            });
            if (boarded)
              for (let k = 0; k < 3; k++)
                box("rotten", x, 1.3 + k * 0.7, z + dz * 2, 2.0, 0.2, 0.04, {
                  rz: (r() - 0.5) * 0.4,
                  seg: false,
                });
          }
        // bullet holes, stains and blood scattered (not a repeating wallpaper)
        for (let k = 0; k < 16; k++) {
          const alongZ = k % 3 === 0;
          const x = alongZ
              ? k % 2
                ? x0 + 0.03
                : x1 - 0.03
              : x0 + 2 + r() * (x1 - x0 - 4),
            z = alongZ ? -6 + r() * 12 : k % 2 ? z0 + 0.03 : z1 - 0.03;
          PF.decal(
            b,
            [0, 1, 2, 7, 3][k % 5],
            X(x),
            1.2 + r() * 2.2,
            Z(z),
            1.0 + r() * 0.8,
            1.0 + r() * 0.8,
            alongZ ? (k % 2 ? HP : -HP) : k % 2 ? 0 : PI,
            { rz: r() * 3 },
          );
        }
        // cast-iron columns
        for (let x = x0 + 4; x < x1 - 1; x += 5)
          for (const z of [-3, 3]) {
            b.cyl("iron_green", X(x), 0.05, Z(z), 0.18, 0.2, h - 0.05, 8, {
              hSeg: 1,
            });
            b.cyl("iron_green", X(x), h - 0.35, Z(z), 0.4, 0.2, 0.3, 8, {
              hSeg: 1,
            });
            PF.col(X(x), Z(z), 0.4, 0.4, 0, h, 0, { walkable: false });
          }
        // pressed-tin ceiling pattern (panels), hanging work lamps
        for (let x = x0 + 2; x < x1; x += 4)
          bmm("sp_white", x - 0.05, h - 0.12, z0, x + 0.05, h, z1, {
            seg: false,
            noAO: true,
          });
        for (const [x, z, lit] of [
          [36, 0, true],
          [40, 0, true],
          [46, -2, false],
          [50, -2, true],
          [54, 3, true],
        ]) {
          b.beam("iron", P(x, h, z), P(x, h - 1.1, z), 0.015, 0.015, {
            noAO: true,
          });
          b.cyl("iron", X(x), h - 1.3, Z(z), 0.06, 0.3, 0.22, 8, {
            hSeg: 1,
            open: true,
          });
          b.sphere(
            lit ? "bulb_ws" : "glass_broken",
            X(x),
            h - 1.32,
            Z(z),
            0.08,
            { ws: 6, hs: 4, noAO: true },
          );
          if (lit)
            PF.glow(P(x, h - 1.4, z), 0xffd8a0, 1.4, root, { intensity: 1.0 });
        }
        // showroom: the SINGER sign, display plinths with machines, dress forms in a line (the gallery)
        const sgn = PF.texMat(
          "sg_show",
          PF.signTex(
            "sg_show",
            ["SINGER", "SEWING MACHINES · SINCE 1851"],
            "enamel",
            512,
            160,
            { bg: "#8a1a14", fg: "#f0e0b8" },
          ),
          {},
        );
        quad(sgn, 32.6, 3.2, z1 - 0.05, 3.2, 1.0, { ry: PI, grime: 0.2 });
        for (let k = 0; k < 4; k++) {
          solid(
            "marble_ws",
            32 + k * 2.2,
            0.05,
            5.6,
            33.4 + k * 2.2,
            0.5,
            6.8,
            { seg: false },
          );
          PF.sewingMachine(b, X(32.7 + k * 2.2), 0.5, Z(6.2), 0, {
            noStand: true,
            tipped: k === 2,
          });
        }
        for (let k = 0; k < 7; k++)
          PF.dressForm(b, X(33 + k * 1.3), 0.05, Z(-6.8), 0, {
            gore: k % 3 === 1,
            skull: k === 4,
          });
        // the sweatshop: long tables with sewing machines, piles of leather & scrap armour, armour racks
        for (const z of [-2.2, 2.2]) {
          solid("oak_ws", 38, 0.05, z - 0.5, 52, 0.85, z + 0.5, { seg: false });
          for (let x = 38.8; x < 52; x += 1.7)
            PF.sewingMachine(b, X(x), 0.85, Z(z), z < 0 ? 0 : PI, {
              noStand: true,
            });
          for (let x = 39.5; x < 52; x += 3.4)
            D.chair(
              b,
              X(x),
              0.05,
              Z(z + (z < 0 ? -1.0 : 1.0)),
              z < 0 ? 0 : PI,
              r() < 0.2,
              "iron",
            );
        }
        for (let k = 0; k < 5; k++)
          b.box(
            "rust",
            X(40 + k * 2.6),
            0.9,
            Z(-2.2 + (r() - 0.5) * 0.4),
            0.5,
            0.1,
            0.6,
            { ry: r(), seg: false },
          );
        // junk on the sewing tables: thread spools, shears, leather offcuts, tin armour plates
        for (let k = 0; k < 18; k++) {
          const z = k % 2 ? 2.2 : -2.2,
            x = 38.6 + r() * 13;
          if (k % 3 === 0)
            b.cyl(
              ["paint_red", "linen_ws", "paint_teal"][
                k % 3 === 0 ? (k / 3) % 3 : 0
              ],
              X(x),
              0.85,
              Z(z + (r() - 0.5) * 0.6),
              0.04,
              0.04,
              0.08,
              6,
              { hSeg: 1 },
            );
          else if (k % 3 === 1)
            b.box(
              "fabric",
              X(x),
              0.85,
              Z(z + (r() - 0.5) * 0.6),
              0.4,
              0.02,
              0.3,
              { ry: r() * 3, seg: false, c: 0x6a4a34 },
            );
          else
            b.box(
              "chrome",
              X(x),
              0.86,
              Z(z + (r() - 0.5) * 0.5),
              0.22,
              0.01,
              0.04,
              { ry: r() * 3, seg: false },
            );
        }
        // the Stitchers' "fitting": a body strapped to the cutting table at the east end
        solid("oak_ws", 36.0, 0.05, 4.2, 38.2, 0.9, 5.2, { seg: false });
        PF.skeleton(b, X(37.1), 0.92, Z(4.7), HP);
        for (const x of [36.4, 37.1, 37.8])
          b.box("leather_ws", X(x), 0.9, Z(4.7), 0.08, 0.06, 1.05, {
            seg: false,
          });
        PF.decal(b, 3, X(37.1), 0.91, Z(4.7), 1.6, 0.9, 0, { floor: true });
        PF.decal(b, 3, X(37.4), 0.05, Z(5.6), 1.4, 1.4, 0, { floor: true });
        for (let k = 0; k < 6; k++)
          PF.decal(
            b,
            5,
            X(42 + k * 1.6),
            0.05,
            Z(4.2 + k * 0.45),
            0.8,
            2.0,
            0,
            { floor: true, rz: -0.35 },
          );
        PF.readable(
          P(55.6, 0.85, -6.0),
          "Stitchers' Pay Roster",
          '"NEEDLES — 40 scrip + first pick of the boots.  THIMBLE — 30 scrip (toll skim deducted).  BASTE & HEM — 20 scrip each.  NEW GUY — 0 scrip until he stops crying.  Madame gets the Seal, the view and the last word. — B."',
        );
        for (let k = 0; k < 4; k++) {
          b.box(
            "fabric",
            X(44 + k * 1.4),
            0.05,
            Z(6.4),
            1.1,
            0.4 + r() * 0.3,
            0.9,
            { ry: r(), seg: false, c: 0x6a4a34 },
          );
        }
        for (let k = 0; k < 3; k++) {
          bmm("iron", 50 + k * 1.6, 0.05, 6.8, 50.1 + k * 1.6, 1.9, 7.8, {
            seg: false,
          });
          bmm("iron", 50 + k * 1.6, 1.8, 6.8, 51.6 + k * 1.6, 1.9, 7.8, {
            seg: false,
          });
          PF.dressForm(b, X(50.8 + k * 1.6), 0.05, Z(7.3), PI, { gore: true });
        }
        // bunks & fire in the NW corner
        for (let k = 0; k < 3; k++)
          D.mattress(b, X(31.6 + k * 1.4), 0.05, Z(-4.2), 0.1 * k, 0x7a6a50);
        PF.barrel(b, X(34), 0.05, Z(4.8), { fire: true });
        // offices along the east end: foreman's office (terminal), stock room
        wall("plaster_w", "z", z0, z1, 52.6, 52.8, 0, h, [
          { c: -4, w: 1.2, y0: 0, h: 2.4 },
          { c: 4.2, w: 1.2, y0: 0, h: 2.4 },
        ]);
        wall("plaster_w", "x", 52.8, x1, 0.4, 0.6, 0, h, []);
        solid("oak_ws", 55.2, 0.05, -6.8, 57.6, 0.8, -5.6, { seg: false });
        D.chair(b, X(56.4), 0.05, Z(-4.9), 0, false, "iron");
        for (let k = 0; k < 3; k++)
          bmm("panel", 53.2 + k * 0.7, 0.05, -1.0, 53.8 + k * 0.7, 1.4, -0.4, {
            seg: false,
          });
        col(53.2, 0, -1.0, 55.2, 1.4, -0.4);
        D.shelf(b, X(56.5), 0.05, Z(7.5), PI, 2.2, 4, 211);
        D.shelf(b, X(54), 0.05, Z(7.5), PI, 2.2, 4, 212);
        const fm = PF.texMat(
          "sg_foreman",
          PF.signTex("sg_foreman", ["FOREMAN"], "enamel", 256, 64, {
            bg: "#2a3a2a",
            fg: "#e8dcb8",
          }),
          {},
        );
        quad(fm, 52.55, 2.8, -4, 1.0, 0.25, { ry: -HP, grime: 0.2 });
        // stairwell doors
        bmm("iron", x0 + 0.02, 0.05, -0.9, x0 + 0.12, 2.6, 0.9, {
          seg: false,
          c: 0x8a9080,
        });
        bmm("iron", 50.6, 0.05, z1 - 0.12, 52.0, 2.6, z1 - 0.02, {
          seg: false,
          c: 0x8a9080,
        });
        quad(
          PF.grafKey("sg_i3", ["↑ THE DOME ↑", "BOSS LADY ONLY"], "#c8281e"),
          50.5,
          3.2,
          z1 - 0.1,
          2.6,
          1.3,
          { ry: PI, grime: 0.1 },
        );
        D.papers(b, X(45), 0.05, Z(0), 5, 30, 213);
        A.f2_entry = PF.anchor(X(x0 + 1.5), 0.1, Z(0), -HP);
        A.f2_stair = PF.anchor(X(51.3), 0.1, Z(z1 - 1.2), 0);
        A.foreman = PF.anchor(X(56.4), 0.1, Z(-3.6), PI);
        A.sweatshop = PF.anchor(X(45), 0.1, Z(0), HP);
        PF.sg.f2West = P(x0 + 0.3, 1.5, 0);
        PF.sg.f2East = P(51.3, 1.5, z1 - 0.3);
      }

      // =====================================================================
      // THE DOME: square base, the four great round windows, inner dome shell,
      // steel ribs, catwalk ring, armoury, elevator machine room
      // =====================================================================
      {
        const { cx, cz, y, h } = DM;
        const H = h;
        slab("diamond", cx - H, cz - H, cx + H, cz + H, y + 0.05, 0.4, {
          surface: "metal",
        });
        // walls up to the dome spring (y + 1.5), then the inner dome shell (superellipse)
        wall(
          "brick_singer",
          "x",
          cx - H,
          cx + H,
          cz - H - 0.5,
          cz - H,
          y,
          y + 1.6,
          [],
        );
        wall(
          "brick_singer",
          "x",
          cx - H,
          cx + H,
          cz + H,
          cz + H + 0.5,
          y,
          y + 1.6,
          [],
        );
        wall(
          "brick_singer",
          "z",
          cz - H,
          cz + H,
          cx - H - 0.5,
          cx - H,
          y,
          y + 1.6,
          [],
        );
        wall(
          "brick_singer",
          "z",
          cz - H,
          cz + H,
          cx + H,
          cx + H + 0.5,
          y,
          y + 1.6,
          [],
        );
        const prof = [
          [H, 0],
          [H + 0.9, 1.2],
          [H + 1.3, 3.2],
          [H + 1.1, 6.0],
          [H + 0.2, 9.0],
          [H - 1.8, 12.5],
          [H - 3.9, 15.5],
          [H - 5.5, 18.2],
          [H - 6.3, 20.0],
          [0.001, 20.2],
        ];
        innerLathe(
          b,
          "dome_red",
          prof.map((p) => [p[0] - 0.3, p[1]]),
          40,
          X(cx),
          y + 1.6,
          Z(cz),
          (v) => {
            const a = Math.atan2(v.z, v.x);
            const f = sq(a, 7);
            v.x *= f;
            v.z *= f;
          },
          { grime: 0.6 },
        );
        // colliders following the dome's inner wall (low part)
        for (const [x0, z0, x1, z1] of [
          [cx - H - 1.3, cz - H - 1.3, cx + H + 1.3, cz - H],
          [cx - H - 1.3, cz + H, cx + H + 1.3, cz + H + 1.3],
          [cx - H - 1.3, cz - H, cx - H, cz + H],
          [cx + H, cz - H, cx + H + 1.3, cz + H],
        ])
          col(x0, y, z0, x1, y + 9, z1);
        // steel ribs up the dome (8), ring girder at the catwalk level
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU + PI / 8;
          let prev = null;
          for (const p of prof) {
            const f = sq(a, 7),
              rr = (p[0] - 0.55) * f;
            const q = P(
              cx + Math.cos(a) * rr,
              y + 1.6 + p[1] - 0.1,
              cz + Math.sin(a) * rr,
            );
            if (prev) b.beam("rust", prev, q, 0.25, 0.25, { noAO: true });
            prev = q;
          }
        }
        // the four great round windows (daylight) in deep reveals, one pane smashed (the one facing the avenue)
        for (const [dx, dz, ry] of [
          [1, 0, -HP],
          [-1, 0, HP],
          [0, 1, PI],
          [0, -1, 0],
        ]) {
          const wx = cx + dx * (H + 0.62),
            wz = cz + dz * (H + 0.62);
          {
            const cg = new THREE.CircleGeometry(1.3, 24);
            const ra = PF.skyRect(r, 2.6, 2.6, true);
            b.add("sky_view", cg, {
              m: PF.m4(X(wx - dx * 0.02), y + 1.6 + 4.6, Z(wz - dz * 0.02), ry),
              uv: "keep",
              uvRect: ra,
              noAO: true,
              grime: 0,
            });
          }
          const rg = new THREE.TorusGeometry(1.45, 0.2, 5, 20);
          b.add("lime_ws", rg, {
            m: PF.m4(X(wx - dx * 0.05), y + 1.6 + 4.6, Z(wz - dz * 0.05), ry),
            grime: 0.3,
          });
          for (let k = 0; k < 4; k++)
            b.box(
              "iron_green",
              X(wx - dx * 0.08),
              y + 1.6 + 4.6 - 0.02,
              Z(wz - dz * 0.08),
              dz !== 0 ? 2.6 : 0.05,
              0.05,
              dx !== 0 ? 2.6 : 0.05,
              {
                rz: dz !== 0 ? (k * PI) / 4 : 0,
                rx: dx !== 0 ? (k * PI) / 4 : 0,
                seg: false,
              },
            );
        }
        // catwalk ring (y + 6) on brackets, rails, a steel stair from the floor (south side, climbing east)
        const cy = y + 6,
          cw = 1.6;
        const ring = [
          [cx - H + 0.2, cz - H + 0.2, cx + H - 0.2, cz - H + 0.2 + cw],
          [cx - H + 0.2, cz + H - 0.2 - cw, cx + H - 0.2, cz + H - 0.2],
          [
            cx - H + 0.2,
            cz - H + 0.2 + cw,
            cx - H + 0.2 + cw,
            cz + H - 0.2 - cw,
          ],
          [
            cx + H - 0.2 - cw,
            cz - H + 0.2 + cw,
            cx + H - 0.2,
            cz + H - 0.2 - cw,
          ],
        ];
        for (const [x0, z0, x1, z1] of ring)
          slab("diamond", x0, z0, x1, z1, cy, 0.15, { surface: "metal" });
        const ix0 = cx - H + 0.2 + cw,
          ix1 = cx + H - 0.2 - cw,
          iz0 = cz - H + 0.2 + cw,
          iz1 = cz + H - 0.2 - cw;
        PF.rail(b, X(ix0), Z(iz0), X(ix1), Z(iz0), cy, { key: "iron" });
        PF.rail(b, X(ix1), Z(iz0), X(ix1), Z(iz1), cy, { key: "iron" });
        PF.rail(b, X(ix0), Z(iz0), X(ix0), Z(iz1), cy, { key: "iron" });
        PF.rail(b, X(ix0), Z(iz1), X(cx - 4.8), Z(iz1), cy, { key: "iron" });
        PF.rail(b, X(cx - 3.2), Z(iz1), X(ix1), Z(iz1), cy, { key: "iron" });
        // steel stair inside the ring along the south side, climbing west to the catwalk
        PF.steelStair(
          b,
          X(cx + 4.0),
          Z(cz + 6.2),
          -HP,
          1.5,
          8.0,
          y + 0.05,
          cy,
          { key: "iron", tread: "diamond", railKey: "iron", railSide: -1 },
        );
        // ledge closing the gap between the wall tops and the dome shell's rim
        bmm(
          "lime_ws",
          cx - H - 0.5,
          y + 1.5,
          cz - H - 0.5,
          cx + H + 0.5,
          y + 1.75,
          cz - H + 0.4,
          { seg: false },
        );
        bmm(
          "lime_ws",
          cx - H - 0.5,
          y + 1.5,
          cz + H - 0.4,
          cx + H + 0.5,
          y + 1.75,
          cz + H + 0.5,
          { seg: false },
        );
        bmm(
          "lime_ws",
          cx - H - 0.5,
          y + 1.5,
          cz - H + 0.4,
          cx - H + 0.4,
          y + 1.75,
          cz + H - 0.4,
          { seg: false },
        );
        bmm(
          "lime_ws",
          cx + H - 0.4,
          y + 1.5,
          cz - H + 0.4,
          cx + H + 0.5,
          y + 1.75,
          cz + H - 0.4,
          { seg: false },
        );
        // central scaffold: a steel tower to the lantern hatch (ladder door on the catwalk's north run)
        for (const [sx, sz] of [
          [-1.2, -1.2],
          [1.2, -1.2],
          [-1.2, 1.2],
          [1.2, 1.2],
        ])
          b.cyl("rust", X(cx + sx), y + 0.05, Z(cz + sz), 0.1, 0.1, 17.5, 6, {
            hSeg: 3,
          });
        for (let yy = y + 3; yy < y + 17; yy += 3) {
          for (const [ax, az, bx2, bz2] of [
            [-1.2, -1.2, 1.2, -1.2],
            [1.2, -1.2, 1.2, 1.2],
            [1.2, 1.2, -1.2, 1.2],
            [-1.2, 1.2, -1.2, -1.2],
          ])
            b.beam(
              "rust",
              P(cx + ax, yy, cz + az),
              P(cx + bx2, yy, cz + bz2),
              0.08,
              0.08,
              {},
            );
        }
        col(cx - 1.4, y, cz - 1.4, cx + 1.4, y + 17.5, cz + 1.4);
        bmm(
          "diamond",
          cx - 1.6,
          y + 17.4,
          cz - 1.6,
          cx + 1.6,
          y + 17.6,
          cz + 1.6,
          { seg: false },
        );
        b.beam(
          "iron",
          P(cx, cy + 0.1, cz - H + 1.0),
          P(cx - 0.2, y + 17.4, cz - 1.6),
          0.2,
          0.05,
          {},
        ); // ladder rails to the hatch
        for (let k = 0; k < 20; k++) {
          const t = k / 20;
          b.beam(
            "iron",
            P(
              cx - 0.35,
              cy + 0.2 + t * (y + 17.2 - cy),
              cz - H + 1.0 + t * (H - 2.6),
            ),
            P(
              cx + 0.25,
              cy + 0.2 + t * (y + 17.2 - cy),
              cz - H + 1.0 + t * (H - 2.6),
            ),
            0.03,
            0.03,
            {},
          );
        }
        // armoury (NE), bunks (SE), a big fire barrel ring in the middle, the raiders' "trophy wall"
        for (let k = 0; k < 3; k++) {
          bmm(
            "iron",
            cx + 4.5 + k * 1.3,
            y + 0.05,
            cz - H + 0.4,
            cx + 5.6 + k * 1.3,
            y + 2.0,
            cz - H + 0.9,
            { seg: false },
          );
          for (let g = 0; g < 3; g++)
            box(
              "iron",
              cx + 4.8 + k * 1.3 + g * 0.3,
              y + 0.6,
              cz - H + 0.95,
              0.06,
              1.2,
              0.05,
              { rz: 0.1, seg: false },
            );
        }
        col(cx + 4.5, y, cz - H + 0.4, cx + 8.5, y + 2, cz - H + 0.9);
        for (let k = 0; k < 4; k++)
          D.mattress(
            b,
            X(cx + 6.6),
            y + 0.05,
            Z(cz + 1 + k * 1.6),
            HP,
            0x7a6a50,
          );
        for (let k = 0; k < 3; k++)
          PF.barrel(
            b,
            X(cx + 3.2 + Math.cos(k * 2.1) * 0.9),
            y + 0.05,
            Z(cz + 3.2 + Math.sin(k * 2.1) * 0.9),
            { fire: k === 0 },
          );
        for (let k = 0; k < 6; k++)
          PF.dressForm(b, X(cx - H + 1.2), y + 0.05, Z(cz - 3 + k * 1.3), HP, {
            gore: k % 2 === 0,
            skull: k % 2 === 0,
          });
        // the pen: a cage of the ones who didn't fit, meat sacks hung from the ribs, blood on the deck
        {
          const qx = cx - 6.0,
            qz = cz + 5.6;
          for (let k = 0; k <= 12; k++) {
            const a = (k / 12) * TAU;
            b.beam(
              "iron",
              P(qx + Math.cos(a) * 1.3, y + 0.05, qz + Math.sin(a) * 1.3),
              P(qx + Math.cos(a) * 1.3, y + 2.4, qz + Math.sin(a) * 1.3),
              0.03,
              0.03,
              {},
            );
          }
          b.cyl("iron", X(qx), y + 2.4, Z(qz), 1.35, 1.35, 0.06, 12, {
            hSeg: 1,
          });
          PF.col(X(qx), Z(qz), 2.6, 2.6, y, y + 2.4, 0, { walkable: false });
          PF.skeleton(b, X(qx - 0.3), y + 0.05, Z(qz + 0.1), 0.9);
          PF.skeleton(b, X(qx + 0.4), y + 0.05, Z(qz - 0.3), -2.2);
          PF.decal(b, 3, X(qx), y + 0.05, Z(qz), 2.2, 2.2, 0, { floor: true });
          for (const [hx, hz, hl] of [
            [-3.2, -2.2, 8.4],
            [2.6, -3.8, 9.0],
            [-1.0, 3.0, 8.0],
          ]) {
            b.beam(
              "rope",
              P(cx + hx, y + 11.0, cz + hz),
              P(cx + hx, y + 11.0 - hl + 1.3, cz + hz),
              0.02,
              0.02,
              { noAO: true },
            );
            b.add("fabric", new THREE.CapsuleGeometry(0.28, 0.9, 3, 8), {
              m: PF.m4(
                X(cx + hx),
                y + 11.0 - hl + 0.6,
                Z(cz + hz),
                0,
                0.05,
                0.08,
                1,
                1,
                0.8,
              ),
              c: 0x6a3a2a,
              grime: 0.8,
            });
            PF.decal(b, 3, X(cx + hx), y + 0.05, Z(cz + hz), 1.0, 1.0, 0, {
              floor: true,
            });
          }
        }
        PF.readable(
          P(cx + 6.2, y + 0.9, cz - H + 1.4),
          "Bobbin's Pattern Book",
          "\"Autumn line: the St. Paul's Sister (sold out — she wouldn't hold still). Winter line: Custom House convoy hand in duster, heavy wear. Spring: whatever comes up the stairs. NOTE — the Seal goes on the lantern easel where the whole city can see what Madame took.\"",
        );
        const tw = PF.texMat(
          "sg_trophy",
          PF.signTex(
            "sg_trophy",
            ["THE GALLERY", "best dressed · worst dead"],
            "raider",
            512,
            160,
            {},
          ),
          {},
        );
        quad(tw, cx - H + 0.05, y + 3.2, cz, 3.0, 0.94, { ry: HP, grime: 0.2 });
        // elevator machine room (NW corner): motor, brake drum, cable sheave, the open shaft (loop back)
        {
          const mx0 = cx - H,
            mx1 = cx - H + 4.2,
            mz0 = cz - H,
            mz1 = cz - H + 4.2;
          wall("brick_singer", "x", mx0, mx1, mz1, mz1 + 0.25, y, y + 3.2, [
            { c: mx0 + 2.8, w: 1.2, y0: y, h: 2.4 },
          ]);
          wall("brick_singer", "z", mz0, mz1, mx1, mx1 + 0.25, y, y + 3.2, []);
          bmm("panel", mx0, y + 3.2, mz0, mx1 + 0.25, y + 3.4, mz1 + 0.25, {
            seg: false,
          });
          solid(
            "vault_dk",
            mx0 + 0.4,
            y + 0.05,
            mz0 + 0.4,
            mx0 + 2.2,
            y + 1.3,
            mz0 + 1.6,
            { seg: false, surface: "metal" },
          );
          b.cyl(
            "iron_green",
            X(mx0 + 1.3),
            y + 1.8,
            Z(mz0 + 1.0),
            0.7,
            0.7,
            0.5,
            14,
            { rx: HP, hSeg: 1 },
          );
          b.cyl(
            "rust",
            X(mx0 + 3.2),
            y + 1.4,
            Z(mz0 + 1.2),
            0.5,
            0.5,
            0.4,
            14,
            { rz: HP, hSeg: 1 },
          );
          bmm(
            "iron",
            mx0 + 2.6,
            y + 0.05,
            mz0 + 2.4,
            mx0 + 3.9,
            y + 0.1,
            mz0 + 3.9,
            { seg: false, c: 0x303030 },
          ); // shaft hatch
          for (let k = 0; k < 3; k++)
            b.beam(
              "tire",
              P(mx0 + 3.0 + k * 0.2, y + 1.4, mz0 + 1.2),
              P(mx0 + 3.0 + k * 0.2, y + 0.1, mz0 + 3.1),
              0.03,
              0.03,
              {},
            );
          const ek = PF.texMat(
            "sg_elev",
            PF.signTex(
              "sg_elev",
              ["OTIS ELEVATOR CO.", "CAR No. 2 — OUT OF SERVICE"],
              "enamel",
              512,
              128,
              { bg: "#2a2a2a", fg: "#e0d0a0" },
            ),
            {},
          );
          quad(ek, mx0 + 2.6, y + 2.6, mz1 + 0.27, 1.8, 0.45, {
            ry: 0,
            grime: 0.3,
          });
          PF.sg.shaftTop = P(mx0 + 3.25, y + 0.9, mz0 + 3.1);
          A.machine = PF.anchor(X(mx0 + 1.2), y + 0.1, Z(mz0 + 3.0), -HP);
        }
        // stairwell door on the east wall (arrival from floor 2)
        bmm(
          "iron",
          cx + H - 0.12,
          y + 0.05,
          cz + 4,
          cx + H - 0.02,
          y + 2.6,
          cz + 5.8,
          { seg: false, c: 0x8a9080 },
        );
        A.dome_entry = PF.anchor(X(cx + H - 1.4), y + 0.1, Z(cz + 4.9), HP);
        A.dome = PF.anchor(X(cx), y + 0.1, Z(cz + 4), 0);
        A.catwalk = PF.anchor(X(cx), cy + 0.05, Z(cz - H + 1.0), PI);
        A.armory = PF.anchor(X(cx + 6), y + 0.1, Z(cz - H + 2.2), 0);
        PF.sg.domeEast = P(cx + H - 0.3, y + 1.5, cz + 4.9);
        PF.sg.hatch = P(cx, cy + 1.2, cz - H + 1.2);
      }

      // =====================================================================
      // THE LANTERN: the sniper nest at the top of the Singer
      // =====================================================================
      {
        const { cx, cz, y, h } = LN;
        slab(
          "diamond",
          cx - h - 0.5,
          cz - h - 0.5,
          cx + h + 0.5,
          cz + h + 0.5,
          y + 0.05,
          0.3,
          { surface: "metal" },
        );
        bmm("dome_red", cx - h, y + 4.6, cz - h, cx + h, y + 4.9, cz + h, {
          seg: false,
          noAO: true,
        });
        for (const [dx, dz, ry] of [
          [1, 0, -HP],
          [-1, 0, HP],
          [0, 1, PI],
          [0, -1, 0],
        ]) {
          const wx = cx + dx * h,
            wz = cz + dz * h;
          const ux = -dz,
            uz = dx;
          // piers at the corners + arch opening with daylight beyond
          for (const sg of [-1, 1])
            solid(
              "lime_ws",
              wx + ux * sg * (h - 0.35) - 0.35 - (dx !== 0 ? 0 : 0),
              y,
              wz + uz * sg * (h - 0.35) - 0.35,
              wx + ux * sg * (h - 0.35) + 0.35,
              y + 4.6,
              wz + uz * sg * (h - 0.35) + 0.35,
              { seg: false, surface: "concrete" },
            );
          PF.archBay(
            b,
            X(wx + dx * 0.15),
            y + 0.9,
            Z(wz + dz * 0.15),
            ry,
            2.6,
            3.4,
            {
              pane: "sky_view",
              paneRect: PF.skyRect(r, 2.6, 3.4, true),
              ring: "gold_leaf",
              ringW: 0.2,
              n: 9,
              sash: dx !== 1,
              sashKey: "iron_green",
            },
          );
          bmm(
            "dome_red",
            Math.min(wx - ux * h, wx + ux * h) - (dx !== 0 ? 0.15 : 0),
            y,
            Math.min(wz - uz * h, wz + uz * h) - (dz !== 0 ? 0.15 : 0),
            Math.max(wx - ux * h, wx + ux * h) + (dx !== 0 ? 0.15 : 0),
            y + 0.9,
            Math.max(wz - uz * h, wz + uz * h) + (dz !== 0 ? 0.15 : 0),
            { seg: false },
          );
          col(
            Math.min(wx - ux * h, wx + ux * h) - 0.2,
            y,
            Math.min(wz - uz * h, wz + uz * h) - 0.2,
            Math.max(wx - ux * h, wx + ux * h) + 0.2,
            y + 4.6,
            Math.max(wz - uz * h, wz + uz * h) + 0.2,
          );
        }
        // nest: sandbags under the east (avenue) arch, the sniper's mattress & ammo, the trophy easel
        PF.sandbags(
          b,
          X(cx + h - 0.7),
          Z(cz - 1.1),
          X(cx + h - 0.7),
          Z(cz + 1.1),
          2,
          { y: y + 0.05, noCollide: true },
        );
        D.mattress(b, X(cx - 1.2), y + 0.05, Z(cz + 1.2), HP, 0x8a3a3a);
        D.papers(b, X(cx + 1.2), y + 0.05, Z(cz), 0.6, 8, 241);
        for (let k = 0; k < 12; k++)
          b.cyl(
            "brass_ws",
            X(cx + 1.4 + r() * 0.8),
            y + 0.07,
            Z(cz - 0.8 + r() * 1.6),
            0.012,
            0.012,
            0.07,
            4,
            { hSeg: 1, rz: HP, ry: r() * 3 },
          );
        for (let k = 0; k < 6; k++)
          b.cyl(
            "glass_dark",
            X(cx - 1.8 + r() * 1.2),
            y + 0.07,
            Z(cz + 0.4 + r() * 1.4),
            0.035,
            0.04,
            0.24,
            6,
            { hSeg: 1, rz: r() < 0.6 ? HP : 0, ry: r() * 3 },
          );
        b.box("iron", X(cx + h - 1.0), y + 0.9, Z(cz - 0.2), 0.5, 0.1, 0.1, {
          seg: false,
        }); // spotting scope on the sandbags
        b.cyl(
          "black_enamel",
          X(cx + h - 0.9),
          y + 1.0,
          Z(cz - 0.2),
          0.05,
          0.06,
          0.45,
          8,
          { rz: HP, hSeg: 1 },
        );
        // the easel with the stolen Great Seal (the pickup sits on it)
        b.beam(
          "oak_ws",
          P(cx - 1.6, y + 0.05, cz - 1.6),
          P(cx - 1.4, y + 1.8, cz - 1.8),
          0.05,
          0.05,
          {},
        );
        b.beam(
          "oak_ws",
          P(cx - 1.0, y + 0.05, cz - 1.6),
          P(cx - 1.2, y + 1.8, cz - 1.8),
          0.05,
          0.05,
          {},
        );
        b.beam(
          "oak_ws",
          P(cx - 1.3, y + 0.05, cz - 2.2),
          P(cx - 1.3, y + 1.7, cz - 1.8),
          0.05,
          0.05,
          {},
        );
        bmm(
          "oak_ws",
          cx - 1.8,
          y + 0.9,
          cz - 1.62,
          cx - 0.8,
          y + 0.95,
          cz - 1.5,
          { seg: false },
        );
        const note = PF.texMat(
          "sg_bobbin",
          PF.signTex(
            "sg_bobbin",
            [
              "MADAME BOBBIN'S",
              "PRIVATE COLLECTION",
              "touch it & I sew your eyes shut",
            ],
            "raider",
            512,
            200,
            { bg: "#e0d8c4", fg: "#7a1a14", outline: false },
          ),
          {},
        );
        quad(note, cx - 1.3, y + 2.3, cz - 1.9, 1.1, 0.43, {
          ry: 0,
          grime: 0.2,
        });
        // hatch down
        bmm("iron", cx + 0.6, y + 0.06, cz - 2.0, cx + 1.6, y + 0.1, cz - 1.0, {
          seg: false,
          c: 0x303030,
        });
        A.lantern = PF.anchor(X(cx), y + 0.1, Z(cz + 0.4), -HP);
        A.lantern_entry = PF.anchor(X(cx + 1.1), y + 0.1, Z(cz - 0.3), PI);
        A.boss_bobbin = PF.anchor(X(cx + h - 1.3), y + 0.1, Z(cz + 0.2), -HP);
        A.seal = P(cx - 1.3, y + 1.0, cz - 1.56);
        PF.sg.lanternHatch = P(cx + 1.1, y + 0.6, cz - 1.5);
        PF.sg.lanternEast = P(cx + h - 0.2, y + 1.5, cz);
      }

      PF.flushGlows(root);
      PF.flushFires();
      b.build(root, { lodDistInt: 400 });

      // =====================================================================
      // anchors, doors, props, NPCs
      // =====================================================================
      Object.assign(A, {
        spawn1: PF.anchor(X(9.8), 0.1, Z(2.6), HP),
        spawn2: A.lobby_camp,
        spawn3: A.sweatshop,
        spawn4: PF.anchor(X(34.5), 0.1, Z(-2.4), -HP),
        spawn5: A.dome,
        spawn6: A.armory,
        boss: A.catwalk,
        loot1: A.armory,
        loot2: A.foreman,
        loot3: A.lantern,
      });
      PF.sg.int = A;
      const SGX = PF.SG;
      const door0 = SGX.door;
      PF.door({
        id: "pws_sg_in",
        pos: door0,
        label: "Singer Building",
        verb: "Enter",
        radius: 1.5,
        target: { x: A.entrance.x, y: A.entrance.y, z: A.entrance.z, yaw: HP },
        sound: "door_open",
      });
      PF.door({
        id: "pws_sg_out",
        pos: P(13.7, 1.5, 0),
        label: "7th Avenue",
        verb: "Exit",
        radius: 1.5,
        target: { x: SGX.X1 + 2.6, y: 0.25, z: SGX.TZC, yaw: -HP },
        sound: "door_open",
      });
      const f2 = A.f2_entry,
        dm = A.dome_entry;
      PF.door({
        id: "pws_sg_st1_up",
        pos: PF.sg.lobbyStair,
        label: "Stairwell (Floor 2)",
        verb: "Climb",
        radius: 1.1,
        target: { x: f2.x, y: f2.y, z: f2.z, yaw: -HP },
        sound: "door_open",
      });
      PF.door({
        id: "pws_sg_st1_down",
        pos: PF.sg.f2West,
        label: "Stairwell (Lobby)",
        verb: "Descend",
        radius: 1.1,
        target: { x: A.stair_l.x, y: A.stair_l.y, z: A.stair_l.z, yaw: -HP },
        sound: "door_open",
      });
      PF.door({
        id: "pws_sg_st2_up",
        pos: PF.sg.f2East,
        label: "Stairwell (The Dome)",
        verb: "Climb",
        radius: 1.1,
        target: { x: dm.x, y: dm.y, z: dm.z, yaw: HP },
        sound: "door_open",
      });
      PF.door({
        id: "pws_sg_st2_down",
        pos: PF.sg.domeEast,
        label: "Stairwell (Floor 2)",
        verb: "Descend",
        radius: 1.1,
        target: { x: A.f2_stair.x, y: A.f2_stair.y, z: A.f2_stair.z, yaw: 0 },
        sound: "door_open",
      });
      PF.door({
        id: "pws_sg_hatch_up",
        pos: PF.sg.hatch,
        label: "Ladder (The Lantern)",
        verb: "Climb",
        radius: 1.0,
        target: {
          x: A.lantern_entry.x,
          y: A.lantern_entry.y,
          z: A.lantern_entry.z,
          yaw: PI,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pws_sg_hatch_down",
        pos: PF.sg.lanternHatch,
        label: "Ladder (The Dome)",
        verb: "Climb",
        radius: 0.9,
        target: {
          x: A.catwalk.x + 1.2,
          y: A.catwalk.y,
          z: A.catwalk.z - 0.1,
          yaw: -HP,
        },
        sound: "door_open",
      });
      // loop back: the elevator cable from the machine room to the open car in the lobby
      // (one-way until used: sliding down leaves a knotted rope the player can climb back up — FO-style far-side shortcut)
      PF.door({
        id: "pws_sg_cable",
        pos: PF.sg.shaftTop,
        label: "Elevator Shaft — slide down the cable (Lobby)",
        verb: "Climb",
        radius: 1.0,
        target: {
          x: A.lobby_elev.x,
          y: A.lobby_elev.y,
          z: A.lobby_elev.z,
          yaw: PI,
        },
        sound: "door_open",
        onEnter() {
          PF.setFlag("sg_cable_used", true);
          G.notify(
            "You knot a rope to the sheave, wrap your sleeves around the greasy cable and slide thirty-odd floors in the dark. Your palms will remember this.",
          );
          try {
            G.player.damage(4, { type: "fall" });
          } catch (e) {
            /* optional */
          }
        },
      });
      PF.use({
        pos: PF.sg.lobbyElev,
        radius: 1.0,
        range: 2.6,
        priority: 1,
        label: "Elevator Shaft",
        verb: "Climb",
        onInteract() {
          if (!PF.flag("sg_cable_used")) {
            G.notify(
              "The cable hangs out of reach up the dark shaft. Somebody would have to drop a line from above.",
            );
            PF.sfx("ui_error");
            return;
          }
          PF.sfx("door_open");
          G.fadeTransition(() => {
            G.player.teleport(A.machine.x, A.machine.y, A.machine.z, PI);
            G.notify(
              "Hand over hand up your knotted rope. By floor twenty you have opinions about Ernest Flagg.",
            );
          });
        },
      });
      // the lantern ↔ the exterior gallery (140 m above 7th Avenue)
      const gal = SGX.gallery;
      PF.door({
        id: "pws_sg_gallery_out",
        pos: PF.sg.lanternEast,
        label: "Lantern Gallery (outside)",
        verb: "Go out",
        radius: 1.2,
        target: { x: gal.x, y: gal.y, z: gal.z, yaw: 0 },
        sound: "door_open",
      });
      if (SGX.anchors && SGX.anchors.lantern_door) {
        const ld = SGX.anchors.lantern_door;
        PF.door({
          id: "pws_sg_gallery_in",
          pos: V3(ld.x, ld.y, ld.z),
          label: "Singer Lantern",
          verb: "Enter",
          radius: 1.2,
          target: {
            x: A.lantern.x + 0.8,
            y: A.lantern.y,
            z: A.lantern.z,
            yaw: HP,
          },
          sound: "door_open",
        });
      }
      // containers & terminal
      PF.prop("terminal", {
        x: X(56.4),
        y: 0.85,
        z: Z(-6.2),
        yaw: 0,
        terminalId: "pws_sg_foreman",
        mount: "bare",
        id: "pws_sg_term",
      });
      PF.prop("footlocker", {
        x: X(54.5),
        y: 0.05,
        z: Z(6.6),
        yaw: PI,
        loot: "raider_stash",
        id: "pws_sg_stock",
        name: "Stock Room Crate",
      });
      PF.prop("ammo_box", {
        x: X(6.2),
        y: 30.05,
        z: Z(40 - 8.1),
        yaw: 0,
        large: true,
        loot: "ammo_box",
        id: "pws_sg_armory",
      });
      PF.prop("footlocker", {
        x: X(7.6),
        y: 30.05,
        z: Z(40 - 7.8),
        yaw: 0,
        loot: "raider_stash",
        lock: PF.lockSpec("pws_lk_sg_armory"),
        id: "pws_sg_armory2",
        name: "Stitchers Armory Locker",
      });
      PF.scrawlAt(
        P(8.6, 31.2, 40 - 7.8),
        "Scratched into the wall",
        '"ARMORY 5-1-9-0. DONT TELL NEEDLES." Underneath, in different handwriting: "I CAN READ."',
        "pws_lk_sg_armory",
      );
      PF.prop("footlocker", {
        x: X(0.3),
        y: 54.05,
        z: Z(40 + 2.0),
        yaw: PI,
        lock: PF.lockSpec("pws_lk_sg_chest"),
        items: [
          ["pws_bobbin_shears", 1],
          ["ammo_308", 20],
          ["rage", 1],
          ["rally_tonic", 2],
          ["pws_note_bobbin", 1],
        ],
        id: "pws_sg_bobbin_chest",
        name: "Madame Bobbin's Hope Chest",
      });
      PF.prop("workbench", {
        x: X(44),
        y: 0.05,
        z: Z(-6.9),
        yaw: 0,
        id: "pws_sg_bench",
      });
      PF.prop("first_aid", {
        x: X(-13.8),
        y: 1.2,
        z: Z(-3.2),
        yaw: HP,
        id: "pws_sg_aid",
      });
      PF.pickup("pws_great_seal", 1, A.seal);
      PF.pickup("pws_reel_singer", 1, P(-8.6, 1.15, 3.2));
      PF.pickup("pws_note_toll", 1, P(9.2, 0.95, -2.6));
      PF.pickup("sniper_rifle", 1, P(0.9, 54.12, 40.9));
      // loose loot: chems, ammo, thread-and-needle junk, beer
      for (const [id, n, x, y, z] of [
        ["rush", 1, -12.0, 0.1, -1.6],
        ["beer", 2, -11.2, 0.1, 2.9],
        ["ammo_10mm", 18, 9.4, 0.96, -3.1],
        ["duct_tape", 1, 8.6, 0.96, -2.4],
        ["duct_tape", 1, 44.2, 0.9, -2.2],
        ["rage", 1, 56.8, 0.86, -5.8],
        ["rally_tonic", 1, 54.0, 1.2, 7.3],
        ["ammo_308", 10, 6.8, 30.9, 31.9],
        ["bull_tabs", 1, -6.6, 30.1, 43.4],
        ["morphine_syrette", 1, -1.6, 54.1, 41.8],
        ["frag_grenade", 2, 5.2, 30.9, 31.9],
        ["cigarettes", 1, 32.2, 0.1, -4.0],
        ["whiskey", 1, 34.2, 0.1, 5.4],
      ])
        PF.pickup(id, n, P(x, y, z));
      // TRAPS: a grenade-bouquet tripwire across the sweatshop aisle, tin cans on the toll gap, bear traps on the catwalk
      const tRoot = root;
      PF.trap({
        id: "sg_trip1",
        kind: "tripwire",
        parent: tRoot,
        floorY: 0.05,
        a: P(40.4, 0.28, -1.65),
        c: P(40.4, 0.28, 1.65),
        bouquet: P(40.4, 0.28, -1.65),
        dmg: 45,
      });
      PF.trap({
        id: "sg_cans",
        kind: "chime",
        parent: tRoot,
        floorY: 0.05,
        a: P(6.3, 0.35, -1.25),
        c: P(6.3, 0.35, 1.25),
        onTrip() {
          PF.say("pws_sg_thimble", "Company! Somebody's at the toll!", 3);
        },
      });
      PF.trap({
        id: "sg_bear1",
        kind: "beartrap",
        parent: tRoot,
        floorY: DM.y + 6.0,
        pos: P(DM.cx - 4.2, DM.y + 6.0, DM.cz - DM.h + 1.0),
        dmg: 25,
      });
      PF.trap({
        id: "sg_bear2",
        kind: "beartrap",
        parent: tRoot,
        floorY: DM.y + 6.0,
        pos: P(DM.cx - DM.h + 1.0, DM.y + 6.0, DM.cz - 2.5),
        dmg: 25,
      });

      // ---------- hostile named Stitchers (combat also populates the location's spawns) ----------
      const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
      const dead = (id) => () => !PF.flag("dead_" + id);
      const onDeath = (id) => () => PF.setFlag("dead_" + id, true);
      PF.npc({
        id: "pws_sg_bobbin",
        type: "raider",
        name: "Madame Bobbin",
        faction: "raiders",
        hostile: true,
        level: 10,
        pos: pos(A.boss_bobbin),
        yaw: A.boss_bobbin.yaw,
        ai: "guard",
        home: { x: A.boss_bobbin.x, z: A.boss_bobbin.z, r: 1.5 },
        weapon: "sniper_rifle",
        inventory: [
          ["ammo_308", 12],
          ["pws_bobbin_key", 1],
        ],
        loot: "raider_boss",
        gender: "f",
        outfit: "raider_heavy",
        hp: 180,
        dr: 12,
        aggroRange: 40,
        seed: 7401,
        voice: "raider",
        barks: [
          "Nobody touches my collection!",
          "Hold still, I'm measuring you for a shroud!",
          "Snip snip!",
          "You'll look lovely on a dress form.",
        ],
        when: dead("pws_sg_bobbin"),
        onDeath: onDeath("pws_sg_bobbin"),
      });
      PF.npc({
        id: "pws_sg_needles",
        type: "raider",
        name: "Needles",
        faction: "raiders",
        hostile: true,
        level: 7,
        pos: pos(A.foreman),
        yaw: A.foreman.yaw,
        ai: "guard",
        home: { x: A.foreman.x, z: A.foreman.z, r: 3 },
        weapon: "combat_shotgun",
        loot: "raider",
        gender: "m",
        seed: 7402,
        voice: "raider",
        barks: ["Needles, thread, and lead!", "Get back to your sewing!"],
        when: dead("pws_sg_needles"),
        onDeath: onDeath("pws_sg_needles"),
      });
      PF.npc({
        id: "pws_sg_thimble",
        type: "raider",
        name: "Thimble",
        faction: "raiders",
        hostile: true,
        level: 6,
        pos: pos(A.toll),
        yaw: A.toll.yaw,
        ai: "guard",
        home: { x: A.toll.x, z: A.toll.z, r: 3 },
        weapon: "pistol_10mm",
        loot: "raider",
        gender: "f",
        seed: 7403,
        voice: "raider",
        barks: ["Toll's fifty scrip. Or an ear.", "Pay up, stranger!"],
        when: dead("pws_sg_thimble"),
        onDeath: onDeath("pws_sg_thimble"),
      });

      PF.register(
        "singer_building",
        PF.root || null,
        Object.assign({}, SGX.anchors || {}, A, {
          exterior_entrance: (SGX.anchors || {}).entrance,
        }),
        { interiorRoot: root, interiorKey: KEY },
      );
    },
    22,
  );
})();
