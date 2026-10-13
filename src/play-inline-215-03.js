// play-inline-215 03 — math
// Lines 160-1996 of readable/play-inline-215.pretty.js (statement-aligned).
  PH.addBuilder(
    "ellis_int",
    function () {
      const L = G.LAYOUT;
      const I = L.INTERIORS.ellis_island;
      if (!I) return;
      const O = I.origin;
      const root = PH.interiorRoot("ellis_island", "poi_ellis_interior");
      PH.setOrigin(O.x, O.z);
      const b = PH.batch("ellis_int");
      b.frame(PH.originMatrix());
      b.grime = 0.45;
      b.aoH = 2.5;
      // baked lighting: cool daylight through the big windows + warm settlement lamps (added by fixtures below)
      b.setLights(
        [
          { x: 0, y: 17, z: -11, color: 0x9aa890, r: 22, i: 0.55 },
          { x: 0, y: 17, z: 11, color: 0x9aa890, r: 22, i: 0.55 },
          { x: -18, y: 16, z: -11, color: 0x9aa890, r: 16, i: 0.5 },
          { x: 18, y: 16, z: 11, color: 0x9aa890, r: 16, i: 0.5 },
          { x: -18, y: 16, z: 11, color: 0x9aa890, r: 16, i: 0.5 },
          { x: 18, y: 16, z: -11, color: 0x9aa890, r: 16, i: 0.5 },
          { x: -23, y: 16, z: 0, color: 0xa8b090, r: 18, i: 0.6 },
        ],
        0x4a4e52,
        0.38,
      );
      const A = {};
      const r = PH.rng("ellis_int");
      const flagK = PH.texMat(
        "ellis_flag",
        PH.canvasTex("ph_flag", 8, 8, () => {}),
        { double: true },
      ); // created by the exterior; re-used

      // =====================================================================
      // GROUND FLOOR (y 0)
      // =====================================================================
      // --- vestibule (x -5..5, z -22..-15)
      PH.slab(b, "terrazzo", -5, -22, 5, -15, GY, 0.3);
      b.boxMM("plaster", -5, 5, -22, 5, 5.3, -15, { grime: 0.5 });
      PH.wall(
        b,
        "plaster",
        -5,
        -22,
        5,
        -22,
        GY,
        5,
        [{ c: 5, w: 3.2, h: 3.8 }],
        { wainscot: { key: "tile_white", h: 2.2 } },
      );
      PH.wall(b, "plaster", -5, -22, -5, -15, GY, 5, [], {
        wainscot: { key: "tile_white", h: 2.2 },
      });
      PH.wall(
        b,
        "plaster",
        5,
        -22,
        5,
        -15,
        GY,
        5,
        [{ c: 3.5, w: 2.4, h: 2.8 }],
        { wainscot: { key: "tile_white", h: 2.2 } },
      );
      // exit doors (double, bronze-plated) set in the north wall
      for (const s of [-1, 1]) {
        b.box("wood_dark", s * 0.8, 0, -21.8, 1.5, 3.7, 0.12, { seg: false });
        b.box("bronze", s * 0.8, 1.0, -21.72, 1.1, 1.5, 0.04, { seg: false });
      }
      b.box("daylight", 0, 3.8, -21.9, 3.1, 0.9, 0.05, { seg: false });
      // ticket turnstiles & a Civil Defense "processing" kiosk
      for (const x of [-2.6, -0.9, 0.9, 2.6]) {
        b.cyl("chrome", x, 0, -17, 0.12, 0.12, 0.95, 8, { hSeg: 1 });
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * TAU;
          b.rod(
            "chrome",
            PH.v3(x, 0.85, -17),
            PH.v3(x + Math.cos(a) * 0.45, 0.85, -17 + Math.sin(a) * 0.45),
            0.02,
            4,
          );
        }
      }
      const welK = PH.signMat(
        "ellis_welcome",
        [
          "WELCOME TO THE REGISTRY",
          "THE LIVING, THE DEAD, AND THE IN-BETWEEN",
          "PLEASE HAVE YOUR PAPERS READY (OPTIONAL)",
        ],
        "enamel",
        1024,
        256,
        { bg: "#27313a" },
      );
      b.quad(welK, 0, 4.1, -15.2, 5.6, 1.4, { ry: Math.PI });
      PH.hangLamp(b, 0, 5, -18.5, 1.0, {});
      A.entrance = PH.A(0, GY, -19.8, Math.PI);

      // --- north concourse (x 5..40, z -22..-15), loops to the waiting room
      PH.slab(b, "terrazzo", 5, -22, 40, -15, GY, 0.3);
      b.boxMM("plaster", 5, 4.5, -22, 40, 4.8, -15, { grime: 0.55 });
      PH.wall(b, "plaster", 5, -22, 40, -22, GY, 4.5, [], {
        wainscot: { key: "tile_white", h: 2.0 },
      });
      PH.wall(b, "plaster", 40, -22, 40, -15, GY, 4.5, [], {});
      for (let x = 9; x < 40; x += 7)
        PH.tubeLamp(b, x, 4.5, -18.5, 2.2, 0, { dead: x === 23 });
      for (let k = 0; k < 5; k++)
        b.box("wood_dark", 8 + k * 5.5, 0, -21.2, 3.4, 2.4, 0.6, {
          seg: false,
        }); // ticket counters (closed shutters)
      for (let k = 0; k < 5; k++)
        b.box("corrugated", 8 + k * 5.5, 0.9, -20.88, 3.2, 1.3, 0.04, {
          seg: false,
        });
      const tixK = PH.signMat(
        "ellis_tickets",
        ["RAILROAD TICKETS — ALL POINTS WEST"],
        "enamel",
        1024,
        128,
        { bg: "#3a2a1c" },
      );
      b.quad(tixK, 19, 3.2, -21.62, 9, 0.9, {});
      luggage(b, 30, 0, -19, 1.2, 12, "conc1");
      PH.skeleton(b, 12, 0, -17, 1.2, { sit: false });
      PH.col(22.5, -18.5, 1, 7, 0, 2.4, 0, { walkable: false });

      // --- BAGGAGE ROOM (x -24..24, z -15..12), ceiling = registry floor
      PH.slab(b, "redtile", -24, -15, 24, 12, GY, 0.3);
      PH.wall(
        b,
        "brick",
        -24,
        -15,
        24,
        -15,
        GY,
        6.2,
        [{ c: 24, w: 4, h: 3.6 }],
        { wainscot: { key: "tile_white", h: 2.4 } },
      );
      PH.wall(b, "brick", -24, 12, 24, 12, GY, 6.2, [], {
        wainscot: { key: "tile_white", h: 2.4 },
      });
      PH.wall(
        b,
        "brick",
        -24,
        -15,
        -24,
        12,
        GY,
        6.2,
        [{ c: 13, w: 2.6, h: 3.0 }],
        { wainscot: { key: "tile_white", h: 2.4 } },
      );
      PH.wall(b, "brick", 24, -15, 24, 12, GY, 6.2, [], {
        wainscot: { key: "tile_white", h: 2.4 },
      });
      // ceiling slabs at y 6.5 (registry floor above, with the grand-stair opening)
      floorPair(b, -24, -12, -2.3, 12, RY, "redtile", "plaster");
      floorPair(b, 2.3, -12, 24, 12, RY, "redtile", "plaster");
      floorPair(b, -2.3, -12, 2.3, -0.5, RY, "redtile", "plaster");
      floorPair(b, -2.3, 10.2, 2.3, 12, RY, "redtile", "plaster");
      floorPair(b, -24, -15, 24, -12, RY, "terrazzo", "plaster");
      // cast-iron columns with capitals
      for (const x of [-18, -12, -6, 6, 12, 18])
        for (const z of [-9, -3, 3, 9]) {
          b.cyl("iron", x, 0, z, 0.2, 0.24, 6.2, 10, { hSeg: 2 });
          b.cyl("iron", x, 5.7, z, 0.45, 0.22, 0.5, 10, { hSeg: 1 });
          b.cyl("iron", x, 0, z, 0.35, 0.35, 0.3, 10, { hSeg: 1 });
          PH.col(x, z, 0.5, 0.5, 0, 6.2, 0, { walkable: false });
        }
      // steel ceiling beams
      for (const x of [-18, -12, -6, 6, 12, 18])
        b.boxMM("iron", x - 0.15, 5.75, -15, x + 0.15, 6.2, 12, { seg: false });
      // THE GRAND STAIR: from the baggage room's south end up (north) into the middle of the Registry Room
      PH.stairs(b, "terrazzo", 0, 10.2, Math.PI, 4.2, 10.7, GY, RY, {
        rails: "bronze",
      });
      for (const s of [-1, 1])
        b.boxMM("marble", s * 2.1 - 0.12, 0, -0.5, s * 2.1 + 0.12, 1.0, 10.2, {
          seg: false,
          grime: 0.4,
        });
      // the space under the stair: BAGGAGE CHECK counter (tiled front, claim-ticket window)
      b.boxMM("tile_white", -2.2, 0, -0.62, 2.2, 2.4, -0.5, {
        seg: false,
        grime: 0.5,
      });
      b.boxMM("wood_dark", -2.4, 0, -1.9, 2.4, 1.05, -1.3, { seg: false });
      b.boxMM("wood", -2.5, 1.05, -2.0, 2.5, 1.12, -1.2, { seg: false });
      PH.colMM(-2.4, 0, -1.9, 2.4, 1.12, -1.3, { walkable: false });
      for (let i = 0; i < 12; i++)
        b.box(
          "paper",
          -2 + i * 0.35,
          1.13,
          -1.6 + (i % 2) * 0.1,
          0.12,
          0.01,
          0.2,
          { seg: false, noAO: true },
        );
      const chkK = PH.signMat(
        "ellis_check",
        ["BAGGAGE CHECK", "CLAIM TICKETS HONORED INDEFINITELY"],
        "enamel",
        768,
        160,
        { bg: "#3a2418" },
      );
      b.quad(chkK, 0, 3.4, -0.66, 3.8, 0.8, { ry: Math.PI });
      for (let y = 1.4; y < 2.4; y += 0.5)
        b.boxMM("wood", -2.1, y, -0.9, 2.1, y + 0.04, -0.62, { seg: false });
      for (let i = 0; i < 10; i++)
        b.box(
          ["leather", "cardboard", "burlap"][i % 3],
          -1.9 + i * 0.4,
          1.44 + (i % 2) * 0.5,
          -0.76,
          0.3,
          0.3,
          0.26,
          { seg: false, c: [0x8a6a4a, 0x5a4a3a, 0x9a8a6a][i % 3] },
        );
      PH.hangLamp(b, 0, 6.2, -3, 1.6, { i: 1.1 });
      const upK = PH.signMat(
        "ellis_up",
        ["TO THE REGISTRY ▲", "KEEP IN LINE — DOCTORS ARE WATCHING"],
        "enamel",
        768,
        192,
        { bg: "#1d3a2a" },
      );
      b.quad(upK, 0, 4.0, 11.82, 3.6, 0.9, { ry: Math.PI });
      // luggage mountains, carts & sorting tables
      for (const [x, z, rad, n] of [
        [-15, -7, 3.2, 70],
        [-9, 6, 2.6, 50],
        [14, -7, 3.0, 60],
        [15, 6, 2.4, 40],
        [-19, 1, 2.0, 30],
        [8, -12.5, 1.6, 22],
      ])
        luggage(b, x, 0, z, rad, n, x * 7 + z);
      for (const [x, z, ry] of [
        [-4, -8, 0.3],
        [5, 3, -0.4],
        [-20, -12, 1.2],
        [20, 9, 0.1],
      ]) {
        const [px, pz] = PH.rot(x, z, ry, 0, 0);
        b.box("wood", px, 0.35, pz, 1.2, 0.08, 2.2, { ry, seg: false });
        for (const [lx, lz] of [
          [-0.5, -0.9],
          [0.5, -0.9],
          [-0.5, 0.9],
          [0.5, 0.9],
        ]) {
          const [wx, wz] = PH.rot(px, pz, ry, lx, lz);
          b.cyl("rubber", wx, 0.14, wz, 0.14, 0.14, 0.08, 8, {
            rx: Math.PI / 2,
            hSeg: 1,
          });
        }
        const [hx, hz] = PH.rot(px, pz, ry, 0, -1.25);
        b.beam("iron", PH.v3(hx, 0.4, hz), PH.v3(hx, 1.1, hz), 0.05, 0.05);
        luggage(b, px, 0.43, pz, 0.6, 5, "cart" + x);
      }
      const bagK = PH.signMat(
        "ellis_baggage",
        ["BAGGAGE ROOM", "CHECK YOUR TRUNKS — CLAIM ON THE FAR SHORE"],
        "enamel",
        1024,
        192,
        { bg: "#3a2418" },
      );
      b.quad(bagK, 0, 4.6, -14.82, 6.4, 1.2, {});
      const lostK = PH.signMat(
        "ellis_lost",
        ["LOST & FOUND", "EST. 1892 — STILL LOOKING"],
        "paper",
        512,
        256,
      );
      b.quad(lostK, -23.82, 2.6, -8, 1.6, 0.8, { ry: Math.PI / 2 });
      for (const [x, z] of [
        [-12, -5],
        [12, -5],
        [-12, 7],
        [12, 7],
        [0, -9],
      ])
        PH.hangLamp(b, x, 6.2, z, 1.4, {});
      A.baggage = PH.A(0, GY, -8, Math.PI);
      A.porter = PH.A(0, GY, -1.0, Math.PI);
      PH.skeleton(b, -21, 0, 10, 2.2, { sit: true });

      // --- DINING HALL / canteen (x -40..-24, z -15..12)
      PH.slab(b, "tile_floor", -40, -15, -24, 12, GY, 0.3);
      floorPair(b, -40, -15, -24, 12, RY, "hextile", "plaster");
      PH.wall(b, "plaster", -40, -15, -24, -15, GY, 6.2, [], {
        wainscot: { key: "tile_white", h: 1.6 },
      });
      PH.wall(b, "plaster", -40, 12, -24, 12, GY, 6.2, [], {
        wainscot: { key: "tile_white", h: 1.6 },
      });
      PH.wall(b, "plaster", -40, -15, -40, 12, GY, 6.2, [], {
        wainscot: { key: "tile_white", h: 1.6 },
      });
      for (let k = 0; k < 3; k++) {
        const z = -9 + k * 6;
        b.boxMM("wood", -37, 0.75, z - 0.5, -27, 0.82, z + 0.5, { seg: false });
        for (const x of [-36.5, -27.5])
          for (const zz of [z - 0.4, z + 0.4])
            b.box("iron", x, 0, zz, 0.06, 0.75, 0.06, { seg: false });
        bench(b, -32, 0, z - 1.0, 0, 9);
        bench(b, -32, 0, z + 1.0, Math.PI, 9);
        PH.col(-32, z, 10, 1, 0, 0.82, 0, {});
        for (let i = 0; i < 6; i++) {
          const x = -36 + r() * 8;
          b.cyl("metal", x, 0.82, z + (r() - 0.5) * 0.6, 0.12, 0.1, 0.05, 10, {
            hSeg: 1,
          });
          if (r() < 0.5)
            b.cyl("chrome", x + 0.2, 0.82, z, 0.04, 0.04, 0.14, 6, { hSeg: 1 });
        }
      }
      // kitchen line: counter, big stove with a stew pot on a fire, shelves
      b.boxMM("scratched", -39.6, 0, 5, -34, 1.0, 11.6, { seg: false });
      b.boxMM("metal", -39.8, 0, -14.6, -38.2, 2.4, -6, { seg: false });
      for (let y = 0.5; y < 2.3; y += 0.6)
        b.boxMM("wood", -39.8, y, -14.6, -38.4, y + 0.05, -6, { seg: false });
      PH.colMM(-39.8, 0, -14.6, -38.2, 2.4, -6, { walkable: false });
      PH.colMM(-39.6, 0, 5, -34, 1.0, 11.6, {});
      b.cyl("rust", -37, 1.0, 8, 0.5, 0.45, 0.6, 12, { hSeg: 1 });
      b.cyl("molasses", -37, 1.58, 8, 0.44, 0.44, 0.02, 12, { hSeg: 1 });
      const soupK = PH.signMat(
        "ellis_soup",
        ["MAMA ROSARIA'S", "SOUP — 5 SCRIP", "DO NOT ASK WHAT'S IN IT"],
        "chalk",
        512,
        384,
      );
      b.quad(soupK, -39.82, 2.6, 8.5, 2.0, 1.5, { ry: Math.PI / 2 });
      b.addLight(-37, 1.8, 8, 0xff8a3a, 7, 0.9);
      b.sphere("fire", -37, 1.62, 8, 0.25, { sy: 0.5, noAO: true });
      for (const z of [-9, -3, 3]) PH.hangLamp(b, -32, 6.2, z, 1.6, {});
      A.cook = PH.A(-36.5, GY, 6.5, -Math.PI / 2);
      A.npc1 = PH.A(-30, GY, -6, Math.PI / 2);
      A.npc2 = PH.A(-33, GY, 1.2, 0);

      // --- FERRY WAITING ROOM (x 24..40, z -15..12); the Stairs of Separation land here
      PH.slab(b, "terrazzo", 24, -15, 40, 12, GY, 0.3);
      PH.wall(
        b,
        "plaster",
        24,
        -15,
        40,
        -15,
        GY,
        6.2,
        [{ c: 8, w: 3, h: 3.2 }],
        { wainscot: { key: "tile_white", h: 2.0 } },
      );
      PH.wall(b, "plaster", 24, 12, 40, 12, GY, 6.2, [], {
        wainscot: { key: "tile_white", h: 2.0 },
      });
      PH.wall(b, "plaster", 40, -15, 40, 12, GY, 10.8, [], {
        wainscot: { key: "tile_white", h: 2.0 },
      });
      floorPair(b, 24, -15, 40, -4, RY, "wood", "plaster");
      floorPair(b, 24, 4, 40, 12, RY, "wood", "plaster");
      floorPair(b, 24, -4, 27, 4, RY, "redtile", "plaster");
      for (let k = 0; k < 4; k++) {
        bench(b, 30, 0, -12 + k * 1.8, 0, 7);
      }
      for (let k = 0; k < 3; k++) {
        bench(b, 31, 0, 5.5 + k * 1.8, Math.PI, 7);
      }
      const ferK = PH.signMat(
        "ellis_ferry",
        ["FERRY TO NEW YORK ▸", "NEXT BOAT: SUSPENDED"],
        "enamel",
        768,
        192,
        { bg: "#20364a" },
      );
      b.quad(ferK, 39.82, 3.8, -8, 3.6, 0.9, { ry: -Math.PI / 2 });
      const njK = PH.signMat(
        "ellis_nj",
        ["◂ TRAINS — NEW JERSEY & POINTS WEST"],
        "enamel",
        768,
        128,
        { bg: "#3a2a1c" },
      );
      b.quad(njK, 39.82, 3.8, 8, 3.6, 0.6, { ry: -Math.PI / 2 });
      for (const [x, z] of [
        [30, -10],
        [30, 8],
        [36, -10],
      ])
        PH.hangLamp(b, x, 6.2, z, 1.4, { color: 0xffd8a0 });
      PH.skeleton(b, 33, 0.45, -10.2, Math.PI / 2, { sit: true });
      PH.skeleton(b, 28.5, 0.45, 7.3, -Math.PI / 2, { sit: true });

      // =====================================================================
      // REGISTRY FLOOR (y 6.5): the Great Hall
      // =====================================================================
      // hall walls: north & south to the springing line, ends to the crown
      const galleryDoorsN = [
        { c: 8, w: 1.6, b: DY - RY, h: 2.4 },
        { c: 24, w: 1.6, b: DY - RY, h: 2.4 },
        { c: 40, w: 1.6, b: DY - RY, h: 2.4 },
      ];
      PH.wall(
        b,
        "plaster",
        -24,
        -12,
        24,
        -12,
        RY,
        SPRING,
        galleryDoorsN.concat([{ c: 14, w: 2.0, h: 2.7 }]),
        { t: 0.5, wainscot: { key: "tile_white", h: 2.4 } },
      );
      PH.wall(
        b,
        "plaster",
        -24,
        12,
        24,
        12,
        RY,
        SPRING,
        [{ c: 24, w: 1.8, b: DY - RY, h: 2.4 }],
        { t: 0.5, wainscot: { key: "tile_white", h: 2.4 } },
      );
      PH.wall(
        b,
        "plaster",
        -24,
        -12,
        -24,
        12,
        RY,
        CROWN + 0.5,
        [{ c: 12, w: 2.4, h: 2.8 }],
        { t: 0.5, wainscot: { key: "tile_white", h: 2.4 } },
      );
      PH.wall(
        b,
        "plaster",
        24,
        -12,
        24,
        12,
        RY,
        CROWN + 0.5,
        [{ c: 12, w: 3.0, h: 3.4 }],
        { t: 0.5, wainscot: { key: "tile_white", h: 2.4 } },
      );
      // tile band at the gallery line & springing cornice
      for (const z of [-11.7, 11.7]) {
        b.boxMM(
          "limestone",
          -24,
          SPRING - 0.4,
          z - 0.12,
          24,
          SPRING,
          z + 0.12,
          { seg: false },
        );
        b.boxMM(
          "limestone",
          -24,
          SPRING - 0.1,
          z - 0.3,
          24,
          SPRING + 0.15,
          z + 0.3,
          { seg: false },
        );
      }
      // the Guastavino vault (segmental barrel, tiled), seen from below
      {
        const R = (12 * 12 + (CROWN - SPRING) ** 2) / (2 * (CROWN - SPRING));
        const cy = CROWN - R,
          half = Math.asin(12 / R);
        const g2 = new THREE.CylinderGeometry(
          R,
          R,
          48,
          40,
          8,
          true,
          -Math.PI / 2 - half,
          half * 2,
        );
        g2.rotateZ(-Math.PI / 2); // axis along x, arc centred on +y
        b.add("guastavino", PH.flip(g2), {
          m: PH.m4(0, cy, 0),
          grime: 0.25,
          uvScale: 3,
        });
        // transverse ribs every 6 m (limestone bands)
        for (let x = -18; x <= 18; x += 6) {
          const rib = new THREE.CylinderGeometry(
            R - 0.06,
            R - 0.06,
            0.5,
            40,
            1,
            true,
            -Math.PI / 2 - half,
            half * 2,
          );
          rib.rotateZ(-Math.PI / 2);
          b.add("limestone", PH.flip(rib), { m: PH.m4(x, cy, 0), grime: 0.3 });
        }
        // ends: close the vault above the walls
        b.boxMM("plaster", -24.3, SPRING, -12, -24.05, CROWN + 0.6, 12, {
          seg: false,
        });
        b.boxMM("plaster", 24.05, SPRING, -12, 24.3, CROWN + 0.6, 12, {
          seg: false,
        });
        PH.colMM(-24, CROWN, -12, 24, CROWN + 0.5, 12, { walkable: false });
      }
      // clerestory windows (arched, "daylight") above the galleries, between the dorm doors
      for (const z of [-12, 12])
        for (const x of [-21, -15, -9, -3, 3, 9, 15, 21]) {
          if (z < 0 && [-16, 0, 16].some((dx) => Math.abs(dx - x) < 1.5))
            continue;
          PH.window(
            b,
            x,
            z + (z < 0 ? 0.27 : -0.27),
            z < 0 ? 0 : Math.PI,
            0,
            13.4,
            2.6,
            3.4,
            "open",
            {
              arch: true,
              frame: "limestone",
              mull: "iron",
              keystone: false,
              paneZ: 0.0,
            },
          );
          const [qx, qz] = [x, z + (z < 0 ? 0.262 : -0.262)]; // daylight pane just proud of the wall face
          b.geo(
            "daylight",
            new THREE.ShapeGeometry(PH.archShape(2.5, 3.3), 10),
            PH.m4(qx, 13.4, qz, z < 0 ? 0 : Math.PI),
          );
        }
      // great west lunette (the facade's arched windows, seen from inside)
      b.geo(
        "daylight",
        new THREE.ShapeGeometry(PH.archShape(10, 7.2), 20),
        PH.m4(-23.7, 13.2, 0, Math.PI / 2),
      );
      b.extrude("limestone", PH.archRing(10, 7.2, 0.4), 0.3, {
        m: PH.m4(-23.8, 13.2, 0, Math.PI / 2),
      });
      for (let k = -2; k <= 2; k++)
        b.box(
          "iron",
          -23.55,
          13.2,
          k * 2,
          0.06,
          7.2 - Math.abs(k) * 0.5,
          0.08,
          { seg: false },
        );
      for (let k = 1; k < 4; k++)
        b.box(
          "iron",
          -23.55,
          13.2 + k * 1.6,
          0,
          0.06,
          0.08,
          10 - (k === 3 ? 2 : 0),
          { seg: false },
        );
      b.addLight(-20, 15, 0, 0xb8c0a0, 16, 0.6);
      // east end: great arched window over the Stairs of Separation arch
      b.geo(
        "daylight",
        new THREE.ShapeGeometry(PH.archShape(8, 6), 20),
        PH.m4(23.7, 13.5, 0, -Math.PI / 2),
      );
      b.extrude("limestone", PH.archRing(8, 6, 0.4), 0.3, {
        m: PH.m4(23.8, 13.5, 0, -Math.PI / 2),
      });
      b.extrude("limestone", PH.archRing(3.0, 3.4, 0.35), 0.4, {
        m: PH.m4(23.6, RY, 0, -Math.PI / 2),
      });
      const sepK = PH.signMat(
        "ellis_separation",
        ["THE STAIRS OF SEPARATION", "NEW YORK · NEW JERSEY · DETENTION"],
        "engraved",
        1024,
        192,
        { bg: "#b8ae98" },
      );
      b.quad(sepK, 23.68, RY + 4.4, 0, 5.2, 1.0, { ry: -Math.PI / 2 });

      // galleries (U-shape) at DY with iron railing & columns
      floorPair(b, -24, -12, 24, -9, DY, "redtile", "guastavino");
      floorPair(b, -24, 9, 24, 12, DY, "redtile", "guastavino");
      floorPair(b, -24, -9, -21, 9, DY, "redtile", "guastavino");
      for (const x of [-18, -12, -6, 0, 6, 12, 18])
        for (const z of [-9, 9]) {
          if (x === 0 && z === 9) continue;
          b.cyl(
            "iron",
            x,
            RY,
            z + (z < 0 ? 0.2 : -0.2),
            0.14,
            0.17,
            DY - RY - 0.3,
            10,
            { hSeg: 2 },
          );
          b.cyl(
            "iron",
            x,
            DY - 0.75,
            z + (z < 0 ? 0.2 : -0.2),
            0.35,
            0.15,
            0.45,
            10,
            { hSeg: 1 },
          );
          PH.col(x, z + (z < 0 ? 0.2 : -0.2), 0.36, 0.36, RY, DY - 0.3, 0, {
            walkable: false,
          });
        }
      for (const z of [-6, 0, 6]) {
        b.cyl("iron", -21.2, RY, z, 0.14, 0.17, DY - RY - 0.3, 10, { hSeg: 2 });
        PH.col(-21.2, z, 0.36, 0.36, RY, DY - 0.3, 0, { walkable: false });
      }
      PH.railing(
        b,
        [
          [-21, -9],
          [24, -9],
        ],
        DY,
        1.05,
        "iron",
        { postStep: 0.5, r: 0.03 },
      );
      PH.railing(
        b,
        [
          [-21, 9],
          [24, 9],
        ],
        DY,
        1.05,
        "iron",
        { postStep: 0.5, r: 0.03 },
      );
      PH.railing(
        b,
        [
          [-21, -9],
          [-21, 9],
        ],
        DY,
        1.05,
        "iron",
        { postStep: 0.5, r: 0.03 },
      );
      // gallery fascia (tile) and big hanging flags
      for (const z of [-9, 9])
        b.boxMM("limestone", -21, DY - 0.6, z - 0.08, 24, DY - 0.3, z + 0.08, {
          seg: false,
        });
      for (const [x, z] of [
        [-15, -8.78],
        [-3, -8.78],
        [9, -8.78],
        [-9, 8.78],
        [3, 8.78],
        [15, 8.78],
      ])
        hangFlag(b, flagK, x, DY + 0.9, z, z < 0 ? 0 : Math.PI, 4.2, 2.4);
      // grand stair opening railing
      PH.railing(
        b,
        [
          [-2.3, -0.5],
          [-2.3, 10.2],
          [2.3, 10.2],
          [2.3, -0.5],
        ],
        RY,
        1.0,
        "bronze",
        { postStep: 0.6, r: 0.03 },
      );
      // chandeliers (iron rings of globes) hanging from the crown
      for (const x of [-15, -5, 5, 15]) {
        b.rod("iron", PH.v3(x, CROWN, 0), PH.v3(x, 15.4, 0), 0.04, 5);
        b.cyl("iron", x, 15.2, 0, 1.7, 1.7, 0.1, 20, { open: true, hSeg: 1 });
        b.cyl("iron", x, 15.1, 0, 1.2, 1.2, 0.08, 16, { open: true, hSeg: 1 });
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * TAU;
          const px = x + Math.cos(a) * 1.7,
            pz = Math.sin(a) * 1.7;
          const lit = !(x === 5 && k % 3 === 0);
          b.sphere(lit ? "lamp" : "glass", px, 14.95, pz, 0.17, {
            ws: 8,
            hs: 6,
            noAO: true,
          });
          b.rod("iron", PH.v3(x, 16.6, 0), PH.v3(px, 15.2, pz), 0.015, 3);
        }
        b.addLight(x, 14.6, 0, 0xffd8a0, 16, 0.75);
      }
      // benches in rows (west half) facing the dais
      for (let row = 0; row < 5; row++)
        for (const z of [-6.5, -3.4, 3.4, 6.5]) {
          if (row === 4 && z > 0) continue;
          bench(b, -18 + row * 2.2, RY, z, Math.PI / 2, 2.8);
        }
      // THE REGISTRAR'S DAIS (east end): platform, long clerks' desk, ledger lamps, flag
      b.boxMM("wood_dark", 14, RY, -7, 22.5, RY + 0.6, 7, { grime: 0.4 });
      PH.colMM(14, RY, -7, 22.5, RY + 0.6, 7, { surface: "wood" });
      for (const z of [-3, 3])
        PH.stairs(
          b,
          "wood_dark",
          13.1,
          z,
          Math.PI / 2,
          1.6,
          0.9,
          RY,
          RY + 0.6,
          {},
        );
      b.boxMM("wood_dark", 17.3, RY + 0.6, -5.5, 18.2, RY + 1.7, 5.5, {
        seg: false,
      });
      b.boxMM("wood", 17.1, RY + 1.7, -5.7, 18.4, RY + 1.78, 5.7, {
        seg: false,
      });
      PH.colMM(17.3, RY + 0.6, -5.5, 18.2, RY + 1.78, 5.5, { walkable: false });
      for (const z of [-4, -1.5, 1.5, 4]) {
        b.cyl("bronze", 17.7, RY + 1.78, z, 0.06, 0.08, 0.35, 6, { hSeg: 1 });
        b.box("paint_green", 17.7, RY + 2.1, z, 0.25, 0.1, 0.55, {
          seg: false,
          noAO: true,
        });
        b.box("lamp", 17.7, RY + 2.05, z, 0.2, 0.03, 0.5, {
          seg: false,
          noAO: true,
        });
        b.box("paper", 17.75, RY + 1.79, z + 0.4, 0.5, 0.03, 0.35, {
          ry: 0.2,
          seg: false,
        });
        b.addLight(17.2, RY + 2.3, z, 0xfff0c8, 4, 0.5);
      }
      const regDeskK = PH.signMat(
        "ellis_desk",
        ["REGISTRY", "STATE YOUR NAME, ORIGIN & AILMENTS"],
        "engraved",
        1024,
        192,
        { bg: "#9a8e74" },
      );
      b.quad(regDeskK, 17.25, RY + 1.2, 0, 7, 1.0, { ry: -Math.PI / 2 });
      hangFlag(b, flagK, 22.3, RY + 7.5, 0, -Math.PI / 2, 5, 3);
      A.registrar = PH.A(19.6, RY + 0.6, 0.6, Math.PI / 2);
      A.merchant = PH.A(-2, RY, -9.2, Math.PI);
      A.npc3 = PH.A(-10, RY, 1.5, -Math.PI / 2);
      A.npc4 = PH.A(8, RY, -4, 0);
      A.guard1 = PH.A(10, RY, 7, Math.PI / 2);
      A.hall = PH.A(-6, RY, 0, -Math.PI / 2);
      // market stall frames (the props module adds its market_stall kit on top), cots, the settlers' brazier
      for (const [x, z, sign] of [
        [-2, -10.4, "TOMAS'S CUSTOMS HOUSE"],
        [6, -10.4, "SCRAP & SUNDRIES"],
      ]) {
        b.boxMM("wood", x - 2, RY, z - 0.5, x + 2, RY + 1.0, z + 0.5, {
          seg: false,
        });
        for (const s of [-1, 1])
          b.box("rotten", x + s * 1.9, RY, z - 0.4, 0.12, 2.6, 0.12, {
            seg: false,
          });
        b.box("canvas", x, RY + 2.6, z - 0.1, 4.3, 0.06, 1.8, {
          rx: -0.18,
          seg: false,
          c: 0xa86a4a,
        });
        const sk = PH.signMat("ellis_stall_" + x, [sign], "raider", 512, 128, {
          bg: "#4a5a52",
          fg: "#f0e0b0",
        });
        b.quad(sk, x, RY + 2.25, z + 0.52, 3.4, 0.62, {});
        PH.colMM(x - 2, RY, z - 0.5, x + 2, RY + 1.0, z + 0.5, {});
        for (let i = 0; i < 8; i++)
          b.box(
            ["crate", "metal", "cardboard"][i % 3],
            x - 1.6 + i * 0.45,
            RY + 1.0,
            z + (r() - 0.5) * 0.4,
            0.3,
            0.2 + r() * 0.25,
            0.3,
            { seg: false },
          );
      }
      for (let k = 0; k < 5; k++) {
        const x = 3 + k * 2.2,
          z = 10.4;
        b.box("canvas", x, RY + 0.3, z, 0.8, 0.12, 1.9, {
          seg: false,
          c: 0xb8a888,
        });
        b.box("fabric", x, RY + 0.42, z - 0.3, 0.7, 0.1, 1.1, {
          seg: false,
          c: [0x6a4a3a, 0x3a4a5a, 0x7a6a4a][k % 3],
        });
        for (const [lx, lz] of [
          [-0.35, -0.9],
          [0.35, -0.9],
          [-0.35, 0.9],
          [0.35, 0.9],
        ])
          b.box("wood", x + lx, RY, z + lz, 0.05, 0.3, 0.05, { seg: false });
      }
      b.cyl("rust", 7, RY, 1, 0.5, 0.45, 0.8, 12, { hSeg: 1 });
      b.sphere("fire", 7, RY + 0.85, 1, 0.35, { sy: 0.6, noAO: true });
      b.addLight(7, RY + 1.5, 1, 0xff9a4a, 9, 1.0);
      PH.col(7, 1, 1.1, 1.1, RY, RY + 0.8, 0, { walkable: false });
      // string lights across the hall (the settlement's own wiring)
      for (let k = 0; k < 6; k++) {
        const x = -20 + k * 8;
        for (let t = 0; t <= 16; t++) {
          const z = -8.8 + t * 1.1,
            y = DY - 0.2 - Math.sin((t / 16) * Math.PI) * 1.6;
          if (t % 2 === 0)
            b.sphere(t % 6 === 0 ? "lamp_red" : "lamp", x, y, z, 0.06, {
              ws: 6,
              hs: 4,
              noAO: true,
            });
        }
        b.addLight(x, DY - 1.8, 0, 0xffc890, 7, 0.4);
      }
      const hallK = PH.signMat(
        "ellis_hall_rules",
        [
          "THE REGISTRY — HOUSE RULES",
          "1. NO SHOOTING IN THE HALL",
          "2. STRANGERS WELCOME (MIND YOUR MANNERS)",
          "3. MANIACS ARE NOT RESIDENTS",
          "4. SEE THE REGISTRAR ON ARRIVAL",
        ],
        "chalk",
        768,
        512,
      );
      b.quad(hallK, -23.72, RY + 2.4, -6, 2.4, 1.6, { ry: Math.PI / 2 });
      PH.readAt(
        -23.4,
        RY + 2.2,
        -6,
        "House Rules",
        "1. No shooting in the Hall. 2. Strangers welcome (mind your manners). 3. Maniacs are not residents, no matter whose coat they are wearing. 4. See the Registrar on arrival. 5. Soup is 5 scrip. Complaints about the soup are 10.",
      );

      // =====================================================================
      // MEDICAL INSPECTION (west wing, y 6.5)
      // =====================================================================
      b.boxMM("plaster", -40, RY + 4.2, -12, -24.25, RY + 4.5, 12, {
        grime: 0.5,
      });
      PH.wall(b, "plaster", -40, -12, -24, -12, RY, RY + 4.2, [], {
        wainscot: { key: "tile_white", h: 1.8 },
      });
      PH.wall(b, "plaster", -40, 12, -24, 12, RY, RY + 4.2, [], {
        wainscot: { key: "tile_white", h: 1.8 },
      });
      PH.wall(b, "plaster", -40, -12, -40, 12, RY, RY + 4.2, [], {
        wainscot: { key: "tile_white", h: 1.8 },
      });
      // corridor walls (z = -2 and z = 2) with room doors
      PH.wall(
        b,
        "plaster",
        -40,
        -2,
        -24,
        -2,
        RY,
        RY + 4.2,
        [
          { c: 4, w: 1.4, h: 2.3 },
          { c: 12, w: 1.4, h: 2.3 },
        ],
        { wainscot: { key: "tile_white", h: 1.8 } },
      );
      PH.wall(
        b,
        "plaster",
        -40,
        2,
        -24,
        2,
        RY,
        RY + 4.2,
        [
          { c: 4, w: 1.4, h: 2.3 },
          { c: 12, w: 1.4, h: 2.3 },
        ],
        { wainscot: { key: "tile_white", h: 1.8 } },
      );
      PH.wall(b, "plaster", -32, -12, -32, -2, RY, RY + 4.2, [], {
        wainscot: { key: "tile_white", h: 1.8 },
      });
      PH.wall(b, "plaster", -32, 2, -32, 12, RY, RY + 4.2, [], {
        wainscot: { key: "tile_white", h: 1.8 },
      });
      for (const x of [-37, -29])
        PH.tubeLamp(b, x, RY + 4.2, 0, 2.0, Math.PI / 2, { dead: x === -37 });
      const medK = PH.signMat(
        "ellis_medical",
        ["MEDICAL INSPECTION", "U.S. PUBLIC HEALTH SERVICE"],
        "enamel",
        768,
        192,
        { bg: "#e8e2d0", fg: "#2a2a2a" },
      );
      b.quad(medK, -24.3, RY + 3.2, 0, 2.6, 0.65, { ry: Math.PI / 2 });
      // door labels
      for (const [x, z, t, ry2] of [
        [-36, -1.84, "EYE EXAMINATION", 0],
        [-28, -1.84, "MENTAL INSPECTION", 0],
        [-36, 1.84, "CLINIC", Math.PI],
        [-28, 1.84, "SURGERY", Math.PI],
      ]) {
        const k = PH.signMat("ellis_lbl_" + x + z, [t], "enamel", 512, 96, {
          bg: "#e8e2d0",
          fg: "#2a2a2a",
        });
        b.quad(k, x, RY + 2.65, z, 1.4, 0.26, { ry: ry2 });
      }
      // NW: Eye examination (trachoma: the dreaded buttonhook)
      {
        const eyeK = PH.texMat("ellis_eyechart", eyeChartTex(), {});
        b.quad(eyeK, -39.82, RY + 1.8, -7, 1.0, 1.4, { ry: Math.PI / 2 });
        b.box("wood", -34, RY, -9, 0.6, 0.45, 0.6, { seg: false }); // stool
        b.boxMM("scratched", -33, RY, -11.6, -31.3, RY + 0.95, -9.5, {
          seg: false,
        });
        PH.colMM(-33, RY, -11.6, -31.3, RY + 0.95, -9.5, {});
        for (let i = 0; i < 6; i++)
          b.rod(
            "chrome",
            PH.v3(-32.6 + i * 0.2, RY + 0.96, -10.6),
            PH.v3(-32.5 + i * 0.2, RY + 0.96, -10.2),
            0.01,
            3,
          );
        b.rock("bone", -35.5, RY + 0.1, -5, 0.18, { detail: 0 });
        PH.skeleton(b, -36, RY, -8, 0.8, {});
        const chalkK = PH.signMat(
          "ellis_chalk_legend",
          [
            "CHALK MARKS",
            "B — BACK   C — CONJUNCTIVITIS",
            "CT — TRACHOMA   E — EYES",
            "H — HEART   L — LAMENESS",
            "X — SUSPECTED MENTAL DEFECT",
            "G — GLOWING (ADDED 1967)",
          ],
          "chalk",
          768,
          640,
        );
        b.quad(chalkK, -38, RY + 2.1, -11.82, 2.2, 1.8, {});
        PH.readAt(
          -38,
          RY + 1.8,
          -11.4,
          "Chalk Mark Legend",
          'B — back. C — conjunctivitis. CT — trachoma. E — eyes. H — heart. L — lameness. X — suspected mental defect. Someone has added, in fresh chalk: "M — muttering (Maniac risk, see Doc)."',
        );
      }
      // NE: Mental inspection — puzzle tables, the Knox cube test
      {
        b.boxMM("wood", -30.5, RY + 0.75, -9, -26, RY + 0.82, -6.5, {
          seg: false,
        });
        for (const [x, z] of [
          [-30.3, -8.8],
          [-26.2, -8.8],
          [-30.3, -6.7],
          [-26.2, -6.7],
        ])
          b.box("wood", x, RY, z, 0.06, 0.75, 0.06, { seg: false });
        PH.colMM(-30.5, RY, -9, -26, RY + 0.82, -6.5, {});
        for (let i = 0; i < 4; i++)
          b.box(
            "paint_red",
            -29.5 + i * 0.4,
            RY + 0.82,
            -7.8,
            0.12,
            0.12,
            0.12,
            { seg: false },
          );
        b.boxMM("paint_yellow", -28, RY + 0.82, -8.5, -27, RY + 0.86, -7.2, {
          seg: false,
        });
        b.box("wood", -28, RY, -5, 0.5, 0.45, 0.5, { seg: false });
        PH.skeleton(b, -28.2, RY + 0.45, -4.8, Math.PI, { sit: true });
        const mK = PH.signMat(
          "ellis_knox",
          [
            "PLEASE ARRANGE THE BLOCKS",
            "IN THE ORDER TAPPED",
            "(ANY ORDER ACCEPTED AFTER 1967)",
          ],
          "paper",
          512,
          256,
        );
        b.quad(mK, -26.2, RY + 2.2, -11.82, 1.4, 0.7, {});
      }
      // SW: CLINIC (Doc Tran) — beds, IV stands, medicine cabinets, surgical lamp
      {
        for (let k = 0; k < 3; k++) {
          const z = 4.5 + k * 2.6;
          b.boxMM(
            "iron",
            -39.6,
            RY + 0.55,
            z - 0.45,
            -37.6,
            RY + 0.6,
            z + 0.45,
            { seg: false },
          );
          b.boxMM(
            "paint_white",
            -39.5,
            RY + 0.6,
            z - 0.42,
            -37.7,
            RY + 0.72,
            z + 0.42,
            { seg: false },
          );
          for (const [x, zz] of [
            [-39.5, z - 0.4],
            [-37.7, z - 0.4],
            [-39.5, z + 0.4],
            [-37.7, z + 0.4],
          ])
            b.box("iron", x, RY, zz, 0.04, 0.55, 0.04, { seg: false });
          b.cyl("chrome", -37.1, RY, z + 0.5, 0.02, 0.02, 1.8, 5, { hSeg: 1 });
          b.box("glass", -37.1, RY + 1.6, z + 0.5, 0.12, 0.2, 0.05, {
            seg: false,
          });
          PH.colMM(-39.6, RY, z - 0.45, -37.6, RY + 0.72, z + 0.45, {});
        }
        b.boxMM("paint_white", -33, RY, 11.3, -32.3, RY + 2.0, 8, {
          seg: false,
        });
        for (let y = 0.4; y < 2; y += 0.45)
          for (let i = 0; i < 6; i++)
            b.cyl(
              i % 2 ? "glass" : "paint_teal",
              -32.8 + (i % 2) * 0.2,
              RY + y,
              8.3 + i * 0.5,
              0.05,
              0.05,
              0.16,
              6,
              { hSeg: 1 },
            );
        PH.colMM(-33, RY, 8, -32.3, RY + 2, 11.3, { walkable: false });
        const clinK = PH.signMat(
          "ellis_clinic",
          [
            "DOC TRAN — CLINIC",
            "TONIC · PRUSSIAN BLUE · SECOND OPINIONS",
            "FORGETTING NAMES? SEE ME BEFORE YOU SEE YOUR FRIENDS",
          ],
          "chalk",
          768,
          384,
        );
        b.quad(clinK, -36, RY + 2.4, 11.82, 2.6, 1.3, { ry: Math.PI });
        PH.hangLamp(b, -35, RY + 4.2, 6.5, 1.3, { color: 0xfff0d0 });
        A.doctor = PH.A(-35, RY, 7.5, Math.PI / 2);
      }
      // SE: SURGERY — operating table, surgical lamp, bloody tray
      {
        b.boxMM("chrome", -29, RY + 0.9, 6, -27, RY + 0.98, 7, { seg: false });
        b.cyl("iron", -28, RY, 6.5, 0.12, 0.2, 0.9, 8, { hSeg: 1 });
        PH.colMM(-29, RY, 6, -27, RY + 0.98, 7, {});
        b.lathe(
          "chrome",
          [
            [0.05, 0],
            [0.4, -0.15],
            [0.5, -0.3],
          ],
          16,
          -28,
          RY + 3.2,
          6.5,
          {},
        );
        b.sphere("lamp_cold", -28, RY + 2.95, 6.5, 0.25, {
          sy: 0.3,
          noAO: true,
        });
        b.rod(
          "iron",
          PH.v3(-28, RY + 4.2, 6.5),
          PH.v3(-28, RY + 3.2, 6.5),
          0.03,
          4,
        );
        b.box("scratched", -26, RY + 0.85, 9, 0.8, 0.04, 0.5, { seg: false });
        b.box("goo", -28.2, RY + 0.985, 6.4, 0.5, 0.01, 0.4, {
          seg: false,
          noAO: true,
        });
        A.surgery = PH.A(-28, RY, 9, Math.PI);
      }
      A.medical = PH.A(-30, RY, 0, Math.PI / 2);

      // =====================================================================
      // EAST WING (y 6.5): landing, Registrar's office, Records room; Stairs of Separation shaft
      // =====================================================================
      // landing (x 24..27, z -4..4) floor exists (floorPair above). Office & records rooms:
      PH.wall(b, "wallpaper", 24, -12, 40, -12, RY, RY + 4.3, [], {});
      PH.wall(b, "wallpaper", 24, 12, 40, 12, RY, RY + 4.3, [], {});
      PH.wall(
        b,
        "wallpaper",
        24,
        -4,
        40,
        -4,
        RY,
        RY + 4.3,
        [{ c: 1.8, w: 1.4, h: 2.3 }],
        {},
      );
      PH.wall(
        b,
        "wallpaper",
        24,
        4,
        40,
        4,
        RY,
        RY + 4.3,
        [{ c: 1.8, w: 1.4, h: 2.3 }],
        {},
      );
      b.boxMM("plaster", 24, RY + 4.3, -12, 40, RY + 4.6, 12, { grime: 0.5 });
      PH.colMM(24, RY + 4.3, -12, 40, RY + 4.6, 12, { walkable: false });
      // the shaft: stair descends east from the landing to the waiting room
      PH.stairs(b, "marble", 27, 0, Math.PI / 2, 2.6, 10.5, RY, GY, {
        rails: "bronze",
      });
      // the other two flights: collapsed (rubble and a broken balustrade)
      for (const z of [-2.7, 2.7]) {
        for (let k = 0; k < 6; k++)
          b.rock(
            "rubble",
            29 + k * 1.6,
            0.4 + (5 - k) * 0.6,
            z + (r() - 0.5) * 0.5,
            0.6 + r() * 0.4,
            { rough: 0.5 },
          );
        PH.col(33, z, 10, 1.2, 0, RY - 1.5, 0, { walkable: false });
        b.box("marble", 28.5, RY - 1.2, z, 2.2, 0.3, 1.1, {
          rz: -0.4,
          seg: false,
        });
      }
      const leftK = PH.signMat(
        "ellis_left",
        ["◂ NEW JERSEY (CLOSED)"],
        "enamel",
        512,
        96,
        { bg: "#3a2a1c" },
      );
      const rightK = PH.signMat(
        "ellis_right",
        ["NEW YORK ▸ (MIND THE STEP)"],
        "enamel",
        512,
        96,
        { bg: "#1c3a2a" },
      );
      b.quad(leftK, 26.2, RY + 2.7, -3.84, 1.6, 0.3, {});
      b.quad(rightK, 26.2, RY + 2.7, 3.84, 1.6, 0.3, { ry: Math.PI });
      PH.hangLamp(b, 32, RY + 4.3, 0, 1.2, {});
      // Registrar's office (x 24..40, z -12..-4)
      PH.slab(b, "carpet", 27, -11.8, 38, -5, RY + 0.02, 0.02);
      b.boxMM("wood_dark", 33, RY, -10, 36.5, RY + 0.8, -8.8, { seg: false });
      PH.colMM(33, RY, -10, 36.5, RY + 0.8, -8.8, {});
      for (let i = 0; i < 4; i++)
        b.boxMM(
          "wood_dark",
          38.8,
          RY,
          -11.6 + i * 1.6,
          39.7,
          RY + 2.4,
          -10.2 + i * 1.6,
          { seg: false },
        );
      for (let i = 0; i < 4; i++)
        for (let y = 0.3; y < 2.3; y += 0.5)
          for (let k = 0; k < 6; k++)
            b.box(
              ["leather", "paper", "cardboard"][k % 3],
              38.9,
              RY + y,
              -11.4 + i * 1.6 + k * 0.2,
              0.5,
              0.35,
              0.14,
              { seg: false, c: [0x7a3a2a, 0x3a4a6a, 0x6a5a3a][k % 3] },
            );
      PH.colMM(38.8, RY, -11.6, 39.7, RY + 2.4, -4.2, { walkable: false });
      const portK = PH.signMat(
        "ellis_portrait",
        ["COMMISSIONER", "W. WILLIAMS", "1902"],
        "engraved",
        256,
        320,
        { bg: "#5a4a38", fg: "#d8c8a0" },
      );
      b.quad(portK, 32, RY + 2.3, -11.82, 1.0, 1.25, {});
      PH.hangLamp(b, 32, RY + 4.3, -8, 1.2, {});
      A.office = PH.A(34.5, RY, -7.5, Math.PI);
      A.office_terminal = PH.A(34.7, RY + 0.8, -9.4, 0);
      // Records room (x 24..40, z 4..12) — locked; the reward room
      PH.slab(b, "wood", 24.2, 4.2, 39.8, 11.8, RY + 0.02, 0.02);
      for (let row = 0; row < 3; row++) {
        const z = 6 + row * 2.2;
        for (let x = 28; x < 39; x += 1.2) {
          b.boxMM("metal", x, RY, z - 0.3, x + 1.1, RY + 2.6, z + 0.3, {
            seg: false,
            c: 0x8a9088,
          });
          for (let d = 0; d < 5; d++)
            b.box(
              "chrome",
              x + 0.55,
              RY + 0.3 + d * 0.5,
              z + 0.31,
              0.2,
              0.05,
              0.03,
              { seg: false },
            );
        }
        PH.colMM(28, RY, z - 0.3, 39, RY + 2.6, z + 0.3, { walkable: false });
      }
      for (let i = 0; i < 30; i++)
        b.box(
          "paper",
          25 + r() * 3,
          RY + 0.03,
          5 + r() * 6.5,
          0.3,
          0.01,
          0.22,
          { ry: r() * 3, seg: false, noAO: true },
        );
      PH.skeleton(b, 26, RY, 10.5, 2.4, {});
      PH.hangLamp(b, 32, RY + 4.3, 8, 1.2, { color: 0xffe8c0 });
      A.records = PH.A(26, RY, 8, -Math.PI / 2);
      A.loot1 = PH.A(25, RY, 11.2, Math.PI);

      // =====================================================================
      // STAIR HALL (x -24..-8, z -21..-12, y 6.5) and the DORMITORY level (y 12.5)
      // =====================================================================
      PH.slab(b, "terrazzo", -24, -21, -8, -15, RY, 0.05);
      PH.wall(b, "plaster", -24, -21, -8, -21, RY, DY, [], {
        wainscot: { key: "tile_white", h: 1.8 },
      });
      PH.wall(b, "plaster", -24, -21, -24, -12, RY, DY + 4.3, [], {
        wainscot: { key: "tile_white", h: 1.8 },
      });
      PH.wall(b, "plaster", -8, -21, -8, -12, RY, DY, [], {
        wainscot: { key: "tile_white", h: 1.8 },
      });
      PH.stairs(b, "terrazzo", -9.6, -18.8, -Math.PI / 2, 2.4, 12.2, RY, DY, {
        rails: "iron",
        railSides: [1],
      });
      PH.hangLamp(b, -14, DY - 0.3, -15, 1.0, {});
      const dormK = PH.signMat(
        "ellis_dorm_sign",
        ["DORMITORIES ▲", "LIGHTS OUT AT 9 (NOBODY SLEEPS ANYWAY)"],
        "enamel",
        768,
        160,
        { bg: "#27313a" },
      );
      b.quad(dormK, -8.18, RY + 2.5, -15.5, 2.8, 0.58, { ry: -Math.PI / 2 });
      // dorm floors at DY (with the stair opening in dorm A)
      floorPair(b, -24, -21, -21.8, -12, DY, "wood", "plaster");
      floorPair(b, -21.8, -21, -14, -20.2, DY, "wood", "plaster");
      floorPair(b, -21.8, -17.4, -14, -12, DY, "wood", "plaster");
      floorPair(b, -14, -21, 24, -12, DY, "wood", "plaster");
      PH.railing(
        b,
        [
          [-21.8, -17.4],
          [-14, -17.4],
          [-14, -20.2],
        ],
        DY,
        1.0,
        "iron",
        { postStep: 1 },
      );
      // dorm walls
      PH.wall(b, "plaster", -24, -21, 24, -21, DY, DY + 4.3, [], {
        wainscot: { key: "tile_white", h: 1.4 },
      });
      PH.wall(b, "plaster", 24, -21, 24, -12, DY, DY + 4.3, [], {});
      PH.wall(
        b,
        "plaster",
        -8,
        -21,
        -8,
        -12,
        DY,
        DY + 4.3,
        [{ c: 2, w: 1.2, h: 2.2 }],
        { wainscot: { key: "tile_white", h: 1.4 } },
      );
      PH.wall(b, "plaster", 8, -21, 8, -12, DY, DY + 4.3, [], {
        wainscot: { key: "tile_white", h: 1.4 },
      });
      b.boxMM("plaster", -24, DY + 4.3, -21, 24, DY + 4.6, -12, {
        grime: 0.55,
      });
      PH.colMM(-24, DY + 4.3, -21, 24, DY + 4.6, -12, { walkable: false });
      // Dorm A (women's) & B (men's): triple bunks, lived-in
      for (let k = 0; k < 4; k++)
        tripleBunk(b, -20 + k * 3.2, DY, -14, Math.PI / 2, true);
      for (let k = 0; k < 4; k++)
        tripleBunk(b, -5.5 + k * 3.4, DY, -19.6, 0, true);
      for (let k = 0; k < 3; k++)
        tripleBunk(b, -5.5 + k * 3.4, DY, -14.6, 0, true);
      for (let t = 0; t <= 20; t++) {
        const x = -23 + t * 1.5;
        if (x > 7) break;
        b.sphere(
          t % 4 ? "lamp" : "lamp_green",
          x,
          DY + 3.6 - Math.sin(t * 0.8) * 0.2,
          -16.5,
          0.05,
          { ws: 6, hs: 4, noAO: true },
        );
      }
      b.addLight(-16, DY + 3, -16.5, 0xffc890, 9, 0.7);
      b.addLight(0, DY + 3, -16.5, 0xffc890, 9, 0.7);
      const womK = PH.signMat(
        "ellis_wom",
        ["DORMITORY — WOMEN"],
        "enamel",
        512,
        96,
        { bg: "#e8e2d0", fg: "#2a2a2a" },
      );
      b.quad(womK, -16, DY + 2.7, -11.72, 1.6, 0.3, { ry: Math.PI });
      const menK = PH.signMat(
        "ellis_men",
        ["DORMITORY — MEN"],
        "enamel",
        512,
        96,
        { bg: "#e8e2d0", fg: "#2a2a2a" },
      );
      b.quad(menK, 0, DY + 2.7, -11.72, 1.6, 0.3, { ry: Math.PI });
      // lived-in clutter: laundry lines, suitcases under the bunks, a washstand, the residents' shrine of old photographs
      {
        for (const [x0, x1] of [
          [-23.4, -8.6],
          [-7.4, 7.4],
        ]) {
          const yl = DY + 2.35,
            zl = -12.7;
          b.rod("rope", PH.v3(x0, yl, zl), PH.v3(x1, yl, zl), 0.012, 3);
          for (let x = x0 + 0.8; x < x1 - 0.5; x += 1.1 + r() * 0.6) {
            const w = 0.45 + r() * 0.35,
              h = 0.5 + r() * 0.45;
            if (Math.abs(x + 16) < 1.3 || Math.abs(x) < 1.3) continue; // keep the gallery doorways clear
            b.box("fabric", x, yl - h, zl, w, h, 0.02, {
              seg: false,
              rz: (r() - 0.5) * 0.08,
              c: [0xb8b0a0, 0x7a5a4a, 0x5a6a7a, 0x9a8a6a, 0xa87a6a][
                (r() * 5) | 0
              ],
            });
          }
        }
        for (const [x, z] of [
          [-20, -14],
          [-16.8, -14],
          [-13.6, -14],
          [-10.4, -14],
          [-5.5, -19.6],
          [-2.1, -19.6],
          [1.3, -19.6],
          [4.7, -19.6],
          [-5.5, -14.6],
          [1.3, -14.6],
        ]) {
          if (r() < 0.25) continue;
          b.box(
            r() < 0.5 ? "leather" : "wood_dark",
            x + (r() - 0.5) * 0.6,
            DY,
            z + (r() - 0.5) * 0.3,
            0.7,
            0.24,
            0.42,
            {
              ry: (r() - 0.5) * 0.4,
              seg: false,
              c: [0x8a6a4a, 0x5a4a3a, 0x6a7a8a][(r() * 3) | 0],
            },
          );
        }
        // washstand & pitcher
        b.boxMM("wood_dark", -23.7, DY, -20.8, -22.9, DY + 0.8, -19.9, {
          seg: false,
        });
        b.cyl("paint_white", -23.3, DY + 0.8, -20.35, 0.3, 0.2, 0.14, 12, {
          hSeg: 1,
        });
        b.cyl("paint_white", -23.05, DY + 0.8, -20.1, 0.08, 0.1, 0.28, 8, {
          hSeg: 1,
        });
        PH.colMM(-23.7, DY, -20.8, -22.9, DY + 0.8, -19.9, { walkable: false });
        // the shrine: a small table heaped with photographs, candles, a Registry claim ticket, dried flowers
        b.boxMM("wood_dark", 7.0, DY, -18.4, 7.85, DY + 0.85, -15.6, {
          seg: false,
        });
        PH.colMM(7.0, DY, -18.4, 7.85, DY + 0.85, -15.6, { walkable: false });
        for (let i = 0; i < 9; i++)
          b.box(
            "paper",
            7.4 + (r() - 0.5) * 0.4,
            DY + 0.86,
            -18.1 + i * 0.3,
            0.14,
            0.18,
            0.012,
            {
              ry: Math.PI / 2 + (r() - 0.5) * 0.4,
              rx: -0.25,
              seg: false,
              c: 0xd8ccb0,
            },
          );
        for (let i = 0; i < 16; i++)
          b.box(
            "paper",
            7.92,
            DY + 1.1 + (i % 4) * 0.28,
            -18.2 + ((i / 4) | 0) * 0.62,
            0.01,
            0.2,
            0.16,
            { seg: false, c: [0xd8ccb0, 0xb8a888, 0xc8c0b0][i % 3] },
          );
        for (let i = 0; i < 6; i++) {
          const cz = -18 + i * 0.45;
          b.cyl(
            "paint_white",
            7.3,
            DY + 0.85,
            cz,
            0.03,
            0.03,
            0.1 + r() * 0.1,
            6,
            { hSeg: 1 },
          );
          b.sphere("fire", 7.3, DY + 1.02 + r() * 0.05, cz, 0.025, {
            noAO: true,
          });
        }
        b.addLight(7.2, DY + 1.3, -17, 0xffb870, 4.5, 0.9);
        const shrK = PH.signMat(
          "ellis_shrine",
          ["THOSE WHO CAME BEFORE", "— WE KEEP THE NAMES —"],
          "chalk",
          512,
          192,
        );
        b.quad(shrK, 7.93, DY + 2.45, -17, 1.6, 0.6, { ry: -Math.PI / 2 });
        PH.readAt(
          7.6,
          DY + 1.2,
          -17,
          "The Wall of Names",
          'Dozens of cracked photographs and yellowed Ellis Island landing cards, old-world tourists\' souvenir replicas mixed with real ones. Pencilled beside each: a name, a year of arrival, and sometimes a second year, marked "lost". Under one child\'s photo: "Kowalski, J. — 1989. We are sorry."',
        );
      }
      A.npc5 = PH.A(-18, DY, -17, 0);
      A.npc6 = PH.A(2, DY, -17, Math.PI / 2);
      // Dorm C: QUARANTINE WARD (locked; Maniacs; radiation) x 8..24
      {
        for (let k = 0; k < 3; k++)
          tripleBunk(b, 11.5 + k * 3.8, DY, -19.6, 0, false);
        PH.skeleton(b, 12, DY, -15, 0.6, {});
        PH.skeleton(b, 20, DY, -14.5, 2.2, {});
        for (let i = 0; i < 18; i++)
          b.box(
            "paper",
            9 + r() * 14,
            DY + 0.02,
            -20 + r() * 7.5,
            0.25,
            0.01,
            0.2,
            { ry: r() * 3, seg: false, noAO: true },
          );
        b.box("goo", 17, DY + 0.01, -16, 3, 0.02, 2, {
          seg: false,
          noAO: true,
        });
        b.boxMM("burlap", 9, DY, -12.9, 12, DY + 1.2, -12.3, {
          seg: false,
          c: 0x8a7a5a,
        }); // barricade the residents piled against the door
        const qK = PH.signMat(
          "ellis_quar",
          ["QUARANTINE", "MANIAC WARD — KEEP OUT"],
          "raider",
          512,
          192,
          { bg: "#6a6a5e", fg: "#c8321c" },
        );
        b.quad(qK, 16, DY + 2.9, -11.72, 1.8, 0.66, { ry: Math.PI });
        b.addLight(16, DY + 1, -16, 0x6aff50, 8, 0.45);
        A.quarantine = PH.A(16, DY, -14, 0);
        A.qloot = PH.A(22.5, DY, -20, 0);
        A.maniac1 = PH.A(12, DY, -16, Math.PI);
        A.maniac2 = PH.A(19, DY, -17, Math.PI);
        A.maniac3 = PH.A(22, DY, -14, Math.PI);
        try {
          G.world.addRadSource({
            x: O.x + 17,
            y: DY,
            z: O.z - 16,
            radius: 5,
            strength: 2,
          });
        } catch (e) {
          /* */
        }
      }
      // BOARD OF SPECIAL INQUIRY (x -8..8, z 12..20, y 12.5)
      {
        floorPair(b, -8, 12, 8, 20, DY, "wood", "plaster");
        PH.wall(b, "wallpaper", -8, 20, 8, 20, DY, DY + 4.3, [], {});
        PH.wall(b, "wallpaper", -8, 12, -8, 20, DY, DY + 4.3, [], {});
        PH.wall(b, "wallpaper", 8, 12, 8, 20, DY, DY + 4.3, [], {});
        b.boxMM("plaster", -8, DY + 4.3, 12, 8, DY + 4.6, 20, { grime: 0.5 });
        PH.colMM(-8, DY + 4.3, 12, 8, DY + 4.6, 20, { walkable: false });
        // judges' bench on a platform, witness chair, rail
        b.boxMM("wood_dark", -5, DY, 17.5, 5, DY + 0.45, 19.8, { seg: false });
        PH.colMM(-5, DY, 17.5, 5, DY + 0.45, 19.8, { surface: "wood" });
        b.boxMM("wood_dark", -4.5, DY + 0.45, 17.5, 4.5, DY + 1.55, 18.1, {
          seg: false,
        });
        PH.colMM(-4.5, DY + 0.45, 17.5, 4.5, DY + 1.55, 18.1, {
          walkable: false,
        });
        for (const x of [-2.5, 0, 2.5]) {
          b.box("leather", x, DY + 0.45, 19, 0.6, 1.3, 0.55, {
            seg: false,
            c: 0x5a2a1a,
          });
          PH.skeleton(b, x, DY + 0.45, 18.9, Math.PI, { sit: true });
        }
        b.box("wood", 0, DY, 14.5, 0.55, 0.9, 0.55, { seg: false });
        PH.skeleton(b, 0, DY, 14.4, 0, { sit: true });
        const bsiK = PH.signMat(
          "ellis_bsi",
          ["BOARD OF SPECIAL INQUIRY"],
          "engraved",
          1024,
          128,
          { bg: "#9a8e74" },
        );
        b.quad(bsiK, 0, DY + 3.2, 19.82, 5, 0.6, { ry: Math.PI });
        hangFlag(b, flagK, -6.5, DY + 3.9, 19.7, Math.PI, 2.4, 1.4);
        PH.hangLamp(b, 0, DY + 4.3, 16, 1.4, { color: 0xffe0b0 });
        A.inquiry = PH.A(0, DY, 13.5, Math.PI);
        A.bsi_terminal = PH.A(3.2, DY + 1.55, 17.8, Math.PI);
      }
      A.gallery = PH.A(0, DY, -10.5, Math.PI);
      A.spawn1 = PH.A(-10, RY, 5, 0);
      A.spawn2 = PH.A(10, RY, -5, 0);
      A.spawn3 = PH.A(-12, GY, 0, 0);
      A.spawn4 = PH.A(12, GY, 0, 0);
      A.spawn5 = PH.A(0, DY, -10.5, 0);
      A.spawn6 = PH.A(30, GY, 0, 0);
      A.loot2 = PH.A(-38.6, RY, -11, 0);
      A.loot3 = PH.A(-3, GY, -13.8, 0);
      A.loot4 = PH.A(22.5, DY, -20, 0);
      A.npc7 = PH.A(-22.5, DY, 0, -Math.PI / 2);
      A.guard2 = PH.A(2.5, GY, -16.8, Math.PI);

      // ---------------- props (spawned at initDone, persistent) ----------------
      PH.propAt("footlocker", -3, GY, -13.8, 0, {
        loot: "luggage",
        name: "Unclaimed Trunk",
      });
      PH.propAt("footlocker", 21, GY, 3, Math.PI / 2, {
        loot: "luggage",
        name: "Unclaimed Trunk",
      });
      PH.propAt("duffle_bag", -20, GY, 7, 0.6, { loot: "luggage" });
      PH.propAt("first_aid", -39.7, RY + 1.3, -1, -Math.PI / 2, {
        loot: "medical_cabinet",
      });
      PH.propAt("file_cabinet", -38.6, RY, -11, 0, { loot: "file_cabinet" });
      PH.propAt("terminal", 34.7, RY + 0.8, -9.4, 0, {
        mount: "bare",
        terminalId: "ph_ellis_registry",
      });
      PH.propAt("terminal", 3.2, DY + 1.55, 17.8, Math.PI, {
        mount: "bare",
        terminalId: "ph_ellis_bsi",
      });
      PH.propAt("safe", 25, RY, 11.2, Math.PI, {
        items: [
          ["scrip", 180],
          ["old_dollars", 4],
          ["gold_bar", 1],
          ["rally_tonic", 2],
        ],
        name: "Registry Safe",
        lock: PH.regLock({
          id: "ph_lk_ellis_safe",
          label: "Registry Safe",
          kind: "safe",
          code: "1892",
          hint: "The brass plate on the safe says when the station opened; someone scratched a hint under it.",
        }),
      });
      PH.readLearnAt(
        25,
        RY + 1.0,
        10.6,
        "Brass Plate (Registry Safe)",
        '"U.S. IMMIGRATION STATION — ELLIS ISLAND — OPENED 1 JANUARY 1892." Scratched underneath with a nail: "yes Augustine that IS the combination, stop asking"',
        "ph_lk_ellis_safe",
      );
      PH.propAt("file_cabinet", 24.8, RY, 5, -Math.PI / 2, {
        loot: "file_cabinet",
      });
      PH.propAt("footlocker", 22.5, DY, -20, 0, {
        loot: "medical",
        name: "Quarantine Supplies",
      });
      PH.propAt("fridge", -39.3, GY, 1, -Math.PI / 2, { loot: "fridge" });
      PH.propAt("bed", -30.5, DY, -19.6, 0, {});
      PH.propAt("radio", 18.6, RY + 1.78, -5.2, Math.PI / 2, {});
      PH.propAt("workbench", 23, RY, 10.8, Math.PI, {});
      PH.propAt("fizzo_machine", 38.8, GY, -13.9, -Math.PI / 2, {});
      PH.propAt("shelf", -30.5, RY, 11.3, Math.PI, {});
      PH.propAt("lamp", 2, RY + 1.0, -10.4, 0, { kind: "lantern" });

      const g = b.build(root, { interior: true });
      g.name = "ellis_interior";
      PH.setOrigin(0, 0);

      // ---------------- doors ----------------
      const E = PH.ELLIS;
      try {
        PH.ellisEntryDoor = G.world.addDoor({
          id: "ph_ellis_front",
          pos: PH.v3(E.DOOR.x, 1.5, E.DOOR.z - 0.3),
          label: "Ellis Island — The Registry",
          verb: "Enter",
          radius: 1.6,
          target: { x: A.entrance.x, y: 0.05, z: A.entrance.z, yaw: Math.PI },
          sound: "door_open",
        });
        G.world.addDoor({
          id: "ph_ellis_exit",
          pos: PH.v3(O.x, 1.5, O.z - 21.6),
          label: "Ellis Island",
          verb: "Exit",
          radius: 1.6,
          target: { x: E.DOOR.x, y: 0.05, z: E.DOOR.z - 3.2, yaw: 0 },
          sound: "door_open",
        });
        // records room: the Registrar's key ("Huddled Masses" reward) — the museum teletype can also release it
        const recLock = PH.regLock({
          id: "ph_lk_ellis_records",
          label: "Records Room",
          kind: "door",
          key: "ph_key_ellis_records",
          hint: "Registrar Augustine gives his key to whoever brings Nadia home; his office teletype can release the lock.",
        });
        PH.recordsDoor = G.world.addInteractable({
          pos: PH.v3(O.x + 25.8, RY + 1.2, O.z + 4),
          radius: 0.9,
          label: "Records Room",
          verb: "Open",
          priority: 1,
          locked: () => (PH.flag("ellis_records_open") ? null : "Locked"),
          onInteract() {
            if (PH.flag("ellis_records_open")) return;
            PH.lockOpen(recLock, () => {
              PH.setFlag("ellis_records_open");
              PH.sfx("door_open");
              G.notify("The Records Room door swings open.");
            });
          },
        });
        // the quarantine ward: the Registrar hands over the ward key with the "Quarantine" job
        const wardLock = PH.regLock({
          id: "ph_lk_ellis_ward",
          label: "Quarantine Ward",
          kind: "door",
          key: "ph_key_ward",
          hint: "Registrar Augustine gives the ward key to whoever agrees to clear Dormitory C.",
        });
        PH.quarantineDoor = G.world.addInteractable({
          pos: PH.v3(O.x + 16, DY + 1.2, O.z - 12),
          radius: 0.9,
          label: "Quarantine Ward",
          verb: "Open",
          priority: 1,
          locked: () => (PH.flag("ellis_quarantine_open") ? null : "Locked"),
          onInteract() {
            if (PH.flag("ellis_quarantine_open")) return;
            const open = () => {
              PH.setFlag("ellis_quarantine_open");
              PH.sfx("door_open");
              G.notify(
                "You unlock the ward and drag the barricade aside. Something inside stops moaning to listen.",
              );
            };
            if (PH.flag("ellis_quarantine_ok") && !PH.hasItem("ph_key_ward")) {
              open();
              return;
            } // older saves: leave already granted
            PH.lockOpen(wardLock, open);
          },
        });
      } catch (e) {
        PH.safe("ellis doors", () => {
          throw e;
        });
      }
      // physical blockers for the two locked doors (removed when opened)
      PH.lockBlocker(
        "ellis_records_open",
        O.x + 25.8,
        O.z + 4,
        1.5,
        0.35,
        RY,
        RY + 2.4,
      );
      PH.lockBlocker(
        "ellis_quarantine_open",
        O.x + 16,
        O.z - 12,
        1.7,
        0.6,
        DY,
        DY + 2.4,
      );

      PH.register("ellis_island", {
        root: PH.ellisExt ? PH.ellisExt.root : null,
        interiorRoot: root,
        interiorKey: "ellis_island",
        anchors: Object.assign({}, PH.ellisExt ? PH.ellisExt.anchors : {}, A, {
          interior_entrance: A.entrance,
        }),
      });
    },
    12,
  );

  /** Snellen-style eye chart (with a radiation joke on the last line). */
