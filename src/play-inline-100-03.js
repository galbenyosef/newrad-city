// play-inline-100 03 — loot
// Lines 668-1084 of readable/play-inline-100.pretty.js (statement-aligned).
  function buildGarment(K) {
    const r = K.r;
    // ---- rooms ----
    const lobby = K.room({
      x0: -6,
      z0: -10,
      x1: 6,
      z1: 0,
      h: 4.2,
      floor: "terrazzo",
      wall: "plaster_stained",
      wain: "marble_dark",
      wainH: 1.2,
      wainC: [0.45, 0.42, 0.38],
      ceil: "plaster_stained",
      wc: [0.72, 0.66, 0.56],
      fc: [0.66, 0.62, 0.55],
      cc: [0.5, 0.48, 0.44],
    });
    const hall = K.room({
      x0: -1.5,
      z0: -30,
      x1: 1.5,
      z1: -10,
      h: 3.4,
      floor: "tile_floor",
      wall: "plaster_stained",
      wain: "wood_planks",
      wainC: [0.45, 0.36, 0.26],
      wc: [0.62, 0.66, 0.58],
      fc: [0.6, 0.58, 0.52],
    });
    const sew = K.room({
      x0: -26,
      z0: -34,
      x1: -1.5,
      z1: -12,
      h: 4.6,
      floor: "wood_planks",
      wall: "brick_red",
      ceil: "concrete",
      wc: [0.8, 0.72, 0.66],
      fc: [0.62, 0.52, 0.42],
      surface: "wood",
    });
    const cut = K.room({
      x0: 1.5,
      z0: -30,
      x1: 20,
      z1: -14,
      h: 4.2,
      floor: "wood_planks",
      wall: "brick_red",
      wc: [0.72, 0.64, 0.6],
      fc: [0.58, 0.5, 0.42],
      surface: "wood",
      hole: { x0: 8, z0: -25, x1: 14, z1: -19 },
    });
    const wc = K.room({
      x0: 6,
      z0: -10,
      x1: 14,
      z1: -2,
      h: 3.2,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.78, 0.8, 0.76],
      fc: [0.75, 0.75, 0.72],
    });
    const stair = K.room({
      x0: -1.5,
      z0: -40,
      x1: 4,
      z1: -30,
      h: 8.0,
      floor: "concrete",
      wall: "concrete",
      wc: [0.55, 0.62, 0.56],
      fc: [0.55, 0.55, 0.52],
    });
    const pattern = K.room({
      x0: 4,
      z0: -46,
      x1: 16,
      z1: -30,
      y: 4.2,
      h: 3.8,
      floor: "wood_planks",
      wall: "brick_red",
      wc: [0.7, 0.6, 0.55],
      fc: [0.55, 0.46, 0.38],
      surface: "wood",
    });
    const office = K.room({
      x0: 16,
      z0: -42,
      x1: 24,
      z1: -32,
      y: 4.2,
      h: 3.2,
      floor: "carpet",
      wall: "wallpaper",
      wain: "wood_planks",
      wainC: [0.42, 0.3, 0.2],
      wc: [0.62, 0.55, 0.45],
      fc: [0.45, 0.25, 0.2],
      surface: "carpet",
    });
    // ---- doors ----
    K.door(0, 0, 1.8, 0, 2.6, { exit: true });
    K.door(0, -10, 1.6, 0, 2.5);
    K.door(-1.5, -20, 1.8, 0, 2.5);
    K.door(1.5, -22, 1.6, 0, 2.4);
    K.door(6, -6, 1.2, 0, 2.2);
    K.door(0, -30, 1.4, 0, 2.3);
    K.door(4, -36, 1.4, 4.2, 2.3);
    K.door(16, -37, 1.2, 4.2, 2.2);
    K.build();
    exitDoor(K, 0, 0, 1.8, 2.6, { c: [0.3, 0.25, 0.2] });

    // ---- lobby: reception, mail slots, freight elevator, raider camp ----
    K.counter(-4.5, -7.2, -1.2, -6.4, 0, {
      c: [0.35, 0.28, 0.22],
      top: "marble",
      topC: [0.6, 0.58, 0.52],
    });
    K.sign("KESSLER & SONS", 0, 3.3, -9.85, 0, 1, 3.2);
    mailboxes(K, -6, 0.9, -4, 1, 0, 6, 3);
    // freight elevator doors (east wall) with a hand-painted OUT OF ORDER scrawl
    K.plate(
      "metal_panel",
      6 - M.DUNGEON_T / 2 - 0.012,
      1.3,
      -8.2 + 0,
      -1,
      0,
      2.2,
      2.6,
      null,
      [0.42, 0.44, 0.4],
    );
    K.beam("metal_painted", 5.88, 2.7, -9.4, 5.88, 2.7, -7.0, 0.1, 0.12, {
      c: [0.3, 0.3, 0.28],
    });
    K.scrawl(5.9, 1.5, -8.2, -1, 0, 1.6);
    K.sofa(3.5, 0, -1.3, PI, { c: [0.35, 0.3, 0.22] });
    K.cyl("terrazzo", -5.2, 0, -1, 0.3, 0.35, 0.6, 8, {
      c: [0.5, 0.45, 0.4],
      capTop: true,
    });
    K.pipe("wood_rotten", -5.2, 0.6, -1, -5.1, 1.6, -1.1, 0.03, 4, {
      c: [0.35, 0.28, 0.2],
    });
    // raider camp: mattresses, burning barrel, crates
    K.barrel(-3.5, 0, -4.2, { fire: true });
    K.box("fabric", -5.6, 0, -3.2, -3.9, 0.22, -1.2, [0.45, 0.4, 0.3], 0.5);
    K.crate(3.8, 0, -8.8, 0.3, 0.9);
    K.crate(4.7, 0, -8.6, -0.2, 0.7);
    K.litter(-6, -10, 6, 0, 0, 16);
    K.light("bulb", -3, 4.2, -5, { floor: 0, real: true });
    K.light("dead", 3, 4.2, -5, {});
    K.loot("first_aid", -5.85, 1.2, -7.6, -HP, { loot: "first_aid" });
    K.loot("footlocker", -4.8, 0, -2.6, 0, { loot: "raider_stash" });

    // ---- corridor ----
    K.pipeRun(
      [
        [1.3, 3.2, -10],
        [1.3, 3.2, -30],
      ],
      0.06,
      { c: [0.5, 0.4, 0.3] },
    );
    K.pipeRun(
      [
        [1.1, 3.25, -10],
        [1.1, 3.25, -30],
      ],
      0.04,
      { mat: "metal_painted", c: [0.4, 0.42, 0.4] },
    );
    fakeDoor(K, -1.5, 0, -14, 1, 0, { label: "EMPLOYEES ONLY" });
    fakeDoor(K, 1.5, 0, -27, -1, 0, {});
    K.sign("SEWING FLOOR 2", -1.35, 2.75, -20, 1, 0, 1.4);
    K.sign("CUTTING ROOM", 1.35, 2.75, -22, -1, 0, 1.4);
    K.light("tube", 0, 3.4, -14, { floor: 0, alongX: false });
    K.light("tube", 0, 3.4, -21, { floor: 0, alongX: false, flicker: true });
    K.light("dead", 0, 3.4, -27, { alongX: false });
    K.litter(-1.5, -30, 1.5, -10, 0, 8, { tiles: false });
    K.decal(0.2, 0.013, -17, 1.4, 3.2, 0.1, M.MARK.BLOOD);

    // ---- sewing floor: rows of machines, the last shift ----
    for (let x = -22; x <= -6; x += 4)
      for (let z = -30; z <= -15; z += 5)
        if (!(x === -6 && z === -20))
          column(K, x, 0, z, 4.6, { c: [0.28, 0.3, 0.28] });
    for (let z = -32; z <= -12; z += 4)
      K.beam("rust", -26, 4.4, z, -1.5, 4.4, z, 0.25, 0.35, {
        c: [0.45, 0.38, 0.32],
      });
    const rows = [-27.5, -22.5, -17.5];
    for (const z of rows)
      for (const x of [-19, -9.5]) K.sewingTable(x, 0, z, 0, 4);
    K.garmentRack(-24.2, 0, -14, HP, 3);
    K.garmentRack(-24.2, 0, -19, HP, 3);
    for (const [x, z, f] of [
      [-4, -14, false],
      [-5, -15.2, false],
      [-3.8, -32, true],
      [-24, -32, false],
      [-22.8, -32.6, false],
    ])
      K.dressForm(x, 0, z, r() * 6, f);
    K.fabricBolts(-14, 0, -32.8, 0, 6);
    for (const z of [-15, -24, -31])
      boardedWindow(K, -26, 2.4, z, 1, 0, 2.2, 2.4);
    for (let x = -22; x <= -5; x += 5.5)
      for (const z of [-26, -18])
        K.light(r() < 0.25 ? "dead" : "tubes2", x, 4.6, z, {
          floor: 0,
          drop: 0.8,
          flicker: r() < 0.3,
        });
    K.litter(-26, -34, -1.5, -12, 0, 30, {
      cells: [
        M.MARK.LITTER,
        M.MARK.DIRT,
        M.MARK.STAIN,
        M.MARK.GRIME,
        M.MARK.CRACKS,
      ],
    });
    // tableau: three seamstresses still at their machines, the floor lady on the floor by the locked door
    K.skel(-20.1, 0, -28.25, PI, "seated");
    K.skel(-17.9, 0, -23.25, PI, "seated");
    K.skel(-8.4, 0, -18.25, PI, "seated");
    K.skel(-3.1, 0, -20.6, -HP, "reaching");
    K.note("dng_note_kessler_timecard", -8.7, 0.8, -17.7, {
      name: "Timecard — R. Levy",
      title: "KESSLER & SONS — TIMECARD No. 2211 (reverse)",
      text: "Mar 5 1967.\n\nMr. Kessler says the sirens are a drill. He says the Army wants 4,000 field jackets by Tuesday, Sunday or no Sunday, and nobody punches out until the quota is met. Sal went to the door and it was LOCKED. From the outside.\n\nThe radio says it is not a drill.\n\nThe girls are still sewing. I think they do not know what else to do with their hands. I am writing this on my card so that when they punch it someone knows Rosa Levy worked 14 hours today and did not get paid for any of them.\n\nTell my brother Sam in the Bronx.",
    });
    K.loot("locker", -25.5, 0, -12.9, -HP, { loot: "locker" });
    K.loot("toolbox", -12.2, 0.8, -27.1, 0, { loot: "toolbox" });
    K.loot("file_cabinet", -2.2, 0, -32.8, PI, { loot: "file_cabinet" });
    K.anchor("spawn1", -14, 0, -20);
    K.anchor("spawn2", -20, 0, -31);

    // ---- cutting room (collapsed ceiling) ----
    K.table(5.5, 0, -17.5, 0, 6, 1.6, { c: [0.5, 0.42, 0.32] });
    K.table(16, 0, -27, 0, 5, 1.6, { c: [0.5, 0.42, 0.32], tip: 0.2 });
    K.fabricBolts(18.4, 0, -18, HP, 5);
    K.pipe("chrome", 4.2, 0.79, -17.2, 4.8, 0.79, -17.6, 0.02, 4, {
      c: [0.6, 0.6, 0.58],
    });
    for (const z of [-17, -26]) boardedWindow(K, 20, 2.3, z, -1, 0, 2, 2.2);
    K.light("dead", 5, 4.2, -26, { alongX: true });
    K.light("tube", 16, 4.2, -17, { floor: 0, flicker: true });
    K.light("bulb", 4, 4.2, -21, { floor: 0 });
    K.litter(1.5, -30, 20, -14, 0, 20);
    K.loot("ammo_box", 11.2, 0.9, -22.5, 0.3, { loot: "ammo_box" });
    K.loot("crate", 18.8, 0, -28.9, 0, { loot: "crate", kind: "army" });
    K.anchor("spawn3", 13, 0, -16.5);

    // ---- restroom ----
    K.stalls(7.6, 13.8, -10, 1, 0, 3);
    K.sinks(8, 13, -2, -1, 0);
    K.light("tube", 10, 3.2, -6, { floor: 0, flicker: true });
    K.litter(6, -10, 14, -2, 0, 6, {
      cells: [M.MARK.STAIN, M.MARK.PUDDLE, M.MARK.GRIME],
    });
    K.loot("first_aid", 13.85, 1.3, -6, HP, { loot: "medical_cabinet" });
    K.skel(12.2, 0, -9.0, PI, "curled");

    // ---- stairwell: flight up the west half, landing, gallery over the east half ----
    K.stairs(-1.4, 1.1, -31.4, -38.4, 0, 4.2, "z", { rail: "hi" });
    K.landing(-1.5, -40, 4, -38.4, 4.2, {});
    K.landing(1.1, -38.4, 4, -33.2, 4.2, {
      support: true,
      rails: [
        [1.1, -38.4, 1.1, -33.2],
        [1.1, -33.2, 4, -33.2],
      ],
    });
    K.light("cage", -1.3, 2.6, -35, { nx: 1, nz: 0, floor: 0 });
    K.light("cage", 3.8, 6.8, -39, { nx: -1, nz: 0, floor: 4.2 });
    K.scrawl(3.85, 5.8, -35.5, -1, 0, 1.6);
    K.sign("FOREMAN", 3.83, 6.9, -36, -1, 0, 1.2);

    // ---- pattern room (upper floor): raider den ----
    K.table(9, 4.2, -42, 0, 4, 1.4, { c: [0.52, 0.45, 0.35] });
    K.table(9, 4.2, -35, 0.1, 4, 1.4, { c: [0.52, 0.45, 0.35], tip: 0.12 });
    K.box(
      "fabric",
      13.2,
      4.2,
      -45.6,
      15.6,
      4.44,
      -43.5,
      [0.45, 0.38, 0.3],
      0.5,
    );
    K.box(
      "fabric",
      13.2,
      4.2,
      -42.8,
      15.6,
      4.44,
      -40.8,
      [0.4, 0.35, 0.28],
      0.5,
    );
    K.barrel(12.6, 4.2, -38, { fire: true });
    K.cage(6, 4.2, -44, 1.6);
    K.skel(6, 4.2, -44, 0.6, "curled");
    K.shelf(15.6, 4.2, -34, HP, 3, "parts", { h: 1.8 });
    K.scrawl(4.2, 6.0, -42, 1, 0, 2.2);
    K.scrawl(15.8, 6.2, -38, -1, 0, 2.0);
    K.light("bulb", 8, 8.0, -38, { floor: 4.2, real: true });
    K.light("dead", 12, 8.0, -44, {});
    K.litter(4, -46, 16, -30, 4.2, 14, {
      cells: [M.MARK.LITTER, M.MARK.BLOOD, M.MARK.DIRT, M.MARK.STAIN],
    });
    K.loot("footlocker", 14.3, 4.2, -40.2, PI, { loot: "raider_stash" });
    K.loot("ammo_box", 5.2, 4.2, -31, 0, { loot: "ammo_box", large: true });
    K.anchor("spawn4", 9, 4.2, -38.6);
    K.anchor("spawn5", 13, 4.2, -33);
    K.note("dng_note_needles_rules", 12.1, 4.99, -35.1, {
      name: "Needles' House Rules",
      title: "RULES OF THE STITCH (read em or bleed)",
      text: "1. Needles is boss. The old man's office is Needles' office.\n2. Nobody touches the safe. Needles is \"working on the combination.\" (It is in the teletype. The machine wants a word and the word is RUTHIE, it is wrote on the blotter. Needles cant read.)\n3. The dead ladies downstairs stay where they are. They are GOOD LUCK. Whoever moved Doris is on latrine duty forever.\n4. Wanna sell jackets, you ask Needles. Army jackets = 20 scrip. Mink = 200 scrip.\n5. Anyone brings in one of them frozen sleepers alive gets double.",
      learn: "map_dng_garment_term",
    });

    // ---- foreman's office (boss) ----
    const top = K.desk(21, 4.2, -38.2, 0, {
      wood: true,
      w: 1.8,
      d: 0.9,
      clutter: true,
    });
    K.chair(21, 4.2, -37.2, 0.2, { c: [0.35, 0.2, 0.15] });
    K.terminal("dng_term_kessler", 21.4, top, -38.3, PI, {
      title: "KESSLER & SONS GARMENT CO. — FOREMAN",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 33 OFFICE TELETYPE\nLEASED 1965 · SERVICE CONTRACT No. 4471\n-Line 3-",
      lock: lockSpec({
        id: "map_dng_garment_term",
        label: "Kessler & Sons — foreman's teletype",
        passcode: "RUTHIE",
        hint: "Needles' house rules, upstairs in the pattern room.",
      }),
      entries: [
        {
          title: "Army Contract W-67-114",
          text: "Deliver: 4,000 M-1965 field jackets, olive drab, to Fort Hamilton by 3/7.\nPenalty clause: $500 per jacket short.\n\nNote (A. Kessler): We make this or we lose the building. Nobody leaves the floor.",
        },
        {
          title: "Memo: Fire Door Policy",
          text: "Effective immediately the 7th Ave fire door is to be kept LOCKED during shifts to prevent unauthorized breaks and theft of goods.\nKeys: A. Kessler, M. Brody (foreman) only.\n\n— Management",
        },
        {
          title: "Personal — To Ruth",
          text: "Ruthie, the radio says Chicago is gone. I have the keys in my hand and I cannot make myself go down there. If I open the door they will ask me why I locked it. I am a coward. Kiss the boys.\n— Morty",
        },
        {
          title: "Wall Safe — Combination",
          text: "For when I forget it again: the jacket deadline, Tuesday the 7th. 0-3-0-7.\n— M.B.",
          learn: "map_dng_garment_safe",
        },
        {
          title: "Wall Safe — Release Lock",
          text: "Safe solenoid released. The door swings open with a rusty groan.",
          action: () => unlockLoot("dng_garment", "wallsafe"),
        },
      ],
    });
    K.loot("safe", 23.72, 4.2 + 1.05, -35.2, HP, {
      loot: "wall_safe",
      wall: true,
      tag: "wallsafe",
      lock: lockSpec({
        id: "map_dng_garment_safe",
        label: "Kessler & Sons — foreman's wall safe",
        code: "0307",
        hint: "The foreman's teletype.",
      }),
    });
    K.bookcase(18.4, 4.2, -41.6, PI, 1.4);
    K.fileCabinet(23.4, 4.2, -41.3, HP, {});
    K.loot("file_cabinet", 23.4, 4.2, -40.4, HP, { loot: "file_cabinet" });
    K.box(
      "fabric",
      18,
      4.201,
      -39.8,
      23,
      4.215,
      -34.2,
      [0.45, 0.18, 0.14],
      0.5,
      8,
    );
    K.poster("long_winter", 20, 6.0, -32.12, 0, -1, 1.4, 0.7);
    K.light("bulb", 20, 7.4, -37, { floor: 4.2, real: true });
    K.anchor("boss", 20.5, 4.2, -36);
    K.anchor("spawn6", 19.5, 4.2, -34.5);
    // arrival
    K.anchor("arrival", 0, 0, -2.2, 0);
    K.anchor("exit", 0, 1.2, -0.5, 0);
  }

  // ===================================================================
  // 2. The Chelsea Arms — Maniacs, a Maniac Bruiser in the boiler room
  // ===================================================================
