/* src/poi_bridges/12_bridgemarket.js */
/* =====================================================================
 * NEW RAD CITY — POI BRIDGES — THE BRIDGEMARKET (interior + content)
 * Cell INTERIORS.queensboro_bridge (origin 7400, 0, 800), built in local
 * coordinates lifted BASE = 10 m (so the Pier Works below still sit above
 * the interior terrain at y = 0).
 *
 *  MARKET HALL (y 0)   48 × 16 m under twelve Guastavino tile groin vaults
 *                      on five flared "mushroom" piers: stalls (Morty's
 *                      Sundries, Kowalski's), Doc Hattie's clinic, The Span
 *                      diner & bar, daylight through the 59th St arches.
 *  NORTH ROOMS         locked storeroom (owned), settlers' bunk vault,
 *                      the corridor & long stair down to the Pier Works.
 *  WEST TOWER          waterworks below, Mayor Ruth Adebayo's office above
 *                      (terminal, safe) and the stair door to the bridge deck.
 *  PIER WORKS (y -6)   flooded brick pump hall, tidal generator room,
 *                      shellback-nest cistern (Old Snapper), river-hatch
 *                      passage out to the Manhattan pier (loop exit).
 *
 * Quest "Current Events" (pbr_current): restart the market's tidal
 * generator.  Named NPCs: Ruth Adebayo (mayor), Morty Weintraub (general
 * merchant), Doc Hattie Lin, Lou "Two-Tone" Mazur (bartender),
 * Wanda Kowalski (arms), watchmen.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pbr) return;
  const PF = G._pbr;
  const BK = PF.bk,
    K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2;
  const KEY = "queensboro_bridge";
  const BASE = 10;
  const O = { x: 7400, y: BASE, z: 800 };
  const W = (x, y, z) => V3(O.x + x, O.y + y, O.z + z);
  const A = (x, y, z, yaw) => PF.anchor(O.x + x, O.y + y, O.z + z, yaw || 0);
  const L = (x, y, z, color, r, i) => ({
    x: O.x + x,
    y: O.y + y,
    z: O.z + z,
    color,
    r,
    i,
  });

  Object.assign(PF.flagDefaults, {
    bm_met_ruth: false,
    bm_power: false,
    bm_store_open: false,
    bm_fuse_hint: false,
    bm_heal_free: false,
    bm_dutch: false,
  });

  Object.assign(PF.MAT_DEFS, {
    window_day: {
      color: 0x5a6a70,
      emissive: 0x8a9eaa,
      emissiveIntensity: 0.42,
      rough: 0.3,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    egg: {
      color: 0xc8c49a,
      emissive: 0x6a8a20,
      emissiveIntensity: 0.45,
      rough: 0.35,
      uv: 1,
      plain: true,
    },
    jukebox: {
      color: 0xd0a040,
      emissive: 0xff9a30,
      emissiveIntensity: 0.9,
      rough: 0.4,
      metal: 0.3,
      uv: 1,
      plain: true,
      noShadow: true,
    },
  });

  // ===================================================================
  // GEOMETRY
  // ===================================================================
  function archGlass(b, key, cx, y0, z, w, spring, ry) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2, spring);
    s.absarc(0, spring, w / 2, 0, PI, false);
    s.lineTo(-w / 2, 0);
    b.add(key, PF.shapeGeo(s, 12), {
      m: PF.m4(cx, y0, z, ry || 0),
      uv: "keep",
      noAO: true,
      grime: 0.05,
    });
  }
  /** Spandrel that rounds the top of a rectangular wall gap into an arch (inner face at z, facing ry). */
  function archSpandrel(b, key, cx, spring, top, z, w, depth, ry) {
    const R = w / 2,
      s = new THREE.Shape();
    s.moveTo(-R, spring);
    s.absarc(0, spring, R, PI, 0, true);
    s.lineTo(R, top);
    s.lineTo(-R, top);
    s.closePath();
    b.add(
      key,
      new THREE.ExtrudeGeometry(s, {
        depth,
        bevelEnabled: false,
        curveSegments: 12,
      }),
      { m: PF.m4(cx, 0, z, ry || 0), grime: 0.3 },
    );
  }

  function buildInterior(cell) {
    const b = PF.batch("bm_int");
    b.ground = O.y;
    const an = {};
    const lights = [
      // market hall: stall lamps under each bay, a cooler daylight wash by the south windows
      L(-20, 3.6, -4, 0xffc070, 9, 0.9),
      L(-12, 3.6, -4, 0xffc070, 9, 1.0),
      L(-4, 3.6, -4, 0xffc070, 9, 1.0),
      L(4, 3.6, -4, 0xffc070, 9, 0.9),
      L(12, 3.2, -4, 0xff9ab0, 8, 0.8),
      L(20, 3.2, -3, 0xffb060, 9, 0.9),
      L(-20, 3.6, 4, 0xe8f0ff, 8, 0.7),
      L(-12, 3.6, 4, 0xffc070, 9, 0.9),
      L(-4, 3.6, 4, 0xffc070, 9, 0.9),
      L(4, 3.6, 4, 0xffc070, 9, 0.9),
      L(12, 3.6, 4, 0xffc070, 9, 0.8),
      L(20, 3.6, 4, 0xffb060, 9, 0.9),
      L(-20, 4, 7.2, 0x9ab4c8, 6, 0.5),
      L(-12, 4, 7.2, 0x9ab4c8, 6, 0.5),
      L(-4, 4, 7.2, 0x9ab4c8, 6, 0.5),
      L(4, 4, 7.2, 0x9ab4c8, 6, 0.5),
      L(12, 4, 7.2, 0x9ab4c8, 6, 0.5),
      L(20, 4, 7.2, 0x9ab4c8, 6, 0.5),
      // uplight on the vaults (reflected lamp light)
      L(-16, 9, 0, 0xffb070, 10, 0.45),
      L(-4, 9, 0, 0xffb070, 10, 0.45),
      L(8, 9, 0, 0xffb070, 10, 0.45),
      L(20, 9, 0, 0xffb070, 10, 0.45),
      // north rooms, corridor, west tower
      L(4, 3, -12.5, 0xffc070, 7, 0.7),
      L(12.4, 3, -12.5, 0xffb060, 7, 0.8),
      L(-12, 2.6, -11, 0xffc070, 5, 0.6),
      L(-12, -2, -20, 0xff5030, 6, 0.7),
      L(-32, 3.5, 3, 0xffc070, 9, 0.8),
      L(-32, 11, 2.6, 0xffc890, 10, 1.0),
      L(-26, 11, -4, 0xffc070, 5, 0.6),
      // pier works: red emergency lamps, sick green from the nest, a sodium lamp in the generator room
      L(-12, -3.5, -28, 0xff3020, 7, 0.9),
      L(-2, -3, -36, 0xff3020, 7, 0.6),
      L(-16, -3, -40, 0x70a0a0, 8, 0.35),
      L(15, -2.5, -36, 0xffb050, 9, 0.9),
      L(27, -4, -35.8, 0xff3020, 6, 0.8),
      L(-31, -5, -40, 0x7aff40, 9, 1.0),
      L(-28, -5, -33, 0x7aff40, 7, 0.7),
    ];
    b.setLights(lights, 0x1a1612, 0.9);

    BK.inFrame(b, O.x, O.y, O.z, function () {
      // ------------------------------------------------------------------ MARKET HALL
      b.boxMM("quarry", -24, -0.3, -8, 24, 0, 8, { grime: 0.5 });
      PF.colMM(-24.8, -1, -8.8, 24.8, 0, 8.8, { surface: "concrete" });
      const bays = [-20, -12, -4, 4, 12, 20];
      // south wall with arched lunette windows (door in bay -4)
      const sg = [];
      for (const bx of bays) {
        if (bx === -4) {
          sg.push({ c: bx, w: 2.6, y0: 0, h: 3.2 });
          sg.push({ c: bx, w: 4.4, y0: 3.8, h: 3.0 });
        } else sg.push({ c: bx, w: 4.4, y0: 1.2, h: 5.6 });
      }
      PF.wall(b, "guastavino", "x", -24.8, 24.8, 8, 8.8, 0, 12, sg, {});
      for (const bx of bays) {
        archSpandrel(b, "guastavino", bx, 4.6, 6.85, 7.98, 4.4, 0.85, 0);
        archGlass(
          b,
          "window_day",
          bx,
          bx === -4 ? 3.8 : 1.2,
          8.55,
          4.4,
          bx === -4 ? 0.8 : 3.4,
          PI,
        );
        for (let k = 1; k < 4; k++)
          b.box(
            "iron",
            bx - 2.2 + k * 1.1,
            bx === -4 ? 3.8 : 1.2,
            8.4,
            0.07,
            (bx === -4 ? 3.0 : 5.6) - 0.2,
            0.07,
            { seg: false },
          );
        b.box(
          "granite_block",
          bx,
          bx === -4 ? 3.55 : 0.95,
          7.7,
          4.8,
          0.25,
          0.7,
          { seg: false },
        ); // sill
      }
      // entrance: steel double door in bay -4 (inside face), mat, sign
      b.boxMM("paint_teal", -5.25, 0, 8.3, -2.75, 3.15, 8.45, {
        seg: false,
        grime: 0.6,
      });
      b.box("chrome", -4.2, 1.2, 8.25, 0.06, 0.5, 0.06, { seg: false });
      b.box("chrome", -3.8, 1.2, 8.25, 0.06, 0.5, 0.06, { seg: false });
      an.entrance = A(-4, 0, 6.2, 0);
      // north wall: corridor (x -12), storeroom (4), bunks (12)
      PF.wall(
        b,
        "guastavino",
        "x",
        -24.8,
        24.8,
        -8.8,
        -8,
        0,
        12,
        [
          { c: -12, w: 2.8, y0: 0, h: 3.2 },
          { c: 4, w: 2.2, y0: 0, h: 2.8 },
          { c: 12.4, w: 2.2, y0: 0, h: 2.8 },
        ],
        {},
      );
      // west wall (opening to the tower at z 4) and east wall
      PF.wall(
        b,
        "guastavino",
        "z",
        -8.8,
        8.8,
        -24.8,
        -24,
        0,
        12,
        [{ c: 4, w: 3, y0: 0, h: 3.4 }],
        {},
      );
      PF.wall(b, "guastavino", "z", -8.8, 8.8, 24, 24.8, 0, 12, [], {});
      // granite wainscot + pilasters along the walls
      for (const [x0, z0, x1, z1] of [
        [-24, 7.75, 24, 8],
        [-24, -8, 24, -7.75],
        [-24, -8, -23.75, 8],
        [23.75, -8, 24, 8],
      ])
        b.boxMM("granite_block", x0, 0, z0, x1, 1.0, z1, {
          grime: 0.6,
          segLen: 6,
        });
      for (const bx of [-24, -16, -8, 0, 8, 16, 24])
        for (const zz of [-7.6, 7.6]) {
          b.box("guastavino", bx, 0, zz, 1.2, 5.2, 0.8, {
            seg: false,
            grime: 0.4,
          });
          b.box("granite_block", bx, 0, zz, 1.4, 0.8, 1.0, {
            seg: false,
            grime: 0.6,
          });
          b.box("granite_block", bx, 5.0, zz, 1.6, 0.3, 1.1, {
            seg: false,
            grime: 0.4,
          });
        }
      // mushroom piers + twelve groin vaults
      for (const x of [-16, -8, 0, 8, 16])
        BK.vaultPier(b, "guastavino", "guastavino", x, 0, 5.2, 0.55, {});
      for (const bx of bays)
        for (const bz of [-4, 4])
          BK.groin(b, "guastavino", bx, bz, 4, 4, 5.2, 6.3, {
            n: 16,
            tile: 2.0,
          });

      // ------------------------------------------------------------------ STALLS & MARKET LIFE
      D.stall(b, -4, -6.1, 0, 4.2, 2.2, {
        sign: "SOL'S SUNDRIES",
        goods: "cans",
        seed: 3,
      });
      an.merchant = A(-4, 0, -6.6, 0);
      an.npc_sol = an.merchant;
      D.stall(b, -20, -6.1, 0, 4.0, 2.2, {
        sign: "CISTERN WATER CO.",
        goods: "bottles",
        seed: 5,
        awning: "awning_green",
      });
      D.stall(b, -16, 6.1, PI, 4.2, 2.2, {
        sign: "KOWALSKI'S",
        goods: "guns",
        seed: 7,
        awning: "stripe_red",
      });
      an.npc_kowalski = A(-16, 0, 6.7, PI);
      D.stall(b, 6, 6.1, PI, 4.0, 2.2, {
        sign: "SCRAP & SUNDRY",
        goods: "junk",
        seed: 9,
        awning: "awning_green",
      });
      // centre: fire barrel, benches, crates, chalkboard price list
      PF.barrel(b, -8, 0, 2.2, { fire: true });
      PF.glow(W(-8, 1.1, 2.2), 0xff8a30, 1.6, cell.root, {
        intensity: 1.0,
        flicker: 0.3,
      });
      PF.bench(b, -10.5, 0, 3.4, 0);
      PF.bench(b, -5.5, 0, 3.4, 0);
      D.crates(b, 2.6, 0, -2.2, 2, 21);
      D.crates(b, -1.8, 0, 2.6, 1, 22);
      const chalk = PF.texMat(
        "bm_prices",
        PF.signTex(
          "bm_prices",
          [
            "TODAY AT BRIDGEMARKET",
            "PURIFIED WATER .... 20c",
            "SHELLBACKS CAKE ..... 15c",
            "RALLY TONIC .... 75c",
            "NO CREDIT · NO CRABS",
          ],
          "enamel",
          512,
          384,
          { bg: "#1c2a22", fg: "#e8e4d0" },
        ),
        { rough: 0.95 },
      );
      b.quad(chalk, 0, 2.6, 7.35, 3.2, 2.4, { ry: PI, grime: 0.3 });
      // string lights between the piers + hanging work lamps
      for (let i = 0; i < 4; i++) {
        const x0 = -16 + i * 8;
        D.stringLights(
          b,
          V3(x0, 4.6, 0),
          V3(x0 + 8, 4.6, 0),
          0.7,
          14,
          0xffd090,
        );
      }
      D.stringLights(
        b,
        V3(-24, 4.4, -7.6),
        V3(24, 4.4, -7.6),
        0.9,
        48,
        0xffd090,
      );
      D.stringLights(b, V3(-24, 4.4, 7.6), V3(24, 4.4, 7.6), 0.9, 48, 0xffd090);
      // clinic (north-west bay): screens, beds, cabinet, cross
      for (const [x, z] of [
        [-22.5, -3.5],
        [-19.5, -3.5],
      ]) {
        b.box("iron", x, 0, z, 0.9, 0.55, 2.0, { seg: false });
        b.box("linen", x, 0.55, z, 0.95, 0.18, 2.05, {
          seg: false,
          grime: 0.5,
        });
        b.box("linen", x, 0.73, z - 0.75, 0.6, 0.12, 0.35, { seg: false });
        PF.col(x, z, 0.95, 2.05, 0, 0.75, 0, { walkable: false });
      }
      for (const z of [-1.2, -0.6])
        b.boxMM("linen", -24, 0.2, z - 0.02, -16.5, 2.2, z + 0.02, {
          grime: 0.5,
          seg: false,
        });
      b.boxMM("iron", -24, 2.2, -0.9, -16.5, 2.25, -0.88, { seg: false });
      const cross = PF.texMat(
        "bm_clinic",
        PF.signTex(
          "bm_clinic",
          ["+ DOC HATTIE", "STITCHES · RAD FLUSH"],
          "enamel",
          512,
          256,
          { bg: "#e8e2d0", fg: "#a82820" },
        ),
        { rough: 0.8 },
      );
      b.quad(cross, -20, 3.2, -7.5, 2.8, 1.4, { grime: 0.3 });
      an.npc_hattie = A(-21, 0, -6, 0);
      // ------------------------------------------------------------------ THE SPAN (diner & bar, east bays)
      b.boxMM("oak", 13.5, 0, -3.6, 22.5, 1.1, -2.6, { grime: 0.5 });
      b.boxMM("chrome", 13.4, 1.1, -3.7, 22.6, 1.16, -2.5, { seg: false });
      b.boxMM("paint_red", 13.5, 0, -2.62, 22.5, 0.95, -2.58, {
        seg: false,
        grime: 0.5,
      });
      PF.colMM(13.5, 0, -3.6, 22.5, 1.1, -2.6, {
        walkable: false,
        surface: "wood",
      });
      for (let x = 14.5; x < 22.5; x += 1.3) {
        b.cyl("chrome", x, 0, -1.9, 0.05, 0.08, 0.75, 6, { hSeg: 1 });
        b.cyl("paint_red", x, 0.75, -1.9, 0.24, 0.24, 0.1, 10, { hSeg: 1 });
      }
      D.shelf(b, 18, 0, -7.2, 0, 7, 4, 31);
      const neon = PF.texMat(
        "bm_span",
        PF.signTex("bm_span", ["THE SPAN"], "neon", 512, 160, {
          fg: "#ff4a9a",
        }),
        { emissive: 1.8, rough: 0.6, noShadow: true },
      );
      b.quad(neon, 18, 3.6, -7.3, 4.2, 1.3, { grime: 0.1 });
      PF.glow(W(18, 3.6, -6.9), 0xff4a9a, 3.2, cell.root, {
        intensity: 1.0,
        flicker: 0.08,
      });
      an.npc_benny = A(18, 0, -4.8, PI);
      // booths
      for (const x of [15, 19]) {
        b.boxMM("oak", x - 0.6, 0, 3.2, x + 0.6, 0.75, 4.4, {
          seg: false,
          grime: 0.5,
        });
        b.cyl("chrome", x, 0, 3.8, 0.06, 0.06, 0.72, 6, { hSeg: 1 });
        for (const dz of [-1.1, 1.1]) {
          b.boxMM(
            "awning_red",
            x - 0.7,
            0,
            3.8 + dz - 0.3,
            x + 0.7,
            0.45,
            3.8 + dz + 0.3,
            { seg: false },
          );
          b.boxMM(
            "awning_red",
            x - 0.7,
            0.45,
            3.8 + dz * 1.35 - 0.1,
            x + 0.7,
            1.2,
            3.8 + dz * 1.35 + 0.1,
            { seg: false },
          );
        }
        PF.col(x, 3.8, 1.4, 3.2, 0, 0.8, 0, { walkable: false });
      }
      b.boxMM("jukebox", 22.6, 0, 5.4, 23.6, 1.6, 6.6, { seg: false });
      b.cyl("jukebox", 23.1, 1.6, 6.0, 0.5, 0.5, 1.0, 12, {
        thetaLen: PI,
        rz: HP,
        hSeg: 1,
      });
      PF.glow(W(23.0, 1.5, 6.0), 0xff9a30, 1.4, cell.root, { intensity: 0.8 });
      PF.col(23.1, 6, 1.0, 1.2, 0, 1.8, 0, { walkable: false });

      // ------------------------------------------------------------------ NORTH ROOMS
      b.boxMM("quarry", -14.2, -0.3, -16.8, 17, 0, -8.8, { grime: 0.6 });
      PF.colMM(-0.6, -1, -16.8, 17, 0, -8.8, {});
      // storeroom (x 0.2..7.8) and bunk vault (x 8.6..16.2)
      PF.wall(b, "brick_dark", "z", -16.8, -8.8, -0.6, 0.2, 0, 6.2, [], {});
      PF.wall(b, "brick_dark", "z", -16.8, -8.8, 7.8, 8.6, 0, 6.2, [], {});
      PF.wall(b, "brick_dark", "z", -16.8, -8.8, 16.2, 17, 0, 6.2, [], {});
      PF.wall(b, "brick_dark", "x", -0.6, 17, -16.8, -16, 0, 6.2, [], {});
      BK.barrelZ(b, "guastavino", -16, -8.8, 4, 3.8, 3.4, 0.65, { tile: 2 });
      BK.barrelZ(b, "guastavino", -16, -8.8, 12.4, 3.8, 3.4, 0.65, { tile: 2 });
      for (let z = -15.2; z < -10; z += 2.5) {
        D.shelf(b, 0.9, 0, z, HP, 2.2, 4, (z * 7) | 0);
      }
      D.crates(b, 6.6, 0, -15, 3, 41);
      D.crates(b, 5.2, 0, -15.2, 2, 42);
      D.crates(b, 6.8, 0, -12.8, 1, 43);
      for (let i = 0; i < 5; i++)
        PF.barrel(b, 2.6 + (i % 3) * 0.7, 0, -15.3 + (i > 2 ? 0.7 : 0), {
          key: "paint_teal",
        });
      an.store = A(4, 0, -12, PI);
      // storeroom gate (locked, owned by the market)
      an.store_gate = A(4, 0, -8.4, 0);
      // bunks
      for (const [x, z, r] of [
        [9.6, -14.6, 0],
        [9.6, -10.8, 0],
        [15.2, -14.6, PI],
        [15.2, -10.8, PI],
      ]) {
        for (const y of [0.35, 1.7]) {
          b.box("iron", x, y, z, 0.95, 0.1, 2.0, { seg: false });
          D.mattress(
            b,
            x,
            y + 0.1,
            z,
            r + HP * 0,
            [0xa89070, 0x8a9a7a, 0xb0a080][((x + z + y * 3) | 0) % 3],
          );
        }
        for (const [dx, dz] of [
          [-0.45, -0.95],
          [0.45, -0.95],
          [-0.45, 0.95],
          [0.45, 0.95],
        ])
          b.box("iron", x + dx, 0, z + dz, 0.06, 2.3, 0.06, { seg: false });
        PF.col(x, z, 1.0, 2.0, 0, 2.3, 0, { walkable: false });
      }
      b.boxMM("carpet", 11.2, 0.01, -15.5, 13.6, 0.03, -10, { seg: false });
      an.bunks = A(12.4, 0, -12, PI);
      // corridor + long stair down to the Pier Works
      PF.wall(b, "brick_dark", "z", -26, -8.8, -14.2, -13.4, -6, 4.2, [], {});
      PF.wall(b, "brick_dark", "z", -26, -8.8, -10.6, -9.8, -6, 4.2, [], {});
      b.boxMM("quarry", -13.4, -0.3, -14, -10.6, 0, -8.8, { grime: 0.6 });
      PF.colMM(-13.4, -1, -14, -10.6, 0, -8.8, {});
      PF.stairs(b, "granite_block", -12, -26, 0, 2.8, 12, -6, 0, {
        base: -6.3,
        maxRise: 0.34,
      });
      BK.barrelZ(b, "brick_dark", -26, -8.8, -12, 1.8, 3.4, 0.6, { tile: 3 });
      const keep = PF.texMat(
        "bm_keepout",
        PF.signTex(
          "bm_keepout",
          ["PIER WORKS ↓", "CRABS BELOW · KNOCK FIRST"],
          "raider",
          512,
          192,
          { bg: "#4a4638", fg: "#e8d8a0" },
        ),
        { rough: 0.9 },
      );
      b.quad(keep, -12, 3.6, -8.75, 2.6, 0.95, { grime: 0.3 });
      an.stair_top = A(-12, 0, -12, PI);
      // bulbs on the stair
      for (const z of [-17, -22]) {
        b.sphere("lamp_red", -10.9, ((z + 26) / 12) * 6 - 6 + 2.8, z, 0.12, {
          ws: 6,
          hs: 4,
          noAO: true,
        });
        PF.glow(
          W(-10.9, ((z + 26) / 12) * 6 - 6 + 2.8, z),
          0xff3020,
          1.0,
          cell.root,
          { intensity: 0.8 },
        );
      }

      // ------------------------------------------------------------------ WEST TOWER
      b.boxMM("quarry", -40, -0.3, -8.8, -24.8, 0, 8.8, { grime: 0.6 });
      PF.colMM(-40.8, -1, -8.8, -24.8, 0, 8.8, {});
      PF.wall(
        b,
        "brick_dark",
        "z",
        -8.8,
        8.8,
        -40.8,
        -40,
        0,
        15.5,
        [{ c: 3, w: 2.2, y0: 9.2, h: 3.2 }],
        {},
      );
      PF.wall(b, "brick_dark", "x", -40.8, -24.8, -8.8, -8, 0, 15.5, [], {});
      PF.wall(
        b,
        "brick_dark",
        "x",
        -40.8,
        -24.8,
        8,
        8.8,
        0,
        15.5,
        [
          { c: -35, w: 2.2, y0: 9.2, h: 2.6 },
          { c: -29, w: 2.2, y0: 9.2, h: 2.6 },
          { c: -32, w: 2.4, y0: 1.2, h: 3.4 },
        ],
        {},
      );
      for (const [x, z, ry] of [
        [-40.45, 3, HP],
        [-35, 8.45, 0],
        [-29, 8.45, 0],
        [-32, 8.45, 0],
      ]) {
        const hi = x === -32 ? 1.2 : 9.2,
          hh = x === -32 ? 3.4 : x === -40.45 ? 3.2 : 2.6;
        b.quad("window_day", x, hi + hh / 2, z, x === -32 ? 2.4 : 2.2, hh, {
          ry: ry === 0 ? PI : HP,
          noAO: true,
        });
      }
      // flight 1 (west, lane z -6.5), landing, flight 2 (east, lane z -4)
      PF.stairs(b, "granite_block", -27, -6.5, -HP, 2.4, 8, 0, 4, {
        maxRise: 0.34,
      });
      b.boxMM("granite_block", -39.8, 0, -7.9, -35, 4, -2.7, { grime: 0.5 });
      PF.colMM(-39.8, 0, -7.9, -35, 4, -2.7, {});
      PF.stairs(b, "granite_block", -35, -4.0, HP, 2.4, 8, 4, 8, {
        base: 3.8,
        maxRise: 0.34,
      });
      b.boxMM("oak", -35, 3.8, -5.3, -27, 9.2, -5.2, { seg: false }); // divider / balustrade
      PF.colMM(-35, 0, -5.32, -27, 9.2, -5.18, { walkable: false });
      // upper floor (office) + landing
      b.boxMM("oak", -39.8, 7.6, -2.7, -24.8, 8, 7.9, { grime: 0.4 });
      PF.colMM(-39.8, 7.6, -2.7, -24.8, 8, 7.9, { surface: "wood" });
      b.boxMM("oak", -27, 7.6, -5.2, -24.8, 8, -2.7, { grime: 0.4 });
      PF.colMM(-27, 7.6, -5.2, -24.8, 8, -2.7, { surface: "wood" });
      PF.railing(
        b,
        [
          [-39.6, -2.8],
          [-27.1, -2.8],
        ],
        8,
        1.05,
        "iron",
        { collide: true },
      );
      PF.railing(
        b,
        [
          [-27, -5.3],
          [-24.9, -5.3],
        ],
        8,
        1.05,
        "iron",
        { collide: true },
      );
      for (const x of [-38, -34, -30, -26])
        b.box("oak", x, 0, 3, 0.35, 7.6, 0.35, { seg: false }); // posts under the floor
      BK.barrelX(b, "guastavino", -40, -24.8, 2.6, 5.3, 12, 0.55, { tile: 2 });
      BK.barrelX(b, "guastavino", -40, -24.8, -5.3, 2.6, 12, 0.6, { tile: 2 });
      b.boxMM("guastavino", -40, 7.4, -8.8, -24.8, 7.6, -2.7, { seg: false }); // soffit over the lower flight
      b.boxMM("brick_dark", -24.8, 11.9, -8.8, -24, 15.5, 8.8, { grime: 0.6 }); // tower east wall above the hall
      // waterworks (ground floor): purifier tank, pipes, taps
      b.cyl("rust", -36, 0, 4, 2.0, 2.0, 5.2, 16, { hSeg: 3, grime: 0.6 });
      b.cyl("iron", -36, 5.2, 4, 2.1, 1.2, 0.8, 16, { hSeg: 1 });
      PF.col(-36, 4, 4.0, 4.0, 0, 6, 0, { walkable: false });
      for (const z of [1.2, 6.8])
        b.rod("iron", V3(-34, 1.2, z), V3(-25.2, 1.2, z), 0.12, 8, {});
      b.box("paint_teal", -28, 0, 6.9, 2.0, 1.1, 0.9, {
        seg: false,
        grime: 0.5,
      });
      const wtr = PF.texMat(
        "bm_water",
        PF.signTex(
          "bm_water",
          ["CISTERN 3", "PURIFIED · DO NOT WASTE"],
          "enamel",
          512,
          192,
          { bg: "#1c3a5a" },
        ),
        { rough: 0.8 },
      );
      b.quad(wtr, -36, 3.2, 1.95, 2.4, 0.9, { ry: PI });
      // the office: desk, chairs, cabinets, map, rug, the deck door
      b.boxMM("carpet", -38.5, 8.01, -1.5, -28, 8.03, 7, { seg: false });
      b.boxMM("oak", -35.2, 8, 2.6, -32.2, 8.8, 4.0, { grime: 0.4 });
      PF.colMM(-35.2, 8, 2.6, -32.2, 8.8, 4.0, { walkable: false });
      D.chair(b, -33.7, 8, 4.8, PI, false, "oak");
      D.chair(b, -33.7, 8, 1.6, 0, false, "oak");
      D.chair(b, -30.5, 8, 5.5, 2.4, true, "oak");
      D.papers(b, -33.7, 8.8, 3.3, 0.9, 10, 51);
      const map = PF.texMat(
        "bm_map",
        PF.signTex(
          "bm_map",
          [
            "BRIDGEMARKET",
            "TRADE ROUTES 1989",
            "GRAND CENTRAL · NEON · CHINATOWN",
          ],
          "bronze",
          512,
          384,
          {},
        ),
        { rough: 0.9 },
      );
      b.quad(map, -39.95, 10.4, -0.2, 3.0, 2.2, { ry: HP });
      an.npc_ruth = A(-33.7, 8, 5.1, PI);
      an.office = A(-31, 8, 3, PI);
      an.terminal = A(-34.6, 8.8, 3.3, 0);
      an.deck_door = A(-25.4, 8, -3.9, -HP);
      b.boxMM("paint_teal", -25.0, 8, -4.7, -24.85, 10.3, -3.1, {
        seg: false,
        grime: 0.6,
      });
      const up = PF.texMat(
        "bm_deckdoor",
        PF.signTex("bm_deckdoor", ["BRIDGE DECK ↑"], "enamel", 512, 128, {
          bg: "#1d4a3a",
        }),
        { rough: 0.8 },
      );
      b.quad(up, -25.0, 10.8, -3.9, 1.6, 0.4, { ry: -HP });

      // ------------------------------------------------------------------ PIER WORKS (y -6)
      const y0 = -6;
      // pump hall floor (with the sunken water channel z -37..-33)
      b.boxMM("concrete_dark", -22, y0 - 0.4, -44, 8, y0, -37, { grime: 0.7 });
      PF.colMM(-22, y0 - 1, -44, 8, y0, -37, {});
      b.boxMM("concrete_dark", -22, y0 - 0.4, -33, 8, y0, -26, { grime: 0.7 });
      PF.colMM(-22, y0 - 1, -33, 8, y0, -26, {});
      b.boxMM("concrete_dark", -22, y0 - 1.0, -37, 8, y0 - 0.5, -33, {
        grime: 0.9,
      });
      PF.colMM(-22, y0 - 1.5, -37, 8, y0 - 0.5, -33, { surface: "water" });
      b.boxMM("water", -22, y0 - 0.12, -37, 8, y0 - 0.1, -33, {
        seg: false,
        noAO: true,
        grime: 0,
      });
      for (const x of [-16, -4, 4]) {
        b.boxMM("diamond", x - 1, y0 - 0.05, -37.2, x + 1, y0 + 0.02, -32.8, {
          seg: false,
        });
        PF.colMM(x - 1, y0 - 0.5, -37.2, x + 1, y0 + 0.02, -32.8, {
          surface: "metal",
        });
      }
      PF.wall(
        b,
        "brick_dark",
        "x",
        -22.8,
        8.8,
        -26,
        -25.2,
        y0,
        3,
        [{ c: -12, w: 2.8, y0, h: 7 }],
        {},
      );
      PF.wall(b, "brick_dark", "x", -22.8, 8.8, -44.8, -44, y0, 3, [], {});
      PF.wall(
        b,
        "brick_dark",
        "z",
        -44.8,
        -25.2,
        -22.8,
        -22,
        y0,
        3,
        [{ c: -35.5, w: 4, y0, h: 4 }],
        {},
      );
      PF.wall(
        b,
        "brick_dark",
        "z",
        -44.8,
        -25.2,
        8,
        8.8,
        y0,
        3,
        [{ c: -37.8, w: 3, y0, h: 3.4 }],
        {},
      );
      BK.barrelX(b, "brick_dark", -22.8, 8.8, -35, 9.1, -3, 0.58, { tile: 3 });
      // three great pumps along the south wall, pipes to the generator
      for (const x of [-16, -6, 4]) {
        b.cyl("iron", x, y0, -28.5, 1.3, 1.5, 3.2, 14, { hSeg: 2, grime: 0.7 });
        b.cyl("rust", x, y0 + 3.2, -28.5, 0.9, 1.3, 0.8, 14, { hSeg: 1 });
        b.cyl("iron", x, y0 + 1.6, -28.5, 0.4, 0.4, 3.4, 8, {
          rx: HP,
          hSeg: 1,
        });
        b.rod(
          "rust",
          V3(x, y0 + 0.4, -30.1),
          V3(x, y0 + 0.4, -33),
          0.35,
          8,
          {},
        );
        PF.col(x, -28.5, 3.0, 3.0, y0, y0 + 4, 0, { walkable: false });
      }
      b.rod(
        "rust",
        V3(-18, y0 + 2.4, -30.6),
        V3(8.5, y0 + 2.4, -30.6),
        0.45,
        10,
        {},
      );
      b.rod(
        "iron",
        V3(-18, y0 + 3.4, -41.8),
        V3(8.5, y0 + 3.4, -41.8),
        0.3,
        8,
        {},
      );
      D.cable(
        b,
        [
          V3(-20, y0 + 3.6, -26.5),
          V3(-4, y0 + 3.8, -26.5),
          V3(8.4, y0 + 3.3, -26.5),
        ],
        0.5,
      );
      D.rubble(b, -18.5, y0, -42.2, 1.2, 6, 61);
      PF.skeleton(b, 1.5, y0 + 0.02, -41, 1.1);
      an.pumphall = A(-6, y0, -30, PI);
      // generator room (x 8.8..22, z -42..-30)
      b.boxMM("concrete_dark", 8.8, y0 - 0.4, -42, 22, y0, -30, { grime: 0.7 });
      PF.colMM(8.8, y0 - 1, -42, 22, y0, -30, {});
      PF.wall(b, "brick_dark", "x", 8.8, 22.8, -30, -29.2, y0, 0.5, [], {});
      PF.wall(b, "brick_dark", "x", 8.8, 22.8, -42.8, -42, y0, 0.5, [], {});
      PF.wall(
        b,
        "brick_dark",
        "z",
        -42.8,
        -29.2,
        22,
        22.8,
        y0,
        0.5,
        [{ c: -35.8, w: 2.6, y0, h: 3 }],
        {},
      );
      b.boxMM("concrete_dark", 8.8, 0.3, -42.8, 22.8, 0.8, -29.2, {
        grime: 0.7,
      });
      for (let x = 10; x < 22; x += 3)
        b.boxMM("iron", x - 0.2, -0.3, -42, x + 0.2, 0.3, -30, { seg: false });
      // the tidal turbine: casing, flywheel, conduits
      b.cyl("paint_teal", 15.4, y0 + 2.4, -36, 2.3, 2.3, 8.5, 20, {
        rx: HP,
        hSeg: 3,
        grime: 0.65,
      });
      b.cyl("iron", 15.4, y0 + 2.4, -40.6, 2.6, 2.6, 0.5, 20, {
        rx: HP,
        hSeg: 1,
      });
      b.cyl("rust", 15.4, y0 + 2.4, -31.6, 1.4, 1.4, 1.2, 16, {
        rx: HP,
        hSeg: 1,
      });
      b.boxMM("iron", 13.2, y0, -40.4, 17.6, y0 + 0.6, -31.6, { seg: false });
      PF.colMM(12.9, y0, -41, 17.9, y0 + 4.8, -31, { walkable: false });
      for (const z of [-39, -36, -33])
        b.rod(
          "rust",
          V3(17.6, y0 + 3.4, z),
          V3(21.8, y0 + 5.2, z),
          0.18,
          6,
          {},
        );
      // control panel (south wall)
      b.boxMM("paint_cream", 10, y0, -30.2, 13, y0 + 1.9, -29.3, {
        seg: false,
        grime: 0.6,
      });
      b.quad("screen", 11.5, y0 + 1.4, -30.22, 1.2, 0.5, {
        ry: PI,
        noAO: true,
      });
      for (let i = 0; i < 5; i++)
        b.cyl(
          "lamp_red",
          10.5 + i * 0.5,
          y0 + 0.95,
          -30.25,
          0.05,
          0.05,
          0.05,
          6,
          { rx: HP, hSeg: 1 },
        );
      an.generator = A(11.5, y0, -31.4, PI);
      an.gen_terminal = A(19.5, y0 + 0.9, -41.2, PI);
      b.boxMM("paint_cream", 18.7, y0, -41.9, 20.3, y0 + 0.9, -41.1, {
        seg: false,
      });
      PF.colMM(18.7, y0, -41.9, 20.3, y0 + 0.9, -41.1, { walkable: false });
      // river-hatch passage (x 22.8..32, z -37.1..-34.5)
      b.boxMM("concrete_dark", 22, y0 - 0.4, -37.1, 32.6, y0, -34.5, {
        grime: 0.7,
      });
      PF.colMM(22, y0 - 1, -37.1, 32.6, y0, -34.5, {});
      PF.wall(b, "brick_dark", "x", 22.8, 32.6, -37.9, -37.1, y0, -1.8, [], {});
      PF.wall(b, "brick_dark", "x", 22.8, 32.6, -34.5, -33.7, y0, -1.8, [], {});
      PF.wall(b, "brick_dark", "z", -37.9, -33.7, 32.6, 33.4, y0, -1.8, [], {});
      BK.barrelX(b, "brick_dark", 22.8, 32.6, -35.8, 1.3, -3.2, 0.9, {
        tile: 3,
      });
      for (let y = y0 + 0.4; y < y0 + 4; y += 0.45)
        b.box("iron", 32.3, y, -35.8, 0.08, 0.06, 1.0, { seg: false });
      for (const dz of [-0.5, 0.5])
        b.box("iron", 32.3, y0, -35.8 + dz, 0.08, 4.2, 0.08, { seg: false });
      b.sphere("lamp_red", 31.9, y0 + 3.5, -34.8, 0.12, {
        ws: 6,
        hs: 4,
        noAO: true,
      });
      PF.glow(W(31.9, y0 + 3.5, -34.8), 0xff3020, 1.2, cell.root, {
        intensity: 0.9,
      });
      an.river_hatch = A(31.2, y0, -35.8, HP);
      // nest cistern (x -38..-22.8, z -46..-28): pooled water, egg mounds, bones
      b.boxMM("concrete_dark", -38, y0 - 0.9, -46, -22, y0 - 0.5, -28, {
        grime: 0.9,
      });
      PF.colMM(-38, y0 - 1.5, -46, -22, y0 - 0.5, -28, { surface: "water" });
      b.boxMM("water", -38, y0 - 0.14, -46, -22.8, y0 - 0.12, -28, {
        seg: false,
        noAO: true,
        grime: 0,
      });
      PF.wall(b, "brick_dark", "x", -38.8, -22, -28, -27.2, y0 - 1, 3, [], {});
      PF.wall(b, "brick_dark", "x", -38.8, -22, -46.8, -46, y0 - 1, 3, [], {});
      PF.wall(
        b,
        "brick_dark",
        "z",
        -46.8,
        -27.2,
        -38.8,
        -38,
        y0 - 1,
        3,
        [],
        {},
      );
      BK.barrelZ(b, "brick_dark", -46.8, -27.2, -30.4, 7.6, -3, 0.62, {
        tile: 3,
      });
      const r = PF.rng(777);
      for (let i = 0; i < 7; i++) {
        const cx = -35 + r() * 10,
          cz = -44 + r() * 13;
        b.rock("rubble", cx, y0 - 0.5, cz, 1.2 + r() * 0.8, {
          flat: 0.35,
          rough: 0.4,
          seed: i,
        });
        for (let k = 0; k < 6; k++)
          b.sphere(
            "egg",
            cx + (r() - 0.5) * 1.6,
            y0 + 0.05 + r() * 0.25,
            cz + (r() - 0.5) * 1.6,
            0.22 + r() * 0.08,
            { ws: 8, hs: 6, sy: 1.25, noAO: true },
          );
        b.sphere("slime", cx, y0 - 0.2, cz, 1.3, {
          ws: 10,
          hs: 5,
          sy: 0.25,
          noAO: true,
        });
      }
      for (let i = 0; i < 4; i++)
        PF.glow(
          W(-35 + i * 2.8, y0 + 0.8, -42 + (i % 2) * 8),
          0x7aff40,
          2.0,
          cell.root,
          { intensity: 0.7, flicker: 0.1 },
        );
      PF.skeleton(b, -26.2, y0 - 0.45, -44.4, 0.6);
      b.box("paint_orange", -25.6, y0 - 0.45, -43.8, 0.5, 0.3, 0.35, {
        seg: false,
      }); // Dutch's toolbag
      an.dutch = A(-26.2, y0 - 0.4, -44.2, 0);
      an.nest = A(-30, y0 - 0.4, -38, 0);
      an.boss = A(-32, y0 - 0.5, -42, 0.3);
    });
    b.build(cell.root, { lodDistInt: 120 });

    // anchors: spawn points (Pier Works), loot, npcs
    Object.assign(an, {
      spawn1: A(-14, -6, -40, 0),
      spawn2: A(0, -6, -29.5, PI),
      spawn3: A(-30, -6.5, -40, 0),
      spawn4: A(-27, -6.5, -31.5, PI),
      spawn5: A(19.5, -6, -33, HP),
      spawn6: A(27, -6, -35.8, HP),
      loot1: A(3.5, 0, -15.4, 0),
      loot2: A(14, 0, -15.8, 0),
      loot3: A(-38.5, 8, 0.5, HP),
      loot4: A(20.8, -6, -30.8, PI),
      loot5: A(-26.8, -6.4, -43.2, 0),
      npc1: A(-33.7, 8, 5.1, PI),
      npc2: A(-4, 0, -6.6, 0),
      npc3: A(-21, 0, -6, 0),
      npc4: A(18, 0, -4.8, PI),
      npc5: A(-16, 0, 6.7, PI),
      guard1: A(-12, 0, -7.2, PI),
      guard2: A(-6, 0, 6.3, PI),
    });
    return an;
  }

  // ===================================================================
  // CONTENT — items, terminals, dialogue, quest
  // ===================================================================
  PF.item({
    id: "pbr_bm_fuse",
    type: "misc",
    name: "Tidal Governor Fuse",
    weight: 0.5,
    value: 40,
    quest: true,
    desc: 'A ceramic cartridge fuse the size of a rolling pin, stencilled FIVE BOROUGHS — TIDAL GOVERNOR — 600A. Someone scratched "SPARE — DUTCH" into the glaze.',
  });
  PF.item({
    id: "pbr_bm_storekey",
    type: "key",
    name: "Bridgemarket Storeroom Key",
    weight: 0,
    value: 0,
    desc: "A brass key on a loop of fishing line, stamped B.M. — STORES.",
  });
  PF.item({
    id: "pbr_reel_dutch",
    type: "tape",
    name: "Tape reel: Dutch Varga",
    title: "Dutch Varga — Pier Works Log",
    text: "[Water sloshing. A wrench taps on metal, three times, like knocking.]\n\nDUTCH: Log. Day... whatever. The governor fuse cooked again. Third one this year. River's too warm — the turbine runs hot, the fuse runs hotter. I brought the spare. Always bring the spare.\n\n[Clicking. Distant, then less distant.]\n\nDUTCH: The cistern's full of eggs. That's new. That's... Ruth is going to love that. Okay. Okay. Fuse first, then crabs. No — crabs first. No—\n\n[A heavy splash. Clicking, very close. The recording keeps running for a long time.]\n\nDUTCH (whispering): Spare's in my bag. Somebody tell Ruth the spare's in my bag.\n\n[Recording ends.]",
  });
  PF.item({
    id: "pbr_note_guastavino",
    type: "note",
    name: "Guastavino Co. — Tile Specification",
    title:
      "R. Guastavino Company — Specification for the Bridge Market Vaults (1914)",
    text: "SYSTEM: Timbrel (tile) vault, three courses, laid in herringbone with quick-setting Portland cement.\n\nThe first course is laid without centering — each tile holds the one before it until the mortar takes. The vault builds itself out of thin air, one hand-width at a time. Clients ask where the steel is. There is no steel. The tiles ARE the structure.\n\nLIVE LOAD: sufficient for a public market, two hundred carts, and a brass band.\n\n[Pencilled beneath, in a much later hand:] Also sufficient for one (1) atomic war. We checked. — R.O.",
  });
  PF.item({
    build() {
      const base = PF.live("items") ? G.items.get("magnum_44") : null;
      const w =
        base && base.weapon
          ? Object.assign({}, base.weapon, {
              damage: Math.round((base.weapon.damage || 40) * 1.2),
              critChance: (base.weapon.critChance || 1) * 1.6,
              spread: (base.weapon.spread || 0.02) * 0.75,
              condDecay: (base.weapon.condDecay || 0.003) * 0.5,
            })
          : undefined;
      return {
        id: "pbr_groovy",
        type: w ? "weapon" : "misc",
        name: "Feelin' Groovy",
        weight: 4,
        value: 1100,
        unique: true,
        icon: base ? base.icon : undefined,
        desc: 'A .44 revolver with hand-painted daisies up the barrel and "59" carved in the grip. Ruth Adebayo carried it across the Queensboro the day she founded the market. Hits harder, crits more, and never seems to jam.',
        weapon: w,
      };
    },
  });

  PF.terminal("pbr_bm_ledger", {
    title: "BRIDGEMARKET — MARKET LEDGER",
    header:
      'MERIDIAN TELELINK — OWNER: R. OKAFOR\n"UNDER THE BRIDGE, OVER THE ODDS"',
    entries: [
      {
        title: "Market Safe",
        learn: "pbr_bm_safe",
        text: "Market safe (stores key, rent box): 5-9-0-9. Fifty-ninth street, the year they built the bridge. Ruth says nobody would guess it. Lou guessed it.",
      },
      {
        title: "Charter of the Bridgemarket",
        text: 'We, the undersigned, being cold, wet and tired of being shot at, hereby found a market under the Queensboro Bridge.\n\n1. Any trader may rent a stall. Rent is 5 scrip a week or one useful thing.\n2. No raiders. No slavers. No Brutes, "even the nice one".\n3. The vaults are older than all of us and will outlive all of us. Do not hang anything heavy from them.\n4. Disputes are settled by the Mayor, or failing that, by Kowalski.\n\n— R. Adebayo, Mayor (elected, 31 votes to 2)',
      },
      {
        title: "Power — Tidal Generator",
        text: "The old-world Five Boroughs tidal governor under the Manhattan pier still spins with the river. When it runs, we have lights, the water pumps, and Lou's cooler hums. When it doesn't, we have candles and complaints.\n\nDutch went down to replace the governor fuse 6 days ago. Dutch has not come back up. The pumps are running on the hand crank. Morty says there is clicking in the drains.",
      },
      {
        title: "Trade Notes",
        text: "Grand Central Market: buys our tile salvage, sells us meds.\nThe Neon: buys anything that glows. Do not ask.\nChinatown: pays for river mussels, bad debts.\n\nCaravan from Canal Street overdue. Tomas Ybarra swore he'd be here by the new moon. Tomas is never late. Lou says the Brutes took the Manhattan Bridge anchorage for a larder. I am choosing not to believe Lou until I have to.",
      },
      {
        title: "Personal",
        text: 'Twenty years ago my grandmother walked me across this bridge on her shoulders. The top half of the bridge was full of dead cars and the bottom half was full of live raiders. She said: "Look up, baby." So I looked up, and there were the tiles.\n\nPeople built something beautiful here once, for no better reason than they could. We can too.',
      },
    ],
  });
  PF.terminal("pbr_bm_governor", {
    title: "FIVE BOROUGHS — TIDAL GOVERNOR 3",
    header:
      "FIVE BOROUGHS POWER COMPANY OF NEW YORK\nQUEENSBORO PIER WORKS — TIDAL GOVERNOR 3",
    lock: 0,
    entries: [
      {
        title: "Status",
        text: () =>
          PF.flag("bm_power")
            ? "TURBINE: 212 RPM\nGOVERNOR: NOMINAL\nOUTPUT: 41 kW → BRIDGE MARKET BUS\n\nHave a safe day!"
            : "TURBINE: 0 RPM\nGOVERNOR: FAULT 0x3F — FUSE OPEN CIRCUIT\nOUTPUT: 0 kW\n\nReplace governor fuse (part CE-600A) and cycle the main breaker.",
      },
      {
        title: "Maintenance Log (1967)",
        text: '03.01 — River temp +2.1°C over seasonal. Blade fouling (mussels). Scraped.\n03.03 — Management asks if the tidal units can "run without staff for extended periods". Told them they can run without staff for a century if nobody touches them. Management seemed relieved.\n03.05 — [NO ENTRY]',
      },
      {
        title: "Log — D. Varga (1989)",
        text: "Found this terminal still running under an inch of silt. Beautiful machine. Nobody builds anything to last anymore, except apparently the people who built everything that lasted.\n\nSpare governor fuse kept in my bag. If you are reading this and I am not standing next to you, find my bag.",
      },
    ],
  });

  // --- dialogue: Mayor Ruth Adebayo ---
  PF.dialogue("pbr_dlg_ruth", {
    start: () => {
      if (PF.q.active("pbr_current") && PF.q.stage("pbr_current") === "report")
        return "report";
      if (PF.q.complete("pbr_current")) return "after";
      if (PF.q.active("pbr_current")) return "progress";
      return PF.flag("bm_met_ruth") ? "again" : "first";
    },
    nodes: {
      first: {
        speaker: "Ruth Adebayo",
        text: "Welcome to the Bridgemarket — mind the drips, those are just the river, probably. I'm Ruth Adebayo. Mayor, landlady, and the only person down here who reads the ledger. You're not a raider, you're not a Brute, and you haven't tried to sell me a giant roach as \"mystery chicken\". That already makes you my favourite customer today.",
        onEnter() {
          PF.setFlag("bm_met_ruth", true);
        },
        responses: [
          { text: "What is this place?", next: "place" },
          { text: "You look like you have a problem.", next: "problem" },
          { text: "Just passing through." },
        ],
      },
      place: {
        speaker: "Ruth Adebayo",
        text: "Before the war it was a market under the Queensboro Bridge — they built it in 1914 and it outlived every shop that ever rented it. Look up. Those are Guastavino tile vaults: three layers of tile thinner than your thumb, no steel at all. The blast up north knocked down half of Harlem and never cracked a single one. So we moved in under them. Seemed like the smart thing.",
        responses: [
          { text: "You look like you have a problem.", next: "problem" },
          { text: "Nice place. Goodbye." },
        ],
      },
      problem: {
        speaker: "Ruth Adebayo",
        text: "Sharp eyes. There's an old-world tidal generator under the Manhattan pier — the Pier Works. It gives us light, pumps our water, keeps Lou's beer cold. It died six days ago. My engineer, Dutch Varga, went down to fix it. Dutch hasn't come back up, and now there's clicking in the drains. Get that turbine turning again and I'll make it worth your while.",
        responses: [
          {
            text: "I'll go down and have a look.",
            action: () => startCurrent(),
            next: "go",
          },
          { text: "Worth my while how?", next: "pay" },
          {
            text: "[Persuasion 40] Clicking means shellbacks. That's hazard pay.",
            check: { skill: "persuasion", value: 40 },
            next: "hazard",
            failNext: "hazard_fail",
          },
          { text: "Not my problem." },
        ],
      },
      pay: {
        speaker: "Ruth Adebayo",
        text: "One hundred and fifty scrip from the market chest, free patching from Doc Hattie for as long as you live — which, if you go down there, may not be long — and something of mine I've been saving for someone worth giving it to.",
        responses: [
          { text: "Deal.", action: () => startCurrent(), next: "go" },
          { text: "I'll think about it." },
        ],
      },
      hazard: {
        speaker: "Ruth Adebayo",
        text: "Shellbacks. Of course it's shellbacks. [She sighs and counts out scrip.] Fifty now, as hazard pay, the rest when the lights come on. Don't tell Kowalski I negotiate.",
        onEnter() {
          PF.inv.addScrip(50);
        },
        responses: [
          {
            text: "Pleasure doing business.",
            action: () => startCurrent(),
            next: "go",
          },
        ],
      },
      hazard_fail: {
        speaker: "Ruth Adebayo",
        text: 'Nice try. Everybody gets hazard pay down here — it\'s called "being alive at the end of the week". The offer stands.',
        responses: [
          { text: "Fine. I'll go.", action: () => startCurrent(), next: "go" },
          { text: "Maybe later." },
        ],
      },
      go: {
        speaker: "Ruth Adebayo",
        text: "The stair's off the north corridor, past the guard — tell Moss I sent you. The turbine room is at the east end of the pump hall. If you find Dutch... if you find Dutch, bring him home. Or bring me something of his.",
        responses: [{ text: "I'll be back." }],
      },
      progress: {
        speaker: "Ruth Adebayo",
        text: () =>
          PF.flag("bm_power")
            ? "The lights are on — I can hear the pumps from here. Come tell me what you found."
            : "Still dark down there? The stair's off the north corridor. Please hurry — Lou is threatening to open the warm beer.",
        responses: [{ text: "Working on it." }],
      },
      report: {
        speaker: "Ruth Adebayo",
        text: () =>
          PF.inv.count("pbr_reel_dutch") > 0 || PF.flag("bm_dutch")
            ? 'The lights came on and half the market cheered and the other half cried, because they thought it meant Dutch was back. [You hand her the tape reel. She listens to it twice.] "Always bring the spare." Stubborn old goat. Thank you for bringing him home.'
            : "Listen to that. Pumps, lights, and Lou's cooler humming like a choir. You did it. And Dutch? ...No. Don't tell me. I think I already know.",
        responses: [
          {
            text: "He kept the market running to the end.",
            action: () => finishCurrent(),
            next: "reward",
          },
        ],
      },
      reward: {
        speaker: "Ruth Adebayo",
        text: "This was mine. I carried it across the bridge the day we founded the market — the daisies were my grandmother's idea of a joke. \"Feelin' Groovy,\" she called it. Take it. And tell Doc Hattie your patching's on the house, forever.",
        responses: [{ text: "Thank you, Mayor." }],
      },
      again: {
        speaker: "Ruth Adebayo",
        text: "Back again? The market's still dark and I still need a hero, or failing that, someone who owns a flashlight.",
        responses: [
          { text: "Tell me about the generator.", next: "problem" },
          { text: "Tell me about this place.", next: "place" },
          { text: "Later." },
        ],
      },
      after: {
        speaker: "Ruth Adebayo",
        text: "Our favourite electrician! Everyone on the bridge knows your name now. Mostly they get it wrong, but with great affection.",
        responses: [
          { text: "Any news?", next: "news" },
          { text: "Tell me about this place.", next: "place" },
          { text: "Take care, Ruth." },
        ],
      },
      news: {
        speaker: "Ruth Adebayo",
        text: () =>
          PF.q.complete("pbr_anchor")
            ? "Tomas Ybarra is back running the Canal Street trade wagon — he tells everybody you walked into a Brute larder and walked out with him. I let him exaggerate. It's good for business."
            : "The Canal Street trade wagon is still missing. Lou swears the Brutes are keeping people in the Manhattan Bridge anchorage like canned goods. If anybody could find out, it's you.",
        responses: [
          {
            text: "I'll look into it.",
            action: () => {
              if (!PF.q.started("pbr_anchor")) PF.q.start("pbr_anchor");
            },
          },
          { text: "Goodbye." },
        ],
      },
    },
  });
  function startCurrent() {
    if (!PF.q.started("pbr_current")) PF.q.start("pbr_current");
    PF.q.advance("pbr_current", ["talk"], "works");
  }
  function finishCurrent() {
    if (PF.inv.count("pbr_reel_dutch") > 0) {
      PF.inv.remove("pbr_reel_dutch", 1);
      PF.setFlag("bm_dutch", true);
      PF.standing(10, "Brought Dutch home");
    }
    PF.inv.add("pbr_groovy", 1);
    PF.setFlag("bm_heal_free", true);
    PF.q.done("pbr_current");
    PF.news(
      'The lights are back on at the Bridgemarket under the Queensboro Bridge. Mayor Adebayo credits a mysterious stranger, the river, and "several hundred very angry crabs, now deceased."',
    );
  }

  // --- the generator (actor-less dialogue) ---
  PF.dialogue("pbr_dlg_generator", {
    start: () => (PF.flag("bm_power") ? "on" : "off"),
    nodes: {
      off: {
        speaker: "Tidal Governor 3",
        text: () =>
          "The control panel is dark except for one red lamp blinking FAULT 0x3F. Behind a cracked inspection glass, the governor fuse holder is empty and scorched." +
          (PF.inv.count("pbr_bm_fuse") > 0
            ? " Dutch's spare fuse would fit."
            : ""),
        onEnter() {
          PF.q.advance("pbr_current", ["talk", "works"], "fix");
        },
        responses: [
          {
            text: "Fit Dutch's spare fuse and throw the breaker.",
            cond: () => PF.inv.count("pbr_bm_fuse") > 0,
            action: () => {
              PF.inv.remove("pbr_bm_fuse", 1);
              powerOn("fuse");
            },
          },
          {
            text: "[Mechanics 50] Bridge the fuse holder with scrap copper and throw the breaker.",
            check: { skill: "mechanics", value: 50 },
            cond: () => PF.inv.count("pbr_bm_fuse") === 0,
            action: () => powerOn("repair"),
            failNext: "fail",
          },
          {
            text: "[Electronics 60] Reroute the governor through the backup bus.",
            check: { skill: "electronics", value: 60 },
            cond: () => PF.inv.count("pbr_bm_fuse") === 0,
            action: () => powerOn("science"),
            failNext: "fail",
          },
          {
            text: "Leave it.",
            action: () => {
              if (!PF.flag("bm_fuse_hint")) {
                PF.setFlag("bm_fuse_hint", true);
                G.notify(
                  "Dutch Varga went down with a spare fuse. It must be somewhere in the Pier Works.",
                );
              }
            },
          },
        ],
      },
      fail: {
        speaker: "Tidal Governor 3",
        text: "Sparks bite your fingers and the breaker kicks straight back out. This needs the proper fuse.",
        responses: [{ text: "Leave it." }],
      },
      on: {
        speaker: "Tidal Governor 3",
        text: "The turbine thrums behind its casing. Every lamp on the panel is green.",
        responses: [{ text: "Leave it." }],
      },
    },
  });
  function powerOn(how) {
    if (PF.flag("bm_power")) return;
    PF.setFlag("bm_power", true);
    PF.sfx("hum_electric", PF.anchorOf("queensboro_bridge", "generator"), {
      volume: 0.9,
    });
    PF.sfx("terminal_success");
    G.notify(
      "The turbine groans, catches the tide, and spins up. Somewhere overhead, a whole market cheers.",
    );
    PF.xp(how === "fuse" ? 150 : 200, "Restarted the tidal generator");
    if (!PF.q.started("pbr_current")) PF.q.start("pbr_current");
    PF.q.set("pbr_current", "report");
    applyPower();
  }
  PF.quest({
    id: "pbr_current",
    name: "Current Events",
    giver: "Ruth Adebayo",
    location: "Queensboro Bridge & Bridgemarket",
    desc: "The tidal generator under the Queensboro Bridge powers the Bridgemarket's lights and pumps. It has stopped, and the engineer sent to fix it never came back.",
    stages: [
      {
        id: "talk",
        text: "Talk to Mayor Ruth Adebayo in the Bridgemarket.",
        markers: () => [{ x: 316, z: -422, label: "Bridgemarket" }],
      },
      {
        id: "works",
        text: "Go down to the Pier Works beneath the Bridgemarket.",
        markers: () => {
          const a = PF.anchorOf(KEY, "stair_top");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Pier Works stair",
                  interior: KEY,
                },
              ]
            : [];
        },
      },
      {
        id: "dutch",
        text: "(Optional) Find out what happened to Dutch Varga.",
        optional: true,
        sideObjective: true,
        doneIf: () =>
          PF.inv.count("pbr_reel_dutch") > 0 || !!PF.flag("bm_dutch"),
        markers: () => {
          const a = PF.anchorOf(KEY, "dutch");
          return a
            ? [{ x: a.x, z: a.z, y: a.y, label: "Dutch Varga", interior: KEY }]
            : [];
        },
      },
      {
        id: "fix",
        text: "Restart the tidal generator in the Pier Works.",
        markers: () => {
          const a = PF.anchorOf(KEY, "generator");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Tidal Governor",
                  interior: KEY,
                },
              ]
            : [];
        },
      },
      {
        id: "report",
        text: "Return to Ruth Adebayo.",
        markers: () => [{ npc: "pbr_bm_ruth", label: "Ruth Adebayo" }],
      },
    ],
    rewards: { xp: 350, scrip: 150, standing: 15 },
  });

  // --- merchants & residents ---
  PF.dialogue("pbr_dlg_sol", {
    start: "root",
    nodes: {
      root: {
        speaker: "Morty Weintraub",
        text: () =>
          PF.flag("bm_power")
            ? "Lights! Real lights! I can finally see how bad my merchandise looks. What'll it be?"
            : "Morty's Sundries: if I don't have it, you don't need it, and if you need it, I'll find it by Tuesday. What'll it be?",
        responses: [
          { text: "Let's trade.", barter: true },
          { text: "How long have you been down here?", next: "bridge" },
          { text: "See you, Morty." },
        ],
      },
      bridge: {
        speaker: "Morty Weintraub",
        text: "Since March 5th, 1967, 9:47 in the morning. I was in a Strato-Eight on the upper level of this bridge, doing four miles an hour toward Queens, when the sky went white. Traffic hasn't moved since. Twenty-two years in the same jam — I'm told that's a record even for the Queensboro. When the radiator boiled dry I figured I'd walk the rest of the way. Got as far as down here.",
        responses: [{ text: "That's... one way to commute.", next: "root" }],
      },
    },
  });
  PF.dialogue("pbr_dlg_hattie", {
    start: "root",
    nodes: {
      root: {
        speaker: "Doc Hattie Lin",
        text: () =>
          PF.flag("bm_heal_free")
            ? "My favourite patient. Sit, sit. It's on the house — Ruth's orders, and honestly, mine."
            : "Doc Hattie. I stitch, I splint, I pull bullets and I never ask how they got there. What hurts?",
        responses: [
          {
            text: () =>
              PF.flag("bm_heal_free")
                ? "Patch me up. (Free)"
                : "Patch me up. (40 scrip)",
            action: () => doctor("heal"),
          },
          {
            text: () =>
              PF.flag("bm_heal_free")
                ? "Flush the radiation. (Free)"
                : "Flush the radiation. (80 scrip)",
            action: () => doctor("rads"),
          },
          { text: "I need supplies.", barter: true },
          { text: "Nothing, thanks." },
        ],
      },
    },
  });
  function doctor(what) {
    const cost = PF.flag("bm_heal_free") ? 0 : what === "heal" ? 40 : 80;
    if (cost && !PF.inv.pay(cost)) {
      G.notify("You can't afford that.");
      return;
    }
    const P = G.player;
    if (!P) return;
    if (what === "heal") {
      try {
        P.heal(P.maxHp);
      } catch (e) {
        /* core */
      }
      PF.sfx("inject");
      G.notify("Doc Hattie patches you up. HP restored.");
    } else {
      try {
        if (P.rads > 0) P.addRads(-P.rads);
      } catch (e) {
        /* core */
      }
      PF.sfx("iodine_tabs");
      G.notify(
        "Doc Hattie doses you with Prussian Blue and a lecture. Radiation removed.",
      );
    }
  }
  PF.dialogue("pbr_dlg_benny", {
    start: "root",
    nodes: {
      root: {
        speaker: 'Lou "Two-Tone" Mazur',
        text: () =>
          PF.flag("bm_power")
            ? 'Welcome to The Span! Cold beer, warm cakes, lukewarm conversation. The cooler\'s humming again, so the beer is officially "cold-adjacent".'
            : "Welcome to The Span. Beer's warm, cakes are cold, generator's dead. I'm doing my best here.",
        responses: [
          { text: "What's on the menu?", barter: true },
          { text: "Heard any rumours?", next: "rumour" },
          { text: 'Why "Two-Tone"?', next: "name" },
          { text: "Later, Lou." },
        ],
      },
      rumour: {
        speaker: 'Lou "Two-Tone" Mazur',
        text: "The Canal Street trade wagon — Tomas Ybarra and his guards — never showed. Last anybody saw, they were crossing under the Manhattan Bridge arch. And you know what's in the Manhattan Bridge anchorage? Brutes. Big ones. They pack people away in there like canned hams. Tomas owes me forty scrip, so I'd really prefer he wasn't a ham.",
        onEnter() {
          if (!PF.q.started("pbr_anchor") && !PF.q.complete("pbr_anchor"))
            PF.q.start("pbr_anchor");
        },
        responses: [
          { text: "I'll check the anchorage.", next: "root" },
          { text: "Not my business.", next: "root" },
        ],
      },
      name: {
        speaker: 'Lou "Two-Tone" Mazur',
        text: "[He props a foot on the rail: a brown-and-white wing-tip spectator, polished to a mirror.] Florsheim, 1966. Twenty-two years and not a scuff. A man can lose his city, his car and his hair, but he does not lose his standards.",
        responses: [{ text: "Sharp shoes.", next: "root" }],
      },
    },
  });
  PF.dialogue("pbr_dlg_kowalski", {
    start: "root",
    nodes: {
      root: {
        speaker: "Wanda Kowalski",
        text: "Kowalski's. Guns, ammo, and the only returns policy on the bridge: if it jams, I shoot you with a better one. What are we buying?",
        responses: [
          { text: "Show me your guns.", barter: true },
          { text: "Who keeps the peace here?", next: "peace" },
          { text: "Just looking." },
        ],
      },
      peace: {
        speaker: "Wanda Kowalski",
        text: 'Moss and his watchmen, the ramp sentries, and me — I settle "disputes". Ruth writes the rules, I underline them. You\'ll notice nobody has broken a rule in a while.',
        responses: [{ text: "Noted.", next: "root" }],
      },
    },
  });
  PF.dialogue("pbr_dlg_guard", {
    start: "root",
    nodes: {
      root: {
        speaker: "Moss, Bridgemarket Watch",
        text: () =>
          PF.flag("bm_power")
            ? "Power's back, crabs are dead, and I finally got a full night's sleep. You're all right, stranger."
            : "Stairs go down to the Pier Works. Nobody goes down since Dutch. You hear the clicking? That's not the pipes.",
        responses: [
          {
            text: "Ruth sent me.",
            cond: () => PF.q.active("pbr_current") && !PF.flag("bm_power"),
            next: "sent",
          },
          { text: "Stay safe." },
        ],
      },
      sent: {
        speaker: "Moss, Bridgemarket Watch",
        text: "Then go with God, and with a shotgun if you've got one. The pump hall floods up to the ankles, and the cistern at the west end is where the eggs are. Don't go in the cistern.",
        responses: [{ text: "Thanks." }],
      },
    },
  });

  const powerGlows = [];
  function applyPower() {
    const pow = !!PF.flag("bm_power");
    for (const rec of powerGlows)
      if (rec && rec.sprite) rec.sprite.visible = pow;
  }
  PF.flagWatch.push((k) => {
    if (k === "*" || k === "bm_power") applyPower();
  });
  PF.onReset.push(() => applyPower());

  // ===================================================================
  // BUILDER
  // ===================================================================
  PF.addBuilder(
    KEY,
    function (PF2, site, root) {
      const ext = PF.buildQueensboroExterior(root);
      const cell = PF.cell(KEY);
      const int = buildInterior(cell);
      // power-dependent extra glows (brighter market once the generator runs)
      for (const [x, y, z] of [
        [-12, 4.6, 0],
        [4, 4.6, 0],
        [20, 4.6, 0],
        [-20, 4.6, -4],
        [12, 4.6, 4],
        [15.4, -1.2, -36],
        [-6, -1.5, -35],
      ]) {
        powerGlows.push(
          PF.glow(W(x, y, z), 0xffe0a0, 3.0, cell.root, { intensity: 0.9 }),
        );
      }
      PF.onInitDone.push(applyPower);
      // doors: street ↔ hall; deck kiosk ↔ tower landing; river hatch ↔ pier landing
      PF.door({
        id: "pbr_bm_in",
        pos: V3(ext.market_door.x, 1.6, -423.4),
        label: "Bridgemarket",
        verb: "Enter",
        radius: 1.8,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pbr_bm_out",
        pos: W(-4, 1.6, 7.6),
        label: "59th Street",
        verb: "Exit",
        radius: 1.6,
        target: {
          x: ext.market_door.x,
          y: 0.05,
          z: ext.market_door.z,
          yaw: PI,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pbr_bm_deck_in",
        pos: V3(ext.deck_hatch.x - 1.2, 23.3, ext.deck_hatch.z),
        label: "Bridgemarket — Stairs Down",
        verb: "Enter",
        radius: 1.3,
        target: {
          x: int.deck_door.x - 0.8,
          y: int.deck_door.y + 0.05,
          z: int.deck_door.z,
          yaw: HP,
        },
        sound: "door_open",
      });
      PF.door({
        id: "pbr_bm_deck_out",
        pos: W(-25.1, 9.3, -3.9),
        label: "Queensboro Bridge — Upper Deck",
        verb: "Climb to",
        radius: 1.3,
        target: {
          x: ext.deck_hatch.x,
          y: ext.deck_hatch.y + 0.05,
          z: ext.deck_hatch.z,
          yaw: -HP,
        },
        sound: "door_open",
      });
      // one-way: the river hatch is bolted from inside until the player climbs out that way (not a lock)
      const hatchIn = PF.barDoor(
        PF.door({
          id: "pbr_bm_hatch_in",
          pos: V3(345.2, 1.5, -442.9),
          label: "Pier Works — Service Hatch",
          verb: "Enter",
          radius: 1.3,
          target: {
            x: int.river_hatch.x - 0.6,
            y: int.river_hatch.y + 0.05,
            z: int.river_hatch.z,
            yaw: HP,
          },
          sound: "door_open",
        }),
        {
          lockText: "Bolted from inside",
          message: "The service hatch is bolted from the inside.",
        },
      );
      PF.door({
        id: "pbr_bm_hatch_out",
        pos: W(32.1, -4.6, -35.8),
        label: "East River Landing",
        verb: "Climb to",
        radius: 1.3,
        target: {
          x: ext.pier_hatch.x,
          y: ext.pier_hatch.y + 0.05,
          z: ext.pier_hatch.z,
          yaw: HP,
        },
        sound: "door_open",
        onEnter: () => {
          if (hatchIn && hatchIn.unbar) hatchIn.unbar();
        },
      });

      const all = Object.assign({}, int, {
        exterior_entrance: ext.market_door,
        deck_hatch: ext.deck_hatch,
        ramp_foot: ext.ramp_foot,
        ramp_top: ext.ramp_top,
        deck_mid: ext.deck_mid,
        broken_end: ext.broken_end,
        island_stair: ext.island_stair,
        pier_hatch: ext.pier_hatch,
      });
      PF.register(KEY, root, all, {
        interiorRoot: cell.root,
        interiorKey: KEY,
      });

      // interactions: generator panel, storeroom gate
      PF.use({
        pos: W(11.5, -4.6, -30.1),
        radius: 1.1,
        range: 2.6,
        label: "Tidal Governor 3",
        verb: () => (PF.flag("bm_power") ? "Examine" : "Repair"),
        onInteract() {
          if (PF.live("dialogue") && G.dialogue.start)
            G.dialogue.start("pbr_dlg_generator", null, {
              name: "Tidal Governor 3",
            });
          else if (PF.inv.count("pbr_bm_fuse") > 0) {
            PF.inv.remove("pbr_bm_fuse", 1);
            powerOn("fuse");
          } else G.notify("The governor fuse is blown.");
        },
      });
      buildStoreGate(cell, int);

      // props & pickups
      PF.prop("terminal", {
        x: int.terminal.x,
        y: int.terminal.y,
        z: int.terminal.z,
        yaw: 0,
        terminalId: "pbr_bm_ledger",
        id: "pbr_bm_term_ledger",
      });
      PF.prop("terminal", {
        x: int.gen_terminal.x,
        y: int.gen_terminal.y,
        z: int.gen_terminal.z,
        yaw: PI,
        terminalId: "pbr_bm_governor",
        id: "pbr_bm_term_gov",
      });
      PF.prop("safe", {
        x: int.loot3.x,
        y: int.loot3.y,
        z: int.loot3.z,
        yaw: HP,
        locked: 0,
        lock: PF.LOCKS.bm_safe,
        owner: "settlers",
        items: [
          ["scrip", 220],
          ["rally_tonic", 2],
          ["pbr_bm_storekey", 1],
          ["old_dollars", 6],
        ],
        id: "pbr_bm_ruth_safe",
        name: "Mayor's Safe",
      });
      PF.prop("footlocker", {
        x: int.loot1.x,
        y: int.loot1.y,
        z: int.loot1.z,
        yaw: 0,
        loot: "footlocker",
        owner: "settlers",
        id: "pbr_bm_store1",
        name: "Market Stores",
      });
      PF.prop("ammo_box", {
        x: int.loot1.x + 1.4,
        y: int.loot1.y,
        z: int.loot1.z + 0.4,
        loot: "ammo_box",
        owner: "settlers",
        id: "pbr_bm_store2",
      });
      PF.prop("footlocker", {
        x: int.loot2.x,
        y: int.loot2.y,
        z: int.loot2.z,
        yaw: 0,
        loot: "footlocker",
        owner: "settlers",
        id: "pbr_bm_bunk1",
        name: "Watchman's Footlocker",
      });
      PF.prop("first_aid", {
        x: O.x - 23.6,
        y: O.y + 1.4,
        z: O.z - 5.5,
        yaw: -HP,
        loot: "first_aid",
        owner: "settlers",
        id: "pbr_bm_clinic_kit",
      });
      PF.prop("toolbox", {
        x: int.loot4.x,
        y: int.loot4.y,
        z: int.loot4.z,
        yaw: PI,
        loot: "toolbox",
        id: "pbr_bm_gen_tools",
        name: "Five Boroughs Toolbox",
      });
      PF.prop("cash_register", {
        x: O.x + 21.6,
        y: O.y + 1.16,
        z: O.z - 3.1,
        yaw: PI,
        loot: "cash_register",
        owner: "settlers",
        id: "pbr_bm_register",
      });
      PF.prop("fizzo_machine", {
        x: O.x + 1.5,
        y: O.y,
        z: O.z + 7.2,
        yaw: PI,
        id: "pbr_bm_fizzo",
      });
      PF.prop("file_cabinet", {
        x: O.x - 39.3,
        y: O.y + 8,
        z: O.z + 5.5,
        yaw: HP,
        loot: "file_cabinet",
        owner: "settlers",
        id: "pbr_bm_files",
      });
      PF.pickup(
        "pbr_reel_dutch",
        1,
        V3(int.dutch.x + 0.5, int.dutch.y + 0.15, int.dutch.z + 0.3),
      );
      PF.pickup(
        "pbr_bm_fuse",
        1,
        V3(int.dutch.x + 0.7, int.dutch.y + 0.2, int.dutch.z + 0.6),
      );
      PF.pickup(
        "pbr_note_guastavino",
        1,
        V3(O.x - 33.2, O.y + 8.82, O.z + 3.0),
      );
      PF.pickup("rally_tonic", 1, V3(O.x + 20.4, O.y - 5.9, O.z - 41.2));
      PF.pickup("shellback_meat", 2, V3(O.x - 29, O.y - 6.2, O.z - 36));

      // NPCs — residents (friendly) and the Pier Works shellbacks
      const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
      PF.npc({
        id: "pbr_bm_ruth",
        type: "human",
        name: "Ruth Adebayo",
        outfit: "merchant",
        gender: "f",
        skinTone: 0.85,
        faction: "settlers",
        level: 8,
        pos: pos(int.npc_ruth),
        yaw: PI,
        ai: "guard",
        home: { x: int.npc_ruth.x, z: int.npc_ruth.z, r: 2 },
        dialogue: "pbr_dlg_ruth",
        essential: true,
        voice: "settler",
        seed: 5901,
        weapon: "pistol_10mm",
        barks: [
          "The vaults held. We'll hold.",
          "Rent is due Thursday. Every Thursday.",
          "Mind the tiles.",
        ],
      });
      PF.npc({
        id: "pbr_bm_sol",
        type: "human",
        name: "Morty Weintraub",
        outfit: "survivor_layers",
        gender: "m",
        faction: "settlers",
        level: 6,
        pos: pos(int.npc_sol),
        yaw: 0,
        ai: "merchant",
        home: { x: int.npc_sol.x, z: int.npc_sol.z, r: 1 },
        dialogue: "pbr_dlg_sol",
        essential: true,
        voice: "settler",
        seed: 5902,
        merchant: {
          scrip: 420,
          stock: [
            ["purified_water", 6],
            ["fizzo_cola", 4],
            ["golden_plain_jerky", 5],
            ["franks_and_beans", 4],
            ["scrap_metal", 12],
            ["duct_tape", 3],
            ["prussian_blue", 1],
            ["ammo_10mm", 40],
            ["scrap_metal", 5],
            ["dry_cell", 2],
          ],
          restock: 3,
        },
        barks: [
          "Everything must go! Mostly because of the smell.",
          "Twenty-two years in traffic. Worth it.",
          "Sundries! Get your sundries!",
        ],
      });
      PF.npc({
        id: "pbr_bm_hattie",
        type: "human",
        name: "Doc Hattie Lin",
        outfit: "doctor",
        gender: "f",
        skinTone: 0.35,
        faction: "settlers",
        level: 6,
        pos: pos(int.npc_hattie),
        yaw: 0,
        ai: "merchant",
        home: { x: int.npc_hattie.x, z: int.npc_hattie.z, r: 1.5 },
        dialogue: "pbr_dlg_hattie",
        essential: true,
        voice: "settler",
        seed: 5903,
        merchant: {
          scrip: 300,
          stock: [
            ["rally_tonic", 5],
            ["prussian_blue", 3],
            ["iodine_tabs", 3],
            ["morphine_syrette", 2],
            ["field_surgery_kit", 1],
            ["purified_water", 3],
          ],
          restock: 3,
        },
        barks: [
          "Next!",
          "Keep pressure on that.",
          "If it's glowing, don't touch it. If it's you, see me.",
        ],
      });
      PF.npc({
        id: "pbr_bm_benny",
        type: "human",
        name: 'Lou "Two-Tone" Mazur',
        outfit: "settler",
        gender: "m",
        faction: "settlers",
        level: 5,
        pos: pos(int.npc_benny),
        yaw: PI,
        ai: "merchant",
        home: { x: int.npc_benny.x, z: int.npc_benny.z, r: 1.5 },
        dialogue: "pbr_dlg_benny",
        essential: true,
        voice: "settler",
        seed: 5904,
        merchant: {
          scrip: 260,
          stock: [
            ["beer", 8],
            ["whiskey", 2],
            ["fizzo_cola", 6],
            ["prairie_root_beer", 4],
            ["shellback_cakes", 6],
            ["shellback_chowder", 3],
            ["coney_dog", 3],
            ["bodega_pretzel", 4],
          ],
          restock: 2,
        },
        barks: [
          "Order up!",
          "The Span: where the bridge meets your mouth.",
          "Shellback cakes! Fresher than they look!",
        ],
      });
      PF.npc({
        id: "pbr_bm_kowalski",
        type: "human",
        name: "Wanda Kowalski",
        outfit: "combat_armor",
        gender: "f",
        skinTone: 0.2,
        faction: "settlers",
        level: 9,
        pos: pos(int.npc_kowalski),
        yaw: PI,
        ai: "merchant",
        home: { x: int.npc_kowalski.x, z: int.npc_kowalski.z, r: 1 },
        dialogue: "pbr_dlg_kowalski",
        essential: true,
        voice: "settler",
        seed: 5905,
        weapon: "combat_shotgun",
        merchant: {
          scrip: 500,
          stock: [
            ["pistol_10mm", 1],
            ["hunting_rifle", 1],
            ["combat_shotgun", 1],
            ["ammo_10mm", 60],
            ["ammo_12ga", 30],
            ["ammo_308", 20],
            ["ammo_44", 18],
            ["frag_grenade", 3],
            ["combat_knife", 1],
            ["leather_armor", 1],
          ],
          restock: 3,
        },
        barks: [
          "Look, don't touch. Touch, buy.",
          'Kowalski\'s: we put the "arms" in "armistice".',
        ],
      });
      PF.npc({
        id: "pbr_bm_moss",
        type: "human",
        name: "Moss",
        outfit: "leather_armor",
        gender: "m",
        skinTone: 0.6,
        faction: "settlers",
        level: 7,
        pos: pos(int.guard1),
        yaw: PI,
        ai: "guard",
        home: { x: int.guard1.x, z: int.guard1.z, r: 2 },
        dialogue: "pbr_dlg_guard",
        voice: "settler",
        seed: 5906,
        weapon: "hunting_rifle",
        barks: [
          "Stairs are closed. Well — they're open. Nobody's using them.",
          "Hear that clicking?",
        ],
      });
      PF.npc({
        id: "pbr_bm_watch1",
        type: "human",
        name: "Bridgemarket Watch",
        outfit: "settler",
        gender: "f",
        faction: "settlers",
        level: 6,
        pos: pos(int.guard2),
        yaw: PI,
        ai: "guard",
        home: { x: int.guard2.x, z: int.guard2.z, r: 3 },
        voice: "settler",
        seed: 5907,
        weapon: "pistol_10mm",
        barks: [
          "Welcome to Bridgemarket. Keep your hands where Kowalski can see them.",
        ],
      });
      PF.npc({
        id: "pbr_bm_watch2",
        type: "human",
        name: "Ramp Sentry",
        outfit: "leather_armor",
        gender: "m",
        faction: "settlers",
        level: 6,
        pos: pos(ext.guard1),
        yaw: ext.guard1.yaw,
        ai: "guard",
        home: { x: ext.guard1.x, z: ext.guard1.z, r: 3 },
        voice: "settler",
        seed: 5908,
        weapon: "hunting_rifle",
        barks: [
          "Toll's five scrip. Kidding. Mostly.",
          "Bridge is out past the island. Don't say nobody told you.",
        ],
      });
      PF.npc({
        id: "pbr_bm_watch3",
        type: "human",
        name: "Deck Sentry",
        outfit: "settler",
        gender: "f",
        faction: "settlers",
        level: 6,
        pos: pos(ext.guard2),
        yaw: ext.guard2.yaw,
        ai: "guard",
        home: { x: ext.guard2.x, z: ext.guard2.z, r: 3 },
        voice: "settler",
        seed: 5909,
        weapon: "hunting_rifle",
        barks: ["Nice view, huh? Used to be nicer."],
      });
      // Pier Works
      const lurk = (id, name, a, lvl, hp) =>
        PF.npc({
          id,
          type: "shellback",
          name,
          faction: "creatures",
          level: lvl,
          pos: pos(a),
          yaw: a.yaw || 0,
          ai: "wander",
          home: { x: a.x, z: a.z, r: 5 },
          seed: id.length * 97 + lvl,
          hp,
        });
      lurk("pbr_bm_lurk1", "Shellback", int.spawn1, 5);
      lurk("pbr_bm_lurk2", "Shellback", int.spawn2, 5);
      lurk("pbr_bm_lurk3", "Softshell Shellback", int.spawn3, 3);
      lurk("pbr_bm_lurk4", "Shellback", int.spawn5, 6);
      PF.npc({
        id: "pbr_bm_snapper",
        type: "shellback",
        name: "Old Snapper",
        faction: "creatures",
        level: 10,
        pos: pos(int.boss),
        yaw: int.boss.yaw,
        ai: "guard",
        home: { x: int.boss.x, z: int.boss.z, r: 6 },
        hp: 300,
        seed: 5920,
        xp: 110,
        after: (a) => {
          try {
            if (a.char && a.char.root) a.char.root.scale.setScalar(1.4);
          } catch (e) {
            /* cosmetic */
          }
        },
      });

      // arriving in the Pier Works advances the quest
      PF.trigger(
        {
          x0: W(-30, 0, 0).x,
          x1: W(33, 0, 0).x,
          y0: O.y - 7.5,
          y1: O.y - 3,
          z0: O.z - 47,
          z1: O.z - 26,
        },
        () => {
          PF.q.advance("pbr_current", ["talk", "works"], "fix");
          G.notify(
            "The Pier Works. Ankle-deep water, dead pumps — and the clicking is much louder down here.",
          );
        },
        { cond: () => !PF.flag("bm_power") },
      );
      // Dutch's tape reel and spare fuse lie in the Pier Works (west end, x -26): finding either means you got down there
      G.events.on("itemAdded", (id) => {
        if (
          (id === "pbr_reel_dutch" || id === "pbr_bm_fuse") &&
          !PF.flag("bm_power")
        )
          PF.q.advance("pbr_current", ["talk", "works"], "fix");
      });
    },
    10,
  );

  // -------------------------------------------------------------------
  // Storeroom gate: iron bars that lift once unlocked (the stores key from the market safe) — owned by the market
  // -------------------------------------------------------------------
  function buildStoreGate(cell, int) {
    const b = PF.batch("bm_gate");
    const g = int.store_gate;
    for (let i = 0; i < 9; i++)
      b.box("iron", g.x - 1.0 + i * 0.25, g.y, g.z, 0.05, 2.8, 0.05, {
        seg: false,
      });
    for (const y of [0.3, 1.4, 2.6])
      b.box("iron", g.x, g.y + y, g.z, 2.2, 0.08, 0.08, { seg: false });
    const grp = b.build(cell.root, { noLOD: true });
    let col = null;
    const close = () => {
      if (!col)
        col = PF.col(g.x, g.z, 2.2, 0.3, g.y, g.y + 2.8, 0, {
          walkable: false,
          surface: "metal",
        });
      grp.visible = true;
    };
    const open = () => {
      if (col) {
        try {
          G.world.removeCollider(col);
        } catch (e) {
          /* core */
        }
        col = null;
      }
      grp.visible = false;
    };
    close();
    const unlock = () => {
      PF.setFlag("bm_store_open", true);
      open();
      PF.sfx("door_open", V3(g.x, g.y + 1, g.z));
    };
    PF.use({
      pos: V3(g.x, g.y + 1.2, g.z + 0.3),
      radius: 1.0,
      range: 2.4,
      label: "Storeroom Gate",
      verb: () => (PF.flag("bm_store_open") ? "Open" : "Unlock"),
      locked: () =>
        PF.flag("bm_store_open") ||
        PF.inv.count("pbr_bm_storekey") > 0 ||
        PF.lockIsOpen(PF.LOCKS.bm_store.id)
          ? null
          : "Locked",
      enabled: () => !PF.flag("bm_store_open"),
      onInteract() {
        if (PF.flag("bm_store_open")) return;
        if (!PF.locksLive() && PF.inv.count("pbr_bm_storekey") <= 0) {
          PF.sfx("door_locked");
          G.notify("The storeroom gate is locked.");
          return;
        }
        PF.lockOpen(PF.LOCKS.bm_store, unlock);
      },
    });
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "bm_store_open") {
        if (PF.flag("bm_store_open")) open();
        else close();
      }
    });
    PF.onReset.push(() => close());
  }
})();
