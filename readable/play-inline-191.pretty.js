/* src/poi_village/10_chelsea.js */
/* =====================================================================
 * NEW RAD CITY — poi_village / 10_chelsea.js
 * HOTEL CHELSEA (West 23rd Street) — friendly artists' commune of survivors.
 *
 * EXTERIOR (site x -110..-50, z 47..78, façade on 23rd St facing north):
 *   ten-storey red-brick Victorian Gothic block, eight bays of cast-iron
 *   lace balconies, limestone string courses, bracketed cornice, slate
 *   mansard with gabled dormers & chimneys (NE corner collapsed), the
 *   vertical red HOTEL CHELSEA neon blade, entrance canopy, El Quijote
 *   neon, bronze plaques, a walkable roof garden with a water tower.
 * INTERIOR (cell chelsea_hotel, 4 levels, 4.2 m apart):
 *   L0  lobby (salon-hung art, fireplace, front desk & key cubbies, the
 *       girl-on-a-swing sculpture, elevator), manager's office
 *   —   THE STAIRWELL: cast-iron lace balustrades & mahogany rail winding
 *       round an open well to a skylight, every wall hung with paintings,
 *       a junk mobile hanging down the well
 *   L1  Odile's studio, Leopold's gallery (merchant), commune kitchen
 *   L2  Room 822 (Johnny Nitro), the Writer's room (skeleton, manuscript),
 *       laundry & storage
 *   L3  the Skylight Penthouse of the late Aurelio Moretz (key: the quest
 *       reward, or Stanley's spare for the back rent), roof access → roof
 *       garden (exterior)
 * QUEST "The Last Portrait": Odile's painting was stolen by the Tombs
 *   raiders → recover it (Warden's office) → return it (key + beret,
 *   +standing) or sell it to Leopold (scrip, −standing).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._pv;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // ---- exterior frame (AUTHORING frame, world units) ----
  // Loop round 1: the building now fills its whole LAYOUT site (x −110..−50, z 47..78 — flush to the building line
  // of 7th / 8th Avenue and 26th / 23rd Street) and is turned 180° (FLIP) so the façade authored here "facing north"
  // stands on WEST 23RD STREET (the site's south side, z = 78) as in NYC; the old front faced 26th Street.
  // Everything built by the exterior builder is flipped by the kit; world positions made here go through fp().
  const X0 = -110,
    X1 = -50,
    Z0 = 47,
    Z1 = 78;

  // ---- locks (G.locks): every unlock is placed in this file ----
  const LK = {
    hotelSafe: K.regLock({
      id: "pv_lk_chelsea_safe",
      label: "Hotel Safe (Front Office)",
      kind: "safe",
      code: "1884",
      hint: "The front-office teletype gives the combination.",
      learnedFrom: "Hotel Chelsea front-office teletype",
    }),
    storage: K.regLock({
      id: "pv_lk_chelsea_storage",
      label: "Laundry Storage Locker",
      kind: "container",
      code: "4119",
      hint: "Stanley's laundry complaint, pinned over Tub #2, ends with the combination.",
      learnedFrom: "Laundry Complaint (third floor)",
    }),
    strongbox: K.regLock({
      id: "pv_lk_chelsea_strongbox",
      label: "Moretz's Strongbox",
      kind: "safe",
      code: "311896",
      hint: "Moretz's sketchbook in the penthouse ends with his birthday.",
      learnedFrom: "Moretz's Sketchbook (penthouse)",
    }),
    penthouse: K.regLock({
      id: "pv_lk_chelsea_penthouse",
      label: "Penthouse — A. Moretz",
      kind: "door",
      key: "pv_key_penthouse",
      hint: "Odile gives Moretz's key for her portrait; Stanley sells the spare for the back rent.",
      keyFrom: [
        "Odile (The Last Portrait reward)",
        "Stanley, front desk (200 scrip back rent)",
      ],
    }),
  };
  const FLIP = { cx: (X0 + X1) / 2, cz: (Z0 + Z1) / 2 };
  const fp = (x, z) => ({ x: 2 * FLIP.cx - x, z: 2 * FLIP.cz - z });
  const GF = 5.0,
    FH = 3.3,
    NF = 9; // ground floor, upper floor height, upper floors
  const TOP = GF + NF * FH; // 34.7
  const BAYW = (X1 - X0) / 8; // 8 bays (7.5 m)
  const WIN_OFF = 1.8; // paired windows ± from the bay centre
  const DOOR_X = X0 + BAYW * 3.5; // entrance bay (bay 3) centre (authoring frame)
  const ROOF = { x: -84, y: TOP, z: 66 }; // roof-garden bulkhead door
  // ---- interior levels ----
  const LV = [0, 4.2, 8.4, 12.6];
  const CH = 3.8; // ceiling height

  // ==================================================================
  // EXTERIOR
  // ==================================================================
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
  function i7top(f) {
    return GF + (f + 1) * FH <= TOP - 3.4;
  }

  /**
   * Side (avenue) and rear elevations: punched sash windows with limestone lintels on every floor, a rusticated
   * base course with shop windows at the front corners, black zig-zag fire escapes, and a faded painted ghost sign
   * on the windowless upper rear of the west wall. All in the authoring frame (the builder flips it).
   */
  function sideElevations(b, r) {
    const trim = [0.9, 0.86, 0.78];
    const winState = (f) => {
      const u = r();
      return u < 0.16
        ? "boarded"
        : u < 0.34
          ? "broken"
          : f <= 3 && u > 0.86
            ? "lit"
            : "glass";
    };
    const zs = [];
    for (let i = 0; i < 7; i++) zs.push(Z0 + 3 + (i * (Z1 - Z0 - 6)) / 6);
    const collapsedTop = TOP - 5;
    // --- base course + string courses on both sides
    for (const [x, nx, top] of [
      [X0, -1, TOP],
      [X1, 1, collapsedTop],
    ]) {
      b.boxMM("limestone", x, GF - 0.45, Z0, x + nx * 0.4, GF, Z1, {
        tint: [0.85, 0.8, 0.7],
      });
      b.boxMM("brick_brown", x, 0, Z0, x + nx * 0.25, 0.7, Z1, {
        tint: [0.55, 0.45, 0.38],
      });
      for (let f = 1; f < NF; f++) {
        const y = GF + f * FH;
        if (y > top - 0.5) break;
        b.boxMM("limestone", x, y - 0.1, Z0, x + nx * 0.12, y + 0.06, Z1, {
          tint: trim,
        });
      }
      // ground floor: two big shop windows at the front corner, a service door, boarded rear
      K.window(b, x, 2.3, Z0 + 4.2, nx, 0, 4.6, 2.9, {
        state: nx < 0 ? "broken" : "boarded",
        sill: false,
        frame: "paint_green",
        reveal: "brick_brown",
        inset: 0.22,
      });
      K.window(b, x, 2.3, Z0 + 10.2, nx, 0, 4.6, 2.9, {
        state: "boarded",
        sill: false,
        frame: "paint_green",
        reveal: "brick_brown",
        inset: 0.22,
      });
      b.boxMM("paint_green", x, 0, Z1 - 7.2, x + nx * 0.1, 2.5, Z1 - 5.8, {
        tint: [0.3, 0.38, 0.3],
      }); // service door
      b.boxMM("limestone", x, 2.5, Z1 - 7.4, x + nx * 0.18, 2.72, Z1 - 5.6, {
        tint: trim,
      });
      b.plate(
        "decal",
        x + nx * 0.05,
        1.5,
        Z1 - 11.5,
        nx,
        0,
        3.0,
        1.1,
        K.tag(
          nx < 0 ? "SID & NANCY 4EVR" : "ART IS NOT DEAD",
          nx < 0 ? "#e04040" : "#40c0e0",
          256,
          96,
          { rot: -0.05 },
        ),
      );
      // upper floors
      for (let f = 0; f < NF; f++) {
        const y0 = GF + f * FH;
        if (y0 + FH > top - 0.3) break;
        zs.forEach((wz, i) => {
          if (nx < 0 && f >= 6 && i >= 3) return; // the ghost-sign wall (west, upper rear)
          K.window(b, x, y0 + 1.5, wz, nx, 0, 1.1, 1.95, {
            state: winState(f),
            lintel: 0.22,
            trimTint: trim,
            frame: "paint_cream",
            reveal: "brick_red",
          });
        });
      }
      // fire escape over windows 1–2
      const fyMax = nx < 0 ? NF : 6;
      const ys = [];
      for (let f = 0; f < fyMax; f++) ys.push(GF + f * FH + 0.12);
      K.fireEscape(b, x, (zs[1] + zs[2]) / 2, nx, 0, 6.2, ys, {
        seed: nx < 0 ? 5 : 6,
      });
    }
    // --- the painted ghost sign (west wall, floors 7–9, rear half)
    K.ghostSign(
      b,
      X0,
      GF + 7.5 * FH,
      (zs[3] + Z1) / 2 + 0.6,
      -1,
      0,
      Z1 - zs[3] - 1.2,
      FH * 2.8,
      ["HOTEL CHELSEA", "500 ROOMS · 400 BATHS", "ABSOLUTELY FIREPROOF"],
      {
        key: "chelsea_ghost",
        fg: "rgba(238,228,200,0.8)",
        bg: "rgba(60,40,32,0.35)",
      },
    );
    // --- rear elevation (26th Street): paired windows per bay, fire escapes on bays 1 and 5, a bricked-up base
    for (let i = 0; i < 8; i++) {
      const cx = X0 + i * BAYW + BAYW / 2;
      K.window(b, cx, 2.4, Z1, 0, 1, 2.2, 2.4, {
        state: i % 3 === 1 ? "boarded" : "dark",
        sill: false,
        reveal: "brick_brown",
        inset: 0.16,
      });
      for (let f = 0; f < NF; f++) {
        const y0 = GF + f * FH;
        for (const s of [-1, 1])
          K.window(b, cx + s * WIN_OFF, y0 + 1.5, Z1, 0, 1, 1.1, 1.95, {
            state: winState(f),
            lintel: 0.2,
            trimTint: trim,
            frame: "paint_cream",
            reveal: "brick_red",
          });
      }
      if (i === 1 || i === 5) {
        const ys = [];
        for (let f = 0; f < NF; f++) ys.push(GF + f * FH + 0.12);
        K.fireEscape(b, cx, Z1, 0, 1, 6.0, ys, { seed: 10 + i });
      }
    }
    for (let f = 1; f < NF; f++)
      b.boxMM(
        "limestone",
        X0,
        GF + f * FH - 0.1,
        Z1,
        X1,
        GF + f * FH + 0.06,
        Z1 + 0.12,
        { tint: [0.8, 0.76, 0.68] },
      );
    b.boxMM("limestone", X0, GF - 0.45, Z1, X1, GF, Z1 + 0.4, {
      tint: [0.8, 0.76, 0.68],
    });
    b.boxMM("metal", X0, TOP - 0.3, Z1, X1, TOP + 0.35, Z1 + 0.5, {
      tint: [0.33, 0.29, 0.25],
    }); // rear cornice
    K.rubble(b, X1 - 8, 0, Z1 + 1.4, 2.2, 0.9, { seed: 44, col: false });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "chelsea_int",
      off: O,
      lit: true,
      amb: [0.07, 0.065, 0.06],
      floors: LV.concat([2.1, 6.3, 10.5]),
      grime: 0.45,
    });
    const r = K.rng("chelsea_int");
    const wallW = [0.78, 0.66, 0.56],
      wainC = [0.55, 0.36, 0.26];

    // ---------------- stair hall (x -4..4, z -21..-12, 0..16.8) ----------------
    const SH = { x0: -4, x1: 4, z0: -21, z1: -12 };
    K.room(b, ctx, {
      x0: -4,
      z0: -21,
      x1: 4,
      z1: -12,
      y: 0,
      h: 16.8,
      floor: "mosaic",
      fc: [0.8, 0.76, 0.7],
      wall: "plaster",
      wc: [0.72, 0.62, 0.5],
      open: { s: true },
      noCeil: true,
      trim: true,
    });
    // skylight ceiling
    b.face("plaster", -4, 16.8, -21, 1, 0, 0, 0, 0, 1, 8, 9, {
      uv: "top",
      tint: [0.6, 0.58, 0.55],
    });
    b.boxMM("lamp", -1.6, 16.75, -18, 1.6, 16.78, -14, {
      tint: [0.75, 0.82, 0.88],
    });
    for (let k = 0; k <= 4; k++)
      b.boxMM(
        "black_iron",
        -1.6 + k * 0.8 - 0.03,
        16.6,
        -18,
        -1.6 + k * 0.8 + 0.03,
        16.75,
        -14,
        {},
      );
    b.light(0, 16.2, -16, [0.75, 0.85, 1.0], 1.6, 18, {
      box: [-4.1, 0, -21.1, 4.1, 17, -11.9],
    });
    b.glow(0, 16.3, -16, [0.5, 0.6, 0.7], 6);
    for (let lv = 0; lv < 4; lv++) {
      const y = LV[lv];
      // south landing slab (upper levels) — z -14..-12
      if (lv > 0) {
        b.boxMM("marble", -4, y - 0.3, -14, 4, y, -12, {
          tint: [0.7, 0.66, 0.6],
          faces: "nsewtb",
        });
        b.col(-4, y - 0.3, -14, 4, y, -12, {
          tag: "floor",
          surface: "concrete",
        });
      }
      // slab edge band facing the well at z=-12 (between this level's ceiling and the next floor)
      if (lv < 3)
        b.quad(
          "plaster",
          [-4, LV[lv] + CH, -12.02],
          [4, LV[lv] + CH, -12.02],
          [4, LV[lv + 1], -12.02],
          [-4, LV[lv + 1], -12.02],
          { tint: [0.5, 0.45, 0.4] },
        );
      // well railing on the landing edge (lace)
      K.railing(b, -1.6, -14, 1.6, -14, y, { lace: true, h: 1.0 });
      if (lv === 3) {
        K.railing(b, -4, -14, -1.6, -14, y, { lace: true });
        K.railing(b, -1.6, -14, -1.6, -18, y, { lace: true });
      }
      // sconce by the landing
      for (const s of [-1, 1]) {
        b.boxMM(
          "brass",
          s * 3.85 - 0.06,
          y + 2.2,
          -12.9,
          s * 3.85 + 0.06,
          y + 2.5,
          -12.6,
          {},
        );
        K.lamp(
          b,
          s * 3.7,
          y + 2.55,
          -12.75,
          "globe",
          [1, 0.78, 0.5],
          0.9,
          5.5,
          {
            ceil: y + 2.6,
            size: 0.12,
            lightOpts: { box: [-4.1, y - 0.5, -21.1, 4.1, y + 4.3, -11.9] },
          },
        );
      }
      if (lv < 3) {
        const ym = y + 2.1;
        // west flight up (−z), east flight up (+z)
        K.stairs(b, -4, -18, -1.6, -14, y, ym, "-z", {
          mat: "marble",
          tint: [0.72, 0.68, 0.62],
          rail: "r",
          lace: true,
          surface: "concrete",
        });
        K.stairs(b, 1.6, -18, 4, -14, ym, LV[lv + 1], "+z", {
          mat: "marble",
          tint: [0.72, 0.68, 0.62],
          rail: "r",
          lace: true,
          surface: "concrete",
        });
        // mid landing
        b.boxMM("marble", -4, ym - 0.3, -21, 4, ym, -18, {
          tint: [0.7, 0.66, 0.6],
          faces: "nsewtb",
        });
        b.col(-4, ym - 0.3, -21, 4, ym, -18, {
          tag: "floor",
          surface: "concrete",
        });
        K.railing(b, -1.6, -18, 1.6, -18, ym, { lace: true });
        K.lamp(b, 0, ym + 2.6, -19.6, "bulb", [1, 0.8, 0.55], 0.9, 6, {
          ceil: ym + 3.6,
          lightOpts: { box: [-4.1, ym - 0.5, -21.1, 4.1, ym + 4, -17] },
        });
        // paintings above the mid landing (north wall) and along the flights
        K.salonWall(
          b,
          -3.9,
          3.9,
          ym + 0.9,
          ym + 3.9,
          -21 + 0.1,
          0,
          1,
          "sh_n" + lv,
          { density: 0.9 },
        );
        K.salonWall(b, -18, -12.5, y + 1.3, y + 3.9, -3.9, 1, 0, "sh_w" + lv, {
          density: 0.9,
        });
        K.salonWall(
          b,
          -20.8,
          -12.5,
          y + 1.3,
          y + 3.9,
          3.9,
          -1,
          0,
          "sh_e" + lv,
          { density: 0.9 },
        );
      }
    }
    // under the lowest flights / landing at L0: storage closet + bench nook
    b.boxMM("mahogany", 1.6, 0, -18, 4, 2.05, -14, { tint: [0.6, 0.45, 0.35] });
    b.col(1.6, 0, -18, 4, 2.05, -14, { tag: "wall" });
    b.plate("wood_dark", 1.58, 1.0, -16, -1, 0, 0.9, 1.9, null, {
      tint: [0.45, 0.32, 0.22],
    });
    b.boxMM("mahogany", -4, 0, -21, 4, 1.78, -18, { tint: [0.55, 0.42, 0.32] });
    b.col(-4, 0, -21, 4, 1.78, -18, { tag: "wall" });
    K.framed(b, 0, 1.0, -17.98, 0, 1, 1.4, 1.0, K.painting(7, 192, 144), {});
    // the junk mobile hanging down the well
    {
      b.pipe("black_iron", 0, 16.6, -16, 0, 6.0, -16, 0.012, 3);
      for (let k = 0; k < 9; k++) {
        const y = 15.5 - k * 1.1,
          a = k * 1.3,
          rds = 0.6 + (k % 3) * 0.35;
        b.pipe(
          "black_iron",
          -Math.cos(a) * rds,
          y,
          -16 - Math.sin(a) * rds,
          Math.cos(a) * rds,
          y,
          -16 + Math.sin(a) * rds,
          0.01,
          3,
        );
        for (const s of [-1, 1]) {
          const px = s * Math.cos(a) * rds,
            pz = -16 + s * Math.sin(a) * rds;
          b.pipe("black_iron", px, y, pz, px, y - 0.4, pz, 0.006, 3);
          const kind = (k + (s > 0 ? 1 : 0)) % 4;
          if (kind === 0)
            b.cyl("chrome", px, y - 0.45, pz, 0.22, 0.22, 0.04, 12, {
              bottom: true,
            }); // hubcap
          else if (kind === 1)
            b.cyl("glass", px, y - 0.7, pz, 0.05, 0.05, 0.28, 6, {
              tint: [0.6, 0.2, 0.15],
            }); // bottle
          else if (kind === 2)
            b.box("paint_red", px, y - 0.75, pz, 0.35, 0.35, 0.02, { yaw: a }); // tin sign
          else
            b.geo("gold", K.sphereGeo(), {
              x: px,
              y: y - 0.55,
              z: pz,
              s: 0.12,
            }); // christmas bauble
        }
      }
    }

    // ---------------- L0 lobby (x -8..8, z -12..0) ----------------
    K.gap(ctx, 0, 0, 2.4, 0, 3.0, { casing: true }); // street doors
    K.gap(ctx, 0, -12, 8, 0, CH, { casing: false }); // to the stair hall
    K.gap(ctx, -6, -12, 1.1, 0, 2.3); // manager's office
    const lobby = {
      x0: -8,
      z0: -12,
      x1: 8,
      z1: 0,
      y: 0,
      h: CH,
      floor: "terrazzo",
      fc: [0.85, 0.8, 0.72],
      wall: "wallpaper",
      wc: wallW,
      wain: "wood_dark",
      wainC,
      wainH: 1.1,
      ceil: "tin",
      cc: [0.75, 0.7, 0.58],
      cornice: true,
      corniceMat: "plaster",
    };
    K.room(b, ctx, lobby);
    b.hplate("carpet", -4.6, 0.012, -6, 5.4, 4.4, 0, null, {
      tint: [0.9, 0.8, 0.75],
    });
    b.hplate("carpet", 0, 0.012, -2.2, 2.2, 3.6, 0, null, {
      tint: [0.8, 0.7, 0.65],
    });
    // fireplace on the west wall
    {
      const fx = -7.9;
      b.boxMM("marble", fx, 0, -7.4, fx + 0.5, 1.45, -6.9, {
        tint: [0.8, 0.78, 0.72],
      });
      b.boxMM("marble", fx, 0, -5.1, fx + 0.5, 1.45, -4.6, {
        tint: [0.8, 0.78, 0.72],
      });
      b.boxMM("marble", fx, 1.1, -6.9, fx + 0.5, 1.45, -5.1, {
        tint: [0.8, 0.78, 0.72],
      });
      b.boxMM("marble", fx, 1.45, -7.7, fx + 0.7, 1.6, -4.3, {
        tint: [0.75, 0.72, 0.66],
      });
      b.boxMM("paint_black", fx - 0.02, 0, -6.9, fx + 0.3, 1.1, -5.1, {
        faces: "e",
        tint: [0.12, 0.1, 0.08],
      });
      b.boxMM("brick_brown", fx, 0, -6.9, fx + 0.48, 0.12, -5.1, {
        tint: [0.3, 0.25, 0.2],
      });
      for (let k = 0; k < 3; k++)
        b.pipe(
          "wood_dark",
          fx + 0.2,
          0.18 + k * 0.08,
          -6.6 + k * 0.1,
          fx + 0.35,
          0.18 + k * 0.06,
          -5.4 - k * 0.1,
          0.07,
          6,
          { tint: [0.35, 0.2, 0.12] },
        );
      b.light(fx + 0.8, 0.5, -6, [1.0, 0.5, 0.2], 2.2, 7.5, {
        box: [-8.1, -0.1, -12.1, 8.1, 4, 0.1],
      });
      b.glow(fx + 0.35, 0.45, -6, [1, 0.45, 0.15], 1.6);
      b.col(fx, 0, -7.7, fx + 0.7, 1.6, -4.3, { tag: "furniture" });
      K.framed(b, -7.9, 2.65, -6, 1, 0, 1.9, 1.3, K.painting(3, 240, 168), {
        frame: "gold",
        fw: 0.1,
      });
      // mantel clutter
      b.cyl("brass", fx + 0.4, 1.6, -7.2, 0.06, 0.04, 0.35, 6);
      b.cyl("brass", fx + 0.4, 1.6, -4.8, 0.06, 0.04, 0.35, 6);
      b.box("wood_dark", fx + 0.35, 1.6, -6, 0.25, 0.3, 0.45, {});
    }
    K.sofa(b, -3.6, 0, -6, 2.4, HP, {
      mat: "velvet",
      tint: [0.75, 0.35, 0.35],
    });
    K.sofa(b, -5.9, 0, -3.3, 1.0, 0, {
      mat: "velvet",
      tint: [0.4, 0.5, 0.4],
      len: 1,
    });
    K.sofa(b, -5.9, 0, -8.7, 1.0, PI, { mat: "velvet", tint: [0.4, 0.5, 0.4] });
    K.table(b, -5.6, 0, -6, 1.1, 0.7, { h: 0.45, mat: "mahogany" });
    // front desk & key cubbies (east)
    b.boxMM("mahogany", 4.6, 0, -10, 5.4, 1.1, -2.6, {
      tint: [0.7, 0.45, 0.35],
    });
    b.boxMM("marble", 4.5, 1.1, -10.1, 5.5, 1.16, -2.5, {
      tint: [0.6, 0.55, 0.5],
    });
    for (let z = -9.6; z < -2.8; z += 0.9)
      b.boxMM("wood_dark", 4.55, 0.15, z, 4.6, 0.95, z + 0.7, {
        tint: [0.5, 0.3, 0.22],
      }); // panels
    b.col(4.5, 0, -10.1, 5.5, 1.16, -2.5, { tag: "counter", surface: "wood" });
    b.boxMM("mahogany", 7.55, 0.9, -9.5, 7.95, 3.2, -3.5, {
      tint: [0.6, 0.4, 0.3],
    });
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 12; col++) {
        const z = -9.35 + col * 0.49,
          y = 1.05 + row * 0.42;
        b.boxMM("wood", 7.5, y, z, 7.56, y + 0.34, z + 0.4, {
          tint: [0.55, 0.4, 0.3],
          faces: "w",
        });
        b.boxMM("mahogany", 7.44, y - 0.04, z - 0.04, 7.55, y, z + 0.44, {});
        if (r() < 0.5)
          b.boxMM(
            "brass",
            7.45,
            y + 0.05,
            z + 0.15,
            7.5,
            y + 0.2,
            z + 0.25,
            {},
          );
      }
    b.col(7.5, 0, -9.6, 8, 3.2, -3.4, { tag: "furniture" });
    b.cyl("brass", 4.9, 1.16, -8.5, 0.07, 0.03, 0.08, 8); // desk bell
    b.box("leather", 4.95, 1.16, -5.2, 0.35, 0.06, 0.5, {}); // guest ledger
    K.lamp(b, 5.0, 1.55, -4.0, "pendant", [1, 0.85, 0.55], 0.9, 4.5, {
      ceil: 1.9,
      shade: "paint_green",
    });
    b.box("brass", 5.0, 1.16, -4.0, 0.2, 0.3, 0.2, {});
    // the elevator (east of the stair opening) — brass doors, OUT OF ORDER
    b.boxMM("brass", 5.1, 0, -11.95, 7.1, 2.5, -11.85, {
      tint: [0.7, 0.55, 0.3],
    });
    b.beam("paint_black", 6.1, 0, -11.83, 6.1, 2.5, -11.83, 0.02, 0.02);
    b.cyl("brass", 6.1, 2.75, -11.9, 0.35, 0.35, 0.05, 12, {
      tint: [0.6, 0.5, 0.3],
    });
    b.plate(
      "art",
      6.1,
      1.4,
      -11.82,
      0,
      1,
      0.7,
      0.25,
      K.signCell("ooo", "OUT OF ORDER", 256, 80, {
        bg: "#e8e0c8",
        fg: "#8a1a10",
        font: "Arial, sans-serif",
      }),
    );
    // hanging sculpture: the girl on the swing
    {
      const sx = 1.8,
        sz = -5.5,
        sy = 2.2;
      for (const s of [-1, 1])
        b.pipe(
          "fabric",
          sx + s * 0.45,
          sy,
          sz,
          sx + s * 0.45,
          CH,
          sz,
          0.012,
          3,
          { tint: [0.6, 0.55, 0.45] },
        );
      b.box("wood", sx, sy - 0.05, sz, 1.1, 0.05, 0.3, {
        tint: [0.6, 0.45, 0.3],
      });
      b.cyl("cloth_red", sx, sy, sz, 0.34, 0.1, 0.55, 10, {
        tint: [0.95, 0.5, 0.6],
        bottom: true,
      }); // dress
      b.geo("ceramic", K.sphereGeo(), {
        x: sx,
        y: sy + 0.72,
        z: sz,
        s: 0.13,
        tint: [0.95, 0.85, 0.75],
      });
      b.cyl("paint_yellow", sx, sy + 0.72, sz + 0.03, 0.15, 0.12, 0.12, 8, {
        tint: [0.9, 0.7, 0.3],
      }); // hair
      for (const s of [-1, 1]) {
        b.pipe(
          "ceramic",
          sx + s * 0.1,
          sy,
          sz - 0.1,
          sx + s * 0.14,
          sy - 0.45,
          sz - 0.35,
          0.04,
          5,
          { tint: [0.95, 0.85, 0.75] },
        );
        b.pipe(
          "ceramic",
          sx + s * 0.3,
          sy + 0.5,
          sz,
          sx + s * 0.45,
          sy + 0.9,
          sz,
          0.03,
          5,
          { tint: [0.95, 0.85, 0.75] },
        );
      }
    }
    // chandelier
    {
      const cx = -1.2,
        cz = -6.4,
        cy = 3.0;
      b.pipe("brass", cx, cy, cz, cx, CH, cz, 0.02, 4);
      b.cyl("brass", cx, cy - 0.05, cz, 0.7, 0.7, 0.05, 16, {
        top: false,
        bottom: true,
      });
      for (let k = 0; k < 8; k++) {
        const a = (k * PI) / 4;
        b.geo("lamp", K.sphereGeo(), {
          x: cx + Math.cos(a) * 0.7,
          y: cy + 0.08,
          z: cz + Math.sin(a) * 0.7,
          s: 0.07,
          tint: [1, 0.8, 0.55],
        });
      }
      b.light(cx, cy - 0.3, cz, [1, 0.78, 0.5], 1.5, 11, {
        box: [-8.1, -0.1, -12.1, 8.1, 4, 0.1],
      });
      b.glow(cx, cy, cz, [0.8, 0.6, 0.4], 3.2);
    }
    b.light(0, 2.6, -0.8, [0.7, 0.75, 0.85], 0.7, 6, {
      box: [-8.1, -0.1, -12.1, 8.1, 4, 0.1],
    }); // daylight through the transom
    b.light(6.5, 2.4, -7, [1, 0.8, 0.55], 0.6, 5, {
      box: [-8.1, -0.1, -12.1, 8.1, 4, 0.1],
    });
    // street doors (inside view)
    for (const s of [-1, 1]) {
      b.boxMM("brass", s * 0.6 - 0.55, 0, -0.12, s * 0.6 + 0.55, 2.95, -0.02, {
        tint: [0.5, 0.42, 0.28],
      });
      b.plate("lamp", s * 0.6, 1.7, -0.13, 0, -1, 0.8, 2.0, null, {
        tint: [0.55, 0.6, 0.62],
      });
    }
    // salon art: every wall
    K.salonWall(b, -7.8, -1.4, 1.3, 3.6, -0.12, 0, -1, "lob_s1");
    K.salonWall(b, 1.4, 7.8, 1.3, 3.6, -0.12, 0, -1, "lob_s2");
    K.salonWall(b, -11.8, -8, 1.3, 3.6, -7.88, 1, 0, "lob_w1");
    K.salonWall(b, -4.2, -0.2, 1.3, 3.6, -7.88, 1, 0, "lob_w2");
    K.salonWall(b, -3.9, -1.2, 1.3, 3.4, -11.88, 0, 1, "lob_n1", {
      density: 0.6,
    });
    K.salonWall(b, -2.4, -0.3, 3.3, 3.7, 7.88, -1, 0, "lob_e1", {
      density: 0.5,
    });
    // dead palms in brass pots, bench, litter
    for (const [px, pz] of [
      [-7.2, -0.8],
      [7.2, -0.8],
      [-3.6, -11.2],
      [3.6, -11.2],
    ]) {
      b.cyl("brass", px, 0, pz, 0.3, 0.24, 0.55, 10, {
        tint: [0.55, 0.45, 0.3],
      });
      for (let k = 0; k < 5; k++) {
        const a = k * 1.26;
        b.beam(
          "wood_rotten",
          px,
          0.55,
          pz,
          px + Math.cos(a) * 0.6,
          1.5 + r() * 0.5,
          pz + Math.sin(a) * 0.6,
          0.03,
          0.02,
          { tint: [0.45, 0.4, 0.25] },
        );
      }
      b.col(px - 0.3, 0, pz - 0.3, px + 0.3, 0.8, pz + 0.3, {
        tag: "furniture",
      });
    }
    K.litter(b, -7.5, -11.5, 7.5, -0.5, 0, 14, 5);

    // ---------------- L0 manager's office (x -8..-4, z -21..-12) ----------------
    K.room(b, ctx, {
      x0: -8,
      z0: -21,
      x1: -4,
      z1: -12,
      y: 0,
      h: CH,
      floor: "wood",
      fc: [0.62, 0.48, 0.36],
      wall: "wallpaper_green",
      wc: [0.7, 0.72, 0.6],
      wain: "wood_dark",
      wainC,
      ceil: "plaster",
      cc: [0.6, 0.58, 0.52],
      surface: "wood",
    });
    const deskTop = K.table(b, -6, 0, -18.6, 1.8, 0.9, { mat: "mahogany" });
    K.chair(b, -6, 0, -19.6, PI, { mat: "leather", seatMat: "leather" });
    K.lamp(b, -6.6, deskTop + 0.35, -18.7, "pendant", [1, 0.9, 0.6], 0.8, 5, {
      ceil: deskTop + 0.4,
      shade: "paint_green",
      lightOpts: { box: [-8.1, -0.1, -21.1, -3.9, 4, -11.9] },
    });
    b.box("leather", -6.6, deskTop, -18.7, 0.2, 0.35, 0.2, {});
    K.lamp(b, -6, 3.4, -15, "bulb", [1, 0.8, 0.55], 0.6, 6, {
      ceil: CH,
      lightOpts: { box: [-8.1, -0.1, -21.1, -3.9, 4, -11.9] },
    });
    K.shelf(b, -7.75, 0, -15.5, HP, 2.4, {
      mat: "wood_dark",
      items: ["book", "book", "box"],
      h: 2.2,
      seed: 3,
    });
    K.framed(b, -4.12, 2.2, -17.5, -1, 0, 0.9, 1.2, K.painting(2, 160, 208), {
      frame: "gold",
    });
    K.sofa(b, -4.7, 0, -14, 1.6, -HP, {
      mat: "leather",
      tint: [0.5, 0.35, 0.25],
    });
    K.terminal(
      ctx,
      "pv_term_chelsea_desk",
      -5.6,
      deskTop,
      -18.8,
      0,
      termDesk(),
      "bare",
    );
    K.loot(ctx, "safe", -7.85, 1.2, -19.8, HP, {
      wall: true,
      loot: "wall_safe",
      lock: LK.hotelSafe,
      name: "Hotel Safe",
      tag: "safe",
    });
    K.loot(ctx, "file_cabinet", -7.6, 0, -13, HP, { loot: "file_cabinet" });
    K.loot(ctx, "desk", -5.2, 0, -12.9, PI, {
      loot: "desk",
      name: "Clerk's Desk",
    });
    K.note(ctx, "pv_note_chelsea_rules", -6.4, deskTop + 0.01, -18.3, {
      name: "House Rules of the Hotel Chelsea",
      title: "HOUSE RULES (revised, 1988)",
      text: "HOTEL CHELSEA — RULES OF THE HOUSE\n\n1. Rent may be paid in scrip, canvases, or a decent song.\n2. No shooting in the stairwell. The paintings were here first.\n3. Maniacs are not \"performance art.\" Kill them in the street, please.\n4. Strangers are welcome if they wipe their boots.\n5. The penthouse is Mr. Moretz's. Mr. Moretz has been dead for twenty-two years. It is still Mr. Moretz's.\n6. Do not feed Johnny Nitro after midnight. Do not feed Johnny Nitro.\n\n— Stanley, Front Desk (since before the bombs)",
    });

    // ---------------- upper floors ----------------
    for (let lv = 1; lv < 4; lv++) {
      const y = LV[lv];
      const box = (x0, z0, x1, z1) => ({
        box: [x0 - 0.1, y - 0.2, z0 - 0.1, x1 + 0.1, y + CH + 0.2, z1 + 0.1],
      });
      // corridor
      K.gap(ctx, 0, -12, 8, y, CH, { casing: false });
      K.gap(ctx, -6, -12, 1.1, y, 2.3);
      if (lv < 3) {
        K.gap(ctx, -4, -9.6, 1.1, y, 2.3);
        K.gap(ctx, 4, -9.6, 1.1, y, 2.3);
      } else K.gap(ctx, 0, -9.6, 1.1, y, 2.3); // the locked penthouse door
      K.room(b, ctx, {
        x0: -8,
        z0: -12,
        x1: 8,
        z1: -9.6,
        y,
        h: CH,
        floor: "wood",
        fc: [0.55, 0.42, 0.32],
        wall: "wallpaper",
        wc: [0.62, 0.66, 0.55],
        wain: "wood_dark",
        wainC,
        ceil: "plaster",
        cc: [0.6, 0.58, 0.52],
        surface: "wood",
        open: { n: false },
      });
      b.hplate("carpet", 0, y + 0.012, -10.8, 15.4, 1.3, 0, null, {
        tint: [0.8, 0.7, 0.65],
      });
      for (const x of [-6, 0, 6])
        K.lamp(b, x, y + 2.3, -9.72, "cage", [1, 0.78, 0.5], 0.7, 4.5, {
          ceil: y + 2.4,
          lightOpts: box(-8, -12, 8, -9.6),
        });
      K.salonWall(b, -7.8, -4.8, y + 1.3, y + 3.5, -9.72, 0, -1, "cor_s" + lv, {
        density: 0.9,
      });
      K.salonWall(b, -3.2, 3.2, y + 1.3, y + 3.5, -9.72, 0, -1, "cor_s2" + lv, {
        density: 0.9,
      });
      // fake numbered doors at both corridor ends
      for (const s of [-1, 1]) {
        b.plate("wood_dark", s * 7.88, y + 1.1, -10.8, -s, 0, 1.0, 2.2, null, {
          tint: [0.45, 0.3, 0.22],
        });
        b.plate(
          "art",
          s * 7.86,
          y + 2.35,
          -10.8,
          -s,
          0,
          0.4,
          0.14,
          K.signCell(
            "rn" + lv + s,
            String(lv + 1) + (s < 0 ? "01" : "09"),
            128,
            48,
            { bg: "#2a2016", fg: "#d8b060" },
          ),
        );
      }
      // room number plates beside the studio doors
      if (lv < 3)
        b.plate(
          "art",
          -4.9,
          y + 1.6,
          -9.72,
          0,
          -1,
          0.34,
          0.12,
          K.signCell("rw" + lv, String(lv + 1) + "22", 128, 48, {
            bg: "#2a2016",
            fg: "#d8b060",
          }),
        );
      if (lv < 3)
        b.plate(
          "art",
          4.9,
          y + 1.6,
          -9.72,
          0,
          -1,
          0.34,
          0.12,
          K.signCell("re" + lv, String(lv + 1) + "24", 128, 48, {
            bg: "#2a2016",
            fg: "#d8b060",
          }),
        );
      // side room west (x -8..-4, z -21..-12)
      K.room(b, ctx, {
        x0: -8,
        z0: -21,
        x1: -4,
        z1: -12,
        y,
        h: CH,
        floor: lv === 1 ? "hextile" : "wood",
        fc: [0.72, 0.7, 0.66],
        wall: "plaster",
        wc: [0.72, 0.7, 0.62],
        ceil: "plaster",
        cc: [0.6, 0.58, 0.52],
        surface: lv === 1 ? "concrete" : "wood",
      });
      K.lamp(b, -6, y + 3.2, -16.5, "bulb", [1, 0.8, 0.55], 0.7, 6, {
        ceil: y + CH,
        lightOpts: box(-8, -21, -4, -12),
      });
      // elevator doors on the corridor east end of the north wall (shaft behind x 4..8)
      b.boxMM("brass", 5.1, y, -11.95, 7.1, y + 2.5, -11.85, {
        tint: lv === 2 ? [0.35, 0.3, 0.2] : [0.6, 0.5, 0.3],
      });
      if (lv === 2) {
        b.plate("paint_black", 6.1, y + 1.25, -11.84, 0, 1, 0.6, 2.4, null);
        b.pipe("rust", 6.0, y + 0.1, -11.9, 6.0, y + 2.4, -11.9, 0.02, 4);
      }
    }

    // ---- L1: Odile's studio (W), Leopold's gallery (E), commune kitchen (side W) ----
    {
      const y = LV[1];
      const bx = [-8.1, y - 0.2, -9.7, 0.1, y + 4, 0.1];
      K.room(b, ctx, {
        x0: -8,
        z0: -9.6,
        x1: 0,
        z1: 0,
        y,
        h: CH,
        floor: "wood",
        fc: [0.62, 0.5, 0.4],
        wall: "plaster",
        wc: [0.82, 0.78, 0.7],
        ceil: "plaster",
        cc: [0.7, 0.68, 0.62],
        surface: "wood",
      });
      studioWindows(b, -8, 0, y, bx);
      // paint everywhere
      for (let k = 0; k < 14; k++)
        b.hplate(
          "decal",
          -7.5 + r() * 7,
          y + 0.013 + k * 0.0004,
          -9 + r() * 8.5,
          0.6 + r() * 0.9,
          0.6 + r() * 0.9,
          r() * 6,
          K.decal("paint", k % 5),
          { tint: [1, 1, 1] },
        );
      easel(b, -4.2, y, -5.2, PI + 0.4, K.painting(12, 192, 240));
      easel(b, -6.4, y, -3.2, PI - 0.6, K.painting(25, 192, 240));
      easel(b, -2.0, y, -7.4, PI + 0.9, K.painting(31, 192, 240));
      K.framed(
        b,
        -4,
        y + 2.1,
        -9.48,
        0,
        1,
        3.2,
        2.2,
        K.painting(14, 256, 176),
        { frame: "wood_dark", fw: 0.08 },
      ); // big work in progress
      for (let k = 0; k < 6; k++) {
        // canvases leaning on the east wall
        const zz = -8.8 + k * 0.5,
          hh = 0.8 + r() * 0.8;
        b.quad(
          "art",
          [-0.14 - k * 0.02, y + 0.02, zz - 0.35],
          [-0.14 - k * 0.02, y + 0.02, zz + 0.35],
          [-0.4 - k * 0.02, y + hh, zz + 0.35],
          [-0.4 - k * 0.02, y + hh, zz - 0.35],
          { rect: K.painting(40 + k, 128, 160), grime: 0 },
        );
      }
      K.table(b, -7.1, y, -6.5, 0.8, 2.0, { mat: "wood" });
      for (let k = 0; k < 9; k++)
        b.cyl(
          "glass",
          -7.3 + (k % 3) * 0.2,
          y + 0.76,
          -7.3 + Math.floor(k / 3) * 0.6,
          0.05,
          0.05,
          0.14,
          6,
          { tint: [r(), r(), r()] },
        );
      K.bed(b, -1.6, y, -1.8, PI, {
        w: 1.1,
        l: 1.9,
        frame: "black_iron",
        tint: [0.7, 0.4, 0.35],
      });
      b.hplate("fabric", -4.5, y + 0.014, -5, 3, 2.4, 0.2, null, {
        tint: [0.75, 0.72, 0.62],
      }); // drop cloth
      K.lamp(b, -4, y + 3.1, -5, "bulb", [1, 0.85, 0.6], 0.8, 7, {
        ceil: y + CH,
        lightOpts: { box: bx },
      });
      K.anchor(ctx, "vivienne", -4.8, y, -4.0);
      K.loot(ctx, "footlocker", -7.5, y, -1.0, HP, {
        loot: "footlocker",
        name: "Paint Chest",
        owner: "settlers",
      });

      const gb = [-0.1, y - 0.2, -9.7, 8.1, y + 4, 0.1];
      K.room(b, ctx, {
        x0: 0,
        z0: -9.6,
        x1: 8,
        z1: 0,
        y,
        h: CH,
        floor: "wood",
        fc: [0.55, 0.42, 0.32],
        wall: "plaster",
        wc: [0.9, 0.88, 0.84],
        ceil: "plaster",
        cc: [0.75, 0.74, 0.7],
        surface: "wood",
      });
      studioWindows(b, 0, 8, y, gb);
      // spot-lit hang with price tags
      const gal = [
        [1.6, -9.48, 0, 1],
        [4.0, -9.48, 0, 1],
        [6.4, -9.48, 0, 1],
        [7.88, -7, -1, 0],
        [7.88, -4.4, -1, 0],
        [0.12, -7, 1, 0],
        [0.12, -4.2, 1, 0],
      ];
      gal.forEach(([gx, gz, nx, nz], k) => {
        const px = gx,
          pz = gz;
        K.framed(
          b,
          px,
          y + 1.8,
          pz,
          nx,
          nz,
          1.3,
          1.0,
          K.painting(50 + k, 192, 144),
          { frame: "black_iron" },
        );
        b.plate(
          "art",
          px + nz * 0.9,
          y + 1.1,
          pz - nx * 0.9,
          nx,
          nz,
          0.2,
          0.08,
          K.signCell("price" + k, 60 + k * 35 + " scrip", 96, 40, {
            bg: "#e8e4d8",
            fg: "#222",
            font: "Arial",
          }),
        );
        b.light(
          px + nx * 1.2,
          y + 3.4,
          pz + nz * 1.2,
          [1, 0.92, 0.8],
          0.7,
          3.2,
          { box: gb },
        );
        b.boxMM(
          "black_iron",
          px + nx * 0.8 - 0.06,
          y + CH - 0.25,
          pz + nz * 0.8 - 0.06,
          px + nx * 0.8 + 0.06,
          y + CH,
          pz + nz * 0.8 + 0.06,
          {},
        );
      });
      // plinth + bust, counter
      b.boxMM("paint_white", 3.6, y, -5.4, 4.4, y + 1.1, -4.6, {
        tint: [0.85, 0.85, 0.82],
      });
      b.geo("marble", K.sphereGeo(), {
        x: 4,
        y: y + 1.42,
        z: -5,
        s: 0.2,
        sy: 0.25,
      });
      b.cyl("marble", 4, y + 1.1, -5, 0.22, 0.16, 0.12, 10);
      b.col(3.6, y, -5.4, 4.4, y + 1.1, -4.6, { tag: "furniture" });
      b.boxMM("wood_dark", 4.6, y, -2.9, 7.6, y + 1.05, -2.2, {
        tint: [0.5, 0.35, 0.25],
      });
      b.col(4.6, y, -2.9, 7.6, y + 1.05, -2.2, {
        tag: "counter",
        surface: "wood",
      });
      K.shelf(b, 7.75, y, -1.1, -HP, 1.8, {
        mat: "wood_dark",
        items: ["jar", "paint", "bottle", "box"],
        h: 2.0,
        seed: 8,
      });
      K.lamp(b, 4, y + 3.2, -4.5, "globe", [1, 0.9, 0.75], 0.8, 8, {
        ceil: y + CH,
        size: 0.15,
        lightOpts: { box: gb },
      });
      K.anchor(ctx, "merchant", 6.1, y, -1.4);
      K.loot(ctx, "cash_register", 6.6, y + 1.05, -2.55, PI, {
        container: false,
      });

      const kb = [-8.1, y - 0.2, -21.1, -3.9, y + 4, -11.9];
      // kitchen: stove, sink, table
      b.boxMM("paint_white", -7.9, y, -20.9, -6.2, y + 0.92, -20.2, {
        tint: [0.85, 0.83, 0.78],
      });
      for (let k = 0; k < 4; k++)
        b.cyl(
          "black_iron",
          -7.6 + (k % 2) * 0.8,
          y + 0.92,
          -20.7 + Math.floor(k / 2) * 0.35,
          0.12,
          0.12,
          0.02,
          10,
        );
      b.boxMM("ceramic", -5.9, y + 0.8, -20.9, -4.6, y + 0.92, -20.3, {
        tint: [0.9, 0.9, 0.86],
      });
      b.col(-7.9, y, -20.9, -4.6, y + 0.92, -20.2, { tag: "counter" });
      K.shelf(b, -7.75, y, -17.5, HP, 2.0, {
        mat: "wood",
        items: ["can", "jar", "can", "bottle"],
        h: 1.8,
        seed: 21,
      });
      K.table(b, -6, y, -15, 1.2, 1.6, { mat: "wood" });
      for (const [cx, cz, cy] of [
        [-6.8, -15, -HP],
        [-5.2, -15, HP],
        [-6, -16.1, 0],
      ])
        K.chair(b, cx, y, cz, cy, { mat: "wood" });
      K.lamp(b, -6, y + 2.4, -15, "pendant", [1, 0.85, 0.6], 0.9, 5.5, {
        ceil: y + CH,
        shade: "paint_red",
        lightOpts: { box: kb },
      });
      K.loot(ctx, "fridge", -4.5, y, -20.5, 0, {
        loot: "fridge",
        owner: "settlers",
      });
      K.loot(ctx, "radio", -6.3, y + 0.77, -14.6, 0.3, { container: false });
    }

    // ---- L2: Room 822 (W), the Writer's room (E), laundry (side W) ----
    {
      const y = LV[2];
      const wb = [-8.1, y - 0.2, -9.7, 0.1, y + 4, 0.1];
      K.room(b, ctx, {
        x0: -8,
        z0: -9.6,
        x1: 0,
        z1: 0,
        y,
        h: CH,
        floor: "wood",
        fc: [0.45, 0.36, 0.3],
        wall: "plaster",
        wc: [0.5, 0.48, 0.46],
        ceil: "plaster",
        cc: [0.5, 0.48, 0.46],
        surface: "wood",
      });
      studioWindows(b, -8, 0, y, wb, true);
      b.hplate("fabric", -6.4, y + 0.02, -7.6, 1.6, 2.1, 0.1, null, {
        tint: [0.5, 0.45, 0.4],
      }); // mattress stain
      b.boxMM("fabric", -7.3, y, -8.7, -5.5, y + 0.22, -6.6, {
        tint: [0.55, 0.5, 0.42],
      });
      b.col(-7.3, y, -8.7, -5.5, y + 0.22, -6.6, {
        tag: "furniture",
        surface: "fabric",
      });
      const tags = [
        ["NITRO", "#e03030"],
        ["BURN IT DOWN", "#e0e0e0"],
        ["822", "#40c0ff"],
        ["NO GODS NO MASTERS NO RENT", "#f0d030"],
      ];
      tags.forEach(([t, c], k) =>
        b.plate(
          "decal",
          -7.88,
          y + 1.6 + (k % 2) * 1.0,
          -8.5 + k * 2.2,
          1,
          0,
          2.2,
          0.8,
          K.tag(t, c, 256, 96, { rot: k % 2 ? 0.08 : -0.06 }),
        ),
      );
      b.plate(
        "decal",
        -4,
        y + 2.2,
        -9.48,
        0,
        1,
        3.4,
        1.2,
        K.tag("CHELSEA NEVER SLEEPS", "#ff60c0", 384, 96),
      );
      // amp stack + guitar + drum
      b.boxMM("paint_black", -1.4, y, -9.4, -0.3, y + 1.4, -8.7, {
        tint: [0.2, 0.2, 0.2],
      });
      b.plate("fabric", -0.85, y + 0.8, -8.69, 0, 1, 0.9, 0.9, null, {
        tint: [0.35, 0.33, 0.3],
      });
      b.col(-1.4, y, -9.4, -0.3, y + 1.4, -8.7, { tag: "furniture" });
      b.box("paint_red", -2.0, y + 0.02, -8.8, 0.35, 0.9, 0.08, { yaw: 0.2 });
      b.cyl("paint_white", -3.2, y, -8.6, 0.3, 0.3, 0.35, 12, {
        tint: [0.8, 0.2, 0.2],
      });
      for (let k = 0; k < 16; k++)
        b.cyl("glass", -7 + r() * 6, y, -5 + r() * 4.5, 0.035, 0.035, 0.24, 6, {
          tint: r.pick([
            [0.3, 0.5, 0.3],
            [0.5, 0.3, 0.15],
          ]),
        });
      K.litter(b, -7.5, -9, -0.5, -0.5, y, 16, 22);
      K.lamp(b, -4, y + 3.0, -4.5, "bulb", [1, 0.4, 0.8], 0.9, 7, {
        ceil: y + CH,
        lightOpts: { box: wb },
      }); // pink bulb
      K.anchor(ctx, "johnny", -3.2, y, -5.5);
      K.loot(ctx, "footlocker", -0.6, y, -1, -HP, {
        loot: "chems",
        name: "Johnny's Stash",
        owner: "settlers",
      }); // never locked: Johnny lost the key years ago

      const eb = [-0.1, y - 0.2, -9.7, 8.1, y + 4, 0.1];
      K.room(b, ctx, {
        x0: 0,
        z0: -9.6,
        x1: 8,
        z1: 0,
        y,
        h: CH,
        floor: "carpet",
        fc: [0.6, 0.5, 0.45],
        wall: "wallpaper",
        wc: [0.6, 0.55, 0.5],
        wain: "wood_dark",
        wainC,
        ceil: "plaster",
        cc: [0.55, 0.52, 0.48],
        surface: "carpet",
      });
      studioWindows(b, 0, 8, y, eb, true);
      const dt = K.table(b, 5.6, y, -6.8, 1.6, 0.8, { mat: "mahogany" });
      K.chair(b, 5.6, y, -6.0, PI, { mat: "mahogany" });
      b.box("paint_black", 5.6, dt, -6.95, 0.5, 0.18, 0.4, {
        tint: [0.25, 0.25, 0.25],
      }); // typewriter
      b.box("cloth_white", 5.6, dt + 0.12, -7.1, 0.3, 0.3, 0.02, {
        yaw: 0.2,
        tint: [0.9, 0.88, 0.8],
      });
      K.shelf(b, 7.75, y, -4.5, -HP, 3.0, {
        mat: "wood_dark",
        items: ["book", "book", "book", "box"],
        h: 2.4,
        seed: 33,
      });
      K.shelf(b, 0.25, y, -4.5, HP, 3.0, {
        mat: "wood_dark",
        items: ["book", "book", "book"],
        h: 2.4,
        seed: 34,
      });
      for (let k = 0; k < 90; k++)
        b.hplate(
          "flat",
          1 + r() * 6.6,
          y + 0.013 + k * 0.0003,
          -9.2 + r() * 8.8,
          0.21,
          0.29,
          r() * 6.3,
          null,
          { tint: [0.86, 0.84, 0.76] },
        ); // pages everywhere
      for (let k = 0; k < 5; k++)
        b.box("flat", 1.2 + k * 0.35, y, -8.8, 0.25, 0.1 + k * 0.08, 0.32, {
          tint: [0.85, 0.82, 0.74],
        }); // manuscript stacks
      K.lamp(b, 5.0, dt + 0.35, -7.1, "pendant", [1, 0.85, 0.6], 0.9, 5, {
        ceil: dt + 0.45,
        shade: "paint_green",
        lightOpts: { box: eb },
      });
      b.box("brass", 5.0, dt, -7.1, 0.15, 0.4, 0.15, {});
      K.skel(ctx, 5.6, y, -6.05, PI, "seated");
      K.note(ctx, "pv_note_chelsea_manuscript", 5.9, dt + 0.01, -6.7, {
        name: "The Last Chapter (typescript)",
        title: "THE NEON AND THE DARK — Chapter 41",
        text: "The sirens started at 9:42 and I did not get up. I had eleven pages left and the light through the window was the best it has ever been, very white, whiter than a page.\n\nDown the hall Moretz is still painting. Nitro is screaming along to the radio. The desk clerk is telling everyone to stay calm and pay their rent.\n\nIf anyone reads this: the hotel will survive. It always does. Buildings like this are too stubborn to die and too interesting to be left alone. Somebody will move in. Somebody will hang a painting over the burn marks.\n\nI am going to finish the chapter now.\n\n(the rest of the page is blank)",
      });
      K.loot(ctx, "desk", 1.6, y, -1.0, 0, {
        loot: "desk",
        name: "Writing Desk",
      });
      K.loot(ctx, "footlocker", 7.3, y, -1.0, -HP, {
        loot: "books",
        name: "Trunk of Rejection Letters",
      });

      const lb = [-8.1, y - 0.2, -21.1, -3.9, y + 4, -11.9];
      for (let k = 0; k < 3; k++) {
        b.cyl("metal", -7.3, y, -20.2 + k * 1.1, 0.4, 0.38, 0.8, 10, {
          tint: [0.6, 0.62, 0.6],
        });
        b.col(-7.7, y, -20.6 + k * 1.1, -6.9, y + 0.8, -19.8 + k * 1.1, {
          tag: "furniture",
        });
      }
      b.pipe("black_iron", -7.6, y + 2.2, -13, -4.4, y + 2.2, -13, 0.01, 3);
      for (let k = 0; k < 4; k++)
        b.box("fabric", -7.2 + k * 0.8, y + 1.5, -13, 0.6, 0.7, 0.02, {
          tint: r.pick([
            [0.7, 0.6, 0.5],
            [0.4, 0.45, 0.6],
            [0.6, 0.3, 0.3],
          ]),
        });
      K.shelf(b, -4.25, y, -17, -HP, 2.4, {
        mat: "metal",
        items: ["box", "can", "jar"],
        seed: 44,
      });
      K.loot(ctx, "locker", -7.7, y, -15.5, HP, {
        loot: "locker",
        lock: LK.storage,
        name: "Storage Locker",
      });
      K.loot(ctx, "toolbox", -5.2, y, -20.6, 0, { loot: "toolbox" });
      K.note(ctx, "pv_note_chelsea_johnny", -6.8, y + 0.82, -20.2, {
        name: "Laundry Complaint",
        title: "To whoever keeps washing giant roach guts in Tub #2",
        learn: LK.storage.id,
        text: "It is Johnny. We all know it is Johnny.\n\nJohnny, the roaches are not \"a delicacy of the Lower East Side.\" Katz's never sold roach. Katz's sold PASTRAMI. The roaches are just what LIVES there now, in the basement, a whole kingdom of them around one enormous queen. Stop bringing them home.\n\n— Management (Stanley)\n\nP.S. To everyone else: the storage locker combination is 4-1-1-9. Stop knocking on my desk at night to ask.",
      });
    }

    // ---- L3: the Skylight Penthouse (locked) + roof access ----
    {
      const y = LV[3];
      const pb = [-8.1, y - 0.2, -9.7, 8.1, y + 4.6, 0.1];
      K.room(b, ctx, {
        x0: -8,
        z0: -9.6,
        x1: 8,
        z1: 0,
        y,
        h: 4.4,
        floor: "wood",
        fc: [0.65, 0.5, 0.38],
        wall: "plaster",
        wc: [0.85, 0.8, 0.72],
        ceil: "plaster",
        cc: [0.75, 0.72, 0.66],
        surface: "wood",
        noCeil: true,
      });
      // skylight roof: sloped glass
      b.quad(
        "plaster",
        [-8, y + 4.4, -9.6],
        [8, y + 4.4, -9.6],
        [8, y + 4.4, -6.6],
        [-8, y + 4.4, -6.6],
        { tint: [0.6, 0.58, 0.54] },
      );
      b.quad(
        "lamp",
        [-8, y + 4.4, -6.6],
        [8, y + 4.4, -6.6],
        [8, y + 3.6, 0],
        [-8, y + 3.6, 0],
        { tint: [0.36, 0.4, 0.42] },
      );
      for (let x = -8; x <= 8; x += 0.8)
        b.beam("black_iron", x, y + 4.38, -6.6, x, y + 3.58, 0, 0.05, 0.08);
      for (let t = 0; t <= 1.001; t += 0.25)
        b.beam(
          "black_iron",
          -8,
          y + 4.38 - 0.8 * t,
          -6.6 + 6.6 * t,
          8,
          y + 4.38 - 0.8 * t,
          -6.6 + 6.6 * t,
          0.05,
          0.06,
        );
      b.light(0, y + 3.8, -3, [0.8, 0.88, 1.0], 1.5, 12, { box: pb });
      b.glow(0, y + 3.9, -3, [0.35, 0.4, 0.45], 6);
      // the unfinished masterpiece
      K.framed(
        b,
        0,
        y + 2.2,
        -9.48,
        0,
        1,
        7.0,
        3.0,
        K.paint("art", "voss_panorama", 512, 220, function (x, X, Y, W, H) {
          const g = x.createLinearGradient(0, Y, 0, Y + H);
          g.addColorStop(0, "#e8b070");
          g.addColorStop(0.6, "#c05a40");
          g.addColorStop(1, "#3a2030");
          x.fillStyle = g;
          x.fillRect(X, Y, W, H);
          const rr = K.rng("voss");
          x.fillStyle = "#20141e";
          let px = X;
          while (px < X + W) {
            const w = 8 + rr() * 22,
              h = H * (0.2 + rr() * 0.6);
            x.fillRect(px, Y + H - h, w, h);
            px += w + 2;
          }
          x.fillStyle = "rgba(255,240,200,0.9)";
          x.beginPath();
          x.arc(X + W * 0.72, Y + H * 0.3, 26, 0, 6.3);
          x.fill();
          x.fillStyle = "#e8e0cc";
          x.fillRect(X + W * 0.78, Y, W * 0.22, H); // unpainted canvas
          x.strokeStyle = "rgba(40,30,20,0.4)";
          for (let k = 0; k < 12; k++) {
            x.beginPath();
            x.moveTo(X + W * 0.8, Y + rr() * H);
            x.lineTo(X + W * (0.8 + rr() * 0.2), Y + rr() * H);
            x.stroke();
          }
        }),
        { frame: false },
      );
      b.boxMM("wood", -3.6, y, -9.4, 3.6, y + 0.15, -8.8, {
        tint: [0.5, 0.4, 0.3],
      });
      K.sofa(b, 3.5, y, -3.5, 2.2, -HP + 0.3, {
        mat: "velvet",
        tint: [0.55, 0.3, 0.45],
      }); // chaise
      K.skel(ctx, 3.4, y + 0.45, -3.5, -HP, "lying");
      // a patron's life: rug, bookcases, canvases stacked ten deep, a wine table, a dead fig under the skylight
      b.hplate("carpet", 1.5, y + 0.012, -4.2, 6.5, 4.2, 0.05, null, {
        tint: [0.65, 0.35, 0.3],
      });
      K.shelf(b, 7.75, y, -4.6, -HP, 2.6, {
        mat: "wood_dark",
        items: ["book", "book", "paint", "book"],
        h: 2.6,
        seed: 66,
      });
      K.shelf(b, -7.75, y, -8.4, HP, 2.0, {
        mat: "wood_dark",
        items: ["book", "jar", "book"],
        h: 2.6,
        seed: 67,
      });
      for (let k = 0; k < 8; k++) {
        const zz = -2.8 + k * 0.28,
          hh = 1.0 + r() * 0.9,
          xx = -7.86 + k * 0.03;
        b.quad(
          "art",
          [xx, y + 0.02, zz - 0.45],
          [xx, y + 0.02, zz + 0.45],
          [xx + 0.25, y + hh, zz + 0.45],
          [xx + 0.25, y + hh, zz - 0.45],
          { rect: K.painting(90 + k, 128, 160), grime: 0.1 },
        );
      }
      K.roundTable(b, 1.4, y, -2.4, 0.5, { mat: "mahogany" });
      for (let k = 0; k < 4; k++)
        b.cyl(
          "glass",
          1.2 + k * 0.14,
          y + 0.76,
          -2.4 + (k % 2) * 0.12,
          0.04,
          0.035,
          0.3,
          6,
          { tint: [0.35, 0.15, 0.2] },
        );
      b.cyl("ceramic", -4.8, y, -1.2, 0.35, 0.28, 0.55, 12, {
        tint: [0.6, 0.35, 0.25],
      });
      for (let k = 0; k < 6; k++) {
        const a = k * 1.05;
        b.pipe(
          "wood_rotten",
          -4.8,
          y + 0.5,
          -1.2,
          -4.8 + Math.cos(a) * 0.6,
          y + 1.7 + r() * 0.5,
          -1.2 + Math.sin(a) * 0.6,
          0.03,
          4,
        );
      }
      b.col(-5.15, y, -1.55, -4.45, y + 0.55, -0.85, { tag: "furniture" });
      easel(b, -2, y, -4, PI + 0.2, K.painting(19, 192, 240));
      easel(b, -5, y, -2.2, PI - 0.5, K.painting(22, 192, 240));
      b.boxMM("mahogany", -7.6, y, -6.5, -6.6, y + 0.9, -5.2, {}); // gramophone table
      b.cyl("brass", -7.1, y + 0.95, -5.85, 0.05, 0.3, 0.45, 10, {
        top: false,
      });
      b.col(-7.6, y, -6.5, -6.6, y + 0.9, -5.2, { tag: "furniture" });
      for (const [px, pz] of [
        [6.5, -8.2],
        [6.5, -6.8],
      ]) {
        b.boxMM(
          "paint_white",
          px - 0.35,
          y,
          pz - 0.35,
          px + 0.35,
          y + 1.0,
          pz + 0.35,
          {},
        );
        b.geo("marble", K.sphereGeo(), {
          x: px,
          y: y + 1.25,
          z: pz,
          s: 0.18,
          sy: 0.24,
        });
        b.col(px - 0.35, y, pz - 0.35, px + 0.35, y + 1.0, pz + 0.35, {});
      }
      for (let k = 0; k < 10; k++)
        b.hplate(
          "decal",
          -6 + r() * 12,
          y + 0.013 + k * 0.0004,
          -8 + r() * 7,
          0.7,
          0.7,
          r() * 6,
          K.decal("paint", k % 5),
        );
      K.anchor(ctx, "penthouse", 0, y, -4);
      K.loot(ctx, "safe", 7.2, y, -1.0, -HP, {
        loot: "safe",
        lock: LK.strongbox,
        name: "Moretz's Strongbox",
      });
      K.note(ctx, "pv_note_voss", -1.6, y + 0.9, -3.6, {
        name: "Moretz's Sketchbook",
        title: "Sketchbook of Aurelio Moretz (last pages)",
        learn: LK.strongbox.id,
        text: "March. Sunday. The light is wrong today. Too white, from the north. Everyone downstairs is running.\n\nI will not go down to the shelter. They would put me in a grey suit and give me a number. I have had a name for seventy years and I intend to be buried in it.\n\nThe panorama is not finished. The right side is blank. That is where tomorrow goes.\n\nWhoever finds this: finish it. Not with paint. With living. And take the money in the strongbox; it opens to the day I was born, 3-11-1896, and I shan't be needing it.",
      });
      K.anchor(ctx, "beret", -1.3, y + 0.8, -3.4);

      // roof access (side W)
      const rb = [-8.1, y - 0.2, -21.1, -3.9, y + 4, -11.9];
      b.boxMM("black_iron", -6.4, y, -20.8, -5.6, y + CH, -20.7, {});
      for (let k = 0; k < 12; k++)
        b.beam(
          "black_iron",
          -6.4,
          y + 0.3 + k * 0.3,
          -20.7,
          -5.6,
          y + 0.3 + k * 0.3,
          -20.7,
          0.03,
          0.03,
        );
      b.plate("wood_dark", -6, y + 1.2, -20.88, 0, 1, 1.0, 2.2, null, {
        tint: [0.5, 0.35, 0.25],
      });
      b.plate(
        "art",
        -6,
        y + 2.6,
        -20.86,
        0,
        1,
        0.9,
        0.3,
        K.signCell("roofsign", "ROOF GARDEN", 256, 80, {
          bg: "#2a3a2a",
          fg: "#d8e8c0",
        }),
      );
      K.lamp(b, -6, y + 3.2, -16, "bulb", [0.9, 0.95, 1.0], 0.8, 6, {
        ceil: y + CH,
        lightOpts: { box: rb },
      });
      K.shelf(b, -4.25, y, -16, -HP, 2.0, {
        mat: "wood",
        items: ["paint", "jar", "box"],
        seed: 55,
      });
    }

    // ---- doors ----
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    // street ↔ lobby
    // (street side positions are authored like the façade, then flipped onto 23rd Street; the exit faces south)
    const dIn = fp(DOOR_X, Z0 - 0.3),
      dOut = fp(DOOR_X, Z0 - 2.2);
    K.door(ctx, {
      id: "pv_chelsea_in",
      pos: new THREE.Vector3(dIn.x, 1.4, dIn.z),
      label: "Hotel Chelsea",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.6, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("chelsea_hotel")),
    });
    K.door(ctx, {
      id: "pv_chelsea_out",
      pos: new THREE.Vector3(OX, OY + 1.4, OZ - 0.4),
      label: "West 23rd Street",
      verb: "Leave",
      target: { x: dOut.x, y: 0, z: dOut.z, yaw: PI },
    });
    // penthouse (locked: Moretz's key from Odile, or Stanley's spare)
    b.boxMM("mahogany", -0.55, LV[3], -9.66, 0.55, LV[3] + 2.3, -9.54, {
      tint: [0.6, 0.4, 0.3],
    });
    b.col(-0.55, LV[3], -9.7, 0.55, LV[3] + 2.3, -9.5, { tag: "door" });
    b.cyl("brass", 0.35, LV[3] + 1.0, -9.7, 0.04, 0.04, 0.05, 6);
    b.plate(
      "art",
      0,
      LV[3] + 2.55,
      -9.72,
      0,
      -1,
      0.6,
      0.18,
      K.signCell("pent", "PENTHOUSE", 256, 64, {
        bg: "#2a2016",
        fg: "#d8b060",
      }),
    );
    K.door(ctx, {
      id: "pv_chelsea_penthouse",
      pos: new THREE.Vector3(OX, OY + LV[3] + 1.3, OZ - 9.9),
      label: "Penthouse — A. Moretz",
      verb: "Open",
      lock: LK.penthouse,
      target: { x: OX, y: OY + LV[3], z: OZ - 8.6, yaw: PI },
    });
    K.door(ctx, {
      id: "pv_chelsea_penthouse_out",
      pos: new THREE.Vector3(OX, OY + LV[3] + 1.3, OZ - 9.3),
      label: "Corridor",
      verb: "Open",
      target: { x: OX, y: OY + LV[3], z: OZ - 10.9, yaw: 0 },
    });
    // roof garden
    const rOut = fp(ROOF.x, ROOF.z - 2.4),
      rIn = fp(ROOF.x, ROOF.z - 1.5);
    K.door(ctx, {
      id: "pv_chelsea_roof",
      pos: new THREE.Vector3(OX - 6, OY + LV[3] + 1.3, OZ - 20.6),
      label: "Roof Garden",
      verb: "Climb to",
      target: { x: rOut.x, y: TOP, z: rOut.z, yaw: PI },
    });
    K.door(ctx, {
      id: "pv_chelsea_roof_in",
      pos: new THREE.Vector3(rIn.x, TOP + 1.3, rIn.z),
      label: "Hotel Chelsea — Top Floor",
      verb: "Enter",
      target: { x: OX - 6, y: OY + LV[3], z: OZ - 19.2, yaw: PI },
    });

    // ---- anchors (combat / quests) ----
    K.anchor(ctx, "entrance", 0, 0, -1.6);
    K.anchor(ctx, "stanley", 6.6, 0, -6.2);
    K.anchor(ctx, "npc1", -4.2, 0, -8.6);
    K.anchor(ctx, "npc2", 0.5, 4.2, -10.8);
    K.anchor(ctx, "npc3", -6, 4.2, -15);
    const sp = [
      [-2, 0, -4],
      [2, 4.2, -10.8],
      [-2, 8.4, -10.8],
      [0, 6.3, -19.5],
      [2, 12.6, -10.8],
      [-6, 8.4, -16],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    ["loot1", "loot2", "loot3"].forEach((n, i) =>
      K.anchor(ctx, n, [-7.2, 5.6, 7.2][i], LV[i + 1], -1),
    );

    // lobby / office / studio containers
    K.loot(ctx, "first_aid", -7.85, 1.3, -11.2, HP, { loot: "first_aid" });
    K.loot(ctx, "mailbox", -7.7, 0, -9.8, HP, {
      loot: "mail_sack",
      name: "Guest Mail",
    });
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_chelsea_int";
  }

  /** Two tall street windows (daylight) on the south wall z=0 of a studio x0..x1. */
  function studioWindows(b, x0, x1, y, box, dim) {
    for (const t of [0.28, 0.72]) {
      const cx = x0 + (x1 - x0) * t;
      b.plate("lamp", cx, y + 1.7, -0.12, 0, -1, 1.2, 2.1, null, {
        tint: dim ? [0.4, 0.42, 0.44] : [0.62, 0.66, 0.7],
      });
      b.beam(
        "paint_cream",
        cx - 0.62,
        y + 0.62,
        -0.16,
        cx + 0.62,
        y + 0.62,
        -0.16,
        0.08,
        0.1,
      );
      b.beam(
        "paint_cream",
        cx - 0.62,
        y + 1.7,
        -0.16,
        cx + 0.62,
        y + 1.7,
        -0.16,
        0.05,
        0.05,
      );
      b.beam(
        "paint_cream",
        cx,
        y + 0.62,
        -0.16,
        cx,
        y + 2.78,
        -0.16,
        0.05,
        0.05,
      );
      b.box("fabric", cx - 0.8, y + 0.3, -0.25, 0.3, 2.6, 0.08, {
        tint: [0.6, 0.25, 0.22],
      }); // curtains
      b.box("fabric", cx + 0.8, y + 0.3, -0.25, 0.3, 2.6, 0.08, {
        tint: [0.6, 0.25, 0.22],
      });
      b.light(cx, y + 1.8, -0.8, [0.75, 0.82, 0.9], dim ? 0.6 : 1.0, 6.5, {
        box,
      });
      b.glow(cx, y + 1.8, -0.3, [0.25, 0.28, 0.3], 2.2);
    }
  }
  function easel(b, x, y, z, yaw, rect) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    const P = (lx, ly, lz) => [
      x + lx * c + lz * s,
      y + ly,
      z - lx * s + lz * c,
    ];
    const leg = (a, bb) => {
      const p = P(a[0], a[1], a[2]),
        q = P(bb[0], bb[1], bb[2]);
      b.beam("wood", p[0], p[1], p[2], q[0], q[1], q[2], 0.04, 0.04, {
        tint: [0.7, 0.55, 0.4],
      });
    };
    leg([-0.35, 0, 0.15], [0, 1.9, 0]);
    leg([0.35, 0, 0.15], [0, 1.9, 0]);
    leg([0, 0, -0.5], [0, 1.8, 0]);
    leg([-0.4, 0.75, 0.13], [0.4, 0.75, 0.13]);
    const q0 = P(-0.42, 0.8, 0.16),
      q1 = P(0.42, 0.8, 0.16),
      q2 = P(0.42, 1.85, 0.08),
      q3 = P(-0.42, 1.85, 0.08);
    b.quad("art", q0, q1, q2, q3, { rect, grime: 0 });
    b.quad("wood", q1, q0, q3, q2, { tint: [0.8, 0.75, 0.65] });
    b.ocol(x, z, 0.8, 0.5, y, y + 1.9, yaw, {
      tag: "furniture",
      walkable: false,
    });
  }

  function termDesk() {
    return {
      // Stanley never logs off: the front-office terminal is open to anyone standing at his desk
      title: "HOTEL CHELSEA — FRONT OFFICE",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\n-Guest Registry, 2nd ed.-",
      entries: [
        {
          title: "Guest Registry — March 1967",
          text: "Rm 100 — Mr. & Mrs. N. (musician). Rent 2 weeks late. Screaming.\nRm 822 — J. Nitro. Rent 9 weeks late. Screaming.\nRm 824 — the writer. Paid a year in advance. Never leaves.\nPENTHOUSE — A. Moretz. Paid in paintings since 1931. Management accepts.\nLOBBY SCULPTURE — do NOT let the Dadaists take her down again.",
        },
        {
          title: "Memo: Civil Defense Offer",
          text: 'The Office of Civil Defense has offered the residents "priority placement" in a deep shelter in exchange for the lobby art collection, to "preserve American culture underground."\n\nThe residents voted. The vote was unanimous. The reply was two words long and I will not put it on a government-issue terminal.',
        },
        {
          title: "1989 — Settlement Ledger",
          text: 'Residents: 23 (14 painters, 5 musicians, 3 poets, 1 unknown — Johnny says he is "post-human").\nPaintings in the stairwell: 1,114.\nManiac incidents this year: 2. Critics shot: 0 (a new record).\nVivienne reports her portrait stolen by Tombs raiders. Nobody wants to go downtown. Nobody ever wants to go downtown.',
        },
        {
          title: "Hotel Safe — Combination",
          learn: LK.hotelSafe.id,
          text: () => {
            K.learn(LK.hotelSafe.id);
            return "Wall safe, manager's office. Combination: the year the house opened, 1-8-8-4.\n(Stanley: if you are reading this, you are standing at my desk. Put the pen back.)";
          },
        },
        {
          title: "Open Hotel Safe",
          text: "The safe bolt clacks open.",
          action: () => {
            PV.unlockTagged("chelsea", "safe");
            K.notify("The hotel safe is unlocked.");
          },
        },
      ],
    };
  }

  // ==================================================================
  // DATA: items, dialogues, quest
  // ==================================================================
  function data() {
    K.defineItem({
      id: "pv_q_portrait",
      type: "misc",
      name: 'Odile\'s Portrait ("Girl on the Swing, 1967")',
      weight: 2,
      value: 0,
      quest: true,
      desc: "A small oil portrait of a laughing girl on a rope swing, painted the week before the bombs. The raiders used it as a dartboard. They missed a lot.",
    });
    K.defineItem({
      id: "pv_key_penthouse",
      type: "key",
      name: "Penthouse Key (Hotel Chelsea)",
      weight: 0,
      value: 0,
      quest: true,
      desc: "A heavy brass key on a tassel. The tag says VOSS in faded ink.",
    });
    K.defineItem({
      id: "pv_artists_beret",
      type: "apparel",
      slot: "head",
      name: "Moretz's Beret",
      weight: 0.5,
      value: 120,
      dr: 1,
      attrs: { presence: 1 },
      skills: { persuasion: 5 },
      mesh: "hat_cap",
      tags: ["apparel", "hat"],
      desc: "Paint-stiffened black beret of the late Aurelio Moretz. Makes you feel like your opinions about color matter. (+1 Presence, +5 Persuasion)",
    });

    // ---- quest ----
    // round 1b (quest walk): picking the portrait up never advanced 'find' → 'return' (objective + marker stayed on the
    // Tombs). Advance on pickup, and on load if the player already carries it.
    if (!PV._portraitHook) {
      PV._portraitHook = true;
      const adv = () => {
        if (K.q.stage("pv_last_portrait") === "find" && K.has("pv_q_portrait"))
          K.q.set("pv_last_portrait", "return");
      };
      G.events.on("itemAdded", (id) => {
        if (id === "pv_q_portrait") adv();
      });
      G.events.on("loaded", () => setTimeout(adv, 0));
      G.events.on("questStarted", () => setTimeout(adv, 0));
    }
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pv_last_portrait",
        name: "The Last Portrait",
        giver: "Odile Marchetti",
        location: "Hotel Chelsea",
        desc: "Odile, a painter at the Hotel Chelsea, painted a portrait the week the bombs fell — the last thing she painted before the Bombing burned her hands. Raiders from the Tombs stole it. She wants it back.",
        stages: [
          {
            id: "find",
            text: "Recover Odile's portrait from the raiders holed up in the Tombs.",
            markers: [
              () => {
                const a = PV.anchor("tombs", "portrait");
                return a
                  ? { x: a.x, z: a.z, y: a.y, label: "Odile's Portrait" }
                  : null;
              },
            ],
          },
          {
            id: "return",
            text: "Return the portrait to Odile at the Hotel Chelsea.",
            markers: [{ npc: "pv_vivienne", label: "Odile" }],
          },
          {
            id: "lp_sell",
            text: "(Optional) Sell the portrait to Leopold instead.",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.stage("pv_last_portrait") === "return",
            doneIf: () => PV.flag("portrait") === "sold",
          },
        ],
        rewards: { xp: 300 },
      });
    }

    // ---- dialogues ----
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const has = () => K.has("pv_q_portrait");
    G.dialogue.register("pv_dlg_vivienne", {
      start: () =>
        K.q.done("pv_last_portrait")
          ? "after"
          : has()
            ? "returned"
            : K.q.active("pv_last_portrait")
              ? "waiting"
              : PV.flag("met_viv")
                ? "again"
                : "hello",
      nodes: {
        hello: {
          speaker: "Odile Marchetti",
          onEnter: () => PV.setFlag("met_viv", true),
          text: "Don't touch that, it's wet. Well — it's been wet since '67. Linseed oil and radiation, darling: nothing ever quite dries. I'm Odile. You look like someone who walks into dangerous places for money.",
          responses: [
            { text: "Depends on the money. What do you need?", next: "pitch" },
            { text: "What is this place?", next: "place" },
            { text: "Just admiring the art.", next: "art" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Odile Marchetti",
          text: "Back again? Stand there. No — there. The light likes your face. It's the only thing that does, I imagine.",
          responses: [
            { text: "About that job...", next: "pitch" },
            { text: "Tell me about the hotel.", next: "place" },
            { text: "Goodbye.", end: true },
          ],
        },
        place: {
          speaker: "Odile Marchetti",
          text: "The Hotel Chelsea. Poets died here, painters went mad here, musicians did both. When the bombs fell the residents simply... stayed. The ones who lived came out of it burned, broke and stubborn, and kept painting. Twenty-two years of rent in arrears. Stanley still keeps the ledger.",
          responses: [
            { text: "And the job?", next: "pitch" },
            { text: "Goodbye.", end: true },
          ],
        },
        art: {
          speaker: "Odile Marchetti",
          text: "Eleven hundred paintings on those stairs, and not one of them is for sale. Well. Leopold sells some. Leopold would sell the staircase if he could get it through the door.",
          responses: [
            { text: "Do you need anything?", next: "pitch" },
            { text: "Goodbye.", end: true },
          ],
        },
        pitch: {
          speaker: "Odile Marchetti",
          text: "The last thing I painted with two good hands was a girl on a swing — my niece, Rosie, in Washington Square, March 1967. Raiders from the Tombs broke in last winter and took it. They took it because it was small enough to carry. I want it back before they burn it for warmth.",
          responses: [
            {
              text: "I'll get your painting back.",
              next: "accept",
              action: () => K.q.start("pv_last_portrait"),
            },
            {
              text: "[Trade 40] What's it worth to you?",
              check: { skill: "trade", value: 40 },
              next: "haggle",
              failNext: "haggle_fail",
            },
            { text: "The Tombs? No thanks.", next: "refuse" },
          ],
        },
        haggle: {
          speaker: "Odile Marchetti",
          text: "Everything I have, which is a key to a dead man's penthouse and a roll of scrip I've been saving to buy cadmium red. Fine. The key, and a hundred and fifty scrip. Bring her home.",
          onEnter: () => PV.setFlag("viv_bonus", 50),
          responses: [
            {
              text: "Deal.",
              next: "accept",
              action: () => K.q.start("pv_last_portrait"),
            },
          ],
        },
        haggle_fail: {
          speaker: "Odile Marchetti",
          text: "Worth? It's worth what my face was worth. Which is to say, you'll get what you get, and you'll like it.",
          responses: [
            {
              text: "Fine. I'll get it.",
              next: "accept",
              action: () => K.q.start("pv_last_portrait"),
            },
            { text: "Not interested.", end: true },
          ],
        },
        accept: {
          speaker: "Odile Marchetti",
          text: "The Tombs — the old Detention Complex on White Street, the art-deco tower with the bridge. The raiders' boss keeps his \"trophies\" in the Warden's office upstairs. Try not to get shot through the canvas.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        refuse: {
          speaker: "Odile Marchetti",
          text: "Nobody ever wants to go downtown. Go on, then. Pose for somebody else.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        waiting: {
          speaker: "Odile Marchetti",
          text: "Well? Is she safe? ...No. I can see it on you. The Tombs, darling. The Warden's office. Upstairs, past the cells.",
          responses: [{ text: "I'm working on it.", end: true }],
        },
        returned: {
          speaker: "Odile Marchetti",
          text: "...Oh. Oh, Rosie. Look at you. They put holes in the sky but you're still laughing.",
          responses: [
            {
              text: "Here. She's yours.",
              next: "thanks",
              standing: 20,
              action: () => finishPortrait("returned"),
            },
            {
              text: "[Persuasion 60] Keep your scrip. Paint something new instead.",
              check: { skill: "persuasion", value: 60 },
              next: "thanks_free",
              failNext: "thanks",
              action: () => finishPortrait("returned", true),
            },
            { text: "Leopold offered me more for it.", next: "betray" },
          ],
        },
        betray: {
          speaker: "Odile Marchetti",
          text: "Leopold would. ...Go on, then. Sell her. I'll paint her again from memory. My memory is twenty-two years long and every year of it is her; it will only take the rest of it.",
          responses: [
            {
              text: "(Give the painting back after all.)",
              next: "thanks",
              standing: 20,
              action: () => finishPortrait("returned"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        thanks: {
          speaker: "Odile Marchetti",
          text: "Take this — Moretz's key. The penthouse at the top of the stairs. He was the best of us and the worst tenant. His beret is up there too. He'd want it on someone who still goes outside.",
          responses: [{ text: "Thank you, Odile.", end: true }],
        },
        thanks_free: {
          speaker: "Odile Marchetti",
          text: "Something new. What a strange, generous, terrible idea. ...All right. Take the key at least. Moretz would haunt me otherwise.",
          responses: [{ text: "Goodbye, Odile.", end: true }],
        },
        after: {
          speaker: "Odile Marchetti",
          text: () =>
            PV.flag("portrait") === "sold"
              ? "Leopold hung her in the window with a price tag on her. I walk the long way round now."
              : "She's over the bed, where I can see her when I wake up. Old women don't sleep much. I look at her a lot.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("pv_dlg_leopold", {
      start: () =>
        K.has("pv_q_portrait") && K.q.active("pv_last_portrait")
          ? "offer"
          : "hello",
      nodes: {
        hello: {
          speaker: "Leopold Fisk",
          text: "Welcome to the Fisk Gallery, est. 1964, re-est. 1971, re-re-established after the fire. Everything on the walls is for sale except the walls. The walls are negotiable.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Who are you?", next: "who" },
            { text: "Goodbye.", end: true },
          ],
        },
        who: {
          speaker: "Leopold Fisk",
          text: "A gallerist. Before the bombs I sold abstract expressionism to bankers. Now I sell canned beans to painters. It's the same job, really: you convince somebody that a thing is worth more than it is.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        offer: {
          speaker: "Leopold Fisk",
          text: "Is that — that's the Marchetti. The swing girl. Listen, friend. Odile will cry and hug you. I will give you two hundred and fifty scrip. A hug does not buy tonic.",
          responses: [
            {
              text: "Sold. (Sell the portrait for 250 scrip.)",
              standing: -30,
              action: () => finishPortrait("sold"),
              next: "sold",
            },
            { text: "It isn't for sale.", next: "no" },
            { text: "Let's trade something else.", barter: true, end: true },
          ],
        },
        sold: {
          speaker: "Leopold Fisk",
          text: "A pleasure. I'll put her in the window. With the right lighting she'll look even sadder. Sad sells.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        no: {
          speaker: "Leopold Fisk",
          text: "Everything is for sale. You just haven't heard the right number. Come back when you have.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("pv_dlg_stanley", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Stanley",
          text: "Welcome to the Hotel Chelsea. Checking in? Rooms are fifteen scrip a night, thirty with a door. I've been on this desk since 1951. The management changed. I didn't.",
          responses: [
            { text: "Any news around the Village?", next: "news" },
            { text: "Tell me about the residents.", next: "res" },
            { text: "What's in the penthouse?", next: "pent" },
            { text: "Goodbye.", end: true },
          ],
        },
        news: {
          speaker: "Stanley",
          text: "The Vanguard is still swinging — robots on the bandstand, Mags behind the bar, down on Seventh. Katz's on Houston is crawling with roaches the size of dogs. Nobody sane goes into Chinatown after dark; there's something under the Golden Dragon that sings in a language nobody speaks. And the Tombs on White Street — raiders. Keep prisoners. Terrible tippers.",
          responses: [{ text: "Thanks.", next: "hello" }],
        },
        res: {
          speaker: "Stanley",
          text: "Odile paints on two. Leopold sells on two. Johnny Nitro screams on three — that's music, apparently. The writer on three stopped writing in '67. Mr. Moretz has the penthouse. Mr. Moretz is dead. We don't hold that against him.",
          responses: [{ text: "Thanks.", next: "hello" }],
        },
        pent: {
          speaker: "Stanley",
          text: "Mr. Moretz's studio. Locked since the bombs. Odile has his own key and she won't part with it unless you do something decent for her. I keep the spare in the cubbies, but there's twenty-two years of back rent on that room, and whoever opens the door pays it. Two hundred scrip.",
          responses: [
            {
              text: "[Pay 200 scrip] I'll settle Mr. Moretz's account.",
              cond: () => !K.has("pv_key_penthouse") && K.scripCount() >= 200,
              next: "spare",
              action: () => {
                K.scrip(-200);
                K.give("pv_key_penthouse", 1);
              },
            },
            { text: "Thanks.", next: "hello" },
          ],
        },
        spare: {
          speaker: "Stanley",
          text: "Paid in full. First time in twenty-two years. Here: brass, tassel, MORETZ on the tag. Wipe your feet up there; he was particular.",
          responses: [{ text: "Thanks.", next: "hello" }],
        },
      },
    });
    G.dialogue.register("pv_dlg_johnny", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Johnny Nitro",
          text: "OI. You. Fresh-face. You ever hear a guitar played through a Valet robot's voice box at full volume? It's the sound of the end of the world, mate. I was THERE for the end of the world. It was quieter.",
          responses: [
            { text: "Were you really here in '67?", next: "past" },
            { text: "Got anything to trade?", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        past: {
          speaker: "Johnny Nitro",
          text: "Room 822, that March morning, still up from Saturday night, playing the loudest chord in New York. Then the sky up north played a louder one. I took that personal. Been trying to top it for twenty-two years.",
          responses: [{ text: "Good luck with that.", end: true }],
        },
      },
    });
  }
  function finishPortrait(how, free) {
    if (!K.has("pv_q_portrait")) return;
    K.take("pv_q_portrait", 1);
    PV.setFlag("portrait", how);
    if (how === "sold") {
      K.scrip(250);
      K.q.complete("pv_last_portrait");
      return;
    }
    if (!K.has("pv_key_penthouse")) K.give("pv_key_penthouse", 1);
    if (!free) K.scrip(150 + (PV.flag("viv_bonus") || 0));
    else {
      K.standing(10, "Generosity");
      K.xp(50, "Persuasion");
    }
    K.q.complete("pv_last_portrait");
  }

  // ==================================================================
  // SPAWN (newGame / loaded)
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    const merch = K.stock(
      [
        ["rally_tonic", 3],
        ["prussian_blue", 2],
        ["purified_water", 4],
        ["fizzo_cola", 3],
        ["whiskey", 2],
        ["wine", 3],
        ["scrap_metal", 4],
        ["relay_board", 1],
        ["fedora", 1],
        ["bowler_hat", 1],
        ["old_world_spring_dress", 1],
      ],
      "merchant_general",
      5,
    );
    PV.spawnActor(ctx, {
      id: "pv_vivienne",
      type: "human",
      gender: "f",
      outfit: "survivor_layers",
      name: "Odile Marchetti",
      burn: "L",
      faction: "settlers",
      level: 8,
      essential: true,
      pos: v(A.vivienne),
      yaw: 0.6,
      ai: "wander",
      home: "here",
      homeR: 2.5,
      dialogue: "pv_dlg_vivienne",
      voice: "settler",
      barks: [
        "Hold still. No — the other still.",
        "Cadmium red. What I would give for cadmium red.",
        "The light up here was better before the sky caught fire.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_leopold",
      type: "human",
      gender: "m",
      outfit: "merchant",
      name: "Leopold Fisk",
      faction: "settlers",
      level: 7,
      essential: true,
      pos: v(A.merchant),
      yaw: PI,
      ai: "merchant",
      home: "here",
      homeR: 1.5,
      dialogue: "pv_dlg_leopold",
      merchant: { scrip: 450, stock: merch, restock: 3 },
      voice: "settler",
      barks: [
        "Everything is for sale. Especially the things that aren't.",
        "Don't touch the canvases. Unless you're buying.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_stanley",
      type: "human",
      gender: "m",
      outfit: "merchant",
      hat: "bowler_hat",
      name: "Stanley",
      faction: "settlers",
      level: 6,
      essential: true,
      pos: v(A.stanley),
      yaw: -HP,
      ai: "guard",
      home: "here",
      homeR: 1,
      dialogue: "pv_dlg_stanley",
      voice: "settler",
      barks: [
        "Rent is due Friday. Every Friday. Forever.",
        "Welcome to the Chelsea. Wipe your feet.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_johnny",
      type: "human",
      gender: "m",
      outfit: "raider",
      name: "Johnny Nitro",
      faction: "settlers",
      level: 7,
      essential: true,
      pos: v(A.johnny),
      yaw: 0.3,
      ai: "wander",
      home: "here",
      homeR: 3,
      dialogue: "pv_dlg_johnny",
      merchant: {
        scrip: 150,
        stock: K.stock(
          [
            ["rush", 2],
            ["rage", 1],
            ["beer", 4],
            ["vodka", 2],
          ],
          null,
        ),
      },
      voice: "settler",
      barks: [
        "ONE MORE TIME! FROM THE TOP!",
        "The roaches at Katz's are brilliant, mate. Crunchy.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_chelsea_res1",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Resident Poet",
      faction: "settlers",
      level: 4,
      pos: v(A.npc1),
      ai: "wander",
      home: "here",
      homeR: 4,
      voice: "settler",
      barks: [
        "The stairwell is a poem. I'm still on the second verse.",
        "Do you rhyme? You look like you rhyme.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_chelsea_res2",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Sculptor",
      faction: "settlers",
      level: 4,
      pos: v(A.npc3),
      ai: "wander",
      home: "here",
      homeR: 3,
      voice: "settler",
      barks: ["Found a Valet robot's arm on Eighth. It's going to be a bird."],
    });
    const door = ctx.anchors.door;
    PV.spawnActor(ctx, {
      id: "pv_chelsea_guard",
      type: "human",
      gender: "m",
      outfit: "leather_armor",
      name: "Chelsea Doorman",
      faction: "settlers",
      level: 8,
      pos: ctx.anchors.doorman
        ? { x: ctx.anchors.doorman.x, y: 0, z: ctx.anchors.doorman.z }
        : { x: door.x, y: 0, z: door.z },
      yaw: 0,
      ai: "guard",
      home: "here",
      homeR: 1.5,
      weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
      voice: "settler",
      barks: ["Art lovers only.", "Critics get shot. Customers get tea."],
    });
    // the beret waits in the penthouse
    if (!PV.flag("beret_taken") && !K.has("pv_artists_beret")) {
      K.safe("beret", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("pv_artists_beret", 1, v(ctx.anchors.beret), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  PV.define({
    id: "chelsea",
    name: "Hotel Chelsea",
    interior: "chelsea_hotel",
    order: 10,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
  });
  G.events.on("itemAdded", (id) => {
    if (id === "pv_artists_beret") PV.setFlag("beret_taken", true);
  });
})();
