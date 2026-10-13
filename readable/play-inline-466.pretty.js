/* src/characters/40_robots.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: robots (American Automaton Co. line, 1958–66)
 * Owned by: characters.
 *
 * Patrolman — boxy municipal biped: cabinet torso, square head box with
 *             a horizontal visor slit, clamp hands, piston legs, flat
 *             feet. Liveries (variant): police / fire / medical /
 *             utility / military.
 * Valet     — tall narrow household unit balancing on ONE gyro wheel:
 *             slim column, serving tray, chest unit with two articulated
 *             arms and gripper hands, a single-lens head. Variant 'm'
 *             (Valet-M, military): armoured, gun arm, sensor turret head.
 * Sky-Eye   — the Continuity's flying propaganda drone: a flat disc with a
 *             big searchlight lamp under the nose, a loudspeaker grille
 *             round the rim and a ducted lift fan underneath.
 * Bulwark   — heavy tracked turret robot: twin treads, squat hull, a
 *             faceted turret with a twin cannon and a rocket box, periscope.
 * Robots bleed oil & sparks (gore 'oil').
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !G.chars || !G.chars._lib || !G.chars._lib.human) return;
  const L = G.chars._lib,
    H = L.human;
  const P = L.prim,
    PAL = L.PAL;
  const lerp = L.lerp;
  const PI = Math.PI;
  const ALL6 = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"];
  const _qa = new THREE.Quaternion(),
    _va = new THREE.Vector3(),
    _vb = new THREE.Vector3(0, -1, 0);
  function seg(R, bone, to, r0, r1, mat, o) {
    o = o || {};
    _va.set(to[0], to[1], to[2]);
    const len = _va.length();
    const g = P.limb(len, r0, r1, {
      seg: o.seg || 10,
      bulge: o.bulge || 0,
      flat: o.flat,
    });
    _qa.setFromUnitVectors(_vb, _va.normalize());
    g.applyQuaternion(_qa);
    return R.add(bone, g, mat);
  }
  /** Accordion bellows (waists, necks): stacked rounded boxes alternating two materials. */
  function bellows(R, bone, y0, y1, w, d, n, m1, m2) {
    const h = (y1 - y0) / n;
    for (let i = 0; i < n; i++) {
      const k = i % 2 ? 0.92 : 1;
      R.add(
        bone,
        P.xf(
          P.box(w * k, h * 1.05, d * k, Math.min(w, d) * 0.12),
          0,
          y0 + h * (i + 0.5),
          0,
        ),
        i % 2 ? m2 : m1,
      );
    }
  }
  const metal = (c, extra) =>
    Object.assign(
      {
        color: c,
        region: "metal",
        rough: 0.42,
        metal: 0.45,
        noise: 0.16,
        grad: [0.8, 1.1],
      },
      extra || {},
    );
  const paint = (c, extra) =>
    Object.assign(
      {
        color: c,
        region: "metal",
        rough: 0.55,
        metal: 0.35,
        noise: 0.2,
        grad: [0.78, 1.1],
        paint: rustPaint,
      },
      extra || {},
    );
  function rustPaint(x, y, z, nx, ny, nz, out, wx, wy, wz) {
    const n = L.noise3(wx * 11, wy * 11, wz * 11);
    if (n > 0.7) {
      const k = (n - 0.7) * 3;
      out[0] = lerp(out[0], 0.36, k);
      out[1] = lerp(out[1], 0.18, k);
      out[2] = lerp(out[2], 0.08, k);
    }
    if (ny < -0.4) {
      out[0] *= 0.85;
      out[1] *= 0.84;
      out[2] *= 0.82;
    } // grime under overhangs
  }
  const glass = (c, e) => ({
    color: c,
    rough: 0.05,
    metal: 0.3,
    emis: e || 0.2,
    noise: 0.03,
    grad: [0.9, 1.1],
  });
  const light = (c, e) => ({
    color: c,
    rough: 0.2,
    emis: e || 1.6,
    noise: 0.02,
    grad: [1, 1],
    keepLod: true,
  });
  const rubber = { color: 0x1c1c1a, region: "tire", rough: 0.9, noise: 0.1 };

  // ==================================================================
  // PATROLMAN
  // ==================================================================
  // [body, panel, lamp] per livery
  const PATROL_PAINT = {
    police: [0x1e2a44, 0xd6d4cc, 0xff3020],
    fire: [0x9a2418, 0xd8c070, 0xffb040],
    medical: [0xd8d4c8, 0x9a2a1a, 0x60c8ff],
    utility: [0xb08c3c, 0x4a4234, 0xffd070],
    military: [0x4f5536, 0x2a2a24, 0xff5a20],
  };
  function buildPatrolman(opts, seed) {
    const rng = L.rng(seed);
    const vk =
      typeof opts.variant === "string" && PATROL_PAINT[opts.variant]
        ? opts.variant
        : rng.pick(["utility", "police", "police", "fire", "medical"]);
    const [c1, c2, lc] = PATROL_PAINT[vk];
    const b = H.proportions("m", { scale: 1.1, shoulderMul: 1.25 });
    b.upper *= 1.02;
    const R = new L.Rig("biped");
    H.skeleton(R, b);
    const s = b.s;
    // hinged lower clamp jaw on each hand (opens/closes with the pincer anims)
    for (const [S, part] of [
      ["L", "leftArm"],
      ["R", "rightArm"],
    ])
      R.bone("pincer" + S, "hand" + S, 0, -0.04 * s, 0.03 * s, part);
    const body = paint(c1),
      panel = paint(c2),
      dark = metal(0x262624, { rough: 0.6 }),
      trim = metal(0x5c5c56),
      chrome = metal(PAL.chrome, { rough: 0.25, metal: 0.85 });
    // ---- pelvis: flat box with hip hubs ----
    R.add(
      "hips",
      P.xf(P.box(0.36 * s, 0.14 * s, 0.24 * s, 0.03 * s), 0, -0.01 * s, 0),
      body,
    );
    R.add(
      "hips",
      P.xf(P.box(0.2 * s, 0.05 * s, 0.02 * s, 0.008 * s), 0, 0.0, -0.125 * s),
      dark,
    );
    // ---- waist bellows ----
    bellows(
      R,
      "spine",
      0.0,
      b.spine + 0.02 * s,
      0.26 * s,
      0.18 * s,
      4,
      dark,
      trim,
    );
    // ---- cabinet torso: a tall box, wider at the top, chamfered ----
    const chest = P.box(0.46 * s, 0.44 * s, 0.3 * s, 0.035 * s, 3);
    P.deform(chest, (v) => {
      const k = 0.9 + 0.1 * ((v.y / (0.22 * s)) * 0.5 + 0.5);
      v.x *= k;
    });
    R.add("chest", P.xf(chest, 0, 0.1 * s, 0), body);
    // recessed front panel, badge, indicator lamps, speaker grille, maker plate
    R.add(
      "chest",
      P.xf(
        P.box(0.34 * s, 0.26 * s, 0.03 * s, 0.01 * s),
        0,
        0.08 * s,
        -0.145 * s,
      ),
      panel,
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.24 * s, 0.07 * s, 0.01 * s, 0.004 * s),
        0,
        0.27 * s,
        -0.152 * s,
      ),
      { color: 0xffffff, region: "grille", rough: 0.6, metal: 0.4 },
    );
    for (let i = 0; i < 5; i++)
      R.add(
        "chest",
        P.xf(
          P.cyl(0.013 * s, 0.013 * s, 0.012 * s, 10),
          (-0.1 + i * 0.05) * s,
          0.0,
          -0.163 * s,
          PI / 2,
          0,
          0,
        ),
        light(i === 2 ? lc : i % 2 ? 0xffe070 : 0x70d070, 1.6),
      );
    R.decal(
      "chest",
      "maker",
      0.2 * s,
      0.05 * s,
      0,
      -0.06 * s,
      -0.162 * s,
      0,
      0,
      0,
    );
    if (vk === "police") {
      const badge = P.extrude(
        [
          [0, 0.05],
          [0.032, 0.036],
          [0.04, 0.0],
          [0.024, -0.04],
          [0, -0.05],
          [-0.024, -0.04],
          [-0.04, 0.0],
          [-0.032, 0.036],
        ].map((q) => [q[0] * s, q[1] * s]),
        0.01 * s,
        0.002 * s,
      );
      R.add(
        "chest",
        P.xf(badge, -0.1 * s, 0.15 * s, -0.163 * s),
        metal(0xc8a040, { rough: 0.3, metal: 0.85 }),
      );
      R.decal(
        "chest",
        "numplate",
        0.16 * s,
        0.08 * s,
        0,
        0.14 * s,
        0.152 * s,
        0,
        PI,
        0,
      );
    } else if (vk === "medical") {
      R.decal(
        "chest",
        "redcross",
        0.08 * s,
        0.08 * s,
        -0.1 * s,
        0.15 * s,
        -0.162 * s,
        0,
        0,
        0,
      );
    } else if (vk === "fire" || vk === "military") {
      R.decal(
        "chest",
        "hazard",
        0.3 * s,
        0.04 * s,
        0,
        -0.1 * s,
        -0.162 * s,
        0,
        0,
        0,
      );
    }
    // back: battery hatch with vent louvres & two short exhaust stacks
    R.add(
      "chest",
      P.xf(P.box(0.3 * s, 0.28 * s, 0.03 * s, 0.01 * s), 0, 0.1 * s, 0.155 * s),
      trim,
    );
    for (let i = 0; i < 5; i++)
      R.add(
        "chest",
        P.xf(
          P.box(0.24 * s, 0.012 * s, 0.02 * s, 0.003 * s),
          0,
          (0.0 + i * 0.045) * s,
          0.172 * s,
          -0.4,
          0,
          0,
        ),
        dark,
      );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.cyl(0.025 * s, 0.025 * s, 0.1 * s, 8),
          sg * 0.1 * s,
          0.34 * s,
          0.13 * s,
        ),
        dark,
      );
    // shoulder blocks (boxy pauldron housings); police/fire carry a lamp bar on top
    for (const sg of [-1, 1]) {
      R.add(
        "chest",
        P.xf(
          P.box(0.14 * s, 0.12 * s, 0.22 * s, 0.025 * s),
          sg * 0.27 * s,
          b.shY + 0.01 * s,
          0,
        ),
        panel,
      );
      if (vk === "police" || vk === "fire") {
        R.add(
          "chest",
          P.xf(
            P.box(0.1 * s, 0.035 * s, 0.06 * s, 0.01 * s),
            sg * 0.27 * s,
            b.shY + 0.085 * s,
            0,
          ),
          dark,
        );
        R.add(
          "chest",
          P.xf(
            P.box(0.085 * s, 0.03 * s, 0.05 * s, 0.01 * s),
            sg * 0.27 * s,
            b.shY + 0.11 * s,
            0,
          ),
          light(
            vk === "police" ? (sg < 0 ? 0xff2a1a : 0x2a5aff) : 0xff8a20,
            1.8,
          ),
        );
      }
    }
    // ---- neck: square bellows ----
    bellows(
      R,
      "neck",
      -0.03 * s,
      b.headY + 0.01 * s,
      0.11 * s,
      0.1 * s,
      3,
      dark,
      trim,
    );
    // ---- head: flat-topped box, visor slit, ear vents, short whip aerial ----
    const hs = s;
    const head = P.box(0.27 * hs, 0.2 * hs, 0.23 * hs, 0.03 * hs, 3);
    P.deform(head, (v) => {
      if (v.z < 0 && v.y < 0) v.z *= 0.92;
    }); // chin bevel
    R.add("head", P.xf(head, 0, 0.11 * hs, 0), panel);
    R.add(
      "head",
      P.xf(
        P.box(0.28 * hs, 0.03 * hs, 0.24 * hs, 0.008 * hs),
        0,
        0.215 * hs,
        0,
      ),
      body,
    ); // lid band
    R.add(
      "head",
      P.xf(
        P.box(0.22 * hs, 0.05 * hs, 0.03 * hs, 0.01 * hs),
        0,
        0.13 * hs,
        -0.112 * hs,
      ),
      dark,
    ); // visor recess
    R.add(
      "head",
      P.xf(
        P.box(0.19 * hs, 0.014 * hs, 0.01 * hs, 0.004 * hs),
        0,
        0.13 * hs,
        -0.127 * hs,
      ),
      light(lc, 2.6),
    ); // visor slit
    R.add(
      "head",
      P.xf(
        P.box(0.14 * hs, 0.04 * hs, 0.01 * hs, 0.004 * hs),
        0,
        0.06 * hs,
        -0.116 * hs,
      ),
      { color: 0xffffff, region: "grille", rough: 0.6, metal: 0.4 },
    ); // mouth grille
    for (const sg of [-1, 1]) {
      R.add(
        "head",
        P.xf(
          P.cyl(0.045 * hs, 0.045 * hs, 0.03 * hs, 12),
          sg * 0.145 * hs,
          0.11 * hs,
          0,
          0,
          0,
          PI / 2,
        ),
        trim,
      ); // ear hubs
      for (let i = 0; i < 3; i++)
        R.add(
          "head",
          P.xf(
            P.box(0.006 * hs, 0.05 * hs, 0.008 * hs, 0.002 * hs),
            sg * 0.161 * hs,
            0.11 * hs,
            (i - 1) * 0.016 * hs,
          ),
          dark,
        );
    }
    R.add(
      "head",
      P.xf(
        P.cyl(0.005 * hs, 0.006 * hs, 0.18 * hs, 6),
        0.1 * hs,
        0.3 * hs,
        0.07 * hs,
        0,
        0,
        -0.12,
      ),
      chrome,
    ); // whip aerial
    // ---- arms: square tubes, elbow drums, boxy forearms, clamp hands ----
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      R.add(
        "arm" + S,
        P.xf(P.cyl(0.06 * s, 0.06 * s, 0.1 * s, 12), 0, 0, 0, 0, 0, PI / 2),
        trim,
      );
      R.add(
        "arm" + S,
        P.xf(
          P.box(0.085 * s, b.upper * 0.82, 0.085 * s, 0.015 * s),
          0,
          -b.upper * 0.5,
          0,
        ),
        body,
      );
      R.add(
        "arm" + S,
        P.xf(
          P.cyl(0.01 * s, 0.01 * s, b.upper * 0.7, 6),
          0,
          -b.upper * 0.5,
          -0.055 * s,
        ),
        chrome,
      ); // piston
      R.add(
        "forearm" + S,
        P.xf(P.cyl(0.05 * s, 0.05 * s, 0.11 * s, 12), 0, 0, 0, 0, 0, PI / 2),
        dark,
      );
      const fa = P.box(0.1 * s, b.fore * 0.85, 0.1 * s, 0.018 * s);
      P.deform(fa, (v) => {
        const k = 1 + 0.15 * (-v.y / (b.fore * 0.42));
        v.x *= k;
        v.z *= k;
      });
      R.add("forearm" + S, P.xf(fa, 0, -b.fore * 0.5, 0), panel);
      R.add(
        "hand" + S,
        P.xf(P.box(0.08 * s, 0.06 * s, 0.08 * s, 0.012 * s), 0, -0.02 * s, 0),
        trim,
      );
      // fixed upper clamp jaw + hinged lower jaw (pincer bone)
      R.add(
        "hand" + S,
        P.xf(
          P.box(0.07 * s, 0.11 * s, 0.025 * s, 0.008 * s),
          0,
          -0.1 * s,
          -0.025 * s,
          0.15,
          0,
          0,
        ),
        chrome,
      );
      R.add(
        "pincer" + S,
        P.xf(
          P.box(0.07 * s, 0.1 * s, 0.022 * s, 0.008 * s),
          0,
          -0.055 * s,
          0.0,
          -0.12,
          0,
          0,
        ),
        chrome,
      );
      R.add(
        "pincer" + S,
        P.xf(P.cyl(0.012 * s, 0.012 * s, 0.08 * s, 8), 0, 0, 0, 0, 0, PI / 2),
        dark,
      ); // hinge pin
    }
    // ---- legs: box thighs, knee drums, shins with twin pistons, slab feet ----
    for (const S of ["L", "R"]) {
      R.add(
        "thigh" + S,
        P.xf(P.box(0.13 * s, 0.1 * s, 0.13 * s, 0.03 * s), 0, 0, 0),
        dark,
      );
      R.add(
        "thigh" + S,
        P.xf(
          P.box(0.12 * s, b.thigh * 0.8, 0.13 * s, 0.02 * s),
          0,
          -b.thigh * 0.5,
          0,
        ),
        body,
      );
      R.add(
        "shin" + S,
        P.xf(P.cyl(0.06 * s, 0.06 * s, 0.13 * s, 12), 0, 0, 0, 0, 0, PI / 2),
        trim,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.11 * s, b.shin * 0.78, 0.12 * s, 0.02 * s),
          0,
          -b.shin * 0.5,
          0.005 * s,
        ),
        panel,
      );
      for (const sg of [-1, 1])
        R.add(
          "shin" + S,
          P.xf(
            P.cyl(0.01 * s, 0.01 * s, b.shin * 0.75, 6),
            sg * 0.035 * s,
            -b.shin * 0.5,
            0.07 * s,
          ),
          chrome,
        );
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.16 * s, b.ankle + 0.035 * s, 0.32 * s, 0.025 * s),
          0,
          -b.ankle / 2 + 0.012 * s,
          -0.06 * s,
        ),
        body,
      );
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.165 * s, 0.022 * s, 0.33 * s, 0.006 * s),
          0,
          -b.ankle + 0.01 * s,
          -0.06 * s,
        ),
        rubber,
      );
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.12 * s, 0.02 * s, 0.03 * s, 0.006 * s),
          0,
          -b.ankle / 2 + 0.03 * s,
          -0.22 * s,
        ),
        hazardOrDark(vk, dark),
      );
    }
    R.socket("muzzle", "head", 0, 0.13 * hs, -0.14 * hs);
    R.socket("eyes", "head", 0, 0.13 * hs, -0.13 * hs);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      gore: "oil",
      bodyThick: 0.2 * s,
      cut: {
        head: "head",
        leftArm: "forearmL",
        rightArm: "forearmR",
        leftLeg: "shinL",
        rightLeg: "shinR",
      },
      weaponScale: 1,
    });
    return tpl;
  }
  function hazardOrDark(vk, dark) {
    return vk === "fire" || vk === "utility"
      ? metal(0xd8a020, { rough: 0.5 })
      : dark;
  }
  L.infos.patrolman = {
    kind: "biped",
    height: 2.0,
    radius: 0.44,
    gore: "oil",
    isRobot: true,
    parts: ALL6,
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Arm",
      rightArm: "Right Arm",
      leftLeg: "Left Leg",
      rightLeg: "Right Leg",
    },
    gait: { walkStep: 0.55, runStep: 0.8, walkSpeed: 1.0, runSpeed: 2.2 },
    style: {
      stiff: true,
      heavy: false,
      armOut: 0.2,
      armFwd: 0.35,
      elbow: 0.9,
      armSwing: 0.4,
      stride: 0.8,
      pincers: true,
      robotZap: true,
      ranged: true,
      lookLimit: 1.6,
    },
    variants: 5,
    build: buildPatrolman,
  };

  // ==================================================================
  // VALET / VALET-M — one-wheel balancing household (or military) unit
  // Hover plan: 'body' is the wheel AXLE (the whole unit leans around it),
  // 'wheel' spins with distance, 'stalk1' is the head (looks around),
  // arm1/fore1 right arm, arm2/fore2 left arm, 'pinch' the right gripper.
  // ==================================================================
  function buildValet(opts, seed) {
    const mil = opts.variant === "m" || opts.variant === "military";
    const rng = L.rng(seed);
    const s = opts.scale || 1;
    const wr = (mil ? 0.17 : 0.15) * s; // wheel radius (= hover height of the axle)
    const R = new L.Rig("hover");
    R.bone("body", null, 0, wr, 0, "torso");
    R.bone("wheel", "body", 0, 0, 0, "leftLeg");
    R.bone("stalk1", "body", 0, 1.24 * s, 0, "head");
    const armY = 0.98 * s;
    for (const [i, sg, part] of [
      [1, 1, "rightArm"],
      [2, -1, "leftArm"],
    ]) {
      R.bone("arm" + i, "body", sg * 0.16 * s, armY, -0.01 * s, part);
      R.bone("fore" + i, "arm" + i, sg * 0.01 * s, -0.27 * s, 0, part);
    }
    R.bone("pinch", "fore1", 0, -0.25 * s, 0, "rightArm");
    const enamel = mil ? 0x4c5434 : rng.pick([0xd8cfb4, 0xa9c6b2, 0xb6c2cc]);
    const shell = mil
      ? paint(enamel, { rough: 0.6 })
      : metal(enamel, { rough: 0.3, metal: 0.25, paint: rustPaint });
    const accent = mil
      ? paint(0x2c3024)
      : metal(0x7a2a22, { rough: 0.35, metal: 0.4 });
    const chrome = metal(PAL.chrome, { rough: 0.22, metal: 0.9 });
    const dark = metal(0x262624, { rough: 0.6 });
    // ---- wheel: tyre, rim, hub, spokes (all on the spinning bone) ----
    const tyre = P.torus(wr - 0.03 * s, 0.032 * s * (mil ? 1.3 : 1), 8, 24);
    tyre.rotateY(PI / 2);
    R.add("wheel", tyre, rubber);
    if (mil)
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * PI * 2;
        R.add(
          "wheel",
          P.xf(
            P.box(0.07 * s, 0.014 * s, 0.03 * s, 0.004 * s),
            0,
            Math.cos(a) * (wr - 0.002 * s),
            Math.sin(a) * (wr - 0.002 * s),
            a,
            0,
            0,
          ),
          rubber,
        );
      }
    R.add(
      "wheel",
      P.xf(
        P.cyl(wr - 0.055 * s, wr - 0.055 * s, 0.05 * s, 20, true),
        0,
        0,
        0,
        0,
        0,
        PI / 2,
      ),
      chrome,
    );
    R.add(
      "wheel",
      P.xf(P.cyl(0.04 * s, 0.04 * s, 0.09 * s, 12), 0, 0, 0, 0, 0, PI / 2),
      dark,
    );
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2;
      R.add(
        "wheel",
        P.xf(
          P.box(0.012 * s, wr - 0.07 * s, 0.018 * s, 0.004 * s),
          0,
          Math.cos(a) * (wr - 0.035 * s) * 0.5,
          Math.sin(a) * (wr - 0.035 * s) * 0.5,
          a,
          0,
          0,
        ),
        chrome,
      );
    }
    // ---- fork + gyro housing (mudguard bell over the wheel) ----
    for (const sg of [-1, 1])
      R.add(
        "body",
        P.xf(
          P.box(0.02 * s, 0.24 * s, 0.05 * s, 0.008 * s),
          sg * 0.07 * s,
          0.1 * s,
          0,
        ),
        dark,
      );
    const bell = P.lathe(
      [
        [0.001, 0.36],
        [0.1, 0.35],
        [0.15, 0.3],
        [0.17, 0.22],
        [0.165, 0.2],
        [0.13, 0.2],
        [0.001, 0.2],
      ].map((q) => [q[0] * s, q[1] * s]),
      18,
    );
    R.add("body", P.xf(bell, 0, 0.0, 0), shell);
    R.add(
      "body",
      P.xf(P.torus(0.168 * s, 0.01 * s, 5, 22), 0, 0.21 * s, 0, PI / 2, 0, 0),
      chrome,
    );
    // ---- column: slim tapered stem with chrome bands and a serving tray ----
    R.add(
      "body",
      P.xf(P.cyl(0.055 * s, 0.075 * s, 0.5 * s, 14), 0, 0.6 * s, 0),
      mil ? dark : shell,
    );
    for (let i = 0; i < 3; i++)
      R.add(
        "body",
        P.xf(
          P.torus(0.065 * s - i * 0.004 * s, 0.008 * s, 5, 16),
          0,
          (0.42 + i * 0.13) * s,
          0,
          PI / 2,
          0,
          0,
        ),
        chrome,
      );
    if (!mil) {
      R.add(
        "body",
        P.xf(P.cyl(0.17 * s, 0.17 * s, 0.012 * s, 22), 0, 0.66 * s, -0.08 * s),
        chrome,
      ); // tray
      R.add(
        "body",
        P.xf(
          P.torus(0.17 * s, 0.008 * s, 4, 22),
          0,
          0.672 * s,
          -0.08 * s,
          PI / 2,
          0,
          0,
        ),
        chrome,
      ); // tray lip
      R.add(
        "body",
        P.xf(
          P.box(0.03 * s, 0.1 * s, 0.1 * s, 0.01 * s),
          0,
          0.62 * s,
          -0.04 * s,
        ),
        dark,
      ); // bracket
    }
    // ---- chest unit: rounded cabinet with shoulder pivots, grille, plate ----
    const ch = P.box(0.3 * s, 0.26 * s, 0.2 * s, 0.06 * s, 3);
    P.deform(ch, (v) => {
      if (v.y < 0) {
        v.x *= 1 + (v.y / s) * 0.9;
      }
    });
    R.add("body", P.xf(ch, 0, 0.97 * s, 0), shell);
    R.add(
      "body",
      P.xf(
        P.box(0.18 * s, 0.07 * s, 0.01 * s, 0.004 * s),
        0,
        1.0 * s,
        -0.102 * s,
      ),
      { color: 0xffffff, region: "grille", rough: 0.6, metal: 0.4 },
    );
    R.decal(
      "body",
      "maker",
      0.16 * s,
      0.04 * s,
      0,
      0.92 * s,
      -0.104 * s,
      0,
      0,
      0,
    );
    if (mil) {
      // armour: chest plate, shoulder pads, hazard stripe, battery box on the back
      R.add(
        "body",
        P.xf(
          P.box(0.33 * s, 0.18 * s, 0.05 * s, 0.015 * s),
          0,
          0.99 * s,
          -0.1 * s,
          -0.08,
          0,
          0,
        ),
        shell,
      );
      R.decal(
        "body",
        "hazard",
        0.24 * s,
        0.035 * s,
        0,
        0.92 * s,
        -0.127 * s,
        -0.08,
        0,
        0,
      );
      R.decal(
        "body",
        "continuity",
        0.07 * s,
        0.07 * s,
        0.1 * s,
        1.03 * s,
        -0.128 * s,
        -0.08,
        0,
        0,
      );
      R.add(
        "body",
        P.xf(
          P.box(0.2 * s, 0.22 * s, 0.1 * s, 0.02 * s),
          0,
          0.92 * s,
          0.13 * s,
        ),
        dark,
      );
      R.add(
        "body",
        P.xf(
          P.cyl(0.02 * s, 0.02 * s, 0.03 * s, 8),
          0.05 * s,
          0.96 * s,
          0.185 * s,
          PI / 2,
          0,
          0,
        ),
        light(0xff6a20, 1.4),
      );
    } else {
      R.add(
        "body",
        P.xf(
          P.box(0.06 * s, 0.03 * s, 0.012 * s, 0.006 * s),
          0,
          1.075 * s,
          -0.104 * s,
        ),
        accent,
      ); // bow-tie plate
    }
    for (const sg of [-1, 1])
      R.add(
        "body",
        P.xf(
          P.sphere(0.05 * s, 0.05 * s, 0.05 * s, 10, 8),
          sg * 0.16 * s,
          armY,
          -0.01 * s,
        ),
        mil ? shell : chrome,
      );
    R.add(
      "body",
      P.xf(P.cyl(0.035 * s, 0.045 * s, 0.1 * s, 12), 0, 1.15 * s, 0),
      dark,
    ); // neck column
    // ---- head (stalk1) ----
    if (mil) {
      // squat sensor turret: armoured drum, wide lens slit, side radar stub
      R.add(
        "stalk1",
        P.xf(P.cyl(0.11 * s, 0.12 * s, 0.11 * s, 16), 0, 0.04 * s, 0),
        shell,
      );
      R.add(
        "stalk1",
        P.xf(P.cyl(0.12 * s, 0.12 * s, 0.02 * s, 16), 0, 0.1 * s, 0),
        dark,
      );
      R.add(
        "stalk1",
        P.xf(
          P.box(0.14 * s, 0.035 * s, 0.03 * s, 0.008 * s),
          0,
          0.045 * s,
          -0.11 * s,
        ),
        dark,
      );
      R.add(
        "stalk1",
        P.xf(
          P.box(0.12 * s, 0.014 * s, 0.01 * s, 0.004 * s),
          0,
          0.045 * s,
          -0.126 * s,
        ),
        light(0xff5020, 2.6),
      );
      R.add(
        "stalk1",
        P.xf(
          P.box(0.03 * s, 0.07 * s, 0.05 * s, 0.01 * s),
          0.12 * s,
          0.07 * s,
          0.02 * s,
        ),
        dark,
      );
      R.add(
        "stalk1",
        P.xf(
          P.cyl(0.035 * s, 0.035 * s, 0.008 * s, 12),
          0.14 * s,
          0.11 * s,
          0.02 * s,
          0,
          0,
          PI / 2,
        ),
        metal(0x6a6a62),
      );
    } else {
      // capsule head with ONE big camera lens in a chrome bezel, two ear discs
      const hd = P.box(0.21 * s, 0.13 * s, 0.16 * s, 0.055 * s, 3);
      R.add("stalk1", P.xf(hd, 0, 0.05 * s, 0), shell);
      R.add(
        "stalk1",
        P.xf(
          P.cyl(0.05 * s, 0.055 * s, 0.05 * s, 18),
          0,
          0.05 * s,
          -0.08 * s,
          PI / 2,
          0,
          0,
        ),
        chrome,
      );
      R.add(
        "stalk1",
        P.xf(
          P.cyl(0.04 * s, 0.04 * s, 0.01 * s, 18),
          0,
          0.05 * s,
          -0.106 * s,
          PI / 2,
          0,
          0,
        ),
        glass(0x1a2228, 0.05),
      );
      R.add(
        "stalk1",
        P.xf(
          P.cyl(0.016 * s, 0.016 * s, 0.006 * s, 12),
          0,
          0.05 * s,
          -0.112 * s,
          PI / 2,
          0,
          0,
        ),
        light(0xffb050, 2.4),
      );
      for (const sg of [-1, 1])
        R.add(
          "stalk1",
          P.xf(
            P.cyl(0.035 * s, 0.035 * s, 0.02 * s, 14),
            sg * 0.11 * s,
            0.05 * s,
            0,
            0,
            0,
            PI / 2,
          ),
          accent,
        );
    }
    // ---- arms: chrome upper tubes, elbow balls, enamel forearms, two-finger grippers ----
    for (const [i, sg] of [
      [1, 1],
      [2, -1],
    ]) {
      seg(
        R,
        "arm" + i,
        [sg * 0.01 * s, -0.27 * s, 0],
        0.028 * s,
        0.024 * s,
        chrome,
      );
      R.add(
        "fore" + i,
        P.xf(P.sphere(0.035 * s, 0.035 * s, 0.035 * s, 10, 8), 0, 0, 0),
        dark,
      );
      seg(R, "fore" + i, [0, -0.22 * s, 0], 0.034 * s, 0.028 * s, shell);
    }
    // right: gripper (fixed finger on the forearm + moving finger on 'pinch')
    R.add(
      "fore1",
      P.xf(P.cyl(0.03 * s, 0.025 * s, 0.04 * s, 10), 0, -0.24 * s, 0),
      dark,
    );
    R.add(
      "fore1",
      P.sweep(
        [
          [0, -0.25 * s, -0.012 * s],
          [0, -0.3 * s, -0.03 * s],
          [0, -0.34 * s, -0.01 * s],
        ],
        (t) => (0.012 - t * 0.006) * s,
        { seg: 5, rs: 5 },
      ),
      chrome,
    );
    R.add(
      "pinch",
      P.sweep(
        [
          [0, 0, 0.012 * s],
          [0, -0.05 * s, 0.03 * s],
          [0, -0.09 * s, 0.008 * s],
        ],
        (t) => (0.012 - t * 0.006) * s,
        { seg: 5, rs: 5 },
      ),
      chrome,
    );
    // left: valet = gripper + lighter wand; Valet-M = twin-barrel arc gun
    if (mil) {
      R.add(
        "fore2",
        P.xf(P.box(0.08 * s, 0.12 * s, 0.09 * s, 0.015 * s), 0, -0.26 * s, 0),
        shell,
      );
      for (const sx of [-1, 1])
        R.add(
          "fore2",
          P.xf(
            P.cyl(0.016 * s, 0.018 * s, 0.22 * s, 10),
            sx * 0.022 * s,
            -0.4 * s,
            0,
          ),
          dark,
        );
      for (let k = 0; k < 3; k++)
        R.add(
          "fore2",
          P.xf(
            P.torus(0.045 * s, 0.007 * s, 5, 12),
            0,
            -0.33 * s - k * 0.04 * s,
            0,
            PI / 2,
            0,
            0,
          ),
          light(0xff7a30, 1.2),
        );
    } else {
      R.add(
        "fore2",
        P.xf(P.cyl(0.026 * s, 0.022 * s, 0.05 * s, 10), 0, -0.245 * s, 0),
        dark,
      );
      R.add(
        "fore2",
        P.xf(P.cyl(0.01 * s, 0.014 * s, 0.09 * s, 8), 0, -0.31 * s, 0),
        metal(0x8a7a50),
      );
      R.add(
        "fore2",
        P.xf(P.cyl(0.008 * s, 0.008 * s, 0.012 * s, 8), 0, -0.36 * s, 0),
        light(0xffa040, 1.6),
      );
    }
    // hit volumes / markers / sockets
    R.hitVol("torso", "body", [0, 0.25 * s, 0], [0, 1.08 * s, 0], 0.16 * s);
    R.hitVol("head", "stalk1", [0, 0.0, 0], [0, 0.1 * s, 0], 0.11 * s);
    R.hitVol("leftLeg", "wheel", [-0.04 * s, 0, 0], [0.04 * s, 0, 0], wr);
    R.hitVol("rightArm", "fore1", [0, 0, 0], [0, -0.3 * s, 0], 0.05 * s);
    R.hitVol("leftArm", "fore2", [0, 0, 0], [0, -0.3 * s, 0], 0.05 * s);
    R.marker("head", "stalk1", 0, 0.05 * s, 0, 0.11 * s);
    R.marker("torso", "body", 0, 0.9 * s, 0, 0.16 * s);
    R.marker("rightArm", "fore1", 0, -0.15 * s, 0, 0.06 * s);
    R.marker("leftArm", "fore2", 0, -0.15 * s, 0, 0.06 * s);
    R.marker("leftLeg", "wheel", 0, 0, 0, wr);
    R.socket(
      "muzzle",
      "fore2",
      0,
      mil ? -0.52 * s : -0.37 * s,
      0,
      PI / 2 + 0.3,
      0,
      0,
    );
    R.socket("eyes", "stalk1", 0, 0.05 * s, -0.11 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      hover: wr,
      bodyThick: 0.16 * s,
      height: wr + 1.4 * s,
      hipH: wr,
      gore: "oil",
      cut: {
        head: "stalk1",
        leftArm: "fore2",
        rightArm: "fore1",
        leftLeg: null,
        rightLeg: null,
      },
    });
    return tpl;
  }
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
  function buildBulwark(opts, seed) {
    const b = H.proportions("m", { scale: 1.25, shoulderMul: 1.35 });
    b.hipH = 0.5 * b.s;
    b.chest = 0.13 * b.s;
    const R = new L.Rig("biped");
    H.skeleton(R, b);
    const s = b.s;
    const hull = paint(0x56593f, { rough: 0.55 }),
      dark = metal(0x232422, { rough: 0.6 }),
      trim = metal(0x67675e);
    const hy = -b.hipH;
    // ---- running gear: two long treads with road wheels, sprocket, idler ----
    for (const sg of [-1, 1]) {
      const x = sg * 0.33 * s;
      const tr = P.box(0.2 * s, 0.34 * s, 1.15 * s, 0.15 * s, 3);
      R.add("hips", P.xf(tr, x, hy + 0.18 * s, 0.02 * s), rubber);
      for (let i = 0; i < 5; i++)
        R.add(
          "hips",
          P.xf(
            P.cyl(0.09 * s, 0.09 * s, 0.21 * s, 14),
            x,
            hy + 0.13 * s,
            (-0.38 + i * 0.19) * s,
            0,
            0,
            PI / 2,
          ),
          trim,
        );
      R.add(
        "hips",
        P.xf(
          P.cyl(0.12 * s, 0.12 * s, 0.215 * s, 12),
          x,
          hy + 0.24 * s,
          -0.47 * s,
          0,
          0,
          PI / 2,
        ),
        dark,
      ); // drive sprocket
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * PI * 2;
        R.add(
          "hips",
          P.xf(
            P.box(0.22 * s, 0.03 * s, 0.03 * s, 0.006 * s),
            x,
            hy + 0.24 * s + Math.cos(a) * 0.12 * s,
            -0.47 * s + Math.sin(a) * 0.12 * s,
            a,
            0,
            0,
          ),
          dark,
        );
      }
      R.add(
        "hips",
        P.xf(
          P.box(0.03 * s, 0.16 * s, 1.05 * s, 0.01 * s),
          x + sg * 0.115 * s,
          hy + 0.29 * s,
          0.02 * s,
        ),
        hull,
      ); // side skirt
      for (let i = 0; i < 4; i++)
        R.add(
          "hips",
          P.xf(
            P.cyl(0.012 * s, 0.012 * s, 0.01 * s, 6),
            x + sg * 0.132 * s,
            hy + 0.33 * s,
            (-0.33 + i * 0.22) * s,
            0,
            0,
            PI / 2,
          ),
          trim,
        );
    }
    // ---- hull: squat armoured box with a sloped glacis, headlights, tow hooks ----
    const hullG = P.box(0.5 * s, 0.26 * s, 1.0 * s, 0.05 * s, 3);
    P.deform(hullG, (v) => {
      if (v.z < -0.25 * s && v.y > 0) v.y -= (-v.z - 0.25 * s) * 0.6;
    });
    R.add("hips", P.xf(hullG, 0, hy + 0.42 * s, 0.02 * s), hull);
    R.decal(
      "hips",
      "hazard",
      0.36 * s,
      0.05 * s,
      0,
      hy + 0.36 * s,
      -0.485 * s,
      0,
      0,
      0,
    );
    for (const sg of [-1, 1]) {
      R.add(
        "hips",
        P.xf(
          P.cyl(0.035 * s, 0.04 * s, 0.04 * s, 12),
          sg * 0.17 * s,
          hy + 0.43 * s,
          -0.47 * s,
          PI / 2,
          0,
          0,
        ),
        dark,
      );
      R.add(
        "hips",
        P.xf(
          P.cyl(0.03 * s, 0.03 * s, 0.006 * s, 12),
          sg * 0.17 * s,
          hy + 0.43 * s,
          -0.492 * s,
          PI / 2,
          0,
          0,
        ),
        light(0xfff0c0, 1.6),
      );
    }
    R.add(
      "hips",
      P.xf(P.cyl(0.18 * s, 0.22 * s, 0.1 * s, 20), 0, -0.02 * s, 0),
      trim,
    ); // turret ring
    // ---- turret (spine + chest): faceted, low, wide ----
    R.add(
      "spine",
      P.xf(
        P.cyl(0.2 * s, 0.22 * s, b.spine + 0.04 * s, 18),
        0,
        b.spine * 0.5,
        0,
      ),
      dark,
    );
    const tur = P.loft(
      [
        { y: -0.12 * s, rx: 0.36 * s, rz: 0.4 * s, n: 3.2 },
        { y: 0.06 * s, rx: 0.42 * s, rz: 0.46 * s, n: 3.4 },
        { y: 0.2 * s, rx: 0.36 * s, rz: 0.4 * s, n: 3.2 },
        { y: 0.26 * s, rx: 0.26 * s, rz: 0.3 * s, n: 2.8 },
      ],
      { seg: 24, capTop: true, capBottom: true },
    );
    P.deform(tur, (v) => {
      if (v.z < 0) v.z *= 1.12;
    });
    R.add("chest", P.xf(tur, 0, 0.0, 0.03 * s), hull);
    R.decal(
      "chest",
      "maker",
      0.22 * s,
      0.06 * s,
      0,
      0.05 * s,
      -0.505 * s,
      0.1,
      0,
      0,
    );
    for (let i = 0; i < 6; i++)
      R.add(
        "chest",
        P.xf(
          P.box(0.32 * s, 0.014 * s, 0.03 * s, 0.004 * s),
          0,
          (-0.05 + i * 0.04) * s,
          0.47 * s,
          0.5,
          0,
          0,
        ),
        dark,
      ); // rear vents
    R.add(
      "chest",
      P.xf(P.box(0.2 * s, 0.14 * s, 0.14 * s, 0.03 * s), 0, 0.02 * s, 0.5 * s),
      dark,
    ); // bustle / battery
    R.add(
      "chest",
      P.xf(
        P.cyl(0.03 * s, 0.03 * s, 0.01 * s, 10),
        0,
        0.02 * s,
        0.575 * s,
        PI / 2,
        0,
        0,
      ),
      light(0xff8030, 1.4),
    );
    // ---- head: periscope / commander's sensor block on the turret roof ----
    R.add(
      "neck",
      P.xf(P.cyl(0.07 * s, 0.08 * s, 0.1 * s, 12), 0, 0.0, 0),
      dark,
    );
    R.add(
      "head",
      P.xf(P.box(0.2 * s, 0.12 * s, 0.18 * s, 0.03 * s), 0, 0.04 * s, 0),
      hull,
    );
    R.add(
      "head",
      P.xf(
        P.box(0.16 * s, 0.04 * s, 0.02 * s, 0.008 * s),
        0,
        0.05 * s,
        -0.09 * s,
      ),
      dark,
    );
    R.add(
      "head",
      P.xf(
        P.box(0.14 * s, 0.018 * s, 0.01 * s, 0.004 * s),
        0,
        0.05 * s,
        -0.1 * s,
      ),
      light(0xff3a1a, 2.6),
    );
    R.add(
      "head",
      P.xf(
        P.cyl(0.02 * s, 0.02 * s, 0.18 * s, 8),
        0.07 * s,
        0.18 * s,
        0.05 * s,
      ),
      trim,
    ); // periscope mast
    R.add(
      "head",
      P.xf(
        P.box(0.06 * s, 0.05 * s, 0.07 * s, 0.01 * s),
        0.07 * s,
        0.28 * s,
        0.04 * s,
      ),
      dark,
    );
    R.add(
      "head",
      P.xf(
        P.box(0.045 * s, 0.022 * s, 0.01 * s, 0.004 * s),
        0.07 * s,
        0.28 * s,
        0.003 * s,
      ),
      light(0x6ad0ff, 1.8),
    );
    // ---- weapons (arms held forward): twin cannon (L), rocket box (R) ----
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      R.add(
        "arm" + S,
        P.xf(P.cyl(0.11 * s, 0.11 * s, 0.16 * s, 14), 0, 0, 0, 0, 0, PI / 2),
        trim,
      ); // trunnion
      R.add(
        "arm" + S,
        P.xf(P.box(0.15 * s, b.upper, 0.17 * s, 0.03 * s), 0, -b.upper / 2, 0),
        hull,
      );
      R.add(
        "forearm" + S,
        P.xf(P.box(0.17 * s, b.fore, 0.19 * s, 0.03 * s), 0, -b.fore / 2, 0),
        dark,
      );
    }
    for (const dx of [-0.04, 0.04]) {
      R.add(
        "handL",
        P.xf(P.cyl(0.026 * s, 0.03 * s, 0.5 * s, 10), dx * s, -0.25 * s, 0),
        metal(0x34352f, { rough: 0.35 }),
      );
      R.add(
        "handL",
        P.xf(P.cyl(0.036 * s, 0.036 * s, 0.07 * s, 10), dx * s, -0.47 * s, 0),
        trim,
      ); // muzzle brakes
    }
    R.add(
      "handR",
      P.xf(P.box(0.26 * s, 0.3 * s, 0.26 * s, 0.03 * s), 0, -0.15 * s, 0),
      hull,
    );
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        R.add(
          "handR",
          P.xf(
            P.cyl(0.032 * s, 0.032 * s, 0.02 * s, 10),
            (i - 1) * 0.075 * s,
            -0.305 * s,
            (j - 1) * 0.075 * s,
          ),
          { color: 0x101010, rough: 0.9 },
        );
    R.socket("muzzle", "handL", 0, -0.52 * s, 0, -PI / 2, 0, 0);
    R.socket("eyes", "head", 0, 0.05 * s, -0.1 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      gore: "oil",
      bodyThick: 0.34 * s,
      hitScale: 1.6,
      noFootIK: true,
      dirt: [0.25, 0.55],
      cut: {
        head: "head",
        leftArm: "forearmL",
        rightArm: "forearmR",
        leftLeg: null,
        rightLeg: null,
      },
    });
    // the legs carry no geometry: tread hit volumes & markers replace them
    tpl.markers.leftLeg = {
      bone: 0,
      pos: [-0.33 * s, hy + 0.18 * s, 0],
      r: 0.2 * s,
    };
    tpl.markers.rightLeg = {
      bone: 0,
      pos: [0.33 * s, hy + 0.18 * s, 0],
      r: 0.2 * s,
    };
    tpl.hit = tpl.hit.filter(
      (h) => h.part !== "leftLeg" && h.part !== "rightLeg",
    );
    tpl.hit.push({
      part: "leftLeg",
      bone: 0,
      a: [-0.33 * s, hy + 0.18 * s, -0.45 * s],
      b: [-0.33 * s, hy + 0.18 * s, 0.45 * s],
      r: 0.17 * s,
    });
    tpl.hit.push({
      part: "rightLeg",
      bone: 0,
      a: [0.33 * s, hy + 0.18 * s, -0.45 * s],
      b: [0.33 * s, hy + 0.18 * s, 0.45 * s],
      r: 0.17 * s,
    });
    tpl.hit.push({
      part: "torso",
      bone: 0,
      a: [0, hy + 0.42 * s, -0.4 * s],
      b: [0, hy + 0.42 * s, 0.4 * s],
      r: 0.25 * s,
    });
    return tpl;
  }
  L.infos.bulwark = {
    kind: "biped",
    height: 2.0,
    radius: 0.75,
    gore: "oil",
    isRobot: true,
    parts: ALL6,
    labels: {
      head: "Periscope",
      torso: "Turret",
      leftArm: "Twin Cannon",
      rightArm: "Rocket Box",
      leftLeg: "Left Tread",
      rightLeg: "Right Tread",
    },
    gait: { walkStep: 0.6, runStep: 0.9, walkSpeed: 1.2, runSpeed: 3.2 },
    style: {
      stiff: true,
      heavy: true,
      tracked: true,
      armOut: 0.05,
      armFwd: 1.5,
      elbow: 0.05,
      armSwing: 0.0,
      stride: 0.6,
      ranged: true,
      lookLimit: 1.4,
    },
    variants: 1,
    build: buildBulwark,
  };
})();
