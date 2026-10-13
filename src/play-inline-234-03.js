// play-inline-234 03 — math
// Lines 186-954 of readable/play-inline-234.pretty.js (statement-aligned).
  function build() {
    const C = LI.cell(KEY);
    C.site = "flatiron";
    const b = C.b,
      T = art();
    b.ambient(0x2e2a24, 1);
    // ------------- lights -------------
    for (const [x, z] of [
      [-10.5, 22],
      [-10.5, 10],
      [-10.5, -2],
      [-10.5, -14],
      [0, 25],
    ]) {
      b.light(x, FA + 3.3, z, 0xffd090, 9, 0.8);
      b.light(x, FB + 3.3, z, 0xffd090, 9, 0.7);
    }
    for (const [x, z, c] of [
      [-15.5, 21, 0xffc070],
      [-3, 18, 0xffe0b0],
      [-3, 5, 0xd8f0ff],
      [-8, -10, 0xffb060],
      [-15.5, 4, 0xffd090],
      [-15.5, -8, 0xffd090],
      [-14, -22, 0xffd8a0],
    ])
      b.light(x, FA + 3.0, z, c, 9, 0.9);
    for (const [x, z, c] of [
      [-15.5, 12, 0xffe0b0],
      [-2, 12, 0xffd090],
      [-12, -20, 0xffe8c0],
      [-15, -25, 0xffe0b0],
      [-5, 0, 0xffd090],
    ])
      b.light(x, FB + 3.0, z, c, 10, 0.9);
    b.light(-17, FA + 1.6, -24, 0x80ff60, 5, 0.6);

    // ==============================================================
    // shell: floors, ceilings, outer walls with windows (both floors), backdrops
    // ==============================================================
    const shape = new THREE.Shape();
    PL.forEach((p, i) =>
      i ? shape.lineTo(p[0], -p[1]) : shape.moveTo(p[0], -p[1]),
    );
    const shapeC = new THREE.Shape();
    PL.forEach((p, i) =>
      i ? shapeC.lineTo(p[0], p[1]) : shapeC.moveTo(p[0], p[1]),
    );
    for (const [y, key] of [
      [FA + 0.02, "wood"],
      [FB + 0.02, "tile"],
    ]) {
      const g = new THREE.ShapeGeometry(shape);
      g.rotateX(-Math.PI / 2);
      g.translate(0, y, 0);
      b.add(key, g, { noAO: true });
    }
    for (const [y, key] of [
      [HA, "paint_cream"],
      [HB, "paint_cream"],
    ]) {
      const g = new THREE.ShapeGeometry(shapeC);
      g.rotateX(Math.PI / 2);
      g.translate(0, y, 0);
      b.add(key, g, { noAO: true });
    }
    // floor B slab collider (approximate the triangle in 2 m strips along z) + the stair hole
    for (let z = -27.3; z < 28; z += 2) {
      const z1 = Math.min(28, z + 2),
        xr = Math.min(xd(z), xd(z1)) + 0.3;
      if (z1 > 21.3 && z < 27.8) {
        C.col(-19, FB - 0.3, z, 1.3, FB, z1, {});
        C.col(3.7, FB - 0.3, z, xr, FB, z1, {});
      } else C.col(-19, FB - 0.3, z, xr, FB, z1, {});
    }
    b.box("concrete", -19, FB - 0.35, 21.3, 24, FB - 0.02, 28, { noAO: true });
    // outer walls: windows every 2.4 m on both floors
    const edges = [
      [PL[1], PL[2], T.east],
      [PL[2], PL[3], T.south],
      [PL[3], PL[4], T.west],
      [PL[4], PL[5], null],
      [PL[5], PL[0], null],
      [PL[0], PL[1], null],
    ];
    for (const [p, q, pano] of edges) {
      // polygon runs so that the LEFT normal points into the building; n = outward
      const L = Math.hypot(q[0] - p[0], q[1] - p[1]),
        ux = (q[0] - p[0]) / L,
        uz = (q[1] - p[1]) / L,
        ry = Math.atan2(-uz, ux),
        nx = uz,
        nz = -ux;
      for (const [y0, y1] of [
        [FA, FB],
        [FB, HB + 0.4],
      ]) {
        const gaps = [];
        if (L > 3)
          for (let t = 1.6; t < L - 1.2; t += 2.4) {
            if (
              y0 === FA &&
              Math.abs(uz) < 0.01 &&
              Math.abs(p[0] + ux * t - -1.4) < 1.3
            )
              continue; // the stair door to the market sits here
            gaps.push({
              a: t - 0.6,
              b: t + 0.6,
              sill: y0 + 0.9,
              top: y0 + 2.9,
            });
          }
        A.wallLine(C, "terrazzo", p, q, y0, y1, 0.5, gaps, { off: -0.25 });
        for (const g of gaps) {
          const t = (g.a + g.b) / 2,
            cx = p[0] + ux * t + nx * 0.2,
            cz = p[1] + uz * t + nz * 0.2,
            rr = LI.rng((cx * 31 + cz * 17 + y0 * 3) | 0)();
          if (rr < 0.75)
            b.quad(
              rr < 0.2 ? "glass_dark" : "glass",
              cx,
              y0 + 1.9,
              cz,
              1.2,
              2.0,
              ry,
              { double: true },
            );
          if (rr > 0.9)
            b.quad(
              "wood_rotten",
              cx - nx * 0.15,
              y0 + 1.9,
              cz - nz * 0.15,
              1.2,
              2.0,
              ry,
              {},
            );
          b.obox(
            "wood_dark",
            cx - nx * 0.3,
            y0 + 0.86,
            cz - nz * 0.3,
            1.3,
            0.08,
            0.2,
            ry,
          );
        }
      }
      if (pano) {
        const mx = (p[0] + q[0]) / 2 + nx * 12,
          mz = (p[1] + q[1]) / 2 + nz * 12;
        b.quad(pano, mx, 4, mz, L + 14, 14, ry, { noAO: true });
      }
    }
    b.quad(T.prow, -16, 4, -40, 30, 14, 0, { noAO: true });
    // ------------ stair core (south), corridor spine walls ------------
    A.stairs(C, "wood_dark", 2.5, 27.5, "n", 2.2, FA, FB, {
      nose: "metal_dark",
    });
    A.wall(C, "plaster", { z0: 21.2, z1: 28, x: 1.25 }, FA, FB, 0.2, [
      { a: 25.6, b: 27.4, top: 2.4 },
    ]);
    A.wall(C, "plaster", { z0: 21.2, z1: 28, x: 3.75 }, FA, HB, 0.2, []);
    A.rail(
      C,
      "metal_dark",
      [
        [1.3, 21.3],
        [1.3, 27.6],
      ],
      FB,
      1.0,
      { step: 1.0 },
    );
    A.rail(
      C,
      "metal_dark",
      [
        [1.3, 21.3],
        [3.7, 21.3],
      ],
      FB,
      1.0,
      { step: 1.0 },
    );
    // stairwell lobby (arrival) x -4..1.2, z 23..28
    const sSign = T.sign(
      "st",
      ["THE WEDGE · FLOOR 2", "HOTEL ◂  SHOPS ▸  OFFICE ▲"],
      { bg: "#3a2a1a", fg: "#f0c870", size: 44 },
      512,
      128,
    );
    b.quad(sSign, -1.4, 2.4, 22.9, 2.6, 0.65, Math.PI);
    // the way down: a real panelled door in the south wall with a lettered transom (it used to be a bare window slot)
    LI.doorway(C, LI.doorFrame(-1.4, 27.48, 0), FA, {
      w: 1.1,
      h: 2.3,
      single: true,
      frame: "wood_dark",
      leaf: "wood",
      glass: "glass_dark",
      lamp: false,
      sill: "wood_dark",
      sign: {
        key: T.sign(
          "down",
          ["▼ STAIRS DOWN", "TRADING POST · MARKET FLOOR"],
          { bg: "#3a2a1a", fg: "#f0c870", size: 44 },
          512,
          128,
        ),
        w: 1.6,
        h: 0.4,
        y: 0.4,
      },
    });
    A.sconce(C, -2.6, FA + 2.2, 27.45, Math.PI, { r: 5, i: 0.7 });
    // ================= SECOND FLOOR =================
    // corridor x -12.2..-8.8 from z 22.8 to -20; west rooms x -18.5..-12.2; east rooms x -8.8..diagonal
    const corridor = (y0, y1, westDoors, eastDoors) => {
      A.wall(
        C,
        "wallpaper",
        { z0: -20, z1: 22.8, x: -12.2 },
        y0,
        y1,
        0.2,
        westDoors.map((z) => ({ a: z - 0.55, b: z + 0.55, top: y0 + 2.3 })),
        { casing: "wood_dark" },
      );
      A.wall(
        C,
        "wallpaper",
        { z0: -20, z1: 22.8, x: -8.8 },
        y0,
        y1,
        0.2,
        eastDoors.map((z) => ({ a: z - 0.55, b: z + 0.55, top: y0 + 2.3 })),
        { casing: "wood_dark" },
      );
    };
    corridor(FA, HA, [21, 9, 3, -3, -9, -15, -19.1], [18, 5, -8]);
    b.box("carpet_red", -12.1, FA + 0.03, -20, -8.9, FA + 0.04, 22.8, {
      noAO: true,
    });
    A.wall(
      C,
      "plaster",
      { x0: -8.8, x1: 1.2, z: 22.9 },
      FA,
      HA,
      0.2,
      [{ a: -2.5, b: -0.3, top: 2.4 }],
      { casing: "wood_dark" },
    );
    for (const z of [15, 6, 0, -6, -12, -18])
      A.wall(C, "wallpaper", { x0: -18.5, x1: -12.2, z }, FA, HA, 0.15, []);
    for (const z of [12, -1, -18])
      A.wall(C, "wallpaper", { x0: -8.8, x1: xd(z), z }, FA, HA, 0.15, []);
    A.wall(
      C,
      "wallpaper",
      { x0: -18.5, x1: -8.8, z: -20.1 },
      FA,
      HA,
      0.2,
      [{ a: -11.2, b: -10.0, top: 2.3 }],
      { casing: "wood_dark" },
    );
    for (let z = 20; z > -19; z -= 6)
      A.pendant(C, -10.5, HA - 0.7, z, HA, { light: false });
    // --- The Wedge: reception (x -18.5..-12.2, z 15..22.8)
    b.box("wood_dark", -17.5, FA, 17.4, -13.8, FA + 1.05, 18.1);
    b.box("marble_dark", -17.6, FA + 1.05, 17.3, -13.7, FA + 1.12, 18.2);
    C.col(-17.6, FA, 17.3, -13.7, FA + 1.12, 18.2, { walkable: false });
    for (let k = 0; k < 8; k++)
      b.box(
        "wood_dark",
        -18.3,
        FA + 1.4 + Math.floor(k / 4) * 0.5,
        18.8 + (k % 4) * 0.8,
        -18.1,
        FA + 1.8 + Math.floor(k / 4) * 0.5,
        19.4 + (k % 4) * 0.8,
      );
    const wedge = T.sign(
      "wedge",
      ["THE WEDGE", "ROOMS · 20 SCRIP · NO SPITTING"],
      { bg: "#2a1a14", fg: "#f0c870", border: "#c8a040", size: 60 },
      512,
      128,
    );
    b.quad(wedge, -18.33, FA + 2.9, 19.5, 2.8, 0.7, Math.PI / 2);
    F.sofa(C, -16, FA, 21.6, 2.0, Math.PI, { key: "fabric_red" });
    C.prop("radio", -14.2, FA + 1.12, 17.7, Math.PI, {});
    // --- hotel rooms (x -18.5..-12.2), doors on the corridor at z 9, 3, -3, -9, -15
    const rooms = [
      [6, 15],
      [0, 6],
      [-6, 0],
      [-12, -6],
      [-18, -12],
    ];
    rooms.forEach(([z0, z1], i) => {
      const zc = (z0 + z1) / 2;
      C.prop(
        "bed",
        -17.2,
        FA,
        zc + 0.8,
        Math.PI / 2,
        i === 1
          ? { owner: "settlers", label: "Your Room (The Wedge)" }
          : { owner: "settlers" },
      );
      b.box("wood_dark", -18.4, FA, zc - 2.2, -17.8, FA + 1.1, zc - 1.3);
      b.box(
        "wood_dark",
        -18.35,
        FA + 1.1,
        zc - 2.1,
        -17.85,
        FA + 1.14,
        zc - 1.4,
      );
      C.col(-18.4, FA, zc - 2.2, -17.8, FA + 1.1, zc - 1.3, {
        walkable: false,
      });
      A.pendant(C, -15.5, HA - 0.8, zc, HA, {
        light: false,
        bulb: i === 3 ? "glass_dark" : "lamp",
      });
      if (i === 4)
        C.prop("skeleton", -16, FA, zc - 1, 0.4, {
          pose: "curled",
          collide: false,
        });
      const plate = T.sign(
        "room" + i,
        ["ROOM " + (21 + i)],
        { bg: "#c8a040", fg: "#2a1a0a", size: 70, wear: 0.3 },
        256,
        96,
      );
      b.quad(
        plate,
        -12.08,
        FA + 1.9,
        [9, 3, -3, -9, -15][i] + 0.95,
        0.42,
        0.16,
        Math.PI / 2,
      );
    });
    // the rentable room's door (locked until you pay Mavis)
    C.roomLock = {
      col: C.col(-12.35, FA, 2.45, -12.05, FA + 2.3, 3.55, { walkable: false }),
      mesh: null,
    };
    const rd = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 2.3, 1.1),
      LI.mat("wood_dark"),
    );
    rd.position.set(-12.2, FA + 1.15, 3);
    C.root.add(rd);
    C.roomLock.mesh = rd;
    // --- washroom (x -18.5..-12.2, z -20..-18)
    for (let k = 0; k < 3; k++) {
      b.box(
        "tile",
        -18.4,
        FA,
        -19.9 + k * 0.6,
        -17.9,
        FA + 0.45,
        -19.5 + k * 0.6,
      );
    }
    // --- Stitch & Rivet (east, z 12..22.8)
    const sr = T.sign(
      "sr",
      ["STITCH & RIVET", "ARMOUR · CLOTHES · MENDING"],
      { bg: "#2a3a2a", fg: "#f0e0b0", size: 52 },
      512,
      128,
    );
    b.quad(sr, -8.68, FA + 2.9, 18, 2.4, 0.6, -Math.PI / 2);
    b.box("wood", -6.8, FA, 13.8, -6.1, FA + 1.0, 20);
    b.box("wood_dark", -6.9, FA + 1.0, 13.7, -6.0, FA + 1.05, 20.1);
    C.col(-6.9, FA, 13.7, -6.0, FA + 1.05, 20.1, { walkable: false });
    for (let k = 0; k < 4; k++) {
      const z = 14.5 + k * 1.6;
      b.cyl("metal_dark", -2.5, FA, z, 0.04, 0.2, 1.3, 8);
      b.obox(
        ["fabric_red", "leather", "fabric_green", "fabric_blue"][k],
        -2.5,
        FA + 1.35,
        z,
        0.5,
        0.7,
        0.3,
        0.2,
      );
      b.sphere("fabric", -2.5, FA + 1.85, z, 0.12);
    }
    b.box("wood_dark", -1.2, FA + 0.9, 13.2, 3, FA + 0.95, 14.2);
    for (let k = 0; k < 6; k++)
      b.obox(
        ["metal", "leather", "fabric"][k % 3],
        -0.8 + k * 0.6,
        FA + 1.05,
        13.7,
        0.5,
        0.2,
        0.7,
        0.1 * k,
      );
    C.col(-1.2, FA, 13.2, 3, FA + 1.0, 14.2, { walkable: false });
    // --- Tubes' Radio & Repair (east, z -1..12)
    const sp = T.sign(
      "sp",
      ["TUBES' RADIO & REPAIR", "VALVES BOUGHT · SETS FIXED · NO REFUNDS"],
      { bg: "#1a2a3a", fg: "#80e0ff", size: 44, glow: "#40c0ff" },
      512,
      128,
    );
    b.quad(sp, -8.68, FA + 2.9, 5, 2.4, 0.6, -Math.PI / 2);
    b.box("metal_painted", -6.8, FA, 1, -6.1, FA + 1.0, 9);
    b.box("metal_dark", -6.9, FA + 1.0, 0.9, -6.0, FA + 1.05, 9.1);
    C.col(-6.9, FA, 0.9, -6.0, FA + 1.05, 9.1, { walkable: false });
    for (let k = 0; k < 5; k++)
      F.monitor(C, -6.45, FA + 1.05, 1.8 + k * 1.6, -Math.PI / 2, {
        dead: k % 2 === 0,
      });
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 4; c++) {
        const x = -1 + c * 0.9,
          z = 0.2;
        b.box(
          ["wood_dark", "metal_painted", "wood"][(r + c) % 3],
          x - 0.35,
          FA + 0.2 + r * 0.7,
          z - 0.3,
          x + 0.35,
          FA + 0.75 + r * 0.7,
          z + 0.2,
        );
        b.quad(
          c % 2 ? "glass_dark" : "lamp_amber",
          x,
          FA + 0.47 + r * 0.7,
          z + 0.21,
          0.4,
          0.25,
          0,
        );
      }
    C.col(-1.4, FA, -0.2, 2.2, FA + 2.2, 0.4, { walkable: false });
    C.prop("workbench", 1.5, FA, 9.5, Math.PI, {});
    // --- common room (east, z -18..-1) with the old wind-tunnel club photos
    F.table(C, -4, FA, -9, 2.4, 1.2, 0.3, { key: "wood_dark" });
    for (let k = 0; k < 4; k++)
      F.chair(
        C,
        -4 + Math.cos(k * 1.57 + 0.3) * 1.4,
        FA,
        -9 + Math.sin(k * 1.57 + 0.3) * 1.0,
        -k * 1.57,
        { key: "wood_dark", toppled: k === 2 },
      );
    F.sofa(C, -6.6, FA, -15, 2.2, Math.PI / 2, { key: "fabric_green" });
    C.prop("fizzo_machine", -7.8, FA, -2.2, -Math.PI / 2, {});
    b.cyl("wood_dark", -2.5, FA, -15.5, 0.5, 0.55, 1.1, 10);
    b.quad("lamp_amber", -2.5, FA + 0.7, -15.02, 0.6, 0.4, 0);
    C.col(-3, FA, -16, -2, FA + 1.1, -15, { walkable: false });
    // --- prow storeroom (z -27..-20): crates, a leaking radioactive drum, a skeleton
    F.crates(C, -16.8, FA, -22, 3, 0.1, { key: "wood_rotten" });
    C.prop("barrel", -17.2, FA, -24.4, 0, { radioactive: true });
    b.cyl("goo", -16.9, FA + 0.03, -24, 0.9, 0.9, 0.02, 14);
    C.radSource = { x: -17, y: 0.6, z: -24.2, radius: 3.2, strength: 1.5 };
    C.prop("skeleton", -15.2, FA, -25.2, 0.6, {
      pose: "sitting",
      collide: false,
    });
    C.prop("footlocker", -14.2, FA, -21.2, Math.PI, { loot: "footlocker" });
    // ================= THIRD FLOOR =================
    corridor(FB, HB, [9, -3], [5, -8]);
    b.box("carpet_green", -12.1, FB + 0.03, -20, -8.9, FB + 0.04, 21.2, {
      noAO: true,
    });
    A.wall(C, "plaster", { x0: -12.2, x1: 1.2, z: 21.2 }, FB, HB, 0.2, [
      { a: -10.9, b: -9.9, top: FB + 2.4 },
    ]);
    A.wall(C, "plaster", { x0: -18.5, x1: -12.2, z: 3 }, FB, HB, 0.15, []);
    A.wall(C, "plaster", { x0: -8.8, x1: xd(-1), z: -1 }, FB, HB, 0.15, []);
    for (let z = 19; z > -19; z -= 6)
      A.pendant(C, -10.5, HB - 0.7, z, HB, { light: false });
    // convoy office + message board (west, z 3..21)
    b.quad(T.board, -18.35, FB + 2.0, 12, 4.2, 2.8, Math.PI / 2, {
      noAO: true,
    });
    F.desk(C, -15.5, FB, 8, 2.0, 0.9, Math.PI / 2, { key: "wood_dark" });
    C.prop("file_cabinet", -18, FB, 5, Math.PI / 2, {
      loot: "file_cabinet",
      owner: "settlers",
    });
    const co = T.sign(
      "co",
      ["CONVOY OFFICE", "ROUTES · CONTRACTS · MANIFESTS"],
      { bg: "#3a2a1a", fg: "#f0c870", size: 48 },
      512,
      128,
    );
    b.quad(co, -12.32, FB + 2.9, 12, 2.4, 0.6, Math.PI / 2);
    for (let k = 0; k < 3; k++)
      F.crates(C, -16, FB, 16 + k * 1.6, 2, 0, { key: "cardboard" });
    // storerooms (west, z -20..3 and east)
    F.crates(C, -16.5, FB, -8, 4, 0.2, { key: "wood" });
    F.crates(C, -16.5, FB, -14, 3, -0.1, { key: "wood" });
    C.prop("locker", -18.1, FB, -2, Math.PI / 2, {
      loot: "locker",
      owner: "settlers",
    });
    for (const [x, z] of [
      [-4, 10],
      [0, 16],
      [-5, 4],
    ])
      F.crates(C, x, FB, z, 3, x * 0.1, { key: "cardboard" });
    C.prop("ammo_box", -2.5, FB, 12, 0, {
      loot: "ammo_box",
      owner: "settlers",
    });
    // ---- THE PROW OFFICE (z -27.3..-20, the wedge point) ----
    A.wall(
      C,
      "wood_dark",
      { x0: -18.5, x1: xd(-20.1), z: -20.1 },
      FB,
      HB,
      0.2,
      [{ a: -11.6, b: -10.4, top: FB + 2.4 }],
      { casing: "gold" },
    );
    b.box("carpet_red", -19, FB + 0.03, -27, xd(-20), FB + 0.04, -20.1, {
      noAO: true,
    });
    F.desk(C, -14.8, FB, -23.4, 2.2, 1.0, Math.PI, { key: "wood_dark" });
    F.chair(C, -14.8, FB, -22.4, 0, { key: "wood_dark", seat: "leather" });
    C.prop("terminal", -15.3, FB + 0.77, -23.5, Math.PI, {
      terminalId: "li_fl_ledger",
      mount: "bare",
    });
    b.box("paper", -14.2, FB + 0.77, -23.6, -13.7, FB + 0.8, -23.2);
    F.bookshelf(C, -17.9, FB, -22, 1.8, 2.2, Math.PI / 2, { seed: 9 });
    C.prop("safe", -18.3, FB, -24.6, Math.PI / 2, {
      items: [
        ["scrip", 220],
        ["li_skidoo_badge", 1],
        ["purified_water", 3],
      ],
      locked: 0,
      lock: LI.LOCKS.fl_post_safe,
      owner: "settlers",
      name: "Post Master's Safe",
    });
    b.flat(
      LI.texMat(
        "fl_map",
        LI.canvasTex(
          "fl_map",
          512,
          512,
          (x, W, H) => {
            LI.manhattanMap(x, W, H, { sea: "#2a3a3a", land: "#b8a878" });
            x.fillStyle = "#a02a20";
            x.font = "bold 22px monospace";
            x.fillText("CONVOY ROUTES", 20, 34);
            LI.wear(x, W, H, 4, 0.6);
          },
          { clamp: true },
        ),
      ),
      -14.8,
      FB + 0.8,
      -23.4,
      1.6,
      0.8,
      0,
      { uvRect: [0.25, 0.35, 0.75, 0.65] },
    );
    A.chandelier(C, -15, HB - 1.2, -23.5, HB, 0.6, { light: false });
    const po = T.sign(
      "po",
      ["POST MASTER", "FLATIRON TRADING POST — EST. 1981"],
      { bg: "#2a1a14", fg: "#f0c870", size: 44 },
      512,
      128,
    );
    b.quad(po, -11, FB + 2.8, -20.25, 2.2, 0.55, Math.PI);
    // roof hatch ladder in the corridor
    for (let k = 0; k < 10; k++)
      b.box(
        "metal_dark",
        -11.2,
        FB + 0.3 + k * 0.38,
        -17.2,
        -9.8,
        FB + 0.34 + k * 0.38,
        -17.1,
      );
    for (const x of [-11.2, -9.8])
      b.box("metal_dark", x - 0.03, FB, -17.2, x + 0.03, HB, -17.1);
    b.box("metal", -11.4, HB - 0.05, -17.8, -9.6, HB + 0.05, -16.4);
    // ==============================================================
    // doors & anchors
    // ==============================================================
    // world: stairwell door in the Trading Post's diagonal wall, between Gus's Guns and the diagonal street door.
    // landmarks_b's footprint edge runs (135.2, 93.7) → (174, 149); its 0.7 m wall + lining sit 0.72 m in from the
    // edge, so the door plane stands just proud of the lining (it used to be buried 7 cm behind the wallpaper).
    const FE = { x: 135.2, z: 93.7 },
      fu = [0.5744, 0.8186],
      fn = [-0.8186, 0.5744],
      FT = 36.0,
      FN = 0.75;
    const fAt = (t, nn) => ({
      x: FE.x + fu[0] * t + fn[0] * nn,
      z: FE.z + fu[1] * t + fn[1] * nn,
    });
    const dW = fAt(FT, FN),
      dIn = fAt(FT, FN + 0.2),
      dOut = fAt(FT, FN + 1.95),
      fYaw = Math.atan2(-fn[0], -fn[1]);
    C.door({
      pos: new THREE.Vector3(dIn.x, 1.3, dIn.z),
      label: "Stairwell — The Wedge (upper floors)",
      verb: "Climb",
      radius: 1.2,
      target: { x: C.O.x - 1.4, y: FA, z: C.O.z + 25.8, yaw: 0 },
      id: "li_fl_in",
    });
    C.door({
      pos: C.W(-1.4, FA + 1.3, 27.35),
      label: "Flatiron Trading Post (market floor)",
      verb: "Descend",
      radius: 1.2,
      target: { x: dOut.x, y: 0, z: dOut.z, yaw: fYaw },
      id: "li_fl_out",
    });
    C.door({
      pos: C.W(-10.5, FB + 2.2, -16.9),
      label: "Roof Hatch",
      verb: "Climb",
      radius: 1.2,
      target: { x: 148.7, y: 60.1, z: 131.4, yaw: Math.PI / 2 },
      id: "li_fl_roof",
    });
    C.anchor("entrance", -1.4, FA, 25.8, 0);
    C.anchor("dottie", -15.6, FA, 18.9, Math.PI);
    C.anchor("marisol", -4.8, FA, 17, -Math.PI / 2);
    C.anchor("sparks", -4.8, FA, 5, -Math.PI / 2);
    C.anchor("lorena", -14.8, FB, -24.6, 0);
    C.anchor("guard", -1.5, FB, 19.5, Math.PI);
    C.anchor("nate", -13.8, FA, 20.8, 0);
    C.anchor("merchant", -15.6, FA, 18.9, Math.PI);
    C.anchor("npc1", -15.6, FA, 18.9, Math.PI);
    C.anchor("npc2", -4.8, FA, 17, 0);
    C.anchor("npc3", -4.8, FA, 5, 0);
    C.anchor("npc4", -14.8, FB, -24.6, 0);
    C.anchor("spawn1", -10.5, FA, 10);
    C.anchor("spawn2", -10.5, FA, -12);
    C.anchor("spawn3", -4, FA, -12);
    C.anchor("spawn4", -10.5, FB, 8);
    C.anchor("spawn5", -4, FB, 0);
    C.anchor("spawn6", -15, FB, -12);
    C.anchor("loot1", -14.2, FA, -21.2);
    C.anchor("loot2", -18.3, FB, -24.6);
    C.pickup("li_note_skidoo", 1, -3.6, FA + 0.78, -9.2, 0.2);
    C.pickup("li_note_wedge_ledger", 1, -16.2, FA + 1.13, 17.7, 0.4);
    C.pickup("purified_water", 2, -16.4, FA + 0.05, -22.8, 0);
    C.pickup("scrap_electronics", 1, 1.2, FA + 0.95, 9.4, 0.3);
    C.finish();

    // ==============================================================
    // WORLD: stairwell door in the Trading Post + a safe roof deck
    // ==============================================================
    const W = LI.cell("flatiron_world", { world: true, lod: 260 });
    const wb = W.b;
    wb.ambient(0x3a3026, 1);
    wb.light(dOut.x, 2.8, dOut.z, 0xffc070, 5, 0.9);
    const ws = LI.texMat(
      "fl_wsign",
      LI.signTex(
        "fl_wsign",
        ["▲ THE WEDGE", "HOTEL · SHOPS · POST OFFICE"],
        { bg: "#3a2a1a", fg: "#f0c870", size: 48 },
        512,
        128,
      ),
      { rough: 0.8 },
    );
    LI.doorway(W, LI.doorFrame(dW.x, dW.z, fYaw), 0, {
      w: 1.2,
      h: 2.4,
      single: true,
      frame: "wood_dark",
      leaf: "wood",
      glass: "glass_dark",
      lamp: "cage",
      lampColor: 0xffc070,
      sill: "concrete_dark",
      sign: { key: ws, w: 1.8, h: 0.45, y: 0.55 },
    });
    // roof: walkable deck + railing (the building's own roof is a solid, non-walkable prism)
    const RY = 60.1,
      rin = [
        [133.8, 96.4],
        [135.2, 96.9],
        [170.6, 147.7],
        [132.3, 147.7],
        [132.3, 97.2],
      ];
    for (let z = 97; z < 147.6; z += 2) {
      const xr = Math.min(
        135.2 + (z - 96.9) * (35.4 / 50.8),
        135.2 + (z + 2 - 96.9) * (35.4 / 50.8),
      );
      W.col(132.3, RY - 0.4, z, Math.max(133, xr), RY, Math.min(147.7, z + 2), {
        surface: "concrete",
      });
    }
    for (let i = 0; i < rin.length; i++) {
      const p = rin[i],
        q = rin[(i + 1) % rin.length];
      A.rail(W, "rust", [p, q], RY, 1.1, { step: 2.0, batch: wb });
    }
    W.anchor("roof", 150.5, RY, 128.5, 0);
    W.col(150.2, RY, 134.2, 153.8, RY + 4.2, 137.8, {
      walkable: false,
      surface: "metal",
    }); // water tower legs
    for (const x of [145, 155])
      W.col(x - 0.2, RY, 123.8, x + 0.2, RY + 9, 124.2, {
        walkable: false,
        surface: "metal",
      }); // billboard posts
    W.door({
      pos: new THREE.Vector3(151.6, RY + 0.6, 131.4),
      label: "Roof Hatch — The Wedge",
      verb: "Descend",
      radius: 1.2,
      target: { x: C.O.x - 10.5, y: FB, z: C.O.z - 15.4, yaw: Math.PI },
      id: "li_fl_roof_down",
    });
    wb.box("metal", 150.8, RY, 130.8, 152.4, RY + 0.35, 132.2, {
      noBake: true,
    });
    W.col(150.8, RY, 130.8, 152.4, RY + 0.35, 132.2, { walkable: true });
    W.finish();
    LI.flWorld = W;
    return C;
  }

