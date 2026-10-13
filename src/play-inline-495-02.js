// play-inline-495 02 — root
// Lines 334-608 of readable/play-inline-495.pretty.js (statement-aligned).
  M.missile_launcher = function () {
    const root = new THREE.Group();
    root.name = "missile_launcher";
    const b = P.builder();
    const ty = 0.13; // tube axis height above the grip
    // main tube (olive) with bands, front shroud, rear flare
    b.tube("olive", 0.052, 0.044, 0.9, [0, ty, -0.2], { seg: 22 });
    for (const z of [-0.55, -0.2, 0.1])
      b.add(GEO.torus(0.053, 0.005, 5, 24), "darksteel", { p: [0, ty, z] });
    b.add(
      GEO.lathe(
        [
          [0.052, 0.0],
          [0.062, 0.02],
          [0.062, 0.08],
          [0.058, 0.09],
        ],
        22,
      ),
      "darksteel",
      { p: [0, ty, -0.65] },
    );
    b.add(
      GEO.lathe(
        [
          [0.058, -0.06],
          [0.07, -0.01],
          [0.052, 0.0],
        ],
        22,
      ),
      "darksteel",
      { p: [0, ty, 0.3] },
    );
    // pistol grip + front grip under the tube
    R().pistolGrip(b, "rubber", 0.3, { top: 0.07, w: 0.032 });
    b.box("darksteel", 0.03, 0.04, 0.1, [0, 0.07, -0.02], { bevel: 0.005 });
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
      ).map((p) => [p[0] + 0.3, p[1] + 0.08]),
      0.03,
      { bevel: 0.004 },
    );
    R().triggerGuard(b, "darksteel", 0.012, 0.064, 0.05, 0.028);
    // optical sight box on the LEFT with a lens
    b.box("darksteel", 0.03, 0.05, 0.14, [-0.07, ty + 0.03, -0.1], {
      bevel: 0.006,
    });
    b.add(new THREE.CircleGeometry(0.012, 14), "lens", {
      p: [-0.07, ty + 0.04, 0.03],
      r: [0, Math.PI, 0],
    });
    b.add(new THREE.CircleGeometry(0.014, 14), "lens", {
      p: [-0.07, ty + 0.04, -0.171],
    });
    // shoulder pad + stencils
    b.box("rubber", 0.05, 0.03, 0.18, [0, ty - 0.065, 0.2], { bevel: 0.01 });
    b.box("yellow", 0.0008, 0.03, 0.2, [0.0525, ty, -0.3], { bevel: 0 });
    b.box("white", 0.0008, 0.012, 0.12, [0.0525, ty + 0.025, -0.05], {
      bevel: 0,
    });
    root.add(b.build());
    // loaded missile (visible in the tube front) — part used during reload
    const mb = P.builder();
    P.buildMissile(mb, [0, 0, 0], 1.0);
    const round = P.part(root, mb, null, "round");
    round.position.set(0, ty, -0.45);
    round.userData.rest = null;
    const trigger = R().triggerPart(root, [0, 0.05, -0.036]);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, ty, -0.72]),
      sight: P.socket(root, "sight", [0, ty + 0.1, 0.05]),
      rightHand: R().rightOnGrip(root, 0.3),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [-0.001, 0.045, -0.3],
        [0, 0.99, -0.1],
        [-0.85, 0, 0.45],
      ),
      load: R().leftUnder(root, "load", [0, ty - 0.03, 0.34], 1.3),
    };
    return {
      root,
      parts: { round, trigger },
      sockets,
      cfg: {
        hip: { p: [0.12, -0.2, -0.22], r: [0.02, 0.04, 0] },
        adsDist: 0.2,
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "single",
          grip: "load",
          roundPart: "round",
          roundIn: [0, 0, 0.35],
          tRound: 1.6,
          tOpen: 0.5,
          tClose: 0.5,
          tilt: { p: [-0.02, 0.02, 0.0], r: [0.25, -0.2, 0.2] },
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: { p: [-0.04, -0.08, 0.05], r: [-0.3, 0.5, 0.3] },
        lower: { p: [0.06, -0.35, 0.1], r: [-0.7, 0.3, 0.2] },
        onFrame(m) {
          if (!P.action && P.state.cur && P.state.cur.mag <= 0)
            m.parts.round.visible = false;
        },
      },
    };
  };

  // ------------------------------------------------------------------
  // RECOILLESS RIFLE: a 90 mm olive tube carried on the shoulder, a flared
  // venturi breech at the back (where the back-blast goes), a hinged breech
  // ring, an optical sight on the left, pistol grip + front grip, a folded
  // monopod under the front.
  // ------------------------------------------------------------------
  M.recoilless_rifle = function () {
    const root = new THREE.Group();
    root.name = "recoilless_rifle";
    const b = P.builder();
    const ty = 0.12;
    // main tube with reinforcing collars
    b.tube("olive", 0.052, 0.045, 0.98, [0, ty, -0.24], { seg: 22, wear: 0.5 });
    for (const z of [-0.66, -0.4, -0.12, 0.12])
      b.add(GEO.torus(0.0535, 0.0045, 5, 24), "darksteel", { p: [0, ty, z] });
    b.add(
      GEO.lathe(
        [
          [0.052, 0.0],
          [0.058, 0.012],
          [0.058, 0.04],
          [0.054, 0.046],
        ],
        22,
      ),
      "darksteel",
      { p: [0, ty, -0.76] },
    ); // muzzle ring
    // breech: a thicker chamber, the hinged ring and the flared venturi (perforated ring of vents)
    b.cyl("olive", 0.062, 0.16, [0, ty, 0.2], { seg: 22, wear: 0.5 });
    b.add(GEO.torus(0.063, 0.006, 6, 24), "darksteel", { p: [0, ty, 0.28] });
    b.add(
      GEO.lathe(
        [
          [0.05, 0.0],
          [0.056, 0.03],
          [0.074, 0.09],
          [0.08, 0.11],
          [0.076, 0.112],
          [0.066, 0.09],
          [0.048, 0.03],
          [0.044, 0.0],
        ],
        24,
      ),
      "darksteel",
      { p: [0, ty, 0.29] },
    );
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      b.add(GEO.cylY(0.0065, 0.008, 8), "rust", {
        p: [Math.cos(a) * 0.057, ty + Math.sin(a) * 0.057, 0.33],
        r: [Math.PI / 2, 0, a],
        tint: 0.4,
      });
    }
    b.box("steel", 0.022, 0.03, 0.018, [0.07, ty, 0.27], { bevel: 0.004 }); // breech hinge
    b.add(GEO.cylY(0.006, 0.045, 10), "steel", { p: [0.07, ty, 0.27] });
    // shoulder pad under the rear of the tube
    b.box("rubber", 0.05, 0.03, 0.2, [0, ty - 0.07, 0.12], { bevel: 0.01 });
    // grips: rear pistol grip + front grip, with the trigger housing
    R().pistolGrip(b, "rubber", 0.3, { top: 0.07, w: 0.032 });
    b.box("darksteel", 0.03, 0.045, 0.1, [0, 0.07, -0.02], { bevel: 0.005 });
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
      ).map((q) => [q[0] + 0.3, q[1] + 0.07]),
      0.03,
      { bevel: 0.004 },
    );
    R().triggerGuard(b, "darksteel", 0.012, 0.064, 0.05, 0.028);
    // optical sight box on the LEFT with lenses and a rubber eyecup
    b.box("darksteel", 0.03, 0.045, 0.16, [-0.072, ty + 0.03, -0.06], {
      bevel: 0.006,
    });
    b.cyl("rubber", 0.014, 0.03, [-0.072, ty + 0.035, 0.035], { seg: 14 });
    b.add(new THREE.CircleGeometry(0.012, 14), "lens", {
      p: [-0.072, ty + 0.035, 0.051],
      r: [0, Math.PI, 0],
    });
    b.add(new THREE.CircleGeometry(0.013, 14), "lens", {
      p: [-0.072, ty + 0.035, -0.141],
    });
    // folded monopod under the front
    b.cyl("darksteel", 0.006, 0.34, [0, ty - 0.062, -0.46], { seg: 8 });
    b.box("darksteel", 0.03, 0.01, 0.03, [0, ty - 0.062, -0.63], {
      bevel: 0.003,
    });
    // stencils: yellow HE band, white "BACK-BLAST AREA" bar on the breech
    b.box("yellow", 0.0008, 0.03, 0.18, [0.0525, ty, -0.3], { bevel: 0 });
    b.box("white", 0.0008, 0.012, 0.1, [0.0625, ty + 0.02, 0.2], { bevel: 0 });
    root.add(b.build());
    // the loaded round (part): shows in the breech during the reload
    const nb = P.builder();
    P.buildRecoillessRound(nb, [0, 0, 0], 1.0);
    const round = P.part(root, nb, null, "round");
    round.position.set(0, ty, 0.05);
    round.userData.rest = null;
    const trigger = R().triggerPart(root, [0, 0.05, -0.036]);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, ty, -0.79]),
      sight: P.socket(root, "sight", [0, ty + 0.1, 0.05]),
      rightHand: R().rightOnGrip(root, 0.3),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [-0.001, 0.035, -0.3],
        [0, 0.99, -0.1],
        [-0.85, 0, 0.45],
      ),
      load: R().leftUnder(root, "load", [0, ty - 0.03, 0.42], 1.3),
    };
    return {
      root,
      parts: { round, trigger },
      sockets,
      cfg: {
        hip: { p: [0.12, -0.2, -0.22], r: [0.02, 0.04, 0] },
        adsDist: 0.2,
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "single",
          grip: "load",
          roundPart: "round",
          roundIn: [0, 0, 0.42],
          tRound: 2.0,
          tOpen: 0.7,
          tClose: 0.6,
          roundSfx: "reload",
          tilt: { p: [-0.02, 0.02, 0.0], r: [0.25, -0.2, 0.2] },
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: { p: [-0.04, -0.08, 0.05], r: [-0.3, 0.5, 0.3] },
        lower: { p: [0.06, -0.35, 0.1], r: [-0.7, 0.3, 0.2] },
        onFrame(m) {
          if (!P.action && P.state.cur && P.state.cur.mag <= 0)
            m.parts.round.visible = false;
        },
      },
    };
  };

  // ------------------------------------------------------------------
  // BELT-FED MACHINE GUN: long stamped receiver with a hinged feed cover, a
  // heavy barrel with a carry handle and a gas tube under it, folded bipod,
  // polymer stock, hundred-round box on the left feeding a brass-linked belt.
  // ------------------------------------------------------------------
