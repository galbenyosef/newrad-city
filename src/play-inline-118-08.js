// play-inline-118 08 — pts
// Lines 1825-1987 of readable/play-inline-118.pretty.js (statement-aligned).
  function gallery(rec, O) {
    const r = Room("gallery", O.x - 25, O.z - 70, 8, 20, 4.2, { doorAt: 0 });
    shell(r, {
      floor: "nx_wood",
      wall: "nx_paper",
      wallTint: 0xc86a4a,
      dado: "nx_wood",
      dadoTint: 0x6a3a1e,
      trim: "wood_dark",
      doorLeaf: "wood",
      doorTint: 0x9a2a1a,
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // the counter with rifle rests across the room, a gap for Annie at the east end
    r.bx("wood_dark", -4, 0, 5.4, 2.6, 1.05, 6.0, {});
    r.bx("wood", -4, 1.05, 5.3, 2.6, 1.12, 6.1, {});
    r.col(-4, 0, 5.4, 2.6, 1.12, 6.0, { surface: "wood" });
    for (const lx of [-2.6, 0, 2.2]) {
      r.b.box("black_metal", r.X(lx), 1.12, r.Z(5.7), 0.3, 0.12, 0.2, {});
      r.b.beam(
        "chrome",
        r.X(lx - 0.6),
        1.17,
        r.Z(5.6),
        r.X(lx - 0.6),
        1.17,
        r.Z(4.6),
        0.03,
      );
    }
    r.bx("wood_dark", 3.2, 0, 5.4, 4, 1.05, 6.0, {});
    r.col(3.2, 0, 5.4, 4, 1.05, 6.0);
    A("gallery_range", 0, 6.8, 0);
    A("gallery_owner", 2.9, 6.6, 1.2);
    // lanes: floor strips, dividers (low), the back wall painted as a raider camp, three rows of tin targets on rails
    for (const lx of [-1.35, 1.35])
      r.bx("wood_dark", lx - 0.05, 0, -9.5, lx + 0.05, 0.9, 5.2, {});
    r.bx("wood", -4, 0.01, -10, 4, 0.02, 5.2, { faces: "t", tint: 0x8a6a4a });
    r.bx("nx_plaster", -3.9, 0, -9.9, 3.9, 4.1, -9.8, {
      tint: 0xc89a6a,
      grime: 0.8,
    });
    const rr = K.rng(3131);
    for (let k = 0; k < 60; k++)
      r.b.box(
        "black_metal",
        r.X(-3.6 + rr() * 7.2),
        0.5 + rr() * 2.8,
        r.Z(-9.79),
        0.05,
        0.05,
        0.01,
        { tint: 0x111111 },
      ); // bullet holes
    for (let row = 0; row < 3; row++) {
      const y = 0.8 + row * 0.9,
        lz = -9.2 + row * 0.2;
      r.b.beam("chrome", r.X(-3.8), y, r.Z(lz), r.X(3.8), y, r.Z(lz), 0.025);
      for (let k = 0; k < 7; k++) {
        const lx = -3.3 + k * 1.1 + (row % 2) * 0.4,
          t = rr();
        if (row === 1) {
          r.b.cyl("metal", r.X(lx), y + 0.02, r.Z(lz), 0.12, 0.12, 0.28, 8, {
            tint: [0xc02a22, 0xd8c040, 0x3a6a9a][k % 3],
          });
        } else if (row === 0) {
          r.b.box("metal", r.X(lx), y, r.Z(lz), 0.34, 0.5, 0.02, {
            tint: 0x9a9a8a,
          });
          r.b.geo("metal", T.sphereLo, {
            x: r.X(lx),
            y: y + 0.62,
            z: r.Z(lz),
            s: 0.13,
            tint: 0x9a9a8a,
          });
        } else {
          r.b.box("paint_yellow", r.X(lx), y, r.Z(lz), 0.42, 0.26, 0.02, {});
          r.b.geo("paint_yellow", T.cone4, {
            x: r.X(lx + 0.24),
            y: y + 0.16,
            z: r.Z(lz),
            rz: -PI / 2,
            sx: 0.08,
            sy: 0.14,
            sz: 0.02,
          });
        }
        void t;
      }
    }
    A("gallery_targets", 0, -9.0, PI, 1.2);
    // prizes: shelf of bears and bottles, bunting, bulbs over the lanes, the ANNIE'S board
    shelf(r, r.X(3.75), r.Z(3.6), -PI / 2, 1.6, 2.0, {
      goods: "mixed",
      seed: 3141,
    });
    for (let k = 0; k < 4; k++)
      r.b.geo("fabric", T.sphereLo, {
        x: r.X(3.5),
        y: 2.25,
        z: r.Z(2.9 + k * 0.45),
        s: 0.16,
        tint: [0x8a5a3a, 0xd8a0b0, 0x6a8ab0, 0xd8d0b0][k],
      });
    for (const lz of [-7, -3, 1]) {
      const pts = r.b.cable(
        "rust",
        r.X(-3.9),
        3.6,
        r.Z(lz),
        r.X(3.9),
        3.6,
        r.Z(lz),
        0.3,
        0.012,
        10,
      );
      for (let i = 1; i < pts.length - 1; i++)
        r.b.quad(
          "fabric",
          [pts[i][0] - 0.18, pts[i][1], pts[i][2]],
          [pts[i][0] + 0.18, pts[i][1], pts[i][2]],
          [pts[i][0], pts[i][1] - 0.35, pts[i][2]],
          [pts[i][0], pts[i][1] - 0.35, pts[i][2]],
          { double: true, tint: [0xc02a22, 0xf0d040, 0x2a6ac0][i % 3] },
        );
    }
    for (const lx of [-2.7, 0, 2.7])
      for (const lz of [-8.6, -4.5])
        lamp(r, r.X(lx), r.Z(lz), {
          kind: "bulb",
          y: 3.3,
          col: 0xffe0a0,
          pool: 2.2,
          i: 0.5,
        });
    lamp(r, r.X(0), r.Z(7.5), {
      kind: "enamel",
      y: 3.2,
      shade: "paint_red",
      light: 1.0,
    });
    r.fix.push([
      r.X(0),
      3.0,
      r.Z(-8.0),
      0xffe8c0,
      { intensity: 1.4, range: 10 },
    ]);
    board(r, "b_gallery", r.X(0), 3.2, r.Z(5.2), 3.2, 0.55, PI);
    neonSign(r, "x_target", r.X(-3.9), 2.4, r.Z(8.0), 0.9, PI / 2, 0xff4040);
    note("lma_neon_note_scorecard", r.X(-3.3), 1.13, r.Z(5.7), {
      name: "Annie's High Scores",
      title: "Ammo Annie's — High Scores",
      value: 1,
      text: "HIGH SCORES (30 SECONDS, 5 SCRIP)\n\n1. ANNIE ......... 48 (house record, do not ask for a rematch)\n2. KINCAID ....... 41\n3. 'DEADEYE' DOYLE . 37 (disputed — shot the duck rail)\n4. SMILEY ........ 12 (shot the lamp)\n5. MAYOR CROWE .... 3 (ran for office instead)\n\nBEAT ANNIE, WIN THE BEAR.\nNobody has won the bear.",
    });
    finish(r);
    return r;
  }

