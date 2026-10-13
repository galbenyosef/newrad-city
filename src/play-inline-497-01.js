// play-inline-497 01 — root
// Lines 14-367 of readable/play-inline-497.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;
  const GEO = P.GEO,
    C = P.COMP;
  P.MODELS = P.MODELS || {};
  const M = P.MODELS;
  const R = () => P.RIFLE;
  const raked = (pts, a) => P.raked(pts, a);
  const RIFLE_SPRINT = { p: [-0.06, -0.04, 0.02], r: [-0.3, 0.8, 0.45] };
  const RIFLE_LOWER = { p: [0.06, -0.3, 0.1], r: [-0.9, 0.4, 0.3] };
  const PI = Math.PI;

  /** Right hand on a vertical handle (thumb toward the head), left hand lower on the same handle. */
  const rightOnHandle = (root, y) =>
    P.handSocket(root, "rightHand", [0, y || 0, 0], [0, -1, 0], [1, 0, 0.05]);
  const leftOnHandle = (root, y) =>
    P.handSocket(root, "leftHand", [0, y, 0], [0, 1, 0], [-1, 0, 0.05]);

  // ------------------------------------------------------------------
  // THIRD-RAIL SHOE — an insulated fibreglass pole, black rubber grips, a
  // cast-iron contact shoe on a bracket with ceramic insulators, a copper
  // braid running down to the battery on the hip. Handle along +Y; the
  // shoe is the business end (stab).
  // ------------------------------------------------------------------
  M.third_rail_shoe = function (skin, world) {
    const root = new THREE.Group();
    root.name = "third_rail_shoe";
    const b = P.builder();
    // pole: safety-orange fibreglass with black grip sleeves
    b.add(
      GEO.latheY(
        [
          [0.0, -0.36],
          [0.016, -0.358],
          [0.0155, 0.66],
          [0.0, 0.662],
        ],
        12,
      ),
      "orange",
      { wear: 0.6 },
    );
    for (const [y0, y1] of [
      [-0.25, -0.05],
      [0.02, 0.12],
    ])
      b.add(
        GEO.latheY(
          [
            [0.0185, y0],
            [0.019, y0 + 0.01],
            [0.019, y1 - 0.01],
            [0.0185, y1],
          ],
          14,
        ),
        "rubber",
        {},
      );
    b.add(
      GEO.latheY(
        [
          [0.03, 0.14],
          [0.032, 0.145],
          [0.032, 0.152],
          [0.017, 0.16],
        ],
        16,
      ),
      "rubber",
      {},
    ); // hand guard disc
    b.box("yellow", 0.0008, 0.12, 0.012, [0.0158, 0.36, 0], {
      bevel: 0,
      tint: 0.8,
    }); // warning stripe
    b.box("white", 0.0008, 0.04, 0.01, [0.0158, 0.26, 0], { bevel: 0 });
    // bracket + three ceramic insulator discs
    b.box("darksteel", 0.03, 0.05, 0.03, [0, 0.69, 0], { bevel: 0.004 });
    for (let i = 0; i < 3; i++)
      b.add(
        GEO.latheY(
          [
            [0.008, 0],
            [0.022, 0.002],
            [0.024, 0.006],
            [0.02, 0.01],
            [0.008, 0.012],
          ],
          16,
        ),
        "white",
        { p: [0, 0.715 + i * 0.014, 0] },
      );
    // the contact shoe: a heavy cast paddle, slipper face forward (-Z), bolted to a hanger
    b.box("rust", 0.07, 0.03, 0.13, [0, 0.79, -0.02], {
      bevel: 0.006,
      tint: [0.75, 0.72, 0.7],
    });
    b.box("steel", 0.072, 0.008, 0.11, [0, 0.774, -0.025], {
      bevel: 0.002,
      wear: 2,
    }); // worn slipper face
    b.box("rust", 0.02, 0.05, 0.03, [0, 0.76, 0.03], { bevel: 0.003 });
    b.rivets(
      "steel",
      [
        [0, 0.795, 0.02],
        [0, 0.795, -0.06],
      ],
      0.004,
      0.036,
    );
    // copper braid down the pole to the hip battery (out of frame below)
    b.add(
      GEO.hose(
        [
          [0.012, 0.76, 0.03],
          [0.026, 0.66, 0.03],
          [0.024, 0.3, 0.026],
          [0.03, 0.0, 0.03],
          [0.06, -0.3, 0.06],
          [0.08, -0.5, 0.1],
        ],
        0.0045,
        30,
        6,
      ),
      "copper",
    );
    for (const y of [0.55, 0.2, -0.15])
      b.add(GEO.torus(0.0175, 0.0025, 4, 12), "tape", {
        p: [0, y, 0],
        r: [PI / 2, 0, 0],
      });
    root.add(b.build());
    // crackle at the shoe (flickers in onFrame; brighter on the stab)
    const arc = new THREE.Group();
    arc.name = "arc";
    arc.position.set(0, 0.78, -0.09);
    root.add(arc);
    if (!world) {
      const ab = P.builder();
      const pts = [];
      for (let k = 0; k <= 8; k++)
        pts.push([
          (k % 2 ? 1 : -1) * 0.008 * Math.sin(k * 1.7),
          -0.012 + k * 0.004,
          ((k % 3) - 1) * 0.004,
        ]);
      ab.add(GEO.hose(pts, 0.0011, 24, 4), "glowBlue");
      ab.sphere("glowWhite", 0.003, [0, 0, 0]);
      arc.add(ab.build());
    }
    return {
      root,
      parts: { arc },
      sockets: {
        rightHand: rightOnHandle(root, 0.06),
        leftHand: leftOnHandle(root, -0.16),
        muzzle: P.socket(root, "muzzle", [0, 0.78, -0.09]),
      },
      cfg: {
        hip: { p: [0.2, -0.22, -0.36], r: [-0.95, 0.15, 0.35] },
        rightPose: "grip",
        leftPose: "grip",
        sprint: { p: [0.02, -0.06, 0.05], r: [-0.3, 0.1, 0.2] },
        block: { p: [-0.12, 0.12, 0.02], r: [0.5, 0.0, 1.0] },
        idleGlow: { color: 0x8ad8ff, i: 0.2, at: "muzzle" },
        onFrame(m, dt, V) {
          const a = m.parts.arc;
          if (!a) return;
          const hit =
            P.action &&
            P.action.name === "melee" &&
            P.action.phase === "strike";
          a.visible =
            hit || Math.sin(V.time * 23) + Math.sin(V.time * 37) > 0.6;
          a.rotation.y = V.time * 9;
          a.scale.setScalar(hit ? 2.2 : 1);
        },
      },
    };
  };

  // ------------------------------------------------------------------
  // SIREN HORN — a Civil Defense siren rotor drum (radial port slots) behind
  // a flared horn, carried on a pistol grip and a top handle, a square
  // lantern battery clipped underneath (the reload part).
  // ------------------------------------------------------------------
  M.siren_horn = function () {
    const root = new THREE.Group();
    root.name = "siren_horn";
    const b = P.builder();
    const A = 0.3,
      by = 0.11;
    R().pistolGrip(b, "rubber", A, { w: 0.032, top: 0.05, grooves: true });
    R().triggerGuard(b, "darksteel", 0.0, 0.07, 0.05, 0.036);
    b.box("darksteel", 0.034, 0.03, 0.1, [0, 0.055, -0.02], { bevel: 0.005 }); // grip frame / switch box
    // rotor drum: grey cast housing with the radial port slots of an air-raid siren
    b.add(
      GEO.lathe(
        [
          [0.0, 0.08],
          [0.05, 0.078],
          [0.068, 0.06],
          [0.07, 0.02],
          [0.07, -0.04],
          [0.06, -0.05],
          [0.0, -0.05],
        ],
        26,
      ),
      "tan",
      { p: [0, by, 0], tint: [0.72, 0.74, 0.74], wear: 0.8 },
    );
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2;
      b.box(
        "darksteel",
        0.012,
        0.03,
        0.05,
        [Math.cos(a) * 0.0705, by + Math.sin(a) * 0.0705, -0.01],
        { bevel: 0.001, r: [0, 0, a], tint: 0.25 },
      );
    }
    for (const z of [0.05, -0.045])
      b.add(GEO.torus(0.0705, 0.004, 5, 26), "darksteel", { p: [0, by, z] });
    b.add(GEO.cyl(0.03, 0.03, 18), "darksteel", { p: [0, by, 0.09] }); // motor bell
    for (let i = 0; i < 6; i++)
      b.box("steel", 0.05, 0.002, 0.002, [0, by - 0.02 + i * 0.008, 0.106], {
        bevel: 0,
      });
    // the horn: flared bell forward, painted Civil Defense yellow, a blue-and-white triangle stencil
    b.add(
      GEO.lathe(
        [
          [0.042, 0.0],
          [0.045, 0.06],
          [0.055, 0.14],
          [0.075, 0.2],
          [0.1, 0.235],
          [0.104, 0.24],
          [0.098, 0.242],
          [0.07, 0.205],
          [0.05, 0.15],
          [0.04, 0.06],
          [0.038, 0.0],
        ],
        28,
      ),
      "yellow",
      { p: [0, by, -0.05], wear: 0.7 },
    );
    b.add(GEO.torus(0.101, 0.004, 6, 28), "darksteel", { p: [0, by, -0.29] });
    b.box("enamelBlue", 0.0008, 0.03, 0.034, [0.0465, by + 0.01, -0.13], {
      bevel: 0,
      r: [0, 0, -0.1],
    });
    b.box("white", 0.001, 0.014, 0.016, [0.047, by + 0.01, -0.13], {
      bevel: 0,
    });
    // top carry handle and the battery bracket
    b.add(
      GEO.hose(
        [
          [0, by + 0.07, 0.05],
          [0, by + 0.11, 0.02],
          [0, by + 0.11, -0.06],
          [0, by + 0.058, -0.08],
        ],
        0.007,
        16,
        8,
      ),
      "darksteel",
    );
    b.cyl("rubber", 0.011, 0.07, [0, by + 0.11, -0.02], { seg: 12 });
    b.box("darksteel", 0.05, 0.008, 0.08, [0, 0.03, -0.11], { bevel: 0.002 });
    b.add(
      GEO.hose(
        [
          [0.0, 0.03, -0.07],
          [0.03, 0.04, -0.05],
          [0.04, by - 0.04, -0.02],
        ],
        0.0035,
        10,
        6,
      ),
      "red",
    ); // battery lead
    root.add(b.build());
    // lantern battery (the reload part) under the horn throat
    const cb = P.builder();
    cb.box("tan", 0.045, 0.055, 0.06, [0, 0, 0], {
      bevel: 0.005,
      tint: [0.75, 0.78, 0.8],
    });
    cb.box("red", 0.0462, 0.02, 0.0612, [0, 0.004, 0], { bevel: 0.002 });
    for (const x of [-0.01, 0.01])
      cb.cyl("steel", 0.002, 0.008, [x, 0.03, 0], {
        seg: 8,
        r: [PI / 2, 0, 0],
      });
    const cell = P.part(root, cb, null, "cell");
    cell.children[0].position.set(0, 0.0, -0.11);
    const trigger = R().triggerPart(root, [0, 0.045, -0.035]);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.3]),
      sight: P.socket(root, "sight", [0, by + 0.13, 0.04]),
      rightHand: R().rightOnGrip(root, A),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [0, by + 0.11, -0.03],
        [0, 0, -1],
        [-0.2, 0.98, 0],
      ),
      magGrip: R().leftUnder(cell, "magGrip", [0, -0.03, -0.11], 1.1),
    };
    return {
      root,
      parts: { cell, trigger },
      sockets,
      cfg: {
        hip: { p: [0.16, -0.21, -0.38], r: [0.03, 0.04, -0.04] },
        adsDist: 0.32,
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "cell",
          part: "cell",
          grip: "magGrip",
          axis: [0, -1, 0],
          out: 0.06,
          away: [-0.04, -0.3, 0.06],
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
      },
    };
  };

  // ------------------------------------------------------------------
  // RIVET GUN — a pneumatic riveting hammer: barrel-shaped body, a long
  // rivet set (nozzle) with a hot-plate heater coil and a cherry-red rivet
  // in its mouth, a thumb-lever throttle on the grip, an air bottle slung
  // underneath, a side-loading rivet strip (the magazine).
  // ------------------------------------------------------------------
