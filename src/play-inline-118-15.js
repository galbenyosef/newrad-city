// play-inline-118 15 — lz0
// Lines 3893-4064 of readable/play-inline-118.pretty.js (statement-aligned).
  function bunk(rec, O) {
    const r = Room("bunk", O.x - 25, O.z + 25, 18, 16, 3.4, { doorAt: 0 });
    shell(r, {
      floor: "nx_wood",
      floorTint: 0x7a5a3a,
      wall: "nx_paper",
      wallTint: 0xa8b8c8,
      dado: "nx_wood",
      dadoTint: 0x4a3020,
      trim: "wood_dark",
      ceil: "nx_tin",
      doorLeaf: "glass",
      doorFrame: "brass",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // lobby (south): the front desk + key rack + bell, a sofa, a rug, the blocked stair
    r.bx("wood_dark", 3.0, 0, 3.4, 7.0, 1.1, 4.0, {});
    r.bx("marble", 2.9, 1.1, 3.3, 7.1, 1.16, 4.1, {});
    r.col(3.0, 0, 3.4, 7.0, 1.16, 4.0, { surface: "wood" });
    r.b.geo("brass", T.sphereLo, {
      x: r.X(4.0),
      y: 1.2,
      z: r.Z(3.6),
      sx: 0.08,
      sy: 0.05,
      sz: 0.08,
    });
    r.bx("wood", 3.5, 1.4, 1.02, 6.5, 2.6, 1.08, { tint: 0x6a4a2a });
    for (let k = 0; k < 16; k++) {
      const lx = 3.7 + (k % 8) * 0.36,
        y = 2.3 - Math.floor(k / 8) * 0.45;
      r.b.box("brass", r.X(lx), y, r.Z(1.1), 0.02, 0.08, 0.02, {});
      if (k % 3)
        r.b.box("brass", r.X(lx), y - 0.14, r.Z(1.12), 0.05, 0.08, 0.01, {});
    }
    A("bunk_keeper", 5.0, 2.6, PI);
    board(r, "b_bunk", r.X(5.0), 2.95, r.Z(1.1), 3.0, 0.4, PI);
    // wait — the key rack hangs on a partition behind the desk
    r.bx("wood", 2.5, 0, 0.9, 8.95, 3.4, 1.0, { tint: 0x8a6a4a });
    r.col(2.5, 0, 0.9, 8.95, 3.4, 1.0);
    sofa(r, r.X(-5.5), r.Z(5.9), PI, 2.4, 0x3a4a6a);
    r.bx("fabric", -7.2, 0.005, 3.6, -3.4, 0.015, 6.4, {
      tint: 0x6a2a2a,
      faces: "t",
    });
    r.bx("wood", -6.1, 0.4, 4.2, -4.9, 0.45, 4.9, {});
    r.col(-6.1, 0, 4.2, -4.9, 0.45, 4.9);
    P.rubblePile(r.b, r.X(-7.8), r.Z(1.5), 1.2, 1.4, { seed: 881 });
    r.col(-8.9, 0, 0.3, -6.8, 1.4, 2.6);
    r.b.stairs("nx_wood", r.X(-8.2), r.Z(3.6), 0, -1, 1.4, 2.4, 0, 1.4, 6, {});
    poster(r, "q_fizzo", r.X(-8.97), 2.1, r.Z(5.2), 0.8, 1.05, PI / 2);
    // the dorm (north): plywood cubicles along both walls, two cots in each, lockers at the end of the aisle
    let n = 0;
    for (const sd of [-1, 1])
      for (let k = 0; k < 4; k++) {
        const lz0 = -7.8 + k * 2.1,
          lz1 = lz0 + 2.0;
        const xa = sd * 1.5,
          xb = sd * 8.95;
        r.bx(
          "wood",
          Math.min(xa, xb),
          0,
          lz1 - 0.05,
          Math.max(xa, xb),
          2.1,
          lz1 + 0.05,
          { tint: 0x9a7a5a, grime: 0.5 },
        );
        r.col(
          Math.min(xa, xb),
          0,
          lz1 - 0.05,
          Math.max(xa, xb),
          2.1,
          lz1 + 0.05,
          { surface: "wood" },
        );
        r.b.beam(
          "chrome",
          r.X(xa),
          2.05,
          r.Z(lz0 + 0.1),
          r.X(xa),
          2.05,
          r.Z(lz1 - 0.1),
          0.015,
        );
        r.bx(
          "fabric",
          sd > 0 ? xa - 0.02 : xa - 0.02,
          0.3,
          lz0 + 0.1,
          xa + 0.02,
          2.0,
          lz0 + 0.8,
          { tint: [0x8a3a3a, 0x3a5a7a, 0x6a6a3a, 0x5a3a6a][k] },
        );
        for (let c = 0; c < 2; c++) {
          const lx = sd * (4.3 + c * 3.0),
            lz = lz0 + 1.0;
          cot(r, r.X(lx), r.Z(lz), PI / 2, {
            blanket: [0x5a4a6a, 0x6a3a2a, 0x3a5a4a, 0x6a6a5a][(k + c) % 4],
          });
          n++;
          A("bunk_" + n, lx, lz, sd > 0 ? PI / 2 : -PI / 2);
        }
        r.b.box(
          "wood_dark",
          r.X(sd * 2.2),
          0,
          r.Z(lz0 + 0.5),
          0.45,
          0.6,
          0.4,
          {},
        );
        r.b.cyl(
          "lit_warm",
          r.X(sd * 2.2),
          0.6,
          r.Z(lz0 + 0.5),
          0.05,
          0.05,
          0.14,
          6,
          { tint: 0xffa040 },
        );
        r.g.add(r.X(sd * 2.2), 0.75, r.Z(lz0 + 0.5), 0xffa040, "s");
      }
    locker(r, r.X(0), r.Z(-7.7), 0, 6, { tint: 0x5a6a7a });
    hiddenAnchor(rec, "bunk_locker", r.X(0), 0, r.Z(-6.8), 0);
    note("lma_neon_note_houserules", r.X(6.2), 1.17, r.Z(3.7), {
      name: "Bunkhouse House Rules",
      title: "Bunkhouse House Rules",
      value: 1,
      text: "THE BUNKHOUSE HOTEL — HOUSE RULES\n\n1. Beds are 20 scrip. Checkout is whenever you wake up.\n2. One sleeper per cot. Pack oxen are not 'a sleeper'.\n3. No shooting in the dorm. No shooting AT the dorm.\n4. The stairs are closed. There is nothing upstairs. Stop asking about upstairs.\n5. If you lose your mind in the night, please do it quietly.\n\n— The Management (Mrs. Pettibone)",
    });
    for (const lz of [-6.5, -3.5, -0.5])
      lamp(r, r.X(0), r.Z(lz), {
        kind: "bulb",
        y: 2.9,
        col: 0xffd8a0,
        pool: 3.0,
        i: 0.45,
      });
    lamp(r, r.X(5.0), r.Z(3.6), {
      kind: "enamel",
      y: 2.6,
      shade: "paint_green",
      light: 1.1,
      pool: 3.0,
    });
    lamp(r, r.X(-4), r.Z(4.5), {
      kind: "chandelier",
      y: 2.8,
      col: 0xffe0a8,
      pool: 3.6,
      i: 0.4,
    });
    r.fix.push([
      r.X(0),
      2.6,
      r.Z(-3.5),
      0xffd8a8,
      { intensity: 1.0, range: 9 },
    ]);
    finish(r);
    return r;
  }

