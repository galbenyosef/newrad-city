// play-inline-276 04 — box
// Lines 760-1849 of readable/play-inline-276.pretty.js (statement-aligned).
  function buildInterior() {
    const O = P.I("bellamys");
    const S = P.site("bellamys_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x5a544a,
      ambI: 0.3,
      interiorKey: "bellamys",
    });
    const b = S.b;
    const L0 = 0,
      L1 = 5,
      L2 = 10,
      CH = 15;
    const HX0 = -30,
      HX1 = 30,
      HZ0 = -18,
      HZ1 = 18;
    const FX0 = -30,
      FX1 = -24,
      FZ0 = -18,
      FZ1 = -6.8; // freight stair enclosure
    const WX = 8; // escalator well half-width
    // ------------------------------------------------------------------
    // shell: outer walls three storeys, floors with the escalator holes
    // ------------------------------------------------------------------
    S.floor("checker", HX0, HZ0, HX1, HZ1, L0, { t: 0.4, surface: "concrete" });
    S.wallX("plaster_cream", HZ0, HX0, HX1, L0, CH, 0.4, []);
    S.wallX(
      "plaster_cream",
      HZ1,
      HX0,
      HX1,
      L0,
      CH,
      0.4,
      [[-1.6, 1.6, 0, 3.4]],
      { frame: "bronze" },
    );
    S.wallZ("plaster_cream", HX0, HZ0, HZ1, L0, CH, 0.4, []);
    S.wallZ("plaster_cream", HX1, HZ0, HZ1, L0, CH, 0.4, []);
    S.ceil("plaster_cream", HX0, HZ0, HX1, HZ1, CH);
    // L2 floor (y 5) with hole x -8..8, z -4.9..4.2
    for (const [x0, z0, x1, z1] of [
      [FX1, HZ0, HX1, -4.9],
      [HX0, FZ1, FX1, -4.9],
      [HX0, 4.2, HX1, HZ1],
      [HX0, -4.9, -WX, 4.2],
      [WX, -4.9, HX1, 4.2],
    ])
      S.floor("parquet", x0, z0, x1, z1, L1, { t: 0.35, surface: "wood" });
    // L3 floor (y 10) with hole x -8..8, z -6..2.4
    for (const [x0, z0, x1, z1] of [
      [FX1, HZ0, HX1, -6],
      [HX0, FZ1, FX1, -6],
      [HX0, 2.4, HX1, HZ1],
      [HX0, -6, -WX, 2.4],
      [WX, -6, HX1, 2.4],
    ])
      S.floor("carpet", x0, z0, x1, z1, L2, { t: 0.35, surface: "carpet" });
    // columns (black with gilt capitals) on a 10 m grid
    for (const x of [-20, -10, 10, 20])
      for (const z of [-10, 0, 10]) {
        if (x === -20 && z === -10) continue;
        for (const [y0, y1] of [
          [L0, L1],
          [L1, L2],
          [L2, CH],
        ]) {
          b.box(
            "deco_black",
            x - 0.45,
            y0,
            z - 0.45,
            x + 0.45,
            y1 - 0.35,
            z + 0.45,
            { seg: false },
          );
          b.box(
            "gold",
            x - 0.6,
            y1 - 0.6,
            z - 0.6,
            x + 0.6,
            y1 - 0.35,
            z + 0.6,
            { seg: false },
          );
          for (const s of [-1, 1]) {
            b.box(
              "gold",
              x + s * 0.46 - 0.02,
              y0 + 0.3,
              z - 0.3,
              x + s * 0.46 + 0.02,
              y1 - 0.8,
              z - 0.26,
              { seg: false },
            );
            b.box(
              "gold",
              x + s * 0.46 - 0.02,
              y0 + 0.3,
              z + 0.26,
              x + s * 0.46 + 0.02,
              y1 - 0.8,
              z + 0.3,
              { seg: false },
            );
          }
          S.col(x - 0.45, y0, z - 0.45, x + 0.45, y1, z + 0.45, {
            walkable: false,
          });
        }
      }
    // escalators
    X.escalator(S, -2.2, 3.5, "n", L0, L1, { w: 1.2 });
    X.escalator(S, 2.2, 3.5, "n", L0, L1, { w: 1.2, broken: true });
    X.escalator(S, -6.2, -6.0, "s", L1, L2, { w: 1.2 });
    X.escalator(S, 6.2, -6.0, "s", L1, L2, { w: 1.2, broken: true });
    // well balustrades (glass + brass rail)
    const glassRail = (x0, z0, x1, z1, y) => {
      const L = Math.hypot(x1 - x0, z1 - z0),
        ang = Math.atan2(z1 - z0, x1 - x0),
        cx = (x0 + x1) / 2,
        cz = (z0 + z1) / 2;
      b.box(
        "glass",
        cx - L / 2,
        y + 0.1,
        cz - 0.02,
        cx + L / 2,
        y + 1.0,
        cz + 0.02,
        { ry: -ang, seg: false, noAO: true, noBake: true },
      );
      b.box(
        "brass",
        cx - L / 2,
        y + 1.0,
        cz - 0.05,
        cx + L / 2,
        y + 1.08,
        cz + 0.05,
        { ry: -ang, seg: false },
      );
      b.box(
        "deco_black",
        cx - L / 2,
        y,
        cz - 0.08,
        cx + L / 2,
        y + 0.12,
        cz + 0.08,
        { ry: -ang, seg: false },
      );
      S.colR(cx, cz, L, 0.2, y, y + 1.1, -ang, { walkable: false });
    };
    // L2 hole edges (openings where the L1→L2 escalators arrive at z -4.9, x ±2.2)
    glassRail(-WX, -4.9, -6.95, -4.9, L1);
    glassRail(-5.45, -4.9, -2.95, -4.9, L1);
    glassRail(-1.45, -4.9, 1.45, -4.9, L1);
    glassRail(2.95, -4.9, 5.45, -4.9, L1);
    glassRail(6.95, -4.9, WX, -4.9, L1);
    glassRail(-WX, -4.9, -WX, 4.2, L1);
    glassRail(WX, -4.9, WX, 4.2, L1);
    glassRail(-WX, 4.2, WX, 4.2, L1);
    // L3 hole edges (openings where the L2→L3 escalators arrive at z 2.4, x ±6.2)
    glassRail(-WX, -6, WX, -6, L2);
    glassRail(-WX, -6, -WX, 2.4, L2);
    glassRail(WX, -6, WX, 2.4, L2);
    glassRail(-5.45, 2.4, 5.45, 2.4, L2);
    glassRail(-WX, 2.4, -6.95, 2.4, L2);
    glassRail(6.95, 2.4, WX, 2.4, L2);
    // department directory boards at the escalator foot
    const dir = P.texMat(
      "bl_dir",
      P.signTex(
        "bl_dir",
        [
          '3 · HOME · FURNISHINGS · "THE ATOMIC HOME"',
          "2 · FASHION · BRIDAL · SHOES",
          "M · COSMETICS · JEWELRY · HANDBAGS",
        ],
        "gilt",
        1024,
        256,
        { font: P.FONTS.DECO },
      ),
      { rough: 0.5 },
    );
    b.box("deco_black", -1.0, L0, 5.6, 1.0, L0 + 2.4, 5.8, { seg: false });
    b.quad(dir, 0, L0 + 1.7, 5.81, 1.9, 0.48, {});
    S.col(-1.0, L0, 5.6, 1.0, L0 + 2.4, 5.8, { walkable: false });
    // deco chandeliers (tiered glass)
    const decoLamp = (x, y, z, lit) => {
      b.rod("brass", [x, y, z], [x, y + 1.2, z], 0.02, 4, { noAO: true });
      for (let t = 0; t < 3; t++)
        b.cyl(
          lit ? "lamp_warm" : "glass_dark",
          x,
          y - t * 0.28,
          z,
          0.35 + t * 0.18,
          0.45 + t * 0.18,
          0.22,
          12,
          { noAO: true, open: true },
        );
      b.cyl("brass", x, y + 0.2, z, 0.1, 0.4, 0.1, 10, { noAO: true });
      if (lit) {
        S.light(x, y - 0.6, z, 0xffdcb0, 12, 0.85);
        S.glow(x, y - 0.4, z, 0xffdcb0, 1.4);
      }
    };
    // ------------------------------------------------------------------
    // MAIN FLOOR (y 0)
    // ------------------------------------------------------------------
    for (const [x, z, lit] of [
      [-15, -3, true],
      [15, -3, false],
      [-15, 10, false],
      [15, 10, true],
      [0, 12, true],
    ])
      decoLamp(x, L1 - 1.3, z, lit);
    // cosmetics counters (west): glass cases in rows, some smashed
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++) {
        const x = -26 + i * 5.5,
          z = 3 + j * 6;
        D.case(b, x, L0, z, 3.6, 0.8, 0, {
          base: "deco_black",
          velvet: "fabric_white",
          frame: "brass",
          smashed: (i + j) % 2 === 1,
          goods: 6,
        });
        S.col(x - 1.8, L0, z - 0.4, x + 1.8, L0 + 1.3, z + 0.4, {
          walkable: false,
        });
        for (let k = 0; k < 5; k++)
          b.cyl(
            ["glass", "paint_red", "gold"][k % 3],
            x - 1.4 + k * 0.7,
            L0 + 1.31,
            z - 0.25,
            0.04,
            0.05,
            0.12,
            6,
            { noAO: true },
          );
      }
    const cs = P.texMat(
      "bl_cosm",
      P.signTex("bl_cosm", ["COSMETICS · FRAGRANCE"], "gilt", 1024, 96, {
        font: P.FONTS.DECO,
      }),
      { rough: 0.5 },
    );
    b.quad(cs, -20, L0 + 3.8, HZ1 - 0.22, 5, 0.45, { ry: PI });
    // perfume island with a giant atomiser
    b.cyl("deco_black", -18, L0, -5, 1.6, 1.7, 1.0, 16);
    b.cyl("marble", -18, L0 + 1.0, -5, 1.75, 1.75, 0.08, 16);
    b.lathe(
      "glass",
      [
        [0.001, 0],
        [0.5, 0],
        [0.6, 0.4],
        [0.35, 1.0],
        [0.12, 1.2],
        [0.12, 1.5],
        [0.001, 1.5],
      ],
      14,
      -18,
      L0 + 1.08,
      -5,
      { noAO: true, noBake: true },
    );
    b.sphere("lamp_warm", -18, L0 + 2.7, -5, 0.14, { ws: 8, hs: 6 });
    S.col(-19.7, L0, -6.7, -16.3, L0 + 1.1, -3.3, { walkable: false });
    // jewellery + handbags (east)
    for (let i = 0; i < 3; i++) {
      D.case(b, 17 + i * 4.2, L0, -6, 3.2, 0.8, 0, {
        base: "deco_black",
        frame: "brass",
        smashed: i === 1,
        goods: 10,
      });
      S.col(15.4 + i * 4.2, L0, -6.4, 18.6 + i * 4.2, L0 + 1.3, -5.6, {
        walkable: false,
      });
    }
    for (let i = 0; i < 4; i++) {
      const x = 16 + i * 3.4;
      b.box("wood_dark", x - 1.2, L0, 14.8, x + 1.2, L0 + 2.2, 15.3, {
        seg: false,
      });
      for (let k = 0; k < 6; k++) {
        const r = P.rng(i * 9 + k)();
        b.box(
          ["leather", "paint_red", "hide_dark", "fabric"][k % 4],
          x - 1.1 + k * 0.38,
          L0 + 1.0 + (k % 2) * 0.6,
          14.6,
          x - 0.8 + k * 0.38,
          L0 + 1.3 + (k % 2) * 0.6 + r * 0.1,
          14.8,
          { seg: false },
        );
      }
    }
    // information desk (round) with the store PA terminal
    b.cyl("deco_black", 0, L0, -10, 2.0, 2.0, 1.05, 20, { open: false });
    b.cyl("marble", 0, L0 + 1.05, -10, 2.1, 2.1, 0.07, 20);
    S.col(-1.9, L0, -11.9, 1.9, L0 + 1.1, -8.1, { walkable: false });
    S.prop("terminal", 0.8, L0 + 1.12, -8.6, 0.4, {
      terminalId: "uw_bl_pa",
      mount: "bare",
    });
    const inf = P.texMat(
      "bl_info",
      P.signTex("bl_info", ["INFORMATION"], "gilt", 512, 64, {
        font: P.FONTS.DECO,
      }),
      {},
    );
    b.cyl("brass", 0, L0 + 3.2, -10, 0.9, 0.9, 0.4, 12);
    b.quad(inf, 0, L0 + 3.4, -9.08, 1.6, 0.22, {});
    // the raider camp (north-east of the main floor)
    for (let i = 0; i < 4; i++)
      S.prop(
        "mattress",
        18 + (i % 2) * 2.4,
        L0,
        -15.5 + Math.floor(i / 2) * 2.4,
        i * 0.4,
        {},
      );
    S.prop("campfire", 23, L0, -11.5, 0, { spit: true });
    S.light(23, L0 + 1.2, -11.5, 0xff9040, 9, 1.0);
    S.glow(23, L0 + 0.7, -11.5, 0xff8a30, 1.2);
    S.prop("barrel", 27.5, L0, -16.5, 0, { burning: true });
    S.light(27.5, L0 + 1.5, -16.5, 0xff9040, 7, 0.8);
    S.glow(27.5, L0 + 1.2, -16.5, 0xff8a30, 1.0);
    S.prop("duffle_bag", 20, L0, -13, 0.3, { loot: "raider_stash" });
    for (let i = 0; i < 3; i++)
      X.mannequin(b, 25 + i * 1.3, L0, -8, PI + i * 0.3, {
        pose: i === 1 ? "headless" : "hip",
        dress: "awning",
        grime: 0.7,
      });
    const rg = P.texMat(
      "bl_rgraf",
      P.signTex("bl_rgraf", ["DRESS TO KILL"], "raider", 512, 128, {
        fg: "#c42a1e",
      }),
      { transparent: true },
    );
    b.quad(rg, HX1 - 0.22, L0 + 2.8, -12, 4, 1.0, { ry: -HP });
    // receiving / loading dock (north-west, beside the freight stair) x -24..-14, z -18..-10
    S.wallZ("plaster_ruin", -14, HZ0, -10, L0, L1, 0.25, [
      [-15.5, -12.5, 0, 3.2],
    ]);
    S.wallX("plaster_ruin", -10, -24, -14, L0, L1, 0.25, [[-20, -17, 0, 3.2]], {
      frame: "steel",
    });
    for (let i = 0; i < 6; i++)
      S.prop(
        "crate",
        -22.5 + (i % 3) * 1.4,
        L0 + (i > 2 ? 0.8 : 0),
        -11.2,
        i * 0.2,
        { kind: "plain" },
      );
    b.box("metal", -22, L0, -17.8, -16, L0 + 3.6, -17.72, { seg: false }); // rolling shutter (closed loading door)
    for (let y = 0.2; y < 3.6; y += 0.18)
      b.box("steel", -22, L0 + y, -17.72, -16, L0 + y + 0.05, -17.66, {
        seg: false,
      });
    S.prop("toolbox", -15, L0, -16.8, PI, { loot: "toolbox" });
    b.box("lamp_cool", -20, L1 - 0.1, -14.5, -18, L1 - 0.05, -14, {
      seg: false,
    });
    S.light(-19, L0 + 4, -14, 0xd8e8ff, 8, 0.55);
    S.anchor("receiving", -18, L0, -12, 0);
    // entry vestibule (revolving door inside) + anchors
    b.cyl("glass", 0, L0, HZ1 - 1.2, 1.2, 1.2, 2.8, 16, {
      open: true,
      noAO: true,
      noBake: true,
    });
    b.cyl("bronze", 0, L0 + 2.8, HZ1 - 1.2, 1.3, 1.3, 0.25, 16);
    S.col(-1.3, L0, HZ1 - 2.4, -1.2, L0 + 2.8, HZ1, { walkable: false });
    S.col(1.2, L0, HZ1 - 2.4, 1.3, L0 + 2.8, HZ1, { walkable: false });
    S.anchor("entrance", 0, L0, HZ1 - 3.6, 0);
    S.anchor("spawn1", 21, L0, -9.5, PI);
    S.anchor("spawn6", -22, L0, 0, HP);
    S.anchor("loot1", 20, L0, -13, 0);
    S.light(0, L0 + 3.6, 14, 0xffd8a0, 9, 0.6);
    D.papers(b, 6, L0, 10, 5, 24);
    D.papers(b, -10, L0, -2, 4, 16);
    D.shards(b, -20.5, L0, 9, 2, 20);

    // ------------------------------------------------------------------
    // 2 · FASHION (y 5)
    // ------------------------------------------------------------------
    for (const [x, z, lit] of [
      [-15, -3, false],
      [15, -3, true],
      [-15, 10, true],
      [15, 10, false],
    ])
      decoLamp(x, L2 - 1.3, z, lit);
    // emergency red lights
    for (const [x, z] of [
      [-28, 16],
      [28, -16],
      [28, 16],
    ]) {
      b.box(
        "lamp_red",
        x - 0.15,
        L2 - 0.6,
        z - 0.1,
        x + 0.15,
        L2 - 0.45,
        z + 0.1,
        { seg: false },
      );
      S.light(x, L2 - 1, z, 0xff4030, 8, 0.6);
      S.glow(x, L2 - 0.5, z, 0xff4030, 0.7);
    }
    // the mannequin army round the escalator well, facing the arrivals
    {
      const r = P.rng("army");
      for (let i = 0; i < 26; i++) {
        const a = r() * TAU,
          rr = 9.5 + r() * 5;
        const x = Math.cos(a) * rr,
          z = -0.5 + Math.sin(a) * rr * 0.75;
        if (Math.abs(x) < 9 && Math.abs(z) < 6) continue;
        const yaw = Math.atan2(x, z) + PI + (r() - 0.5) * 0.4;
        const pose = ["stand", "hip", "wave", "headless", "stand"][
          Math.floor(r() * 5)
        ];
        X.mannequin(b, x, L1, z, yaw, {
          pose: r() < 0.08 ? "fallen" : pose,
          dress: ["velvet", "fabric", "fabric_pink", "awning", "clothes", null][
            Math.floor(r() * 6)
          ],
          skirt: r() < 0.5,
          wig: r() < 0.3 ? "hide_dark" : null,
          key: r() < 0.15 ? "mannequin_dark" : "mannequin",
          hat: r() < 0.1 ? "awning" : null,
        });
        if (r() < 0.2)
          b.box(
            "blood",
            x - 0.2,
            L1 + 0.012,
            z - 0.2,
            x + 0.3,
            L1 + 0.02,
            z + 0.3,
            { seg: false, noAO: true },
          );
      }
    }
    // racks
    for (let i = 0; i < 6; i++)
      X.rack(
        b,
        12 + (i % 3) * 5,
        L1,
        9 + Math.floor(i / 3) * 4,
        (i % 2) * 0.3,
        { len: 1.8, fallen: i === 4 },
      );
    for (let i = 0; i < 4; i++)
      X.rack(b, -12 - (i % 2) * 5, L1, -12 + Math.floor(i / 2) * 3.5, HP, {
        len: 1.6,
      });
    const fs = P.texMat(
      "bl_fashion",
      P.signTex("bl_fashion", ["FASHION · SALON DE MODE"], "gilt", 1024, 96, {
        font: P.FONTS.DECO,
      }),
      { rough: 0.5 },
    );
    b.quad(fs, 0, L1 + 3.8, -HZ1 + 0.22, 6, 0.55, {});
    // fitting rooms (west wall): curtained booths
    for (let i = 0; i < 6; i++) {
      const z = -4 + i * 2.2;
      b.box("wood_oak", -29.8, L1, z - 1.05, -26.6, L1 + 2.6, z - 0.95, {
        seg: false,
      });
      S.col(-29.8, L1, z - 1.05, -26.6, L1 + 2.6, z - 0.95, {
        walkable: false,
      });
      b.rod(
        "brass",
        [-26.6, L1 + 2.4, z - 1.0],
        [-26.6, L1 + 2.4, z + 1.0],
        0.015,
        4,
      );
      if (i % 3 !== 1)
        b.box(
          "velvet",
          -26.65,
          L1 + 0.1,
          z - 0.95,
          -26.55,
          L1 + 2.4,
          z - (i % 2 ? 0.2 : -0.4),
          { seg: false },
        );
      b.box("glass", -29.75, L1 + 0.4, z - 0.4, -29.7, L1 + 2.2, z + 0.4, {
        seg: false,
        noAO: true,
      });
    }
    b.box("wood_oak", -29.8, L1, 9.15, -26.6, L1 + 2.6, 9.25, { seg: false });
    S.prop("skeleton", -28.4, L1, 3.9, HP, { pose: "curled" });
    S.pickup("uw_note_fitting", 1, -28, L1 + 0.02, 3.2);
    // bridal salon (north-west) — the bride who never left
    {
      b.box("carpet", -26, L1 + 0.005, -17, -14.5, L1 + 0.02, -12.5, {
        seg: false,
        noAO: true,
      });
      b.box("marble", -21.5, L1, -16.6, -19.5, L1 + 0.4, -15.4, { seg: false }); // dais
      X.mannequin(b, -20.5, L1 + 0.4, -16, 0, {
        pose: "stand",
        dress: "fabric_white",
        skirt: true,
        wig: "hide_dark",
      });
      b.cyl("fabric_white", -20.5, L1 + 0.4, -16, 0.2, 0.7, 1.1, 12, {
        open: true,
        noAO: true,
      });
      S.prop("skeleton", -18.2, L1, -14.5, 0.8, { pose: "sitting" });
      b.cyl("fabric_white", -18.2, L1, -14.5, 0.3, 0.55, 0.6, 10, {
        open: true,
        noAO: true,
      });
      for (let i = 0; i < 3; i++)
        b.box(
          "glass",
          -25.9,
          L1 + 0.3,
          -16 + i * 1.3,
          -25.85,
          L1 + 2.4,
          -15 + i * 1.3,
          { seg: false, noAO: true },
        );
      D.chair(b, -23, L1, -13.2, 0.4, { seat: "fabric_pink" });
      D.chair(b, -16.5, L1, -13.2, -0.4, { seat: "fabric_pink" });
      const bs = P.texMat(
        "bl_bridal",
        P.signTex("bl_bridal", ["The Bridal Salon"], "gilt", 512, 96, {
          font: P.FONTS.SERIF,
        }),
        {},
      );
      b.quad(bs, -20.5, L1 + 3.4, -17.8, 3, 0.55, {});
      S.pickup("uw_reel_bride", 1, -19.6, L1 + 0.42, -15.6);
      S.light(-20.5, L1 + 3.3, -15, 0xfff0e0, 7, 0.7);
      S.glow(-20.5, L1 + 3.6, -15, 0xfff0e0, 0.6);
    }
    // shoe salon (east): shoebox walls, benches, mirrors
    {
      b.box("shoebox", HX1 - 0.25, L1 + 0.2, -16, HX1 - 0.2, L1 + 3.6, 6, {
        seg: false,
        uv: "box",
      });
      for (let i = 0; i < 3; i++) {
        const z = -12 + i * 5;
        b.box("velvet", 22, L1, z - 1.4, 23, L1 + 0.45, z + 1.4, {
          seg: false,
        });
        S.col(22, L1, z - 1.4, 23, L1 + 0.45, z + 1.4);
        b.box("glass", 25, L1, z - 0.4, 25.05, L1 + 0.5, z + 0.4, {
          seg: false,
          rx: -0.3,
        });
      }
      for (let i = 0; i < 12; i++) {
        const r = P.rng(i * 11);
        b.box(
          "shoebox",
          23.5 + r() * 5,
          L1,
          -15 + r() * 18,
          23.9 + r() * 5,
          L1 + 0.14,
          -14.75 + r() * 18,
          { seg: false, ry: r() * 3, uv: "box" },
        );
      }
      const ss = P.texMat(
        "bl_shoes",
        P.signTex("bl_shoes", ["SHOES"], "gilt", 256, 64, {
          font: P.FONTS.DECO,
        }),
        {},
      );
      b.quad(ss, HX1 - 0.3, L1 + 3.9, -5, 1.6, 0.4, { ry: -HP });
    }
    S.prop("locker", 29.5, L1, 12, -HP, { loot: "locker" });
    S.anchor("spawn2", -24, L1, 0, HP);
    S.anchor("spawn3", 24, L1, -4, -HP);
    S.anchor("fashion", 0, L1, -8, PI);
    // freight stair door on L2
    // ------------------------------------------------------------------
    // 3 · HOME (y 10)
    // ------------------------------------------------------------------
    for (const [x, z, lit] of [
      [-15, 10, true],
      [15, 10, true],
      [0, 12, false],
    ])
      decoLamp(x, CH - 1.3, z, lit);
    const hs = P.texMat(
      "bl_home",
      P.signTex("bl_home", ["THE ATOMIC HOME · 1967"], "gilt", 1024, 96, {
        font: P.FONTS.DECO,
      }),
      { rough: 0.5 },
    );
    b.quad(hs, 0, L2 + 3.8, HZ1 - 0.22, 6, 0.55, { ry: PI });
    // model rooms along the south wall: living room, bedroom, kitchen — partition flats with open fronts
    const model = (x0, x1, label, fill) => {
      S.wallZ("wallpaper", x0, 9, HZ1, L2, L2 + 3.2, 0.2, []);
      S.wallZ("wallpaper", x1, 9, HZ1, L2, L2 + 3.2, 0.2, []);
      b.box("parquet", x0, L2 + 0.005, 9, x1, L2 + 0.03, HZ1, {
        seg: false,
        noAO: true,
      });
      const t = P.texMat(
        "bl_mr_" + label,
        P.signTex("bl_mr_" + label, [label], "brass", 512, 64),
        {},
      );
      b.quad(t, (x0 + x1) / 2, L2 + 2.9, 9.05, 3, 0.35, {});
      fill((x0 + x1) / 2);
    };
    model(-28, -18, "THE LIVING ROOM", (cx) => {
      D.sofa(b, cx, L2, 16.5, PI, { fabric: "fabric_pink", w: 2.4 });
      D.chair(b, cx - 3, L2, 13.5, HP * 0.7, { arms: true, seat: "fabric" });
      D.table(b, cx, L2, 14, { r: 0.55, top: "wood", leg: "chrome" });
      b.box("wood", cx - 1.6, L2, 11, cx + 1.6, L2 + 1.0, 11.6, { seg: false });
      b.box("glass_dark", cx - 0.5, L2 + 1.0, 11.2, cx + 0.5, L2 + 1.8, 11.5, {
        seg: false,
      }); // TV console
      b.quad(
        P.texMat(
          "bl_lonly",
          P.signTex(
            "bl_lonly",
            ["LONLY 23-INCH CONSOLE", "The best company in the house."],
            "brass",
            512,
            128,
          ),
          {},
        ),
        cx + 0.9,
        L2 + 0.72,
        11.62,
        0.9,
        0.225,
        {},
      );
      for (const s of [-1, 1])
        b.rod(
          "chrome",
          [cx + s * 0.3, L2 + 1.8, 11.35],
          [cx + s * 0.6, L2 + 2.4, 11.35],
          0.01,
          3,
        );
      X.mannequin(b, cx + 1.8, L2, 14.5, PI + 0.8, {
        pose: "sit" === "x" ? "stand" : "hip",
        dress: "fabric_pink",
        skirt: true,
        wig: "hide_dark",
      });
    });
    model(-18, -8, "THE MASTER BEDROOM", (cx) => {
      D.bed(b, cx, L2, 15.8, PI, { w: 1.8, cover: "velvet" });
      S.prop("file_cabinet", cx - 3.8, L2, 16.8, PI, {
        loot: "dresser",
        name: "Display Dresser",
      });
      X.mannequin(b, cx + 3, L2, 13, -0.5, {
        pose: "fallen",
        dress: "fabric_white",
      });
    });
    model(8, 18, "THE KITCHEN OF TOMORROW", (cx) => {
      b.box("paint_white", cx - 4.5, L2, 17.1, cx + 4.5, L2 + 0.95, 17.8, {
        seg: false,
      });
      b.box("chrome", cx - 4.5, L2 + 0.95, 17.05, cx + 4.5, L2 + 1.0, 17.85, {
        seg: false,
      });
      S.prop("fridge", cx - 3.8, L2, 16.9, PI, { loot: "fridge" });
      D.table(b, cx, L2, 13.5, { r: 0.6, top: "paint_red", leg: "chrome" });
      for (let k = 0; k < 3; k++)
        D.chair(
          b,
          cx + Math.cos(k * 2.1) * 1.0,
          L2,
          13.5 + Math.sin(k * 2.1) * 1.0,
          -k * 2.1 - HP,
          { wood: "chrome", seat: "paint_red" },
        );
      // a "Valet" display mannequin (robot shell)
      b.sphere("chrome", cx + 3, L2 + 1.3, 13, 0.45, { ws: 12, hs: 8 });
      for (let k = 0; k < 3; k++) {
        const a = k * 2.1;
        b.rod(
          "chrome",
          [cx + 3, L2 + 1.4, 13],
          [cx + 3 + Math.cos(a) * 0.6, L2 + 1.9, 13 + Math.sin(a) * 0.6],
          0.02,
          3,
        );
        b.sphere(
          "glass_dark",
          cx + 3 + Math.cos(a) * 0.6,
          L2 + 1.95,
          13 + Math.sin(a) * 0.6,
          0.07,
          { ws: 6, hs: 4 },
        );
      }
      b.cyl("fire", cx + 3, L2 + 0.4, 13, 0.02, 0.12, 0.3, 6);
    });
    // the Penthouse Suite (south-east): the Window Dresser's throne
    {
      b.box("carpet_red", 19, L2 + 0.005, 8.5, 29.5, L2 + 0.03, 17.5, {
        seg: false,
        noAO: true,
      });
      b.box("marble", 23, L2, 15, 27, L2 + 0.5, 17.5, { seg: false });
      S.col(23, L2, 15, 27, L2 + 0.5, 17.5, { surface: "concrete" });
      D.sofa(b, 25, L2 + 0.5, 16.8, PI, { fabric: "velvet", w: 2.2 });
      // throne back: a fan of mannequin arms and legs
      for (let k = 0; k < 11; k++) {
        const a = -1.2 + k * 0.24;
        b.rod(
          k % 2 ? "mannequin" : "mannequin_dark",
          [25, L2 + 1.1, 17.3],
          [25 + Math.sin(a) * 1.6, L2 + 1.1 + Math.cos(a) * 1.9, 17.4],
          0.05,
          5,
        );
      }
      for (let k = 0; k < 5; k++)
        b.sphere(
          "mannequin",
          25 + (k - 2) * 0.55,
          L2 + 3.1 + Math.abs(k - 2) * -0.25,
          17.45,
          0.12,
          { sy: 1.2, ws: 8, hs: 6 },
        );
      S.pickup("uw_mannequin_mask", 1, 24.2, L2 + 0.95, 16.7);
      S.prop("scrip_stash", 26.4, L2 + 0.5, 15.5, 0, { loot: "scrip_stash" });
      S.prop("ammo_box", 20, L2, 16.8, 0, { loot: "ammo_box" });
      for (let k = 0; k < 4; k++)
        S.prop("lamp", 20 + k * 2.8, L2, 9.2, 0, { kind: "string" });
      S.light(25, L2 + 3, 13, 0xffb070, 11, 0.9);
      S.glow(25, L2 + 3.2, 13, 0xffb070, 1.2);
      const ps = P.texMat(
        "bl_suite",
        P.signTex("bl_suite", ["THE PENTHOUSE SUITE"], "brass", 512, 64),
        {},
      );
      b.quad(ps, 24, L2 + 2.9, 8.3, 3, 0.35, {});
      S.anchor("boss", 25, L2 + 0.5, 15.6, PI);
      S.anchor("throne", 25, L2 + 0.5, 16.2, PI);
    }
    // raider quarters (west half)
    for (let i = 0; i < 5; i++)
      S.prop(
        "mattress",
        -26 + (i % 3) * 2.6,
        L2,
        -3 + Math.floor(i / 3) * 3.2,
        i * 0.5,
        {},
      );
    S.prop("campfire", -19, L2, 1, 0, { pot: true });
    S.light(-19, L2 + 1.2, 1, 0xff9040, 9, 0.95);
    S.glow(-19, L2 + 0.7, 1, 0xff8a30, 1.1);
    S.prop("footlocker", -28.8, L2, 3.5, HP, { loot: "raider_stash" });
    S.prop("skeleton", -14, L2, -3, 0.3, { pose: "lying" });
    b.box("blood", -15, L2 + 0.012, -4, -12.8, L2 + 0.02, -2, {
      seg: false,
      noAO: true,
    });
    S.anchor("spawn4", -22, L2, 4, 0);
    // manager's office (north-east) x 18..30, z -18..-8
    S.wallX("wood_oak", -8, 18, HX1, L2, CH, 0.25, [[20, 22, 0, 2.8]], {
      frame: "wood_dark",
    });
    S.wallZ("wood_oak", 18, HZ0, -8, L2, CH, 0.25, []);
    S.prop("desk", 25, L2, -15.8, 0, {
      loot: "desk",
      name: "Store Manager's Desk",
    });
    S.prop("terminal", 24.4, L2 + 0.78, -16, 0, {
      terminalId: "uw_bl_manager",
      mount: "bare",
    });
    S.prop("safe", 29.5, L2 + 1.1, -12.5, -HP, {
      wall: true,
      locked: 0,
      lock: P.LOCKS.bl_safe,
      name: "Manager's Safe",
      loot: "wall_safe",
      items: [
        ["scrip", 150],
        ["old_dollars", 4],
      ],
    });
    S.prop("file_cabinet", 19, L2, -17.2, 0, { loot: "file_cabinet" });
    D.chair(b, 25, L2, -16.8, 0, { seat: "leather" });
    b.box("glass", 18.1, L2 + 1.0, -16, 18.15, L2 + 2.6, -10, {
      seg: false,
      noAO: true,
    }); // window to the sales floor
    b.box("lamp_warm", 23.5, CH - 0.12, -13.5, 26.5, CH - 0.07, -13, {
      seg: false,
    });
    S.light(25, L2 + 3.6, -13, 0xffe0b0, 8, 0.7);
    S.pickup("uw_note_memo", 1, 25.6, L2 + 0.8, -15.6);
    S.anchor("office", 23, L2, -11, 0);
    S.anchor("loot2", 25, L2, -14.5, 0);
    // stockroom (north strip x -24..18, z -18..-11): shelving, crates, the cage
    S.wallX(
      "plaster_ruin",
      -11,
      -24,
      18,
      L2,
      CH,
      0.25,
      [
        [-6, -3, 0, 3.0],
        [10, 13, 0, 3.0],
      ],
      { frame: "steel" },
    );
    const st = P.texMat(
      "bl_stock",
      P.signTex("bl_stock", ["STOCKROOM — EMPLOYEES ONLY"], "plain", 512, 64, {
        bg: "#b8a878",
        fg: "#2a2010",
      }),
      {},
    );
    b.quad(st, -4.5, L2 + 3.3, -10.86, 2.6, 0.32, { ry: PI });
    for (let i = 0; i < 5; i++) {
      const x = -21 + i * 4;
      if (i === 3) continue;
      for (const z of [-17.2, -13.5]) {
        for (let lv = 0; lv < 4; lv++)
          b.box(
            "steel",
            x - 1.5,
            L2 + 0.1 + lv * 0.8,
            z - 0.5,
            x + 1.5,
            L2 + 0.14 + lv * 0.8,
            z + 0.5,
            { seg: false },
          );
        for (const s of [-1, 1])
          for (const t of [-1, 1])
            b.box(
              "steel",
              x + s * 1.48 - 0.03,
              L2,
              z + t * 0.48 - 0.03,
              x + s * 1.48 + 0.03,
              L2 + 3.0,
              z + t * 0.48 + 0.03,
              { seg: false },
            );
        const r = P.rng(x * 3 + z);
        for (let lv = 0; lv < 4; lv++)
          for (let k = 0; k < 3; k++)
            if (r() < 0.7)
              b.box(
                r() < 0.5 ? "crate" : "shoebox",
                x - 1.3 + k * 0.9,
                L2 + 0.14 + lv * 0.8,
                z - 0.35,
                x - 0.6 + k * 0.9,
                L2 + 0.5 + lv * 0.8 + r() * 0.2,
                z + 0.35,
                { seg: false, uv: "box" },
              );
        S.col(x - 1.5, L2, z - 0.5, x + 1.5, L2 + 3.1, z + 0.5, {
          walkable: false,
        });
      }
    }
    S.prop("crate", 10, L2, -16, 0.2, { kind: "army", loot: "crate" });
    S.prop("ammo_box", 14, L2, -17, 0, { loot: "ammo_box" });
    b.box("lamp_cool", -2, CH - 0.12, -15, 2, CH - 0.07, -14.6, { seg: false });
    S.light(0, L2 + 3.5, -14.5, 0xd8e8ff, 10, 0.55);
    S.light(-15, L2 + 3.5, -14.5, 0xd8e8ff, 8, 0.4);
    // the cage (x -9..-5, z -17.6..-13.4): a door group we can swing open
    {
      const cx0 = -9.2,
        cx1 = -4.8,
        cz0 = -17.7,
        cz1 = -13.2;
      for (let x = cx0; x <= cx1 + 0.01; x += 0.25) {
        b.rod("iron", [x, L2, cz1], [x, L2 + 2.6, cz1], 0.018, 4);
        b.rod("iron", [x, L2, cz0], [x, L2 + 2.6, cz0], 0.018, 4);
      }
      for (let z = cz0; z <= cz1 + 0.01; z += 0.25) {
        if (z > -16.2 && z < -14.6) continue;
        b.rod("iron", [cx0, L2, z], [cx0, L2 + 2.6, z], 0.018, 4);
        b.rod("iron", [cx1, L2, z], [cx1, L2 + 2.6, z], 0.018, 4);
      }
      for (const y of [0.05, 1.3, 2.6]) {
        b.box("iron", cx0, L2 + y - 0.03, cz0, cx1, L2 + y + 0.03, cz0 + 0.05, {
          seg: false,
        });
        b.box("iron", cx0, L2 + y - 0.03, cz1 - 0.05, cx1, L2 + y + 0.03, cz1, {
          seg: false,
        });
        b.box("iron", cx0, L2 + y - 0.03, cz0, cx0 + 0.05, L2 + y + 0.03, cz1, {
          seg: false,
        });
        b.box("iron", cx1 - 0.05, L2 + y - 0.03, cz0, cx1, L2 + y + 0.03, cz1, {
          seg: false,
        });
      }
      b.box("iron", cx0, L2 + 2.6, cz0, cx1, L2 + 2.65, cz1, { seg: false });
      S.col(cx0 - 0.05, L2, cz0 - 0.05, cx1 + 0.05, L2 + 2.7, cz0 + 0.05, {
        walkable: false,
      });
      S.col(cx0 - 0.05, L2, cz1 - 0.05, cx1 + 0.05, L2 + 2.7, cz1 + 0.05, {
        walkable: false,
      });
      S.col(cx0 - 0.05, L2, cz0, cx0 + 0.05, L2 + 2.7, cz1, {
        walkable: false,
      });
      S.col(cx1 - 0.05, L2, cz0, cx1 + 0.05, L2 + 2.7, -16.2, {
        walkable: false,
      });
      S.col(cx1 - 0.05, L2, -14.6, cx1 + 0.05, L2 + 2.7, cz1, {
        walkable: false,
      });
      S.prop("mattress", -7.4, L2, -16.4, 0.1, {});
      b.cyl("steel", -8.6, L2, -14, 0.15, 0.13, 0.3, 8);
      S.anchor("cage", -7.2, L2, -15.4, -HP);
      S.anchor("cage_door", cx1 + 0.4, L2, -15.4, -HP);
      // the door leaf as its own little group so it can swing open
      const door = new THREE.Group();
      door.name = "uw_bl_cage_door";
      const mat = P.mat("iron");
      const bars = [];
      for (let z = 0; z <= 1.6; z += 0.2)
        bars.push(new THREE.BoxGeometry(0.04, 2.5, 0.04).translate(0, 1.3, z));
      for (const y of [0.1, 1.3, 2.5])
        bars.push(new THREE.BoxGeometry(0.05, 0.06, 1.65).translate(0, y, 0.8));
      const g = P.mergeAll(
        bars.map((q) => (q.toNonIndexed ? q.toNonIndexed() : q)),
      );
      const col = new Float32Array(g.attributes.position.count * 3).fill(0.6);
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mesh = new THREE.Mesh(g, mat);
      door.add(mesh);
      const lock = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.2, 0.1),
        P.mat("brass"),
      );
      lock.position.set(0.05, 1.2, 1.5);
      door.add(lock);
      const hinge = S.W(cx1, L2, -16.2);
      door.position.copy(hinge);
      S.cage = {
        group: door,
        hinge,
        colBox: [
          cx1 - 0.05 + S.ox,
          L2 + S.oy,
          -16.2 + S.oz,
          cx1 + 0.05 + S.ox,
          L2 + 2.7 + S.oy,
          -14.6 + S.oz,
        ],
      };
    }
    S.anchor("spawn5", 4, L2, -14, 0);
    S.anchor("stockroom", 0, L2, -13, 0);
    // ------------------------------------------------------------------
    // FREIGHT STAIR (x -30..-24, z -18..-6.8): L3 → L2 → Main (loop back)
    // ------------------------------------------------------------------
    {
      // interior walls of the enclosure (east side), with doors at each level
      S.wallZ(
        "concrete",
        FX1,
        FZ0,
        FZ1,
        L0,
        CH,
        0.3,
        [
          [-17.6, -15.4, 0, 3.0],
          [-9, -7.1, 5, 7.8],
          [-17.6, -15.4, 10, 12.8],
        ],
        { frame: "steel" },
      );
      S.wallX("concrete", FZ1, FX0, FX1, L0, CH, 0.3, []);
      // the enclosure cuts the L2/L3 floors: floor pieces inside are only the landings
      // flight B (Main → L2): x -26.4..-24.4 climbing south z -15 → -9
      S.stairs("concrete", -25.4, -15, "s", 2.0, L0, L1, {
        run: 0.3,
        nosing: "steel",
        rail: "iron",
        railSides: [-1],
      });
      // flight A (L2 → L3): x -29.6..-27.6 climbing north z -9 → -15
      S.stairs("concrete", -28.6, -9, "n", 2.0, L1, L2, {
        run: 0.3,
        nosing: "steel",
        rail: "iron",
        railSides: [1],
      });
      S.floor("concrete", FX0, -9, FX1, FZ1, L1, { t: 0.3 }); // L2 landing
      S.floor("concrete", FX0, FZ0, FX1, -15, L2, { t: 0.3 }); // L3 landing
      S.rail(
        "iron",
        [
          [-27.5, -15],
          [-24.2, -15],
        ],
        L2,
        1.0,
        { r: 0.03 },
      );
      b.box("lamp_red", -29.8, L1 + 3, -12, -29.7, L1 + 3.15, -11.7, {
        seg: false,
      });
      S.light(-28.5, L1 + 3, -12, 0xff5a40, 8, 0.6);
      S.glow(-29.7, L1 + 3.07, -11.85, 0xff5a40, 0.4);
      S.light(-27, L0 + 3, -16.5, 0xd8e0e8, 6, 0.4);
      S.light(-27, L2 + 3, -16.5, 0xd8e0e8, 6, 0.4);
      const fsg = P.texMat(
        "bl_freight",
        P.signTex("bl_freight", ["FREIGHT STAIR"], "plain", 256, 64, {
          bg: "#b8a878",
          fg: "#2a2010",
        }),
        {},
      );
      for (const y of [L0, L2])
        b.quad(fsg, FX1 + 0.17, y + 3.3, -16.5, 1.2, 0.3, { ry: HP });
      b.quad(fsg, FX1 + 0.17, L1 + 3.3 + 2.6, -8, 1.2, 0.3, { ry: HP });
      S.anchor("freight_top", -26.5, L2, -16.5, -HP);
    }
    S.build({ interior: true });
    if (S.cage) S.root.add(S.cage.group);
    P.addInterior("bellamys", S.root);
    P.bloomCage = S.cage;
    return S;
  }

