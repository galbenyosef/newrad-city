// play-inline-466 03 — add
// Lines 134-630 of readable/play-inline-466.pretty.js (statement-aligned).
  function buildPatrolman(opts, seed) {
    const rng = L.rng(seed);
    const vk =
      typeof opts.variant === "string" && PATROL_PAINT[opts.variant]
        ? opts.variant
        : rng.pick(["utility", "police", "police", "fire", "medical"]);
    const [c1, c2, lc] = PATROL_PAINT[vk];
    const b = H.proportions("m", { scale: 1.1, shoulderMul: 1.25 });
    b.upper *= 1.02;
    const R = new L.Rig("biped");
    H.skeleton(R, b);
    const s = b.s;
    // hinged lower clamp jaw on each hand (opens/closes with the pincer anims)
    for (const [S, part] of [
      ["L", "leftArm"],
      ["R", "rightArm"],
    ])
      R.bone("pincer" + S, "hand" + S, 0, -0.04 * s, 0.03 * s, part);
    const body = paint(c1),
      panel = paint(c2),
      dark = metal(0x262624, { rough: 0.6 }),
      trim = metal(0x5c5c56),
      chrome = metal(PAL.chrome, { rough: 0.25, metal: 0.85 });
    // ---- pelvis: flat box with hip hubs ----
    R.add(
      "hips",
      P.xf(P.box(0.36 * s, 0.14 * s, 0.24 * s, 0.03 * s), 0, -0.01 * s, 0),
      body,
    );
    R.add(
      "hips",
      P.xf(P.box(0.2 * s, 0.05 * s, 0.02 * s, 0.008 * s), 0, 0.0, -0.125 * s),
      dark,
    );
    // ---- waist bellows ----
    bellows(
      R,
      "spine",
      0.0,
      b.spine + 0.02 * s,
      0.26 * s,
      0.18 * s,
      4,
      dark,
      trim,
    );
    // ---- cabinet torso: a tall box, wider at the top, chamfered ----
    const chest = P.box(0.46 * s, 0.44 * s, 0.3 * s, 0.035 * s, 3);
    P.deform(chest, (v) => {
      const k = 0.9 + 0.1 * ((v.y / (0.22 * s)) * 0.5 + 0.5);
      v.x *= k;
    });
    R.add("chest", P.xf(chest, 0, 0.1 * s, 0), body);
    // recessed front panel, badge, indicator lamps, speaker grille, maker plate
    R.add(
      "chest",
      P.xf(
        P.box(0.34 * s, 0.26 * s, 0.03 * s, 0.01 * s),
        0,
        0.08 * s,
        -0.145 * s,
      ),
      panel,
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.24 * s, 0.07 * s, 0.01 * s, 0.004 * s),
        0,
        0.27 * s,
        -0.152 * s,
      ),
      { color: 0xffffff, region: "grille", rough: 0.6, metal: 0.4 },
    );
    for (let i = 0; i < 5; i++)
      R.add(
        "chest",
        P.xf(
          P.cyl(0.013 * s, 0.013 * s, 0.012 * s, 10),
          (-0.1 + i * 0.05) * s,
          0.0,
          -0.163 * s,
          PI / 2,
          0,
          0,
        ),
        light(i === 2 ? lc : i % 2 ? 0xffe070 : 0x70d070, 1.6),
      );
    R.decal(
      "chest",
      "maker",
      0.2 * s,
      0.05 * s,
      0,
      -0.06 * s,
      -0.162 * s,
      0,
      0,
      0,
    );
    if (vk === "police") {
      const badge = P.extrude(
        [
          [0, 0.05],
          [0.032, 0.036],
          [0.04, 0.0],
          [0.024, -0.04],
          [0, -0.05],
          [-0.024, -0.04],
          [-0.04, 0.0],
          [-0.032, 0.036],
        ].map((q) => [q[0] * s, q[1] * s]),
        0.01 * s,
        0.002 * s,
      );
      R.add(
        "chest",
        P.xf(badge, -0.1 * s, 0.15 * s, -0.163 * s),
        metal(0xc8a040, { rough: 0.3, metal: 0.85 }),
      );
      R.decal(
        "chest",
        "numplate",
        0.16 * s,
        0.08 * s,
        0,
        0.14 * s,
        0.152 * s,
        0,
        PI,
        0,
      );
    } else if (vk === "medical") {
      R.decal(
        "chest",
        "redcross",
        0.08 * s,
        0.08 * s,
        -0.1 * s,
        0.15 * s,
        -0.162 * s,
        0,
        0,
        0,
      );
    } else if (vk === "fire" || vk === "military") {
      R.decal(
        "chest",
        "hazard",
        0.3 * s,
        0.04 * s,
        0,
        -0.1 * s,
        -0.162 * s,
        0,
        0,
        0,
      );
    }
    // back: battery hatch with vent louvres & two short exhaust stacks
    R.add(
      "chest",
      P.xf(P.box(0.3 * s, 0.28 * s, 0.03 * s, 0.01 * s), 0, 0.1 * s, 0.155 * s),
      trim,
    );
    for (let i = 0; i < 5; i++)
      R.add(
        "chest",
        P.xf(
          P.box(0.24 * s, 0.012 * s, 0.02 * s, 0.003 * s),
          0,
          (0.0 + i * 0.045) * s,
          0.172 * s,
          -0.4,
          0,
          0,
        ),
        dark,
      );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.cyl(0.025 * s, 0.025 * s, 0.1 * s, 8),
          sg * 0.1 * s,
          0.34 * s,
          0.13 * s,
        ),
        dark,
      );
    // shoulder blocks (boxy pauldron housings); police/fire carry a lamp bar on top
    for (const sg of [-1, 1]) {
      R.add(
        "chest",
        P.xf(
          P.box(0.14 * s, 0.12 * s, 0.22 * s, 0.025 * s),
          sg * 0.27 * s,
          b.shY + 0.01 * s,
          0,
        ),
        panel,
      );
      if (vk === "police" || vk === "fire") {
        R.add(
          "chest",
          P.xf(
            P.box(0.1 * s, 0.035 * s, 0.06 * s, 0.01 * s),
            sg * 0.27 * s,
            b.shY + 0.085 * s,
            0,
          ),
          dark,
        );
        R.add(
          "chest",
          P.xf(
            P.box(0.085 * s, 0.03 * s, 0.05 * s, 0.01 * s),
            sg * 0.27 * s,
            b.shY + 0.11 * s,
            0,
          ),
          light(
            vk === "police" ? (sg < 0 ? 0xff2a1a : 0x2a5aff) : 0xff8a20,
            1.8,
          ),
        );
      }
    }
    // ---- neck: square bellows ----
    bellows(
      R,
      "neck",
      -0.03 * s,
      b.headY + 0.01 * s,
      0.11 * s,
      0.1 * s,
      3,
      dark,
      trim,
    );
    // ---- head: flat-topped box, visor slit, ear vents, short whip aerial ----
    const hs = s;
    const head = P.box(0.27 * hs, 0.2 * hs, 0.23 * hs, 0.03 * hs, 3);
    P.deform(head, (v) => {
      if (v.z < 0 && v.y < 0) v.z *= 0.92;
    }); // chin bevel
    R.add("head", P.xf(head, 0, 0.11 * hs, 0), panel);
    R.add(
      "head",
      P.xf(
        P.box(0.28 * hs, 0.03 * hs, 0.24 * hs, 0.008 * hs),
        0,
        0.215 * hs,
        0,
      ),
      body,
    ); // lid band
    R.add(
      "head",
      P.xf(
        P.box(0.22 * hs, 0.05 * hs, 0.03 * hs, 0.01 * hs),
        0,
        0.13 * hs,
        -0.112 * hs,
      ),
      dark,
    ); // visor recess
    R.add(
      "head",
      P.xf(
        P.box(0.19 * hs, 0.014 * hs, 0.01 * hs, 0.004 * hs),
        0,
        0.13 * hs,
        -0.127 * hs,
      ),
      light(lc, 2.6),
    ); // visor slit
    R.add(
      "head",
      P.xf(
        P.box(0.14 * hs, 0.04 * hs, 0.01 * hs, 0.004 * hs),
        0,
        0.06 * hs,
        -0.116 * hs,
      ),
      { color: 0xffffff, region: "grille", rough: 0.6, metal: 0.4 },
    ); // mouth grille
    for (const sg of [-1, 1]) {
      R.add(
        "head",
        P.xf(
          P.cyl(0.045 * hs, 0.045 * hs, 0.03 * hs, 12),
          sg * 0.145 * hs,
          0.11 * hs,
          0,
          0,
          0,
          PI / 2,
        ),
        trim,
      ); // ear hubs
      for (let i = 0; i < 3; i++)
        R.add(
          "head",
          P.xf(
            P.box(0.006 * hs, 0.05 * hs, 0.008 * hs, 0.002 * hs),
            sg * 0.161 * hs,
            0.11 * hs,
            (i - 1) * 0.016 * hs,
          ),
          dark,
        );
    }
    R.add(
      "head",
      P.xf(
        P.cyl(0.005 * hs, 0.006 * hs, 0.18 * hs, 6),
        0.1 * hs,
        0.3 * hs,
        0.07 * hs,
        0,
        0,
        -0.12,
      ),
      chrome,
    ); // whip aerial
    // ---- arms: square tubes, elbow drums, boxy forearms, clamp hands ----
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      R.add(
        "arm" + S,
        P.xf(P.cyl(0.06 * s, 0.06 * s, 0.1 * s, 12), 0, 0, 0, 0, 0, PI / 2),
        trim,
      );
      R.add(
        "arm" + S,
        P.xf(
          P.box(0.085 * s, b.upper * 0.82, 0.085 * s, 0.015 * s),
          0,
          -b.upper * 0.5,
          0,
        ),
        body,
      );
      R.add(
        "arm" + S,
        P.xf(
          P.cyl(0.01 * s, 0.01 * s, b.upper * 0.7, 6),
          0,
          -b.upper * 0.5,
          -0.055 * s,
        ),
        chrome,
      ); // piston
      R.add(
        "forearm" + S,
        P.xf(P.cyl(0.05 * s, 0.05 * s, 0.11 * s, 12), 0, 0, 0, 0, 0, PI / 2),
        dark,
      );
      const fa = P.box(0.1 * s, b.fore * 0.85, 0.1 * s, 0.018 * s);
      P.deform(fa, (v) => {
        const k = 1 + 0.15 * (-v.y / (b.fore * 0.42));
        v.x *= k;
        v.z *= k;
      });
      R.add("forearm" + S, P.xf(fa, 0, -b.fore * 0.5, 0), panel);
      R.add(
        "hand" + S,
        P.xf(P.box(0.08 * s, 0.06 * s, 0.08 * s, 0.012 * s), 0, -0.02 * s, 0),
        trim,
      );
      // fixed upper clamp jaw + hinged lower jaw (pincer bone)
      R.add(
        "hand" + S,
        P.xf(
          P.box(0.07 * s, 0.11 * s, 0.025 * s, 0.008 * s),
          0,
          -0.1 * s,
          -0.025 * s,
          0.15,
          0,
          0,
        ),
        chrome,
      );
      R.add(
        "pincer" + S,
        P.xf(
          P.box(0.07 * s, 0.1 * s, 0.022 * s, 0.008 * s),
          0,
          -0.055 * s,
          0.0,
          -0.12,
          0,
          0,
        ),
        chrome,
      );
      R.add(
        "pincer" + S,
        P.xf(P.cyl(0.012 * s, 0.012 * s, 0.08 * s, 8), 0, 0, 0, 0, 0, PI / 2),
        dark,
      ); // hinge pin
    }
    // ---- legs: box thighs, knee drums, shins with twin pistons, slab feet ----
    for (const S of ["L", "R"]) {
      R.add(
        "thigh" + S,
        P.xf(P.box(0.13 * s, 0.1 * s, 0.13 * s, 0.03 * s), 0, 0, 0),
        dark,
      );
      R.add(
        "thigh" + S,
        P.xf(
          P.box(0.12 * s, b.thigh * 0.8, 0.13 * s, 0.02 * s),
          0,
          -b.thigh * 0.5,
          0,
        ),
        body,
      );
      R.add(
        "shin" + S,
        P.xf(P.cyl(0.06 * s, 0.06 * s, 0.13 * s, 12), 0, 0, 0, 0, 0, PI / 2),
        trim,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.11 * s, b.shin * 0.78, 0.12 * s, 0.02 * s),
          0,
          -b.shin * 0.5,
          0.005 * s,
        ),
        panel,
      );
      for (const sg of [-1, 1])
        R.add(
          "shin" + S,
          P.xf(
            P.cyl(0.01 * s, 0.01 * s, b.shin * 0.75, 6),
            sg * 0.035 * s,
            -b.shin * 0.5,
            0.07 * s,
          ),
          chrome,
        );
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.16 * s, b.ankle + 0.035 * s, 0.32 * s, 0.025 * s),
          0,
          -b.ankle / 2 + 0.012 * s,
          -0.06 * s,
        ),
        body,
      );
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.165 * s, 0.022 * s, 0.33 * s, 0.006 * s),
          0,
          -b.ankle + 0.01 * s,
          -0.06 * s,
        ),
        rubber,
      );
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.12 * s, 0.02 * s, 0.03 * s, 0.006 * s),
          0,
          -b.ankle / 2 + 0.03 * s,
          -0.22 * s,
        ),
        hazardOrDark(vk, dark),
      );
    }
    R.socket("muzzle", "head", 0, 0.13 * hs, -0.14 * hs);
    R.socket("eyes", "head", 0, 0.13 * hs, -0.13 * hs);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      gore: "oil",
      bodyThick: 0.2 * s,
      cut: {
        head: "head",
        leftArm: "forearmL",
        rightArm: "forearmR",
        leftLeg: "shinL",
        rightLeg: "shinR",
      },
      weaponScale: 1,
    });
    return tpl;
  }
