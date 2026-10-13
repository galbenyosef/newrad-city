// play-inline-457 18 — rings
// Lines 4386-4667 of readable/play-inline-457.pretty.js (statement-aligned).
  OUT.doctor = function (R, b, rng, look, o) {
    Object.assign(look, {
      top: 0x7a8a9a,
      bottom: 0x3a3a40,
      sleeve: "long",
      sleeveColor: PAL.labWhite,
      glove: rng.chance(0.4) ? 0x9ab0b8 : null,
      boot: 0x222222,
      bootH: 0.15,
    });
    H.body(R, b, look);
    labCoat(R, b, PAL.labWhite);
    // red cross armband (left upper arm) + stethoscope
    R.add(
      "armL",
      P.xf(
        P.cyl(0.066 * b.limbR, 0.066 * b.limbR, 0.06 * b.s, 12, true),
        0,
        -b.upper * 0.35,
        0,
      ),
      { color: 0xffffff, region: "redcross", rough: 0.9, noise: 0.03 },
    );
    const rings = H.torsoRings(b);
    R.add(
      "chest",
      P.sweep(
        [
          [-0.06 * b.s, 0.24 * b.s, -0.02 * b.s],
          [-0.09 * b.s, 0.12 * b.s, -rings.chest[1].rz * 1.12],
          [-0.03 * b.s, 0.02 * b.s, -rings.chest[1].rz * 1.14],
          [0.03 * b.s, 0.02 * b.s, -rings.chest[1].rz * 1.14],
          [0.09 * b.s, 0.12 * b.s, -rings.chest[1].rz * 1.12],
          [0.06 * b.s, 0.24 * b.s, -0.02 * b.s],
        ],
        0.005 * b.s,
        { seg: 20, rs: 4 },
      ),
      { color: 0x222222, rough: 0.5 },
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.016 * b.s, 0.016 * b.s, 0.008 * b.s, 10),
        0,
        0.0,
        -rings.chest[1].rz * 1.16,
        PI / 2,
        0,
        0,
      ),
      metalM(0xc0c0c0),
    );
    H.glasses(R, b, "round");
  };
  function labCoat(R, b, color) {
    const rings = H.torsoRings(b);
    const m = cloth(color, { rough: 0.85, grad: [0.85, 1.05] });
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.06), {
        seg: 18,
        a0: PI * 0.07,
        a1: PI * 1.93,
      }),
      m,
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.08), {
        seg: 18,
        a0: PI * 0.07,
        a1: PI * 1.93,
      }),
      m,
    );
    R.add(
      "hips",
      P.loft(scaleRings(rings.pelvis.slice(2), 1.1), {
        seg: 18,
        a0: PI * 0.07,
        a1: PI * 1.93,
      }),
      m,
    );
    H.coatTails(R, b, m, 0.55, 0.15);
    // lapels + pockets
    for (const sg of [-1, 1]) {
      R.add(
        "chest",
        P.xf(
          P.box(0.045 * b.s, 0.16 * b.s, 0.01 * b.s, 0.003),
          sg * 0.06 * b.s,
          0.14 * b.s,
          -rings.chest[2].rz * 1.08,
          0.15,
          sg * 0.3,
          sg * 0.25,
        ),
        m,
      );
      R.add(
        "hips",
        P.xf(
          P.box(0.08 * b.s, 0.07 * b.s, 0.01 * b.s, 0.003),
          sg * 0.1 * b.s,
          0.0,
          -rings.pelvis[2].rz * 1.13,
        ),
        cloth(L.shade(color, 0.93)),
      );
    }
    R.add(
      "chest",
      P.xf(
        P.box(0.06 * b.s, 0.06 * b.s, 0.008 * b.s, 0.002),
        -0.09 * b.s,
        0.09 * b.s,
        -rings.chest[2].rz * 1.09,
      ),
      cloth(L.shade(color, 0.93)),
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.004 * b.s, 0.004 * b.s, 0.06 * b.s, 5),
        -0.1 * b.s,
        0.12 * b.s,
        -rings.chest[2].rz * 1.1,
      ),
      metalM(0x2a4a8a),
    );
  }
  H.labCoat = labCoat;

  OUT.lab_coat = function (R, b, rng, look, o) {
    Object.assign(look, {
      top: rng.pick([0xc8c8c0, 0x9ab0c8]),
      bottom: rng.pick([0x3a3a40, 0x5a4a3a]),
      sleeve: "long",
      sleeveColor: PAL.labWhite,
      boot: 0x1a1a1a,
      bootH: 0.12,
      laces: false,
    });
    H.body(R, b, look);
    labCoat(R, b, PAL.labWhite);
    // tie
    const rings = H.torsoRings(b);
    R.add(
      "chest",
      P.xf(
        P.box(0.03 * b.s, 0.16 * b.s, 0.008 * b.s, 0.003),
        0,
        0.13 * b.s,
        -rings.chest[2].rz * 1.06,
        0.12,
        0,
        0,
      ),
      cloth(rng.pick([0x7a1a1a, 0x1a2a5a, 0x2a4a2a])),
    );
    H.glasses(R, b, rng.chance(0.5) ? "round" : "square");
  };

  /** Glowkeepers: bleached linen / ochre robes, a golden stole, a big twelve-ray sun disc on the chest and a twelve-ray sun pendant. */
  OUT.glowkeeper_robes = function (R, b, rng, look, o) {
    const robe = rng.pick([0xa89878, 0x8a6a3a, 0x9a8a6a, 0x6e4e3a]),
      gold = PAL.sunGold;
    Object.assign(look, {
      top: robe,
      topRegion: "rags",
      bottom: robe,
      bottomRegion: "rags",
      sleeve: "long",
      boot: 0x3a2a1a,
      bootH: 0.15,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const m = cloth(robe, { region: "rags" });
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.06), { seg: 16 }),
      m,
    );
    R.add("spine", P.loft(scaleRings(rings.abdomen, 1.1), { seg: 16 }), m);
    R.add(
      "hips",
      P.loft(scaleRings(rings.pelvis.slice(1), 1.14), { seg: 16 }),
      m,
    );
    H.coatTails(R, b, m, 0.95, 0.5, true);
    for (const S of ["L", "R"])
      R.add(
        "forearm" + S,
        P.xf(
          P.cyl(0.075 * b.s, 0.1 * b.s, b.fore * 0.62, 12, true),
          0,
          -b.fore * 0.55,
          0,
        ),
        m,
      ); // bell sleeves
    // golden stole hanging from the shoulders down the front
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.045 * b.s, 0.42 * b.s, 0.008 * b.s, 0.003 * b.s),
          sg * 0.06 * b.s,
          0.02 * b.s,
          -rings.chest[2].rz * 1.09,
          0.06,
          0,
          sg * 0.04,
        ),
        cloth(gold, { region: "rags", rough: 0.7 }),
      );
    R.add(
      "spine",
      P.xf(
        P.torus(rings.abdomen[0].rx * 1.14, 0.014 * b.s, 5, 18),
        0,
        0.0,
        0,
        PI / 2,
        0,
        0,
        1,
        rings.abdomen[0].rz / rings.abdomen[0].rx,
        1,
      ),
      cloth(0x7a5a2a, { region: "rags" }),
    ); // cord belt
    R.decal(
      "chest",
      "sundisc",
      0.15 * b.s,
      0.15 * b.s,
      0,
      0.1 * b.s,
      -rings.chest[2].rz * 1.1 - 0.004,
      0,
      0,
      0,
      { emis: 0.9 },
    );
    // pendant: a beaten-brass sun disc with short rays on a cord
    const pz = -rings.chest[2].rz * 1.14;
    R.add(
      "chest",
      P.xf(
        P.cyl(0.03 * b.s, 0.03 * b.s, 0.006 * b.s, 16),
        0,
        -0.04 * b.s,
        pz - 0.006 * b.s,
        PI / 2,
        0,
        0,
      ),
      metalM(0xc8962a, { rough: 0.35, metal: 0.9 }),
    );
    for (let i = 0; i < 12; i++) {
      const a2 = (i / 12) * PI * 2;
      R.add(
        "chest",
        P.xf(
          P.cone(0.006 * b.s, 0.018 * b.s, 4),
          Math.cos(a2) * 0.04 * b.s,
          -0.04 * b.s + Math.sin(a2) * 0.04 * b.s,
          pz - 0.006 * b.s,
          0,
          0,
          a2 - PI / 2,
        ),
        metalM(0xc8962a, { rough: 0.35, metal: 0.9 }),
      );
    }
    H.hat(R, b, "hood", robe);
  };

