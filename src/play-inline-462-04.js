// play-inline-462 04 — add
// Lines 480-828 of readable/play-inline-462.pretty.js (statement-aligned).
  const SCORP_INFO = {
    kind: "insect",
    height: 0.65,
    radius: 0.7,
    gore: "green",
    isCreature: true,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"],
    labels: {
      head: "Head",
      torso: "Body",
      leftArm: "Left Scythe",
      rightArm: "Right Scythe",
      leftLeg: "Tail",
      rightLeg: "Legs",
    },
    gait: { walkStep: 0.32, runStep: 0.62, walkSpeed: 1.5, runSpeed: 5.2 },
    style: { big: true, scorpion: true },
    variants: 3,
  };
  L.infos.stinger = Object.assign({}, SCORP_INFO, { build: buildStinger });
  L.infos.giant_stinger = Object.assign({}, SCORP_INFO, {
    height: 1.2,
    radius: 1.15,
    gait: { walkStep: 0.52, runStep: 1.0, walkSpeed: 1.8, runSpeed: 6.0 },
    build: (o, sd) =>
      buildStinger(Object.assign({}, o, { variant: "giant" }), sd),
  });
  L.infos.small_stinger = Object.assign({}, SCORP_INFO, {
    height: 0.42,
    radius: 0.4,
    gait: { walkStep: 0.18, runStep: 0.36, walkSpeed: 1.2, runSpeed: 4.8 },
    build: (o, sd) =>
      buildStinger(Object.assign({}, o, { variant: "bark" }), sd),
  });

  // ==================================================================
  // GIANT ANT / FIRE ANT
  // ==================================================================
  function buildAnt(opts, seed) {
    const rng = L.rng(seed);
    const fire = opts.variant === "fire" || opts.fire;
    const s = (opts.scale || 1) * rng.range(0.92, 1.08) * (fire ? 1.05 : 1);
    const R = new L.Rig("insect");
    const bh = 0.34 * s;
    R.bone("body", null, 0, bh, 0, "torso");
    R.bone("head", "body", 0, 0.05 * s, -0.2 * s, "head");
    R.bone("mandL", "head", -0.045 * s, -0.035 * s, -0.09 * s, "head");
    R.bone("mandR", "head", 0.045 * s, -0.035 * s, -0.09 * s, "head");
    R.bone("antL", "head", -0.04 * s, 0.05 * s, -0.07 * s, "leftArm");
    R.bone("antL2", "antL", -0.05 * s, 0.13 * s, -0.02 * s, "leftArm");
    R.bone("antR", "head", 0.04 * s, 0.05 * s, -0.07 * s, "rightArm");
    R.bone("antR2", "antR", 0.05 * s, 0.13 * s, -0.02 * s, "rightArm");
    R.bone("abdomen", "body", 0, 0.0, 0.13 * s, "torso");
    const LZ = [-0.07, 0.0, 0.07];
    LZ.forEach((z, i) => {
      for (const [side, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        const S = side + (i + 1);
        R.bone("leg" + S, "body", sg * 0.045 * s, -0.04 * s, z * s, "leftLeg");
        R.bone(
          "foot" + S,
          "leg" + S,
          sg * 0.2 * s,
          0.13 * s,
          (i - 1) * 0.12 * s,
          "leftLeg",
        );
      }
    });
    const col = fire
      ? rng.pick([0x9a2412, 0xa8301a])
      : rng.pick([0x7a4a22, 0x8a5428, 0x6a3e1c]);
    const dark = L.shade(col, 0.55);
    const shell = {
      color: col,
      color2: L.shade(col, 1.3),
      region: "shell",
      rough: 0.2,
      noise: 0.12,
      grad: [0.7, 1.25],
      metal: 0.05,
    };
    const darkM = { color: dark, region: "shell", rough: 0.25, noise: 0.1 };
    const black = { color: 0x0a0806, rough: 0.06, noise: 0.02 };
    const glow = (e) => ({
      color: 0xff7a1a,
      emis: e,
      rough: 0.3,
      noise: 0.08,
      keepLod: true,
    });
    // head: big, heart-shaped, with glossy compound eyes
    const hd = P.sphere(0.085 * s, 0.075 * s, 0.09 * s, 12, 9);
    P.deform(hd, (v) => {
      if (v.y > 0 && v.z > 0) v.y *= 0.85;
      if (v.z < 0) v.x *= 1 - 0.2 * (-v.z / (0.09 * s));
    });
    R.add("head", P.xf(hd, 0, 0, -0.04 * s), shell);
    for (const sg of [-1, 1]) {
      R.add(
        "head",
        P.xf(
          P.sphere(0.03 * s, 0.035 * s, 0.03 * s, 9, 7),
          sg * 0.07 * s,
          0.018 * s,
          -0.05 * s,
        ),
        black,
      );
      // mandibles: curved toothed blades
      claw(
        R,
        sg < 0 ? "mandL" : "mandR",
        [
          [0, 0, 0.02 * s],
          [sg * 0.03 * s, -0.005 * s, -0.04 * s],
          [-sg * 0.01 * s, -0.01 * s, -0.09 * s],
          [-sg * 0.05 * s, -0.01 * s, -0.1 * s],
        ],
        0.022 * s,
        darkM,
        6,
      );
      for (let k = 0; k < 3; k++)
        claw(
          R,
          sg < 0 ? "mandL" : "mandR",
          [
            [
              -sg * (0.002 + k * 0.012) * s,
              -0.008 * s,
              -(0.05 + k * 0.014) * s,
            ],
            [
              -sg * (0.018 + k * 0.012) * s,
              -0.008 * s,
              -(0.05 + k * 0.014) * s,
            ],
          ],
          0.006 * s,
          darkM,
          4,
        );
      // elbowed antennae
      const A1 = sg < 0 ? "antL" : "antR",
        A2 = A1 + "2";
      seg(R, A1, R.bones[R.map[A2]].pos, 0.011 * s, 0.009 * s, darkM, {
        seg: 5,
      });
      R.add(
        A2,
        P.sweep(
          [
            [0, 0, 0],
            [sg * 0.03 * s, 0.03 * s, -0.08 * s],
            [sg * 0.05 * s, 0.0, -0.17 * s],
            [sg * 0.06 * s, -0.04 * s, -0.22 * s],
          ],
          (t) => (0.009 + t * 0.004) * s,
          { seg: 10, rs: 5 },
        ),
        darkM,
      );
    }
    // thorax (mesosoma) with a raised pronotum, then petiole node & big gaster
    R.add(
      "body",
      P.xf(P.sphere(0.065 * s, 0.06 * s, 0.13 * s, 12, 8), 0, 0.0, -0.01 * s),
      shell,
    );
    R.add(
      "body",
      P.xf(
        P.sphere(0.07 * s, 0.05 * s, 0.06 * s, 12, 6),
        0,
        0.03 * s,
        -0.08 * s,
      ),
      shell,
    );
    R.add(
      "abdomen",
      P.xf(
        P.sphere(0.035 * s, 0.045 * s, 0.035 * s, 8, 6),
        0,
        0.03 * s,
        0.03 * s,
      ),
      darkM,
    );
    const gas = P.sphere(0.13 * s, 0.11 * s, 0.17 * s, 14, 10);
    const bandsP = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const b = Math.sin((wz / s) * 42);
      if (b > 0.75) {
        out[0] *= 0.55;
        out[1] *= 0.5;
        out[2] *= 0.5;
      }
    };
    R.add(
      "abdomen",
      P.xf(gas, 0, 0.05 * s, 0.22 * s, -0.25, 0, 0),
      Object.assign({}, shell, { paint: bandsP, rough: 0.15 }),
    );
    if (fire) {
      // molten fire glands: glowing seams on the gaster and vents on the thorax
      for (let k = 0; k < 4; k++)
        R.add(
          "abdomen",
          P.xf(
            P.torus(
              0.118 * s * (1 - Math.abs(k - 1.5) * 0.12),
              0.008 * s,
              4,
              18,
            ),
            0,
            0.05 * s + (k - 1.5) * 0.012 * s,
            0.14 * s + k * 0.055 * s,
            PI / 2 - 0.25,
            0,
            0,
          ),
          glow(2.2),
        );
      R.add(
        "abdomen",
        P.xf(
          P.sphere(0.03 * s, 0.03 * s, 0.03 * s, 8, 6),
          0,
          0.02 * s,
          0.39 * s,
        ),
        glow(2.6),
      );
      for (const sg of [-1, 1])
        R.add(
          "body",
          P.xf(
            P.sphere(0.018 * s, 0.012 * s, 0.03 * s, 7, 5),
            sg * 0.05 * s,
            0.03 * s,
            0.02 * s,
          ),
          glow(1.8),
        );
    }
    // legs: long, high-kneed
    for (let i = 0; i < 3; i++)
      for (const [side, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        const S = side + (i + 1),
          fp = R.bones[R.map["foot" + S]].pos;
        seg(R, "leg" + S, fp, 0.017 * s, 0.013 * s, darkM, { seg: 6 });
        R.add(
          "foot" + S,
          P.sphere(0.015 * s, 0.015 * s, 0.015 * s, 6, 5),
          darkM,
        );
        const tib = [sg * 0.1 * s, -bh - fp[1] + 0.01 * s, fp[2] * 0.5];
        seg(R, "foot" + S, tib, 0.013 * s, 0.007 * s, darkM, { seg: 6 });
      }
    R.hitVol("head", "head", [0, 0, 0], [0, 0, -0.1 * s], 0.08 * s);
    R.hitVol(
      "torso",
      "body",
      [0, 0, 0.06 * s],
      [0, 0.02 * s, -0.1 * s],
      0.07 * s,
    );
    R.hitVol(
      "torso",
      "abdomen",
      [0, 0.04 * s, 0.1 * s],
      [0, 0.06 * s, 0.35 * s],
      0.12 * s,
    );
    R.hitVol(
      "leftArm",
      "antL",
      [0, 0, 0],
      [-0.1 * s, 0.13 * s, -0.2 * s],
      0.035 * s,
    );
    R.hitVol(
      "rightArm",
      "antR",
      [0, 0, 0],
      [0.1 * s, 0.13 * s, -0.2 * s],
      0.035 * s,
    );
    for (let i = 1; i <= 3; i++)
      for (const side of ["L", "R"])
        R.hitVol(
          "leftLeg",
          "leg" + side + i,
          [0, 0, 0],
          R.bones[R.map["foot" + side + i]].pos,
          0.03 * s,
        );
    R.marker("head", "head", 0, 0.01 * s, -0.05 * s, 0.08 * s);
    R.marker("torso", "body", 0, 0.02 * s, 0.02 * s, 0.12 * s);
    R.marker("leftArm", "antL2", -0.02 * s, 0.02 * s, -0.08 * s, 0.04 * s);
    R.marker("rightArm", "antR2", 0.02 * s, 0.02 * s, -0.08 * s, 0.04 * s);
    R.marker("leftLeg", "legL2", -0.1 * s, 0.06 * s, 0, 0.06 * s);
    R.socket("eyes", "head", 0, 0.02 * s, -0.08 * s);
    R.socket("muzzle", "head", 0, -0.03 * s, -0.14 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.06 * s,
      height: 0.55 * s,
      hipH: bh,
      glowAnt: !!fire,
      dirt: [0.02, 0.2],
      style: fire ? { ranged: true, fireAnt: true } : {},
      cut: {
        head: "head",
        leftArm: "antL",
        rightArm: "antR",
        leftLeg: "footL2",
      },
    });
    return tpl;
  }
  const ANT_INFO = {
    kind: "insect",
    height: 0.55,
    radius: 0.55,
    gore: "green",
    isCreature: true,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg"],
    labels: {
      head: "Head",
      torso: "Thorax",
      leftArm: "Left Antenna",
      rightArm: "Right Antenna",
      leftLeg: "Legs",
    },
    gait: { walkStep: 0.26, runStep: 0.5, walkSpeed: 1.6, runSpeed: 5.8 },
    style: {},
    variants: 4,
  };
  L.infos.giant_ant = Object.assign({}, ANT_INFO, { build: buildAnt });
