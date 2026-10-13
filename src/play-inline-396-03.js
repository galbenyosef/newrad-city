// play-inline-396 03 — wz1
// Lines 90-871 of readable/play-inline-396.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "jm_ext", grime: 0.55 });
    const d = K.builder({ name: "jm_ext_detail", grime: 0.6 });
    const r = K.rng("jm_ext");

    // ---------------- ground: flagstone forecourt and garden soil ----------------
    b.face("sidewalk", -5, 0.02, 392, 1, 0, 0, 0, 0, -1, 34, 28, {
      uv: "top",
      tint: [0.72, 0.7, 0.66],
    });
    b.face("dirt", -4.6, 0.035, 390.5, 1, 0, 0, 0, 0, -1, 4.2, 25, {
      uv: "top",
      tint: [0.55, 0.5, 0.38],
    });

    // ---------------- courtroom hall (x 0..20, z 368..384), walls 13 m ----------------
    const HH = 13;
    wall(b, HX0, HZ0, HX1, HZ0, 0, -1, 0, HH); // north
    wall(b, HX0, HZ0, HX0, HZ1, -1, 0, 0, HH); // west
    wall(b, HX0, HZ1, WX0, HZ1, 0, 1, 0, HH); // south stub west of the wing
    wall(b, WX1, HZ1, TX0, HZ1, 0, 1, 0, HH); // south, between wing and tower
    b.col(HX0, 0, HZ0, HX1, HH, HZ1, { tag: "building" });
    // tall lancets of the courtroom (north + west), upper tier; small ones below
    for (let k = 0; k < 5; k++) {
      const x = 2.2 + k * 3.9,
        st = r() < 0.35 ? "broken" : r() < 0.3 ? "boarded" : "glass";
      K.lancet(b, x, 5.0, HZ0, 0, -1, 1.7, 5.8, { state: st });
      K.lancet(b, x, 1.6, HZ0, 0, -1, 1.0, 2.2, {
        state: r() < 0.5 ? "boarded" : "dark",
        rose: false,
      });
    }
    for (let k = 0; k < 4; k++) {
      const z = 370.4 + k * 3.8;
      K.lancet(b, HX0, 5.0, z, -1, 0, 1.7, 5.8, {
        state: k === 0 ? "broken" : r() < 0.3 ? "boarded" : "glass",
      });
      K.lancet(b, HX0, 1.6, z, -1, 0, 1.0, 2.2, {
        state: "boarded",
        rose: false,
      });
    }
    K.lancet(b, 16.5, 5.0, HZ1, 0, 1, 1.6, 5.6, { state: "glass" });
    // steep slate roof (ridge along x) with iron cresting — the north-west corner has fallen in
    K.pitchRoof(b, HX0 + 6, HX1, HZ0, HZ1, HH, HH + 8, "x", {
      mat: "slate",
      crest: true,
      ends: "a",
      gable: "brick_red",
      gableTint: BRICK,
    });
    // collapsed corner: bare rafters, a torn slate edge and the rubble that came down
    for (let k = 0; k < 7; k++) {
      const x = HX0 + 0.4 + k * 0.9;
      b.beam(
        "wood_rotten",
        x,
        HH,
        HZ0 - 0.2,
        x + (r() - 0.5) * 0.3,
        HH + 8 - (k < 3 ? 2.5 + r() * 2 : 0),
        (HZ0 + HZ1) / 2,
        0.14,
        0.2,
        { tint: [0.35, 0.28, 0.22] },
      );
      b.beam(
        "wood_rotten",
        x,
        HH,
        HZ1 + 0.2,
        x,
        HH + 8 - (k < 4 ? 3 + r() * 2 : 0.2),
        (HZ0 + HZ1) / 2,
        0.14,
        0.2,
        { tint: [0.35, 0.28, 0.22] },
      );
    }
    b.beam(
      "wood_rotten",
      HX0 + 3,
      HH + 5.5,
      (HZ0 + HZ1) / 2,
      HX0 + 6.1,
      HH + 8,
      (HZ0 + HZ1) / 2,
      0.22,
      0.26,
      { tint: [0.3, 0.24, 0.2] },
    );
    b.quadN(
      "brick_red",
      [HX0, HH, HZ1],
      [HX0, HH, HZ0],
      [HX0, HH + 3.5, (HZ0 + HZ1) / 2 - 1],
      [HX0, HH + 2.2, (HZ0 + HZ1) / 2 + 2],
      [-1, 0, 0],
      { tint: BRICK },
    );
    b.burn(HX0 + 3, HH, 376, 6, 0.6);
    K.rubble(b, -2.6, 0, 372, 2.2, 1.4, {
      seed: 11,
      tint: [0.8, 0.55, 0.45],
      col: true,
    });
    for (let k = 0; k < 9; k++)
      b.box(
        "slate",
        -3 + r() * 3,
        0.05 + r() * 0.4,
        369 + r() * 7,
        0.6,
        0.03,
        0.4,
        { yaw: r() * 3, tint: [0.4, 0.42, 0.46] },
      );

    // ---------------- south entrance wing (x 3..13, z 384..391) ----------------
    const WH = 12.5;
    wall(b, WX0, HZ1, WX0, WZ1, -1, 0, 0, WH);
    wall(b, WX0, WZ1, WX1, WZ1, 0, 1, 0, WH);
    wall(b, WX1, HZ1, WX1, WZ1, 1, 0, 0, WH);
    b.col(WX0, 0, HZ1, WX1, WH, WZ1, { tag: "building" });
    K.pitchRoof(b, WX0, WX1, HZ1 - 2, WZ1, WH, WH + 7.5, "z", {
      mat: "slate",
      crest: true,
      ends: "b",
      gable: "brick_red",
      gableTint: BRICK,
    });
    // big pointed window over the porch (the old court stair window) + rose in the gable
    K.lancet(b, DOOR.x, 5.6, WZ1, 0, 1, 2.6, 6.2, {
      state: "glass",
      paneTint: [0.5, 0.36, 0.3],
    });
    b.geo("limestone", new THREE.TorusGeometry(1.0, 0.16, 6, 20), {
      x: DOOR.x,
      y: WH + 2.6,
      z: WZ1 + 0.1,
      tint: STONE,
    });
    b.cyl("glass", DOOR.x, WH + 2.6, WZ1 + 0.02, 0.95, 0.95, 0.02, 16, {
      tint: [0.35, 0.3, 0.45],
    });
    for (const x of [4.6, 11.4]) {
      K.lancet(b, x, 1.6, WZ1, 0, 1, 1.0, 2.6, {
        state: "boarded",
        rose: false,
      });
      K.lancet(b, x, 5.6, WZ1, 0, 1, 1.2, 4.2, {
        state: r() < 0.5 ? "broken" : "glass",
      });
    }
    // GOTHIC PORCH: granite colonnettes carrying a pointed gable, steps to the sidewalk
    b.boxMM("granite", DOOR.x - 2.1, 0, WZ1, DOOR.x + 2.1, 0.45, WZ1 + 1.6, {
      tint: [0.6, 0.58, 0.56],
    });
    b.boxMM(
      "granite",
      DOOR.x - 2.1,
      0,
      WZ1 + 1.6,
      DOOR.x + 2.1,
      0.22,
      WZ1 + 1.95,
      { tint: [0.6, 0.58, 0.56] },
    );
    b.col(DOOR.x - 2.1, 0, WZ1, DOOR.x + 2.1, 0.45, WZ1 + 1.6, {
      tag: "steps",
      surface: "concrete",
    });
    b.col(DOOR.x - 2.1, 0, WZ1 + 1.6, DOOR.x + 2.1, 0.22, WZ1 + 1.95, {
      tag: "steps",
      surface: "concrete",
    });
    for (const s of [-1, 1]) {
      const cx = DOOR.x + s * 1.75;
      K.column(b, cx, 0.45, WZ1 + 1.25, 0.2, 3.2, {
        kind: "doric",
        mat: "granite",
        tint: [0.5, 0.36, 0.34],
        flutes: false,
      });
      b.boxMM(
        "limestone",
        cx - 0.3,
        3.65,
        WZ1 + 0.95,
        cx + 0.3,
        3.95,
        WZ1 + 1.55,
        { tint: STONE },
      );
      b.col(cx - 0.22, 0.45, WZ1 + 1.03, cx + 0.22, 3.9, WZ1 + 1.47, {
        tag: "column",
        walkable: false,
      });
    }
    K.pitchRoof(b, DOOR.x - 2.1, DOOR.x + 2.1, WZ1, WZ1 + 1.7, 3.95, 6.1, "z", {
      mat: "slate",
      ends: "b",
      gable: "limestone",
      gableTint: STONE,
      over: 0.15,
    });
    K.letters(b, DOOR.x, 4.75, WZ1 + 1.72, 0, 1, 2.4, 0.45, "JUSTICE", {
      fg: "#3a2a20",
      font: "Georgia, serif",
      off: 0.02,
      shadow: false,
    });
    // double doors under a pointed tympanum
    b.boxMM(
      "wood_dark",
      DOOR.x - 0.95,
      0.45,
      WZ1 + 0.01,
      DOOR.x + 0.95,
      3.0,
      WZ1 + 0.1,
      { tint: [0.3, 0.18, 0.1] },
    );
    b.beam(
      "black_iron",
      DOOR.x,
      0.45,
      WZ1 + 0.12,
      DOOR.x,
      3.0,
      WZ1 + 0.12,
      0.05,
      0.03,
    );
    for (const s of [-1, 1])
      for (const y of [1.0, 2.4])
        b.boxMM(
          "black_iron",
          DOOR.x + s * 0.12,
          y,
          WZ1 + 0.1,
          DOOR.x + s * 0.85,
          y + 0.08,
          WZ1 + 0.14,
          {},
        ); // strap hinges
    K.lancet(b, DOOR.x, 3.0, WZ1 + 0.02, 0, 1, 1.9, 1.6, {
      state: "dark",
      mullion: false,
      sill: false,
      fw: 0.14,
    });
    K.letters(b, DOOR.x, 3.55, WZ1 + 0.05, 0, 1, 1.1, 0.3, "ALL RISE", {
      fg: "#c8a860",
      font: "Georgia, serif",
      off: 0.02,
    });
    // the court keeps two gas-style lanterns burning by the porch ("NIGHT COURT DAILY") — the entrance reads at night
    for (const s of [-1, 1]) {
      const lx = DOOR.x + s * 2.55,
        lz = WZ1 + 0.42;
      b.beam("black_iron", lx, 2.95, WZ1, lx, 2.95, lz, 0.04, 0.04);
      b.cyl("black_iron", lx, 2.35, lz, 0.13, 0.16, 0.08, 6);
      b.cyl("lamp", lx, 2.43, lz, 0.12, 0.15, 0.42, 6, { tint: [1, 0.8, 0.5] });
      b.cyl("black_iron", lx, 2.85, lz, 0.18, 0.04, 0.2, 6);
      for (let k = 0; k < 6; k++) {
        const a = (k * PI) / 3;
        b.beam(
          "black_iron",
          lx + Math.cos(a) * 0.14,
          2.43,
          lz + Math.sin(a) * 0.14,
          lx + Math.cos(a) * 0.12,
          2.85,
          lz + Math.sin(a) * 0.12,
          0.012,
          0.012,
        );
      }
      b.glow(lx, 2.64, lz + 0.05, [1, 0.72, 0.4], 1.5);
    }
    // painted name band over the porch
    b.plate(
      "art",
      DOOR.x,
      10.9,
      WZ1 + 0.05,
      0,
      1,
      8.6,
      0.55,
      K.signCell(
        "jm_name",
        "JEFFERSON  MARKET  COURTHOUSE  ·  THIRD  JUDICIAL  DISTRICT",
        1024,
        64,
        { bg: "#d8ceb4", fg: "#3a2418", font: "Georgia, serif" },
      ),
    );

    // ---------------- east wing (x 20..28, z 368..383) facing 6th Avenue ----------------
    const EH = 11.5;
    wall(b, TX1, EZ0, TX1, TZ0, 1, 0, 0, EH);
    wall(b, TX0, EZ0, TX1, EZ0, 0, -1, 0, EH);
    b.col(TX0, 0, EZ0, TX1, EH, TZ0, { tag: "building" });
    K.pitchRoof(b, TX0, TX1, EZ0, TZ0, EH, EH + 6, "z", {
      mat: "slate",
      crest: true,
      ends: "a",
      gable: "brick_red",
      gableTint: BRICK,
    });
    for (let k = 0; k < 4; k++) {
      const z = 370 + k * 3.5;
      K.lancet(b, TX1, 1.6, z, 1, 0, 1.1, 2.5, {
        state: k === 1 ? "broken" : "boarded",
        rose: false,
      });
      K.lancet(b, TX1, 5.4, z, 1, 0, 1.3, 4.4, {
        state: r() < 0.4 ? "broken" : "glass",
      });
    }
    // a pair of dormers on the east slope
    for (const z of [371.5, 378.5]) {
      b.boxMM(
        "brick_red",
        TX1 - 2.2,
        EH + 1.2,
        z - 0.9,
        TX1 - 1.2,
        EH + 3.2,
        z + 0.9,
        { tint: BRICK },
      );
      K.pitchRoof(
        b,
        TX1 - 2.4,
        TX1 - 1.0,
        z - 1,
        z + 1,
        EH + 3.2,
        EH + 4.3,
        "x",
        { mat: "slate", gable: "limestone", gableTint: STONE, over: 0.1 },
      );
      K.lancet(b, TX1 - 1.2, EH + 1.4, z, 1, 0, 0.8, 1.6, {
        state: "dark",
        rose: false,
        sill: false,
        fw: 0.12,
      });
    }

    // ---------------- THE TOWER (x 20..28, z 383..391) ----------------
    const TS = 30,
      CX = (TX0 + TX1) / 2,
      CZ = (TZ0 + TZ1) / 2;
    wall(b, TX1, TZ0, TX1, TZ1, 1, 0, 0, TS);
    wall(b, TX0, TZ1, TX1, TZ1, 0, 1, 0, TS);
    b.face("brick_red", TX0, 0, TZ0, 0, 0, 1, 0, 1, 0, TZ1 - TZ0, TS, {
      tint: BRICK.map((v) => v * 0.9),
    }); // west face (over the little yard)
    b.face("brick_red", TX1, HH, TZ0, -1, 0, 0, 0, 1, 0, TX1 - TX0, TS - HH, {
      tint: BRICK.map((v) => v * 0.88),
    }); // north face above the hall roof
    K.bands(b, TX0, TZ0, TX0, TZ1, -1, 0, BANDS, { tint: STONE });
    b.col(TX0, 0, TZ0, TX1, TS, TZ1, { tag: "building" });
    // corner buttresses stepping in as they climb
    for (const [bx, bz] of [
      [TX0, TZ1],
      [TX1, TZ1],
      [TX1, TZ0],
      [TX0, TZ0],
    ]) {
      for (let s = 0; s < 3; s++) {
        const w = 0.9 - s * 0.2,
          y0 = s * 8,
          h = 8 + (s === 2 ? 6 : 0);
        b.box("limestone", bx, y0, bz, w, h, w, {
          tint: s % 2 ? BRICK : STONE,
        });
      }
      b.cyl("limestone", bx, 30, bz, 0.35, 0.05, 2.2, 4, { tint: STONE });
    }
    // tall stair lancets climbing the tower
    for (const [y, h] of [
      [1.8, 3.2],
      [7, 5.2],
      [14.2, 6.4],
    ]) {
      K.lancet(b, CX, y, TZ1, 0, 1, 1.4, h, {
        state: y > 10 ? "broken" : "glass",
      });
      K.lancet(b, TX1, y, CZ, 1, 0, 1.4, h, {
        state: y < 5 ? "boarded" : "glass",
      });
    }
    // clock stage (bracketed stone ledge) with four dials — stopped at 9:47
    K.bands(b, TX0 - 0.2, TZ1, TX1 + 0.2, TZ1, 0, 1, [23.2, 29.6], {
      depth: 0.3,
      h: 0.45,
      tint: STONE,
    });
    K.bands(b, TX1, TZ0 - 0.2, TX1, TZ1 + 0.2, 1, 0, [23.2, 29.6], {
      depth: 0.3,
      h: 0.45,
      tint: STONE,
    });
    K.bands(b, TX1 + 0.2, TZ0, TX0 - 0.2, TZ0, 0, -1, [23.2, 29.6], {
      depth: 0.3,
      h: 0.45,
      tint: STONE,
    });
    K.bands(b, TX0, TZ1 + 0.2, TX0, TZ0 - 0.2, -1, 0, [23.2, 29.6], {
      depth: 0.3,
      h: 0.45,
      tint: STONE,
    });
    const dial = K.clockCell("jm_day", { hour: 9, minute: 47 });
    const dialBroken = K.clockCell("jm_day_b", {
      hour: 9,
      minute: 47,
      broken: true,
    });
    const lit = K.builder({ name: "jm_clock_lit", grime: 0 });
    const litDial = K.clockCell("jm_lit", { lit: true, hour: 9, minute: 47 });
    const faces = [
      [CX, TZ1, 0, 1],
      [TX1, CZ, 1, 0],
      [CX, TZ0, 0, -1],
      [TX0, CZ, -1, 0],
    ];
    faces.forEach(([x, z, nx, nz], i) => {
      b.geo("limestone", new THREE.TorusGeometry(1.75, 0.22, 6, 24), {
        x: x + nx * 0.12,
        y: 26.4,
        z: z + nz * 0.12,
        ry: Math.atan2(nx, nz),
        tint: STONE,
      });
      b.plate(
        "art",
        x,
        26.4,
        z,
        nx,
        nz,
        3.4,
        3.4,
        i === 2 ? dialBroken : dial,
        { off: 0.05 },
      );
      lit.plate("neon", x, 26.4, z, nx, nz, 3.4, 3.4, litDial, {
        off: 0.08,
        tint: [1, 0.85, 0.55],
      });
      lit.glow(x + nx * 0.6, 26.4, z + nz * 0.6, [0.9, 0.7, 0.35], 5.5);
      // gablet over each dial
      const rx = nz,
        rz = -nx;
      b.quadN(
        "slate",
        [x - rx * 2.4 + nx * 0.3, 29.9, z - rz * 2.4 + nz * 0.3],
        [x + rx * 2.4 + nx * 0.3, 29.9, z + rz * 2.4 + nz * 0.3],
        [x + nx * 0.3, 31.6, z + nz * 0.3],
        [x + nx * 0.3, 31.6, z + nz * 0.3],
        [nx, 0.3, nz],
        { tint: [0.4, 0.42, 0.46] },
      );
    });
    // belfry / fire lookout: louvred pointed openings, the bronze bell inside, then the slate spire
    const BY = 30.1;
    b.boxMM(
      "limestone",
      TX0 + 0.4,
      BY,
      TZ0 + 0.4,
      TX1 - 0.4,
      BY + 0.3,
      TZ1 - 0.4,
      { tint: STONE, faces: "nsewt" },
    );
    for (const [px, pz] of [
      [TX0 + 0.6, TZ0 + 0.6],
      [TX1 - 0.6, TZ0 + 0.6],
      [TX1 - 0.6, TZ1 - 0.6],
      [TX0 + 0.6, TZ1 - 0.6],
      [CX, TZ0 + 0.5],
      [CX, TZ1 - 0.5],
      [TX0 + 0.5, CZ],
      [TX1 - 0.5, CZ],
    ]) {
      b.box("brick_red", px, BY + 0.3, pz, 0.7, 5.2, 0.7, { tint: BRICK });
    }
    for (const [x, z, nx, nz] of faces) {
      for (const s of [-1, 1]) {
        const rx = nz,
          rz = -nx,
          ox = x - nx * 0.5 + rx * s * 1.75,
          oz = z - nz * 0.5 + rz * s * 1.75;
        K.lancet(b, ox, BY + 0.6, oz, nx, nz, 1.9, 4.4, {
          state: "dark",
          mullion: false,
          rose: false,
          sill: false,
          fw: 0.16,
        });
        for (let k = 0; k < 7; k++) {
          const y = BY + 1.0 + k * 0.42;
          b.box(
            "wood_rotten",
            ox + nx * 0.05,
            y,
            oz + nz * 0.05,
            Math.abs(rx) * 1.8 + 0.08,
            0.06,
            Math.abs(rz) * 1.8 + 0.08,
            { tint: [0.3, 0.26, 0.2] },
          );
        }
      }
    }
    b.geo(
      "bronze",
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.05, 0),
          new THREE.Vector2(0.95, 0),
          new THREE.Vector2(0.85, 0.2),
          new THREE.Vector2(0.6, 0.8),
          new THREE.Vector2(0.55, 1.3),
          new THREE.Vector2(0.3, 1.5),
          new THREE.Vector2(0.05, 1.55),
        ],
        14,
      ),
      { x: CX, y: BY + 2.0, z: CZ, tint: [0.5, 0.42, 0.26] },
    );
    b.boxMM(
      "limestone",
      TX0 - 0.3,
      BY + 5.4,
      TZ0 - 0.3,
      TX1 + 0.3,
      BY + 5.9,
      TZ1 + 0.3,
      { tint: STONE, faces: "nsewtb" },
    );
    K.pyramid(b, CX, CZ, TX1 - TX0 + 0.4, TZ1 - TZ0 + 0.4, BY + 5.9, 9.0, {
      mat: "slate",
      tint: [0.38, 0.4, 0.44],
    });
    for (const [px, pz] of [
      [TX0, TZ0],
      [TX1, TZ0],
      [TX1, TZ1],
      [TX0, TZ1],
    ]) {
      b.cyl("slate", px, BY + 5.9, pz, 0.45, 0.02, 3.2, 6, {
        tint: [0.38, 0.4, 0.44],
      });
      b.cyl("black_iron", px, BY + 9.1, pz, 0.03, 0.02, 0.8, 4);
    }
    b.cyl("black_iron", CX, BY + 14.8, CZ, 0.08, 0.02, 2.4, 6, {
      tint: [0.2, 0.2, 0.18],
    });
    b.geo("gold", K.sphereGeo(), {
      x: CX,
      y: BY + 15.4,
      z: CZ,
      s: 0.16,
      tint: [0.6, 0.48, 0.24],
    });
    // the Ardent Robotics banner hanging down the tower's 6th Avenue face
    const banner = K.paint(
      "art",
      "jm_ardent_banner",
      256,
      1024,
      function (x, X, Y, W, H) {
        x.fillStyle = "#1e3a5e";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#d8b040";
        x.lineWidth = 8;
        x.strokeRect(X + 10, Y + 10, W - 20, H - 20);
        x.fillStyle = "#e8e0c8";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.font = "bold 44px Arial Black, sans-serif";
        x.fillText("ARDENT", X + W / 2, Y + 80);
        x.font = "bold 20px Arial, sans-serif";
        x.fillText("ROBOTICS", X + W / 2, Y + 114);
        x.font = "bold 22px Arial, sans-serif";
        ["JUDICIAL", "AUTOMATION", "PILOT", "PROGRAM"].forEach((t, i) =>
          x.fillText(t, X + W / 2, Y + 160 + i * 34),
        );
        x.fillStyle = "#d8b040";
        x.beginPath();
        x.arc(X + W / 2, Y + 420, 70, 0, PI * 2);
        x.fill();
        x.fillStyle = "#1e3a5e";
        x.font = "bold 60px Georgia, serif";
        x.fillText("⚖", X + W / 2, Y + 424);
        x.fillStyle = "#e8e0c8";
        x.font = "italic 26px Georgia, serif";
        ["Justice", "Never", "Sleeps."].forEach((t, i) =>
          x.fillText(t, X + W / 2, Y + 560 + i * 40),
        );
        x.font = "bold 18px Arial, sans-serif";
        x.fillText("100% HUMAN-ERROR FREE", X + W / 2, Y + 760);
        x.fillText("VERDICTS IN 0.3 SEC.", X + W / 2, Y + 790);
        K.stains(x, X, Y, W, H, 20, 5, 0.5, [30, 25, 15]);
        K.streaks(x, X, Y, W, H, 30, 6, 0.4);
        x.clearRect(X + W * 0.62, Y + H * 0.82, W * 0.4, H * 0.2); // torn lower corner
      },
    );
    b.plate("art", TX1 + 0.35, 15.5, CZ, 1, 0, 3.2, 12.5, banner, {
      off: 0.02,
    });
    b.beam(
      "black_iron",
      TX1 + 0.4,
      21.8,
      CZ - 1.8,
      TX1 + 0.4,
      21.8,
      CZ + 1.8,
      0.08,
      0.08,
    );

    // ---------------- the Jefferson Market Garden (west strip) ----------------
    K.ironFence(b, -4.6, 365, -4.6, 391.5, 0, { h: 1.7, bent: true });
    K.ironFence(b, -4.6, 391.5, WX0 - 0.2, 391.5, 0, {
      h: 1.7,
      gapAt: 3.3,
      gapW: 1.3,
    });
    K.deadTree(b, -2.4, 0, 380, 7.5, 31);
    K.deadTree(b, -2.8, 0, 387.5, 6.2, 32);
    for (let k = 0; k < 18; k++) {
      const x = -4.2 + r() * 3.8,
        z = 366 + r() * 24;
      d.cyl("flat", x, 0.03, z, 0.15 + r() * 0.25, 0.02, 0.3 + r() * 0.5, 5, {
        tint: r() < 0.3 ? [0.35, 0.5, 0.2] : [0.45, 0.42, 0.25],
      });
    }
    // mutated glowcap by the tree roots
    for (let k = 0; k < 6; k++) {
      const x = -2.6 + (r() - 0.5) * 1.6,
        z = 380 + (r() - 0.5) * 1.8;
      d.geo("lamp", K.sphereGeo(), {
        x,
        y: 0.08,
        z,
        sx: 0.12,
        sy: 0.06,
        sz: 0.12,
        tint: [0.25, 0.55, 0.2],
      });
    }
    d.glow(-2.6, 0.2, 380, [0.3, 0.7, 0.2], 1.4);

    // ---------------- street dressing ----------------
    // court-in-session board by the porch
    b.boxMM(
      "wood_dark",
      DOOR.x + 2.6,
      0,
      WZ1 + 1.1,
      DOOR.x + 3.6,
      0.08,
      WZ1 + 1.4,
      { tint: [0.3, 0.2, 0.14] },
    );
    for (const s of [0, 1])
      b.beam(
        "wood_dark",
        DOOR.x + 2.7 + s * 0.8,
        0,
        WZ1 + 1.25,
        DOOR.x + 2.7 + s * 0.8,
        1.9,
        WZ1 + 1.25,
        0.06,
        0.06,
        { tint: [0.3, 0.2, 0.14] },
      );
    b.plate(
      "art",
      DOOR.x + 3.1,
      1.35,
      WZ1 + 1.29,
      0,
      1,
      0.95,
      1.1,
      K.signCell(
        "jm_session",
        "COURT IN\nSESSION\n—\nNIGHT COURT\nDAILY",
        192,
        224,
        {
          bg: "#1a2a20",
          fg: "#e8dcb8",
          font: "Georgia, serif",
          border: "#c8a050",
        },
      ),
    );
    b.col(DOOR.x + 2.6, 0, WZ1 + 1.1, DOOR.x + 3.6, 1.9, WZ1 + 1.4, {
      tag: "sign",
      walkable: false,
    });
    // graffiti on the east wing
    b.plate(
      "decal",
      TX1 + 0.03,
      2.4,
      376.2,
      1,
      0,
      4.2,
      1.5,
      K.tag("OBJECTION!", "#d8d8d0", 384, 128),
    );
    b.plate(
      "decal",
      HX0 - 0.03,
      2.2,
      377,
      -1,
      0,
      3.8,
      1.3,
      K.tag("NO ROBO-JUDGE", "#c02818", 384, 128),
    );
    b.hplate(
      "decal",
      DOOR.x,
      0.47,
      WZ1 + 0.8,
      3.2,
      1.4,
      0,
      K.decal("grime", 3),
    );
    K.litter(d, -4, 391.8, 28.5, 392.8, 0.03, 16, 707);
    K.litter(d, 28.2, 366, 29, 391, 0.03, 10, 708);

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_jefferson_market_ext";
    const det = d.finish(ctx.extRoot);
    det.name = "poi_jefferson_market_detail";
    try {
      G.world.addLOD(det, 160);
    } catch (e) {
      /* optional */
    }
    ctx.litGroup = lit.finish(ctx.extRoot);
    ctx.litGroup.visible = false;

    K.anchor(ctx, "door", DOOR.x, 0.45, WZ1 + 1.2, false);
    K.anchor(ctx, "porch", DOOR.x + 2.2, 0, WZ1 + 2.6, false);
    K.anchor(ctx, "garden", -2.2, 0, 384, false);
    K.anchor(ctx, "tower_top", CX, BY + 0.4, CZ, false);
    K.loot(ctx, "sandbags", DOOR.x - 3.4, 0, WZ1 + 2.2, 0, {
      world: true,
      low: true,
    });
    K.loot(ctx, "sandbags", DOOR.x + 4.4, 0, WZ1 + 2.4, 0.2, {
      world: true,
      low: true,
    });
    K.loot(ctx, "trash_can", 14.5, 0, 392.3, 0, {
      world: true,
      loot: "trash_can",
    });
    K.loot(ctx, "mailbox", 26.5, 0, 392.2, 0, { world: true, loot: "mailbox" });
    K.skel(ctx, -1.8, 0, 386.5, 0.8, "sitting", { world: true });
  }

