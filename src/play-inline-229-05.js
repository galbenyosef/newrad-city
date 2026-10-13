// play-inline-229 05 — math
// Lines 420-1833 of readable/play-inline-229.pretty.js (statement-aligned).
  function build() {
    const C = LI.cell(KEY);
    C.site = "rockefeller";
    const b = C.b,
      T = art();
    b.ambient(0x2a2622, 1);
    // ---------------- lights ----------------
    for (const x of [-9, -1, 7, 15, 23]) b.light(x, 7, 0, 0xffd8a0, 12, 0.8);
    b.light(-12, 6, 0, 0xffc880, 10, 0.9);
    b.light(27, 3, 0, 0xffe0c0, 9, 0.6);
    for (const [x, z] of [
      [9, -16],
      [17, -16],
      [9, -12],
      [17, -20],
    ])
      b.light(x, 4.2, z, 0xe8f0ff, 9, 0.7);
    for (const [x, z] of [
      [8, 14],
      [14, 20],
      [20, 14],
      [14, 12],
    ])
      b.light(x, 6.8, z, 0xf0f4ff, 11, 0.8);
    b.light(20.5, 1.5, 22, 0xff9040, 6, 0.8);
    for (const [x, z] of [
      [-11, -22],
      [-3, -22],
      [-11, -32],
      [-3, -32],
    ])
      b.light(x, 12.5, z, 0xffe8c0, 12, 0.75);
    b.light(-6, 8, -27, 0xffd8a0, 9, 0.5);
    for (const [x, z] of [
      [8, -33],
      [15, -33],
    ])
      b.light(x, 9.3, z, 0xffd090, 10, 0.8);
    b.light(12, 7.5, -33, 0x60e0ff, 5, 0.6);
    b.light(-11, 3.5, -12.5, 0xffd8a0, 7, 0.5);
    // Rainbow Room
    const RX = 85,
      RZ = 0,
      RY = 20,
      RR = 15;
    b.light(RX, RY + 7.5, RZ, 0xfff0d8, 20, 1.0);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      b.light(
        RX + Math.cos(a) * 11,
        RY + 5,
        RZ + Math.sin(a) * 11,
        [0xff9a7a, 0xffc070, 0xffe890, 0x9ae890, 0x90c8ff, 0xc0a0ff][i],
        12,
        0.55,
      );
    }
    b.light(RX + 12.5, RY + 2.5, RZ, 0xffd090, 8, 0.8);

    // ==============================================================
    // LOBBY (x -14..30, z -8..8, y 0..10)
    // ==============================================================
    const LX0 = -14,
      LX1 = 30,
      LZ0 = -8,
      LZ1 = 8,
      LH = 10;
    A.floor(C, "marble_dark", LX0, LZ0, LX1, LZ1, 0.02, {
      col: false,
      th: 0.05,
    });
    for (const z of [-5.5, -2, 2, 5.5])
      b.box("brass", LX0, 0.03, z - 0.04, LX1, 0.035, z + 0.04, { noAO: true });
    for (let x = LX0 + 4; x < LX1; x += 4)
      b.box("brass", x - 0.04, 0.03, LZ0, x + 0.04, 0.035, LZ1, { noAO: true });
    // walls: black granite dado, tan marble above
    const lw = (line, gaps) => {
      A.wall(C, "granite_black", line, 0, 4, 0.3, gaps, { casing: "brass" });
      A.wall(C, "marble_warm", line, 4, LH, 0.3, [], { col: true });
    };
    lw({ x0: LX0, x1: LX1, z: LZ0 - 0.15 }, [
      { a: -13, b: -9, top: 3.6 },
      { a: 11.8, b: 14.2, top: 3 },
    ]);
    lw({ x0: LX0, x1: LX1, z: LZ1 + 0.15 }, [{ a: 12.8, b: 15.2, top: 3 }]);
    lw({ z0: LZ0, z1: LZ1, x: LX1 + 0.15 }, []);
    lw({ z0: LZ0, z1: LZ1, x: LX0 - 0.15 }, []);
    b.box("brass", LX0, 3.95, LZ0, LX1, 4.08, LZ0 + 0.05);
    b.box("brass", LX0, 3.95, LZ1 - 0.05, LX1, 4.08, LZ1);
    // ceiling: cream with painted mural panels between marble beams
    A.ceil(C, "paint_cream", LX0, LZ0, LX1, LZ1, LH);
    for (let i = 0; i < 4; i++) {
      const x0 = LX0 + 1 + i * 11,
        x1 = x0 + 9.4;
      b.quad(T.ceil, (x0 + x1) / 2, LH - 0.02, 0, 9.4, 14.4, 0, {
        rx: Math.PI / 2,
        uvRect: [i * 0.25, 0, i * 0.25 + 0.25, 1],
        noAO: true,
      });
      b.box("marble_warm", x1 + 0.1, LH - 0.7, LZ0, x1 + 1.5, LH, LZ1);
    }
    b.box("marble_warm", LX0, LH - 0.7, LZ0, LX0 + 1, LH, LZ1);
    b.box("marble_warm", LX0, LH - 0.5, LZ0, LX1, LH, LZ0 + 0.6);
    b.box("marble_warm", LX0, LH - 0.5, LZ1 - 0.6, LX1, LH, LZ1);
    // west wall: the great mural over three bronze elevator doors
    b.quad(T.mural, LX0 + 0.02, 7.05, 0, 15.6, 5.6, Math.PI / 2, {
      noAO: true,
    });
    b.box("gold", LX0, 4.1, -7.9, LX0 + 0.1, 4.3, 7.9);
    b.box("gold", LX0, 9.85, -7.9, LX0 + 0.1, 10, 7.9);
    for (const z of [-4.5, 0, 4.5]) {
      b.box("bronze", LX0, 0, z - 1.3, LX0 + 0.12, 3.3, z + 1.3);
      b.quad(T.elev, LX0 + 0.14, 1.5, z, 2.0, 3.0, Math.PI / 2);
      b.box("gold", LX0 + 0.1, 3.3, z - 1.3, LX0 + 0.2, 3.9, z + 1.3);
      b.quad(
        z === 0 ? "lamp_amber" : "glass_dark",
        LX0 + 0.21,
        3.6,
        z,
        1.6,
        0.35,
        Math.PI / 2,
      );
    }
    const expSign = T.sign(
      "exp",
      ["EXPRESS ⇧ 65", "RAINBOW ROOM · OBSERVATION"],
      { bg: "#1a1410", fg: "#f0c870", size: 50 },
      512,
      128,
    );
    b.quad(expSign, LX0 + 0.22, 3.62, 0, 1.55, 0.34, Math.PI / 2, {
      noAO: true,
    });
    // deco lanterns down the axis + wall uplights
    for (const x of [-9, -1, 7, 15, 23]) {
      b.rod("brass", [x, 8.4, 0], [x, LH, 0], 0.02);
      b.cyl("brass", x, 7.3, 0, 0.42, 0.3, 0.1, 8);
      b.cyl("lamp", x, 7.4, 0, 0.36, 0.4, 0.9, 8);
      b.cyl("brass", x, 8.3, 0, 0.2, 0.42, 0.14, 8);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.rod(
          "brass",
          [x + Math.cos(a) * 0.41, 7.4, Math.sin(a) * 0.41],
          [x + Math.cos(a) * 0.39, 8.3, Math.sin(a) * 0.39],
          0.012,
        );
      }
    }
    for (let x = LX0 + 2; x < LX1 - 1; x += 6)
      for (const s of [-1, 1]) {
        const z = s * (LZ1 - 0.18);
        b.box("gold", x - 0.18, 4.4, z - 0.08, x + 0.18, 6.4, z + 0.08);
        b.box("lamp", x - 0.1, 4.6, z - s * 0.1, x + 0.1, 6.2, z - s * 0.06);
        b.light(x, 5.4, z - s * 0.8, 0xffd8a0, 6, 0.55);
      }
    // directory board + Covenant checkpoint at the plaza doors
    b.box("granite_black", 20.5, 0, -1.4, 21, 2.6, 1.4);
    C.col(20.5, 0, -1.4, 21, 2.6, 1.4, { walkable: false });
    b.quad(T.dirSign, 21.02, 1.95, 0, 2.7, 0.42, Math.PI / 2, { noAO: true });
    F.sandbags(C, [25.5, -6.5], [23.8, -2.6], 0, 3);
    F.sandbags(C, [25.5, 6.5], [23.8, 2.6], 0, 3);
    for (const z of [-5, 5])
      b.quad(T.banner, 22, 6.2, z, 2.2, 6.6, Math.PI / 2, {
        double: true,
        noAO: true,
      });
    b.quad(T.banner, LX0 + 0.05, 6.8, -6.8, 1.6, 4.8, Math.PI / 2, {
      noAO: true,
    });
    F.crates(C, 27.5, 0, -6.7, 3, 0, { key: "metal_olive" });
    C.prop("turret", 26.5, 0, 6.2, -Math.PI / 2, {
      faction: "covenant",
      hostile: false,
      group: "li_rock_lobby",
    });
    // plaza doors (inside face)
    // plaza doors (inside face): bronze leaves with daylight in their glass, a lettered transom and a lamp
    LI.doorway(C, LI.doorFrame(LX1 - 0.02, 0, Math.PI / 2), 0, {
      w: 3.0,
      h: 3.1,
      frame: "bronze",
      leaf: "bronze",
      glass: "glass",
      lamp: "deco",
      lampColor: 0xe8f0ff,
      voidK: LI.voidTex("rock_plaza", {
        top: "#8a8e78",
        mid: "#6a6c5c",
        floor: "#4a4a40",
        glow: "rgba(230,236,210,0.55)",
        emissive: 0.8,
      }),
      sign: {
        key: T.sign(
          "exit",
          ["ROCKEFELLER PLAZA", "EXIT ▸ · SENTRIES ON THE DOORS"],
          { bg: "#1a1a1a", fg: "#e8d8b0", border: "#c8a860", size: 46 },
          512,
          128,
        ),
        w: 2.8,
        h: 0.6,
        y: 0.95,
      },
    });
    // out-of-order side elevators
    for (const [x, s] of [
      [-6, -1],
      [-6, 1],
      [2, 1],
    ]) {
      const z = s * (LZ1 - 0.02);
      b.quad(T.elev, x, 1.5, z, 2.0, 3.0, s > 0 ? Math.PI : 0);
      b.box("gold", x - 1.15, 3.0, z - 0.05, x + 1.15, 3.35, z + 0.05);
    }
    C.prop("skeleton", -12.6, 0, 5.8, Math.PI / 2, {
      pose: "sitting",
      collide: false,
    });

    // ==============================================================
    // ARMORY (x 4.3..22, z -24..-8.3)
    // ==============================================================
    const AX0 = 4.3,
      AX1 = 22,
      AZ0 = -24,
      AZ1 = -8.3,
      AH = 4.6;
    A.floor(C, "concrete", AX0, AZ0, AX1, AZ1, 0.02, { col: false });
    A.ceil(C, "paint_cream", AX0, AZ0, AX1, AZ1, AH);
    A.wall(
      C,
      "paint_green",
      { x0: AX0, x1: AX1, z: AZ0 - 0.15 },
      0,
      AH,
      0.3,
      [],
    );
    A.wall(
      C,
      "paint_green",
      { z0: AZ0, z1: AZ1, x: AX0 - 0.15 },
      0,
      AH,
      0.3,
      [],
    );
    A.wall(
      C,
      "paint_green",
      { z0: AZ0, z1: AZ1, x: AX1 + 0.15 },
      0,
      AH,
      0.3,
      [],
    );
    for (const [x, z] of [
      [9, -16],
      [17, -16],
    ])
      A.tube(C, x, AH - 0.05, z, 0, 1.3, { light: false });
    // weapon racks along the west + north walls: rifles (stock, barrel, magazine)
    const rack = (x0, z0, ux, uz, n, ry) => {
      for (let i = 0; i < n; i++) {
        const x = x0 + ux * i * 0.42,
          z = z0 + uz * i * 0.42;
        b.obox("wood_dark", x, 0.95, z, 0.08, 1.2, 0.05, ry, { rz: 0.05 });
        b.obox("metal_dark", x, 1.7, z, 0.05, 0.6, 0.05, ry);
        b.obox("metal_dark", x, 1.25, z, 0.06, 0.18, 0.1, ry);
      }
      b.obox(
        "wood_dark",
        x0 + ux * (n - 1) * 0.21,
        0.3,
        z0 + uz * (n - 1) * 0.21,
        n * 0.42 + 0.2,
        0.08,
        0.4,
        ry,
      );
      b.obox(
        "wood_dark",
        x0 + ux * (n - 1) * 0.21,
        1.95,
        z0 + uz * (n - 1) * 0.21,
        n * 0.42 + 0.2,
        0.06,
        0.2,
        ry,
      );
    };
    rack(5.2, -22.5, 0, 1, 12, Math.PI / 2);
    rack(8, -23.6, 1, 0, 14, 0);
    C.col(4.4, 0, -23, 5.6, 2, -17.6, { walkable: false });
    C.col(7.6, 0, -23.9, 14, 2, -23.2, { walkable: false });
    for (let i = 0; i < 6; i++)
      C.prop(
        "locker",
        15.9 + i * 0.95,
        0,
        -23.45,
        Math.PI,
        i < 2
          ? { loot: "covenant_crate", owner: "covenant" }
          : { loot: "locker", owner: "covenant" },
      );
    C.prop("workbench", 21.2, 0, -12, -Math.PI / 2, {});
    C.prop("ammo_box", 20.9, 0, -17.2, -Math.PI / 2, {
      loot: "ammo_box",
      owner: "covenant",
    });
    C.prop("ammo_box", 20.9, 0, -18.1, -Math.PI / 2, {
      loot: "ammo_box",
      owner: "covenant",
    });
    F.crates(C, 12, 0, -19, 4, 0.1, { key: "metal_olive" });
    F.table(C, 11.5, 0, -13.5, 2.4, 1.0, 0, { key: "metal_olive" });
    b.box("metal_dark", 10.6, 0.77, -13.7, 11.6, 0.85, -13.5);
    b.box("wood_dark", 11.7, 0.77, -13.6, 12.6, 0.83, -13.4);
    const armSign = T.sign(
      "arm",
      ["ARMORY", "SIGN OUT EVERY ROUND · LANCER FERRO"],
      { bg: "#2a3222", fg: "#e8d8b0", size: 48 },
      512,
      128,
    );
    b.quad(armSign, 13, 3.4, AZ1 - 0.02, 2.4, 0.6, Math.PI);

    // ==============================================================
    // EXO-RIG BAYS (x 4.3..24, z 8.3..26)
    // ==============================================================
    const PX0 = 4.3,
      PX1 = 24,
      PZ0 = 8.3,
      PZ1 = 26,
      PH = 7.5;
    A.floor(C, "diamond", PX0, PZ0, PX1, PZ1, 0.02, { col: false });
    A.ceil(C, "concrete", PX0, PZ0, PX1, PZ1, PH);
    A.wall(C, "concrete", { x0: PX0, x1: PX1, z: PZ1 + 0.15 }, 0, PH, 0.3, []);
    A.wall(C, "concrete", { z0: PZ0, z1: PZ1, x: PX0 - 0.15 }, 0, PH, 0.3, []);
    A.wall(C, "concrete", { z0: PZ0, z1: PZ1, x: PX1 + 0.15 }, 0, PH, 0.3, []);
    // crane rail
    b.box("metal_dark", PX0, PH - 0.6, 20.8, PX1, PH - 0.35, 21.1);
    b.box("metal_dark", PX0, PH - 0.6, 11.8, PX1, PH - 0.35, 12.1);
    b.box("paint_green", 13.2, PH - 1.0, 11.6, 14.6, PH - 0.35, 21.3, {
      c: 0xc8a030,
    });
    b.rod("iron", [13.9, PH - 1.0, 16.5], [13.9, 3.6, 16.5], 0.02);
    b.box("rust", 13.6, 3.3, 16.3, 14.2, 3.6, 16.7);
    // four gantries with suits (one empty — its suit is on the repair frame)
    for (let i = 0; i < 4; i++) {
      const x = 7 + i * 4.4,
        z = 24.2;
      b.box("paint_green", x - 1.4, 0, z - 0.9, x + 1.4, 0.12, z + 0.9, {
        c: 0xc8a030,
      });
      for (const s of [-1, 1])
        b.box(
          "metal_dark",
          x + s * 1.25 - 0.1,
          0,
          z - 0.1,
          x + s * 1.25 + 0.1,
          3.4,
          z + 0.1,
        );
      b.box("metal_dark", x - 1.35, 3.3, z - 0.12, x + 1.35, 3.5, z + 0.12);
      b.box("metal_dark", x - 0.1, 1.6, z + 0.2, x + 0.1, 3.3, z + 0.6);
      if (i !== 2)
        rigFrame(
          C,
          x,
          0.12,
          z - 0.1,
          Math.PI,
          i === 3 ? "rust" : "metal_olive",
        );
      C.col(x - 1.4, 0, z - 0.9, x + 1.4, 3.5, z + 0.9, {
        walkable: false,
        surface: "metal",
      });
      b.box("lamp_amber", x - 0.12, 3.52, z - 0.12, x + 0.12, 3.6, z + 0.12);
    }
    // hazard stripes on the floor in front of the bays
    const hz = LI.texMat(
      "rock_hazard",
      LI.canvasTex("rock_hazard", 256, 64, (x, W, H) => {
        x.fillStyle = "#d8b020";
        x.fillRect(0, 0, W, H);
        x.fillStyle = "#141414";
        for (let i = -2; i < 10; i++) {
          x.beginPath();
          x.moveTo(i * 32, 0);
          x.lineTo(i * 32 + 16, 0);
          x.lineTo(i * 32 - 16 + 16, H);
          x.lineTo(i * 32 - 16, H);
          x.fill();
        }
        LI.wear(x, W, H, 3, 0.8);
      }),
      { rough: 0.8 },
    );
    b.flat(hz, 13.8, 0.035, 22.9, 17, 0.4, 0, { us: 8 });
    // repair frame with a suit half apart
    rigFrame(C, 18.5, 0.3, 14.5, -Math.PI / 2, "metal_olive");
    b.box("metal_dark", 17.6, 0, 13.5, 19.4, 0.3, 15.5);
    for (const z of [13.6, 15.4])
      b.box("metal_dark", 18.4, 0.3, z - 0.06, 18.6, 3.2, z + 0.06);
    C.col(17.6, 0, 13.5, 19.4, 2.4, 15.5, { walkable: false });
    F.table(C, 21.8, 0, 17.2, 1.2, 2.4, 0, { key: "metal_dark", h: 0.95 });
    b.box("rust", 21.5, 0.95, 16.3, 22.1, 1.2, 16.9);
    b.cyl("metal_olive", 21.8, 0.95, 17.8, 0.14, 0.14, 0.4, 10);
    b.box("metal_painted", 22.9, 0, 21, 23.9, 1.8, 22.6, { c: 0x8a7a30 });
    C.col(22.9, 0, 21, 23.9, 1.8, 22.6, { walkable: false });
    b.box("lamp_red", 23.0, 1.5, 21.4, 23.05, 1.7, 21.6);
    C.prop("first_aid", PX0 + 0.2, 1.4, 12, Math.PI / 2, {});
    const paSign = T.sign(
      "pa",
      ["EXO-RIG BAYS", "NO ACOLYTES WITHOUT A LANCER PRESENT"],
      { bg: "#2a2a20", fg: "#e8c040", size: 44 },
      512,
      128,
    );
    b.quad(paSign, 14, 3.5, PZ0 + 0.02, 2.6, 0.65, 0);
    C.anchor("rig_helmet", 21.8, 0.98, 18.4);
    // work lamps over every gantry + a caged fill light row (baked)
    for (let i = 0; i < 4; i++) {
      const x = 7 + i * 4.4;
      b.rod("iron", [x, 5.2, 22.6], [x, PH, 22.6], 0.015);
      b.lathe(
        "metal_olive",
        [
          [0.05, 0.4],
          [0.1, 0.36],
          [0.45, 0.04],
          [0.48, 0],
        ],
        10,
        x,
        4.8,
        22.6,
      );
      b.sphere("lamp", x, 4.82, 22.6, 0.13, { ws: 8, hs: 6 });
      b.light(x, 4.2, 22.2, 0xfff0d8, 7.5, 0.95);
    }
    for (const x of [8, 14, 20]) {
      A.tube(C, x, PH - 0.3, 17.5, Math.PI / 2, 1.8, {
        lc: 0xe8f0ff,
        r: 10,
        i: 0.7,
      });
      b.rod("iron", [x, PH - 0.24, 17.0], [x, PH, 17.0], 0.01);
      b.rod("iron", [x, PH - 0.24, 18.0], [x, PH, 18.0], 0.01);
    }
    b.light(6.5, 2.5, 12, 0xffd8a0, 7, 0.5);
    // Covenant banners on the back wall between the bays, bay stencil
    for (const x of [9.2, 18.0])
      b.quad(T.banner, x, 5.2, PZ1 - 0.02, 1.5, 4.5, Math.PI, { noAO: true });
    const stencil = LI.texMat(
      "rock_bay_stencil",
      LI.canvasTex(
        "rock_bay_stencil",
        512,
        128,
        (x, W, H) => {
          x.clearRect(0, 0, W, H);
          x.fillStyle = "rgba(230,200,70,0.9)";
          x.font = "bold 84px Impact, sans-serif";
          x.textAlign = "center";
          x.textBaseline = "middle";
          x.fillText("BAY 1 · 2 · 3 · 4  —  RIG MK I", W / 2, H / 2);
          x.globalCompositeOperation = "destination-out";
          const r = LI.rng(45);
          for (let i = 0; i < 260; i++) {
            x.fillStyle = "rgba(0,0,0," + (r() * 0.8).toFixed(2) + ")";
            x.fillRect(r() * W, r() * H, 2 + r() * 8, 2 + r() * 5);
          }
        },
        { clamp: true },
      ),
      { transparent: true },
    );
    b.quad(stencil, 13.8, 6.4, PZ1 - 0.03, 9, 2.2, Math.PI, { noAO: true });
    // the half-stripped suit's parts laid out on a tarp, hoses, tool cart, battery crates
    b.flat("fabric_green", 16.2, 0.035, 11.6, 3.2, 2.2, 0.1, { c: 0x6a7040 });
    const partsR = LI.rng(4501);
    for (let k = 0; k < 7; k++)
      b.obox(
        k % 3 ? "metal_olive" : "metal_dark",
        15.2 + partsR() * 2.2,
        0.12,
        10.9 + partsR() * 1.4,
        0.3 + partsR() * 0.3,
        0.14 + partsR() * 0.1,
        0.25 + partsR() * 0.3,
        partsR() * TAU,
        { rx: partsR() * 0.3 },
      );
    b.sphere("metal_olive", 17.4, 0.22, 12.2, 0.2, { ws: 10, hs: 8, sy: 1.1 });
    b.obox("glass_dark", 17.4, 0.22, 12.02, 0.26, 0.1, 0.06, 0);
    for (let k = 0; k < 3; k++) {
      const pts = [];
      for (let j = 0; j <= 8; j++) {
        const t = j / 8;
        pts.push([
          PX1 - 0.2 - t * (5 + k * 1.3),
          0.05 + Math.sin(t * Math.PI) * 0.02,
          19 + k * 0.5 + Math.sin(t * 5 + k) * 0.6,
        ]);
      }
      for (let j = 0; j < 8; j++) b.rod("rubber", pts[j], pts[j + 1], 0.035);
    }
    b.box("metal_painted", 9.6, 0.15, 13.0, 10.6, 0.95, 13.6, { c: 0xa02820 });
    for (const [dx, dz] of [
      [-0.45, -0.25],
      [0.45, -0.25],
      [-0.45, 0.25],
      [0.45, 0.25],
    ])
      b.cyl("rubber", 10.1 + dx, 0, 13.3 + dz, 0.07, 0.07, 0.15, 8);
    b.box("metal_dark", 9.65, 0.96, 13.05, 10.55, 1.0, 13.55);
    b.cyl("steel", 9.9, 1.0, 13.3, 0.03, 0.03, 0.35, 6, { rz: 1.4 });
    b.box("rust", 10.2, 1.0, 13.2, 10.45, 1.12, 13.45);
    C.col(9.6, 0, 13.0, 10.6, 1.0, 13.6, { walkable: false });
    for (let k = 0; k < 3; k++) {
      const cx = 5.6,
        cz = 16 + k * 1.1;
      b.box(
        "metal_olive",
        cx - 0.5,
        k === 2 ? 0.0 : 0,
        cz - 0.45,
        cx + 0.5,
        0.6,
        cz + 0.45,
      );
      for (let m = 0; m < 3; m++)
        b.cyl("lamp_amber", cx - 0.3 + m * 0.3, 0.6, cz, 0.08, 0.08, 0.12, 8);
    }
    C.col(5.1, 0, 15.55, 6.1, 0.72, 18.75, { walkable: false });
    b.light(5.6, 1.2, 17.1, 0xffb040, 3.5, 0.6);
    const coreSign = T.sign(
      "cores",
      ["RIG BATTERIES", "COUNTED DAILY · FERRO"],
      { bg: "#2a2a20", fg: "#ffc040", size: 44 },
      512,
      128,
    );
    b.quad(coreSign, PX0 + 0.02, 1.35, 17.1, 1.4, 0.35, Math.PI / 2);
    // oil stains
    const oil = LI.texMat(
      "rock_oil",
      LI.canvasTex(
        "rock_oil",
        256,
        256,
        (x, W, H) => {
          x.clearRect(0, 0, W, H);
          const r = LI.rng(7);
          for (let i = 0; i < 9; i++) {
            const g = x.createRadialGradient(
              W / 2 + (r() - 0.5) * 120,
              H / 2 + (r() - 0.5) * 120,
              0,
              W / 2,
              H / 2,
              30 + r() * 70,
            );
            g.addColorStop(0, "rgba(10,8,6,0.8)");
            g.addColorStop(1, "rgba(10,8,6,0)");
            x.fillStyle = g;
            x.fillRect(0, 0, W, H);
          }
        },
        { clamp: true },
      ),
      { transparent: true, rough: 0.2 },
    );
    for (const [x, z] of [
      [7.2, 22.4],
      [16.0, 21.8],
      [18.8, 16.6],
    ])
      b.flat(oil, x, 0.04, z, 2.2, 2.2, x);

    // ==============================================================
    // GRAND STAIR → STUDIO 8H (Archivists' library, floor 6)
    // ==============================================================
    const SY = 6;
    A.stairs(C, "marble_dark", -11, LZ0 - 0.2, "n", 3.8, 0, SY, {
      nose: "brass",
    });
    A.wall(
      C,
      "granite_black",
      { z0: -16.9, z1: LZ0, x: -13.15 },
      0,
      SY + 4.5,
      0.3,
      [],
    );
    A.wall(
      C,
      "granite_black",
      { z0: -16.9, z1: LZ0, x: -8.85 },
      0,
      SY + 4.5,
      0.3,
      [],
    );
    b.box("marble_warm", -13.3, SY + 4.5, -16.9, -8.7, SY + 4.8, LZ0);
    for (const s of [-1, 1])
      A.rail(
        C,
        "brass",
        [
          [-11 + s * 1.75, LZ0 - 0.3],
          [-11 + s * 1.75, -16.6],
        ],
        0,
        0.9,
        { col: false, step: 0.6 },
      );
    const LBX0 = -16,
      LBX1 = 4,
      LBZ0 = -40,
      LBZ1 = -16.7,
      LBH = SY + 8;
    C.col(LBX0, 0, LBZ0, LBX1, SY, LBZ1, {});
    A.floor(C, "wood", LBX0, LBZ0, LBX1, LBZ1, SY + 0.01, {
      col: false,
      th: 0.05,
    });
    A.ceil(C, "concrete_dark", LBX0, LBZ0, LBX1, LBZ1, LBH);
    A.wall(
      C,
      "plaster",
      { x0: LBX0, x1: LBX1, z: LBZ0 - 0.15 },
      SY,
      LBH,
      0.3,
      [],
    );
    A.wall(C, "plaster", { x0: LBX0, x1: LBX1, z: LBZ1 + 0.15 }, SY, LBH, 0.3, [
      { a: -13, b: -9, top: SY + 3.2 },
    ]);
    A.wall(
      C,
      "plaster",
      { z0: LBZ0, z1: LBZ1, x: LBX0 - 0.15 },
      SY,
      LBH,
      0.3,
      [],
    );
    A.wall(
      C,
      "plaster",
      { z0: LBZ0, z1: LBZ1, x: LBX1 + 0.15 },
      SY,
      LBH,
      0.3,
      [{ a: -34.2, b: -31.8, top: SY + 2.7 }],
      { casing: "wood_dark" },
    );
    // acoustic panels + studio catwalk grid with lamps
    for (let z = LBZ0 + 1; z < LBZ1 - 1; z += 2.2)
      for (const x of [LBX0 + 0.16, LBX1 - 0.16])
        b.box(
          "fabric",
          x - 0.06,
          SY + 3.5,
          z - 0.9,
          x + 0.06,
          SY + 7,
          z + 0.9,
          { c: 0x5a5448 },
        );
    for (let x = LBX0 + 3; x < LBX1; x += 5)
      b.box("metal_dark", x - 0.15, LBH - 1.5, LBZ0, x + 0.15, LBH - 1.3, LBZ1);
    for (let z = LBZ0 + 4; z < LBZ1; z += 6)
      b.box("metal_dark", LBX0, LBH - 1.5, z - 0.15, LBX1, LBH - 1.3, z + 0.15);
    for (const [x, z] of [
      [-11, -22],
      [-3, -22],
      [-11, -32],
      [-3, -32],
    ]) {
      b.cyl("metal_dark", x, LBH - 2.3, z, 0.25, 0.35, 0.8, 10, { rx: 0.4 });
      b.cyl("lamp", x, LBH - 2.33, z + 0.15, 0.24, 0.24, 0.04, 10, { rx: 0.4 });
    }
    // the old stage at the north end with the ON AIR sign, now the Archivists' reading dais
    b.box("wood_dark", LBX0 + 1, SY, LBZ0, LBX1 - 1, SY + 0.66, LBZ0 + 5);
    C.col(LBX0 + 1, SY, LBZ0, LBX1 - 1, SY + 0.66, LBZ0 + 5, {
      surface: "wood",
    });
    A.stairs(C, "wood_dark", -6, LBZ0 + 6.2, "n", 3, SY, SY + 0.66, {});
    const onAir = LI.texMat(
      "rock_onair",
      LI.signTex(
        "rock_onair",
        ["ON AIR"],
        { bg: "#300806", fg: "#ff4a30", glow: "#ff2010", size: 90, wear: 0.3 },
        512,
        128,
      ),
      { emissive: 1.4 },
    );
    b.quad(onAir, -6, SY + 5.8, LBZ0 + 0.18, 2.4, 0.6, 0, { noAO: true });
    const st8 = T.sign(
      "st8",
      ["STUDIO 8H", "ARCHIVISTS OF THE ROCKEFELLER HOLD — SILENCE"],
      { bg: "#1a1a1a", fg: "#e8d8b0", border: "#c8a860", size: 56 },
      768,
      160,
    );
    b.quad(st8, -6, SY + 4.6, LBZ0 + 0.17, 4.2, 0.88, 0, { noAO: true });
    // stacks (the old audience risers), reading tables, catalogue drawers
    for (let row = 0; row < 3; row++)
      for (const x0 of [-14.6, -4.4])
        F.bookshelf(C, x0 + 4.1, SY, -21 - row * 3.6, 8, 2.6, 0, {
          seed: row * 11 + (x0 < -10 ? 1 : 2),
          gaps: 0.12,
        });
    for (const [x, z] of [
      [-10.5, -34.5],
      [-1.5, -34.5],
    ]) {
      F.table(C, x, SY + 0.66, z, 2.8, 1.2, 0, { key: "wood_dark" });
      for (const s of [-1, 1])
        F.chair(C, x + s * 0.8, SY + 0.66, z + 0.95, 0, { key: "wood_dark" });
    }
    for (const x of [-14.8, 2.8])
      for (let k = 0; k < 3; k++) {
        b.box(
          "wood_dark",
          x - 0.5,
          SY,
          -30.5 + k * 1.1,
          x + 0.5,
          SY + 1.4,
          -29.6 + k * 1.1,
        );
        for (let r = 0; r < 4; r++)
          for (let c = 0; c < 3; c++)
            b.box(
              "brass",
              x - (x < 0 ? -0.51 : 0.53),
              SY + 0.2 + r * 0.32,
              -30.35 + k * 1.1 + c * 0.28,
              x - (x < 0 ? -0.53 : 0.51),
              SY + 0.28 + r * 0.32,
              -30.2 + k * 1.1 + c * 0.28,
            );
        C.col(
          x - 0.5,
          SY,
          -30.5 + k * 1.1,
          x + 0.5,
          SY + 1.4,
          -29.6 + k * 1.1,
          { walkable: false },
        );
      }
    F.desk(C, -6, SY, -26.5, 2.2, 0.9, Math.PI, { key: "wood_dark" });
    C.prop("terminal", -6.4, SY + 0.77, -26.5, 0, {
      terminalId: "li_rock_archive",
      mount: "bare",
    });
    F.monitor(C, -5.2, SY + 0.77, -26.4, 0, {});
    F.papers(C, -6, SY + 0.02, -28, 2.5, 18, 301);
    b.quad(T.banner, LBX1 - 0.18, SY + 4.5, -24, 2.2, 6.6, -Math.PI / 2, {
      noAO: true,
    });
    b.quad(T.banner, LBX0 + 0.18, SY + 4.5, -30, 2.2, 6.6, Math.PI / 2, {
      noAO: true,
    });
    C.anchor("marsh", -6, SY, -25.6, Math.PI);

    // ==============================================================
    // THE HIGH WARDEN'S WAR ROOM (x 4.3..20, z -40..-26, floor 6)
    // ==============================================================
    const WX0 = 4.3,
      WX1 = 20,
      WZ0 = -40,
      WZ1 = -26,
      WH = SY + 4.2;
    C.col(WX0, 0, WZ0, WX1, SY, WZ1, {});
    A.floor(C, "carpet_red", WX0, WZ0, WX1, WZ1, SY + 0.01, {
      col: false,
      th: 0.05,
    });
    A.ceil(C, "wood_dark", WX0, WZ0, WX1, WZ1, WH);
    A.wall(
      C,
      "wood_dark",
      { x0: WX0, x1: WX1, z: WZ0 - 0.15 },
      SY,
      WH,
      0.3,
      [],
    );
    A.wall(
      C,
      "wood_dark",
      { x0: WX0, x1: WX1, z: WZ1 + 0.15 },
      SY,
      WH,
      0.3,
      [],
    );
    A.wall(
      C,
      "wood_dark",
      { z0: WZ0, z1: WZ1, x: WX1 + 0.15 },
      SY,
      WH,
      0.3,
      [],
    );
    // long table with the theatre map, the Warden's chair at the head (east): kept for a Warden who never comes
    F.table(C, 11.5, SY, -33, 9, 3, 0, { key: "wood_dark", h: 0.9 });
    b.flat(T.map, 11.5, SY + 0.91, -33, 8.6, 2.7, 0, {
      uvRect: [0, 0.18, 1, 0.82],
    });
    for (let k = 0; k < 4; k++)
      for (const s of [-1, 1])
        F.chair(C, 8 + k * 2.2, SY, -33 + s * 2.0, s > 0 ? 0 : Math.PI, {
          key: "wood_dark",
          seat: "leather",
        });
    b.box("leather", 17.2, SY, -33.5, 18.2, SY + 0.5, -32.5);
    b.box("leather", 17.9, SY + 0.5, -33.6, 18.3, SY + 2.3, -32.4);
    b.box("gold", 17.95, SY + 2.3, -33.1, 18.25, SY + 2.5, -32.9);
    b.obox("fabric_red", 17.5, SY + 0.56, -33, 0.5, 0.08, 0.5, 0.3);
    const eldSign = T.sign(
      "eld",
      ["THE WARDEN", "— VACANT —"],
      { bg: "#2a1a14", fg: "#e8d8b0", border: "#c8a860", size: 52 },
      256,
      128,
    );
    b.quad(eldSign, 16.35, SY + 0.98, -33, 0.5, 0.25, -Math.PI / 2, {
      rx: -0.3,
    });
    b.quad(T.banner, WX1 - 0.18, SY + 2.3, -33, 1.4, 4.2, -Math.PI / 2, {
      noAO: true,
    });
    b.cyl("metal_dark", 12, SY, -37.6, 0.5, 0.6, 0.9, 12);
    b.cyl("lamp_blue", 12, SY + 0.9, -37.6, 0.42, 0.42, 0.03, 12);
    C.col(11.4, SY, -38.2, 12.6, SY + 0.9, -37, { walkable: false });
    // (a lit map table: the blue lamp glass under a plotting sheet; no projected image — this is 1989 on 1967 kit)
    for (const [x, z] of [
      [8, -33],
      [15, -33],
    ])
      A.chandelier(C, x, WH - 1.4, z, WH, 0.8, { light: false });
    // wall-hung theatre map, recall orders board, sconces, a warm fill so the panelling reads
    F.frame(C, T.map, 11.5, SY + 2.3, WZ0 + 0.1, 6.4, 2.6, 0, {
      frame: "brass",
    });
    for (const x of [6.5, 16.5])
      A.sconce(C, x, SY + 2.4, WZ0 + 0.12, 0, { r: 7, i: 0.9 });
    for (const z of [-37.5, -29])
      A.sconce(C, WX1 - 0.12, SY + 2.4, z, -Math.PI / 2, { r: 7, i: 0.9 });
    b.light(11.5, SY + 3.2, -33, 0xffd8a8, 11, 0.7);
    b.light(11.5, SY + 1.4, -28, 0xffc890, 7, 0.4);
    const orders = T.sign(
      "orders",
      ["STANDING ORDERS", "HOLD THE ROCK · RECOVER TECH · TRUST NO FLAG"],
      { bg: "#2a1a14", fg: "#e8d8b0", border: "#c8a860", size: 44 },
      512,
      160,
    );
    b.quad(orders, WX1 - 0.17, SY + 2.3, -25.9 - 1.6, 1.6, 0.5, -Math.PI / 2);
    for (const [x, z, ry] of [
      [9.3, -33.7, 0.2],
      [13.6, -32.4, -0.4],
    ])
      b.flat("paper", x, SY + 0.925, z, 0.3, 0.42, ry);
    b.cyl("brass", 10.8, SY + 0.9, -32.6, 0.05, 0.06, 0.12, 8);
    b.cyl("glass", 12.8, SY + 0.9, -33.5, 0.04, 0.04, 0.14, 8);
    C.prop("terminal", 5.2, SY, -38.8, Math.PI / 2, {
      terminalId: "li_rock_war",
    });
    C.prop("footlocker", 19.2, SY, -38.8, -Math.PI / 2, {
      loot: "covenant_crate",
      owner: "covenant",
    });
    C.anchor("dalca", 16.2, SY, -35.6, -Math.PI / 2);

    // ==============================================================
    // RAINBOW ROOM (65th floor) — the Covenant's mess hall
    // ==============================================================
    C.col(RX - RR - 1, 0, RZ - RR - 1, RX + RR + 1, RY, RZ + RR + 1, {});
    b.cyl("wood", RX, RY - 0.3, RZ, RR + 0.8, RR + 0.8, 0.3, 48);
    b.cyl("carpet_red", RX, RY, RZ, RR + 0.8, RR + 0.8, 0.02, 48);
    // dance floor (flush) with the rainbow compass inlay; the perimeter tier rises one step (0.36) around it
    const TY = 0.36;
    b.flat(T.dance, RX, RY + 0.025, RZ, 12.4, 12.4, 0);
    for (let i = 0; i < 24; i++) {
      const a0 = (i / 24) * TAU,
        a1 = ((i + 1) / 24) * TAU,
        am = (a0 + a1) / 2,
        ri = 6.3,
        ro = RR + 0.3,
        L = 2 * ro * Math.sin(Math.PI / 24) + 0.06,
        rm = (ri + ro) / 2;
      const cx = RX + Math.cos(am) * rm,
        cz = RZ + Math.sin(am) * rm,
        ry = -am + Math.PI / 2;
      b.obox("carpet_red", cx, RY + TY / 2, cz, L, TY, ro - ri, ry, { fy: RY });
      C.colRot(cx, cz, L, ro - ri, RY, RY + TY, ry, { surface: "carpet" });
      const n = [
        RX + Math.cos(am) * (ri + 0.03),
        RZ + Math.sin(am) * (ri + 0.03),
      ];
      b.obox(
        "brass",
        n[0],
        RY + TY + 0.005,
        n[1],
        2 * ri * Math.sin(Math.PI / 24) + 0.02,
        0.03,
        0.07,
        ry,
        { noAO: true },
      );
    }
    b.cyl("brass", RX, RY, RZ, 6.25, 6.25, TY, 48, { open: true });
    C.dance = { x: RX, z: RZ, r: 6, y: RY };
    // chandelier + rainbow coves
    A.chandelier(C, RX, RY + 6.6, RZ, RY + 9, 2.2, { light: false });
    A.chandelier(C, RX, RY + 5.6, RZ, RY + 6.6, 1.2, { light: false });
    // the chandelier is the room's real light near the dance floor (fixture pool), plus warm uplight glows in the coves
    C.glow(RX, RY + 6.2, RZ, 0xffdcaa, 2.2, {
      fixture: true,
      intensity: 1.5,
      range: 16,
    });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + 0.5;
      C.glow(
        RX + Math.cos(a) * 10.2,
        RY + 8.3,
        RZ + Math.sin(a) * 10.2,
        [0xff9a7a, 0xffc070, 0xffe890, 0x9ae890, 0x90c8ff, 0xc0a0ff][i],
        1.6,
        { dayFactor: 1 },
      );
    }
    const hues = [
      "lamp_red",
      "lamp_amber",
      "lamp",
      "lamp_green",
      "lamp_blue",
      "lamp_cool",
    ];
    for (let k = 0; k < 3; k++) {
      const rr = 7 + k * 3.4;
      b.cyl(
        "plaster",
        RX,
        RY + 8.2 + k * 0.4,
        RZ,
        rr + 1.6,
        rr + 1.6,
        0.3,
        48,
        { open: false },
      );
      b.torus(hues[(k * 2) % 6], RX, RY + 8.15 + k * 0.4, RZ, rr, 0.06, {
        ts: 64,
        rs: 4,
      });
      b.torus(
        hues[(k * 2 + 1) % 6],
        RX,
        RY + 8.12 + k * 0.4,
        RZ,
        rr + 0.8,
        0.05,
        { ts: 64, rs: 4 },
      );
    }
    b.cyl("plaster", RX, RY + 9, RZ, 7.2, 7.2, 0.3, 48);
    // windows (24 bays) + panoramic skyline beyond
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * TAU,
        am = a + Math.PI / 24,
        L = 2 * (RR + 0.5) * Math.sin(Math.PI / 24) + 0.04;
      const mx = RX + Math.cos(a) * (RR + 0.5),
        mz = RZ + Math.sin(a) * (RR + 0.5);
      b.obox("marble_warm", mx, RY + 4.6, mz, 0.5, 9.2, 0.5, -a);
      const wx = RX + Math.cos(am) * (RR + 0.5),
        wz = RZ + Math.sin(am) * (RR + 0.5);
      b.obox("marble_warm", wx, RY + 0.4, wz, L, 0.8, 0.4, -am + Math.PI / 2);
      b.obox("marble_warm", wx, RY + 8.6, wz, L, 1.2, 0.4, -am + Math.PI / 2);
      const skip = i === 0 || i === 12; // doors east (Top of the Rock) and west (elevator)
      if (!skip)
        b.quad(
          i % 5 === 2 ? "glass_dark" : "glass",
          wx,
          RY + 4.4,
          wz,
          L - 0.5,
          7.2,
          -am - Math.PI / 2,
          { double: true },
        );
      C.colRot(wx, wz, L, 0.5, RY, RY + 9, -am + Math.PI / 2, {
        walkable: false,
      });
      if (!skip && i % 3 !== 1)
        for (const s of [-1, 1])
          b.obox(
            "fabric_red",
            RX + Math.cos(am + s * 0.1) * (RR + 0.1),
            RY + 4.4,
            RZ + Math.sin(am + s * 0.1) * (RR + 0.1),
            0.5,
            7.4,
            0.12,
            -am + Math.PI / 2 - s * 0.1,
          );
    }
    b.cyl(T.skyline, RX, RY - 8, RZ, RR + 9, RR + 9, 24, 48, {
      open: true,
      flip: true,
    });
    // tables on the tier (mess hall) + bar/kitchen on the south arc
    const rt = LI.rng(707);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU + 0.3;
      if (Math.abs(Math.sin(a)) < 0.25) continue;
      const x = RX + Math.cos(a) * 10.5,
        z = RZ + Math.sin(a) * 10.5;
      if (z > 8) continue;
      const ty = RY + TY;
      b.cyl("wood_dark", x, ty, z, 0.08, 0.1, 0.74, 8);
      b.cyl("fabric", x, ty + 0.72, z, 0.8, 0.8, 0.05, 16, { c: 0xe8e0d0 });
      for (let k = 0; k < 4; k++) {
        const ca = (k / 4) * TAU + rt();
        F.chair(
          C,
          x + Math.cos(ca) * 1.15,
          ty,
          z + Math.sin(ca) * 1.15,
          -ca - Math.PI / 2,
          { key: "wood_dark", seat: "fabric_red", toppled: rt() < 0.1 },
        );
      }
      C.col(x - 0.8, ty, z - 0.8, x + 0.8, ty + 0.75, z + 0.8, {
        walkable: false,
      });
      if (rt() < 0.5) b.cyl("metal", x + 0.2, ty + 0.77, z, 0.12, 0.1, 0.08, 8);
    }
    for (let k = -4; k <= 4; k++) {
      const a = Math.PI / 2 + k * 0.1;
      b.obox(
        "wood_dark",
        RX + Math.cos(a) * 12,
        RY + TY + 0.55,
        RZ + Math.sin(a) * 12,
        1.25,
        1.1,
        0.6,
        -a + Math.PI / 2,
      );
      b.obox(
        "marble_dark",
        RX + Math.cos(a) * 12,
        RY + TY + 1.12,
        RZ + Math.sin(a) * 12,
        1.3,
        0.06,
        0.8,
        -a + Math.PI / 2,
      );
      C.colRot(
        RX + Math.cos(a) * 12,
        RZ + Math.sin(a) * 12,
        1.25,
        0.8,
        RY,
        RY + TY + 1.15,
        -a + Math.PI / 2,
        { walkable: false },
      );
    }
    b.box(
      "metal",
      RX - 3,
      RY + TY,
      RZ + 13.2,
      RX + 3,
      RY + TY + 1.0,
      RZ + 13.9,
      { c: 0xb8b8b0 },
    );
    b.box(
      "rust",
      RX - 2.5,
      RY + TY + 1.0,
      RZ + 13.3,
      RX - 1.5,
      RY + TY + 1.2,
      RZ + 13.8,
    );
    C.col(RX - 3, RY, RZ + 13.2, RX + 3, RY + TY + 1.0, RZ + 13.9, {
      walkable: false,
    });
    b.cyl("metal", RX + 1.5, RY + TY + 1.0, RZ + 13.55, 0.3, 0.3, 0.45, 12);
    C.prop("fridge", RX + 3.8, RY + TY, RZ + 13.8, Math.PI, {
      loot: "fridge",
      owner: "covenant",
    });
    C.prop("radio", RX - 2.8, RY + TY + 1.14, RZ + 12.0, Math.PI, {});
    for (const a of [-2.2, 2.2])
      b.quad(
        T.banner,
        RX + Math.cos(a) * (RR - 0.2),
        RY + 5,
        RZ + Math.sin(a) * (RR - 0.2),
        1.8,
        5.4,
        -a - Math.PI / 2,
        { noAO: true, double: true },
      );
    const rrSign = T.sign(
      "rr",
      ["THE RAINBOW ROOM", "MESS HALL · ROCKEFELLER HOLD"],
      { bg: "#1a1410", fg: "#f0c870", size: 50 },
      512,
      128,
    );
    b.quad(rrSign, RX - RR + 0.35, RY + 3.4, RZ, 2.6, 0.65, Math.PI / 2, {
      noAO: true,
    });
    const torSign = T.sign(
      "tor",
      ["TOP OF THE ROCK ⇧", "OBSERVATION DECK · SENTRY POST"],
      { bg: "#1a1410", fg: "#f0c870", size: 48 },
      512,
      128,
    );
    b.quad(torSign, RX + RR - 0.35, RY + 3.4, RZ, 2.6, 0.65, -Math.PI / 2, {
      noAO: true,
    });
    for (const s of [-1, 1]) {
      b.box(
        "bronze",
        RX + s * (RR + 0.1) - 0.2,
        RY,
        RZ - 1.6,
        RX + s * (RR + 0.1) + 0.2,
        RY + 3.1,
        RZ + 1.6,
      );
      b.quad(
        T.elev,
        RX + s * (RR - 0.12),
        RY + 1.5,
        RZ,
        2.0,
        3.0,
        s > 0 ? -Math.PI / 2 : Math.PI / 2,
      );
    }
    C.anchor("cook", RX, RY + TY, RZ + 12.6, 0);

    // ==============================================================
    // doors & anchors
    // ==============================================================
    // Follows landmarks_a's `rockefeller.anchors.door` (door plane on the plaza, .yaw = looking OUT) once published.
    // (landmarks_a's current `door` is a standing spot in front of the doors, so only a door-PLANE anchor with .w/.h is adopted)
    const RA0 = LI.siteAnchor("rockefeller", "door", null),
      RA = RA0 && RA0.w ? RA0 : null;
    const PZW = RA ? RA.y || 0 : 2.5,
      RDX = RA ? RA.x : 84.35,
      RDZ = RA ? RA.z : -320,
      rYaw = RA ? RA.yaw || 0 : -Math.PI / 2;
    // out of the doors and half a step north: landmarks_a's dead Christmas tree stands on the door axis
    const rOut = [
        -Math.sin(rYaw) * 1.75 - Math.cos(rYaw) * 1.9,
        -Math.cos(rYaw) * 1.75 + Math.sin(rYaw) * 1.9,
      ],
      rOutYaw = Math.atan2(-rOut[0], -rOut[1]);
    C.door({
      pos: new THREE.Vector3(RDX, PZW + 1.4, RDZ),
      label: "30 Rockefeller Plaza",
      verb: "Enter",
      radius: 1.6,
      target: { x: C.O.x + 27.5, y: 0, z: C.O.z, yaw: Math.PI / 2 },
      id: "li_rock_in",
    });
    C.door({
      pos: C.W(LX1 - 0.2, 1.4, 0),
      label: "Rockefeller Plaza",
      verb: "Exit",
      radius: 1.5,
      target: { x: RDX + rOut[0], y: PZW, z: RDZ + rOut[1], yaw: rOutYaw },
      id: "li_rock_out",
    });
    C.door({
      pos: C.W(LX0 + 0.25, 1.4, 0),
      label: "Express Elevator — Rainbow Room (65)",
      verb: "Ride",
      radius: 1.3,
      target: { x: C.O.x + RX - RR + 2.2, y: RY, z: C.O.z, yaw: -Math.PI / 2 },
      sound: "door_open",
      id: "li_rock_elev_up",
    });
    C.door({
      pos: C.W(RX - RR + 0.3, RY + 1.4, 0),
      label: "Express Elevator — Lobby",
      verb: "Ride",
      radius: 1.3,
      target: { x: C.O.x + LX0 + 2, y: 0, z: C.O.z, yaw: -Math.PI / 2 },
      sound: "door_open",
      id: "li_rock_elev_down",
    });
    C.door({
      pos: C.W(RX + RR - 0.3, RY + 1.4, 0),
      label: "Top of the Rock",
      verb: "Climb",
      radius: 1.3,
      target: { x: 76.4, y: 148.1, z: -320, yaw: Math.PI / 2 },
      sound: "door_open",
      id: "li_rock_roof_up",
    });
    C.anchor("entrance", 27.5, 0, 0, Math.PI / 2);
    C.anchor("npc1", 24.6, 0, -4.2, Math.PI / 2);
    C.anchor("npc2", 24.6, 0, 4.2, Math.PI / 2);
    C.anchor("ferro", 20.6, 0, 17.2, -Math.PI / 2);
    C.anchor("acolyte", 11.5, 0, -12.6, Math.PI);
    C.anchor("rainbow", RX, RY, RZ, 0);
    C.anchor(
      "lancer_mess1",
      RX + Math.cos(0.3 + TAU / 10) * 10.5,
      RY + TY,
      RZ + Math.sin(0.3 + TAU / 10) * 10.5 - 1.15,
      0,
    );
    C.anchor("merchant", 20.6, 0, 17.2, -Math.PI / 2);
    C.anchor("spawn1", 10, 0, 0);
    C.anchor("spawn2", 13, 0, -15);
    C.anchor("spawn3", 14, 0, 17);
    C.anchor("spawn4", -6, SY, -30);
    C.anchor("spawn5", 12, SY, -30);
    C.anchor("spawn6", RX, RY, RZ + 3);
    C.anchor("loot1", 19.2, SY, -38.8);
    C.anchor("loot2", 20.9, 0, -17.2);
    C.pickup("li_reel_recall", 1, 18.9, SY + 0.93, -31.8, 0.3);
    C.pickup("li_note_archive_ledger", 1, -10.6, SY + 1.43, -34.4, 0);
    C.pickup("book_radio_handbook", 1, -1.2, SY + 1.44, -34.6, 1.2);
    C.pickup("li_covenant_tag", 1, -12.5, 0.02, 5.2, 0);
    C.finish();

    // ==============================================================
    // WORLD ADDITIONS: the Top of the Rock deck on the real roof of 30 Rock
    // ==============================================================
    const W = LI.cell("rock_world", { world: true, lod: 420 });
    const wb = W.b;
    wb.ambient(0x000000, 0);
    const X0 = 63.2,
      X1 = 79.8,
      Z0 = -323.3,
      Z1 = -316.7,
      Y = 148.1;
    W.col(X0, 146.9, Z0, X1, Y, Z1, { surface: "concrete" });
    wb.box("concrete", X0, Y - 0.05, Z0, X1, Y + 0.02, Z1, {
      noAO: true,
      noBake: true,
      grime: 0.3,
    });
    for (let x = X0; x < X1; x += 1.5)
      wb.box(
        "wood",
        x + 0.05,
        Y + 0.02,
        Z0 + 0.3,
        x + 1.4,
        Y + 0.05,
        Z1 - 0.3,
        { noBake: true },
      );
    // glass safety panels (the deck's signature) on a steel sill
    const edge = [
      [X0, Z0],
      [X1, Z0],
      [X1, Z1],
      [X0, Z1],
      [X0, Z0],
    ];
    for (let i = 0; i < 4; i++) {
      const p = edge[i],
        q = edge[i + 1],
        L = Math.hypot(q[0] - p[0], q[1] - p[1]),
        n = Math.round(L / 1.6);
      for (let k = 0; k < n; k++) {
        const t0 = k / n,
          t1 = (k + 1) / n,
          cx = p[0] + ((q[0] - p[0]) * (t0 + t1)) / 2,
          cz = p[1] + ((q[1] - p[1]) * (t0 + t1)) / 2,
          ry = Math.atan2(-(q[1] - p[1]), q[0] - p[0]);
        wb.obox("glass", cx, Y + 1.0, cz, L / n - 0.06, 1.7, 0.04, ry, {
          noBake: true,
        });
        wb.obox(
          "steel",
          p[0] + (q[0] - p[0]) * t0,
          Y + 1.0,
          p[1] + (q[1] - p[1]) * t0,
          0.08,
          2.0,
          0.08,
          ry,
          { noBake: true },
        );
      }
      wb.obox(
        "steel",
        (p[0] + q[0]) / 2,
        Y + 0.1,
        (p[1] + q[1]) / 2,
        L,
        0.2,
        0.25,
        Math.atan2(-(q[1] - p[1]), q[0] - p[0]),
        { noBake: true },
      );
      W.colRot(
        (p[0] + q[0]) / 2,
        (p[1] + q[1]) / 2,
        L,
        0.3,
        Y,
        Y + 1.9,
        Math.atan2(-(q[1] - p[1]), q[0] - p[0]),
        { walkable: false, surface: "metal" },
      );
    }
    // elevator bulkhead with the door down, coin binoculars, sandbagged sentry post
    wb.box("limestone", 77.9, Y, -322.6, X1 - 0.05, Y + 3.1, -317.4, {
      noBake: true,
    });
    W.col(77.9, Y, -322.6, X1, Y + 3.1, -317.4, { walkable: false });
    wb.box("bronze", 77.85, Y, -320.9, 77.9, Y + 2.6, -319.1, { noBake: true });
    wb.box("iron", 77.8, Y + 3.1, -322.8, X1, Y + 3.3, -317.2, {
      noBake: true,
    });
    for (const z of [-322.2, -317.8]) {
      wb.cyl("steel", 66.5, Y, z, 0.08, 0.1, 1.1, 8, { noBake: true });
      wb.box("metal_olive", 66.25, Y + 1.1, z - 0.2, 66.75, Y + 1.45, z + 0.2, {
        noBake: true,
      });
      W.col(66.35, Y, z - 0.15, 66.65, Y + 1.4, z + 0.15, { walkable: false });
    }
    W.col(68.3, Y, -320.7, 69.7, Y + 16, -319.3, {
      walkable: false,
      surface: "metal",
    }); // the comms mast (landmarks_a) gets a collider
    F.sandbags(W, [71, -322.9], [74, -322.9], Y, 2);
    W.anchor("rooftop", 74.5, Y, -320, Math.PI);
    W.anchor("scope", 73.2, Y, -317.2, 0);
    wb.cyl("metal_dark", 73.2, Y, -317.3, 0.1, 0.14, 1.1, 8, { noBake: true });
    wb.cyl("metal_olive", 73.2, Y + 1.1, -317.3, 0.16, 0.2, 0.8, 10, {
      rx: Math.PI / 2 - 0.2,
      noBake: true,
    });
    W.col(72.9, Y, -317.6, 73.5, Y + 1.3, -317, { walkable: false });
    // the plaza door itself: landmarks_a's east entrance is a broken glass wall under the Wisdom relief with no
    // readable door — give it a bronze deco doorway (one leaf ajar onto the lit lobby) and a lamp that pools at night
    {
      const Fr = LI.doorFrame(RA ? RA.x : 84.42, RDZ, rYaw);
      LI.doorway(W, Fr, PZW, {
        w: 2.6,
        h: 3.2,
        frame: "bronze",
        leaf: "bronze",
        glass: "glass_dark",
        ajar: 1,
        lamp: "deco",
        voidK: LI.voidTex("rock_void", {
          glow: "rgba(255,214,150,0.6)",
          figure: true,
        }),
      });
      for (const s2 of [-1, 1]) {
        // sandbag cheeks (Covenant sentries)
        const a = Fr.p(s2 * 3.1, 0.4),
          q = Fr.p(s2 * 3.1, 1.4);
        F.sandbags(W, a, q, PZW, 2);
      }
    }
    W.door({
      pos: new THREE.Vector3(77.7, Y + 1.3, -320),
      label: "Rainbow Room",
      verb: "Descend",
      radius: 1.3,
      target: { x: C.O.x + RX + RR - 2.2, y: RY, z: C.O.z, yaw: Math.PI / 2 },
      sound: "door_open",
      id: "li_rock_roof_down",
    });
    W.finish();
    LI.rockWorld = W;
    return C;
  }

