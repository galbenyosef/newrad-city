/* src/props/27_streetlife.js */
/* =====================================================================
 * props / 27_streetlife.js — STREET LIFE THAT DIED ON MARCH 5th.
 *   robot_wreck   — PATROLMAN wrecks: boxy upright municipal robots
 *                   (enamel shell tintable per instance, a flat-topped head
 *                   with a single visor slit that still glows while the unit
 *                   has charge, square shoulders, clamp hands, real knee
 *                   joints) in four poses — slumped against a wall, face-down
 *                   in an oil pool, kneeling, sitting hunched — plus navy
 *                   police units, and a VALET household robot (two arms,
 *                   wheeled chassis) crashed on its side (v2). Lootable
 *                   (patrolman / valet tables).
 *   food_cart     — Forever Franks hot-dog cart: v0 standing under a
 *                   tattered striped umbrella, v1 tipped over with its
 *                   umbrella in the gutter. Lootable (cooler).
 *   newsstand     — NYC green newsstand: v0 shuttered (never looted, the
 *                   only one that can hold a training manual), v1 open and
 *                   picked over (magazine racks). props_newsstand* loot.
 *   call_box      — red FDNY fire-alarm pedestal with a globe lamp; v1
 *                   knocked flat.
 *   triage_tent   — US Army medical tent: cots, body bags, IV stand,
 *                   red-cross panels, one flap torn. Walls collide.
 *   body_bag      — v0 zipped, v1 half-open (bones show), v2 a row of 3.
 *   vendor_table  — sidewalk souvenir stand (World's Fair globes & medallions,
 *                   watches, sunglasses, lawn chair); v1 collapsed.
 * Local frame as everywhere in props: y = 0 ground, the FRONT faces -Z.
 * ===================================================================== */
