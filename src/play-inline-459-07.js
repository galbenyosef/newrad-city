// play-inline-459 07 — red
// Lines 1532-1631 of readable/play-inline-459.pretty.js (statement-aligned).
  function rubyKit(R, b) {
    const s = b.s,
      rings = H.torsoRings(b);
    H.cowl(R, b, 0x9a7a3e, { tail: 0, drape: 0 });
    // tape measure hanging round the neck
    const tm = { color: 0xd8b840, rough: 0.6, region: "rags" };
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.sweep(
          [
            [sg * 0.06 * s, 0.27 * s, 0.0],
            [sg * 0.075 * s, 0.18 * s, frontZ(rings, 3, 1.2)],
            [sg * 0.065 * s, 0.02 * s, frontZ(rings, 1, 1.18)],
          ],
          0.006 * s,
          { seg: 8, rs: 3 },
        ),
        tm,
      );
    R.add(
      "forearmL",
      P.xf(
        P.sphere(0.022 * s, 0.016 * s, 0.022 * s, 8, 6),
        0.045 * s,
        -b.fore + 0.06 * s,
        0,
      ),
      cloth(0xa02a2a),
    ); // pincushion
  }
  /** Unkindled: a scrap of Rose's red on every one, cut-down ochre robe pieces. */
  function unkindledKit(R, b, rng, look, o, f, face, who) {
    const s = b.s,
      rings = H.torsoRings(b);
    const red = cloth(RED, { region: "rags" }),
      ochre = cloth(OCHRE, { region: "rags" });
    if (who === "jory") {
      neckerchief(R, b, rings, RED);
      H.accessories(R, b, ["satchel"], rng);
    } else if (who === "pockets") {
      armband(R, b, "R", red, 0.38, 0.045);
      for (let i = 0; i < 6; i++)
        R.add(
          i < 4 ? "chest" : "spine",
          P.xf(
            P.box(0.05 * s, 0.05 * s, 0.022 * s, 0.006 * s),
            (i % 2 ? 1 : -1) * 0.07 * s,
            i < 4 ? (0.12 - (i >> 1) * 0.08) * s : 0.08 * s,
            i < 4
              ? frontZ(rings, i < 2 ? 2 : 1, 1.16)
              : -rings.abdomen[1].rz * 1.2,
          ),
          cloth(0x8a7a54, { region: "rags" }),
        );
    } else if (who === "beanie") {
      R.add(
        "chest",
        P.xf(
          P.box(0.02 * s, 0.12 * s, 0.006 * s, 0.002 * s),
          -0.06 * s,
          0.1 * s,
          frontZ(rings, 2, 1.12),
          0,
          0,
          0.3,
        ),
        red,
      );
    } // red ribbon pinned on
    else if (who === "ash") {
      armband(R, b, "L", red, 0.3, 0.04);
    }
    // a strip of ochre robe worn as a sash
    H.strap(R, b, OCHRE, [-0.85, 0.24], [0.8, -0.06], 1.9, false);
    void ochre;
  }

  // ------------------------------------------------------------------
  // PRESETS
  // ------------------------------------------------------------------
  const ROBE_DAWN = {
    region: "cloth",
    under: 0xe0dacb,
    outer: 0x9a968e,
    open: true,
    len: 0.88,
    underLen: 1.0,
    flare: 0.45,
    stole: null,
    belt: "cord",
    beltC: 0xb8a070,
    sun: "disc",
    sunR: 0.05,
    mantle: 0x5e5a56,
    mantleTrim: 0xb8903a,
    mantleSun: GILT,
    bootH: 0.12,
    boot: 0x3a3026,
  };
