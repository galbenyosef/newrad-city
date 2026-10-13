// play-inline-118 17 — tint
// Lines 4298-4487 of readable/play-inline-118.pretty.js (statement-aligned).
  function club(rec, O) {
    const r = Room("club", O.x + 65, O.z + 25, 14, 12, 4.5, {
      doorAt: 0,
      grime: 0.25,
    });
    shell(r, {
      floor: "nx_checker",
      floorTint: 0xd8c8e8,
      wall: "nx_velvet_purple",
      dado: "nx_wood",
      dadoTint: 0x2a0a1a,
      trim: "chrome",
      railMat: "chrome",
      ceil: "nx_tin",
      ceilTint: 0x2a1a2a,
      doorLeaf: "fabric",
      doorTint: 0x5a1030,
      doorFrame: "chrome",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // the little stage (NW) with a mic in a spot, the Cinder Club neon behind, a piano
    r.bx("wood_dark", -7, 0, -6, -1.5, 0.45, -3.2, { tint: 0x3a1a2a });
    r.col(-7, 0, -6, -1.5, 0.45, -3.2, { surface: "wood" });
    r.bx("chrome", -7, 0.42, -3.24, -1.5, 0.47, -3.18, {});
    r.b.beam(
      "black_metal",
      r.X(-4.2),
      0.45,
      r.Z(-4.2),
      r.X(-4.2),
      1.95,
      r.Z(-4.2),
      0.02,
    );
    r.b.geo("chrome", T.sphereLo, {
      x: r.X(-4.2),
      y: 2.0,
      z: r.Z(-4.2),
      s: 0.07,
    });
    neonSign(r, "x_cinder", r.X(-4.2), 2.9, r.Z(-5.95), 3.4, 0, 0xff6ad0, "l");
    r.sp.add(r.X(-4.2), r.Z(-4.2), 0xffe0f0, 1.8, { y: 0.48, i: 0.8 });
    r.b.beam(
      "black_metal",
      r.X(-4.2),
      4.5,
      r.Z(-2.4),
      r.X(-4.2),
      4.0,
      r.Z(-2.4),
      0.02,
    );
    r.b.cyl("black_metal", r.X(-4.2), 3.7, r.Z(-2.4), 0.16, 0.24, 0.4, 8, {});
    r.g.add(r.X(-4.2), 3.65, r.Z(-2.5), 0xfff0f8, "m");
    r.bx("wood_dark", -6.9, 0.45, -5.95, -5.5, 1.75, -5.3, { tint: 0x1a1a1a });
    r.col(-6.9, 0.45, -5.95, -5.5, 1.75, -5.3);
    A("club_host", -4.2, -4.6, PI, 0.45);
    A("club_stage", -4.2, -4.6, PI, 0.45);
    // the bar (east wall): padded front, chrome top, mirrored back bar with glowing bottles, stools
    r.bx("fabric", 4.6, 0, -4.8, 5.4, 1.1, 2.4, { tint: 0x5a1030 });
    r.bx("chrome", 4.5, 1.1, -4.9, 5.5, 1.15, 2.5, {});
    r.col(4.6, 0, -4.8, 5.4, 1.15, 2.4, { surface: "wood" });
    r.b.panel("glass", r.X(6.95), 2.0, r.Z(-1.2), 5.8, 1.6, -PI / 2, {
      tint: 0xa0a0c0,
    });
    for (let i = 0; i < 2; i++) {
      r.bx("glass", 6.5, 1.3 + i * 0.6, -4.0, 6.95, 1.33 + i * 0.6, 1.6, {});
      for (let k = 0; k < 16; k++)
        r.b.cyl(
          "lit_warm",
          r.X(6.7),
          1.33 + i * 0.6,
          r.Z(-3.8 + k * 0.34),
          0.04,
          0.035,
          0.26,
          6,
          { tint: [0xff60c0, 0x60c0ff, 0xffc040, 0x80ff80][(k + i) % 4] },
        );
    }
    r.g.add(r.X(6.4), 1.7, r.Z(-1.2), 0xff80d0, "l");
    neonSign(
      r,
      "x_cocktail",
      r.X(6.95),
      3.4,
      r.Z(-1.2),
      2.6,
      -PI / 2,
      0xff9a3a,
    );
    for (let k = 0; k < 5; k++) {
      const lz = -4.0 + k * 1.4;
      r.b.cyl("chrome", r.X(4.1), 0, r.Z(lz), 0.04, 0.04, 0.75, 6, {});
      r.b.cyl("fabric", r.X(4.1), 0.75, r.Z(lz), 0.2, 0.2, 0.08, 10, {
        tint: 0xd84080,
      });
    }
    A("club_bar", 6.0, -1.2, PI / 2);
    // round booths with tables, a mirror ball, pink tubes along the ceiling
    const booth = (lx, lz, f) => {
      for (let k = 0; k < 7; k++) {
        const a = f - PI / 2 + (k * PI) / 6;
        r.b.box(
          "fabric",
          r.X(lx + Math.sin(a) * 1.0),
          0,
          r.Z(lz + Math.cos(a) * 1.0),
          0.55,
          0.45,
          0.5,
          { yaw: a, tint: 0xa01a5a },
        );
        r.b.box(
          "fabric",
          r.X(lx + Math.sin(a) * 1.25),
          0.45,
          r.Z(lz + Math.cos(a) * 1.25),
          0.6,
          0.55,
          0.15,
          { yaw: a, tint: 0x8a1450 },
        );
      }
      r.b.cyl("chrome", r.X(lx), 0, r.Z(lz), 0.05, 0.05, 0.72, 6, {});
      r.b.cyl("black_metal", r.X(lx), 0.72, r.Z(lz), 0.5, 0.5, 0.04, 14, {});
      r.b.cyl("lit_warm", r.X(lx), 0.76, r.Z(lz), 0.05, 0.05, 0.1, 6, {
        tint: 0xff80c0,
      });
      r.g.add(r.X(lx), 0.95, r.Z(lz), 0xff80c0, "s");
      r.sp.add(r.X(lx), r.Z(lz), 0xff70c0, 1.8, { y: 0.03, i: 0.45 });
      r.col(lx - 0.55, 0, lz - 0.55, lx + 0.55, 0.75, lz + 0.55);
    };
    booth(-5.2, 1.0, -PI / 2);
    booth(-5.2, 4.2, -PI / 2);
    booth(0.5, -3.8, 0);
    A("club_patron_1", -4.3, 1.0, -PI / 2);
    A("club_patron_2", -4.3, 4.2, -PI / 2);
    A("club_patron_3", 0.5, -2.9, 0);
    A("club_patron_4", 4.1, 0.2, -PI / 2);
    r.b.beam(
      "black_metal",
      r.X(0.5),
      4.5,
      r.Z(1.0),
      r.X(0.5),
      3.6,
      r.Z(1.0),
      0.015,
    );
    r.b.geo("chrome", T.sphere, { x: r.X(0.5), y: 3.3, z: r.Z(1.0), s: 0.32 });
    const rr = K.rng(2121);
    for (let k = 0; k < 14; k++)
      r.g.add(
        r.X(0.5 + (rr() - 0.5) * 12),
        0.4 + rr() * 3.6,
        r.Z(1.0 + (rr() - 0.5) * 10),
        [0xffffff, 0xffa0e0, 0xa0c0ff][k % 3],
        "s",
      );
    for (const sd of [-1, 1]) {
      r.b.beam(
        "lit_warm",
        r.X(-6.8),
        4.3,
        r.Z(sd * 5.8),
        r.X(6.8),
        4.3,
        r.Z(sd * 5.8),
        0.04,
        { tint: 0xff6ad0 },
      );
      r.g.add(r.X(-3), 4.25, r.Z(sd * 5.6), 0xff6ad0, "m");
      r.g.add(r.X(3), 4.25, r.Z(sd * 5.6), 0xff6ad0, "m");
    }
    r.bx("nx_velvet", -1.4, 0, 5.8, -0.8, 3.2, 5.95, {});
    r.bx("nx_velvet", 0.8, 0, 5.8, 1.4, 3.2, 5.95, {});
    r.fix.push([r.X(-1), 3.6, r.Z(0), 0xff90d8, { intensity: 1.3, range: 11 }]);
    r.fix.push([
      r.X(-4.2),
      3.4,
      r.Z(-3.2),
      0xfff0f8,
      { intensity: 1.2, range: 6 },
    ]);
    finish(r);
    return r;
  }

