// play-inline-534 03 — metal
// Lines 483-794 of readable/play-inline-534.pretty.js (statement-aligned).
  function buildModel() {
    if (MODEL) return MODEL;
    const U = G.util;
    const wood = [],
      metal = [];
    const box = (arr, col, w, h, d, x, y, z, ry, rx, rz, tex) => {
      const g = uvScale(
        new THREE.BoxGeometry(w, h, d),
        tex ? Math.max(w, d) / tex : 1,
        tex ? Math.max(h, 0.1) / tex : 1,
      );
      arr.push(
        U.bake(
          U.paint(g, col),
          { x, y: y + h / 2, z },
          ry || 0,
          1,
          rx || 0,
          rz || 0,
        ),
      );
    };
    const cyl = (arr, col, r0, r1, h, x, y, z, seg, rx, rz) => {
      arr.push(
        U.bake(
          U.paint(new THREE.CylinderGeometry(r0, r1, h, seg || 10, 1), col),
          { x, y: y + (rx || rz ? 0 : h / 2), z },
          0,
          1,
          rx || 0,
          rz || 0,
        ),
      );
    };
    const ball = (arr, col, r, x, y, z) => {
      arr.push(
        U.bake(
          U.paint(new THREE.SphereGeometry(r, 10, 7), col),
          { x, y, z },
          0,
          1,
        ),
      );
    };
    const W = 0x94704a,
      WD = 0x7a5a3a,
      WL = 0x604630;
    // --- bench: top, apron, legs, stretchers, lower shelf
    box(wood, W, 1.74, 0.07, 0.76, 0, 0.84, 0, 0, 0, 0, 1.2);
    box(wood, WD, 1.7, 0.12, 0.03, 0, 0.72, -0.36, 0, 0, 0, 1.2);
    for (const sx of [-0.8, 0.8])
      for (const sz of [-0.32, 0.32])
        box(wood, WL, 0.09, 0.84, 0.09, sx, 0, sz, 0, 0, 0, 1.2);
    box(wood, WD, 1.62, 0.035, 0.66, 0, 0.18, 0, 0, 0, 0, 1.2);
    for (const sz of [-0.32, 0.32])
      box(wood, WL, 1.6, 0.07, 0.04, 0, 0.1, sz, 0, 0, 0, 1.2);
    // --- back riser: two posts, pegboard, shelf
    for (const sx of [-0.84, 0.84])
      box(wood, WL, 0.06, 1.0, 0.06, sx, 0.91, 0.34, 0, 0, 0, 1.2);
    box(wood, 0x7e6a4a, 1.66, 0.82, 0.025, 0, 0.94, 0.36, 0, 0, 0, 0.8); // pegboard
    box(wood, W, 1.72, 0.035, 0.24, 0, 1.46, 0.25, 0, 0, 0, 1.2);
    // --- single-stage press (left front, bolted to the bench edge)
    const RED = 0x8e2a1c,
      STEEL = 0x8a8e90,
      DARK = 0x2e3032,
      BRASS = 0xd2a64e;
    const px = -0.52,
      pz = -0.24,
      top = 0.91;
    box(metal, RED, 0.16, 0.03, 0.15, px, top, pz); // base plate
    box(metal, RED, 0.07, 0.34, 0.06, px, top + 0.03, pz + 0.05); // C-frame spine
    box(metal, RED, 0.08, 0.06, 0.16, px, top + 0.34, pz - 0.01); // top arm
    cyl(metal, DARK, 0.02, 0.02, 0.1, px, top + 0.25, pz - 0.05, 14); // die
    cyl(metal, STEEL, 0.017, 0.017, 0.16, px, top + 0.04, pz - 0.05, 12); // ram
    box(metal, DARK, 0.05, 0.02, 0.05, px, top + 0.2, pz - 0.05); // shell holder
    // lever arm swinging out to the right & down, black ball knob
    // (pivot at the frame, raised 30° like a press between strokes)
    cyl(
      metal,
      STEEL,
      0.011,
      0.011,
      0.36,
      px + 0.2,
      top + 0.29,
      pz - 0.05,
      8,
      0,
      -1.05,
    );
    ball(metal, DARK, 0.03, px + 0.355, top + 0.38, pz - 0.05);
    // --- powder measure on a post
    const mx = -0.18,
      mz = -0.16;
    cyl(metal, STEEL, 0.012, 0.012, 0.3, mx, top, mz, 8);
    box(metal, RED, 0.06, 0.05, 0.06, mx, top + 0.3, mz);
    cyl(metal, 0xb89a58, 0.042, 0.042, 0.14, mx, top + 0.35, mz, 14); // amber hopper
    cyl(metal, DARK, 0.046, 0.046, 0.015, mx, top + 0.49, mz, 14);
    cyl(metal, STEEL, 0.008, 0.012, 0.05, mx, top + 0.25, mz, 8); // drop tube
    box(metal, STEEL, 0.1, 0.012, 0.012, mx + 0.06, top + 0.32, mz); // metering handle
    // --- beam scale
    const sx0 = 0.12,
      sz0 = -0.18;
    box(metal, 0x3a4a3e, 0.2, 0.04, 0.1, sx0, top, sz0);
    box(metal, STEEL, 0.012, 0.08, 0.012, sx0 - 0.06, top + 0.04, sz0);
    box(
      metal,
      STEEL,
      0.22,
      0.006,
      0.012,
      sx0 + 0.01,
      top + 0.12,
      sz0,
      0,
      0,
      0.04,
    );
    cyl(metal, STEEL, 0.035, 0.03, 0.01, sx0 - 0.08, top + 0.09, sz0, 12);
    // --- loading block full of brass
    const bx = 0.46,
      bz = -0.18;
    box(wood, 0xa07c52, 0.22, 0.035, 0.14, bx, top, bz);
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 4; j++) {
        if ((i * 7 + j * 3) % 11 === 0) continue;
        cyl(
          metal,
          BRASS,
          0.007,
          0.007,
          0.045,
          bx - 0.085 + i * 0.034,
          top + 0.03,
          bz - 0.05 + j * 0.034,
          6,
        );
      }
    // loose cases & slugs spilled on the top
    for (let i = 0; i < 7; i++)
      cyl(
        metal,
        i % 3 ? BRASS : 0x6a6e70,
        0.007,
        0.007,
        0.04,
        0.2 + i * 0.05,
        top + 0.007,
        -0.02 + (i % 2) * 0.05,
        6,
        Math.PI / 2,
        i * 0.9,
      );
    // --- shelf: powder cans, primer trays, ammo boxes
    const st = 1.495;
    cyl(metal, 0x9a2a20, 0.055, 0.055, 0.16, -0.66, st, 0.25, 12);
    cyl(metal, 0x262626, 0.05, 0.05, 0.13, -0.53, st, 0.26, 12);
    cyl(metal, 0x9a2a20, 0.055, 0.055, 0.16, -0.41, st, 0.24, 12);
    box(metal, 0x5a6a3a, 0.2, 0.1, 0.14, -0.16, st, 0.25, 0.1);
    box(metal, 0x5a6a3a, 0.2, 0.1, 0.14, -0.15, st + 0.1, 0.25, -0.06);
    box(metal, 0x2a4a7a, 0.16, 0.08, 0.11, 0.1, st, 0.26, 0.2);
    box(metal, 0xc8a040, 0.1, 0.03, 0.07, 0.3, st, 0.24);
    box(metal, 0xc8a040, 0.1, 0.03, 0.07, 0.3, st + 0.03, 0.24, 0.3);
    box(metal, 0x7a1a14, 0.24, 0.12, 0.16, 0.6, st, 0.25, -0.12);
    // hanging tools on the pegboard
    box(metal, STEEL, 0.03, 0.22, 0.015, -0.7, 1.05, 0.33, 0, 0, 0.1);
    box(metal, 0x1e1e1e, 0.2, 0.02, 0.015, -0.3, 1.2, 0.33, 0, 0, -0.2);
    box(metal, STEEL, 0.02, 0.18, 0.015, 0.05, 1.08, 0.33);
    cyl(metal, STEEL, 0.05, 0.05, 0.015, 0.45, 1.18, 0.335, 14, Math.PI / 2);
    // under-shelf: ammo can and a lead-ingot stack
    box(metal, 0x4a5a32, 0.28, 0.18, 0.14, -0.45, 0.215, 0.05, 0.2);
    for (let i = 0; i < 3; i++)
      box(
        metal,
        0x6a6e72,
        0.16,
        0.035,
        0.05,
        0.4,
        0.215 + i * 0.036,
        0.06 + (i % 2) * 0.03,
        i * 0.3,
      );
    cyl(metal, 0x8a8478, 0.08, 0.08, 0.16, 0.12, 0.215, 0.1, 10); // coffee can of slugs
    // --- dressing: military ammo crate beside the bench (the searchable "Reloading Supplies"),
    //     a second crate on top, a three-legged shop stool and a hurricane lantern on the shelf.
    const CR = 0x6e6a44,
      CRD = 0x55523a;
    const kx = 1.28,
      kz = -0.02;
    box(wood, CR, 0.62, 0.36, 0.42, kx, 0, kz, 0.06, 0, 0, 0.9);
    for (const sx of [-0.25, 0.25])
      box(
        wood,
        CRD,
        0.05,
        0.37,
        0.44,
        kx + sx * Math.cos(0.06),
        0,
        kz - sx * Math.sin(0.06),
        0.06,
      );
    box(wood, CRD, 0.64, 0.035, 0.44, kx, 0.36, kz, 0.06, 0, 0, 0.9); // lid
    box(metal, 0x2e3032, 0.12, 0.03, 0.03, kx, 0.26, kz - 0.225, 0.06); // rope-handle cleat
    box(metal, 0xd8d0b0, 0.3, 0.07, 0.004, kx - 0.04, 0.12, kz - 0.215, 0.06); // stencil plate ("CAL .30")
    box(
      wood,
      CR,
      0.46,
      0.26,
      0.3,
      kx + 0.03,
      0.395,
      kz + 0.02,
      -0.18,
      0,
      0,
      0.9,
    ); // smaller crate on top
    box(
      wood,
      CRD,
      0.47,
      0.03,
      0.31,
      kx + 0.03,
      0.655,
      kz + 0.02,
      -0.18,
      0,
      0,
      0.9,
    );
    box(metal, 0x4a5a32, 0.26, 0.15, 0.12, kx - 0.02, 0.685, kz + 0.02, 0.4); // ammo can on top of it
    box(metal, 0x2a2c2a, 0.1, 0.02, 0.03, kx - 0.02, 0.835, kz + 0.02, 0.4);
    // stool (front left, pushed half under the bench)
    const tx = -0.42,
      tz = -0.62;
    cyl(wood, WD, 0.17, 0.17, 0.04, tx, 0.6, tz, 14);
    for (let i = 0; i < 3; i++) {
      const aa = (i / 3) * Math.PI * 2 + 0.4;
      cyl(
        wood,
        WL,
        0.018,
        0.022,
        0.64,
        tx + Math.cos(aa) * 0.1,
        0.3,
        tz + Math.sin(aa) * 0.1,
        6,
        Math.sin(aa) * 0.16,
        -Math.cos(aa) * 0.16,
      );
    }
    cyl(wood, WL, 0.012, 0.012, 0.22, tx, 0.22, tz, 5, 0, Math.PI / 2);
    // lantern (shelf, right end): base, cage, cap, bail handle — the glass is its own glowing mesh
    const lx = 0.74,
      lz = 0.22,
      ly = 1.495;
    cyl(metal, 0x7a2a1a, 0.06, 0.065, 0.05, lx, ly, lz, 12);
    for (let i = 0; i < 4; i++) {
      const aa = (i / 4) * Math.PI * 2 + 0.785;
      cyl(
        metal,
        0x3a3a38,
        0.004,
        0.004,
        0.13,
        lx + Math.cos(aa) * 0.047,
        ly + 0.05,
        lz + Math.sin(aa) * 0.047,
        4,
      );
    }
    cyl(metal, 0x7a2a1a, 0.03, 0.058, 0.04, lx, ly + 0.18, lz, 12);
    cyl(
      metal,
      0x3a3a38,
      0.004,
      0.004,
      0.12,
      lx,
      ly + 0.25,
      lz,
      4,
      0,
      Math.PI / 2,
    );
    const glass = [
      U.bake(
        U.paint(
          new THREE.CylinderGeometry(0.036, 0.042, 0.12, 12, 1),
          0xffffff,
        ),
        { x: lx, y: ly + 0.11, z: lz },
        0,
        1,
      ),
    ];
    MODEL = {
      wood: U.mergeGeometries(wood),
      metal: U.mergeGeometries(metal),
      glass: U.mergeGeometries(glass),
      crate: { x: kx, z: kz, w: 0.66, d: 0.46, h: 0.84 },
    };
    wood.length = 0;
    metal.length = 0;
    return MODEL;
  }
  let MATS = null;
