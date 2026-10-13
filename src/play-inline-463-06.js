// play-inline-463 06 — out
// Lines 1031-1310 of readable/play-inline-463.pretty.js (statement-aligned).
  function buildGasfly(opts, seed) {
    const rng = L.rng(seed);
    const s = (opts.scale || 1) * rng.range(0.92, 1.1);
    const hover = 1.0 * s;
    const R = new L.Rig("fly");
    R.bone("body", null, 0, hover, 0, "torso");
    R.bone("head", "body", 0, 0.02 * s, -0.12 * s, "head");
    R.bone("abdomen", "body", 0, -0.01 * s, 0.08 * s, "leftLeg");
    R.bone("wingL", "body", -0.035 * s, 0.05 * s, -0.02 * s, "leftArm");
    R.bone("wingR", "body", 0.035 * s, 0.05 * s, -0.02 * s, "rightArm");
    for (const [n, z] of [
      ["1", -0.04],
      ["2", 0],
      ["3", 0.04],
    ])
      for (const [side, sg] of [
        ["L", -1],
        ["R", 1],
      ])
        R.bone(
          "leg" + side + n,
          "body",
          sg * 0.03 * s,
          -0.04 * s,
          z * s,
          "torso",
        );
    const bodyC = rng.pick([0x2a2622, 0x3a3228, 0x2e2a30]);
    const band = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (Math.sin((wz * 80) / s) > 0.4) {
        out[0] *= 1.6;
        out[1] *= 1.45;
        out[2] *= 1.2;
      }
      if (ny < -0.4) {
        out[0] *= 1.2;
        out[1] *= 1.15;
        out[2] *= 1.1;
      }
    };
    const chitin = {
      color: bodyC,
      region: "shell",
      rough: 0.3,
      noise: 0.12,
      paint: band,
      grad: [0.85, 1.15],
    };
    const sacC = rng.pick([0xd8b050, 0xc8a840, 0xe0b860]);
    const sac = {
      color: sacC,
      rough: 0.12,
      metal: 0.05,
      noise: 0.08,
      emis: 0.45,
      keepLod: true,
      grad: [0.8, 1.15],
      cls: 0,
      paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
        const v = L.noise3((wx * 24) / s, (wy * 24) / s, (wz * 24) / s);
        if (Math.abs(v - 0.5) < 0.03) {
          out[0] *= 0.55;
          out[1] *= 0.4;
          out[2] *= 0.3;
        } // dark vein web
        if (ny > 0.5) {
          out[0] *= 0.75;
          out[1] *= 0.72;
          out[2] *= 0.65;
        } // where it hangs from the body
      },
    };
    // thorax: compact, humped
    R.add(
      "body",
      P.xf(P.sphere(0.06 * s, 0.065 * s, 0.085 * s, 12, 9), 0, 0.005 * s, 0),
      chitin,
    );
    // abdomen: a long thin segmented tail curving gently down & back
    for (let i = 0; i < 7; i++) {
      const t = i / 6,
        r = lerp(0.04, 0.018, t) * s;
      R.add(
        "abdomen",
        P.xf(
          P.sphere(r, r * 0.9, 0.045 * s, 8, 6),
          0,
          -t * t * 0.08 * s,
          (0.03 + i * 0.06) * s,
        ),
        chitin,
      );
    }
    // the gas sac: a swollen translucent bladder slung under the front of the abdomen
    const g = P.sphere(1, 1, 1, 16, 12);
    P.deform(g, (v) => {
      const sag = v.y < 0 ? v.y * v.y * 0.25 : 0;
      v.set(
        v.x * 0.13 * s,
        (v.y * 0.13 - sag) * s - 0.13 * s,
        v.z * 0.17 * s + 0.1 * s,
      );
    });
    R.add("abdomen", g, sac);
    for (let i = 0; i < 3; i++)
      R.add(
        "abdomen",
        P.xf(
          P.cyl(0.012 * s, 0.018 * s, 0.03 * s, 8),
          (i - 1) * 0.05 * s,
          -0.27 * s,
          0.1 * s + (i % 2) * 0.04 * s,
        ),
        Object.assign({}, chitin, { paint: null, color: 0x4a3a28 }),
      ); // vent nozzles
    // head: small, two black eyes, a long needle proboscis
    R.add(
      "head",
      P.xf(P.sphere(0.04 * s, 0.038 * s, 0.04 * s, 10, 8), 0, 0, -0.01 * s),
      chitin,
    );
    for (const sg of [-1, 1])
      R.add(
        "head",
        P.xf(
          P.sphere(0.026 * s, 0.03 * s, 0.024 * s, 10, 8),
          sg * 0.03 * s,
          0.008 * s,
          -0.025 * s,
        ),
        {
          color: 0x0e0c0a,
          rough: 0.1,
          noise: 0.15,
          metal: 0.3,
          region: "scales",
        },
      );
    claw(
      R,
      "head",
      [
        [0, -0.02 * s, -0.04 * s],
        [0, -0.06 * s, -0.14 * s],
        [0, -0.09 * s, -0.24 * s],
      ],
      0.006 * s,
      { color: 0x1a1612, rough: 0.4 },
      4,
    );
    // wings: two narrow, veined, smoky membranes per side (dragonfly-like)
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ])
      for (const [dz, len] of [
        [-0.03, 0.42],
        [0.05, 0.38],
      ]) {
        const w = P.sphere(len * 0.5 * s, 0.004 * s, 0.045 * s, 14, 3);
        P.xf(
          w,
          sg * len * 0.5 * s,
          0.01 * s,
          dz * s,
          0,
          sg * (dz < 0 ? 0.1 : -0.15),
          sg * 0.08,
        );
        R.add("wing" + S, w, {
          color: 0x9a968a,
          rough: 0.12,
          noise: 0.06,
          region: "shell",
          emis: 0.03,
          paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
            if (
              Math.sin((wx * 140) / s) > 0.9 ||
              Math.sin((wz * 160) / s) > 0.92
            ) {
              out[0] *= 0.35;
              out[1] *= 0.33;
              out[2] *= 0.3;
            }
          },
        });
      }
    // legs: six long thin legs dangling down and slightly back
    for (const n of ["1", "2", "3"])
      for (const [side, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        const S = side + n,
          k = n === "3" ? 1.2 : 1;
        R.add(
          "leg" + S,
          P.sweep(
            [
              [0, 0, 0],
              [sg * 0.08 * s, 0.02 * s, 0],
              [sg * 0.11 * s, -0.22 * s * k, 0.04 * s],
              [sg * 0.1 * s, -0.42 * s * k, 0.1 * s],
            ],
            0.005 * s,
            { seg: 10, rs: 4 },
          ),
          chitin,
        );
      }
    R.hitVol("head", "head", [0, 0, 0], [0, 0, -0.05 * s], 0.06 * s);
    R.hitVol("torso", "body", [0, 0, 0.06 * s], [0, 0, -0.06 * s], 0.08 * s);
    R.hitVol(
      "leftLeg",
      "abdomen",
      [0, -0.13 * s, 0.0],
      [0, -0.13 * s, 0.22 * s],
      0.15 * s,
    );
    R.hitVol(
      "leftArm",
      "wingL",
      [-0.04 * s, 0, 0],
      [-0.4 * s, 0, 0.0],
      0.05 * s,
    );
    R.hitVol(
      "rightArm",
      "wingR",
      [0.04 * s, 0, 0],
      [0.4 * s, 0, 0.0],
      0.05 * s,
    );
    R.marker("head", "head", 0, 0, -0.03 * s, 0.06 * s);
    R.marker("torso", "body", 0, 0, 0, 0.08 * s);
    R.marker("leftArm", "wingL", -0.2 * s, 0, 0, 0.1 * s);
    R.marker("rightArm", "wingR", 0.2 * s, 0, 0, 0.1 * s);
    R.marker("leftLeg", "abdomen", 0, -0.13 * s, 0.1 * s, 0.15 * s);
    R.socket("eyes", "head", 0, 0, -0.05 * s);
    R.socket("muzzle", "abdomen", 0, -0.28 * s, 0.1 * s, PI * 0.6, 0, 0);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      hover,
      bodyH: hover,
      bodyThick: 0.15 * s,
      height: hover + 0.12 * s,
      hipH: hover,
      dirt: [0.05, 0.2],
      cut: {
        head: "head",
        leftArm: "wingL",
        rightArm: "wingR",
        leftLeg: "abdomen",
        rightLeg: "abdomen",
      },
    });
    return tpl;
  }
  L.infos.gasfly = {
    kind: "fly",
    height: 1.15,
    radius: 0.45,
    gore: "green",
    isCreature: true,
    hover: 1.0,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg"],
    labels: {
      head: "Head",
      torso: "Thorax",
      leftArm: "Left Wings",
      rightArm: "Right Wings",
      leftLeg: "Gas Sac",
      rightLeg: "Gas Sac",
    },
    gait: { walkStep: 1, runStep: 1.5, walkSpeed: 1.5, runSpeed: 3.8 },
    style: { ranged: true },
    variants: 3,
    build: buildGasfly,
  };
