// play-inline-459 09 — look
// Lines 2235-2426 of readable/play-inline-459.pretty.js (statement-aligned).
  function nunKit(R, b) {
    const s = b.s,
      hs = b.headS,
      C = HC(b),
      rings = H.torsoRings(b),
      white = cloth(0xe6e2d8, { region: "cloth", rough: 0.8 });
    const coif = [
      {
        y: C[1] - 0.15 * hs,
        rx: 0.124 * hs,
        rz: 0.122 * hs,
        oz: C[2] + 0.026 * hs,
        n: 2,
      },
      {
        y: C[1] - 0.05 * hs,
        rx: 0.1 * hs,
        rz: 0.117 * hs,
        oz: C[2] + 0.013 * hs,
        n: 2,
      },
      {
        y: C[1] + 0.06 * hs,
        rx: 0.099 * hs,
        rz: 0.113 * hs,
        oz: C[2] + 0.01 * hs,
        n: 2,
      },
      {
        y: C[1] + 0.112 * hs,
        rx: 0.074 * hs,
        rz: 0.088 * hs,
        oz: C[2] + 0.018 * hs,
        n: 2,
      },
    ];
    R.add(
      "head",
      P.loft(coif, { seg: 18, a0: PI * 0.16, a1: PI * 1.84 }),
      white,
    ); // the hood (veil) sits over it; its rim frames the face
    R.add(
      "chest",
      P.xf(
        P.cyl(0.084 * s, 0.15 * s, 0.085 * s, 20, true),
        0,
        0.235 * s,
        0.006 * s,
        0.1,
        0,
        0,
        1.12,
        1,
        1.05,
      ),
      white,
    ); // collar
    const z = frontZ(rings, 2, 1.13) - 0.006 * s,
      wood = leatherM(0x5a3a22),
      y = 0.06 * s;
    R.add(
      "chest",
      P.sweep(
        [
          [-0.06 * s, 0.24 * s, -0.01 * s],
          [-0.06 * s, 0.16 * s, z * 0.85],
          [0, y + 0.05 * s, z],
          [0.06 * s, 0.16 * s, z * 0.85],
          [0.06 * s, 0.24 * s, -0.01 * s],
        ],
        0.002 * s,
        { seg: 14, rs: 3 },
      ),
      leatherM(0x2a2018),
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.011 * s, 0.075 * s, 0.008 * s, 0.002 * s),
        0,
        y + 0.012 * s,
        z - 0.002 * s,
      ),
      wood,
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.046 * s, 0.011 * s, 0.008 * s, 0.002 * s),
        0,
        y + 0.03 * s,
        z - 0.003 * s,
      ),
      wood,
    );
  }
  function zealotKit(R, b, rng) {
    const s = b.s,
      rings = H.torsoRings(b);
    // padded leather chest guard with the sun painted on
    const cg = P.loft(scaleRings(rings.chest.slice(0, 4), 1.16, 1.2), {
      seg: 16,
      a0: -PI * 0.42,
      a1: PI * 0.42,
    });
    R.add("chest", cg, leatherM(0x4a3020));
    R.decal(
      "chest",
      "sundisc",
      0.12 * s,
      0.12 * s,
      0,
      0.09 * s,
      frontZ(rings, 2, 1.22) - 0.004,
      0,
      0,
      0,
      { emis: 0.35 },
    );
    H.wraps(R, b, 0xb8ae98, "arms", { armTop: 0.35 });
    H.mask(R, b, "scarf", 0x6a2a1e, 0x8a3a2a);
    void rng;
  }

  // ------------------------------------------------------------------
  // Resolution: L.castOpts(id, callerOpts) → human opts (used by 50_character resolveId)
  // ------------------------------------------------------------------
  const FORCE = [
    "outfit",
    "gender",
    "skinTone",
    "hair",
    "hairColor",
    "beard",
    "burn",
    "scars",
    "hat",
    "hatColor",
    "glasses",
    "age",
    "acc",
    "outfitColor",
    "scale",
    "color",
    "crowdPlain",
    "noCap",
  ];
  const RANK_KEEP = ["gender", "skinTone", "hair", "hairColor", "beard"];
  L.castFlags = function (v) {
    const f = {};
    if (typeof v === "string")
      for (const k of v.split(/[,+ ]+/)) if (k) f[k] = true;
    return f;
  };
  L.castOpts = function (id, caller) {
    const c = CAST[id],
      o = Object.assign({}, caller || {});
    for (const k of FORCE) delete o[k];
    Object.assign(o, c.opts || {});
    if (c.ranked) {
      for (const k of RANK_KEEP)
        if (
          (c.lock || []).indexOf(k) < 0 &&
          caller &&
          caller[k] !== undefined &&
          caller[k] !== null
        )
          o[k] = caller[k];
    } else o.seed = c.seed;
    o.outfit = c.outfit;
    o.preset = id;
    const f = L.castFlags(caller && caller.variant),
      ok = Object.keys(f)
        .filter((k) => (c.variants || []).indexOf(k) >= 0)
        .sort();
    if (ok.length) o.variant = ok.join(",");
    else delete o.variant;
    return o;
  };
  // per-preset look hooks the outfits read (neck / hand burns for the Dawn)
  const _robe = OUT.cast_robes;
  OUT.cast_robes = function (R, b, rng, look, o) {
    const pr = o.preset && CAST[o.preset];
    if (pr && pr.look && pr.look.neckBurn) {
      look.neckMat = skinM(look.skin, {
        paint: burnPaint(pr.look.neckBurn),
        region: "skin",
      });
      look.skinPaintL = burnPaint(0);
    }
    return _robe(R, b, rng, look, o);
  };
