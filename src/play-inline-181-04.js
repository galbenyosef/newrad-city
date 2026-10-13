// play-inline-181 04 — tint
// Lines 661-1839 of readable/play-inline-181.pretty.js (statement-aligned).
  function buildInterior(rec) {
    const O = G.LAYOUT.INTERIORS.bellevue.origin;
    const ox = O.x,
      oz = O.z;
    const b = K.builder("bv_int", {
      grime: 0.5,
      ambient: 0.95,
      maxLight: 2.6,
      gain: 1.3,
    });
    const glows = K.glowSet("bv_int");
    const MY = -7,
      LY = -10;
    // ---- baked lights ----
    b.light(ox, 4, oz + 28, 13, 0xe0f0d8, 0.9);
    for (let z = 16; z > -30; z -= 9)
      b.light(ox, 3.2, oz + z, 7, 0xd8f0d0, 0.6);
    b.light(ox - 8, 3, oz + 13, 9, 0xd8f0d0, 0.6);
    b.light(ox - 8, 3, oz - 1, 9, 0xffe0b0, 0.6);
    b.light(ox - 8, 2.5, oz - 15, 9, 0xff6040, 0.7);
    b.light(ox + 8, 3, oz + 15, 8, 0xe8f8ff, 0.7);
    b.light(ox + 11, 2.5, oz + 0, 7, 0xe8f8ff, 0.6);
    b.light(ox, 7, oz - 45, 14, 0xf0fff0, 1.3); // the great surgical lamp
    b.light(ox + 13, MY + 3, oz - 34, 14, 0xc8e8ff, 0.7);
    b.light(ox + 13, LY + 2.5, oz - 70, 20, 0x60ff70, 1.4);
    b.light(ox + 26, LY + 3, oz - 60, 8, 0xffe0a0, 0.6);

    // =========================== ADMISSIONS ===========================
    K.room(b, {
      x0: ox - 10,
      x1: ox + 10,
      z0: oz + 20,
      z1: oz + 36,
      y: 0,
      h: 5,
      floor: "terrazzo",
      wall: "tile_green",
      ceil: "plaster",
      doors: { s: [{ at: 10, w: 2.4, h: 3 }], n: [{ at: 10, w: 2.4, h: 2.8 }] },
      base: "tile_green",
      floorTint: 0xa8a898,
      wallTint: 0x9ab8a0,
      wain: { mat: "tile_cream", h: 1.4, tint: 0xc8c0a0 },
      ceilTint: 0x9a9a88,
    });
    b.panel("atlas_paint", ox, 4.2, oz + 20.17, 6, 0.9, 0, {
      rect: K.paint("bv_admit", 900, 140),
      grime: 0.4,
    });
    // admissions desk behind wire-glass
    b.box("oak", ox + 6, 0, oz + 24, 7, 1.1, 1.2, { tint: 0x5a4a34 });
    K.colBox(ox + 2.5, 0, oz + 23.4, ox + 9.5, 1.1, oz + 24.6, {
      surface: "wood",
    });
    b.box("glass", ox + 6, 1.1, oz + 24.55, 7, 1.5, 0.04, {
      faces: "ns",
      tint: 0x7a8a80,
      grime: 0.5,
    });
    for (let k = 0; k < 14; k++)
      b.beam(
        "black_metal",
        ox + 2.6 + k * 0.5,
        1.1,
        oz + 24.6,
        ox + 2.6 + k * 0.5,
        2.6,
        oz + 24.6,
        0.015,
      );
    for (let k = 0; k < 3; k++)
      F.bench(b, ox - 6, 0, oz + 26 + k * 3, 0, 4.5, {
        mat: "oak",
        frame: "black_metal",
      });
    // wheelchairs & a gurney
    for (const p of [
      [-1.5, 31, 0.6],
      [3.5, 33, -1.2],
    ]) {
      const [x, z, yw] = [ox + p[0], oz + p[1], p[2]];
      b.box("leather_brown", x, 0.45, z, 0.5, 0.06, 0.5, { yaw: yw });
      b.box(
        "leather_brown",
        x + Math.sin(yw) * 0.25,
        0.5,
        z + Math.cos(yw) * 0.25,
        0.5,
        0.5,
        0.05,
        { yaw: yw },
      );
      for (const sgn of [-1, 1]) {
        const w = F.rot(x, z, yw, sgn * 0.3, 0);
        b.geo("chrome", T.torus, {
          x: w[0],
          y: 0.33,
          z: w[1],
          ry: yw + HP,
          s: 0.3,
        });
      }
    }
    b.box("hosp_white", ox + 7, 0.8, oz + 31, 0.7, 0.1, 2, { yaw: 0.3 });
    b.box("cloth_white", ox + 7, 0.9, oz + 31, 0.65, 0.08, 1.9, {
      yaw: 0.3,
      tint: 0x9a8a78,
    });
    for (const c of [
      [-0.3, -0.9],
      [0.3, -0.9],
      [-0.3, 0.9],
      [0.3, 0.9],
    ]) {
      const p = F.rot(ox + 7, oz + 31, 0.3, c[0], c[1]);
      b.beam("chrome", p[0], 0, p[1], p[0], 0.8, p[1], 0.03);
    }
    for (let x = ox - 6; x <= ox + 6; x += 6) {
      b.box("lamp_white", x, 4.95, oz + 28, 0.3, 0.05, 1.6, { grime: 0 });
      glows.add(x, 4.85, oz + 28, 0xe0f0e0, "m");
    }
    F.papers(b, ox - 9, oz + 21, ox + 9, oz + 35, 0, 26, { tint: 0xc8c0a8 });
    // grille door (open) between admissions and the corridor is a visual: iron bars folded to the side
    for (let k = 0; k < 8; k++)
      b.beam(
        "black_metal",
        ox + 1.3 + k * 0.08,
        0,
        oz + 20 + k * 0.03,
        ox + 1.3 + k * 0.08,
        2.7,
        oz + 20 + k * 0.03,
        0.025,
      );

    // =========================== WARD CORRIDOR ===========================
    const WX = 2.5,
      WZ0 = -30,
      WZ1 = 20,
      WH = 3.4;
    K.room(b, {
      x0: ox - WX,
      x1: ox + WX,
      z0: oz + WZ0,
      z1: oz + WZ1,
      y: 0,
      h: WH,
      floor: "tile_floor",
      wall: "wall_hosp",
      ceil: "plaster",
      doors: {
        s: [{ at: WX, w: 2.4, h: 2.8 }],
        n: [{ at: WX, w: 2.2, h: 2.6 }],
        w: [
          { at: 43, w: 1.6, h: 2.4 },
          { at: 29, w: 1.6, h: 2.4 },
          { at: 15, w: 1.6, h: 2.4 },
        ],
        e: [
          { at: 45, w: 1.4, h: 2.3 },
          { at: 37.5, w: 1.0, h: 2.1 },
          { at: 32.5, w: 1.0, h: 2.1 },
          { at: 27.5, w: 1.0, h: 2.1 },
          { at: 22.5, w: 1.0, h: 2.1 },
          { at: 19, w: 1.4, h: 2.3 },
        ],
      },
      base: "tile_green",
      floorTint: 0x8a9a88,
      wallTint: 0xa8c0a8,
      wain: { mat: "tile_green", h: 1.2, tint: 0x6a8a70 },
      ceilTint: 0x9a9a88,
    });
    for (let z = oz + WZ1 - 4; z > oz + WZ0; z -= 6) {
      const dead = ((z - oz) | 0) % 12 === 0;
      b.box("lamp_white", ox, WH - 0.05, z, 0.25, 0.05, 1.4, {
        grime: 0,
        tint: dead ? 0x3a3a3a : 0xffffff,
      });
      if (!dead) glows.add(ox, WH - 0.15, z, 0xd8f0d0, "m");
    }
    // signs over the ward doors
    b.panel("atlas_paint", ox - WX + 0.17, 2.7, oz + WZ0 + 43, 1.8, 0.4, HP, {
      rect: K.paint("bv_wardsign", 512, 110),
      grime: 0.3,
    });
    b.panel("atlas_paint", ox - WX + 0.17, 2.7, oz + WZ0 + 15, 1.8, 0.4, HP, {
      rect: K.paint("bv_wardsignB", 512, 110),
      grime: 0.3,
    });
    b.panel("atlas_paint", ox, 2.9, oz + WZ0 + 0.17, 2.4, 0.5, 0, {
      rect: K.paint("bv_theatre", 512, 110),
      grime: 0.3,
    });
    b.panel("atlas_paint", ox + WX - 0.17, 2.7, oz + WZ0 + 19, 1.8, 0.4, -HP, {
      rect: K.paint("bv_morgue", 512, 110),
      grime: 0.3,
    });
    // corridor clutter: gurneys, blood trail, a toppled drug cart, restraint chairs
    b.geo("flesh", T.cyl12, {
      x: ox - 0.4,
      y: 0.01,
      z: oz - 12,
      sx: 0.4,
      sy: 0.005,
      sz: 6,
      tint: 0x4a1a12,
      grime: 0,
    });
    b.box("hosp_white", ox + 1.2, 0, oz + 4, 0.7, 0.9, 1.1, {
      yaw: 0.4,
      rz: 1.3,
      tint: 0xb8bcb4,
    });
    F.papers(b, ox - 2, oz + WZ0 + 1, ox + 2, oz + WZ1 - 1, 0, 30, {
      tint: 0xb8b09a,
    });
    // ---- Ward A (west, z 6..20) ----
    K.room(b, {
      x0: ox - 14,
      x1: ox - WX,
      z0: oz + 6,
      z1: oz + 20,
      y: 0,
      h: WH,
      floor: "tile_floor",
      wall: "wall_hosp",
      ceil: "plaster",
      doors: { e: [{ at: 7, w: 1.6, h: 2.4 }] },
      base: "tile_green",
      floorTint: 0x8a9a88,
      wallTint: 0xb8c8b0,
      ceilTint: 0x9a9a88,
    });
    for (let k = 0; k < 4; k++)
      for (const x of [ox - 12.6])
        F.bed(b, x, 0, oz + 8 + k * 3.2, -HP, {
          hospital: true,
          restraints: true,
          sheetTint: 0xc8c4b0,
          blood: k === 2,
        });
    for (let k = 0; k < 3; k++)
      F.bed(b, ox - 6.6, 0, oz + 9.5 + k * 3.8, HP, {
        hospital: true,
        sheetTint: 0xb8b4a0,
      });
    for (let k = 0; k < 3; k++) {
      b.panel("glass_broken", ox - 13.83, 2.0, oz + 9 + k * 4.5, 1.2, 1.4, HP, {
        tint: 0x6a7a60,
        grime: 0.3,
      });
      for (let j = 0; j < 5; j++)
        b.beam(
          "black_metal",
          ox - 13.8,
          1.3,
          oz + 8.5 + k * 4.5 + j * 0.25,
          ox - 13.8,
          2.7,
          oz + 8.5 + k * 4.5 + j * 0.25,
          0.02,
        );
      F.shaft(b, ox - 13.7, 2.6, oz + 9 + k * 4.5, HP, 1.2, 4, 0.9, {
        tint: 0x7a8a60,
      });
    }
    // ---- Day room (west, z -8..6) ----
    K.room(b, {
      x0: ox - 14,
      x1: ox - WX,
      z0: oz - 8,
      z1: oz + 6,
      y: 0,
      h: WH,
      floor: "carpet_green",
      wall: "wallpaper",
      ceil: "plaster",
      doors: { e: [{ at: 7, w: 1.6, h: 2.4 }] },
      base: "walnut",
      floorTint: 0x5a6a50,
      wallTint: 0xa8a880,
      ceilTint: 0x9a9a88,
      surface: "carpet",
    });
    b.box("walnut", ox - 13.2, 0, oz - 1, 1.2, 1.3, 2.4, { tint: 0x3a2418 });
    b.box("glass_broken", ox - 12.58, 0.5, oz - 1, 0.02, 0.5, 0.7, {
      faces: "e",
    }); // console TV
    K.colBox(ox - 13.8, 0, oz - 2.2, ox - 12.6, 1.3, oz + 0.2, {
      surface: "wood",
    });
    for (let k = 0; k < 6; k++)
      F.chair(
        b,
        ox - 9.5 + (k % 3) * 1.2,
        0,
        oz - 3 + Math.floor(k / 3) * 2.4,
        -HP,
        { mat: "walnut", seat: "cloth_green", knocked: k === 4 },
      );
    b.box("black_metal", ox - 5, 0, oz + 3.8, 1.6, 1.2, 0.7, {
      tint: 0x1a1612,
    });
    b.box("paint_white", ox - 5, 0.95, oz + 3.44, 1.5, 0.06, 0.02, {
      faces: "s",
      tint: 0xd8d0b8,
    }); // upright piano
    K.colBox(ox - 5.8, 0, oz + 3.45, ox - 4.2, 1.2, oz + 4.15, {
      surface: "wood",
    });
    F.table(b, ox - 6, 0, oz - 5, 0, { round: true, r: 0.6, mat: "walnut" });
    b.box("paper", ox - 6.1, 0.76, oz - 5.1, 0.35, 0.02, 0.35, {
      tint: 0x8a3a2a,
      yaw: 0.3,
    }); // board game
    // ---- Ward B / Brute larder (west, z -22..-8) ----
    K.room(b, {
      x0: ox - 14,
      x1: ox - WX,
      z0: oz - 22,
      z1: oz - 8,
      y: 0,
      h: WH,
      floor: "tile_floor",
      wall: "wall_hosp",
      ceil: "plaster",
      doors: { e: [{ at: 7, w: 1.6, h: 2.4 }] },
      base: "tile_green",
      floorTint: 0x6a5a48,
      wallTint: 0x8a9078,
      ceilTint: 0x7a7a68,
      grime: 0.8,
    });
    b.burn(ox - 8, 1, oz - 15, 6, 0.5);
    for (let k = 0; k < 5; k++) {
      const x = ox - 12 + k * 2.2;
      b.beam("rust", x, WH, oz - 20, x, WH - 1.1, oz - 20, 0.03);
      b.geo("rust", T.torus, { x, y: WH - 1.15, z: oz - 20, s: 0.12 });
      if (k % 2 === 0)
        b.geo("flesh", T.sphereLo, {
          x,
          y: WH - 1.8,
          z: oz - 20,
          sx: 0.28,
          sy: 0.6,
          sz: 0.25,
          tint: 0x6a3024,
        });
    }
    for (let k = 0; k < 3; k++) {
      const x = ox - 11 + k * 3.4;
      b.box("black_metal", x, 0, oz - 12, 1.4, 1.6, 1.4, {
        faces: "t",
        tint: 0x2a2a28,
      });
      for (let j = 0; j < 6; j++)
        for (const s2 of [-0.7, 0.7]) {
          b.beam(
            "black_metal",
            x - 0.7 + j * 0.28,
            0,
            oz - 12 + s2,
            x - 0.7 + j * 0.28,
            1.6,
            oz - 12 + s2,
            0.025,
          );
          b.beam(
            "black_metal",
            x + s2,
            0,
            oz - 12.7 + j * 0.28,
            x + s2,
            1.6,
            oz - 12.7 + j * 0.28,
            0.025,
          );
        }
      K.colBox(x - 0.7, 0, oz - 12.7, x + 0.7, 1.6, oz - 11.3, {
        surface: "metal",
      });
    }
    F.bones(b, ox - 8, 0, oz - 17, 14);
    F.bones(b, ox - 5, 0, oz - 9.5, 8);
    b.geo("flesh", T.cyl12, {
      x: ox - 7,
      y: 0.01,
      z: oz - 16,
      sx: 2.4,
      sy: 0.005,
      sz: 1.8,
      tint: 0x3a1410,
      grime: 0,
    });
    for (let k = 0; k < 4; k++)
      b.box(
        "cloth_green",
        ox - 12.8 + k * 0.6,
        0.01,
        oz - 16 + (k % 2) * 1.1,
        1.2,
        0.15,
        2.0,
        { yaw: k * 0.4, tint: 0x4a4a30, grime: 0.9 },
      ); // Brute bedding
    // ---- Nurses' station (east, z 10..20) + pharmacy (east, z -10..10, behind a gate) ----
    K.room(b, {
      x0: ox + WX,
      x1: ox + 14,
      z0: oz + 10,
      z1: oz + 20,
      y: 0,
      h: WH,
      floor: "tile_floor",
      wall: "wall_cream",
      ceil: "plaster",
      doors: { s: [{ at: 9, w: 1.6, h: 2.4 }], w: [{ at: 5, w: 1.4, h: 2.3 }] },
      base: "tile_green",
      floorTint: 0x9a9a88,
      wallTint: 0xc8c0a0,
      ceilTint: 0x9a9a88,
    });
    b.box("oak", ox + 6, 0, oz + 15, 1.0, 1.05, 6, { tint: 0x5a4a34 });
    K.colBox(ox + 5.5, 0, oz + 12, ox + 6.5, 1.05, oz + 18, {
      surface: "wood",
    });
    F.shelf(b, ox + 13.6, 0, oz + 15, -HP, {
      mat: "hosp_white",
      fill: "jars",
      w: 4,
      h: 2.2,
      tint: 0xc8ccc4,
    });
    b.box("cloth_white", ox + 10, 1.6, oz + 19.83, 2.4, 1.4, 0.02, {
      faces: "n",
      tint: 0xe0d8c0,
    }); // patient board
    K.room(b, {
      x0: ox + 8,
      x1: ox + 14,
      z0: oz - 10,
      z1: oz + 10,
      y: 0,
      h: WH,
      floor: "tile_floor",
      wall: "tile_white",
      ceil: "plaster",
      walls: "nswe",
      doors: { n: [{ at: 3.5, w: 1.6, h: 2.4 }] },
      floorTint: 0x9a9a88,
      wallTint: 0xd8dcd0,
    });
    for (let k = 0; k < 3; k++)
      F.shelf(b, ox + 13.6, 0, oz - 6 + k * 5, -HP, {
        mat: "hosp_white",
        fill: "jars",
        w: 4,
        h: 2.4,
        tint: 0xc8ccc4,
        sparse: 0.5,
      });
    F.shelf(b, ox + 8.4, 0, oz - 3, HP, {
      mat: "hosp_white",
      fill: "boxes",
      w: 4,
      h: 2.4,
      tint: 0xc8ccc4,
    });
    b.box("lamp_white", ox + 11, WH - 0.05, oz, 0.25, 0.05, 1.6, { grime: 0 });
    glows.add(ox + 11, WH - 0.15, oz, 0xe8f8ff, "m");
    // ---- padded cells (east, 4 × 5 m, z -10..10 → x 2.5..8) ----
    for (let k = 0; k < 4; k++) {
      const z0 = oz - 10 + k * 5,
        z1 = z0 + 5;
      K.room(b, {
        x0: ox + WX,
        x1: ox + 8,
        z0,
        z1,
        y: 0,
        h: WH,
        floor: "cloth_white",
        wall: "cloth_white",
        ceil: "plaster",
        doors: { w: [{ at: 2.5, w: 1.0, h: 2.1 }] },
        floorTint: 0xa8a090,
        wallTint: 0xc8c0a8,
        surface: "carpet",
        grime: 0.7,
      });
      // quilting: tufted buttons on the walls
      for (let y = 0.5; y < 3; y += 0.5)
        for (let zz = z0 + 0.5; zz < z1; zz += 0.5)
          b.geo("cloth_white", T.sphereLo, {
            x: ox + 7.84,
            y,
            z: zz,
            s: 0.05,
            tint: 0x9a9280,
            grime: 0.4,
          });
      if (k === 1)
        b.panel("atlas_paint", ox + 7.8, 1.7, (z0 + z1) / 2, 3.2, 2.6, -HP, {
          rect: K.paint("bv_scrawl", 512, 512),
          grime: 0,
        });
      // cell door leaves swung open into the cells (small observation window)
      b.box(
        "hosp_white",
        ox + WX + 0.6,
        0,
        z0 + 2.5 - 0.5 + 0.6,
        0.08,
        2.1,
        1.0,
        { yaw: -0.9, tint: 0x9aa89a },
      );
    }
    // cell walls share with pharmacy (x = 8) — pharmacy has its own skins
    // ---- Stairwell down to the morgue (east, z -22..-10) ----
    K.room(b, {
      x0: ox + WX,
      x1: ox + 8,
      z0: oz - 22,
      z1: oz - 10,
      y: MY,
      h: WH - MY,
      floor: "concrete",
      wall: "wall_grey",
      ceil: "plaster",
      doors: {
        w: [{ at: 11, w: 1.4, h: 2.3, y: -MY }],
        n: [{ at: 4.3, w: 2.2, h: 2.6 }],
      },
      wallTint: 0x8a8e84,
      floorTint: 0x6a6a64,
    });
    K.slab(b, "concrete", ox + WX, oz - 12, ox + 8, oz - 10, 0, {
      th: 0.3,
      tint: 0x8a8a84,
      faces: "tb",
    });
    b.stairs("concrete", ox + 6.8, oz - 22, 0, 1, 2.2, 10, MY, 0, 18, {
      tint: 0x8a8a84,
      solid: true,
    });
    b.box("concrete", ox + 4.1, MY, oz - 16.5, 3.2, -MY - 0.3, 9, {
      faces: "e",
      tint: 0x7a7a74,
    });
    F.railing(b, ox + 5.6, oz - 12, ox + 5.6, oz - 21.5, 0.4, {
      mat: "black_metal",
      h: 0.9,
      col: false,
    });
    F.railing(b, ox + WX, oz - 12, ox + 5.6, oz - 12, 0, {
      mat: "black_metal",
      h: 1.0,
    });

    // =========================== OPERATING THEATRE ===========================
    const TX0 = ox - 12,
      TX1 = ox + 12,
      TZ0 = oz - 52,
      TZ1 = oz - 30,
      TH = 9;
    K.room(b, {
      x0: TX0,
      x1: TX1,
      z0: TZ0,
      z1: TZ1,
      y: -2.5,
      h: TH + 2.5,
      floor: null,
      wall: "tile_white",
      ceil: "plaster",
      doors: { s: [{ at: 12, w: 2.2, h: 2.6, y: 2.5 }] },
      wallTint: 0xd0d8cc,
      ceilTint: 0xb0b0a0,
      grime: 0.6,
    });
    // entry level (y 0) around three sides, then three stepped rows down to the pit (y -2)
    const PITX = 7,
      PITZ0 = -50,
      PITZ1 = -39; // pit: x ±7, z -50..-39
    const ringLvl = (ex, ez, y, mat, tint) => {
      // region: x ±ex, z from TZ0+2 to TZ-relative ez (south boundary), minus inner
      return { ex, ez, y, mat, tint };
    };
    void ringLvl;
    const tiers = [
      { e: 10, s: -36, y: 0 },
      { e: 9, s: -37, y: -0.5 },
      { e: 8, s: -38, y: -1.0 },
      { e: 7, s: -39, y: -1.5 },
    ];
    // level 0: outer band (walls → e=10 / s=-36)
    K.slab(b, "terrazzo", TX0, oz - 36, TX1, TZ1, 0, {
      th: 2.5,
      faces: "t",
      tint: 0xa8a898,
    });
    K.slab(b, "terrazzo", TX0, TZ0, ox - 10, oz - 36, 0, {
      th: 2.5,
      faces: "t",
      tint: 0xa8a898,
    });
    K.slab(b, "terrazzo", ox + 10, TZ0, TX1, oz - 36, 0, {
      th: 2.5,
      faces: "t",
      tint: 0xa8a898,
    });
    for (let k = 1; k < tiers.length; k++) {
      const o = tiers[k - 1],
        t = tiers[k];
      const tint = 0x8a9a88;
      // west strip, east strip, south strip of this row
      b.box(
        "terrazzo",
        ox - (o.e + t.e) / 2,
        -2.5,
        (TZ0 + 2 + oz + o.s) / 2,
        o.e - t.e,
        t.y + 2.5,
        oz + o.s - (TZ0 + 2),
        { faces: "nsewt", tint },
      );
      K.colBox(ox - o.e, -2.5, TZ0 + 2, ox - t.e, t.y, oz + o.s, {
        surface: "concrete",
      });
      b.box(
        "terrazzo",
        ox + (o.e + t.e) / 2,
        -2.5,
        (TZ0 + 2 + oz + o.s) / 2,
        o.e - t.e,
        t.y + 2.5,
        oz + o.s - (TZ0 + 2),
        { faces: "nsewt", tint },
      );
      K.colBox(ox + t.e, -2.5, TZ0 + 2, ox + o.e, t.y, oz + o.s, {
        surface: "concrete",
      });
      b.box(
        "terrazzo",
        ox,
        -2.5,
        oz + (o.s + t.s) / 2,
        t.e * 2,
        t.y + 2.5,
        o.s - t.s,
        { faces: "nsewt", tint },
      );
      K.colBox(ox - t.e, -2.5, oz + t.s, ox + t.e, t.y, oz + o.s, {
        surface: "concrete",
      });
      // gallery rails on the row edge (wooden) + benches
      F.bench(b, ox, t.y, oz + (o.s + t.s) / 2 + 0.05, PI, t.e * 2 - 1, {
        mat: "walnut",
        back: false,
      });
    }
    // north band behind the pit (y -2) — the pit floor extends to the north wall
    K.slab(b, "tile_floor", ox - PITX, TZ0, ox + PITX, oz + PITZ1, -2, {
      th: 0.5,
      faces: "t",
      tint: 0x8a9a90,
    });
    K.slab(b, "tile_floor", TX0, TZ0, ox - PITX, TZ0 + 2, -2, {
      th: 0.5,
      faces: "t",
      tint: 0x8a9a90,
    });
    K.slab(b, "tile_floor", ox + PITX, TZ0, TX1, TZ0 + 2, -2, {
      th: 0.5,
      faces: "t",
      tint: 0x8a9a90,
    });
    for (const sgn of [-1, 1])
      F.railing(b, ox + sgn * 10, oz - 36, ox + sgn * 10, TZ0 + 2, 0, {
        mat: "walnut",
        h: 0.9,
        col: false,
      });
    F.railing(b, ox - 10, oz - 36, ox - 1.4, oz - 36, 0, {
      mat: "walnut",
      h: 0.9,
      col: false,
    });
    F.railing(b, ox + 1.4, oz - 36, ox + 10, oz - 36, 0, {
      mat: "walnut",
      h: 0.9,
      col: false,
    });
    // the operating table, lamp, instruments, anaesthesia trolley, X-ray light boxes
    const OTZ = oz - 45;
    b.cyl("chrome", ox, -2, OTZ, 0.35, 0.25, 0.9, 10, { grime: 0.3 });
    b.box("chrome", ox, -1.1, OTZ, 0.75, 0.12, 2.1, { grime: 0.4 });
    b.box("flesh", ox, -0.98, OTZ, 0.62, 0.06, 1.9, {
      tint: 0x5a2018,
      grime: 0.3,
    }); // blood-soaked sheet
    K.colBox(ox - 0.4, -2, OTZ - 1.05, ox + 0.4, -0.95, OTZ + 1.05, {
      surface: "metal",
    });
    b.beam("chrome", ox, TH, OTZ, ox, 4.2, OTZ, 0.1);
    b.geo(
      "chrome",
      new THREE.SphereGeometry(1.4, 16, 6, 0, PI * 2, 0, PI / 2.2),
      { x: ox, y: 3.6, z: OTZ, tint: 0xc8ccc8, grime: 0.3 },
    );
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * PI * 2,
        rr = k === 0 ? 0 : 0.7;
      b.geo("lamp_white", T.sphereLo, {
        x: ox + Math.cos(a) * rr,
        y: 3.45,
        z: OTZ + Math.sin(a) * rr,
        s: 0.18,
        grime: 0,
      });
    }
    glows.add(ox, 3.3, OTZ, 0xf4fff4, "l");
    F.shaft(b, ox, 3.4, OTZ, 0, 1.8, 4.5, 0.02, { tint: 0x8a9a8a });
    b.box("chrome", ox + 1.4, -2, OTZ - 0.5, 0.6, 0.85, 0.4, {});
    for (let k = 0; k < 5; k++)
      b.box("steel", ox + 1.25 + k * 0.07, -1.14, OTZ - 0.5, 0.02, 0.01, 0.25, {
        grime: 0.2,
      });
    b.box("army_green", ox - 1.6, -2, OTZ + 0.5, 0.7, 1.3, 0.6, {
      tint: 0x6a8a74,
    });
    b.cyl("metal", ox - 1.6, -0.7, OTZ + 0.5, 0.15, 0.15, 0.8, 8, {
      tint: 0x8aa0aa,
    });
    b.panel("atlas_lit", ox, 1.4, TZ0 + 0.17, 5, 2.4, 0, {
      rect: K.litPaint("bv_xray", 512, 256),
      grime: 0,
    });
    glows.add(ox, 1.4, TZ0 + 0.4, 0xc8dce8, "l");
    F.cabinets(b, ox - 5.5, -2, TZ0 + 0.5, 0, 3, { tint: 0xb8c0b8 });
    F.cabinets(b, ox + 5.5, -2, TZ0 + 0.5, 0, 3, { tint: 0xb8c0b8 });
    F.bones(b, ox + 3, -2, OTZ + 2, 12);
    F.bones(b, ox - 4, -1.5, oz - 38.5, 6, { skull: false });
    b.geo("flesh", T.cyl12, {
      x: ox + 0.5,
      y: -1.99,
      z: OTZ + 0.8,
      sx: 1.8,
      sy: 0.005,
      sz: 1.3,
      tint: 0x3a1410,
      grime: 0,
    });
    F.papers(b, ox - 6, TZ0 + 1, ox + 6, OTZ + 4, -2, 14, { tint: 0xb8b09a });
    // high windows (clerestory), dim green daylight
    for (const x of [TX0 + 0.17, TX1 - 0.17])
      for (const z of [oz - 47, oz - 40, oz - 33]) {
        b.panel("glass_broken", x, 6.5, z, 2.4, 2.4, x < ox ? HP : -HP, {
          tint: 0x6a7a60,
          grime: 0.2,
        });
        F.shaft(b, x, 7.4, z, x < ox ? HP : -HP, 2.2, 8, 0.7, {
          tint: 0x6a7a58,
        });
      }

    // =========================== MORGUE ===========================
    const MX0 = ox + 2,
      MX1 = ox + 24,
      MZ0 = oz - 46,
      MZ1 = oz - 22;
    K.room(b, {
      x0: MX0,
      x1: MX1,
      z0: MZ0,
      z1: MZ1,
      y: MY,
      h: 3.4,
      floor: "tile_green",
      wall: "tile_white",
      ceil: "ceil_tile",
      doors: {
        s: [{ at: 4.8, w: 2.2, h: 2.6 }],
        n: [{ at: 11, w: 1.8, h: 2.4 }],
      },
      floorTint: 0x7a8a80,
      wallTint: 0xb8c4bc,
      ceilTint: 0x8a8a84,
      base: "tile_green",
    });
    // stairwell overlap: the stairwell room (x 2.5..8, z -22..-10) opens onto the morgue's south door
    // cold-drawer wall (west) — 3 rows × 7 steel doors, some pulled open with a tray
    for (let r2 = 0; r2 < 3; r2++)
      for (let k = 0; k < 7; k++) {
        const z = MZ0 + 3 + k * 1.5,
          y = MY + 0.3 + r2 * 0.95;
        const open = (r2 * 7 + k) % 5 === 2;
        b.box("steel", MX0 + 0.3, y, z, 0.3, 0.85, 1.35, {
          tint: 0xa8b0ac,
          grime: 0.4,
        });
        if (open) {
          b.box("black", MX0 + 0.46, y + 0.05, z, 0.02, 0.75, 1.2, {
            faces: "e",
            grime: 0,
          });
          b.box("steel", MX0 + 1.3, y + 0.15, z, 1.8, 0.05, 1.1, {
            tint: 0xa8b0ac,
          });
          if (k % 2)
            b.box("cloth_white", MX0 + 1.3, y + 0.2, z, 1.6, 0.18, 0.7, {
              tint: 0x9a9a88,
            });
        } else
          b.box("chrome", MX0 + 0.47, y + 0.4, z + 0.45, 0.04, 0.08, 0.2, {
            grime: 0.2,
          });
      }
    K.colBox(MX0, MY, MZ0 + 2.2, MX0 + 0.5, MY + 3, MZ0 + 13.2, {
      surface: "metal",
    });
    // autopsy tables with drains & scales
    for (const p of [
      [ox + 12, oz - 30],
      [ox + 12, oz - 37],
    ]) {
      b.cyl("chrome", p[0], MY, p[1], 0.3, 0.25, 0.8, 8);
      b.box("chrome", p[0], MY + 0.8, p[1], 0.9, 0.1, 2.2, { tint: 0xb8bcb8 });
      b.box("cloth_white", p[0], MY + 0.9, p[1] + 0.1, 0.6, 0.25, 1.7, {
        tint: 0x9a9888,
        grime: 0.6,
      });
      K.colBox(p[0] - 0.45, MY, p[1] - 1.1, p[0] + 0.45, MY + 0.9, p[1] + 1.1, {
        surface: "metal",
      });
      b.beam(
        "chrome",
        p[0] + 1.3,
        MY + 2.2,
        p[1],
        p[0] + 1.3,
        MY + 3.4,
        p[1],
        0.02,
      );
      b.cyl("chrome", p[0] + 1.3, MY + 1.9, p[1], 0.2, 0.2, 0.05, 10);
      b.box("lamp_white", p[0], MY + 3.35, p[1], 0.3, 0.05, 1.2, { grime: 0 });
      glows.add(p[0], MY + 3.2, p[1], 0xc8e8ff, "m");
    }
    // body bags on gurneys, drains, a cold room door
    for (let k = 0; k < 3; k++) {
      const x = ox + 18 + k * 1.8,
        z = oz - 26;
      b.box("hosp_white", x, MY + 0.8, z, 0.7, 0.08, 2, { yaw: 0.1 * k });
      b.geo("army_green", T.sphereLo, {
        x,
        y: MY + 1.0,
        z,
        sx: 0.3,
        sy: 0.15,
        sz: 0.9,
        ry: 0.1 * k,
        tint: 0x2a3a2a,
      });
      for (const c of [
        [-0.3, -0.9],
        [0.3, -0.9],
        [-0.3, 0.9],
        [0.3, 0.9],
      ]) {
        const p = F.rot(x, z, 0.1 * k, c[0], c[1]);
        b.beam("chrome", p[0], MY, p[1], p[0], MY + 0.8, p[1], 0.03);
      }
    }
    for (const z of [oz - 30, oz - 37])
      b.cyl("black_metal", ox + 12, MY + 0.005, z + 1.6, 0.12, 0.12, 0.01, 8);
    b.box("steel", MX1 - 0.3, MY, oz - 40, 0.3, 2.3, 1.6, { tint: 0x9aa4a0 }); // cold room door (sealed)
    b.box("chrome", MX1 - 0.47, MY + 1.1, oz - 39.5, 0.06, 0.1, 0.35);
    // pathologist's office (north-east corner partition)
    K.room(b, {
      x0: ox + 18,
      x1: MX1,
      z0: MZ0,
      z1: oz - 40.5,
      y: MY,
      h: 3.0,
      floor: "tile_floor",
      wall: "wall_hosp",
      ceil: "ceil_tile",
      walls: "ws",
      doors: { w: [{ at: 2.8, w: 1.2, h: 2.2 }] },
      floorTint: 0x7a8a80,
      wallTint: 0xa8b8a8,
    });
    F.desk(b, ox + 21.5, MY, MZ0 + 2, 0, {
      mat: "metal",
      tint: 0x6a7068,
      w: 1.4,
      papers: true,
    });
    F.chair(b, ox + 21.5, MY, MZ0 + 2.9, PI, {
      mat: "black_metal",
      seat: "leather_brown",
      knocked: true,
    });
    F.cabinets(b, MX1 - 0.4, MY, MZ0 + 3.8, -HP, 2, { tint: 0x6a7068 });
    // Kessler-Haas sealed door frame (north wall) with hazard stripes & warning sign
    b.panel("atlas_paint", ox + 13, MY + 2.8, MZ0 + 0.17, 2.6, 1.3, 0, {
      rect: K.paint("bv_kesslerhaas", 512, 256),
      grime: 0.3,
    });
    for (const sx of [-1.15, 1.15])
      b.box("paint_yellow", ox + 13 + sx, MY, MZ0 + 0.2, 0.25, 2.5, 0.2, {
        tint: 0xc8a020,
      });
    glows.add(ox + 14.6, MY + 2.4, MZ0 + 0.4, 0xff3020, "s");
    F.papers(b, MX0 + 1, MZ0 + 1, MX1 - 1, MZ1 - 1, MY, 20, { tint: 0xb0b0a0 });

    // =========================== K-agent LAB ===========================
    // descent passage (morgue north door → lab), 7 m below the morgue? no: 3 m (y -7 → -10)
    K.room(b, {
      x0: ox + 11,
      x1: ox + 15,
      z0: oz - 56,
      z1: MZ0,
      y: LY,
      h: MY - LY + 3,
      floor: null,
      wall: "concrete_panel",
      ceil: "concrete",
      walls: "ew",
      wallTint: 0x7a8078,
    });
    b.stairs("plate", ox + 13, MZ0 - 8.2, 0, 1, 3.2, 8, LY, MY, 8, {
      tint: 0x6a6e68,
      solid: true,
    });
    b.box("lamp_red", ox + 14.9, MY + 1.5, oz - 50, 0.05, 0.2, 0.4, {
      grime: 0,
    });
    glows.add(ox + 14.7, MY + 1.5, oz - 50, 0xff3020, "s");
    const LX0 = ox - 6,
      LX1 = ox + 32,
      LZ0 = oz - 86,
      LZ1 = oz - 56;
    K.room(b, {
      x0: LX0,
      x1: LX1,
      z0: LZ0,
      z1: LZ1,
      y: LY,
      h: 5.5,
      floor: "plate",
      wall: "concrete_panel",
      ceil: "metal_dark",
      doors: {
        s: [{ at: 19, w: 3.8, h: 3.0 }],
        w: [{ at: 15, w: 1.8, h: 2.5 }],
      },
      floorTint: 0x5a625a,
      wallTint: 0x8a948a,
      ceilTint: 0x3a3e3a,
      surface: "metal",
      grime: 0.6,
    });
    // K-agent tanks: two rows of three tall glass cylinders with glowing contents, pipework to a header
    const tankT = K.litPaint("bv_tank", 128, 512),
      tankE = K.litPaint("bv_tank_empty", 128, 512);
    const tanks = [];
    for (let row = 0; row < 2; row++)
      for (let k = 0; k < 3; k++) {
        const x = ox + 4 + k * 8,
          z = oz - 70 - row * 8,
          broken = (row === 1 && k === 2) || (row === 0 && k === 0);
        tanks.push([x, z, broken]);
        b.cyl("steel", x, LY, z, 1.4, 1.4, 0.6, 16, { tint: 0x6a7470 });
        b.cyl("steel", x, LY + 4.3, z, 1.4, 1.2, 0.6, 16, { tint: 0x6a7470 });
        if (!broken) {
          const cg = new THREE.CylinderGeometry(1.1, 1.1, 3.7, 20, 1, true);
          b.geo("atlas_lit", cg, {
            x,
            y: LY + 2.45,
            z,
            uv: "rect",
            rect: row === 0 && k === 1 ? tankE : tankT,
          });
          cg.dispose();
          b.cyl("glass_clear", x, LY + 0.6, z, 1.15, 1.15, 3.7, 20, {
            top: false,
            grime: 0,
          });
          glows.add(x, LY + 2.4, z, 0x60ff70, "l");
        } else {
          for (let s2 = 0; s2 < 5; s2++) {
            const a = (s2 / 5) * PI * 2;
            b.geo("glass_base", T.cone4, {
              x: x + Math.cos(a) * 1.05,
              y: LY + 0.9,
              z: z + Math.sin(a) * 1.05,
              s: 0.25,
              sy: 0.6 + s2 * 0.1,
              tint: 0xa8d0b0,
              grime: 0.2,
            });
          }
          b.geo("lamp_fev", T.cyl12, {
            x: x + 1.2,
            y: LY + 0.02,
            z: z + 0.8,
            sx: 2.4,
            sy: 0.01,
            sz: 1.8,
            grime: 0,
          });
          glows.add(x + 1, LY + 0.3, z + 0.6, 0x60ff60, "l");
        }
        for (let p = 0; p < 3; p++)
          b.beam(
            "steel",
            x - 0.8 + p * 0.8,
            LY + 4.9,
            z,
            x - 0.8 + p * 0.8,
            LY + 5.5,
            z,
            0.12,
            { round: 8 },
          );
        K.colBox(x - 1.4, LY, z - 1.4, x + 1.4, LY + 4.9, z + 1.4, {
          surface: "metal",
        });
      }
    for (const z of [oz - 70, oz - 78])
      F.pipe(b, ox + 2, LY + 5.2, z, ox + 22, LY + 5.2, z, 0.2, {
        mat: "steel",
        tint: 0x7a847e,
      });
    // containment pods along the east wall (hunched shapes in murky tubes)
    for (let k = 0; k < 4; k++) {
      const z = oz - 82 + k * 6,
        x = LX1 - 1.6;
      b.box("steel", x, LY, z, 2.2, 0.5, 2.2, { tint: 0x5a6460 });
      b.box("steel", x, LY + 3.4, z, 2.2, 0.5, 2.2, { tint: 0x5a6460 });
      const cg = new THREE.CylinderGeometry(0.95, 0.95, 2.9, 16, 1, true);
      b.geo("atlas_lit", cg, { x, y: LY + 1.95, z, uv: "rect", rect: tankT });
      cg.dispose();
      glows.add(x, LY + 2, z, 0x50e060, "m");
      K.colBox(x - 1.1, LY, z - 1.1, x + 1.1, LY + 3.9, z + 1.1, {
        surface: "metal",
      });
    }
    // lab benches with glassware, centrifuges, a gurney with a half-mutated corpse
    for (let k = 0; k < 3; k++) {
      const x = ox + 4 + k * 8,
        z = oz - 60;
      b.box("hosp_white", x, LY, z, 4, 0.9, 1.1, { tint: 0xb8c0b8 });
      b.box("marble_black", x, LY + 0.9, z, 4.1, 0.05, 1.2, { tint: 0x3a3e3a });
      K.colBox(x - 2, LY, z - 0.55, x + 2, LY + 0.95, z + 0.55, {
        surface: "metal",
      });
      for (let j = 0; j < 6; j++)
        b.cyl(
          "glass_base",
          x - 1.6 + j * 0.6,
          LY + 0.95,
          z + (j % 2 ? 0.2 : -0.2),
          0.07,
          0.1,
          0.28,
          8,
          { tint: j % 3 ? 0x8ad09a : 0xd8e0d8, grime: 0.1 },
        );
      b.cyl("steel", x + 1.4, LY + 0.95, z, 0.3, 0.3, 0.35, 12, {
        tint: 0x8a9490,
      });
    }
    b.box("hosp_white", ox + 24, LY + 0.8, oz - 62, 0.8, 0.08, 2.1, {
      yaw: 0.2,
    });
    b.geo("flesh", T.sphereLo, {
      x: ox + 24,
      y: LY + 1.05,
      z: oz - 62,
      sx: 0.4,
      sy: 0.22,
      sz: 0.95,
      ry: 0.2,
      tint: 0x5a6a3a,
    });
    // observation office (west, glazed) with the lab terminal
    b.box("glass", LX0 + 6, LY + 1.0, oz - 72, 0.05, 1.8, 10, {
      faces: "ew",
      tint: 0x6a8a80,
      grime: 0.4,
    });
    b.box("concrete_panel", LX0 + 6, LY, oz - 72, 0.3, 1.0, 10, {
      tint: 0x7a847a,
    });
    K.colBox(LX0 + 5.85, LY, oz - 77, LX0 + 6.15, LY + 2.8, oz - 67.8, {
      surface: "concrete",
    });
    F.desk(b, LX0 + 3, LY, oz - 74, HP, { mat: "metal", tint: 0x6a7068 });
    F.cabinets(b, LX0 + 0.5, LY, oz - 70, HP, 3, { tint: 0x5a605a });
    // warning lights & hazard floor stripes, green puddles (radiation)
    for (let x = LX0 + 2; x < LX1; x += 6) {
      b.box("lamp_green", x, LY + 5.45, oz - 66, 0.3, 0.05, 1.8, { grime: 0 });
      glows.add(x, LY + 5.3, oz - 66, 0x90ffa0, "m");
    }
    b.box("paint_yellow", ox + 13, LY + 0.005, LZ1 - 1.5, 4, 0.01, 1.2, {
      faces: "t",
      tint: 0xb89820,
      grime: 0.5,
    });
    F.papers(b, LX0 + 1, LZ0 + 1, LX1 - 1, LZ1 - 1, LY, 30, { tint: 0xa8a890 });
    F.bones(b, ox + 10, LY, oz - 83, 12);
    F.bones(b, ox + 18, LY, oz - 66, 8);
    // emergency exit corridor (west door → ambulance tunnel)
    K.room(b, {
      x0: LX0 - 10,
      x1: LX0,
      z0: oz - 73,
      z1: oz - 69,
      y: LY,
      h: 3,
      floor: "concrete",
      wall: "concrete_panel",
      ceil: "concrete",
      walls: "nsw",
      floorTint: 0x6a6a64,
      wallTint: 0x7a7a70,
    });
    b.box("metal_dark", LX0 - 9.8, LY, oz - 71, 0.2, 2.4, 1.6, {
      tint: 0x6a6e68,
    });
    glows.add(LX0 - 9.5, LY + 2.7, oz - 71, 0x60ff80, "s");
    b.panel("atlas_lit", LX0 - 9.7, LY + 2.7, oz - 71, 1.0, 0.3, HP, {
      rect: K.litPaint("penn_tracks", 512, 128),
      grime: 0,
    });

    b.finish(rec.interiorRoot, { cast: false });
    glows.finish(rec.interiorRoot, {
      interior: true,
      nightOpacity: 0.95,
      flicker: 0.25,
    });

    const A = (n, x, y, z, yaw) => rec.anchor(n, x, y, z, yaw);
    A("entrance", ox, 0, oz + 34, 0);
    A("corridor", ox, 0, oz, 0);
    A("theatre", ox, -2, oz - 44, 0);
    A("morgue", ox + 12, MY, oz - 33, 0);
    A("lab", ox + 13, LY, oz - 66, 0);
    A("boss", ox + 12, LY, oz - 74, PI);
    A("pharmacy", ox + 11, 0, oz, 0);
    A("spawn1", ox - 7, 0, oz + 12, 0);
    A("spawn2", ox - 8, 0, oz - 14, 0);
    A("spawn3", ox, 0, oz - 20, 0);
    A("spawn4", ox + 5, -1.5, oz - 44, 0);
    A("spawn5", ox + 16, MY, oz - 33, 0);
    A("spawn6", ox + 20, LY, oz - 64, 0);
    return {
      arrival: { x: ox, y: 0, z: oz + 34.2, yaw: 0 },
      exitPos: new THREE.Vector3(ox, 1.6, oz + 35.7),
      emergencyDoor: new THREE.Vector3(LX0 - 9.4, LY + 1.4, oz - 71),
      emergencyArrival: { x: LX0 - 7.5, y: LY, z: oz - 71, yaw: -HP },
      ox,
      oz,
      MY,
      LY,
      MZ0,
      WZ0,
      LX0,
      OTZ,
    };
  }

