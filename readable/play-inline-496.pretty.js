/* src/weapons/38_models_melee.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: models — melee, unarmed, thrown
 *   hunting_knife, combat_knife, switchblade, baseball_bat (+ 'nailed'
 *   Broadway Slugger), lead_pipe, pool_cue, spud_wrench, fire_axe,
 *   brass_knuckles, frag_grenade, riot_gas_grenade,
 *   molotov, frag_mine
 *
 * Melee convention: handle axis along +Y (head/blade up), origin = centre of
 * the right hand's grip. Right hand: thumb toward the head.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;
  const GEO = P.GEO;
  P.MODELS = P.MODELS || {};
  const M = P.MODELS;

  // left hand guard pose (camera space) for one-handed melee — fist raised low-left
  const GUARD_L = {
    p: [-0.17, -0.2, -0.36],
    x: [-0.45, 0.85, -0.1],
    y: [-0.88, 0.45, 0.1],
  };
  /** Right hand holding a vertical handle at origin: thumb up the handle, knuckles forward. */
  function rightOnHandle(root, y) {
    return P.handSocket(
      root,
      "rightHand",
      [0, y || 0, 0],
      [0, -1, 0],
      [1, 0, 0.05],
    );
  }
  /** Left hand below the right on the same handle (two-handed). */
  function leftOnHandle(root, y) {
    return P.handSocket(root, "leftHand", [0, y, 0], [0, 1, 0], [-1, 0, 0.05]);
  }
  const MELEE_SPRINT = { p: [0.0, -0.08, 0.06], r: [-0.4, 0.2, 0.2] };

  function oneHandedCfg(extra) {
    return Object.assign(
      {
        hip: { p: [0.15, -0.17, -0.33], r: [-0.9, 0.25, -0.25] },
        rightPose: "grip",
        leftPose: "fist",
        leftFree: null, // off hand hidden for one-handed melee
        sprint: MELEE_SPRINT,
        block: { p: [-0.1, 0.1, 0.04], r: [0.5, 0.3, 1.1] },
      },
      extra || {},
    );
  }

  // ------------------------------------------------------------------
  // KNIVES
  // ------------------------------------------------------------------
  function knife(o) {
    const root = new THREE.Group();
    root.name = o.name;
    const b = P.builder();
    const hl = o.handleLen || 0.11;
    // handle (along Y), guard, pommel
    b.add(
      GEO.lathe(
        [
          [0.0, -hl / 2 - 0.012],
          [0.012, -hl / 2 - 0.01],
          [0.014, -hl / 2],
          [0.013, -hl * 0.2],
          [0.0145, hl * 0.1],
          [0.012, hl / 2],
        ].map((q) => [q[0], q[1]]),
        12,
      ).rotateX(Math.PI / 2),
      o.handle || "wood",
      { s: [1, 1, 0.75] },
    );
    if (o.ridges)
      for (let i = 0; i < 5; i++)
        b.add(GEO.torus(0.0135, 0.0018, 4, 12), o.handle, {
          p: [0, -hl * 0.35 + i * hl * 0.16, 0],
          r: [Math.PI / 2, 0, 0],
          s: [1, 0.75, 1],
        });
    b.box(o.guard || "steel", 0.012, 0.008, 0.05, [0, hl / 2 + 0.004, 0], {
      bevel: 0.002,
    });
    b.sphere(o.guard || "steel", 0.012, [0, -hl / 2 - 0.012, 0], {
      s: [1, 0.6, 1.1],
    });
    // blade: clip point profile in the Y/Z plane (edge faces forward -Z)
    const L = o.blade || 0.16,
      W = o.width || 0.03;
    const pts = [
      [0.0, 0.0],
      [W * 0.55, 0.0],
      [W * 0.6, L * 0.55],
      [W * 0.1, L],
      [-W * 0.35, L * 0.75],
      [-W * 0.4, L * 0.5],
      [-W * 0.4, 0.0],
    ];
    b.add(
      GEO.profile(
        pts.map((p) => [p[0], p[1]]),
        0.0045,
        0.0012,
      ),
      o.bladeMat || "steel",
      { p: [0, hl / 2 + 0.008, 0] },
    );
    // fuller groove & serrations
    b.box(
      "darksteel",
      0.0048,
      L * 0.45,
      0.004,
      [0, hl / 2 + 0.008 + L * 0.35, -W * 0.1],
      { bevel: 0 },
    );
    if (o.serrated)
      for (let i = 0; i < 7; i++)
        b.box(
          o.bladeMat || "steel",
          0.004,
          0.006,
          0.006,
          [0, hl / 2 + 0.02 + i * 0.012, W * 0.42],
          { bevel: 0, r: [0.8, 0, 0] },
        );
    root.add(b.build());
    return {
      root,
      parts: {},
      sockets: {
        rightHand: rightOnHandle(root, -0.005),
        muzzle: P.socket(root, "muzzle", [0, hl / 2 + L * 0.8, 0]),
      },
      cfg: oneHandedCfg({ rightPose: "gripThin" }),
    };
  }
  M.hunting_knife = () =>
    knife({ name: "hunting_knife", handle: "wood", blade: 0.15, width: 0.032 });
  M.combat_knife = () =>
    knife({
      name: "combat_knife",
      handle: "rubber",
      ridges: true,
      bladeMat: "darksteel",
      guard: "darksteel",
      blade: 0.17,
      width: 0.03,
      serrated: true,
    });
  M.switchblade = function () {
    const root = new THREE.Group();
    root.name = "switchblade";
    const b = P.builder();
    b.box("plastic", 0.018, 0.11, 0.022, [0, -0.005, 0], { bevel: 0.006 });
    b.box("chrome", 0.02, 0.018, 0.024, [0, 0.055, 0], { bevel: 0.004 });
    b.box("chrome", 0.02, 0.012, 0.024, [0, -0.062, 0], { bevel: 0.004 });
    b.add(GEO.cylX(0.004, 0.024, 8), "chrome", { p: [0, 0.03, 0.013] }); // release button
    b.add(
      GEO.profile(
        [
          [0.0, 0.0],
          [0.012, 0.0],
          [0.011, 0.07],
          [0.0, 0.11],
          [-0.008, 0.08],
          [-0.008, 0.0],
        ],
        0.003,
        0.001,
      ),
      "chrome",
      { p: [0, 0.064, 0] },
    );
    root.add(b.build());
    return {
      root,
      parts: {},
      sockets: {
        rightHand: rightOnHandle(root, -0.008),
        muzzle: P.socket(root, "muzzle", [0, 0.16, 0]),
      },
      cfg: oneHandedCfg({ rightPose: "gripThin" }),
    };
  };

  // ------------------------------------------------------------------
  // BASEBALL BAT (+ Broadway Slugger), LEAD PIPE, POOL CUE
  // ------------------------------------------------------------------
  M.baseball_bat = function (skin) {
    const root = new THREE.Group();
    root.name = "baseball_bat";
    const b = P.builder();
    const nailed = skin === "nailed";
    // lathe along Y: knob at the bottom, thin handle, barrel at the top
    b.add(
      GEO.latheY(
        [
          [0.0, -0.15],
          [0.021, -0.148],
          [0.022, -0.14],
          [0.013, -0.13],
          [0.0125, 0.05],
          [0.018, 0.22],
          [0.031, 0.4],
          [0.034, 0.56],
          [0.03, 0.62],
          [0.0, 0.625],
        ],
        18,
      ),
      "woodLight",
      {},
    );
    // grip tape wrap
    for (let i = 0; i < 9; i++)
      b.add(GEO.torus(0.0132, 0.0022, 4, 14), "tape", {
        p: [0, -0.12 + i * 0.018, 0],
        r: [Math.PI / 2 + 0.15, 0, 0],
        tint: 0.6,
      });
    // brand burn mark
    b.box("bakelite", 0.001, 0.05, 0.02, [0.029, 0.4, 0], {
      bevel: 0,
      r: [0, 0, -0.03],
    });
    if (nailed) {
      // nails, barbed wire and a razor sheet-metal collar
      for (let i = 0; i < 16; i++) {
        const a = i * 2.4,
          y = 0.34 + (i % 8) * 0.03;
        b.add(GEO.cyl(0.0022, 0.06, 5), "steel", {
          p: [Math.cos(a) * 0.04, y, Math.sin(a) * 0.04],
          r: [0, -a + Math.PI / 2, 0],
          order: "YXZ",
        });
      }
      const wire = [];
      for (let i = 0; i <= 80; i++) {
        const t = i / 80,
          a = t * Math.PI * 2 * 5;
        wire.push([Math.cos(a) * 0.034, 0.3 + t * 0.26, Math.sin(a) * 0.034]);
      }
      b.add(GEO.hose(wire, 0.0018, 200, 4), "darksteel");
      b.add(
        new THREE.CylinderGeometry(0.037, 0.035, 0.06, 10, 1, true),
        "rust",
        { p: [0, 0.5, 0] },
      );
      b.box("red", 0.001, 0.12, 0.025, [0.033, 0.2, 0], {
        bevel: 0,
        tint: 0.7,
      }); // blood streak
    }
    root.add(b.build());
    return {
      root,
      parts: {},
      sockets: {
        rightHand: rightOnHandle(root, 0.0),
        leftHand: leftOnHandle(root, -0.09),
        muzzle: P.socket(root, "muzzle", [0, 0.55, 0]),
      },
      cfg: {
        hip: { p: [0.2, -0.26, -0.34], r: [-0.5, 0.1, 0.55] },
        rightPose: "grip",
        leftPose: "grip",
        sprint: { p: [0.02, -0.06, 0.05], r: [-0.3, 0.1, 0.2] },
        block: { p: [-0.12, 0.12, 0.02], r: [0.5, 0.0, 1.0] },
      },
    };
  };
  M.lead_pipe = function () {
    const root = new THREE.Group();
    root.name = "lead_pipe";
    const b = P.builder();
    b.add(GEO.tube(0.016, 0.011, 0.52, 14).rotateX(Math.PI / 2), "rust", {
      p: [0, 0.16, 0],
      tint: [0.7, 0.72, 0.75],
    });
    b.add(
      GEO.latheY(
        [
          [0.021, -0.02],
          [0.022, 0.0],
          [0.022, 0.04],
          [0.02, 0.05],
          [0.017, 0.05],
        ],
        14,
      ),
      "darksteel",
      { p: [0, 0.4, 0] },
    ); // coupling
    b.add(
      GEO.latheY(
        [
          [0.017, 0.0],
          [0.02, 0.02],
          [0.02, 0.05],
          [0.017, 0.07],
        ],
        14,
      ),
      "darksteel",
      { p: [0, -0.11, 0] },
    );
    for (let i = 0; i < 6; i++)
      b.add(GEO.torus(0.0172, 0.0026, 4, 14), "tape", {
        p: [0, -0.06 + i * 0.02, 0],
        r: [Math.PI / 2 + 0.12, 0, 0],
        tint: 0.8,
      });
    root.add(b.build());
    return {
      root,
      parts: {},
      sockets: {
        rightHand: rightOnHandle(root, 0.0),
        muzzle: P.socket(root, "muzzle", [0, 0.42, 0]),
      },
      cfg: oneHandedCfg({
        hip: { p: [0.16, -0.2, -0.34], r: [-0.6, 0.2, -0.2] },
      }),
    };
  };
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
  M.riot_gas_grenade = function () {
    const b = P.builder();
    // grey canister, blue band, stencil, perforated top, spoon & pin
    b.add(GEO.cylY(0.026, 0.09, 16), "tan", { tint: [0.7, 0.72, 0.72] });
    b.add(GEO.cylY(0.0262, 0.016, 16), "enamelBlue", { p: [0, 0.018, 0] });
    b.box("white", 0.0008, 0.024, 0.02, [0.0262, -0.012, 0], { bevel: 0 });
    b.add(GEO.cylY(0.022, 0.006, 14), "darksteel", { p: [0, 0.048, 0] });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      b.add(GEO.cylY(0.0028, 0.007, 6), "darksteel", {
        p: [Math.cos(a) * 0.013, 0.049, Math.sin(a) * 0.013],
        tint: 0.2,
      });
    }
    b.cyl("steel", 0.009, 0.016, [0, 0.058, 0], {
      r: [Math.PI / 2, 0, 0],
      seg: 12,
    }); // fuze
    b.box("steel", 0.012, 0.06, 0.004, [0, 0.03, 0.03], {
      bevel: 0.001,
      r: [0.12, 0, 0],
    }); // spoon
    b.add(GEO.torus(0.009, 0.0015, 4, 12), "steel", {
      p: [0.013, 0.061, 0],
      r: [0, Math.PI / 2, 0],
    }); // pin ring
    return thrownInst("riot_gas_grenade", b);
  };
  M.molotov = function (skin, world) {
    const b = P.builder();
    // brown root-beer bottle (tinted glass), a paper label, a rag stuffed in the neck
    b.add(
      GEO.latheY(
        [
          [0.0, -0.06],
          [0.026, -0.058],
          [0.028, -0.05],
          [0.028, 0.02],
          [0.024, 0.032],
          [0.012, 0.05],
          [0.011, 0.075],
          [0.0, 0.076],
        ],
        16,
      ),
      "glass",
      { tint: [0.9, 0.5, 0.25] },
    );
    b.add(
      GEO.latheY(
        [
          [0.0, -0.055],
          [0.025, -0.054],
          [0.025, 0.012],
          [0.0, 0.013],
        ],
        14,
      ),
      "amberRubber",
      { tint: [0.55, 0.35, 0.15] },
    ); // the fuel inside
    b.add(GEO.cylY(0.0284, 0.03, 16), "white", {
      p: [0, -0.02, 0],
      tint: [1.0, 0.9, 0.7],
    }); // label
    b.box("red", 0.0006, 0.012, 0.02, [0.0286, -0.02, 0], {
      bevel: 0,
      r: [0, 0, 0],
    });
    b.add(
      GEO.hose(
        [
          [0.0, 0.07, 0.0],
          [0.004, 0.09, 0.004],
          [-0.006, 0.105, 0.01],
          [0.004, 0.118, 0.006],
        ],
        0.0055,
        10,
        6,
      ),
      "cloth",
      { tint: 0.8 },
    );
    const inst = thrownInst("molotov", b);
    if (!world) {
      // the lit rag (flickers in onFrame)
      const flame = new THREE.Group();
      flame.position.set(0.002, 0.125, 0.006);
      inst.root.add(flame);
      const fb = P.builder();
      fb.sphere("glowAmber", 0.007, [0, 0, 0], { ws: 8, hs: 6 });
      fb.add(GEO.cyl(0.005, 0.02, 8, 0.0005), "glowWhite", {
        p: [0, 0.008, 0],
        r: [-Math.PI / 2, 0, 0],
      });
      flame.add(fb.build());
      inst.parts.flame = flame;
      inst.cfg.onFrame = (m, dt, V) => {
        const t = V.time,
          k = 0.85 + Math.sin(t * 31) * 0.15 + Math.sin(t * 53) * 0.1;
        m.parts.flame.scale.set(k, k * 1.3, k);
      };
    }
    return inst;
  };
  M.frag_mine = function () {
    const b = P.builder();
    b.add(GEO.cylY(0.05, 0.022, 20), "olive", {});
    b.add(GEO.cylY(0.03, 0.008, 18), "darksteel", { p: [0, 0.014, 0] });
    b.add(GEO.torus(0.05, 0.004, 4, 20), "darksteel", {
      r: [Math.PI / 2, 0, 0],
    });
    b.sphere("glowRed", 0.005, [0.03, 0.013, 0.0]);
    for (let i = 0; i < 6; i++)
      b.box(
        "steel",
        0.006,
        0.004,
        0.012,
        [Math.cos(i) * 0.045, 0.012, Math.sin(i) * 0.045],
        { bevel: 0.001, r: [0, -i, 0] },
      );
    return thrownInst("frag_mine", b, {});
  };
})();
