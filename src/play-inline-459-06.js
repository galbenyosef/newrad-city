// play-inline-459 06 — rings
// Lines 1193-1531 of readable/play-inline-459.pretty.js (statement-aligned).
  OUT.cast_rose = function (R, b, rng, look, o) {
    const s = b.s,
      jacket = 0x7a7450,
      shirt = 0x5e6670,
      pants = 0x5e5644;
    Object.assign(look, {
      top: shirt,
      topRegion: "cloth",
      bottom: pants,
      bottomRegion: "rags",
      sleeve: "long",
      sleeveColor: jacket,
      sleeveRegion: "rags",
      boot: 0x2a1c12,
      bootH: 0.55,
      laces: true,
      glove: 0x2c2018,
    });
    H.body(R, b, look);
    const wax2 = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const h = L.hash3(wx * 60, wy * 60, wz * 60);
      if (h > 0.8) {
        out[0] *= 0.86;
        out[1] *= 0.86;
        out[2] *= 0.84;
      }
    }; // waxed canvas
    const m = cloth(jacket, { region: "rags", paint: wax2, rough: 0.75 });
    const rings = shell(R, b, m, 1.07, 0.36);
    H.coatTails(R, b, m, 0.17, 0.12, false);
    R.add(
      "chest",
      P.xf(
        P.torus(0.072 * s, 0.02 * s, 6, 18),
        0,
        0.252 * s,
        0.01 * s,
        PI / 2 + 0.42,
        0,
        0,
        1.2,
        1.05,
        1,
      ),
      m,
    ); // turned-up collar
    for (const sg of [-1, 1]) {
      // chest pockets with flaps, hip pockets
      R.add(
        "chest",
        P.xf(
          P.box(0.06 * s, 0.065 * s, 0.014 * s, 0.004 * s),
          sg * 0.075 * s,
          0.09 * s,
          frontZ(rings, 1, 1.1),
          0,
          sg * 0.18,
          0,
        ),
        cloth(L.shade(jacket, 0.9), { region: "rags" }),
      );
      R.add(
        "chest",
        P.xf(
          P.box(0.064 * s, 0.022 * s, 0.018 * s, 0.004 * s),
          sg * 0.075 * s,
          0.125 * s,
          frontZ(rings, 1, 1.12),
          0.2,
          sg * 0.18,
          0,
        ),
        cloth(L.shade(jacket, 0.82), { region: "rags" }),
      );
      R.add(
        "hips",
        P.xf(
          P.box(0.08 * s, 0.07 * s, 0.014 * s, 0.004 * s),
          sg * 0.1 * s,
          -0.02 * s,
          -rings.pelvis[2].rz * 1.14,
          0,
          sg * 0.22,
          0,
        ),
        cloth(L.shade(jacket, 0.9), { region: "rags" }),
      );
    }
    for (const S of ["L", "R"])
      R.add(
        "forearm" + S,
        P.xf(
          P.sphere(0.04 * s, 0.05 * s, 0.026 * s, 8, 6),
          0,
          -0.02 * s,
          0.034 * s,
        ),
        leatherM(0x4a3020),
      ); // leather elbow patches
    neckerchief(R, b, rings, RED);
    armband(R, b, "L", cloth(RED, { region: "cloth" }), 0.32, 0.075, 1.06);
    H.strap(R, b, 0x3a2616, [0.85, 0.22], [-0.8, -0.05], 1.5, true); // cartridge bandolier
    H.belt(R, b, 0x2a1c12, 0x8a8a7a, 3);
  };
  function roseKit(R, b, rng, look, o, f) {
    const rings = H.torsoRings(b),
      s = b.s;
    if (f.brand) brand(R, b, "L", look.skin);
    else wristCuff(R, b, "L", leatherM(0x5a3820, { rough: 0.55 }), 0.075);
    // flint & steel striker on a cord at the throat ('no candles, sparks only')
    const z = frontZ(rings, 3, 1.25) - 0.006 * s;
    R.add(
      "chest",
      P.xf(
        P.torus(0.012 * s, 0.0025 * s, 4, 10, PI * 1.6),
        0.02 * s,
        0.205 * s,
        z,
        0,
        0,
        PI * 0.7,
      ),
      metalM(0x2a2a28, { metal: 0.8, rough: 0.4 }),
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.01 * s, 0.018 * s, 0.006 * s, 0.002 * s),
        0.02 * s,
        0.19 * s,
        z - 0.002 * s,
      ),
      { color: 0x8a8478, rough: 0.6, region: "metal" },
    );
    if (f.slung) slungRifle(R, b, rings);
  }

  // ------------------------------------------------------------------
  // SISTER DAWN (Nicole Mead): layered pale robes, mantle with the gilt sun, wax, Key A
  // ------------------------------------------------------------------
  function dawnKit(R, b, rng, look, o, f) {
    const rings = H.torsoRings(b),
      s = b.s;
    keyOnChain(R, b, rings);
    // candle wax down the sleeves & the front of the outer robe
    const zf = (x, y) => frontZ(rings, 1, 1.1) - 0.004 * s;
    wax(R, rng, "chest", 6, [-0.1 * s, 0.1 * s, -0.04 * s, 0.06 * s, zf]);
    for (const S of ["L", "R"])
      wax(R, rng, "forearm" + S, 4, [
        -0.06 * s,
        0.06 * s,
        -b.fore * 0.75,
        -b.fore * 0.35,
        () => -0.095 * s,
      ]);
    // the burned left hand under a loose linen wrap
    const lr = b.limbR * 0.93;
    R.add(
      "handL",
      P.xf(
        P.cyl(0.042 * lr, 0.046 * lr, 0.06 * s, 12, true),
        0,
        -0.03 * s,
        0,
        0,
        0,
        0,
        1.05,
        1,
        0.72,
      ),
      cloth(0xd8d0bc, { region: "rags", rough: 1 }),
    );
    if (f.masked) sunMask(R, b);
  }

  // ------------------------------------------------------------------
  // Other named kits
  // ------------------------------------------------------------------
  function keeperKit(R, b) {
    const rings = H.torsoRings(b);
    sun12(
      R,
      "chest",
      0,
      0.02 * b.s,
      rings.chest[2].rz * 1.15 + 0.01 * b.s,
      0.09 * b.s,
      giltM(),
      1,
      0.75,
    );
  }
  function taperKit(R, b) {
    const rings = H.torsoRings(b);
    hipLantern(R, b, rings);
    candleBandolier(R, b);
  }
  function tinderKit(R, b) {
    H.glasses(R, b, "weldup");
  }
  function teagueKit(R, b) {
    const rings = H.torsoRings(b);
    pendant(R, b, rings, 0.2 * b.s, 0.012 * b.s, 0x2a2420);
  }
  function keelKit(R, b) {
    const rings = H.torsoRings(b),
      s = b.s;
    peakedCap(R, b, 0x4a4e52, 0x2a2c30);
    const z = frontZ(rings, 2, 1.07) - 0.004 * s;
    [0x8a2a2a, 0x2a4a8a, 0xb8a050].forEach((c, i) =>
      R.add(
        "chest",
        P.xf(
          P.box(0.016 * s, 0.009 * s, 0.004 * s, 0.001 * s),
          0.07 * s + (i - 1) * 0.017 * s,
          0.17 * s,
          z,
        ),
        cloth(c),
      ),
    );
    for (const S of ["L", "R"])
      R.add(
        "arm" + S,
        P.xf(
          P.box(0.022 * b.s, 0.006 * b.s, 0.02 * b.s, 0.002 * b.s),
          0,
          0.052 * b.s,
          0,
        ),
        metalM(GILT),
      ); // major's oak-leaf pips
  }
  function callowayKit(R, b) {
    // Long Winter ID badge on the lapel, a cardigan-grey shawl
    const rings = H.torsoRings(b),
      s = b.s,
      z = frontZ(rings, 2, 1.1) - 0.004 * s;
    R.add(
      "chest",
      P.xf(
        P.box(0.04 * s, 0.055 * s, 0.004 * s, 0.002 * s),
        0.085 * s,
        0.1 * s,
        z,
      ),
      { color: 0xe8e4d8, rough: 0.4, region: "white" },
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.04 * s, 0.012 * s, 0.005 * s, 0.001 * s),
        0.085 * s,
        0.12 * s,
        z - 0.001 * s,
      ),
      cloth(0xc86a2a),
    );
  }
  function ilseKit(R, b) {
    // interpreter headphones round the neck, Continuity armband
    const s = b.s,
      rings = H.torsoRings(b);
    R.add(
      "chest",
      P.xf(
        P.torus(0.088 * s, 0.006 * s, 5, 18, PI),
        0,
        0.262 * s,
        0.006 * s,
        PI / 2 + 0.25,
        0,
        0,
        1,
        1.15,
        1,
      ),
      metalM(0x2a2a2a, { metal: 0.4 }),
    );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.cyl(0.03 * s, 0.03 * s, 0.022 * s, 12),
          sg * 0.092 * s,
          0.25 * s,
          frontZ(rings, 4, 0.9),
          0,
          0.35 * sg,
          PI / 2,
        ),
        leatherM(0x1a1a1a),
      );
    void rings;
    armband(R, b, "L", cloth(0x5a5e62), 0.35, 0.06);
    R.decal(
      "armL",
      "continuity",
      0.05 * s,
      0.025 * s,
      -0.062 * b.limbR,
      -b.upper * 0.35,
      0,
      0,
      PI / 2,
      0,
    );
  }
  function wrenKit(R, b) {
    H.cowl(R, b, 0x6a5a4a, { tail: 0.7, drape: 0 });
  }
  function solKit(R, b) {
    const s = b.s,
      rings = H.torsoRings(b);
    peakedCap(R, b, 0x5a2626, 0xa88a3a);
    H.cowl(R, b, 0x3c6e6a, { tail: 0, drape: 0.3 });
    // gold braid aiguillette from the right shoulder
    R.add(
      "chest",
      P.sweep(
        [
          [0.14 * s, 0.2 * s, -0.02 * s],
          [0.13 * s, 0.12 * s, frontZ(rings, 2, 1.12)],
          [0.07 * s, 0.07 * s, frontZ(rings, 1, 1.14)],
          [0.03 * s, 0.14 * s, frontZ(rings, 2, 1.13)],
        ],
        0.004 * s,
        { seg: 12, rs: 4 },
      ),
      metalM(0xb8963a, { metal: 0.7, rough: 0.45 }),
    );
    for (const S of ["L", "R"])
      R.add(
        "arm" + S,
        P.xf(P.box(0.09 * s, 0.014 * s, 0.06 * s, 0.004 * s), 0, 0.045 * s, 0),
        metalM(0xa88a3a, { metal: 0.6, rough: 0.5 }),
      );
  }
