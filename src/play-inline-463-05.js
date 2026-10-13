// play-inline-463 05 — out
// Lines 729-1030 of readable/play-inline-463.pretty.js (statement-aligned).
  L.infos.burrow_rat = {
    kind: "quad",
    height: 0.42,
    radius: 0.35,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Foreleg",
      rightArm: "Right Foreleg",
      leftLeg: "Left Hind Leg",
      rightLeg: "Right Hind Leg",
    },
    gait: { walkStep: 0.22, runStep: 0.5, walkSpeed: 1.2, runSpeed: 5.2 },
    style: { stride: 1.2, wag: false, pant: false, tailUp: -0.05 },
    variants: 4,
    build: buildBurrowRat,
  };

  // ==================================================================
  // ROACH (six-legged)
  // ==================================================================
  function buildRoach(opts, seed) {
    // Giant roach: a flat, glossy, knee-high cockroach ~0.5 m long — mahogany wing
    // covers, a pale ridged head shield marked with two dark blotches, pale belly,
    // spiny legs, long antennae & cerci. Kept light (~1.6k tris): they come in swarms.
    const rng = L.rng(seed);
    const s = (opts.scale || 1) * rng.range(1.35, 1.55);
    const R = new L.Rig("insect");
    const bh = 0.1 * s;
    sixLegRig(
      R,
      s,
      bh,
      [0.1, 0.05, 0.03],
      { headZ: 0.14, abdZ: 0.07, hipX: 0.05, z1: 0.07, z3: 0.07 },
      { L1: "leftArm", R1: "rightArm", L3: "leftLeg", R3: "rightLeg" },
    );
    const brown = rng.pick([0x5a2416, 0x4a1e12, 0x63301a, 0x3e1a10]);
    const shellP = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (ny < -0.3) {
        out[0] *= 1.35;
        out[1] *= 1.3;
        out[2] *= 1.2;
      }
    }; // paler underside
    const shell = {
      color: brown,
      color2: L.shade(brown, 1.35),
      region: "shell",
      rough: 0.18,
      noise: 0.12,
      grad: [0.6, 1.25],
      metal: 0.08,
      paint: shellP,
    };
    const dark = {
      color: L.shade(brown, 0.55),
      region: "shell",
      rough: 0.3,
      noise: 0.1,
    };
    const leg = {
      color: L.shade(brown, 0.7),
      rough: 0.35,
      noise: 0.08,
      grad: [0.7, 1.1],
    };
    // thorax + broad glossy pronotum shield with a pale rim
    R.add(
      "body",
      P.xf(P.sphere(0.07 * s, 0.045 * s, 0.085 * s, 9, 6), 0, 0, -0.02 * s),
      dark,
    );
    const pro = P.sphere(
      0.088 * s,
      0.04 * s,
      0.075 * s,
      10,
      5,
      0,
      PI * 2,
      0,
      PI * 0.55,
    );
    P.deform(pro, (v) => {
      if (v.z < 0) v.y -= -v.z * 0.3 * 0.04 * s;
    });
    R.add(
      "body",
      P.xf(pro, 0, 0.012 * s, -0.075 * s),
      Object.assign({}, shell, {
        color: 0xc8b48a,
        paint: (x, y, z, nx, ny, nz, out) => {
          const bx = Math.abs(x) - 0.03 * s,
            bz = z + 0.01 * s;
          if (bx * bx + bz * bz < 0.00055 * s * s) {
            out[0] *= 0.25;
            out[1] *= 0.22;
            out[2] *= 0.2;
          }
          if (Math.abs(x) < 0.004 * s) {
            out[0] *= 0.7;
            out[1] *= 0.66;
            out[2] *= 0.62;
          }
        },
      }),
    ); // pale shield, two dark blotches, centre ridge
    // segmented abdomen (overlapping plates) + glossy wing covers
    for (let i = 0; i < 4; i++)
      R.add(
        "abdomen",
        P.xf(
          P.sphere(lerp(0.078, 0.04, i / 3) * s, 0.034 * s, 0.04 * s, 9, 5),
          0,
          -0.004 * s,
          (i * 0.05 - 0.02) * s,
        ),
        dark,
      );
    for (const sg of [-1, 1]) {
      const w = P.sphere(
        0.05 * s,
        0.02 * s,
        0.155 * s,
        9,
        5,
        0,
        PI * 2,
        0,
        PI * 0.6,
      );
      P.xf(w, sg * 0.034 * s, 0.02 * s, 0.06 * s, 0.05, sg * -0.07, sg * 0.14);
      R.add(
        "abdomen",
        w,
        Object.assign({}, shell, { rough: 0.14, grad: [0.75, 1.3] }),
      );
    }
    // cerci at the tail
    for (const sg of [-1, 1])
      claw(
        R,
        "abdomen",
        [
          [sg * 0.015 * s, 0, 0.17 * s],
          [sg * 0.03 * s, 0.01 * s, 0.22 * s],
        ],
        0.005 * s,
        leg,
        3,
      );
    // head, big eyes, mandibles, long antennae
    R.add(
      "head",
      P.xf(P.sphere(0.036 * s, 0.03 * s, 0.035 * s, 8, 6), 0, 0, -0.01 * s),
      dark,
    );
    for (const sg of [-1, 1]) {
      R.add(
        "head",
        P.xf(
          P.sphere(0.014 * s, 0.016 * s, 0.012 * s, 6, 5),
          sg * 0.028 * s,
          0.008 * s,
          -0.022 * s,
        ),
        { color: 0x0a0806, rough: 0.1 },
      );
      claw(
        R,
        sg < 0 ? "mandL" : "mandR",
        [
          [0, 0, 0],
          [sg * 0.01 * s, -0.005 * s, -0.02 * s],
          [-sg * 0.006 * s, -0.008 * s, -0.035 * s],
        ],
        0.008 * s,
        leg,
        4,
      );
      R.add(
        sg < 0 ? "antL" : "antR",
        P.sweep(
          [
            [0, 0, 0],
            [sg * 0.05 * s, 0.05 * s, -0.12 * s],
            [sg * 0.12 * s, 0.06 * s, -0.25 * s],
            [sg * 0.2 * s, 0.02 * s, -0.35 * s],
          ],
          0.0028 * s + 0.001,
          { seg: 8, rs: 3 },
        ),
        leg,
      );
    }
    // legs: thick spiny femur + tibia down to the ground
    for (const n of ["1", "2", "3"])
      for (const [side, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        const S = side + n;
        const fp = R.bones[R.map["foot" + S]].pos;
        seg(R, "leg" + S, fp, 0.016 * s, 0.011 * s, leg, { seg: 5 });
        const tib = [sg * 0.05 * s, -bh - fp[1] + 0.005 * s, fp[2] * 0.6];
        seg(R, "foot" + S, tib, 0.01 * s, 0.005 * s, leg, { seg: 5 });
        claw(
          R,
          "foot" + S,
          [
            [tib[0] * 0.45, tib[1] * 0.45, tib[2] * 0.45],
            [
              tib[0] * 0.45 + sg * 0.018 * s,
              tib[1] * 0.45 + 0.012 * s,
              tib[2] * 0.45,
            ],
          ],
          0.0035 * s,
          leg,
          3,
        );
      }
    R.hitVol("head", "head", [0, 0, 0], [0, 0, -0.03 * s], 0.045 * s);
    R.hitVol("torso", "body", [0, 0, 0.02 * s], [0, 0, -0.1 * s], 0.08 * s);
    R.hitVol(
      "torso",
      "abdomen",
      [0, 0, -0.02 * s],
      [0, 0, 0.17 * s],
      0.075 * s,
    );
    for (const [S, part] of [
      ["L1", "leftArm"],
      ["R1", "rightArm"],
      ["L3", "leftLeg"],
      ["R3", "rightLeg"],
      ["L2", "torso"],
      ["R2", "torso"],
    ])
      R.hitVol(
        part,
        "leg" + S,
        [0, 0, 0],
        R.bones[R.map["foot" + S]].pos,
        0.03 * s,
      );
    R.marker("head", "head", 0, 0.005 * s, -0.01 * s, 0.05 * s);
    R.marker("torso", "body", 0, 0.01 * s, 0.02 * s, 0.1 * s);
    R.marker("leftArm", "legL1", -0.05 * s, 0.02 * s, 0, 0.04 * s);
    R.marker("rightArm", "legR1", 0.05 * s, 0.02 * s, 0, 0.04 * s);
    R.marker("leftLeg", "legL3", -0.05 * s, 0.02 * s, 0, 0.04 * s);
    R.marker("rightLeg", "legR3", 0.05 * s, 0.02 * s, 0, 0.04 * s);
    R.socket("eyes", "head", 0, 0.01 * s, -0.04 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.05 * s,
      height: 0.2 * s,
      hipH: bh,
      dirt: [0.05, 0.25],
      cut: {
        head: "head",
        leftArm: "legL1",
        rightArm: "legR1",
        leftLeg: "legL3",
        rightLeg: "legR3",
      },
    });
    return tpl;
  }
  L.infos.giant_roach = {
    kind: "insect",
    height: 0.3,
    radius: 0.32,
    gore: "green",
    isCreature: true,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"],
    labels: {
      head: "Head",
      torso: "Body",
      leftArm: "Front Left Leg",
      rightArm: "Front Right Leg",
      leftLeg: "Rear Left Leg",
      rightLeg: "Rear Right Leg",
    },
    gait: { walkStep: 0.14, runStep: 0.28, walkSpeed: 1.2, runSpeed: 4.5 },
    style: {},
    variants: 4,
    build: buildRoach,
  };

  // ==================================================================
  // GASFLY — a long-legged, mosquito-thin flier: dark segmented body, two
  // pairs of narrow dragonfly wings, a long needle proboscis and, slung
  // under the abdomen, a swollen translucent GAS SAC glowing a sickly amber
  // (it vents the gas as its ranged attack). Six long legs dangle below.
  // ==================================================================
