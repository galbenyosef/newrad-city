// play-inline-446 01 — burnt
// Lines 24-340 of readable/play-inline-446.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G.props._;
  const C = X.PAL;
  const D = X.defineProto;
  const PI = Math.PI;
  const pick = (r, a) => a[(r() * a.length) | 0];

  const OLIVES = [0x4a5236, 0x505838, 0x464e34];
  const BURNT = 0x26221e;
  const TRACK = 0x2a2724;

  // ------------------------------------------------------------------
  // .50 cal heavy machine gun (receiver + barrel + handles), local: barrel along -Z
  // ------------------------------------------------------------------
  function heavyMG(k, x, y, z, ry, rx, burnt) {
    const s = new X.Kit(41);
    const gm = {
      color: burnt ? 0x1c1a18 : 0x2a2a28,
      rust: burnt ? 0.9 : 0.45,
      grime: 0.3,
    };
    s.box("metal", 0.16, 0.16, 0.62, 0, 0, 0.05, gm); // receiver
    s.cyl(
      "metal",
      0.032,
      0.032,
      1.05,
      0,
      0.01,
      -0.8,
      Object.assign({ rx: PI / 2, seg: 6 }, gm),
    ); // barrel
    s.cyl(
      "metal",
      0.05,
      0.05,
      0.3,
      0,
      0.01,
      -0.42,
      Object.assign({ rx: PI / 2, seg: 8 }, gm),
    ); // perforated jacket
    s.cyl(
      "metal",
      0.045,
      0.04,
      0.08,
      0,
      0.01,
      -1.32,
      Object.assign({ rx: PI / 2, seg: 6 }, gm),
    ); // flash hider
    for (const sd of [-1, 1])
      s.seg("metal", [sd * 0.06, 0, 0.38], [sd * 0.07, -0.02, 0.5], 0.018, gm); // spade grips
    s.box("metal", 0.14, 0.12, 0.2, 0.15, -0.04, 0.02, {
      color: burnt ? 0x1c1a18 : 0x3a4028,
      rust: 0.4,
    }); // ammo can
    for (let i = 0; i < 5; i++)
      s.box(
        "chrome",
        0.022,
        0.03,
        0.09,
        0.09 - i * 0.022,
        -0.02 - i * 0.012,
        0.02,
        { color: burnt ? 0x2a2420 : 0xa08040 },
      ); // belt
    k.include(s, { x, y, z, ry: ry || 0, rx: rx || 0 });
  }
  function sandbag(k, r, x, y, z, ry, burnt) {
    k.sphere("fabric", 0.34, x, y + 0.1, z, {
      s: [1.1, 0.34, 0.58],
      ry: ry + (r() - 0.5) * 0.15,
      color: burnt ? 0x3a342c : pick(r, [0xa89870, 0x9a8a62, 0x8a7c58]),
      wseg: 6,
      hseg: 4,
      grime: 0.25,
    });
  }
  function jerrycan(k, x, y, z, ry, col) {
    k.boxB("metal", 0.34, 0.46, 0.16, x, y, z, {
      ry,
      color: col,
      rust: 0.45,
      grime: 0.3,
    });
    k.box("metal", 0.12, 0.04, 0.04, x, y + 0.49, z, { ry, color: 0x22231e });
  }

  // ------------------------------------------------------------------
  // TANK. Hull 6.8 m long, 3.3 m over the tracks, deck at 1.55 m; turret
  // ring at z = -0.2. Built in sub-kits so the turret can traverse / come off.
  // ------------------------------------------------------------------
  function tankTurret(r, burnt, OL) {
    const t = new X.Kit(43);
    const ol = {
      color: burnt ? BURNT : OL,
      rust: burnt ? 0.95 : 0.32,
      grime: 0.36,
    };
    const dark = { color: burnt ? 0x161412 : 0x22231e, rust: 0.5, grime: 0.25 };
    // cast turret: a squashed dome stretched fore-aft, with a bustle behind and a heavy mantlet in front
    t.lathe(
      "metal",
      [
        [0, 0],
        [1.02, 0],
        [1.14, 0.16],
        [1.12, 0.46],
        [0.9, 0.74],
        [0.5, 0.86],
        [0, 0.88],
      ],
      0,
      0,
      0.1,
      Object.assign({ seg: 16, s: [1, 1, 1.32] }, ol),
    );
    t.cbox(
      "metal",
      1.7,
      0.62,
      0.9,
      0,
      0.36,
      1.45,
      Object.assign({ bevel: 0.1 }, ol),
    ); // bustle
    t.cbox(
      "metal",
      1.05,
      0.56,
      0.42,
      0,
      0.42,
      -1.36,
      Object.assign({ bevel: 0.08 }, ol),
    ); // mantlet
    // the 90 mm gun: tube, fume-extractor bulge two thirds out, muzzle brake
    t.cyl(
      "metal",
      0.115,
      0.13,
      4.3,
      0,
      0.44,
      -3.55,
      Object.assign({ rx: PI / 2, seg: 10 }, ol),
    );
    t.cyl(
      "metal",
      0.17,
      0.17,
      0.62,
      0,
      0.44,
      -3.3,
      Object.assign({ rx: PI / 2, seg: 10 }, ol),
    );
    t.cyl(
      "metal",
      0.16,
      0.16,
      0.34,
      0,
      0.44,
      -5.72,
      Object.assign({ rx: PI / 2, seg: 10 }, dark),
    );
    t.box("metal", 0.36, 0.08, 0.2, 0, 0.44, -5.72, dark);
    t.cyl("plain", 0.1, 0.1, 0.02, 0, 0.44, -5.9, {
      rx: PI / 2,
      seg: 8,
      color: 0x0a0908,
      ao: [1, 1],
    }); // bore
    // coaxial MG port + sight box on the mantlet
    t.cyl(
      "metal",
      0.03,
      0.03,
      0.3,
      0.36,
      0.34,
      -1.62,
      Object.assign({ rx: PI / 2, seg: 6 }, dark),
    );
    t.box("metal", 0.24, 0.2, 0.3, -0.62, 0.8, -0.6, ol);
    t.box("glass", 0.2, 0.1, 0.02, -0.62, 0.84, -0.76, {
      color: burnt ? 0x121110 : 0x3a4a48,
    });
    // commander's cupola (right) with the hatch flung open and the .50 cal on its ring
    t.cyl(
      "metal",
      0.36,
      0.4,
      0.3,
      0.45,
      0.98,
      0.35,
      Object.assign({ seg: 12 }, ol),
    );
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.45;
      t.box(
        "glass",
        0.1,
        0.06,
        0.02,
        0.45 + Math.sin(a) * 0.37,
        1.0,
        0.35 - Math.cos(a) * 0.37,
        { ry: -a, color: burnt ? 0x121110 : 0x4a5a58 },
      );
    }
    t.cyl("plain", 0.3, 0.3, 0.02, 0.45, 1.14, 0.35, {
      seg: 12,
      color: 0x0c0b0a,
      ao: [1, 1],
    }); // open hatch: dark inside
    t.cyl(
      "metal",
      0.32,
      0.32,
      0.06,
      0.45,
      1.36,
      0.72,
      Object.assign({ rx: -1.35, seg: 12 }, ol),
    ); // lid standing up
    if (!burnt || r() < 0.4)
      heavyMG(
        t,
        0.45,
        1.42,
        0.05,
        (r() - 0.5) * 0.8,
        burnt ? 0.25 : -0.12,
        burnt,
      );
    // loader's hatch (left) half open
    t.cyl(
      "metal",
      0.28,
      0.28,
      0.05,
      -0.45,
      0.9,
      0.5,
      Object.assign({ seg: 10, rx: -0.5 }, ol),
    );
    // searchlight on the left cheek, stowage bins on the bustle, antennas
    t.cyl(
      "metal",
      0.17,
      0.17,
      0.32,
      -0.95,
      0.9,
      -0.95,
      Object.assign({ rx: PI / 2, seg: 10 }, dark),
    );
    t.cyl(burnt ? "plain" : "glass", 0.14, 0.14, 0.02, -0.95, 0.9, -1.12, {
      rx: PI / 2,
      seg: 10,
      color: burnt ? 0x0c0b0a : 0x9aa8a0,
    });
    for (const sd of [-1, 1])
      t.box(
        "metal",
        0.34,
        0.42,
        1.0,
        sd * 1.03,
        0.4,
        1.35,
        Object.assign({ bevel: 0.03 }, ol),
      );
    t.box("metal", 1.72, 0.06, 0.86, 0, 0.7, 1.45, dark); // bustle rack
    if (!burnt) {
      for (let i = 0; i < 2; i++)
        t.cyl("fabric", 0.16, 0.16, 1.2, (i - 0.5) * 0.36, 0.86, 1.75, {
          rz: PI / 2,
          seg: 8,
          color: pick(r, [0x5c5a44, 0x4e5038, 0x6a6048]),
          grime: 0.4,
        }); // bedrolls
      jerrycan(t, 0.55, 0.73, 1.2, 0.1, 0x3e4430);
      t.box("fabric", 0.9, 0.12, 0.7, -0.3, 0.8, 1.2, {
        color: 0x5a5840,
        grime: 0.5,
        rz: 0.08,
      }); // tarp bundle
    }
    t.seg(
      "metal",
      [-0.62, 0.72, 1.7],
      [-0.72 + (r() - 0.5) * 0.3, 3.1, 1.95],
      0.012,
      { color: 0x1a1a18 },
    );
    t.seg("metal", [0.62, 0.72, 1.7], [0.9, 2.3, 2.5], 0.012, {
      color: 0x1a1a18,
    }); // bent whip
    // markings: star on each cheek + a turret number
    if (!burnt)
      for (const sd of [-1, 1])
        t.quad("army_star", 0.55, 0.55, sd * 1.155, 0.42, 0.25, {
          mat: "trim",
          ry: (sd * PI) / 2,
          grime: 0.35,
        });
    return t;
  }
