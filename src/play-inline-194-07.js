// play-inline-194 07 — ctx
// Lines 1557-2872 of readable/play-inline-194.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "chinatown_int",
      off: O,
      lit: true,
      amb: [0.11, 0.095, 0.08],
      floors: [0, BUNK],
      grime: 0.5,
    });
    const r = K.rng("ct_int");
    const lacq = [0.62, 0.14, 0.1];
    const DR = [-10.1, -0.2, -14.1, 10.1, 4.2, 0.1];

    // ---------------- dining room (x −10..10, z −14..0) ----------------
    K.gap(ctx, 0, 0, 2.0, 0, 3.0);
    K.gap(ctx, 6, -14, 1.3, 0, 2.3);
    K.gap(ctx, -3, -14, 1.2, 0, 2.3);
    K.room(b, ctx, {
      x0: -10,
      z0: -14,
      x1: 10,
      z1: 0,
      y: 0,
      h: 4,
      floor: "carpet",
      fc: [0.75, 0.3, 0.22],
      wall: "lacquer",
      wc: [0.9, 0.85, 0.8],
      wain: "wood_dark",
      wainC: [0.4, 0.14, 0.1],
      wainH: 1.0,
      ceil: "lacquer",
      cc: [0.55, 0.3, 0.2],
      cornice: true,
      corniceMat: "gold",
    });
    // lacquer columns with gold dragons coiling (stylised rings)
    for (const [x, z] of [
      [-5, -4.5],
      [5, -4.5],
      [-5, -10],
      [5, -10],
    ]) {
      b.cyl("paint_red", x, 0, z, 0.32, 0.32, 4, 12, {
        tint: [0.75, 0.14, 0.1],
      });
      for (let k = 0; k < 7; k++) {
        const y = 0.6 + k * 0.45,
          a = k * 0.9;
        b.geo("gold", K.sphereGeo(), {
          x: x + Math.cos(a) * 0.33,
          y,
          z: z + Math.sin(a) * 0.33,
          s: 0.1,
          tint: [0.95, 0.75, 0.3],
        });
      }
      b.col(x - 0.32, 0, z - 0.32, x + 0.32, 4, z + 0.32, { walkable: false });
    }
    // dragon mural (north wall)
    const mural = K.paint(
      "art",
      "ct_mural",
      512,
      192,
      function (x, X, Y, W, H) {
        x.fillStyle = "#7a1a10";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#e8b040";
        x.lineWidth = 16;
        x.lineCap = "round";
        x.beginPath();
        for (let k = 0; k <= 60; k++) {
          const t = k / 60,
            px = X + 30 + t * (W - 90),
            py = Y + H / 2 + Math.sin(t * 12) * H * 0.25;
          if (k) x.lineTo(px, py);
          else x.moveTo(px, py);
        }
        x.stroke();
        x.lineWidth = 3;
        x.strokeStyle = "#7a1a10";
        for (let k = 0; k < 60; k++) {
          const t = k / 60,
            px = X + 30 + t * (W - 90),
            py = Y + H / 2 + Math.sin(t * 12) * H * 0.25;
          x.beginPath();
          x.arc(px, py, 4, 0, PI);
          x.stroke();
        }
        x.fillStyle = "#e8b040";
        x.beginPath();
        x.ellipse(
          X + W - 55,
          Y + H / 2 + Math.sin(12) * H * 0.25,
          32,
          22,
          0,
          0,
          6.3,
        );
        x.fill();
        x.fillStyle = "#ffffff";
        x.beginPath();
        x.arc(X + W - 45, Y + H / 2 + Math.sin(12) * H * 0.25 - 6, 5, 0, 6.3);
        x.fill();
        x.fillStyle = "rgba(255,240,200,0.8)";
        x.beginPath();
        x.arc(X + 60, Y + 40, 18, 0, 6.3);
        x.fill(); // pearl
        for (let k = 0; k < 20; k++) {
          x.fillStyle = "rgba(240,200,120,0.3)";
          x.beginPath();
          x.arc(
            X + Math.random() * W,
            Y + Math.random() * H,
            10 + Math.random() * 20,
            0,
            6.3,
          );
          x.fill();
        }
        K.stains(x, X, Y, W, H, 10, 5, 0.4);
      },
    );
    K.framed(b, 0, 2.4, -13.88, 0, 1, 7.5, 2.6, mural, {
      frame: "gold",
      fw: 0.14,
    });
    // round tables, lazy susans, stools
    for (const [tx, tz] of [
      [-7.5, -2.5],
      [-2.5, -2.2],
      [2.5, -2.2],
      [7.5, -2.5],
      [-7.5, -7.3],
      [0, -7.3],
      [7.5, -7.3],
      [-7.5, -11.5],
      [-2, -11.6],
      [2.8, -11.6],
    ]) {
      const up = r() < 0.8;
      if (up) {
        K.roundTable(b, tx, 0, tz, 0.85, {
          mat: "wood_dark",
          cloth: [0.9, 0.85, 0.75],
        });
        b.cyl("wood_dark", tx, 0.76, tz, 0.4, 0.4, 0.04, 16, {
          tint: [0.5, 0.25, 0.15],
        }); // lazy susan
        for (let k = 0; k < 4; k++) {
          const a = (k * PI) / 2 + r();
          b.cyl(
            "ceramic",
            tx + Math.cos(a) * 0.25,
            0.8,
            tz + Math.sin(a) * 0.25,
            0.1,
            0.08,
            0.05,
            8,
            { tint: [0.9, 0.9, 0.95] },
          );
        }
        for (let k = 0; k < 6; k++) {
          const a = (k * PI) / 3;
          K.chair(
            b,
            tx + Math.cos(a) * 1.2,
            0,
            tz + Math.sin(a) * 1.2,
            Math.atan2(Math.cos(a), Math.sin(a)),
            { mat: "wood_dark", fallen: r() < 0.15, tint: [0.6, 0.3, 0.2] },
          );
        }
      } else {
        b.box("wood_dark", tx, 0, tz, 1.7, 0.06, 1.7, {
          yaw: r(),
          tint: [0.5, 0.3, 0.2],
        });
        b.box("wood_dark", tx + 0.5, 0, tz, 0.08, 0.7, 0.08, { yaw: 1.3 });
      }
    }
    // hanging lanterns
    for (const [x, z] of [
      [-7.5, -2.5],
      [-2.5, -2.2],
      [2.5, -2.2],
      [7.5, -2.5],
      [-7.5, -7.3],
      [0, -7.3],
      [7.5, -7.3],
      [-2, -11.6],
      [2.8, -11.6],
    ])
      K.lamp(
        b,
        x,
        2.9,
        z,
        "lantern",
        [1, 0.45, 0.25],
        r() < 0.3 ? 0 : 0.7,
        5.5,
        { ceil: 4, size: 0.42, dead: r() < 0.2, lightOpts: { box: DR } },
      );
    b.light(0, 3.6, -7, [1, 0.55, 0.35], 0.5, 12, { box: DR });
    // cashier + lucky cat, aquarium, screen, altar
    b.boxMM("lacquer", 6.4, 0, -1.8, 9.8, 1.1, -0.9, { tint: [0.8, 0.8, 0.8] });
    b.col(6.4, 0, -1.8, 9.8, 1.1, -0.9, { tag: "counter" });
    b.geo("ceramic", K.sphereGeo(), {
      x: 7.2,
      y: 1.28,
      z: -1.35,
      sx: 0.14,
      sy: 0.18,
      sz: 0.12,
      tint: [0.95, 0.92, 0.85],
    });
    b.geo("ceramic", K.sphereGeo(), {
      x: 7.2,
      y: 1.5,
      z: -1.35,
      s: 0.11,
      tint: [0.95, 0.92, 0.85],
    });
    b.pipe("ceramic", 7.29, 1.35, -1.35, 7.33, 1.62, -1.35, 0.035, 5, {
      tint: [0.95, 0.92, 0.85],
    }); // the waving paw
    b.boxMM("glass_clear", -9.8, 0.8, -9, -8.9, 1.9, -5, {
      tint: [0.5, 0.7, 0.65],
    });
    b.boxMM("wood_dark", -9.8, 0, -9, -8.9, 0.8, -5, {});
    b.col(-9.8, 0, -9, -8.9, 1.9, -5, {});
    b.light(-9, 1.4, -7, [0.3, 0.8, 0.7], 0.5, 3, { box: DR });
    for (let k = 0; k < 4; k++)
      b.hplate(
        "decal",
        -8.4,
        0.013 + k * 0.001,
        -8.5 + k,
        0.8,
        0.8,
        r() * 6,
        K.decal("puddle", k),
      );
    b.boxMM("lacquer", 8.9, 0, -9, 9.8, 1.0, -6, { tint: [0.8, 0.7, 0.6] }); // ancestor altar
    b.col(8.9, 0, -9, 9.8, 1.0, -6, {});
    for (let k = 0; k < 3; k++)
      b.cyl("gold", 9.3, 1.0, -8.5 + k * 0.9, 0.08, 0.1, 0.15, 8);
    b.glow(9.3, 1.3, -7.5, [1, 0.5, 0.2], 0.4);
    b.light(9, 1.4, -7.5, [1, 0.5, 0.2], 0.5, 3, { box: DR });
    K.framed(
      b,
      9.88,
      2.4,
      -7.5,
      -1,
      0,
      1.2,
      1.6,
      K.photo("family", 3, 128, 176),
      { frame: "wood_dark" },
    );
    for (let k = 0; k < 6; k++)
      K.framed(
        b,
        -9.88,
        2.6,
        -1.5 - k * 1.9,
        1,
        0,
        0.5,
        1.2,
        vboard("ct_scroll" + k, 4, "#e8dcc0", "#1a1410", null),
        { frame: "wood_dark", fw: 0.04 },
      );
    K.litter(b, -9.5, -13.5, 9.5, -0.5, 0, 24, 31);
    // the dead Vanguard scavenger with the intercept tape reel
    K.skel(ctx, -3.8, 0, -5.8, 2.4, "reaching");
    K.note(ctx, "pv_reel_ct_intercept", -3.3, 0.03, -5.4, {
      type: "tape",
      name: "Tape Reel: Strange Signal",
      title: "Recorded by R. Nnadi (Vanguard scavenger)",
      text: "[Static. A man, whispering.]\n\n\"Day two tracking the numbers station. It's not on any band the Vanguard radio knows. It's coming from UNDER the Golden Dragon. Same sequence every hour — numbers, then a march, then a woman reading a list in French. French, in Chinatown. Old Mrs. Lum from the bakery says the restaurant's landlord was some import company nobody ever met.\n\nThe storeroom. There's a draft behind the big shelf. Cold air. Machine oil.\n\nThe Maniacs don't go in the storeroom. They go around it. Like they're... told to.\n\nSomething's moving in the kitchen. Stopping the tape—\"\n\n[End of recording.]",
    });

    // ---------------- kitchen (x 2..10, z −24..−14) ----------------
    const KB = [1.9, -0.2, -24.1, 10.1, 3.8, -13.9];
    K.gap(ctx, 2, -19, 1.2, 0, 2.2);
    K.room(b, ctx, {
      x0: 2,
      z0: -24,
      x1: 10,
      z1: -14,
      y: 0,
      h: 3.6,
      floor: "tile",
      fc: [0.65, 0.62, 0.55],
      wall: "tile",
      wc: [0.78, 0.76, 0.68],
      ceil: "plaster",
      cc: [0.5, 0.48, 0.44],
    });
    b.boxMM("steel", 8.8, 0, -23.8, 9.9, 0.95, -15, {
      tint: [0.55, 0.56, 0.55],
    }); // wok line
    for (let z = -23; z < -15.5; z += 1.6) {
      b.cyl("black_iron", 9.35, 0.95, z, 0.34, 0.12, 0.2, 12, {
        top: false,
        tint: [0.3, 0.3, 0.3],
      });
      b.glow(9.35, 0.9, z, [0.3, 0.5, 1], 0.3);
    }
    b.boxMM("steel", 8.6, 2.0, -23.9, 10, 2.6, -15, {
      tint: [0.45, 0.45, 0.44],
    }); // hood
    b.col(8.8, 0, -23.8, 9.9, 0.95, -15, { tag: "counter" });
    for (let k = 0; k < 4; k++) {
      const sz = -23 + k * 0.6;
      for (let j = 0; j < 3; j++)
        b.cyl("wood", 3, 0.9 + j * 0.16, sz, 0.28, 0.28, 0.15, 12, {
          tint: [0.75, 0.62, 0.42],
        });
    }
    b.boxMM("steel", 2.2, 0, -23.8, 3.8, 0.9, -21.2, {
      tint: [0.55, 0.56, 0.55],
    });
    b.col(2.2, 0, -23.8, 3.8, 0.9, -21.2, { tag: "counter" });
    b.pipe("steel", 4.5, 2.4, -17, 8.2, 2.4, -17, 0.02, 4);
    for (let k = 0; k < 6; k++) {
      const x = 4.8 + k * 0.6;
      b.pipe("steel", x, 2.4, -17, x, 2.0, -17, 0.008, 3);
      b.geo("meat", K.sphereGeo(), {
        x,
        y: 1.6,
        z: -17,
        sx: 0.18,
        sy: 0.35,
        sz: 0.14,
        tint: [0.55, 0.3, 0.18],
      });
    } // roast ducks (long dead)
    b.boxMM("wood", 4.4, 0, -20.4, 7.6, 0.9, -19.4, {
      tint: [0.6, 0.45, 0.32],
    });
    b.col(4.4, 0, -20.4, 7.6, 0.9, -19.4, { tag: "counter" });
    b.cyl("wood", 5, 0.9, -19.9, 0.35, 0.35, 0.18, 12, {
      tint: [0.55, 0.4, 0.28],
    }); // chopping block
    for (let k = 0; k < 5; k++)
      b.box("fabric", 9.4 - k * 0.1, 0, -14.8 + (k % 2) * 0.1, 0.5, 0.35, 0.7, {
        yaw: k * 0.3,
        tint: [0.85, 0.8, 0.65],
      }); // rice sacks
    K.lamp(b, 6, 3.3, -19, "tube", [0.9, 0.95, 1.0], 0.8, 7, {
      ceil: 3.6,
      len: 1.4,
      lightOpts: { box: KB },
    });
    for (let k = 0; k < 4; k++)
      b.hplate(
        "decal",
        3 + r() * 6,
        0.012 + k * 0.001,
        -23 + r() * 8,
        1.3,
        1.3,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", k + 40),
      );
    K.loot(ctx, "fridge", 2.5, 0, -15.2, HP, { loot: "fridge" });
    // fresh digging in the kitchen corner: the Glowkeepers are tunnelling toward the Commandant's office (mq31)
    b.hplate("decal", 6.1, 0.014, -22.7, 1.6, 1.6, 0.3, K.decal("scorch", 77));
    b.cyl("rubble", 6.1, -0.05, -22.7, 0.75, 0.55, 0.1, 10, {
      tint: [0.12, 0.1, 0.09],
    });
    K.rubble(b, 6.9, 0, -23.3, 0.6, 0.45, { seed: 71, col: false });
    K.rubble(b, 5.2, 0, -23.2, 0.5, 0.35, { seed: 72, col: false });
    K.anchor(ctx, "dig", 6.1, 0.3, -22.2);
    K.anchor(ctx, "glow1", 6.4, 0, -20.9);
    K.anchor(ctx, "glow2", 5.3, 0, -16.2);

    // ---------------- storeroom (x −10..2, z −24..−14) + the moving shelf ----------------
    const SB = [-10.1, -0.2, -24.1, 2.1, 3.8, -13.9];
    K.gap(ctx, -4, -24, 1.4, 0, 2.3); // the secret doorway (hidden by the shelf)
    K.room(b, ctx, {
      x0: -10,
      z0: -24,
      x1: 2,
      z1: -14,
      y: 0,
      h: 3.6,
      floor: "concrete",
      fc: [0.55, 0.52, 0.48],
      wall: "brick_tan",
      wc: [0.6, 0.52, 0.45],
      ceil: "plaster",
      cc: [0.45, 0.43, 0.4],
      trim: false,
    });
    K.shelf(b, -9.75, 0, -19, HP, 5.0, {
      mat: "wood",
      items: ["jar", "box", "can", "jar"],
      seed: 5,
    });
    K.shelf(b, -1, 0, -14.3, PI, 3.5, {
      mat: "wood",
      items: ["box", "box", "jar"],
      seed: 6,
    });
    for (let k = 0; k < 10; k++)
      b.box(
        "fabric",
        -8 + (k % 5) * 0.9,
        k > 4 ? 0.4 : 0,
        -15.2,
        0.8,
        0.4,
        0.55,
        { yaw: (r() - 0.5) * 0.3, tint: [0.85, 0.8, 0.65] },
      );
    b.col(-8.5, 0, -15.6, -4, 0.8, -14.8, {});
    K.lamp(b, -4, 3.2, -19, "bulb", [1, 0.8, 0.55], 0.95, 7.5, {
      ceil: 3.6,
      lightOpts: { box: SB },
    });
    b.hplate("decal", -4, 0.012, -23.2, 1.8, 1.0, 0, K.decal("grime", 60)); // drag marks by the shelf
    for (let k = 0; k < 5; k++)
      b.hplate(
        "flat",
        -5 + k * 0.5,
        0.013,
        -22.6 + (k % 2) * 0.3,
        0.05,
        1.2,
        0.1,
        null,
        { tint: [0.25, 0.22, 0.2] },
      );
    K.loot(ctx, "crate", -9, 0, -23, 0.2, {
      loot: "food_oldworld",
      name: "Dry Goods",
    });

    // ---------------- hidden stairway (x −5..−3, z −37..−24) ----------------
    const HB = [-5.2, BUNK - 0.2, -37.2, -2.8, 3.8, -23.8];
    K.room(b, ctx, {
      x0: -5,
      z0: -37,
      x1: -3,
      z1: -24,
      y: BUNK,
      h: 3.6 - BUNK,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "concrete",
      wc: [0.55, 0.53, 0.5],
      ceil: "concrete",
      cc: [0.4, 0.4, 0.38],
      trim: false,
    });
    b.boxMM("concrete", -5, -0.3, -25.2, -3, 0, -24, {
      tint: [0.5, 0.48, 0.45],
    });
    b.col(-5, -0.3, -25.2, -3, 0, -24, { tag: "floor" });
    K.stairs(b, -5, -36, -3, -25.2, BUNK, 0, "+z", {
      mat: "concrete",
      tint: [0.5, 0.48, 0.45],
      rail: "l",
      railMat: "metal_dark",
      handMat: "metal_dark",
    });
    for (const [z, y] of [
      [-27, -0.5],
      [-32, -3.4],
    ])
      K.lamp(b, -4, y + 2.4, z, "cage", [1, 0.15, 0.1], 0.9, 5, {
        ceil: y + 2.8,
        lightOpts: { box: HB },
      });
    b.plate(
      "art",
      -4,
      BUNK + 2.2,
      -36.88,
      0,
      1,
      1.4,
      1.0,
      poster("ct_post_stair", "VIGILANCE"),
      {},
    );

    // ---------------- POSTE DRAGON — the Bureau Sept relay station (y −6) ----------------
    const Y = BUNK;
    const wallC = [0.52, 0.55, 0.5],
      floorC = [0.45, 0.46, 0.44];
    // guard post (x −8..8, z −46..−37)
    const GP = [-8.1, Y - 0.2, -46.1, 8.1, Y + 3.4, -36.9];
    K.gap(ctx, -4, -37, 2.0, Y, 2.6);
    K.gap(ctx, 0, -46, 2.4, Y, 2.8);
    K.room(b, ctx, {
      x0: -8,
      z0: -46,
      x1: 8,
      z1: -37,
      y: Y,
      h: 3.2,
      floor: "concrete",
      fc: floorC,
      wall: "metal",
      wc: wallC,
      ceil: "metal_dark",
      cc: [0.4, 0.42, 0.4],
      trim: false,
    });
    for (let k = 0; k < 5; k++)
      b.box("fabric", -1.8 + k * 0.9, Y, -43.2, 0.85, 0.45, 0.5, {
        tint: [0.6, 0.55, 0.42],
      });
    for (let k = 0; k < 4; k++)
      b.box("fabric", -1.35 + k * 0.9, Y + 0.45, -43.2, 0.85, 0.45, 0.5, {
        tint: [0.55, 0.5, 0.4],
      });
    b.col(-2.3, Y, -43.5, 2.3, Y + 0.9, -42.9, { tag: "sandbags" });
    const gdt = K.table(b, 5.5, Y, -40, 1.6, 0.8, {
      mat: "metal",
      tint: [0.5, 0.55, 0.5],
    });
    K.terminal(
      ctx,
      "pv_term_ct_guard",
      5.9,
      gdt,
      -40.2,
      0,
      termGuard(),
      "bare",
    );
    b.plate(
      "art",
      7.88,
      Y + 1.8,
      -41.5,
      -1,
      0,
      0.9,
      1.3,
      poster("ct_post1", "LA FRANCE VOUS ÉCOUTE"),
      {},
    );
    b.plate(
      "art",
      -7.88,
      Y + 1.8,
      -41.5,
      1,
      0,
      0.9,
      1.3,
      poster("ct_post2", "LE SILENCE EST UNE ARME"),
      {},
    );
    // the blast door (open, rolled aside)
    b.boxMM("metal_dark", -2.9, Y, -46.35, -1.3, Y + 2.9, -45.7, {
      tint: [0.45, 0.5, 0.42],
    });
    b.cyl("metal_dark", -2.1, Y + 1.5, -45.7, 0.5, 0.5, 0.08, 16, {
      tint: [0.35, 0.4, 0.33],
    });
    b.boxMM("paint_yellow", -1.25, Y, -46.1, 1.25, Y + 0.05, -45.8, {
      tint: [0.8, 0.65, 0.2],
    });
    K.lamp(b, 0, Y + 2.9, -41, "cage", [1, 0.2, 0.15], 1.0, 8, {
      ceil: Y + 3.2,
      lightOpts: { box: GP },
    });
    K.lamp(b, 5.5, Y + 2.9, -39, "tube", [0.85, 1.0, 0.9], 0.6, 5, {
      ceil: Y + 3.2,
      lightOpts: { box: GP },
    });

    // main corridor (x −2..2, z −72..−46)
    const CB = [-2.1, Y - 0.2, -72.1, 2.1, Y + 3.4, -45.9];
    K.gap(ctx, -2, -52.5, 1.3, Y, 2.3);
    K.gap(ctx, 2, -53.5, 1.3, Y, 2.3);
    K.gap(ctx, -2, -65, 1.3, Y, 2.3);
    K.gap(ctx, 2, -65, 1.3, Y, 2.3);
    K.gap(ctx, 0, -72, 1.8, Y, 2.4);
    K.room(b, ctx, {
      x0: -2,
      z0: -72,
      x1: 2,
      z1: -46,
      y: Y,
      h: 3.0,
      floor: "concrete",
      fc: floorC,
      wall: "metal",
      wc: wallC,
      ceil: "metal_dark",
      cc: [0.38, 0.4, 0.38],
      trim: false,
    });
    for (let z = -70; z < -47; z += 3) {
      b.beam("metal_dark", -2, Y + 2.9, z, 2, Y + 2.9, z, 0.2, 0.2, {
        tint: [0.4, 0.42, 0.38],
      });
    }
    b.pipe("rust", 1.8, Y + 2.6, -46, 1.8, Y + 2.6, -72, 0.07, 5);
    b.pipe("paint_red", -1.8, Y + 2.7, -46, -1.8, Y + 2.7, -72, 0.04, 5, {
      tint: [0.6, 0.15, 0.1],
    });
    for (const z of [-49, -57, -61, -69]) {
      const sd = z === -57 || z === -69 ? 1 : -1;
      b.plate(
        "art",
        sd * 1.88,
        Y + 1.7,
        z,
        -sd,
        0,
        0.85,
        1.2,
        poster(
          "ct_post_c" + z,
          [
            "ÉCOUTER. NOTER. TRANSMETTRE.",
            "LA MISSION CONTINUE",
            "PARIS ATTEND VOS RAPPORTS",
            "LA PATIENCE EST UN DEVOIR",
          ][Math.abs(z) % 4],
        ),
        {},
      );
    }
    for (const z of [-50, -58, -66])
      K.lamp(b, 0, Y + 2.7, z, "cage", [1, 0.25, 0.18], 1.1, 7, {
        ceil: Y + 3.0,
        lightOpts: { box: CB },
      });
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        (r() - 0.5) * 2.5,
        Y + 0.012 + k * 0.001,
        -48 - r() * 22,
        1.4,
        1.4,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", k + 50),
      );

    // radio-intercept room (x −14..−2, z −59..−47)
    const RB = [-14.1, Y - 0.2, -59.1, -1.9, Y + 3.4, -46.9];
    K.room(b, ctx, {
      x0: -14,
      z0: -59,
      x1: -2,
      z1: -47,
      y: Y,
      h: 3.2,
      floor: "metal",
      fc: [0.4, 0.42, 0.4],
      wall: "metal",
      wc: [0.45, 0.5, 0.45],
      ceil: "metal_dark",
      cc: [0.35, 0.37, 0.35],
      trim: false,
      surface: "metal",
    });
    // banks of radio equipment along the west & north walls
    for (let z = -58.5; z < -47.8; z += 1.3) radioBank(b, -13.95, Y, z, 1, r);
    for (let x = -12.8; x < -3; x += 1.3) radioBank(b, x, Y, -58.95, 2, r);
    for (let k = 0; k < 4; k++) {
      const cx = -12.2,
        cz = -57.5 + k * 2.6;
      K.chair(b, cx, Y, cz, -HP, { mat: "metal", tint: [0.4, 0.4, 0.38] });
    }
    // the map table with Manhattan and pins
    const mapTex = K.paint(
      "art",
      "ct_map",
      384,
      256,
      function (x, X, Y2, W, H) {
        x.fillStyle = "#d8ceb0";
        x.fillRect(X, Y2, W, H);
        x.fillStyle = "#9ab0b8";
        x.fillRect(X, Y2, W * 0.28, H);
        x.fillRect(X + W * 0.72, Y2, W * 0.28, H);
        x.fillStyle = "#c8bca0";
        x.beginPath();
        x.moveTo(X + W * 0.42, Y2 + 5);
        x.lineTo(X + W * 0.6, Y2 + 5);
        x.lineTo(X + W * 0.66, Y2 + H * 0.6);
        x.lineTo(X + W * 0.52, Y2 + H - 5);
        x.lineTo(X + W * 0.36, Y2 + H * 0.6);
        x.closePath();
        x.fill();
        x.strokeStyle = "#6a5a40";
        x.lineWidth = 1;
        for (let k = 0; k < 20; k++) {
          x.beginPath();
          x.moveTo(X + W * 0.36, Y2 + k * 12);
          x.lineTo(X + W * 0.66, Y2 + k * 12);
          x.stroke();
        }
        const pins = [
          [0.5, 0.2, "#ff2020"],
          [0.55, 0.45, "#ff2020"],
          [0.46, 0.62, "#ffd020"],
          [0.52, 0.85, "#ff2020"],
          [0.8, 0.9, "#2060ff"],
          [0.2, 0.95, "#2060ff"],
        ];
        for (const [px, py, c] of pins) {
          x.fillStyle = c;
          x.beginPath();
          x.arc(X + W * px, Y2 + H * py, 5, 0, 6.3);
          x.fill();
        }
        x.fillStyle = "#22397a";
        x.font = "bold 12px Georgia, serif";
        x.textAlign = "left";
        x.fillText("MANHATTAN — CIBLES D'ÉCOUTE", X + 10, Y2 + 18);
        x.fillText("Rouge: relais · Bleu: ports", X + 10, Y2 + H - 10);
        K.stains(x, X, Y2, W, H, 8, 3, 0.35);
      },
    );
    const mt = K.table(b, -7, Y, -53, 3.0, 2.0, {
      mat: "metal",
      tint: [0.45, 0.48, 0.44],
    });
    b.hplate("art", -7, mt + 0.01, -53, 2.8, 1.85, 0, mapTex);
    K.lamp(b, -7, Y + 2.3, -53, "pendant", [1, 0.9, 0.7], 1.0, 5, {
      ceil: Y + 3.2,
      shade: "paint_green",
      lightOpts: { box: RB },
    });
    // reel-to-reel recorders
    for (const x of [-10.5, -9]) {
      b.boxMM("metal", x - 0.5, Y, -48.4, x + 0.5, Y + 1.2, -47.2, {
        tint: [0.5, 0.52, 0.5],
      });
      for (const s of [-1, 1])
        b.cyl(
          "metal_dark",
          x + s * 0.22,
          Y + 1.0,
          -47.18,
          0.18,
          0.18,
          0.03,
          12,
        );
      b.col(x - 0.5, Y, -48.4, x + 0.5, Y + 1.2, -47.2, {});
    }
    // THE TRANSMITTER (still running) — interactable
    b.boxMM("paint_green", -4.6, Y, -58.9, -2.3, Y + 2.3, -57.4, {
      tint: [0.35, 0.45, 0.35],
    });
    for (let k = 0; k < 6; k++)
      b.geo("lamp", K.sphereGeo(), {
        x: -4.2 + k * 0.33,
        y: Y + 1.9,
        z: -57.38,
        s: 0.05,
        tint: k % 2 ? [1, 0.3, 0.2] : [0.3, 1, 0.3],
      });
    b.col(-4.6, Y, -58.9, -2.3, Y + 2.3, -57.4, { tag: "machine" });
    b.light(-3.4, Y + 1.5, -56.5, [0.4, 1.0, 0.5], 0.8, 5, { box: RB });
    b.glow(-3.4, Y + 1.9, -57.3, [0.3, 0.9, 0.4], 1.2);
    b.light(-12.5, Y + 1.4, -52, [0.4, 1.0, 0.5], 0.6, 6, { box: RB });
    K.anchor(ctx, "transmitter", -3.45, Y + 1.2, -57.2);
    K.terminal(
      ctx,
      "pv_term_ct_radio",
      -12.3,
      Y + 0.9,
      -49,
      HP,
      termRadio(),
      "bare",
    );
    b.boxMM("metal", -13.2, Y, -49.6, -11.4, Y + 0.9, -48.4, {
      tint: [0.45, 0.48, 0.44],
    });
    b.col(-13.2, Y, -49.6, -11.4, Y + 0.9, -48.4, {});

    // barracks (x 2..14, z −60..−47)
    const BB = [1.9, Y - 0.2, -60.1, 14.1, Y + 3.4, -46.9];
    K.room(b, ctx, {
      x0: 2,
      z0: -60,
      x1: 14,
      z1: -47,
      y: Y,
      h: 3.2,
      floor: "concrete",
      fc: floorC,
      wall: "concrete",
      wc: [0.5, 0.52, 0.48],
      ceil: "metal_dark",
      cc: [0.36, 0.38, 0.36],
      trim: false,
    });
    for (let k = 0; k < 4; k++) {
      const z = -58.5 + k * 2.8;
      for (const x of [4, 12]) {
        // bunk beds
        for (const lvl of [0, 1.1]) {
          b.boxMM(
            "metal",
            x - 1.0,
            Y + 0.35 + lvl,
            z - 0.45,
            x + 1.0,
            Y + 0.45 + lvl,
            z + 0.45,
            { tint: [0.4, 0.45, 0.4] },
          );
          b.boxMM(
            "cloth_green",
            x - 0.95,
            Y + 0.45 + lvl,
            z - 0.42,
            x + 0.95,
            Y + 0.6 + lvl,
            z + 0.42,
            { tint: [0.45, 0.5, 0.4] },
          );
        }
        for (const s of [-1, 1])
          for (const t of [-1, 1])
            b.beam(
              "metal",
              x + s * 0.98,
              Y,
              z + t * 0.43,
              x + s * 0.98,
              Y + 1.9,
              z + t * 0.43,
              0.05,
              0.05,
            );
        b.col(x - 1.0, Y, z - 0.45, x + 1.0, Y + 1.9, z + 0.45, {
          tag: "furniture",
        });
      }
    }
    b.plate(
      "art",
      8,
      Y + 1.9,
      -59.88,
      0,
      1,
      2.2,
      1.5,
      K.paint("art", "ct_flag", 256, 170, function (x, X, Y2, W, H) {
        const cw = W / 3;
        x.fillStyle = "#22397a";
        x.fillRect(X, Y2, cw, H);
        x.fillStyle = "#ece6d6";
        x.fillRect(X + cw, Y2, cw, H);
        x.fillStyle = "#c8241c";
        x.fillRect(X + cw * 2, Y2, W - cw * 2, H);
        x.fillStyle = "#16233f";
        x.font = "bold 40px Georgia, serif";
        x.textAlign = "center";
        x.fillText("B7", X + W / 2, Y2 + H / 2 + 14);
        K.stains(x, X, Y2, W, H, 8, 9, 0.5, [30, 10, 5]);
      }),
      {},
    );
    for (let k = 0; k < 3; k++)
      K.loot(ctx, "footlocker", 4 + (k % 2) * 8, Y, -56 + k * 2.8, 0, {
        loot: "footlocker",
      });
    K.lamp(b, 8, Y + 2.9, -53.5, "cage", [1, 0.75, 0.45], 0.8, 8, {
      ceil: Y + 3.2,
      lightOpts: { box: BB },
    });
    K.skel(ctx, 12, Y + 0.6, -50.1, 0, "lying");

    // armory (x −12..−2, z −71..−60)
    const AB = [-12.1, Y - 0.2, -71.1, -1.9, Y + 3.4, -59.9];
    K.room(b, ctx, {
      x0: -12,
      z0: -71,
      x1: -2,
      z1: -60,
      y: Y,
      h: 3.2,
      floor: "concrete",
      fc: floorC,
      wall: "metal",
      wc: [0.48, 0.52, 0.46],
      ceil: "metal_dark",
      cc: [0.36, 0.38, 0.36],
      trim: false,
    });
    for (let z = -70; z < -61; z += 2) {
      b.boxMM("wood", -11.9, Y + 0.4, z - 0.8, -11.5, Y + 1.8, z + 0.8, {
        tint: [0.4, 0.3, 0.2],
      });
      for (let k = 0; k < 4; k++)
        b.box(
          "metal_dark",
          -11.65,
          Y + 0.45,
          z - 0.6 + k * 0.4,
          0.08,
          1.2,
          0.1,
          { tint: [0.25, 0.25, 0.22] },
        );
    }
    b.col(-12, Y, -70.8, -11.5, Y + 1.8, -61.2, {});
    // the cage with the stealth armour mannequin
    const cx0 = -8,
      cx1 = -3,
      cz0 = -70.8,
      cz1 = -66;
    for (let x = cx0; x <= cx1; x += 0.25)
      b.pipe("metal_dark", x, Y, cz1, x, Y + 2.6, cz1, 0.015, 4);
    for (let z = cz0; z <= cz1; z += 0.25)
      b.pipe("metal_dark", cx0, Y, z, cx0, Y + 2.6, z, 0.015, 4);
    b.beam("metal_dark", cx0, Y + 2.6, cz1, cx1, Y + 2.6, cz1, 0.06, 0.06);
    b.beam("metal_dark", cx0, Y + 1.3, cz1, cx1, Y + 1.3, cz1, 0.05, 0.05);
    b.col(cx0 - 0.05, Y, cz1 - 0.05, cx1, Y + 2.6, cz1 + 0.05, {
      tag: "cage",
      walkable: false,
    });
    b.col(cx0 - 0.05, Y, cz0, cx0 + 0.05, Y + 2.6, cz1, {
      tag: "cage",
      walkable: false,
    });
    b.boxMM("metal", -5.8, Y, -69.4, -5.2, Y + 0.3, -68.8, {});
    b.pipe("metal", -5.5, Y + 0.3, -69.1, -5.5, Y + 1.0, -69.1, 0.03, 5);
    b.box("metal_dark", -5.5, Y + 1.0, -69.1, 0.46, 0.7, 0.26, {
      tint: [0.25, 0.28, 0.25],
    }); // armour torso (dark, sleek)
    b.geo("metal_dark", K.sphereGeo(), {
      x: -5.5,
      y: Y + 1.9,
      z: -69.1,
      s: 0.16,
      tint: [0.2, 0.22, 0.2],
    });
    b.glow(-5.5, Y + 1.9, -68.95, [1, 0.2, 0.1], 0.25); // visor glint
    b.light(-5.5, Y + 2.8, -68.4, [0.9, 0.3, 0.2], 1.2, 6, { box: AB });
    b.light(-5.5, Y + 1.2, -67.0, [0.7, 0.75, 0.8], 0.7, 4, { box: AB }); // display spot on the armour
    b.plate(
      "art",
      -5.5,
      Y + 2.9,
      -65.95,
      0,
      1,
      1.4,
      0.35,
      K.signCell("ct_cage_sign", "SECTION OMBRE — ACCÈS RÉSERVÉ", 512, 96, {
        bg: "#1a1a1a",
        fg: "#e03020",
        font: "Arial, sans-serif",
      }),
      {},
    );
    K.loot(ctx, "locker", -5.5, Y, -70.4, 0, {
      items: [["bureau_stealth_suit", 1]],
      lock: LK.armory,
      name: "Shade Suit Locker",
      tag: "armory",
    });
    K.loot(ctx, "ammo_box", -10.5, Y, -61, 0, {
      loot: "ammo_box",
      large: true,
    });
    K.loot(ctx, "crate", -3.5, Y, -61, 0, {
      items: [
        [RIFLE(), 1],
        ["ammo_556", 60],
      ],
      kind: "army",
      name: "Station Weapons Crate",
    });
    K.loot(ctx, "crate", -10.8, Y, -69.5, 0.3, {
      loot: "weapon_crate",
      kind: "army",
    });
    K.lamp(b, -7, Y + 2.9, -63, "cage", [1, 0.2, 0.15], 0.8, 7, {
      ceil: Y + 3.2,
      lightOpts: { box: AB },
    });

    // commander's office (x 2..12, z −71..−60)
    const OB = [1.9, Y - 0.2, -71.1, 12.1, Y + 3.4, -59.9];
    K.room(b, ctx, {
      x0: 2,
      z0: -71,
      x1: 12,
      z1: -60,
      y: Y,
      h: 3.2,
      floor: "wood",
      fc: [0.45, 0.35, 0.28],
      wall: "lacquer",
      wc: [0.7, 0.62, 0.58],
      wain: "wood_dark",
      wainC: [0.35, 0.2, 0.14],
      ceil: "metal_dark",
      cc: [0.36, 0.34, 0.32],
      surface: "wood",
    });
    const cdt = K.table(b, 8, Y, -68, 2.2, 1.0, { mat: "mahogany" });
    K.chair(b, 8, Y, -69, PI, { mat: "leather" });
    K.terminal(
      ctx,
      "pv_term_ct_commander",
      8.5,
      cdt,
      -68.2,
      0,
      termCommander(),
      "bare",
    );
    K.lamp(b, 7.2, cdt + 0.35, -68.1, "pendant", [1, 0.85, 0.6], 0.8, 4.5, {
      ceil: cdt + 0.45,
      shade: "paint_green",
      lightOpts: { box: OB },
    });
    b.box("brass", 7.2, cdt, -68.1, 0.15, 0.4, 0.15, {});
    b.plate(
      "art",
      7,
      Y + 2.0,
      -70.88,
      0,
      1,
      2.4,
      1.6,
      K.paint("art", "ct_flag", 256, 170, () => {}),
      {},
    );
    K.framed(
      b,
      11.88,
      Y + 1.8,
      -64,
      -1,
      0,
      1.2,
      1.5,
      K.photo("family", 7, 128, 176),
      { frame: "gold" },
    );
    K.framed(
      b,
      2.12,
      Y + 1.8,
      -66,
      1,
      0,
      0.9,
      2.0,
      K.signCell("ct_office_charter", "POSTE DRAGON · 1962", 128, 280, {
        bg: "#e8dcc0",
        fg: "#22397a",
        font: "Georgia, serif",
      }),
      { frame: "wood_dark" },
    );
    b.boxMM("wood_dark", 2.2, Y, -62, 3.6, Y + 1.0, -60.2, {
      tint: [0.4, 0.25, 0.18],
    });
    b.col(2.2, Y, -62, 3.6, Y + 1.0, -60.2, {});
    b.cyl("ceramic", 2.9, Y + 1.0, -61, 0.1, 0.08, 0.12, 8, {
      tint: [0.85, 0.9, 0.95],
    }); // tea set
    K.lamp(b, 7, Y + 2.9, -64, "bulb", [1, 0.8, 0.55], 0.5, 6, {
      ceil: Y + 3.2,
      lightOpts: { box: OB },
    });
    K.loot(ctx, "safe", 11.8, Y, -70, -HP, {
      loot: "safe",
      lock: LK.safe,
      name: "Commandant's Safe",
    });
    // mq31 (main story): the Commandant's grey cipher safe behind his desk, door open, dial rusted at zero: the SIROCCO
    // codebook's home (the main story puts its "Cipher Safe" beat at anchor 'cipher_safe')
    b.boxMM("metal", 5.9, Y, -70.95, 6.9, Y + 1.05, -70.2, {
      tint: [0.52, 0.54, 0.52],
    });
    b.boxMM("metal_dark", 5.98, Y + 0.08, -70.22, 6.82, Y + 0.97, -70.18, {
      tint: [0.12, 0.12, 0.12],
    }); // the dark open mouth
    b.boxMM("metal", 6.9, Y + 0.06, -70.2, 6.95, Y + 0.99, -69.35, {
      tint: [0.5, 0.52, 0.5],
    }); // the door, swung open
    b.cyl("steel", 6.97, Y + 0.6, -69.8, 0.09, 0.09, 0.03, 12, {
      tint: [0.6, 0.5, 0.35],
    });
    b.col(5.9, Y, -70.95, 6.95, Y + 1.05, -70.2, { tag: "furniture" });
    K.anchor(ctx, "cipher_safe", 6.4, Y + 0.6, -69.7);
    b.cyl("black_iron", 11.2, Y, -62.4, 0.38, 0.38, 0.9, 12, {
      tint: [0.2, 0.2, 0.2],
    });
    b.pipe("black_iron", 11.2, Y + 0.9, -62.4, 11.2, Y + 3.2, -62.4, 0.08, 6);
    b.glow(11.2, Y + 0.45, -62.05, [1, 0.45, 0.15], 0.35);
    b.col(10.8, Y, -62.8, 11.6, Y + 0.9, -62.0, { tag: "furniture" });
    K.anchor(ctx, "stove", 10.6, Y + 0.8, -62.4);
    // the east wall is cracked and bulging: something is digging on the other side (the Glowkeepers' tunnel, mq31)
    b.plate(
      "decal",
      11.9,
      Y + 1.3,
      -65.2,
      -1,
      0,
      2.2,
      2.0,
      K.decal("grime", 78),
    );
    K.rubble(b, 11.4, Y, -65.2, 0.6, 0.3, { seed: 73, col: false });
    K.anchor(ctx, "crack", 11.1, Y + 1.2, -65.2);
    K.anchor(ctx, "breach", 10.6, Y, -65.0);
    K.anchor(ctx, "boss", 6, Y, -64.5);
    K.note(ctx, "pv_note_ct_orders", 7.4, cdt + 0.01, -67.7, {
      name: "Standing Orders (translated)",
      title:
        'ORDRES PERMANENTS — Poste "Dragon", Bureau Sept (English pencilled in the margin)',
      text: "1. Record every transmission. Every one. Paris will want them.\n2. Do not engage. We are ears, not teeth.\n3. When the operation ends, await extraction.\n\n(Margin, in English, much later, shaky:)\nThe operation ended in March '67, with the sky. Nobody came. The sickness came instead. It took our hair, then our teeth, then, slowly, our minds. We have been awaiting extraction for twenty-two years.\n\nThe men are forgetting their names. Some went up into the streets and did not come back as themselves. I still remember mine. That is my last order to myself: remember.\n— Cdt. A. Delorme",
    });
    // the duty sergeant's diary in the barracks: the Commandant's teletype word
    K.note(ctx, "pv_note_ct_diary", 11.3, Y + 0.61, -50.1, {
      name: "Sgt. Brault's Diary",
      title: "Carnet — Sgt. Ph. Brault (English, cramped)",
      learn: LK.commander.id,
      text: "The Commandant changes his teletype word every year on his daughter's birthday. Except he hasn't, not since the sky went white. It is still her name. MARGUERITE. He types it every morning and stares at the screen.\n\nHe thinks I don't know. Everyone knows. We are eleven men in a hole under a noodle restaurant; there are no secrets here except the ones we keep from Paris.\n\nThe Lums upstairs never knew we were here. Good people. They fed us through the dumbwaiter for a month after the Bombing, thinking we were squatters. Then they left for Queens. I hope they made it.",
    });

    // generator room + escape tunnel (x −4..4, z −84..−72)
    const EB = [-4.1, Y - 0.2, -84.1, 4.1, Y + 3.6, -71.9];
    K.room(b, ctx, {
      x0: -4,
      z0: -84,
      x1: 4,
      z1: -72,
      y: Y,
      h: 3.4,
      floor: "concrete",
      fc: floorC,
      wall: "concrete",
      wc: [0.5, 0.5, 0.46],
      ceil: "concrete",
      cc: [0.36, 0.36, 0.34],
      trim: false,
    });
    b.boxMM("paint_green", -3.8, Y, -80, -1.2, Y + 2.2, -76, {
      tint: [0.35, 0.42, 0.34],
    });
    b.cyl("metal", -2.5, Y + 2.2, -78, 0.4, 0.4, 0.6, 10);
    b.col(-3.8, Y, -80, -1.2, Y + 2.2, -76, { tag: "machine" });
    b.glow(-1.15, Y + 1.6, -78, [1, 0.6, 0.2], 0.5);
    K.rubble(b, 2.5, Y, -82.5, 1.6, 1.2, { seed: 9 });
    for (let k = 0; k < 12; k++)
      b.beam(
        "black_iron",
        -0.45,
        Y + 0.3 + k * 0.28,
        -83.85,
        0.45,
        Y + 0.3 + k * 0.28,
        -83.85,
        0.03,
        0.03,
      );
    for (const s of [-1, 1])
      b.beam(
        "black_iron",
        s * 0.45,
        Y,
        -83.85,
        s * 0.45,
        Y + 3.4,
        -83.85,
        0.05,
        0.05,
      );
    b.plate(
      "art",
      0,
      Y + 2.8,
      -83.88,
      0,
      1,
      1.2,
      0.3,
      K.signCell("ct_exit", "EXIT ↑ (MOTT ST)", 256, 64, {
        bg: "#1a2a1a",
        fg: "#80ff80",
        font: "Arial, sans-serif",
      }),
      {},
    );
    b.light(0, Y + 3.2, -83, [0.6, 0.7, 0.8], 0.8, 5, { box: EB }); // daylight down the manhole
    b.glow(0, Y + 3.3, -83.5, [0.4, 0.45, 0.5], 1.5);
    K.lamp(b, 1, Y + 3.0, -76, "cage", [1, 0.7, 0.4], 0.6, 6, {
      ceil: Y + 3.4,
      lightOpts: { box: EB },
    });
    // the manhole lifter (a hooked iron bar) hangs on the ladder rail: from above, it unbolts the lane manhole
    K.anchor(ctx, "lifter", 1.1, Y + 0.05, -83.2);

    // ---------------- the moving shelf (own mesh, not merged) ----------------
    {
      const sb = K.builder({
        name: "ct_shelf",
        off: { x: O.x, y: O.y, z: O.z },
        lit: true,
        amb: [0.35, 0.3, 0.25],
      });
      K.shelf(sb, 0, 0, 0, 0, 2.4, {
        mat: "wood",
        items: ["jar", "box", "jar", "can"],
        h: 2.4,
        d: 0.5,
        seed: 77,
        col: false,
      });
      const grp = sb.finish(null);
      grp.position.set(-4, 0, -23.7);
      grp.children.forEach((m) => {
        if (m.isMesh || m.isPoints) m.matrixAutoUpdate = true;
      });
      const col = G.world.addBox(
        O.x - 5.25,
        O.y,
        O.z - 23.95,
        O.x - 2.75,
        O.y + 2.4,
        O.z - 23.45,
        { tag: "poi_village", walkable: false },
      );
      shelf = { group: grp, col, open: false, t: 0, O };
    }

    // ---------------- doors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pv_ct_in",
      pos: new THREE.Vector3(160, 1.3, REST.z0 - 0.4),
      label: "The Golden Dragon",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.4, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("chinatown")),
    });
    K.door(ctx, {
      id: "pv_ct_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.3),
      label: "Mott Street",
      verb: "Leave",
      target: { x: 160, y: 0, z: REST.z0 - 2.4, yaw: 0 },
    });
    K.door(ctx, {
      id: "pv_ct_escape",
      pos: new THREE.Vector3(OX, OY + Y + 1.4, OZ - 83.5),
      label: "Ladder — Mott Street (manhole)",
      verb: "Climb",
      sound: "footstep_metal",
      target: { x: MANHOLE.x + 1.2, y: 0, z: MANHOLE.z, yaw: -HP }, // arrive beside the manhole, facing up the lane (away from it)
      onEnter: () => {
        PV.setFlag("ct_manhole_open", true);
        K.lockUnlock(LK.manhole.id);
      },
    });
    const mh = K.door(ctx, {
      id: "pv_ct_manhole",
      pos: new THREE.Vector3(MANHOLE.x, 0.4, MANHOLE.z),
      label: "Manhole",
      verb: "Climb down",
      lock: LK.manhole,
      sound: "footstep_metal",
      target: { x: OX, y: OY + Y, z: OZ - 82.4, yaw: PI },
    }); // land at the foot of the ladder facing into the generator room
    ctx.manhole = mh;

    // ---------------- anchors & interactables ----------------
    K.anchor(ctx, "entrance", 0, 0, -1.4);
    K.anchor(ctx, "shelf", -4, 1.2, -23.3);
    const sp = [
      [-6, 0, -9],
      [6, 0, -4],
      [6, 0, -20],
      [-7, 0, -18],
      [0, Y, -52],
      [0, Y, -66],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "soldier1", 3, Y, -41);
    K.anchor(ctx, "soldier2", -8, Y, -55);
    K.anchor(ctx, "soldier3", 8, Y, -52);
    K.anchor(ctx, "soldier4", 0, Y, -68);
    K.anchor(ctx, "loot1", -5.5, Y, -70.4);
    K.anchor(ctx, "loot2", 11.8, Y, -70);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_chinatown_int";
    ctx.intRoot.add(shelf.group);
  }
