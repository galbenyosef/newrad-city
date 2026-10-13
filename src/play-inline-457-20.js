// play-inline-457 20 — rng
// Lines 4934-5284 of readable/play-inline-457.pretty.js (statement-aligned).
  OUT.survivor_layers = function (R, b, rng, look, o) {
    const kind = rng.pick(["layers", "layers", "worker", "wrapped", "quilted"]);
    const rings = H.torsoRings(b);
    const acc = rng.pick(H.SURVIVOR_ACCENTS),
      acc2 = rng.pick(H.SURVIVOR_ACCENTS.filter((c) => c !== acc));
    const base = rng.pick(H.SURVIVOR_BASE),
      linen = rng.pick(LINEN);
    const torn = (seedK, amt) => (v) => {
      if (v.y < 0)
        v.y += (L.hash3(v.x * 300 + seedK, 3, v.z * 300) - 0.5) * amt;
    };
    if (kind === "worker") {
      Object.assign(look, {
        top: base,
        topRegion: "rags",
        bottom: base,
        bottomRegion: "rags",
        sleeve: "rolled",
        sleeveColor: base,
        sleeveRegion: "rags",
        boot: 0x2a2018,
        bootH: 0.34,
        laces: true,
        glove: rng.chance(0.5) ? 0x4a3a2a : null,
      });
      H.body(R, b, look);
      // heavy canvas / leather work apron with a bib
      const apC = rng.pick([0x5a4030, 0x6a5a44, acc]);
      const pr = rings.pelvis[3],
        s = b.s;
      R.add(
        "hips",
        P.loft(
          [
            {
              y: -0.42 * s,
              rx: pr.rx * 1.14,
              rz: pr.rz * 1.36,
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
          { seg: 14, a0: -PI * 0.42, a1: PI * 0.42 },
        ),
        apC === acc ? cloth(apC, { region: "rags" }) : leatherM(apC),
      );
      R.add(
        "chest",
        P.loft(
          [
            {
              y: -0.05 * s,
              rx: rings.chest[0].rx * 0.6,
              rz: rings.chest[0].rz * 1.06,
              n: 2.3,
            },
            {
              y: 0.15 * s,
              rx: rings.chest[2].rx * 0.52,
              rz: rings.chest[2].rz * 1.06,
              oz: rings.chest[2].oz,
              n: 2.3,
            },
          ],
          { seg: 10, a0: -PI * 0.3, a1: PI * 0.3 },
        ),
        apC === acc ? cloth(apC, { region: "rags" }) : leatherM(apC),
      );
      H.belt(R, b, 0x2a2018, 0x8a8a7a, 2);
      H.cowl(R, b, acc2, { tail: 0, drape: 0.4 });
      H.wraps(R, b, linen, "arms", { armTop: 0.45 });
      H.survivorHead(R, b, rng, acc, {
        face: rng.pick(["weldup", "weldup", "respirator", "weld"]),
        hat: rng.pick(["knit", "knit", "hardhat", "cap"]),
      });
      return;
    }
    if (kind === "wrapped") {
      Object.assign(look, {
        top: linen,
        topRegion: "rags",
        bottom: base,
        bottomRegion: "rags",
        sleeve: "long",
        sleeveColor: L.shade(linen, 0.85),
        sleeveRegion: "rags",
        boot: 0x2a241e,
        bootH: 0.15,
        laces: false,
      });
      H.body(R, b, look);
      // poncho shawl: a wide drape from the shoulders to the hips, ragged hem
      const s = b.s,
        cr = rings.chest;
      const po = P.loft(
        [
          {
            y: -0.17 * s,
            rx: cr[2].rx * 1.5,
            rz: cr[2].rz * 1.5,
            oz: cr[2].oz,
            n: 2.0,
          },
          {
            y: 0.0,
            rx: cr[2].rx * 1.36,
            rz: cr[2].rz * 1.34,
            oz: cr[2].oz,
            n: 2.1,
          },
          {
            y: cr[2].y,
            rx: cr[2].rx * 1.24,
            rz: cr[2].rz * 1.2,
            oz: cr[2].oz,
            n: 2.6,
          },
          {
            y: cr[3].y + 0.006 * s,
            rx: cr[3].rx * 1.16,
            rz: cr[3].rz * 1.26,
            oz: cr[3].oz,
            n: 2.7,
          },
          {
            y: cr[4].y + 0.016 * s,
            rx: cr[4].rx * 1.12,
            rz: cr[4].rz * 1.28,
            oz: cr[4].oz,
            n: 2.4,
          },
        ],
        { seg: 20 },
      );
      P.deform(po, torn(seed0(rng), 0.08 * s));
      const stripe = (x, y, z, nx, ny, nz, out) => {
        const k = (y / s + 0.2) * 9;
        if (Math.abs(k - Math.round(k)) < 0.09 && k > 0.5 && k < 2.6) {
          const c = L.col(acc2);
          out[0] = c.r;
          out[1] = c.g;
          out[2] = c.b;
        }
      };
      R.add("chest", po, cloth(acc, { region: "rags", paint: stripe }));
      // rope belt over the tunic
      const pr = rings.pelvis[3];
      R.add(
        "hips",
        P.xf(
          P.torus(1, 0.011 * s, 5, 22),
          0,
          pr.y + 0.03 * s,
          0,
          PI / 2,
          0,
          0,
          pr.rx * 1.1,
          pr.rz * 1.14,
          1,
        ),
        { color: 0x8a7a5a, region: "rags", rough: 1 },
      );
      H.wraps(R, b, linen, rng.chance(0.6) ? "arms,legs" : "legs");
      H.survivorHead(R, b, rng, acc, {
        hat: rng.pick(["wrap", "wrap", "hood", "knit"]),
        face: rng.pick(["scarf", "scarf", "weldup", null]),
      });
      return;
    }
    if (kind === "quilted") {
      const shirt = rng.pick([linen, 0x7a7266, 0x8a8274]);
      Object.assign(look, {
        top: shirt,
        topRegion: "rags",
        bottom: base,
        bottomRegion: "rags",
        sleeve: "long",
        sleeveColor: shirt,
        sleeveRegion: "rags",
        boot: 0x2a2018,
        bootH: 0.3,
        laces: true,
      });
      H.body(R, b, look);
      const qp = (x, y, z, nx, ny, nz, out) => {
        if (Math.abs(Math.sin((y / b.s) * 60)) < 0.14) {
          out[0] *= 0.75;
          out[1] *= 0.75;
          out[2] *= 0.75;
        }
      };
      const vm = cloth(acc, { region: "rags", paint: qp });
      R.add(
        "chest",
        P.loft(scaleRings(rings.chest.slice(0, 5), 1.1, 1.12), {
          seg: 16,
          a0: PI * 0.07,
          a1: PI * 1.93,
        }),
        vm,
      );
      R.add(
        "spine",
        P.loft(scaleRings(rings.abdomen, 1.1, 1.12), {
          seg: 16,
          a0: PI * 0.07,
          a1: PI * 1.93,
        }),
        vm,
      );
      R.add(
        "hips",
        P.loft(scaleRings(rings.pelvis.slice(2), 1.1, 1.12), {
          seg: 16,
          a0: PI * 0.07,
          a1: PI * 1.93,
        }),
        vm,
      );
      H.cowl(R, b, acc2, { tail: rng.chance(0.5) ? 0.7 : 0, drape: 0 });
      H.wraps(R, b, linen, "arms", {
        one: rng.chance(0.5) ? "L" : "R",
        armTop: 0.5,
      });
      H.belt(R, b, 0x2a2018, 0x8a8a7a, 1);
      H.survivorHead(R, b, rng, acc2);
      return;
    }
    // 'layers': long coat (open) over a knit pullover, cowl scarf, wrapped forearms
    const coat = base,
      knitC = rng.pick([0x8a8274, linen, 0x6a6458]);
    Object.assign(look, {
      top: knitC,
      topRegion: "rags",
      bottom: L.shade(base, 0.8),
      bottomRegion: "rags",
      sleeve: "long",
      sleeveColor: coat,
      sleeveRegion: "rags",
      boot: 0x221c16,
      bootH: 0.3,
      laces: false,
    });
    H.body(R, b, look);
    const m = cloth(coat, { region: "rags" });
    for (const [bone, rs, k] of [
      ["chest", rings.chest.slice(0, 5), 1.08],
      ["spine", rings.abdomen, 1.09],
      ["hips", rings.pelvis.slice(2), 1.1],
    ])
      R.add(
        bone,
        P.loft(scaleRings(rs, k), { seg: 16, a0: 0.42, a1: PI * 2 - 0.42 }),
        m,
      );
    H.coatTails(R, b, m, rng.range(0.55, 0.85), 0.3);
    // patched elbows in the second accent
    for (const S of ["L", "R"])
      if (rng.chance(0.6))
        R.add(
          "forearm" + S,
          P.xf(
            P.sphere(0.042 * b.s, 0.05 * b.s, 0.03 * b.s, 8, 6),
            0,
            -0.02 * b.s,
            0.035 * b.s,
          ),
          cloth(acc2, { region: "rags" }),
        );
    H.cowl(R, b, acc, { tail: rng.range(0.6, 1), torn: true });
    H.wraps(R, b, linen, "arms", { armTop: 0.62 });
    H.belt(R, b, 0x2a2018, 0x8a8a7a, rng.int(0, 2));
    H.survivorHead(R, b, rng, acc);
  };
  const seed0 = (rng) => (rng() * 997) | 0;

  /** Continuity officer: grey service tunic & trousers, Sam-Browne belt, peaked cap, dome insignia. */
  OUT.continuity_uniform = function (R, b, rng, look, o) {
    const grey = 0x6a6e70,
      dark = 0x3e4246;
    Object.assign(look, {
      top: grey,
      bottom: grey,
      sleeve: "long",
      cuff: dark,
      boot: 0x141414,
      bootH: 0.42,
      laces: false,
      glove: rng.chance(0.5) ? 0x1e1e1e : null,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const m = cloth(grey);
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.04), { seg: 16 }),
      m,
    );
    R.add(
      "hips",
      P.loft(scaleRings(rings.pelvis.slice(2), 1.07), { seg: 16 }),
      m,
    ); // tunic skirt
    for (let i = 0; i < 4; i++)
      R.add(
        "chest",
        P.xf(
          P.sphere(0.008 * b.s, 0.008 * b.s, 0.005 * b.s, 6, 4),
          0,
          (0.0 + i * 0.06) * b.s,
          -rings.chest[2].rz * 1.06,
        ),
        metalM(0xb8b8b0),
      ); // buttons
    for (const S of ["L", "R"])
      R.add(
        "arm" + S,
        P.xf(
          P.box(0.1 * b.s, 0.012 * b.s, 0.06 * b.s, 0.004),
          0,
          0.045 * b.s,
          0,
        ),
        cloth(dark),
      ); // shoulder boards
    R.decal(
      "chest",
      "continuity",
      0.05 * b.s,
      0.05 * b.s,
      -0.085 * b.s,
      0.15 * b.s,
      -rings.chest[2].rz * 1.07 - 0.003,
      0,
      0,
      0,
    );
    H.belt(R, b, 0x1a1a1a, 0xb8b8b0, 1);
    H.strap(R, b, 0x1a1a1a, [-0.9, 0.22], [0.75, -0.04], 0.7, false);
    if (!o.noCap) H.hat(R, b, "cap", dark);
  };

