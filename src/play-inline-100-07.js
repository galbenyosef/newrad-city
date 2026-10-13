// play-inline-100 07 — loot
// Lines 2615-3054 of readable/play-inline-100.pretty.js (statement-aligned).
  function buildMarket(K) {
    const r = K.r;
    K.room({
      x0: -4,
      z0: -4,
      x1: 4,
      z1: 0,
      h: 3.4,
      floor: "tile_floor",
      wall: "brick_tan",
      wc: [0.78, 0.72, 0.62],
      fc: [0.7, 0.68, 0.64],
    });
    const floor = K.room({
      x0: -24,
      z0: -40,
      x1: 24,
      z1: -4,
      h: 5,
      floor: "tile_floor",
      wall: "plaster_stained",
      ceil: "metal_panel",
      wc: [0.78, 0.76, 0.66],
      fc: [0.72, 0.7, 0.66],
      cc: [0.5, 0.5, 0.48],
      hole: { x0: -6, z0: -26, x1: 2, z1: -18 },
    });
    K.room({
      x0: -24,
      z0: -52,
      x1: -10,
      z1: -40,
      h: 3.4,
      floor: "tile_floor",
      wall: "plaster_stained",
      wc: [0.75, 0.8, 0.76],
      fc: [0.72, 0.72, 0.7],
    });
    K.room({
      x0: -10,
      z0: -52,
      x1: 0,
      z1: -40,
      h: 3.2,
      floor: "carpet",
      wall: "wallpaper",
      wain: "wood_planks",
      wainC: [0.4, 0.3, 0.22],
      wc: [0.62, 0.58, 0.48],
      fc: [0.3, 0.35, 0.28],
      surface: "carpet",
    });
    K.room({
      x0: 0,
      z0: -52,
      x1: 8,
      z1: -40,
      h: 3.2,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.78, 0.8, 0.76],
      fc: [0.75, 0.75, 0.72],
    });
    K.room({
      x0: 8,
      z0: -60,
      x1: 24,
      z1: -40,
      h: 5.5,
      floor: "concrete",
      wall: "brick_tan",
      wc: [0.62, 0.58, 0.5],
      fc: [0.5, 0.5, 0.47],
      cc: [0.4, 0.4, 0.38],
    });
    K.room({
      x0: 24,
      z0: -56,
      x1: 32,
      z1: -44,
      h: 3.0,
      floor: "metal_diamond",
      wall: "metal_panel",
      ceil: "metal_panel",
      wc: [0.7, 0.74, 0.76],
      fc: [0.55, 0.56, 0.56],
      surface: "metal",
    });
    K.door(0, 0, 2.4, 0, 2.6, { exit: true });
    K.door(0, -4, 2.4, 0, 2.6);
    K.door(-17, -40, 1.8, 0, 2.4);
    K.door(-5, -40, 1.1, 0, 2.2);
    K.door(1.2, -40, 1.1, 0, 2.2);
    K.door(16, -40, 3.0, 0, 3.0);
    K.door(24, -50, 1.3, 0, 2.3);
    K.build();
    exitDoor(K, 0, 0, 2.4, 2.6, { mat: "metal_painted", c: [0.5, 0.52, 0.5] });

    // ---- vestibule ----
    for (let i = 0; i < 4; i++) {
      const x = -3.3 + i * 0.25;
      K.obox("chrome", x, 0.5, -2.5, 0.55, 0.9, 0.9, 0.05 * i, {
        c: [0.6, 0.6, 0.58],
        s: 1,
      });
    }
    K.col(-3.6, 0, -3, -2.2, 1, -2, { surface: "metal" });
    K.poster("freedom_flakes", 3.85, 1.7, -2, -1, 0, 1.6, 0.8);
    K.light("dead", 0, 3.4, -2, {});

    // ---- sales floor ----
    K.sign("BIG APPLE FOOD FAIR", 0, 4.2, -4.15, 0, -1, 5);
    // checkout lanes
    for (const x of [-15, -9, 9, 15]) {
      K.counter(x - 0.5, -10.5, x + 0.5, -7.5, 0, {
        h: 0.9,
        mat: "metal_painted",
        c: [0.62, 0.3, 0.25],
        top: "metal_panel",
        topC: [0.6, 0.6, 0.58],
      });
      K.box(
        "metal_painted",
        x - 0.35,
        0.9,
        -8.2,
        x + 0.35,
        1.2,
        -7.7,
        [0.5, 0.45, 0.35],
        1,
      );
      K.pipe("metal_painted", x + 0.5, 0, -10.4, x + 0.5, 2.2, -10.4, 0.03, 4, {
        c: [0.3, 0.3, 0.3],
      });
      K.box(
        "glass_dirty",
        x + 0.3,
        2.2,
        -10.6,
        x + 0.7,
        2.6,
        -10.2,
        [0.2, 0.25, 0.2],
        1,
      );
    }
    K.sign("CHECKOUT", -12, 3.2, -9, 0, -1, 1.8);
    K.sign("CHECKOUT", 12, 3.2, -9, 0, -1, 1.8);
    // aisles
    const aisleX = [-18, -11, -4, 3, 10, 17];
    for (const x of aisleX) {
      for (const side of [-0.28, 0.28])
        K.shelf(
          x + side,
          0,
          -24,
          HP + (side > 0 ? PI : 0),
          17,
          r.pick(["cans", "boxes", "bottles", "cans"]),
          {
            h: 2.1,
            d: 0.55,
            levels: 4,
            collapsed: r() < 0.2,
            back: side < 0,
            c: [0.55, 0.55, 0.52],
          },
        );
    }
    K.sign("AISLE 3", -4, 3.4, -15, 0, -1, 1.2);
    K.sign("AISLE 4", 3, 3.4, -15, 0, -1, 1.2);
    K.sign("CANNED GOODS", -11, 3.4, -15, 0, -1, 1.6);
    // freezer cases along the east wall, produce bins along the west
    for (let z = -37; z < -12; z += 3.2) {
      K.box(
        "metal_painted",
        22.6,
        0,
        z,
        23.9,
        1.9,
        z + 3,
        [0.72, 0.74, 0.74],
        1,
      );
      K.box(
        "glass_dirty",
        22.58,
        0.3,
        z + 0.2,
        22.6,
        1.7,
        z + 2.8,
        [0.18, 0.22, 0.24],
        1,
      );
      K.col(22.6, 0, z, 23.9, 1.9, z + 3, { surface: "metal" });
    }
    K.sign("FROZEN FOODS", 23.8, 2.7, -24, -1, 0, 2.0);
    for (let z = -36; z < -14; z += 4) {
      K.obox("wood_planks", -22.8, 0.45, z + 1.5, 1.6, 0.9, 3.2, 0, {
        pitch: 0,
        c: [0.55, 0.45, 0.32],
        s: 1,
      });
      K.box(
        "dirt",
        -23.5,
        0.9,
        z + 0.1,
        -22.1,
        0.98,
        z + 2.9,
        [0.35, 0.3, 0.22],
        1,
      );
      K.col(-23.6, 0, z, -22, 0.95, z + 3.1, { surface: "wood" });
    }
    K.sign("PRODUCE", -23.8, 2.6, -24, 1, 0, 1.6);
    // the raiders' fort at the checkout: crate walls and a burning barrel
    for (let i = 0; i < 5; i++)
      K.crate(-3 + i * 1.1, 0, -12.2, r.range(-0.2, 0.2), 1.0);
    K.crate(-2.4, 1.0, -12.2, 0.3, 0.8, { collide: false });
    K.barrel(0, 0, -14, { fire: true });
    for (let i = 0; i < 6; i++) {
      const x = r.range(-20, 20),
        z = r.range(-36, -12);
      K.obox("chrome", x, 0.5, z, 0.55, 0.9, 0.9, r() * 6, {
        roll: r() < 0.3 ? 1.4 : 0,
        c: [0.55, 0.55, 0.52],
        s: 1,
      });
    }
    for (let x = -18; x <= 18; x += 9)
      for (const z of [-12, -34])
        K.light(r() < 0.3 ? "dead" : "tubes2", x, 5, z, {
          floor: 0,
          drop: 0.6,
          flicker: r() < 0.3,
          real: x === 0 && z === -34,
        });
    K.litter(-24, -40, 24, -4, 0, 44, {
      tiles: false,
      cells: [
        M.MARK.LITTER,
        M.MARK.LITTER,
        M.MARK.DIRT,
        M.MARK.STAIN,
        M.MARK.GRIME,
        M.MARK.BLOOD,
      ],
    });
    K.skel(-8, 0, -30.2, 0.6, "reaching");
    K.skel(12.5, 0, -8.8, 2, "lying");
    K.loot("cash_register", -15, 0.9, -8.9, PI, { loot: "cash_register" });
    K.loot("cash_register", 9, 0.9, -8.9, PI, { loot: "cash_register" });
    K.loot("first_aid", 23.85, 1.3, -6.5, HP, { loot: "first_aid" });
    K.loot("fizzo_machine", -23.3, 0, -6, -HP, { loot: "fizzo_machine" });
    K.loot("footlocker", 1.2, 0, -13.3, 0, { loot: "raider_stash" });
    K.anchor("spawn1", -7.5, 0, -24);
    K.anchor("spawn2", 13.5, 0, -30);
    K.anchor("spawn3", 1, 0, -16);

    // ---- pharmacy (boss) ----
    K.counter(-23.9, -44.8, -19, -44, 0, {
      h: 1.05,
      c: [0.8, 0.8, 0.78],
      top: "tile_floor",
      topC: [0.8, 0.8, 0.76],
    });
    K.counter(-15, -44.8, -10.1, -44, 0, {
      h: 1.05,
      c: [0.8, 0.8, 0.78],
      top: "tile_floor",
      topC: [0.8, 0.8, 0.76],
    });
    K.sign("PHARMACY", -17, 3.0, -40.15, 0, -1, 2.2);
    for (const x of [-22, -18.5, -14.8, -11.6])
      K.shelf(x, 0, -51.5, PI, 3, "bottles", {
        h: 2.2,
        d: 0.4,
        levels: 5,
        c: [0.7, 0.72, 0.7],
      });
    K.box(
      "fabric",
      -23.5,
      0,
      -49.5,
      -21.5,
      0.25,
      -46.5,
      [0.4, 0.35, 0.28],
      0.5,
    );
    K.table(-16.5, 0, -47.5, 0.2, 1.6, 0.9, { c: [0.45, 0.4, 0.35] });
    K.light("tube", -17, 3.4, -47, { floor: 0, real: true, flicker: true });
    K.litter(-24, -52, -10, -40, 0, 14, {
      cells: [M.MARK.LITTER, M.MARK.STAIN, M.MARK.BLOOD],
    });
    K.loot("safe", -23.2, 0, -51.3, -HP, {
      loot: "safe",
      name: "Narcotics Safe",
      lock: lockSpec({
        id: "map_dng_market_narc_safe",
        label: "Big Apple Food Fair — pharmacy narcotics safe",
        code: "0919",
        hint: "The store manager's teletype.",
      }),
    });
    K.loot("first_aid", -10.2, 1.3, -47, HP, { loot: "medical_cabinet" });
    K.loot("desk", -12.4, 0, -51.4, PI, { loot: "desk" });
    K.anchor("boss", -17, 0, -48.5);
    K.anchor("spawn6", -14, 0, -47);

    // ---- manager's office ----
    const top = K.desk(-5, 0, -49.8, 0, { w: 1.7, wood: true });
    K.chair(-5, 0, -48.9, 0);
    K.terminal("dng_term_market", -4.7, top, -49.9, PI, {
      title: "BIG APPLE FOOD FAIR — STORE 12",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 33 TELETYPE\n-Store Management-",
      lock: lockSpec({
        id: "map_dng_market_term",
        label: "Big Apple Food Fair — store manager's teletype",
        passcode: "GROCER",
        hint: "Danny Ruiz's note in the walk-in freezer.",
      }),
      entries: [
        {
          title: "Memo: Rationing",
          text: "Effective 2/25: limit TWO (2) cans per customer. Management reserves the right to refuse service to hoarders.\nThe stockroom is CLOSED to the public. That means you, Mrs. Petrakis.",
        },
        {
          title: "Shrinkage Report",
          text: "Q3 losses: 14 cases Golden Plain Jerky, 9 cases Pork n' Beans, 1 cash register (entire), 6 carts.\nSuspect: night stocker D. Ruiz.\n\nUpdate 3/5: Ruiz was locked in the freezer overnight as a lesson. Remember to let Ruiz out in the morning.",
        },
        {
          title: "Safe Combinations",
          text: "OFFICE SAFE (payroll): 0-2-2-5 — the day rationing started, so I remember it.\nPHARMACY NARCOTICS SAFE: 0-9-1-9 — Mr. Haddad has the other copy.\n— R. Grubb, Store Mgr.",
          learn: ["map_dng_market_safe", "map_dng_market_narc_safe"],
        },
        {
          title: "Office Safe — Release",
          text: "The wall safe unlocks.",
          action: () => unlockLoot("dng_market", "wallsafe"),
        },
      ],
    });
    K.loot("safe", -0.28, 1.05, -46, HP, {
      loot: "wall_safe",
      wall: true,
      tag: "wallsafe",
      lock: lockSpec({
        id: "map_dng_market_safe",
        label: "Big Apple Food Fair — manager's wall safe",
        code: "0225",
        hint: "The store manager's teletype.",
      }),
    });
    K.fileCabinet(-9.4, 0, -51.4, PI, {});
    K.loot("file_cabinet", -8.8, 0, -51.4, PI, { loot: "file_cabinet" });
    K.poster("mama_marinara", -5, 2.0, -40.12, 0, -1, 1.4, 0.7);
    K.light("bulb", -5, 3.2, -46, { floor: 0 });

    // ---- restroom ----
    K.stalls(0.5, 7.6, -52, 1, 0, 3);
    K.sinks(3.5, 7.5, -40, -1, 0);
    K.light("tube", 4, 3.2, -46, { floor: 0, flicker: true });
    K.litter(0, -52, 8, -40, 0, 6, { cells: [M.MARK.STAIN, M.MARK.PUDDLE] });

    // ---- stockroom ----
    for (let x = 10.5; x < 22; x += 4)
      for (let z = -57.5; z < -44; z += 4.5)
        if (r() < 0.8)
          K.pallet(x + r.range(-0.3, 0.3), 0, z, r.range(-0.3, 0.3), {});
    K.shelf(23.4, 0, -56, HP, 7, "boxes", {
      h: 3.2,
      d: 0.9,
      levels: 4,
      c: [0.5, 0.3, 0.2],
    });
    K.plate(
      "corrugated",
      16,
      1.8,
      -59.9,
      0,
      1,
      4.2,
      3.6,
      null,
      [0.6, 0.58, 0.5],
    );
    K.light("cage", 8.2, 3.5, -50, { nx: 1, nz: 0, floor: 0 });
    K.light("dead", 16, 5.5, -50, {});
    K.light("bulb", 18, 5.5, -45, { floor: 0 });
    K.litter(8, -60, 24, -40, 0, 16);
    K.loot("crate", 11, 0, -59, PI, {
      loot: "food_oldworld",
      kind: "plain",
      name: "Crate of Groceries",
    });
    K.loot("crate", 20.5, 0, -41.5, 0, { loot: "crate" });
    K.loot("ammo_box", 12.8, 0.14, -44.6, 0.4, { loot: "ammo_box" });
    K.anchor("spawn4", 14, 0, -51);
    K.anchor("spawn5", 20, 0, -46);

    // ---- walk-in freezer ----
    for (let x = 26; x < 31.5; x += 1.4)
      for (const z of [-54, -46]) {
        const len = K.r.range(1.1, 1.6);
        K.pipe("rust", x, 3.0, z, x, 2.4, z, 0.012, 3, { c: [0.4, 0.4, 0.4] });
        K.cyl("fabric", x, 2.4 - len, z, 0.2, 0.28, len, 8, {
          capTop: true,
          c: [0.62, 0.55, 0.52],
        });
      }
    K.light("dead", 28, 3.0, -50, {});
    K.light("red", 31.8, 2.4, -50, { nx: -1, nz: 0, floor: 0 });
    K.skel(30.6, 0, -49.8, -HP, "curled");
    K.note("dng_note_ruiz", 30.2, 0, -48.9, {
      name: "Note scratched on a price tag",
      title: "Price tag, reverse side",
      text: 'Its Danny Ruiz. They locked me in for the night for "shrinkage." I heard the sirens at 9. I heard the whole building shake. Nobody came.\n\nIts warm now. The compressor died. The meat is going bad.\n\nI never stole anything. I gave the cans to Mrs. Petrakis. She has four kids.\n\nIf you find this you can have my paycheck. Its in the managers safe. Grubb keeps the combinations in his teletype and the word is GROCER, he says it out loud every time he types it.',
      learn: "map_dng_market_term",
    });
    K.loot("fridge", 25, 0, -44.7, 0, {
      loot: "fridge",
      name: "Freezer Chest",
    });
    K.anchor("arrival", 0, 0, -1.8, 0);
    K.anchor("exit", 0, 1.2, -0.5, 0);
    void floor;
  }

  // ===================================================================
  // 6. Pumping Station No. 4 — Shellbacks nest in the flooded pump hall
  // ===================================================================
