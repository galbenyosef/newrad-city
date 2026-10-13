// play-inline-316 04 — tint
// Lines 953-2036 of readable/play-inline-316.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "am_int",
      off: O,
      lit: true,
      amb: [0.11, 0.1, 0.09],
      floors: [0, BY, MEZ],
      grime: 0.4,
    });
    const r = K.rng("am_int");
    const HB = [-14.1, -0.3, -22.1, 14.1, HALL_H + 0.2, 0.1];
    const cream = [0.9, 0.86, 0.76];
    // ---------------- HALL ----------------
    K.gap(ctx, -13, -22, 1.2, 0, 2.4); // hall → kitchen (service door)
    K.room(b, ctx, {
      x0: -14,
      z0: -22,
      x1: 14,
      z1: 0,
      y: 0,
      h: HALL_H,
      floor: "hextile",
      fc: [0.86, 0.84, 0.8],
      wall: "plaster",
      wc: cream,
      wain: "marble",
      wainC: [0.85, 0.82, 0.76],
      wainH: 1.4,
      ceil: "tin",
      cc: [0.78, 0.72, 0.58],
      noFloor: true,
      cornice: true,
      corniceMat: "plaster",
      trimMat: "bronze",
    });
    // floor with the SE stair hole (x 11.2..13.8, z −6.5..−1)
    const fl = (x0, z0, x1, z1) => {
      b.face("hextile", x0, 0, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.86, 0.84, 0.8],
      });
      b.col(x0, -0.3, z0, x1, 0, z1, { tag: "floor" });
    };
    fl(-14, -22, 11.2, 0);
    fl(11.2, -22, 14, -6.5);
    fl(11.2, -1, 14, 0);
    fl(13.8, -6.5, 14, -1);
    K.railing(b, 11.2, -6.5, 11.2, -1, 0, {
      h: 1.0,
      mat: "bronze",
      handMat: "brass",
    });
    K.railing(b, 11.2, -1, 13.8, -1, 0, {
      h: 1.0,
      mat: "bronze",
      handMat: "brass",
    });
    b.plate(
      "art",
      12.5,
      2.2,
      -0.12,
      0,
      -1,
      1.8,
      0.35,
      K.signCell("am_down", "COMMISSARY ↓ STAFF", 384, 64, {
        bg: "#121212",
        fg: "#e8d080",
      }),
    );
    // entrance: revolving drum from inside + exit
    b.cyl("glass_clear", 0, 0, -0.9, 1.2, 1.2, 2.6, 16, {
      top: false,
      arc0: 0.3,
      arc: PI - 0.6,
      tint: [0.7, 0.8, 0.8],
    });
    b.cyl("bronze", 0, 2.6, -0.9, 1.3, 1.3, 0.3, 16, {
      tint: [0.5, 0.38, 0.2],
    });
    b.plate("lamp", 0, 1.3, -0.1, 0, -1, 2.2, 2.4, null, {
      tint: [0.4, 0.42, 0.36],
    });
    b.light(0, 1.6, -1.5, [0.6, 0.64, 0.5], 0.5, 5, { box: HB });
    // ---- the AUTOMAT WALL (north, z = −22) ----
    const WZ = -21.9,
      NCOL = 24,
      NROW = 5,
      CX0 = -12,
      CW = 1.0,
      RY0 = 0.95,
      RH = 0.5;
    b.boxMM("marble", -12.3, 0, WZ, 12.3, RY0, WZ + 0.35, {
      tint: [0.35, 0.3, 0.28],
    }); // dado
    b.boxMM(
      "chrome",
      -12.3,
      RY0 + NROW * RH,
      WZ,
      12.3,
      RY0 + NROW * RH + 0.35,
      WZ + 0.3,
      { tint: [0.8, 0.82, 0.84] },
    );
    b.col(-12.3, 0, WZ - 0.1, 12.3, RY0 + NROW * RH + 0.35, WZ + 0.35, {
      tag: "wall",
    });
    for (let i = 0; i <= NCOL; i++)
      b.boxMM(
        "chrome",
        CX0 + i * CW - 0.03,
        RY0,
        WZ,
        CX0 + i * CW + 0.03,
        RY0 + NROW * RH,
        WZ + 0.22,
        { tint: [0.82, 0.84, 0.86] },
      );
    for (let j = 0; j <= NROW; j++)
      b.boxMM(
        "chrome",
        CX0,
        RY0 + j * RH - 0.03,
        WZ,
        CX0 + NCOL * CW,
        RY0 + j * RH + 0.03,
        WZ + 0.22,
        { tint: [0.82, 0.84, 0.86] },
      );
    for (let i = 0; i < NCOL; i++)
      for (let j = 0; j < NROW; j++) {
        const sec = Math.floor(i / 3),
          x = CX0 + i * CW + CW / 2,
          y = RY0 + j * RH + RH / 2;
        const empty = r() < 0.35,
          open = r() < 0.12;
        // back of the compartment (food or empty) + glass door
        if (empty)
          b.plate(
            "paint_black",
            x,
            y - 0.02,
            WZ + 0.02,
            0,
            1,
            CW - 0.12,
            RH - 0.12,
            null,
            { tint: [0.1, 0.09, 0.08] },
          );
        else
          b.plate(
            "art",
            x,
            y - 0.02,
            WZ + 0.02,
            0,
            1,
            CW - 0.12,
            RH - 0.12,
            foodCell(sec),
            { tint: [0.9, 0.9, 0.88] },
          );
        if (open) {
          b.quad(
            "glass",
            [x - 0.44, y - 0.2, WZ + 0.22],
            [x - 0.44, y - 0.2, WZ + 0.72],
            [x - 0.44, y + 0.2, WZ + 0.72],
            [x - 0.44, y + 0.2, WZ + 0.22],
            { tint: [0.6, 0.66, 0.68] },
          );
        } else if (r() < 0.1)
          b.plate(
            "decal",
            x,
            y,
            WZ + 0.2,
            0,
            1,
            CW - 0.12,
            RH - 0.12,
            K.decal("crack", (i + j) % 6),
          );
        else
          b.plate(
            "glass_clear",
            x,
            y,
            WZ + 0.21,
            0,
            1,
            CW - 0.12,
            RH - 0.12,
            null,
            { tint: [0.75, 0.82, 0.82] },
          );
        b.cyl("chrome", x + 0.38, y - 0.02, WZ + 0.22, 0.03, 0.03, 0.06, 6); // knob (vertical stub)
        b.box("brass", x - 0.3, y + 0.16, WZ + 0.22, 0.12, 0.08, 0.03, {
          tint: [0.7, 0.55, 0.3],
        }); // coin slot plate
      }
    // section labels + the big sign above the wall
    for (let s = 0; s < 8; s++) {
      const fd = FOODS[s],
        x = CX0 + s * 3 + 1.5;
      b.light(x, 2.2, WZ + 0.5, [1, 0.92, 0.72], 0.45, 2.6, { box: HB }); // the little bulbs behind each section
      b.plate(
        "art",
        x,
        RY0 + NROW * RH + 0.18,
        WZ + 0.31,
        0,
        1,
        2.8,
        0.28,
        K.signCell("am_lab_" + s, fd.label + " · " + fd.price + "¢", 384, 40, {
          bg: "#121212",
          fg: "#e8d080",
          font: "Georgia, serif",
          weather: false,
        }),
      );
    }
    b.plate(
      "art",
      0,
      RY0 + NROW * RH + 1.3,
      WZ + 0.05,
      0,
      1,
      16,
      1.0,
      bandCell(),
    );
    b.plate(
      "neon",
      0,
      RY0 + NROW * RH + 2.5,
      WZ + 0.06,
      0,
      1,
      7,
      0.9,
      K.neonCell("am_neon_in", "AUTOMAT", 768, 128, {
        color: "#ff3a28",
        font: "Georgia, serif",
      }),
    );
    b.glow(0, RY0 + NROW * RH + 2.5, WZ + 0.8, [1, 0.3, 0.2], 5);
    b.light(0, 4.5, -19, [1, 0.45, 0.35], 0.8, 9, { box: HB });
    b.light(-6, 2.2, -19.5, [1, 0.9, 0.7], 0.6, 6, { box: HB });
    b.light(6, 2.2, -19.5, [1, 0.9, 0.7], 0.6, 6, { box: HB });
    // service door (west end of the wall)
    b.boxMM("stainless", -13.6, 0, WZ + 0.02, -12.4, 2.4, WZ + 0.06, {
      tint: [0.7, 0.72, 0.74],
    });
    b.plate(
      "art",
      -13,
      2.65,
      WZ + 0.1,
      0,
      1,
      1.2,
      0.25,
      K.signCell("am_staff", "KITCHEN · STAFF", 256, 48, {
        bg: "#121212",
        fg: "#e8d080",
      }),
    );
    // ---- change booth (centre) ----
    {
      const bx = 0,
        bz = -9;
      b.cyl("marble", bx, 0, bz, 1.6, 1.6, 1.15, 20, {
        tint: [0.4, 0.34, 0.3],
      });
      b.cyl("bronze", bx, 1.15, bz, 1.66, 1.66, 0.06, 20, {
        tint: [0.6, 0.45, 0.25],
      });
      b.cyl("glass_clear", bx, 1.21, bz, 1.55, 1.55, 1.1, 20, {
        top: false,
        tint: [0.7, 0.8, 0.8],
      });
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * PI * 2;
        b.pipe(
          "bronze",
          bx + Math.cos(a) * 1.56,
          1.21,
          bz + Math.sin(a) * 1.56,
          bx + Math.cos(a) * 1.56,
          2.31,
          bz + Math.sin(a) * 1.56,
          0.02,
          4,
        );
      }
      b.cyl("bronze", bx, 2.31, bz, 1.8, 1.2, 0.5, 20, {
        tint: [0.5, 0.38, 0.2],
      });
      b.plate(
        "art",
        bx,
        2.56,
        bz + 1.52,
        0,
        1,
        1.6,
        0.3,
        K.signCell("am_change", "CHANGE", 256, 48, {
          bg: "#121212",
          fg: "#e8d080",
          font: "Georgia, serif",
        }),
      );
      b.plate(
        "art",
        bx,
        2.56,
        bz - 1.52,
        0,
        -1,
        1.6,
        0.3,
        K.signCell("am_change", "CHANGE", 256, 48, {
          bg: "#121212",
          fg: "#e8d080",
          font: "Georgia, serif",
        }),
      );
      b.cyl("marble", bx, 1.15, bz + 1.5, 0.35, 0.35, 0.04, 10, {
        tint: [0.9, 0.88, 0.8],
      }); // the famous worn marble dish
      b.col(bx - 1.6, 0, bz - 1.6, bx + 1.6, 2.8, bz + 1.6, {});
      b.light(bx, 2.1, bz, [1, 0.85, 0.6], 0.7, 4, { box: HB });
      K.anchor(ctx, "nell", bx, 0, bz + 2.1);
    }
    // ---- coffee bar with the dolphin spouts (west wall, north of the stair) ----
    b.boxMM("marble", -14, 0, -21.4, -12.9, 1.05, -17, {
      tint: [0.4, 0.34, 0.3],
    });
    b.boxMM("marble", -14, 1.05, -21.5, -12.8, 1.12, -16.9, {
      tint: [0.9, 0.88, 0.82],
    });
    b.col(-14, 0, -21.5, -12.8, 1.12, -16.9, { tag: "counter" });
    b.boxMM("marble", -14, 1.12, -21.4, -13.8, 3.2, -17, {
      tint: [0.85, 0.82, 0.76],
    });
    for (let k = 0; k < 3; k++) {
      const z = -20.6 + k * 1.4;
      b.geo("brass", K.sphereGeo(), {
        x: -13.6,
        y: 2.0,
        z,
        sx: 0.16,
        sy: 0.12,
        sz: 0.12,
        tint: [0.8, 0.62, 0.32],
      }); // dolphin head
      b.pipe("brass", -13.6, 1.95, z, -13.25, 1.72, z, 0.035, 6, {
        tint: [0.8, 0.62, 0.32],
      }); // snout spout
      b.geo("brass", K.sphereGeo(), {
        x: -13.72,
        y: 2.12,
        z,
        sx: 0.06,
        sy: 0.14,
        sz: 0.04,
        tint: [0.8, 0.62, 0.32],
      }); // fin
      b.cyl("brass", -13.6, 2.2, z, 0.05, 0.02, 0.15, 6);
      b.cyl("ceramic", -13.2, 1.12, z, 0.05, 0.04, 0.09, 8);
    }
    b.plate(
      "art",
      -13.78,
      2.8,
      -19.2,
      1,
      0,
      2.6,
      0.4,
      K.signCell("am_coffee", "COFFEE · 5¢ · FRESH EVERY 20 MINUTES", 512, 64, {
        bg: "#121212",
        fg: "#e8d080",
      }),
    );
    b.light(-12.6, 2.4, -19.2, [1, 0.8, 0.5], 0.7, 4, { box: HB });
    for (let k = 0; k < 4; k++)
      b.cyl("ceramic", -13.3, 1.12 + k * 0.08, -17.4, 0.06, 0.05, 0.08, 8, {
        tint: [0.95, 0.94, 0.9],
      });
    // ---- steam-table counter (east wall) with Penny behind ----
    b.boxMM("stainless", 10.6, 0, -19.5, 11.6, 0.95, -8, {
      tint: [0.8, 0.82, 0.84],
    });
    b.boxMM("steel", 10.5, 0.95, -19.6, 11.7, 1.02, -7.9, {
      tint: [0.7, 0.72, 0.74],
    });
    b.col(10.5, 0, -19.6, 11.7, 1.02, -7.9, { tag: "counter" });
    for (let z = -18.5; z < -8.5; z += 1.3) {
      b.boxMM("steel", 10.7, 1.02, z - 0.5, 11.5, 1.12, z + 0.5, {
        tint: [0.55, 0.57, 0.6],
      });
      b.cyl("flat", 11.1, 1.06, z, 0.3, 0.3, 0.07, 10, {
        tint: r.pick([
          [0.6, 0.35, 0.2],
          [0.8, 0.7, 0.3],
          [0.4, 0.5, 0.3],
          [0.7, 0.6, 0.5],
        ]),
      });
      b.glow(11.1, 1.3, z, [0.4, 0.38, 0.35], 0.8);
    }
    b.quad(
      "glass_clear",
      [10.55, 1.02, -19.5],
      [10.55, 1.02, -8],
      [10.75, 1.6, -8],
      [10.75, 1.6, -19.5],
      { tint: [0.7, 0.75, 0.75] },
    );
    b.plate("art", 13.86, 3.2, -13.8, -1, 0, 4.2, 3.1, menuCell());
    K.shelf(b, 13.7, 0, -18.5, -HP, 2.6, {
      mat: "stainless",
      items: ["jar", "can", "box"],
      seed: 211,
      h: 1.8,
    });
    b.light(12.6, 3.0, -13.5, [1, 0.85, 0.6], 0.8, 6, { box: HB });
    K.anchor(ctx, "penny", 12.8, 0, -13.5);
    // ---- tables: marble tops on pedestals, bentwood chairs ----
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 5; col++) {
        const tx = -9 + col * 4.2,
          tz = -18.5 + row * 4;
        if (Math.abs(tx) < 2.5 && tz > -12.5) continue; // clear of the booth
        K.roundTable(b, tx, 0, tz, 0.55, {
          mat: "marble",
          tint: [0.9, 0.88, 0.84],
        });
        for (let k = 0; k < 3; k++) {
          const a = (k / 3) * PI * 2 + r() * 0.5;
          const fallen = r() < 0.12;
          K.chair(
            b,
            tx + Math.cos(a) * 0.95,
            0,
            tz + Math.sin(a) * 0.95,
            HP - a,
            { mat: "wood_dark", fallen },
          );
        }
        if (r() < 0.6) {
          b.cyl("ceramic", tx + 0.15, 0.76, tz, 0.12, 0.1, 0.02, 10);
          b.cyl("ceramic", tx - 0.2, 0.76, tz + 0.1, 0.05, 0.04, 0.09, 8);
        }
      }
    // mezzanine along the south wall (y 4.2, z −5..0) with stair up the west wall
    b.boxMM("marble", -14, MEZ - 0.3, -5, 14, MEZ, 0, {
      tint: [0.8, 0.76, 0.7],
      faces: "nsewtb",
    });
    b.col(-14, MEZ - 0.3, -5, 14, MEZ, 0, { tag: "floor" });
    K.railing(b, -12.3, -5, 14, -5, MEZ, {
      h: 1.0,
      mat: "bronze",
      handMat: "brass",
    });
    K.stairs(b, -14, -16.2, -12.4, -5, 0, MEZ, "+z", {
      mat: "marble",
      tint: [0.8, 0.76, 0.7],
      rail: "l",
      railMat: "bronze",
      handMat: "brass",
      solid: false,
      thick: 0.3,
    });
    for (const x of [-10.5, -5.5, 5.5, 9.5]) {
      b.boxMM("marble", x - 0.25, 0, -5.2, x + 0.25, MEZ - 0.3, -4.7, {
        tint: [0.85, 0.82, 0.76],
      });
      b.col(x - 0.25, 0, -5.2, x + 0.25, MEZ - 0.3, -4.7, {});
    }
    for (const tx of [-8, -3, 4, 9]) {
      K.roundTable(b, tx, MEZ, -2.4, 0.5, {
        mat: "marble",
        tint: [0.9, 0.88, 0.84],
      });
      K.chair(b, tx, MEZ, -1.5, 0, { mat: "wood_dark" });
      K.chair(b, tx, MEZ, -3.3, PI, { mat: "wood_dark" });
    }
    K.anchor(ctx, "pembroke", -8, MEZ, -1.5);
    K.anchor(ctx, "mezzanine", 0, MEZ, -2.5);
    // stained glass from inside (additive over black): above the mezzanine
    b.plate("paint_black", 0, MEZ + 2.2, -0.14, 0, -1, 21.6, 3.6, null, {
      tint: [0.02, 0.02, 0.02],
    });
    b.plate(
      "neon",
      0,
      MEZ + 2.2,
      -0.15,
      0,
      -1,
      21.5,
      3.55,
      stainedCell("neon"),
      { tint: [0.9, 0.85, 0.75] },
    );
    for (let x = -10; x <= 10.1; x += 5) {
      b.light(x, MEZ + 2.2, -1.2, [1, 0.7, 0.35], 0.8, 7, { box: HB });
    }
    // lights: deco globe pendants + wall sconces
    for (let x = -9; x <= 9; x += 6)
      for (const z of [-17, -11])
        K.lamp(
          b,
          x,
          5.6,
          z,
          "globe",
          [1, 0.86, 0.62],
          x === 3 && z === -11 ? 0 : 0.8,
          8,
          {
            ceil: HALL_H,
            size: 0.28,
            dead: x === 3 && z === -11,
            lightOpts: { box: HB },
          },
        );
    // wear & tear, settlers' touches
    K.litter(b, -13, -21, 10, -1, 0, 20, 5);
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -12 + r() * 22,
        0.012 + k * 0.0005,
        -20 + r() * 18,
        1 + r(),
        1 + r(),
        r() * 6,
        K.decal(k % 3 ? "grime" : "puddle", k + 60),
      );
    b.plate(
      "art",
      -13.86,
      5.5,
      -11,
      1,
      0,
      3.6,
      1.0,
      K.signCell(
        "am_rules",
        "HOUSE RULES: NO GUNS OUT · NO FIGHTING\nPAY THE ROBOT · BUS YOUR TABLE",
        512,
        140,
        { bg: "#d8ccb0", fg: "#2a2a20", font: "Arial, sans-serif" },
      ),
    );
    K.loot(ctx, "fizzo_machine", 13.2, 0, -3.2, HP, { loot: "fizzo_machine" });

    // ---------------- KITCHEN (x −14..14, z −34..−22) ----------------
    const KB = [-14.1, -0.3, -34.1, 14.1, 4.4, -21.9];
    K.room(b, ctx, {
      x0: -14,
      z0: -34,
      x1: 14,
      z1: -22,
      y: 0,
      h: 4.2,
      floor: "checker",
      fc: [0.66, 0.64, 0.6],
      wall: "subway_tile",
      wc: [0.86, 0.86, 0.8],
      ceil: "plaster",
      cc: [0.55, 0.54, 0.5],
      noFloor: true,
      trim: false,
    });
    const kf = (x0, z0, x1, z1) => {
      b.face("checker", x0, 0, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.66, 0.64, 0.6],
      });
      b.col(x0, -0.3, z0, x1, 0, z1, { tag: "floor" });
    };
    kf(-14, -34, 11.2, -22);
    kf(11.2, -26, 14, -22);
    kf(13.8, -34, 14, -26);
    K.railing(b, 11.2, -26, 11.2, -33.8, 0, {
      h: 1.0,
      mat: "steel",
      handMat: "steel",
    });
    // backs of the compartments (open boxes with trays) right behind the wall
    b.boxMM("steel", -12.3, 0, -22.7, 12.3, 0.9, -22.1, {
      tint: [0.55, 0.57, 0.6],
    });
    for (let i = 0; i < NCOL; i++)
      for (let j = 0; j < NROW; j++) {
        const x = CX0 + i * CW + CW / 2,
          y = RY0 + j * RH + RH / 2;
        b.plate("paint_black", x, y, -22.12, 0, -1, CW - 0.1, RH - 0.1, null, {
          tint: [0.06, 0.06, 0.06],
        });
        if (r() < 0.4)
          b.box("steel", x, y - 0.2, -22.3, 0.7, 0.03, 0.3, {
            tint: [0.6, 0.62, 0.64],
          });
      }
    for (let i = 0; i <= NCOL; i++)
      b.boxMM(
        "steel",
        CX0 + i * CW - 0.04,
        RY0,
        -22.3,
        CX0 + i * CW + 0.04,
        RY0 + NROW * RH,
        -22.1,
        { tint: [0.55, 0.57, 0.6] },
      );
    b.light(0, 2.5, -23.2, [1, 0.9, 0.7], 0.5, 8, { box: KB });
    // ovens, kettles, coffee urns, pie racks, prep tables
    for (let k = 0; k < 4; k++) {
      const x = -12 + k * 2.4;
      b.boxMM("steel", x - 1.1, 0, -33.9, x + 1.1, 1.9, -32.6, {
        tint: [0.5, 0.52, 0.55],
      });
      b.plate("paint_black", x, 1.0, -32.58, 0, 1, 1.6, 0.8, null, {
        tint: [0.1, 0.1, 0.1],
      });
      b.beam("chrome", x - 0.7, 1.5, -32.5, x + 0.7, 1.5, -32.5, 0.04, 0.04);
      b.glow(x, 0.6, -32.5, [1, 0.4, 0.15], 0.5);
    }
    b.col(-13.2, 0, -33.9, -2.3, 1.9, -32.6, {});
    b.boxMM("steel", -13, 1.9, -33.9, -3, 2.2, -32.4, {
      tint: [0.45, 0.47, 0.5],
    }); // hood
    for (const x of [0, 2.4]) {
      b.cyl("steel", x, 0, -32.8, 0.8, 0.7, 1.1, 14, {
        tint: [0.6, 0.62, 0.65],
      });
      b.cyl("flat", x, 1.06, -32.8, 0.7, 0.7, 0.02, 14, {
        tint: [0.6, 0.5, 0.3],
      });
      b.col(x - 0.8, 0, -33.6, x + 0.8, 1.1, -32, {});
      b.glow(x, 1.4, -32.8, [0.4, 0.4, 0.38], 1.2);
    }
    for (const x of [5.5, 7.2]) {
      b.cyl("brass", x, 0.9, -33.3, 0.45, 0.4, 1.4, 14, {
        tint: [0.75, 0.58, 0.3],
      });
      b.cyl("brass", x, 2.3, -33.3, 0.4, 0.1, 0.35, 14, {
        tint: [0.75, 0.58, 0.3],
      });
      b.boxMM("steel", x - 0.5, 0, -33.8, x + 0.5, 0.9, -32.8, {
        tint: [0.5, 0.52, 0.55],
      });
    } // coffee urns
    b.col(4.9, 0, -33.8, 7.8, 2.6, -32.8, {});
    b.plate(
      "art",
      6.35,
      3.2,
      -33.88,
      0,
      1,
      2.2,
      0.35,
      K.signCell("am_urns", "COFFEE · DRAWN FRESH · 20 MIN", 384, 64, {
        bg: "#121212",
        fg: "#e8d080",
      }),
    );
    for (const z of [-29.5, -26.5]) {
      K.table(b, -6, 0, z, 6, 1.1, { mat: "steel", tint: [0.65, 0.67, 0.7] });
      for (let k = 0; k < 6; k++) {
        const px = -8.5 + k,
          pz = z + (r() - 0.5) * 0.5;
        if (r() < 0.6) {
          b.cyl("ceramic", px, 0.76, pz, 0.18, 0.18, 0.02, 10);
          b.cyl("flat", px, 0.78, pz, 0.15, 0.15, 0.05, 10, {
            tint: [0.75, 0.5, 0.25],
          });
        }
      }
    }
    for (const x of [2, 4.5]) {
      for (let j = 0; j < 6; j++) {
        b.boxMM(
          "steel",
          x - 0.5,
          0.2 + j * 0.3,
          -30.2,
          x + 0.5,
          0.22 + j * 0.3,
          -29.2,
          { tint: [0.6, 0.62, 0.64] },
        );
        if (r() < 0.6)
          b.cyl(
            "flat",
            x + (r() - 0.5) * 0.4,
            0.22 + j * 0.3,
            -29.7,
            0.16,
            0.16,
            0.04,
            10,
            { tint: [0.72, 0.5, 0.26] },
          );
      }
      for (const dx of [-0.5, 0.5])
        for (const dz of [-30.2, -29.2])
          b.pipe("steel", x + dx, 0, dz, x + dx, 2, dz, 0.015, 4);
      b.col(x - 0.5, 0, -30.2, x + 0.5, 2, -29.2, {});
    }
    b.plate(
      "art",
      3.3,
      2.4,
      -30.25,
      0,
      -1,
      2,
      0.3,
      K.signCell("am_pies", "PIE RACK — ROTATE STOCK", 256, 48, {
        bg: "#e8e0c8",
        fg: "#2a2a20",
      }),
    );
    b.boxMM("stainless", 8.2, 0, -33.9, 11.0, 1.0, -32.9, {
      tint: [0.75, 0.78, 0.8],
    });
    b.col(8.2, 0, -33.9, 11.0, 1.0, -32.9, {}); // sinks
    for (const x of [-11, -3, 5])
      K.lamp(b, x, 3.6, -28, "tube", [0.92, 0.95, 1.0], x === -3 ? 0 : 0.9, 8, {
        ceil: 4.2,
        len: 1.6,
        dead: x === -3,
        lightOpts: { box: KB },
      });
    K.loot(ctx, "fridge", -13.4, 0, -24, HP, {
      loot: "fridge",
      name: "Walk-in Cooler",
    });
    K.loot(ctx, "locker", -13.5, 0, -27.5, HP, {
      loot: "locker",
      name: "Cook's Locker",
    });
    K.note(ctx, "ph_am_note_recipe", -6.4, 0.77, -26.3, {
      name: "Recipe Card: Baked Beans",
      title: "Penny & Price — Baked Beans (commissary card #3)",
      text: 'BAKED BEANS, IN THE CROCK (serves 400)\n\nNavy beans, soaked overnight. Molasses, the dark kind. Salt pork. Mustard. Onion, whole, one per crock, removed before serving so no one ever knows it was there.\n\nBake low. Bake long. Never hurry beans; beans remember.\n\n(pencil, in a different hand:) 1971 — no molasses. Used Fizzo Cola. Customers said it was "the best they ever had." Customers are so hungry now they would eat the crock. — H.',
    });
    // ---------------- stairs kitchen → basement (x 11.2..13.8, z −33.8..−26) ----------------
    K.stairs(b, 11.3, -33.8, 13.8, -26, BY, 0, "+z", {
      mat: "concrete",
      tint: [0.55, 0.53, 0.5],
      rail: "r",
      railMat: "rust",
      handMat: "rust",
      solid: false,
      thick: 0.3,
    });
    // ---------------- stairs basement → hall (x 11.2..13.8, z −6.5..−1) ----------------
    K.stairs(b, 11.3, -6.5, 13.8, -1, BY, 0, "-z", {
      mat: "concrete",
      tint: [0.55, 0.53, 0.5],
      rail: "r",
      railMat: "rust",
      handMat: "rust",
      solid: false,
      thick: 0.3,
    });

    // ---------------- BASEMENT COMMISSARY (y −4.2) ----------------
    const BB = [-14.1, BY - 0.2, -34.1, 14.1, -0.2, 0.1];
    K.room(b, ctx, {
      x0: -14,
      z0: -34,
      x1: 14,
      z1: 0,
      y: BY,
      h: 3.9,
      floor: "concrete",
      fc: [0.5, 0.49, 0.46],
      wall: "brick_brown",
      wc: [0.6, 0.5, 0.42],
      ceil: "concrete",
      cc: [0.36, 0.35, 0.33],
      noCeil: true,
      trim: false,
    });
    // ceiling (with stair holes)
    const cf = (x0, z0, x1, z1) =>
      b.face("concrete", x0, -0.3, z0, 1, 0, 0, 0, 0, 1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.36, 0.35, 0.33],
      });
    cf(-14, -34, 11.2, 0);
    cf(11.2, -26, 14, -6.5);
    cf(11.2, -1, 14, 0);
    for (const x of [-8, 6])
      for (let z = -28; z <= -6; z += 7.3) {
        b.boxMM("concrete", x - 0.3, BY, z - 0.3, x + 0.3, -0.3, z + 0.3, {
          tint: [0.5, 0.48, 0.45],
        });
        b.col(x - 0.3, BY, z - 0.3, x + 0.3, -0.3, z + 0.3, {});
      }
    for (let z = -32; z <= -2; z += 5)
      b.beam("rust", -14, -0.55, z, 11.2, -0.55, z, 0.2, 0.3, {
        tint: [0.5, 0.4, 0.32],
      });
    // the MASTER CAROUSEL: a great wheel of food drums feeding pneumatic tubes up to the wall
    {
      const mx = -1,
        mz = -21.5;
      b.boxMM("concrete", mx - 3, BY, mz - 1.4, mx + 3, BY + 0.5, mz + 1.4, {
        tint: [0.45, 0.44, 0.42],
      });
      b.geo("steel", K.unitCyl(24), {
        x: mx,
        y: BY + 2.0,
        z: mz,
        sx: 1.5,
        sy: 0.3,
        sz: 1.5,
        rx: HP,
        tint: [0.55, 0.57, 0.6],
      });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * PI * 2;
        b.geo("brass", K.unitCyl(10), {
          x: mx + Math.cos(a) * 1.2,
          y: BY + 2.0 + Math.sin(a) * 1.2,
          z: mz,
          sx: 0.28,
          sy: 0.9,
          sz: 0.28,
          rx: HP,
          tint: [0.75, 0.58, 0.3],
        });
      }
      b.geo("steel", K.unitCyl(10), {
        x: mx,
        y: BY + 2.0,
        z: mz,
        sx: 0.15,
        sy: 1.8,
        sz: 0.15,
        rx: HP,
      });
      for (const dx of [-1.8, 1.8])
        b.boxMM(
          "black_iron",
          mx + dx - 0.15,
          BY + 0.5,
          mz - 0.3,
          mx + dx + 0.15,
          BY + 2.2,
          mz + 0.3,
          {},
        );
      for (let k = 0; k < 6; k++) {
        const px = mx - 2.5 + k;
        b.pipe("brass", px, BY + 3.0, mz, px, -0.3, mz - 0.5, 0.09, 8, {
          tint: [0.72, 0.55, 0.3],
        });
      }
      b.pipe("brass", mx - 2.5, BY + 3.0, mz, mx + 2.5, BY + 3.0, mz, 0.12, 8, {
        tint: [0.72, 0.55, 0.3],
      });
      b.boxMM(
        "paint_red",
        mx + 2.6,
        BY + 0.5,
        mz + 0.8,
        mx + 3.1,
        BY + 1.6,
        mz + 1.3,
        { tint: [0.6, 0.12, 0.1] },
      ); // crank housing
      b.plate(
        "art",
        mx,
        BY + 0.8,
        mz + 1.42,
        0,
        1,
        3.4,
        0.4,
        K.signCell(
          "am_carousel",
          "MASTER CAROUSEL · PNEUMATIC NICKEL SYSTEM",
          512,
          64,
          { bg: "#2a2a20", fg: "#e0d080", font: "Arial, sans-serif" },
        ),
      );
      b.col(mx - 3, BY, mz - 1.4, mx + 3.1, BY + 3.2, mz + 1.4, {});
      K.anchor(ctx, "carousel", mx + 2.85, BY, mz + 1.6);
      b.light(mx, BY + 3.2, mz + 2, [1, 0.72, 0.4], 0.8, 7, { box: BB });
    }
    // stores: sacks, crates, shelves of cans, a pie freezer, flour
    for (let k = 0; k < 10; k++)
      b.box(
        "fabric",
        -12.6 + (k % 5) * 0.8,
        BY + Math.floor(k / 5) * 0.45,
        -32.8 + (k % 2) * 0.3,
        0.7,
        0.45,
        0.5,
        { yaw: r() * 0.3, tint: [0.82, 0.78, 0.66] },
      );
    b.col(-13, BY, -33.2, -8.6, BY + 0.9, -32.1, {});
    b.plate(
      "art",
      -10.8,
      BY + 1.6,
      -33.88,
      0,
      1,
      2.6,
      0.4,
      K.signCell("am_flour", "FLOUR · SUGAR · BEANS · COFFEE", 512, 64, {
        bg: "#d8ccb0",
        fg: "#2a2a20",
      }),
    );
    for (const x of [-5, 0, 5])
      K.shelf(b, x, BY, -33.6, 0, 3.6, {
        mat: "metal",
        items: ["can", "can", "jar", "box"],
        seed: 300 + x,
        h: 2.4,
      });
    for (const z of [-14, -8])
      K.shelf(b, -13.6, BY, z, HP, 4, {
        mat: "wood",
        items: ["can", "box", "jar"],
        seed: 320 + z,
        h: 2.2,
      });
    for (let k = 0; k < 6; k++) {
      const cx = 3 + (k % 3) * 1.1,
        cz = -12 + Math.floor(k / 3) * 1.1;
      b.box("wood", cx, BY + (k > 2 ? 0 : 0), cz, 1.0, 0.8, 1.0, {
        yaw: r() * 0.2,
        tint: [0.6, 0.5, 0.36],
      });
    }
    b.col(2.4, BY, -12.6, 6.8, BY + 0.8, -10.3, {});
    // giant roach nest in the south-west
    for (let k = 0; k < 16; k++)
      b.hplate(
        "decal",
        -13 + r() * 9,
        BY + 0.012 + k * 0.0004,
        -8 + r() * 7,
        1.2 + r() * 1.4,
        1.2 + r() * 1.4,
        r() * 6,
        K.decal(k % 4 === 0 ? "blood" : "roach", k + 70),
      );
    for (let k = 0; k < 18; k++)
      b.geo("flat", K.sphereGeo(), {
        x: -13 + r() * 6,
        y: BY + 0.12 + (r() < 0.3 ? r() * 1.5 : 0),
        z: -7 + r() * 6,
        sx: 0.14 + r() * 0.1,
        sy: 0.1,
        sz: 0.12,
        tint: [0.8, 0.74, 0.5],
      });
    b.boxMM("paint_black", -13.95, BY, -4.5, -13.9, BY + 1.6, -2.4, {
      tint: [0.03, 0.03, 0.03],
      faces: "e",
    }); // breach to the sewer
    K.rubble(b, -12.6, BY, -3.4, 1.4, 0.9, { seed: 41 });
    K.skel(ctx, -9.4, BY, -4.6, 1.8, "curled");
    K.note(ctx, "ph_am_reel_night", -9.0, BY + 0.03, -4.1, {
      type: "tape",
      name: "Tape reel: Night Porter",
      title: "Penny & Price — night porter's recorder",
      text: "(a clatter; the whirr of a big wheel turning)\n\nNight porter, Penny & Price, Thirty-Fourth and Broadway. It's — what is it — 4 A.M. the sixth. The radio says stay indoors. Penny's still upstairs, loading the wall. I told him nobody's coming. He said \"Then the food will be very fresh when they do.\"\n\nThe carousel's jammed. Nickel return's backed up with something — no. Roaches. In the tubes. Big as your hand and they are NOT scared of me.\n\nIf the wall ever stops, it's the carousel. Grease the drive, clear the tubes, throw the crank. Tell Penny I tried.",
    });
    // lighting
    for (const [x, z, i] of [
      [-6, -30, 0.6],
      [6, -30, 0.7],
      [-6, -12, 0.35],
      [6, -18, 0.6],
      [0, -4, 0.4],
      [12.5, -14, 0.5],
    ])
      K.lamp(b, x, -1.0, z, "bulb", [1, 0.72, 0.4], i, 7, {
        ceil: -0.3,
        lightOpts: { box: BB },
      });
    b.light(-12.5, BY + 0.6, -3.5, [0.35, 1.0, 0.3], 0.8, 5, { box: BB });
    b.glow(-12.6, BY + 0.4, -3.4, [0.3, 0.8, 0.25], 1.6);
    K.loot(ctx, "footlocker", 13.3, BY, -20, HP, {
      loot: "footlocker",
      name: "Porter's Chest",
    });
    K.loot(ctx, "toolbox", -1, BY, -18.6, PI, {
      loot: "toolbox",
      items: [
        ["dry_cell", 1],
        ["scrap_metal", 2],
      ],
    });
    K.loot(ctx, "fridge", 13.4, BY, -23, HP, {
      loot: "food_oldworld",
      name: "Pie Freezer",
      items: [["ph_am_pie", 2]],
    });

    // ---------------- doors & anchors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "ph_am_in",
      pos: new THREE.Vector3(0, 1.3, AZ1 + 0.05),
      label: "Penny & Price Automat",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 2.4, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("automat")),
    });
    K.door(ctx, {
      id: "ph_am_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.4),
      label: "23rd Street",
      verb: "Leave",
      target: { x: 0, y: 0, z: AZ1 + 2.6, yaw: PI },
    });
    K.anchor(ctx, "entrance", 0, 0, -2.4);
    K.anchor(ctx, "settler1", -5, 0, -13);
    K.anchor(ctx, "settler2", 3.6, 0, -18.5);
    K.anchor(ctx, "npc1", -5, 0, -13);
    K.anchor(ctx, "npc2", 3.6, 0, -18.5);
    K.anchor(ctx, "merchant", 12.8, 0, -13.5);
    const roaches = [
      [-10, BY, -6],
      [-7, BY, -2.5],
      [-11, BY, -10],
      [4, BY, -26],
      [-6, BY, -24],
    ];
    roaches.forEach((p, i) =>
      K.anchor(ctx, "roach" + (i + 1), p[0], p[1], p[2]),
    );
    const sp = [
      [-9, BY, -6],
      [4, BY, -26],
      [-6, BY, -24],
      [8, BY, -8],
      [-4, 0, -26],
      [6, 0, -30],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 13.3, BY, -20);
    K.anchor(ctx, "loot2", -13.4, 0, -24);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_automat_int";
    ctx.wallZ = WZ;
    buildInteractables(ctx);
  }

  // ==================================================================
  // INTERACTABLES: automat sections, coffee, the carousel crank
  // ==================================================================