(function () {
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
  function patrolman(k, r, pose, lit, police) {
    const up = patrolmanUpper(r, lit, police);
    const arm = (s, b) => patrolmanArm(r, s, b, police);
    const leg = (s, kb) => patrolmanLeg(r, s, kb, police);
    let glowAt = null;
    if (pose === 0 || pose === 3) {
      // 0: slumped against a wall, hip at the wall, legs out toward -Z, chest back, head lolled
      // 3: sitting in the open, folded forward over its knees, arms dangling to the ground
      const back = pose === 0;
      const hip = { x: 0, y: 0.34, z: back ? 0.42 : 0 };
      const lean = back ? 0.32 : -0.62,
        loll = (r() - 0.5) * 0.7;
      const T = new X.Kit(39);
      T.include(up, {});
      T.include(arm(-1, 0.5 + r() * 0.6), {
        x: -0.42,
        y: 0.72,
        z: 0,
        rx: back ? 0.6 : -0.2,
        rz: -0.25,
      });
      T.include(arm(1, 0.2 + r() * 0.5), {
        x: 0.42,
        y: 0.72,
        z: 0,
        rx: back ? 0.15 + r() * 0.3 : -0.4,
        rz: 0.35,
      });
      k.include(T, { x: hip.x, y: hip.y, z: hip.z, rx: lean, rz: loll * 0.3 });
      for (const s of [-1, 1])
        k.include(leg(s, back ? 0.2 : 0.5), {
          x: s * 0.17,
          y: hip.y - 0.02,
          z: hip.z - 0.05,
          rx: PI / 2 - (back ? 0.28 : 0.55) - r() * 0.08,
          ry: s * (0.15 + r() * 0.2),
        });
      k.meta.collider = back
        ? { w: 0.95, d: 1.25, h: 1.3, cz: -0.1 }
        : { w: 0.95, d: 1.3, h: 1.05, cz: -0.35 };
      glowAt = back ? { x: 0, y: 1.3, z: 0.1 } : { x: 0, y: 0.95, z: -0.55 };
    } else if (pose === 2) {
      // kneeling on one knee, head bowed, one clamp on the ground: ran out of charge mid-stride
      const hip = { y: 0.62 };
      const T = new X.Kit(40);
      T.include(up, {});
      T.include(arm(-1, 0.3), { x: -0.42, y: 0.72, z: 0, rx: -0.5, rz: -0.12 });
      T.include(arm(1, 0.9), { x: 0.42, y: 0.72, z: 0, rx: 0.1, rz: 0.18 });
      k.include(T, { y: hip.y, rx: -0.38, rz: (r() - 0.5) * 0.15 });
      k.include(leg(-1, -1.82), { x: -0.17, y: hip.y, rx: 0.35 }); // knee on the pavement, shin back
      k.include(leg(1, -1.3), { x: 0.17, y: hip.y, rx: 1.3 }); // foot planted
      k.meta.collider = { w: 0.9, d: 1.3, h: 1.55, cz: -0.05 };
      glowAt = { x: 0, y: 1.5, z: -0.5 };
    } else {
      // face-down in the street: body along -Z from the hips, arms flung forward
      const hip = { x: 0, y: 0.3, z: 0.75 };
      const T = new X.Kit(41);
      T.include(up, {});
      T.include(arm(-1, 0.5 + r() * 0.6), {
        x: -0.42,
        y: 0.72,
        z: 0,
        rz: -2.6 - r() * 0.3,
        rx: 0.2,
      });
      T.include(arm(1, 0.2 + r() * 0.5), {
        x: 0.42,
        y: 0.72,
        z: 0,
        rz: 1.3,
        rx: 0.4,
      });
      k.include(T, {
        x: hip.x,
        y: hip.y,
        z: hip.z,
        rx: -PI / 2 + 0.06,
        rz: (r() - 0.5) * 0.2,
      });
      for (const s of [-1, 1])
        k.include(leg(s, -(0.1 + r() * 0.5)), {
          x: s * (0.18 + r() * 0.1),
          y: 0.18,
          z: hip.z + 0.05,
          rx: -(PI / 2 - 0.08),
          ry: s * r() * 0.3,
        });
      k.meta.collider = { w: 1.3, d: 2.1, h: 0.62, cz: 0.1 };
      oilPool(k, r, 0.1, 0.1, 0.75);
      glowAt = { x: 0, y: 0.3, z: -0.6 };
    }
    // a shell panel knocked off, a cracked visor strip on the ground
    k.box(
      "paint",
      0.34,
      0.02,
      0.26,
      0.55,
      0.012,
      -0.55,
      Object.assign({ ry: r() * 3 }, ptPaint(r, police)),
    );
    k.box("glass", 0.2, 0.012, 0.03, -0.5, 0.008, -0.7, {
      ry: r() * 3,
      color: 0x3a2a20,
    });
    if (pose !== 1 && r() < 0.6)
      oilPool(k, r, (r() - 0.5) * 0.4, pose === 0 ? 0.1 : -0.2, 0.45);
    if (lit)
      k.meta.glows = [
        {
          x: glowAt.x,
          y: glowAt.y,
          z: glowAt.z,
          color: 0xff7a30,
          size: 0.8,
          flicker: 0.85,
        },
      ];
    k.meta.container = {
      name: police ? "Police Patrolman" : "Patrolman",
      loot: "patrolman",
    };
    k.meta.interactY = 0.6;
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  }
  // ------------------------------------------------------------------
  // VALET household robot: a wheeled chassis, an upright appliance-enamel
  // body with chrome trim, two jointed arms with tray grippers and a wide
  // lamp-faced head on a neck post. Crashed on its side mid-errand.
  // ------------------------------------------------------------------
  function valet(k, r) {
    const enamel = {
      color: pick(r, [0x9ec4b4, 0xd8cdb0, 0xb8c8d0]),
      rust: 0.5,
      grime: 0.45,
    };
    const chrome = { color: C.chrome, rust: 0.35, grime: 0.3 };
    const dark = { color: 0x262624, rust: 0.4 };
    const H = new X.Kit(43);
    // chassis + four castor wheels
    H.cbox(
      "metal",
      0.56,
      0.14,
      0.48,
      0,
      0.13,
      0,
      Object.assign({ bevel: 0.03 }, dark),
    );
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        H.cyl("metal", 0.07, 0.07, 0.05, sx * 0.22, 0.07, sz * 0.18, {
          rz: PI / 2,
          seg: 10,
          color: 0x141412,
        });
    H.box("metal", 0.58, 0.03, 0.5, 0, 0.215, 0, chrome);
    // body: tapered appliance cabinet with a chrome belt and a front service hatch (sprung open)
    H.cbox(
      "metal",
      0.46,
      0.56,
      0.38,
      0,
      0.51,
      0,
      Object.assign({ bevel: 0.06 }, enamel),
    );
    H.box("metal", 0.48, 0.035, 0.4, 0, 0.62, 0, chrome);
    H.box("plain", 0.24, 0.2, 0.02, 0, 0.44, -0.19, { color: 0x121210 });
    H.box(
      "metal",
      0.24,
      0.2,
      0.02,
      0.12,
      0.44,
      -0.27,
      Object.assign({ ry: 0.9 }, enamel),
    );
    // neck post and a wide head with a round lamp face and a grille
    H.cyl("metal", 0.04, 0.05, 0.12, 0, 0.85, 0, { seg: 8, color: 0x3a3a36 });
    H.cbox(
      "metal",
      0.36,
      0.2,
      0.26,
      0,
      1.0,
      0,
      Object.assign({ bevel: 0.05 }, enamel),
    );
    H.cyl("glass", 0.06, 0.06, 0.03, -0.07, 1.01, -0.13, {
      rx: PI / 2,
      seg: 12,
      color: 0x3a3430,
    });
    H.torus("metal", 0.062, 0.008, -0.07, 1.01, -0.145, {
      rseg: 3,
      tseg: 12,
      color: C.chrome,
    });
    for (let i = 0; i < 3; i++)
      H.box("metal", 0.1, 0.008, 0.012, 0.08, 0.98 + i * 0.02, -0.132, {
        color: 0x2a2a28,
      });
    // two arms: one still on its shoulder holding the tray gripper, one torn off at the elbow
    const armAt = (s, torn) => {
      const sx = s * 0.26,
        sy = 0.74;
      H.cyl("metal", 0.045, 0.045, 0.06, sx, sy, 0, {
        rz: PI / 2,
        seg: 8,
        color: 0x2a2a28,
      });
      const ex = sx + s * 0.1,
        ey = sy - 0.24,
        ez = -0.12;
      H.seg("metal", [sx + s * 0.02, sy, 0], [ex, ey, ez], 0.026, chrome);
      if (torn) {
        H.seg(
          "metal",
          [ex, ey, ez],
          [ex + s * 0.03, ey - 0.06, ez - 0.04],
          0.012,
          { color: 0xb07a3a },
        );
        return;
      }
      const hx = ex,
        hy = ey + 0.04,
        hz = ez - 0.26;
      H.seg("metal", [ex, ey, ez], [hx, hy, hz], 0.024, chrome);
      for (const f of [-1, 1])
        H.box("metal", 0.012, 0.02, 0.1, hx + f * 0.035, hy, hz - 0.05, dark);
    };
    armAt(-1, false);
    armAt(1, true);
    k.include(H, { x: 0.55, y: 0.3, rz: PI / 2 - 0.1, ry: (r() - 0.5) * 0.3 });
    // the torn-off forearm and the tray it was carrying
    k.seg("metal", [-0.4, 0.03, -0.55], [-0.12, 0.03, -0.7], 0.024, chrome);
    k.cyl("metal", 0.18, 0.18, 0.012, 0.3, 0.008, -0.6, {
      seg: 14,
      color: 0xb8b4a8,
      rust: 0.4,
    });
    oilPool(k, r, 0.1, 0, 0.7);
    k.meta.collider = { w: 1.2, d: 0.8, h: 0.7 };
    k.meta.container = { name: "Valet", loot: "valet" };
    k.meta.interactY = 0.5;
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  }
  // v: 0 slumped (visor lit) · 1 face-down · 2 crashed Valet · 3 slumped (dark) · 4 kneeling (lit)
  //    5 sitting hunched (dark) · 6 police unit face-down · 7 police unit kneeling (lit)
  X.ROBOT_WRECK_VARIANTS = 8;
  D("robot_wreck", (k, r, v) => {
    v = v % 8;
    if (v === 2) {
      valet(k, r);
      return;
    }
    const pose = [0, 1, 0, 0, 2, 3, 1, 2][v];
    patrolman(k, r, pose, v === 0 || v === 4 || v === 7, v >= 6);
  });

  // ------------------------------------------------------------------
  // FOREVER FRANKS HOT-DOG CART. Length along x, printed side panels on
  // ±Z, two spoked wheels at +x, a folding leg at -x, push bar at -x.
  // ------------------------------------------------------------------
  function cartKit(r, withUmbrella) {
    const k = new X.Kit(51);
    const steel = { color: 0xc8c0aa, rust: 0.4, grime: 0.35 }; // warm, grimy stainless
    const bright = { color: 0xd8d2c0, rust: 0.3, grime: 0.3 };
    const red = { color: 0xa8261c, rust: 0.45, grime: 0.35 };
    const dark = { color: 0x2a2a28, rust: 0.4 };
    k.boxB("metal", 1.7, 0.72, 0.78, 0, 0.32, 0, steel);
    // printed livery panels fill the long sides; red end panels
    for (const s of [-1, 1])
      k.quad("cart_side", 1.66, 0.7, 0, 0.68, s * 0.396, {
        ry: s > 0 ? 0 : PI,
        grime: 0.12,
      });
    for (const s of [-1, 1])
      k.box("metal", 0.02, 0.66, 0.74, s * 0.855, 0.66, 0, red);
    k.boxB("metal", 1.78, 0.04, 0.86, 0, 1.04, 0, bright);
    k.box("metal", 1.8, 0.05, 0.03, 0, 1.06, -0.44, red);
    k.box("metal", 1.8, 0.05, 0.03, 0, 1.06, 0.44, red);
    // steam wells with lids (one lid off), condiment pumps, the glass sneeze guard, napkin dispensers
    for (let i = 0; i < 3; i++)
      k.cyl("metal", 0.14, 0.15, 0.06, -0.5 + i * 0.36, 1.1, 0.05, {
        seg: 12,
        color: 0xb8b2a0,
        rust: 0.4,
      });
    k.cyl("metal", 0.15, 0.15, 0.02, -0.14, 1.19, 0.2, {
      seg: 12,
      rx: 0.9,
      color: 0xb8b2a0,
      rust: 0.4,
    });
    k.cyl("metal", 0.03, 0.03, 0.14, -0.52, 1.25, 0.05, {
      seg: 6,
      color: 0x2a2a28,
    });
    for (let i = 0; i < 3; i++)
      k.cyl("plain", 0.045, 0.045, 0.2, 0.52 + i * 0.1, 1.16, -0.25, {
        seg: 7,
        color: [0xd8b020, 0xc02818, 0x3a7a2a][i],
      });
    for (const s of [-1, 1])
      k.seg(
        "metal",
        [0.05, 1.06, s * 0.36],
        [0.05, 1.42, s * 0.36],
        0.012,
        bright,
      );
    k.box("glass", 1.3, 0.02, 0.76, -0.2, 1.44, 0, { color: 0x6a7a78 });
    k.box("glass", 1.3, 0.34, 0.015, -0.2, 1.26, -0.38, {
      rx: -0.12,
      color: 0x5a6a68,
    });
    for (const x of [0.68, -0.8]) {
      k.boxB("metal", 0.14, 0.16, 0.1, x, 1.06, 0.3, {
        color: 0xd0ccc0,
        rust: 0.3,
      });
      k.box("fabric", 0.1, 0.03, 0.01, x, 1.2, 0.35, { color: 0xe8e4d8 });
    }
    // wheels (+x end) and fold-down leg (-x end)
    for (const s of [-1, 1]) {
      k.torus("metal", 0.26, 0.03, 0.6, 0.28, s * 0.45, {
        rseg: 4,
        tseg: 14,
        color: 0x1c1c1a,
        rust: 0.5,
      });
      for (let i = 0; i < 6; i++) {
        const a = (i * PI) / 3;
        k.seg(
          "metal",
          [0.6, 0.28, s * 0.45],
          [0.6 + Math.cos(a) * 0.25, 0.28 + Math.sin(a) * 0.25, s * 0.45],
          0.008,
          dark,
        );
      }
      k.seg("metal", [-0.72, 0.33, s * 0.3], [-0.76, 0, s * 0.33], 0.025, dark);
    }
    k.cyl("metal", 0.03, 0.03, 0.95, 0.6, 0.28, 0, {
      rx: PI / 2,
      seg: 6,
      color: 0x2a2a28,
    });
    // push bar
    for (const s of [-1, 1])
      k.seg(
        "metal",
        [-0.85, 0.9, s * 0.3],
        [-1.12, 1.02, s * 0.3],
        0.02,
        steel,
      );
    k.seg("metal", [-1.12, 1.02, -0.32], [-1.12, 1.02, 0.32], 0.022, dark);
    if (withUmbrella) umbrella(k, r, 0.05, 1.08, 0.02, 0.1);
    return k;
  }
  /** "FOREVER FRANKS 10¢" menu board on its own pole (clamped to the cart, or lying in the street). */
  function menuBoard(k, x, y, z, o) {
    const B = new X.Kit(57);
    B.seg("metal", [0, 0, 0], [0, 0.9, 0], 0.018, {
      color: 0xb8b2a0,
      rust: 0.5,
    });
    B.box("metal", 0.98, 0.34, 0.03, 0, 1.05, 0, {
      color: 0x7a1a14,
      rust: 0.5,
    });
    for (const s of [-1, 1])
      B.quad("cart_menu", 0.94, 0.31, 0, 1.05, s * 0.017, {
        mat: "trim",
        ry: s > 0 ? 0 : PI,
        grime: 0.2,
      });
    k.include(B, Object.assign({ x, y, z }, o || {}));
  }
  function umbrella(k, r, x, y, z, tilt) {
    const U = new X.Kit(53);
    U.cyl("metal", 0.018, 0.018, 1.25, 0, 0.62, 0, {
      seg: 6,
      color: 0xb8b8ae,
      rust: 0.5,
    });
    const panels = 8,
      R = 1.05,
      torn = (r() * panels) | 0;
    for (let i = 0; i < panels; i++) {
      if (i === torn) continue; // one panel ripped away
      const col = i % 2 ? 0xd8ceb4 : 0xa82a1e;
      U.cyl(
        "fabric",
        0.02,
        R * (i === (torn + 3) % panels ? 0.78 : 1),
        0.34,
        0,
        1.36,
        0,
        {
          seg: 3,
          thetaStart: (i * X.TAU) / panels,
          thetaLength: X.TAU / panels,
          open: true,
          color: col,
          grime: 0.55,
        },
      );
      U.seg(
        "metal",
        [0, 1.52, 0],
        [
          Math.sin((i * X.TAU) / panels) * R * 0.98,
          1.2,
          Math.cos((i * X.TAU) / panels) * R * 0.98,
        ],
        0.008,
        { color: 0x3a3a36 },
      );
    }
    k.include(U, { x, y, z, rz: tilt, rx: tilt * 0.4 });
  }
  D("food_cart", (k, r, v) => {
    v = v % 2;
    if (v === 0) {
      k.include(cartKit(r, true), {});
      menuBoard(k, -0.78, 1.06, -0.3, { ry: PI / 2 + 0.1, rz: 0.05 });
      k.meta.collider = { w: 2.0, d: 0.9, h: 1.1 };
    } else {
      // tipped onto its side (printed panel up), the umbrella still open and propped against it, buns & cans spilled
      k.include(cartKit(r, false), { y: 0.43, z: 0.35, rx: PI / 2 - 0.04 });
      const U = new X.Kit(55);
      umbrella(U, r, 0, 0, 0, 0);
      k.include(U, { x: 0.5, y: 0.02, z: -1.6, rx: 0.75, ry: 0.25 });
      menuBoard(k, -1.3, 0.03, -1.1, { rz: PI / 2 - 0.05, ry: 0.4 });
      for (let i = 0; i < 7; i++)
        k.cyl(
          "plain",
          0.04,
          0.04,
          0.11,
          (r() - 0.5) * 1.8,
          0.04,
          -0.4 - r() * 0.8,
          {
            rz: PI / 2,
            ry: r() * 6,
            seg: 6,
            color: pick(r, [0xc0a020, 0xb02018, 0x7a6a5a, 0x3a6a2a]),
            rust: 0.5,
          },
        );
      for (let i = 0; i < 4; i++)
        k.box(
          "fabric",
          0.16,
          0.01,
          0.12,
          (r() - 0.5) * 1.6,
          0.01,
          -0.5 - r() * 1.0,
          { ry: r() * 6, color: 0xe0dcd0, grime: 0.6 },
        ); // napkins
      k.meta.collider = { w: 1.9, d: 1.2, h: 0.85, cz: 0.85 };
    }
    k.meta.container = { name: "Forever Franks Cart", loot: "cooler" };
    k.meta.interactY = 0.8;
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  });

  // ------------------------------------------------------------------
  // NYC CORNER NEWSSTAND. 3.0 × 1.6 × 2.5 m, green-painted steel. The
  // front (-Z) is the serving window: v0 shutter down + padlock, v1 open
  // with the counter, magazine racks and bundled papers.
  // ------------------------------------------------------------------
  D("newsstand", (k, r, v) => {
    v = v % 2;
    const green = {
      color: pick(r, [0x3e6e4a, 0x44744e, 0x386646]),
      rust: 0.45,
      grime: 0.38,
    };
    const dark = { color: 0x1c1c1a, rust: 0.3 };
    const W = 3.0,
      Dp = 1.6,
      H = 2.45;
    // shell: back, sides, roof with overhang, base kick plate
    k.boxB("metal", W, H, 0.06, 0, 0, Dp / 2 - 0.03, green);
    for (const s of [-1, 1])
      k.boxB("metal", 0.06, H, Dp, s * (W / 2 - 0.03), 0, 0, green);
    k.boxB(
      "metal",
      W + 0.3,
      0.1,
      Dp + 0.45,
      0,
      H,
      -0.12,
      Object.assign({}, green, { color: 0x2e5038 }),
    );
    k.boxB("metal", W, 0.18, 0.06, 0, 0, -Dp / 2 + 0.03, dark);
    // sign band front + both sides
    k.quad("newsstand_sign", W + 0.2, 0.28, 0, H - 0.08, -Dp / 2 - 0.365, {
      ry: PI,
      mat: "trim",
    });
    k.boxB("metal", W + 0.3, 0.34, 0.04, 0, H - 0.25, -Dp / 2 - 0.34, {
      color: 0x2e5038,
      rust: 0.45,
    });
    // pasted-up posters on the back (the side facing the street traffic), a roof lip
    for (let i = 0; i < 2; i++)
      k.quad(
        pick(r, X.POSTERS || ["poster_fizzo"]),
        0.62,
        0.9,
        -0.75 + i * 1.3 + (r() - 0.5) * 0.2,
        1.35 + (r() - 0.5) * 0.15,
        Dp / 2 + 0.005,
        { rz: (r() - 0.5) * 0.1, grime: 0.35 },
      );
    k.box("metal", W + 0.34, 0.05, 0.06, 0, H + 0.12, -Dp / 2 - 0.36, {
      color: 0x1a2a20,
      rust: 0.6,
    });
    // corner angle posts, a riveted kick plate all round, a louvred vent on each side, roof-edge drip strip
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.box(
          "metal",
          0.07,
          H,
          0.07,
          sx * (W / 2 - 0.01),
          H / 2,
          sz * (Dp / 2 - 0.01),
          { color: 0x2a4a34, rust: 0.55, grime: 0.4 },
        );
    for (const sx of [-1, 1]) {
      k.box("metal", 0.02, 0.2, Dp - 0.1, sx * (W / 2 + 0.02), 0.12, 0, {
        color: 0x3a3a34,
        rust: 0.7,
      });
      for (let i = 0; i < 5; i++)
        k.box(
          "metal",
          0.03,
          0.02,
          0.36,
          sx * (W / 2 + 0.035),
          2.0 + i * 0.05,
          -0.45,
          { color: 0x1e2e22, rust: 0.4 },
        );
    }
    k.box("metal", W, 0.2, 0.02, 0, 0.12, Dp / 2 + 0.02, {
      color: 0x3a3a34,
      rust: 0.7,
    });
    for (let i = 0; i < 9; i++)
      k.sphere(
        "metal",
        0.012,
        -W / 2 + 0.15 + (i * (W - 0.3)) / 8,
        0.2,
        Dp / 2 + 0.035,
        { wseg: 4, hseg: 3, color: 0x5a5a50 },
      );
    k.box("metal", W + 0.34, 0.05, 0.05, 0, H + 0.02, Dp / 2 + 0.12, {
      color: 0x1a2a20,
      rust: 0.6,
    });
    // magazine racks on the sides (outside, the way they hung them)
    for (const s of [-1, 1]) {
      k.quad("mag_rack", 1.2, 0.75, s * (W / 2 + 0.035), 1.25, 0.05, {
        ry: (s * PI) / 2,
        mat: "trim",
        grime: 0.3,
      });
      for (let i = 0; i < 3; i++)
        k.box(
          "metal",
          0.04,
          0.02,
          1.25,
          s * (W / 2 + 0.07),
          0.95 + i * 0.25,
          0.05,
          dark,
        );
    }
    if (v === 0) {
      // shutter down and wired shut (a twist of wire through the hasp; nobody got in)
      k.quad("shutter", W - 0.14, 1.9, 0, 1.45, -Dp / 2 + 0.02, {
        ry: PI,
        mat: "trim",
        grime: 0.2,
      });
      k.boxB("metal", W - 0.1, 0.34, 0.06, 0, 0.12, -Dp / 2 + 0.03, green);
      k.box("metal", 0.08, 0.1, 0.04, 0.2, 0.55, -Dp / 2 - 0.03, {
        color: 0x8a7a3a,
        rust: 0.6,
      });
      k.torus("metal", 0.03, 0.006, 0.2, 0.6, -Dp / 2 - 0.02, {
        rseg: 3,
        tseg: 8,
        color: 0x8a8a80,
      });
      k.meta.container = {
        name: "Newsstand",
        loot: "props_newsstand_shut",
        defLoot: "newspaper_box",
      };
    } else {
      // serving counter + magazine shelves inside, the shutter jammed half-up
      k.boxB("metal", W - 0.12, 0.95, 0.4, 0, 0, -Dp / 2 + 0.24, green);
      k.boxB("wood", W - 0.1, 0.05, 0.5, 0, 0.95, -Dp / 2 + 0.22, {
        color: 0x5a4a38,
        grime: 0.5,
      });
      k.quad("shutter", W - 0.14, 0.4, 0, H - 0.4, -Dp / 2 + 0.02, {
        ry: PI,
        mat: "trim",
        grime: 0.2,
      });
      k.box("plain", W - 0.14, 1.0, 0.02, 0, 1.5, Dp / 2 - 0.08, {
        color: 0x151513,
        ao: [1, 1],
      }); // dark interior
      k.quad("mag_rack", W - 0.3, 0.9, 0, 1.55, Dp / 2 - 0.1, {
        ry: PI,
        mat: "trim",
        grime: 0.4,
      });
      // stacks of bundled newspapers, some spilled on the counter & pavement
      for (let i = 0; i < 4; i++)
        k.boxB(
          "fabric",
          0.42,
          0.18 + r() * 0.12,
          0.3,
          -1.0 + i * 0.62,
          1.0,
          -Dp / 2 + 0.24,
          {
            ry: (r() - 0.5) * 0.3,
            color: pick(r, [0xb8b098, 0xa8a088, 0xc4bca4]),
            grime: 0.6,
          },
        );
      for (let i = 0; i < 5; i++)
        k.box(
          "fabric",
          0.34,
          0.01,
          0.26,
          (r() - 0.5) * 2.4,
          0.012,
          -Dp / 2 - 0.4 - r() * 0.7,
          { ry: r() * 6, color: 0xb0a890, grime: 0.6 },
        );
      k.meta.container = {
        name: "Newsstand",
        loot: "props_newsstand",
        defLoot: "newspaper_box",
      };
    }
    k.meta.collider = { w: W, d: Dp, h: H };
    k.meta.interactY = 1.0;
    k.meta.surface = "metal";
    k.meta.tier = "large";
  });

  // ------------------------------------------------------------------
  // FDNY FIRE-ALARM CALL BOX: fluted red post, box head, globe lamp.
  // ------------------------------------------------------------------
  D("call_box", (k, r, v) => {
    const red = { color: C.hydrantRed, rust: 0.5 + r() * 0.2, grime: 0.35 };
    const B = new X.Kit(61);
    B.cyl(
      "metal",
      0.16,
      0.2,
      0.12,
      0,
      0.06,
      0,
      Object.assign({ seg: 10 }, red),
    );
    B.cyl(
      "metal",
      0.07,
      0.09,
      1.05,
      0,
      0.63,
      0,
      Object.assign({ seg: 8 }, red),
    );
    for (let i = 0; i < 3; i++)
      B.torus("metal", 0.085, 0.015, 0, 0.3 + i * 0.32, 0, {
        rx: PI / 2,
        rseg: 4,
        tseg: 10,
        color: C.hydrantRed,
        rust: 0.6,
      });
    B.cbox(
      "metal",
      0.3,
      0.42,
      0.22,
      0,
      1.36,
      0,
      Object.assign({ bevel: 0.03 }, red),
    );
    B.quad("fire_alarm", 0.2, 0.3, 0, 1.36, -0.115, { ry: PI, grime: 0.25 });
    B.cyl(
      "metal",
      0.14,
      0.12,
      0.06,
      0,
      1.6,
      0,
      Object.assign({ seg: 10 }, red),
    );
    B.sphere("glass", 0.12, 0, 1.72, 0, {
      wseg: 10,
      hseg: 7,
      color: v === 1 ? 0x6a2a20 : 0xb04030,
    });
    B.cyl("metal", 0.03, 0.05, 0.08, 0, 1.86, 0, { seg: 8, color: 0x2a1a14 });
    if (v === 1) {
      k.include(B, { y: 0.12, z: 0.95, rx: -PI / 2 + 0.06 });
      k.box("concrete", 0.3, 0.06, 0.3, 0, 0.03, 0.95, {
        color: 0x6a6a64,
        rx: 0.2,
      }); // torn-up footing
      k.meta.collider = { w: 0.4, d: 1.9, h: 0.35, cz: 0 };
    } else {
      k.include(B, {});
      k.meta.collider = { w: 0.35, d: 0.35, h: 1.9 };
    }
    k.meta.surface = "metal";
    k.meta.tier = "small";
  });

  // ------------------------------------------------------------------
  // BODY BAGS & the ARMY TRIAGE TENT they came out of.
  // ------------------------------------------------------------------
  function bodyBag(k, r, x, y, z, ry, open) {
    const col = pick(r, [0x3e4230, 0x353a2a, 0x2a2a26]);
    const b = { color: col, grime: 0.5, ao: [0.7, 0.3] };
    k.cbox(
      "fabric",
      0.55,
      0.2,
      1.8,
      x,
      y + 0.1,
      z,
      Object.assign({ ry, bevel: 0.09 }, b),
    );
    const c = Math.cos(ry),
      s = Math.sin(ry);
    // head bump + zipper line + toe tag
    k.sphere(
      "fabric",
      0.17,
      x - s * 0.72,
      y + 0.14,
      z - c * 0.72,
      Object.assign({ wseg: 7, hseg: 5, s: [1.1, 0.7, 1] }, b),
    );
    k.box(
      "metal",
      0.02,
      0.012,
      open ? 0.9 : 1.6,
      x + c * 0.08 + s * (open ? -0.35 : 0),
      y + 0.205,
      z - s * 0.08 + c * (open ? -0.35 : 0),
      { ry, color: 0x8a8a80 },
    );
    k.quad("toe_tag", 0.1, 0.05, x + s * 0.95, y + 0.1, z + c * 0.95, {
      ry: ry + PI / 2,
      rx: -0.4,
    });
    if (open) {
      // flap folded back: a skull and ribs show
      k.box(
        "fabric",
        0.3,
        0.02,
        0.8,
        x + c * 0.3 - s * 0.35,
        y + 0.13,
        z - s * 0.3 - c * 0.35,
        { ry, rz: 0.5, color: col, grime: 0.5 },
      );
      k.sphere("plain", 0.1, x - s * 0.62, y + 0.2, z - c * 0.62, {
        wseg: 8,
        hseg: 6,
        s: [1, 0.9, 1.15],
        color: C.bone,
      });
      for (let i = 0; i < 4; i++)
        k.torus(
          "plain",
          0.12,
          0.012,
          x - s * (0.35 - i * 0.08),
          y + 0.19,
          z - c * (0.35 - i * 0.08),
          { ry, arc: PI, rseg: 3, tseg: 8, color: C.bone },
        );
    }
  }
  D("body_bag", (k, r, v) => {
    v = v % 3;
    if (v === 2) {
      for (let i = 0; i < 3; i++)
        bodyBag(
          k,
          r,
          (i - 1) * 0.7,
          0,
          (r() - 0.5) * 0.25,
          (r() - 0.5) * 0.12,
          i === 1 && r() < 0.5,
        );
      k.meta.collider = { w: 2.1, d: 1.9, h: 0.25 };
    } else {
      bodyBag(k, r, 0, 0, 0, 0, v === 1);
      k.meta.collider = { w: 0.6, d: 1.9, h: 0.25 };
    }
    k.meta.surface = "fabric";
    k.meta.tier = "small";
  });

  function cot(k, r, x, z, ry, bag) {
    const S = new X.Kit(71);
    const fr = { color: 0x3e4430, rust: 0.5 };
    for (const s of [-1, 1])
      S.box("metal", 0.03, 0.03, 1.9, s * 0.33, 0.42, 0, fr);
    for (const e of [-0.9, 0.9])
      for (const s of [-1, 1])
        S.seg(
          "metal",
          [s * 0.33, 0.42, e],
          [s * 0.3, 0, e + (e > 0 ? -0.08 : 0.08)],
          0.015,
          fr,
        );
    S.box("fabric", 0.64, 0.02, 1.8, 0, 0.42, 0, {
      color: 0x6a6a4e,
      grime: 0.55,
    });
    if (bag) bodyBag(S, r, 0, 0.43, 0, 0, bag === 2);
    else
      S.box("fabric", 0.6, 0.06, 0.9, 0.02, 0.46, 0.35, {
        ry: 0.2,
        color: 0x5a4a3a,
        grime: 0.6,
      }); // a rumpled blanket
    k.include(S, { x, z, ry });
  }
  D("triage_tent", (k, r, v) => {
    const W = 4.2,
      L = 5.0,
      Hw = 1.55,
      Hr = 2.65;
    const can = {
      color: pick(r, [0x5a5c40, 0x55583c, 0x606246]),
      grime: 0.55,
      ao: [0.7, 1.4],
    };
    const pole = { color: 0x3a3a30, rust: 0.6 };
    // roof: two sloped planes from the eaves to the ridge
    const slope = Math.atan2(Hr - Hw, W / 2),
      rl = Math.hypot(Hr - Hw, W / 2);
    for (const s of [-1, 1]) {
      k.box(
        "fabric",
        rl + 0.12,
        0.03,
        L + 0.3,
        (s * W) / 4,
        (Hr + Hw) / 2,
        0,
        Object.assign({ rz: -s * slope }, can),
      );
      k.boxB("fabric", 0.03, Hw, L, (s * W) / 2, 0, 0, can);
      k.quad("red_cross", 0.9, 0.9, s * (W / 2 + 0.02), Hw * 0.55, 0.4, {
        ry: (s * PI) / 2,
        grime: 0.3,
        mat: "trim",
      });
    }
    // roof red crosses (flat on the slopes)
    for (const s of [-1, 1]) {
      const g = new X.Kit(73);
      g.quad("red_cross", 1.1, 1.1, 0, 0.02, 0, {
        rx: -PI / 2,
        mat: "trim",
        grime: 0.3,
      });
      k.include(g, {
        x: (s * W) / 4,
        y: (Hr + Hw) / 2,
        z: -0.6,
        rz: -s * slope,
      });
    }
    // back wall with gable, front gable; the front is open, flaps rolled up (one torn and hanging)
    k.boxB("fabric", W, Hw, 0.03, 0, 0, L / 2, can);
    for (const zz of [L / 2, -L / 2])
      k.extrude(
        "fabric",
        [
          [-W / 2, Hw],
          [W / 2, Hw],
          [0, Hr],
        ],
        0.03,
        Object.assign({ z: zz }, can),
      );
    k.quad("red_cross", 0.6, 0.6, 0, Hw + 0.4, -L / 2 - 0.02, {
      ry: PI,
      mat: "trim",
      grime: 0.3,
    });
    for (const s of [-1, 1])
      k.cyl(
        "fabric",
        0.1,
        0.1,
        1.2,
        s * (W / 2 - 0.65),
        Hw - 0.05,
        -L / 2 - 0.05,
        { rz: PI / 2, seg: 7, color: can.color, grime: 0.6 },
      );
    k.box("fabric", 0.9, 1.2, 0.02, W / 2 - 0.55, Hw - 0.6, -L / 2 - 0.08, {
      rz: 0.2,
      rx: 0.12,
      color: can.color,
      grime: 0.6,
    });
    // poles, ridge, guy ropes & stakes
    for (const zz of [-L / 2, 0, L / 2])
      k.seg("metal", [0, 0, zz], [0, Hr, zz], 0.035, pole);
    k.seg("metal", [0, Hr, -L / 2 - 0.1], [0, Hr, L / 2 + 0.1], 0.03, pole);
    // guy lines can't be staked into asphalt: short lines down to sandbag weights hugging the walls
    for (const s of [-1, 1])
      for (const zz of [-L / 2 + 0.3, 0, L / 2 - 0.3]) {
        k.seg(
          "fabric",
          [(s * W) / 2, Hw, zz],
          [s * (W / 2 + 0.42), 0.18, zz],
          0.008,
          { color: 0x8a7a5a },
        );
        k.sphere("fabric", 0.2, s * (W / 2 + 0.45), 0.09, zz, {
          s: [0.9, 0.5, 1.3],
          color: 0x8a7a58,
          wseg: 7,
          hseg: 4,
          grime: 0.45,
        });
      }
    // inside: three cots (two bagged), an IV stand, a medical footlocker, a bucket
    cot(k, r, -1.2, 0.6, 0.02, 1);
    cot(k, r, 0.25, 0.9, -0.05, v === 1 ? 2 : 1);
    cot(k, r, 1.45, 0.4, 0.08, 0);
    bodyBag(k, r, -1.1, 0, -1.6, PI / 2 + (r() - 0.5) * 0.2, false);
    k.seg("metal", [0.9, 0, -0.4], [0.9, 1.7, -0.4], 0.012, {
      color: 0x9a9a90,
    });
    k.seg("metal", [0.75, 1.65, -0.4], [1.05, 1.65, -0.4], 0.01, {
      color: 0x9a9a90,
    });
    k.cbox("glass", 0.1, 0.16, 0.04, 0.8, 1.52, -0.4, {
      color: 0x8a9a8a,
      bevel: 0.02,
    });
    for (let i = 0; i < 3; i++) {
      const a = (i * X.TAU) / 3;
      k.seg(
        "metal",
        [0.9, 0.05, -0.4],
        [0.9 + Math.cos(a) * 0.25, 0, -0.4 + Math.sin(a) * 0.25],
        0.01,
        { color: 0x9a9a90 },
      );
    }
    k.cyl("metal", 0.14, 0.11, 0.26, 1.6, 0.13, -1.5, {
      seg: 10,
      color: 0x6a6a60,
      rust: 0.7,
      open: false,
    });
    k.meta.colliders = [
      { w: 0.12, d: L, h: Hw, cx: -W / 2 },
      { w: 0.12, d: L, h: Hw, cx: W / 2 },
      { w: W, d: 0.12, h: Hw, cz: L / 2 },
      { w: 0.8, d: 1.9, h: 0.5, cx: -1.2, cz: 0.6 },
      { w: 0.8, d: 1.9, h: 0.5, cx: 0.25, cz: 0.9 },
      { w: 0.8, d: 1.9, h: 0.5, cx: 1.45, cz: 0.4 },
    ];
    k.meta.surface = "fabric";
    k.meta.tier = "large";
  });
  // ------------------------------------------------------------------
  // SIDEWALK SOUVENIR VENDOR: a folding table under a sun-rotted cloth,
  // little Unisphere globes and World's Fair medallion cards, green Statues
  // of Liberty, a board of knock-off watches, sunglasses on a spinner, a cardboard "$1" sign, a lawn
  // chair and the vendor's stock boxes. v1: table collapsed, stock spilled.
  // Front (-Z) = the customer side (the walkway).
  // ------------------------------------------------------------------
  D("vendor_table", (k, r, v) => {
    v = v % 2;
    const T = new X.Kit(81);
    const legs = { color: 0x3a3a36, rust: 0.6 };
    T.boxB("wood", 1.8, 0.04, 0.75, 0, 0.72, 0, {
      color: 0x6a5a44,
      grime: 0.5,
    });
    for (const s of [-1, 1]) {
      T.seg("metal", [s * 0.8, 0.72, -0.33], [s * 0.8, 0, 0.33], 0.014, legs);
      T.seg("metal", [s * 0.8, 0.72, 0.33], [s * 0.8, 0, -0.33], 0.014, legs);
    }
    const cloth = pick(r, [0x2a4a7a, 0x7a2a2a, 0x3a5a3a]);
    T.boxB("fabric", 1.86, 0.02, 0.8, 0, 0.76, 0, { color: cloth, grime: 0.6 });
    T.box("fabric", 1.86, 0.4, 0.02, 0, 0.58, -0.41, {
      color: cloth,
      grime: 0.6,
      rx: 0.03,
    }); // skirt toward the customer
    // 1964 World's Fair souvenirs: steel Unisphere globes on tripod stands, bronze medallions on cards,
    // Statues of Liberty, a watch board, sunglasses spinner
    for (let i = 0; i < 6; i++) {
      const x = -0.75 + (i % 3) * 0.14,
        z = -0.2 + ((i / 3) | 0) * 0.16;
      if (i % 2 === 0) {
        T.cyl("plain", 0.04, 0.045, 0.02, x, 0.79, z, {
          seg: 8,
          color: 0x1a1a18,
        });
        T.cyl("metal", 0.006, 0.006, 0.05, x, 0.82, z, {
          seg: 4,
          color: 0x8a8a84,
        });
        T.sphere("metal", 0.045, x, 0.89, z, {
          wseg: 8,
          hseg: 6,
          color: 0xb8bcc0,
          rust: 0.2,
        });
        T.torus("metal", 0.052, 0.004, x, 0.89, z, {
          rx: PI / 2 - 0.4,
          rseg: 3,
          tseg: 12,
          color: 0x9a9c9e,
        });
      } else {
        T.box("fabric", 0.09, 0.12, 0.005, x, 0.83, z, {
          rx: -0.3,
          color: 0x1a3a6a,
        });
        T.cyl("metal", 0.03, 0.03, 0.006, x, 0.84, z - 0.01, {
          rx: PI / 2 - 0.3,
          seg: 10,
          color: 0xa87a3a,
          rust: 0.3,
        });
      }
    }
    for (let i = 0; i < 5; i++) {
      const x = -0.25 + i * 0.1,
        z = -0.15 + (i % 2) * 0.12,
        col = { color: 0x5a8a78, rust: 0.2, grime: 0.4 };
      T.cyl(
        "metal",
        0.025,
        0.03,
        0.03,
        x,
        0.795,
        z,
        Object.assign({ seg: 6 }, col),
      );
      T.cyl(
        "metal",
        0.012,
        0.022,
        0.16,
        x,
        0.89,
        z,
        Object.assign({ seg: 6 }, col),
      );
      T.seg("metal", [x + 0.012, 0.95, z], [x + 0.02, 1.02, z], 0.005, col);
    }
    T.box("fabric", 0.5, 0.36, 0.02, 0.5, 0.97, 0.18, {
      rx: -0.35,
      color: 0x141414,
      grime: 0.3,
    });
    for (let i = 0; i < 12; i++)
      T.cyl(
        "metal",
        0.018,
        0.018,
        0.01,
        0.34 + (i % 4) * 0.1,
        0.9 + ((i / 4) | 0) * 0.09,
        0.14 - ((i / 4) | 0) * 0.03,
        { rx: PI / 2 - 0.35, seg: 8, color: 0xc8b060, rust: 0.3 },
      );
    T.seg("metal", [0.82, 0.78, -0.18], [0.82, 1.2, -0.18], 0.01, legs);
    for (let i = 0; i < 4; i++) {
      const a = (i * PI) / 2;
      T.box(
        "plain",
        0.1,
        0.03,
        0.02,
        0.82 + Math.cos(a) * 0.06,
        0.95 + (i % 2) * 0.12,
        -0.18 + Math.sin(a) * 0.06,
        { ry: -a, color: 0x101010 },
      );
    }
    // cardboard "$1 ANY ITEM" sign (plain card with a red stripe; the hand-lettered plank sign reads too scavenged)
    T.box("fabric", 0.42, 0.28, 0.01, -0.45, 0.93, 0.3, {
      rx: -0.2,
      color: 0xb89a6a,
      grime: 0.5,
    });
    T.box("fabric", 0.36, 0.05, 0.012, -0.45, 0.97, 0.296, {
      rx: -0.2,
      color: 0xa02018,
    });
    if (v === 0) k.include(T, {});
    else k.include(T, { y: 0.35, z: 0.1, rx: 0.5, rz: 0.12 }); // legs folded under one end
    // stock boxes & a lawn chair behind the table (vendor side, +Z)
    for (let i = 0; i < 2 + v; i++)
      k.boxB(
        "fabric",
        0.5,
        0.35,
        0.4,
        -0.5 + i * 0.55,
        0,
        0.75 + (r() - 0.5) * 0.1,
        { ry: (r() - 0.5) * 0.4, color: 0x9a7e56, grime: 0.55 },
      );
    const ch = new X.Kit(83),
      fr = { color: 0xa8a8a0, rust: 0.5 };
    for (const s of [-1, 1]) {
      ch.seg("metal", [s * 0.25, 0, -0.25], [s * 0.25, 0.42, 0.05], 0.012, fr);
      ch.seg("metal", [s * 0.25, 0, 0.2], [s * 0.25, 0.8, 0.3], 0.012, fr);
    }
    for (let i = 0; i < 4; i++)
      ch.box("fabric", 0.5, 0.012, 0.06, 0, 0.42, -0.2 + i * 0.08, {
        color: i % 2 ? 0x2a6a4a : 0xd8d0b0,
        grime: 0.5,
      });
    for (let i = 0; i < 5; i++)
      ch.box("fabric", 0.5, 0.06, 0.012, 0, 0.47 + i * 0.07, 0.07 + i * 0.045, {
        rx: -0.45,
        color: i % 2 ? 0x2a6a4a : 0xd8d0b0,
        grime: 0.5,
      });
    k.include(ch, { x: 0.55, z: 1.0, ry: PI + (r() - 0.5) * 0.4 });
    if (v === 1)
      for (let i = 0; i < 6; i++)
        k.sphere("metal", 0.045, (r() - 0.5) * 1.8, 0.045, -0.5 - r() * 0.6, {
          wseg: 6,
          hseg: 5,
          color: 0xb8bcc0,
          rust: 0.3,
        });
    k.meta.collider = { w: 1.9, d: 0.8, h: 0.8 };
    k.meta.container = {
      name: "Souvenir Stand",
      loot: "props_vendor",
      defLoot: "junk_common",
    };
    k.meta.interactY = 0.85;
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });
})();
