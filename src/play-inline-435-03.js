// play-inline-435 03 — tint
// Lines 36-2390 of readable/play-inline-435.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "zoo_int",
      off: O,
      lit: true,
      amb: [0.055, 0.055, 0.06],
      floors: [BY, 0, 4.4],
      grime: 0.55,
    });
    const r = K.rng("zoo_int");
    const warm = [1, 0.8, 0.55],
      day = [0.62, 0.7, 0.72],
      tube = [0.78, 0.92, 0.86],
      red = [1, 0.16, 0.08],
      uv = [0.75, 0.4, 1.0],
      ice = [0.62, 0.82, 1.0];
    const BRICK = [0.6, 0.36, 0.28],
      PLAS = [0.74, 0.7, 0.6],
      WOOD = [0.36, 0.24, 0.15];

    // ---------------------------------------------------------------- door gaps
    K.gap(ctx, 0, -3, 2.2, 0, 3.0); // vestibule → stair hall
    K.gap(ctx, -8, -6.5, 1.4, 0, 2.5); // hall → parks office
    K.gap(ctx, 8, -6.5, 1.6, 0, 2.6); // hall → army depot
    K.gap(ctx, 4, -14, 2.4, 0, 3.2); // hall → map room
    K.gap(ctx, -8, -12.8, 1.3, 4.4, 2.3); // landing → commissioner's office
    K.gap(ctx, 14.85, -24, 1.6, BY, 2.4); // stair shaft → NOAH control
    K.gap(ctx, 6, -30, 2.4, BY, 2.7); // NOAH control → service tunnel (blast door)
    K.gap(ctx, -11, -31.5, 2.0, BY, 2.6); // tunnel → night house
    K.gap(ctx, -30, -30, 2.4, BY, 2.8); // tunnel → biome A
    K.gap(ctx, -38.5, -40, 2.4, BY, 2.8); // biome A → polar passage
    K.gap(ctx, -38.5, -44, 2.4, BY, 2.8); // polar passage → biome B

    /** Window: a daylight-lit plate (overcast sky seen through grimy glass) + mullions + a baked cold light. */
    function dayWindow(x, y, z, nx, nz, w, h, box, o) {
      o = o || {};
      b.plate("lamp", x, y, z, nx, nz, w, h, null, {
        tint: o.boarded ? [0.1, 0.11, 0.1] : [0.5, 0.56, 0.55],
        off: 0.02,
      });
      const rx = nz,
        rz = -nx;
      for (let k = 1; k < 3; k++) {
        const u = -w / 2 + (w * k) / 3;
        b.beam(
          "wood_dark",
          x + rx * u + nx * 0.05,
          y - h / 2,
          z + rz * u + nz * 0.05,
          x + rx * u + nx * 0.05,
          y + h / 2,
          z + rz * u + nz * 0.05,
          0.05,
          0.05,
          { tint: [0.2, 0.18, 0.15] },
        );
      }
      for (let k = 1; k < 4; k++) {
        const v = -h / 2 + (h * k) / 4;
        b.beam(
          "wood_dark",
          x - (rx * w) / 2 + nx * 0.05,
          y + v,
          z - (rz * w) / 2 + nz * 0.05,
          x + (rx * w) / 2 + nx * 0.05,
          y + v,
          z + (rz * w) / 2 + nz * 0.05,
          0.05,
          0.05,
          { tint: [0.2, 0.18, 0.15] },
        );
      }
      if (o.boarded)
        for (let k = 0; k < 3; k++) {
          const v = -h / 3 + (k * h) / 3;
          b.beam(
            "wood_rotten",
            x - rx * (w / 2 + 0.1) + nx * 0.1,
            y + v,
            z - rz * (w / 2 + 0.1) + nz * 0.1,
            x + rx * (w / 2 + 0.1) + nx * 0.1,
            y + v + (r() - 0.5) * 0.2,
            z + rz * (w / 2 + 0.1) + nz * 0.1,
            0.22,
            0.03,
            { tint: [0.5, 0.42, 0.34] },
          );
        }
      b.box(
        "limestone",
        x + nx * 0.08,
        y - h / 2 - 0.1,
        z + nz * 0.08,
        Math.abs(rx) * (w + 0.3) + Math.abs(nx) * 0.25,
        0.08,
        Math.abs(rz) * (w + 0.3) + Math.abs(nz) * 0.25,
        { tint: [0.7, 0.68, 0.62] },
      );
      if (!o.boarded)
        b.light(
          x + nx * 1.2,
          y,
          z + nz * 1.2,
          day,
          o.i || 0.9,
          o.r || 7,
          box ? { box } : undefined,
        );
      else
        b.light(
          x + nx * 0.6,
          y,
          z + nz * 0.6,
          day,
          0.25,
          3,
          box ? { box } : undefined,
        );
    }

    // ================================================================ VESTIBULE
    const VB = [-2.1, -0.3, -3.1, 2.1, 4.1, 0.1];
    K.room(b, ctx, {
      x0: -2,
      z0: -3,
      x1: 2,
      z1: 0,
      y: 0,
      h: 4.0,
      floor: "mosaic",
      fc: [0.7, 0.66, 0.6],
      wall: "plaster",
      wc: PLAS,
      wain: "wood_dark",
      wainC: WOOD,
      wainH: 1.2,
      ceil: "plaster",
      cc: [0.6, 0.58, 0.52],
      cornice: true,
    });
    b.boxMM("wood_dark", -0.9, 0, -0.12, 0.9, 2.8, -0.08, {
      tint: [0.28, 0.2, 0.13],
    });
    b.plate("lamp", 0, 3.3, -0.1, 0, -1, 1.4, 0.5, null, {
      tint: [0.45, 0.5, 0.5],
    }); // transom
    b.light(0, 2.6, -1.2, day, 0.6, 4, { box: VB });
    b.plate(
      "art",
      1.95,
      1.7,
      -1.5,
      -1,
      0,
      0.9,
      0.6,
      K.signCell(
        "ppk_directory",
        "DEPT. OF PARKS\nCommissioner — 2nd Fl.\nMap Room — Rear\nZoo Admin — Ext. 14",
        200,
        130,
        { bg: "#1a1a18", fg: "#e8e0c8", font: "Georgia, serif" },
      ),
    );
    b.plate(
      "art",
      -1.95,
      1.8,
      -1.5,
      1,
      0,
      0.8,
      0.8,
      K.signCell(
        "ppk_army_notice",
        "NOTICE\nThis building is requisitioned\nunder the Civil Defense Act\nof 1966.\nSgt. of the Guard: Rm 1-E",
        200,
        200,
        {
          bg: "#e8e0c8",
          fg: "#1a1a1a",
          font: "Courier New, monospace",
          border: "#1a1a1a",
        },
      ),
    );
    K.litter(b, -1.8, -2.8, 1.8, -0.2, 0, 5, 9101);

    // ================================================================ STAIR HALL (double height)
    const HB = [-8.1, -0.3, -14.1, 8.1, 7.3, -2.9];
    K.room(b, ctx, {
      x0: -8,
      z0: -14,
      x1: 8,
      z1: -3,
      y: 0,
      h: 7.2,
      floor: "mosaic",
      fc: [0.68, 0.64, 0.58],
      wall: "plaster",
      wc: PLAS,
      wain: "wood_dark",
      wainC: WOOD,
      wainH: 1.4,
      ceil: "tin",
      cc: [0.5, 0.48, 0.42],
      cornice: true,
      corniceMat: "plaster",
    });
    // coffered beams
    for (let x = -6; x <= 6; x += 3)
      b.beam("plaster", x, 7.05, -13.9, x, 7.05, -3.1, 0.3, 0.3, {
        tint: [0.62, 0.6, 0.54],
      });
    for (let z = -12; z <= -4; z += 3)
      b.beam("plaster", -7.9, 7.05, z, 7.9, 7.05, z, 0.3, 0.3, {
        tint: [0.62, 0.6, 0.54],
      });
    // WPA murals round the upper walls (the real Arsenal has them — ours were painted in 1964 and are about the Army)
    K.framed(b, -7.88, 5.2, -7.0, 1, 0, 5.4, 2.6, K.mural(0, 384, 192), {
      frame: "wood_dark",
      fw: 0.1,
    });
    K.framed(b, 7.88, 5.2, -10.4, -1, 0, 5.8, 2.8, K.mural(1, 384, 192), {
      frame: "wood_dark",
      fw: 0.1,
    });
    K.framed(b, -5.0, 5.4, -3.12, 0, -1, 4.8, 2.2, K.mural(2, 384, 192), {
      frame: "wood_dark",
      fw: 0.1,
    });
    K.framed(b, 5.0, 5.4, -3.12, 0, -1, 4.8, 2.2, K.mural(3, 384, 192), {
      frame: "wood_dark",
      fw: 0.1,
    });
    K.framed(b, 0.6, 5.6, -13.88, 0, 1, 4.6, 2.2, K.mural(4, 384, 192), {
      frame: "wood_dark",
      fw: 0.1,
    });
    b.plate("decal", -4.2, 5.6, -3.1, 0, -1, 1.2, 1.2, K.decal("crack", 4), {
      off: 0.04,
    });
    // tall windows (south wall, either side of the vestibule) → daylight
    dayWindow(-5, 2.6, -3.1, 0, -1, 1.5, 3.0, HB, { i: 1.1, r: 9 });
    dayWindow(5, 2.6, -3.1, 0, -1, 1.5, 3.0, HB, { i: 1.1, r: 9 });
    // the marble stair along the north wall, rising west to the landing
    K.stairs(b, -6, -13.9, 0, -12.4, 0, 4.4, "-x", {
      mat: "marble",
      tint: [0.78, 0.76, 0.7],
      rail: "l",
      railMat: "black_iron",
      handMat: "mahogany",
      nosing: "brass",
    });
    b.boxMM("marble", -7.9, 4.1, -13.9, -6, 4.4, -11.6, {
      tint: [0.76, 0.74, 0.68],
      faces: "nsewtb",
    });
    b.col(-7.9, 4.1, -13.9, -6, 4.4, -11.6, {
      tag: "landing",
      surface: "concrete",
    });
    for (const x of [-7.8, -6.1])
      b.cyl("marble", x, 0, -11.75, 0.12, 0.12, 4.1, 10, {
        tint: [0.74, 0.72, 0.66],
      });
    b.col(-7.95, 0, -11.9, -7.65, 4.1, -11.6, { tag: "post" });
    b.col(-6.25, 0, -11.9, -5.95, 4.1, -11.6, { tag: "post" });
    K.railing(b, -7.9, -11.62, -6.0, -11.62, 4.4, {
      mat: "black_iron",
      handMat: "mahogany",
      step: 0.14,
    });
    K.railing(b, -6.02, -12.4, -6.02, -11.62, 4.4, {
      mat: "black_iron",
      handMat: "mahogany",
      step: 0.14,
    });
    // cannon newel at the foot of the stair (echo of the stoop outside)
    b.cyl("black_iron", 0.2, 0, -12.6, 0.18, 0.15, 1.1, 10, {
      tint: [0.14, 0.14, 0.13],
    });
    b.geo("black_iron", K.sphereGeo(), {
      x: 0.2,
      y: 1.15,
      z: -12.6,
      s: 0.16,
      tint: [0.14, 0.14, 0.13],
    });
    b.col(0.0, 0, -12.8, 0.4, 1.2, -12.4, { tag: "newel" });
    // dead chandelier, reception desk, benches, the portrait, fallen plaster
    K.chandelier(b, 1.5, 5.2, -8.5, 1.1, { ceil: 7.2, dead: true, tiers: 2 });
    const rd = K.table(b, 3.4, 0, -9.2, 2.6, 0.8, {
      mat: "mahogany",
      tint: [0.36, 0.18, 0.1],
      h: 1.05,
    });
    b.boxMM("mahogany", 2.1, 0, -8.85, 4.7, 1.0, -8.8, {
      tint: [0.32, 0.16, 0.09],
    });
    b.box("metal", 3.9, rd, -9.3, 0.35, 0.2, 0.3, { tint: [0.3, 0.3, 0.28] }); // telephone switchboard
    b.box("flat", 2.8, rd, -9.3, 0.3, 0.02, 0.22, {
      yaw: 0.3,
      tint: [0.85, 0.82, 0.72],
    });
    b.plate(
      "art",
      3.4,
      0.6,
      -8.78,
      0,
      1,
      1.6,
      0.35,
      K.signCell("ppk_info", "INFORMATION", 256, 56, {
        bg: "#1a1a18",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    K.framed(b, 7.88, 2.6, -4.6, -1, 0, 0.9, 1.2, K.painting(7, 128, 160), {
      frame: "gold",
    });
    b.plate(
      "art",
      7.86,
      1.75,
      -4.6,
      -1,
      0,
      0.8,
      0.16,
      K.signCell("ppk_portrait", "COMMISSIONER R. MOSS", 256, 48, {
        bg: "#2a2014",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
      { off: 0.03 },
    );
    K.sofa(b, -3.5, 0, -3.5, 2.0, 0, {
      mat: "leather",
      d: 0.55,
      arms: true,
      backH: 0.55,
    });
    K.rubble(b, -5.5, 0, -9.5, 1.4, 0.7, { seed: 81, n: 8 });
    b.face("decal", -6.5, 7.12, -10.5, 1, 0, 0, 0, 0, 1, 2.0, 2.0, {
      rect: K.decal("crack", 5),
      uv: "rect",
      grime: 0,
    });
    b.hplate("decal", -1, 0.012, -7, 3.2, 2.4, 0.2, K.decal("grime", 6));
    b.hplate("decal", 5.2, 0.013, -5.0, 1.4, 1.4, 1.0, K.decal("blood", 6));
    K.litter(b, -7.5, -13, 7.5, -3.5, 0, 16, 9102);
    // emergency lamp over the depot door (Army battery unit, still glowing red)
    b.box("metal_dark", 7.8, 2.9, -6.5, 0.16, 0.18, 0.4, {
      tint: [0.3, 0.32, 0.28],
    });
    b.box("lamp", 7.68, 2.95, -6.5, 0.05, 0.1, 0.3, { tint: red });
    b.light(6.8, 2.8, -6.5, red, 0.7, 5, { box: HB });
    b.glow(7.66, 2.95, -6.5, [0.8, 0.12, 0.06], 0.8);

    // ================================================================ PARKS OFFICE (west, ground)
    const POB = [-16.1, -0.3, -14.1, -7.9, 4.3, -2.9];
    K.room(b, ctx, {
      x0: -16,
      z0: -14,
      x1: -8,
      z1: -3,
      y: 0,
      h: 4.2,
      floor: "parquet",
      fc: [0.5, 0.4, 0.3],
      wall: "wallpaper_green",
      wc: [0.7, 0.7, 0.62],
      wain: "wood_dark",
      wainC: WOOD,
      wainH: 1.1,
      ceil: "plaster",
      cc: [0.55, 0.53, 0.48],
    });
    for (const z of [-5, -8.5, -12])
      dayWindow(-15.9, 2.1, z, 1, 0, 1.2, 2.2, POB, {
        i: 0.8,
        r: 6,
        boarded: z === -8.5,
      });
    for (let k = 0; k < 6; k++) {
      const x = -14 + (k % 2) * 3.4,
        z = -5.2 - Math.floor(k / 2) * 3.0;
      const t = K.table(b, x, 0, z, 1.4, 0.75, {
        mat: "wood_dark",
        tint: WOOD,
      });
      K.chair(b, x, 0, z + 0.7, PI, { mat: "wood_dark", fallen: k === 3 });
      b.box("metal_dark", x - 0.2, t, z - 0.05, 0.45, 0.2, 0.36, {
        tint: [0.24, 0.26, 0.24],
      }); // typewriter
      b.box("flat", x + 0.35, t, z + 0.1, 0.25, 0.04, 0.32, {
        yaw: r(),
        tint: [0.85, 0.82, 0.72],
      });
    }
    for (let k = 0; k < 4; k++)
      K.shelf(b, -8.35, 0, -9.0 - k * 1.1, -HP, 1.0, {
        h: 1.35,
        d: 0.5,
        mat: "metal",
        tint: [0.4, 0.44, 0.4],
        levels: 3,
        items: ["box"],
        seed: 120 + k,
        col: true,
      });
    b.plate(
      "art",
      -12,
      2.9,
      -13.88,
      0,
      1,
      2.4,
      0.9,
      K.signCell(
        "ppk_parks_motto",
        "THE PARKS BELONG TO THE PEOPLE\n— and the people belong in the parks —",
        480,
        160,
        { bg: "#2d4a2e", fg: "#e8e0c8", font: "Georgia, serif" },
      ),
    );
    K.lamp(b, -12, 3.6, -8.5, "pendant", warm, 0, 0, { ceil: 4.2, dead: true });
    K.litter(b, -15.6, -13.6, -8.4, -3.4, 0, 18, 9103);
    for (let k = 0; k < 10; k++)
      b.hplate(
        "flat",
        -15 + r() * 6,
        0.013 + k * 0.001,
        -12.8 + r() * 9,
        0.22,
        0.3,
        r() * 6,
        null,
        { tint: [0.82, 0.8, 0.7] },
      );
    K.loot(ctx, "file_cabinet", -15.4, 0, -13.2, HP, {
      loot: "file_cabinet",
      name: "Permits & Plans",
    });
    K.loot(ctx, "desk", -9.3, 0, -4.1, PI, {
      loot: "desk",
      name: "Clerk's Desk",
    });

    // ================================================================ COMMISSIONER'S OFFICE (west, upstairs)
    const COB = [-16.1, 4.1, -14.1, -7.9, 7.9, -2.9];
    K.room(b, ctx, {
      x0: -16,
      z0: -14,
      x1: -8,
      z1: -3,
      y: 4.4,
      h: 3.4,
      floor: "carpet",
      fc: [0.5, 0.36, 0.3],
      wall: "wallpaper",
      wc: [0.72, 0.64, 0.54],
      wain: "mahogany",
      wainC: [0.34, 0.18, 0.1],
      wainH: 1.2,
      ceil: "plaster",
      cc: [0.58, 0.56, 0.5],
      cornice: true,
      corniceMat: "wood_dark",
      surface: "carpet",
    });
    for (const z of [-5.5, -10.5])
      dayWindow(-15.9, 6.3, z, 1, 0, 1.2, 2.0, COB, { i: 0.8, r: 6 });
    dayWindow(-12, 6.3, -3.1, 0, -1, 1.2, 2.0, COB, { i: 0.7, r: 5 });
    // the big partners' desk facing the door, the model of his unbuilt "Central Park Expressway"
    const cd = K.table(b, -13.2, 4.4, -8.6, 2.4, 1.1, {
      mat: "mahogany",
      tint: [0.36, 0.18, 0.1],
      h: 0.8,
    });
    b.boxMM("mahogany", -14.35, 4.4, -8.1, -12.05, 5.15, -8.05, {
      tint: [0.32, 0.16, 0.09],
    });
    K.chair(b, -13.2, 4.4, -9.6, PI, { mat: "leather", seatMat: "leather" });
    b.box("brass", -12.4, cd, -8.4, 0.25, 0.3, 0.15, { tint: [0.6, 0.5, 0.3] });
    b.cyl("glass", -12.4, cd + 0.3, -8.4, 0.12, 0.08, 0.14, 8, {
      tint: [0.3, 0.5, 0.3],
    }); // banker's lamp
    const mt = K.table(b, -10.2, 4.4, -12.4, 2.4, 1.2, {
      mat: "wood_dark",
      tint: WOOD,
      h: 0.9,
    });
    b.boxMM("flat", -11.3, mt, -12.9, -9.1, mt + 0.02, -11.9, {
      tint: [0.4, 0.5, 0.35],
    });
    b.boxMM("concrete", -11.3, mt + 0.02, -12.5, -9.1, mt + 0.08, -12.3, {
      tint: [0.6, 0.6, 0.58],
    }); // the expressway, slicing the park in two
    for (let k = 0; k < 6; k++)
      b.box("concrete", -11.0 + k * 0.38, mt + 0.02, -12.4, 0.05, 0.12, 0.05, {
        tint: [0.55, 0.55, 0.52],
      });
    b.plate(
      "art",
      -10.2,
      mt + 0.4,
      -11.78,
      0,
      1,
      1.2,
      0.2,
      K.signCell(
        "ppk_expressway",
        "CENTRAL PARK EXPRESSWAY (1961 — DEFEATED)",
        400,
        60,
        { bg: "#e8e0c8", fg: "#2a1a10", font: "Georgia, serif" },
      ),
      { off: 0.0 },
    );
    K.framed(b, -8.12, 6.1, -5.6, -1, 0, 1.6, 1.0, K.photo("family", 3), {
      frame: "gold",
    });
    K.framed(b, -12, 6.1, -13.88, 0, 1, 1.0, 2.6, K.parkMapCell(), {
      frame: "gold",
    });
    K.shelf(b, -15.6, 4.4, -12.8, HP, 1.8, {
      h: 2.4,
      d: 0.4,
      mat: "mahogany",
      tint: [0.34, 0.18, 0.1],
      items: ["book"],
      seed: 131,
    });
    K.sofa(b, -13.3, 4.4, -3.7, 2.2, 0, { mat: "leather", d: 0.6 });
    K.lamp(b, -12, 7.3, -8.5, "globe", warm, 0, 0, {
      ceil: 7.8,
      dead: true,
      size: 0.16,
    });
    K.litter(b, -15.6, -13.6, -8.4, -3.4, 4.4, 8, 9104);
    K.terminal(
      ctx,
      "ppk_term_commish",
      -14.1,
      4.4 + 0.8,
      -8.5,
      PI * 0.9,
      null,
      "bare",
    );
    K.loot(ctx, "safe", -15.85, 5.6, -7.2, HP, {
      wall: true,
      locked: 0,
      lock: PK.LOCKS.commish_safe,
      tag: "commish_safe",
      items: [
        ["ppk_commish_hardhat", 1],
        ["scrip", 140],
        ["old_dollars", 4],
      ],
      name: "Commissioner's Wall Safe",
    });
    K.note(ctx, "ppk_noah_password", -12.6, 4.4 + 0.8 + 0.005, -8.9, {
      name: 'Note: "LEVIATHAN"',
      title: "Note in the Commissioner's blotter",
      type: "note",
      learn: "ppk_noah",
      text: 'Randall —\n\nArk Control will ask for the override word. It is LEVIATHAN. The Colonel wanted "EAGLE". I told him that is the name of a bird, not a password.\n\nDo NOT write this down.\n\n— S.',
    });

    // ================================================================ MAP ROOM (the Central Park diorama)
    const MRB = [-8.1, -0.3, -24.1, 8.1, 4.6, -13.9];
    K.room(b, ctx, {
      x0: -8,
      z0: -24,
      x1: 8,
      z1: -14,
      y: 0,
      h: 4.5,
      floor: "parquet",
      fc: [0.5, 0.4, 0.3],
      wall: "plaster",
      wc: PLAS,
      wain: "wood_dark",
      wainC: WOOD,
      wainH: 1.0,
      ceil: "plaster",
      cc: [0.55, 0.53, 0.48],
      cornice: true,
    });
    for (const x of [-5, 0, 5])
      dayWindow(x, 2.4, -23.9, 0, 1, 1.4, 2.6, MRB, {
        i: 0.95,
        r: 8,
        boarded: x === 5,
      });
    // the table: park map under a smashed glass case
    const tx = -1,
      tz = -19,
      TW = 2.3,
      TD = 6.1;
    b.boxMM(
      "mahogany",
      tx - TW / 2 - 0.15,
      0,
      tz - TD / 2 - 0.15,
      tx + TW / 2 + 0.15,
      0.95,
      tz + TD / 2 + 0.15,
      { tint: [0.34, 0.18, 0.1] },
    );
    b.col(
      tx - TW / 2 - 0.15,
      0,
      tz - TD / 2 - 0.15,
      tx + TW / 2 + 0.15,
      0.95,
      tz + TD / 2 + 0.15,
      { tag: "table", surface: "wood" },
    );
    b.quad(
      "pics",
      [tx - TW / 2, 0.955, tz + TD / 2],
      [tx + TW / 2, 0.955, tz + TD / 2],
      [tx + TW / 2, 0.955, tz - TD / 2],
      [tx - TW / 2, 0.955, tz - TD / 2],
      { rect: K.parkMapCell(), grime: 0, tint: [0.9, 0.88, 0.82] },
    );
    // tiny buildings along the table's edges (Fifth Avenue and Central Park West) + the castle + the Arsenal in red
    for (let k = 0; k < 14; k++) {
      const zz = tz - TD / 2 + 0.2 + (k * (TD - 0.4)) / 13;
      b.box(
        "flat",
        tx - TW / 2 - 0.08,
        0.955,
        zz,
        0.12,
        0.1 + r() * 0.35,
        0.3,
        { tint: [0.7, 0.68, 0.62] },
      );
      b.box(
        "flat",
        tx + TW / 2 + 0.08,
        0.955,
        zz,
        0.12,
        0.1 + r() * 0.35,
        0.3,
        { tint: [0.7, 0.68, 0.62] },
      );
    }
    b.box(
      "flat",
      tx + TW / 2 - 0.25,
      0.955,
      tz + TD / 2 - 0.6,
      0.14,
      0.08,
      0.1,
      { tint: [0.7, 0.2, 0.15] },
    );
    b.box("flat", tx - 0.2, 0.955, tz - 0.5, 0.08, 0.1, 0.08, {
      tint: [0.6, 0.58, 0.52],
    });
    for (let k = 0; k < 40; k++)
      b.cyl(
        "flat",
        tx + (r() - 0.5) * (TW - 0.2),
        0.955,
        tz + (r() - 0.5) * (TD - 0.2),
        0.03,
        0.0,
        0.08,
        4,
        { tint: [0.25, 0.32, 0.2] },
      );
    for (const [a, c] of [
      [
        [tx - TW / 2, tz - TD / 2],
        [tx + TW / 2, tz - TD / 2],
      ],
      [
        [tx + TW / 2, tz - TD / 2],
        [tx + TW / 2, tz + TD / 2],
      ],
      [
        [tx + TW / 2, tz + TD / 2],
        [tx - TW / 2, tz + TD / 2],
      ],
      [
        [tx - TW / 2, tz + TD / 2],
        [tx - TW / 2, tz - TD / 2],
      ],
    ]) {
      b.beam("brass", a[0], 0.95, a[1], a[0], 1.35, a[1], 0.03, 0.03);
      b.beam("brass", a[0], 1.35, a[1], c[0], 1.35, c[1], 0.03, 0.03);
    }
    b.quadN(
      "glass_clear",
      [tx - TW / 2, 1.35, tz + 1],
      [tx + TW / 2, 1.35, tz + 1],
      [tx + TW / 2, 1.35, tz - TD / 2],
      [tx - TW / 2, 1.35, tz - TD / 2],
      [0, 1, 0],
      { tint: [0.8, 0.85, 0.85] },
    );
    for (let k = 0; k < 14; k++)
      b.hplate(
        "glass",
        tx + TW / 2 + 0.3 + r() * 1.2,
        0.012 + k * 0.0006,
        tz + 1 + r() * 2.2,
        0.15 + r() * 0.3,
        0.1 + r() * 0.25,
        r() * 6,
        null,
        { tint: [0.6, 0.66, 0.64] },
      );
    b.plate(
      "art",
      tx,
      1.0,
      tz + TD / 2 + 0.16,
      0,
      1,
      1.4,
      0.2,
      K.signCell("ppk_diorama", "CENTRAL PARK · 1 : 1000", 300, 44, {
        bg: "#2a2014",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
      { off: 0.0 },
    );
    K.lamp(b, tx, 3.4, tz - 1.5, "pendant", warm, 0, 0, {
      ceil: 4.5,
      dead: true,
    });
    K.lamp(b, tx, 3.4, tz + 1.5, "pendant", warm, 0, 0, {
      ceil: 4.5,
      dead: true,
    });
    // murals and plan chests
    K.framed(b, 7.88, 2.6, -19, -1, 0, 5.8, 2.6, K.mural(5, 384, 192), {
      frame: "wood_dark",
      fw: 0.1,
    });
    K.framed(b, -7.88, 2.6, -19, 1, 0, 5.8, 2.6, K.mural(1, 384, 192), {
      frame: "wood_dark",
      fw: 0.1,
    });
    for (const z of [-16.0, -22.5]) {
      b.boxMM("wood_dark", 5.6, 0, z - 0.6, 7.6, 1.0, z + 0.6, { tint: WOOD });
      for (let k = 0; k < 4; k++)
        b.boxMM(
          "brass",
          5.58,
          0.15 + k * 0.22,
          z - 0.1,
          5.6,
          0.19 + k * 0.22,
          z + 0.1,
          { tint: [0.6, 0.5, 0.3] },
        );
      b.col(5.6, 0, z - 0.6, 7.6, 1.0, z + 0.6, {
        tag: "furniture",
        surface: "wood",
      });
    }
    const mtT = K.table(b, -5.6, 0, -15.4, 1.6, 0.8, {
      mat: "wood_dark",
      tint: WOOD,
    });
    K.chair(b, -5.6, 0, -16.1, 0, { mat: "wood_dark" });
    K.terminal(ctx, "ppk_term_parks", -5.6, mtT, -15.25, PI, null, "bare");
    K.litter(b, -7.5, -23.5, 7.5, -14.5, 0, 12, 9105);
    K.skel(ctx, 2.2, 0, -20.6, 1.9, "reaching");

    // ================================================================ ARMY DEPOT 14 (east, ground)
    const ADB = [7.9, -0.3, -24.1, 16.1, 4.3, -2.9];
    K.room(b, ctx, {
      x0: 8,
      z0: -24,
      x1: 16,
      z1: -3,
      y: 0,
      h: 4.2,
      noFloor: true,
      floor: "concrete",
      wall: "plaster_stained",
      wc: [0.62, 0.62, 0.55],
      wain: "paint_green",
      wainC: [0.3, 0.38, 0.3],
      wainH: 1.3,
      ceil: "plaster",
      cc: [0.5, 0.5, 0.46],
    });
    b.face("concrete", 8, 0, -3, 1, 0, 0, 0, 0, -1, 8, 14.2, {
      uv: "top",
      tint: [0.55, 0.54, 0.5],
    });
    b.col(8, -0.3, -17.2, 16, 0, -3, { tag: "floor", surface: "concrete" });
    b.face("concrete", 8, 0, -17.2, 1, 0, 0, 0, 0, -1, 5.9, 6.8, {
      uv: "top",
      tint: [0.55, 0.54, 0.5],
    });
    b.col(8, -0.3, -24, 13.9, 0, -17.2, { tag: "floor", surface: "concrete" });
    K.railing(b, 13.85, -23.9, 13.85, -17.3, 0, {
      mat: "steel",
      handMat: "paint_yellow",
      step: 1.1,
    });
    b.plate(
      "art",
      11.8,
      2.2,
      -23.9,
      0,
      1,
      1.8,
      0.5,
      K.signCell("ppk_ark_down", "▼ ARK LEVEL — N.O.A.H.", 320, 80, {
        bg: "#c8b040",
        fg: "#1a1a1a",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.06 },
    );
    for (const z of [-6, -11, -16])
      dayWindow(15.9, 2.1, z, -1, 0, 1.2, 2.2, ADB, { boarded: true });
    // sandbags inside the door, crates, a rifle rack, cots, the orders board
    for (let k = 0; k < 4; k++)
      b.box("fabric", 9.0, k * 0.26, -8.2 + (k % 2) * 0.2, 0.5, 0.28, 1.6, {
        tint: [0.52, 0.48, 0.36],
      });
    b.col(8.7, 0, -9.1, 9.3, 1.05, -7.3, { tag: "sandbags" });
    for (let k = 0; k < 7; k++) {
      const x = 9.2 + (k % 3) * 1.15,
        z = -21.2 - Math.floor(k / 3) * 0.2,
        y = (k >= 3 ? 0.8 : 0) + (k >= 6 ? 0.8 : 0);
      b.box(
        "wood",
        x + (k >= 3 ? 0.3 : 0),
        y,
        z + (k >= 6 ? 0.4 : 0),
        1.1,
        0.8,
        1.0,
        { yaw: (r() - 0.5) * 0.15, tint: [0.4, 0.42, 0.3] },
      );
    }
    b.col(8.6, 0, -22.4, 12.5, 1.6, -20.4, { tag: "crates", surface: "wood" });
    b.plate(
      "art",
      10.3,
      0.4,
      -20.68,
      0,
      1,
      0.8,
      0.3,
      K.signCell("ppk_crate_stencil", "U.S. ARMY · FORMULA N", 200, 60, {
        bg: null,
        fg: "#e8e0c0",
        font: "Arial Black, sans-serif",
        weather: true,
      }),
      { off: 0.02 },
    );
    b.boxMM("wood_dark", 15.4, 0, -14.2, 15.9, 2.0, -12.2, {
      tint: [0.3, 0.32, 0.22],
    });
    for (let k = 0; k < 5; k++) {
      const z = -13.9 + k * 0.38;
      b.pipe("metal_dark", 15.5, 0.3, z, 15.5, 1.7, z + 0.05, 0.03, 4, {
        tint: [0.18, 0.18, 0.17],
      });
    }
    b.col(15.3, 0, -14.2, 15.9, 2.0, -12.2, { tag: "rack" });
    for (const z of [-4.2, -5.6])
      K.bed(b, 12.2, 0, z, HP, {
        w: 0.8,
        l: 1.9,
        frame: "metal_dark",
        tint: [0.42, 0.44, 0.34],
      });
    const fdT = K.table(b, 11.0, 0, -13.0, 1.8, 0.9, {
      mat: "metal_dark",
      tint: [0.32, 0.36, 0.3],
    });
    K.chair(b, 11.0, 0, -13.7, PI, {
      mat: "metal_dark",
      tint: [0.3, 0.32, 0.28],
    });
    K.terminal(ctx, "ppk_term_army", 10.6, fdT, -12.85, PI, null, "bare");
    b.box("metal_dark", 11.7, fdT, -13.1, 0.4, 0.25, 0.3, {
      tint: [0.3, 0.34, 0.28],
    }); // field radio
    b.plate(
      "art",
      12,
      2.2,
      -3.12,
      0,
      -1,
      2.4,
      1.3,
      K.signCell(
        "ppk_orders",
        "STANDING ORDERS — DEPOT 14\n1. The Ark takes BREEDING STOCK first.\n2. Civilians are NOT breeding stock.\n3. See Order 2.",
        420,
        220,
        {
          bg: "#e0d8c0",
          fg: "#1a1a1a",
          font: "Courier New, monospace",
          border: "#1a1a1a",
        },
      ),
    );
    K.lamp(b, 11.5, 3.7, -9, "tube", tube, 0.7, 7, {
      ceil: 4.2,
      alongX: false,
      len: 1.4,
      lightOpts: { box: ADB },
    });
    K.lamp(b, 11.5, 3.7, -19, "tube", tube, 0, 0, {
      ceil: 4.2,
      alongX: false,
      len: 1.4,
      dead: true,
    });
    K.litter(b, 8.4, -23.5, 13.5, -3.4, 0, 14, 9106);
    b.hplate("decal", 11, 0.012, -17.8, 2.2, 2.2, 0.3, K.decal("blood", 17));
    K.loot(ctx, "footlocker", 12.2, 0, -6.9, -HP, {
      loot: "footlocker",
      name: "Army Footlocker",
    });
    K.loot(ctx, "ammo_box", 9.4, 1.6, -21.1, 0.2, {
      loot: "ammo_box",
      large: true,
      name: "Ammunition Crate",
    });
    K.loot(ctx, "locker", 15.6, 0, -9.4, -HP, {
      loot: "locker",
      count: 2,
      name: "Army Locker",
    });
    K.skel(ctx, 12.8, 0, -16.2, 0.8, "curled");

    // ================================================================ STAIR SHAFT (down to the Ark)
    const SSB = [13.7, BY - 0.3, -24.1, 16.1, 0.2, -16.9];
    K.room(b, ctx, {
      x0: 13.8,
      z0: -24,
      x1: 16,
      z1: -17,
      y: BY,
      h: 4.5,
      noCeil: true,
      floor: "concrete",
      wall: "concrete",
      wc: [0.55, 0.55, 0.52],
      trim: false,
      casing: false,
    });
    K.stairs(b, 13.95, -23.8, 15.85, -17.3, BY, 0, "+z", {
      mat: "concrete",
      tint: [0.6, 0.6, 0.56],
      nosing: "paint_yellow",
    });
    K.lamp(b, 14.9, -1.0, -20.5, "cage", tube, 0.6, 5, {
      ceil: -0.2,
      lightOpts: { box: SSB },
    });
    b.plate(
      "decal",
      15.9,
      BY + 2.4,
      -21,
      -1,
      0,
      2.2,
      0.8,
      K.tag("ANIMALS FIRST", "#e0d8c0", 320, 110),
      { off: 0.04 },
    );

    // ================================================================ NOAH CONTROL
    const NCB = [5.9, BY - 0.3, -36.1, 18.1, BY + 3.5, -23.9];
    K.room(b, ctx, {
      x0: 6,
      z0: -36,
      x1: 18,
      z1: -24,
      y: BY,
      h: 3.4,
      floor: "concrete",
      fc: [0.5, 0.5, 0.48],
      wall: "metal",
      wc: [0.5, 0.56, 0.52],
      wain: "paint_green",
      wainC: [0.26, 0.34, 0.3],
      wainH: 1.1,
      ceil: "metal_dark",
      cc: [0.32, 0.34, 0.32],
      trim: false,
      casing: false,
    });
    for (let x = 7.5; x < 18; x += 3)
      b.beam("steel", x, BY + 3.25, -35.9, x, BY + 3.25, -24.1, 0.2, 0.25, {
        tint: [0.4, 0.42, 0.4],
      });
    // console bank + status board on the north wall
    b.boxMM("metal_dark", 7.2, BY, -35.9, 16.8, BY + 0.95, -34.9, {
      tint: [0.3, 0.34, 0.3],
    });
    b.quadN(
      "metal_dark",
      [7.2, BY + 0.95, -34.9],
      [16.8, BY + 0.95, -34.9],
      [16.8, BY + 1.3, -35.6],
      [7.2, BY + 1.3, -35.6],
      [0, 1, 0.6],
      { tint: [0.22, 0.25, 0.22] },
    );
    b.col(7.2, BY, -35.9, 16.8, BY + 1.3, -34.9, {
      tag: "console",
      surface: "metal",
    });
    for (let k = 0; k < 40; k++) {
      const x = 7.4 + r() * 9.2,
        z = -35.0 - r() * 0.55;
      const on = r() < 0.4;
      b.box(
        on ? "lamp" : "flat",
        x,
        BY + 0.96 + (-34.9 - z) * 0.5,
        z,
        0.06,
        0.03,
        0.06,
        {
          tint: on
            ? r.pick([
                [0.3, 1, 0.4],
                [1, 0.3, 0.1],
                [1, 0.8, 0.2],
              ])
            : [0.2, 0.2, 0.2],
        },
      );
    }
    const board = K.paint(
      "pics",
      "ppk_ark_board",
      512,
      192,
      function (x, X, Y, W2, H2) {
        x.fillStyle = "#0c1410";
        x.fillRect(X, Y, W2, H2);
        x.fillStyle = "#3aff70";
        x.font = "bold 22px Courier New, monospace";
        x.textAlign = "left";
        const L = [
          "PROJECT N.O.A.H. — ARK STATUS",
          "BIOME A  TROPIC ..... BREACHED",
          "BIOME B  POLAR ...... SEALED",
          "HOLDING  NIGHT HSE .. OPEN",
          "FEEDING  AUTOMATIC .. SUSPENDED",
          "FORMULA N STOCK ..... 0000 kg",
        ];
        L.forEach((t, i) => {
          x.fillStyle =
            i === 0
              ? "#9affb0"
              : /SUSPENDED|BREACHED/.test(t)
                ? "#ff5a3a"
                : "#3aff70";
          x.fillText(t, X + 16, Y + 28 + i * 28);
        });
        for (let k = 0; k < 60; k++) {
          x.fillStyle = "rgba(0,0,0,0.35)";
          x.fillRect(X, Y + k * 3.2, W2, 1);
        }
      },
    );
    b.plate("lamp", 12, BY + 2.3, -35.88, 0, 1, 4.2, 1.6, null, {
      tint: [0.05, 0.08, 0.06],
    });
    b.plate("neon", 12, BY + 2.3, -35.86, 0, 1, 4.0, 1.5, board, {
      tint: [0.9, 0.9, 0.9],
    });
    b.light(12, BY + 2.0, -34, [0.35, 1, 0.5], 0.8, 6, { box: NCB });
    b.plate(
      "art",
      12,
      BY + 3.15,
      -35.87,
      0,
      1,
      3.0,
      0.3,
      K.signCell(
        "ppk_noah_sign",
        "N.O.A.H. — NATIONAL ORGANISM ARCHIVE HABITAT",
        640,
        64,
        { bg: "#1a2a1e", fg: "#d8e8d0", font: "Arial, sans-serif" },
      ),
      { off: 0.02 },
    );
    // the feeding terminal on its own pedestal, the generator, lockers, cots
    K.terminal(ctx, "ppk_term_noah", 12, BY, -33.6, PI, null, "own_desk");
    b.boxMM("metal_dark", 15.4, BY, -29.8, 17.8, BY + 1.7, -26.8, {
      tint: [0.34, 0.38, 0.32],
    });
    b.col(15.4, BY, -29.8, 17.8, BY + 1.7, -26.8, {
      tag: "machine",
      surface: "metal",
    });
    b.cyl("metal", 16.6, BY + 1.7, -28.3, 0.35, 0.35, 0.4, 10, {
      tint: [0.6, 0.5, 0.25],
    });
    for (let k = 0; k < 3; k++)
      b.pipe(
        "rubber",
        15.4,
        BY + 0.4 + k * 0.4,
        -27.2 - k * 0.6,
        14.2 - k * 0.5,
        BY + 0.05,
        -26.2 - k * 0.4,
        0.035,
        5,
      );
    b.plate(
      "art",
      15.38,
      BY + 1.2,
      -28.3,
      -1,
      0,
      1.4,
      0.45,
      K.signCell("ppk_gen", "ARK GENERATOR · DIESEL / BATTERY BANK", 320, 96, {
        bg: "#d8c060",
        fg: "#1a1a1a",
        font: "Arial, sans-serif",
      }),
      { off: 0.02 },
    );
    for (const z of [-25.3, -26.7])
      K.bed(b, 7.2, BY, z, HP, {
        w: 0.8,
        l: 1.9,
        frame: "metal_dark",
        tint: [0.42, 0.44, 0.34],
      });
    b.plate(
      "art",
      6.12,
      BY + 1.8,
      -32.6,
      1,
      0,
      1.2,
      0.9,
      K.signCell(
        "ppk_decon",
        "DECON BEFORE\nENTERING BIOMES\nFormula N is a\nCONTROLLED SUBSTANCE",
        220,
        170,
        {
          bg: "#e8e0c8",
          fg: "#8a1a10",
          font: "Arial, sans-serif",
          border: "#8a1a10",
        },
      ),
    );
    // the blast door, rolled aside on its track
    b.geo("metal_dark", K.unitCyl(20), {
      x: 6.6,
      y: BY + 1.45,
      z: -32.6,
      sx: 1.45,
      sy: 0.45,
      sz: 1.45,
      rz: HP,
      tint: [0.4, 0.44, 0.38],
    });
    b.geo("metal_dark", K.unitCyl(20), {
      x: 6.83,
      y: BY + 1.45,
      z: -32.6,
      sx: 1.46,
      sy: 0.02,
      sz: 1.46,
      rz: HP,
      tint: [0.36, 0.4, 0.34],
    });
    b.col(6.1, BY, -34.1, 7.1, BY + 2.9, -31.1, {
      tag: "blast_door",
      surface: "metal",
      walkable: false,
    });
    b.boxMM("paint_yellow", 6.1, BY + 2.72, -31.3, 6.3, BY + 2.9, -28.7, {
      tint: [0.8, 0.65, 0.15],
    });
    for (let k = 0; k < 6; k++)
      b.boxMM(
        k % 2 ? "paint_black" : "paint_yellow",
        6.12,
        BY + 0.01,
        -31.2 + k * 0.4,
        6.35,
        BY + 0.03,
        -30.8 + k * 0.4,
        { tint: k % 2 ? [0.1, 0.1, 0.1] : [0.8, 0.65, 0.15] },
      );
    K.lamp(b, 9.5, BY + 3.0, -30, "tube", tube, 0.7, 6, {
      ceil: BY + 3.4,
      alongX: false,
      len: 1.4,
      lightOpts: { box: NCB },
    });
    K.lamp(b, 14.5, BY + 3.0, -30, "tube", tube, 0, 0, {
      ceil: BY + 3.4,
      alongX: false,
      len: 1.4,
      dead: true,
    });
    b.box("lamp", 6.2, BY + 2.4, -28.3, 0.06, 0.12, 0.3, { tint: red });
    b.light(7, BY + 2.4, -28.3, red, 0.6, 4, { box: NCB });
    b.glow(6.25, BY + 2.45, -28.3, [0.8, 0.1, 0.05], 0.8);
    K.litter(b, 7, -35, 17, -24.5, BY, 12, 9107);
    K.loot(ctx, "locker", 9.2, BY, -24.4, PI, {
      loot: "locker",
      count: 3,
      name: "Ark Staff Lockers",
    });
    K.loot(ctx, "first_aid", 17.85, BY + 1.3, -33.4, -HP, {
      loot: "first_aid",
      name: "Ark First Aid",
    });
    K.skel(ctx, 12.8, BY, -34.0, 0.3, "seated");
    K.note(ctx, "ppk_reel_okonkwo", 13.0, BY + 0.97, -35.2, {
      name: "Tape reel: Lt. Nwosu",
      title: "Lt. Nwosu — last log",
      type: "tape",
      text: "[Tape reel. A woman's voice, very tired.]\n\nDepot 14, Lieutenant Adaeze Nwosu. March fifth.\n\nThe zoo staff came down the stairs with their families at 9:52. I had my orders. The Ark takes breeding stock. The Ark does not take zookeepers. I opened the Night House for the leopard and the penguins and the — the bear. Gus. I closed the blast door on forty-one people.\n\nThe Colonel's Formula N is in every feeder. It's supposed to help them \"adapt.\" Stan says the bear hasn't slept in three days. He just watches the door.\n\nI'm going to sit here a while. If anyone hears this: the feeders run on the Ark generator. Turn them back on. Please. They'll be so hungry.",
    });

    // ================================================================ SERVICE TUNNEL
    const STB = [-30.1, BY - 0.3, -31.6, 6.1, BY + 3.3, -28.4];
    K.room(b, ctx, {
      x0: -30,
      z0: -31.5,
      x1: 6,
      z1: -28.5,
      y: BY,
      h: 3.2,
      open: { e: true, w: true },
      floor: "concrete",
      fc: [0.46, 0.46, 0.44],
      wall: "concrete",
      wc: [0.5, 0.5, 0.48],
      ceil: "concrete_dark",
      cc: [0.35, 0.35, 0.34],
      trim: false,
      casing: false,
    });
    b.beam("steel", -29.8, BY + 3.0, -30, 5.8, BY + 3.0, -30, 0.12, 0.12, {
      tint: [0.4, 0.4, 0.38],
    }); // trolley rail
    for (let x = -26; x < 5; x += 4.5) {
      b.pipe("steel", x, BY + 2.95, -30, x, BY + 2.2, -30, 0.012, 3);
      b.geo("steel", new THREE.TorusGeometry(0.1, 0.012, 3, 8), {
        x,
        y: BY + 2.12,
        z: -30,
        tint: [0.45, 0.42, 0.4],
      });
    } // meat hooks
    for (const z of [-31.3, -28.7])
      b.pipe("rust", -29.8, BY + 2.7, z, 5.8, BY + 2.7, z, 0.08, 6, {
        tint: [0.5, 0.4, 0.3],
      });
    const trolley = (x) => {
      b.boxMM("steel", x - 0.6, BY + 0.3, -30.5, x + 0.6, BY + 0.9, -29.5, {
        tint: [0.5, 0.52, 0.5],
      });
      for (const e of [-0.45, 0.45])
        b.cyl("rubber", x + e, BY, -29.6, 0.12, 0.12, 0.3, 8);
      b.col(x - 0.6, BY, -30.5, x + 0.6, BY + 0.9, -29.5, {
        tag: "cart",
        walkable: false,
      });
    };
    trolley(-4.5);
    b.plate(
      "art",
      -2,
      BY + 2.2,
      -31.38,
      0,
      1,
      2.2,
      0.4,
      K.signCell("ppk_tun_sign1", "◄ NIGHT HOUSE · BIOMES", 400, 72, {
        bg: "#1a2a1e",
        fg: "#e8e0c8",
        font: "Arial, sans-serif",
      }),
      { off: 0.03 },
    );
    b.plate(
      "art",
      -26,
      BY + 2.2,
      -28.62,
      0,
      -1,
      2.2,
      0.4,
      K.signCell("ppk_tun_sign2", "BIOME A — TROPIC ►", 400, 72, {
        bg: "#1a2a1e",
        fg: "#e8e0c8",
        font: "Arial, sans-serif",
      }),
      { off: 0.03 },
    );
    for (const x of [-24, -14, -4])
      K.lamp(b, x, BY + 2.8, -30, "cage", tube, x === -14 ? 0 : 0.55, 5, {
        ceil: BY + 3.2,
        dead: x === -14,
        lightOpts: { box: STB },
      });
    for (let k = 0; k < 8; k++)
      b.hplate(
        "decal",
        -28 + r() * 32,
        BY + 0.012 + k * 0.001,
        -31 + r() * 2,
        1.0,
        1.0,
        r() * 6,
        K.decal(k % 3 ? "grime" : "blood", 30 + k),
      );
    K.litter(b, -29, -31.2, 5, -28.8, BY, 12, 9108);

    // ================================================================ NIGHT HOUSE (holding cages)
    const NHB = [-18.1, BY - 0.3, -44.1, -3.9, BY + 3.5, -31.4];
    K.room(b, ctx, {
      x0: -18,
      z0: -44,
      x1: -4,
      z1: -31.5,
      y: BY,
      h: 3.4,
      floor: "concrete",
      fc: [0.44, 0.42, 0.38],
      wall: "celltile",
      wc: [0.6, 0.66, 0.58],
      ceil: "concrete_dark",
      cc: [0.34, 0.34, 0.32],
      trim: false,
      casing: false,
    });
    const cages = [
      ["P-7", "SNOW LEOPARD"],
      ["M-2", "RED PANDA"],
      ["R-3", "NAKED BURROW RATS COLONY"],
      ["A-9", "GILA MONSTER"],
      ["B-1", "BLACK BEAR (TRANSFER)"],
      ["S-4", "SEA LION PUP"],
    ];
    for (let k = 0; k < 6; k++) {
      const west = k < 3,
        i = k % 3;
      const z0 = -43.8 + i * 4.0,
        z1 = z0 + 3.8;
      const xf = west ? -13 : -9,
        xb = west ? -18 : -4;
      // partition walls between cages
      if (i > 0)
        K.segWall(b, xb, z0, xf, z0, BY, BY + 3.4, west ? 1 : -1, {
          mat: "celltile",
          tint: [0.58, 0.64, 0.56],
          both: true,
          trim: false,
          off: 0.08,
        });
      const open = k === 2 || k === 4;
      K.bars(b, xf, z0 + 0.05, xf, z1 - 0.05, BY, 3.1, {
        gap: open ? { t: 1.9, w: 1.3 } : undefined,
        bent: k === 1 ? [0.9, 1.05] : [],
      });
      if (open)
        b.box(
          "black_iron",
          xf + (west ? 0.5 : -0.5),
          BY,
          z0 + 1.2,
          0.05,
          2.6,
          1.3,
          { yaw: west ? 0.7 : -0.7, tint: [0.2, 0.19, 0.18] },
        );
      // straw, bowls, gnawed bones
      b.hplate(
        "decal",
        (xf + xb) / 2,
        BY + 0.012,
        (z0 + z1) / 2,
        3.4,
        3.0,
        r() * 3,
        K.decal("grime", 50 + k),
        { tint: [0.9, 0.8, 0.45] },
      );
      for (let j = 0; j < 12; j++)
        b.box(
          "wood_rotten",
          xb + (xf - xb) * (0.15 + r() * 0.7),
          BY + 0.01,
          z0 + 0.3 + r() * 3.2,
          0.4 + r() * 0.3,
          0.03,
          0.03,
          { yaw: r() * 3, tint: [0.75, 0.62, 0.35] },
        );
      b.cyl(
        "steel",
        xf + (west ? -0.5 : 0.5),
        BY,
        z0 + 0.5,
        0.18,
        0.15,
        0.1,
        10,
        { tint: [0.55, 0.55, 0.52] },
      );
      b.plate(
        "art",
        xf + (west ? 0.02 : -0.02),
        BY + 3.2,
        (z0 + z1) / 2,
        west ? 1 : -1,
        0,
        1.6,
        0.22,
        K.signCell(
          "ppk_cage_" + k,
          cages[k][0] + " · " + cages[k][1],
          360,
          48,
          { bg: "#e8e0c8", fg: "#1a1a1a", font: "Arial, sans-serif" },
        ),
        { off: 0.04 },
      );
      if (k === 2) {
        for (let j = 0; j < 5; j++)
          b.hplate(
            "decal",
            xb + 1 + r() * 3,
            BY + 0.014 + j * 0.001,
            z0 + 0.6 + r() * 2.6,
            1.0,
            0.8,
            r() * 6,
            K.decal("scorch", 60 + j),
            { tint: [0.3, 0.25, 0.2] },
          );
        K.rubble(b, xb + 1.2, BY, z0 + 2.6, 0.9, 0.5, { seed: 71, col: true });
      }
      if (k === 4) {
        b.plate(
          "decal",
          xb + (west ? 0.12 : -0.12),
          BY + 1.4,
          (z0 + z1) / 2,
          west ? 1 : -1,
          0,
          1.8,
          1.2,
          K.decal("blood", 70),
          { off: 0.03 },
        );
      }
    }
    // keeper's station at the north end of the aisle
    const ksT = K.table(b, -11, BY, -42.6, 2.2, 0.8, {
      mat: "metal",
      tint: [0.45, 0.48, 0.44],
    });
    b.box("flat", -11.4, ksT, -42.6, 0.3, 0.02, 0.4, {
      yaw: 0.2,
      tint: [0.82, 0.8, 0.7],
    });
    b.cyl("glass", -10.3, ksT, -42.5, 0.04, 0.05, 0.16, 6, {
      tint: [0.4, 0.3, 0.2],
    });
    K.loot(ctx, "locker", -12.8, BY, -43.6, 0, {
      loot: "locker",
      items: [
        ["ppk_zookeeper_cap", 1],
        ["rally_tonic", 1],
        ["scrap_metal", 3],
      ],
      name: "Head Keeper's Locker",
    });
    b.plate(
      "art",
      -11,
      BY + 2.3,
      -43.88,
      0,
      1,
      2.8,
      0.45,
      K.signCell("ppk_nighthouse", "NIGHT HOUSE — HOLDING", 480, 76, {
        bg: "#1a2a1e",
        fg: "#e8e0c8",
        font: "Arial, sans-serif",
      }),
      { off: 0.02 },
    );
    for (const z of [-34, -38, -42])
      K.lamp(b, -11, BY + 2.9, z, "tube", tube, z === -38 ? 0 : 0.5, 5, {
        ceil: BY + 3.4,
        alongX: false,
        len: 1.2,
        dead: z === -38,
        lightOpts: { box: NHB },
      });
    K.skel(ctx, -10.2, BY, -36.5, 2.2, "lying");
    K.litter(b, -12.8, -43.5, -9.2, -32, BY, 10, 9109);

    // ================================================================ BIOME A — TROPIC
    const TBB = [-46.1, BY - 0.3, -40.1, -29.9, BY + 9.1, -19.9];
    K.room(b, ctx, {
      x0: -46,
      z0: -40,
      x1: -30,
      z1: -20,
      y: BY,
      h: 9,
      floor: "dirt",
      fc: [0.46, 0.38, 0.28],
      wall: "concrete",
      wc: [0.42, 0.44, 0.38],
      ceil: "metal_dark",
      cc: [0.2, 0.22, 0.2],
      trim: false,
      casing: false,
      surface: "dirt",
    });
    // painted jungle backdrop on the walls (faded mural), rock cliff + dry waterfall (west)
    for (const [x, z, nx, nz, w] of [
      [-45.88, -30, 1, 0, 19],
      [-38, -20.12, 0, -1, 15],
    ]) {
      const cell = K.paint(
        "pics",
        "ppk_jungle_" + x,
        512,
        256,
        function (x2, X, Y, W2, H2) {
          const g = x2.createLinearGradient(0, Y, 0, Y + H2);
          g.addColorStop(0, "#4a6a5a");
          g.addColorStop(1, "#1e2a1a");
          x2.fillStyle = g;
          x2.fillRect(X, Y, W2, H2);
          const rr = K.rng("jg" + x);
          for (let k = 0; k < 60; k++) {
            x2.fillStyle = rr.pick([
              "#2a4a2a",
              "#3a5a2a",
              "#1e3a22",
              "#4a6a3a",
            ]);
            x2.beginPath();
            x2.ellipse(
              X + rr() * W2,
              Y + H2 * (0.3 + rr() * 0.7),
              10 + rr() * 40,
              6 + rr() * 20,
              rr() * 3,
              0,
              PI * 2,
            );
            x2.fill();
          }
          for (let k = 0; k < 10; k++) {
            x2.fillStyle = "#2a2014";
            x2.fillRect(X + rr() * W2, Y + H2 * 0.2, 4 + rr() * 6, H2 * 0.8);
          }
          x2.fillStyle = "rgba(40,30,20,0.55)";
          x2.fillRect(X, Y, W2, H2);
          K.stains(x2, X, Y, W2, H2, 20, 3, 0.6, [30, 25, 15]);
          K.streaks(x2, X, Y, W2, H2, 30, 4, 0.4);
        },
      );
      b.plate("pics", x, BY + 4.5, z, nx, nz, w, 7.5, cell, {
        off: 0.02,
        tint: [0.6, 0.6, 0.55],
      });
    }
    for (const [dx, dz, s] of [
      [0, -26, 3.2],
      [0, -31, 3.6],
      [0.4, -36, 3.0],
      [2.4, -28.5, 2.2],
      [2.2, -34, 2.0],
    ])
      K.rock(b, -45.6 + dx, BY, dz, s * 0.8, s * 1.4, s, {
        seed: 20 + (dz | 0),
        tint: [0.5, 0.44, 0.36],
        walk: false,
      });
    b.col(-46, BY, -37.8, -42.6, BY + 4.2, -24.4, {
      tag: "rock",
      walkable: false,
    });
    b.boxMM("concrete", -42.6, BY, -34, -38.4, BY + 0.5, -27.6, {
      tint: [0.42, 0.44, 0.4],
      faces: "nsewt",
    }); // dry plunge basin rim
    b.boxMM("dirt", -42.2, BY + 0.05, -33.6, -38.8, BY + 0.2, -28.0, {
      tint: [0.3, 0.26, 0.2],
    });
    b.col(-42.6, BY, -34, -38.4, BY + 0.5, -27.6, {
      tag: "basin",
      surface: "concrete",
    });
    // dead jungle: big dead trees + palms + fallen trunk
    for (const [x, z, h] of [
      [-35, -24, 6.5],
      [-33, -35, 7.2],
      [-40, -37.5, 5.2],
      [-36.5, -30.5, 5.8],
    ])
      K.deadTree(b, x, BY, z, h, (x * 7 + z) | 0);
    b.pipe(
      "wood_rotten",
      -33.5,
      BY + 0.4,
      -22.4,
      -30.8,
      BY + 0.3,
      -25.5,
      0.35,
      7,
      { tint: [0.35, 0.28, 0.2] },
    );
    b.col(-33.6, BY, -25.6, -30.6, BY + 0.7, -22.2, {
      tag: "log",
      surface: "wood",
    });
    // boardwalk through the biome (raised, railed)
    const bw = [
      [-30.4, -30],
      [-35, -30],
      [-36, -26],
      [-40, -24],
      [-43.5, -22.2],
    ];
    for (let i = 0; i < bw.length - 1; i++) {
      const [ax, az] = bw[i],
        [cx, cz] = bw[i + 1];
      const len = Math.hypot(cx - ax, cz - az),
        yaw = Math.atan2(-(cz - az), cx - ax);
      b.box("wood", (ax + cx) / 2, BY, (az + cz) / 2, len + 0.6, 0.3, 1.6, {
        yaw,
        tint: [0.45, 0.36, 0.26],
      });
      b.ocol((ax + cx) / 2, (az + cz) / 2, len + 0.6, 1.6, BY, BY + 0.3, yaw, {
        tag: "boardwalk",
        surface: "wood",
      });
    }
    // grow-lamp gantries (mostly dead; two still pulse violet)
    for (const z of [-24, -30, -36]) {
      b.beam("steel", -45.8, BY + 7.2, z, -30.2, BY + 7.2, z, 0.18, 0.25, {
        tint: [0.35, 0.36, 0.34],
      });
      for (const x of [-42, -38, -34]) {
        const on =
          (z === -30 && x !== -42) ||
          (z === -36 && x === -34) ||
          (z === -24 && x === -38);
        b.box("metal_dark", x, BY + 6.95, z, 1.6, 0.12, 0.5, {
          tint: [0.3, 0.3, 0.3],
        });
        b.box(on ? "lamp" : "glass", x, BY + 6.9, z, 1.4, 0.05, 0.35, {
          tint: on ? uv : [0.3, 0.28, 0.32],
        });
        if (on) {
          b.light(x, BY + 6.2, z, uv, 1.5, 11, { box: TBB, wrap: 0.55 });
          b.glow(x, BY + 6.85, z, [0.6, 0.3, 0.8], 2.6);
        }
      }
    }
    b.light(-31.5, BY + 2.5, -30, [1, 0.75, 0.5], 0.45, 6, { box: TBB });
    // denser dead jungle: leaning palms, strangler vines hanging off the gantries, dry fern and elephant-ear clumps
    const palmI = (x, z, h, lean) => {
      let px = x,
        py = BY + 0.02,
        pz = z;
      for (let k = 0; k < 8; k++) {
        const qx = px + lean[0] * (0.08 + k * 0.03),
          qy = py + h / 8,
          qz = pz + lean[1] * (0.08 + k * 0.03);
        b.pipe("wood_rotten", px, py, pz, qx, qy, qz, 0.19 - k * 0.012, 7, {
          tint: [0.42, 0.36, 0.28],
        });
        px = qx;
        py = qy;
        pz = qz;
      }
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * PI * 2 + r() * 0.3,
          len = 1.6 + r() * 1.1;
        const ex = px + Math.cos(a) * len,
          ez = pz - Math.sin(a) * len,
          ey = py - 0.5 - r() * 1.7;
        const mx = px + Math.cos(a) * len * 0.5,
          mz = pz - Math.sin(a) * len * 0.5,
          my = py + 0.25;
        const wx = Math.sin(a) * 0.28,
          wz = Math.cos(a) * 0.28;
        b.quadN(
          "wood_rotten",
          [px, py, pz],
          [mx + wx, my, mz + wz],
          [ex, ey, ez],
          [mx - wx, my, mz - wz],
          [0, 1, 0],
          { tint: [0.44, 0.36, 0.2] },
        );
        b.quadN(
          "wood_rotten",
          [px, py - 0.02, pz],
          [mx - wx, my - 0.02, mz - wz],
          [ex, ey - 0.02, ez],
          [mx + wx, my - 0.02, mz + wz],
          [0, -1, 0],
          { tint: [0.34, 0.28, 0.16] },
        );
      }
      b.col(x - 0.25, BY, z - 0.25, x + 0.25, BY + h * 0.6, z + 0.25, {
        tag: "tree",
        walkable: false,
        surface: "wood",
      });
    };
    for (const [x, z, h, lx, lz] of [
      [-32, -21.8, 6.2, -1, 0.2],
      [-44.2, -39, 5.4, 1, 0.6],
      [-38.2, -21.2, 7.0, 0.3, -1],
      [-31.2, -38.6, 5.8, -0.6, 0.8],
      [-42, -26, 4.6, 0.8, 0.2],
    ])
      palmI(x, z, h, [lx, lz]);
    for (const gz of [-24, -30, -36]) {
      for (let k = 0; k < 9; k++) {
        const x = -45 + k * 1.7 + r() * 0.6,
          len = 1.6 + r() * 3.4;
        if (x > -31) continue;
        let px = x,
          py = BY + 7.1,
          pz = gz + (r() - 0.5) * 0.2;
        for (let j = 0; j < 3; j++) {
          const qx = px + (r() - 0.5) * 0.3,
            qy = py - len / 3,
            qz = pz + (r() - 0.5) * 0.3;
          b.pipe("wood_rotten", px, py, pz, qx, qy, qz, 0.025 - j * 0.005, 3, {
            tint: [0.3, 0.3, 0.2],
          });
          px = qx;
          py = qy;
          pz = qz;
        }
        if (r() < 0.5)
          b.geo("wood_rotten", K.sphereGeo(), {
            x: px,
            y: py,
            z: pz,
            sx: 0.12,
            sy: 0.22,
            sz: 0.1,
            tint: [0.34, 0.32, 0.2],
          });
      }
    }
    for (let k = 0; k < 22; k++) {
      const x = -45 + r() * 14.5,
        z = -39.4 + r() * 18.8;
      if (x > -42.6 && x < -38.4 && z > -34 && z < -27.6) continue; // the basin
      if (Math.abs(z - -30) < 1.2 && x > -36) continue; // keep the boardwalk clear
      const n = 5 + ((r() * 4) | 0),
        hh = 0.5 + r() * 0.9;
      for (let j = 0; j < n; j++) {
        const a = (j / n) * PI * 2 + r(),
          ex = x + Math.cos(a) * hh * 0.8,
          ez = z - Math.sin(a) * hh * 0.8;
        b.quadN(
          "wood_rotten",
          [x, BY + 0.02, z],
          [x + Math.sin(a) * 0.1, BY + 0.02, z + Math.cos(a) * 0.1],
          [ex, BY + hh * (0.6 + r() * 0.4), ez],
          [ex - Math.sin(a) * 0.14, BY + hh * 0.7, ez - Math.cos(a) * 0.14],
          [0, 1, 0],
          {
            tint: r.pick([
              [0.42, 0.38, 0.2],
              [0.36, 0.34, 0.18],
              [0.48, 0.4, 0.24],
            ]),
          },
        );
      }
    }
    // the greenhouse haze: a humid green-gold fill under the dead canopy (the biome's 'sun' is a failing sodium bank)
    b.light(-38, BY + 8.4, -30, [0.62, 0.72, 0.38], 0.6, 16, {
      box: TBB,
      wrap: 0.7,
    });
    for (const [x, z] of [
      [-44.6, -22],
      [-44.6, -38.5],
    ]) {
      b.box("metal_dark", x, BY + 5.2, z, 0.3, 0.4, 0.5, {
        tint: [0.3, 0.3, 0.3],
      });
      b.box("lamp", x + 0.16, BY + 5.2, z, 0.02, 0.3, 0.4, {
        tint: [1, 0.72, 0.3],
      });
      b.light(x + 1.5, BY + 4.2, z, [1, 0.7, 0.35], 0.75, 9, { box: TBB });
      b.glow(x + 0.2, BY + 5.2, z, [1, 0.62, 0.28], 1.4);
    }
    // the stinger nest: egg clutches, husks, burrows
    for (let k = 0; k < 3; k++) {
      const cx = -41.5 + k * 3.2,
        cz = -38.2 + (k % 2) * 0.6;
      b.hplate(
        "decal",
        cx,
        BY + 0.015,
        cz,
        2.6,
        2.2,
        r() * 3,
        K.decal("roach", k),
        { tint: [0.8, 0.75, 0.5] },
      );
      for (let j = 0; j < 9; j++)
        b.geo("flat", K.sphereGeo(), {
          x: cx + (r() - 0.5) * 1.3,
          y: BY + 0.12,
          z: cz + (r() - 0.5) * 1.0,
          sx: 0.12,
          sy: 0.16,
          sz: 0.12,
          tint: [0.78, 0.74, 0.55],
        });
    }
    for (let k = 0; k < 4; k++)
      b.hplate(
        "decal",
        -44 + r() * 12,
        BY + 0.016,
        -38 + r() * 16,
        1.2,
        1.2,
        r() * 6,
        K.decal("scorch", 80 + k),
        { tint: [0.15, 0.12, 0.1] },
      );
    b.plate(
      "art",
      -30.2,
      BY + 3.4,
      -26.5,
      -1,
      0,
      2.6,
      0.5,
      K.signCell("ppk_biome_a", "BIOME A · TROPIC · 28°C · 90% RH", 480, 80, {
        bg: "#1a2a1e",
        fg: "#e8e0c8",
        font: "Arial, sans-serif",
      }),
      { off: 0.03 },
    );
    K.skel(ctx, -34.2, BY, -38.6, 0.5, "lying");
    K.loot(ctx, "duffle_bag", -33.8, BY, -38.9, 0.8, {
      loot: "duffle_bag",
      name: "Keeper's Duffle",
    });

    // ================================================================ POLAR PASSAGE + BIOME B — POLAR (the grotto)
    const PTB = [-40.1, BY - 0.3, -44.1, -36.9, BY + 3.1, -39.9];
    K.room(b, ctx, {
      x0: -40,
      z0: -44,
      x1: -37,
      z1: -40,
      y: BY,
      h: 3.0,
      floor: "concrete",
      wall: "concrete",
      wc: [0.46, 0.5, 0.52],
      ceil: "concrete_dark",
      cc: [0.3, 0.32, 0.34],
      trim: false,
      casing: false,
    });
    K.lamp(b, -38.5, BY + 2.6, -42, "cage", ice, 0.5, 4, {
      ceil: BY + 3,
      lightOpts: { box: PTB },
    });
    b.plate(
      "art",
      -38.5,
      BY + 2.5,
      -40.12,
      0,
      -1,
      2.2,
      0.4,
      K.signCell("ppk_biome_b", "BIOME B · POLAR · −4°C", 400, 72, {
        bg: "#1a2a3a",
        fg: "#e8f0f8",
        font: "Arial, sans-serif",
      }),
      { off: 0.03 },
    );
    b.plate(
      "decal",
      -37.12,
      BY + 1.4,
      -42,
      -1,
      0,
      1.6,
      1.4,
      K.decal("blood", 91),
      { off: 0.03 },
    );
    const PGB = [-48.1, BY - 0.3, -66.1, -23.9, BY + 10.1, -43.9];
    K.room(b, ctx, {
      x0: -48,
      z0: -66,
      x1: -24,
      z1: -44,
      y: BY,
      h: 10,
      floor: "concrete",
      fc: [0.62, 0.66, 0.7],
      wall: "concrete",
      wc: [0.55, 0.62, 0.68],
      ceil: "concrete_dark",
      cc: [0.2, 0.22, 0.26],
      trim: false,
      casing: false,
    });
    const iceT = [0.78, 0.84, 0.9];
    // ice-cliff rockwork around the walls (a ring of boulders stacked in two tiers)
    const cliffs = [];
    for (let k = 0; k < 11; k++) cliffs.push([-47 + k * 2.2, -64.6]); // north
    for (let k = 0; k < 7; k++) cliffs.push([-46.8, -62 + k * 2.4]); // west (leave the catwalk corner clear)
    for (let k = 0; k < 7; k++) cliffs.push([-25.2, -62.5 + k * 2.6]); // east
    cliffs.forEach(([x, z], i) => {
      if (x < -44 && z > -53.5) return; // keep the catwalk stair's foot clear
      if (x > -27 && z > -55.5 && z < -48.5) return; // keep the underwater viewing window clear
      K.rock(b, x, BY, z, 2.2 + r() * 0.8, 3.4 + r() * 2.0, 2.0 + r() * 0.6, {
        seed: 30 + i,
        tint: iceT.map((v) => v * (0.85 + r() * 0.15)),
        col: false,
      });
      if (r() < 0.6)
        K.rock(b, x + (r() - 0.5), BY + 3.4, z + (r() - 0.5), 1.6, 2.4, 1.5, {
          seed: 40 + i,
          tint: iceT,
          col: false,
        });
    });
    b.col(-48, BY, -66, -24, BY + 5.5, -63.2, { tag: "rock", walkable: false });
    b.col(-48, BY, -63.2, -45.4, BY + 5.5, -53.2, {
      tag: "rock",
      walkable: false,
    });
    b.col(-26.6, BY, -63.2, -24, BY + 5.5, -55.5, {
      tag: "rock",
      walkable: false,
    });
    b.col(-26.6, BY, -48.5, -24, BY + 5.5, -46, {
      tag: "rock",
      walkable: false,
    });
    // the pool: black water inside an ice-rock rim (with the underwater viewing window on the east wall)
    const plx = -35,
      plz = -55.5;
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * PI * 2;
      K.rock(
        b,
        plx + Math.cos(a) * 5.2,
        BY,
        plz - Math.sin(a) * 3.8,
        1.2,
        0.9,
        1.0,
        { seed: 50 + k, tint: iceT, col: false },
      );
    }
    b.geo("glass", new THREE.CircleGeometry(1, 24), {
      x: plx,
      y: BY + 0.36,
      z: plz,
      rx: -HP,
      sx: 4.8,
      sy: 3.5,
      tint: [0.04, 0.07, 0.09],
    });
    b.col(plx - 4.4, BY, plz - 3.2, plx + 4.4, BY + 0.8, plz + 3.2, {
      tag: "pool",
      walkable: false,
    });
    b.plate("glass", -24.12, BY + 1.3, -52, -1, 0, 4.0, 1.6, null, {
      tint: [0.1, 0.2, 0.26],
      off: 0.02,
    });
    b.boxMM("concrete", -24.35, BY + 0.4, -54.2, -24.1, BY + 2.2, -49.8, {
      tint: [0.4, 0.44, 0.48],
      faces: "w",
    });
    // Gus's den: a hollow in the north cliff, bones and a nest of torn things
    for (let k = 0; k < 30; k++) {
      const a = r() * PI * 2,
        dd = r() * 2.6;
      b.pipe(
        "bone",
        -36 + Math.cos(a) * dd,
        BY + 0.05,
        -60.4 + Math.sin(a) * dd * 0.6,
        -36 + Math.cos(a) * dd + (r() - 0.5) * 0.6,
        BY + 0.05 + r() * 0.1,
        -60.4 + Math.sin(a) * dd * 0.6 + (r() - 0.5) * 0.6,
        0.025 + r() * 0.02,
        4,
        { tint: [0.84, 0.8, 0.68] },
      );
    }
    for (let k = 0; k < 5; k++)
      b.geo("bone", K.sphereGeo(), {
        x: -37.5 + r() * 3,
        y: BY + 0.1,
        z: -61.5 + r() * 2,
        sx: 0.12,
        sy: 0.1,
        sz: 0.14,
        tint: [0.85, 0.82, 0.7],
      });
    b.hplate(
      "decal",
      -36,
      BY + 0.012,
      -60.4,
      5,
      3.4,
      0.2,
      K.decal("blood", 93),
      { tint: [0.7, 0.6, 0.55] },
    );
    for (let k = 0; k < 6; k++)
      b.box(
        "fabric",
        -37.5 + r() * 3,
        BY + 0.02,
        -61.2 + r() * 1.6,
        0.9,
        0.08,
        0.6,
        {
          yaw: r() * 3,
          tint: r.pick([
            [0.5, 0.4, 0.3],
            [0.3, 0.35, 0.4],
            [0.6, 0.55, 0.45],
          ]),
        },
      );
    // the feeding chute: a steel hopper from the ceiling ending over a trough
    b.cyl("metal_dark", -29.0, BY + 5.2, -60.2, 0.5, 1.1, 1.4, 10, {
      tint: [0.4, 0.42, 0.44],
    });
    b.pipe(
      "metal_dark",
      -29.0,
      BY + 6.6,
      -60.2,
      -29.0,
      BY + 10,
      -60.2,
      0.35,
      8,
      { tint: [0.4, 0.42, 0.44] },
    );
    b.boxMM("steel", -30.1, BY, -60.8, -27.9, BY + 0.5, -59.6, {
      tint: [0.5, 0.52, 0.52],
    });
    b.col(-30.1, BY, -60.8, -27.9, BY + 0.5, -59.6, {
      tag: "trough",
      surface: "metal",
    });
    ctx.feederPos = K.world(ctx, -29.0, BY + 0.6, -60.2);
    b.plate(
      "art",
      -29.0,
      BY + 0.9,
      -59.58,
      0,
      1,
      0.9,
      0.3,
      K.signCell("ppk_feeder", "AUTO-FEEDER B-1", 200, 60, {
        bg: "#c8b040",
        fg: "#1a1a1a",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.02 },
    );
    // the keeper's catwalk (west, up to the service door) + observation booth (east wall, high)
    K.stairs(b, -47.8, -50.4, -46.2, -46.3, BY, -1.3, "+z", {
      mat: "steel",
      tint: [0.42, 0.44, 0.44],
      solid: false,
      rail: "l",
      railMat: "steel",
      handMat: "paint_yellow",
      surface: "metal",
    });
    b.boxMM("steel", -48, -1.6, -46.3, -44, -1.3, -44.1, {
      tint: [0.42, 0.44, 0.44],
      faces: "nsewtb",
    });
    b.col(-48, -1.6, -46.3, -44, -1.3, -44.1, {
      tag: "catwalk",
      surface: "metal",
    });
    for (const x of [-47.8, -44.2])
      b.pipe("steel", x, BY, -46.1, x, -1.6, -46.1, 0.05, 6, {
        tint: [0.42, 0.44, 0.44],
      });
    K.railing(b, -44.05, -46.3, -44.05, -44.2, -1.3, {
      mat: "steel",
      handMat: "paint_yellow",
      step: 0.5,
    });
    K.railing(b, -46.1, -46.3, -44.05, -46.3, -1.3, {
      mat: "steel",
      handMat: "paint_yellow",
      step: 0.5,
    });
    b.boxMM("metal_dark", -46.6, -1.3, -44.14, -45.4, 0.9, -44.08, {
      tint: [0.34, 0.38, 0.34],
    }); // the service door
    b.plate(
      "art",
      -46,
      1.25,
      -44.1,
      0,
      -1,
      1.3,
      0.3,
      K.signCell("ppk_svc_exit", "SERVICE EXIT — POLAR CIRCLE", 320, 72, {
        bg: "#b82818",
        fg: "#f0e8d8",
        font: "Arial, sans-serif",
      }),
      { off: 0.02 },
    );
    b.boxMM("concrete", -24.1, BY + 5.2, -60, -24.0, BY + 7.6, -52, {
      tint: [0.35, 0.38, 0.4],
      faces: "w",
    });
    b.plate("lamp", -24.12, BY + 6.4, -56, -1, 0, 7.4, 1.8, null, {
      tint: [0.05, 0.07, 0.08],
      off: 0.02,
    });
    b.plate("glass", -24.12, BY + 6.4, -56, -1, 0, 7.4, 1.8, null, {
      tint: [0.3, 0.36, 0.4],
      off: 0.05,
    });
    // cold light: failing fluorescent strips high up + the red alarm strobe over the passage
    for (const [x, z, on] of [
      [-40, -50, 1],
      [-30, -50, 1],
      [-40, -60, 0],
      [-30, -61, 1],
      [-35, -55, 0],
    ])
      K.lamp(b, x, BY + 8.6, z, "tube", ice, on ? 1.0 : 0, 11, {
        ceil: BY + 10,
        alongX: true,
        len: 2.0,
        dead: !on,
        lightOpts: { box: PGB },
      });
    b.light(-35, BY + 1.5, -50, ice, 0.5, 9, { box: PGB });
    // the habitat's artificial 'arctic sky': a cold wash from the ceiling floods so the cliffs read from the catwalk
    b.light(-36, BY + 8.2, -56, ice, 0.85, 17, { box: PGB, wrap: 0.6 });
    b.light(-29, BY + 5.5, -49, ice, 0.55, 11, { box: PGB });
    for (const [x, z] of [
      [-36, -56],
      [-42, -50],
    ]) {
      b.boxMM(
        "metal_dark",
        x - 0.7,
        BY + 9.7,
        z - 0.4,
        x + 0.7,
        BY + 10,
        z + 0.4,
        { tint: [0.3, 0.32, 0.34] },
      );
      b.boxMM("lamp", x - 0.6, BY + 9.6, z - 0.3, x + 0.6, BY + 9.7, z + 0.3, {
        tint: [0.7, 0.85, 1.0],
        faces: "nsewtb",
      });
      b.glow(x, BY + 9.5, z, [0.6, 0.8, 1.0], 2.4);
    }
    // a caged work lamp over the keeper's catwalk (the way back out)
    b.pipe("metal_dark", -46, BY + 10, -44.6, -46, BY + 6.3, -44.6, 0.02, 4);
    b.cyl("glass", -46, BY + 6.1, -44.6, 0.1, 0.12, 0.22, 6, {
      tint: [1, 0.85, 0.6],
    });
    b.glow(-46, BY + 6.1, -44.6, [1, 0.8, 0.5], 1.4);
    b.light(-46, BY + 5.9, -45.2, [1, 0.82, 0.6], 0.7, 6.5, { box: PGB });
    b.box("lamp", -38.5, BY + 3.4, -44.2, 0.4, 0.14, 0.08, { tint: red });
    b.light(-38.5, BY + 3, -46, red, 0.6, 6, { box: PGB });
    b.glow(-38.5, BY + 3.47, -44.25, [0.8, 0.1, 0.05], 1.0);
    for (let k = 0; k < 8; k++)
      b.hplate(
        "decal",
        -46 + r() * 20,
        BY + 0.013 + k * 0.001,
        -64 + r() * 18,
        1.4,
        1.4,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", 100 + k),
        { tint: [0.8, 0.8, 0.85] },
      );
    K.skel(ctx, -32.2, BY, -48.8, 2.8, "reaching");
    K.loot(ctx, "footlocker", -27.6, BY, -45.2, -HP, {
      loot: "footlocker",
      items: [
        ["ppk_formula_n", 2],
        ["prussian_blue", 1],
        ["rally_tonic", 1],
      ],
      name: "Veterinary Kit",
    });

    // ================================================================ doors & anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    const BYW = PK.ZOO_BY || 0,
      D = PK.ZOO.door,
      KP = PK.ZOO.keeper;
    K.door(ctx, {
      id: "ppk_zoo_in",
      pos: new THREE.Vector3(D.x, BYW + D.y + 1.3, D.z + 0.25),
      label: "The Arsenal",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.4, yaw: 0 },
      onEnter: () => {
        PK.onEnter && PK.onEnter("cp_zoo_arsenal");
      },
    });
    K.door(ctx, {
      id: "ppk_zoo_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.3),
      label: "Central Park Zoo",
      verb: "Leave",
      target: { x: D.x, y: BYW, z: D.z + 4.8, yaw: PI },
    });
    // one-way keeper's door: bolted from the Polar Circle side until the player leaves that way (not a lock)
    const keeperIn = K.door(ctx, {
      id: "ppk_keeper_in",
      pos: new THREE.Vector3(KP.x, BYW + 1.1, KP.z - 0.45),
      label: "Polar Circle Service Door",
      verb: "Open",
      target: { x: OX - 47.0, y: OY - 1.3, z: OZ - 45.2, yaw: -0.08 },
      onEnter: () => {
        PK.onEnter && PK.onEnter("cp_zoo_arsenal");
      },
    });
    if (keeperIn)
      PK.barDoor(keeperIn, {
        lockText: "Bolted from inside",
        message: "The keeper's door is bolted from the inside.",
        unbarMessage: "You leave the keeper's door unbolted behind you.",
      });
    K.door(ctx, {
      id: "ppk_keeper_out",
      pos: new THREE.Vector3(OX - 46, OY - 0.2, OZ - 44.3),
      label: "Polar Circle",
      verb: "Leave",
      target: { x: KP.x, y: BYW, z: KP.z - 1.7, yaw: 0 },
      onEnter: () => {
        if (keeperIn && keeperIn.unbar) keeperIn.unbar();
      },
    });

    K.anchor(ctx, "entrance", 0, 0, -1.4);
    [
      [-11, BY, -40.8],
      [-40, BY, -26],
      [-16, BY, -30],
      [-36, BY, -34.5],
      [-11, BY, -34.2],
      [-38.5, BY, -47.5],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "boss", -36, BY, -61.3);
    K.anchor(ctx, "feeder", -29.0, BY, -58.6);
    K.anchor(ctx, "noah_terminal", 12, BY, -32.6);
    K.anchor(ctx, "commissioner", -13.2, 4.4, -7.4);
    K.anchor(ctx, "keeper_catwalk", -46, -1.3, -45.3);
    K.anchor(ctx, "loot1", -12.8, BY, -43.6);
    K.anchor(ctx, "loot2", -15.85, 5.6, -7.2);
    K.anchor(ctx, "loot3", -27.6, BY, -45.2);
    K.anchor(ctx, "loot4", 9.4, 1.6, -21.1);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_cp_zoo_int";
  }

