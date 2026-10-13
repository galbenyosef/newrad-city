// play-inline-118 11 — tint
// Lines 2854-3004 of readable/play-inline-118.pretty.js (statement-aligned).
  function oracle(rec, O) {
    const r = Room("oracle", O.x - 25, O.z - 25, 4.4, 4.4, 3.0, {
      doorAt: 0.8,
      grime: 0.4,
      zExt: 0.8,
    }); // (+0.8 m vestibule behind the bead curtain)
    shell(r, {
      floor: "nx_wood",
      floorTint: 0x6a4a3a,
      wall: "nx_velvet_purple",
      trim: "gold",
      ceil: "nx_tin",
      ceilTint: 0x3a2a4a,
      doorW: 1.1,
      doorLeaf: "metal_dark",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // the fortune machine: carved cabinet, glass booth with the turbaned automaton (a cracked plaster face), ticker spout
    const mz = -1.7;
    r.bx("wood_dark", -0.8, 0, mz - 0.45, 0.8, 1.0, mz + 0.45, {
      tint: 0x5a2a3a,
    });
    r.bx("gold", -0.85, 1.0, mz - 0.5, 0.85, 1.06, mz + 0.5, {});
    r.bx("wood_dark", -0.8, 2.4, mz - 0.45, 0.8, 2.7, mz + 0.45, {
      tint: 0x5a2a3a,
    });
    r.bx("gold", -0.9, 2.7, mz - 0.55, 0.9, 2.78, mz + 0.55, {});
    for (const sd of [-1, 1])
      r.bx(
        "gold",
        sd * 0.8 - 0.04,
        1.06,
        mz + 0.4,
        sd * 0.8 + 0.04,
        2.4,
        mz + 0.48,
        {},
      );
    r.b.panel("glass", r.X(0), 1.73, r.Z(mz + 0.46), 1.56, 1.34, 0, {});
    r.bx("lit_green", -0.75, 1.06, mz - 0.44, 0.75, 1.08, mz + 0.4, {
      tint: 0x2a6a3a,
    });
    r.b.box("nx_fabric", r.X(0), 1.08, r.Z(mz - 0.1), 0.62, 0.42, 0.34, {
      tint: 0x6a1a5a,
    });
    r.b.geo("nx_plaster", T.sphere, {
      x: r.X(0),
      y: 1.72,
      z: r.Z(mz - 0.05),
      sx: 0.17,
      sy: 0.21,
      sz: 0.17,
      tint: 0x8a8682,
    });
    r.b.geo("nx_fabric", T.sphereLo, {
      x: r.X(0),
      y: 1.93,
      z: r.Z(mz - 0.05),
      sx: 0.22,
      sy: 0.13,
      sz: 0.22,
      tint: 0xe0d8c0,
    });
    r.b.geo("gold_bright", T.sphereLo, {
      x: r.X(0),
      y: 1.97,
      z: r.Z(mz + 0.15),
      s: 0.04,
    });
    for (const sd of [-1, 1])
      r.b.geo("lit_warm", T.sphereLo, {
        x: r.X(sd * 0.06),
        y: 1.75,
        z: r.Z(mz + 0.1),
        s: 0.025,
        tint: 0xff8a30,
      });
    r.b.geo("glass", T.sphere, {
      x: r.X(0),
      y: 1.3,
      z: r.Z(mz + 0.15),
      s: 0.14,
      tint: 0x60ff90,
    }); // crystal ball
    r.g.add(r.X(0), 1.35, r.Z(mz + 0.2), 0x60ff90, "m");
    r.g.add(r.X(0), 1.9, r.Z(mz + 0.3), 0x9a7aff, "m");
    r.bx("brass", -0.12, 0.7, mz + 0.45, 0.12, 0.84, mz + 0.56, {}); // coin slot / ticker spout
    for (let k = 0; k < 18; k++) {
      const a = k * 0.9;
      r.b.box(
        "paint_white",
        r.X(Math.cos(a) * (0.3 + k * 0.03)),
        0.01 + k * 0.004,
        r.Z(mz + 0.9 + Math.sin(a) * 0.35),
        0.5,
        0.005,
        0.04,
        { yaw: a },
      );
    }
    r.col(-0.85, 0, mz - 0.55, 0.85, 2.78, mz + 0.55);
    A("oracle_booth", 0, mz + 1.05, 0);
    neonSign(
      r,
      "x_oracle2",
      r.X(2.18),
      2.2,
      r.Z(-0.4),
      1.6,
      -PI / 2,
      0x6aff9a,
      "s",
    );
    board(r, "b_oracle", r.X(-2.18), 1.8, r.Z(0.4), 1.8, 0.35, PI / 2);
    // bead curtain by the door, a stool, candles
    for (let k = 0; k < 10; k++)
      r.b.beam(
        "fabric",
        r.X(0.25 + k * 0.12),
        2.35,
        r.Z(2.1),
        r.X(0.25 + k * 0.12),
        0.3,
        r.Z(2.1),
        0.012,
        { tint: [0xd84a8a, 0x6a4ad8, 0xd8c04a][k % 3] },
      );
    r.b.cyl("wood_dark", r.X(-1.4), 0, r.Z(0.9), 0.2, 0.2, 0.6, 8, {});
    for (const q of [
      [1.8, -1.9],
      [-1.8, -1.9],
    ]) {
      r.b.cyl("lit_warm", r.X(q[0]), 0, r.Z(q[1]), 0.05, 0.05, 0.3, 6, {
        tint: 0xffa040,
      });
      r.g.add(r.X(q[0]), 0.4, r.Z(q[1]), 0xffa040, "s");
    }
    lamp(r, r.X(0), r.Z(0.3), {
      kind: "enamel",
      y: 2.4,
      shade: "nx_velvet",
      col: 0xc8a0ff,
      pool: 2.4,
      light: 0.8,
      range: 5,
    });
    finish(r);
    return r;
  }

