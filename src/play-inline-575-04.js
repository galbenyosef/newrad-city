// play-inline-575 04 — box
// Lines 939-1164 of readable/play-inline-575.pretty.js (statement-aligned).
  K.newsStand = function (x, y, z, yaw) {
    const g = K.group(x, y, z, yaw, 120);
    const b = builder();
    const wood = mat("wood_planks", 0x6a4a2a),
      paper = tint("qx_paper", 0xcfc6a8, { roughness: 1 }),
      twine = tint("qx_twine", 0x8a6a3a);
    K.box(b, wood, 0.7, 1.0, 0.04, 0, 0.5, -0.18, 0, 0.18);
    K.box(b, wood, 0.7, 1.0, 0.04, 0, 0.5, 0.18, 0, -0.18);
    for (let i = 0; i < 3; i++) {
      K.box(
        b,
        paper,
        0.42,
        0.22,
        0.3,
        0.9 + i * 0.05,
        0.11 + i * 0.22,
        0.1,
        i * 0.3,
      );
      K.box(
        b,
        twine,
        0.43,
        0.02,
        0.31,
        0.9 + i * 0.05,
        0.2 + i * 0.22,
        0.1,
        i * 0.3,
      );
    }
    K.flush(b, g, false);
    const sg = K.sign("EXTRA!\nEXTRA!", "shop", 0.6, 0.5, {
      fg: "#1a1a1a",
      bg: "#e8e0c8",
    });
    sg.position.set(0, 0.62, -0.215);
    sg.rotation.y = Math.PI;
    sg.rotation.x = -0.18;
    g.add(sg);
    return g;
  };

  /** Crate stage with playbill board. */
  K.stage = function (x, y, z, yaw) {
    const g = K.group(x, y, z, yaw, 150);
    const b = builder();
    const wood = mat("wood_planks", 0x6a4a2a),
      red = tint("qx_curtain", 0x7a1a1a, { roughness: 0.95 });
    K.box(b, wood, 3.0, 0.45, 2.0, 0, 0.225, 0);
    K.box(b, wood, 0.08, 2.6, 0.08, -1.45, 1.75, 0.95);
    K.box(b, wood, 0.08, 2.6, 0.08, 1.45, 1.75, 0.95);
    K.box(b, wood, 3.0, 0.1, 0.1, 0, 3.0, 0.95);
    K.box(b, red, 0.6, 2.5, 0.05, -1.15, 1.75, 0.95);
    K.box(b, red, 0.6, 2.5, 0.05, 1.15, 1.75, 0.95);
    K.box(b, wood, 0.08, 1.4, 0.08, 2.2, 0.7, -0.6);
    K.flush(b, g, false);
    const sg = K.sign(
      "TONIGHT!\nHAMLET OF HOBOKEN\nB. BIXBY",
      "marquee",
      1.0,
      0.7,
      { fg: "#fff0c0", bg: "#2a1010", glow: 0.35 },
    );
    sg.position.set(2.2, 1.55, -0.56);
    sg.rotation.y = Math.PI;
    g.add(sg);
    K.collider(x, z, 3.0, 2.0, y, y + 0.45, yaw, "wood");
    return g;
  };

  /** Painted oil-drum drop box. */
  K.dropBox = function (x, y, z, yaw, text) {
    const g = K.group(x, y, z, yaw, 120);
    const b = builder();
    K.cyl(
      b,
      tint("qx_drum", 0x7a2a1a, { roughness: 0.7, metalness: 0.4 }),
      0.3,
      0.9,
      0,
      0.45,
      0,
      14,
    );
    K.cyl(b, mat("rust", 0x6a3a22), 0.31, 0.04, 0, 0.3, 0, 14);
    K.cyl(b, mat("rust", 0x6a3a22), 0.31, 0.04, 0, 0.62, 0, 14);
    K.box(b, mat("metal_panel", 0x555555), 0.25, 0.02, 0.06, 0, 0.905, 0);
    K.flush(b, g, false);
    const sg = K.sign(text || "RANSOM\nDROP", "warning", 0.5, 0.3, {
      fg: "#ffffff",
      bg: "#8a1010",
    });
    sg.position.set(0, 0.55, -0.315);
    sg.rotation.y = Math.PI;
    g.add(sg);
    K.collider(x, z, 0.62, 0.62, y, y + 0.92, 0, "metal");
    return g;
  };

  /** Folding card table with three cards (three-card monte). */
  /**
   * Three-card monte pitch: folding card table (green felt, three red-backed cards face down), a cigar box of
   * folded Scrip and a stack of winnings, the hustler's crate stool behind (local -z), a striped street parasol for a
   * silhouette you can spot from down the avenue, and a hand-lettered cardboard sign propped on a crate.
   */
  K.cardTable = function (x, y, z, yaw) {
    const g = K.group(x, y, z, yaw, 110);
    const b = builder();
    const wood = mat("wood_planks", 0x5a3a20),
      felt = tint("qx_felt", 0x1f4a2a, { roughness: 1 }),
      back = tint("qx_card_back", 0x8a1c1c, { roughness: 0.7 });
    const face = tint("qx_card", 0xece6d4, { roughness: 0.8 }),
      cig = tint("qx_cigarbox", 0x7a3a1a, { roughness: 0.6 }),
      note = tint("qx_scrip_note", 0xc8c8a8, { roughness: 0.95 });
    const stripeA = tint("qx_parasol_a", 0xb83a2a, {
        roughness: 0.9,
        side: THREE.DoubleSide,
      }),
      stripeB = tint("qx_parasol_b", 0xe0d8c0, {
        roughness: 0.9,
        side: THREE.DoubleSide,
      });
    const crate = mat("wood_rotten", 0x6a5030),
      steel = mat("metal_painted", 0x5a6068);
    // table
    K.box(b, wood, 0.9, 0.04, 0.6, 0, 0.72, 0);
    K.box(b, felt, 0.84, 0.01, 0.54, 0, 0.745, 0);
    for (const sx of [-0.38, 0.38])
      K.box(
        b,
        steel,
        0.03,
        0.72,
        0.5,
        sx,
        0.36,
        0,
        0,
        0,
        sx > 0 ? 0.12 : -0.12,
      );
    for (let i = -1; i <= 1; i++) {
      K.box(b, back, 0.07, 0.004, 0.1, i * 0.18, 0.752, 0.02, i * 0.2);
    }
    K.box(b, face, 0.07, 0.004, 0.1, 0.33, 0.752, -0.18, 0.5); // the deck, one card turned
    K.box(b, back, 0.07, 0.03, 0.1, 0.36, 0.765, -0.2, 0.1);
    K.box(b, cig, 0.2, 0.06, 0.13, -0.33, 0.78, -0.17, 0.2);
    K.box(b, cig, 0.2, 0.01, 0.13, -0.33, 0.86, -0.24, 0.2, -1.1); // cigar box, lid open
    for (let i = 0; i < 6; i++)
      K.box(
        b,
        note,
        0.05,
        0.004,
        0.025,
        -0.33 + (i % 3) * 0.03 - 0.03,
        0.8 + 0.002 * i,
        -0.17 + (i > 2 ? 0.03 : -0.02),
        i * 0.5,
      ); // folded notes
    for (let i = 0; i < 7; i++)
      K.box(
        b,
        note,
        0.06,
        0.003,
        0.03,
        -0.12,
        0.752 + i * 0.0035,
        -0.2,
        i * 0.15,
      ); // the winnings stack
    // hustler's crate stool behind the table
    K.box(b, crate, 0.45, 0.45, 0.45, 0.1, 0.225, -1.3, 0.3);
    K.box(b, wood, 0.47, 0.03, 0.47, 0.1, 0.46, -1.3, 0.3);
    // parasol on a weighted stand (behind, to the left)
    const px = -0.75,
      pz = -0.7;
    K.cyl(b, steel, 0.2, 0.08, px, 0.04, pz, 10);
    K.cyl(b, steel, 0.02, 2.3, px, 1.19, pz, 6);
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) / 8) * Math.PI * 2;
      K.box(
        b,
        i % 2 ? stripeA : stripeB,
        0.66,
        0.015,
        0.8,
        px + Math.sin(a) * 0.42,
        2.2,
        pz + Math.cos(a) * 0.42,
        a,
        -0.33,
      );
    }
    K.sphere(b, steel, 0.04, px, 2.38, pz);
    // sign crate out front, to the right
    K.box(b, crate, 0.5, 0.5, 0.5, 0.95, 0.25, 0.55, -0.3);
    K.flush(b, g, false);
    const sg = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.42),
      new THREE.MeshStandardMaterial({
        map: K.paintSign(
          "FIND THE LADY!\nDOUBLE YOUR SCRIP",
          "#2a1a10",
          "#c8a878",
          "bold italic ",
        ),
        roughness: 1,
        side: THREE.DoubleSide,
      }),
    );
    sg.position.set(0.95, 0.72, 0.62);
    sg.rotation.set(-0.35, -0.3, 0, "YXZ");
    g.add(sg);
    K.collider(x, z, 0.9, 0.6, y, y + 0.75, yaw, "wood");
    const cp = K.local(g, 0.95, 0.55);
    K.collider(cp.x, cp.z, 0.55, 0.55, y, y + 0.5, yaw - 0.3, "wood");
    const pp = K.local(g, px, pz);
    K.collider(pp.x, pp.z, 0.3, 0.3, y, y + 2.2, yaw, "metal");
    return g;
  };

  QX.kit = K;
