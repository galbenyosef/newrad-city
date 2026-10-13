// play-inline-457 14 — rings
// Lines 3386-3663 of readable/play-inline-457.pretty.js (statement-aligned).
  OUT.cryo_suit = function (R, b, rng, look, o) {
    const grey = PAL.cryoGrey,
      orange = PAL.cryoOrange,
      trimC = PAL.cryoGreyDark;
    const qp = quiltPaint(58 / b.s, 0.2);
    Object.assign(look, {
      top: grey,
      bottom: grey,
      paintTop: qp,
      paintBottom: qp,
      paintSleeve: qp,
      sleeve: o.sleeve || "long",
      cuff: trimC,
      boot: 0x4a4c4a,
      bootH: 0.34,
      laces: false,
      glove: 0x5a5d5b,
      armMul: 1.06,
      legMul: 1.05,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    // padded panels: puffed bands round chest, belly and hips
    for (const [bone, rs, k] of [
      ["chest", rings.chest.slice(0, 3), 1.03],
      ["spine", rings.abdomen, 1.035],
    ])
      R.add(
        bone,
        P.loft(scaleRings(rs, k, k + 0.01), { seg: 18 }),
        cloth(grey, { paint: qp }),
      );
    // zip placket down the front
    const placket = (rs, bone, a) =>
      R.add(
        bone,
        P.loft(scaleRings(rs, 1.045), { seg: 2, a0: -a, a1: a }),
        cloth(trimC, { noise: 0.06 }),
      );
    placket(rings.chest.slice(0, 5), "chest", 0.04);
    placket(rings.abdomen, "spine", 0.04);
    placket(rings.pelvis.slice(1), "hips", 0.04);
    // the raised orange collar ring (padded), with a grey neck seal inside
    R.add(
      "chest",
      P.xf(
        P.torus(0.07 * b.s, 0.022 * b.s, 8, 20),
        0,
        0.245 * b.s,
        0.004 * b.s,
        PI / 2 + 0.22,
        0,
        0,
        1.18,
        1,
        1.05,
      ),
      cloth(orange, { rough: 0.55, noise: 0.06 }),
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.058 * b.s, 0.066 * b.s, 0.035 * b.s, 16, true),
        0,
        0.255 * b.s,
        0.004 * b.s,
        0.22,
        0,
        0,
        1.15,
        1,
        1,
      ),
      cloth(trimC),
    );
    // elbow / knee pads
    for (const S of ["L", "R"]) {
      R.add(
        "forearm" + S,
        P.xf(
          P.sphere(0.05 * b.s, 0.05 * b.s, 0.045 * b.s, 10, 7),
          0,
          0.005 * b.s,
          0.015 * b.s,
        ),
        cloth(trimC, { paint: qp }),
      );
      R.add(
        "shin" + S,
        P.xf(
          P.sphere(0.058 * b.s, 0.06 * b.s, 0.04 * b.s, 10, 7),
          0,
          0.0,
          -0.035 * b.s,
        ),
        cloth(trimC, { paint: qp }),
      );
    }
    R.decal(
      "chest",
      "longwinter",
      0.07 * b.s,
      0.07 * b.s,
      -0.075 * b.s,
      0.14 * b.s,
      -rings.chest[2].rz * 1.07 - 0.004,
      0,
      0,
      0,
    );
    R.decal(
      "chest",
      "unitpatch",
      0.15 * b.s,
      0.075 * b.s,
      0,
      0.12 * b.s,
      rings.chest[2].rz * 1.06 + 0.004,
      0,
      PI,
      0,
      { rough: 0.9 },
    );
    H.belt(R, b, 0x3c3e3c, 0x9a9c98, o.utility ? 4 : 2);
    if (o.security) {
      // facility guard: grey chest plate + riot helmet with visor
      R.add(
        "chest",
        P.loft(scaleRings(rings.chest.slice(0, 4), 1.1, 1.14), {
          seg: 14,
          a0: -PI * 0.42,
          a1: PI * 0.42,
        }),
        metalM(0x5a5e60, { metal: 0.3, rough: 0.6 }),
      );
      H.hat(R, b, "helmet", 0x5a5e60);
      R.add(
        "head",
        P.xf(
          P.shell(
            0.13 * b.headS,
            0.12 * b.headS,
            0.135 * b.headS,
            16,
            8,
            PI * 0.85,
            PI * 0.33,
            PI * 0.3,
          ),
          0,
          0.105 * b.headS,
          -0.004 * b.headS,
        ),
        { color: 0x7a90a0, rough: 0.05, metal: 0.35, emis: 0.03 },
      );
      R.add(
        "head",
        P.xf(
          P.box(
            0.2 * b.headS,
            0.016 * b.headS,
            0.03 * b.headS,
            0.006 * b.headS,
          ),
          0,
          0.17 * b.headS,
          -0.12 * b.headS,
        ),
        metalM(orange, { metal: 0.3 }),
      );
    }
  };

  /** Facility Director: white shirt & narrow tie under a charcoal tailored jacket, grey slacks, Long Winter pin. */
  OUT.director_suit = function (R, b, rng, look, o) {
    const shirt = 0xd8d6d0,
      jacket = 0x36383c,
      slacks = 0x4a4c50,
      tie = 0x7a2e1e;
    Object.assign(look, {
      top: shirt,
      bottom: slacks,
      sleeve: "long",
      sleeveColor: jacket,
      cuff: shirt,
      boot: 0x1a1816,
      bootH: 0.12,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    // open jacket: torso panels left/right of the shirt front, lapels, skirt over the hips
    for (const [bone, rs, k] of [
      ["chest", rings.chest.slice(0, 5), 1.04],
      ["spine", rings.abdomen, 1.05],
      ["hips", rings.pelvis.slice(2), 1.07],
    ])
      R.add(
        bone,
        P.loft(scaleRings(rs, k), { seg: 16, a0: 0.32, a1: PI * 2 - 0.32 }),
        cloth(jacket),
      );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.05 * b.s, 0.19 * b.s, 0.012 * b.s, 0.004),
          sg * 0.05 * b.s,
          0.11 * b.s,
          -rings.chest[2].rz * 1.07,
          0.1,
          sg * 0.3,
          sg * 0.25,
        ),
        cloth(0x2a2c30),
      );
    R.add(
      "chest",
      P.xf(
        P.box(0.03 * b.s, 0.24 * b.s, 0.008 * b.s, 0.003),
        0,
        0.07 * b.s,
        -rings.chest[2].rz * 1.05,
        0.08,
        0,
        0,
      ),
      cloth(tie),
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.032 * b.s, 0.022 * b.s, 0.014 * b.s, 0.004),
        0,
        0.2 * b.s,
        -rings.chest[2].rz * 1.0,
        0.1,
        0,
        0,
      ),
      cloth(tie),
    ); // knot
    R.add(
      "chest",
      P.xf(
        P.torus(0.06 * b.s, 0.012 * b.s, 6, 16),
        0,
        0.245 * b.s,
        0.004 * b.s,
        PI / 2 + 0.25,
        0,
        0,
        1.15,
        1,
        1,
      ),
      cloth(shirt),
    );
    R.decal(
      "chest",
      "longwinter",
      0.04 * b.s,
      0.04 * b.s,
      -0.085 * b.s,
      0.15 * b.s,
      -rings.chest[2].rz * 1.09 - 0.003,
      0,
      0,
      0,
    );
    H.belt(R, b, 0x151515, 0x9a9c98, 0);
  };

  /**
   * Scavenged road sign plate (raider armour): 'stop' red octagon, 'warn'
   * yellow diamond, 'speed' white rectangle, 'oneway' black arrow sign —
   * a border plate with the painted face plate on top, bolted at the corners.
   * Built facing -Z at the origin, then placed with (x,y,z, rx,ry,rz).
   */
