/* src/landmark_interiors/60_flatiron.js */
/* =====================================================================
 * NEW RAD CITY — landmark_interiors / 60_flatiron.js
 * FLATIRON BUILDING — the wedge-shaped upper floors of the Flatiron
 * Trading Post (friendly). landmarks_b's ground floor is the covered
 * market street; a stairwell door in its diagonal wall (past Gus's Guns)
 * leads up here.
 *
 * Cell 'flatiron_interior' (origin 7000,0,2000). Same triangular plan as
 * the real footprint (local = world − (150, 0, 121)):
 *   SECOND FLOOR (y 0)  : "The Wedge" hotel (reception, rooms for rent, the
 *                          washroom), "Stitch & Rivet" (armour & clothes),
 *                          "Tubes' Radio & Repair", the common room, the
 *                          prow storeroom
 *   THIRD FLOOR (y 4.3) : the Post's convoy office & message board, the
 *                          storerooms, and at the tip THE PROW OFFICE — the
 *                          famous wedge-point room with windows on both
 *                          sides — Post Master Lorena Hightower
 *   ROOF HATCH          : up to the REAL roof of the Flatiron (world), where
 *                          we add railings and a walkable deck by the water tower
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._li) return;
  const LI = G._li,
    A = LI.arch,
    F = LI.furn,
    Q = LI.q,
    TAU = Math.PI * 2;
  const KEY = "flatiron_interior";
  const OFF = { x: 150, z: 121 };
  // local polygon (world P − OFF): prow tip north, base on the south street
  const PL = [
    [-16.6, -28],
    [-14.8, -27.3],
    [24, 28],
    [-19, 28],
    [-19, -25.7],
    [-18.1, -27.2],
  ];
  const xd = (z) => -14.8 + (z + 27.3) * (38.8 / 55.3); // diagonal (east) wall x at z
  const FA = 0,
    FB = 4.3,
    HA = 3.9,
    HB = 8.2;

  function art() {
    const T = {};
    const street = (id, seed, kind) =>
      LI.texMat(
        id,
        LI.canvasTex(
          id,
          1024,
          512,
          (x, W, H) => {
            const r = LI.rng(seed);
            const g = x.createLinearGradient(0, 0, 0, H);
            g.addColorStop(0, "#6a7a5a");
            g.addColorStop(0.5, "#b0aa84");
            g.addColorStop(1, "#4a463a");
            x.fillStyle = g;
            x.fillRect(0, 0, W, H);
            if (kind === "park") {
              x.fillStyle = "rgba(70,74,54,0.95)";
              x.fillRect(0, H * 0.62, W, H * 0.38);
              x.strokeStyle = "rgba(40,36,28,0.9)";
              for (let i = 0; i < 22; i++) {
                const tx = r() * W,
                  th = 50 + r() * 90;
                x.lineWidth = 5;
                x.beginPath();
                x.moveTo(tx, H * 0.66);
                x.lineTo(tx, H * 0.66 - th);
                x.stroke();
                x.lineWidth = 2;
                for (let k = 0; k < 5; k++) {
                  x.beginPath();
                  x.moveTo(tx, H * 0.66 - th * (0.5 + k * 0.1));
                  x.lineTo(
                    tx + (r() - 0.5) * 70,
                    H * 0.66 - th * (0.8 + k * 0.06),
                  );
                  x.stroke();
                }
              }
              x.fillStyle = "rgba(64,62,54,0.95)";
              x.fillRect(W * 0.62, H * 0.08, 60, H * 0.6);
              x.beginPath();
              x.moveTo(W * 0.62, H * 0.08);
              x.lineTo(W * 0.62 + 30, -10);
              x.lineTo(W * 0.62 + 60, H * 0.08);
              x.fill();
              x.fillStyle = "rgba(220,210,170,0.8)";
              x.beginPath();
              x.arc(W * 0.62 + 30, H * 0.18, 16, 0, TAU);
              x.fill();
            } else {
              x.fillStyle = "rgba(66,64,56,0.95)";
              for (let i = 0; i < 26; i++) {
                const w = 30 + r() * 80,
                  h = 80 + r() * 260;
                const cx = r() * W;
                x.fillRect(cx - w / 2, H - h, w, h);
              }
              x.fillStyle = "rgba(40,40,34,0.6)";
              for (let i = 0; i < 300; i++)
                x.fillRect(r() * W, H * 0.2 + r() * H * 0.7, 6, 9);
            }
            x.fillStyle = "rgba(40,38,32,0.95)";
            x.fillRect(0, H * 0.9, W, H * 0.1);
            LI.wear(x, W, H, seed, 0.4);
          },
          { clamp: true },
        ),
        { emissive: 0.7, rough: 1 },
      );
    T.west = street("fl_west", 1, "city");
    T.south = street("fl_south", 2, "city");
    T.east = street("fl_east", 3, "city");
    T.prow = street("fl_prow", 4, "park");
    T.board = LI.texMat(
      "fl_board",
      LI.canvasTex(
        "fl_board",
        768,
        512,
        (x, W, H) => {
          x.fillStyle = "#5a4630";
          x.fillRect(0, 0, W, H);
          const r = LI.rng(6);
          const notes = [
            "WANTED: WATER RUNNER. ASK LORENA.",
            'LOST: PACK-BOT "DOLLY". REWARD. — CALDWELL',
            "ROOMS 20 SCRIP/NIGHT — THE WEDGE",
            "NO GUNS DRAWN INSIDE THE POST",
            "RADIOS FIXED. TUBES BOUGHT. — TUBES",
            "CONVOY TO GRAND CENTRAL — TUESDAYS",
            "HAVE YOU SEEN NATE? (WATER CART)",
            "23 SKIDOO CLUB MEETS FRIDAYS (ROOF)",
          ];
          for (let i = 0; i < notes.length; i++) {
            const px = 20 + (i % 3) * 245 + r() * 10,
              py = 20 + Math.floor(i / 3) * 160 + r() * 14;
            x.save();
            x.translate(px + 110, py + 65);
            x.rotate((r() - 0.5) * 0.12);
            x.fillStyle = ["#e8e0c8", "#e0d8a8", "#d8e0c8"][i % 3];
            x.fillRect(-110, -65, 220, 130);
            x.fillStyle = "#2a2418";
            x.font = 'bold 20px "Special Elite", "Courier New", monospace';
            x.textAlign = "center";
            const words = notes[i].split(" ");
            let line = "",
              ly = -30;
            for (const w of words) {
              if ((line + w).length > 16) {
                x.fillText(line, 0, ly);
                ly += 26;
                line = "";
              }
              line += w + " ";
            }
            x.fillText(line, 0, ly);
            x.fillStyle = "#a02a20";
            x.beginPath();
            x.arc(0, -58, 6, 0, TAU);
            x.fill();
            x.restore();
          }
          LI.wear(x, W, H, 6, 0.5);
        },
        { clamp: true },
      ),
      { rough: 0.95 },
    );
    T.sign = (id, lines, st, w, h) =>
      LI.texMat("fl_sign_" + id, LI.signTex("fl_" + id, lines, st, w, h), {
        rough: 0.8,
      });
    return T;
  }

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

  LI.addBuilder(KEY, 60, function () {
    LI.fl = build();
  });

  // ======================================================================
  // Gameplay: The Wedge (rent a room), Stitch & Rivet, Tubes, the Post Master's
  // quest "Dry Spell" (find the water runner — he is in The Exchange's Pit)
  // ======================================================================
  const QID = "li_fl_dryspell";
  LI.readyFns.push(function () {
    const C = LI.fl;
    if (!C) return;
    LI.defineItems([
      {
        id: "li_skidoo_badge",
        type: "apparel",
        slot: "eyes",
        name: "23 Skidoo Club Pin",
        weight: 0,
        value: 150,
        attrs: { reflex: 1 },
        skills: { stealth: 5 },
        mesh: "token",
        unique: true,
        tags: ["apparel", "unique"],
        desc: 'An enamel pin shaped like a gust of wind: "23 SKIDOO — FLATIRON CORNER". Worn, it puts a spring in your step and an urge to leave before the police arrive.',
      },
      {
        id: "li_note_skidoo",
        type: "note",
        name: 'Photograph: "Flatiron Corner, 1905"',
        title: "A framed photograph, back inscription",
        text: "The wind comes round the prow of this building like a train. In 1905 men would stand on the corner of 23rd Street to watch it lift the ladies' skirts, and the police would move them along — \"Twenty-three skidoo!\"\n\nIn 1989 the wind still comes round the prow. Now it lifts the roof tarps and the Post Master's temper. The 23 Skidoo Club meets on the roof on Fridays to watch it. Nobody is quite sure why.",
      },
      {
        id: "li_note_wedge_ledger",
        type: "note",
        name: "The Wedge — Guest Ledger",
        title: "THE WEDGE — GUESTS",
        learn: LI.LOCKS.fl_ledger_term.id,
        text: 'ROOM 21 — convoy guard, 3 nights, paid in scrip.\nROOM 22 — [vacant — ask Mavis]\nROOM 23 — "Mr. Smith". It is always Mr. Smith.\nROOM 24 — Tubes\'s cousin, 1 night, still here after 40.\nROOM 25 — do not rent. Do not ask. — D.K.\n\nP.S. Lorena — your ledger word is SKIDOO. You asked me to write it down somewhere safe. This is somewhere. — D.K.',
      },
      {
        id: "li_wedge_key",
        type: "key",
        name: "Room Key — The Wedge, No. 22",
        desc: "A brass key on a wooden wedge-shaped fob. Room 22: a real bed, a door that locks, and a window with most of its glass.",
      },
    ]);
    LI.terminal("li_fl_ledger", {
      title: "FLATIRON TRADING POST — LEDGER",
      header:
        "FULLER BUILDING — OFFICE OF THE POST MASTER\nSCRIP IN / SCRIP OUT",
      lock: {
        id: LI.LOCKS.fl_ledger_term.id,
        passcode: LI.LOCKS.fl_ledger_term.passcode,
      },
      entries: [
        {
          title: "This Week",
          text: "IN: 1,204 scrip (stall rents, room rents, Hattie's cut, Gus's cut, Gus's other cut)\nOUT: 311 scrip (guards), 90 scrip (water), 0 scrip (roof repairs — tarps are free if you steal them)\nWATER: running short. Nate is 3 days late.",
        },
        {
          title: "The Building",
          text: "Built 1902 as the Fuller Building. Twenty-two storeys of limestone and terracotta on a steel frame on a triangle of land nobody else wanted. The locals said the wind would knock it down. It is still here. So are we.",
        },
        {
          title: "Security",
          text: 'No guns drawn inside the Post. The Exchange\'s raiders have been "auditing" carts on Broad Street. If Nate went that way, God help him — nobody else will.',
        },
        Object.assign(
          { title: "The Safe" },
          LI.codeText(
            "fl_post_safe",
            "Post Master's safe: same as the year this building went up, 1-9-0-2. If you are reading this and you are not me, put it back. — L.H.",
          ),
        ),
      ],
    });
    LI.dialogue("dlg_li_dottie", {
      start: () => "first",
      nodes: {
        first: {
          speaker: "Mavis Wojcik",
          text: () =>
            Q.flag("li_fl_room")
              ? "Back, hon? Room 22's yours. I changed the sheet. Well. I turned it over."
              : "Welcome to The Wedge, hon — best hotel in a triangle anywhere. Twenty scrip a night gets you a bed, a door that locks and no questions. Thirty gets you questions.",
          responses: [
            {
              text: "I'll take a room. (20 scrip)",
              cond: () => !Q.flag("li_fl_room") && LI.scrip() >= 20,
              action: () => {
                LI.giveScrip(-20);
                LI.give("li_wedge_key", 1);
                Q.set("li_fl_room");
                LI.unlockRoom();
              },
              next: "room",
            },
            { text: "What have you got to drink?", barter: true },
            { text: "Why is it called The Wedge?", next: "why" },
            { text: "Goodbye." },
          ],
        },
        room: {
          speaker: "Mavis Wojcik",
          text: "Room 22, down the hall on the left. Sleep as long as you like. If you hear knocking from 25, no you didn't.",
          responses: [{ text: "Thanks, Mavis." }],
        },
        why: {
          speaker: "Mavis Wojcik",
          text: "Look at the building, hon. Every room's a slice of pie. My room at the point is so narrow I sleep with my feet out the window.",
          responses: [{ text: "Ha. Goodbye." }],
        },
      },
    });
    LI.dialogue("dlg_li_marisol", {
      start: () => "first",
      nodes: {
        first: {
          speaker: "Marisol Vega",
          text: "Stitch and Rivet. I sew what's torn and rivet what's dented. Leather, metal, old-world suits for the rich folk from Grand Central. What do you need?",
          responses: [
            { text: "Show me your stock.", barter: true },
            { text: "Goodbye." },
          ],
        },
      },
    });
    LI.dialogue("dlg_li_sparks", {
      start: () => "first",
      nodes: {
        first: {
          speaker: 'Horace "Tubes" Adeyemi',
          text: "Mind the tubes! Everything in here hums or bites, sometimes both. I buy vacuum tubes, sell lantern batteries, and fix anything that ever had a plug. What'll it be?",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Where do you get batteries?", next: "cells" },
            { text: "Goodbye." },
          ],
        },
        cells: {
          speaker: 'Horace "Tubes" Adeyemi',
          text: 'Recharge the dead ones off the Post generator. The Iron Covenant up at Rockefeller would call it "unauthorised technology". I call it Tuesday.',
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Goodbye." },
          ],
        },
      },
    });
    LI.dialogue("dlg_li_lorena", {
      start: () => {
        if (Q.done(QID)) return "after";
        if (Q.active(QID) && Q.flag("li_nyse_freed")) return "back";
        if (Q.active(QID)) return "waiting";
        return Q.flag("li_nyse_freed") ? "already" : "first";
      },
      nodes: {
        first: {
          speaker: "Lorena Hightower",
          text: "This is the prow office, and I'm the Post Master. You can see Fifth Avenue out of one window and Broadway out of the other, which is also how I run this place: one eye on each. What brings you up the stairs?",
          responses: [
            { text: "Anything you need done?", next: "job" },
            { text: "Just looking around." },
          ],
        },
        job: {
          speaker: "Lorena Hightower",
          text: "Nate Oduya runs our water cart down from the Battery. He's three days late, and the last anyone saw, he was taking the Broad Street shortcut — past the Stock Exchange. The raiders there call themselves The Exchange. Find him. If he's alive, bring him home. If he isn't... I'd still like to know.",
          responses: [
            { text: "I'll find him.", action: () => Q.start(QID) },
            { text: "Not right now." },
          ],
        },
        waiting: {
          speaker: "Lorena Hightower",
          text: "Any word on Nate? Broad Street. The Stock Exchange. Be careful in there.",
          responses: [{ text: "Still looking." }],
        },
        back: {
          speaker: "Lorena Hightower",
          text: 'He walked in an hour ago, half-starved and talking about a "pit" and forty-to-one odds. [She exhales.] You got him out. The Post owes you — and the Post pays its debts. Water on the house for as long as I\'m Post Master.',
          onEnter() {
            Q.complete(QID);
            LI.giveScrip(150);
            LI.give("purified_water", 5);
          },
          responses: [{ text: "Glad he's home.", next: "books" }],
        },
        books: {
          speaker: "Lorena Hightower",
          text: "And you're in the books now. Ledger terminal's on the desk behind me — the word is SKIDOO. Don't tell Gus.",
          onEnter() {
            LI.learnCode(LI.LOCKS.fl_ledger_term.id, "Lorena Hightower");
          },
          responses: [{ text: "Your secret's safe." }],
        },
        already: {
          speaker: "Lorena Hightower",
          text: "You're the one who pulled Nate out of that raider pit. [She shakes your hand hard.] Anything you need at the Post, you ask me first.",
          onEnter() {
            if (!Q.started(QID)) {
              Q.start(QID);
              Q.complete(QID);
              LI.give("purified_water", 5);
            }
          },
          responses: [{ text: "Thanks.", next: "books" }],
        },
        after: {
          speaker: "Lorena Hightower",
          text: "One eye on Fifth, one eye on Broadway. What can I do for you?",
          responses: [{ text: "Nothing today." }],
        },
      },
    });
    Q.define({
      id: QID,
      name: "Dry Spell",
      giver: "Lorena Hightower",
      location: "Flatiron Trading Post",
      desc: "The Flatiron Trading Post's water runner, Nate Oduya, is three days late. He was last seen taking the Broad Street shortcut past the Stock Exchange.",
      stages: [
        {
          id: "find",
          text: 'Find Nate Oduya. He was last seen near the Stock Exchange ("The Exchange", Wall Street).',
          markers: () =>
            LI.nyse
              ? [
                  {
                    x: LI.nyse.O.x + 20,
                    z: LI.nyse.O.z - 2.2,
                    label: "Nate Oduya?",
                    interior: true,
                  },
                ]
              : [{ x: 0, z: 828, label: "The Exchange" }],
        },
        // Nate freed (NYSE cage) → report back; Lorena's 'back' node completes the quest
        {
          id: "return",
          text: "Nate Oduya is out of the Pit. Tell Lorena Hightower at the Flatiron Trading Post.",
          markers: [{ npc: "li_fl_lorena", label: "Lorena Hightower" }],
        },
      ],
      rewards: { xp: 150 },
    });
    // unlock room 22 (Mavis) — the bed inside is then the player's to sleep in
    LI.unlockRoom = () => {
      const R = C.roomLock;
      if (!R.col) return;
      try {
        G.world.removeCollider(R.col);
      } catch (e) {
        /* */
      }
      R.col = null;
      R.mesh.rotation.y = 1.4;
      R.mesh.position.set(-12.7, 1.15, 2.5);
    };
    LI.saveHooks.fl = {
      save: () => ({ room: !C.roomLock.col }),
      load(d) {
        if (d && d.room) LI.unlockRoom();
      },
      reset() {
        const R = C.roomLock;
        if (!R.col) {
          R.col = C.col(-12.35, 0, 2.45, -12.05, 2.3, 3.55, {
            walkable: false,
          });
          R.mesh.rotation.y = 0;
          R.mesh.position.set(-12.2, 1.15, 3);
        }
      },
    };
    LI.interact(
      C.W(-12.2, 1.2, 3),
      "Room 22",
      () => (C.roomLock.col ? "Open" : "Open"),
      () => {
        if (!C.roomLock.col) return;
        if (LI.has("li_wedge_key")) {
          LI.openLock(LI.LOCKS.fl_room22, LI.unlockRoom);
          return;
        }
        LI.sfx("door_locked");
        LI.notify("Room 22 is locked. Mavis at the reception rents it out.");
      },
      {
        enabled: () => !!C.roomLock.col,
        locked: () => (C.roomLock.col ? "Rent from Mavis" : null),
      },
    );
    if (C.radSource) {
      try {
        G.world.addRadSource({
          x: C.O.x + C.radSource.x,
          y: C.radSource.y,
          z: C.O.z + C.radSource.z,
          radius: C.radSource.radius,
          strength: C.radSource.strength,
        });
      } catch (e) {
        /* */
      }
    }
  });
  const STOCK_DOTTIE = [
    ["beer", 6],
    ["whiskey", 2],
    ["purified_water", 6],
    ["fizzo_cola", 4],
    ["prairie_root_beer", 3],
    ["ox_steak", 2],
    ["cinnamon_bun", 2],
  ];
  const STOCK_MARISOL = [
    ["leather_armor", 1],
    ["leather_armor_reinforced", 1],
    ["metal_armor", 1],
    ["metal_helmet", 1],
    ["biker_leathers", 1],
    ["old_world_businesswear", 1],
    ["old_world_spring_dress", 1],
    ["fedora", 1],
    ["newsboy_cap", 1],
    ["bandana", 2],
  ];
  const STOCK_SPARKS = [
    ["ammo_dry_cell", 16],
    ["ammo_rivet", 30],
    ["riot_gas_grenade", 1],
    ["vacuum_tube", 3],
    ["scrap_electronics", 4],
    ["dry_cell", 2],
    ["relay_board", 1],
    ["radio", 0],
  ].filter((e) => e[1] > 0);
  LI.spawnFns.push(function () {
    const C = LI.fl;
    if (!C) return;
    const A2 = C.anchors;
    const settler = (o, at) =>
      LI.spawnNPC(
        Object.assign(
          {
            type: "human",
            faction: "settlers",
            ai: "merchant",
            homeR: 1.6,
            essential: true,
            voice: "merchant",
          },
          o,
        ),
        at,
      );
    settler(
      {
        id: "li_fl_dottie",
        name: "Mavis Wojcik",
        outfit: "settler",
        gender: "f",
        dialogue: "dlg_li_dottie",
        level: 4,
        weapon: "pistol_10mm",
        merchant: { scrip: 300, stock: STOCK_DOTTIE, restock: 2 },
        hair: "bun",
        skinTone: 0.25,
        barks: ["Twenty scrip, hon. No spitting.", "Room 25 is NOT for rent."],
      },
      A2.dottie,
    );
    settler(
      {
        id: "li_fl_marisol",
        name: "Marisol Vega",
        outfit: "merchant",
        gender: "f",
        dialogue: "dlg_li_marisol",
        level: 5,
        weapon: "switchblade",
        merchant: { scrip: 450, stock: STOCK_MARISOL, restock: 3 },
        skinTone: 0.55,
        barks: [
          "Stand still, I'm measuring you.",
          "That jacket's a crime. I can fix it.",
        ],
      },
      A2.marisol,
    );
    settler(
      {
        id: "li_fl_sparks",
        name: 'Horace "Tubes" Adeyemi',
        outfit: "settler",
        gender: "m",
        dialogue: "dlg_li_sparks",
        level: 5,
        weapon: "pistol_10mm",
        merchant: { scrip: 500, stock: STOCK_SPARKS, restock: 3 },
        skinTone: 0.85,
        barks: [
          "Don't lick the tubes.",
          "Hear that hum? That's the sound of money.",
        ],
      },
      A2.sparks,
    );
    settler(
      {
        id: "li_fl_lorena",
        name: "Lorena Hightower",
        outfit: "merchant",
        gender: "f",
        ai: "guard",
        dialogue: "dlg_li_lorena",
        level: 8,
        weapon: "hunting_rifle",
        skinTone: 0.45,
        hair: "bun",
        barks: [
          "One eye on Fifth, one eye on Broadway.",
          "Ledgers don't balance themselves. I've waited.",
        ],
      },
      A2.lorena,
    );
    settler(
      {
        id: "li_fl_guard",
        name: "Post Guard Kellerman",
        outfit: "combat_armor",
        gender: "m",
        ai: "guard",
        essential: false,
        level: 7,
        weapon: "combat_shotgun",
        homeR: 1.2,
        barks: [
          "No guns drawn inside the Post.",
          "Office upstairs is by appointment.",
        ],
      },
      A2.guard,
    );
    if (Q.flag("li_nyse_freed"))
      settler(
        {
          id: "li_fl_nate",
          name: "Nate Oduya",
          outfit: "settler",
          gender: "m",
          ai: "guard",
          level: 3,
          homeR: 1.5,
          skinTone: 0.75,
          barks: [
            "Forty to one. I still dream about it.",
            "Water's on me. Literally, I carry it.",
          ],
        },
        A2.nate,
      );
  });
})();
