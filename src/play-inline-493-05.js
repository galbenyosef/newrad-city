// play-inline-493 05 — root
// Lines 1017-1320 of readable/play-inline-493.pretty.js (statement-aligned).
  M.bb_gun = function () {
    const root = new THREE.Group();
    root.name = "bb_gun";
    const b = P.builder();
    const A = 0.9,
      by = 0.058;
    // stock (straight wrist, carbine style) + forend
    b.profile(
      "woodLight",
      [
        [0.03, 0.055],
        [0.03, 0.02],
        [0.0, -0.03],
        [-0.03, -0.04],
        [-0.28, -0.03],
        [-0.3, -0.032],
        [-0.3, 0.07],
        [-0.1, 0.066],
        [-0.02, 0.06],
      ],
      0.036,
      { bevel: 0.005 },
    );
    b.profile(
      "woodLight",
      [
        [0.13, 0.058],
        [0.33, 0.056],
        [0.34, 0.048],
        [0.34, 0.034],
        [0.13, 0.034],
      ],
      0.032,
      { bevel: 0.004 },
    );
    b.box("brushed", 0.036, 0.004, 0.02, [0, 0.054, -0.34], { bevel: 0.001 }); // forend band
    // receiver: stamped with a painted brand panel
    b.profile(
      "darksteel",
      [
        [-0.02, 0.078],
        [0.14, 0.078],
        [0.14, 0.03],
        [0.03, 0.02],
        [-0.02, 0.03],
      ],
      0.03,
      { bevel: 0.003 },
    );
    b.box("red", 0.0008, 0.018, 0.08, [0.0155, 0.055, -0.06], { bevel: 0 });
    b.add(GEO.torus(0.012, 0.0022, 5, 14), "brass", {
      p: [-0.017, 0.062, -0.02],
      r: [0, Math.PI / 2, 0],
    }); // saddle ring
    // barrel tube + magazine tube underneath
    C.barrel(b, "darksteel", 0.0085, -0.14, -0.62, by + 0.01, { seg: 14 });
    b.cyl("darksteel", 0.0065, 0.44, [0, by - 0.012, -0.36], { seg: 12 });
    b.add(GEO.cyl(0.008, 0.012, 12), "brass", { p: [0, by - 0.012, -0.585] });
    // sights
    b.box("brass", 0.003, 0.012, 0.004, [0, by + 0.024, -0.6], { bevel: 0 });
    b.box("darksteel", 0.018, 0.01, 0.006, [0, by + 0.024, -0.02], {
      bevel: 0.001,
    });
    root.add(b.build());
    // lever loop (part), pivot in front of the trigger
    const lb = P.builder();
    lb.add(
      GEO.shapeProfile(
        (s) => {
          s.moveTo(0.04, 0.02);
          s.lineTo(0.0, 0.02);
          s.quadraticCurveTo(-0.03, 0.0, -0.035, -0.05);
          s.quadraticCurveTo(-0.02, -0.065, 0.02, -0.06);
          s.lineTo(0.04, -0.01);
          s.lineTo(0.04, 0.02);
          const h = new THREE.Path();
          h.moveTo(0.03, 0.008);
          h.lineTo(0.005, 0.008);
          h.quadraticCurveTo(-0.02, -0.005, -0.024, -0.045);
          h.quadraticCurveTo(-0.014, -0.054, 0.016, -0.05);
          h.lineTo(0.03, -0.012);
          h.lineTo(0.03, 0.008);
          s.holes.push(h);
        },
        0.01,
        0.0015,
      ),
      "darksteel",
      {},
    );
    const lever = P.part(root, lb, [0, 0.022, -0.035], "lever");
    lever.children[0].position.set(0, 0.0, 0.0);
    lever.children[0].position.set(0, -0.0, 0);
    const trigger = triggerPart(root, [0, 0.028, -0.02]);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by + 0.01, -0.625]),
      eject: P.socket(root, "eject", [0.0, by + 0.02, -0.03]),
      sight: P.socket(root, "sight", [0, by + 0.029, -0.02]),
      rightHand: P.handSocket(
        lever,
        "rightHand",
        [0.0, -0.035, 0.03],
        P.gripAxis(A),
        [0.8, 0.2, 0.5],
      ),
      leftHand: leftUnder(root, "leftHand", [0, 0.046, -0.24], -0.35),
      load: leftUnder(root, "load", [0, by - 0.02, -0.56], 1.2),
    };
    return {
      root,
      parts: { lever, trigger },
      sockets,
      cfg: {
        hip: { p: [0.115, -0.125, -0.26], r: [0.02, 0.05, 0] },
        adsDist: 0.2,
        rightPose: "trigger",
        leftPose: "support",
        cycle: { angle: 0.9, dur: 0.42 },
        reload: {
          type: "single",
          grip: "load",
          tRound: 0.8,
          tilt: { p: [-0.02, 0.02, 0.02], r: [0.35, 0.1, 0.3] },
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
      },
    };
  };

  // ------------------------------------------------------------------
  // COMBAT SHOTGUN — drum-fed, perforated heat shield, pistol grip
  // ------------------------------------------------------------------
  M.combat_shotgun = function () {
    const root = new THREE.Group();
    root.name = "combat_shotgun";
    const b = P.builder();
    const A = 0.3,
      by = 0.08;
    pistolGrip(b, "plastic", A, { top: 0.04, w: 0.032 });
    // receiver
    b.profile(
      "gunmetal",
      [
        [-0.06, 0.04],
        [0.19, 0.04],
        [0.2, 0.05],
        [0.2, 0.108],
        [-0.04, 0.108],
        [-0.06, 0.09],
      ],
      0.044,
      { bevel: 0.004 },
    );
    b.box("darksteel", 0.004, 0.022, 0.06, [0.0215, 0.086, -0.02], {
      bevel: 0.001,
    }); // ejection port
    b.box("gunmetal", 0.012, 0.008, 0.2, [0, 0.112, -0.06], { bevel: 0.002 }); // top rail
    for (let i = 0; i < 8; i++)
      b.box("darksteel", 0.014, 0.003, 0.004, [0, 0.117, 0.03 - i * 0.022], {
        bevel: 0,
      });
    triggerGuard(b, "gunmetal", 0.012, 0.064, 0.042, 0.03);
    // barrel inside a perforated heat shield
    C.barrel(b, "darksteel", 0.013, -0.2, -0.56, by + 0.01, {
      bore: 0.72,
      seg: 16,
    });
    b.add(
      new THREE.CylinderGeometry(
        0.02,
        0.02,
        0.3,
        16,
        1,
        true,
        -Math.PI * 0.7,
        Math.PI * 1.4,
      ).rotateX(-Math.PI / 2),
      "gunmetal",
      { p: [0, by + 0.012, -0.36] },
    );
    for (let i = 0; i < 9; i++)
      for (const a of [0.0, 0.9, -0.9])
        b.add(GEO.cylX(0.004, 0.003, 8), "darksteel", {
          p: [
            Math.sin(a) * 0.0205,
            by + 0.012 + Math.cos(a) * 0.0205,
            -0.23 - i * 0.03,
          ],
          r: [0, 0, -a + Math.PI / 2],
        });
    // under-barrel foregrip housing
    b.add(
      GEO.lathe(
        [
          [0.02, 0.2],
          [0.024, 0.21],
          [0.024, 0.34],
          [0.02, 0.35],
        ],
        14,
      ),
      "plastic",
      { p: [0, by - 0.032, 0], s: [1.1, 1, 1] },
    );
    for (let i = 0; i < 6; i++)
      b.add(GEO.torus(0.0235, 0.0025, 4, 14), "rubber", {
        p: [0, by - 0.032, -0.225 - i * 0.022],
        s: [1.1, 1, 1],
      });
    // ghost ring sights
    b.tube("darksteel", 0.009, 0.005, 0.004, [0, 0.132, 0.05], { seg: 12 });
    b.box("darksteel", 0.02, 0.012, 0.006, [0, 0.12, 0.05], { bevel: 0.001 });
    b.box("darksteel", 0.004, 0.022, 0.006, [0, 0.11, -0.54], { bevel: 0.001 });
    // folding stock: tubular frame + pad
    b.cyl("steel", 0.006, 0.22, [0, 0.1, 0.16], { seg: 10 });
    b.cyl("steel", 0.006, 0.24, [0, 0.045, 0.17], { seg: 10, r: [0.12, 0, 0] });
    b.box("rubber", 0.04, 0.09, 0.02, [0, 0.07, 0.29], { bevel: 0.006 });
    root.add(b.build());
    // drum magazine (part)
    const db = P.builder();
    db.add(GEO.cylX(0.07, 0.05, 24), "gunmetal", { p: [0, -0.04, 0.0] });
    db.add(GEO.cylX(0.072, 0.008, 24), "darksteel", { p: [0.026, -0.04, 0.0] });
    db.add(GEO.cylX(0.072, 0.008, 24), "darksteel", {
      p: [-0.026, -0.04, 0.0],
    });
    db.add(GEO.cylX(0.02, 0.056, 12), "steel", { p: [0, -0.04, 0.0] });
    db.add(GEO.cylX(0.008, 0.062, 8), "darksteel", { p: [0, -0.04, 0.0] });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      db.box(
        "darksteel",
        0.052,
        0.006,
        0.006,
        [0, -0.04 + Math.cos(a) * 0.062, Math.sin(a) * 0.062],
        { bevel: 0.001, r: [a, 0, 0] },
      );
    }
    db.box("gunmetal", 0.036, 0.03, 0.05, [0, 0.03, 0.0], { bevel: 0.004 }); // feed neck
    db.box("red", 0.0006, 0.018, 0.018, [0.0292, -0.04, 0.0], { bevel: 0 });
    const drum = P.part(root, db, null, "mag");
    drum.position.set(0, 0.012, -0.11);
    drum.userData.rest = null;
    const ch = P.builder();
    ch.box("steel", 0.024, 0.01, 0.01, [-0.034, 0.095, -0.12], {
      bevel: 0.002,
    });
    const charger = P.part(root, ch, null, "charger");
    const trigger = triggerPart(root, [0, 0.038, -0.034]);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by + 0.01, -0.565]),
      eject: P.socket(root, "eject", [0.024, 0.086, -0.02]),
      sight: P.socket(root, "sight", [0, 0.132, 0.05]),
      rightHand: rightOnGrip(root, A),
      leftHand: leftUnder(root, "leftHand", [0, by - 0.032, -0.27], -0.35),
      magGrip: P.handSocket(
        drum,
        "magGrip",
        [-0.03, -0.06, 0.0],
        [0, 0, -1],
        [-1, 0, 0],
      ),
      chargeGrip: P.handSocket(
        charger,
        "chargeGrip",
        [-0.05, 0.095, -0.12],
        [0, -1, 0],
        [-1, 0, 0.2],
      ),
    };
    return {
      root,
      parts: { mag: drum, charger, trigger },
      sockets,
      cfg: {
        hip: { p: [0.11, -0.125, -0.24], r: [0.02, 0.05, 0] },
        adsDist: 0.2,
        rightPose: "trigger",
        leftPose: "support",
        reload: {
          type: "mag",
          axis: [0, -1, 0.1],
          out: 0.06,
          away: [-0.05, -0.34, 0.08],
          tilt: { p: [-0.02, -0.02, 0.03], r: [0.1, 0.25, 0.6] },
          speed: 1,
          charge: { part: "charger", p: [0, 0, 0.06], grip: "chargeGrip" },
        },
        shot: [
          { part: "trigger", r: [-0.3, 0, 0], held: true },
          { part: "charger", p: [0, 0, 0.04], dur: 0.07 },
        ],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
      },
    };
  };

  // ------------------------------------------------------------------
  // SAWED-OFF — side-by-side double barrel, cut stock, twin hammers
  // ------------------------------------------------------------------
