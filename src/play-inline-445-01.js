// play-inline-445 01 — box
// Lines 29-283 of readable/play-inline-445.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const X = G.props._;
  const C = X.PAL;
  const D = X.defineProto;
  const PI = Math.PI;
  const pick = (r, a) => a[(r() * a.length) | 0];

  // ------------------------------------------------------------------
  // PATROLMAN. Built upright in sub-kits (origin = hip centre), then posed.
  // ~1.95 m of square-cut municipal robot: enamel shell (instance-tintable,
  // so every wreck is a slightly different shade of old paint) over dark
  // joints; a flat-topped head with a brim and ONE horizontal visor slit,
  // a slab chest with a hazard-striped breast plate and vent slots, square
  // shoulder blocks, boxy limbs with clamp hands, broad flat feet.
  // Police units (navy & white, brass shield) stood the checkpoints.
  // ------------------------------------------------------------------
  const PT_SHELL = { civic: 0xc4bca6, police: 0x2c3e66 };
  function ptPaint(r, police) {
    return police
      ? { color: PT_SHELL.police, rust: 0.4, grime: 0.3 }
      : { color: PT_SHELL.civic, rust: 0.38, grime: 0.28, tint: true };
  }
  const PT_DARK = { color: 0x2a2a28, rust: 0.35, grime: 0.25 };
  const PT_STEEL = { color: 0x6a6a64, rust: 0.55, grime: 0.3 };
  function patrolmanUpper(r, lit, police) {
    const k = new X.Kit(31);
    const body = ptPaint(r, police),
      dark = PT_DARK;
    const trim = police
      ? { color: 0xe4e0d4, rust: 0.4, grime: 0.4 }
      : { color: 0xd8a820, rust: 0.5, grime: 0.4 };
    // pelvis block + segmented waist
    k.cbox(
      "paint",
      0.5,
      0.2,
      0.34,
      0,
      0.02,
      0,
      Object.assign({ bevel: 0.04 }, body),
    );
    for (let i = 0; i < 3; i++)
      k.box(
        "metal",
        0.3 - i * 0.02,
        0.04,
        0.22 - i * 0.01,
        0,
        0.14 + i * 0.05,
        0,
        dark,
      );
    // slab chest, breast plate with hazard chevrons (police: white panel + shield), vent slots, model plate
    k.cbox(
      "paint",
      0.66,
      0.56,
      0.44,
      0,
      0.52,
      0,
      Object.assign({ bevel: 0.05 }, body),
    );
    k.cbox(
      "metal",
      0.5,
      0.3,
      0.04,
      0,
      0.6,
      -0.235,
      Object.assign({ bevel: 0.015 }, police ? trim : body),
    );
    if (!police)
      for (let i = 0; i < 4; i++)
        k.box("metal", 0.07, 0.24, 0.012, -0.18 + i * 0.12, 0.6, -0.258, {
          rz: 0.6,
          color: i % 2 ? 0x1c1c1a : 0xd8a820,
          rust: 0.4,
        });
    else
      k.box("metal", 0.14, 0.16, 0.02, 0.12, 0.62, -0.262, {
        color: 0xc8a850,
        rust: 0.4,
      });
    for (let i = 0; i < 4; i++)
      k.box("metal", 0.36, 0.018, 0.02, 0, 0.32 + i * 0.035, -0.225, PT_STEEL);
    k.box("metal", 0.14, 0.05, 0.015, -0.17, 0.42, -0.226, {
      color: 0xb8b0a0,
      rust: 0.5,
    });
    if (lit)
      k.box("glow", 0.05, 0.05, 0.02, 0.22, 0.42, -0.226, {
        color: 0xffa040,
        grime: 0,
        ao: [1, 1],
      });
    for (let i = 0; i < 6; i++)
      k.sphere("metal", 0.011, -0.3 + i * 0.12, 0.79, -0.215, {
        wseg: 4,
        hseg: 3,
        color: 0x4a4a44,
      });
    // square shoulder blocks
    for (const s of [-1, 1])
      k.cbox(
        "paint",
        0.2,
        0.18,
        0.32,
        s * 0.42,
        0.72,
        0,
        Object.assign({ bevel: 0.03 }, body),
      );
    // neck, then the head: a flat-topped box with a brim and one long visor slit
    k.box("metal", 0.16, 0.08, 0.16, 0, 0.84, 0, dark);
    k.cbox(
      "paint",
      0.36,
      0.26,
      0.3,
      0,
      1.01,
      0,
      Object.assign({ bevel: 0.025 }, body),
    );
    k.box("metal", 0.4, 0.03, 0.36, 0, 1.15, -0.02, police ? trim : body); // flat top + brim
    k.box("metal", 0.3, 0.05, 0.02, 0, 1.03, -0.152, { color: 0x121210 }); // visor slit
    if (lit)
      k.box("glow", 0.27, 0.022, 0.012, 0, 1.03, -0.158, {
        color: 0xff8a3a,
        grime: 0,
        ao: [1, 1],
      });
    for (let i = 0; i < 3; i++)
      k.box("metal", 0.14, 0.008, 0.016, 0, 0.93 + i * 0.022, -0.153, PT_STEEL); // speaker slots
    for (const s of [-1, 1])
      k.cyl("metal", 0.05, 0.05, 0.03, s * 0.19, 1.0, 0, {
        rz: PI / 2,
        seg: 8,
        color: 0x3a3a36,
      });
    // rooftop beacon block and a whip antenna at the back corner
    k.box("metal", 0.12, 0.05, 0.08, 0, 1.19, 0.02, dark);
    k.box(lit ? "glow" : "glass", 0.1, 0.035, 0.06, 0, 1.225, 0.02, {
      color: police ? (lit ? 0xff4030 : 0x5a1a14) : lit ? 0xffb040 : 0x5a4a20,
      grime: 0.2,
    });
    k.seg("metal", [0.14, 1.16, 0.12], [0.18, 1.5, 0.16], 0.008, {
      color: 0x2a2a28,
    });
    return k;
  }
  function patrolmanArm(r, side, bend, police) {
    const k = new X.Kit(33 + side);
    const body = ptPaint(r, police),
      dark = PT_DARK;
    k.cyl("metal", 0.08, 0.08, 0.14, 0, 0, 0, {
      rz: PI / 2,
      seg: 8,
      color: 0x2a2a28,
    });
    k.box("paint", 0.13, 0.3, 0.13, 0, -0.2, 0, body);
    k.box("metal", 0.1, 0.06, 0.1, 0, -0.36, 0, PT_STEEL);
    const fa = new X.Kit(35 + side);
    fa.cyl("metal", 0.06, 0.06, 0.15, 0, 0, 0, {
      rz: PI / 2,
      seg: 8,
      color: 0x2a2a28,
    });
    fa.box("paint", 0.15, 0.34, 0.15, 0, -0.2, 0, body);
    fa.box("metal", 0.16, 0.04, 0.16, 0, -0.36, 0, dark);
    // clamp hand: a palm block and two flat jaws
    fa.box("metal", 0.1, 0.06, 0.08, 0, -0.41, 0, dark);
    for (const s of [-1, 1])
      fa.box("metal", 0.025, 0.14, 0.07, s * 0.04, -0.5, 0, PT_STEEL);
    k.include(fa, { y: -0.38, rx: -bend });
    return k;
  }
  /** Leg with a real knee: thigh kit (origin hip) + shin kit hinged at the knee (kneeBend, negative = shin back). */
  function patrolmanLeg(r, side, kneeBend, police) {
    const k = new X.Kit(37 + side);
    const body = ptPaint(r, police),
      dark = PT_DARK;
    k.box("metal", 0.16, 0.12, 0.16, 0, -0.02, 0, dark);
    k.box("paint", 0.2, 0.4, 0.2, 0, -0.26, 0, body);
    k.seg("metal", [0.11, -0.08, 0.06], [0.11, -0.46, 0.06], 0.018, PT_STEEL); // hydraulic rod
    const sh = new X.Kit(38 + side);
    sh.cyl("metal", 0.085, 0.085, 0.18, 0, 0, 0, {
      rz: PI / 2,
      seg: 10,
      color: 0x2a2a28,
    });
    sh.box("paint", 0.16, 0.14, 0.04, 0, 0, -0.1, body); // knee plate
    sh.box("paint", 0.22, 0.34, 0.22, 0, -0.22, 0, body);
    sh.box("metal", 0.23, 0.03, 0.23, 0, -0.36, 0, dark);
    sh.cbox(
      "metal",
      0.27,
      0.13,
      0.44,
      0,
      -0.43,
      -0.08,
      Object.assign({ bevel: 0.03 }, dark),
    ); // foot
    sh.box("metal", 0.26, 0.03, 0.08, 0, -0.39, -0.3, PT_STEEL); // toe plate
    k.include(sh, { y: -0.5, rx: kneeBend || 0 });
    return k;
  }
  /** Soft-edged oil/coolant pool: irregular outline, dark brown core fading to a lighter rim (no alpha needed). */
  function oilPool(k, r, x, z, R) {
    const pts = [],
      M = 16;
    for (let i = 0; i < M; i++) {
      const a = (i / M) * X.TAU,
        rr = R * (0.7 + 0.45 * r()) * (1 + 0.25 * Math.sin(a * 3 + r() * 6));
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    const c0 = X.color(0x1e1a15),
      c1 = X.color(0x3e382e),
      tmp = new THREE.Color();
    k.extrude("plain", pts, 0.012, {
      rx: -PI / 2,
      x,
      y: 0.008,
      z,
      grime: 0,
      ao: [1, 1],
      colorFn: (px, py, pz) =>
        tmp
          .copy(c0)
          .lerp(c1, X.clamp(Math.hypot(px - x, pz - z) / R, 0, 1))
          .getHex(),
    });
    for (let i = 0; i < 3; i++) {
      const a = r() * X.TAU,
        d = R * (1.05 + r() * 0.4);
      k.cyl(
        "plain",
        0.06 + r() * 0.08,
        0.06 + r() * 0.08,
        0.01,
        x + Math.cos(a) * d,
        0.007,
        z + Math.sin(a) * d,
        { seg: 7, color: 0x2e2922, grime: 0, ao: [1, 1] },
      );
    }
  }
  /** pose: 0 slumped against a wall, 1 face-down, 2 kneeling (powered down mid-step), 3 sitting hunched over its knees. */
