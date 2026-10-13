// play-inline-463 04 — bone
// Lines 392-728 of readable/play-inline-463.pretty.js (statement-aligned).
  function buildBurrowRat(opts, seed) {
    const rng = L.rng(seed);
    const s = (opts.scale || 1) * rng.range(0.9, 1.1);
    const R = new L.Rig("quad");
    const bh = 0.28 * s;
    R.bone("hips", null, 0, bh, 0.22 * s, "torso");
    R.bone("spine", "hips", 0, 0.03 * s, -0.2 * s, "torso");
    R.bone("chest", "spine", 0, 0, -0.2 * s, "torso");
    R.bone("neck", "chest", 0, 0.02 * s, -0.12 * s, "head");
    R.bone("head", "neck", 0, 0.02 * s, -0.08 * s, "head");
    R.bone("jaw", "head", 0, -0.05 * s, -0.1 * s, "head");
    for (const [S, sg, part] of [
      ["FL", -1, "leftArm"],
      ["FR", 1, "rightArm"],
    ]) {
      R.bone("upper" + S, "chest", sg * 0.1 * s, -0.05 * s, 0, part);
      R.bone(
        "lower" + S,
        "upper" + S,
        sg * 0.03 * s,
        -0.11 * s,
        -0.02 * s,
        part,
      );
      R.bone("paw" + S, "lower" + S, 0, -0.08 * s, -0.02 * s, part);
    }
    for (const [S, sg, part] of [
      ["HL", -1, "leftLeg"],
      ["HR", 1, "rightLeg"],
    ]) {
      R.bone("upper" + S, "hips", sg * 0.1 * s, -0.04 * s, 0.02 * s, part);
      R.bone(
        "lower" + S,
        "upper" + S,
        sg * 0.02 * s,
        -0.1 * s,
        -0.04 * s,
        part,
      );
      R.bone("paw" + S, "lower" + S, 0, -0.1 * s, 0.04 * s, part);
    }
    R.bone("tail1", "hips", 0, 0, 0.14 * s, "torso");
    R.bone("tail2", "tail1", 0, -0.03 * s, 0.2 * s, "torso");
    R.bone("tail3", "tail2", 0, -0.02 * s, 0.2 * s, "torso");
    // coarse, bristly dark coat with a grizzled back stripe and a paler belly
    const furC = rng.pick([0x3a322a, 0x2e2a26, 0x46392c]);
    const bristle = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (ny > 0.55 && L.noise3(wx * 30, wy * 30, wz * 30) > 0.45) {
        out[0] *= 1.6;
        out[1] *= 1.55;
        out[2] *= 1.5;
      } // grizzled guard hairs
      if (L.noise3(wx * 9, wy * 9, wz * 9) > 0.7) {
        out[0] *= 0.7;
        out[1] *= 0.68;
        out[2] *= 0.66;
      }
      if (ny < -0.5) {
        out[0] *= 1.35;
        out[1] *= 1.3;
        out[2] *= 1.25;
      }
    };
    const sk = {
      color: furC,
      region: "fur",
      rough: 0.9,
      noise: 0.2,
      paint: bristle,
      grad: [0.85, 1.08],
    };
    const bare = {
      color: rng.pick([0x9a8078, 0x8a7470]),
      region: "skin",
      rough: 0.45,
      noise: 0.15,
      grad: [0.85, 1.05],
    };
    const plateM = {
      color: 0xb0a48a,
      region: "shell",
      rough: 0.55,
      noise: 0.25,
      grad: [0.7, 1.1],
    };
    R.addW(
      "hips",
      bodyZ([
        { z: 0.36 * s, rx: 0.07 * s, ry: 0.07 * s, oy: bh },
        { z: 0.28 * s, rx: 0.15 * s, ry: 0.14 * s, oy: bh + 0.02 * s },
        { z: 0.12 * s, rx: 0.17 * s, ry: 0.16 * s, oy: bh + 0.03 * s },
        { z: 0.02 * s, rx: 0.16 * s, ry: 0.15 * s, oy: bh + 0.03 * s },
      ]),
      sk,
    );
    R.addW(
      "spine",
      bodyZ([
        { z: 0.06 * s, rx: 0.16 * s, ry: 0.15 * s, oy: bh + 0.03 * s },
        { z: -0.12 * s, rx: 0.15 * s, ry: 0.14 * s, oy: bh + 0.03 * s },
        { z: -0.22 * s, rx: 0.14 * s, ry: 0.13 * s, oy: bh + 0.02 * s },
      ]),
      sk,
    );
    R.addW(
      "chest",
      bodyZ([
        { z: -0.16 * s, rx: 0.14 * s, ry: 0.13 * s, oy: bh + 0.02 * s },
        { z: -0.3 * s, rx: 0.12 * s, ry: 0.12 * s, oy: bh + 0.02 * s },
        { z: -0.36 * s, rx: 0.09 * s, ry: 0.09 * s, oy: bh + 0.03 * s },
      ]),
      sk,
    );
    // head: blunt wedge, tiny eyes, a bony scalp shield, round ears & two orange buck teeth
    const hw = R.world("head");
    const hd = P.sphere(1, 1, 1, 14, 10);
    P.deform(hd, (v) => {
      let x = v.x * 0.09,
        y = v.y * 0.075,
        z = v.z * 0.12;
      if (v.z < 0) {
        y *= lerp(1, 0.8, -v.z);
      }
      v.set(hw[0] + x * s, hw[1] + y * s, hw[2] + z * s - 0.04 * s);
    });
    R.addW("head", hd, sk);
    for (const sg of [-1, 1]) {
      R.addW(
        "head",
        P.xf(
          P.sphere(0.009 * s, 0.009 * s, 0.009 * s, 6, 5),
          hw[0] + sg * 0.05 * s,
          hw[1] + 0.035 * s,
          hw[2] - 0.1 * s,
        ),
        { color: 0x0a0806, rough: 0.2 },
      );
      R.addW(
        "head",
        P.xf(
          P.box(0.02 * s, 0.07 * s, 0.012 * s, 0.004),
          hw[0] + sg * 0.012 * s,
          hw[1] - 0.05 * s,
          hw[2] - 0.155 * s,
          -0.25,
          0,
          0,
        ),
        { color: 0xd88a28, rough: 0.35, noise: 0.15, grad: [0.7, 1.1] },
      );
      R.addW(
        "head",
        P.xf(
          P.sphere(0.03 * s, 0.03 * s, 0.008 * s, 8, 6),
          hw[0] + sg * 0.07 * s,
          hw[1] + 0.065 * s,
          hw[2] + 0.0 * s,
          0,
          sg * 0.5,
          0,
        ),
        bare,
      ); // round ears
    }
    // armoured scalp: a keeled bony shield from the brow back over the neck
    const shield = P.sphere(
      0.085 * s,
      0.035 * s,
      0.13 * s,
      12,
      6,
      0,
      PI * 2,
      0,
      PI * 0.5,
    );
    P.deform(shield, (v) => {
      v.y += 0.012 * s * Math.exp(-Math.pow(v.x / (0.015 * s), 2));
    });
    R.addW(
      "head",
      P.xf(shield, hw[0], hw[1] + 0.05 * s, hw[2] - 0.02 * s, 0.1, 0, 0),
      plateM,
    );
    R.addW(
      "head",
      P.xf(
        P.sphere(0.035 * s, 0.025 * s, 0.03 * s, 8, 6),
        hw[0],
        hw[1] - 0.01 * s,
        hw[2] - 0.165 * s,
      ),
      bare,
    ); // naked snout tip
    const jw = R.world("jaw");
    R.addW(
      "jaw",
      P.xf(
        P.sphere(0.06 * s, 0.025 * s, 0.07 * s, 10, 6),
        jw[0],
        jw[1],
        jw[2] - 0.02 * s,
      ),
      sk,
    );
    for (const sg of [-1, 1])
      R.addW(
        "jaw",
        P.xf(
          P.box(0.016 * s, 0.05 * s, 0.01 * s, 0.003),
          jw[0] + sg * 0.01 * s,
          jw[1] + 0.02 * s,
          jw[2] - 0.075 * s,
          0.25,
          0,
          0,
        ),
        { color: 0xc8782a, rough: 0.35, noise: 0.15 },
      );
    // stubby legs; the forepaws are huge spade-like digging hands with flat curved claws
    for (const S of ["FL", "FR", "HL", "HR"]) {
      const front = S[0] === "F";
      seg(
        R,
        "upper" + S,
        R.bones[R.map["lower" + S]].pos,
        (front ? 0.06 : 0.05) * s,
        0.035 * s,
        sk,
      );
      seg(
        R,
        "lower" + S,
        R.bones[R.map["paw" + S]].pos,
        (front ? 0.045 : 0.035) * s,
        0.03 * s,
        front ? sk : bare,
      );
      R.add(
        "paw" + S,
        P.xf(
          P.sphere(
            (front ? 0.05 : 0.035) * s,
            0.02 * s,
            (front ? 0.055 : 0.045) * s,
            8,
            5,
          ),
          0,
          -0.01 * s,
          -0.02 * s,
        ),
        bare,
      );
      const nc = front ? 4 : 3;
      for (let i = 0; i < nc; i++) {
        const x = (i - (nc - 1) / 2) * (front ? 0.024 : 0.018) * s;
        if (front) {
          const g = P.box(0.018 * s, 0.006 * s, 0.06 * s, 0.002 * s);
          P.deform(g, (v) => {
            v.y -= Math.pow(Math.max(0, -v.z) / (0.03 * s), 2) * 0.012 * s;
          });
          R.add("paw" + S, P.xf(g, x, -0.018 * s, -0.08 * s, 0.15, 0, 0), {
            color: 0x2a2620,
            rough: 0.35,
            noise: 0.08,
          });
        } else
          claw(
            R,
            "paw" + S,
            [
              [x, -0.01 * s, -0.05 * s],
              [x * 1.1, -0.025 * s, -0.08 * s],
            ],
            0.007 * s,
            { color: 0x2a2018, rough: 0.4 },
          );
      }
    }
    // long naked scaly tail
    seg(R, "tail1", R.bones[R.map.tail2].pos, 0.03 * s, 0.022 * s, bare);
    seg(R, "tail2", R.bones[R.map.tail3].pos, 0.022 * s, 0.014 * s, bare);
    seg(R, "tail3", [0, -0.01 * s, 0.26 * s], 0.014 * s, 0.004 * s, bare);
    R.hitVol("head", "head", [0, 0, -0.02 * s], [0, 0, -0.12 * s], 0.08 * s);
    R.hitVol(
      "torso",
      "hips",
      [0, 0.02 * s, 0.12 * s],
      [0, 0.03 * s, -0.1 * s],
      0.16 * s,
    );
    R.hitVol(
      "torso",
      "chest",
      [0, 0.02 * s, 0.1 * s],
      [0, 0.02 * s, -0.12 * s],
      0.14 * s,
    );
    for (const [S, part] of [
      ["FL", "leftArm"],
      ["FR", "rightArm"],
      ["HL", "leftLeg"],
      ["HR", "rightLeg"],
    ])
      R.hitVol(
        part,
        "upper" + S,
        [0, 0, 0],
        R.bones[R.map["lower" + S]].pos,
        0.045 * s,
      );
    R.marker("head", "head", 0, 0, -0.06 * s, 0.09 * s);
    R.marker("torso", "spine", 0, 0.03 * s, 0, 0.18 * s);
    R.marker("leftArm", "upperFL", 0, -0.06 * s, 0, 0.05 * s);
    R.marker("rightArm", "upperFR", 0, -0.06 * s, 0, 0.05 * s);
    R.marker("leftLeg", "upperHL", 0, -0.06 * s, 0, 0.05 * s);
    R.marker("rightLeg", "upperHR", 0, -0.06 * s, 0, 0.05 * s);
    R.socket("eyes", "head", 0, 0.03 * s, -0.12 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.15 * s,
      height: 0.42 * s,
      hipH: bh,
      cut: {
        head: "head",
        leftArm: "upperFL",
        rightArm: "upperFR",
        leftLeg: "upperHL",
        rightLeg: "upperHR",
      },
      style: { wag: false, pant: false, tailUp: -0.05 },
    });
    return tpl;
  }
