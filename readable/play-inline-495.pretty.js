/* src/weapons/36_models_heavy.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: models — big guns & ammo pickups
 *   minigun (six rotating barrels, motor housing, top handle, belt feed),
 *   belt_fed_mg (general-purpose machine gun: feed cover, carry handle,
 *     folded bipod, hundred-round box on the left),
 *   missile_launcher (shoulder tube, side sight, rear exhaust),
 *   recoilless_rifle (90 mm shoulder tube, flared venturi breech, side optic),
 *   recoilless-round & missile meshes,
 *   _ammo(ammoId) pickup models (boxes, cans, canisters, batteries)
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
  M.missile_launcher = function () {
    const root = new THREE.Group();
    root.name = "missile_launcher";
    const b = P.builder();
    const ty = 0.13; // tube axis height above the grip
    // main tube (olive) with bands, front shroud, rear flare
    b.tube("olive", 0.052, 0.044, 0.9, [0, ty, -0.2], { seg: 22 });
    for (const z of [-0.55, -0.2, 0.1])
      b.add(GEO.torus(0.053, 0.005, 5, 24), "darksteel", { p: [0, ty, z] });
    b.add(
      GEO.lathe(
        [
          [0.052, 0.0],
          [0.062, 0.02],
          [0.062, 0.08],
          [0.058, 0.09],
        ],
        22,
      ),
      "darksteel",
      { p: [0, ty, -0.65] },
    );
    b.add(
      GEO.lathe(
        [
          [0.058, -0.06],
          [0.07, -0.01],
          [0.052, 0.0],
        ],
        22,
      ),
      "darksteel",
      { p: [0, ty, 0.3] },
    );
    // pistol grip + front grip under the tube
    R().pistolGrip(b, "rubber", 0.3, { top: 0.07, w: 0.032 });
    b.box("darksteel", 0.03, 0.04, 0.1, [0, 0.07, -0.02], { bevel: 0.005 });
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
      ).map((p) => [p[0] + 0.3, p[1] + 0.08]),
      0.03,
      { bevel: 0.004 },
    );
    R().triggerGuard(b, "darksteel", 0.012, 0.064, 0.05, 0.028);
    // optical sight box on the LEFT with a lens
    b.box("darksteel", 0.03, 0.05, 0.14, [-0.07, ty + 0.03, -0.1], {
      bevel: 0.006,
    });
    b.add(new THREE.CircleGeometry(0.012, 14), "lens", {
      p: [-0.07, ty + 0.04, 0.03],
      r: [0, Math.PI, 0],
    });
    b.add(new THREE.CircleGeometry(0.014, 14), "lens", {
      p: [-0.07, ty + 0.04, -0.171],
    });
    // shoulder pad + stencils
    b.box("rubber", 0.05, 0.03, 0.18, [0, ty - 0.065, 0.2], { bevel: 0.01 });
    b.box("yellow", 0.0008, 0.03, 0.2, [0.0525, ty, -0.3], { bevel: 0 });
    b.box("white", 0.0008, 0.012, 0.12, [0.0525, ty + 0.025, -0.05], {
      bevel: 0,
    });
    root.add(b.build());
    // loaded missile (visible in the tube front) — part used during reload
    const mb = P.builder();
    P.buildMissile(mb, [0, 0, 0], 1.0);
    const round = P.part(root, mb, null, "round");
    round.position.set(0, ty, -0.45);
    round.userData.rest = null;
    const trigger = R().triggerPart(root, [0, 0.05, -0.036]);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, ty, -0.72]),
      sight: P.socket(root, "sight", [0, ty + 0.1, 0.05]),
      rightHand: R().rightOnGrip(root, 0.3),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [-0.001, 0.045, -0.3],
        [0, 0.99, -0.1],
        [-0.85, 0, 0.45],
      ),
      load: R().leftUnder(root, "load", [0, ty - 0.03, 0.34], 1.3),
    };
    return {
      root,
      parts: { round, trigger },
      sockets,
      cfg: {
        hip: { p: [0.12, -0.2, -0.22], r: [0.02, 0.04, 0] },
        adsDist: 0.2,
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "single",
          grip: "load",
          roundPart: "round",
          roundIn: [0, 0, 0.35],
          tRound: 1.6,
          tOpen: 0.5,
          tClose: 0.5,
          tilt: { p: [-0.02, 0.02, 0.0], r: [0.25, -0.2, 0.2] },
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: { p: [-0.04, -0.08, 0.05], r: [-0.3, 0.5, 0.3] },
        lower: { p: [0.06, -0.35, 0.1], r: [-0.7, 0.3, 0.2] },
        onFrame(m) {
          if (!P.action && P.state.cur && P.state.cur.mag <= 0)
            m.parts.round.visible = false;
        },
      },
    };
  };

  // ------------------------------------------------------------------
  // RECOILLESS RIFLE: a 90 mm olive tube carried on the shoulder, a flared
  // venturi breech at the back (where the back-blast goes), a hinged breech
  // ring, an optical sight on the left, pistol grip + front grip, a folded
  // monopod under the front.
  // ------------------------------------------------------------------
  M.recoilless_rifle = function () {
    const root = new THREE.Group();
    root.name = "recoilless_rifle";
    const b = P.builder();
    const ty = 0.12;
    // main tube with reinforcing collars
    b.tube("olive", 0.052, 0.045, 0.98, [0, ty, -0.24], { seg: 22, wear: 0.5 });
    for (const z of [-0.66, -0.4, -0.12, 0.12])
      b.add(GEO.torus(0.0535, 0.0045, 5, 24), "darksteel", { p: [0, ty, z] });
    b.add(
      GEO.lathe(
        [
          [0.052, 0.0],
          [0.058, 0.012],
          [0.058, 0.04],
          [0.054, 0.046],
        ],
        22,
      ),
      "darksteel",
      { p: [0, ty, -0.76] },
    ); // muzzle ring
    // breech: a thicker chamber, the hinged ring and the flared venturi (perforated ring of vents)
    b.cyl("olive", 0.062, 0.16, [0, ty, 0.2], { seg: 22, wear: 0.5 });
    b.add(GEO.torus(0.063, 0.006, 6, 24), "darksteel", { p: [0, ty, 0.28] });
    b.add(
      GEO.lathe(
        [
          [0.05, 0.0],
          [0.056, 0.03],
          [0.074, 0.09],
          [0.08, 0.11],
          [0.076, 0.112],
          [0.066, 0.09],
          [0.048, 0.03],
          [0.044, 0.0],
        ],
        24,
      ),
      "darksteel",
      { p: [0, ty, 0.29] },
    );
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      b.add(GEO.cylY(0.0065, 0.008, 8), "rust", {
        p: [Math.cos(a) * 0.057, ty + Math.sin(a) * 0.057, 0.33],
        r: [Math.PI / 2, 0, a],
        tint: 0.4,
      });
    }
    b.box("steel", 0.022, 0.03, 0.018, [0.07, ty, 0.27], { bevel: 0.004 }); // breech hinge
    b.add(GEO.cylY(0.006, 0.045, 10), "steel", { p: [0.07, ty, 0.27] });
    // shoulder pad under the rear of the tube
    b.box("rubber", 0.05, 0.03, 0.2, [0, ty - 0.07, 0.12], { bevel: 0.01 });
    // grips: rear pistol grip + front grip, with the trigger housing
    R().pistolGrip(b, "rubber", 0.3, { top: 0.07, w: 0.032 });
    b.box("darksteel", 0.03, 0.045, 0.1, [0, 0.07, -0.02], { bevel: 0.005 });
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
      ).map((q) => [q[0] + 0.3, q[1] + 0.07]),
      0.03,
      { bevel: 0.004 },
    );
    R().triggerGuard(b, "darksteel", 0.012, 0.064, 0.05, 0.028);
    // optical sight box on the LEFT with lenses and a rubber eyecup
    b.box("darksteel", 0.03, 0.045, 0.16, [-0.072, ty + 0.03, -0.06], {
      bevel: 0.006,
    });
    b.cyl("rubber", 0.014, 0.03, [-0.072, ty + 0.035, 0.035], { seg: 14 });
    b.add(new THREE.CircleGeometry(0.012, 14), "lens", {
      p: [-0.072, ty + 0.035, 0.051],
      r: [0, Math.PI, 0],
    });
    b.add(new THREE.CircleGeometry(0.013, 14), "lens", {
      p: [-0.072, ty + 0.035, -0.141],
    });
    // folded monopod under the front
    b.cyl("darksteel", 0.006, 0.34, [0, ty - 0.062, -0.46], { seg: 8 });
    b.box("darksteel", 0.03, 0.01, 0.03, [0, ty - 0.062, -0.63], {
      bevel: 0.003,
    });
    // stencils: yellow HE band, white "BACK-BLAST AREA" bar on the breech
    b.box("yellow", 0.0008, 0.03, 0.18, [0.0525, ty, -0.3], { bevel: 0 });
    b.box("white", 0.0008, 0.012, 0.1, [0.0625, ty + 0.02, 0.2], { bevel: 0 });
    root.add(b.build());
    // the loaded round (part): shows in the breech during the reload
    const nb = P.builder();
    P.buildRecoillessRound(nb, [0, 0, 0], 1.0);
    const round = P.part(root, nb, null, "round");
    round.position.set(0, ty, 0.05);
    round.userData.rest = null;
    const trigger = R().triggerPart(root, [0, 0.05, -0.036]);
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, ty, -0.79]),
      sight: P.socket(root, "sight", [0, ty + 0.1, 0.05]),
      rightHand: R().rightOnGrip(root, 0.3),
      leftHand: P.handSocket(
        root,
        "leftHand",
        [-0.001, 0.035, -0.3],
        [0, 0.99, -0.1],
        [-0.85, 0, 0.45],
      ),
      load: R().leftUnder(root, "load", [0, ty - 0.03, 0.42], 1.3),
    };
    return {
      root,
      parts: { round, trigger },
      sockets,
      cfg: {
        hip: { p: [0.12, -0.2, -0.22], r: [0.02, 0.04, 0] },
        adsDist: 0.2,
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "single",
          grip: "load",
          roundPart: "round",
          roundIn: [0, 0, 0.42],
          tRound: 2.0,
          tOpen: 0.7,
          tClose: 0.6,
          roundSfx: "reload",
          tilt: { p: [-0.02, 0.02, 0.0], r: [0.25, -0.2, 0.2] },
        },
        shot: [{ part: "trigger", r: [-0.3, 0, 0], held: true }],
        sprint: { p: [-0.04, -0.08, 0.05], r: [-0.3, 0.5, 0.3] },
        lower: { p: [0.06, -0.35, 0.1], r: [-0.7, 0.3, 0.2] },
        onFrame(m) {
          if (!P.action && P.state.cur && P.state.cur.mag <= 0)
            m.parts.round.visible = false;
        },
      },
    };
  };

  // ------------------------------------------------------------------
  // BELT-FED MACHINE GUN: long stamped receiver with a hinged feed cover, a
  // heavy barrel with a carry handle and a gas tube under it, folded bipod,
  // polymer stock, hundred-round box on the left feeding a brass-linked belt.
  // ------------------------------------------------------------------
  M.belt_fed_mg = function () {
    const root = new THREE.Group();
    root.name = "belt_fed_mg";
    const b = P.builder();
    const A = 0.3,
      by = 0.08;
    R().pistolGrip(b, "plastic", A, { top: 0.04, w: 0.03 });
    // receiver: long box, flat sides, feed tray in the middle
    b.profile(
      "gunmetal",
      [
        [-0.08, 0.034],
        [0.26, 0.034],
        [0.26, 0.11],
        [0.2, 0.116],
        [-0.06, 0.116],
        [-0.08, 0.1],
      ],
      0.044,
      { bevel: 0.003, wear: 0.6 },
    );
    for (const sd of [-1, 1])
      b.rivets(
        "steel",
        [
          [0, 0.046, 0.04],
          [0, 0.046, -0.1],
          [0, 0.046, -0.22],
          [0, 0.104, 0.05],
        ],
        0.0024,
        sd * 0.0222,
      );
    // hinged feed cover on top (the "lid") with its latch
    b.box("darksteel", 0.05, 0.016, 0.16, [0, 0.124, -0.08], { bevel: 0.004 });
    b.add(GEO.cylX(0.006, 0.054, 10), "steel", { p: [0, 0.122, 0.0] });
    b.box("steel", 0.014, 0.01, 0.012, [0, 0.134, -0.16], { bevel: 0.002 });
    // feed tray mouth on the left with the belt entering (brass links)
    b.box("darksteel", 0.012, 0.03, 0.05, [-0.028, 0.096, -0.08], {
      bevel: 0.002,
    });
    for (let i = 0; i < 6; i++)
      b.box(
        "brass",
        0.03,
        0.007,
        0.007,
        [-0.04 - i * 0.012, 0.09 - i * 0.012, -0.08],
        { bevel: 0.001, r: [0, 0, 0.7] },
      );
    R().triggerGuard(b, "gunmetal", 0.012, 0.064, 0.036, 0.026);
    // rear sight leaf on the cover
    b.box("darksteel", 0.018, 0.022, 0.006, [0, 0.142, 0.02], { bevel: 0.001 });
    b.box("darksteel", 0.006, 0.008, 0.007, [0, 0.156, 0.02], {
      bevel: 0.0008,
    });
    // barrel: heavy, with a finned breech end, carry handle, gas tube & front sight
    C.barrel(b, "darksteel", 0.0125, -0.26, -0.78, by, {
      crown: false,
      seg: 16,
    });
    for (let i = 0; i < 6; i++)
      b.add(GEO.torus(0.0142, 0.0022, 5, 16), "darksteel", {
        p: [0, by, -0.28 - i * 0.012],
      });
    R().flashHider(b, "darksteel", 0.016, -0.78, 0.07, by, 6);
    b.cyl("gunmetal", 0.011, 0.36, [0, by - 0.03, -0.44], { seg: 12 }); // gas tube
    b.box("gunmetal", 0.03, 0.05, 0.03, [0, by - 0.012, -0.62], {
      bevel: 0.004,
    }); // gas block
    b.add(
      GEO.hose(
        [
          [0, by + 0.014, -0.3],
          [0.0, by + 0.07, -0.33],
          [0.0, by + 0.075, -0.43],
          [0, by + 0.014, -0.46],
        ],
        0.006,
        18,
        8,
      ),
      "darksteel",
    ); // carry handle
    b.cyl("woodLight", 0.0095, 0.08, [0, by + 0.075, -0.38], {
      seg: 12,
      tint: 0.7,
    });
    b.box("darksteel", 0.004, 0.034, 0.008, [0, by + 0.024, -0.74], {
      bevel: 0.001,
    }); // front post
    // folded bipod under the gas tube
    for (const sx of [-1, 1])
      b.cyl("steel", 0.0045, 0.3, [sx * 0.012, by - 0.048, -0.5], { seg: 8 });
    b.box("darksteel", 0.03, 0.02, 0.03, [0, by - 0.04, -0.66], {
      bevel: 0.003,
    });
    // handguard (left hand) under the receiver front
    b.profile(
      "plastic",
      [
        [0.26, 0.03],
        [0.4, 0.04],
        [0.4, 0.07],
        [0.26, 0.07],
      ],
      0.04,
      { bevel: 0.004 },
    );
    // polymer stock with a butt plate & shoulder strap
    b.profile(
      "plastic",
      [
        [-0.08, 0.1],
        [-0.08, 0.036],
        [-0.12, 0.024],
        [-0.33, 0.016],
        [-0.35, 0.016],
        [-0.35, 0.106],
        [-0.32, 0.112],
        [-0.12, 0.104],
      ],
      0.042,
      { bevel: 0.006 },
    );
    b.profile(
      "steel",
      [
        [-0.35, 0.016],
        [-0.358, 0.016],
        [-0.358, 0.106],
        [-0.35, 0.106],
      ],
      0.044,
      { bevel: 0.002 },
    );
    b.box("tan", 0.0008, 0.012, 0.06, [0.0222, 0.06, 0.12], { bevel: 0 });
    root.add(b.build());
    // the 100-round box (part) hung on the left, belt running up into the tray
    const ab = P.builder();
    ab.box("olive", 0.06, 0.1, 0.13, [0, 0, 0], { bevel: 0.006 });
    ab.box("darksteel", 0.062, 0.012, 0.132, [0, 0.045, 0], { bevel: 0.003 });
    ab.box("yellow", 0.0008, 0.024, 0.07, [-0.0306, -0.01, 0], { bevel: 0 });
    for (let i = 0; i < 5; i++)
      ab.box(
        "brass",
        0.03,
        0.007,
        0.007,
        [0.01 + i * 0.004, 0.056 + i * 0.008, 0.0],
        { bevel: 0.001, r: [0, 0, 0.7] },
      );
    const mag = P.part(root, ab, null, "mag");
    mag.position.set(-0.075, 0.03, -0.08);
    mag.userData.rest = null;
    const trigger = R().triggerPart(root, [0, 0.03, -0.036]);
    const ch = P.builder();
    ch.box("steel", 0.016, 0.01, 0.01, [0.03, 0.07, -0.16], { bevel: 0.002 });
    ch.add(GEO.sphere(0.006, 8, 6), "steel", { p: [0.04, 0.07, -0.16] });
    const charger = P.part(root, ch, null, "charger");
    const sockets = {
      muzzle: P.socket(root, "muzzle", [0, by, -0.85]),
      eject: P.socket(root, "eject", [0.024, 0.06, -0.06]),
      sight: P.socket(root, "sight", [0, 0.16, 0.02]),
      rightHand: R().rightOnGrip(root, A),
      leftHand: R().leftUnder(root, "leftHand", [0, 0.034, -0.34], -0.35),
      magGrip: R().leftUnder(mag, "magGrip", [-0.01, -0.06, 0.0], 1.0),
      chargeGrip: P.handSocket(
        charger,
        "chargeGrip",
        [0.05, 0.07, -0.16],
        [0, -1, 0],
        [1, 0, 0.2],
      ),
    };
    return {
      root,
      parts: { mag, trigger, charger },
      sockets,
      cfg: {
        hip: { p: [0.13, -0.17, -0.3], r: [0.03, 0.06, 0.02] },
        adsDist: 0.2,
        rightPose: "trigger",
        leftPose: "support",
        reload: {
          type: "mag",
          grip: "magGrip",
          axis: [-0.3, -1, 0],
          out: 0.05,
          away: [-0.1, -0.3, 0.1],
          tilt: { p: [0.0, -0.02, 0.03], r: [0.05, -0.2, -0.3] },
          charge: {
            part: "charger",
            p: [0, 0, 0.06],
            grip: "chargeGrip",
            hand: "R",
          },
        },
        shot: [
          { part: "trigger", r: [-0.3, 0, 0], held: true },
          { part: "charger", p: [0, 0, 0.02], dur: 0.04 },
        ],
        sprint: { p: [-0.04, -0.06, 0.04], r: [-0.25, 0.5, 0.3] },
        lower: { p: [0.06, -0.35, 0.1], r: [-0.7, 0.3, 0.2] },
      },
    };
  };

  // ------------------------------------------------------------------
  // Ammo pickups (world materials)
  // ------------------------------------------------------------------
  const AMMO_LOOK = {
    ammo_32: { box: [0.07, 0.035, 0.05], band: "red", col: "tan" },
    ammo_10mm: { box: [0.08, 0.04, 0.055], band: "enamelBlue", col: "tan" },
    ammo_44: { box: [0.08, 0.045, 0.06], band: "yellow", col: "tan" },
    ammo_308: { box: [0.1, 0.04, 0.07], band: "olive", col: "tan" },
    ammo_556: { can: true, col: "olive" },
    ammo_5mm: { can: true, col: "olive", big: true },
    ammo_12ga: {
      box: [0.11, 0.06, 0.07],
      band: "red",
      col: "red",
      shells: true,
    },
    ammo_bb: { tube: true, col: "yellow" },
    ammo_gyrojet: {
      box: [0.09, 0.035, 0.06],
      band: "enamelBlue",
      col: "white",
      rockets: true,
    },
    ammo_rivet: { keg: true },
    ammo_dry_cell: { battery: true },
    ammo_flamer_fuel: { fuel: true },
  };
  M._ammo = function (id) {
    P.buildingWorld = true;
    const b = P.builder();
    const L = AMMO_LOOK[id] || {
      box: [0.08, 0.04, 0.06],
      band: "red",
      col: "tan",
    };
    if (id === "ammo_missile") P.buildMissile(b, [0, 0.04, 0], 0.9);
    else if (id === "ammo_recoilless")
      P.buildRecoillessRound(b, [0, 0.046, 0], 1.0);
    else if (L.can) {
      const s = L.big ? 1.4 : 1;
      b.box(L.col, 0.08 * s, 0.1 * s, 0.14 * s, [0, 0.05 * s, 0], {
        bevel: 0.006,
      });
      b.box("darksteel", 0.084 * s, 0.012, 0.144 * s, [0, 0.1 * s, 0], {
        bevel: 0.003,
      });
      b.box("darksteel", 0.03, 0.008, 0.06, [0, 0.108 * s, 0], {
        bevel: 0.002,
      });
      b.box("yellow", 0.0008, 0.02, 0.07, [0.0405 * s, 0.05 * s, 0], {
        bevel: 0,
      });
    } else if (L.battery) {
      // square six-volt lantern battery: grey can, red label band, two spring terminals
      b.box("tan", 0.068, 0.11, 0.068, [0, 0.055, 0], {
        bevel: 0.006,
        tint: [0.75, 0.78, 0.8],
      });
      b.box("red", 0.0692, 0.04, 0.0692, [0, 0.06, 0], { bevel: 0.002 });
      for (const x of [-0.016, 0.016]) {
        b.cyl("steel", 0.003, 0.012, [x, 0.117, 0], { seg: 8 });
        b.add(GEO.torus(0.005, 0.0012, 4, 10), "steel", {
          p: [x, 0.126, 0],
          r: [Math.PI / 2, 0, 0],
        });
      }
    } else if (L.keg) {
      // a nail-keg of rivets: wooden keg, iron hoops, rivet heads on top
      b.add(
        GEO.latheY(
          [
            [0.0, 0.0],
            [0.045, 0.0],
            [0.052, 0.04],
            [0.045, 0.08],
            [0.0, 0.08],
          ],
          14,
        ),
        "woodLight",
        {},
      );
      for (const y of [0.01, 0.07])
        b.add(GEO.torus(0.047, 0.0025, 4, 14), "rust", {
          p: [0, y, 0],
          r: [Math.PI / 2, 0, 0],
        });
      for (let i = 0; i < 7; i++) {
        const a = i * 0.9;
        b.sphere(
          "rust",
          0.007,
          [
            Math.cos(a) * 0.022 * ((i % 2) + 0.5),
            0.082,
            Math.sin(a) * 0.022 * ((i % 2) + 0.5),
          ],
          { ws: 6, hs: 4 },
        );
      }
    } else if (L.tube) {
      b.cyl("yellow", 0.012, 0.09, [0, 0.012, 0], { seg: 12 });
      b.cyl("red", 0.0125, 0.02, [0, 0.012, -0.04], { seg: 12 });
    } else if (L.fuel) {
      b.cyl("red", 0.045, 0.2, [0, 0.045, 0], { seg: 16 });
      b.add(
        GEO.lathe(
          [
            [0.045, 0.1],
            [0.02, 0.12],
            [0.01, 0.13],
          ],
          16,
        ),
        "red",
        { p: [0, 0.045, 0] },
      );
      b.box("white", 0.0008, 0.04, 0.08, [0.0455, 0.045, 0], { bevel: 0 });
    } else {
      const [w, h, d] = L.box;
      b.box(L.col, w, h, d, [0, h / 2, 0], { bevel: 0.003 });
      b.box(L.band, w * 1.01, h * 0.35, d * 1.01, [0, h * 0.5, 0], {
        bevel: 0.001,
      });
      b.box("white", w * 0.5, 0.001, d * 0.4, [0, h + 0.0005, 0], { bevel: 0 });
      if (L.rockets)
        for (let i = 0; i < 4; i++) {
          b.cyl("steel", 0.0062, 0.032, [-0.024 + i * 0.016, h + 0.007, 0.0], {
            seg: 10,
            r: [Math.PI / 2, 0, 0],
          });
          b.sphere("steel", 0.0062, [-0.024 + i * 0.016, h + 0.007, -0.016], {
            ws: 8,
            hs: 6,
          });
        }
      if (L.shells)
        for (let i = 0; i < 3; i++) {
          b.cyl("red", 0.0105, 0.05, [-0.02 + i * 0.022, h + 0.011, 0.0], {
            seg: 10,
          });
          b.cyl("brass", 0.011, 0.014, [-0.02 + i * 0.022, h + 0.011, 0.032], {
            seg: 10,
          });
        }
    }
    const grp = b.build(true);
    P.buildingWorld = false;
    return grp;
  };
})();
