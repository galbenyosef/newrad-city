// play-inline-337 03 — tint
// Lines 198-1058 of readable/play-inline-337.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "tam_ext", grime: 0.55 });
    const r = K.rng("tam_ext");
    const brick = [1.0, 0.9, 0.86],
      lime = [0.9, 0.86, 0.78],
      limeD = [0.78, 0.74, 0.66];
    const W = X1 - X0,
      D = Z1 - Z0;
    // --- body: rusticated limestone base + brick upper storeys ---
    const faces = [
      [X0, Z1, 1, 0, 0, W, 0, 1],
      [X1, Z1, 0, 0, -1, D, 1, 0],
      [X0, Z0, 0, 0, 1, D, -1, 0],
      [X1, Z0, -1, 0, 0, W, 0, -1],
    ];
    for (const [ox, oz, ux, uy, uz, len] of faces) {
      b.face("limestone", ox, 0, oz, ux, uy, uz, 0, 1, 0, len, BASE, {
        tint: lime,
      });
      b.face("flemish", ox, BASE, oz, ux, uy, uz, 0, 1, 0, len, ENT - BASE, {
        tint: brick,
      });
    }
    b.col(X0, 0, Z0, X1, BAL + 0.8, Z1, { tag: "building" });
    // rustication grooves on the base + water table
    for (const [ox, oz, ux, uz, len, nx, nz] of faces.map((f) => [
      f[0],
      f[1],
      f[2],
      f[4],
      f[5],
      f[6],
      f[7],
    ])) {
      for (let yy = 0.9; yy < BASE - 0.2; yy += 0.75)
        b.boxMM(
          "paint_black",
          Math.min(ox, ox + ux * len) - (nx < 0 ? 0.02 : 0),
          yy,
          Math.min(oz, oz + uz * len) - (nz < 0 ? 0.02 : 0),
          Math.max(ox, ox + ux * len) + (nx > 0 ? 0.02 : 0),
          yy + 0.05,
          Math.max(oz, oz + uz * len) + (nz > 0 ? 0.02 : 0),
          {
            tint: [0.35, 0.33, 0.3],
            faces: nx > 0 ? "e" : nx < 0 ? "w" : nz > 0 ? "s" : "n",
          },
        );
    }
    b.boxMM(
      "limestone",
      X0 - 0.25,
      BASE - 0.1,
      Z0 - 0.25,
      X1 + 0.25,
      BASE + 0.35,
      Z1 + 0.25,
      { tint: limeD, faces: "nsewt" },
    );
    b.boxMM("granite", X0 - 0.2, 0, Z0 - 0.2, X1 + 0.2, 0.7, Z1 + 0.2, {
      tint: [0.5, 0.48, 0.45],
      faces: "nsew",
    });
    // entablature (architrave + frieze + cornice), balustrade
    b.boxMM(
      "limestone",
      X0 - 0.15,
      ENT,
      Z0 - 0.15,
      X1 + 0.15,
      ENT + 1.1,
      Z1 + 0.15,
      { tint: lime, faces: "nsew" },
    );
    K.cornice(b, X0, Z1, X1, Z1, ENT + 1.1, 0, 1, {
      mat: "limestone",
      tint: lime,
      depth: 0.7,
      h: 0.6,
      brackets: 0.9,
    });
    K.cornice(b, X1, Z1, X1, Z0, ENT + 1.1, 1, 0, {
      mat: "limestone",
      tint: lime,
      depth: 0.7,
      h: 0.6,
      brackets: 0.9,
    });
    K.cornice(b, X0, Z0, X0, Z1, ENT + 1.1, -1, 0, {
      mat: "limestone",
      tint: lime,
      depth: 0.7,
      h: 0.6,
      brackets: 0.9,
    });
    K.cornice(b, X1, Z0, X0, Z0, ENT + 1.1, 0, -1, {
      mat: "limestone",
      tint: limeD,
      depth: 0.5,
      h: 0.6,
      brackets: 0,
    });
    const balus = (ax, az, bx, bz) => {
      const len = Math.hypot(bx - ax, bz - az),
        n = Math.floor(len / 0.32);
      b.beam("limestone", ax, BAL + 0.08, az, bx, BAL + 0.08, bz, 0.4, 0.16, {
        tint: lime,
      });
      b.beam("limestone", ax, BAL + 0.95, az, bx, BAL + 0.95, bz, 0.45, 0.14, {
        tint: lime,
      });
      for (let i = 0; i <= n; i++) {
        const t = i / n,
          x = ax + (bx - ax) * t,
          z = az + (bz - az) * t;
        if (i % 12 === 0)
          b.box("limestone", x, BAL, z, 0.45, 1.0, 0.45, { tint: lime });
        else {
          b.cyl("limestone", x, BAL + 0.16, z, 0.07, 0.11, 0.35, 6, {
            tint: lime,
          });
          b.cyl("limestone", x, BAL + 0.51, z, 0.11, 0.07, 0.36, 6, {
            tint: lime,
          });
        }
      }
    };
    b.boxMM("concrete_dark", X0, BAL - 0.4, Z0, X1, BAL, Z1, {
      tint: [0.4, 0.38, 0.36],
      faces: "t",
    });
    balus(X0 + 0.1, Z1 - 0.1, X1 - 12, Z1 - 0.1);
    balus(X1 - 0.1, Z1 - 0.1, X1 - 0.1, Z0 + 8);
    balus(X0 + 0.1, Z0 + 0.1, X0 + 0.1, Z1 - 0.1);
    balus(X0 + 0.1, Z0 + 0.1, X1 - 0.1, Z0 + 0.1);
    // --- the steep hipped slate roof, dormers, chimneys ---
    const e0x = X0 + 1.2,
      e1x = X1 - 1.2,
      e0z = Z0 + 1.2,
      e1z = Z1 - 1.2,
      hz = (e0z + e1z) / 2,
      rise = RIDGE - ROOF;
    const run = (e1z - e0z) / 2,
      r0x = e0x + run,
      r1x = e1x - run;
    b.quadN(
      "slate",
      [e0x, ROOF, e1z],
      [e1x, ROOF, e1z],
      [r1x, RIDGE, hz],
      [r0x, RIDGE, hz],
      [0, 0.6, 0.8],
      { tint: [0.8, 0.82, 0.86] },
    );
    b.quadN(
      "slate",
      [e1x, ROOF, e0z],
      [e0x, ROOF, e0z],
      [r0x, RIDGE, hz],
      [r1x, RIDGE, hz],
      [0, 0.6, -0.8],
      { tint: [0.75, 0.77, 0.8] },
    );
    b.quadN(
      "slate",
      [e0x, ROOF, e0z],
      [e0x, ROOF, e1z],
      [r0x, RIDGE, hz],
      [r0x, RIDGE, hz],
      [-0.8, 0.6, 0],
      { tint: [0.78, 0.8, 0.84] },
    );
    b.quadN(
      "slate",
      [e1x, ROOF, e1z],
      [e1x, ROOF, e0z],
      [r1x, RIDGE, hz],
      [r1x, RIDGE, hz],
      [0.8, 0.6, 0],
      { tint: [0.78, 0.8, 0.84] },
    );
    b.beam("copper", r0x, RIDGE + 0.05, hz, r1x, RIDGE + 0.05, hz, 0.25, 0.18, {
      tint: [0.35, 0.58, 0.48],
    });
    for (const [ax, az] of [
      [e0x, e0z],
      [e0x, e1z],
      [e1x, e0z],
      [e1x, e1z],
    ])
      b.beam(
        "copper",
        ax,
        ROOF,
        az,
        ax < 240 ? r0x : r1x,
        RIDGE,
        hz,
        0.2,
        0.15,
        { tint: [0.35, 0.58, 0.48] },
      );
    b.col(e0x, ROOF - 0.6, e0z, e1x, ROOF + 2.5, e1z, { tag: "roof" });
    const slopeY = (dz) => ROOF + rise * (1 - dz / run); // height at distance dz from the ridge line
    for (const dx of [222, 232, 248, 258])
      for (const side of [1, -1]) {
        const fz = side > 0 ? e1z - 1.4 : e0z + 1.4; // dormer front
        const y0 = slopeY(Math.abs(fz - hz)) - 0.2,
          bz = fz - side * 2.6;
        b.boxMM(
          "paint_white",
          dx - 0.95,
          y0,
          Math.min(fz, bz),
          dx + 0.95,
          y0 + 1.9,
          Math.max(fz, bz),
          { tint: [0.75, 0.72, 0.66], faces: side > 0 ? "sewt" : "newt" },
        );
        K.sash(b, dx, y0 + 0.3, fz, 0, side, 0.9, 1.2, {
          state: r() < 0.5 ? "dark" : "broken",
          cols: 2,
          rows: 2,
          surround: "paint_white",
          surroundTint: [0.8, 0.78, 0.72],
          lintel: 0.1,
        });
        b.quadN(
          "slate",
          [dx - 1.1, y0 + 1.9, fz + side * 0.1],
          [dx, y0 + 2.6, fz + side * 0.1],
          [dx, y0 + 2.6, bz],
          [dx - 1.1, y0 + 1.9, bz],
          [-0.6, 0.8, 0],
          { tint: [0.7, 0.72, 0.76] },
        );
        b.quadN(
          "slate",
          [dx + 1.1, y0 + 1.9, fz + side * 0.1],
          [dx, y0 + 2.6, fz + side * 0.1],
          [dx, y0 + 2.6, bz],
          [dx + 1.1, y0 + 1.9, bz],
          [0.6, 0.8, 0],
          { tint: [0.7, 0.72, 0.76] },
        );
        b.quadN(
          "paint_white",
          [dx - 0.95, y0 + 1.9, fz],
          [dx + 0.95, y0 + 1.9, fz],
          [dx, y0 + 2.55, fz],
          [dx, y0 + 2.55, fz],
          [0, 0, side],
          { tint: [0.75, 0.72, 0.66] },
        );
      }
    for (const [cx, cz] of [
      [228, 279.5],
      [252, 279.5],
      [228, 295.5],
      [252, 295.5],
    ]) {
      b.boxMM(
        "flemish",
        cx - 0.8,
        ROOF,
        cz - 0.5,
        cx + 0.8,
        RIDGE + 1.6,
        cz + 0.5,
        { tint: brick },
      );
      b.boxMM(
        "limestone",
        cx - 0.9,
        RIDGE + 1.6,
        cz - 0.6,
        cx + 0.9,
        RIDGE + 1.8,
        cz + 0.6,
        { tint: lime },
      );
      for (const s of [-0.4, 0.4])
        b.cyl("rust", cx + s, RIDGE + 1.8, cz, 0.12, 0.12, 0.5, 6);
    }
    // collapsed north-east roof corner
    b.quadN(
      "paint_black",
      [e1x - 9, ROOF + 0.3, e0z + 0.5],
      [e1x - 1, ROOF + 0.3, e0z + 0.5],
      [e1x - 3, ROOF + 2.4, e0z + 5],
      [e1x - 8, ROOF + 2.6, e0z + 5],
      [0, 0.6, -0.8],
      { tint: [0.04, 0.04, 0.04] },
    );
    for (let k = 0; k < 5; k++)
      b.beam(
        "rust",
        e1x - 8.5 + k * 1.7,
        ROOF + 0.2,
        e0z + 0.4,
        e1x - 8 + k * 1.5,
        ROOF + 2.2 + r(),
        e0z + 4.5,
        0.15,
        0.22,
      );
    b.burn(X1 - 5, RIDGE - 3, Z0 + 3, 6, 0.8);

    // --- south façade (14th Street): 11 bays, central pavilion with pilasters ---
    const NB = 11,
      BW = W / NB;
    for (let k = 0; k < NB; k++) {
      const x = X0 + BW * (k + 0.5);
      K.archWin(b, x, 1.1, Z1, 0, 1, 1.8, 3.2, {
        state: r() < 0.4 ? "boarded" : "dark",
        surround: "limestone",
        surroundTint: lime,
        fw: 0.2,
        keystone: true,
      });
      K.sash(b, x, BASE + 1.0, Z1, 0, 1, 1.7, 3.6, {
        state: r() < 0.25 ? "broken" : r() < 0.6 ? "dark" : "boarded",
        cols: 3,
        rows: 4,
        lintel: 0.4,
      });
      K.sash(b, x, BASE + 6.3, Z1, 0, 1, 1.5, 2.5, {
        state: r() < 0.3 ? "broken" : "dark",
        cols: 3,
        rows: 3,
        lintel: 0.3,
      });
      // stone balconette under the tall windows
      if (k >= 4 && k <= 6) {
        b.boxMM(
          "limestone",
          x - 1.1,
          BASE + 0.75,
          Z1,
          x + 1.1,
          BASE + 0.9,
          Z1 + 0.5,
          { tint: lime },
        );
        for (let i = 0; i < 7; i++)
          b.cyl(
            "limestone",
            x - 0.9 + i * 0.3,
            BASE + 0.9,
            Z1 + 0.4,
            0.05,
            0.05,
            0.5,
            5,
            { tint: lime },
          );
        b.beam(
          "limestone",
          x - 1.1,
          BASE + 1.45,
          Z1 + 0.4,
          x + 1.1,
          BASE + 1.45,
          Z1 + 0.4,
          0.12,
          0.1,
          { tint: lime },
        );
      }
    }
    for (const px of [X0 + BW * 4, X0 + BW * 7, X0 + 0.5, X1 - 0.5])
      K.pilaster(b, px, BASE + 0.35, Z1, 0, 1, 0.8, ENT - BASE - 0.35, {
        mat: "limestone",
        tint: lime,
        depth: 0.25,
      });
    K.letters(
      b,
      (X0 + X1) / 2,
      ENT + 0.55,
      Z1 + 0.16,
      0,
      1,
      26,
      0.8,
      "SOCIETY OF TAMMANY · COLUMBIAN ORDER · MDCCLXXXIX",
      { fg: "#5a5248", size: 0.62, shadow: false },
    );
    // coal chute hatch on the sidewalk (east end)
    b.boxMM(
      "metal_dark",
      CHUTE.x - 0.8,
      0.01,
      Z1 + 0.3,
      CHUTE.x + 0.8,
      0.9,
      Z1 + 1.4,
      { tint: [0.3, 0.28, 0.26], faces: "sewt" },
    );
    b.quad(
      "rust",
      [CHUTE.x - 0.8, 0.9, Z1 + 1.4],
      [CHUTE.x + 0.8, 0.9, Z1 + 1.4],
      [CHUTE.x + 0.8, 0.95, Z1 + 0.3],
      [CHUTE.x - 0.8, 0.95, Z1 + 0.3],
      {},
    );
    b.plate(
      "decal",
      CHUTE.x,
      1.6,
      Z1 + 0.02,
      0,
      1,
      1.8,
      0.6,
      K.tag("COAL", "#e8e8e0", 192, 72, { rot: 0 }),
    );
    b.col(CHUTE.x - 0.8, 0, Z1, CHUTE.x + 0.8, 0.95, Z1 + 1.4, {});
    // --- north & east façades (plainer) ---
    for (let k = 0; k < NB; k++) {
      const x = X0 + BW * (k + 0.5);
      K.sash(b, x, BASE + 1.0, Z0, 0, -1, 1.7, 3.6, {
        state: r() < 0.5 ? "boarded" : "dark",
        cols: 3,
        rows: 4,
      });
      K.sash(b, x, BASE + 6.3, Z0, 0, -1, 1.5, 2.5, {
        state: "dark",
        cols: 3,
        rows: 3,
      });
      K.archWin(b, x, 1.1, Z0, 0, -1, 1.6, 3.0, {
        state: "boarded",
        surround: "limestone",
        surroundTint: lime,
        fw: 0.18,
      });
    }
    for (let k = 0; k < 5; k++) {
      const z = Z0 + (D / 5) * (k + 0.5);
      K.sash(b, X1, BASE + 1.0, z, 1, 0, 1.7, 3.6, {
        state: r() < 0.4 ? "broken" : "dark",
        cols: 3,
        rows: 4,
      });
      K.sash(b, X1, BASE + 6.3, z, 1, 0, 1.5, 2.5, {
        state: "dark",
        cols: 3,
        rows: 3,
      });
      K.archWin(b, X1, 1.1, z, 1, 0, 1.6, 3.0, {
        state: "boarded",
        surround: "limestone",
        surroundTint: lime,
        fw: 0.18,
      });
    }

    // --- WEST FAÇADE & THE PORTICO (Union Square) ---
    // side bays of the west front
    for (const z of [276.5, 298.5]) {
      K.sash(b, X0, BASE + 1.0, z, -1, 0, 1.7, 3.6, {
        state: "dark",
        cols: 3,
        rows: 4,
        lintel: 0.4,
      });
      K.sash(b, X0, BASE + 6.3, z, -1, 0, 1.5, 2.5, {
        state: "broken",
        cols: 3,
        rows: 3,
      });
      K.archWin(b, X0, 1.1, z, -1, 0, 1.8, 3.2, {
        state: "boarded",
        surround: "limestone",
        surroundTint: lime,
        fw: 0.2,
      });
    }
    // behind the columns: three arched doorways, three tall windows, three square windows
    for (const z of [283.5, DOOR_Z, 291.5]) {
      K.archWin(b, X0, 0.9, z, -1, 0, 2.2, 3.8, {
        state: z === DOOR_Z ? "lit" : "dark",
        paneTint: z === DOOR_Z ? [0.55, 0.3, 0.12] : undefined,
        surround: "limestone",
        surroundTint: lime,
        fw: 0.28,
        mullion: z !== DOOR_Z,
      });
      K.sash(b, X0, BASE + 1.0, z, -1, 0, 1.9, 4.0, {
        state: r() < 0.5 ? "dark" : "broken",
        cols: 3,
        rows: 4,
        lintel: 0.45,
      });
      K.sash(b, X0, BASE + 6.6, z, -1, 0, 1.6, 2.3, {
        state: "dark",
        cols: 3,
        rows: 3,
      });
    }
    // the door itself: studded double doors, raider-reinforced
    b.boxMM(
      "wood_dark",
      X0 - 0.12,
      0.9,
      DOOR_Z - 1.0,
      X0 - 0.02,
      3.6,
      DOOR_Z + 1.0,
      { tint: [0.28, 0.16, 0.1] },
    );
    for (let k = 0; k < 4; k++)
      b.boxMM(
        "rust",
        X0 - 0.16,
        1.2 + k * 0.7,
        DOOR_Z - 1.05,
        X0 - 0.12,
        1.35 + k * 0.7,
        DOOR_Z + 1.05,
        {},
      );
    // podium, steps, four colossal Ionic columns, entablature, pediment
    b.boxMM("limestone", PX - 0.4, 0, PZ0, X0, 0.9, PZ1, { tint: limeD });
    for (let i = 0; i < 4; i++)
      b.boxMM(
        "granite",
        PX - 0.4 - (i + 1) * 0.42,
        0,
        PZ0 + 1 + i * 0.1,
        PX - 0.4 - i * 0.42,
        0.9 - i * 0.225,
        PZ1 - 1 - i * 0.1,
        { tint: [0.6, 0.58, 0.54] },
      );
    b.col(PX - 0.4, 0, PZ0, X0, 0.9, PZ1, { tag: "steps" });
    for (let i = 0; i < 4; i++)
      b.col(
        PX - 0.4 - (i + 1) * 0.42,
        0,
        PZ0 + 1,
        PX - 0.4 - i * 0.42,
        0.9 - i * 0.225,
        PZ1 - 1,
        { tag: "steps" },
      );
    const colZ = [281.4, 285.8, 289.2, 293.6];
    for (const z of colZ) {
      K.column(b, PX + 0.55, 0.9, z, 0.55, ENT - 0.9, {
        kind: "ionic",
        mat: "limestone",
        tint: lime,
      });
      b.col(PX, 0.9, z - 0.6, PX + 1.1, ENT, z + 0.6, {
        tag: "column",
        walkable: false,
      });
    }
    for (const z of [PZ0 + 0.1, PZ1 - 0.1])
      K.pilaster(b, X0, 0.9, z, -1, 0, 1.0, ENT - 0.9, {
        mat: "limestone",
        tint: lime,
        depth: 0.3,
      });
    b.boxMM("limestone", PX - 0.2, ENT, PZ0, X0, ENT + 1.2, PZ1, {
      tint: lime,
    });
    b.boxMM("limestone", PX - 0.2, ENT - 0.1, PZ0, X0, ENT, PZ1, {
      tint: limeD,
      faces: "b",
    });
    K.letters(
      b,
      PX - 0.21,
      ENT + 0.6,
      (PZ0 + PZ1) / 2,
      -1,
      0,
      12.5,
      0.95,
      "TAMMANY HALL",
      { fg: "#3a342c", size: 0.78, shadow: false, weather: true },
    );
    K.cornice(b, PX - 0.2, PZ1, PX - 0.2, PZ0, ENT + 1.2, -1, 0, {
      mat: "limestone",
      tint: lime,
      depth: 0.6,
      h: 0.5,
      brackets: 0.8,
    });
    // pediment (with the Braves' tiger painted in the tympanum)
    const PY = ENT + 1.7,
      PT = PY + 3.0;
    b.quadN(
      "limestone",
      [PX - 0.3, PY, PZ0 - 0.2],
      [PX - 0.3, PY, PZ1 + 0.2],
      [PX - 0.3, PT, (PZ0 + PZ1) / 2],
      [PX - 0.3, PT, (PZ0 + PZ1) / 2],
      [-1, 0, 0],
      { tint: lime },
    );
    b.quadN(
      "art",
      [PX - 0.35, PY + 0.2, 285.5],
      [PX - 0.35, PY + 0.2, 289.5],
      [PX - 0.35, PY + 2.6, 289.5],
      [PX - 0.35, PY + 2.6, 285.5],
      [-1, 0, 0],
      { rect: tigerCell(), tint: [0.9, 0.9, 0.9], grime: 0.2 },
    );
    b.beam(
      "limestone",
      PX - 0.5,
      PY + 0.05,
      PZ0 - 0.4,
      PX - 0.5,
      PT + 0.05,
      (PZ0 + PZ1) / 2,
      0.3,
      0.4,
      { tint: lime },
    );
    b.beam(
      "limestone",
      PX - 0.5,
      PY + 0.05,
      PZ1 + 0.4,
      PX - 0.5,
      PT + 0.05,
      (PZ0 + PZ1) / 2,
      0.3,
      0.4,
      { tint: lime },
    );
    b.quadN(
      "slate",
      [PX - 0.3, PY, PZ0 - 0.2],
      [PX - 0.3, PT, (PZ0 + PZ1) / 2],
      [X0 + 1.5, PT, (PZ0 + PZ1) / 2],
      [X0 + 1.5, PY, PZ0 - 0.2],
      [0, 0.9, -0.4],
      { tint: [0.7, 0.72, 0.76] },
    );
    b.quadN(
      "slate",
      [PX - 0.3, PT, (PZ0 + PZ1) / 2],
      [PX - 0.3, PY, PZ1 + 0.2],
      [X0 + 1.5, PY, PZ1 + 0.2],
      [X0 + 1.5, PT, (PZ0 + PZ1) / 2],
      [0, 0.9, 0.4],
      { tint: [0.7, 0.72, 0.76] },
    );
    K.letters(b, X0, 3.9 + 0.9, DOOR_Z, -1, 0, 1.9, 0.3, "44", {
      fg: "#d8c890",
      size: 0.8,
    });

    // --- raider dressing: banners, bunting, tiger, barricade, searchlight ---
    const ban1 = voteBanner(
      "tam_ban1",
      "RE-ELECT BOSS CROKE",
      "HE GETS THINGS DONE — 19 TERMS & COUNTING",
    );
    const ban2 = voteBanner(
      "tam_ban2",
      "VOTE EARLY · VOTE OFTEN",
      "the Fourth Ward thanks you for your support",
    );
    // banner between the middle columns
    b.quadN(
      "art",
      [PX + 0.2, 7.0, colZ[1] + 0.5],
      [PX + 0.2, 7.0, colZ[2] - 0.5],
      [PX + 0.2, 13.2, colZ[2] - 0.5],
      [PX + 0.2, 13.2, colZ[1] + 0.5],
      [-1, 0, 0],
      { rect: tigerCell(), tint: [0.9, 0.9, 0.9], grime: 0.2 },
    );
    b.quadN(
      "art",
      [X0 - 0.05, 12.2, 297.5],
      [X0 - 0.05, 12.2, 301.2],
      [X0 - 0.05, 13.4, 301.2],
      [X0 - 0.05, 13.4, 297.5],
      [-1, 0, 0],
      { rect: ban2, tint: [0.85, 0.85, 0.85] },
    );
    b.quadN(
      "art",
      [X0 + 16, 12.0, Z1 + 0.25],
      [X0 + 30, 12.0, Z1 + 0.25],
      [X0 + 30, 15.3, Z1 + 0.25],
      [X0 + 16, 15.3, Z1 + 0.25],
      [0, 0, 1],
      { rect: ban1, tint: [0.9, 0.9, 0.9] },
    );
    for (const bx of [X0 + 16, X0 + 30])
      b.pipe("rust", bx, 12, Z1 + 0.3, bx, 15.3, Z1 + 0.3, 0.03, 4);
    // tattered bunting swags along the south balustrade
    for (let k = 0; k < 10; k++) {
      const xa = X0 + 3 + k * 5,
        xb = xa + 5,
        cols = [
          [0.6, 0.15, 0.12],
          [0.85, 0.82, 0.74],
          [0.16, 0.22, 0.4],
        ];
      for (let s = 0; s < 3; s++) {
        const y = BAL - 0.3 - s * 0.25;
        b.quadN(
          "fabric",
          [xa, y, Z1 + 0.45],
          [xb, y, Z1 + 0.45],
          [xb - 1.2, y - 0.7, Z1 + 0.5],
          [xa + 1.2, y - 0.7, Z1 + 0.5],
          [0, 0, 1],
          { tint: cols[s], grime: 0.3 },
        );
      }
    }
    // graffiti
    b.plate(
      "decal",
      X0 + 8,
      2.0,
      Z1 + 0.03,
      0,
      1,
      5,
      1.2,
      K.tag("BRAVES TURF", "#e04030", 384, 96),
    );
    b.plate(
      "decal",
      X0 + 36,
      2.3,
      Z1 + 0.03,
      0,
      1,
      5.5,
      1.1,
      K.tag("VOTE EARLY VOTE OFTEN", "#f0e040", 512, 96, { rot: 0.03 }),
    );
    b.plate(
      "decal",
      X0 - 0.03,
      2.6,
      277,
      -1,
      0,
      3.5,
      1.0,
      K.tag("NO VOTE NO LIFE", "#e8e8e0", 384, 96),
    );
    // scrap barricade across the portico steps, with a gate gap at the door
    for (let z = PZ0 - 4; z < PZ1 + 4; z += 1.5) {
      if (Math.abs(z + 0.75 - DOOR_Z) < 1.8) continue;
      const h = 1.8 + r() * 0.8;
      b.box(
        r() < 0.5 ? "corrugated" : "rust",
        205.2,
        0,
        z + 0.75,
        0.12,
        h,
        1.55,
        {
          yaw: (r() - 0.5) * 0.1,
          tint: r.pick([
            [0.65, 0.55, 0.45],
            [0.5, 0.45, 0.4],
            [0.6, 0.3, 0.22],
          ]),
        },
      );
      if (r() < 0.4) {
        b.pipe("rust", 205.2, h, z + 0.75, 205.1, h + 0.9, z + 0.8, 0.03, 4);
        b.geo("bone", K.sphereGeo(), {
          x: 205.1,
          y: h + 0.95,
          z: z + 0.8,
          sx: 0.12,
          sy: 0.14,
          sz: 0.13,
          tint: [0.85, 0.8, 0.66],
        });
      }
    }
    b.col(205.0, 0, PZ0 - 4, 205.4, 2.2, DOOR_Z - 1.8, { walkable: false });
    b.col(205.0, 0, DOOR_Z + 1.8, 205.4, 2.2, PZ1 + 4, { walkable: false });
    for (const pz of [DOOR_Z - 1.8, DOOR_Z + 1.8])
      b.pipe("rust", 205.2, 0, pz, 205.2, 3.2, pz, 0.08, 6);
    b.beam(
      "rust",
      205.2,
      3.1,
      DOOR_Z - 1.8,
      205.2,
      3.1,
      DOOR_Z + 1.8,
      0.12,
      0.12,
    );
    b.plate(
      "art",
      205.1,
      3.6,
      DOOR_Z,
      -1,
      0,
      3.2,
      0.7,
      K.signCell("tam_gate", "THE WIGWAM — CONSTITUENTS ONLY", 512, 110, {
        bg: "#1a1410",
        fg: "#d8701c",
        font: "Arial Black, sans-serif",
        border: "#d8701c",
      }),
    );
    // the searchlight on the south-west balustrade corner
    b.cyl("metal_dark", X0 + 1.5, BAL + 1.0, Z1 - 1.5, 0.35, 0.35, 0.5, 8);
    b.geo("metal", K.unitCyl(12), {
      x: X0 + 1.2,
      y: BAL + 1.9,
      z: Z1 - 1.2,
      sx: 0.55,
      sy: 0.8,
      sz: 0.55,
      rx: 1.1,
      ry: -0.8,
      tint: [0.4, 0.42, 0.4],
    });
    b.glow(X0 + 0.9, BAL + 2.1, Z1 - 0.8, [1, 0.95, 0.8], 3.5);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_tammany_ext";
    K.anchor(ctx, "door", X0 - 2.6, 0.9, DOOR_Z, false);
    K.loot(ctx, "barrel", 206.6, 0, DOOR_Z - 3.5, 0, {
      world: true,
      burning: true,
    });
    K.loot(ctx, "barrel", 206.6, 0, DOOR_Z + 3.5, 0, {
      world: true,
      burning: true,
    });
    K.loot(ctx, "sandbags", 207.2, 0, PZ0 - 2, HP, { world: true });
    K.loot(ctx, "sandbags", 207.2, 0, PZ1 + 2, HP, { world: true });
    K.loot(ctx, "crate", X0 + 20, 0, Z1 + 1.2, 0.2, {
      world: true,
      kind: "plain",
      loot: "raider_stash",
      name: "Ballot Box (stuffed)",
    });
    K.skel(ctx, 207.8, 0, DOOR_Z + 6.5, 1.3, "lying", { world: true });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
