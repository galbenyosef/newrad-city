// play-inline-466 06 — add
// Lines 1212-1500 of readable/play-inline-466.pretty.js (statement-aligned).
  L.infos.valet = {
    kind: "hover",
    height: 1.62,
    radius: 0.36,
    gore: "oil",
    isRobot: true,
    hover: 0.15,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg"],
    labels: {
      head: "Sensor Head",
      torso: "Column",
      leftArm: "Left Arm",
      rightArm: "Right Arm",
      leftLeg: "Gyro Wheel",
      rightLeg: "Gyro Wheel",
    },
    // one stride = half a wheel turn: gait phase (radians) == wheel angle (radians)
    gait: { walkStep: 0.471, runStep: 0.471, walkSpeed: 1.6, runSpeed: 4.0 },
    style: { ranged: true, wheel: true, lookLimit: 2.4 },
    variants: 3,
    build: buildValet,
  };
  L.infos.valet_m = Object.assign({}, L.infos.valet, {
    height: 1.66,
    radius: 0.4,
    hover: 0.17,
    gait: { walkStep: 0.534, runStep: 0.534, walkSpeed: 1.6, runSpeed: 4.4 },
    labels: {
      head: "Sensor Turret",
      torso: "Column",
      leftArm: "Gun Arm",
      rightArm: "Claw Arm",
      leftLeg: "Gyro Wheel",
      rightLeg: "Gyro Wheel",
    },
    variants: 2,
    build: (o, sd) => buildValet(Object.assign({}, o, { variant: "m" }), sd),
  });

  // ==================================================================
  // SKY-EYE DRONE — flat disc, searchlight lamp, rim loudspeaker, lift fan
  // ==================================================================
  function buildSkyEye(opts, seed) {
    const s = opts.scale || 1;
    const hover = 2.1 * s;
    const R = new L.Rig("hover");
    R.bone("body", null, 0, hover, 0, "torso");
    R.bone("lamp", "body", 0, -0.05 * s, -0.24 * s, "head");
    R.bone("fan", "body", 0, -0.07 * s, 0.04 * s, "torso");
    const shell = metal(0x8a8c88, {
      rough: 0.38,
      metal: 0.6,
      paint: rustPaint,
    });
    const band = metal(0x3a3c3a, { rough: 0.45 });
    const dark = metal(0x1e1f1e, { rough: 0.6 });
    // disc: lathe profile (top hub → shoulder → thin rim → shallow belly)
    const prof = [
      [0.001, 0.075],
      [0.11, 0.072],
      [0.14, 0.05],
      [0.3, 0.025],
      [0.38, 0.008],
      [0.385, -0.004],
      [0.36, -0.02],
      [0.2, -0.04],
      [0.09, -0.05],
      [0.001, -0.052],
    ];
    R.add(
      "body",
      P.lathe(
        prof.map((q) => [q[0] * s, q[1] * s]),
        32,
      ),
      shell,
    );
    R.add(
      "body",
      P.xf(P.torus(0.383 * s, 0.009 * s, 5, 40), 0, 0.002 * s, 0, PI / 2, 0, 0),
      band,
    );
    // loudspeaker grille band round the front rim
    const grill = P.loft(
      [
        { y: -0.018 * s, rx: 0.372 * s, rz: 0.372 * s, n: 2 },
        { y: 0.012 * s, rx: 0.386 * s, rz: 0.386 * s, n: 2 },
      ],
      { seg: 20, a0: -1.1, a1: 1.1 },
    );
    R.add("body", grill, {
      color: 0xffffff,
      region: "grille",
      rough: 0.6,
      metal: 0.4,
      noise: 0.05,
      grad: [1, 1],
    });
    // top: raised hub, capitol-dome emblem, two tail fins, running lights
    R.add(
      "body",
      P.xf(P.cyl(0.09 * s, 0.11 * s, 0.03 * s, 20), 0, 0.085 * s, 0),
      band,
    );
    R.decal(
      "body",
      "continuity",
      0.16 * s,
      0.16 * s,
      0,
      0.101 * s,
      0,
      PI / 2,
      PI,
      0,
    );
    for (const sg of [-1, 1])
      R.add(
        "body",
        P.xf(
          P.box(0.01 * s, 0.07 * s, 0.12 * s, 0.004 * s),
          sg * 0.08 * s,
          0.075 * s,
          0.24 * s,
          0.25,
          0,
          sg * 0.35,
        ),
        band,
      );
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) / 8) * PI * 2;
      R.add(
        "body",
        P.xf(
          P.sphere(0.012 * s, 0.008 * s, 0.012 * s, 6, 4),
          Math.sin(a) * 0.37 * s,
          0.012 * s,
          -Math.cos(a) * 0.37 * s,
        ),
        light(i === 3 || i === 4 ? 0xff3a20 : 0xfff0d0, 1.4),
      );
    }
    // ducted lift fan underneath (spins)
    R.add(
      "body",
      P.xf(
        P.cyl(0.15 * s, 0.15 * s, 0.05 * s, 24, true),
        0,
        -0.07 * s,
        0.04 * s,
      ),
      dark,
    );
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * PI * 2;
      R.add(
        "fan",
        P.xf(
          P.box(0.13 * s, 0.006 * s, 0.035 * s, 0.002),
          Math.cos(a) * 0.07 * s,
          0,
          Math.sin(a) * 0.07 * s,
          0.35,
          -a,
          0,
        ),
        metal(0x9a9a92, { rough: 0.3 }),
      );
    }
    R.add("fan", P.xf(P.cyl(0.03 * s, 0.03 * s, 0.03 * s, 10), 0, 0, 0), band);
    // the lamp: yoke + big searchlight drum with a glowing lens (muzzle/eye)
    R.add(
      "body",
      P.xf(
        P.box(0.12 * s, 0.03 * s, 0.05 * s, 0.01 * s),
        0,
        -0.045 * s,
        -0.24 * s,
      ),
      band,
    );
    for (const sg of [-1, 1])
      R.add(
        "lamp",
        P.xf(
          P.box(0.012 * s, 0.07 * s, 0.03 * s, 0.004 * s),
          sg * 0.07 * s,
          -0.035 * s,
          0,
        ),
        band,
      );
    R.add(
      "lamp",
      P.xf(
        P.cyl(0.06 * s, 0.065 * s, 0.11 * s, 18),
        0,
        -0.07 * s,
        -0.01 * s,
        PI / 2 - 0.35,
        0,
        0,
      ),
      dark,
    );
    R.add(
      "lamp",
      P.xf(
        P.torus(0.064 * s, 0.008 * s, 5, 18),
        0,
        -0.088 * s,
        -0.062 * s,
        PI / 2 - 0.35,
        0,
        0,
      ),
      metal(PAL.chrome, { rough: 0.2, metal: 0.9 }),
    );
    R.add(
      "lamp",
      P.xf(
        P.cyl(0.056 * s, 0.056 * s, 0.006 * s, 18),
        0,
        -0.09 * s,
        -0.065 * s,
        PI / 2 - 0.35,
        0,
        0,
      ),
      light(0xfff2c8, 3.2),
    );
    R.hitVol("torso", "body", [-0.2 * s, 0, 0], [0.2 * s, 0, 0], 0.2 * s);
    R.hitVol(
      "head",
      "lamp",
      [0, -0.07 * s, 0.03 * s],
      [0, -0.08 * s, -0.06 * s],
      0.07 * s,
    );
    R.marker("torso", "body", 0, 0, 0, 0.36 * s);
    R.marker("head", "lamp", 0, -0.07 * s, -0.02 * s, 0.07 * s);
    R.socket("muzzle", "lamp", 0, -0.09 * s, -0.07 * s, -0.35, 0, 0);
    R.socket("eyes", "lamp", 0, -0.09 * s, -0.07 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      hover,
      bodyThick: 0.08 * s,
      height: hover + 0.1 * s,
      hipH: hover,
      gore: "oil",
      cut: {
        head: "lamp",
        leftArm: "fan",
        rightArm: "fan",
        leftLeg: "fan",
        rightLeg: "fan",
      },
    });
    return tpl;
  }
  L.infos.sky_eye = {
    kind: "hover",
    height: 2.2,
    radius: 0.4,
    gore: "oil",
    isRobot: true,
    hover: 2.1,
    parts: ["head", "torso"],
    labels: {
      head: "Lamp",
      torso: "Disc",
      leftArm: "Disc",
      rightArm: "Disc",
      leftLeg: "Disc",
      rightLeg: "Disc",
    },
    gait: { walkStep: 1, runStep: 1.5, walkSpeed: 2.0, runSpeed: 5.0 },
    style: { ranged: true, disc: true, lookLimit: 3 },
    variants: 1,
    build: buildSkyEye,
  };

  // ==================================================================
  // BULWARK — heavy tracked turret robot (biped rig, legs hidden; the
  // treads ride on the hips bone, the turret is the chest, the guns are
  // the arms held forward, the periscope is the head)
  // ==================================================================
