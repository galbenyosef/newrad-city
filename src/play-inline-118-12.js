// play-inline-118 12 — tint
// Lines 3005-3211 of readable/play-inline-118.pretty.js (statement-aligned).
  function mayor(rec, O) {
    const r = Room("mayor", O.x + 20, O.z - 25, 9, 7, 3.2, { doorAt: 0 });
    shell(r, {
      floor: "nx_wood",
      floorTint: 0x8a6a4a,
      wall: "nx_paper",
      wallTint: 0xc8d0b8,
      dado: "nx_wood",
      dadoTint: 0x5a3a20,
      trim: "wood_dark",
      doorLeaf: "glass",
      doorFrame: "chrome",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // the Mayor's desk: big old-world oak, a terminal, papers, the chair; flags either side
    r.bx("wood_dark", -1.6, 0, -2.2, 1.6, 0.76, -1.3, {});
    r.bx("wood", -1.7, 0.76, -2.3, 1.7, 0.8, -1.2, {});
    r.col(-1.7, 0, -2.3, 1.7, 0.8, -1.2, { surface: "wood" });
    for (let k = 0; k < 5; k++)
      r.b.box(
        "paint_white",
        r.X(-1.2 + k * 0.28),
        0.8 + k * 0.004,
        r.Z(-1.6),
        0.21,
        0.004,
        0.3,
        { yaw: k * 0.3 - 0.4 },
      );
    r.b.box("fabric", r.X(0), 0, r.Z(-2.9), 0.6, 0.5, 0.6, { tint: 0x3a1a10 });
    r.b.box("fabric", r.X(0), 0.5, r.Z(-3.15), 0.6, 0.8, 0.12, {
      tint: 0x3a1a10,
    });
    A("mayor", 0, -2.75, PI);
    A("terminal", 1.05, -1.75, PI, 0.8);
    A("mayor_office", 0.9, 0.2, 0);
    addContainer(rec, {
      id: "lma_neon_mayor_desk",
      name: "Mayor's Desk",
      kind: "desk",
      loot: "desk",
      items: [["lma_neon_note_crowe_memo", 1]],
      lock: {
        id: "lma_neon_mayor_desk",
        label: "Mayor's Desk",
        key: "lma_neon_mayor_desk_key",
        hint: "The desk key lies on top of the Mayor's filing cabinets",
      },
      x: r.X(-0.9),
      y: 0.65,
      z: r.Z(-1.75),
      anchor: ["mayor_desk", 0],
    });
    for (const sd of [-1, 1]) {
      const lx = sd * 2.5;
      r.b.cyl("brass", r.X(lx), 0, r.Z(-3.1), 0.2, 0.22, 0.06, 10, {});
      r.b.cyl("wood_dark", r.X(lx), 0, r.Z(-3.1), 0.035, 0.035, 2.5, 6, {});
      r.b.geo("gold", T.sphereLo, {
        x: r.X(lx),
        y: 2.55,
        z: r.Z(-3.1),
        s: 0.07,
      });
      r.bx("fabric", lx - 0.02, 1.4, -3.1, lx + 0.02, 2.4, -2.2, {
        tint: sd < 0 ? 0xb02a22 : 0x2a8a4a,
        grime: 0.3,
      });
    }
    // filing cabinets (west), the big map (east), recruiting posters, a sofa for visitors, the safe (loot1)
    for (let k = 0; k < 3; k++) {
      r.bx(
        "paint_green",
        -4.45,
        0,
        -3.2 + k * 0.62,
        -3.85,
        1.35,
        -2.62 + k * 0.62,
        { tint: 0x5a6a5a },
      );
      for (let d2 = 0; d2 < 3; d2++)
        r.bx(
          "chrome",
          -3.87,
          0.3 + d2 * 0.42,
          -3.0 + k * 0.62,
          -3.83,
          0.34 + d2 * 0.42,
          -2.82 + k * 0.62,
          {},
        );
    }
    r.col(-4.45, 0, -3.2, -3.85, 1.35, -1.36);
    keyItem("lma_neon_mayor_desk_key", r.X(-4.15), 1.36, r.Z(-1.8), {
      name: "Mayor's Desk Key",
      desc: 'A small brass key on a paper tag: "L.C. — DESK. Do not lend to Wendell."',
    });
    INNER_ITEMS.push({
      id: "lma_neon_note_crowe_memo",
      type: "note",
      weight: 0,
      value: 1,
      name: "Memo: Note to Self",
      title: "Note to Self — L. Crowe",
      text: "NOTE TO SELF (do not leave on desk — you have left it on the desk)\n\n1. Speech for the Ball: shorter. Much shorter.\n2. Tell Kincaid the gate lamps are NOT optional.\n3. The office safe is 1-9-2-7, the year I first stood on a stage. Nobody here is old enough to guess it. Except Wendell. Change it if Wendell asks about my career.\n\n— L.C.",
    });
    K.learnFromItem("lma_neon_note_crowe_memo", "lma_neon_mayor_safe");
    poster(r, "q_map", r.X(4.46), 1.9, r.Z(-0.6), 2.4, 1.8, -PI / 2);
    poster(r, "q_enlist", r.X(-4.46), 2.0, r.Z(1.4), 0.9, 1.2, PI / 2);
    poster(r, "q_enlist", r.X(-2.2), 2.0, r.Z(3.46), 0.9, 1.2, PI);
    board(r, "b_mayor", r.X(0), 2.55, r.Z(-3.46), 2.0, 0.42, 0);
    sofa(r, r.X(2.9), r.Z(1.8), -PI / 2, 2.0, 0x5a3a2a);
    r.bx("wood", 1.2, 0.4, 1.2, 2.0, 0.45, 2.4, {});
    r.col(1.2, 0, 1.2, 2.0, 0.45, 2.4);
    r.bx("metal_dark", 3.6, 0, -3.45, 4.45, 1.1, -2.7, { tint: 0x3a3a34 });
    r.b.cyl("chrome", r.X(4.0), 0.7, r.Z(-2.68), 0.12, 0.12, 0.05, 12, {});
    r.col(3.6, 0, -3.45, 4.45, 1.1, -2.7);
    addContainer(rec, {
      id: "lma_neon_mayor_safe",
      name: "Office Safe",
      kind: "safe",
      loot: "safe",
      lock: {
        id: "lma_neon_mayor_safe",
        label: "Mayor's Office Safe",
        code: "1927",
        hint: "Crowe's memo inside the Mayor's desk",
        learnedFrom: "Crowe's memo inside the Mayor's desk",
      },
      x: r.X(4.0),
      y: 0.7,
      z: r.Z(-2.65),
      anchor: ["loot1", 0],
    });
    r.b.beam(
      "wood_dark",
      r.X(-3.9),
      0,
      r.Z(3.0),
      r.X(-3.9),
      1.8,
      r.Z(3.0),
      0.04,
    );
    for (let k = 0; k < 3; k++)
      r.b.beam(
        "wood_dark",
        r.X(-3.9),
        1.7,
        r.Z(3.0),
        r.X(-3.9 + Math.cos(k * 2.1) * 0.25),
        1.6,
        r.Z(3.0 + Math.sin(k * 2.1) * 0.25),
        0.02,
      );
    r.b.geo("fabric", T.sphereLo, {
      x: r.X(-3.9),
      y: 1.55,
      z: r.Z(3.0),
      sx: 0.25,
      sy: 0.4,
      sz: 0.18,
      tint: 0x2a2a3a,
    });
    lamp(r, r.X(0), r.Z(-1.4), {
      kind: "enamel",
      y: 2.5,
      shade: "paint_green",
      light: 1.1,
      pool: 3.0,
      i: 0.5,
    });
    lamp(r, r.X(0), r.Z(1.8), {
      kind: "fluor",
      y: 3.05,
      col: 0xf4f0e0,
      len: 1.3,
      pool: 3.2,
    });
    r.b.cyl("brass", r.X(1.35), 0.8, r.Z(-2.05), 0.08, 0.08, 0.03, 8, {});
    r.b.beam(
      "brass",
      r.X(1.35),
      0.8,
      r.Z(-2.05),
      r.X(1.35),
      1.2,
      r.Z(-2.05),
      0.015,
    );
    r.b.cyl(
      "paint_green",
      r.X(1.35),
      1.15,
      r.Z(-2.05),
      0.16,
      0.08,
      0.12,
      8,
      {},
    );
    r.g.add(r.X(1.35), 1.1, r.Z(-2.05), 0xffd8a0, "s");
    finish(r);
    return r;
  }

