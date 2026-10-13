// play-inline-457 12 — add
// Lines 2785-3092 of readable/play-inline-457.pretty.js (statement-aligned).
  H.belt = function (R, b, color, buckle, pouches) {
    const rings = H.torsoRings(b).pelvis;
    const r = rings[3];
    const y = r.y + 0.02 * b.s;
    const g = P.loft(
      [
        { y: y - 0.024 * b.s, rx: r.rx * 1.05, rz: r.rz * 1.06, n: 2.3 },
        { y: y + 0.024 * b.s, rx: r.rx * 1.03, rz: r.rz * 1.04, n: 2.3 },
      ],
      { seg: 20 },
    );
    R.add("hips", g, leatherM(color || PAL.leather));
    R.add(
      "hips",
      P.xf(
        P.box(0.05 * b.s, 0.04 * b.s, 0.012 * b.s, 0.004 * b.s),
        0,
        y,
        -r.rz * 1.07,
      ),
      metalM(buckle || 0xb8a060, { metal: 0.8, rough: 0.35 }),
    );
    const ps = pouches || 0;
    for (let i = 0; i < ps; i++) {
      const a = (i % 2 ? 1 : -1) * (0.7 + Math.floor(i / 2) * 0.55);
      const x = Math.sin(a) * r.rx * 1.08,
        z = -Math.cos(a) * r.rz * 1.1;
      R.add(
        "hips",
        P.xf(
          P.box(0.06 * b.s, 0.07 * b.s, 0.035 * b.s, 0.008 * b.s),
          x,
          y - 0.03 * b.s,
          z,
          0,
          -a,
          0,
        ),
        leatherM(L.shade(color || PAL.leather, 1.15)),
      );
    }
    return y;
  };

  /** Coat skirt halves on the thighs (lab coat, duster, robe). len = fraction of leg length. */
  H.coatTails = function (R, b, mat, len, flare, closed) {
    const rings = H.torsoRings(b).pelvis;
    const W = rings[2].rx * 1.12,
      D = rings[2].rz * 1.16;
    const L_ = b.legLen * len;
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      const ox = -sg * b.hipW;
      const rs = [];
      const N = 5;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        rs.push({
          y: b.hipDrop + 0.1 * b.s - t * (L_ + 0.1 * b.s),
          rx: W * (1 + flare * t),
          rz: D * (1 + flare * t * 0.9),
          ox,
          n: 2.2,
        });
      }
      rs.reverse();
      const gap = closed ? 0.0 : 0.07;
      const a0 = sg < 0 ? PI + 0.02 : gap * PI,
        a1 = sg < 0 ? PI * (2 - gap) : PI - 0.02;
      const g = P.loft(rs, { seg: 10, a0, a1 });
      // ragged hem
      P.deform(g, (v) => {
        if (v.y < b.hipDrop - L_ * 0.95)
          v.y += (L.hash3(v.x * 300, 1, v.z * 300) - 0.5) * 0.05 * b.s;
      });
      R.add("thigh" + S, g, mat);
    }
  };

  /** Backpack (on chest bone). */
  H.backpack = function (R, b, color, big) {
    const s = b.s * b.bulk;
    const z = H.torsoRings(b).chest[2].rz + 0.06 * s;
    R.add(
      "chest",
      P.xf(
        P.box(0.28 * s, 0.34 * s * (big ? 1.3 : 1), 0.14 * s, 0.04 * s),
        0,
        0.06 * s,
        z,
      ),
      cloth(color || 0x5a5038, { region: "rags" }),
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.22 * s, 0.1 * s, 0.07 * s, 0.02 * s),
        0,
        -0.03 * s,
        z + 0.09 * s,
      ),
      cloth(L.shade(color || 0x5a5038, 0.85)),
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.07 * s, 0.07 * s, 0.34 * s, 10),
        0,
        0.26 * s * (big ? 1.2 : 1),
        z + 0.01 * s,
        0,
        0,
        PI / 2,
      ),
      cloth(0x6a3a2a, { region: "rags" }),
    );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.035 * s, 0.3 * s, 0.01 * s, 0.004),
          sg * 0.09 * s,
          0.1 * s,
          -H.torsoRings(b).chest[2].rz * 1.02,
        ),
        leatherM(0x3a2616),
      );
    if (big) {
      // trader's pots & pans
      R.add(
        "chest",
        P.xf(
          P.cyl(0.08 * s, 0.07 * s, 0.1 * s, 12),
          0.1 * s,
          -0.06 * s,
          z + 0.12 * s,
          PI / 2,
          0,
          0,
        ),
        metalM(0x6a6a60),
      );
      R.add(
        "chest",
        P.xf(
          P.cyl(0.06 * s, 0.06 * s, 0.018 * s, 12),
          -0.13 * s,
          0.1 * s,
          z + 0.1 * s,
          0,
          0,
          PI / 2,
        ),
        metalM(0x4a4a44),
      );
      R.add(
        "chest",
        P.xf(
          P.box(0.018 * s, 0.1 * s, 0.018 * s, 0.004),
          -0.13 * s,
          0.0,
          z + 0.1 * s,
        ),
        leatherM(0x3a2616),
      );
    }
  };

  /**
   * Bulky cowl scarf (winter survivor wear, readable at a distance): a thick wound
   * collar round the neck, a drape over the shoulders and one long tail down
   * the front. Knit bands across it. o: {tail (0..1), drape (0..1), torn}
   */
  H.cowl = function (R, b, color, o) {
    o = o || {};
    const s = b.s,
      rings = H.torsoRings(b),
      cr = rings.chest;
    const knit = (x, y, z, nx, ny, nz, out) => {
      const k = Math.abs(Math.sin((y / s) * 95));
      if (k < 0.18) {
        out[0] *= 0.78;
        out[1] *= 0.78;
        out[2] *= 0.78;
      }
    };
    const m = cloth(color, { region: "rags", paint: knit });
    const drape = o.drape === undefined ? 1 : o.drape;
    if (drape > 0) {
      const g = P.loft(
        [
          {
            y: cr[2].y - 0.04 * s * drape,
            rx: cr[2].rx * 1.07,
            rz: cr[2].rz * 1.1,
            oz: cr[2].oz,
            n: 2.4,
          },
          {
            y: cr[3].y,
            rx: cr[3].rx * 1.06,
            rz: cr[3].rz * 1.16,
            oz: cr[3].oz,
            n: 2.6,
          },
          {
            y: cr[4].y + 0.012 * s,
            rx: cr[4].rx * 1.12,
            rz: cr[4].rz * 1.26,
            oz: cr[4].oz,
            n: 2.4,
          },
          {
            y: cr[5].y + 0.02 * s,
            rx: cr[5].rx * 1.5,
            rz: cr[5].rz * 1.55,
            oz: cr[5].oz,
            n: 2.2,
          },
        ],
        { seg: 18 },
      );
      if (o.torn)
        P.deform(g, (v) => {
          if (v.y < cr[3].y)
            v.y += (L.hash3(v.x * 300, 5, v.z * 300) - 0.5) * 0.05 * s;
        });
      R.add("chest", g, m);
    }
    // the wound roll round the neck
    R.add(
      "chest",
      P.xf(
        P.torus(0.074 * s, 0.03 * s, 7, 18),
        0,
        0.262 * s,
        0.006 * s,
        PI / 2 + 0.18,
        0,
        0,
        1.22,
        1.08,
        1,
      ),
      m,
    );
    R.add(
      "chest",
      P.xf(
        P.torus(0.07 * s, 0.022 * s, 6, 16),
        0,
        0.29 * s,
        0.006 * s,
        PI / 2 + 0.24,
        0,
        0.3,
        1.12,
        1.05,
        1,
      ),
      cloth(L.shade(color, 0.88), { region: "rags", paint: knit }),
    );
    const tail = o.tail === undefined ? 1 : o.tail;
    if (tail > 0) {
      const z0 = -cr[2].rz * 1.16 + (cr[2].oz || 0);
      const g = P.box(0.075 * s, 0.32 * s * tail, 0.016 * s, 0.006 * s, 3);
      P.deform(g, (v) => {
        v.z -=
          Math.sin(((0.16 * s * tail - v.y) / (0.32 * s * tail)) * PI) *
          0.012 *
          s;
        if (v.y < -0.15 * s * tail)
          v.y += (L.hash3(v.x * 500, 2, 1) - 0.5) * 0.03 * s;
      });
      R.add(
        "chest",
        P.xf(
          g,
          -0.055 * s,
          0.24 * s - 0.16 * s * tail,
          z0 - 0.004 * s,
          0.1,
          0,
          0.06,
        ),
        m,
      );
      R.add(
        "chest",
        P.xf(
          P.box(0.08 * s, 0.022 * s, 0.02 * s, 0.006 * s),
          -0.055 * s,
          0.24 * s - 0.32 * s * tail + 0.01 * s,
          z0 - 0.012 * s,
          0.1,
          0,
          0.06,
        ),
        cloth(L.shade(color, 0.75), { region: "rags" }),
      ); // fringe hem
    }
  };
  /**
   * Bandage / cloth wraps wound round forearms ('arms') and shins ('legs'):
   * a spiral-banded open tube a little proud of the limb.
   */
