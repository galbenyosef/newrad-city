// play-inline-459 03 — math
// Lines 329-502 of readable/play-inline-459.pretty.js (statement-aligned).
  function hoodDown(R, b, rings, color) {
    const s = b.s,
      m = cloth(color, { region: "rags" }),
      cr = rings.chest;
    const g = P.loft(
      [
        {
          y: cr[3].y - 0.06 * s,
          rx: cr[3].rx * 0.55,
          rz: 0.03 * s,
          oz: cr[3].rz * 0.95,
          n: 2,
        },
        {
          y: cr[4].y + 0.02 * s,
          rx: cr[4].rx * 1.1,
          rz: 0.05 * s,
          oz: cr[4].rz * 1.15,
          n: 2,
        },
        {
          y: cr[5].y + 0.05 * s,
          rx: cr[5].rx * 1.6,
          rz: 0.045 * s,
          oz: cr[5].rz * 1.4,
          n: 2,
        },
      ],
      { seg: 12, a0: PI * 0.5, a1: PI * 1.5, capTop: true },
    );
    R.add("chest", g, m);
    R.add(
      "chest",
      P.xf(
        P.torus(0.072 * s, 0.02 * s, 6, 16),
        0,
        0.262 * s,
        0.006 * s,
        PI / 2 + 0.2,
        0,
        0,
        1.2,
        1.1,
        1,
      ),
      m,
    );
  }
  /** Mantle: a short shoulder cape to the elbows, open at the front; trim band at the hem. */
  function mantle(R, b, rings, color, trim, back) {
    const s = b.s,
      cr = rings.chest,
      m = cloth(color, { region: "rags", rough: 0.95 });
    const rs = [
      {
        y: -0.14 * s,
        rx: cr[2].rx * 1.62,
        rz: cr[2].rz * 1.62,
        oz: cr[2].oz,
        n: 2.1,
      },
      {
        y: -0.02 * s,
        rx: cr[2].rx * 1.52,
        rz: cr[2].rz * 1.5,
        oz: cr[2].oz,
        n: 2.2,
      },
      {
        y: cr[2].y,
        rx: cr[2].rx * 1.42,
        rz: cr[2].rz * 1.36,
        oz: cr[2].oz,
        n: 2.5,
      },
      {
        y: cr[3].y + 0.012 * s,
        rx: cr[3].rx * 1.24,
        rz: cr[3].rz * 1.4,
        oz: cr[3].oz,
        n: 2.6,
      },
      {
        y: cr[4].y + 0.02 * s,
        rx: cr[4].rx * 1.18,
        rz: cr[4].rz * 1.36,
        oz: cr[4].oz,
        n: 2.3,
      },
      {
        y: cr[5].y + 0.03 * s,
        rx: cr[5].rx * 1.55,
        rz: cr[5].rz * 1.6,
        oz: cr[5].oz,
        n: 2.1,
      },
    ];
    const g = P.loft(rs, { seg: 22, a0: 0.5, a1: PI * 2 - 0.5 });
    P.deform(g, (v) => {
      if (v.y < -0.1 * s) v.y += Math.sin(Math.atan2(v.x, v.z) * 9) * 0.008 * s;
    }); // soft folds at the hem
    R.add("chest", g, m);
    if (trim) {
      const tb = P.loft(
        [
          {
            y: -0.142 * s,
            rx: cr[2].rx * 1.64,
            rz: cr[2].rz * 1.64,
            oz: cr[2].oz,
            n: 2.1,
          },
          {
            y: -0.115 * s,
            rx: cr[2].rx * 1.61,
            rz: cr[2].rz * 1.61,
            oz: cr[2].oz,
            n: 2.1,
          },
        ],
        { seg: 22, a0: 0.5, a1: PI * 2 - 0.5 },
      );
      R.add(
        "chest",
        tb,
        cloth(trim, { region: "rags", rough: 0.55, metal: 0.25 }),
      );
      // trim down both front edges
      for (const sg of [-1, 1])
        R.add(
          "chest",
          P.sweep(
            [
              [
                sg * Math.sin(0.5) * cr[2].rx * 1.6,
                -0.13 * s,
                -Math.cos(0.5) * cr[2].rz * 1.62 + (cr[2].oz || 0),
              ],
              [
                sg * Math.sin(0.5) * cr[2].rx * 1.42,
                cr[2].y,
                -Math.cos(0.5) * cr[2].rz * 1.38 + (cr[2].oz || 0),
              ],
              [
                sg * Math.sin(0.5) * cr[4].rx * 1.2,
                cr[4].y + 0.02 * s,
                -Math.cos(0.5) * cr[4].rz * 1.38,
              ],
            ],
            0.008 * s,
            { seg: 8, rs: 4 },
          ),
          cloth(trim, { region: "rags", rough: 0.55, metal: 0.25 }),
        );
    }
    if (back)
      sun12(
        R,
        "chest",
        0,
        0.02 * s,
        cr[2].rz * 1.5 + 0.012 * s,
        0.075 * s,
        giltM(back),
        1,
        0.7,
      );
  }

  // ------------------------------------------------------------------
  // Glowkeeper robes (parametrised): ranks, Brothers & Sisters, the Keeper, the Dawn
  // p: {under, outer, open, len, underLen, flare, bell, stole, belt, sun ('decal'|'disc'|null), sunR, pendant,
  //     hood ('up'|'down'|null), hoodColor, mantle, mantleTrim, mantleSun, apron, boot, collar}
  // ------------------------------------------------------------------
