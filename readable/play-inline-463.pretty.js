/* src/characters/33_critters.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: critters (dog, rat, roach, fly)
 * Owned by: characters.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (
    !G ||
    !G.chars ||
    !G.chars._lib ||
    !G.chars._lib.creatureKit ||
    !G.chars._lib.human
  )
    return;
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
  L.infos.dog = {
    kind: "quad",
    height: 0.85,
    radius: 0.4,
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
    gait: { walkStep: 0.42, runStep: 1.15, walkSpeed: 1.5, runSpeed: 8.0 },
    style: { stride: 1, wag: true, pant: true, tailUp: 0.2 },
    variants: 4,
    build: buildDog,
  };

  // ==================================================================
  // BURROW RAT
  // ==================================================================
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
})();
