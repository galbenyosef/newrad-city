// play-inline-467 05 — add
// Lines 657-1081 of readable/play-inline-467.pretty.js (statement-aligned).
  function buildStriker(opts, seed) {
    const rng = L.rng(seed);
    const b = H.proportions("m", { scale: 1.08, shoulderMul: 1.05 });
    b.upper *= 1.05;
    b.fore *= 1.1;
    const R = new L.Rig("biped");
    H.skeleton(R, b, { neckZ: -0.05 * b.s, headZ: -0.03 * b.s });
    const s = b.s;
    const shellC = rng.pick([0x3e4246, 0x4a4e44, 0x585a5c]);
    const shell = paint(shellC, { rough: 0.45 }),
      accent = paint(0xc8661e),
      frame = metal(0x2c2c2a, { rough: 0.45 }),
      chrome = metal(0xc0c0b8, { rough: 0.22, metal: 0.9 }),
      dark = metal(0x161614, { rough: 0.6 });
    const blade = metal(0xd8d8d0, { rough: 0.15, metal: 0.95 });
    // ---- pelvis & spine column ----
    R.add(
      "hips",
      P.xf(P.box(0.26 * s, 0.1 * s, 0.18 * s, 0.03 * s), 0, 0, 0.01 * s),
      frame,
    );
    R.add(
      "hips",
      P.xf(
        P.box(0.18 * s, 0.07 * s, 0.03 * s, 0.01 * s),
        0,
        0.01 * s,
        -0.08 * s,
      ),
      accent,
    );
    for (let i = 0; i < 4; i++)
      R.add(
        "spine",
        P.xf(
          P.box(0.08 * s, 0.04 * s, 0.07 * s, 0.012 * s),
          0,
          (0.02 + i * 0.05) * s,
          0.03 * s,
        ),
        frame,
      );
    for (const sg of [-1, 1])
      R.add(
        "spine",
        P.xf(
          P.cyl(0.012 * s, 0.012 * s, b.spine * 1.3, 6),
          sg * 0.07 * s,
          b.spine * 0.5,
          -0.02 * s,
        ),
        chrome,
      );
    // ---- chest: a forward-pointing keel wedge with armour fins ----
    const ch = P.loft(
      [
        { y: -0.04 * s, rx: 0.12 * s, rz: 0.1 * s, n: 2.6 },
        { y: 0.08 * s, rx: 0.2 * s, rz: 0.15 * s, n: 3.2 },
        { y: 0.18 * s, rx: 0.24 * s, rz: 0.14 * s, n: 3.4 },
        { y: 0.25 * s, rx: 0.15 * s, rz: 0.1 * s, n: 2.6 },
      ],
      { seg: 20, capTop: true, capBottom: true },
    );
    P.deform(ch, (v) => {
      if (v.z < 0) v.z *= 1 + 0.6 * Math.max(0, 1 - Math.abs(v.x) / (0.12 * s));
    }); // keel ridge
    R.add("chest", ch, shell);
    R.add(
      "chest",
      P.xf(
        P.box(0.03 * s, 0.22 * s, 0.03 * s, 0.01 * s),
        0,
        0.12 * s,
        -0.215 * s,
      ),
      accent,
    );
    R.decal(
      "chest",
      "hazard",
      0.16 * s,
      0.03 * s,
      0,
      0.0,
      -0.16 * s,
      -0.4,
      0,
      0,
    );
    R.decal(
      "chest",
      "maker",
      0.12 * s,
      0.035 * s,
      0,
      0.18 * s,
      0.135 * s,
      0,
      PI,
      0,
    );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.02 * s, 0.16 * s, 0.14 * s, 0.006 * s),
          sg * 0.08 * s,
          0.24 * s,
          0.13 * s,
          -0.35,
          0,
          sg * 0.25,
        ),
        frame,
      ); // dorsal fins
    // right-shoulder ARC POD: coil rings and an emissive tip
    R.add(
      "chest",
      P.xf(
        P.box(0.1 * s, 0.09 * s, 0.12 * s, 0.02 * s),
        0.17 * s,
        b.shY + 0.09 * s,
        0.0,
      ),
      shell,
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.035 * s, 0.04 * s, 0.2 * s, 12),
        0.17 * s,
        b.shY + 0.1 * s,
        -0.12 * s,
        PI / 2,
        0,
        0,
      ),
      frame,
    );
    for (let k = 0; k < 3; k++)
      R.add(
        "chest",
        P.xf(
          P.torus(0.045 * s, 0.008 * s, 5, 14),
          0.17 * s,
          b.shY + 0.1 * s,
          (-0.06 - k * 0.05) * s,
        ),
        light(0x7ad8ff, 1.0),
      );
    R.add(
      "chest",
      P.xf(
        P.sphere(0.022 * s, 0.022 * s, 0.022 * s, 10, 8),
        0.17 * s,
        b.shY + 0.1 * s,
        -0.225 * s,
      ),
      light(0xb8f0ff, 2.8),
    );
    // left shoulder cowl
    R.add(
      "chest",
      P.xf(
        P.sphere(0.08 * s, 0.05 * s, 0.08 * s, 10, 7, 0, PI * 2, 0, PI * 0.6),
        -0.19 * s,
        b.shY + 0.03 * s,
        0,
        0,
        0,
        0.3,
      ),
      shell,
    );
    // ---- head: low faceless wedge with a sensor groove and two side optics ----
    R.add(
      "neck",
      P.xf(
        P.cyl(0.035 * s, 0.04 * s, b.neckY + b.headY, 8),
        0,
        (b.neckY + b.headY) * 0.4,
        0,
      ),
      frame,
    );
    const hs = b.headS;
    const wedge = P.extrude(
      [
        [-0.09, 0.0],
        [0.09, 0.0],
        [0.1, 0.055],
        [0.035, 0.085],
        [-0.035, 0.085],
        [-0.1, 0.055],
      ].map((q) => [q[0] * hs, q[1] * hs]),
      0.26 * hs,
      0.008 * hs,
    );
    P.deform(wedge, (v) => {
      const f = clamp(-v.z / (0.11 * hs), -1, 1);
      if (f > 0) {
        v.y *= 1 - 0.55 * f;
        v.x *= 1 - 0.25 * f;
      }
    }); // tapers to a prow
    R.add("head", P.xf(wedge, 0, 0.03 * hs, -0.04 * hs), shell);
    R.add(
      "head",
      P.xf(
        P.box(0.03 * hs, 0.012 * hs, 0.2 * hs, 0.004 * hs),
        0,
        0.1 * hs,
        -0.06 * hs,
      ),
      accent,
    ); // crest stripe
    for (const sg of [-1, 1]) {
      R.add(
        "head",
        P.xf(
          P.cyl(0.016 * hs, 0.018 * hs, 0.02 * hs, 10),
          sg * 0.088 * hs,
          0.04 * hs,
          -0.05 * hs,
          0,
          0,
          PI / 2,
        ),
        frame,
      );
      R.add(
        "head",
        P.xf(
          P.cyl(0.012 * hs, 0.012 * hs, 0.004 * hs, 10),
          sg * 0.1 * hs,
          0.04 * hs,
          -0.05 * hs,
          0,
          0,
          PI / 2,
        ),
        light(0xff6a1a, 2.4),
      );
    }
    // ---- arms: struts, elbow drums, armoured forearms ending in long blades ----
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      R.add(
        "arm" + S,
        P.xf(P.sphere(0.05 * s, 0.05 * s, 0.05 * s, 10, 8), 0, 0, 0),
        frame,
      );
      seg(R, "arm" + S, [0, -b.upper, 0], 0.035 * s, 0.03 * s, shell);
      R.add(
        "arm" + S,
        P.xf(
          P.cyl(0.008 * s, 0.008 * s, b.upper * 0.8, 6),
          sg * 0.03 * s,
          -b.upper * 0.5,
          0.02 * s,
        ),
        chrome,
      );
      R.add(
        "forearm" + S,
        P.xf(P.cyl(0.035 * s, 0.035 * s, 0.07 * s, 10), 0, 0, 0, 0, 0, PI / 2),
        frame,
      );
      const fa = P.box(0.075 * s, b.fore * 0.9, 0.09 * s, 0.015 * s);
      P.deform(fa, (v) => {
        const k = 1 + 0.2 * (-v.y / (b.fore * 0.45));
        v.z *= k;
      });
      R.add("forearm" + S, P.xf(fa, 0, -b.fore * 0.5, 0.005 * s), shell);
      R.add(
        "forearm" + S,
        P.xf(
          P.box(0.02 * s, b.fore * 0.6, 0.03 * s, 0.006 * s),
          sg * 0.04 * s,
          -b.fore * 0.5,
          0,
        ),
        accent,
      );
      R.add(
        "hand" + S,
        P.xf(P.box(0.05 * s, 0.05 * s, 0.07 * s, 0.012 * s), 0, -0.02 * s, 0),
        frame,
      );
      // blade: a flat curved sabre continuing the forearm, edge forward
      const bl = P.extrude(
        [
          [0, 0.0],
          [0.03, 0.0],
          [0.025, -0.25],
          [0.0, -0.36],
          [-0.012, -0.28],
          [-0.006, 0.0],
        ].map((q) => [q[1] * s, q[0] * s]),
        0.008 * s,
        0.002 * s,
      );
      bl.rotateZ(PI / 2);
      bl.rotateY(PI / 2);
      R.add("hand" + S, P.xf(bl, 0, -0.03 * s, -0.01 * s), blade);
    }
    // ---- legs: thighs angled, shins with a raised hock + long foot (reads digitigrade) ----
    for (const S of ["L", "R"]) {
      R.add(
        "thigh" + S,
        P.xf(P.sphere(0.055 * s, 0.055 * s, 0.055 * s, 10, 8), 0, 0, 0),
        frame,
      );
      seg(
        R,
        "thigh" + S,
        [0, -b.thigh, -0.02 * s],
        0.065 * s,
        0.045 * s,
        shell,
        { bulge: 0.012 * s },
      );
      R.add(
        "shin" + S,
        P.xf(P.sphere(0.045 * s, 0.045 * s, 0.045 * s, 10, 7), 0, 0, 0),
        accent,
      );
      seg(
        R,
        "shin" + S,
        [0, -b.shin * 0.62, 0.1 * s],
        0.04 * s,
        0.035 * s,
        frame,
      ); // shank back to the hock
      R.add(
        "shin" + S,
        P.xf(
          P.sphere(0.035 * s, 0.035 * s, 0.035 * s, 8, 6),
          0,
          -b.shin * 0.62,
          0.1 * s,
        ),
        accent,
      ); // hock joint
      R.add(
        "shin" + S,
        P.sweep(
          [
            [0, -b.shin * 0.62, 0.1 * s],
            [0, -b.shin * 0.85, 0.05 * s],
            [0, -b.shin - 0.01 * s, -0.01 * s],
          ],
          0.026 * s,
          { seg: 6, rs: 6 },
        ),
        frame,
      ); // metatarsal
      R.add(
        "shin" + S,
        P.xf(
          P.cyl(0.008 * s, 0.008 * s, b.shin * 0.55, 6),
          0,
          -b.shin * 0.33,
          0.1 * s,
          -0.3,
          0,
          0,
        ),
        chrome,
      );
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.08 * s, b.ankle + 0.015 * s, 0.17 * s, 0.015 * s),
          0,
          -b.ankle / 2 + 0.008 * s,
          -0.06 * s,
        ),
        shell,
      );
      for (const sx of [-1, 1])
        R.add(
          "foot" + S,
          P.sweep(
            [
              [sx * 0.025 * s, -b.ankle + 0.02 * s, -0.12 * s],
              [sx * 0.03 * s, -b.ankle + 0.01 * s, -0.17 * s],
              [sx * 0.03 * s, -b.ankle - 0.002 * s, -0.2 * s],
            ],
            (t) => (0.012 - t * 0.008) * s,
            { seg: 5, rs: 4 },
          ),
          chrome,
        ); // toe talons
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.04 * s, 0.04 * s, 0.06 * s, 0.01 * s),
          0,
          -b.ankle + 0.03 * s,
          0.05 * s,
        ),
        frame,
      ); // heel spur
    }
    R.socket("muzzle", "chest", 0.17 * s, b.shY + 0.1 * s, -0.24 * s);
    R.socket("eyes", "head", 0, 0.05 * hs, -0.15 * hs);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      gore: "oil",
      bodyThick: 0.14 * s,
      dirt: [0.1, 0.35],
      cut: {
        head: "head",
        leftArm: "forearmL",
        rightArm: "forearmR",
        leftLeg: "shinL",
        rightLeg: "shinR",
      },
    });
    return tpl;
  }
