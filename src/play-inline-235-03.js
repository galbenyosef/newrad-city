// play-inline-235 03 — loby
// Lines 128-381 of readable/play-inline-235.pretty.js (statement-aligned).
  D.un_assembly = function (C) {
    const LOBY = 3.6,
      LCEIL = LOBY + 9.5;
    for (const x of [-20, 24]) flickerTube(C, x, 3.75, 19.2, 0, 1.3, 0.6); // backstage corridor
    // the Continuity's arrival kill-zone: floodlights on the doors, a field generator, ammo crates, cable runs
    floodlight(C, -5.2, LOBY, -32.4, 0.25);
    floodlight(C, 6.8, LOBY, -32.8, -0.3);
    C.b.box("metal_olive", -12.6, LOBY, -32.2, -11.2, LOBY + 0.85, -31.4, {
      c: 0x6a6e5a,
    });
    C.b.cyl("metal_dark", -12.3, LOBY + 0.85, -31.8, 0.08, 0.08, 0.35, 8);
    C.b.box(
      "lamp_green",
      -11.25,
      LOBY + 0.55,
      -32.0,
      -11.18,
      LOBY + 0.65,
      -31.9,
    );
    C.col(-12.6, LOBY, -32.2, -11.2, LOBY + 0.85, -31.4, {
      walkable: false,
      surface: "metal",
    });
    cable(
      C,
      [
        [-11.2, -31.8],
        [-8.4, -32.6],
        [-5.6, -32.3],
      ],
      LOBY,
    );
    cable(
      C,
      [
        [-11.2, -31.6],
        [-2.4, -31.2],
        [3.2, -31.6],
        [6.5, -32.6],
      ],
      LOBY,
    );
    F.crates(C, -18.5, LOBY, -32.6, 3, 0.1, { key: "metal_olive" });
    F.crates(C, 16.8, LOBY, -32.2, 4, -0.2, { key: "metal_olive" });
    C.prop("ammo_box", 16.2, LOBY, -33.6, 0.4, { loot: "ammo_box" });
    // daylight through the north glass front (z −44, x −12..12), raking south and down across the lobby
    for (const x of [-9.6, -4.8, 0, 4.8, 9.6])
      A.shaft(
        C,
        [x, LCEIL - 2.2, -43.9],
        [0.18, -0.62, 1],
        15,
        2.0,
        3.6,
        DAY,
        0.085,
      );
    A.dust(C, -28, LOBY + 0.3, -43, 28, LCEIL - 0.6, 0, 260);
    A.dust(C, -24, 1.5, -16, 24, 16, 16, 380); // the Assembly hall under the dome
    A.dust(C, 31, LOBY + 0.3, -33, 49, LOBY + 4, -15, 60); // delegates' lounge
    // lobby breakup (round 3): a bay of the lobby ceiling has come down on the east side — torn acoustic tiles, joists
    // and conduit hanging into a rubble mound — and a velvet-rope queue funnels visitors to the checkpoint gap
    {
      const b = C.b,
        cx = 19,
        cz = -13,
        cy = LCEIL;
      b.box(
        "black",
        cx - 3.2,
        cy - 0.06,
        cz - 2.4,
        cx + 3.2,
        cy - 0.02,
        cz + 2.4,
        { noBake: true },
      );
      for (let k = 0; k < 5; k++)
        b.box(
          "wood_rotten",
          cx - 3.2,
          cy - 0.4,
          cz - 2.2 + k * 1.1,
          cx + 3.2,
          cy - 0.12,
          cz - 2.0 + k * 1.1,
        );
      for (let k = 0; k < 4; k++)
        b.obox(
          "plaster",
          cx - 2 + k * 1.3,
          cy - 1.2 - k * 0.5,
          cz - 2.2 + (k % 2) * 0.4,
          1.2,
          0.05,
          1.8,
          0.2 * k,
          { rx: 0.9 + k * 0.15 },
        );
      b.rod(
        "rubber",
        [cx - 1.5, cy - 0.2, cz - 1],
        [cx - 0.8, cy - 3.4, cz - 0.4],
        0.02,
      );
      b.rod(
        "rubber",
        [cx + 1.2, cy - 0.2, cz + 0.6],
        [cx + 1.8, cy - 4.6, cz + 1.4],
        0.02,
      );
      b.rod(
        "steel",
        [cx + 2.5, cy - 0.3, cz - 2],
        [cx + 1.4, LOBY + 0.4, cz - 0.5],
        0.05,
      );
      F.rubble(C, cx, LOBY, cz, 2.4, 131, {
        h: 0.55,
        col: true,
        n: 16,
        chunk: "plaster",
      });
      A.shaft(C, [cx, cy - 0.1, cz], [0.05, -1, 0.1], 9, 2.2, 3.2, DAY, 0.05);
      const post = (x, z) => {
        b.cyl("brass", x, LOBY, z, 0.16, 0.18, 0.04, 10);
        b.cyl("brass", x, LOBY + 0.04, z, 0.03, 0.03, 0.9, 6);
        b.sphere("brass", x, LOBY + 0.97, z, 0.05);
        C.col(x - 0.1, LOBY, z - 0.1, x + 0.1, LOBY + 1, z + 0.1, {
          walkable: false,
          surface: "metal",
        });
      };
      const rope = (a, q) => {
        const m = [(a[0] + q[0]) / 2, (a[1] + q[1]) / 2];
        b.rod(
          "fabric_red",
          [a[0], LOBY + 0.9, a[1]],
          [m[0], LOBY + 0.72, m[1]],
          0.022,
        );
        b.rod(
          "fabric_red",
          [m[0], LOBY + 0.72, m[1]],
          [q[0], LOBY + 0.9, q[1]],
          0.022,
        );
      };
      for (const s of [-1, 1]) {
        const pts = [
          [s * 1.6, -34.8],
          [s * 1.6, -36.8],
        ];
        pts.forEach((p) => post(p[0], p[1]));
        if (s < 0) rope(pts[0], pts[1]);
      }
      b.rod(
        "fabric_red",
        [1.6, LOBY + 0.9, -34.8],
        [1.75, LOBY + 0.03, -35.4],
        0.022,
      );
      b.rod(
        "fabric_red",
        [1.75, LOBY + 0.03, -35.4],
        [1.9, LOBY + 0.03, -36.6],
        0.022,
      ); // one rope unhooked
      // the way out, from inside: lettered transom over the bronze doors
      b.quad(
        LI.texMat(
          "un_exit",
          LI.signTex(
            "un_exit",
            ["EXIT · SORTIE", "UNITED NATIONS PLAZA"],
            { bg: "#1c2a3a", fg: "#e8e0c8", size: 46 },
            512,
            128,
          ),
          { rough: 0.7 },
        ),
        0,
        LOBY + 3.35,
        -44.05,
        2.6,
        0.62,
        0,
        { noAO: true },
      );
      for (const s of [-1, 1])
        b.box(
          "steel",
          s * 0.72 - 0.5,
          LOBY + 1.05,
          -44.19,
          s * 0.72 + 0.5,
          LOBY + 1.11,
          -44.13,
        );
    }
    // clutter: evacuation litter in the lobby, the tiers and the well, Continuity-tidy offices
    F.clutter(C, -29.5, -43.5, 29.5, 1.8, LOBY, {
      n: 150,
      seed: 11,
      mix: {
        paper: 7,
        crumple: 2,
        can: 1,
        bottle: 1,
        chunk: 2,
        plank: 0.3,
        box: 1,
      },
    });
    F.clutter(C, -28, -18, 28, 17.2, 0, {
      yMax: 3.7,
      n: 110,
      seed: 12,
      edge: 0.6,
      mix: {
        paper: 8,
        crumple: 2,
        can: 0.6,
        bottle: 0.8,
        chunk: 3,
        plank: 0.3,
        box: 0.2,
      },
    });
    F.clutter(C, -30, 17.5, 50, 21, 0, { n: 36, seed: 13, mix: TIDY });
    F.clutter(C, 30.6, -8.8, 49.8, 17.2, 0, {
      yMax: 3.7,
      n: 30,
      seed: 14,
      mix: TIDY,
    });
    F.clutter(C, 30.6, -33.8, 49.8, -14.2, LOBY, {
      n: 30,
      seed: 15,
      mix: {
        paper: 2,
        crumple: 1,
        can: 1,
        bottle: 3,
        chunk: 0.4,
        plank: 0,
        box: 0.3,
      },
    });
    F.clutter(C, 50.5, 6.2, 63.8, 23.8, 0, { n: 16, seed: 16, mix: TIDY });
  };

  // ------------------------------------------------------------------ 30 ROCK
