// play-inline-282 05 — box
// Lines 734-2526 of readable/play-inline-282.pretty.js (statement-aligned).
  function buildInterior() {
    const O = P.I("ed_sullivan");
    const S = P.site("es_int", {
      ox: O.x,
      oy: O.y + LIFT,
      oz: O.z,
      lit: true,
      ambient: 0x5a5468,
      ambI: 0.34,
      interiorKey: "ed_sullivan",
      grime: 0.5,
    });
    const b = S.b;
    const r = P.rng("es_int");
    const onAir = []; // meshes toggled by "Dead Air"

    // ================= LOBBY (x 22..36, z -9..9) =================
    S.room({
      x0: 22,
      z0: -9,
      x1: 36,
      z1: 9,
      y: 0,
      h: 10,
      wall: "plaster_rose",
      floor: "tile_check",
      ceil: false,
      skip: "w",
      trim: "gilt",
      holes: { e: [[-1.4, 1.4, 0, 3.2]] },
      frame: "gilt",
    });
    // west wall of the lobby = auditorium back wall (two doorways + upper openings)
    S.wallZ(
      "plaster_rose",
      22,
      -9,
      9,
      0,
      Y_UP,
      0.4,
      [
        [-4.8, -2.2, 0, 3.4],
        [2.2, 4.8, 0, 3.4],
      ],
      { frame: "gilt" },
    );
    // upper floor slab (lobby ceiling) with the stair hole x 24..32.6, z 5.1..8.7
    S.floor("parquet", 22, -9, 36, 5.1, Y_UP, { under: "plaster_gilt" });
    S.floor("parquet", 22, 5.1, 24, 9, Y_UP, { under: "plaster_gilt" });
    S.floor("parquet", 32.6, 5.1, 36, 9, Y_UP, { under: "plaster_gilt" });
    // coffered lobby ceiling beams (gilt) under the slab
    for (let x = 23.5; x < 36; x += 3)
      b.box("gilt", x - 0.12, Y_UP - 0.75, -9, x + 0.12, Y_UP - 0.3, 5.1, {
        seg: false,
        noAO: true,
      });
    for (let z = -7; z < 5; z += 3)
      b.box("gilt", 22, Y_UP - 0.7, z - 0.1, 36, Y_UP - 0.35, z + 0.1, {
        seg: false,
        noAO: true,
      });
    D.chandelier(S, 27, Y_UP - 0.9, -2, 0.9, {
      tiers: 2,
      chain: 0.5,
      li: 0.9,
      lr: 10,
    });
    D.chandelier(S, 32.5, Y_UP - 0.9, -2, 0.9, {
      tiers: 2,
      chain: 0.5,
      dark: true,
      broken: true,
    });
    D.rug(b, 23, -1.5, 35.5, 1.5, 0.01, "carpet_red");
    // grand stair up (south side), gilt balustrade
    S.stairs("marble_dark", 24, 6.9, "e", 3.2, 0, Y_UP, {
      rail: "gilt",
      railSides: [-1],
      nosing: "gilt",
      solid: false,
      soffit: "plaster_rose",
    });
    {
      const n = Math.ceil(Y_UP / 0.24),
        rise = Y_UP / n;
      for (let i = 0; i < n; i++) {
        b.box(
          "carpet_red",
          24 + i * 0.3 - 0.01,
          (i + 1) * rise,
          6.1,
          24 + (i + 1) * 0.3 + 0.01,
          (i + 1) * rise + 0.02,
          7.7,
          { seg: false, noAO: true },
        );
        b.box(
          "carpet_red",
          24 + i * 0.3 - 0.02,
          i * rise,
          6.1,
          24 + i * 0.3,
          (i + 1) * rise + 0.02,
          7.7,
          { seg: false, noAO: true },
        );
      }
    }
    S.rail(
      "gilt",
      [
        [24, 5.05],
        [32.6, 5.05],
      ],
      Y_UP,
      1.0,
      { baluster: true, step: 0.4 },
    );
    S.rail(
      "gilt",
      [
        [24, 5.1],
        [24, 8.7],
      ],
      Y_UP,
      1.0,
      { baluster: true, step: 0.4 },
    );
    // box office (north-east corner): brass cage + counter + ticket window
    b.box("wood_dark", 29, 0, -9, 29.2, 3.0, -5.6);
    b.box("wood_dark", 29, 0, -5.8, 35.8, 1.1, -5.6);
    b.box("marble_dark", 28.9, 1.1, -5.95, 35.85, 1.18, -5.45, {
      seg: false,
      noAO: true,
    });
    for (let x = 29.3; x < 35.8; x += 0.18)
      b.rod("gold", [x, 1.18, -5.7], [x, 2.8, -5.7], 0.012, 4, { noAO: true });
    b.box("gold", 29, 2.8, -5.8, 35.8, 3.0, -5.6, { seg: false });
    S.col(29, 0, -5.9, 35.8, 3.0, -5.5, { walkable: false });
    S.col(29, 0, -9, 29.3, 3.0, -5.6, { walkable: false });
    const bo = P.texMat(
      "es_boxoffice",
      P.signTex("es_boxoffice", ["BOX OFFICE"], "gilt", 512, 96),
      { emissive: 0.15 },
    );
    b.quad(bo, 32.4, 3.3, -5.55, 3.4, 0.6, { ry: 0 });
    // ON AIR sign over the auditorium doors
    for (const zc of [-3.5, 3.5]) {
      b.box("iron", 22.25, 3.6, zc - 0.7, 22.45, 4.1, zc + 0.7, { seg: false });
      onAir.push({
        key: "onair",
        x: 22.47,
        y: 3.85,
        z: zc,
        w: 1.3,
        h: 0.42,
        ry: HP,
      });
    }
    // posters and portraits of the stars
    for (let i = 0; i < 4; i++) {
      const pk = P.texMat("es_poster" + i, posterTex(i), { rough: 0.9 });
      b.quad(pk, 24 + i * 3.2, 1.8, 8.78, 1.1, 1.65, { ry: PI });
    }
    b.box("gold", 23.7, 0.9, 8.75, 34.5, 2.8, 8.8, { seg: false, noAO: true });
    for (const z of [-3, 3])
      D.painting(b, 35.8, 2.3, z * 1.9, 1.2, 1.6, -HP, z > 0 ? 1 : 3);
    // velvet rope stanchions + a toppled one
    for (let i = 0; i < 5; i++) {
      const z = -4.6 + i * 1.1;
      b.cyl("gold", 30.2, 0, z, 0.04, 0.05, 0.95, 6);
      b.sphere("gold", 30.2, 0.98, z, 0.06, { ws: 5, hs: 4 });
      b.cyl("gold", 30.2, 0, z, 0.18, 0.18, 0.04, 8);
    }
    b.rod("velvet", [30.2, 0.85, -4.6], [30.2, 0.85, -0.2], 0.03, 4, {
      noAO: true,
    });
    b.rod("velvet", [30.2, 0.85, -0.2], [30.6, 0.1, 0.6], 0.03, 4, {
      noAO: true,
    });
    // skeleton queue: three at the box office window, and papers
    S.prop("skeleton", 33.5, 0, -4.6, PI, { pose: "lying", parent: S.root });
    S.prop("skeleton", 31.4, 0, -4.8, 0.3, { pose: "sitting", parent: S.root });
    D.papers(b, 31, 0, -3.5, 2.2, 16);
    D.shards(b, 34.5, 0, 0.5, 1.2, 12);
    // wainscot + moulded panels + STUDIO 50 lettering over the house doors
    for (const [x0, z0, x1, z1] of [
      [22.3, -8.85, 29, -8.7],
      [35.7, -8.8, 35.85, -1.6],
      [35.7, 1.6, 35.85, 8.8],
    ])
      b.box("wood_oak", x0, 0, z0, x1, 1.15, z1, { seg: false });
    b.box("gilt", 22.3, 1.15, -8.9, 29, 1.22, -8.65, { seg: false });
    b.box("gilt", 35.65, 1.15, -8.8, 35.9, 1.22, 8.8, { seg: false });
    P.wallPanels(b, "gilt", "x", -8.85, 22.6, 28.8, 1.6, 3.8, 1, {
      w: 1.7,
      gap: 0.4,
      fill: "plaster_red",
    });
    P.wallPanels(b, "gilt", "z", 35.85, -8.5, -2.0, 1.6, 3.8, -1, {
      w: 1.6,
      gap: 0.5,
      fill: "plaster_red",
    });
    P.wallPanels(b, "gilt", "z", 35.85, 2.0, 8.5, 1.6, 3.8, -1, {
      w: 1.6,
      gap: 0.5,
      fill: "plaster_red",
    });
    const s50 = P.texMat(
      "es_studio50",
      P.signTex("es_studio50", ["S T U D I O   5 0"], "gilt", 1024, 128),
      { rough: 0.5, emissive: 0.12 },
    );
    b.quad(s50, 22.24, 4.9, 0, 6.5, 0.8, { ry: HP });
    // sconces
    for (const z of [-7, 7]) D.sconce(S, 35.75, 2.6, z, -HP, { dark: z > 0 });
    for (const x of [25, 34]) D.sconce(S, x, 2.6, -8.75, 0);
    S.light(34.5, 2.2, 0, 0xffe0b0, 7, 0.5); // daylight from the doors
    // security desk + usher robot "station"
    b.box("wood_dark", 24.5, 0, -7.8, 27.5, 1.0, -6.8);
    b.box("marble_dark", 24.4, 1.0, -7.9, 27.6, 1.06, -6.7, { seg: false });
    S.col(24.5, 0, -7.8, 27.5, 1.06, -6.8, { walkable: false });
    S.prop("terminal", 26.2, 1.06, -7.3, PI, {
      terminalId: "pt_es_security",
      mount: "bare",
      parent: S.root,
    });
    S.anchor("security", 26.2, 0, -6.2, PI);
    S.container("Cash Box", 33.8, 1.18, -6.2, {
      loot: "cash_register",
      kind: "cash_register",
    });

    // ================= AUDITORIUM (house x -1..22, z -16..16, ceiling 14) =================
    // side + ceiling walls
    S.wallX("plaster_rose", -16, -1, 22, Y_PIT, 14, 0.5, [], { ground: Y_PIT });
    S.wallX("plaster_rose", 16, -1, 22, Y_PIT, 14, 0.5, [], { ground: Y_PIT });
    S.wallZ("plaster_rose", 22, -16, 16, Y_UP, 14, 0.4, [
      [-8, -1, 1.0, 2.6],
      [1.8, 4.4, 0, 2.4],
    ]); // control window + balcony door
    S.wallZ("plaster_rose", 22, -16, -9, 0, Y_UP, 0.4, []);
    S.wallZ("plaster_rose", 22, 9, 16, 0, Y_UP, 0.4, []);
    S.wallZ("plaster_rose", 22, -16, 16, Y_PIT, 0, 0.4, []);
    // back cross-aisle (x 19..22) at lobby level
    S.floor("carpet_red", 19, -16, 22, 16, 0, { surface: "carpet", t: 0.4 });
    // raked rows stepping down toward the stage
    const NR = 14;
    for (let i = 0; i < NR; i++) {
      const xa = 18 - i,
        xb = 19 - i,
        y = -0.15 * (i + 1);
      b.box("carpet_red", xa, Y_PIT - 0.3, -16, xb, y, 16, {
        segLen: 2.5,
        grime: 0.4,
        ground: y,
      });
      S.col(xa, Y_PIT - 0.3, -16, xb, y, 16, { surface: "carpet" });
      // seat banks: centre z -6..6, sides 8..15.5 / -15.5..-8 (aisles at |z| 6..8)
      const skip = (x, z) => i >= 2 && i <= 4 && z > 9 && z < 13; // blast crater seats
      for (const [z0, z1] of [
        [-15.4, -8.2],
        [-5.8, 5.8],
        [8.2, 15.4],
      ])
        K.seatLine(b, xa + 0.5, z0, xa + 0.5, z1, y, -HP, {
          missing: 0.12,
          skip,
        });
    }
    // front camera floor (x 1..5) with the musicians' hatch x 1..3.6, z -0.9..0.9
    S.floor("concrete_dark", 3.6, -16, 5, 16, Y_PIT, { surface: "concrete" });
    S.floor("concrete_dark", 1, -16, 3.6, -0.9, Y_PIT, { surface: "concrete" });
    S.floor("concrete_dark", 1, 0.9, 3.6, 16, Y_PIT, { surface: "concrete" });
    S.floor("concrete_dark", -1, -16, 1, -10, Y_PIT, {});
    S.floor("concrete_dark", -1, 10, 1, 16, Y_PIT, {});
    for (const pts of [
      [
        [1.05, -0.95],
        [3.6, -0.95],
      ],
      [
        [1.05, 0.95],
        [3.6, 0.95],
      ],
      [
        [1.05, -0.95],
        [1.05, 0.95],
      ],
    ])
      S.rail("iron", pts, Y_PIT, 1.0, {});
    b.box("iron", 1.0, Y_PIT - 0.02, -1.0, 3.7, Y_PIT + 0.02, -0.9, {
      seg: false,
    });
    // cable trays + gaffer tape lines on the camera floor
    for (let k = 0; k < 6; k++)
      b.rod(
        "rubber",
        [1.2 + r() * 3, Y_PIT + 0.02, -15 + k * 5],
        [1.2 + r() * 3.5, Y_PIT + 0.02, -12 + k * 5.2],
        0.03,
        4,
        { noAO: true },
      );
    // TV cameras aimed at the set
    K.tvCamera(b, 4.3, Y_PIT, -5.2, -HP + 0.2, {
      tally: true,
      body: "paint_blue",
    });
    K.tvCamera(b, 4.4, Y_PIT, 5.4, -HP - 0.25, {
      tally: true,
      body: "paint_blue",
    });
    K.tvCamera(b, 2.2, Y_PIT, -12.5, -HP + 0.6, {
      body: "paint_blue",
      tilt: 0.3,
    });
    K.boom(b, 2.2, Y_PIT, 11.5, -HP - 0.5);
    for (const [x, z] of [
      [4.3, -5.2],
      [4.4, 5.4],
    ])
      onAir.push({
        key: "tally",
        x: x - 0.4,
        y: Y_PIT + 1.72,
        z,
        w: 0.1,
        h: 0.1,
        ry: -HP,
      });
    // gothic walls: pilasters + pointed blind arches + sconces
    for (const zs of [-1, 1]) {
      const zw = zs * 15.75;
      for (let x = 1; x <= 21; x += 4) {
        b.box(
          "plaster_gilt",
          x - 0.35,
          Y_PIT,
          zw - zs * 0.3,
          x + 0.35,
          13.2,
          zw,
          { segLen: 3, ground: Y_PIT },
        );
        b.box("gilt", x - 0.45, 12.6, zw - zs * 0.4, x + 0.45, 13.2, zw, {
          seg: false,
        });
      }
      for (let x = 3; x <= 19; x += 4) {
        const shp = K.gothicShape(1.5);
        const M = P.m4(x, 7.0, zw - zs * 0.02, zs > 0 ? PI : 0);
        b.extrude("gilt", shp, 0.12, M, { curve: 4 });
        b.box(
          "plaster_red",
          x - 1.45,
          1.2,
          zw - zs * 0.08,
          x + 1.45,
          7.0,
          zw - zs * 0.02,
          { seg: false, noAO: true },
        );
        D.sconce(S, x, 3.4, zw - zs * 0.05, zs > 0 ? PI : 0, {
          dark: r() < 0.5,
          r: 7,
          i: 0.8,
          color: 0xffc070,
        });
      }
    }
    // ceiling: gilt coffers + ribs + central rosette
    S.ceil("plaster_gilt", -1, -16, 22, 16, 14);
    for (let x = 0; x <= 22; x += 3.7)
      b.box("gilt", x - 0.18, 13.3, -16, x + 0.18, 13.93, 16, {
        seg: false,
        noAO: true,
      });
    for (let z = -12; z <= 12; z += 4)
      b.box("gilt", -1, 13.4, z - 0.15, 22, 13.93, z + 0.15, {
        seg: false,
        noAO: true,
      });
    b.cyl("gilt", 11, 13.3, 0, 2.6, 3.0, 0.6, 20, { noAO: true });
    D.chandelier(S, 11, 12.6, 0, 1.6, {
      tiers: 3,
      chain: 0.6,
      dark: true,
      broken: true,
    });
    // a hole in the ceiling with fallen plaster below (dim shaft of light)
    b.box("rubble", 13.5, -0.9, 10.2, 16.5, -0.6, 12.6, {
      rz: 0.1,
      seg: false,
    });
    D.rubble(S, 15, -0.9, 11.5, 1.6, { n: 7 });
    S.light(15, 6, 11.5, 0xb8c8a0, 9, 0.45);
    S.glow(15, 13.2, 11.5, 0xc8d8b0, 2.6, { dayFactor: 1 });
    // exit signs
    for (const [x, z, ry] of [
      [21.7, -12, -HP],
      [21.7, 12, -HP],
    ]) {
      b.box("lamp_red", x - 0.05, 2.9, z - 0.35, x + 0.05, 3.15, z + 0.35, {
        seg: false,
      });
      S.light(x - 0.3, 2.8, z, 0xff4030, 3, 0.5);
    }

    // ================= BALCONY (x 12..22, z -15.5..15.5) =================
    const NB = 8;
    for (let j = 0; j < NB; j++) {
      const xa = 12 + j * 1.12,
        xb = xa + 1.12,
        y = 4.6 + j * 0.24;
      b.box("carpet_red", xa, 4.05, -15.6, xb, y, 15.6, {
        segLen: 2.5,
        ground: y,
      });
      S.col(xa, 4.05, -15.6, xb, y, 15.6, { surface: "carpet" });
      if (j > 0)
        for (const [z0, z1] of [
          [-15.2, -1.2],
          [1.2, 15.2],
        ])
          K.seatLine(b, xa + 0.55, z0, xa + 0.55, z1, y, -HP, {
            missing: 0.15,
            seat: "seat_red",
          });
    }
    S.floor("carpet_red", 20.96, -15.6, 22, 15.6, Y_UP, { surface: "carpet" });
    b.box("plaster_gilt", 12, 3.92, -15.6, 22, 4.05, 15.6, { noAO: true });
    for (let x = 13.4; x < 21.5; x += 2.7)
      for (let z = -12; z <= 12; z += 6) {
        b.cyl("gilt", x, 3.8, z, 0.22, 0.26, 0.12, 10, { noAO: true });
        b.sphere(
          ((x * 3 + z) | 0) % 4 === 0 ? "glass_dark" : "lamp_dim",
          x,
          3.78,
          z,
          0.13,
          { ws: 6, hs: 4, noAO: true, noBake: true },
        );
        if (((x * 3 + z) | 0) % 4 !== 0)
          S.light(x, 3.2, z, 0xffd8a0, 4.5, 0.45);
      }
    // balcony front parapet (gilt)
    b.box("plaster_gilt", 11.75, 3.6, -15.6, 12.1, 5.65, 15.6, { segLen: 2 });
    b.box("gilt", 11.65, 5.6, -15.6, 12.2, 5.72, 15.6, { seg: false });
    b.box("gilt", 11.6, 3.55, -15.6, 12.15, 3.9, 15.6, { seg: false });
    S.col(11.7, 4.0, -15.6, 12.1, 5.7, 15.6, { walkable: false });
    for (let z = -14; z <= 14; z += 4) {
      b.sphere("lamp_dim", 11.55, 3.4, z, 0.1, { ws: 5, hs: 4, noAO: true });
      if (z % 8 === 2) S.light(11.2, 3.2, z, 0xffd8a0, 5, 0.5);
    }
    S.anchor("balcony", 17, 5.8, 0, HP);
    S.anchor("spawn2", 13.2, 4.84, -6, HP);

    // ================= PROSCENIUM + STAGE HOUSE =================
    // proscenium wall (x -1.5..-0.5), opening z -10..10, y -1.0..9 (+ pointed arch head)
    S.wallZ(
      "plaster_gilt",
      -1,
      -16,
      16,
      Y_PIT,
      14,
      1.0,
      [[-10, 10, Y_STAGE - Y_PIT, 9 - Y_PIT]],
      { ground: Y_PIT },
    );
    b.box("gilt", -0.55, 9.0, -10.6, 0.05, 9.7, 10.6, { seg: false });
    b.box("gilt", -0.5, 9.7, -9.4, 0.0, 10.0, 9.4, { seg: false });
    b.cyl("gilt", -0.3, 11.6, 0, 1.3, 1.3, 0.3, 16, { rz: HP, noAO: true });
    b.cyl("plaster_red", -0.12, 11.6, 0, 0.95, 0.95, 0.1, 16, {
      rz: HP,
      noAO: true,
    });
    for (const s of [-1, 1])
      b.box("gilt", -0.45, 10.4, s * 3.2 - 1.6, -0.2, 10.7, s * 3.2 + 1.6, {
        rx: s * 0.25,
        seg: false,
      });
    for (const s of [-1, 1]) {
      b.box("gilt", -0.5, Y_STAGE, s * 10 - 0.5, 0.0, 9, s * 10 + 0.5, {
        seg: false,
      });
      b.box("gilt", -0.55, 8.6, s * 10 - 0.7, 0.05, 9.1, s * 10 + 0.7, {
        seg: false,
      });
    }
    // house curtain (torn, half drawn) + valance
    for (const s of [-1, 1]) {
      const g = new THREE.PlaneGeometry(5.5, 9.4, 12, 1);
      const p = g.attributes.position;
      for (let v = 0; v < p.count; v++)
        p.setZ(v, Math.sin(p.getX(v) * 3.2) * 0.25);
      b.geo("curtain", g, P.m4(-1.8, Y_STAGE + 4.7, s * 7.4, HP), {
        uv: "box",
        noAO: true,
      });
    }
    b.box("curtain", -1.9, 8.2, -10, -1.6, 9.0, 10, { seg: false });
    // stage floor (x -16..-1) + apron (x -1..1)
    S.floor("wood", -16, -14, -1, 14, Y_STAGE, {
      surface: "wood",
      under: "wood_dark",
    });
    S.floor("wood", -1, -10, 1, 10, Y_STAGE, { surface: "wood", t: 1.1 });
    b.box("wood_dark", 0.95, Y_PIT, -10, 1.02, Y_STAGE - 0.02, 10, {
      seg: false,
    });
    for (let z = -9; z <= 9; z += 1.5) {
      b.sphere(
        r() < 0.3 ? "glass_dark" : "lamp_dim",
        1.05,
        Y_STAGE - 0.1,
        z,
        0.05,
        { ws: 5, hs: 4, noAO: true },
      );
    }
    // steps from the camera floor up to the apron
    for (const s of [-1, 1])
      S.stairs("wood", 2.6, s * 8.6, "w", 1.8, Y_PIT, Y_STAGE, { run: 0.3 });
    // stage-house walls (fly tower up to 16)
    S.wallX("brick_red", -14, -16, -1, Y_STAGE, 16, 0.5, [], {
      ground: Y_STAGE,
    });
    S.wallX("brick_red", 14, -16, -1, Y_STAGE, 16, 0.5, [], {
      ground: Y_STAGE,
    });
    S.wallZ(
      "brick_red",
      -16,
      -16,
      16,
      Y_STAGE,
      16,
      0.5,
      [
        [-12.4, -10.4, 0, 3.2],
        [10.4, 12.4, 0, 3.2],
      ],
      { frame: "wood_dark" },
    );
    S.ceil("concrete_dark", -16, -14, -1, 14, 16);
    // fly gallery rope rail + grid
    b.box("wood_dark", -15.7, 7.5, 12.6, -1.5, 7.7, 13.7, { seg: false });
    for (let x = -15; x < -2; x += 0.35)
      b.rod("fabric", [x, 7.7, 13.2], [x + 0.05, 15.8, 13.2], 0.01, 3, {
        noAO: true,
      });
    for (let x = -14.5; x <= -2; x += 1.5)
      b.rod("iron", [x, 15.4, -14], [x, 15.4, 14], 0.04, 4, { noAO: true });
    // lighting battens over the stage (some lamps still lit — the set is live on emergency power)
    for (const x of [-3.2, -6.5, -9.8])
      K.batten(b, [x, -10], [x, 10], 9.6, {
        lit: true,
        litFrac: 0.45,
        ry: HP,
        lineH: 5.8,
      });
    S.light(-6, 7.5, 0, 0xd8e4ff, 14, 1.25);
    S.light(-6, 7.5, -7, 0x8ab0ff, 9, 0.7);
    S.light(-6, 7.5, 7, 0xffc8e8, 9, 0.6);
    S.glow(-3.2, 9.1, 0, 0xe8f0ff, 3.2);
    S.light(-8.5, 3.2, -2.5, 0xfff0e0, 7, 0.9); // set key lights (desk / couch)
    S.light(-8.5, 3.2, 3.5, 0xffe0f0, 7, 0.8);
    S.light(-10, 3.0, 9.5, 0xffd8a0, 7, 0.8); // band stand
    S.glow(-6.5, 9.1, -4, 0xa8c4ff, 2.4);
    S.glow(-6.5, 9.1, 4, 0xffd0f0, 2.4);

    // ---------- THE CIVIL DEFENSE BROADCAST SET: "THE TOMORROW HOUR" ----------
    // painted skyline backdrop + the giant Civil Defense emblem (the show's sponsor)
    const bd = P.texMat(
      "es_backdrop",
      P.canvasTex("pt_es_backdrop", 1024, 512, (ctx, w, h) => {
        const rr = P.rng("esbd");
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#0a1430");
        g.addColorStop(0.7, "#23407a");
        g.addColorStop(1, "#6a86b8");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 180; i++) {
          ctx.fillStyle = "rgba(255,255,240," + rr() * 0.8 + ")";
          ctx.fillRect(rr() * w, rr() * h * 0.55, 2, 2);
        }
        // skyline silhouettes with lit windows
        let x = 0;
        while (x < w) {
          const bw = 30 + rr() * 60,
            bh = 90 + rr() * 260;
          ctx.fillStyle = "#0c1020";
          ctx.fillRect(x, h - bh, bw, bh);
          if (rr() < 0.25) {
            ctx.beginPath();
            ctx.moveTo(x + bw * 0.3, h - bh);
            ctx.lineTo(x + bw * 0.5, h - bh - 60);
            ctx.lineTo(x + bw * 0.7, h - bh);
            ctx.fill();
          }
          for (let yy = h - bh + 10; yy < h - 10; yy += 14)
            for (let xx = x + 5; xx < x + bw - 6; xx += 10)
              if (rr() < 0.35) {
                ctx.fillStyle = rr() < 0.8 ? "#f8d890" : "#ffffff";
                ctx.fillRect(xx, yy, 4, 6);
              }
          x += bw + 4;
        }
        // the Empire State silhouette in the middle
        ctx.fillStyle = "#10162a";
        ctx.fillRect(w * 0.48, h * 0.25, 44, h * 0.75);
        ctx.fillRect(w * 0.49, h * 0.15, 26, 60);
        ctx.fillRect(w * 0.497, h * 0.02, 6, 80);
        P.blotches(ctx, w, h, rr, 40, 0.3);
      }),
      { emissive: 0.45 },
    );
    b.quad(bd, -13.6, Y_STAGE + 5, 0, 26, 12, { ry: HP });
    const gearTex = P.canvasTex(
      "pt_es_emblem2",
      512,
      512,
      (ctx, w, h) => {
        // the Civil Defense emblem (sponsor of the show): blue ring, white disc, red triangle with "CD"
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "#23407a";
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 236, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#ecebe2";
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 206, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#c8302a";
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2 - 170);
        ctx.lineTo(w / 2 + 150, h / 2 + 90);
        ctx.lineTo(w / 2 - 150, h / 2 + 90);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ecebe2";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 110px " + P.FONTS.DECO;
        ctx.fillText("CD", w / 2, h / 2 + 10);
        ctx.fillStyle = "#23407a";
        ctx.font = "bold 40px " + P.FONTS.DECO;
        ctx.fillText("CIVIL DEFENSE", w / 2, h / 2 + 150);
      },
      { clamp: true },
    );
    const gear = P.texMat("es_gearlogo", gearTex, {
      transparent: true,
      emissive: 0.7,
    });
    b.quad(gear, -13.3, Y_STAGE + 6.2, 0, 6.2, 6.2, { ry: HP });
    S.light(-12.4, Y_STAGE + 6, 0, 0xffe08a, 7, 0.6);
    // title sign "THE TOMORROW HOUR" on a curved arch of bulbs
    const tt = P.texMat(
      "es_title",
      P.signTex("es_title", ["THE TOMORROW HOUR"], "neon", 1024, 128, {
        fg: "#8ad8ff",
      }),
      { emissive: 1.1, rough: 0.4 },
    );
    b.box(
      "paint_blue",
      -12.9,
      Y_STAGE + 2.35,
      -6.2,
      -12.7,
      Y_STAGE + 3.25,
      6.2,
      { seg: false },
    );
    b.quad(tt, -12.66, Y_STAGE + 2.8, 0, 12, 1.5, { ry: HP });
    K.bulbs(
      b,
      [-12.6, Y_STAGE + 3.35, -6.2],
      [-12.6, Y_STAGE + 3.35, 6.2],
      0.3,
    );
    // mock family-shelter hatch stage left (a round Civil Defense shelter door) + riser platforms
    b.cyl("cryo_grey", -11.8, Y_STAGE + 2.9, -9.2, 2.2, 2.2, 0.4, 24, {
      rz: HP,
      noAO: true,
    });
    b.cyl("cryo_orange", -11.55, Y_STAGE + 2.9, -9.2, 1.75, 1.75, 0.12, 24, {
      rz: HP,
      noAO: true,
    });
    b.cyl("glass_dark", -11.45, Y_STAGE + 2.9, -9.2, 1.3, 1.3, 0.1, 20, {
      rz: HP,
      noAO: true,
    });
    const n120 = P.texMat(
      "es_lw2",
      P.signTex("es_lw2", ["FAMILY", "SHELTER"], "default", 256, 256, {
        bg: "#d4d2c8",
        fg: "#c8562a",
      }),
    );
    b.quad(n120, -11.38, Y_STAGE + 1.15, -9.2, 1.1, 1.1, { ry: HP });
    b.box("wood", -13.5, Y_STAGE, -5.5, -9.5, Y_STAGE + 0.45, 5.5, {
      seg: false,
    });
    S.col(-13.5, Y_STAGE, -5.5, -9.5, Y_STAGE + 0.45, 5.5, { surface: "wood" });
    b.box("cryo_grey", -9.55, Y_STAGE + 0.05, -5.5, -9.45, Y_STAGE + 0.4, 5.5, {
      seg: false,
    });
    // host desk with the skeleton host, guest couch, stand mic
    b.box(
      "cryo_grey",
      -11.6,
      Y_STAGE + 0.45,
      -4.2,
      -10.4,
      Y_STAGE + 1.35,
      -1.2,
    );
    b.box(
      "cryo_orange",
      -11.7,
      Y_STAGE + 1.35,
      -4.3,
      -10.3,
      Y_STAGE + 1.43,
      -1.1,
      { seg: false },
    );
    S.col(-11.6, Y_STAGE + 0.45, -4.2, -10.4, Y_STAGE + 1.43, -1.2, {
      walkable: false,
    });
    D.chair(b, -12.2, Y_STAGE + 0.45, -2.7, HP, {
      seat: "leather",
      wood: "chrome",
    });
    S.prop("skeleton", -12.2, Y_STAGE + 0.45, -2.7, -HP, {
      pose: "seated",
      parent: S.root,
    });
    b.box("paper", -11.2, Y_STAGE + 1.43, -3.4, -10.9, Y_STAGE + 1.45, -3.0, {
      seg: false,
      noAO: true,
    });
    K.standMic(b, -10.8, Y_STAGE + 1.43, -2.2, HP);
    D.sofa(b, -11.8, Y_STAGE + 0.45, 2.4, HP, { fabric: "seat_blue", w: 2.4 });
    b.cyl("chrome", -10.3, Y_STAGE + 0.45, 2.4, 0.35, 0.35, 0.05, 12);
    b.cyl("chrome", -10.3, Y_STAGE + 0.45, 2.4, 0.03, 0.03, 0.45, 6);
    b.cyl("glass", -10.3, Y_STAGE + 0.95, 2.4, 0.3, 0.3, 0.02, 12, {
      noAO: true,
    });
    S.prop("skeleton", -11.8, Y_STAGE + 0.45, 1.8, -HP, {
      pose: "seated",
      parent: S.root,
    });
    // band stand stage right: risers, music stands, drum kit, upright bass, piano
    b.box("cryo_grey", -13.8, Y_STAGE, 6.4, -9.9, Y_STAGE + 0.35, 13.6, {
      seg: false,
    });
    S.col(-13.8, Y_STAGE, 6.4, -9.9, Y_STAGE + 0.35, 13.6, { surface: "wood" });
    for (let k = 0; k < 5; k++) {
      const z = 7.3 + k * 1.3,
        x = -10.8 - (k % 2) * 1.4;
      b.cyl("iron", x, Y_STAGE + 0.35, z, 0.01, 0.01, 1.1, 4);
      b.box(
        "chrome",
        x - 0.02,
        Y_STAGE + 1.35,
        z - 0.25,
        x + 0.02,
        Y_STAGE + 1.7,
        z + 0.25,
        { rz: 0.35, seg: false },
      );
      const mst = P.texMat(
        "es_mstand",
        P.signTex("es_mstand", ["JJ"], "default", 128, 128, {
          bg: "#1a2a58",
          fg: "#f4c830",
        }),
      );
      b.quad(mst, x + 0.05, Y_STAGE + 1.52, z, 0.46, 0.34, { ry: HP });
      D.chair(b, x - 0.7, Y_STAGE + 0.35, z, HP, {
        seat: "seat_blue",
        toppled: k === 3,
      });
    }
    // drum kit
    {
      const dx = -13,
        dz = 11.4,
        dy = Y_STAGE + 0.35;
      b.cyl("paint_white", dx, dy, dz, 0.33, 0.33, 0.45, 14, {
        rz: HP,
        noAO: true,
      });
      for (const [ox, oz, rr, hh] of [
        [0.55, -0.35, 0.18, 0.62],
        [0.55, 0.3, 0.2, 0.6],
        [0.2, 0.6, 0.23, 0.45],
      ]) {
        b.cyl("iron", dx + ox, dy, dz + oz, 0.012, 0.012, hh, 4);
        b.cyl("paint_white", dx + ox, dy + hh, dz + oz, rr, rr, 0.18, 12);
      }
      for (const [ox, oz] of [
        [0.3, -0.75],
        [-0.2, 0.85],
      ]) {
        b.cyl("iron", dx + ox, dy, dz + oz, 0.01, 0.01, 1.05, 4);
        b.cyl("gold", dx + ox, dy + 1.05, dz + oz, 0.28, 0.01, 0.03, 12);
      }
    }
    // upright bass leaning + grand piano
    b.lathe(
      "wood",
      [
        [0.001, 0],
        [0.26, 0.05],
        [0.3, 0.3],
        [0.2, 0.55],
        [0.27, 0.85],
        [0.18, 1.1],
        [0.05, 1.15],
        [0.03, 1.8],
        [0.001, 1.9],
      ],
      10,
      -13.3,
      Y_STAGE + 0.35,
      8.1,
      { rz: -0.35, sz: 0.4 },
    );
    D.piano(b, -11.3, Y_STAGE + 0.35, 11.6, HP + 0.3, {});
    // APPLAUSE sign hung from the grid
    b.box("iron", -2.8, 7.7, -2.6, -2.4, 8.4, 2.6, { seg: false });
    for (const s of [-1, 1])
      b.rod("iron", [-2.6, 8.4, s * 2.2], [-2.6, 15.5, s * 2.2], 0.01, 3, {
        noAO: true,
      });
    b.quad(
      P.texMat(
        "es_applause_off",
        P.signTex("es_applause_off", ["APPLAUSE"], "default", 512, 128, {
          bg: "#1a0e0c",
          fg: "#5a2a22",
        }),
      ),
      -2.37,
      8.05,
      0,
      4.9,
      0.6,
      { ry: HP },
    );
    onAir.push({
      key: "applause",
      x: -2.35,
      y: 8.05,
      z: 0,
      w: 4.9,
      h: 0.6,
      ry: HP,
    });
    // Civil Defense gear painted on the stage floor + the band shell of bulbs over the orchestra riser
    b.quad(gear, -7.5, Y_STAGE + 0.012, 0, 4.2, 4.2, { rx: -HP, noAO: true });
    for (let k = 0; k < 3; k++) {
      const R = 3.2 + k * 0.7;
      for (let i = 0; i <= 14; i++) {
        const a = (PI * i) / 14;
        b.sphere(
          (i + k) % 5 === 2 ? "glass_dark" : "bulb",
          -12.9 + k * 0.35,
          Y_STAGE + 0.4 + Math.sin(a) * R,
          10 + Math.cos(a) * R,
          0.06,
          { ws: 5, hs: 4, noAO: true, noBake: true },
        );
      }
      b.torus("cryo_grey", -12.9 + k * 0.35, Y_STAGE + 0.4, 10, R, 0.06, PI, {
        ry: HP,
        ts: 16,
        rs: 4,
      });
    }
    S.glow(-12.6, Y_STAGE + 3.6, 10, 0xfff0c8, 2.4);
    // footlights along the apron edge (lit on emergency power)
    for (let z = -9.5; z <= 9.5; z += 1.0) {
      b.box("iron", 0.55, Y_STAGE, z - 0.2, 0.85, Y_STAGE + 0.12, z + 0.2, {
        seg: false,
      });
      b.cyl(
        ((z * 2) | 0) % 5 === 0 ? "glass_dark" : "bulb",
        0.7,
        Y_STAGE + 0.02,
        z,
        0.08,
        0.08,
        0.1,
        8,
        { noAO: true, noBake: true },
      );
    }
    S.light(-1.5, Y_STAGE + 0.6, -5, 0xffe8c0, 6, 0.6);
    S.light(-1.5, Y_STAGE + 0.6, 5, 0xffe8c0, 6, 0.6);
    // cue-card easel + floor manager's podium
    b.box("wood", 0.2, Y_STAGE, 6.2, 0.3, Y_STAGE + 1.6, 7.2, { seg: false });
    const cue = P.texMat(
      "es_cue",
      P.signTex(
        "es_cue",
        [
          "...AND REMEMBER, FOLKS:",
          "THE SAFEST PLACE",
          "TO WATCH TOMORROW",
          "IS FROM A SHELTER!",
          "(big smile) (APPLAUSE)",
        ],
        "label",
        384,
        320,
      ),
      { rough: 0.9 },
    );
    b.quad(cue, 0.36, Y_STAGE + 1.1, 6.7, 0.95, 0.8, { ry: HP });
    // scorched patch + collapsed batten (Mr. Showtime's last number)
    b.box("rubble", -8, Y_STAGE + 0.01, 3.5, -5.5, Y_STAGE + 0.03, 6.5, {
      seg: false,
      noAO: true,
      c: 0x333333,
    });
    b.rod(
      "iron",
      [-4.2, Y_STAGE + 0.05, 5.2],
      [-8.9, Y_STAGE + 1.4, 9.8],
      0.035,
      5,
    );
    for (let k = 0; k < 3; k++)
      K.lantern(b, -5 - k * 1.2, Y_STAGE + 0.2, 6 + k * 1.1, r() * 3, 1.6, {
        lit: false,
      });

    // ================= BACKSTAGE (x -32..-16, y -1.0) =================
    // floor with the stairwell hole x -31..-29, z 3..7.6
    S.floor("wood_rotten", -32, -16, -16, 3, Y_STAGE, {
      surface: "wood",
      under: "concrete_dark",
    });
    S.floor("wood_rotten", -32, 7.6, -16, 16, Y_STAGE, {
      surface: "wood",
      under: "concrete_dark",
    });
    S.floor("wood_rotten", -29, 3, -16, 7.6, Y_STAGE, {
      surface: "wood",
      under: "concrete_dark",
    });
    S.floor("wood_rotten", -32, 3, -31, 7.6, Y_STAGE, {
      surface: "wood",
      under: "concrete_dark",
    });
    const BH = 4.2,
      YB = Y_STAGE;
    // outer walls
    S.wallX("brick_red", -16, -32.2, -16, YB, YB + BH, 0.4, []);
    S.wallX("brick_red", 16, -32.2, -16, YB, YB + BH, 0.4, []); // stage door drawn below
    S.wallZ("brick_red", -32, -16, 16, YB, YB + BH, 0.4, []);
    S.ceil("concrete_dark", -32, -16, -16, 16, YB + BH);
    // inner partition x = -20 (corridor x -20..-16)
    S.wallZ(
      "plaster_green",
      -20,
      -16,
      16,
      YB,
      YB + BH,
      0.2,
      [
        [-9.2, -7.8, 0, 2.3],
        [-2.2, -0.8, 0, 2.3],
        [4.2, 5.6, 0, 2.3],
        [11.6, 13.2, 0, 2.6],
      ],
      { frame: "wood_dark" },
    );
    // room dividers (west block): z -6, z 2, z 8.6
    S.wallX("plaster_green", -6, -32, -20, YB, YB + BH, 0.2, []);
    S.wallX("plaster_green", 2, -32, -20, YB, YB + BH, 0.2, []);
    S.wallX("brick_red", 8.6, -32, -20, YB, YB + BH, 0.25, [
      [-31, -28.6, 0, 2.4],
    ]);
    // corridor dressing: work lights, call board, fire hose, pin rail
    for (const z of [-12, -3, 6, 13]) {
      b.box(
        "iron",
        -18.1,
        YB + BH - 0.3,
        z - 0.1,
        -17.9,
        YB + BH - 0.05,
        z + 0.1,
        { seg: false },
      );
      b.sphere(z === 6 ? "glass_dark" : "bulb", -18, YB + BH - 0.42, z, 0.09, {
        ws: 6,
        hs: 4,
        noAO: true,
        noBake: true,
      });
      if (z !== 6) S.light(-18, YB + BH - 0.6, z, 0xffe0a8, 6.5, 0.85);
    }
    const cb = P.texMat(
      "es_callboard",
      P.signTex(
        "es_callboard",
        [
          "CALL BOARD",
          "Sun 3/5 — DRESS 2 PM",
          "AIR 8 PM — ALL ROBOTS",
          "REPORT TO MR. SHOWTIME",
          "NO ACTORS IN THE",
          "CONTROL ROOM. EVER.",
        ],
        "label",
        384,
        384,
      ),
      { rough: 0.9 },
    );
    b.quad(cb, -19.88, YB + 1.6, -4.4, 1.2, 1.2, { ry: HP });
    b.box("paint_red", -16.35, YB + 1.0, 1, -16.2, YB + 1.8, 1.8, {
      seg: false,
    });
    // wings clutter: flats leaning, road cases, sandbags
    for (let k = 0; k < 4; k++)
      b.box(
        "wood",
        -15.5 + k * 0.12,
        YB,
        -13.8 + k * 0.4,
        -15.4 + k * 0.12,
        YB + 3.2,
        -12.2 + k * 0.4,
        { rz: -0.12, seg: false },
      );
    for (let k = 0; k < 3; k++) {
      b.box(
        "paint_black",
        -18.9,
        YB + k * 0.62,
        9.2,
        -17.3,
        YB + 0.6 + k * 0.62,
        10.2,
        { seg: false },
      );
      b.box(
        "chrome",
        -18.95,
        YB + k * 0.62 + 0.25,
        9.15,
        -17.25,
        YB + k * 0.62 + 0.3,
        10.25,
        { seg: false },
      );
    }
    S.col(-18.9, YB, 9.2, -17.3, YB + 1.86, 10.2, { walkable: false });
    for (let k = 0; k < 6; k++)
      b.box(
        "fabric",
        -19.7,
        YB + k * 0.22,
        -15.6 + (k % 2) * 0.2,
        -19.1,
        YB + 0.2 + k * 0.22,
        -15.1,
        { seg: false },
      );

    // ---- Star dressing room (x -32..-20, z -16..-6)
    b.box("wood_dark", -31.9, YB, -15.4, -26, YB + 0.8, -14.9);
    b.box("marble", -31.9, YB + 0.8, -15.5, -26, YB + 0.86, -14.8, {
      seg: false,
    });
    S.col(-31.9, YB, -15.5, -26, YB + 0.86, -14.8, { walkable: false });
    for (const x of [-31, -29, -27]) {
      b.box("glass", x - 0.75, YB + 1.1, -15.82, x + 0.75, YB + 2.1, -15.78, {
        seg: false,
        noAO: true,
      });
      for (let k = 0; k < 5; k++) {
        b.sphere(
          k === 3 && x === -29 ? "glass_dark" : "bulb",
          x - 0.8,
          YB + 1.15 + k * 0.23,
          -15.72,
          0.05,
          { ws: 5, hs: 4, noAO: true, noBake: true },
        );
        b.sphere("bulb", x + 0.8, YB + 1.15 + k * 0.23, -15.72, 0.05, {
          ws: 5,
          hs: 4,
          noAO: true,
          noBake: true,
        });
      }
      S.light(x, YB + 1.6, -15.3, 0xfff0d0, 3.5, 0.55);
      D.chair(b, x, YB, -14.2, PI, { seat: "seat_red" });
    }
    S.glow(-29, YB + 1.6, -15.5, 0xfff0d0, 1.8);
    D.sofa(b, -23, YB, -10.8, -HP, { fabric: "velvet", w: 2.2 });
    const star = P.texMat(
      "es_star",
      P.signTex("es_star", ["★ MR. JACK JOHNSON ★"], "gilt", 512, 96),
      { rough: 0.6 },
    );
    b.quad(star, -21, YB + 2.4, -6.12, 1.8, 0.34, { ry: PI });
    b.box("wood_dark", -31.8, YB, -9.5, -31.2, YB + 2.0, -7.2); // wardrobe
    S.col(-31.8, YB, -9.5, -31.2, YB + 2.0, -7.2, { walkable: false });
    for (let k = 0; k < 6; k++)
      b.box(
        ["velvet", "seat_blue", "fabric_white"][k % 3],
        -31.6 + k * 0.02,
        YB + 0.7,
        -9.3 + k * 0.35,
        -31.3,
        YB + 1.8,
        -9.1 + k * 0.35,
        { seg: false },
      );
    S.prop("skeleton", -24.8, YB, -12.4, 0.8, {
      pose: "lying",
      parent: S.root,
    });
    S.container("Star Dressing Table", -28, YB + 0.86, -15.1, {
      loot: "dresser",
      kind: "dresser",
      items: [["pt_note_es_fanletter", 1]],
    });
    S.anchor("dressing_room", -26, YB, -11, 0);

    // ---- Wardrobe / makeup (x -32..-20, z -6..2)
    for (let k = 0; k < 2; k++) {
      const z = -4.8 + k * 3.2;
      b.rod("chrome", [-31.2, YB + 1.9, z], [-24, YB + 1.9, z], 0.02, 4);
      for (let x = -31; x < -24.2; x += 0.3)
        if (r() < 0.8)
          b.box(
            ["velvet", "fabric", "seat_blue", "fabric_white", "cryo_grey"][
              Math.floor(r() * 5)
            ],
            x - 0.02,
            YB + 0.8,
            z - 0.25,
            x + 0.02,
            YB + 1.85,
            z + 0.25,
            { seg: false, noAO: true, rz: (r() - 0.5) * 0.2 },
          );
      for (const x of [-31.2, -24]) {
        b.rod("chrome", [x, YB, z], [x, YB + 1.9, z], 0.02, 4);
      }
      S.col(-31.3, YB, z - 0.3, -23.9, YB + 2.0, z + 0.3, { walkable: false });
    }
    D.figure(b, "paint_cream", -22, YB, -4.5, -HP, 1.0, "stand", {
      robe: "cryo_grey",
    });
    D.figure(b, "paint_cream", -22, YB, -2.5, -HP + 0.4, 1.0, "arm", {});
    b.box("wood_dark", -23.5, YB, 0.8, -20.4, YB + 0.9, 1.7);
    S.col(-23.5, YB, 0.8, -20.4, YB + 0.9, 1.7, { walkable: false });
    S.prop("lamp", -22.2, YB + 0.9, 1.2, 0, { kind: "desk", parent: S.root });
    S.light(-22.2, YB + 1.6, 1.0, 0xffe0b0, 4, 0.6);
    S.container("Costume Trunk", -30.8, YB, 0.9, {
      loot: "luggage",
      kind: "footlocker",
      items: [["old_world_formalwear", 1]],
    });

    // ---- Stairwell (x -32..-20, z 2..8.6): stairs down to the basement
    S.stairs("concrete", -30, 3.0, "s", 2.0, Y_BASE, YB, {
      rail: "iron",
      railSides: [1],
    });
    S.rail(
      "iron",
      [
        [-28.95, 3.0],
        [-28.95, 7.6],
      ],
      YB,
      1.0,
      {},
    );
    S.rail(
      "iron",
      [
        [-31, 3.0],
        [-29, 3.0],
      ],
      YB,
      1.0,
      {},
    );
    S.rail(
      "iron",
      [
        [-31.05, 3.0],
        [-31.05, 7.6],
      ],
      YB,
      1.0,
      {},
    );
    b.box("lamp_red", -20.4, YB + 2.9, 4.5, -20.3, YB + 3.2, 5.3, {
      seg: false,
    });
    const bsign = P.texMat(
      "es_bsign",
      P.signTex(
        "es_bsign",
        ["↓ TRANSMITTER ROOM", "TRAP ROOM · BOILER"],
        "default",
        512,
        160,
        { bg: "#e8e0c8", fg: "#1a1a1a" },
      ),
    );
    b.quad(bsign, -28.8, YB + 2.2, 8.46, 1.6, 0.5, { ry: PI });
    S.light(-26, YB + 3.5, 5, 0xff5040, 6, 0.5);
    S.prop("first_aid", -20.25, YB + 1.3, 3.2, -HP, { parent: S.root });

    // ---- Scene dock / loading (x -32..-20, z 8.6..16): stage door
    for (let k = 0; k < 5; k++)
      b.box("wood", -31.8 + k * 0.1, YB, 9.2, -31.7 + k * 0.1, YB + 3.8, 12.5, {
        rz: 0.08,
        seg: false,
      });
    S.col(-31.9, YB, 9.1, -31.1, YB + 3.8, 12.6, { walkable: false });
    for (let k = 0; k < 3; k++)
      S.prop("crate", -22 - k * 1.2, YB, 10 + (k % 2) * 0.8, r() * 0.4, {
        kind: k === 1 ? "teletype" : "plain",
        parent: S.root,
      });
    S.container("Prop Crate", -23.5, YB, 12.2, {
      loot: "crate",
      kind: "crate",
    });
    b.box("corrugated", -31.6, YB, 15.72, -28.2, YB + 3.4, 15.8, {
      seg: false,
    }); // roller door (rusted shut)
    b.box("iron", -31.8, YB + 3.4, 15.6, -28.0, YB + 3.7, 15.8, { seg: false });
    b.box("paint_green", -26.6, YB, 15.74, -25.4, YB + 2.3, 15.8, {
      seg: false,
    }); // stage door
    b.box("steel", -25.6, YB + 0.95, 15.62, -25.5, YB + 1.1, 15.74, {
      seg: false,
    });
    b.box("steel", -26.9, YB + 0.9, 15.62, -25.1, YB + 1.02, 15.66, {
      seg: false,
    }); // push bar
    const exitS = P.texMat(
      "es_exit",
      P.signTex("es_exit", ["EXIT", "STAGE DOOR"], "default", 256, 128, {
        bg: "#2a0c08",
        fg: "#ff5a40",
      }),
      { emissive: 0.8 },
    );
    b.quad(exitS, -26, YB + 2.95, 15.74, 1.0, 0.5, { ry: PI });
    S.light(-26, YB + 2.6, 15, 0xff5a40, 4, 0.5);
    S.anchor("stage_door_in", -26, YB, 14.6, 0);
    S.anchor("spawn4", -18, YB, -2, 0);

    // ================= BASEMENT (y -4.5) =================
    const YBa = Y_BASE,
      HBa = 3.2;
    // corridor x -32..-15, z 2..8.6 (stair lands at z 3 → going north)
    S.room({
      x0: -32,
      z0: -12,
      x1: -20,
      z1: 2,
      y: YBa,
      h: HBa,
      wall: "concrete",
      floor: "concrete_dark",
      ceil: "concrete_dark",
      holes: { s: [[-28, -25.5, 0, 2.3]] },
      frame: "iron",
    });
    S.room({
      x0: -32,
      z0: 2,
      x1: -15,
      z1: 8.6,
      y: YBa,
      h: HBa,
      wall: "concrete",
      floor: "concrete_dark",
      ceil: false,
      skip: "ne",
    });
    S.ceil("concrete_dark", -29, 2, -15, 8.6, YBa + HBa);
    S.ceil("concrete_dark", -32, 7.6, -29, 8.6, YBa + HBa);
    // (stair shaft x -31..-29, z 3..7.6 stays open to the floor above)
    for (const x of [-26, -20]) {
      b.box(
        "iron",
        x - 0.1,
        YBa + HBa - 0.3,
        5.1,
        x + 0.1,
        YBa + HBa - 0.08,
        5.3,
        { seg: false },
      );
      b.sphere("lamp_red", x, YBa + HBa - 0.4, 5.2, 0.08, {
        ws: 5,
        hs: 4,
        noAO: true,
      });
      S.light(x, YBa + 2.5, 5.2, 0xff3a2a, 6, 0.8);
    }
    for (let k = 0; k < 4; k++)
      b.rod(
        "rust",
        [-32, YBa + 2.6 + k * 0.12, 8.3],
        [-15, YBa + 2.6 + k * 0.12, 8.3],
        0.06,
        6,
      ); // pipes
    // transmitter room (x -32..-20, z -12..2) — the boss's lair
    for (let k = 0; k < 4; k++) {
      const x = -31 + k * 2.4;
      b.box("paint_green", x, YBa, -11.8, x + 2.0, YBa + 2.6, -10.8);
      b.box("steel", x + 0.1, YBa + 1.2, -10.78, x + 1.9, YBa + 2.4, -10.74, {
        seg: false,
      });
      for (let j = 0; j < 6; j++)
        b.sphere(
          r() < 0.5 ? "lamp_red" : "lamp_green",
          x + 0.3 + j * 0.28,
          YBa + 2.2,
          -10.72,
          0.04,
          { ws: 4, hs: 3, noAO: true },
        );
      for (let j = 0; j < 3; j++)
        b.cyl("glass", x + 0.5 + j * 0.5, YBa + 1.4, -10.7, 0.08, 0.1, 0.5, 8, {
          noAO: true,
        });
    }
    S.col(-31, YBa, -11.8, -21.4, YBa + 2.6, -10.8, { walkable: false });
    // the big transmitter tube cabinet + glowing valve bank
    b.box("paint_black", -24, YBa, -8, -21, YBa + 3.0, -5, {});
    for (let k = 0; k < 6; k++) {
      b.cyl(
        "screen_blue",
        -23.6 + (k % 3) * 0.9,
        YBa + 1.2 + Math.floor(k / 3) * 0.9,
        -4.95,
        0.15,
        0.15,
        0.6,
        10,
        { noAO: true },
      );
    }
    S.col(-24, YBa, -8, -21, YBa + 3.0, -5, { walkable: false });
    S.light(-22.5, YBa + 1.8, -4, 0x80b0ff, 7, 0.9);
    S.glow(-22.5, YBa + 1.6, -4.6, 0x80b8ff, 1.6);
    const tr = P.texMat(
      "es_tx",
      P.signTex(
        "es_tx",
        ["STUDIO 50 TRANSMITTER", "DANGER — 50,000 VOLTS"],
        "default",
        512,
        128,
        { bg: "#e8c830", fg: "#1a1a1a" },
      ),
    );
    b.quad(tr, -22.5, YBa + 2.6, -4.94, 2.6, 0.62, { ry: 0 });
    // breaker panel for "Dead Air"
    b.box("steel", -31.9, YBa + 0.8, -2.6, -31.6, YBa + 2.2, -1.2, {
      seg: false,
    });
    S.anchor("breaker", -31.4, YBa, -1.9, -HP);
    S.prop("terminal", -27, YBa, -1.2, PI, {
      terminalId: "pt_es_transmitter",
      parent: S.root,
    });
    S.anchor("transmitter", -27, YBa, -0.3, 0); // standing spot at the engineering console (quest marker)
    S.container("Engineer's Toolbox", -31.2, YBa, -6, {
      loot: "toolbox",
      kind: "toolbox",
    });
    S.prop("skeleton", -28.5, YBa, -5, 1.2, {
      pose: "reaching",
      parent: S.root,
    });
    S.anchor("boss", -26, YBa, -7, 0);
    S.anchor("spawn6", -26, YBa, -3, 0);
    S.anchor("loot2", -22.5, YBa, -4, 0);

    // trap room under the stage (x -15..-2, z -12..12)
    S.room({
      x0: -15,
      z0: -12,
      x1: -2,
      z1: 12,
      y: YBa,
      h: HBa,
      wall: "concrete",
      floor: "concrete_dark",
      ceil: false,
      holes: { w: [[3.8, 6.8, 0, 2.4]], e: [[-1.1, 1.1, 0, 2.6]] },
    });
    // stage traps: lift platforms + scissor jacks, sandbags, old scenery
    for (const [x, z] of [
      [-10, -4],
      [-6, 4],
      [-10, 6],
    ]) {
      b.box("steel", x - 1, YBa, z - 1, x + 1, YBa + 0.15, z + 1, {
        seg: false,
      });
      for (const s of [-1, 1]) {
        b.rod(
          "iron",
          [x - 0.8, YBa + 0.15, z + s * 0.8],
          [x + 0.8, YBa + HBa - 0.3, z - s * 0.8],
          0.05,
          4,
        );
        b.rod(
          "iron",
          [x + 0.8, YBa + 0.15, z + s * 0.8],
          [x - 0.8, YBa + HBa - 0.3, z - s * 0.8],
          0.05,
          4,
        );
      }
      b.box(
        "steel",
        x - 1,
        YBa + HBa - 0.35,
        z - 1,
        x + 1,
        YBa + HBa - 0.25,
        z + 1,
        { seg: false },
      );
    }
    for (let x = -13; x < -2; x += 3)
      for (let z = -10; z <= 10; z += 5) {
        b.box(
          "wood_dark",
          x - 0.12,
          YBa,
          z - 0.12,
          x + 0.12,
          YBa + HBa,
          z + 0.12,
          { seg: false },
        );
        S.col(x - 0.12, YBa, z - 0.12, x + 0.12, YBa + HBa, z + 0.12, {
          walkable: false,
        });
      }
    for (let x = -13; x < -2; x += 3)
      b.box(
        "wood_dark",
        x - 0.1,
        YBa + HBa - 0.3,
        -12,
        x + 0.1,
        YBa + HBa,
        12,
        { seg: false },
      ); // joists
    for (let k = 0; k < 4; k++)
      b.box(
        "wood",
        -14.6,
        YBa,
        -11 + k * 0.6,
        -13.8,
        YBa + 2.4,
        -10.8 + k * 0.6,
        { rz: 0.1, seg: false },
      );
    b.box(
      "lamp_dim",
      -8.2,
      YBa + HBa - 0.15,
      -0.1,
      -7.8,
      YBa + HBa - 0.05,
      0.1,
      { seg: false },
    );
    S.light(-8, YBa + 2.4, 0, 0xffd8a0, 7, 0.6);
    S.light(-4, YBa + 2.2, 9, 0xff4a30, 5, 0.5);
    S.container("Stagehand Locker", -14.6, YBa, 8, {
      loot: "locker",
      kind: "locker",
    });
    S.anchor("spawn3b", -8, YBa, 0, HP);
    // Sid Mancuso, the stage manager, made it as far as the trap room (his log lies beside him)
    S.prop("skeleton", -7.4, YBa, 2.9, 0.6, {
      pose: "reaching",
      parent: S.root,
    });
    D.papers(b, -7, YBa, 2.6, 1.2, 8);
    // passage east to the musicians' hatch stair (x -2..0.5, z -1..1) + stair up to the camera floor
    S.floor("concrete_dark", -2, -1.1, 0.6, 1.1, YBa, {});
    S.wallX("concrete", -1.1, -2, 3.8, YBa, Y_PIT, 0.2, []);
    S.wallX("concrete", 1.1, -2, 3.8, YBa, Y_PIT, 0.2, []);
    S.wallZ("concrete", 3.8, -1.1, 1.1, YBa, Y_PIT, 0.2, []);
    S.ceil("concrete_dark", -2, -1.1, 1.0, 1.1, Y_PIT - 0.3);
    S.stairs("iron", 0.8, 0, "e", 1.9, YBa, Y_PIT, {
      run: 0.28,
      surface: "metal",
    });
    b.sphere("lamp_red", -0.5, Y_PIT - 0.5, 0.9, 0.06, {
      ws: 5,
      hs: 4,
      noAO: true,
    });
    S.light(-0.5, Y_PIT - 0.8, 0, 0xff4a30, 4, 0.5);

    // ================= UPPER LEVEL (y 6.5): hallway, control room, producer's office =================
    const YU = Y_UP,
      HU = 3.5;
    S.ceil("plaster", 22, -9, 36, 9, YU + HU);
    // control room walls: south z=1 (door x 27..28.5), east x=30 (door z -5..-3.8)
    S.wallX(
      "plaster",
      1,
      22,
      36,
      YU,
      YU + HU,
      0.2,
      [
        [27, 28.5, 0, 2.3],
        [33, 34.5, 0, 2.3],
      ],
      { frame: "wood_dark" },
    );
    S.wallZ("plaster", 30, -9, 1, YU, YU + HU, 0.2, [[-5, -3.8, 0, 2.3]], {
      frame: "wood_dark",
    });
    // control room: monitor wall facing the window (x 22) — console desk along the window, monitor bank on the east wall
    b.box("paint_black", 22.3, YU, -8.6, 23.3, YU + 0.95, -0.6);
    b.box("steel", 22.25, YU + 0.95, -8.65, 23.5, YU + 1.02, -0.55, {
      seg: false,
    });
    S.col(22.3, YU, -8.6, 23.3, YU + 1.02, -0.6, { walkable: false });
    for (let z = -8.2; z < -0.8; z += 0.5)
      for (let k = 0; k < 3; k++)
        b.box(
          r() < 0.3 ? "lamp_red" : r() < 0.5 ? "lamp_green" : "chrome",
          22.5 + k * 0.25,
          YU + 1.02,
          z - 0.05,
          22.6 + k * 0.25,
          YU + 1.08,
          z + 0.05,
          { seg: false, noAO: true },
        );
    b.box("glass", 21.95, YU + 1.0, -8, 22.05, YU + 2.6, -1, {
      seg: false,
      noAO: true,
    });
    // monitor wall (east x 29.8): 3×4 screens, some lit showing the empty stage
    const mon = P.texMat(
      "es_monitor",
      P.canvasTex("pt_es_monitor", 256, 192, (ctx, w, h) => {
        const rr = P.rng("esmon");
        ctx.fillStyle = "#0c1a14";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#3a6a58";
        ctx.fillRect(w * 0.1, h * 0.55, w * 0.8, h * 0.06);
        ctx.fillRect(w * 0.3, h * 0.35, w * 0.12, h * 0.2);
        ctx.beginPath();
        ctx.arc(w * 0.62, h * 0.35, 30, 0, TAU);
        ctx.strokeStyle = "#6aa890";
        ctx.lineWidth = 6;
        ctx.stroke();
        for (let y = 0; y < h; y += 3) {
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(0, y, w, 1);
        }
        for (let i = 0; i < 500; i++) {
          ctx.fillStyle = "rgba(200,255,220," + rr() * 0.2 + ")";
          ctx.fillRect(rr() * w, rr() * h, 1, 1);
        }
      }),
      { emissive: 1.0 },
    );
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++) {
        const z = -8 + i * 1.7,
          y = YU + 1.1 + j * 0.8;
        b.box(
          "paint_black",
          29.3,
          y - 0.36,
          z - 0.75,
          29.85,
          y + 0.36,
          z + 0.75,
          { seg: false },
        );
        if ((i + j) % 3 !== 1) b.quad(mon, 29.28, y, z, 1.25, 0.6, { ry: -HP });
        else
          b.box(
            "glass_dark",
            29.25,
            y - 0.3,
            z - 0.62,
            29.3,
            y + 0.3,
            z + 0.62,
            { seg: false },
          );
      }
    S.col(29.3, YU, -8.8, 29.85, YU + 3.0, -1.2, { walkable: false });
    S.light(27.5, YU + 2, -4.5, 0x70d8a0, 7, 0.8);
    S.glow(29, YU + 1.9, -4.5, 0x70e0a8, 2.0);
    b.box("paint_black", 25.5, YU, -5.6, 27.5, YU + 0.8, -3.2); // vision mixer
    b.box("steel", 25.4, YU + 0.8, -5.7, 27.6, YU + 0.86, -3.1, { seg: false });
    S.col(25.5, YU, -5.6, 27.5, YU + 0.86, -3.2, { walkable: false });
    for (let k = 0; k < 18; k++)
      b.box(
        k % 5 === 0 ? "lamp_red" : "paint_white",
        25.6 + (k % 6) * 0.3,
        YU + 0.86,
        -5.5 + Math.floor(k / 6) * 0.7,
        25.75 + (k % 6) * 0.3,
        YU + 0.92,
        -5.35 + Math.floor(k / 6) * 0.7,
        { seg: false, noAO: true },
      );
    D.chair(b, 24.2, YU, -4.4, -HP, { seat: "leather", wood: "chrome" });
    S.prop("skeleton", 24.2, YU, -4.4, HP, { pose: "seated", parent: S.root });
    S.prop("terminal", 23.6, YU + 1.02, -7.6, -HP, {
      terminalId: "pt_es_control",
      mount: "bare",
      parent: S.root,
    });
    S.anchor("control_terminal", 24.5, YU, -7.6, HP);
    S.anchor("control_room", 26, YU, -2, 0);
    S.anchor("spawn5", 27.5, YU, -1.8, 0);
    // tape machines (reel-to-reel) along the north wall
    for (let k = 0; k < 3; k++) {
      const x = 24.5 + k * 1.3;
      b.box("paint_cream", x - 0.55, YU, -8.95, x + 0.55, YU + 1.7, -8.35);
      for (const s of [-1, 1])
        b.cyl("chrome", x + s * 0.24, YU + 1.3, -8.33, 0.2, 0.2, 0.04, 12, {
          rx: HP,
          noAO: true,
        });
    }
    S.col(23.9, YU, -8.95, 27.6, YU + 1.7, -8.35, { walkable: false });
    // producer's office (x 30..36, z -9..1): desk, safe, awards, window
    b.box("wood_dark", 32, YU, -6.2, 34.8, YU + 0.78, -5.1);
    b.box("wood_oak", 31.95, YU + 0.78, -6.25, 34.85, YU + 0.84, -5.05, {
      seg: false,
    });
    S.col(32, YU, -6.2, 34.8, YU + 0.84, -5.1, { walkable: false });
    D.chair(b, 33.4, YU, -7, 0, { seat: "leather", arms: true });
    S.prop("terminal", 33.8, YU + 0.84, -5.6, PI, {
      terminalId: "pt_es_producer",
      mount: "bare",
      parent: S.root,
    });
    D.bookcase(b, 35.7, YU, -3.5, -HP, { w: 1.8 });
    for (let k = 0; k < 4; k++)
      b.lathe(
        "gold",
        [
          [0.001, 0],
          [0.07, 0],
          [0.04, 0.05],
          [0.025, 0.18],
          [0.07, 0.28],
          [0.001, 0.32],
        ],
        8,
        31.2 + k * 0.35,
        YU + 1.52,
        -8.7,
      );
    b.box("wood_dark", 30.4, YU + 1.5, -8.95, 32.8, YU + 1.52, -8.6, {
      seg: false,
    });
    S.container("Producer's Safe", 30.6, YU, -1.0, {
      loot: "safe",
      kind: "safe",
      locked: 0,
      lock: P.LOCKS.es_safe,
      items: [
        ["pt_es_master_reel", 1],
        ["scrip", 120],
      ],
    });
    S.anchor("producer_safe", 30.6, YU, -1.0, 0);
    D.papers(b, 33, YU, -3, 1.6, 10);
    D.sconce(S, 33, YU + 2.2, -8.8, 0, {});
    S.light(33, YU + 2.8, -4, 0xffe0b0, 6, 0.6);
    // hallway: runner, framed photos, balcony door (x 22, z 1.8..4.4)
    D.rug(b, 22.5, 2, 35.5, 4.4, YU + 0.01, "carpet_red");
    for (let x = 25; x < 36; x += 3) {
      D.sconce(S, x, YU + 2.2, 1.12, 0, { dark: x > 32 });
    }
    S.anchor("upper_hall", 30, YU, 3, HP);
    S.container("Studio Supply Cabinet", 35.5, YU, 7.8, {
      loot: "file_cabinet",
      kind: "file_cabinet",
    });
    // the lighting store shelf at the east end of the hall: spare lamps, and the quest's Klieg light
    b.box("steel", 35.3, YU, 2.0, 35.9, YU + 1.9, 4.6);
    for (let k = 0; k < 3; k++)
      b.box(
        "steel",
        34.9,
        YU + 0.5 + k * 0.6,
        2.0,
        35.9,
        YU + 0.54 + k * 0.6,
        4.6,
        { seg: false },
      );
    S.col(34.9, YU, 2.0, 35.9, YU + 1.9, 4.6, { walkable: false });
    for (let k = 0; k < 3; k++)
      K.lantern(b, 35.4, YU + 0.8 + k * 0.6, 2.6 + k * 0.7, -HP, 0, {});
    S.pickup("pt_es_klieg", 1, 35.3, YU + 1.18, 3.9);
    S.anchor("klieg", 35.3, YU + 1.18, 3.9, -HP);

    // ================= anchors, doors =================
    S.anchor("entrance", 34.6, 0, 0, HP);
    S.anchor("spawn1", 26.5, 0, 3.4, HP);
    S.anchor("spawn3", -7, Y_STAGE, -1, -HP);
    S.anchor("stage", -6, Y_STAGE, 0, -HP);
    S.anchor("camera_floor", 3, Y_PIT, 3, -HP);
    S.anchor("loot1", 33.8, 1.18, -6.2, 0);
    S.anchor("loot3", 30.6, YU, -1.0, 0);
    S.anchor("npc_showtime", -6, Y_STAGE, 1.5, -HP);

    // "on air" toggle group (hidden until the broadcast is restored)
    const air = new THREE.Group();
    air.name = "pt_es_onair";
    air.visible = false;
    const onM = P.texMat(
      "es_onair",
      P.signTex("es_onair", ["ON AIR"], "neon", 256, 96, { fg: "#ff4030" }),
      { emissive: 1.6 },
    );
    const apM = P.texMat(
      "es_applause",
      P.signTex("es_applause", ["APPLAUSE"], "neon", 512, 128, {
        fg: "#ff5a40",
      }),
      { emissive: 1.8 },
    );
    for (const q of onAir) {
      const g = new THREE.PlaneGeometry(q.w, q.h);
      const mat =
        q.key === "onair"
          ? P.mat(onM)
          : q.key === "applause"
            ? P.mat(apM)
            : P.mat("lamp_red");
      const m = new THREE.Mesh(g, mat);
      m.position.set(q.x + O.x, q.y + O.y + LIFT, q.z + O.z);
      m.rotation.y = q.ry;
      air.add(m);
    }
    S.root.add(air);
    P.esOnAir = air;
    return S;
  }

  // ===================================================================
