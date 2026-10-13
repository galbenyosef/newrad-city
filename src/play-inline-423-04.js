// play-inline-423 04 — tint
// Lines 1395-1891 of readable/play-inline-423.pretty.js (statement-aligned).
  function buildFerry(ctx, b, A, r) {
    const FX0 = -4.2,
      FX1 = 4.2,
      FZ0 = 30,
      FZ1 = 62,
      FH = 2.7;
    const BOX = [FX0 - 0.5, -4, FZ0 - 0.5, FX1 + 0.5, 3, FZ1 + 0.5];
    const warm = [1, 0.74, 0.46];
    // windows: gaps on the long walls, harbour-view plates outside them
    const WZ = [];
    for (let z = 35.2; z < 60.5; z += 2.3) WZ.push(z);
    for (const z of WZ)
      for (const x of [FX0, FX1])
        K.gap(ctx, x, z, 1.5, 1.0, 1.05, { casing: false });
    K.gap(ctx, 0, 33, 1.6, 0, 2.2, { casing: false }); // vestibule → cabin bulkhead door
    K.gap(ctx, FX0, 31.6, 1.2, 0, 2.1, { casing: false }); // side door (outside)
    K.gap(ctx, 0, FZ0, 1.3, 0, 2.1, { casing: false }); // gangway door
    // vestibule
    K.room(b, ctx, {
      x0: FX0,
      z0: FZ0,
      x1: FX1,
      z1: 33,
      y: 0,
      h: FH,
      floor: "checker",
      fc: [0.62, 0.6, 0.56],
      wall: "hull_orange",
      wc: [0.8, 0.72, 0.62],
      ceil: "metal",
      cc: [0.7, 0.68, 0.62],
      trimMat: "rubber",
      open: { s: true },
    });
    // cabin
    K.room(b, ctx, {
      x0: FX0,
      z0: 33,
      x1: FX1,
      z1: FZ1,
      y: 0,
      h: FH,
      floor: "terrazzo",
      fc: [0.66, 0.68, 0.6],
      wall: "plaster",
      wc: [0.86, 0.82, 0.7],
      wain: "metal",
      wainC: [0.76, 0.44, 0.24],
      wainH: 0.95,
      ceil: "metal",
      cc: [0.78, 0.76, 0.7],
      trimMat: "rubber",
    });
    // window frames (cream) + harbour views beyond
    WZ.forEach((z, i) => {
      for (const [x, nx] of [
        [FX0, 1],
        [FX1, -1],
      ]) {
        const view = K.harborView((i + (nx > 0 ? 0 : 3)) % 4, 256, 128);
        b.plate("pics", x - nx * 0.35, 1.52, z, nx, 0, 2.2, 1.4, view, {
          off: 0,
        });
        const broken = r() < 0.2;
        if (!broken)
          b.quadN(
            "glass_clear",
            [x - nx * 0.02, 1.0, z - 0.75],
            [x - nx * 0.02, 1.0, z + 0.75],
            [x - nx * 0.02, 2.05, z + 0.75],
            [x - nx * 0.02, 2.05, z - 0.75],
            [nx, 0, 0],
            { tint: [0.6, 0.66, 0.62] },
          );
        b.boxMM(
          "cream_paint",
          x - 0.12,
          0.96,
          z - 0.82,
          x + 0.12,
          1.02,
          z + 0.82,
          { tint: [0.9, 0.86, 0.76] },
        );
        b.boxMM(
          "cream_paint",
          x - 0.12,
          2.05,
          z - 0.82,
          x + 0.12,
          2.1,
          z + 0.82,
          { tint: [0.9, 0.86, 0.76] },
        );
        b.light(x + nx * 0.6, 1.6, z, [0.66, 0.72, 0.74], 0.35, 3.2, {
          box: BOX,
        });
      }
    });
    // hull wall colliders beyond the window gaps (the wallRun leaves the openings; block them)
    for (const x of [FX0, FX1])
      b.col(x - 0.15, 0.9, 33, x + 0.15, 2.2, FZ1, {
        tag: "hull",
        walkable: false,
      });
    // ceiling fluorescent tubes (some dead)
    for (let z = 35; z < 60; z += 4)
      for (const x of [-1.6, 1.6])
        K.lamp(
          b,
          x,
          FH - 0.06,
          z,
          "tube",
          [0.85, 0.95, 0.9],
          (z + x) % 3 === 0 ? 0 : 0.35,
          5,
          {
            ceil: FH,
            alongX: false,
            len: 1.2,
            dead: (z * 3 + x) % 7 === 0,
            lightOpts: { box: BOX },
          },
        );
    // seats: window benches both sides + back-to-back centre benches (z 34..50)
    const seatO = [0.95, 0.56, 0.2];
    for (let z = 34.2; z < 50; z += 2.3) {
      for (const [x, dir] of [
        [FX0 + 0.35, 1],
        [FX1 - 0.35, -1],
      ]) {
        b.box("flat", x, 0.42, z + 1.0, 0.45, 0.07, 2.0, { tint: seatO });
        b.box("flat", x - dir * 0.2, 0.45, z + 1.0, 0.06, 0.5, 2.0, {
          tint: seatO.map((v) => v * 0.85),
        });
        b.box("metal", x, 0, z + 1.0, 0.3, 0.42, 1.8, {
          tint: [0.5, 0.5, 0.48],
        });
      }
      if (z < 46) {
        for (const e of [-1, 1]) {
          b.box("flat", e * 0.5, 0.42, z + 1.0, 0.5, 0.07, 1.9, {
            tint: seatO,
          });
          b.box("flat", 0, 0.45, z + 1.0, 0.06, 0.55, 1.9, {
            tint: seatO.map((v) => v * 0.85),
          });
        }
        b.box("metal", 0, 0, z + 1.0, 1.0, 0.42, 1.7, {
          tint: [0.5, 0.5, 0.48],
        });
        b.col(-1.0, 0, z + 0.1, 1.0, 0.5, z + 1.9, {
          tag: "furniture",
          surface: "metal",
        });
      }
    }
    for (const x of [FX0 + 0.35, FX1 - 0.35])
      b.col(x - 0.3, 0, 34.2, x + 0.3, 0.5, 50, {
        tag: "furniture",
        surface: "metal",
      });
    // puddles: the Corbin is sinking (until the pumps run)
    for (let k = 0; k < 7; k++)
      b.hplate(
        "decal",
        (r() - 0.5) * 5,
        0.012 + k * 0.0004,
        34 + r() * 24,
        1.5 + r() * 2,
        1.2 + r() * 1.5,
        r() * 3,
        K.decal("puddle", 20 + k),
      );
    // engine hatch (open) with ladder going down
    b.boxMM("rust", 1.8, 0, 39.4, 3.0, 0.08, 39.5, { tint: [0.5, 0.45, 0.4] });
    b.boxMM("rust", 1.8, 0, 40.5, 3.0, 0.08, 40.6, { tint: [0.5, 0.45, 0.4] });
    b.boxMM("paint_black", 1.9, 0.005, 39.5, 2.9, 0.01, 40.5, {
      tint: [0.02, 0.02, 0.02],
    });
    b.quadN(
      "metal_dark",
      [1.8, 0.08, 39.4],
      [3.0, 0.08, 39.4],
      [3.0, 1.2, 39.1],
      [1.8, 1.2, 39.1],
      [0, 0.3, 1],
      { tint: [0.45, 0.42, 0.4] },
    );
    b.plate(
      "art",
      2.4,
      1.4,
      38.95,
      0,
      -1,
      0.8,
      0.3,
      K.signCell("wh_engine", "ENGINE ROOM", 256, 64, {
        bg: "#c8a030",
        fg: "#1a1a1a",
        font: "Impact, sans-serif",
      }),
      { off: 0.01 },
    );
    // upper-deck stair, chained off
    K.stairs(b, 3.0, 33.1, 4.1, 36.4, 0, 1.6, "+z", {
      mat: "metal",
      rail: "l",
      railMat: "rust",
      solid: false,
    });
    b.pipe("rust", 2.9, 0.9, 33.3, 2.9, 0.8, 36.4, 0.02, 4);
    b.plate(
      "art",
      2.88,
      1.2,
      34.6,
      -1,
      0,
      0.9,
      0.35,
      K.signCell("wh_updeck", "UPPER DECK CLOSED\nUNSAFE", 256, 96, {
        bg: "#e8e0d0",
        fg: "#a01a14",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.01 },
    );
    b.col(2.9, 0, 33.1, 4.2, 2.6, 36.6, { tag: "blocked", walkable: false });
    // vestibule dressing: life jackets locker, ferry map, lifebuoy
    b.boxMM("hull_orange", FX1 - 0.5, 0, 30.3, FX1 - 0.02, 2.0, 32.6, {
      tint: [0.9, 0.62, 0.36],
    });
    b.plate(
      "art",
      FX1 - 0.52,
      1.6,
      31.45,
      -1,
      0,
      1.4,
      0.4,
      K.signCell("wh_lifejackets", "LIFE JACKETS", 256, 64, {
        bg: "#e8e0d0",
        fg: "#1a1a1a",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.0 },
    );
    K.lifebuoy(b, 1.6, 1.6, FZ0 + 0.1, 0, 1);
    b.light(0, 2.2, 31.5, [0.8, 0.84, 0.82], 0.55, 4.5, { box: BOX });
    b.plate(
      "art",
      -2.0,
      1.5,
      FZ0 + 0.12,
      0,
      1,
      1.6,
      0.9,
      K.signCell(
        "wh_welcome",
        "WELCOME ABOARD\nM/V MARGARET CORBIN\nCity of New York · Dept. of Marine & Aviation",
        384,
        192,
        {
          bg: "#1c2a3a",
          fg: "#e8e0c0",
          font: "Georgia, serif",
          border: "#c8a040",
        },
      ),
      { off: 0.0 },
    );

    // ---------------- THE SLACK TIDE (stern, z 50..62) ----------------
    const BZ = 56.2;
    b.boxMM("mahogany", -3.0, 0, BZ - 0.35, 2.8, 1.05, BZ + 0.35, {
      tint: [0.5, 0.3, 0.18],
    });
    b.boxMM("brass_old", -3.05, 1.05, BZ - 0.42, 2.85, 1.1, BZ + 0.42, {
      tint: [0.75, 0.6, 0.36],
    });
    b.col(-3.0, 0, BZ - 0.4, 2.8, 1.1, BZ + 0.4, {
      tag: "counter",
      surface: "wood",
    });
    b.boxMM("brass_old", -3.0, 0.12, BZ - 0.42, 2.8, 0.16, BZ - 0.38, {
      tint: [0.7, 0.56, 0.34],
    }); // foot rail
    for (let k = 0; k < 6; k++) {
      const x = -2.6 + k * 1.0;
      b.cyl("chrome", x, 0, BZ - 0.95, 0.03, 0.03, 0.7, 6);
      b.cyl("leather_red", x, 0.7, BZ - 0.95, 0.2, 0.2, 0.08, 10);
      b.col(x - 0.2, 0, BZ - 1.15, x + 0.2, 0.75, BZ - 0.75, {
        tag: "stool",
        surface: "wood",
      });
    }
    // back bar: shelves of bottles against the stern bulkhead + mirror
    K.shelf(b, -1.2, 0, FZ1 - 0.3, PI, 4.2, {
      h: 2.2,
      d: 0.35,
      levels: 4,
      items: ["bottle", "bottle", "jar", "bottle"],
      col: false,
      mat: "mahogany",
      seed: 95,
    });
    b.plate("glass", -1.2, 1.9, FZ1 - 0.12, 0, -1, 3.6, 0.6, null, {
      off: 0.0,
      tint: [0.4, 0.44, 0.42],
    });
    b.col(-3.4, 0, FZ1 - 0.5, 1.0, 2.2, FZ1, { tag: "shelf", walkable: false });
    b.cyl("rust", 2.6, 0, FZ1 - 0.6, 0.35, 0.35, 1.0, 10, {
      tint: [0.5, 0.4, 0.3],
    }); // still
    b.pipe("copper", 2.6, 1.0, FZ1 - 0.6, 3.4, 1.6, FZ1 - 0.4, 0.03, 5);
    b.cyl("copper", 3.4, 1.0, FZ1 - 0.4, 0.15, 0.15, 0.6, 8);
    // neon sign over the bar
    const neon = K.neonCell("wh_slacktide", "SLACK TIDE", 512, 128, {
      color: "#ff4fb0",
      font: "Georgia, serif",
      italic: true,
    });
    b.plate("neon", -0.3, 2.35, BZ + 0.45, 0, -1, 2.4, 0.6, neon, { off: 0.0 });
    b.glow(-0.3, 2.35, BZ + 0.2, [0.9, 0.25, 0.6], 3);
    b.light(-0.3, 2.2, BZ - 0.8, [1, 0.35, 0.7], 0.9, 5.5, { box: BOX });
    const neon2 = K.neonCell("wh_cold", "GROG · CHOWDER", 512, 96, {
      color: "#40e0d0",
    });
    b.plate("neon", FX1 - 0.03, 2.1, 53.5, -1, 0, 2.0, 0.4, neon2, {
      off: 0.0,
    });
    b.light(3.2, 2.0, 53.5, [0.3, 0.9, 0.85], 0.55, 4.5, { box: BOX });
    // cable-spool tables with stools and candles
    for (const [x, z] of [
      [-2.2, 51.4],
      [1.8, 51.8],
      [-1.6, 48.4],
      [2.1, 48.6],
    ]) {
      b.cyl("wood_rotten", x, 0, z, 0.55, 0.55, 0.06, 12, {
        tint: [0.6, 0.46, 0.32],
      });
      b.cyl("wood_rotten", x, 0.06, z, 0.2, 0.2, 0.6, 8, {
        tint: [0.5, 0.4, 0.3],
      });
      b.cyl("wood_rotten", x, 0.66, z, 0.6, 0.6, 0.07, 12, {
        tint: [0.6, 0.46, 0.32],
        bottom: true,
      });
      b.col(x - 0.5, 0, z - 0.5, x + 0.5, 0.73, z + 0.5, {
        tag: "table",
        surface: "wood",
      });
      b.cyl("lamp", x + 0.1, 0.73, z, 0.025, 0.025, 0.12, 6, {
        tint: [1, 0.7, 0.35],
      });
      b.glow(x + 0.1, 0.9, z, [0.8, 0.45, 0.15], 0.6);
      b.light(x, 1.1, z, warm, 0.5, 3, { box: BOX });
      for (let k = 0; k < 3; k++) {
        const a = k * 2.1 + r();
        b.box(
          "rust",
          x + Math.cos(a) * 0.85,
          0,
          z + Math.sin(a) * 0.85,
          0.35,
          0.45,
          0.35,
          { tint: [0.5, 0.42, 0.34] },
        );
      }
      b.cyl("glass", x - 0.2, 0.73, z + 0.15, 0.04, 0.04, 0.12, 6, {
        tint: [0.6, 0.5, 0.3],
      });
    }
    K.stringLights(
      b,
      [
        [FX0 + 0.2, 2.5, 47],
        [0, 2.3, 52],
        [FX1 - 0.2, 2.5, 47],
      ],
      { sag: 0.25, light: 0.35, radius: 4 },
    );
    K.stringLights(
      b,
      [
        [FX0 + 0.2, 2.5, 50.5],
        [FX1 - 0.2, 2.5, 55.5],
      ],
      { sag: 0.2, light: 0.3, radius: 4 },
    );
    // jukebox (radio) by the bar
    b.boxMM("mahogany", FX0 + 0.1, 0, 52.6, FX0 + 0.75, 1.5, 53.6, {
      tint: [0.5, 0.3, 0.2],
    });
    K.dome(b, "lamp", FX0 + 0.42, 1.5, 53.1, 0.45, 0.35, 0, 8, 2, false, {
      tint: [1, 0.55, 0.3],
    });
    b.glow(FX0 + 0.5, 1.4, 53.1, [0.9, 0.45, 0.2], 1.4);
    A("tilly", 0, 0, 58.2, 0);
    A("loot3", 0, 0, 58.6, PI);
    // bar's cooler + register
    K.loot(ctx, "cash_register", 1.9, 1.1, BZ, PI, {});
    K.loot(ctx, "fridge", -3.6, 0, 60.8, HP, { loot: "cooler" });
    K.loot(ctx, "radio", FX0 + 0.42, 1.5, 53.1, HP, { station: "galaxy" });

    // ---------------- ENGINE ROOM (below, y −3.4) ----------------
    const EY = -3.4,
      EZ0 = 33,
      EZ1 = 48;
    const EBOX = [FX0 - 0.5, EY - 0.5, EZ0 - 0.5, FX1 + 0.5, 0.2, EZ1 + 0.5];
    K.room(b, ctx, {
      x0: -4.0,
      z0: EZ0,
      x1: 4.0,
      z1: EZ1,
      y: EY,
      h: 3.1,
      floor: "planks_iron",
      fc: [0.52, 0.5, 0.46],
      wall: "hull_dark",
      wc: [0.7, 0.66, 0.6],
      ceil: "metal_dark",
      cc: [0.45, 0.43, 0.4],
      trimMat: "rust",
      surface: "metal",
    });
    // twin diesels
    for (const x of [-1.9, 1.1]) {
      b.boxMM("metal_dark", x - 0.7, EY, 35, x + 0.7, EY + 1.5, 43, {
        tint: [0.4, 0.44, 0.42],
      });
      for (let z = 35.6; z < 43; z += 1.0) {
        b.cyl("metal_dark", x, EY + 1.5, z, 0.22, 0.22, 0.4, 8, {
          tint: [0.45, 0.46, 0.44],
        });
        b.pipe("rust", x, EY + 1.9, z, x + 0.5, EY + 2.6, z, 0.05, 5);
      }
      b.pipe("rust", x + 0.5, EY + 2.6, 35.4, x + 0.5, EY + 2.6, 43.2, 0.12, 8);
      b.col(x - 0.7, EY, 35, x + 0.7, EY + 1.5, 43, {
        tag: "engine",
        surface: "metal",
      });
    }
    // bilge pump with its empty governor housing (Gus's station)
    b.cyl("ferry_green", -2.6, EY, 45.3, 0.45, 0.45, 0.9, 12, {
      tint: [0.5, 0.62, 0.54],
    });
    b.cyl("ferry_green", -2.6, EY + 0.9, 45.3, 0.25, 0.3, 0.35, 10, {
      tint: [0.5, 0.62, 0.54],
    });
    b.pipe("rust", -2.6, EY + 0.45, 45.3, -3.9, EY + 0.45, 45.3, 0.1, 8);
    b.pipe("rust", -2.6, EY + 0.45, 45.3, -2.6, EY + 0.45, 47.9, 0.1, 8);
    b.cyl("rust", -1.2, EY, 46.6, 0.12, 0.12, 1.2, 6);
    b.box("rust", -1.2, EY + 1.2, 46.6, 0.5, 0.06, 0.1); // hand pump
    b.col(-3.1, EY, 44.8, -2.1, EY + 1.3, 45.8, {
      tag: "pump",
      surface: "metal",
    });
    K.lamp(b, -2.2, EY + 2.6, 45.5, "cage", [1, 0.8, 0.5], 0.9, 5, {
      ceil: EY + 3.1,
      lightOpts: { box: EBOX },
    });
    K.lamp(b, 1.5, EY + 2.6, 38, "cage", [1, 0.8, 0.5], 0.6, 5, {
      ceil: EY + 3.1,
      lightOpts: { box: EBOX },
    });
    b.light(2.4, EY + 2.5, 40, [0.7, 0.72, 0.7], 0.4, 4, { box: EBOX }); // daylight down the hatch
    K.ladder(b, 2.4, 39.5, EY, 0, 0, 1, { w: 0.55 });
    b.boxMM("wood", 2.6, EY, 46.5, 3.9, EY + 0.85, 47.8, {
      tint: [0.55, 0.42, 0.3],
    }); // workbench
    K.shelf(b, 3.75, EY, 44.2, -HP, 2.0, {
      h: 1.8,
      d: 0.3,
      levels: 3,
      items: ["can", "box", "paint"],
      col: false,
      mat: "metal",
      seed: 96,
    });
    A("gus", -1.8, EY, 45.0, HP);
    K.loot(ctx, "toolbox", 3.2, EY + 0.85, 47.1, PI, { loot: "toolbox" });
    K.note(ctx, "ph2_note_wh_gus", 3.0, EY + 0.87, 46.8, {
      type: "note",
      name: "Gus's Maintenance Log",
      title: "M/V Margaret Corbin — engine log",
      text: "Day 212: Governor on No. 1 bilge pump sheared. Pump overspeeds, shakes the mount, water wins.\nDay 213: Tried a governor off an Eagle Motors sedan. Ha.\nDay 215: Hand pump, 4 hours on, 4 off. Tilly takes a shift. Tilly is stronger than me.\nDay 220: Remembered the fireboat at Pier A — DUGGAN. Same Worthington pumps. Same governors. Shellbacks on the pier though. Too old for shellbacks.\nDay 221: Pump. Pump. Pump.",
    });
  }

