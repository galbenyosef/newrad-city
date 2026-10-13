// play-inline-480 03 — box
// Lines 1103-1330 of readable/play-inline-480.pretty.js (statement-aligned).
  function shade(hex, f) {
    const c = new THREE.Color(hex);
    c.multiplyScalar(f);
    return c.getHex();
  }
  /** style: 'coverall' | 'suit' | 'robe' | 'dress' | 'coat' | 'rags' | 'hazmat' */
  function garment(k, color, trim, style) {
    const T = 0.03,
      dk = shade(color, 0.78);
    const puffy = style === "hazmat" ? 1.25 : 1;
    // torso panel + chest wrinkle
    k.box(0.34 * puffy, T * puffy, 0.36, color, 0, (T * puffy) / 2, -0.08);
    k.sph(0.12, dk, -0.06, T * 0.6, -0.12, 1.1, 0.12, 0.8, 8);
    // collar & shoulders
    k.box(0.15, T + 0.012, 0.05, trim, 0, T / 2 + 0.006, -0.27);
    // sleeves splayed outward, with cuffs
    for (const sx of [-1, 1]) {
      k.box(
        0.09 * puffy,
        T * 0.9 * puffy,
        0.3,
        color,
        sx * 0.235,
        T * 0.45 * puffy,
        -0.1,
        sx * 0.55,
      );
      k.box(
        0.095 * puffy,
        T * puffy + 0.004,
        0.035,
        style === "suit" ? 0xe8e4dc : trim,
        sx * 0.315,
        T * 0.5 * puffy + 0.002,
        0.03,
        sx * 0.55,
      );
    }
    // lower half
    if (style === "robe" || style === "coat") {
      k.box(0.38, T, 0.4, color, 0, T / 2, 0.29);
      k.box(0.012, T + 0.004, 0.72, trim, 0, T / 2 + 0.002, 0.1); // front seam / buttons
      k.sph(0.1, dk, 0.08, T * 0.6, 0.35, 1.3, 0.12, 0.9, 8);
    } else if (style === "dress") {
      k.sph(0.5, color, 0, T * 0.6, 0.3, 0.44, 0.07, 0.42, 12); // flared skirt lying flat
      k.sph(0.5, dk, 0.04, T * 0.9, 0.34, 0.2, 0.05, 0.3, 8); // fold
      k.box(0.3, T + 0.006, 0.03, trim, 0, T / 2 + 0.004, 0.1);
    } else {
      // two trouser legs, slightly apart; boots/cuffs at the ends
      for (const sx of [-1, 1]) {
        k.box(
          0.14 * puffy,
          T * puffy,
          0.44,
          style === "suit" ? dk : color,
          sx * 0.085,
          (T * puffy) / 2,
          0.32,
          sx * 0.05,
        );
        k.box(
          0.145 * puffy,
          T * puffy + 0.01,
          0.07,
          style === "coverall" || style === "hazmat"
            ? 0x2a2a2a
            : shade(color, 0.6),
          sx * 0.095,
          (T * puffy) / 2 + 0.006,
          0.52,
          sx * 0.05,
        );
      }
      k.box(
        0.35 * puffy,
        T * puffy + 0.008,
        0.04,
        style === "coverall" ? trim : 0x2a2018,
        0,
        (T * puffy) / 2 + 0.004,
        0.1,
      ); // belt
    }
    if (style === "coverall" || style === "hazmat")
      k.box(
        0.02,
        T * puffy + 0.006,
        0.34,
        trim,
        0,
        (T * puffy) / 2 + 0.003,
        -0.08,
      ); // zip stripe
    if (style === "suit") {
      k.box(0.05, T + 0.008, 0.2, 0xe8e4dc, 0, T / 2 + 0.004, -0.16);
      k.box(0.02, T + 0.012, 0.16, trim, 0, T / 2 + 0.008, -0.14);
    } // shirt + tie
    if (style === "rags") {
      k.box(
        0.12,
        T + 0.006,
        0.1,
        shade(color, 1.25),
        0.08,
        T / 2 + 0.003,
        -0.02,
        0.4,
      );
      k.box(
        0.1,
        T + 0.006,
        0.08,
        shade(color, 0.6),
        -0.07,
        T / 2 + 0.003,
        0.3,
        -0.3,
      );
    }
    return k;
  }
  /** Rounded plate lying on the garment (chest plates, pauldrons, knee pads). */
  function plate(k, w, d, color, x, z, y, ry) {
    k.sph(0.5, color, x, y || 0.045, z, w, 0.07, d, 10);
    if (ry) {
      /* rotation folded into scale for spheres */
    }
    return k;
  }
  function rivets(k, xs, z, y, color) {
    for (const x of xs)
      k.cyl(0.008, 0.008, 0.01, color || 0xa8a8a0, x, y, z, 6);
    return k;
  }
  function spikes(k, pts, color) {
    for (const p of pts)
      k.cone(0.012, 0.07, color, p[0], p[1], p[2], 6, p[3] || 0, p[4] || 0);
    return k;
  }

  /** Exo-rig helmet: a squared helm with a single horizontal slit visor and twin side filters (no snout). */
  function rigHelmet(k, shell, dark, slit) {
    k.box(0.24, 0.2, 0.26, shell, 0, 0.12, 0);
    k.box(0.26, 0.04, 0.28, dark, 0, 0.02, 0);
    k.box(0.2, 0.02, 0.02, slit, 0, 0.15, 0.131); // slit visor
    for (const x of [-0.13, 0.13])
      k.cyl(0.03, 0.03, 0.04, dark, x, 0.09, 0.04, 10, 0, Math.PI / 2); // side filters
    k.box(0.12, 0.02, 0.2, dark, 0, 0.225, -0.02); // crown ridge
    return k;
  }
  /** Upright exo-rig torso shell. style: 'mk1' (riveted boiler plate) | 'mk2' (sealed, smooth) | 'mk3' (servo frame) */
  function rigTorso(k, main, dark, trim, style) {
    const metal = 0x3a3a38;
    // hip block / frame resting on the ground
    k.box(0.36, 0.12, 0.26, dark, 0, 0.06, 0);
    k.box(0.06, 0.1, 0.06, metal, -0.2, 0.07, 0);
    k.box(0.06, 0.1, 0.06, metal, 0.2, 0.07, 0);
    // abdomen segments
    for (let i = 0; i < 3; i++)
      k.box(
        0.3 - i * 0.015,
        0.05,
        0.22,
        i % 2 ? dark : main,
        0,
        0.145 + i * 0.052,
        0.015,
      );
    // chest
    if (style === "mk1") {
      k.box(0.46, 0.24, 0.3, main, 0, 0.4, 0);
      k.box(0.3, 0.16, 0.06, main, 0, 0.41, 0.17, 0, -0.25); // angled front plate
      for (let i = 0; i < 4; i++)
        k.box(0.2, 0.012, 0.012, metal, 0, 0.36 + i * 0.03, 0.2); // vent grille
      rivets(k, [-0.2, -0.1, 0.1, 0.2], 0.155, 0.51, 0x8a8a80);
    } else if (style === "mk2") {
      k.box(0.44, 0.22, 0.28, main, 0, 0.4, 0);
      k.sph(0.2, main, 0, 0.42, 0.07, 1.1, 0.72, 0.72, 12); // rounded chest bulge
      k.box(0.05, 0.2, 0.02, trim, 0, 0.42, 0.21); // gold centre stripe
      k.torus(0.06, 0.012, trim, 0, 0.4, 0.2, 0, 0);
    } else {
      k.box(0.46, 0.24, 0.3, main, 0, 0.4, 0);
      k.box(0.2, 0.18, 0.08, main, -0.1, 0.42, 0.16, 0.25, -0.15);
      k.box(0.2, 0.18, 0.08, main, 0.1, 0.42, 0.16, -0.25, -0.15); // faceted chest
      k.box(0.04, 0.02, 0.02, trim, -0.12, 0.47, 0.215);
      k.box(0.04, 0.02, 0.02, trim, 0.12, 0.47, 0.215); // red status lights
    }
    // collar ring
    k.cyl(0.12, 0.14, 0.05, dark, 0, 0.545, 0.0, 12);
    k.cyl(0.08, 0.08, 0.052, 0x121212, 0, 0.547, 0.0, 12);
    // pauldrons + hanging upper arms
    for (const sx of [-1, 1]) {
      if (style === "mk3")
        k.box(0.2, 0.1, 0.26, main, sx * 0.3, 0.5, 0, 0, 0, sx * -0.35);
      else k.sph(0.13, main, sx * 0.3, 0.48, 0, 1, 0.78, 1.1, 12);
      k.torus(
        0.12,
        0.012,
        style === "mk2" ? trim : dark,
        sx * 0.3,
        0.44,
        0,
        Math.PI / 2,
        0,
      );
      k.cyl(0.065, 0.06, 0.2, dark, sx * 0.31, 0.3, 0, 10);
      k.cyl(0.07, 0.07, 0.035, metal, sx * 0.31, 0.21, 0, 10); // elbow joint cap
    }
    // backpack with twin exhaust pipes & rig-battery housing
    k.box(0.38, 0.3, 0.14, dark, 0, 0.4, -0.21);
    k.cyl(0.035, 0.035, 0.24, metal, -0.1, 0.48, -0.3, 8);
    k.cyl(0.035, 0.035, 0.24, metal, 0.1, 0.48, -0.3, 8);
    k.cyl(0.045, 0.045, 0.04, 0x1a1a1a, -0.1, 0.61, -0.3, 8);
    k.cyl(0.045, 0.045, 0.04, 0x1a1a1a, 0.1, 0.61, -0.3, 8);
    k.cyl(0.05, 0.05, 0.1, 0x6a6a60, 0, 0.3, -0.3, 10, Math.PI / 2); // core port
    // unit stencil patch
    k.box(
      0.1,
      0.05,
      0.004,
      style === "mk3" ? 0x6a6a6a : 0xd8d0b0,
      -0.12,
      0.44,
      0.152,
    );
    return k;
  }

