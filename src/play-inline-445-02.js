// play-inline-445 02 — include
// Lines 284-556 of readable/play-inline-445.pretty.js (statement-aligned).
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
