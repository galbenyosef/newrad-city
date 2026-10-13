/* src/weapons/34_models_gyrojet.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: models — gyrojets & flamer
 *   gyrojet_pistol (slab-sided 1965 rocket pistol: a vented smoothbore barrel,
 *     a hammer that strikes forward, grip magazine; 'gemini' skin = white
 *     enamel, chrome barrel, red stripe, brass name plate; 'gold' skin = gold-
 *     plated trim and barrel for presentation pieces),
 *   gyrojet_carbine (long vented barrel in a perforated jacket, walnut stock,
 *     box magazine; 'ticker' skin = The Ticker-Tape: brass furniture,
 *     red-white-blue stock bands and paper streamers tied to the muzzle band),
 *   flamer (fuel canister, pilot light; "liberty" skin = copper-patina torch)
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
  M.gyrojet_carbine = function (skin) {
    const root = new THREE.Group();
    root.name = "gyrojet_carbine";
    const tick = skin === "ticker";
    const metal = "blued",
      trim = tick ? "brass" : "darksteel",
      wood = "wood";
    const b = P.builder();
    const A = 0.32,
      by = 0.074,
      rp = P.roundPts;
    R().pistolGrip(b, tick ? "gripWood" : "gripWood", A, {
      top: 0.04,
      w: 0.028,
    });
    // receiver: long rounded slab
    b.profile(
      metal,
      rp(
        [
          [-0.07, 0.036],
          [0.2, 0.036],
          [0.21, 0.046],
          [0.21, 0.098],
          [0.19, 0.106],
          [-0.05, 0.106],
          [-0.07, 0.094],
        ],
        [0.005, 0.005, 0.006, 0.01, 0.01, 0.01, 0.008],
        3,
      ),
      0.03,
      { bevel: 0.004, bseg: 2, wear: 0.7 },
    );
    for (const sd of [-1, 1]) {
      b.box(trim, 0.0008, 0.008, 0.2, [sd * 0.0152, 0.084, -0.06], {
        bevel: 0,
      }); // trim line
      b.rivets(
        "steel",
        [
          [0, 0.05, 0.03],
          [0, 0.05, -0.15],
          [0, 0.092, -0.17],
        ],
        0.0018,
        sd * 0.0154,
      );
    }
    // loading-port cover on top (the box magazine is topped up through it in the field)
    b.box(trim, 0.012, 0.004, 0.08, [0, 0.109, -0.08], { bevel: 0.001 });
    R().triggerGuard(b, metal, 0.012, 0.064, 0.036, 0.026);
    // rear peep sight
    b.box("darksteel", 0.018, 0.012, 0.012, [0, 0.112, 0.03], {
      bevel: 0.0015,
    });
    b.add(GEO.torus(0.0056, 0.0018, 6, 16), "darksteel", {
      p: [0, 0.124, 0.03],
    });
    // barrel inside a perforated jacket
    const z0 = -0.21,
      z1 = -0.56,
      jr = 0.0175;
    b.tube("gunmetal", 0.0098, 0.006, z0 - z1, [0, by, (z0 + z1) / 2], {
      seg: 14,
    });
    b.tube(metal, jr, jr * 0.86, 0.3, [0, by, z0 - 0.15], {
      seg: 20,
      wear: 0.6,
    });
    vents(b, jr, by, z0 - 0.01, z0 - 0.29, 14, [0.9, 0.0, -0.9]);
    for (const z of [z0 - 0.002, z0 - 0.3])
      b.add(GEO.torus(jr * 1.02, 0.0024, 6, 20), trim, { p: [0, by, z] });
    b.tube(trim, 0.0125, 0.006, 0.012, [0, by, z1 + 0.006], { seg: 16 }); // muzzle crown
    b.box("darksteel", 0.003, 0.022, 0.006, [0, by + 0.019, z1 + 0.02], {
      bevel: 0.0008,
    }); // front post
    b.add(GEO.torus(0.0095, 0.0016, 5, 16, PI), "darksteel", {
      p: [0, by + 0.022, z1 + 0.02],
    });
    // walnut forend under the jacket (left hand)
    b.profile(
      wood,
      rp(
        [
          [0.21, 0.04],
          [0.42, 0.048],
          [0.43, 0.056],
          [0.42, 0.066],
          [0.21, 0.066],
        ],
        [0, 0.004, 0.004, 0.004, 0],
        2,
      ),
      0.032,
      { bevel: 0.004 },
    );
    // stock: walnut with a cheek line and a rubber pad
    b.profile(
      wood,
      rp(
        [
          [-0.07, 0.098],
          [-0.07, 0.036],
          [-0.12, 0.02],
          [-0.31, 0.004],
          [-0.33, 0.004],
          [-0.33, 0.104],
          [-0.3, 0.11],
          [-0.12, 0.1],
        ],
        [0, 0.004, 0.01, 0.006, 0, 0, 0.006, 0.01],
        3,
      ),
      0.038,
      { bevel: 0.006 },
    );
    b.profile(
      "rubber",
      [
        [-0.33, 0.006],
        [-0.345, 0.006],
        [-0.345, 0.104],
        [-0.33, 0.104],
      ],
      0.04,
      { bevel: 0.004 },
    );
    R().swivel(b, 0, 0.004, 0.27);
    if (tick) {
      // parade bands round the stock and a brass butt plate
      const bands = [
        ["red", 0.16],
        ["white", 0.19],
        ["enamelBlue", 0.22],
      ];
      for (const [mt, z] of bands)
        b.box(mt, 0.0396, 0.11, 0.012, [0, 0.056, z], { bevel: 0.001 });
      b.profile(
        "brass",
        [
          [-0.344, 0.004],
          [-0.348, 0.004],
          [-0.348, 0.106],
          [-0.344, 0.106],
        ],
        0.041,
        { bevel: 0.0015 },
      );
    }
    root.add(b.build());
    // streamers (Ticker-Tape): paper strips tied to the muzzle band, flutter in onFrame
    let streamers = null;
    if (tick) {
      streamers = new THREE.Group();
      streamers.name = "streamers";
      streamers.position.set(0, by - 0.016, z0 - 0.3);
      root.add(streamers);
      const cols = ["white", "red", "white", "enamelBlue", "white"];
      cols.forEach((mt, i) => {
        const sb = P.builder();
        sb.box(
          mt,
          0.0006,
          0.06 + (i % 3) * 0.015,
          0.008,
          [0, -0.03 - (i % 3) * 0.007, 0],
          { bevel: 0 },
        );
        const g = sb.build();
        g.position.set((i - 2) * 0.006, 0, (i % 2) * 0.004);
        g.userData.ph = i * 1.3;
        streamers.add(g);
      });
    }
    const trigger = R().triggerPart(
      root,
      [0, 0.03, -0.036],
      tick ? "brass" : "steel",
    );
    const mb = C.boxMag("darksteel", 0.022, 0.1, 0.04, 0.0, {
      plate: tick ? "brass" : "steel",
      round: "steel",
    });
    const mag = P.part(root, mb, null, "mag");
    mag.children[0].position.set(0, 0.04, -0.066);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, z1 - 0.002]),
      sight: P.socket(root, "sight", [0, 0.124, 0.03]),
      rightHand: R().rightOnGrip(root, A),
      leftHand: R().leftUnder(root, "leftHand", [0, by - 0.028, -0.3], -0.35),
      magGrip: R().leftUnder(mag, "magGrip", [0, -0.08, -0.08], 1.2),
    };
    return {
      root,
      parts: streamers ? { trigger, mag, streamers } : { trigger, mag },
      sockets,
      cfg: {
        hip: { p: [0.11, -0.13, -0.25], r: [0.02, 0.05, 0] },
        adsDist: 0.16,
        rightPose: "trigger",
        leftPose: "support",
        reload: {
          type: "mag",
          axis: [0, -1, 0],
          out: 0.07,
          away: [-0.03, -0.35, 0.05],
          tilt: { p: [-0.02, -0.02, 0.03], r: [0.12, 0.25, 0.55] },
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
        onFrame: tick
          ? (m, dt, V) => {
              const t = V.time,
                gust = V.shotT < 0.3 ? 1 - V.shotT / 0.3 : 0;
              for (const s of m.parts.streamers.children)
                s.rotation.x =
                  0.25 + Math.sin(t * 5 + s.userData.ph) * 0.18 + gust * 0.9;
            }
          : undefined,
      },
    };
  };

  // ------------------------------------------------------------------
  // FLAMER — fuel canister, pilot light, twin grips.
  // skin 'liberty' = Lady Liberty's Torch (verdigris copper, gilded flame crown)
  // ------------------------------------------------------------------
  M.flamer = function (skin) {
    const root = new THREE.Group();
    root.name = "flamer";
    const lib = skin === "liberty";
    const body = lib ? "copper" : "olive";
    const trim = lib ? "gold" : "darksteel";
    const b = P.builder();
    const A = 0.3,
      by = 0.085;
    R().pistolGrip(b, "rubber", A, { top: 0.04, w: 0.03 });
    // main body tube + valve block
    b.cyl(body, 0.03, 0.34, [0, by, -0.12], {
      seg: 18,
      tint: lib ? [0.45, 0.75, 0.6] : 1,
    });
    b.box(trim, 0.05, 0.05, 0.08, [0, by - 0.005, 0.03], { bevel: 0.006 });
    b.add(GEO.cylX(0.016, 0.07, 14), "red", { p: [0, by + 0.035, 0.03] }); // valve wheel hub
    b.add(GEO.torus(0.022, 0.004, 5, 16), "red", {
      p: [0.036, by + 0.035, 0.03],
      r: [0, Math.PI / 2, 0],
    });
    // fuel canister under the body (the "magazine")
    // nozzle: heat shield with slots + flared tip
    b.add(
      GEO.lathe(
        [
          [0.03, 0.0],
          [0.036, 0.01],
          [0.036, 0.12],
          [0.03, 0.13],
        ],
        18,
      ),
      trim,
      { p: [0, by, -0.29] },
    );
    for (let i = 0; i < 6; i++)
      b.box("darksteel", 0.074, 0.006, 0.008, [0, by, -0.305 - i * 0.017], {
        bevel: 0.001,
      });
    if (lib) {
      // torch crown: gilded flame petals around the tip
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        b.profile(
          "gold",
          [
            [0, 0],
            [0.03, 0.006],
            [0.05, 0.0],
            [0.03, -0.004],
          ],
          0.004,
          {
            bevel: 0.001,
            r: [0, 0, a],
            p: [Math.cos(a) * 0.03, by + Math.sin(a) * 0.03, -0.43],
          },
        );
      }
      b.add(GEO.torus(0.034, 0.005, 6, 20), "gold", { p: [0, by, -0.42] });
    } else {
      b.add(
        GEO.lathe(
          [
            [0.012, 0.0],
            [0.02, 0.02],
            [0.026, 0.04],
          ],
          16,
        ),
        "darksteel",
        { p: [0, by, -0.42] },
      );
    }
    // pilot light arm under the nozzle
    b.cyl("steel", 0.004, 0.14, [0, by - 0.036, -0.35], { seg: 8 });
    b.cyl("darksteel", 0.007, 0.016, [0, by - 0.036, -0.425], { seg: 10 });
    // front handle (vertical)
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
      ).map((p) => [p[0] + 0.2, p[1] + by - 0.025]),
      0.028,
      { bevel: 0.004 },
    );
    // hoses from the canister to the valve
    b.add(
      GEO.hose(
        [
          [0.02, by - 0.02, 0.05],
          [0.04, by - 0.06, 0.02],
          [0.03, by - 0.08, -0.06],
        ],
        0.006,
        14,
        6,
      ),
      "rubber",
    );
    // shoulder rest
    b.box(trim, 0.04, 0.06, 0.16, [0, by - 0.005, 0.15], { bevel: 0.008 });
    b.box("rubber", 0.045, 0.07, 0.02, [0, by - 0.005, 0.235], {
      bevel: 0.006,
    });
    // warning plate
    b.box(lib ? "white" : "yellow", 0.0008, 0.02, 0.05, [0.0302, by, -0.08], {
      bevel: 0,
    });
    root.add(b.build());
    // fuel tank (part)
    const tb = P.builder();
    tb.cyl(lib ? "copper" : "red", 0.03, 0.18, [0, 0, 0], {
      seg: 18,
      tint: lib ? [0.45, 0.75, 0.6] : 1,
    });
    tb.add(
      GEO.lathe(
        [
          [0.03, 0.09],
          [0.022, 0.105],
          [0.008, 0.11],
        ],
        16,
      ),
      lib ? "gold" : "red",
      {},
    );
    tb.add(
      GEO.lathe(
        [
          [0.008, -0.11],
          [0.022, -0.105],
          [0.03, -0.09],
        ],
        16,
      ),
      lib ? "gold" : "red",
      {},
    );
    for (const z of [-0.05, 0.05])
      tb.add(GEO.torus(0.031, 0.003, 4, 18), "darksteel", { p: [0, 0, z] });
    tb.box("white", 0.0008, 0.03, 0.06, [0.0305, 0, 0], { bevel: 0 });
    const tank = P.part(root, tb, null, "tank");
    tank.position.set(-0.032, by - 0.055, -0.13);
    tank.userData.rest = null;
    // pilot flame (flickering additive blob)
    const pilot = new THREE.Group();
    pilot.position.set(0, by - 0.036, -0.436);
    root.add(pilot);
    const pb = P.builder();
    pb.sphere("glowAmber", 0.006, [0, 0, 0], { ws: 8, hs: 6 });
    pb.add(GEO.cyl(0.0045, 0.016, 8, 0.0005), "glowWhite", {
      p: [0, 0.0, -0.008],
      r: [-0.6, 0, 0],
    });
    pilot.add(pb.build());
    const trigger = R().triggerPart(root, [0, 0.035, -0.036]);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.45]),
      sight: P.socket(root, "sight", [0, by + 0.05, 0.03]),
      rightHand: R().rightOnGrip(root, A),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [-0.001, by - 0.06, -0.2],
        [0, 0.99, -0.1],
        [-0.85, 0, 0.45],
      ),
      magGrip: R().leftUnder(tank, "magGrip", [-0.02, -0.03, 0.0], 1.4),
    };
    return {
      root,
      parts: { tank, trigger, pilot },
      sockets,
      cfg: {
        hip: { p: [0.12, -0.15, -0.28], r: [0.02, 0.05, 0] },
        adsDist: 0.3,
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "cell",
          part: "tank",
          grip: "magGrip",
          axis: [-0.3, -1, 0],
          out: 0.06,
          away: [-0.06, -0.3, 0.06],
          speed: 1,
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: RIFLE_SPRINT,
        lower: RIFLE_LOWER,
        idleGlow: { color: 0xffa040, i: 0.12, at: "muzzle" },
        onFrame(m, dt, V) {
          const t = V.time;
          const s = 0.9 + Math.sin(t * 37) * 0.15 + Math.sin(t * 61) * 0.1;
          m.parts.pilot.scale.set(s, s, s * 1.2);
          m.parts.pilot.visible = !(P.state.cur && P.state.cur.mag <= 0);
        },
      },
    };
  };
})();
