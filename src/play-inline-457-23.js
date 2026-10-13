// play-inline-457 23 — add
// Lines 5981-6256 of readable/play-inline-457.pretty.js (statement-aligned).
  H.continuityRig = function (R, b, rng, o) {
    const s = b.s,
      uni = 0x6a6e70,
      uniDark = 0x4a4e52,
      steel = 0x8a8e90;
    const look = {
      top: uni,
      bottom: uni,
      sleeve: "long",
      cuff: uniDark,
      boot: 0x1e1e1e,
      bootH: 0.36,
      laces: true,
      glove: 0x2a2a2a,
      armMul: 1.15,
      legMul: 1.1,
    };
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const armor = (c, extra) =>
      metalM(
        c,
        Object.assign(
          {
            metal: 0.5,
            rough: 0.48,
            noise: 0.12,
            region: "metal",
            rigid: true,
          },
          extra || {},
        ),
      );
    const A = armor(steel),
      D = armor(uniDark, { metal: 0.3, rough: 0.6 });
    // breastplate + back plate, webbing, pouches
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.22, 1.28), {
        seg: 18,
        capTop: false,
      }),
      A,
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.2, 1.24), {
        seg: 16,
        a0: -PI * 0.45,
        a1: PI * 0.45,
      }),
      D,
    );
    H.belt(R, b, 0x2a2c2e, 0x9a9c98, 3);
    H.strap(R, b, 0x2a2c2e, [-0.5, 0.26], [-0.45, -0.05], 1.0);
    H.strap(R, b, 0x2a2c2e, [0.5, 0.26], [0.45, -0.05], 1.0);
    R.decal(
      "chest",
      "continuity",
      0.09 * s,
      0.09 * s,
      -0.09 * s,
      0.13 * s,
      -rings.chest[2].rz * 1.29 - 0.004,
      0.05,
      -0.2,
      0,
    );
    for (const S of ["L", "R"]) {
      const sg = S === "L" ? -1 : 1;
      R.add(
        "arm" + S,
        P.xf(
          P.sphere(
            0.09 * s,
            0.07 * s,
            0.095 * s,
            12,
            7,
            0,
            PI * 2,
            0,
            PI * 0.55,
          ),
          sg * 0.005 * s,
          0.01 * s,
          0,
          0,
          0,
          sg * -0.3,
        ),
        A,
      ); // shoulder cap
      if (S === "L")
        R.decal(
          "arm" + S,
          "continuity",
          0.06 * s,
          0.06 * s,
          sg * 0.072 * s,
          -0.06 * s,
          0,
          0,
          (sg * -PI) / 2,
          0,
        );
      // light leg frame: thin struts with a knee hinge
      R.add(
        "thigh" + S,
        P.xf(
          P.cyl(0.012 * s, 0.012 * s, b.thigh * 0.85, 6),
          sg * 0.075 * s,
          -b.thigh * 0.5,
          0,
        ),
        A,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.cyl(0.04 * s, 0.04 * s, 0.05 * s, 10),
          sg * 0.075 * s,
          0,
          0,
          0,
          0,
          PI / 2,
        ),
        D,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.cyl(0.012 * s, 0.012 * s, b.shin * 0.85, 6),
          sg * 0.075 * s,
          -b.shin * 0.5,
          0,
        ),
        A,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.1 * s, 0.11 * s, 0.04 * s, 0.015 * s),
          0,
          0,
          -0.07 * s,
          -0.1,
          0,
          0,
        ),
        A,
      ); // knee plate
    }
    // helmet (steel pot with a short brim) + full-face respirator
    const hs = b.headS,
      C = [0, 0.1 * hs, 0];
    const pot = P.sphere(
      0.135 * hs,
      0.12 * hs,
      0.148 * hs,
      20,
      12,
      0,
      PI * 2,
      0,
      PI * 0.55,
    );
    R.add("head", P.xf(pot, C[0], C[1] + 0.06 * hs, C[2] + 0.005 * hs), A);
    R.add(
      "head",
      P.xf(
        P.torus(0.14 * hs, 0.008 * hs, 4, 22),
        C[0],
        C[1] + 0.06 * hs,
        C[2] + 0.005 * hs,
        PI / 2,
        0,
        0,
        1,
        1.08,
        1,
      ),
      A,
    );
    const mask = P.sphere(
      0.115 * hs,
      0.12 * hs,
      0.12 * hs,
      18,
      12,
      PI * 0.95,
      PI * 1.1,
      PI * 0.18,
      PI * 0.62,
    );
    R.add("head", P.xf(mask, C[0], C[1] - 0.005 * hs, C[2] - 0.012 * hs), {
      color: 0x2a2c2e,
      region: "rubber",
      rough: 0.7,
    });
    for (const sg of [-1, 1]) {
      R.add(
        "head",
        P.xf(
          P.cyl(0.032 * hs, 0.034 * hs, 0.02 * hs, 16),
          C[0] + sg * 0.045 * hs,
          C[1] + 0.02 * hs,
          C[2] - 0.12 * hs,
          PI / 2,
          0,
          0,
        ),
        D,
      );
      R.add(
        "head",
        P.xf(
          P.cyl(0.027 * hs, 0.027 * hs, 0.006 * hs, 16),
          C[0] + sg * 0.045 * hs,
          C[1] + 0.02 * hs,
          C[2] - 0.131 * hs,
          PI / 2,
          0,
          0,
        ),
        { color: 0x30383a, rough: 0.05, metal: 0.5, emis: 0.12, keepLod: true },
      );
    }
    R.add(
      "head",
      P.xf(
        P.cyl(0.036 * hs, 0.04 * hs, 0.05 * hs, 14),
        C[0],
        C[1] - 0.07 * hs,
        C[2] - 0.13 * hs,
        PI / 2 - 0.4,
        0,
        0,
      ),
      D,
    );
    R.add(
      "head",
      P.xf(
        P.cyl(0.032 * hs, 0.032 * hs, 0.006 * hs, 14),
        C[0],
        C[1] - 0.081 * hs,
        C[2] - 0.153 * hs,
        PI / 2 - 0.4,
        0,
        0,
      ),
      { color: 0xffffff, region: "grille", rough: 0.6, metal: 0.4 },
    );
    R.decal(
      "head",
      "continuity",
      0.05 * hs,
      0.05 * hs,
      C[0],
      C[1] + 0.13 * hs,
      C[2] - 0.115 * hs,
      -0.5,
      0,
      0,
    );
  };

  /**
   * Role accessories for crowds (G.chars.crowdLook): 'apron' (trader /
   * bartender / grill cook), 'satchel' (shoulder bag across the body),
   * 'bandolier' (ammo belt), 'rag' (bar towel over the shoulder), 'ledger'
   * (account book at the hip), 'pack' (small backpack), 'bigpack' (trader's
   * pack with pots). Stacked in any combination.
   */
