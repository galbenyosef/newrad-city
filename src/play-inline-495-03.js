// play-inline-495 03 — box
// Lines 609-843 of readable/play-inline-495.pretty.js (statement-aligned).
  M.belt_fed_mg = function () {
    const root = new THREE.Group();
    root.name = "belt_fed_mg";
    const b = P.builder();
    const A = 0.3,
      by = 0.08;
    R().pistolGrip(b, "plastic", A, { top: 0.04, w: 0.03 });
    // receiver: long box, flat sides, feed tray in the middle
    b.profile(
      "gunmetal",
      [
        [-0.08, 0.034],
        [0.26, 0.034],
        [0.26, 0.11],
        [0.2, 0.116],
        [-0.06, 0.116],
        [-0.08, 0.1],
      ],
      0.044,
      { bevel: 0.003, wear: 0.6 },
    );
    for (const sd of [-1, 1])
      b.rivets(
        "steel",
        [
          [0, 0.046, 0.04],
          [0, 0.046, -0.1],
          [0, 0.046, -0.22],
          [0, 0.104, 0.05],
        ],
        0.0024,
        sd * 0.0222,
      );
    // hinged feed cover on top (the "lid") with its latch
    b.box("darksteel", 0.05, 0.016, 0.16, [0, 0.124, -0.08], { bevel: 0.004 });
    b.add(GEO.cylX(0.006, 0.054, 10), "steel", { p: [0, 0.122, 0.0] });
    b.box("steel", 0.014, 0.01, 0.012, [0, 0.134, -0.16], { bevel: 0.002 });
    // feed tray mouth on the left with the belt entering (brass links)
    b.box("darksteel", 0.012, 0.03, 0.05, [-0.028, 0.096, -0.08], {
      bevel: 0.002,
    });
    for (let i = 0; i < 6; i++)
      b.box(
        "brass",
        0.03,
        0.007,
        0.007,
        [-0.04 - i * 0.012, 0.09 - i * 0.012, -0.08],
        { bevel: 0.001, r: [0, 0, 0.7] },
      );
    R().triggerGuard(b, "gunmetal", 0.012, 0.064, 0.036, 0.026);
    // rear sight leaf on the cover
    b.box("darksteel", 0.018, 0.022, 0.006, [0, 0.142, 0.02], { bevel: 0.001 });
    b.box("darksteel", 0.006, 0.008, 0.007, [0, 0.156, 0.02], {
      bevel: 0.0008,
    });
    // barrel: heavy, with a finned breech end, carry handle, gas tube & front sight
    C.barrel(b, "darksteel", 0.0125, -0.26, -0.78, by, {
      crown: false,
      seg: 16,
    });
    for (let i = 0; i < 6; i++)
      b.add(GEO.torus(0.0142, 0.0022, 5, 16), "darksteel", {
        p: [0, by, -0.28 - i * 0.012],
      });
    R().flashHider(b, "darksteel", 0.016, -0.78, 0.07, by, 6);
    b.cyl("gunmetal", 0.011, 0.36, [0, by - 0.03, -0.44], { seg: 12 }); // gas tube
    b.box("gunmetal", 0.03, 0.05, 0.03, [0, by - 0.012, -0.62], {
      bevel: 0.004,
    }); // gas block
    b.add(
      GEO.hose(
        [
          [0, by + 0.014, -0.3],
          [0.0, by + 0.07, -0.33],
          [0.0, by + 0.075, -0.43],
          [0, by + 0.014, -0.46],
        ],
        0.006,
        18,
        8,
      ),
      "darksteel",
    ); // carry handle
    b.cyl("woodLight", 0.0095, 0.08, [0, by + 0.075, -0.38], {
      seg: 12,
      tint: 0.7,
    });
    b.box("darksteel", 0.004, 0.034, 0.008, [0, by + 0.024, -0.74], {
      bevel: 0.001,
    }); // front post
    // folded bipod under the gas tube
    for (const sx of [-1, 1])
      b.cyl("steel", 0.0045, 0.3, [sx * 0.012, by - 0.048, -0.5], { seg: 8 });
    b.box("darksteel", 0.03, 0.02, 0.03, [0, by - 0.04, -0.66], {
      bevel: 0.003,
    });
    // handguard (left hand) under the receiver front
    b.profile(
      "plastic",
      [
        [0.26, 0.03],
        [0.4, 0.04],
        [0.4, 0.07],
        [0.26, 0.07],
      ],
      0.04,
      { bevel: 0.004 },
    );
    // polymer stock with a butt plate & shoulder strap
    b.profile(
      "plastic",
      [
        [-0.08, 0.1],
        [-0.08, 0.036],
        [-0.12, 0.024],
        [-0.33, 0.016],
        [-0.35, 0.016],
        [-0.35, 0.106],
        [-0.32, 0.112],
        [-0.12, 0.104],
      ],
      0.042,
      { bevel: 0.006 },
    );
    b.profile(
      "steel",
      [
        [-0.35, 0.016],
        [-0.358, 0.016],
        [-0.358, 0.106],
        [-0.35, 0.106],
      ],
      0.044,
      { bevel: 0.002 },
    );
    b.box("tan", 0.0008, 0.012, 0.06, [0.0222, 0.06, 0.12], { bevel: 0 });
    root.add(b.build());
    // the 100-round box (part) hung on the left, belt running up into the tray
    const ab = P.builder();
    ab.box("olive", 0.06, 0.1, 0.13, [0, 0, 0], { bevel: 0.006 });
    ab.box("darksteel", 0.062, 0.012, 0.132, [0, 0.045, 0], { bevel: 0.003 });
    ab.box("yellow", 0.0008, 0.024, 0.07, [-0.0306, -0.01, 0], { bevel: 0 });
    for (let i = 0; i < 5; i++)
      ab.box(
        "brass",
        0.03,
        0.007,
        0.007,
        [0.01 + i * 0.004, 0.056 + i * 0.008, 0.0],
        { bevel: 0.001, r: [0, 0, 0.7] },
      );
    const mag = P.part(root, ab, null, "mag");
    mag.position.set(-0.075, 0.03, -0.08);
    mag.userData.rest = null;
    const trigger = R().triggerPart(root, [0, 0.03, -0.036]);
    const ch = P.builder();
    ch.box("steel", 0.016, 0.01, 0.01, [0.03, 0.07, -0.16], { bevel: 0.002 });
    ch.add(GEO.sphere(0.006, 8, 6), "steel", { p: [0.04, 0.07, -0.16] });
    const charger = P.part(root, ch, null, "charger");
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.85]),
      eject: P.socket(root, "eject", [0.024, 0.06, -0.06]),
      sight: P.socket(root, "sight", [0, 0.16, 0.02]),
      rightHand: R().rightOnGrip(root, A),
      leftHand: R().leftUnder(root, "leftHand", [0, 0.034, -0.34], -0.35),
      magGrip: R().leftUnder(mag, "magGrip", [-0.01, -0.06, 0.0], 1.0),
      chargeGrip: P.handSocket(
        charger,
        "chargeGrip",
        [0.05, 0.07, -0.16],
        [0, -1, 0],
        [1, 0, 0.2],
      ),
    };
    return {
      root,
      parts: { mag, trigger, charger },
      sockets,
      cfg: {
        hip: { p: [0.13, -0.17, -0.3], r: [0.03, 0.06, 0.02] },
        adsDist: 0.2,
        rightPose: "trigger",
        leftPose: "support",
        reload: {
          type: "mag",
          grip: "magGrip",
          axis: [-0.3, -1, 0],
          out: 0.05,
          away: [-0.1, -0.3, 0.1],
          tilt: { p: [0.0, -0.02, 0.03], r: [0.05, -0.2, -0.3] },
          charge: {
            part: "charger",
            p: [0, 0, 0.06],
            grip: "chargeGrip",
            hand: "R",
          },
        },
        shot: [
          { part: "trigger", r: [-0.3, 0, 0], held: true },
          { part: "charger", p: [0, 0, 0.02], dur: 0.04 },
        ],
        sprint: { p: [-0.04, -0.06, 0.04], r: [-0.25, 0.5, 0.3] },
        lower: { p: [0.06, -0.35, 0.1], r: [-0.7, 0.3, 0.2] },
      },
    };
  };

  // ------------------------------------------------------------------
  // Ammo pickups (world materials)
  // ------------------------------------------------------------------
  const AMMO_LOOK = {
    ammo_32: { box: [0.07, 0.035, 0.05], band: "red", col: "tan" },
    ammo_10mm: { box: [0.08, 0.04, 0.055], band: "enamelBlue", col: "tan" },
    ammo_44: { box: [0.08, 0.045, 0.06], band: "yellow", col: "tan" },
    ammo_308: { box: [0.1, 0.04, 0.07], band: "olive", col: "tan" },
    ammo_556: { can: true, col: "olive" },
    ammo_5mm: { can: true, col: "olive", big: true },
    ammo_12ga: {
      box: [0.11, 0.06, 0.07],
      band: "red",
      col: "red",
      shells: true,
    },
    ammo_bb: { tube: true, col: "yellow" },
    ammo_gyrojet: {
      box: [0.09, 0.035, 0.06],
      band: "enamelBlue",
      col: "white",
      rockets: true,
    },
    ammo_rivet: { keg: true },
    ammo_dry_cell: { battery: true },
    ammo_flamer_fuel: { fuel: true },
  };
