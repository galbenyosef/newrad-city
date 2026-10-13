// play-inline-493 01 — thick
// Lines 12-186 of readable/play-inline-493.pretty.js (statement-aligned).
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
