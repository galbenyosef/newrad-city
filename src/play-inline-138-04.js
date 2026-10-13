// play-inline-138 04 — ix0
// Lines 710-1214 of readable/play-inline-138.pretty.js (statement-aligned).
  LB.interiors.nyse = {
    /** ctx: {root, anchors, X0, X1, XC, ZF, ZB (hall walls), H (hall height)}. */
    floor(ctx) {
      const K = LB.kit,
        D = LB.dress;
      const { anchors, X0, X1, XC, ZF, ZB, H } = ctx;
      const bi = (ctx.bi = LB.batch("nyse_floor"));
      bi.ground = 0;
      bi.aoH = 3;
      const IX0 = X0 + 1.2,
        IX1 = X1 - 1.2,
        IZ0 = ZF + 1.2,
        IZ1 = ZB - 1.2;
      bi.setLights(
        [
          { x: XC - 6, y: 1.4, z: 824.5, color: 0xff9a40, r: 12, i: 1.1 },
          { x: XC + 7, y: 1.4, z: 839.5, color: 0xff9a40, r: 12, i: 1.1 }, // burning barrels
          { x: XC - 7, y: 12.0, z: 831, color: 0xffd8a0, r: 17, i: 0.9 },
          { x: XC + 7, y: 12.0, z: 831, color: 0xffd8a0, r: 17, i: 0.9 }, // work lamps
          { x: XC, y: 12.0, z: 826, color: 0xffd8a0, r: 14, i: 0.7 },
          { x: XC, y: 5, z: 834.5, color: 0x60ff90, r: 9, i: 0.5 },
          { x: XC - 7, y: 5, z: 827.5, color: 0x60ff90, r: 7, i: 0.4 },
          { x: XC + 7, y: 5, z: 827.5, color: 0x60ff90, r: 7, i: 0.4 },
          { x: IX0 + 1.5, y: 9, z: 831.5, color: 0xffc070, r: 9, i: 0.6 }, // bell podium lamp
        ],
        0xc8b8a0,
        0.22,
      );
      bi.boxMM("planks", IX0, 0, IZ0, IX1, 0.06, IZ1, {
        grime: 0.6,
        noAO: true,
        uvScale: 3,
      });
      LB.colMM(X0, -0.5, ZF, X1, 0.06, ZB);
      // interior lining: dark panelled dado + plaster above, coffered ceiling grid
      for (const [x0, z0, x1, z1] of [
        [IX0, IZ0, IX1, IZ0 + 0.05],
        [IX0, IZ1 - 0.05, IX1, IZ1],
        [IX0, IZ0, IX0 + 0.05, IZ1],
        [IX1 - 0.05, IZ0, IX1, IZ1],
      ]) {
        const isDoorWall = z0 === IZ0 && z1 === IZ0 + 0.05;
        if (isDoorWall) {
          bi.boxMM("rotten", x0, 0, z0, XC - 1.8, 2.4, z1, { seg: false });
          bi.boxMM("rotten", XC + 1.8, 0, z0, x1, 2.4, z1, { seg: false });
          bi.boxMM("plaster", x0, 3.1, z0, x1, H - 3, z1, { grime: 0.5 });
          bi.boxMM("plaster", x0, 2.4, z0, XC - 1.8, 3.1, z1, { seg: false });
          bi.boxMM("plaster", XC + 1.8, 2.4, z0, x1, 3.1, z1, { seg: false });
        } else {
          bi.boxMM("rotten", x0, 0, z0, x1, 2.4, z1, {
            seg: false,
            grime: 0.6,
          });
          bi.boxMM("plaster", x0, 2.4, z0, x1, H - 3, z1, { grime: 0.5 });
        }
      }
      bi.boxMM("plaster", IX0, H - 3.05, IZ0, IX1, H - 3, IZ1, { grime: 0.3 });
      for (let x = IX0 + 2.5; x < IX1; x += 3.4)
        bi.box("marble", x, H - 3.8, (IZ0 + IZ1) / 2, 0.5, 0.8, IZ1 - IZ0, {
          seg: false,
          grime: 0.3,
        });
      for (let z = IZ0 + 2.5; z < IZ1; z += 3.4)
        bi.box("marble", XC, H - 3.8, z, IX1 - IX0, 0.8, 0.5, {
          seg: false,
          grime: 0.3,
        });
      // scrolling stock ticker bands (seamless: the canvas holds exactly one cycle of quotes)
      const TK = (() => {
        const items = [
          ["SCRIP", "▲", "0.02"],
          ["RALLY TONIC", "▼", "4.50"],
          ["RUSH", "▲", "12.00"],
          ["PURIFIED H2O", "▲", "9.75"],
          ["OX HIDE", "▼", "1.10"],
          ["CIVIL DEFENSE", "▼", "0.00"],
          ["FIZZO", "▲", "3.33"],
          ["PRUSSIAN BLUE", "▲", "7.40"],
          ["RECOILLESS RD", "▼", "88.00"],
          ["BISCUIT", "▲", "∞"],
        ];
        const mc = document.createElement("canvas").getContext("2d");
        mc.font = 'bold 34px "Courier New", monospace';
        let wTot = 0;
        for (const it of items)
          wTot +=
            mc.measureText(it[0] + " ").width +
            mc.measureText(it[1] + it[2] + "    ").width;
        const W = Math.ceil(wTot);
        const tex = LB.canvasTex("lb_ticker2", W, 64, (ctx, w, h) => {
          ctx.fillStyle = "#050805";
          ctx.fillRect(0, 0, w, h);
          ctx.font = 'bold 34px "Courier New", monospace';
          ctx.textBaseline = "middle";
          let x = 0;
          for (const it of items) {
            ctx.fillStyle = "#e8c860";
            ctx.fillText(it[0], x, h / 2);
            x += ctx.measureText(it[0] + " ").width;
            ctx.fillStyle = it[1] === "▲" ? "#50ff70" : "#ff5040";
            ctx.fillText(it[1] + it[2], x, h / 2);
            x += ctx.measureText(it[1] + it[2] + "    ").width;
          }
        });
        return {
          key: LB.texMat("nyse_ticker2", tex, {
            emissive: 1.4,
            noShadow: true,
          }),
          W,
        };
      })();
      const TKH = 1.3,
        tkLen = IX1 - IX0 - 0.4;
      for (const zz of [IZ0 + 0.1, IZ1 - 0.1])
        bi.quad(TK.key, XC, 9, zz, tkLen, TKH, {
          ry: zz < 830 ? 0 : Math.PI,
          us: tkLen / ((TK.W / 64) * TKH),
          grime: 0,
          noAO: true,
        });
      // trading posts: counter ring, a mast carrying a ring of CRT monitors, cables, paper everywhere
      const post = (x, z, seed) => {
        bi.cyl("paint_cream", x, 0, z, 2.2, 2.3, 1.15, 20, {
          hSeg: 1,
          grime: 0.6,
        });
        bi.cyl("rotten", x, 1.15, z, 2.45, 2.45, 0.1, 20, { hSeg: 1 });
        bi.cyl("iron", x, 1.25, z, 0.22, 0.22, 3.4, 8, { hSeg: 1 });
        bi.cyl("paint_cream", x, 4.3, z, 2.7, 2.7, 1.05, 16, {
          hSeg: 1,
          open: true,
          grime: 0.7,
        });
        bi.cyl("panel", x, 5.35, z, 2.75, 2.75, 0.08, 16, { hSeg: 1 });
        bi.cyl("panel", x, 4.22, z, 2.75, 2.75, 0.08, 16, { hSeg: 1 });
        const r = LB.rng(seed);
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU;
          bi.quad(
            r() < 0.45 ? "screen" : "glass_dark",
            x + Math.sin(a) * 2.72,
            4.82,
            z + Math.cos(a) * 2.72,
            1.15,
            0.72,
            { ry: a, noAO: true, grime: 0 },
          );
        }
        for (let i = 0; i < 5; i++) {
          const a = r() * TAU;
          D.monitor(
            bi,
            x + Math.sin(a) * 1.8,
            1.25,
            z + Math.cos(a) * 1.8,
            a,
            r() < 0.4,
          );
        }
        D.cable(
          bi,
          [V(x, 5.4, z), V(x + (r() - 0.5) * 8, H - 3.2, z + (r() - 0.5) * 6)],
          1.2,
        );
        LB.col(x, z, 4.4, 4.4, 0, 1.3, 0, {
          walkable: false,
          surface: "metal",
        });
      };
      post(XC - 7, 827.5, 1);
      post(XC, 834.5, 2);
      post(XC + 7, 827.5, 3);
      // the Boss's throne on the centre post: car seats, a gas-station sign as a backrest, skulls & a hoard of gilt plates
      bi.box("paint_red", XC, 1.25, 834.5, 1.3, 0.45, 1.1, {
        seg: false,
        grime: 0.6,
      });
      bi.box("paint_red", XC, 1.7, 835.05, 1.3, 1.5, 0.25, {
        rx: -0.12,
        seg: false,
        grime: 0.6,
      });
      for (const s of [-0.75, 0.75])
        bi.box("chrome", XC + s, 1.25, 834.5, 0.2, 0.75, 1.0, { seg: false });
      bi.quad(LB.brandMat("hi_octane"), XC, 3.4, 835.25, 2.6, 1.3, {
        ry: Math.PI,
        rz: 0.08,
      });
      // the safe combination, scratched into the back of the backrest (faces the Boss's safe)
      const scK = LB.texMat(
        "nyse_throne_scrawl",
        LB.graffitiTex(
          "throne_scrawl",
          ["SAFE 1929", "LIKE THE CRASH"],
          512,
          256,
          { color: "#e8e0c8", drips: false },
        ),
        { transparent: true },
      );
      bi.quad(scK, XC, 2.3, 835.36, 1.1, 0.55, { grime: 0, noAO: true });
      for (let i = 0; i < 3; i++)
        bi.sphere("bone", XC - 1 + i, 3.3 + (i % 2) * 0.3, 835.2, 0.16, {
          sx: 1,
          sy: 1.1,
          sz: 1.2,
        });
      for (let i = 0; i < 18; i++)
        bi.cyl(
          "gilt",
          XC - 3.2 + Math.sin(i) * 1.3,
          0.06 + (i % 3) * 0.1,
          838.8 + Math.cos(i * 1.7) * 0.9,
          0.35,
          0.4,
          0.12,
          10,
          { hSeg: 1 },
        );
      // the bell podium balcony on the west wall (closing bell, still rung for raider auctions)
      const BPY = 6.5;
      bi.boxMM("marble", IX0, BPY - 0.4, 829, IX0 + 2.6, BPY, 834, {
        seg: false,
      });
      K.balustrade(
        bi,
        "marble",
        [
          [IX0 + 2.5, 829],
          [IX0 + 2.5, 834],
        ],
        BPY,
        1.0,
        {},
      );
      for (const z of [829.3, 833.7])
        bi.box("marble", IX0 + 1.2, BPY - 1.6, z, 2.3, 1.2, 0.4, {
          seg: false,
        });
      bi.box("iron", IX0 + 0.6, BPY, 831.5, 0.12, 2.2, 0.12, { seg: false });
      bi.box("iron", IX0 + 0.6, BPY + 2.2, 831.5, 0.12, 0.12, 1.2, {
        seg: false,
      });
      bi.lathe(
        "gilt",
        [
          [0.05, 0],
          [0.3, 0.05],
          [0.42, 0.4],
          [0.4, 0.6],
          [0.12, 0.72],
        ],
        12,
        IX0 + 0.6,
        BPY + 1.35,
        831.5,
        { rx: Math.PI },
      );
      const bellK = LB.texMat(
        "nyse_bell",
        LB.signTex(
          "nyse_bell",
          ["AUCTION TODAY", "LOT 1: YOU"],
          "raider",
          512,
          192,
          { bg: "#4a463c" },
        ),
      );
      bi.quad(bellK, IX0 + 2.62, BPY - 0.9, 831.5, 2.2, 0.8, {
        ry: Math.PI / 2,
      });
      anchors.bell = LB.anchor(IX0 + 1.5, BPY, 831.5, -Math.PI / 2);
      // Round 2: the podium was unreachable (no floor collider, no way up). The raiders built an L-shaped scrap stair:
      // along the front wall (west-bound, from x 10.2) to a landing in the SW corner, then north up the west wall to the
      // podium's south end. Solid stepped mass (corrugated sheet risers over scrap fill, steel treads) = solid colliders.
      LB.colMM(IX0, BPY - 0.4, 829, IX0 + 2.6, BPY, 834, { surface: "wood" });
      LB.colWall(IX0 + 2.55, 829, IX0 + 2.55, 834, 0.25, BPY, BPY + 1.0, {
        walkable: false,
      });
      {
        const LY = 2.6,
          ZA = IZ0 + 0.15,
          ZBs = IZ0 + 1.25,
          XL0 = IX0 + 0.15,
          XL1 = IX0 + 1.4,
          XS = 10.2;
        const step = (x0, z0, x1, z1, top) => {
          bi.boxMM("corrugated", x0, 0, z0, x1, top - 0.06, z1, { grime: 0.7 });
          bi.boxMM(
            "steel",
            x0 - 0.02,
            top - 0.06,
            z0 - 0.02,
            x1 + 0.02,
            top,
            z1 + 0.02,
            { seg: false, grime: 0.5 },
          );
          LB.colMM(x0, 0, z0, x1, top, z1, { surface: "metal" });
        };
        // flight 1: along the front wall, rising westward to the landing
        const n1 = 10,
          r1 = (XS - XL1) / n1;
        for (let i = 0; i < n1; i++)
          step(XS - r1 * (i + 1), ZA, XS - r1 * i, ZBs, (LY * (i + 1)) / n1);
        // landing (SW corner)
        step(XL0, ZA, XL1, ZBs + 0.2, LY);
        // flight 2: north up the west wall to the podium
        const Z2 = ZBs + 0.2,
          n2 = 14,
          r2 = (829 - Z2) / n2;
        for (let i = 0; i < n2; i++)
          step(
            XL0,
            Z2 + r2 * i,
            XL1,
            Z2 + r2 * (i + 1),
            LY + ((BPY - LY) * (i + 1)) / n2,
          );
        // hand rails on the open sides (+ colliders), a few scrap props
        const rail = (ax, az, ay, bx2, bz, by) => {
          bi.beam(
            "iron",
            V(ax, ay + 1.0, az),
            V(bx2, by + 1.0, bz),
            0.05,
            0.05,
          );
          for (let k = 0; k <= 3; k++) {
            const t = k / 3;
            bi.box(
              "iron",
              ax + (bx2 - ax) * t,
              ay + (by - ay) * t,
              az + (bz - az) * t,
              0.05,
              1.0,
              0.05,
              { seg: false },
            );
          }
        };
        rail(
          XS - r1 * 1.5,
          ZBs + 0.06,
          (LY * 1.5) / n1,
          XL1 + 0.05,
          ZBs + 0.06,
          LY,
        );
        LB.colWall(
          XS - r1 * 1.5,
          ZBs + 0.08,
          XL1 + 0.3,
          ZBs + 0.08,
          0.12,
          0,
          LY + 1.0,
          { walkable: false },
        );
        rail(XL1 + 0.06, Z2 + 0.3, LY, XL1 + 0.06, 829, BPY);
        LB.colWall(XL1 + 0.08, Z2 + 0.3, XL1 + 0.08, 829, 0.12, 0, BPY + 1.0, {
          walkable: false,
        });
        bi.beam(
          "iron",
          V(XL1 + 0.06, BPY + 1.0, 829.05),
          V(IX0 + 2.55, BPY + 1.0, 829.05),
          0.05,
          0.05,
        );
        bi.box("iron", IX0 + 2.5, BPY, 829.05, 0.05, 1.0, 0.05, { seg: false });
        LB.colWall(
          XL1 + 0.1,
          829.05,
          IX0 + 2.55,
          829.05,
          0.15,
          BPY,
          BPY + 1.0,
          { walkable: false },
        );
        const tag = LB.texMat(
          "nyse_stair_tag",
          LB.signTex("nyse_stair_tag", ["BIDDERS ONLY ▲"], "raider", 256, 96, {
            bg: "#4a463c",
          }),
        );
        bi.quad(tag, XS - 1.2, 1.2, ZBs + 0.03, 1.6, 0.6, { ry: 0 });
      }
      // cages, mattresses, overturned chairs, paper drifts, burning barrels, lamps
      for (const [x, z] of [
        [IX0 + 2.2, 840],
        [IX1 - 2.2, 840],
      ]) {
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * TAU;
          bi.box(
            "iron",
            x + Math.cos(a) * 1.3,
            0.06,
            z + Math.sin(a) * 1.3,
            0.06,
            2.6,
            0.06,
            { seg: false },
          );
        }
        bi.cyl("iron", x, 2.66, z, 1.4, 1.4, 0.1, 10, { hSeg: 1 });
        LB.col(x, z, 2.6, 2.6, 0, 2.7, 0, { walkable: false });
      }
      LB.skeleton(bi, IX1 - 2.2, 0.1, 840, 0.5);
      for (let i = 0; i < 4; i++)
        D.mattress(
          bi,
          IX1 - 1.2,
          0.06,
          823.5 + i * 2.3,
          Math.PI / 2 + (i % 2) * 0.2,
        );
      const cr = LB.rng("nyse_chairs");
      for (let i = 0; i < 12; i++)
        D.chair(
          bi,
          XC + (cr() - 0.5) * 20,
          0.06,
          823 + cr() * 17,
          cr() * TAU,
          cr() < 0.6,
          cr() < 0.5 ? "rotten" : "iron",
        );
      D.papers(bi, XC - 5, 0.06, 831, 5, 40, 11);
      D.papers(bi, XC + 5, 0.06, 836, 4, 30, 12);
      D.papers(bi, XC + 2, 0.06, 824, 3, 20, 13);
      LB.barrel(bi, XC - 6, 0.06, 824.5, { fire: true });
      LB.barrel(bi, XC + 7, 0.06, 839.5, { fire: true });
      for (const [x, z] of [
        [XC - 7, 831],
        [XC + 7, 831],
        [XC, 826],
      ]) {
        bi.cyl("iron", x, 12.8, z, 0.02, 0.02, H - 3 - 12.8, 4, { hSeg: 1 });
        bi.cyl("iron", x, 12.4, z, 0.1, 0.45, 0.4, 8, { hSeg: 1 });
        bi.sphere("lamp", x, 12.35, z, 0.22, { noAO: true, grime: 0 });
        LB.glows.push({ pos: V(x, 12.3, z), color: 0xffd8a0, size: 2.4 });
      }
      D.rubble(bi, IX1 - 3, 0.06, IZ0 + 2.5, 1.2, 6, 21);
      // merchant stall inside the doors (the Exchange's fence) + the ledger desk by the throne
      D.stall(bi, IX0 + 3.2, 824.5, Math.PI / 2, 3.6, 2.4, {
        goods: "guns",
        sign: "BUY · SELL · NO REFUNDS",
        seed: 5,
      });
      anchors.merchant1 = LB.anchor(IX0 + 3.1, 0.06, 824.5, -Math.PI / 2);
      bi.box("rotten", XC + 3.4, 0.06, 837.8, 1.8, 0.8, 0.9, { seg: false });
      D.papers(bi, XC + 3.4, 0.87, 837.8, 0.6, 6, 14);
      LB.col(XC + 3.4, 837.8, 1.8, 0.9, 0, 0.86, 0, { walkable: false });
      anchors.ledger = LB.anchor(XC + 3.4, 0.9, 837.8, 0);
      anchors.boss = LB.anchor(XC, 1.3, 834.4, 0); // on the throne, facing the doors (north)
      anchors.trading_floor = LB.anchor(XC, 0.06, 825.5, Math.PI);
      anchors.spawn1 = LB.anchor(XC - 8, 0, 823.5);
      anchors.spawn2 = LB.anchor(XC + 8, 0, 823.5);
      anchors.spawn3 = LB.anchor(IX0 + 3, 0, 836);
      anchors.spawn4 = LB.anchor(IX1 - 3, 0, 835.5);
      anchors.loot = LB.anchor(XC - 3.2, 0.1, 838.8);
      anchors.desk = anchors.ledger.clone();
      ctx.TK = TK;
    },
    /** After the exterior batch is built (ctx.g = landmark group). */
    attach(ctx) {
      const { XC } = ctx;
      ctx.bi.build(ctx.g);
      const tkMat = LB.mat(ctx.TK.key);
      LB.animate(V(XC, 0, 830), 120, (t) => {
        if (tkMat && tkMat.map) tkMat.map.offset.x = (t * 0.035) % 1;
      });
    },
    /** Inside the landmark's initDone hook, between the fort turrets and the forecourt footlocker. */
    props(ctx) {
      const { XC } = ctx;
      LB.registerLock(EXCHANGE_SAFE);
      LB.spawnProp("safe", {
        x: XC - 4.5,
        y: 0.06,
        z: 840.8,
        yaw: 0,
        loot: "raider_boss",
        owner: "raiders",
        name: "The Boss's Safe",
        lock: EXCHANGE_SAFE,
      });
      LB.plaque(
        V(XC, 2.3, 835.6),
        "Scratches on the Throne",
        'Scratched into the back of the Boss\'s throne: "SAFE 1929 — LIKE THE CRASH. TOUCH IT AN DIE."',
        () =>
          LB.learnCode(
            EXCHANGE_SAFE.id,
            "Scratched on the Boss's throne, the Exchange",
          ),
      );
    },
  };
