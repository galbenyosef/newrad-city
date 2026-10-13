// play-inline-492 03 — bevel
// Lines 502-886 of readable/play-inline-492.pretty.js (statement-aligned).
  function revolver(o) {
    const root = new THREE.Group();
    root.name = o.name;
    const A = 0.36;
    const metal = o.metal || "blued";
    const WEAR = {
      bevel: 0.0028,
      bseg: 2,
      wear: o.metal === "steel" ? 0.5 : 1,
    };
    const b = P.builder();
    const L = o.barrelLen,
      by = 0.066; // bore height
    // grip: rounded wood with a flared butt, checkered panels inset on both sides
    const gripPts = raked(
      [
        [-0.02, -0.05],
        [-0.012, -0.058],
        [0.016, -0.057],
        [0.02, -0.048],
        [0.017, 0.03],
        [0.02, 0.046],
        [-0.024, 0.046],
        [-0.028, 0.03],
        [-0.024, 0.0],
      ],
      A,
    );
    b.profile(o.gripMat || "wood", gripPts, 0.032, { bevel: 0.0055, bseg: 3 });
    if (o.checker)
      b.profile(
        o.checker,
        raked(
          [
            [-0.017, -0.044],
            [0.013, -0.044],
            [0.013, 0.026],
            [-0.02, 0.028],
            [-0.021, -0.01],
          ],
          A,
        ),
        0.0336,
        { bevel: 0.0008 },
      );
    // medallion
    {
      const q = raked([[-0.003, 0.034]], A)[0];
      for (const sd of [-1, 1])
        b.add(GEO.cylX(0.0045, 0.0012, 14), o.gold ? "gold" : "steel", {
          p: [sd * 0.0166, q[1], -q[0]],
        });
    }
    // grip frame strap (metal backstrap)
    b.profile(
      metal,
      raked(
        [
          [-0.028, -0.05],
          [-0.022, -0.05],
          [-0.022, 0.048],
          [-0.03, 0.048],
        ],
        A,
      ),
      0.018,
      { bevel: 0.002, bseg: 2, wear: 1 },
    );
    const gs = raked([[0, 0.0]], A)[0];
    b.add(GEO.cylX(0.0035, 0.036, 10), "steel", { p: [0, gs[1], -gs[0]] });
    // frame
    b.profile(
      metal,
      [
        [-0.035, 0.044],
        [-0.028, 0.08],
        [0.0, 0.086],
        [0.06, 0.086],
        [0.06, 0.036],
        [0.05, 0.03],
        [0.012, 0.03],
        [-0.012, 0.036],
      ],
      0.024,
      WEAR,
    );
    // recoil shield ring around the cylinder window (rounded)
    b.add(GEO.torus(o.cylR + 0.002, 0.0022, 6, 22), metal, {
      p: [0, by, 0.006],
      wear: 1,
    });
    // topstrap + rear sight groove
    b.box(metal, 0.012, 0.006, 0.07, [0, 0.087, -0.028], {
      bevel: 0.0025,
      wear: 1.2,
    });
    b.box(metal, 0.003, 0.0012, 0.05, [0, 0.0903, -0.02], {
      bevel: 0,
      tint: 0.3,
    });
    // barrel with full-length underlug + vent rib (magnum) / plain (snub)
    C.barrel(b, metal, o.barrelR, -0.058, -0.058 - L, by, {
      bore: 0.5,
      seg: 20,
    });
    if (o.lug)
      b.box(metal, 0.014, 0.022, L - 0.004, [0, by - 0.012, -0.058 - L / 2], {
        bevel: 0.0045,
        wear: 1,
      });
    b.box(metal, 0.006, 0.008, L, [0, by + o.barrelR + 0.002, -0.058 - L / 2], {
      bevel: 0.002,
      wear: 1.2,
    });
    // ejector-rod shroud side flats catch the light: a thin polished line along each side of the lug
    if (o.lug)
      for (const sd of [-1, 1])
        b.box(
          "steel",
          0.0006,
          0.004,
          L - 0.02,
          [sd * 0.0071, by - 0.012, -0.058 - L / 2],
          { bevel: 0, tint: 0.8 },
        );
    if (o.vent)
      for (let i = 0; i < 6; i++)
        b.box(
          "darksteel",
          0.0065,
          0.004,
          0.004,
          [0, by + o.barrelR + 0.004, -0.07 - (i * (L - 0.02)) / 6],
          { bevel: 0 },
        );
    // front sight blade (ramped)
    b.profile(
      metal,
      [
        [0.0, 0.0],
        [0.012, 0.0],
        [0.012, 0.011],
        [0.004, 0.006],
      ],
      0.003,
      { bevel: 0.0005, p: [0, by + o.barrelR + 0.006, -0.058 - L + 0.012] },
    );
    // trigger guard (rounded)
    b.add(
      GEO.shapeProfile(
        (s) => {
          s.moveTo(0.004, 0.032);
          s.lineTo(0.05, 0.032);
          s.quadraticCurveTo(0.058, 0.0, 0.03, -0.004);
          s.quadraticCurveTo(0.008, -0.004, 0.004, 0.02);
          s.lineTo(0.004, 0.032);
          const h = new THREE.Path();
          h.moveTo(0.012, 0.03);
          h.lineTo(0.044, 0.03);
          h.quadraticCurveTo(0.05, 0.004, 0.03, 0.002);
          h.quadraticCurveTo(0.014, 0.002, 0.012, 0.02);
          h.lineTo(0.012, 0.03);
          s.holes.push(h);
        },
        0.01,
        0.0012,
      ),
      metal,
      {},
    );
    // cylinder release latch (left)
    b.box("steel", 0.004, 0.008, 0.012, [-0.013, 0.07, 0.006], {
      bevel: 0.0015,
    });
    // side plate screws
    b.rivets(
      "steel",
      [
        [0, 0.075, 0.018],
        [0, 0.048, 0.0],
        [0, 0.07, -0.03],
      ],
      0.0025,
      0.0125,
    );
    if (o.gold) {
      b.box("gold", 0.001, 0.02, 0.05, [0.0125, 0.058, 0.0], { bevel: 0 });
      b.box("gold", 0.001, 0.02, 0.05, [-0.0125, 0.058, 0.0], { bevel: 0 });
    }
    root.add(b.build());

    // ---- crane + cylinder (part swings out to the left) ----
    const crane = new THREE.Group();
    crane.name = "crane";
    crane.position.set(-0.004, 0.047, -0.03);
    root.add(crane);
    const cylG = new THREE.Group();
    cylG.name = "cylinder";
    cylG.position.set(0.004, by - 0.047, 0.0);
    crane.add(cylG);
    const cb = P.builder();
    const cr = o.cylR,
      cl = o.cylLen;
    cb.add(
      GEO.lathe(
        [
          [0.003, -cl / 2],
          [cr * 0.88, -cl / 2],
          [cr * 0.97, -cl / 2 + 0.002],
          [cr, -cl / 2 + 0.005],
          [cr, cl / 2 - 0.004],
          [cr * 0.95, cl / 2 - 0.001],
          [cr * 0.9, cl / 2],
          [0.004, cl / 2],
        ],
        30,
      ),
      metal,
      { wear: 1.4 },
    );
    // flutes + chambers with brass rims at the back
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      cb.add(GEO.capsule(0.0032, cl * 0.5, 3, 8).rotateX(Math.PI / 2), metal, {
        p: [Math.cos(a) * cr * 1.0, Math.sin(a) * cr * 1.0, -0.002],
        s: [1, 1, 1],
        tint: 0.3,
      });
      // cylinder stop notch
      cb.box(
        metal,
        0.003,
        0.002,
        0.004,
        [
          Math.cos(a - Math.PI / 6) * cr * 0.99,
          Math.sin(a - Math.PI / 6) * cr * 0.99,
          cl / 2 - 0.009,
        ],
        { bevel: 0.0004, r: [0, 0, a - Math.PI / 6], tint: 0.3 },
      );
      const ca = a - Math.PI / 6;
      cb.add(new THREE.CircleGeometry(cr * 0.26, 10), "darksteel", {
        p: [
          Math.cos(ca) * cr * 0.58,
          Math.sin(ca) * cr * 0.58,
          -cl / 2 - 0.0005,
        ],
      });
      cb.add(GEO.cyl(cr * 0.27, 0.0025, 10), "brass", {
        p: [
          Math.cos(ca) * cr * 0.58,
          Math.sin(ca) * cr * 0.58,
          cl / 2 + 0.0008,
        ],
      });
    }
    // crane arm + ejector rod
    cb.box(metal, 0.008, 0.02, 0.012, [0, -cr * 0.7, -cl / 2 - 0.004], {
      bevel: 0.002,
    });
    const cylB = cb.build();
    cylG.add(cylB);
    cylG.userData.rest = {
      p: cylG.position.clone(),
      q: cylG.quaternion.clone(),
    };
    const eb = P.builder();
    eb.add(GEO.cyl(0.0026, o.rodLen, 8), "steel", {
      p: [0, 0, -cl / 2 - o.rodLen / 2],
    });
    eb.add(GEO.cyl(0.004, 0.006, 10), "steel", {
      p: [0, 0, -cl / 2 - o.rodLen],
    });
    const ejector = P.part(cylG, eb, null, "ejector");
    crane.userData.rest = {
      p: crane.position.clone(),
      q: crane.quaternion.clone(),
    };

    // ---- hammer (spur) ----
    const hb = P.builder();
    hb.profile(
      "steel",
      [
        [0.004, -0.008],
        [0.004, 0.01],
        [-0.004, 0.02],
        [-0.018, 0.024],
        [-0.014, 0.016],
        [-0.006, 0.008],
        [-0.006, -0.008],
      ],
      0.007,
      { bevel: 0.001 },
    );
    for (let i = 0; i < 4; i++)
      hb.box(
        "darksteel",
        0.0075,
        0.001,
        0.003,
        [0, 0.022 - i * 0.002, 0.012 + i * 0.002],
        { bevel: 0 },
      );
    const hammer = P.part(root, hb, [0, 0.07, 0.037], "hammer");
    hammer.children[0].position.set(0, 0, 0);
    const tb = P.builder();
    tb.profile(
      "steel",
      [
        [0.004, 0.0],
        [0.007, -0.01],
        [0.004, -0.021],
        [-0.001, -0.024],
        [0.001, -0.012],
        [-0.002, 0.0],
      ],
      0.006,
      { bevel: 0.0008 },
    );
    const trigger = P.part(root, tb, [0, 0.032, -0.03], "trigger");
    trigger.children[0].position.set(0, 0, 0);

    // optional scope (Closing Bell)
    const sockets = {};
    if (o.scope) {
      const s2 = P.builder();
      C.scope(s2, 0.118, -0.06, 0.2, 0.013, { mountY: 0.09 });
      root.add(s2.build());
      sockets.sight = P.socket(root, "sight", [0, 0.118, 0.06]);
    } else {
      sockets.sight = P.socket(root, "sight", [
        0,
        by + o.barrelR + 0.012,
        0.02,
      ]);
    }
    sockets.muzzle = P.socket(root, "muzzle", [0, by, -0.058 - L - 0.004]);
    sockets.eject = P.socket(cylG, "eject", [0, 0, cl / 2]);
    sockets.cylEject = P.socket(cylG, "cylEject", [0, 0, cl / 2 + 0.004]);
    const d = gripAxis(A);
    sockets.rightHand = P.handSocket(
      root,
      "rightHand",
      [0.001, -0.004, 0.004],
      d,
      [0.82, 0, 0.45],
    );
    sockets.leftHand = P.handSocket(
      root,
      "leftHand",
      [-0.016, -0.02, -0.01],
      [0, -d[1], -d[2]],
      [-0.82, -0.1, -0.5],
    );
    sockets.cylGrip = P.handSocket(
      cylG,
      "cylGrip",
      [-0.02, -0.01, 0.0],
      [0, 0, -1],
      [-0.9, -0.3, 0],
    );
    return {
      root,
      parts: { crane, cylinder: cylG, ejector, hammer, trigger },
      sockets,
      cfg: {
        hip: { p: [0.125, -0.13, -0.35], r: [0, 0.1, 0] },
        adsDist: o.scope ? 0.22 : 0.42,
        rightPose: "trigger",
        leftPose: "grip",
        cylinderStep: true,
        reload: {
          type: "revolver",
          swing: { p: [-0.02, 0, 0], r: [0, 0, 1.2] },
        },
        shot: [
          { part: "hammer", r: [-0.75, 0, 0], dur: 0.14 },
          { part: "trigger", r: [-0.35, 0, 0], held: true },
        ],
        sprint: { p: [-0.03, -0.05, 0.04], r: [-0.45, 0.6, 0.45] },
      },
    };
  }
