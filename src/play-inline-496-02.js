// play-inline-496 02 — root
// Lines 334-680 of readable/play-inline-496.pretty.js (statement-aligned).
  M.pool_cue = function () {
    const root = new THREE.Group();
    root.name = "pool_cue";
    const b = P.builder();
    b.add(
      GEO.latheY(
        [
          [0.0, -0.3],
          [0.016, -0.298],
          [0.016, -0.28],
          [0.015, 0.05],
          [0.012, 0.3],
          [0.007, 0.95],
          [0.0065, 1.0],
        ],
        14,
      ),
      "woodLight",
      {},
    );
    b.add(
      GEO.latheY(
        [
          [0.0165, -0.28],
          [0.0158, -0.05],
          [0.0154, 0.08],
        ],
        14,
      ),
      "wood",
      { tint: 0.45 },
    ); // dark butt sleeve
    for (let i = 0; i < 4; i++)
      b.box(
        "white",
        0.001,
        0.05,
        0.008,
        [Math.cos(i * 1.57) * 0.0158, -0.15, Math.sin(i * 1.57) * 0.0158],
        { bevel: 0, r: [0, -i * 1.57, 0] },
      );
    b.add(
      GEO.latheY(
        [
          [0.0066, 0.99],
          [0.0066, 1.01],
        ],
        12,
      ),
      "white",
      {},
    );
    b.add(
      GEO.latheY(
        [
          [0.0066, 1.01],
          [0.006, 1.02],
          [0.0, 1.022],
        ],
        12,
      ),
      "enamelBlue",
      {},
    );
    root.add(b.build());
    return {
      root,
      parts: {},
      sockets: {
        rightHand: rightOnHandle(root, -0.12),
        leftHand: leftOnHandle(root, -0.24),
        muzzle: P.socket(root, "muzzle", [0, 0.9, 0]),
      },
      cfg: {
        hip: { p: [0.2, -0.22, -0.36], r: [-0.95, 0.15, 0.35] },
        rightPose: "grip",
        leftPose: "grip",
        sprint: { p: [0.02, -0.06, 0.05], r: [-0.3, 0.1, 0.2] },
        block: { p: [-0.12, 0.12, 0.02], r: [0.5, 0.0, 1.0] },
      },
    };
  };

  // ------------------------------------------------------------------
  // SPUD WRENCH — forged ironworker's wrench: an open-end jaw at the top,
  // a long tapered spike for a handle (point down below the fist).
  // ------------------------------------------------------------------
  M.spud_wrench = function () {
    const root = new THREE.Group();
    root.name = "spud_wrench";
    const b = P.builder();
    // tapered spike shank: octagonal-ish lathe from the point (below the hand) up to the neck
    b.add(
      GEO.latheY(
        [
          [0.0, -0.13],
          [0.004, -0.11],
          [0.009, -0.04],
          [0.0125, 0.06],
          [0.014, 0.2],
          [0.016, 0.24],
        ],
        8,
      ),
      "darksteel",
      { wear: 1.4 },
    );
    // the jaw: a thick plate with an open-end slot, set at 15 degrees like the real thing
    const jy = 0.29;
    b.add(
      GEO.shapeProfile(
        (sh) => {
          sh.moveTo(-0.022, -0.04);
          sh.lineTo(0.022, -0.04);
          sh.quadraticCurveTo(0.04, -0.01, 0.036, 0.03);
          sh.lineTo(0.016, 0.03);
          sh.lineTo(0.014, 0.0);
          sh.lineTo(-0.014, 0.0);
          sh.lineTo(-0.016, 0.03);
          sh.lineTo(-0.036, 0.03);
          sh.quadraticCurveTo(-0.04, -0.01, -0.022, -0.04);
        },
        0.013,
        0.002,
      ),
      "darksteel",
      { p: [0, jy, 0], r: [0.26, 0, 0], wear: 1.6 },
    );
    b.box("steel", 0.0136, 0.004, 0.03, [0, jy - 0.002, 0.0], {
      bevel: 0.0008,
      r: [0.26, 0, 0],
    }); // worn jaw face
    // forged size stamp + a turn of friction tape where the hand sits
    b.box("steel", 0.0008, 0.03, 0.006, [0.0128, 0.15, 0], {
      bevel: 0,
      tint: 0.6,
    });
    for (let i = 0; i < 6; i++)
      b.add(GEO.torus(0.0128, 0.0022, 4, 12), "tape", {
        p: [0, -0.04 + i * 0.016, 0],
        r: [Math.PI / 2 + 0.1, 0, 0],
        tint: 0.5,
      });
    root.add(b.build());
    return {
      root,
      parts: {},
      sockets: {
        rightHand: rightOnHandle(root, 0.0),
        muzzle: P.socket(root, "muzzle", [0, jy + 0.02, 0]),
      },
      cfg: oneHandedCfg({
        hip: { p: [0.16, -0.2, -0.34], r: [-0.6, 0.2, -0.2] },
      }),
    };
  };

  // ------------------------------------------------------------------
  // FIRE AXE — ladder-company axe: hickory handle, red head with a bright
  // ground bit forward (-Z) and a pick on the back (+Z), FDNY burnt in.
  // ------------------------------------------------------------------
  M.fire_axe = function () {
    const root = new THREE.Group();
    root.name = "fire_axe";
    const b = P.builder();
    // handle: slightly swelled hickory, a knob at the end
    b.add(
      GEO.latheY(
        [
          [0.0, -0.2],
          [0.02, -0.198],
          [0.021, -0.185],
          [0.015, -0.17],
          [0.0145, 0.3],
          [0.016, 0.55],
          [0.017, 0.66],
          [0.0, 0.665],
        ],
        12,
      ),
      "woodLight",
      { s: [1, 1, 0.78], tint: [1.05, 0.95, 0.82] },
    );
    for (const y of [0.12, 0.28])
      b.box("bakelite", 0.001, 0.05, 0.012, [0.0146, y, 0], {
        bevel: 0,
        tint: 0.6,
      }); // burnt FDNY / company number
    // head (eye round the handle top), axe blade forward, pick behind
    const hy = 0.62;
    b.box("red", 0.03, 0.07, 0.06, [0, hy, 0.0], { bevel: 0.006, wear: 1.2 });
    b.add(
      GEO.profile(
        [
          [0.0, -0.035],
          [0.11, -0.065],
          [0.13, -0.07],
          [0.13, 0.07],
          [0.11, 0.065],
          [0.0, 0.035],
        ],
        0.018,
        0.003,
      ),
      "red",
      { p: [0, hy, -0.02], r: [0, 0, 0], wear: 1.2 },
    );
    b.add(
      GEO.profile(
        [
          [0.105, -0.067],
          [0.132, -0.072],
          [0.132, 0.072],
          [0.105, 0.067],
        ],
        0.0186,
        0.0015,
      ),
      "steel",
      { p: [0, hy, -0.02] },
    ); // ground bit
    b.add(
      GEO.profile(
        [
          [0.0, -0.02],
          [0.13, -0.004],
          [0.14, 0.0],
          [0.13, 0.006],
          [0.0, 0.024],
        ],
        0.016,
        0.002,
      ),
      "red",
      { p: [0, hy + 0.01, 0.02], r: [0, Math.PI, 0], wear: 1.2 },
    ); // pick
    b.box("steel", 0.017, 0.006, 0.012, [0, hy + 0.012, 0.155], {
      bevel: 0.002,
    });
    root.add(b.build());
    return {
      root,
      parts: {},
      sockets: {
        rightHand: rightOnHandle(root, 0.02),
        leftHand: leftOnHandle(root, -0.12),
        muzzle: P.socket(root, "muzzle", [0, hy, -0.15]),
      },
      cfg: {
        hip: { p: [0.22, -0.34, -0.38], r: [-0.35, 0.15, 0.45] },
        rightPose: "grip",
        leftPose: "grip",
        sprint: { p: [0.02, -0.08, 0.06], r: [-0.3, 0.1, 0.2] },
        block: { p: [-0.14, 0.12, 0.0], r: [0.4, 0.0, 1.15] },
      },
    };
  };

  // ------------------------------------------------------------------
  // BRASS KNUCKLES (built on the fists rig, attached to the right hand frame)
  // Hand frame: -Z knuckles, +Y back of hand, +Z toward the forearm.
  // ------------------------------------------------------------------
  M.brass_knuckles = function () {
    const inst = P.fistsRig("", false, (fistR, rh) => {
      const b = P.builder();
      // bar across the proximal phalanges (fist curled), four rings
      // hand frame: the curled proximal phalanges run down (-Y) across the front of the fist
      b.box("brass", 0.082, 0.022, 0.012, [0.0, -0.002, -0.05], {
        bevel: 0.005,
      });
      for (let i = 0; i < 4; i++)
        b.add(GEO.torus(0.0112, 0.0034, 6, 14), "brass", {
          p: [-0.027 + i * 0.018, -0.004, -0.036],
          r: [Math.PI / 2, 0, 0],
        });
      b.box("brass", 0.07, 0.012, 0.014, [0.0, -0.028, -0.018], {
        bevel: 0.005,
      }); // palm bar
      rh.add(b.build());
    });
    inst.root.name = "brass_knuckles";
    return inst;
  };

  // ------------------------------------------------------------------
  // THROWN: grenades & mine. Root = the object (origin at its centre).
  // ------------------------------------------------------------------
  function thrownInst(name, b, extra) {
    const root = new THREE.Group();
    root.name = name;
    root.add(b.build());
    return Object.assign(
      {
        root,
        parts: {},
        sockets: {
          rightHand: P.handSocket(
            root,
            "rightHand",
            [0.0, -0.005, 0.02],
            [0.4, -0.9, 0.1],
            [0.9, 0.35, 0.2],
          ),
          muzzle: P.socket(root, "muzzle", [0, 0, -0.04]),
        },
        cfg: {
          hip: { p: [0.15, -0.16, -0.32], r: [0.2, 0.3, 0.2] },
          rightPose: "cup",
          leftPose: "relaxed",
          leftFree: null,
          sprint: MELEE_SPRINT,
        },
      },
      extra || {},
    );
  }
  M.frag_grenade = function () {
    const b = P.builder();
    b.add(GEO.sphere(0.03, 14, 12), "olive", { s: [1, 1.15, 1] });
    for (let i = 0; i < 5; i++)
      b.add(
        GEO.torus(0.03 * Math.sin(((i + 1) / 6) * Math.PI), 0.0025, 4, 16),
        "olive",
        {
          p: [0, 0.034 * Math.cos(((i + 1) / 6) * Math.PI) * 1.15, 0],
          r: [Math.PI / 2, 0, 0],
          tint: 0.8,
        },
      );
    b.cyl("steel", 0.011, 0.018, [0, 0.042, 0], {
      r: [Math.PI / 2, 0, 0],
      seg: 12,
    }); // fuze
    b.box("steel", 0.012, 0.05, 0.004, [0, 0.022, 0.03], {
      bevel: 0.001,
      r: [0.25, 0, 0],
    }); // spoon
    b.add(GEO.torus(0.009, 0.0015, 4, 12), "steel", {
      p: [0.014, 0.046, 0],
      r: [0, Math.PI / 2, 0],
    }); // pin ring
    b.add(GEO.torus(0.027, 0.0022, 4, 18), "yellow", {
      p: [0, 0.024, 0],
      r: [Math.PI / 2, 0, 0],
    }); // HE band
    return thrownInst("frag_grenade", b);
  };
