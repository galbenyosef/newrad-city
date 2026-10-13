// play-inline-193 03 — the
// Lines 57-497 of readable/play-inline-193.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "katz_ext", grime: 0.6 });
    const r = K.rng("katz_ext");
    const brick = [0.8, 0.62, 0.52];
    // body faces
    b.face("brick_brown", X0, 0, Z1, 1, 0, 0, 0, 1, 0, X1 - X0, H2, {
      tint: brick,
    }); // front (normal +z)
    b.face("brick_brown", X1, 0, Z1, 0, 0, -1, 0, 1, 0, Z1 - Z0, H2, {
      tint: brick,
    }); // east (normal +x)
    b.face("brick_brown", X0, 0, Z0, 0, 0, 1, 0, 1, 0, Z1 - Z0, H2 - 2.5, {
      tint: [0.7, 0.55, 0.46],
    }); // west (−x)
    b.face("brick_brown", X1, 0, Z0, -1, 0, 0, 0, 1, 0, X1 - X0, H2, {
      tint: [0.7, 0.55, 0.46],
    }); // back (−z)
    b.face("concrete_dark", X0, H2, Z1, 1, 0, 0, 0, 0, -1, X1 - X0, Z1 - Z0, {
      uv: "top",
      tint: [0.5, 0.48, 0.45],
    });
    b.col(X0, 0, Z0, X1, H2, Z1, { tag: "building" });
    // ground-floor storefront: dark base, big windows with neon meats, door
    b.boxMM("granite", X0, 0, Z1, X1, 0.7, Z1 + 0.15, {
      tint: [0.35, 0.3, 0.28],
    });
    b.boxMM("granite", X1, 0, Z0 + 14, X1 + 0.15, 0.7, Z1 + 0.15, {
      tint: [0.35, 0.3, 0.28],
    });
    const neonMeats = [
      ["PASTRAMI", "#ff3a2a"],
      ["CORNED BEEF", "#ffd040"],
      ["HOT DOGS", "#40c8ff"],
      ["SALAMI", "#ff4a8a"],
      ["KNISHES", "#80ff60"],
      ["BRISKET", "#ff8030"],
    ];
    const winXs = [219, 227, 235, 243, 251];
    winXs.forEach((wx, k) => {
      K.window(b, wx, 2.4, Z1, 0, 1, 6.6, 3.1, {
        state: k === 1 ? "broken" : k === 3 ? "boarded" : "glass",
        sill: false,
        frame: "paint_red",
        surround: "paint_red",
        surroundTint: [0.5, 0.12, 0.1],
        inset: 0.18,
      });
      if (k !== 3) {
        const [txt, col] = neonMeats[k];
        b.plate(
          "neon",
          wx,
          2.9,
          Z1 + 0.05,
          0,
          1,
          3.4,
          0.8,
          K.neonCell("katz_nm" + k, txt, 384, 96, {
            color: col,
            font: "Arial Black, sans-serif",
          }),
          { tint: k === 1 ? [0.35, 0.35, 0.35] : [1, 1, 1] },
        );
        b.glow(
          wx,
          2.9,
          Z1 + 0.6,
          K.tint(col).map((c) => c * 0.6),
          2.6,
        );
      }
    });
    // east window + door near the corner
    K.window(b, 257, 2.4, Z1, 0, 1, 4.0, 3.1, {
      state: "glass",
      sill: false,
      frame: "paint_red",
      surround: "paint_red",
      surroundTint: [0.5, 0.12, 0.1],
      inset: 0.18,
    });
    b.plate(
      "neon",
      257,
      2.9,
      Z1 + 0.05,
      0,
      1,
      3.2,
      0.8,
      K.neonCell("katz_nm5", "SANDWICHES", 384, 96, {
        color: "#ff3a2a",
        font: "Arial Black, sans-serif",
      }),
    );
    // corner window (the building now runs to the corner at x 270)
    K.window(b, 266.4, 2.4, Z1, 0, 1, 4.4, 3.1, {
      state: "glass",
      sill: false,
      frame: "paint_red",
      surround: "paint_red",
      surroundTint: [0.5, 0.12, 0.1],
      inset: 0.18,
    });
    b.plate(
      "neon",
      266.4,
      2.9,
      Z1 + 0.05,
      0,
      1,
      2.6,
      0.8,
      K.neonCell("katz_nm7", "DELI", 256, 96, {
        color: "#40c8ff",
        font: "Arial Black, sans-serif",
      }),
    );
    b.glow(266.4, 2.9, Z1 + 0.6, [0.25, 0.5, 0.65], 2.4);
    b.boxMM("paint_red", DOOR_X - 1.2, 0, Z1, DOOR_X + 1.2, 3.3, Z1 + 0.12, {
      tint: [0.5, 0.12, 0.1],
    });
    b.plate("glass_dark", DOOR_X, 1.6, Z1 + 0.13, 0, 1, 1.8, 2.8, null, {
      tint: [0.3, 0.3, 0.28],
    });
    b.beam(
      "chrome",
      DOOR_X - 0.8,
      1.1,
      Z1 + 0.2,
      DOOR_X + 0.8,
      1.1,
      Z1 + 0.2,
      0.05,
      0.05,
    );
    b.plate(
      "art",
      DOOR_X,
      3.05,
      Z1 + 0.14,
      0,
      1,
      2.0,
      0.35,
      K.signCell("katz_door", "ENTRANCE — TAKE A TICKET", 384, 64, {
        bg: "#e8e0c0",
        fg: "#8a1a10",
        font: "Arial, sans-serif",
      }),
    );
    // corner windows on the east side
    for (const wz of [428, 421])
      K.window(b, X1, 2.4, wz, 1, 0, 5.0, 3.1, {
        state: wz === 421 ? "boarded" : "glass",
        sill: false,
        frame: "paint_red",
        surround: "paint_red",
        surroundTint: [0.5, 0.12, 0.1],
        inset: 0.18,
      });
    b.plate(
      "neon",
      X1 + 0.05,
      2.9,
      428,
      1,
      0,
      3.4,
      0.8,
      K.neonCell("katz_nm6", "CORNED BEEF", 384, 96, {
        color: "#ffd040",
        font: "Arial Black, sans-serif",
      }),
    );
    // the long sign band (front + east return)
    const band = K.paint(
      "art",
      "katz_band",
      1024,
      96,
      function (x, X, Y, W, Hh) {
        x.fillStyle = "#f0e2a8";
        x.fillRect(X, Y, W, Hh);
        x.strokeStyle = "#b01c12";
        x.lineWidth = 6;
        x.strokeRect(X + 5, Y + 5, W - 10, Hh - 10);
        x.fillStyle = "#b01c12";
        x.font = "bold 64px Arial Black, Arial, sans-serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText(
          "KATZ'S  DELICATESSEN",
          X + W * 0.42,
          Y + Hh / 2 + 3,
          W * 0.7,
        );
        x.font = "italic bold 30px Georgia, serif";
        x.fillText("Since 1888", X + W * 0.88, Y + Hh / 2, W * 0.2);
        K.stains(x, X, Y, W, Hh, 14, 5, 0.4);
        K.streaks(x, X, Y, W, Hh, 20, 6, 0.3);
      },
    );
    b.boxMM("paint_red", X0 + 1, GH - 0.1, Z1, X1, GH + 1.5, Z1 + 0.35, {
      tint: [0.45, 0.1, 0.08],
    });
    b.plate(
      "art",
      (X0 + 1 + X1) / 2,
      GH + 0.7,
      Z1 + 0.36,
      0,
      1,
      X1 - X0 - 2,
      1.3,
      band,
      { off: 0.01 },
    );
    b.boxMM(
      "paint_red",
      X1,
      GH - 0.1,
      Z0 + 12,
      X1 + 0.35,
      GH + 1.5,
      Z1 + 0.35,
      { tint: [0.45, 0.1, 0.08] },
    );
    b.plate(
      "art",
      X1 + 0.36,
      GH + 0.7,
      (Z0 + 12 + Z1) / 2,
      1,
      0,
      Z1 - Z0 - 12,
      1.3,
      K.signCell("katz_band_e", "KATZ'S — THAT'S ALL!", 768, 96, {
        bg: "#f0e2a8",
        fg: "#b01c12",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.01 },
    );
    // bulbs along the band
    for (let x = X0 + 2; x < X1; x += 1.6)
      b.glow(x, GH + 1.55, Z1 + 0.4, [1, 0.85, 0.55], 0.7);
    // the vertical corner blade
    {
      const cx = X1 + 0.9,
        cz = Z1 + 0.9,
        yaw = PI / 4;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      b.box("paint_yellow", cx, 5.6, cz, 1.4, 5.4, 0.35, {
        yaw,
        tint: [0.95, 0.8, 0.35],
      });
      b.box("paint_red", cx, 5.45, cz, 1.55, 0.15, 0.4, { yaw });
      b.box("paint_red", cx, 11.0, cz, 1.55, 0.2, 0.4, { yaw });
      const vt = K.neonCell("katz_vert", "KATZ'S", 128, 640, {
        color: "#ff2a1a",
        vertical: true,
        font: "Arial Black, sans-serif",
      });
      for (const sd of [-1, 1]) {
        const nx = s * sd,
          nz = c * sd; // box local ±z
        b.plate(
          "neon",
          cx + nx * 0.18,
          8.3,
          cz + nz * 0.18,
          nx,
          nz,
          1.2,
          5.1,
          vt,
          { off: 0.01 },
        );
        b.glow(cx + nx * 0.8, 8.3, cz + nz * 0.8, [1, 0.25, 0.15], 4.5);
      }
      for (const y of [6, 10])
        b.beam(
          "black_iron",
          cx - 0.5 * c,
          y,
          cz + 0.5 * s,
          X1 - 0.02,
          y,
          Z1 - 0.02,
          0.07,
          0.07,
        );
    }
    // upper floor windows, cornice
    for (let x = X0 + 3; x < X1 - 1; x += 4.2) {
      const u = r();
      K.window(b, x, GH + 3.2, Z1, 0, 1, 1.3, 2.2, {
        state: u < 0.3 ? "boarded" : u < 0.55 ? "broken" : "glass",
        lintel: 0.2,
        trimTint: [0.8, 0.76, 0.66],
        reveal: "brick_brown",
      });
    }
    for (let z = Z0 + 3; z < Z1 - 1; z += 4.2)
      K.window(b, X1, GH + 3.2, z, 1, 0, 1.3, 2.2, {
        state: r() < 0.4 ? "boarded" : "glass",
        lintel: 0.2,
        trimTint: [0.8, 0.76, 0.66],
      });
    b.boxMM("metal", X0 - 0.2, H2 - 0.4, Z1, X1 + 0.5, H2 + 0.25, Z1 + 0.6, {
      tint: [0.35, 0.3, 0.26],
    });
    b.boxMM("metal", X1, H2 - 0.4, Z0, X1 + 0.6, H2 + 0.25, Z1 + 0.5, {
      tint: [0.35, 0.3, 0.26],
    });
    // the SEND A SALAMI ghost ad on the east wall (upper)
    const salami = K.signCell(
      "katz_salami",
      "SEND A SALAMI\nTO YOUR BOY IN THE ARMY",
      768,
      256,
      {
        bg: null,
        fg: "rgba(240,225,190,0.8)",
        font: "Georgia, serif",
        weather: true,
      },
    );
    b.plate("decal", X1 + 0.02, 8.2, Z0 + 7, 1, 0, 11, 3.6, salami);
    // west (Bowery) & rear elevations: tenement sash windows, a fire escape, the painted pickle ad
    for (let z = Z0 + 4; z < Z1 - 2; z += 4.4) {
      K.window(b, X0, GH + 2.2, z, -1, 0, 1.2, 1.9, {
        state: r() < 0.35 ? "boarded" : r() < 0.5 ? "broken" : "glass",
        lintel: 0.2,
        trimTint: [0.8, 0.76, 0.66],
        reveal: "brick_brown",
      });
      if (z > Z0 + 12)
        K.window(b, X0, 2.2, z, -1, 0, 1.6, 2.6, {
          state: "boarded",
          sill: true,
          trimTint: [0.6, 0.56, 0.5],
          reveal: "brick_brown",
        });
    }
    K.fireEscape(b, X0, Z0 + 15, -1, 0, 5.4, [GH + 0.1], { seed: 31 });
    K.ghostSign(
      b,
      X0,
      2.4,
      Z0 + 5.5,
      -1,
      0,
      8.5,
      3.6,
      ["PICKLES", "SOUR · HALF-SOUR · BARREL CURED", "ASK FOR KATZ'S"],
      {
        key: "katz_ghost_pickles",
        fg: "rgba(235,225,190,0.8)",
        bg: "rgba(40,70,40,0.45)",
      },
    );
    for (let x = X0 + 4; x < X1 - 2; x += 4.6) {
      K.window(b, x, GH + 3.2, Z0, 0, -1, 1.3, 2.2, {
        state: r() < 0.4 ? "boarded" : "dark",
        lintel: 0.2,
        trimTint: [0.8, 0.76, 0.66],
        reveal: "brick_brown",
      });
      K.window(b, x, 2.2, Z0, 0, -1, 1.4, 2.2, {
        state: r() < 0.6 ? "boarded" : "dark",
        sill: true,
        trimTint: [0.6, 0.56, 0.5],
        reveal: "brick_brown",
      });
    }
    // collapse on the west end: broken top, rubble, girders
    for (let k = 0; k < 6; k++)
      b.box(
        "brick_brown",
        X0 + 0.5 + k * 1.3,
        H2 - 2.5,
        Z0 + 6 + r() * 16,
        1.2,
        0.5 + r() * 1.2,
        1.0,
        { tint: brick },
      );
    K.rubble(b, X0 - 1.5, 0, Z1 + 2, 2.6, 1.3, { seed: 3 });
    b.burn(X0 + 3, 6, Z1, 6, 0.7);
    // egg sacs & slime oozing out of a basement grate by the door
    b.hplate(
      "decal",
      DOOR_X - 4,
      0.02,
      Z1 + 1.4,
      2.2,
      1.6,
      0.3,
      K.decal("roach", 1),
    );
    b.hplate("decal", 232, 0.02, Z1 + 1.2, 1.6, 1.2, 1.1, K.decal("roach", 2));
    b.plate(
      "decal",
      244,
      1.2,
      Z1 + 0.02,
      0,
      1,
      3.4,
      1.2,
      K.tag("ROACHES INSIDE!", "#e8e040", 256, 96, { rot: 0.04 }),
    );
    katzRoof(b, r);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_katz_ext";
    K.anchor(ctx, "door", DOOR_X, 0, Z1 + 1.4, false);
    K.loot(ctx, "fizzo_machine", 253.8, 0, Z1 + 0.8, PI, {
      world: true,
      loot: "fizzo_machine",
    });
    K.loot(ctx, "trash_can", 224, 0, Z1 + 1.2, 0, {
      world: true,
      loot: "trash_can",
    });
    K.loot(ctx, "mailbox", 266, 0, Z1 + 1.6, PI, {
      world: true,
      loot: "newspaper_box",
      name: "Newspaper Box",
    });
  }

  /**
   * Loop round 2 — the roof was one flat 60 × 31 m slab in every aerial. Now: a brick parapet with coping, tar
   * patches, the kitchen's big extract hoods and ducts over the back, HVAC boxes, a timber water tank on a steel
   * stand, a stair bulkhead, a skylight row over the dining hall and the collapsed west end open to the sky.
   * All in the existing merged meshes; colliders only for the solid pieces (the roof is not reachable in play).
   */
