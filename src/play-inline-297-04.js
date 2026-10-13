// play-inline-297 04 — box
// Lines 692-1844 of readable/play-inline-297.pretty.js (statement-aligned).
  function buildInterior(cell) {
    const O = cell.origin,
      oy = O.y;
    const b = PM.batch("alg_int");
    const F = PM.frame(O.x, oy, O.z, b);
    const { X, Z, P, A: AN, W } = F;
    const root = cell.root;
    const r = PM.rng("alg_int");
    const A = {};
    b.ground = oy;
    b.aoH = 2.6;
    b.grime = 0.3;

    // ---------------- lights: warm lamps everywhere, blue in the bar ----------------
    const L = [];
    const lamp = (x, y, z, col, rad, i) =>
      L.push({ x: X(x), y: oy + y, z: Z(z), color: col, r: rad, i });
    for (const [x, z] of [
      [-10, 6],
      [-3, 7],
      [-9, -1],
      [0, 2],
      [5, -1],
    ])
      lamp(x, 3.2, z, 0xffb868, 8, 0.75);
    lamp(0, 2.5, 11.5, 0xffd090, 5, 0.5);
    lamp(14, 3.6, 3, 0x5a80ff, 10, 1.0);
    lamp(18.5, 2.2, 3, 0x6a90ff, 6, 0.9);
    lamp(11, 2.2, -2, 0xffb060, 5, 0.5); // Blue Bar
    lamp(-5, 3.8, -11, 0xffc078, 11, 0.9);
    lamp(-11, 2.4, -16, 0xffb060, 6, 0.5);
    lamp(1, 2.4, -16, 0xffb060, 6, 0.5); // Round Table
    lamp(12, 3.8, -11, 0xffa860, 10, 0.7);
    lamp(18, 3.2, -11, 0xff8a70, 7, 0.8); // Oak Room (stage)
    for (let x = -4; x <= 18; x += 5.5) lamp(x, F2 + 2.8, 0, 0xffc880, 6, 0.55); // corridor
    lamp(-10, F2 + 2.8, 3, 0xffc070, 9, 0.7); // library landing
    for (const x of [-3.9, 0.3, 4.5, 8.7]) {
      lamp(x, F2 + 2.4, -4.6, 0xffc880, 5, 0.5);
      lamp(x, F2 + 2.4, 5.6, 0xffc880, 5, 0.45);
    }
    b.setLights(L, 0x9a8a78, 0.14);

    // ================= SHELL =================
    F.slab("rose_carpet", -14, -18, 20, 13, 0, [], {
      th: 0.3,
      surface: "carpet",
    });
    F.slab("rose_carpet", -14, -18, 20, 13, F2, [[-14, -0.7, -11.1, 8.2]], {
      under: "cream_plaster",
      surface: "carpet",
    });
    F.box("cream_plaster", -14, CEIL2, -8, 20, CEIL2 + 0.3, 10, { grime: 0.3 });
    // outer walls (ground floor: oak panelling to 3.2 m, cream plaster above)
    const panelWall = (ax, a0, a1, f0, f1, gaps, y0, y1) => {
      W(
        "cream_plaster",
        ax,
        a0,
        a1,
        f0,
        f1,
        y0 + 3.2,
        y1,
        gaps
          .filter((g) => g.y0 + g.h > y0 + 3.2)
          .map((g) => ({
            c: g.c,
            w: g.w,
            y0: Math.max(g.y0, y0 + 3.2),
            h: g.y0 + g.h - Math.max(g.y0, y0 + 3.2),
          })),
      );
      W(
        "oak_panel",
        ax,
        a0,
        a1,
        f0,
        f1,
        y0,
        y0 + 3.2,
        gaps.filter((g) => g.y0 < y0 + 3.2),
      );
    };
    panelWall(
      "x",
      -14,
      20,
      12.8,
      13.2,
      [{ c: 0, w: 3.4, y0: 0, h: 3.3 }],
      0,
      F2 - 0.4,
    );
    panelWall("z", -18, 13, -14.4, -14, [], 0, F2 - 0.4);
    panelWall("z", -18, 13, 20, 20.4, [], 0, F2 - 0.4);
    panelWall("x", -14.4, 20.4, -18.4, -18, [], 0, F2 - 0.4);
    // ground-floor partitions: z = -4 (lobby | Round Table & Oak Room), x = 8 (lobby | Blue Bar), x = 4 (Round Table | Oak Room)
    panelWall(
      "x",
      -14,
      20,
      -4.2,
      -3.8,
      [
        { c: -5, w: 2.6, y0: 0, h: 3.0 },
        { c: 14, w: 2.2, y0: 0, h: 2.8 },
      ],
      0,
      F2 - 0.4,
    );
    panelWall(
      "z",
      -4,
      13,
      7.8,
      8.2,
      [{ c: 5, w: 2.4, y0: 0, h: 3.0 }],
      0,
      F2 - 0.4,
    );
    panelWall(
      "z",
      -18,
      -4,
      3.8,
      4.2,
      [{ c: -10, w: 2, y0: 0, h: 2.8 }],
      0,
      F2 - 0.4,
    );
    // coffered lobby ceiling beams
    for (let x = -13; x <= 7; x += 2.5)
      F.box("oak", x - 0.15, F2 - 0.75, -4, x + 0.15, F2 - 0.4, 13, {
        seg: false,
      });
    for (let z = -3; z <= 12; z += 2.5)
      F.box("oak", -14, F2 - 0.7, z - 0.12, 8, F2 - 0.4, z + 0.12, {
        seg: false,
      });

    // ================= LOBBY =================
    // vestibule & exit
    F.box("oak", -1.7, 0, 12.2, 1.7, 3.3, 12.35, { seg: false, c: 0x6a3a22 });
    F.box("brass", -0.06, 0, 12.1, 0.06, 3.3, 12.2, { seg: false });
    A.entrance = AN(0, 0, 10.5, 0);
    A.exit_door = P(0, 1.4, 12.1);
    // the front desk (east side): panelled counter, marble top, brass bell, guest ledger, key pigeonholes behind
    F.solid("walnut_panel", 1.6, 0, 1.2, 7.6, 1.1, 2.0);
    F.box("marble_green", 1.5, 1.1, 1.1, 7.7, 1.16, 2.1, { seg: false });
    b.cyl("brass", X(3.2), oy + 1.16, Z(1.6), 0.07, 0.09, 0.07, 10, {
      hSeg: 1,
    });
    b.box("leather_red", X(4.6), oy + 1.16, Z(1.55), 0.55, 0.06, 0.4, {
      ry: 0.2,
      seg: false,
    });
    F.box("walnut", 2, 0, -3.75, 7.6, 2.8, -3.35, { seg: false });
    for (let i = 0; i < 12; i++)
      for (let j = 0; j < 5; j++) {
        const x = 2.2 + i * 0.44,
          y = 0.9 + j * 0.36;
        F.box("iron", x, y, -3.36, x + 0.38, y + 0.3, -3.34, {
          seg: false,
          c: 0x2a1a10,
        });
        if (r() < 0.25)
          b.box(
            "brass",
            X(x + 0.19),
            oy + y + 0.05,
            Z(-3.33),
            0.04,
            0.12,
            0.02,
            { seg: false },
          );
      }
    F.box("oak", 2, 2.8, -3.8, 7.6, 3.0, -3.25, { seg: false });
    b.quad(
      PM.labelKey(
        "alg_desk",
        ["FRONT DESK", "Rooms · Messages · Cat"],
        "brass",
        512,
        160,
      ),
      X(4.6),
      oy + 3.35,
      Z(-3.72),
      1.6,
      0.5,
      { ry: 0 },
    );
    A.manager = AN(4.6, 0, -1.5, PI);
    A.desk_ledger = AN(4.6, 1.2, 1.5, 0);
    // Matilda's cushion at the end of the desk
    b.cyl("velvet", X(7.0), oy + 1.16, Z(1.6), 0.28, 0.3, 0.1, 12, { hSeg: 1 });
    A.cat_bed = AN(7.0, 1.26, 1.6, 0.4);
    // armchair clusters around low tables with lamps
    const cluster = (x, z, n, seed) => {
      F.solid("walnut", x - 0.45, 0, z - 0.45, x + 0.45, 0.55, z + 0.45);
      PM.tableLamp(b, X(x), oy + 0.55, Z(z), root);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * TAU + seed;
        PM.armchair(
          b,
          X(x + Math.cos(a) * 1.35),
          oy,
          Z(z + Math.sin(a) * 1.35),
          -a - HP,
          k % 2 ? "leather_red" : "leather_brown",
        );
        PM.col(
          X(x + Math.cos(a) * 1.35),
          Z(z + Math.sin(a) * 1.35),
          0.8,
          0.8,
          oy,
          oy + 0.9,
          0,
          { walkable: false },
        );
      }
    };
    cluster(-8.5, 6.5, 3, 0.4);
    cluster(-3.5, 7.5, 3, 1.2);
    cluster(-8.5, 0.5, 4, 0.1);
    cluster(-2.5, 1.2, 2, 2.4);
    // grandfather clock, bookcase, sofa, the cat portrait, potted (dead) palms
    {
      const gx = 7.45,
        gz = 9.2;
      F.solid("walnut", gx - 0.3, 0, gz - 0.35, gx + 0.3, 2.3, gz + 0.35);
      b.lathe(
        "walnut",
        [
          [0.35, 0],
          [0.4, 0.1],
          [0.01, 0.4],
        ],
        4,
        X(gx),
        oy + 2.3,
        Z(gz),
        {},
      );
      b.cyl(
        "paint_cream",
        X(gx - 0.31),
        oy + 1.85,
        Z(gz),
        0.22,
        0.22,
        0.02,
        16,
        { hSeg: 1, rz: HP },
      );
      b.box("brass", X(gx - 0.33), oy + 0.9, Z(gz), 0.02, 0.6, 0.08, {
        seg: false,
      });
    }
    PM.bookcase(b, X(-13.95), Z(8.5), X(-13.95), Z(11.8), oy, oy + 2.8, HP, {
      frame: "walnut",
    });
    {
      const catTex = PM.canvasTex(
        "pm2_catportrait",
        256,
        320,
        (c, w, h) => {
          const g = c.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#3a2a1e");
          g.addColorStop(1, "#1a120c");
          c.fillStyle = g;
          c.fillRect(0, 0, w, h);
          c.fillStyle = "#b8742e";
          c.beginPath();
          c.ellipse(w / 2, h * 0.7, 80, 70, 0, 0, TAU);
          c.fill();
          c.beginPath();
          c.arc(w / 2, h * 0.38, 58, 0, TAU);
          c.fill();
          for (const sx of [-1, 1]) {
            c.beginPath();
            c.moveTo(w / 2 + sx * 50, h * 0.3);
            c.lineTo(w / 2 + sx * 40, h * 0.12);
            c.lineTo(w / 2 + sx * 18, h * 0.24);
            c.fill();
          }
          c.strokeStyle = "#6a3a14";
          c.lineWidth = 5;
          for (let k = 0; k < 5; k++) {
            c.beginPath();
            c.moveTo(w / 2 - 40 + k * 20, h * 0.26);
            c.lineTo(w / 2 - 36 + k * 18, h * 0.34);
            c.stroke();
          }
          c.fillStyle = "#9ad040";
          for (const sx of [-1, 1]) {
            c.beginPath();
            c.ellipse(w / 2 + sx * 22, h * 0.37, 10, 7, 0, 0, TAU);
            c.fill();
          }
          c.fillStyle = "#111";
          for (const sx of [-1, 1])
            c.fillRect(w / 2 + sx * 22 - 1.5, h * 0.35, 3, 12);
          c.fillStyle = "#d88a8a";
          c.beginPath();
          c.moveTo(w / 2 - 6, h * 0.45);
          c.lineTo(w / 2 + 6, h * 0.45);
          c.lineTo(w / 2, h * 0.47);
          c.fill();
          c.strokeStyle = "#f0e0c0";
          c.lineWidth = 1.5;
          for (const sx of [-1, 1])
            for (let k = 0; k < 3; k++) {
              c.beginPath();
              c.moveTo(w / 2 + sx * 10, h * 0.47);
              c.lineTo(w / 2 + sx * 70, h * 0.44 + k * 8);
              c.stroke();
            }
          c.fillStyle = "#c8a050";
          c.font = "italic bold 20px Georgia";
          c.textAlign = "center";
          c.fillText("Matilda IX", w / 2, h - 18);
          PM.m2grime(c, w, h, PM.rng("catp"), 0.6);
        },
        { clamp: true },
      );
      const ck = PM.texMat("pm2_catportrait", catTex, { rough: 0.7, vc: true });
      F.box("gilt", -2.3, 1.4, -3.8, -0.7, 3.2, -3.72, { seg: false });
      b.quad(ck, X(-1.5), oy + 2.3, Z(-3.7), 1.3, 1.62, { ry: 0 });
    }
    for (const [x, z] of [
      [-12.8, 11.9],
      [7.2, 11.9],
      [-12.8, -3.2],
    ]) {
      b.cyl("brass", X(x), oy, Z(z), 0.3, 0.25, 0.6, 10, { hSeg: 1 });
      PM.deadTree(b, X(x), oy + 0.55, Z(z), 1.6, x * 3 + z);
    }
    D.papers(b, X(-5), oy + 0.01, Z(4), 2.5, 10, 101);
    b.quad(
      PM.labelKey(
        "alg_notice",
        [
          "NOTICE TO GUESTS",
          "Rooms 10 scrip / night",
          "Doc Benchley — Room 201",
          "Scriptorium — Room 202",
          "Please do not feed the cat",
          "She is lying to you",
        ],
        "label",
        512,
        400,
      ),
      X(7.75),
      oy + 1.9,
      Z(10.5),
      1.1,
      0.86,
      { ry: -HP },
    );
    A.lobby = AN(-5, 0, 4, 0);
    A.merchant = AN(-9.4, 0, -3.0, PI);
    // Rex's book & sundries stall in the lobby corner
    F.solid("walnut", -10.8, 0, -2.4, -8.0, 1.0, -1.8);
    D.shelf(b, X(-9.4), oy, Z(-3.55), 0, 3.0, 4, 111);
    for (let i = 0; i < 8; i++)
      b.box(
        r() < 0.5 ? "leather_red" : "leather_brown",
        X(-10.6 + i * 0.32),
        oy + 1.0,
        Z(-2.1),
        0.25,
        0.06 + r() * 0.05,
        0.34,
        { ry: r() * 0.3, seg: false },
      );
    b.quad(
      PM.labelKey(
        "alg_rex",
        ["HARROW'S BOOKS & SUNDRIES", "Buying: books, bullets, gossip"],
        "brass",
        512,
        160,
      ),
      X(-9.4),
      oy + 3.2,
      Z(-3.76),
      1.8,
      0.56,
      { ry: 0 },
    );
    // stair up (west side of the lobby) with oak balustrade
    PM.stairs(b, "oak", X(-12.6), Z(8.0), PI, 2.2, 8.4, oy, oy + F2, {
      base: oy - 0.1,
    });
    F.rail(
      [
        [-11.35, 8.0, 0],
        [-11.35, -0.4, F2],
      ],
      0,
      1.0,
      "walnut",
    );
    F.rail(
      [
        [-11.1, -0.7],
        [-11.1, 8.2],
      ],
      F2,
      1.0,
      "walnut",
    );
    F.rail(
      [
        [-14, 8.2],
        [-11.1, 8.2],
      ],
      F2,
      1.0,
      "walnut",
    );

    // ================= BLUE BAR (x 8..20, z -4..10) =================
    F.box("carpet", 8.2, 0.01, -3.8, 19.8, 0.03, 12.8, {
      seg: false,
      c: 0x3a4a6a,
    });
    F.solid("walnut_panel", 16.8, 0, -2, 17.6, 1.1, 8.5);
    F.box("marble_white", 16.7, 1.1, -2.1, 17.7, 1.16, 8.6, {
      seg: false,
      c: 0xb8c0d0,
    });
    D.shelf(b, X(19.75), oy, Z(3), -HP, 8, 4, 121);
    F.box("blue_neon", 19.8, 2.5, -2, 19.9, 2.56, 8, {
      seg: false,
      noAO: true,
    });
    F.box("blue_neon", 8.3, F2 - 0.55, -3.7, 19.7, F2 - 0.5, -3.64, {
      seg: false,
      noAO: true,
    });
    F.box("blue_neon", 8.3, F2 - 0.55, 12.64, 19.7, F2 - 0.5, 12.7, {
      seg: false,
      noAO: true,
    });
    for (const z of [-1, 3, 7])
      PM.glow(P(19.3, 2.6, z), 0x4070ff, 2.2, root, {
        intensity: 1.2,
        flicker: 0.03,
      });
    for (let i = 0; i < 7; i++) {
      const z = -1.3 + i * 1.4;
      b.cyl("chrome", X(16.2), oy, Z(z), 0.05, 0.2, 0.75, 8, { hSeg: 1 });
      b.cyl("leather_red", X(16.2), oy + 0.75, Z(z), 0.22, 0.22, 0.08, 10, {
        hSeg: 1,
      });
    }
    for (let i = 0; i < 10; i++)
      b.cyl(
        r() < 0.4 ? "glass_dark" : "chrome",
        X(17.2 + (r() - 0.5) * 0.4),
        oy + 1.16,
        Z(-1.5 + r() * 9.5),
        0.035,
        0.03,
        0.12 + r() * 0.12,
        6,
        { hSeg: 1 },
      );
    // caricature sketches along the walls
    const cr = PM.texMat("pm2_caric", PM.caricatureTex(), {
      rough: 0.7,
      vc: true,
    });
    for (let i = 0; i < 6; i++) {
      const z = -2.5 + i * 2.4;
      F.box("black_steel", 8.2, 1.35, z - 0.55, 8.25, 2.45, z + 0.55, {
        seg: false,
      });
      b.quad(cr, X(8.27), oy + 1.9, Z(z), 1.0, 1.0, {
        ry: HP,
        uvRect: [
          (i % 2) * 0.5,
          Math.floor((i % 4) / 2) * 0.5,
          (i % 2) * 0.5 + 0.5,
          Math.floor((i % 4) / 2) * 0.5 + 0.5,
        ],
      });
    }
    for (const [x, z] of [
      [11, -1.5],
      [11, 5.5],
      [13.5, 9.5],
    ]) {
      b.cyl("walnut", X(x), oy, Z(z), 0.06, 0.2, 0.72, 8, { hSeg: 1 });
      b.cyl("walnut", X(x), oy + 0.72, Z(z), 0.5, 0.5, 0.05, 14, { hSeg: 1 });
      PM.col(X(x), Z(z), 1.0, 1.0, oy, oy + 0.77, 0, { walkable: false });
      for (const a of [0.3, 2.4, 4.2])
        PM.armchair(
          b,
          X(x + Math.cos(a) * 1.05),
          oy,
          Z(z + Math.sin(a) * 1.05),
          -a - HP,
          "leather_brown",
        );
      b.cyl("glass_dark", X(x + 0.1), oy + 0.77, Z(z), 0.04, 0.035, 0.14, 6, {
        hSeg: 1,
      });
    }
    b.quad(
      PM.labelKey("alg_bluebar", ["THE BLUE BAR"], "brass", 512, 128),
      X(12),
      oy + 3.9,
      Z(12.75),
      2.2,
      0.55,
      { ry: PI },
    );
    A.bartender = AN(18.6, 0, 3, HP);
    A.bar_patron = AN(15.4, 0, 5.8, HP);

    // ================= ROUND TABLE ROOM (x -14..4, z -18..-4) =================
    W("rose_plaster", "x", -13.95, 3.75, -17.95, -17.9, 3.2, F2 - 0.4, []);
    {
      const tx = -5,
        tz = -11;
      b.cyl("walnut", X(tx), oy, Z(tz), 0.35, 0.6, 0.72, 12, { hSeg: 1 });
      b.cyl("walnut", X(tx), oy + 0.72, Z(tz), 2.2, 2.2, 0.08, 32, { hSeg: 1 });
      b.cyl("linen", X(tx), oy + 0.8, Z(tz), 2.25, 2.25, 0.02, 32, { hSeg: 1 });
      PM.col(X(tx), Z(tz), 3.4, 3.4, oy, oy + 0.82, 0, { walkable: false });
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * TAU;
        D.chair(
          b,
          X(tx + Math.cos(a) * 2.75),
          oy,
          Z(tz + Math.sin(a) * 2.75),
          -a + HP,
          false,
          "walnut",
        );
        b.cyl(
          "paint_cream",
          X(tx + Math.cos(a) * 1.7),
          oy + 0.82,
          Z(tz + Math.sin(a) * 1.7),
          0.14,
          0.14,
          0.015,
          12,
          { hSeg: 1 },
        );
        if (k % 2)
          b.cyl(
            "glass_dark",
            X(tx + Math.cos(a) * 1.4),
            oy + 0.82,
            Z(tz + Math.sin(a) * 1.4),
            0.035,
            0.04,
            0.14,
            6,
            { hSeg: 1 },
          );
      }
      PM.candles(b, X(tx), oy + 0.82, Z(tz), 4, 131, root);
      D.papers(b, X(tx + 0.5), oy + 0.83, Z(tz + 0.3), 1.2, 9, 132);
      b.box(
        "black_steel",
        X(tx - 0.8),
        oy + 0.82,
        Z(tz - 0.5),
        0.45,
        0.16,
        0.35,
        { ry: 0.4, seg: false },
      ); // typewriter
      // chandelier
      b.beam("brass", P(tx, F2 - 0.4, tz), P(tx, 3.4, tz), 0.02, 0.02, {});
      b.add("brass", new THREE.TorusGeometry(0.8, 0.04, 5, 16), {
        m: PM.m4(X(tx), oy + 3.3, Z(tz), 0, HP),
      });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.sphere(
          "lamp_warm",
          X(tx + Math.cos(a) * 0.8),
          oy + 3.42,
          Z(tz + Math.sin(a) * 0.8),
          0.07,
          { ws: 6, hs: 4, noAO: true },
        );
      }
      PM.glow(P(tx, 3.4, tz), 0xffc070, 2.8, root, {
        intensity: 1.2,
        flicker: 0.05,
      });
      A.table = AN(tx, 0, tz, 0);
      // seats for the writers (actor anchors face the table)
      const seat = (k) => {
        const a = (k / 10) * TAU;
        return AN(
          tx + Math.cos(a) * 2.75,
          0,
          tz + Math.sin(a) * 2.75,
          Math.atan2(Math.cos(a), Math.sin(a)),
        );
      };
      A.seat_crane = seat(2);
      A.seat_park = seat(5);
      A.seat_hazel = seat(8);
    }
    // the group portrait over the sideboard
    {
      const gk = PM.texMat("pm2_vicious", PM.groupPortraitTex(), {
        rough: 0.7,
        vc: true,
      });
      F.box("gilt", -9.2, 1.6, -17.95, -0.8, 5.0, -17.85, { seg: false });
      b.quad(gk, X(-5), oy + 3.3, Z(-17.83), 8.0, 3.2, { ry: 0 });
      F.solid("walnut", -8.5, 0, -17.9, -1.5, 0.95, -17.2);
      for (let i = 0; i < 5; i++)
        b.cyl(
          i % 2 ? "chrome" : "glass_dark",
          X(-7.5 + i * 1.3),
          oy + 0.95,
          Z(-17.5),
          0.08,
          0.1,
          0.3,
          8,
          { hSeg: 1 },
        );
    }
    for (let i = 0; i < 3; i++)
      PM.bookcase(
        b,
        X(-13.95),
        Z(-17 + i * 3.4),
        X(-13.95),
        Z(-14 + i * 3.4),
        oy,
        oy + 3.0,
        HP,
        { frame: "walnut" },
      );
    b.quad(
      PM.labelKey(
        "alg_rt",
        [
          "THE ROUND TABLE",
          "Est. 1919 · Re-est. 1971",
          "Wits only. Half-wits by appointment.",
        ],
        "brass",
        512,
        200,
      ),
      X(3.7),
      oy + 2.2,
      Z(-8),
      1.2,
      0.47,
      { ry: -HP },
    );

    // ================= OAK ROOM (x 4..20, z -18..-4): supper club =================
    {
      F.box("oak", 15.8, 0, -17.6, 19.9, 0.5, -4.4);
      F.col(15.8, 0, -17.6, 19.9, 0.5, -4.4, { surface: "wood" });
      F.box("oak", 15.4, 0, -12, 15.8, 0.25, -9, { seg: false });
      F.col(15.4, 0, -12, 15.8, 0.25, -9, { surface: "wood" });
      // red velvet curtains (pleated)
      for (let i = 0; i < 18; i++)
        F.box(
          "velvet",
          19.6,
          0.5,
          -17.5 + i * 0.73,
          19.85,
          F2 - 0.5,
          -17.5 + i * 0.73 + 0.62,
          { seg: false, c: i % 2 ? 0xffffff : 0xc0a0a0 },
        );
      for (const sg of [-1, 1])
        F.box(
          "velvet",
          16.2,
          0.5,
          sg < 0 ? -17.6 : -5.2,
          16.5,
          F2 - 0.5,
          sg < 0 ? -16.4 : -4.4,
          { seg: false },
        );
      F.box("gilt", 16, F2 - 0.9, -17.8, 16.4, F2 - 0.4, -4.2, { seg: false });
      // the piano
      F.solid("iron", 17, 0.5, -15.5, 18.6, 1.5, -13.4);
      b.box("paint_cream", X(16.95), oy + 1.35, Z(-14.45), 0.25, 0.06, 1.8, {
        seg: false,
      });
      b.box("iron", X(17.8), oy + 1.5, Z(-14.4), 1.5, 0.05, 1.9, {
        rz: 0.5,
        seg: false,
      });
      A.pianist = AN(16.4, 0.5, -14.4, -HP);
      // a mic stand and a spotlight
      b.cyl("chrome", X(17.2), oy + 0.5, Z(-10.2), 0.02, 0.02, 1.6, 5, {
        hSeg: 1,
      });
      b.sphere("iron", X(17.2), oy + 2.12, Z(-10.2), 0.06, {});
      A.singer = AN(17.6, 0.5, -10.2, HP);
      // cabaret tables with little lamps
      for (const [x, z] of [
        [7, -7],
        [10.5, -7],
        [7, -11],
        [10.5, -11.5],
        [7.5, -15.5],
        [11.5, -15.5],
        [13.5, -7],
      ]) {
        b.cyl("walnut", X(x), oy, Z(z), 0.05, 0.18, 0.72, 8, { hSeg: 1 });
        b.cyl("linen", X(x), oy + 0.72, Z(z), 0.45, 0.45, 0.04, 12, {
          hSeg: 1,
        });
        PM.col(X(x), Z(z), 0.9, 0.9, oy, oy + 0.76, 0, { walkable: false });
        b.cyl("lamp_shade", X(x), oy + 0.76, Z(z), 0.06, 0.1, 0.18, 8, {
          hSeg: 1,
          noAO: true,
        });
        for (const a of [0.5, 3.6])
          D.chair(
            b,
            X(x + Math.cos(a) * 0.8),
            oy,
            Z(z + Math.sin(a) * 0.8),
            -a - HP,
            false,
            "walnut",
          );
      }
      PM.glow(P(10, 1.0, -11), 0xffb060, 3.0, root, {
        intensity: 0.8,
        flicker: 0.1,
      });
      PM.glow(P(17.8, 3.5, -10.5), 0xff9a80, 2.0, root, {
        intensity: 1.0,
        flicker: 0.05,
      });
      b.quad(
        PM.labelKey(
          "alg_oak",
          [
            "THE OAK ROOM",
            "Tonight: Irving at the piano",
            "Songs your grandparents",
            "would have been ashamed of",
          ],
          "brass",
          512,
          256,
        ),
        X(4.25),
        oy + 2.3,
        Z(-8),
        1.2,
        0.6,
        { ry: HP },
      );
      A.oakroom = AN(10, 0, -9, 0);
    }

    // ================= SECOND FLOOR: guest rooms =================
    // enclosure walls
    W("cream_plaster", "x", -14, 20, 9.8, 10.2, F2, CEIL2, []);
    W("cream_plaster", "x", -14, 20, -8.2, -7.8, F2, CEIL2, []);
    W("cream_plaster", "z", -8, 10, -14.4, -14, F2, CEIL2, []);
    W("cream_plaster", "z", -8, 10, 20, 20.4, F2, CEIL2, []);
    // writers' library landing (x -14..-6): the stair arrives here
    W("oak_panel", "z", -8, 10, -6.2, -5.8, F2, CEIL2, [
      { c: 0, w: 2.4, y0: F2, h: 2.6 },
    ]);
    for (let i = 0; i < 3; i++)
      PM.bookcase(
        b,
        X(-13.5 + i * 2.5),
        Z(-7.75),
        X(-11.2 + i * 2.5),
        Z(-7.75),
        oy + F2,
        oy + F2 + 2.9,
        0,
        { frame: "walnut" },
      );
    PM.bookcase(
      b,
      X(-6.25),
      Z(2),
      X(-6.25),
      Z(9.5),
      oy + F2,
      oy + F2 + 2.9,
      -HP,
      { frame: "walnut" },
    );
    PM.armchair(b, X(-9), oy + F2, Z(-5.2), 0.3, "leather_red");
    PM.armchair(b, X(-7.2), oy + F2, Z(-3.6), -0.9, "leather_brown");
    PM.tableLamp(b, X(-8.2), oy + F2 + 0.55, Z(-4.8), root);
    F.solid("walnut", -8.6, F2, -5.2, -7.8, F2 + 0.55, -4.4);
    A.library = AN(-9, F2, -2, 0);
    // corridor (x -6..20, z -1.2..1.2) with room doors both sides
    const ROOMS = [];
    const xs = [-6, -1.8, 2.4, 6.6, 10.8, 15, 20];
    for (let i = 0; i < 6; i++)
      ROOMS.push(
        { n: 201 + i * 2, x0: xs[i], x1: xs[i + 1], side: "n" },
        { n: 202 + i * 2, x0: xs[i], x1: xs[i + 1], side: "s" },
      );
    const OPEN = {
      201: "clinic",
      202: "scriptorium",
      203: "rental",
      204: "store",
      205: "couple",
      207: "cat",
      209: "writer",
      206: "boarded",
    };
    const gapsN = [],
      gapsS = [];
    for (const rm of ROOMS) {
      const c = (rm.x0 + rm.x1) / 2;
      if (OPEN[rm.n] && rm.n !== 207)
        (rm.side === "n" ? gapsN : gapsS).push({ c, w: 1.2, y0: F2, h: 2.3 });
      if (rm.n === 207) gapsN.push({ c, w: 1.2, y0: F2, h: 2.3 });
    }
    W("wallpaper_g", "x", -6, 20, -1.4, -1.2, F2, CEIL2, gapsN);
    W("wallpaper_g", "x", -6, 20, 1.2, 1.4, F2, CEIL2, gapsS);
    for (const x of xs.slice(1, -1)) {
      W("cream_plaster", "z", -7.8, -1.4, x - 0.1, x + 0.1, F2, CEIL2, []);
      W("cream_plaster", "z", 1.4, 9.8, x - 0.1, x + 0.1, F2, CEIL2, []);
    }
    F.box("carpet", -6, F2 + 0.01, -1.2, 20, F2 + 0.03, 1.2, {
      seg: false,
      c: 0x7a3a3a,
    });
    // closed doors (leaf panels) with brass numbers for the rooms nobody opens
    const numK = (n) => PM.labelKey("alg_n" + n, [String(n)], "brass", 128, 64);
    for (const rm of ROOMS) {
      const c = (rm.x0 + rm.x1) / 2,
        fz = rm.side === "n" ? -1.2 : 1.2,
        face = rm.side === "n" ? 0 : PI;
      b.quad(
        numK(rm.n),
        X(c + 0.9),
        oy + F2 + 1.9,
        Z(fz + (rm.side === "n" ? 0.02 : -0.02)),
        0.3,
        0.15,
        { ry: face },
      );
      if (!OPEN[rm.n]) {
        F.box("oak", c - 0.6, F2, fz - 0.06, c + 0.6, F2 + 2.3, fz + 0.06, {
          seg: false,
          c: 0x7a4a2a,
        });
        if (r() < 0.5)
          b.quad(
            PM.labelKey("alg_dnd", ["DO NOT", "DISTURB"], "label", 256, 128),
            X(c + 0.3),
            oy + F2 + 1.3,
            Z(fz + (rm.side === "n" ? 0.08 : -0.08)),
            0.2,
            0.1,
            { ry: face },
          );
      }
      if (rm.n === 206) {
        F.box(
          "planks",
          c - 0.7,
          F2 + 0.2,
          fz - 0.1,
          c + 0.7,
          F2 + 2.2,
          fz - 0.05,
          { seg: false, grime: 0.8 },
        );
      }
    }
    for (let x = -4; x <= 18; x += 5.5) {
      b.sphere("lamp_warm", X(x), oy + CEIL2 - 0.25, Z(0), 0.14, {
        noAO: true,
      });
      PM.glow(P(x, CEIL2 - 0.35, 0), 0xffc070, 1.3, root, {
        intensity: 1.0,
        flicker: 0.05,
      });
    }
    // corridor end window: the ruined skyline at dusk
    {
      const sk = PM.texMat("pm2_skyline_win", PM.skylineTex(), {
        rough: 1,
        emissive: 0.7,
        noShadow: true,
      });
      b.quad(sk, X(19.95), oy + F2 + 1.7, Z(0), 1.9, 2.2, {
        ry: -HP,
        uvRect: [0.3, 0.2, 0.45, 0.75],
      });
      F.box("white_paint", 19.9, F2 + 0.5, -1.1, 19.95, F2 + 2.9, 1.1, {
        seg: false,
        c: 0xd8d0c0,
      });
    }
    // --- room furnishing helpers ---
    const bed = (x, z, ry, messy) => {
      F.box("walnut", x - 0.8, F2, z - 1.05, x + 0.8, F2 + 0.45, z + 1.05, {
        seg: false,
      });
      b.box("linen", X(x), oy + F2 + 0.45, Z(z), 1.5, 0.2, 1.95, {
        seg: false,
        grime: messy ? 0.9 : 0.4,
      });
      b.box("linen", X(x), oy + F2 + 0.65, Z(z - 0.75), 1.2, 0.12, 0.35, {
        seg: false,
      });
      F.box("walnut", x - 0.85, F2, z - 1.15, x + 0.85, F2 + 1.1, z - 1.05, {
        seg: false,
      });
      PM.col(X(x), Z(z), 1.6, 2.1, oy + F2, oy + F2 + 0.65, 0, {
        walkable: true,
        surface: "wood",
      });
      void ry;
    };
    const dresser = (x, z) => {
      F.solid("walnut", x - 0.6, F2, z - 0.25, x + 0.6, F2 + 0.95, z + 0.25);
    };
    const room = (n) => ROOMS.find((q) => q.n === n);
    const cxr = (rm) => (rm.x0 + rm.x1) / 2;
    // 201: Doc Benchley's clinic
    {
      const rm = room(201),
        c = cxr(rm);
      bed(c - 1, -5.8, 0);
      F.box("linen", c + 0.4, F2 + 0.02, -7.7, c + 1.9, F2 + 2.0, -7.6, {
        seg: false,
        c: 0xd8d8c8,
      });
      F.solid("white_paint", c + 0.8, F2, -3.4, c + 1.9, F2 + 1.8, -2.7);
      for (let i = 0; i < 6; i++)
        b.cyl(
          r() < 0.5 ? "paint_red" : "glass_dark",
          X(c + 0.9 + i * 0.16),
          oy + F2 + 1.8,
          Z(-3.05),
          0.04,
          0.04,
          0.12,
          6,
          { hSeg: 1 },
        );
      b.quad(
        PM.labelKey(
          "alg_clinic",
          [
            "DR. R. BENCHLEY",
            "Physician · Surgeon · Listener",
            "Rally Tonic 60 · Rad cures 80",
          ],
          "label",
          512,
          256,
        ),
        X(c - 0.9),
        oy + F2 + 1.7,
        Z(-1.43),
        0.9,
        0.45,
        { ry: PI },
      );
      A.doctor = AN(c + 0.3, F2, -4.6, PI);
      A.clinic_bed = AN(c - 1, F2 + 0.65, -5.8, 0);
    }
    // 202: Archivist Park's scriptorium
    {
      const rm = room(202),
        c = cxr(rm);
      F.solid("walnut", c - 1.6, F2, 7.2, c + 1.6, F2 + 0.78, 8.2);
      for (let i = 0; i < 14; i++)
        b.box(
          r() < 0.5 ? "leather_red" : "leather_brown",
          X(c - 1.4 + r() * 2.8),
          oy + F2 + 0.78 + Math.floor(i / 5) * 0.08,
          Z(7.4 + r() * 0.6),
          0.25,
          0.07,
          0.34,
          { ry: r() * 0.6, seg: false },
        );
      PM.candles(b, X(c + 1.2), oy + F2 + 0.78, Z(7.6), 3, 141, root);
      PM.bookcase(
        b,
        X(rm.x0 + 0.15),
        Z(2),
        X(rm.x0 + 0.15),
        Z(9.6),
        oy + F2,
        oy + F2 + 2.8,
        HP,
        { frame: "walnut", books: "books_dark" },
      );
      const banner = PM.texMat(
        "pm2_covenant_banner",
        PM.signTex(
          "covenant_banner",
          ["⚔", "WE KEEP", "WHAT WAS"],
          "banner",
          256,
          512,
          { bg: "#2a2a3a", fg: "#c8b070", size: 48 },
        ),
        { rough: 0.95 },
      );
      b.quad(banner, X(rm.x1 - 0.12), oy + F2 + 1.9, Z(5.5), 1.0, 2.0, {
        ry: -HP,
        rz: 0.03,
      });
      A.archivist = AN(c, F2, 6.4, PI);
      A.scriptorium = AN(c, F2, 4, PI);
    }
    // 203: the rental room
    {
      const rm = room(203),
        c = cxr(rm);
      bed(c, -5.9, 0);
      dresser(c + 1.3, -2.2);
      PM.tableLamp(b, X(c + 1.3), oy + F2 + 0.95, Z(-2.2), root);
      b.quad(
        PM.labelKey(
          "alg_rent",
          ["ROOM 203", "Yours for 10 scrip a night", "Ask at the front desk"],
          "label",
          512,
          200,
        ),
        X(c - 0.9),
        oy + F2 + 1.7,
        Z(-1.43),
        0.7,
        0.28,
        { ry: PI },
      );
      A.rental = AN(c - 0.8, F2, -3.5, PI);
      A.rental_bed = AN(c, F2, -5.9, 0);
    }
    // 204: Rex's storeroom (locked, owned)
    {
      const rm = room(204),
        c = cxr(rm);
      for (let i = 0; i < 4; i++)
        D.crates(
          b,
          X(rm.x0 + 0.8 + i * 0.9),
          oy + F2,
          Z(9.1),
          1 + (i % 3),
          150 + i,
        );
      D.shelf(b, X(c), oy + F2, Z(9.6), PI, 3.4, 4, 151);
      A.store = AN(c, F2, 6, 0);
    }
    // 205: the couple who never checked out
    {
      const rm = room(205),
        c = cxr(rm);
      bed(c, -5.9, 0);
      PM.skeleton(b, X(c - 0.35), oy + F2 + 0.67, Z(-5.4), PI * 0.98);
      PM.skeleton(b, X(c + 0.35), oy + F2 + 0.67, Z(-5.5), PI * 1.02);
      dresser(c - 1.3, -2.2);
      b.cyl(
        "glass_dark",
        X(c - 1.2),
        oy + F2 + 0.95,
        Z(-2.2),
        0.05,
        0.06,
        0.3,
        6,
        { hSeg: 1 },
      );
      D.papers(b, X(c), oy + F2 + 0.02, Z(-3.5), 0.8, 5, 152);
      A.couple = AN(c, F2, -3.6, PI);
    }
    // 207: Matilda's hideout (locked; the door is a real swing door)
    {
      const rm = room(207),
        c = cxr(rm);
      bed(c + 0.4, -6.0, 0);
      dresser(c - 1.3, -6.9);
      F.box(
        "panel",
        rm.x0 + 0.2,
        F2 + 2.3,
        -7.75,
        rm.x0 + 0.8,
        F2 + 2.7,
        -7.7,
        { seg: false },
      ); // the vent she came in through
      PM.bonePile(b, X(c - 1.0), oy + F2, Z(-3.0), 0.4, 8, 153); // (bird bones — she has been eating well)
      A.cat_hide = AN(c + 0.4, F2 + 0.66, -6.2, 0.3);
      A.room207_door = AN(c - 0.6, F2, -1.3, 0);
    }
    // 209: a writer's room — typewriter, manuscript drifts
    {
      const rm = room(209),
        c = cxr(rm);
      bed(c + 0.9, -6.0, 0);
      F.solid("walnut", c - 1.6, F2, -7.6, c - 0.2, F2 + 0.76, -6.9);
      b.box(
        "black_steel",
        X(c - 0.9),
        oy + F2 + 0.76,
        Z(-7.2),
        0.45,
        0.16,
        0.35,
        { seg: false },
      );
      D.papers(b, X(c - 0.5), oy + F2 + 0.02, Z(-4.5), 1.6, 26, 154);
      D.chair(b, X(c - 0.9), oy + F2, Z(-6.3), PI, false, "walnut");
      A.writer = AN(c - 0.9, F2, -5.8, PI);
    }
    // 206: boarded (visual only above)
    A.corridor = AN(6, F2, 0, -HP);

    b.build(root);
    return A;
  }

  // ===================================================================
  // BUILDER
  // ===================================================================
