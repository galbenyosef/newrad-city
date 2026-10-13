/* src/poi_penn/11_farley_interior.js */
/* =====================================================================
 * NEW RAD CITY — poi_penn / 11_farley_interior.js
 * JAMES A. FARLEY GENERAL POST OFFICE — interior cell `farley_post_office`
 * (origin from LAYOUT.INTERIORS, lifted by K.INT_LIFT so the basement
 * mail-rail platform at local y −5 stays walkable).
 *
 * Plan (local metres, player enters at (0,0,−1.5) looking north):
 *   LOBBY (x ±21, z −11..0, h 9): terrazzo, marble walls, coffered ceiling,
 *     bronze lanterns (still lit), check-writing desks, brass PO-box walls,
 *     queue ropes with a skeleton still waiting its turn, "NOW SERVING 77".
 *     North side: the service-window counter — twelve windows under painted
 *     signs, bronze grilles; window 12 GENERAL DELIVERY is M.I.L.E.S.'s;
 *     the swinging EMPLOYEES ONLY door at the east end.
 *   PNEUMATIC TUBE STATION (x −29..−21) off the lobby's west end.
 *   WORKROOM (x ±21, z −47..−11, h 12): the skylit sorting floor — steel
 *     trusses and broken glazing, a U of belt conveyors with parcels still
 *     riding them, three rows of sorting cases, hampers, sack drifts,
 *     lockers and the time clock, a security desk; the Patrolman sorters
 *     walk their routes here. Mezzanine (y 4.5) along the north wall.
 *   DEAD LETTER OFFICE (mezzanine, west): wire cages, drifts of letters,
 *     the reading table, the HOLD FOR ADDRESSEE shelf with the letter.
 *   POSTMASTER'S OFFICE (mezzanine, east; locked 50 / Postmaster's Key).
 *   MAIL RAIL PLATFORM (basement, y −5, via the freight elevator): the
 *     Penn Terminal mail railway — track pit, mail car, collapsed tunnel,
 *     the truck ramp up to the 9th Avenue loading dock (one-way exit).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._ppn;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const MY = 4.5; // mezzanine level
  const BY = -5; // mail rail platform

  PV.faInterior = function (ctx) {
    const O = ctx.O,
      FA = PV.fa;
    ctx.intRoot = new THREE.Group();
    ctx.intRoot.name = "poi_farley_int";
    const b = K.builder({
      name: "fa_int",
      off: O,
      lit: true,
      amb: [0.125, 0.125, 0.118],
      floors: [0, MY, BY],
      grime: 0.5,
    }); // round 2: ambient ×1.8 so dark woods / bronze read
    const r = K.rng("fa_int");
    const warm = [1, 0.8, 0.52],
      day = [0.72, 0.8, 0.72],
      tube = [0.82, 0.92, 0.84],
      red = [1, 0.25, 0.15];
    const marble = [0.84, 0.8, 0.72],
      paintG = [0.62, 0.66, 0.58];
    const LOBBY_BOX = [-21.2, -1, -11.2, 21.2, 9.5, 0.2];
    const WORK_BOX = [-21.2, -1, -47.2, 21.2, 12.5, -11.0];

    // ------------------------------------------------ gaps (before any room)
    K.gap(ctx, -21, -5.5, 2.4, 0, 3.2); // lobby ↔ tube station
    K.gap(ctx, -21, -43, 2.6, 0, 3.0, { casing: false }); // workroom ↔ freight elevator
    K.gap(ctx, -10, -47, 1.6, MY, 2.4); // mezzanine ↔ Dead Letter Office
    K.gap(ctx, 10, -47, 1.2, MY, 2.3); // mezzanine ↔ Postmaster's office

    // ================================================= LOBBY
    K.room(b, ctx, {
      x0: -21,
      z0: -11,
      x1: 21,
      z1: 0,
      y: 0,
      h: 9,
      floor: "terrazzo",
      fc: [0.8, 0.76, 0.68],
      wall: "marble",
      wc: marble,
      ceil: "coffer",
      cc: [0.6, 0.57, 0.52],
      wain: "marble_green",
      wainC: [0.7, 0.78, 0.72],
      wainH: 1.2,
      cornice: true,
      corniceMat: "limestone",
      trimMat: "marble_black",
      open: { n: true },
    });
    const CZF = -11; // lobby face of the service-counter screen wall
    // entrance doors (from inside): five bronze leaves under lit fanlights; the middle one is the way out
    for (const dx of [-14, -7, 0, 7, 14]) {
      b.boxMM("bronze", dx - 1.0, 0, -0.12, dx + 1.0, 4.2, -0.1, {
        tint: [0.42, 0.44, 0.34],
      });
      for (const s of [-1, 1])
        b.boxMM(
          "bronze",
          dx + s * 0.5 - 0.38,
          0.3,
          -0.16,
          dx + s * 0.5 + 0.38,
          3.9,
          -0.12,
          { tint: [0.34, 0.37, 0.28] },
        );
      b.plate("lamp", dx, 5.3, -0.11, 0, -1, 1.9, 1.6, null, {
        tint: [0.52, 0.56, 0.46],
      });
      for (let q = 0; q < 7; q++)
        b.beam(
          "bronze",
          dx - 0.9 + q * 0.3,
          4.5,
          -0.14,
          dx - 0.9 + q * 0.3,
          6.1,
          -0.14,
          0.04,
          0.04,
          { tint: [0.3, 0.32, 0.26] },
        );
      b.light(dx, 5.3, -1.0, day, 0.35, 5, { box: LOBBY_BOX });
    }
    b.plate(
      "art",
      0,
      7.2,
      -0.14,
      0,
      -1,
      5.5,
      0.7,
      K.signCell("ppn_fa_gpo", "GENERAL POST OFFICE", 512, 64, {
        bg: "#2a2418",
        fg: "#d8b860",
        font: "Georgia, serif",
      }),
      { off: 0.01 },
    );
    // PO box walls (east wall, and the west wall either side of the tube-station arch)
    const pob = K.poBoxCell();
    b.plate("art", 20.88, 2.0, -5.5, -1, 0, 9.6, 3.2, pob, { off: 0.0 });
    b.boxMM("bronze", 20.7, 0.3, -10.4, 20.9, 0.4, -0.6, {
      tint: [0.4, 0.42, 0.32],
    });
    b.boxMM("bronze", 20.7, 3.6, -10.4, 20.9, 3.75, -0.6, {
      tint: [0.4, 0.42, 0.32],
    });
    b.plate("art", -20.88, 2.0, -2.3, 1, 0, 3.4, 3.2, pob, { off: 0.0 });
    b.plate("art", -20.88, 2.0, -8.7, 1, 0, 3.6, 3.2, pob, { off: 0.0 });
    b.plate(
      "art",
      -20.88,
      4.3,
      -5.5,
      1,
      0,
      3.4,
      0.5,
      K.signCell("ppn_fa_tubes", "PNEUMATIC TUBE SERVICE", 384, 48, {
        bg: "#2a2418",
        fg: "#d8b860",
      }),
      { off: 0.02 },
    );
    // five bronze lanterns, still lit (the building never lost power)
    for (const lx of [-16, -8, 0, 8, 16]) {
      b.pipe("black_iron", lx, 9, -5.5, lx, 6.9, -5.5, 0.018, 4);
      b.cyl("bronze", lx, 5.6, -5.5, 0.3, 0.42, 1.2, 6, {
        tint: [0.34, 0.37, 0.28],
      });
      b.cyl("bronze", lx, 6.8, -5.5, 0.45, 0.06, 0.26, 6, {
        tint: [0.34, 0.37, 0.28],
      });
      if (lx !== -8) {
        b.cyl("lamp", lx, 5.75, -5.5, 0.24, 0.34, 0.95, 6, {
          tint: [1, 0.8, 0.5],
        });
        b.light(lx, 5.8, -5.5, warm, 0.95, 10, { box: LOBBY_BOX });
        b.glow(lx, 6.1, -5.5, [0.8, 0.56, 0.3], 3.2);
      } else
        b.cyl("glass", lx, 5.75, -5.5, 0.24, 0.34, 0.95, 6, {
          tint: [0.25, 0.25, 0.23],
        });
    }
    b.light(0, 4, -5.5, warm, 0.25, 22, { box: LOBBY_BOX, wrap: 0.7 });
    // check-writing desks: marble tops on bronze pedestals, forms and pens chained to them
    for (const dx of [-12, -2, 8]) {
      b.box("marble_black", dx, 1.02, -5.5, 2.6, 0.08, 0.9, {
        tint: [0.5, 0.48, 0.46],
        faces: "nsewtb",
      });
      b.box("bronze", dx, 0, -5.5, 1.6, 0.12, 0.5, { tint: [0.36, 0.38, 0.3] });
      for (const s of [-1, 1])
        b.cyl("bronze", dx + s * 0.8, 0.12, -5.5, 0.07, 0.09, 0.9, 8, {
          tint: [0.36, 0.38, 0.3],
        });
      for (let k = 0; k < 5; k++)
        b.box(
          "flat",
          dx - 1.1 + r() * 2.2,
          1.101,
          -5.8 + r() * 0.6,
          0.2,
          0.003,
          0.14,
          { yaw: r() * 1.2 - 0.6, tint: [0.86, 0.84, 0.74] },
        );
      b.pipe("steel", dx + 0.9, 1.11, -5.2, dx + 0.7, 1.11, -5.6, 0.004, 3);
      b.col(dx - 1.3, 0, -5.95, dx + 1.3, 1.06, -5.05, {
        tag: "furniture",
        surface: "concrete",
      });
    }
    // benches along the south wall
    for (const bx of [-17.5, -10.5, 10.5, 17.5]) {
      K.sofa(b, bx, 0, -0.7, 3.2, 0, {
        mat: "oak",
        tint: [0.55, 0.42, 0.3],
        arms: false,
        backH: 0.55,
        d: 0.55,
      });
    }
    // queue stanchions + frayed velvet ropes in front of windows 5-8
    for (let k = 0; k < 6; k++) {
      const sx = -2 + k * 1.4,
        sz = -8.6;
      b.cyl("brass", sx, 0, sz, 0.14, 0.14, 0.04, 8);
      b.cyl("brass", sx, 0.04, sz, 0.03, 0.03, 0.92, 6);
      b.geo("brass", K.sphereGeo(), { x: sx, y: 0.98, z: sz, s: 0.05 });
      if (k < 5 && k !== 2) {
        b.pipe("cloth_red", sx, 0.9, sz, sx + 0.7, 0.72, sz, 0.02, 4);
        b.pipe("cloth_red", sx + 0.7, 0.72, sz, sx + 1.4, 0.9, sz, 0.02, 4);
      }
    }
    K.skel(ctx, 1.2, 0, -8.0, 0.2, "sitting");
    b.hplate("decal", 1.3, 0.012, -7.6, 1.3, 1.0, 0.3, K.decal("grime", 51));
    // fallen coffers + rubble under a hole in the ceiling; dust and paper
    b.face("paint_black", -12.2, 8.97, -4, 1, 0, 0, 0, 0, 1, 2.4, 2.0, {
      uv: "top",
      tint: [0.02, 0.02, 0.02],
    });
    K.rubble(b, -11, 0, -3, 1.4, 0.7, { seed: 11, tint: [0.8, 0.76, 0.7] });
    K.clutter(b, -20.5, -10.5, 20.5, -0.8, 0, {
      n: 26,
      seed: 12,
      kinds: ["paper", "paper", "glass", "panel", "debris", "can"],
      avoid: [
        [-14, -6.3, 11, -4.7],
        [-3, -9, 7, -7.5],
      ],
    });
    // posters on the marble between the windows' piers and the doors
    b.plate("art", -20.88, 5.8, -8.7, 1, 0, 1.2, 1.6, K.posterCell("zip"), {
      off: 0.01,
    });
    b.plate("art", 20.88, 5.4, -2.2, -1, 0, 1.2, 1.6, K.posterCell("wanted"), {
      off: 0.01,
    });
    b.plate(
      "art",
      20.88,
      5.4,
      -8.8,
      -1,
      0,
      1.2,
      1.6,
      K.posterCell("anchorage"),
      { off: 0.01 },
    );
    // round 2 — the upper lobby: bronze eagle roundels and two stopped clocks on the screen wall over the windows,
    // the Civil Defense Week bunting still up from last year (faded, torn), a banner on each end wall
    for (const ex of [-15.5, -5, 5, 15.5]) {
      b.boxMM("bronze", ex - 0.66, 5.44, CZF, ex + 0.66, 6.76, CZF + 0.03, {
        tint: [0.5, 0.44, 0.3],
        faces: "nsewtb",
      });
      b.plate("art", ex, 6.1, CZF + 0.03, 0, 1, 1.15, 1.15, K.eagleCell(), {
        off: 0.02,
        tint: [0.72, 0.64, 0.46],
      });
    }
    for (const cx of [-10.3, 10.3]) {
      b.boxMM("bronze", cx - 0.62, 5.45, CZF, cx + 0.62, 6.75, CZF + 0.16, {
        tint: [0.5, 0.44, 0.3],
        faces: "nsewtb",
      });
      b.plate(
        "art",
        cx,
        6.1,
        CZF + 0.17,
        0,
        1,
        1.05,
        1.05,
        K.clockCell(9, 47),
        { off: 0.005 },
      );
    }
    for (const [ba, bb, torn] of [
      [-20.6, -11.3, false],
      [-11.3, -2, false],
      [2, 11.3, true],
      [11.3, 20.6, false],
    ])
      K.bunting(b, ba, 8.55, CZF + 0.25, bb, 8.55, CZF + 0.25, {
        sag: 0.8,
        torn,
      });
    for (const [wx, nx] of [
      [-20.86, 1],
      [20.86, -1],
    ]) {
      b.plate(
        "art",
        wx,
        7.5,
        -5.5,
        nx,
        0,
        7.2,
        1.0,
        K.paint("art", "ppn_tricent", 512, 72, function (x, X, Y, W, H) {
          x.fillStyle = "#e0d8c4";
          x.fillRect(X, Y, W, H);
          for (let i = 0; i < 13; i++) {
            x.fillStyle = i % 2 ? "#e0d8c4" : "#9a3a30";
            x.fillRect(X, Y + (i * H) / 13, 44, H / 13 + 1);
            x.fillRect(X + W - 44, Y + (i * H) / 13, 44, H / 13 + 1);
          }
          x.fillStyle = "#2c3e62";
          x.fillRect(X, Y, 44, H * 0.55);
          x.fillRect(X + W - 44, Y, 44, H * 0.55);
          x.fillStyle = "#2c3e62";
          x.font = "bold 34px Georgia";
          x.textAlign = "center";
          x.textBaseline = "middle";
          x.fillText(
            "CIVIL DEFENSE WEEK  ·  1966",
            X + W / 2,
            Y + H / 2 + 2,
            W - 110,
          );
          K.stains(x, X, Y, W, H, 12, 5101, 0.45, [80, 60, 30]);
          K.grain(x, X, Y, W, H, 22, 5102);
          x.clearRect(X + W * 0.62, Y + H * 0.7, 30, 30);
          x.clearRect(X + W * 0.2, Y, 16, 12);
        }),
        { off: 0.02 },
      );
    }
    // mail hampers and a sack drift waiting at the parcel windows
    K.hamper(b, -9.6, 0, -9.3, 0.3, {});
    K.hamper(b, 12.4, 0, -2.6, -0.4, {});
    for (let k = 0; k < 6; k++)
      K.sack(b, -14.8 + r() * 2.2, 0, -9.9 + r() * 1.0, r() * 6, {
        s: 0.9 + r() * 0.3,
        stand: k % 3 === 0,
      });
    b.col(-10.2, 0, -9.9, -9.0, 1.0, -8.7, { tag: "furniture" });
    b.col(11.8, 0, -3.2, 13.0, 1.0, -2.0, { tag: "furniture" });
    // dust in the fanlight light
    for (const dx of [-7, 7])
      K.shaft(
        b,
        dx,
        5.3,
        -0.2,
        dx + 0.4,
        0.02,
        -5.2,
        1.8,
        2.6,
        [0.05, 0.055, 0.045],
      );

    // ---------------- the service counter (the lobby's north side) ----------------
    const CZ = -11;
    const SIGNS = [
      "STAMPS",
      "STAMPS",
      "PARCEL POST",
      "REGISTRY",
      "INSURED MAIL",
      "MONEY ORDERS",
      "POSTAL SAVINGS",
      "AIR MAIL",
      "SPECIAL DELIVERY",
      "C.O.D.",
      "V-MAIL • ICELAND",
      "GENERAL DELIVERY",
    ];
    const WIN = []; // window centres
    for (let k = 0; k < 12; k++) WIN.push(-18.6 + k * 2.75);
    const DOOR_X = 17.9,
      DOOR_W = 1.3;
    // counter base (marble) with brass kick rail
    b.boxMM("marble", -21, 0, CZ - 0.9, DOOR_X - DOOR_W / 2 - 0.15, 1.1, CZ, {
      tint: [0.74, 0.72, 0.66],
      faces: "nsewt",
    });
    b.boxMM(
      "marble_black",
      -21,
      1.1,
      CZ - 1.0,
      DOOR_X - DOOR_W / 2 - 0.15,
      1.16,
      CZ + 0.12,
      { tint: [0.45, 0.43, 0.4], faces: "nsewtb" },
    );
    b.boxMM(
      "brass",
      -21,
      0.1,
      CZ + 0.0,
      DOOR_X - DOOR_W / 2 - 0.15,
      0.18,
      CZ + 0.06,
      {},
    );
    b.boxMM("marble", DOOR_X + DOOR_W / 2 + 0.15, 0, CZ - 0.9, 21, 1.1, CZ, {
      tint: [0.74, 0.72, 0.66],
      faces: "nsewt",
    });
    b.col(-21, 0, CZ - 0.9, DOOR_X - DOOR_W / 2 - 0.15, 1.16, CZ + 0.12, {
      tag: "wall",
    });
    b.col(DOOR_X + DOOR_W / 2 + 0.15, 0, CZ - 0.9, 21, 1.16, CZ + 0.1, {
      tag: "wall",
    });
    // piers, grilles and signs
    const WW = 2.05,
      GY0 = 1.16,
      GY1 = 3.3;
    let px0 = -21;
    WIN.forEach((wx, k) => {
      const w0 = wx - WW / 2,
        w1 = wx + WW / 2;
      // pier from px0 to w0
      b.boxMM("marble", px0, GY0, CZ - 0.25, w0, GY1, CZ + 0.02, {
        tint: marble,
        faces: "nst",
      });
      px0 = w1;
      // window: bronze frame + grille (window 12 has lost its grille — M.I.L.E.S. talks through the gap)
      b.boxMM("bronze", w0, GY0, CZ - 0.08, w0 + 0.08, GY1, CZ + 0.02, {
        tint: [0.4, 0.42, 0.32],
      });
      b.boxMM("bronze", w1 - 0.08, GY0, CZ - 0.08, w1, GY1, CZ + 0.02, {
        tint: [0.4, 0.42, 0.32],
      });
      b.boxMM("bronze", w0, GY1 - 0.12, CZ - 0.08, w1, GY1, CZ + 0.02, {
        tint: [0.4, 0.42, 0.32],
      });
      if (k !== 11) {
        const n = 14;
        for (let q = 1; q < n; q++)
          b.beam(
            "bronze",
            w0 + (q * WW) / n,
            GY0 + 0.25,
            CZ - 0.04,
            w0 + (q * WW) / n,
            GY1 - 0.12,
            CZ - 0.04,
            0.025,
            0.025,
            { tint: [0.36, 0.38, 0.3] },
          );
        for (const yy of [GY0 + 0.25, 2.3])
          b.beam("bronze", w0, yy, CZ - 0.04, w1, yy, CZ - 0.04, 0.04, 0.03, {
            tint: [0.36, 0.38, 0.3],
          });
        // closed windows: brass shutter half down, "WINDOW CLOSED" card
        if (k % 3 !== 1) {
          b.boxMM(
            "brass",
            w0 + 0.08,
            1.9,
            CZ - 0.2,
            w1 - 0.08,
            GY1 - 0.12,
            CZ - 0.16,
            { tint: [0.52, 0.44, 0.28] },
          );
        } else
          b.plate(
            "art",
            wx,
            1.55,
            CZ + 0.03,
            0,
            1,
            0.55,
            0.22,
            K.signCell("ppn_closed", "WINDOW CLOSED", 160, 64, {
              bg: "#e0d8c0",
              fg: "#8e2a22",
              font: "Arial, sans-serif",
            }),
            { off: 0 },
          );
      } else {
        for (const s of [-1, 1])
          b.beam(
            "bronze",
            wx + s * 0.9,
            GY0 + 0.1,
            CZ - 0.04,
            wx + s * 0.6,
            GY0 + 0.4 + r() * 0.3,
            CZ - 0.3,
            0.025,
            0.025,
            { tint: [0.36, 0.38, 0.3] },
          );
        b.plate(
          "art",
          wx,
          1.35,
          CZ + 0.03,
          0,
          1,
          0.8,
          0.26,
          K.signCell("ppn_ring", "RING FOR SERVICE", 200, 64, {
            bg: "#e0d8c0",
            fg: "#24385e",
            font: "Arial, sans-serif",
          }),
          { off: 0 },
        );
        b.cyl("brass", wx + 0.6, 1.16, CZ - 0.3, 0.07, 0.03, 0.06, 10);
      }
      // painted sign board above the window
      b.plate(
        "art",
        wx,
        3.62,
        CZ + 0.03,
        0,
        1,
        2.3,
        0.44,
        K.signCell("ppn_win" + k, k + 1 + "  ·  " + SIGNS[k], 384, 72, {
          bg: "#1e2a24",
          fg: "#e0c878",
          font: "Georgia, serif",
        }),
        { off: 0.0 },
      );
      // the workroom side (back of the counter): simple shelf + papers (not at window 12 — M.I.L.E.S. stands there)
      if (k !== 11)
        b.boxMM("oak", w0 + 0.1, 0.9, CZ - 1.5, w1 - 0.1, 0.95, CZ - 0.9, {
          tint: [0.55, 0.42, 0.3],
          faces: "nsewtb",
        });
    });
    b.boxMM(
      "marble",
      px0,
      GY0,
      CZ - 0.25,
      DOOR_X - DOOR_W / 2,
      GY1,
      CZ + 0.02,
      { tint: marble, faces: "nst" },
    );
    // wall above the windows: lobby face (up to 9) and workroom face (up to 12)
    K.fwall(b, "marble", -21, CZ, 21, CZ, GY1, 9 - GY1, 0, 1, { tint: marble });
    b.boxMM("limestone", -21, GY1, CZ, 21, GY1 + 0.14, CZ + 0.2, {
      tint: marble,
      faces: "stb",
    });
    K.fwall(b, "plaster", -21, CZ - 0.25, 21, CZ - 0.25, GY1, 12 - GY1, 0, -1, {
      tint: paintG,
    });
    // the NOW SERVING display (red lamp digits) and the door
    b.boxMM("paint_black", -1.3, 7.0, CZ + 0.02, 1.3, 8.0, CZ + 0.2, {
      tint: [0.12, 0.12, 0.12],
      faces: "nsewtb",
    });
    b.plate(
      "neon",
      0,
      7.5,
      CZ + 0.21,
      0,
      1,
      2.3,
      0.8,
      K.neonCell("ppn_nowserv", "NOW SERVING  77", 384, 128, {
        color: "#ff3020",
      }),
      { off: 0.0 },
    );
    b.glow(0, 7.5, CZ + 0.6, [0.7, 0.12, 0.06], 2.2);
    b.light(0, 7.3, CZ + 1.2, red, 0.35, 5, { box: LOBBY_BOX });
    // counter collider above the base: solid except the door and window 12's gap
    {
      const w12 = WIN[11];
      b.col(-21, 1.16, CZ - 0.3, w12 - 0.95, 12, CZ + 0.05, { tag: "wall" });
      b.col(w12 + 0.95, 1.16, CZ - 0.3, DOOR_X - DOOR_W / 2, 12, CZ + 0.05, {
        tag: "wall",
      });
      b.col(w12 - 0.95, GY1 - 0.15, CZ - 0.3, w12 + 0.95, 12, CZ + 0.05, {
        tag: "wall",
      });
      b.col(DOOR_X + DOOR_W / 2, 1.16, CZ - 0.3, 21, 12, CZ + 0.05, {
        tag: "wall",
      });
      b.col(
        DOOR_X - DOOR_W / 2,
        2.6,
        CZ - 0.3,
        DOOR_X + DOOR_W / 2,
        12,
        CZ + 0.05,
        { tag: "wall" },
      );
      K.anchor(ctx, "miles", w12, 0, CZ - 1.6);
    }
    // door jambs and the warning sign
    b.boxMM(
      "bronze",
      DOOR_X - DOOR_W / 2 - 0.15,
      0,
      CZ - 0.3,
      DOOR_X - DOOR_W / 2,
      2.75,
      CZ + 0.06,
      { tint: [0.4, 0.42, 0.32] },
    );
    b.boxMM(
      "bronze",
      DOOR_X + DOOR_W / 2,
      0,
      CZ - 0.3,
      DOOR_X + DOOR_W / 2 + 0.15,
      2.75,
      CZ + 0.06,
      { tint: [0.4, 0.42, 0.32] },
    );
    b.boxMM(
      "bronze",
      DOOR_X - DOOR_W / 2 - 0.15,
      2.6,
      CZ - 0.3,
      DOOR_X + DOOR_W / 2 + 0.15,
      2.75,
      CZ + 0.06,
      { tint: [0.4, 0.42, 0.32] },
    );
    b.plate(
      "art",
      DOOR_X,
      3.25,
      CZ + 0.07,
      0,
      1,
      1.9,
      0.7,
      K.signCell(
        "ppn_restricted",
        "RESTRICTED AREA\nPOSTAL EMPLOYEES ONLY",
        320,
        110,
        { bg: "#8e2a22", fg: "#f0e8d0", font: "Arial Black, sans-serif" },
      ),
      { off: 0 },
    );
    b.plate(
      "art",
      DOOR_X + 1.55,
      1.55,
      CZ + 0.07,
      0,
      1,
      0.8,
      1.05,
      K.signCell(
        "ppn_force",
        "WARNING\n\nSECURITY\nPATROLMEN\nWILL USE\nFORCE",
        128,
        170,
        { bg: "#e0b020", fg: "#1a1a1a", font: "Arial Black, sans-serif" },
      ),
      { off: 0 },
    );
    K.hingedDoor(ctx, b, {
      id: "fa_staff",
      x: DOOR_X,
      z: CZ - 0.12,
      y: 0,
      w: DOOR_W,
      h: 2.55,
      axis: "x",
      hinge: 1,
      swing: -1,
      mat: "oak",
      tint: [0.5, 0.38, 0.26],
      glass: true,
      label: "Employees Only",
      sign: K.signCell("ppn_staffonly", "EMPLOYEES ONLY", 256, 80, {
        bg: "#e0d8c0",
        fg: "#8e2a22",
        font: "Arial Black, sans-serif",
      }),
    });

    // ================================================= PNEUMATIC TUBE STATION
    K.room(b, ctx, {
      x0: -29,
      z0: -11,
      x1: -21,
      z1: 0,
      y: 0,
      h: 4.4,
      floor: "hextile",
      fc: [0.7, 0.68, 0.6],
      wall: "subway",
      wc: [0.78, 0.8, 0.72],
      ceil: "tin",
      cc: [0.5, 0.48, 0.42],
      wain: "teal_tile",
      wainH: 1.1,
      trimMat: "marble_black",
    });
    {
      const TB = [-29.2, -1, -11.2, -20.8, 5, 0.2];
      K.lamp(b, -25, 3.6, -5.5, "cage", [0.8, 1, 0.8], 0.8, 8, {
        ceil: 4.4,
        lightOpts: { box: TB },
      });
      b.light(-25, 2, -9, [0.6, 0.8, 0.7], 0.3, 6, { box: TB });
      // six brass tube lines coming out of the west wall: receiver bells + dispatch mouths
      const DEST = [
        "GRAND CENTRAL",
        "CITY HALL",
        "HERALD SQ.",
        "MADISON SQ.",
        "CHURCH ST.",
        "TIMES SQ.",
      ];
      for (let k = 0; k < 6; k++) {
        const tz = -10 + k * 1.75;
        b.pipe("brass", -28.6, 0, tz, -28.6, 4.4, tz, 0.11, 10, {
          tint: [0.7, 0.55, 0.3],
        });
        b.pipe("brass", -28.6, 1.3, tz, -27.9, 1.3, tz, 0.14, 10, {
          tint: [0.7, 0.55, 0.3],
        });
        b.cyl("brass", -27.9, 1.05, tz, 0.2, 0.2, 0.5, 10, {
          tint: [0.62, 0.5, 0.28],
        });
        b.geo("paint_black", K.unitCyl(10), {
          x: -27.75,
          y: 1.3,
          z: tz,
          sx: 0.12,
          sy: 0.02,
          sz: 0.12,
          rz: HP,
          tint: [0.03, 0.03, 0.03],
        });
        b.plate(
          "art",
          -28.45,
          2.3,
          tz,
          1,
          0,
          1.2,
          0.26,
          K.signCell("ppn_tube" + k, "TO " + DEST[k], 200, 44, {
            bg: "#2a2418",
            fg: "#d8b860",
            font: "Arial, sans-serif",
          }),
          { off: 0 },
        );
        b.geo("brass", K.sphereGeo(), {
          x: -28.1,
          y: 1.85,
          z: tz + 0.35,
          s: 0.06,
          tint: [0.8, 0.2, 0.1],
        });
      }
      // capsule rack + a capsule on the desk
      for (let k = 0; k < 8; k++)
        b.geo("brass", K.unitCyl(8), {
          x: -21.7 - k * 0.22,
          y: 1.25,
          z: -10.6,
          sx: 0.09,
          sy: 0.42,
          sz: 0.09,
          rz: HP,
          ry: HP,
          tint: [0.62, 0.5, 0.3],
        });
      b.boxMM("oak", -23.6, 1.1, -10.9, -21.3, 1.14, -10.3, {
        tint: [0.5, 0.38, 0.26],
        faces: "nsewtb",
      });
      K.table(b, -24.5, 0, -2.2, 1.8, 0.8, {
        mat: "oak",
        tint: [0.5, 0.38, 0.26],
      });
      b.geo("brass", K.unitCyl(8), {
        x: -24.9,
        y: 0.82,
        z: -2.2,
        sx: 0.09,
        sy: 0.4,
        sz: 0.09,
        rz: HP,
        ry: 0.3,
        tint: [0.62, 0.5, 0.3],
      });
      K.chair(b, -24.5, 0, -1.3, PI, { mat: "oak" });
      // route map of the tube network
      b.plate(
        "art",
        -24.5,
        2.6,
        -10.87,
        0,
        1,
        2.6,
        1.6,
        K.paint("art", "ppn_tubemap", 256, 160, function (x, X, Y, W, H) {
          x.fillStyle = "#d8ccaa";
          x.fillRect(X, Y, W, H);
          x.fillStyle = "#24385e";
          x.font = "bold 13px Georgia";
          x.textAlign = "center";
          x.fillText("NEW YORK PNEUMATIC MAIL", X + W / 2, Y + 16);
          const pts = [
            [40, 130],
            [70, 100],
            [110, 80],
            [150, 60],
            [190, 45],
            [220, 30],
            [120, 120],
            [180, 110],
          ];
          x.strokeStyle = "#8e2a22";
          x.lineWidth = 3;
          x.beginPath();
          pts
            .slice(0, 6)
            .forEach((p, i) =>
              i ? x.lineTo(X + p[0], Y + p[1]) : x.moveTo(X + p[0], Y + p[1]),
            );
          x.stroke();
          x.beginPath();
          x.moveTo(X + 110, Y + 80);
          x.lineTo(X + 120, Y + 120);
          x.lineTo(X + 180, Y + 110);
          x.stroke();
          x.fillStyle = "#1a1a1a";
          pts.forEach((p) => {
            x.beginPath();
            x.arc(X + p[0], Y + p[1], 4, 0, 6.3);
            x.fill();
          });
          x.font = "8px Arial";
          x.fillText("G.P.O.", X + 70, Y + 94);
          x.fillText("GRAND CENTRAL", X + 190, Y + 38);
          x.fillText("CITY HALL", X + 180, Y + 124);
          K.grain(x, X, Y, W, H, 30, 941);
          K.stains(x, X, Y, W, H, 5, 942, 0.4);
        }),
        { off: 0.01 },
      );
      K.clutter(b, -28.5, -10.5, -21.5, -0.5, 0, {
        n: 7,
        seed: 31,
        kinds: ["paper", "can", "debris"],
        avoid: [[-25.5, -3, -23.5, -1]],
      });
      K.terminal(
        ctx,
        "ppn_term_tubes",
        -22.2,
        0,
        -8.6,
        HP,
        {
          title: "PNEUMATIC DISPATCH — G.P.O. STATION 1",
          header: "NEW YORK PNEUMATIC MAIL CO. — DISPATCH CONSOLE",
          entries: [
            {
              title: "Dispatch log — 03/05/1967",
              text: "06:02  Carrier capsule #1127 to GRAND CENTRAL — RECEIVED\n07:15  Capsule #1128 to CITY HALL — RECEIVED\n08:40  Capsule #1129 to HERALD SQ. — RECEIVED\n09:44  Capsule #1130 to TIMES SQ. — NO ACKNOWLEDGEMENT\n09:46  ALL LINES — PRESSURE LOSS\n09:47  ALL LINES — PRESSURE LOSS\n09:47  ALL LINES — PRESSURE LOSS\n...",
            },
            {
              title: "Maintenance note",
              text: "To whoever has the night shift: the Times Square line is making the noise again. It is NOT a rat. Rats do not go 35 miles an hour. Do not put your arm in the tube. — Sal",
            },
            {
              title: "Line status",
              text: "GRAND CENTRAL ....... NO PRESSURE\nCITY HALL ........... NO PRESSURE\nHERALD SQ. .......... NO PRESSURE\nMADISON SQ. ......... NO PRESSURE\nCHURCH ST. .......... NO PRESSURE\nTIMES SQ. ........... PRESSURE DETECTED (?)\n\nWARNING: Unscheduled capsule arrival possible on the Times Square line.",
            },
          ],
        },
        "bare",
      );
      K.loot(ctx, "toolbox", -28.4, 0, -0.8, -HP, {
        name: "Tube Fitter's Toolbox",
      });
    }

    // ================================================= WORKROOM
    K.room(b, ctx, {
      x0: -21,
      z0: -47,
      x1: 21,
      z1: -11,
      y: 0,
      h: 12,
      floor: "concrete",
      fc: [0.62, 0.6, 0.55],
      wall: "plaster",
      wc: paintG,
      ceil: "plaster",
      noCeil: true,
      wain: "plaster",
      wainC: [0.38, 0.46, 0.4],
      wainH: 1.6,
      trimMat: "metal_dark",
      open: { s: true },
    });
    // skylight roof: steel truss grid with glazing (some panes gone) + daylight baked from above
    {
      const Y = 12;
      b.face("plaster", -21, Y + 0.6, -47, 1, 0, 0, 0, 0, 1, 42, 36, {
        uv: "top",
        tint: [0.3, 0.3, 0.28],
      });
      for (let i = 0; i < 14; i++)
        for (let j = 0; j < 12; j++) {
          const x0 = -21 + i * 3,
            z0 = -47 + j * 3,
            broken = r() < 0.12;
          // glazing panes face DOWN (seen from the floor): face() with U=+x, V=+z
          if (x0 > -19 && x0 < 17 && z0 > -45 && z0 < -14)
            b.face(
              "lamp",
              x0 + 0.15,
              Y + 0.55,
              z0 + 0.15,
              1,
              0,
              0,
              0,
              0,
              1,
              2.7,
              2.7,
              { uv: "top", tint: broken ? [0.95, 1, 0.9] : [0.46, 0.52, 0.46] },
            );
          else
            b.face(
              "paint_black",
              x0 + 0.15,
              Y + 0.55,
              z0 + 0.15,
              1,
              0,
              0,
              0,
              0,
              1,
              2.7,
              2.7,
              { uv: "top", tint: [0.1, 0.1, 0.1] },
            );
          if (broken && x0 > -19 && x0 < 17 && z0 > -45 && z0 < -14) {
            // round 2: a real dusty shaft of daylight through the missing pane (was a column of floating glow sprites)
            K.shaft(
              b,
              x0 + 1.5,
              Y + 0.5,
              z0 + 1.5,
              x0 + 1.5 + 1.4,
              0.02,
              z0 + 1.5 + 0.9,
              2.5,
              3.3,
              [0.085, 0.095, 0.08],
            );
            b.glow(x0 + 1.5, Y + 0.4, z0 + 1.5, [0.25, 0.27, 0.22], 3.4);
            b.light(x0 + 1.5 + 1.4, 2, z0 + 1.5 + 0.9, day, 0.45, 5, {
              box: WORK_BOX,
            });
            b.hplate(
              "decal",
              x0 + 2.9,
              0.012,
              z0 + 2.4,
              3,
              3,
              r() * 3,
              K.decal("puddle", i + j),
            );
          }
        }
      for (let i = 0; i <= 14; i++)
        b.beam(
          "metal_dark",
          -21 + i * 3,
          Y + 0.3,
          -47,
          -21 + i * 3,
          Y + 0.3,
          -11,
          0.18,
          0.5,
          { tint: [0.34, 0.36, 0.34] },
        );
      for (let j = 0; j <= 12; j++)
        b.beam(
          "metal_dark",
          -21,
          Y + 0.45,
          -47 + j * 3,
          21,
          Y + 0.45,
          -47 + j * 3,
          0.1,
          0.2,
          { tint: [0.34, 0.36, 0.34] },
        );
      // bowstring trusses across the hall
      for (const tz of [-44, -35, -26, -17]) {
        b.beam("metal_dark", -21, Y - 1.4, tz, 21, Y - 1.4, tz, 0.16, 0.22, {
          tint: [0.3, 0.32, 0.3],
        });
        for (let k = 0; k < 14; k++) {
          const x0 = -21 + k * 3;
          b.beam(
            "metal_dark",
            x0,
            Y - 1.4,
            tz,
            x0 + 1.5,
            Y + 0.1,
            tz,
            0.08,
            0.08,
            { tint: [0.3, 0.32, 0.3] },
          );
          b.beam(
            "metal_dark",
            x0 + 1.5,
            Y + 0.1,
            tz,
            x0 + 3,
            Y - 1.4,
            tz,
            0.08,
            0.08,
            { tint: [0.3, 0.32, 0.3] },
          );
        }
      }
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 3; j++)
          b.light(-15 + i * 10, Y - 1, -40 + j * 11, day, 0.62, 15, {
            box: WORK_BOX,
            wrap: 0.6,
          });
      // low bounce off the concrete floor: vertical faces (case backs, walls) were black under the pure top light
      for (const lz of [-13, -20.5, -27, -35.5])
        for (const lx of [-15, -5, 5, 15])
          b.light(lx, 1.4, lz, [0.62, 0.66, 0.6], 0.75, 10, {
            box: WORK_BOX,
            wrap: 0.95,
          });
    }
    // green-shaded work lamps over the sorting rows (warm pools under the cool daylight)
    for (const lz of [-15.5, -23.5, -30])
      for (let k = 0; k < 5; k++) {
        const lx = -16 + k * 6;
        const dead = r() < 0.2;
        K.lamp(b, lx, 3.4, lz, "pendant", warm, dead ? 0 : 0.55, 6, {
          ceil: 12,
          dead,
          lightOpts: { box: WORK_BOX },
        });
      }

    // conveyors: a U of belts (parcels still ride them — see PV.faInteriorUpdate)
    const BH = 0.95;
    const BELT = [
      [-18.5, -19],
      [10.5, -19],
      [10.5, -33.5],
      [-18.5, -33.5],
    ];
    K.conveyor(b, BELT[0][0], BELT[0][1], BELT[1][0], BELT[1][1], 0, BH, {});
    K.conveyor(
      b,
      BELT[1][0],
      BELT[1][1] - 0.5,
      BELT[2][0],
      BELT[2][1] + 0.5,
      0,
      BH,
      {},
    );
    K.conveyor(b, BELT[2][0], BELT[2][1], BELT[3][0], BELT[3][1], 0, BH, {});
    // the drop chute at the start of the belt, a heap where it ends
    b.boxMM("metal", -19.4, BH, -19.8, -18.2, 3.6, -18.2, {
      tint: [0.45, 0.5, 0.42],
    });
    b.pipe("metal", -18.8, 3.6, -19, -18.8, 12, -19, 0.4, 8, {
      tint: [0.45, 0.5, 0.42],
    });
    b.plate(
      "art",
      -18.8,
      2.9,
      -18.18,
      0,
      1,
      1.0,
      0.5,
      K.signCell("ppn_chute", "CHUTE 3\nLOBBY DROP", 160, 80, {
        bg: "#e0d8c0",
        fg: "#24385e",
        font: "Arial, sans-serif",
      }),
      { off: 0.01 },
    );
    for (let k = 0; k < 7; k++)
      K.sack(b, -19.8 + r() * 1.4, 0, -34.8 + r() * 2.2, r() * 6, {
        s: 0.9 + r() * 0.4,
        stand: r() < 0.3,
      });
    b.hplate("decal", -19, 0.013, -33.8, 3.5, 3, 0.4, K.decal("grime", 61));
    // sorting cases: three rows facing the belts
    for (let k = 0; k < 11; k++) {
      const x = -17.3 + k * 2.5;
      if (Math.abs(x - 3.0) < 1.3) continue;
      K.sortCase(b, x, 0, -15.1, 0, 2.3, {
        variant: k % 3,
        label: "CITY " + (k * 4 + 1) + "-" + (k * 4 + 4),
      });
    }
    for (let k = 0; k < 10; k++) {
      const x = -17.3 + k * 2.5;
      K.sortCase(b, x, 0, -23.0, PI, 2.3, {
        variant: (k + 1) % 3,
        label: "ZONE " + (k + 1),
      });
    }
    for (let k = 0; k < 10; k++) {
      const x = -17.3 + k * 2.5;
      K.sortCase(b, x, 0, -29.6, 0, 2.3, {
        variant: (k + 2) % 3,
        label: k === 4 ? "ICELAND V-MAIL" : "OUTGOING " + (k + 1),
        tint: k === 4 ? [0.8, 0.9, 0.8] : undefined,
      });
    }
    // aisle signs hanging from the trusses
    for (const [sx, sz, t] of [
      [-6, -17, "CITY PRIMARY"],
      [-6, -26.3, "ZONE SECONDARY"],
      [-6, -31.6, "OUTGOING • RETURN TO SENDER"],
    ]) {
      b.pipe("black_iron", sx - 1.4, 6.2, sz, sx - 1.4, 10.6, sz, 0.01, 3);
      b.pipe("black_iron", sx + 1.4, 6.2, sz, sx + 1.4, 10.6, sz, 0.01, 3);
      b.box("flat", sx, 5.7, sz, 3.4, 0.55, 0.05, {
        tint: [0.14, 0.2, 0.34],
        faces: "nsewtb",
      });
      for (const s of [-1, 1])
        b.plate(
          "art",
          sx,
          5.97,
          sz + s * 0.03,
          0,
          s,
          3.3,
          0.5,
          K.signCell("ppn_aisle" + t, t, 384, 56, {
            bg: "#24385e",
            fg: "#e8dcb8",
            font: "Arial Black, sans-serif",
          }),
          { off: 0.0 },
        );
    }
    // hampers & sacks in the mid aisle, drifts of letters along the cases
    for (const [hx, hz, hy] of [
      [-12, -24.2, 0.05],
      [-3, -28.4, -0.04],
      [5.5, -24.2, 0.08],
      [-16, -37.4, HP],
      [0, -37.4, HP + 0.05],
    ])
      K.hamper(b, hx, 0, hz, hy, {});
    for (let k = 0; k < 16; k++)
      b.hplate(
        "decal",
        -18 + r() * 28,
        0.012 + k * 0.0003,
        -14 - r() * 21,
        1.4 + r(),
        1.1 + r(),
        r() * 6,
        K.decal("grime", 70 + (k % 5)),
      );
    K.clutter(b, -20.5, -37, 12, -12, 0, {
      n: 40,
      seed: 41,
      kinds: ["paper", "paper", "box", "can", "paper", "panel"],
      avoid: [
        [-19.4, -19.8, 11, -18.2],
        [10, -34, 11, -18.5],
        [-19, -34.1, 11, -33],
        [-19, -15.6, 11, -14.5],
        [-19, -23.6, 11, -22.4],
        [-19, -30.2, 11, -29],
      ],
    });
    // carriers' corner (east): lockers, bench, time clock + card rack, route maps
    b.plate(
      "art",
      20.88,
      2.2,
      -14.5,
      -1,
      0,
      1.0,
      1.5,
      K.paint("art", "ppn_timecards", 128, 192, function (x, X, Y, W, H) {
        const rr = K.rng("tc");
        x.fillStyle = "#6a5a44";
        x.fillRect(X, Y, W, H);
        for (let j = 0; j < 8; j++)
          for (let i = 0; i < 4; i++) {
            x.fillStyle = "#d8d0b8";
            x.fillRect(X + 6 + i * 30, Y + 8 + j * 22 - rr() * 6, 24, 20);
            x.fillStyle = "#8e2a22";
            x.fillRect(X + 8 + i * 30, Y + 12 + j * 22 - 3, 18, 2);
          }
        K.grain(x, X, Y, W, H, 30, 951);
      }),
      { off: 0.01 },
    );
    b.boxMM("metal_dark", 20.5, 1.2, -12.9, 20.9, 1.8, -12.3, {
      tint: [0.3, 0.3, 0.28],
    });
    b.plate("lamp", 20.49, 1.62, -12.6, -1, 0, 0.25, 0.25, null, {
      tint: [0.9, 0.85, 0.7],
      off: 0,
    });
    for (let k = 0; k < 5; k++)
      K.loot(ctx, "locker", 20.55, 0, -17.5 - k * 1.1, HP, {
        count: 1,
        loot: k === 2 ? "locker" : "junk_household",
        name: "Carrier's Locker",
        locked: 0,
      });
    K.sofa(b, 18.6, 0, -20, 3.0, HP, {
      mat: "oak",
      tint: [0.5, 0.4, 0.3],
      arms: false,
      backH: 0.1,
      d: 0.45,
    });
    b.plate(
      "art",
      20.88,
      2.4,
      -24.5,
      -1,
      0,
      2.0,
      1.4,
      K.paint("art", "ppn_routemap", 256, 180, function (x, X, Y, W, H) {
        const rr = K.rng("rm");
        x.fillStyle = "#d8ccaa";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#9a8e70";
        x.lineWidth = 1;
        for (let i = 0; i < 12; i++) {
          x.beginPath();
          x.moveTo(X + i * 22, Y);
          x.lineTo(X + i * 22 + 20, Y + H);
          x.stroke();
          x.beginPath();
          x.moveTo(X, Y + i * 16);
          x.lineTo(X + W, Y + i * 16 - 10);
          x.stroke();
        }
        x.strokeStyle = "#8e2a22";
        x.lineWidth = 3;
        x.beginPath();
        x.moveTo(X + 30, Y + 150);
        for (let k = 0; k < 9; k++)
          x.lineTo(X + 30 + k * 24, Y + 150 - rr() * 120);
        x.stroke();
        x.fillStyle = "#24385e";
        x.font = "bold 12px Georgia";
        x.fillText("ROUTE 14 — PENN / GARMENT", X + 10, Y + 16);
        K.grain(x, X, Y, W, H, 30, 961);
        K.stains(x, X, Y, W, H, 6, 962, 0.4);
      }),
      { off: 0.01 },
    );
    // security checkpoint just inside the staff door: desk, dead guard, the Postmaster's key left on the blotter
    K.table(b, 15.0, 0, -13.2, 1.6, 0.8, {
      mat: "metal",
      tint: [0.45, 0.48, 0.44],
    });
    K.chair(b, 15.0, 0, -12.4, PI, { mat: "metal", tint: [0.4, 0.4, 0.38] });
    b.plate(
      "art",
      15.0,
      2.2,
      -11.33,
      0,
      -1,
      1.6,
      0.6,
      K.signCell("ppn_escort", "ALL VISITORS\nMUST BE ESCORTED", 256, 96, {
        bg: "#e0d8c0",
        fg: "#8e2a22",
        font: "Arial Black, sans-serif",
      }),
      { off: 0 },
    );
    K.skel(ctx, 14.2, 0, -12.3, 2.4, "lying");
    b.hplate("decal", 14.1, 0.012, -12.5, 1.6, 1.4, 0.8, K.decal("blood", 12));
    K.pickup(ctx, "ppn_postmaster_key", 1, 15.3, 0.77, -13.3, 0.4);
    K.note(ctx, "ppn_note_guard", 14.7, 0.77, -13.0, {
      name: "Security Incident Report",
      title: "Security Incident Report — Farley G.P.O.",
      text: 'INCIDENT REPORT 03/05/1967, 09:52\n\nAfter the sirens, members of the public attempted to enter the workroom via the staff door, stating that "the basement is a shelter." It is NOT a shelter. It is the mail rail platform.\n\nSecurity Patrolmen responded per Directive 9 (RESTRICTED AREA). I was unable to countermand. The override is in the Postmaster\'s office and the Postmaster has locked himself in it.\n\nI am leaving his spare key here on the desk for whoever comes next. I am going down to the platform. If it is not a shelter, it is at least underground.\n\n— Sgt. R. Delmar, Postal Inspection Service',
    });

    // ---------------- mezzanine (y 4.5) along the north wall + stairs ----------------
    {
      const Z0M = -47,
        Z1M = -38.2;
      b.face("concrete", -21, MY, Z1M, 1, 0, 0, 0, 0, -1, 42, Z1M - Z0M, {
        uv: "top",
        tint: [0.6, 0.58, 0.54],
      });
      b.face("plaster", -21, MY - 0.4, Z0M, 1, 0, 0, 0, 0, 1, 42, Z1M - Z0M, {
        uv: "top",
        tint: [0.5, 0.52, 0.48],
      });
      b.boxMM(
        "metal_dark",
        -21,
        MY - 0.45,
        Z1M - 0.1,
        21,
        MY + 0.05,
        Z1M + 0.1,
        { tint: [0.36, 0.38, 0.34] },
      );
      b.col(-21, MY - 0.4, Z0M, 21, MY, Z1M, {
        tag: "floor",
        surface: "concrete",
      });
      for (const cx of [-14, -7, 0, 7]) {
        b.boxMM(
          "metal_dark",
          cx - 0.15,
          0,
          Z1M - 0.3,
          cx + 0.15,
          MY - 0.4,
          Z1M,
          { tint: [0.34, 0.36, 0.33] },
        );
        b.col(cx - 0.15, 0, Z1M - 0.3, cx + 0.15, MY - 0.4, Z1M, {
          tag: "column",
          walkable: false,
        });
      }
      K.railing(b, -21, Z1M, 12.9, Z1M, MY, {
        mat: "metal",
        handMat: "metal",
        step: 0.9,
        h: 1.05,
      });
      K.railing(b, 16.1, Z1M, 21, Z1M, MY, {
        mat: "metal",
        handMat: "metal",
        step: 0.9,
        h: 1.05,
      });
      K.stairs(b, 13.0, Z1M, 16.0, -31.0, 0, MY, "-z", {
        mat: "metal_dark",
        tint: [0.42, 0.44, 0.4],
        rail: "both",
        railMat: "metal",
        handMat: "metal",
        solid: true,
      });
      // under-mezzanine parcel cages (chain-link fronts on steel frames)
      for (let k = 0; k < 6; k++) {
        const x0 = -16 + k * 4.4,
          x1 = x0 + 4.0;
        for (let q = 0; q <= 8; q++)
          b.beam(
            "black_iron",
            x0 + q * 0.5,
            0,
            Z1M - 0.6,
            x0 + q * 0.5,
            MY - 0.45,
            Z1M - 0.6,
            0.025,
            0.025,
            { tint: [0.3, 0.3, 0.28] },
          );
        for (let q = 0; q < 6; q++)
          b.beam(
            "black_iron",
            x0,
            0.3 + q * 0.7,
            Z1M - 0.6,
            x1,
            0.3 + q * 0.7,
            Z1M - 0.6,
            0.02,
            0.02,
            { tint: [0.3, 0.3, 0.28] },
          );
        b.plate(
          "art",
          (x0 + x1) / 2,
          3.6,
          Z1M - 0.56,
          0,
          1,
          1.6,
          0.34,
          K.signCell(
            "ppn_cage" + k,
            "PARCEL CAGE " + String.fromCharCode(65 + k),
            256,
            54,
            { bg: "#e0d8c0", fg: "#24385e", font: "Arial Black, sans-serif" },
          ),
          { off: 0 },
        );
        for (let q = 0; q < 5; q++)
          b.box(
            "wood",
            x0 + 0.5 + r() * 3,
            0,
            Z0M + 1 + r() * 6,
            0.4 + r() * 0.5,
            0.3 + r() * 0.5,
            0.4 + r() * 0.4,
            { yaw: r(), tint: [0.72, 0.6, 0.42] },
          );
        if (k !== 2)
          b.col(x0, 0, Z1M - 0.65, x1, MY - 0.45, Z1M - 0.55, { tag: "wall" });
      }
      for (let k = 0; k < 6; k++)
        K.lamp(
          b,
          -14 + k * 5.6,
          MY - 0.55,
          -42.6,
          "tube",
          [0.85, 0.95, 0.85],
          k === 3 ? 0 : 0.45,
          6,
          {
            ceil: MY - 0.4,
            dead: k === 3,
            lightOpts: { box: [-21.2, -1, -47.2, 21.2, 4.2, -38] },
          },
        );
      b.light(0, MY + 2.5, -42.6, day, 0.4, 10, {
        box: [-21.2, MY - 0.1, -47.2, 21.2, 12, -38],
      });
    }
    // freight elevator (west wall under the mezzanine) → mail rail platform
    {
      const ex = -21,
        ez = -43;
      b.boxMM("paint_black", ex - 2.6, 0, ez - 1.3, ex - 0.1, 3.0, ez + 1.3, {
        tint: [0.05, 0.05, 0.05],
        faces: "e",
      });
      for (let q = 0; q < 12; q++)
        b.beam(
          "black_iron",
          ex - 0.2,
          0.05,
          ez - 1.2 + q * 0.22,
          ex - 0.2,
          2.9,
          ez - 1.2 + q * 0.22,
          0.025,
          0.025,
          { tint: [0.35, 0.34, 0.3] },
        );
      for (const yy of [0.1, 1.5, 2.9])
        b.beam(
          "black_iron",
          ex - 0.2,
          yy,
          ez - 1.3,
          ex - 0.2,
          yy,
          ez + 1.3,
          0.04,
          0.04,
          { tint: [0.35, 0.34, 0.3] },
        );
      b.col(ex - 0.35, 0, ez - 1.3, ex - 0.1, 3, ez + 1.3, { tag: "door" });
      b.plate(
        "art",
        ex + 0.12,
        3.35,
        ez,
        1,
        0,
        1.8,
        0.4,
        K.signCell("ppn_freight", "FREIGHT — MAIL RAIL", 256, 56, {
          bg: "#e0b020",
          fg: "#1a1a1a",
          font: "Arial Black, sans-serif",
        }),
        { off: 0 },
      );
      b.geo("lamp", K.sphereGeo(), {
        x: ex + 0.15,
        y: 3.0,
        z: ez + 1.5,
        s: 0.07,
        tint: [1, 0.3, 0.15],
      });
      b.glow(ex + 0.2, 3.0, ez + 1.5, [0.6, 0.12, 0.05], 0.6);
      K.door(ctx, {
        pos: K.world(ctx, ex + 0.5, 1.3, ez),
        label: "Freight Elevator — Mail Rail Platform",
        verb: "Ride",
        sound: "door_open",
        target: { x: O.x - 19.2, y: O.y + BY + 0.05, z: O.z - 88, yaw: -HP },
      });
    }

    // ================================================= DEAD LETTER OFFICE (mezzanine, west)
    {
      const R = { x0: -21, z0: -58, x1: 0, z1: -47 },
        DB = [-21.2, MY - 0.2, -58.2, 0.2, MY + 4.4, -46.8];
      K.room(b, ctx, {
        x0: R.x0,
        z0: R.z0,
        x1: R.x1,
        z1: R.z1,
        y: MY,
        h: 4,
        floor: "parquet",
        fc: [0.55, 0.45, 0.34],
        wall: "plaster",
        wc: [0.7, 0.68, 0.6],
        ceil: "tin",
        cc: [0.5, 0.48, 0.42],
        wain: "oak",
        wainC: [0.45, 0.34, 0.24],
        wainH: 1.0,
      });
      b.plate(
        "art",
        -10,
        MY + 2.9,
        -46.88,
        0,
        1,
        3.2,
        0.5,
        K.signCell("ppn_dlo_sign", "DEAD LETTER OFFICE", 384, 60, {
          bg: "#1e2a24",
          fg: "#e0c878",
          font: "Georgia, serif",
        }),
        { off: 0 },
      );
      for (const [lx, lz] of [
        [-16, -52.5],
        [-9, -52.5],
        [-3, -52.5],
      ])
        K.lamp(b, lx, MY + 3.2, lz, "pendant", warm, 0.7, 7, {
          ceil: MY + 4,
          lightOpts: { box: DB },
        });
      // wire cages full of dead-letter bins along the west and north walls
      const cage = (x0, z0, x1, z1, nx, nz) => {
        const len = Math.hypot(x1 - x0, z1 - z0),
          n = Math.round(len / 1.2);
        for (let k = 0; k < n; k++) {
          const t0 = k / n,
            t1 = (k + 1) / n,
            ax = x0 + (x1 - x0) * t0,
            az = z0 + (z1 - z0) * t0,
            bx = x0 + (x1 - x0) * t1,
            bz = z0 + (z1 - z0) * t1;
          b.plate(
            "art",
            (ax + bx) / 2 + nx * 0.02,
            MY + 1.9,
            (az + bz) / 2 + nz * 0.02,
            nx,
            nz,
            len / n - 0.05,
            3.6,
            K.pigeonCell(k % 3),
            { off: 0 },
          );
          b.beam(
            "black_iron",
            ax + nx * 0.35,
            MY,
            az + nz * 0.35,
            ax + nx * 0.35,
            MY + 3.8,
            az + nz * 0.35,
            0.04,
            0.04,
            { tint: [0.28, 0.28, 0.26] },
          );
        }
        for (let q = 0; q < 14; q++) {
          const yy = MY + 0.1 + q * 0.28;
          b.beam(
            "black_iron",
            x0 + nx * 0.35,
            yy,
            z0 + nz * 0.35,
            x1 + nx * 0.35,
            yy,
            z1 + nz * 0.35,
            0.012,
            0.012,
            { tint: [0.28, 0.28, 0.26] },
          );
        }
        const cols = Math.round(len / 0.12);
        for (let q = 0; q <= cols; q += 2) {
          const t = q / cols;
          b.beam(
            "black_iron",
            x0 + (x1 - x0) * t + nx * 0.35,
            MY,
            z0 + (z1 - z0) * t + nz * 0.35,
            x0 + (x1 - x0) * t + nx * 0.35,
            MY + 3.8,
            z0 + (z1 - z0) * t + nz * 0.35,
            0.008,
            0.008,
            { tint: [0.28, 0.28, 0.26] },
          );
        }
      };
      cage(-20.8, -57.8, -20.8, -48, 1, 0);
      cage(-20.5, -57.8, -6, -57.8, 0, 1);
      b.col(-21, MY, -58, -20.4, MY + 4, -47.2, { tag: "wall" });
      b.col(-21, MY, -58, -6, MY + 4, -57.4, { tag: "wall" });
      // drifts of dead letters: pale mounds + scattered envelopes
      for (const [mx, mz, mr] of [
        [-18.2, -50, 1.6],
        [-16, -55.5, 1.9],
        [-11.5, -56.2, 1.3],
        [-19, -54, 1.2],
      ]) {
        b.geo("letters", K.moundGeo((mx * 7) | 0), {
          x: mx,
          y: MY - 0.02,
          z: mz,
          sx: mr,
          sy: mr * 0.42,
          sz: mr * 0.85,
          ry: r() * 6,
        });
        for (let k = 0; k < 18; k++) {
          const a = r() * 6.3,
            d = r() * mr;
          b.box(
            "flat",
            mx + Math.cos(a) * d,
            MY + (1 - d / mr) * mr * 0.5 + 0.01,
            mz + Math.sin(a) * d,
            0.2,
            0.004,
            0.11,
            {
              yaw: r() * 6,
              tint: r.pick([
                [0.9, 0.88, 0.8],
                [0.84, 0.8, 0.68],
                [0.78, 0.82, 0.88],
                [0.88, 0.8, 0.7],
              ]),
            },
          );
        }
        b.col(
          mx - mr * 0.5,
          MY,
          mz - mr * 0.5,
          mx + mr * 0.5,
          MY + mr * 0.35,
          mz + mr * 0.5,
          { tag: "rubble", surface: "fabric" },
        );
      }
      for (let k = 0; k < 7; k++)
        K.sack(b, -14 + r() * 5, MY, -50 + r() * 2.5, r() * 6, {
          s: 1.0,
          stand: r() < 0.5,
        });
      // the reading table: opened letters, magnifier lamp, letter opener, a stack "ADDRESSEE UNKNOWN"
      K.table(b, -10, MY, -52.5, 3.4, 1.2, {
        mat: "oak",
        tint: [0.5, 0.38, 0.26],
      });
      for (let k = 0; k < 16; k++)
        b.box(
          "flat",
          -11.5 + r() * 3,
          MY + 0.77,
          -53 + r() * 1.0,
          0.21,
          0.003,
          0.28,
          { yaw: r() * 6, tint: [0.88, 0.86, 0.78] },
        );
      b.box("flat", -8.8, MY + 0.77, -52.3, 0.26, 0.3, 0.14, {
        tint: [0.84, 0.82, 0.74],
      });
      b.pipe("brass", -9.2, MY + 0.78, -52.9, -9.2, MY + 1.2, -52.9, 0.012, 3);
      b.cyl("brass", -9.2, MY + 1.2, -52.9, 0.14, 0.08, 0.1, 10);
      b.geo("lamp", K.sphereGeo(), {
        x: -9.2,
        y: MY + 1.18,
        z: -52.9,
        s: 0.04,
        tint: warm,
      });
      K.chair(b, -10.5, MY, -51.6, PI, { mat: "oak" });
      b.plate(
        "art",
        -0.12,
        MY + 2.0,
        -51.5,
        -1,
        0,
        2.4,
        1.6,
        K.signCell(
          "ppn_dlo_rules",
          "DEAD LETTERS\n\nOPEN ONLY TO FIND\nTHE ADDRESSEE.\nREAD NOTHING ELSE.\nREMEMBER NOTHING.",
          256,
          180,
          { bg: "#e0d8c0", fg: "#2a2418", font: "Georgia, serif" },
        ),
        { off: 0.02 },
      );
      // HOLD FOR ADDRESSEE — the one pigeonhole with a brass frame and a red tag, lit by its own little lamp
      {
        const hx = -3.2,
          hz = -57.6;
        b.boxMM("oak", hx - 1.0, MY, hz, hx + 1.0, MY + 1.9, hz + 0.45, {
          tint: [0.45, 0.33, 0.22],
        });
        b.boxMM(
          "gilt",
          hx - 0.45,
          MY + 1.05,
          hz + 0.44,
          hx + 0.45,
          MY + 1.12,
          hz + 0.47,
          { tint: [0.7, 0.55, 0.3] },
        );
        b.boxMM(
          "paint_black",
          hx - 0.4,
          MY + 1.12,
          hz + 0.3,
          hx + 0.4,
          MY + 1.6,
          hz + 0.44,
          { tint: [0.06, 0.05, 0.04], faces: "s" },
        );
        b.plate(
          "art",
          hx,
          MY + 1.8,
          hz + 0.47,
          0,
          1,
          1.5,
          0.22,
          K.signCell("ppn_hold", "HOLD FOR ADDRESSEE", 256, 38, {
            bg: "#8e2a22",
            fg: "#f0e0c0",
            font: "Arial Black, sans-serif",
          }),
          { off: 0 },
        );
        b.pipe("brass", hx, MY + 2.6, hz + 0.3, hx, MY + 4, hz + 0.3, 0.01, 3);
        b.cyl("brass", hx, MY + 2.4, hz + 0.3, 0.16, 0.05, 0.2, 10, {
          tint: [0.6, 0.5, 0.3],
        });
        b.geo("lamp", K.sphereGeo(), {
          x: hx,
          y: MY + 2.38,
          z: hz + 0.3,
          s: 0.05,
          tint: [1, 0.85, 0.6],
        });
        b.light(hx, MY + 2.3, hz + 0.7, warm, 0.9, 3.5, { box: DB });
        b.glow(hx, MY + 2.38, hz + 0.3, [0.6, 0.45, 0.25], 0.9);
        b.col(hx - 1.0, MY, hz, hx + 1.0, MY + 1.9, hz + 0.45, {
          tag: "furniture",
        });
        K.note(ctx, "ppn_special_letter", hx, MY + 1.14, hz + 0.24, {
          type: "note",
          name: "Special Delivery Letter",
        });
        K.anchor(ctx, "letter", hx, MY + 1.2, hz + 1.2);
      }
      K.terminal(
        ctx,
        "ppn_term_dlo",
        -5.5,
        MY,
        -48.2,
        0,
        {
          title: "DEAD LETTER OFFICE — HOLD FILE",
          header: "U.S. POST OFFICE DEPT. — DEAD LETTER OFFICE, NEW YORK 1",
          entries: [
            {
              title: "Statistics",
              text: "Items received since 03/05/1967: 1,904,311\nItems returned to sender: 0 (SENDER UNKNOWN)\nItems delivered: 0 (ADDRESSEE UNKNOWN)\nItems destroyed per Reg. 7-B: 0 (DIRECTIVE 12 OVERRIDE)\nItems on hold: 1\n\nStorage capacity: 214% and rising.",
            },
            {
              title: "Hold shelf",
              text: "ITEM #1: First-Class, SPECIAL DELIVERY. Postmark: Keflavík Field P.O., 03/04/1967 18:00.\nAddressee: KOWALCZYK, MABEL — Hotel Pennsylvania (switchboard).\nDelivery attempts: 0.\nReason: route 14 carrier did not return 03/05/1967.\nStatus: HOLD FOR CERTIFIED CARRIER (Reg. 4-C).\n\nNote appended by unit DL-2: THIS ONE HAS A NAME. THIS ONE HAS AN ADDRESS. THIS ONE CAN STILL GO.",
            },
            {
              title: "Letters of interest (auto-flagged)",
              text: '— To Santa Claus, North Pole. From: "Billy, age 7, Civil Defense shelter list." Request: "a real dog, not a robot one."\n— To the President. From: Mrs. A. Feld, Queens. Subject: "WHERE IS MY SON\'S BODY."\n— To Fizzo Cola Corp. Complaint: Fizzo Blue "tastes like a battery." (Correct.)\n— To "Anyone." Postmarked 03/05/1967, 09:52. Blank page.',
            },
            {
              title: "Security routine (DL-2)",
              text: 'Unit DL-2 (Valet, Dead Letter supervisor): protect the hold shelf from unauthorised personnel.\n\nNote: DL-2 has begun reading the dead letters "to keep them company." Engineering request #4410 to wipe DL-2\'s personality matrix: DENIED (no engineers).',
            },
          ],
        },
        "own_desk",
      );
      K.loot(ctx, "file_cabinet", -1.0, MY, -55.8, HP, {
        loot: "file_cabinet",
        name: "Dead Letter Files",
      });
      K.loot(ctx, "duffle_bag", -14.5, MY, -48.8, 0.4, {
        loot: "mail_sack",
        name: "Dead Letter Sack",
      });
      K.clutter(b, -20, -56.5, -1, -48, MY, {
        n: 16,
        seed: 81,
        kinds: ["paper", "paper", "box", "books"],
        avoid: [
          [-12, -53.5, -8, -51.5],
          [-4.3, -58, -2, -56.5],
        ],
      });
    }

    // ================================================= POSTMASTER'S OFFICE (mezzanine, east, locked)
    {
      const PB = [-0.2, MY - 0.2, -58.2, 21.2, MY + 4.4, -46.8];
      K.room(b, ctx, {
        x0: 0,
        z0: -58,
        x1: 21,
        z1: -47,
        y: MY,
        h: 4,
        floor: "carpet",
        fc: [0.36, 0.2, 0.16],
        wall: "wallpaper_green",
        wc: [0.72, 0.74, 0.66],
        ceil: "coffer",
        cc: [0.55, 0.52, 0.48],
        wain: "mahogany",
        wainC: [0.42, 0.26, 0.18],
        wainH: 1.1,
        cornice: true,
      });
      K.hingedDoor(ctx, b, {
        id: "fa_pmo",
        x: 10,
        z: -47,
        y: MY,
        w: 1.2,
        h: 2.3,
        axis: "x",
        hinge: -1,
        swing: -1,
        mat: "mahogany",
        tint: [0.5, 0.3, 0.2],
        glass: true,
        lock: PV.LOCKS.pm_office,
        label: "Postmaster's Office",
        sign: K.signCell("ppn_pm_door", "POSTMASTER", 256, 80, {
          bg: "#1e2a24",
          fg: "#e0c878",
          font: "Georgia, serif",
          weather: false,
        }),
      });
      K.lamp(b, 10.5, MY + 3.1, -52.5, "globe", warm, 0.8, 8, {
        ceil: MY + 4,
        lightOpts: { box: PB },
      });
      K.lamp(b, 16, MY + 1.0, -55.9, "pendant", warm, 0.5, 4, {
        ceil: MY + 1.6,
        glowSize: 0.6,
        lightOpts: { box: PB },
      });
      // the desk: big partner's desk, green banker's lamp, blotter, in/out trays, a skeleton in the chair
      K.table(b, 16, MY, -54.8, 2.6, 1.2, {
        mat: "mahogany",
        tint: [0.5, 0.3, 0.2],
        h: 0.8,
      });
      b.box("mahogany", 16, MY, -54.8, 2.5, 0.75, 1.1, {
        tint: [0.4, 0.24, 0.16],
      });
      b.box("leather", 16, MY + 0.8, -54.6, 0.9, 0.01, 0.6, {
        tint: [0.2, 0.3, 0.2],
      });
      K.chair(b, 16, MY, -56.1, PI, {
        mat: "leather",
        tint: [0.35, 0.18, 0.12],
      });
      K.skel(ctx, 16, MY + 0.45, -56.1, PI, "seated");
      K.terminal(
        ctx,
        "ppn_term_pm",
        15.1,
        MY + 0.8,
        -54.9,
        0,
        {
          title: "POSTMASTER, NEW YORK N.Y. — OFFICE TERMINAL",
          header: "MERIDIAN TELETYPE CO. — TELELINK — U.S.P.O.D. SECURE",
          lock: PV.LOCKS.pm_term,
          entries: [
            {
              title: "Office safe",
              learn: "ppn_pm_safe",
              text: 'Office safe combination: 1-9-1-4, the year this building opened. The Postmaster General says that is "insecure". The Postmaster General does not have to remember it.',
            },
            {
              title: "Postmaster's log — 08/14/1967",
              text: "The American Automaton conversion is complete. Two hundred Patrolmen in the workroom, forty Valets, one supervisor unit for the Dead Letter Office. Washington says we will save eleven million dollars a year. Washington did not have to explain it to Local 300.\n\nThe robots sort beautifully. They do not sing. The men used to sing on the night shift.",
            },
            {
              title: "Postmaster's log — 03/04/1967",
              text: "Leave letters from Iceland all week — the boys are coming home on spring leave, Easter is early this year. Special Delivery volume up 400%. Told the robots to prioritise V-mail. They were very excited. I think. It is hard to tell with the dome ones.",
            },
            {
              title: "Postmaster's log — 03/05/1967",
              text: "Sirens. Contingency Directive 12 has activated on every unit in the building. THE MAIL MUST GO THROUGH. They will not stop sorting and they will not let anyone into the workroom — not even the staff. The public think the mail rail is a shelter.\n\nI have locked the office. The security override needs a certified carrier credential and every certified carrier in this building is either downstairs or dead.\n\nThe robots are still sorting. I can hear the belts. It is almost soothing.",
            },
            {
              title: "SECURITY: Issue carrier credential",
              text: "CREDENTIAL ISSUED. Temporary Carrier — clearance level 2 (workroom, mezzanine, mail rail).\nAll security units notified.",
              action: () => {
                if (!K.has("ppn_carrier_badge")) K.give("ppn_carrier_badge", 1);
                PV.setFlag("fa_carrier", true);
                if (PV.faPacify) PV.faPacify(true);
              },
            },
            {
              title: "Mail rail: open truck ramp door",
              text: "LOADING DOCK DOOR (BAY 5): UNBARRED.\nThe roll-up door at the top of the truck ramp can now be opened from both sides.",
              action: () => {
                PV.setFlag("fa_dock_open", true);
                K.notify("Loading dock door unbarred.");
              },
            },
          ],
        },
        "bare",
      );
      K.loot(ctx, "safe", 20.4, MY, -52, HP, {
        wall: false,
        loot: "safe",
        name: "Postmaster's Safe",
        locked: 0,
        lock: PV.LOCKS.pm_safe,
      });
      K.loot(ctx, "file_cabinet", 1.0, MY, -56.8, -HP, {
        loot: "file_cabinet",
        name: "Personnel Files",
      });
      // portrait, flag, framed stamps, globe, a window onto the workroom skylight glow
      K.framed(
        b,
        10.5,
        MY + 2.4,
        -57.88,
        0,
        1,
        1.2,
        1.5,
        K.painting(3, 192, 240),
        { frame: "gold" },
      );
      for (let k = 0; k < 4; k++)
        K.framed(
          b,
          3.5 + k * 1.1,
          MY + 2.2,
          -57.88,
          0,
          1,
          0.7,
          0.55,
          K.photo("stamps", k),
          { frame: "gold", fw: 0.04 },
        );
      {
        const fx = 19.8,
          fz = -57.2;
        b.cyl("brass", fx, MY, fz, 0.2, 0.15, 0.1, 8);
        b.pipe("wood_dark", fx, MY + 0.1, fz, fx, MY + 2.4, fz, 0.025, 5);
        b.quad(
          "art",
          [fx, MY + 2.3, fz],
          [fx - 0.02, MY + 2.3, fz + 1.1],
          [fx - 0.02, MY + 1.5, fz + 1.05],
          [fx, MY + 1.4, fz],
          { rect: K.flagCell("us"), grime: 0 },
        );
      }
      b.cyl("wood_dark", 3.2, MY, -50, 0.25, 0.25, 0.8, 8);
      b.geo("paint_blue", K.sphereGeo(), {
        x: 3.2,
        y: MY + 1.05,
        z: -50,
        s: 0.26,
        tint: [0.3, 0.45, 0.6],
      });
      K.sofa(b, 6.0, MY, -47.8, 2.4, PI, {
        mat: "leather",
        tint: [0.35, 0.18, 0.12],
      });
      K.clutter(b, 1, -57.5, 20.5, -47.5, MY, {
        n: 10,
        seed: 91,
        kinds: ["paper", "books", "glass"],
        avoid: [
          [14.4, -56.8, 17.6, -54],
          [4.8, -48.5, 7.2, -47],
        ],
      });
    }

    // ================================================= MAIL RAIL PLATFORM (basement, y −5)
    {
      const PB = [-26.2, BY - 1.2, -110.2, 26.2, BY + 6, -83.8];
      const Y = BY;
      // freight elevator car (arrival) x −24..−20, z −90..−86
      K.room(b, ctx, {
        x0: -24,
        z0: -110,
        x1: 24,
        z1: -84,
        y: Y,
        h: 5.5,
        floor: "concrete",
        fc: [0.5, 0.48, 0.44],
        wall: "subway",
        wc: [0.62, 0.64, 0.56],
        ceil: "concrete_dark",
        cc: [0.4, 0.4, 0.38],
        wain: "teal_tile",
        wainC: [0.42, 0.52, 0.48],
        wainH: 1.4,
        noFloor: true,
        open: { w: true, e: true },
      });
      // platform slab (z −99.5..−84) + track pit (z −104..−99.5) + far walkway (z −110..−104)
      b.face("concrete", -24, Y, -84, 1, 0, 0, 0, 0, -1, 48, 15.5, {
        uv: "top",
        tint: [0.5, 0.48, 0.44],
      });
      b.col(-24, Y - 0.4, -99.5, 24, Y, -84, {
        tag: "floor",
        surface: "concrete",
      });
      b.boxMM("concrete", -24, Y - 0.9, -99.6, 24, Y, -99.4, {
        tint: [0.45, 0.44, 0.4],
        faces: "n",
      });
      b.boxMM("paint_yellow", -24, Y - 0.005, -99.9, 24, Y + 0.005, -99.5, {
        tint: [0.85, 0.7, 0.2],
        faces: "t",
      });
      b.face("dirt", -24, Y - 0.9, -99.5, 1, 0, 0, 0, 0, -1, 48, 4.5, {
        uv: "top",
        tint: [0.4, 0.36, 0.3],
      });
      b.col(-24, Y - 1.3, -104, 24, Y - 0.9, -99.5, {
        tag: "floor",
        surface: "rubble",
      });
      b.face("concrete", -24, Y, -104, 1, 0, 0, 0, 0, -1, 48, 6, {
        uv: "top",
        tint: [0.45, 0.44, 0.4],
      });
      b.boxMM("concrete", -24, Y - 0.9, -104.1, 24, Y, -103.9, {
        tint: [0.45, 0.44, 0.4],
        faces: "s",
      });
      b.col(-24, Y - 0.4, -110, 24, Y, -104, {
        tag: "floor",
        surface: "concrete",
      });
      // rails + sleepers
      for (let k = 0; k < 32; k++)
        b.box(
          "wood_rotten",
          -23.5 + k * 1.5,
          Y - 0.9,
          -101.75,
          0.25,
          0.12,
          2.2,
          { tint: [0.4, 0.32, 0.24] },
        );
      for (const rz of [-101.0, -102.5])
        b.beam("rust", -24, Y - 0.72, rz, 24, Y - 0.72, rz, 0.08, 0.12, {
          tint: [0.5, 0.38, 0.28],
        });
      // tunnel mouths at both ends: west one open & dark, east one collapsed
      for (const [tx, nx] of [
        [-24, 1],
        [24, -1],
      ]) {
        K.fwall(b, "concrete_dark", tx, -110, tx, -104.4, Y - 0.9, 6.4, nx, 0, {
          tint: [0.4, 0.4, 0.38],
        });
        K.fwall(b, "concrete_dark", tx, -99.1, tx, -84, Y, 5.5, nx, 0, {
          tint: [0.4, 0.4, 0.38],
        });
        K.fwall(
          b,
          "concrete_dark",
          tx,
          -104.4,
          tx,
          -99.1,
          Y + 3.2,
          2.3,
          nx,
          0,
          { tint: [0.4, 0.4, 0.38] },
        );
        b.boxMM(
          "paint_black",
          tx - (nx > 0 ? 3 : 0),
          Y - 0.9,
          -104.4,
          tx + (nx > 0 ? 0 : 3),
          Y + 3.2,
          -99.1,
          { tint: [0.02, 0.02, 0.02], faces: nx > 0 ? "e" : "w" },
        );
        b.col(
          tx - (nx > 0 ? 0.3 : 0),
          Y - 1.2,
          -110,
          tx + (nx > 0 ? 0 : 0.3),
          Y + 5.5,
          -84,
          { tag: "wall" },
        );
      }
      b.plate(
        "art",
        -23.8,
        Y + 3.8,
        -101.75,
        1,
        0,
        3.4,
        0.5,
        K.signCell("ppn_rail_w", "← TO PENNSYLVANIA STATION", 384, 56, {
          bg: "#e0d8c0",
          fg: "#1a1a1a",
          font: "Arial Black, sans-serif",
        }),
        { off: 0 },
      );
      K.rubble(b, 22.2, Y - 0.9, -101.8, 2.6, 2.8, {
        seed: 101,
        tint: [0.62, 0.6, 0.55],
      });
      K.rubble(b, 20.4, Y, -106.5, 1.8, 1.3, { seed: 102 });
      // the mail car: flatbed with hampers + a little motorman's cab
      {
        const cx = -6,
          cz = -101.75,
          cy = Y - 0.72;
        for (const s of [-1, 1])
          for (const w of [-1, 1])
            b.geo("rust", K.unitCyl(10), {
              x: cx + s * 3.4,
              y: cy + 0.35,
              z: cz + w * 0.75,
              sx: 0.35,
              sy: 0.12,
              sz: 0.35,
              rx: HP,
              tint: [0.35, 0.3, 0.26],
            });
        b.box("usps_red", cx, cy + 0.5, cz, 9.0, 0.4, 2.2, {
          tint: [0.6, 0.3, 0.24],
          faces: "nsewtb",
        });
        b.box("usps_blue", cx + 3.6, cy + 0.9, cz, 1.8, 1.7, 2.2, {
          tint: [0.6, 0.65, 0.75],
        });
        b.box("glass_dark", cx + 3.6, cy + 1.95, cz, 1.7, 0.5, 2.1, {
          tint: [0.3, 0.34, 0.33],
        });
        b.box("usps_blue", cx + 3.6, cy + 2.45, cz, 1.9, 0.1, 2.3, {
          tint: [0.6, 0.65, 0.75],
        });
        for (let k = 0; k < 3; k++)
          K.hamper(b, cx - 3 + k * 2.1, cy + 0.9, cz, 0, { col: false });
        b.plate(
          "art",
          cx,
          cy + 0.72,
          cz + 1.11,
          0,
          1,
          2.6,
          0.3,
          K.signCell("ppn_railcar", "U.S. MAIL — PENN TERMINAL", 320, 40, {
            bg: "#8e2a22",
            fg: "#e8dcb8",
            font: "Arial Black, sans-serif",
          }),
          { off: 0.01 },
        );
        b.col(cx - 4.5, cy, cz - 1.1, cx + 4.5, cy + 1.9, cz + 1.1, {
          tag: "car",
          surface: "metal",
          walkable: true,
        });
      }
      // platform furniture: baggage carts, sack mountains, a sandbagged "shelter" corner where the public waited
      K.hamper(b, 4, Y, -96, 0.3, {});
      K.hamper(b, 8.5, Y, -95.2, -0.2, {});
      for (let k = 0; k < 10; k++)
        K.sack(b, 12 + r() * 4, Y, -97.5 + r() * 3, r() * 6, {
          s: 1.1,
          stand: r() < 0.3,
        });
      for (const [sx, sz] of [
        [-15, -95],
        [-12, -93],
        [-17, -91.5],
      ])
        K.skel(ctx, sx, Y, sz, r() * 6, r() < 0.5 ? "curled" : "lying");
      K.skel(ctx, -18.6, Y, -86.2, 0.8, "sitting");
      b.plate(
        "art",
        -10,
        Y + 2.8,
        -84.12,
        0,
        -1,
        1.0,
        1.35,
        K.posterCell("rad"),
        { off: 0 },
      );
      b.plate(
        "decal",
        -14,
        Y + 2.2,
        -84.12,
        0,
        -1,
        3.2,
        0.9,
        K.tag("NOT A SHELTER", "#c83020", 384, 96, {}),
        { off: 0 },
      );
      // caged bulbs + red emergency lamps
      for (let k = 0; k < 6; k++) {
        const lx = -20 + k * 8;
        K.lamp(
          b,
          lx,
          Y + 4.6,
          -86,
          "cage",
          k % 2 ? red : [1, 0.82, 0.5],
          k % 2 ? 0.5 : 0.6,
          9,
          { ceil: Y + 5.5, lightOpts: { box: PB } },
        );
      }
      for (let k = 0; k < 4; k++)
        K.lamp(
          b,
          -18 + k * 12,
          Y + 4.6,
          -107,
          "cage",
          [1, 0.82, 0.5],
          0.35,
          8,
          { ceil: Y + 5.5, lightOpts: { box: PB } },
        );
      // freight elevator car (arrival alcove, west end)
      b.boxMM("metal_dark", -24, Y, -90.5, -20.5, Y + 0.05, -85.5, {
        tint: [0.35, 0.36, 0.34],
        faces: "t",
      });
      for (let q = 0; q < 10; q++)
        b.beam(
          "black_iron",
          -24 + q * 0.4,
          Y,
          -90.5,
          -24 + q * 0.4,
          Y + 3,
          -90.5,
          0.025,
          0.025,
          { tint: [0.35, 0.34, 0.3] },
        );
      K.door(ctx, {
        pos: K.world(ctx, -22.8, BY + 1.3, -88),
        label: "Freight Elevator — Workroom",
        verb: "Ride",
        sound: "door_open",
        target: { x: O.x - 19.4, y: O.y + 0.05, z: O.z - 43, yaw: -HP },
      });
      // truck ramp up to the loading dock (east end, north side of the platform)
      K.stairs(b, 14, -90.5, 22, -86.5, Y, Y + 2.4, "+x", {
        mat: "concrete",
        tint: [0.5, 0.48, 0.44],
        rail: "l",
        maxRise: 0.2,
      });
      b.boxMM("concrete", 22, Y, -90.5, 24, Y + 2.4, -86.5, {
        tint: [0.5, 0.48, 0.44],
        faces: "nstw",
      });
      b.col(22, Y, -90.5, 24, Y + 2.4, -86.5, { tag: "floor" });
      b.boxMM("corrugated", 23.9, Y + 2.4, -90.3, 23.95, Y + 5.4, -86.7, {
        tint: [0.5, 0.56, 0.62],
      });
      b.plate(
        "art",
        23.85,
        Y + 5.2,
        -88.5,
        -1,
        0,
        1.6,
        0.3,
        K.signCell("ppn_bay5", "BAY 5 — 9TH AVE", 256, 48, {
          bg: "#24385e",
          fg: "#e8dcb8",
          font: "Arial Black, sans-serif",
        }),
        { off: 0 },
      );
      K.terminal(
        ctx,
        "ppn_term_rail",
        6,
        Y,
        -85.2,
        0,
        {
          title: "MAIL RAIL — PENN TERMINAL CONTROL",
          header: "PENNSYLVANIA R.R. / U.S.P.O.D. JOINT MAIL RAILWAY",
          entries: [
            {
              title: "Schedule 03/05/1967",
              text: "06:10  Mail train 7 from Penn Station — ARRIVED\n08:10  Mail train 8 — ARRIVED\n09:40  Mail train 9 — DEPARTED FOR PENN STATION\n09:47  ALL TRAFFIC HALTED — TUNNEL COLLAPSE (EAST)\n\nTrain 9 status: UNKNOWN. Last position: under 8th Avenue.",
            },
            {
              title: "Motorman's note",
              text: "Anybody reading this: the west tunnel still goes through to Penn Station, far as I know. It's dark and the rats are the size of dogs and there's something big living in train 9. I'm going up the truck ramp to the dock. Door sticks — kick it low on the left.",
            },
          ],
        },
        "own_desk",
      );
      K.loot(ctx, "footlocker", 18, Y, -96.5, PI, {
        loot: "footlocker",
        name: "Motorman's Footlocker",
        items: [["ppn_mail_rail_pass", 1]],
      });
      K.loot(ctx, "ammo_box", -19.5, Y, -95.8, 0.4, { loot: "ammo_box" });
      K.loot(ctx, "first_aid", -23.8, Y + 1.4, -92.5, -HP, {
        loot: "first_aid",
        wall: true,
      });
      K.clutter(b, -20, -99, 20, -85, Y, {
        n: 22,
        seed: 111,
        kinds: ["paper", "can", "debris", "box", "glass"],
        avoid: [
          [-11, -99.5, 10, -94],
          [13.8, -91, 24, -86],
        ],
      });
      b.light(0, Y + 3, -107, [0.6, 0.66, 0.6], 0.25, 20, {
        box: PB,
        wrap: 0.7,
      });
      // one-way exit: truck-ramp door (inside) ↔ 9th Avenue loading dock (outside, barred until opened)
      const dock = FA.dockDoor;
      if (dock)
        K.oneWay(ctx, {
          flag: "fa_dock_open",
          sound: "door_open",
          open: {
            pos: K.world(ctx, 23.4, BY + 3.6, -88.5),
            label: "Loading Dock (9th Avenue)",
            verb: "Open",
            target: { x: dock.x - 0.4, y: dock.y + 0.05, z: dock.z, yaw: HP },
            msg: "You kick the roll-up door low on the left. It sticks, then gives.",
          },
          barred: {
            pos: new THREE.Vector3(dock.x + 0.3, dock.y + 1.4, dock.z),
            label: "Farley Loading Dock (Bay 5)",
            verb: "Open",
            target: {
              x: O.x + 21.8,
              y: O.y + BY + 2.45,
              z: O.z - 88.5,
              yaw: HP,
            },
            msg: "The roll-up door is jammed from the inside.",
          },
        });
    }

    // ------------------------------------------------ anchors
    K.anchor(ctx, "entrance", 0, 0, -1.5);
    K.anchor(ctx, "spawn1", -8, MY, -42.5); // mezzanine patrol
    K.anchor(ctx, "spawn2", -13, MY, -50.5); // DL-2 (the Valet) in the Dead Letter Office
    K.anchor(ctx, "spawn3", -4, 0, -36.2); // workroom, under the mezzanine
    K.anchor(ctx, "spawn4", 0, BY, -92); // mail rail platform
    K.anchor(ctx, "spawn5", 12, BY, -89);
    K.anchor(ctx, "spawn6", 6, MY, -44);
    K.anchor(ctx, "loot1", 20.4, MY, -52);
    K.anchor(ctx, "loot2", 18, BY, -96.5);
    K.anchor(ctx, "loot3", -28.4, 0, -0.8);
    // routes of the three sorter units (world coords)
    const W = (x, z, y) => K.world(ctx, x, y || 0, z);
    ctx.routes = [
      [W(-17, -17.2), W(8, -17.2), W(8, -17.4), W(-17, -17.4)],
      [W(-17, -26.2), W(8.5, -26.2), W(8.5, -26.6), W(-17, -26.6)],
      [W(-17, -35.9), W(11, -35.9), W(11, -35.3), W(-17, -35.3)],
    ];

    // exit to 8th Avenue
    K.door(ctx, {
      pos: K.world(ctx, 0, 1.3, -0.35),
      label: "8th Avenue",
      verb: "Exit",
      sound: "door_open",
      target: { x: FA.WALL_X + 1.8, y: FA.PY + 0.05, z: -119, yaw: -HP },
    });

    // street door (8th Avenue colonnade) → lobby
    K.door(ctx, {
      pos: FA.door.clone(),
      label: "James A. Farley Post Office",
      verb: "Enter",
      sound: "door_open",
      target: { x: O.x, y: O.y + 0.05, z: O.z - 1.5, yaw: 0 },
    });

    K.buildDoors(ctx);
    const g = b.finish(ctx.intRoot);
    g.name = "poi_farley_int_mesh";

    // parcels on the belts (dynamic, one InstancedMesh)
    buildParcels(ctx, BELT, BH);
  };

  // ------------------------------------------------------------------
  // Moving parcels + the conveyor hum
  // ------------------------------------------------------------------
  function buildParcels(ctx, BELT, BH) {
    const O = ctx.O,
      N = 16;
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const cols = new Float32Array(geo.attributes.position.count * 3);
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const ny = geo.attributes.normal.getY(i);
      const l = ny > 0.5 ? 0.62 : 0.42;
      cols[i * 3] = l * 0.95;
      cols[i * 3 + 1] = l * 0.82;
      cols[i * 3 + 2] = l * 0.62;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    const mesh = new THREE.InstancedMesh(geo, K.mat("wood", true), N);
    mesh.name = "ppn_parcels";
    mesh.frustumCulled = false;
    const pts = BELT.map(
      (p) => new THREE.Vector3(p[0] + O.x, O.y + BH, p[1] + O.z),
    );
    const seg = [];
    let L = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const d = pts[i].distanceTo(pts[i + 1]);
      seg.push([L, d]);
      L += d;
    }
    const r = K.rng("parcels");
    const P = [];
    for (let i = 0; i < N; i++)
      P.push({
        s: (i * L) / N + r() * 1.2,
        w: 0.3 + r() * 0.35,
        h: 0.18 + r() * 0.25,
        d: 0.25 + r() * 0.3,
        yaw: (r() - 0.5) * 0.5,
      });
    ctx.intRoot.add(mesh);
    const m4 = new THREE.Matrix4(),
      q = new THREE.Quaternion(),
      e = new THREE.Euler(),
      sc = new THREE.Vector3(),
      pos = new THREE.Vector3();
    ctx.parcels = {
      mesh,
      pts,
      seg,
      L,
      P,
      place() {
        for (let i = 0; i < N; i++) {
          const p = P[i];
          let s = ((p.s % L) + L) % L,
            k = 0;
          while (k < seg.length - 1 && s > seg[k][0] + seg[k][1]) k++;
          const t = (s - seg[k][0]) / seg[k][1],
            A = pts[k],
            B = pts[k + 1];
          pos.set(
            A.x + (B.x - A.x) * t,
            A.y + p.h / 2 + 0.02,
            A.z + (B.z - A.z) * t,
          );
          const fade = s < 0.6 ? s / 0.6 : s > L - 0.6 ? (L - s) / 0.6 : 1; // appear from the chute, drop off the end
          e.set(0, Math.atan2(B.x - A.x, B.z - A.z) + p.yaw, 0);
          q.setFromEuler(e);
          sc.set(p.w * fade + 1e-3, p.h * fade + 1e-3, p.d * fade + 1e-3);
          m4.compose(pos, q, sc);
          mesh.setMatrixAt(i, m4);
        }
        mesh.instanceMatrix.needsUpdate = true;
      },
    };
    ctx.parcels.place();
  }
  let hum = null;
  PV.faInteriorUpdate = function (dt, realDt, ctx) {
    if (!ctx.inside) {
      if (hum) {
        K.safe("hum stop", () => hum.stop());
        hum = null;
      }
      return;
    }
    const P = ctx.parcels;
    if (P && dt > 0) {
      for (const p of P.P) p.s += dt * 0.55;
      P.place();
    }
    if (!hum && dt > 0)
      hum = K.sfx("hum_electric", K.world(ctx, -4, 1.2, -26), {
        loop: true,
        volume: 0.35,
      });
  };
})();
