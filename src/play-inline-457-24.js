// play-inline-457 24 — col
// Lines 6257-6481 of readable/play-inline-457.pretty.js (statement-aligned).
  H.accessories = function (R, b, list, rng) {
    const s = b.s,
      rings = H.torsoRings(b),
      pr = rings.pelvis[3];
    for (const a of list) {
      if (a === "apron") {
        const col = rng.pick([
          0x5a4030, 0x6a5a44, 0x8a8270, 0x4a3a2c, 0x7a6a58,
        ]);
        const ap = P.loft(
          [
            {
              y: -0.36 * s,
              rx: pr.rx * 1.12,
              rz: pr.rz * 1.34,
              oz: -0.035 * s,
              n: 2.2,
            },
            {
              y: -0.12 * s,
              rx: pr.rx * 1.08,
              rz: pr.rz * 1.16,
              oz: -0.012 * s,
              n: 2.3,
            },
            { y: 0.075 * s, rx: pr.rx * 1.05, rz: pr.rz * 1.07, n: 2.3 },
          ],
          { seg: 14, a0: -PI * 0.4, a1: PI * 0.4 },
        );
        R.add(
          "hips",
          ap,
          col === 0x5a4030 || col === 0x4a3a2c
            ? leatherM(col)
            : cloth(col, { region: "rags" }),
        );
        // bib up the chest + neck strap
        const cr = rings.chest;
        R.add(
          "chest",
          P.loft(
            [
              {
                y: -0.05 * s,
                rx: cr[0].rx * 0.55,
                rz: cr[0].rz * 1.05,
                n: 2.3,
              },
              {
                y: 0.14 * s,
                rx: cr[2].rx * 0.5,
                rz: cr[2].rz * 1.05,
                oz: cr[2].oz,
                n: 2.3,
              },
            ],
            { seg: 10, a0: -PI * 0.28, a1: PI * 0.28 },
          ),
          cloth(col, { region: "rags" }),
        );
        H.strap(R, b, L.shade(col, 0.7), [-0.35, 0.14], [-0.25, 0.26], 0.6);
        H.strap(R, b, L.shade(col, 0.7), [0.35, 0.14], [0.25, 0.26], 0.6);
      } else if (a === "satchel") {
        const col = rng.pick([0x4a3322, 0x5a4a30, 0x3a3a2a, 0x6a5038]);
        H.strap(R, b, L.shade(col, 0.8), [-0.85, 0.22], [0.75, -0.06], 1.2);
        R.add(
          "hips",
          P.xf(
            P.box(0.2 * s, 0.17 * s, 0.07 * s, 0.02 * s),
            pr.rx * 1.02,
            -0.04 * s,
            -0.03 * s,
            0,
            PI / 2 - 0.35,
            0.05,
          ),
          leatherM(col),
        );
        R.add(
          "hips",
          P.xf(
            P.box(0.205 * s, 0.07 * s, 0.075 * s, 0.015 * s),
            pr.rx * 1.03,
            0.04 * s,
            -0.03 * s,
            0,
            PI / 2 - 0.35,
            0.05,
          ),
          leatherM(L.shade(col, 0.85)),
        );
      } else if (a === "bandolier") {
        H.strap(R, b, 0x3a2616, [0.85, 0.22], [-0.8, -0.04], 1.5, true);
      } else if (a === "rag") {
        const col = rng.pick([0xc8c0a8, 0xa8a090, 0x9a4a3a, 0x6a7a8a]);
        R.add(
          "chest",
          P.xf(
            P.box(0.09 * s, 0.2 * s, 0.012 * s, 0.004 * s),
            -rings.chest[3].rx * 0.55,
            0.12 * s,
            -rings.chest[2].rz * 1.02,
            0.08,
            0,
            0.12,
          ),
          cloth(col, { region: "rags" }),
        );
        R.add(
          "chest",
          P.xf(
            P.box(0.09 * s, 0.14 * s, 0.012 * s, 0.004 * s),
            -rings.chest[3].rx * 0.55,
            0.16 * s,
            rings.chest[2].rz * 0.95,
            -0.1,
            0,
            0.1,
          ),
          cloth(col, { region: "rags" }),
        );
      } else if (a === "ledger") {
        R.add(
          "hips",
          P.xf(
            P.box(0.03 * s, 0.2 * s, 0.15 * s, 0.006 * s),
            -pr.rx * 1.09,
            -0.08 * s,
            -0.02 * s,
            0,
            0,
            0.05,
          ),
          leatherM(0x3a2418),
        );
        R.add(
          "hips",
          P.xf(
            P.box(0.022 * s, 0.19 * s, 0.14 * s, 0.003 * s),
            -pr.rx * 1.075,
            -0.08 * s,
            -0.02 * s,
            0,
            0,
            0.05,
          ),
          cloth(0xd8d0b0),
        );
      } else if (a === "pack" || a === "bigpack") {
        H.backpack(
          R,
          b,
          rng.pick([0x5a5038, 0x4a4a38, 0x6a5a40]),
          a === "bigpack",
        );
      }
    }
  };
  /**
   * Re-dye the cloth of a finished outfit (template option outfitColor):
   * keeps each vertex's shading/pattern (luminance) and moves its hue &
   * saturation toward the dye — colour variants of every outfit for crowds.
   */
  H.dye = function (R, hex) {
    const d = L.col(hex),
      dl = Math.max(0.02, d.r * 0.2126 + d.g * 0.7152 + d.b * 0.0722);
    for (const p of R.prims) {
      const g = p.geo,
        cl = g.attributes.mcls,
        co = g.attributes.color;
      if (!cl || !co || cl.array[0] !== 1) continue;
      const a = co.array;
      for (let i = 0; i < a.length; i += 3) {
        // faded dye: 70 % of the dye's chroma (sun-bleached, never neon).
        // Brightness is pulled toward the dye's own (k = (l/dl)^0.5, ≤ 1.3, keeps the
        // pattern's light/dark order) so a light shirt dyed brown turns brown,
        // not a pale peach that reads as bare skin.
        const l = a[i] * 0.2126 + a[i + 1] * 0.7152 + a[i + 2] * 0.0722,
          k = Math.min(1.3, Math.pow(Math.max(1e-4, l / dl), 0.5));
        const lk = dl * k; // target luminance
        a[i] = lerp(a[i], lerp(lk, d.r * k, 0.7), 0.75);
        a[i + 1] = lerp(a[i + 1], lerp(lk, d.g * k, 0.7), 0.75);
        a[i + 2] = lerp(a[i + 2], lerp(lk, d.b * k, 0.7), 0.75);
      }
      co.needsUpdate = true;
    }
  };

  // ==================================================================
  //  HUMAN BUILDER (registered type 'human' + aliases)
  // ==================================================================
  const HAIR_M = [
    "short",
    "short",
    "buzz",
    "slick",
    "pompadour",
    "balding",
    "wild",
    "bald",
  ];
  const HAIR_F = ["bob", "long", "ponytail", "bun", "short", "long", "wild"];
  const OUTFIT_GENDER = { raider: null, raider_heavy: null };
  /** outfit → [[dirtMin, dirtMax], tint strength, [bloodMin, bloodMax]?] */
  const OUTFIT_WEAR = {
    cryo_suit: [[0.0, 0.15], 0.35],
    director_suit: [[0.0, 0.08], 0.3],
    raider: [[0.3, 0.65], 1, [0.0, 0.25]],
    raider_heavy: [[0.3, 0.65], 0.9, [0.0, 0.2]],
    settler: [[0.3, 0.6], 1],
    drifter: [[0.5, 0.85], 1],
    merchant: [[0.3, 0.6], 1],
    doctor: [[0.1, 0.3], 0.6],
    lab_coat: [[0.05, 0.25], 0.6],
    glowkeeper_robes: [[0.4, 0.7], 0.9],
    combat_armor: [[0.25, 0.5], 0.7],
    leather_armor: [[0.35, 0.7], 1],
    survivor_layers: [[0.35, 0.65], 1],
    dj: [[0.1, 0.3], 0.6],
    covenant_exo_rig: [[0.2, 0.45], 0.45],
    continuity_exo_rig: [[0.1, 0.3], 0.35],
    continuity_uniform: [[0.05, 0.2], 0.4],
  };

  /** opts: {outfit, gender, skinTone, hair, hairColor, beard, burn ('L'|'R'), scars, seed, variant, hat, scale} */
