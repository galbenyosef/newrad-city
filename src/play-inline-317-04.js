// play-inline-317 04 — tint
// Lines 694-1491 of readable/play-inline-317.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "dn_int",
      off: O,
      lit: true,
      amb: [0.12, 0.11, 0.1],
      floors: [0, BY],
      grime: 0.35,
    });
    const r = K.rng("dn_int");
    const { x0, x1, z0, z1, h } = CAR;
    const CB = [x0 - 0.1, -0.3, z0 - 0.1, x1 + 0.1, h + 0.8, z1 + 0.1];
    // ---------------- THE CAR ----------------
    K.gap(ctx, x1, -2.8, 1.1, 0, 2.3); // car → kitchen annex
    K.room(b, ctx, {
      x0,
      z0,
      x1,
      z1,
      y: 0,
      h,
      floor: "checker",
      fc: [0.9, 0.88, 0.84],
      wall: "stainless",
      wc: [0.85, 0.87, 0.9],
      wain: "enamel_red",
      wainC: [0.12, 0.12, 0.12],
      wainH: 0.9,
      ceil: "enamel_cream",
      cc: [0.85, 0.8, 0.7],
      trim: false,
      surface: "concrete",
    });
    // barrel-vault ceiling coves
    for (const s of [-1, 1])
      b.quadN(
        "enamel_cream",
        [x0, h, s * 3.2],
        [x1, h, s * 3.2],
        [x1, h - 0.5, s * z1],
        [x0, h - 0.5, s * z1],
        [0, -0.7, -s * 0.7],
        { tint: [0.8, 0.76, 0.66] },
      );
    // ribbon windows (south & north walls) — night outside
    for (const [zw, nz] of [
      [z1, -1],
      [z0, 1],
    ]) {
      b.plate("paint_black", 0, 1.95, zw + nz * 0.11, 0, nz, 20, 1.0, null, {
        tint: [0.02, 0.03, 0.03],
        off: 0.004,
      });
      b.plate("glass", 0, 1.95, zw + nz * 0.12, 0, nz, 20, 1.0, null, {
        tint: [0.25, 0.3, 0.3],
        off: 0.005,
      });
      for (let x = -9.5; x <= 9.51; x += 1.9)
        b.boxMM(
          "chrome",
          x - 0.04,
          1.45,
          zw + nz * 0.08 - 0.03,
          x + 0.04,
          2.45,
          zw + nz * 0.08 + 0.03,
          { tint: [0.85, 0.87, 0.9] },
        );
    }
    // COUNTER along the north side: stools, back-bar
    b.boxMM("stainless", -8.5, 0, -1.3, 7.5, 1.0, -0.6, {
      tint: [0.85, 0.87, 0.9],
    });
    b.boxMM("formica", -8.6, 1.0, -1.35, 7.6, 1.07, -0.3, { tint: [1, 1, 1] });
    b.boxMM("chrome", -8.6, 1.0, -0.33, 7.6, 1.07, -0.28, {
      tint: [0.9, 0.92, 0.94],
    });
    b.boxMM("paint_black", -8.5, 0, -0.65, 7.5, 0.18, -0.55, {
      tint: [0.1, 0.1, 0.1],
    });
    b.col(-8.6, 0, -1.35, 7.6, 1.07, -0.28, { tag: "counter" });
    for (let x = -7.8; x <= 7; x += 1.0) {
      b.cyl("chrome", x, 0, 0.3, 0.22, 0.18, 0.05, 10);
      b.pipe("chrome", x, 0.05, 0.3, x, 0.7, 0.3, 0.04, 6);
      b.cyl("vinyl_red", x, 0.7, 0.3, 0.2, 0.2, 0.1, 12, {
        tint: [0.8, 0.15, 0.15],
      });
      b.cyl("chrome", x, 0.69, 0.3, 0.21, 0.21, 0.03, 12);
    }
    // back-bar: coffee urns, pie case, cake stand, grill, milkshake mixer, menu
    b.boxMM("stainless", -8.5, 0, -4.4, 7.5, 0.95, -3.6, {
      tint: [0.8, 0.82, 0.85],
    });
    b.boxMM("formica", -8.6, 0.95, -4.45, 7.6, 1.0, -3.5, { tint: [1, 1, 1] });
    b.col(-8.6, 0, -4.45, 7.6, 1.0, -3.5, { tag: "counter" });
    for (const x of [-7.5, -6.6]) {
      b.cyl("stainless", x, 1.0, -4.0, 0.3, 0.28, 0.75, 14, {
        tint: [0.9, 0.9, 0.92],
      });
      b.cyl("chrome", x, 1.75, -4.0, 0.28, 0.08, 0.15, 12);
      b.pipe("chrome", x, 1.2, -3.72, x, 1.1, -3.6, 0.02, 4);
    }
    b.boxMM("glass_clear", -4.8, 1.0, -4.3, -2.6, 1.7, -3.6, {
      tint: [0.75, 0.82, 0.82],
    });
    for (let k = 0; k < 3; k++) {
      b.cyl("flat", -4.2 + k * 0.7, 1.05, -3.95, 0.25, 0.25, 0.1, 12, {
        tint: [0.75, 0.5, 0.26],
      });
      b.cyl("flat", -4.2 + k * 0.7, 1.4, -3.95, 0.25, 0.25, 0.1, 12, {
        tint: [0.9, 0.85, 0.7],
      });
    }
    b.boxMM("steel", -1, 0.95, -4.4, 2.5, 1.02, -3.55, {
      tint: [0.25, 0.25, 0.25],
    }); // griddle
    b.glow(0.8, 1.1, -3.9, [1, 0.45, 0.2], 0.9);
    b.light(0.8, 1.4, -3.4, [1, 0.5, 0.25], 0.5, 3, { box: CB });
    b.boxMM("stainless", -1.2, 1.9, -4.45, 2.7, 2.3, -3.4, {
      tint: [0.7, 0.72, 0.75],
    }); // hood
    b.boxMM("enamel_cream", 3.5, 1.0, -4.1, 3.9, 1.5, -3.8, {
      tint: [0.4, 0.75, 0.7],
    });
    b.pipe("chrome", 3.7, 1.5, -3.95, 3.7, 1.25, -3.75, 0.015, 4); // milkshake mixer
    b.cyl("glass", 5.4, 1.0, -4.0, 0.25, 0.25, 0.02, 12);
    b.pipe("glass", 5.4, 1.02, -4.0, 5.4, 1.3, -4.0, 0.03, 6);
    b.geo("glass_clear", K.sphereGeo(), {
      x: 5.4,
      y: 1.45,
      z: -4.0,
      sx: 0.28,
      sy: 0.2,
      sz: 0.28,
      tint: [0.8, 0.85, 0.85],
    }); // cake dome
    b.plate("art", 0, 2.55, z0 + 0.12, 0, 1, 4.2, 1.2, menuBoard());
    b.plate(
      "art",
      -6.3,
      2.55,
      z0 + 0.12,
      0,
      1,
      2.2,
      0.5,
      K.signCell("dn_pie", "PIE · CAKE · COFFEE", 384, 80, {
        bg: "#101010",
        fg: "#f0f0e0",
        font: "Georgia, serif",
        italic: true,
      }),
    );
    b.plate(
      "art",
      5.8,
      2.55,
      z0 + 0.12,
      0,
      1,
      2.8,
      0.6,
      K.signCell(
        "dn_rules",
        "NO SHIRT · NO SHOES · NO SERVICE\nNO GUNS · NO MANIACS",
        512,
        120,
        { bg: "#e8e0c8", fg: "#8a1a10", font: "Arial, sans-serif" },
      ),
    );
    // BOOTHS along the south windows
    for (let k = 0; k < 5; k++) {
      const bx = -8 + k * 3.7;
      if (Math.abs(bx) < 1.6) continue; // the vestibule door in the middle
      K.table(b, bx, 0, 3.4, 0.8, 1.1, {
        mat: "formica",
        tint: [1, 1, 1],
        legMat: "chrome",
      });
      for (const s of [-1, 1])
        K.sofa(b, bx + s * 0.95, 0, 3.4, 1.2, s < 0 ? -HP : HP, {
          mat: "vinyl_red",
          d: 0.55,
          arms: false,
          backH: 0.65,
          tint: [0.75, 0.14, 0.14],
        });
      b.cyl("glass", bx - 0.2, 0.76, 3.1, 0.03, 0.03, 0.12, 6, {
        tint: [0.5, 0.5, 0.5],
      });
      b.cyl("glass", bx - 0.1, 0.76, 3.1, 0.03, 0.03, 0.12, 6, {
        tint: [0.8, 0.2, 0.15],
      }); // salt & ketchup
      b.box("chrome", bx + 0.1, 0.76, 4.2, 0.18, 0.2, 0.1, {}); // tabletop jukebox selector
      K.lamp(b, bx, 2.7, 3.2, "globe", [1, 0.85, 0.6], 0.55, 4, {
        ceil: h - 0.3,
        size: 0.16,
        lightOpts: { box: CB },
      });
    }
    // the JUKEBOX (west end)
    {
      const jx = -10.4,
        jz = 2.6;
      b.boxMM("wood_dark", jx - 0.4, 0, jz - 0.6, jx + 0.2, 1.3, jz + 0.6, {
        tint: [0.5, 0.3, 0.2],
      });
      b.cyl("wood_dark", jx - 0.1, 1.3, jz, 0.6, 0.6, 0.3, 16, {
        arc0: -HP,
        arc: PI,
        tint: [0.5, 0.3, 0.2],
      });
      b.plate("neon", jx + 0.22, 0.95, jz, 1, 0, 1.15, 1.75, jukeCell());
      b.plate("glass_clear", jx + 0.24, 1.0, jz, 1, 0, 0.7, 0.35, null, {
        tint: [0.9, 0.8, 0.6],
      });
      b.light(jx + 1.0, 1.1, jz, [1, 0.5, 0.6], 1.0, 4.5, { box: CB });
      b.glow(jx + 0.5, 1.1, jz, [0.9, 0.4, 0.5], 2);
      b.col(jx - 0.4, 0, jz - 0.6, jx + 0.2, 1.6, jz + 0.6, {});
      K.anchor(ctx, "jukebox", jx + 0.6, 0, jz);
    }
    // lights, clutter
    for (let x = -8; x <= 8; x += 4)
      K.lamp(b, x, 2.9, -2.0, "tube", [1, 0.95, 0.85], x === 4 ? 0 : 0.7, 5, {
        ceil: h + 0.5,
        len: 1.4,
        dead: x === 4,
        lightOpts: { box: CB },
      });
    b.light(0, 2.4, 0, [0.9, 0.8, 0.65], 0.4, 10, { box: CB });
    for (let k = 0; k < 5; k++)
      b.hplate(
        "decal",
        -9 + r() * 18,
        0.012 + k * 0.0004,
        -3 + r() * 6,
        0.8 + r(),
        0.8 + r(),
        r() * 6,
        K.decal(k % 2 ? "grime" : "puddle", k + 150),
      );
    K.litter(b, -10, 0.2, 9, 1.5, 0, 8, 151);
    // entrance: vestibule door (south wall centre) + exit
    b.boxMM("stainless", -0.8, 0, z1 - 0.12, 0.8, 2.4, z1 - 0.06, {
      tint: [0.8, 0.82, 0.85],
    });
    b.plate("glass_dark", 0, 1.5, z1 - 0.13, 0, -1, 1.1, 1.6, null, {
      tint: [0.3, 0.33, 0.34],
    });
    b.plate(
      "art",
      0,
      2.65,
      z1 - 0.12,
      0,
      -1,
      1.6,
      0.3,
      K.signCell("dn_thanks", "THANK YOU · CALL AGAIN", 384, 64, {
        bg: "#101010",
        fg: "#f0f0e0",
      }),
    );
    K.loot(ctx, "cash_register", -8.2, 1.07, -0.8, PI, {
      loot: "cash_register",
      name: "Diner Register",
      owner: "settlers",
    });
    // ---------------- KITCHEN ANNEX (x 11..17) ----------------
    const KB = [10.9, -0.3, -4.6, 17.1, 3.3, 4.6];
    K.gap(ctx, 14, -4.5, 1.1, 0, 2.2); // kitchen → walk-in (north)
    K.gap(ctx, 17, -3, 1.0, 0, 2.2); // kitchen → restroom (east)
    K.room(b, ctx, {
      x0: 11,
      z0: -4.5,
      x1: 17,
      z1: 4.5,
      y: 0,
      h: 3.0,
      floor: "checker",
      fc: [0.7, 0.68, 0.64],
      wall: "subway_tile",
      wc: [0.86, 0.86, 0.8],
      ceil: "plaster",
      cc: [0.55, 0.54, 0.5],
      noFloor: true,
      trim: false,
    });
    const kf = (a, bz0, c, bz1) => {
      b.face("checker", a, 0, bz1, 1, 0, 0, 0, 0, -1, c - a, bz1 - bz0, {
        uv: "top",
        tint: [0.7, 0.68, 0.64],
      });
      b.col(a, -0.3, bz0, c, 0, bz1, { tag: "floor" });
    };
    kf(11, -4.5, 17, -1.6);
    kf(11, -1.6, 14.4, 4.5);
    kf(14.4, 3.8, 17, 4.5); // hatch hole x 14.4..17, z −1.6..3.8
    // grill line along the west (car) side, prep table, sink
    b.boxMM("steel", 11.2, 0, 0.5, 12.2, 0.95, 4.3, {
      tint: [0.5, 0.52, 0.55],
    });
    b.col(11.2, 0, 0.5, 12.2, 0.95, 4.3, {});
    for (let k = 0; k < 3; k++) {
      b.cyl("black_iron", 11.7, 0.95, 1.2 + k * 1.2, 0.22, 0.22, 0.06, 10);
      b.glow(11.7, 1.05, 1.2 + k * 1.2, [1, 0.4, 0.15], 0.5);
    }
    b.boxMM("stainless", 11.1, 1.9, 0.4, 12.4, 2.3, 4.4, {
      tint: [0.7, 0.72, 0.75],
    });
    K.table(b, 13.0, 0, -1.5, 1.8, 0.9, {
      mat: "steel",
      tint: [0.65, 0.67, 0.7],
    });
    // the butcher's cleaver & a suspicious platter
    b.box("steel", 12.6, 0.76, -1.5, 0.35, 0.02, 0.12, { yaw: 0.3 });
    b.box("wood_dark", 12.85, 0.76, -1.55, 0.14, 0.03, 0.04, { yaw: 0.3 });
    b.cyl("ceramic", 13.4, 0.76, -1.4, 0.3, 0.26, 0.03, 12);
    b.geo("meat", K.sphereGeo(), {
      x: 13.4,
      y: 0.82,
      z: -1.4,
      sx: 0.2,
      sy: 0.07,
      sz: 0.14,
      tint: [0.55, 0.45, 0.3],
    });
    K.note(ctx, "ph_dn_note_order", 12.9, 0.77, -1.2, {
      name: "Order Pad (Kitchen)",
      title: "Spiro's order pad",
      text: 'TABLE 3 — 2x Mystery Meat, 1 hash, coffee\nTABLE 5 — Mystery Meat, "well done, VERY well done"\nCOUNTER — Earl (Bernadette) — Mystery Meat, double\n\nnote to self: feed the girls tonight. Bertha\'s getting BIG. Order more of the green stuff from the Glowkeeper kids. Do NOT let Flo in the cellar again, she tried to "tidy" the pens.\n\n(strongbox — 2-2-0-4, the address. stop asking, Flo.)',
      learn: "ph_dn_strongbox",
    });
    b.boxMM("stainless", 15.2, 0, -4.45, 16.4, 0.9, -3.8, {
      tint: [0.75, 0.78, 0.8],
    });
    b.col(15.2, 0, -4.45, 16.4, 0.9, -3.8, {}); // sink
    K.lamp(b, 14, 2.6, 0, "tube", [0.95, 1, 1], 0.9, 6, {
      ceil: 3.0,
      len: 1.2,
      lightOpts: { box: KB },
    });
    K.loot(ctx, "fridge", 11.6, 0, -3.6, -HP, {
      loot: "fridge",
      name: "Kitchen Fridge",
      owner: "settlers",
    });
    // cellar hatch in the floor (x 14.4..17, z 1.2..3.8): stairs down, trapdoor lifted
    K.railing(b, 14.4, -1.6, 14.4, 3.0, 0, {
      h: 0.9,
      mat: "rust",
      handMat: "rust",
    });
    b.quadN(
      "wood_rotten",
      [14.4, 0, -1.6],
      [17, 0, -1.6],
      [17, 1.7, -1.95],
      [14.4, 1.7, -1.95],
      [0, 0.2, 1],
      { tint: [0.55, 0.45, 0.35] },
    );
    b.col(14.4, 0, -1.95, 17, 1.7, -1.6, {});
    // walk-in (x 12.5..15.5, z −7.5..−4.5) — empty meat hooks, mostly
    K.room(b, ctx, {
      x0: 12.5,
      z0: -7.5,
      x1: 15.5,
      z1: -4.5,
      y: 0,
      h: 2.6,
      floor: "metal",
      fc: [0.7, 0.75, 0.78],
      wall: "metal",
      wc: [0.7, 0.78, 0.82],
      ceil: "metal",
      cc: [0.6, 0.65, 0.7],
      trim: false,
      surface: "metal",
    });
    for (let x = 13; x <= 15; x += 0.7) {
      b.pipe("steel", x, 2.2, -7.2, x, 2.2, -5, 0.02, 4);
      if (r() < 0.5)
        b.geo("meat", K.sphereGeo(), {
          x,
          y: 1.6,
          z: -6.2,
          sx: 0.2,
          sy: 0.4,
          sz: 0.16,
          tint: [0.6, 0.45, 0.4],
        });
    }
    b.light(14, 2.2, -6, [0.6, 0.8, 1.0], 0.8, 4, {
      box: [12.4, -0.3, -7.6, 15.6, 2.8, -4.4],
    });
    K.loot(ctx, "fridge", 15.1, 0, -6.8, HP, {
      loot: "food_oldworld",
      name: "Walk-in Shelf",
      owner: "settlers",
      items: [["ph_dn_mystery_meat", 2]],
    });
    // restroom (x 17..20, z 1..4.5)
    K.room(b, ctx, {
      x0: 17,
      z0: -4.5,
      x1: 20,
      z1: -1,
      y: 0,
      h: 2.8,
      floor: "hextile",
      fc: [0.8, 0.8, 0.76],
      wall: "subway_tile",
      wc: [0.8, 0.84, 0.8],
      ceil: "plaster",
      cc: [0.5, 0.5, 0.48],
    });
    b.boxMM("ceramic", 19.3, 0, -2.2, 19.9, 0.45, -1.3, {
      tint: [0.9, 0.9, 0.86],
    });
    b.boxMM("ceramic", 19.7, 0.45, -2.2, 19.95, 1.0, -1.3, {
      tint: [0.9, 0.9, 0.86],
    });
    b.boxMM("ceramic", 19.3, 0.75, -4.4, 19.9, 0.9, -3.7, {
      tint: [0.9, 0.9, 0.86],
    });
    b.plate("glass", 19.98, 1.6, -4.05, -1, 0, 0.5, 0.6, null, {
      tint: [0.5, 0.52, 0.55],
    });
    b.plate(
      "decal",
      18.5,
      1.6,
      -4.38,
      0,
      1,
      1.4,
      0.8,
      K.tag("GUS FEEDS US RATS", "#40d060", 256, 96),
    );
    K.skel(ctx, 19.5, 0.45, -1.8, -HP, "seated");
    K.lamp(b, 18.5, 2.4, -2.7, "bulb", [1, 0.8, 0.5], 0.5, 4, {
      ceil: 2.8,
      lightOpts: { box: [16.9, -0.3, -4.6, 20.1, 3.0, -0.9] },
    });
    K.loot(ctx, "first_aid", 18.5, 1.3, -1.12, PI, { loot: "first_aid" });
    // ---------------- stairs to the cellar (x 14.5..16.9, z 1.2..3.8 → heading north under the kitchen) ----------------
    K.stairs(b, 14.5, -4.2, 16.9, 3.8, BY, 0, "+z", {
      mat: "wood",
      tint: [0.5, 0.4, 0.3],
      rail: "l",
      railMat: "rust",
      handMat: "rust",
      solid: false,
      thick: 0.25,
      surface: "wood",
    });
    // ---------------- CELLAR (x −4..18, z −12..4, y −3.4) ----------------
    const LB = [-4.1, BY - 0.2, -12.1, 18.1, -0.1, 4.1];
    K.gap(ctx, -4, -9, 1.4, BY, 2.4); // cellar → back steps (west)
    K.room(b, ctx, {
      x0: -4,
      z0: -12,
      x1: 18,
      z1: 4,
      y: BY,
      h: 3.1,
      floor: "dirt",
      fc: [0.55, 0.5, 0.42],
      wall: "brick_brown",
      wc: [0.55, 0.45, 0.38],
      ceil: "wood",
      cc: [0.4, 0.34, 0.28],
      noCeil: true,
      trim: false,
      surface: "dirt",
    });
    const cc = (a, bz0, c, bz1) =>
      b.face("wood", a, -0.3, bz0, 1, 0, 0, 0, 0, 1, c - a, bz1 - bz0, {
        uv: "top",
        tint: [0.4, 0.34, 0.28],
      });
    cc(-4, -12, 14.5, 4);
    cc(14.5, -12, 18, -1.6);
    cc(17, -1.6, 18, 4);
    for (let x = -3; x <= 17; x += 2.5)
      b.beam("wood_dark", x, -0.45, -12, x, -0.45, 4, 0.2, 0.3, {
        tint: [0.4, 0.3, 0.22],
      });
    // stores
    for (let k = 0; k < 8; k++)
      b.cyl(
        "wood",
        -3.2 + (k % 4) * 0.75,
        BY,
        2.8 + Math.floor(k / 4) * 0.75,
        0.33,
        0.33,
        0.9,
        10,
        { tint: [0.55, 0.42, 0.3] },
      );
    b.col(-3.6, BY, 2.4, -0.4, BY + 0.9, 3.9, {});
    K.shelf(b, 3, BY, 3.7, PI, 3.6, {
      mat: "wood",
      items: ["can", "jar", "box"],
      seed: 181,
      h: 2.2,
    });
    // butcher block + hanging carcasses (burrow rat, unmistakably)
    K.table(b, 8, BY, -2, 2.4, 1.0, { mat: "wood", tint: [0.6, 0.45, 0.32] });
    b.hplate("decal", 8, BY + 0.77, -2, 2.2, 0.9, 0, K.decal("blood", 180));
    b.pipe("steel", 6, -0.8, -3.6, 10, -0.8, -3.6, 0.03, 4);
    for (let k = 0; k < 5; k++) {
      const x = 6.4 + k * 0.8;
      b.pipe("steel", x, -0.8, -3.6, x, -1.2, -3.6, 0.01, 3);
      b.geo("meat", K.sphereGeo(), {
        x,
        y: -1.7,
        z: -3.6,
        sx: 0.22,
        sy: 0.45,
        sz: 0.18,
        tint: [0.72, 0.5, 0.45],
      });
      b.pipe("meat", x, -2.1, -3.6, x + 0.05, -2.5, -3.6, 0.03, 4, {
        tint: [0.7, 0.5, 0.45],
      });
    }
    b.plate(
      "art",
      8,
      BY + 2.2,
      -3.95,
      0,
      1,
      2.2,
      0.4,
      K.signCell("dn_secret", "SECRET RECIPE — KEEP OUT", 384, 64, {
        bg: "#e8e0c8",
        fg: "#8a1a10",
      }),
    );
    // the BURROW RATS PENS (west): wire pens, troughs, sacks of glowing fungus feed
    for (let k = 0; k < 3; k++) {
      const px0 = -3.8 + k * 3.4,
        px1 = px0 + 3.1;
      for (let x = px0; x <= px1 + 0.01; x += 0.35)
        b.pipe("rust", x, BY, -6, x, BY + 1.3, -6, 0.015, 3);
      b.beam("rust", px0, BY + 1.3, -6, px1, BY + 1.3, -6, 0.04, 0.04);
      b.beam("rust", px0, BY + 0.6, -6, px1, BY + 0.6, -6, 0.03, 0.03);
      b.beam("rust", px1, BY, -11.8, px1, BY + 1.3, -6, 0.04, 0.04);
      b.boxMM(
        "wood_rotten",
        px0 + 0.3,
        BY,
        -11.6,
        px1 - 0.3,
        BY + 0.35,
        -11.1,
        { tint: [0.45, 0.4, 0.3] },
      );
      b.boxMM(
        "flat",
        px0 + 0.35,
        BY + 0.3,
        -11.55,
        px1 - 0.35,
        BY + 0.33,
        -11.15,
        { tint: [0.35, 0.8, 0.3] },
      ); // glowing mash
      b.glow((px0 + px1) / 2, BY + 0.5, -11.3, [0.3, 0.8, 0.25], 1.2);
      b.light((px0 + px1) / 2, BY + 0.6, -10.8, [0.35, 1.0, 0.3], 0.5, 3.5, {
        box: LB,
      });
      for (let j = 0; j < 12; j++)
        b.hplate(
          "decal",
          px0 + r() * 3,
          BY + 0.012 + j * 0.0004,
          -11.5 + r() * 5,
          0.8 + r(),
          0.8 + r(),
          r() * 6,
          K.decal(j % 3 ? "grime" : "blood", j + 190 + k * 20),
        );
    }
    // the gate of the middle pen is torn open (Bertha got out)
    b.beam("rust", 0.5, BY + 0.1, -6.2, 1.8, BY + 0.9, -4.9, 0.04, 1.2, {
      tint: [0.5, 0.35, 0.25],
    });
    b.col(-3.9, BY, -6.05, -0.6, BY + 1.3, -5.95, {});
    b.col(2.9, BY, -6.05, 6.3, BY + 1.3, -5.95, {});
    for (let k = 0; k < 6; k++)
      b.box(
        "fabric",
        7 + (k % 3) * 0.7,
        BY + Math.floor(k / 3) * 0.4,
        -11 + (k % 2) * 0.2,
        0.6,
        0.4,
        0.45,
        { yaw: r() * 0.4, tint: [0.6, 0.72, 0.45] },
      );
    b.plate(
      "art",
      7.7,
      BY + 1.3,
      -11.35,
      0,
      1,
      1.6,
      0.4,
      K.signCell("dn_feed", "GLOW-GRO FEED · CoA", 256, 64, {
        bg: "#2a4a20",
        fg: "#c8ff90",
      }),
    );
    b.light(7.7, BY + 0.8, -10, [0.35, 1.0, 0.3], 0.5, 4, { box: LB });
    b.glow(7.7, BY + 0.8, -10.8, [0.3, 0.8, 0.25], 1.4);
    b.hplate("decal", 1.5, BY + 0.02, -8.5, 3, 3, 0.2, K.decal("rad", 190));
    // the burrow Bertha dug (west wall) — rubble & dirt
    K.rubble(b, -3.2, BY, -1.5, 1.4, 1.1, { seed: 191, mat: "dirt" });
    b.boxMM("paint_black", -3.98, BY, -2.6, -3.93, BY + 1.3, -0.6, {
      tint: [0.03, 0.03, 0.03],
      faces: "e",
    });
    K.skel(ctx, 4.5, BY, -8.8, 2.4, "lying");
    // Spiro's feed ledger
    K.table(b, 16.2, BY, -9.5, 1.2, 0.7, { mat: "wood_dark" });
    K.anchor(ctx, "ledger", 16.2, BY + 0.78, -9.5);
    K.lamp(b, 16.2, BY + 1.9, -9.5, "bulb", [1, 0.8, 0.5], 0.7, 5, {
      ceil: -0.3,
      lightOpts: { box: LB },
    });
    for (const [x, z, i] of [
      [4, -2, 0.6],
      [10, 0, 0.5],
      [1, -9, 0.3],
    ])
      K.lamp(b, x, -1.2, z, "bulb", [1, 0.72, 0.4], i, 6, {
        ceil: -0.3,
        lightOpts: { box: LB },
      });
    K.loot(ctx, "footlocker", 17.3, BY, -11.2, -HP, {
      loot: "footlocker",
      name: "Spiro's Strongbox",
      locked: 0,
      lock: PH.LOCKS.dn_strongbox,
      owner: "settlers",
      items: [
        ["scrip", 90],
        ["ph_dn_mystery_meat", 3],
      ],
    });
    // back steps up to the yard (x −8..−4, z −10..−8)
    K.room(b, ctx, {
      x0: -8,
      z0: -10,
      x1: -4,
      z1: -8,
      y: BY,
      h: 3.3,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "brick_brown",
      wc: [0.5, 0.42, 0.36],
      ceil: "wood",
      cc: [0.4, 0.34, 0.28],
      trim: false,
    });
    K.stairs(b, -7.6, -9.8, -5.2, -8.2, BY, BY + 1.2, "-x", {
      mat: "concrete",
      tint: [0.5, 0.48, 0.45],
    });
    b.quad(
      "metal_dark",
      [-7.9, BY + 3.3, -9.9],
      [-7.9, BY + 3.3, -8.1],
      [-7.4, BY + 1.5, -8.1],
      [-7.4, BY + 1.5, -9.9],
      { tint: [0.35, 0.3, 0.26] },
    );
    b.light(-7, BY + 2.4, -9, [0.8, 0.8, 0.7], 0.5, 4, {
      box: [-8.1, BY - 0.2, -10.1, -3.9, -0.1, -7.9],
    });
    b.glow(-7.6, BY + 2.6, -9, [0.6, 0.6, 0.5], 1.2);

    // ---------------- doors & anchors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    const W = (x, y, z) => new THREE.Vector3(OX + x, OY + y, OZ + z);
    K.door(ctx, {
      id: "ph_dn_in",
      pos: new THREE.Vector3(DCX, 1.3, DZ1 + 2.25),
      label: "Empire Diner",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ + 3.0, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("empire_diner")),
    });
    K.door(ctx, {
      id: "ph_dn_out",
      pos: W(0, 1.3, z1 - 0.3),
      label: "22nd Street",
      verb: "Leave",
      target: { x: DCX, y: 0.12, z: DZ1 + 3.4, yaw: PI },
    });
    // cellar bulkhead ⇄ back steps (locked from outside until opened from below)
    K.door(ctx, {
      id: "ph_dn_bulk_out",
      pos: W(-7.6, BY + 1.9, -9),
      label: "Bulkhead — Back Yard",
      verb: "Climb",
      target: { x: DX1 + 2.1, y: 0.12, z: DZ0 - 4.3, yaw: 0 },
      onEnter: () => {
        PH.setFlag("dn_bulk", true);
        if (ctx.bulkIn) ctx.bulkIn.unbar();
      },
    });
    // one-way: bolted from below until opened from the cellar side (not a lock)
    ctx.bulkIn = PH.barDoor(
      K.door(ctx, {
        id: "ph_dn_bulk_in",
        pos: new THREE.Vector3(DX1 + 2.1, 0.8, DZ0 - 2),
        label: "Cellar Bulkhead",
        verb: "Open",
        target: { x: OX - 5.6, y: OY + BY, z: OZ - 9, yaw: -HP },
      }),
      {
        lockText: "Bolted from below",
        message: "The bulkhead doors are bolted from below.",
      },
    );
    K.anchor(ctx, "entrance", 0, 0, 3.0);
    K.anchor(ctx, "gus", 0.8, 0, -2.6);
    K.anchor(ctx, "dolores", -3.8, 0, 0.35);
    K.anchor(ctx, "regular", 5.9, 0, 3.4);
    K.anchor(ctx, "flo", 2, 0, 1.4);
    K.anchor(ctx, "hatch", 15.7, 0, 2.5);
    K.anchor(ctx, "bertha", 1.5, BY, -9);
    K.anchor(ctx, "boss", 1.5, BY, -9);
    [
      [-2.2, BY, -9],
      [5, BY, -9.5],
      [-1, BY, -3],
    ].forEach((p, i) => K.anchor(ctx, "rat" + (i + 1), p[0], p[1], p[2]));
    [
      [-2, BY, -9],
      [5, BY, -9],
      [10, BY, -6],
      [2, BY, 0],
      [14, 0, -2],
      [8, 0, 1],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "npc1", -3.8, 0, 0.35);
    K.anchor(ctx, "npc2", 5.9, 0, 3.4);
    K.anchor(ctx, "merchant", 0.8, 0, -2.6);
    K.anchor(ctx, "loot1", 17.3, BY, -11.2);
    K.anchor(ctx, "loot2", 15.1, 0, -6.8);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_diner_int";
    // the jukebox
    const j = ctx.anchors.jukebox;
    G.world.addInteractable({
      pos: new THREE.Vector3(j.x - 0.4, j.y + 1.1, j.z),
      radius: 0.9,
      label: "Jukebox",
      verb: () => (JB.on ? "Stop" : "Play (1 scrip)"),
      priority: 0.4,
      enabled: () => ctx.inside,
      onInteract() {
        if (JB.on) {
          JB.on = false;
          return;
        }
        if (K.scripCount() < 1 && !G.isStub("inventory")) {
          K.notify("The jukebox wants a scrip.");
          return;
        }
        K.safe("pay", () => {
          if (!G.isStub("inventory")) G.inventory.addScrip(-1);
        });
        JB.on = true;
        JB.t = 0;
        JB.beat = 0;
        K.notify(
          'The jukebox clunks, a record drops... "Atomic Sweetheart (Instrumental)".',
        );
      },
    });
  }

  // ==================================================================
  // JUKEBOX — a tiny procedural swing tune (WebAudio, via the sound module's context)
  // ==================================================================
