// play-inline-481 03 — box
// Lines 378-849 of readable/play-inline-481.pretty.js (statement-aligned).
  const BUILD = {
    /** Old-world "Frost-O-Matic" refrigerator: rounded crown, two doors, chrome latch handle, Fizzo decal, feet. */
    fridge(k) {
      const W = 0.76,
        D = 0.68,
        H = 1.46,
        col = 0xd8d2bc;
      const R = 0.13; // rounded top edges (front & back), like a '50s icebox
      k.boxL(W, H - R, D, col, "grime_rust", "all", 0, 0.06 + (H - R) / 2, 0);
      k.boxL(W, R, D - 2 * R, col, "grime", "all", 0, 0.06 + H - R / 2, 0);
      for (const z of [-(D / 2 - R), D / 2 - R]) {
        k.cylL(R, R, W, col, "grime", 0, 0.06 + H - R, z, 16, 0, Math.PI / 2);
        k.cyl(
          R - 0.002,
          R - 0.002,
          W,
          0xcfc9b3,
          0,
          0.06 + H - R,
          z,
          16,
          0,
          Math.PI / 2,
        ); // closes the ends
      }
      // doors (slightly proud), shut line, freezer door above
      k.boxL(
        W - 0.04,
        H * 0.66,
        0.03,
        col,
        "grime",
        "z",
        0,
        0.06 + H * 0.36,
        D / 2 + 0.012,
      );
      k.boxL(
        W - 0.04,
        H * 0.3,
        0.03,
        col,
        "grime",
        "z",
        0,
        0.06 + H * 0.84,
        D / 2 + 0.012,
      );
      k.box(W - 0.02, 0.012, 0.035, 0x5a5850, 0, 0.06 + H * 0.69, D / 2 + 0.01);
      // chrome latch handles (standoffs + bar)
      for (const [y0, len] of [
        [0.06 + H * 0.52, 0.34],
        [0.06 + H * 0.84, 0.16],
      ]) {
        k.box(0.035, len, 0.03, CHROME, W / 2 - 0.1, y0, D / 2 + 0.06);
        k.box(
          0.025,
          0.03,
          0.05,
          CHROME,
          W / 2 - 0.1,
          y0 + len / 2 - 0.02,
          D / 2 + 0.04,
        );
        k.box(
          0.025,
          0.03,
          0.05,
          CHROME,
          W / 2 - 0.1,
          y0 - len / 2 + 0.02,
          D / 2 + 0.04,
        );
      }
      // hinges, badge, Fizzo Cola sticker, kick plate, feet
      for (const y of [
        0.06 + H * 0.1,
        0.06 + H * 0.6,
        0.06 + H * 0.75,
        0.06 + H * 0.96,
      ])
        k.cyl(0.012, 0.012, 0.06, CHROME, -W / 2 + 0.03, y, D / 2 + 0.02, 8);
      k.planeL(
        0.22,
        0.07,
        0xffffff,
        "fridge_badge",
        0,
        0.06 + H * 0.76,
        D / 2 + 0.03,
      );
      k.planeL(
        0.2,
        0.2,
        0xffffff,
        "fizzo_logo",
        -0.12,
        0.06 + H * 0.46,
        D / 2 + 0.029,
        0.12,
      );
      k.boxL(
        W - 0.04,
        0.07,
        0.02,
        0x3a3a38,
        "vent",
        "z",
        0,
        0.1,
        D / 2 + 0.005,
      );
      for (const x of [-W / 2 + 0.07, W / 2 - 0.07])
        for (const z of [-D / 2 + 0.07, D / 2 - 0.07])
          k.cyl(0.03, 0.025, 0.06, DARK, x, 0.03, z, 8);
    },
    /** Fizzo Cola cooler chest: green body, white lid, chrome corners & drop handles. */
    cooler(k) {
      k.boxL(0.62, 0.42, 0.4, 0x1f7a4a, "grime_rust", "all", 0, 0.23, 0);
      k.boxL(0.64, 0.07, 0.42, 0xece6d8, "grime", "all", 0, 0.475, 0);
      k.planeL(0.26, 0.26, 0xffffff, "fizzo_logo", 0, 0.24, 0.201);
      for (const x of [-0.3, 0.3])
        for (const z of [-0.19, 0.19])
          k.box(0.04, 0.44, 0.04, CHROME, x, 0.24, z);
      for (const x of [-0.33, 0.33]) {
        k.box(0.02, 0.02, 0.18, CHROME, x, 0.34, 0);
        k.box(0.02, 0.05, 0.02, CHROME, x, 0.36, -0.08);
        k.box(0.02, 0.05, 0.02, CHROME, x, 0.36, 0.08);
      }
      k.box(0.08, 0.05, 0.03, CHROME, 0, 0.45, 0.215);
      k.box(0.6, 0.02, 0.38, 0x1a1a1a, 0, 0.01, 0);
    },
    /** Steel office desk: slab top, 3-drawer pedestal, modesty panel, legs. */
    desk(k) {
      const W = 1.4,
        D = 0.72,
        H = 0.76,
        col = 0x7a8074;
      k.boxL(W, 0.04, D, 0x5a5e56, "grime_dark", "all", 0, H - 0.02, 0);
      k.boxL(W - 0.04, 0.01, D - 0.04, 0x3c4a3c, "grime", "y", 0, H + 0.003, 0); // linoleum inlay
      k.boxL(
        0.44,
        H - 0.06,
        D - 0.06,
        col,
        "grime",
        "all",
        W / 2 - 0.25,
        (H - 0.06) / 2 + 0.02,
        0,
      ); // pedestal
      for (let i = 0; i < 3; i++) {
        const y = 0.14 + i * 0.22;
        k.boxL(
          0.4,
          0.19,
          0.02,
          col,
          "drawer",
          "z",
          W / 2 - 0.25,
          y,
          D / 2 - 0.02,
        );
        k.box(0.12, 0.018, 0.03, CHROME, W / 2 - 0.25, y + 0.03, D / 2 + 0.005);
      }
      k.boxL(
        W - 0.5,
        0.42,
        0.02,
        col,
        "grime",
        "all",
        -0.2,
        H - 0.26,
        -D / 2 + 0.05,
      ); // modesty panel
      k.boxL(
        0.03,
        H - 0.06,
        D - 0.1,
        col,
        "grime",
        "all",
        -W / 2 + 0.04,
        (H - 0.06) / 2 + 0.02,
        0,
      ); // side panel
      k.box(0.5, 0.1, 0.02, col, -0.25, H - 0.1, D / 2 - 0.05); // pencil drawer
      k.box(0.1, 0.014, 0.02, CHROME, -0.25, H - 0.1, D / 2 - 0.035);
      k.box(0.04, 0.02, 0.1, DARK, -W / 2 + 0.04, 0.01, D / 2 - 0.1);
      k.box(0.46, 0.02, D - 0.06, DARK, W / 2 - 0.25, 0.01, 0);
      // clutter: a typewriter-ish block and a stack of paper
      k.boxL(
        0.3,
        0.1,
        0.24,
        0x3a3a38,
        "grime_dark",
        "all",
        -0.3,
        H + 0.05,
        -0.08,
      );
      k.box(0.26, 0.03, 0.06, 0xe8e0c8, -0.3, H + 0.11, -0.16);
      k.boxL(
        0.2,
        0.03,
        0.26,
        0xffffff,
        "paper",
        "y",
        0.3,
        H + 0.015,
        0.08,
        0.2,
      );
    },
    file_cabinet(k) {
      const col = 0x6c7068;
      k.boxL(0.5, 1.32, 0.64, col, "grime", "all", 0, 0.66, 0);
      for (let i = 0; i < 4; i++) {
        const y = 0.18 + i * 0.32;
        k.boxL(0.46, 0.29, 0.02, col, "drawer", "z", 0, y, 0.325);
        k.box(0.14, 0.02, 0.03, CHROME, 0, y + 0.05, 0.345);
      }
      k.box(0.52, 0.02, 0.66, 0x4a4c48, 0, 1.33, 0);
    },
    dresser(k) {
      k.boxL(0.9, 0.86, 0.48, 0x9a7a58, "wood", "all", 0, 0.47, 0);
      for (let r = 0; r < 3; r++)
        for (let q = 0; q < (r === 2 ? 2 : 1); q++) {
          const w = r === 2 ? 0.4 : 0.82,
            x = r === 2 ? (q ? 0.21 : -0.21) : 0,
            y = 0.2 + r * 0.26;
          k.boxL(w, 0.22, 0.02, 0xa8886a, "wood", "z", x, y, 0.245);
          k.box(0.08, 0.02, 0.025, 0xc0a060, x, y, 0.262);
        }
      k.box(0.94, 0.03, 0.52, 0x6a4a30, 0, 0.915, 0);
      for (const x of [-0.4, 0.4])
        for (const z of [-0.2, 0.2])
          k.cyl(0.025, 0.018, 0.04, 0x4a3020, x, 0.02, z, 8);
    },
    /** Army ammo can: olive steel, stencilled lot number, clamp latch and folding handle. */
    ammo_box(k) {
      k.boxL(0.58, 0.3, 0.3, 0xffffff, "ammo", "zZ", 0, 0.17, 0);
      k.boxL(0.58, 0.3, 0.3, 0x6a7248, "olive", "xXyY", 0, 0.17, 0);
      k.boxL(0.6, 0.05, 0.32, 0x565e3a, "olive", "all", 0, 0.345, 0);
      k.box(0.6, 0.02, 0.32, 0x3a3f26, 0, 0.02, 0);
      k.box(0.06, 0.08, 0.03, 0x4a5030, -0.29, 0.3, 0.1);
      k.cyl(0.012, 0.012, 0.06, 0x3a3a30, -0.3, 0.34, 0.1, 8); // clamp latch
      k.box(0.24, 0.016, 0.03, DARK, 0, 0.385, 0);
      k.box(0.016, 0.03, 0.03, DARK, -0.11, 0.37, 0);
      k.box(0.016, 0.03, 0.03, DARK, 0.11, 0.37, 0);
      for (const x of [-0.2, 0.2])
        k.box(0.1, 0.012, 0.31, 0x565e3a, x, 0.26, 0); // pressed ribs
    },
    /** Wall first-aid box: white steel case, red cross, piano hinge, latch; mounting plate behind. */
    first_aid(k) {
      k.boxL(0.5, 0.42, 0.04, 0x9a9a92, "grime", "all", 0, 0.23, -0.1); // mounting plate
      k.boxL(0.44, 0.38, 0.14, 0xf0eee6, "grime", "xXyY", 0, 0.23, -0.01);
      k.boxL(0.44, 0.38, 0.02, 0xffffff, "redcross", "z", 0, 0.23, 0.07);
      k.cyl(0.008, 0.008, 0.38, CHROME, -0.225, 0.23, 0.07, 8); // piano hinge
      k.box(0.04, 0.06, 0.025, CHROME, 0.2, 0.23, 0.085); // latch
      for (const [x, y] of [
        [-0.23, 0.44],
        [0.23, 0.44],
        [-0.23, 0.02],
        [0.23, 0.02],
      ])
        k.cyl(0.01, 0.01, 0.02, DARK, x, y, -0.07, 6, Math.PI / 2);
    },
    footlocker(k) {
      k.boxL(0.84, 0.36, 0.44, 0x4a5a36, "olive", "all", 0, 0.2, 0);
      k.boxL(0.86, 0.06, 0.46, 0x3e4c2c, "olive", "all", 0, 0.39, 0);
      k.planeL(0.18, 0.12, 0xffffff, "stencil_no", -0.22, 0.2, 0.222);
      for (const x of [-0.41, 0.41])
        for (const z of [-0.21, 0.21]) {
          k.box(0.05, 0.42, 0.05, 0xa08a50, x, 0.21, z);
        }
      k.box(0.09, 0.11, 0.025, 0xb09a50, 0, 0.33, 0.235);
      k.cyl(0.012, 0.012, 0.03, DARK, 0, 0.31, 0.25, 8, Math.PI / 2);
      for (const x of [-0.44, 0.44]) {
        k.box(0.02, 0.03, 0.14, DARK, x, 0.26, 0);
      }
      k.box(0.82, 0.02, 0.42, 0x2a2a22, 0, 0.01, 0);
    },
    suitcase(k) {
      k.boxL(0.62, 0.2, 0.42, 0x6a4a2a, "grime_dark", "all", 0, 0.1, 0);
      k.box(0.64, 0.02, 0.44, 0x4a3018, 0, 0.1, 0);
      k.box(0.16, 0.03, 0.03, DARK, 0, 0.1, 0.23);
      k.box(0.03, 0.04, 0.02, 0xc0a050, -0.14, 0.13, 0.22);
      k.box(0.03, 0.04, 0.02, 0xc0a050, 0.14, 0.13, 0.22);
      for (const x of [-0.3, 0.3])
        for (const z of [-0.2, 0.2])
          k.sph(0.02, 0xc0a050, x, 0.2, z, 1, 1, 1, 6);
    },
    briefcase(k) {
      k.boxL(0.46, 0.34, 0.1, 0x3a2414, "grime_dark", "all", 0, 0.18, 0);
      k.box(0.47, 0.02, 0.11, 0x2a180c, 0, 0.3, 0);
      k.box(0.14, 0.03, 0.03, DARK, 0, 0.365, 0);
      k.box(0.03, 0.03, 0.02, 0xc0a050, -0.12, 0.3, 0.055);
      k.box(0.03, 0.03, 0.02, 0xc0a050, 0.12, 0.3, 0.055);
    },
    /** Floor safe: heavy dark steel, recessed door, combination dial, lever handle, hinges. */
    safe(k) {
      k.boxL(0.6, 0.66, 0.56, 0x3a3e40, "grime_dark", "all", 0, 0.35, 0);
      k.boxL(0.5, 0.54, 0.03, 0x464a4c, "grime_dark", "z", 0, 0.35, 0.285);
      k.discL(0.075, 0xffffff, "dial", 0.08, 0.42, 0.306, Math.PI / 2, 0, 20);
      k.cyl(0.08, 0.08, 0.02, 0x2a2a2a, 0.08, 0.42, 0.295, 20, Math.PI / 2);
      k.cyl(0.012, 0.012, 0.03, CHROME, -0.1, 0.34, 0.31, 8, Math.PI / 2);
      k.box(0.03, 0.16, 0.025, CHROME, -0.1, 0.3, 0.32);
      for (const y of [0.2, 0.5])
        k.cyl(0.018, 0.018, 0.08, 0x2a2a2a, -0.26, y, 0.29, 8);
      k.boxL(0.14, 0.04, 0.005, 0xffffff, "fridge_badge", "z", 0, 0.58, 0.301);
      k.box(0.64, 0.03, 0.6, 0x1a1a1a, 0, 0.015, 0);
    },
    toolbox(k) {
      k.boxL(0.52, 0.22, 0.24, 0xffffff, "toolbox", "zZ", 0, 0.11, 0);
      k.boxL(0.52, 0.22, 0.24, 0xb02a1a, "grime_rust", "xXyY", 0, 0.11, 0);
      k.boxL(0.54, 0.05, 0.26, 0x9a2414, "grime_rust", "all", 0, 0.245, 0);
      k.box(0.3, 0.025, 0.03, DARK, 0, 0.32, 0);
      k.box(0.025, 0.07, 0.025, DARK, -0.14, 0.29, 0);
      k.box(0.025, 0.07, 0.025, DARK, 0.14, 0.29, 0);
      k.box(0.04, 0.04, 0.02, CHROME, -0.2, 0.22, 0.13);
      k.box(0.04, 0.04, 0.02, CHROME, 0.2, 0.22, 0.13);
    },
    /** Tall steel locker: louvred vents, number plate, latch handle, padlock hasp. */
    locker(k, cryo) {
      const col = cryo ? 0xd0d4d0 : 0x5c6a5c;
      k.boxL(0.52, 1.84, 0.5, col, "grime", "xXyYZ", 0, 0.94, 0);
      k.boxL(0.47, 1.76, 0.02, col, "grime", "z", 0, 0.94, 0.255);
      k.boxL(0.34, 0.2, 0.012, col, "vent", "z", 0, 1.6, 0.268);
      k.boxL(0.34, 0.2, 0.012, col, "vent", "z", 0, 0.3, 0.268);
      k.box(0.03, 0.2, 0.035, CHROME, 0.18, 0.98, 0.275);
      k.box(0.05, 0.03, 0.03, CHROME, 0.18, 1.1, 0.275);
      k.box(0.03, 0.05, 0.012, 0x8a8a80, 0.18, 0.86, 0.27);
      if (cryo) k.planeL(0.14, 0.14, 0xffffff, "civdef", 0, 1.3, 0.27);
      else
        k.boxL(0.1, 0.05, 0.005, 0xffffff, "stencil_no", "z", 0, 1.36, 0.268);
      k.box(0.54, 0.04, 0.52, 0x2a2a2a, 0, 0.02, 0);
      k.box(0.54, 0.02, 0.52, 0x3a3a3a, 0, 1.87, 0);
    },
    cryo_locker(k) {
      BUILD.locker(k, true);
    },
    /** NYC Sanitation wire-free steel can with lid. */
    trash_can(k) {
      k.cylL(0.26, 0.23, 0.78, 0xffffff, "trash", 0, 0.41, 0, 18);
      k.cyl(0.235, 0.235, 0.02, 0x3a3a38, 0, 0.02, 0, 18);
      k.cyl(0.275, 0.275, 0.05, 0x6a6c68, 0, 0.8, 0, 18);
      k.cyl(0.24, 0.27, 0.07, 0x6a6c68, 0, 0.86, 0, 18);
      k.box(0.14, 0.03, 0.03, 0x4a4a48, 0, 0.91, 0);
      for (const a of [0, Math.PI])
        k.box(
          0.03,
          0.03,
          0.12,
          0x4a4a48,
          Math.sin(a) * 0.27,
          0.66,
          Math.cos(a) * 0.27,
          a + Math.PI / 2,
        );
      k.torus(0.255, 0.012, 0x5a5c58, 0, 0.25, 0, Math.PI / 2);
      k.torus(0.265, 0.012, 0x5a5c58, 0, 0.58, 0, Math.PI / 2);
    },
    dumpster(k) {
      k.boxL(1.8, 1.1, 1.0, 0x2e5a3a, "grime_rust", "all", 0, 0.65, 0);
      k.boxL(
        1.84,
        0.08,
        1.04,
        0x234a2e,
        "grime_dark",
        "all",
        0,
        1.24,
        0.02,
        0,
        -0.08,
      );
      for (const x of [-0.7, 0.7])
        for (const z of [-0.4, 0.4]) {
          k.cyl(0.07, 0.07, 0.05, DARK, x, 0.07, z, 10, Math.PI / 2);
          k.box(0.06, 0.08, 0.06, DARK, x, 0.12, z);
        }
      k.box(1.9, 0.06, 0.06, 0x234a2e, 0, 0.9, 0.52);
    },
    /** NYC corner mailbox (the blue USPS-style one). */
    mailbox(k) {
      k.boxL(0.46, 0.8, 0.5, 0xffffff, "mail", "z", 0, 0.62, 0);
      k.boxL(0.46, 0.8, 0.5, 0x2a4a8a, "grime", "xXYZ", 0, 0.62, 0);
      k.cylL(
        0.25,
        0.25,
        0.46,
        0x2a4a8a,
        "grime",
        0,
        1.02,
        0,
        16,
        0,
        Math.PI / 2,
      );
      k.boxL(
        0.34,
        0.06,
        0.2,
        0x1e3a70,
        "grime_dark",
        "all",
        0,
        1.1,
        0.2,
        0,
        -0.35,
      );
      for (const x of [-0.2, 0.2])
        for (const z of [-0.22, 0.22])
          k.box(0.05, 0.22, 0.05, 0x1e3a70, x, 0.11, z);
    },
    register(k) {
      k.boxL(0.4, 0.14, 0.4, 0x3a3a38, "grime_dark", "all", 0, 0.07, 0);
      k.boxL(
        0.36,
        0.16,
        0.26,
        0x6a4a2a,
        "register",
        "y",
        0,
        0.2,
        0.04,
        0,
        -0.35,
      );
      k.boxL(0.3, 0.12, 0.12, 0xb8a060, "grime", "all", 0, 0.32, -0.12);
      k.box(0.24, 0.06, 0.02, 0x1a1a1a, 0, 0.34, -0.055);
    },
    duffle(k) {
      k.cylL(
        0.17,
        0.17,
        0.7,
        0x4a5a36,
        "olive",
        0,
        0.16,
        0,
        14,
        0,
        Math.PI / 2,
      );
      k.sph(0.17, 0x4a5a36, -0.35, 0.16, 0, 0.25, 1, 1, 10);
      k.sph(0.17, 0x4a5a36, 0.35, 0.16, 0, 0.25, 1, 1, 10);
      k.box(0.5, 0.02, 0.04, DARK, 0, 0.33, 0);
      k.torus(0.08, 0.012, DARK, 0, 0.36, 0, 0);
    },
    /** Wooden supply crate: planks, darker frame boards, stencil. */
    crate(k) {
      k.boxL(0.62, 0.52, 0.52, 0xb89468, "wood", "all", 0, 0.26, 0);
      for (const y of [0.03, 0.49]) {
        k.boxL(0.64, 0.06, 0.54, 0x8a6a44, "wood", "all", 0, y, 0);
      }
      for (const x of [-0.29, 0.29])
        for (const z of [-0.24, 0.24])
          k.boxL(0.06, 0.52, 0.06, 0x7a5a38, "wood", "all", x, 0.26, z);
      k.planeL(0.26, 0.2, 0xffffff, "stencil_no", 0, 0.28, 0.262);
    },
  };
