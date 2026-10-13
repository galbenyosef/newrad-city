// play-inline-493 06 — root
// Lines 1321-1483 of readable/play-inline-493.pretty.js (statement-aligned).
  M.sawed_off = function () {
    const root = new THREE.Group();
    root.name = "sawed_off";
    const b = P.builder();
    const A = 0.75,
      by = 0.06;
    // sawn-off pistol-grip stock (wood), raw cut end
    b.profile(
      "wood",
      raked(
        [
          [-0.02, -0.066],
          [0.018, -0.062],
          [0.02, 0.02],
          [0.026, 0.042],
          [-0.026, 0.042],
          [-0.025, 0.0],
        ],
        A,
      ),
      0.03,
      { bevel: 0.004 },
    );
    b.profile(
      "woodLight",
      raked(
        [
          [-0.02, -0.066],
          [0.018, -0.062],
          [0.018, -0.058],
          [-0.02, -0.062],
        ],
        A,
      ),
      0.032,
      { bevel: 0.001 },
    );
    // action body (case-hardened steel)
    b.profile(
      "steel",
      [
        [-0.04, 0.03],
        [0.064, 0.03],
        [0.078, 0.042],
        [0.078, 0.08],
        [-0.035, 0.08],
        [-0.048, 0.062],
      ],
      0.05,
      { bevel: 0.004 },
    );
    b.box("gunmetal", 0.052, 0.01, 0.1, [0, 0.083, 0.005], { bevel: 0.003 });
    for (const sd of [-1, 1])
      b.box("darksteel", 0.001, 0.02, 0.06, [sd * 0.0232, 0.055, 0.02], {
        bevel: 0,
      }); // engraving plate
    triggerGuard(b, "darksteel", 0.0, 0.05, 0.036, 0.026);
    // top lever
    b.box("darksteel", 0.01, 0.006, 0.03, [0.008, 0.078, 0.035], {
      bevel: 0.002,
      r: [0, 0.4, 0],
    });
    root.add(b.build());
    // barrels (part): pivot at the hinge pin at the front-bottom of the action
    const bb = P.builder();
    const L = 0.3;
    for (const sd of [-1, 1])
      C.barrel(bb, "gunmetal", 0.0125, -0.075, -0.075 - L, by, {
        x: sd * 0.0122,
        bore: 0.72,
        seg: 16,
      });
    bb.box("gunmetal", 0.012, 0.012, L, [0, by + 0.012, -0.075 - L / 2], {
      bevel: 0.003,
    }); // top rib
    bb.box("gunmetal", 0.012, 0.01, L * 0.9, [0, by - 0.012, -0.075 - L / 2], {
      bevel: 0.003,
    });
    bb.box("brass", 0.004, 0.004, 0.004, [0, by + 0.02, -0.075 - L + 0.01], {
      bevel: 0.001,
    }); // bead sight
    // splinter forend (wood) under the barrels
    bb.profile(
      "wood",
      [
        [0.09, 0.046],
        [0.22, 0.046],
        [0.23, 0.03],
        [0.1, 0.028],
      ],
      0.034,
      { bevel: 0.004 },
    );
    // shells in the chambers (visible when open)
    for (const sd of [-1, 1])
      bb.add(GEO.cyl(0.0112, 0.004, 12), "brass", {
        p: [sd * 0.0122, by, -0.075],
      });
    const barrels = P.part(root, bb, [0, 0.036, -0.075], "barrels");
    // hammers
    const hb = P.builder();
    for (const sd of [-1, 1])
      hb.profile(
        "steel",
        [
          [0.004, -0.006],
          [0.004, 0.01],
          [-0.004, 0.02],
          [-0.016, 0.022],
          [-0.01, 0.012],
          [-0.006, -0.006],
        ],
        0.006,
        { bevel: 0.001, p: [sd * 0.014, 0, 0] },
      );
    const hammer = P.part(root, hb, [0, 0.07, 0.02], "hammer");
    hammer.children[0].position.set(0, 0, 0);
    const trigger = triggerPart(root, [0, 0.036, -0.02]);
    // spare shells in the left hand during reload
    const sb = P.builder();
    for (const sd of [-1, 1]) {
      sb.cyl("red", 0.0105, 0.05, [sd * 0.012, 0, -0.02], { seg: 10 });
      sb.cyl("brass", 0.011, 0.014, [sd * 0.012, 0, 0.012], { seg: 10 });
    }
    const loadShells = P.part(root, sb, null, "loadShells");
    loadShells.position.set(0, by + 0.005, -0.12);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.38]),
      eject: P.socket(barrels, "eject", [-0.0122, by, -0.07]),
      eject2: P.socket(barrels, "eject2", [0.0122, by, -0.07]),
      sight: P.socket(root, "sight", [0, by + 0.024, 0.02]),
      rightHand: P.handSocket(
        root,
        "rightHand",
        [0.001, -0.01, 0.008],
        P.gripAxis(A),
        [0.8, 0.2, 0.5],
      ),
      leftHand: leftUnder(barrels, "leftHand", [0, 0.04, -0.17], -0.35),
      load: leftUnder(root, "load", [-0.012, by + 0.03, -0.11], 1.5),
    };
    return {
      root,
      parts: { barrels, hammer, trigger, loadShells },
      sockets,
      cfg: {
        hip: { p: [0.12, -0.13, -0.28], r: [0.02, 0.06, 0] },
        adsDist: 0.26,
        rightPose: "trigger",
        leftPose: "support",
        shot: [
          { part: "trigger", r: [-0.3, 0, 0], held: true },
          { part: "hammer", r: [-0.7, 0, 0], dur: 0.12 },
        ],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
        onFrame(m) {
          if (!P.action || P.action.name !== "reload")
            m.parts.loadShells.visible = false;
        },
      },
    };
  };
