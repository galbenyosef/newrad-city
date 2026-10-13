// play-inline-256 03 — boxmm
// Lines 127-1035 of readable/play-inline-256.pretty.js (statement-aligned).
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
