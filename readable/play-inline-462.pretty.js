/* src/characters/32_creatures2.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: more city wildlife
 * Owned by: characters.
 *
 *  stinger (variant 'bark' small | normal | 'giant'), giant_stinger,
 *  small_stinger: a giant wasp-like arthropod with raptorial scythe arms
 *  and a whip tail ending in a needle sting.
 *  giant_ant (variant 'fire' → fire_ant: glowing thorax/gaster, spits fire),
 *  ash_bear (ash-caked, burn-scarred bear with ember eyes), lurcher (a tall
 *  emaciated knuckle-walker with an eyeless skull and a round lamprey mouth;
 *  spits bile).
 *
 * Part labels: stinger Head / Left Scythe / Right Scythe / Tail / Legs; ant
 * Head / Thorax / Left Antenna / Right Antenna / Legs; bear & lurcher
 * Head / Torso / four limbs.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !G.chars || !G.chars._lib || !G.chars._lib.creatureKit) return;
  const L = G.chars._lib,
    H = L.human,
    P = L.prim,
    M = H.mat;
  const K = L.creatureKit,
    seg = K.seg,
    claw = K.claw,
    bodyZ = K.bodyZ;
  const lerp = L.lerp,
    clamp = L.clamp,
    PI = Math.PI;
  const sm = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  // ==================================================================
  // STINGER — a giant wasp-like arthropod on eight legs: banded ochre &
  // black, a pinched waist, folded smoky wings over a segmented abdomen,
  // two RAPTORIAL front arms (spined forearm + folding scythe) and a long
  // whip-thin tail arched over the back ending in a needle sting.
  // ==================================================================
  const SCORP_V = {
    bark: { s: 0.55, col: 0xb8a060, joint: 0x2a2218 },
    normal: { s: 1, col: 0xa88a40, joint: 0x221c14 },
    giant: { s: 1.65, col: 0x8a6a2a, joint: 0x1a140e },
  };
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
  L.infos.fire_ant = Object.assign({}, ANT_INFO, {
    style: { ranged: true, fireAnt: true },
    build: (o, sd) => buildAnt(Object.assign({}, o, { variant: "fire" }), sd),
  });

  // ==================================================================
  // ASH BEAR — a big bear coated in grey ash and soot: burn-scarred bald
  // patches, charred bony growths along the spine, ember-orange eyes
  // ==================================================================
  function buildAshBear(opts, seed) {
    const rng = L.rng(seed);
    const s = (opts.scale || 1) * rng.range(0.95, 1.08);
    const R = new L.Rig("quad");
    const bh = 0.8 * s;
    R.bone("hips", null, 0, bh, 0.42 * s, "torso");
    R.bone("spine", "hips", 0, 0.04 * s, -0.4 * s, "torso");
    R.bone("chest", "spine", 0, 0.05 * s, -0.4 * s, "torso");
    R.bone("neck", "chest", 0, 0.0, -0.26 * s, "head");
    R.bone("head", "neck", 0, -0.02 * s, -0.2 * s, "head");
    R.bone("jaw", "head", 0, -0.07 * s, -0.08 * s, "head");
    R.bone("earL", "head", -0.1 * s, 0.1 * s, 0.03 * s, "head");
    R.bone("earR", "head", 0.1 * s, 0.1 * s, 0.03 * s, "head");
    for (const [S, sg, part] of [
      ["FL", -1, "leftArm"],
      ["FR", 1, "rightArm"],
    ]) {
      R.bone("upper" + S, "chest", sg * 0.17 * s, -0.12 * s, -0.04 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.34 * s, 0.03 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.3 * s, -0.01 * s, part);
    }
    for (const [S, sg, part] of [
      ["HL", -1, "leftLeg"],
      ["HR", 1, "rightLeg"],
    ]) {
      R.bone("upper" + S, "hips", sg * 0.16 * s, -0.06 * s, 0.05 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.33 * s, -0.1 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.3 * s, 0.07 * s, part);
    }
    R.bone("tail1", "hips", 0, 0.02 * s, 0.2 * s, "torso");
    R.bone("tail2", "tail1", 0, -0.03 * s, 0.06 * s, "torso");
    R.bone("tail3", "tail2", 0, -0.03 * s, 0.04 * s, "torso");
    const furC = rng.pick([0x9a948c, 0x8a857e, 0xa49e94, 0x7e7a74]);
    const skinC = 0x6a5a56,
      soot = L.col(0x1e1c1a),
      ash = L.col(0xb8b4ae);
    // ash-caked fur: pale ash on the back & shoulders, soot-black legs and face,
    // bald burn-scarred patches (glossy, pinkish-grey) with charred rims
    const mange = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const n = L.noise3((wx * 6) / s + 2, (wy * 6) / s, (wz * 6) / s),
        n2 = L.noise3((wx * 23) / s, (wy * 23) / s + 4, (wz * 23) / s);
      if (ny > 0.2) {
        const k = 0.6 * sm(0.2, 0.8, ny);
        out[0] = lerp(out[0], ash.r, k);
        out[1] = lerp(out[1], ash.g, k);
        out[2] = lerp(out[2], ash.b, k);
      }
      if (wy < bh * 0.6) {
        const k = 0.6 * (1 - wy / (bh * 0.6));
        out[0] = lerp(out[0], soot.r, k);
        out[1] = lerp(out[1], soot.g, k);
        out[2] = lerp(out[2], soot.b, k);
      }
      if (n > 0.68) {
        const c = L.col(skinC);
        const k = sm(0.68, 0.72, n);
        out[0] = lerp(out[0], c.r * (0.9 + n2 * 0.3), k);
        out[1] = lerp(out[1], c.g * (0.85 + n2 * 0.2), k);
        out[2] = lerp(out[2], c.b * (0.85 + n2 * 0.2), k);
      } else if (n > 0.64) {
        out[0] *= 0.35;
        out[1] *= 0.33;
        out[2] *= 0.32;
      } // charred rim
    };
    const fur = {
      color: furC,
      region: "fur",
      rough: 0.95,
      noise: 0.2,
      paint: mange,
      grad: [0.85, 1.1],
    };
    // body: heavy hindquarters, a big shoulder hump
    R.addW(
      "hips",
      bodyZ([
        { z: 0.66 * s, rx: 0.12 * s, ry: 0.12 * s, oy: bh + 0.02 * s },
        { z: 0.58 * s, rx: 0.24 * s, ry: 0.26 * s, oy: bh + 0.03 * s },
        { z: 0.38 * s, rx: 0.27 * s, ry: 0.3 * s, oy: bh + 0.02 * s },
        { z: 0.16 * s, rx: 0.26 * s, ry: 0.3 * s, oy: bh + 0.0 * s },
      ]),
      fur,
    );
    R.addW(
      "spine",
      bodyZ([
        { z: 0.2 * s, rx: 0.26 * s, ry: 0.3 * s, oy: bh + 0.02 * s },
        { z: -0.05 * s, rx: 0.27 * s, ry: 0.32 * s, oy: bh + 0.02 * s },
        { z: -0.25 * s, rx: 0.29 * s, ry: 0.35 * s, oy: bh + 0.04 * s },
      ]),
      fur,
    );
    R.addW(
      "chest",
      bodyZ([
        { z: -0.22 * s, rx: 0.29 * s, ry: 0.35 * s, oy: bh + 0.05 * s },
        { z: -0.4 * s, rx: 0.3 * s, ry: 0.4 * s, oy: bh + 0.1 * s },
        { z: -0.58 * s, rx: 0.26 * s, ry: 0.34 * s, oy: bh + 0.04 * s },
        { z: -0.72 * s, rx: 0.16 * s, ry: 0.2 * s, oy: bh + 0.0 * s },
      ]),
      fur,
    );
    // neck & head: broad skull, short heavy muzzle, small round ears
    const nw = R.world("neck"),
      hw = R.world("head");
    R.addW(
      "neck",
      P.xf(
        P.limb(0.28 * s, 0.17 * s, 0.14 * s, { seg: 12 }),
        nw[0],
        nw[1] + 0.05 * s,
        nw[2] + 0.14 * s,
        -1.45,
        0,
        0,
      ),
      fur,
    );
    R.addW(
      "head",
      P.xf(
        P.sphere(0.15 * s, 0.13 * s, 0.15 * s, 12, 10),
        hw[0],
        hw[1] + 0.03 * s,
        hw[2] + 0.02 * s,
      ),
      fur,
    );
    const mz = P.limb(0.16 * s, 0.085 * s, 0.055 * s, { seg: 10, flat: 0.85 });
    mz.rotateX(PI / 2 + 0.25);
    R.addW(
      "head",
      P.xf(mz, hw[0], hw[1] - 0.01 * s, hw[2] - 0.1 * s),
      Object.assign({}, fur, { color: L.shade(furC, 1.4) }),
    );
    R.addW(
      "head",
      P.xf(
        P.sphere(0.034 * s, 0.026 * s, 0.028 * s, 8, 6),
        hw[0],
        hw[1] - 0.03 * s,
        hw[2] - 0.27 * s,
      ),
      { color: 0x0e0c0a, rough: 0.25, noise: 0.05 },
    );
    for (const sg of [-1, 1]) {
      R.addW(
        "head",
        P.xf(
          P.sphere(0.016 * s, 0.014 * s, 0.011 * s, 8, 6),
          hw[0] + sg * 0.065 * s,
          hw[1] + 0.06 * s,
          hw[2] - 0.11 * s,
        ),
        { color: 0xff7a24, emis: 1.6, rough: 0.15, noise: 0.05, keepLod: true },
      );
      R.add(
        "ear" + (sg < 0 ? "L" : "R"),
        P.xf(P.sphere(0.045 * s, 0.045 * s, 0.018 * s, 8, 6), 0, 0.02 * s, 0),
        Object.assign({}, fur, { paint: null }),
      );
    }
    const jw = R.world("jaw");
    const lj = P.limb(0.17 * s, 0.06 * s, 0.035 * s, { seg: 8, flat: 0.6 });
    lj.rotateX(PI / 2 + 0.2);
    R.addW(
      "jaw",
      P.xf(lj, jw[0], jw[1], jw[2]),
      Object.assign({}, fur, { color: 0x2a1c14, paint: null }),
    );
    const tooth = { color: 0xd8ccaa, rough: 0.35, noise: 0.12 };
    for (const sg of [-1, 1]) {
      claw(
        R,
        "head",
        [
          [sg * 0.035 * s, -0.07 * s, -0.24 * s],
          [sg * 0.035 * s, -0.12 * s, -0.25 * s],
        ],
        0.012 * s,
        tooth,
        5,
      ); // upper fangs
      claw(
        R,
        "jaw",
        [
          [sg * 0.03 * s, 0.0, -0.15 * s],
          [sg * 0.03 * s, 0.05 * s, -0.16 * s],
        ],
        0.01 * s,
        tooth,
        5,
      );
    }
    R.addW(
      "jaw",
      P.xf(
        P.box(0.06 * s, 0.015 * s, 0.13 * s, 0.006),
        jw[0],
        jw[1] + 0.012 * s,
        jw[2] - 0.08 * s,
        0.25,
        0,
        0,
      ),
      { color: 0x8a3a3a, rough: 0.35, noise: 0.05 },
    );
    // charred bony growths breaking through the hump and spine
    const growth = {
      color: 0x2a2624,
      rough: 0.6,
      noise: 0.3,
      grad: [0.6, 1.2],
      paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
        if (ny > 0.6) {
          out[0] = out[0] * 0.6 + 0.25;
          out[1] = out[1] * 0.6 + 0.24;
          out[2] = out[2] * 0.6 + 0.22;
        }
      },
    };
    for (const [bone, w, zs] of [
      ["chest", R.world("chest"), [-0.5, -0.38, -0.26]],
      ["spine", R.world("spine"), [-0.15, 0.0]],
      ["hips", R.world("hips"), [0.3]],
    ])
      for (const z of zs) {
        const ht = (bone === "chest" ? 0.13 : 0.09) * s * rng.range(0.8, 1.2);
        const bx = rng.range(-0.04, 0.04) * s,
          top = bh + (bone === "chest" ? 0.48 : 0.33) * s;
        R.addW(
          bone,
          P.sweep(
            [
              [bx, top - 0.04 * s, z * s],
              [bx * 1.4, top + ht * 0.6, z * s + 0.02 * s],
              [bx * 1.6, top + ht, z * s + 0.05 * s],
            ],
            (u) => (0.035 - u * 0.03) * s,
            { seg: 5, rs: 6 },
          ),
          growth,
        );
      }
    // legs: thick, plantigrade paws with long claws
    for (const S of ["FL", "FR", "HL", "HR"]) {
      const front = S[0] === "F",
        sg = S[1] === "L" ? -1 : 1;
      const lo = R.bones[R.map["lower" + S]].pos,
        pw = R.bones[R.map["paw" + S]].pos;
      seg(R, "upper" + S, lo, (front ? 0.13 : 0.16) * s, 0.09 * s, fur, {
        bulge: 0.03 * s,
      });
      seg(R, "lower" + S, pw, 0.085 * s, 0.07 * s, fur);
      R.add(
        "paw" + S,
        P.xf(
          P.box(0.14 * s, 0.07 * s, 0.2 * s, 0.03 * s),
          0,
          -0.03 * s,
          -0.04 * s,
        ),
        Object.assign({}, fur, { paint: null, color: L.shade(furC, 0.8) }),
      );
      const nc = front ? 5 : 4;
      for (let i = 0; i < nc; i++) {
        const x = (i - (nc - 1) / 2) * 0.026 * s;
        claw(
          R,
          "paw" + S,
          [
            [x, -0.03 * s, -0.13 * s],
            [x, -0.05 * s, -0.19 * s],
            [x + sg * 0.0, -0.08 * s, -0.23 * s],
          ],
          (front ? 0.011 : 0.008) * s,
          { color: 0x1c1814, rough: 0.3, noise: 0.08, grad: [1.3, 0.8] },
          5,
        );
      }
    }
    seg(R, "tail1", R.bones[R.map.tail2].pos, 0.05 * s, 0.04 * s, fur);
    seg(R, "tail2", R.bones[R.map.tail3].pos, 0.04 * s, 0.02 * s, fur);
    R.hitVol(
      "head",
      "head",
      [0, 0.02 * s, 0.02 * s],
      [0, -0.02 * s, -0.24 * s],
      0.13 * s,
    );
    R.hitVol(
      "torso",
      "hips",
      [0, 0.02 * s, 0.22 * s],
      [0, 0.02 * s, -0.2 * s],
      0.28 * s,
    );
    R.hitVol(
      "torso",
      "chest",
      [0, 0.05 * s, 0.1 * s],
      [0, 0.05 * s, -0.6 * s],
      0.32 * s,
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
        0.11 * s,
      );
      R.hitVol(
        part,
        "lower" + S,
        [0, 0, 0],
        R.bones[R.map["paw" + S]].pos,
        0.08 * s,
      );
    }
    R.marker("head", "head", 0, 0.02 * s, -0.08 * s, 0.14 * s);
    R.marker("torso", "spine", 0, 0.05 * s, 0, 0.35 * s);
    R.marker("leftArm", "upperFL", 0, -0.25 * s, 0, 0.1 * s);
    R.marker("rightArm", "upperFR", 0, -0.25 * s, 0, 0.1 * s);
    R.marker("leftLeg", "upperHL", 0, -0.25 * s, 0, 0.1 * s);
    R.marker("rightLeg", "upperHR", 0, -0.25 * s, 0, 0.1 * s);
    R.socket("eyes", "head", 0, 0.06 * s, -0.12 * s);
    R.socket("mouth", "jaw", 0, 0, -0.16 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.3 * s,
      height: 1.3 * s,
      hipH: bh,
      dirt: [0.2, 0.5],
      blood: [0, 0.25],
      cut: {
        head: "head",
        leftArm: "lowerFL",
        rightArm: "lowerFR",
        leftLeg: "lowerHL",
        rightLeg: "lowerHR",
      },
      style: { wag: false, pant: false, tailUp: 0, stride: 0.85, bear: true },
    });
    return tpl;
  }
  L.infos.ash_bear = {
    kind: "quad",
    height: 1.3,
    radius: 0.95,
    gore: "red",
    isCreature: true,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"],
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Foreleg",
      rightArm: "Right Foreleg",
      leftLeg: "Left Hind Leg",
      rightLeg: "Right Hind Leg",
    },
    gait: { walkStep: 0.9, runStep: 2.0, walkSpeed: 1.5, runSpeed: 7.8 },
    style: { stride: 0.85, pant: false, wag: false, tailUp: 0, bear: true },
    variants: 3,
    build: buildAshBear,
  };

  // ==================================================================
  // LURCHER — a tall, emaciated thing that lurches along on long crooked
  // arms (knuckle-walking) with short bent hind legs, so its back slopes
  // steeply down to the rump; a long eyeless skull ending in a round,
  // lamprey-like mouth ringed with hooked teeth. Pallid, bruise-mottled,
  // burn-scarred skin stretched over ribs and spine knobs. Spits bile.
  // ==================================================================
  function buildLurcher(opts, seed) {
    const rng = L.rng(seed);
    const s = (opts.scale || 1) * rng.range(0.95, 1.06);
    const R = new L.Rig("quad");
    const bh = 0.68 * s;
    R.bone("hips", null, 0, bh, 0.3 * s, "torso");
    R.bone("spine", "hips", 0, 0.14 * s, -0.28 * s, "torso");
    R.bone("chest", "spine", 0, 0.2 * s, -0.28 * s, "torso");
    R.bone("neck", "chest", 0, 0.06 * s, -0.2 * s, "head");
    R.bone("head", "neck", 0, -0.06 * s, -0.22 * s, "head");
    R.bone("jaw", "head", 0, -0.03 * s, -0.36 * s, "head");
    for (const [S, sg, part] of [
      ["FL", -1, "leftArm"],
      ["FR", 1, "rightArm"],
    ]) {
      R.bone("upper" + S, "chest", sg * 0.2 * s, -0.04 * s, 0.0, part);
      R.bone(
        "lower" + S,
        "upper" + S,
        sg * 0.1 * s,
        -0.42 * s,
        -0.12 * s,
        part,
      ); // elbows bowed out
      R.bone("paw" + S, "lower" + S, -sg * 0.02 * s, -0.47 * s, 0.06 * s, part);
    }
    for (const [S, sg, part] of [
      ["HL", -1, "leftLeg"],
      ["HR", 1, "rightLeg"],
    ]) {
      R.bone("upper" + S, "hips", sg * 0.13 * s, -0.04 * s, 0.04 * s, part);
      R.bone(
        "lower" + S,
        "upper" + S,
        sg * 0.03 * s,
        -0.3 * s,
        -0.16 * s,
        part,
      );
      R.bone("paw" + S, "lower" + S, 0, -0.28 * s, 0.1 * s, part);
    }
    R.softJoint("spine", 0.08 * s, 0.2 * s, [0, 0.4, -1]);
    R.softJoint("chest", 0.08 * s, 0.22 * s, [0, 0.4, -1]);
    const skinC = rng.pick([0xb8b4ac, 0xa8a49c, 0xc0b8ae]);
    const bruise = L.col(0x5a5260),
      scar = L.col(0xc8a8a0),
      dark = L.col(0x3a3634);
    const ph = rng.range(0, 40);
    const fleshP = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const n = L.noise3((wx * 6) / s + ph, (wy * 6) / s, (wz * 6) / s),
        n2 = L.noise3((wx * 19) / s, (wy * 19) / s + ph, (wz * 19) / s);
      if (n < 0.34) {
        const k = sm(0.34, 0.24, n) * 0.6;
        out[0] = lerp(out[0], bruise.r, k);
        out[1] = lerp(out[1], bruise.g, k);
        out[2] = lerp(out[2], bruise.b, k);
      } // bruise mottling
      if (n > 0.7) {
        const k = 0.5;
        out[0] = lerp(out[0], scar.r, k);
        out[1] = lerp(out[1], scar.g, k);
        out[2] = lerp(out[2], scar.b, k);
      } // burn scarring
      if (
        Math.abs(Math.sin((wx * 50) / s + Math.sin((wz * 30) / s) * 2)) < 0.05
      ) {
        out[0] *= 0.7;
        out[1] *= 0.68;
        out[2] *= 0.74;
      } // veins
      if (wy < 0.25 * s || n2 > 0.82) {
        const k = wy < 0.25 * s ? 0.6 * (1 - wy / (0.25 * s)) : 0.4;
        out[0] = lerp(out[0], dark.r, k);
        out[1] = lerp(out[1], dark.g, k);
        out[2] = lerp(out[2], dark.b, k);
      } // filthy knuckles & feet
    };
    const fm = {
      color: skinC,
      region: "crackskin",
      rough: 0.45,
      noise: 0.16,
      paint: fleshP,
      grad: [0.8, 1.06],
    };
    // ---- body: deep narrow ribcage high at the front, sloping to a small pelvis ----
    const hw = R.world("hips"),
      sw = R.world("spine"),
      cw = R.world("chest");
    R.addW(
      "hips",
      P.xf(
        P.sphere(0.15 * s, 0.13 * s, 0.17 * s, 12, 9),
        0,
        hw[1] + 0.02 * s,
        hw[2] + 0.02 * s,
      ),
      fm,
    );
    const torso = P.limb(0.62 * s, 0.13 * s, 0.2 * s, {
      seg: 14,
      flat: 1.25,
      bulge: 0.02 * s,
      bulgeAt: 0.7,
    });
    const dir = new THREE.Vector3(
      0,
      cw[1] - hw[1] + 0.06 * s,
      cw[2] - hw[2] - 0.12 * s,
    ).normalize();
    torso.applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir,
      ),
    );
    // (split: rear half on the spine bone, front half on the chest bone)
    R.addW("spine", P.xf(torso, 0, hw[1] - 0.01 * s, hw[2] + 0.04 * s), fm);
    R.addW(
      "chest",
      P.xf(
        P.sphere(0.2 * s, 0.24 * s, 0.22 * s, 14, 10),
        0,
        cw[1] - 0.06 * s,
        cw[2] + 0.02 * s,
      ),
      fm,
    );
    // ribs showing through the skin
    for (let i = 0; i < 5; i++)
      for (const sg of [-1, 1]) {
        const z = cw[2] + (0.12 - i * 0.05) * s,
          y = cw[1] - (0.02 + i * 0.03) * s;
        R.addW(
          "chest",
          P.sweep(
            [
              [sg * 0.04 * s, y + 0.18 * s, z],
              [sg * 0.2 * s, y + 0.02 * s, z - 0.01 * s],
              [sg * 0.15 * s, y - 0.17 * s, z - 0.06 * s],
            ],
            0.011 * s,
            { seg: 8, rs: 4 },
          ),
          fm,
        );
      }
    // spine knobs down the sloping back
    for (let i = 0; i < 9; i++) {
      const t = i / 8,
        x = 0,
        y = lerp(cw[1] + 0.22 * s, hw[1] + 0.13 * s, t),
        z = lerp(cw[2] + 0.04 * s, hw[2] + 0.05 * s, t);
      R.addW(
        t < 0.4 ? "chest" : "spine",
        P.xf(P.sphere(0.026 * s, 0.02 * s, 0.03 * s, 7, 5), x, y, z),
        fm,
      );
    }
    // ---- neck & eyeless head: a long ridged skull ending in a round lamprey mouth ----
    const nw = R.world("neck"),
      hdw = R.world("head");
    R.addW(
      "neck",
      P.xf(
        P.limb(0.3 * s, 0.07 * s, 0.09 * s, { seg: 10 }),
        nw[0],
        nw[1] + 0.06 * s,
        nw[2] + 0.1 * s,
        -1.75,
        0,
        0,
      ),
      fm,
    );
    const sk = P.sphere(1, 1, 1, 16, 10);
    P.deform(sk, (v) => {
      const f = sm(0.6, -1, v.z); // 0 at the back → 1 at the front
      const x = v.x * lerp(0.1, 0.075, f),
        y = v.y * lerp(0.1, 0.075, f),
        z = v.z * 0.22;
      v.set(x * s, (y + (v.y > 0.6 ? 0.01 : 0)) * s, z * s - 0.14 * s);
    });
    R.add("head", sk, fm);
    R.add(
      "head",
      P.sweep(
        [
          [0, 0.09 * s, 0.03 * s],
          [0, 0.1 * s, -0.12 * s],
          [0, 0.075 * s, -0.3 * s],
        ],
        0.012 * s,
        { seg: 8, rs: 5 },
      ),
      Object.assign({}, fm, { color: L.shade(skinC, 0.85) }),
    ); // crest ridge
    for (const sg of [-1, 1])
      R.add(
        "head",
        P.xf(
          P.sphere(0.03 * s, 0.012 * s, 0.05 * s, 8, 5),
          sg * 0.07 * s,
          0.04 * s,
          -0.12 * s,
        ),
        Object.assign({}, fm, { color: L.shade(skinC, 0.7) }),
      ); // sealed-over eye pits
    // the round mouth: a fleshy lip ring at the snout tip with hooked teeth around the rim, dark throat
    const lipM = {
      color: 0x8a5a58,
      region: "skin",
      rough: 0.3,
      noise: 0.1,
      grad: [0.8, 1.05],
    };
    const toothM = {
      color: 0xd8ccb0,
      rough: 0.3,
      noise: 0.1,
      grad: [0.7, 1.1],
    };
    R.add(
      "head",
      P.xf(P.torus(0.06 * s, 0.022 * s, 8, 18), 0, -0.01 * s, -0.36 * s),
      lipM,
    );
    R.add(
      "head",
      P.xf(
        P.cyl(0.045 * s, 0.03 * s, 0.03 * s, 14),
        0,
        -0.01 * s,
        -0.355 * s,
        PI / 2,
        0,
        0,
      ),
      { color: 0x1a0c0c, rough: 0.6, noise: 0.05 },
    );
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2,
        cx = Math.cos(a) * 0.05 * s,
        cy = Math.sin(a) * 0.05 * s - 0.01 * s;
      claw(
        R,
        "head",
        [
          [cx, cy, -0.37 * s],
          [cx * 0.6, cy * 0.6 - 0.004 * s, -0.385 * s],
        ],
        0.007 * s,
        toothM,
        4,
      );
    }
    // jaw: a hinged lower flap with its own hooked teeth (opens for the spit & bite)
    R.add(
      "jaw",
      P.xf(P.sphere(0.055 * s, 0.02 * s, 0.05 * s, 10, 6), 0, -0.012 * s, 0.0),
      lipM,
    );
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.018 * s;
      claw(
        R,
        "jaw",
        [
          [x, -0.005 * s, -0.03 * s],
          [x * 0.8, 0.015 * s, -0.04 * s],
        ],
        0.006 * s,
        toothM,
        4,
      );
    }
    // ---- limbs: long crooked arms walking on the knuckles, short bent hind legs ----
    const handM = Object.assign({}, fm, { color: L.shade(skinC, 0.85) });
    for (const S of ["FL", "FR", "HL", "HR"]) {
      const front = S[0] === "F",
        sg = S[1] === "L" ? -1 : 1;
      const lo = R.bones[R.map["lower" + S]].pos,
        pw = R.bones[R.map["paw" + S]].pos;
      seg(R, "upper" + S, lo, (front ? 0.065 : 0.08) * s, 0.045 * s, fm, {
        bulge: 0.012 * s,
      });
      R.add("lower" + S, P.sphere(0.048 * s, 0.048 * s, 0.048 * s, 8, 6), fm);
      seg(R, "lower" + S, pw, 0.045 * s, 0.032 * s, fm, { bulge: 0.008 * s });
      if (front) {
        // knuckle-walking hand: curled fingers on the ground, long nails curling back
        R.add(
          "paw" + S,
          P.xf(
            P.box(0.08 * s, 0.06 * s, 0.09 * s, 0.02 * s),
            0,
            -0.03 * s,
            -0.01 * s,
          ),
          handM,
        );
        for (let i = 0; i < 4; i++) {
          const x = (i - 1.5) * 0.02 * s;
          claw(
            R,
            "paw" + S,
            [
              [x, -0.06 * s, -0.05 * s],
              [x, -0.075 * s, -0.02 * s],
              [x, -0.06 * s, 0.02 * s],
            ],
            0.01 * s,
            { color: 0x2a2420, rough: 0.4 },
            4,
          );
        }
        claw(
          R,
          "paw" + S,
          [
            [sg * 0.05 * s, -0.03 * s, -0.04 * s],
            [sg * 0.08 * s, -0.06 * s, -0.08 * s],
          ],
          0.012 * s,
          handM,
          4,
        ); // thumb
      } else {
        R.add(
          "paw" + S,
          P.xf(
            P.box(0.07 * s, 0.04 * s, 0.16 * s, 0.015 * s),
            0,
            -0.035 * s,
            -0.04 * s,
          ),
          handM,
        );
        for (let i = 0; i < 3; i++)
          claw(
            R,
            "paw" + S,
            [
              [(i - 1) * 0.022 * s, -0.045 * s, -0.11 * s],
              [(i - 1) * 0.026 * s, -0.055 * s, -0.15 * s],
            ],
            0.008 * s,
            { color: 0x2a2420, rough: 0.4 },
            4,
          );
      }
    }
    R.hitVol(
      "head",
      "head",
      [0, 0.0, 0.0],
      [0, -0.01 * s, -0.36 * s],
      0.09 * s,
    );
    R.hitVol(
      "head",
      "neck",
      [0, 0, 0.1 * s],
      [0, -0.04 * s, -0.2 * s],
      0.08 * s,
    );
    R.hitVol(
      "torso",
      "hips",
      [0, 0.02 * s, 0.1 * s],
      [0, 0.08 * s, -0.2 * s],
      0.15 * s,
    );
    R.hitVol(
      "torso",
      "chest",
      [0, 0.0, 0.15 * s],
      [0, -0.06 * s, -0.08 * s],
      0.22 * s,
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
        0.06 * s,
      );
      R.hitVol(
        part,
        "lower" + S,
        [0, 0, 0],
        R.bones[R.map["paw" + S]].pos,
        0.05 * s,
      );
    }
    R.marker("head", "head", 0, 0.0, -0.18 * s, 0.11 * s);
    R.marker("torso", "chest", 0, -0.05 * s, 0.05 * s, 0.24 * s);
    R.marker("leftArm", "upperFL", -0.04 * s, -0.2 * s, -0.05 * s, 0.07 * s);
    R.marker("rightArm", "upperFR", 0.04 * s, -0.2 * s, -0.05 * s, 0.07 * s);
    R.marker("leftLeg", "upperHL", 0, -0.15 * s, -0.05 * s, 0.07 * s);
    R.marker("rightLeg", "upperHR", 0, -0.15 * s, -0.05 * s, 0.07 * s);
    R.socket("eyes", "head", 0, 0.04 * s, -0.2 * s);
    R.socket("muzzle", "head", 0, -0.01 * s, -0.4 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.2 * s,
      height: 1.35 * s,
      hipH: bh,
      dirt: [0.25, 0.55],
      blood: [0.05, 0.25],
      cut: {
        head: "neck",
        leftArm: "lowerFL",
        rightArm: "lowerFR",
        leftLeg: "lowerHL",
        rightLeg: "lowerHR",
      },
      style: { ranged: true, pant: false, wag: false, tailUp: 0, stride: 0.75 },
    });
    return tpl;
  }
  L.infos.lurcher = {
    kind: "quad",
    height: 1.35,
    radius: 0.6,
    gore: "red",
    isCreature: true,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"],
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Arm",
      rightArm: "Right Arm",
      leftLeg: "Left Leg",
      rightLeg: "Right Leg",
    },
    gait: { walkStep: 0.5, runStep: 1.0, walkSpeed: 1.2, runSpeed: 4.4 },
    style: { ranged: true, stride: 0.75, pant: false, wag: false, tailUp: 0 },
    variants: 3,
    build: buildLurcher,
  };
})();
