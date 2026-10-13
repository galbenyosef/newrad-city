/* src/characters/42_robots2.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: more robots (American Automaton Co. line)
 * Owned by: characters.
 *
 *  Thinker — a CABINET-like analytical robot: a tall mainframe cabinet on
 *            a tread base, a front panel with two reel-to-reel tape windows,
 *            punch-card slot and indicator lamps, two manipulator arms, and
 *            on top a flat VALVE RACK: two rows of glowing vacuum tubes in an
 *            open rectangular frame under a louvred hood. A
 *            ray-emitter dish on the front is its weapon (muzzle socket).
 *  Striker — fast combat robot: a forward-leaning sprinter frame on
 *            reverse-jointed (digitigrade-looking) legs, a low wedge sensor
 *            head without a face, blade forearms and an arc emitter in a
 *            right-shoulder pod (muzzle socket).
 * Robots bleed oil & sparks (gore 'oil').
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !G.chars || !G.chars._lib || !G.chars._lib.human) return;
  const L = G.chars._lib,
    H = L.human;
  const P = L.prim;
  const lerp = L.lerp,
    clamp = L.clamp;
  const PI = Math.PI;
  const ALL6 = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"];
  const _qa = new THREE.Quaternion(),
    _va = new THREE.Vector3(),
    _vb = new THREE.Vector3(0, -1, 0);
  function seg(R, bone, to, r0, r1, mat, o) {
    o = o || {};
    _va.set(to[0], to[1], to[2]);
    const len = _va.length();
    const g = P.limb(len, r0, r1, {
      seg: o.seg || 10,
      bulge: o.bulge || 0,
      flat: o.flat,
    });
    _qa.setFromUnitVectors(_vb, _va.normalize());
    g.applyQuaternion(_qa);
    return R.add(bone, g, mat);
  }
  function rustPaint(x, y, z, nx, ny, nz, out, wx, wy, wz) {
    const n = L.noise3(wx * 11, wy * 11, wz * 11);
    if (n > 0.7) {
      const k = (n - 0.7) * 3;
      out[0] = lerp(out[0], 0.36, k);
      out[1] = lerp(out[1], 0.18, k);
      out[2] = lerp(out[2], 0.08, k);
    }
  }
  const metal = (c, extra) =>
    Object.assign(
      {
        color: c,
        region: "metal",
        rough: 0.42,
        metal: 0.45,
        noise: 0.16,
        grad: [0.8, 1.1],
      },
      extra || {},
    );
  const paint = (c, extra) =>
    Object.assign(
      {
        color: c,
        region: "metal",
        rough: 0.55,
        metal: 0.35,
        noise: 0.2,
        grad: [0.78, 1.1],
        paint: rustPaint,
      },
      extra || {},
    );
  const light = (c, e) => ({
    color: c,
    rough: 0.2,
    emis: e || 1.6,
    noise: 0.02,
    grad: [1, 1],
    keepLod: true,
  });
  const hose = (R, bone, pts, r, mat, ribs) => {
    const n = ribs || 8;
    return R.add(
      bone,
      P.sweep(
        pts,
        (t) => r * (1 + 0.18 * Math.max(0, Math.sin(t * n * PI * 2))),
        { seg: n * 4, rs: 8 },
      ),
      mat,
    );
  };

  // ==================================================================
  // THINKER
  // ==================================================================
  function buildThinker(opts, seed) {
    const rng = L.rng(seed);
    const b = H.proportions("m", { scale: 1.0, shoulderMul: 1.2 });
    b.hipH = 0.5;
    b.spine = 0.08;
    b.chest = 0.3;
    b.neckY = 0.42;
    const R = new L.Rig("biped");
    H.skeleton(R, b);
    const s = b.s;
    for (const [S, part] of [
      ["L", "leftArm"],
      ["R", "rightArm"],
    ])
      R.bone("pincer" + S, "hand" + S, 0, -0.035 * s, 0.028 * s, part);
    const cabC = rng.pick([0x8c8a7a, 0x7d8478, 0x9a9282]);
    const cab = paint(cabC, { rough: 0.5 }),
      dark = metal(0x262624, { rough: 0.6 }),
      trim = metal(0x6a6a62),
      chrome = metal(0xb8b8b0, { rough: 0.25, metal: 0.85 });
    const tread = { color: 0x1a1a18, region: "tire", rough: 0.9, noise: 0.1 };
    // ---- tread base (on the hips: it doesn't swing) ----
    const hy = -b.hipH;
    for (const sg of [-1, 1]) {
      const x = sg * 0.2 * s;
      R.add(
        "hips",
        P.xf(
          P.box(0.12 * s, 0.22 * s, 0.66 * s, 0.1 * s),
          x,
          hy + 0.12 * s,
          0.0,
        ),
        tread,
      );
      for (let i = 0; i < 3; i++)
        R.add(
          "hips",
          P.xf(
            P.cyl(0.075 * s, 0.075 * s, 0.13 * s, 12),
            x,
            hy + 0.1 * s,
            (-0.2 + i * 0.2) * s,
            0,
            0,
            PI / 2,
          ),
          trim,
        );
    }
    R.add(
      "hips",
      P.xf(P.box(0.32 * s, 0.16 * s, 0.5 * s, 0.04 * s), 0, hy + 0.3 * s, 0),
      dark,
    );
    R.add(
      "hips",
      P.xf(P.box(0.5 * s, 0.08 * s, 0.4 * s, 0.03 * s), 0, -0.04 * s, 0),
      trim,
    ); // plinth
    // ---- cabinet (spine + chest): tall mainframe box ----
    R.add(
      "spine",
      P.xf(
        P.box(0.46 * s, b.spine + 0.02 * s, 0.34 * s, 0.02 * s),
        0,
        b.spine * 0.5,
        0,
      ),
      dark,
    );
    const cabG = P.box(0.5 * s, 0.68 * s, 0.36 * s, 0.03 * s, 3);
    R.add("chest", P.xf(cabG, 0, 0.12 * s, 0), cab);
    // front panel: two tape-reel windows, lamp matrix, card slot, maker plate, emitter dish
    R.add(
      "chest",
      P.xf(
        P.box(0.42 * s, 0.24 * s, 0.02 * s, 0.01 * s),
        0,
        0.3 * s,
        -0.18 * s,
      ),
      dark,
    );
    for (const sg of [-1, 1]) {
      const cx = sg * 0.1 * s,
        cy = 0.3 * s;
      R.add(
        "chest",
        P.xf(
          P.cyl(0.085 * s, 0.085 * s, 0.012 * s, 22),
          cx,
          cy,
          -0.19 * s,
          PI / 2,
          0,
          0,
        ),
        metal(0x14181a, { rough: 0.08, metal: 0.4 }),
      );
      R.add(
        "chest",
        P.xf(P.torus(0.086 * s, 0.008 * s, 5, 22), cx, cy, -0.196 * s),
        chrome,
      );
      R.add(
        "chest",
        P.xf(
          P.cyl(0.065 * s, 0.065 * s, 0.006 * s, 18),
          cx,
          cy,
          -0.199 * s,
          PI / 2,
          0,
          0,
        ),
        metal(0x8a8a84, { rough: 0.3, metal: 0.7 }),
      ); // reel flange
      R.add(
        "chest",
        P.xf(
          P.cyl(0.018 * s, 0.018 * s, 0.01 * s, 10),
          cx,
          cy,
          -0.204 * s,
          PI / 2,
          0,
          0,
        ),
        dark,
      );
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * PI * 2 + (sg > 0 ? 0.5 : 0);
        R.add(
          "chest",
          P.xf(
            P.box(0.022 * s, 0.022 * s, 0.006 * s, 0.006 * s),
            cx + Math.cos(a) * 0.04 * s,
            cy + Math.sin(a) * 0.04 * s,
            -0.204 * s,
          ),
          dark,
        );
      } // reel holes
    }
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 2; j++) {
        const lit = L.hash3(i * 3.1, j * 7.7, seed % 97) > 0.4;
        R.add(
          "chest",
          P.xf(
            P.cyl(0.011 * s, 0.011 * s, 0.01 * s, 8),
            (-0.175 + i * 0.05) * s,
            (0.12 - j * 0.035) * s,
            -0.185 * s,
            PI / 2,
            0,
            0,
          ),
          lit ? light(j ? 0xffb040 : i % 3 ? 0xff5030 : 0x70e070, 1.6) : dark,
        );
      }
    R.add(
      "chest",
      P.xf(
        P.box(0.2 * s, 0.014 * s, 0.01 * s, 0.003 * s),
        0,
        0.04 * s,
        -0.183 * s,
      ),
      { color: 0x0a0a0a, rough: 0.9 },
    ); // punch-card slot
    R.decal(
      "chest",
      "maker",
      0.18 * s,
      0.05 * s,
      0,
      -0.04 * s,
      -0.182 * s,
      0,
      0,
      0,
    );
    // emitter dish on the lower front
    R.add(
      "chest",
      P.xf(
        P.cyl(0.02 * s, 0.03 * s, 0.06 * s, 10),
        0,
        -0.13 * s,
        -0.2 * s,
        PI / 2,
        0,
        0,
      ),
      dark,
    );
    R.add(
      "chest",
      P.xf(
        P.lathe(
          [
            [0.001, 0],
            [0.05, 0.005],
            [0.075, 0.025],
            [0.07, 0.03],
            [0.045, 0.012],
            [0.001, 0.008],
          ].map((q) => [q[0] * s, q[1] * s]),
          18,
        ),
        0,
        -0.13 * s,
        -0.23 * s,
        -PI / 2,
        0,
        0,
      ),
      chrome,
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.006 * s, 0.006 * s, 0.05 * s, 6),
        0,
        -0.13 * s,
        -0.25 * s,
        PI / 2,
        0,
        0,
      ),
      chrome,
    );
    R.add(
      "chest",
      P.xf(
        P.sphere(0.012 * s, 0.012 * s, 0.012 * s, 8, 6),
        0,
        -0.13 * s,
        -0.276 * s,
      ),
      light(0x9ae0ff, 2.4),
    );
    // side vents + back cable bundle
    for (const sg of [-1, 1])
      for (let i = 0; i < 6; i++)
        R.add(
          "chest",
          P.xf(
            P.box(0.01 * s, 0.012 * s, 0.24 * s, 0.003 * s),
            sg * 0.252 * s,
            (-0.05 + i * 0.05) * s,
            0,
          ),
          dark,
        );
    for (let i = 0; i < 3; i++)
      R.add(
        "chest",
        P.sweep(
          [
            [(-0.08 + i * 0.08) * s, 0.4 * s, 0.17 * s],
            [(-0.08 + i * 0.08) * s, 0.1 * s, 0.24 * s],
            [(-0.06 + i * 0.06) * s, -0.3 * s, 0.2 * s],
          ],
          0.014 * s,
          { seg: 8, rs: 5 },
        ),
        { color: 0x2a2018, rough: 0.7 },
      );
    // ---- head: a flat-topped VALVE RACK — two rows of glowing vacuum tubes standing in an
    //      open rectangular steel frame on a square chassis plate, a louvred hood over the back ----
    R.add(
      "neck",
      P.xf(P.box(0.4 * s, 0.05 * s, 0.3 * s, 0.01 * s), 0, -0.02 * s, 0),
      trim,
    );
    const hs = s;
    R.add(
      "head",
      P.xf(P.box(0.46 * hs, 0.045 * hs, 0.32 * hs, 0.012 * hs), 0, 0.0, 0),
      dark,
    );
    const tubeGlass = {
      color: 0xd8c8a8,
      rough: 0.08,
      metal: 0.1,
      emis: 0.35,
      noise: 0.02,
      grad: [0.9, 1.15],
    };
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 5; i++) {
        const x = (-0.16 + i * 0.08) * hs,
          z = (row ? 0.05 : -0.07) * hs,
          h = (row ? 0.15 : 0.12) * hs;
        R.add(
          "head",
          P.xf(P.cyl(0.022 * hs, 0.024 * hs, 0.02 * hs, 8), x, 0.03 * hs, z),
          dark,
        ); // tube socket
        R.add(
          "head",
          P.xf(P.cyl(0.018 * hs, 0.02 * hs, h, 10), x, 0.04 * hs + h / 2, z),
          tubeGlass,
        ); // glass envelope
        R.add(
          "head",
          P.xf(
            P.sphere(
              0.018 * hs,
              0.012 * hs,
              0.018 * hs,
              8,
              4,
              0,
              PI * 2,
              0,
              PI / 2,
            ),
            x,
            0.04 * hs + h,
            z,
          ),
          tubeGlass,
        ); // tip
        R.add(
          "head",
          P.xf(
            P.cyl(0.008 * hs, 0.008 * hs, h * 0.55, 6),
            x,
            0.04 * hs + h * 0.45,
            z,
          ),
          light(0xff8a30, 2.4),
        ); // glowing filament
      }
    // open frame: four corner posts, flat top rails (square, not a dome)
    const fx = 0.215 * hs,
      fz = 0.145 * hs,
      ft = 0.22 * hs;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        R.add(
          "head",
          P.xf(
            P.box(0.016 * hs, ft, 0.016 * hs, 0.003 * hs),
            sx * fx,
            ft / 2,
            sz * fz,
          ),
          chrome,
        );
    for (const sz of [-1, 1])
      R.add(
        "head",
        P.xf(
          P.box(fx * 2 + 0.016 * hs, 0.014 * hs, 0.014 * hs, 0.003 * hs),
          0,
          ft,
          sz * fz,
        ),
        chrome,
      );
    for (const sx of [-1, 1])
      R.add(
        "head",
        P.xf(P.box(0.014 * hs, 0.014 * hs, fz * 2, 0.003 * hs), sx * fx, ft, 0),
        chrome,
      );
    // louvred hood over the back row (sheet-steel shade with slots)
    R.add(
      "head",
      P.xf(
        P.box(fx * 2, 0.012 * hs, 0.13 * hs, 0.004 * hs),
        0,
        ft + 0.012 * hs,
        0.08 * hs,
        -0.12,
        0,
        0,
      ),
      cab,
    );
    for (let i = 0; i < 4; i++)
      R.add(
        "head",
        P.xf(
          P.box(fx * 1.8, 0.004 * hs, 0.012 * hs, 0.001),
          0,
          ft + 0.02 * hs,
          (0.035 + i * 0.03) * hs,
          -0.12,
          0,
          0,
        ),
        dark,
      );
    // a front gauge strip with a needle
    R.add(
      "head",
      P.xf(
        P.box(0.3 * hs, 0.03 * hs, 0.01 * hs, 0.004 * hs),
        0,
        0.0,
        -0.165 * hs,
      ),
      metal(0x14181a, { rough: 0.1, metal: 0.4 }),
    );
    R.add(
      "head",
      P.xf(
        P.box(0.004 * hs, 0.024 * hs, 0.004 * hs, 0.001),
        0.05 * hs,
        0.0,
        -0.172 * hs,
        0,
        0,
        0.5,
      ),
      light(0xffb040, 1.6),
    );
    // ---- arms: telescoping tubes from the cabinet shoulders, clamp pincers ----
    for (const [S] of [["L"], ["R"]]) {
      R.add(
        "arm" + S,
        P.xf(P.box(0.1 * s, 0.1 * s, 0.12 * s, 0.025 * s), 0, 0, 0),
        cab,
      );
      seg(R, "arm" + S, [0, -b.upper, 0], 0.035 * s, 0.03 * s, chrome);
      R.add(
        "forearm" + S,
        P.xf(P.cyl(0.045 * s, 0.045 * s, 0.07 * s, 10), 0, 0, 0, 0, 0, PI / 2),
        dark,
      );
      R.add(
        "forearm" + S,
        P.xf(P.cyl(0.042 * s, 0.05 * s, b.fore * 0.8, 10), 0, -b.fore * 0.5, 0),
        cab,
      );
      R.add(
        "hand" + S,
        P.xf(P.cyl(0.04 * s, 0.033 * s, 0.05 * s, 10), 0, -0.02 * s, 0),
        trim,
      );
      R.add(
        "hand" + S,
        P.sweep(
          [
            [0, -0.03 * s, -0.022 * s],
            [0, -0.09 * s, -0.045 * s],
            [0, -0.14 * s, -0.014 * s],
          ],
          (t) => (0.016 - t * 0.009) * s,
          { seg: 6, rs: 6 },
        ),
        chrome,
      );
      R.add(
        "pincer" + S,
        P.sweep(
          [
            [0, 0, 0],
            [0, -0.06 * s, 0.02 * s],
            [0, -0.11 * s, -0.012 * s],
          ],
          (t) => (0.016 - t * 0.009) * s,
          { seg: 6, rs: 6 },
        ),
        chrome,
      );
    }
    R.socket("muzzle", "chest", 0, -0.13 * s, -0.28 * s);
    R.socket("eyes", "chest", 0, 0.3 * s, -0.2 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      gore: "oil",
      bodyThick: 0.22 * s,
      noFootIK: true,
      dirt: [0.2, 0.5],
      cut: {
        head: "head",
        leftArm: "forearmL",
        rightArm: "forearmR",
        leftLeg: null,
        rightLeg: null,
      },
    });
    tpl.markers.leftLeg = {
      bone: 0,
      pos: [-0.2 * s, -b.hipH + 0.12 * s, 0],
      r: 0.12 * s,
    };
    tpl.markers.rightLeg = {
      bone: 0,
      pos: [0.2 * s, -b.hipH + 0.12 * s, 0],
      r: 0.12 * s,
    };
    tpl.hit = tpl.hit.filter(
      (h) => h.part !== "leftLeg" && h.part !== "rightLeg",
    );
    tpl.hit.push({
      part: "leftLeg",
      bone: 0,
      a: [-0.2 * s, -b.hipH + 0.12 * s, -0.28 * s],
      b: [-0.2 * s, -b.hipH + 0.12 * s, 0.28 * s],
      r: 0.11 * s,
    });
    tpl.hit.push({
      part: "rightLeg",
      bone: 0,
      a: [0.2 * s, -b.hipH + 0.12 * s, -0.28 * s],
      b: [0.2 * s, -b.hipH + 0.12 * s, 0.28 * s],
      r: 0.11 * s,
    });
    return tpl;
  }
  L.infos.thinker = {
    kind: "biped",
    height: 1.95,
    radius: 0.42,
    gore: "oil",
    isRobot: true,
    parts: ALL6,
    labels: {
      head: "Tube Dome",
      torso: "Cabinet",
      leftArm: "Left Arm",
      rightArm: "Right Arm",
      leftLeg: "Left Tread",
      rightLeg: "Right Tread",
    },
    gait: { walkStep: 0.6, runStep: 0.9, walkSpeed: 1.1, runSpeed: 2.6 },
    style: {
      stiff: true,
      tracked: true,
      armOut: 0.22,
      armFwd: 0.45,
      elbow: 0.9,
      armSwing: 0.2,
      stride: 0.5,
      pincers: true,
      ranged: true,
      lookLimit: 0.6,
    },
    variants: 3,
    build: buildThinker,
  };

  // ==================================================================
  // STRIKER
  // ==================================================================
  function buildStriker(opts, seed) {
    const rng = L.rng(seed);
    const b = H.proportions("m", { scale: 1.08, shoulderMul: 1.05 });
    b.upper *= 1.05;
    b.fore *= 1.1;
    const R = new L.Rig("biped");
    H.skeleton(R, b, { neckZ: -0.05 * b.s, headZ: -0.03 * b.s });
    const s = b.s;
    const shellC = rng.pick([0x3e4246, 0x4a4e44, 0x585a5c]);
    const shell = paint(shellC, { rough: 0.45 }),
      accent = paint(0xc8661e),
      frame = metal(0x2c2c2a, { rough: 0.45 }),
      chrome = metal(0xc0c0b8, { rough: 0.22, metal: 0.9 }),
      dark = metal(0x161614, { rough: 0.6 });
    const blade = metal(0xd8d8d0, { rough: 0.15, metal: 0.95 });
    // ---- pelvis & spine column ----
    R.add(
      "hips",
      P.xf(P.box(0.26 * s, 0.1 * s, 0.18 * s, 0.03 * s), 0, 0, 0.01 * s),
      frame,
    );
    R.add(
      "hips",
      P.xf(
        P.box(0.18 * s, 0.07 * s, 0.03 * s, 0.01 * s),
        0,
        0.01 * s,
        -0.08 * s,
      ),
      accent,
    );
    for (let i = 0; i < 4; i++)
      R.add(
        "spine",
        P.xf(
          P.box(0.08 * s, 0.04 * s, 0.07 * s, 0.012 * s),
          0,
          (0.02 + i * 0.05) * s,
          0.03 * s,
        ),
        frame,
      );
    for (const sg of [-1, 1])
      R.add(
        "spine",
        P.xf(
          P.cyl(0.012 * s, 0.012 * s, b.spine * 1.3, 6),
          sg * 0.07 * s,
          b.spine * 0.5,
          -0.02 * s,
        ),
        chrome,
      );
    // ---- chest: a forward-pointing keel wedge with armour fins ----
    const ch = P.loft(
      [
        { y: -0.04 * s, rx: 0.12 * s, rz: 0.1 * s, n: 2.6 },
        { y: 0.08 * s, rx: 0.2 * s, rz: 0.15 * s, n: 3.2 },
        { y: 0.18 * s, rx: 0.24 * s, rz: 0.14 * s, n: 3.4 },
        { y: 0.25 * s, rx: 0.15 * s, rz: 0.1 * s, n: 2.6 },
      ],
      { seg: 20, capTop: true, capBottom: true },
    );
    P.deform(ch, (v) => {
      if (v.z < 0) v.z *= 1 + 0.6 * Math.max(0, 1 - Math.abs(v.x) / (0.12 * s));
    }); // keel ridge
    R.add("chest", ch, shell);
    R.add(
      "chest",
      P.xf(
        P.box(0.03 * s, 0.22 * s, 0.03 * s, 0.01 * s),
        0,
        0.12 * s,
        -0.215 * s,
      ),
      accent,
    );
    R.decal(
      "chest",
      "hazard",
      0.16 * s,
      0.03 * s,
      0,
      0.0,
      -0.16 * s,
      -0.4,
      0,
      0,
    );
    R.decal(
      "chest",
      "maker",
      0.12 * s,
      0.035 * s,
      0,
      0.18 * s,
      0.135 * s,
      0,
      PI,
      0,
    );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.02 * s, 0.16 * s, 0.14 * s, 0.006 * s),
          sg * 0.08 * s,
          0.24 * s,
          0.13 * s,
          -0.35,
          0,
          sg * 0.25,
        ),
        frame,
      ); // dorsal fins
    // right-shoulder ARC POD: coil rings and an emissive tip
    R.add(
      "chest",
      P.xf(
        P.box(0.1 * s, 0.09 * s, 0.12 * s, 0.02 * s),
        0.17 * s,
        b.shY + 0.09 * s,
        0.0,
      ),
      shell,
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.035 * s, 0.04 * s, 0.2 * s, 12),
        0.17 * s,
        b.shY + 0.1 * s,
        -0.12 * s,
        PI / 2,
        0,
        0,
      ),
      frame,
    );
    for (let k = 0; k < 3; k++)
      R.add(
        "chest",
        P.xf(
          P.torus(0.045 * s, 0.008 * s, 5, 14),
          0.17 * s,
          b.shY + 0.1 * s,
          (-0.06 - k * 0.05) * s,
        ),
        light(0x7ad8ff, 1.0),
      );
    R.add(
      "chest",
      P.xf(
        P.sphere(0.022 * s, 0.022 * s, 0.022 * s, 10, 8),
        0.17 * s,
        b.shY + 0.1 * s,
        -0.225 * s,
      ),
      light(0xb8f0ff, 2.8),
    );
    // left shoulder cowl
    R.add(
      "chest",
      P.xf(
        P.sphere(0.08 * s, 0.05 * s, 0.08 * s, 10, 7, 0, PI * 2, 0, PI * 0.6),
        -0.19 * s,
        b.shY + 0.03 * s,
        0,
        0,
        0,
        0.3,
      ),
      shell,
    );
    // ---- head: low faceless wedge with a sensor groove and two side optics ----
    R.add(
      "neck",
      P.xf(
        P.cyl(0.035 * s, 0.04 * s, b.neckY + b.headY, 8),
        0,
        (b.neckY + b.headY) * 0.4,
        0,
      ),
      frame,
    );
    const hs = b.headS;
    const wedge = P.extrude(
      [
        [-0.09, 0.0],
        [0.09, 0.0],
        [0.1, 0.055],
        [0.035, 0.085],
        [-0.035, 0.085],
        [-0.1, 0.055],
      ].map((q) => [q[0] * hs, q[1] * hs]),
      0.26 * hs,
      0.008 * hs,
    );
    P.deform(wedge, (v) => {
      const f = clamp(-v.z / (0.11 * hs), -1, 1);
      if (f > 0) {
        v.y *= 1 - 0.55 * f;
        v.x *= 1 - 0.25 * f;
      }
    }); // tapers to a prow
    R.add("head", P.xf(wedge, 0, 0.03 * hs, -0.04 * hs), shell);
    R.add(
      "head",
      P.xf(
        P.box(0.03 * hs, 0.012 * hs, 0.2 * hs, 0.004 * hs),
        0,
        0.1 * hs,
        -0.06 * hs,
      ),
      accent,
    ); // crest stripe
    for (const sg of [-1, 1]) {
      R.add(
        "head",
        P.xf(
          P.cyl(0.016 * hs, 0.018 * hs, 0.02 * hs, 10),
          sg * 0.088 * hs,
          0.04 * hs,
          -0.05 * hs,
          0,
          0,
          PI / 2,
        ),
        frame,
      );
      R.add(
        "head",
        P.xf(
          P.cyl(0.012 * hs, 0.012 * hs, 0.004 * hs, 10),
          sg * 0.1 * hs,
          0.04 * hs,
          -0.05 * hs,
          0,
          0,
          PI / 2,
        ),
        light(0xff6a1a, 2.4),
      );
    }
    // ---- arms: struts, elbow drums, armoured forearms ending in long blades ----
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      R.add(
        "arm" + S,
        P.xf(P.sphere(0.05 * s, 0.05 * s, 0.05 * s, 10, 8), 0, 0, 0),
        frame,
      );
      seg(R, "arm" + S, [0, -b.upper, 0], 0.035 * s, 0.03 * s, shell);
      R.add(
        "arm" + S,
        P.xf(
          P.cyl(0.008 * s, 0.008 * s, b.upper * 0.8, 6),
          sg * 0.03 * s,
          -b.upper * 0.5,
          0.02 * s,
        ),
        chrome,
      );
      R.add(
        "forearm" + S,
        P.xf(P.cyl(0.035 * s, 0.035 * s, 0.07 * s, 10), 0, 0, 0, 0, 0, PI / 2),
        frame,
      );
      const fa = P.box(0.075 * s, b.fore * 0.9, 0.09 * s, 0.015 * s);
      P.deform(fa, (v) => {
        const k = 1 + 0.2 * (-v.y / (b.fore * 0.45));
        v.z *= k;
      });
      R.add("forearm" + S, P.xf(fa, 0, -b.fore * 0.5, 0.005 * s), shell);
      R.add(
        "forearm" + S,
        P.xf(
          P.box(0.02 * s, b.fore * 0.6, 0.03 * s, 0.006 * s),
          sg * 0.04 * s,
          -b.fore * 0.5,
          0,
        ),
        accent,
      );
      R.add(
        "hand" + S,
        P.xf(P.box(0.05 * s, 0.05 * s, 0.07 * s, 0.012 * s), 0, -0.02 * s, 0),
        frame,
      );
      // blade: a flat curved sabre continuing the forearm, edge forward
      const bl = P.extrude(
        [
          [0, 0.0],
          [0.03, 0.0],
          [0.025, -0.25],
          [0.0, -0.36],
          [-0.012, -0.28],
          [-0.006, 0.0],
        ].map((q) => [q[1] * s, q[0] * s]),
        0.008 * s,
        0.002 * s,
      );
      bl.rotateZ(PI / 2);
      bl.rotateY(PI / 2);
      R.add("hand" + S, P.xf(bl, 0, -0.03 * s, -0.01 * s), blade);
    }
    // ---- legs: thighs angled, shins with a raised hock + long foot (reads digitigrade) ----
    for (const S of ["L", "R"]) {
      R.add(
        "thigh" + S,
        P.xf(P.sphere(0.055 * s, 0.055 * s, 0.055 * s, 10, 8), 0, 0, 0),
        frame,
      );
      seg(
        R,
        "thigh" + S,
        [0, -b.thigh, -0.02 * s],
        0.065 * s,
        0.045 * s,
        shell,
        { bulge: 0.012 * s },
      );
      R.add(
        "shin" + S,
        P.xf(P.sphere(0.045 * s, 0.045 * s, 0.045 * s, 10, 7), 0, 0, 0),
        accent,
      );
      seg(
        R,
        "shin" + S,
        [0, -b.shin * 0.62, 0.1 * s],
        0.04 * s,
        0.035 * s,
        frame,
      ); // shank back to the hock
      R.add(
        "shin" + S,
        P.xf(
          P.sphere(0.035 * s, 0.035 * s, 0.035 * s, 8, 6),
          0,
          -b.shin * 0.62,
          0.1 * s,
        ),
        accent,
      ); // hock joint
      R.add(
        "shin" + S,
        P.sweep(
          [
            [0, -b.shin * 0.62, 0.1 * s],
            [0, -b.shin * 0.85, 0.05 * s],
            [0, -b.shin - 0.01 * s, -0.01 * s],
          ],
          0.026 * s,
          { seg: 6, rs: 6 },
        ),
        frame,
      ); // metatarsal
      R.add(
        "shin" + S,
        P.xf(
          P.cyl(0.008 * s, 0.008 * s, b.shin * 0.55, 6),
          0,
          -b.shin * 0.33,
          0.1 * s,
          -0.3,
          0,
          0,
        ),
        chrome,
      );
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.08 * s, b.ankle + 0.015 * s, 0.17 * s, 0.015 * s),
          0,
          -b.ankle / 2 + 0.008 * s,
          -0.06 * s,
        ),
        shell,
      );
      for (const sx of [-1, 1])
        R.add(
          "foot" + S,
          P.sweep(
            [
              [sx * 0.025 * s, -b.ankle + 0.02 * s, -0.12 * s],
              [sx * 0.03 * s, -b.ankle + 0.01 * s, -0.17 * s],
              [sx * 0.03 * s, -b.ankle - 0.002 * s, -0.2 * s],
            ],
            (t) => (0.012 - t * 0.008) * s,
            { seg: 5, rs: 4 },
          ),
          chrome,
        ); // toe talons
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.04 * s, 0.04 * s, 0.06 * s, 0.01 * s),
          0,
          -b.ankle + 0.03 * s,
          0.05 * s,
        ),
        frame,
      ); // heel spur
    }
    R.socket("muzzle", "chest", 0.17 * s, b.shY + 0.1 * s, -0.24 * s);
    R.socket("eyes", "head", 0, 0.05 * hs, -0.15 * hs);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      gore: "oil",
      bodyThick: 0.14 * s,
      dirt: [0.1, 0.35],
      cut: {
        head: "head",
        leftArm: "forearmL",
        rightArm: "forearmR",
        leftLeg: "shinL",
        rightLeg: "shinR",
      },
    });
    return tpl;
  }
  L.infos.striker = {
    kind: "biped",
    height: 1.85,
    radius: 0.36,
    gore: "oil",
    isRobot: true,
    parts: ALL6,
    labels: {
      head: "Sensor Wedge",
      torso: "Torso",
      leftArm: "Left Blade",
      rightArm: "Right Blade",
      leftLeg: "Left Leg",
      rightLeg: "Right Leg",
    },
    gait: { walkStep: 0.85, runStep: 1.7, walkSpeed: 1.8, runSpeed: 7.0 },
    style: {
      stiff: false,
      claws: true,
      armOut: 0.14,
      armFwd: 0.3,
      elbow: 0.7,
      armSwing: 0.7,
      stride: 1.15,
      hunch: 0.32,
      crouch: 0.12,
      ranged: true,
      lookLimit: 1.4,
    },
    variants: 3,
    build: buildStriker,
  };
})();
