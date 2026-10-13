// play-inline-180 06 — tint
// Lines 1001-2022 of readable/play-inline-180.pretty.js (statement-aligned).
  function buildInterior(rec) {
    const O = G.LAYOUT.INTERIORS.metlife_tower.origin;
    const ox = O.x,
      oz = O.z;
    const b = K.builder("ml_int", {
      grime: 0.3,
      ambient: 1.1,
      maxLight: 2.8,
      gain: 1.35,
    });
    const glows = K.glowSet("ml_int");
    const EY = 4.6;
    const marble = 0xe8e4d8;
    b.light(ox, 5, oz + 20, 16, 0xf0f0e0, 1.1); // lobby
    for (const x of [-8, 0, 8])
      for (const z of [-12, -2, 8])
        b.light(ox + x, 3.8, oz + z, 8, 0xe8f0ff, 0.6); // claims tubes
    for (const x of [-8, 8])
      for (const z of [-12, 0, 8])
        b.light(ox + x, EY + 3.6, oz + z, 9, 0xfff0d8, 0.7); // exec floor
    b.light(ox + 17, 6, oz - 11, 8, 0xff5a40, 0.5); // stairwell emergency lamp

    // =========================== LOBBY ===========================
    K.room(b, {
      x0: ox - 10,
      x1: ox + 10,
      z0: oz + 12,
      z1: oz + 28,
      y: 0,
      h: 7,
      floor: "marble_t",
      wall: "marble_t",
      ceil: "plaster",
      doors: {
        s: [{ at: 10, w: 3, h: 3.6, arch: true }],
        n: [{ at: 10, w: 3, h: 3.2 }],
      },
      base: "marble_black",
      cornice: "gold",
      corniceH: 0.5,
      floorTint: 0xd8d4c8,
      wallTint: marble,
      wain: { mat: "marble_green", h: 1.3, tint: 0x5a7a64 },
    });
    K.coffers(b, "gold", ox - 10, oz + 12, ox + 10, oz + 28, 7, 2.66, 0.35, {
      tint: 0xb89048,
    });
    const lg = K.paint("ml_logo", 512, 512);
    b.panel("atlas_paint", ox, 4.6, oz + 12.17, 3.6, 3.6, 0, {
      rect: lg,
      grime: 0.2,
    });
    b.panel("atlas_paint", ox, 6.2, oz + 27.83, 9, 1.1, PI, {
      rect: K.paint("ml_name", 1600, 200),
      grime: 0.2,
    });
    // elevator bank (west) — express car to the clock (working, robots keep it powered)
    for (let k = 0; k < 3; k++) {
      const z = oz + 15 + k * 4;
      b.box("bronze", ox - 9.8, 0, z, 0.3, 3.2, 2.2, { tint: 0x7a5a30 });
      b.panel("atlas_paint", ox - 9.63, 1.5, z, 1.4, 2.8, HP, {
        rect: K.paint("wa_elev", 256, 512),
        grime: 0.3,
      });
      glows.add(ox - 9.5, 3.4, z, k === 1 ? 0x60ff80 : 0x6a5030, "s");
    }
    // security desk + three patrolman charging pods (east)
    b.box("marble_black", ox + 5, 0, oz + 20, 1.2, 1.1, 5, { tint: 0x6a6a64 });
    K.colBox(ox + 4.4, 0, oz + 17.5, ox + 5.6, 1.1, oz + 22.5, {
      surface: "concrete",
    });
    for (let k = 0; k < 3; k++) {
      const z = oz + 15.5 + k * 4.5,
        x = ox + 9.2;
      b.cyl("metal", x, 0, z, 0.9, 0.9, 0.25, 10, { tint: 0x5a6a70 });
      b.box("metal", x + 0.55, 0, z, 0.3, 2.6, 1.6, { tint: 0x5a6a70 });
      b.geo(
        "glass",
        new THREE.CylinderGeometry(0.85, 0.85, 2.4, 12, 1, true, -HP, PI),
        { x, y: 1.45, z, ry: 0, tint: 0x8aa0a0, grime: 0.3 },
      );
      b.box("metal", x, 2.6, z, 1.9, 0.3, 1.9, { tint: 0x5a6a70 });
      glows.add(x, 2.5, z, k === 2 ? 0xff4030 : 0x60c0ff, "s");
      K.colBox(x - 0.9, 0, z - 0.9, x + 0.9, 2.9, z + 0.9, {
        surface: "metal",
      });
    }
    // brass chandeliers
    for (const z of [16, 24])
      F.chandelier(b, glows, ox, 5.2, oz + z, 1.0, {
        tiers: 1,
        mat: "brass",
        chain: 1.6,
      });
    F.papers(b, ox - 9, oz + 13, ox + 9, oz + 27, 0, 14);

    // =========================== CLAIMS FLOOR ===========================
    const CX0 = ox - 14,
      CX1 = ox + 14,
      CZ0 = oz - 18,
      CZ1 = oz + 12,
      CH = 4.2;
    K.room(b, {
      x0: CX0,
      x1: CX1,
      z0: CZ0,
      z1: CZ1,
      y: 0,
      h: CH,
      floor: "tile_floor",
      wall: "wall_cream",
      ceil: "ceil_tile",
      doors: { s: [{ at: 14, w: 3, h: 3.2 }], e: [{ at: 13, w: 1.6, h: 2.5 }] },
      base: "walnut",
      floor: "terrazzo",
      floorTint: 0xd0c8b8,
      wallTint: 0xc8c0a0,
      wain: { mat: "walnut", h: 1.1, tint: 0x5a3a24 },
    });
    for (let x = CX0 + 4; x < CX1; x += 8)
      for (let z = CZ0 + 3; z < CZ1; z += 5) {
        b.box("lamp_white", ox + (x - ox), CH - 0.06, z, 0.25, 0.06, 2.6, {
          grime: 0,
        });
        glows.add(x, CH - 0.2, z, 0xe8f0ff, "s");
      }
    // desk grid (typing pool) with typewriters; aisles; some overturned
    const r = K.rng(1909);
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 4; j++) {
        const x = CX0 + 4 + i * 5,
          z = CZ0 + 4 + j * 5.5;
        if (i === 2 && j === 3) continue;
        if (r() < 0.12) {
          b.box("oak", x, 0, z, 1.4, 0.75, 0.8, {
            yaw: r() * 3,
            rz: 1.4,
            tint: 0x6a4a30,
          });
          continue;
        }
        F.desk(b, x, 0, z, PI, {
          mat: "oak",
          tint: 0xe0c8a0,
          w: 1.4,
          d: 0.75,
          typewriter: r() < 0.6,
          phone: r() < 0.3,
        });
        F.chair(b, x, 0, z + 0.8, PI, { mat: "oak", knocked: r() < 0.25 });
      }
    // pneumatic tubes along the ceiling, filing cabinets along the west wall, the actuarial engine (north wall)
    for (let k = 0; k < 3; k++)
      F.pipe(
        b,
        CX0 + 0.5,
        CH - 0.3 - k * 0.22,
        CZ0 + 1,
        CX0 + 0.5,
        CH - 0.3 - k * 0.22,
        CZ1 - 1,
        0.08,
        { mat: "brass", tint: 0x8a7040 },
      );
    for (let k = 0; k < 6; k++)
      F.cabinets(b, CX0 + 0.45, 0, CZ0 + 3 + k * 3.4, HP, 5, {
        tint: 0x5a6454,
      });
    for (let k = 0; k < 4; k++) {
      const x = ox - 7 + k * 3.2;
      b.box("metal", x, 0, CZ0 + 0.8, 2.8, 2.6, 1.2, { tint: 0x4a5048 });
      b.panel("atlas_lit", x, 1.5, CZ0 + 1.41, 2.4, 1.2, 0, {
        rect: K.litPaint("ml_mainframe", 512, 256),
        grime: 0,
      });
    }
    K.colBox(ox - 8.6, 0, CZ0 + 0.2, ox + 3.8, 2.6, CZ0 + 1.4, {
      surface: "metal",
    });
    b.panel("atlas_paint", ox + 9, 2.3, CZ0 + 0.17, 4.2, 1.4, 0, {
      rect: K.paint("ml_actuary", 768, 256),
      grime: 0.2,
    });
    // big wall clock (stopped) over the south door
    b.cyl("walnut", ox, 3.2, CZ1 - 0.25, 0.7, 0.7, 0.1, 16, { rx: HP });
    b.panel("atlas_lit", ox, 3.2, CZ1 - 0.34, 1.2, 1.2, PI, {
      rect: K.litPaint("penn_clockdial", 256, 256),
      grime: 0,
    });
    F.papers(b, CX0 + 1, CZ0 + 2, CX1 - 1, CZ1 - 1, 0, 70, { tint: 0xd8d0b8 });
    F.debris(b, CX1 - 3, 0, CZ1 - 3, 1.6, 12, {
      mats: ["plaster", "concrete_panel"],
    });

    // =========================== STAIRWELL ===========================
    K.room(b, {
      x0: CX1,
      x1: CX1 + 6,
      z0: CZ0,
      z1: CZ0 + 14,
      y: 0,
      h: EY + 4,
      floor: "concrete",
      wall: "wall_grey",
      ceil: "concrete",
      doors: {
        w: [
          { at: 13, w: 1.6, h: 2.5 },
          { at: 1.2, w: 1.6, h: 2.4, y: EY },
        ],
      },
      wallTint: 0x8a8a84,
      floorTint: 0x7a7a74,
    });
    b.stairs("concrete", CX1 + 3, CZ0 + 12.5, 0, -1, 2.8, 10.5, 0, EY, 12, {
      tint: 0x8a8a84,
    });
    K.slab(b, "concrete", CX1 + 0.1, CZ0, CX1 + 5.9, CZ0 + 2, EY, {
      th: 0.3,
      tint: 0x8a8a84,
    });
    F.railing(b, CX1 + 1.5, CZ0 + 12.5, CX1 + 1.5, CZ0 + 2, 0.5, {
      mat: "black_metal",
      h: 0.9,
      col: false,
    });
    b.box("lamp_red", CX1 + 5.8, 6, CZ0 + 7, 0.05, 0.2, 0.3, { grime: 0 });
    glows.add(CX1 + 5.6, 6, CZ0 + 7, 0xff4030, "s");

    // =========================== EXECUTIVE FLOOR ===========================
    const EH = 3.8;
    // R1 board room, R2 president, R3 hall, R4 secretarial pool, R5 records vault
    const rooms = {
      board: {
        x0: CX0,
        x1: ox - 2,
        z0: CZ0,
        z1: oz - 4,
        floor: "carpet_red",
        wall: "mahogany",
        wallTint: 0xc08a60,
        floorTint: 0x7a2a22,
        doors: { e: [{ at: 7, w: 1.6, h: 2.4 }] },
      },
      pres: {
        x0: CX0,
        x1: ox - 2,
        z0: oz - 4,
        z1: CZ1,
        floor: "carpet_blue",
        wall: "wallpaper",
        wallTint: 0x8a9a88,
        floorTint: 0x3a4a6a,
        doors: { e: [{ at: 8, w: 1.6, h: 2.4 }] },
      },
      hall: {
        x0: ox - 2,
        x1: ox + 2,
        z0: CZ0,
        z1: CZ1,
        floor: "marble_t",
        wall: "marble_t",
        wallTint: marble,
        floorTint: 0xd8d4c8,
        doors: {
          w: [
            { at: 7, w: 1.6, h: 2.4 },
            { at: 22, w: 1.6, h: 2.4 },
          ],
          e: [
            { at: 8, w: 1.6, h: 2.4 },
            { at: 23, w: 1.6, h: 2.4 },
          ],
          s: [{ at: 2, w: 2.2, h: 2.6 }],
        },
      },
      pool: {
        x0: ox + 2,
        x1: CX1,
        z0: CZ0,
        z1: oz - 2,
        floor: "tile_floor",
        wall: "wall_cream",
        wallTint: 0xc8c0a0,
        floorTint: 0x9a9a8a,
        doors: {
          w: [{ at: 8, w: 1.6, h: 2.4 }],
          e: [{ at: 1.2, w: 1.6, h: 2.4 }],
        },
      },
      vault: {
        x0: ox + 2,
        x1: CX1,
        z0: oz - 2,
        z1: CZ1,
        floor: "plate",
        wall: "concrete_panel",
        wallTint: 0x8a8e8a,
        floorTint: 0x7a7a74,
        doors: { w: [{ at: 7, w: 1.6, h: 2.4 }] },
      },
    };
    for (const k in rooms) {
      const R = rooms[k];
      K.room(
        b,
        Object.assign(
          {
            y: EY,
            h: EH,
            ceil: "plaster",
            base: "walnut",
            surface: k === "vault" ? "metal" : "carpet",
          },
          R,
        ),
      );
    }
    // exec floor slab underside is the claims ceiling (already drawn); walkable floors come from K.room
    // board room: long table, chairs, portraits, window panorama
    b.box("mahogany", ox - 8, EY, oz - 11, 7.5, 0.78, 1.8, { tint: 0x4a2418 });
    K.colBox(ox - 11.75, EY, oz - 11.9, ox - 4.25, EY + 0.8, oz - 10.1, {
      surface: "wood",
    });
    for (let k = 0; k < 6; k++)
      for (const sz of [-1.3, 1.3])
        F.chair(b, ox - 11 + k * 1.2, EY, oz - 11 + sz, sz > 0 ? PI : 0, {
          mat: "mahogany",
          seat: "leather_red",
          knocked: k === 4 && sz > 0,
        });
    const pano = K.litPaint("ml_panorama", 1024, 256);
    b.panel("atlas_lit", CX0 + 0.17, EY + 2.1, oz - 11, 10, 2.4, HP, {
      rect: pano,
      grime: 0,
    });
    for (let k = 0; k < 5; k++)
      b.box(
        "walnut",
        CX0 + 0.25,
        EY + 0.9,
        oz - 15.5 + k * 2.25,
        0.12,
        2.6,
        0.12,
      );
    for (let k = 0; k < 3; k++) {
      b.box("gold", ox - 10 + k * 3, EY + 1.5, CZ0 + 0.2, 1.1, 1.4, 0.06, {
        tint: 0x9a7a40,
      });
      b.panel(
        "atlas_paint",
        ox - 10 + k * 3,
        EY + 2.2,
        CZ0 + 0.25,
        0.9,
        1.2,
        0,
        { rect: K.paint("wa_plaque", 256, 320), grime: 0.4 },
      );
    }
    F.chandelier(b, glows, ox - 8, EY + 3.0, oz - 11, 0.9, {
      tiers: 1,
      crystals: true,
      chain: 0.6,
    });
    // president's office
    F.desk(b, ox - 8, EY, oz + 6, 0, {
      mat: "mahogany",
      w: 2.2,
      d: 1.0,
      phone: true,
    });
    F.chair(b, ox - 8, EY, oz + 7.1, PI, {
      mat: "mahogany",
      seat: "leather_brown",
    });
    F.shelf(b, CX0 + 0.3, EY, oz + 4, HP, {
      mat: "walnut",
      fill: "books",
      w: 4,
      h: 3.2,
      tint: 0x4a2a18,
    });
    b.panel("atlas_lit", ox - 8, EY + 2.1, CZ1 - 0.17, 7, 2.2, PI, {
      rect: pano,
      grime: 0,
    });
    b.panel("atlas_paint", ox - 3.9, EY + 2.2, oz + 4, 1.6, 1.6, -HP, {
      rect: lg,
      grime: 0.2,
      off: 0.15,
    });
    for (const sgn of [-1, 1])
      F.chair(b, ox - 8 + sgn * 0.9, EY, oz + 4.4, 0, {
        mat: "mahogany",
        seat: "leather_red",
      });
    // hall: marble, portrait of the founder, elevator (south end)
    b.box("bronze", ox, EY, CZ1 - 0.2, 2.2, 2.6, 0.3, { tint: 0x7a5a30 });
    b.panel("atlas_paint", ox, EY + 1.4, CZ1 - 0.37, 1.4, 2.6, PI, {
      rect: K.paint("wa_elev", 256, 512),
      grime: 0.3,
    });
    glows.add(ox, EY + 3.0, CZ1 - 0.5, 0x60ff80, "s");
    for (let z = CZ0 + 3; z < CZ1; z += 7) {
      b.beam("brass", ox, EY + EH, oz + (z - oz), ox, EY + 3.1, z, 0.03);
      b.geo("lamp_amber", T.sphereLo, {
        x: ox,
        y: EY + 3.0,
        z,
        s: 0.18,
        grime: 0,
      });
      glows.add(ox, EY + 3.0, z, 0xffd090, "s");
    }
    // hall dressing: red runner, gilt-framed portraits of past presidents between the doors, marble benches
    b.box(
      "carpet_red",
      ox,
      EY + 0.005,
      oz + (CZ0 + CZ1) / 2 - oz,
      1.6,
      0.02,
      CZ1 - CZ0 - 1,
      { faces: "t", tint: 0x6a1e1a, grime: 0.6 },
    );
    for (const z of [CZ0 + 3.5, CZ0 + 15, CZ0 + 27])
      for (const sgn of [-1, 1]) {
        const wx = ox + sgn * 1.83;
        b.box("gold", wx, EY + 1.35, z, 0.06, 1.5, 1.15, { tint: 0x9a7a40 });
        b.panel(
          "atlas_paint",
          wx - sgn * 0.035,
          EY + 2.1,
          z,
          0.95,
          1.25,
          sgn < 0 ? HP : -HP,
          { rect: K.paint("wa_plaque", 256, 320), grime: 0.45 },
        );
      }
    F.bench(b, ox - 1.55, EY, CZ0 + 11, HP, 1.6, {
      mat: "marble_t",
      frame: "bronze",
    });
    // secretarial pool: desks, switchboard
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 2; j++)
        F.desk(b, ox + 5 + i * 3, EY, oz - 14 + j * 5, 0, {
          mat: "oak",
          w: 1.3,
          typewriter: true,
        });
    b.box("walnut", ox + 13.6, EY, oz - 8, 0.8, 1.9, 3, { tint: 0x4a2a18 });
    for (let k = 0; k < 40; k++)
      b.box(
        "black_metal",
        ox + 13.19,
        EY + 1.0 + (k % 5) * 0.16,
        oz - 9.2 + Math.floor(k / 5) * 0.3,
        0.02,
        0.05,
        0.05,
        { faces: "w" },
      );
    K.colBox(ox + 13.2, EY, oz - 9.5, ox + 14, EY + 1.9, oz - 6.5, {
      surface: "wood",
    });
    for (let x = ox + 5; x < CX1; x += 5) {
      b.box("lamp_white", x, EY + EH - 0.05, oz - 10, 0.2, 0.05, 2, {
        grime: 0,
      });
      glows.add(x, EY + EH - 0.15, oz - 10, 0xe8f0ff, "m");
    }
    // records vault: shelving of policy files
    for (let k = 0; k < 4; k++)
      F.shelf(b, ox + 4 + k * 2.6, EY, oz + 5, 0, {
        mat: "metal",
        fill: "files",
        w: 2.2,
        h: 2.8,
        tint: 0x5a6058,
        sparse: 0.15,
      });
    for (let k = 0; k < 2; k++)
      F.shelf(b, CX1 - 0.4, EY, oz + 2 + k * 5, -HP, {
        mat: "metal",
        fill: "files",
        w: 4,
        h: 2.8,
        tint: 0x5a6058,
      });
    b.box("lamp_white", ox + 8, EY + EH - 0.05, oz + 5, 0.2, 0.05, 4, {
      grime: 0,
    });
    glows.add(ox + 8, EY + EH - 0.15, oz + 5, 0xe8f0ff, "m");
    F.papers(b, ox + 3, oz - 1, CX1 - 1, CZ1 - 1, EY, 30, { tint: 0xd8cca8 });
    F.papers(b, ox - 13, CZ0 + 1, ox - 3, oz + 11, EY, 20);

    // =========================== CLOCKWORK ROOM ===========================
    const KY = 30,
      KX = ox + 72,
      KZ = oz,
      KS = 12,
      KH = 16; // 24 × 24 room, 16 m tall
    b.light(KX, KY + 7, KZ, 22, 0xfff0d0, 1.0);
    for (let i = 0; i < 4; i++) {
      const a = i * HP;
      b.light(
        KX + Math.sin(a) * 9,
        KY + 7,
        KZ + Math.cos(a) * 9,
        12,
        0xfff4d8,
        0.9,
      );
    }
    K.room(b, {
      x0: KX - KS,
      x1: KX + KS,
      z0: KZ - KS,
      z1: KZ + KS,
      y: KY,
      h: KH,
      floor: "plate",
      wall: "brick_white",
      ceil: "concrete",
      doors: {
        s: [{ at: 12, w: 11.2, h: 11.2, y: 1.2, arch: true }],
        n: [{ at: 12, w: 11.2, h: 11.2, y: 1.2, arch: true }],
        e: [{ at: 12, w: 11.2, h: 11.2, y: 1.2, arch: true }],
        w: [{ at: 12, w: 11.2, h: 11.2, y: 1.2, arch: true }],
      },
      floorTint: 0x7a7a74,
      wallTint: 0xc8c4b8,
      surface: "metal",
      grime: 0.5,
      wallCol: false,
    });
    for (const k of ["n", "s", "e", "w"]) {
      const c = {
        n: [-KS, -KS, KS, -KS],
        s: [-KS, KS, KS, KS],
        w: [-KS, -KS, -KS, KS],
        e: [KS, -KS, KS, KS],
      }[k];
      K.colWall(
        KX + c[0],
        KZ + c[1],
        KX + c[2],
        KZ + c[3],
        0.3,
        KY,
        KY + KH,
        [],
      );
    }
    // the four dials seen from inside (circular openings filled with translucent opal glass)
    const din = K.litPaint("ml_dial_in", 512, 512);
    for (let i = 0; i < 4; i++) {
      const a = i * HP,
        nx = Math.sin(a),
        nz = Math.cos(a);
      const cg = new THREE.CircleGeometry(5.6, 40);
      b.geo("atlas_lit", cg, {
        x: KX + nx * (KS - 0.05),
        y: KY + 6.8,
        z: KZ + nz * (KS - 0.05),
        ry: a + PI,
        uv: "rect",
        rect: din,
      });
      cg.dispose();
      // arched opening beyond the dial circle: fill the corners with brick panels
      b.geo("brick_white", new THREE.RingGeometry(5.6, 7.9, 40, 1), {
        x: KX + nx * (KS - 0.1),
        y: KY + 6.8,
        z: KZ + nz * (KS - 0.1),
        ry: a + PI,
        tint: 0xb8b4a8,
      });
      b.box(
        "brick_white",
        KX + nx * (KS - 0.15),
        KY,
        KZ + nz * (KS - 0.15),
        Math.abs(nz) * 11.4 + 0.3,
        1.2,
        Math.abs(nx) * 11.4 + 0.3,
        { tint: 0xb8b4a8 },
      );
      F.shaft(
        b,
        KX + nx * (KS - 0.6),
        KY + 9,
        KZ + nz * (KS - 0.6),
        a + PI,
        4.5,
        12,
        1.05,
        { tint: 0x9a9a78 },
      );
      // drive rod from the central gearbox to the dial motion-work
      b.beam(
        "steel",
        KX + nx * 1.2,
        KY + 6.8,
        KZ + nz * 1.2,
        KX + nx * (KS - 0.9),
        KY + 6.8,
        KZ + nz * (KS - 0.9),
        0.14,
        { round: 8, grime: 0.3 },
      );
      b.box(
        "brass",
        KX + nx * (KS - 0.9),
        KY + 6.3,
        KZ + nz * (KS - 0.9),
        1.0,
        1.0,
        1.0,
        { yaw: a, tint: 0x8a7040 },
      );
    }
    // central gearbox frame (cast-iron A-frame) + upper catwalk ring
    b.box("black_metal", KX, KY, KZ, 3.2, 0.5, 3.2);
    for (const c of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      b.beam(
        "black_metal",
        KX + c[0] * 1.5,
        KY + 0.5,
        KZ + c[1] * 1.5,
        KX + c[0] * 0.8,
        KY + 8.5,
        KZ + c[1] * 0.8,
        0.25,
      );
    b.box("black_metal", KX, KY + 8.5, KZ, 2.2, 0.4, 2.2);
    K.colBox(KX - 1.7, KY, KZ - 1.7, KX + 1.7, KY + 8.9, KZ + 1.7, {
      surface: "metal",
    });
    const CWY = KY + 9.6;
    for (const r4 of [
      [-KS, -KS, KS, -KS + 2.2],
      [-KS, KS - 2.2, KS, KS],
      [-KS, -KS + 2.2, -KS + 2.2, KS - 2.2],
      [KS - 2.2, -KS + 2.2, KS, KS - 2.2],
    ]) {
      K.slab(b, "plate", KX + r4[0], KZ + r4[1], KX + r4[2], KZ + r4[3], CWY, {
        th: 0.15,
        tint: 0x6a6a64,
        surface: "metal",
      });
    }
    F.railing(
      b,
      KX - KS + 2.2,
      KZ - KS + 2.2,
      KX + KS - 2.2,
      KZ - KS + 2.2,
      CWY,
      { mat: "black_metal", h: 1 },
    );
    F.railing(
      b,
      KX - KS + 2.2,
      KZ + KS - 2.2,
      KX + KS - 2.2,
      KZ + KS - 2.2,
      CWY,
      { mat: "black_metal", h: 1 },
    );
    F.railing(
      b,
      KX + KS - 2.2,
      KZ - KS + 2.2,
      KX + KS - 2.2,
      KZ + KS - 2.2,
      CWY,
      { mat: "black_metal", h: 1 },
    );
    F.railing(b, KX - KS + 2.2, KZ - KS + 2.2, KX - KS + 2.2, KZ + 4, CWY, {
      mat: "black_metal",
      h: 1,
    });
    // stair to the catwalk (west side, rising north), and a ladder-stair up to the cupola hatch (north-east corner)
    b.stairs("plate", KX - KS + 1.1, KZ + 10, 0, -1, 2.0, 12, KY, CWY, 24, {
      tint: 0x6a6a64,
    });
    b.stairs(
      "plate",
      KX + KS - 1.1,
      KZ - 4,
      0,
      -1,
      2.0,
      4.5,
      CWY,
      CWY + 3.6,
      9,
      { tint: 0x6a6a64 },
    );
    b.box(
      "metal_dark",
      KX + KS - 1.1,
      CWY + 3.6,
      KZ - KS + 0.2,
      1.8,
      2.3,
      0.2,
      { tint: 0x4a4a44 },
    );
    K.slab(b, "plate", KX + KS - 2.2, KZ - KS, KX + KS, KZ - 8.5, CWY + 3.6, {
      th: 0.15,
      tint: 0x6a6a64,
      surface: "metal",
    });
    glows.add(KX + KS - 1.1, CWY + 6.1, KZ - KS + 0.4, 0x60ff80, "s");
    // elevator car landing (south side of the floor)
    b.box("bronze", KX - 6, KY, KZ + KS - 0.25, 2.2, 2.6, 0.3, {
      tint: 0x6a5030,
    });
    glows.add(KX - 6, KY + 2.9, KZ + KS - 0.5, 0x60ff80, "s");
    // work lamps & oil cans, a robot maintenance bench
    for (const c of [
      [-8, -8],
      [8, 8],
      [8, -8],
    ]) {
      b.cyl("black_metal", KX + c[0], KY, KZ + c[1], 0.05, 0.05, 2.2, 6);
      b.geo("lamp_amber", T.cone8, {
        x: KX + c[0],
        y: KY + 2.3,
        z: KZ + c[1],
        s: 0.3,
        sy: 0.25,
        rx: PI,
        grime: 0,
      });
      glows.add(KX + c[0], KY + 2.2, KZ + c[1], 0xffc070, "m");
    }
    F.table(b, KX + 8, KY, KZ + 3, HP, {
      w: 2.2,
      d: 0.9,
      mat: "metal",
      tint: 0x5a6058,
    });
    for (let k = 0; k < 4; k++)
      b.cyl("rust", KX + 7.4 + k * 0.4, KY + 0.75, KZ + 3.2, 0.1, 0.1, 0.25, 8);
    F.bones(b, KX - 7, KY, KZ - 6, 10);
    F.papers(b, KX - 10, KZ - 10, KX + 10, KZ + 10, KY, 16, { tint: 0xc8bca0 });

    // =========================== CUPOLA ===========================
    const QY = 60,
      QX = ox + 120,
      QZ = oz;
    b.light(QX, QY + 3, QZ, 12, 0xfff4c0, 1.4);
    const R8 = 5;
    K.slab(b, "marble_t", QX - R8, QZ - R8, QX + R8, QZ + R8, QY, {
      th: 0.4,
      tint: marble,
    });
    for (let i = 0; i < 8; i++) {
      const a0 = (i / 8) * PI * 2 + PI / 8,
        a1 = ((i + 1) / 8) * PI * 2 + PI / 8;
      const p0 = [QX + Math.cos(a0) * R8, QZ + Math.sin(a0) * R8],
        p1 = [QX + Math.cos(a1) * R8, QZ + Math.sin(a1) * R8];
      const open = i % 2 === 0;
      K.skin(
        b,
        "marble_t",
        p0[0],
        p0[1],
        p1[0],
        p1[1],
        QY,
        QY + 4.6,
        [QX, QZ],
        open
          ? [{ at: 1.9, w: 2.4, h: 3.2, y: 0.9, arch: true }]
          : i === 3
            ? [{ at: 1.9, w: 1.4, h: 2.3 }]
            : [],
        { tint: marble },
      );
      if (open) {
        const mx = (p0[0] + p1[0]) / 2,
          mz = (p0[1] + p1[1]) / 2,
          am = (a0 + a1) / 2;
        const pan = K.litPaint("ml_panorama", 1024, 256);
        b.panel(
          "atlas_lit",
          QX + Math.cos(am) * (R8 + 4),
          QY + 2.2,
          QZ + Math.sin(am) * (R8 + 4),
          8,
          4,
          Math.atan2(-Math.cos(am), -Math.sin(am)),
          {
            rect: [
              pan[0] + (pan[2] - pan[0]) * (i / 8),
              pan[1],
              pan[0] + (pan[2] - pan[0]) * ((i + 2) / 8),
              pan[3],
            ],
            grime: 0,
          },
        );
        b.box("marble_t", mx, QY + 0.9, mz, 2.4, 0.08, 0.5, {
          yaw: -am + HP,
          tint: marble,
        });
      }
    }
    // dome ceiling + the beacon lamp with Fresnel rings
    b.geo("gold", new THREE.SphereGeometry(R8, 16, 8, 0, PI * 2, 0, PI / 2), {
      x: QX,
      y: QY + 4.6,
      z: QZ,
      tint: 0x9a7a40,
      grime: 0.2,
    });
    // (sphere normals face outward; add an inward shell for the interior view)
    const inner = new THREE.SphereGeometry(
      R8 - 0.05,
      16,
      8,
      0,
      PI * 2,
      0,
      PI / 2,
    );
    inner.scale(-1, 1, 1);
    b.geo("gold", inner, {
      x: QX,
      y: QY + 4.6,
      z: QZ,
      tint: 0xb89048,
      grime: 0.2,
    });
    inner.dispose();
    b.cyl("bronze", QX, QY, QZ, 0.8, 0.6, 1.2, 12, { tint: 0x6a5030 });
    b.geo("lamp_warm", T.sphere, {
      x: QX,
      y: QY + 2.1,
      z: QZ,
      s: 0.7,
      grime: 0,
    });
    for (let k = -2; k <= 2; k++)
      b.geo("glass_base", T.torusThick, {
        x: QX,
        y: QY + 2.1 + k * 0.28,
        z: QZ,
        rx: HP,
        s: 0.75 + (2 - Math.abs(k)) * 0.12,
        tint: 0xd8e0d0,
        grime: 0,
      });
    glows.add(QX, QY + 2.1, QZ, 0xfff0c0, "xl");
    K.colBox(QX - 0.8, QY, QZ - 0.8, QX + 0.8, QY + 3, QZ + 0.8, {
      surface: "metal",
    });
    // stair hatch (arrival from the clock room) & inscription plaque
    b.box("metal_dark", QX, QY + 0.01, QZ + 3.2, 1.2, 0.02, 1.2, {
      faces: "t",
      tint: 0x3a3a34,
    });

    b.finish(rec.interiorRoot, { cast: false });
    glows.finish(rec.interiorRoot, { interior: true, nightOpacity: 0.95 });

    // ---- animated clockwork (separate meshes) ----
    const gears = [];
    const mkGear = (R, teeth, depth, x, y, z, rotY, speed, mat, tint) => {
      const gb = K.builder("ml_gear", { grime: 0.3, ambient: 0.9 });
      const g = gearGeo(R, teeth, depth);
      gb.geo(mat || "brass", g, { tint: tint || 0x9a7a40 });
      gb.cyl("black_metal", 0, -0.05, 0, R * 0.22, R * 0.22, 0.1, 10, {
        rx: HP,
      });
      g.dispose();
      const grp = new THREE.Group();
      grp.position.set(x, y, z);
      grp.rotation.y = rotY;
      const spin = new THREE.Group();
      grp.add(spin);
      gb.finish(spin, { cast: false });
      rec.interiorRoot.add(grp);
      gears.push({ spin, speed });
      return grp;
    };
    mkGear(3.2, 48, 0.35, KX, KY + 6.8, KZ + 2.2, 0, 0.05, "brass", 0x9a7a40);
    mkGear(
      1.6,
      24,
      0.3,
      KX + 2.9,
      KY + 8.9,
      KZ + 2.0,
      0,
      -0.1,
      "steel",
      0xa8aca8,
    );
    mkGear(2.2, 32, 0.3, KX, KY + 6.8, KZ - 2.2, 0, -0.07, "brass", 0xb08a48);
    mkGear(
      1.2,
      18,
      0.25,
      KX - 2.4,
      KY + 4.4,
      KZ - 2.1,
      0,
      0.13,
      "steel",
      0xa8aca8,
    );
    mkGear(2.6, 40, 0.3, KX + 2.2, KY + 6.8, KZ, HP, -0.06, "brass", 0x9a7a40);
    mkGear(1.4, 20, 0.25, KX - 2.2, KY + 6.8, KZ, HP, 0.11, "steel", 0xa8aca8);
    mkGear(
      0.9,
      30,
      0.2,
      KX + 0.2,
      KY + 3.2,
      KZ + 2.0,
      0,
      0.9,
      "brass",
      0xc8a050,
    ); // escapement wheel
    // pendulum (long rod + bob) swinging under the escapement
    const pend = new THREE.Group();
    pend.position.set(KX + 0.2, KY + 8.6, KZ + 0.8);
    {
      const pb = K.builder("ml_pend", { grime: 0.2, ambient: 0.9 });
      pb.beam("steel", 0, 0, 0, 0, -7.2, 0, 0.06);
      pb.cyl("brass", 0, -7.9, 0, 0.55, 0.55, 0.22, 16, {
        rx: HP,
        tint: 0xb89048,
        bottom: true,
      });
      pb.finish(pend, { cast: false });
    }
    rec.interiorRoot.add(pend);
    K.animate((dt, t) => {
      if (!rec.interiorRoot.visible) return;
      const tick = Math.floor(t * 2) + Math.min(1, ((t * 2) % 1) * 6); // stepping motion (escapement ticks)
      for (const g of gears) g.spin.rotation.z = tick * g.speed * 0.35;
      pend.rotation.z = Math.sin(t * PI) * 0.12;
    });

    const A = (n, x, y, z, yaw) => rec.anchor(n, x, y, z, yaw);
    A("entrance", ox, 0, oz + 26, 0);
    A("claims", ox, 0, oz - 3, 0);
    A("exec", ox, EY, oz - 3, 0);
    A("records", ox + 8, EY, oz + 5, 0);
    A("boss", KX + 4, KY, KZ + 6, PI);
    A("clockroom", KX - 2.1, KY, KZ + 0.2, 0);
    A("mainframe", KX - 7.2, KY, KZ + 7.2, PI * 0.75);
    A("cupola", QX, QY, QZ + 2, 0);
    A("spawn1", ox + 4, 0, oz + 20, 0);
    A("spawn2", ox - 6, 0, oz - 8, 0);
    A("spawn3", ox + 8, 0, oz + 2, 0);
    A("spawn4", ox - 8, EY, oz - 14, 0);
    A("spawn5", ox + 8, EY, oz - 12, 0);
    A("spawn6", KX - 6, KY, KZ - 6, 0);
    return {
      arrival: { x: ox, y: 0, z: oz + 26.2, yaw: 0 },
      exitPos: new THREE.Vector3(ox, 1.6, oz + 27.7),
      elevLobby: new THREE.Vector3(ox - 9.4, 1.4, oz + 19),
      elevLobbyArrival: { x: ox - 8, y: 0, z: oz + 19, yaw: -HP },
      elevExec: new THREE.Vector3(ox, EY + 1.4, CZ1 - 0.6),
      elevExecArrival: { x: ox, y: EY, z: CZ1 - 2, yaw: 0 },
      elevClock: new THREE.Vector3(KX - 6, KY + 1.4, KZ + KS - 0.6),
      elevClockArrival: { x: KX - 6, y: KY, z: KZ + KS - 2, yaw: 0 },
      hatchUp: new THREE.Vector3(KX + KS - 1.1, CWY + 3.6 + 1.4, KZ - KS + 0.5),
      hatchUpArrival: { x: QX - 2.2, y: QY, z: QZ + 1.6, yaw: 0 }, // beside the hatch, facing the lantern (not standing on the hatch)
      hatchDown: new THREE.Vector3(QX, QY + 0.6, QZ + 3.2),
      hatchDownArrival: {
        x: KX + KS - 1.1,
        y: CWY + 3.6,
        z: KZ - KS + 2.0,
        yaw: PI,
      },
      cupolaDoor: new THREE.Vector3(
        QX + Math.cos((3.5 / 8) * PI * 2 + PI / 8) * (R8 - 0.4),
        QY + 1.4,
        QZ + Math.sin((3.5 / 8) * PI * 2 + PI / 8) * (R8 - 0.4),
      ),
      cupolaArrival: {
        x: QX + Math.cos((3.5 / 8) * PI * 2 + PI / 8) * (R8 - 1.6),
        y: QY,
        z: QZ + Math.sin((3.5 / 8) * PI * 2 + PI / 8) * (R8 - 1.6),
        yaw: -HP + 0.6,
      }, // facing into the lantern room
      ox,
      oz,
      EY,
      KX,
      KY,
      KZ,
      KS,
      CWY,
      QX,
      QY,
      QZ,
      CX0,
      CX1,
      CZ0,
      CZ1,
    };
  }

