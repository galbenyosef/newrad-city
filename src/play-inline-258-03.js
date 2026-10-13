// play-inline-258 03 — grime
// Lines 137-836 of readable/play-inline-258.pretty.js (statement-aligned).
  function buildInterior(cell) {
    const b = PF.batch("mb_int");
    b.ground = O.y;
    const an = {};
    b.setLights(
      [
        // bonfire + oil drums (warm, flickering), cold daylight shafts from the cable ports, green glow of a rad barrel
        L(0, 1.6, -2, 0xff8a30, 16, 1.4),
        L(-9, 1.2, 6, 0xff7a28, 8, 0.8),
        L(9, 1.2, -8, 0xff7a28, 8, 0.8),
        L(-6, 20, 8, 0x9ab0c0, 12, 0.6),
        L(6, 20, 8, 0x9ab0c0, 12, 0.6),
        L(0, 12, -6, 0xff9a50, 14, 0.35),
        L(0, 2.6, 18, 0xffb060, 6, 0.6),
        L(-20, 3, -13, 0xff6a30, 8, 0.8),
        L(-20, 3, -3, 0xffb060, 8, 0.8),
        L(-20, 3, 7, 0xff8a40, 8, 0.8),
        L(19.5, 3, 5, 0x7aff90, 6, 0.6),
        L(19.5, 8, -2, 0xffc070, 8, 0.5),
        L(19.5, 13, 11, 0xffc070, 8, 0.6),
        L(19.5, 18, -2, 0xffc070, 8, 0.5),
        L(19.5, 22, 11.4, 0xffd8a0, 7, 0.8),
        L(12.5, 12, -2, 0xff8a40, 8, 0.4),
        L(0, -3, -24, 0xff3020, 6, 0.7),
        L(0, -3.5, -40, 0xff7a28, 12, 1.1),
        L(-8, -3.5, -34, 0x7aff40, 8, 0.6),
        L(8, -3.5, -36, 0xff6a30, 8, 0.6),
        // wall torches (oil-drum braziers on brackets) washing the brick
        L(-13, 4, -12, 0xff8a40, 9, 0.8),
        L(-13, 4, 0, 0xff8a40, 9, 0.8),
        L(-13, 4, 9, 0xff8a40, 9, 0.8),
        L(13, 4, -12, 0xff8a40, 9, 0.8),
        L(13, 4, 2, 0xff8a40, 9, 0.8),
        L(0, 5, 10.5, 0xff9a50, 10, 0.8),
        L(0, 6, -16.5, 0xff7a30, 10, 0.9),
      ],
      0x2a2018,
      1.0,
    );

    BK.inFrame(b, O.x, O.y, O.z, function () {
      const bk = "brick_dark";
      // ---------------------------------------------------------------- ENTRY PASSAGE (x ±2.5, z 12..22)
      b.boxMM("concrete_dark", -2.5, -0.3, 12, 2.5, 0, 22, { grime: 0.7 });
      PF.colMM(-3.3, -1, 12, 3.3, 0, 22.8, {});
      PF.wall(b, bk, "z", 12.8, 22.8, -3.3, -2.5, 0, 6, [], {});
      PF.wall(b, bk, "z", 12.8, 22.8, 2.5, 3.3, 0, 6, [], {});
      PF.wall(b, bk, "x", -3.3, 3.3, 22, 22.8, 0, 6, [], {});
      BK.barrelZ(b, bk, 12.8, 22, 0, 2.5, 3.4, 0.8, { tile: 3 });
      b.boxMM("rust", -1.2, 0, 21.8, 1.2, 2.8, 22, { seg: false, grime: 0.8 });
      an.entrance = A(0, 0, 19.5, 0);
      const gr = PF.texMat(
        "mb_int_graf",
        PF.graffitiTex("mb_int_graf", ["GOOD HUMIE", "= IN CAN"], 512, 256, {
          color: "#9aff40",
        }),
        { transparent: true, rough: 1 },
      );
      b.quad(gr, 2.45, 2.4, 16.5, 4, 2, { ry: -HP });
      for (let z = 14; z < 22; z += 3) {
        b.sphere("gore", -2.1, 2.6, z, 0.35, { ws: 8, hs: 6, sy: 1.4 });
        b.beam("rust", V3(-2.1, 4.8, z), V3(-2.1, 3.1, z), 0.03, 0.03, {});
      }

      // ---------------------------------------------------------------- CABLE CHAMBER (x ±14, z -18..12)
      b.boxMM("concrete_dark", -14, -0.3, -18, 14, 0, 12, { grime: 0.8 });
      PF.colMM(-14.8, -1, -18, 14.8, 0, 12.8, {});
      PF.wall(
        b,
        bk,
        "x",
        -14.8,
        14.8,
        12,
        12.8,
        0,
        26,
        [{ c: 0, w: 5, y0: 0, h: 4.5 }],
        {},
      );
      PF.wall(
        b,
        bk,
        "x",
        -14.8,
        14.8,
        -18.8,
        -18,
        0,
        26,
        [{ c: 0, w: 4, y0: 0, h: 5 }],
        {},
      );
      PF.wall(
        b,
        bk,
        "z",
        -18.8,
        12.8,
        -14.8,
        -14,
        0,
        26,
        [
          { c: -13.2, w: 3, y0: 0, h: 4 },
          { c: -3, w: 3, y0: 0, h: 4 },
          { c: 7.2, w: 3, y0: 0, h: 4 },
        ],
        {},
      );
      PF.wall(
        b,
        bk,
        "z",
        -18.8,
        12.8,
        14,
        14.8,
        0,
        26,
        [
          { c: 11, w: 2.4, y0: 0, h: 3.4 },
          { c: 11.2, w: 2.0, y0: 10, h: 3 },
        ],
        {},
      );
      BK.barrelZ(b, bk, -18.8, 12.8, 0, 14.1, 16, 0.55, { tile: 3, nu: 20 });
      // transverse granite ribs + wall pilasters
      for (const z of [-12, -6, 0, 6]) {
        let prev = null;
        for (let k = 0; k <= 16; k++) {
          const a = (k / 16) * PI;
          const p = V3(
            -Math.cos(a) * 13.7,
            16 + Math.sin(a) * 13.7 * 0.55 - 0.4,
            z,
          );
          if (prev)
            BK.beamOriented(
              b,
              "granite_block",
              prev,
              p,
              0.9,
              1.1,
              BK.perpUp(prev, p, V3(0, 0, 1)),
              0.4,
            );
          prev = p;
        }
        for (const x of [-13.6, 13.6])
          b.box("granite_block", x, 0, z, 0.9, 16, 1.2, {
            seg: false,
            grime: 0.5,
          });
      }
      // cable ports high in the south vault (daylight)
      for (const x of [-6, 6]) {
        b.boxMM("lamp_blue", x - 1.4, 18.5, 11.9, x + 1.4, 21.5, 11.95, {
          seg: false,
        });
        PF.glow(W(x, 20, 11.2), 0xa8c0d8, 4.2, cell.root, {
          intensity: 0.8,
          dayFactor: 1,
        });
      }
      // the four eyebar chains + anchor grillage
      const dir = V3(0, Math.sin(0.73), Math.cos(0.73));
      for (const x of [-9, -4.5, 4.5, 9]) {
        chain(b, V3(x, 0.3, -15), dir, 7, 4.6, 1.5);
        for (let z = -15; z < -12; z += 0.8) {
          const y = (z + 15) * Math.tan(0.73);
          PF.col(x, z + 0.4, 1.8, 0.9, 0, y + 0.8, 0, {
            walkable: false,
            surface: "metal",
          });
        }
      }
      b.boxMM("rust", -11.5, 0, -16.6, 11.5, 1.2, -14.8, { grime: 0.7 });
      for (let x = -11; x <= 11; x += 1.1)
        b.box("iron", x, 0, -15.7, 0.3, 1.3, 1.9, { seg: false });
      PF.colMM(-11.5, 0, -16.6, 11.5, 1.2, -14.8, { surface: "metal" });
      // lair: bonfire, bedding, gore, skull totems, scrap throne-ish seat, tyres
      b.rock("rubble", 0, -0.3, -2, 1.3, { flat: 0.35, rough: 0.4, seed: 5 });
      b.cyl("fire", 0, 0.2, -2, 0.7, 1.0, 0.7, 10, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      PF.glow(W(0, 1.2, -2), 0xff8a30, 3.8, cell.root, {
        intensity: 1.3,
        flicker: 0.4,
      });
      PF.col(0, -2, 2.4, 2.4, 0, 0.6, 0, { walkable: false });
      for (const [x, z] of [
        [-9, 6],
        [9, -8],
        [11, 9],
      ]) {
        PF.barrel(b, x, 0, z, { fire: true });
        PF.glow(W(x, 1.1, z), 0xff7a28, 1.8, cell.root, {
          intensity: 0.9,
          flicker: 0.35,
        });
      }
      for (const [x, z] of [
        [-13.4, -12],
        [-13.4, 0],
        [-13.4, 9],
        [13.4, -12],
        [13.4, 2],
      ]) {
        const s = Math.sign(x);
        b.beam(
          "rust",
          V3(x + s * 0.5, 3.2, z),
          V3(x - s * 0.2, 3.6, z),
          0.08,
          0.08,
          {},
        );
        b.cyl("rust", x - s * 0.25, 3.6, z, 0.28, 0.2, 0.35, 8, { hSeg: 1 });
        b.cyl("fire", x - s * 0.25, 3.95, z, 0.12, 0.22, 0.35, 8, {
          hSeg: 1,
          noAO: true,
          grime: 0,
        });
        PF.glow(W(x - s * 0.25, 4.3, z), 0xff8a30, 1.6, cell.root, {
          intensity: 1.0,
          flicker: 0.4,
        });
      }
      for (const [x, z, ry] of [
        [-10, -6, 0.3],
        [-7, 2, 1.2],
        [8, 3, -0.4],
        [10.5, -3, 0.9],
        [-3, 8, 1.8],
      ])
        D.mattress(b, x, 0, z, ry, 0x7a6a50);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * PI * 2;
        PF.skeleton(b, Math.cos(a) * 4.2, 0.02, -2 + Math.sin(a) * 4.2, a);
      }
      for (const [x, z] of [
        [-5, 10.5],
        [5, 10.5],
        [-12.5, -9],
        [12.5, 6],
      ]) {
        b.beam("rust", V3(x, 0, z), V3(x, 3.2, z), 0.1, 0.1, {});
        for (let k = 0; k < 3; k++)
          b.sphere("bone", x, 2.2 + k * 0.42, z, 0.19, {
            ws: 7,
            hs: 5,
            sy: 1.15,
          });
      }
      const blood = PF.texMat("mb_blood", bloodTex(), {
        transparent: true,
        rough: 0.35,
      });
      for (const [x, z, s] of [
        [2, 4, 3],
        [-4, -6, 2.4],
        [7, -10, 2],
        [-11, 3, 2.6],
      ])
        b.quad(blood, x, 0.02, z, s, s, {
          rx: -HP,
          rz: x,
          noAO: true,
          grime: 0,
        });
      // scrap seat (the Lookout's perch) from car seats and tyres
      b.boxMM("awning_red", -2.5, 0, -12.5, 2.5, 0.8, -11.2, {
        seg: false,
        grime: 0.8,
      });
      b.boxMM("awning_red", -2.5, 0.8, -12.8, 2.5, 2.2, -12.3, {
        seg: false,
        grime: 0.8,
      });
      for (const x of [-3.4, 3.4])
        for (let k = 0; k < 3; k++) {
          const tg = new THREE.TorusGeometry(0.4, 0.15, 5, 10);
          tg.rotateX(HP);
          b.add("tire", tg, {
            m: PF.m4(x, 0.15 + k * 0.28, -11.8),
            noAO: true,
          });
        }
      PF.colMM(-3.8, 0, -12.8, 3.8, 0.8, -11.2, {});
      const gr2 = PF.texMat(
        "mb_int_graf2",
        PF.graffitiTex("mb_int_graf2", ["IRONJAW", "BRIDGE BOSS"], 512, 256, {
          color: "#d8302a",
          tag: "skull",
        }),
        { transparent: true, rough: 1 },
      );
      b.quad(gr2, 0, 7, -17.95, 9, 4.5, { grime: 0.1 });
      an.chamber = A(0, 0, 4, 0);

      // ---------------------------------------------------------------- CATWALK (x 11..14, y 10)
      b.boxMM("diamond", 11, 9.8, -16, 14, 10, 12, { grime: 0.6 });
      PF.colMM(11, 9.6, -16, 14, 10, 12, { surface: "metal" });
      PF.railing(
        b,
        [
          [11.1, -16],
          [11.1, 12],
        ],
        10,
        1.05,
        "iron",
        { collide: true, postStep: 2.5 },
      );
      PF.railing(
        b,
        [
          [11.1, -16],
          [14, -16],
        ],
        10,
        1.05,
        "iron",
        { collide: true },
      );
      for (let z = -15; z < 12; z += 4)
        b.beam("iron", V3(14, 7.5, z), V3(11.3, 9.8, z), 0.15, 0.15, {});
      PF.sandbags(b, 11.4, -2, 11.4, 1.5, 2, { y: 10 });

      // ---------------------------------------------------------------- WEST BAYS (x -26..-14.8)
      b.boxMM("concrete_dark", -26, -0.3, -18, -14.8, 0, 12, { grime: 0.8 });
      PF.colMM(-26.8, -1, -18.8, -14.8, 0, 12.8, {});
      PF.wall(b, bk, "z", -18.8, 12.8, -26.8, -26, 0, 8, [], {});
      PF.wall(b, bk, "x", -26.8, -14.8, -18.8, -18, 0, 8, [], {});
      PF.wall(b, bk, "x", -26.8, -14.8, 12, 12.8, 0, 8, [], {});
      PF.wall(b, bk, "x", -26, -14.8, -8.4, -7.6, 0, 8, [], {});
      PF.wall(b, bk, "x", -26, -14.8, 1.6, 2.4, 0, 8, [], {});
      for (const [z0, z1] of [
        [-18, -8.4],
        [-7.6, 1.6],
        [2.4, 12],
      ])
        BK.barrelX(b, bk, -26, -14.8, (z0 + z1) / 2, (z1 - z0) / 2, 4.2, 0.55, {
          tile: 3,
        });
      // larder (z -18..-8.4): meat rail with hanging carcass sacks, butcher block, blood
      b.boxMM("rust", -25.5, 3.6, -13.4, -15.5, 3.75, -13.0, { seg: false });
      for (let x = -25; x < -16; x += 1.4) {
        b.beam("iron", V3(x, 3.6, -13.2), V3(x, 2.9, -13.2), 0.03, 0.03, {});
        b.sphere("gore", x, 2.2, -13.2, 0.42, { ws: 8, hs: 6, sy: 1.7 });
      }
      b.boxMM("planks", -24, 0, -10.8, -21, 0.95, -9.4, {
        grime: 0.9,
        seg: false,
      });
      PF.colMM(-24, 0, -10.8, -21, 0.95, -9.4, { walkable: false });
      b.sphere("meat", -22.6, 1.05, -10.1, 0.35, { ws: 8, hs: 5, sy: 0.6 });
      for (const [x, z] of [
        [-20, -16],
        [-24.5, -15.5],
        [-17, -10],
      ])
        b.quad(blood, x, 0.02, z, 2.2, 2.2, {
          rx: -HP,
          rz: z,
          noAO: true,
          grime: 0,
        });
      PF.skeleton(b, -18.5, 0.02, -16.5, 0.4);
      PF.skeleton(b, -24.5, 0.02, -11.5, 2.2);
      an.larder = A(-20, 0, -13, HP);
      // the pen (z -7.6..1.6): cages
      const cage = (cx, cz, open) => {
        const s = 1.25,
          h = 2.6;
        for (let i = 0; i <= 6; i++) {
          const t = -s + (i * s) / 3;
          for (const [px, pz] of [
            [cx + t, cz - s],
            [cx + t, cz + s],
            [cx - s, cz + t],
            [cx + s, cz + t],
          ]) {
            if (
              open &&
              Math.abs(px - (cx + s)) < 0.01 &&
              Math.abs(pz - cz) < 0.8
            )
              continue;
            b.box("iron", px, 0, pz, 0.06, h, 0.06, { seg: false, grime: 0.5 });
          }
        }
        for (const y of [0.05, h])
          b.boxMM(
            "iron",
            cx - s - 0.05,
            y,
            cz - s - 0.05,
            cx + s + 0.05,
            y + 0.08,
            cz + s + 0.05,
            { seg: false },
          );
        b.boxMM("planks", cx - s, 0.05, cz - s, cx + s, 0.12, cz + s, {
          seg: false,
          grime: 0.9,
        });
        // colliders: 3 closed sides always, the door side (east) is a separate removable collider
        PF.colMM(cx - s - 0.1, 0, cz - s - 0.1, cx + s + 0.1, h, cz - s + 0.1, {
          walkable: false,
          surface: "metal",
        });
        PF.colMM(cx - s - 0.1, 0, cz + s - 0.1, cx + s + 0.1, h, cz + s + 0.1, {
          walkable: false,
          surface: "metal",
        });
        PF.colMM(cx - s - 0.1, 0, cz - s, cx - s + 0.1, h, cz + s, {
          walkable: false,
          surface: "metal",
        });
      };
      cage(-22.5, -5.2, false);
      cage(-22.5, -0.6, false);
      cage(-17.8, -5.4, true);
      PF.skeleton(b, -17.8, 0.14, -5.4, 1.4);
      an.cage1 = A(-22.5, 0.12, -5.2, -HP);
      an.cage2 = A(-22.5, 0.12, -0.6, -HP);
      an.pen = A(-19.5, 0, -3, HP);
      D.papers(b, -19, 0, -2, 1.5, 8, 71);
      // trophy vault (z 2.4..12): loot piles, rack of scrap weapons, trade wagon goods
      D.crates(b, -24.8, 0, 10.5, 2, 81);
      D.crates(b, -23.2, 0, 10.8, 1, 82);
      D.crates(b, -16.4, 0, 10.8, 3, 83);
      for (let i = 0; i < 6; i++)
        b.box(
          "iron",
          -25.6,
          0.9 + (i % 2) * 0.5,
          4 + i * 0.9,
          0.12,
          0.08,
          1.2,
          { rz: 0.2, seg: false },
        );
      b.boxMM("planks", -26, 0, 3.4, -25.3, 2.2, 9.6, {
        seg: false,
        grime: 0.8,
      });
      for (let i = 0; i < 4; i++)
        PF.barrel(b, -20 + (i % 2) * 0.7, 0, 10.6 - (i > 1 ? 0.7 : 0), {
          key: "paint_teal",
        });
      const cv = PF.texMat(
        "mb_caravan",
        PF.signTex(
          "mb_caravan",
          ["REYES & TRAN", "CANAL ST. TRADE WAGON CO."],
          "enamel",
          512,
          192,
          { bg: "#6a3a1c" },
        ),
        { rough: 0.9 },
      );
      b.quad(cv, -19, 1.8, 11.95, 3.2, 1.2, { ry: PI });
      an.trophy = A(-20, 0, 7, HP);

      // ---------------------------------------------------------------- EAST STAIR HALL (x 14.8..24.2, z -4.8..12.8)
      b.boxMM("concrete_dark", 14.8, -0.3, -4.8, 24.2, 0, 12.8, { grime: 0.8 });
      PF.colMM(14.8, -1, -5.6, 25, 0, 13.6, {});
      PF.wall(
        b,
        bk,
        "z",
        -5.6,
        13.6,
        24.2,
        25,
        0,
        26,
        [{ c: 11.4, w: 1.6, y0: 20, h: 2.4 }],
        {},
      );
      PF.wall(b, bk, "x", 14, 25, -5.6, -4.8, 0, 26, [], {});
      PF.wall(b, bk, "x", 14, 25, 12.8, 13.6, 0, 26, [], {});
      b.boxMM(bk, 14, 25.4, -5.6, 25, 26, 13.6, { seg: false });
      const lanes = [17, 21.8];
      PF.stairs(b, "granite_block", lanes[0], 10, PI, 2.8, 10, 0, 5, {
        maxRise: 0.34,
      });
      PF.stairs(b, "granite_block", lanes[1], 0, 0, 2.8, 10, 5, 10, {
        base: 4.8,
        maxRise: 0.34,
      });
      PF.stairs(b, "granite_block", lanes[0], 10, PI, 2.8, 10, 10, 15, {
        base: 9.8,
        maxRise: 0.34,
      });
      PF.stairs(b, "granite_block", lanes[1], 0, 0, 2.8, 10, 15, 20, {
        base: 14.8,
        maxRise: 0.34,
      });
      for (const [z0, z1, y] of [
        [-4.8, 0, 5],
        [10, 12.8, 10],
        [-4.8, 0, 15],
        [10, 12.8, 20],
      ]) {
        b.boxMM("granite_block", 14.8, y - 0.3, z0, 24.2, y, z1, {
          grime: 0.6,
        });
        PF.colMM(14.8, y - 0.3, z0, 24.2, y, z1, {});
      }
      // lane divider (full height) and handrails on the open flight edges
      b.boxMM("iron", 19.35, 0, 0, 19.85, 21, 10, { seg: false });
      PF.colMM(19.35, 0, 0, 19.85, 21.1, 10, {
        walkable: false,
        surface: "metal",
      });
      // top landing guard over the lower flights
      PF.colMM(15.4, 20, 9.8, 19.3, 21.1, 10.0, { walkable: false });
      b.boxMM("iron", 15.4, 21, 9.85, 19.3, 21.08, 9.95, { seg: false });
      // maintenance alcove under flight 2: inspection terminal, lockers
      b.boxMM("paint_cream", 23.3, 0, 3.6, 24.2, 0.95, 6.4, {
        seg: false,
        grime: 0.6,
      });
      PF.colMM(23.3, 0, 3.6, 24.2, 0.95, 6.4, { walkable: false });
      an.terminal = A(23.7, 0.95, 5, -HP);
      b.sphere("lamp_green", 23.9, 3.2, 5, 0.12, { ws: 6, hs: 4, noAO: true });
      PF.glow(W(23.8, 3.2, 5), 0x7aff90, 1.1, cell.root, { intensity: 0.7 });
      for (const [y, z] of [
        [3.5, 11],
        [8.5, -2],
        [13.5, 11],
        [18.5, -2],
        [22.5, 11.4],
      ]) {
        b.sphere("lamp_warm", 24.1, y, z, 0.14, { ws: 6, hs: 4, noAO: true });
        PF.glow(W(23.9, y, z), 0xffc070, 1.4, cell.root, { intensity: 0.8 });
      }
      b.boxMM("rust", 24.15, 20, 10.6, 24.25, 22.4, 12.2, {
        seg: false,
        grime: 0.7,
      });
      const hs = PF.texMat(
        "mb_int_hatch",
        PF.signTex(
          "mb_int_hatch",
          ["SOUTH CABLE HOUSING", "DECK ACCESS ↑"],
          "enamel",
          512,
          160,
          { bg: "#2a3a52" },
        ),
        { rough: 0.8 },
      );
      b.quad(hs, 24.12, 23.0, 11.4, 1.6, 0.5, { ry: -HP });
      an.deck_door = A(22.6, 20, 11.4, HP);

      // ---------------------------------------------------------------- ANCHOR PIT (y -6)
      const y0 = -6;
      PF.stairs(b, "granite_block", 0, -30, 0, 3.6, 11.2, y0, 0, {
        base: y0 - 0.3,
        maxRise: 0.34,
      });
      b.boxMM("concrete_dark", -2, -0.3, -18.8, 2, 0, -18, { seg: false });
      PF.colMM(-2, -1, -18.8, 2, 0, -18, {});
      PF.wall(b, bk, "z", -30, -18.8, -2.8, -2, y0, 5.2, [], {});
      PF.wall(b, bk, "z", -30, -18.8, 2, 2.8, y0, 5.2, [], {});
      BK.barrelZ(b, bk, -30, -18.8, 0, 2, 3.2, 0.8, { tile: 3 });
      b.sphere("lamp_red", 1.8, -2.5, -24, 0.12, { ws: 6, hs: 4, noAO: true });
      PF.glow(W(1.8, -2.5, -24), 0xff3020, 1.1, cell.root, { intensity: 0.8 });
      b.boxMM("concrete_dark", -12, y0 - 0.3, -46, 12, y0, -30, { grime: 0.9 });
      PF.colMM(-12.8, y0 - 1, -46.8, 12.8, y0, -30, {});
      PF.wall(
        b,
        bk,
        "x",
        -12.8,
        12.8,
        -30.8,
        -30,
        y0,
        2.4,
        [{ c: 0, w: 3.6, y0, h: 6 }],
        {},
      );
      PF.wall(b, bk, "x", -12.8, 12.8, -46.8, -46, y0, 2.4, [], {});
      PF.wall(b, bk, "z", -46.8, -30, -12.8, -12, y0, 2.4, [], {});
      PF.wall(b, bk, "z", -46.8, -30, 12, 12.8, y0, 2.4, [], {});
      BK.barrelX(b, bk, -12.8, 12.8, -38, 8.1, -2, 0.48, { tile: 3 });
      // anchor grillage: great steel girders, anchor plates, bar stubs diving into the vault
      for (const z of [-43.5, -40.5]) {
        b.boxMM("rust", -11, y0, z - 0.6, 11, y0 + 1.5, z + 0.6, {
          grime: 0.7,
        });
        PF.colMM(-11, y0, z - 0.6, 11, y0 + 1.5, z + 0.6, { surface: "metal" });
      }
      for (const x of [-9, -4.5, 4.5, 9]) {
        b.boxMM("iron", x - 1.4, y0 + 1.5, -44.4, x + 1.4, y0 + 2.2, -39.6, {
          seg: false,
        });
        PF.colMM(x - 1.4, y0 + 1.5, -44.4, x + 1.4, y0 + 2.2, -39.6, {
          surface: "metal",
        });
        chain(
          b,
          V3(x, y0 + 2.2, -42),
          V3(0, Math.sin(0.73), Math.cos(0.73)),
          2,
          4.6,
          1.5,
        );
      }
      // Ironjaw's den: hoard, bone throne, meat, fire
      b.boxMM("awning_red", -1.5, y0, -45.8, 1.5, y0 + 1.0, -44.6, {
        seg: false,
        grime: 0.8,
      });
      b.boxMM("bone", -1.6, y0 + 1.0, -45.9, 1.6, y0 + 3.0, -45.4, {
        seg: false,
        grime: 0.5,
      });
      for (let i = 0; i < 9; i++)
        b.sphere("bone", -1.4 + i * 0.35, y0 + 3.2, -45.6, 0.18, {
          ws: 7,
          hs: 5,
        });
      PF.colMM(-1.6, y0, -45.9, 1.6, y0 + 1.0, -44.6, {});
      D.rubble(b, -8, y0, -34, 1.4, 8, 91);
      D.rubble(b, 9, y0, -33, 1.2, 6, 92);
      b.cyl("fire", 7.5, y0 + 0.1, -36, 0.6, 0.9, 0.6, 10, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      PF.glow(W(7.5, y0 + 1.0, -36), 0xff7a28, 2.6, cell.root, {
        intensity: 1.1,
        flicker: 0.4,
      });
      PF.barrel(b, -9, y0, -32, { key: "rust" });
      b.cyl("lamp_green", -9, y0 + 0.9, -32, 0.26, 0.26, 0.04, 10, { hSeg: 1 });
      PF.glow(W(-9, y0 + 1.1, -32), 0x7aff40, 1.4, cell.root, {
        intensity: 0.8,
      });
      try {
        G.world.addRadSource({
          x: O.x - 9,
          y: O.y + y0 + 0.8,
          z: O.z - 32,
          radius: 3.5,
          strength: 3,
        });
      } catch (e) {
        /* core */
      }
      for (let i = 0; i < 5; i++)
        PF.skeleton(b, -6 + i * 2.8, y0 + 0.02, -35 - (i % 2) * 5, i * 1.3);
      for (const [x, z, s] of [
        [0, -40, 3.4],
        [-5, -36, 2.4],
        [5, -43, 2.2],
      ])
        b.quad(blood, x, y0 + 0.02, z, s, s, {
          rx: -HP,
          rz: z,
          noAO: true,
          grime: 0,
        });
      an.pit = A(0, y0, -34, 0);
      an.hoard = A(3.2, y0, -45.2, PI);
    });
    b.build(cell.root, { lodDistInt: 120 });

    Object.assign(an, {
      spawn1: A(-6, 0, -4, 0.5),
      spawn2: A(6, 0, 4, -0.8),
      spawn3: A(12.5, 10, -8, HP),
      spawn4: A(-20, 0, -13, HP),
      spawn5: A(-6, -6, -36, 0),
      spawn6: A(7, -6, -40, 0.3),
      boss: A(0, -6, -42, 0),
      loot1: A(-24.5, 0, 6.5, HP),
      loot2: A(-16.2, 0, 3.5, -HP),
      loot3: A(3.2, -6, -45.2, PI),
      loot4: A(22.5, 0, -3.5, -HP),
      npc1: an.cage1,
      npc2: an.cage2,
    });
    return an;
  }

  // ===================================================================
  // CONTENT
  // ===================================================================
