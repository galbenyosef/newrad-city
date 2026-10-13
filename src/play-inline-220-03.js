// play-inline-220 03 — math
// Lines 228-2155 of readable/play-inline-220.pretty.js (statement-aligned).
  PH.addBuilder(
    "navy_int",
    function () {
      const I = G.LAYOUT.INTERIORS.uss_hudson;
      if (!I) return;
      const O = I.origin;
      const root = PH.interiorRoot("uss_hudson", "poi_hudson_interior");
      PH.setOrigin(O.x, O.z);
      const b = PH.batch("hudson_int");
      b.frame(PH.originMatrix());
      b.grime = 0.55;
      b.aoH = 2.2;
      b.setLights([], 0x565c62, 0.7);
      const A = {};
      const r = PH.rng("hudson");

      // =====================================================================
      // HOLD (y 0)
      // =====================================================================
      // shaft alley (x -44..-20): propeller shafts & bearings, bilge
      {
        const x0 = -44,
          x1 = -20,
          h = 4.2,
          W = hw(x0, x1);
        PH.slab(b, "diamond", x0, -W, x1, W, HOLD, 0.2);
        hullSide(b, x0, x1, HOLD, h, -1, W, false);
        hullSide(b, x0, x1, HOLD, h, 1, W, false);
        bulkhead(b, x0, HOLD, h, W, []);
        for (const z of [-3, 3]) {
          b.cyl("chrome", -32, 0.9, z, 0.35, 0.35, 24, 12, {
            rz: Math.PI / 2,
            hSeg: 4,
          });
          for (let x = -41; x < -21; x += 6) {
            b.boxMM("navy_dark", x - 0.5, 0, z - 0.8, x + 0.5, 1.4, z + 0.8, {
              seg: false,
            });
          }
          PH.colMM(x0, 0, z - 0.8, x1, 1.4, z + 0.8, { walkable: false });
        }
        b.boxMM("water", x0, 0.25, -W, x1, 0.3, W, { seg: false, noAO: true });
        for (let x = -40; x < -20; x += 6)
          PH.cageLamp(b, x, 3.6, W - 0.35, Math.PI, {
            r: 7,
            i: 0.6,
            bulb: "lamp_red",
            color: 0xff5a4a,
          });
        A.shaft = PH.A(-24, HOLD, 0, -Math.PI / 2);
      }
      // ENGINE ROOM (x -20..15, y 0..8.7) — the big one
      {
        const x0 = -20,
          x1 = 15,
          H = 8.7,
          W = 9;
        PH.slab(b, "diamond", x0, -W, x1, W, HOLD, 0.2);
        hullSide(b, x0, x1, HOLD, H, -1, W, false);
        hullSide(b, x0, x1, HOLD, H, 1, W, false);
        bulkhead(b, x0, HOLD, SEC - 0.2, W, [0]);
        bulkhead(b, x0, SEC - 0.2, H - SEC + 0.2, W, [7.6, -7.6]);
        bulkhead(b, x1, HOLD, SEC - 0.2, W, [0]);
        bulkhead(b, x1, SEC - 0.2, H - SEC + 0.2, W, []);
        // two cross-compound turbine sets + reduction gears along the shaft lines
        for (const z of [-4.4, 4.4]) {
          b.cyl("navy", -14, 1.8, z, 1.7, 1.7, 7, 16, {
            rz: Math.PI / 2,
            hSeg: 2,
          });
          b.cyl("navy", -4.5, 1.6, z, 1.4, 1.4, 5, 16, {
            rz: Math.PI / 2,
            hSeg: 2,
          });
          b.boxMM("navy_dark", 1, 0, z - 2, 7, 3.6, z + 2, { grime: 0.5 });
          for (let k = 0; k < 6; k++)
            b.cyl("iron", -17 + k * 1.3, 1.8, z, 1.78, 1.78, 0.14, 16, {
              rz: Math.PI / 2,
              hSeg: 1,
            });
          b.boxMM("navy_dark", -18, 0, z - 1.6, 8, 0.4, z + 1.6, {
            seg: false,
          });
          PH.colMM(-18, 0, z - 1.8, 7, 3.6, z + 1.8, { walkable: false });
          b.cyl(
            "chrome",
            -6,
            3.2,
            z + (z > 0 ? -1.3 : 1.3),
            0.3,
            0.3,
            0.1,
            12,
            { rx: Math.PI / 2, hSeg: 1 },
          );
        }
        // the 1964 refit: ATOMIC STEAM PLANT reactor vessel (glowing, leaking)
        {
          const rx = -9,
            rz = 0;
          b.cyl("paint_yellow", rx, 0, rz, 1.5, 1.6, 0.6, 16, { hSeg: 1 });
          b.cyl("chrome", rx, 0.6, rz, 1.35, 1.35, 4.6, 18, { hSeg: 3 });
          b.lathe(
            "chrome",
            [
              [1.35, 0],
              [1.1, 0.5],
              [0.4, 0.9],
              [0.1, 1.0],
            ],
            18,
            rx,
            5.2,
            rz,
            {},
          );
          for (let k = 0; k < 4; k++) {
            const a = (k / 4) * TAU + 0.4;
            b.box(
              "goo",
              rx + Math.cos(a) * 1.36,
              2.2,
              rz + Math.sin(a) * 1.36,
              0.05,
              1.2,
              0.5,
              { ry: -a, seg: false, noAO: true },
            );
          }
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * TAU;
            b.rod(
              "rust",
              PH.v3(rx + Math.cos(a) * 1.35, 4.5, rz + Math.sin(a) * 1.35),
              PH.v3(rx + Math.cos(a) * 3, 8.4, rz + Math.sin(a) * 2.6),
              0.14,
              6,
            );
          }
          b.addLight(rx, 2.5, rz, 0x5aff40, 9, 1.0);
          b.box("goo", rx + 1.8, 0.02, rz + 1.5, 2.4, 0.02, 1.6, {
            seg: false,
            noAO: true,
          });
          PH.col(rx, rz, 3, 3, 0, 6, 0, { walkable: false });
          const atK = PH.signMat(
            "hudson_atomic",
            [
              "ATOMIC STEAM PLANT MK.II",
              "GENERAL ATOMICS · REFIT 1964",
              "DO NOT LICK",
            ],
            "enamel",
            768,
            256,
            { bg: "#c8a020", fg: "#1a1a1a" },
          );
          b.quad(atK, rx, 3.2, rz - 1.37, 1.8, 0.6, { ry: Math.PI });
          try {
            G.world.addRadSource({
              x: O.x + rx,
              y: 1.5,
              z: O.z + rz,
              radius: 6,
              strength: 4,
            });
          } catch (e) {
            /* */
          }
          A.reactor = PH.A(rx, 0, rz - 3, 0);
        }
        // flooded aft bilge (knee-deep, irradiated)
        b.boxMM("water", x0 + 0.2, 0.35, -W + 0.2, -15, 0.4, W - 0.2, {
          seg: false,
          noAO: true,
        });
        try {
          G.world.addRadSource({
            x: O.x - 17.5,
            y: 0.3,
            z: O.z,
            radius: 5,
            strength: 1.2,
          });
        } catch (e) {
          /* */
        }
        // catwalk perimeter at SEC with cross-walks, steel stair down to the floor
        const cw = (x0c, z0c, x1c, z1c) => {
          b.boxMM("diamond", x0c, SEC - 0.1, z0c, x1c, SEC, z1c, {
            seg: false,
          });
          PH.colMM(x0c, SEC - 0.3, z0c, x1c, SEC, z1c, { surface: "metal" });
        };
        cw(x0, -W, x1, -6.6);
        cw(x0, 6.6, x1, W);
        cw(x0, -6.6, -17.6, 6.6);
        cw(11.4, -6.6, x1, -2);
        PH.railing(
          b,
          [
            [-17.6, -6.6],
            [x1, -6.6],
          ],
          SEC,
          1.0,
          "paint_yellow",
          { postStep: 1.5 },
        );
        PH.railing(
          b,
          [
            [-17.6, 6.6],
            [x1, 6.6],
          ],
          SEC,
          1.0,
          "paint_yellow",
          { postStep: 1.5 },
        );
        PH.railing(
          b,
          [
            [-17.6, -6.6],
            [-17.6, 6.6],
          ],
          SEC,
          1.0,
          "paint_yellow",
          { postStep: 1.5 },
        );
        PH.railing(
          b,
          [
            [11.4, -6.6],
            [11.4, -2],
          ],
          SEC,
          1.0,
          "paint_yellow",
          {},
        );
        for (const x of [-12, -2, 8])
          for (const z of [-6.6, 6.6]) {
            b.box("navy", x, 0, z, 0.2, SEC, 0.2, { seg: false });
            PH.col(x, z, 0.25, 0.25, 0, SEC - 0.3, 0, { walkable: false });
          }
        PH.stairs(b, "diamond", 13.2, -2, 0, 1.6, 4.8, SEC, HOLD, {
          solid: false,
          rails: "paint_yellow",
          stringer: "navy_dark",
        });
        // pipes, gauges, the engineering console
        pipeRun(b, x0, x1, 7.8, -8.3, 0.18, "paint_red");
        pipeRun(b, x0, x1, 7.4, -8.3, 0.12, "paint_yellow");
        pipeRun(b, x0, x1, 7.8, 8.3, 0.2, "iron");
        pipeRun(b, x0, x1, 8.2, 0, 0.3, "navy");
        b.boxMM("panel", 8.5, 0, -8.8, 12.5, 2.4, -8.1, { seg: false });
        for (let i = 0; i < 12; i++)
          b.cyl(
            "chrome",
            8.9 + (i % 6) * 0.6,
            1.4 + ((i / 6) | 0) * 0.6,
            -8.08,
            0.18,
            0.18,
            0.05,
            10,
            { rx: Math.PI / 2, hSeg: 1 },
          );
        PH.colMM(8.5, 0, -8.8, 12.5, 2.4, -8.1, { walkable: false });
        for (const [x, z] of [
          [-14, -8.4],
          [-2, 8.4],
          [8, -8.4],
          [-6, 0.2],
        ])
          PH.cageLamp(b, x, 7.6, z, z > 0 ? Math.PI : 0, { r: 10, i: 0.8 });
        const erK = PH.signMat(
          "hudson_er",
          ["MAIN ENGINE ROOM No.1", "HEARING PROTECTION REQUIRED"],
          "stencil",
          768,
          160,
          { bg: "#50565c", fg: "#e8e4d8" },
        );
        b.quad(erK, 14.85, 6.5, 4, 3, 0.62, { ry: -Math.PI / 2 });
        A.engine = PH.A(0, HOLD, 0, Math.PI / 2);
        A.engine_terminal = PH.A(10.5, HOLD, -7.6, Math.PI);
        A.spawn2 = PH.A(-4, SEC, 7.6, -Math.PI / 2);
        A.spawn3 = PH.A(4, HOLD, 0, Math.PI / 2);
      }
      // FIRE ROOM (x 15..22): two boilers, the ladder up to the mess, the magazine door
      {
        const x0 = 15,
          x1 = 22,
          h = 4.2,
          W = 9;
        PH.slab(b, "diamond", x0, -W, x1, W, HOLD, 0.2);
        hullSide(b, x0, x1, HOLD, h, -1, W, false);
        hullSide(b, x0, x1, HOLD, h, 1, W, false);
        bulkhead(b, x1, HOLD, h, W, [-3]);
        for (const z of [-6, -1]) {
          b.boxMM("navy_dark", 16, 0, z - 1.6, 21, 3.4, z + 1.6, {
            grime: 0.6,
          });
          b.box("fire", 21.02, 0.8, z, 0.05, 0.6, 0.9, {
            seg: false,
            noAO: true,
          });
          b.addLight(21.5, 1.2, z, 0xff6a20, 5, 0.8);
          PH.colMM(16, 0, z - 1.6, 21, 3.4, z + 1.6, { walkable: false });
        }
        PH.stairs(
          b,
          "diamond",
          16,
          6.2,
          (Math.PI / 2) * -1 + Math.PI,
          1.8,
          5.2,
          HOLD,
          SEC,
          { solid: false, rails: "paint_yellow", stringer: "navy_dark" },
        );
        PH.cageLamp(b, 18.5, 3.7, W - 0.35, Math.PI, { r: 7, i: 0.7 });
        const magK = PH.signMat(
          "hudson_mag",
          ["MAGAZINE — 16 IN.", "NO OPEN FLAME · NO SMOKING · NO KIDDING"],
          "stencil",
          768,
          160,
          { bg: "#8a2a1c", fg: "#f0e8d8" },
        );
        b.quad(magK, 21.85, 2.5, -3, 1.8, 0.4, { ry: -Math.PI / 2 });
        A.fireroom = PH.A(18.5, HOLD, 2, Math.PI / 2);
      }
      // MAGAZINE (x 22..44) — locked reward room
      {
        const x0 = 22,
          x1 = 44,
          h = 4.2,
          W = hw(x0, x1);
        PH.slab(b, "diamond", x0, -W, x1, W, HOLD, 0.2);
        hullSide(b, x0, x1, HOLD, h, -1, W, false);
        hullSide(b, x0, x1, HOLD, h, 1, W, false);
        bulkhead(b, x1, HOLD, h, W, []);
        // shell racks: 16" projectiles standing in rows, powder bags on shelves
        for (let row = 0; row < 3; row++)
          for (let k = 0; k < 14; k++) {
            const x = 25 + k * 1.1,
              z = -W + 1.2 + row * 0.95;
            b.cyl("navy_dark", x, 0, z, 0.42, 0.42, 1.2, 10, { hSeg: 1 });
            b.lathe(
              "bronze",
              [
                [0.42, 0],
                [0.4, 0.3],
                [0.22, 0.6],
                [0.02, 0.75],
              ],
              10,
              x,
              1.2,
              z,
              {},
            );
          }
        PH.colMM(24.4, 0, -W + 0.6, 40, 2, -W + 3.8, { walkable: false });
        for (let y = 0.3; y < 3.6; y += 0.8) {
          b.boxMM("navy", 25, y, W - 1.3, 40, y + 0.05, W - 0.2, {
            seg: false,
          });
          for (let x = 25.4; x < 40; x += 0.9)
            b.cyl("canvas", x, y + 0.37, W - 0.75, 0.32, 0.32, 0.7, 10, {
              rx: Math.PI / 2,
              hSeg: 1,
              c: 0xb0a070,
            });
        }
        PH.colMM(25, 0, W - 1.3, 40, 3.6, W - 0.2, { walkable: false });
        // the special munitions locker
        b.boxMM("paint_olive", 41, 0, -2, 43.6, 1.3, 2, { seg: false });
        const smK = PH.signMat(
          "hudson_special",
          ["RESTRICTED MUNITIONS", "HARBOR DEFENSE — TWO-MAN RULE"],
          "stencil",
          512,
          192,
          { bg: "#4a5a3a", fg: "#f0e8c8" },
        );
        b.quad(smK, 40.98, 0.8, 0, 2.4, 0.9, { ry: -Math.PI / 2 });
        PH.colMM(41, 0, -2, 43.6, 1.3, 2, { walkable: false });
        for (let x = 26; x < 42; x += 5)
          PH.cageLamp(b, x, 3.7, 0, 0, {
            r: 7,
            i: 0.55,
            bulb: "lamp_red",
            color: 0xff5040,
          });
        b.box("paint_yellow", 38, 0, 3.5, 1.4, 4.2, 1.4, { seg: false }); // ammunition hoist trunk
        A.magazine = PH.A(30, HOLD, 0, Math.PI / 2);
        A.mag_loot = PH.A(40.4, HOLD, 0, -Math.PI / 2);
        A.hoist_low = PH.A(38, HOLD, 2.2, 0);
      }

      // =====================================================================
      // SECOND DECK (y 4.5)
      // =====================================================================
      // CREW BERTHING (x -44..-20): above the shaft alley
      {
        const x0 = -44,
          x1 = -20,
          h = 4.2,
          W = hw(x0, x1),
          y = SEC;
        deck(b, "lino", x0, -W, x1, W, y);
        hullSide(b, x0, x1, y, h, -1, W, true);
        hullSide(b, x0, x1, y, h, 1, W, true);
        bulkhead(b, x0, y, h, W, []);
        for (let x = -41; x < -22; x += 2.6) {
          rack(b, x, y, -6.2, true);
          if (x > -31) rack(b, x, y, 6.2, true);
          if (x < -30) rack(b, x, y, -3.4, true);
        }
        for (let x = -41; x < -22; x += 3.9)
          PH.propAt("locker", x, y, -W + 0.4, 0, { loot: "locker", count: 2 });
        // raider living: mattresses, card table, a pinup, a "SHIP RULES" board
        b.box("fabric", -28, y, 2.2, 2.0, 0.25, 1.2, {
          ry: 0.3,
          seg: false,
          c: 0x6a4a3a,
        });
        b.boxMM("wood", -25.5, y + 0.75, -1.2, -23.5, y + 0.8, 0.4, {
          seg: false,
        });
        for (const [x, z] of [
          [-25.3, -1],
          [-23.7, -1],
          [-25.3, 0.2],
          [-23.7, 0.2],
        ])
          b.box("iron", x, y, z, 0.05, 0.75, 0.05, { seg: false });
        for (let i = 0; i < 9; i++)
          b.box(
            "paper",
            -25.2 + r() * 1.4,
            y + 0.81,
            -1 + r() * 1.2,
            0.07,
            0.005,
            0.1,
            { ry: r() * 3, seg: false, noAO: true },
          );
        PH.colMM(-25.5, y, -1.2, -23.5, y + 0.8, 0.4, {});
        const rulesK = PH.signMat(
          "hudson_rules",
          [
            "PIRATE'S CODE",
            "1. COMMODORE GETS HALF",
            "2. YOU GET WHAT'S LEFT OF THE OTHER HALF",
            "3. NO SHOOTIN BELOW DECKS (REACTOR)",
            "4. THE CAPTIVE IS NOT FOOD. YET.",
          ],
          "chalk",
          768,
          512,
        );
        b.quad(rulesK, -20.2, y + 2.2, -4.5, 2.2, 1.45, { ry: -Math.PI / 2 });
        PH.readAt(
          -20.5,
          y + 2.2,
          -4.5,
          "Pirate's Code",
          "1. Commodore gets half. 2. You get what's left of the other half. 3. No shootin' below decks (reactor). 4. The captive is not food. Yet. 5. Anybody touches the Commodore's hat walks the plank. We don't have a plank. We will make one.",
        );
        for (let x = -40; x < -20; x += 5)
          PH.cageLamp(b, x, y + 3.7, 0, 0, { r: 8, i: 0.7 });
        A.berthing = PH.A(-34, y, 0, -Math.PI / 2);
        A.spawn1 = PH.A(-27, y, 3, -Math.PI / 2);
      }
      // MESS HALL + galley (x 15..36) over the fire room & magazine
      {
        const x0 = 15,
          x1 = 36,
          h = 4.2,
          W = 9,
          y = SEC;
        deck(b, "lino", x0, -W, 15.9, W, y);
        deck(b, "lino", 15.9, -W, 21.3, 5.2, y); // hole over the fire-room ladder (z 5.2..7.2)
        deck(b, "lino", 15.9, 7.2, 21.3, W, y);
        deck(b, "lino", 21.3, -W, x1, W, y);
        PH.railing(
          b,
          [
            [15.9, 5.2],
            [21.3, 5.2],
          ],
          y,
          1.0,
          "navy",
          {},
        );
        PH.railing(
          b,
          [
            [15.9, 7.2],
            [21.3, 7.2],
          ],
          y,
          1.0,
          "navy",
          {},
        );
        hullSide(b, x0, x1, y, h, -1, W, true);
        hullSide(b, x0, x1, y, h, 1, W, true);
        bulkhead(b, x1, y, h, W, [0]);
        // long mess tables with fixed stools
        for (const z of [-3.5, 0, 3.5]) {
          if (z === 3.5) continue;
          b.boxMM("scratched", 22, y + 0.72, z - 0.45, 34, y + 0.78, z + 0.45, {
            seg: false,
            c: 0x7a7a74,
            grime: 0.6,
          });
          for (let x = 22.5; x < 34; x += 2.8)
            b.box("navy_dark", x, y, z, 0.08, 0.72, 0.08, { seg: false });
          for (let x = 22.8; x < 34; x += 0.9)
            for (const s of [-0.75, 0.75])
              b.cyl("chrome", x, y, z + s, 0.17, 0.17, 0.46, 8, { hSeg: 1 });
          PH.colMM(22, y, z - 0.45, 34, y + 0.78, z + 0.45, {});
          for (let i = 0; i < 6; i++) {
            const x = 22.5 + r() * 11;
            b.box(
              "metal",
              x,
              y + 0.78,
              z + (r() - 0.5) * 0.6,
              0.45,
              0.03,
              0.32,
              { seg: false },
            );
            if (r() < 0.4)
              b.cyl("chrome", x + 0.3, y + 0.78, z, 0.05, 0.05, 0.12, 6, {
                hSeg: 1,
              });
          }
        }
        // galley line: steam tables, coffee urns ("mud"), serving hatch
        b.boxMM("scratched", 16.2, y, -W + 0.3, 21, y + 0.95, -W + 1.4, {
          seg: false,
        });
        for (let x = 16.8; x < 21; x += 1.1)
          b.boxMM(
            "chrome",
            x - 0.4,
            y + 0.95,
            -W + 0.45,
            x + 0.4,
            y + 1.0,
            -W + 1.25,
            { seg: false },
          );
        for (const x of [17, 18.2])
          b.cyl("chrome", x, y + 1.0, -W + 0.8, 0.26, 0.24, 0.8, 12, {
            hSeg: 1,
          });
        PH.colMM(16.2, y, -W + 0.3, 21, y + 0.95, -W + 1.4, {});
        const mudK = PH.signMat(
          "hudson_mud",
          ["GALLEY", 'COFFEE ("MUD") 1 CAP', "SLOP 3 SCRIP · MYSTERY MEAT 4"],
          "chalk",
          512,
          320,
        );
        b.quad(mudK, 18.6, y + 2.2, -W + 0.32, 2.0, 1.2, {});
        // raider camp in the mess: burning barrel, jet inhalers, a trophy wall, sleeping bags
        b.cyl("rust", 25, y, 5.8, 0.32, 0.32, 0.95, 10, { hSeg: 1 });
        b.sphere("fire", 25, y + 1.0, 5.8, 0.3, { sy: 0.7, noAO: true });
        b.addLight(25, y + 1.8, 5.8, 0xff8a3a, 8, 1.0);
        PH.col(25, 5.8, 0.7, 0.7, y, y + 0.95, 0, { walkable: false });
        for (const [x, z] of [
          [28, 6.8],
          [31, 7.4],
          [33.5, 6.2],
        ])
          b.box("fabric", x, y, z, 1.9, 0.2, 0.8, {
            ry: r() - 0.5,
            seg: false,
            c: 0x5a5a3a,
          });
        for (let i = 0; i < 7; i++)
          b.sphere("bone", 35.7, y + 1.4 + (i % 3) * 0.5, -6 + i * 1.4, 0.12, {
            sx: 1.1,
          });
        const trophyK = PH.signMat(
          "hudson_trophy",
          ["TROPHY WALL"],
          "raider",
          512,
          128,
          { bg: "#50565c", fg: "#c83020" },
        );
        b.quad(trophyK, 35.85, y + 3.1, -2, 2.2, 0.55, { ry: -Math.PI / 2 });
        for (let x = 18; x < 36; x += 5)
          PH.tubeLamp(b, x, y + h, 0, 2.4, Math.PI / 2, { dead: x === 28 });
        // the stair up to the main deck forward
        PH.stairs(b, "diamond", 30, -6.05, Math.PI / 2, 2.0, 5.2, SEC, MAIN, {
          solid: false,
          rails: "navy",
          stringer: "navy_dark",
        });
        A.mess = PH.A(28, y, 0, Math.PI / 2);
        A.spawn4 = PH.A(30, y, 2, Math.PI / 2);
        A.spawn5 = PH.A(20, y, -2, Math.PI / 2);
        A.loot1 = PH.A(16.8, y, 8.2, Math.PI / 2);
      }
      // BRIG (x 36..44)
      {
        const x0 = 36,
          x1 = 44,
          h = 4.2,
          W = hw(x0, x1),
          y = SEC;
        deck(b, "diamond", x0, -W, x1, W, y);
        hullSide(b, x0, x1, y, h, -1, W, false);
        hullSide(b, x0, x1, y, h, 1, W, false);
        bulkhead(b, x1, y, h, W, []);
        // three cells along the forward bulkhead, bars facing aft (x = 40.5)
        for (let c = 0; c < 3; c++) {
          const z0 = -W + 0.3 + c * ((2 * W - 0.6) / 3),
            z1 = z0 + (2 * W - 0.6) / 3;
          if (c > 0)
            PH.wall(b, "navyplate", 40.5, z0, x1, z0, y, y + h, [], {
              t: 0.15,
              ext: 0,
            });
          for (let z = z0 + 0.2; z < z1; z += 0.22) {
            if (c === 1 && Math.abs(z - (z0 + z1) / 2) < 0.5) continue;
            b.rod("iron", PH.v3(40.5, y, z), PH.v3(40.5, y + 2.4, z), 0.025, 4);
          }
          b.box("iron", 40.5, y + 2.35, (z0 + z1) / 2, 0.08, 0.1, z1 - z0, {
            seg: false,
          });
          if (c !== 1)
            PH.col(40.5, (z0 + z1) / 2, 0.15, z1 - z0, y, y + 2.4, 0, {
              walkable: false,
            });
          else {
            PH.colMM(40.42, y, z0, 40.58, y + 2.4, (z0 + z1) / 2 - 0.5, {
              walkable: false,
            });
            PH.colMM(40.42, y, (z0 + z1) / 2 + 0.5, 40.58, y + 2.4, z1, {
              walkable: false,
            });
          }
          b.box("canvas", 42.8, y + 0.4, (z0 + z1) / 2, 1.8, 0.1, 0.8, {
            seg: false,
            c: 0x8a8470,
          });
          b.box("iron", 42.8, y, (z0 + z1) / 2, 1.9, 0.4, 0.84, { seg: false });
        }
        // the middle cell's barred door (opens when the captive is freed)
        PH.hudsonCellZ = 0;
        PH.skeleton(b, 43, y, W - 1.2, Math.PI, { sit: true });
        b.boxMM("wood_dark", 37, y, -W + 0.5, 38.4, y + 0.8, -W + 1.7, {
          seg: false,
        });
        PH.colMM(37, y, -W + 0.5, 38.4, y + 0.8, -W + 1.7, {});
        PH.cageLamp(b, 38, y + 3.7, 0, 0, { r: 8, i: 0.7 });
        const brigK = PH.signMat(
          "hudson_brig",
          ["BRIG", "PRISONERS WILL NOT SPEAK TO THE SENTRY"],
          "stencil",
          512,
          160,
          { bg: "#50565c", fg: "#e8e4d8" },
        );
        b.quad(brigK, 36.15, y + 2.8, 2.6, 1.8, 0.56, { ry: Math.PI / 2 });
        A.captive = PH.A(42.2, y, 0, Math.PI / 2);
        A.brig = PH.A(38.5, y, 0, Math.PI / 2);
        A.brig_guard = PH.A(37.8, y, -3, Math.PI / 2);
      }

      // =====================================================================
      // MAIN DECK (y 9)
      // =====================================================================
      // QUARTERDECK (x -44..-32): entrance, ship's bell, OOD podium, stair down to berthing
      {
        const x0 = -44,
          x1 = -32,
          h = 4,
          W = hw(x0, x1),
          y = MAIN;
        deck(b, "wood", x0, -W, x1, 3.8, y);
        deck(b, "wood", x0, 6.6, x1, W, y);
        deck(b, "wood", x0, 3.8, -40.2, 6.6, y);
        deck(b, "wood", -32.9, 3.8, x1, 6.6, y);
        hullSide(b, x0, x1, y, h, -1, W, true);
        hullSide(b, x0, x1, y, h, 1, W, true);
        bulkhead(b, x0, y, h, W, [0]);
        b.boxMM("navyplate", x0, y + h, -W, x1, y + h + 0.3, W, { grime: 0.5 });
        PH.colMM(x0, y + h, -W, x1, y + h + 0.3, W, { walkable: false });
        PH.stairs(b, "diamond", -40.2, 5.2, Math.PI / 2, 2.4, 7.3, MAIN, SEC, {
          solid: false,
          rails: "navy",
          stringer: "navy_dark",
        });
        PH.railing(
          b,
          [
            [-40.2, 3.8],
            [-32.9, 3.8],
          ],
          y,
          1.0,
          "navy",
          {},
        );
        PH.railing(
          b,
          [
            [-40.2, 6.6],
            [-32.9, 6.6],
          ],
          y,
          1.0,
          "navy",
          {},
        );
        PH.railing(
          b,
          [
            [-32.9, 3.8],
            [-32.9, 6.6],
          ],
          y,
          1.0,
          "navy",
          {},
        );
        // the ship's bell on its bracket, the officer-of-the-deck podium
        b.box("navy_dark", -43.7, y + 1.6, -4, 0.2, 0.8, 0.2, { seg: false });
        b.lathe(
          "bronze",
          [
            [0.05, 0.5],
            [0.18, 0.45],
            [0.24, 0.1],
            [0.3, 0],
          ],
          14,
          -43.3,
          y + 1.35,
          -4,
          {},
        );
        b.boxMM("wood_dark", -36, y, -2.5, -35, y + 1.2, -1.2, { seg: false });
        b.box("wood", -35.5, y + 1.2, -1.85, 1.2, 0.05, 1.5, {
          rz: 0.2,
          seg: false,
        });
        PH.colMM(-36, y, -2.5, -35, y + 1.2, -1.2, { walkable: false });
        const qdK = PH.signMat(
          "hudson_qd2",
          [
            "USS HUDSON · BB-68",
            '"STEADFAST ON THE RIVER"',
            "LAUNCHED 1944 · MUSEUM SHIP 1960 · REACTIVATED 1966",
          ],
          "engraved",
          1024,
          256,
          { bg: "#8a7a58", fg: "#2a2418" },
        );
        b.quad(qdK, -32.2, y + 2.4, -4.5, 3.4, 0.85, { ry: -Math.PI / 2 });
        PH.readAt(
          -32.5,
          y + 2.2,
          -4.5,
          "Commissioning Plaque",
          'USS HUDSON (BB-68). Launched 1944. Decommissioned 1958. Museum ship, Brooklyn Navy Yard, 1960–1966. Recommissioned by emergency order, June 1966, "for harbor defense against Soviet aggression." Someone has scratched underneath: COMMODORE HATCH, 1986 — AND FOREVER.',
        );
        // raider barricade & lights
        PH.sandbags(b, -38, -3.5, -38, -0.5, 3, { y });
        for (const x of [-42, -36])
          PH.cageLamp(b, x, y + 3.5, -W + 0.3, 0, { r: 8, i: 0.8 });
        A.entrance = PH.A(-42.4, y, 0, -Math.PI / 2);
        A.quarterdeck = PH.A(-37, y, 1, -Math.PI / 2);
      }
      // OFFICERS' PASSAGE (x -32..20): central corridor with cabins either side
      {
        const x0 = -32,
          x1 = 20,
          y = MAIN,
          h = 3.4,
          W = 9;
        deck(b, "lino", x0, -1.3, x1, 1.3, y);
        b.boxMM("navyplate", x0, y + h, -W, x1, y + h + 0.3, W, { grime: 0.5 });
        PH.colMM(x0, y + h, -W, x1, y + h + 0.3, W, { walkable: false });
        hullSide(b, x0, x1, y, h, -1, W, true);
        hullSide(b, x0, x1, y, h, 1, W, true);
        bulkhead(b, x0, y, h, W, [0]);
        // cabin walls along the passage (z = ±1.3) with doors
        const doorsN = [
          { c: 8, w: 1.1, h: 2.1 },
          { c: 26, w: 1.1, h: 2.1 },
          { c: 43, w: 1.1, h: 2.1 },
        ];
        const doorsS = [
          { c: 8, w: 1.1, h: 2.1 },
          { c: 26, w: 1.1, h: 2.1 },
          { c: 43, w: 1.1, h: 2.1 },
        ];
        PH.wall(b, "navyplate", x0, -1.3, x1, -1.3, y, y + h, doorsN, {
          t: 0.15,
          ext: 0,
        });
        PH.wall(b, "navyplate", x0, 1.3, x1, 1.3, y, y + h, doorsS, {
          t: 0.15,
          ext: 0,
        });
        // transverse cabin divisions
        for (const x of [-14, 4])
          for (const s of [-1, 1])
            PH.wall(b, "navyplate", x, s * 1.3, x, s * W, y, y + h, [], {
              t: 0.15,
              ext: 0,
            });
        pipeRun(b, x0, x1, y + h - 0.25, 0.8, 0.07, "paint_red");
        pipeRun(b, x0, x1, y + h - 0.25, -0.8, 0.1, "iron");
        for (let x = -28; x < 20; x += 6)
          PH.tubeLamp(b, x, y + h, 0, 1.6, Math.PI / 2, { dead: x === -10 });
        // WARDROOM (x -32..-14, z -9..-1.3): long table, portraits, piano
        deck(b, "wood", x0, -W, -14, -1.3, y);
        b.boxMM("wood_dark", -28, y + 0.75, -6.2, -18, y + 0.82, -4.2, {
          seg: false,
        });
        b.boxMM(
          "paint_white",
          -28.05,
          y + 0.82,
          -6.25,
          -17.95,
          y + 0.84,
          -4.15,
          { seg: false, grime: 0.7 },
        );
        PH.colMM(-28, y, -6.2, -18, y + 0.84, -4.2, {});
        for (let x = -27; x < -18; x += 1.6)
          for (const z of [-6.9, -3.5])
            PH.propAt("chair", x, y, z, z < -5 ? 0 : Math.PI, { kind: "wood" });
        for (let i = 0; i < 8; i++) {
          b.cyl(
            "chrome",
            -27 + i * 1.2,
            y + 0.84,
            -5.2 + (r() - 0.5) * 0.6,
            0.12,
            0.12,
            0.02,
            10,
            { hSeg: 1 },
          );
        }
        b.boxMM("paint_black", -31.6, y, -8.4, -29.8, y + 1.1, -6.8, {
          seg: false,
        });
        b.boxMM("paint_white", -31.55, y + 0.9, -8.35, -29.85, y + 0.95, -7.9, {
          seg: false,
        });
        PH.colMM(-31.6, y, -8.4, -29.8, y + 1.1, -6.8, { walkable: false });
        const pK = PH.signMat(
          "hudson_portrait",
          ["ADM. W. F.", "HALSEY", "1944"],
          "engraved",
          256,
          320,
          { bg: "#4a3a2a", fg: "#d8c8a0" },
        );
        b.quad(pK, -23, y + 2.0, -8.6, 0.9, 1.1, {});
        PH.hangLamp(b, -23, y + h, -5.2, 0.6, { color: 0xffe0b0 });
        A.wardroom = PH.A(-23, y, -3, 0);
        // CAPTAIN'S CABIN (x -14..4, z -9..-1.3): desk, bunk, safe, the captain's log
        deck(b, "carpet", -14, -W, 4, -1.3, y);
        b.boxMM("wood_dark", -6, y, -7.8, -3, y + 0.8, -6.6, { seg: false });
        PH.colMM(-6, y, -7.8, -3, y + 0.8, -6.6, {});
        b.boxMM("wood_dark", -12.8, y, -8.6, -10.8, y + 0.5, -6.8, {
          seg: false,
        });
        b.boxMM("fabric", -12.7, y + 0.5, -8.5, -10.9, y + 0.65, -6.9, {
          seg: false,
          c: 0x3a4a6a,
        });
        PH.colMM(-12.8, y, -8.6, -10.8, y + 0.65, -6.8, {});
        PH.skeleton(b, -11.8, y + 0.65, -7.7, Math.PI / 2, {});
        const flagK = PH.texMat(
          "ellis_flag",
          PH.canvasTex("ph_flag", 8, 8, () => {}),
          { double: true },
        );
        b.quad(flagK, -5, y + 2.2, -8.62, 1.8, 1.0, {});
        PH.hangLamp(b, -4.5, y + h, -5, 0.5, {});
        A.captain = PH.A(-4.5, y, -3.5, 0);
        A.captain_desk = PH.A(-4.5, y + 0.8, -7.2, 0);
        A.loot2 = PH.A(1.5, y, -8.2, 0);
        // STATEROOMS (x -32..4, z 1.3..9)
        deck(b, "lino", x0, 1.3, 4, W, y);
        for (const x of [-26, -20, -8, -2]) rack(b, x, y, 7.8, true);
        PH.skeleton(b, -9, y, 4.5, 2.2, {});
        A.staterooms = PH.A(-20, y, 4, 0);
        // SICK BAY (x 4..20, z -9..-1.3)
        deck(b, "hextile", 4, -W, x1, -1.3, y);
        for (let x = 7; x < 19; x += 3) {
          b.boxMM(
            "paint_white",
            x - 0.9,
            y + 0.55,
            -8.6,
            x + 0.9,
            y + 0.7,
            -7.6,
            { seg: false },
          );
          b.boxMM("iron", x - 0.95, y, -8.65, x + 0.95, y + 0.55, -7.55, {
            seg: false,
          });
          PH.colMM(x - 0.95, y, -8.65, x + 0.95, y + 0.7, -7.55, {});
        }
        PH.skeleton(b, 10, y + 0.7, -8.1, Math.PI / 2, {});
        b.boxMM("paint_white", 18.8, y, -6, 19.8, y + 2, -3, { seg: false });
        PH.colMM(18.8, y, -6, 19.8, y + 2, -3, { walkable: false });
        const sbK = PH.signMat(
          "hudson_sickbay",
          ["SICK BAY"],
          "enamel",
          512,
          128,
          { bg: "#e8e2d0", fg: "#8a1a1a" },
        );
        b.quad(sbK, 12, y + 2.5, -1.36, 1.6, 0.4, { ry: Math.PI });
        PH.tubeLamp(b, 12, y + h, -5, 2.0, 0, {});
        A.sickbay = PH.A(12, y, -4, 0);
        // RADIO ROOM (x 4..20, z 1.3..9)
        deck(b, "lino", 4, 1.3, x1, W, y);
        b.boxMM("paint_olive", 5, y, 7.6, 16, y + 2.2, 8.8, { seg: false });
        for (let i = 0; i < 10; i++)
          b.box(
            i % 3 ? "screen" : "chrome",
            5.6 + i * 1.05,
            y + 1.3,
            7.55,
            0.7,
            0.45,
            0.05,
            { seg: false },
          );
        PH.colMM(5, y, 7.6, 16, y + 2.2, 8.8, { walkable: false });
        b.boxMM("scratched", 6, y + 0.75, 5.8, 12, y + 0.8, 7.2, {
          seg: false,
        });
        PH.colMM(6, y, 5.8, 12, y + 0.8, 7.2, {});
        A.radio = PH.A(9, y, 4, Math.PI);
        A.radio_terminal = PH.A(8, y + 0.8, 6.5, Math.PI);
      }
      // MAIN DECK FORWARD HALL (x 20..44): barbette of Turret 2, ammo hoist, the trunk up to the bridge
      {
        const x0 = 20,
          x1 = 44,
          y = MAIN,
          h = O1 - MAIN - 0.3,
          W = hw(x0, x1);
        deck(b, "diamond", x0, -W, 30, W, y);
        deck(b, "diamond", 30, -5, x1, W, y);
        deck(b, "diamond", 35.2, -W, x1, -5, y);
        PH.railing(
          b,
          [
            [30, -5],
            [35.2, -5],
          ],
          y,
          1.0,
          "navy",
          {},
        );
        hullSide(b, x0, x1, y, h, -1, W, true);
        hullSide(b, x0, x1, y, h, 1, W, true);
        bulkhead(b, x0, y, 3.4, W, [0]);
        bulkhead(b, x1, y, h, W, []);
        // ceiling beyond the superstructure (the CIC deck above covers x 18..34)
        b.boxMM("navyplate", 34, y + h, -W, x1, y + h + 0.3, W, { grime: 0.5 });
        PH.colMM(34, y + h, -W, x1, y + h + 0.3, W, { walkable: false });
        b.boxMM("navyplate", x0, y + h, -W, 34, y + h + 0.3, -7, {
          grime: 0.5,
        });
        // Turret 2 barbette (armoured cylinder passing through) + training gear
        b.cyl("navy_dark", 38, y, 0, 4.2, 4.2, h, 28, { hSeg: 2 });
        for (let k = 0; k < 24; k++) {
          const a = (k / 24) * TAU;
          b.box(
            "rust",
            38 + Math.cos(a) * 4.25,
            y + 1.2,
            Math.sin(a) * 4.25,
            0.12,
            2.6,
            0.3,
            { ry: -a, seg: false },
          );
        }
        PH.col(38, 0, 8.2, 8.2, y, y + h, 0, { walkable: false });
        b.box("paint_yellow", 38, y, 3.5 + 1.2, 1.4, h, 1.4, { seg: false });
        const hoistK = PH.signMat(
          "hudson_hoist",
          ["AMMUNITION HOIST", "MAGAZINE ▼"],
          "stencil",
          512,
          160,
          { bg: "#c8a020", fg: "#1a1a1a" },
        );
        b.quad(hoistK, 37.28, y + 2.2, 4.7, 1.2, 0.4, { ry: -Math.PI / 2 });
        for (const x of [24, 32, 41])
          PH.cageLamp(b, x, y + h - 0.4, -W + 0.3, 0, { r: 8, i: 0.75 });
        A.main_fwd = PH.A(26, y, -2, Math.PI / 2);
        A.hoist_high = PH.A(36, y, 4.7, -Math.PI / 2);
        A.spawn6 = PH.A(30, y, 5.5, Math.PI / 2);
      }
      // superstructure trunk: main → 01 → bridge (switchback flights in x 20.5..27.8, z 3..8)
      for (const [y0, y1] of [
        [MAIN, O1],
        [O1, BR],
      ]) {
        const ym = (y0 + y1) / 2;
        PH.stairs(b, "diamond", 21.4, 4.2, Math.PI / 2, 2.2, 5, y0, ym, {
          solid: false,
          rails: "navy",
          railSides: [1],
          stringer: "navy_dark",
        });
        b.boxMM("diamond", 26.4, ym - 0.1, 3, 28.6, ym, 8, { seg: false });
        PH.colMM(26.4, ym - 0.3, 3, 28.6, ym, 8, { surface: "metal" });
        PH.stairs(b, "diamond", 26.4, 6.8, -Math.PI / 2, 2.2, 5, ym, y1, {
          solid: false,
          rails: "navy",
          railSides: [1],
          stringer: "navy_dark",
        });
      }
      PH.wall(b, "navyplate", 20, 8.2, 28.8, 8.2, MAIN, BR + 3.6, [], {
        t: 0.2,
      });
      PH.wall(b, "navyplate", 28.8, 3, 28.8, 8.2, MAIN, BR + 3.6, [], {
        t: 0.2,
      });
      PH.wall(b, "navyplate", 18, 3, 18, 8.2, MAIN + 4.5, BR + 3.6, [], {
        t: 0.2,
      });
      // 01 LEVEL: COMBAT INFORMATION CENTER (x 18..34, z -8..8)
      {
        const y = O1,
          x0 = 18,
          x1 = 34,
          W = 7,
          h = BR - O1 - 0.3;
        deck(b, "lino", x0, -W, x1, 3, y);
        deck(b, "lino", x0, 3, 21.3, 8.2, y);
        deck(b, "lino", 28.8, 3, x1, 8.2, y);
        PH.wall(b, "navyplate", x0, -W, x1, -W, y, y + h, [], { t: 0.25 });
        PH.wall(b, "navyplate", x0, -W, x0, 3, y, y + h, [], { t: 0.25 });
        PH.wall(b, "navyplate", x1, -W, x1, 8.2, y, y + h, [], { t: 0.25 });
        PH.wall(b, "navyplate", 28.8, 8.2, x1, 8.2, y, y + h, [], { t: 0.25 });
        // plotting table (glowing), radar repeaters, status boards
        // (the dead-reckoning plot table, status boards & fittings are built in 33_navy_int_dress.js)
        for (let i = 0; i < 5; i++) {
          const cx = 19 + i * 2.6;
          // radar repeater console: pedestal, sloped control desk with gauges, toggles & levers, hooded scope
          b.box("navy_dark", cx, y, -6.3, 1.6, 1.0, 1.0, { seg: false });
          b.box("navy", cx, y + 1.0, -6.05, 1.6, 0.08, 0.7, {
            rx: -0.45,
            seg: false,
          });
          b.box("navy_dark", cx, y + 1.05, -6.6, 1.6, 0.9, 0.4, { seg: false });
          b.cyl(PH.hudsonPPI(), cx, y + 1.5, -6.39, 0.3, 0.3, 0.04, 16, {
            rx: Math.PI / 2,
            hSeg: 1,
            noAO: true,
          });
          b.cyl("black", cx, y + 1.5, -6.36, 0.36, 0.34, 0.12, 16, {
            rx: Math.PI / 2,
            hSeg: 1,
            open: true,
          }); // hood
          for (const dx of [-0.55, 0.55]) {
            b.cyl("paint_white", cx + dx, y + 1.62, -6.38, 0.1, 0.1, 0.02, 12, {
              rx: Math.PI / 2,
              hSeg: 1,
              noAO: true,
            });
            b.cyl("chrome", cx + dx, y + 1.62, -6.37, 0.115, 0.115, 0.015, 12, {
              rx: Math.PI / 2,
              hSeg: 1,
              open: true,
            });
            b.box("black", cx + dx, y + 1.62, -6.36, 0.012, 0.08, 0.005, {
              rz: 0.4 + i,
              seg: false,
              noAO: true,
            });
          }
          for (let k = 0; k < 6; k++)
            b.box(
              k % 3 === 0 ? "lamp_red" : "chrome",
              cx - 0.6 + k * 0.24,
              y + 1.08,
              -5.95 + (k % 2) * 0.05,
              0.03,
              0.03,
              0.08,
              { rx: -0.45, seg: false, noAO: true },
            );
          for (const dx of [-0.35, 0.35]) {
            b.rod(
              "iron",
              PH.v3(cx + dx, y + 1.02, -5.85),
              PH.v3(cx + dx, y + 1.3, -5.7),
              0.015,
              4,
            );
            b.sphere(
              dx < 0 ? "paint_red" : "black",
              cx + dx,
              y + 1.31,
              -5.69,
              0.035,
              { ws: 6, hs: 4, noAO: true },
            );
          }
        }
        PH.colMM(18.2, y, -6.8, 31, y + 1.4, -5.8, { walkable: false });
        // armoured viewport onto the harbour (the old glass_dirty box read as a streaky panel)
        b.quad(PH.harborViewKey(), 33.72, y + 1.9, -2, 7.6, 1.6, {
          ry: -Math.PI / 2,
          uvRect: [0.2, 0.05, 0.2 + 7.6 / 13, 0.95],
        });
        for (const yy of [y + 1.05, y + 2.7])
          b.box("black", 33.66, yy, -2, 0.3, 0.12, 8.0, {
            seg: false,
            noAO: true,
          });
        for (let zz = -6; zz <= 2.01; zz += 1.6)
          b.box("navy_dark", 33.64, y + 1.1, zz, 0.16, 1.6, 0.14, {
            seg: false,
          });
        const cicK = PH.signMat(
          "hudson_cic",
          ["COMBAT INFORMATION CENTER", "CONTACTS: EVERYONE"],
          "stencil",
          768,
          160,
          { bg: "#50565c", fg: "#e8e4d8" },
        );
        b.quad(cicK, 26, y + 3.2, -6.85, 3.2, 0.66, {});
        b.addLight(22, y + 1.8, -5.2, 0x3aff70, 6, 0.35);
        PH.tubeLamp(b, 24, y + h, 0, 2.4, Math.PI / 2, {});
        PH.tubeLamp(b, 31, y + h, -4, 2.4, Math.PI / 2, { dead: true });
        A.cic = PH.A(26, y, 1, Math.PI / 2);
      }
      // BRIDGE (x 18..36, z -7..8, y 18): the pilot house — the Commodore's throne room
      {
        const y = BR,
          x0 = 18,
          x1 = 36,
          W = 7,
          h = 3.6;
        deck(b, "wood", x0, -W, x1, 3, y);
        deck(b, "wood", x0, 3, 21.3, 8.2, y);
        deck(b, "wood", 28.8, 3, x1, 8.2, y);
        PH.railing(
          b,
          [
            [21.3, 3],
            [28.6, 3],
          ],
          y,
          1.0,
          "navy",
          {},
        );
        // window band all round (the harbour glare)
        const winWall = (ax, az, bx, bz) => {
          PH.wall(b, "navyplate", ax, az, bx, bz, y, y + 1.1, [], { t: 0.25 });
          PH.wall(b, "navyplate", ax, az, bx, bz, y + 2.5, y + h, [], {
            t: 0.25,
          });
          const len = Math.hypot(bx - ax, bz - az),
            n = Math.max(1, Math.round(len / 1.2));
          for (let i = 0; i <= n; i++) {
            const t = i / n;
            b.box(
              "navy_dark",
              ax + (bx - ax) * t,
              y + 1.1,
              az + (bz - az) * t,
              0.14,
              1.4,
              0.14,
              { seg: false },
            );
          }
          const ry = Math.atan2(-(bz - az), bx - ax);
          // glass with the harbour beyond (hazy skyline, grime, cracks) — faces the room's centre
          const mx = (ax + bx) / 2,
            mz = (az + bz) / 2,
            nx = Math.sin(ry),
            nz = Math.cos(ry);
          const inward =
            (27 - mx) * nx + (0.6 - mz) * nz > 0 ? ry : ry + Math.PI;
          // one 1024 px tile spans ~13 m so the skyline keeps its proportions; offset per wall so the panes don't repeat
          const u0 = ((ax * 0.37 + az * 0.61) / 13) % 1;
          b.quad(PH.harborViewKey(), mx, y + 1.8, mz, len, 1.4, {
            ry: inward,
            uvRect: [u0, 0.08, u0 + len / 13, 0.92],
          });
          // heavy frame: dark sill & head so the band reads as windows, not a panel
          b.box(
            "black",
            ax + (bx - ax) / 2 - nx * 0,
            y + 1.06,
            az + (bz - az) / 2,
            len,
            0.1,
            0.32,
            { ry, seg: false, noAO: true },
          );
          b.box(
            "black",
            ax + (bx - ax) / 2,
            y + 2.46,
            az + (bz - az) / 2,
            len,
            0.1,
            0.32,
            { ry, seg: false, noAO: true },
          );
          PH.colWall(ax, az, bx, bz, 0.25, y, y + h);
        };
        winWall(x1, -W, x1, 8.2);
        winWall(x0 + 10, -W, x1, -W);
        winWall(28.8, 8.2, x1, 8.2);
        PH.wall(b, "navyplate", x0, -W, x0 + 10, -W, y, y + h, [], { t: 0.25 });
        PH.wall(b, "navyplate", x0, -W, x0, 3, y, y + h, [], { t: 0.25 });
        b.boxMM("navyplate", x0, y + h, -W, x1, y + h + 0.3, 8.2, {
          grime: 0.5,
        });
        PH.colMM(x0, y + h, -W, x1, y + h + 0.3, 8.2, { walkable: false });
        b.addLight(34, y + 1.8, 0, 0xc0c8b0, 12, 0.9);
        b.addLight(30, y + 1.8, -6, 0xc0c8b0, 9, 0.6);
        // helm, engine-order telegraphs, chart table, compass binnacle
        b.cyl("bronze", 32.5, y, 0, 0.25, 0.3, 1.0, 10, { hSeg: 1 });
        b.add("wood_dark", new THREE.TorusGeometry(0.55, 0.05, 6, 20), {
          m: PH.m4(32.1, y + 1.3, 0, Math.PI / 2),
        });
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * TAU;
          b.rod(
            "wood_dark",
            PH.v3(32.1, y + 1.3, 0),
            PH.v3(32.1, y + 1.3 + Math.sin(a) * 0.7, Math.cos(a) * 0.7),
            0.025,
            4,
          );
        }
        for (const z of [-1.6, 1.6]) {
          b.cyl("bronze", 33.2, y, z, 0.18, 0.22, 1.0, 10, { hSeg: 1 });
          b.cyl("chrome", 33.2, y + 1.15, z, 0.3, 0.3, 0.14, 16, {
            rz: Math.PI / 2,
            hSeg: 1,
          });
          b.box("bronze", 33.2, y + 1.15, z, 0.05, 0.45, 0.06, {
            rz: 0.5,
            seg: false,
          });
        }
        b.lathe(
          "bronze",
          [
            [0.25, 0],
            [0.3, 0.9],
            [0.35, 1.1],
            [0.2, 1.3],
          ],
          12,
          30,
          y,
          3.5,
          {},
        );
        b.boxMM("wood_dark", 22, y, -5.6, 25, y + 0.95, -4, { seg: false });
        b.boxMM("paper", 22.1, y + 0.95, -5.5, 24.9, y + 0.97, -4.1, {
          seg: false,
        });
        PH.colMM(22, y, -5.6, 25, y + 0.97, -4, {});
        PH.col(32.8, 0, 1, 4, y, y + 1.3, 0, { walkable: false });
        // the Commodore's throne: a barber chair on a pile of loot, a pirate flag, candles
        // (the throne itself — chair, powder-can dais, flanking shells, scrap backdrop — is in 33_navy_int_dress.js)
        const jrK = PH.texMat(
          "navy_jolly",
          PH.canvasTex("ph_jolly", 8, 8, () => {}),
          { double: true },
        );
        b.quad(jrK, x0 + 0.15, y + 2.1, -2, 2.4, 1.5, { ry: Math.PI / 2 });
        for (let i = 0; i < 6; i++) {
          const x = 21 + r() * 3,
            z = -6 + r() * 1.2;
          b.cyl("paint_white", x, y + 0.97, z, 0.04, 0.04, 0.15, 6, {
            hSeg: 1,
          });
          b.sphere("fire", x, y + 1.16, z, 0.03, { noAO: true });
        }
        PH.col(28, 0, 2, 4, y, y + 0.5, 0, { surface: "wood" });
        const bridgeK = PH.signMat(
          "hudson_bridge",
          ["BRIDGE", "THE COMMODORE IS ALWAYS RIGHT"],
          "raider",
          512,
          192,
          { bg: "#50565c", fg: "#e8d020" },
        );
        b.quad(bridgeK, 18.2, y + 2.8, 1.5, 1.8, 0.66, { ry: Math.PI / 2 });
        A.boss = PH.A(28.6, y + 0.5, 0.4, -Math.PI / 2);
        A.bridge = PH.A(31, y, -3, -Math.PI / 2);
        A.helm = PH.A(31.5, y, 0, -Math.PI / 2);
      }

      // =====================================================================
      // DRESSING — the pirates' occupation layered over the museum ship
      // =====================================================================
      {
        const jolly = PH.texMat(
          "navy_jolly",
          PH.canvasTex("ph_jolly", 8, 8, () => {}),
          { double: true },
        );
        const strLights = (x0, z0, x1, z1, y, sag, n) => {
          for (let t = 0; t <= n; t++) {
            const f = t / n,
              x = x0 + (x1 - x0) * f,
              z = z0 + (z1 - z0) * f,
              yy = y - Math.sin(f * Math.PI) * sag;
            b.sphere(t % 4 === 2 ? "lamp_red" : "lamp", x, yy, z, 0.055, {
              ws: 6,
              hs: 4,
              noAO: true,
            });
            if (t < n) {
              const f2 = (t + 1) / n;
              b.rod(
                "black",
                PH.v3(x, yy, z),
                PH.v3(
                  x0 + (x1 - x0) * f2,
                  y - Math.sin(f2 * Math.PI) * sag,
                  z0 + (z1 - z0) * f2,
                ),
                0.008,
                3,
              );
            }
          }
          b.addLight(
            (x0 + x1) / 2,
            y - sag - 0.4,
            (z0 + z1) / 2,
            0xffc890,
            Math.hypot(x1 - x0, z1 - z0) * 0.6 + 3,
            0.45,
          );
        };
        const barrelFire = (x, y, z) => {
          b.cyl("rust", x, y, z, 0.32, 0.32, 0.95, 10, { hSeg: 1 });
          b.sphere("fire", x, y + 1.0, z, 0.3, { sy: 0.7, noAO: true });
          b.addLight(x, y + 1.8, z, 0xff8a3a, 8, 1.0);
          PH.col(x, z, 0.7, 0.7, y, y + 0.95, 0, { walkable: false });
        };
        // ---- QUARTERDECK: the old museum entrance, now the pirates' customs post ----
        {
          const y = MAIN;
          // the museum's glass display case — smashed, the admiral's bicorne long gone (the Commodore wears it)
          b.boxMM("wood_dark", -43.4, y, 5.6, -41.4, y + 0.9, 7.8, {
            seg: false,
          });
          b.boxMM("glass", -43.3, y + 0.9, 5.7, -41.5, y + 1.8, 7.7, {
            seg: false,
            grime: 0.6,
          });
          b.boxMM("wood_dark", -43.45, y + 1.8, 5.55, -41.35, y + 1.9, 7.85, {
            seg: false,
          });
          b.box("navy_dark", -42.4, y + 0.9, 6.7, 0.4, 0.35, 0.4, {
            seg: false,
          }); // empty hat stand
          for (let i = 0; i < 7; i++)
            b.box(
              "glass",
              -42.4 + (r() - 0.5) * 2.2,
              y + 0.02,
              5.2 + r() * 1.2,
              0.2,
              0.01,
              0.15,
              { ry: r() * 3, seg: false, noAO: true },
            );
          PH.colMM(-43.45, y, 5.55, -41.35, y + 1.9, 7.85, { walkable: false });
          const caseK = PH.signMat(
            "hudson_case",
            [
              "ADMIRAL'S DRESS BICORNE, c.1944",
              "ON LOAN FROM THE NAVAL HISTORY FOUNDATION",
              "(ITEM TEMPORARILY REMOVED)",
            ],
            "engraved",
            768,
            192,
            { bg: "#b8ae98" },
          );
          b.quad(caseK, -41.33, y + 0.6, 6.7, 1.3, 0.34, { ry: Math.PI / 2 });
          PH.readAt(
            -41.1,
            y + 0.9,
            6.7,
            "Museum Display Case",
            'ADMIRAL\'S DRESS BICORNE, c. 1944. On loan from the Naval History Foundation. The glass is smashed. A scrawled card has been wedged into the frame: "REQUISITIONED BY ORDER OF THE COMMODORE. TOUCH MY HAT AND DIE. — H."',
          );
          // tour-group stanchions knocked over, a museum map board
          for (let k = 0; k < 4; k++) {
            b.cyl(
              "chrome",
              -38 + k * 1.5,
              k === 2 ? y + 0.12 : y,
              -6.8,
              0.05,
              0.12,
              0.95,
              8,
              { hSeg: 1, rz: k === 2 ? 1.4 : 0 },
            );
          }
          b.rod(
            "rope",
            PH.v3(-38, y + 0.9, -6.8),
            PH.v3(-36.5, y + 0.8, -6.8),
            0.025,
            4,
          );
          const tourK = PH.signMat(
            "hudson_tour",
            [
              "USS HUDSON MUSEUM",
              "SELF-GUIDED TOUR ▸ FOLLOW THE BLUE LINE",
              "BRIDGE · ENGINE ROOM · MESS DECKS",
            ],
            "enamel",
            768,
            256,
            { bg: "#1c3a5a" },
          );
          b.quad(tourK, -43.8, y + 2.2, 4.8, 2.0, 0.66, { ry: Math.PI / 2 });
          b.boxMM("paint_blue", -43.5, y + 0.005, -0.18, -32, y + 0.012, 0.18, {
            seg: false,
            noAO: true,
          }); // the faded blue tour line
          // pirate customs post: a toll table, a cash box, a weapons rack, loot crates
          b.boxMM("wood", -37.8, y + 0.75, 1.4, -35.4, y + 0.8, 2.8, {
            seg: false,
          });
          for (const [x, z] of [
            [-37.6, 1.5],
            [-35.6, 1.5],
            [-37.6, 2.7],
            [-35.6, 2.7],
          ])
            b.box("iron", x, y, z, 0.05, 0.75, 0.05, { seg: false });
          PH.colMM(-37.8, y, 1.4, -35.4, y + 0.8, 2.8, {});
          b.box("metal", -36.2, y + 0.8, 2.1, 0.5, 0.18, 0.35, { seg: false });
          for (let i = 0; i < 14; i++)
            b.cyl(
              "chrome",
              -37.4 + r() * 1.2,
              y + 0.8,
              1.6 + r() * 1.0,
              0.03,
              0.03,
              0.005,
              8,
              { hSeg: 1 },
            ); // scrip
          const tollK = PH.signMat(
            "hudson_toll",
            ["TOLL BOOTH", "BOARDING FEE: 100 SCRIP", "LEAVING FEE: 200 SCRIP"],
            "raider",
            512,
            256,
            { bg: "#4a4a44", fg: "#e8d020" },
          );
          b.quad(tollK, -36.6, y + 1.35, 1.38, 1.2, 0.6, {
            ry: Math.PI,
            rx: -0.2,
          });
          for (let k = 0; k < 5; k++)
            b.beam(
              "rust",
              PH.v3(-43.7, y + 0.3, -8.2 + k * 0.5),
              PH.v3(-43.5, y + 1.7, -8.1 + k * 0.5),
              0.05,
              0.05,
            ); // leaning rifles
          b.boxMM("wood", -43.8, y + 1.5, -8.6, -43.3, y + 1.6, -5.6, {
            seg: false,
          });
          PH.crates(b, -34.5, y, 7.2, 0.1, 4, { collide: false });
          PH.col(-34.5, 7.65, 3, 1.8, y, y + 0.9, 0.1, { walkable: false });
          b.quad(jolly, -32.18, y + 2.4, 7.4, 2.2, 1.4, { ry: -Math.PI / 2 });
          strLights(-43.5, -7.5, -32.5, 7.5, y + 3.8, 0.6, 22);
          barrelFire(-39.5, y, -6.5);
        }
        // ---- MESS HALL: the pirates' living room ----
        {
          const y = SEC;
          strLights(15.5, -7.5, 35.5, 7.5, y + 3.9, 0.7, 26);
          strLights(15.5, 7.5, 35.5, -7.5, y + 3.9, 0.7, 26);
          // beer kegs & a jury-rigged tap, crates of Fizzo, a dartboard with a Commodore portrait
          for (let k = 0; k < 4; k++) {
            const kx = 22.7 + (k % 3) * 1.0,
              ky = y + (k > 2 ? 0.95 : 0);
            b.cyl("wood_dark", kx, ky, -8.2, 0.42, 0.42, 0.9, 12, { hSeg: 1 });
            for (const hy of [0.2, 0.7])
              b.cyl("rust", kx, ky + hy, -8.2, 0.44, 0.44, 0.06, 12, {
                hSeg: 1,
              });
          }
          b.rod(
            "chrome",
            PH.v3(22.7, y + 1.85, -8.2),
            PH.v3(22.7, y + 2.1, -7.6),
            0.03,
            5,
          ); // the tap
          PH.colMM(22.2, y, -8.7, 25.2, y + 1.9, -7.7, { walkable: false });
          const dartK = PH.signMat(
            "hudson_dart",
            ["WANTED", "REGISTRAR A. VELL", "FOR REFUSING", "A FAIR TOLL"],
            "paper",
            256,
            320,
          );
          b.quad(dartK, 35.84, y + 1.9, 3.5, 0.7, 0.9, { ry: -Math.PI / 2 });
          b.cyl("cardboard", 35.82, y + 1.9, 5.2, 0.35, 0.35, 0.05, 16, {
            rz: Math.PI / 2,
            hSeg: 1,
            c: 0x8a6a3a,
          });
          for (let i = 0; i < 4; i++)
            b.rod(
              "iron",
              PH.v3(35.3, y + 1.8 + (r() - 0.5) * 0.4, 5.2 + (r() - 0.5) * 0.4),
              PH.v3(35.8, y + 1.9, 5.2),
              0.01,
              3,
            );
          // card game frozen mid-hand, jet inhalers, bottles
          for (let i = 0; i < 10; i++)
            b.box(
              "paper",
              23 + r() * 10,
              y + 0.785,
              -3.8 + r() * 0.6,
              0.07,
              0.004,
              0.1,
              { ry: r() * 3, seg: false, noAO: true },
            );
          for (let i = 0; i < 8; i++)
            b.cyl(
              i % 2 ? "glass" : "paint_red",
              22.6 + r() * 11,
              y + 0.78,
              0.2 + (r() - 0.5) * 0.5,
              0.04,
              0.05,
              0.22,
              6,
              { hSeg: 1 },
            );
          PH.skeleton(b, 26.5, y, -2, 0.4, { sit: true });
          // the pirates' "trophy" — a Registry skiff's nameboard nailed to the bulkhead
          const skiffK = PH.signMat(
            "hudson_skiffboard",
            ["REGISTRY SKIFF No.2", '"MARTA\'S PROMISE"'],
            "engraved",
            512,
            128,
            { bg: "#2a4a5a", fg: "#e8e0c8" },
          );
          b.quad(skiffK, 35.84, y + 3.0, 5.2, 2.2, 0.55, { ry: -Math.PI / 2 });
          barrelFire(21.5, y, 2.2);
        }
        // ---- CREW BERTHING: pirate squalor ----
        {
          const y = SEC;
          strLights(-43, 0, -21, 0, y + 3.6, 0.5, 20);
          for (const [x, z] of [
            [-36, 1.2],
            [-31, -1.5],
          ])
            b.box("fabric", x, y, z, 1.9, 0.22, 0.9, {
              ry: r() - 0.5,
              seg: false,
              c: 0x5a4a38,
            });
          barrelFire(-33.5, y, 1.8);
          for (let i = 0; i < 12; i++) {
            const lay = r() < 0.5;
            b.cyl(
              i % 3 ? "glass" : "metal",
              -43 + r() * 22,
              lay ? y + 0.05 : y,
              -1.8 + r() * 3.6,
              0.04,
              0.05,
              0.22,
              6,
              { hSeg: 1, rz: lay ? Math.PI / 2 : 0 },
            );
          }
        }
        // ---- BRIDGE: the Commodore's throne room ----
        {
          const y = BR;
          // radar & sonar consoles along the aft wall, a hand-drawn harbor chart (Ellis circled)
          for (let i = 0; i < 4; i++) {
            b.boxMM(
              "navy_dark",
              18.3,
              y,
              -6.6 + i * 1.6,
              19.3,
              y + 1.3,
              -5.2 + i * 1.6,
              { seg: false },
            );
            b.cyl(
              PH.hudsonPPI(),
              19.32,
              y + 1.0,
              -5.9 + i * 1.6,
              0.36,
              0.36,
              0.03,
              16,
              { rz: Math.PI / 2, rx: i * 1.1, hSeg: 1, noAO: true },
            );
          }
          PH.colMM(18.3, y, -6.6, 19.3, y + 1.3, -0.2, { walkable: false });
          const chartK = PH.texMat("hudson_chart", harborChartTex(), {});
          b.quad(chartK, 23.5, y + 0.98, -4.8, 2.8, 1.5, { rx: -Math.PI / 2 });
          PH.readAt(
            23.5,
            y + 1.1,
            -4.8,
            "Harbor Chart",
            'A old-world Coast & Geodetic Survey chart of Upper New York Bay, annotated in grease pencil. Ellis Island is circled three times: "ELLIS SKIFFS — DAWN." The Statue of Liberty is labelled "DO NOT GO NEAR (ROBOTS)". The Battery is marked "TOLL". A skull is drawn over the Navy Yard with the word "HOME".',
          );
          // loot hoard around the throne: gold-framed paintings, a jukebox, scrip sacks
          for (let i = 0; i < 5; i++) {
            const zz = (r() < 0.5 ? -1 : 1) * (2.3 + r() * 1.1);
            b.box("burlap", 26.4 + r() * 3.2, y, zz, 0.5, 0.45, 0.45, {
              ry: r() * 3,
              seg: false,
              c: 0xa89060,
            });
          }
          b.boxMM("paint_red", 34.4, y, 5.2, 35.6, y + 1.7, 7.2, {
            seg: false,
          });
          b.boxMM("lamp", 34.35, y + 1.1, 5.4, 34.4, y + 1.5, 7.0, {
            seg: false,
            noAO: true,
          });
          PH.colMM(34.4, y, 5.2, 35.6, y + 1.7, 7.2, { walkable: false });
          for (const [x, z, ry] of [
            [21, -6.8, 0],
            [25.5, -6.8, 0],
          ]) {
            b.box("bronze", x, y + 1.2, z, 1.2, 0.9, 0.06, { ry, seg: false });
            b.box("paint_teal", x, y + 1.3, z + 0.04, 0.95, 0.65, 0.02, {
              ry,
              seg: false,
            });
          }
          strLights(19, -6.5, 35, -6.5, y + 3.4, 0.4, 16);
          b.quad(jolly, 35.6, y + 3.0, 1, 2.2, 1.0, { ry: -Math.PI / 2 });
        }
      }

      // ---------------- props ----------------
      PH.propAt("footlocker", 31, BR, 4.4, Math.PI, {
        loot: "raider_stash",
        name: "The Commodore's Sea Chest",
        lock: PH.regLock({
          id: "ph_lk_hud_chest",
          label: "The Commodore's Sea Chest",
          kind: "container",
          code: "0704",
          hint: "The Commodore's standing orders on the bridge give his chest combination.",
        }),
      });
      PH.propAt("mattress", 31.5, BR, 6.8, 0, {});
      PH.propAt("footlocker", 16.8, SEC, 8.2, Math.PI / 2, {
        loot: "raider_stash",
        name: "Pirate Loot",
      });
      PH.propAt("ammo_box", -24, SEC, -3.2, 0, { loot: "ammo_box" });
      PH.propAt("safe", 1.5, MAIN, -8.2, 0, {
        items: [
          ["scrip", 220],
          ["old_dollars", 3],
          ["rally_tonic", 2],
          ["ammo_12ga", 16],
        ],
        name: "Captain's Safe",
        lock: PH.regLock({
          id: "ph_lk_hud_safe",
          label: "Captain's Safe",
          kind: "safe",
          code: "1944",
          hint: "Captain Delacroix's log reel gives the safe combination.",
        }),
      });
      PH.propAt("terminal", 10.5, HOLD, -7.6, Math.PI, {
        terminalId: "ph_hudson_engineering",
      });
      PH.propAt("terminal", 8, MAIN + 0.8, 6.5, Math.PI, {
        mount: "bare",
        terminalId: "ph_hudson_radio",
      });
      PH.propAt("first_aid", 19.6, MAIN + 1.3, -7.5, -Math.PI / 2, {
        loot: "medical_cabinet",
      });
      PH.propAt("ammo_box", 42.2, HOLD, 2.8, -Math.PI / 2, {
        large: true,
        items: [
          ["ammo_missile", 2],
          ["frag_grenade", 3],
          ["ammo_556", 60],
        ],
        name: "Harbor Defense Munitions",
      });
      PH.propAt("crate", 41, HOLD, -4, 0, { kind: "army" });
      PH.propAt("footlocker", 37.3, SEC, -6.5, Math.PI / 2, {
        loot: "raider",
        name: "Brig Sentry's Footlocker",
      });
      PH.propAt("file_cabinet", -30.8, MAIN, 8.4, Math.PI, {
        loot: "file_cabinet",
      });
      PH.propAt("radio", 11, MAIN + 0.8, 6.2, Math.PI, {});
      PH.propAt("first_aid", -43.7, SEC + 1.3, 3, Math.PI / 2, {
        loot: "first_aid",
      });

      if (PH.hudsonDress)
        PH.safe("hudson dress", () =>
          PH.hudsonDress(b, { HOLD, SEC, MAIN, O1, BR }),
        );
      PH.fillVoid(-56, -22, 56, 22, [[-44.3, -9.3, 44.3, 9.3]], [], 2, 3.2);
      const g = b.build(root, { interior: true });
      g.name = "hudson_interior";
      PH.setOrigin(0, 0);

      // ---------------- doors ----------------
      const N = PH.NAVY;
      try {
        G.world.addDoor({
          id: "ph_hudson_front",
          pos: PH.v3(N.door.x, N.door.y + 1.2, N.door.z),
          label: "USS Hudson — Quarterdeck",
          verb: "Board",
          radius: 1.4,
          target: {
            x: A.entrance.x,
            y: MAIN + 0.05,
            z: A.entrance.z,
            yaw: -Math.PI / 2,
          },
          sound: "door_open",
        });
        G.world.addDoor({
          id: "ph_hudson_exit",
          pos: PH.v3(O.x - 43.8, MAIN + 1.2, O.z),
          label: "Main Deck",
          verb: "Exit",
          radius: 1.4,
          target: N.door.exit
            ? {
                x: N.door.exit.x,
                y: N.door.y + 0.05,
                z: N.door.exit.z,
                yaw: N.door.exit.yaw,
              }
            : {
                x: N.door.x - 2.4,
                y: N.door.y + 0.05,
                z: N.door.z,
                yaw: Math.PI / 2,
              },
          sound: "door_open",
        });
        // ammunition hoist: magazine ↔ main-deck forward hall (works once the magazine is open)
        const hoist = (from, to, label) =>
          G.world.addInteractable({
            pos: from.clone().setY(from.y + 1.2),
            radius: 0.9,
            label,
            verb: "Ride",
            priority: 1,
            locked: () =>
              PH.flag("hudson_mag_open") ? null : "Locked (hoist interlock)",
            onInteract() {
              if (!PH.flag("hudson_mag_open")) {
                PH.sfx("door_locked");
                G.notify(
                  "The hoist interlock is tied to the magazine door. Open the magazine first.",
                );
                return;
              }
              PH.sfx("door_open");
              G.fadeTransition(() =>
                G.player.teleport(to.x, to.y + 0.05, to.z, to.yaw || 0),
              );
            },
          });
        hoist(A.hoist_high, A.hoist_low, "Ammunition Hoist (Magazine)");
        hoist(A.hoist_low, A.hoist_high, "Ammunition Hoist (Main Deck)");
        // magazine armoured door (fire room side): the Commodore's key ring
        const magLock = PH.regLock({
          id: "ph_lk_hud_magazine",
          label: "Magazine Hatch",
          kind: "door",
          key: "ph_key_hudson",
          hint: "Commodore Hatch wears the magazine key on the bridge.",
        });
        G.world.addInteractable({
          pos: PH.v3(O.x + 22, 1.2, O.z - 3),
          radius: 0.9,
          label: "Magazine Hatch",
          verb: "Open",
          priority: 1,
          locked: () => (PH.flag("hudson_mag_open") ? null : "Locked"),
          onInteract() {
            if (PH.flag("hudson_mag_open")) return;
            PH.lockOpen(magLock, () => {
              PH.setFlag("hudson_mag_open");
              PH.sfx("door_open");
              G.notify("The Commodore's key spins the magazine dogs open.");
            });
          },
        });
        // brig cell door (the captive): the Brig Sentry's key (the Commodore's ring opens it too)
        const brigLock = PH.regLock({
          id: "ph_lk_hud_brig",
          label: "Brig Cell",
          kind: "door",
          key: "ph_key_brig",
          hint: "The Brig Sentry outside the cells carries the brig key.",
        });
        G.world.addInteractable({
          pos: PH.v3(O.x + 40.5, SEC + 1.2, O.z),
          radius: 0.8,
          label: "Brig Cell",
          verb: "Open",
          priority: 1,
          enabled: () => !PH.flag("hudson_cell_open"),
          locked: () => (PH.flag("hudson_cell_open") ? null : "Locked"),
          onInteract() {
            if (PH.hasItem("ph_key_hudson")) {
              PH.openCell();
              return;
            }
            PH.lockOpen(brigLock, () => PH.openCell());
          },
        });
      } catch (e) {
        PH.safe("hudson doors", () => {
          throw e;
        });
      }
      PH.openCell = function () {
        PH.setFlag("hudson_cell_open");
        PH.sfx("door_open");
        G.notify("The cell door grinds open.");
        G.events.emit("phCellOpened");
      };
      PH.lockBlocker("hudson_mag_open", O.x + 22, O.z - 3, 0.5, 1.2, 0, 2.2);
      PH.lockBlocker(
        "hudson_cell_open",
        O.x + 40.5,
        O.z,
        0.2,
        1.2,
        SEC,
        SEC + 2.4,
      );

      PH.register("uss_hudson", {
        root: PH.navyExt ? PH.navyExt.root : null,
        interiorRoot: root,
        interiorKey: "uss_hudson",
        anchors: Object.assign({}, PH.navyExt ? PH.navyExt.anchors : {}, A, {
          interior_entrance: A.entrance,
        }),
      });
      // the site id is navy_yard: alias it
      G.pois.navy_yard = G.pois.uss_hudson;
    },
    32,
  );
