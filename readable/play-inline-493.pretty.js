/* src/weapons/32_models_rifles.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: models — SMG, rifles, shotguns
 *   smg_10mm, mat49_smg (French stamped-steel SMG, magazine housing as the
 *   fore-grip, telescoping wire stock), assault_rifle (M-62),
 *   hunting_rifle (bolt, walnut, scope), sniper_rifle (M21-style),
 *   bolt_rifle_32 (single-shot boy's bolt rifle, iron sights),
 *   bb_gun (lever action), combat_shotgun (drum), sawed_off (double barrel, break action)
 * Origin = right-hand grip centre, forward = -Z, metres.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;
  const GEO = P.GEO,
    C = P.COMP;
  P.MODELS = P.MODELS || {};
  const M = P.MODELS;
  const raked = (pts, a) => P.raked(pts, a);

  // ------------------------------------------------------------------
  // Shared helpers
  // ------------------------------------------------------------------
  /** Pistol grip (profile) centred on the origin with rake a. */
  function pistolGrip(b, mat, a, o) {
    o = o || {};
    const w = o.w || 0.03,
      top = o.top || 0.05,
      bot = o.bot || -0.055,
      f = o.front || 0.02,
      r = o.rear || -0.022;
    b.profile(
      mat,
      raked(
        [
          [r, bot],
          [f - 0.002, bot],
          [f, bot + 0.012],
          [f + 0.003, 0.0],
          [f, top],
          [r - 0.008, top],
          [r - 0.004, top - 0.02],
          [r, 0.0],
        ],
        a,
      ),
      w,
      { bevel: 0.003 },
    );
    // finger grooves on the front strap
    if (o.grooves !== false)
      for (let i = 0; i < 3; i++) {
        const q = raked([[f + 0.002, bot + 0.02 + i * 0.022]], a)[0];
        b.add(GEO.cylX(0.004, w * 0.95, 8), mat, {
          p: [0, q[1], -q[0]],
          tint: 0.85,
        });
      }
  }
  /** Trigger guard loop under the receiver: from fwd f0 to f1 at top height y, depth d. */
  function triggerGuard(b, mat, f0, f1, y, d, thick) {
    thick = thick || 0.004;
    b.add(
      GEO.shapeProfile(
        (s) => {
          s.moveTo(f0, y);
          s.lineTo(f1, y);
          s.lineTo(f1 + 0.004, y - d * 0.4);
          s.quadraticCurveTo(f1, y - d, f1 - 0.015, y - d);
          s.lineTo(f0 + 0.006, y - d);
          s.lineTo(f0, y - d * 0.6);
          s.lineTo(f0, y);
          const h = new THREE.Path();
          h.moveTo(f0 + thick, y - 0.0015);
          h.lineTo(f1 - thick * 0.3, y - 0.0015);
          h.lineTo(f1 + 0.0005, y - d * 0.4);
          h.quadraticCurveTo(
            f1 - thick,
            y - d + thick,
            f1 - 0.015,
            y - d + thick,
          );
          h.lineTo(f0 + 0.008, y - d + thick);
          h.lineTo(f0 + thick, y - d * 0.6);
          h.lineTo(f0 + thick, y - 0.0015);
          s.holes.push(h);
        },
        0.012,
        0.0012,
      ),
      mat,
      {},
    );
  }
  function triggerPart(root, pivot, mat) {
    const tb = P.builder();
    tb.profile(
      mat || "steel",
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
    const t = P.part(root, tb, pivot, "trigger");
    t.children[0].position.set(0, 0, 0);
    return t;
  }
  /** Right hand on a pistol grip of rake a. */
  function rightOnGrip(root, a, p) {
    const d = P.gripAxis(a);
    return P.handSocket(
      root,
      "rightHand",
      p || [0.001, -0.004, 0.006],
      d,
      [0.82, 0, 0.45],
    );
  }
  /** Left hand under a handguard running along Z; tilt rotates the back of the hand from down toward left. */
  function leftUnder(parent, name, p, tilt) {
    const t = tilt === undefined ? 0.7 : tilt;
    return P.handSocket(
      parent,
      name || "leftHand",
      p,
      [0, 0, -1],
      [-Math.sin(t), -Math.cos(t), 0],
    );
  }
  /** Left hand gripping a vertical foregrip (like a pistol grip). */
  function leftOnForegrip(parent, p, a) {
    const d = P.gripAxis(a || 0.1);
    return P.handSocket(
      parent,
      "leftHand",
      p,
      [0, -d[1], -d[2]].map((v) => -v),
      [-0.85, 0, 0.4],
    );
  }
  /** Slotted flash hider / muzzle brake at the front. */
  function flashHider(b, mat, r, zBack, len, y, slots) {
    b.tube(mat, r, r * 0.6, len, [0, y, zBack - len / 2], { seg: 14 });
    for (let i = 0; i < (slots || 4); i++) {
      const a = (i / (slots || 4)) * Math.PI * 2 + 0.4;
      b.box(
        "darksteel",
        0.0025,
        0.0025,
        len * 0.7,
        [Math.cos(a) * r * 1.0, y + Math.sin(a) * r * 1.0, zBack - len * 0.55],
        { bevel: 0, r: [0, 0, a] },
      );
    }
  }
  /** Sling swivel ring */
  function swivel(b, x, y, z) {
    b.add(GEO.torus(0.007, 0.0015, 5, 12), "steel", {
      p: [x, y, z],
      r: [0, Math.PI / 2, 0],
    });
  }
  P.RIFLE = {
    pistolGrip,
    triggerGuard,
    triggerPart,
    rightOnGrip,
    leftUnder,
    leftOnForegrip,
    flashHider,
    swivel,
  };

  const RIFLE_SPRINT = { p: [-0.06, -0.04, 0.02], r: [-0.3, 0.8, 0.45] };
  const RIFLE_LOWER = { p: [0.06, -0.3, 0.1], r: [-0.9, 0.4, 0.3] };

  // ------------------------------------------------------------------
  // ASSAULT RIFLE (M-62) battle rifle, olive furniture
  // ------------------------------------------------------------------
  M.assault_rifle = function () {
    const root = new THREE.Group();
    root.name = "assault_rifle";
    const b = P.builder();
    const A = 0.32,
      recY0 = 0.035,
      recY1 = 0.1,
      by = 0.078;
    // pistol grip + trigger housing
    pistolGrip(b, "plastic", A, { top: 0.04, w: 0.03 });
    b.profile(
      "plastic",
      [
        [-0.03, 0.035],
        [0.07, 0.035],
        [0.075, 0.028],
        [0.06, 0.02],
        [-0.02, 0.02],
        [-0.035, 0.028],
      ],
      0.034,
      { bevel: 0.002 },
    );
    triggerGuard(b, "plastic", 0.012, 0.062, 0.022, 0.024);
    // receiver: stamped sheet box with flutes & rivets
    b.profile(
      "gunmetal",
      [
        [-0.07, recY0],
        [0.2, recY0],
        [0.2, 0.095],
        [0.13, 0.1],
        [-0.04, 0.1],
        [-0.07, 0.085],
      ],
      0.036,
      { bevel: 0.003 },
    );
    for (const sd of [-1, 1]) {
      b.box("darksteel", 0.002, 0.01, 0.16, [sd * 0.0182, 0.078, -0.07], {
        bevel: 0.0005,
      }); // pressed flute
      b.rivets(
        "steel",
        [
          [0, 0.05, 0.05],
          [0, 0.05, -0.02],
          [0, 0.05, -0.12],
          [0, 0.088, 0.04],
        ],
        0.0022,
        sd * 0.0185,
      );
    }
    // ejection port (right) and brass deflector
    b.box("darksteel", 0.004, 0.016, 0.045, [0.0176, 0.078, -0.01], {
      bevel: 0.001,
    });
    b.box("gunmetal", 0.008, 0.02, 0.012, [0.021, 0.08, 0.025], {
      bevel: 0.002,
    });
    // magwell + mag release
    b.box("gunmetal", 0.04, 0.03, 0.05, [0, 0.03, -0.085], { bevel: 0.004 });
    b.box("steel", 0.006, 0.008, 0.012, [0.021, 0.026, -0.058], {
      bevel: 0.0015,
    });
    // cocking tube over the barrel + front sight hood
    b.cyl("gunmetal", 0.012, 0.3, [0, 0.102, -0.29], { seg: 14 });
    b.box("gunmetal", 0.03, 0.035, 0.03, [0, 0.1, -0.445], { bevel: 0.004 });
    b.tube("gunmetal", 0.014, 0.011, 0.018, [0, 0.133, -0.445], {
      seg: 14,
      r: [0, 0, 0],
    });
    b.box("darksteel", 0.0025, 0.012, 0.004, [0, 0.128, -0.445], { bevel: 0 });
    // rear sight drum with a notched aperture plate (the sight line passes through the notch)
    b.add(GEO.cylX(0.014, 0.026, 16), "gunmetal", { p: [0, 0.113, 0.02] });
    b.box("darksteel", 0.005, 0.012, 0.006, [-0.0055, 0.128, 0.02], {
      bevel: 0.001,
    });
    b.box("darksteel", 0.005, 0.012, 0.006, [0.0055, 0.128, 0.02], {
      bevel: 0.001,
    });
    b.box("darksteel", 0.016, 0.004, 0.006, [0, 0.124, 0.02], { bevel: 0.001 });
    // handguard: thick olive with cooling slots
    b.add(
      GEO.lathe(
        [
          [0.026, 0.2],
          [0.03, 0.205],
          [0.031, 0.23],
          [0.029, 0.42],
          [0.024, 0.43],
        ],
        16,
      ),
      "olive",
      { p: [0, 0.078, 0], s: [1.0, 1.1, 1] },
    );
    for (let i = 0; i < 7; i++)
      for (const sd of [-1, 1])
        b.box(
          "darksteel",
          0.004,
          0.018,
          0.012,
          [sd * 0.028, 0.08, -0.225 - i * 0.027],
          { bevel: 0.002 },
        );
    // barrel + slotted flash hider
    C.barrel(b, "darksteel", 0.009, -0.42, -0.6, by, { crown: false });
    flashHider(b, "darksteel", 0.012, -0.6, 0.06, by, 4);
    // stock: fixed polymer, drop at the heel, rubber butt pad, sling swivel
    b.profile(
      "olive",
      [
        [-0.07, 0.098],
        [-0.07, 0.035],
        [-0.12, 0.02],
        [-0.31, 0.012],
        [-0.33, 0.01],
        [-0.33, 0.11],
        [-0.3, 0.115],
        [-0.12, 0.1],
      ],
      0.04,
      { bevel: 0.006 },
    );
    b.profile(
      "rubber",
      [
        [-0.33, 0.012],
        [-0.345, 0.012],
        [-0.345, 0.11],
        [-0.33, 0.11],
      ],
      0.042,
      { bevel: 0.004 },
    );
    swivel(b, 0, 0.005, 0.28);
    // U.S. ARMY stencil plate
    b.box("tan", 0.0008, 0.01, 0.05, [0.0202, 0.062, 0.2], { bevel: 0 });
    root.add(b.build());
    // --- parts ---
    const ch = P.builder();
    ch.box("steel", 0.012, 0.008, 0.01, [-0.018, 0.102, -0.31], {
      bevel: 0.002,
    });
    ch.add(GEO.cylX(0.004, 0.02, 8), "steel", { p: [-0.024, 0.102, -0.31] });
    const charger = P.part(root, ch, null, "charger");
    const trigger = triggerPart(root, [0, 0.03, -0.036]);
    const mb = C.boxMag("gunmetal", 0.024, 0.13, 0.042, 0.018, {
      plate: "darksteel",
      round: "brass",
    });
    const mag = P.part(root, mb, null, "mag");
    mag.children[0].position.set(0, 0.04, -0.064);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.665]),
      eject: P.socket(root, "eject", [0.02, 0.08, -0.01]),
      sight: P.socket(root, "sight", [0, 0.1335, 0.02]),
      rightHand: rightOnGrip(root, A),
      leftHand: leftUnder(root, "leftHand", [-0.002, 0.078, -0.232], -0.35),
      magGrip: leftUnder(mag, "magGrip", [-0.004, -0.08, -0.085], 1.2),
      chargeGrip: P.handSocket(
        charger,
        "chargeGrip",
        [-0.035, 0.09, -0.31],
        [0, -1, 0],
        [-1, 0, 0.2],
      ),
    };
    return {
      root,
      parts: { charger, trigger, mag },
      sockets,
      cfg: {
        hip: { p: [0.11, -0.128, -0.24], r: [0.02, 0.05, 0] },
        adsDist: 0.16,
        rightPose: "trigger",
        leftPose: "support",
        reload: {
          type: "mag",
          axis: [0, -0.96, -0.28],
          out: 0.08,
          away: [-0.03, -0.35, 0.05],
          tilt: { p: [-0.02, -0.02, 0.03], r: [0.12, 0.2, 0.5] },
          charge: { part: "charger", p: [0, 0, 0.06], grip: "chargeGrip" },
        },
        shot: [
          { part: "trigger", r: [-0.3, 0, 0], held: true },
          { part: "charger", p: [0, 0, 0.03], dur: 0.05 },
        ],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
      },
    };
  };

  // ------------------------------------------------------------------
  // MAT-49: a French stamped-steel SMG. Tubular receiver, perforated barrel
  // jacket, the magazine housing ahead of the trigger guard doubles as the
  // fore-grip (it folds forward under the barrel for carrying), grip safety
  // on the back strap, a telescoping two-rod wire stock.
  // ------------------------------------------------------------------
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
  M.sawed_off = function () {
    const root = new THREE.Group();
    root.name = "sawed_off";
    const b = P.builder();
    const A = 0.75,
      by = 0.06;
    // sawn-off pistol-grip stock (wood), raw cut end
    b.profile(
      "wood",
      raked(
        [
          [-0.02, -0.066],
          [0.018, -0.062],
          [0.02, 0.02],
          [0.026, 0.042],
          [-0.026, 0.042],
          [-0.025, 0.0],
        ],
        A,
      ),
      0.03,
      { bevel: 0.004 },
    );
    b.profile(
      "woodLight",
      raked(
        [
          [-0.02, -0.066],
          [0.018, -0.062],
          [0.018, -0.058],
          [-0.02, -0.062],
        ],
        A,
      ),
      0.032,
      { bevel: 0.001 },
    );
    // action body (case-hardened steel)
    b.profile(
      "steel",
      [
        [-0.04, 0.03],
        [0.064, 0.03],
        [0.078, 0.042],
        [0.078, 0.08],
        [-0.035, 0.08],
        [-0.048, 0.062],
      ],
      0.05,
      { bevel: 0.004 },
    );
    b.box("gunmetal", 0.052, 0.01, 0.1, [0, 0.083, 0.005], { bevel: 0.003 });
    for (const sd of [-1, 1])
      b.box("darksteel", 0.001, 0.02, 0.06, [sd * 0.0232, 0.055, 0.02], {
        bevel: 0,
      }); // engraving plate
    triggerGuard(b, "darksteel", 0.0, 0.05, 0.036, 0.026);
    // top lever
    b.box("darksteel", 0.01, 0.006, 0.03, [0.008, 0.078, 0.035], {
      bevel: 0.002,
      r: [0, 0.4, 0],
    });
    root.add(b.build());
    // barrels (part): pivot at the hinge pin at the front-bottom of the action
    const bb = P.builder();
    const L = 0.3;
    for (const sd of [-1, 1])
      C.barrel(bb, "gunmetal", 0.0125, -0.075, -0.075 - L, by, {
        x: sd * 0.0122,
        bore: 0.72,
        seg: 16,
      });
    bb.box("gunmetal", 0.012, 0.012, L, [0, by + 0.012, -0.075 - L / 2], {
      bevel: 0.003,
    }); // top rib
    bb.box("gunmetal", 0.012, 0.01, L * 0.9, [0, by - 0.012, -0.075 - L / 2], {
      bevel: 0.003,
    });
    bb.box("brass", 0.004, 0.004, 0.004, [0, by + 0.02, -0.075 - L + 0.01], {
      bevel: 0.001,
    }); // bead sight
    // splinter forend (wood) under the barrels
    bb.profile(
      "wood",
      [
        [0.09, 0.046],
        [0.22, 0.046],
        [0.23, 0.03],
        [0.1, 0.028],
      ],
      0.034,
      { bevel: 0.004 },
    );
    // shells in the chambers (visible when open)
    for (const sd of [-1, 1])
      bb.add(GEO.cyl(0.0112, 0.004, 12), "brass", {
        p: [sd * 0.0122, by, -0.075],
      });
    const barrels = P.part(root, bb, [0, 0.036, -0.075], "barrels");
    // hammers
    const hb = P.builder();
    for (const sd of [-1, 1])
      hb.profile(
        "steel",
        [
          [0.004, -0.006],
          [0.004, 0.01],
          [-0.004, 0.02],
          [-0.016, 0.022],
          [-0.01, 0.012],
          [-0.006, -0.006],
        ],
        0.006,
        { bevel: 0.001, p: [sd * 0.014, 0, 0] },
      );
    const hammer = P.part(root, hb, [0, 0.07, 0.02], "hammer");
    hammer.children[0].position.set(0, 0, 0);
    const trigger = triggerPart(root, [0, 0.036, -0.02]);
    // spare shells in the left hand during reload
    const sb = P.builder();
    for (const sd of [-1, 1]) {
      sb.cyl("red", 0.0105, 0.05, [sd * 0.012, 0, -0.02], { seg: 10 });
      sb.cyl("brass", 0.011, 0.014, [sd * 0.012, 0, 0.012], { seg: 10 });
    }
    const loadShells = P.part(root, sb, null, "loadShells");
    loadShells.position.set(0, by + 0.005, -0.12);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.38]),
      eject: P.socket(barrels, "eject", [-0.0122, by, -0.07]),
      eject2: P.socket(barrels, "eject2", [0.0122, by, -0.07]),
      sight: P.socket(root, "sight", [0, by + 0.024, 0.02]),
      rightHand: P.handSocket(
        root,
        "rightHand",
        [0.001, -0.01, 0.008],
        P.gripAxis(A),
        [0.8, 0.2, 0.5],
      ),
      leftHand: leftUnder(barrels, "leftHand", [0, 0.04, -0.17], -0.35),
      load: leftUnder(root, "load", [-0.012, by + 0.03, -0.11], 1.5),
    };
    return {
      root,
      parts: { barrels, hammer, trigger, loadShells },
      sockets,
      cfg: {
        hip: { p: [0.12, -0.13, -0.28], r: [0.02, 0.06, 0] },
        adsDist: 0.26,
        rightPose: "trigger",
        leftPose: "support",
        shot: [
          { part: "trigger", r: [-0.3, 0, 0], held: true },
          { part: "hammer", r: [-0.7, 0, 0], dur: 0.12 },
        ],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
        onFrame(m) {
          if (!P.action || P.action.name !== "reload")
            m.parts.loadShells.visible = false;
        },
      },
    };
  };
})();
