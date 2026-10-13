/* src/characters/36_creatures3.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: more city fauna & tunnel people
 * Owned by: characters.
 *
 *  coyote   — rangy, mangy, scarred city coyotes: tan coat with a dark
 *             saddle, pale belly, big upright ears, narrow muzzle, bushy
 *             low tail. Variants: 'normal' (tan), 'dark' (night coat).
 *  stag     — a scarred white-tailed stag: slender barrel body, long thin
 *             legs, one head with branching antlers (one often snapped),
 *             mangy patches & pale scar tissue; grazes (style.graze).
 *  crawler     — tunnel dwellers: hunched, knuckle-dragging, pallid
 *             skin with sores & veins, lumpy growths, loincloth.
 *  sandhog  — tunnel workers: rubber slicker or canvas coveralls,
 *             half-face respirator, goggles, miner's helmet with a lit
 *             headlamp (char.sockets.lamp).
 *
 *   G.chars.create('coyote' | 'stag' | 'crawler' | 'sandhog', {seed, variant})
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (
    !G ||
    !G.chars ||
    !G.chars._lib ||
    !G.chars._lib.creatureKit ||
    !G.chars._lib.human
  )
    return;
  const L = G.chars._lib,
    H = L.human,
    P = L.prim,
    M = H.mat;
  const K = L.creatureKit,
    seg = K.seg,
    claw = K.claw,
    bodyZ = K.bodyZ,
    ALL6 = K.ALL6,
    LBL = K.LBL;
  const lerp = L.lerp,
    clamp = L.clamp,
    PI = Math.PI;
  const sm = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const mixTo = (out, c, k) => {
    out[0] = lerp(out[0], c.r, k);
    out[1] = lerp(out[1], c.g, k);
    out[2] = lerp(out[2], c.b, k);
  };
  const QLBL = {
    head: "Head",
    torso: "Torso",
    leftArm: "Left Foreleg",
    rightArm: "Right Foreleg",
    leftLeg: "Left Hind Leg",
    rightLeg: "Right Hind Leg",
  };

  // ==================================================================
  // COYOTE — rangy, mangy, scarred city coyotes ('dark' = night coat)
  // ==================================================================
  function buildCoyote(opts, seed) {
    const rng = L.rng(seed);
    const dark =
      opts.variant === "dark" ||
      (opts.variant === undefined && rng.chance(0.3));
    const s = (opts.scale || 1) * rng.range(1.08, 1.2);
    const R = new L.Rig("quad");
    const bh = 0.6 * s;
    R.bone("hips", null, 0, bh, 0.3 * s, "torso");
    R.bone("spine", "hips", 0, 0.02 * s, -0.28 * s, "torso");
    R.bone("chest", "spine", 0, 0.01 * s, -0.27 * s, "torso");
    R.bone("neck", "chest", 0, 0.06 * s, -0.13 * s, "head");
    R.bone("head", "neck", 0, 0.13 * s, -0.1 * s, "head");
    R.bone("jaw", "head", 0, -0.035 * s, -0.05 * s, "head");
    R.bone("earL", "head", -0.05 * s, 0.055 * s, 0.03 * s, "head");
    R.bone("earR", "head", 0.05 * s, 0.055 * s, 0.03 * s, "head");
    for (const [S, sg, part] of [
      ["FL", -1, "leftArm"],
      ["FR", 1, "rightArm"],
    ]) {
      R.bone("upper" + S, "chest", sg * 0.085 * s, -0.04 * s, -0.02 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.25 * s, 0.045 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.23 * s, -0.012 * s, part);
    }
    for (const [S, sg, part] of [
      ["HL", -1, "leftLeg"],
      ["HR", 1, "rightLeg"],
    ]) {
      R.bone("upper" + S, "hips", sg * 0.08 * s, -0.03 * s, 0.02 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.23 * s, -0.1 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.25 * s, 0.08 * s, part);
    }
    // bushy tail, carried low
    R.bone("tail1", "hips", 0, 0.03 * s, 0.13 * s, "torso");
    R.bone("tail2", "tail1", 0, -0.08 * s, 0.17 * s, "torso");
    R.bone("tail3", "tail2", 0, -0.07 * s, 0.15 * s, "torso");
    R.softJoint("spine", 0.06 * s, 0.16 * s, [0, 0, -1]);
    R.softJoint("chest", 0.06 * s, 0.16 * s, [0, 0, -1]);
    R.softJoint("neck", 0.04 * s, 0.1 * s);
    for (const S of ["FL", "FR", "HL", "HR"])
      R.softJoint("upper" + S, 0.03 * s, 0.07 * s, [0, -1, 0]);

    // ---- coat: coyote tan (or night grey) with a darker saddle, pale belly & throat,
    // mangy bare patches and old scars (rangy city scavengers)
    const base = dark
      ? rng.pick([0x7a7266, 0x6e685e])
      : rng.pick([0xa88a62, 0x9c7e58, 0xb0926a]);
    const saddle = L.col(dark ? 0x3a3630 : 0x5a4632),
      belly = L.col(dark ? 0x9a9488 : 0xd2c0a0),
      bare = L.col(0x8a6a5e);
    const ph = rng.range(0, 40);
    const fur = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (ny < -0.45) {
        mixTo(out, belly, 0.8);
        return;
      }
      if (wy > bh + 0.05 * s && ny > 0.35) mixTo(out, saddle, 0.45);
      if (L.noise3((wx * 20) / s, (wy * 20) / s, (wz * 20) / s) > 0.74) {
        out[0] *= 0.8;
        out[1] *= 0.76;
        out[2] *= 0.72;
      } // grizzle
      if (L.noise3((wx * 5) / s + ph, (wy * 5) / s, (wz * 5) / s) > 0.76)
        mixTo(out, bare, 0.7); // mange
      if (
        Math.abs(Math.sin(((wx + wz * 0.3) * 60) / s)) < 0.05 &&
        L.noise3((wx * 3) / s, (wy * 3) / s + ph, (wz * 3) / s) > 0.6
      )
        mixTo(out, belly, 0.5); // scar lines
    };
    const coat = {
      color: base,
      region: "fur",
      rough: 0.9,
      noise: 0.16,
      paint: fur,
      grad: [0.88, 1.08],
    };
    // ---- body: lean coyote, deep chest, tucked waist
    R.addW(
      "hips",
      bodyZ([
        { z: 0.47 * s, rx: 0.06 * s, ry: 0.07 * s, oy: bh + 0.03 * s },
        { z: 0.41 * s, rx: 0.1 * s, ry: 0.12 * s, oy: bh + 0.02 * s },
        { z: 0.26 * s, rx: 0.11 * s, ry: 0.13 * s, oy: bh + 0.02 * s },
        { z: 0.1 * s, rx: 0.095 * s, ry: 0.11 * s, oy: bh + 0.03 * s },
      ]),
      coat,
    );
    R.addW(
      "spine",
      bodyZ([
        { z: 0.14 * s, rx: 0.095 * s, ry: 0.11 * s, oy: bh + 0.03 * s },
        { z: -0.05 * s, rx: 0.1 * s, ry: 0.12 * s, oy: bh + 0.02 * s },
        { z: -0.18 * s, rx: 0.12 * s, ry: 0.16 * s, oy: bh - 0.005 * s },
      ]),
      coat,
    );
    R.addW(
      "chest",
      bodyZ([
        { z: -0.14 * s, rx: 0.12 * s, ry: 0.16 * s, oy: bh - 0.005 * s },
        { z: -0.3 * s, rx: 0.13 * s, ry: 0.19 * s, oy: bh - 0.02 * s },
        { z: -0.41 * s, rx: 0.115 * s, ry: 0.17 * s, oy: bh + 0.02 * s },
        { z: -0.49 * s, rx: 0.07 * s, ry: 0.1 * s, oy: bh + 0.07 * s },
      ]),
      coat,
    );
    // ruff of rough fur over the shoulders
    R.addW(
      "chest",
      P.xf(
        P.sphere(0.11 * s, 0.075 * s, 0.12 * s, 12, 8),
        0,
        bh + 0.07 * s,
        -0.36 * s,
      ),
      Object.assign({}, coat, { color: L.shade(base, 0.9) }),
    );
    // ---- neck & head: narrow pointed muzzle, big upright ears, amber eyes
    const nw = R.world("neck"),
      hw = R.world("head"),
      jw = R.world("jaw");
    R.addW(
      "neck",
      P.xf(
        P.limb(0.22 * s, 0.07 * s, 0.09 * s, { seg: 12 }),
        nw[0],
        nw[1] + 0.17 * s,
        nw[2] - 0.08 * s,
        -0.8,
        0,
        0,
      ),
      coat,
    );
    const headM = Object.assign({}, coat, {
      paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
        if (ny < -0.2) mixTo(out, belly, 0.6);
      },
    });
    const sk = P.sphere(1, 1, 1, 14, 10);
    P.deform(sk, (v) => {
      let x = v.x * 0.075,
        y = v.y * 0.07,
        z = v.z * 0.1;
      if (v.y > 0.4) y *= 0.9;
      v.set(x * s, y * s + 0.01 * s, z * s - 0.02 * s);
    });
    R.addW("head", P.xf(sk, hw[0], hw[1], hw[2]), headM);
    const mz = P.limb(0.13 * s, 0.042 * s, 0.018 * s, { seg: 10, flat: 0.8 });
    mz.rotateX(PI / 2 + 0.12);
    R.addW("head", P.xf(mz, hw[0], hw[1] - 0.008 * s, hw[2] - 0.09 * s), headM);
    R.addW(
      "head",
      P.xf(
        P.sphere(0.015 * s, 0.012 * s, 0.013 * s, 8, 6),
        hw[0],
        hw[1] - 0.008 * s,
        hw[2] - 0.225 * s,
      ),
      { color: 0x151210, rough: 0.3, noise: 0.05 },
    );
    const eyeM = {
      color: dark ? 0xd8b030 : 0xd8a028,
      rough: 0.08,
      noise: 0,
      emis: 0.3,
      keepLod: true,
    };
    const toothM = {
      color: 0xe8e0c8,
      rough: 0.3,
      noise: 0.05,
      grad: [0.9, 1.05],
    };
    for (const sg of [-1, 1]) {
      R.addW(
        "head",
        P.xf(
          P.sphere(0.013 * s, 0.011 * s, 0.012 * s, 8, 6),
          hw[0] + sg * 0.042 * s,
          hw[1] + 0.025 * s,
          hw[2] - 0.085 * s,
          0,
          sg * 0.4,
          0,
        ),
        eyeM,
      );
      claw(
        R,
        "head",
        [
          [sg * 0.018 * s, -0.022 * s, -0.19 * s],
          [sg * 0.019 * s, -0.04 * s, -0.185 * s],
        ],
        0.005 * s,
        toothM,
        4,
      ); // canines
      const ear = P.cone(0.032 * s, 0.09 * s, 6);
      ear.scale(1, 1, 0.4);
      R.add(
        "ear" + (sg < 0 ? "L" : "R"),
        P.xf(ear, sg * 0.006 * s, 0.04 * s, 0.0, 0.15, 0, -sg * 0.2),
        Object.assign({}, coat, { paint: null, color: L.shade(base, 0.8) }),
      );
    }
    const lj = P.limb(0.13 * s, 0.03 * s, 0.014 * s, { seg: 8, flat: 0.6 });
    lj.rotateX(PI / 2 + 0.04);
    R.addW(
      "jaw",
      P.xf(lj, jw[0], jw[1], jw[2] - 0.02 * s),
      Object.assign({}, headM, { paint: null, color: L.shade(base, 0.85) }),
    );
    // ---- legs: long & lean, dark socks
    for (const S of ["FL", "FR", "HL", "HR"]) {
      const front = S[0] === "F";
      const up = R.bones[R.map["lower" + S]].pos,
        lo = R.bones[R.map["paw" + S]].pos;
      seg(R, "upper" + S, up, (front ? 0.05 : 0.07) * s, 0.034 * s, coat, {
        bulge: front ? 0.004 * s : 0.018 * s,
      });
      seg(
        R,
        "lower" + S,
        lo,
        0.03 * s,
        0.022 * s,
        Object.assign({}, coat, { color: L.shade(base, 0.8) }),
      );
      R.add(
        "paw" + S,
        P.xf(
          P.sphere(0.03 * s, 0.024 * s, 0.042 * s, 8, 6),
          0,
          -0.018 * s,
          -0.02 * s,
        ),
        Object.assign({}, coat, { color: L.shade(base, 0.55), paint: null }),
      );
      for (let i = -1; i <= 1; i++)
        claw(
          R,
          "paw" + S,
          [
            [i * 0.012 * s, -0.025 * s, -0.052 * s],
            [i * 0.014 * s, -0.04 * s, -0.07 * s],
          ],
          0.004 * s,
          { color: 0x1a1612, rough: 0.4 },
          4,
        );
    }
    // ---- bushy tail with a dark tip
    const tp = (b) => R.bones[R.map[b]].pos;
    seg(R, "tail1", tp("tail2"), 0.045 * s, 0.06 * s, coat, {
      bulge: 0.01 * s,
    });
    seg(R, "tail2", tp("tail3"), 0.06 * s, 0.05 * s, coat);
    R.add(
      "tail3",
      P.xf(
        P.sphere(0.045 * s, 0.11 * s, 0.045 * s, 8, 6),
        0,
        -0.06 * s,
        0.05 * s,
        -0.5,
        0,
        0,
      ),
      Object.assign({}, coat, { paint: null, color: L.shade(base, 0.45) }),
    );
    // ---- hit volumes, markers, sockets
    R.hitVol("head", "head", [0, 0.01 * s, 0], [0, 0, -0.22 * s], 0.07 * s);
    R.hitVol(
      "torso",
      "hips",
      [0, 0.02 * s, 0.14 * s],
      [0, 0.02 * s, -0.12 * s],
      0.13 * s,
    );
    R.hitVol("torso", "chest", [0, 0, 0.1 * s], [0, 0, -0.22 * s], 0.16 * s);
    for (const [S, part] of [
      ["FL", "leftArm"],
      ["FR", "rightArm"],
      ["HL", "leftLeg"],
      ["HR", "rightLeg"],
    ]) {
      R.hitVol(part, "upper" + S, [0, 0, 0], tp("lower" + S), 0.05 * s);
      R.hitVol(part, "lower" + S, [0, 0, 0], tp("paw" + S), 0.035 * s);
    }
    R.marker("head", "head", 0, 0.01 * s, -0.08 * s, 0.08 * s);
    R.marker("torso", "spine", 0, 0, 0, 0.18 * s);
    R.marker("leftArm", "upperFL", 0, -0.16 * s, 0, 0.06 * s);
    R.marker("rightArm", "upperFR", 0, -0.16 * s, 0, 0.06 * s);
    R.marker("leftLeg", "upperHL", 0, -0.16 * s, 0, 0.06 * s);
    R.marker("rightLeg", "upperHR", 0, -0.16 * s, 0, 0.06 * s);
    R.socket("eyes", "head", 0, 0.03 * s, -0.08 * s);
    R.socket("mouth", "jaw", 0, 0, -0.14 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.13 * s,
      height: 0.9 * s,
      hipH: bh,
      dirt: [0.2, 0.5],
      cut: {
        head: "head",
        leftArm: "lowerFL",
        rightArm: "lowerFR",
        leftLeg: "lowerHL",
        rightLeg: "lowerHR",
      },
      style: { wag: false, pant: true, tailUp: -0.25, stride: 1.05 },
    });
    return tpl;
  }
  L.infos.coyote = {
    kind: "quad",
    height: 0.95,
    radius: 0.5,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: QLBL,
    gait: { walkStep: 0.5, runStep: 1.35, walkSpeed: 1.6, runSpeed: 8.6 },
    style: { stride: 1.05, wag: false, pant: true, tailUp: -0.25 },
    variants: 4,
    build: buildCoyote,
  };

  // ==================================================================
  // STAG
  // ==================================================================
  function buildStag(opts, seed) {
    const rng = L.rng(seed);
    const s = (opts.scale || 1) * rng.range(0.93, 1.07);
    const R = new L.Rig("quad");
    const bh = 1.0 * s;
    R.bone("hips", null, 0, bh, 0.45 * s, "torso");
    R.bone("spine", "hips", 0, 0.02 * s, -0.42 * s, "torso");
    R.bone("chest", "spine", 0, 0.03 * s, -0.42 * s, "torso");
    // one long neck rising up & forward from the withers
    R.bone("neck", "chest", 0, 0.2 * s, -0.26 * s, "head");
    R.bone("head", "neck", 0, 0.38 * s, -0.17 * s, "head");
    R.bone("jaw", "head", 0, -0.04 * s, -0.07 * s, "head");
    R.bone("earL", "head", -0.06 * s, 0.06 * s, 0.02 * s, "head");
    R.bone("earR", "head", 0.06 * s, 0.06 * s, 0.02 * s, "head");
    for (const [S, sg, part] of [
      ["FL", -1, "leftArm"],
      ["FR", 1, "rightArm"],
    ]) {
      R.bone("upper" + S, "chest", sg * 0.16 * s, -0.1 * s, -0.08 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.38 * s, 0.035 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.44 * s, -0.01 * s, part);
    }
    for (const [S, sg, part] of [
      ["HL", -1, "leftLeg"],
      ["HR", 1, "rightLeg"],
    ]) {
      R.bone("upper" + S, "hips", sg * 0.15 * s, -0.08 * s, 0.14 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.38 * s, -0.13 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.46 * s, 0.11 * s, part);
    }
    R.bone("tail1", "hips", 0, 0.12 * s, 0.33 * s, "torso");
    R.bone("tail2", "tail1", 0, -0.05 * s, 0.05 * s, "torso");
    R.bone("tail3", "tail2", 0, -0.04 * s, 0.03 * s, "torso");
    R.softJoint("spine", 0.1 * s, 0.34 * s, [0, 0, -1]);
    R.softJoint("chest", 0.1 * s, 0.34 * s, [0, 0, -1]);
    R.softJoint("neck", 0.06 * s, 0.14 * s);
    for (const S of ["FL", "FR", "HL", "HR"]) {
      R.softJoint("upper" + S, 0.05 * s, 0.13 * s, [0, -1, 0]);
      R.softJoint("lower" + S, 0.03 * s, 0.06 * s, [0, -1, 0]);
    }

    // ---- hide: red-brown, white belly & rump flag, mangy bare patches, healed burn scars
    const hideC = rng.pick([0x7a5234, 0x86603c, 0x6e4a30]);
    const white = L.col(0xd8ccb4),
      bare = L.col(0xb08270),
      dark = L.col(0x3a2818);
    const ph = rng.range(0, 40);
    const hide = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (ny < -0.5 || (wz > 0.72 * s && wy > bh - 0.05 * s && nz > 0.3)) {
        mixTo(out, white, 0.8);
        return;
      } // belly, rump flag
      if (wy > bh + 0.18 * s && ny > 0.5) mixTo(out, dark, 0.35); // dorsal stripe
      const m =
        L.noise3((wx * 5) / s + ph, (wy * 5) / s, (wz * 5) / s) * 0.7 +
        L.noise3((wx * 17) / s, (wy * 17) / s + ph, (wz * 17) / s) * 0.3;
      if (m > 0.62) mixTo(out, bare, sm(0.62, 0.68, m)); // mange
      if (L.noise3((wx * 6) / s + 5, (wy * 6) / s, (wz * 6) / s + ph) > 0.78)
        mixTo(out, white, 0.45); // pale scar tissue
    };
    const skin = {
      color: hideC,
      region: "fur",
      rough: 0.85,
      noise: 0.14,
      paint: hide,
      grad: [0.82, 1.06],
    };
    // ---- body: slim barrel, high withers, tucked flank, round rump
    R.addW(
      "hips",
      bodyZ([
        { z: 0.86 * s, rx: 0.1 * s, ry: 0.14 * s, oy: bh + 0.1 * s },
        { z: 0.78 * s, rx: 0.21 * s, ry: 0.25 * s, oy: bh + 0.07 * s },
        { z: 0.6 * s, rx: 0.25 * s, ry: 0.28 * s, oy: bh + 0.05 * s },
        { z: 0.38 * s, rx: 0.24 * s, ry: 0.27 * s, oy: bh + 0.04 * s },
      ]),
      skin,
    );
    R.addW(
      "spine",
      bodyZ([
        { z: 0.42 * s, rx: 0.24 * s, ry: 0.27 * s, oy: bh + 0.04 * s },
        { z: 0.08 * s, rx: 0.26 * s, ry: 0.3 * s, oy: bh + 0.02 * s },
        { z: -0.25 * s, rx: 0.26 * s, ry: 0.33 * s, oy: bh + 0.03 * s },
      ]),
      skin,
    );
    R.addW(
      "chest",
      bodyZ([
        { z: -0.2 * s, rx: 0.26 * s, ry: 0.33 * s, oy: bh + 0.03 * s },
        { z: -0.45 * s, rx: 0.25 * s, ry: 0.34 * s, oy: bh + 0.05 * s },
        { z: -0.62 * s, rx: 0.2 * s, ry: 0.28 * s, oy: bh + 0.08 * s },
        { z: -0.72 * s, rx: 0.1 * s, ry: 0.15 * s, oy: bh + 0.14 * s },
      ]),
      skin,
    );
    R.addW(
      "chest",
      P.xf(
        P.sphere(0.17 * s, 0.1 * s, 0.24 * s, 12, 8),
        0,
        bh + 0.28 * s,
        -0.42 * s,
      ),
      skin,
    ); // withers
    // ---- neck & head (one antler often snapped short)
    const antlerM = {
      color: 0xc8b490,
      rough: 0.6,
      noise: 0.14,
      grad: [0.55, 1.1],
    };
    const broken = rng.chance(0.4) ? (rng.chance(0.5) ? -1 : 1) : 0;
    for (const [N, Hd, J, sg, k] of [["neck", "head", "jaw", -1, 1]]) {
      const hp = R.bones[R.map[Hd]].pos;
      seg(R, N, hp, 0.12 * s * k, 0.075 * s * k, skin, { bulge: 0.012 * s });
      R.add(
        N,
        P.xf(
          P.sphere(0.14 * s, 0.14 * s, 0.14 * s, 10, 8),
          0,
          -0.02 * s,
          0.04 * s,
        ),
        skin,
      );
      // long deer skull tapering into a fine muzzle
      const hd = P.sphere(1, 1, 1, 14, 10);
      P.deform(hd, (v) => {
        let x = v.x * 0.075,
          y = v.y * 0.075,
          z = v.z * 0.16;
        if (v.z < 0) {
          const t = -v.z;
          x *= lerp(1, 0.55, t);
          y *= lerp(1, 0.66, t);
        }
        v.set(x * s * k, (y + 0.015) * s * k, (z - 0.09) * s * k);
      });
      const headT = Object.assign({}, skin, {
        paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
          hide(x, y, z, nx, ny, nz, out, wx, wy, wz);
          if (z < -0.19 * s * k) mixTo(out, dark, 0.6);
          if (ny < -0.4) mixTo(out, white, 0.5);
        },
      });
      R.add(Hd, hd, headT);
      R.add(
        Hd,
        P.xf(
          P.sphere(0.024 * s * k, 0.018 * s * k, 0.016 * s * k, 8, 6),
          0,
          0.0,
          -0.245 * s * k,
        ),
        { color: 0x151210, rough: 0.25, noise: 0.05 },
      ); // wet nose
      for (const n of [-1, 1]) {
        R.add(
          Hd,
          P.xf(
            P.sphere(0.017 * s * k, 0.019 * s * k, 0.015 * s * k, 8, 6),
            n * 0.058 * s * k,
            0.04 * s * k,
            -0.1 * s * k,
          ),
          { color: 0x0a0806, rough: 0.08, metal: 0.1 },
        ); // big dark eyes
        // ANTLERS: main beam out, up & back, then forward; brow tine + two upper tines
        const b0 = [n * 0.04 * s * k, 0.075 * s * k, -0.04 * s * k];
        const beam = [
          b0,
          [n * 0.11 * s * k, 0.17 * s * k, 0.0],
          [n * 0.17 * s * k, 0.29 * s * k, 0.02 * s * k],
          [n * 0.17 * s * k, 0.42 * s * k, -0.04 * s * k],
          [n * 0.13 * s * k, 0.52 * s * k, -0.12 * s * k],
        ];
        if (n === broken) {
          claw(R, Hd, beam.slice(0, 3), 0.022 * s * k, antlerM, 6);
          continue;
        } // snapped beam
        claw(R, Hd, beam, 0.02 * s * k, antlerM, 6);
        claw(
          R,
          Hd,
          [
            [n * 0.08 * s * k, 0.12 * s * k, -0.02 * s * k],
            [n * 0.1 * s * k, 0.16 * s * k, -0.11 * s * k],
            [n * 0.09 * s * k, 0.21 * s * k, -0.16 * s * k],
          ],
          0.012 * s * k,
          antlerM,
          5,
        );
        claw(
          R,
          Hd,
          [
            [n * 0.16 * s * k, 0.27 * s * k, 0.02 * s * k],
            [n * 0.2 * s * k, 0.36 * s * k, -0.02 * s * k],
            [n * 0.23 * s * k, 0.44 * s * k, -0.02 * s * k],
          ],
          0.011 * s * k,
          antlerM,
          5,
        );
        claw(
          R,
          Hd,
          [
            [n * 0.17 * s * k, 0.38 * s * k, -0.02 * s * k],
            [n * 0.2 * s * k, 0.45 * s * k, 0.05 * s * k],
            [n * 0.2 * s * k, 0.52 * s * k, 0.08 * s * k],
          ],
          0.009 * s * k,
          antlerM,
          5,
        );
      }
      R.add(
        J,
        P.xf(
          P.sphere(0.04 * s * k, 0.022 * s * k, 0.1 * s * k, 8, 6),
          0,
          -0.012 * s * k,
          -0.1 * s * k,
          0.08,
          0,
          0,
        ),
        Object.assign({}, skin, { paint: null, color: L.shade(hideC, 0.8) }),
      );
      void sg;
    }
    // ears on bones
    for (const [E, n] of [
      ["earL", -1],
      ["earR", 1],
    ])
      R.add(
        E,
        P.xf(
          P.sphere(0.07 * s, 0.022 * s, 0.045 * s, 8, 5),
          n * 0.03 * s,
          0.01 * s,
          0.01 * s,
          0,
          n * 0.4,
          -n * 0.6,
        ),
        Object.assign({}, skin, { paint: null, color: L.shade(hideC, 0.9) }),
      );
    // ---- legs: long, thin, knobbly joints, small cloven hooves
    const legM = Object.assign({}, skin, { grad: [0.7, 1.0] });
    const hoofM = {
      color: 0x1c1814,
      rough: 0.45,
      noise: 0.1,
      grad: [0.8, 1.1],
    };
    for (const S of ["FL", "FR", "HL", "HR"]) {
      const front = S[0] === "F";
      const lo = R.bones[R.map["lower" + S]].pos,
        pw = R.bones[R.map["paw" + S]].pos;
      seg(R, "upper" + S, lo, (front ? 0.1 : 0.14) * s, 0.055 * s, legM, {
        bulge: front ? 0.01 * s : 0.03 * s,
      });
      R.add(
        "lower" + S,
        P.xf(P.sphere(0.045 * s, 0.045 * s, 0.045 * s, 8, 6), 0, 0, 0),
        legM,
      );
      seg(R, "lower" + S, pw, 0.036 * s, 0.028 * s, legM);
      R.add(
        "paw" + S,
        P.xf(P.sphere(0.032 * s, 0.03 * s, 0.032 * s, 8, 6), 0, 0.012 * s, 0),
        legM,
      );
      for (const n of [-1, 1])
        R.add(
          "paw" + S,
          P.xf(
            P.cyl(0.014 * s, 0.022 * s, 0.07 * s, 7),
            n * 0.014 * s,
            -0.018 * s,
            -0.012 * s,
            -0.25,
            0,
            0,
          ),
          hoofM,
        );
    }
    // ---- short tail, white underside
    seg(R, "tail1", R.bones[R.map.tail2].pos, 0.04 * s, 0.035 * s, skin);
    R.add(
      "tail2",
      P.xf(
        P.sphere(0.035 * s, 0.06 * s, 0.025 * s, 7, 6),
        0,
        -0.03 * s,
        0.01 * s,
      ),
      { color: 0xd8ccb4, region: "fur", rough: 0.95, noise: 0.15 },
    );
    // ---- hit volumes etc.
    R.hitVol("head", "head", [0, 0.02 * s, 0], [0, 0, -0.24 * s], 0.08 * s);
    R.hitVol("head", "neck", [0, 0, 0], R.bones[R.map.head].pos, 0.09 * s);
    R.hitVol(
      "torso",
      "hips",
      [0, 0.05 * s, 0.4 * s],
      [0, 0.03 * s, -0.2 * s],
      0.28 * s,
    );
    R.hitVol(
      "torso",
      "chest",
      [0, 0.05 * s, 0.2 * s],
      [0, 0.08 * s, -0.5 * s],
      0.3 * s,
    );
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
        0.07 * s,
      );
      R.hitVol(
        part,
        "lower" + S,
        [0, 0, 0],
        R.bones[R.map["paw" + S]].pos,
        0.04 * s,
      );
    }
    R.marker("head", "head", 0, 0.0, -0.1 * s, 0.1 * s);
    R.marker("torso", "spine", 0, 0.05 * s, 0, 0.3 * s);
    R.marker("leftArm", "upperFL", 0, -0.28 * s, 0, 0.07 * s);
    R.marker("rightArm", "upperFR", 0, -0.28 * s, 0, 0.07 * s);
    R.marker("leftLeg", "upperHL", 0, -0.28 * s, 0, 0.07 * s);
    R.marker("rightLeg", "upperHR", 0, -0.28 * s, 0, 0.07 * s);
    R.socket("eyes", "head", 0, 0.04 * s, -0.1 * s);
    R.socket("mouth", "jaw", 0, 0, -0.16 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.3 * s,
      height: 1.95 * s,
      hipH: bh,
      dirt: [0.2, 0.5],
      blood: [0, 0.08],
      cut: {
        head: "neck",
        leftArm: "lowerFL",
        rightArm: "lowerFR",
        leftLeg: "lowerHL",
        rightLeg: "lowerHR",
      },
      style: { wag: false, pant: false, tailUp: 0.1, stride: 0.9, graze: true },
    });
    return tpl;
  }
  L.infos.stag = {
    kind: "quad",
    height: 1.95,
    radius: 0.75,
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
    gait: { walkStep: 0.9, runStep: 2.1, walkSpeed: 1.5, runSpeed: 9.0 },
    style: { stride: 0.9, pant: false, wag: false, tailUp: 0.1, graze: true },
    variants: 4,
    build: buildStag,
  };

  // ==================================================================
  // CRAWLER — tunnel dwellers: knuckle-dragging, pallid, sore-covered
  // ==================================================================
  function buildTrog(opts, seed) {
    const rng = L.rng(seed);
    const gender = opts.gender || (rng.chance(0.25) ? "f" : "m");
    const b = H.proportions(gender, {
      scale: rng.range(0.9, 0.98),
      thin: true,
      muscle: 0.15,
    });
    const R = new L.Rig("biped");
    H.skeleton(R, b);
    const skin = rng.pick([0x8c7c72, 0x86766e, 0x928076, 0x7e7068]);
    const vein = L.col(0x5a3a52),
      sore = L.col(0x7a2a22),
      pale = L.col(0xd0c0b0);
    const ph = rng.range(0, 30);
    const trogPaint = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const n =
        L.noise3(wx * 5 + ph, wy * 5, wz * 5) * 0.6 +
        L.noise3(wx * 13, wy * 13 + ph, wz * 13) * 0.4;
      if (n > 0.56)
        mixTo(out, pale, Math.min(0.6, (n - 0.56) * 2.2)); // blotchy pallor
      else if (n < 0.4) {
        out[0] *= 0.86;
        out[1] *= 0.8;
        out[2] *= 0.84;
      } // bruised, purplish mottling
      // filth: caked hands, feet & shins
      const low = 1 - sm(0.1, 0.55, wy);
      if (low > 0) {
        const k = low * 0.55;
        out[0] *= 1 - k * 0.5;
        out[1] *= 1 - k * 0.55;
        out[2] *= 1 - k * 0.6;
      }
      // purple vein network (ridged noise)
      const v = Math.abs(L.noise3(wx * 26 + ph, wy * 26, wz * 26) - 0.5);
      if (v < 0.02) mixTo(out, vein, ((0.02 - v) / 0.02) * 0.45);
      // weeping sores
      const s2 = L.noise3(wx * 17, wy * 17 + ph, wz * 17);
      if (s2 > 0.83) mixTo(out, sore, sm(0.83, 0.88, s2) * 0.8);
      if (ny < -0.4) {
        out[0] *= 0.85;
        out[1] *= 0.82;
        out[2] *= 0.82;
      }
    };
    const skinMat = (extra) =>
      Object.assign(
        {
          color: skin,
          region: "skin",
          rough: 0.55,
          noise: 0.18,
          grad: [0.85, 1.05],
          paint: trogPaint,
        },
        extra || {},
      );
    const ragM = M.cloth(rng.pick([0x4a3a2a, 0x3a3228, 0x5a4a38]), {
      region: "rags",
    });
    const look = {
      skin,
      topMat: skinMat(),
      abdomenMat: skinMat(),
      bottomMat: ragM,
      pantsMat: ragM,
    };
    // (H.body without its human skin paint: the crawler's sores & veins run down the limbs too)
    H.torso(R, b, look);
    H.neck(R, b, skinMat());
    for (const S of ["L", "R"]) {
      H.arm(R, b, S, {
        sleeve: "none",
        skin,
        skinPaint: trogPaint,
        skinRegion: "skin",
        mul: 1.04,
      });
      H.leg(R, b, S, {
        pantsMat: ragM,
        shorts: true,
        barefoot: true,
        boot: skin,
        bootH: 0,
        skin,
        skinPaint: trogPaint,
        skinRegion: "skin",
      });
    }
    // loincloth flaps front & back
    const rings = H.torsoRings(b);
    const hem = P.loft(H.scaleRings(rings.pelvis.slice(1, 4), 1.07), {
      seg: 16,
    });
    P.deform(hem, (v) => {
      if (v.y < 0) v.y += (L.hash3(v.x * 200, 1, v.z * 200) - 0.5) * 0.07;
    });
    R.add("hips", hem, ragM);
    for (const zs of [-1, 1])
      R.add(
        "hips",
        P.xf(
          P.box(0.14 * b.s, 0.2 * b.s, 0.01 * b.s, 0.004 * b.s),
          0,
          -0.2 * b.s,
          zs * 0.105 * b.s,
          zs * 0.08,
          0,
          0,
        ),
        ragM,
      );
    // lumpy growths over the shoulders, spine & one arm
    for (let i = 0; i < 9; i++) {
      const bone = rng.pick(["chest", "chest", "spine", "armL", "armR"]);
      const r = rng.range(0.018, 0.04) * b.s;
      const a = rng.range(-2.4, 2.4),
        y =
          bone === "chest"
            ? rng.range(0.08, 0.22) * b.s
            : bone === "spine"
              ? rng.range(0.02, 0.14) * b.s
              : -rng.range(0.05, 0.2) * b.s;
      const rr = bone.startsWith("arm") ? 0.045 * b.s : 0.13 * b.s;
      R.add(
        bone,
        P.xf(
          P.sphere(r, r * 0.8, r, 7, 5),
          Math.sin(a) * rr,
          y,
          Math.cos(a) * rr * 0.8 + (bone.startsWith("arm") ? 0 : 0.01 * b.s),
        ),
        skinMat({ color: L.shade(skin, 1.08) }),
      );
    }
    // knobbly spine ridge down the hunched back
    for (let i = 0; i < 6; i++)
      R.add(
        i < 3 ? "chest" : "spine",
        P.xf(
          P.sphere(0.014 * b.s, 0.012 * b.s, 0.012 * b.s, 6, 4),
          0,
          (i < 3 ? 0.2 - i * 0.07 : 0.14 - (i - 3) * 0.06) * b.s,
          0.115 * b.s,
        ),
        skinMat(),
      );
    // long broken nails, gnarled toes
    for (const S of ["L", "R"]) {
      const sg = S === "L" ? -1 : 1;
      for (let i = 0; i < 4; i++)
        claw(
          R,
          "hand" + S,
          [
            [-sg * 0.03 * b.s, -0.13 * b.s, (i - 1.5) * 0.018 * b.s],
            [-sg * 0.045 * b.s, -0.165 * b.s, (i - 1.5) * 0.02 * b.s],
          ],
          0.0045 * b.s,
          { color: 0x4a3a28, rough: 0.6 },
        );
    }
    for (const S of ["L", "R"])
      for (let i = 0; i < 4; i++)
        R.add(
          "foot" + S,
          P.xf(
            P.sphere(0.013 * b.s, 0.011 * b.s, 0.02 * b.s, 6, 5),
            (i - 1.5) * 0.022 * b.s,
            -b.ankle + 0.011 * b.s,
            -0.19 * b.s,
          ),
          skinMat(),
        );
    H.head(R, b, {
      skin,
      gender,
      maniac: true,
      hair: rng.chance(0.25) ? "patchy" : "bald",
      hairColor: 0x2a2420,
      jawW: 0.92,
      noseSize: 1.2,
      mood: "maniac",
      seed: ((seed >>> 0) % 1000003) + 11,
      skinPaint: trogPaint,
    });
    const tpl = R.build();
    tpl.meta.bodyThick = 0.11;
    return tpl;
  }
  L.infos.crawler = {
    kind: "biped",
    height: 1.5,
    radius: 0.34,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: LBL,
    gait: { walkStep: 0.6, runStep: 1.35, walkSpeed: 1.4, runSpeed: 6.6 },
    // knuckle-dragging crouch: deep hunch, bent knees, long arms hanging forward
    style: {
      hunch: 1.15,
      neckK: 0.5,
      crouch: 0.5,
      shrug: 0.2,
      wild: true,
      claws: true,
      armFwd: 0.7,
      elbow: 0.45,
      armOut: 0.22,
      stride: 0.95,
      armSwing: 1.3,
      lookLimit: 1.4,
    },
    variants: 5,
    build: buildTrog,
  };

  // ==================================================================
  // SANDHOG — tunnel workers: rubber slicker or canvas coveralls,
  // half-face respirator, safety goggles, miner's helmet with a lit headlamp
  // ==================================================================
  function buildSandhog(opts, seed) {
    const rng = L.rng(seed);
    const b = H.proportions("m", { scale: rng.range(0.96, 1.04), muscle: 0.1 });
    const R = new L.Rig("biped");
    H.skeleton(R, b);
    const skin = L.shade(L.SKIN[rng.pick(Object.keys(L.SKIN))], 0.86); // ordinary skin, dimmed by tunnel grime
    const slicker = rng.chance(0.4);
    const canvas = slicker
      ? rng.pick([0x2e2c28, 0x3a3a30, 0x8a6a1e])
      : rng.pick([0x6a5e44, 0x5e5a48, 0x72643e]);
    const grime = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const n = L.noise3(wx * 6, wy * 6, wz * 6);
      const low = 1 - sm(0.2, 0.9, wy); // caked mud up the legs
      const k = clamp(low * 0.7 + (n > 0.6 ? 0.35 : 0), 0, 0.8);
      out[0] = lerp(out[0], out[0] * 0.55, k);
      out[1] = lerp(out[1], out[1] * 0.52, k);
      out[2] = lerp(out[2], out[2] * 0.48, k);
      if (L.noise3(wx * 23, wy * 23 + 3, wz * 23) > 0.8) {
        out[0] *= 0.7;
        out[1] *= 0.66;
        out[2] *= 0.6;
      } // oil & soot
    };
    const look = {
      skin,
      top: canvas,
      bottom: canvas,
      topRegion: slicker ? "rubber" : "cloth",
      bottomRegion: slicker ? "rubber" : "cloth",
      paintTop: grime,
      paintBottom: grime,
      sleeve: "long",
      cuff: L.shade(canvas, 0.8),
      glove: 0x2e241a,
      boot: 0x241c16,
      bootH: 0.36,
      laces: true,
    };
    H.body(R, b, look);
    H.belt(R, b, 0x2a1e14, 0x8a8070, 3);
    const rings = H.torsoRings(b);
    // coverall bib + shoulder straps
    R.add(
      "chest",
      P.loft(H.scaleRings(rings.chest.slice(0, 3), 1.035), {
        seg: 10,
        a0: -PI * 0.3,
        a1: PI * 0.3,
      }),
      M.cloth(L.shade(canvas, 0.85), { paint: grime }),
    );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.035 * b.s, 0.3 * b.s, 0.24 * b.s, 0.01 * b.s),
          sg * 0.085 * b.s,
          0.14 * b.s,
          0.005 * b.s,
        ),
        M.leather(0x2a1e14),
      );
    // tool roll & a coil of fuse cord on the back
    const cz = rings.chest[2].rz + 0.04 * b.s;
    R.add(
      "chest",
      P.xf(
        P.cyl(0.05 * b.s, 0.05 * b.s, 0.3 * b.s, 10),
        0,
        0.18 * b.s,
        cz,
        0,
        0,
        PI / 2,
      ),
      M.cloth(0x5a4a34, { region: "rags" }),
    );
    R.add(
      "chest",
      P.xf(
        P.torus(0.07 * b.s, 0.012 * b.s, 5, 14),
        0.02 * b.s,
        0.02 * b.s,
        cz + 0.01 * b.s,
      ),
      { color: 0x3a2a1e, region: "rubber", rough: 0.8 },
    );
    // knee & elbow pads
    for (const S of ["L", "R"]) {
      R.add(
        "shin" + S,
        P.xf(
          P.sphere(
            0.055 * b.s,
            0.065 * b.s,
            0.03 * b.s,
            10,
            6,
            0,
            PI * 2,
            0,
            PI * 0.6,
          ),
          0,
          0.02 * b.s,
          -0.05 * b.s,
          -PI / 2,
          0,
          0,
        ),
        M.leather(0x3a2c1e),
      );
      R.add(
        "forearm" + S,
        P.xf(
          P.sphere(
            0.04 * b.s,
            0.05 * b.s,
            0.03 * b.s,
            10,
            6,
            0,
            PI * 2,
            0,
            PI * 0.6,
          ),
          0,
          0.01 * b.s,
          0.035 * b.s,
          PI / 2,
          0,
          0,
        ),
        M.leather(0x3a2c1e),
      );
    }
    H.head(R, b, {
      skin,
      gender: "m",
      hair: "bald",
      jawW: 0.82,
      seed: ((seed >>> 0) % 1000003) + 29,
    });
    H.mask(R, b, "respirator");
    H.glasses(R, b, "goggles");
    // hard hat (dented, filthy) + HEADLAMP with a glowing lens
    const hs = b.headS,
      C = [0, 0.105 * hs, -0.01 * hs];
    H.hat(R, b, "hardhat", rng.pick([0xa08028, 0x8a7a50, 0x9a6a28]));
    const top = C[1] + 0.07 * hs;
    R.add(
      "head",
      P.xf(
        P.cyl(0.028 * hs, 0.032 * hs, 0.05 * hs, 12),
        0,
        top + 0.005 * hs,
        C[2] - 0.108 * hs,
        PI / 2 - 0.15,
        0,
        0,
      ),
      M.metal(0x3a3a34, { rough: 0.5 }),
    );
    R.add(
      "head",
      P.xf(
        P.cyl(0.026 * hs, 0.026 * hs, 0.006 * hs, 12),
        0,
        top + 0.001 * hs,
        C[2] - 0.134 * hs,
        PI / 2 - 0.15,
        0,
        0,
      ),
      {
        color: 0xfff0b0,
        emis: 2.2,
        rough: 0.1,
        keepLod: true,
        rigid: true,
        cls: 0,
      },
    );
    R.add(
      "head",
      P.xf(
        P.box(0.03 * hs, 0.012 * hs, 0.02 * hs, 0.003 * hs),
        0,
        top + 0.025 * hs,
        C[2] - 0.095 * hs,
      ),
      M.metal(0x2a2a26),
    );
    R.socket("lamp", "head", 0, top + 0.001 * hs, C[2] - 0.14 * hs);
    const tpl = R.build();
    tpl.meta.bodyThick = 0.13;
    return tpl;
  }
  L.infos.sandhog = {
    kind: "biped",
    height: 1.8,
    radius: 0.34,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: LBL,
    gait: { walkStep: 0.7, runStep: 1.25, walkSpeed: 1.5, runSpeed: 4.8 },
    style: {
      hunch: 0.28,
      shrug: 0.06,
      armOut: 0.12,
      stride: 0.95,
      armSwing: 0.9,
    },
    variants: 4,
    build: buildSandhog,
  };
})();
