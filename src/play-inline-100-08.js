// play-inline-100 08 — loot
// Lines 3055-3520 of readable/play-inline-100.pretty.js (statement-aligned).
  function buildPump(K) {
    const r = K.r;
    K.room({
      x0: -7,
      z0: -9,
      x1: 7,
      z1: 0,
      h: 3.4,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.74, 0.78, 0.72],
      fc: [0.62, 0.62, 0.6],
    });
    K.room({
      x0: -1.5,
      z0: -20,
      x1: 1.5,
      z1: -9,
      h: 3.2,
      floor: "concrete",
      wall: "concrete_panel",
      wc: [0.55, 0.6, 0.55],
      fc: [0.5, 0.5, 0.48],
    });
    const hall = K.room({
      x0: -18,
      z0: -50,
      x1: 18,
      z1: -20,
      h: 10,
      floor: "concrete",
      wall: "brick_red@emis",
      ceil: "concrete",
      wc: [0.85, 0.7, 0.62],
      fc: [0.55, 0.55, 0.52],
      cc: [0.4, 0.38, 0.36],
    });
    K.room({
      x0: 18,
      z0: -36,
      x1: 50,
      z1: -32,
      h: 3.0,
      floor: "concrete",
      wall: "concrete",
      wc: [0.5, 0.52, 0.48],
      fc: [0.4, 0.4, 0.38],
    });
    K.room({
      x0: 50,
      z0: -42,
      x1: 62,
      z1: -26,
      h: 3.6,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.6, 0.52, 0.46],
      fc: [0.46, 0.45, 0.42],
    });
    K.room({
      x0: -30,
      z0: -32,
      x1: -18,
      z1: -24,
      h: 3.2,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.72, 0.76, 0.7],
      fc: [0.62, 0.62, 0.6],
    });
    K.room({
      x0: -30,
      z0: -44,
      x1: -18,
      z1: -32,
      h: 3.2,
      floor: "wood_planks",
      wall: "plaster_stained",
      wain: "wood_planks",
      wainC: [0.4, 0.3, 0.22],
      wc: [0.6, 0.62, 0.55],
      fc: [0.52, 0.44, 0.34],
      surface: "wood",
    });
    K.door(0, 0, 1.8, 0, 2.5, { exit: true });
    K.door(0, -9, 1.4, 0, 2.3);
    K.door(0, -20, 2.0, 0, 2.8);
    K.door(18, -34, 1.4, 0, 2.3);
    K.door(50, -34, 1.4, 0, 2.3);
    K.door(-18, -28, 1.2, 0, 2.3);
    K.door(-18, -38, 1.2, 0, 2.3);
    K.build();
    exitDoor(K, 0, 0, 1.8, 2.5, {
      mat: "metal_painted",
      c: [0.35, 0.42, 0.38],
      glass: false,
    });

    // ---- control room ----
    for (const [x0, x1, wz, nz] of [
      [-6.8, -2, -8.6, 1],
      [2, 6.8, -8.6, 1],
    ]) {
      K.box(
        "metal_painted",
        x0,
        0,
        wz - 0.3 * nz,
        x1,
        1.1,
        wz + 0.5 * nz,
        [0.4, 0.5, 0.45],
        1,
      );
      K.box(
        "metal_painted",
        x0,
        1.1,
        wz - 0.3 * nz,
        x1,
        2.4,
        wz + 0.1 * nz,
        [0.38, 0.47, 0.43],
        1,
      );
      K.col(
        Math.min(x0, x1),
        0,
        Math.min(wz - 0.3 * nz, wz + 0.5 * nz),
        Math.max(x0, x1),
        1.1,
        Math.max(wz - 0.3 * nz, wz + 0.5 * nz),
        { surface: "metal" },
      );
      for (let x = x0 + 0.3; x < x1 - 0.2; x += 0.5) {
        K.cyl("chrome", x, 1.7, wz + 0.11 * nz, 0.13, 0.13, 0.03, 8, {
          c: [0.75, 0.72, 0.62],
        });
        K.box(
          r() < 0.3
            ? "neon_red@lampr"
            : r() < 0.5
              ? "neon_green@lampg"
              : "glass_dirty",
          x - 0.05,
          1.25,
          wz + 0.1 * nz,
          x + 0.05,
          1.32,
          wz + 0.13 * nz,
          [0.3, 0.3, 0.3],
          1,
        );
      }
    }
    K.sign("PUMPING STATION No. 4", 0, 2.8, -0.15, 0, -1, 3.2);
    const top = K.desk(-4.5, 0, -3.5, PI * 0.5, { w: 1.6 });
    K.chair(-3.6, 0, -3.5, HP, {});
    K.terminal("dng_term_pump", -4.2, top, -3.5, -HP, {
      title: "NYC DEPT. OF WATER — PUMPING STATION No. 4",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 33 TELETYPE\n-Municipal Utilities Line-",
      lock: lockSpec({
        id: "map_dng_pump_term",
        label: "Pumping Station No. 4 — control room teletype",
        passcode: "WETWELL",
        hint: "Walt's crossword, in the foreman's office.",
      }),
      entries: [
        {
          title: "Pump Status",
          text: "PUMP 1: OFFLINE\nPUMP 2: OFFLINE\nPUMP 3: OFFLINE (IMPELLER OBSTRUCTED — ORGANIC)\nWET WELL LEVEL: 103%\nHALL FLOOD ALARM: ACTIVE (SILENCED 1968.03.11)",
        },
        {
          title: "Foreman's Log — March 1968",
          text: "Five months since. Still pumping by hand to keep the Navy Yard basements dry, God knows why.\nSomething big is living in the wet well. It laid eggs in Pump 3. Whitey says they are crabs. Crabs don't have faces, Whitey.",
        },
        {
          title: "Foreman's Log — April 1968",
          text: "Whitey is gone. I have locked myself in the office. The workshop key is on my desk. The shotgun shells are in the workshop.\nIf the big one gets in here, at least I finished the crossword.",
        },
        {
          title: "Office Safe",
          text: "Payroll safe in the foreman's office. Combination is the day we silenced the flood alarm: 0-3-1-1.\nThere is no payroll. There is a bottle. — W.K.",
          learn: "map_dng_pump_safe",
        },
      ],
    });
    K.lockers(5.5, 0, -0.6, 0, 3);
    K.light("tube", 0, 3.4, -4.5, { floor: 0, real: true, flicker: true });
    K.litter(-7, -9, 7, 0, 0, 10);
    K.loot("locker", 6.5, 0, -5, HP, { loot: "locker" });

    // ---- corridor ----
    K.pipeRun(
      [
        [1.3, 2.9, -9],
        [1.3, 2.9, -20],
      ],
      0.1,
    );
    K.light("cage", -1.3, 2.4, -15, { nx: 1, nz: 0, floor: 0 });
    for (let i = 0; i < 4; i++)
      K.decal(
        r.range(-1, 1),
        0.013,
        r.range(-19, -10),
        1,
        1.4,
        r() * 6,
        M.MARK.PUDDLE,
      );

    // ---- pump hall (boss) ----
    K.water(-17.9, -49.9, 17.9, -21.5, 0.07);
    for (const x of [-9, 0, 9]) K.pump(x - 2, 0, -36, 1.2);
    for (let z = -48; z <= -24; z += 6)
      K.beam("rust", -18, 9.2, z, 18, 9.2, z, 0.35, 0.6, {
        c: [0.45, 0.38, 0.32],
      });
    // gantry crane on rails with a hook
    K.beam("rust", -17.5, 8.4, -44, 17.5, 8.4, -44, 0.5, 0.8, {
      c: [0.7, 0.55, 0.2],
    });
    K.beam("rust", -17.5, 8.4, -28, 17.5, 8.4, -28, 0.5, 0.8, {
      c: [0.7, 0.55, 0.2],
    });
    K.beam("rust", 4, 8.0, -44, 4, 8.0, -28, 0.6, 0.6, { c: [0.7, 0.55, 0.2] });
    K.pipe("rust", 4, 7.7, -38, 4, 3.5, -38, 0.02, 3, { c: [0.3, 0.3, 0.3] });
    K.obox("rust", 4, 3.3, -38, 0.3, 0.5, 0.15, 0, { c: [0.4, 0.35, 0.3] });
    K.pipeRun(
      [
        [-17.6, 1.2, -22],
        [-17.6, 1.2, -49.5],
        [17.6, 1.2, -49.5],
      ],
      0.35,
      { c: [0.35, 0.4, 0.36], mat: "metal_painted" },
    );
    K.pipeRun(
      [
        [-17.5, 6.5, -21],
        [17.5, 6.5, -21],
      ],
      0.25,
    );
    for (const z of [-26, -34, -42]) {
      K.light("cage", 17.8, 5.5, z, {
        nx: -1,
        nz: 0,
        floor: 0,
        real: z === -34,
      });
      K.light(z === -42 ? "red" : "cage", -17.8, 5.5, z, {
        nx: 1,
        nz: 0,
        floor: 0,
      });
    }
    // hanging work lights on long drops over the pumps (the hall must read in the dark) + the old sodium floods
    for (const [x, z] of [
      [-9, -30],
      [0, -26],
      [9, -30],
      [-9, -42],
      [9, -42],
    ])
      K.light("tubes2", x, 10, z, {
        floor: 0,
        drop: 3.5,
        alive: true,
        real: x === 0 || (x === -9 && z === -42),
        flicker: x === 9 && z === -42,
      });
    for (const [x, z] of [
      [-12, -47],
      [12, -24],
    ]) {
      K.box(
        "emissive_window@lamp",
        x - 0.3,
        8.9,
        z - 0.2,
        x + 0.3,
        9.2,
        z + 0.2,
        [1, 0.8, 0.5],
        1,
      );
      M.lightCone(
        K.b("my/lightfx"),
        x,
        8.9,
        z,
        x * 0.6,
        0.05,
        z + (z < -35 ? 4 : -4),
        0.4,
        3.5,
        [0.09, 0.07, 0.035],
      );
      M.lightPool(
        K.b("my/lightfx"),
        x * 0.6,
        0.1,
        z + (z < -35 ? 4 : -4),
        4.5,
        4.5,
        [0.14, 0.11, 0.06],
      );
    }
    // the nest: egg clutches, shells, the pest-control crew
    for (let i = 0; i < 18; i++) {
      const x = r.range(-15, 15),
        z = r.range(-48, -40);
      K.cyl("bone", x, 0, z, 0.22, 0.18, 0.36, 8, {
        capTop: true,
        c: [0.75, 0.72, 0.55],
      });
    }
    for (let i = 0; i < 6; i++)
      K.obox(
        "bone",
        r.range(-15, 15),
        0.1,
        r.range(-48, -24),
        r.range(0.6, 1.1),
        0.18,
        r.range(0.5, 0.8),
        r() * 6,
        { pitch: r.range(-0.4, 0.4), c: [0.55, 0.4, 0.3], s: 0.5 },
      );
    K.skel(-12, 0, -46, 0.8, "lying");
    K.skel(14, 0, -24.5, -2, "reaching");
    K.rubbleMound(13, 0, -47, 2.6, 1.0);
    K.loot("ammo_box", 15.5, 0, -48.8, HP, { loot: "ammo_box", large: true });
    K.loot("toolbox", -16.6, 0, -21.2, -HP, { loot: "toolbox", chest: true });
    K.anchor("spawn1", -10, 0, -26);
    K.anchor("spawn2", 10, 0, -27);
    K.anchor("spawn3", -12, 0, -42);
    K.anchor("spawn6", 3, 0, -45);
    K.anchor("boss", 3, 0, -45);

    // ---- tunnel ----
    K.grate(18, -34.4, 50, -33.6, 0);
    K.pipeRun(
      [
        [18, 2.5, -35.6],
        [50, 2.5, -35.6],
      ],
      0.2,
    );
    K.pipeRun(
      [
        [18, 2.1, -35.7],
        [50, 2.1, -35.7],
      ],
      0.08,
      { mat: "metal_painted", c: [0.25, 0.35, 0.5] },
    );
    for (const x of [26, 42])
      K.light("cage", x, 2.3, -32.2, { nx: 0, nz: -1, floor: 0 });
    K.water(18.1, -35.9, 50, -32.1, 0.05);
    K.anchor("spawn4", 34, 0, -34);

    // ---- workshop ----
    K.table(56, 0, -41, 0, 4, 1, {
      mat: "metal_painted",
      c: [0.4, 0.42, 0.38],
    });
    K.box(
      "metal_painted",
      58,
      0.76,
      -41.2,
      58.6,
      1.1,
      -40.8,
      [0.5, 0.2, 0.15],
      1,
    );
    K.shelf(61.5, 0, -34, HP, 6, "parts", { h: 2.2, d: 0.6 });
    K.shelf(51, 0, -30, -HP, 4, "parts", { h: 2.2, d: 0.6 });
    K.barrel(52, 0, -40.8, {});
    K.barrel(52.8, 0, -41.2, {});
    K.light("bulb", 56, 3.6, -34, { floor: 0, real: true });
    K.light("dead", 56, 3.6, -29, {});
    K.litter(50, -42, 62, -26, 0, 10);
    K.loot("toolbox", 54.5, 0.76, -41.1, 0, {
      loot: "toolbox",
      lock: lockSpec({
        id: "map_dng_pump_toolbox",
        label: "Pumping Station No. 4 — workshop tool chest",
        key: "map_key_pump_workshop",
        hint: "Walt's desk in the foreman's office.",
      }),
    });
    K.loot("ammo_box", 60.8, 0, -27.2, HP, { loot: "ammo_box" });
    K.loot("crate", 58.8, 0, -27, 0, {
      loot: "weapon_crate",
      kind: "army",
      lock: lockSpec({
        id: "map_dng_pump_crate",
        label: "Pumping Station No. 4 — workshop shell crate",
        key: "map_key_pump_workshop",
        hint: "Walt's desk in the foreman's office.",
      }),
    });
    K.anchor("spawn5", 56, 0, -33);

    // ---- locker room ----
    K.lockers(-24, 0, -31.6, PI, 8);
    K.box(
      "wood_planks",
      -27,
      0.42,
      -28.3,
      -21,
      0.47,
      -27.7,
      [0.55, 0.42, 0.3],
      1,
    );
    K.col(-27, 0, -28.3, -21, 0.47, -27.7, { surface: "wood" });
    for (let x = -29; x < -26; x += 1.2)
      K.pipe("chrome", x, 3.2, -24.3, x, 2.2, -24.6, 0.02, 4, {
        c: [0.6, 0.6, 0.58],
      });
    K.light("tube", -24, 3.2, -28, { floor: 0, flicker: true });
    K.loot("locker", -19.5, 0, -24.6, 0, { loot: "locker" });
    K.loot("first_aid", -29.85, 1.3, -26, -HP, { loot: "first_aid" });

    // ---- foreman's office ----
    const top2 = K.desk(-24, 0, -41.6, 0, { wood: true, w: 1.6 });
    K.chair(-24, 0, -40.7, 0, {});
    K.skel(-24, 0, -40.75, 0, "seated");
    K.note("dng_note_crossword", -23.6, top2, -41.8, {
      name: "Crossword (finished)",
      title: "The Brooklyn Eagle — Sunday Crossword",
      text: 'Every square filled in, in careful block capitals.\n\n14 ACROSS: "Crustacean that walks sideways" (4) — CRAB\n22 DOWN: "What you do when the water rises" (4,3) — PUMP OUT\n31 ACROSS: "Leave in a hurry" (4) — FLEE\n\nIn the margin: "Workshop key: on the desk. Shells: the crate in the workshop. Teletype word: WETWELL. Don\'t go in the hall at night. — Walt"',
      learn: "map_dng_pump_term",
    });
    placeKey(K, "map_key_pump_workshop", -24.6, top2, -41.4);
    K.loot("desk", -20.6, 0, -43.2, PI, { loot: "desk", name: "Walt's Desk" });
    K.loot("safe", -29.72, 1.05, -38, -HP, {
      loot: "wall_safe",
      wall: true,
      tag: "wallsafe",
      lock: lockSpec({
        id: "map_dng_pump_safe",
        label: "Pumping Station No. 4 — foreman's wall safe",
        code: "0311",
        hint: "The control room teletype.",
      }),
    });
    K.fileCabinet(-19, 0, -33, 0, {});
    K.bookcase(-28.5, 0, -32.4, 0, 1.4);
    K.light("bulb", -24, 3.2, -38, { floor: 0 });
    K.anchor("arrival", 0, 0, -2.2, 0);
    K.anchor("exit", 0, 1.2, -0.5, 0);
    void hall;
  }

  // ===================================================================
  // Build all
  // ===================================================================
