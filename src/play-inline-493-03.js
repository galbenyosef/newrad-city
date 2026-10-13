// play-inline-493 03 — root
// Lines 391-678 of readable/play-inline-493.pretty.js (statement-aligned).
  M.mat49_smg = function () {
    const root = new THREE.Group();
    root.name = "mat49_smg";
    const b = P.builder();
    const A = 0.34,
      by = 0.07;
    // pistol grip: stamped steel shell with bakelite panels, grip-safety lever down the back strap
    pistolGrip(b, "blued", A, { top: 0.036, w: 0.028, grooves: false });
    b.profile(
      "bakelite",
      raked(
        [
          [-0.017, -0.048],
          [0.014, -0.048],
          [0.016, 0.026],
          [-0.02, 0.028],
        ],
        A,
      ),
      0.0305,
      { bevel: 0.0012 },
    );
    b.profile(
      "steel",
      raked(
        [
          [-0.028, -0.04],
          [-0.022, -0.04],
          [-0.022, 0.024],
          [-0.028, 0.02],
        ],
        A,
      ),
      0.012,
      { bevel: 0.001 },
    );
    // receiver: a stamped tube with a flat belly, the cocking slot on the left
    b.cyl("blued", 0.02, 0.26, [0, by, -0.04], { seg: 18, wear: 0.8 });
    b.box("blued", 0.03, 0.026, 0.22, [0, by - 0.018, -0.03], {
      bevel: 0.004,
      wear: 0.8,
    });
    b.box("darksteel", 0.004, 0.006, 0.09, [-0.0196, by + 0.004, -0.07], {
      bevel: 0,
      tint: 0.4,
    });
    b.add(GEO.cyl(0.02, 0.012, 18), "darksteel", { p: [0, by, 0.095] }); // end cap
    b.box("darksteel", 0.004, 0.016, 0.05, [0.0196, by, -0.02], {
      bevel: 0.001,
      tint: 0.5,
    }); // ejection port
    // perforated barrel jacket + muzzle
    b.tube("blued", 0.016, 0.012, 0.1, [0, by, -0.22], { seg: 16 });
    for (let i = 0; i < 6; i++)
      for (const a of [0.6, -0.6, 2.2])
        b.add(GEO.cylX(0.0032, 0.004, 8), "darksteel", {
          p: [Math.cos(a) * 0.016, by + Math.sin(a) * 0.016, -0.18 - i * 0.014],
          r: [0, 0, a],
          tint: 0.3,
        });
    C.barrel(b, "darksteel", 0.0075, -0.27, -0.3, by, { crown: true });
    // sights: rear flip aperture on the cap, front post on the jacket
    b.box("blued", 0.018, 0.02, 0.012, [0, by + 0.028, 0.06], { bevel: 0.002 });
    b.tube("darksteel", 0.006, 0.0026, 0.004, [0, by + 0.042, 0.06], {
      seg: 12,
    });
    b.box("blued", 0.012, 0.026, 0.01, [0, by + 0.024, -0.255], {
      bevel: 0.002,
    });
    b.box("darksteel", 0.0025, 0.01, 0.004, [0, by + 0.042, -0.255], {
      bevel: 0,
    });
    // magazine housing (the fore-grip) ahead of the trigger guard, hinge pin + release button
    b.box("blued", 0.03, 0.06, 0.04, [0, by - 0.054, -0.1], {
      bevel: 0.004,
      wear: 0.8,
    });
    b.add(GEO.cylX(0.004, 0.034, 10), "steel", { p: [0, by - 0.03, -0.122] });
    b.box("steel", 0.006, 0.01, 0.012, [0.016, by - 0.07, -0.085], {
      bevel: 0.0015,
    });
    triggerGuard(b, "blued", 0.012, 0.06, 0.035, 0.026);
    // telescoping wire stock: two rods through the receiver sides, a curved butt plate
    for (const sd of [-1, 1])
      b.cyl("steel", 0.0035, 0.26, [sd * 0.018, by - 0.012, 0.18], { seg: 8 });
    b.add(
      GEO.lathe(
        [
          [0.0, 0.0],
          [0.03, 0.002],
          [0.038, 0.01],
          [0.04, 0.016],
        ],
        14,
      ).rotateX(Math.PI / 2),
      "blued",
      { p: [0, by - 0.02, 0.31], s: [0.9, 1.4, 1] },
    );
    b.box("steel", 0.045, 0.012, 0.01, [0, by - 0.012, 0.3], { bevel: 0.002 });
    // stamped marking plate
    b.box("darksteel", 0.0008, 0.008, 0.04, [0.0201, by - 0.016, -0.04], {
      bevel: 0,
      tint: 0.7,
    });
    root.add(b.build());
    const ch = P.builder();
    ch.box("steel", 0.014, 0.008, 0.008, [-0.026, by + 0.006, -0.11], {
      bevel: 0.002,
    });
    ch.add(GEO.sphere(0.005, 8, 6), "steel", {
      p: [-0.034, by + 0.006, -0.11],
    });
    const charger = P.part(root, ch, null, "charger");
    const trigger = triggerPart(root, [0, 0.03, -0.034]);
    const mb = C.boxMag("darksteel", 0.02, 0.15, 0.028, 0.0, {
      plate: "steel",
      round: "brass",
    });
    const mag = P.part(root, mb, null, "mag");
    mag.children[0].position.set(0, by - 0.05, -0.088);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.305]),
      eject: P.socket(root, "eject", [0.022, by, -0.02]),
      sight: P.socket(root, "sight", [0, by + 0.042, 0.06]),
      rightHand: rightOnGrip(root, A),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [-0.001, by - 0.07, -0.1],
        [0, 0.99, -0.1],
        [-0.85, 0, 0.45],
      ),
      magGrip: leftUnder(mag, "magGrip", [0, by - 0.18, -0.1], 1.2),
      chargeGrip: P.handSocket(
        charger,
        "chargeGrip",
        [-0.044, by + 0.006, -0.11],
        [0, -1, 0],
        [-1, 0, 0.2],
      ),
    };
    return {
      root,
      parts: { charger, trigger, mag },
      sockets,
      cfg: {
        hip: { p: [0.12, -0.13, -0.28], r: [0.02, 0.06, 0] },
        adsDist: 0.2,
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "mag",
          axis: [0, -1, 0],
          out: 0.08,
          away: [-0.03, -0.35, 0.05],
          tilt: { p: [-0.02, -0.02, 0.03], r: [0.12, 0.25, 0.55] },
          charge: { part: "charger", p: [0, 0, 0.05], grip: "chargeGrip" },
        },
        shot: [
          { part: "trigger", r: [-0.3, 0, 0], held: true },
          { part: "charger", p: [0, 0, 0.03], dur: 0.04 },
        ],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
      },
    };
  };

  // ------------------------------------------------------------------
  // 10mm SMG — boxy stamped receiver, straight mag, wire stock, foregrip
  // ------------------------------------------------------------------
  M.smg_10mm = function () {
    const root = new THREE.Group();
    root.name = "smg_10mm";
    const b = P.builder();
    const A = 0.3,
      by = 0.072;
    pistolGrip(b, "rubber", A, { top: 0.035, w: 0.03 });
    // tubular receiver with cooling holes shroud
    b.cyl("gunmetal", 0.024, 0.26, [0, 0.07, -0.06], { seg: 16 });
    b.box("gunmetal", 0.036, 0.03, 0.2, [0, 0.05, -0.04], { bevel: 0.004 });
    b.add(GEO.cyl(0.024, 0.012, 16), "darksteel", { p: [0, 0.07, 0.075] }); // end cap
    for (let i = 0; i < 5; i++)
      for (const a of [0.9, 2.2, -0.9])
        b.add(GEO.cylX(0.004, 0.004, 8), "darksteel", {
          p: [
            Math.cos(a) * 0.024,
            0.07 + Math.sin(a) * 0.024,
            -0.13 - i * 0.016,
          ],
          r: [0, 0, a],
        });
    b.tube("darksteel", 0.018, 0.012, 0.08, [0, by, -0.225], { seg: 14 }); // barrel shroud
    C.barrel(b, "darksteel", 0.0075, -0.26, -0.3, by, { crown: true });
    // magwell ahead of the trigger + straight mag
    b.box("gunmetal", 0.03, 0.03, 0.04, [0, 0.03, -0.08], { bevel: 0.003 });
    triggerGuard(b, "gunmetal", 0.012, 0.058, 0.035, 0.026);
    // sights: rear aperture, front hooded post
    // (raised on a post: the sight line clears the receiver's end cap by ~2.5 cm, so ADS shows the aperture
    //  ring over the tube instead of the cap filling the sight picture)
    b.box("gunmetal", 0.02, 0.034, 0.012, [0, 0.103, 0.04], { bevel: 0.002 });
    b.tube("darksteel", 0.0065, 0.0028, 0.004, [0, 0.12, 0.04], { seg: 12 });
    b.box("gunmetal", 0.016, 0.04, 0.012, [0, 0.1, -0.2], { bevel: 0.002 });
    b.box("darksteel", 0.0025, 0.01, 0.004, [0, 0.118, -0.2], { bevel: 0 });
    // vertical foregrip
    b.profile(
      "rubber",
      raked(
        [
          [-0.015, -0.07],
          [0.015, -0.07],
          [0.016, 0.0],
          [-0.016, 0.0],
        ],
        0.1,
      ).map((p) => [p[0] + 0.19, p[1] + 0.04]),
      0.028,
      { bevel: 0.004 },
    );
    // folding wire stock (two rods + butt plate)
    for (const sd of [-1, 1])
      b.cyl("steel", 0.004, 0.22, [sd * 0.016, 0.06, 0.18], { seg: 8 });
    b.box("steel", 0.04, 0.07, 0.008, [0, 0.04, 0.29], { bevel: 0.003 });
    b.box("rubber", 0.042, 0.072, 0.01, [0, 0.04, 0.298], { bevel: 0.003 });
    root.add(b.build());
    const ch = P.builder();
    ch.box("steel", 0.022, 0.008, 0.008, [-0.03, 0.08, -0.13], {
      bevel: 0.002,
    });
    const charger = P.part(root, ch, null, "charger");
    const trigger = triggerPart(root, [0, 0.03, -0.034]);
    const mb = C.boxMag("darksteel", 0.022, 0.14, 0.03, 0.0, {
      plate: "steel",
      round: "brass",
    });
    const mag = P.part(root, mb, null, "mag");
    mag.children[0].position.set(0, 0.04, -0.065);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.305]),
      eject: P.socket(root, "eject", [0.025, 0.08, -0.04]),
      sight: P.socket(root, "sight", [0, 0.12, 0.04]),
      rightHand: rightOnGrip(root, A),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [-0.001, 0.005, -0.192],
        [0, 0.99, -0.1],
        [-0.85, 0, 0.45],
      ),
      magGrip: leftUnder(mag, "magGrip", [0, -0.11, -0.08], 1.2),
      chargeGrip: P.handSocket(
        charger,
        "chargeGrip",
        [-0.05, 0.08, -0.13],
        [0, -1, 0],
        [-1, 0, 0.2],
      ),
    };
    return {
      root,
      parts: { charger, trigger, mag },
      sockets,
      cfg: {
        hip: { p: [0.12, -0.13, -0.28], r: [0.02, 0.06, 0] },
        adsDist: 0.2,
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "mag",
          axis: [0, -1, 0],
          out: 0.08,
          away: [-0.03, -0.35, 0.05],
          tilt: { p: [-0.02, -0.02, 0.03], r: [0.12, 0.25, 0.55] },
          charge: { part: "charger", p: [0, 0, 0.05], grip: "chargeGrip" },
        },
        shot: [
          { part: "trigger", r: [-0.3, 0, 0], held: true },
          { part: "charger", p: [0, 0, 0.03], dur: 0.04 },
        ],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
      },
    };
  };

  // ------------------------------------------------------------------
  // HUNTING RIFLE — bolt action, walnut stock, hunter's scope
  // ------------------------------------------------------------------
