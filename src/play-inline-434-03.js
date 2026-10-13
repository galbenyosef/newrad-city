// play-inline-434 03 — tint
// Lines 93-2228 of readable/play-inline-434.pretty.js (statement-aligned).
  function exterior(ctx) {
    const BY = groundY();
    PK.ZOO_BY = BY;
    const b = K.builder({
      name: "zoo_ext",
      grime: 0.55,
      off: { x: 0, y: BY, z: 0 },
    });
    const d = K.builder({
      name: "zoo_ext_detail",
      grime: 0.55,
      off: { x: 0, y: BY, z: 0 },
    });
    const lit = K.builder({
      name: "zoo_ext_lit",
      grime: 0,
      off: { x: 0, y: BY, z: 0 },
    });
    const ring = K.builder({
      name: "zoo_clock_ring",
      grime: 0.3,
      off: { x: 0, y: 0, z: 0 },
    });
    const r = K.rng("zoo_ext");

    // ============================================================ THE ARSENAL
    const W = AX1 - AX0,
      D = AZ1 - AZ0;
    b.face("brick_red", AX0, -0.5, AZ1, 1, 0, 0, 0, 1, 0, W, AH + 0.5, {
      tint: BRICK,
    });
    b.face("brick_red", AX1, -0.5, AZ0, -1, 0, 0, 0, 1, 0, W, AH + 0.5, {
      tint: BRICK.map((v) => v * 0.86),
    });
    b.face("brick_red", AX1, -0.5, AZ1, 0, 0, -1, 0, 1, 0, D, AH + 0.5, {
      tint: BRICK.map((v) => v * 0.93),
    });
    b.face("brick_red", AX0, -0.5, AZ0, 0, 0, 1, 0, 1, 0, D, AH + 0.5, {
      tint: BRICK.map((v) => v * 0.9),
    });
    b.face("concrete_dark", AX0, AH, AZ1, 1, 0, 0, 0, 0, -1, W, D, {
      uv: "top",
      tint: [0.3, 0.29, 0.28],
    });
    b.col(AX0, -0.5, AZ0, AX1, AH, AZ1, { tag: "building" });
    // rusticated brownstone basement course + stone string-courses at the floor lines
    b.boxMM("brownstone", AX0 - 0.12, -0.4, AZ1, AX1 + 0.12, 1.2, AZ1 + 0.12, {
      tint: TRIM,
    });
    b.boxMM("brownstone", AX0 - 0.12, -0.4, AZ0 - 0.12, AX1 + 0.12, 1.2, AZ0, {
      tint: TRIM,
    });
    b.boxMM("brownstone", AX0 - 0.12, -0.4, AZ0, AX0, 1.2, AZ1, { tint: TRIM });
    b.boxMM("brownstone", AX1, -0.4, AZ0, AX1 + 0.12, 1.2, AZ1, { tint: TRIM });
    for (const y of [4.3, 7.6, 10.5]) {
      K.bands(b, AX0, AZ1, AX1, AZ1, 0, 1, [y], {
        mat: "brownstone",
        tint: TRIM,
        depth: 0.1,
        h: 0.2,
      });
      K.bands(b, AX1, AZ0, AX0, AZ0, 0, -1, [y], {
        mat: "brownstone",
        tint: TRIM,
        depth: 0.1,
        h: 0.2,
      });
      K.bands(b, AX0, AZ0, AX0, AZ1, -1, 0, [y], {
        mat: "brownstone",
        tint: TRIM,
        depth: 0.1,
        h: 0.2,
      });
      K.bands(b, AX1, AZ1, AX1, AZ0, 1, 0, [y], {
        mat: "brownstone",
        tint: TRIM,
        depth: 0.1,
        h: 0.2,
      });
    }
    // battlements (the NE run has lost a stretch of merlons: a shell went through it in '67)
    K.crenel(b, AX0 + 1.2, AZ1, PX0 - 1, AZ1, AH, 0, 1, {
      tint: BRICK,
      trimTint: TRIM,
    });
    K.crenel(b, PX1 + 1, AZ1, AX1 - 1.2, AZ1, AH, 0, 1, {
      tint: BRICK,
      trimTint: TRIM,
    });
    K.crenel(b, AX1 - 1.2, AZ0, AX0 + 1.2, AZ0, AH, 0, -1, {
      tint: BRICK,
      trimTint: TRIM,
    });
    K.crenel(b, AX0, AZ0 + 1.2, AX0, AZ1 - 1.2, AH, -1, 0, {
      tint: BRICK,
      trimTint: TRIM,
    });
    K.crenel(b, AX1, AZ1 - 1.2, AX1, AZ0 + 6, AH, 1, 0, {
      tint: BRICK,
      trimTint: TRIM,
    });
    b.burn(AX1, AH, AZ0 + 3.5, 2.6, 0.75);
    for (let k = 0; k < 5; k++)
      b.box(
        "brick_red",
        AX1 + 0.1 + r() * 0.4,
        AH - 0.2 - r() * 0.6,
        AZ0 + 1.8 + k * 0.8,
        0.5,
        0.25,
        0.4,
        { yaw: r(), tint: BRICK },
      );
    // the entrance pavilion
    b.face("brick_red", PX0, -0.5, PZ, 1, 0, 0, 0, 1, 0, PX1 - PX0, PH + 0.5, {
      tint: BRICK.map((v) => v * 1.04),
    });
    b.face("brick_red", PX0, -0.5, AZ1, 0, 0, 1, 0, 1, 0, PZ - AZ1, PH + 0.5, {
      tint: BRICK,
    });
    b.face("brick_red", PX1, -0.5, PZ, 0, 0, -1, 0, 1, 0, PZ - AZ1, PH + 0.5, {
      tint: BRICK,
    });
    b.face(
      "concrete_dark",
      PX0,
      PH,
      PZ,
      1,
      0,
      0,
      0,
      0,
      -1,
      PX1 - PX0,
      PZ - AZ1,
      { uv: "top", tint: [0.3, 0.29, 0.28] },
    );
    b.face("brick_red", PX1, AH, AZ1, -1, 0, 0, 0, 1, 0, PX1 - PX0, PH - AH, {
      tint: BRICK.map((v) => v * 0.8),
    }); // back of the pavilion above the roof
    b.col(PX0, -0.5, AZ1, PX1, PH, PZ, { tag: "building" });
    K.crenel(b, PX0 + 1.2, PZ, PX1 - 1.2, PZ, PH, 0, 1, {
      tint: BRICK,
      trimTint: TRIM,
      pitch: 1.2,
    });
    for (const y of [4.3, 7.6, 10.5])
      K.bands(b, PX0, PZ, PX1, PZ, 0, 1, [y], {
        mat: "brownstone",
        tint: TRIM,
        depth: 0.1,
        h: 0.2,
      });
    b.boxMM("brownstone", PX0 - 0.12, -0.4, PZ, PX1 + 0.12, 1.2, PZ + 0.12, {
      tint: TRIM,
    });
    // towers
    const tw = { tint: BRICK, trimTint: TRIM, bands: [4.3, 7.6, 10.5] };
    K.octTower(
      b,
      PX0,
      PZ - 0.1,
      1.2,
      -0.5,
      17.5,
      Object.assign({}, tw, {
        slits: [
          { y: 5.2, h: 1.6, w: 0.36, faces: [3, 4, 5] },
          { y: 8.5, h: 1.6, w: 0.36, faces: [4, 5, 6] },
          { y: 11.4, h: 1.5, w: 0.36, faces: [5, 6] },
          { y: 14.6, h: 1.2, w: 0.34, faces: [5, 6, 7] },
        ],
      }),
    );
    K.octTower(
      b,
      PX1,
      PZ - 0.1,
      1.2,
      -0.5,
      17.5,
      Object.assign({}, tw, {
        slits: [
          { y: 5.2, h: 1.6, w: 0.36, faces: [7, 0, 1] },
          { y: 8.5, h: 1.6, w: 0.36, faces: [6, 7] },
          { y: 11.4, h: 1.5, w: 0.36, faces: [6, 7] },
          { y: 14.6, h: 1.2, w: 0.34, faces: [5, 6, 7] },
        ],
      }),
    );
    K.octTower(
      b,
      AX0 + 0.6,
      AZ1 - 0.4,
      1.5,
      -0.5,
      16.2,
      Object.assign({}, tw, {
        slits: [
          { y: 2.0, h: 1.8, w: 0.44, faces: [4, 5, 6] },
          { y: 5.2, h: 1.8, w: 0.44, faces: [4, 6] },
          { y: 8.5, h: 1.8, w: 0.44, faces: [4, 5, 6] },
          { y: 11.4, h: 1.6, w: 0.4, faces: [5, 6] },
        ],
      }),
    );
    K.octTower(
      b,
      AX1 - 0.6,
      AZ1 - 0.4,
      1.5,
      -0.5,
      16.2,
      Object.assign({}, tw, {
        slits: [
          { y: 2.0, h: 1.8, w: 0.44, faces: [0, 6, 7] },
          { y: 5.2, h: 1.8, w: 0.44, faces: [0, 6] },
          { y: 8.5, h: 1.8, w: 0.44, faces: [6, 7] },
          { y: 11.4, h: 1.6, w: 0.4, faces: [0, 6, 7] },
        ],
      }),
    );
    K.octTower(
      b,
      AX0 + 0.4,
      AZ0 + 0.4,
      1.2,
      -0.5,
      14.8,
      Object.assign({}, tw, {
        slits: [
          { y: 5.2, h: 1.6, w: 0.36, faces: [2, 3, 4] },
          { y: 11.4, h: 1.4, w: 0.36, faces: [3, 4] },
        ],
      }),
    );
    K.octTower(
      b,
      AX1 - 0.4,
      AZ0 + 0.4,
      1.2,
      -0.5,
      14.8,
      Object.assign({}, tw, {
        slits: [
          { y: 5.2, h: 1.6, w: 0.36, faces: [0, 1, 2] },
          { y: 11.4, h: 1.4, w: 0.36, faces: [1, 2] },
        ],
      }),
    );
    // windows (4 storeys): tall 2-over-2 sashes with brownstone lintels
    const winState = (f, k) =>
      f === 0
        ? k % 2
          ? "boarded"
          : "dark"
        : r() < 0.25
          ? "broken"
          : r() < 0.55
            ? "dark"
            : "glass";
    const floors = [
      [1.7, 2.1],
      [4.95, 2.1],
      [8.2, 1.9],
      [11.1, 1.3],
    ];
    floors.forEach(([yb, h], f) => {
      for (const x of [93.7, 104.3])
        K.sash(b, x, yb, AZ1, 0, 1, 0.95, h, {
          state: winState(f, x | 0),
          cols: 2,
          rows: 2,
          surround: "brownstone",
          surroundTint: TRIM,
          lintel: 0.26,
        });
      for (const z of [-485.6, -488.4, -491.2]) {
        K.sash(b, AX0, yb, z, -1, 0, 0.95, h, {
          state: winState(f, z | 0),
          cols: 2,
          rows: 2,
          surround: "brownstone",
          surroundTint: TRIM,
          lintel: 0.26,
        });
        K.sash(b, AX1, yb, z, 1, 0, 0.95, h, {
          state: winState(f + 1, z | 0),
          cols: 2,
          rows: 2,
          surround: "brownstone",
          surroundTint: TRIM,
          lintel: 0.26,
        });
      }
      for (const x of [93.4, 96.4, 99, 101.6, 104.6])
        K.sash(b, x, yb, AZ0, 0, -1, 0.95, h, {
          state: winState(f, x | 0),
          cols: 2,
          rows: 2,
          surround: "brownstone",
          surroundTint: TRIM,
          lintel: 0.26,
        });
      if (f >= 2)
        K.lancet(b, DOORX, yb + 0.1, PZ, 0, 1, 1.0, h + 0.5, {
          state: f === 1 ? "broken" : "dark",
          surround: "brownstone",
          tintA: TRIM,
          tintB: [0.5, 0.28, 0.22],
          fw: 0.14,
        });
    });
    b.burn(AX0 - 0.3, 6, -488.4, 2.2, 0.8);
    b.burn(104.3, 9.2, AZ1 + 0.2, 1.8, 0.7);
    // door: pointed arch in a brownstone frame, double doors (one hanging off its hinge)
    const DY = STOOP;
    K.lancet(b, DOORX, DY, PZ, 0, 1, 1.9, 3.6, {
      state: "dark",
      surround: "brownstone",
      tintA: TRIM,
      tintB: [0.52, 0.3, 0.24],
      fw: 0.26,
      depth: 0.2,
      mullion: false,
      rose: false,
      sill: false,
    });
    b.boxMM(
      "wood_dark",
      DOORX - 0.92,
      DY,
      PZ + 0.02,
      DOORX - 0.02,
      DY + 2.7,
      PZ + 0.09,
      { tint: [0.3, 0.22, 0.14] },
    );
    b.box("wood_dark", DOORX + 0.62, DY, PZ + 0.5, 0.9, 2.7, 0.07, {
      yaw: -1.1,
      tint: [0.3, 0.22, 0.14],
    });
    for (const y of [DY + 0.5, DY + 1.9])
      b.boxMM(
        "black_iron",
        DOORX - 0.9,
        y,
        PZ + 0.09,
        DOORX - 0.04,
        y + 0.06,
        PZ + 0.11,
        { tint: [0.15, 0.14, 0.13] },
      );
    // the cast-iron eagle over the door (wings spread)
    const EY = DY + 4.4,
      EZ = PZ + 0.35;
    b.geo("bronze", K.sphereGeo(), {
      x: DOORX,
      y: EY,
      z: EZ,
      sx: 0.22,
      sy: 0.35,
      sz: 0.2,
      tint: [0.2, 0.2, 0.18],
    });
    b.geo("bronze", K.sphereGeo(), {
      x: DOORX,
      y: EY + 0.42,
      z: EZ + 0.05,
      s: 0.13,
      tint: [0.2, 0.2, 0.18],
    });
    b.cyl("gold", DOORX, EY + 0.4, EZ + 0.16, 0.04, 0.0, 0.12, 5, {
      tint: [0.5, 0.42, 0.2],
    });
    for (const e of [-1, 1]) {
      for (let k = 0; k < 4; k++)
        b.box(
          "bronze",
          DOORX + e * (0.35 + k * 0.22),
          EY + 0.12 + k * 0.1 - k * k * 0.03,
          EZ,
          0.26,
          0.5 - k * 0.08,
          0.05,
          { yaw: 0, tint: [0.2, 0.2, 0.18] },
        );
    }
    b.box("brownstone", DOORX, EY - 0.62, EZ - 0.1, 1.1, 0.24, 0.5, {
      tint: TRIM,
    });
    K.letters(b, DOORX, DY + 6.1, PZ + 0.03, 0, 1, 3.6, 0.55, "ARSENAL", {
      fg: "#e8dcc0",
      font: "Georgia, serif",
    });
    K.letters(b, DOORX, DY + 5.65, PZ + 0.03, 0, 1, 2.4, 0.28, "MDCCCXLVIII", {
      fg: "#d8ccb0",
      font: "Georgia, serif",
    });
    // stoop + steps + the cannon newels + railings
    b.boxMM("brownstone", 96.9, -0.4, PZ, 101.1, DY, PZ + 1.3, { tint: TRIM });
    b.col(96.9, -0.4, PZ, 101.1, DY, PZ + 1.3, {
      tag: "stoop",
      surface: "concrete",
    });
    K.stairs(b, 97.1, PZ + 1.3, 100.9, PZ + 3.9, 0, DY, "-z", {
      mat: "brownstone",
      tint: TRIM,
      solid: true,
    });
    for (const x of [96.75, 101.25]) {
      b.boxMM("brownstone", x - 0.35, 0, PZ + 3.4, x + 0.35, 0.7, PZ + 4.1, {
        tint: TRIM,
      });
      b.cyl("black_iron", x, 0.7, PZ + 3.75, 0.2, 0.16, 1.15, 10, {
        tint: [0.14, 0.14, 0.13],
      }); // barrel (muzzle up)
      b.cyl("black_iron", x, 1.8, PZ + 3.75, 0.2, 0.2, 0.1, 10, {
        tint: [0.14, 0.14, 0.13],
      }); // muzzle ring
      b.geo("black_iron", K.sphereGeo(), {
        x,
        y: 0.72,
        z: PZ + 3.75,
        s: 0.19,
        tint: [0.14, 0.14, 0.13],
      });
      b.col(x - 0.35, 0, PZ + 3.4, x + 0.35, 1.9, PZ + 4.1, {
        tag: "newel",
        walkable: false,
      });
      K.railing(b, x, PZ + 1.3, x, PZ + 0.1, DY, {
        h: 0.95,
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.2,
      });
      b.beam(
        "black_iron",
        x,
        DY + 0.95,
        PZ + 1.3,
        x,
        1.9,
        PZ + 3.4,
        0.05,
        0.05,
        { tint: [0.14, 0.14, 0.13] },
      );
      for (let k = 1; k < 6; k++) {
        const t = k / 6,
          zz = PZ + 1.3 + 2.1 * t,
          yb = DY * (1 - Math.min(1, Math.floor(t * 4 + 0.5) / 4));
        b.beam(
          "black_iron",
          x,
          yb,
          zz,
          x,
          DY + 0.95 + (1.9 - DY - 0.95) * t,
          zz,
          0.025,
          0.025,
          { tint: [0.14, 0.14, 0.13] },
        );
      }
    }
    for (const x of [97.4, 100.6])
      for (let k = 0; k < 3; k++)
        b.geo("black_iron", K.sphereGeo(), {
          x: x + (k - 1) * 0.12,
          y: 0.08,
          z: PZ + 4.3 + (k % 2) * 0.1,
          s: 0.08,
          tint: [0.14, 0.14, 0.13],
        }); // cannonball pyramids
    // signs: Parks Department + the Army's claim on the building
    b.plate(
      "art",
      93.7,
      1.2,
      AZ1 + 0.14,
      0,
      1,
      1.6,
      0.9,
      K.signCell(
        "ppk_parks_hq",
        "CITY OF NEW YORK\nDEPARTMENT OF PARKS\nTHE ARSENAL",
        320,
        180,
        {
          bg: "#2d4a2e",
          fg: "#e8e0c8",
          font: "Georgia, serif",
          border: "#e8e0c8",
        },
      ),
    );
    d.plate(
      "art",
      104.5,
      1.05,
      -472.15,
      0,
      1,
      3.2,
      0.5,
      K.signCell(
        "ppk_army_banner",
        "U.S. ARMY · CIVIL DEFENSE DEPOT 14 · AUTHORIZED PERSONNEL",
        768,
        96,
        {
          bg: "#3a4028",
          fg: "#e8e0c0",
          font: "Arial Black, Arial, sans-serif",
        },
      ),
      { off: 0.02 },
    );
    b.plate(
      "decal",
      104.3,
      2.2,
      AZ1 + 0.13,
      0,
      1,
      2.8,
      1.0,
      K.tag("NOAH LIED", "#d8d0b8", 320, 110),
    );
    b.plate(
      "decal",
      AX0 - 0.02,
      2.4,
      -490.5,
      -1,
      0,
      3.0,
      1.1,
      K.tag("ZOO CLOSED - ANIMALS LOOSE", "#c02818", 420, 110),
    );
    // flagpole on the pavilion with a rag of a flag
    b.pipe("steel", DOORX, PH, PZ - 0.7, DOORX, PH + 5.5, PZ - 0.7, 0.04, 6, {
      tint: [0.55, 0.55, 0.52],
    });
    d.quadN(
      "fabric",
      [DOORX, PH + 4.2, PZ - 0.7],
      [DOORX + 1.6, PH + 4.0, PZ - 0.5],
      [DOORX + 1.5, PH + 5.1, PZ - 0.55],
      [DOORX, PH + 5.4, PZ - 0.7],
      [0, 0, 1],
      { tint: [0.55, 0.3, 0.26] },
    );
    // rooftop clutter: vent stacks, a rusted Army aerial
    for (const [x, z] of [
      [93, -490],
      [104, -486],
    ]) {
      b.boxMM("brick_red", x - 0.5, AH, z - 0.5, x + 0.5, AH + 1.8, z + 0.5, {
        tint: BRICK.map((v) => v * 0.8),
      });
      b.burn(x, AH + 1.8, z, 0.7, 0.8);
    }
    for (let k = 0; k < 4; k++)
      b.pipe(
        "rust",
        99 + k * 0.1,
        AH,
        -489,
        99.3 + k * 0.4,
        AH + 4 + k * 0.5,
        -489.4,
        0.02 + (3 - k) * 0.008,
        4,
      );

    // Parks Dept. wayfinding sign at the Fifth Avenue gate (the gap in the park wall at 64th St) — the way in from the avenue
    for (const z of [-477.9, -476.3])
      b.beam("wood_dark", 108.7, 0, z, 108.7, 2.3, z, 0.09, 0.09, {
        tint: [0.28, 0.2, 0.12],
      });
    b.boxMM("wood_dark", 108.62, 1.25, -478.1, 108.78, 2.2, -476.1, {
      tint: [0.3, 0.22, 0.14],
    });
    b.plate(
      "art",
      108.8,
      1.72,
      -477.1,
      1,
      0,
      1.9,
      0.86,
      K.signCell(
        "ppk_gate_sign",
        "THE ARSENAL\nCENTRAL PARK ZOO ►\nDept. of Parks & Recreation",
        300,
        136,
        {
          bg: "#3a2a18",
          fg: "#e8dcb8",
          font: "Georgia, serif",
          border: "#c8b890",
        },
      ),
      { off: 0.0 },
    );
    b.plate(
      "art",
      108.6,
      1.72,
      -477.1,
      -1,
      0,
      1.9,
      0.86,
      K.signCell(
        "ppk_gate_sign_b",
        "FIFTH AVENUE\n◄ 64th Street Gate",
        300,
        136,
        {
          bg: "#3a2a18",
          fg: "#e8dcb8",
          font: "Georgia, serif",
          border: "#c8b890",
        },
      ),
      { off: 0.0 },
    );
    b.col(108.55, 0, -478.1, 108.85, 2.3, -476.1, {
      tag: "sign",
      walkable: false,
    });
    // ============================================================ PLAZA (Arsenal forecourt)
    const pz0 = -479.4,
      pz1 = WZ + 0.2;
    b.quadGrid(
      "granite",
      [driveEdge(pz1), 0.03, pz1],
      [109.3, 0.03, pz1],
      [109.3, 0.03, pz0],
      [driveEdge(pz0), 0.03, pz0],
      { tint: [0.56, 0.54, 0.5], uv: "top", seg: 3 },
    );
    b.quadGrid(
      "granite",
      [driveEdge(-479.4), 0.03, -479.4],
      [109.3, 0.03, -479.4],
      [109.3, 0.03, -481.2],
      [driveEdge(-481.2), 0.03, -481.2],
      { tint: [0.52, 0.5, 0.46], uv: "top", seg: 3 },
    );
    // Army checkpoint: sandbag horseshoe, sawhorse barrier, toppled searchlight, a dead red beacon
    for (let k = 0; k < 7; k++) {
      const a = -0.2 + k * 0.5,
        x = 104.5 + Math.cos(a) * 2.2,
        z = -474.5 + Math.sin(a) * 2.0;
      for (let j = 0; j < 3; j++)
        d.box("fabric", x, j * 0.28, z, 0.85, 0.3, 0.45, {
          yaw: -a + HP + (j % 2) * 0.2,
          tint: [0.52, 0.48, 0.36],
        });
      b.ocol(x, z, 0.85, 0.45, 0, 0.84, -a + HP, {
        tag: "sandbags",
        surface: "dirt",
        walkable: true,
      });
    }
    d.beam("wood", 90.5, 0.9, -475.5, 93.8, 0.9, -474.8, 0.12, 0.25, {
      tint: [0.7, 0.62, 0.35],
    });
    for (const [x, z] of [
      [90.7, -475.5],
      [93.6, -474.8],
    ]) {
      d.beam("wood", x - 0.3, 0, z, x, 0.9, z, 0.08, 0.08);
      d.beam("wood", x + 0.3, 0, z, x, 0.9, z, 0.08, 0.08);
    }
    d.plate(
      "art",
      92.2,
      0.9,
      -475.1,
      0.2,
      1,
      1.4,
      0.24,
      K.signCell("ppk_army_stop", "HALT · MILITARY ZONE", 320, 56, {
        bg: "#c8b040",
        fg: "#1a1a1a",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.08 },
    );
    d.cyl("metal_dark", 106.6, 0, -471.5, 0.5, 0.5, 0.2, 10, {
      tint: [0.3, 0.33, 0.28],
    });
    d.geo(
      "metal_dark",
      new THREE.CylinderGeometry(0.55, 0.45, 0.8, 12, 1, true),
      {
        x: 106.3,
        y: 0.5,
        z: -472.2,
        rx: 1.3,
        rz: 0.4,
        tint: [0.3, 0.33, 0.28],
      },
    );
    d.geo("glass", new THREE.CircleGeometry(0.5, 12), {
      x: 106.1,
      y: 0.62,
      z: -472.6,
      rx: -0.3,
      ry: 0.4,
      tint: [0.4, 0.44, 0.4],
    });
    b.col(105.8, 0, -472.8, 107.2, 0.8, -471.1, {
      tag: "searchlight",
      walkable: false,
      surface: "metal",
    });
    d.pipe("steel", 102.9, 0, -475.5, 102.9, 1.4, -475.5, 0.03, 5);
    d.cyl("glass", 102.9, 1.4, -475.5, 0.1, 0.1, 0.16, 8, {
      tint: [0.5, 0.15, 0.1],
    });
    lit.geo("lamp", K.sphereGeo(), {
      x: 102.9,
      y: 1.48,
      z: -475.5,
      s: 0.09,
      tint: [1, 0.12, 0.05],
    });
    lit.glow(102.9, 1.5, -475.5, [0.9, 0.1, 0.05], 1.6);
    // benches + park lamps round the plaza
    for (const [x, z, yaw] of [
      [89.8, -472.4, HP],
      [107.3, -477.4, -HP],
    ]) {
      park_bench(d, b, x, z, yaw);
    }
    K.parkLamp(b, null, 94.2, 0, -472.3, { broken: true });
    K.parkLamp(b, null, 106.5, 0, -478.2, {});
    K.litter(d, 90, -478.5, 107, -471, 0.03, 14, 7101);
    d.hplate("decal", 99, 0.04, -474, 3.2, 3.2, 0.4, K.decal("scorch", 3));
    d.hplate("decal", 96, 0.04, -477, 1.6, 1.6, 1.2, K.decal("blood", 5));

    // ============================================================ ZOO WALLS
    const WH = 2.6;
    const brickWall = (ax, az, bx, bz, h, gaps) => {
      K.segWall(b, ax, az, bx, bz, 0, h, 1, {
        mat: "brick_red",
        tint: BRICK.map((v) => v * 0.92),
        both: true,
        trim: false,
        off: 0.18,
        gaps,
        col: true,
      });
      const len = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / len,
        uz = (bz - az) / len;
      let t = 0;
      const gs = (gaps || []).slice().sort((p, q) => p.t - q.t);
      const cap = (t0, t1) => {
        if (t1 - t0 < 0.05) return;
        b.box(
          "limestone",
          ax + (ux * (t0 + t1)) / 2,
          h,
          az + (uz * (t0 + t1)) / 2,
          t1 - t0,
          0.14,
          0.5,
          { yaw: Math.atan2(-uz, ux), tint: LIME, faces: "nsewtb" },
        );
      };
      for (const g of gs) {
        cap(t, g.t - g.w / 2);
        t = g.t + g.w / 2;
      }
      cap(t, len);
      for (let s = 0; s < len; s += 4.5) {
        const px = ax + ux * s,
          pz = az + uz * s;
        if (gs.some((g) => Math.abs(s - g.t) < g.w / 2 + 0.3)) continue;
        b.box("brick_red", px, 0, pz, 0.6, h + 0.35, 0.6, {
          yaw: Math.atan2(-uz, ux),
          tint: BRICK.map((v) => v * 0.8),
        });
        b.box("limestone", px, h + 0.35, pz, 0.72, 0.12, 0.72, {
          yaw: Math.atan2(-uz, ux),
          tint: LIME,
        });
      }
    };
    const WX0 = driveEdge(WZ) + 0.4;
    brickWall(WX0, WZ, EX, WZ, WH, [{ t: CLK.x - WX0, w: 3.0, y1: 4.0 }]);
    brickWall(EX, WZ, EX, SZ, WH, []);
    const SX0 = driveEdge(SZ) + 0.4;
    brickWall(EX, SZ, SX0, SZ, WH, [{ t: EX - SGATE.x, w: 3.2, y1: 4.4 }]);
    // west: iron fence on a low brick curb along the drive
    const fa = [SX0, SZ],
      fb = [WX0, WZ];
    K.segWall(b, fa[0], fa[1], fb[0], fb[1], 0, 0.55, 1, {
      mat: "brick_red",
      tint: BRICK.map((v) => v * 0.85),
      both: true,
      trim: false,
      off: 0.15,
      col: true,
    });
    K.ironFence(b, fa[0], fa[1], fb[0], fb[1], 0.55, {
      h: 1.6,
      step: 0.16,
      bent: true,
    });

    // ============================================================ DELACORTE CLOCK (north gate)
    const CX = CLK.x,
      CZ = CLK.z;
    for (const e of [-1, 1]) {
      const px = CX + e * 2.05;
      b.boxMM("brick_red", px - 0.55, 0, CZ - 0.7, px + 0.55, 4.2, CZ + 0.7, {
        tint: BRICK,
      });
      b.col(px - 0.55, 0, CZ - 0.7, px + 0.55, 4.2, CZ + 0.7, { tag: "pier" });
      b.boxMM(
        "limestone",
        px - 0.65,
        4.0,
        CZ - 0.8,
        px + 0.65,
        4.25,
        CZ + 0.8,
        { tint: LIME },
      );
      b.boxMM("limestone", px - 0.62, 0, CZ - 0.78, px + 0.62, 0.5, CZ + 0.78, {
        tint: LIME,
      });
    }
    // arch soffit + spandrel slab carrying the clock
    for (let i = 0; i < 10; i++) {
      const a0 = (PI * i) / 10,
        a1 = (PI * (i + 1)) / 10;
      b.beam(
        "limestone",
        CX + Math.cos(a0) * 1.5,
        3.0 + Math.sin(a0) * 0.9,
        CZ,
        CX + Math.cos(a1) * 1.5,
        3.0 + Math.sin(a1) * 0.9,
        CZ,
        0.3,
        1.3,
        { tint: LIME },
      );
    }
    b.boxMM("brick_red", CX - 1.5, 3.9, CZ - 0.7, CX + 1.5, 4.2, CZ + 0.7, {
      tint: BRICK,
    });
    b.boxMM("limestone", CX - 2.7, 4.2, CZ - 1.9, CX + 2.7, 4.45, CZ + 1.9, {
      tint: LIME,
      faces: "nsewtb",
    }); // the turntable deck
    b.col(CX - 2.7, 3.9, CZ - 1.9, CX + 2.7, 4.45, CZ + 1.9, { tag: "clock" });
    // clock tower block
    b.boxMM("brick_red", CX - 0.8, 4.45, CZ - 0.8, CX + 0.8, 6.6, CZ + 0.8, {
      tint: BRICK,
    });
    b.boxMM("limestone", CX - 0.95, 6.6, CZ - 0.95, CX + 0.95, 6.8, CZ + 0.95, {
      tint: LIME,
    });
    const dial = K.clockCell("delacorte", { hour: 9, minute: 47 });
    for (const [nx, nz] of [
      [0, 1],
      [0, -1],
    ])
      b.plate("art", CX, 5.6, CZ + nz * 0.81, nx, nz, 1.2, 1.2, dial, {
        off: 0.02,
      });
    for (const [nx, nz] of [
      [1, 0],
      [-1, 0],
    ])
      b.plate("art", CX + nx * 0.81, 5.6, CZ, nx, nz, 1.0, 1.0, dial, {
        off: 0.02,
      });
    // bell frame, bell and the two hammering monkeys
    for (const e of [-1, 1])
      b.beam(
        "black_iron",
        CX + e * 0.7,
        6.8,
        CZ,
        CX + e * 0.35,
        8.1,
        CZ,
        0.06,
        0.06,
        { tint: [0.2, 0.2, 0.18] },
      );
    b.beam("black_iron", CX - 0.4, 8.1, CZ, CX + 0.4, 8.1, CZ, 0.08, 0.08, {
      tint: [0.2, 0.2, 0.18],
    });
    b.cyl("bronze", CX, 7.35, CZ, 0.38, 0.14, 0.6, 12, {
      tint: [0.42, 0.5, 0.38],
      bottom: true,
    });
    b.geo("bronze", K.sphereGeo(), {
      x: CX,
      y: 7.35,
      z: CZ,
      sx: 0.39,
      sy: 0.08,
      sz: 0.39,
      tint: [0.42, 0.5, 0.38],
    });
    K.critter(b, "monkey", CX - 0.75, 6.8, CZ, HP, 0.8);
    K.critter(b, "monkey", CX + 0.75, 6.8, CZ, -HP, 0.8);
    // the animal band on its turntable (separate mesh so it can turn when the clock plays)
    const band = [
      ["bear", 0.95],
      ["elephant", 0.72],
      ["hippo", 0.8],
      ["goat", 0.85],
      ["kangaroo", 0.9],
      ["penguin", 0.9],
      ["sheep", 0.8],
    ];
    band.forEach(([kind, s], i) => {
      const a = (i / band.length) * PI * 2,
        R = 1.75;
      K.critter(ring, kind, Math.cos(a) * R, 4.45, -Math.sin(a) * R, a + PI, s);
    });
    ring.geo("bronze", new THREE.TorusGeometry(1.75, 0.04, 4, 32), {
      x: 0,
      y: 4.47,
      z: 0,
      rx: HP,
      tint: [0.35, 0.4, 0.32],
    });
    K.letters(b, CX, 3.55, CZ + 0.72, 0, 1, 2.6, 0.3, "DELACORTE CLOCK", {
      fg: "#e8dcc0",
      font: "Georgia, serif",
    });
    // north side of the arch (plaza face): zoo name
    K.letters(b, CX, 3.55, CZ - 0.72, 0, -1, 2.8, 0.34, "CENTRAL PARK ZOO", {
      fg: "#e8dcc0",
      font: "Georgia, serif",
    });

    // ============================================================ SEA LION POOL
    const PR = POOL.r;
    K.ringWall(
      b,
      "limestone",
      POOL.x,
      POOL.z,
      PR,
      0,
      1.15,
      0,
      PI * 2,
      28,
      false,
      { tint: LIME, col: true },
    );
    K.ringWall(
      b,
      "limestone",
      POOL.x,
      POOL.z,
      PR - 0.35,
      0.2,
      1.15,
      0,
      PI * 2,
      28,
      true,
      { tint: LIME.map((v) => v * 0.8), col: false },
    );
    for (let i = 0; i < 28; i++) {
      const a0 = (i / 28) * PI * 2,
        a1 = ((i + 1) / 28) * PI * 2;
      const P = (a, rr) => [
        POOL.x + Math.cos(a) * rr,
        1.15,
        POOL.z - Math.sin(a) * rr,
      ];
      b.quadN(
        "limestone",
        P(a0, PR - 0.35),
        P(a1, PR - 0.35),
        P(a1, PR + 0.08),
        P(a0, PR + 0.08),
        [0, 1, 0],
        { tint: LIME },
      );
    }
    b.cyl("glass", POOL.x, 0.0, POOL.z, PR - 0.35, PR - 0.35, 0.55, 28, {
      tint: [0.13, 0.2, 0.15],
      grime: 0.2,
    });
    d.hplate(
      "decal",
      POOL.x + 1,
      0.56,
      POOL.z - 1,
      6,
      6,
      0.3,
      K.decal("grime", 9),
      { tint: [0.6, 0.7, 0.5] },
    );
    K.rock(b, POOL.x + 1.2, 0.2, POOL.z + 0.6, 1.9, 1.5, 1.5, {
      seed: 3,
      tint: [0.56, 0.54, 0.5],
      col: false,
    });
    K.rock(b, POOL.x - 2.2, 0.2, POOL.z - 1.8, 1.3, 1.0, 1.1, {
      seed: 4,
      tint: [0.52, 0.5, 0.46],
      col: false,
    });
    // a sea-lion skeleton sunning on the big rock
    for (let k = 0; k < 9; k++)
      d.geo("bone", K.sphereGeo(), {
        x: POOL.x + 0.7 + k * 0.16,
        y: 1.7 - k * 0.04,
        z: POOL.z + 0.5 + Math.sin(k) * 0.05,
        sx: 0.08,
        sy: 0.06,
        sz: 0.1,
        tint: [0.82, 0.78, 0.66],
      });
    for (let k = 0; k < 6; k++)
      d.pipe(
        "bone",
        POOL.x + 0.9 + k * 0.18,
        1.72,
        POOL.z + 0.5,
        POOL.x + 0.95 + k * 0.18,
        1.45,
        POOL.z + 0.85,
        0.015,
        3,
        { tint: [0.82, 0.78, 0.66] },
      );
    d.geo("bone", K.sphereGeo(), {
      x: POOL.x + 0.5,
      y: 1.72,
      z: POOL.z + 0.48,
      sx: 0.14,
      sy: 0.1,
      sz: 0.2,
      tint: [0.84, 0.8, 0.68],
    });
    d.plate(
      "art",
      POOL.x,
      1.45,
      POOL.z + PR + 0.1,
      0,
      1,
      1.3,
      0.55,
      K.signCell(
        "ppk_sealions",
        "CALIFORNIA SEA LIONS\nFeedings 11 · 2 · 4\nPLEASE DO NOT FEED",
        256,
        110,
        { bg: "#1e3a4a", fg: "#e8e0c8", font: "Georgia, serif" },
      ),
    );
    // bench ring and the stroller family (skeletons are props)
    for (const a of [3.0, 3.6, 4.3, 5.0])
      park_bench(
        d,
        b,
        POOL.x + Math.cos(a) * (PR + 2.4),
        POOL.z - Math.sin(a) * (PR + 2.4),
        a + HP,
      );

    // ============================================================ EAST ARCADE (glass-roofed brick colonnade)
    const AR0 = -468.5,
      AR1 = -445.6,
      ARX = 104.3,
      ARH = 3.8;
    b.face("granite", ARX, 0.04, AR1, 1, 0, 0, 0, 0, -1, EX - ARX, AR1 - AR0, {
      uv: "top",
      tint: [0.5, 0.48, 0.44],
    });
    for (let z = AR0; z <= AR1 + 0.01; z += (AR1 - AR0) / 7) {
      b.boxMM("brick_red", ARX - 0.3, 0, z - 0.3, ARX + 0.3, ARH, z + 0.3, {
        tint: BRICK,
      });
      b.boxMM(
        "limestone",
        ARX - 0.38,
        ARH - 0.25,
        z - 0.38,
        ARX + 0.38,
        ARH,
        z + 0.38,
        { tint: LIME },
      );
      b.col(ARX - 0.3, 0, z - 0.3, ARX + 0.3, ARH, z + 0.3, {
        tag: "pier",
        walkable: false,
      });
    }
    b.boxMM(
      "limestone",
      ARX - 0.35,
      ARH,
      AR0 - 0.35,
      ARX + 0.35,
      ARH + 0.35,
      AR1 + 0.35,
      { tint: LIME, faces: "nsewtb" },
    );
    b.boxMM(
      "limestone",
      EX - 0.35,
      ARH,
      AR0 - 0.35,
      EX,
      ARH + 0.35,
      AR1 + 0.35,
      { tint: LIME, faces: "nsewtb" },
    );
    // glass roof: steel glazing bars; most panes gone
    for (let z = AR0; z <= AR1; z += 1.2)
      d.beam("steel", ARX, ARH + 0.35, z, EX, ARH + 1.3, z, 0.06, 0.1, {
        tint: [0.4, 0.42, 0.4],
      });
    d.beam(
      "steel",
      ARX + (EX - ARX) / 2,
      ARH + 0.83,
      AR0,
      ARX + (EX - ARX) / 2,
      ARH + 0.83,
      AR1,
      0.08,
      0.08,
      { tint: [0.4, 0.42, 0.4] },
    );
    for (let z = AR0; z < AR1 - 1.2; z += 1.2)
      if (r() < 0.35)
        d.quadN(
          "glass",
          [ARX, ARH + 0.36, z + 1.2],
          [EX, ARH + 1.31, z + 1.2],
          [EX, ARH + 1.31, z],
          [ARX, ARH + 0.36, z],
          [-0.7, 1, 0],
          { tint: [0.45, 0.5, 0.48] },
        );
    // habitat windows in the east wall: dark glass over painted dioramas
    const habs = [
      ["EDGE OF THE ICE PACK", "#2a5a7a"],
      ["RAINFOREST", "#2a4a2a"],
      ["TEMPERATE TERRITORY", "#5a4a2a"],
      ["SNOW LEOPARD", "#6a7078"],
    ];
    habs.forEach(([name, col], i) => {
      const z = AR0 + 3.2 + i * 6.4;
      const rect = K.paint(
        "pics",
        "ppk_hab_" + i,
        256,
        128,
        function (x, X, Y, W2, H2) {
          const g = x.createLinearGradient(0, Y, 0, Y + H2);
          g.addColorStop(0, col);
          g.addColorStop(1, "#101410");
          x.fillStyle = g;
          x.fillRect(X, Y, W2, H2);
          const rr = K.rng("hab" + i);
          x.fillStyle = "rgba(220,220,210,0.35)";
          for (let k = 0; k < 7; k++) {
            x.beginPath();
            x.ellipse(
              X + rr() * W2,
              Y + H2 * (0.6 + rr() * 0.3),
              10 + rr() * 30,
              6 + rr() * 10,
              0,
              0,
              PI * 2,
            );
            x.fill();
          }
          x.fillStyle = "rgba(10,10,10,0.5)";
          x.fillRect(X, Y + H2 * 0.85, W2, H2 * 0.15);
          K.stains(x, X, Y, W2, H2, 8, i + 40, 0.5, [30, 30, 20]);
        },
      );
      b.plate("pics", EX - 0.19, 1.6, z, -1, 0, 3.8, 1.9, rect, {
        off: 0.01,
        tint: [0.55, 0.55, 0.52],
      });
      b.plate("glass", EX - 0.19, 1.6, z, -1, 0, 3.8, 1.9, null, {
        off: 0.03,
        tint: [0.25, 0.3, 0.3],
        grime: 0.4,
      });
      b.boxMM(
        "limestone",
        EX - 0.32,
        0.55,
        z - 2.05,
        EX - 0.18,
        0.65,
        z + 2.05,
        { tint: LIME },
      );
      b.plate(
        "art",
        EX - 0.19,
        2.95,
        z,
        -1,
        0,
        2.6,
        0.32,
        K.signCell("ppk_habsign_" + i, name, 480, 60, {
          bg: "#1a2a2a",
          fg: "#e0d8c0",
          font: "Georgia, serif",
        }),
        { off: 0.03 },
      );
      if (i === 1)
        d.plate(
          "decal",
          EX - 0.19,
          1.3,
          z + 0.6,
          -1,
          0,
          1.6,
          1.4,
          K.decal("crack", 2),
          { off: 0.04 },
        );
    });

    // ============================================================ MONKEY HOUSE (WPA, south side)
    const MX0 = 92.6,
      MX1 = EX - 0.2,
      MZ0 = -441.3,
      MZ1 = SZ - 0.2,
      MH = 5.2;
    b.face("brick_red", MX1, 0, MZ0, -1, 0, 0, 0, 1, 0, MX1 - MX0, MH, {
      tint: BRICK.map((v) => v * 1.05),
    });
    b.face("brick_red", MX0, 0, MZ0, 0, 0, 1, 0, 1, 0, MZ1 - MZ0, MH, {
      tint: BRICK,
    });
    b.face(
      "concrete_dark",
      MX0,
      MH,
      MZ1,
      1,
      0,
      0,
      0,
      0,
      -1,
      MX1 - MX0,
      MZ1 - MZ0,
      { uv: "top", tint: [0.32, 0.3, 0.28] },
    );
    b.face("brick_red", MX0, 0, MZ1, 1, 0, 0, 0, 1, 0, MX1 - MX0, MH, {
      tint: BRICK.map((v) => v * 0.85),
    });
    b.face("brick_red", MX1, 0, MZ1, 0, 0, -1, 0, 1, 0, MZ1 - MZ0, MH, {
      tint: BRICK.map((v) => v * 0.9),
    });
    b.boxMM(
      "limestone",
      MX0 - 0.1,
      MH - 0.2,
      MZ1 - 0.1,
      MX1,
      MH + 0.35,
      MZ1 + 0.25,
      { tint: LIME },
    );
    b.col(MX0, 0, MZ0, MX1, MH, MZ1, { tag: "building" });
    b.boxMM(
      "limestone",
      MX0 - 0.1,
      MH - 0.2,
      MZ0 - 0.25,
      MX1,
      MH + 0.35,
      MZ0 + 0.1,
      { tint: LIME },
    );
    // the animal frieze (bas-relief band in limestone)
    b.boxMM("limestone", MX0, 3.4, MZ0 - 0.12, MX1, 4.5, MZ0, { tint: LIME });
    const fr = [
      "lion",
      "elephant",
      "bear",
      "goat",
      "hippo",
      "kangaroo",
      "monkey",
      "penguin",
    ];
    for (let k = 0; k < 9; k++)
      K.critter(
        b,
        fr[k % fr.length],
        MX0 + 1.0 + k * 1.65,
        3.55,
        MZ0 - 0.18,
        -HP,
        0.62,
        { mat: "limestone", tint: LIME.map((v) => v * 0.95) },
      );
    K.letters(
      b,
      (MX0 + MX1) / 2,
      4.85,
      MZ0 - 0.26,
      0,
      -1,
      4.6,
      0.36,
      "MONKEY HOUSE",
      { fg: "#3a3028", font: "Georgia, serif", shadow: false },
    );
    // three cages in front (bars + concrete floor + dead climbing tree), one sprung open
    for (let k = 0; k < 3; k++) {
      const x0 = MX0 + 0.4 + k * 5.0,
        x1 = x0 + 4.6,
        zf = MZ0 - 3.1;
      b.boxMM("concrete", x0, 0, zf, x1, 0.25, MZ0, {
        tint: [0.6, 0.58, 0.54],
      });
      b.col(x0, 0, zf, x1, 0.25, MZ0, {
        tag: "cage_floor",
        surface: "concrete",
      });
      K.bars(b, x0, zf, x1, zf, 0.25, 3.1, {
        gap: k === 1 ? { t: 2.7, w: 1.4 } : undefined,
        bent: k === 2 ? [1.3, 1.45, 3.9] : [],
      });
      K.bars(b, x0, zf, x0, MZ0, 0.25, 3.1, {});
      if (k === 2) K.bars(b, x1, zf, x1, MZ0, 0.25, 3.1, {});
      b.boxMM("black_iron", x0, 3.3, zf, x1, 3.36, MZ0, {
        tint: [0.2, 0.19, 0.18],
        faces: "nsewtb",
      });
      K.deadTree(d, x0 + 1.4 + k * 0.6, 0.25, zf + 1.5, 3.0, 300 + k);
      if (k === 1) {
        b.box("black_iron", x0 + 2.2, 0.25, zf - 0.6, 1.4, 2.8, 0.05, {
          yaw: 0.9,
          tint: [0.2, 0.19, 0.18],
        });
      }
      for (let j = 0; j < 4; j++)
        d.hplate(
          "decal",
          x0 + 0.6 + r() * 4,
          0.27,
          zf + 0.4 + r() * 2.4,
          0.9,
          0.9,
          r() * 6,
          K.decal(j % 2 ? "grime" : "blood", j + k * 3),
        );
    }
    b.plate(
      "decal",
      MX0,
      1.7,
      (MZ0 + MZ1) / 2,
      -1,
      0,
      3.2,
      1.0,
      K.tag("THEY GOT OUT", "#d8d0b8", 320, 110),
      { off: 0.02 },
    );

    // ============================================================ TROPIC ZONE rotunda (ruin)
    const TX = TROP.x,
      TZ = TROP.z,
      TR = TROP.r;
    K.ringWall(
      b,
      "brick_red",
      TX,
      TZ,
      TR,
      0,
      0.85,
      0.35,
      PI * 2 - 0.35,
      18,
      false,
      { tint: BRICK, col: true },
    );
    K.ringWall(
      b,
      "brick_red",
      TX,
      TZ,
      TR - 0.3,
      0,
      0.85,
      0.35,
      PI * 2 - 0.35,
      18,
      true,
      { tint: BRICK.map((v) => v * 0.8), col: false },
    );
    for (let i = 0; i < 18; i++) {
      const a0 = 0.35 + (i / 18) * (PI * 2 - 0.7),
        a1 = 0.35 + ((i + 1) / 18) * (PI * 2 - 0.7);
      const P = (a, rr) => [TX + Math.cos(a) * rr, 0.85, TZ - Math.sin(a) * rr];
      b.quadN(
        "limestone",
        P(a0, TR - 0.32),
        P(a1, TR - 0.32),
        P(a1, TR + 0.05),
        P(a0, TR + 0.05),
        [0, 1, 0],
        { tint: LIME },
      );
    }
    // steel ribs (two collapsed), ring beams, a few surviving panes
    const DH = 5.6;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * PI * 2;
      if (i === 3 || i === 4) {
        d.pipe(
          "steel",
          TX + Math.cos(a) * TR,
          0.85,
          TZ - Math.sin(a) * TR,
          TX + Math.cos(a) * (TR + 1.8),
          0.3,
          TZ - Math.sin(a) * (TR + 2.2),
          0.05,
          5,
          { tint: [0.45, 0.47, 0.45] },
        );
        continue;
      }
      let px = TX + Math.cos(a) * TR,
        py = 0.85,
        pz = TZ - Math.sin(a) * TR;
      for (let k = 1; k <= 6; k++) {
        const t = k / 6,
          rr = TR * Math.cos(t * HP),
          yy = 0.85 + (DH - 0.85) * Math.sin(t * HP);
        const qx = TX + Math.cos(a) * rr,
          qz = TZ - Math.sin(a) * rr;
        d.pipe("steel", px, py, pz, qx, yy, qz, 0.045, 5, {
          tint: [0.45, 0.47, 0.45],
        });
        if (k < 5 && r() < 0.18) {
          const a2 = a + (PI * 2) / 10;
          d.quadN(
            "glass",
            [px, py, pz],
            [
              TX + Math.cos(a2) * TR * Math.cos(((k - 1) / 6) * HP),
              py,
              TZ - Math.sin(a2) * TR * Math.cos(((k - 1) / 6) * HP),
            ],
            [TX + Math.cos(a2) * rr, yy, TZ - Math.sin(a2) * rr],
            [qx, yy, qz],
            [Math.cos(a + 0.3), 0.5, -Math.sin(a + 0.3)],
            { tint: [0.48, 0.55, 0.5] },
          );
        }
        px = qx;
        py = yy;
        pz = qz;
      }
    }
    for (const t of [0.35, 0.7])
      d.geo(
        "steel",
        new THREE.TorusGeometry(TR * Math.cos(t * HP), 0.04, 4, 24),
        {
          x: TX,
          y: 0.85 + (DH - 0.85) * Math.sin(t * HP),
          z: TZ,
          rx: HP,
          tint: [0.45, 0.47, 0.45],
        },
      );
    // shattered glass on the ground, the dead palm, a scorpion burrow
    for (let k = 0; k < 16; k++)
      d.hplate(
        "glass",
        TX + (r() - 0.5) * 9,
        0.04 + k * 0.001,
        TZ + (r() - 0.5) * 9,
        0.3 + r() * 0.5,
        0.2 + r() * 0.4,
        r() * 6,
        null,
        { tint: [0.5, 0.56, 0.52] },
      );
    b.face(
      "dirt",
      TX - TR + 0.3,
      0.05,
      TZ + TR - 0.3,
      1,
      0,
      0,
      0,
      0,
      -1,
      (TR - 0.3) * 2,
      (TR - 0.3) * 2,
      { uv: "top", tint: [0.5, 0.42, 0.32] },
    );
    palm(d, b, TX - 0.8, TZ + 0.6, 6.2, r);
    d.hplate(
      "decal",
      TX + 1.4,
      0.07,
      TZ - 1.2,
      1.6,
      1.6,
      0.5,
      K.decal("scorch", 7),
      { tint: [0.4, 0.35, 0.3] },
    );
    K.rock(d, TX + 1.5, 0, TZ - 1.4, 0.9, 0.5, 0.8, {
      seed: 5,
      tint: [0.45, 0.4, 0.34],
      col: false,
    });
    d.plate(
      "art",
      TX + TR + 0.05,
      1.35,
      TZ,
      1,
      0,
      1.3,
      0.34,
      K.signCell("ppk_tropic", "TROPIC ZONE", 256, 64, {
        bg: "#2a4a2a",
        fg: "#e8e0c0",
        font: "Georgia, serif",
      }),
      { off: 0.03 },
    );

    // ============================================================ POLAR CIRCLE (rock cliffs, moat, keeper's door)
    const PXc = POLAR.x,
      PZc = POLAR.z;
    const rockT = [0.72, 0.72, 0.7];
    const rocks = [
      [-2.5, 2.2, 3.2, 3.6, 2.8],
      [1.4, 3.0, 3.0, 4.2, 2.6],
      [-0.4, 0.2, 2.6, 5.4, 2.4],
      [3.2, 0.8, 2.2, 3.0, 2.0],
      [-3.2, -1.5, 2.4, 3.4, 2.2],
      [0.8, -2.6, 2.2, 2.6, 2.0],
      [-1.2, -3.8, 2.0, 2.2, 1.8],
    ];
    rocks.forEach(([dx, dz, sx, sy, sz], i) => {
      const x = PXc + dx,
        z = PZc + dz;
      if (x - sx * 0.7 < driveEdge(z) + 0.3) return;
      K.rock(b, x, 0, z, sx, sy, sz, {
        seed: 10 + i,
        tint: rockT.map((v) => v * (0.9 + r() * 0.15)),
        walk: false,
      });
    });
    b.col(PXc - 3.4, 0, PZc - 4.8, PXc + 4.6, 4.6, PZc + 5.4, {
      tag: "rock",
      walkable: false,
      surface: "concrete",
    });
    // moat on the visitor (north-east) side behind a glass balustrade
    b.boxMM(
      "concrete",
      PXc + 3.8,
      -0.02,
      PZc - 5.9,
      PXc + 7.2,
      0.35,
      PZc + 3.6,
      { tint: [0.48, 0.5, 0.5] },
    );
    b.boxMM("glass", PXc + 4.2, 0.36, PZc - 5.7, PXc + 6.8, 0.4, PZc + 3.4, {
      tint: [0.06, 0.09, 0.09],
      grime: 0.1,
    });
    b.col(PXc + 3.8, 0, PZc - 5.9, PXc + 7.2, 1.3, PZc + 3.6, {
      tag: "moat",
      walkable: false,
    });
    for (const z of [PZc - 5.9, PZc + 3.6])
      b.boxMM("limestone", PXc + 3.8, 0, z - 0.15, PXc + 7.2, 1.1, z + 0.15, {
        tint: LIME,
      });
    b.boxMM("limestone", PXc + 7.05, 0, PZc - 5.9, PXc + 7.35, 1.1, PZc + 3.6, {
      tint: LIME,
    });
    b.plate("glass", PXc + 7.36, 1.55, PZc - 1.15, 1, 0, 9.4, 0.9, null, {
      tint: [0.4, 0.46, 0.46],
      off: 0.0,
    });
    b.plate(
      "art",
      PXc + 7.5,
      0.6,
      PZc + 1.5,
      1,
      0,
      1.4,
      0.55,
      K.signCell(
        "ppk_polar",
        'POLAR CIRCLE\nUrsus maritimus — "GUS"',
        280,
        110,
        { bg: "#e8e8e0", fg: "#1a2a3a", font: "Georgia, serif" },
      ),
    );
    d.plate(
      "decal",
      PXc + 7.52,
      0.6,
      PZc - 3.2,
      1,
      0,
      1.2,
      1.2,
      K.decal("blood", 11),
      { off: 0.03 },
    );
    // the keeper's door: a steel hatch set in a concrete frame in the rock's north face
    b.boxMM(
      "concrete",
      KEEPER.x - 1.1,
      0,
      KEEPER.z - 0.3,
      KEEPER.x + 1.1,
      2.9,
      KEEPER.z + 0.6,
      { tint: [0.55, 0.55, 0.52] },
    );
    b.boxMM(
      "metal_dark",
      KEEPER.x - 0.6,
      0.05,
      KEEPER.z - 0.33,
      KEEPER.x + 0.6,
      2.2,
      KEEPER.z - 0.3,
      { tint: [0.34, 0.38, 0.34] },
    );
    for (const y of [0.5, 1.75])
      b.boxMM(
        "steel",
        KEEPER.x - 0.55,
        y,
        KEEPER.z - 0.36,
        KEEPER.x + 0.55,
        y + 0.08,
        KEEPER.z - 0.33,
        { tint: [0.55, 0.55, 0.52] },
      );
    b.cyl("steel", KEEPER.x + 0.4, 1.1, KEEPER.z - 0.4, 0.05, 0.05, 0.1, 8);
    b.plate(
      "art",
      KEEPER.x,
      2.5,
      KEEPER.z - 0.32,
      0,
      -1,
      1.5,
      0.35,
      K.signCell("ppk_keeper", "ZOO PERSONNEL ONLY", 320, 72, {
        bg: "#b82818",
        fg: "#f0e8d8",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.02 },
    );
    b.plate(
      "art",
      KEEPER.x - 0.9,
      1.4,
      KEEPER.z - 0.32,
      0,
      -1,
      0.35,
      0.35,
      K.signCell("ppk_rad_keeper", "☢", 64, 64, {
        bg: "#d8c040",
        fg: "#1a1a1a",
        font: "Arial, sans-serif",
      }),
      { off: 0.02 },
    );
    d.hplate(
      "decal",
      KEEPER.x,
      0.04,
      KEEPER.z - 1.6,
      1.8,
      2.4,
      0.2,
      K.decal("blood", 13),
    );

    // ============================================================ SOUTH GATE, KIOSK
    const GX = SGATE.x;
    for (const e of [-1, 1]) {
      const px = GX + e * 2.05;
      b.boxMM("brick_red", px - 0.5, 0, SZ - 0.5, px + 0.5, 4.2, SZ + 0.5, {
        tint: BRICK,
      });
      b.boxMM("limestone", px - 0.6, 4.2, SZ - 0.6, px + 0.6, 4.45, SZ + 0.6, {
        tint: LIME,
      });
      b.geo("limestone", K.sphereGeo(), {
        x: px,
        y: 4.75,
        z: SZ,
        s: 0.3,
        tint: LIME,
      });
      b.col(px - 0.5, 0, SZ - 0.5, px + 0.5, 4.45, SZ + 0.5, { tag: "pier" });
    }
    // iron arch with the name, one gate leaf on the ground, one chained open
    for (let i = 0; i < 12; i++) {
      const a0 = (PI * i) / 12,
        a1 = (PI * (i + 1)) / 12;
      b.beam(
        "black_iron",
        GX + Math.cos(a0) * 1.55,
        4.1 + Math.sin(a0) * 0.8,
        SZ,
        GX + Math.cos(a1) * 1.55,
        4.1 + Math.sin(a1) * 0.8,
        SZ,
        0.07,
        0.07,
        { tint: [0.16, 0.15, 0.14] },
      );
    }
    b.plate(
      "art",
      GX,
      4.35,
      SZ + 0.05,
      0,
      1,
      2.8,
      0.42,
      K.signCell("ppk_zoo_arch", "CENTRAL PARK ZOO", 512, 76, {
        bg: "#1a1a18",
        fg: "#e8d8a8",
        font: "Georgia, serif",
        weather: true,
      }),
      { off: 0.0 },
    );
    b.plate(
      "art",
      GX,
      4.35,
      SZ - 0.05,
      0,
      -1,
      2.8,
      0.42,
      K.signCell("ppk_zoo_arch", "CENTRAL PARK ZOO", 512, 76, {
        bg: "#1a1a18",
        fg: "#e8d8a8",
        font: "Georgia, serif",
        weather: true,
      }),
      { off: 0.0 },
    );
    d.box("black_iron", GX - 1.1, 0.05, SZ + 1.0, 1.5, 0.06, 2.3, {
      yaw: 0.25,
      tint: [0.16, 0.15, 0.14],
    });
    for (let k = 0; k < 9; k++)
      d.pipe(
        "black_iron",
        GX - 1.7 + k * 0.17,
        0.08,
        SZ + 0.1,
        GX - 1.5 + k * 0.17,
        0.08,
        SZ + 2.0,
        0.018,
        4,
        { tint: [0.16, 0.15, 0.14] },
      );
    K.bars(
      b,
      GX + 2.05 - 0.5,
      SZ + 0.1,
      GX + 2.05 - 0.5 - 0.2,
      SZ + 1.5,
      0,
      2.2,
      { step: 0.17, col: false },
    );
    // ticket kiosk (inside the gate)
    const KX = 90.0,
      KZ = -439.2;
    b.boxMM("brick_red", KX - 1.1, 0, KZ - 0.9, KX + 1.1, 1.1, KZ + 0.9, {
      tint: BRICK,
    });
    for (const [x, z] of [
      [KX - 1.05, KZ - 0.85],
      [KX + 1.05, KZ - 0.85],
      [KX - 1.05, KZ + 0.85],
      [KX + 1.05, KZ + 0.85],
    ])
      b.beam("steel", x, 1.1, z, x, 2.5, z, 0.06, 0.06, {
        tint: [0.35, 0.4, 0.35],
      });
    b.boxMM("paint_green", KX - 1.3, 2.5, KZ - 1.1, KX + 1.3, 2.75, KZ + 1.1, {
      tint: [0.24, 0.36, 0.26],
      faces: "nsewtb",
    });
    b.plate("glass", KX - 1.06, 1.8, KZ, -1, 0, 1.6, 1.3, null, {
      tint: [0.4, 0.46, 0.46],
    });
    b.col(KX - 1.1, 0, KZ - 0.9, KX + 1.1, 2.75, KZ + 0.9, { tag: "kiosk" });
    b.plate(
      "art",
      KX - 1.12,
      2.62,
      KZ,
      -1,
      0,
      2.0,
      0.22,
      K.signCell("ppk_admission", "ADMISSION", 320, 40, {
        bg: "#e8e0c8",
        fg: "#1a3a2a",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    b.plate(
      "art",
      KX,
      1.9,
      KZ + 0.92,
      0,
      1,
      1.2,
      0.8,
      K.signCell(
        "ppk_prices",
        "ADULTS 25¢\nCHILDREN 10¢\nCIVIL DEFENSE MEMBERS\nFREE ADMISSION!",
        220,
        150,
        {
          bg: "#e8e0c8",
          fg: "#2a1a10",
          font: "Georgia, serif",
          border: "#2a1a10",
        },
      ),
      { off: 0.02 },
    );
    // zoo map board
    const mapCell = K.paint(
      "pics",
      "ppk_zoomap",
      256,
      192,
      function (x, X, Y, W2, H2) {
        x.fillStyle = "#d8d0b0";
        x.fillRect(X, Y, W2, H2);
        x.fillStyle = "#3a6a8a";
        x.beginPath();
        x.arc(X + W2 * 0.55, Y + H2 * 0.5, H2 * 0.16, 0, PI * 2);
        x.fill();
        x.fillStyle = "#8a3a2a";
        x.fillRect(X + W2 * 0.6, Y + H2 * 0.04, W2 * 0.3, H2 * 0.18);
        x.fillStyle = "#9a9890";
        x.beginPath();
        x.arc(X + W2 * 0.18, Y + H2 * 0.78, H2 * 0.16, 0, PI * 2);
        x.fill();
        x.strokeStyle = "#4a6a3a";
        x.lineWidth = 3;
        x.beginPath();
        x.arc(X + W2 * 0.28, Y + H2 * 0.38, H2 * 0.12, 0, PI * 2);
        x.stroke();
        x.fillStyle = "#1a1a1a";
        x.font = "bold 12px Georgia";
        x.textAlign = "center";
        x.fillText("ARSENAL", X + W2 * 0.75, Y + H2 * 0.15);
        x.fillText("SEA LIONS", X + W2 * 0.55, Y + H2 * 0.52);
        x.fillText("POLAR CIRCLE", X + W2 * 0.2, Y + H2 * 0.96);
        x.fillText("TROPIC ZONE", X + W2 * 0.28, Y + H2 * 0.2);
        x.fillStyle = "#c02010";
        x.beginPath();
        x.arc(X + W2 * 0.3, Y + H2 * 0.92, 5, 0, PI * 2);
        x.fill();
        x.fillText("YOU ARE HERE", X + W2 * 0.46, Y + H2 * 0.86);
        K.stains(x, X, Y, W2, H2, 10, 91, 0.5, [60, 40, 20]);
        K.streaks(x, X, Y, W2, H2, 10, 92, 0.3);
      },
    );
    b.pipe("black_iron", 99.2, 0, -467.5, 99.2, 2.3, -467.5, 0.04, 5);
    b.pipe("black_iron", 101.6, 0, -467.5, 101.6, 2.3, -467.5, 0.04, 5);
    b.plate("pics", 100.4, 1.6, -467.52, 0, -1, 2.2, 1.4, mapCell, {
      off: 0.0,
    });
    b.boxMM("paint_green", 99.1, 2.3, -467.65, 101.7, 2.45, -467.35, {
      tint: [0.24, 0.36, 0.26],
    });
    b.col(99.1, 0, -467.6, 101.7, 2.45, -467.4, {
      tag: "sign",
      walkable: false,
    });
    // popcorn cart, feeding bucket, dead planters
    d.boxMM("paint_red", 99.8, 0.35, -449.2, 101.0, 1.25, -448.4, {
      tint: [0.6, 0.18, 0.12],
    });
    d.boxMM("glass", 99.85, 1.25, -449.15, 100.95, 1.85, -448.45, {
      tint: [0.6, 0.58, 0.45],
    });
    d.boxMM("paint_red", 99.7, 1.85, -449.3, 101.1, 1.95, -448.3, {
      tint: [0.6, 0.18, 0.12],
    });
    for (const x of [99.9, 100.9])
      d.geo("rubber", new THREE.TorusGeometry(0.25, 0.06, 5, 10), {
        x,
        y: 0.28,
        z: -448.2,
        rz: 0,
        tint: [0.12, 0.12, 0.12],
      });
    b.col(99.7, 0, -449.3, 101.1, 1.95, -448.3, {
      tag: "cart",
      walkable: false,
    });
    d.cyl("metal", 88.3, 0, -451.9, 0.22, 0.26, 0.35, 10, {
      tint: [0.5, 0.52, 0.5],
      top: false,
    });
    for (let k = 0; k < 5; k++)
      d.geo("bone", K.sphereGeo(), {
        x: 88.6 + r() * 0.8,
        y: 0.05,
        z: -451.6 + r() * 0.6,
        sx: 0.1,
        sy: 0.03,
        sz: 0.03,
        ry: r() * 3,
        tint: [0.8, 0.76, 0.64],
      });
    for (const [x, z] of [
      [88.9, -445.2],
      [101.2, -463.8],
      [102.4, -446.9],
    ]) {
      d.cyl("concrete", x, 0, z, 0.8, 0.85, 0.5, 10, {
        tint: [0.6, 0.58, 0.52],
      });
      K.deadTree(d, x, 0.5, z, 3.6, (x * 7) | 0);
      b.col(x - 0.8, 0, z - 0.8, x + 0.8, 0.5, z + 0.8, { tag: "planter" });
    }
    // paths inside the zoo (paving) + litter + animal tracks
    b.quadGrid(
      "sidewalk",
      [SX0 + 0.3, 0.03, SZ - 0.3],
      [ARX, 0.03, SZ - 0.3],
      [ARX, 0.03, WZ + 0.3],
      [WX0 + 0.3, 0.03, WZ + 0.3],
      { tint: [0.64, 0.62, 0.58], uv: "top", seg: 4 },
    );
    K.litter(d, 86, -468, 103.5, -444, 0.04, 26, 7102);
    for (let k = 0; k < 10; k++)
      d.hplate(
        "decal",
        86 + r() * 17,
        0.045,
        -467 + r() * 23,
        0.9 + r(),
        0.9 + r(),
        r() * 6,
        K.decal(r() < 0.4 ? "blood" : r() < 0.7 ? "grime" : "crack", 20 + k),
      );
    d.plate(
      "decal",
      101.5,
      1.5,
      WZ + 0.2,
      0,
      1,
      2.6,
      1.0,
      K.tag("FEEDING TIME", "#c02818", 320, 110),
      { off: 0.02 },
    );

    // ------------------------------------------------------------ finish
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_cp_zoo_ext";
    const det = d.finish(ctx.extRoot);
    det.name = "poi_cp_zoo_detail";
    try {
      G.world.addLOD(det, 150, new THREE.Vector3(96, BY, -462));
    } catch (e) {
      /* optional */
    }
    ctx.litGroup = lit.finish(ctx.extRoot);
    ctx.litGroup.visible = false;
    // the clock's turntable (pivot at the clock axis)
    const rg = ring.finish(null);
    const pivot = new THREE.Group();
    pivot.name = "ppk_delacorte_band";
    pivot.position.set(CX, BY, CZ);
    pivot.add(rg);
    ctx.extRoot.add(pivot);
    ctx.clockRing = pivot;
    try {
      G.world.addLOD(pivot, 120, new THREE.Vector3(CX, BY, CZ));
    } catch (e) {
      /* optional */
    }
    ctx.clockPos = new THREE.Vector3(CX, BY + 6.2, CZ);
    ctx.clockCrank = new THREE.Vector3(CX + 2.05, BY + 1.2, CZ + 0.72);

    // ------------------------------------------------------------ anchors, loot, props
    K.anchor(ctx, "door", DOORX, BY, PZ + 4.6, false);
    K.anchor(ctx, "plaza", 99, BY, -474.5, false);
    K.anchor(ctx, "gate", SGATE.x, BY, SZ + 2.2, false);
    K.anchor(ctx, "pool", POOL.x, BY, POOL.z - PR - 2, false);
    K.anchor(ctx, "keeper_door", KEEPER.x, BY, KEEPER.z - 1.5, false);
    K.anchor(ctx, "tropic", TROP.x, BY, TROP.z, false);
    K.anchor(ctx, "clock", CX, BY, CZ + 1.8, false);
    K.anchor(ctx, "ext_spawn1", 86.6, BY, -457.5, false);
    K.anchor(ctx, "ext_spawn2", 100.5, BY, -459.8, false);
    K.anchor(ctx, "ext_spawn3", TROP.x - 1.5, BY, TROP.z - 1.5, false);
    K.loot(ctx, "ammo_box", 105.4, BY + 0.84, -473.2, 0.4, {
      world: true,
      loot: "ammo_box",
      name: "Army Ammo Can",
    });
    K.loot(ctx, "crate", 102.7, BY, -478.4, 0.1, {
      world: true,
      kind: "army",
      loot: "weapon_crate",
      name: "Civil Defense Crate",
    });
    K.loot(ctx, "cash_register", KX + 0.2, BY + 1.1, KZ - 0.3, -HP, {
      world: true,
      loot: "cash_register",
      name: "Ticket Till",
    });
    K.loot(ctx, "trash_can", 97.3, BY, -466.6, 0, {
      world: true,
      loot: "trash_can",
    });
    K.loot(ctx, "trash_can", 90.9, BY, -444.9, 0, {
      world: true,
      loot: "trash_can",
    });
    K.loot(ctx, "fizzo_machine", 104.9, BY, -466.2, -HP, {
      world: true,
      loot: "fizzo_machine",
    });
    K.loot(ctx, "locker", 107.4, BY, -447.3, -HP, {
      world: true,
      loot: "locker",
      name: "Zookeeper's Locker",
    });
    K.loot(ctx, "first_aid", 107.65, BY + 1.4, -452.5, -HP, {
      world: true,
      loot: "first_aid",
      name: "First Aid Station",
    });
    K.skel(ctx, POOL.x - 3.4, BY, POOL.z + PR + 1.6, 0.4, "lying", {
      world: true,
    });
    K.skel(
      ctx,
      POOL.x + Math.cos(4.3) * (PR + 2.4),
      BY,
      POOL.z - Math.sin(4.3) * (PR + 2.4),
      4.3 + HP,
      "seated",
      { world: true },
    );
    K.skel(ctx, 104.8, BY, -470.8, 2.6, "curled", { world: true });
    K.skel(ctx, KEEPER.x + 1.6, BY, KEEPER.z - 2.2, 1.2, "reaching", {
      world: true,
    });
    K.note(
      ctx,
      "ppk_note_feeding_clipboard",
      88.9,
      BY + 0.02,
      -451.2,
      {
        name: "Feeding Clipboard",
        title: "Feeding Clipboard — Mar 5",
        type: "note",
        text: 'MAR 5 1967 — AM FEEDING\n\nSea lions: 40 lb herring (Stan says the new "N.O.A.H. formula" pellets only. Sea lions HATE the pellets.)\nPenguins: krill, vit. supplement\nSnow leopard: horsemeat — ARMY TOOK THE LEOPARD Tues. Where???\nGus: 60 lb + formula. DO NOT ENTER GROTTO. Gus has been "weird" since the injections. Weird = stares at the door.\n\n9:40 — sirens. Army says everybody below, into the Ark. Animals first.\nAnimals FIRST???',
      },
      { world: true },
    );
  }

