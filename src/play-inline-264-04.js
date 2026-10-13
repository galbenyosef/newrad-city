// play-inline-264 04 — box
// Lines 797-1833 of readable/play-inline-264.pretty.js (statement-aligned).
  function buildInterior() {
    const O = P.I("frick");
    const S = P.site("frick_int", {
      ox: O.x,
      oy: O.y + LIFT,
      oz: O.z,
      lit: true,
      ambient: 0x6a6252,
      ambI: 0.34,
      interiorKey: "frick",
    });
    const b = S.b;
    const H = 6.5,
      UY = 6.8,
      BY = -5.0;
    const wall2X = (z, x0, x1, hN, hS, kN, kS, holes, o) =>
      A.wall2X(
        S,
        z,
        x0,
        x1,
        0,
        hN,
        hS,
        kN,
        kS,
        holes,
        Object.assign({ frame: "marble", frameO: { cornice: true } }, o || {}),
      );
    const wall2Z = (x, z0, z1, hW, hE, kW, kE, holes, o) =>
      A.wall2Z(
        S,
        x,
        z0,
        z1,
        0,
        hW,
        hE,
        kW,
        kE,
        holes,
        Object.assign({ frame: "marble", frameO: { cornice: true } }, o || {}),
      );
    const DOOR = (a, w) => [a - (w || 3.2) / 2, a + (w || 3.2) / 2, 0, 3.8];
    const trims = (x0, z0, x1, z1, y, h, key) => {
      // skirting + cornice on the room's inner faces
      const e = 0.21;
      for (const [yy, hh, d, k] of [
        [y, 0.2, 0.05, "wood_dark"],
        [y + h - 0.35, 0.35, 0.12, key],
      ]) {
        b.box(k, x0 + e, yy, z0 + e, x1 - e, yy + hh, z0 + e + d, {
          seg: false,
          noAO: true,
        });
        b.box(k, x0 + e, yy, z1 - e - d, x1 - e, yy + hh, z1 - e, {
          seg: false,
          noAO: true,
        });
        b.box(k, x0 + e, yy, z0 + e, x0 + e + d, yy + hh, z1 - e, {
          seg: false,
          noAO: true,
        });
        b.box(k, x1 - e - d, yy, z0 + e, x1 - e, yy + hh, z1 - e, {
          seg: false,
          noAO: true,
        });
      }
    };

    // ------------------------------------------------------------------
    // FLOORS & CEILINGS (ground)
    // ------------------------------------------------------------------
    S.floor("checker", -6, 12, 6, 24, 0, { surface: "concrete" }); // Entrance Hall
    S.floor("travertine", -10, -18, 14, 12, 0); // Garden Court
    S.floor("marble", -18, 4, -10, 12, 0); // West Vestibule
    S.floor("parquet", -30, -28, -18, 22, 0, { surface: "wood" }); // West Gallery
    S.floor("parquet", -30, -38, -18, -28, 0, { surface: "wood" }); // Oval Room
    S.floor("marble", -18, -38, -10, -18, 0); // North Hall
    S.floor("parquet", -10, -28, 2, -18, 0, { surface: "wood" }); // Fragonard Room
    S.floor("parquet", 2, -28, 14, -18, 0, { surface: "wood" }); // Dining Room
    S.floor("parquet", 14, -28, 26, -8, 0, { surface: "wood" }); // East Gallery
    S.floor("parquet", 14, -8, 26, 6, 0, { surface: "wood" }); // Living Hall
    S.floor("parquet", 14, 6, 26, 24, 0, { surface: "wood" }); // Library
    S.floor("marble", 6, 12, 14, 24, 0); // Stair Hall
    S.floor("marble", -30, 22, -18, 30, 0); // Enamels Room
    for (const [x0, z0, x1, z1, h, k] of [
      [-6, 12, 6, 24, H, "plaster_cream"],
      [-18, 4, -10, 12, H, "plaster_cream"],
      [-30, -38, -18, -28, H, "plaster_cream"],
      [-18, -38, -10, -18, H, "plaster_cream"],
      [-10, -28, 2, -18, H, "plaster_cream"],
      [2, -28, 14, -18, H, "plaster_cream"],
      [14, 6, 26, 24, H, "wood_dark"],
      [-30, 22, -18, 30, 5, "plaster_cream"],
    ]) {
      S.ceil(k, x0, z0, x1, z1, h, { col: true });
    }
    S.ceil("plaster_cream", 14, -8, 21.1, 6, H, { col: true });
    S.ceil("plaster_cream", 23.9, -8, 26, 6, H, { col: true });
    S.ceil("plaster_cream", 21.1, -8, 23.9, -2.3, H, { col: true });
    // ------------------------------------------------------------------
    // WALLS (ground floor). Room heights: EH 6.5, GC 10, WV 6.5, WG 8.5, OR 6.5, NH 6.5, FR 6.5, DR 6.5, EG 7.5, LH 6.5, LB 6.5, SH 13, EN 5
    // ------------------------------------------------------------------
    // Entrance Hall
    S.wallX("travertine", 24, -6.2, 6.2, 0, H, 0.4, [[-1.4, 1.4, 0, 3.6]]); // front wall (street door)
    wall2Z(-6, 12, 24, H, H, "plaster_cream", "travertine", []); // west (solid)
    wall2Z(6, 12, 24, H, H, "travertine", "plaster_green", [DOOR(22, 3)]); // to Stair Hall
    A.wall2Z(S, 6, 12, 24, H, 4.3, 6.5, "plaster_cream", "plaster_green", [
      [20.6, 23.6, 0.3, 3.3],
    ]); // upstairs: Upper Hall ↔ stair landing
    wall2X(12, -6, 6, H, H, "travertine", "travertine", [DOOR(0, 3.6)]); // to Garden Court
    A.wall2X(S, 12, -6, 6, H, 3.8, 4.3, "marble", "plaster_cream", [
      [-1.6, 1.6, 0.3, 3.3],
    ]); // upstairs: balcony ↔ Upper Hall
    // Garden Court perimeter (the court side is always 10 high)
    wall2X(12, -10, -6, 10, H, "travertine", "plaster_cream", []);
    wall2X(12, 6, 14, 10, 13, "travertine", "plaster_green", []);
    wall2Z(-10, 4, 12, H, 10, "plaster_cream", "travertine", [DOOR(8, 3)]); // to West Vestibule
    wall2Z(-10, -18, 4, 10, 10, "ashlar_dark", "travertine", []); // (closed service wing)
    wall2X(-18, -10, 2, H, 10, "silk_green", "travertine", [DOOR(-4, 3)]); // Fragonard ↔ Court
    wall2X(-18, 2, 14, H, 10, "silk_red", "travertine", [DOOR(8, 3)]); // Dining ↔ Court
    wall2Z(14, -18, -8, 10, 7.5, "travertine", "silk_red", []); // East Gallery (court side blind)
    wall2Z(14, -8, 6, 10, H, "travertine", "silk_green", [DOOR(-2, 3.2)]); // Living Hall ↔ Court
    wall2Z(14, 6, 12, 10, H, "travertine", "wood_dark", []);
    S.wallZ("plaster", 14.1, 6, 12, H, 10.8, 0.2, []); // Security Office side, upstairs
    // West Vestibule / West Gallery
    wall2X(4, -18, -10, 10, H, "ashlar_dark", "plaster_cream", []);
    wall2X(12, -18, -10, H, 1, "plaster_cream", "ashlar_dark", []);
    wall2Z(-18, 4, 12, 8.5, H, "silk_green", "plaster_cream", [DOOR(8, 3)]);
    wall2Z(-18, -18, 4, 8.5, 10, "silk_green", "ashlar_dark", []);
    wall2Z(-18, 12, 22, 8.5, 1, "silk_green", "ashlar_dark", []);
    wall2Z(-18, -28, -18, 8.5, H, "silk_green", "marble", []);
    S.wallZ("silk_green", -30, -28, 22, 0, 8.5, 0.4, []); // gallery west wall
    wall2X(-28, -30, -18, H, 8.5, "plaster_cream", "silk_green", [
      DOOR(-24, 3),
    ]); // ↔ Oval Room
    wall2X(22, -30, -18, 8.5, 5, "silk_green", "plaster_cream", [DOOR(-24, 3)]); // ↔ Enamels Room
    // Oval Room / North Hall / Fragonard / Dining / East Gallery
    S.wallX("plaster_cream", -38, -30.2, -9.8, 0, H, 0.4, []);
    S.wallZ("plaster_cream", -30, -38, -28, 0, H, 0.4, []);
    wall2Z(-18, -38, -28, H, H, "plaster_cream", "marble", [DOOR(-33, 3)]);
    wall2Z(-10, -28, -18, H, H, "marble", "silk_green", [DOOR(-23, 3)]);
    wall2Z(-10, -38, -28, H, H, "marble", "ashlar_dark", []);
    S.wallX("silk_green", -28, -10, 14, 0, H, 0.4, []);
    wall2Z(2, -28, -18, H, H, "silk_green", "silk_red", [DOOR(-23, 3)]);
    wall2Z(14, -28, -18, H, 7.5, "silk_red", "silk_red", [DOOR(-23, 3)]);
    S.wallX("silk_red", -28, 14, 26.2, 0, 7.5, 0.4, []);
    S.wallZ("silk_red", 26, -28, -8, 0, 7.5, 0.4, []);
    wall2X(-8, 14, 26, 7.5, H, "silk_red", "silk_green", [DOOR(20, 3.4)]); // East Gallery ↔ Living Hall
    S.wallZ("silk_green", 26, -8, 6, 0, H, 0.4, []);
    wall2X(6, 14, 26, H, H, "silk_green", "wood_dark", [DOOR(20, 3)]); // Living Hall ↔ Library
    S.wallZ("wood_dark", 26, 6, 24, 0, H, 0.4, []);
    S.wallX("wood_dark", 24, 14, 26.2, 0, H, 0.4, [[16.3, 18.7, 0, 3.0]]); // basement stair door
    wall2Z(14, 12, 24, H, H, "plaster_green", "wood_dark", [DOOR(22, 3)]); // Stair Hall ↔ Library
    A.wall2Z(S, 14, 12, 24, H, 6.5, 4.3, "plaster_green", "plaster", [
      [20.4, 23.4, 0.3, 3.3],
    ]); // upstairs: landing ↔ Security Office
    S.wallX("plaster_green", 24, 6, 14, 0, 13, 0.4, []);
    // Enamels Room
    S.wallZ("plaster_cream", -30, 22, 30, 0, 5, 0.4, []);
    S.wallZ("plaster_cream", -18, 22, 30, 0, 5, 0.4, []);
    S.wallX("plaster_cream", 30, -30.2, -17.8, 0, 5, 0.4, [
      [-25.3, -22.7, 0, 3.0],
    ]); // service stair door
    // (closed-off service wing filler, visible above the vestibule)
    S.b.box("ashlar_dark", -18, 0, -18, -10, 10, 4, { seg: false });

    // ------------------------------------------------------------------
    // ENTRANCE HALL
    // ------------------------------------------------------------------
    trims(-6, 12, 6, 24, 0, H, "gold");
    D.chandelier(S, 0, 5.9, 18, 0.9, { tiers: 2, lr: 11, li: 0.9, chain: 0.6 });
    // ticket desk & coat check
    b.box("wood_dark", -5.6, 0, 14, -3.4, 1.05, 19, { segLen: 2 });
    b.box("marble_dark", -5.7, 1.05, 13.9, -3.3, 1.12, 19.1, {
      seg: false,
      noAO: true,
    });
    S.col(-5.6, 0, 14, -3.4, 1.1, 19, { walkable: false });
    D.sign(
      b,
      "frick_admission",
      ["ADMISSION", "Adults 50¢ · Robots Free"],
      "gilt",
      -3.32,
      1.6,
      16.5,
      1.4,
      0.4,
      HP,
      { tw: 512, th: 144 },
    );
    D.bookcase(b, -5.6, 0, 22, HP, { w: 2.2, h: 2.0, shelves: 4, empty: 0.4 });
    D.poster(b, "frick_robot", 5.78, 2.0, 21.5, -HP, 1.1);
    D.poster(b, "frick_hours", 5.78, 2.0, 14.3, -HP, 1.0);
    D.papers(b, 1, 0, 20, 3, 10);
    b.box("wood_dark", 2.5, 0, 22.2, 5.4, 0.45, 23.1, { seg: false }); // bench
    S.prop("skeleton", 3.8, 0.45, 22.6, PI, { pose: "sitting" });
    D.master(b, -5.78, 3.6, 18, 2.0, 2.5, HP, 12); // the founder greets you
    S.anchor("entrance", 0, 0, 21.8, 0);
    S.anchor("curator", 1.6, 0, 14.8, PI);

    // ------------------------------------------------------------------
    // GARDEN COURT (x -10..14, z -18..12, h 10): columns, pool, fountain, frogs, plants, glass roof
    // ------------------------------------------------------------------
    A.skylight(S, -8, -16, 12, 6, 9.9, {
      cell: 2.2,
      broken: 0.08,
      r: 14,
      i: 0.85,
      color: 0xd8e8c8,
      glowSize: 3.4,
    });
    b.box("marble", -10, 9.9, -18, 14, 10.3, -16, { seg: false });
    b.box("marble", -10, 9.9, 6, 14, 10.3, 12, { seg: false });
    b.box("marble", -10, 9.9, -16, -8, 10.3, 6, { seg: false });
    b.box("marble", 12, 9.9, -16, 14, 10.3, 6, { seg: false });
    for (const x of [-7.2, 11.2])
      for (let z = -15; z <= 3; z += 4.5)
        for (const dz of [-0.55, 0.55])
          A.column(b, "marble", x, 0, z + dz, 7.8, 0.28, "ionic", { S });
    for (const x of [-7.2, 11.2])
      b.box("marble", x - 0.5, 7.8, -16.2, x + 0.5, 8.6, 4.2, { seg: false }); // architraves
    b.box("marble", -7.7, 8.6, -16.2, 11.7, 9.9, -15.2, { seg: false }); // frieze band north
    // pool + fountain
    const PX0 = -3.5,
      PX1 = 7.5,
      PZ0 = -10,
      PZ1 = 2;
    b.box("marble", PX0 - 0.35, 0, PZ0 - 0.35, PX1 + 0.35, 0.55, PZ0, {
      seg: false,
    });
    b.box("marble", PX0 - 0.35, 0, PZ1, PX1 + 0.35, 0.55, PZ1 + 0.35, {
      seg: false,
    });
    b.box("marble", PX0 - 0.35, 0, PZ0, PX0, 0.55, PZ1, { seg: false });
    b.box("marble", PX1, 0, PZ0, PX1 + 0.35, 0.55, PZ1, { seg: false });
    b.box("water_clear", PX0, 0.25, PZ0, PX1, 0.3, PZ1, {
      seg: false,
      noAO: true,
      noBake: true,
    });
    for (const [x0, z0, x1, z1] of [
      [PX0 - 0.35, PZ0 - 0.35, PX1 + 0.35, PZ0],
      [PX0 - 0.35, PZ1, PX1 + 0.35, PZ1 + 0.35],
      [PX0 - 0.35, PZ0, PX0, PZ1],
      [PX1, PZ0, PX1 + 0.35, PZ1],
    ])
      S.col(x0, 0, z0, x1, 0.55, z1);
    S.col(PX0, 0, PZ0, PX1, 0.25, PZ1, { surface: "water" });
    const FX = (PX0 + PX1) / 2,
      FZ = (PZ0 + PZ1) / 2;
    b.lathe(
      "marble",
      [
        [0.001, 0],
        [0.7, 0],
        [0.7, 0.3],
        [0.25, 0.45],
        [0.18, 1.3],
        [1.1, 1.45],
        [1.15, 1.6],
        [0.001, 1.55],
      ],
      16,
      FX,
      0.25,
      FZ,
    );
    b.lathe(
      "marble",
      [
        [0.001, 0],
        [0.12, 0],
        [0.1, 0.5],
        [0.55, 0.62],
        [0.58, 0.72],
        [0.001, 0.68],
      ],
      12,
      FX,
      1.8,
      FZ,
    );
    // bronze frogs at the corners spitting (dry) arcs
    for (const [fx, fz] of [
      [PX0 + 0.5, PZ0 + 0.5],
      [PX1 - 0.5, PZ0 + 0.5],
      [PX0 + 0.5, PZ1 - 0.5],
      [PX1 - 0.5, PZ1 - 0.5],
    ]) {
      b.sphere("verdigris", fx, 0.62, fz, 0.22, { sy: 0.7, ws: 8, hs: 6 });
      b.sphere(
        "verdigris",
        fx + (FX - fx) * 0.05,
        0.78,
        fz + (FZ - fz) * 0.05,
        0.13,
        { ws: 6, hs: 4 },
      );
      b.box("verdigris", fx - 0.3, 0.55, fz - 0.3, fx + 0.3, 0.57, fz + 0.3, {
        seg: false,
        noAO: true,
      });
    }
    // dead palms & overgrown ferns in corner beds, glowing fungus
    for (const [x, z] of [
      [-5.8, -14.5],
      [9.8, -14.5],
      [-5.8, 1.5],
      [9.8, 1.5],
    ])
      D.palm(b, x, 0, z, 3.4 + P.rng(x + z)() * 1.2, { pot: "marble" });
    for (let i = 0; i < 10; i++) {
      const rn = P.rng("fern" + i);
      const x = PX0 + rn() * (PX1 - PX0),
        z = rn() < 0.5 ? PZ0 - 1.4 : PZ1 + 1.4;
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * TAU + rn();
        b.geo(
          "foliage",
          new THREE.ConeGeometry(0.1, 0.9 + rn() * 0.5, 4).translate(
            0,
            0.45,
            0,
          ),
          P.m4(x, 0.05, z, a, 0.9 + rn() * 0.3, 0),
          { noAO: true },
        );
      }
    }
    for (let i = 0; i < 6; i++) {
      const rn = P.rng("fungus" + i);
      const x = -6 + rn() * 16,
        z = -14 + rn() * 18;
      b.sphere("rad_glow", x, 0.05, z, 0.08 + rn() * 0.08, {
        sy: 0.6,
        ws: 5,
        hs: 3,
        noAO: true,
      });
    }
    S.glow(FX, 0.6, PZ1 + 1.4, 0x60ff80, 1.2);
    S.light(FX, 0.6, PZ1 + 1.4, 0x60ff80, 4, 0.4);
    for (const z of [-12, -3, 6]) {
      b.box("marble", -5.6, 0, z - 1.2, -5.0, 0.5, z + 1.2, { seg: false });
      b.box("marble", 9.0, 0, z - 1.2, 9.6, 0.5, z + 1.2, { seg: false });
      S.col(-5.6, 0, z - 1.2, -5.0, 0.5, z + 1.2);
      S.col(9.0, 0, z - 1.2, 9.6, 0.5, z + 1.2);
    }
    S.anchor("fountain", FX, 0, PZ1 + 1.2, PI);
    // balcony along the south side of the court (upper floor), with balustrade
    S.floor("travertine", -10, 8, 14, 12, UY, { t: 0.35 });
    b.box("plaster_cream", -10, UY - 0.8, 7.9, 14, UY - 0.35, 8.2, {
      seg: false,
    });
    for (let x = -8; x <= 12; x += 4)
      b.box("marble", x - 0.25, UY - 1.4, 8.0, x + 0.25, UY - 0.35, 8.4, {
        seg: false,
      }); // corbels
    A.balustrade(
      S,
      [
        [-9.8, 8.2],
        [13.8, 8.2],
      ],
      UY,
      { key: "marble", h: 1.0 },
    );
    S.anchor("balcony", 2, UY, 10, 0);

    // ------------------------------------------------------------------
    // WEST VESTIBULE + WEST GALLERY (x -30..-18, z -28..22, h 8.5, skylit cove)
    // ------------------------------------------------------------------
    trims(-18, 4, -10, 12, 0, H, "gold");
    D.master(b, -14, 3.2, 4.25, 1.8, 2.2, 0, 3);
    D.sconce(S, -17.75, 3.2, 8, HP, { r: 6, i: 0.7 });
    // cove + skylight
    b.rod("plaster_cream", [-29.8, 8.45, -3], [-27.95, 9.25, -3], 0.08, 4, {
      square: true,
      r2: 25,
    });
    b.rod("plaster_cream", [-18.2, 8.45, -3], [-20.05, 9.25, -3], 0.08, 4, {
      square: true,
      r2: 25,
    });
    b.box("plaster_cream", -30, 8.5, -28, -18, 9.2, -27.3, { seg: false });
    b.box("plaster_cream", -30, 8.5, 21.3, -18, 9.2, 22, { seg: false });
    A.skylight(S, -28, -27.3, -20, 21.3, 9.2, {
      cell: 2.0,
      broken: 0.05,
      r: 11,
      i: 0.75,
      color: 0xe0e8d0,
      glowSize: 2.6,
    });
    trims(-30, -28, -18, 22, 0, 8.5, "gold");
    // pictures: tall canvases along both walls (Old Masters)
    const WG_W = [
      [-14, 1],
      [-6, 7],
      [2, 4],
      [10, 9],
      [16, 11],
    ];
    for (const [z, c] of WG_W)
      D.master(
        b,
        -29.78,
        3.4,
        z,
        z === 2 ? 3.4 : 2.2,
        z === 2 ? 2.4 : 2.8,
        HP,
        c,
      );
    D.emptyFrame(b, -29.78, 3.4, -22, 2.0, 2.3, HP, { patch: "silk_gold" }); // Mistress and Maid — gone
    const WG_E = [
      [-24, 6],
      [-16, 8],
      [-2, 10],
      [14, 1],
      [19, 13],
    ];
    for (const [z, c] of WG_E) D.master(b, -18.22, 3.4, z, 2.2, 2.8, -HP, c);
    D.label(
      b,
      "frick_vermeer",
      [
        "MISTRESS AND MAID",
        "Delft, c. 1667 — oil on canvas",
        "ON LOAN TO THE BASEMENT (FLOOD)",
        '"Temporarily relocated." — Ambrose',
      ],
      -29.76,
      1.5,
      -20.3,
      0.9,
      0.34,
      HP,
      "label",
    );
    // benches, a long refectory table of small bronzes
    for (const z of [-18, -6, 6]) {
      b.box("velvet", -25.2, 0.3, z - 1.6, -22.8, 0.5, z + 1.6, { seg: false });
      b.box("wood_dark", -25.1, 0, z - 1.5, -22.9, 0.3, z + 1.5, {
        seg: false,
      });
      S.col(-25.2, 0, z - 1.6, -22.8, 0.5, z + 1.6);
    }
    b.box("wood_dark", -25, 0, -27.5 + 3, -23, 0.85, -27.5 + 5.5, {
      seg: false,
    });
    for (let i = 0; i < 3; i++)
      D.figure(
        b,
        "bronze",
        -24 + (i - 1) * 0.55,
        0.85,
        -23.7,
        PI,
        0.28,
        ["arm", "dance", "stand"][i],
      );
    S.col(-25, 0, -24.5, -23, 0.9, -22);
    // a toppled painting on an easel, broken glass, a robot's cleaning cart
    D.shards(b, -21, 0, -10, 1.6, 14);
    D.rubble(S, -27, 0, 16, 1.0, { key: "plaster_cream" });
    for (let x = -28; x <= -20; x += 4) S.light(x, 7.2, -2, 0xffe8c8, 8, 0.35);
    S.anchor("vermeer_frame", -28.8, 0, -22, -HP);
    S.anchor("gallery", -24, 0, -2, 0);

    // ------------------------------------------------------------------
    // OVAL ROOM (x -30..-18, z -38..-28): oval ring of panels inside the box, full-length ladies, the Chief Attendant
    // ------------------------------------------------------------------
    const OC = [-24, -33],
      ORA = 5.6,
      ORB = 4.6;
    for (let k = 0; k < 24; k++) {
      const a0 = (k / 24) * TAU,
        a1 = ((k + 1) / 24) * TAU;
      const x0 = OC[0] + Math.cos(a0) * ORA,
        z0 = OC[1] + Math.sin(a0) * ORB,
        x1 = OC[0] + Math.cos(a1) * ORA,
        z1 = OC[1] + Math.sin(a1) * ORB;
      const mid = (a0 + a1) / 2,
        doorA =
          Math.abs(P.clamp(Math.sin(mid), -1, 1) - 1) < 0.02 ||
          Math.cos(mid) > 0.97;
      const L = Math.hypot(x1 - x0, z1 - z0),
        ang = Math.atan2(z1 - z0, x1 - x0);
      if (!doorA)
        b.boxC("silk_gold", (x0 + x1) / 2, 0, (z0 + z1) / 2, L + 0.05, H, 0.2, {
          ry: -ang,
          seg: false,
        });
      b.boxC(
        "gold",
        (x0 + x1) / 2,
        H - 0.4,
        (z0 + z1) / 2,
        L + 0.05,
        0.3,
        0.35,
        { ry: -ang, seg: false, noAO: true },
      );
    }
    b.inside(
      "plaster_cream",
      new THREE.LatheGeometry(
        [
          [ORA, 0],
          [ORA * 0.75, 0.45],
          [ORA * 0.35, 0.68],
          [0.001, 0.72],
        ].map((q) => new THREE.Vector2(q[0], q[1])),
        24,
      ),
      P.m4(OC[0], H - 0.95, OC[1], 0, 0, 0, 1, 1, ORB / ORA),
      { noAO: true },
    );
    for (const [a, c] of [
      [PI * 0.75, 6],
      [PI * 1.25, 11],
      [PI * 1.75, 6],
    ])
      D.master(
        b,
        OC[0] + Math.cos(a) * (ORA - 0.2),
        3.3,
        OC[1] + Math.sin(a) * (ORB - 0.2),
        1.5,
        3.2,
        -a - HP,
        c,
      );
    D.chandelier(S, OC[0], H - 0.6, OC[1], 0.7, {
      tiers: 2,
      lr: 9,
      li: 0.7,
      chain: 0.3,
    });
    D.sofa(b, -24, 0, -36.2, 0, { fabric: "velvet" });
    S.anchor("boss", -24, 0, -32.5, PI);

    // ------------------------------------------------------------------
    // NORTH HALL (x -18..-10, z -38..-18)
    // ------------------------------------------------------------------
    trims(-18, -38, -10, -18, 0, H, "gold");
    b.box("marble_dark", -17.5, 0, -30, -16.4, 0.9, -26, { seg: false });
    b.box("marble", -17.6, 0.9, -30.1, -16.3, 0.98, -25.9, {
      seg: false,
      noAO: true,
    });
    S.col(-17.5, 0, -30.1, -16.3, 1.0, -25.9, { walkable: false });
    b.sphere("marble", -16.95, 1.35, -28, 0.2, { sy: 1.2 });
    b.cyl("marble", -16.95, 0.98, -28, 0.18, 0.3, 0.2, 10);
    b.box("glass", -17.78, 1.3, -30, -17.76, 4.5, -26, {
      seg: false,
      noAO: true,
    }); // pier mirror
    b.box("gold", -17.8, 1.2, -30.1, -17.7, 4.6, -29.95, { seg: false });
    b.box("gold", -17.8, 1.2, -26.05, -17.7, 4.6, -25.9, { seg: false });
    b.box("gold", -17.8, 4.5, -30.1, -17.7, 4.8, -25.9, { seg: false });
    D.master(b, -10.22, 3.2, -33, 1.6, 2.2, -HP, 11);
    D.chandelier(S, -14, 5.9, -28, 0.6, {
      tiers: 1,
      lr: 8,
      li: 0.7,
      chain: 0.3,
      broken: true,
    });
    S.anchor("north_hall", -14, 0, -28, 0);

    // ------------------------------------------------------------------
    // FRAGONARD ROOM (x -10..2, z -28..-18): the four rococo panels, gilt boiserie, Louis XV sofas
    // ------------------------------------------------------------------
    trims(-10, -28, 2, -18, 0, H, "gold");
    for (const [x, z, ry] of [
      [-6.5, -27.78, 0],
      [-1.5, -27.78, 0],
      [-9.78, -21, HP],
    ]) {
      D.master(b, x, 3.1, z, 2.3, 3.6, ry, 5, { frame: "gold", ft: 0.12 });
    }
    for (let x = -9; x <= 1; x += 2.5)
      b.box("plaster_cream", x - 0.08, 0.2, -27.8, x + 0.08, 6.1, -27.75, {
        seg: false,
        noAO: true,
      });
    D.sofa(b, -4, 0, -26.4, 0, { fabric: "fabric_pink", w: 2.2 });
    D.chair(b, -7, 0, -23, 0.6, { seat: "fabric_pink", wood: "gold" });
    D.chair(b, -1.5, 0, -23, -0.4, {
      seat: "fabric_pink",
      wood: "gold",
      toppled: true,
    });
    D.table(b, -4, 0, -22.5, { r: 0.5, top: "marble", leg: "gold" });
    D.chandelier(S, -4, 5.9, -23, 0.8, {
      tiers: 2,
      lr: 9,
      li: 0.8,
      chain: 0.3,
      color: 0xffd0c0,
    });
    D.label(
      b,
      "frick_fragonard",
      [
        "THE PROGRESS OF LOVE",
        "Painted for a royal mistress, 1771",
        "She sent them back.",
        "Nobody knows why.",
      ],
      1.78,
      1.5,
      -23,
      0.9,
      0.36,
      -HP,
      "label",
    );

    // ------------------------------------------------------------------
    // DINING ROOM (x 2..14, z -28..-18): the eternal dinner party
    // ------------------------------------------------------------------
    trims(2, -28, 14, -18, 0, H, "gold");
    D.table(b, 8, 0, -23, {
      rect: [7.2, 1.8],
      top: "wood_dark",
      leg: "wood_dark",
      cloth: "fabric_white",
    });
    S.col(4.4, 0, -23.9, 11.6, 0.8, -22.1, { walkable: false });
    for (let i = 0; i < 6; i++)
      for (const s of [-1, 1]) {
        const x = 5.2 + i * 1.12,
          z = -23 + s * 1.35;
        D.chair(b, x, 0, z, s < 0 ? 0 : PI, { seat: "velvet", arms: i === 0 });
        b.cyl("paint_white", x, 0.79, -23 + s * 0.55, 0.16, 0.12, 0.03, 10, {
          noAO: true,
        });
        b.cyl("chrome", x + 0.25, 0.79, -23 + s * 0.55, 0.02, 0.03, 0.2, 5, {
          noAO: true,
        });
      }
    for (const x of [5.5, 8, 10.5]) {
      b.cyl("gold", x, 0.79, -23, 0.06, 0.12, 0.45, 6, { noAO: true });
      D.candles(S, x, 1.24, -23, 3, { r: 5, i: 0.55, size: 0.35 });
    }
    D.master(b, 13.78, 3.3, -23, 2.2, 2.8, -HP, 6);
    D.master(b, 2.22, 3.3, -23, 2.2, 2.8, HP, 7);
    D.fireplace(b, S, 8, 0, -27.8, 0, { key: "marble" });
    S.prop("skeleton", 5.2, 0.45, -24.3, 0, { pose: "seated" });
    S.prop("skeleton", 7.44, 0.45, -21.7, PI, { pose: "seated" });
    S.prop("skeleton", 10.8, 0.45, -24.3, 0, { pose: "seated" });
    S.anchor("dining", 8, 0, -19.5, PI);
    S.anchor("butler", 12.6, 0, -20.2, HP);

    // ------------------------------------------------------------------
    // EAST GALLERY (x 14..26, z -28..-8, h 7.5): harbour pictures, a hole in the roof, creeping vine
    // ------------------------------------------------------------------
    trims(14, -28, 26, -8, 0, 7.5, "gold");
    b.box("plaster_cream", 14, 7.5, -28, 26, 7.8, -21, { seg: false });
    b.box("plaster_cream", 14, 7.5, -15, 26, 7.8, -8, { seg: false });
    b.box("plaster_cream", 14, 7.5, -21, 17, 7.8, -15, { seg: false });
    b.box("plaster_cream", 22.5, 7.5, -21, 26, 7.8, -15, { seg: false });
    S.col(14, 7.5, -28, 26, 7.8, -8);
    D.rubble(S, 19.8, 0, -18, 2.6, {
      key: "plaster_ruin",
      slab: true,
      rebar: true,
      col: true,
      colH: 0.5,
    });
    S.light(19.8, 6.8, -18, 0xc8e0b8, 12, 1.0);
    S.glow(19.8, 7.6, -18, 0xd8e8c8, 3.2);
    b.box("glass_sky", 16.5, 9.4, -21.5, 23, 9.45, -14.5, {
      seg: false,
      noAO: true,
      noBake: true,
    });
    for (const [x0, x1, z0, z1] of [
      [16.5, 17, -21.5, -14.5],
      [22.5, 23, -21.5, -14.5],
      [17, 22.5, -21.5, -21],
      [17, 22.5, -15, -14.5],
    ])
      b.box("plaster_ruin", x0, 7.8, z0, x1, 9.4, z1, { seg: false });
    for (let i = 0; i < 12; i++) {
      const rn = P.rng("vine" + i);
      b.rod(
        "moss",
        [17 + rn() * 5.5, 7.5, -21 + rn() * 6],
        [17 + rn() * 5.5, 3 + rn() * 3, -21 + rn() * 6],
        0.03,
        3,
        { noAO: true },
      );
    }
    for (const [x, z, ry, c] of [
      [25.78, -24, -HP, 4],
      [25.78, -14, -HP, 8],
      [14.22, -25, HP, 9],
      [18, -27.78, 0, 10],
      [22, -27.78, 0, 7],
    ])
      D.master(b, x, 3.4, z, 2.4, 2.6, ry, c);
    b.box("wood_dark", 19, 0, -12.5, 21, 0.9, -10.5, { seg: false });
    D.figure(b, "bronze", 20, 0.9, -11.5, 0.5, 0.45, "pomona");
    S.col(19, 0, -12.5, 21, 0.9, -10.5, { walkable: false });

    // ------------------------------------------------------------------
    // LIVING HALL (x 14..26, z -8..6): fireplace flanked by statesmen, the empty St. Francis frame
    // ------------------------------------------------------------------
    trims(14, -8, 26, 6, 0, H, "gold");
    D.fireplace(b, S, 25.8, 0, -1, -HP, { key: "marble_green" });
    D.master(b, 25.78, 3.9, -1, 2.2, 2.8, -HP, 10);
    D.master(b, 25.78, 3.2, -5.3, 1.6, 1.9, -HP, 3);
    D.master(b, 25.78, 3.2, 3.3, 1.6, 1.9, -HP, 3);
    D.emptyFrame(b, 20, 3.4, 5.78, 3.2, 2.6, PI, { patch: "silk_gold" }); // St. Francis — gone
    D.label(
      b,
      "frick_bellini",
      [
        "ST. FRANCIS IN THE DESERT",
        "Venice, c. 1476 — oil on panel",
        "REMOVED BY PERSONS UNKNOWN",
        "WITH GUNS — 1987",
      ],
      22.2,
      1.4,
      5.76,
      0.9,
      0.36,
      PI,
      "label",
    );
    D.sofa(b, 20, 0, 1.2, PI, { fabric: "velvet", w: 2.4 });
    D.sofa(b, 20, 0, -4.5, 0, { fabric: "velvet", w: 2.4 });
    D.table(b, 20, 0, -1.6, {
      rect: [1.6, 0.9],
      top: "marble_dark",
      leg: "gold",
    });
    for (const [x, z] of [
      [15, -7.2],
      [15, 5.2],
    ]) {
      b.lathe(
        "paint_blue",
        [
          [0.001, 0],
          [0.22, 0],
          [0.34, 0.3],
          [0.3, 0.8],
          [0.14, 1.0],
          [0.18, 1.1],
          [0.001, 1.1],
        ],
        12,
        x,
        0,
        z,
      );
    }
    D.chandelier(S, 20, 5.9, -1, 0.9, {
      tiers: 2,
      lr: 11,
      li: 0.85,
      chain: 0.3,
    });
    S.anchor("francis_frame", 20, 0, 4.6, 0);
    // rubble slide from the collapsed sitting room upstairs (a way back down)
    const slide = [];
    for (let i = 0; i < 15; i++) {
      const y = UY - (i + 1) * 0.45,
        z0 = -2.2 + i * 0.5;
      if (y <= 0.05) break;
      b.box("plaster_ruin", 21.2, 0, z0, 23.8, y, z0 + 0.52, {
        seg: false,
        grime: 0.8,
      });
      S.col(21.2, 0, z0, 23.8, y, z0 + 0.52, { surface: "rubble" });
      slide.push(z0);
    }
    D.rubble(S, 22.5, 0.2, 5.0, 1.4, { key: "plaster_ruin", rebar: true });
    for (let i = 0; i < 5; i++)
      b.box(
        "wood_rotten",
        21 + i * 0.6,
        UY - 0.8 - i * 0.9,
        -2.4 + i * 1.2,
        21.2 + i * 0.6,
        UY - 0.5 - i * 0.9,
        -0.2 + i * 1.2,
        { rx: 0.7, seg: false, grime: 0.9 },
      );

    // ------------------------------------------------------------------
    // LIBRARY (x 14..26, z 6..24): oak, the founder over the mantel, globe, desk; basement door
    // ------------------------------------------------------------------
    for (const z of [8.5, 11.5, 14.5])
      D.bookcase(b, 25.62, 0, z, -HP, {
        w: 2.8,
        h: 3.4,
        shelves: 7,
        empty: 0.2,
      });
    for (const x of [16, 20, 23.5])
      D.bookcase(b, x, 0, 6.35, 0, { w: 2.8, h: 3.4, shelves: 7, empty: 0.25 });
    D.fireplace(b, S, 25.8, 0, 19, -HP, { key: "marble_dark", lit: false });
    D.master(b, 25.78, 3.9, 19, 1.9, 2.4, -HP, 12);
    b.box("wood_dark", 18.5, 0, 16, 21.5, 0.78, 17.4, { seg: false });
    S.col(18.5, 0, 16, 21.5, 0.8, 17.4, { walkable: false });
    D.chair(b, 20, 0, 18.1, PI, { seat: "leather", arms: true });
    b.sphere("paint_cream", 16.5, 1.2, 21.5, 0.4);
    b.torus("gold", 16.5, 1.2, 21.5, 0.44, 0.02, TAU, { rx: 0.4 });
    b.cyl("wood_dark", 16.5, 0, 21.5, 0.05, 0.25, 0.8, 8);
    D.rug(b, 16.5, 9, 24, 22, 0.01, "carpet_red");
    D.chandelier(S, 20, 5.9, 15, 0.8, {
      tiers: 2,
      lr: 11,
      li: 0.85,
      chain: 0.3,
    });
    D.sign(
      b,
      "frick_staff",
      ["STAFF ONLY", "Service Stair · Storage · Recreation"],
      "brass",
      17.5,
      3.4,
      23.78,
      1.4,
      0.36,
      PI,
      { tw: 512, th: 132 },
    );
    S.anchor("library", 20, 0, 12, 0);
    S.anchor("terminal_lib", 21.2, 0, 16.5, PI);

    // ------------------------------------------------------------------
    // STAIR HALL (x 6..14, z 12..24, double height): U-stair up to 6.8, the Aeolian organ on the landing
    // ------------------------------------------------------------------
    const st = A.stairsU(S, {
      x: 10,
      z0: 19.1,
      dir: "n",
      w: 3.2,
      gap: 0.6,
      y0: 0,
      y1: UY,
      key: "marble",
      rail: "gold",
      nosing: "carpet_red",
      landingD: 2.3,
    });
    D.organ(b, 10, st.landing.y, 12.22, 7.0, 4.8, 0);
    D.sconce(S, 6.25, 4.5, 20, HP, { r: 7, i: 0.8 });
    D.sconce(S, 13.75, 4.5, 20, -HP, { r: 7, i: 0.8 });
    S.ceil("plaster_cream", 6, 12, 14, 24, 13, { col: true });
    D.chandelier(S, 10, 12.3, 18, 0.8, {
      tiers: 3,
      lr: 12,
      li: 0.9,
      chain: 0.6,
    });
    // upstairs arrival floor (east of the stairwell top)
    const topZ = st.top.z;
    S.floor("marble", 6, topZ, 14, 24, UY, { t: 0.35 });
    A.balustrade(
      S,
      [
        [6.3, topZ + 0.2],
        [10.1, topZ + 0.2],
      ],
      UY,
      { key: "marble", h: 1.0 },
    );
    S.anchor("stairs", 8.1, 0, 21.5, 0);
    S.anchor("organ", 10, st.landing.y, 13.6, 0);

    // ------------------------------------------------------------------
    // UPSTAIRS (y 6.8): Upper Hall (over the Entrance Hall), Security Office (over the Library),
    // collapsed Sitting Room (over the Living Hall), and the balcony onto the court
    // ------------------------------------------------------------------
    const UH = 4.0,
      UT = UY + UH;
    S.floor("parquet", -6, 12, 6, 24, UY, { t: 0.3, surface: "wood" });
    S.ceil("plaster_cream", -6, 12, 6, 24, UT, { col: true });
    S.wallX("plaster_cream", 24, -6.2, 6.2, UY, UT, 0.4, []);
    S.wallZ("plaster_cream", -6, 12, 24, UY, UT, 0.4, []);
    trims(-6, 12, 6, 24, UY, UH, "wood_dark");
    for (const [z, c] of [
      [15, 12],
      [21, 15],
    ])
      D.master(b, -5.78, UY + 2.1, z, 1.6, 2.0, HP, c);
    D.label(
      b,
      "frick_ambrose",
      [
        "AMBROSE",
        "Valet Mk. II, American Automaton Co.",
        "Presented by the Trustees, 1961",
        '"Always at your service."',
      ],
      -5.76,
      UY + 0.8,
      21,
      0.9,
      0.34,
      HP,
      "label",
    );
    S.prop("skeleton", 3.5, UY, 16, -0.8, { pose: "lying" });
    S.anchor("upper_hall", 0, UY, 18, 0);
    S.anchor("thief", 3.5, UY, 16.6, 0);
    // Security Office (x 14..26, z 6..24)
    S.floor("carpet", 14, 6, 26, 24, UY, { t: 0.3, surface: "carpet" });
    S.ceil("plaster", 14, 6, 26, 24, UT, { col: true });
    S.wallZ("plaster", 26, 6, 24, UY, UT, 0.4, []);
    S.wallX("plaster", 24, 14, 26.2, UY, UT, 0.4, []);
    S.wallX("plaster", 6, 14, 26.2, UY, UT, 0.4, [[18.4, 21.6, 0, 3.0]]); // → Sitting Room
    trims(14, 6, 26, 24, UY, UH, "wood_dark");
    // bank of CCTV monitors + desk + robot charging cradles
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 2; j++) {
        const z = 10 + i * 1.0,
          y = UY + 1.4 + j * 0.75,
          dead = (i + j) % 4 === 3;
        b.box(
          "paint_black",
          25.3,
          y - 0.35,
          z - 0.45,
          25.78,
          y + 0.35,
          z + 0.45,
          { seg: false },
        );
        b.box(
          dead ? "glass_dark" : "screen",
          25.28,
          y - 0.27,
          z - 0.36,
          25.3,
          y + 0.27,
          z + 0.36,
          { seg: false, noAO: true },
        );
      }
    S.glow(25.0, UY + 1.8, 12.5, 0x70ff90, 1.8);
    S.light(24.5, UY + 1.8, 12.5, 0x60ff80, 6, 0.7);
    b.box("metal", 22.6, UY, 9.5, 23.6, UY + 0.8, 16.5, { seg: false });
    S.col(22.6, UY, 9.5, 23.6, UY + 0.8, 16.5, { walkable: false });
    for (const z of [19.5, 22]) {
      b.box("panel", 24.9, UY, z - 0.8, 25.8, UY + 2.4, z + 0.8, {
        seg: false,
      });
      b.cyl("lamp_green", 25.2, UY + 2.1, z, 0.05, 0.05, 0.1, 6);
      S.col(24.9, UY, z - 0.8, 25.8, UY + 2.4, z + 0.8, { walkable: false });
    }
    D.sign(
      b,
      "frick_secoff",
      ["SECURITY", "Gallery Attendant Control"],
      "brass",
      14.22,
      UY + 2.4,
      15,
      1.3,
      0.4,
      HP,
      { tw: 512, th: 156 },
    );
    b.sphere("lamp_red", 20, UT - 0.15, 15, 0.15, { ws: 8, hs: 6 });
    S.glow(20, UT - 0.3, 15, 0xff3020, 0.9);
    S.anchor("security_terminal", 22.4, UY, 13, -HP);
    S.anchor("security", 19, UY, 15, 0);
    // Sitting Room (collapsed): x 14..26, z -8..6 — the floor has fallen in along x 21..24
    S.floor("parquet", 14, -8, 21.1, 6, UY, { t: 0.3, surface: "wood" });
    S.floor("parquet", 23.9, -8, 26, 6, UY, { t: 0.3, surface: "wood" });
    S.floor("parquet", 21.1, -8, 23.9, -2.3, UY, { t: 0.3, surface: "wood" });
    S.wallZ("wallpaper_rose", 26, -8, 6, UY, UT, 0.4, []);
    S.wallX("wallpaper_rose", -7.9, 14, 26.2, H, UT, 0.2, []);
    S.wallZ("wallpaper_rose", 14.1, -8, 6, H, UT, 0.2, []);
    b.box("plaster_ruin", 14, UT - 0.1, -8, 26, UT, 6, { seg: false });
    S.col(14, UT - 0.1, -8, 26, UT + 0.3, 6);
    D.sofa(b, 16.5, UY, -5, 0, { fabric: "fabric_pink" });
    D.bed(b, 18, UY, 3, PI, { w: 1.4, cover: "fabric_pink" });
    D.rubble(S, 22.6, UY, -3, 1.2, { key: "plaster_ruin" });
    S.anchor("sitting", 17, UY, 0, 0);

    // ------------------------------------------------------------------
    // ENAMELS ROOM (x -30..-18, z 22..30) + service stair down to the basement (x -26..-22)
    // ------------------------------------------------------------------
    trims(-30, 22, -18, 30, 0, 5, "gold");
    for (const x of [-28, -20])
      D.case(b, x, 0, 26, 1.6, 0.9, 0, {
        base: "wood_dark",
        velvet: "velvet",
        frame: "gold",
        goods: 5,
        smashed: x > -24,
      });
    for (const x of [-28, -20])
      S.col(x - 0.8, 0, 25.55, x + 0.8, 1.3, 26.45, { walkable: false });
    D.sign(
      b,
      "frick_enamels",
      ["LIMOGES ENAMELS", "Please do not lean on the cases"],
      "gilt",
      -24,
      3.2,
      22.22,
      1.8,
      0.4,
      0,
      { tw: 512, th: 112 },
    );
    S.stairs("concrete", -24, 36.5, "n", 3.2, BY, 0, { run: 0.3 }); // descends south from the door
    S.wallZ("concrete_dark", -25.8, 30, 39, BY, 3.2, 0.4, []);
    S.wallZ("concrete_dark", -22.2, 30, 39, BY, 3.2, 0.4, []);
    S.ceil("concrete", -26, 30, -22, 36.6, 3.2, {});
    S.light(-24, 2.4, 31.5, 0xffd8a0, 6, 0.6);
    S.glow(-24, 2.9, 31.2, 0xffd8a0, 0.5);
    b.sphere("lamp_dim", -24, 3.0, 31.2, 0.1, { ws: 6, hs: 4 });
    return S;
  }

  // ===================================================================
  // BASEMENT (BY = -5): landing, Mr. Frick's bowling alley, the flooded
  // art storage (the missing Vermeer), service stair up into the Library
  // ===================================================================
