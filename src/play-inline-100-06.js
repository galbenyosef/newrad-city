// play-inline-100 06 — range
// Lines 2052-2614 of readable/play-inline-100.pretty.js (statement-aligned).
  function buildMetro(K) {
    const r = K.r,
      MZ = 4.5,
      PF = 1.2;
    const tile = { wall: "tile_subway", wc: [0.82, 0.8, 0.72] };
    K.room(
      Object.assign(
        {
          x0: -10,
          z0: -12,
          x1: 10,
          z1: 0,
          y: MZ,
          h: 3.4,
          floor: "tile_floor",
          fc: [0.62, 0.6, 0.55],
          ceil: "concrete",
        },
        tile,
      ),
    );
    K.room({
      x0: -10,
      z0: -16,
      x1: -2,
      z1: -12,
      y: MZ,
      h: 3.0,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.76, 0.78, 0.74],
      fc: [0.7, 0.7, 0.66],
    });
    K.room(
      Object.assign(
        {
          x0: 10,
          z0: -16,
          x1: 16,
          z1: 0,
          y: PF,
          h: 6.7,
          floor: "concrete",
          fc: [0.55, 0.55, 0.52],
        },
        tile,
        { wc: [0.7, 0.68, 0.6] },
      ),
    );
    K.room(
      Object.assign(
        {
          x0: -40,
          z0: -36,
          x1: 40,
          z1: -16,
          y: 0,
          h: 6,
          floor: "rubble",
          fc: [0.5, 0.48, 0.44],
          ceil: "concrete",
        },
        tile,
      ),
    );
    K.room({
      x0: 40,
      z0: -24,
      x1: 70,
      z1: -18,
      y: PF,
      h: 3.0,
      floor: "concrete",
      wall: "concrete",
      wc: [0.5, 0.5, 0.46],
      fc: [0.42, 0.42, 0.4],
    });
    const larder = K.room({
      x0: 70,
      z0: -32,
      x1: 90,
      z1: -10,
      y: PF,
      h: 5,
      floor: "concrete",
      wall: "tile_subway",
      wc: [0.55, 0.5, 0.44],
      fc: [0.4, 0.38, 0.35],
      cc: [0.3, 0.3, 0.28],
    });
    K.room({
      x0: -52,
      z0: -24,
      x1: -40,
      z1: -16,
      y: PF,
      h: 3.2,
      floor: "concrete",
      wall: "concrete",
      wc: [0.55, 0.56, 0.5],
      fc: [0.45, 0.45, 0.42],
    });
    K.door(0, 0, 2.4, MZ, 2.6, { exit: true });
    K.door(10, -6, 1.6, MZ, 2.4);
    K.door(-6, -12, 1.2, MZ, 2.2);
    K.door(13, -16, 2.0, PF, 2.6);
    K.door(40, -21, 1.6, PF, 2.4);
    K.door(70, -21, 1.8, PF, 2.4);
    K.door(-40, -20, 1.4, PF, 2.3);
    K.build();
    exitDoor(K, 0, MZ, 2.4, 2.6, {
      mat: "metal_painted",
      c: [0.3, 0.4, 0.32],
      glass: false,
    });
    // station end walls (x = ±40) above the tunnel mouths, the tunnel mouths themselves and their cave-ins
    for (const sd of [-1, 1]) {
      const x = sd * 40;
      // the black mouth of the tunnel over the track bed (the end wall behind it is solid)
      M.quad(
        K.b("glass_dirty"),
        [x - sd * 0.12, 0, -26.1],
        [x - sd * 0.12, 0, -35.8],
        [x - sd * 0.12, 4.2, -35.8],
        [x - sd * 0.12, 4.2, -26.1],
        [-sd, 0, 0],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.02, 0.02, 0.02],
      );
      K.beam(
        "concrete",
        x - sd * 0.2,
        4.35,
        -35.9,
        x - sd * 0.2,
        4.35,
        -26,
        0.3,
        0.3,
        { c: [0.45, 0.44, 0.42] },
      );
      for (let k = 0; k < 10; k++)
        K.obox(
          r() < 0.5 ? "concrete" : "rubble",
          x - sd * r.range(0.5, 3),
          r.range(0.3, 2.5),
          r.range(-35.5, -26.5),
          r.range(1, 2.4),
          r.range(0.6, 1.4),
          r.range(1, 2),
          r() * 6,
          {
            pitch: r.range(-0.6, 0.6),
            roll: r.range(-0.6, 0.6),
            c: [0.5, 0.48, 0.45],
          },
        );
      K.col(
        Math.min(x, x - sd * 3.5),
        0,
        -36,
        Math.max(x, x - sd * 3.5),
        1.4,
        -26,
        { tag: "rubble", surface: "rubble" },
      );
    }

    // ---- mezzanine ----
    K.box(
      "metal_painted",
      -8,
      MZ,
      -6,
      -4.5,
      MZ + 1.1,
      -3.5,
      [0.35, 0.45, 0.4],
      1,
    );
    K.box(
      "glass_dirty",
      -8,
      MZ + 1.1,
      -6,
      -4.5,
      MZ + 2.3,
      -3.5,
      [0.45, 0.5, 0.48],
      1,
    );
    K.box(
      "metal_painted",
      -8.1,
      MZ + 2.3,
      -6.1,
      -4.4,
      MZ + 2.5,
      -3.4,
      [0.3, 0.35, 0.32],
      1,
    );
    K.col(-8, MZ, -6, -4.5, MZ + 2.5, -3.5, { surface: "metal" });
    for (let x = -3.5; x <= 8.5; x += 1.3) {
      if (Math.abs(x - 1.7) < 0.7 || Math.abs(x - 5.6) < 0.7) continue;
      K.box(
        "chrome",
        x - 0.22,
        MZ,
        -8.3,
        x + 0.22,
        MZ + 0.95,
        -7.9,
        [0.6, 0.6, 0.58],
        1,
      );
      K.col(x - 0.22, MZ, -8.3, x + 0.22, MZ + 0.95, -7.9, {
        surface: "metal",
      });
    }
    K.sign("FULTON ST", 0, MZ + 2.7, -11.85, 0, 1, 3);
    K.sign("DOWNTOWN", 9.85, MZ + 2.6, -3, -1, 0, 2);
    K.poster("fizzo_cola", -9.85, MZ + 1.6, -8.5, 1, 0, 2.2, 1.1);
    K.poster("super_sergeant", 6, MZ + 1.6, -0.15, 0, -1, 2.2, 1.1);
    for (const [x, z] of [
      [-5, -9],
      [5, -3],
      [0, -9],
    ])
      K.light(r() < 0.3 ? "dead" : "tube", x, MZ + 3.4, z, {
        floor: MZ,
        flicker: r() < 0.4,
      });
    K.litter(-10, -12, 10, 0, MZ, 18);
    K.decal(3, MZ + 0.014, -10, 2, 3, 0.4, M.MARK.BLOOD);
    K.loot("cash_register", -6.2, MZ + 1.1, -3.9, 0, {
      loot: "cash_register",
      name: "Token Booth Drawer",
    });
    // station restroom
    K.stalls(-9.6, -2.4, -16, 1, MZ, 3);
    K.light("dead", -6, MZ + 3.0, -14, {});
    K.skel(-3.4, MZ, -13, -HP, "curled");
    K.loot("first_aid", -2.15, MZ + 1.3, -13.6, HP, { loot: "first_aid" });

    // ---- stair down to the platform ----
    K.landing(10, -7.5, 16, -4.5, MZ, {
      rails: [
        [10, -4.5, 16, -4.5],
        [13.4, -7.5, 16, -7.5],
      ],
    });
    K.stairs(10.1, 13.4, -7.5, -13.5, MZ, PF, "z", {
      rail: "hi",
      mat: "concrete",
    });
    K.light("cage", 15.8, 5.2, -11, { nx: -1, nz: 0, floor: PF });
    K.sign("DOWNTOWN", 13, PF + 3.0, -15.85, 0, 1, 1.8);

    // ---- platform & track bed ----
    K.box("concrete", -40, 0, -26, 40, PF, -16, [0.6, 0.58, 0.54], 3, 0);
    K.col(-40, 0, -26, 40, PF, -16, { tag: "floor", surface: "concrete" });
    K.box(
      "cryo_orange",
      -40,
      PF,
      -26,
      40,
      PF + 0.01,
      -25.4,
      [0.9, 0.85, 0.6],
      2,
    );
    for (const rz of [-31.7, -30.3])
      K.box(
        "rust",
        -40,
        0.12,
        rz - 0.04,
        40,
        0.28,
        rz + 0.04,
        [0.75, 0.62, 0.5],
        2,
      );
    K.box(
      "wood_rotten",
      -40,
      0,
      -32.2,
      40,
      0.12,
      -29.8,
      [0.45, 0.38, 0.3],
      1.2,
    );
    K.box(
      "metal_painted",
      -40,
      0.2,
      -28.6,
      40,
      0.38,
      -28.45,
      [0.35, 0.33, 0.3],
      2,
    );
    for (let x = -36; x <= 36; x += 6) {
      column(K, x, PF, -24.2, 6 - PF, { c: [0.25, 0.3, 0.26] });
    }
    // a derailed train car on the track, doors burst, blocking half the bed
    const car = M.mtx(-12, 0.2, -31, HP + 0.08, 0, 0.14);
    M.pushXF(car);
    M.box(K.b("corrugated"), -1.5, 0.3, -8, 1.5, 3.4, 8, {
      s: 2,
      c: [0.72, 0.74, 0.76],
    });
    M.box(K.b("glass_dirty"), -1.52, 1.9, -7.5, 1.52, 2.7, 7.5, {
      s: 2,
      c: [0.1, 0.1, 0.1],
      skip: 4 + 8,
    });
    M.box(K.b("paint_red"), -1.53, 1.6, -8, 1.53, 1.75, 8, {
      s: 1,
      c: [0.6, 0.18, 0.15],
      skip: 4 + 8,
    });
    M.popXF();
    K.ocol(-12, -31, 16.2, 3.2, 0, 3.6, HP + 0.08, {
      tag: "debris",
      surface: "metal",
    });
    // benches, trash cans, direction signs, Brute barricades
    for (const x of [-30, -20, 22, 32]) {
      K.box(
        "wood_planks",
        x - 1.2,
        PF + 0.42,
        -21.5,
        x + 1.2,
        PF + 0.47,
        -20.5,
        [0.55, 0.42, 0.3],
        1,
      );
      K.col(x - 1.2, PF, -21.5, x + 1.2, PF + 0.5, -20.5, { surface: "wood" });
    }
    for (let i = 0; i < 3; i++) {
      const x = r.range(-20, 20);
      K.crate(x, PF, -19 + r.range(-1, 1), r() * 3, 1.0);
    }
    for (let x = -34; x <= 34; x += 12)
      K.sign(x < 0 ? "UPTOWN" : "DOWNTOWN", x, 4.4, -24.2, 0, 1, 2.2);
    for (let x = -30; x <= 30; x += 10)
      K.light(r() < 0.35 ? "dead" : "tube", x, 6, -21, {
        floor: PF,
        flicker: r() < 0.3,
        real: x === 0,
      });
    for (let x = -34; x <= 34; x += 17)
      K.light("cage", x, 3.6, -35.8, { nx: 0, nz: 1, floor: 0 });
    K.litter(-40, -26, 40, -16, PF, 30, {
      cells: [
        M.MARK.LITTER,
        M.MARK.STAIN,
        M.MARK.DIRT,
        M.MARK.BLOOD,
        M.MARK.CRACKS,
      ],
    });
    for (let i = 0; i < 14; i++)
      K.decal(
        r.range(-38, 38),
        0.013,
        r.range(-35, -27),
        r.range(1, 2.5),
        r.range(1, 2.5),
        r() * 6,
        r.pick([M.MARK.PUDDLE, M.MARK.LITTER, M.MARK.STAIN]),
      );
    K.skel(-26, PF, -18, 0.4, "lying");
    K.skel(8, 0, -33, 2.2, "reaching");
    K.loot("trash_can", 18, PF, -17.2, 0, { loot: "trash_can" });
    K.anchor("spawn1", -10, PF, -21);
    K.anchor("spawn2", 20, PF, -20);
    K.anchor("spawn3", 4, 0, -31);

    // ---- maintenance tunnel east ----
    K.grate(40, -21.5, 70, -20.5, PF);
    K.pipeRun(
      [
        [40, PF + 2.5, -23.6],
        [70, PF + 2.5, -23.6],
      ],
      0.16,
    );
    K.pipeRun(
      [
        [40, PF + 2.0, -23.7],
        [70, PF + 2.0, -23.7],
      ],
      0.06,
      { mat: "metal_painted", c: [0.5, 0.2, 0.15] },
    );
    for (const x of [48, 62])
      K.light("cage", x, PF + 2.3, -18.2, { nx: 0, nz: -1, floor: PF });
    for (let i = 0; i < 5; i++)
      K.decal(
        r.range(41, 69),
        PF + 0.013,
        r.range(-23, -19),
        1.2,
        1,
        r() * 6,
        r.pick([M.MARK.PUDDLE, M.MARK.BLOOD]),
      );
    K.sign("DANGER — HIGH VOLTAGE", 40.2, PF + 2.5, -19, 1, 0, 1.6);
    K.anchor("spawn4", 55, PF, -21);

    // ---- the larder (boss room: old traction substation) ----
    for (let i = 0; i < 12; i++)
      K.meatSack(r.range(72, 88), PF + 5, r.range(-30, -12));
    K.cage(74, PF, -29, 2.0);
    K.cage(77, PF, -29, 2.0);
    K.skel(74, PF, -29, 0.5, "curled");
    K.box("fabric", 84, PF, -14, 87, PF + 0.3, -11.5, [0.35, 0.3, 0.22], 0.5);
    K.box("fabric", 80, PF, -12.2, 83, PF + 0.3, -10.4, [0.3, 0.28, 0.2], 0.5);
    K.barrel(80, PF, -21, { fire: true });
    K.barrel(86, PF, -27, {});
    for (let i = 0; i < 4; i++)
      K.rubbleMound(
        r.range(76, 88),
        PF,
        r.range(-30, -14),
        r.range(0.8, 1.4),
        0.4,
      ); // bone piles
    K.box(
      "metal_painted",
      86.5,
      PF,
      -31.5,
      89.8,
      PF + 3,
      -29,
      [0.3, 0.32, 0.3],
      1,
    );
    K.col(86.5, PF, -31.5, 89.8, PF + 3, -29, { surface: "metal" });
    K.sign("DANGER — HIGH VOLTAGE", 88, PF + 3.4, -28.9, 0, 1, 1.6);
    K.light("cage", 70.2, PF + 3.5, -14, {
      nx: 1,
      nz: 0,
      floor: PF,
      real: true,
    });
    K.light("red", 89.8, PF + 3.5, -20, { nx: -1, nz: 0, floor: PF });
    K.litter(70, -32, 90, -10, PF, 26, {
      cells: [
        M.MARK.BLOOD,
        M.MARK.BLOOD,
        M.MARK.DIRT,
        M.MARK.STAIN,
        M.MARK.LITTER,
      ],
    });
    K.scrawl(89.8, PF + 2, -16, -1, 0, 3);
    K.loot("footlocker", 88.5, PF, -12.5, HP, {
      loot: "brute",
      name: "Brute Stash",
    });
    K.loot("ammo_box", 72, PF, -11, -HP, { loot: "ammo_box", large: true });
    K.loot("crate", 88.5, PF, -24, HP, {
      loot: "weapon_crate",
      kind: "military",
      lock: lockSpec({
        id: "map_dng_metro_crate",
        label: "Fulton Street — the Covenant scouts' gear crate",
        code: "0709",
        hint: "Acolyte Paulson's field notebook, by the cages.",
      }),
    });
    K.note("dng_note_paulson", 74.9, PF, -27.9, {
      name: "Field Notebook — Paulson",
      title: "Iron Covenant field notebook — Acolyte J. Paulson (pencil)",
      text: 'Day 3 in the pen. They feed us the ones who stop moving. Acolyte Carr stopped moving yesterday.\n\nThe big one — they call him "Conductor" — keeps saying the trains will run again when the station is "full." I think he means full of us.\n\nThey threw our gear crate by the transformer. The padlock is Carr\'s birthday, 0-7-0-9. Whoever reads this: take it, use it on them.\n\nIf Rockefeller gets this: the Brutes come up through the Fulton St. stairs at night. Seal it. Don\'t send another two-man team. Send the Lancers or send nobody.\n\nSteel keeps.',
      learn: "map_dng_metro_crate",
    });
    K.anchor("spawn5", 80, PF, -15);
    K.anchor("spawn6", 82, PF, -25);
    K.anchor("boss", 82, PF, -25);

    // ---- signal room west ----
    for (let x = -50.5; x < -42; x += 1.4) {
      K.box(
        "metal_painted",
        x - 0.6,
        PF,
        -23.6,
        x + 0.6,
        PF + 2.1,
        -23,
        [0.35, 0.38, 0.34],
        1,
      );
      for (let y = 0.5; y < 2; y += 0.35)
        K.box(
          K.r() < 0.3 ? "neon_red@lampr" : "glass_dirty",
          x - 0.3,
          PF + y,
          -23.02,
          x - 0.2,
          PF + y + 0.08,
          -22.98,
          [0.3, 0.3, 0.3],
          1,
        );
    }
    K.col(-51.2, PF, -23.6, -41.5, PF + 2.1, -23, { surface: "metal" });
    const top = K.desk(-47, PF, -17.3, PI, { w: 1.6 });
    K.note("dng_note_signal_card", -46.4, top, -17.5, {
      name: "Signalman's Shift Card",
      title: "N.Y.C. TRANSIT AUTHORITY — SIGNAL DIV. SHIFT CARD",
      text: "Tower: FULTON ST.   Shift: 4 P.M. – 12 A.M.\nSignalman: T. Okafor\n\nTeletype sign-on (changes 1st of month): BOWLINGGREEN\nDo not leave this card at the desk.\n\n(on the back:)\nLeft it at the desk. Sorry Sal.",
      learn: "map_dng_metro_term",
    });
    K.terminal("dng_term_metro", -47.3, top, -17.2, 0, {
      title: "TRANSIT AUTHORITY SIGNAL MAINTENANCE — FULTON ST",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 33 TELETYPE\n-Transit Signal Division-",
      lock: lockSpec({
        id: "map_dng_metro_term",
        label: "Fulton Street — signal room teletype",
        passcode: "BOWLINGGREEN",
        hint: "The signalman's shift card on the desk.",
      }),
      entries: [
        {
          title: "Incident 03/05/67",
          text: "All trains held at stations per Civil Defense Order 7. Passengers instructed to remain on platforms (SHELTER CAPACITY: 300).\nTunnel doors sealed 09:52.",
        },
        {
          title: "Incident 03/11/67",
          text: "Water from the East River in the south tunnel. Pumps offline. Platform population now approx. 120.\nSomeone has started a fire in the substation. Nobody will say what they are cooking.",
        },
        {
          title: "Incident 03/02/89 (auto-log)",
          text: "MOTION DETECTED: SUBSTATION. MOTION DETECTED: SUBSTATION. MOTION DETECTED: SUBSTATION.\n[log buffer full]",
        },
      ],
    });
    K.lockers(-45, PF, -16.4, 0, 3);
    K.light("bulb", -46, PF + 3.2, -20, { floor: PF, real: true });
    K.loot("toolbox", -51.3, PF, -18, -HP, { loot: "toolbox" });
    K.loot("locker", -43.2, PF, -16.5, 0, { loot: "locker" });
    K.anchor("arrival", 0, MZ, -2.2, 0);
    K.anchor("exit", 0, MZ + 1.2, -0.5, 0);
    void larder;
  }

  // ===================================================================
  // 5. Big Apple Food Fair — raiders in a supermarket
  // ===================================================================
