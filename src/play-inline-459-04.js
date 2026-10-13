// play-inline-459 04 — rings
// Lines 503-847 of readable/play-inline-459.pretty.js (statement-aligned).
  function robes(R, b, rng, look, p) {
    const s = b.s,
      under = p.under,
      outer = p.outer || p.under;
    Object.assign(
      look,
      {
        top: under,
        topRegion: p.region || "rags",
        bottom: under,
        bottomRegion: p.region || "rags",
        sleeve: "long",
        sleeveColor: outer,
        sleeveRegion: p.region || "rags",
        boot: p.boot || 0x2e2218,
        bootH: p.bootH || 0.15,
        laces: false,
      },
      p.look || {},
    );
    H.body(R, b, look);
    const reg = p.region || "rags",
      mo = cloth(outer, { region: reg, paint: p.paint }),
      mu = cloth(under, { region: reg });
    const rings = shell(R, b, mo, 1.08, p.open ? 0.4 : 0, 1);
    if (p.open) {
      // the under-robe shows down the front
      skirt(R, b, mu, p.underLen || 0.98, 0.42, 0, 1);
      skirt(R, b, mo, p.len || 0.9, (p.flare || 0.5) + 0.04, 0.09, 1.06);
    } else skirt(R, b, mo, p.len || 0.95, p.flare || 0.5, 0, 1);
    if (p.bell !== false)
      for (const S of ["L", "R"])
        R.add(
          "forearm" + S,
          P.xf(
            P.cyl(0.075 * s, 0.105 * s, b.fore * 0.62, 12, true),
            0,
            -b.fore * 0.55,
            0,
          ),
          mo,
        );
    if (p.stole)
      for (const sg of [-1, 1])
        R.add(
          "chest",
          P.xf(
            P.box(0.045 * s, 0.42 * s, 0.008 * s, 0.003 * s),
            sg * 0.062 * s,
            0.02 * s,
            frontZ(rings, 2, 1.1),
            0.06,
            0,
            sg * 0.04,
          ),
          cloth(p.stole, { region: "rags", rough: 0.7 }),
        );
    const pr = rings.pelvis[3];
    if (p.belt === "rope" || p.belt === "cord")
      R.add(
        "hips",
        P.xf(
          P.torus(1, (p.belt === "rope" ? 0.012 : 0.009) * s, 5, 22),
          0,
          pr.y + 0.03 * s,
          0,
          PI / 2,
          0,
          0,
          pr.rx * 1.17,
          pr.rz * 1.22,
          1,
        ),
        { color: p.beltC || 0x8a7a5a, region: "rags", rough: 1 },
      );
    else if (p.belt === "leather")
      H.belt(R, b, p.beltC || 0x3a2616, BRASS, p.pouches || 0);
    if (p.belt === "rope" || p.belt === "cord") {
      // knotted cord ends hanging
      R.add(
        "hips",
        P.xf(
          P.cyl(0.006 * s, 0.006 * s, 0.22 * s, 5),
          -0.06 * s,
          pr.y - 0.08 * s,
          -pr.rz * 1.24,
          0.05,
          0,
          0.04,
        ),
        { color: p.beltC || 0x8a7a5a, region: "rags", rough: 1 },
      );
      R.add(
        "hips",
        P.xf(
          P.sphere(0.012 * s, 0.012 * s, 0.012 * s, 6, 4),
          -0.06 * s,
          pr.y - 0.19 * s,
          -pr.rz * 1.25,
        ),
        { color: p.beltC || 0x8a7a5a, region: "rags", rough: 1 },
      );
    }
    if (p.apron) {
      const s2 = b.s,
        a = P.loft(
          [
            {
              y: -0.44 * s2,
              rx: pr.rx * 1.2,
              rz: pr.rz * 1.45,
              oz: -0.04 * s2,
              n: 2.2,
            },
            {
              y: -0.12 * s2,
              rx: pr.rx * 1.14,
              rz: pr.rz * 1.24,
              oz: -0.012 * s2,
              n: 2.3,
            },
            { y: 0.075 * s2, rx: pr.rx * 1.12, rz: pr.rz * 1.18, n: 2.3 },
          ],
          { seg: 14, a0: -PI * 0.42, a1: PI * 0.42 },
        );
      R.add("hips", a, leatherM(p.apron));
      R.add(
        "chest",
        P.loft(
          [
            {
              y: -0.05 * s2,
              rx: rings.chest[0].rx * 0.62,
              rz: rings.chest[0].rz * 1.14,
              n: 2.3,
            },
            {
              y: 0.15 * s2,
              rx: rings.chest[2].rx * 0.54,
              rz: rings.chest[2].rz * 1.14,
              oz: rings.chest[2].oz,
              n: 2.3,
            },
          ],
          { seg: 10, a0: -PI * 0.3, a1: PI * 0.3 },
        ),
        leatherM(p.apron),
      );
      H.strap(R, b, L.shade(p.apron, 0.7), [-0.38, 0.15], [-0.26, 0.27], 0.6);
      H.strap(R, b, L.shade(p.apron, 0.7), [0.38, 0.15], [0.26, 0.27], 0.6);
      R.decal(
        "hips",
        "sundisc",
        0.11 * s2,
        0.11 * s2,
        0,
        -0.12 * s2,
        -pr.rz * 1.27 - 0.003,
        0,
        0,
        0,
        { emis: 0.15, color: 0xc8b8a0 },
      );
    }
    if (p.sun === "decal")
      R.decal(
        "chest",
        "sundisc",
        (p.sunR || 0.15) * s,
        (p.sunR || 0.15) * s,
        0,
        0.1 * s,
        frontZ(rings, 2, 1.1) - 0.006,
        0,
        0,
        0,
        { emis: 0.7 },
      );
    else if (p.sun === "disc")
      sun12(
        R,
        "chest",
        0,
        0.11 * s,
        frontZ(rings, 2, 1.12) - 0.006 * s,
        (p.sunR || 0.05) * s,
        giltM(p.sunC),
      );
    if (p.pendant) pendant(R, b, rings, -0.03 * s, 0.022 * s);
    if (p.collar) {
      // tall standing collar (the Keeper's vestment)
      const m = cloth(p.collar, { region: "rags", rough: 0.6, metal: 0.2 });
      R.add(
        "chest",
        P.xf(
          P.cyl(0.082 * s, 0.092 * s, 0.07 * s, 18, true),
          0,
          0.272 * s,
          0.006 * s,
          0.18,
          0,
          0,
          1.12,
          1,
          1.05,
        ),
        m,
      );
    }
    if (p.mantle) mantle(R, b, rings, p.mantle, p.mantleTrim, p.mantleSun);
    if (p.hood === "up") H.hat(R, b, "hood", p.hoodColor || outer);
    else if (p.hood === "down") hoodDown(R, b, rings, p.hoodColor || outer);
    return rings;
  }
  OUT.cast_robes = function (R, b, rng, look, o) {
    const pr = o.preset && L.CAST[o.preset];
    robes(R, b, rng, look, (pr && pr.robe) || { under: OCHRE });
  };

  // ------------------------------------------------------------------
  // Coats (Sol's greatcoat, Ruby's green coat, Wren's long coat, Unkindled layers)
  // p: {shirt, pants, coat, open (gap angle), len, flare, collar, buttons (rows), pockets, boot, bootH, glove, region}
  // ------------------------------------------------------------------
  function coat(R, b, rng, look, p) {
    const s = b.s;
    Object.assign(
      look,
      {
        top: p.shirt,
        topRegion: p.shirtRegion || "rags",
        bottom: p.pants,
        bottomRegion: p.pantsRegion || "rags",
        sleeve: "long",
        sleeveColor: p.coat,
        sleeveRegion: p.region || "rags",
        boot: p.boot || 0x2a2018,
        bootH: p.bootH || 0.3,
        laces: !!p.laces,
        glove: p.glove || null,
      },
      p.look || {},
    );
    H.body(R, b, look);
    const m = cloth(p.coat, { region: p.region || "rags", paint: p.paint });
    const gap = p.open === undefined ? 0.42 : p.open;
    const rings = shell(R, b, m, p.k || 1.08, gap);
    if (p.len)
      H.coatTails(
        R,
        b,
        m,
        p.len,
        p.flare === undefined ? 0.25 : p.flare,
        gap === 0,
      );
    if (p.collar)
      R.add(
        "chest",
        P.xf(
          P.torus(0.072 * s, 0.018 * s, 6, 18),
          0,
          0.252 * s,
          0.006 * s,
          PI / 2 + 0.3,
          0,
          0,
          1.18,
          1.05,
          1,
        ),
        cloth(p.collarC || L.shade(p.coat, 0.92), {
          region: p.region || "rags",
        }),
      );
    if (p.buttons) {
      const bm = metalM(p.buttonC || BRASS, { metal: 0.85, rough: 0.3 }),
        k = (p.k || 1.08) * 1.03;
      const cols = p.buttons === 2 ? [-0.05, 0.05] : [0];
      for (const cx of cols) {
        for (const [y, ri] of [
          [0.14, 2],
          [0.07, 1],
          [0.0, 0],
        ])
          R.add(
            "chest",
            P.xf(
              P.sphere(0.008 * s, 0.008 * s, 0.005 * s, 8, 5),
              cx * s,
              y * s,
              frontZ(rings, ri, k) - 0.002 * s,
            ),
            bm,
          );
        R.add(
          "spine",
          P.xf(
            P.sphere(0.008 * s, 0.008 * s, 0.005 * s, 8, 5),
            cx * s,
            rings.abdomen[1].y,
            -rings.abdomen[1].rz * k * 1.02 +
              (rings.abdomen[1].oz || 0) -
              0.002 * s,
          ),
          bm,
        );
      }
    }
    if (p.pockets)
      for (const sg of [-1, 1])
        R.add(
          "hips",
          P.xf(
            P.box(0.085 * s, 0.075 * s, 0.012 * s, 0.004 * s),
            sg * 0.1 * s,
            -0.01 * s,
            -rings.pelvis[2].rz * 1.15,
            0,
            sg * 0.2,
            0,
          ),
          cloth(L.shade(p.coat, 0.88), { region: p.region || "rags" }),
        );
    return rings;
  }
  OUT.cast_coat = function (R, b, rng, look, o) {
    const pr = o.preset && L.CAST[o.preset];
    coat(
      R,
      b,
      rng,
      look,
      (pr && pr.coat) || {
        shirt: 0x8a8274,
        pants: 0x4a463f,
        coat: 0x5a554c,
        len: 0.6,
      },
    );
  };

  // ------------------------------------------------------------------
  // Kits (run after the head, so the face fit is known)
  // ------------------------------------------------------------------
  /** Burned-skin mottling on the neck's left side / the left hand (old fire burn, healed shiny). */
