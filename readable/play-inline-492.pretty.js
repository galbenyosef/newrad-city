/* src/weapons/30_models_pistols.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: models — fists & handguns
 *   fists, pistol_10mm (M-55 blocky service pistol), revolver_32,
 *   magnum_44 (long-barrel revolver, optional scope)
 * All in metres; origin = centre of the right-hand grip; forward = -Z.
 * Profile points are [fwd, up] with fwd = -z.
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

  /** Rotate a list of [u (across/fwd), v (along/up)] points by rake angle a (top leans forward). */
  function raked(pts, a, off) {
    const c = Math.cos(a),
      s = Math.sin(a);
    return pts.map((p) => [
      p[0] * c + p[1] * s + (off ? off[0] : 0),
      -p[0] * s + p[1] * c + (off ? off[1] : 0),
    ]);
  }
  P.raked = raked;
  /** Grip-axis vectors for a rake angle a: down along grip (weapon space). */
  function gripAxis(a) {
    return [0, -Math.cos(a), Math.sin(a)];
  }
  P.gripAxis = gripAxis;

  // ------------------------------------------------------------------
  // FISTS rig (also base for brass knuckles & power fist)
  // ------------------------------------------------------------------
  P.fistsRig = function (skin, world, extraR) {
    const root = new THREE.Group();
    root.name = "fists";
    // root sits between the fists (so sway/recoil/sprint rotate about the hands, not the eye)
    const fistR = new THREE.Group();
    fistR.name = "fistR";
    fistR.position.set(0.125, 0.007, 0.015);
    root.add(fistR);
    const fistL = new THREE.Group();
    fistL.name = "fistL";
    fistL.position.set(-0.125, -0.003, -0.015);
    root.add(fistL);
    // boxing guard: knuckles forward & slightly up, thumbs on top, palms facing inward
    // boxer's guard: knuckles forward and a little up, backs of the hands facing up/outward,
    // thumbs on the inner top edge — from the eye you see knuckles, backs of hands and thumbs.
    // (round 2) fists turned ~45° thumbs-up-and-in, knuckles forward, backs of the hands out: from the eye you see the
    // rolled fingers, the thumb locked over index & middle finger and the knuckle ridge — the old
    // backs-up guard showed only a smooth hand-back from behind and read as a lump.
    // (loop 2) rolled back toward a classic guard: backs of the hands up-and-out (~35° from flat), thumbs on the
    // inner top edge — the eye sees the knuckle row and the finger backs rolling under, not the curled
    // fingertips/nails of a thumbs-up fist (which read as claws once the fingers bend smoothly)
    // (round 2b) backs of the hands turned a further ~15° up and toward the eye: the curled middle phalanges
    // now face down/away (hidden under the fist) — from the eye you see the hand-back, knuckle ridge and the
    // thumb locked across the fingers, a solid fist instead of a hooked "claw"
    const rh = P.handSocket(
      fistR,
      "rightHand",
      [0, 0, 0],
      [0.85, -0.45, 0.1],
      [0.45, 0.85, 0.28],
    );
    const lh = P.handSocket(
      fistL,
      "leftHand",
      [0, 0, 0],
      [0.85, 0.45, -0.1],
      [-0.45, 0.85, 0.28],
    );
    if (extraR) extraR(fistR, rh);
    return {
      root,
      parts: { fistR, fistL },
      sockets: { rightHand: rh, leftHand: lh, muzzle: rh },
      cfg: {
        hip: { p: [0, -0.112, -0.355], r: [0, 0, 0] },
        rightPose: "fist",
        leftPose: "fist",
        sprint: { p: [0, -0.06, 0.04], r: [-0.25, 0.2, 0.1] },
        block: { p: [-0.02, 0.1, 0.06], r: [0.25, 0, 0.15] },
      },
    };
  };
  M.fists = function (skin, world) {
    return P.fistsRig(skin, world);
  };

  // ------------------------------------------------------------------
  // 10mm PISTOL (M-55): boxy slide with slanted nose, big square
  // trigger guard, raked grip with bakelite panels, exposed hammer.
  // ------------------------------------------------------------------
  M.pistol_10mm = function (skin) {
    const root = new THREE.Group();
    root.name = "pistol_10mm";
    const A = 0.28; // grip rake
    // checkered bakelite (or Civil Defense grey) panels over a hot-blued steel frame whose edges are
    // worn silver from years in a holster (builder `wear` brightens every bevel face)
    const gripMat = skin === "service" ? "gripGrey" : "bakelite";
    const metal = "blued";
    const WEAR = { bevel: 0.0032, bseg: 2, wear: 1 };
    const b = P.builder();
    // ---- grip (frame) ----
    const gripPts = raked(
      [
        [-0.024, -0.056],
        [0.021, -0.056],
        [0.023, 0.03],
        [0.027, 0.052],
        [-0.03, 0.052],
        [-0.034, 0.042],
        [-0.027, 0.02],
      ],
      A,
    );
    b.profile(metal, gripPts, 0.028, WEAR);
    // grip panels (both sides) with checkering: a smooth border frame + a raised checkered field
    const panelPts = raked(
      [
        [-0.02, -0.048],
        [0.017, -0.048],
        [0.019, 0.03],
        [-0.023, 0.034],
        [-0.024, 0.0],
      ],
      A,
    );
    b.profile(gripMat, panelPts, 0.033, { bevel: 0.0022, bseg: 2, tint: 0.8 });
    const fieldPts = raked(
      [
        [-0.016, -0.042],
        [0.013, -0.042],
        [0.015, 0.024],
        [-0.019, 0.027],
        [-0.02, 0.0],
      ],
      A,
    );
    b.profile(gripMat, fieldPts, 0.0352, { bevel: 0.0008 });
    // panel screws + medallion
    for (const side of [-1, 1]) {
      const sp = raked(
        [
          [0, 0.022],
          [0, -0.03],
        ],
        A,
      );
      for (const q of sp)
        b.add(GEO.cylX(0.0033, 0.003, 10), "steel", {
          p: [side * 0.0175, q[1], -q[0]],
        });
      if (skin === "service") {
        const q = raked([[0, -0.004]], A)[0];
        b.add(GEO.cylX(0.007, 0.002, 16), "orange", {
          p: [side * 0.0178, q[1], -q[0]],
        });
      }
    }
    // backstrap grooves
    for (let i = 0; i < 8; i++) {
      const q = raked([[-0.026, -0.042 + i * 0.0095]], A)[0];
      b.box(metal, 0.022, 0.0026, 0.004, [0, q[1], -q[0] + 0.001], {
        bevel: 0.0009,
        r: [-A, 0, 0],
        tint: 0.55,
        wear: 1.2,
      });
    }
    // lanyard loop at the heel
    {
      const q = raked([[-0.02, -0.058]], A)[0];
      b.add(GEO.torus(0.005, 0.0015, 5, 10), "steel", {
        p: [0, q[1] - 0.004, -q[0] + 0.004],
        r: [0, Math.PI / 2, 0],
      });
    }
    // ---- frame / dust cover under the slide ----
    b.profile(
      metal,
      [
        [-0.046, 0.052],
        [0.164, 0.052],
        [0.164, 0.04],
        [0.158, 0.033],
        [0.072, 0.033],
        [0.062, 0.028],
        [0.03, 0.028],
        [0.0, 0.03],
        [-0.04, 0.036],
      ],
      0.027,
      { bevel: 0.0026, bseg: 2, wear: 1 },
    );
    // accessory rail teeth under the dust cover
    for (let i = 0; i < 5; i++)
      b.box(metal, 0.02, 0.004, 0.006, [0, 0.031, -(0.09 + i * 0.013)], {
        bevel: 0.0009,
        tint: 0.7,
        wear: 1.3,
      });
    // take-down lever & slide stop on the left
    b.box(metal, 0.004, 0.006, 0.02, [-0.015, 0.046, -0.04], {
      bevel: 0.0012,
      wear: 1.5,
    });
    b.add(GEO.cylX(0.003, 0.006, 8), metal, {
      p: [-0.016, 0.046, -0.028],
      wear: 1,
    });
    // trigger guard (square) with hole
    b.add(
      GEO.shapeProfile(
        (s) => {
          s.moveTo(0.006, 0.034);
          s.lineTo(0.074, 0.034);
          s.lineTo(0.08, 0.026);
          s.lineTo(0.078, 0.006);
          s.lineTo(0.068, -0.002);
          s.lineTo(0.022, -0.002);
          s.lineTo(0.008, 0.012);
          s.lineTo(0.006, 0.034);
          const h = new THREE.Path();
          h.moveTo(0.016, 0.03);
          h.lineTo(0.066, 0.03);
          h.lineTo(0.071, 0.024);
          h.lineTo(0.069, 0.009);
          h.lineTo(0.063, 0.005);
          h.lineTo(0.026, 0.005);
          h.lineTo(0.016, 0.015);
          h.lineTo(0.016, 0.03);
          s.holes.push(h);
        },
        0.014,
        0.0018,
      ),
      metal,
      { wear: 1 },
    );
    // barrel protruding from the slide nose + recoil spring plug
    C.barrel(b, "steel", 0.0068, -0.13, -0.171, 0.07, { bore: 0.55 });
    b.add(GEO.cyl(0.0045, 0.01, 10), "steel", { p: [0, 0.043, -0.166] });
    b.add(new THREE.CircleGeometry(0.0038, 10), "darksteel", {
      p: [0, 0.07, -0.168],
      r: [0, 0, 0],
    });
    root.add(b.build());

    // ---- slide (part) ----
    // Lofted cross-section (not a side-profile brick): vertical flanks, steep machined top chamfers
    // to a narrow sighting flat, a chamfered rear rim and the M-55's raked nose.
    const sb = P.builder();
    const SW = 0.0145,
      SY0 = 0.051,
      SYW = 0.0735,
      SYT = 0.0872,
      STW = 0.0082;
    const slideSec = [
      [-SW, SY0],
      [SW, SY0],
      [SW, SYW],
      [STW, SYT],
      [-STW, SYT],
      [-SW, SYW],
    ];
    sb.add(
      GEO.loft(slideSec, [
        { z: 0.0525, sx: 0.88, sy: 0.9, dy: 0.0022 },
        { z: 0.0485, sharp: true },
        { z: -0.126, sharp: true },
        { z: -0.1665, sy: 0.7 },
        { z: -0.1695, sx: 0.9, sy: 0.64, dy: 0.0014 },
      ]),
      metal,
      { wear: 0.9 },
    );
    // rear cocking serrations (both sides, below the chamfer): cut grooves — dark slots between worn ridges
    for (let i = 0; i < 11; i++)
      for (const sd of [-1, 1]) {
        sb.box(
          metal,
          0.0016,
          0.018,
          0.0016,
          [sd * 0.0142, 0.0632, 0.042 - i * 0.0036],
          { bevel: 0.0004, tint: 0.28 },
        );
        if (i < 10)
          sb.box(
            metal,
            0.0012,
            0.0168,
            0.0014,
            [sd * 0.0148, 0.0632, 0.0402 - i * 0.0036],
            { bevel: 0.0005, tint: 1.3, wear: 1.5 },
          );
      }
    // front serrations
    for (let i = 0; i < 5; i++)
      for (const sd of [-1, 1])
        sb.box(
          metal,
          0.0016,
          0.014,
          0.0016,
          [sd * 0.0142, 0.0625, -0.105 - i * 0.0036],
          { bevel: 0.0004, tint: 0.28 },
        );
    // firing-pin cap and slide-rear plate (inside the rear chamfer)
    sb.add(GEO.cyl(0.0032, 0.0016, 12), "steel", {
      p: [0, 0.07, 0.0528],
      tint: 0.6,
    });
    sb.box(metal, 0.018, 0.016, 0.0012, [0, 0.0665, 0.0525], {
      bevel: 0.0004,
      tint: 0.55,
    });
    // ejection port (right flank) with brass peeking
    sb.box("darksteel", 0.006, 0.013, 0.036, [0.0122, 0.071, -0.02], {
      bevel: 0.001,
    });
    sb.add(GEO.cyl(0.0048, 0.02, 8), "brass", { p: [0.009, 0.071, -0.02] });
    // extractor (right flank, behind the port)
    sb.box(metal, 0.0024, 0.0036, 0.014, [0.0148, 0.068, 0.006], {
      bevel: 0.0008,
      tint: 0.8,
      wear: 1.2,
    });
    // sighting flat: raised anti-glare rib with cross grooves
    sb.box(metal, 0.012, 0.003, 0.172, [0, 0.0884, -0.056], {
      bevel: 0.0012,
      wear: 1.2,
    });
    for (let i = 0; i < 26; i++)
      sb.box(metal, 0.009, 0.0006, 0.0012, [0, 0.0899, 0.012 - i * 0.0062], {
        bevel: 0,
        tint: 0.4,
      });
    C.ironSights(sb, "darksteel", 0.0898, 0.034, -0.15, { h: 0.008 });
    sb.box("glowGreen", 0.0022, 0.0022, 0.001, [0, 0.0953, -0.1465], {
      bevel: 0,
    }); // tritium dot
    sb.box("glowGreen", 0.0018, 0.0018, 0.001, [-0.0045, 0.0943, 0.0305], {
      bevel: 0,
    });
    sb.box("glowGreen", 0.0018, 0.0018, 0.001, [0.0045, 0.0943, 0.0305], {
      bevel: 0,
    });
    // roll-stamped markings on the left flank ("10mm AUTO" / LONG WINTER): recessed, not a sticker
    sb.box(
      skin === "service" ? "orange" : metal,
      0.0006,
      0.0045,
      0.042,
      [-0.0146, 0.0622, -0.068],
      { bevel: 0, tint: skin === "service" ? 0.85 : 0.35 },
    );
    sb.box(metal, 0.0006, 0.0025, 0.022, [-0.0146, 0.0562, -0.078], {
      bevel: 0,
      tint: 0.35,
    });
    const slide = P.part(root, sb, null, "slide");

    // ---- hammer (part) ----
    const hb = P.builder();
    hb.profile(
      metal,
      [
        [0.004, -0.006],
        [0.004, 0.012],
        [-0.004, 0.022],
        [-0.013, 0.02],
        [-0.008, 0.012],
        [-0.006, -0.006],
      ],
      0.008,
      { bevel: 0.0012, wear: 1.4 },
    );
    for (let i = 0; i < 3; i++)
      hb.box(
        "darksteel",
        0.0085,
        0.0012,
        0.003,
        [0, 0.017 - i * 0.003, 0.009 + i * 0.001],
        { bevel: 0 },
      );
    const hammer = P.part(root, hb, [0, 0.058, 0.043], "hammer");
    hammer.children[0].position.set(0, 0, 0);
    // ---- trigger (part) ----
    const tb = P.builder();
    tb.profile(
      "steel",
      [
        [0.004, 0.0],
        [0.006, -0.01],
        [0.003, -0.02],
        [-0.002, -0.023],
        [0.0, -0.012],
        [-0.002, 0.0],
      ],
      0.006,
      { bevel: 0.0008 },
    );
    const trigger = P.part(root, tb, [0, 0.03, -0.036], "trigger");
    trigger.children[0].position.set(0, 0, 0);

    // ---- magazine (part) ----
    const mb = P.builder();
    const magPts = raked(
      [
        [-0.017, -0.064],
        [0.014, -0.064],
        [0.015, 0.04],
        [-0.016, 0.04],
      ],
      A,
    );
    mb.profile("darksteel", magPts, 0.02, { bevel: 0.001 });
    const bp = raked(
      [
        [-0.021, -0.07],
        [0.018, -0.07],
        [0.018, -0.062],
        [-0.021, -0.062],
      ],
      A,
    );
    mb.profile("steel", bp, 0.03, { bevel: 0.002 });
    const mag = P.part(root, mb, null, "mag");

    // ---- sockets ----
    const sockets = {};
    sockets.muzzle = P.socket(root, "muzzle", [0, 0.07, -0.175]);
    sockets.eject = P.socket(slide, "eject", [0.016, 0.08, -0.02], [0, 0, 0]);
    sockets.sight = P.socket(root, "sight", [0, 0.0963, 0.034]);
    const d = gripAxis(A);
    sockets.rightHand = P.handSocket(
      root,
      "rightHand",
      [0.001, -0.004, 0.006],
      d,
      [0.82, 0, 0.45],
    );
    sockets.leftHand = P.handSocket(
      root,
      "leftHand",
      [-0.016, -0.018, -0.01],
      [0, -d[1], -d[2]],
      [-0.82, -0.1, -0.5],
    );
    const mq = raked([[0, -0.07]], A)[0];
    sockets.magGrip = P.handSocket(
      mag,
      "magGrip",
      [-0.004, mq[1] - 0.012, -mq[0] + 0.006],
      [0, 0, -1],
      [-0.9, -0.4, 0],
    );
    sockets.chargeGrip = P.handSocket(
      slide,
      "chargeGrip",
      [-0.004, 0.072, 0.03],
      [0, -0.2, -1],
      [-0.95, 0.3, 0],
    );
    return {
      root,
      parts: { slide, hammer, trigger, mag },
      sockets,
      cfg: {
        hip: { p: [0.125, -0.13, -0.35], r: [0.0, 0.1, 0] },
        adsDist: 0.42, // arms extended in the aim (closer put both sleeves in the lens)
        rightPose: "trigger",
        leftPose: "grip",
        reload: {
          type: "mag",
          axis: d,
          out: 0.075,
          away: [-0.05, -0.34, 0.1],
          tilt: { p: [-0.03, -0.01, 0.02], r: [0.2, 0.18, 0.55] },
          charge: { part: "slide", p: [0, 0, 0.03], grip: "chargeGrip" },
        },
        shot: [
          { part: "slide", p: [0, 0, 0.028], dur: 0.07, lockEmpty: true },
          { part: "hammer", r: [-0.9, 0, 0], dur: 0.08 },
          { part: "trigger", r: [-0.3, 0, 0], held: true },
        ],
        sprint: { p: [-0.03, -0.05, 0.04], r: [-0.45, 0.6, 0.45] },
      },
    };
  };

  // ------------------------------------------------------------------
  // Revolver builder (shared by .32 snub and .44 magnum)
  // ------------------------------------------------------------------
  function revolver(o) {
    const root = new THREE.Group();
    root.name = o.name;
    const A = 0.36;
    const metal = o.metal || "blued";
    const WEAR = {
      bevel: 0.0028,
      bseg: 2,
      wear: o.metal === "steel" ? 0.5 : 1,
    };
    const b = P.builder();
    const L = o.barrelLen,
      by = 0.066; // bore height
    // grip: rounded wood with a flared butt, checkered panels inset on both sides
    const gripPts = raked(
      [
        [-0.02, -0.05],
        [-0.012, -0.058],
        [0.016, -0.057],
        [0.02, -0.048],
        [0.017, 0.03],
        [0.02, 0.046],
        [-0.024, 0.046],
        [-0.028, 0.03],
        [-0.024, 0.0],
      ],
      A,
    );
    b.profile(o.gripMat || "wood", gripPts, 0.032, { bevel: 0.0055, bseg: 3 });
    if (o.checker)
      b.profile(
        o.checker,
        raked(
          [
            [-0.017, -0.044],
            [0.013, -0.044],
            [0.013, 0.026],
            [-0.02, 0.028],
            [-0.021, -0.01],
          ],
          A,
        ),
        0.0336,
        { bevel: 0.0008 },
      );
    // medallion
    {
      const q = raked([[-0.003, 0.034]], A)[0];
      for (const sd of [-1, 1])
        b.add(GEO.cylX(0.0045, 0.0012, 14), o.gold ? "gold" : "steel", {
          p: [sd * 0.0166, q[1], -q[0]],
        });
    }
    // grip frame strap (metal backstrap)
    b.profile(
      metal,
      raked(
        [
          [-0.028, -0.05],
          [-0.022, -0.05],
          [-0.022, 0.048],
          [-0.03, 0.048],
        ],
        A,
      ),
      0.018,
      { bevel: 0.002, bseg: 2, wear: 1 },
    );
    const gs = raked([[0, 0.0]], A)[0];
    b.add(GEO.cylX(0.0035, 0.036, 10), "steel", { p: [0, gs[1], -gs[0]] });
    // frame
    b.profile(
      metal,
      [
        [-0.035, 0.044],
        [-0.028, 0.08],
        [0.0, 0.086],
        [0.06, 0.086],
        [0.06, 0.036],
        [0.05, 0.03],
        [0.012, 0.03],
        [-0.012, 0.036],
      ],
      0.024,
      WEAR,
    );
    // recoil shield ring around the cylinder window (rounded)
    b.add(GEO.torus(o.cylR + 0.002, 0.0022, 6, 22), metal, {
      p: [0, by, 0.006],
      wear: 1,
    });
    // topstrap + rear sight groove
    b.box(metal, 0.012, 0.006, 0.07, [0, 0.087, -0.028], {
      bevel: 0.0025,
      wear: 1.2,
    });
    b.box(metal, 0.003, 0.0012, 0.05, [0, 0.0903, -0.02], {
      bevel: 0,
      tint: 0.3,
    });
    // barrel with full-length underlug + vent rib (magnum) / plain (snub)
    C.barrel(b, metal, o.barrelR, -0.058, -0.058 - L, by, {
      bore: 0.5,
      seg: 20,
    });
    if (o.lug)
      b.box(metal, 0.014, 0.022, L - 0.004, [0, by - 0.012, -0.058 - L / 2], {
        bevel: 0.0045,
        wear: 1,
      });
    b.box(metal, 0.006, 0.008, L, [0, by + o.barrelR + 0.002, -0.058 - L / 2], {
      bevel: 0.002,
      wear: 1.2,
    });
    // ejector-rod shroud side flats catch the light: a thin polished line along each side of the lug
    if (o.lug)
      for (const sd of [-1, 1])
        b.box(
          "steel",
          0.0006,
          0.004,
          L - 0.02,
          [sd * 0.0071, by - 0.012, -0.058 - L / 2],
          { bevel: 0, tint: 0.8 },
        );
    if (o.vent)
      for (let i = 0; i < 6; i++)
        b.box(
          "darksteel",
          0.0065,
          0.004,
          0.004,
          [0, by + o.barrelR + 0.004, -0.07 - (i * (L - 0.02)) / 6],
          { bevel: 0 },
        );
    // front sight blade (ramped)
    b.profile(
      metal,
      [
        [0.0, 0.0],
        [0.012, 0.0],
        [0.012, 0.011],
        [0.004, 0.006],
      ],
      0.003,
      { bevel: 0.0005, p: [0, by + o.barrelR + 0.006, -0.058 - L + 0.012] },
    );
    // trigger guard (rounded)
    b.add(
      GEO.shapeProfile(
        (s) => {
          s.moveTo(0.004, 0.032);
          s.lineTo(0.05, 0.032);
          s.quadraticCurveTo(0.058, 0.0, 0.03, -0.004);
          s.quadraticCurveTo(0.008, -0.004, 0.004, 0.02);
          s.lineTo(0.004, 0.032);
          const h = new THREE.Path();
          h.moveTo(0.012, 0.03);
          h.lineTo(0.044, 0.03);
          h.quadraticCurveTo(0.05, 0.004, 0.03, 0.002);
          h.quadraticCurveTo(0.014, 0.002, 0.012, 0.02);
          h.lineTo(0.012, 0.03);
          s.holes.push(h);
        },
        0.01,
        0.0012,
      ),
      metal,
      {},
    );
    // cylinder release latch (left)
    b.box("steel", 0.004, 0.008, 0.012, [-0.013, 0.07, 0.006], {
      bevel: 0.0015,
    });
    // side plate screws
    b.rivets(
      "steel",
      [
        [0, 0.075, 0.018],
        [0, 0.048, 0.0],
        [0, 0.07, -0.03],
      ],
      0.0025,
      0.0125,
    );
    if (o.gold) {
      b.box("gold", 0.001, 0.02, 0.05, [0.0125, 0.058, 0.0], { bevel: 0 });
      b.box("gold", 0.001, 0.02, 0.05, [-0.0125, 0.058, 0.0], { bevel: 0 });
    }
    root.add(b.build());

    // ---- crane + cylinder (part swings out to the left) ----
    const crane = new THREE.Group();
    crane.name = "crane";
    crane.position.set(-0.004, 0.047, -0.03);
    root.add(crane);
    const cylG = new THREE.Group();
    cylG.name = "cylinder";
    cylG.position.set(0.004, by - 0.047, 0.0);
    crane.add(cylG);
    const cb = P.builder();
    const cr = o.cylR,
      cl = o.cylLen;
    cb.add(
      GEO.lathe(
        [
          [0.003, -cl / 2],
          [cr * 0.88, -cl / 2],
          [cr * 0.97, -cl / 2 + 0.002],
          [cr, -cl / 2 + 0.005],
          [cr, cl / 2 - 0.004],
          [cr * 0.95, cl / 2 - 0.001],
          [cr * 0.9, cl / 2],
          [0.004, cl / 2],
        ],
        30,
      ),
      metal,
      { wear: 1.4 },
    );
    // flutes + chambers with brass rims at the back
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      cb.add(GEO.capsule(0.0032, cl * 0.5, 3, 8).rotateX(Math.PI / 2), metal, {
        p: [Math.cos(a) * cr * 1.0, Math.sin(a) * cr * 1.0, -0.002],
        s: [1, 1, 1],
        tint: 0.3,
      });
      // cylinder stop notch
      cb.box(
        metal,
        0.003,
        0.002,
        0.004,
        [
          Math.cos(a - Math.PI / 6) * cr * 0.99,
          Math.sin(a - Math.PI / 6) * cr * 0.99,
          cl / 2 - 0.009,
        ],
        { bevel: 0.0004, r: [0, 0, a - Math.PI / 6], tint: 0.3 },
      );
      const ca = a - Math.PI / 6;
      cb.add(new THREE.CircleGeometry(cr * 0.26, 10), "darksteel", {
        p: [
          Math.cos(ca) * cr * 0.58,
          Math.sin(ca) * cr * 0.58,
          -cl / 2 - 0.0005,
        ],
      });
      cb.add(GEO.cyl(cr * 0.27, 0.0025, 10), "brass", {
        p: [
          Math.cos(ca) * cr * 0.58,
          Math.sin(ca) * cr * 0.58,
          cl / 2 + 0.0008,
        ],
      });
    }
    // crane arm + ejector rod
    cb.box(metal, 0.008, 0.02, 0.012, [0, -cr * 0.7, -cl / 2 - 0.004], {
      bevel: 0.002,
    });
    const cylB = cb.build();
    cylG.add(cylB);
    cylG.userData.rest = {
      p: cylG.position.clone(),
      q: cylG.quaternion.clone(),
    };
    const eb = P.builder();
    eb.add(GEO.cyl(0.0026, o.rodLen, 8), "steel", {
      p: [0, 0, -cl / 2 - o.rodLen / 2],
    });
    eb.add(GEO.cyl(0.004, 0.006, 10), "steel", {
      p: [0, 0, -cl / 2 - o.rodLen],
    });
    const ejector = P.part(cylG, eb, null, "ejector");
    crane.userData.rest = {
      p: crane.position.clone(),
      q: crane.quaternion.clone(),
    };

    // ---- hammer (spur) ----
    const hb = P.builder();
    hb.profile(
      "steel",
      [
        [0.004, -0.008],
        [0.004, 0.01],
        [-0.004, 0.02],
        [-0.018, 0.024],
        [-0.014, 0.016],
        [-0.006, 0.008],
        [-0.006, -0.008],
      ],
      0.007,
      { bevel: 0.001 },
    );
    for (let i = 0; i < 4; i++)
      hb.box(
        "darksteel",
        0.0075,
        0.001,
        0.003,
        [0, 0.022 - i * 0.002, 0.012 + i * 0.002],
        { bevel: 0 },
      );
    const hammer = P.part(root, hb, [0, 0.07, 0.037], "hammer");
    hammer.children[0].position.set(0, 0, 0);
    const tb = P.builder();
    tb.profile(
      "steel",
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
    const trigger = P.part(root, tb, [0, 0.032, -0.03], "trigger");
    trigger.children[0].position.set(0, 0, 0);

    // optional scope (Closing Bell)
    const sockets = {};
    if (o.scope) {
      const s2 = P.builder();
      C.scope(s2, 0.118, -0.06, 0.2, 0.013, { mountY: 0.09 });
      root.add(s2.build());
      sockets.sight = P.socket(root, "sight", [0, 0.118, 0.06]);
    } else {
      sockets.sight = P.socket(root, "sight", [
        0,
        by + o.barrelR + 0.012,
        0.02,
      ]);
    }
    sockets.muzzle = P.socket(root, "muzzle", [0, by, -0.058 - L - 0.004]);
    sockets.eject = P.socket(cylG, "eject", [0, 0, cl / 2]);
    sockets.cylEject = P.socket(cylG, "cylEject", [0, 0, cl / 2 + 0.004]);
    const d = gripAxis(A);
    sockets.rightHand = P.handSocket(
      root,
      "rightHand",
      [0.001, -0.004, 0.004],
      d,
      [0.82, 0, 0.45],
    );
    sockets.leftHand = P.handSocket(
      root,
      "leftHand",
      [-0.016, -0.02, -0.01],
      [0, -d[1], -d[2]],
      [-0.82, -0.1, -0.5],
    );
    sockets.cylGrip = P.handSocket(
      cylG,
      "cylGrip",
      [-0.02, -0.01, 0.0],
      [0, 0, -1],
      [-0.9, -0.3, 0],
    );
    return {
      root,
      parts: { crane, cylinder: cylG, ejector, hammer, trigger },
      sockets,
      cfg: {
        hip: { p: [0.125, -0.13, -0.35], r: [0, 0.1, 0] },
        adsDist: o.scope ? 0.22 : 0.42,
        rightPose: "trigger",
        leftPose: "grip",
        cylinderStep: true,
        reload: {
          type: "revolver",
          swing: { p: [-0.02, 0, 0], r: [0, 0, 1.2] },
        },
        shot: [
          { part: "hammer", r: [-0.75, 0, 0], dur: 0.14 },
          { part: "trigger", r: [-0.35, 0, 0], held: true },
        ],
        sprint: { p: [-0.03, -0.05, 0.04], r: [-0.45, 0.6, 0.45] },
      },
    };
  }
  M.revolver_32 = function (skin) {
    return revolver({
      name: "revolver_32",
      barrelLen: 0.05,
      barrelR: 0.0075,
      cylR: 0.017,
      cylLen: 0.036,
      rodLen: 0.03,
      lug: false,
      vent: false,
      gripMat: "bakelite",
      checker: "bakelite",
      metal: "blued",
    });
  };
  M.magnum_44 = function (skin) {
    return revolver({
      name: "magnum_44",
      barrelLen: skin === "gold" ? 0.17 : 0.15,
      barrelR: 0.0095,
      cylR: 0.021,
      cylLen: 0.044,
      rodLen: 0.06,
      lug: true,
      vent: true,
      gripMat: skin === "gold" ? "bakelite" : "wood",
      checker: skin === "gold" ? "bakelite" : "gripWood",
      metal: skin === "gold" ? "steel" : "blued",
      gold: skin === "gold",
      scope: skin === "gold",
    });
  };
})();
