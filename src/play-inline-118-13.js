// play-inline-118 13 — lz0
// Lines 3212-3682 of readable/play-inline-118.pretty.js (statement-aligned).
  function power(rec, O) {
    const r = Room("power", O.x + 65, O.z - 25, 18, 14, 6, {
      doorAt: 6.0,
      grime: 0.5,
      entryY: 3.0,
      entryYaw: PI / 2,
    });
    shell(r, {
      floor: "nx_concrete",
      floorTint: 0x7a7a70,
      wall: "nx_brick",
      wallTint: 0x8a7a6a,
      dado: "nx_concrete",
      dadoTint: 0x8a8a80,
      dadoH: 1.2,
      rail: false,
      trim: "metal_dark",
      ceil: "nx_concrete",
      ceilTint: 0x5a5a54,
      doorLeaf: "metal",
      doorTint: 0x3a4a3a,
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // three generators on plinths: body, radiator fins, flywheel, exhaust up through the ceiling
    for (let k = 0; k < 3; k++) {
      const lz = -5.8 + k * 4.4,
        lx = -3.5; // (pushed north: a 1.2 m walkway runs between the south generator and the stair)
      r.bx("concrete", lx - 3.0, 0, lz - 1.1, lx + 3.0, 0.35, lz + 1.1, {
        grime: 0.7,
      });
      r.b.geo("paint_green", T.cyl12, {
        x: r.X(lx),
        y: 1.25,
        z: r.Z(lz),
        rz: PI / 2,
        sx: 0.85,
        sy: 4.2,
        sz: 0.85,
        grime: 0.7,
        tint: 0x5a6a4a,
      });
      for (let f = 0; f < 10; f++)
        r.b.box(
          "metal_dark",
          r.X(lx - 1.9 + f * 0.42),
          0.35,
          r.Z(lz),
          0.05,
          1.8,
          1.9,
          {},
        );
      r.b.geo("metal_dark", T.cyl12, {
        x: r.X(lx + 2.6),
        y: 1.25,
        z: r.Z(lz),
        rz: PI / 2,
        sx: 0.95,
        sy: 0.3,
        sz: 0.95,
      });
      r.b.cyl("rust", r.X(lx - 1.2), 2.0, r.Z(lz), 0.16, 0.16, 4.0, 8, {
        top: false,
      });
      r.b.box(
        "metal_dark",
        r.X(lx + 1.2),
        2.1,
        r.Z(lz + 0.2),
        0.5,
        0.4,
        0.3,
        {},
      );
      r.b.geo("lit_red", T.sphereLo, {
        x: r.X(lx + 1.2),
        y: 2.3,
        z: r.Z(lz + 0.38),
        s: 0.04,
      });
      r.g.add(r.X(lx + 1.2), 2.3, r.Z(lz + 0.5), 0xff4020, "s");
      r.col(lx - 3.0, 0, lz - 1.1, lx + 3.0, 2.2, lz + 1.1, {
        surface: "metal",
      });
      r.b.burn(r.X(lx - 1.2), 2.2, r.Z(lz), 1.2, 0.5);
    }
    // the main breaker panel (east wall): cabinet row, knife switches, glowing gauges
    const PX = 8.8;
    r.bx("metal_dark", PX - 0.5, 0, -4.2, PX + 0.2, 2.6, 1.0, {
      tint: 0x4a5a5a,
    });
    r.col(PX - 0.5, 0, -4.2, PX + 0.2, 2.6, 1.0);
    for (let k = 0; k < 6; k++) {
      const lz = -3.7 + k * 0.85;
      r.b.box("black_metal", r.X(PX - 0.52), 1.2, r.Z(lz), 0.05, 0.6, 0.5, {});
      r.b.beam(
        "chrome",
        r.X(PX - 0.56),
        1.5,
        r.Z(lz),
        r.X(PX - 0.85),
        1.75 - (k % 3 === 1 ? 0.5 : 0),
        r.Z(lz),
        0.03,
      );
      r.b.cyl(
        "paint_white",
        r.X(PX - 0.53),
        2.1,
        r.Z(lz),
        0.12,
        0.12,
        0.02,
        12,
        {},
      );
      r.b.geo(k % 2 ? "lit_green" : "lit_warm", T.sphereLo, {
        x: r.X(PX - 0.55),
        y: 2.35,
        z: r.Z(lz),
        s: 0.04,
      });
      r.g.add(r.X(PX - 0.7), 2.35, r.Z(lz), k % 2 ? 0x60ff60 : 0xffa040, "s");
    }
    board(r, "b_power", r.X(PX - 0.53), 2.9, r.Z(-1.35), 3.0, 0.5, -PI / 2);
    P.signBoard(
      r.b,
      "tsxi",
      K.atlases.tsx_paint.slots.p_danger.rect,
      r.X(PX - 0.53),
      1.45,
      r.Z(0.75),
      0.5,
      0.5,
      -PI / 2,
      { backMat: "metal_dark" },
    );
    A("power_generator", PX - 1.4, -1.35, -PI / 2);
    A("power_panel", PX - 1.4, -1.35, -PI / 2);
    // cable trays + fat cables to the ceiling (the lines up the billboards), fuel drums, a work desk, dry-cell batteries
    r.b.beam("metal", r.X(-8.8), 5.2, r.Z(-6.4), r.X(8.8), 5.2, r.Z(-6.4), 0.3);
    for (let k = 0; k < 4; k++) {
      r.b.beam(
        "rubber",
        r.X(PX - 0.2),
        2.6,
        r.Z(-3.6 + k * 1.3),
        r.X(PX - 0.3),
        5.9,
        r.Z(-6.2 + k * 0.2),
        0.07,
      );
      r.b.beam(
        "rubber",
        r.X(-8.5 + k * 0.3),
        5.25,
        r.Z(-6.35),
        r.X(8.5),
        5.25 + k * 0.05,
        r.Z(-6.35),
        0.05,
      );
    }
    for (let k = 0; k < 7; k++)
      P.barrel(
        r.b,
        r.X(-8.3 + (k % 4) * 0.7),
        0,
        r.Z(5.2 + Math.floor(k / 4) * 0.7),
        k === 3 ? "hazard" : "rust",
        { glows: r.g },
      );
    r.col(-8.7, 0, 4.8, -5.6, 0.9, 6.6);
    // the engineer's bench (battery charging rack) under the landing's edge
    r.bx("wood", 4.0, 0.9, 2.6, 6.4, 0.95, 3.6, {});
    r.bx("metal_dark", 4.05, 0, 2.65, 4.15, 0.9, 3.55, {});
    r.bx("metal_dark", 6.25, 0, 2.65, 6.35, 0.9, 3.55, {});
    r.col(4.0, 0, 2.6, 6.4, 0.95, 3.6);
    for (let k = 0; k < 4; k++) {
      r.b.cyl(
        "metal",
        r.X(4.3 + k * 0.4),
        0.95,
        r.Z(3.25),
        0.09,
        0.09,
        0.22,
        8,
        { tint: 0x8a9a8a },
      );
      r.b.geo("lit_green", T.sphereLo, {
        x: r.X(4.3 + k * 0.4),
        y: 1.19,
        z: r.Z(3.25),
        s: 0.03,
      });
    }
    A("power_engineer", 5.0, 2.0, PI);
    terminal("lma_neon_power", r.X(5.9), 0.95, r.Z(3.0), PI, {
      title: "NEON POWER & LIGHT · LOAD CONTROL",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK · NEON POWER & LIGHT (HELLINGER THEATRE, SUB-BASEMENT)",
      entries: [
        {
          title: "Generator Status",
          text: 'GEN 1 ..... ONLINE  (runs hot, do not lean on it)\nGEN 2 ..... ONLINE  (knocks at 40% load — Wilbur says "character")\nGEN 3 ..... STANDBY (fuel line patched with a boot)\n\nFUEL ON HAND: 11 drums. At current draw: 9 days. At current draw WITH the Ball: 6 days.',
        },
        {
          title: "Load-Shedding Order",
          text: "In a brown-out, cut in THIS order:\n1. The Ball\n2. Billboards (east side)\n3. Billboards (west side)\n4. The Cinder Club's mirror ball\n5. The Opry (they will complain)\n6. The Crossroads Screen\n\nNEVER CUT: the clinic, the gate lamps, the sniper spotlights.",
        },
        {
          title: "Maintenance Log",
          text: '02/11 — replaced breaker 3 with a fork. Temporary.\n02/19 — breaker 3 still a fork.\n03/02 — somebody opened the panel at night. Nothing missing, cables moved, a new splice running down toward the subway side. Somebody scratched a little sun inside the door, twelve rays. Told Kincaid. Kincaid said "rats". Rats do not use screwdrivers.\n03/03 — padlocked the panel. Padlock gone by 03/05.',
        },
      ],
    });
    // ---- the entrance landing (steel grating on posts, 3 m up) and the stair down to the generator floor
    {
      const LY = r.entryY,
        lx0 = 3.4,
        lx1 = 8.95,
        lz0 = 4.6,
        lz1 = 6.98;
      r.bx("metal_dark", lx0, LY - 0.16, lz0, lx1, LY, lz1, {
        tint: 0x5a5e58,
        grime: 0.6,
      });
      r.col(lx0, LY - 0.25, lz0, lx1, LY, lz1, { surface: "metal" });
      for (let k = 0; k < 12; k++)
        r.bx(
          "black_metal",
          lx0 + 0.2 + k * 0.46,
          LY + 0.001,
          lz0 + 0.05,
          lx0 + 0.24 + k * 0.46,
          LY + 0.004,
          lz1 - 0.05,
          {},
        ); // grating bars
      for (const px of [lx0 + 0.1, 6.2, lx1 - 0.1]) {
        r.bx(
          "metal_dark",
          px - 0.08,
          0,
          lz0 + 0.02,
          px + 0.08,
          LY - 0.16,
          lz0 + 0.18,
          {},
        );
        r.col(px - 0.08, 0, lz0 + 0.02, px + 0.08, LY - 0.16, lz0 + 0.18);
      }
      r.b.beam(
        "metal_dark",
        r.X(lx0 + 0.1),
        0.2,
        r.Z(lz0 + 0.1),
        r.X(6.2),
        LY - 0.3,
        r.Z(lz0 + 0.1),
        0.04,
      );
      r.b.beam(
        "metal_dark",
        r.X(6.2),
        0.2,
        r.Z(lz0 + 0.1),
        r.X(lx1 - 0.1),
        LY - 0.3,
        r.Z(lz0 + 0.1),
        0.04,
      );
      // handrail round the landing's open edge (north) + down the stair's open side
      r.b.beam(
        "paint_yellow",
        r.X(lx0 + 0.3),
        LY + 1.0,
        r.Z(lz0 + 0.04),
        r.X(lx1),
        LY + 1.0,
        r.Z(lz0 + 0.04),
        0.035,
      );
      r.b.beam(
        "paint_yellow",
        r.X(lx0 + 0.3),
        LY + 0.5,
        r.Z(lz0 + 0.04),
        r.X(lx1),
        LY + 0.5,
        r.Z(lz0 + 0.04),
        0.025,
      );
      for (let x = lx0 + 0.3; x <= lx1 + 0.01; x += 1.1)
        r.b.beam(
          "paint_yellow",
          r.X(x),
          LY,
          r.Z(lz0 + 0.04),
          r.X(x),
          LY + 1.0,
          r.Z(lz0 + 0.04),
          0.03,
        );
      r.col(lx0 + 0.3, LY, lz0 - 0.02, lx1, LY + 1.05, lz0 + 0.08, {
        walkable: false,
      });
      // west edge of the landing beside the stair head
      r.b.beam(
        "paint_yellow",
        r.X(lx0 + 0.04),
        LY + 1.0,
        r.Z(lz0 + 0.04),
        r.X(lx0 + 0.04),
        LY + 1.0,
        r.Z(5.36),
        0.035,
      );
      r.b.beam(
        "paint_yellow",
        r.X(lx0 + 0.04),
        LY,
        r.Z(lz0 + 0.3),
        r.X(lx0 + 0.04),
        LY + 1.0,
        r.Z(lz0 + 0.3),
        0.03,
      );
      r.col(lx0 - 0.02, LY, lz0, lx0 + 0.08, LY + 1.05, 5.36, {
        walkable: false,
      });
      // stair: bottom at x -2.6, rising east to the landing (15 steps of 20 cm), 1.6 m wide against the south wall
      const sz = 6.18,
        sw = 1.6;
      r.b.stairs("metal_dark", r.X(-2.6), r.Z(sz), 1, 0, sw, 6.0, 0, LY, 15, {
        tint: 0x5a5e58,
        grime: 0.55,
      });
      r.bx(
        "metal_dark",
        -2.6,
        0,
        sz - sw / 2 - 0.06,
        lx0,
        0.12,
        sz - sw / 2,
        {},
      ); // stringer
      // open-side rail from where the drop gets real (the bottom 1.4 m of the flight can be stepped off sideways)
      r.b.beam(
        "paint_yellow",
        r.X(-1.2),
        0.7 + 1.0,
        r.Z(sz - sw / 2 - 0.04),
        r.X(lx0 + 0.3),
        LY + 1.0,
        r.Z(sz - sw / 2 - 0.04),
        0.035,
      );
      for (let k = 0; k <= 4; k++) {
        const x = -1.2 + k * 1.15,
          y = (LY * (x + 2.6)) / 6.0;
        r.b.beam(
          "paint_yellow",
          r.X(x),
          y,
          r.Z(sz - sw / 2 - 0.04),
          r.X(x),
          y + 1.0,
          r.Z(sz - sw / 2 - 0.04),
          0.03,
        );
      }
      K.colRot(
        r.X(1.1),
        r.Z(sz - sw / 2 - 0.04),
        4.6,
        0.08,
        0.7,
        LY + 1.05,
        0,
        { walkable: false },
      );
      for (let k = 0; k < 7; k++)
        r.bx(
          "paint_yellow",
          3.5 + k * 0.8,
          LY + 0.001,
          lz1 - 0.14,
          3.9 + k * 0.8,
          LY + 0.006,
          lz1 - 0.02,
          {},
        ); // hazard edge at the door
      board(r, "b_power", r.X(-0.2), 4.4, r.Z(6.96), 3.0, 0.5, PI);
      lamp(r, r.X(6.2), r.Z(6.1), {
        kind: "cage",
        y: LY + 2.3,
        col: 0xffd8a0,
        pool: 2.4,
        i: 0.5,
        fy: LY,
      });
      lamp(r, r.X(0.4), r.Z(6.1), {
        kind: "cage",
        y: 4.8,
        col: 0xffd8a0,
        pool: 3.0,
        i: 0.45,
        fy: 1.5,
      });
      P.signBoard(
        r.b,
        "tsxi",
        K.atlases.tsx_paint.slots.p_danger.rect,
        r.X(lx1 - 0.6),
        LY + 1.5,
        r.Z(6.96),
        0.5,
        0.5,
        PI,
        { backMat: "metal_dark" },
      );
    }
    poster(r, "q_purge", r.X(-5.2), 2.0, r.Z(6.96), 0.7, 0.92, PI);
    // hazard stripes on the floor round the generators, caged bulbs (one flickering), steam
    for (let k = 0; k < 14; k++)
      r.b.box(
        k % 2 ? "paint_yellow" : "black_metal",
        r.X(-7 + k * 0.5),
        0.005,
        r.Z(-6.8),
        0.5,
        0.01,
        0.12,
        {},
      );
    for (const q of [
      [-3.5, -5.8],
      [-3.5, -1.4],
      [-3.5, 3.0],
      [5.5, -2.0],
      [5.5, 3.0],
    ])
      lamp(r, r.X(q[0]), r.Z(q[1]), {
        kind: "cage",
        y: 4.6,
        col: 0xffd8a0,
        pool: 4.0,
        i: 0.4,
      });
    r.fix.push([
      r.X(2),
      4.2,
      r.Z(-1),
      0xffd8a8,
      { intensity: 1.4, range: 12, flicker: 0.3 },
    ]);
    r.fix.push([
      r.X(PX - 1.2),
      2.4,
      r.Z(-1.35),
      0x9ad8ff,
      { intensity: 0.9, range: 6 },
    ]);
    finish(r);
    return r;
  }

