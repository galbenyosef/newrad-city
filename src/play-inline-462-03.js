// play-inline-462 03 — out
// Lines 50-479 of readable/play-inline-462.pretty.js (statement-aligned).
  function buildStinger(opts, seed) {
    const rng = L.rng(seed);
    const vname = SCORP_V[opts.variant] ? opts.variant : "normal";
    const V = SCORP_V[vname];
    const s = (opts.scale || 1) * V.s * rng.range(0.95, 1.06);
    const R = new L.Rig("insect");
    const bh = 0.2 * s;
    R.bone("body", null, 0, bh, 0, "torso");
    R.bone("head", "body", 0, 0.02 * s, -0.3 * s, "head");
    R.bone("mandL", "head", -0.03 * s, -0.03 * s, -0.05 * s, "head");
    R.bone("mandR", "head", 0.03 * s, -0.03 * s, -0.05 * s, "head");
    R.bone("abdomen", "body", 0, -0.005 * s, 0.06 * s, "torso");
    // metasoma: the arched tail curling forward over the back
    const TAIL = [
      [0, 0.03, 0.42],
      [0, 0.1, 0.1],
      [0, 0.14, 0.02],
      [0, 0.1, -0.08],
      [0, 0.03, -0.13],
      [0, -0.06, -0.1],
    ];
    let parent = "abdomen";
    TAIL.forEach((o, i) => {
      const n = i < 5 ? "tail" + (i + 1) : "sting";
      R.bone(n, parent, o[0] * s, o[1] * s, o[2] * s, "leftLeg");
      parent = n;
    });
    // pedipalps (claws): femur → patella → chela (+ movable finger)
    for (const [S, sg, part] of [
      ["L", -1, "leftArm"],
      ["R", 1, "rightArm"],
    ]) {
      R.bone("claw" + S, "body", sg * 0.09 * s, 0.0, -0.26 * s, part);
      R.bone("fore" + S, "claw" + S, sg * 0.15 * s, 0.03 * s, -0.1 * s, part);
      R.bone("hand" + S, "fore" + S, -sg * 0.03 * s, 0.0, -0.17 * s, part);
      R.bone("pincer" + S, "hand" + S, sg * 0.03 * s, 0, -0.08 * s, part);
    }
    // four pairs of walking legs
    const LZ = [-0.19, -0.1, -0.01, 0.08];
    LZ.forEach((z, i) => {
      for (const [side, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        const S = side + (i + 1);
        R.bone("leg" + S, "body", sg * 0.1 * s, -0.02 * s, z * s, "rightLeg");
        R.bone(
          "foot" + S,
          "leg" + S,
          sg * 0.19 * s,
          0.07 * s,
          (i - 1.5) * 0.07 * s,
          "rightLeg",
        );
      }
    });
    const col = V.col,
      joint = V.joint;
    const bandC = L.col(joint);
    const shellP = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (ny < -0.35) {
        out[0] = out[0] * 0.6 + 0.12;
        out[1] = out[1] * 0.6 + 0.09;
        out[2] = out[2] * 0.6 + 0.06;
      }
      if (Math.sin((wz * 42) / s) > 0.35) {
        out[0] = lerp(out[0], bandC.r, 0.75);
        out[1] = lerp(out[1], bandC.g, 0.75);
        out[2] = lerp(out[2], bandC.b, 0.75);
      }
    }; // wasp banding
    const shell = {
      color: col,
      color2: L.shade(col, 1.45),
      region: "shell",
      rough: 0.22,
      noise: 0.14,
      grad: [0.65, 1.3],
      metal: 0.06,
      paint: shellP,
    };
    const plate = Object.assign({}, shell, { rough: 0.16, grad: [0.8, 1.35] });
    const jointM = { color: joint, region: "shell", rough: 0.45, noise: 0.12 };
    const black = { color: 0x0c0a08, rough: 0.08, noise: 0.02 };
    // prosoma (cephalothorax) + carapace plate
    const pro = P.sphere(0.13 * s, 0.07 * s, 0.2 * s, 14, 8);
    P.deform(pro, (v) => {
      if (v.z < 0) v.x *= 1 - 0.25 * (-v.z / (0.2 * s));
      if (v.y < 0) v.y *= 0.6;
    });
    R.add("body", P.xf(pro, 0, 0, -0.14 * s), shell);
    const cara = P.sphere(
      0.135 * s,
      0.06 * s,
      0.205 * s,
      14,
      6,
      0,
      PI * 2,
      0,
      PI * 0.45,
    );
    P.deform(cara, (v) => {
      if (v.z < 0) v.x *= 1 - 0.25 * (-v.z / (0.2 * s));
    });
    R.add("body", P.xf(cara, 0, 0.012 * s, -0.14 * s), plate);
    // eyes: median pair on a tubercle, lateral clusters at the front corners
    R.add(
      "head",
      P.xf(
        P.sphere(0.022 * s, 0.014 * s, 0.022 * s, 8, 5),
        0,
        0.05 * s,
        0.08 * s,
      ),
      shell,
    );
    for (const sg of [-1, 1]) {
      R.add(
        "head",
        P.xf(
          P.sphere(0.011 * s, 0.011 * s, 0.011 * s, 7, 5),
          sg * 0.014 * s,
          0.062 * s,
          0.08 * s,
        ),
        black,
      );
      for (let k = 0; k < 3; k++)
        R.add(
          "head",
          P.xf(
            P.sphere(0.006 * s, 0.006 * s, 0.006 * s, 5, 4),
            sg * (0.05 + k * 0.008) * s,
            0.03 * s,
            0.02 * s + k * 0.008 * s,
          ),
          black,
        );
      // chelicerae
      claw(
        R,
        sg < 0 ? "mandL" : "mandR",
        [
          [0, 0, 0.02 * s],
          [sg * 0.006 * s, -0.004 * s, -0.02 * s],
          [-sg * 0.01 * s, -0.01 * s, -0.035 * s],
        ],
        0.012 * s,
        jointM,
        5,
      );
    }
    // waist (petiole) + abdomen: overlapping banded plates with dark intersegment membranes
    R.add(
      "abdomen",
      P.xf(P.sphere(0.04 * s, 0.035 * s, 0.05 * s, 8, 6), 0, 0.0, -0.01 * s),
      jointM,
    );
    for (let i = 0; i < 6; i++) {
      const t = i / 5,
        rx = lerp(0.1, 0.07, t) * s * (1 + 0.25 * Math.sin(t * PI)),
        z = (0.04 + i * 0.07) * s;
      R.add(
        "abdomen",
        P.xf(
          P.sphere(rx * 1.02, 0.058 * s, 0.05 * s, 12, 5),
          0,
          -0.012 * s,
          z + 0.012 * s,
        ),
        jointM,
      );
      const tg = P.sphere(
        rx,
        0.065 * s,
        0.056 * s,
        12,
        6,
        0,
        PI * 2,
        0,
        PI * 0.55,
      );
      R.add("abdomen", P.xf(tg, 0, -0.004 * s, z), plate);
    }
    // folded smoky wings lying over the abdomen
    const wingM = {
      color: 0x3a3630,
      rough: 0.2,
      metal: 0.1,
      noise: 0.08,
      grad: [0.9, 1.1],
      paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
        if (Math.abs(Math.sin((wz * 90) / s + (wx * 30) / s)) < 0.08) {
          out[0] *= 0.4;
          out[1] *= 0.4;
          out[2] *= 0.4;
        }
      },
    };
    for (const sg of [-1, 1]) {
      const wg = P.sphere(0.06 * s, 0.008 * s, 0.24 * s, 10, 4);
      R.add(
        "abdomen",
        P.xf(wg, sg * 0.04 * s, 0.075 * s, 0.2 * s, 0.06, sg * 0.12, sg * 0.15),
        wingM,
      );
    }
    // tail: thin whip segments, a small bulb and a long needle sting
    for (let i = 0; i < 5; i++) {
      const n = "tail" + (i + 1),
        next = TAIL[i + 1].map((v) => v * s);
      const r0 = lerp(0.032, 0.02, i / 4) * s,
        r1 = r0 * 0.9;
      seg(R, n, next, r0, r1, Object.assign({}, plate, { grad: [0.9, 1.2] }), {
        seg: 10,
        bulge: 0.006 * s,
        bulgeAt: 0.5,
      });
      // pale knuckle ring at each joint, perpendicular to the segment
      const ring = P.torus(r0 * 0.95, r0 * 0.2, 4, 12);
      ring.applyQuaternion(
        new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(next[0], next[1], next[2]).normalize(),
        ),
      );
      R.add(n, ring, jointM);
    }
    R.add(
      "sting",
      P.xf(
        P.sphere(0.03 * s, 0.026 * s, 0.045 * s, 10, 7),
        0,
        -0.015 * s,
        -0.02 * s,
        -0.5,
        0,
        0,
      ),
      Object.assign({}, shell, { rough: 0.3 }),
    );
    claw(
      R,
      "sting",
      [
        [0, -0.03 * s, -0.05 * s],
        [0, -0.1 * s, -0.08 * s],
        [0, -0.19 * s, -0.08 * s],
        [0, -0.24 * s, -0.05 * s],
      ],
      0.011 * s,
      { color: 0x14100c, rough: 0.12, noise: 0.05, grad: [1.3, 0.6] },
      6,
    );
    // raptorial arms: spined femur, long spined forearm, folding scythe (+ hooked tarsus on 'pincer')
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      const fp = R.bones[R.map["fore" + S]].pos,
        hp = R.bones[R.map["hand" + S]].pos;
      seg(R, "claw" + S, fp, 0.026 * s, 0.022 * s, shell, { seg: 8 });
      R.add(
        "fore" + S,
        P.sphere(0.028 * s, 0.026 * s, 0.028 * s, 8, 6),
        jointM,
      );
      seg(R, "fore" + S, hp, 0.028 * s, 0.024 * s, shell, { seg: 8 });
      for (let k = 0; k < 4; k++) {
        const t = (k + 1) / 5;
        claw(
          R,
          "fore" + S,
          [
            [hp[0] * t, hp[1] * t - 0.02 * s, hp[2] * t],
            [
              hp[0] * t - sg * 0.004 * s,
              hp[1] * t - 0.045 * s,
              hp[2] * t + 0.01 * s,
            ],
          ],
          0.006 * s,
          jointM,
          4,
        );
      } // spines
      const scythe = P.extrude(
        [
          [0, 0.012],
          [0.2, 0.004],
          [0.25, -0.02],
          [0.2, -0.008],
          [0, -0.012],
        ].map((q) => [q[1] * s, -q[0] * s]),
        0.012 * s,
        0.002 * s,
      );
      scythe.rotateY(PI / 2);
      scythe.rotateX(PI / 2);
      R.add("hand" + S, scythe, plate);
      for (let k = 0; k < 4; k++)
        claw(
          R,
          "hand" + S,
          [
            [0, -0.012 * s, -(0.03 + k * 0.045) * s],
            [0, -0.03 * s, -(0.025 + k * 0.045) * s],
          ],
          0.005 * s,
          jointM,
          4,
        );
      claw(
        R,
        "pincer" + S,
        [
          [0, 0, 0],
          [0, 0.01 * s, -0.04 * s],
          [0, -0.01 * s, -0.07 * s],
        ],
        0.008 * s,
        jointM,
        5,
      );
    }
    // legs: femur up & out, tibia down to a claw-tipped tarsus
    for (let i = 0; i < 4; i++)
      for (const [side, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        const S = side + (i + 1),
          fp = R.bones[R.map["foot" + S]].pos;
        seg(R, "leg" + S, fp, 0.022 * s, 0.018 * s, shell, { seg: 6 });
        R.add(
          "foot" + S,
          P.sphere(0.02 * s, 0.018 * s, 0.02 * s, 6, 5),
          jointM,
        );
        const tib = [sg * 0.13 * s, -bh - fp[1] + 0.012 * s, fp[2] * 0.6];
        seg(R, "foot" + S, tib, 0.017 * s, 0.009 * s, shell, { seg: 6 });
      }
    // hit volumes / part markers
    R.hitVol(
      "head",
      "head",
      [0, 0.02 * s, 0.05 * s],
      [0, 0.01 * s, -0.02 * s],
      0.08 * s,
    );
    R.hitVol("torso", "body", [0, 0, 0.02 * s], [0, 0, -0.26 * s], 0.13 * s);
    R.hitVol("torso", "abdomen", [0, 0, 0], [0, 0, 0.42 * s], 0.12 * s);
    let tb = "abdomen";
    for (let i = 1; i <= 5; i++) {
      const n = "tail" + i;
      R.hitVol(
        "leftLeg",
        n,
        [0, 0, 0],
        TAIL[i].map((v) => v * s),
        0.055 * s,
      );
      tb = n;
    }
    R.hitVol(
      "leftLeg",
      "sting",
      [0, -0.02 * s, -0.03 * s],
      [0, -0.12 * s, -0.06 * s],
      0.06 * s,
    );
    for (const [S, part] of [
      ["L", "leftArm"],
      ["R", "rightArm"],
    ]) {
      R.hitVol(
        part,
        "claw" + S,
        [0, 0, 0],
        R.bones[R.map["fore" + S]].pos,
        0.04 * s,
      );
      R.hitVol(
        part,
        "fore" + S,
        [0, 0, 0],
        R.bones[R.map["hand" + S]].pos,
        0.045 * s,
      );
      R.hitVol(part, "hand" + S, [0, 0, 0], [0, 0, -0.18 * s], 0.06 * s);
    }
    for (let i = 1; i <= 4; i++)
      for (const side of ["L", "R"])
        R.hitVol(
          "rightLeg",
          "leg" + side + i,
          [0, 0, 0],
          R.bones[R.map["foot" + side + i]].pos,
          0.03 * s,
        );
    void tb;
    R.marker("head", "head", 0, 0.03 * s, 0.03 * s, 0.08 * s);
    R.marker("torso", "body", 0, 0.02 * s, -0.05 * s, 0.16 * s);
    R.marker("leftArm", "handL", 0, 0, -0.05 * s, 0.07 * s);
    R.marker("rightArm", "handR", 0, 0, -0.05 * s, 0.07 * s);
    R.marker("leftLeg", "tail4", 0, 0, 0, 0.07 * s);
    R.marker("rightLeg", "legR2", 0.1 * s, 0.03 * s, 0, 0.06 * s);
    R.socket("eyes", "head", 0, 0.05 * s, 0.0);
    R.socket("muzzle", "sting", 0, -0.15 * s, -0.02 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.07 * s,
      height: 0.65 * s,
      hipH: bh,
      dirt: [0.05, 0.3],
      style: { big: true, scorpion: true },
      cut: {
        head: "head",
        leftArm: "foreL",
        rightArm: "foreR",
        leftLeg: "tail3",
        rightLeg: "legR2",
      },
    });
    return tpl;
  }
