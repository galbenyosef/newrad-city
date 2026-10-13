// play-inline-191 03 — top
// Lines 103-1016 of readable/play-inline-191.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "chelsea_ext", grime: 0.55, flip: FLIP });
    const r = K.rng("chelsea_ext");
    const brick = [0.95, 0.72, 0.62];
    const collapsedX = X0 + BAYW * 6; // bays 6-7 lost their roof

    // ---- main body faces ----
    // front: brick above the base, per bay column so the NE corner can be broken (U=−x → normal −z)
    for (let i = 0; i < 8; i++) {
      const bx0 = X0 + i * BAYW,
        bx1 = bx0 + BAYW;
      const top = i >= 6 ? TOP - 3.4 - (i === 7 ? 1.6 : 0) : TOP;
      b.face("brick_red", bx1, GF, Z0, -1, 0, 0, 0, 1, 0, BAYW, top - GF, {
        tint: brick,
      });
      if (i >= 6) {
        // jagged broken parapet
        for (let k = 0; k < 6; k++) {
          const w = 0.6 + r() * 0.6,
            h = 0.3 + r() * 1.4;
          b.box("brick_red", bx0 + 0.4 + k * 1.05, top, Z0 + 0.3, w, h, 0.6, {
            tint: brick,
          });
        }
      }
    }
    // sides & back (plain brick)
    b.face("brick_red", X0, 0, Z0, 0, 0, 1, 0, 1, 0, Z1 - Z0, TOP, {
      tint: [0.8, 0.62, 0.54],
    }); // west (normal −x)
    b.face("brick_red", X1, 0, Z1, 0, 0, -1, 0, 1, 0, Z1 - Z0, TOP - 5, {
      tint: [0.8, 0.62, 0.54],
    }); // east (normal +x)
    b.face("brick_red", X0, 0, Z1, 1, 0, 0, 0, 1, 0, X1 - X0, TOP, {
      tint: [0.75, 0.6, 0.52],
    }); // back (normal +z)
    // roof deck
    b.face(
      "concrete_dark",
      X0,
      TOP,
      Z1,
      1,
      0,
      0,
      0,
      0,
      -1,
      collapsedX - X0,
      Z1 - Z0,
      { uv: "top", tint: [0.6, 0.58, 0.55] },
    );
    b.face(
      "rubble",
      collapsedX,
      TOP - 5,
      Z1,
      1,
      0,
      0,
      0,
      0,
      -1,
      X1 - collapsedX,
      Z1 - Z0,
      { uv: "top", tint: [0.7, 0.66, 0.6] },
    );
    b.col(X0, 0, Z0, collapsedX, TOP, Z1, {
      tag: "building",
      surface: "concrete",
    });
    b.col(collapsedX, 0, Z0, X1, TOP - 5, Z1, {
      tag: "building",
      surface: "rubble",
    });

    // ---- rusticated base (0..GF) ----
    const base = [0.62, 0.5, 0.42];
    // piers at bay boundaries
    for (let i = 0; i <= 8; i++) {
      const px = X0 + i * BAYW;
      b.boxMM("brick_brown", px - 0.55, 0, Z0 - 0.35, px + 0.55, GF - 0.4, Z0, {
        tint: base,
      });
      for (let k = 0; k < 7; k++)
        b.boxMM(
          "brick_brown",
          px - 0.6,
          k * 0.62 + 0.05,
          Z0 - 0.4,
          px + 0.6,
          k * 0.62 + 0.12,
          Z0 - 0.33,
          { tint: [0.45, 0.36, 0.3] },
        ); // rustication grooves
    }
    // base cornice / sign band
    b.boxMM("limestone", X0 - 0.2, GF - 0.45, Z0 - 0.55, X1 + 0.2, GF, Z0, {
      tint: [0.85, 0.8, 0.7],
    });
    b.boxMM(
      "limestone",
      X0 - 0.2,
      GF - 0.62,
      Z0 - 0.4,
      X1 + 0.2,
      GF - 0.45,
      Z0,
      { tint: [0.7, 0.66, 0.58] },
    );
    // shopfronts (bays 0-2 El Quijote, 4-5 guitars, 6-7 boarded) + entrance (bay 3)
    for (let i = 0; i < 8; i++) {
      const cx = X0 + i * BAYW + BAYW / 2;
      if (i === 3) continue;
      const st = i >= 6 ? "boarded" : i === 1 ? "broken" : "glass";
      b.boxMM(
        "brick_brown",
        cx - BAYW / 2 + 0.55,
        0,
        Z0 - 0.3,
        cx + BAYW / 2 - 0.55,
        0.7,
        Z0,
        { tint: base },
      ); // stall riser
      K.window(b, cx, 2.2, Z0, 0, -1, BAYW - 1.4, 2.9, {
        state: st,
        sill: false,
        frame: "paint_green",
        reveal: "brick_brown",
        inset: 0.25,
      });
      b.boxMM(
        "paint_green",
        cx - BAYW / 2 + 0.55,
        3.66,
        Z0 - 0.12,
        cx + BAYW / 2 - 0.55,
        4.5,
        Z0,
        {},
      ); // sign board
    }
    // ---- entrance (bay 3) ----
    const dx = DOOR_X;
    b.boxMM(
      "paint_black",
      dx - 1.7,
      0,
      Z0 - 0.02,
      dx + 1.7,
      3.8,
      Z0 - 0.01,
      {},
    );
    for (const s of [-1, 1]) {
      // double doors: brass frames, dark glass
      const c = dx + s * 0.75;
      b.boxMM("brass", c - 0.7, 0, Z0 - 0.12, c + 0.7, 2.9, Z0 - 0.04, {
        tint: [0.6, 0.5, 0.3],
      });
      b.plate("glass_dark", c, 1.6, Z0 - 0.12, 0, -1, 1.1, 2.2, null, {
        tint: [0.25, 0.3, 0.3],
      });
      b.beam(
        "brass",
        c - 0.5,
        1.1,
        Z0 - 0.2,
        c + 0.5,
        1.1,
        Z0 - 0.2,
        0.05,
        0.05,
      );
    }
    b.plate("lamp", dx, 3.35, Z0 - 0.06, 0, -1, 3.0, 0.7, null, {
      tint: [0.7, 0.55, 0.3],
    }); // transom glow
    // canopy with lettering
    const cz0 = Z0 - 2.9; // canopy stops short of the kerb (3 m sidewalk)
    b.boxMM("paint_black", dx - 2.2, 4.0, cz0, dx + 2.2, 4.35, Z0, {
      tint: [0.4, 0.4, 0.4],
    });
    const canopyRect = K.signCell("chelsea_canopy", "HOTEL CHELSEA", 512, 64, {
      bg: "#161616",
      fg: "#e8e0c8",
      font: "Georgia, serif",
      weather: true,
    });
    b.plate("art", dx, 4.18, cz0, 0, -1, 4.3, 0.34, canopyRect, { off: 0.01 });
    b.plate(
      "art",
      dx - 2.2,
      4.18,
      (cz0 + Z0) / 2,
      -1,
      0,
      3.5,
      0.3,
      canopyRect,
      { off: 0.01 },
    );
    b.plate("art", dx + 2.2, 4.18, (cz0 + Z0) / 2, 1, 0, 3.5, 0.3, canopyRect, {
      off: 0.01,
    });
    for (const s of [-1, 1])
      b.pipe(
        "black_iron",
        dx + s * 2.0,
        4.35,
        cz0 + 0.2,
        dx + s * 1.6,
        6.4,
        Z0 - 0.05,
        0.025,
        4,
      ); // tie rods
    for (let k = 0; k < 6; k++)
      b.glow(dx - 1.8 + k * 0.72, 3.95, cz0 + 1.8, [0.9, 0.7, 0.4], 0.6);
    // bronze plaques
    const plq = K.signCell(
      "chelsea_plaque",
      "HOTEL CHELSEA\nNew York Landmark",
      256,
      192,
      {
        bg: "#5a4020",
        fg: "#d8b060",
        border: "#c8a050",
        font: "Georgia, serif",
        sub: "Artists · Writers · Musicians — they lived here",
        weather: true,
      },
    );
    b.plate("art", dx - 2.45, 2.1, Z0 - 0.36, 0, -1, 0.8, 0.6, plq);
    b.plate("art", dx + 2.45, 2.1, Z0 - 0.36, 0, -1, 0.8, 0.6, plq);
    // shop signs
    // (round 2: the neon plate keeps the cell's aspect — it used to stretch 4× and the letters smeared into each other)
    const quij = K.neonCell("chelsea_quijote", "EL QUIJOTE", 768, 80, {
      color: "#ff3a2a",
      font: "Georgia, serif",
      italic: true,
    });
    b.plate(
      "paint_black",
      X0 + BAYW * 1.5,
      4.08,
      Z0 - 0.14,
      0,
      -1,
      BAYW * 2.4,
      0.9,
      null,
    );
    b.plate("neon", X0 + BAYW * 1.5, 4.08, Z0 - 0.17, 0, -1, 8.4, 0.88, quij, {
      tint: [1, 0.9, 0.9],
    });
    b.glow(X0 + BAYW * 1.5, 4.1, Z0 - 0.7, [1, 0.25, 0.15], 3);
    const gtr = K.signCell("chelsea_guitars", "CHELSEA GUITARS", 512, 96, {
      bg: "#1c1c1c",
      fg: "#d8c890",
      font: "Arial Black, sans-serif",
    });
    b.plate(
      "art",
      X0 + BAYW * 5,
      4.08,
      Z0 - 0.14,
      0,
      -1,
      BAYW * 1.7,
      0.72,
      gtr,
    );
    const art = K.tag("ARTISTS ONLY", "#e0e0d0", 256, 96);
    b.plate("decal", X0 + BAYW * 6.5, 2.0, Z0 - 0.28, 0, -1, 3.2, 1.2, art);
    const tag2 = K.tag("NO MANIACS", "#40d060", 256, 96, { rot: 0.06 });
    b.plate("decal", X0 + BAYW * 7.5, 1.4, Z0 - 0.28, 0, -1, 2.6, 1.0, tag2);

    // ---- upper floors: windows, pilasters, string courses, balconies ----
    const lace = [0.16, 0.15, 0.14];
    for (let f = 0; f < NF; f++) {
      const y0 = GF + f * FH;
      // string course
      b.boxMM(
        "limestone",
        X0,
        y0 - 0.12,
        Z0 - 0.14,
        i7top(f) ? X1 : X0 + BAYW * 6,
        y0 + 0.08,
        Z0,
        { tint: [0.9, 0.86, 0.78] },
      );
      for (let i = 0; i < 8; i++) {
        const cx = X0 + i * BAYW + BAYW / 2;
        if (i >= 6 && y0 + FH > TOP - 3.5) continue;
        for (const s of [-1, 1]) {
          const wx = cx + s * WIN_OFF;
          const u = r();
          const st =
            u < 0.14
              ? "boarded"
              : u < 0.3
                ? "broken"
                : f <= 2 && u > 0.82
                  ? "lit"
                  : "glass";
          K.window(b, wx, y0 + 1.5, Z0, 0, -1, 1.15, 2.05, {
            state: st,
            lintel: 0.22,
            trimTint: [0.9, 0.86, 0.78],
            frame: "paint_cream",
            reveal: "brick_red",
          });
          // decorative brick hood (Gothic) above lintel
          b.boxMM(
            "brick_red",
            wx - 0.75,
            y0 + 2.75,
            Z0 - 0.1,
            wx + 0.75,
            y0 + 2.9,
            Z0,
            { tint: [0.7, 0.45, 0.38] },
          );
        }
        // balcony (floors 2..9 → f 1..8)
        if (f >= 1) {
          const bx0 = cx - BAYW / 2 + 0.55,
            bx1 = cx + BAYW / 2 - 0.55,
            bz = Z0 - 1.05;
          b.boxMM("black_iron", bx0, y0 - 0.02, bz, bx1, y0 + 0.1, Z0, {
            tint: [0.5, 0.48, 0.45],
          });
          for (const t of [0.15, 0.5, 0.85]) {
            const px = bx0 + (bx1 - bx0) * t;
            b.beam(
              "black_iron",
              px,
              y0 - 0.02,
              bz + 0.1,
              px,
              y0 - 0.7,
              Z0 - 0.02,
              0.06,
              0.06,
              { tint: lace },
            );
          }
          b.quad(
            "lace",
            [bx0, y0 + 0.1, bz],
            [bx1, y0 + 0.1, bz],
            [bx1, y0 + 1.1, bz],
            [bx0, y0 + 1.1, bz],
            { tint: lace, grime: 0, rect: [0, 0, (bx1 - bx0) / 1.1, 1] },
          );
          b.quad(
            "lace",
            [bx0, y0 + 0.1, Z0],
            [bx0, y0 + 0.1, bz],
            [bx0, y0 + 1.1, bz],
            [bx0, y0 + 1.1, Z0],
            { tint: lace, grime: 0, rect: [0, 0, 1, 1] },
          );
          b.quad(
            "lace",
            [bx1, y0 + 0.1, bz],
            [bx1, y0 + 0.1, Z0],
            [bx1, y0 + 1.1, Z0],
            [bx1, y0 + 1.1, bz],
            { tint: lace, grime: 0, rect: [0, 0, 1, 1] },
          );
          b.beam(
            "black_iron",
            bx0,
            y0 + 1.12,
            bz,
            bx1,
            y0 + 1.12,
            bz,
            0.06,
            0.05,
            { tint: lace },
          );
          // settlement life on the lower balconies: laundry lines, planters
          if (f <= 3 && r() < 0.4) {
            b.pipe(
              "black_iron",
              bx0 + 0.2,
              y0 + 1.9,
              bz + 0.4,
              bx1 - 0.2,
              y0 + 1.9,
              bz + 0.4,
              0.008,
              3,
            );
            for (let k = 0; k < 4; k++)
              b.box(
                "fabric",
                bx0 + 0.8 + k * 1.1,
                y0 + 1.3,
                bz + 0.4,
                0.6,
                0.6,
                0.02,
                {
                  tint: r.pick([
                    [0.8, 0.3, 0.25],
                    [0.3, 0.4, 0.6],
                    [0.8, 0.78, 0.7],
                    [0.5, 0.6, 0.3],
                  ]),
                },
              );
          }
          if (r() < 0.3)
            b.box(
              "wood_rotten",
              cx + (r() - 0.5) * 3,
              y0 + 0.1,
              bz + 0.3,
              0.9,
              0.35,
              0.3,
              { tint: [0.6, 0.5, 0.4] },
            );
        }
      }
    }
    // pilasters
    for (let i = 0; i <= 8; i++) {
      const px = X0 + i * BAYW;
      const top = i >= 7 ? TOP - 5 : TOP;
      b.boxMM("brick_red", px - 0.45, GF, Z0 - 0.28, px + 0.45, top, Z0, {
        tint: [0.85, 0.6, 0.5],
      });
      for (let f = 0; f < NF; f++) {
        const y0 = GF + f * FH;
        if (y0 + 1 > top) break;
        b.boxMM(
          "limestone",
          px - 0.5,
          y0 + 2.6,
          Z0 - 0.33,
          px + 0.5,
          y0 + 2.78,
          Z0,
          { tint: [0.9, 0.86, 0.78] },
        );
      }
    }
    // cornice with brackets (bays 0-5)
    const cx1 = X0 + BAYW * 6;
    b.boxMM("metal", X0 - 0.3, TOP - 0.2, Z0 - 0.95, cx1, TOP + 0.45, Z0, {
      tint: [0.35, 0.3, 0.26],
    });
    b.boxMM("metal", X0 - 0.3, TOP - 0.55, Z0 - 0.5, cx1, TOP - 0.2, Z0, {
      tint: [0.3, 0.27, 0.24],
    });
    for (let x = X0 + 0.3; x < cx1 - 0.2; x += 0.9)
      b.boxMM("metal", x - 0.1, TOP - 0.85, Z0 - 0.75, x + 0.1, TOP - 0.2, Z0, {
        tint: [0.33, 0.29, 0.25],
      });
    // mansard + dormers + chimneys (bays 0-5)
    const slate = [0.34, 0.36, 0.38];
    b.quad(
      "rooftile",
      [cx1, TOP + 0.45, Z0 - 0.3],
      [X0 - 0.2, TOP + 0.45, Z0 - 0.3],
      [X0 - 0.2, TOP + 5.6, Z0 + 2.4],
      [cx1, TOP + 5.6, Z0 + 2.4],
      { tint: slate },
    );
    b.quad(
      "rooftile",
      [X0 - 0.2, TOP + 0.45, Z0 - 0.3],
      [X0 - 0.2, TOP + 0.45, Z1],
      [X0 + 2.2, TOP + 5.6, Z1],
      [X0 + 2.2, TOP + 5.6, Z0 + 2.4],
      { tint: slate },
    );
    b.boxMM(
      "concrete_dark",
      X0 - 0.2,
      TOP + 5.6,
      Z0 + 2.2,
      cx1,
      TOP + 5.9,
      Z0 + 2.6,
      { tint: [0.3, 0.3, 0.3] },
    );
    b.col(X0, TOP, Z0, cx1, TOP + 5.6, Z0 + 2.4, {
      tag: "roof",
      walkable: false,
    });
    b.col(X0, TOP, Z0, X0 + 2.2, TOP + 5.6, Z1, {
      tag: "roof",
      walkable: false,
    });
    for (let i = 0; i < 6; i++) {
      const dcx = X0 + i * BAYW + BAYW / 2;
      // gabled dormer
      b.boxMM(
        "brick_red",
        dcx - 1.1,
        TOP + 0.45,
        Z0 + 0.1,
        dcx + 1.1,
        TOP + 3.3,
        Z0 + 1.8,
        { tint: brick },
      );
      K.window(b, dcx, TOP + 1.9, Z0 + 0.1, 0, -1, 1.0, 1.7, {
        state: r() < 0.4 ? "broken" : "glass",
        sill: true,
        trimTint: [0.9, 0.86, 0.78],
      });
      b.quad(
        "rooftile",
        [dcx + 1.3, TOP + 3.3, Z0],
        [dcx, TOP + 4.6, Z0],
        [dcx, TOP + 4.6, Z0 + 1.9],
        [dcx + 1.3, TOP + 3.3, Z0 + 1.9],
        { tint: slate },
      );
      b.quad(
        "rooftile",
        [dcx, TOP + 4.6, Z0],
        [dcx - 1.3, TOP + 3.3, Z0],
        [dcx - 1.3, TOP + 3.3, Z0 + 1.9],
        [dcx, TOP + 4.6, Z0 + 1.9],
        { tint: slate },
      );
      b.quad(
        "brick_red",
        [dcx - 1.1, TOP + 3.3, Z0 + 0.1],
        [dcx + 1.1, TOP + 3.3, Z0 + 0.1],
        [dcx, TOP + 4.45, Z0 + 0.1],
        [dcx, TOP + 4.45, Z0 + 0.1],
        { tint: brick },
      );
      b.pipe(
        "black_iron",
        dcx,
        TOP + 4.6,
        Z0 - 0.05,
        dcx,
        TOP + 5.3,
        Z0 - 0.05,
        0.03,
        4,
      ); // finial
    }
    for (const [cx, cz] of [
      [X0 + 3, Z0 + 3.2],
      [X0 + 16, Z0 + 3.2],
      [X0 + 29, Z0 + 3.2],
      [X0 + 3, Z1 - 3],
      [X0 + 22, Z1 - 1.5],
    ]) {
      b.boxMM(
        "brick_red",
        cx - 0.7,
        TOP,
        cz - 0.5,
        cx + 0.7,
        TOP + 8.5,
        cz + 0.5,
        { tint: [0.8, 0.55, 0.46] },
      );
      b.boxMM(
        "limestone",
        cx - 0.8,
        TOP + 8.5,
        cz - 0.6,
        cx + 0.8,
        TOP + 8.8,
        cz + 0.6,
        { tint: [0.6, 0.58, 0.52] },
      );
      for (const s of [-0.35, 0, 0.35])
        b.cyl("rust", cx + s, TOP + 8.8, cz, 0.12, 0.12, 0.6, 6, {
          tint: [0.6, 0.45, 0.35],
        });
      b.col(cx - 0.7, TOP, cz - 0.5, cx + 0.7, TOP + 8.5, cz + 0.5, {
        tag: "chimney",
        walkable: false,
      });
    }
    // collapse: rubble on the broken NE roof, girders, and on the sidewalk
    for (let k = 0; k < 4; k++)
      K.rubble(
        b,
        collapsedX + 2 + k * 3.2,
        TOP - 5,
        Z0 + 4 + r() * 12,
        2.4,
        1.6,
        { seed: 11 + k, col: false },
      );
    for (let k = 0; k < 5; k++)
      b.beam(
        "rust",
        collapsedX + r() * 12,
        TOP - 5,
        Z0 + 1 + r() * 20,
        collapsedX + r() * 12,
        TOP - 2 + r() * 4,
        Z0 + 1 + r() * 20,
        0.22,
        0.3,
        { tint: [0.6, 0.45, 0.35] },
      );
    K.rubble(b, X1 - 5, 0, Z0 - 2.2, 3.2, 1.2, { seed: 91 });
    b.burn(X0 + BAYW * 7, TOP - 6, Z0, 9, 0.75);
    b.burn(X0 + BAYW * 1, 2.5, Z0, 4, 0.5);

    // ---- the vertical HOTEL CHELSEA sign (on the pier east of the entrance) ----
    const sx = X0 + BAYW * 4,
      sy0 = 7.0,
      sy1 = 20.5,
      sz = Z0 - 1.55;
    b.boxMM(
      "paint_black",
      sx - 0.28,
      sy0,
      sz - 0.02,
      sx + 0.28,
      sy1,
      Z0 - 0.3,
      { tint: [0.35, 0.33, 0.32] },
    );
    b.boxMM(
      "paint_black",
      sx - 0.22,
      sy1,
      sz + 0.1,
      sx + 0.22,
      sy1 + 1.4,
      Z0 - 0.35,
      { tint: [0.35, 0.33, 0.32] },
    ); // HOTEL crown
    for (const y of [sy0 + 1, sy0 + 5, sy0 + 9, sy1 - 0.4])
      b.beam("black_iron", sx, y, sz + 0.4, sx, y + 0.7, Z0, 0.08, 0.08, {
        tint: lace,
      });
    const vtx = K.neonCell("chelsea_vert", "CHELSEA", 96, 768, {
      color: "#ff2a1a",
      vertical: true,
      font: "Georgia, serif",
    });
    const htx = K.neonCell("chelsea_hotel_word", "HOTEL", 256, 72, {
      color: "#ff2a1a",
      font: "Georgia, serif",
    });
    for (const s of [-1, 1]) {
      b.plate(
        "neon",
        sx + s * 0.29,
        (sy0 + sy1) / 2,
        (sz + Z0 - 0.3) / 2,
        s,
        0,
        1.2,
        sy1 - sy0 - 0.3,
        vtx,
        { off: 0.01 },
      );
      b.plate(
        "neon",
        sx + s * 0.23,
        sy1 + 0.7,
        (sz + 0.1 + Z0 - 0.35) / 2,
        s,
        0,
        1.05,
        0.34,
        htx,
        { off: 0.01 },
      );
    }
    b.plate(
      "neon",
      sx,
      (sy0 + sy1) / 2,
      sz - 0.03,
      0,
      -1,
      0.5,
      sy1 - sy0 - 0.3,
      vtx,
      { off: 0.01 },
    );
    for (let y = sy0 + 0.6; y < sy1; y += 1.6)
      b.glow(sx, y, sz + 0.4, [1, 0.2, 0.12], 3.2);
    b.glow(sx, sy1 + 0.7, sz + 0.6, [1, 0.2, 0.12], 2.4);

    // ---- roof garden (walkable at TOP, reached from the penthouse) ----
    const RX = ROOF.x,
      RZ = ROOF.z;
    b.boxMM(
      "brick_red",
      RX - 1.6,
      TOP,
      RZ - 1.4,
      RX + 1.6,
      TOP + 3.0,
      RZ + 1.4,
      { tint: brick },
    ); // stair bulkhead
    b.boxMM(
      "metal_dark",
      RX - 1.8,
      TOP + 3.0,
      RZ - 1.6,
      RX + 1.8,
      TOP + 3.2,
      RZ + 1.6,
      {},
    );
    b.plate("wood", RX, TOP + 1.1, RZ - 1.42, 0, -1, 1.0, 2.1, null, {
      tint: [0.6, 0.45, 0.35],
    });
    b.boxMM(
      "limestone",
      RX - 0.65,
      TOP,
      RZ - 1.5,
      RX + 0.65,
      TOP + 2.3,
      RZ - 1.4,
      { faces: "n", tint: [0.6, 0.58, 0.52] },
    );
    b.col(RX - 1.6, TOP, RZ - 1.4, RX + 1.6, TOP + 3.2, RZ + 1.4, {
      tag: "bulkhead",
    });
    // parapets around the deck
    b.boxMM("brick_red", X0 + 2.2, TOP, Z1 - 0.4, collapsedX, TOP + 1.1, Z1, {
      tint: brick,
    });
    b.col(X0, TOP, Z1 - 0.4, collapsedX, TOP + 1.1, Z1, {
      tag: "parapet",
      walkable: false,
    });
    K.railing(b, collapsedX, Z0 + 2.4, collapsedX, Z1, TOP, {
      h: 1.0,
      mat: "black_iron",
    });
    // water tower on steel legs
    const wx = X0 + 12,
      wz = Z1 - 7;
    for (const [ox, oz] of [
      [-1.4, -1.4],
      [1.4, -1.4],
      [-1.4, 1.4],
      [1.4, 1.4],
    ]) {
      b.beam(
        "rust",
        wx + ox,
        TOP,
        wz + oz,
        wx + ox * 0.85,
        TOP + 4.2,
        wz + oz * 0.85,
        0.2,
        0.2,
      );
      b.col(
        wx + ox - 0.15,
        TOP,
        wz + oz - 0.15,
        wx + ox + 0.15,
        TOP + 4.2,
        wz + oz + 0.15,
        { walkable: false },
      );
    }
    b.boxMM(
      "rust",
      wx - 1.6,
      TOP + 4.2,
      wz - 1.6,
      wx + 1.6,
      TOP + 4.4,
      wz + 1.6,
      {},
    );
    b.cyl("wood_rotten", wx, TOP + 4.4, wz, 1.9, 1.9, 4.0, 16, {
      tint: [0.6, 0.5, 0.4],
    });
    for (let k = 0; k < 4; k++)
      b.cyl("rust", wx, TOP + 4.8 + k * 0.95, wz, 1.93, 1.93, 0.08, 16, {
        top: false,
      });
    b.cyl("wood_rotten", wx, TOP + 8.4, wz, 2.0, 0.2, 1.6, 16, {
      tint: [0.45, 0.4, 0.35],
    });
    // garden beds, pergola, deck chairs, skylight
    for (let k = 0; k < 4; k++) {
      const gx = X0 + 20 + k * 3.2,
        gz = Z1 - 3;
      b.boxMM(
        "wood_rotten",
        gx - 1.3,
        TOP,
        gz - 0.6,
        gx + 1.3,
        TOP + 0.6,
        gz + 0.6,
        { tint: [0.6, 0.5, 0.4] },
      );
      b.boxMM(
        "dirt",
        gx - 1.2,
        TOP + 0.6,
        gz - 0.5,
        gx + 1.2,
        TOP + 0.62,
        gz + 0.5,
        {},
      );
      for (let p = 0; p < 5; p++)
        b.cyl(
          "cloth_green",
          gx - 1 + p * 0.5,
          TOP + 0.6,
          gz + (r() - 0.5) * 0.5,
          0.05,
          0.12,
          0.4 + r() * 0.4,
          5,
          { tint: [0.45, 0.55, 0.25] },
        ); // gnarlberry / potatoes
      b.col(gx - 1.3, TOP, gz - 0.6, gx + 1.3, TOP + 0.6, gz + 0.6, {
        tag: "planter",
      });
    }
    for (const px of [X0 + 8, X0 + 14])
      for (const pz of [Z0 + 6, Z0 + 12])
        b.beam("wood", px, TOP, pz, px, TOP + 2.6, pz, 0.14, 0.14);
    for (let k = 0; k < 8; k++)
      b.beam(
        "wood",
        X0 + 7.8,
        TOP + 2.6,
        Z0 + 5.8 + k * 0.9,
        X0 + 14.2,
        TOP + 2.6,
        Z0 + 5.8 + k * 0.9,
        0.08,
        0.12,
      );
    b.cyl("glass", -80, TOP, 62.5, 2.2, 1.6, 0.9, 12, {
      tint: [0.5, 0.6, 0.6],
    }); // the stairwell skylight
    b.col(-82.2, TOP, 60.3, -77.8, TOP + 0.9, 64.7, { tag: "skylight" });
    // ---- side & rear elevations (the avenue corners and 26th St — they used to be blank brick slabs) ----
    sideElevations(b, r);

    // ---- street dressing ----
    const board = K.signCell(
      "chelsea_board",
      "HOTEL CHELSEA\nARTISTS & STRAYS WELCOME",
      384,
      192,
      {
        bg: "#5a4632",
        fg: "#e8dcc0",
        font: "Georgia, serif",
        sub: "no raiders · no maniacs · no critics",
      },
    );
    b.boxMM("wood_rotten", dx + 3.4, 0, Z0 - 1.6, dx + 3.5, 1.9, Z0 - 1.5, {});
    b.plate("art", dx + 3.45, 1.35, Z0 - 1.62, 0, -1, 1.5, 0.75, board);
    for (const s of [-1, 1])
      b.glow(dx + s * 1.1, 3.1, Z0 - 0.5, [1, 0.75, 0.45], 1.2);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_chelsea_ext";

    // anchors & world loot (authoring frame → flipped onto 23rd Street)
    const wa = (name, x, y, z) => {
      const q = fp(x, z);
      K.anchor(ctx, name, q.x, y, q.z, false);
    };
    const wl = (type, x, y, z, yaw, o) => {
      const q = fp(x, z);
      K.loot(
        ctx,
        type,
        q.x,
        y,
        q.z,
        (yaw || 0) + PI,
        Object.assign({ world: true }, o),
      );
    };
    wa("door", dx, 0, Z0 - 1.4);
    wa("street", dx, 0, Z0 - 5);
    wa("doorman", dx - 2.3, 0, Z0 - 0.9);
    wa("roof", RX, TOP, RZ - 2.6);
    // loot on the street / roof
    wl("barrel", dx + 4.8, 0, Z0 - 2.2, 0, { burning: true, container: false });
    wl("sandbags", dx - 4.5, 0, Z0 - 2.4, 0, { container: false });
    wl("footlocker", X0 + 20, TOP, Z0 + 7, 0.4, {
      loot: "footlocker",
      name: "Gardener's Chest",
    });
    wl("chair", X0 + 10, TOP, Z0 + 8, 2.5, { kind: "wood", container: false });
  }
