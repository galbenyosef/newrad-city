// play-inline-466 05 — add
// Lines 675-1211 of readable/play-inline-466.pretty.js (statement-aligned).
  function buildValet(opts, seed) {
    const mil = opts.variant === "m" || opts.variant === "military";
    const rng = L.rng(seed);
    const s = opts.scale || 1;
    const wr = (mil ? 0.17 : 0.15) * s; // wheel radius (= hover height of the axle)
    const R = new L.Rig("hover");
    R.bone("body", null, 0, wr, 0, "torso");
    R.bone("wheel", "body", 0, 0, 0, "leftLeg");
    R.bone("stalk1", "body", 0, 1.24 * s, 0, "head");
    const armY = 0.98 * s;
    for (const [i, sg, part] of [
      [1, 1, "rightArm"],
      [2, -1, "leftArm"],
    ]) {
      R.bone("arm" + i, "body", sg * 0.16 * s, armY, -0.01 * s, part);
      R.bone("fore" + i, "arm" + i, sg * 0.01 * s, -0.27 * s, 0, part);
    }
    R.bone("pinch", "fore1", 0, -0.25 * s, 0, "rightArm");
    const enamel = mil ? 0x4c5434 : rng.pick([0xd8cfb4, 0xa9c6b2, 0xb6c2cc]);
    const shell = mil
      ? paint(enamel, { rough: 0.6 })
      : metal(enamel, { rough: 0.3, metal: 0.25, paint: rustPaint });
    const accent = mil
      ? paint(0x2c3024)
      : metal(0x7a2a22, { rough: 0.35, metal: 0.4 });
    const chrome = metal(PAL.chrome, { rough: 0.22, metal: 0.9 });
    const dark = metal(0x262624, { rough: 0.6 });
    // ---- wheel: tyre, rim, hub, spokes (all on the spinning bone) ----
    const tyre = P.torus(wr - 0.03 * s, 0.032 * s * (mil ? 1.3 : 1), 8, 24);
    tyre.rotateY(PI / 2);
    R.add("wheel", tyre, rubber);
    if (mil)
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * PI * 2;
        R.add(
          "wheel",
          P.xf(
            P.box(0.07 * s, 0.014 * s, 0.03 * s, 0.004 * s),
            0,
            Math.cos(a) * (wr - 0.002 * s),
            Math.sin(a) * (wr - 0.002 * s),
            a,
            0,
            0,
          ),
          rubber,
        );
      }
    R.add(
      "wheel",
      P.xf(
        P.cyl(wr - 0.055 * s, wr - 0.055 * s, 0.05 * s, 20, true),
        0,
        0,
        0,
        0,
        0,
        PI / 2,
      ),
      chrome,
    );
    R.add(
      "wheel",
      P.xf(P.cyl(0.04 * s, 0.04 * s, 0.09 * s, 12), 0, 0, 0, 0, 0, PI / 2),
      dark,
    );
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2;
      R.add(
        "wheel",
        P.xf(
          P.box(0.012 * s, wr - 0.07 * s, 0.018 * s, 0.004 * s),
          0,
          Math.cos(a) * (wr - 0.035 * s) * 0.5,
          Math.sin(a) * (wr - 0.035 * s) * 0.5,
          a,
          0,
          0,
        ),
        chrome,
      );
    }
    // ---- fork + gyro housing (mudguard bell over the wheel) ----
    for (const sg of [-1, 1])
      R.add(
        "body",
        P.xf(
          P.box(0.02 * s, 0.24 * s, 0.05 * s, 0.008 * s),
          sg * 0.07 * s,
          0.1 * s,
          0,
        ),
        dark,
      );
    const bell = P.lathe(
      [
        [0.001, 0.36],
        [0.1, 0.35],
        [0.15, 0.3],
        [0.17, 0.22],
        [0.165, 0.2],
        [0.13, 0.2],
        [0.001, 0.2],
      ].map((q) => [q[0] * s, q[1] * s]),
      18,
    );
    R.add("body", P.xf(bell, 0, 0.0, 0), shell);
    R.add(
      "body",
      P.xf(P.torus(0.168 * s, 0.01 * s, 5, 22), 0, 0.21 * s, 0, PI / 2, 0, 0),
      chrome,
    );
    // ---- column: slim tapered stem with chrome bands and a serving tray ----
    R.add(
      "body",
      P.xf(P.cyl(0.055 * s, 0.075 * s, 0.5 * s, 14), 0, 0.6 * s, 0),
      mil ? dark : shell,
    );
    for (let i = 0; i < 3; i++)
      R.add(
        "body",
        P.xf(
          P.torus(0.065 * s - i * 0.004 * s, 0.008 * s, 5, 16),
          0,
          (0.42 + i * 0.13) * s,
          0,
          PI / 2,
          0,
          0,
        ),
        chrome,
      );
    if (!mil) {
      R.add(
        "body",
        P.xf(P.cyl(0.17 * s, 0.17 * s, 0.012 * s, 22), 0, 0.66 * s, -0.08 * s),
        chrome,
      ); // tray
      R.add(
        "body",
        P.xf(
          P.torus(0.17 * s, 0.008 * s, 4, 22),
          0,
          0.672 * s,
          -0.08 * s,
          PI / 2,
          0,
          0,
        ),
        chrome,
      ); // tray lip
      R.add(
        "body",
        P.xf(
          P.box(0.03 * s, 0.1 * s, 0.1 * s, 0.01 * s),
          0,
          0.62 * s,
          -0.04 * s,
        ),
        dark,
      ); // bracket
    }
    // ---- chest unit: rounded cabinet with shoulder pivots, grille, plate ----
    const ch = P.box(0.3 * s, 0.26 * s, 0.2 * s, 0.06 * s, 3);
    P.deform(ch, (v) => {
      if (v.y < 0) {
        v.x *= 1 + (v.y / s) * 0.9;
      }
    });
    R.add("body", P.xf(ch, 0, 0.97 * s, 0), shell);
    R.add(
      "body",
      P.xf(
        P.box(0.18 * s, 0.07 * s, 0.01 * s, 0.004 * s),
        0,
        1.0 * s,
        -0.102 * s,
      ),
      { color: 0xffffff, region: "grille", rough: 0.6, metal: 0.4 },
    );
    R.decal(
      "body",
      "maker",
      0.16 * s,
      0.04 * s,
      0,
      0.92 * s,
      -0.104 * s,
      0,
      0,
      0,
    );
    if (mil) {
      // armour: chest plate, shoulder pads, hazard stripe, battery box on the back
      R.add(
        "body",
        P.xf(
          P.box(0.33 * s, 0.18 * s, 0.05 * s, 0.015 * s),
          0,
          0.99 * s,
          -0.1 * s,
          -0.08,
          0,
          0,
        ),
        shell,
      );
      R.decal(
        "body",
        "hazard",
        0.24 * s,
        0.035 * s,
        0,
        0.92 * s,
        -0.127 * s,
        -0.08,
        0,
        0,
      );
      R.decal(
        "body",
        "continuity",
        0.07 * s,
        0.07 * s,
        0.1 * s,
        1.03 * s,
        -0.128 * s,
        -0.08,
        0,
        0,
      );
      R.add(
        "body",
        P.xf(
          P.box(0.2 * s, 0.22 * s, 0.1 * s, 0.02 * s),
          0,
          0.92 * s,
          0.13 * s,
        ),
        dark,
      );
      R.add(
        "body",
        P.xf(
          P.cyl(0.02 * s, 0.02 * s, 0.03 * s, 8),
          0.05 * s,
          0.96 * s,
          0.185 * s,
          PI / 2,
          0,
          0,
        ),
        light(0xff6a20, 1.4),
      );
    } else {
      R.add(
        "body",
        P.xf(
          P.box(0.06 * s, 0.03 * s, 0.012 * s, 0.006 * s),
          0,
          1.075 * s,
          -0.104 * s,
        ),
        accent,
      ); // bow-tie plate
    }
    for (const sg of [-1, 1])
      R.add(
        "body",
        P.xf(
          P.sphere(0.05 * s, 0.05 * s, 0.05 * s, 10, 8),
          sg * 0.16 * s,
          armY,
          -0.01 * s,
        ),
        mil ? shell : chrome,
      );
    R.add(
      "body",
      P.xf(P.cyl(0.035 * s, 0.045 * s, 0.1 * s, 12), 0, 1.15 * s, 0),
      dark,
    ); // neck column
    // ---- head (stalk1) ----
    if (mil) {
      // squat sensor turret: armoured drum, wide lens slit, side radar stub
      R.add(
        "stalk1",
        P.xf(P.cyl(0.11 * s, 0.12 * s, 0.11 * s, 16), 0, 0.04 * s, 0),
        shell,
      );
      R.add(
        "stalk1",
        P.xf(P.cyl(0.12 * s, 0.12 * s, 0.02 * s, 16), 0, 0.1 * s, 0),
        dark,
      );
      R.add(
        "stalk1",
        P.xf(
          P.box(0.14 * s, 0.035 * s, 0.03 * s, 0.008 * s),
          0,
          0.045 * s,
          -0.11 * s,
        ),
        dark,
      );
      R.add(
        "stalk1",
        P.xf(
          P.box(0.12 * s, 0.014 * s, 0.01 * s, 0.004 * s),
          0,
          0.045 * s,
          -0.126 * s,
        ),
        light(0xff5020, 2.6),
      );
      R.add(
        "stalk1",
        P.xf(
          P.box(0.03 * s, 0.07 * s, 0.05 * s, 0.01 * s),
          0.12 * s,
          0.07 * s,
          0.02 * s,
        ),
        dark,
      );
      R.add(
        "stalk1",
        P.xf(
          P.cyl(0.035 * s, 0.035 * s, 0.008 * s, 12),
          0.14 * s,
          0.11 * s,
          0.02 * s,
          0,
          0,
          PI / 2,
        ),
        metal(0x6a6a62),
      );
    } else {
      // capsule head with ONE big camera lens in a chrome bezel, two ear discs
      const hd = P.box(0.21 * s, 0.13 * s, 0.16 * s, 0.055 * s, 3);
      R.add("stalk1", P.xf(hd, 0, 0.05 * s, 0), shell);
      R.add(
        "stalk1",
        P.xf(
          P.cyl(0.05 * s, 0.055 * s, 0.05 * s, 18),
          0,
          0.05 * s,
          -0.08 * s,
          PI / 2,
          0,
          0,
        ),
        chrome,
      );
      R.add(
        "stalk1",
        P.xf(
          P.cyl(0.04 * s, 0.04 * s, 0.01 * s, 18),
          0,
          0.05 * s,
          -0.106 * s,
          PI / 2,
          0,
          0,
        ),
        glass(0x1a2228, 0.05),
      );
      R.add(
        "stalk1",
        P.xf(
          P.cyl(0.016 * s, 0.016 * s, 0.006 * s, 12),
          0,
          0.05 * s,
          -0.112 * s,
          PI / 2,
          0,
          0,
        ),
        light(0xffb050, 2.4),
      );
      for (const sg of [-1, 1])
        R.add(
          "stalk1",
          P.xf(
            P.cyl(0.035 * s, 0.035 * s, 0.02 * s, 14),
            sg * 0.11 * s,
            0.05 * s,
            0,
            0,
            0,
            PI / 2,
          ),
          accent,
        );
    }
    // ---- arms: chrome upper tubes, elbow balls, enamel forearms, two-finger grippers ----
    for (const [i, sg] of [
      [1, 1],
      [2, -1],
    ]) {
      seg(
        R,
        "arm" + i,
        [sg * 0.01 * s, -0.27 * s, 0],
        0.028 * s,
        0.024 * s,
        chrome,
      );
      R.add(
        "fore" + i,
        P.xf(P.sphere(0.035 * s, 0.035 * s, 0.035 * s, 10, 8), 0, 0, 0),
        dark,
      );
      seg(R, "fore" + i, [0, -0.22 * s, 0], 0.034 * s, 0.028 * s, shell);
    }
    // right: gripper (fixed finger on the forearm + moving finger on 'pinch')
    R.add(
      "fore1",
      P.xf(P.cyl(0.03 * s, 0.025 * s, 0.04 * s, 10), 0, -0.24 * s, 0),
      dark,
    );
    R.add(
      "fore1",
      P.sweep(
        [
          [0, -0.25 * s, -0.012 * s],
          [0, -0.3 * s, -0.03 * s],
          [0, -0.34 * s, -0.01 * s],
        ],
        (t) => (0.012 - t * 0.006) * s,
        { seg: 5, rs: 5 },
      ),
      chrome,
    );
    R.add(
      "pinch",
      P.sweep(
        [
          [0, 0, 0.012 * s],
          [0, -0.05 * s, 0.03 * s],
          [0, -0.09 * s, 0.008 * s],
        ],
        (t) => (0.012 - t * 0.006) * s,
        { seg: 5, rs: 5 },
      ),
      chrome,
    );
    // left: valet = gripper + lighter wand; Valet-M = twin-barrel arc gun
    if (mil) {
      R.add(
        "fore2",
        P.xf(P.box(0.08 * s, 0.12 * s, 0.09 * s, 0.015 * s), 0, -0.26 * s, 0),
        shell,
      );
      for (const sx of [-1, 1])
        R.add(
          "fore2",
          P.xf(
            P.cyl(0.016 * s, 0.018 * s, 0.22 * s, 10),
            sx * 0.022 * s,
            -0.4 * s,
            0,
          ),
          dark,
        );
      for (let k = 0; k < 3; k++)
        R.add(
          "fore2",
          P.xf(
            P.torus(0.045 * s, 0.007 * s, 5, 12),
            0,
            -0.33 * s - k * 0.04 * s,
            0,
            PI / 2,
            0,
            0,
          ),
          light(0xff7a30, 1.2),
        );
    } else {
      R.add(
        "fore2",
        P.xf(P.cyl(0.026 * s, 0.022 * s, 0.05 * s, 10), 0, -0.245 * s, 0),
        dark,
      );
      R.add(
        "fore2",
        P.xf(P.cyl(0.01 * s, 0.014 * s, 0.09 * s, 8), 0, -0.31 * s, 0),
        metal(0x8a7a50),
      );
      R.add(
        "fore2",
        P.xf(P.cyl(0.008 * s, 0.008 * s, 0.012 * s, 8), 0, -0.36 * s, 0),
        light(0xffa040, 1.6),
      );
    }
    // hit volumes / markers / sockets
    R.hitVol("torso", "body", [0, 0.25 * s, 0], [0, 1.08 * s, 0], 0.16 * s);
    R.hitVol("head", "stalk1", [0, 0.0, 0], [0, 0.1 * s, 0], 0.11 * s);
    R.hitVol("leftLeg", "wheel", [-0.04 * s, 0, 0], [0.04 * s, 0, 0], wr);
    R.hitVol("rightArm", "fore1", [0, 0, 0], [0, -0.3 * s, 0], 0.05 * s);
    R.hitVol("leftArm", "fore2", [0, 0, 0], [0, -0.3 * s, 0], 0.05 * s);
    R.marker("head", "stalk1", 0, 0.05 * s, 0, 0.11 * s);
    R.marker("torso", "body", 0, 0.9 * s, 0, 0.16 * s);
    R.marker("rightArm", "fore1", 0, -0.15 * s, 0, 0.06 * s);
    R.marker("leftArm", "fore2", 0, -0.15 * s, 0, 0.06 * s);
    R.marker("leftLeg", "wheel", 0, 0, 0, wr);
    R.socket(
      "muzzle",
      "fore2",
      0,
      mil ? -0.52 * s : -0.37 * s,
      0,
      PI / 2 + 0.3,
      0,
      0,
    );
    R.socket("eyes", "stalk1", 0, 0.05 * s, -0.11 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      hover: wr,
      bodyThick: 0.16 * s,
      height: wr + 1.4 * s,
      hipH: wr,
      gore: "oil",
      cut: {
        head: "stalk1",
        leftArm: "fore2",
        rightArm: "fore1",
        leftLeg: null,
        rightLeg: null,
      },
    });
    return tpl;
  }
