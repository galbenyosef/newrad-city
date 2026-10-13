// play-inline-335 03 — tint
// Lines 206-966 of readable/play-inline-335.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "cu_ext", grime: 0.55 });
    const r = K.rng("cu_ext");
    const bs = [1.08, 0.86, 0.7]; // brownstone tint
    const trim = [1.18, 0.98, 0.8];
    const W = X1 - X0,
      D = Z1 - Z0;
    // walls
    b.face("brownstone", X0, 0, Z1, 1, 0, 0, 0, 1, 0, W, CORN, { tint: bs });
    b.face("brownstone", X1, 0, Z1, 0, 0, -1, 0, 1, 0, D, CORN, { tint: bs });
    b.face("brownstone", X0, 0, Z0, 0, 0, 1, 0, 1, 0, D, CORN, { tint: bs });
    b.face("brownstone", X1, 0, Z0, -1, 0, 0, 0, 1, 0, W, CORN, {
      tint: [0.66, 0.52, 0.44],
    });
    b.face("concrete_dark", X0, TOP, Z1, 1, 0, 0, 0, 0, -1, W, D, {
      uv: "top",
      tint: [0.45, 0.42, 0.4],
    });
    b.col(X0, 0, Z0, X1, PAR, Z1, { tag: "building" });
    // central pavilion (projects 1.2 m, rises to a taller parapet)
    b.boxMM("brownstone", PX0, 0, Z1, PX1, CORN, PZ, {
      tint: [0.82, 0.66, 0.55],
      faces: "sewt",
    });
    b.col(PX0, 0, Z1, PX1, PAR + 1.6, PZ, { tag: "building" });
    for (const qx of [PX0, PX1])
      for (let yy = 0.6; yy < CORN - 0.4; yy += 0.9) {
        const w = Math.round(yy / 0.9) % 2 ? 0.9 : 0.6;
        b.boxMM(
          "brownstone",
          qx - (qx === PX0 ? 0.08 : w - 0.08),
          yy,
          PZ - 0.4,
          qx + (qx === PX0 ? w - 0.08 : 0.08),
          yy + 0.8,
          PZ + 0.12,
          { tint: [0.74, 0.58, 0.48] },
        );
      }
    // plinth / water table
    b.boxMM("granite", X0 - 0.2, 0, Z1, X1 + 0.2, 0.6, Z1 + 0.25, {
      tint: [0.5, 0.46, 0.42],
    });
    b.boxMM("granite", PX0 - 0.2, 0, PZ, PX1 + 0.2, 0.6, PZ + 0.25, {
      tint: [0.5, 0.46, 0.42],
    });

    // --- south façade: 11 bays ---
    const NB = 11,
      BW = W / NB;
    const bayX = (k) => X0 + BW * (k + 0.5);
    const winState = () => {
      const u = r();
      return u < 0.28
        ? "broken"
        : u < 0.66
          ? "dark"
          : u < 0.78
            ? "boarded"
            : "glass";
    };
    for (let k = 0; k < NB; k++) {
      const x = bayX(k);
      const inPav = x > PX0 && x < PX1;
      const fz = inPav ? PZ : Z1;
      // ground-floor arcade: tall round arches between rusticated piers
      if (k === 5) {
        K.archWin(b, x, 0.02, fz, 0, 1, 3.6, 5.0, {
          state: "dark",
          surround: "brownstone",
          surroundTint: trim,
          fw: 0.3,
          depth: 0.3,
          sill: false,
          mullion: false,
        });
      } else {
        K.archWin(b, x, 0.6, fz, 0, 1, 3.0, 4.2, {
          state: k === 2 || k === 8 ? "boarded" : r() < 0.5 ? "broken" : "dark",
          surround: "brownstone",
          surroundTint: trim,
          fw: 0.26,
          depth: 0.28,
          sill: false,
        });
      }
      // upper floors: arched windows (2..4), shorter arched windows (5)
      for (let f = 1; f <= 3; f++)
        K.archWin(b, x, FL[f] + 0.9, fz, 0, 1, 1.7, 3.1, {
          state: winState(),
          surround: "brownstone",
          surroundTint: trim,
          paneTint: undefined,
        });
      K.archWin(b, x, FL[4] + 0.7, fz, 0, 1, 1.5, 2.3, {
        state: winState(),
        surround: "brownstone",
        surroundTint: trim,
        keystone: false,
      });
      // piers between bays (ground floor), with rustication grooves
      if (k < NB) {
        const px = X0 + BW * k;
        if (k > 0) {
          const pfz = px >= PX0 && px <= PX1 ? PZ : Z1;
          b.boxMM("brownstone", px - 0.5, 0.6, pfz, px + 0.5, 5.3, pfz + 0.3, {
            tint: trim,
          });
          for (let yy = 1.2; yy < 5.2; yy += 0.6)
            b.boxMM(
              "paint_black",
              px - 0.52,
              yy,
              pfz + 0.3,
              px + 0.52,
              yy + 0.04,
              pfz + 0.31,
              { tint: [0.2, 0.15, 0.12] },
            );
        }
      }
    }
    // the entrance: double doors + fanlight + lamps
    b.boxMM(
      "wood_dark",
      DOOR_X - 1.5,
      0,
      PZ + 0.02,
      DOOR_X + 1.5,
      3.3,
      PZ + 0.12,
      { tint: [0.35, 0.22, 0.14] },
    );
    b.boxMM(
      "wood_dark",
      DOOR_X - 0.04,
      0,
      PZ + 0.12,
      DOOR_X + 0.04,
      3.3,
      PZ + 0.2,
      { tint: [0.2, 0.12, 0.08] },
    );
    for (const s of [-1, 1]) {
      b.boxMM(
        "brass",
        DOOR_X + s * 0.3 - 0.03,
        1.1,
        PZ + 0.12,
        DOOR_X + s * 0.3 + 0.03,
        1.5,
        PZ + 0.2,
        {},
      );
      for (let yy = 0.5; yy < 3.2; yy += 0.9)
        b.boxMM(
          "wood_dark",
          DOOR_X + s * 0.75 - 0.6,
          yy,
          PZ + 0.12,
          DOOR_X + s * 0.75 + 0.6,
          yy + 0.7,
          PZ + 0.16,
          { tint: [0.28, 0.18, 0.11] },
        );
    }
    b.plate(
      "art",
      DOOR_X,
      2.2,
      PZ + 0.21,
      0,
      1,
      1.9,
      0.9,
      K.signCell("cu_exam_door", "EXAMINATION\nIN PROGRESS", 384, 180, {
        bg: "#e0b020",
        fg: "#1a1a1a",
        font: "Arial Black, sans-serif",
        border: "#1a1a1a",
      }),
    );
    for (const s of [-1, 1]) {
      b.cyl("black_iron", DOOR_X + s * 2.3, 3.2, PZ + 0.4, 0.18, 0.12, 0.5, 8);
      b.glow(DOOR_X + s * 2.3, 3.55, PZ + 0.45, [0.6, 0.75, 1], 1.2);
      b.geo("lamp", K.sphereGeo(), {
        x: DOOR_X + s * 2.3,
        y: 3.55,
        z: PZ + 0.4,
        s: 0.12,
        tint: [0.7, 0.85, 1],
      });
    }
    // steps up to the door
    for (let i = 0; i < 3; i++)
      b.boxMM(
        "granite",
        DOOR_X - 2.4 + i * 0.2,
        0,
        PZ + 1.2 - i * 0.4,
        DOOR_X + 2.4 - i * 0.2,
        0.15 * (i + 1),
        PZ + 1.6 - i * 0.4,
        { tint: [0.55, 0.52, 0.48] },
      );
    b.col(DOOR_X - 2.4, 0, PZ, DOOR_X + 2.4, 0.15, PZ + 1.6, { tag: "steps" });
    // string courses
    for (let f = 1; f <= 4; f++) {
      b.boxMM(
        "brownstone",
        X0 - 0.15,
        FL[f] - 0.05,
        Z1,
        PX0,
        FL[f] + 0.3,
        Z1 + 0.3,
        { tint: trim },
      );
      b.boxMM(
        "brownstone",
        PX1,
        FL[f] - 0.05,
        Z1,
        X1 + 0.15,
        FL[f] + 0.3,
        Z1 + 0.3,
        { tint: trim },
      );
      b.boxMM(
        "brownstone",
        PX0 - 0.15,
        FL[f] - 0.05,
        PZ,
        PX1 + 0.15,
        FL[f] + 0.3,
        PZ + 0.3,
        { tint: trim },
      );
      b.boxMM(
        "brownstone",
        X1,
        FL[f] - 0.05,
        Z0 - 0.15,
        X1 + 0.3,
        FL[f] + 0.3,
        Z1 + 0.15,
        { tint: trim },
      );
      b.boxMM(
        "brownstone",
        X0 - 0.3,
        FL[f] - 0.05,
        Z0 - 0.15,
        X0,
        FL[f] + 0.3,
        Z1 + 0.15,
        { tint: trim },
      );
    }
    // cornice + parapet
    K.cornice(b, X0, Z1, PX0, Z1, CORN, 0, 1, {
      mat: "brownstone",
      tint: trim,
      depth: 0.9,
      h: 0.9,
      brackets: 1.2,
    });
    K.cornice(b, PX1, Z1, X1, Z1, CORN, 0, 1, {
      mat: "brownstone",
      tint: trim,
      depth: 0.9,
      h: 0.9,
      brackets: 1.2,
    });
    K.cornice(b, PX0, PZ, PX1, PZ, CORN, 0, 1, {
      mat: "brownstone",
      tint: trim,
      depth: 0.9,
      h: 0.9,
      brackets: 1.2,
    });
    K.cornice(b, X1, Z1, X1, Z0, CORN, 1, 0, {
      mat: "brownstone",
      tint: trim,
      depth: 0.9,
      h: 0.9,
      brackets: 1.2,
    });
    K.cornice(b, X0, Z0, X0, Z1, CORN, -1, 0, {
      mat: "brownstone",
      tint: trim,
      depth: 0.9,
      h: 0.9,
      brackets: 1.2,
    });
    K.cornice(b, X1, Z0, X0, Z0, CORN, 0, -1, {
      mat: "brownstone",
      tint: [0.6, 0.48, 0.4],
      depth: 0.6,
      h: 0.9,
      brackets: 0,
    });
    b.boxMM("brownstone", X0, TOP, Z1 - 0.4, X1 - 7, PAR, Z1, { tint: trim }); // parapet (east end collapsed)
    b.boxMM("brownstone", X0, TOP, Z0, X0 + 0.4, PAR, Z1, { tint: trim });
    b.boxMM("brownstone", X0, TOP, Z0, X1, PAR, Z0 + 0.4, { tint: trim });
    // pavilion attic with the lettering
    b.boxMM("brownstone", PX0, TOP, Z1 - 0.4, PX1, PAR + 1.6, PZ, {
      tint: [0.82, 0.66, 0.55],
    });
    K.cornice(b, PX0, PZ, PX1, PZ, PAR + 1.4, 0, 1, {
      mat: "brownstone",
      tint: trim,
      depth: 0.4,
      h: 0.5,
      brackets: 0,
    });
    K.letters(b, DOOR_X, TOP + 1.05, PZ, 0, 1, 12.5, 1.25, "COOPER UNION", {
      fg: "#efe4c8",
      font: 'Georgia, "Times New Roman", serif',
    });
    K.letters(
      b,
      DOOR_X,
      FL[1] + 0.62,
      PZ + 0.3,
      0,
      1,
      13.2,
      0.5,
      "FOR THE ADVANCEMENT OF SCIENCE AND ART",
      { fg: "#e8dcc0", size: 0.62 },
    );
    // side lettering on the frieze band
    K.letters(
      b,
      (X0 + PX0) / 2,
      CORN - 0.55,
      Z1,
      0,
      1,
      14,
      0.7,
      "FOUNDATION BUILDING",
      { fg: "#dcd0b0", size: 0.6 },
    );
    K.letters(
      b,
      (PX1 + X1) / 2,
      CORN - 0.55,
      Z1,
      0,
      1,
      14,
      0.7,
      "ERECTED MDCCCLIX",
      { fg: "#dcd0b0", size: 0.6 },
    );

    // --- east / west façades: 5 bays ---
    for (const side of [-1, 1]) {
      const fx = side > 0 ? X1 : X0;
      for (let k = 0; k < 5; k++) {
        const z = Z0 + (D / 5) * (k + 0.5);
        K.archWin(b, fx, 0.6, z, side, 0, 2.6, 4.0, {
          state: r() < 0.5 ? "boarded" : "dark",
          surround: "brownstone",
          surroundTint: trim,
          fw: 0.24,
        });
        for (let f = 1; f <= 3; f++)
          K.archWin(b, fx, FL[f] + 0.9, z, side, 0, 1.7, 3.1, {
            state: winState(),
            surround: "brownstone",
            surroundTint: trim,
          });
        K.archWin(b, fx, FL[4] + 0.7, z, side, 0, 1.5, 2.3, {
          state: winState(),
          surround: "brownstone",
          surroundTint: trim,
          keystone: false,
        });
      }
    }
    // --- north (rear) façade: plain arched windows ---
    for (let k = 0; k < NB; k++) {
      const x = bayX(k);
      for (let f = 0; f <= 4; f++)
        K.archWin(
          b,
          x,
          FL[f] + (f ? 0.9 : 0.8),
          Z0,
          0,
          -1,
          1.6,
          f === 4 ? 2.2 : 3.0,
          {
            state: r() < 0.4 ? "boarded" : "dark",
            surround: "brownstone",
            surroundTint: [0.6, 0.48, 0.4],
            keystone: false,
          },
        );
    }

    // --- roof: the observatory drum & dome, Ardent antenna, skylights, water tank ---
    const OX = 240,
      OZ = 329;
    b.cyl("brownstone", OX, TOP, OZ, 3.4, 3.4, 3.0, 20, { tint: trim });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * PI * 2;
      K.archWin(
        b,
        OX + Math.cos(a) * 3.42,
        TOP + 0.6,
        OZ - Math.sin(a) * 3.42,
        Math.cos(a),
        -Math.sin(a),
        0.9,
        1.8,
        {
          state: "dark",
          surround: "brownstone",
          surroundTint: trim,
          fw: 0.12,
          depth: 0.12,
          keystone: false,
          sill: false,
          seg: 5,
        },
      );
    }
    b.cyl("brownstone", OX, TOP + 3.0, OZ, 3.7, 3.7, 0.35, 20, { tint: trim });
    b.geo("copper", K.sphereGeo(), {
      x: OX,
      y: TOP + 3.35,
      z: OZ,
      sx: 3.4,
      sy: 3.0,
      sz: 3.4,
      tint: [0.36, 0.6, 0.5],
    });
    b.boxMM(
      "paint_black",
      OX - 0.45,
      TOP + 3.6,
      OZ + 1.6,
      OX + 0.45,
      TOP + 6.1,
      OZ + 2.6,
      { tint: [0.05, 0.05, 0.05] },
    ); // open slit
    b.col(OX - 3.4, TOP, OZ - 3.4, OX + 3.4, TOP + 6.4, OZ + 3.4, {
      tag: "building",
    });
    // lattice antenna mast (Ardent relay)
    const AX = 222,
      AZ = 324;
    for (const [dx, dz] of [
      [-0.6, -0.6],
      [0.6, -0.6],
      [0.6, 0.6],
      [-0.6, 0.6],
    ])
      b.pipe(
        "rust",
        AX + dx,
        TOP,
        AZ + dz,
        AX + dx * 0.15,
        TOP + 13,
        AZ + dz * 0.15,
        0.05,
        4,
      );
    for (let yy = 1.5; yy < 13; yy += 1.6) {
      const f = 1 - yy / 15;
      b.boxMM(
        "rust",
        AX - 0.62 * f,
        TOP + yy,
        AZ - 0.62 * f,
        AX + 0.62 * f,
        TOP + yy + 0.06,
        AZ + 0.62 * f,
        { faces: "nsew" },
      );
    }
    b.geo("lamp", K.sphereGeo(), {
      x: AX,
      y: TOP + 13.3,
      z: AZ,
      s: 0.18,
      tint: [1, 0.15, 0.1],
    });
    b.glow(AX, TOP + 13.3, AZ, [1, 0.12, 0.08], 3.5);
    b.pipe("rust", AX, TOP + 12.5, AZ, AX + 2.5, TOP + 11, AZ + 1, 0.02, 3);
    b.cyl("metal", AX + 2.6, TOP + 10.2, AZ + 1, 0.8, 0.9, 0.3, 12, {
      tint: [0.6, 0.62, 0.6],
    }); // dish
    // skylight boxes & a water tank on stilts
    for (const sx of [228, 252]) {
      b.boxMM("metal_dark", sx - 2.5, TOP, 322, sx + 2.5, TOP + 0.9, 336, {
        tint: [0.4, 0.4, 0.4],
      });
      b.quad(
        "glass",
        [sx - 2.4, TOP + 0.91, 336],
        [sx + 2.4, TOP + 0.91, 336],
        [sx + 2.4, TOP + 1.6, 329],
        [sx - 2.4, TOP + 1.6, 329],
        { tint: [0.35, 0.45, 0.45] },
      );
    }
    for (const [dx, dz] of [
      [-1.2, -1.2],
      [1.2, -1.2],
      [1.2, 1.2],
      [-1.2, 1.2],
    ])
      b.pipe(
        "rust",
        258 + dx,
        TOP,
        322 + dz,
        258 + dx,
        TOP + 3,
        322 + dz,
        0.08,
        5,
      );
    b.cyl("wood_rotten", 258, TOP + 3, 322, 1.9, 1.9, 3.2, 14, {
      tint: [0.6, 0.5, 0.4],
    });
    b.cyl("wood_rotten", 258, TOP + 6.2, 322, 2.0, 0.2, 1.2, 14, {
      tint: [0.5, 0.42, 0.34],
    });
    // collapsed south-east roof corner: broken parapet, girders, rubble below
    for (let k = 0; k < 6; k++)
      b.box(
        "brownstone",
        X1 - 6.5 + k * 1.1,
        TOP - 0.3 - r() * 0.6,
        Z1 - 0.6 - r() * 3,
        1.0,
        0.4 + r() * 0.8,
        0.9,
        { yaw: r() * 0.6, tint: trim },
      );
    for (let k = 0; k < 4; k++)
      b.beam(
        "rust",
        X1 - 5 + k * 1.3,
        TOP - 1,
        Z1 - 4,
        X1 - 4.6 + k * 1.1,
        TOP + 1.5 + r(),
        Z1 - 0.5,
        0.18,
        0.28,
      );
    b.burn(X1 - 3, TOP - 2, Z1, 5, 0.8);
    b.burn(X0 + 12, 8, Z1, 4, 0.55);
    b.burn(DOOR_X + 6, 2.5, PZ, 3, 0.45);
    K.rubble(b, X1 - 2, 0, Z1 + 3, 2.6, 1.4, {
      seed: 7,
      mat: "rubble",
      tint: [0.72, 0.6, 0.52],
    });
    b.box("brownstone", X1 - 5.5, 0, Z1 + 3.6, 3.2, 0.9, 1.1, {
      yaw: 0.35,
      tint: trim,
    }); // fallen cornice block
    b.box("brownstone", X1 - 1.2, 0, Z1 + 5.4, 1.8, 0.7, 0.9, {
      yaw: -0.8,
      tint: trim,
    });
    // Ardent Robotics banners either side of the pavilion
    const ban = ardentBanner();
    for (const bx of [PX0 - 1.2, PX1 + 1.2]) {
      b.beam(
        "black_iron",
        bx,
        FL[4] - 0.2,
        Z1,
        bx,
        FL[4] - 0.2,
        Z1 + 1.1,
        0.06,
        0.06,
      );
      b.quad(
        "art",
        [bx - 0.9, FL[2] - 0.6, Z1 + 1.05],
        [bx + 0.9, FL[2] - 0.6, Z1 + 1.05],
        [bx + 0.9, FL[4] - 0.3, Z1 + 1.05],
        [bx - 0.9, FL[4] - 0.3, Z1 + 1.05],
        { rect: ban, tint: [0.9, 0.9, 0.9], grime: 0.2 },
      );
      b.quad(
        "fabric",
        [bx + 0.9, FL[2] - 0.6, Z1 + 1.04],
        [bx - 0.9, FL[2] - 0.6, Z1 + 1.04],
        [bx - 0.9, FL[4] - 0.3, Z1 + 1.04],
        [bx + 0.9, FL[4] - 0.3, Z1 + 1.04],
        { tint: [0.14, 0.24, 0.36], grime: 0.3 },
      );
    }
    // graffiti & robot scorch marks
    b.plate(
      "decal",
      222,
      2.2,
      Z1 + 0.31,
      0,
      1,
      4.2,
      1.1,
      K.tag("ROBOTS FLUNKED US ALL", "#e8e040", 512, 96, { rot: -0.03 }),
    );
    b.plate(
      "decal",
      257,
      1.6,
      Z1 + 0.31,
      0,
      1,
      2.8,
      1.0,
      K.tag("NO TRUANTS", "#e04030", 256, 96, { rot: 0.05 }),
    );
    for (let k = 0; k < 6; k++)
      b.plate(
        "decal",
        236 + r() * 10,
        1 + r() * 3,
        PZ + 0.32,
        0,
        1,
        0.8,
        0.8,
        K.decal("scorch", k),
      );

    // --- forecourt: paving, iron railings, the seated Peter Cooper statue ---
    b.boxMM("sidewalk", X0, 0, Z1, X1, 0.12, 348, {
      tint: [0.72, 0.7, 0.66],
      faces: "sewt",
    });
    b.col(X0, 0, Z1, X1, 0.12, 348, { tag: "floor", surface: "concrete" });
    const SX = 225,
      SZ = 345.4;
    b.boxMM("granite", SX - 1.6, 0.12, SZ - 1.2, SX + 1.6, 0.5, SZ + 1.2, {
      tint: [0.52, 0.5, 0.47],
    });
    b.boxMM("granite", SX - 1.25, 0.5, SZ - 0.9, SX + 1.25, 2.3, SZ + 0.9, {
      tint: [0.6, 0.58, 0.54],
    });
    b.boxMM("granite", SX - 1.4, 2.3, SZ - 1.05, SX + 1.4, 2.55, SZ + 1.05, {
      tint: [0.55, 0.53, 0.5],
    });
    K.letters(b, SX, 1.5, SZ + 0.9, 0, 1, 2.3, 0.45, "PETER COOPER", {
      fg: "#d8d0c0",
      size: 0.7,
    });
    K.statueFigure(b, SX, 2.55, SZ + 0.1, PI, {
      seated: true,
      scale: 1.25,
      tint: [0.36, 0.48, 0.4],
    });
    b.col(SX - 1.6, 0, SZ - 1.2, SX + 1.6, 4.8, SZ + 1.2, { tag: "statue" });
    K.railing(b, X0 + 0.3, 347.6, SX - 3, 347.6, 0.12, {
      h: 1.0,
      mat: "black_iron",
      handMat: "black_iron",
      step: 0.18,
    });
    K.railing(b, SX + 3, 347.6, PX0 - 2.8, 347.6, 0.12, {
      h: 1.0,
      mat: "black_iron",
      handMat: "black_iron",
      step: 0.18,
    });
    K.railing(b, PX1 + 2.8, 347.6, X1 - 6, 347.6, 0.12, {
      h: 1.0,
      mat: "black_iron",
      handMat: "black_iron",
      step: 0.18,
    });
    // Ardent charging pod by the door (the proctors' parking spot)
    const CPX = 250.5,
      CPZ = 344.4;
    b.boxMM("metal", CPX - 0.9, 0.12, CPZ - 0.7, CPX + 0.9, 2.6, CPZ + 0.7, {
      tint: [0.55, 0.6, 0.66],
      faces: "nsewt",
    });
    b.boxMM(
      "paint_black",
      CPX - 0.7,
      0.3,
      CPZ + 0.7,
      CPX + 0.7,
      2.3,
      CPZ + 0.72,
      { tint: [0.05, 0.05, 0.06] },
    );
    b.plate("lamp", CPX, 2.45, CPZ + 0.73, 0, 1, 1.4, 0.18, null, {
      tint: [0.3, 0.8, 1.0],
    });
    b.glow(CPX, 2.45, CPZ + 0.9, [0.3, 0.7, 1], 1.6);
    b.plate(
      "art",
      CPX,
      1.3,
      CPZ + 0.74,
      0,
      1,
      1.2,
      0.5,
      K.signCell("cu_pod", "PROCTOR UNIT\nCHARGING", 256, 110, {
        bg: "#1c3a5a",
        fg: "#e8e0c8",
        font: "Arial, sans-serif",
      }),
    );
    b.col(CPX - 0.9, 0, CPZ - 0.7, CPX + 0.9, 2.6, CPZ + 0.7, {
      tag: "prop",
      surface: "metal",
    });
    K.skel(ctx, CPX - 1.6, 0.12, CPZ + 1.1, 2.2, "reaching", { world: true });
    K.litter(b, X0 + 1, Z1 + 0.6, X1 - 1, 347.4, 0.12, 30, 311);
    for (let k = 0; k < 5; k++)
      b.hplate(
        "decal",
        X0 + 4 + r() * 44,
        0.135 + k * 0.001,
        Z1 + 1 + r() * 4,
        1.2,
        1.2,
        r() * 6,
        K.decal(k % 2 ? "scorch" : "grime", 40 + k),
      );

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_cooper_ext";
    K.anchor(ctx, "door", DOOR_X, 0.12, PZ + 1.8, false);
    K.anchor(ctx, "statue", SX, 0.12, SZ + 2, false);
    K.loot(ctx, "trash_can", X0 + 3, 0.12, 346.5, 0, {
      world: true,
      loot: "trash_can",
    });
    K.loot(ctx, "mailbox", X1 - 8, 0.12, 346.8, PI, {
      world: true,
      loot: "newspaper_box",
      name: "Newspaper Box",
    });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
