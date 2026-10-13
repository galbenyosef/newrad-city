// play-inline-457 19 — rng
// Lines 4668-4933 of readable/play-inline-457.pretty.js (statement-aligned).
  OUT.combat_armor = function (R, b, rng, look, o) {
    const plate = o.color || rng.pick([0x50543f, 0x484a44, 0x5c5a46]);
    Object.assign(look, {
      top: 0x5a5a42,
      bottom: 0x5a5a42,
      paintBottom: camoPaint,
      sleeve: "long",
      paintSleeve: camoPaint,
      glove: 0x2a2820,
      boot: 0x2a241c,
      bootH: 0.55,
    });
    b.bulk = 1.04;
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const pm = metalM(plate, { metal: 0.2, rough: 0.55, region: "grime" });
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.1, 1.14), {
        seg: 16,
        capTop: false,
      }),
      pm,
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.08, 1.1), {
        seg: 14,
        a0: -PI * 0.4,
        a1: PI * 0.4,
      }),
      pm,
    );
    for (let i = 0; i < 3; i++)
      R.add(
        "spine",
        P.xf(
          P.box(0.16 * b.s, 0.012 * b.s, 0.01 * b.s, 0.003),
          0,
          0.04 * b.s + i * 0.05 * b.s,
          -rings.abdomen[1].rz * 1.14,
        ),
        metalM(L.shade(plate, 0.7), { metal: 0.2 }),
      );
    for (const S of ["L", "R"]) {
      const sg = S === "L" ? -1 : 1;
      R.add(
        "arm" + S,
        P.xf(
          P.sphere(
            0.085 * b.s,
            0.07 * b.s,
            0.09 * b.s,
            12,
            7,
            0,
            PI * 2,
            0,
            PI * 0.55,
          ),
          sg * 0.005,
          0.01 * b.s,
          0,
          0,
          0,
          sg * -0.3,
        ),
        pm,
      );
      R.add(
        "forearm" + S,
        P.xf(
          P.cyl(0.054 * b.s, 0.048 * b.s, 0.16 * b.s, 10),
          0,
          -b.fore * 0.5,
          -0.004,
        ),
        pm,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.sphere(
            0.06 * b.s,
            0.07 * b.s,
            0.05 * b.s,
            10,
            7,
            0,
            PI * 2,
            0,
            PI * 0.6,
          ),
          0,
          -0.005 * b.s,
          -0.04 * b.s,
          -PI / 2,
          0,
          0,
        ),
        pm,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.09 * b.s, 0.18 * b.s, 0.025 * b.s, 0.01 * b.s),
          0,
          -0.14 * b.s,
          -0.055 * b.s,
        ),
        pm,
      );
      R.add(
        "thigh" + S,
        P.xf(
          P.box(0.13 * b.s, 0.18 * b.s, 0.03 * b.s, 0.01 * b.s),
          0,
          -0.14 * b.s,
          -0.085 * b.s,
        ),
        pm,
      );
    }
    H.belt(R, b, 0x3a3628, 0x8a8a78, 4);
    H.hat(R, b, "helmet", plate);
    if (rng.chance(0.6)) H.glasses(R, b, "goggles");
  };
  function camoPaint(x, y, z, nx, ny, nz, out, wx, wy, wz) {
    const n = L.noise3(wx * 7, wy * 7, wz * 7);
    if (n > 0.62) {
      out[0] *= 0.6;
      out[1] *= 0.62;
      out[2] *= 0.5;
    } else if (n < 0.35) {
      out[0] *= 1.25;
      out[1] *= 1.2;
      out[2] *= 1.05;
    }
  }
  H.camoPaint = camoPaint;

  OUT.leather_armor = function (R, b, rng, look, o) {
    const lc = rng.pick([PAL.leather, 0x4a3020, 0x5a4028]);
    Object.assign(look, {
      top: 0x5a5040,
      bottom: rng.pick([0x3a3226, PAL.denim]),
      sleeve: "long",
      sleeveColor: 0x4a4234,
      glove: 0x2a1a10,
      boot: 0x2a1a10,
      bootH: 0.5,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const lm = leatherM(lc);
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.08, 1.12), { seg: 16 }),
      lm,
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.07, 1.1), { seg: 14 }),
      lm,
    );
    for (let i = 0; i < 4; i++)
      R.add(
        "chest",
        P.xf(
          P.box(0.012 * b.s, 0.012 * b.s, 0.012 * b.s, 0.003),
          0.05 * b.s,
          (0.02 + i * 0.05) * b.s,
          -rings.chest[2].rz * 1.13,
        ),
        metalM(0xa09060),
      );
    H.pauldron(R, b, "L", lc, 0, 1.05);
    for (const S of ["L", "R"]) {
      R.add(
        "forearm" + S,
        P.xf(
          P.cyl(0.052 * b.s, 0.046 * b.s, 0.15 * b.s, 10),
          0,
          -b.fore * 0.55,
          0,
        ),
        lm,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.08 * b.s, 0.14 * b.s, 0.02 * b.s, 0.008 * b.s),
          0,
          -0.08 * b.s,
          -0.06 * b.s,
        ),
        lm,
      );
    }
    H.strap(R, b, PAL.leatherDark, [0.9, 0.2], [-0.8, -0.03], 1.1, false);
    H.belt(R, b, PAL.leatherDark, 0x9a9a8a, 3);
  };

  /**
   * Survivor layers — the city's winter street wear (readable at 10–30 m):
   * muted oatmeal / slate / charcoal-brown cloth under faded RUST, TEAL or
   * MUSTARD accents; a bulky cowl scarf, cloth or bandage wraps on the
   * forearms, and knit watch hats / head wraps / work goggles / respirators. Four
   * cuts: 'layers' (long coat over a knit pullover), 'worker' (coveralls +
   * work apron), 'wrapped' (poncho shawl, wrapped shins, rope belt),
   * 'quilted' (quilted vest over a shirt).
   */
  H.SURVIVOR_ACCENTS = [
    0x8e4e34, 0x3c6e6a, 0xa8853a, 0x7a4436, 0x56807a, 0x9a7a3e, 0x6a4a5a,
  ];
  H.SURVIVOR_BASE = [
    0x6e675c, 0x5a554c, 0x4a463f, 0x7a7266, 0x5e5a56, 0x645a4c,
  ];
  const LINEN = [0xcfc6b0, 0xbdb39c, 0xd8d0bc, 0xa89e88];
  /** Survivor headwear / face kit (knit caps, head wraps, work goggles, respirators, scarves). */
  H.survivorHead = function (R, b, rng, acc, o) {
    o = o || {};
    const hat =
      o.hat !== undefined
        ? o.hat
        : rng.pick([
            "knit",
            "knit",
            "knit",
            "wrap",
            "wrap",
            "cap",
            "hood",
            null,
          ]);
    const hatC = rng.chance(0.5)
      ? acc
      : rng.pick([0x4a463f, 0x5e5a56, 0x6e675c, 0x3a3836]);
    if (hat === "hood")
      H.hat(R, b, "hood", L.shade(rng.pick(H.SURVIVOR_BASE), 0.9));
    else if (hat)
      H.hat(
        R,
        b,
        hat,
        hat === "wrap" ? rng.pick([acc, rng.pick(LINEN)]) : hatC,
      );
    const face =
      o.face !== undefined
        ? o.face
        : rng.pick([
            "weldup",
            "weldup",
            "weld",
            "respirator",
            "scarf",
            null,
            null,
            null,
          ]);
    if (face === "respirator") H.mask(R, b, "respirator", 0x3a3632);
    else if (face === "scarf") H.mask(R, b, "scarf", acc);
    else if (face === "bandage")
      H.mask(R, b, "bandage", rng.pick(LINEN), rng.chance(0.5) ? -1 : 1);
    else if (face) H.glasses(R, b, face);
  };
