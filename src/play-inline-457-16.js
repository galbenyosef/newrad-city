// play-inline-457 16 — rng
// Lines 3783-4046 of readable/play-inline-457.pretty.js (statement-aligned).
  OUT.raider = function (R, b, rng, look, o) {
    const v = o.variant !== undefined ? o.variant : rng.int(0, 3);
    // sun-baked, mismatched scavenged materials: browns, rust, faded khaki & denim
    const leather = rng.pick([
      PAL.leather,
      0x6a4a2e,
      0x4e3422,
      PAL.leatherLight,
      0x5a4030,
    ]);
    const pants = rng.pick([0x4a5a6c, 0x5a4a36, 0x6a5e44, 0x4e463a, 0x5a5448]);
    const sign = rng.pick(["stop", "warn", "speed", "oneway", null]);
    const rings = H.torsoRings(b);
    const fz = rings.chest[2].rz;
    if (v === 0) {
      // strapped bare chest (women get a leather tube top)
      const fem = b.gender === "f";
      Object.assign(look, {
        topMat: fem
          ? leatherM(leather)
          : skinM(look.skin, { paint: H.raiderTattoo(rng.int(0, 9)) }),
        abdomenMat: skinM(look.skin),
        bottom: pants,
        sleeve: "none",
        boot: 0x3a2a1c,
        bootH: 0.45,
        glove: rng.chance(0.5) ? 0x3a2a1a : null,
      });
      H.body(R, b, look);
      H.strap(R, b, leather, [-0.95, 0.19], [0.8, -0.02], 1.4, rng.chance(0.5));
      H.strap(
        R,
        b,
        L.shade(leather, 0.8),
        [0.95, 0.19],
        [-0.8, -0.02],
        1.4,
        false,
      );
      H.pauldron(R, b, "L", rng.chance(0.5) ? "tire" : PAL.rust, rng.int(2, 4));
      // leather harness ring where the straps cross
      R.add(
        "chest",
        P.xf(
          P.torus(0.018 * b.s, 0.005 * b.s, 4, 10),
          0.01 * b.s,
          0.1 * b.s,
          -fz * 1.12,
        ),
        metalM(0xa09880, { rough: 0.35 }),
      );
    } else if (v === 1) {
      // leather vest over bare arms + tyre pauldron
      Object.assign(look, {
        top: leather,
        topRegion: "leather",
        topMat: leatherM(leather, { paint: H.raiderPaintCloth }),
        bottom: pants,
        sleeve: "none",
        boot: 0x3a2a1c,
        bootH: 0.4,
        glove: 0x2e2218,
      });
      H.body(R, b, look);
      H.pauldron(R, b, "R", "tire", 0);
      H.pauldron(R, b, "L", PAL.steelDark, 3);
      H.strap(R, b, 0x3a2616, [-0.9, 0.2], [0.7, -0.03], 1.2, true);
      // open vest front shows a dirty undershirt
      R.add(
        "chest",
        P.loft(scaleRings(rings.chest.slice(1, 5), 1.012), {
          seg: 4,
          a0: -PI * 0.08,
          a1: PI * 0.08,
        }),
        cloth(0x9a8e70, { region: "rags" }),
      );
    } else if (v === 2) {
      // scrap plate chest on a torn shirt
      Object.assign(look, {
        top: rng.pick([PAL.rag1, PAL.rag3, 0x7a3a28, 0x6a6a48]),
        topRegion: "rags",
        bottom: pants,
        sleeve: "short",
        boot: 0x3a2a1c,
        bootH: 0.45,
      });
      H.body(R, b, look);
      R.add(
        "chest",
        P.loft(scaleRings(rings.chest.slice(0, 4), 1.1, 1.15), {
          seg: 10,
          a0: -PI * 0.38,
          a1: PI * 0.38,
        }),
        metalM(rng.pick([0x8a4a22, 0x7a7a6a, 0x9a8a3a]), {
          rough: 0.8,
          metal: 0.4,
          region: "raidpaint",
        }),
      );
      H.pauldron(R, b, rng.chance(0.5) ? "L" : "R", PAL.rust, rng.int(1, 3));
    } else {
      // spiked leather biker jacket with red paint slashes
      const jk = rng.pick([0x4a3a2e, 0x5a4230, 0x44403a]);
      Object.assign(look, {
        top: jk,
        topRegion: "leather",
        topMat: leatherM(jk, { paint: H.raiderPaintCloth }),
        sleeve: "long",
        sleeveMat: leatherM(jk),
        bottom: pants,
        boot: 0x2e241a,
        bootH: 0.5,
        glove: 0x2a2018,
      });
      H.body(R, b, look);
      H.pauldron(R, b, "L", 0x5a5a56, 4, 0.9);
      H.pauldron(R, b, "R", 0x5a5a56, 4, 0.9);
      // popped collar
      for (const sg of [-1, 1])
        R.add(
          "chest",
          P.xf(
            P.box(0.06 * b.s, 0.05 * b.s, 0.012 * b.s, 0.004),
            sg * 0.05 * b.s,
            0.24 * b.s,
            -0.03 * b.s,
            -0.35,
            sg * 0.5,
            0,
          ),
          leatherM(jk),
        );
    }
    // asymmetric scavenged plate: road sign on the chest, back or thigh
    if (sign && v !== 2) {
      const where = rng.int(0, 2);
      if (where === 0)
        H.signPlate(
          R,
          "chest",
          sign,
          0.085 * b.s,
          (rng.chance(0.5) ? -1 : 1) * 0.07 * b.s,
          0.1 * b.s,
          -fz * 1.12,
          0.1,
          rng.range(-0.3, 0.3),
          rng.range(-0.4, 0.4),
        );
      else if (where === 1)
        H.signPlate(
          R,
          "chest",
          sign,
          0.12 * b.s,
          0,
          0.1 * b.s,
          fz * 1.14,
          -0.05,
          PI,
          rng.range(-0.3, 0.3),
        );
      else {
        const S = rng.chance(0.5) ? "L" : "R";
        H.signPlate(
          R,
          "thigh" + S,
          sign,
          0.07 * b.s,
          (S === "L" ? -1 : 1) * 0.02 * b.s,
          -0.16 * b.s,
          -0.09 * b.s,
          0.05,
          0,
          rng.range(-0.5, 0.5),
        );
      }
    }
    // knee pads (steel or tyre rubber), bracers, rag wraps
    for (const S of ["L", "R"]) {
      if (rng.chance(0.6))
        R.add(
          "shin" + S,
          P.xf(
            P.sphere(
              0.06 * b.s,
              0.065 * b.s,
              0.045 * b.s,
              10,
              7,
              0,
              PI * 2,
              0,
              PI * 0.6,
            ),
            0,
            -0.01 * b.s,
            -0.035 * b.s,
            -PI / 2,
            0,
            0,
          ),
          rng.chance(0.4)
            ? { color: 0x2a2a28, region: "tire", rough: 0.9 }
            : metalM(rng.pick([PAL.rust, 0x6a6a64]), { rough: 0.8 }),
        );
      if (rng.chance(0.5))
        R.add(
          "forearm" + S,
          P.xf(
            P.cyl(0.05 * b.s, 0.045 * b.s, 0.12 * b.s, 10),
            0,
            -b.fore * 0.6,
            0,
          ),
          leatherM(L.shade(leather, 0.85)),
        );
      else if (rng.chance(0.4))
        R.add(
          "forearm" + S,
          P.xf(
            P.cyl(0.048 * b.s, 0.043 * b.s, 0.09 * b.s, 10),
            0,
            -b.fore * 0.72,
            0,
          ),
          cloth(0xb0a68a, { region: "rags" }),
        );
    }
    H.belt(R, b, 0x3a2616, 0xc8c0a0, rng.int(1, 3));
    // head
    const hw = rng.int(0, 5);
    if (hw === 0) H.mask(R, b, "hockey");
    else if (hw === 1) H.mask(R, b, "gasmask");
    else if (hw === 2)
      H.mask(R, b, "bandit", rng.pick([0x8a2a20, 0x5a4a3a, 0x5a6a3a]));
    else if (hw === 3 && rng.chance(0.4)) H.mask(R, b, "sack");
    if (rng.chance(0.25)) H.glasses(R, b, "goggles");
  };
  H.raiderTattoo = function (seed) {
    return function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
      const k = Math.sin(wx * 60 + seed) * Math.cos(wy * 45 + seed * 2);
      if (k > 0.82 && nz < 0.2) {
        out[0] *= 0.35;
        out[1] *= 0.38;
        out[2] *= 0.5;
      }
      if (L.noise3(wx * 20, wy * 20, wz * 20) > 0.74) {
        out[0] *= 0.7;
        out[1] *= 0.65;
        out[2] *= 0.6;
      } // grime
    };
  };
  H.raiderPaintCloth = function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
    if (nz > 0.3 && Math.abs(Math.sin(wx * 25 + wy * 10)) < 0.12) {
      out[0] = 0.4;
      out[1] = 0.05;
      out[2] = 0.04;
    }
  };

