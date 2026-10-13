// play-inline-457 17 — rng
// Lines 4047-4385 of readable/play-inline-457.pretty.js (statement-aligned).
  OUT.raider_heavy = function (R, b, rng, look, o) {
    const hl = rng.pick([0x4a3526, 0x5a4030, 0x3e3a30]);
    Object.assign(look, {
      top: hl,
      topRegion: "leather",
      bottom: rng.pick([0x4a5a6c, 0x4e4436, 0x5a5040]),
      sleeve: "long",
      sleeveColor: hl,
      sleeveRegion: "leather",
      glove: 0x2a2018,
      boot: 0x2e241a,
      bootH: 0.55,
    });
    b.bulk = 1.06;
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const plate = (c) =>
      metalM(c, {
        rough: 0.75,
        metal: 0.45,
        region: rng.chance(0.5) ? "raidpaint" : "metal",
      });
    // road sign breastplate + car-door back plate
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.12, 1.18), {
        seg: 12,
        a0: -PI * 0.45,
        a1: PI * 0.45,
      }),
      plate(rng.pick([0xa88a2a, 0x8a3a22, 0x5a6a4a, 0x7a7a70])),
    );
    if (rng.chance(0.6))
      H.signPlate(
        R,
        "chest",
        rng.pick(["stop", "warn", "oneway"]),
        0.1 * b.s,
        rng.range(-0.05, 0.05) * b.s,
        0.09 * b.s,
        -rings.chest[2].rz * 1.22,
        0.12,
        rng.range(-0.2, 0.2),
        rng.range(-0.35, 0.35),
      );
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.12, 1.18), {
        seg: 12,
        a0: PI * 0.6,
        a1: PI * 1.4,
      }),
      plate(0x6e6e68),
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.12, 1.15), {
        seg: 12,
        a0: -PI * 0.4,
        a1: PI * 0.4,
      }),
      plate(0x7a5a34),
    );
    for (let i = 0; i < 8; i++) {
      const a = (i / 7 - 0.5) * PI * 0.8;
      R.add(
        "chest",
        P.xf(
          P.sphere(0.009 * b.s, 0.009 * b.s, 0.009 * b.s, 5, 4),
          Math.sin(a) * rings.chest[2].rx * 1.1,
          0.19 * b.s,
          -Math.cos(a) * rings.chest[2].rz * 1.17,
        ),
        metalM(0x9a9a90),
      );
    }
    H.pauldron(R, b, "L", PAL.rust, 5, 1.15);
    H.pauldron(R, b, "R", PAL.steelDark, 3, 1.1);
    for (const S of ["L", "R"]) {
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.1 * b.s, 0.26 * b.s, 0.03 * b.s, 0.01 * b.s),
          0,
          -0.13 * b.s,
          -0.06 * b.s,
        ),
        plate(0x7a6a56),
      );
      R.add(
        "forearm" + S,
        P.xf(
          P.cyl(0.056 * b.s, 0.05 * b.s, 0.18 * b.s, 10),
          0,
          -b.fore * 0.55,
          0,
        ),
        plate(0x5a4a3a),
      );
      R.add(
        "thigh" + S,
        P.xf(
          P.box(0.12 * b.s, 0.2 * b.s, 0.025 * b.s, 0.01 * b.s),
          0,
          -0.15 * b.s,
          -0.085 * b.s,
          0.05,
          0,
          0,
        ),
        S === "L"
          ? { color: 0x2a2a28, region: "tire", rough: 0.9 }
          : plate(0x5e5e52),
      );
    }
    H.belt(R, b, 0x3a2616, 0xc8c0a0, 3);
    // helmet with face cage
    H.hat(R, b, "helmet", rng.pick([0x6a6a60, 0x8a4a22, 0x7a6a3a]));
    const hs = b.headS,
      C = HC(b);
    for (let i = 0; i < 4; i++)
      R.add(
        "head",
        P.xf(
          P.cyl(0.004 * hs, 0.004 * hs, 0.13 * hs, 5),
          -0.045 * hs + i * 0.03 * hs,
          C[1] - 0.02 * hs,
          C[2] - 0.115 * hs,
        ),
        metalM(0x7a7a70),
      );
    R.add(
      "head",
      P.xf(
        P.torus(0.07 * hs, 0.005 * hs, 4, 12, PI),
        0,
        C[1] - 0.02 * hs,
        C[2] - 0.05 * hs,
        PI / 2,
        0,
        PI,
      ),
      metalM(0x7a7a70),
    );
  };

  OUT.settler = function (R, b, rng, look, o) {
    const shirt = rng.pick([
      0x8a3a2a, 0x3a5a7a, 0x6a6a3a, 0x7a5a3a, 0x5a3a5a, 0xa08a5a,
    ]);
    const plaid = rng.chance(0.55);
    Object.assign(look, {
      top: shirt,
      paintTop: plaid ? H.plaid(L.shade(shirt, 0.45)) : null,
      bottom: rng.pick([PAL.denim, PAL.khaki, 0x4a4030, 0x3a3a3a]),
      sleeve: rng.pick(["long", "rolled", "rolled", "short"]),
      boot: rng.pick([0x3a2616, 0x2a2018, 0x4a3420]),
      bootH: rng.range(0.2, 0.4),
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    if (rng.chance(0.45)) {
      // overalls bib / apron
      R.add(
        "chest",
        P.loft(scaleRings(rings.chest.slice(0, 4), 1.02), {
          seg: 8,
          a0: -PI * 0.25,
          a1: PI * 0.25,
        }),
        cloth(look.bottom),
      );
      for (const sg of [-1, 1])
        R.add(
          "chest",
          P.xf(
            P.box(0.03 * b.s, 0.2 * b.s, 0.01 * b.s, 0.003),
            sg * 0.07 * b.s,
            0.12 * b.s,
            -rings.chest[2].rz * 1.05,
            0.2,
            0,
            0,
          ),
          cloth(look.bottom),
        );
    }
    H.belt(R, b, PAL.leather, 0xa08a50, rng.int(0, 2));
    if (rng.chance(0.3))
      H.strap(R, b, PAL.leatherDark, [-0.9, 0.2], [0.8, -0.05], 1, false);
  };

  OUT.drifter = function (R, b, rng, look, o) {
    const coat = rng.pick([0x6a5a40, 0x5a4a38, 0x4a4234, 0x7a6a4a]);
    Object.assign(look, {
      top: rng.pick([PAL.rag1, PAL.rag3, 0x5a5448]),
      topRegion: "rags",
      bottom: rng.pick([PAL.khaki, PAL.rag2, PAL.denim]),
      bottomRegion: "rags",
      sleeve: "long",
      sleeveColor: coat,
      sleeveRegion: "leather",
      glove: rng.chance(0.6) ? 0x3a2a1a : null,
      boot: 0x3a2616,
      bootH: 0.5,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    // duster coat: upper panels + long tails
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.07), {
        seg: 16,
        a0: PI * 0.08,
        a1: PI * 1.92,
      }),
      leatherM(coat),
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.1), {
        seg: 16,
        a0: PI * 0.1,
        a1: PI * 1.9,
      }),
      leatherM(coat),
    );
    R.add(
      "hips",
      P.loft(scaleRings(rings.pelvis.slice(2), 1.12), {
        seg: 16,
        a0: PI * 0.1,
        a1: PI * 1.9,
      }),
      leatherM(coat),
    );
    H.coatTails(R, b, leatherM(coat), 0.72, 0.35);
    // scarf
    // scarf: a cowl draped over the trapezius slope up around the neck (follows
    // the collar line instead of floating as a ring), plus a hanging knot tail
    {
      const s = b.s,
        c3 = rings.chest[3],
        c4 = rings.chest[4],
        c5 = rings.chest[5];
      const cowl = [
        {
          y: c4.y + 0.004 * s,
          rx: c4.rx * 0.95 + 0.007 * s,
          rz: c4.rz * 0.97 + 0.009 * s,
          oz: -0.004 * s,
          n: 2.4,
        },
        {
          y: c5.y - 0.002 * s,
          rx: c5.rx * 1.12 + 0.01 * s,
          rz: c5.rz * 1.18 + 0.01 * s,
          oz: -0.006 * s,
          n: 2.2,
        },
        { y: 0.278 * s, rx: 0.068 * s, rz: 0.066 * s, oz: -0.002 * s, n: 2.1 },
        { y: 0.3 * s, rx: 0.061 * s, rz: 0.06 * s, oz: 0.002 * s, n: 2 },
      ];
      const sm = cloth(rng.pick([0x7a3a2a, 0x4a5a4a, 0x8a7a5a]), {
        region: "rags",
      });
      R.add("chest", P.loft(cowl, { seg: 16 }), sm);
      const tail = P.box(0.042 * s, 0.1 * s, 0.012 * s, 0.004 * s);
      R.add(
        "chest",
        P.xf(
          tail,
          0.022 * s,
          c3.y + 0.005 * s,
          -(c3.rz + (c3.oz || 0) * -1) - 0.006 * s,
          -0.12,
          0,
          0.18,
        ),
        sm,
      );
    }
    H.belt(R, b, PAL.leatherDark, 0x8a8a80, 2);
    if (rng.chance(0.5)) H.glasses(R, b, "goggles");
  };

  OUT.merchant = function (R, b, rng, look, o) {
    Object.assign(look, {
      top: rng.pick([0xb8a888, 0x9a8a6a, 0x7a8a9a]),
      bottom: rng.pick([PAL.khaki, 0x5a4a3a]),
      sleeve: "rolled",
      boot: 0x3a2616,
      bootH: 0.45,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const vest = rng.pick([0x3a2a1a, 0x4a3a2a, 0x2a3a2a]);
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.05), {
        seg: 16,
        a0: PI * 0.1,
        a1: PI * 1.9,
      }),
      leatherM(vest),
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.06), {
        seg: 16,
        a0: PI * 0.1,
        a1: PI * 1.9,
      }),
      leatherM(vest),
    );
    for (let i = 0; i < 2; i++)
      R.add(
        "chest",
        P.xf(
          P.box(0.06 * b.s, 0.05 * b.s, 0.02 * b.s, 0.006),
          (i ? 0.08 : -0.08) * b.s,
          0.03 * b.s,
          -rings.chest[1].rz * 1.1,
        ),
        leatherM(L.shade(vest, 1.2)),
      );
    H.strap(R, b, PAL.leatherDark, [0.9, 0.2], [-0.8, -0.03], 1.2, true);
    H.backpack(R, b, 0x6a5a3a, true);
    H.belt(R, b, PAL.leather, 0xb8a060, 3);
    H.hat(
      R,
      b,
      look.layers
        ? rng.pick(["knit", "cap", "wrap"])
        : rng.pick(["cowboy", "fedora", "cap"]),
      rng.pick([0x5a4028, 0x3a3a3a, 0x6a5a40]),
    );
  };

