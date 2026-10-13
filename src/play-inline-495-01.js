// play-inline-495 01 — add
// Lines 13-333 of readable/play-inline-495.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;
  const GEO = P.GEO,
    C = P.COMP;
  P.MODELS = P.MODELS || {};
  const M = P.MODELS;
  const R = () => P.RIFLE;
  const raked = (pts, a) => P.raked(pts, a);

  // ------------------------------------------------------------------
  // Recoilless round & missile (used by the launchers, ammo pickups and projectiles)
  // ------------------------------------------------------------------
  /** Recoilless round: pointed HE nose, olive body with a yellow band, perforated brass case. Nose along -Z. */
  P.buildRecoillessRound = function (b, pos, s) {
    s = s || 1;
    const p = pos || [0, 0, 0];
    b.add(
      GEO.lathe(
        [
          [0.0, -0.17],
          [0.012, -0.16],
          [0.03, -0.12],
          [0.042, -0.07],
          [0.044, -0.03],
          [0.044, 0.0],
          [0.0, 0.0],
        ].map((q) => [q[0] * s, q[1] * s]),
        20,
      ),
      "olive",
      { p },
    );
    b.add(GEO.torus(0.0442 * s, 0.003 * s, 6, 22), "yellow", {
      p: [p[0], p[1], p[2] - 0.05 * s],
    });
    b.cyl("brass", 0.008 * s, 0.02 * s, [p[0], p[1], p[2] - 0.175 * s], {
      seg: 10,
    }); // point fuze
    b.tube(
      "brass",
      0.045 * s,
      0.04 * s,
      0.2 * s,
      [p[0], p[1], p[2] + 0.1 * s],
      { seg: 20 },
    ); // perforated case
    for (let i = 0; i < 5; i++)
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + i * 0.4;
        b.add(GEO.cylY(0.005 * s, 0.004 * s, 6), "darksteel", {
          p: [
            p[0] + Math.cos(a) * 0.045 * s,
            p[1] + Math.sin(a) * 0.045 * s,
            p[2] + (0.03 + i * 0.035) * s,
          ],
          r: [0, 0, a - Math.PI / 2],
          tint: 0.3,
        });
      }
    b.cyl("brass", 0.047 * s, 0.008 * s, [p[0], p[1], p[2] + 0.2 * s], {
      seg: 20,
    }); // base rim
  };
  /** Missile: slim body, conical nose, 4 tail fins. Nose along -Z. */
  P.buildMissile = function (b, pos, s) {
    s = s || 1;
    const p = pos || [0, 0, 0];
    b.cyl("olive", 0.035 * s, 0.34 * s, [p[0], p[1], p[2]], { seg: 16 });
    b.add(
      GEO.lathe(
        [
          [0.035 * s, 0.0],
          [0.03 * s, 0.05 * s],
          [0.015 * s, 0.1 * s],
          [0.0, 0.12 * s],
        ],
        16,
      ),
      "red",
      { p: [p[0], p[1], p[2] - 0.17 * s] },
    );
    b.add(GEO.torus(0.035 * s, 0.003 * s, 4, 16), "yellow", {
      p: [p[0], p[1], p[2] - 0.12 * s],
    });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      b.profile(
        "darksteel",
        [
          [0, 0],
          [0.08 * s, 0.0],
          [0.06 * s, 0.045 * s],
          [0.0, 0.045 * s],
        ],
        0.003,
        {
          bevel: 0.0008,
          r: [0, 0, a],
          p: [
            p[0] + Math.cos(a) * 0.03 * s,
            p[1] + Math.sin(a) * 0.03 * s,
            p[2] + 0.17 * s,
          ],
        },
      );
    }
    b.tube(
      "darksteel",
      0.025 * s,
      0.018 * s,
      0.03 * s,
      [p[0], p[1], p[2] + 0.18 * s],
      { seg: 14 },
    );
  };

  // ------------------------------------------------------------------
  // MINIGUN: rear pistol grip + trigger, motor housing with a domed, bolted
  // rear cap, top carry handle, side motor pod, six barrels on a rotating
  // cluster held by three clamps, front grip, olive paint, 5mm feed chute
  // with brass links + ammo box.
  // ------------------------------------------------------------------
  M.minigun = function () {
    const root = new THREE.Group();
    root.name = "minigun";
    const b = P.builder();
    const by = 0.07; // barrel/housing axis height above the grip
    const body = "olive",
      trim = "darksteel";
    // rear pistol grip + trigger housing
    R().pistolGrip(b, "rubber", 0.2, { top: 0.04, w: 0.034 });
    b.box(trim, 0.04, 0.03, 0.09, [0, 0.03, -0.02], { bevel: 0.005 });
    R().triggerGuard(b, trim, 0.012, 0.062, 0.025, 0.026);
    // motor housing: rounded drum, flat belly, domed rear cap ringed with bolts
    b.add(
      GEO.lathe(
        [
          [0.0, -0.13],
          [0.03, -0.128],
          [0.05, -0.118],
          [0.062, -0.1],
          [0.066, -0.075],
          [0.066, 0.13],
          [0.06, 0.15],
          [0.042, 0.16],
        ],
        26,
      ),
      body,
      { p: [0, by, -0.02] },
    );
    b.box(body, 0.1, 0.05, 0.24, [0, by - 0.045, -0.06], { bevel: 0.012 });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      b.add(GEO.cyl(0.0042, 0.006, 8), "steel", {
        p: [Math.cos(a) * 0.052, by + Math.sin(a) * 0.052, 0.106],
      });
    }
    b.add(GEO.cyl(0.018, 0.012, 16), trim, { p: [0, by, 0.112] }); // rear bearing cap
    // housing bands / cooling ribs
    for (const z of [0.05, -0.05, -0.12])
      b.add(GEO.torus(0.0665, 0.0035, 5, 28), trim, { p: [0, by, z] });
    b.box("yellow", 0.0008, 0.02, 0.06, [0.0665, by - 0.01, -0.06], {
      bevel: 0,
    }); // stencil band
    b.box("white", 0.0008, 0.008, 0.04, [0.0665, by + 0.018, -0.06], {
      bevel: 0,
    });
    // side motor pod (right) with a vented end
    b.cyl(trim, 0.028, 0.15, [0.075, by - 0.03, -0.05], { seg: 16 });
    b.add(GEO.torus(0.028, 0.004, 5, 16), "steel", {
      p: [0.075, by - 0.03, 0.025],
    });
    for (let i = 0; i < 4; i++)
      b.box(
        "darksteel",
        0.034,
        0.003,
        0.004,
        [0.075, by - 0.042 + i * 0.008, 0.026],
        { bevel: 0 },
      );
    // top carry handle (tube loop on two posts)
    b.add(
      GEO.hose(
        [
          [0, by + 0.064, 0.03],
          [0, by + 0.125, 0.0],
          [0, by + 0.13, -0.1],
          [0, by + 0.064, -0.14],
        ],
        0.009,
        24,
        8,
      ),
      "darksteel",
    );
    b.cyl("rubber", 0.0125, 0.08, [0, by + 0.13, -0.05], { seg: 12 });
    // barrel support: rear spindle collar + two static clamps
    b.cyl(trim, 0.032, 0.05, [0, by, -0.175], { seg: 18 });
    b.add(GEO.torus(0.047, 0.009, 6, 24), trim, { p: [0, by, -0.38] });
    b.add(GEO.torus(0.049, 0.011, 6, 24), trim, { p: [0, by, -0.56] });
    // front vertical control grip (left hand) on a clamp under the barrels
    b.box(trim, 0.03, 0.03, 0.06, [0, by - 0.06, -0.3], { bevel: 0.005 });
    b.profile(
      "rubber",
      raked(
        [
          [-0.016, -0.085],
          [0.016, -0.085],
          [0.017, 0.0],
          [-0.017, 0.0],
        ],
        0.12,
      ).map((q) => [q[0] + 0.3, q[1] + by - 0.07]),
      0.03,
      { bevel: 0.004 },
    );
    b.box("red", 0.012, 0.008, 0.01, [0, by - 0.074, -0.318], { bevel: 0.002 }); // spin-up button
    // 5mm feed chute curving down-left out of view, brass links showing
    b.add(
      GEO.hose(
        [
          [-0.065, by - 0.03, -0.06],
          [-0.12, by - 0.1, -0.02],
          [-0.14, by - 0.3, 0.05],
          [-0.1, by - 0.5, 0.1],
        ],
        0.022,
        20,
        8,
      ),
      "darksteel",
    );
    for (let i = 0; i < 10; i++)
      b.box(
        "brass",
        0.016,
        0.02,
        0.006,
        [-0.075 - i * 0.008, by - 0.03 - i * 0.03, -0.06 + i * 0.005],
        { bevel: 0.001, r: [0, 0, 0.6] },
      );
    root.add(b.build());

    // rotating barrel cluster (part) — spins about its own axis
    const barrels = new THREE.Group();
    barrels.name = "barrels";
    barrels.position.set(0, by, 0);
    root.add(barrels);
    const bb2 = P.builder();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2,
        x = Math.cos(a) * 0.033,
        y = Math.sin(a) * 0.033;
      bb2.tube("gunmetal", 0.0095, 0.0055, 0.4, [x, y, -0.4], { seg: 10 });
      bb2.tube("darksteel", 0.011, 0.0055, 0.016, [x, y, -0.6], { seg: 10 });
    }
    bb2.cyl("darksteel", 0.02, 0.4, [0, 0, -0.4], { seg: 10 }); // centre spindle
    // rotating clamp plates (visibly turn with the cluster)
    bb2.add(GEO.cyl(0.045, 0.012, 6), "darksteel", { p: [0, 0, -0.22] });
    bb2.add(GEO.cyl(0.043, 0.01, 6), "darksteel", { p: [0, 0, -0.47] });
    barrels.add(bb2.build());
    barrels.userData.rest = {
      p: barrels.position.clone(),
      q: barrels.quaternion.clone(),
    };

    // the "magazine" for reload visuals: the ammo box
    const ab = P.builder();
    ab.box("olive", 0.07, 0.1, 0.12, [0, 0, 0], { bevel: 0.006 });
    ab.box("darksteel", 0.072, 0.012, 0.122, [0, 0.045, 0], { bevel: 0.003 });
    ab.box("yellow", 0.0008, 0.03, 0.06, [0.0356, -0.01, 0], { bevel: 0 });
    const mag = P.part(root, ab, null, "mag");
    mag.position.set(-0.085, by - 0.09, -0.07);
    mag.userData.rest = null;
    const trigger = R().triggerPart(root, [0, 0.03, -0.03]);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.62]),
      eject: P.socket(root, "eject", [0.07, by - 0.05, -0.12]),
      sight: P.socket(root, "sight", [0, by + 0.16, -0.05]),
      rightHand: R().rightOnGrip(root, 0.2),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [-0.001, by - 0.115, -0.305],
        [0, 0.99, -0.12],
        [-0.85, 0, 0.45],
      ),
      magGrip: R().leftUnder(mag, "magGrip", [-0.01, -0.06, 0.0], 1.0),
    };
    return {
      root,
      parts: { barrels, mag, trigger },
      sockets,
      cfg: {
        hip: { p: [0.14, -0.2, -0.3], r: [0.04, 0.06, 0.02] },
        adsDist: 0.3,
        rightPose: "trigger",
        leftPose: "grip",
        spinBarrels: true,
        reload: {
          type: "mag",
          grip: "magGrip",
          axis: [-0.3, -1, 0],
          out: 0.05,
          away: [-0.1, -0.3, 0.1],
          tilt: { p: [0.0, -0.02, 0.03], r: [0.05, -0.2, -0.3] },
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: { p: [-0.04, -0.06, 0.04], r: [-0.25, 0.5, 0.3] },
        lower: { p: [0.06, -0.35, 0.1], r: [-0.7, 0.3, 0.2] },
      },
    };
  };

  // ------------------------------------------------------------------
  // MISSILE LAUNCHER — shoulder tube
  // ------------------------------------------------------------------
