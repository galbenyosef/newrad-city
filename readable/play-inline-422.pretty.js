/* src/poi_harbor2/10_whitehall.js */
/* =====================================================================
 * NEW RAD CITY — poi_harbor2 / 10_whitehall.js
 * WHITEHALL FERRY TERMINAL — the Staten Island ferry house at the tip of
 * Manhattan, now the WHITEHALL CARAVAN STAGE: the friendliest hub on the
 * waterfront, where every pack train from Brooklyn, the Bronx and "points
 * west" unloads, trades, drinks and sleeps.
 *
 * EXTERIOR (site 144..188 × 943..977, mostly over water): the terminal is
 * built in a LOCAL FRAME laid along the Battery shoreline (47°), facing the
 * land (local −z) with its three ferry slips running out into the harbour
 * (local +z). Beaux-Arts ferry house in green-painted pressed metal and
 * cream stucco: five great arches, paired pilasters, MUNICIPAL FERRY
 * entablature, balustraded parapet and the clock attic (stopped at 9:47).
 * Out back: slip portals 1-2-3, lattice apron gantries with counterweights,
 * timber racks, the rusted ferry MARGARET CORBIN in slip 1 (boardable —
 * the Slack Tide saloon), a second ferry sunk and listing in slip 3.
 * On the timber apron: the caravan stage — ox pen, covered wagons,
 * stalls, campfire, signpost, watchtower, sandbag chicane, string lights.
 * INTERIOR → 11_whitehall_interior.js (waiting room + the ferry).
 * Quest: "Slack Water" (Gus Bellamy): fetch the pump governor from the
 *   sunken fireboat at Pier A so the Corbin's bilge pumps can run again.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._ph2;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // Local frame along the Battery shore: Manhattan polygon edge (190,900) → (110,985).
  const SA = [190, 900],
    SB = [110, 985];
  const UL = Math.hypot(SB[0] - SA[0], SB[1] - SA[1]);
  const UX = (SB[0] - SA[0]) / UL,
    UZ = (SB[1] - SA[1]) / UL; // along the shore (→ SW)
  const NX = UZ,
    NZ = -UX; // offshore normal (→ SE): (0.728, 0.685)
  const T0 = 53; // pivot: 53 m from SA along the shore
  const F = K.frame(SA[0] + UX * T0, SA[1] + UZ * T0, Math.atan2(NX, NZ));
  const WH = (PV.wh = {
    F,
    AY: 0.3,
    FL: 0.9,
    X0: -18,
    X1: 18,
    Z0: 13,
    Z1: 31,
    H: 13.4, // terminal block (local)
    SLIPS: [-12, 0, 12],
    FERRY: { cx: -12, cz: 49, len: 32, beam: 8.4, deck: 1.1 },
  });

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  function exterior(ctx) {
    const root = new THREE.Group();
    root.name = "ph2_whitehall_ext";
    ctx.extRoot = root;
    const b = K.xfBuilder({ name: "wh_ext", grime: 0.35 }, F);
    const d = K.xfBuilder({ name: "wh_detail", grime: 0.4 }, F);
    const { AY, FL, X0, X1, Z0, Z1, H } = WH;
    const green = [0.72, 0.9, 0.78],
      cream = [0.96, 0.9, 0.76],
      grn = [0.62, 0.8, 0.68];

    // ---------------- timber platform: apron, flank walks, back quay, racks ----------------
    const deck = (x0, z0, x1, z1, o) => {
      o = o || {};
      b.face("deck", x0, AY, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: o.tint || [0.95, 0.92, 0.86],
        grime: 0.45,
      });
      b.col(x0, AY - 1.2, z0, x1, AY, z1, { tag: "deck", surface: "wood" });
      if (o.edges !== false)
        for (const [ax, az, bx, bz, nx, nz] of o.edges || []) {
          // fascia beam + tire fenders on water-facing edges
          b.boxMM(
            "wood_rotten",
            Math.min(ax, bx) - (nx < 0 ? 0.25 : 0),
            AY - 0.55,
            Math.min(az, bz) - (nz < 0 ? 0.25 : 0),
            Math.max(ax, bx) + (nx > 0 ? 0.25 : 0),
            AY + 0.05,
            Math.max(az, bz) + (nz > 0 ? 0.25 : 0),
            { tint: [0.5, 0.44, 0.38], faces: "nsewtb" },
          );
        }
    };
    deck(-21, -1.5, 21, Z0, {
      edges: [
        [-21, 0, -21, Z0, -1, 0],
        [21, 0, 21, Z0, 1, 0],
      ],
    });
    deck(-21, Z0, X0, Z1, { edges: [[-21, Z0, -21, Z1, -1, 0]] });
    deck(X1, Z0, 21, Z1, { edges: [[21, Z0, 21, Z1, 1, 0]] });
    deck(-21, Z1, 21, 34.5, {
      edges: [
        [-21, 34.5, 21, 34.5, 0, 1],
        [-21, Z1, -21, 34.5, -1, 0],
        [21, Z1, 21, 34.5, 1, 0],
      ],
    });
    // piles under apron / walks / quay (edge rows only: the insides are never seen)
    K.piles(b, -21, 0, 21, 34.5, AY, 3, {
      edgeOnly: true,
      seed: 11,
      skip: (x, z) => x > X0 + 1 && x < X1 - 1 && z > Z0 + 1 && z < Z1 - 1,
    });
    // cross bracing between the outer piles on the flanks
    for (const xs of [-21, 21])
      for (let z = 1; z < 33; z += 3)
        b.beam("wood_rotten", xs, -1.1, z, xs, AY - 0.4, z + 3, 0.12, 0.08, {
          tint: [0.5, 0.45, 0.38],
        });
    // timber racks (fender catwalks) between the slips, and the pile walls that guide the ferries in
    WH.RACKS = [-17.8, -6, 6, 17.8];
    for (const rx of WH.RACKS) {
      deck(rx - 0.8, 34.5, rx + 0.8, 60, {
        edges: [
          [rx - 0.8, 34.5, rx - 0.8, 60, -1, 0],
          [rx + 0.8, 34.5, rx + 0.8, 60, 1, 0],
        ],
      });
      for (let z = 35.5; z < 60; z += 1.6)
        for (const e of [-1, 1]) {
          K.pile(b, rx + e * 1.05, z, AY + 1.6 + (z > 52 ? -0.8 : 0), 0.19, {
            tint: [0.52, 0.46, 0.38],
          });
        }
      for (const e of [-1, 1])
        for (const y of [AY + 0.4, AY + 1.2])
          b.beam(
            "wood_rotten",
            rx + e * 1.25,
            y,
            35,
            rx + e * 1.25,
            y,
            60,
            0.18,
            0.25,
            { tint: [0.46, 0.4, 0.34] },
          );
      // lamp post at the end of each rack
      b.cyl("cast_iron", rx, AY, 59.2, 0.08, 0.06, 4.2, 6);
      b.box("cast_iron", rx, AY + 4.2, 59.2, 0.5, 0.08, 0.08);
      K.lamp(d, rx + 0.22, AY + 3.95, 59.2, "globe", [1, 0.8, 0.55], 0, 0, {
        ceil: AY + 4.2,
        size: 0.14,
        glowSize: 1.6,
        dead: rx === 6,
      });
      K.bollard(b, rx, AY, 58.3);
    }
    // swimmers' stairs: timber treads stepping down the quay face into the water (the way out for swimmers)
    for (const [lx, lz, nx, nz] of [
      [-21, 6, -1, 0],
      [21, 24, 1, 0],
      [9, 34.5, 0, 1],
    ]) {
      const hx = Math.abs(nx) > 0.5 ? 0.17 : 0.45,
        hz = Math.abs(nz) > 0.5 ? 0.17 : 0.45;
      for (let k = 0; k < 5; k++) {
        const dd = 0.3 + (4 - k) * 0.34,
          y = -1.55 + k * 0.37,
          cx = lx + nx * dd,
          cz = lz + nz * dd;
        b.boxMM(
          "planks_iron",
          cx - hx,
          y - 0.08,
          cz - hz,
          cx + hx,
          y,
          cz + hz,
          { tint: [0.6, 0.52, 0.44], faces: "nsewtb" },
        );
        b.col(cx - hx, y - 0.3, cz - hz, cx + hx, y, cz + hz, {
          tag: "stairs",
          surface: "wood",
        });
      }
      for (const e of [-1, 1]) {
        const sx = lx + nz * e * 0.5,
          sz = lz + nx * e * 0.5;
        b.beam(
          "rust",
          sx + nx * 0.2,
          AY,
          sz + nz * 0.2,
          sx + nx * 1.8,
          -1.7,
          sz + nz * 1.8,
          0.08,
          0.14,
        );
        b.beam(
          "rust",
          sx + nx * 0.2,
          AY + 1.0,
          sz + nz * 0.2,
          sx + nx * 1.8,
          -0.6,
          sz + nz * 1.8,
          0.05,
          0.05,
        );
      }
    }
    // bollards & cleats along the quay and apron edges
    for (let x = -19; x <= 19; x += 6.3) K.bollard(b, x, AY, 33.8);
    for (let z = 2; z < 30; z += 7) {
      K.bollard(b, -20.4, AY, z);
      K.bollard(b, 20.4, AY, z);
    }
    for (let x = -20; x <= 20; x += 5)
      K.tireFender(b, x, AY - 0.7, 34.75, 0, 1);

    // ---------------- the terminal block ----------------
    // plinth (granite) + floor level
    b.boxMM("granite", X0 - 0.3, AY, Z0 - 0.3, X1 + 0.3, FL, Z1 + 0.3, {
      tint: [0.78, 0.76, 0.72],
    });
    // walls: cream stucco field
    K.fwall(b, "plaster", X0, Z0, X1, Z0, FL, H - FL, 0, -1, { tint: cream });
    K.fwall(b, "plaster", X0, Z1, X1, Z1, FL, H - FL, 0, 1, { tint: cream });
    K.fwall(b, "plaster", X0, Z0, X0, Z1, FL, H - FL, -1, 0, { tint: cream });
    K.fwall(b, "plaster", X1, Z0, X1, Z1, FL, H - FL, 1, 0, { tint: cream });
    b.col(X0, AY, Z0, X1, H + 1, Z1, { tag: "building" });
    // roof slab + parapet backs
    b.face("concrete_dark", X0, H, Z1, 1, 0, 0, 0, 0, -1, X1 - X0, Z1 - Z0, {
      uv: "top",
      tint: [0.42, 0.4, 0.38],
    });

    // pilaster + frieze + cornice rhythm on all four faces
    const faceRun = (ax, az, bx, bz, nx, nz, bays) => {
      const len = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / len,
        uz = (bz - az) / len;
      const P = (t) => [ax + ux * t, az + uz * t];
      // pilasters at bay divisions (pressed metal, green)
      for (let k = 0; k <= bays; k++) {
        const p = P((len * k) / bays);
        K.pilaster(b, p[0], FL, p[1], nx, nz, 1.0, 7.0 - FL + 0.7, {
          mat: "pressed",
          tint: green,
          depth: 0.32,
        });
        K.pilaster(b, p[0], 8.6, p[1], nx, nz, 0.7, 4.0, {
          mat: "pressed",
          tint: green,
          depth: 0.22,
        });
      }
      // entablature band & cornice
      const A = P(-0.5),
        Bq = P(len + 0.5);
      b.box(
        "pressed",
        (A[0] + Bq[0]) / 2 + nx * 0.2,
        7.6,
        (A[1] + Bq[1]) / 2 + nz * 0.2,
        Math.abs(nx) > 0.5 ? 0.4 : len + 1,
        1.0,
        Math.abs(nx) > 0.5 ? len + 1 : 0.4,
        { tint: green, faces: "nsewtb" },
      );
      b.box(
        "pressed",
        (A[0] + Bq[0]) / 2 + nx * 0.28,
        8.5,
        (A[1] + Bq[1]) / 2 + nz * 0.28,
        Math.abs(nx) > 0.5 ? 0.56 : len + 1.1,
        0.14,
        Math.abs(nx) > 0.5 ? len + 1.1 : 0.56,
        { tint: grn, faces: "nsewtb" },
      );
      K.cornice(b, A[0], A[1], Bq[0], Bq[1], 12.6, nx, nz, {
        mat: "pressed",
        tint: green,
        depth: 0.85,
        h: 0.8,
        brackets: 1.2,
      });
      // balustraded parapet
      const pA = P(-0.3),
        pB = P(len + 0.3),
        plen = len + 0.6;
      b.box(
        "plaster",
        (pA[0] + pB[0]) / 2 + nx * 0.1,
        H,
        (pA[1] + pB[1]) / 2 + nz * 0.1,
        Math.abs(nx) > 0.5 ? 0.35 : plen,
        0.18,
        Math.abs(nx) > 0.5 ? plen : 0.35,
        { tint: cream },
      );
      b.box(
        "plaster",
        (pA[0] + pB[0]) / 2 + nx * 0.1,
        H + 0.85,
        (pA[1] + pB[1]) / 2 + nz * 0.1,
        Math.abs(nx) > 0.5 ? 0.42 : plen,
        0.16,
        Math.abs(nx) > 0.5 ? plen : 0.42,
        { tint: cream },
      );
      const nb = Math.floor(plen / 0.36);
      for (let k = 0; k < nb; k++) {
        const t = -0.3 + ((k + 0.5) * plen) / nb,
          p = P(t);
        if (k % 9 === 0) {
          b.box(
            "plaster",
            p[0] + nx * 0.1,
            H + 0.18,
            p[1] + nz * 0.1,
            0.34,
            0.67,
            0.34,
            { tint: cream },
          );
          continue;
        }
        b.cyl(
          "plaster",
          p[0] + nx * 0.1,
          H + 0.18,
          p[1] + nz * 0.1,
          0.07,
          0.1,
          0.67,
          6,
          { tint: [0.9, 0.85, 0.72] },
        );
      }
    };
    faceRun(X0, Z0, X1, Z0, 0, -1, 5);
    faceRun(X1, Z1, X0, Z1, 0, 1, 4);
    faceRun(X0, Z1, X0, Z0, -1, 0, 3);
    faceRun(X1, Z0, X1, Z1, 1, 0, 3);

    // ---- land facade (z = Z0, facing −z): five great arches ----
    const bays = [-14.4, -7.2, 0, 7.2, 14.4];
    const archSt = ["boarded", "lit", "lit", "lit", "broken"];
    bays.forEach((x, i) => {
      const w = i === 2 ? 5.0 : 4.4;
      K.archWin(b, x, FL + 0.15, Z0, 0, -1, w, 6.3, {
        state: archSt[i],
        surround: "pressed",
        surroundTint: green,
        frame: "ferry_green",
        fw: 0.3,
        depth: 0.3,
        paneTint: archSt[i] === "lit" ? [0.62, 0.44, 0.26] : undefined,
        view: archSt[i] === "lit" ? K.roomView("hall", i - 1) : null,
        viewTint: [0.95, 0.95, 0.9],
      });
      // upper storey: paired sashes
      for (const e of [-1, 1]) {
        const st =
          (i * 2 + (e > 0 ? 1 : 0)) % 5 === 3
            ? "broken"
            : i === 0
              ? "boarded"
              : (i + e) % 3 === 0
                ? "dark"
                : "glass";
        K.sash(b, x + e * 1.55, 9.3, Z0, 0, -1, 1.5, 2.6, {
          state: st,
          frame: "ferry_green",
          surround: "pressed",
          surroundTint: grn,
          cols: 2,
          rows: 4,
          lintel: 0.22,
        });
      }
    });
    // central doors inside the middle arch: double doors, glazed upper leaves, brass push bars
    for (const e of [-1, 1]) {
      b.boxMM(
        "ferry_green",
        e < 0 ? -1.55 : 0.03,
        FL + 0.15,
        Z0 - 0.12,
        e < 0 ? -0.03 : 1.55,
        FL + 3.1,
        Z0 - 0.04,
        { tint: [0.7, 0.85, 0.72] },
      );
      b.boxMM(
        "glass",
        e < 0 ? -1.35 : 0.23,
        FL + 1.8,
        Z0 - 0.13,
        e < 0 ? -0.23 : 1.35,
        FL + 2.9,
        Z0 - 0.125,
        { tint: [0.5, 0.42, 0.3] },
      );
      b.beam(
        "brass",
        e * 0.25,
        FL + 1.1,
        Z0 - 0.2,
        e * 1.2,
        FL + 1.1,
        Z0 - 0.2,
        0.05,
        0.05,
      );
    }
    // steps up to the plinth in front of the three centre bays
    for (let k = 0; k < 3; k++)
      b.boxMM(
        "granite",
        -10.5,
        AY,
        Z0 - 0.3 - (3 - k) * 0.42,
        10.5,
        AY + (k + 1) * 0.2,
        Z0 - 0.3 - (2 - k) * 0.42,
        { tint: [0.74, 0.72, 0.68], faces: "nsewt" },
      );
    for (let k = 0; k < 3; k++)
      b.col(
        -10.5,
        AY,
        Z0 - 0.3 - (3 - k) * 0.42,
        10.5,
        AY + (k + 1) * 0.2,
        Z0 - 0.3 - (2 - k) * 0.42,
        { tag: "stairs", surface: "concrete" },
      );
    // MUNICIPAL FERRY lettering on the entablature
    K.letters(
      b,
      0,
      8.1,
      Z0 - 0.42,
      0,
      -1,
      15,
      0.7,
      "MUNICIPAL  FERRY  TERMINAL",
      { fg: "#e8d49a", font: "Georgia, serif", weight: "bold" },
    );
    K.letters(b, -12.5, 8.1, Z0 - 0.42, 0, -1, 5, 0.5, "STATEN ISLAND", {
      fg: "#d8c890",
      size: 0.6,
    });
    K.letters(b, 12.5, 8.1, Z0 - 0.42, 0, -1, 5, 0.5, "SOUTH FERRY", {
      fg: "#d8c890",
      size: 0.6,
    });

    // central clock attic above the parapet
    b.boxMM("plaster", -4.4, H, Z0 - 0.2, 4.4, H + 2.4, Z0 + 1.0, {
      tint: cream,
    });
    for (let k = 0; k <= 10; k++) {
      // segmental arch top (fan of triangles, front + back)
      const a0 = (PI * k) / 11,
        a1 = (PI * (k + 1)) / 11,
        R = 4.4,
        yc = H + 2.4,
        hk = 2.2;
      const P0 = [Math.cos(a0) * R, yc + Math.sin(a0) * hk],
        P1 = [Math.cos(a1) * R, yc + Math.sin(a1) * hk];
      K.tri(
        b,
        "plaster",
        [P0[0], P0[1], Z0 - 0.2],
        [P1[0], P1[1], Z0 - 0.2],
        [0, yc, Z0 - 0.2],
        [0, 0, -1],
        { tint: cream },
      );
      K.tri(
        b,
        "plaster",
        [P0[0], P0[1], Z0 + 1.0],
        [P1[0], P1[1], Z0 + 1.0],
        [0, yc, Z0 + 1.0],
        [0, 0, 1],
        { tint: cream },
      );
      b.beam(
        "pressed",
        P0[0],
        P0[1] + 0.12,
        Z0 + 0.4,
        P1[0],
        P1[1] + 0.12,
        Z0 + 0.4,
        1.5,
        0.3,
        { tint: green },
      );
    }
    b.box("pressed", 0, H + 4.7, Z0 + 0.4, 0.6, 0.9, 0.6, { tint: green });
    b.pipe("black_iron", 0, H + 5.6, Z0 + 0.4, 0, H + 11, Z0 + 0.4, 0.05, 6);
    const flag = K.flagCell("us", 256, 150);
    b.quad(
      "art",
      [0.05, H + 8.6, Z0 + 0.4],
      [2.6, H + 8.3, Z0 + 0.5],
      [2.5, H + 10.8, Z0 + 0.45],
      [0.05, H + 10.9, Z0 + 0.4],
      { rect: flag, grime: 0 },
    );
    b.quad(
      "art",
      [2.6, H + 8.3, Z0 + 0.5],
      [0.05, H + 8.6, Z0 + 0.4],
      [0.05, H + 10.9, Z0 + 0.4],
      [2.5, H + 10.8, Z0 + 0.45],
      { rect: flag, grime: 0 },
    );
    // the clock: dial, brass ring, hands at 9:47
    const dial = K.paint("art", "ph2_wh_dial", 256, 256, (x, X, Y, W, Hh) => {
      const cx = X + W / 2,
        cy = Y + Hh / 2,
        R = W * 0.48;
      x.fillStyle = "#e8e0c8";
      x.beginPath();
      x.arc(cx, cy, R, 0, 6.3);
      x.fill();
      x.strokeStyle = "#2a2622";
      x.lineWidth = 4;
      x.stroke();
      x.fillStyle = "#2a2622";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.font = "bold 26px Georgia, serif";
      const RN = [
        "XII",
        "I",
        "II",
        "III",
        "IIII",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
      ];
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2 - Math.PI / 2;
        x.fillText(
          RN[k],
          cx + Math.cos(a) * R * 0.78,
          cy + Math.sin(a) * R * 0.78,
        );
      }
      for (let k = 0; k < 60; k++) {
        const a = (k / 60) * Math.PI * 2;
        x.fillRect(
          cx + Math.cos(a) * R * 0.93 - 1,
          cy + Math.sin(a) * R * 0.93 - 1,
          k % 5 ? 2 : 5,
          k % 5 ? 2 : 5,
        );
      }
      K.stains(x, X, Y, W, Hh, 10, 4411, 0.45, [60, 45, 25]);
      K.streaks(x, X, Y, W, Hh, 8, 4412, 0.35);
    });
    b.plate("art", 0, H + 2.9, Z0 - 0.2, 0, -1, 2.8, 2.8, dial, { off: 0.03 });
    b.geo("brass_old", K.torusGeo(), {
      x: 0,
      y: H + 2.9,
      z: Z0 - 0.27,
      s: 1.42,
      sz: 0.4,
      tint: [0.9, 0.8, 0.55],
    });
    b.beam(
      "black_iron",
      0,
      H + 2.9,
      Z0 - 0.3,
      -0.72,
      H + 3.02,
      Z0 - 0.3,
      0.09,
      0.03,
    ); // hour hand ≈ 9:47
    b.beam(
      "black_iron",
      0,
      H + 2.9,
      Z0 - 0.32,
      -0.26,
      H + 4.0,
      Z0 - 0.32,
      0.06,
      0.03,
    ); // minute hand at 47
    K.letters(b, 0, H + 1.05, Z0 - 0.23, 0, -1, 6.4, 0.9, "WHITEHALL", {
      fg: "#e8d49a",
      font: "Georgia, serif",
    });
    // consoles either side of the attic
    for (const e of [-1, 1]) {
      b.box("pressed", e * 4.8, H, Z0 + 0.4, 0.8, 1.6, 1.2, { tint: green });
      b.geo("pressed", K.sphereGeo(), {
        x: e * 4.8,
        y: H + 1.9,
        z: Z0 + 0.4,
        s: 0.35,
        tint: green,
      });
    }

    // iron-and-glass marquee over the entrance, hung on tie rods
    b.boxMM("ferry_green", -5.2, 7.0, Z0 - 3.2, 5.2, 7.25, Z0 - 0.35, {
      tint: green,
      faces: "nsewtb",
    });
    b.boxMM("glass", -5.0, 7.25, Z0 - 3.0, 5.0, 7.28, Z0 - 0.4, {
      tint: [0.4, 0.46, 0.42],
    });
    for (const e of [-4.8, -1.6, 1.6, 4.8])
      b.pipe("black_iron", e, 7.25, Z0 - 3.0, e, 9.9, Z0 - 0.3, 0.03, 4);
    const stageSign = K.signCell(
      "wh_stage",
      "WHITEHALL CARAVAN STAGE",
      1024,
      96,
      {
        bg: "#2a1e14",
        fg: "#f0c860",
        font: "Impact, Arial Black, sans-serif",
        border: "#c89a3a",
      },
    );
    b.plate("art", 0, 6.7, Z0 - 3.22, 0, -1, 9.6, 0.9, stageSign, {
      off: 0.01,
    });
    const neonTrade = K.neonCell(
      "wh_neon_trade",
      "TRADE · WATER · REST",
      512,
      96,
      { color: "#ffb040" },
    );
    b.plate("neon", 0, 7.65, Z0 - 3.25, 0, -1, 4.6, 0.85, neonTrade, {
      off: 0.02,
    });
    d.glow(0, 7.6, Z0 - 3.4, [0.9, 0.55, 0.15], 4);
    // hand-painted rules board beside the doors
    const rules = K.signCell(
      "wh_rules",
      "CARAVAN STAGE RULES\n\nNO GUNS DRAWN\nNO RUSH ON THE BOARDWALK\nOXEN HAVE RIGHT OF WAY\nPAY YOUR DOCKAGE\n\n— BIG BERTHA",
      256,
      320,
      {
        bg: "#e0d6bc",
        fg: "#3a1e14",
        font: "Georgia, serif",
        border: "#6a2a1a",
      },
    );
    b.plate("art", -3.3, 2.6, Z0 - 0.36, 0, -1, 1.1, 1.4, rules, { off: 0.02 });
    // wall lamps at the pilasters (gas-style)
    for (const x of [-3.6, 3.6, -10.8, 10.8]) {
      b.box("ferry_green", x, 4.6, Z0 - 0.55, 0.1, 0.5, 0.3);
      K.lamp(d, x, 4.4, Z0 - 0.8, "cage", [1, 0.72, 0.4], 0, 0, {
        ceil: 4.6,
        glowSize: 1.6,
        dead: x === -10.8,
      });
    }
    // graffiti & grime
    b.plate(
      "decal",
      13.2,
      2.4,
      Z0 - 0.34,
      0,
      -1,
      3.4,
      1.3,
      K.tag("SI NEVER", "#c83a2a", 256, 96),
      { off: 0.03 },
    );
    b.hplate("decal", -6, AY + 0.012, 6, 5, 4, 0.3, K.decal("grime", 2));
    b.hplate("decal", 7, AY + 0.012, 3, 6, 5, 1.1, K.decal("grime", 3));

    // ---- water facade (z = Z1, facing +z): slip portals 1-2-3 ----
    WH.SLIPS.forEach((x, i) => {
      const w = 7.2,
        hgt = 9.0;
      K.archWin(b, x, AY + 0.05, Z1, 0, 1, w, hgt, {
        state: "dark",
        surround: "pressed",
        surroundTint: green,
        frame: "ferry_green",
        fw: 0.4,
        depth: 0.35,
        keystone: true,
        sill: false,
        mullion: false,
      });
      // slip number cartouche
      const num = K.paint(
        "art",
        "ph2_wh_slipno" + (i + 1),
        128,
        128,
        (x2, X, Y, W, Hh) => {
          x2.fillStyle = "#e4dcc2";
          x2.beginPath();
          x2.ellipse(X + W / 2, Y + Hh / 2, W * 0.46, Hh * 0.46, 0, 0, 6.3);
          x2.fill();
          x2.strokeStyle = "#3c5a47";
          x2.lineWidth = 8;
          x2.stroke();
          x2.fillStyle = "#2a3a30";
          x2.font = "bold 76px Georgia, serif";
          x2.textAlign = "center";
          x2.textBaseline = "middle";
          x2.fillText(String(i + 1), X + W / 2, Y + Hh / 2 + 4);
          K.stains(x2, X, Y, W, Hh, 5, 440 + i, 0.4, [60, 45, 25]);
        },
      );
      b.plate("art", x, 10.55, Z1 + 0.4, 0, 1, 1.3, 1.3, num, { off: 0.02 });
      if (i === 1) {
        // rolling steel shutter jammed half-way down
        b.boxMM(
          "corrugated",
          x - 3.6,
          3.4,
          Z1 + 0.1,
          x + 3.6,
          5.9 + AY,
          Z1 + 0.2,
          { tint: [0.55, 0.5, 0.44] },
        );
        b.boxMM("rust", x - 3.7, 3.3, Z1 + 0.05, x + 3.7, 3.45, Z1 + 0.28, {
          tint: [0.6, 0.5, 0.4],
        });
        const closed = K.signCell(
          "wh_slip2",
          "SLIP 2 CLOSED\nAPRON DOWN",
          256,
          128,
          {
            bg: "#c8a030",
            fg: "#1a1a1a",
            font: "Impact, sans-serif",
            border: "#1a1a1a",
          },
        );
        b.plate("art", x, 2.3, Z1 + 0.25, 0, 1, 1.5, 0.75, closed, {
          off: 0.01,
        });
      }
      if (i === 2) {
        const r = K.rng("wh_boards");
        for (let k = 0; k < 9; k++) {
          const y = AY + 0.4 + k * 0.62;
          b.beam(
            "wood_rotten",
            x - 3.7,
            y + (r() - 0.5) * 0.3,
            Z1 + 0.25,
            x + 3.7,
            y + (r() - 0.5) * 0.3,
            Z1 + 0.25,
            0.3,
            0.05,
            { tint: [0.6, 0.52, 0.42] },
          );
        }
        b.plate(
          "decal",
          x,
          3.5,
          Z1 + 0.3,
          0,
          1,
          4.5,
          1.4,
          K.tag("FLOODED", "#e8e0c8", 256, 96),
          { off: 0.03 },
        );
      }
      if (i === 0) {
        const board = K.signCell(
          "wh_board",
          "BOARDING\nM/V MARGARET CORBIN\n~ THE SLACK TIDE ~",
          384,
          160,
          {
            bg: "#1c2a24",
            fg: "#f0dca0",
            font: "Georgia, serif",
            border: "#c8a040",
          },
        );
        b.plate("art", x - 3.9, 2.6, Z1 + 0.45, 0, 1, 1.6, 0.7, board, {
          off: 0.01,
        });
        K.lamp(d, x, 7.0, Z1 + 0.7, "cage", [1, 0.75, 0.45], 0, 0, {
          ceil: 7.3,
          glowSize: 1.8,
        });
      }
    });
    K.letters(b, 0, 11.85, Z1 + 0.45, 0, 1, 16, 0.8, "STATEN  ISLAND  FERRY", {
      fg: "#e8d49a",
      font: "Georgia, serif",
    });
    for (const x of [-6, 6]) {
      K.sash(b, x, 9.4, Z1, 0, 1, 1.4, 2.2, {
        state: "broken",
        frame: "ferry_green",
        surround: "pressed",
        surroundTint: grn,
        cols: 2,
        rows: 3,
        lintel: 0.2,
      });
    }
    for (const x of [-16.2, 16.2]) K.lifebuoy(b, x, 2.4, Z1 + 0.35, 0, 1);

    // ---- side facades (x = ±18): arched ground windows, sashes above, service doors ----
    for (const [xs, nx] of [
      [X0, -1],
      [X1, 1],
    ]) {
      [16, 22, 28].forEach((z, k) => {
        const st =
          (k + (nx > 0 ? 1 : 0)) % 3 === 0
            ? "boarded"
            : k === 1
              ? "lit"
              : "broken";
        if (k === 1 && nx < 0) {
          // service door
          b.boxMM(
            "ferry_green",
            xs - 0.12,
            FL,
            z - 0.8,
            xs - 0.02,
            FL + 2.6,
            z + 0.8,
            { tint: [0.6, 0.72, 0.6] },
          );
          const sd = K.signCell(
            "wh_service",
            "SERVICE\nNO ADMITTANCE",
            256,
            128,
            { bg: "#e0d8c0", fg: "#8a1a14", font: "Arial Black, sans-serif" },
          );
          b.plate("art", xs - 0.13, FL + 2.9, z, -1, 0, 0.9, 0.45, sd, {
            off: 0.01,
          });
        } else
          K.archWin(b, xs, FL + 0.8, z, nx, 0, 2.6, 4.6, {
            state: st,
            surround: "pressed",
            surroundTint: green,
            frame: "ferry_green",
            fw: 0.24,
            depth: 0.24,
            paneTint: st === "lit" ? [0.6, 0.42, 0.26] : undefined,
          });
        for (const e of [-1, 1])
          K.sash(b, xs, 9.3, z + e * 1.3, nx, 0, 1.3, 2.5, {
            state: (k + e) % 2 ? "glass" : "dark",
            frame: "ferry_green",
            surround: "pressed",
            surroundTint: grn,
            cols: 2,
            rows: 4,
            lintel: 0.2,
          });
      });
    }

    // ---- roof: clerestory monitor with a glazed band, patinated gable, vents, the burnt corner ----
    const MX0 = -13,
      MX1 = 13,
      MZ0 = 18,
      MZ1 = 26,
      MH = 3.2;
    b.boxMM("pressed", MX0, H, MZ0, MX1, H + 0.5, MZ1, { tint: green });
    for (const [z, nz] of [
      [MZ0, -1],
      [MZ1, 1],
    ]) {
      for (let x = MX0 + 0.8; x < MX1 - 0.5; x += 1.6) {
        const st = K.rng("mon" + x + z)() < 0.35 ? "broken" : "glass";
        b.quadN(
          st === "broken" ? "paint_black" : "glass",
          [x - 0.7, H + 0.55, z],
          [x + 0.7, H + 0.55, z],
          [x + 0.7, H + MH - 0.2, z],
          [x - 0.7, H + MH - 0.2, z],
          [0, 0, nz],
          {
            tint: st === "broken" ? [0.05, 0.05, 0.05] : [0.45, 0.5, 0.48],
            grime: 0.3,
          },
        );
        b.box("ferry_green", x + 0.8, H + 0.5, z, 0.12, MH - 0.5, 0.12, {
          tint: green,
        });
      }
      b.box("ferry_green", 0, H + MH - 0.2, z, MX1 - MX0, 0.2, 0.16, {
        tint: green,
      });
    }
    for (const x of [MX0, MX1])
      b.boxMM("pressed", x - 0.08, H + 0.5, MZ0, x + 0.08, H + MH, MZ1, {
        tint: green,
      });
    for (const s of [-1, 1])
      b.quadN(
        "rooftile",
        [MX0 - 0.3, H + MH, s < 0 ? MZ0 - 0.4 : MZ1 + 0.4],
        [MX1 + 0.3, H + MH, s < 0 ? MZ0 - 0.4 : MZ1 + 0.4],
        [MX1 + 0.3, H + MH + 1.6, 22],
        [MX0 - 0.3, H + MH + 1.6, 22],
        [0, 1, s * 0.6],
        { tint: [0.46, 0.62, 0.52] },
      );
    for (const x of [MX0 - 0.3, MX1 + 0.3])
      K.tri(
        b,
        "pressed",
        [x, H + MH, MZ0 - 0.4],
        [x, H + MH, MZ1 + 0.4],
        [x, H + MH + 1.6, 22],
        [Math.sign(x), 0, 0],
        { tint: green },
      );
    b.beam(
      "patina",
      MX0 - 0.3,
      H + MH + 1.62,
      22,
      MX1 + 0.3,
      H + MH + 1.62,
      22,
      0.2,
      0.2,
    );
    for (const x of [-16, -9, 9]) {
      b.cyl("metal_dark", x, H, 15.5, 0.3, 0.3, 1.4, 8);
      b.cyl("metal_dark", x, H + 1.4, 15.5, 0.5, 0.1, 0.4, 8);
    }
    b.burn(15, H, 28, 6, 0.8);
    b.boxMM("paint_black", 12.5, H - 0.02, 24.5, 17.5, H + 0.02, 30.5, {
      tint: [0.06, 0.05, 0.05],
    }); // burnt-through roof hole
    for (let k = 0; k < 6; k++)
      b.beam(
        "black_iron",
        12.5 + k,
        H,
        24.5,
        13 + k * 0.9,
        H - 1.8,
        30.5,
        0.18,
        0.12,
        { tint: [0.2, 0.18, 0.16] },
      ); // sagging rafters
    // corner water tank on its tower
    b.cyl("wood_rotten", -15, H + 2.5, 28, 1.3, 1.3, 2.4, 12, {
      tint: [0.6, 0.5, 0.4],
    });
    K.dome(b, "rust", -15, H + 4.9, 28, 1.35, 0.8, 0, 10, 3, false, {
      tint: [0.5, 0.42, 0.34],
    });
    for (const [dx, dz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      b.beam(
        "rust",
        -15 + dx * 0.9,
        H,
        28 + dz * 0.9,
        -15 + dx * 0.8,
        H + 2.5,
        28 + dz * 0.8,
        0.1,
        0.1,
      );

    // ---------------- slips: apron bridges + gantry towers ----------------
    WH.SLIPS.forEach((x, i) => {
      // lattice towers either side + head beam with sheaves & counterweights
      for (const e of [-1, 1]) {
        K.lattice(b, x + e * 4.7, 35.6, 1.6, 1.6, AY, 12.4, {
          mat: "rust",
          tint: [0.68, 0.52, 0.42],
        });
        b.cyl("rust", x + e * 4.7, AY + 12.4, 35.6, 0.9, 0.9, 0.25, 12, {
          tint: [0.5, 0.4, 0.34],
        });
        b.geo("rust", K.torusGeo(), {
          x: x + e * 4.7,
          y: AY + 12.2,
          z: 35.6,
          s: 0.75,
          sz: 0.3,
          ry: HP,
          tint: [0.5, 0.4, 0.32],
        });
        b.box(
          "concrete_dark",
          x + e * 4.7,
          AY + 6 + (i === 1 ? -3.5 : 0),
          35.6,
          0.9,
          1.8,
          0.9,
          { tint: [0.6, 0.58, 0.54] },
        ); // counterweight
        b.pipe(
          "black_iron",
          x + e * 4.7,
          AY + 7.8,
          35.6,
          x + e * 4.7,
          AY + 12.2,
          35.6,
          0.03,
          4,
        );
        b.pipe(
          "black_iron",
          x + e * 4.7 - e * 0.4,
          AY + 12.2,
          35.6,
          x + e * 3.2,
          AY + (i === 1 ? 0.2 : 1.6),
          37.8,
          0.03,
          4,
        );
      }
      b.beam(
        "rust",
        x - 5.5,
        AY + 12.6,
        35.6,
        x + 5.5,
        AY + 12.6,
        35.6,
        0.5,
        0.7,
        { tint: [0.62, 0.5, 0.4] },
      );
      if (i === 1) {
        // collapsed apron: tipped into the slip
        b.quadN(
          "planks_iron",
          [x - 3.2, AY - 0.1, Z1 + 3.5],
          [x + 3.2, AY - 0.1, Z1 + 3.5],
          [x + 3.3, -2.2, 38.8],
          [x - 3.1, -2.4, 38.8],
          [0, 1, 0.3],
          { tint: [0.6, 0.5, 0.42] },
        );
        for (const e of [-1, 1])
          b.beam(
            "rust",
            x + e * 3.2,
            AY + 0.3,
            Z1 + 3.5,
            x + e * 3.2,
            -2.3,
            38.8,
            0.2,
            0.5,
            { tint: [0.55, 0.45, 0.38] },
          );
        return;
      }
      // intact apron bridge: iron-strapped planks rising to the ferry deck (slip 1) or level (slip 3)
      const top = i === 0 ? WH.FERRY.deck + 0.5 : AY + 0.1;
      const n = i === 0 ? 7 : 1;
      for (let k = 0; k < n; k++) {
        const z0 = 34.5 + k * (2.6 / n),
          z1 = z0 + 2.6 / n,
          y = AY + ((top - AY) * (k + 1)) / n;
        b.boxMM("planks_iron", x - 3.3, y - 0.25, z0, x + 3.3, y, z1, {
          tint: [0.7, 0.6, 0.5],
          faces: "nsewt",
        });
        b.col(x - 3.3, y - 0.6, z0, x + 3.3, y, z1, {
          tag: "deck",
          surface: "metal",
        });
      }
      for (const e of [-1, 1]) {
        K.railing(b, x + e * 3.2, 34.5, x + e * 3.2, 37.1, top, {
          h: 1.0,
          mat: "rust",
          handMat: "rust",
        });
      }
    });

    // ---------------- ferries ----------------
    ferries(ctx, root, b);

    // ---------------- the caravan stage (detail builder) ----------------
    caravanStage(ctx, d);

    const main = K.finishXF(b, root);
    const det = K.finishXF(d, root);
    G.world.addLOD(det, 190, F.w(0, 0, 14));
    void main;
    G.scene.add(root);
    // anchors (world)
    ctx.anchors.door = F.w(0, FL + 1.3, Z0 - 0.4);
    // watchtower ladder (climb interactables, both ends)
    const T = WH.tower;
    ctx.interactables.push(
      G.world.addInteractable({
        pos: T.bottom,
        radius: 0.9,
        label: "Watchtower Ladder",
        verb: "Climb",
        priority: 1,
        onInteract: () =>
          G.fadeTransition(() =>
            G.player.teleport(T.upT.x, T.upT.y, T.upT.z, F.pyaw(0)),
          ),
      }),
    );
    ctx.interactables.push(
      G.world.addInteractable({
        pos: T.top,
        radius: 0.9,
        label: "Watchtower Ladder",
        verb: "Climb down",
        priority: 1,
        onInteract: () =>
          G.fadeTransition(() =>
            G.player.teleport(T.downT.x, T.downT.y, T.downT.z, F.pyaw(PI)),
          ),
      }),
    );
  }

  // ------------------------------------------------------------------
  // Ferries: MARGARET CORBIN (moored, slip 1) and a sister sunk in slip 3
  // ------------------------------------------------------------------
  function ferryModel(fb, o) {
    const L = WH.FERRY.len,
      B = WH.FERRY.beam,
      DK = WH.FERRY.deck;
    const hu = K.hull(fb, "hull_orange", {
      cx: 0,
      cz: 0,
      len: L,
      beam: B,
      deck: DK,
      keel: -3.4,
      sheer: 0.5,
      kind: "double",
      nu: 12,
      nv: 26,
      boot: -1.0,
      deckMat: "deck",
      rub: "rubber",
    });
    void hu;
    const or = [1, 1, 1],
      cr = [0.94, 0.9, 0.8];
    // cabin decks (main + saloon) with window bands
    const cabin = (y0, h, hw, z0, z1, winY, winH, nWin) => {
      fb.boxMM("hull_orange", -hw, y0, z0, hw, y0 + h, z1, {
        tint: or,
        faces: "nsewt",
      });
      for (const s of [-1, 1]) {
        for (let k = 0; k < nWin; k++) {
          const z = z0 + 0.8 + ((k + 0.5) * (z1 - z0 - 1.6)) / nWin,
            w = (z1 - z0 - 1.6) / nWin - 0.35;
          const broken = K.rng("fw" + y0 + k + s)() < 0.25;
          fb.quadN(
            broken ? "paint_black" : "glass",
            [s * (hw + 0.02), y0 + winY, z - w / 2],
            [s * (hw + 0.02), y0 + winY, z + w / 2],
            [s * (hw + 0.02), y0 + winY + winH, z + w / 2],
            [s * (hw + 0.02), y0 + winY + winH, z - w / 2],
            [s, 0, 0],
            {
              tint: broken ? [0.05, 0.05, 0.05] : [0.34, 0.4, 0.4],
              grime: 0.4,
            },
          );
          fb.box(
            "cream_paint",
            s * (hw + 0.03),
            y0 + winY - 0.08,
            z,
            0.06,
            0.08,
            w + 0.14,
            { tint: cr },
          );
          fb.box(
            "cream_paint",
            s * (hw + 0.03),
            y0 + winY + winH,
            z,
            0.06,
            0.08,
            w + 0.14,
            { tint: cr },
          );
        }
      }
      // end walls: windows + doors
      for (const e of [-1, 1]) {
        const z = e < 0 ? z0 : z1;
        for (let k = -1; k <= 1; k++)
          if (k !== 0)
            fb.quadN(
              "glass",
              [k * 1.6 - 0.6, y0 + winY, z + e * 0.02],
              [k * 1.6 + 0.6, y0 + winY, z + e * 0.02],
              [k * 1.6 + 0.6, y0 + winY + winH, z + e * 0.02],
              [k * 1.6 - 0.6, y0 + winY + winH, z + e * 0.02],
              [0, 0, e],
              { tint: [0.34, 0.4, 0.4] },
            );
        fb.quadN(
          "cream_paint",
          [-0.6, y0, z + e * 0.03],
          [0.6, y0, z + e * 0.03],
          [0.6, y0 + 2.05, z + e * 0.03],
          [-0.6, y0 + 2.05, z + e * 0.03],
          [0, 0, e],
          { tint: [0.8, 0.76, 0.66] },
        );
      }
    };
    cabin(DK, 2.8, B / 2 - 0.55, -12.5, 12.5, 0.95, 1.2, 12);
    cabin(DK + 2.8, 2.6, B / 2 - 0.75, -11, 11, 0.9, 1.1, 11);
    // deck overhangs (promenade roofs) + rails on the saloon-deck ends
    fb.boxMM(
      "cream_paint",
      -B / 2 + 0.3,
      DK + 2.8,
      -14,
      B / 2 - 0.3,
      DK + 3.0,
      14,
      { tint: [0.86, 0.82, 0.72], faces: "nsewtb" },
    );
    fb.boxMM(
      "cream_paint",
      -B / 2 + 0.5,
      DK + 5.4,
      -12.5,
      B / 2 - 0.5,
      DK + 5.6,
      12.5,
      { tint: [0.86, 0.82, 0.72], faces: "nsewtb" },
    );
    for (const e of [-1, 1]) {
      K.railing(fb, -B / 2 + 0.5, e * 12.3, B / 2 - 0.5, e * 12.3, DK + 5.6, {
        h: 1.0,
        mat: "cream_paint",
        handMat: "cream_paint",
        col: false,
      });
      for (const s of [-1, 1])
        K.railing(
          fb,
          s * (B / 2 - 0.45),
          e * 12.3,
          s * (B / 2 - 0.45),
          e * 5,
          DK + 5.6,
          { h: 1.0, mat: "cream_paint", handMat: "cream_paint", col: false },
        );
      // pilothouse at each end
      const pz = e * 9.5;
      fb.boxMM(
        "hull_orange",
        -1.7,
        DK + 5.6,
        pz - 1.3,
        1.7,
        DK + 7.9,
        pz + 1.3,
        { tint: or },
      );
      for (const s of [-1, 1])
        fb.quadN(
          "glass",
          [s * 1.72, DK + 6.6, pz - 1.1],
          [s * 1.72, DK + 6.6, pz + 1.1],
          [s * 1.72, DK + 7.6, pz + 1.1],
          [s * 1.72, DK + 7.6, pz - 1.1],
          [s, 0, 0],
          { tint: [0.3, 0.36, 0.36] },
        );
      fb.quadN(
        "glass",
        [-1.5, DK + 6.6, pz + e * 1.32],
        [1.5, DK + 6.6, pz + e * 1.32],
        [1.5, DK + 7.6, pz + e * 1.32],
        [-1.5, DK + 7.6, pz + e * 1.32],
        [0, 0, e],
        { tint: [0.3, 0.36, 0.36] },
      );
      fb.boxMM(
        "cream_paint",
        -2.0,
        DK + 7.9,
        pz - 1.6,
        2.0,
        DK + 8.1,
        pz + 1.6,
        { tint: [0.86, 0.82, 0.72], faces: "nsewtb" },
      );
      fb.cyl("chrome", 0, DK + 8.1, pz + e * 0.9, 0.18, 0.2, 0.3, 8); // searchlight
      // open car-deck end: bumper, chain gate, bollards
      fb.boxMM(
        "rubber",
        -3,
        DK + 0.1,
        e * 15.2 - 0.25,
        3,
        DK + 0.7,
        e * 15.2 + 0.25,
        { tint: [0.15, 0.15, 0.15] },
      );
      for (const s of [-1, 1]) K.bollard(fb, s * 2.8, DK + 0.25, e * 13.8);
      fb.pipe(
        "rust",
        -2.4,
        DK + 0.9,
        e * 13.2,
        2.4,
        DK + 0.75,
        e * 13.2,
        0.03,
        4,
      );
    }
    // funnel + mast + horn
    fb.geo("hull_orange", K.unitCyl(14), {
      x: 0,
      y: DK + 5.6 + 2.6,
      z: 0,
      sx: 1.1,
      sy: 5.2,
      sz: 1.6,
      tint: or,
    });
    fb.geo("paint_black", K.unitCyl(14), {
      x: 0,
      y: DK + 5.6 + 5.0,
      z: 0,
      sx: 1.13,
      sy: 0.9,
      sz: 1.63,
    });
    fb.pipe("rust", 0, DK + 5.6, 3.5, 0, DK + 12.5, 3.5, 0.12, 6);
    fb.beam("rust", -1.4, DK + 11.2, 3.5, 1.4, DK + 11.2, 3.5, 0.1, 0.1);
    fb.cyl("brass_old", 0.5, DK + 10.2, 3.5, 0.12, 0.25, 0.5, 8);
    // lifeboats on the saloon roof
    for (const s of [-1, 1]) {
      fb.geo("hull_orange", K.sphereGeo(), {
        x: s * 2.6,
        y: DK + 6.2,
        z: -4,
        sx: 0.8,
        sy: 0.5,
        sz: 2.8,
        tint: [1, 0.72, 0.4],
      });
      for (const zz of [-5.8, -2.2])
        fb.pipe("rust", s * 3.1, DK + 5.6, zz, s * 2.7, DK + 7.1, zz, 0.05, 4);
    }
    // rust bleeding under the scuppers
    for (let k = 0; k < 10; k++)
      fb.box(
        "rust",
        (k % 2 ? 1 : -1) * (B / 2 - 0.04),
        DK - 1.6,
        -13 + k * 2.9,
        0.04,
        1.4,
        0.35,
        { tint: [0.7, 0.4, 0.25] },
      );
    void o;
  }
  function ferries(ctx, root, b) {
    const FR = WH.FERRY;
    // shared ferry geometry (built once, placed twice)
    const fb = K.builder({ name: "wh_ferry", grime: 0.4 });
    ferryModel(fb);
    const proto = fb.finish(null);
    // (1) MARGARET CORBIN, moored in slip 1
    const f1 = new THREE.Group();
    f1.name = "ph2_ferry_corbin";
    f1.add(proto);
    f1.position.set(FR.cx, 0, FR.cz);
    f1.updateMatrix();
    // (2) her sister, sunk & listing in slip 3
    const f2 = new THREE.Group();
    f2.name = "ph2_ferry_sunk";
    for (const m of proto.children) f2.add(m.clone());
    f2.position.set(12.4, -2.3, 49.5);
    f2.rotation.set(0.05, 0.08, -0.24);
    f2.updateMatrix();
    // name boards (per ship): in each ferry's local coords
    const nb = K.builder({ name: "wh_ferry_names", grime: 0.1 });
    const name1 = K.paint(
      "art",
      "ph2_name_corbin",
      1024,
      96,
      (x, X, Y, W, Hh) => {
        x.clearRect(X, Y, W, Hh);
        x.fillStyle = "#f0e8d0";
        x.font = "bold 70px Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("MARGARET  CORBIN", X + W / 2, Y + Hh / 2 + 3);
        K.streaks(x, X, Y, W, Hh, 20, 451, 0.4);
      },
    );
    const name2 = K.paint(
      "art",
      "ph2_name_newark",
      1024,
      96,
      (x, X, Y, W, Hh) => {
        x.clearRect(X, Y, W, Hh);
        x.fillStyle = "#f0e8d0";
        x.font = "bold 70px Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("ADM. HENRY RICHMOND", X + W / 2, Y + Hh / 2 + 3);
        K.streaks(x, X, Y, W, Hh, 20, 452, 0.4);
      },
    );
    const sif = K.paint("art", "ph2_name_sif", 1024, 96, (x, X, Y, W, Hh) => {
      x.clearRect(X, Y, W, Hh);
      x.fillStyle = "#f0e8d0";
      x.font = "bold 64px Arial, sans-serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText("STATEN ISLAND FERRY", X + W / 2, Y + Hh / 2 + 3);
    });
    const names = (nm) => {
      const g = K.builder({ name: "wh_fn", grime: 0 });
      for (const s of [-1, 1]) {
        g.plate(
          "art",
          s * (FR.beam / 2 - 0.73),
          FR.deck + 4.95,
          0,
          s,
          0,
          9,
          0.85,
          nm,
          { off: 0.04 },
        );
        g.plate(
          "art",
          s * (FR.beam / 2 - 0.53),
          FR.deck + 2.25,
          0,
          s,
          0,
          11,
          0.9,
          sif,
          { off: 0.04 },
        );
      }
      return g.finish(null);
    };
    f1.add(names(name1));
    f2.add(names(name2));
    void nb;
    // colliders (local frame): moored ferry — hull + cabins solid, walkable end decks, top deck
    const cx = FR.cx,
      cz = FR.cz,
      L = FR.len,
      hb = FR.beam / 2;
    b.col(
      cx - hb,
      -4,
      cz - L / 2 + 1.4,
      cx + hb,
      FR.deck + 0.5,
      cz + L / 2 - 1.4,
      { tag: "ship", surface: "metal" },
    );
    b.col(
      cx - hb + 0.55,
      FR.deck,
      cz - 12.5,
      cx + hb - 0.55,
      FR.deck + 5.6,
      cz + 12.5,
      { tag: "ship", surface: "metal" },
    );
    // sunk ferry: blocking hull only (not walkable — the deck lists 14°)
    b.col(12.4 - hb, -4, 49.5 - L / 2 + 1, 12.4 + hb, 1.2, 49.5 + L / 2 - 1, {
      tag: "ship",
      surface: "metal",
      walkable: false,
    });
    // put both ferries into the frame (they are children of the rotated exterior root)
    const fg = new THREE.Group();
    fg.name = "ph2_wh_ferries";
    fg.add(f1);
    fg.add(f2);
    fg.position.set(F.px, 0, F.pz);
    fg.rotation.y = F.yaw;
    fg.updateMatrixWorld(true);
    root.add(fg);
    // oil slick & debris around the wreck
    b.hplate("decal", 12, -1.15, 44, 12, 14, 0.4, K.decal("puddle", 5));
    b.hplate("decal", 13, -1.15, 57, 9, 10, 1.4, K.decal("puddle", 6));
  }

  // ------------------------------------------------------------------
  // Caravan stage dressing on the apron (detail builder)
  // ------------------------------------------------------------------
  function caravanStage(ctx, d) {
    const { AY, Z0 } = WH;
    // ox pen (SW end): scrap fence on three sides, trough, hay, water barrel
    K.fence(d, -20.6, 1.2, -13.2, 1.2, AY, { h: 1.3, seed: 1 });
    K.fence(d, -13.2, 1.2, -13.2, 5.2, AY, { h: 1.3, seed: 2 });
    K.fence(d, -20.6, 1.2, -20.6, 9.2, AY, { h: 1.3, seed: 3 });
    K.fence(d, -20.6, 9.2, -15.5, 9.2, AY, { h: 1.3, seed: 4 });
    d.cyl("wood_rotten", -19.6, AY, 5.2, 0.45, 0.45, 0.5, 10, {
      tint: [0.55, 0.45, 0.35],
    }); // trough barrel half
    d.box("wood", -17.6, AY, 8.3, 2.2, 0.5, 0.7, { tint: [0.52, 0.42, 0.3] });
    for (let k = 0; k < 4; k++)
      d.box(
        "flat",
        -19.5 + (k % 2) * 1.05,
        AY + (k > 1 ? 0.5 : 0),
        2.3,
        1.0,
        0.5,
        0.6,
        { tint: [0.72, 0.62, 0.34], yaw: 0.05 * k },
      );
    d.hplate("decal", -16.8, AY + 0.012, 5, 7, 7.5, 0.2, K.decal("grime", 4));
    for (let k = 0; k < 16; k++) {
      const r = K.rng("hay" + k);
      d.box("flat", -20 + r() * 6.5, AY + 0.01, 1.8 + r() * 7, 0.6, 0.01, 0.1, {
        yaw: r() * 3,
        tint: [0.75, 0.66, 0.4],
      });
    }
    const penSign = K.signCell("wh_pen", "OX PEN\nFEED 2 SCRIP", 256, 128, {
      bg: "#5a3a24",
      fg: "#f0e0b0",
      font: "Georgia, serif",
    });
    d.plate("art", -16.9, AY + 1.25, 1.1, 0, -1, 1.1, 0.55, penSign, {
      off: 0.03,
    });
    // covered wagons
    K.wagon(d, -9.6, AY, 4.0, 0.35, { canvas: [0.8, 0.74, 0.6] });
    K.wagon(d, 10.8, AY, 5.4, -0.5, { canvas: [0.62, 0.52, 0.42] });
    K.crates(d, -7.6, AY, 6.8, 0.2, 3, { col: true });
    K.crates(d, 13.2, AY, 3.2, -0.4, 2, { col: true });
    // stalls in front of the outer arches
    K.stall(d, -14.3, AY, 10.4, 0, 3.4, 2.0, {
      tarp: "canvas_red",
      tarpTint: [0.62, 0.3, 0.22],
      sign: K.signCell("wh_stall_guns", "BRASS & POWDER", 256, 64, {
        bg: "#e0d0a8",
        fg: "#5a1a10",
        font: "Impact, sans-serif",
      }),
      items: ["box", "can", "box"],
      seed: 21,
    });
    K.stall(d, 14.3, AY, 10.4, 0, 3.4, 2.0, {
      tarp: "canvas_blue",
      tarpTint: [0.36, 0.44, 0.56],
      sign: K.signCell("wh_stall_food", "WATER · JERKY · BREAD", 256, 64, {
        bg: "#e0d8c0",
        fg: "#1a2a44",
        font: "Impact, sans-serif",
      }),
      items: ["jar", "bottle", "can"],
      seed: 22,
    });
    // campfire ring with log benches (the fire itself is a props campfire)
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      d.box(
        "concrete",
        4.6 + Math.cos(a) * 0.75,
        AY,
        5.2 + Math.sin(a) * 0.75,
        0.32,
        0.22,
        0.26,
        { yaw: a, tint: [0.55, 0.52, 0.48] },
      );
    }
    for (const [a, len] of [
      [0.3, 2.4],
      [2.0, 2.0],
      [3.8, 2.2],
    ]) {
      const x = 4.6 + Math.cos(a) * 2.3,
        z = 5.2 + Math.sin(a) * 2.3;
      d.geo("wood_rotten", K.unitCyl(8), {
        x,
        y: AY + 0.22,
        z,
        sx: 0.22,
        sy: len,
        sz: 0.22,
        rz: HP,
        ry: -a + HP,
        tint: [0.55, 0.45, 0.35],
      });
      d.ocol(x, z, len, 0.45, AY, AY + 0.45, -a + HP, {
        tag: "bench",
        surface: "wood",
      });
    }
    d.burn(4.6, AY, 5.2, 1.4, 0.8);
    // signpost
    d.cyl("wood_rotten", -3.2, AY, 1.4, 0.09, 0.08, 3.6, 6, {
      tint: [0.5, 0.42, 0.34],
    });
    const arrows = [
      ["BROOKLYN via BRIDGE", 0.5, "#e8dcb8"],
      ["BRONX  ↑  (2 DAYS)", -0.6, "#d8e0c8"],
      ["JERSEY — NO", 2.4, "#e0c0b0"],
      ["CAPITAL RUINS 230 MI", -2.1, "#e8e0c0"],
    ];
    arrows.forEach(([t, yaw, bg], k) => {
      const cell = K.signCell("wh_arrow" + k, t, 384, 64, {
        bg,
        fg: "#2a1a10",
        font: "Georgia, serif",
      });
      const c = Math.cos(yaw),
        s = Math.sin(yaw),
        y = AY + 3.2 - k * 0.42,
        cx = -3.2 + c * 0.75,
        cz = 1.4 - s * 0.75;
      d.box("wood", cx, y - 0.15, cz, 1.5, 0.3, 0.05, {
        yaw,
        tint: [0.7, 0.6, 0.45],
      });
      d.plate(
        "art",
        cx - s * 0.03,
        y,
        cz - c * 0.03,
        -s,
        -c,
        1.45,
        0.25,
        cell,
        { off: 0.0 },
      );
      d.plate("art", cx + s * 0.03, y, cz + c * 0.03, s, c, 1.45, 0.25, cell, {
        off: 0.0,
      });
    });
    // watchtower (NE corner): four legs, deck, sandbag parapet, corrugated roof, ladder
    const TX = 18.6,
      TZ = 1.2,
      TY = AY + 4.2;
    for (const [dx, dz] of [
      [-1.2, -1.2],
      [1.2, -1.2],
      [1.2, 1.2],
      [-1.2, 1.2],
    ])
      d.box("wood_rotten", TX + dx, AY, TZ + dz, 0.2, 4.2 + 2.4, 0.2, {
        tint: [0.52, 0.44, 0.36],
      });
    d.boxMM("deck", TX - 1.4, TY - 0.15, TZ - 1.4, TX + 1.4, TY, TZ + 1.4, {
      faces: "nsewtb",
    });
    d.col(TX - 1.4, TY - 0.3, TZ - 1.4, TX + 1.4, TY, TZ + 1.4, {
      tag: "deck",
      surface: "wood",
    });
    for (const [ax, az, bx, bz] of [
      [-1.3, -1.3, 1.3, -1.3],
      [1.3, -1.3, 1.3, 1.3],
      [-1.3, -1.3, -1.3, 1.3],
    ])
      K.sandbags(d, TX + ax, TZ + az, TX + bx, TZ + bz, TY, 0.9, {
        seed: 70 + ax * 3,
      });
    d.quadN(
      "corrugated",
      [TX - 1.7, TY + 2.5, TZ + 1.7],
      [TX + 1.7, TY + 2.5, TZ + 1.7],
      [TX + 1.7, TY + 2.2, TZ - 1.7],
      [TX - 1.7, TY + 2.2, TZ - 1.7],
      [0, 1, 0],
      { tint: [0.6, 0.5, 0.4] },
    );
    K.ladder(d, TX, TZ + 1.4, AY, TY, 0, 1, { mat: "wood_rotten", w: 0.6 });
    WH.tower = {
      bottom: F.w(TX, AY + 1.2, TZ + 1.8),
      top: F.w(TX, TY + 1.0, TZ + 1.0),
      upT: F.w(TX, TY + 0.05, TZ),
      downT: F.w(TX, AY + 0.05, TZ + 2.4),
    };
    K.lamp(d, TX + 1.2, TY + 1.9, TZ - 1.2, "cage", [1, 0.8, 0.5], 0, 0, {
      ceil: TY + 2.2,
      glowSize: 1.4,
    });
    // sandbag chicane at the land edge (the way in from the Battery promenade)
    // (the esplanade railing stands along the shore NE of local x ≈ 0.6; SW of it the promenade runs straight onto the deck)
    K.sandbags(d, -12.5, -0.6, -7.2, -0.6, AY, 1.0, { seed: 81 });
    K.sandbags(d, 1.4, -0.6, 7.0, -0.6, AY, 1.0, { seed: 82 });
    K.sandbags(d, 10.0, -0.6, 14.5, -0.6, AY, 1.0, { seed: 84 });
    K.sandbags(d, 1.4, -0.6, 1.4, 1.8, AY, 1.0, { seed: 83 });
    // boarding stiles over the esplanade railing (the settlers' way onto the apron): timber steps up, a landing
    // above the rail, steps down onto the deck — with hand rails and colliders
    for (const sx of WH.STILES || [8.5]) {
      const w = 2.4,
        top = 1.45;
      const steps = [
        [-3.9, 0.3],
        [-3.5, 0.6],
        [-3.1, 0.9],
        [-2.7, 1.2],
      ];
      for (const [z0, y] of steps) {
        d.boxMM(
          "planks_iron",
          sx - w / 2,
          y - 0.3,
          z0,
          sx + w / 2,
          y,
          z0 + 0.4,
          { tint: [0.62, 0.52, 0.42], faces: "nsewt" },
        );
        d.col(sx - w / 2, 0, z0, sx + w / 2, y, z0 + 0.4, {
          tag: "stairs",
          surface: "wood",
        });
      }
      d.boxMM(
        "planks_iron",
        sx - w / 2,
        top - 0.2,
        -2.3,
        sx + w / 2,
        top,
        0.1,
        { tint: [0.62, 0.52, 0.42], faces: "nsewtb" },
      );
      d.col(sx - w / 2, top - 0.25, -2.3, sx + w / 2, top, 0.1, {
        tag: "stairs",
        surface: "wood",
      });
      for (const [z0, y] of [
        [0.1, 1.15],
        [0.5, 0.85],
        [0.9, 0.55],
      ]) {
        d.boxMM(
          "planks_iron",
          sx - w / 2,
          y - 0.25,
          z0,
          sx + w / 2,
          y,
          z0 + 0.4,
          { tint: [0.62, 0.52, 0.42], faces: "nsewt" },
        );
        d.col(sx - w / 2, AY, z0, sx + w / 2, y, z0 + 0.4, {
          tag: "stairs",
          surface: "wood",
        });
      }
      for (const e of [-1, 1]) {
        const x = sx + e * (w / 2 - 0.05);
        for (const z of [-3.9, -2.3, 0.1, 1.3])
          d.box(
            "wood_rotten",
            x,
            0,
            z,
            0.12,
            z < -3 ? 1.2 : z > 1 ? 1.4 : top + 1.0,
            0.12,
            { tint: [0.5, 0.42, 0.34] },
          );
        d.beam("wood_rotten", x, 1.2, -3.9, x, top + 1.0, -2.3, 0.07, 0.07);
        d.beam(
          "wood_rotten",
          x,
          top + 1.0,
          -2.3,
          x,
          top + 1.0,
          0.1,
          0.07,
          0.07,
        );
        d.beam("wood_rotten", x, top + 1.0, 0.1, x, 1.4, 1.3, 0.07, 0.07);
      }
    }
    // light poles + string lights to the marquee
    const poles = [
      [-9, 0.8],
      [0, 0.4],
      [9, 0.8],
    ];
    for (const [x, z] of poles) {
      d.cyl("wood_rotten", x, AY, z, 0.1, 0.09, 4.4, 6, {
        tint: [0.5, 0.42, 0.34],
      });
    }
    K.stringLights(
      d,
      [
        [-20, AY + 3.2, 9.5],
        [-9, AY + 4.3, 0.8],
        [0, AY + 4.3, 0.4],
        [9, AY + 4.3, 0.8],
        [20, AY + 3.2, 9.5],
      ],
      { sag: 0.5, deadEvery: 7 },
    );
    K.stringLights(
      d,
      [
        [-9, AY + 4.3, 0.8],
        [-4.8, 7.1, Z0 - 3.1],
      ],
      { sag: 0.35 },
    );
    K.stringLights(
      d,
      [
        [9, AY + 4.3, 0.8],
        [4.8, 7.1, Z0 - 3.1],
      ],
      { sag: 0.35 },
    );
    // barrels, junk, a Fizzo machine by the doors
    for (const [x, z] of [
      [-5.8, 11.8],
      [5.8, 11.8],
      [16.5, 7.5],
    ]) {
      d.cyl("rust", x, AY, z, 0.3, 0.3, 0.9, 10, { tint: [0.55, 0.42, 0.32] });
      d.cyl("rust", x, AY + 0.9, z, 0.31, 0.31, 0.05, 10);
    }
    // caravan-guild chalkboard with today's departures
    const board = K.paint(
      "art",
      "ph2_wh_departures",
      512,
      256,
      (x, X, Y, W, Hh) => {
        x.fillStyle = "#23302a";
        x.fillRect(X, Y, W, Hh);
        x.strokeStyle = "#8a6a40";
        x.lineWidth = 12;
        x.strokeRect(X + 6, Y + 6, W - 12, Hh - 12);
        x.fillStyle = "rgba(235,235,220,0.9)";
        x.font = 'bold 30px "Comic Sans MS", cursive, sans-serif';
        x.textAlign = "left";
        const lines = [
          "DEPARTURES",
          "Crow's Hat Co. — Brooklyn — DAWN",
          "Two-Horn Traders — Bronx — ??",
          "Slate & Sons — Uptown — CANCELLED",
          "  (raiders on Broadway)",
          "Shellback season: WATCH THE PIERS",
        ];
        lines.forEach((l, i) => x.fillText(l, X + 26, Y + 44 + i * 36, W - 40));
        K.grain(x, X, Y, W, Hh, 20, 461);
      },
    );
    d.box("wood_rotten", 7.4, AY, 11.6, 1.8, 0.05, 0.05, {
      tint: [0.5, 0.4, 0.3],
    });
    for (const e of [-1, 1])
      d.beam(
        "wood_rotten",
        7.4 + e * 0.8,
        AY,
        11.3,
        7.4 + e * 0.8,
        AY + 2.1,
        11.7,
        0.07,
        0.07,
      );
    d.quadN(
      "art",
      [6.45, AY + 0.95, 11.72],
      [8.35, AY + 0.95, 11.72],
      [8.35, AY + 1.95, 11.52],
      [6.45, AY + 1.95, 11.52],
      [0, 0.2, -1],
      { rect: board, grime: 0 },
    );
    // tarps & bedrolls along the NE flank walk (caravaneers sleep out here in summer)
    for (let k = 0; k < 3; k++) {
      d.box("canvas_green", 19.6, AY, 15 + k * 4, 1.8, 0.12, 0.8, {
        yaw: HP + 0.1 * k,
        tint: [0.5, 0.56, 0.42],
      });
      d.box("fabric", 19.4, AY + 0.1, 14.3 + k * 4, 0.5, 0.2, 0.35, {
        tint: [0.7, 0.66, 0.56],
      });
    }
  }

  // ==================================================================
  // DATA: items, quest, dialogue
  // ==================================================================
  function data() {
    K.defineItem({
      id: "ph2_pump_governor",
      type: "misc",
      name: "Fireboat Pump Governor",
      weight: 3,
      value: 0,
      quest: true,
      tags: ["quest"],
      desc: "A brass centrifugal governor the size of a coffee can, stamped F.D.N.Y. MARINE DIV. — PATRICK DUGGAN. Salt-crusted, but the flyweights still spin.",
    });
    K.defineItem({
      id: "ph2_ferry_token",
      type: "misc",
      name: "Slack Tide Token",
      weight: 0,
      value: 15,
      tags: ["valuable"],
      desc: "A brass 1950s subway-style token with a ferry stamped on it. Tilly at the Slack Tide takes them for a drink. So does everyone else, at a discount.",
    });
    K.defineItem({
      id: "ph2_harbor_chowder",
      type: "aid",
      name: "Slack Tide Chowder",
      weight: 0.5,
      value: 12,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hp: 25, rads: 2 },
      desc: "Shellback, potato-ish tubers, powdered milk and a dash of something from a bottle with no label. Tilly's pride.",
    });
    K.defineItem({
      id: "ph2_ferry_grog",
      type: "aid",
      name: "Ferryman's Grog",
      weight: 0.5,
      value: 10,
      tags: ["drink", "alcohol"],
      mesh: "bottle_whiskey",
      sound: "drink",
      effects: { hp: 5, attrs: { brawn: 1, wits: -1 }, duration: 180 },
      desc: 'Rum cut with boiled harbour water and a Fizzo Cola "for colour." It is mostly colour.',
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ph2_slack_water",
        name: "Slack Water",
        giver: "Gus Bellamy",
        location: "Whitehall Ferry Terminal",
        desc: "The Margaret Corbin is taking on water faster than her hand pumps can move it. Gus Bellamy, the ferry's last engineer, needs a pump governor — and there is one on the sunken fireboat at Pier A.",
        stages: [
          {
            id: "fetch",
            text: "Salvage the pump governor from the sunken fireboat at Pier A.",
            markers: [
              () => {
                const a = PV.anchor("pier_a", "hatch");
                return a
                  ? { x: a.x, y: a.y, z: a.z, label: "Fireboat engine hatch" }
                  : null;
              },
            ],
          },
          {
            id: "return",
            text: "Bring the pump governor to Gus Bellamy aboard the Margaret Corbin.",
            markers: [{ npc: "ph2_gus", label: "Gus" }],
          },
        ],
        rewards: { xp: 250 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q,
      S = PV;
    G.dialogue.register("ph2_dlg_rosa", {
      start: () => (S.flag("wh_met_rosa") ? "again" : "hello"),
      nodes: {
        hello: {
          speaker: "Big Bertha Sorensen",
          onEnter: () => S.setFlag("wh_met_rosa", true),
          text: "[A broad woman in a patched duster, ledger under one arm, pencil behind her ear, pistol on her hip where everyone can see it.] Welcome to the Whitehall Caravan Stage. Every pack train between the Bronx and the bridges comes through my ferry house. You buying, selling, or looking for work?",
          responses: [
            { text: "Buying. Let's trade.", barter: true, end: true },
            { text: "What is this place?", next: "place" },
            { text: "Looking for work.", next: "work" },
            { text: "Just passing through.", end: true },
          ],
        },
        again: {
          speaker: "Big Bertha Sorensen",
          text: () =>
            q.done("ph2_slack_water")
              ? "The Corbin's pumps are running and Tilly's pouring again. You're good people. Mostly. What do you need?"
              : "Back again. Scrip talk, the rest walks. What'll it be?",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Any work?", next: "work" },
            { text: "Tell me about the caravans.", next: "routes" },
            { text: "Later, Bertha.", end: true },
          ],
        },
        place: {
          speaker: "Big Bertha Sorensen",
          text: "Staten Island Ferry, once upon a time. Thirty thousand people a day through those doors, five cents a head. Now it's oxen, scrap and folks who want to sleep somewhere with a roof and a guard. Water's on three sides — nobody sneaks up on Whitehall.",
          responses: [
            { text: "And the ferries?", next: "ferries" },
            { text: "Tell me about the caravans.", next: "routes" },
            { text: "Thanks.", end: true },
          ],
        },
        ferries: {
          speaker: "Big Bertha Sorensen",
          text: "The Corbin's still afloat in slip one — barely. Tilly runs a bar on her, the Slack Tide. Her sister, the Richmond, went down in slip three the winter before last. Gus keeps the Corbin breathing. Talk to him if you're handy.",
          responses: [{ text: "I'll look him up.", end: true }],
        },
        routes: {
          speaker: "Big Bertha Sorensen",
          text: "Crow's Hat runs Brooklyn over the bridge. Two-Horn Traders go north to the Bronx when the brutes let 'em. Nobody goes to Jersey. You want to ride along, you pay or you shoot — guards eat free.",
          responses: [{ text: "Good to know.", end: true }],
        },
        work: {
          speaker: "Big Bertha Sorensen",
          text: () =>
            q.active("ph2_slack_water") || q.done("ph2_slack_water")
              ? "Nothing I can't handle myself right now. Check the board by the doors — sometimes the caravans post jobs."
              : "Gus Bellamy — the Corbin's engineer — has been yelling about pumps all week. Go see him on the ferry before he sinks my best-paying bar.",
          responses: [{ text: "Will do.", end: true }],
        },
      },
    });
    G.dialogue.register("ph2_dlg_gus", {
      start: () => {
        if (q.done("ph2_slack_water")) return "after";
        if (q.active("ph2_slack_water"))
          return K.has("ph2_pump_governor") ? "got" : "wait";
        return "hello";
      },
      nodes: {
        hello: {
          speaker: "Gus Bellamy",
          text: "[A wiry old man up to his knees in bilge water, working a hand pump like it owes him money.] Don't just stand there dripping on my deck — oh, it's all wet anyway. Hear that? That's the Corbin drinking the harbour. Main bilge pump's fine. The governor on it isn't. Without one the pump runs away with itself and shakes the mounts loose.",
          responses: [
            {
              text: "Would a governor off the fireboat at Pier A do? I have one.",
              cond: () => K.has("ph2_pump_governor"),
              next: "got",
              action: () => K.q.start("ph2_slack_water"),
            },
            { text: "Where do I get a governor?", next: "where" },
            {
              text: "[Mechanics 50] Couldn't you machine a new one?",
              check: { skill: "mechanics", value: 50 },
              next: "machine",
              failNext: "machine_fail",
            },
            { text: "Good luck with that.", end: true },
          ],
        },
        where: {
          speaker: "Gus Bellamy",
          text: "Pier A. Fire Department kept their fireboat there — the PATRICK DUGGAN. She went down at her berth when the bombs fell, but her pumps were the same make as ours. Engine hatch is aft of the wheelhouse. Shellbacks nest on that pier, mind. Bring me that governor and there's scrip in it, and Tilly'll pour you free till I say stop.",
          responses: [
            {
              text: "I'll get it.",
              next: "yes",
              action: () => K.q.start("ph2_slack_water"),
            },
            { text: "Shellbacks? Pass.", end: true },
          ],
        },
        machine: {
          speaker: "Gus Bellamy",
          text: "Ha! You know your way around a lathe. Sure — with what? The lathe's under four feet of water in the engine room. No, we do it the honest way: steal one off a dead fireboat. Pier A.",
          responses: [
            {
              text: "Fine. Pier A.",
              next: "yes",
              action: () => K.q.start("ph2_slack_water"),
            },
          ],
        },
        machine_fail: {
          speaker: "Gus Bellamy",
          text: "Machine one? Out of what, harbour mud? No. There's one on the fireboat at Pier A.",
          responses: [
            {
              text: "I'll get it.",
              next: "yes",
              action: () => K.q.start("ph2_slack_water"),
            },
            { text: "Not my problem.", end: true },
          ],
        },
        yes: {
          speaker: "Gus Bellamy",
          onEnter: () => {
            if (K.has("ph2_pump_governor") && q.active("ph2_slack_water"))
              K.q.set("ph2_slack_water", "return");
          },
          text: "Good. Engine hatch, aft of the wheelhouse. Twelve bolts. Don't drop it in the drink. And don't get eaten — I'm too old to train another hero.",
          responses: [{ text: "On my way.", end: true }],
        },
        wait: {
          speaker: "Gus Bellamy",
          text: "[Pump, pump, pump.] Still here. Still pumping. Pier A, the fireboat, the governor. Anytime you like.",
          responses: [{ text: "Working on it.", end: true }],
        },
        got: {
          speaker: "Gus Bellamy",
          text: "[He stops pumping. He actually stops.] Is that — let me see it. Flyweights spin, springs are good, stamped DUGGAN... You beautiful lunatic. Give it here.",
          responses: [
            {
              text: "Here you go.",
              next: "install",
              action: () => {
                K.take("ph2_pump_governor", 1);
              },
            },
          ],
        },
        install: {
          speaker: "Gus Bellamy",
          text: "[Ten minutes of swearing later, somewhere below, a motor coughs, catches, and settles into a steady thrum. The water around your boots begins, very slowly, to go down.] Listen to her! Slack water at last. Here — scrip, and a pocketful of Tilly's tokens. Drinks are on the Corbin.",
          onEnter: () => {
            if (K.q.active("ph2_slack_water")) {
              S.setFlag("wh_pumps", true);
              K.scrip(150);
              K.give("ph2_ferry_token", 5);
              K.give("rally_tonic", 2);
              K.standing(20, "Saved the Margaret Corbin");
              K.q.complete("ph2_slack_water");
              PV.whPumps && PV.whPumps();
            }
          },
          responses: [{ text: "Glad to help.", end: true }],
        },
        after: {
          speaker: "Gus Bellamy",
          text: "Dry as a Civil Defense pamphlet down there now. Well — damp. Damp as a pamphlet. You ever need a boat fixed, you know where I am.",
          responses: [{ text: "Take care, Gus.", end: true }],
        },
      },
    });
    G.dialogue.register("ph2_dlg_tilly", {
      start: () => "hello",
      nodes: {
        hello: {
          speaker: "Tilly Ahn",
          text: () =>
            S.flag("wh_pumps")
              ? "[She slides a glass down the bar without being asked.] Hero of the bilge! First one's free. So's the second. The third, Gus pays for."
              : "Welcome aboard the Slack Tide, the only bar in New York that's actually sinking. Mind the puddles — they're load-bearing.",
          responses: [
            { text: "What are you pouring?", barter: true, end: true },
            { text: 'Why "Slack Tide"?', next: "name" },
            { text: "Heard any rumours?", next: "rumor" },
            { text: "See you.", end: true },
          ],
        },
        name: {
          speaker: "Tilly Ahn",
          text: "Slack tide's the moment between the ebb and the flood, when the water just... stops. Nobody's coming in, nobody's going out. Best time for a drink.",
          responses: [{ text: "I'll drink to that.", barter: true, end: true }],
        },
        rumor: {
          speaker: "Tilly Ahn",
          text: () =>
            [
              "Caravaneers say there's a market under the bridges in Brooklyn — the old Empire Stores. Hattie Szabo runs it with a scale she swears is honest. Nobody believes her.",
              "The clock on Pier A stopped at 9:47 the morning the bombs came. Somebody wound it once, years back. Rang all night. Shellbacks came from everywhere.",
              "There's a ferry out past the Statue that still sounds her horn some nights. Nobody's aboard. Nobody that answers, anyway.",
            ][Math.floor(Math.random() * 3)],
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN (newGame / loaded)
  // ==================================================================
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  function spawn(ctx) {
    const A = ctx.anchors,
      S = PV;
    const guns = K.stock(
      [
        ["ammo_10mm", 60],
        ["ammo_556", 40],
        ["ammo_12ga", 30],
        ["ammo_308", 20],
        ["10mm_pistol", 1],
        ["hunting_rifle", 1],
        ["combat_shotgun", 1],
        ["frag_grenade", 3],
      ],
      "merchant_arms",
      4,
    );
    const general = K.stock(
      [
        ["purified_water", 6],
        ["ox_meat", 4],
        ["rally_tonic", 3],
        ["prussian_blue", 2],
        ["scrap_metal", 10],
        ["duct_tape", 3],
      ],
      "merchant_general",
      4,
    );
    const bar = K.stock(
      [
        ["ph2_ferry_grog", 8],
        ["ph2_harbor_chowder", 6],
        ["beer", 6],
        ["whiskey", 2],
        ["fizzo_cola", 5],
        ["purified_water", 4],
        ["shellback_cakes", 4],
      ],
      "merchant_food",
      3,
    );
    const doc = K.stock(
      [
        ["rally_tonic", 6],
        ["prussian_blue", 4],
        ["iodine_tabs", 3],
        ["morphine_syrette", 2],
        ["bull_tabs", 1],
      ],
      "merchant_doctor",
      4,
    );
    if (A.rosa)
      PV.spawnActor(ctx, {
        id: "ph2_rosa",
        type: "human",
        gender: "f",
        outfit: "merchant",
        hair: "long",
        name: "Big Bertha Sorensen",
        faction: "settlers",
        level: 10,
        essential: true,
        pos: v(A.rosa),
        yaw: A.rosa.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.5,
        dialogue: "ph2_dlg_rosa",
        merchant: { scrip: 900, stock: general, restock: 2, priceMult: 1.0 },
        weapon: K.itemExists("10mm_pistol") ? "10mm_pistol" : undefined,
        barks: [
          "Scrip talks.",
          "Oxen have right of way!",
          "Dockage is due at sundown.",
          "Two-Horn's late again.",
        ],
      });
    if (A.brass)
      PV.spawnActor(ctx, {
        id: "ph2_brass",
        type: "human",
        gender: "m",
        outfit: "survivor",
        hair: "short",
        beard: "full",
        name: '"Brass" Kowalski',
        faction: "settlers",
        level: 8,
        pos: v(A.brass),
        yaw: A.brass.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.0,
        merchant: { scrip: 500, stock: guns, restock: 2, priceMult: 1.1 },
        barks: [
          "Brass, powder and lead. Pick two.",
          "No test-firing indoors!",
          "Ammo's cheaper than regret.",
        ],
      });
    if (A.doc)
      PV.spawnActor(ctx, {
        id: "ph2_doc",
        type: "human",
        gender: "m",
        outfit: "doctor",
        hair: "bald",
        name: "Doc Ferris",
        faction: "settlers",
        level: 7,
        pos: v(A.doc),
        yaw: A.doc.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.0,
        merchant: { scrip: 400, stock: doc, restock: 2, priceMult: 1.1 },
        barks: [
          "Stitches, tonic, sympathy. Two out of three are for sale.",
          "Boil your water.",
          "That's not a rash. That's a shellback bite.",
        ],
      });
    if (A.tilly)
      PV.spawnActor(ctx, {
        id: "ph2_tilly",
        type: "human",
        gender: "f",
        outfit: "settler",
        hair: "bun",
        name: "Tilly Ahn",
        faction: "settlers",
        level: 6,
        pos: v(A.tilly),
        yaw: A.tilly.yaw || 0,
        ai: "merchant",
        home: "here",
        homeR: 1.2,
        dialogue: "ph2_dlg_tilly",
        merchant: {
          scrip: 350,
          stock: bar,
          restock: 1,
          priceMult: S.flag("wh_pumps") ? 0.8 : 1.0,
        },
        barks: [
          "Mind the puddles.",
          "Last call is whenever the boat tips.",
          "Grog, chowder, or a bad decision?",
        ],
      });
    if (A.gus)
      PV.spawnActor(ctx, {
        id: "ph2_gus",
        type: "human",
        gender: "m",
        outfit: "settler",
        hair: "short",
        beard: "full",
        hairColor: 0xb0aca0,
        name: "Gus Bellamy",
        faction: "settlers",
        level: 6,
        essential: true,
        pos: v(A.gus),
        yaw: A.gus.yaw || 0,
        ai: "guard",
        home: "here",
        homeR: 1.2,
        dialogue: "ph2_dlg_gus",
        barks: S.flag("wh_pumps")
          ? [
              "Hear her hum!",
              "Dry as a sermon.",
              "Mind the governor, it's a DUGGAN.",
            ]
          : [
              "Pump. Pump. Pump.",
              "She's drinking the harbour again.",
              "Governor, governor, my kingdom for a governor.",
            ],
      });
    // caravan guards on the apron & tower (world anchors)
    const gw = K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
      gw2 = K.itemExists("10mm_pistol") ? "10mm_pistol" : undefined;
    [
      ["ph2_wh_guard1", "guard1", "Caravan Guard", gw],
      ["ph2_wh_guard2", "guard2", "Caravan Guard", gw2],
      ["ph2_wh_guard3", "guard3", "Tower Watch", gw],
    ].forEach(([id, an, name, w], i) => {
      const a = A[an];
      if (!a) return;
      PV.spawnActor(ctx, {
        id,
        type: "human",
        gender: i === 1 ? "f" : "m",
        outfit: i === 2 ? "combat_armor" : "leather_armor",
        hair: "short",
        name,
        faction: "settlers",
        level: 7,
        pos: v(a),
        yaw: a.yaw || 0,
        ai: i === 2 ? "static" : "guard",
        home: "here",
        homeR: i === 2 ? 0.5 : 4,
        weapon: w,
        barks: [
          "Keep it holstered on the boardwalk.",
          "Welcome to Whitehall.",
          "Shellbacks came up by Pier A last night.",
          "Bertha's in the waiting room.",
        ],
      });
    });
    // caravaneers resting on the waiting-room benches / at the campfire
    [
      ["ph2_wh_c1", "sit1", "Caravaneer", "m"],
      ["ph2_wh_c2", "sit2", "Caravaneer", "f"],
      ["ph2_wh_c3", "fire1", "Pack Driver", "m"],
    ].forEach(([id, an, name, g]) => {
      const a = A[an];
      if (!a) return;
      PV.spawnActor(ctx, {
        id,
        type: "human",
        gender: g,
        outfit: "survivor",
        hair: g === "f" ? "ponytail" : "short",
        name,
        faction: "settlers",
        level: 4,
        pos: v(a),
        yaw: a.yaw || 0,
        ai: "sit",
        home: "here",
        homeR: 0.4,
        barks: [
          "My feet hurt.",
          "Three days from the Bronx. Three.",
          "Ever see an ox swim? Don't.",
          "Bertha charges for air, I swear.",
        ],
      });
    });
    // the fare-bot (Patrolman) still at its ticket window
    if (A.farebot)
      PV.spawnActor(ctx, {
        id: "ph2_farebot",
        type: "patrolman",
        name: "Fare-Bot",
        faction: "settlers",
        level: 4,
        pos: v(A.farebot),
        yaw: A.farebot.yaw || 0,
        ai: "static",
        home: "here",
        homeR: 0.3,
        barks: [
          "Fare: five cents. Exact change, please.",
          "The next ferry to St. George departs in... [ERROR]",
          "Please stand clear of the closing doors.",
          "Thank you for riding the Staten Island Ferry.",
        ],
      });
    // pack oxen in the pen (ambient_life's pack ox, if present)
    K.safe("pack_ox", () => {
      if (
        G.isStub("ambient") ||
        !G.ambient ||
        typeof G.ambient.packOx !== "function" ||
        !A.pen
      )
        return;
      for (let i = 0; i < 2; i++) {
        const p = {
          x: A.pen.x + (i ? 1.4 : -1.2),
          y: WH.AY,
          z: A.pen.z + (i ? -1 : 1.1),
        };
        G.ambient.packOx({
          pos: p,
          yaw: i * 2,
          variant: i + 1,
          pack: i === 0,
          ai: "wander",
          name: i ? "Ox" : "Pack Ox",
          home: { x: A.pen.x, z: A.pen.z, r: 2.4 },
        });
      }
    });
  }

  PV.define({
    id: "whitehall_terminal",
    name: "Whitehall Ferry Terminal",
    interior: "whitehall_terminal",
    order: 10,
    build(ctx) {
      exterior(ctx);
      const { AY, Z0 } = WH;
      // world anchors on the apron (for NPCs / markers)
      const wa = (name, lx, ly, lz, lyaw) => {
        const p = F.w(lx, ly, lz);
        p.yaw = F.pyaw(lyaw || 0);
        ctx.anchors[name] = p;
        return p;
      };
      wa("guard1", -3, AY, 3, 0);
      wa("guard2", 8, AY, 9, PI);
      wa("guard3", 18.6, AY + 4.2, 1.2, 0);
      wa(
        "fire1",
        4.6 + Math.cos(2.0) * 2.3,
        AY + 0.45,
        5.2 + Math.sin(2.0) * 2.3,
        -2.0 - HP,
      );
      wa("pen", -16.9, AY, 5.2, 0);
      wa("rack1", -12, AY, 34.3, PI);
      WH.campfire = F.w(4.6, AY, 5.2);
      if (PV.whInterior) PV.whInterior(ctx);
      // props on the apron: campfire, burning barrels, Fizzo machine
      const wl = (type, lx, lz, lyaw, o) => {
        const p = F.w(lx, AY, lz);
        K.loot(
          ctx,
          type,
          p.x,
          p.y,
          p.z,
          F.pyaw(lyaw || 0),
          Object.assign({ world: true }, o || {}),
        );
      };
      wl("campfire", 4.6, 5.2, 0, { pot: true });
      wl("barrel", -5.8, 12.4, 0, { burning: true, container: false });
      wl("barrel", 16.2, 1.8, 0, { burning: true, container: false });
      wl("fizzo_machine", 2.8, Z0 - 0.6, PI);
      wl("crate", -18.4, 12.2, 0.3, { kind: "plain", loot: "crate" });
      wl("footlocker", 19.6, 13.6, -HP, { loot: "footlocker" });
    },
    data,
    spawn,
    update(dt, realDt, ctx) {
      if (PV.whUpdate) PV.whUpdate(dt, realDt, ctx);
    },
  });
})();
