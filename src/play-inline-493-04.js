// play-inline-493 04 — root
// Lines 679-1016 of readable/play-inline-493.pretty.js (statement-aligned).
  function boltRifle(o) {
    const root = new THREE.Group();
    root.name = o.name;
    const b = P.builder();
    const A = 0.95; // steep wrist of a sporter stock
    const by = 0.062;
    const wood = o.wood || "wood";
    // stock: one-piece walnut, pistol-grip wrist, cheek piece, forend
    b.profile(
      wood,
      [
        [0.02, 0.06],
        [0.33, 0.058],
        [0.36, 0.05],
        [0.36, 0.032],
        [0.3, 0.028],
        [0.08, 0.02],
        [0.05, -0.005],
        [0.03, -0.035],
        [0.005, -0.055],
        [-0.03, -0.04],
        [-0.06, 0.0],
        [-0.12, 0.005],
        [-0.3, -0.01],
        [-0.33, -0.012],
        [-0.33, 0.085],
        [-0.3, 0.09],
        [-0.12, 0.075],
        [-0.05, 0.06],
      ],
      0.042,
      { bevel: 0.006 },
    );
    // checkering panels on the wrist & forend
    for (const sd of [-1, 1]) {
      b.box("bakelite", 0.002, 0.025, 0.05, [sd * 0.0215, 0.0, 0.015], {
        bevel: 0.0008,
        r: [0.6, 0, 0],
        tint: 0.8,
      });
      b.box("bakelite", 0.002, 0.018, 0.1, [sd * 0.0205, 0.042, -0.22], {
        bevel: 0.0008,
        tint: 0.8,
      });
    }
    // rubber recoil pad + white spacer
    b.profile(
      "rubber",
      [
        [-0.33, -0.012],
        [-0.35, -0.013],
        [-0.35, 0.087],
        [-0.33, 0.085],
      ],
      0.044,
      { bevel: 0.004 },
    );
    b.profile(
      "white",
      [
        [-0.328, -0.012],
        [-0.332, -0.012],
        [-0.332, 0.085],
        [-0.328, 0.085],
      ],
      0.045,
      { bevel: 0.001 },
    );
    // receiver (round, blued) + barrel
    b.cyl("gunmetal", 0.016, 0.2, [0, by, -0.02], { seg: 16 });
    b.box("gunmetal", 0.03, 0.02, 0.2, [0, by - 0.012, -0.02], {
      bevel: 0.004,
    });
    b.box("darksteel", 0.004, 0.014, 0.07, [0.0155, by + 0.004, -0.02], {
      bevel: 0.001,
    }); // ejection port
    C.barrel(
      b,
      "gunmetal",
      o.barrelR || 0.0105,
      -0.12,
      -0.12 - o.barrelLen,
      by,
      { seg: 16 },
    );
    if (o.brake)
      flashHider(b, "darksteel", 0.014, -0.12 - o.barrelLen, 0.05, by, 6);
    // trigger guard & hinged floorplate
    triggerGuard(b, "gunmetal", -0.02, 0.045, 0.02, 0.028);
    b.box("gunmetal", 0.024, 0.006, 0.07, [0, 0.018, -0.075], { bevel: 0.002 });
    // barrel band + swivels
    swivel(b, 0, 0.02, -0.33);
    swivel(b, 0, -0.005, 0.27);
    // scope with rings (or plain iron sights: a notch on the receiver ring, a post on a ramp)
    let eyeZ,
      sightY = 0.112;
    if (o.irons) {
      const zf = -0.12 - o.barrelLen + 0.02;
      C.ironSights(b, "gunmetal", by + 0.016, 0.03, zf, { h: 0.012 });
      b.box("gunmetal", 0.006, 0.006, 0.014, [0, by + 0.013, zf], {
        bevel: 0.001,
      });
      eyeZ = 0.03;
      sightY = by + 0.016 + 0.011;
    } else
      eyeZ = C.scope(b, 0.112, -0.03, o.scopeLen || 0.3, o.scopeR || 0.0095, {
        mountY: by + 0.012,
      });
    root.add(b.build());
    // bolt (part): body inside the receiver, handle on the right with a ball
    const bb = P.builder();
    bb.cyl("steel", 0.011, 0.07, [0, by, 0.1], { seg: 12 });
    bb.box("steel", 0.035, 0.006, 0.008, [0.018, by, 0.075], {
      bevel: 0.002,
      r: [0, 0, -0.35],
    });
    bb.sphere("steel", 0.008, [0.035, by - 0.007, 0.075]);
    bb.add(GEO.cyl(0.012, 0.012, 12), "gunmetal", { p: [0, by, 0.14] }); // bolt shroud
    const bolt = P.part(root, bb, [0, by, 0.1], "bolt");
    const trigger = triggerPart(root, [0, 0.02, 0.0]);
    // cartridge being loaded (per-round reload visual)
    const rb = P.builder();
    rb.add(GEO.cyl(0.0045, 0.05, 8), "brass", { p: [0, by + 0.005, -0.02] });
    rb.add(GEO.cyl(0.003, 0.012, 8, 0.001), "copper", {
      p: [0, by + 0.005, -0.051],
    });
    const round = P.part(root, rb, null, "round");
    const sockets = {
      muzzle: P.socket(root, "muzzle", [
        0,
        by,
        -0.12 - o.barrelLen - (o.brake ? 0.05 : 0) - 0.005,
      ]),
      eject: P.socket(root, "eject", [0.018, by + 0.004, -0.02]),
      sight: P.socket(root, "sight", [0, sightY, eyeZ]),
      rightHand: P.handSocket(
        root,
        "rightHand",
        [0.001, 0.0, 0.008],
        P.gripAxis(A),
        [0.8, 0.2, 0.5],
      ),
      leftHand: leftUnder(root, "leftHand", [0, 0.042, -0.24], -0.35),
      boltGrip: P.handSocket(
        bolt,
        "boltGrip",
        [0.043, by - 0.01, 0.07],
        [0, -0.3, -1],
        [0.9, 0.4, 0],
      ),
      load: leftUnder(root, "load", [-0.01, by + 0.02, -0.03], 1.6),
    };
    return {
      root,
      parts: { bolt, trigger, round },
      sockets,
      cfg: {
        hip: { p: [0.115, -0.13, -0.25], r: [0.02, 0.05, 0] },
        adsDist: o.irons ? 0.24 : 0.12,
        rightPose: "trigger",
        leftPose: "support",
        cycle: { travel: 0.075, lift: 1.1, dur: 0.62 },
        reload: o.semi
          ? {
              type: "mag",
              part: "round",
              axis: [0, -1, 0],
              out: 0.04,
              charge: null,
            }
          : {
              type: "single",
              open: { part: "bolt", r: [0, 0, 1.1], p2: [0, 0, 0.075] },
              grip: "load",
              roundPart: "round",
              roundIn: [0, 0.03, 0.05],
              handOnBolt: true,
              tRound: 0.5,
            },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
      },
    };
  }
  M.hunting_rifle = function () {
    return boltRifle({
      name: "hunting_rifle",
      barrelLen: 0.34,
      scopeLen: 0.28,
    });
  };

  // ------------------------------------------------------------------
  // SNIPER RIFLE — M21-style semi-auto: wood stock, box mag, brake, big scope
  // ------------------------------------------------------------------
  M.sniper_rifle = function () {
    const root = new THREE.Group();
    root.name = "sniper_rifle";
    const b = P.builder();
    const A = 0.95,
      by = 0.062;
    b.profile(
      "wood",
      [
        [0.02, 0.058],
        [0.36, 0.056],
        [0.4, 0.05],
        [0.4, 0.03],
        [0.34, 0.024],
        [0.08, 0.018],
        [0.05, -0.005],
        [0.03, -0.035],
        [0.005, -0.055],
        [-0.03, -0.04],
        [-0.06, 0.0],
        [-0.12, 0.0],
        [-0.3, -0.02],
        [-0.33, -0.022],
        [-0.33, 0.082],
        [-0.3, 0.086],
        [-0.12, 0.07],
        [-0.05, 0.058],
      ],
      0.042,
      { bevel: 0.006 },
    );
    b.profile(
      "rubber",
      [
        [-0.33, -0.022],
        [-0.35, -0.023],
        [-0.35, 0.084],
        [-0.33, 0.082],
      ],
      0.044,
      { bevel: 0.004 },
    );
    // cheek riser (leather)
    b.box("leather", 0.046, 0.03, 0.14, [0, 0.085, 0.2], { bevel: 0.008 });
    // receiver (M14 style: op-rod on the right)
    b.box("gunmetal", 0.032, 0.03, 0.22, [0, by, -0.03], { bevel: 0.004 });
    b.cyl("steel", 0.004, 0.2, [0.018, by - 0.006, -0.16], { seg: 8 });
    b.box("darksteel", 0.004, 0.016, 0.06, [0.0165, by + 0.004, -0.01], {
      bevel: 0.001,
    });
    C.barrel(b, "gunmetal", 0.011, -0.14, -0.6, by, { seg: 16 });
    b.box("gunmetal", 0.022, 0.03, 0.03, [0, by - 0.006, -0.56], {
      bevel: 0.004,
    }); // gas cylinder
    flashHider(b, "darksteel", 0.015, -0.6, 0.07, by, 6);
    triggerGuard(b, "gunmetal", -0.02, 0.045, 0.02, 0.028);
    b.box("gunmetal", 0.03, 0.03, 0.05, [0, 0.01, -0.07], { bevel: 0.003 }); // magwell
    swivel(b, 0, 0.02, -0.38);
    swivel(b, 0, -0.015, 0.27);
    const eyeZ = C.scope(b, 0.114, -0.03, 0.36, 0.0115, { mountY: by + 0.015 });
    root.add(b.build());
    const ch = P.builder();
    ch.box("steel", 0.012, 0.01, 0.014, [0.026, by + 0.004, -0.06], {
      bevel: 0.002,
    });
    const charger = P.part(root, ch, null, "charger");
    const trigger = triggerPart(root, [0, 0.02, 0.0]);
    const mb = C.boxMag("darksteel", 0.026, 0.07, 0.06, 0.0, {
      plate: "steel",
      round: "brass",
    });
    const mag = P.part(root, mb, null, "mag");
    mag.children[0].position.set(0, 0.0, -0.04);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.675]),
      eject: P.socket(root, "eject", [0.02, by + 0.004, -0.01]),
      sight: P.socket(root, "sight", [0, 0.114, eyeZ]),
      rightHand: P.handSocket(
        root,
        "rightHand",
        [0.001, 0.0, 0.008],
        P.gripAxis(A),
        [0.8, 0.2, 0.5],
      ),
      leftHand: leftUnder(root, "leftHand", [0, 0.04, -0.26], -0.35),
      magGrip: leftUnder(mag, "magGrip", [0, -0.08, -0.07], 1.2),
      chargeGrip: P.handSocket(
        charger,
        "chargeGrip",
        [0.036, by + 0.004, -0.06],
        [0, -1, 0],
        [1, 0, 0.2],
      ),
    };
    return {
      root,
      parts: { charger, trigger, mag },
      sockets,
      cfg: {
        hip: { p: [0.115, -0.13, -0.25], r: [0.02, 0.05, 0] },
        adsDist: 0.12,
        rightPose: "trigger",
        leftPose: "support",
        reload: {
          type: "mag",
          axis: [0, -1, 0],
          out: 0.06,
          away: [-0.03, -0.33, 0.06],
          charge: {
            part: "charger",
            p: [0, 0, 0.07],
            grip: "chargeGrip",
            hand: "R",
          },
        },
        shot: [
          { part: "trigger", r: [-0.3, 0, 0], held: true },
          { part: "charger", p: [0, 0, 0.07], dur: 0.08 },
        ],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
      },
    };
  };

  // ------------------------------------------------------------------
  // .32 BOLT RIFLE — a cheap single-shot boy's rifle: light birch stock,
  // thin barrel, iron sights, a bolt that opens for every round.
  // ------------------------------------------------------------------
  M.bolt_rifle_32 = function () {
    return boltRifle({
      name: "bolt_rifle_32",
      barrelLen: 0.36,
      barrelR: 0.0085,
      wood: "woodLight",
      irons: true,
    });
  };

  // ------------------------------------------------------------------
  // BB GUN — lever-action air rifle, saddle ring, blued tube
  // ------------------------------------------------------------------
