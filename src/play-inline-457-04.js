// play-inline-457 04 — add
// Lines 702-890 of readable/play-inline-457.pretty.js (statement-aligned).
  H.leg = function (R, b, S, o) {
    const lr = b.limbR * (o.mul || 1);
    // blue-ish work trousers are jeans: twill denim with double-stitched seams
    const jeans =
      !o.pantsRegion &&
      typeof o.pants === "number" &&
      o.pants !== PAL.cryoGrey &&
      (() => {
        const c = L.col(o.pants);
        return c.b > c.r * 1.12 && c.b > c.g * 0.95;
      })();
    const pm =
      o.pantsMat ||
      cloth(o.pants, {
        region: o.pantsRegion || (jeans ? "denim" : "cloth"),
        paint: o.paint,
      });
    const skin = skinM(o.skin || 0xc08d68, {
      paint: o.skinPaint,
      region: o.skinRegion || "skin",
      emis: o.skinEmis || 0,
    });
    // one continuous hip→ankle tube (no knee cap / segment seams), skinned across the knee
    const T = b.thigh,
      Sh = b.shin,
      len = T + Sh + b.ankle * 0.4,
      fem = b.gender === "f" ? 1.04 : 1;
    const sk = limbSkin(
      R,
      "thigh" + S,
      "shin" + S,
      "hips",
      "foot" + S,
      T,
      T + Sh,
      b.s,
    );
    const keys = [
      [0, 0.09 * lr * fem],
      [T * 0.3, 0.092 * lr * fem + 0.004 * lr],
      [T * 0.75, 0.071 * lr],
      [T - 0.02 * b.s, 0.062 * lr],
      [T + 0.03 * b.s, 0.06 * lr],
      [T + Sh * 0.26, 0.066 * lr + 0.005 * lr],
      [T + Sh * 0.6, 0.052 * lr],
      [T + Sh, 0.043 * lr],
      [len, 0.042 * lr],
    ];
    const knee = { at: T + 0.005 * b.s, amt: 0.011 * lr };
    if (o.shorts) {
      R.add(
        "thigh" + S,
        limbTube(len, keys, { knee, flat: 0.95, mirrorU: S === "L" }),
        Object.assign({}, skin, { skin: sk }),
      );
      const cut = T + Sh * 0.1;
      const k2 = keys
        .filter((k) => k[0] < cut)
        .map((k) => [k[0], k[1] * 1.1 + 0.004 * b.s])
        .concat([[cut, 0.07 * lr]]);
      R.add(
        "thigh" + S,
        limbTube(cut, k2, { flat: 0.95, capB: false }),
        Object.assign({}, pm, { skin: sk }),
      );
    } else {
      R.add(
        "thigh" + S,
        limbTube(len, keys, { knee, flat: 0.95, mirrorU: S === "L" }),
        Object.assign({}, pm, { skin: sk }),
      );
    }
    H.boot(R, b, S, o);
  };

  /** Foot/boot on the foot bone (ankle joint), plus a boot shaft on the shin. */
  H.boot = function (R, b, S, o) {
    const s = b.s * (o.bootMul || 1);
    const bm =
      o.bootMat ||
      leatherM(o.boot || PAL.leatherDark, {
        region: o.bootRegion || "leather",
      });
    const sole = { color: 0x1c1a18, region: "rubber", rough: 0.9 };
    const foot = "foot" + S;
    const ah = b.ankle;
    // main foot volume heel→toe
    if (o.barefoot) {
      // bony bare foot: heel, arch and toes
      R.add(
        foot,
        P.xf(
          P.box(0.075 * s, ah + 0.01 * s, 0.22 * s, 0.03 * s),
          0,
          -ah / 2,
          -0.06 * s,
        ),
        bm,
      );
      R.add(
        foot,
        P.xf(
          P.sphere(0.04 * s, 0.025 * s, 0.05 * s, 8, 6),
          0,
          -ah * 0.7,
          -0.15 * s,
        ),
        bm,
      );
      return;
    }
    R.add(
      foot,
      P.xf(
        P.box(0.1 * s, ah + 0.035 * s, 0.25 * s, 0.03 * s),
        0,
        -ah / 2 + 0.012 * s,
        -0.06 * s,
      ),
      bm,
    );
    R.add(
      foot,
      P.xf(
        P.sphere(0.05 * s, 0.035 * s, 0.05 * s, 10, 7, 0, PI * 2, 0, PI / 2),
        0,
        -ah * 0.6 + 0.01 * s,
        -0.17 * s,
      ),
      bm,
    );
    if (o.barefoot) return;
    R.add(
      foot,
      P.xf(
        P.box(0.105 * s, 0.022 * s, 0.26 * s, 0.008 * s),
        0,
        -ah + 0.011 * s,
        -0.062 * s,
      ),
      sole,
    );
    // shaft
    const bh = o.bootH === undefined ? 0.35 : o.bootH;
    if (bh > 0.05) {
      const len = b.shin * bh;
      const g = P.limb(len, 0.058 * s, 0.056 * s, {
        seg: 10,
        capT: 0.002,
        capB: 0.02 * s,
      });
      P.xf(g, 0, -b.shin + len + 0.01 * s, 0.004 * s);
      R.add("shin" + S, g, bm);
      R.add(
        "shin" + S,
        P.xf(
          P.torus(0.057 * s, 0.008 * s, 4, 12),
          0,
          -b.shin + len + 0.01 * s,
          0.004 * s,
          PI / 2,
          0,
          0,
        ),
        bm,
      );
      // laces
      if (o.laces !== false)
        for (let i = 0; i < 3; i++)
          R.add(
            "shin" + S,
            P.xf(
              P.box(0.03 * s, 0.006 * s, 0.01 * s, 0.002),
              0,
              -b.shin + len * (0.25 + i * 0.25),
              -0.054 * s,
            ),
            { color: 0x2a2520, rough: 0.9 },
          );
    }
  };

  // ------------------------------------------------------------------
  // HEAD & FACE
  // ------------------------------------------------------------------
  /**
   * face: {skin, gender, hair, hairColor, beard, eyeColor, maniac, age (0..1),
   *        paint ('raider'|null), noseSize, jawW, brow, mutant, lipColor}
   */
