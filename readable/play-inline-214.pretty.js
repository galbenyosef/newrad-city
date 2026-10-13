/* src/poi_harbor/11_ellis_grounds.js */
/* =====================================================================
 * POI_HARBOR — Ellis Island grounds (exterior landscaping)
 * The map lays a plain paved disk for the island; this dresses it into
 * the settlement's grounds: raised dead-lawn beds with granite curbs,
 * dry weeds, bare trees and benches around the forecourt; behind the
 * Registry a working yard — the settlers' potato & gnarlberry farm, a glass-
 * house skeleton, scrap shacks, a water tower, laundry lines, the burial
 * row, and the ruined Powerhouse with its tall brick chimney (a skyline
 * marker from the Battery).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._pharbor) return;
  const PH = G._pharbor;
  const TAU = Math.PI * 2;

  function build(root) {
    const L = G.LAYOUT;
    const CX = L.ELLIS.x,
      CZ = L.ELLIS.z,
      R = L.ELLIS.r - 2.5; // inside the map's coping & railing
    const b = PH.batch("ellis_grounds");
    b.ground = 0;
    b.aoH = 3;
    const r = PH.rng("ellis_grounds");
    const anchors = {};

    // ---------------- raised lawn beds (dead grass, granite curbs, weeds, trees) ----------------
    const LAWNS = [
      [-576, 1030, -543, 1077.5], // NW forecourt lawn
      [-497, 1030, -464, 1077.5], // NE forecourt lawn
      [-576, 1080, -555, 1100], // west of the west wing
      [-485, 1080, -464, 1093], // east of the east wing (the ramp path runs south of it)
      [-576, 1103, -555, 1146], // SW lawn
      [-485, 1104, -464, 1146], // SE lawn (burial row)
    ];
    const lawnPolys = [];
    for (const [x0, z0, x1, z1] of LAWNS) {
      const pts = PH.clipRectDisk(x0, z0, x1, z1, CX, CZ, R, 1.2);
      if (pts.length < 3) continue;
      lawnPolys.push(pts);
      PH.groundPoly(b, "grass", pts, 0.16, { thick: 0.2, grime: 0.25 });
      PH.curb(b, pts, "granite", 0.24, 0.24, {});
      // bare patches of trodden dirt inside the lawn
      for (let k = 0; k < 3; k++) {
        const cx = x0 + (x1 - x0) * (0.2 + r() * 0.6),
          cz = z0 + (z1 - z0) * (0.2 + r() * 0.6);
        if (!PH.inPoly(cx, cz, pts)) continue;
        const patch = [];
        const rr = 1.5 + r() * 2.5;
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * TAU;
          const q = rr * (0.7 + r() * 0.5);
          patch.push([cx + Math.cos(a) * q, cz + Math.sin(a) * q * 0.8]);
        }
        PH.groundPoly(b, "soil", patch, 0.175, { grime: 0.3 });
      }
      PH.tuftsIn(b, pts, 0.15, 0.22, x0 + z0, 1.0);
    }
    const inLawn = (x, z) => lawnPolys.some((p) => PH.inPoly(x, z, p));

    // weeds pushing through the forecourt paving and along the building's foot
    for (let i = 0; i < 90; i++) {
      const x = -541 + r() * 42,
        z = 1040 + r() * 38;
      if (Math.abs(x + 520) < 5 && z > 1058) continue; // keep the gate lane clean
      PH.tuft(b, x, 0, z, 0.35 + r() * 0.4, i);
    }
    for (let i = 0; i < 70; i++) {
      const x = -552 + r() * 64,
        z = r() < 0.5 ? 1078.4 - r() * 0.8 : 1098 + r() * 1.2;
      PH.tuft(b, x, 0, z, 0.4 + r() * 0.5, 200 + i);
    }

    // dirt drifts and litter over the forecourt paving
    for (const [dx, dz, rx, rz] of [
      [-538, 1042, 3.5, 2.2],
      [-503, 1044, 3.0, 2.5],
      [-536, 1056, 2.4, 1.6],
      [-505, 1057, 2.2, 1.8],
      [-528, 1039.5, 2.8, 1.2],
      [-511, 1077, 3.2, 1.0],
      [-532, 1077.2, 2.6, 0.9],
    ]) {
      const pts = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        const q = 0.65 + r() * 0.45;
        pts.push([dx + Math.cos(a) * rx * q, dz + Math.sin(a) * rz * q]);
      }
      PH.groundPoly(b, "soil", pts, 0.022 + r() * 0.01, { grime: 0.5 });
      for (let k = 0; k < 4; k++)
        PH.tuft(
          b,
          dx + (r() - 0.5) * rx,
          0.02,
          dz + (r() - 0.5) * rz,
          0.4 + r() * 0.5,
          k + dx,
        );
    }
    for (let i = 0; i < 70; i++) {
      const x = -541 + r() * 42,
        z = 1036 + r() * 42;
      b.quad("paper", x, 0.03, z, 0.18 + r() * 0.2, 0.25 + r() * 0.15, {
        rx: -Math.PI / 2,
        rz: r() * 3,
        uv: undefined,
        grime: 0.4,
        c: [0xd8d0c0, 0xb8b0a0, 0xc8b898][i % 3],
      });
    }

    // the dry fountain and the Arrivals statue at the head of the ferry path
    {
      const FX = -520,
        FZ = 1047.5,
        FR = 4.4;
      for (let k = 0; k < 8; k++) {
        const a0 = ((k + 0.5) / 8) * TAU,
          a1 = ((k + 1.5) / 8) * TAU;
        const x0 = FX + Math.cos(a0) * FR,
          z0 = FZ + Math.sin(a0) * FR,
          x1 = FX + Math.cos(a1) * FR,
          z1 = FZ + Math.sin(a1) * FR;
        const len = Math.hypot(x1 - x0, z1 - z0),
          ry = Math.atan2(-(z1 - z0), x1 - x0);
        b.box(
          "granite",
          (x0 + x1) / 2,
          0,
          (z0 + z1) / 2,
          len + 0.35,
          0.62,
          0.55,
          { ry, seg: false, grime: 0.55 },
        );
        b.box(
          "limestone",
          (x0 + x1) / 2,
          0.62,
          (z0 + z1) / 2,
          len + 0.45,
          0.1,
          0.7,
          { ry, seg: false, grime: 0.5 },
        );
        if (k !== 2)
          PH.colWall(x0, z0, x1, z1, 0.6, 0, 0.72, { walkable: true }); // one rim stone is cracked away
      }
      b.box(
        "rubble",
        FX + Math.cos((3 / 8) * TAU) * FR,
        0,
        FZ + Math.sin((3 / 8) * TAU) * FR,
        1.2,
        0.3,
        0.8,
        { ry: 0.4, seg: false },
      );
      const inner = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * TAU;
        inner.push([
          FX + Math.cos(a) * (FR - 0.2),
          FZ + Math.sin(a) * (FR - 0.2),
        ]);
      }
      PH.groundPoly(b, "soil", inner, 0.12, { grime: 0.6 });
      PH.tuftsIn(b, inner, 0.12, 0.9, 311, 0.9);
      for (let k = 0; k < 7; k++)
        b.rock(
          "rubble",
          FX + (r() - 0.5) * 5,
          0.15,
          FZ + (r() - 0.5) * 5,
          0.2 + r() * 0.25,
          { flat: 0.6 },
        );
      // pedestal
      b.boxMM("granite", FX - 0.9, 0, FZ - 0.9, FX + 0.9, 1.6, FZ + 0.9, {
        grime: 0.6,
      });
      b.boxMM(
        "limestone",
        FX - 1.05,
        1.6,
        FZ - 1.05,
        FX + 1.05,
        1.8,
        FZ + 1.05,
        { seg: false },
      );
      PH.colMM(FX - 1.05, 0, FZ - 1.05, FX + 1.05, 1.8, FZ + 1.05, {
        walkable: false,
      });
      // bronze figures (verdigris): a mother with a bundle, a boy with a suitcase, looking toward Manhattan
      const fig = (x, z, s, ry, kid) => {
        b.cyl("copper", x, 1.8, z, 0.2 * s, 0.34 * s, 1.1 * s, 10, { hSeg: 2 }); // coat
        b.cyl("copper", x, 1.8 + 1.1 * s, z, 0.17 * s, 0.2 * s, 0.35 * s, 10, {
          hSeg: 1,
        }); // shoulders
        b.sphere("copper", x, 1.8 + 1.58 * s, z, 0.12 * s, { ws: 10, hs: 8 }); // head
        const [hx, hz] = PH.rot(x, z, ry, 0.26 * s, -0.05);
        if (kid)
          b.box(
            "copper",
            hx,
            1.8 + 0.25 * s,
            hz,
            0.36 * s,
            0.26 * s,
            0.14 * s,
            { ry, seg: false },
          ); // suitcase
        else {
          const [bx, bz] = PH.rot(x, z, ry, 0.05, -0.18 * s);
          b.sphere("copper", bx, 1.8 + 1.15 * s, bz, 0.16 * s, {
            sx: 1,
            sy: 0.8,
            ws: 8,
            hs: 6,
          });
        } // bundle
        b.rod(
          "copper",
          PH.v3(hx, 1.8 + 0.4 * s, hz),
          PH.v3(hx - 0.02, 1.8 + 1.05 * s, hz + 0.02),
          0.045 * s,
          5,
        );
      };
      fig(FX - 0.3, FZ + 0.1, 1.0, Math.PI, false);
      fig(FX + 0.42, FZ - 0.05, 0.7, Math.PI, true);
      PH.readAt(
        FX,
        1.1,
        FZ - 1.0,
        "The Arrivals (bronze, 1965)",
        '"Dedicated to the twelve million who passed through these doors." Someone has scratched underneath: "AND THE ONES STILL COMING. WIPE YOUR FEET."',
      );
      anchors.fountain = PH.anchor(FX, 0, FZ - 5.5, 0);
    }

    // dead trees (the old ornamental plane trees) in the lawns
    const TREES = [
      [-560, 1048],
      [-552, 1060],
      [-566, 1068],
      [-549, 1040],
      [-480, 1048],
      [-488, 1060],
      [-474, 1068],
      [-491, 1040],
      [-566, 1090],
      [-474, 1086],
      [-564, 1116],
      [-561, 1132],
      [-472, 1112],
      [-478, 1138],
    ];
    TREES.forEach(([x, z], i) => {
      if (Math.hypot(x - CX, z - CZ) < R - 2)
        PH.deadTree(b, x, 0.15, z, 7 + r() * 5, i + 11);
    });
    // fallen tree across the NE lawn
    b.rod("bark", PH.v3(-482, 0.35, 1056), PH.v3(-471, 0.6, 1062), 0.3, 7, {
      r2: 0.18,
    });
    for (let k = 0; k < 4; k++)
      b.rod(
        "bark",
        PH.v3(-478 + k * 2, 0.5, 1058 + k),
        PH.v3(
          -477 + k * 2 + (r() - 0.5) * 2,
          1.8 + r(),
          1057 + k + (r() - 0.5) * 2,
        ),
        0.07,
        4,
        { r2: 0.02 },
      );
    PH.col(-476.5, 1059, 11, 0.8, 0, 0.9, Math.atan2(-6, 11), {
      walkable: true,
    });

    // benches along the lawn edges facing the forecourt, lamp posts, a toppled one
    const bench = (x, z, ry) => {
      const [ax, az] = PH.rot(x, z, ry, 0, 0);
      b.box("wood", ax, 0.42, az, 1.8, 0.06, 0.45, {
        ry,
        seg: false,
        c: 0x8a7a66,
      });
      const [bx, bz] = PH.rot(x, z, ry, 0, 0.24);
      b.box("wood", bx, 0.55, bz, 1.8, 0.4, 0.05, {
        ry,
        rx: -0.15,
        seg: false,
        c: 0x8a7a66,
      });
      for (const s of [-0.75, 0.75]) {
        const [lx, lz] = PH.rot(x, z, ry, s, 0.05);
        b.box("iron", lx, 0, lz, 0.06, 0.45, 0.5, { ry, seg: false });
      }
      PH.col(ax, az, 1.8, 0.6, 0, 0.5, ry, { walkable: true });
    };
    bench(-544.2, 1050, Math.PI / 2);
    bench(-544.2, 1058, Math.PI / 2);
    bench(-495.8, 1050, -Math.PI / 2);
    bench(-495.8, 1058, -Math.PI / 2);
    for (const [x, z, lit] of [
      [-542.4, 1044, true],
      [-497.6, 1044, false],
      [-542.4, 1070, false],
      [-497.6, 1070, true],
    ]) {
      b.cyl("iron", x, 0, z, 0.08, 0.13, 4.2, 6, { hSeg: 1 });
      b.cyl("iron", x, 0, z, 0.2, 0.2, 0.5, 8, { hSeg: 1 });
      b.lathe(
        "iron",
        [
          [0.05, 0],
          [0.26, 0.12],
          [0.3, 0.2],
          [0.04, 0.5],
        ],
        8,
        x,
        4.3,
        z,
        {},
      );
      b.sphere(lit ? "lamp" : "glass", x, 4.35, z, 0.18, {
        ws: 8,
        hs: 6,
        noAO: true,
      });
      PH.col(x, z, 0.3, 0.3, 0, 4.2, 0, { walkable: false });
      if (lit)
        PH.onReady.push(() =>
          PH.safe("glow", () => {
            if (!G.isStub("fx") && G.fx.glowSprite)
              G.fx.glowSprite(PH.v3(x, 4.35, z), 0xffcf8a, 1.2, {
                intensity: 1.0,
                dayFactor: 0.1,
              });
          }),
        );
    }
    b.rod("iron", PH.v3(-476, 0.2, 1074), PH.v3(-479.5, 0.25, 1071.3), 0.1, 6); // toppled lamp in the NE lawn

    // ---------------- the working yard behind the Registry ----------------
    const yard = PH.clipRectDisk(-554.5, 1099, -486, 1146, CX, CZ, R, 1.2);
    PH.groundPoly(b, "soil", yard, 0.03, { grime: 0.45 });
    PH.tuftsIn(b, yard, 0.03, 0.05, 77, 0.8);
    // gravel path from the east boat ramp around to the yard
    PH.groundPoly(
      b,
      "gravel",
      [
        [-488, 1094.5],
        [-466, 1094.5],
        [-466, 1101.5],
        [-488, 1101.5],
      ],
      0.035,
      { grime: 0.3 },
    );

    // --- farm: seven crop rows inside a scrap-post fence
    const FX0 = -547.5,
      FX1 = -532.5,
      FZ0 = 1102.5,
      FZ1 = 1115;
    for (let i = 0; i < 7; i++)
      PH.cropRow(
        b,
        FX0 + 1.3 + i * 2.1,
        FZ0 + 1.2,
        FX0 + 1.3 + i * 2.1,
        FZ1 - 1.2,
        i,
      );
    PH.railing(
      b,
      [
        [FX1, FZ0 + 3],
        [FX1, FZ0],
        [FX0, FZ0],
        [FX0, FZ1],
        [FX1, FZ1],
        [FX1, FZ1 - 3],
      ],
      0,
      1.05,
      "rotten",
      { postStep: 1.8, r: 0.045 },
    );
    const farmK = PH.signMat(
      "ellis_farm",
      ["REGISTRY VICTORY GARDEN", "POTATOES · GNARLBERRIES · PATIENCE"],
      "raider",
      512,
      192,
      { bg: "#4a5a3a", fg: "#e8dcb0" },
    );
    b.box("rotten", FX1 + 0.2, 0, FZ0 + 4.2, 0.12, 1.9, 0.12, { seg: false });
    b.quad(farmK, FX1 + 0.3, 1.6, FZ0 + 4.2, 1.6, 0.6, { ry: Math.PI / 2 });
    // scarecrow in a old-world mailman's uniform
    b.rod("rotten", PH.v3(-540, 0, 1108.5), PH.v3(-540, 2.4, 1108.5), 0.05, 5);
    b.rod(
      "rotten",
      PH.v3(-540.9, 1.85, 1108.5),
      PH.v3(-539.1, 1.85, 1108.5),
      0.04,
      5,
    );
    b.box("fabric", -540, 1.2, 1108.5, 0.5, 0.75, 0.25, {
      seg: false,
      c: 0x4a5a78,
    });
    b.sphere("burlap", -540, 2.25, 1108.5, 0.2, { ws: 8, hs: 6 });
    b.cyl("fabric", -540, 2.38, 1108.5, 0.2, 0.26, 0.14, 8, {
      hSeg: 1,
      c: 0x3a4a68,
    });
    // tools, a wheelbarrow, seed crates
    PH.crates(b, -533.8, 0, 1116.4, 0.2, 3, {});
    b.box("rust", -531.6, 0.35, 1109.5, 0.7, 0.35, 1.1, {
      ry: 0.3,
      seg: false,
    });
    b.cyl("rubber", -531.3, 0.25, 1109.0, 0.25, 0.25, 0.1, 10, {
      rz: Math.PI / 2,
      ry: 0.3,
      hSeg: 1,
    });
    b.rod("rotten", PH.v3(-533, 0, 1111), PH.v3(-532.2, 1.5, 1111.4), 0.025, 4);
    anchors.farm = PH.anchor(-540, 0, 1101.2, Math.PI);

    // --- glasshouse skeleton (iron hoops, a few surviving panes) over two planting beds
    const GX0 = -528,
      GX1 = -512,
      GZC = 1120,
      GR = 3.2;
    for (let x = GX0; x <= GX1 + 0.01; x += 2) {
      let prev = null;
      for (let k = 0; k <= 8; k++) {
        const a = (Math.PI * k) / 8,
          p = PH.v3(x, 0.4 + Math.sin(a) * GR, GZC - Math.cos(a) * GR);
        if (prev) b.rod("iron", prev, p, 0.05, 5);
        prev = p;
      }
      for (const s of [-1, 1]) {
        b.box("iron", x, 0, GZC + s * GR, 0.12, 0.45, 0.12, { seg: false });
        PH.col(x, GZC + s * GR, 0.2, 0.2, 0, 1.2, 0, { walkable: false });
      }
    }
    for (let k = 1; k < 8; k++) {
      const a = (Math.PI * k) / 8;
      b.rod(
        "iron",
        PH.v3(GX0, 0.4 + Math.sin(a) * GR, GZC - Math.cos(a) * GR),
        PH.v3(GX1, 0.4 + Math.sin(a) * GR, GZC - Math.cos(a) * GR),
        0.03,
        4,
      );
    }
    b.boxMM("concrete", GX0, 0, GZC - GR - 0.2, GX1, 0.4, GZC - GR + 0.2, {
      seg: false,
    });
    b.boxMM("concrete", GX0, 0, GZC + GR - 0.2, GX1, 0.4, GZC + GR + 0.2, {
      seg: false,
    });
    for (let x = GX0; x < GX1 - 0.5; x += 2)
      for (let k = 1; k < 8; k++) {
        if (r() > 0.22) continue;
        const a0 = (Math.PI * k) / 8,
          a1 = (Math.PI * (k + 1)) / 8,
          am = (a0 + a1) / 2;
        b.box(
          "glass",
          x + 1,
          0.4 + Math.sin(am) * (GR - 0.02) - 0.02,
          GZC - Math.cos(am) * (GR - 0.02),
          1.95,
          0.02,
          (GR * Math.PI) / 8,
          { rx: -am + Math.PI / 2, seg: false, grime: 0.7 },
        );
      }
    for (const s of [-1, 1]) {
      b.boxMM(
        "wood",
        GX0 + 0.8,
        0,
        GZC + s * 1.3 - 0.6,
        GX1 - 0.8,
        0.45,
        GZC + s * 1.3 + 0.6,
        { seg: false, c: 0x8a7a60 },
      );
      PH.colMM(
        GX0 + 0.8,
        0,
        GZC + s * 1.3 - 0.6,
        GX1 - 0.8,
        0.45,
        GZC + s * 1.3 + 0.6,
        { surface: "wood" },
      );
      for (let x = GX0 + 1.4; x < GX1 - 1; x += 0.8) {
        const sz = 0.18 + r() * 0.15;
        b.rock(
          "foliage",
          x,
          0.5 + sz * 0.6,
          GZC + s * 1.3 + (r() - 0.5) * 0.5,
          sz,
          {
            detail: 0,
            rough: 0.8,
            grime: 0.1,
            sy: 0.8,
            c: [0xffffff, 0xc8c890][(x | 0) % 2],
          },
        );
      }
    }
    for (let k = 0; k < 6; k++)
      b.rock(
        "glass",
        GX0 + r() * 16,
        0.02,
        GZC + (r() - 0.5) * 7,
        0.2 + r() * 0.2,
        { detail: 0, flat: 0.08, grime: 0.6 },
      ); // shattered panes

    // --- scrap shacks along the east wing, water tower, laundry
    PH.shack(b, -491.2, 1106.2, Math.PI / 2, 4.2, 3.4, 2.7);
    PH.shack(b, -491.2, 1113.4, Math.PI / 2, 3.8, 3.2, 2.5);
    PH.shack(b, -551.8, 1107.5, -Math.PI / 2, 3.6, 3.2, 2.5);
    PH.waterTower(b, -502, 1127, 7.5, { r: 2.3, th: 3.4 });
    const wtK = PH.signMat(
      "ellis_water",
      ["THE REGISTRY", "WATER — 2 SCRIP"],
      "raider",
      512,
      160,
      { bg: "#2a4a5a", fg: "#e0e0d0" },
    );
    b.quad(wtK, -502, 9.4, 1124.66, 3.0, 0.9, { ry: Math.PI });
    for (const [ax, az, bx, bz] of [
      [-494, 1102.5, -503, 1102.8],
      [-494, 1110, -503, 1110.4],
    ]) {
      for (const [px, pz] of [
        [ax, az],
        [bx, bz],
      ])
        b.rod("rotten", PH.v3(px, 0, pz), PH.v3(px, 2.3, pz), 0.05, 5);
      b.rod("rope", PH.v3(ax, 2.2, az), PH.v3(bx, 2.0, bz), 0.012, 3);
      for (let k = 1; k < 6; k++) {
        const t = k / 6;
        if (r() < 0.25) continue;
        b.box(
          "fabric",
          ax + (bx - ax) * t,
          1.35 + r() * 0.2,
          az + (bz - az) * t,
          0.5 + r() * 0.3,
          0.7 + r() * 0.3,
          0.02,
          {
            ry: Math.atan2(-(bz - az), bx - ax),
            seg: false,
            c: [0xb8b0a0, 0x7a8a9a, 0x9a6a5a, 0xc8c0a0, 0x6a7a5a][k % 5],
          },
        );
      }
    }
    // cookfire between the shacks, rain barrels, junk
    b.cyl("rust", -497, 0, 1109.8, 0.35, 0.35, 0.8, 10, { hSeg: 1 });
    PH.col(-497, 1109.8, 0.7, 0.7, 0, 0.8, 0, { walkable: false });
    PH.onReady.push(() =>
      PH.safe("yard fire", () => {
        if (!G.isStub("fx") && G.fx.fire)
          G.fx.fire(PH.v3(-497, 0.85, 1109.8), 0.5);
      }),
    );
    for (const [x, z] of [
      [-493.5, 1103.5],
      [-493.5, 1116],
      [-549.5, 1110.2],
    ]) {
      b.cyl("metal", x, 0, z, 0.32, 0.3, 0.95, 10, { hSeg: 1, c: 0x6a7a7a });
      PH.col(x, z, 0.6, 0.6, 0, 0.95, 0, { walkable: false });
    }
    PH.crates(b, -496, 0, 1118.5, 0.4, 4, {});
    anchors.yard = PH.anchor(-499, 0, 1110, Math.PI / 2);
    anchors.water_tower = PH.anchor(-502, 0, 1122.5, Math.PI);

    // ---------------- the Powerhouse (ruin) + chimney ----------------
    const PX0 = -549,
      PX1 = -536,
      PZ0 = 1120,
      PZ1 = 1130,
      PH_H = 9;
    const pwrWalls = [
      [
        PX0,
        PZ0,
        PX1,
        PZ0,
        [
          { c: 6.5, w: 2.4, h: 3.2 },
          { c: 2.2, w: 1.6, h: 3.4, b: 3.6 },
          { c: 10.8, w: 1.6, h: 3.4, b: 3.6 },
        ],
      ], // north (door)
      [
        PX1,
        PZ0,
        PX1,
        PZ1,
        [
          { c: 2.5, w: 1.6, h: 3.4, b: 3.6 },
          { c: 7.5, w: 1.6, h: 3.4, b: 3.6 },
        ],
      ],
      [
        PX1,
        PZ1,
        PX0,
        PZ1,
        [
          { c: 3.2, w: 1.6, h: 3.4, b: 3.6 },
          { c: 9.8, w: 1.6, h: 3.4, b: 3.6 },
        ],
      ],
      [PX0, PZ1, PX0, PZ0, [{ c: 5, w: 1.6, h: 3.4, b: 3.6 }]],
    ];
    for (const [x0, z0, x1, z1, gaps] of pwrWalls) {
      PH.wall(b, "brick", x0, z0, x1, z1, 0, PH_H, gaps, {
        t: 0.5,
        grime: 0.7,
      });
      // limestone belt course & coping
      const len = Math.hypot(x1 - x0, z1 - z0),
        ry = Math.atan2(-(z1 - z0), x1 - x0);
      b.box(
        "limestone",
        (x0 + x1) / 2,
        3.2,
        (z0 + z1) / 2,
        len + 0.6,
        0.3,
        0.62,
        { ry, seg: false, grime: 0.6 },
      );
      b.box(
        "limestone",
        (x0 + x1) / 2,
        0,
        (z0 + z1) / 2,
        len + 0.6,
        0.6,
        0.64,
        { ry, seg: false, grime: 0.7 },
      );
    }
    // broken parapet (jagged top) and the fallen roof: a few trusses left, sagging deck, rubble drift inside
    for (let x = PX0; x < PX1; x += 1.3) {
      const hh = 0.3 + r() * 1.4;
      b.box("brick", x + 0.65, PH_H, PZ1, 1.3, hh, 0.5, {
        seg: false,
        grime: 0.8,
      });
      if (r() < 0.6)
        b.box("brick", x + 0.65, PH_H, PZ0, 1.3, 0.2 + r() * 1.1, 0.5, {
          seg: false,
          grime: 0.8,
        });
    }
    for (let x = PX0 + 1.8; x < PX1 - 1; x += 2.6) {
      if (x > -542 && x < -539) continue; // the collapse
      b.beam(
        "rust",
        PH.v3(x, PH_H - 0.4, PZ0 + 0.3),
        PH.v3(x, PH_H - 0.4, PZ1 - 0.3),
        0.2,
        0.35,
      );
      b.beam(
        "rust",
        PH.v3(x, PH_H - 0.4, PZ0 + 0.3),
        PH.v3(x, PH_H + 1.1, (PZ0 + PZ1) / 2),
        0.14,
        0.14,
      );
      b.beam(
        "rust",
        PH.v3(x, PH_H + 1.1, (PZ0 + PZ1) / 2),
        PH.v3(x, PH_H - 0.4, PZ1 - 0.3),
        0.14,
        0.14,
      );
    }
    b.box("corrugated", -545.2, PH_H - 0.05, 1125, 6.4, 0.08, 10.4, {
      rx: 0.05,
      seg: false,
      c: 0x9a8a78,
    });
    b.box("corrugated", -538.3, PH_H - 1.3, 1126.5, 4.2, 0.08, 6.5, {
      rz: 0.5,
      rx: -0.2,
      seg: false,
      c: 0x8a7a68,
    }); // slab hanging into the hall
    for (let k = 0; k < 14; k++)
      b.rock(
        "rubble",
        -541.5 + (r() - 0.5) * 6,
        0.05,
        1125 + (r() - 0.5) * 6,
        0.25 + r() * 0.35,
        { rough: 0.45, flat: 0.6 },
      );
    for (let k = 0; k < 26; k++)
      b.box(
        "brick",
        -541.5 + (r() - 0.5) * 8,
        0,
        1125 + (r() - 0.5) * 8,
        0.3 + r() * 0.6,
        0.12 + r() * 0.25,
        0.2 + r() * 0.3,
        { ry: r() * 3, rx: (r() - 0.5) * 0.5, seg: false, grime: 0.8 },
      ); // broken wall chunks
    b.mound("soil", -540.5, 0, 1125.5, 3.4, 1.0, 2.8, {
      seed: 5,
      c: 0xa09488,
      grime: 0.6,
    }); // collapsed roof debris drift
    PH.col(-540.5, 1125.5, 4.5, 3.6, 0, 0.8, 0, {
      walkable: true,
      surface: "rubble",
    });
    // the old dynamo & a boiler inside (rusted hulks), control panel
    b.cyl("rust", -546, 1.3, 1123.2, 1.1, 1.1, 3.4, 14, {
      rz: Math.PI / 2,
      hSeg: 1,
    });
    b.boxMM("concrete", -548, 0, 1122, -544, 0.4, 1124.4, { seg: false });
    PH.colMM(-548, 0, 1122, -544, 2.4, 1124.4, { walkable: false });
    b.cyl("rust", -546.2, 1.6, 1127.4, 1.4, 1.4, 4.2, 14, {
      rx: Math.PI / 2,
      ry: Math.PI / 2,
      hSeg: 1,
    });
    PH.colMM(-548.4, 0, 1125.8, -544, 3, 1129, { walkable: false });
    b.box("panel", -537.2, 0, 1122.8, 0.5, 2.2, 1.6, {
      seg: false,
      c: 0x5a6a5a,
    });
    for (let k = 0; k < 6; k++)
      b.cyl(
        "chrome",
        -536.94,
        1.2 + (k % 2) * 0.4,
        1122.2 + (k >> 1) * 0.5,
        0.1,
        0.1,
        0.05,
        10,
        { rz: Math.PI / 2, hSeg: 1 },
      );
    PH.propAt("toolbox", -537.8, 0, 1126.8, -Math.PI / 2, { loot: "toolbox" });
    PH.readAt(
      -537.4,
      1.4,
      1122.8,
      "Powerhouse Log (chalk on the panel)",
      '"GENERATOR 2 — DEAD SINCE THE WAR. GENERATOR 1 — DEAD SINCE AUGUSTINE TRIED TO FIX IT. CANDLES ARE IN THE KITCHEN. — Sal"',
    );
    anchors.powerhouse = PH.anchor(-542.5, 0, 1118.5, Math.PI);

    // chimney: tapered brick stack with limestone bands and a broken crown (visible from the Battery)
    const CHX = -532.2,
      CHZ = 1127.5,
      CHH = 31;
    b.boxMM("brick", CHX - 1.9, 0, CHZ - 1.9, CHX + 1.9, 3.5, CHZ + 1.9, {
      grime: 0.7,
    });
    b.boxMM(
      "limestone",
      CHX - 2.05,
      3.5,
      CHZ - 2.05,
      CHX + 2.05,
      3.9,
      CHZ + 2.05,
      { seg: false },
    );
    b.cyl("brick", CHX, 3.9, CHZ, 1.05, 1.6, CHH - 3.9, 16, {
      hSeg: 8,
      grime: 0.75,
    });
    for (const yy of [11, 19, 26]) {
      const t = (yy - 3.9) / (CHH - 3.9);
      b.cyl(
        "limestone",
        CHX,
        yy,
        CHZ,
        1.6 - 0.55 * t + 0.12,
        1.6 - 0.55 * t + 0.12,
        0.35,
        16,
        { hSeg: 1 },
      );
    }
    for (let k = 0; k < 16; k++) {
      if (k % 5 === 2) continue;
      const a = (k / 16) * TAU;
      b.box(
        "brick",
        CHX + Math.cos(a) * 1.0,
        CHH,
        CHZ + Math.sin(a) * 1.0,
        0.45,
        0.4 + (k % 3) * 0.35,
        0.35,
        { ry: -a, seg: false, grime: 0.9 },
      );
    }
    b.cyl("shadow", CHX, CHH - 0.3, CHZ, 0.78, 0.78, 0.35, 12, { hSeg: 1 });
    for (let yy = 4.5; yy < CHH - 1; yy += 0.5) {
      const t = (yy - 3.9) / (CHH - 3.9);
      b.box("iron", CHX + 1.6 - 0.55 * t + 0.1, yy, CHZ, 0.06, 0.05, 0.45, {
        seg: false,
      });
    } // ladder rungs
    PH.colMM(CHX - 1.9, 0, CHZ - 1.9, CHX + 1.9, CHH, CHZ + 1.9, {
      walkable: false,
    });
    PH.onReady.push(() =>
      PH.safe("chimney smoke", () => {
        if (!G.isStub("fx") && G.fx.smoke)
          G.fx.smoke(PH.v3(CHX, CHH + 0.5, CHZ), 1.6);
      }),
    );

    // ---------------- burial row in the SE lawn ----------------
    for (let i = 0; i < 9; i++) {
      const x = -484 + (i % 3) * 2.4,
        z = 1108 + Math.floor(i / 3) * 3.2;
      if (!inLawn(x, z)) continue;
      const ry = (r() - 0.5) * 0.2;
      b.mound("soil", x, 0.15, z + 0.9, 0.55, 0.22, 1.1, { seed: i });
      b.box("rotten", x, 0.15, z, 0.1, 1.05, 0.08, {
        ry,
        rz: (r() - 0.5) * 0.15,
        seg: false,
      });
      b.box("rotten", x, 0.8, z, 0.6, 0.09, 0.08, { ry, seg: false });
      if (r() < 0.5)
        b.box("metal", x, 0.55, z - 0.06, 0.3, 0.16, 0.02, {
          ry,
          seg: false,
          c: 0x9a9a8a,
        }); // a dog tag / tin plate
    }
    PH.readAt(
      -484,
      1.0,
      1107.9,
      "Grave Marker",
      '"No. 4471 — ARRIVED 1967, PROCESSED 1988. She waited in line longer than anyone. The line finally moved."',
    );
    anchors.graves = PH.anchor(-486, 0.15, 1111, -Math.PI / 2);

    // riprap boulders along the waterline where the seawall has slumped (south & west)
    // angular, mixed-size quarried blocks (low-poly, flattened, randomly stretched), half-drowned, with small spalls between
    for (let i = 0; i < 46; i++) {
      const a = (0.1 + r() * 0.95) * Math.PI; // south half of the island
      const rr = L.ELLIS.r + 0.8 + r() * 3.2,
        big = r() < 0.35,
        sz = big ? 1.2 + r() * 0.9 : 0.5 + r() * 0.6;
      b.rock(
        r() < 0.7 ? "granite" : "concrete",
        CX + Math.cos(a) * rr,
        -1.3 + r() * 0.7 - (big ? 0.3 : 0),
        CZ + Math.sin(a) * rr,
        sz,
        {
          detail: 0,
          rough: 0.9,
          flat: 0.55 + r() * 0.3,
          sx: 0.8 + r() * 0.7,
          sz: 0.7 + r() * 0.6,
          ry: r() * 6.28,
          grime: 0.7,
          ground: -1.2,
          seed: 70 + i * 3.7,
        },
      );
      if (r() < 0.6)
        b.rock(
          "granite",
          CX + Math.cos(a + 0.02) * (rr - 0.8),
          -0.9 + r() * 0.4,
          CZ + Math.sin(a + 0.02) * (rr - 0.8),
          0.25 + r() * 0.25,
          { detail: 0, rough: 1.0, flat: 0.6, grime: 0.7, seed: 300 + i },
        );
    }

    const g = b.build(root);
    g.name = "ellis_grounds";
    return anchors;
  }

  PH.addBuilder(
    "ellis_grounds",
    function () {
      const ext = PH.ellisExt;
      const root =
        ext && ext.root
          ? ext.root
          : (() => {
              const g = new THREE.Group();
              g.name = "poi_ellis_grounds";
              G.scene.add(g);
              return g;
            })();
      const anchors = build(root);
      if (ext && ext.anchors) Object.assign(ext.anchors, anchors);
    },
    11,
  );
})();
