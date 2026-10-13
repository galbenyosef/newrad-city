// play-inline-494 01 — the
// Lines 14-297 of readable/play-inline-494.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;
  const GEO = P.GEO,
    C = P.COMP;
  P.MODELS = P.MODELS || {};
  const M = P.MODELS;
  const PI = Math.PI;
  const R = () => P.RIFLE;
  const raked = (pts, a) => P.raked(pts, a);
  const RIFLE_SPRINT = { p: [-0.06, -0.04, 0.02], r: [-0.3, 0.8, 0.45] };
  const RIFLE_LOWER = { p: [0.06, -0.3, 0.1], r: [-0.9, 0.4, 0.3] };

  /** Two rows of exhaust vents along a barrel (dark through-holes), z from z0 to z1 (front, more negative). */
  function vents(b, r, y, z0, z1, n, rows) {
    for (let i = 0; i < n; i++) {
      const z = z0 + ((z1 - z0) * (i + 0.5)) / n;
      for (const a of rows || [0.35, -0.35])
        b.add(GEO.cylX(r * 0.22, r * 2.06, 8), "darksteel", {
          p: [0, y + Math.sin(a) * r * 0.2, z],
          r: [0, 0, a],
          tint: 0.25,
        });
    }
  }
  /** A gyrojet round seen from the side: steel micro-rocket with a domed nose (for the magazine lips). */
  function rocketNose(b, p, mat) {
    b.add(
      GEO.lathe(
        [
          [0.0, -0.006],
          [0.0052, -0.004],
          [0.0062, 0.0],
          [0.0062, 0.012],
          [0.0, 0.012],
        ],
        10,
      ),
      mat || "steel",
      { p },
    );
  }

  // ------------------------------------------------------------------
  // GYROJET PISTOL — a slab-sided frame, a long low receiver, a vented
  // smoothbore barrel, the hammer lever that strikes FORWARD (the rocket is
  // pushed back onto a fixed firing pin), grip magazine.
  // ------------------------------------------------------------------
  M.gyrojet_pistol = function (skin) {
    const root = new THREE.Group();
    root.name = "gyrojet_pistol";
    const gem = skin === "gemini",
      gold = skin === "gold";
    const frame = gem ? "white" : "blued",
      trim = gem ? "chrome" : gold ? "gold" : "darksteel",
      bar = gem ? "chrome" : gold ? "gold" : "gunmetal";
    const b = P.builder();
    const A = 0.3,
      by = 0.072,
      rp = P.roundPts;
    // ---- grip: frame + panels (walnut, or grey moulded panels on the presentation piece)
    b.profile(
      frame,
      raked(
        rp(
          [
            [-0.025, -0.066],
            [0.019, -0.066],
            [0.022, -0.052],
            [0.02, 0.042],
            [-0.027, 0.046],
            [-0.031, 0.0],
          ],
          [0.006, 0.005, 0.004, 0.004, 0.008, 0.01],
          3,
        ),
        A,
      ),
      0.028,
      { bevel: 0.003, bseg: 2, wear: 0.8 },
    );
    b.profile(
      gem ? "gripGrey" : "gripWood",
      raked(
        rp(
          [
            [-0.02, -0.058],
            [0.014, -0.058],
            [0.016, 0.032],
            [-0.023, 0.036],
          ],
          0.005,
          2,
        ),
        A,
      ),
      0.0318,
      { bevel: 0.0012 },
    );
    for (const sd of [-1, 1]) {
      const q = raked([[-0.003, -0.012]], A)[0];
      b.add(GEO.cylX(0.0032, 0.0012, 10), trim, {
        p: [sd * 0.0162, q[1], -q[0]],
      });
    } // grip screws
    // ---- receiver: long, low, rounded on top; rear at z=+0.046, front shoulder at z=-0.104
    const body = rp(
      [
        [-0.046, 0.042],
        [0.1, 0.042],
        [0.104, 0.05],
        [0.104, 0.09],
        [0.09, 0.099],
        [-0.03, 0.099],
        [-0.047, 0.088],
      ],
      [0.004, 0.004, 0.006, 0.008, 0.008, 0.008, 0.006],
      3,
    );
    b.profile(frame, body, 0.025, { bevel: 0.004, bseg: 2, wear: 0.8 });
    // loading-port cover along the top-left with a knurled thumb tab (opens for the magazine top-up)
    b.box(trim, 0.004, 0.012, 0.07, [-0.0128, 0.088, -0.02], { bevel: 0.001 });
    for (let i = 0; i < 4; i++)
      b.box(trim, 0.006, 0.003, 0.002, [-0.0145, 0.094, 0.008 + i * 0.004], {
        bevel: 0,
      });
    // side stamping plate (and on the Gemini: a red stripe + brass name plate)
    if (gem) {
      for (const sd of [-1, 1])
        b.box("red", 0.0008, 0.006, 0.13, [sd * 0.0127, 0.06, -0.028], {
          bevel: 0,
        });
      b.box("gold", 0.0012, 0.012, 0.036, [0.0128, 0.078, -0.04], {
        bevel: 0.0004,
      });
    } else
      b.box("darksteel", 0.0008, 0.01, 0.034, [0.0127, 0.078, -0.04], {
        bevel: 0,
        tint: 0.8,
      });
    // top rib with the rear notch sight
    b.box(trim, 0.008, 0.004, 0.12, [0, 0.101, -0.03], { bevel: 0.001 });
    for (const sx of [-0.0042, 0.0042])
      b.box(trim, 0.004, 0.008, 0.006, [sx, 0.106, 0.03], { bevel: 0.0008 });
    R().triggerGuard(b, frame, 0.012, 0.064, 0.047, 0.027);
    // ---- barrel: thin smoothbore tube out of the receiver's nose, vented along both flanks
    const z0 = -0.104,
      z1 = -0.215,
      br = 0.0102;
    b.tube(bar, br, br * 0.62, z0 - z1, [0, by, (z0 + z1) / 2], {
      seg: 18,
      wear: 0.6,
    });
    vents(b, br, by, z0 - 0.008, z1 + 0.012, 8);
    b.add(GEO.torus(br * 1.04, 0.0018, 6, 18), trim, {
      p: [0, by, z0 - 0.004],
    });
    b.tube(trim, br * 1.15, br * 0.62, 0.008, [0, by, z1 + 0.004], { seg: 18 }); // muzzle crown
    b.box(trim, 0.0028, 0.012, 0.006, [0, by + br + 0.005, z1 + 0.012], {
      bevel: 0.0006,
    }); // front sight blade
    // the barrel's support web down to the frame (gives the gun its long, low "rocket" profile)
    b.profile(
      frame,
      [
        [0.104, 0.05],
        [0.16, 0.058],
        [0.16, 0.066],
        [0.104, 0.066],
      ],
      0.012,
      { bevel: 0.0015 },
    );
    root.add(b.build());
    // ---- hammer lever (part) ahead of the trigger guard: swings forward on the shot
    const hb = P.builder();
    hb.profile(
      trim,
      [
        [0.0, 0.0],
        [0.004, -0.002],
        [0.016, -0.018],
        [0.012, -0.022],
        [-0.002, -0.006],
      ],
      0.007,
      { bevel: 0.001 },
    );
    hb.add(GEO.cylX(0.0035, 0.009, 10), trim, { p: [0, 0, 0] });
    const hammer = P.part(root, hb, [0, 0.05, -0.084], "hammer");
    hammer.children[0].position.set(0, 0, 0);
    // ---- trigger (part)
    const trigger = R().triggerPart(
      root,
      [0, 0.043, -0.036],
      gem ? "chrome" : "steel",
    );
    // ---- magazine (part) in the grip, rocket noses showing at the lips
    const mb = P.builder();
    mb.profile(
      "darksteel",
      raked(
        [
          [-0.017, -0.064],
          [0.013, -0.064],
          [0.014, 0.04],
          [-0.016, 0.04],
        ],
        A,
      ),
      0.019,
      { bevel: 0.001 },
    );
    mb.profile(
      trim,
      raked(
        [
          [-0.021, -0.071],
          [0.017, -0.071],
          [0.017, -0.063],
          [-0.021, -0.063],
        ],
        A,
      ),
      0.029,
      { bevel: 0.002 },
    );
    {
      const q = raked([[-0.002, 0.04]], A)[0];
      rocketNose(mb, [0, q[1] + 0.002, -q[0] - 0.006], "brushed");
    }
    const mag = P.part(root, mb, null, "mag");
    const d = P.gripAxis(A);
    const mq = raked([[0, -0.07]], A)[0];
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, z1 - 0.002]),
      sight: P.socket(root, "sight", [0, 0.11, 0.03]),
      rightHand: R().rightOnGrip(root, A),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [-0.016, -0.018, -0.01],
        [0, -d[1], -d[2]],
        [-0.82, -0.1, -0.5],
      ),
      magGrip: P.handSocket(
        mag,
        "magGrip",
        [-0.004, mq[1] - 0.012, -mq[0] + 0.006],
        [0, 0, -1],
        [-0.9, -0.4, 0],
      ),
    };
    return {
      root,
      parts: { hammer, trigger, mag },
      sockets,
      cfg: {
        hip: { p: [0.13, -0.145, -0.37], r: [0.02, 0.28, -0.05] },
        adsDist: 0.42,
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "mag",
          axis: d,
          out: 0.075,
          away: [-0.05, -0.34, 0.1],
          tilt: { p: [-0.03, -0.01, 0.02], r: [0.2, 0.18, 0.55] },
        },
        shot: [
          { part: "hammer", r: [0.9, 0, 0], dur: 0.09 },
          { part: "trigger", r: [-0.3, 0, 0], held: true },
        ],
        sprint: { p: [-0.03, -0.05, 0.04], r: [-0.45, 0.6, 0.45] },
      },
    };
  };

  // ------------------------------------------------------------------
  // GYROJET CARBINE — slim receiver, a long smoothbore barrel inside a
  // perforated cooling jacket, walnut forend & stock, ten-round box magazine.
  // skin 'ticker' = The Ticker-Tape (brass furniture, parade bands, streamers).
  // ------------------------------------------------------------------
