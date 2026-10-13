// play-inline-217 03 — math
// Lines 226-1790 of readable/play-inline-217.pretty.js (statement-aligned).
  PH.addBuilder(
    "domino_int",
    function () {
      const I = G.LAYOUT.INTERIORS.domino_sugar;
      if (!I) return;
      const O = I.origin;
      const root = PH.interiorRoot("domino_sugar", "poi_domino_interior");
      PH.setOrigin(O.x, O.z);
      const b = PH.batch("domino_int");
      b.frame(PH.originMatrix());
      b.grime = 0.6;
      b.aoH = 3;
      b.setLights(
        [
          // dusty daylight shafts from the pan house windows
          { x: 8, y: 20, z: -18, color: 0xb8b890, r: 18, i: 0.5 },
          { x: 32, y: 20, z: 18, color: 0xb8b890, r: 18, i: 0.5 },
          { x: 20, y: 24, z: 0, color: 0xa8a888, r: 20, i: 0.45 },
          // warehouse skylight
          { x: -12, y: 9, z: 0, color: 0xa8a080, r: 16, i: 0.45 },
        ],
        0x4a443c,
        0.5,
      );
      const A = {};
      const r = PH.rng("domino_int");

      // =====================================================================
      // RAW SUGAR WAREHOUSE (x -30..6, z -20..20, h 10)
      // =====================================================================
      PH.slab(b, "concrete", -30, -20, 6, 20, 0, 0.3);
      b.boxMM("rotten", -30, 10, -20, 6, 10.4, 20, { grime: 0.6 });
      PH.colMM(-30, 10, -20, 6, 10.4, 20, { walkable: false });
      PH.wall(
        b,
        "brick_dark",
        -30,
        -20,
        6,
        -20,
        0,
        10,
        [{ c: 18, w: 5, h: 4.4 }],
        { t: 0.6 },
      );
      PH.wall(
        b,
        "brick_dark",
        -30,
        20,
        6,
        20,
        0,
        10,
        [{ c: 13, w: 2.4, h: 2.8 }],
        { t: 0.6 },
      );
      PH.wall(b, "brick_dark", -30, -20, -30, 20, 0, 10, [], { t: 0.6 });
      PH.wall(
        b,
        "brick_dark",
        6,
        -20,
        6,
        20,
        0,
        10,
        [{ c: 20, w: 4, h: 4.2 }],
        { t: 0.6 },
      );
      // skylight strip + trusses
      for (let x = -26; x <= 2; x += 7) {
        b.beam("rotten", PH.v3(x, 8.2, -20), PH.v3(x, 8.2, 20), 0.35, 0.45);
        for (const z of [-12, -4, 4, 12]) {
          // riveted steel I-section column: two flanges + web, base plate, cap plate and knee braces to the truss
          for (const s2 of [-1, 1])
            b.box("rust", x, 0, z + s2 * 0.19, 0.42, 8.2, 0.035, {
              seg: false,
              grime: 0.5,
            });
          b.box("rust", x, 0, z, 0.03, 8.2, 0.36, { seg: false, grime: 0.5 });
          for (let y = 0.5; y < 8; y += 0.55)
            for (const s2 of [-1, 1])
              b.box("iron", x + 0.16, y, z + s2 * 0.215, 0.06, 0.05, 0.02, {
                seg: false,
                noAO: true,
              });
          b.box("iron", x, 0, z, 0.8, 0.06, 0.8, { seg: false });
          b.box("iron", x, 8.1, z, 0.6, 0.1, 0.6, { seg: false });
          for (const s2 of [-1, 1])
            b.beam(
              "rust",
              PH.v3(x, 6.6, z),
              PH.v3(x, 8.1, z + s2 * 1.5),
              0.08,
              0.14,
            );
          b.box("paint_yellow", x, 0.06, z, 0.44, 1.1, 0.4, {
            seg: false,
            grime: 0.8,
          }); // hazard-painted foot
          PH.col(x, z, 0.5, 0.5, 0, 10, 0, { walkable: false });
        }
      }
      b.quad(sashGlassKey(), -11, 10.06, 0, 22, 3, {
        rx: Math.PI / 2,
        uvRect: [0, 0, 5.5, 0.6],
      }); // skylight strip (seen from below)
      for (let x = -22; x < 0; x += 2)
        b.boxMM("rust", x, 9.9, -1.6, x + 0.1, 10.05, 1.6, { seg: false });
      // raw sugar mountains (brown), sacks, molasses spills (sticky)
      for (const [x, z, rx, h, rz, key] of [
        [-22, -12, 6, 3.4, 5, "rawsugar"],
        [-22, 11, 5, 2.8, 6, "sugar"],
        [-4, 13, 4, 2.0, 4, "rawsugar"],
        [-8, -13, 3.5, 1.6, 3, "sugar"],
      ]) {
        sugarHeap(b, key, x, z, rx, h, rz, x * 3 + z);
        // the overhead belt conveyor & drop chute that built the pile
        const cy = 8.6,
          cx0 = x + (x < -12 ? -5 : 4);
        b.beam("rust", PH.v3(cx0, cy, z), PH.v3(x, cy - 0.3, z), 0.9, 0.35);
        b.beam(
          "rubber",
          PH.v3(cx0, cy + 0.2, z),
          PH.v3(x, cy - 0.1, z),
          0.7,
          0.04,
        );
        for (let t = 0; t <= 1.001; t += 0.25) {
          const xx = cx0 + (x - cx0) * t;
          b.rod("iron", PH.v3(xx, cy, z), PH.v3(xx, 10, z), 0.03, 4);
        }
        b.cyl("rust", x, h + 1.3, z, 0.45, 0.3, cy - h - 1.4, 10, { hSeg: 1 });
        b.cyl("rust", x, cy - 0.2, z, 0.8, 0.45, 0.7, 10, {
          hSeg: 1,
          open: true,
        });
        for (let t = 0; t < 5; t++) {
          const f = (t + 1) / 6;
          PH.col(
            x,
            z,
            rx * 2 * (1 - f) * 0.95,
            rz * 2 * (1 - f) * 0.95,
            0,
            h * Math.pow(f, 0.7) * 0.95,
            0,
            { surface: "dirt" },
          );
        }
      }
      for (let i = 0; i < 40; i++) {
        const x = -28 + (i % 8) * 1.1,
          z = -4 + ((i / 8) | 0) * 0.8;
        if (r() < 0.2) continue;
        b.box("burlap", x, ((i / 16) | 0) * 0.45, z, 1.0, 0.45, 0.7, {
          ry: (r() - 0.5) * 0.3,
          seg: false,
          c: 0xc8b890,
        });
      }
      PH.colMM(-28.6, 0, -4.5, -19.6, 1.2, 0, {});
      const molassesPools = [
        [-14, 2, 3.2],
        [-2, -6, 2.4],
        [-17, -16, 2.2],
      ];
      for (const [x, z, rad] of molassesPools) {
        b.cyl("molasses", x, 0.005, z, rad, rad, 0.03, 20, {
          hSeg: 1,
          noAO: true,
        });
      }
      // brute camp: dirty mattresses, gore bags, bone piles, a cage with a dead captive, a Freedom Flakes throne-lite
      for (const [x, z, ry] of [
        [-26, 3, 0.2],
        [-26, 6.5, -0.1],
        [-3, 4, 1.4],
      ])
        b.box("fabric", x, 0, z, 2.2, 0.28, 1.4, {
          ry,
          seg: false,
          c: 0x6a5a40,
        });
      // gore bags hung from the roof trusses on meat hooks (sagging hide sacks, bloody drips below)
      for (let i = 0; i < 7; i++) {
        const x = [-26, -19, -12, -5][i % 4] + (r() - 0.5) * 0.6,
          z = -17 + i * 1.9 + (r() - 0.5) * 0.5,
          top = 8.0,
          len = 2.6 + r() * 2.2;
        b.rod("iron", PH.v3(x, top, z), PH.v3(x, top - len, z), 0.02, 4);
        b.sphere("leather", x, top - len - 0.55, z, 0.42, {
          sx: 0.85,
          sy: 1.35,
          sz: 0.8,
          c: [0xb06050, 0x9a5040, 0xa86a50][i % 3],
          grime: 0.5,
        });
        b.sphere("leather", x + 0.05, top - len - 1.05, z, 0.28, {
          sx: 1.0,
          sy: 0.7,
          c: 0x8a3a30,
          grime: 0.6,
        });
        b.cyl(
          "paint_red",
          x + (r() - 0.5) * 0.4,
          0.012,
          z + (r() - 0.5) * 0.4,
          0.35 + r() * 0.3,
          0.35 + r() * 0.3,
          0.01,
          10,
          { hSeg: 1, noAO: true, c: 0x6a1a14 },
        );
      }
      for (let i = 0; i < 14; i++)
        b.rock("bone", -9 + r() * 3, 0.1, 7 + r() * 3, 0.12 + r() * 0.1, {
          detail: 0,
        });
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * TAU;
        b.rod(
          "iron",
          PH.v3(-24 + Math.cos(a) * 1.2, 0, 16 + Math.sin(a) * 1.2),
          PH.v3(-24 + Math.cos(a) * 1.2, 2.3, 16 + Math.sin(a) * 1.2),
          0.04,
          4,
        );
      }
      b.cyl("iron", -24, 2.3, 16, 1.3, 1.3, 0.1, 10, { hSeg: 1 });
      PH.skeleton(b, -24, 0, 16, 1.0, {});
      PH.col(-24, 16, 2.4, 2.4, 0, 2.4, 0, { walkable: false });
      for (const [x, z] of [
        [-10, -8],
        [0, 8],
        [-20, 0],
        [-4, -16],
        [-26, 12],
      ]) {
        b.cyl("rust", x, 0, z, 0.32, 0.32, 0.95, 10, { hSeg: 1 });
        b.sphere("fire", x, 1.0, z, 0.3, { sy: 0.7, noAO: true });
        b.addLight(x, 1.8, z, 0xff8a3a, 12, 1.3);
        PH.col(x, z, 0.7, 0.7, 0, 0.95, 0, { walkable: false });
      }
      // the camp bonfire: a ring of bricks, a spit with a whole... something
      b.cyl("brick_dark", -12, 0, 8, 1.3, 1.4, 0.4, 12, { hSeg: 1 });
      b.sphere("fire", -12, 0.5, 8, 0.8, { sy: 0.8, noAO: true });
      b.rod("rust", PH.v3(-13.6, 0, 8), PH.v3(-13.6, 1.8, 8), 0.05, 4);
      b.rod("rust", PH.v3(-10.4, 0, 8), PH.v3(-10.4, 1.8, 8), 0.05, 4);
      b.rod("rust", PH.v3(-13.8, 1.7, 8), PH.v3(-10.2, 1.7, 8), 0.04, 4);
      b.sphere("leather", -12, 1.55, 8, 0.35, {
        sx: 2.2,
        sy: 0.9,
        c: 0x6a3a2a,
      });
      b.addLight(-12, 2.2, 8, 0xff7a2a, 16, 1.6);
      PH.col(-12, 8, 2.6, 2.6, 0, 0.4, 0, {});
      PH.onReady.push(() =>
        PH.safe("bonfire", () => {
          if (!G.isStub("fx") && G.fx.fire) {
            const I = G.LAYOUT.INTERIORS.domino_sugar.origin;
            G.fx.fire(PH.v3(I.x - 12, 0.5, I.z + 8), 0.9);
          }
        }),
      );
      // high-bay sodium-vapour lamps: orange pools on the floor between the heaps
      for (const [x, z] of [
        [-24, -8],
        [-10, 6],
        [-2, -14],
        [-16, 14],
        [-16, -4],
        [-2, 2],
      ])
        PH.hangLamp(b, x, 10, z, 2.2, {
          r: 14,
          i: 1.05,
          color: 0xffa040,
          bulb: "lamp",
        });
      // the old "Sugar Works" script neon from the loading-dock office, rewired by the brutes — red spill across the warehouse
      {
        const nK = PH.texMat(
          "domino_neon_int",
          PH.canvasTex("ph_domino_neon_int", 512, 160, (ctx, w, h) => {
            ctx.fillStyle = "#140606";
            ctx.fillRect(0, 0, w, h);
            ctx.font = "italic bold 110px Georgia, serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "#ff2010";
            ctx.shadowBlur = 24;
            ctx.fillStyle = "#ff5a40";
            ctx.fillText("Sugar Works", w / 2, h / 2 + 4);
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffd0c0";
            ctx.fillText("Sugar Works", w / 2, h / 2 + 4);
          }),
          { emissive: 1.4, name: "ph_neon_red" },
        );
        b.quad(nK, -29.66, 6.2, -2, 6, 1.9, { ry: Math.PI / 2 });
        b.box("iron", -29.8, 5.1, -2, 0.12, 0.08, 6.2, { seg: false });
        b.addLight(-27, 6, -2, 0xff3020, 16, 1.1);
      }
      const wK = PH.signMat(
        "domino_w_graffiti",
        ["TINY HUMAN GO IN", "TINY HUMAN NOT COME OUT"],
        "raider",
        768,
        256,
        { bg: "#4a3a30", fg: "#d8d020" },
      );
      b.quad(wK, -6, 4.5, -19.66, 5, 1.6, {});
      const warnK = PH.signMat(
        "domino_warn",
        [
          "CAUTION",
          "MOLASSES SPILLS ARE SLIPPERY",
          "AND ALSO STICKY. SOMEHOW BOTH.",
        ],
        "enamel",
        768,
        256,
        { bg: "#c8a020", fg: "#1a1a1a" },
      );
      b.quad(warnK, 5.66, 3.2, -8, 2.4, 0.8, { ry: -Math.PI / 2 });
      A.entrance = PH.A(-12, 0, -17.5, Math.PI);
      A.spawn1 = PH.A(-6, 0, 2, 0);
      A.spawn2 = PH.A(-22, 0, 4, 0);

      // =====================================================================
      // PAN HOUSE (x 6..34, z -20..20, h 26) with the stair tower & catwalks
      // =====================================================================
      PH.slab(b, "concrete", 6, -20, 34, 20, 0, 0.3);
      PH.wall(b, "brick", 6, -20, 34, -20, 10, 26, [], { t: 0.6 });
      PH.wall(b, "brick", 6, -20, 34, -20, 0, 10, [], { t: 0.6 });
      PH.wall(
        b,
        "brick",
        6,
        20,
        34,
        20,
        0,
        26,
        [{ c: 14, w: 2.2, b: 18, h: 2.6 }],
        { t: 0.6 },
      );
      PH.wall(b, "brick", 34, -20, 34, 20, 0, 26, [], { t: 0.6 });
      PH.wall(b, "brick", 6, -20, 6, 20, 10, 26, [], { t: 0.6 });
      b.boxMM("corrugated", 6, 26, -20, 34, 26.4, 20, { grime: 0.6 });
      PH.colMM(6, 26, -20, 34, 26.4, 20, { walkable: false });
      for (let z = -16; z <= 16; z += 8)
        b.beam("rust", PH.v3(6, 25.4, z), PH.v3(34, 25.4, z), 0.4, 0.6);
      // tall arched windows ("daylight") high on the long walls
      for (const [z, ry] of [
        [-19.68, 0],
        [19.68, Math.PI],
      ])
        for (let x = 9; x <= 31; x += 4.4) {
          if (ry && Math.abs(x - 20) < 2) continue;
          sashArch(b, 2.0, 5.0, 0.8, PH.m4(x, 19.5, z, ry), (x * 7) % 2 > 1);
          sashArch(b, 2.0, 4.0, 0.8, PH.m4(x, 7.5, z, ry), (x * 3) % 2 > 1);
          // brick reveal, stone sill & a light shaft falling into the hall
          for (const [y0, hh] of [
            [19.5, 5.0],
            [7.5, 4.0],
          ]) {
            b.box(
              "concrete",
              x,
              y0 - 0.14,
              z + (ry ? -0.18 : 0.18),
              2.5,
              0.14,
              0.36,
              { ry, seg: false },
            );
            for (const s of [-1, 1])
              b.box(
                "brick_dark",
                x + s * 1.1,
                y0,
                z + (ry ? -0.08 : 0.08),
                0.2,
                hh - 0.5,
                0.16,
                { seg: false },
              );
          }
        }
      // vacuum pans & char-filter cisterns
      for (const [x, z] of [
        [11, -11],
        [11, 11],
        [28, -12],
        [28, 12],
      ])
        vacuumPan(b, x, z, 26);
      for (const z of [-17, 17]) {
        b.cyl("rust", 31.8, 0, z, 1.6, 1.6, 22, 14, { hSeg: 5 });
        PH.col(31.8, z, 3.2, 3.2, 0, 22, 0, { walkable: false });
      }
      // pipes along the walls
      for (const y of [4, 4.6, 15.5])
        b.rod("rust", PH.v3(6.6, y, -19.2), PH.v3(33.4, y, -19.2), 0.18, 8);
      for (const y of [3.2, 8.8])
        b.rod("iron", PH.v3(33.3, y, -19), PH.v3(33.3, y, 19), 0.14, 8);
      // the OPEN BOILING PAN (hazard) under the L12 bridge
      {
        const vx = 27,
          vz = -3.5,
          vr = 2.5;
        b.cyl("copper", vx, 0, vz, vr + 0.25, vr + 0.35, 1.1, 20, {
          hSeg: 1,
          open: true,
        });
        b.cyl("syrup_hot", vx, 0.85, vz, vr, vr, 0.05, 20, {
          hSeg: 1,
          noAO: true,
        });
        b.addLight(vx, 1.6, vz, 0xff7a20, 6, 0.9);
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * TAU;
          PH.col(
            vx + Math.cos(a) * (vr + 0.25),
            vz + Math.sin(a) * (vr + 0.25),
            0.5,
            0.5,
            0,
            1.1,
            0,
            { walkable: false },
          );
        }
        PH.col(vx, vz, vr * 1.6, vr * 1.6, 0, 0.8, 0, { surface: "water" });
        PH.hazards.push(function (P) {
          if (P.pos.x < O.x + vx - vr || P.pos.x > O.x + vx + vr) return;
          if (
            Math.hypot(P.pos.x - (O.x + vx), P.pos.z - (O.z + vz)) < vr &&
            P.pos.y < 1.6
          ) {
            PH._syrupT = (PH._syrupT || 0) - G.dt;
            if (PH._syrupT <= 0) {
              PH._syrupT = 0.5;
              P.damage(9, { type: "fire", source: "boiling syrup" });
              if (!PH._syrupMsg) {
                PH._syrupMsg = true;
                G.notify("You are being candied alive.");
              }
            }
          }
        });
        A.sugar_tank = PH.A(vx, 0, vz, 0);
      }
      // central switchback stair tower (0 → 6 → 12 → 18)
      const TX0 = 17,
        TX1 = 23;
      for (let L = 0; L < 18; L += 6) {
        PH.stairs(b, "diamond", 18.5, -3, 0, 2.4, 6, L, L + 3, {
          solid: false,
          rails: "rust",
          railSides: [-1],
          stringer: "rust",
        });
        catwalk(b, TX0, 3, TX1, 5.2, L + 3);
        PH.stairs(b, "diamond", 21.5, 3, Math.PI, 2.4, 6, L + 3, L + 6, {
          solid: false,
          rails: "rust",
          railSides: [-1],
          stringer: "rust",
        });
        if (L + 6 < 18) catwalk(b, TX0, -5.2, TX1, -3, L + 6);
      }
      catwalk(b, TX0, -5.2, TX1, 5.2, 18); // top platform
      for (const [x, z] of [
        [TX0, -5.2],
        [TX1, -5.2],
        [TX0, 5.2],
        [TX1, 5.2],
      ]) {
        b.beam("rust", PH.v3(x, 0, z), PH.v3(x, 18, z), 0.22, 0.22);
        PH.col(x, z, 0.3, 0.3, 0, 18, 0, { walkable: false });
      }
      PH.railing(
        b,
        [
          [TX0, 5.2],
          [TX1, 5.2],
        ],
        3,
        1.0,
        "rust",
        { postStep: 1.2 },
      );
      PH.railing(
        b,
        [
          [TX0, 5.2],
          [TX1, 5.2],
        ],
        9,
        1.0,
        "rust",
        { postStep: 1.2 },
      );
      PH.railing(
        b,
        [
          [TX0, 5.2],
          [TX1, 5.2],
        ],
        15,
        1.0,
        "rust",
        { postStep: 1.2 },
      );
      PH.railing(
        b,
        [
          [TX0, -5.2],
          [TX1, -5.2],
        ],
        18,
        1.0,
        "rust",
        { postStep: 1.2 },
      );
      PH.railing(
        b,
        [
          [TX1, -5.2],
          [TX1, 5.2],
        ],
        18,
        1.0,
        "rust",
        { postStep: 1.2 },
      );
      PH.railing(
        b,
        [
          [TX0, -5.2],
          [TX0, 5.2],
        ],
        18,
        1.0,
        "rust",
        { postStep: 1.2 },
      );
      // L6: bridge north to the north gallery
      catwalk(b, 19, -17.5, 21, -5.2, 6);
      catwalk(b, 6.3, -19.7, 33.7, -17.5, 6);
      PH.railing(
        b,
        [
          [6.3, -17.5],
          [19, -17.5],
        ],
        6,
        1.0,
        "rust",
        {},
      );
      PH.railing(
        b,
        [
          [21, -17.5],
          [30, -17.5],
        ],
        6,
        1.0,
        "rust",
        {},
      );
      PH.railing(
        b,
        [
          [19, -17.5],
          [19, -5.2],
        ],
        6,
        1.0,
        "rust",
        {},
      );
      PH.railing(
        b,
        [
          [21, -17.5],
          [21, -5.2],
        ],
        6,
        1.0,
        "rust",
        {},
      );
      // L12: bridge east over the boiling pan to the east gallery
      catwalk(b, TX1, -5.2, 31.2, -3, 12);
      catwalk(b, 31.2, -20, 33.7, 20, 12);
      PH.railing(
        b,
        [
          [TX1, -5.2],
          [31.2, -5.2],
        ],
        12,
        1.0,
        "rust",
        {},
      );
      PH.railing(
        b,
        [
          [TX1, -3],
          [31.2, -3],
        ],
        12,
        1.0,
        "rust",
        {},
      );
      PH.railing(
        b,
        [
          [31.2, -20],
          [31.2, -5.2],
        ],
        12,
        1.0,
        "rust",
        {},
      );
      PH.railing(
        b,
        [
          [31.2, -3],
          [31.2, 20],
        ],
        12,
        1.0,
        "rust",
        {},
      );
      // L18: bridge south to the south gallery and the conveyor door
      catwalk(b, 19, 5.2, 21, 17.6, 18);
      catwalk(b, 12, 17.6, 28, 19.7, 18);
      PH.railing(
        b,
        [
          [19, 5.2],
          [19, 17.6],
        ],
        18,
        1.0,
        "rust",
        {},
      );
      PH.railing(
        b,
        [
          [21, 5.2],
          [21, 17.6],
        ],
        18,
        1.0,
        "rust",
        {},
      );
      PH.railing(
        b,
        [
          [12, 17.6],
          [19, 17.6],
        ],
        18,
        1.0,
        "rust",
        {},
      );
      PH.railing(
        b,
        [
          [21, 17.6],
          [28, 17.6],
        ],
        18,
        1.0,
        "rust",
        {},
      );
      // catwalk supports hanging from the roof trusses
      for (const [x, z, y] of [
        [20, -11, 6],
        [27, -4, 12],
        [32.4, -10, 12],
        [32.4, 10, 12],
        [20, 11, 18],
      ])
        b.rod("rust", PH.v3(x, y, z), PH.v3(x, 25.4, z), 0.04, 4);
      // lights: caged work lamps on the catwalks
      for (const [x, y, z] of [
        [20, 9, -12],
        [28, 15, -4],
        [32.5, 15, 8],
        [20, 21, 12],
        [12, 4, 0],
        [25, 4, 8],
      ])
        PH.cageLamp(b, x, y, z, 0, { r: 9, i: 0.8 });
      // high-bay sodium lamps hanging from the trusses: warm pools on the pans and the stair tower
      for (const [x, z] of [
        [14, -8],
        [26, -8],
        [14, 8],
        [26, 8],
        [20, -16],
        [20, 16],
      ])
        PH.hangLamp(b, x, 25.4, z, 2.6, { r: 17, i: 0.95, color: 0xffa850 });
      b.addLight(20, 14, 0, 0xc8b890, 22, 0.35);
      // clutter: sugar sacks, spilled white sugar, a molasses leak, a dead worker at his post
      b.mound("sugar", 9, 0, 1, 2.2, 0.7, 1.8, { seed: 11 });
      b.cyl("molasses", 14, 0.005, 1.5, 2.4, 2.4, 0.03, 18, {
        hSeg: 1,
        noAO: true,
      });
      molassesPools.push([14 + 0, 1.5, 2.4]);
      PH.skeleton(b, 32, 12, 14, 2.4, { sit: true });
      PH.crates(b, 8, 6, -18.6, 0, 5, {});
      const panK = PH.signMat(
        "domino_panhouse",
        [
          "PAN HOUSE — VACUUM BOILING",
          "NO OPEN FLAMES · NO HORSEPLAY · NO TASTING",
        ],
        "enamel",
        1024,
        160,
        { bg: "#2a3a44" },
      );
      b.quad(panK, 6.4, 5.5, 8, 5.2, 0.8, { ry: Math.PI / 2 });
      A.spawn3 = PH.A(20, 6, -12, 0);
      A.spawn4 = PH.A(32.4, 12, 6, 0);
      A.pan_top = PH.A(20, 18, 0, Math.PI);
      A.loot1 = PH.A(30, 6, -18.6, 0);

      // =====================================================================
      // CONVEYOR GALLERY (enclosed truss bridge, y 18, z 20..46)
      // =====================================================================
      {
        const x0 = 18.2,
          x1 = 21.8,
          y = 18,
          z0 = 20,
          z1 = SILO.z - SILO.r + 0.6;
        b.boxMM("diamond", x0, y - 0.1, z0, x1, y, z1, { seg: false });
        PH.colMM(x0, y - 0.4, z0, x1, y, z1, { surface: "metal" });
        PH.wall(b, "corrugated", x0, z0, x0, z1, y, y + 3.2, [], {
          t: 0.1,
          ext: 0,
        });
        PH.wall(b, "corrugated", x1, z0, x1, z1, y, y + 3.2, [], {
          t: 0.1,
          ext: 0,
        });
        b.boxMM("corrugated", x0 - 0.1, y + 3.2, z0, x1 + 0.1, y + 3.35, z1, {
          seg: false,
        });
        for (let z = z0; z < z1; z += 3) {
          for (const x of [x0 - 0.12, x1 + 0.12])
            b.box("rust", x, y - 0.4, z, 0.14, 3.8, 0.14, { seg: false });
          b.box("rust", 20, y + 3.2, z, 3.8, 0.14, 0.14, { seg: false });
          if ((z / 3) % 2 === 0)
            for (const [x, ry] of [
              [x0 + 0.06, Math.PI / 2],
              [x1 - 0.06, -Math.PI / 2],
            ])
              b.quad(sashGlassKey(), x, y + 1.9, z + 1.5, 1.2, 0.6, {
                ry,
                uvRect: [0, 0.4, 0.3, 0.52],
              });
        }
        // the conveyor itself: rollers + belt + sacks frozen mid-journey
        b.boxMM("rubber", x0 + 0.2, y + 0.7, z0, x0 + 1.2, y + 0.76, z1, {
          seg: false,
        });
        for (let z = z0 + 0.5; z < z1; z += 1.2)
          b.box("rust", x0 + 0.7, y, z, 0.08, 0.7, 0.08, { seg: false });
        PH.colMM(x0 + 0.2, y, z0, x0 + 1.2, y + 0.76, z1, { walkable: false });
        for (let z = z0 + 2; z < z1; z += 2.7)
          b.box("burlap", x0 + 0.7, y + 0.76, z, 0.8, 0.4, 0.9, {
            ry: r() * 0.3,
            seg: false,
            c: 0xd0c4a0,
          });
        // a collapsed stretch: the floor sags and a sheet of corrugated has come down
        b.box("corrugated", 20.8, y + 0.4, 33, 1.6, 0.05, 2.6, {
          rz: 0.5,
          seg: false,
        });
        PH.col(20.8, 33, 1.0, 2.6, y, y + 0.8, 0, { walkable: false });
        for (const z of [26, 38])
          PH.cageLamp(b, x1 - 0.1, y + 2.6, z, -Math.PI / 2, { r: 7, i: 0.7 });
        const gK = PH.signMat(
          "domino_conv",
          ["CONVEYOR 2 → BIN 4", "KEEP HANDS, FEET & BRUTES CLEAR"],
          "enamel",
          768,
          160,
          { bg: "#c8a020", fg: "#1a1a1a" },
        );
        b.quad(gK, 20, y + 2.6, z0 + 0.35, 3.2, 0.66, {});
        A.conveyor = PH.A(20, y, 30, Math.PI);
      }

      // =====================================================================
      // SUGAR SILO (r 10, h 24): entry platform at 18, helical stair down, sugar mountain
      // =====================================================================
      {
        const { x: cx, z: cz, r: R, h: H } = SILO;
        const segN = 36;
        for (let i = 0; i < segN; i++) {
          const a = ((i + 0.5) / segN) * TAU;
          const x = cx + Math.cos(a) * (R + 0.3),
            z = cz + Math.sin(a) * (R + 0.3);
          const len = 2 * (R + 0.3) * Math.sin(Math.PI / segN) + 0.1;
          const ry = -a + Math.PI / 2;
          const isW =
            Math.abs(Math.atan2(Math.sin(a - Math.PI), Math.cos(a - Math.PI))) <
            0.14;
          const isE = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.14;
          const isN =
            Math.abs(
              Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2)),
            ) < 0.12;
          const gapLo = isW || isE ? 2.8 : 0,
            gapHi = isN ? [18, 20.8] : null;
          if (gapLo) {
            b.box("concrete", x, gapLo, z, len, H - gapLo, 0.6, {
              ry,
              grime: 0.6,
            });
            PH.col(x, z, len, 0.6, gapLo, H, ry, { walkable: false });
          } else if (gapHi) {
            b.box("concrete", x, 0, z, len, gapHi[0], 0.6, { ry, grime: 0.6 });
            b.box("concrete", x, gapHi[1], z, len, H - gapHi[1], 0.6, {
              ry,
              grime: 0.6,
            });
            PH.col(x, z, len, 0.6, 0, gapHi[0], ry, { walkable: false });
            PH.col(x, z, len, 0.6, gapHi[1], H, ry, { walkable: false });
          } else {
            b.box("concrete", x, 0, z, len, H, 0.6, { ry, grime: 0.6 });
            PH.col(x, z, len, 0.6, 0, H, ry, { walkable: false });
          }
        }
        // floor & conical roof (seen from inside) with the feed chute
        const fl = new THREE.CircleGeometry(R + 0.4, 36);
        fl.rotateX(-Math.PI / 2);
        b.add("concrete", fl, { m: PH.m4(cx, 0, cz), grime: 0.7 });
        const roof = new THREE.ConeGeometry(R + 0.6, 3, 36, 1, true);
        b.add("concrete", PH.flip(roof), {
          m: PH.m4(cx, H + 1.5, cz),
          grime: 0.6,
        });
        PH.colMM(cx - R, H, cz - R, cx + R, H + 0.5, cz + R, {
          walkable: false,
        });
        b.cyl("rust", cx, H - 3, cz, 0.9, 0.5, 3, 12, { hSeg: 1, open: true });
        // entry platform (north) at 18
        const plat = new THREE.RingGeometry(
          R - 2.2,
          R,
          16,
          1,
          Math.PI / 2 - 0.55,
          1.1,
        );
        plat.rotateX(-Math.PI / 2);
        // RingGeometry theta runs in the XY plane: after rotateX(-90°) y→ -z, so angle a maps to (cos a, -sin a)
        b.add("diamond", plat, { m: PH.m4(cx, 18, cz), grime: 0.5 });
        for (const [lx, lz, w, d] of [
          [0, -R + 1.1, 2.4, 2.2],
          [-1.8, -R + 1.3, 1.8, 2.2],
          [1.8, -R + 1.3, 1.8, 2.2],
          [3.4, -R + 1.9, 1.8, 2.2],
        ])
          PH.col(cx + lx, cz + lz, w, d, 17.7, 18, 0, { surface: "metal" });
        PH.railing(
          b,
          [
            [cx - 3.2, cz - R + 2.4],
            [cx - 1, cz - R + 2.3],
            [cx + 1, cz - R + 2.3],
            [cx + 2.5, cz - R + 2.5],
          ],
          18,
          1.0,
          "rust",
          {},
        );
        // helical stair down the wall: starts at the platform's east edge, winds clockwise to the floor
        const a0 = -Math.PI / 2 + 0.5,
          steps = 62,
          dA = 0.068,
          rise = 18 / steps;
        for (let i = 0; i < steps; i++) {
          const a = a0 + (i + 0.5) * dA,
            top = 18 - rise * (i + 1);
          const rm = R - 1.15;
          const x = cx + Math.cos(a) * rm,
            z = cz + Math.sin(a) * rm;
          const ry = -a;
          b.box("diamond", x, top - 0.12, z, 2.1, 0.12, dA * rm + 0.12, {
            ry,
            seg: false,
            grime: 0.5,
          });
          PH.col(x, z, 2.1, dA * rm + 0.12, top - 0.35, top, ry, {
            surface: "metal",
          });
          if (i % 3 === 0) {
            const ix = cx + Math.cos(a) * (R - 2.25),
              iz = cz + Math.sin(a) * (R - 2.25);
            b.rod(
              "rust",
              PH.v3(ix, top, iz),
              PH.v3(ix, top + 1.0, iz),
              0.03,
              4,
            );
            const a2 = a + 3 * dA,
              t2 = 18 - rise * (i + 4);
            b.rod(
              "rust",
              PH.v3(ix, top + 1.0, iz),
              PH.v3(
                cx + Math.cos(a2) * (R - 2.25),
                t2 + 1.0,
                cz + Math.sin(a2) * (R - 2.25),
              ),
              0.03,
              4,
            );
            b.box(
              "rust",
              cx + Math.cos(a) * (R - 0.1),
              top - 0.5,
              cz + Math.sin(a) * (R - 0.1),
              0.3,
              0.4,
              0.3,
              { seg: false },
            );
          }
          if (i % 2 === 0)
            PH.col(
              cx + Math.cos(a) * (R - 2.3),
              cz + Math.sin(a) * (R - 2.3),
              0.15,
              dA * rm * 2.2,
              top,
              top + 1.1,
              ry,
              { walkable: false },
            );
        }
        // THE SUGAR MOUNTAIN (climbable tiers), crusted, with an irradiated glowing core on top
        b.mound("sugar", cx - 1, 0, cz + 1, 6.5, 4.2, 6.0, {
          seed: 21,
          peak: 0.9,
        });
        for (let t = 0; t < 9; t++) {
          const f = (t + 1) / 10;
          PH.col(
            cx - 1,
            cz + 1,
            13 * (1 - f) * 0.92,
            12 * (1 - f) * 0.92,
            0,
            4.2 * Math.pow(f, 0.9) * 0.95,
            0,
            { surface: "dirt" },
          );
        }
        b.sphere("goo", cx - 1, 3.9, cz + 1, 0.9, { sy: 0.45, noAO: true });
        b.addLight(cx - 1, 5, cz + 1, 0x6aff50, 10, 0.8);
        try {
          G.world.addRadSource({
            x: O.x + cx - 1,
            y: 3,
            z: O.z + cz + 1,
            radius: 7,
            strength: 2.5,
          });
        } catch (e) {
          /* */
        }
        // SWEET TOOTH's throne: stacked Freedom Flakes crates, a bathtub of syrup, a giant spoon
        const tx = cx,
          tz = cz + 7.6;
        for (let i = 0; i < 12; i++)
          b.box(
            "cardboard",
            tx - 2.2 + (i % 4) * 1.1,
            ((i / 4) | 0) * 0.6,
            tz + 0.6 + ((i / 4) | 0) * 0.3,
            1.0,
            0.6,
            0.7,
            { seg: false, c: [0xb83a32, 0x3a5aa0, 0xe8e2d0][i % 3] },
          );
        PH.col(tx, tz + 1.2, 4.6, 1.6, 0, 1.8, 0, { walkable: false });
        b.boxMM("wood_dark", tx - 1.2, 0, tz - 0.8, tx + 1.2, 0.8, tz + 0.2, {
          seg: false,
        });
        const sbK = PH.brandMat("freedom_flakes");
        b.quad(sbK, tx, 2.6, tz + 1.35, 4.2, 2.1, { ry: Math.PI });
        b.cyl("chrome", tx + 3.5, 0, tz - 1, 0.9, 0.8, 0.7, 14, {
          hSeg: 1,
          open: true,
        });
        b.cyl("molasses", tx + 3.5, 0.55, tz - 1, 0.8, 0.8, 0.05, 14, {
          hSeg: 1,
        });
        b.rod(
          "chrome",
          PH.v3(tx - 3.5, 0.2, tz - 1),
          PH.v3(tx - 3.6, 3.4, tz - 1.2),
          0.08,
          6,
        );
        b.sphere("chrome", tx - 3.6, 3.7, tz - 1.2, 0.45, { sy: 0.4 });
        for (let i = 0; i < 10; i++)
          b.rock(
            "bone",
            tx - 3 + r() * 6,
            0.1,
            tz - 3 + r() * 2,
            0.12 + r() * 0.12,
            { detail: 0 },
          );
        const stK = PH.signMat(
          "domino_st_throne",
          ["SWEET TOOTH", "KING OF SUGAR"],
          "raider",
          512,
          256,
          { bg: "#4a3a30", fg: "#f0d040" },
        );
        b.quad(stK, cx, 7, cz + R - 0.05, 3.2, 1.6, { ry: Math.PI });
        for (const a of [0.8, 2.4, 4.0, 5.4])
          PH.cageLamp(
            b,
            cx + Math.cos(a) * (R - 0.05),
            8,
            cz + Math.sin(a) * (R - 0.05),
            -a - Math.PI / 2,
            { r: 10, i: 0.9 },
          );
        b.addLight(cx, 20, cz, 0xa8a888, 12, 0.5);
        A.boss = PH.A(tx, 0, tz - 1.6, Math.PI);
        A.silo_top = PH.A(cx, 18, cz - R + 1.2, Math.PI);
        A.silo_floor = PH.A(cx - 5.5, 0, cz - 5, 0);
        A.spawn5 = PH.A(cx + 5, 0, cz - 3, 0);
        A.mountain = PH.A(cx - 1, 4.2, cz + 1, 0);
      }

      // =====================================================================
      // QC LABORATORY (x 30.3..44, z 49..63) — locked reward room
      // =====================================================================
      {
        const x0 = 30.3,
          x1 = 44,
          z0 = 49,
          z1 = 63;
        PH.room(b, {
          x0,
          z0,
          x1,
          z1,
          y: 0,
          h: 3.6,
          wall: "tile_white",
          floor: "hextile",
          ceil: "plaster",
          doors: [{ side: "w", abs: true, at: 56, w: 1.6, h: 2.4 }],
          noWalls: {},
        });
        for (const [bx, bz] of [
          [35, 51],
          [35, 54.5],
          [40.5, 51],
        ]) {
          b.boxMM("scratched", bx - 2, 0, bz - 0.5, bx + 2, 0.92, bz + 0.5, {
            seg: false,
          });
          b.boxMM(
            "paint_black",
            bx - 2.05,
            0.92,
            bz - 0.55,
            bx + 2.05,
            0.97,
            bz + 0.55,
            { seg: false },
          );
          PH.colMM(bx - 2, 0, bz - 0.5, bx + 2, 0.97, bz + 0.5, {});
          for (let i = 0; i < 7; i++) {
            const g = r();
            b.cyl(
              g < 0.5 ? "glass" : "sugar",
              bx - 1.7 + i * 0.5,
              0.97,
              bz + (r() - 0.5) * 0.5,
              0.08,
              0.08,
              0.22 + r() * 0.1,
              8,
              { hSeg: 1 },
            );
          }
          b.box("paint_green", bx, 0.97, bz + 0.3, 0.5, 0.25, 0.35, {
            seg: false,
          }); // polarimeter
        }
        // wall shelves of labelled sample jars, a fume hood, a chalkboard of formulas
        for (let y = 0.6; y < 2.8; y += 0.55) {
          b.boxMM("wood", x1 - 0.6, y, z0 + 1, x1 - 0.1, y + 0.04, z1 - 4, {
            seg: false,
          });
          for (let z = z0 + 1.2; z < z1 - 4.2; z += 0.35)
            b.cyl(
              r() < 0.7 ? "sugar" : "rawsugar",
              x1 - 0.35,
              y + 0.04,
              z,
              0.1,
              0.1,
              0.25,
              8,
              { hSeg: 1 },
            );
        }
        PH.colMM(x1 - 0.6, 0, z0 + 1, x1 - 0.1, 2.8, z1 - 4, {
          walkable: false,
        });
        b.boxMM("metal", x0 + 0.5, 0, z1 - 1.6, x0 + 3.5, 2.6, z1 - 0.4, {
          seg: false,
        });
        b.boxMM("glass", x0 + 0.6, 1.0, z1 - 1.62, x0 + 3.4, 2.0, z1 - 1.58, {
          seg: false,
        });
        PH.colMM(x0 + 0.5, 0, z1 - 1.6, x0 + 3.5, 2.6, z1 - 0.4, {
          walkable: false,
        });
        const fK = PH.signMat(
          "domino_formula",
          [
            "FREEDOM FLAKES — FORMULA 7 (NEW! STAYS CRISP)",
            "SUCROSE 71%  CORN SYRUP 18%",
            '"FLAKE GLAZE" 9%  ??? 2% (DO NOT ASK R&D)',
            "CRISP TO THE LAST SPOONFUL",
          ],
          "chalk",
          1024,
          400,
        );
        b.quad(fK, 37, 2.0, z0 + 0.2, 4.4, 1.7, {});
        PH.tubeLamp(b, 36, 3.6, 53, 2.4, 0, {});
        PH.tubeLamp(b, 36, 3.6, 59, 2.4, 0, { dead: true });
        PH.tubeLamp(b, 41, 3.6, 56, 2.4, 0, {});
        PH.skeleton(b, 41, 0, 60.5, 2.8, {});
        const qcK = PH.signMat(
          "domino_qc",
          ["QUALITY CONTROL", "AUTHORIZED STAFF ONLY"],
          "enamel",
          512,
          160,
          { bg: "#e8e2d0", fg: "#2a2a2a" },
        );
        b.quad(qcK, 29.68, 3.0, 56, 1.8, 0.56, { ry: -Math.PI / 2 });
        A.qc = PH.A(34, 0, 57, -Math.PI / 2);
        A.qc_crate = PH.A(42.2, 0, 61.4, 0);
        A.qc_terminal = PH.A(40.5, 0.97, 51, Math.PI);
        A.loot2 = PH.A(43, 0, 50, 0);
      }

      // =====================================================================
      // TUNNEL (silo → boiler house) and BOILER HOUSE (x -30..-6, z 40..70)
      // =====================================================================
      PH.room(b, {
        x0: -6,
        z0: 53.5,
        x1: 10.3,
        z1: 58.5,
        y: 0,
        h: 3.6,
        wall: "brick_dark",
        floor: "concrete",
        ceil: "concrete",
        noWalls: { w: true, e: true },
      });
      for (let x = -4; x < 10; x += 4)
        PH.cageLamp(b, x, 3.1, 58.3, Math.PI, { r: 6, i: 0.6 });
      b.rod("rust", PH.v3(-6, 3.0, 54), PH.v3(10, 3.0, 54), 0.15, 8);
      {
        const x0 = -30,
          x1 = -6,
          z0 = 40,
          z1 = 70,
          H = 14;
        PH.slab(b, "concrete", x0, z0, x1, z1, 0, 0.3);
        PH.wall(b, "brick", x0, z0, x1, z0, 0, H, [{ c: 13, w: 2.4, h: 2.8 }], {
          t: 0.6,
        });
        PH.wall(b, "brick", x0, z1, x1, z1, 0, H, [], { t: 0.6 });
        PH.wall(b, "brick", x0, z0, x0, z1, 0, H, [], { t: 0.6 });
        PH.wall(b, "brick", x1, z0, x1, z1, 0, H, [{ c: 16, w: 4.6, h: 3.4 }], {
          t: 0.6,
        });
        b.boxMM("corrugated", x0, H, z0, x1, H + 0.3, z1, { grime: 0.7 });
        PH.colMM(x0, H, z0, x1, H + 0.3, z1, { walkable: false });
        for (let z = z0 + 4; z < z1; z += 6)
          b.beam(
            "rust",
            PH.v3(x0, H - 0.6, z),
            PH.v3(x1, H - 0.6, z),
            0.35,
            0.5,
          );
        // three Scotch-marine boilers on brick settings with glowing fireboxes
        for (const bz of [46, 55, 64]) {
          b.boxMM("brick_dark", -27, 0, bz - 3, -11, 2.2, bz + 3, {
            grime: 0.8,
          });
          b.cyl("rust", -19, 2.2 + 2.4, bz, 2.4, 2.4, 14, 18, {
            rz: Math.PI / 2,
            hSeg: 4,
            grime: 0.6,
          });
          for (let k = 0; k < 4; k++)
            b.cyl("iron", -25 + k * 4, 4.6, bz, 2.48, 2.48, 0.2, 18, {
              rz: Math.PI / 2,
              hSeg: 1,
            });
          b.cyl("iron", -11.9, 4.6, bz, 2.45, 2.45, 0.25, 18, {
            rz: Math.PI / 2,
            hSeg: 1,
          });
          b.box("iron", -11.6, 2.4, bz, 0.2, 1.4, 2.0, { seg: false });
          b.box("ember", -11.5, 2.6, bz, 0.05, 0.9, 1.4, {
            seg: false,
            noAO: true,
          });
          for (let k = 0; k < 6; k++)
            b.box("iron", -11.42, 2.55, bz - 0.6 + k * 0.24, 0.05, 1.0, 0.05, {
              seg: false,
            });
          b.addLight(-10.5, 3, bz, 0xff6a20, 7, 1.1);
          b.rod("rust", PH.v3(-19, 7.0, bz), PH.v3(-19, H, bz), 0.5, 10);
          b.cyl("chrome", -12, 6.2, bz + 1.2, 0.22, 0.22, 0.1, 10, {
            rx: Math.PI / 2,
            hSeg: 1,
          }); // pressure gauge
          PH.colMM(-27, 0, bz - 3, -11, 7.1, bz + 3, { walkable: false });
        }
        // coal bunker & pile, shovels, the chimney flue base in the corner
        b.mound("rubble", -8.5, 0, 66, 2.6, 1.6, 3.0, { c: 0x2a2a2a, seed: 7 });
        PH.col(-8.5, 66, 3.6, 4.2, 0, 1.2, 0, {});
        b.boxMM("brick_dark", -29.4, 0, 66, -25, H, 69.4, { grime: 0.8 });
        PH.colMM(-29.4, 0, 66, -25, H, 69.4, { walkable: false });
        // control bay: gauge board + terminal
        b.boxMM("panel", -29.6, 0, 42, -29.1, 3.2, 47, { seg: false });
        for (let i = 0; i < 10; i++)
          b.cyl(
            "chrome",
            -29.05,
            1.4 + (i % 2) * 0.8,
            42.6 + ((i / 2) | 0) * 0.9,
            0.2,
            0.2,
            0.06,
            10,
            { rz: Math.PI / 2, hSeg: 1 },
          );
        PH.colMM(-29.6, 0, 42, -29.1, 3.2, 47, { walkable: false });
        const bhK = PH.signMat(
          "domino_boiler",
          ["BOILER HOUSE", "MAX 180 PSI · BLOW DOWN DAILY"],
          "enamel",
          768,
          160,
          { bg: "#2a3a44" },
        );
        b.quad(bhK, -18, 5, z0 + 0.32, 4, 0.8, {});
        for (const [x, z] of [
          [-20, 43],
          [-8, 50],
          [-20, 68],
        ])
          PH.cageLamp(b, x, 6, z, 0, { r: 9, i: 0.7 });
        for (const [x, z] of [
          [-19, 50.5],
          [-19, 59.5],
          [-9, 45],
          [-9, 66],
        ])
          PH.hangLamp(b, x, 14, z, 4.5, { r: 11, i: 0.9 });
        // steam vents (hazard): broken pipe joints that burst periodically
        const vents = [
          [-14, 50.5],
          [-14, 59.5],
          [-24, 59.5],
        ];
        for (const [x, z] of vents) {
          b.rod("rust", PH.v3(x, 0, z), PH.v3(x, 2.2, z), 0.2, 8);
          b.cyl("iron", x, 2.2, z, 0.28, 0.28, 0.2, 8, { hSeg: 1 });
          PH.col(x, z, 0.5, 0.5, 0, 2.3, 0, { walkable: false });
        }
        PH.domVents = vents.map(([x, z]) => ({
          x: O.x + x,
          z: O.z + z,
          t: r() * 4,
        }));
        molassesPools.push([-16, 42.5, 1.6]);
        b.cyl("molasses", -16, 0.005, 42.5, 1.6, 1.6, 0.03, 16, {
          hSeg: 1,
          noAO: true,
        });
        A.boiler = PH.A(-9, 0, 55, Math.PI / 2);
        A.boiler_terminal = PH.A(-28.6, 0, 48.2, -Math.PI / 2);
        A.spawn6 = PH.A(-9, 0, 62, 0);
        A.loot3 = PH.A(-28.8, 0, 51, -Math.PI / 2);
      }
      // coal corridor back to the warehouse (x -20..-14, z 20..40)
      PH.room(b, {
        x0: -20.2,
        z0: 19.7,
        x1: -13.8,
        z1: 40.3,
        y: 0,
        h: 3.6,
        wall: "brick_dark",
        floor: "concrete",
        ceil: "concrete",
        noWalls: { n: true, s: true },
      });
      b.boxMM("rust", -19.8, 0, 22, -19.2, 0.12, 38, { seg: false });
      for (const z of [26, 34])
        PH.cageLamp(b, -14.1, 3, z, -Math.PI / 2, { r: 6, i: 0.6 });
      const cK = PH.signMat(
        "domino_coal",
        ["◂ WAREHOUSE", "BOILER HOUSE ▸"],
        "enamel",
        512,
        160,
        { bg: "#2a3a44" },
      );
      b.quad(cK, -14.12, 2.2, 30, 1.6, 0.5, { ry: -Math.PI / 2 });

      // ---------------- props ----------------
      PH.propAt("footlocker", 30, 6, -18.6, 0, {
        loot: "brute",
        name: "Brute Stash",
      });
      PH.propAt("ammo_box", -27.5, 0, 9, Math.PI / 2, { loot: "ammo_box" });
      PH.propAt("safe", 43, 0, 50, -Math.PI / 2, {
        items: [
          ["scrip", 140],
          ["freedom_flakes", 4],
          ["rally_tonic", 2],
          ["focus_pills", 1],
        ],
        name: "QC Safe",
        lock: PH.regLock({
          id: "ph_lk_dom_qc_safe",
          label: "QC Safe",
          kind: "safe",
          code: "1884",
          hint: 'The QC teletype\'s "Pure Cane Reserve" entry gives the petty-cash safe combination.',
        }),
      });
      PH.propAt("terminal", 40.5, 0.97, 51, Math.PI, {
        mount: "bare",
        terminalId: "ph_domino_qc",
      });
      PH.propAt("terminal", -28.6, 0, 48.2, -Math.PI / 2, {
        terminalId: "ph_domino_ops",
      });
      PH.propAt("first_aid", 43.8, 1.3, 58, -Math.PI / 2, {
        loot: "first_aid",
      });
      PH.propAt("toolbox", -28.8, 0, 51, -Math.PI / 2, { loot: "toolbox" });
      PH.propAt("crate", -27, 0, -8, 0.3, { kind: "plain" });
      PH.propAt("barrel", -5, 0, 17, 0, { explosive: true });
      PH.propAt("barrel", 32, 0, 3, 0, { radioactive: true });

      // solid fill around the rooms at ground level (keeps generic spawns inside the building)
      PH.fillVoid(
        -44,
        -34,
        56,
        84,
        [
          [-30.3, -20.3, 6.3, 20.3],
          [5.7, -20.3, 34.3, 20.3],
          [30, 48.7, 44.3, 63.3],
          [-6.3, 53.2, 10.6, 58.8],
          [-30.3, 39.7, -5.7, 70.3],
          [-20.5, 19.5, -13.5, 40.5],
        ],
        [[SILO.x, SILO.z, SILO.r + 0.6]],
        2,
        3.2,
      );
      const g = b.build(root, { interior: true });
      g.name = "domino_interior";
      PH.setOrigin(0, 0);

      // ---------------- hazards: sticky molasses (slows), steam vents (burst damage) ----------------
      const pools = molassesPools.map(([x, z, rad]) => ({
        x: O.x + x,
        z: O.z + z,
        r: rad,
      }));
      PH.hazards.push(function (P, last) {
        if (
          Math.abs(P.pos.x - O.x) > 160 ||
          Math.abs(P.pos.z - O.z) > 160 ||
          P.pos.y > 0.6 ||
          P.fly ||
          P.noclip
        )
          return;
        for (const pl of pools) {
          if (Math.hypot(P.pos.x - pl.x, P.pos.z - pl.z) < pl.r) {
            // undo most of this frame's horizontal motion (wading through syrup)
            P.pos.x = last.x + (P.pos.x - last.x) * 0.38;
            P.pos.z = last.z + (P.pos.z - last.z) * 0.38;
            P.sprinting = false;
            if (!PH._stickyMsg || G.time.elapsed - PH._stickyMsg > 20) {
              PH._stickyMsg = G.time.elapsed;
              G.notify(
                "Molasses. You are now the world's slowest candy apple.",
              );
            }
            return;
          }
        }
      });
      PH.updaters.push(function (dt) {
        if (!dt || !PH.domVents) return;
        const P = G.player;
        if (Math.abs(P.pos.x - O.x) > 160 || Math.abs(P.pos.z - O.z) > 160)
          return;
        for (const v of PH.domVents) {
          v.t -= dt;
          if (v.t <= 0) {
            v.t = 3.5 + Math.random() * 2.5;
            v.burst = 1.2;
            try {
              if (!G.isStub("fx") && G.fx.smoke) {
                const h = G.fx.smoke(PH.v3(v.x, 2.4, v.z), 1.2);
                if (h && h.stop)
                  setTimeout(() => {
                    try {
                      h.stop();
                    } catch (e) {
                      /* */
                    }
                  }, 1200);
              }
            } catch (e) {
              /* */
            }
            PH.sfx("fire_loop", { pos: PH.v3(v.x, 2.4, v.z), volume: 0.5 });
          }
          if (v.burst > 0) {
            v.burst -= dt;
            if (Math.hypot(P.pos.x - v.x, P.pos.z - v.z) < 2.2 && P.pos.y < 3) {
              v.hitT = (v.hitT || 0) - dt;
              if (v.hitT <= 0) {
                v.hitT = 0.4;
                P.damage(6, { type: "fire", source: "steam" });
              }
            }
          }
        }
      });

      // ---------------- doors ----------------
      const D = PH.DOMINO.DOOR;
      try {
        G.world.addDoor({
          id: "ph_domino_front",
          pos: PH.v3(D.x, 2.4, D.z - 0.4),
          label: "Brooklyn Sugar Works",
          verb: "Enter",
          radius: 1.8,
          target: { x: A.entrance.x, y: 0.05, z: A.entrance.z, yaw: Math.PI },
          sound: "door_open",
        });
        G.world.addDoor({
          id: "ph_domino_exit",
          pos: PH.v3(O.x - 12, 1.8, O.z - 19.6),
          label: "Williamsburg Waterfront",
          verb: "Exit",
          radius: 1.8,
          target: { x: D.x, y: 1.25, z: D.z - 3.5, yaw: 0 },
          sound: "door_open",
        });
        // QC lab: Sweet Tooth's sticky key, or the door keypad code from Foreman Russo's clipboard (warehouse)
        const qcLock = PH.regLock({
          id: "ph_lk_dom_qc_door",
          label: "Quality Control Lab",
          kind: "door",
          key: "ph_key_domino_qc",
          code: "2210",
          hint: "Sweet Tooth carries the key; Foreman Russo's clipboard in the warehouse has the keypad code.",
        });
        PH.qcDoor = G.world.addInteractable({
          pos: PH.v3(O.x + 30.3, 1.2, O.z + 56),
          radius: 0.9,
          label: "Quality Control Lab",
          verb: "Open",
          priority: 1,
          locked: () => (PH.flag("domino_qc_open") ? null : "Locked"),
          onInteract() {
            if (PH.flag("domino_qc_open")) return;
            PH.lockOpen(qcLock, () => {
              PH.setFlag("domino_qc_open");
              PH.sfx("door_open");
              G.notify(
                PH.hasItem("ph_key_domino_qc")
                  ? "Sweet Tooth's sticky key turns. Eventually."
                  : "The keypad chirps. The QC lab door unlocks.",
              );
            });
          },
        });
      } catch (e) {
        PH.safe("domino doors", () => {
          throw e;
        });
      }
      PH.lockBlocker("domino_qc_open", O.x + 30.3, O.z + 56, 0.7, 1.8, 0, 2.4);

      PH.register("domino_sugar", {
        root: PH.dominoExt ? PH.dominoExt.root : null,
        interiorRoot: root,
        interiorKey: "domino_sugar",
        anchors: Object.assign(
          {},
          PH.dominoExt ? PH.dominoExt.anchors : {},
          A,
          { interior_entrance: A.entrance },
        ),
      });
    },
    22,
  );
