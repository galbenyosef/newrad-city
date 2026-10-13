// play-inline-194 05 — tint
// Lines 805-1555 of readable/play-inline-194.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "chinatown_ext", grime: 0.6 });
    const r = K.rng("ct_ext");
    const brickT = [0.78, 0.66, 0.56];

    // ---- flanking blocks: 3 buildings each side, facing the lane ----
    const shopNames = [
      ["TEA", "#1a3a2a", "#e8d8a0"],
      ["HERBS", "#3a1a10", "#f0c850"],
      ["BAKERY", "#7a1a12", "#f8e8c0"],
      ["CHOP SUEY", "#141414", "#ff5040"],
      ["FISH MARKET", "#1a2a3a", "#e0e8f0"],
      ["NOODLES", "#5a1410", "#ffd860"],
    ];
    for (const [blk, side] of [
      [WEST, 1],
      [EAST, -1],
    ]) {
      const fx = side > 0 ? blk.x1 : blk.x0; // façade line on the lane
      const n = [side, 0];
      const H = 13 + (side > 0 ? 1.5 : 0);
      // body
      b.face(
        "brick_tan",
        blk.x0,
        0,
        blk.z0,
        0,
        0,
        1,
        0,
        1,
        0,
        blk.z1 - blk.z0,
        H,
        { tint: brickT },
      ); // west face
      b.face(
        "brick_tan",
        blk.x1,
        0,
        blk.z1,
        0,
        0,
        -1,
        0,
        1,
        0,
        blk.z1 - blk.z0,
        H,
        { tint: brickT },
      ); // east face
      b.face(
        "brick_tan",
        blk.x1,
        0,
        blk.z0,
        -1,
        0,
        0,
        0,
        1,
        0,
        blk.x1 - blk.x0,
        H,
        { tint: brickT },
      ); // north face (street)
      b.face(
        "brick_tan",
        blk.x0,
        0,
        blk.z1,
        1,
        0,
        0,
        0,
        1,
        0,
        blk.x1 - blk.x0,
        H,
        { tint: brickT },
      ); // south
      b.face(
        "concrete_dark",
        blk.x0,
        H,
        blk.z1,
        1,
        0,
        0,
        0,
        0,
        -1,
        blk.x1 - blk.x0,
        blk.z1 - blk.z0,
        { uv: "top", tint: [0.5, 0.5, 0.48] },
      );
      b.col(blk.x0, 0, blk.z0, blk.x1, H, blk.z1, { tag: "building" });
      // three shopfronts along the lane
      for (let k = 0; k < 3; k++) {
        const z0 = blk.z0 + k * 6.8 + 0.3,
          zc = z0 + 3.2,
          si = (side > 0 ? 0 : 3) + k;
        const [nm, bg, fg] = shopNames[si];
        // storefront (roll-down shutter half closed)
        K.window(b, fx, 1.7, zc, n[0], 0, 4.6, 2.9, {
          state: k === 1 ? "dark" : "glass",
          sill: false,
          frame: "paint_red",
          surround: "paint_red",
          surroundTint: [0.55, 0.12, 0.1],
          inset: 0.2,
        });
        b.boxMM(
          "corrugated",
          fx + side * 0.21,
          1.9,
          zc - 2.3,
          fx + side * 0.25,
          3.2,
          zc + 2.3,
          { tint: [0.6, 0.55, 0.45] },
        );
        // shop sign board (horizontal, glyphs + English)
        b.boxMM(
          "paint_red",
          Math.min(fx, fx + side * 0.3),
          3.35,
          zc - 2.5,
          Math.max(fx, fx + side * 0.3),
          4.35,
          zc + 2.5,
          { tint: [0.5, 0.1, 0.08] },
        );
        b.plate(
          "art",
          fx + side * 0.31,
          3.85,
          zc,
          n[0],
          0,
          4.8,
          0.95,
          hboard("ct_shop" + si, nm, 4, bg, fg, "#c8a040"),
          { off: 0.01 },
        );
        // pagoda eave over the 2nd floor + balcony
        const eaveY = 7.2;
        b.quadN(
          "rooftile",
          [fx, eaveY + 0.9, zc - 3.2],
          [fx, eaveY + 0.9, zc + 3.2],
          [fx + side * 1.4, eaveY, zc + 3.5],
          [fx + side * 1.4, eaveY, zc - 3.5],
          [side, 1, 0],
          { tint: [0.3, 0.58, 0.42], grime: 0.4 },
        );
        b.quadN(
          "paint_red",
          [fx, eaveY + 0.83, zc - 3.2],
          [fx, eaveY + 0.83, zc + 3.2],
          [fx + side * 1.4, eaveY - 0.07, zc + 3.5],
          [fx + side * 1.4, eaveY - 0.07, zc - 3.5],
          [-side, -1, 0],
          { tint: [0.42, 0.1, 0.07], grime: 0.3 },
        );
        for (const e of [-1, 1])
          b.beam(
            "rooftile",
            fx + side * 1.4,
            eaveY,
            zc + e * 3.5,
            fx + side * 1.7,
            eaveY + 0.45,
            zc + e * 3.9,
            0.18,
            0.12,
            { tint: [0.3, 0.58, 0.42] },
          );
        b.beam(
          "paint_red",
          fx + side * 1.4,
          eaveY - 0.05,
          zc - 3.5,
          fx + side * 1.4,
          eaveY - 0.05,
          zc + 3.5,
          0.14,
          0.18,
          { tint: [0.65, 0.14, 0.1] },
        );
        // 2nd/3rd floor windows
        for (const wy of [5.6, 9.6])
          for (const dz of [-1.6, 1.6])
            K.window(b, fx, wy, zc + dz, n[0], 0, 1.1, 1.7, {
              state: r() < 0.35 ? "boarded" : r() < 0.5 ? "broken" : "glass",
              frame: "paint_green",
              lintel: 0.15,
              trimTint: [0.7, 0.66, 0.58],
              reveal: "brick_tan",
            });
        b.boxMM(
          "paint_red",
          Math.min(fx, fx + side * 1.0),
          4.9,
          zc - 2.6,
          Math.max(fx, fx + side * 1.0),
          5.0,
          zc + 2.6,
          { tint: [0.55, 0.12, 0.1] },
        ); // balcony slab
        for (let t = -2.5; t <= 2.5; t += 0.35)
          b.beam(
            "paint_red",
            fx + side * 1.0,
            5.0,
            zc + t,
            fx + side * 1.0,
            5.9,
            zc + t,
            0.04,
            0.04,
            { tint: [0.6, 0.14, 0.1] },
          );
        b.beam(
          "paint_red",
          fx + side * 1.0,
          5.9,
          zc - 2.6,
          fx + side * 1.0,
          5.9,
          zc + 2.6,
          0.08,
          0.06,
          { tint: [0.6, 0.14, 0.1] },
        );
        // vertical signboard
        b.boxMM(
          "paint_black",
          Math.min(fx, fx + side * 1.2),
          8.2,
          zc + 2.8,
          Math.max(fx, fx + side * 1.2),
          12.2,
          zc + 3.05,
          {},
        );
        for (const s of [-1, 1])
          b.plate(
            "art",
            fx + side * 0.6,
            10.2,
            zc + 2.925 + s * 0.13,
            0,
            s,
            1.1,
            3.8,
            vboard(
              "ct_vb" + si,
              5,
              ["#7a1a12", "#1a1a1a", "#e8c040"][k % 3],
              ["#f0d060", "#e03020", "#7a1010"][k % 3],
              "#c8a040",
            ),
            { off: 0.01 },
          );
        // produce crates on the sidewalk (fish market / bakery)
        if (si === 4 || si === 2)
          for (let c = 0; c < 3; c++) {
            b.box(
              "wood_rotten",
              fx + side * 1.2,
              0,
              zc - 1.5 + c * 1.5,
              0.9,
              0.5,
              0.6,
              { tint: [0.6, 0.5, 0.36] },
            );
            b.col(
              fx + side * 0.75 - 0.05,
              0,
              zc - 1.8 + c * 1.5,
              fx + side * 1.65 + 0.05,
              0.5,
              zc - 1.2 + c * 1.5,
              {},
            );
          }
      }
      // cornice & parapet with small pagoda on the street corner
      // (round 2: this used to be ONE red box over the whole footprint — every aerial showed two bright red slabs.
      //  Now a lacquered cornice ring + brick parapet round a tar roof with NYC rooftop clutter.)
      roofRing(b, blk, side, H, brickT);
      rooftop(b, r, blk, side, H);
      const px = side > 0 ? blk.x1 - 4 : blk.x0 + 4,
        pz = blk.z0 + 4;
      b.boxMM("brick_tan", px - 3, H, pz - 3, px + 3, H + 3, pz + 3, {
        tint: brickT,
      });
      for (const s of [-1, 1])
        for (const t of [-1, 1])
          b.cyl(
            "paint_red",
            px + s * 2.6,
            H + 3,
            pz + t * 2.6,
            0.18,
            0.18,
            2.2,
            8,
            { tint: [0.6, 0.12, 0.1] },
          );
      pagodaRoof(b, px, H + 5.2, pz, 6.2, 6.2, 1.8, 1.1, 0.7);
      pagodaRoof(b, px, H + 3.0, pz, 6.8, 6.8, 0.5, 1.2, 0.5);
      // street-side (north) storefront with a big neon
      K.window(b, (blk.x0 + blk.x1) / 2, 1.7, blk.z0, 0, -1, 8, 2.9, {
        state: "broken",
        sill: false,
        frame: "paint_red",
        surround: "paint_red",
        surroundTint: [0.55, 0.12, 0.1],
        inset: 0.2,
      });
      streetFacade(b, r, blk, side, H);
      outerFacades(b, r, blk, side, H);
    }
    b.plate(
      "neon",
      (WEST.x0 + WEST.x1) / 2,
      4.1,
      WEST.z0 - 0.1,
      0,
      -1,
      6.5,
      1.1,
      K.neonCell("ct_neon_w", "CHINATOWN", 512, 96, {
        color: "#ffcc30",
        font: "Georgia, serif",
        border: true,
      }),
    );
    b.plate(
      "neon",
      (EAST.x0 + EAST.x1) / 2,
      4.1,
      EAST.z0 - 0.1,
      0,
      -1,
      6.5,
      1.1,
      K.neonCell("ct_neon_e", "JADE PALACE", 512, 96, {
        color: "#40ff90",
        font: "Georgia, serif",
        broken: 2,
      }),
    );
    b.glow((WEST.x0 + WEST.x1) / 2, 4.1, WEST.z0 - 0.8, [1, 0.75, 0.2], 4);

    // ---- the lane: paving, lanterns, trash ----
    b.face(
      "sidewalk",
      LANE.x0 - 0.5,
      0.02,
      REST.z0,
      1,
      0,
      0,
      0,
      0,
      -1,
      LANE.x1 - LANE.x0 + 1,
      REST.z0 - LANE.z0 + 1,
      { uv: "top", tint: [0.7, 0.66, 0.6] },
    );
    for (let z = 501; z < 518; z += 3.2) {
      b.pipe("black_iron", WEST.x1, 7.0, z, EAST.x0, 7.0, z + 0.4, 0.008, 3);
      for (let x = WEST.x1 + 1.2; x < EAST.x0 - 0.8; x += 1.6) {
        const sag = Math.sin(((x - WEST.x1) / (EAST.x0 - WEST.x1)) * PI) * 0.5;
        K.lamp(b, x, 6.45 - sag, z + 0.2, "lantern", [1, 0.35, 0.2], 0, 0, {
          ceil: 7.0 - sag,
          size: 0.3,
          glowSize: 1.2,
        });
      }
    }
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        156 + r() * 8,
        0.03 + k * 0.001,
        500 + r() * 16,
        1.6,
        1.6,
        r() * 6,
        K.decal(k % 2 ? "grime" : "scorch", k),
      );
    b.hplate("metal_dark", MANHOLE.x, 0.04, MANHOLE.z, 0.9, 0.9, 0.3, null, {
      tint: [0.35, 0.33, 0.3],
    });
    b.cyl("rust", MANHOLE.x, 0.02, MANHOLE.z, 0.55, 0.55, 0.03, 12, {
      tint: [0.4, 0.35, 0.3],
    });

    // ---- the PAIFANG gate at the lane mouth (z ≈ 498) ----
    {
      const gz = 496.8,
        gx = 160;
      const red = [0.7, 0.12, 0.08];
      for (const [x, h, rr] of [
        [-4.2, 9.6, 0.4],
        [4.2, 9.6, 0.4],
        [-7.2, 6.8, 0.32],
        [7.2, 6.8, 0.32],
      ]) {
        b.cyl("paint_red", gx + x, 0, gz, rr, rr * 0.9, h, 12, { tint: red });
        b.boxMM(
          "granite",
          gx + x - rr * 1.5,
          0,
          gz - rr * 1.5,
          gx + x + rr * 1.5,
          0.7,
          gz + rr * 1.5,
          { tint: [0.5, 0.48, 0.45] },
        );
        b.col(gx + x - rr, 0, gz - rr, gx + x + rr, h, gz + rr, {
          tag: "gate",
          walkable: false,
        });
      }
      // lintels & bracket sets (main bay: tie beam, red lintel, green frieze with the plaque, gold dougong brackets)
      b.boxMM(
        "paint_red",
        gx - 4.5,
        6.9,
        gz - 0.25,
        gx + 4.5,
        7.25,
        gz + 0.25,
        { tint: red },
      );
      b.boxMM("paint_red", gx - 4.8, 7.8, gz - 0.4, gx + 4.8, 8.5, gz + 0.4, {
        tint: red,
      });
      b.boxMM(
        "paint_green",
        gx - 4.6,
        8.55,
        gz - 0.34,
        gx + 4.6,
        9.5,
        gz + 0.34,
        { tint: [0.25, 0.45, 0.4] },
      );
      for (let x = -4.4; x <= 4.4; x += 0.55)
        b.boxMM(
          "gold",
          gx + x - 0.13,
          9.5,
          gz - 0.45,
          gx + x + 0.13,
          9.9,
          gz + 0.45,
          {},
        );
      for (const s of [-1, 1]) {
        b.boxMM(
          "paint_red",
          gx + s * 7.7,
          5.3,
          gz - 0.3,
          gx + s * 3.9,
          5.9,
          gz + 0.3,
          { tint: red },
        );
        b.boxMM(
          "paint_green",
          gx + s * 7.5,
          5.0,
          gz - 0.2,
          gx + s * 4.3,
          5.3,
          gz + 0.2,
          { tint: [0.25, 0.45, 0.4] },
        );
        for (let x = 4.3; x <= 7.4; x += 0.55)
          b.boxMM(
            "gold",
            gx + s * x - 0.1,
            5.9,
            gz - 0.38,
            gx + s * x + 0.1,
            6.2,
            gz + 0.38,
            {},
          );
      }
      // central plaque (gold glyphs on blue) both sides
      const plaque = hboard(
        "ct_gate_plaque",
        "",
        3,
        "#1a3a5a",
        "#f0d060",
        "#e0b040",
      );
      b.plate("art", gx, 9.02, gz - 0.35, 0, -1, 3.6, 0.9, plaque, {
        off: 0.01,
      });
      b.plate("art", gx, 9.02, gz + 0.35, 0, 1, 3.6, 0.9, plaque, {
        off: 0.01,
      });
      // roofs: main (tall, two tiers) + side roofs
      pagodaRoof(b, gx, 10.0, gz, 9.6, 1.2, 1.8, 1.2, 0.8);
      for (const s of [-1, 1])
        pagodaRoof(b, gx + s * 5.8, 6.3, gz, 3.9, 1.0, 1.1, 0.9, 0.55);
      // red lanterns hanging in the main bay
      for (const x of [-2.6, 0, 2.6])
        K.lamp(b, gx + x, 6.3, gz, "lantern", [1, 0.35, 0.2], 0, 0, {
          ceil: 6.9,
          size: 0.45,
          glowSize: 1.8,
        });
      b.burn(gx + 3, 7, gz, 3, 0.5);
      // guardian lions (stylised)
      for (const s of [-1, 1]) {
        const lx = gx + s * 5.6,
          lz = gz - 1.4;
        b.boxMM("granite", lx - 0.6, 0, lz - 0.6, lx + 0.6, 1.0, lz + 0.6, {
          tint: [0.55, 0.52, 0.48],
        });
        b.geo("granite", K.sphereGeo(), {
          x: lx,
          y: 1.6,
          z: lz,
          sx: 0.45,
          sy: 0.6,
          sz: 0.4,
          tint: [0.55, 0.52, 0.48],
        });
        b.geo("granite", K.sphereGeo(), {
          x: lx,
          y: 2.3,
          z: lz - 0.1,
          s: 0.34,
          tint: [0.55, 0.52, 0.48],
        });
        b.col(lx - 0.6, 0, lz - 0.6, lx + 0.6, 2.4, lz + 0.6, {
          walkable: false,
        });
      }
    }

    // ---- the GOLDEN DRAGON restaurant ----
    {
      const R = REST,
        fz = R.z0,
        Hh = 10;
      b.face("brick_tan", R.x1, 0, fz, -1, 0, 0, 0, 1, 0, R.x1 - R.x0, Hh, {
        tint: [0.7, 0.2, 0.16],
      }); // front (−z) painted red
      b.face("brick_tan", R.x0, 0, fz, 0, 0, 1, 0, 1, 0, R.z1 - R.z0, Hh, {
        tint: brickT,
      });
      b.face("brick_tan", R.x1, 0, R.z1, 0, 0, -1, 0, 1, 0, R.z1 - R.z0, Hh, {
        tint: brickT,
      });
      b.col(R.x0, 0, fz, R.x1, Hh, R.z1, { tag: "building" });
      // columns & doors
      for (const x of [R.x0 + 2, 156.5, 163.5, R.x1 - 2]) {
        b.cyl("paint_red", x, 0, fz - 0.6, 0.3, 0.3, 4.6, 12, {
          tint: [0.72, 0.12, 0.08],
        });
        b.col(x - 0.3, 0, fz - 0.9, x + 0.3, 4.6, fz - 0.3, {
          walkable: false,
        });
        b.cyl("gold", x, 4.5, fz - 0.6, 0.38, 0.3, 0.2, 12);
      }
      b.boxMM("paint_red", R.x0, 4.6, fz - 1.2, R.x1, 5.0, fz, {
        tint: [0.55, 0.1, 0.08],
      });
      b.boxMM("paint_black", 158.3, 0, fz - 0.05, 161.7, 3.4, fz, {
        tint: [0.1, 0.08, 0.06],
      });
      for (const s of [-1, 1]) {
        b.plate(
          "lacquer",
          160 + s * 0.82,
          1.65,
          fz - 0.08,
          0,
          -1,
          1.55,
          3.1,
          null,
          { tint: [0.9, 0.9, 0.9] },
        );
        b.cyl("gold", 160 + s * 0.15, 1.5, fz - 0.14, 0.09, 0.09, 0.04, 10);
      }
      for (const x of [152.5, 167.5])
        K.window(b, x, 2.1, fz, 0, -1, 3.4, 2.6, {
          state: "glass",
          sill: false,
          frame: "gold",
          surround: "paint_red",
          surroundTint: [0.55, 0.12, 0.1],
          inset: 0.2,
        });
      // pagoda roof over the front + upper storey
      pagodaRoof(b, 160, 5.0, fz + 1.2, R.x1 - R.x0, 3.6, 1.6, 1.2, 0.7);
      for (let x = R.x0 + 2.5; x < R.x1 - 1; x += 3.4)
        K.window(b, x, 7.8, fz, 0, -1, 1.3, 1.8, {
          state: r() < 0.5 ? "broken" : "glass",
          frame: "gold",
          lintel: 0.15,
          trimTint: [0.8, 0.7, 0.4],
        });
      pagodaRoof(
        b,
        160,
        Hh,
        (fz + R.z1) / 2,
        R.x1 - R.x0 - 1,
        R.z1 - fz - 1,
        2.6,
        1.0,
        0.8,
        [0.75, 0.6, 0.25],
      );
      // big sign + neon
      const gd = K.neonCell("ct_gd", "GOLDEN DRAGON", 768, 128, {
        color: "#ffc830",
        font: "Georgia, serif",
        border: true,
      });
      b.plate("paint_black", 160, 6.2, fz - 1.25, 0, -1, 12, 1.4, null, {
        tint: [0.25, 0.1, 0.08],
      });
      b.plate("neon", 160, 6.2, fz - 1.3, 0, -1, 11.4, 1.25, gd);
      b.glow(160, 6.2, fz - 2, [1, 0.7, 0.2], 5);
      const cs = K.neonCell("ct_chopsuey", "CHOP SUEY", 96, 512, {
        color: "#ff3a2a",
        vertical: true,
        font: "Arial Black, sans-serif",
      });
      b.boxMM(
        "paint_black",
        R.x1 - 1.2,
        5.5,
        fz - 1.6,
        R.x1 - 0.9,
        9.8,
        fz,
        {},
      );
      b.plate("neon", R.x1 - 1.05, 7.65, fz - 1.62, 0, -1, 0.7, 4.1, cs, {
        off: 0.01,
      });
      b.plate("neon", R.x1 - 1.22, 7.65, fz - 0.8, -1, 0, 1.4, 4.1, cs, {
        off: 0.01,
      });
      b.glow(R.x1 - 1.05, 7.65, fz - 2.2, [1, 0.25, 0.15], 4);
      // THE DRAGON: a serpentine gold body across the upper façade
      const pts = [];
      for (let k = 0; k <= 36; k++) {
        const t = k / 36;
        pts.push([
          R.x0 + 1.5 + t * (R.x1 - R.x0 - 3),
          8.6 + Math.sin(t * PI * 3) * 0.7,
          fz - 0.35 - Math.sin(t * PI * 3 + 1) * 0.12,
        ]);
      }
      for (let k = 0; k < pts.length - 1; k++) {
        const a = pts[k],
          c = pts[k + 1],
          rr = 0.22 * (0.5 + 0.5 * Math.sin((k / 36) * PI));
        b.pipe("gold", a[0], a[1], a[2], c[0], c[1], c[2], rr + 0.06, 8, {
          tint: [0.95, 0.75, 0.3],
        });
        if (k % 2 === 0)
          b.box("paint_red", a[0], a[1] + rr, a[2], 0.18, 0.25, 0.08, {
            tint: [0.8, 0.2, 0.1],
          });
      }
      const head = pts[pts.length - 1];
      b.geo("gold", K.sphereGeo(), {
        x: head[0] + 0.3,
        y: head[1] + 0.1,
        z: head[2],
        sx: 0.55,
        sy: 0.4,
        sz: 0.35,
        tint: [0.95, 0.75, 0.3],
      });
      b.box(
        "paint_red",
        head[0] + 0.8,
        head[1] - 0.05,
        head[2],
        0.5,
        0.12,
        0.25,
        { tint: [0.8, 0.15, 0.1] },
      ); // jaw
      for (const s of [-1, 1])
        b.pipe(
          "gold",
          head[0] + 0.2,
          head[1] + 0.3,
          head[2] + s * 0.1,
          head[0] - 0.4,
          head[1] + 0.9,
          head[2] + s * 0.25,
          0.05,
          5,
        ); // horns
      b.glow(head[0] + 0.55, head[1] + 0.2, head[2] - 0.3, [1, 0.3, 0.1], 0.6);
      // lanterns under the eave
      for (let x = R.x0 + 1; x < R.x1; x += 2.2)
        K.lamp(b, x, 4.1, fz - 1.0, "lantern", [1, 0.35, 0.2], 0, 0, {
          ceil: 4.6,
          size: 0.34,
          glowSize: 1.4,
        });
    }
    // burnt cars & rubble in the lane / street
    K.rubble(b, 150, 0, 495, 2.4, 1.1, { seed: 4 });
    b.burn(163, 1, 510, 4, 0.6);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_chinatown_ext";
    K.anchor(ctx, "door", 160, 0, REST.z0 - 2.2, false);
    K.anchor(ctx, "gate", 160, 0, 496, false);
    K.anchor(ctx, "manhole", MANHOLE.x, 0, MANHOLE.z, false);
    K.loot(ctx, "car", 172, 0, 492, 0.3, { world: true, burnt: true });
    K.loot(ctx, "barrel", 157, 0, 506, 0, {
      world: true,
      radioactive: true,
      container: false,
    });
    K.loot(ctx, "dumpster", 165, 0, 515, -HP, {
      world: true,
      loot: "dumpster",
    });
    K.skel(ctx, 158.5, 0, 509, 1.2, "lying", { world: true });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
