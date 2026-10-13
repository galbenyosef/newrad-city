// play-inline-193 05 — tint
// Lines 717-1676 of readable/play-inline-193.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "katz_int",
      off: O,
      lit: true,
      amb: [0.09, 0.085, 0.075],
      floors: [0, BY],
      grime: 0.5,
    });
    const r = K.rng("katz_int");
    const cream = [0.86, 0.8, 0.66],
      panel = [0.5, 0.32, 0.22];
    const HALL = [-14.1, -0.3, -18.1, 14.1, HALL_H + 0.2, 0.1];

    // ---------------- dining hall (x −14..14, z −18..0) ----------------
    K.gap(ctx, 10, 0, 2.2, 0, 2.9); // street doors
    K.gap(ctx, 12.5, -18, 1.3, 0, 2.3); // counter → kitchen
    K.gap(ctx, 4, -18, 1.4, 0, 2.3); // swing door → kitchen
    K.room(b, ctx, {
      x0: -14,
      z0: -18,
      x1: 14,
      z1: 0,
      y: 0,
      h: HALL_H,
      floor: "hextile",
      fc: [0.86, 0.84, 0.8],
      wall: "plaster",
      wc: cream,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.3,
      ceil: "tin",
      cc: [0.7, 0.66, 0.56],
      noFloor: true,
      cornice: true,
    });
    // floor with the west stair hole (x −13.6..−12, z −11..−3)
    b.face("hextile", -12, 0, 0, 1, 0, 0, 0, 0, -1, 26, 18, {
      uv: "top",
      tint: [0.86, 0.84, 0.8],
    });
    b.face("hextile", -14, 0, 0, 1, 0, 0, 0, 0, -1, 2, 3, {
      uv: "top",
      tint: [0.86, 0.84, 0.8],
    });
    b.face("hextile", -14, 0, -11, 1, 0, 0, 0, 0, -1, 2, 7, {
      uv: "top",
      tint: [0.86, 0.84, 0.8],
    });
    b.face("hextile", -14, 0, -3, 1, 0, 0, 0, 0, -1, 0.4, 8, {
      uv: "top",
      tint: [0.86, 0.84, 0.8],
    });
    b.col(-12, -0.3, -18, 14, 0, 0, { tag: "floor", surface: "concrete" });
    b.col(-14, -0.3, -3, -12, 0, 0, { tag: "floor" });
    b.col(-14, -0.3, -18, -12, 0, -11, { tag: "floor" });
    b.col(-14, -0.3, -11, -13.6, 0, -3, { tag: "floor" });
    K.railing(b, -12, -11, -12, -3, 0, {
      h: 1.0,
      mat: "chrome",
      handMat: "chrome",
    });
    K.railing(b, -13.6, -11, -12, -11, 0, {
      h: 1.0,
      mat: "chrome",
      handMat: "chrome",
    });
    b.plate(
      "art",
      -12.9,
      2.6,
      -17.88,
      0,
      1,
      1.6,
      0.4,
      K.signCell("katz_rest", "RESTROOMS & CELLAR ↓", 384, 96, {
        bg: "#1a1a1a",
        fg: "#e8d8b0",
        font: "Arial, sans-serif",
      }),
    );
    // entrance: turnstile, ticket machine, cashier booth
    b.boxMM("chrome", 8.6, 0, -1.8, 8.75, 1.0, -0.3, {});
    b.boxMM("chrome", 11.25, 0, -1.8, 11.4, 1.0, -0.3, {});
    b.col(8.6, 0, -1.8, 8.75, 1.0, -0.3, { walkable: false });
    b.col(11.25, 0, -1.8, 11.4, 1.0, -0.3, { walkable: false });
    b.boxMM("paint_red", 8.9, 0, -1.4, 9.3, 1.2, -1.0, {
      tint: [0.7, 0.15, 0.1],
    }); // ticket machine
    b.plate(
      "art",
      9.1,
      1.6,
      -1.42,
      0,
      1,
      0.7,
      0.4,
      K.signCell("katz_ticket", "TAKE A TICKET", 256, 128, {
        bg: "#e8e0c0",
        fg: "#b01c12",
        font: "Arial Black, sans-serif",
      }),
    );
    b.boxMM("wood_dark", 5.4, 0, -3.2, 7.9, 1.1, -0.2, { tint: panel }); // cashier
    b.boxMM("glass_clear", 5.4, 1.1, -3.2, 5.45, 2.2, -0.2, {
      tint: [0.7, 0.75, 0.75],
    });
    b.col(5.4, 0, -3.2, 7.9, 1.1, -0.2, { tag: "counter" });
    b.plate(
      "art",
      6.65,
      2.7,
      -3.25,
      0,
      -1,
      2.2,
      0.6,
      K.signCell(
        "katz_lost",
        "LOST TICKET = $50\nNO EXCEPTIONS. NOT EVEN THE END OF THE WORLD.",
        512,
        140,
        { bg: "#f0e8c8", fg: "#8a1a10", font: "Arial, sans-serif" },
      ),
    );
    // the long counter along the east side (x 10.2..11.2, z −17..−3)
    b.boxMM("wood_dark", 10.2, 0, -17, 11.2, 1.05, -4.5, { tint: panel });
    b.boxMM("ceramic", 10.1, 1.05, -17.05, 11.3, 1.12, -4.45, {
      tint: [0.85, 0.85, 0.8],
    });
    b.col(10.1, 0, -17.05, 11.3, 1.12, -4.45, {
      tag: "counter",
      surface: "wood",
    });
    for (let z = -16; z < -5; z += 2.6) {
      // carving station: sneeze guard, cutting board, a steaming brisket
      b.quad(
        "glass_clear",
        [10.25, 1.12, z - 1.1],
        [10.25, 1.12, z + 1.1],
        [10.4, 1.6, z + 1.1],
        [10.4, 1.6, z - 1.1],
        { tint: [0.6, 0.66, 0.66] },
      );
      b.boxMM("wood", 10.5, 1.12, z - 0.7, 11.1, 1.17, z + 0.7, {
        tint: [0.7, 0.55, 0.4],
      });
      b.geo("meat", K.sphereGeo(), {
        x: 10.8,
        y: 1.22,
        z,
        sx: 0.25,
        sy: 0.1,
        sz: 0.4,
        tint: [0.55, 0.22, 0.16],
      });
      b.boxMM("steel", 11.25, 1.12, z - 0.9, 11.9, 1.35, z + 0.9, {
        tint: [0.6, 0.62, 0.62],
      }); // steam table
      b.glow(11.5, 1.6, z, [0.4, 0.4, 0.38], 1.2);
    }
    // hanging salamis over the counter
    for (let z = -16.8; z < -4.8; z += 0.35) {
      const len = 0.5 + r() * 0.4,
        x = 10.6 + (r() - 0.5) * 0.4;
      b.pipe("fabric", x, 3.2, z, x, HALL_H, z, 0.006, 3, {
        tint: [0.7, 0.66, 0.55],
      });
      b.cyl("salami", x, 3.2 - len, z, 0.06, 0.05, len, 6, {
        tint: [0.9, 0.55, 0.45],
      });
    }
    b.beam(
      "steel",
      10.6,
      HALL_H - 0.4,
      -17,
      10.6,
      HALL_H - 0.4,
      -4.6,
      0.04,
      0.04,
    );
    // menu boards over the carving line (east wall)
    const menu = K.paint(
      "art",
      "katz_menu",
      512,
      384,
      function (x, X, Y, W, Hh) {
        x.fillStyle = "#16140f";
        x.fillRect(X, Y, W, Hh);
        x.fillStyle = "#f0e0a0";
        x.font = "bold 34px Arial Black, sans-serif";
        x.textAlign = "center";
        x.fillText("KATZ'S", X + W / 2, Y + 40);
        const items = [
          ["PASTRAMI ON RYE", "$1.45"],
          ["CORNED BEEF", "$1.35"],
          ["BRISKET", "$1.25"],
          ["TONGUE", "$1.15"],
          ["HOT DOG", "35¢"],
          ["KNISH", "40¢"],
          ["MATZO BALL SOUP", "50¢"],
          ["EGG CREAM", "20¢"],
          ["ROACH (NOT SERVED)", "—"],
        ];
        x.font = "22px Arial, sans-serif";
        x.textAlign = "left";
        items.forEach(([n, p], i) => {
          x.fillStyle = i === 8 ? "#ff6050" : "#e8e4d8";
          x.fillText(n, X + 20, Y + 80 + i * 32);
          x.textAlign = "right";
          x.fillText(p, X + W - 20, Y + 80 + i * 32);
          x.textAlign = "left";
        });
        K.stains(x, X, Y, W, Hh, 8, 11, 0.4, [60, 50, 30]);
      },
    );
    for (const z of [-15, -10, -5.5]) {
      b.boxMM("paint_black", 13.85, 2.2, z - 1.6, 13.95, 4.0, z + 1.6, {});
      b.plate("art", 13.84, 3.1, z, -1, 0, 3.0, 1.7, menu);
      b.light(12.8, 3.9, z, [1, 0.9, 0.7], 0.7, 4, { box: HALL });
    }
    // tables: long rows
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 5; k++) {
        const tx = -9.5 + k * 3.8,
          tz = -3.8 - row * 3.4;
        if (tx > 7 && tz > -5) continue;
        const kicked = r() < 0.15;
        K.table(b, tx, 0, tz, 1.6, 0.8, {
          mat: "wood",
          tint: [0.75, 0.6, 0.45],
          legMat: "chrome",
        });
        for (const s of [-1, 1])
          for (const dx of [-0.4, 0.4])
            K.chair(b, tx + dx, 0, tz + s * 0.7, s > 0 ? 0 : PI, {
              mat: "chrome",
              seatMat: "wood",
              fallen: kicked && r() < 0.5,
            });
        if (r() < 0.6) {
          b.cyl("glass", tx - 0.4, 0.76, tz, 0.04, 0.035, 0.14, 6, {
            tint: [0.7, 0.6, 0.45],
          });
          b.cyl("ceramic", tx + 0.3, 0.76, tz, 0.16, 0.14, 0.02, 10);
        }
        if (r() < 0.3)
          b.cyl("glass", tx + 0.1, 0.76, tz + 0.2, 0.05, 0.05, 0.02, 8, {
            tint: [0.8, 0.2, 0.15],
          }); // ketchup? mustard? something.
      }
    }
    // THE table, with its hanging sign
    K.table(b, -6, 0, -14, 1.6, 0.8, {
      mat: "wood",
      tint: [0.75, 0.6, 0.45],
      legMat: "chrome",
    });
    b.pipe("black_iron", -6.5, 2.7, -14, -6.5, HALL_H, -14, 0.008, 3);
    b.pipe("black_iron", -5.5, 2.7, -14, -5.5, HALL_H, -14, 0.008, 3);
    const she = K.signCell(
      "katz_she",
      "SEND A SALAMI TO YOUR BOY IN THE ARMY\n(the roach ate the salami)",
      512,
      128,
      { bg: "#f0e8c8", fg: "#b01c12", font: "Georgia, serif" },
    );
    b.plate("art", -6, 2.45, -13.98, 0, 1, 1.9, 0.5, she, { off: 0.01 });
    b.plate("art", -6, 2.45, -14.02, 0, -1, 1.9, 0.5, she, { off: 0.01 });
    K.skel(ctx, -6.1, 0, -14.9, PI, "seated");
    K.note(ctx, "pv_note_katz_table", -5.8, 0.77, -14.1, {
      name: "Napkin Note (Table 40)",
      title: "Written on a Katz's napkin",
      text: "Harold —\n\nYou told the counterman to send a salami to our boy in the army. We have no boy in the army. Everyone laughed anyway. It was our anniversary and you have made that joke at this table for forty-one years.\n\nThen the sirens.\n\nI'm not angry. We're at Katz's. If this is it, at least the pastrami was good.\n\n— M.\n\n(below, in a different hand: \"Send a salami.\" — H.)",
    });
    // wall of fame: photos everywhere (west, north, south walls)
    K.salonWall(b, -13.8, -1.4, 1.5, 3.9, -0.12, 0, -1, "katz_s", {
      density: 0.95,
      photos: "deli",
    });
    K.salonWall(b, -17.8, -11.5, 1.5, 3.9, -13.88, 1, 0, "katz_w1", {
      density: 0.95,
      photos: "deli",
    });
    K.salonWall(b, -2.8, -0.2, 1.5, 3.9, -13.88, 1, 0, "katz_w2", {
      density: 0.95,
      photos: "deli",
    });
    K.salonWall(b, -11.5, 2.8, 1.5, 3.9, -17.88, 0, 1, "katz_n", {
      density: 0.9,
      photos: "deli",
    });
    for (let k = 0; k < 18; k++) {
      const x = -13 + (k % 9) * 1.5,
        z = k < 9 ? -0.13 : -17.87;
      K.framed(
        b,
        x,
        1.9 + (k % 2) * 0.2,
        z,
        0,
        k < 9 ? -1 : 1,
        0.34,
        0.42,
        K.photo("deli", k),
        { frame: "paint_black", fw: 0.025 },
      );
    }
    // light: rows of globe pendants + neon spill from the windows
    for (let x = -10; x <= 8; x += 4.5)
      for (const z of [-4.5, -10, -15])
        K.lamp(
          b,
          x,
          3.2,
          z,
          "globe",
          [1, 0.85, 0.6],
          z === -10 && x === -1 ? 0 : 0.75,
          6.5,
          {
            ceil: HALL_H,
            size: 0.2,
            dead: r() < 0.25,
            lightOpts: { box: HALL },
          },
        );
    for (const [x, c] of [
      [-9, [1, 0.25, 0.15]],
      [-1, [1, 0.8, 0.25]],
      [7, [0.3, 0.8, 1]],
    ]) {
      b.light(x, 2.6, -0.6, c, 0.9, 5, { box: HALL });
      b.plate("lamp", x, 2.4, -0.12, 0, -1, 5.2, 2.6, null, {
        tint: [0.28, 0.28, 0.26],
      });
      b.plate(
        "neon",
        x,
        2.9,
        -0.16,
        0,
        -1,
        3.2,
        0.75,
        K.neonCell(
          "katz_nb" + x,
          x === -9 ? "IMARTSAP" : x === -1 ? "FEEB DENROC" : "SGOD TOH",
          384,
          96,
          {
            color: x === -9 ? "#ff3a2a" : x === -1 ? "#ffd040" : "#40c8ff",
            font: "Arial Black, sans-serif",
          },
        ),
        { tint: [0.55, 0.55, 0.55] },
      );
    }
    b.light(10, 2.4, -0.8, [0.7, 0.75, 0.85], 0.6, 4, { box: HALL });
    // roach damage in the hall: slime trails, egg clusters, bones
    for (let k = 0; k < 7; k++)
      b.hplate(
        "decal",
        -12 + r() * 22,
        0.012 + k * 0.0005,
        -16 + r() * 14,
        1 + r(),
        1 + r(),
        r() * 6,
        K.decal(k % 3 ? "roach" : "grime", k),
      );
    K.litter(b, -13.5, -17.5, 9.5, -1, 0, 26, 71);

    // ---------------- kitchen (x 2..14, z −26..−18) ----------------
    const KB = [1.9, -0.2, -26.1, 14.1, 3.8, -17.9];
    K.gap(ctx, 2, -22, 1.4, 0, 2.3); // → freezer
    K.gap(ctx, 12.5, -26, 1.2, 0, 2.3); // → back stairs
    K.room(b, ctx, {
      x0: 2,
      z0: -26,
      x1: 14,
      z1: -18,
      y: 0,
      h: 3.6,
      floor: "checker",
      fc: [0.7, 0.68, 0.62],
      wall: "tile",
      wc: [0.82, 0.82, 0.76],
      ceil: "plaster",
      cc: [0.55, 0.54, 0.5],
    });
    // brine tubs (the heart of Katz's)
    for (const [vx, vz] of [
      [3.4, -24.6],
      [5.2, -24.6],
      [7.0, -24.6],
    ]) {
      b.cyl("wood", vx, 0, vz, 0.8, 0.8, 1.3, 14, { tint: [0.55, 0.4, 0.28] });
      for (const y of [0.2, 0.7, 1.15])
        b.cyl("rust", vx, y, vz, 0.82, 0.82, 0.07, 14, { top: false });
      b.cyl("flat", vx, 1.22, vz, 0.74, 0.74, 0.02, 14, {
        tint: [0.45, 0.4, 0.2],
      }); // brine surface
      b.col(vx - 0.75, 0, vz - 0.75, vx + 0.75, 1.3, vz + 0.75, {
        tag: "furniture",
      });
    }
    b.boxMM("steel", 9.2, 0, -25.9, 13.9, 0.95, -24.9, {
      tint: [0.6, 0.62, 0.62],
    }); // steamers
    for (let k = 0; k < 4; k++) {
      b.cyl("steel", 9.8 + k * 1.1, 0.95, -25.4, 0.4, 0.4, 0.5, 12, {
        tint: [0.6, 0.62, 0.62],
      });
      b.glow(9.8 + k * 1.1, 1.6, -25.4, [0.35, 0.35, 0.33], 1.4);
    }
    b.col(9.2, 0, -25.9, 13.9, 1.45, -24.9, { tag: "counter" });
    b.boxMM("steel", 5, 0, -21.6, 10, 0.92, -20.4, {
      tint: [0.65, 0.67, 0.67],
    }); // prep island
    b.col(5, 0, -21.6, 10, 0.92, -20.4, { tag: "counter" });
    b.cyl("steel", 7.2, 0.92, -21, 0.18, 0.18, 0.08, 12);
    b.box("paint_red", 7.9, 0.92, -21, 0.4, 0.3, 0.3, {
      tint: [0.7, 0.2, 0.15],
    }); // slicer
    b.geo("meat", K.sphereGeo(), {
      x: 6,
      y: 1.02,
      z: -21,
      sx: 0.4,
      sy: 0.12,
      sz: 0.28,
      tint: [0.6, 0.25, 0.18],
    });
    b.pipe("steel", 5.2, 2.3, -21, 9.8, 2.3, -21, 0.02, 4);
    for (let k = 0; k < 8; k++) {
      const x = 5.5 + k * 0.55;
      b.pipe("steel", x, 2.3, -21, x, 1.9, -21, 0.008, 3);
      b.cyl("meat", x, 1.35, -21, 0.14, 0.1, 0.55, 6, {
        tint: [0.65, 0.3, 0.22],
      });
    }
    K.shelf(b, 13.75, 0, -21, -HP, 3.0, {
      mat: "metal",
      items: ["can", "jar", "box", "jar"],
      seed: 12,
    });
    K.lamp(b, 7, 3.4, -22, "tube", [0.9, 0.95, 1.0], 1.0, 8, {
      ceil: 3.6,
      len: 1.6,
      lightOpts: { box: KB },
    });
    K.lamp(b, 11, 3.4, -20, "tube", [0.9, 0.95, 1.0], 0, 0, {
      ceil: 3.6,
      len: 1.6,
      dead: true,
    });
    for (let k = 0; k < 5; k++)
      b.hplate(
        "decal",
        3 + r() * 10,
        0.012 + k * 0.0005,
        -25 + r() * 6,
        1.2,
        1.2,
        r() * 6,
        K.decal(k % 2 ? "blood" : "roach", k + 10),
      );
    K.loot(ctx, "fridge", 13.5, 0, -18.6, -HP, { loot: "fridge" });
    K.loot(ctx, "toolbox", 2.6, 0, -18.6, HP, { loot: "toolbox" });
    K.note(ctx, "pv_note_katz_orders", 6.8, 0.93, -20.8, {
      name: "Order Ticket #1,044,977",
      title: "Katz's order ticket (smudged)",
      text: 'TABLE 12 — pastrami on rye, pickles, cel-ray\nTABLE 13 — "Same as him"\nTABLE 14 — "Same as THEM" (pointing at 13)\nTABLE 15 — "Whatever everybody\'s having"\nTABLE 16 — "Send a salami to my boy in the army" (a soldier\'s mother, Sunday regular)\n\nNote to kitchen: EVERYONE is having the pastrami. Nobody is having anything else. It is the end of the world and they want pastrami. Brine the whole walk-in. — Irv',
    });

    // ---------------- walk-in freezer (x −6..2, z −26..−18) ----------------
    const FB = [-6.1, -0.2, -26.1, 2.1, 3.2, -17.9];
    K.room(b, ctx, {
      x0: -6,
      z0: -26,
      x1: 2,
      z1: -18,
      y: 0,
      h: 3.0,
      floor: "metal",
      fc: [0.72, 0.78, 0.82],
      wall: "metal",
      wc: [0.75, 0.82, 0.86],
      ceil: "metal",
      cc: [0.6, 0.66, 0.7],
      trim: false,
      surface: "metal",
    });
    b.boxMM("steel", 1.8, 0, -22.9, 2.3, 2.4, -21.1, {
      tint: [0.7, 0.75, 0.78],
    }); // heavy door frame (kitchen side)
    for (let x = -5.2; x < 1.4; x += 1.3) {
      b.pipe("steel", x, 2.9, -24.5, x, 2.9, -19.5, 0.03, 4);
      for (let z = -24; z < -19.5; z += 1.5) {
        b.pipe("steel", x, 2.9, z, x, 2.5, z, 0.01, 3);
        b.geo("meat", K.sphereGeo(), {
          x,
          y: 1.75,
          z,
          sx: 0.32,
          sy: 0.75,
          sz: 0.25,
          tint: [0.75, 0.6, 0.58],
        });
      }
    }
    for (let k = 0; k < 8; k++)
      b.hplate(
        "decal",
        -5.5 + r() * 7,
        0.012 + k * 0.0005,
        -25.5 + r() * 7,
        1.4,
        1.4,
        r() * 6,
        K.decal("grime", k + 20),
        { tint: [0.8, 0.9, 1.0] },
      );
    b.light(-2, 2.7, -22, [0.55, 0.75, 1.0], 1.1, 7, { box: FB });
    b.glow(-2, 2.9, -22, [0.35, 0.5, 0.65], 1.8);
    K.skel(ctx, -5.2, 0, -25.2, 0.7, "curled");
    K.loot(ctx, "fridge", -5.5, 0, -19, HP, {
      loot: "food_oldworld",
      name: "Frozen Stock",
    });
    K.note(ctx, "pv_note_katz_freezer", -4.9, 0.05, -24.8, {
      name: "Note (frozen stiff)",
      title: "Scratched on the back of a menu",
      text: "Locked myself in the walk-in when the flash came. Thick walls, I figured. Cold keeps things fresh, I figured.\n\nDay 3. It is very fresh in here.\n\nIf you find me, tell Irv the brisket order is short two cases and it WASN'T me.\n— Sol, grill",
    });

    // ---------------- back stairs (x 11.8..13.2, z −36..−26) down to the basement ----------------
    const SB = [11.6, BY - 0.2, -36.1, 14.1, 3.8, -25.9];
    K.room(b, ctx, {
      x0: 11.6,
      z0: -36,
      x1: 14,
      z1: -26,
      y: BY,
      h: 3.8 - BY,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "brick_brown",
      wc: [0.6, 0.48, 0.4],
      ceil: "concrete",
      cc: [0.4, 0.38, 0.36],
      trim: false,
    });
    b.boxMM("concrete", 11.6, -0.3, -27.4, 14, 0, -26, {
      tint: [0.55, 0.53, 0.5],
    });
    b.col(11.6, -0.3, -27.4, 14, 0, -26, { tag: "floor" });
    K.stairs(b, 11.8, -34.2, 13.8, -27.4, BY, 0, "+z", {
      mat: "concrete",
      tint: [0.55, 0.53, 0.5],
      rail: "l",
      railMat: "rust",
      handMat: "rust",
    });
    K.lamp(b, 12.8, 2.6, -27, "cage", [1, 0.7, 0.4], 0.7, 6, {
      ceil: 3.8,
      lightOpts: { box: SB },
    });
    K.lamp(b, 12.8, BY + 2.6, -35, "cage", [1, 0.7, 0.4], 0.5, 5, {
      ceil: BY + 3.6,
      lightOpts: { box: SB },
    });
    b.plate(
      "decal",
      11.72,
      1.2,
      -31,
      1,
      0,
      2.4,
      0.9,
      K.tag("TURN BACK", "#e04030", 256, 96),
    );

    // ---------------- basement ----------------
    const BB = [-14.1, BY - 0.2, -36.1, 11.7, -0.2, -5.9];
    K.gap(ctx, 11.6, -35.1, 1.6, BY, 2.4); // stair room → basement
    K.gap(ctx, -12.8, -6, 1.6, BY, 3.8); // basement → west stairs up to the hall
    K.gap(ctx, 6, -12, 1.2, BY, 2.3); // → office
    K.room(b, ctx, {
      x0: -14,
      z0: -36,
      x1: 11.6,
      z1: -6,
      y: BY,
      h: 3.5,
      floor: "concrete",
      fc: [0.52, 0.5, 0.46],
      wall: "brick_brown",
      wc: [0.58, 0.46, 0.38],
      ceil: "concrete",
      cc: [0.36, 0.35, 0.33],
      noCeil: true,
      trim: false,
    });
    // ceiling with the west stair hole
    b.face("concrete", -12, -0.3, -36, 1, 0, 0, 0, 0, 1, 23.6, 30, {
      uv: "top",
      tint: [0.36, 0.35, 0.33],
    });
    b.face("concrete", -14, -0.3, -36, 1, 0, 0, 0, 0, 1, 2, 25, {
      uv: "top",
      tint: [0.36, 0.35, 0.33],
    });
    b.face("concrete", -14, -0.3, -11, 1, 0, 0, 0, 0, 1, 0.4, 5, {
      uv: "top",
      tint: [0.36, 0.35, 0.33],
    });
    // west stairs back up (x −13.6..−12, rising +z from z −11 to −3)
    K.stairs(b, -13.6, -11, -12, -3, BY, 0, "+z", {
      mat: "concrete",
      tint: [0.5, 0.48, 0.45],
      rail: "r",
      railMat: "rust",
      handMat: "rust",
      solid: false,
      thick: 0.4,
    });
    b.col(-14, BY, -11, -13.6, 0, -3, { tag: "wall" });
    K.segWall(b, -12, -6, -12, -3, BY, -0.3, 1, {
      mat: "brick_brown",
      tint: [0.5, 0.4, 0.34],
      trim: false,
    });
    K.segWall(b, -13.6, -6, -13.6, -3, BY, -0.3, -1, {
      mat: "brick_brown",
      tint: [0.5, 0.4, 0.34],
      trim: false,
      col: false,
    });
    b.face("concrete", -13.6, -0.3, -6, 1, 0, 0, 0, 0, 1, 1.6, 0.01, {
      uv: "top",
    });
    // columns + beams
    for (let x = -8; x <= 8; x += 8)
      for (let z = -30; z <= -12; z += 9) {
        b.boxMM("concrete", x - 0.3, BY, z - 0.3, x + 0.3, -0.3, z + 0.3, {
          tint: [0.5, 0.48, 0.45],
        });
        b.col(x - 0.3, BY, z - 0.3, x + 0.3, -0.3, z + 0.3, {});
      }
    for (let z = -33; z <= -9; z += 4.5)
      b.beam("rust", -14, -0.5, z, 11.6, -0.5, z, 0.2, 0.3, {
        tint: [0.5, 0.4, 0.32],
      });
    b.pipe("rust", -13.8, -0.9, -36, -13.8, -0.9, -6, 0.1, 6);
    b.pipe("metal", 11.4, -0.8, -36, 11.4, -0.8, -12, 0.06, 6, {
      tint: [0.4, 0.45, 0.4],
    });
    // storage: pickle barrels, crates, cured meats
    for (let k = 0; k < 14; k++) {
      const x = -3 + (k % 7) * 0.8,
        z = -34.8 + Math.floor(k / 7) * 0.8;
      b.cyl("wood", x, BY, z, 0.34, 0.34, 0.95, 10, {
        tint: [0.55, 0.42, 0.3],
      });
      b.cyl("rust", x, BY + 0.25, z, 0.35, 0.35, 0.05, 10, { top: false });
      b.cyl("rust", x, BY + 0.7, z, 0.35, 0.35, 0.05, 10, { top: false });
    }
    b.col(-3.4, BY, -35.2, 2.2, BY + 0.95, -33.6, {});
    b.plate(
      "art",
      -0.2,
      BY + 1.9,
      -35.88,
      0,
      1,
      1.4,
      0.4,
      K.signCell("katz_pickles", "FULL SOURS · HALF SOURS", 384, 96, {
        bg: "#20301c",
        fg: "#e8e0b0",
        font: "Arial, sans-serif",
      }),
    );
    K.shelf(b, 4.5, BY, -35.6, 0, 3.4, {
      mat: "wood",
      items: ["jar", "jar", "jar", "can"],
      seed: 31,
    });
    K.shelf(b, 8.5, BY, -35.6, 0, 3.4, {
      mat: "wood",
      items: ["box", "jar", "can"],
      seed: 32,
    });
    for (let x = 3; x < 10.5; x += 0.45) {
      b.pipe("fabric", x, -0.5, -32.5, x, -1.0, -32.5, 0.005, 3);
      b.cyl("salami", x, -1.6 - r() * 0.3, -32.5, 0.06, 0.06, 0.6, 6, {
        tint: [0.8, 0.5, 0.4],
      });
    }
    // brine room: three giant tanks
    for (const tx of [3.5, 6.5, 9.5]) {
      b.cyl("steel", tx, BY, -27, 1.1, 1.1, 2.6, 16, {
        tint: [0.5, 0.55, 0.52],
      });
      b.col(tx - 1.0, BY, -28, tx + 1.0, BY + 2.6, -26, {});
      b.pipe("rust", tx, BY + 2.6, -27, tx, -0.4, -27, 0.07, 5);
    }
    // lights (flickery bulbs)
    for (const [x, z, i] of [
      [5, -30, 0.8],
      [5, -18, 0.7],
      [-5, -18, 0.5],
      [0, -33, 0.6],
      [9, -8, 0.6],
    ])
      K.lamp(b, x, -1.0, z, "bulb", [1, 0.72, 0.4], i, 7, {
        ceil: -0.3,
        lightOpts: { box: BB },
      });
    // the NEST (west half): egg sacs, slime, bones, the sewer breach
    for (let k = 0; k < 22; k++)
      b.hplate(
        "decal",
        -13.5 + r() * 10,
        BY + 0.012 + k * 0.0004,
        -35 + r() * 26,
        1.4 + r() * 1.4,
        1.4 + r() * 1.4,
        r() * 6,
        K.decal(k % 4 === 0 ? "blood" : "roach", k + 30),
      );
    for (let k = 0; k < 28; k++) {
      // egg clusters on walls & floor
      const x = -13.4 + r() * 8,
        z = -35 + r() * 22,
        y = BY + (r() < 0.5 ? 0 : r() * 2);
      b.geo("flat", K.sphereGeo(), {
        x,
        y: y + 0.12,
        z,
        sx: 0.14 + r() * 0.1,
        sy: 0.1,
        sz: 0.12,
        tint: [0.8, 0.74, 0.5],
      });
    }
    // the queen's throne: a mound of salami ends, rags and resin, crowned with glowing egg sacs
    for (let k = 0; k < 16; k++) {
      const a = r() * PI * 2,
        d = r() * 2.2;
      b.geo("flat", K.sphereGeo(), {
        x: -11 + Math.cos(a) * d,
        y: BY - 0.1,
        z: -30.5 + Math.sin(a) * d,
        sx: 0.7 + r() * 0.6,
        sy: 0.35 + r() * 0.4 * (1 - d / 2.4),
        sz: 0.6 + r() * 0.5,
        tint: [0.35, 0.3, 0.2],
      });
    }
    for (let k = 0; k < 7; k++) {
      const a = k * 0.9,
        x = -11 + Math.cos(a) * 1.1,
        z = -30.5 + Math.sin(a) * 1.1;
      b.geo("lamp", K.sphereGeo(), {
        x,
        y: BY + 0.55,
        z,
        sx: 0.22,
        sy: 0.3,
        sz: 0.2,
        tint: [0.55, 0.6, 0.25],
      });
      b.glow(x, BY + 0.6, z, [0.45, 0.6, 0.2], 0.7);
    }
    for (let k = 0; k < 8; k++) {
      const x = -12 + r() * 3,
        z = -32 + r() * 3;
      b.cyl("salami", x, BY + 0.2 + r() * 0.4, z, 0.06, 0.06, 0.5, 6, {
        tint: [0.6, 0.35, 0.3],
      });
    }
    b.col(-12.6, BY, -32, -9.4, BY + 0.5, -29, {
      tag: "rubble",
      surface: "rubble",
    });
    b.light(-11, BY + 1.2, -30.5, [0.6, 0.8, 0.3], 0.8, 5, { box: BB });
    for (let k = 0; k < 10; k++)
      b.pipe(
        "bone",
        -12 + r() * 6,
        BY + 0.05,
        -30 + r() * 12,
        -12 + r() * 6,
        BY + 0.05,
        -30 + r() * 12,
        0.03,
        4,
      );
    K.rubble(b, -12.6, BY, -34.2, 2.6, 1.6, { seed: 5 });
    b.boxMM("paint_black", -13.95, BY, -31, -13.9, BY + 2.2, -28.4, {
      tint: [0.03, 0.03, 0.03],
      faces: "e",
    }); // breach into the sewer
    b.hplate(
      "decal",
      -12.4,
      BY + 0.02,
      -29.7,
      3.2,
      3.6,
      0.3,
      K.decal("hotspot", 1),
    );
    b.light(-12.6, BY + 0.6, -29.7, [0.35, 1.0, 0.3], 1.4, 7, { box: BB });
    b.glow(-12.6, BY + 0.4, -29.7, [0.3, 0.9, 0.25], 3.2);
    b.light(-10, BY + 2.4, -24, [1, 0.6, 0.3], 0.35, 6, { box: BB });
    K.skel(ctx, -9.5, BY, -31.5, 2.2, "reaching");
    K.skel(ctx, -11.8, BY, -26.6, 0.4, "lying");
    K.note(ctx, "pv_reel_exterminator", -9.2, BY + 0.03, -31.1, {
      type: "tape",
      name: "Tape Reel: Exterminator's Log",
      title: "Big Apple Pest Control — Job #4471 (Katz's)",
      text: "Day 1: Standard infestation. Giant roaches in the sub-basement. Big ones, but I've seen big ones.\n\nDay 2: Found the egg sacs. Hundreds. Something is laying them, and it isn't a regular roach. There's a trail as wide as my arm.\n\nDay 3: Saw her. She's the size of a Checker cab. The little ones bring her salami. They BRING her salami.\n\nDay 3, later: Out of spray. Out of luck. If you're hearing this, aim for the head and don't let them get behind you. And for God's sake don't eat anything down here.",
    });
    // office (x 1..11.6, z −12..−6)
    const OB = [0.9, BY - 0.2, -12.1, 11.7, -0.2, -5.9];
    K.room(b, ctx, {
      x0: 1,
      z0: -12,
      x1: 11.6,
      z1: -6,
      y: BY + 0.03,
      h: 3.25,
      floor: "wood",
      fc: [0.5, 0.4, 0.32],
      wall: "wallpaper_green",
      wc: [0.6, 0.62, 0.5],
      wain: "wood_dark",
      wainC: panel,
      ceil: "plaster",
      cc: [0.45, 0.44, 0.4],
      surface: "wood",
    });
    const dt = K.table(b, 8.4, BY, -9.8, 1.8, 0.9, { mat: "mahogany" });
    K.chair(b, 8.4, BY, -8.9, 0, { mat: "leather" });
    K.terminal(ctx, "pv_term_katz", 8.9, dt, -10.0, 0, termOffice(), "bare");
    K.lamp(b, 7.8, dt + 0.35, -10.0, "pendant", [1, 0.85, 0.6], 0.8, 4.5, {
      ceil: dt + 0.45,
      shade: "paint_green",
      lightOpts: { box: OB },
    });
    b.box("brass", 7.8, dt, -10.0, 0.15, 0.4, 0.15, {});
    K.shelf(b, 11.35, BY, -9, -HP, 2.6, {
      mat: "wood_dark",
      items: ["book", "box", "book"],
      h: 2.2,
      seed: 41,
    });
    K.framed(
      b,
      4,
      BY + 2.0,
      -11.88,
      0,
      1,
      1.4,
      1.0,
      K.photo("deli", 20, 192, 144),
      { frame: "gold" },
    );
    K.salonWall(b, 1.2, 5.2, BY + 1.3, BY + 3.0, -6.12, 0, -1, "katz_office", {
      photos: "deli",
      density: 1,
    });
    K.lamp(b, 5, BY + 3.0, -9, "bulb", [1, 0.8, 0.55], 0.6, 5, {
      ceil: BY + 3.3,
      lightOpts: { box: OB },
    });
    K.anchor(ctx, "ledger", 8.0, dt + 0.02, -9.6);
    K.loot(ctx, "safe", 1.2, BY, -7, HP, {
      loot: "safe",
      lock: LK.safe,
      name: "Katz Family Safe",
      tag: "safe",
    });
    K.loot(ctx, "file_cabinet", 1.3, BY, -10.9, HP, { loot: "file_cabinet" });
    K.loot(ctx, "desk", 4.2, BY, -11.4, 0, { loot: "desk" });

    // ---------------- doors & anchors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pv_katz_in",
      pos: new THREE.Vector3(DOOR_X, 1.3, Z1 + 0.35),
      label: "Katz's Delicatessen",
      verb: "Enter",
      target: { x: OX + 10, y: OY, z: OZ - 1.2, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("katz_deli")),
    });
    K.door(ctx, {
      id: "pv_katz_out",
      pos: new THREE.Vector3(OX + 10, OY + 1.3, OZ - 0.35),
      label: "East Houston Street",
      verb: "Leave",
      target: { x: DOOR_X, y: 0, z: Z1 + 1.8, yaw: PI },
    });
    K.anchor(ctx, "entrance", 10, 0, -1.2);
    K.anchor(ctx, "queen", -9.5, BY, -28);
    K.anchor(ctx, "boss", -9.5, BY, -28);
    const roaches = [
      [-6, BY, -24],
      [-4, BY, -32],
      [-11, BY, -20],
      [-0.7, BY, -30.2],
      [3, BY, -15],
    ];
    roaches.forEach((p, i) =>
      K.anchor(ctx, "roach" + (i + 1), p[0], p[1], p[2]),
    );
    const sp = [
      [-4, 0, -9],
      [4, 0, -14],
      [8, 0, -22],
      [-2, 0, -22],
      [2, BY, -20],
      [-6, BY, -14],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 1.2, BY, -7);
    K.anchor(ctx, "loot2", -5.5, 0, -19);
    K.anchor(ctx, "hoard", -12.2, BY, -32.5);
    K.loot(ctx, "ammo_box", -12.2, BY, -32.5, 0.4, {
      loot: "ammo_box",
      name: "Exterminator's Kit",
    });
    K.loot(ctx, "duffle_bag", -10.4, BY, -33.4, 1.2, {
      loot: "skeleton",
      name: "Exterminator's Bag",
    });
    K.loot(ctx, "cash_register", 7.2, 1.1, -1.6, PI, {
      loot: "cash_register",
      name: "Cashier's Register",
    });
    K.loot(ctx, "first_aid", 13.9, 1.3, -23, -HP, { loot: "first_aid" });
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_katz_int";
  }

