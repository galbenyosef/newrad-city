// play-inline-118 07 — the
// Lines 1500-1824 of readable/play-inline-118.pretty.js (statement-aligned).
  function clinic(rec, O) {
    const r = Room("clinic", O.x - 70, O.z - 70, 14, 10, 3.6, { doorAt: -3.0 });
    shell(r, {
      floor: "nx_checker",
      floorTint: 0xd8e8d8,
      wall: "nx_paper",
      wallTint: 0xd8e4dc,
      dado: "nx_tile",
      dadoH: 1.4,
      trim: "wood_dark",
      doorLeaf: "glass",
      doorFrame: "brass",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // reception — the old box-office counter with a brass grille, the doctor behind it
    r.bx("wood_dark", 1.2, 0, 1.2, 6.8, 1.1, 1.8, {});
    r.bx("marble", 1.1, 1.1, 1.1, 6.9, 1.16, 1.9, {});
    r.col(1.2, 0, 1.2, 6.8, 1.16, 1.8);
    for (let k = 0; k < 16; k++)
      r.b.beam(
        "brass",
        r.X(1.35 + k * 0.35),
        1.16,
        r.Z(1.45),
        r.X(1.35 + k * 0.35),
        2.3,
        r.Z(1.45),
        0.015,
      );
    r.bx("brass", 1.2, 2.3, 1.35, 6.8, 2.38, 1.55, {});
    r.bx("nx_plaster", 0.5, 0, -0.45, 7, 3.6, -0.3, { tint: 0xd8e4dc });
    r.col(0.5, 0, -0.45, 7, 3.6, -0.3); // back of the box office
    for (const lx of [2.2, 4.8])
      r.bx("black_metal", lx - 0.4, 1.16, 1.3, lx + 0.4, 1.19, 1.6, {
        tint: 0x222222,
      }); // ticket slots
    r.b.box("metal_dark", r.X(5.8), 1.16, r.Z(1.5), 0.45, 0.3, 0.35, {}); // register
    poster(r, "q_price", r.X(3.5), 2.05, r.Z(-0.28), 1.4, 0.93, 0);
    poster(r, "q_tonic", r.X(5.8), 1.95, r.Z(-0.28), 0.7, 0.92, 0);
    A("clinic_doctor", 3.4, 0.4, PI); // behind the counter, facing the waiting room (south)
    // partition between the waiting room and the surgery (curtained doorway)
    r.bx("nx_plaster", -7, 0, -0.55, -2.6, 3.6, -0.4, { tint: 0xd8e4dc });
    r.bx("nx_plaster", -0.9, 0, -0.55, 0.5, 3.6, -0.4, { tint: 0xd8e4dc });
    r.bx("nx_plaster", -2.6, 2.3, -0.55, -0.9, 3.6, -0.4, { tint: 0xd8e4dc });
    r.col(-7, 0, -0.55, -2.6, 3.6, -0.4);
    r.col(-0.9, 0, -0.55, 0.5, 3.6, -0.4);
    // tiled partition skirting + a frosted SURGERY panel so the wall reads as a real partition, not a paper screen
    r.bx("nx_tile", -7, 0, -0.38, -2.6, 1.2, -0.36, { tint: 0xc8d8d0 });
    r.bx("nx_tile", -0.9, 0, -0.38, 0.5, 1.2, -0.36, { tint: 0xc8d8d0 });
    r.bx("wood_dark", -7, 1.2, -0.39, -2.6, 1.26, -0.35, {});
    r.bx("wood_dark", -0.9, 1.2, -0.39, 0.5, 1.26, -0.35, {});
    r.b.panel("glass", r.X(-4.8), 2.0, r.Z(-0.36), 2.4, 0.9, 0, {
      tint: 0xc0d8d0,
    });
    r.b.beam(
      "chrome",
      r.X(-2.6),
      2.25,
      r.Z(-0.48),
      r.X(-0.9),
      2.25,
      r.Z(-0.48),
      0.02,
    );
    r.bx("fabric", -2.6, 0.35, -0.5, -2.1, 2.2, -0.46, { tint: 0xe8e4d8 });
    // waiting room: benches along the west wall, magazines, a dead ficus, posters
    for (const lz of [1.5, 3.4]) {
      r.bx("wood", -6.8, 0.42, lz - 0.8, -6.3, 0.48, lz + 0.8, {});
      r.bx("wood", -6.95, 0.48, lz - 0.8, -6.85, 1.0, lz + 0.8, {});
      r.b.beam(
        "black_metal",
        r.X(-6.55),
        0,
        r.Z(lz - 0.7),
        r.X(-6.55),
        0.42,
        r.Z(lz - 0.7),
        0.04,
      );
      r.b.beam(
        "black_metal",
        r.X(-6.55),
        0,
        r.Z(lz + 0.7),
        r.X(-6.55),
        0.42,
        r.Z(lz + 0.7),
        0.04,
      );
      r.col(-6.95, 0, lz - 0.8, -6.3, 0.48, lz + 0.8, { surface: "wood" });
    }
    A("clinic_waiting_1", -6.55, 1.2, -PI / 2);
    A("clinic_waiting_2", -6.55, 3.6, -PI / 2);
    r.b.cyl("nx_brick", r.X(-6.4), 0, r.Z(4.5), 0.25, 0.2, 0.45, 8, {
      tint: 0x8a4a2a,
    });
    P.deadTree &&
      P.deadTree(r.b, r.X(-6.4), r.Z(4.5), 1.6, { seed: 77, y: 0.45 });
    poster(r, "q_tonic", r.X(-6.98), 2.2, r.Z(2.5), 0.8, 1.05, PI / 2);
    poster(r, "q_purge", r.X(-4.2), 2.2, r.Z(4.98), 0.8, 1.05, PI);
    // the surgery: operating table under a big surgical lamp, instrument cart, IV stand, autoclave, sink
    r.bx("nx_tile", -7, 0.01, -5, 0.3, 0.02, -0.55, {
      faces: "t",
      tint: 0xe8f0ec,
    });
    const ot = [-3.8, -2.9];
    r.bx(
      "chrome",
      ot[0] - 0.12,
      0,
      ot[1] - 0.12,
      ot[0] + 0.12,
      0.8,
      ot[1] + 0.12,
      {},
    );
    r.bx(
      "metal",
      ot[0] - 0.4,
      0.8,
      ot[1] - 1.0,
      ot[0] + 0.4,
      0.92,
      ot[1] + 1.0,
      { tint: 0x9aa8a0 },
    );
    r.bx(
      "fabric",
      ot[0] - 0.36,
      0.92,
      ot[1] - 0.95,
      ot[0] + 0.36,
      0.97,
      ot[1] + 0.95,
      { tint: 0xd8e4dc, grime: 0.6 },
    );
    r.b.burn(r.X(ot[0]), 0.95, r.Z(ot[1]), 0.6, 0.35);
    r.col(ot[0] - 0.4, 0, ot[1] - 1.0, ot[0] + 0.4, 0.97, ot[1] + 1.0, {
      surface: "metal",
    });
    r.b.beam(
      "black_metal",
      r.X(ot[0]),
      3.6,
      r.Z(ot[1]),
      r.X(ot[0]),
      2.6,
      r.Z(ot[1]),
      0.04,
    );
    r.b.cyl("paint_white", r.X(ot[0]), 2.3, r.Z(ot[1]), 0.62, 0.3, 0.3, 14, {
      top: true,
    });
    for (let k = 0; k < 6; k++) {
      const a = (k * PI) / 3;
      r.b.geo("lit_white", T.sphereLo, {
        x: r.X(ot[0] + Math.cos(a) * 0.35),
        y: 2.28,
        z: r.Z(ot[1] + Math.sin(a) * 0.35),
        s: 0.08,
      });
    }
    r.g.add(r.X(ot[0]), 2.2, r.Z(ot[1]), 0xf0faff, "l");
    r.sp.add(r.X(ot[0]), r.Z(ot[1]), 0xf0faff, 2.6, { y: 0.03, i: 0.6 });
    r.fix.push([
      r.X(ot[0]),
      2.1,
      r.Z(ot[1]),
      0xeef8ff,
      { intensity: 1.6, range: 8 },
    ]);
    r.bx("chrome", -2.4, 0, -4.2, -1.8, 0.85, -3.8, {});
    for (let k = 0; k < 5; k++)
      r.b.box("chrome", r.X(-2.3 + k * 0.1), 0.86, r.Z(-4.0), 0.02, 0.01, 0.2, {
        yaw: k * 0.3,
      });
    r.b.beam(
      "chrome",
      r.X(-4.9),
      0,
      r.Z(-2.2),
      r.X(-4.9),
      1.9,
      r.Z(-2.2),
      0.02,
    );
    r.b.geo("glass", T.sphereLo, {
      x: r.X(-4.9),
      y: 1.75,
      z: r.Z(-2.1),
      sx: 0.1,
      sy: 0.16,
      sz: 0.06,
      tint: 0xc03020,
    });
    r.bx("steel", -6.8, 0, -4.8, -5.8, 1.0, -4.2, {});
    r.bx("steel", -6.8, 1.0, -4.8, -5.8, 1.02, -4.2, {});
    r.col(-6.8, 0, -4.8, -5.8, 1.02, -4.2); // sink / autoclave bench
    A("clinic_nurse", -2.6, -2.9, PI / 2);
    // the chem cabinet (east wall, glass front, glowing bottles) = loot2 (props container)
    const cx0 = 5.4,
      cz0 = -4.55;
    r.bx("paint_white", cx0 - 1.0, 0, cz0 - 0.4, cx0 + 1.0, 2.1, cz0 + 0.35, {
      grime: 0.5,
    });
    r.col(cx0 - 1.0, 0, cz0 - 0.4, cx0 + 1.0, 2.1, cz0 + 0.35);
    r.b.panel("glass", r.X(cx0), 1.35, r.Z(cz0 + 0.37), 1.8, 1.3, 0, {});
    for (let i = 0; i < 3; i++)
      for (let k = 0; k < 7; k++) {
        r.b.cyl(
          "lit_warm",
          r.X(cx0 - 0.8 + k * 0.26),
          0.8 + i * 0.44,
          r.Z(cz0 + 0.1),
          0.05,
          0.05,
          0.2,
          6,
          { tint: [0xff6030, 0x60c0ff, 0x80ff80, 0xffd040][(i + k) % 4] },
        );
      }
    r.g.add(r.X(cx0), 1.4, r.Z(cz0 + 0.6), 0x9ad8ff, "m");
    addContainer(rec, {
      id: "lma_neon_clinic_chems",
      name: "Drug Cabinet",
      kind: "medical_cabinet",
      loot: "medical_cabinet",
      lock: {
        id: "lma_neon_clinic_chems",
        label: "Clinic Drug Cabinet",
        code: "3186",
        hint: 'Clinic intake terminal, "Inventory (restricted)"',
        learnedFrom: 'Clinic intake terminal, "Inventory (restricted)"',
      },
      x: r.X(cx0),
      y: 1.3,
      z: r.Z(cz0 + 0.45),
      anchor: ["loot2", PI],
    });
    // recovery: two beds with a curtain rail
    cot(r, r.X(2.3), r.Z(-3.6), 0, { blanket: 0xc8d8d0 });
    cot(r, r.X(0.8), r.Z(-3.6), 0, { blanket: 0xc8d8d0 });
    A("clinic_bed_1", 2.3, -3.6, 0);
    A("clinic_bed_2", 0.8, -3.6, 0);
    r.b.beam(
      "chrome",
      r.X(1.55),
      2.3,
      r.Z(-4.9),
      r.X(1.55),
      2.3,
      r.Z(-2.3),
      0.02,
    );
    r.bx("fabric", 1.52, 0.4, -4.9, 1.58, 2.28, -3.2, { tint: 0xd8e8dc });
    // red cross on the surgery wall + a painted one in the waiting room
    r.bx("paint_red", -4.3, 2.2, -4.99, -3.3, 2.5, -4.96, {});
    r.bx("paint_red", -3.95, 1.85, -4.99, -3.65, 2.85, -4.96, {});
    poster(r, "q_eyes", r.X(6.98), 2.0, r.Z(3.2), 0.7, 0.92, -PI / 2);
    for (const q of [
      [-4, 2.5],
      [3.5, 3.0],
      [-3.5, -2.6],
      [2.0, -2.8],
    ])
      lamp(r, r.X(q[0]), r.Z(q[1]), {
        kind: "fluor",
        y: 3.45,
        col: 0xeaf6ff,
        len: 1.3,
        pool: 3.4,
        i: 0.45,
      });
    r.fix.push([
      r.X(3.5),
      3.2,
      r.Z(2.8),
      0xfff0d8,
      { intensity: 1.0, range: 8 },
    ]);
    // story: the intake teletype on the box-office counter, Doc's surgical tape reel on the instrument cart
    terminal("lma_neon_clinic", r.X(6.3), 1.16, r.Z(1.45), 0, {
      title: "BROADWAY MEDICAL · PATIENT INTAKE",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK · BROADWAY MEDICAL (ONCE THE SHUBERT BOX OFFICE)",
      entries: [
        {
          title: "Welcome, Patient!",
          text: 'Please take a number. Numbers are on the floor, where the last patient dropped them.\n\nDoc Broadway sees locals and topsiders alike. Payment in scrip, meds, or anything that still works. We do NOT accept pack oxen, IOUs or "I know the Mayor".',
        },
        {
          title: "Price Schedule",
          text: "PATCH-UP ........ 30\nRAD FLUSH ....... 60\nBURN GRAFT ...... 80\nADDICTION ....... 90\nTHE WORKS ...... ASK\n\nGrafts are done in the order you arrive. Bring your own clean cloth.",
        },
        {
          title: "Doc's Notes — Maniacs",
          text: 'Third patient this month asking if "going Maniac" is catching. It is not. It is radiation sickness that got into the head: hot water, hot food, hot ground, year after year. Boil your water. Take your Prussian Blue. Come to the Opry, argue with the Mayor, buy a book from Goldie. Stay a person.\n\n— B.',
        },
        {
          title: "Inventory (restricted)",
          text: () => {
            learn("lma_neon_clinic_chems");
            return 'Rally Tonic: 14 bottles (2 gone flat, do not tell Nurse Ivy)\nPrussian Blue: 9\nMorphine syrettes: 6 — locked in the chem cabinet\nBull tabs: confiscated from the Guard, pending an argument\nBandages: see "curtains, old".\n\nCABINET COMBINATION: 3-1-8-6. Ivy — stop writing it on your hand.';
          },
        },
      ],
    });
    note(
      "lma_neon_reel_surgery",
      r.X(-2.1),
      0.87,
      r.Z(-4.0),
      {
        name: "Tape Reel: Surgical Log #212",
        title: "Surgical Log #212",
        value: 5,
        text: '[Recording. Clatter of instruments.]\n\nLog two-twelve. Patient: male, sixty-one, old burn scarring from \'67, the usual. Complaint: left arm came out of its socket at the Rad Room. Patient insists it was "a clean break". It was not.\n\nPut back with a knee, a strap and faith. Prognosis: he will wave funny for a month. Advised to stop arm-wrestling the bartender.\n\n[Pause.] Ivy, where is my good scalpel? No, the OTHER good scalpel.\n\n[Recording ends.]',
      },
      "tape",
    );
    finish(r);
    return r;
  }

