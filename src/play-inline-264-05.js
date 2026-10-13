// play-inline-264 05 — box
// Lines 1834-2179 of readable/play-inline-264.pretty.js (statement-aligned).
  function buildBasement(S) {
    const b = S.b,
      BY = -5.0,
      BH = 3.4,
      BT = BY + BH;
    b.ground = BY;
    // landing at the foot of the service stair
    S.floor("concrete", -26, 36.5, -22, 39, BY);
    S.ceil("concrete", -26, 36.5, -22, 39, BY + 3.4, {});
    // ---- bowling alley (x -28..8, z 39..49) ----
    S.floor("parquet", -28, 39, 8, 49, BY, { surface: "wood" });
    S.ceil("plaster", -28, 39, 8, 49, BT, { col: true });
    S.wallX("wood_oak", 39, -28.2, 8.2, BY, BT, 0.4, [[-25.6, -22.4, 0, 3.0]]);
    S.wallX("wood_oak", 49, -28.2, 8.2, BY, BT, 0.4, []);
    S.wallZ("wood_oak", -28, 39, 49, BY, BT, 0.4, []);
    S.wallZ("concrete_dark", 8, 39, 49, BY, BT, 0.4, [[41, 45, 0, 2.8]]);
    // two lanes running east, gutters, foul lines, pin decks, ball return
    for (const lz of [42.2, 45.8]) {
      b.box("wood", -23.5, BY, lz - 0.55, 6.5, BY + 0.06, lz + 0.55, {
        segLen: 2,
        grime: 0.3,
        c: 0xf0dcb0,
      });
      for (const s of [-1, 1])
        b.box(
          "metal",
          -23.5,
          BY - 0.02,
          lz + s * 0.55 + (s < 0 ? -0.24 : 0),
          6.5,
          BY + 0.02,
          lz + s * 0.55 + (s < 0 ? 0 : 0.24),
          { seg: false, noAO: true },
        );
      b.box(
        "paint_black",
        -23.5,
        BY + 0.061,
        lz - 0.55,
        -23.4,
        BY + 0.063,
        lz + 0.55,
        { seg: false, noAO: true },
      );
      for (let k = 0; k < 7; k++)
        b.box(
          "paint_black",
          -19.5 - 0.05,
          BY + 0.061,
          lz - 0.3 + k * 0.1 - 0.03,
          -19.5 + 0.05,
          BY + 0.063,
          lz - 0.3 + k * 0.1 + 0.03,
          { seg: false, noAO: true, ry: 0.785 },
        );
      // ten pins in a triangle (a few knocked over)
      const rn = P.rng("pins" + lz);
      for (let row = 0; row < 4; row++)
        for (let k = 0; k <= row; k++) {
          const px = 4.4 + row * 0.26,
            pz = lz + (k - row / 2) * 0.3;
          if (rn() < 0.3)
            b.lathe(
              "paint_white",
              [
                [0.001, 0],
                [0.05, 0],
                [0.06, 0.1],
                [0.03, 0.22],
                [0.04, 0.3],
                [0.001, 0.36],
              ],
              8,
              px + rn() * 0.4,
              BY + 0.1,
              pz + (rn() - 0.5) * 0.6,
              { rz: HP, noAO: true },
            );
          else
            b.lathe(
              "paint_white",
              [
                [0.001, 0],
                [0.05, 0],
                [0.06, 0.1],
                [0.03, 0.22],
                [0.04, 0.3],
                [0.001, 0.36],
              ],
              8,
              px,
              BY + 0.06,
              pz,
              { noAO: true },
            );
        }
      b.box("paint_black", 6.5, BY, lz - 0.8, 7.8, BY + 1.6, lz + 0.8, {
        seg: false,
      });
    }
    b.box("wood_dark", -23.5, BY, 43.4, 6.5, BY + 0.35, 44.6, { seg: false }); // ball return rail
    S.col(-23.5, BY, 43.4, 6.5, BY + 0.35, 44.6, { walkable: false });
    for (let i = 0; i < 4; i++)
      b.sphere(
        ["paint_black", "paint_red", "paint_blue", "paint_black"][i],
        -22.8 + i * 0.3,
        BY + 0.47,
        44,
        0.11,
        { ws: 8, hs: 6, noAO: true },
      );
    // scorer's table, benches, the house rules
    b.box("wood_dark", -26.8, BY, 42, -25.2, BY + 0.8, 46, { seg: false });
    S.col(-26.8, BY, 42, -25.2, BY + 0.8, 46, { walkable: false });
    for (const z of [40.3, 47.7]) {
      b.box("wood_dark", -27.5, BY, z - 0.4, -24.5, BY + 0.45, z + 0.4, {
        seg: false,
      });
      S.col(-27.5, BY, z - 0.4, -24.5, BY + 0.45, z + 0.4);
    }
    D.sign(
      b,
      "frick_bowl",
      ["THE FRICK ALLEYS · 1914", "GENTLEMEN WILL NOT LOFT THE BALL"],
      "gilt",
      -27.78,
      BY + 2.3,
      44,
      2.4,
      0.55,
      HP,
      { tw: 1024, th: 232 },
    );
    D.sign(
      b,
      "frick_score",
      [
        "FRAME 10",
        "H.C.F.  287",
        "AMBROSE  300",
        "AMBROSE  300",
        "AMBROSE  300",
      ],
      "label",
      -26.0,
      BY + 1.35,
      42.02,
      1.4,
      1.1,
      0,
      { tw: 400, th: 320 },
    );
    S.prop("skeleton", -22.6, BY, 45.8, -HP, { pose: "reaching" });
    for (let x = -20; x <= 4; x += 6)
      for (const lz of [42.2, 45.8]) {
        const dead = (x + lz) % 3 === 0;
        b.rod("iron", [x, BT, lz], [x, BT - 0.5, lz], 0.01, 3, { noAO: true });
        b.cyl(
          dead ? "glass_dark" : "lamp_dim",
          x,
          BT - 0.7,
          lz,
          0.1,
          0.25,
          0.2,
          8,
          { open: true, noAO: true },
        );
        if (!dead) {
          S.light(x, BT - 0.9, lz, 0xffd8a0, 6, 0.7);
          S.glow(x, BT - 0.8, lz, 0xffd090, 0.45);
        }
      }
    S.anchor("bowling", -24, BY, 44, -HP);
    // ---- flooded storage (x 8..28, z 31..52) ----
    S.floor("concrete_dark", 8, 31, 28, 52, BY, { surface: "water" });
    S.ceil("concrete", 8, 31, 28, 52, BY + 3.8, { col: true });
    S.wallX("concrete_dark", 31, 7.8, 28.2, BY, BY + 3.8, 0.4, [
      [16.3, 18.7, 0, 3.0],
    ]);
    S.wallX("concrete_dark", 52, 7.8, 28.2, BY, BY + 3.8, 0.4, []);
    S.wallZ("concrete_dark", 28, 31, 52, BY, BY + 3.8, 0.4, []);
    b.box("water_rad", 8.2, BY + 0.16, 31.2, 27.8, BY + 0.2, 51.8, {
      segLen: 20,
      noAO: true,
      noBake: true,
    });
    // painting storage racks (sliding screens hung with canvases)
    for (let i = 0; i < 4; i++) {
      const z = 35 + i * 3.2;
      b.box("metal", 10, BY, z - 0.05, 20, BY + 3.0, z + 0.05, {
        segLen: 2,
        grime: 0.7,
      });
      b.box("rust", 10, BY + 3.0, z - 0.1, 20, BY + 3.1, z + 0.1, {
        seg: false,
      });
      S.col(10, BY, z - 0.1, 20, BY + 3.0, z + 0.1, { walkable: false });
      for (let k = 0; k < 3; k++) {
        D.master(
          b,
          11.6 + k * 3.2,
          BY + 1.6,
          z + 0.06,
          1.8,
          1.4,
          0,
          (i * 3 + k * 5) % 16,
          { ft: 0.07 },
        );
        D.master(
          b,
          11.6 + k * 3.2,
          BY + 1.6,
          z - 0.06,
          1.6,
          1.3,
          PI,
          (i * 7 + k * 3 + 2) % 16,
          { ft: 0.07 },
        );
      }
    }
    // shipping crates + the conservator's corner
    for (const [x, z, w, d, h] of [
      [23, 34, 2, 1.4, 1.2],
      [25.6, 34, 1.6, 1.4, 0.9],
      [23.5, 38, 1.8, 1.8, 1.6],
      [21.5, 46, 2.4, 1.2, 1.0],
      [25.5, 44, 1.6, 1.6, 1.4],
    ]) {
      b.box("crate", x - w / 2, BY, z - d / 2, x + w / 2, BY + h, z + d / 2, {
        seg: false,
        grime: 0.8,
      });
      S.col(x - w / 2, BY, z - d / 2, x + w / 2, BY + h, z + d / 2);
    }
    // the Vermeer's crate on a pallet at the back, stencilled
    b.box("wood", 23.6, BY, 48.6, 26.4, BY + 0.3, 50.8, { seg: false });
    b.box("crate", 24, BY + 0.3, 49, 26, BY + 0.95, 50.4, { seg: false });
    S.col(23.6, BY, 48.6, 26.4, BY + 0.95, 50.8);
    D.sign(
      b,
      "frick_crate",
      ["FRAGILE · THIS SIDE UP", "F.C. 1911.1.126 — DELFT"],
      "label",
      25,
      BY + 0.62,
      50.42,
      1.6,
      0.4,
      0,
      { tw: 512, th: 128 },
    );
    S.anchor("vermeer", 25, BY + 0.95, 49.7, PI);
    S.prop("skeleton", 21, BY, 50.5, 0.5, { pose: "curled" });
    S.anchor("conservator", 21, BY, 50.5, 0);
    for (const [x, z] of [
      [12, 49],
      [13.2, 50],
      [26.5, 40.5],
    ])
      S.prop("barrel", x, BY, z, 0, { radioactive: true });
    S.glow(12.5, BY + 0.4, 49.5, 0x50ff70, 1.6);
    S.light(12.5, BY + 0.6, 49.5, 0x50ff70, 7, 0.8);
    for (let x = 12; x <= 24; x += 6) {
      S.light(x, BY + 3.3, 41, 0xe8f0d0, 7, 0.45);
      b.box("lamp_dim", x - 0.6, BY + 3.68, 40.9, x + 0.6, BY + 3.72, 41.1, {
        seg: false,
      });
    }
    S.glow(18, BY + 3.5, 41, 0xe8f0d0, 0.6);
    S.anchor("storage", 18, BY, 41, 0);
    // ---- service stair up to the Library ----
    S.stairs("concrete", 17.5, 30.6, "n", 2.4, BY, 0, { run: 0.3 });
    S.floor("concrete", 16.3, 23.9, 18.7, 24.35, 0);
    S.wallZ("concrete_dark", 16.1, 24.2, 31.2, BY, 3.2, 0.4, []);
    S.wallZ("concrete_dark", 18.9, 24.2, 31.2, BY, 3.2, 0.4, []);
    S.ceil("concrete", 16, 24.2, 19, 31.2, 3.2, {});
    S.light(17.5, 1.5, 27, 0xffd8a0, 6, 0.5);
    // spawn anchors (combat)  and loot anchors
    S.anchor("spawn1", -24, 0, -16, 0);
    S.anchor("spawn2", -24, 0, 12, PI);
    S.anchor("spawn3", -14, 0, -32, 0);
    S.anchor("spawn4", 20, 0, -22, PI);
    S.anchor("spawn5", -8, BY, 44, -HP);
    S.anchor("spawn6", 18, BY, 43, 0);
    S.anchor("loot1", -26, BY, 47.7, 0);
    S.anchor("loot2", 22.6, 6.8, 9, 0);
    S.anchor("loot3", 14.8, 0, -26.6, 0);
    b.ground = 0;
    return S;
  }
  // ===================================================================
  // Interactive dressing: terminals, containers, notes (spawned at initDone)
  // ===================================================================
  function dressInterior(S) {
    const BY = -5.0,
      UY = 6.8;
    S.prop("terminal", 20, 0.78, 16.55, PI, {
      terminalId: "ues_frick_catalog",
      mount: "bare",
    });
    S.prop("terminal", 23.1, UY + 0.8, 13, HP, {
      terminalId: "ues_frick_security",
      mount: "bare",
    });
    S.prop("file_cabinet", 14.6, UY, 22.8, -HP, {
      loot: "file_cabinet",
      name: "Security Files",
    });
    S.prop("locker", 14.5, UY, 8, -HP, {
      loot: "locker",
      name: "Attendant Parts Locker",
    });
    S.prop("safe", 25.6, 1.0, 13.2, HP, {
      loot: "wall_safe",
      locked: 0,
      lock: P.LOCKS.frick_safe,
      name: "Mr. Frick's Wall Safe",
    });
    S.container("Ticket Desk", -4.5, 1.1, 16.5, { loot: "desk" });
    S.prop("first_aid", 5.7, 1.4, 16.8, HP, {});
    S.prop("footlocker", -26, BY, 47.7, 0, {
      loot: "footlocker",
      name: "Bowling Locker",
    });
    S.prop("toolbox", 22.6, BY, 36.8, PI, {
      loot: "toolbox",
      name: "Conservator's Kit",
    });
    S.prop("crate", 14.8, 0, -26.6, 0, {
      loot: "crate",
      kind: "plain",
      name: "Packing Crate",
    });
    S.prop("radio", -26, BY + 0.8, 43.3, -HP, {});
    S.prop("ammo_box", -16.8, 0, -36.6, 0, { loot: "ammo_box" });
    S.pickup("ues_note_frick_pemberton", 1, 22.9, UY + 0.81, 10.2);
    S.pickup("ues_reel_frick_conservator", 1, 21.4, BY + 0.05, 50.9);
    S.pickup("ues_note_frick_thief", 1, 3.1, UY + 0.02, 16.7);
    S.pickup("ues_painting_vermeer", 1, 25, BY + 0.97, 49.7);
    S.pickup("rally_tonic", 1, -26.1, BY + 0.82, 42.6);
    S.pickup("fizzo_cola", 2, 7.4, 0.8, -22.7);
  }

