// play-inline-463 02 — out
// Lines 18-367 of readable/play-inline-463.pretty.js (statement-aligned).
  const L = G.chars._lib,
    H = L.human;
  const P = L.prim,
    PAL = L.PAL,
    M = H.mat;
  const K = L.creatureKit,
    seg = K.seg,
    claw = K.claw,
    bodyZ = K.bodyZ,
    skinMat = K.skinMat,
    sixLegRig = K.sixLegRig,
    smoothstep = K.smoothstep,
    ALL6 = K.ALL6,
    LBL = K.LBL;
  const lerp = L.lerp,
    clamp = L.clamp;
  const PI = Math.PI;

  // ==================================================================
  // DOG  (Biscuit: a scruffy tan-and-white mutt / wild feral mongrels)
  // ==================================================================
  function buildDog(opts, seed) {
    const rng = L.rng(seed);
    const wild =
      opts.variant === "wild" ||
      (opts.variant === undefined &&
        rng.chance(0.5) &&
        opts.variant !== "biscuit");
    const s = (opts.scale || 1) * (wild ? rng.range(0.85, 0.95) : 1);
    const R = new L.Rig("quad");
    const bh = 0.56 * s;
    R.bone("hips", null, 0, bh, 0.26 * s, "torso");
    R.bone("spine", "hips", 0, 0.02 * s, -0.24 * s, "torso");
    R.bone("chest", "spine", 0, 0.01 * s, -0.24 * s, "torso");
    R.bone("neck", "chest", 0, 0.06 * s, -0.12 * s, "head");
    R.bone("head", "neck", 0, 0.14 * s, -0.08 * s, "head");
    R.bone("jaw", "head", 0, -0.04 * s, -0.06 * s, "head");
    R.bone("earL", "head", -0.05 * s, 0.07 * s, 0.02 * s, "head");
    R.bone("earR", "head", 0.05 * s, 0.07 * s, 0.02 * s, "head");
    // front legs (from chest), hind legs (from hips) — bind offsets zig-zag like a real dog
    for (const [S, sg, part] of [
      ["FL", -1, "leftArm"],
      ["FR", 1, "rightArm"],
    ]) {
      R.bone("upper" + S, "chest", sg * 0.085 * s, -0.04 * s, -0.02 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.22 * s, 0.04 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.2 * s, -0.01 * s, part);
    }
    for (const [S, sg, part] of [
      ["HL", -1, "leftLeg"],
      ["HR", 1, "rightLeg"],
    ]) {
      R.bone("upper" + S, "hips", sg * 0.08 * s, -0.03 * s, 0.02 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.2 * s, -0.09 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.22 * s, 0.07 * s, part);
    }
    R.bone("tail1", "hips", 0, 0.02 * s, 0.1 * s, "torso");
    R.bone("tail2", "tail1", 0, -0.06 * s, 0.13 * s, "torso");
    R.bone("tail3", "tail2", 0, -0.07 * s, 0.11 * s, "torso");
    const tan = wild ? rng.pick([0x7a6040, 0x5a4a38, 0x8a7458]) : 0xb08a5a,
      black = wild ? 0x2a2218 : 0x1a1410;
    const furP = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (!wild) {
        // Biscuit: scruffy tan mutt with irregular white patches, white chest & paws
        const n = L.noise3((wx * 5) / s + 3, (wy * 5) / s, (wz * 5) / s);
        if (n > 0.58 || (ny < -0.3 && wz < 0) || wy < 0.18 * s) {
          out[0] = lerp(out[0], 0.86, 0.85);
          out[1] = lerp(out[1], 0.82, 0.85);
          out[2] = lerp(out[2], 0.76, 0.85);
        }
        if (L.noise3(wx * 30, wy * 30, wz * 30) > 0.7) {
          out[0] *= 0.85;
          out[1] *= 0.82;
          out[2] *= 0.8;
        } // scruff
        return;
      }
      let k = 0;
      if (wy > bh - 0.03 * s && ny > -0.35 && wz > -0.44 * s && wz < 0.42 * s)
        k = 0.92; // saddle
      if (wz < -0.62 * s && wy > bh + 0.05 * s)
        k = Math.max(k, smoothstep(-0.62 * s, -0.72 * s, wz)); // muzzle mask
      if (ny < -0.5 && wy > 0.3 * s) k = 0; // pale belly
      if (wild && L.noise3(wx * 18, wy * 18, wz * 18) > 0.72) {
        out[0] = out[0] * 0.8 + 0.25;
        out[1] = out[1] * 0.6 + 0.12;
        out[2] = out[2] * 0.6 + 0.12;
        return;
      } // mange
      const c = L.col(black);
      out[0] = lerp(out[0], c.r, k);
      out[1] = lerp(out[1], c.g, k);
      out[2] = lerp(out[2], c.b, k);
    };
    const fur = {
      color: tan,
      region: "fur",
      rough: 0.9,
      noise: 0.16,
      paint: furP,
      grad: [0.9, 1.08],
    };
    // body
    R.addW(
      "hips",
      bodyZ([
        { z: 0.42 * s, rx: 0.06 * s, ry: 0.07 * s, oy: bh + 0.02 * s },
        { z: 0.36 * s, rx: 0.11 * s, ry: 0.13 * s, oy: bh + 0.02 * s },
        { z: 0.22 * s, rx: 0.12 * s, ry: 0.14 * s, oy: bh + 0.02 * s },
        { z: 0.08 * s, rx: 0.11 * s, ry: 0.13 * s, oy: bh + 0.02 * s },
      ]),
      fur,
    );
    R.addW(
      "spine",
      bodyZ([
        { z: 0.12 * s, rx: 0.11 * s, ry: 0.13 * s, oy: bh + 0.02 * s },
        { z: -0.04 * s, rx: 0.11 * s, ry: 0.13 * s, oy: bh + 0.01 * s },
        { z: -0.16 * s, rx: 0.125 * s, ry: 0.16 * s, oy: bh + 0.0 * s },
      ]),
      fur,
    );
    R.addW(
      "chest",
      bodyZ([
        { z: -0.12 * s, rx: 0.125 * s, ry: 0.16 * s, oy: bh },
        { z: -0.26 * s, rx: 0.135 * s, ry: 0.19 * s, oy: bh - 0.01 * s },
        { z: -0.36 * s, rx: 0.12 * s, ry: 0.17 * s, oy: bh + 0.02 * s },
        { z: -0.43 * s, rx: 0.07 * s, ry: 0.1 * s, oy: bh + 0.07 * s },
      ]),
      fur,
    );
    // neck
    const nw = R.world("neck");
    R.addW(
      "neck",
      P.xf(
        P.limb(0.26 * s, 0.085 * s, 0.1 * s, { seg: 12 }),
        nw[0],
        nw[1] + 0.2 * s,
        nw[2] - 0.1 * s,
        -0.8,
        0,
        0,
      ),
      fur,
    );
    // head: skull + long muzzle + nose
    const hw = R.world("head");
    R.addW(
      "head",
      P.xf(
        P.sphere(0.085 * s, 0.078 * s, 0.095 * s, 12, 9),
        hw[0],
        hw[1] + 0.02 * s,
        hw[2] + 0.01 * s,
      ),
      fur,
    );
    const mz = P.limb(0.15 * s, 0.048 * s, 0.03 * s, { seg: 10 });
    mz.rotateX(PI / 2 + 0.1); // -Y → -Z
    R.addW("head", P.xf(mz, hw[0], hw[1] + 0.0, hw[2] - 0.06 * s), fur);
    R.addW(
      "head",
      P.xf(
        P.sphere(0.02 * s, 0.017 * s, 0.018 * s, 8, 6),
        hw[0],
        hw[1] + 0.005 * s,
        hw[2] - 0.215 * s,
      ),
      { color: 0x0e0c0a, rough: 0.3, noise: 0.05 },
    );
    for (const sg of [-1, 1]) {
      R.addW(
        "head",
        P.xf(
          P.sphere(0.014 * s, 0.012 * s, 0.01 * s, 8, 6),
          hw[0] + sg * 0.04 * s,
          hw[1] + 0.04 * s,
          hw[2] - 0.06 * s,
        ),
        { color: 0x2a1808, rough: 0.2, noise: 0.05 },
      );
      const ear = P.cone(0.035 * s, 0.1 * s, 6);
      ear.scale(1, 1, 0.45);
      R.add(
        "ear" + (sg < 0 ? "L" : "R"),
        P.xf(ear, sg * 0.01 * s, 0.045 * s, 0, -0.15, 0, -sg * 0.2),
        Object.assign({}, fur, { paint: null, color: black }),
      );
    }
    // jaw + tongue
    const jw = R.world("jaw");
    const lj = P.limb(0.13 * s, 0.035 * s, 0.022 * s, { seg: 8, flat: 0.6 });
    lj.rotateX(PI / 2 + 0.05);
    R.addW(
      "jaw",
      P.xf(lj, jw[0], jw[1], jw[2]),
      Object.assign({}, fur, { color: 0x3a2a1a, paint: null }),
    );
    R.addW(
      "jaw",
      P.xf(
        P.box(0.04 * s, 0.01 * s, 0.1 * s, 0.005),
        jw[0],
        jw[1] + 0.012 * s,
        jw[2] - 0.08 * s,
        0.25,
        0,
        0,
      ),
      { color: 0xb05060, rough: 0.35, noise: 0.05 },
    );
    // legs
    const legFur = Object.assign({}, fur);
    for (const S of ["FL", "FR", "HL", "HR"]) {
      const front = S[0] === "F";
      const up = R.bones[R.map["lower" + S]].pos,
        lo = R.bones[R.map["paw" + S]].pos;
      seg(R, "upper" + S, up, (front ? 0.055 : 0.075) * s, 0.04 * s, legFur, {
        bulge: front ? 0.005 : 0.02 * s,
      });
      seg(R, "lower" + S, lo, 0.035 * s, 0.026 * s, legFur);
      R.add(
        "paw" + S,
        P.xf(
          P.sphere(0.035 * s, 0.028 * s, 0.045 * s, 8, 6),
          0,
          -0.02 * s,
          -0.02 * s,
        ),
        Object.assign({}, legFur, { color: L.shade(tan, 0.9), paint: null }),
      );
    }
    // bushy tail
    const tailP = [
      [0, 0, 0],
      R.bones[R.map.tail2].pos,
      R.bones[R.map.tail3].pos,
    ];
    seg(
      R,
      "tail1",
      tailP[1],
      0.035 * s,
      0.045 * s,
      Object.assign({}, fur, { paint: null, color: L.mix(tan, black, 0.5) }),
    );
    seg(
      R,
      "tail2",
      tailP[2],
      0.045 * s,
      0.04 * s,
      Object.assign({}, fur, { paint: null, color: L.mix(tan, black, 0.6) }),
    );
    seg(
      R,
      "tail3",
      [0, -0.08 * s, 0.07 * s],
      0.04 * s,
      0.015 * s,
      Object.assign({}, fur, { paint: null, color: black }),
    );
    if (!wild) {
      // Biscuit's worn leather collar
      R.addW(
        "neck",
        P.xf(
          P.torus(0.078 * s, 0.012 * s, 5, 14),
          nw[0],
          nw[1] + 0.07 * s,
          nw[2] - 0.03 * s,
          PI / 2 - 0.7,
          0,
          0,
        ),
        M.leather(0x5a2a1a),
      );
      R.addW(
        "neck",
        P.xf(
          P.cyl(0.015 * s, 0.015 * s, 0.004 * s, 8),
          nw[0],
          nw[1] + 0.02 * s,
          nw[2] - 0.09 * s,
          PI / 2,
          0,
          0,
        ),
        M.metal(0xb8a050),
      );
    }
    // hit volumes & markers
    R.hitVol("head", "head", [0, 0.02 * s, 0], [0, 0, -0.18 * s], 0.08 * s);
    R.hitVol(
      "torso",
      "hips",
      [0, 0.02 * s, 0.12 * s],
      [0, 0.02 * s, -0.12 * s],
      0.13 * s,
    );
    R.hitVol("torso", "chest", [0, 0, 0.1 * s], [0, 0, -0.2 * s], 0.15 * s);
    for (const [S, part] of [
      ["FL", "leftArm"],
      ["FR", "rightArm"],
      ["HL", "leftLeg"],
      ["HR", "rightLeg"],
    ]) {
      R.hitVol(
        part,
        "upper" + S,
        [0, 0, 0],
        R.bones[R.map["lower" + S]].pos,
        0.05 * s,
      );
      R.hitVol(
        part,
        "lower" + S,
        [0, 0, 0],
        R.bones[R.map["paw" + S]].pos,
        0.035 * s,
      );
    }
    R.marker("head", "head", 0, 0.02 * s, -0.06 * s, 0.09 * s);
    R.marker("torso", "spine", 0, 0, 0, 0.18 * s);
    R.marker("leftArm", "upperFL", 0, -0.15 * s, 0, 0.06 * s);
    R.marker("rightArm", "upperFR", 0, -0.15 * s, 0, 0.06 * s);
    R.marker("leftLeg", "upperHL", 0, -0.15 * s, 0, 0.06 * s);
    R.marker("rightLeg", "upperHR", 0, -0.15 * s, 0, 0.06 * s);
    R.socket("eyes", "head", 0, 0.04 * s, -0.06 * s);
    R.socket("mouth", "jaw", 0, 0, -0.12 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.13 * s,
      height: 0.85 * s,
      hipH: bh,
      cut: {
        head: "head",
        leftArm: "lowerFL",
        rightArm: "lowerFR",
        leftLeg: "lowerHL",
        rightLeg: "lowerHR",
      },
      style: { wag: !wild, pant: true, tailUp: wild ? -0.1 : 0.2 },
    });
    return tpl;
  }
