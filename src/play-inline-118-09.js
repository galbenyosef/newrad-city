// play-inline-118 09 — box
// Lines 1988-2318 of readable/play-inline-118.pretty.js (statement-aligned).
  function robo(rec, O) {
    const r = Room("robo", O.x + 20, O.z - 70, 12, 9, 3.6, { doorAt: 2.0 });
    shell(r, {
      floor: "nx_concrete",
      floorTint: 0x8a8a80,
      wall: "nx_brick",
      wallTint: 0xb0a090,
      dado: "nx_metald",
      dadoTint: 0x3a5a5a,
      dadoH: 1.0,
      trim: "metal_dark",
      rail: false,
      ceil: "nx_concrete",
      doorLeaf: "metal",
      doorTint: 0x3a6a6a,
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // counter + register + a disassembled radio on it
    r.bx("metal_dark", -5.8, 0, 1.4, 0.8, 1.0, 2.0, { tint: 0x3a5a5a });
    r.bx("wood", -5.9, 1.0, 1.3, 0.9, 1.06, 2.1, {});
    r.col(-5.8, 0, 1.4, 0.8, 1.06, 2.0);
    r.b.box("metal_dark", r.X(-4.8), 1.06, r.Z(1.7), 0.45, 0.3, 0.35, {});
    r.b.box("wood_dark", r.X(-2.2), 1.06, r.Z(1.7), 0.6, 0.35, 0.3, {});
    r.b.geo("lit_warm", T.sphereLo, {
      x: r.X(-2.2),
      y: 1.25,
      z: r.Z(1.86),
      s: 0.05,
      tint: 0xffa040,
    });
    A("robo_owner", -2.8, 0.7, PI);
    // radio wall (west) — shelves full of sets with glowing dials
    shelf(r, r.X(-5.75), r.Z(-1.9), PI / 2, 2.6, 2.4, {
      goods: "radios",
      seed: 4101,
    });
    // workbenches along the north wall: a Patrolman torso under repair, an oscilloscope, tools, a tube tester
    r.bx("wood", -4.5, 0.9, -4.4, 3.5, 0.96, -3.5, {});
    r.col(-4.5, 0, -4.4, 3.5, 0.96, -3.5);
    for (const lx of [-4.3, -0.5, 3.3])
      r.bx("metal_dark", lx - 0.06, 0, -4.35, lx + 0.06, 0.9, -3.55, {});
    const tb = [-2.0, -4.0];
    r.b.box("paint_yellow", r.X(tb[0]), 0.96, r.Z(tb[1]), 0.7, 0.8, 0.5, {
      grime: 0.6,
    });
    r.b.box("paint_yellow", r.X(tb[0]), 1.82, r.Z(tb[1]), 0.5, 0.36, 0.42, {
      grime: 0.5,
    }); // square head, off its neck
    r.b.box(
      "lit_red",
      r.X(tb[0]),
      1.97,
      r.Z(tb[1] + 0.21),
      0.36,
      0.05,
      0.02,
      {},
    ); // visor slit
    r.b.beam(
      "rubber",
      r.X(tb[0] + 0.35),
      1.4,
      r.Z(tb[1]),
      r.X(tb[0] + 1.2),
      0.96,
      r.Z(tb[1] + 0.2),
      0.03,
    );
    r.b.box("metal_dark", r.X(1.2), 0.96, r.Z(-4.1), 0.5, 0.4, 0.35, {});
    r.b.panel("lit_green", r.X(1.2), 1.2, r.Z(-3.92), 0.3, 0.22, 0, {
      tint: 0x40ff60,
    });
    r.g.add(r.X(1.2), 1.2, r.Z(-3.6), 0x60ff80, "s");
    r.b.box("wood_dark", r.X(2.6), 0.96, r.Z(-4.0), 0.6, 0.3, 0.4, {});
    for (let k = 0; k < 4; k++)
      r.b.cyl(
        "lit_warm",
        r.X(2.4 + k * 0.13),
        1.26,
        r.Z(-4.0),
        0.03,
        0.025,
        0.12,
        6,
        { tint: 0xff8a30 },
      );
    for (let k = 0; k < 8; k++)
      r.b.box(
        "metal",
        r.X(-4.2 + k * 0.4),
        1.8 + (k % 2) * 0.1,
        r.Z(-4.48),
        0.06,
        0.4,
        0.02,
        { tint: 0x8a8a80 },
      ); // tools on a pegboard
    r.bx("wood", -4.5, 1.4, -4.5, 3.5, 2.6, -4.47, { tint: 0x8a7a5a });
    // a whole Patrolman in the NE corner (for show) + American Automaton Valet shells hanging on chains
    const px = 4.9,
      pz = -3.6;
    r.b.box("metal_dark", r.X(px), 0, r.Z(pz), 0.7, 0.2, 0.7, {});
    for (const s of [-0.18, 0.18])
      r.b.cyl("paint_yellow", r.X(px + s), 0.2, r.Z(pz), 0.1, 0.12, 0.8, 8, {});
    r.b.box("paint_yellow", r.X(px), 1.0, r.Z(pz), 0.62, 0.7, 0.42, {
      grime: 0.5,
    });
    r.b.box("paint_yellow", r.X(px), 1.7, r.Z(pz), 0.44, 0.42, 0.4, {
      grime: 0.5,
    }); // square head with a visor slit
    r.b.box("lit_red", r.X(px), 1.88, r.Z(pz + 0.2), 0.34, 0.06, 0.02, {});
    for (const s of [-1, 1])
      r.b.beam(
        "paint_yellow",
        r.X(px + s * 0.36),
        1.6,
        r.Z(pz),
        r.X(px + s * 0.45),
        1.0,
        r.Z(pz + 0.2),
        0.09,
      );
    r.col(px - 0.4, 0, pz - 0.4, px + 0.4, 2.2, pz + 0.4);
    A("robo_handy", 3.9, -2.6, 0.6);
    for (const q of [
      [-0.6, -1.2],
      [2.2, -0.6],
    ]) {
      r.b.beam(
        "black_metal",
        r.X(q[0]),
        3.6,
        r.Z(q[1]),
        r.X(q[0]),
        3.2,
        r.Z(q[1]),
        0.015,
      );
      r.b.box("chrome", r.X(q[0]), 2.6, r.Z(q[1]), 0.42, 0.55, 0.32, {}); // boxy torso
      r.b.box("chrome", r.X(q[0]), 3.15, r.Z(q[1]), 0.26, 0.2, 0.24, {}); // head block
      for (const sd of [-1, 1])
        r.b.beam(
          "chrome",
          r.X(q[0] + sd * 0.22),
          3.0,
          r.Z(q[1]),
          r.X(q[0] + sd * 0.3),
          2.45,
          r.Z(q[1] + 0.12),
          0.03,
        ); // two arms
    }
    board(r, "b_robo", r.X(-2.4), 2.9, r.Z(-4.46), 2.8, 0.5, 0);
    neonSign(r, "x_radio", r.X(5.95), 2.3, r.Z(1.2), 0.9, -PI / 2, 0xffb040);
    for (const q of [
      [-3, 0],
      [2.5, 0.5],
      [-1, -2.8],
    ])
      lamp(r, r.X(q[0]), r.Z(q[1]), {
        kind: "cage",
        y: 2.9,
        col: 0xffd8a0,
        pool: 3.0,
      });
    r.fix.push([
      r.X(-1),
      2.7,
      r.Z(-2.8),
      0xffe0b0,
      { intensity: 1.2, range: 8 },
    ]);
    STORY.push({
      kind: "workbench",
      id: "neon_robo_bench",
      x: r.X(5.2),
      y: 0,
      z: r.Z(-0.6),
      yaw: -PI / 2,
    });
    note("lma_neon_note_repair", r.X(-3.4), 1.07, r.Z(1.75), {
      name: "Repair Ticket #88",
      title: "Repair Ticket #88",
      value: 1,
      text: "SPROCKET'S WORKSHOP — REPAIR TICKET #88\n\nItem: Valet, Series Four (American Automaton Co.), 'Marquee'\nComplaint: sings show tunes at 3 AM, cannot be stopped, knows all the words.\nDiagnosis: nothing wrong. That is how they come.\nWork done: removed the blowtorch arm. Put the blowtorch arm back (customer insisted).\nBalance due: 45 scrip OR one (1) working vacuum tube, 6SN7.",
    });
    finish(r);
    return r;
  }

  function pawn(rec, O) {
    const r = Room("pawn", O.x + 65, O.z - 70, 10, 8, 3.4, { doorAt: 0 });
    shell(r, {
      floor: "nx_carpet",
      floorTint: 0x7a6a3a,
      wall: "nx_paper",
      wallTint: 0xe0b860,
      dado: "nx_wood",
      dadoTint: 0x4a2a14,
      trim: "gold",
      railMat: "gold",
      doorLeaf: "wood",
      doorTint: 0x4a2a14,
      doorFrame: "gold",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // U of glass display counters, lit inside
    const caseAt = (lx0, lz0, lx1, lz1) => {
      r.bx("wood_dark", lx0, 0, lz0, lx1, 0.55, lz1, {});
      r.bx(
        "lit_warm",
        lx0 + 0.05,
        0.55,
        lz0 + 0.05,
        lx1 - 0.05,
        0.58,
        lz1 - 0.05,
        { tint: 0x6a5020 },
      );
      r.bx("glass", lx0, 0.55, lz0, lx1, 1.0, lz1, { faces: "nsewt" });
      r.bx("gold", lx0, 1.0, lz0, lx1, 1.03, lz1, { faces: "nsew" });
      const rr = K.rng(Math.round(lx0 * 31 + lz0 * 17));
      for (let k = 0; k < 6; k++) {
        const x = lx0 + 0.2 + rr() * (lx1 - lx0 - 0.4),
          z = lz0 + 0.15 + rr() * (lz1 - lz0 - 0.3);
        r.b.box(
          rr() < 0.5 ? "gold_bright" : "chrome",
          r.X(x),
          0.58,
          r.Z(z),
          0.12 + rr() * 0.1,
          0.05 + rr() * 0.08,
          0.1,
          { yaw: rr() * 3 },
        );
      }
      r.col(lx0, 0, lz0, lx1, 1.03, lz1, { surface: "wood" });
      r.g.add(r.X((lx0 + lx1) / 2), 0.8, r.Z((lz0 + lz1) / 2), 0xffd890, "s");
    };
    caseAt(-2.8, -1.5, 2.8, -0.9);
    caseAt(-3.4, -1.5, -2.8, 1.4);
    caseAt(2.8, -1.5, 3.4, 1.4);
    A("pawn_owner", 0, -2.3, PI);
    // wire cages along both side walls with the stuff nobody bought back
    for (const sd of [-1, 1]) {
      const lx = sd * 4.3;
      for (let k = 0; k <= 8; k++)
        r.b.beam(
          "metal",
          r.X(lx),
          0,
          r.Z(-3.6 + k * 0.85),
          r.X(lx),
          2.6,
          r.Z(-3.6 + k * 0.85),
          0.02,
        );
      for (const y of [0.1, 1.3, 2.6])
        r.b.beam("metal", r.X(lx), y, r.Z(-3.6), r.X(lx), y, r.Z(3.2), 0.025);
      for (let k = 0; k < 14; k++) {
        const z = -3.4 + (k % 7) * 0.9,
          y = k < 7 ? 0 : 1.3;
        r.b.box(
          ["wood_dark", "metal", "fabric", "paint_red", "brass"][k % 5],
          r.X(lx + sd * 0.35),
          y + 0.02,
          r.Z(z),
          0.4,
          0.2 + (k % 3) * 0.15,
          0.35,
          {
            yaw: k,
            tint: [0xffffff, 0x8a8a7a, 0x6a4a8a, 0xffffff, 0xffffff][k % 5],
          },
        );
      }
      r.col(lx - 0.05, 0, -3.6, lx + sd * 0.7, 2.6, 3.2);
    }
    // the big safe (loot), a gold-framed painting, a chandelier
    r.bx("metal_dark", -3.5, 0, -3.95, -2.5, 1.4, -3.1, { tint: 0x3a3a34 });
    r.b.cyl("chrome", r.X(-3.0), 0.9, r.Z(-3.08), 0.14, 0.14, 0.05, 12, {});
    r.col(-3.5, 0, -3.95, -2.5, 1.4, -3.1);
    addContainer(rec, {
      id: "lma_neon_pawn_safe",
      name: "Pawn Palace Safe",
      kind: "safe",
      loot: "safe",
      lock: {
        id: "lma_neon_pawn_safe",
        label: "Pawn Palace Safe",
        code: "7041",
        hint: "A bar napkin on a card table in the Speakeasy",
        learnedFrom: "A bar napkin on a card table in the Speakeasy",
      },
      x: r.X(-3.0),
      y: 0.9,
      z: r.Z(-3.0),
      anchor: ["pawn_safe", 0],
    });
    note("lma_neon_note_pawnticket", r.X(1.1), 1.04, r.Z(-1.2), {
      name: "Pawn Ticket #4471",
      title: "Pawn Ticket #4471",
      value: 1,
      text: "THE PAWN PALACE — NO REFUNDS · NO QUESTIONS\n\nTicket #4471\nItem: wedding ring, gold (real), inscribed 'H. & M. — forever, 1961'\nAdvanced: 20 scrip\nRedeem by: last Tuesday\n\nOn the back, in pencil: 'She'll come back for it. Hold it one more week. — G.'",
    });
    r.bx("gold", -1.1, 1.6, -3.99, 1.1, 2.9, -3.93, {});
    r.b.panel("atlas_ads", r.X(0), 2.25, r.Z(-3.92), 1.9, 1.1, 0, {
      rect: K.ad("chocolate_zeppelin", 1),
    });
    board(r, "b_pawn", r.X(0), 1.25, r.Z(-3.95), 2.4, 0.4, 0);
    neonSign(r, "x_pawn", r.X(0), 2.7, r.Z(3.95), 2.6, PI, 0xffc83a);
    lamp(r, r.X(0), r.Z(0.4), {
      kind: "chandelier",
      y: 3.05,
      col: 0xffe0a0,
      light: 1.3,
      pool: 4.2,
      i: 0.5,
    });
    lamp(r, r.X(-3.9), r.Z(2.8), {
      kind: "enamel",
      y: 2.6,
      shade: "gold",
      pool: 2.2,
    });
    finish(r);
    return r;
  }

