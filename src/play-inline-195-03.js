// play-inline-195 03 — wallz
// Lines 218-769 of readable/play-inline-195.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "tombs_ext", grime: 0.35 });
    const r = K.rng("tombs_ext");
    // ---- north tower: base + setbacks + crown ----
    decoTier(b, TW.x0, TW.x1, TW.z0, TW.z1, 0, 24, r, {
      portal: true,
      firstY: 10,
    });
    decoTier(b, 55, 79, 546.5, 568, 24.25, 34, r, { firstY: 0.6 });
    decoTier(b, 60, 74, 550.5, 564, 34.25, 42, r, { firstY: 0.6 });
    for (let k = 0; k < 4; k++) {
      const i = k * 0.9;
      b.boxMM(
        "limestone",
        62 + i,
        42.25 + k * 0.9,
        552.5 + i,
        72 - i,
        43.15 + k * 0.9,
        562 - i,
        { tint: [0.82, 0.76, 0.64] },
      );
    }
    b.cyl("metal_dark", 67, 45.8, 557.25, 0.15, 0.05, 4, 6); // mast
    b.glow(67, 49.8, 557.25, [1, 0.2, 0.15], 1.2);
    // raider floodlights on the setbacks + a few fire-lit windows (life inside)
    for (const [fx, fy, fz] of [
      [56, 24.6, 546.2],
      [78, 24.6, 546.2],
      [61, 34.6, 550.2],
      [73, 34.6, 550.2],
    ]) {
      b.cyl("black_iron", fx, fy, fz, 0.25, 0.3, 0.4, 8);
      b.glow(fx, fy + 0.5, fz - 0.4, [1, 0.9, 0.7], 2.2);
    }
    for (const [wx, wy] of [
      [58.6, 17.7],
      [73.4, 14.3],
      [63.8, 21.1],
      [76, 10.9],
    ])
      b.glow(wx, wy, TW.z0 - 0.3, [1, 0.5, 0.2], 1.6);
    // ground storey: dark granite base with a heavy portal
    b.boxMM("granite", TW.x0 - 0.2, 0, TW.z0 - 0.4, TW.x1 + 0.2, 1.2, TW.z0, {
      tint: [0.4, 0.38, 0.36],
    });
    for (let x = TW.x0 + 3; x < TW.x1 - 2; x += 5) {
      if (Math.abs(x - PORTAL_X) < 5) continue;
      K.window(b, x, 5.2, TW.z0, 0, -1, 1.6, 3.4, {
        state: "boarded",
        sill: true,
        surround: "limestone",
        surroundTint: [0.8, 0.74, 0.62],
      });
    }
    // the portal
    {
      const px = PORTAL_X,
        z = TW.z0;
      b.boxMM("limestone", px - 3.6, 0, z - 1.2, px - 2.4, 10.5, z, {
        tint: [0.9, 0.84, 0.72],
      });
      b.boxMM("limestone", px + 2.4, 0, z - 1.2, px + 3.6, 10.5, z, {
        tint: [0.9, 0.84, 0.72],
      });
      for (let k = 0; k < 4; k++)
        b.boxMM(
          "limestone",
          px - 2.4 + k * 0.15,
          9.2 - k * 0.2,
          z - 1.0 + k * 0.2,
          px + 2.4 - k * 0.15,
          10.5,
          z - 0.8 + k * 0.2,
          { tint: [0.84, 0.78, 0.66] },
        );
      b.boxMM(
        "bronze" in K.ALIAS ? "bronze" : "brass",
        px - 2.2,
        0,
        z - 0.25,
        px + 2.2,
        6.2,
        z - 0.05,
        { tint: [0.45, 0.35, 0.22] },
      );
      for (let k = 0; k < 6; k++)
        b.boxMM(
          "brass",
          px - 2.1 + k * 0.84,
          0.3,
          z - 0.3,
          px - 1.4 + k * 0.84,
          5.9,
          z - 0.26,
          { tint: [0.4, 0.3, 0.18] },
        ); // door panels
      b.plate("glass_dark", px, 7.7, z - 0.1, 0, -1, 4.2, 2.6, null, {
        tint: [0.2, 0.22, 0.22],
      });
      for (let x = -1.8; x <= 1.8; x += 0.45)
        b.beam(
          "brass",
          px + x,
          6.4,
          z - 0.14,
          px + x,
          9.0,
          z - 0.14,
          0.05,
          0.05,
          { tint: [0.4, 0.3, 0.18] },
        );
      // carved lettering + eagle
      const letters = K.signCell(
        "tombs_letters",
        "MANHATTAN HOUSE OF DETENTION",
        1024,
        96,
        { bg: "#d8ccb0", fg: "#4a4030", font: "Georgia, serif", weather: true },
      );
      b.plate("art", px, 11.3, z - 0.05, 0, -1, 13, 1.1, letters);
      const eagle = K.paint(
        "art",
        "tombs_eagle",
        256,
        160,
        function (x, X, Y, W, H) {
          x.fillStyle = "#d0c4a8";
          x.fillRect(X, Y, W, H);
          x.fillStyle = "#8a7c62";
          x.beginPath();
          x.moveTo(X + W / 2, Y + 30);
          for (let k = 0; k <= 8; k++) {
            x.lineTo(X + W / 2 - 20 - k * 12, Y + 40 + k * 6);
            x.lineTo(X + W / 2 - 24 - k * 12, Y + 58 + k * 6);
          }
          x.lineTo(X + W / 2, Y + 110);
          x.fill();
          x.beginPath();
          x.moveTo(X + W / 2, Y + 30);
          for (let k = 0; k <= 8; k++) {
            x.lineTo(X + W / 2 + 20 + k * 12, Y + 40 + k * 6);
            x.lineTo(X + W / 2 + 24 + k * 12, Y + 58 + k * 6);
          }
          x.lineTo(X + W / 2, Y + 110);
          x.fill();
          x.beginPath();
          x.ellipse(X + W / 2, Y + 70, 16, 44, 0, 0, 6.3);
          x.fill();
          x.beginPath();
          x.arc(X + W / 2, Y + 26, 12, 0, 6.3);
          x.fill();
          x.fillStyle = "#6a5c42";
          for (let k = 0; k < 5; k++)
            x.fillRect(X + W / 2 - 22 + k * 10, Y + 118, 4, 26);
          K.stains(x, X, Y, W, H, 8, 3, 0.35);
          K.streaks(x, X, Y, W, H, 12, 4, 0.3);
        },
      );
      b.plate("art", px, 13.4, z - 0.05, 0, -1, 4.2, 2.6, eagle);
      // raider additions
      b.plate(
        "decal",
        px,
        3.2,
        z - 0.3,
        0,
        -1,
        4.0,
        1.4,
        K.tag("THE TOMBS", "#e02020", 384, 110, { rot: -0.03 }),
      );
      b.plate(
        "decal",
        px - 8,
        2.5,
        z - 0.05,
        0,
        -1,
        5.0,
        1.4,
        K.tag("ABANDON HOPE", "#e8e8e8", 384, 110, { rot: 0.04 }),
      );
      b.plate(
        "decal",
        px + 9,
        2.2,
        z - 0.05,
        0,
        -1,
        4.6,
        1.3,
        K.tag("MADDOX RULES", "#f0c020", 384, 110, { rot: -0.05 }),
      );
      for (const s of [-1, 1]) {
        b.glow(px + s * 3.0, 7.5, z - 1.6, [1, 0.6, 0.3], 1.4);
        b.cyl("black_iron", px + s * 3.0, 7.2, z - 1.4, 0.2, 0.28, 0.5, 8);
      }
    }
    // ---- the Courts building ----
    {
      const stone = [0.72, 0.7, 0.66];
      b.face("granite", CB.x1, 0, CB.z0, -1, 0, 0, 0, 1, 0, CB.x1 - CB.x0, 24, {
        tint: stone,
      });
      b.face("granite", CB.x1, 0, CB.z1, 0, 0, -1, 0, 1, 0, CB.z1 - CB.z0, 24, {
        tint: stone,
      });
      b.face("granite", CB.x0, 0, CB.z0, 0, 0, 1, 0, 1, 0, CB.z1 - CB.z0, 24, {
        tint: stone,
      });
      b.face("granite", CB.x0, 0, CB.z1, 1, 0, 0, 0, 1, 0, CB.x1 - CB.x0, 24, {
        tint: stone,
      }); // south (Worth St) — was missing
      // Centre Street (east) and Worth Street (south) elevations: same granite windows, a barred ground floor
      for (let y = 3; y < 22; y += 3.6) {
        for (let z = CB.z0 + 3; z < CB.z1 - 1; z += 3.2)
          K.window(b, CB.x1, y + 1.1, z, 1, 0, 1.2, 2.0, {
            state: r() < 0.35 ? "boarded" : r() < 0.5 ? "broken" : "glass",
            lintel: 0.2,
            trimTint: [0.8, 0.76, 0.7],
            surround: "granite",
            surroundTint: stone,
          });
        for (let x = CB.x0 + 2; x < CB.x1 - 1; x += 3)
          K.window(b, x, y + 1.1, CB.z1, 0, 1, 1.2, 2.0, {
            state: r() < 0.4 ? "boarded" : "glass",
            lintel: 0.2,
            trimTint: [0.8, 0.76, 0.7],
            surround: "granite",
            surroundTint: stone,
          });
      }
      for (let z = CB.z0 + 3; z < CB.z1 - 1; z += 3.2)
        for (const s of [-0.3, 0, 0.3])
          b.beam(
            "black_iron",
            CB.x1 + 0.12,
            3.2,
            z + s,
            CB.x1 + 0.12,
            5.1,
            z + s,
            0.035,
            0.035,
          );
      b.boxMM("granite", CB.x1, 22.8, CB.z0, CB.x1 + 0.6, 24.3, CB.z1 + 0.6, {
        tint: [0.6, 0.58, 0.54],
      });
      b.boxMM("granite", CB.x0, 22.8, CB.z1, CB.x1, 24.3, CB.z1 + 0.6, {
        tint: [0.6, 0.58, 0.54],
      });
      b.plate(
        "decal",
        CB.x1 + 0.05,
        2.0,
        (CB.z0 + CB.z1) / 2,
        1,
        0,
        6,
        1.6,
        K.tag("JUSTICE IS DEAD", "#e0e0d0", 384, 110, { rot: 0.03 }),
      );
      b.face(
        "concrete_dark",
        CB.x0,
        24,
        CB.z1,
        1,
        0,
        0,
        0,
        0,
        -1,
        CB.x1 - CB.x0,
        CB.z1 - CB.z0,
        { uv: "top", tint: [0.5, 0.48, 0.45] },
      );
      b.col(CB.x0, 0, CB.z0, CB.x1, 24, CB.z1, { tag: "building" });
      for (let y = 3; y < 22; y += 3.6)
        for (let x = CB.x0 + 2; x < CB.x1 - 1; x += 3) {
          if (y < 4 && Math.abs(x - SIDE_DOOR.x) < 2) continue;
          K.window(b, x, y + 1.1, CB.z0, 0, -1, 1.2, 2.0, {
            state: r() < 0.3 ? "boarded" : r() < 0.5 ? "broken" : "glass",
            lintel: 0.2,
            trimTint: [0.8, 0.76, 0.7],
            surround: "granite",
            surroundTint: stone,
          });
        }
      for (let y = 3; y < 22; y += 3.6)
        for (let z = CB.z0 + 3; z < CB.z1 - 1; z += 3.2)
          K.window(b, CB.x0, y + 1.1, z, -1, 0, 1.2, 2.0, {
            state: r() < 0.4 ? "boarded" : "glass",
            lintel: 0.2,
            surround: "granite",
            surroundTint: stone,
          });
      b.boxMM(
        "granite",
        CB.x0 - 0.4,
        22.8,
        CB.z0 - 0.6,
        CB.x1 + 0.4,
        24.3,
        CB.z1,
        { tint: [0.6, 0.58, 0.54] },
      );
      for (let x = CB.x0 + 1; x < CB.x1; x += 2.2)
        b.cyl("granite", x, 1.0, CB.z0 - 0.5, 0.3, 0.3, 5.4, 10, {
          tint: [0.75, 0.73, 0.68],
        });
      // side door
      b.boxMM(
        "paint_black",
        SIDE_DOOR.x - 0.8,
        0,
        CB.z0 - 0.08,
        SIDE_DOOR.x + 0.8,
        2.6,
        CB.z0,
        { tint: [0.15, 0.12, 0.1] },
      );
      b.plate(
        "art",
        SIDE_DOOR.x,
        3.0,
        CB.z0 - 0.1,
        0,
        -1,
        2.6,
        0.4,
        K.signCell("tombs_courts", "CRIMINAL COURTS", 384, 64, {
          bg: "#2a2a2a",
          fg: "#d8d0b8",
          font: "Georgia, serif",
        }),
      );
    }
    // ---- the Bridge of Sighs (enclosed skybridge x 82..90) ----
    {
      const bz0 = 553,
        bz1 = 559,
        by0 = 14,
        by1 = 18.5;
      b.boxMM("limestone", TW.x1, by0 - 0.8, bz0, CB.x0, by0, bz1, {
        tint: [0.8, 0.74, 0.62],
        faces: "nsewtb",
      });
      for (const [z, n] of [
        [bz0, -1],
        [bz1, 1],
      ]) {
        b.face(
          "limestone",
          n < 0 ? CB.x0 : TW.x1,
          by0,
          z,
          n < 0 ? -1 : 1,
          0,
          0,
          0,
          1,
          0,
          CB.x0 - TW.x1,
          by1 - by0,
          { tint: [0.84, 0.78, 0.66] },
        );
        for (let k = 0; k < 3; k++) {
          const wx = TW.x1 + 1.35 + k * 2.65;
          b.plate(
            "glass_dark",
            wx,
            by0 + 2.1,
            z + n * 0.02,
            0,
            n,
            1.5,
            2.6,
            null,
            { tint: [0.25, 0.3, 0.3] },
          );
          b.cyl("limestone", wx, by0 + 3.4, z + n * 0.12, 0.8, 0.8, 0.2, 10, {
            arc0: 0,
            arc: PI,
          });
          for (const s of [-0.4, 0, 0.4])
            b.beam(
              "black_iron",
              wx + s,
              by0 + 0.8,
              z + n * 0.06,
              wx + s,
              by0 + 3.4,
              z + n * 0.06,
              0.03,
              0.03,
            );
        }
      }
      b.boxMM("limestone", TW.x1, by1, bz0 - 0.3, CB.x0, by1 + 0.6, bz1 + 0.3, {
        tint: [0.78, 0.72, 0.6],
      });
      for (let x = TW.x1 + 0.5; x < CB.x0; x += 1.1)
        b.boxMM(
          "limestone",
          x - 0.25,
          by1 + 0.6,
          bz0 - 0.3,
          x + 0.25,
          by1 + 1.1,
          bz1 + 0.3,
          { tint: [0.78, 0.72, 0.6] },
        );
      b.col(TW.x1, by0 - 0.8, bz0, CB.x0, by1 + 0.6, bz1, { tag: "bridge" });
      // gibbet cages hanging beneath
      for (const [cx, cz] of [
        [84.5, 556],
        [87.5, 556.5],
      ]) {
        b.pipe("black_iron", cx, by0 - 0.8, cz, cx, by0 - 4.5, cz, 0.02, 4);
        for (let k = 0; k < 8; k++) {
          const a = (k * PI) / 4;
          b.pipe(
            "black_iron",
            cx + Math.cos(a) * 0.5,
            by0 - 4.5,
            cz + Math.sin(a) * 0.5,
            cx + Math.cos(a) * 0.45,
            by0 - 6.6,
            cz + Math.sin(a) * 0.45,
            0.015,
            3,
          );
        }
        b.cyl("black_iron", cx, by0 - 6.7, cz, 0.5, 0.5, 0.1, 8);
        b.geo("bone", K.sphereGeo(), { x: cx, y: by0 - 5.0, z: cz, s: 0.14 });
        b.pipe("bone", cx, by0 - 5.2, cz, cx + 0.05, by0 - 6.1, cz, 0.08, 5);
      }
    }
    // ---- raider wall & gate along the street ----
    const wallZ = 541.8;
    for (let x = 51; x < 109; x += 2.3) {
      if (x > PORTAL_X - 4 && x < PORTAL_X + 3) continue;
      if (x + 2.3 > SIDE_DOOR.x - 1.3 && x < SIDE_DOOR.x + 1.3) continue; // keep the Courts side door clear (the old test left a panel across it)
      const h = 2.4 + r() * 1.4;
      b.quadGrid(
        r() < 0.5 ? "corrugated" : "rust",
        [x, 0, wallZ],
        [x + 2.3, 0, wallZ],
        [x + 2.3, h, wallZ],
        [x, h, wallZ],
        {
          tint: r.pick([
            [0.7, 0.6, 0.5],
            [0.6, 0.45, 0.35],
            [0.5, 0.5, 0.45],
          ]),
          seg: 3,
        },
      );
      b.quadGrid(
        "rust",
        [x + 2.3, 0, wallZ],
        [x, 0, wallZ],
        [x, h, wallZ],
        [x + 2.3, h, wallZ],
        { tint: [0.4, 0.35, 0.3], seg: 3 },
      );
      b.beam(
        "wood_rotten",
        x,
        0,
        wallZ - 0.1,
        x,
        h + 0.5,
        wallZ - 0.1,
        0.14,
        0.14,
      );
      if (r() < 0.5)
        b.pipe("rust", x + 1, h, wallZ, x + 1.2, h + 1.2, wallZ - 0.4, 0.04, 4); // spikes
      b.col(x, 0, wallZ - 0.15, x + 2.3, h, wallZ + 0.15, {
        tag: "fence",
        walkable: false,
      });
    }
    for (const s of [-1, 1]) {
      const gx = PORTAL_X + (s < 0 ? -4 : 3);
      b.beam("wood", gx, 0, wallZ, gx, 5.2, wallZ, 0.35, 0.35);
      b.pipe("rust", gx, 5.2, wallZ, gx, 6.4, wallZ, 0.05, 4);
      b.geo("bone", K.sphereGeo(), { x: gx, y: 6.5, z: wallZ, s: 0.16 }); // skull on a spike
      b.col(gx - 0.2, 0, wallZ - 0.2, gx + 0.2, 5.2, wallZ + 0.2, {
        walkable: false,
      });
    }
    b.beam(
      "wood",
      PORTAL_X - 4,
      4.8,
      wallZ,
      PORTAL_X + 3,
      4.8,
      wallZ,
      0.3,
      0.4,
    );
    b.plate(
      "art",
      PORTAL_X - 0.5,
      4.3,
      wallZ - 0.22,
      0,
      -1,
      5.0,
      0.8,
      K.signCell("tombs_gate", "THE TOMBS — KEEP OUT OR GET IN", 512, 80, {
        bg: "#3a2a1a",
        fg: "#e8d0a0",
        font: "Impact, Arial Black, sans-serif",
      }),
    );
    b.burn(PORTAL_X + 6, 4, TW.z0, 6, 0.6);
    b.burn(CB.x0 + 4, 18, CB.z0, 5, 0.5);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_tombs_ext";
    K.anchor(ctx, "door", PORTAL_X, 0, TW.z0 - 1.5, false);
    K.anchor(ctx, "gate", PORTAL_X - 0.5, 0, wallZ - 2, false);
    K.anchor(ctx, "sentry1", PORTAL_X - 6, 0, wallZ - 1.4, false);
    K.anchor(ctx, "sentry2", PORTAL_X + 5.5, 0, TW.z0 - 1.2, false);
    K.loot(ctx, "barrel", PORTAL_X - 5, 0, wallZ - 1.2, 0, {
      world: true,
      burning: true,
      container: false,
    });
    K.loot(ctx, "barrel", PORTAL_X + 4.5, 0, wallZ + 1.0, 0, {
      world: true,
      burning: true,
      container: false,
    });
    K.loot(ctx, "sandbags", PORTAL_X - 2, 0, TW.z0 - 1.6, 0, {
      world: true,
      container: false,
      count: 2,
    });
    K.loot(ctx, "car", 60, 0, 537, 1.4, { world: true, burnt: true });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
