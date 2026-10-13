// play-inline-457 21 — out
// Lines 5285-5344 of readable/play-inline-457.pretty.js (statement-aligned).
  OUT.dj = function (R, b, rng, look, o) {
    Object.assign(look, {
      top: 0x1a1a1a,
      topRegion: "leather",
      topMat: leatherM(0x2e2826),
      sleeve: "long",
      sleeveMat: leatherM(0x2e2826),
      bottom: 0x3a4458,
      boot: 0x1e1a18,
      bootH: 0.3,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    // open collar shirt with 50s bowling-style stripe
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(1, 5), 1.015), {
        seg: 6,
        a0: -PI * 0.14,
        a1: PI * 0.14,
      }),
      cloth(0xc8b060, {
        paint: (x, y, z, nx, ny, nz, out) => {
          if (Math.abs(x) < 0.012) {
            out[0] = 0.5;
            out[1] = 0.1;
            out[2] = 0.08;
          }
        },
      }),
    );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.055 * b.s, 0.14 * b.s, 0.012 * b.s, 0.004),
          sg * 0.07 * b.s,
          0.15 * b.s,
          -rings.chest[2].rz * 1.05,
          0.1,
          sg * 0.35,
          sg * 0.28,
        ),
        leatherM(0x262222),
      );
    H.hat(R, b, "headphones");
    H.glasses(R, b, "sun");
    H.belt(R, b, 0x0e0e0e, 0xd0d0d0, 0);
  };

  // ----------------------------- EXO-RIGS -------------------------
  /**
   * Iron Covenant EXO-RIG (Mk I / Mk II): an armoured walking frame built
   * over a padded undersuit — layered riveted plates, EXPOSED hydraulic
   * pistons at knees and elbows, a back frame carrying the rig battery, and
   * a rounded war-helm with ONE narrow glowing visor slit (no snout). Mk I:
   * gunmetal, heavier, amber slit. Mk II: brushed steel, sleeker plates, a
   * second (brow) visor bar and a raised crest; cold white slits.
   * Insignia: anvil-in-a-ring on the left breast and the right pauldron.
   */
