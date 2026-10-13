// play-inline-422 03 — tint
// Lines 60-1172 of readable/play-inline-422.pretty.js (statement-aligned).
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
