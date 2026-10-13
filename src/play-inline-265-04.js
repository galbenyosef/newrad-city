// play-inline-265 04 — cz0
// Lines 670-1587 of readable/play-inline-265.pretty.js (statement-aligned).
  function buildInterior() {
    const O = P.I("cooper_hewitt");
    const S = P.site("cooper_int", {
      ox: O.x,
      oy: O.y + LIFT,
      oz: O.z,
      lit: true,
      ambient: 0x5e5244,
      ambI: 0.32,
      interiorKey: "cooper_hewitt",
    });
    const b = S.b;
    const H = 5.5,
      UY = 6.0,
      UH = 4.5,
      UT = UY + UH,
      BY = -4.4;
    const DOOR = (a, w) => [a - (w || 3) / 2, a + (w || 3) / 2, 0, 3.4];
    const w2X = (z, x0, x1, hN, hS, kN, kS, holes, y0) =>
      A.wall2X(S, z, x0, x1, y0 || 0, hN, hS, kN, kS, holes, {
        frame: "wood_dark",
        frameO: { cornice: true },
      });
    const w2Z = (x, z0, z1, hW, hE, kW, kE, holes, y0) =>
      A.wall2Z(S, x, z0, z1, y0 || 0, hW, hE, kW, kE, holes, {
        frame: "wood_dark",
        frameO: { cornice: true },
      });
    const skirt = (x0, z0, x1, z1, y, h, top) => {
      const e = 0.21;
      for (const [yy, hh, d, k] of [
        [y, 0.22, 0.05, "wood_dark"],
        [y + h - 0.3, 0.3, 0.1, top || "wood_dark"],
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
    // VESTIBULE (x -3..3, z 22..27) + GREAT HALL (x -8..8, z 4..22, open to UT)
    // ------------------------------------------------------------------
    S.floor("checker", -3, 22, 3, 27, 0);
    S.ceil("plaster_cream", -3, 22, 3, 27, 4.2, { col: true });
    S.wallX("oak_dark", 27, -3.2, 3.2, 0, 4.2, 0.4, [[-1.2, 1.2, 0, 3.2]]);
    S.wallZ("oak_dark", -3, 22, 27, 0, 4.2, 0.4, []);
    S.wallZ("oak_dark", 3, 22, 27, 0, 4.2, 0.4, []);
    D.sign(
      b,
      "coop_welcome",
      ["COOPER-HEWITT", "Please Check Umbrellas & Firearms"],
      "gilt",
      0,
      3.5,
      22.22,
      2.4,
      0.5,
      PI,
      { tw: 768, th: 160 },
    );
    S.anchor("entrance", 0, 0, 24.8, 0);

    S.floor("parquet", -8, 4, 8, 22, 0, { surface: "wood" });
    S.ceil("plaster_cream", -8, 4, 8, 22, UT, { col: true });
    w2X(22, -8, 8, UT, 4.2, "oak_dark", "oak_dark", [DOOR(0, 2.6)]);
    // oak panelling to the gallery, plaster above
    S.wallX("oak_dark", 4, -8.2, 8.2, 0, UT, 0.4, []);
    // side walls: ground openings to the wings, upstairs openings behind the gallery ring
    w2Z(-8, 4, 22, H, H, "wallpaper", "oak_dark", [
      DOOR(9, 3),
      DOOR(18.5, 2.6),
    ]);
    w2Z(8, 4, 22, H, H, "oak_dark", "silk_red", [DOOR(8, 3), DOOR(18.5, 2.6)]);
    A.wall2Z(S, -8, 4, 22, H, UT - H, UT - H, "plaster_cream", "oak_dark", [
      [8.5, 11.5, UY - H, UY - H + 3.2],
    ]);
    A.wall2Z(S, 8, 4, 22, H, UT - H, UT - H, "oak_dark", "teak", [
      [8.5, 11.5, UY - H, UY - H + 3.2],
      [16.5, 19.5, UY - H, UY - H + 3.2],
    ]);
    // U-stair up to the gallery ring
    const st = A.stairsU(S, {
      x: 0,
      z0: 12.4,
      dir: "n",
      w: 2.8,
      gap: 1.0,
      y0: 0,
      y1: UY,
      key: "wood_oak",
      rail: "wood_dark",
      nosing: "carpet_red",
      landingD: 2.2,
    });
    b.box("oak_dark", -0.5, 0, 7.2, 0.5, st.landing.y - 0.3, 12.4, {
      segLen: 2,
    }); // the newel core between the flights
    S.col(-0.5, 0, 7.2, 0.5, st.landing.y, 12.4, { walkable: false });
    // gallery ring (west + east + bridge over the hall) with balustrades
    S.floor("parquet", -8, 4, -5.2, 22, UY, { t: 0.4, surface: "wood" });
    S.floor("parquet", 5.2, 4, 8, 22, UY, { t: 0.4, surface: "wood" });
    S.floor("parquet", -5.2, 12.4, 5.2, 14.6, UY, { t: 0.4, surface: "wood" });
    A.balustrade(
      S,
      [
        [-5.2, 4.2],
        [-5.2, 12.4],
      ],
      UY,
      { key: "wood_dark", h: 0.95, posts: false },
    );
    A.balustrade(
      S,
      [
        [-5.2, 14.6],
        [-5.2, 21.8],
      ],
      UY,
      { key: "wood_dark", h: 0.95, posts: false },
    );
    A.balustrade(
      S,
      [
        [5.2, 4.2],
        [5.2, 12.4],
      ],
      UY,
      { key: "wood_dark", h: 0.95, posts: false },
    );
    A.balustrade(
      S,
      [
        [5.2, 14.6],
        [5.2, 21.8],
      ],
      UY,
      { key: "wood_dark", h: 0.95, posts: false },
    );
    A.balustrade(
      S,
      [
        [-5.2, 14.6],
        [5.2, 14.6],
      ],
      UY,
      { key: "wood_dark", h: 0.95, posts: false },
    );
    A.balustrade(
      S,
      [
        [-5.2, 12.4],
        [-0.5, 12.4],
      ],
      UY,
      { key: "wood_dark", h: 0.95, posts: false },
    );
    A.balustrade(
      S,
      [
        [3.3, 12.4],
        [5.2, 12.4],
      ],
      UY,
      { key: "wood_dark", h: 0.95, posts: false },
    );
    for (const x of [-5.2, 5.2])
      for (const z of [4.4, 12.4, 14.6, 21.8])
        b.box("oak_dark", x - 0.2, 0, z - 0.2, x + 0.2, UY, z + 0.2, {
          seg: false,
        });
    D.chandelier(S, 0, UT - 1.4, 18, 1.1, {
      tiers: 3,
      lr: 12,
      li: 1.0,
      chain: 1.2,
      broken: true,
    });
    // fireplace (the Carnegie mantel), portrait of the Steel Baron (defaced)
    D.fireplace(b, S, 0, 0, 4.2, 0, { key: "marble_dark", lit: true });
    D.master(b, -7.78, 3.2, 13, 1.7, 2.2, HP, 14);
    for (const z of [6, 16]) D.sconce(S, 7.78, 3.0, z, -HP, { r: 6, i: 0.7 });
    D.sconce(S, -7.78, 3.0, 20, HP, { r: 6, i: 0.7 });
    skirt(-8, 4, 8, 22, 0, H, "wood_dark");
    D.rug(b, -4, 14, 4, 21, 0.01, "carpet_red");
    // Otis elevator (a gilded cage in the south-east corner)
    const EXX = 6.4,
      EZ = 20.4;
    for (const [dx, dz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ])
      b.box(
        "gold",
        EXX + dx * 0.95 - 0.05,
        0,
        EZ + dz * 0.95 - 0.05,
        EXX + dx * 0.95 + 0.05,
        UT - 0.2,
        EZ + dz * 0.95 + 0.05,
        { seg: false, noAO: true },
      );
    for (let y = 0.6; y < UT - 0.3; y += 0.9)
      for (const dz of [-0.95, 0.95])
        b.box(
          "gold",
          EXX - 0.95,
          y,
          EZ + dz - 0.02,
          EXX + 0.95,
          y + 0.04,
          EZ + dz + 0.02,
          { seg: false, noAO: true },
        );
    for (let k = 0; k < 9; k++)
      b.box(
        "gold",
        EXX - 0.95 + k * 0.24,
        0.2,
        EZ - 0.97,
        EXX - 0.93 + k * 0.24,
        3.0,
        EZ - 0.93,
        { seg: false, noAO: true },
      );
    b.box("wood_dark", EXX - 0.9, 0, EZ - 0.9, EXX + 0.9, 0.1, EZ + 0.9, {
      seg: false,
    });
    S.col(EXX - 1.0, 0, EZ - 1.0, EXX + 1.0, UT, EZ - 0.9, { walkable: false });
    D.sign(
      b,
      "coop_otis",
      ["OTIS", "Passenger Elevator · 1902"],
      "brass",
      EXX - 1.0,
      3.3,
      EZ - 1.2,
      0.7,
      0.3,
      -HP,
      { tw: 384, th: 164 },
    );
    // elevator arrivals: step out of the cage facing away from it (up: onto the east gallery strip, clear of the
    // balustrade at x 5.2; down: into the Great Hall)
    S.anchor("elevator_down", EXX - 1.6, 0, EZ - 1.6, HP);
    S.anchor("elevator_up", EXX, UY, EZ - 2.5, 0);
    S.anchor("great_hall", 0, 0, 17, 0);

    // ------------------------------------------------------------------
    // WEST WING: Music Room → "STREAMLINE!" (x -24..-8, z 4..16), Conservatory lab (x -24..-8, z 16..26)
    // ------------------------------------------------------------------
    S.floor("parquet", -24, 4, -8, 16, 0, { surface: "wood" });
    S.ceil("plaster_cream", -24, 4, -8, 16, H, { col: true });
    S.wallX("wallpaper", 4, -24.2, -7.8, 0, H, 0.4, []);
    S.wallZ("wallpaper", -24, 4, 16, 0, H, 0.4, []);
    w2X(16, -24, -8, H, H, "wallpaper", "concrete", [DOOR(-12, 2.6)]);
    skirt(-24, 4, -8, 16, 0, H, "gold");
    // exhibition: plinths with streamlined objects; raiders have "curated" it
    const plinth = (x, z, w, h) => {
      b.box("paint_white", x - w / 2, 0, z - w / 2, x + w / 2, h, z + w / 2, {
        seg: false,
        grime: 0.4,
      });
      S.col(x - w / 2, 0, z - w / 2, x + w / 2, h, z + w / 2, {
        walkable: false,
      });
      return h;
    };
    // 1. streamlined toaster
    let y = plinth(-21, 7, 1.0, 1.0);
    b.box("chrome", -21.35, y, 6.85, -20.65, y + 0.35, 7.15, { seg: false });
    b.sphere("chrome", -21.35, y + 0.18, 7, 0.17, { sx: 0.6 });
    b.sphere("chrome", -20.65, y + 0.18, 7, 0.17, { sx: 0.6 });
    D.label(
      b,
      "coop_toaster",
      [
        "TOAST-O-MATIC MODEL 4",
        "Chrome, 1961",
        "Browns bread in 4 seconds.",
        "Also dogs. Recalled 1962.",
      ],
      -21,
      0.55,
      7.52,
      0.8,
      0.3,
      0,
      "label",
    );
    // 2. a teardrop radio
    y = plinth(-17, 7, 1.0, 1.1);
    b.sphere("paint_red", -17, y + 0.3, 7, 0.32, {
      sx: 1.4,
      sy: 0.9,
      ws: 12,
      hs: 8,
    });
    b.cyl("chrome", -17.3, y + 0.25, 7.3, 0.1, 0.1, 0.02, 12, { rx: HP });
    D.label(
      b,
      "coop_radio",
      [
        'RADIATION KING "ROCKET"',
        "Bakelite & chrome, 1958",
        "Receives four stations",
        "and the occasional satellite.",
      ],
      -17,
      0.6,
      7.52,
      0.8,
      0.3,
      0,
      "label",
    );
    // 3. Valet prototype on a turntable
    y = plinth(-13, 7, 1.4, 0.6);
    b.sphere("chrome", -13, y + 1.2, 7, 0.45, { ws: 12, hs: 8 });
    for (const a of [0, 2.1, 4.2])
      b.rod(
        "chrome",
        [-13, y + 1.5, 7],
        [-13 + Math.cos(a) * 0.3, y + 2.1, 7 + Math.sin(a) * 0.3],
        0.025,
        4,
      );
    for (const a of [0, 2.1, 4.2])
      b.sphere(
        "glass_dark",
        -13 + Math.cos(a) * 0.3,
        y + 2.15,
        7 + Math.sin(a) * 0.3,
        0.08,
        { ws: 6, hs: 4 },
      );
    b.cyl("paint_black", -13, y, 7, 0.18, 0.3, 0.8, 8);
    D.label(
      b,
      "coop_handy",
      [
        "VALET Mk. 0",
        "American Automaton prototype, 1951",
        "The one that started it all.",
        "Please do not wake him.",
      ],
      -13,
      0.35,
      7.72,
      0.8,
      0.3,
      0,
      "label",
    );
    // 4. chairs of the century on a stepped stand
    for (let i = 0; i < 4; i++) {
      b.box(
        "paint_white",
        -22.5 + i * 1.3,
        0,
        13.6 - i * 0.02,
        -21.5 + i * 1.3,
        0.4 + i * 0.2,
        15.6,
        { seg: false },
      );
      D.chair(b, -22 + i * 1.3, 0.4 + i * 0.2, 14.6, 0, {
        wood: ["chrome", "wood_oak", "paint_red", "iron"][i],
        seat: ["leather", "fabric", "paint_black", "velvet"][i],
      });
    }
    S.col(-22.5, 0, 13.6, -16.3, 1.0, 15.6, { walkable: false });
    D.label(
      b,
      "coop_chairs",
      [
        "SIT DOWN, AMERICA",
        "A century of chairs",
        "Guests may not sit.",
        "(The raiders did.)",
      ],
      -19.4,
      1.6,
      15.78,
      1.2,
      0.45,
      PI,
      "label",
    );
    // 5. the raiders' own exhibit: a skeleton in spiked leathers on a plinth, a hand-painted card
    y = plinth(-12, 13.5, 1.3, 0.5);
    S.prop("skeleton", -12, 0.5, 13.5, PI, { pose: "sitting" });
    D.label(
      b,
      "coop_raiderchic",
      [
        "RAIDER CHIC, 1989",
        "Leather, bone, regret",
        "Gift of the Decorator.",
        "TOUCH IT AND JOIN IT",
      ],
      -12,
      0.26,
      12.83,
      0.8,
      0.3,
      PI,
      "label",
    );
    for (const k of ["cooper_streamline", "cooper_chairs"])
      D.poster(
        b,
        k,
        k === "cooper_chairs" ? -23.78 : -23.78,
        2.2,
        k === "cooper_chairs" ? 13 : 8,
        HP,
        1.2,
      );
    D.chandelier(S, -16, H - 0.6, 10, 0.9, {
      tiers: 2,
      lr: 11,
      li: 0.8,
      chain: 0.5,
    });
    b.box("iron", -24, 4.3, 4.2, -8, 4.35, 4.3, { seg: false });
    S.anchor("exhibit", -16, 0, 10, 0);
    // Conservatory: glass roof, dead palms, the raiders' chem lab
    S.floor("tile", -24, 16, -8, 26, 0);
    S.wallX("concrete", 26, -24.2, -7.8, 0, 4.5, 0.4, []);
    S.wallZ("glass_green", -24, 16, 26, 0.9, 4.5, 0.2, []);
    b.box("brick_flemish", -24.2, 0, 16, -23.8, 0.9, 26, { seg: false });
    S.col(-24.2, 0, 16, -23.8, 4.5, 26, { walkable: false });
    w2Z(-8, 16, 26, H, H, "concrete", "wallpaper", []);
    A.skylight(S, -24, 16, -8, 26, 4.6, {
      cell: 1.6,
      broken: 0.2,
      glass: "glass_green",
      r: 10,
      i: 0.7,
      color: 0xc8e0b0,
    });
    for (let x = -22; x <= -10; x += 4)
      for (const z of [17.2]) D.palm(b, x, 0, z, 2.6, { pot: "terracotta" });
    // chem lab benches: rush/rage still
    b.box("metal", -21, 0, 21, -13, 0.9, 22.4, { segLen: 2 });
    S.col(-21, 0, 21, -13, 0.95, 22.4, { walkable: false });
    for (let i = 0; i < 9; i++) {
      const rn = P.rng("chem" + i);
      b.cyl(
        rn() < 0.5 ? "glass_green" : "glass",
        -20.5 + i * 0.9,
        0.9,
        21.7,
        0.08,
        0.12,
        0.2 + rn() * 0.25,
        6,
      );
    }
    b.cyl("rust", -15, 0.9, 21.7, 0.3, 0.3, 0.7, 10);
    b.rod("copper", [-15, 1.6, 21.7], [-13.6, 2.1, 21.7], 0.03, 4);
    b.rod("copper", [-13.6, 2.1, 21.7], [-13.6, 0.95, 21.7], 0.03, 4);
    b.cyl("fire", -15, 0.9, 21.7, 0.12, 0.18, 0.08, 6);
    S.light(-15, 1.2, 21.7, 0xff8a40, 5, 0.9);
    S.glow(-15, 1.0, 21.7, 0xff8a30, 0.6);
    b.box("lamp_green", -18.5, 0.9, 22.0, -17.5, 0.95, 22.3, { seg: false });
    S.glow(-18, 1.0, 22.1, 0x50ff70, 0.8);
    S.light(-18, 1.3, 22.1, 0x50ff70, 5, 0.6);
    S.prop("mattress", -21, 0, 24.5, 0.2, {});
    S.prop("mattress", -12, 0, 24.8, -0.1, {});
    S.anchor("chemlab", -17, 0, 20, PI);

    // ------------------------------------------------------------------
    // EAST WING: Teak Room (x 8..22, z 4..12), Dining Room / raider mess (x 8..22, z 12..26)
    // ------------------------------------------------------------------
    S.floor("parquet", 8, 4, 22, 12, 0, { surface: "wood" });
    S.ceil("teak", 8, 4, 22, 12, H, { col: true });
    S.wallX("teak", 4, 7.8, 22.2, 0, H, 0.4, []);
    S.wallZ("teak", 22, 4, 12, 0, H, 0.4, []);
    w2X(12, 8, 22, H, H, "teak", "silk_red", [DOOR(15, 2.6)]);
    skirt(8, 4, 22, 12, 0, H, "teak");
    for (const x of [11, 15, 19])
      D.bookcase(b, x, 0, 4.35, 0, {
        w: 3.2,
        h: 2.6,
        shelves: 5,
        wood: "teak",
        empty: 0.35,
      });
    D.fireplace(b, S, 21.8, 0, 8, -HP, { key: "teak" });
    D.sofa(b, 16, 0, 9.4, PI, { fabric: "leather", w: 2.2 });
    D.table(b, 16, 0, 7.8, { rect: [1.4, 0.7], top: "teak", leg: "teak" });
    D.chandelier(S, 15, H - 0.6, 8, 0.7, {
      tiers: 1,
      lr: 9,
      li: 0.7,
      chain: 0.4,
    });
    D.label(
      b,
      "coop_teak",
      [
        "THE TEAK ROOM",
        "Carved in Ahmedabad for L. de Forest, 1887",
        "Mr. Carnegie read here.",
        "Now: the Decorator's smoking room.",
      ],
      8.22,
      1.5,
      6,
      0.9,
      0.36,
      HP,
      "label",
    );
    S.floor("parquet", 8, 12, 22, 26, 0, { surface: "wood" });
    S.ceil("plaster_cream", 8, 12, 22, 26, H, { col: true });
    S.wallZ("silk_red", 22, 12, 26, 0, H, 0.4, []);
    S.wallX("silk_red", 26, 7.8, 22.2, 0, H, 0.4, [[19.3, 21.7, 0, 3.0]]); // service stair door
    skirt(8, 12, 22, 26, 0, H, "gold");
    D.table(b, 14.5, 0, 19, {
      rect: [6.5, 1.6],
      top: "wood_dark",
      leg: "wood_dark",
    });
    S.col(11.3, 0, 18.2, 17.7, 0.8, 19.8, { walkable: false });
    for (let i = 0; i < 5; i++)
      for (const s of [-1, 1])
        D.chair(b, 11.8 + i * 1.35, 0, 19 + s * 1.2, s < 0 ? 0 : PI, {
          seat: "velvet",
          toppled: (i + s) % 4 === 0,
        });
    for (let i = 0; i < 7; i++) {
      const rn = P.rng("mess" + i);
      b.cyl(
        rn() < 0.5 ? "rust" : "glass_dark",
        11.8 + rn() * 5.6,
        0.8,
        18.5 + rn() * 1.0,
        0.05,
        0.06,
        0.12 + rn() * 0.2,
        6,
        { noAO: true },
      );
    }
    D.fireplace(b, S, 21.8, 0, 19, -HP, { key: "marble", lit: true });
    b.rod("iron", [21.2, 1.4, 17.9], [21.2, 1.4, 20.1], 0.02, 3);
    b.sphere("skin", 21.2, 1.2, 19, 0.3, { sx: 1.8, sy: 0.7 }); // something roasting on a spit
    D.master(b, 8.22, 3.0, 19, 2.4, 1.8, HP, 4);
    D.poster(b, "cooper_vault", 21.78, 2.2, 14, -HP, 1.1);
    D.chandelier(S, 14.5, H - 0.6, 19, 0.8, {
      tiers: 2,
      lr: 10,
      li: 0.75,
      chain: 0.4,
    });
    S.anchor("mess", 14.5, 0, 22, 0);
    // service stair down to the coal cellar (x 19.3..21.7, from z 26 south)
    S.stairs(
      "concrete",
      20.5,
      26.4 + Math.ceil((0 - BY) / 0.24) * 0.3,
      "n",
      2.4,
      BY,
      0,
      { run: 0.3 },
    );
    const SL = Math.ceil((0 - BY) / 0.24) * 0.3;
    S.wallZ("concrete_dark", 19.1, 26, 26.4 + SL, BY, 3.0, 0.4, []);
    S.wallZ("concrete_dark", 21.9, 26, 26.4 + SL, BY, 3.0, 0.4, []);
    S.ceil("concrete", 19, 26, 22, 26.4 + SL, 3.0, {});
    S.light(20.5, 2.2, 27.5, 0xffc880, 5, 0.5);

    // ------------------------------------------------------------------
    // UPSTAIRS (UY 6): west "Civil Defense Living" gallery + dorm (x -24..-8, z 4..26); east: Carnegie's Library (x 8..22, z 4..26)
    // ------------------------------------------------------------------
    S.floor("carpet", -24, 4, -8, 26, UY, { t: 0.4, surface: "carpet" });
    S.ceil("plaster", -24, 4, -8, 26, UT, { col: true });
    S.wallX("plaster", 4, -24.2, -7.8, UY, UT, 0.4, []);
    S.wallX("plaster", 26, -24.2, -7.8, UY, UT, 0.4, []);
    S.wallZ("plaster", -24, 4, 26, UY, UT, 0.4, []);
    S.wallZ("plaster", -8.1, 22, 26, UY, UT, 0.2, []);
    S.wallX("plaster", 15, -24, -14, UY, UT, 0.3, [[-20, -17.5, 0, 3.0]]);
    // the model sleeper suite (a room-in-a-room in Project Long Winter grey-white with an orange trim band)
    b.box("panel", -23.8, UY, 4.4, -14, UY + 3.2, 5.0, {
      seg: false,
      c: 0xd4d2c8,
    });
    b.box("panel", -14.2, UY, 5, -14, UY + 3.2, 11, {
      seg: false,
      c: 0xd4d2c8,
    });
    b.box("panel", -23.8, UY + 3.2, 4.4, -14, UY + 3.35, 11, {
      seg: false,
      c: 0xe0702a,
    });
    for (const x of [-21.5, -17])
      D.bed(b, x, UY, 7.5, 0, {
        w: 1.0,
        cover: "fabric_white",
        sheet: "fabric_white",
        wood: "metal",
      });
    b.box("paint_orange", -23.6, UY + 1.2, 8.9, -22.3, UY + 2.2, 10.8, {
      seg: false,
    });
    D.sign(
      b,
      "coop_sleepersuite",
      [
        "THE LONG WINTER",
        "A Sleeper Suite for 1967",
        "Sleep now · Wake to tomorrow*",
        "*Tomorrow not guaranteed",
      ],
      "banner",
      -18.9,
      UY + 2.5,
      5.12,
      2.6,
      1.0,
      0,
      { bg: "#d4d2c8", fg: "#c8562a", top: 0.12, tw: 512, th: 196 },
    );
    D.poster(b, "cooper_cryo", -14.0, UY + 1.6, 12, HP, 1.1);
    // raider dorm: mattresses, footlockers, a trophy wall of chairs nailed up
    for (let i = 0; i < 4; i++)
      S.prop("mattress", -22 + i * 3.2, UY, 20 + (i % 2) * 2.4, i * 0.4, {});
    for (let i = 0; i < 5; i++)
      D.chair(b, -23.7, UY + 1.2 + i * 0.55, 17 + i * 0.9, HP + i * 0.3, {
        wood: "wood_dark",
        seat: "fabric",
      });
    b.sphere("lamp_dim", -16, UT - 0.3, 20, 0.12, { ws: 6, hs: 4 });
    S.light(-16, UT - 0.6, 20, 0xffc880, 8, 0.7);
    S.glow(-16, UT - 0.3, 20, 0xffc880, 0.6);
    S.light(-19, UY + 2.4, 8, 0xd8e0ff, 7, 0.6);
    S.anchor("dorm", -16, UY, 21, PI);
    S.anchor("cryo_exhibit", -19, UY, 12, PI);
    // Carnegie's Library (x 8..22, z 4..26): two-storey bookcases, fireplace, the throne
    S.floor("parquet", 8, 4, 22, 26, UY, { t: 0.4, surface: "wood" });
    S.ceil("teak", 8, 4, 22, 26, UT, { col: true });
    S.wallX("oak_dark", 4, 7.8, 22.2, UY, UT, 0.4, []);
    S.wallX("oak_dark", 26, 7.8, 22.2, UY, UT, 0.4, []);
    S.wallZ("oak_dark", 22, 4, 26, UY, UT, 0.4, []);
    S.wallZ("oak_dark", 8.1, 22, 26, UY, UT, 0.2, []);
    skirt(8, 4, 22, 26, UY, UH, "gold");
    for (let z = 6; z <= 24; z += 3.2)
      D.bookcase(b, 21.65, UY, z, -HP, {
        w: 3.0,
        h: 4.2,
        shelves: 8,
        empty: 0.2,
      });
    for (const x of [11, 14.3, 17.6])
      D.bookcase(b, x, UY, 4.35, 0, {
        w: 3.0,
        h: 4.2,
        shelves: 8,
        empty: 0.25,
      });
    for (const x of [11, 14.3, 17.6])
      D.bookcase(b, x, UY, 25.65, PI, {
        w: 3.0,
        h: 4.2,
        shelves: 8,
        empty: 0.3,
      });
    b.rod("iron", [9.5, UY + 3.9, 4.8], [20.5, UY + 3.9, 4.8], 0.02, 4); // ladder rail
    b.rod("wood_dark", [12.5, UY, 5.6], [12.5, UY + 3.9, 4.85], 0.035, 4);
    b.rod("wood_dark", [13.1, UY, 5.6], [13.1, UY + 3.9, 4.85], 0.035, 4);
    for (let k = 1; k < 12; k++)
      b.rod(
        "wood_dark",
        [12.5, UY + k * 0.32, 5.6 - k * 0.062],
        [13.1, UY + k * 0.32, 5.6 - k * 0.062],
        0.02,
        3,
      );
    D.fireplace(b, S, 8.25, UY, 15, HP, { key: "marble_dark", lit: true });
    D.master(b, 8.22, UY + 2.7, 15, 1.4, 1.2, HP, 12);
    D.label(
      b,
      "coop_gospel",
      [
        '"THE MAN WHO DIES RICH',
        'DIES DISGRACED."',
        "— A. Carnegie",
        '(painted over: "MAN WHO DIES POOR DIES ANYWAY")',
      ],
      8.24,
      UY + 1.75,
      12.6,
      1.2,
      0.5,
      HP,
      "label",
    );
    // the Decorator's throne: a wingback chair on a dais of crates, flanked by "exhibits"
    b.box("crate", 16, UY, 13.4, 19.6, UY + 0.5, 16.6, {
      seg: false,
      grime: 0.8,
    });
    S.col(16, UY, 13.4, 19.6, UY + 0.5, 16.6);
    D.chair(b, 18.4, UY + 0.5, 15, -HP, {
      seat: "velvet",
      wood: "gold",
      arms: true,
    });
    b.box("velvet", 18.62, UY + 0.9, 14.7, 18.72, UY + 2.1, 15.3, {
      seg: false,
    });
    D.rug(b, 10, 11, 16, 19, UY + 0.01, "carpet_red");
    D.table(b, 13, UY, 15, { rect: [2.2, 1.1], top: "wood_dark", leg: "gold" });
    for (const z of [12.2, 17.8])
      S.prop("skeleton", 17.8, UY + 0.5, z, -HP, { pose: "sitting" });
    D.chandelier(S, 15, UT - 0.6, 15, 0.9, {
      tiers: 2,
      lr: 12,
      li: 0.9,
      chain: 0.4,
    });
    S.light(11, UY + 1.2, 15, 0xff9a50, 7, 0.8);
    S.anchor("boss", 17.2, UY + 0.5, 15, -HP);
    S.anchor("library", 13, UY, 15, HP);

    // ------------------------------------------------------------------
    // COAL CELLAR (BY): rail track, coal bunker, boiler, the cage; cellar hatch up to the yard
    // ------------------------------------------------------------------
    const CZ0 = 26.4 + SL,
      CX0 = 8,
      CX1 = 26,
      CZ1 = CZ0 + 22;
    b.ground = BY;
    S.floor("concrete_dark", CX0, CZ0, CX1, CZ1, BY);
    S.ceil("concrete", CX0, CZ0, CX1, CZ1, BY + 3.6, { col: true });
    S.wallX("brick_red", CZ0, CX0 - 0.2, CX1 + 0.2, BY, BY + 3.6, 0.4, [
      [19.3, 21.7, 0, 3.0],
    ]);
    S.wallX("brick_red", CZ1, CX0 - 0.2, CX1 + 0.2, BY, BY + 3.6, 0.4, []);
    S.wallZ("brick_red", CX0, CZ0, CZ1, BY, BY + 3.6, 0.4, []);
    S.wallZ("brick_red", CX1, CZ0, CZ1, BY, BY + 3.6, 0.4, [
      [CZ1 - 4.5, CZ1 - 2.0, 0, 3.0],
    ]); // → hatch stair
    // narrow-gauge coal railway down the middle, a tipper cart
    for (const dx of [-0.35, 0.35])
      b.box(
        "rust",
        16 + dx - 0.04,
        BY,
        CZ0 + 1,
        16 + dx + 0.04,
        BY + 0.08,
        CZ1 - 1,
        { seg: false, noAO: true },
      );
    for (let z = CZ0 + 1.2; z < CZ1 - 1; z += 0.6)
      b.box("wood_rotten", 15.45, BY, z - 0.08, 16.55, BY + 0.05, z + 0.08, {
        seg: false,
        noAO: true,
      });
    b.box("rust", 15.4, BY + 0.35, CZ0 + 8, 16.6, BY + 1.2, CZ0 + 9.6, {
      seg: false,
    });
    S.col(15.4, BY, CZ0 + 8, 16.6, BY + 1.2, CZ0 + 9.6, { walkable: false });
    for (const dz of [8.3, 9.3])
      for (const dx of [-0.4, 0.4])
        b.cyl("iron", 16 + dx, BY + 0.2, CZ0 + dz, 0.18, 0.18, 0.06, 8, {
          rz: HP,
        });
    for (let i = 0; i < 20; i++) {
      const rn = P.rng("coal" + i);
      b.rock(
        "paint_black",
        23 + rn() * 2.4,
        BY + 0.2 + rn() * 0.8,
        CZ0 + 2 + rn() * 5,
        0.25 + rn() * 0.3,
        { flat: 0.7 },
      );
    }
    b.box("brick_red", 21.8, BY, CZ0 + 1.5, 22.2, BY + 1.2, CZ0 + 7.5, {
      seg: false,
    });
    S.col(21.8, BY, CZ0 + 1.5, 26, BY + 1.0, CZ0 + 7.5);
    // boiler
    b.cyl("rust", 11, BY, CZ0 + 15, 1.3, 1.3, 2.8, 16);
    S.col(9.7, BY, CZ0 + 13.7, 12.3, BY + 2.8, CZ0 + 16.3, { walkable: false });
    b.rod("rust", [11, BY + 2.8, CZ0 + 15], [11, BY + 3.6, CZ0 + 15], 0.25, 8);
    b.box("iron", 9.6, BY + 0.5, CZ0 + 14.4, 9.7, BY + 1.3, CZ0 + 15.6, {
      seg: false,
    });
    b.cyl("fire", 9.62, BY + 0.9, CZ0 + 15, 0.2, 0.2, 0.02, 8, { rz: HP });
    S.light(9.2, BY + 0.9, CZ0 + 15, 0xff7a30, 5, 0.9);
    S.glow(9.3, BY + 0.9, CZ0 + 15, 0xff7a30, 0.6);
    // the cage (captive) — iron bars against the west wall
    const KX0 = 8.3,
      KX1 = 12.3,
      KZ0 = CZ0 + 3,
      KZ1 = CZ0 + 7;
    for (let z = KZ0; z <= KZ1 + 0.01; z += 0.25)
      b.rod("iron", [KX1, BY, z], [KX1, BY + 2.6, z], 0.02, 4, { noAO: true });
    for (let x = KX0; x <= KX1 + 0.01; x += 0.25) {
      b.rod("iron", [x, BY, KZ0], [x, BY + 2.6, KZ0], 0.02, 4, { noAO: true });
      b.rod("iron", [x, BY, KZ1], [x, BY + 2.6, KZ1], 0.02, 4, { noAO: true });
    }
    b.box("iron", KX0, BY + 2.6, KZ0, KX1, BY + 2.7, KZ1, { seg: false });
    S.col(KX1 - 0.05, BY, KZ0, KX1 + 0.05, BY + 2.7, KZ1, { walkable: false });
    S.col(KX0, BY, KZ0 - 0.05, KX1, BY + 2.7, KZ0 + 0.05, { walkable: false });
    S.col(KX0, BY, KZ1 - 0.05, KX1, BY + 2.7, KZ1 + 0.05, { walkable: false });
    b.box(
      "iron",
      KX1 - 0.02,
      BY + 1.0,
      KZ0 + 1.6,
      KX1 + 0.1,
      BY + 1.3,
      KZ0 + 1.9,
      { seg: false },
    ); // padlock plate
    S.anchor("cage", KX1 + 0.9, BY, KZ0 + 1.75, HP);
    S.anchor("prisoner", 9.8, BY, KZ0 + 2, -HP);
    for (let x = 12; x <= 22; x += 5) {
      b.sphere("lamp_dim", x, BY + 3.35, CZ0 + 11, 0.1, { ws: 6, hs: 4 });
      S.light(x, BY + 3.0, CZ0 + 11, 0xffc880, 7, 0.7);
    }
    S.glow(12, BY + 3.3, CZ0 + 11, 0xffc880, 0.5);
    S.anchor("cellar", 16, BY, CZ0 + 12, 0);
    // hatch: short stair up east to a door (leads out to the back yard)
    const hz = CZ1 - 3.25;
    S.stairs("concrete", CX1 + 0.2, hz, "e", 2.2, BY, BY + 2.4, { run: 0.3 });
    const HL = Math.ceil(2.4 / 0.24) * 0.3;
    S.floor(
      "concrete",
      CX1 + 0.2 + HL,
      hz - 1.3,
      CX1 + 1.8 + HL,
      hz + 1.3,
      BY + 2.4,
    );
    S.wallX(
      "concrete_dark",
      hz - 1.3,
      CX1,
      CX1 + 2 + HL,
      BY,
      BY + 5.2,
      0.3,
      [],
    );
    S.wallX(
      "concrete_dark",
      hz + 1.3,
      CX1,
      CX1 + 2 + HL,
      BY,
      BY + 5.2,
      0.3,
      [],
    );
    S.wallZ(
      "concrete_dark",
      CX1 + 1.9 + HL,
      hz - 1.3,
      hz + 1.3,
      BY,
      BY + 5.2,
      0.3,
      [],
    );
    S.ceil("concrete", CX1, hz - 1.3, CX1 + 2 + HL, hz + 1.3, BY + 5.2, {});
    b.box(
      "rust",
      CX1 + 1.6 + HL,
      BY + 2.4,
      hz - 0.9,
      CX1 + 1.72 + HL,
      BY + 4.6,
      hz + 0.9,
      { seg: false },
    );
    S.light(CX1 + 1 + HL, BY + 4.2, hz, 0xc8d8ff, 4, 0.4);
    S.anchor("hatch", CX1 + 1.1 + HL, BY + 2.4, hz, -HP);
    b.ground = 0;
    // combat spawns + loot anchors
    S.anchor("spawn1", -16, 0, 11, 0);
    S.anchor("spawn2", -17, 0, 23, PI);
    S.anchor("spawn3", 14.5, 0, 16, 0);
    S.anchor("spawn4", -16, UY, 18, PI);
    S.anchor("spawn5", 12, UY, 20, 0);
    S.anchor("spawn6", 18, BY, CZ0 + 13, 0);
    return {
      S,
      hatch: { x: CX1 + 1.5 + HL, y: BY + 3.6, z: hz },
      hatchW: S.W(CX1 + 0.6 + HL, BY + 2.4, hz),
      CZ0,
      BY,
      UY,
    };
  }

