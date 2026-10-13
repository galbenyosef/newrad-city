// play-inline-195 05 — ctx
// Lines 958-2259 of readable/play-inline-195.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "tombs_int",
      off: O,
      lit: true,
      amb: [0.05, 0.05, 0.05],
      floors: TIER.concat([TOPC]),
      grime: 0.6,
    });
    const r = K.rng("tombs_int");
    const tile = [0.72, 0.76, 0.68];

    // ---------------- intake (x −8..8, z −12..0) ----------------
    const IB = [-8.1, -0.2, -12.1, 8.1, 3.8, 0.1];
    K.gap(ctx, 0, 0, 2.4, 0, 3.0);
    K.gap(ctx, 0, -12, 3.0, 0, 3.0);
    K.room(b, ctx, {
      x0: -8,
      z0: -12,
      x1: 8,
      z1: 0,
      y: 0,
      h: 3.6,
      floor: "terrazzo",
      fc: [0.62, 0.6, 0.56],
      wall: "celltile",
      wc: tile,
      wain: "paint_green",
      wainC: [0.3, 0.4, 0.32],
      wainH: 1.2,
      ceil: "plaster",
      cc: [0.5, 0.5, 0.48],
      trimMat: "metal_dark",
    });
    // booking desk with the cage window
    b.boxMM("wood_dark", -7, 0, -8.4, -2.2, 1.1, -7.6, {
      tint: [0.4, 0.3, 0.22],
    });
    b.col(-7, 0, -8.4, -2.2, 1.1, -7.6, { tag: "counter" });
    for (let x = -6.9; x < -2.2; x += 0.14)
      b.pipe("black_iron", x, 1.1, -8.0, x, 3.6, -8.0, 0.012, 4);
    b.plate(
      "art",
      -4.6,
      3.0,
      -7.95,
      0,
      1,
      2.2,
      0.35,
      K.signCell("tombs_booking", "BOOKING — ALL INMATES", 384, 64, {
        bg: "#1a1a1a",
        fg: "#e8e0c0",
        font: "Arial, sans-serif",
      }),
    );
    K.terminal(
      ctx,
      "pv_term_tombs_booking",
      -3.2,
      1.1,
      -8.0,
      PI,
      termBooking(),
      "bare",
    );
    // mugshot wall with a height chart (east wall)
    const chart = K.paint(
      "art",
      "tombs_chart",
      256,
      256,
      function (x, X, Y, W, H) {
        x.fillStyle = "#c8c0a8";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#2a2520";
        x.fillStyle = "#2a2520";
        x.font = "bold 18px Arial";
        for (let k = 0; k < 8; k++) {
          const yy = Y + H - (k * H) / 8;
          x.lineWidth = k % 2 ? 1 : 3;
          x.beginPath();
          x.moveTo(X, yy);
          x.lineTo(X + W, yy);
          x.stroke();
          if (k % 2 === 0) x.fillText(4 + k / 2 + "'", X + 6, yy - 4);
        }
        K.stains(x, X, Y, W, H, 8, 3, 0.4);
      },
    );
    b.plate("art", 7.88, 1.3, -4, -1, 0, 2.6, 2.6, chart);
    for (let k = 0; k < 10; k++)
      K.framed(
        b,
        7.88,
        2.9 + (k % 2) * 0.55,
        -9.8 + k * 0.62,
        -1,
        0,
        0.42,
        0.5,
        K.photo("mug", k),
        { frame: false },
      );
    // metal detector arch
    b.boxMM("metal", -1.4, 0, -4.2, -1.1, 2.3, -3.8, {
      tint: [0.6, 0.62, 0.6],
    });
    b.boxMM("metal", 1.1, 0, -4.2, 1.4, 2.3, -3.8, { tint: [0.6, 0.62, 0.6] });
    b.boxMM("metal", -1.4, 2.3, -4.2, 1.4, 2.6, -3.8, {
      tint: [0.6, 0.62, 0.6],
    });
    b.col(-1.4, 0, -4.2, -1.1, 2.3, -3.8, {});
    b.col(1.1, 0, -4.2, 1.4, 2.3, -3.8, {});
    b.glow(0, 2.45, -3.75, [1, 0.2, 0.15], 0.3);
    // holding cell (west)
    for (let z = -6; z <= -1.6; z += 0.16)
      b.pipe("black_iron", -5, 0, z, -5, 3.0, z, 0.02, 4);
    b.col(-5.05, 0, -6, -4.95, 3.0, -1.6, {
      tag: "interactable_self",
      walkable: false,
    });
    b.boxMM("celltile", -8, 0, -6.1, -5, 3.6, -5.9, { tint: tile });
    b.col(-8, 0, -6.1, -5, 3.6, -5.9, {});
    b.boxMM("metal", -7.8, 0.45, -5.8, -5.4, 0.52, -5.2, {
      tint: [0.5, 0.52, 0.5],
    });
    K.skel(ctx, -6.5, 0, -3.2, 1.2, "sitting");
    // property lockers, raider bedding, fire
    K.loot(ctx, "locker", 7.6, 0, -11.5, -HP, {
      loot: "locker",
      count: 3,
      name: "Inmate Property",
    });
    K.loot(ctx, "locker", 3.2, 0, -11.6, 0, {
      loot: "locker",
      name: "Inmate Property",
    });
    K.loot(ctx, "mattress", 3.5, 0, -7.5, 0.4, { container: false });
    K.loot(ctx, "barrel", 4.5, 0, -3, 0, { burning: true, container: false });
    b.light(4.5, 1.4, -3, [1, 0.55, 0.25], 1.6, 7, { box: IB });
    b.glow(4.5, 1.2, -3, [1, 0.5, 0.2], 1.4);
    K.lamp(b, -3, 3.3, -6, "tube", [0.9, 1, 0.9], 0.6, 7, {
      ceil: 3.6,
      len: 1.4,
      lightOpts: { box: IB },
    });
    K.lamp(b, 3, 3.3, -9, "tube", [0.9, 1, 0.9], 0, 0, {
      ceil: 3.6,
      len: 1.4,
      dead: true,
    });
    b.plate(
      "decal",
      0,
      2.2,
      -11.9,
      0,
      1,
      3.2,
      1.0,
      K.tag("FRESH MEAT →", "#e03020", 256, 96),
      {},
    );
    b.plate(
      "decal",
      -7.88,
      2.0,
      -9,
      1,
      0,
      3.0,
      1.1,
      K.tag("WARDEN MADDOX", "#e0c020", 256, 96),
      {},
    );
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -7 + r() * 14,
        0.012 + k * 0.001,
        -11 + r() * 10,
        1.4,
        1.4,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", k + 70),
      );
    K.litter(b, -7.5, -11.5, 7.5, -0.5, 0, 18, 81);

    // ---------------- the CELL BLOCK (x −10..10, z −44..−12, 0..10.4) ----------------
    const BB = [-10.1, -0.2, -44.1, 10.1, TOPC + 0.2, -11.9];
    K.gap(ctx, 0, -44, 1.6, TIER[0], 2.4);
    K.gap(ctx, 0, -44, 1.6, TIER[1], 2.4);
    K.gap(ctx, 0, -44, 1.6, TIER[2], 2.4);
    const dugZ = CZ0 + DUG_CELL * CW + CW / 2;
    K.gap(ctx, 10, dugZ, 1.1, 0, 2.0, { casing: false });
    K.room(b, ctx, {
      x0: -10,
      z0: -44,
      x1: 10,
      z1: -12,
      y: 0,
      h: TOPC,
      floor: "concrete",
      fc: [0.55, 0.54, 0.5],
      wall: "celltile",
      wc: tile,
      ceil: "metal_dark",
      cc: [0.35, 0.36, 0.34],
      trim: false,
      noCeil: true,
    });
    // ceiling with a skylight strip
    b.face("metal_dark", -10, TOPC, -44, 1, 0, 0, 0, 0, 1, 7, 32, {
      uv: "top",
      tint: [0.35, 0.36, 0.34],
    });
    b.face("metal_dark", 3, TOPC, -44, 1, 0, 0, 0, 0, 1, 7, 32, {
      uv: "top",
      tint: [0.35, 0.36, 0.34],
    });
    b.boxMM("lamp", -3, TOPC + 0.3, -43, 3, TOPC + 0.32, -13, {
      tint: [0.42, 0.46, 0.48],
    });
    for (let z = -43; z <= -13; z += 1.5)
      b.beam("black_iron", -3, TOPC + 0.2, z, 3, TOPC + 0.2, z, 0.08, 0.1);
    for (const x of [-3, 3])
      b.beam("metal_dark", x, TOPC, -44, x, TOPC + 0.3, -12, 0.1, 0.3);
    for (let z = -40; z <= -16; z += 8)
      b.light(0, TOPC - 0.3, z, [0.7, 0.8, 0.9], 1.1, 13, { box: BB });
    b.glow(0, TOPC, -28, [0.3, 0.33, 0.36], 6);
    // cells
    for (const side of [-1, 1])
      for (let tier = 0; tier < 3; tier++)
        for (let i = 0; i < CELLS; i++) {
          const prison = side > 0 && tier === 0 && PRISON_CELLS.indexOf(i) >= 0;
          const dug = side > 0 && tier === 0 && i === DUG_CELL;
          const c = cell(b, ctx, side, tier, i, r, {
            door: prison ? "door" : dug ? "open" : undefined,
          });
          if (prison) {
            const d = doorLeaf(ctx, side, c.y, c.zm, c.z1, c.xf);
            d.cell = i;
            cellDoors.push(d);
            K.anchor(ctx, "prison" + i, c.xf + side * 1.2, c.y, c.zc);
            K.anchor(
              ctx,
              "celldoor" + i,
              c.xf - side * 0.3,
              c.y + 1.2,
              (c.zm + c.z1) / 2,
            );
          }
          if (tier === 0 && side < 0 && i % 3 === 1)
            K.loot(ctx, "footlocker", -9.3, 0, c.zc, HP, {
              loot: "footlocker",
              name: "Cell Stash",
            });
          // light in some cells
          if (r() < 0.25)
            K.lamp(
              b,
              side * 8.2,
              c.y + 2.3,
              c.zc,
              "bulb",
              [1, 0.75, 0.45],
              0.45,
              3.5,
              {
                ceil: c.y + 2.55,
                lightOpts: {
                  box: [
                    Math.min(side * 10, side * 6.4) - 0.1,
                    c.y - 0.1,
                    c.z0,
                    Math.max(side * 10, side * 6.4) + 0.1,
                    c.y + 3,
                    c.z1,
                  ],
                },
              },
            );
        }
    // the dug-through cell: rubble & a hole in the back wall
    b.hplate("decal", 8.5, 0.013, dugZ, 1.8, 2.0, 0.4, K.decal("grime", 90));
    K.rubble(b, 8.9, 0, dugZ - 0.9, 0.6, 0.5, { seed: 7, col: false, n: 3 });
    // tier slabs (cells + catwalks) for tiers 2 & 3, and a top ledge
    for (let t = 1; t < 3; t++) {
      const y = TIER[t];
      for (const side of [-1, 1]) {
        const xa = side * 10,
          xb = side * 5;
        b.boxMM(
          "metal_dark",
          Math.min(xa, xb),
          y - 0.25,
          -44,
          Math.max(xa, xb),
          y,
          -12,
          { tint: [0.45, 0.46, 0.44], faces: "nsewtb" },
        );
        b.col(Math.min(xa, xb), y - 0.25, -44, Math.max(xa, xb), y, -12, {
          tag: "floor",
          surface: "metal",
        });
      }
      // north bridge across the void
      b.boxMM("metal_dark", -5, y - 0.25, -44, 5, y, -42.6, {
        tint: [0.45, 0.46, 0.44],
        faces: "nsewtb",
      });
      b.col(-5, y - 0.25, -44, 5, y, -42.6, { tag: "floor", surface: "metal" });
      K.railing(b, -5, -42.6, 5, -42.6, y, {
        h: 1.05,
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.25,
      });
      // catwalk rails along the void (with gaps where the stairs arrive)
      const gapZ = [-24, -22.4];
      if (t === 1) {
        // tier 2: west rail gap at the S1 landing; east rail gap at the S2 foot
        K.railing(b, -5, -42.6, -5, gapZ[0], y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
        K.railing(b, -5, gapZ[1], -5, -12, y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
        K.railing(b, 5, -42.6, 5, -14.4, y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
      } else {
        // tier 3: west rail full; east rail gap at the S2 landing
        K.railing(b, -5, -42.6, -5, -12, y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
        K.railing(b, 5, -42.6, 5, gapZ[0], y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
        K.railing(b, 5, gapZ[1], 5, -12, y, {
          h: 1.05,
          mat: "black_iron",
          handMat: "black_iron",
          step: 0.25,
        });
      }
      // caged lights under the catwalks
      for (let z = -40; z < -13; z += 6)
        for (const side of [-1, 1])
          K.lamp(
            b,
            side * 5.7,
            y - 0.45,
            z,
            "cage",
            [1, 0.72, 0.42],
            t === 1 ? 0.7 : 0.5,
            6,
            { ceil: y - 0.25, dead: r() < 0.3, lightOpts: { box: BB } },
          );
    }
    // top-tier ceiling ledge over the tier-3 cells
    for (const side of [-1, 1]) {
      const xa = side * 10,
        xb = side * 6.4;
      b.boxMM(
        "metal_dark",
        Math.min(xa, xb),
        TOPC - 0.3,
        -44,
        Math.max(xa, xb),
        TOPC,
        -12,
        { tint: [0.4, 0.41, 0.4], faces: "b" },
      );
    }
    // stairs: S1 tier1→2 (west, climbing −z), S2 tier2→3 (east, climbing −z)
    K.stairs(b, -5, -22.4, -3.8, -15, 0, TIER[1], "-z", {
      mat: "metal_dark",
      tint: [0.5, 0.5, 0.48],
      rail: "r",
      railMat: "black_iron",
      handMat: "black_iron",
      surface: "metal",
    });
    b.boxMM("metal_dark", -5, TIER[1] - 0.25, -24, -3.8, TIER[1], -22.4, {
      tint: [0.45, 0.46, 0.44],
      faces: "nsewtb",
    });
    b.col(-5, TIER[1] - 0.25, -24, -3.8, TIER[1], -22.4, {
      tag: "floor",
      surface: "metal",
    });
    K.railing(b, -3.8, -24, -3.8, -22.4, TIER[1], {
      h: 1.05,
      mat: "black_iron",
      handMat: "black_iron",
    });
    K.railing(b, -5, -24, -3.8, -24, TIER[1], {
      h: 1.05,
      mat: "black_iron",
      handMat: "black_iron",
    });
    K.stairs(b, 3.8, -22.4, 5, -14.4, TIER[1], TIER[2], "-z", {
      mat: "metal_dark",
      tint: [0.5, 0.5, 0.48],
      rail: "l",
      railMat: "black_iron",
      handMat: "black_iron",
      surface: "metal",
      solid: false,
      thick: 0.45,
    });
    b.boxMM("metal_dark", 3.8, TIER[1] - 0.25, -14.4, 5, TIER[1], -12, {
      tint: [0.45, 0.46, 0.44],
      faces: "nsewtb",
    });
    b.col(3.8, TIER[1] - 0.25, -14.4, 5, TIER[1], -12, {
      tag: "floor",
      surface: "metal",
    });
    b.boxMM("metal_dark", 3.8, TIER[2] - 0.25, -24, 5, TIER[2], -22.4, {
      tint: [0.45, 0.46, 0.44],
      faces: "nsewtb",
    });
    b.col(3.8, TIER[2] - 0.25, -24, 5, TIER[2], -22.4, {
      tag: "floor",
      surface: "metal",
    });
    K.railing(b, 3.8, -24, 3.8, -22.4, TIER[2], {
      h: 1.05,
      mat: "black_iron",
      handMat: "black_iron",
    });
    K.railing(b, 3.8, -24, 5, -24, TIER[2], {
      h: 1.05,
      mat: "black_iron",
      handMat: "black_iron",
    });
    K.railing(b, 3.8, -14.4, 3.8, -12.2, TIER[1], {
      h: 1.05,
      mat: "black_iron",
      handMat: "black_iron",
    });
    // suicide netting over the void at tier 2 (sagging, torn)
    for (let z = -42; z < -13; z += 1.2)
      b.pipe(
        "fabric",
        -3.7,
        TIER[1] - 0.3,
        z,
        3.7,
        TIER[1] - 0.9 - Math.sin(z) * 0.2,
        z,
        0.01,
        3,
        { tint: [0.4, 0.4, 0.36] },
      );
    // the flats: raider camp
    const camp = [[0, -30]];
    for (const [cx, cz] of camp) {
      b.cyl("rust", cx, 0, cz, 0.7, 0.8, 0.5, 10, { tint: [0.4, 0.3, 0.25] });
      b.light(cx, 1.2, cz, [1, 0.55, 0.25], 2.2, 10, { box: BB });
      b.glow(cx, 0.9, cz, [1, 0.5, 0.2], 2.2);
      b.col(cx - 0.7, 0, cz - 0.7, cx + 0.7, 0.5, cz + 0.7, {});
    }
    K.loot(ctx, "campfire", 0, 0, -30, 0, { spit: true, container: false });
    for (const [x, z, yaw] of [
      [-3, -34, 0.3],
      [2.8, -35, -0.4],
      [-2.6, -26, 1.2],
      [3, -38, 0.1],
    ])
      K.loot(ctx, "mattress", x, 0, z, yaw, { container: false });
    K.table(b, 2.5, 0, -26.5, 1.8, 0.9, {
      mat: "wood_rotten",
      tint: [0.6, 0.5, 0.4],
    });
    for (let k = 0; k < 4; k++)
      b.cyl(
        "rubber",
        -3.5 + (k % 2) * 0.6,
        k > 1 ? 0.25 : 0,
        -40 + (k % 2) * 0.3,
        0.35,
        0.35,
        0.25,
        10,
        { tint: [0.15, 0.15, 0.15] },
      ); // tyres
    for (let k = 0; k < 10; k++)
      b.hplate(
        "decal",
        -4.5 + r() * 9,
        0.012 + k * 0.0006,
        -42 + r() * 28,
        1.6,
        1.6,
        r() * 6,
        K.decal(k % 3 ? "grime" : "blood", k + 100),
      );
    K.litter(b, -4.8, -42.5, 4.8, -13, 0, 30, 91);
    b.plate(
      "decal",
      0,
      TIER[2] + 1.8,
      -43.88,
      0,
      1,
      5.0,
      1.4,
      K.tag("BLOCK C", "#e0e0d0", 256, 96, { font: "Arial Black" }),
      {},
    );
    b.plate(
      "art",
      0,
      TIER[0] + 3.0,
      -43.88,
      0,
      1,
      2.0,
      0.4,
      K.signCell("tombs_mess", "MESS HALL", 384, 80, {
        bg: "#2a3a2a",
        fg: "#e8e0c0",
        font: "Arial, sans-serif",
      }),
      {},
    );
    b.plate(
      "art",
      0,
      TIER[1] + 2.8,
      -43.88,
      0,
      1,
      2.0,
      0.4,
      K.signCell("tombs_ctrl", "CONTROL", 384, 80, {
        bg: "#2a3a2a",
        fg: "#e8e0c0",
        font: "Arial, sans-serif",
      }),
      {},
    );
    b.plate(
      "art",
      0,
      TIER[2] + 2.8,
      -43.88,
      0,
      1,
      2.0,
      0.4,
      K.signCell("tombs_warden", "WARDEN", 384, 80, {
        bg: "#3a1a14",
        fg: "#e8e0c0",
        font: "Arial, sans-serif",
      }),
      {},
    );
    // hanging chains, meat hooks
    for (let k = 0; k < 6; k++) {
      const x = -3 + r() * 6,
        z = -40 + r() * 26;
      b.pipe("black_iron", x, TOPC, z, x, TOPC - 3 - r() * 3, z, 0.02, 3);
    }

    // ---------------- north stack: cafeteria (0) / control (3.4) / warden (6.8), x −10..10, z −58..−44 ----------------
    const NB = (y, h) => [-10.1, y - 0.2, -58.1, 10.1, y + h + 0.2, -43.9];
    // cafeteria
    K.room(b, ctx, {
      x0: -10,
      z0: -58,
      x1: 10,
      z1: -44,
      y: 0,
      h: 3.2,
      floor: "checker",
      fc: [0.6, 0.6, 0.56],
      wall: "celltile",
      wc: tile,
      wain: "paint_green",
      wainC: [0.3, 0.4, 0.32],
      ceil: "plaster",
      cc: [0.45, 0.45, 0.42],
      trimMat: "metal_dark",
      ceilCol: true,
    });
    for (let row = 0; row < 3; row++)
      for (let k = 0; k < 2; k++) {
        const tx = -5 + k * 10,
          tz = -47.5 - row * 3.4;
        b.boxMM("steel", tx - 2.6, 0.72, tz - 0.45, tx + 2.6, 0.78, tz + 0.45, {
          tint: [0.6, 0.62, 0.62],
        });
        b.boxMM("steel", tx - 0.1, 0, tz - 0.1, tx + 0.1, 0.72, tz + 0.1, {});
        for (const s of [-1, 1])
          for (let q = -2; q <= 2; q++) {
            b.cyl(
              "steel",
              tx + q * 1.0,
              0.42,
              tz + s * 0.75,
              0.16,
              0.16,
              0.05,
              8,
            );
            b.cyl("steel", tx + q * 1.0, 0, tz + s * 0.75, 0.03, 0.03, 0.42, 4);
          }
        b.col(tx - 2.6, 0, tz - 0.45, tx + 2.6, 0.78, tz + 0.45, {
          tag: "furniture",
        });
        if (r() < 0.6) {
          b.cyl("metal", tx + (r() - 0.5) * 3, 0.78, tz, 0.12, 0.1, 0.06, 8, {
            tint: [0.6, 0.62, 0.6],
          });
          b.box("metal", tx + (r() - 0.5) * 3, 0.78, tz, 0.4, 0.03, 0.3, {
            tint: [0.55, 0.57, 0.55],
          });
        }
      }
    b.boxMM("steel", -9.9, 0, -57.8, -8.6, 0.95, -48, {
      tint: [0.55, 0.57, 0.56],
    });
    b.col(-9.9, 0, -57.8, -8.6, 0.95, -48, { tag: "counter" });
    for (let z = -57; z < -48.5; z += 1.1)
      b.boxMM("steel", -9.7, 0.9, z, -8.8, 0.98, z + 0.8, {
        tint: [0.45, 0.47, 0.46],
      });
    b.beam("steel", -8.6, 1.35, -57.8, -8.6, 1.35, -48, 0.04, 0.04); // tray rail
    b.cyl("black_iron", 6.5, 0, -55.5, 0.9, 0.75, 0.9, 12, {
      tint: [0.3, 0.28, 0.26],
    }); // raider stew pot
    b.col(5.6, 0, -56.4, 7.4, 0.9, -54.6, {});
    b.light(6.5, 1.2, -55.5, [1, 0.5, 0.2], 1.4, 7, { box: NB(0, 3.2) });
    b.glow(6.5, 0.3, -55.5, [1, 0.45, 0.15], 1.6);
    K.lamp(b, 0, 2.9, -51, "tube", [0.9, 1, 0.9], 0.8, 9, {
      ceil: 3.2,
      len: 1.6,
      lightOpts: { box: NB(0, 3.2) },
    });
    b.plate(
      "decal",
      9.88,
      1.8,
      -51,
      -1,
      0,
      4,
      1.2,
      K.tag("SECONDS? NO.", "#e0e0d0", 256, 96),
      {},
    );
    K.loot(ctx, "fridge", 9.5, 0, -57.2, -HP, { loot: "fridge" });
    K.note(ctx, "pv_note_tombs_menu", -9.2, 0.99, -52, {
      name: "Raider Mess Rota",
      title: "MESS ROTA (written on a cafeteria tray)",
      learn: LK.control.id,
      text: "MON — mystery stew\nTUE — mystery stew (same)\nWED — whatever Skunk caught\nTHU — stew\nFRI — \"Prisoner's Choice\" (they don't get a choice)\n\nMADDOX SAYS: Nobody eats the prisoners. They're worth 100 scrip a head to the Gallowglass boys. Eat the roaches like normal people.\n\nROURKE: control room word is GALLOWS. Stop asking me. Stop writing it on the trays.\n(Someone has written it on the tray.)",
    });

    // control room (3.4)
    const CY = TIER[1];
    K.room(b, ctx, {
      x0: -10,
      z0: -58,
      x1: 10,
      z1: -44,
      y: CY,
      h: 3.2,
      floor: "metal",
      fc: [0.45, 0.47, 0.45],
      wall: "metal",
      wc: [0.5, 0.55, 0.5],
      ceil: "metal_dark",
      cc: [0.35, 0.36, 0.34],
      trim: false,
      surface: "metal",
      ceilCol: true,
    });
    // observation windows into the block (on the south wall, both sides of the door)
    for (const x of [-5.5, 5.5]) {
      b.plate("glass_clear", x, CY + 1.8, -44.0, 0, -1, 5, 1.4, null, {
        tint: [0.6, 0.7, 0.7],
      });
      b.beam(
        "metal_dark",
        x - 2.5,
        CY + 1.1,
        -43.85,
        x + 2.5,
        CY + 1.1,
        -43.85,
        0.08,
        0.1,
      );
    }
    // control desks
    for (let x = -8.5; x <= 7.5; x += 2.4) {
      if (Math.abs(x) < 1.4) continue;
      b.boxMM("metal", x - 1.1, CY, -45.6, x + 1.1, CY + 1.0, -44.8, {
        tint: [0.45, 0.5, 0.46],
      });
      b.quadN(
        "metal",
        [x - 1.1, CY + 1.0, -45.6],
        [x + 1.1, CY + 1.0, -45.6],
        [x + 1.1, CY + 1.25, -45.1],
        [x - 1.1, CY + 1.25, -45.1],
        [0, 1, 0.5],
        { tint: [0.4, 0.45, 0.42] },
      );
      for (let k = 0; k < 8; k++)
        b.geo("lamp", K.sphereGeo(), {
          x: x - 0.9 + k * 0.25,
          y: CY + 1.13,
          z: -45.3,
          s: 0.03,
          tint: r() < 0.5 ? [1, 0.3, 0.2] : [0.3, 1, 0.3],
        });
      b.col(x - 1.1, CY, -45.6, x + 1.1, CY + 1.25, -44.8, {
        tag: "furniture",
      });
    }
    for (let x = -9; x <= 9; x += 3) {
      b.boxMM(
        "paint_black",
        x - 0.5,
        CY + 1.8,
        -57.9,
        x + 0.5,
        CY + 2.6,
        -57.4,
        { tint: [0.25, 0.27, 0.25] },
      );
      b.plate("lamp", x, CY + 2.2, -57.38, 0, 1, 0.8, 0.6, null, {
        tint: r() < 0.4 ? [0.15, 0.3, 0.2] : [0.05, 0.08, 0.06],
      });
    }
    K.terminal(
      ctx,
      "pv_term_tombs_control",
      -1.8,
      CY + 1.0,
      -45.2,
      PI,
      termControl(),
      "own_desk",
    );
    b.light(0, CY + 2.6, -51, [0.5, 0.9, 0.6], 0.9, 11, { box: NB(CY, 3.2) });
    K.lamp(b, 0, CY + 2.9, -55, "cage", [1, 0.2, 0.15], 0.8, 8, {
      ceil: CY + 3.2,
      lightOpts: { box: NB(CY, 3.2) },
    });
    K.loot(ctx, "ammo_box", 9.3, CY, -57.2, -HP, { loot: "ammo_box" });
    K.loot(ctx, "locker", -9.6, CY, -52, HP, {
      loot: "locker",
      name: "Guard Locker",
    });

    // warden's office (6.8)
    const WY = TIER[2];
    const WB = NB(WY, 3.4);
    K.gap(ctx, 10, -51, 1.4, WY, 2.4); // → Bridge of Sighs
    K.room(b, ctx, {
      x0: -10,
      z0: -58,
      x1: 10,
      z1: -44,
      y: WY,
      h: 3.4,
      floor: "wood",
      fc: [0.5, 0.38, 0.3],
      wall: "wallpaper_green",
      wc: [0.55, 0.58, 0.48],
      wain: "wood_dark",
      wainC: [0.35, 0.24, 0.18],
      wainH: 1.1,
      ceil: "plaster",
      cc: [0.45, 0.44, 0.4],
      surface: "wood",
    });
    b.hplate("carpet", 0, WY + 0.012, -52, 7, 5, 0, null, {
      tint: [0.7, 0.6, 0.55],
    });
    const wdt = K.table(b, 0, WY, -54.5, 2.6, 1.2, { mat: "mahogany" });
    // Maddox's throne: a barber chair on a pallet
    b.boxMM("wood_rotten", -0.9, WY, -57.2, 0.9, WY + 0.2, -55.6, {
      tint: [0.55, 0.45, 0.35],
    });
    b.boxMM("leather_red", -0.4, WY + 0.2, -56.8, 0.4, WY + 0.75, -56, {
      tint: [0.7, 0.2, 0.15],
    });
    b.boxMM("leather_red", -0.4, WY + 0.75, -57.0, 0.4, WY + 1.8, -56.8, {
      tint: [0.7, 0.2, 0.15],
    });
    b.cyl("chrome", 0, WY + 0.2, -56.4, 0.25, 0.2, 0.1, 10);
    b.col(-0.9, WY, -57.2, 0.9, WY + 0.75, -55.6, { tag: "furniture" });
    // trophies: skull shelf, the dartboard over an empty frame (the portrait sits on the desk)
    for (let k = 0; k < 7; k++)
      b.geo("bone", K.sphereGeo(), {
        x: -8 + k * 0.5,
        y: WY + 1.9,
        z: -57.75,
        s: 0.12,
      });
    b.boxMM("wood_dark", -8.3, WY + 1.75, -57.95, -4.7, WY + 1.8, -57.6, {});
    b.cyl("cloth_red", 5, WY + 2.1, -57.9, 0.35, 0.35, 0.05, 16, {
      tint: [0.7, 0.25, 0.2],
      rows: 1,
    }); // dartboard (flat disc)
    K.framed(b, 5, WY + 2.1, -57.88, 0, 1, 1.0, 1.2, K.decal("grime", 120), {
      frame: "gold",
    });
    for (let k = 0; k < 12; k++)
      b.pipe(
        "rust",
        4.6 + r() * 0.8,
        WY + 1.6 + r() * 1.0,
        -57.85,
        4.6 + r() * 0.8,
        WY + 1.6 + r() * 1.0,
        -57.6,
        0.008,
        3,
      ); // darts in the wall
    K.terminal(
      ctx,
      "pv_term_tombs_warden",
      0.8,
      wdt,
      -54.7,
      0,
      termWarden(),
      "bare",
    );
    K.lamp(b, -0.6, wdt + 0.35, -54.6, "pendant", [1, 0.85, 0.6], 0.8, 5, {
      ceil: wdt + 0.45,
      shade: "paint_green",
      lightOpts: { box: WB },
    });
    b.box("brass", -0.6, wdt, -54.6, 0.15, 0.4, 0.15, {});
    K.lamp(b, -5, WY + 3.0, -50, "bulb", [1, 0.75, 0.45], 1.0, 9, {
      ceil: WY + 3.4,
      lightOpts: { box: WB },
    });
    K.lamp(b, 5, WY + 3.0, -50, "bulb", [1, 0.75, 0.45], 0.9, 9, {
      ceil: WY + 3.4,
      lightOpts: { box: WB },
    });
    K.lamp(b, -6, WY + 3.0, -55.5, "bulb", [1, 0.7, 0.4], 0.8, 7, {
      ceil: WY + 3.4,
      lightOpts: { box: WB },
    });
    K.lamp(b, 5, WY + 3.0, -55.5, "bulb", [1, 0.7, 0.4], 0.7, 7, {
      ceil: WY + 3.4,
      dead: false,
      lightOpts: { box: WB },
    });
    K.salonWall(b, -9.8, -8.2, WY + 1.2, WY + 3.0, 9.88, -1, 0, "tombs_w_e", {
      density: 0.5,
    });
    // Maddox's "court": banner, wanted/mugshot wall, gun rack, filing cabinets, a lounge by a fire barrel, loot piles
    b.plate(
      "decal",
      0,
      WY + 2.75,
      -57.88,
      0,
      1,
      5.2,
      1.0,
      K.tag("WARDEN MADDOX — LAW IS WHAT I SAY", "#e02020", 512, 96, {
        rot: -0.02,
      }),
      {},
    );
    for (let k = 0; k < 10; k++)
      K.framed(
        b,
        -9.88,
        WY + 1.5 + (k % 2) * 0.75,
        -46 - Math.floor(k / 2) * 1.1,
        1,
        0,
        0.45,
        0.6,
        K.photo("mug", 30 + k, 96, 128),
        { frame: "paint_black", fw: 0.02 },
      );
    b.plate(
      "decal",
      -9.87,
      WY + 2.9,
      -48.3,
      1,
      0,
      3.6,
      0.6,
      K.tag("MERCHANDISE", "#f0f0e0", 256, 64),
      {},
    );
    // gun rack (west wall, south of the safe)
    b.boxMM("wood_dark", -9.95, WY + 0.9, -54.4, -9.7, WY + 2.3, -51.6, {
      tint: [0.4, 0.28, 0.2],
    });
    for (let k = 0; k < 6; k++) {
      const z = -54.1 + k * 0.48;
      b.box("metal_dark", -9.62, WY + 0.95, z, 0.08, 1.15, 0.07, {
        tint: [0.22, 0.22, 0.2],
      });
      b.box("wood", -9.62, WY + 0.95, z, 0.1, 0.35, 0.1, {
        tint: [0.45, 0.3, 0.2],
      });
    }
    b.col(-9.95, WY, -54.4, -9.55, WY + 2.3, -51.6, { tag: "furniture" });
    // filing cabinets (old prison records, now tinder)
    for (let k = 0; k < 4; k++) {
      const x = 3 + k * 0.8;
      b.boxMM("metal", x - 0.36, WY, -57.95, x + 0.36, WY + 1.35, -57.35, {
        tint: [0.45, 0.48, 0.44],
      });
      for (let d = 0; d < 3; d++)
        b.boxMM(
          "brass",
          x - 0.08,
          WY + 0.3 + d * 0.4,
          -57.36,
          x + 0.08,
          WY + 0.34 + d * 0.4,
          -57.3,
          {},
        );
    }
    b.col(2.6, WY, -57.95, 5.8, WY + 1.35, -57.35, { tag: "furniture" });
    for (let k = 0; k < 30; k++)
      b.hplate(
        "flat",
        2 + r() * 5,
        WY + 0.013 + k * 0.0003,
        -57 + r() * 3.5,
        0.21,
        0.29,
        r() * 6.3,
        null,
        { tint: [0.8, 0.76, 0.66] },
      );
    // lounge: two couches round a fire barrel (baked firelight)
    K.sofa(b, 6.2, WY, -47.2, 2.2, PI, {
      mat: "leather_red",
      tint: [0.5, 0.2, 0.15],
    });
    K.sofa(b, 8.9, WY, -49.6, 2.0, -HP, {
      mat: "fabric",
      tint: [0.45, 0.42, 0.3],
    });
    b.col(5.1, WY, -47.6, 7.3, WY + 0.9, -46.8, { tag: "furniture" });
    b.col(8.6, WY, -50.6, 9.3, WY + 0.9, -48.6, { tag: "furniture" });
    b.cyl("rust", 6.6, WY, -49.6, 0.32, 0.3, 0.9, 10, {
      tint: [0.45, 0.3, 0.2],
    });
    b.col(6.3, WY, -49.9, 6.9, WY + 0.9, -49.3, {});
    b.light(6.6, WY + 1.3, -49.6, [1, 0.5, 0.2], 1.3, 7, { box: WB });
    b.glow(6.6, WY + 1.05, -49.6, [1, 0.45, 0.15], 1.5);
    for (let k = 0; k < 6; k++)
      b.cyl(
        "glass",
        5 + r() * 3,
        WY,
        -48.5 + r() * 1.4,
        0.035,
        0.035,
        0.26,
        6,
        { tint: [0.35, 0.5, 0.3] },
      );
    // loot heap: crates, a pile of scrip, stolen art stacked against the wall
    for (let k = 0; k < 5; k++)
      b.box(
        "wood_rotten",
        -7.5 + (k % 3) * 0.95,
        WY + (k > 2 ? 0.7 : 0),
        -44.9,
        0.9,
        0.7,
        0.7,
        { yaw: (r() - 0.5) * 0.3, tint: [0.6, 0.5, 0.36] },
      );
    b.col(-8, WY, -45.3, -4.9, WY + 1.4, -44.4, {});
    for (let k = 0; k < 4; k++)
      b.quad(
        "art",
        [-3.8 + k * 0.03, WY + 0.02, -44.2],
        [-2.6 + k * 0.03, WY + 0.02, -44.2],
        [-2.6 + k * 0.03, WY + 1.0, -44.45 + k * 0.06],
        [-3.8 + k * 0.03, WY + 1.0, -44.45 + k * 0.06],
        { rect: K.painting(70 + k, 128, 112), grime: 0.2 },
      );
    K.anchor(ctx, "portrait", -0.6, wdt + 0.02, -54.3);
    K.anchor(ctx, "boss", 0, WY, -52.5);
    K.loot(ctx, "safe", -9.7, WY, -56.5, HP, {
      loot: "safe",
      lock: LK.wsafe,
      name: "Warden's Safe",
      tag: "wsafe",
    });
    K.loot(ctx, "footlocker", 9.2, WY, -56.5, -HP, {
      loot: "raider_stash",
      name: "Maddox's Loot",
    });
    K.loot(ctx, "mattress", -7, WY, -47, 0.2, { container: false });

    // ---------------- Bridge of Sighs (x 10..26, z −53..−49, y 6.8) ----------------
    const SB2 = [9.9, WY - 0.2, -53.1, 26.1, WY + 3.4, -48.9];
    K.gap(ctx, 26, -51, 1.4, WY, 2.4);
    K.room(b, ctx, {
      x0: 10,
      z0: -53,
      x1: 26,
      z1: -49,
      y: WY,
      h: 3.2,
      floor: "terrazzo",
      fc: [0.55, 0.53, 0.5],
      wall: "limestone",
      wc: [0.72, 0.68, 0.6],
      ceil: "plaster",
      cc: [0.5, 0.48, 0.44],
      trim: false,
    });
    for (let k = 0; k < 5; k++) {
      const x = 12 + k * 3.2;
      for (const [z, n] of [
        [-53, 1],
        [-49, -1],
      ]) {
        b.plate("lamp", x, WY + 1.7, z + n * 0.12, 0, n, 1.3, 2.0, null, {
          tint: [0.5, 0.54, 0.58],
        });
        for (const s of [-0.35, 0, 0.35])
          b.beam(
            "black_iron",
            x + s,
            WY + 0.7,
            z + n * 0.14,
            x + s,
            WY + 2.7,
            z + n * 0.14,
            0.03,
            0.03,
          );
        b.light(x, WY + 1.8, z + n * 0.8, [0.7, 0.78, 0.86], 0.6, 3.5, {
          box: SB2,
        });
      }
    }
    for (let k = 0; k < 4; k++)
      b.hplate(
        "decal",
        12 + r() * 12,
        WY + 0.012 + k * 0.001,
        -52 + r() * 2,
        1.3,
        1.3,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", k + 130),
      );
    K.skel(ctx, 17.5, WY, -52.4, 0.6, "reaching");
    K.note(ctx, "pv_note_tombs_bridge", 18, WY + 0.02, -52.1, {
      name: "Last Walk",
      title:
        "Scratched into the bridge floor, finished in pencil on a court docket",
      text: "They call this the Bridge of Sighs. You walk across from the courts to the cells and you sigh because that's it, that's your life now.\n\nThe bombs fell while I was halfway across. The guards ran. The doors locked. So here I am, exactly halfway between guilty and innocent.\n\nFor the record: I didn't do it. For the record: nobody's keeping a record anymore.",
    });
    b.plate(
      "art",
      25.88,
      WY + 2.7,
      -51,
      -1,
      0,
      2.0,
      0.4,
      K.signCell("tombs_courts_in", "CRIMINAL COURTS →", 384, 80, {
        bg: "#2a2a2a",
        fg: "#d8d0b8",
        font: "Georgia, serif",
      }),
      {},
    );

    // ---------------- SOLITARY ("the Hole"): x 10..15, z −40..−16 ----------------
    const HB = [9.9, -0.2, -40.1, 15.1, 3.0, -15.9];
    K.room(b, ctx, {
      x0: 10,
      z0: -40,
      x1: 12,
      z1: -16,
      y: 0,
      h: 2.8,
      floor: "concrete",
      fc: [0.45, 0.44, 0.42],
      wall: "concrete",
      wc: [0.48, 0.48, 0.45],
      ceil: "concrete",
      cc: [0.3, 0.3, 0.3],
      trim: false,
      open: { e: true },
    });
    // hole cells: 6 × 4 m; #3 is Sam's padded cell (open)
    for (let k = 0; k < 6; k++) {
      const z0 = -40 + k * 4,
        z1 = z0 + 4,
        zc = z0 + 2;
      const open = k === 3 || k === 5;
      const gaps = open ? [{ t: 2, w: 0.9, y1: 2.1 }] : [];
      K.segWall(b, 12, z0, 12, z1, 0, 2.8, -1, {
        mat: "concrete",
        tint: [0.48, 0.48, 0.45],
        gaps,
        trim: false,
      });
      if (open)
        K.room(b, ctx, {
          x0: 12,
          z0,
          x1: 15,
          z1,
          y: 0,
          h: 2.8,
          floor: k === 3 ? "padded" : "concrete",
          fc: [0.6, 0.58, 0.52],
          wall: k === 3 ? "padded" : "concrete",
          wc: [0.62, 0.6, 0.54],
          ceil: "concrete",
          cc: [0.35, 0.35, 0.34],
          trim: false,
          open: { w: true },
        });
      else {
        b.boxMM("metal_dark", 11.9, 0, zc - 0.5, 11.97, 2.1, zc + 0.5, {
          tint: [0.35, 0.38, 0.35],
        });
        b.boxMM("paint_black", 11.85, 1.5, zc - 0.2, 11.9, 1.6, zc + 0.2, {});
        b.plate(
          "art",
          11.84,
          2.3,
          zc,
          -1,
          0,
          0.3,
          0.12,
          K.signCell("hole" + k, "H-" + (k + 1), 96, 40, {
            bg: "#1a1a1a",
            fg: "#d8d0b8",
            font: "Arial",
          }),
          {},
        );
      }
    }
    K.lamp(b, 11, 2.5, -30, "cage", [1, 0.15, 0.1], 0.9, 8, {
      ceil: 2.8,
      lightOpts: { box: HB },
    });
    K.lamp(b, 13.5, 2.5, -26, "bulb", [1, 0.8, 0.55], 0.6, 3.5, {
      ceil: 2.8,
      lightOpts: { box: [11.9, -0.2, -28.1, 15.1, 3, -23.9] },
    });
    K.lamp(b, 13.5, 2.5, -18, "bulb", [1, 0.8, 0.55], 0, 0, {
      ceil: 2.8,
      dead: true,
    });
    b.plate(
      "decal",
      14.88,
      1.4,
      -18,
      -1,
      0,
      3.4,
      1.4,
      K.paint("art", "tombs_tally", 256, 128, function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        x.strokeStyle = "rgba(220,210,190,0.8)";
        x.lineWidth = 2;
        for (let k = 0; k < 120; k++) {
          const gx = X + 6 + (k % 24) * 10,
            gy = Y + 8 + Math.floor(k / 24) * 24;
          x.beginPath();
          if (k % 5 === 4) {
            x.moveTo(gx - 42, gy + 16);
            x.lineTo(gx + 2, gy);
          } else {
            x.moveTo(gx, gy);
            x.lineTo(gx, gy + 18);
          }
          x.stroke();
        }
      }),
      {},
    );
    K.skel(ctx, 13.8, 0, -19, -HP, "curled");
    K.anchor(ctx, "sam", 13.4, 0, -26);
    K.loot(ctx, "footlocker", 14.3, 0, -24.6, -HP, {
      loot: "raider_stash",
      name: "Loose Brick Stash",
    }); // a hole behind a loose brick: no lock

    // ---------------- doors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pv_tombs_in",
      pos: new THREE.Vector3(PORTAL_X, 1.3, TW.z0 - 0.4),
      label: "The Tombs",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.4, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("tombs")),
    });
    K.door(ctx, {
      id: "pv_tombs_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.3),
      label: "White Street",
      verb: "Leave",
      target: { x: PORTAL_X, y: 0, z: TW.z0 - 2.2, yaw: 0 },
    });
    // the side door is padlocked from the inside: leaving that way takes the padlock off for good
    K.door(ctx, {
      id: "pv_tombs_courts_out",
      pos: new THREE.Vector3(OX + 25.8, OY + WY + 1.3, OZ - 51),
      label: "Criminal Courts — White Street",
      verb: "Go to",
      target: { x: SIDE_DOOR.x, y: 0, z: SIDE_DOOR.z - 2.9, yaw: 0 },
      onEnter: () => {
        PV.setFlag("tombs_courts_open", true);
        K.lockUnlock(LK.courts.id);
      },
    });
    K.door(ctx, {
      id: "pv_tombs_courts_in",
      pos: new THREE.Vector3(SIDE_DOOR.x, 1.3, SIDE_DOOR.z - 0.3),
      label: "Criminal Courts (Bridge of Sighs)",
      verb: "Enter",
      lock: LK.courts,
      target: { x: OX + 24.6, y: OY + WY, z: OZ - 51, yaw: HP },
    });

    // ---------------- anchors ----------------
    K.anchor(ctx, "entrance", 0, 0, -1.4);
    K.anchor(ctx, "raider1", -5.7, TIER[1], -30);
    K.anchor(ctx, "raider2", 5.7, TIER[2], -34);
    K.anchor(ctx, "raider3", 3, 0, -50);
    K.anchor(ctx, "raider4", 4, CY, -52);
    K.anchor(ctx, "blockc", 5, 0, -24);
    if (ctx.anchors.prison8) {
      ctx.anchors.prison8.x += 0.1;
      ctx.anchors.prison8.z -= 1.8;
    } // round 1b: was inside the bunk (audit)
    const sp = [
      [-3.1, 0, -8.8],
      [3, 0, -20],
      [-2, 0, -36],
      [-5.7, TIER[1], -18],
      [5.7, TIER[1], -38],
      [-5.7, TIER[2], -26],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", -9.7, WY, -56.5);
    K.anchor(ctx, "loot2", 9.3, CY, -57.2);
    K.anchor(ctx, "loot3", 14.3, 0, -24.6);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_tombs_int";
    for (const d of cellDoors) ctx.intRoot.add(d.group);
  }

  // ------------------------------------------------------------------
  // terminals
  // ------------------------------------------------------------------
