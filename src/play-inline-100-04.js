// play-inline-100 04 — floor
// Lines 1085-1574 of readable/play-inline-100.pretty.js (statement-aligned).
  function buildChelsea(K) {
    const r = K.r,
      Y = 4.2;
    const W = {
      wall: "wallpaper",
      wain: "wood_planks",
      wainC: [0.4, 0.3, 0.22],
      wc: [0.66, 0.6, 0.5],
    };
    K.room(
      Object.assign(
        {
          x0: -6,
          z0: -10,
          x1: 6,
          z1: 0,
          y: Y,
          h: 3.6,
          floor: "tile_floor",
          fc: [0.72, 0.7, 0.66],
          ceil: "plaster_stained",
        },
        W,
      ),
    );
    K.room(
      Object.assign(
        {
          x0: -1.5,
          z0: -34,
          x1: 1.5,
          z1: -10,
          y: Y,
          h: 3.2,
          floor: "carpet",
          fc: [0.5, 0.26, 0.2],
          surface: "carpet",
        },
        W,
      ),
    );
    const a1 = K.room(
      Object.assign(
        {
          x0: -12,
          z0: -22,
          x1: -1.5,
          z1: -12,
          y: Y,
          h: 3.2,
          floor: "wood_planks",
          fc: [0.6, 0.5, 0.4],
          surface: "wood",
        },
        W,
        { wc: [0.6, 0.62, 0.52] },
      ),
    );
    const bath = K.room({
      x0: -12,
      z0: -26,
      x1: -5,
      z1: -22,
      y: Y,
      h: 3.0,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.8, 0.82, 0.78],
      fc: [0.78, 0.78, 0.74],
    });
    const a1c = K.room(
      Object.assign(
        {
          x0: -12,
          z0: -34,
          x1: -1.5,
          z1: -26,
          y: Y,
          h: 3.2,
          floor: "wood_planks",
          fc: [0.6, 0.5, 0.4],
          surface: "wood",
        },
        W,
        { wc: [0.7, 0.6, 0.5] },
      ),
    );
    const a1b = K.room(
      Object.assign(
        {
          x0: 1.5,
          z0: -22,
          x1: 12,
          z1: -12,
          y: Y,
          h: 3.2,
          floor: "wood_planks",
          fc: [0.58, 0.48, 0.38],
          surface: "wood",
          hole: { x0: 5, z0: -19, x1: 9, z1: -15 },
        },
        W,
        { wc: [0.62, 0.55, 0.62] },
      ),
    );
    const laundry = K.room({
      x0: 1.5,
      z0: -28,
      x1: 10,
      z1: -22,
      y: Y,
      h: 3.0,
      floor: "tile_floor",
      wall: "plaster_stained",
      wc: [0.7, 0.72, 0.66],
      fc: [0.62, 0.62, 0.58],
    });
    const supt = K.room({
      x0: 1.5,
      z0: -34,
      x1: 10,
      z1: -28,
      y: Y,
      h: 3.0,
      floor: "wood_planks",
      wall: "plaster_stained",
      wain: "wood_planks",
      wainC: [0.4, 0.32, 0.24],
      wc: [0.6, 0.62, 0.55],
      fc: [0.55, 0.45, 0.35],
      surface: "wood",
    });
    K.room({
      x0: -1.5,
      z0: -44,
      x1: 4,
      z1: -34,
      y: 0,
      h: 8.2,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.62, 0.52, 0.46],
      fc: [0.5, 0.5, 0.47],
    });
    const boiler = K.room({
      x0: -12,
      z0: -64,
      x1: 12,
      z1: -44,
      y: 0,
      h: 5.5,
      floor: "concrete",
      wall: "brick_red",
      ceil: "concrete",
      wc: [0.6, 0.5, 0.44],
      fc: [0.45, 0.44, 0.42],
      cc: [0.35, 0.34, 0.32],
    });
    K.room({
      x0: 12,
      z0: -52,
      x1: 36,
      z1: -48,
      y: 0,
      h: 3.0,
      floor: "concrete",
      wall: "concrete",
      wc: [0.5, 0.52, 0.48],
      fc: [0.42, 0.42, 0.4],
    });
    const store = K.room({
      x0: 36,
      z0: -58,
      x1: 46,
      z1: -44,
      y: 0,
      h: 3.2,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.55, 0.46, 0.4],
      fc: [0.45, 0.44, 0.42],
    });
    K.door(0, 0, 1.8, Y, 2.5, { exit: true });
    K.door(0, -10, 1.4, Y);
    K.door(-1.5, -17, 1.0, Y, 2.2);
    K.door(1.5, -16, 1.0, Y, 2.2);
    K.door(-1.5, -30, 1.0, Y, 2.2);
    K.door(-8.5, -22, 0.9, Y, 2.1);
    K.door(1.5, -25, 1.0, Y, 2.2);
    K.door(1.5, -31, 1.0, Y, 2.2);
    K.door(0, -34, 1.4, Y, 2.3);
    K.door(0, -44, 1.4, 0, 2.3);
    K.door(12, -50, 1.3, 0, 2.3);
    K.door(36, -50, 1.3, 0, 2.3);
    K.build();
    exitDoor(K, 0, Y, 1.8, 2.5, { c: [0.28, 0.22, 0.18] });

    // ---- lobby ----
    mailboxes(K, -6, Y + 0.8, -5, 1, 0, 8, 3);
    K.sign("CHELSEA ARMS", 0, Y + 2.9, -9.85, 0, 1, 3.0);
    K.sofa(4.2, Y, -2.2, -HP, { c: [0.4, 0.28, 0.2] });
    radiator(K, 5.7, Y, -6.5, -HP);
    K.counter(-5.2, -9.0, -2.5, -8.2, Y, { c: [0.4, 0.3, 0.22] });
    K.light("bulb", 0, Y + 3.6, -5, { floor: Y, real: true });
    K.litter(-6, -10, 6, 0, Y, 12);
    for (let i = 0; i < 5; i++)
      K.decal(
        r.range(-4, 4),
        Y + 0.013,
        r.range(-9, -1),
        r.range(0.6, 1.4),
        r.range(0.6, 1.4),
        r() * 6,
        M.MARK.BLOOD,
      );
    K.loot("first_aid", 5.85, Y + 1.2, -3.2, HP, { loot: "first_aid" });

    // ---- hallway: numbered doors, stains, flickering ----
    fakeDoor(K, -1.5, Y, -12.8, 1, 0, {});
    fakeDoor(K, 1.5, Y, -12.8, -1, 0, {});
    fakeDoor(K, -1.5, Y, -24.2, 1, 0, {});
    K.light("tube", 0, Y + 3.2, -13, {
      floor: Y,
      alongX: false,
      flicker: true,
    });
    K.light("dead", 0, Y + 3.2, -20, { alongX: false });
    K.light("tube", 0, Y + 3.2, -28, { floor: Y, alongX: false });
    K.litter(-1.5, -34, 1.5, -10, Y, 10, { tiles: false });
    K.decal(-0.3, Y + 0.014, -21, 1.2, 3.6, 0.1, M.MARK.BLOOD);
    K.anchor("spawn1", 0, Y, -25);

    // ---- apartments ----
    apartment(K, a1, { bedSide: "w" });
    boardedWindow(K, -12, Y + 1.5, -17, 1, 0, 1.6, 1.8);
    K.loot("file_cabinet", -2.2, Y, -12.7, 0, {
      loot: "dresser",
      name: "Dresser",
    });
    K.anchor("spawn2", -8, Y, -18);
    apartment(K, a1c, { bedSide: "w" });
    boardedWindow(K, -12, Y + 1.5, -30, 1, 0, 1.6, 1.8);
    K.anchor("spawn3", -7, Y, -30);
    apartment(K, a1b, { bedSide: "e" });
    K.poster("lonly_tv", 11.85, Y + 1.8, -19, -1, 0, 1.2, 0.8);
    // the tableau: a couple on the sofa of 1C, the TV still facing them
    K.skel(-3.55, Y - 0.03, -27.2, PI, "seated");
    K.skel(-2.65, Y - 0.03, -27.2, PI, "seated");
    K.note("dng_note_chelsea_eviction", -6.1, Y + 0.8, -29.6, {
      name: "Letter to Apt 1C",
      title: "CHELSEA ARMS — Office of the Superintendent",
      text: "Mr. & Mrs. Adler (1C) —\n\nThe building has received two (2) Civil Defense shelter passes for the deep shelter under the 69th Regiment Armory. Under the lease, they go to the tenants in best standing. That is not you. You have complained about the radiators nine times this year.\n\nThe Kowalskis in 1A will be taking the passes.\n\nRespectfully,\nE. Mooney, Supt.\n\n(handwritten below, shaky:)\nWe stayed in. We watched the news together. The radiators finally came on. It was very warm. — Harold",
    });
    // bathroom
    K.box(
      "tile_floor",
      -11.8,
      Y,
      -25.8,
      -9.8,
      Y + 0.55,
      -24.9,
      [0.85, 0.85, 0.8],
      0.5,
    );
    K.col(-11.8, Y, -25.8, -9.8, Y + 0.55, -24.9, { tag: "furniture" });
    K.stalls(-8.2, -6.2, -26, 1, Y, 1);
    K.light("bulb", -8.5, Y + 3.0, -24, { floor: Y });
    K.loot("first_aid", -5.15, Y + 1.3, -24, HP, { loot: "medical_cabinet" });

    // ---- laundry ----
    for (let x = 3; x < 9.5; x += 1.3) {
      K.box(
        "metal_painted",
        x - 0.55,
        Y,
        -27.9,
        x + 0.55,
        Y + 1.0,
        -27.2,
        [0.72, 0.72, 0.68],
        1,
      );
      K.cyl("glass_dirty", x, Y + 0.55, -27.19, 0.28, 0.28, 0.02, 10, {
        c: [0.2, 0.22, 0.2],
      });
      K.col(x - 0.55, Y, -27.9, x + 0.55, Y + 1.0, -27.2, {
        tag: "furniture",
        surface: "metal",
      });
    }
    K.pipe("rust", 2, Y + 2.4, -23, 9.5, Y + 2.4, -23, 0.012, 3, {
      c: [0.4, 0.3, 0.25],
    });
    for (let x = 2.6; x < 9; x += 0.6)
      K.obox("fabric", x, Y + 2.0, -23, 0.02, 0.8, 0.5, 0, {
        c: r.pick([
          [0.6, 0.58, 0.5],
          [0.4, 0.45, 0.55],
          [0.55, 0.3, 0.25],
        ]),
        s: 0.5,
      });
    K.light("tube", 6, Y + 3.0, -25, { floor: Y });
    K.loot("trash_can", 9.4, Y, -22.6, 0, { loot: "trash_can" });
    K.anchor("spawn4", 6, Y, -24.5);

    // ---- superintendent's office ----
    const top = K.desk(6, Y, -32.8, 0, { w: 1.6, d: 0.8, monitor: false });
    K.chair(6, Y, -31.9, 0);
    K.terminal("dng_term_chelsea", 6.3, top, -32.9, PI, {
      title: "CHELSEA ARMS — SUPERINTENDENT",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 33 OFFICE TELETYPE\n-Tenant Ledger-",
      entries: [
        {
          title: "Complaint Log (partial)",
          text: "2/13 — 1C (Adler): radiator cold. Declined.\n2/19 — 2A: screaming from 1B. Not our business.\n2/25 — 1C (Adler): radiator cold AGAIN, snow on the sill. Declined.\n3/4 — Boiler room: something living down there. Pest control booked for 3/6.",
        },
        {
          title: "Shelter Pass Allocation",
          text: 'CIVIL DEFENSE PASSES RECEIVED: 2\nALLOCATED: Kowalski, J. (1A); Kowalski, M. (1A)\nNOTES: E. Mooney (Supt.) to accompany as "building liaison" per verbal agreement with Mr. Kowalski ($200).',
        },
        {
          title: "Boiler Room — Maintenance",
          text: "Boiler #2 cracked firebox. Glowing? Recommend nobody go down there without a badge.\nThe tenant storage cages are past the tunnel. Tenants keep asking for their trunks. Tell them no.",
        },
        {
          title: "Office Safe — Combination",
          text: "Rent money goes in the wall safe Fridays.\nCombination: 1-1-0-4 (my birthday — E.M.)",
          learn: "map_dng_chelsea_safe",
        },
        {
          title: "Office Safe — Release",
          text: "Click. The wall safe unlocks.",
          action: () => unlockLoot("dng_chelsea", "wallsafe"),
        },
      ],
    });
    K.loot("safe", 9.72, Y + 1.05, -31, HP, {
      loot: "wall_safe",
      wall: true,
      tag: "wallsafe",
      lock: lockSpec({
        id: "map_dng_chelsea_safe",
        label: "Chelsea Arms — superintendent's wall safe",
        code: "1104",
        hint: "The superintendent's teletype.",
      }),
    });
    K.fileCabinet(2.2, Y, -33.4, PI, {});
    K.fileCabinet(2.7, Y, -33.4, PI, { open: true });
    K.shelf(9.5, Y, -29, HP, 1.8, "parts", { h: 1.8 });
    K.light("bulb", 5, Y + 3.0, -31, { floor: Y, real: true });
    K.skel(4.4, Y, -30.5, 1.2, "lying");
    K.loot("desk", 3.8, Y, -29.2, 0, { loot: "desk" });

    // ---- stairwell down to the basement ----
    K.landing(-1.5, -35.4, 4, -34, Y, { rails: [[1.1, -35.4, 4, -35.4]] });
    K.stairs(-1.4, 1.1, -35.4, -42.4, Y, 0, "z", { rail: "hi" });
    K.light("cage", 3.8, 2.8, -40, { nx: -1, nz: 0, floor: 0 });
    K.light("red", -1.3, 6.5, -38, { nx: 1, nz: 0, floor: 0 });
    K.sign("BOILER ROOM", 0, 2.75, -43.85, 0, 1, 1.4);

    // ---- boiler room (boss) ----
    K.boiler(-6, 0, -55, 0, 7);
    K.boiler(5.5, 0, -56, 0, 7);
    K.pipeRun(
      [
        [-12, 4.6, -46],
        [12, 4.6, -46],
      ],
      0.18,
    );
    K.pipeRun(
      [
        [-11.6, 0.4, -46],
        [-11.6, 4.8, -46],
        [-11.6, 4.8, -63],
      ],
      0.12,
    );
    K.pipeRun(
      [
        [-6, 5.3, -51.5],
        [-6, 5.3, -46],
      ],
      0.3,
      { c: [0.35, 0.3, 0.27] },
    );
    K.rubbleMound(9, 0, -61, 2.5, 1.2); // coal heap
    K.table(-9.5, 0, -46.2, 0, 3, 0.9, {
      mat: "metal_painted",
      c: [0.4, 0.4, 0.36],
    });
    K.light("cage", 0, 4.4, -44.2, { nx: 0, nz: 1, floor: 0, real: true });
    K.light("red", 11.8, 3.5, -58, { nx: -1, nz: 0, floor: 0, real: true });
    K.light("dead", 0, 5.5, -58, {});
    K.litter(-12, -64, 12, -44, 0, 18, {
      cells: [
        M.MARK.DIRT,
        M.MARK.GRIME,
        M.MARK.PUDDLE,
        M.MARK.STAIN,
        M.MARK.BLOOD,
      ],
    });
    // the bruiser's nest by a leaking, irradiated puddle, and the bones of pest control
    K.decal(0, 0.014, -58, 4, 4, 0.5, M.MARK.MOSS, [0.6, 1.2, 0.6]);
    K.skel(1.8, 0, -59.5, 2.2, "lying");
    K.skel(-1.2, 0, -60.8, 0.4, "reaching");
    K.loot("toolbox", -10.2, 0.76, -46.2, 0, { loot: "toolbox", chest: true });
    K.loot("ammo_box", -11.3, 0, -62.8, HP, { loot: "ammo_box" });
    K.anchor("spawn6", 0, 0, -57);
    K.anchor("boss", 0, 0, -57);

    // ---- maintenance tunnel ----
    K.grate(12, -49.4, 36, -48.6, 0);
    K.pipeRun(
      [
        [12, 2.6, -51.6],
        [36, 2.6, -51.6],
      ],
      0.14,
    );
    K.pipeRun(
      [
        [12, 2.2, -51.7],
        [36, 2.2, -51.7],
      ],
      0.07,
      { mat: "metal_painted", c: [0.3, 0.4, 0.3] },
    );
    for (const x of [18, 30])
      K.light("cage", x, 2.4, -48.2, { nx: 0, nz: -1, floor: 0 });
    for (let i = 0; i < 6; i++)
      K.decal(
        r.range(13, 35),
        0.013,
        r.range(-51.5, -48.5),
        r.range(0.8, 1.6),
        r.range(0.6, 1.2),
        r() * 6,
        r.pick([M.MARK.PUDDLE, M.MARK.GRIME]),
      );
    K.anchor("spawn5", 24, 0, -50);

    // ---- tenant storage: cages, trunks, and the Kowalskis ----
    for (let x = 37.5; x < 45; x += 2.4) {
      K.cage(x, 0, -56.8, 1.9);
    }
    K.lockers(38.5, 0, -44.6, 0, 4);
    K.loot("footlocker", 39.8, 0, -52.6, 0, {
      loot: "luggage",
      name: "Steamer Trunk",
    });
    K.loot("footlocker", 44.4, 0, -50.4, -HP, { loot: "footlocker" });
    K.loot("footlocker", 42, 0, -53, 0.3, {
      loot: "luggage",
      name: "Suitcase",
      lock: lockSpec({
        id: "map_dng_chelsea_suitcase",
        label: "The Kowalskis' suitcase",
        key: "map_key_chelsea_suitcase",
        hint: "On a string with the Kowalskis, in the tenant storage cages.",
      }),
    });
    placeKey(K, "map_key_chelsea_suitcase", 41.0, 0, -49.3);
    K.skel(41.2, 0, -49.5, 0.3, "curled");
    K.skel(42.2, 0, -49.1, -0.4, "child_curled");
    K.skel(40.3, 0, -48.6, 1.8, "sitting");
    K.note("dng_note_kowalski", 41.6, 0, -48.4, {
      name: "Shelter Pass (Kowalski)",
      title: "OFFICE OF CIVIL DEFENSE — PUBLIC SHELTER PASS",
      text: 'ADMIT ONE (1): KOWALSKI, JAN\nADMIT ONE (1): KOWALSKI, MARTA\nReport to the 69th Regiment Armory, Lexington Ave., with this pass and ONE suitcase.\n\n(written on the back in pencil:)\nThe Super took the car. He took my Jan\'s pass right out of his hand and said he was "the liaison." We came down here because the walls are thick. Marta is asleep. I told her we are in the shelter now, that this is what a shelter looks like. She believed me. The suitcase key is on her string. — A.K.',
    });
    K.light("bulb", 41, 3.2, -51, { floor: 0, real: true });
    K.litter(36, -58, 46, -44, 0, 10);
    K.anchor("arrival", 0, Y, -2.2, 0);
    K.anchor("exit", 0, Y + 1.2, -0.5, 0);
    void bath;
    void laundry;
    void supt;
    void boiler;
    void store;
  }

  // ===================================================================
  // 3. Dunmore Mutual Trust — the bank still guards its strongroom
  // ===================================================================
