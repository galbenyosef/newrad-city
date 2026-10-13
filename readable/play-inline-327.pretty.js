/* src/poi_chelsea/22_nabisco_int.js */
/* =====================================================================
 * NEW RAD CITY — POI CHELSEA — 22_nabisco_int.js
 * NATIONAL BISCUIT COMPANY — BAKERY No. 1 (interior cell
 * 'nabisco_factory', origin 9000,0,0). Giant ants moved in for the sugar.
 *
 * Levels (local y):  NEST 0   (ant tunnels: landing, egg chamber, sugar
 *                             hoard, queen's chamber, exit tunnel)
 *                    FAC 6    (shipping dock ← street door, oven hall,
 *                             packaging hall, mixing room + the breach)
 *                    UP 12    (siding dock ← High Line spur, warehouse,
 *                             plant manager's office, test kitchen)
 * Critical path: dock → oven hall (burner hazard) → packaging lines →
 * mixing room → the breach ramp down into the nest → egg chamber →
 * sugar hoard → the Queen → exit tunnel → ant mound outside (loop).
 * Optional: NE stair up to the warehouse & offices (the Golden Zeppelin,
 * the recipe, terminal) → siding → High Line spur bridge (loop).
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

  const KEY = "nabisco_factory";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const NEST = 0,
    FAC = 6,
    UP = 12,
    ROOF = 17.6;
  const XW = -28,
    XE = 28,
    ZN = -20,
    ZS = 20;

  // ---------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------
  PF.item({
    id: "pch_royal_jelly",
    type: "aid",
    name: "Ant Queen Royal Jelly",
    weight: 0.5,
    value: 150,
    quest: true,
    tags: ["food"],
    effects: { hp: 40, rads: 12, attrs: { grit: 1, reflex: 1 }, duration: 300 },
    sound: "eat",
    desc: 'A fist-sized glob of amber jelly from the Queen\'s brood cell under the Nabisco bakery. Smells like burnt sugar and formic acid. Gina at Webster Hall wants it for something she calls "the Queen Bee".',
  });
  PF.item({
    id: "pch_golden_cake",
    type: "misc",
    name: "The Golden Zeppelin",
    weight: 1,
    value: 450,
    unique: true,
    desc: "The one-billionth Chocolate Zeppelin, dipped in 24-karat gold leaf and mounted on a walnut plinth for the Plant Manager's desk (June 1966). Still technically edible. Please don't.",
  });
  PF.item({
    id: "pch_recipe",
    type: "note",
    name: "Chocolate Zeppelin Master Formula",
    title: "NATIONAL BISCUIT CO. — FORMULA CZ-1 (CONFIDENTIAL)",
    text: 'CHOCOLATE ZEPPELIN — MASTER FORMULA CZ-1, rev. 31\n\nCake: enriched flour, sugar, invert sugar, shortening, egg product, cocoa (Dutch), leavening, salt.\nVanilla filling: sugar, shortening, corn syrup, "Stabilizer 7" (see Civil Defense addendum), vanilla, vanillin.\nCoating: sugar, cocoa, cocoa butter, carnauba wax. Wrap: silver foil, airship fold No. 3.\n\nADDENDUM (Office of Civil Defense contract OCD-C-1966-88, shelter provisioning): increase Stabilizer 7 to 0.4% for 25-year shelf life. Do NOT exceed 0.5% (see incident report 1964-12, "the ants").\n\nShelf life at 0.4%: indefinite.\nInsect attraction at 0.4%: "manageable".',
  });
  PF.note(
    "pch_note_qc",
    "Quality Control Report",
    "QC REPORT — LINE 2 — 19 FEB 1967",
    'Samples pulled: 48. Samples passed: 48.\nSamples still passing when re-tested after 30 days on the loading dock: 48.\nSamples EATEN by ants on the loading dock overnight: 211 (see attached photographs, which are mostly of ants).\n\nThe ants on the dock are getting bigger. I measured one at nine inches. Maintenance says that is "not a thing." Maintenance has not been to the loading dock.\n\n— D. Park, QC',
  );
  PF.tapeReel(
    "pch_reel_foreman",
    'Tape reel: "Night Foreman"',
    "Night Foreman's log — Bakery No. 1",
    "\"Day one. Sunday, 09:30. Sirens. The Sunday skeleton crew ran for the subway. I stayed — somebody has to shut the ovens down or we lose the building.\n\nDay two. Ovens won't shut down. The new automatic burners have a failsafe that keeps them at proving temperature. Proving temperature for WHAT, I asked. Nobody answers the phone.\n\nDay eleven. The ants from the dock came in through the flour chutes. They are the size of dogs. They took the whole Line 2 run in one night. They don't want me. They want the creme.\n\nDay forty. Something under the mixing room floor. I hear it laying. I'm going up to the offices. Mr. Haskell's teletype word is BILLION — he typed it with one finger while I stood there holding his coffee. Maybe it can call somebody. If I can get to the siding I can walk the High Line north. God help me, I'm taking a box of cakes.\"",
    { learn: "pch_lk_nb_term" },
  );
  PF.regLock({
    id: "pch_lk_nb_term",
    label: "Plant Manager's Teletype",
    kind: "terminal",
    passcode: "BILLION",
    hint: "The night foreman's tape reel mentions it.",
  });
  PF.terminal("pch_nb_manager", {
    title: "NATIONAL BISCUIT CO. — PLANT MANAGER",
    header:
      "KESTREL TELETYPE CORP. — MODEL 40 — NBC BAKERY No. 1 / PLANT MANAGEMENT",
    lock: { id: "pch_lk_nb_term", passcode: "BILLION" },
    entries: [
      {
        title: "Production — Week 8, 1967",
        text: 'LINE 1 (Chocolate Zeppelin original): 1,204,800 units\nLINE 2 (Chocolate Zeppelin Midnight Mint): 611,200 units\nLINE 3 (Freedom Flakes breakfast biscuit — pilot, for Brooklyn Sugar Works): HALTED\n\nCivil Defense standing order (shelter provisioning): 40 tons/week, "Stabilizer 7" formula. Shipped via the High Line, reefer NBC 88.',
      },
      {
        title: "Memo: Pest Control",
        text: 'To: Plant Manager\nFrom: Facilities\n\nRe: the dock ants. We have tried: poison (they ate it), traps (they ate them), the exterminator (unclear). Our current recommendation is to "stop leaving Chocolate Zeppelins on the dock". Also, please stop leaving Chocolate Zeppelins on the dock.',
      },
      {
        title: "Memo: The Golden Zeppelin",
        text: "Congratulations to all staff on our ONE BILLIONTH Chocolate Zeppelin! The Golden Zeppelin will be displayed in my office. It is NOT a snack. Whoever took a bite out of the first one — we know it was you, Gary.",
      },
      {
        title: "Civil Defense Addendum OCD-C-1966-88",
        text: "[RESTRICTED — see printed copy in the office safe]",
      },
      {
        title: "Note to Self",
        text: "Office safe: 0-6-0-2-6-6. The day we baked the billionth cake. If I forget THAT date I deserve to be locked out. — H.H.",
        learn: "pch_lk_nb_safe",
      },
    ],
  });

  // ---------------------------------------------------------------
  // Builder
  // ---------------------------------------------------------------
  PF.addBuilder(
    "nabisco_int",
    function () {
      const cell = PF.cell(KEY);
      const root = cell.root;
      const b = PF.batch("nb_int");
      b.ground = 0;
      b.aoH = 2.5;
      // ---------- light plan ----------
      const L = [];
      const light = (x, y, z, color, r, i) =>
        L.push({ x: X(x), y, z: Z(z), color, r, i });
      // factory: oven glow (orange), high windows (cool), emergency tubes
      for (const z of [-5, 5])
        for (const x of [-22, -14, -6])
          light(x, FAC + 1.2, z, 0xff7a30, 7, 0.9);
      for (const x of [-20, -8, 4, 16])
        light(x, FAC + 4.5, 17.5, 0xc0ccd0, 9, 0.55);
      for (const x of [-20, -8, 4, 16])
        light(x, FAC + 4.5, -17.5, 0xc0ccd0, 9, 0.5);
      for (const [x, z] of [
        [10, -4],
        [22, -4],
        [10, 6],
        [22, 6],
        [-6, 15],
      ])
        light(x, FAC + 4.8, z, 0xe0f0ff, 8, 0.5);
      light(0, FAC + 3, -15, 0xffd8a0, 9, 0.4);
      // nest: bioluminescent eggs, resin glow, queen chamber
      for (const [x, z] of [
        [-20, 0],
        [-16, 6],
        [-22, 8],
      ])
        light(x, NEST + 1.0, z, 0x9aff60, 7, 0.8);
      light(-10, NEST + 3, -14, 0xd0a060, 8, 0.45); // breach landing (daylight from above)
      light(0, NEST + 2.2, 4, 0xffb050, 8, 0.6); // sugar hoard (amber)
      light(18, NEST + 2.5, 3, 0xc8ff70, 12, 0.75); // queen chamber
      light(22, NEST + 1.5, 16, 0xa0c070, 6, 0.4); // exit tunnel
      // upper floor: skylights + office lamps
      for (const x of [-20, -8, 4])
        for (const z of [-12, 0, 12])
          light(x, ROOF - 1.5, z, 0xc8d0d0, 11, 0.5);
      light(21, UP + 2.4, -14, 0xffc070, 7, 0.8); // manager
      light(21, UP + 2.4, 0, 0xfff0d0, 7, 0.6); // test kitchen
      light(21, UP + 2.4, 12, 0xffd090, 7, 0.5); // break room
      light(-24, UP + 3, 0, 0xc8d0d0, 8, 0.5); // siding
      b.setLights(L, 0x847c70, 0.2);

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
          surface: (o && o.surface) || "concrete",
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
      // SHELL (brick perimeter FAC..ROOF; the nest below is earth)
      // =====================================================================
      wall("brick_nab", "x", XW, XE, ZN - 0.6, ZN, FAC, ROOF, [
        { c: -20, w: 2.6, y0: FAC + 3.2, h: 2.4 },
        { c: -8, w: 2.6, y0: FAC + 3.2, h: 2.4 },
        { c: 4, w: 2.6, y0: FAC + 3.2, h: 2.4 },
        { c: 16, w: 2.6, y0: FAC + 3.2, h: 2.4 },
      ]);
      wall("brick_nab", "x", XW, XE, ZS, ZS + 0.6, FAC, ROOF, [
        { c: -20, w: 2.6, y0: FAC + 3.2, h: 2.4 },
        { c: -8, w: 2.6, y0: FAC + 3.2, h: 2.4 },
        { c: 4, w: 2.6, y0: FAC + 3.2, h: 2.4 },
        { c: 16, w: 2.6, y0: FAC + 3.2, h: 2.4 },
        { c: -6, w: 2.0, y0: FAC, h: 2.8 },
      ]);
      wall("brick_nab", "z", ZN, ZS, XW - 0.6, XW, FAC, ROOF, [
        { c: 0, w: 5.6, y0: UP, h: 4.6 },
      ]);
      wall("brick_nab", "z", ZN, ZS, XE, XE + 0.6, FAC, ROOF, []);
      // daylight panes in the high windows
      for (const zz of [ZN - 0.35, ZS + 0.35])
        for (const x of [-20, -8, 4, 16]) {
          quad("window_lit", x, FAC + 4.4, zz, 2.6, 2.4, {
            ry: zz < 0 ? 0 : PI,
            noAO: true,
            grime: 0.3,
          });
          PF.glow(
            P(x, FAC + 4.4, zz < 0 ? zz + 0.8 : zz - 0.8),
            0xc8d4d8,
            2.6,
            root,
            { intensity: 0.7 },
          );
        }
      // floors: factory slab (with the breach hole x -14..-2, z -19..-11), upper slab (NE stair hole), roof
      slab("tile_floor", XW, ZN, XE, -19, FAC, 0.5, {});
      slab("tile_floor", XW, -19, -14, -11, FAC, 0.5, {});
      slab("tile_floor", -2, -19, XE, -11, FAC, 0.5, {});
      slab("tile_floor", XW, -11, XE, ZS, FAC, 0.5, {});
      // broken slab edges around the breach: jagged chunks + rebar
      const rB = PF.rng("nb_breach");
      for (let i = 0; i < 14; i++) {
        const t = i / 13;
        const onX = i % 2;
        const x = onX ? -14 + t * 12 : i % 4 < 2 ? -14 : -2,
          z = onX ? (i % 4 < 2 ? -19 : -11) : -19 + t * 8;
        b.rock("concrete", X(x), FAC - 0.3, Z(z), 0.5 + rB() * 0.4, {
          flat: 0.5,
          seed: i + 7,
        });
        b.beam(
          "rust",
          P(x, FAC - 0.3, z),
          P(x + (rB() - 0.5) * 1.2, FAC - 1.3 - rB(), z + (rB() - 0.5) * 1.2),
          0.03,
          0.03,
          {},
        );
      }
      // guard rails of caution tape & sawhorses around the breach (from the foreman), with a gap at the ramp head
      for (const [x0, z0, x1, z1] of [
        [-14.2, -11, -6, -11],
        [-14.2, -19, -14.2, -11],
      ])
        PF.rail(b, X(x0), Z(z0), X(x1), Z(z1), FAC, {
          key: "paint_orange",
          h: 0.9,
        });
      slab("planks", XW, ZN, XE, ZS, UP, 0.4, {
        surface: "wood",
        noCollide: true,
      });
      // upper-floor colliders except the NE stair hole x 21.6..27, z -20..-11.5
      col(XW, UP - 0.4, ZN, 21.6, UP, ZS, { walkable: true, surface: "wood" });
      col(21.6, UP - 0.4, -11.5, XE, UP, ZS, {
        walkable: true,
        surface: "wood",
      });
      slab("tar", XW, ZN, XE, ZS, ROOF + 0.4, 0.4, { noCollide: true });
      // skylights (monitor roof) over the upper floor
      for (const x of [-20, -8, 4])
        for (const z of [-12, 0, 12]) {
          bmm(
            "steel_win",
            x - 3,
            ROOF - 0.05,
            z - 2,
            x + 3,
            ROOF + 0.05,
            z + 2,
            { seg: false },
          );
          quad(
            (x + z) % 3 ? "window_lit" : "glass_broken",
            x,
            ROOF - 0.08,
            z,
            5.6,
            3.6,
            { rx: HP, noAO: true, grime: 0.2 },
          );
          PF.glow(P(x, ROOF - 0.6, z), 0xd0dce0, 3.6, root, {
            intensity: 0.45,
          });
        }
      // columns (cast iron, both floors)
      for (const x of [-20, -10, 0, 10, 20])
        for (const z of [-10, 0, 10]) {
          b.cyl("iron", X(x), FAC, Z(z), 0.22, 0.26, UP - FAC - 0.4, 10, {
            hSeg: 2,
          });
          b.cyl("iron", X(x), UP - 0.9, Z(z), 0.55, 0.25, 0.5, 10, { hSeg: 1 });
          b.cyl("iron", X(x), UP, Z(z), 0.2, 0.22, ROOF - UP, 10, { hSeg: 2 });
          col(x - 0.3, FAC, z - 0.3, x + 0.3, ROOF, z + 0.3);
        }
      // =====================================================================
      // FACTORY FLOOR (y 6)
      // =====================================================================
      // --- partition: shipping dock | halls (z = 12) ---
      wall("plaster_w", "x", XW, XE, 11.8, 12.1, FAC, UP - 0.4, [
        { c: -6, w: 4.2, y0: FAC, h: 3.6 },
        { c: 16, w: 2.4, y0: FAC, h: 2.8 },
        { c: 8, w: 6, y0: FAC + 1.1, h: 1.4 },
      ]);
      // --- shipping dock (z 12..20) ---
      // time clock + card racks by the door
      box("panel", -3.4, FAC + 1.2, 19.75, 0.5, 0.6, 0.25, { seg: false });
      for (const x of [-2.3, -1.6])
        box("rotten", x, FAC + 0.8, 19.8, 0.6, 1.4, 0.1, { seg: false });
      const clockKey = PF.texMat(
        "nb_clock",
        PF.signTex(
          "nb_clock",
          ["PUNCH IN", "EVERY ZEPPELIN IS A PROMISE"],
          "enamel",
          512,
          160,
          { bg: "#7a2a24" },
        ),
        {},
      );
      quad(clockKey, -3.4, FAC + 2.2, 19.72, 1.6, 0.5, { ry: PI, grime: 0.3 });
      // lockers row
      for (let x = 4; x < 12; x += 0.6)
        box("paint_teal", x, FAC, 19.55, 0.56, 1.9, 0.5, {
          seg: false,
          grime: 0.6,
        });
      col(3.7, FAC, 19.3, 11.9, FAC + 1.9, 19.8);
      // foreman's booth (glass box) with desk
      {
        const x0 = 17,
          x1 = 23,
          z0 = 14,
          z1 = 19.5;
        bmm("panel", x0, FAC, z0, x1, FAC + 1.0, z0 + 0.1, { seg: false });
        bmm("panel", x0, FAC, z0, x0 + 0.1, FAC + 1.0, z1, { seg: false });
        quad("glass_broken", (x0 + x1) / 2, FAC + 1.8, z0, x1 - x0, 1.6, {
          ry: 0,
          noAO: true,
          grime: 0.1,
        });
        quad("glass_dark", x0, FAC + 1.8, (z0 + z1) / 2, z1 - z0, 1.6, {
          ry: -HP,
          noAO: true,
          grime: 0.1,
        });
        bmm("panel", x0, FAC + 2.6, z0, x1, FAC + 2.7, z1, { seg: false });
        col(x0, FAC, z0 - 0.05, x1 - 1.4, FAC + 2.6, z0 + 0.1);
        col(x0 - 0.05, FAC, z0, x0 + 0.1, FAC + 2.6, z1);
        solid("oak", 19, FAC, 17.5, 21.5, FAC + 0.78, 18.6, { seg: false });
        PF.dress.monitor(b, X(20.5), FAC + 0.78, Z(18), PI, false);
        PF.dress.papers(b, X(20), FAC, Z(16.4), 1.3, 14, 51);
      }
      // pallets of cartons and a hand truck on the dock
      const fbk = PF.cakeBoxKey();
      const cartonStack = (x, y, z, nx, ny, nz, ry) => {
        const c = Math.cos(ry || 0),
          s = Math.sin(ry || 0);
        box("tie_wood", x, y, z, nx * 0.62 + 0.1, 0.14, nz * 0.46 + 0.1, {
          ry,
          seg: false,
        });
        for (let i = 0; i < nx; i++)
          for (let k = 0; k < nz; k++)
            for (let j = 0; j < ny; j++) {
              if ((i + j * 3 + k * 5) % 7 === 6 && j === ny - 1) continue;
              const lx = (i - (nx - 1) / 2) * 0.62,
                lz = (k - (nz - 1) / 2) * 0.46;
              b.box(
                fbk,
                X(x + lx * c + lz * s),
                y + 0.14 + j * 0.42,
                Z(z - lx * s + lz * c),
                0.6,
                0.4,
                0.44,
                { ry, seg: false, uv: "keep", grime: 0.3 },
              );
            }
        PF.col(
          X(x),
          Z(z),
          nx * 0.62 + 0.1,
          nz * 0.46 + 0.1,
          y,
          y + 0.14 + ny * 0.42,
          ry || 0,
          { walkable: true, surface: "wood" },
        );
      };
      // a keep-uv box needs per-face uvs: BoxGeometry already has them (uv:'keep')
      cartonStack(-14, FAC, 16, 3, 3, 3, 0.1);
      cartonStack(-20, FAC, 17, 3, 2, 3, -0.05);
      cartonStack(8, FAC, 15, 2, 4, 3, 0);
      cartonStack(-24, FAC, 14, 2, 3, 2, 0.3);
      // =====================================================================
      // OVEN HALL (x -28..2, z -10..12): two tunnel ovens with belts
      // =====================================================================
      const OV = [
        { z: -5, lit: true },
        { z: 5, lit: true },
      ];
      PF.nb = PF.nb || {};
      PF.nb.burners = [];
      for (const ov of OV) {
        const x0 = -26,
          x1 = -2,
          z = ov.z;
        // insulated brick body with steel skin at the ends
        solid(
          "brick_nab_dk",
          x0 + 2,
          FAC,
          z - 1.6,
          x1 - 2,
          FAC + 2.7,
          z + 1.6,
          { segLen: 4 },
        );
        bmm(
          "oven_door",
          x0 + 2,
          FAC + 2.7,
          z - 1.7,
          x1 - 2,
          FAC + 2.9,
          z + 1.7,
          { seg: false },
        );
        // flue hoods & stacks to the ceiling
        for (const x of [x0 + 6, (x0 + x1) / 2, x1 - 6]) {
          b.cyl("oven_door", X(x), FAC + 2.9, Z(z), 0.9, 1.3, 0.8, 8, {
            hSeg: 1,
          });
          b.cyl("steel", X(x), FAC + 3.7, Z(z), 0.35, 0.35, UP - FAC - 4.1, 8, {
            hSeg: 2,
          });
        }
        // inspection doors with glowing windows along both sides
        for (let x = x0 + 3.5; x < x1 - 2.5; x += 3)
          for (const sz of [-1, 1]) {
            box("oven_door", x, FAC + 0.8, z + sz * 1.65, 1.2, 1.0, 0.08, {
              seg: false,
            });
            quad("oven_glow", x, FAC + 1.3, z + sz * 1.7, 0.6, 0.25, {
              ry: sz > 0 ? 0 : PI,
              noAO: true,
              grime: 0.3,
            });
            box(
              "chrome",
              x + 0.45,
              FAC + 1.05,
              z + sz * 1.72,
              0.08,
              0.3,
              0.05,
              { seg: false },
            );
          }
        // belts in/out of each mouth (conveyor frame + dark belt + rollers)
        for (const [a, c] of [
          [x0, x0 + 2],
          [x1 - 2, x1 + 1.5],
        ]) {
          bmm("steel", a, FAC + 0.8, z - 0.8, c, FAC + 0.95, z + 0.8, {
            seg: false,
          });
          bmm("belt", a, FAC + 0.95, z - 0.7, c, FAC + 1.0, z + 0.7, {
            seg: false,
          });
          for (const sz of [-0.75, 0.75])
            for (let x = a + 0.2; x < c; x += 1)
              box("steel", x, FAC, z + sz, 0.08, 0.8, 0.08, { seg: false });
          // trays of cakes on the belt
          for (let x = a + 0.3; x < c - 0.2; x += 0.55)
            box(
              ov.z < 0 ? "cake" : "cake_pink",
              x,
              FAC + 1.0,
              z,
              0.4,
              0.07,
              0.8,
              { seg: false, grime: 0.3 },
            );
        }
        // oven mouths glow
        for (const x of [x0 + 2, x1 - 2]) {
          quad(
            "oven_glow",
            x + (x < -14 ? -0.02 : 0.02),
            FAC + 1.35,
            z,
            2.4,
            0.6,
            { ry: x < -14 ? -HP : HP, noAO: true, grime: 0.2 },
          );
          PF.glow(
            P(x + (x < -14 ? -0.3 : 0.3), FAC + 1.35, z),
            0xff7020,
            1.6,
            root,
            { intensity: 1.2, flicker: 0.3 },
          );
        }
        const nk = PF.texMat(
          "nb_oven" + z,
          PF.signTex(
            "nb_oven" + z,
            ["BAND OVEN No. " + (z < 0 ? 1 : 2), "GAS BURNERS — HOT"],
            "enamel",
            512,
            160,
            { bg: "#3a3a3a", fg: "#f0c040" },
          ),
          {},
        );
        quad(
          nk,
          (x0 + x1) / 2,
          FAC + 2.3,
          z + (z < 0 ? -1.62 : 1.62),
          2.8,
          0.85,
          { ry: z < 0 ? PI : 0, grime: 0.3 },
        );
        // burner vents (hazard): three per oven on the aisle side
        for (const x of [-20, -14, -8])
          PF.nb.burners.push({
            p: P(x, FAC + 0.05, z + (z < 0 ? 2.1 : -2.1)),
            phase: (x + z) * 0.37,
          });
      }
      // cooling racks (tall wheeled racks with trays) & flour sacks in the aisle
      for (const [x, z] of [
        [-24, 0],
        [-20, 0.4],
        [-16, -0.3],
        [-4, 0.2],
      ]) {
        for (const [dx, dz] of [
          [-0.45, -0.3],
          [0.45, -0.3],
          [-0.45, 0.3],
          [0.45, 0.3],
        ])
          box("steel", x + dx, FAC, z + dz, 0.05, 1.9, 0.05, { seg: false });
        for (let k = 0; k < 7; k++) {
          box("steel", x, FAC + 0.2 + k * 0.26, z, 0.95, 0.03, 0.66, {
            seg: false,
          });
          if (k % 2 === 0)
            box(
              k % 4 ? "cake" : "cake_pink",
              x,
              FAC + 0.23 + k * 0.26,
              z,
              0.8,
              0.06,
              0.5,
              { seg: false },
            );
        }
        col(x - 0.5, FAC, z - 0.35, x + 0.5, FAC + 1.9, z + 0.35);
      }
      for (let i = 0; i < 16; i++) {
        const x = -27 + (i % 4) * 0.7,
          z = -9 + Math.floor(i / 4) * 0.5 + (i % 2) * 0.1;
        box("flour", x, FAC + (i >= 8 ? 0.35 : 0), z, 0.65, 0.35, 0.45, {
          ry: (i % 3) * 0.2,
          seg: false,
          grime: 0.4,
        });
      }
      col(-27.4, FAC, -9.3, -24.4, FAC + 0.7, -7.2);
      // =====================================================================
      // PACKAGING HALL (x 2..28, z -10..12): serpentine conveyors of Chocolate Zeppelins
      // =====================================================================
      const lines = [
        { z: -6, x0: 3, x1: 26 },
        { z: 0, x0: 5, x1: 26 },
        { z: 6, x0: 3, x1: 24 },
      ];
      for (const ln of lines) {
        bmm(
          "steel",
          ln.x0,
          FAC + 0.8,
          ln.z - 0.55,
          ln.x1,
          FAC + 0.95,
          ln.z + 0.55,
          { seg: false },
        );
        bmm(
          "belt",
          ln.x0,
          FAC + 0.95,
          ln.z - 0.45,
          ln.x1,
          FAC + 1.0,
          ln.z + 0.45,
          { seg: false },
        );
        col(ln.x0, FAC, ln.z - 0.55, ln.x1, FAC + 1.05, ln.z + 0.55);
        for (let x = ln.x0 + 0.3; x < ln.x1; x += 1.4)
          for (const sz of [-0.5, 0.5])
            box("steel", x, FAC, ln.z + sz, 0.07, 0.8, 0.07, { seg: false });
        // wrapped cakes marching along (pairs of little cakes = Chocolate Zeppelin twin-pack)
        for (let x = ln.x0 + 0.3; x < ln.x1 - 0.3; x += 0.34) {
          if (((x * 13) | 0) % 9 === 0) continue;
          box("cake_cream", x, FAC + 1.0, ln.z - 0.12, 0.26, 0.09, 0.18, {
            seg: false,
            grime: 0.15,
          });
          box(
            ln.z === 0 ? "cake_pink" : "cake",
            x,
            FAC + 1.09,
            ln.z - 0.12,
            0.25,
            0.03,
            0.17,
            { seg: false, grime: 0.1 },
          );
          box("cake_cream", x, FAC + 1.0, ln.z + 0.12, 0.26, 0.09, 0.18, {
            seg: false,
            grime: 0.15,
          });
        }
        // wrapping machine straddling each line
        const wx = (ln.x0 + ln.x1) / 2 + 3;
        solid(
          "enamel_blue",
          wx - 1.2,
          FAC,
          ln.z - 1.2,
          wx + 1.2,
          FAC + 2.2,
          ln.z - 0.56,
          { seg: false },
        );
        solid(
          "enamel_blue",
          wx - 1.2,
          FAC,
          ln.z + 0.56,
          wx + 1.2,
          FAC + 2.2,
          ln.z + 1.2,
          { seg: false },
        );
        bmm(
          "enamel_blue",
          wx - 1.2,
          FAC + 1.6,
          ln.z - 1.2,
          wx + 1.2,
          FAC + 2.4,
          ln.z + 1.2,
          { seg: false },
        );
        bmm(
          "chrome",
          wx - 0.6,
          FAC + 2.4,
          ln.z - 0.3,
          wx + 0.6,
          FAC + 3.0,
          ln.z + 0.3,
          { seg: false },
        );
        quad("screen", wx - 1.21, FAC + 1.9, ln.z - 0.9, 0.4, 0.3, {
          ry: -HP,
          noAO: true,
        });
        // carton at the end of the line
        cartonStack(ln.x1 + 1.0, FAC, ln.z, 1, 2, 2, 0);
      }
      const qcKey = PF.texMat(
        "nb_qc",
        PF.signTex(
          "nb_qc",
          ["LINE 2 — QUALITY CONTROL", "DAYS WITHOUT AN ANT INCIDENT: 0"],
          "enamel",
          512,
          160,
          { bg: "#1e3a2a" },
        ),
        {},
      );
      quad(qcKey, 14, FAC + 3.4, 11.75, 3.4, 1.06, { ry: PI, grime: 0.3 });
      solid("oak", 12.5, FAC, 9, 15.5, FAC + 0.8, 10.2, { seg: false });
      PF.dress.papers(b, X(14), FAC + 0.8, Z(9.6), 0.8, 8, 33);
      // =====================================================================
      // MIXING ROOM (z -20..-10): mixers, silo chutes, the NE stair up
      // =====================================================================
      wall("plaster_w", "x", XW, XE, -10.2, -9.9, FAC, UP - 0.4, [
        { c: -22, w: 3.4, y0: FAC, h: 3.4 },
        { c: 0, w: 4.0, y0: FAC, h: 3.4 },
        { c: 16, w: 3.4, y0: FAC, h: 3.4 },
      ]);
      for (const [x, z] of [
        [-24, -15],
        [2, -15.5],
        [12, -15],
      ]) {
        b.cyl("chrome", X(x), FAC + 0.9, Z(z), 1.6, 1.4, 2.6, 20, {
          hSeg: 2,
          grime: 0.35,
        });
        b.cyl("chrome", X(x), FAC + 3.5, Z(z), 1.3, 1.62, 0.4, 20, { hSeg: 1 });
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * TAU + 0.4;
          b.beam(
            "steel",
            P(x + Math.cos(a) * 1.4, FAC, z + Math.sin(a) * 1.4),
            P(x + Math.cos(a) * 1.45, FAC + 1.2, z + Math.sin(a) * 1.45),
            0.14,
            0.14,
            {},
          );
        }
        box("enamel_blue", x, FAC + 3.9, z, 1.0, 0.9, 1.0, { seg: false }); // mixer motor
        b.cyl("steel", X(x), FAC + 4.8, Z(z), 0.18, 0.18, UP - FAC - 5.2, 8, {
          hSeg: 1,
        }); // flour chute to the silos above
        b.sphere("flour", X(x), FAC + 3.52, Z(z), 1.2, {
          sy: 0.25,
          ws: 12,
          hs: 4,
          grime: 0.2,
        }); // dough/flour inside
        col(x - 1.6, FAC, z - 1.6, x + 1.6, FAC + 3.9, z + 1.6);
      }
      const mixKey = PF.texMat(
        "nb_mix",
        PF.signTex(
          "nb_mix",
          ["MIXING ROOM", "HAIRNETS REQUIRED"],
          "enamel",
          512,
          160,
          { bg: "#2a3a4a" },
        ),
        {},
      );
      quad(mixKey, 0, FAC + 3.9, -10.25, 2.4, 0.75, { ry: PI, grime: 0.3 });
      // NE stair: factory → upper floor (x 22..27, climbing north from z -11.5 to -19.7)
      PF.steelStair(b, X(24.3), Z(-11.8), PI, 2.6, 20 * 0.33, FAC, UP, {
        key: "steel",
        railKey: "iron",
      });
      slab("diamond", 21.6, ZN, XE, -18.4, UP, 0.2, { surface: "metal" });
      PF.rail(b, X(21.6), Z(-18.4), X(21.6), Z(-11.5), UP, { key: "iron" });
      PF.rail(b, X(21.6), Z(-11.5), X(XE), Z(-11.5), UP, { key: "iron" });
      // ramp: from the breach edge at the east side (x -2) down to the nest landing (west)
      const RAMP = { x0: -2.5, x1: -17, z: -15 };
      {
        const n = 20,
          run = (RAMP.x0 - RAMP.x1) / n;
        for (let i = 0; i < n; i++) {
          const top = FAC - (i + 1) * (FAC / n) + 0.02;
          const x = RAMP.x0 - (i + 0.5) * run;
          b.rock(
            i % 3 ? "rubble" : "nest",
            X(x),
            top - 0.55,
            Z(RAMP.z + (((i * 7) % 5) - 2) * 0.12),
            0.95,
            {
              sx: 0.85,
              sz: 1.9,
              flat: 0.55,
              detail: 0,
              seed: 400 + i,
              ry: 0.001,
            },
          );
          PF.col(X(x), Z(RAMP.z), run + 0.04, 3.0, top - 1.0, top, 0, {
            surface: "dirt",
          });
        }
        // the first step from the factory floor: a slab chunk bridging the edge
        bmm(
          "concrete",
          -2.6,
          FAC - 0.35,
          RAMP.z - 1.4,
          -1.9,
          FAC,
          RAMP.z + 1.4,
          { seg: false },
        );
      }

      // =====================================================================
      // NEST (y 0): earth chambers under the bakery
      // =====================================================================
      slab("nest", XW, ZN, XE, ZS, NEST + 0.02, 0.3, { surface: "dirt" });
      // underside of the factory slab: dark concrete with roots/resin drips
      bmm("concrete_dark", XW, FAC - 0.55, ZN, XE, FAC - 0.5, ZS, {
        segLen: 8,
      });
      const rN = PF.rng("nest");
      for (let i = 0; i < 60; i++) {
        const x = XW + 1 + rN() * 54,
          z = ZN + 1 + rN() * 38;
        if (x > -14 && x < -2 && z > -19 && z < -11) continue;
        b.beam(
          rN() < 0.5 ? "resin" : "nest_dk",
          P(x, FAC - 0.55, z),
          P(
            x + (rN() - 0.5) * 0.3,
            FAC - 1.2 - rN() * 2.2,
            z + (rN() - 0.5) * 0.3,
          ),
          0.08,
          0.05,
          { noAO: true },
        );
      }
      // chamber walls: blobby earth rings; chambers are unions of ellipses
      const chambers = [
        { x: -10.5, z: -15, rx: 9.5, rz: 5 }, // breach landing
        { x: -19, z: 3, rx: 7.5, rz: 7.5 }, // egg chamber
        { x: -2, z: 5, rx: 6, rz: 6 }, // sugar hoard
        { x: 16, z: 2, rx: 9, rz: 9.5 }, // queen's chamber
        { x: 23, z: 16, rx: 3.5, rz: 4 }, // exit tunnel end
      ];
      const tunnels = [
        [-12, -10, -17, -3.5, 3.2],
        [-12.5, 3, -7.5, 4.5, 3.0],
        [3.5, 5, 7.5, 3, 3.2],
        [20, 10.5, 23, 13, 3.0],
      ];
      const inside = (x, z) => {
        for (const c of chambers) {
          const dx = (x - c.x) / c.rx,
            dz = (z - c.z) / c.rz;
          if (dx * dx + dz * dz < 1) return true;
        }
        for (const t of tunnels) {
          const d = G.LAYOUT.distToSeg(x, z, t[0], t[1], t[2], t[3]);
          if (d < t[4] / 2) return true;
        }
        return false;
      };
      PF.nb.nestInside = inside;
      // fill solid earth where not inside (coarse grid of blobs + colliders)
      const step = 1.5;
      for (let z = ZN + step / 2; z < ZS; z += step) {
        let run = null;
        for (let x = XW + step / 2; x < XE + step; x += step) {
          const solidCell = x < XE && !inside(x, z);
          if (solidCell && run === null) run = x;
          if ((!solidCell || x >= XE) && run !== null) {
            col(
              run - step / 2,
              NEST,
              z - step / 2,
              x - step / 2,
              FAC - 0.5,
              z + step / 2,
            );
            run = null;
          }
          if (!solidCell || x >= XE) continue;
          // only draw blobs that border a cavity (cheap)
          let border = false;
          for (const [dx, dz] of [
            [step, 0],
            [-step, 0],
            [0, step],
            [0, -step],
            [step, step],
            [-step, -step],
            [step, -step],
            [-step, step],
          ])
            if (inside(x + dx, z + dz)) {
              border = true;
              break;
            }
          if (!border) continue;
          b.rock(rN() < 0.7 ? "nest" : "nest_dk", X(x), 2.6, Z(z), 1.3, {
            sx: 1.05,
            sy: 2.6,
            sz: 1.05,
            rough: 0.55,
            detail: 1,
            seed: (x * 31 + z * 7) | 0,
          });
        }
      }
      // floor lumps and resin pillars
      for (let i = 0; i < 40; i++) {
        const x = XW + 2 + rN() * 52,
          z = ZN + 2 + rN() * 36;
        if (!inside(x, z)) continue;
        b.rock("nest", X(x), -0.25, Z(z), 0.5 + rN() * 0.7, {
          flat: 0.35,
          detail: 0,
          seed: 700 + i,
        });
      }
      for (const [x, z] of [
        [-17, 0],
        [-21, 6],
        [12, -3],
        [20, 6],
        [14, 8],
        [-4, 1],
      ]) {
        b.cyl("resin", X(x), 0, Z(z), 0.45, 0.8, FAC - 0.5, 8, {
          hSeg: 3,
          deform: undefined,
        });
        col(x - 0.6, 0, z - 0.6, x + 0.6, FAC, z + 0.6);
      }
      // egg chamber: clutches of glowing eggs in resin cups
      for (let i = 0; i < 46; i++) {
        const a = rN() * TAU,
          d = Math.sqrt(rN()) * 6;
        const x = -19 + Math.cos(a) * d,
          z = 3 + Math.sin(a) * d;
        if (!inside(x, z)) continue;
        b.sphere("ant_egg", X(x), 0.28, Z(z), 0.22 + rN() * 0.1, {
          sy: 1.5,
          ws: 7,
          hs: 5,
          grime: 0.1,
        });
        if (i % 4 === 0)
          b.cyl("resin", X(x), 0, Z(z), 0.4, 0.3, 0.2, 8, { hSeg: 1 });
      }
      for (const [x, z] of [
        [-20, 0],
        [-16, 6],
        [-22, 8],
        [-18, 3],
      ])
        PF.glow(P(x, 0.5, z), 0xa0ff60, 1.6, root, { intensity: 0.9 });
      // sugar hoard: heaps of cakes, torn cartons, a resin-glued skeleton of a worker
      for (let i = 0; i < 160; i++) {
        const a = rN() * TAU,
          d = Math.pow(rN(), 0.7) * 4.2;
        const x = -2 + Math.cos(a) * d,
          z = 5 + Math.sin(a) * d;
        const h = Math.max(0, 1.4 - d * 0.32) * rN();
        box(
          i % 3 ? "cake" : i % 2 ? "cake_pink" : "cake_cream",
          x,
          h,
          z,
          0.26,
          0.1,
          0.18,
          { ry: rN() * 3, rx: (rN() - 0.5) * 0.8, seg: false, grime: 0.3 },
        );
      }
      b.rock("cake", X(-2), -0.4, Z(5), 2.2, {
        flat: 0.45,
        detail: 1,
        seed: 71,
      });
      for (let i = 0; i < 6; i++)
        b.box(fbk, X(-5 + rN() * 6), 0.2, Z(2 + rN() * 6), 0.6, 0.4, 0.44, {
          ry: rN() * 3,
          rx: rN() - 0.5,
          seg: false,
          uv: "keep",
        });
      col(-4.2, 0, 2.8, 0.2, 1.2, 7.2);
      PF.skeleton(b, X(1.5), 0.3, Z(9), 2.6);
      b.sphere("resin", X(1.5), 0.3, Z(9), 0.9, { sy: 0.4, ws: 8, hs: 5 });
      PF.glow(P(-2, 1.5, 5), 0xffb050, 2.2, root, { intensity: 0.7 });
      // queen's chamber: resin-coated walls, brood cells, the royal cell, bones of the foolish
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * TAU;
        b.rock(
          "resin",
          X(16 + Math.cos(a) * 8.4),
          1.5 + (i % 3) * 0.8,
          Z(2 + Math.sin(a) * 8.9),
          1.1,
          { sy: 1.8, flat: 1, rough: 0.4, detail: 1, seed: 800 + i },
        );
      }
      for (let i = 0; i < 24; i++) {
        const a = rN() * TAU,
          d = 4 + rN() * 3.5;
        const x = 16 + Math.cos(a) * d,
          z = 2 + Math.sin(a) * d;
        if (!inside(x, z)) continue;
        b.sphere("ant_egg", X(x), 0.3, Z(z), 0.3 + rN() * 0.12, {
          sy: 1.5,
          ws: 7,
          hs: 5,
        });
      }
      // the royal cell (a waxy dome on the chamber's north side) — holds the jelly container
      b.sphere("resin", X(19), 0, Z(-5.5), 1.6, {
        sy: 0.9,
        ws: 12,
        hs: 8,
        phiLen: PI / 2,
      });
      b.sphere("ant_egg", X(19), 0.7, Z(-4.4), 0.45, { sy: 0.8, ws: 8, hs: 6 });
      PF.glow(P(19, 1.0, -4.2), 0xffd060, 1.6, root, {
        intensity: 1.0,
        flicker: 0.1,
      });
      for (let i = 0; i < 5; i++)
        PF.skeleton(b, X(12 + rN() * 8), 0.05, Z(6 + rN() * 3), rN() * TAU);
      PF.glow(P(16, 3.5, 2), 0xc8ff70, 5, root, { intensity: 0.5 });
      // exit tunnel: rises gently to the door (flat floor; door at the end)
      PF.glow(P(24, 1.2, 18.5), 0xd0d8c0, 2.2, root, { intensity: 0.6 });

      // =====================================================================
      // UPPER FLOOR (y 12): siding dock, warehouse racks, offices
      // =====================================================================
      // siding dock (west): rails + bumper, flour sacks, receiving desk
      for (let x = XW + 0.3; x < -18; x += 0.62)
        box("tie_wood", x, UP, 0, 0.22, 0.16, 2.5, { seg: false });
      for (const sz of [-0.72, 0.72])
        bmm("rail", XW, UP + 0.16, sz - 0.04, -18, UP + 0.32, sz + 0.04, {
          seg: false,
        });
      solid("rust", -18.2, UP, -1.3, -17.2, UP + 1.2, 1.3, { seg: false });
      box("paint_red", -17.7, UP + 1.2, 0, 1.0, 0.2, 2.6, { seg: false });
      for (let i = 0; i < 12; i++)
        box(
          "flour",
          -26 + (i % 3) * 0.7,
          UP + (i > 5 ? 0.35 : 0),
          4 + (i % 6 > 2 ? 0.5 : 0) + Math.floor(i / 6) * 0.1,
          0.65,
          0.35,
          0.45,
          { ry: (i % 4) * 0.15, seg: false },
        );
      col(-26.4, UP, 3.7, -24.2, UP + 0.7, 5.2);
      solid("oak", -24, UP, -5, -21, UP + 1.05, -4.2, { seg: false });
      const sidingKey = PF.texMat(
        "nb_recv",
        PF.signTex(
          "nb_recv",
          ["RECEIVING — HIGH LINE SIDING", "CHECK ALL WAYBILLS"],
          "enamel",
          512,
          160,
          { bg: "#6a2420" },
        ),
        {},
      );
      quad(sidingKey, XW + 0.05, UP + 3.4, -4, 2.8, 0.88, {
        ry: HP,
        grime: 0.3,
      });
      // warehouse: pallet racks (steel uprights + beams) loaded with carton stacks
      for (const z of [-15, -7, 7, 15]) {
        const x0 = -14,
          x1 = 12;
        for (let x = x0; x <= x1; x += 2.6)
          for (const sz of [-0.6, 0.6])
            box("boxcar_yel", x, UP, z + sz, 0.1, 4.2, 0.1, { seg: false });
        for (const y of [UP + 1.4, UP + 2.8])
          for (const sz of [-0.6, 0.6])
            bmm(
              "paint_orange",
              x0,
              y - 0.1,
              z + sz - 0.05,
              x1,
              y,
              z + sz + 0.05,
              { seg: false },
            );
        for (const y of [UP + 1.4, UP + 2.8])
          bmm("tie_wood", x0, y, z - 0.6, x1, y + 0.05, z + 0.6, {
            seg: false,
          });
        for (let x = x0 + 1.3; x < x1; x += 2.6)
          for (const y of [UP, UP + 1.45, UP + 2.85]) {
            if (((x * 3 + y + z) | 0) % 5 === 0) continue;
            for (let k = 0; k < 2; k++)
              for (let j = 0; j < 2; j++)
                b.box(
                  fbk,
                  X(x - 0.4 + k * 0.8),
                  y + 0.02 + j * 0.42,
                  Z(z),
                  0.72,
                  0.4,
                  1.0,
                  { seg: false, uv: "keep", grime: 0.3 },
                );
          }
        col(x0 - 0.1, UP, z - 0.7, x1 + 0.1, UP + 4.2, z + 0.7);
      }
      // a toppled rack spilling boxes
      for (let i = 0; i < 10; i++)
        b.box(
          fbk,
          X(-6 + i * 0.7),
          UP + 0.2,
          Z(2 + (i % 3) * 0.6),
          0.72,
          0.4,
          1.0,
          { ry: i * 0.5, rx: 0.3, seg: false, uv: "keep" },
        );
      // offices (east strip x 14..28): manager | test kitchen | break room
      wall("plaster_w", "z", ZN, ZS, 14, 14.25, UP, ROOF, [
        { c: -14, w: 1.2, y0: UP, h: 2.3 },
        { c: 0, w: 1.2, y0: UP, h: 2.3 },
        { c: 12, w: 1.2, y0: UP, h: 2.3 },
        { c: -8.5, w: 3, y0: UP + 1.1, h: 1.3 },
        { c: 5, w: 3, y0: UP + 1.1, h: 1.3 },
      ]);
      wall("plaster_w", "x", 14, XE, -6, -5.75, UP, ROOF, []);
      wall("plaster_w", "x", 14, XE, 6, 6.25, UP, ROOF, []);
      wall("wallpaper_g", "x", 14.25, 21.3, -11.5, -11.25, UP, ROOF, [
        { c: 20, w: 1.2, y0: UP, h: 2.3 },
      ]); // manager's office separated from the stair landing
      // manager's office (z -11..-6): desk with the Golden Zeppelin, safe, portrait, carpet
      bmm("carpet", 14.3, UP + 0.01, -11.2, 21.3, UP + 0.03, -6, {
        seg: false,
        noAO: true,
      });
      solid("mahogany", 17.5, UP, -9.6, 20.5, UP + 0.8, -8.4, { seg: false });
      b.box("mahogany", X(19.3), UP + 0.8, Z(-9.0), 0.4, 0.12, 0.3, {
        seg: false,
      });
      b.box("goldbar", X(19.3), UP + 0.92, Z(-9.0), 0.28, 0.1, 0.17, {
        seg: false,
      });
      PF.dress.chair(b, X(19), UP, Z(-10.4), 0, false, "mahogany");
      PF.dress.painting(b, 5, X(14.4), UP + 2.1, Z(-8.5), 1.4, 1.0, HP);
      const awardKey = PF.texMat(
        "nb_award",
        PF.signTex(
          "nb_award",
          ["ONE BILLION ZEPPELINS", "JUNE 2, 1966"],
          "bronze",
          512,
          160,
        ),
        {},
      );
      quad(awardKey, 17.6, UP + 2.0, -6.3, 1.6, 0.5, { ry: PI, grime: 0.2 });
      b.box("lamp_warm", X(17.9), UP + 0.8, Z(-9.2), 0.22, 0.3, 0.22, {
        seg: false,
      });
      PF.glow(P(17.9, UP + 1.25, -9.2), 0xffc070, 1.1, root, {
        intensity: 1.0,
      });
      // test kitchen (z -6..6): stoves, stainless counters, the prototype cake under a glass dome
      for (const z of [-4.5, -1.5]) {
        solid("chrome", 24.5, UP, z - 0.7, 27.6, UP + 0.9, z + 0.7, {
          seg: false,
        });
        for (const dx of [-0.6, 0.6])
          b.cyl("iron", X(26 + dx), UP + 0.9, Z(z), 0.2, 0.2, 0.04, 10, {
            hSeg: 1,
          });
      }
      solid("chrome", 17, UP, 1.5, 21, UP + 0.9, 3, { seg: false });
      b.cyl("cake_pink", X(19), UP + 0.9, Z(2.2), 0.35, 0.38, 0.25, 16, {
        hSeg: 1,
      });
      b.cyl("cake_cream", X(19), UP + 1.15, Z(2.2), 0.3, 0.35, 0.12, 16, {
        hSeg: 1,
      });
      b.sphere("glass_dark", X(19), UP + 0.9, Z(2.2), 0.5, {
        phiLen: PI / 2,
        ws: 12,
        hs: 6,
      });
      const protoKey = PF.texMat(
        "nb_proto",
        PF.signTex(
          "nb_proto",
          ['PROTOTYPE "ZEPPELIN KING SIZE"', "DO NOT EAT — 1967"],
          "enamel",
          512,
          128,
          { bg: "#e8dcc0", fg: "#6a2a2a" },
        ),
        {},
      );
      quad(protoKey, 19, UP + 0.95, 3.02, 1.2, 0.3, { ry: 0, grime: 0.2 });
      // break room (z 6..20): tables, Fizzo machine, notice board
      for (const [x, z] of [
        [18, 10],
        [22, 14],
        [18, 17],
      ]) {
        solid("planks", x - 1, UP, z - 0.6, x + 1, UP + 0.78, z + 0.6, {
          seg: false,
        });
        PF.dress.chair(b, X(x), UP, Z(z - 1.1), 0, (x + z) % 3 === 0);
        PF.dress.chair(b, X(x), UP, Z(z + 1.1), PI);
      }
      const boardKey = PF.texMat(
        "nb_board",
        PF.signTex(
          "nb_board",
          [
            "BREAK ROOM",
            "Softball Sat. — Nabisco vs. Sanitation",
            "NO TAKING CAKES HOME. GARY.",
          ],
          "enamel",
          512,
          256,
          { bg: "#5a4a30", fg: "#f0e8d0" },
        ),
        {},
      );
      quad(boardKey, 27.9, UP + 1.9, 13, 2.4, 1.2, { ry: -HP, grime: 0.3 });
      PF.skeleton(b, X(22), UP + 0.02, Z(17.2), 0.8); // the night foreman, box of cakes beside him
      b.box(fbk, X(22.9), UP, Z(16.5), 0.6, 0.4, 0.44, {
        ry: 0.4,
        seg: false,
        uv: "keep",
      });

      bmm("panel", -7, FAC, 20.02, -5, FAC + 2.8, 20.2, {
        seg: false,
        grime: 0.8,
      });
      PF.flushGlows(root);
      b.build(root, { lodDistInt: 400 });
      PF.fires.splice(0);

      // ---------- burner jets (animated hazard) ----------
      const jets = [];
      const jetGeo = new THREE.ConeGeometry(0.28, 1.6, 8, 1, true);
      jetGeo.translate(0, 0.8, 0);
      for (const bn of PF.nb.burners) {
        const m = PF.mesh("oven_glow", jetGeo.clone());
        m.position.copy(bn.p);
        root.add(m);
        const g = PF.glow(
          bn.p.clone().setY(bn.p.y + 0.6),
          0xff7a20,
          1.4,
          root,
          { intensity: 1.3, flicker: 0.5 },
        );
        // the grille plate
        jets.push({ m, bn, g, on: false });
      }
      PF.nb.jets = jets;
      let hurtT = 0;
      PF.animate(P(-14, FAC, 0), 60, (t, dt) => {
        for (const j of jets) {
          const cyc = (t * 0.33 + j.bn.phase) % 1; // ~3 s cycle, on for 35%
          const on = cyc < 0.35;
          j.on = on;
          const s = on ? 0.9 + Math.sin(t * 40 + j.bn.phase) * 0.1 : 0.12;
          j.m.scale.set(on ? 1 : 0.5, s, on ? 1 : 0.5);
          if (j.g && j.g.sprite && j.g.sprite.setIntensity)
            j.g.sprite.setIntensity(on ? 1.6 : 0.3);
        }
      });
      PF.updaters.push((dt) => {
        if (!PF.inCell(KEY)) return;
        hurtT -= dt;
        if (hurtT > 0) return;
        const p = G.player.pos;
        for (const j of jets) {
          if (!j.on) continue;
          const dx = p.x - j.bn.p.x,
            dz = p.z - j.bn.p.z,
            dy = p.y - FAC;
          if (dx * dx + dz * dz < 0.8 && Math.abs(dy) < 1.5) {
            hurtT = 0.4;
            try {
              G.player.damage(6, { type: "fire" });
            } catch (e) {
              /* core */
            }
            PF.sfx("hurt_player");
            break;
          }
        }
        // actors (ants!) burn too
        if (PF.live("actors"))
          for (const j of jets) {
            if (!j.on) continue;
            const near =
              PF.safe("inR", () => G.actors.inRadius(j.bn.p, 0.9)) || [];
            for (const a of near)
              if (a && !a.dead && a.damage)
                PF.safe("burn", () => a.damage(4, { type: "fire" }));
          }
      });
      // decorative placard at each burner
      const ventSign = PF.texMat(
        "nb_vent",
        PF.signTex("nb_vent", ["CAUTION", "BURNER VENT"], "enamel", 256, 128, {
          bg: "#c8a020",
          fg: "#1a1a1a",
        }),
        {},
      );
      const signB = PF.batch("nb_int_signs");
      for (const bn of PF.nb.burners) {
        const sg = bn.p.z < OZ ? 1 : -1;
        signB.quad(ventSign, bn.p.x, FAC + 2.0, bn.p.z - sg * 0.47, 0.6, 0.3, {
          ry: sg > 0 ? 0 : PI,
          grime: 0.3,
        });
        signB.box("iron", bn.p.x, FAC, bn.p.z, 0.7, 0.06, 0.7, { seg: false });
      }
      signB.build(root, { noLOD: true });

      // =====================================================================
      // anchors, doors, props, NPCs
      // =====================================================================
      const A = {
        entrance: PF.anchor(X(-6), FAC + 0.05, Z(18.2), 0),
        siding: PF.anchor(X(-25), UP + 0.05, Z(0), -HP),
        exit_tunnel: PF.anchor(X(23.5), NEST + 0.05, Z(17), 0),
        spawn1: PF.anchor(X(-14), FAC, Z(0), 0),
        spawn2: PF.anchor(X(12), FAC, Z(3), 0),
        spawn3: PF.anchor(X(-10), NEST, Z(-13), 0),
        spawn4: PF.anchor(X(-19), NEST, Z(-2), 0),
        spawn5: PF.anchor(X(0), UP, Z(-11), 0),
        spawn6: PF.anchor(X(12), NEST, Z(-2), 0),
        boss: PF.anchor(X(16), NEST, Z(3), PI),
        royal_cell: PF.anchor(X(19), NEST, Z(-3.6), PI),
        loot1: PF.anchor(X(20.5), UP, Z(-10.6), 0),
        loot2: PF.anchor(X(-24), UP, Z(-4.6), 0),
        loot3: PF.anchor(X(20), FAC, Z(16.5), 0),
        loot4: PF.anchor(X(-2), NEST, Z(5), 0),
        loot5: PF.anchor(X(19), NEST, Z(-3.4), PI),
      };
      PF.nb.int = A;
      const NBX = PF.NB;
      const ext = NBX.anchors || {};
      const door0 = NBX.door || V3(-240, 1.6, 258.9),
        sid = NBX.sidingDoor || V3(-262.6, 8.9, 241),
        mnd = NBX.moundDoor || V3(-220.3, 0.8, 260.3);
      PF.door({
        id: "pch_nb_in",
        pos: door0,
        label: "National Biscuit Company",
        verb: "Enter",
        radius: 1.4,
        target: { x: A.entrance.x, y: A.entrance.y, z: A.entrance.z, yaw: 0 },
        sound: "door_open",
      });
      PF.door({
        id: "pch_nb_out",
        pos: P(-6, FAC + 1.4, 19.8),
        label: "15th Street",
        verb: "Exit",
        radius: 1.2,
        target: { x: -240, y: 0.05, z: 261.2, yaw: PI },
        sound: "door_open",
      });
      // B2 (2026-09-28): a map filler building (collider x −269.9..−264.1, z 227..258, 18–21 m tall) stands across the spur
      // between the High Line and the siding portal, so the old exit (x −265.5) landed inside it and the portal door was
      // unreachable from the spur. Until the map keeps the spur corridor clear, the siding door is worked from the spur side
      // of that block and the exit lands on the open spur deck facing the High Line.
      const sidW = V3(-270.8, sid.y, sid.z);
      PF.door({
        id: "pch_nb_siding_in",
        pos: sidW,
        label: "National Biscuit Co. — Receiving",
        verb: "Enter",
        radius: 1.6,
        target: { x: A.siding.x, y: A.siding.y, z: A.siding.z, yaw: -HP },
        sound: "door_open",
      });
      PF.door({
        id: "pch_nb_siding_out",
        pos: P(XW + 0.4, UP + 1.4, 0),
        label: "High Line Siding",
        verb: "Exit",
        radius: 1.6,
        target: {
          x: -272.5,
          y: (PF.HL ? PF.HL.DY : 7.5) + 0.05,
          z: sid.z,
          yaw: HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pch_nb_tunnel_out",
        pos: P(24, NEST + 1.2, 19.2),
        label: "Ant Tunnel (to the surface)",
        verb: "Climb",
        radius: 1.3,
        target: { x: mnd.x + 1.6, y: 0.05, z: mnd.z, yaw: -HP },
        sound: "footstep_rubble",
      });
      PF.door({
        id: "pch_nb_tunnel_in",
        pos: mnd,
        label: "Ant Tunnel",
        verb: "Crawl into",
        radius: 1.3,
        target: {
          x: A.exit_tunnel.x,
          y: A.exit_tunnel.y,
          z: A.exit_tunnel.z,
          yaw: PI,
        },
        sound: "footstep_rubble",
      });
      // containers & terminals
      PF.prop("terminal", {
        x: X(18.3),
        y: UP + 0.8,
        z: Z(-9.2),
        yaw: PI,
        terminalId: "pch_nb_manager",
        mount: "bare",
        id: "pch_nb_term",
      });
      PF.prop("safe", {
        x: X(14.7),
        y: UP,
        z: Z(-10.6),
        yaw: HP,
        lock: PF.regLock({
          id: "pch_lk_nb_safe",
          label: "Plant Manager's Safe",
          kind: "safe",
          code: "060266",
          hint: "The plant manager filed the combination on his teletype.",
        }),
        items: [
          ["pch_recipe", 1],
          ["scrip", 180],
          ["old_dollars", 25],
          ["chocolate_zeppelin", 3],
        ],
        id: "pch_nb_safe",
        name: "Plant Manager's Safe",
      });
      PF.prop("footlocker", {
        x: X(-23),
        y: UP,
        z: Z(-3.4),
        yaw: 0,
        loot: "crate",
        id: "pch_nb_recv",
      });
      PF.prop("first_aid", {
        x: X(27.8),
        y: UP + 1.3,
        z: Z(8.2),
        yaw: -HP,
        id: "pch_nb_aid",
      });
      PF.prop("fizzo_machine", {
        x: X(27.4),
        y: UP,
        z: Z(18.8),
        yaw: -HP,
        id: "pch_nb_fizzo",
      });
      PF.prop("locker", {
        x: X(4.5),
        y: FAC,
        z: Z(19.2),
        yaw: PI,
        count: 2,
        loot: "locker",
        id: "pch_nb_lockers",
      });
      PF.prop("desk", {
        x: X(20.2),
        y: FAC,
        z: Z(15.5),
        yaw: PI,
        loot: "desk",
        id: "pch_nb_foredesk",
      });
      PF.prop("toolbox", {
        x: X(-26.5),
        y: FAC,
        z: Z(8),
        yaw: HP,
        loot: "toolbox",
        id: "pch_nb_tools",
      });
      PF.prop("crate", {
        x: X(19),
        y: NEST + 0.2,
        z: Z(-3.2),
        yaw: 0.3,
        kind: "plain",
        id: "pch_nb_royal",
        name: "Royal Brood Cell",
        items: [["pch_royal_jelly", 1]],
      });
      PF.prop("footlocker", {
        x: X(1.2),
        y: NEST + 0.3,
        z: Z(8.2),
        yaw: 2.6,
        loot: "raider_stash",
        id: "pch_nb_hoard",
        name: "Scavenger's Pack",
      });
      PF.pickup("pch_golden_cake", 1, P(19.3, UP + 0.95, -9.0));
      PF.pickup("pch_note_qc", 1, P(14, FAC + 0.82, 9.6));
      PF.pickup("pch_reel_foreman", 1, P(22.4, UP + 0.05, 16.8));
      PF.pickup("chocolate_zeppelin", 3, P(-1.2, 1.0, 4.4));
      PF.pickup("chocolate_zeppelin", 2, P(20.5, FAC + 0.8, 18.2));
      PF.pickup("rally_tonic", 1, P(-24, UP + 1.1, -4.6));
      // the Queen + her brood (hostile creatures; combat also spawns the location's ants)
      const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
      const dead = (id) => () => !PF.flag("dead_" + id);
      const ants = [
        ["pch_nb_a1", "giant_ant", A.spawn1],
        ["pch_nb_a2", "giant_ant", A.spawn2],
        ["pch_nb_a3", "fire_ant", V3(X(4), FAC, Z(-14))],
        ["pch_nb_a4", "giant_ant", A.spawn3],
        ["pch_nb_a5", "giant_ant", A.spawn4],
        ["pch_nb_a6", "fire_ant", V3(X(-17), NEST, Z(7))],
        ["pch_nb_a7", "giant_ant", V3(X(-2), NEST, Z(1))],
        ["pch_nb_a8", "fire_ant", A.spawn6],
        ["pch_nb_a9", "giant_ant", A.spawn5],
        ["pch_nb_a10", "fire_ant", V3(X(-8), UP, Z(11))],
      ];
      ants.forEach(([id, type, a], i) =>
        PF.npc({
          id,
          type,
          faction: "creatures",
          level: 3 + (i % 3),
          pos: pos(a),
          yaw: (i * 1.3) % TAU,
          ai: "guard",
          home: { x: a.x, z: a.z, r: 7 },
          loot: "creature",
          seed: 8100 + i,
          when: dead(id),
        }),
      );
      PF.npc({
        id: "pch_nb_queen",
        type: "fire_ant",
        name: "The Queen of Bakery No. 1",
        faction: "creatures",
        level: 10,
        pos: pos(A.boss),
        yaw: PI,
        ai: "guard",
        home: { x: A.boss.x, z: A.boss.z, r: 6 },
        hp: 420,
        dr: 14,
        damage: 2.2,
        loot: "creature",
        inventory: [["pch_royal_jelly", 1]],
        seed: 8200,
        when: dead("pch_nb_queen"),
        after: (a) => {
          try {
            if (a.char && a.char.root) a.char.root.scale.setScalar(2.4);
            a.radius = 1.2;
          } catch (e) {
            /* cosmetic */
          }
        },
      });
      PF.register(
        "nabisco_factory",
        PF.root || null,
        Object.assign({}, ext, A, { exterior_entrance: ext.entrance }),
        { interiorRoot: root, interiorKey: KEY },
      );
    },
    22,
  );

  // quest hook: taking the jelly advances "Queen Bee"
  G.events.on("itemAdded", (id) => {
    if (id === "pch_royal_jelly")
      PF.q.advance("pch_sweet", ["talk", "factory", "queen"], "return");
  });
  G.events.on("actorKilled", (a) => {
    if (a && a.id === "pch_nb_queen")
      PF.q.advance("pch_sweet", ["talk", "factory"], "queen");
  });
})();
