// play-inline-493 02 — bevel
// Lines 187-390 of readable/play-inline-493.pretty.js (statement-aligned).
  M.assault_rifle = function () {
    const root = new THREE.Group();
    root.name = "assault_rifle";
    const b = P.builder();
    const A = 0.32,
      recY0 = 0.035,
      recY1 = 0.1,
      by = 0.078;
    // pistol grip + trigger housing
    pistolGrip(b, "plastic", A, { top: 0.04, w: 0.03 });
    b.profile(
      "plastic",
      [
        [-0.03, 0.035],
        [0.07, 0.035],
        [0.075, 0.028],
        [0.06, 0.02],
        [-0.02, 0.02],
        [-0.035, 0.028],
      ],
      0.034,
      { bevel: 0.002 },
    );
    triggerGuard(b, "plastic", 0.012, 0.062, 0.022, 0.024);
    // receiver: stamped sheet box with flutes & rivets
    b.profile(
      "gunmetal",
      [
        [-0.07, recY0],
        [0.2, recY0],
        [0.2, 0.095],
        [0.13, 0.1],
        [-0.04, 0.1],
        [-0.07, 0.085],
      ],
      0.036,
      { bevel: 0.003 },
    );
    for (const sd of [-1, 1]) {
      b.box("darksteel", 0.002, 0.01, 0.16, [sd * 0.0182, 0.078, -0.07], {
        bevel: 0.0005,
      }); // pressed flute
      b.rivets(
        "steel",
        [
          [0, 0.05, 0.05],
          [0, 0.05, -0.02],
          [0, 0.05, -0.12],
          [0, 0.088, 0.04],
        ],
        0.0022,
        sd * 0.0185,
      );
    }
    // ejection port (right) and brass deflector
    b.box("darksteel", 0.004, 0.016, 0.045, [0.0176, 0.078, -0.01], {
      bevel: 0.001,
    });
    b.box("gunmetal", 0.008, 0.02, 0.012, [0.021, 0.08, 0.025], {
      bevel: 0.002,
    });
    // magwell + mag release
    b.box("gunmetal", 0.04, 0.03, 0.05, [0, 0.03, -0.085], { bevel: 0.004 });
    b.box("steel", 0.006, 0.008, 0.012, [0.021, 0.026, -0.058], {
      bevel: 0.0015,
    });
    // cocking tube over the barrel + front sight hood
    b.cyl("gunmetal", 0.012, 0.3, [0, 0.102, -0.29], { seg: 14 });
    b.box("gunmetal", 0.03, 0.035, 0.03, [0, 0.1, -0.445], { bevel: 0.004 });
    b.tube("gunmetal", 0.014, 0.011, 0.018, [0, 0.133, -0.445], {
      seg: 14,
      r: [0, 0, 0],
    });
    b.box("darksteel", 0.0025, 0.012, 0.004, [0, 0.128, -0.445], { bevel: 0 });
    // rear sight drum with a notched aperture plate (the sight line passes through the notch)
    b.add(GEO.cylX(0.014, 0.026, 16), "gunmetal", { p: [0, 0.113, 0.02] });
    b.box("darksteel", 0.005, 0.012, 0.006, [-0.0055, 0.128, 0.02], {
      bevel: 0.001,
    });
    b.box("darksteel", 0.005, 0.012, 0.006, [0.0055, 0.128, 0.02], {
      bevel: 0.001,
    });
    b.box("darksteel", 0.016, 0.004, 0.006, [0, 0.124, 0.02], { bevel: 0.001 });
    // handguard: thick olive with cooling slots
    b.add(
      GEO.lathe(
        [
          [0.026, 0.2],
          [0.03, 0.205],
          [0.031, 0.23],
          [0.029, 0.42],
          [0.024, 0.43],
        ],
        16,
      ),
      "olive",
      { p: [0, 0.078, 0], s: [1.0, 1.1, 1] },
    );
    for (let i = 0; i < 7; i++)
      for (const sd of [-1, 1])
        b.box(
          "darksteel",
          0.004,
          0.018,
          0.012,
          [sd * 0.028, 0.08, -0.225 - i * 0.027],
          { bevel: 0.002 },
        );
    // barrel + slotted flash hider
    C.barrel(b, "darksteel", 0.009, -0.42, -0.6, by, { crown: false });
    flashHider(b, "darksteel", 0.012, -0.6, 0.06, by, 4);
    // stock: fixed polymer, drop at the heel, rubber butt pad, sling swivel
    b.profile(
      "olive",
      [
        [-0.07, 0.098],
        [-0.07, 0.035],
        [-0.12, 0.02],
        [-0.31, 0.012],
        [-0.33, 0.01],
        [-0.33, 0.11],
        [-0.3, 0.115],
        [-0.12, 0.1],
      ],
      0.04,
      { bevel: 0.006 },
    );
    b.profile(
      "rubber",
      [
        [-0.33, 0.012],
        [-0.345, 0.012],
        [-0.345, 0.11],
        [-0.33, 0.11],
      ],
      0.042,
      { bevel: 0.004 },
    );
    swivel(b, 0, 0.005, 0.28);
    // U.S. ARMY stencil plate
    b.box("tan", 0.0008, 0.01, 0.05, [0.0202, 0.062, 0.2], { bevel: 0 });
    root.add(b.build());
    // --- parts ---
    const ch = P.builder();
    ch.box("steel", 0.012, 0.008, 0.01, [-0.018, 0.102, -0.31], {
      bevel: 0.002,
    });
    ch.add(GEO.cylX(0.004, 0.02, 8), "steel", { p: [-0.024, 0.102, -0.31] });
    const charger = P.part(root, ch, null, "charger");
    const trigger = triggerPart(root, [0, 0.03, -0.036]);
    const mb = C.boxMag("gunmetal", 0.024, 0.13, 0.042, 0.018, {
      plate: "darksteel",
      round: "brass",
    });
    const mag = P.part(root, mb, null, "mag");
    mag.children[0].position.set(0, 0.04, -0.064);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.665]),
      eject: P.socket(root, "eject", [0.02, 0.08, -0.01]),
      sight: P.socket(root, "sight", [0, 0.1335, 0.02]),
      rightHand: rightOnGrip(root, A),
      leftHand: leftUnder(root, "leftHand", [-0.002, 0.078, -0.232], -0.35),
      magGrip: leftUnder(mag, "magGrip", [-0.004, -0.08, -0.085], 1.2),
      chargeGrip: P.handSocket(
        charger,
        "chargeGrip",
        [-0.035, 0.09, -0.31],
        [0, -1, 0],
        [-1, 0, 0.2],
      ),
    };
    return {
      root,
      parts: { charger, trigger, mag },
      sockets,
      cfg: {
        hip: { p: [0.11, -0.128, -0.24], r: [0.02, 0.05, 0] },
        adsDist: 0.16,
        rightPose: "trigger",
        leftPose: "support",
        reload: {
          type: "mag",
          axis: [0, -0.96, -0.28],
          out: 0.08,
          away: [-0.03, -0.35, 0.05],
          tilt: { p: [-0.02, -0.02, 0.03], r: [0.12, 0.2, 0.5] },
          charge: { part: "charger", p: [0, 0, 0.06], grip: "chargeGrip" },
        },
        shot: [
          { part: "trigger", r: [-0.3, 0, 0], held: true },
          { part: "charger", p: [0, 0, 0.03], dur: 0.05 },
        ],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
      },
    };
  };

  // ------------------------------------------------------------------
  // MAT-49: a French stamped-steel SMG. Tubular receiver, perforated barrel
  // jacket, the magazine housing ahead of the trigger guard doubles as the
  // fore-grip (it folds forward under the barrel for carrying), grip safety
  // on the back strap, a telescoping two-rod wire stock.
  // ------------------------------------------------------------------
