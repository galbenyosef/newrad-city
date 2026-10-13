// play-inline-496 01 — root
// Lines 13-333 of readable/play-inline-496.pretty.js (statement-aligned).
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
