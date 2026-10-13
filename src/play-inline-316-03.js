// play-inline-316 03 — tint
// Lines 290-952 of readable/play-inline-316.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "am_ext", grime: 0.55, seg: 4 });
    const r = K.rng("am_ext");
    const marble = [0.92, 0.9, 0.84],
      brick = [0.85, 0.78, 0.66];
    // body (brick sides & back, marble front)
    b.face("brick_tan", AX1, 0, AZ1, 0, 0, -1, 0, 1, 0, AZ1 - AZ0, FH, {
      tint: brick,
    }); // east
    b.face("brick_tan", AX0, 0, AZ0, 0, 0, 1, 0, 1, 0, AZ1 - AZ0, FH, {
      tint: brick,
    }); // west
    b.face("brick_tan", AX1, 0, AZ0, -1, 0, 0, 0, 1, 0, AX1 - AX0, FH, {
      tint: [0.75, 0.68, 0.58],
    }); // back
    b.face(
      "concrete_dark",
      AX0,
      FH,
      AZ1,
      1,
      0,
      0,
      0,
      0,
      -1,
      AX1 - AX0,
      AZ1 - AZ0,
      { uv: "top", tint: [0.5, 0.48, 0.45] },
    );
    b.col(AX0, 0, AZ0, AX1, FH, AZ1, { tag: "building" });
    // FRONT (z = AZ1): marble frame, pilasters, storefront, stained glass
    const F = AZ1;
    b.face("marble", AX0, 0, F, 1, 0, 0, 0, 1, 0, AX1 - AX0, FH, {
      tint: marble,
    });
    b.boxMM("granite", AX0 - 0.3, 0, F, AX1 + 0.3, 0.8, F + 0.3, {
      tint: [0.16, 0.15, 0.16],
    });
    // pilasters (fluted) + capitals
    for (const px of [-15, -12, 12, 15]) {
      b.boxMM("marble", px - 0.7, 0.8, F, px + 0.7, FH - 0.4, F + 0.45, {
        tint: [0.95, 0.93, 0.88],
      });
      for (let k = -2; k <= 2; k++)
        b.boxMM(
          "marble",
          px + k * 0.24 - 0.06,
          1.2,
          F + 0.45,
          px + k * 0.24 + 0.06,
          FH - 1.6,
          F + 0.5,
          { tint: [0.78, 0.76, 0.7] },
        );
      for (let k = 0; k < 3; k++)
        b.boxMM(
          "bronze",
          px - 0.8 - k * 0.1,
          FH - 1.5 + k * 0.3,
          F,
          px + 0.8 + k * 0.1,
          FH - 1.3 + k * 0.3,
          F + 0.55 + k * 0.08,
          { tint: [0.55, 0.42, 0.24] },
        );
    }
    // storefront (ground): display windows + recessed entrance + revolving door
    for (const [x0, x1] of [
      [-11, -3.2],
      [3.2, 11],
    ]) {
      b.boxMM("bronze", x0, 0.8, F + 0.02, x1, 1.1, F + 0.25, {
        tint: [0.5, 0.38, 0.2],
      });
      b.plate(
        "glass",
        (x0 + x1) / 2,
        2.8,
        F + 0.05,
        0,
        1,
        x1 - x0 - 0.2,
        3.3,
        null,
        { tint: [0.35, 0.4, 0.4] },
      );
      for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 3)
        b.boxMM("bronze", x - 0.07, 0.8, F + 0.02, x + 0.07, 4.6, F + 0.2, {
          tint: [0.5, 0.38, 0.2],
        });
      b.boxMM("bronze", x0, 4.45, F + 0.02, x1, 4.6, F + 0.22, {
        tint: [0.5, 0.38, 0.2],
      });
      // window display: stacked pies / cakes on tiers (seen through the glass)
      for (let k = 0; k < 4; k++) {
        const cx = x0 + 1 + (k * (x1 - x0 - 2)) / 3;
        b.cyl("chrome", cx, 1.1, F - 0.6, 0.35, 0.35, 0.03, 10);
        b.cyl("flat", cx, 1.14, F - 0.6, 0.28, 0.28, 0.08, 10, {
          tint: [0.75, 0.5, 0.25],
        });
      }
      if (x0 < 0) {
        b.plate(
          "decal",
          (x0 + x1) / 2 + 1.5,
          2.6,
          F + 0.07,
          0,
          1,
          1.6,
          1.4,
          K.decal("crack", 5),
        );
      } else
        for (let k = 0; k < 4; k++)
          b.beam(
            "wood_rotten",
            x0 + 0.2,
            1.4 + k * 0.8,
            F + 0.28,
            x1 - 0.2,
            1.6 + k * 0.75,
            F + 0.28,
            0.25,
            0.05,
            { tint: [0.6, 0.52, 0.42] },
          );
    }
    // entrance recess (x −3.2..3.2)
    b.boxMM("paint_black", -3.2, 0.8, F - 1.5, 3.2, 4.6, F - 1.45, {
      tint: [0.05, 0.05, 0.05],
    });
    b.boxMM("marble", -3.2, 0, F - 1.5, 3.2, 0.16, F, {
      tint: [0.8, 0.78, 0.72],
    });
    b.boxMM("marble", -3.3, 0.8, F - 1.5, -3.1, 4.6, F, { tint: marble });
    b.boxMM("marble", 3.1, 0.8, F - 1.5, 3.3, 4.6, F, { tint: marble });
    b.col(-3.3, 0, F - 1.5, -3.1, 4.6, F, {});
    b.col(3.1, 0, F - 1.5, 3.3, 4.6, F, {});
    // revolving door: glass drum, 4 bronze wings, canopy
    b.cyl("glass_clear", 0, 0.16, F - 1.1, 1.2, 1.2, 2.6, 16, {
      top: false,
      arc0: 0.3,
      arc: PI - 0.6,
      tint: [0.7, 0.8, 0.8],
    });
    b.cyl("glass_clear", 0, 0.16, F - 1.1, 1.2, 1.2, 2.6, 16, {
      top: false,
      arc0: PI + 0.3,
      arc: PI - 0.6,
      tint: [0.7, 0.8, 0.8],
    });
    b.cyl("bronze", 0, 2.76, F - 1.1, 1.3, 1.3, 0.35, 16, {
      tint: [0.5, 0.38, 0.2],
    });
    for (let k = 0; k < 4; k++) {
      const a = k * HP + 0.4;
      b.beam(
        "bronze",
        0,
        1.4,
        F - 1.1,
        Math.cos(a) * 1.15,
        1.4,
        F - 1.1 + Math.sin(a) * 1.15,
        0.05,
        2.4,
        { tint: [0.5, 0.38, 0.2] },
      );
    }
    b.pipe("bronze", 0, 0.16, F - 1.1, 0, 2.8, F - 1.1, 0.06, 6);
    b.plate(
      "art",
      0,
      4.05,
      F - 1.43,
      0,
      1,
      5.4,
      0.6,
      K.signCell("am_entry", "ENTRANCE · OPEN ALL NIGHT", 512, 64, {
        bg: "#121212",
        fg: "#e8d080",
        font: "Georgia, serif",
      }),
    );
    // AUTOMAT marquee canopy
    b.boxMM("bronze", -11.5, 4.7, F, 11.5, 5.5, F + 2.4, {
      tint: [0.35, 0.28, 0.18],
    });
    b.boxMM("paint_black", -11.4, 4.62, F + 0.1, 11.4, 4.7, F + 2.3, {
      tint: [0.08, 0.07, 0.06],
    });
    const am = K.neonCell("am_neon", "AUTOMAT", 768, 128, {
      color: "#ff3a28",
      font: "Georgia, serif",
      weight: "bold",
      broken: 1,
    });
    b.plate("lamp", 0, 5.1, F + 2.42, 0, 1, 22.8, 0.72, null, {
      tint: [0.12, 0.1, 0.08],
    });
    b.plate("neon", 0, 5.1, F + 2.44, 0, 1, 9.6, 0.72, am);
    for (const s of [-1, 1])
      b.plate(
        "neon",
        s * 11.52,
        5.1,
        F + 1.2,
        s,
        0,
        2.2,
        0.6,
        K.neonCell("am_neon_s", "FOOD 5¢", 256, 80, { color: "#ffe060" }),
      );
    b.glow(0, 5.1, F + 3.2, [1, 0.25, 0.15], 8);
    for (let x = -11.2; x <= 11.2; x += 0.8)
      b.glow(x, 4.58, F + 2.3, [1, 0.8, 0.5], r() < 0.3 ? 0.2 : 0.45);
    for (const s of [-1, 1])
      b.beam(
        "black_iron",
        s * 10.5,
        5.4,
        F + 2.3,
        s * 10.5,
        8.5,
        F + 0.1,
        0.07,
        0.07,
      );
    // the great stained-glass window (x −11..11, y 5.8..11.8)
    b.boxMM("bronze", -11.2, 5.7, F - 0.05, 11.2, 12.0, F + 0.12, {
      tint: [0.45, 0.34, 0.2],
    });
    b.plate("art", 0, 8.8, F + 0.14, 0, 1, 21.6, 5.9, stainedCell("art"), {
      tint: [0.95, 0.95, 0.95],
    });
    for (let x = -11; x <= 11.01; x += 22 / 6)
      b.boxMM("bronze", x - 0.09, 5.7, F + 0.12, x + 0.09, 12.0, F + 0.3, {
        tint: [0.5, 0.38, 0.2],
      });
    b.boxMM("bronze", -11.2, 8.7, F + 0.12, 11.2, 8.85, F + 0.3, {
      tint: [0.5, 0.38, 0.2],
    });
    b.glow(-4, 9, F + 0.6, [0.9, 0.6, 0.2], 3);
    b.glow(4, 9, F + 0.6, [0.9, 0.6, 0.2], 3); // warm light behind the glass (settlement lamps)
    // PENNY & PRICE band + parapet + fan crest
    b.boxMM("granite", AX0 - 0.2, 12.1, F, AX1 + 0.2, FH, F + 0.4, {
      tint: [0.1, 0.1, 0.1],
    });
    b.plate("art", 0, 12.75, F + 0.42, 0, 1, 22, 1.2, bandCell());
    b.boxMM("marble", AX0 - 0.3, FH, F - 0.3, AX1 + 0.3, FH + 1.2, F + 0.5, {
      tint: marble,
    });
    for (let k = 0; k < 4; k++)
      b.boxMM(
        "marble",
        -5 + k * 0.9,
        FH + 1.2 + k * 0.5,
        F - 0.2,
        5 - k * 0.9,
        FH + 1.7 + k * 0.5,
        F + 0.45,
        { tint: [0.95, 0.93, 0.88] },
      );
    b.plate(
      "art",
      0,
      FH + 2.1,
      F + 0.47,
      0,
      1,
      3.2,
      1.2,
      K.signCell("am_crest", "H & H", 256, 96, {
        bg: "#e8e2d2",
        fg: "#8a6a30",
        font: "Georgia, serif",
      }),
    );
    // corner blade sign (SE)
    {
      const bx = AX1 + 0.9,
        bz = F - 0.8;
      b.box("enamel_cream", bx, 5.8, bz, 1.5, 8.2, 0.4, {
        yaw: HP,
        tint: [0.9, 0.86, 0.75],
      });
      const vt = K.neonCell("am_vert", "AUTOMAT", 128, 768, {
        color: "#ff2a1a",
        vertical: true,
        font: "Georgia, serif",
      });
      b.plate("neon", bx, 9.9, bz - 0.21, 0, -1, 1.2, 7.6, vt);
      b.plate("neon", bx, 9.9, bz + 0.21, 0, 1, 1.2, 7.6, vt);
      b.glow(bx, 9.9, bz + 1, [1, 0.25, 0.15], 6);
      for (const y of [7, 13])
        b.beam("black_iron", bx, y, bz, AX1 - 0.02, y, bz, 0.08, 0.08);
    }
    // ghost ads on the side walls
    b.plate(
      "decal",
      AX1 + 0.03,
      9,
      20,
      1,
      0,
      18,
      5,
      K.signCell(
        "am_mother",
        "GOOD FOOD AT A FAIR PRICE\nPENNY & PRICE RETAIL SHOPS",
        1024,
        256,
        {
          bg: null,
          fg: "rgba(240,228,200,0.8)",
          font: "Georgia, serif",
          weather: true,
        },
      ),
    );
    b.plate(
      "decal",
      AX0 - 0.03,
      8,
      20,
      -1,
      0,
      16,
      4.5,
      K.signCell("am_nickel", "FRESH FOOD · A NICKEL · AUTOMATIC", 1024, 200, {
        bg: null,
        fg: "rgba(240,228,200,0.75)",
        font: '"Arial Black", sans-serif',
        weather: true,
      }),
    );
    b.plate(
      "decal",
      AX0 - 0.03,
      2,
      26,
      -1,
      0,
      3.2,
      1.2,
      K.tag("EATS INSIDE", "#40d060", 256, 96),
    );
    // back wall: loading door, pipes
    b.boxMM("metal_dark", -3, 0, AZ0 - 0.15, 3, 3.6, AZ0, {
      tint: [0.35, 0.33, 0.3],
    });
    b.pipe("rust", 12, 0, AZ0 - 0.2, 12, FH, AZ0 - 0.2, 0.12, 6);
    b.burn(-12, 13, AZ1, 6, 0.5);
    b.burn(AX0, 4, 14, 5, 0.6);

    // ---------- WEST LOT: bombed-out ruin ----------
    {
      const wx = -29.2;
      b.boxMM("brick_red", wx - 0.4, 0, 4, wx + 0.4, 9, 30, {
        tint: [0.75, 0.6, 0.52],
      });
      for (let z = 4; z < 30; z += 2) {
        const hh = 9 + Math.sin(z * 0.7) * 2 + r() * 2.5;
        b.boxMM("brick_red", wx - 0.4, 9, z, wx + 0.4, hh, z + 2, {
          tint: [0.72, 0.58, 0.5],
        });
      }
      b.col(wx - 0.4, 0, 4, wx + 0.4, 9, 30, {});
      for (let y = 2.8; y < 9; y += 3)
        for (let z = 7; z < 28; z += 4)
          K.window(b, wx + 0.4, y + 0.8, z, 1, 0, 1.2, 1.8, {
            state: r() < 0.4 ? "boarded" : "dark",
            surround: "brick_red",
            surroundTint: [0.6, 0.48, 0.4],
            lintel: 0.15,
          });
      // fire escape clinging on
      for (let y = 3; y < 9; y += 3) {
        b.boxMM("black_iron", wx + 0.4, y, 12, wx + 1.6, y + 0.06, 18, {
          tint: [0.25, 0.2, 0.18],
        });
        K.railing(b, wx + 1.6, 12, wx + 1.6, 18, y, {
          h: 0.9,
          mat: "black_iron",
          handMat: "black_iron",
          col: false,
        });
      }
      b.plate(
        "decal",
        wx + 0.42,
        6,
        22,
        1,
        0,
        8,
        2.6,
        K.signCell("am_ghost_w", "SCHRAFFT'S · CANDIES · SODA", 1024, 200, {
          bg: null,
          fg: "rgba(230,220,190,0.6)",
          font: "Georgia, serif",
          weather: true,
        }),
      );
      K.rubble(b, -24, 0, 12, 4.5, 2.4, { seed: 31 });
      K.rubble(b, -21, 0, 24, 3.6, 1.8, { seed: 32 });
      K.rubble(b, -26.5, 0, 28, 2.4, 1.2, { seed: 33 });
      for (let k = 0; k < 5; k++)
        b.beam(
          "rust",
          -27 + r() * 8,
          0.2,
          6 + r() * 22,
          -27 + r() * 8,
          1.5 + r() * 2,
          6 + r() * 22,
          0.25,
          0.35,
          { tint: [0.5, 0.36, 0.26] },
        );
      b.hplate("rubble", -23, 0.03, 17.5, 13, 27, 0, null, {
        tint: [0.6, 0.57, 0.52],
      });
    }
    // ---------- EAST LOT: the Automat Garden (settler yard) ----------
    {
      const ex0 = 17,
        ex1 = 29.5,
        ez0 = 3.5,
        ez1 = 32;
      b.hplate(
        "dirt",
        (ex0 + ex1) / 2,
        0.03,
        (ez0 + ez1) / 2,
        ex1 - ex0 + 1,
        ez1 - ez0,
        0,
        null,
        { tint: [0.6, 0.55, 0.45] },
      );
      // scrap fence along 6th Ave and 23rd St (gap at the gate)
      const fence = (ax, az, bx, bz) => {
        const len = Math.hypot(bx - ax, bz - az),
          n = Math.ceil(len / 1.3);
        for (let k = 0; k < n; k++) {
          const t0 = k / n,
            t1 = (k + 1) / n,
            h = 2.0 + r() * 0.6;
          const x0 = ax + (bx - ax) * t0,
            z0 = az + (bz - az) * t0,
            x1 = ax + (bx - ax) * t1,
            z1 = az + (bz - az) * t1;
          const mat =
            r() < 0.5 ? "corrugated" : r() < 0.5 ? "rust" : "wood_rotten";
          b.quadN(
            mat,
            [x0, 0, z0],
            [x1, 0, z1],
            [x1, h, z1],
            [x0, h, z0],
            [bz - az, 0, ax - bx].map((v) => v / len),
            { tint: [0.75 + r() * 0.2, 0.7, 0.62] },
          );
          b.quadN(
            mat,
            [x0, 0, z0],
            [x1, 0, z1],
            [x1, h, z1],
            [x0, h, z0],
            [az - bz, 0, bx - ax].map((v) => v / len),
            { tint: [0.6, 0.56, 0.5] },
          );
        }
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          b.pipe(
            "rust",
            ax + (bx - ax) * t,
            0,
            az + (bz - az) * t,
            ax + (bx - ax) * t,
            2.5,
            az + (bz - az) * t,
            0.05,
            5,
          );
        }
        b.col(
          Math.min(ax, bx) - 0.1,
          0,
          Math.min(az, bz) - 0.1,
          Math.max(ax, bx) + 0.1,
          2.4,
          Math.max(az, bz) + 0.1,
          { tag: "fence" },
        );
      };
      fence(ex1, ez0, ex1, ez1); // 6th Ave side
      fence(ex0 + 5, ez1, ex1, ez1); // 23rd St side (gate at x 17..22)
      fence(ex0, ez0, ex1, ez0); // 34th St side
      b.plate(
        "art",
        19.5,
        2.6,
        ez1 + 0.1,
        0,
        1,
        3.2,
        1.1,
        K.signCell(
          "am_garden",
          "AUTOMAT GARDEN\nSAFE ZONE · NO GUNS OUT",
          384,
          128,
          { bg: "#d8ccb0", fg: "#2a4a20", font: '"Arial Black", sans-serif' },
        ),
      );
      b.pipe("rust", 17.9, 0, ez1 + 0.05, 17.9, 3.3, ez1 + 0.05, 0.06, 5);
      b.pipe("rust", 21.1, 0, ez1 + 0.05, 21.1, 3.3, ez1 + 0.05, 0.06, 5);
      // patched canvas awning off the east wall
      b.quad(
        "fabric",
        [AX1 + 0.1, 4.2, 12],
        [AX1 + 0.1, 4.2, 28],
        [AX1 + 7, 3.0, 28],
        [AX1 + 7, 3.0, 12],
        { tint: [0.72, 0.6, 0.45] },
      );
      b.quad(
        "fabric",
        [AX1 + 7, 3.0, 12],
        [AX1 + 7, 3.0, 28],
        [AX1 + 0.1, 4.2, 28],
        [AX1 + 0.1, 4.2, 12],
        { tint: [0.55, 0.45, 0.35] },
      );
      for (const z of [12, 20, 28])
        b.pipe("rust", AX1 + 7, 0, z, AX1 + 7, 3.0, z, 0.05, 5);
      // picnic tables + benches
      for (const [tx, tz] of [
        [19.5, 15],
        [19.5, 22],
        [24.5, 18.5],
        [24.5, 25.5],
      ]) {
        b.boxMM("wood", tx - 1.2, 0.72, tz - 0.4, tx + 1.2, 0.78, tz + 0.4, {
          tint: [0.6, 0.48, 0.35],
        });
        for (const s of [-1, 1]) {
          b.boxMM(
            "wood",
            tx - 1.2,
            0.42,
            tz + s * 0.75 - 0.15,
            tx + 1.2,
            0.47,
            tz + s * 0.75 + 0.15,
            { tint: [0.55, 0.44, 0.32] },
          );
          b.beam(
            "wood",
            tx - 0.9,
            0,
            tz - s * 0.5,
            tx - 0.9,
            0.72,
            tz + s * 0.2,
            0.08,
            0.08,
          );
          b.beam(
            "wood",
            tx + 0.9,
            0,
            tz - s * 0.5,
            tx + 0.9,
            0.72,
            tz + s * 0.2,
            0.08,
            0.08,
          );
        }
        b.col(tx - 1.2, 0, tz - 0.9, tx + 1.2, 0.78, tz + 0.9, {
          tag: "furniture",
        });
        b.cyl("metal", tx + 0.3, 0.78, tz, 0.05, 0.05, 0.12, 6, {
          tint: [0.7, 0.3, 0.2],
        });
      }
      // string lights
      for (let k = 0; k < 3; k++) {
        const z = 14 + k * 6;
        for (let x = AX1 + 0.5; x < ex1 - 0.5; x += 0.9) {
          const sag = Math.sin(((x - AX1) / (ex1 - AX1)) * PI) * 0.5;
          b.glow(x, 4.4 - sag, z, [1, 0.8, 0.45], 0.35);
        }
        b.pipe("black_iron", AX1, 4.5, z, ex1, 4.5, z, 0.008, 3);
      }
      // garden beds (gnarlberry & spuds in tires)
      for (let k = 0; k < 5; k++) {
        const tx = 27.5,
          tz = 6 + k * 2.2;
        b.geo("rubber", new THREE.TorusGeometry(0.45, 0.16, 6, 12), {
          x: tx,
          y: 0.16,
          z: tz,
          rx: HP,
        });
        b.cyl("dirt", tx, 0.05, tz, 0.4, 0.4, 0.2, 10);
        for (let j = 0; j < 4; j++)
          b.beam(
            "flat",
            tx,
            0.25,
            tz,
            tx + (r() - 0.5) * 0.6,
            0.7 + r() * 0.4,
            tz + (r() - 0.5) * 0.6,
            0.06,
            0.02,
            { tint: [0.35, 0.5, 0.2] },
          );
      }
      K.anchor(ctx, "garden", 22, 0, 20, false);
      K.anchor(ctx, "guard_gate", 19.5, 0, 33.2, false);
    }
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_automat_ext";
    K.anchor(ctx, "door", 0, 0, AZ1 + 1.2, false);
    K.loot(ctx, "barrel", 22.5, 0, 9, 0, {
      world: true,
      burning: true,
      container: false,
    });
    K.loot(ctx, "fizzo_machine", 17.6, 0, 30.6, -HP, {
      world: true,
      loot: "fizzo_machine",
    });
    K.loot(ctx, "crate", 28.4, 0, 30.4, 0.3, {
      world: true,
      kind: "fizzo",
      loot: "crate",
    });
    K.loot(ctx, "car", -22, 0, 6.5, 1.3, {
      world: true,
      kind: "coupe",
      burnt: true,
      wreck: true,
    });
    K.loot(ctx, "dumpster", 8, 0, AZ0 - 1.4, 0, {
      world: true,
      loot: "dumpster",
    });
    K.skel(ctx, -19, 0, 18, 2.1, "lying", { world: true });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
