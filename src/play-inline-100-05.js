// play-inline-100 05 — loot
// Lines 1575-2051 of readable/play-inline-100.pretty.js (statement-aligned).
  function buildBank(K) {
    const r = K.r;
    const hall = K.room({
      x0: -12,
      z0: -20,
      x1: 12,
      z1: 0,
      h: 7,
      floor: "marble",
      wall: "stone_limestone",
      wain: "marble_dark",
      wainH: 1.4,
      wainC: [0.4, 0.4, 0.38],
      ceil: "plaster_stained",
      wc: [0.8, 0.76, 0.68],
      fc: [0.78, 0.75, 0.7],
      cc: [0.62, 0.58, 0.52],
    });
    const offices = K.room({
      x0: 12,
      z0: -20,
      x1: 36,
      z1: 0,
      h: 3.8,
      floor: "carpet",
      wall: "plaster_stained",
      wc: [0.72, 0.7, 0.62],
      fc: [0.35, 0.38, 0.42],
      surface: "carpet",
      hole: { x0: 26, z0: -12, x1: 31, z1: -6 },
    });
    K.room({
      x0: -1.5,
      z0: -32,
      x1: 1.5,
      z1: -20,
      h: 3.4,
      floor: "marble",
      wall: "plaster_stained",
      wain: "wood_planks",
      wainC: [0.4, 0.3, 0.2],
      wc: [0.7, 0.66, 0.58],
      fc: [0.7, 0.68, 0.62],
    });
    const rec = K.room({
      x0: -16,
      z0: -32,
      x1: -1.5,
      z1: -20,
      h: 3.4,
      floor: "tile_floor",
      wall: "plaster_stained",
      wc: [0.68, 0.66, 0.6],
      fc: [0.6, 0.58, 0.54],
    });
    K.room({
      x0: 1.5,
      z0: -28,
      x1: 9,
      z1: -20,
      h: 3.2,
      floor: "tile_floor",
      wall: "tile_subway",
      wc: [0.78, 0.8, 0.76],
      fc: [0.75, 0.74, 0.7],
    });
    const mgr = K.room({
      x0: 9,
      z0: -32,
      x1: 20,
      z1: -20,
      h: 3.4,
      floor: "carpet",
      wall: "wallpaper",
      wain: "wood_planks",
      wainC: [0.35, 0.24, 0.16],
      wc: [0.55, 0.62, 0.52],
      fc: [0.42, 0.18, 0.15],
      surface: "carpet",
    });
    K.room({
      x0: -6,
      z0: -44,
      x1: 6,
      z1: -32,
      h: 3.4,
      floor: "terrazzo",
      wall: "concrete_panel",
      wc: [0.62, 0.64, 0.6],
      fc: [0.62, 0.6, 0.56],
    });
    const strong = K.room({
      x0: -9,
      z0: -62,
      x1: 9,
      z1: -44,
      h: 4.2,
      floor: "metal_diamond",
      wall: "metal_panel",
      ceil: "metal_panel",
      wc: [0.62, 0.62, 0.58],
      fc: [0.55, 0.55, 0.52],
      cc: [0.45, 0.45, 0.43],
      surface: "metal",
    });
    K.door(0, 0, 2.4, 0, 3.2, { exit: true });
    K.door(12, -10, 1.6, 0, 2.6);
    K.door(0, -20, 1.4, 0, 2.4);
    K.door(-1.5, -26, 1.2, 0, 2.3);
    K.door(1.5, -24, 1.0, 0, 2.2);
    K.door(9, -30, 1.1, 0, 2.3);
    K.door(15, -20, 1.2, 0, 2.4);
    K.door(0, -32, 1.6, 0, 2.4);
    K.door(0, -44, 3.0, 0, 3.0);
    K.build();
    exitDoor(K, 0, 0, 2.4, 3.2, { mat: "bronze", c: [0.55, 0.45, 0.3] });

    // ---- banking hall ----
    for (const x of [-8, -4, 4, 8])
      for (const z of [-4, -10]) {
        K.cyl("marble", x, 0, z, 0.45, 0.42, 7, 12, { c: [0.8, 0.78, 0.72] });
        K.cyl("marble", x, 0, z, 0.6, 0.6, 0.5, 12, {
          c: [0.7, 0.68, 0.62],
          capTop: true,
        });
        K.col(x - 0.5, 0, z - 0.5, x + 0.5, 7, z + 0.5, {
          tag: "column",
          surface: "concrete",
        });
      }
    // teller counter with brass grilles (gate at x 8..10.5)
    K.counter(-11.9, -15, 8, -14, 0, {
      h: 1.15,
      c: [0.4, 0.3, 0.22],
      top: "marble",
      topC: [0.7, 0.68, 0.62],
    });
    for (let x = -11.5; x < 8; x += 0.18)
      K.pipe("bronze", x, 1.15, -14.5, x, 2.4, -14.5, 0.012, 3, {
        c: [0.6, 0.48, 0.28],
      });
    K.beam("bronze", -11.9, 2.42, -14.5, 8, 2.42, -14.5, 0.06, 0.06, {
      c: [0.6, 0.48, 0.28],
    });
    K.col(-11.9, 1.15, -14.55, 8, 2.45, -14.45, {
      tag: "grille",
      surface: "metal",
    });
    K.sign("TELLERS", -2, 3.0, -14.5, 0, 1, 2.0);
    K.sign("DUNMORE MUTUAL TRUST", 0, 5.6, -19.85, 0, 1, 5.0);
    for (const x of [-8, -2])
      K.table(x, 0, -8, 0, 2.2, 0.8, { c: [0.35, 0.25, 0.18], h: 1.05 });
    for (let i = 0; i < 6; i++) {
      const x = -9 + i * 3.4;
      K.cyl("bronze", x, 0, -2.2, 0.15, 0.12, 1.0, 8, {
        c: [0.6, 0.48, 0.28],
        capTop: true,
      });
      if (i < 5 && r() < 0.7)
        K.pipe("fabric", x, 0.95, -2.2, x + 3.4, 0.7, -2.2, 0.03, 4, {
          c: [0.5, 0.12, 0.1],
        });
    }
    // fallen chandelier
    K.cyl("bronze", 3, 0.05, -12, 1.2, 0.8, 0.5, 10, { c: [0.5, 0.42, 0.26] });
    K.pipe("bronze", 3, 0.5, -12, 4.5, 0.2, -13, 0.02, 3, {
      c: [0.5, 0.42, 0.26],
    });
    for (let i = 0; i < 12; i++)
      K.decal(
        3 + r.range(-2, 2),
        0.013,
        -12 + r.range(-2, 2),
        0.5,
        0.5,
        r() * 6,
        M.MARK.CRACKS,
      );
    K.pipe("metal_painted", 3, 7, -12, 3, 4.5, -12, 0.015, 3, {
      c: [0.3, 0.3, 0.3],
    });
    for (const [x, z] of [
      [-6, -6],
      [6, -6],
      [-6, -16],
      [6, -16],
    ])
      K.light("tubes2", x, 7, z, { floor: 0, drop: 1.5, alive: r() < 0.6 });
    K.litter(-12, -20, 12, 0, 0, 28, {
      cells: [M.MARK.LITTER, M.MARK.DIRT, M.MARK.STAIN, M.MARK.CRACKS],
    });
    K.loot("cash_register", -6, 1.15, -14.7, 0, { loot: "cash_register" });
    K.loot("cash_register", 2, 1.15, -14.7, 0, { loot: "cash_register" });
    K.loot("desk", -9.8, 0, -18.8, PI, { loot: "desk" });
    K.skel(-3, 0, -3.5, 0.8, "lying");
    K.skel(5.4, 0, -18.4, 2.2, "sitting");
    placeKey(K, "map_key_dmt_guard", 5.9, 0, -18.0); // the guard by the tellers still has his key ring
    K.anchor("spawn1", -4, 0, -17);
    K.anchor("spawn2", 4, 0, -7);
    // a wrecked robot patrolman by the door (the robots have been fighting the Maniacs for 22 years)
    K.cyl("metal_painted", -9.5, 0, -1.8, 0.35, 0.4, 1.2, 8, {
      c: [0.4, 0.42, 0.38],
      capTop: true,
    });
    K.obox("metal_painted", -9.0, 0.3, -1.1, 0.5, 0.5, 0.5, 0.6, {
      c: [0.35, 0.38, 0.36],
      roll: 0.5,
    });

    // ---- loan offices (cubicles, collapsed ceiling) ----
    cubicles(K, 13.5, -18.5, 35, -1.5, 0, {});
    K.light("tube", 16, 3.8, -4, { floor: 0, flicker: true });
    K.light("dead", 22, 3.8, -4, {});
    K.light("tube", 33, 3.8, -16, { floor: 0 });
    K.light("tube", 20, 3.8, -16, { floor: 0, real: true });
    K.litter(12, -20, 36, 0, 0, 24);
    K.loot("file_cabinet", 35.4, 0, -19.4, HP, { loot: "file_cabinet" });
    K.loot("desk", 34.2, 0, -2.5, 0, { loot: "desk" });
    K.anchor("spawn3", 24, 0, -9);

    // ---- corridor / restroom ----
    K.light("tube", 0, 3.4, -26, { floor: 0, alongX: false });
    K.stalls(3.2, 8.8, -28, 1, 0, 3);
    K.sinks(3.4, 8.6, -20, -1, 0);
    K.light("dead", 5, 3.2, -24, {});
    K.loot("first_aid", 8.85, 1.3, -22.4, HP, { loot: "first_aid" });

    // ---- records ----
    for (let x = -14.5; x < -3; x += 2.2)
      K.shelf(x, 0, -26, HP, 9, "boxes", {
        h: 2.4,
        d: 0.6,
        collapsed: r() < 0.3,
        back: false,
      });
    K.light("tube", -9, 3.4, -23, { floor: 0, flicker: true });
    K.light("dead", -9, 3.4, -29, {});
    K.litter(-16, -32, -1.5, -20, 0, 20, {
      cells: [M.MARK.LITTER, M.MARK.LITTER, M.MARK.DIRT],
    });
    K.loot("file_cabinet", -15.4, 0, -21, -HP, { loot: "file_cabinet" });

    // ---- manager's office ----
    const top = K.desk(14.5, 0, -28.5, 0, { wood: true, w: 2.0, d: 0.95 });
    K.chair(14.5, 0, -27.5, 0, { c: [0.3, 0.15, 0.1] });
    K.terminal("dng_term_bank", 14.9, top, -28.6, PI, {
      title: "DUNMORE MUTUAL TRUST — BRANCH MANAGER",
      header:
        "GOTHAM BUSINESS MACHINES — MODEL 35 BANKING TELETYPE\n-DMT Secure Branch Line-",
      lock: lockSpec({
        id: "map_dng_bank_term",
        label: "Dunmore Mutual Trust — branch manager's teletype",
        passcode: "EVELYN",
        hint: "Whitcomb's deposit slip, on his desk.",
      }),
      entries: [
        {
          title: "Security Status",
          text: 'STRONGROOM: SEALED (PROTOCOL OMEGA)\nPATROLMAN UNITS: 3 ACTIVE / ASSIGNED: LOBBY\nVALET UNIT: ACTIVE / ASSIGNED: RECORDS\nBULWARK UNIT "TELLER": ACTIVE / ASSIGNED: STRONGROOM INTERIOR\n\nDIRECTIVE: PROTECT DEPOSITOR ASSETS. NO WITHDRAWALS.',
        },
        {
          title: "Memo — Protocol Omega",
          text: "In the event of civil disorder the strongroom will be sealed from within and the robotic staff will treat ALL persons on the premises as unauthorized.\nNo exceptions. Not even for staff.\n\n— R. Dunmore III, Chairman",
        },
        {
          title: "Personal Log — G. Whitcomb",
          text: 'The Chairman\'s family is in the strongroom. The Chairman is in the strongroom. The Chairman sealed it with 40 depositors still banging on the grille. The robots are "protecting the assets."\n\nI am the only one who knows the override for the security teletype. I am writing it here in case I do not make it out of this office: OMEGAFORTY. Forty. I counted them.',
          learn: "map_dng_bank_secterm",
        },
        {
          title: "Wall Safe — Combination",
          text: "Manager's safe, dual control waived (there is nobody left to dual-control with): 0-6-1-2.",
          learn: "map_dng_bank_mgr_safe",
        },
        {
          title: "Wall Safe — Release",
          text: "The manager's wall safe unlocks.",
          action: () => unlockLoot("dng_bank", "wallsafe"),
        },
      ],
    });
    K.loot("safe", 19.72, 1.05, -26, HP, {
      loot: "wall_safe",
      wall: true,
      tag: "wallsafe",
      lock: lockSpec({
        id: "map_dng_bank_mgr_safe",
        label: "Dunmore Mutual Trust — manager's wall safe",
        code: "0612",
        hint: "The branch manager's teletype.",
      }),
    });
    K.bookcase(11.5, 0, -31.6, PI, 1.6);
    K.bookcase(13.2, 0, -31.6, PI, 1.6);
    K.sofa(17.5, 0, -21, 0, { c: [0.3, 0.15, 0.1] });
    K.box(
      "fabric",
      11,
      0.001,
      -30,
      18.5,
      0.015,
      -22.5,
      [0.4, 0.12, 0.1],
      0.5,
      8,
    );
    K.poster("long_winter", 14.5, 2.0, -31.88, 0, 1, 1.2, 0.8);
    K.cyl("bronze", 18.8, 0, -31, 0.25, 0.2, 0.9, 8, {
      c: [0.5, 0.4, 0.25],
      capTop: true,
    });
    K.cyl("glass_dirty", 18.8, 0.9, -31, 0.3, 0.3, 0.5, 10, {
      c: [0.3, 0.45, 0.55],
    });
    K.light("bulb", 14.5, 3.4, -26, { floor: 0, real: true });
    K.skel(14.5, 0, -27.45, 0, "seated");
    K.note("dng_note_whitcomb", 15.4, 0.77, -29.0, {
      name: "Deposit Slip (Whitcomb)",
      title: "DUNMORE MUTUAL TRUST — DEPOSIT SLIP",
      text: 'DEPOSITOR: Gerald Whitcomb, Branch Mgr.\nAMOUNT: one (1) conscience\n\nThey have stopped banging on the grille. The patrolmen are still saying "Please remain calm, your deposit is safe with Dunmore." I can hear them from here.\n\nIf you are reading this: my teletype word is my wife\'s name, EVELYN. The override for the security teletype by the strongroom is in my log. The Chairman keeps his personal box in the back row, left, and the key on his watch chain. Take everything.',
      learn: "map_dng_bank_term",
    });
    K.loot("file_cabinet", 10.2, 0, -23, -HP, { loot: "file_cabinet" });

    // ---- security checkpoint ----
    K.counter(-5, -38.5, -1.5, -37.5, 0, {
      h: 1.1,
      c: [0.35, 0.36, 0.33],
      mat: "metal_painted",
      top: "metal_panel",
      topC: [0.45, 0.45, 0.42],
    });
    K.lockers(4.2, 0, -33.6, 0, 4);
    K.monitor(-3.5, -37.9, 1.1, 0);
    K.terminal("dng_term_bank_sec", -2.4, 1.1, -38.0, PI, {
      title: "DMT STRONGROOM SECURITY",
      header: "DUNMORE MUTUAL TRUST\nSTRONGROOM ACCESS CONTROL",
      lock: lockSpec({
        id: "map_dng_bank_secterm",
        label: "Dunmore Mutual Trust — strongroom security teletype",
        passcode: "OMEGAFORTY",
        hint: "Whitcomb's personal log on the branch manager's teletype.",
      }),
      entries: [
        {
          title: "Strongroom Door Status",
          text: "STRONGROOM DOOR: OPEN (FORCED — 1967.10.24 04:12)\nNOTE: Door breached from the INSIDE.",
        },
        {
          title: "Depositor Box Registry",
          text: "Box 001 — R. Dunmore III (Chairman) — KEY ONLY\nBox 002 — E. Dunmore\nBox 118 — [REDACTED — Office of Civil Defense] — dual-control code 4-4-7-1\nBox 302 — M. Feeney — courtesy code 3-0-2-0\nBoxes 200-400 — Deposit holders, general",
          learn: ["map_dng_bank_box118", "map_dng_bank_box302"],
        },
      ],
    });
    K.light("tube", 0, 3.4, -38, { floor: 0, real: true, flicker: true });
    K.light("red", 5.8, 2.6, -40, { nx: -1, nz: 0, floor: 0 });
    K.loot("locker", -5.4, 0, -33.4, 0, {
      loot: "locker",
      lock: lockSpec({
        id: "map_dng_bank_locker",
        label: "Dunmore Mutual Trust — security locker",
        key: "map_key_dmt_guard",
        hint: "The guard's key ring, by the tellers in the banking hall.",
      }),
    });
    K.sign("SAFE DEPOSIT", 0, 3.0, -43.85, 0, 1, 1.8);
    K.anchor("spawn4", 0, 0, -35);

    // ---- the strongroom (boss: the Bulwark unit "TELLER") ----
    // the round door, blown off its hinges and leaning on the wall outside the opening
    const dm = M.mtx(4.4, 1.6, -43.2, 0.25, 0, 0.16);
    M.pushXF(dm);
    M.cyl(K.b("metal_scratched"), 0, -0.45, 0, 1.7, 1.7, 0.9, 20, {
      capTop: true,
      capBot: true,
      c: [0.6, 0.6, 0.58],
    });
    M.popXF();
    K.col(3.2, 0, -44, 5.8, 3.3, -42.6, { tag: "debris", surface: "metal" });
    // safe-deposit box walls
    const boxWall = (ax, az, bx, bz, nx, nz) => {
      const L = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / L,
        uz = (bz - az) / L;
      for (let t = 0.3; t < L - 0.2; t += 0.42)
        for (let y = 0.3; y < 3.6; y += 0.3) {
          const x = ax + ux * t + nx * 0.12,
            z = az + uz * t + nz * 0.12;
          const open = r() < 0.12;
          K.plate(
            open ? "glass_dirty" : "metal_scratched",
            x,
            y,
            z,
            nx,
            nz,
            0.38,
            0.26,
            null,
            open
              ? [0.05, 0.05, 0.05]
              : M.mulc([0.7, 0.66, 0.55], 0.85 + r() * 0.2),
          );
        }
    };
    boxWall(-8.8, -61.9, 8.8, -61.9, 0, 1);
    boxWall(-8.9, -44.2, -8.9, -61.8, 1, 0);
    boxWall(8.9, -61.8, 8.9, -44.2, -1, 0);
    K.table(0, 0, -53, 0, 3, 1.2, {
      mat: "metal_painted",
      c: [0.45, 0.45, 0.42],
    });
    for (let i = 0; i < 4; i++)
      K.obox("gold", -0.8 + i * 0.35, 0.8, -53.2, 0.28, 0.08, 0.12, 0.1 * i, {
        c: [0.9, 0.75, 0.35],
        s: 0.5,
      });
    // Protocol Omega: the Chairman's family in the back row (his box key still on his watch chain)
    placeKey(K, "map_key_dmt_chairman", -6.4, 0, -60.0);
    K.skel(-6.8, 0, -60.5, 0.3, "sitting");
    K.skel(-5.8, 0, -60.8, -0.2, "child_curled");
    K.skel(-4.6, 0, -60.2, 0.2, "curled");
    K.skel(6.2, 0, -47, 2.2, "lying");
    K.light("tube", -4, 4.2, -53, { floor: 0, real: true });
    K.light("tube", 4, 4.2, -53, { floor: 0, flicker: true });
    K.light("red", 0, 3.6, -61.7, { nx: 0, nz: 1, floor: 0 });
    K.litter(-9, -62, 9, -44, 0, 16, {
      cells: [M.MARK.LITTER, M.MARK.DIRT, M.MARK.STAIN, M.MARK.BLOOD],
    });
    K.loot("safe", -7.5, 0, -61.2, PI, {
      loot: "safe",
      name: "Chairman's Deposit Box",
      lock: lockSpec({
        id: "map_dng_bank_box001",
        label: "Dunmore Mutual Trust — Box 001 (the Chairman)",
        key: "map_key_dmt_chairman",
        hint: "On the Chairman, in the back row of the strongroom.",
      }),
    });
    K.loot("safe", 7.6, 0, -58, HP, {
      loot: "safe",
      name: "Deposit Box 118",
      lock: lockSpec({
        id: "map_dng_bank_box118",
        label: "Dunmore Mutual Trust — Box 118",
        code: "4471",
        hint: "The depositor box registry on the strongroom security teletype.",
      }),
    });
    K.loot("safe", 7.6, 0, -50, HP, {
      loot: "safe",
      name: "Deposit Box 302",
      lock: lockSpec({
        id: "map_dng_bank_box302",
        label: "Dunmore Mutual Trust — Box 302",
        code: "3020",
        hint: "The depositor box registry on the strongroom security teletype.",
      }),
    });
    K.loot("ammo_box", -7.6, 0, -45.2, -HP, { loot: "ammo_box", large: true });
    K.anchor("spawn5", -4, 0, -49);
    K.anchor("spawn6", 0, 0, -57);
    K.anchor("boss", 0, 0, -57);
    K.anchor("arrival", 0, 0, -2.2, 0);
    K.anchor("exit", 0, 1.2, -0.5, 0);
    void hall;
    void offices;
    void rec;
    void mgr;
    void strong;
  }

  // ===================================================================
  // 4. Fulton Street Station — a Brute larder
  // ===================================================================
