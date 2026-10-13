/* src/poi_eastvillage/20_orourkes.js */
/* =====================================================================
 * NEW RAD CITY — poi_eastvillage / 20_orourkes.js
 * O'ROURKE'S OLD ALE HOUSE (East 7th Street) — friendly settlement.
 *
 * EXTERIOR (on G.LAYOUT.SITES 'orourkes' — x 210..270, z 362..393 after
 *   the round-1 move beside Cooper Union — street to the south; all
 *   exterior geometry is authored in SITE-LOCAL metres (0,0 = the site's
 *   NW corner) and placed by the builder offset read from the layout):
 *   a row of tenements — O'Rourke's own narrow brick walk-up with the
 *   green wooden saloon front, the OLD ALE HOUSE signboard, the lantern
 *   over the door and the black fire escape — flanked by a laundry
 *   tenement, a half-collapsed brownstone with a painted ghost ad, and
 *   the vacant lot the regulars turned into O'Rourke's Beer Garden.
 * INTERIOR (cell orourkes): the front bar room (sawdust floor, the long
 *   mahogany bar, the gas lamp hung with 1965 wishbones, the pot-belly
 *   stove, walls buried in memorabilia, Houdini's handcuffs on the rail)
 *   → back room (Peter Cooper's chair, the fireplace, the long table)
 *   → kitchen (cheese & onions) → stair hall: up to the O'Rourke family
 *   apartment, down to the cellar (casks, the brew kettle, a giant roach
 *   breach) → cellar hatch to the sidewalk (loop).
 * NPCs: Deck O'Rourke (bartender, merchant), Tess (cook),
 *   Big Sully (door), Abigail Hewitt (Cooper Union quest), Sgt. Finnegan.
 * Quests: "Cellar Dwellers" (clear the cellar), and it hands out
 *   "Honest Graft" (Tammany Hall) and "Right Makes Might" (Cooper Union).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const EV = G._pev;
  const K = EV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // ---- site placement: read from the layout (never hard-code world x/z) ----
  const SITE = (G.LAYOUT.getSite && G.LAYOUT.getSite("orourkes")) || {
    x0: 210,
    x1: 270,
    z0: 362,
    z1: 393,
  };
  const SO = { x: SITE.x0, y: 0, z: SITE.z0 }; // site-local → world offset
  const wx = (x) => x + SO.x,
    wz = (z) => z + SO.z; // site-local → world
  // site-local constants (x across the 60 m frontage, z from the back lot line to the street)
  const SW = SITE.x1 - SITE.x0; // frontage width (60)
  const FZ = SITE.z1 - SITE.z0 - 0.5; // street façade line (30.5)
  const BZ0 = 8; // back walls
  const MX0 = 15,
    MX1 = 24; // O'Rourke's building
  const DOOR_X = 19.5; // the saloon door
  const HATCH = { x: 22.6, z: FZ + 1.5 }; // sidewalk cellar hatch
  const LX0 = 38,
    LX1 = SW - 0.5,
    LZ0 = 2; // the Beer Garden (vacant lot)
  const GATE0 = 46.5,
    GATE1 = 50.5,
    GATE_X = (GATE0 + GATE1) / 2;
  const UP = 4.0,
    CY = -3.2; // apartment floor, cellar floor (local)

  // ==================================================================
  // helpers
  // ==================================================================
  /** NYC fire escape on a façade facing +z: landings at each floor, ladders, drop ladder. */
  function fireEscape(b, x0, x1, fz, floors) {
    const D = 1.2;
    floors.forEach((y, i) => {
      b.boxMM("black_iron", x0, y - 0.06, fz, x1, y, fz + D, {
        tint: [0.16, 0.15, 0.14],
        faces: "nsewtb",
      });
      for (let x = x0 + 0.2; x < x1; x += 0.25)
        b.beam(
          "black_iron",
          x,
          y + 0.005,
          fz + 0.05,
          x,
          y + 0.005,
          fz + D - 0.05,
          0.02,
          0.02,
        ); // grating
      K.railing(b, x0, fz + D, x1, fz + D, y, {
        h: 1.0,
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.14,
        col: false,
      });
      K.railing(b, x0, fz, x0, fz + D, y, {
        h: 1.0,
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.14,
        col: false,
      });
      K.railing(b, x1, fz, x1, fz + D, y, {
        h: 1.0,
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.14,
        col: false,
      });
      // brackets
      for (const x of [x0 + 0.2, x1 - 0.2])
        b.beam(
          "black_iron",
          x,
          y - 0.8,
          fz,
          x,
          y - 0.05,
          fz + D - 0.1,
          0.05,
          0.05,
        );
      // ladder to the next landing
      if (i < floors.length - 1) {
        const yn = floors[i + 1],
          lx = i % 2 ? x0 + 0.7 : x1 - 0.7,
          dir = i % 2 ? 1 : -1;
        for (const s of [-0.22, 0.22])
          b.beam(
            "black_iron",
            lx + s,
            y,
            fz + D - 0.35,
            lx + s + dir * 1.4,
            yn,
            fz + D - 0.35,
            0.04,
            0.04,
          );
        const n = Math.round((yn - y) / 0.3);
        for (let k = 1; k < n; k++) {
          const t = k / n;
          b.beam(
            "black_iron",
            lx - 0.22 + dir * 1.4 * t,
            y + (yn - y) * t,
            fz + D - 0.35,
            lx + 0.22 + dir * 1.4 * t,
            y + (yn - y) * t,
            fz + D - 0.35,
            0.03,
            0.04,
          );
        }
      }
    });
    // counterweighted drop ladder under the first landing
    const y0 = floors[0],
      lx = x0 + 0.8;
    for (const s of [-0.2, 0.2])
      b.beam(
        "black_iron",
        lx + s,
        y0 - 2.4,
        fz + D - 0.2,
        lx + s,
        y0,
        fz + D - 0.2,
        0.04,
        0.04,
      );
    for (let yy = y0 - 2.2; yy < y0; yy += 0.3)
      b.beam(
        "black_iron",
        lx - 0.2,
        yy,
        fz + D - 0.2,
        lx + 0.2,
        yy,
        fz + D - 0.2,
        0.03,
        0.03,
      );
  }
  /** Tenement body with sash windows on the street face. */
  function tenement(b, r, x0, x1, h, o) {
    o = o || {};
    const mat = o.mat || "brick_red",
      tint = o.tint || [0.85, 0.62, 0.52];
    b.face(mat, x0, 0, FZ, 1, 0, 0, 0, 1, 0, x1 - x0, h, { tint });
    b.face(mat, x1, 0, BZ0, -1, 0, 0, 0, 1, 0, x1 - x0, h, {
      tint: tint.map((v) => v * 0.85),
    });
    if (o.east !== false)
      b.face(mat, x1, 0, FZ, 0, 0, -1, 0, 1, 0, FZ - BZ0, h, {
        tint: tint.map((v) => v * 0.9),
      });
    if (o.west !== false)
      b.face(mat, x0, 0, BZ0, 0, 0, 1, 0, 1, 0, FZ - BZ0, h, {
        tint: tint.map((v) => v * 0.9),
      });
    if (o.roof !== false)
      b.face("concrete_dark", x0, h, FZ, 1, 0, 0, 0, 0, -1, x1 - x0, FZ - BZ0, {
        uv: "top",
        tint: [0.4, 0.38, 0.36],
      });
    b.col(x0, 0, BZ0, x1, h, FZ, { tag: "building" });
    const nW = o.windows || Math.max(2, Math.floor((x1 - x0) / 3.2));
    for (let f = 1; f < (o.floors || 5); f++) {
      for (let k = 0; k < nW; k++) {
        const x = x0 + ((x1 - x0) * (k + 0.5)) / nW,
          u = r();
        K.sash(b, x, 4.2 + (f - 1) * 3.1 + 0.7, FZ, 0, 1, 1.1, 1.8, {
          state:
            u < 0.3
              ? "broken"
              : u < 0.55
                ? "dark"
                : u < 0.7
                  ? "boarded"
                  : "glass",
          cols: 2,
          rows: 2,
          surround: o.trimMat || "limestone",
          surroundTint: o.trimTint || [0.78, 0.74, 0.66],
          lintel: 0.22,
        });
      }
    }
    // pressed-metal cornice
    if (o.cornice !== false)
      K.cornice(b, x0, FZ, x1, FZ, h - 0.9, 0, 1, {
        mat: "metal",
        tint: o.cornTint || [0.34, 0.3, 0.26],
        depth: 0.7,
        h: 0.9,
        brackets: 0.8,
      });
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  function exterior(ctx) {
    const b = K.builder({ name: "mcs_ext", grime: 0.6, off: SO });
    const r = K.rng("mcs_ext");
    const green = [0.16, 0.33, 0.22],
      cream = [0.9, 0.84, 0.66];

    // ---- A: laundry tenement (west) ----
    tenement(b, r, 1, MX0, 16.6, { tint: [0.8, 0.55, 0.45], windows: 4 });
    b.boxMM("paint_black", 1.4, 0, FZ, MX0 - 0.4, 3.9, FZ + 0.12, {
      tint: [0.12, 0.12, 0.12],
    });
    for (const px of [4, 11.5])
      K.window(b, px, 2.0, FZ + 0.12, 0, 1, 4.6, 2.8, {
        state: "boarded",
        sill: false,
        surround: "paint_black",
        surroundTint: [0.1, 0.1, 0.1],
      });
    b.plate(
      "art",
      8,
      4.35,
      FZ + 0.14,
      0,
      1,
      10,
      0.7,
      K.signCell(
        "mcs_laundry",
        "SUDS-O-MATIC LAUNDERETTE · WE WASH RADS OUT!",
        1024,
        72,
        { bg: "#d8d0b8", fg: "#2a4a7a", font: "Arial Black, sans-serif" },
      ),
    );
    fireEscape(b, 2.5, 13.5, FZ, [4.3, 7.4, 10.5, 13.6]);

    // ---- B: O'Rourke's building ----
    tenement(b, r, MX0, MX1, 15.2, {
      tint: [0.82, 0.5, 0.4],
      windows: 2,
      east: false,
      west: false,
    });
    b.face("brick_red", MX1, 13.2, FZ, 0, 0, -1, 0, 1, 0, FZ - BZ0, 2.0, {
      tint: [0.7, 0.45, 0.38],
    });
    // the saloon front: green-painted timber with pilasters, panelled stall risers, small-paned windows
    b.boxMM("green_paint", MX0 + 0.1, 0, FZ, MX1 - 0.1, 4.25, FZ + 0.18, {
      tint: green,
      faces: "sewt",
    });
    for (const px of [MX0 + 0.35, DOOR_X - 0.95, DOOR_X + 0.95, MX1 - 0.35]) {
      b.boxMM(
        "green_paint",
        px - 0.25,
        0,
        FZ + 0.18,
        px + 0.25,
        4.0,
        FZ + 0.36,
        { tint: green.map((v) => v * 0.8) },
      );
      b.boxMM(
        "green_paint",
        px - 0.32,
        3.7,
        FZ + 0.18,
        px + 0.32,
        3.95,
        FZ + 0.42,
        { tint: green.map((v) => v * 1.2) },
      );
    }
    for (const [wx0, wx1] of [
      [MX0 + 0.6, DOOR_X - 1.2],
      [DOOR_X + 1.2, MX1 - 0.6],
    ]) {
      const cx = (wx0 + wx1) / 2,
        w = wx1 - wx0;
      b.boxMM("green_paint", wx0, 0, FZ + 0.18, wx1, 0.9, FZ + 0.3, {
        tint: green.map((v) => v * 0.9),
      });
      b.boxMM(
        "green_paint",
        wx0 + 0.15,
        0.15,
        FZ + 0.3,
        wx1 - 0.15,
        0.75,
        FZ + 0.34,
        { tint: green.map((v) => v * 1.15) },
      );
      b.plate("lamp", cx, 2.3, FZ + 0.2, 0, 1, w, 2.6, null, {
        tint: [0.7, 0.42, 0.18],
      }); // the warm glow of a working bar
      for (let i = 1; i < 4; i++)
        b.beam(
          "green_paint",
          wx0 + (w * i) / 4,
          1.0,
          FZ + 0.24,
          wx0 + (w * i) / 4,
          3.6,
          FZ + 0.24,
          0.05,
          0.05,
          { tint: green },
        );
      for (let j = 1; j < 4; j++)
        b.beam(
          "green_paint",
          wx0,
          1.0 + (2.6 * j) / 4,
          FZ + 0.24,
          wx1,
          1.0 + (2.6 * j) / 4,
          FZ + 0.24,
          0.05,
          0.05,
          { tint: green },
        );
      b.boxMM("green_paint", wx0, 3.6, FZ + 0.18, wx1, 3.72, FZ + 0.3, {
        tint: green,
      });
      K.letters(b, cx, 2.1, FZ + 0.22, 0, 1, w * 0.8, 0.45, "ALE", {
        fg: "#e8c870",
        font: "Georgia, serif",
        off: 0.01,
        shadow: false,
      });
      b.glow(cx, 2.3, FZ + 0.6, [0.6, 0.35, 0.12], 2.6);
    }
    // door with transom
    b.boxMM(
      "wood_dark",
      DOOR_X - 0.7,
      0,
      FZ + 0.19,
      DOOR_X + 0.7,
      2.7,
      FZ + 0.26,
      { tint: [0.2, 0.3, 0.2] },
    );
    b.plate("lamp", DOOR_X, 1.8, FZ + 0.27, 0, 1, 0.9, 0.9, null, {
      tint: [0.55, 0.32, 0.14],
    });
    b.plate("lamp", DOOR_X, 3.2, FZ + 0.2, 0, 1, 1.3, 0.6, null, {
      tint: [0.6, 0.36, 0.16],
    });
    K.letters(b, DOOR_X, 3.2, FZ + 0.21, 0, 1, 1.2, 0.4, "15", {
      fg: "#f0d890",
      off: 0.01,
      shadow: false,
    });
    b.boxMM(
      "brass",
      DOOR_X + 0.45,
      1.1,
      FZ + 0.26,
      DOOR_X + 0.55,
      1.2,
      FZ + 0.34,
      {},
    );
    // THE SIGNBOARD
    const sign = K.paint(
      "art",
      "mcs_signboard",
      1024,
      150,
      function (x, X, Y, W, H) {
        x.fillStyle = "#1c3a26";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#c8a050";
        x.lineWidth = 6;
        x.strokeRect(X + 6, Y + 6, W - 12, H - 12);
        x.fillStyle = "#f2e8cc";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.font = 'bold 76px Georgia, "Times New Roman", serif';
        x.shadowColor = "rgba(0,0,0,0.6)";
        x.shadowOffsetX = 3;
        x.shadowOffsetY = 3;
        x.fillText("O'ROURKE'S", X + W * 0.5, Y + H * 0.4, W * 0.9);
        x.font = "bold 36px Georgia, serif";
        x.fillText("OLD ALE HOUSE", X + W * 0.5, Y + H * 0.8, W * 0.6);
        x.shadowColor = "transparent";
        x.font = "italic 26px Georgia, serif";
        x.fillStyle = "#c8a050";
        x.fillText("EST. 1854", X + W * 0.1, Y + H * 0.8);
        x.fillText("EST. 1854", X + W * 0.9, Y + H * 0.8);
        K.stains(x, X, Y, W, H, 14, 17, 0.45, [20, 15, 10]);
        K.streaks(x, X, Y, W, H, 16, 18, 0.35);
      },
    );
    b.boxMM("green_paint", MX0 + 0.05, 4.2, FZ, MX1 - 0.05, 5.5, FZ + 0.4, {
      tint: green.map((v) => v * 0.8),
    });
    b.plate(
      "art",
      (MX0 + MX1) / 2,
      4.85,
      FZ + 0.41,
      0,
      1,
      MX1 - MX0 - 0.4,
      1.2,
      sign,
      { off: 0.01 },
    );
    // the lantern over the door
    b.beam("black_iron", DOOR_X, 5.9, FZ, DOOR_X, 5.9, FZ + 1.0, 0.05, 0.05);
    b.pipe("black_iron", DOOR_X, 5.9, FZ + 1.0, DOOR_X, 5.6, FZ + 1.0, 0.01, 3);
    b.cyl("black_iron", DOOR_X, 5.12, FZ + 1.0, 0.2, 0.25, 0.08, 6);
    b.cyl("glass", DOOR_X, 5.2, FZ + 1.0, 0.18, 0.22, 0.36, 6, {
      tint: [0.95, 0.75, 0.4],
    });
    b.geo("lamp", K.sphereGeo(), {
      x: DOOR_X,
      y: 5.36,
      z: FZ + 1.0,
      s: 0.09,
      tint: [1, 0.72, 0.35],
    });
    b.cyl("black_iron", DOOR_X, 5.56, FZ + 1.0, 0.25, 0.04, 0.18, 6);
    b.glow(DOOR_X, 5.36, FZ + 1.0, [1, 0.62, 0.25], 3.0);
    // BE GOOD OR BE GONE, sandwich board, sandbags, the guard's stool
    b.plate(
      "art",
      MX0 + 0.9,
      2.0,
      FZ + 0.37,
      0,
      1,
      0.9,
      1.2,
      K.signCell("mcs_begood", "BE GOOD\nOR\nBE GONE", 192, 256, {
        bg: "#e8dcb8",
        fg: "#1c3a26",
        font: "Georgia, serif",
        border: "#1c3a26",
      }),
    );
    // fire escape on O'Rourke's building (4 landings)
    fireEscape(b, MX0 + 0.8, MX1 - 0.8, FZ, [6.1, 9.2, 12.3]);
    // upper storey rooftop: water tower
    for (const [dx, dz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      b.pipe("rust", 20 + dx, 15.2, 16 + dz, 20 + dx, 17.6, 16 + dz, 0.07, 5);
    b.cyl("wood_rotten", 20, 17.6, 16, 1.6, 1.6, 2.8, 14, {
      tint: [0.62, 0.5, 0.38],
    });
    for (const yy of [18, 18.9, 19.8])
      b.cyl("rust", 20, yy, 16, 1.63, 1.63, 0.06, 14, { top: false });
    b.cyl("wood_rotten", 20, 20.4, 16, 1.7, 0.15, 1.0, 14, {
      tint: [0.5, 0.42, 0.33],
    });

    // ---- C: half-collapsed brownstone with a ghost ad on its side ----
    tenement(b, r, MX1, LX0, 13.0, {
      mat: "brownstone",
      tint: [0.95, 0.75, 0.62],
      windows: 4,
      floors: 4,
      trimMat: "brownstone",
      trimTint: [1.1, 0.92, 0.78],
      west: false,
    });
    b.boxMM("brownstone", MX1, 0, FZ, LX0, 1.2, FZ + 2.4, {
      tint: [0.85, 0.68, 0.56],
      faces: "sewt",
    }); // stoop base
    for (let i = 0; i < 6; i++)
      b.boxMM(
        "brownstone",
        29.5,
        0,
        FZ + 2.4 - i * 0.4,
        32.5,
        0.2 * (i + 1),
        FZ + 2.8 - i * 0.4,
        { tint: [0.85, 0.68, 0.56] },
      );
    b.col(MX1, 0, FZ, LX0, 1.2, FZ + 2.4, {});
    b.col(29.5, 0, FZ + 2.4, 32.5, 0.6, FZ + 2.8, {});
    b.boxMM("wood_dark", 30.2, 1.2, FZ - 0.02, 31.8, 3.8, FZ + 0.05, {
      tint: [0.3, 0.2, 0.14],
    });
    for (let k = 0; k < 7; k++)
      b.box(
        "brownstone",
        MX1 + 1 + k * 1.9,
        12.2 + r() * 0.6,
        FZ - 1 - r() * 6,
        1.6,
        0.6 + r() * 1.3,
        1.3,
        { yaw: r(), tint: [0.8, 0.62, 0.5] },
      );
    for (let k = 0; k < 3; k++)
      b.beam(
        "rust",
        27 + k * 3,
        12.5,
        FZ - 8,
        28 + k * 3,
        14 + r(),
        FZ - 1,
        0.18,
        0.25,
      );
    b.burn(32, 13, FZ, 5, 0.75);
    const ghost = K.signCell(
      "mcs_ghost",
      "O'ROURKE'S ALE\nLIGHT  or  DARK",
      768,
      384,
      {
        bg: null,
        fg: "rgba(238,228,200,0.72)",
        font: "Georgia, serif",
        weather: true,
      },
    );
    b.plate("decal", LX0 + 0.03, 8.2, (FZ + BZ0) / 2 + 2, 1, 0, 13, 6.5, ghost);
    b.plate(
      "decal",
      LX0 + 0.03,
      4.4,
      (FZ + BZ0) / 2 + 2,
      1,
      0,
      9,
      1.1,
      K.signCell("mcs_ghost2", "SINCE 1854 · 15 EAST 7th STREET", 768, 96, {
        bg: null,
        fg: "rgba(230,220,190,0.6)",
        font: "Georgia, serif",
      }),
    );

    // ---- D: the Beer Garden in the vacant lot ----
    b.face("dirt", LX0, 0.03, FZ, 1, 0, 0, 0, 0, -1, LX1 - LX0, FZ - LZ0, {
      uv: "top",
      tint: [0.7, 0.62, 0.5],
    });
    // rubble berms of the old building along the back and east
    for (let k = 0; k < 6; k++)
      K.rubble(b, LX0 + 2 + k * 3.6, 0, LZ0 + 1.5 + r() * 1.5, 2.2, 1.3 + r(), {
        seed: 50 + k,
        tint: [0.75, 0.6, 0.52],
      });
    // scrap-metal fence along the street with a gate + the hand-painted sign
    for (let x = LX0 + 0.4; x < LX1; x += 1.6) {
      if (x > GATE0 && x < GATE1) continue;
      const hh = 2.2 + r() * 0.5;
      b.box(
        r() < 0.5 ? "corrugated" : "rust",
        x + 0.8,
        0,
        FZ - 0.1,
        1.62,
        hh,
        0.08,
        {
          yaw: (r() - 0.5) * 0.06,
          tint: r.pick([
            [0.7, 0.6, 0.5],
            [0.55, 0.5, 0.45],
            [0.6, 0.35, 0.25],
          ]),
        },
      );
    }
    b.col(LX0, 0, FZ - 0.25, GATE0, 2.4, FZ + 0.05, { walkable: false });
    b.col(GATE1, 0, FZ - 0.25, LX1, 2.4, FZ + 0.05, { walkable: false });
    for (const px of [GATE0 - 0.1, GATE1 + 0.1])
      b.pipe("rust", px, 0, FZ, px, 3.4, FZ, 0.08, 6);
    b.beam("rust", GATE0 - 0.1, 3.3, FZ, GATE1 + 0.1, 3.3, FZ, 0.12, 0.12);
    b.plate(
      "art",
      GATE_X,
      3.8,
      FZ + 0.08,
      0,
      1,
      4.6,
      0.9,
      K.signCell("mcs_garden", "O'ROURKE'S BEER GARDEN", 768, 150, {
        bg: "#e8dcb8",
        fg: "#1c3a26",
        font: "Georgia, serif",
        border: "#8a2a1a",
        sub: "outdoor seating since 1968",
      }),
    );
    b.plate(
      "art",
      GATE_X,
      3.8,
      FZ - 0.08,
      0,
      -1,
      4.6,
      0.9,
      K.signCell("mcs_garden_b", "PAY INSIDE · NO TABS FOR RAIDERS", 768, 150, {
        bg: "#e8dcb8",
        fg: "#8a2a1a",
        font: "Georgia, serif",
      }),
    );
    // picnic tables, a still, tents, string lights
    for (const [tx, tz] of [
      [42, 24],
      [47.5, 21.5],
      [54, 25],
      [53, 17],
    ]) {
      b.boxMM("wood", tx - 1.2, 0.72, tz - 0.4, tx + 1.2, 0.78, tz + 0.4, {
        tint: [0.6, 0.48, 0.34],
      });
      for (const s of [-1, 1]) {
        b.boxMM(
          "wood",
          tx - 1.2,
          0.42,
          tz + s * 0.7 - 0.15,
          tx + 1.2,
          0.47,
          tz + s * 0.7 + 0.15,
          { tint: [0.55, 0.44, 0.3] },
        );
        b.beam(
          "wood",
          tx - 1,
          0,
          tz + s * 0.75,
          tx - 0.9,
          0.75,
          tz - s * 0.2,
          0.08,
          0.08,
          { tint: [0.5, 0.4, 0.28] },
        );
        b.beam(
          "wood",
          tx + 1,
          0,
          tz + s * 0.75,
          tx + 0.9,
          0.75,
          tz - s * 0.2,
          0.08,
          0.08,
          { tint: [0.5, 0.4, 0.28] },
        );
      }
      for (let k = 0; k < 3; k++)
        b.cyl(
          "glass",
          tx - 0.8 + r() * 1.6,
          0.78,
          tz + (r() - 0.5) * 0.5,
          0.05,
          0.05,
          0.14,
          8,
          { tint: r() < 0.5 ? [0.9, 0.7, 0.35] : [0.4, 0.22, 0.1] },
        );
      b.col(tx - 1.2, 0, tz - 0.9, tx + 1.2, 0.78, tz + 0.9, {
        tag: "furniture",
        surface: "wood",
      });
    }
    // copper still
    b.cyl("copper", 57, 0, 10, 0.8, 0.7, 1.4, 12, { tint: [0.75, 0.48, 0.28] });
    b.geo("copper", K.sphereGeo(), {
      x: 57,
      y: 1.4,
      z: 10,
      sx: 0.7,
      sy: 0.4,
      sz: 0.7,
      tint: [0.75, 0.48, 0.28],
    });
    b.pipe("copper", 57, 1.75, 10, 57, 2.3, 10, 0.06, 6, {
      tint: [0.75, 0.48, 0.28],
    });
    b.pipe("copper", 57, 2.3, 10, 55.2, 1.6, 10.5, 0.05, 6, {
      tint: [0.75, 0.48, 0.28],
    });
    b.cyl("wood", 55, 0, 10.6, 0.45, 0.45, 1.1, 10, {
      tint: [0.55, 0.4, 0.28],
    });
    b.col(56.2, 0, 9.2, 57.8, 1.8, 10.8, {});
    b.col(54.5, 0, 10.1, 55.5, 1.1, 11.1, {});
    // tents
    for (const [tx, tz, yaw] of [
      [42, 7.5, 0.2],
      [47.5, 7, -0.1],
    ]) {
      const c = Math.cos(yaw),
        s = Math.sin(yaw),
        P = (lx, ly, lz) => [tx + lx * c + lz * s, ly, tz - lx * s + lz * c];
      b.quadN(
        "fabric",
        P(-1.4, 0, 1.2),
        P(1.4, 0, 1.2),
        P(1.4, 2.0, 0),
        P(-1.4, 2.0, 0),
        [s * 0.6, 0.8, c * 0.6],
        { tint: [0.6, 0.55, 0.42] },
      );
      b.quadN(
        "fabric",
        P(1.4, 0, -1.2),
        P(-1.4, 0, -1.2),
        P(-1.4, 2.0, 0),
        P(1.4, 2.0, 0),
        [-s * 0.6, 0.8, -c * 0.6],
        { tint: [0.55, 0.5, 0.38] },
      );
      b.ocol(tx, tz, 2.8, 2.4, 0, 1.8, yaw, { tag: "tent", surface: "fabric" });
    }
    // string lights from the brownstone to a pole
    const POLE = { x: 56.5, z: 22 };
    b.pipe("rust", POLE.x, 0, POLE.z, POLE.x, 4.6, POLE.z, 0.07, 5);
    for (const [ax, az] of [
      [LX0 + 0.1, 20],
      [LX0 + 0.1, 14],
    ]) {
      for (let k = 0; k <= 12; k++) {
        const t = k / 12,
          x = ax + (POLE.x - ax) * t,
          z = az + (POLE.z - az) * t,
          y = 4.4 - Math.sin(t * PI) * 0.8;
        if (k % 2 === 0) {
          b.geo("lamp", K.sphereGeo(), {
            x,
            y: y - 0.08,
            z,
            s: 0.05,
            tint: [1, 0.75, 0.4],
          });
          b.glow(x, y - 0.08, z, [1, 0.7, 0.35], 0.8);
        }
        if (k < 12) {
          const t2 = (k + 1) / 12;
          b.pipe(
            "black_iron",
            x,
            y,
            z,
            ax + (POLE.x - ax) * t2,
            4.4 - Math.sin(t2 * PI) * 0.8,
            az + (POLE.z - az) * t2,
            0.006,
            3,
          );
        }
      }
    }
    // sidewalk cellar hatch (two steel leaves in the pavement)
    b.boxMM(
      "metal_dark",
      HATCH.x - 0.8,
      0.01,
      HATCH.z - 0.6,
      HATCH.x + 0.8,
      0.07,
      HATCH.z + 0.6,
      { tint: [0.35, 0.33, 0.3] },
    );
    b.beam(
      "rust",
      HATCH.x,
      0.08,
      HATCH.z - 0.6,
      HATCH.x,
      0.08,
      HATCH.z + 0.6,
      0.04,
      0.02,
    );
    for (const s of [-1, 1])
      b.box("rust", HATCH.x + s * 0.4, 0.07, HATCH.z, 0.12, 0.04, 0.3, {});
    // sandbag chicane at the door (props) and litter
    K.litter(b, 1, FZ + 0.4, SW - 1, FZ + 3.2, 0.12, 24, 511);
    b.hplate(
      "decal",
      DOOR_X,
      0.13,
      FZ + 1.6,
      2.4,
      2.0,
      0.2,
      K.decal("grime", 9),
    );

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_orourkes_ext";
    // world-space gameplay records (site-local → world via the layout offset)
    K.anchor(ctx, "door", wx(DOOR_X), 0, wz(FZ + 1.6), false);
    K.anchor(ctx, "guard", wx(DOOR_X + 2.2), 0, wz(FZ + 2.4), false);
    K.anchor(ctx, "garden", wx(48), 0, wz(19), false);
    K.anchor(ctx, "garden2", wx(53.5), 0, wz(20.5), false);
    K.loot(ctx, "sandbags", wx(DOOR_X - 2.6), 0, wz(FZ + 2.6), 0, {
      world: true,
      low: true,
    });
    K.loot(ctx, "sandbags", wx(DOOR_X + 3.2), 0, wz(FZ + 3.0), 0.3, {
      world: true,
      low: true,
    });
    K.loot(ctx, "campfire", wx(50.5), 0, wz(14), 0, { world: true, pot: true });
    K.loot(ctx, "barrel", wx(40), 0, wz(28.6), 0, {
      world: true,
      burning: true,
    });
    K.loot(ctx, "crate", wx(58.5), 0, wz(27.5), 0.4, {
      world: true,
      kind: "plain",
      loot: "drinks",
      name: "Empty Mug Crate",
    });
    K.loot(ctx, "trash_can", wx(MX0 - 2), 0.12, wz(FZ + 1.3), 0, {
      world: true,
      loot: "trash_can",
    });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "mcs_int",
      off: O,
      lit: true,
      amb: [0.1, 0.085, 0.07],
      floors: [0, UP, CY],
      grime: 0.55,
    });
    const r = K.rng("mcs_int");
    const gas = [1, 0.72, 0.4],
      wallC = [0.78, 0.66, 0.48],
      panel = [0.36, 0.22, 0.13],
      smoke = [0.42, 0.36, 0.28];
    const H = 3.7;

    // gaps
    K.gap(ctx, 0, 0, 1.3, 0, 2.6); // street door
    K.gap(ctx, 1.4, -13, 3.0, 0, 2.7); // bar room ↔ back room (wide opening)
    K.gap(ctx, -2.4, -21, 1.2, 0, 2.3); // back room ↔ kitchen
    K.gap(ctx, 2.3, -21, 4.2, 0, 2.5, { casing: false }); // back room ↔ stair hall (ground)
    K.gap(ctx, 3.45, -21, 1.8, CY, 2.5, { casing: false }); // stair hall (cellar level) ↔ cellar
    K.gap(ctx, 3.4, -21, 1.4, UP, 2.3); // stair hall (apartment level) ↔ apartment hall
    K.gap(ctx, 0, -30, 1.1, UP, 2.3); // landing ↔ bedroom
    K.gap(ctx, 2.3, -18, 1.4, UP, 2.3); // apartment hall ↔ parlour

    const BR = [-4.6, -0.3, -13.1, 4.6, H, 0.1];
    // ================================================= FRONT BAR ROOM
    K.room(b, ctx, {
      x0: -4.5,
      z0: -13,
      x1: 4.5,
      z1: 0,
      y: 0,
      h: H,
      floor: "sawdust",
      fc: [0.9, 0.84, 0.74],
      wall: "plaster_stained",
      wc: wallC,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.25,
      ceil: "tin",
      cc: smoke,
      cornice: true,
      surface: "wood",
    });
    // front windows (daylight through the small panes)
    for (const wx of [-2.6, 2.6]) {
      b.plate("lamp", wx, 2.1, -0.12, 0, -1, 2.6, 2.3, null, {
        tint: [0.4, 0.4, 0.34],
      });
      for (let i = 1; i < 4; i++)
        b.beam(
          "green_paint",
          wx - 1.3 + (2.6 * i) / 4,
          0.95,
          -0.15,
          wx - 1.3 + (2.6 * i) / 4,
          3.25,
          -0.15,
          0.04,
          0.04,
          { tint: [0.16, 0.3, 0.2] },
        );
      for (let j = 1; j < 4; j++)
        b.beam(
          "green_paint",
          wx - 1.3,
          0.95 + (2.3 * j) / 4,
          -0.15,
          wx + 1.3,
          0.95 + (2.3 * j) / 4,
          -0.15,
          0.04,
          0.04,
          { tint: [0.16, 0.3, 0.2] },
        );
      b.light(wx, 2.2, -0.9, [0.75, 0.72, 0.6], 0.55, 5, { box: BR });
    }
    // THE BAR along the west wall: counter, brass foot rail, back bar with mirror and taps
    const bx0 = -3.2,
      bx1 = -2.55,
      bz0 = -11.2,
      bz1 = -1.6;
    b.boxMM("mahogany", bx0, 0, bz0, bx1, 1.08, bz1, {
      tint: [0.4, 0.2, 0.12],
    });
    b.boxMM(
      "mahogany",
      bx0 - 0.1,
      1.08,
      bz0 - 0.05,
      bx1 + 0.12,
      1.14,
      bz1 + 0.05,
      { tint: [0.46, 0.24, 0.14] },
    );
    for (let z = bz0 + 0.5; z < bz1; z += 0.9)
      b.boxMM("mahogany", bx1, 0.15, z - 0.35, bx1 + 0.03, 0.95, z + 0.35, {
        tint: [0.34, 0.17, 0.1],
      });
    b.pipe("brass", bx1 + 0.28, 0.18, bz0, bx1 + 0.28, 0.18, bz1, 0.03, 6);
    for (let z = bz0 + 0.3; z < bz1; z += 1.5)
      b.pipe("brass", bx1 + 0.02, 0.18, z, bx1 + 0.28, 0.18, z, 0.015, 4);
    b.col(bx0 - 0.1, 0, bz0 - 0.05, bx1 + 0.12, 1.14, bz1 + 0.05, {
      tag: "counter",
      surface: "wood",
    });
    // Houdini's handcuffs, locked to the foot rail
    for (const dz of [0, 0.12])
      b.geo("steel", new THREE.TorusGeometry(0.045, 0.008, 5, 10), {
        x: bx1 + 0.28,
        y: 0.14 - dz * 0.4,
        z: bz1 - 0.6 + dz,
        ry: HP,
        tint: [0.6, 0.6, 0.6],
      });
    b.plate(
      "art",
      bx1 + 0.04,
      0.6,
      bz1 - 0.6,
      1,
      0,
      0.35,
      0.18,
      K.signCell("mcs_houdini", "H.H. 1908", 128, 64, {
        bg: "#c8a050",
        fg: "#2a1a0a",
        font: "Georgia, serif",
      }),
    );
    // back bar
    b.boxMM("mahogany", -4.45, 0, bz0, -3.95, 1.0, bz1, {
      tint: [0.36, 0.18, 0.11],
    });
    b.boxMM("mahogany", -4.45, 1.0, bz0, -4.1, 3.1, bz1, {
      tint: [0.34, 0.17, 0.1],
    });
    b.boxMM("glass", -4.1, 1.35, bz0 + 0.6, -4.09, 2.5, bz1 - 0.6, {
      tint: [0.5, 0.55, 0.55],
    }); // the mirror
    for (const yy of [1.3, 2.55])
      b.boxMM("mahogany", -4.45, yy, bz0, -3.85, yy + 0.05, bz1, {
        tint: [0.4, 0.2, 0.12],
      });
    for (let z = bz0 + 0.2; z < bz1 - 0.2; z += 0.16) {
      if (r() < 0.25) continue;
      b.cyl("glass", -4.0, 2.6, z, 0.04, 0.04, 0.22 + r() * 0.12, 6, {
        tint: r.pick([
          [0.3, 0.45, 0.25],
          [0.5, 0.3, 0.12],
          [0.75, 0.7, 0.5],
        ]),
      });
    }
    b.col(-4.5, 0, bz0, -3.95, 3.1, bz1, {});
    // the two taps: LIGHT and DARK
    for (const [tz, lbl, col] of [
      [-5.6, "LIGHT", "#f0d890"],
      [-4.6, "DARK", "#e0b080"],
    ]) {
      b.pipe("brass", -3.0, 1.14, tz, -3.0, 1.6, tz, 0.035, 8);
      b.pipe("brass", -3.0, 1.55, tz, -2.75, 1.55, tz, 0.025, 6);
      b.box("mahogany", -3.0, 1.6, tz, 0.08, 0.28, 0.08, {
        tint: [0.2, 0.1, 0.05],
      });
      b.plate(
        "art",
        -2.9,
        1.3,
        tz,
        1,
        0,
        0.36,
        0.12,
        K.signCell("mcs_tap_" + lbl, lbl, 128, 42, {
          bg: "#1c3a26",
          fg: col,
          font: "Georgia, serif",
        }),
      );
    }
    // mugs, lined up in pairs (they only come in pairs)
    for (let k = 0; k < 7; k++) {
      const z = -10.6 + k * 1.2 + r() * 0.3;
      for (const dz of [0, 0.14]) {
        b.cyl("glass", -2.85, 1.14, z + dz, 0.05, 0.05, 0.14, 8, {
          tint: k % 2 ? [0.95, 0.75, 0.35] : [0.35, 0.2, 0.08],
        });
        b.geo("glass", new THREE.TorusGeometry(0.03, 0.008, 4, 8), {
          x: -2.8,
          y: 1.21,
          z: z + dz,
          tint: [0.8, 0.85, 0.8],
        });
      }
    }
    b.boxMM("brass", -3.15, 1.14, -8.6, -2.65, 1.5, -8.0, {
      tint: [0.7, 0.55, 0.3],
    }); // cash register
    b.boxMM("brass", -3.1, 1.5, -8.5, -2.75, 1.62, -8.1, {
      tint: [0.8, 0.62, 0.32],
    });
    // the gas lamp over the bar, hung with the wishbones of the boys who shipped out in 1965
    const LX = -2.2,
      LZ = -6.2;
    b.pipe("brass", LX, 2.6, LZ, LX, H, LZ, 0.02, 5);
    b.pipe("brass", LX, 2.6, LZ - 1.2, LX, 2.6, LZ + 1.2, 0.03, 6);
    b.pipe("brass", LX - 0.6, 2.6, LZ, LX + 0.6, 2.6, LZ, 0.03, 6);
    for (const [gx, gz] of [
      [LX, LZ - 1.2],
      [LX, LZ + 1.2],
      [LX - 0.6, LZ],
      [LX + 0.6, LZ],
    ]) {
      b.pipe("brass", gx, 2.6, gz, gx, 2.45, gz, 0.012, 4);
      b.cyl("glass", gx, 2.28, gz, 0.1, 0.07, 0.18, 8, {
        tint: [0.95, 0.85, 0.65],
      });
      b.geo("lamp", K.sphereGeo(), {
        x: gx,
        y: 2.36,
        z: gz,
        s: 0.04,
        tint: gas,
      });
      b.glow(gx, 2.36, gz, [0.9, 0.6, 0.3], 0.7);
    }
    b.light(LX, 2.3, LZ, gas, 1.1, 6.5, { box: BR });
    for (let k = 0; k < 34; k++) {
      const t = r(),
        onZ = k % 2 === 0;
      const x = onZ ? LX + (r() - 0.5) * 0.06 : LX - 0.6 + t * 1.2,
        z = onZ ? LZ - 1.2 + t * 2.4 : LZ + (r() - 0.5) * 0.06;
      b.geo("flat", K.sphereGeo(), {
        x,
        y: 2.62,
        z,
        s: 0.012,
        tint: [0.15, 0.12, 0.1],
      });
      K.wishbone(b, x, 2.58, z, r() * 3, 0.06 + r() * 0.03);
    }
    // dust: 70 years of it, on the wishbones
    b.plate(
      "art",
      -4.08,
      3.25,
      -6.2,
      1,
      0,
      3.4,
      0.4,
      K.signCell("mcs_wish_sign", "DON'T TOUCH THE WISHBONES", 512, 60, {
        bg: "#1c3a26",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
    );
    // the pot-belly stove
    const SX = 1.4,
      SZ = -6.8;
    b.cyl("cast_iron", SX, 0, SZ, 0.36, 0.3, 0.12, 12, {
      tint: [0.2, 0.19, 0.18],
    });
    b.cyl("cast_iron", SX, 0.12, SZ, 0.32, 0.44, 0.45, 12, {
      tint: [0.2, 0.19, 0.18],
      top: false,
    });
    b.cyl("cast_iron", SX, 0.57, SZ, 0.44, 0.32, 0.4, 12, {
      tint: [0.2, 0.19, 0.18],
    });
    b.cyl("cast_iron", SX, 0.97, SZ, 0.26, 0.22, 0.12, 12, {
      tint: [0.22, 0.2, 0.19],
    });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * PI * 2 + 0.4;
      b.pipe(
        "cast_iron",
        SX + Math.cos(a) * 0.3,
        0.12,
        SZ + Math.sin(a) * 0.3,
        SX + Math.cos(a) * 0.38,
        0,
        SZ + Math.sin(a) * 0.38,
        0.03,
        4,
        { tint: [0.2, 0.19, 0.18] },
      );
    }
    b.plate("lamp", SX, 0.42, SZ + 0.43, 0, 1, 0.26, 0.16, null, {
      tint: [1, 0.42, 0.12],
    });
    b.pipe("cast_iron", SX, 1.09, SZ, SX, 2.9, SZ, 0.09, 8, {
      tint: [0.24, 0.22, 0.2],
    });
    b.pipe("cast_iron", SX, 2.9, SZ, 4.45, 3.3, SZ, 0.09, 8, {
      tint: [0.24, 0.22, 0.2],
    });
    b.light(SX, 0.5, SZ + 0.3, [1, 0.45, 0.15], 0.9, 4.5, { box: BR });
    b.glow(SX, 0.45, SZ + 0.5, [1, 0.4, 0.1], 1.1);
    b.col(SX - 0.45, 0, SZ - 0.45, SX + 0.45, 1.1, SZ + 0.45, {
      tag: "furniture",
      surface: "metal",
    });
    b.cyl("rust", SX + 0.8, 0, SZ + 0.3, 0.2, 0.24, 0.3, 8, {
      tint: [0.3, 0.28, 0.26],
    }); // coal scuttle
    // tables & chairs (east side + centre); plates of cheese & onions
    for (const [tx, tz] of [
      [3.3, -2.3],
      [3.3, -5.0],
      [3.3, -9.6],
      [3.3, -11.8],
      [0.1, -2.6],
      [0.4, -10.8],
    ]) {
      const tt = K.table(b, tx, 0, tz, 1.3, 0.9, {
        mat: "oak",
        tint: [0.6, 0.44, 0.3],
      });
      for (const [dx, dz, yaw] of [
        [-0.9, 0, -HP],
        [0.9, 0, HP],
        [0, -0.7, PI],
        [0, 0.7, 0],
      ]) {
        if (tx > 3 && dx > 0) continue;
        K.chair(b, tx + dx, 0, tz + dz, yaw + (r() - 0.5) * 0.3, {
          mat: "oak",
          tint: [0.55, 0.4, 0.28],
        });
      }
      for (let k = 0; k < 2 + ((r() * 3) | 0); k++) {
        const px = tx + (r() - 0.5) * 0.9,
          pz = tz + (r() - 0.5) * 0.6;
        b.cyl("glass", px, tt, pz, 0.05, 0.05, 0.14, 8, {
          tint: r() < 0.5 ? [0.95, 0.75, 0.35] : [0.35, 0.2, 0.08],
        });
      }
      if (r() < 0.7) {
        b.cyl("ceramic", tx + 0.15, tt, tz - 0.1, 0.16, 0.14, 0.02, 10);
        b.box("flat", tx + 0.1, tt + 0.02, tz - 0.12, 0.12, 0.05, 0.08, {
          tint: [0.95, 0.8, 0.35],
        });
        b.cyl("flat", tx + 0.22, tt + 0.02, tz - 0.05, 0.035, 0.035, 0.03, 8, {
          tint: [0.9, 0.85, 0.8],
        });
      }
    }
    // memorabilia: every inch of wall (photos, clippings, a fireman's helmet, a portrait of the founder)
    K.salonWall(b, -12.8, -1.2, 1.35, 3.55, 4.38, -1, 0, "mcs_east", {
      density: 1,
      photos: "saloon",
    });
    K.salonWall(b, 3.0, 4.4, 1.35, 3.0, -12.88, 0, 1, "mcs_north", {
      density: 1,
      photos: "saloon",
    });
    for (let k = 0; k < 26; k++) {
      const x = -4.2 + (k % 13) * 0.66,
        y = 3.1 + Math.floor(k / 13) * 0.35;
      if (Math.abs(x) < 0.9 && y < 3.2) continue;
      b.plate("art", x, y, -0.13, 0, -1, 0.34, 0.26, clipping(k));
    }
    for (let k = 0; k < 10; k++)
      K.framed(
        b,
        4.38,
        1.6 + (k % 2) * 0.35,
        -2 - k * 1.05,
        -1,
        0,
        0.28,
        0.34,
        K.photo("saloon", k + 20),
        { frame: "paint_black", fw: 0.025 },
      );
    K.framed(b, -4.07, 3.35, -2.5, 1, 0, 0.6, 0.75, K.painting(2, 128, 160), {
      frame: "gold",
    });
    b.plate(
      "art",
      0,
      3.25,
      -12.86,
      0,
      1,
      2.8,
      0.42,
      K.signCell("mcs_before", "WE WERE HERE BEFORE YOU WERE BORN", 512, 72, {
        bg: "#1c3a26",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
    );
    b.plate(
      "art",
      4.37,
      3.0,
      -6.8,
      -1,
      0,
      0.9,
      0.65,
      K.signCell("mcs_ladies", "LADIES\nWELCOME\n(since 1970)", 192, 140, {
        bg: "#e8dcb8",
        fg: "#1c3a26",
        font: "Georgia, serif",
        border: "#1c3a26",
      }),
    );
    b.cyl("flat", 4.2, 2.62, -8.5, 0.16, 0.14, 0.14, 10, {
      tint: [0.1, 0.1, 0.1],
    });
    b.cyl("flat", 4.2, 2.6, -8.5, 0.24, 0.24, 0.02, 12, {
      tint: [0.1, 0.1, 0.1],
    }); // fireman's helmet on a shelf
    b.boxMM("wood_dark", 4.1, 2.5, -9.2, 4.45, 2.56, -7.8, { tint: panel });
    b.boxMM("wood_dark", 4.1, 2.9, -12.4, 4.45, 2.95, -10.2, { tint: panel });
    for (let k = 0; k < 6; k++)
      b.cyl("ceramic", 4.25, 2.95, -12.2 + k * 0.36, 0.07, 0.06, 0.16, 8, {
        tint: [0.8, 0.76, 0.66],
      }); // old steins
    // the Tammany wanted poster (quest breadcrumb)
    b.plate(
      "art",
      4.37,
      1.9,
      -12.1,
      -1,
      0,
      0.6,
      0.8,
      K.signCell(
        "mcs_wanted",
        "NOT WELCOME\nBOSS CROKE\n& HIS BRAVES",
        160,
        210,
        {
          bg: "#e8dcb8",
          fg: "#8a1a10",
          font: "Georgia, serif",
          border: "#8a1a10",
        },
      ),
    );
    // tin ceiling fixtures: two more gaslights over the tables
    for (const z of [-3.5, -10.2]) {
      b.pipe("brass", 2.2, 3.0, z, 2.2, H, z, 0.015, 4);
      b.cyl("glass", 2.2, 2.82, z, 0.13, 0.08, 0.2, 8, {
        tint: [0.95, 0.85, 0.65],
      });
      b.geo("lamp", K.sphereGeo(), { x: 2.2, y: 2.9, z, s: 0.045, tint: gas });
      b.light(2.2, 2.8, z, gas, 0.8, 5.5, { box: BR });
      b.glow(2.2, 2.9, z, [0.9, 0.6, 0.3], 0.9);
    }
    b.hplate("decal", 1.4, 0.013, -6.8, 1.6, 1.6, 0, K.decal("scorch", 3));
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -2 + r() * 6,
        0.012 + k * 0.0004,
        -1 - r() * 11,
        0.8,
        0.8,
        r() * 6,
        K.decal(k % 2 ? "puddle" : "grime", 70 + k),
      );

    // ================================================= BACK ROOM
    const BK = [-4.6, -0.3, -21.1, 4.6, H, -12.9];
    K.room(b, ctx, {
      x0: -4.5,
      z0: -21,
      x1: 4.5,
      z1: -13,
      y: 0,
      h: H,
      floor: "sawdust",
      fc: [0.85, 0.8, 0.7],
      wall: "plaster_stained",
      wc: wallC,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.25,
      ceil: "tin",
      cc: smoke,
      cornice: true,
      surface: "wood",
    });
    // Peter Cooper's chair (on its little dais, roped off)
    b.boxMM("wood_dark", -4.3, 0, -20.8, -3.0, 0.15, -19.5, { tint: panel });
    b.col(-4.3, 0, -20.8, -3.0, 0.15, -19.5, {});
    const cx = -3.65,
      cz = -20.15;
    b.box("oak", cx, 0.15 + 0.45, cz, 0.62, 0.07, 0.58, {
      tint: [0.5, 0.34, 0.2],
    });
    for (const [lx, lz] of [
      [-0.26, -0.24],
      [0.26, -0.24],
      [-0.26, 0.24],
      [0.26, 0.24],
    ])
      b.box("oak", cx + lx, 0.15, cz + lz, 0.05, 0.45, 0.05, {
        tint: [0.45, 0.3, 0.18],
      });
    b.box("oak", cx, 0.67, cz - 0.27, 0.62, 0.8, 0.06, {
      tint: [0.5, 0.34, 0.2],
    });
    for (const s of [-1, 1]) {
      b.box("oak", cx + s * 0.3, 0.67, cz, 0.06, 0.28, 0.56, {
        tint: [0.45, 0.3, 0.18],
      });
    }
    for (const px of [-2.8, -2.8])
      b.cyl("brass", px, 0, -19.3, 0.04, 0.04, 0.9, 6);
    b.pipe("cloth_red", -2.8, 0.85, -19.3, -4.4, 0.8, -19.3, 0.02, 4);
    b.plate(
      "art",
      -4.38,
      1.8,
      -20.1,
      1,
      0,
      0.8,
      0.45,
      K.signCell(
        "mcs_cooper_chair",
        "PETER COOPER'S CHAIR\nregular, 1854–1883",
        256,
        140,
        { bg: "#c8a050", fg: "#2a1a0a", font: "Georgia, serif" },
      ),
    );
    K.framed(b, -4.38, 2.75, -20.1, 1, 0, 0.7, 0.9, K.painting(18, 128, 160), {
      frame: "gold",
    });
    // the long table
    const lt = K.table(b, 0.6, 0, -17, 1.2, 4.4, {
      mat: "oak",
      tint: [0.55, 0.4, 0.27],
    });
    for (const s of [-1, 1])
      for (const dz of [-1.6, -0.5, 0.6, 1.7])
        K.chair(b, 0.6 + s * 0.85, 0, -17 + dz, s > 0 ? HP : -HP, {
          mat: "oak",
          tint: [0.5, 0.36, 0.25],
        });
    for (let k = 0; k < 7; k++)
      b.cyl(
        "glass",
        0.4 + r() * 0.4,
        lt,
        -18.8 + k * 0.6,
        0.05,
        0.05,
        0.14,
        8,
        { tint: k % 2 ? [0.95, 0.75, 0.35] : [0.35, 0.2, 0.08] },
      );
    b.cyl("ceramic", 0.6, lt, -17.2, 0.2, 0.18, 0.02, 10);
    b.box("flat", 0.6, lt + 0.02, -17.2, 0.25, 0.08, 0.14, {
      tint: [0.95, 0.8, 0.35],
    });
    // the fireplace on the east wall
    b.boxMM("brick_red", 3.9, 0, -18.3, 4.45, 1.5, -15.7, {
      tint: [0.55, 0.36, 0.3],
    });
    b.boxMM("paint_black", 3.88, 0.1, -17.6, 3.9, 1.05, -16.4, {
      tint: [0.03, 0.03, 0.03],
    });
    b.boxMM("wood_dark", 3.75, 1.5, -18.5, 4.45, 1.6, -15.5, { tint: panel });
    b.plate("lamp", 3.87, 0.35, -17, -1, 0, 1.0, 0.3, null, {
      tint: [1, 0.4, 0.1],
    });
    b.light(3.3, 0.6, -17, [1, 0.45, 0.15], 1.0, 5, { box: BK });
    b.glow(3.7, 0.4, -17, [1, 0.4, 0.1], 1.6);
    b.col(3.75, 0, -18.5, 4.45, 1.6, -15.5, {});
    K.framed(b, 4.38, 2.5, -17, -1, 0, 1.4, 0.9, K.painting(11, 192, 128), {
      frame: "wood_dark",
    });
    // more walls of stuff; a dartboard; the cat's basket
    K.salonWall(b, -18.8, -13.3, 1.35, 3.55, -4.38, 1, 0, "mcs_bk_w", {
      density: 1,
      photos: "saloon",
    });
    K.salonWall(b, -1.75, 0.15, 1.35, 3.55, -20.88, 0, 1, "mcs_bk_n", {
      density: 1,
      photos: "saloon",
    });
    b.cyl("wood_rotten", -3.6, 0, -14, 0.35, 0.4, 0.2, 10, {
      tint: [0.6, 0.5, 0.35],
    });
    for (const z of [-15, -19]) {
      b.pipe("brass", 0.6, 3.0, z, 0.6, H, z, 0.015, 4);
      b.cyl("glass", 0.6, 2.82, z, 0.13, 0.08, 0.2, 8, {
        tint: [0.95, 0.85, 0.65],
      });
      b.geo("lamp", K.sphereGeo(), { x: 0.6, y: 2.9, z, s: 0.045, tint: gas });
      b.light(0.6, 2.8, z, gas, 0.85, 5.5, { box: BK });
      b.glow(0.6, 2.9, z, [0.9, 0.6, 0.3], 0.9);
    }
    K.note(ctx, "pev_note_mcs_regulars", -3.4, 0.62, -20.3, {
      name: "Card on Peter Cooper's Chair",
      title: "Handwritten card",
      text: "PLEASE DO NOT SIT IN MR. COOPER'S CHAIR.\n\nHe is not coming back. He died in 1883. We are aware.\n\nIt is still his chair.\n\n— Management (Deck)",
    });

    // ================================================= KITCHEN
    const KB = [-4.6, -0.3, -31.1, 0.1, H, -20.9];
    K.room(b, ctx, {
      x0: -4.5,
      z0: -31,
      x1: 0,
      z1: -21,
      y: 0,
      h: H,
      floor: "hextile",
      fc: [0.7, 0.66, 0.6],
      wall: "tile",
      wc: [0.8, 0.8, 0.72],
      ceil: "plaster",
      cc: [0.45, 0.42, 0.36],
    });
    b.boxMM("steel", -4.4, 0, -29.9, -3.6, 0.92, -23, {
      tint: [0.6, 0.6, 0.58],
    });
    b.col(-4.4, 0, -29.9, -3.6, 0.92, -23, {});
    for (let k = 0; k < 6; k++) {
      b.cyl("flat", -4.0, 0.92, -29.4 + k * 0.9, 0.22, 0.22, 0.14, 12, {
        tint: [0.95, 0.72, 0.28],
      });
    } // cheese wheels
    for (let k = 0; k < 3; k++) {
      b.box("wood", -1.2 + (k % 2) * 0.6, 0, -29.2 + k * 0.1, 0.55, 0.4, 0.4, {
        yaw: r() * 0.3,
        tint: [0.6, 0.48, 0.34],
      });
      for (let i = 0; i < 6; i++)
        b.geo("flat", K.sphereGeo(), {
          x: -1.2 + (k % 2) * 0.6 + (r() - 0.5) * 0.3,
          y: 0.44,
          z: -29.2 + k * 0.1 + (r() - 0.5) * 0.2,
          s: 0.06,
          tint: [0.85, 0.72, 0.6],
        });
    } // onions
    b.col(-1.6, 0, -29.6, -0.3, 0.44, -28.7, {});
    const kt = K.table(b, -2, 0, -25.5, 1.2, 2.0, {
      mat: "wood",
      tint: [0.7, 0.6, 0.45],
    });
    b.boxMM("wood", -2.3, kt, -25.9, -1.7, kt + 0.04, -25.2, {
      tint: [0.75, 0.62, 0.45],
    });
    b.pipe("steel", -1.9, kt + 0.05, -25.1, -1.6, kt + 0.05, -24.9, 0.01, 3);
    for (let k = 0; k < 8; k++) {
      b.cyl(
        "ceramic",
        -2.2 + (k % 2) * 0.35,
        kt,
        -26.3 + Math.floor(k / 2) * 0.35,
        0.14,
        0.12,
        0.02,
        10,
      );
    }
    b.boxMM("cast_iron", -1.6, 0, -21.3, -0.1, 0.95, -22.3, {
      tint: [0.22, 0.2, 0.19],
    }); // stove
    b.col(-1.6, 0, -22.3, -0.1, 0.95, -21.3, {});
    b.plate(
      "art",
      -4.38,
      2.0,
      -26,
      1,
      0,
      1.4,
      0.9,
      K.signCell(
        "mcs_menu",
        "MENU\nCheese & Onions ... 3c\nLiverwurst ... 4c\nLight or Dark ... 2c",
        320,
        200,
        { bg: "#1a1a1a", fg: "#e8dcb8", font: "Georgia, serif" },
      ),
    );
    K.lamp(b, -2.2, 3.2, -25.5, "bulb", gas, 0.9, 6, {
      ceil: H,
      lightOpts: { box: KB },
    });
    K.loot(ctx, "fridge", -0.5, 0, -29.4, 0, {
      loot: "food_oldworld",
      owner: "settlers",
      name: "Ice Box",
    });

    // ================================================= STAIR HALL (three stacked rooms: cellar level, ground, apartment)
    // flights: UP x 2.6..4.4 rising north (z −22.2 → −28.2), DOWN x 0.4..2.2 descending north; landings at z −28.2..−31
    const SZ0 = -31,
      SF0 = -22.2,
      SF1 = -28.2;
    const SB = [-0.1, CY - 0.2, SZ0 - 0.1, 4.6, UP + 3.2, -20.9];
    K.room(b, ctx, {
      x0: 0,
      z0: SZ0,
      x1: 4.5,
      z1: -21,
      y: CY,
      h: -CY,
      noFloor: true,
      noCeil: true,
      wall: "brick_red",
      wc: [0.5, 0.38, 0.32],
      trim: false,
    });
    K.room(b, ctx, {
      x0: 0,
      z0: SZ0,
      x1: 4.5,
      z1: -21,
      y: 0,
      h: UP,
      noFloor: true,
      noCeil: true,
      wall: "plaster_stained",
      wc: [0.65, 0.55, 0.42],
      trim: false,
    });
    K.room(b, ctx, {
      x0: 0,
      z0: SZ0,
      x1: 4.5,
      z1: -21,
      y: UP,
      h: 3.1,
      noFloor: true,
      wall: "wallpaper",
      wc: [0.7, 0.62, 0.5],
      ceil: "plaster",
      cc: [0.45, 0.4, 0.34],
    });
    K.stairs(b, 2.6, SF1, 4.4, SF0, 0, UP, "-z", {
      mat: "wood",
      tint: [0.5, 0.36, 0.24],
      rail: "l",
      railMat: "wood_dark",
      handMat: "mahogany",
    });
    K.stairs(b, 0.4, SF1, 2.2, SF0, CY, 0, "+z", {
      mat: "wood",
      tint: [0.45, 0.32, 0.22],
      rail: "l",
      railMat: "wood_dark",
      handMat: "mahogany",
      solid: false,
      thick: 0.35,
    });
    K.segWall(b, 2.4, SF1, 2.4, SF0, CY, 0, 1, {
      mat: "plaster_stained",
      tint: [0.6, 0.5, 0.4],
      trim: false,
      both: true,
    });
    // ground entry strip (from the back room)
    b.face("wood", 0, 0, -21, 1, 0, 0, 0, 0, -1, 4.5, 1.2, {
      uv: "top",
      tint: [0.5, 0.38, 0.28],
    });
    b.col(0, -0.3, SF0, 4.5, 0, -21, { tag: "floor", surface: "wood" });
    b.face("wood", 0, -0.3, SF0, 1, 0, 0, 0, 0, 1, 4.5, 1.2, {
      uv: "top",
      tint: [0.35, 0.3, 0.25],
    }); // its underside (seen from the cellar corridor)
    // cellar level: landing + corridor under the up flight
    b.face("wood", 0, CY, SF1, 1, 0, 0, 0, 0, -1, 4.5, SF1 - SZ0, {
      uv: "top",
      tint: [0.45, 0.35, 0.26],
    });
    b.col(0, CY - 0.3, SZ0, 4.5, CY, SF1, { tag: "floor", surface: "wood" });
    b.face("concrete", 2.4, CY, -21, 1, 0, 0, 0, 0, -1, 2.1, -21 - SF1, {
      uv: "top",
      tint: [0.45, 0.42, 0.38],
    });
    b.col(2.4, CY - 0.3, SF1, 4.5, CY, -21, { tag: "floor" });
    // apartment level: landing (north), floor over the down flight, hole over the up flight
    b.face("wood", 0, UP, SF1, 1, 0, 0, 0, 0, -1, 4.5, SF1 - SZ0, {
      uv: "top",
      tint: [0.5, 0.38, 0.28],
    });
    b.face("wood", 0, UP, SF0, 1, 0, 0, 0, 0, -1, 2.4, SF0 - SF1, {
      uv: "top",
      tint: [0.5, 0.38, 0.28],
    });
    b.face("wood", 0, UP, -21, 1, 0, 0, 0, 0, -1, 4.5, 1.2, {
      uv: "top",
      tint: [0.5, 0.38, 0.28],
    });
    b.col(0, UP - 0.3, SZ0, 4.5, UP, SF1, { tag: "floor", surface: "wood" });
    b.col(0, UP - 0.3, SF1, 2.4, UP, SF0, { tag: "floor", surface: "wood" });
    b.col(0, UP - 0.3, SF0, 4.5, UP, -21, { tag: "floor", surface: "wood" });
    K.railing(b, 2.4, SF0, 2.4, SF1, UP, {
      h: 1.0,
      mat: "wood_dark",
      handMat: "mahogany",
    });
    K.railing(b, 2.4, SF0, 4.5, SF0, UP, {
      h: 1.0,
      mat: "wood_dark",
      handMat: "mahogany",
    });
    K.lamp(b, 1.2, 3.2, -24.5, "bulb", gas, 0.8, 7, {
      ceil: UP - 0.3,
      lightOpts: { box: SB },
    });
    K.lamp(b, 2.2, CY + 2.4, -29.6, "cage", gas, 0.6, 5, {
      ceil: CY + 3.2,
      lightOpts: { box: SB },
    });
    K.lamp(b, 3.4, UP + 2.6, -29.6, "bulb", gas, 0.6, 5, {
      ceil: UP + 3.1,
      lightOpts: { box: SB },
    });
    b.plate(
      "art",
      4.38,
      1.6,
      -21.7,
      -1,
      0,
      0.8,
      0.3,
      K.signCell("mcs_private", "PRIVATE ↑", 192, 60, {
        bg: "#1c3a26",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
    );
    b.plate(
      "art",
      0.02,
      1.4,
      -21.7,
      1,
      0,
      0.9,
      0.3,
      K.signCell("mcs_cellar", "CELLAR ↓", 192, 60, {
        bg: "#1c3a26",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
    );

    // ================================================= APARTMENT (upstairs)
    const AP = [-4.6, UP - 0.3, SZ0 - 0.1, 4.6, UP + 3.2, 0.1];
    K.room(b, ctx, {
      x0: -4.5,
      z0: SZ0,
      x1: 0,
      z1: -18,
      y: UP,
      h: 3.1,
      floor: "wood",
      fc: [0.55, 0.42, 0.3],
      wall: "wallpaper",
      wc: [0.8, 0.72, 0.6],
      ceil: "plaster",
      cc: [0.55, 0.5, 0.44],
      surface: "wood",
    });
    K.room(b, ctx, {
      x0: 0,
      z0: -21,
      x1: 4.5,
      z1: -18,
      y: UP,
      h: 3.1,
      floor: "wood",
      fc: [0.55, 0.42, 0.3],
      wall: "wallpaper",
      wc: [0.8, 0.72, 0.6],
      ceil: "plaster",
      cc: [0.55, 0.5, 0.44],
      surface: "wood",
    });
    K.room(b, ctx, {
      x0: -4.5,
      z0: -18,
      x1: 4.5,
      z1: 0,
      y: UP,
      h: 3.1,
      floor: "wood",
      fc: [0.55, 0.42, 0.3],
      wall: "wallpaper_green",
      wc: [0.72, 0.74, 0.6],
      wain: "wood_dark",
      wainC: panel,
      ceil: "plaster",
      cc: [0.55, 0.5, 0.44],
      surface: "wood",
    });
    K.bed(b, -2.5, UP, -29.6, 0, { w: 1.5, tint: [0.62, 0.55, 0.45] });
    b.boxMM("wood_dark", -4.4, UP, -21, -3.4, UP + 1.6, -19.6, { tint: panel });
    b.col(-4.4, UP, -21, -3.4, UP + 1.6, -19.6, {});
    K.framed(b, -4.38, UP + 1.9, -26, 1, 0, 0.8, 0.6, K.photo("saloon", 40), {
      frame: "wood_dark",
    });
    K.lamp(b, -2.2, UP + 2.6, -24, "bulb", gas, 0.7, 6, {
      ceil: UP + 3.1,
      lightOpts: { box: AP },
    });
    K.lamp(b, 2.2, UP + 2.6, -19.5, "bulb", gas, 0.5, 4, {
      ceil: UP + 3.1,
      lightOpts: { box: AP },
    });
    // parlour: front windows onto 7th Street (with the fire escape outside), desk, gramophone, the family license
    for (const wx of [-2.2, 2.2]) {
      b.plate("lamp", wx, UP + 1.6, -0.12, 0, -1, 1.1, 1.8, null, {
        tint: [0.4, 0.4, 0.36],
      });
      b.light(wx, UP + 1.6, -0.8, [0.75, 0.72, 0.62], 0.55, 5, { box: AP });
      for (let k = 0; k < 4; k++)
        b.beam(
          "black_iron",
          wx - 0.55 + k * 0.37,
          UP + 0.7,
          -0.08,
          wx - 0.55 + k * 0.37,
          UP + 2.5,
          -0.08,
          0.02,
          0.02,
        );
    }
    const dsk = K.table(b, -3.2, UP, -8, 1.0, 1.8, { mat: "mahogany" });
    K.chair(b, -2.5, UP, -8, HP, { mat: "leather", tint: [0.3, 0.18, 0.12] });
    K.terminal(ctx, "pev_term_mcs", -3.3, dsk, -8.4, HP, termDeck(), "bare");
    K.anchor(ctx, "ledger", -3.2, dsk + 0.02, -7.4);
    b.box("wood_dark", 3.6, UP, -16.6, 0.6, 0.9, 0.6, { tint: panel });
    b.cyl("brass", 3.6, UP + 0.95, -16.6, 0.04, 0.35, 0.45, 10, {
      tint: [0.8, 0.62, 0.3],
    }); // gramophone
    b.col(3.3, UP, -16.9, 3.9, UP + 0.9, -16.3, {});
    K.sofa(b, 2.5, UP, -4, 2.4, PI, { mat: "velvet", tint: [0.45, 0.2, 0.18] });
    K.framed(
      b,
      -2.2,
      UP + 1.9,
      -17.88,
      0,
      1,
      1.2,
      0.8,
      K.signCell(
        "mcs_license",
        "LICENSE No. 1\nJOHN O'ROURKE\nALE HOUSE · 1854",
        256,
        170,
        { bg: "#e8dcc0", fg: "#2a1a0a", font: "Georgia, serif" },
      ),
      { frame: "gold" },
    );
    K.salonWall(b, -16.5, -1.2, UP + 1.2, UP + 2.8, 4.38, -1, 0, "mcs_apt", {
      density: 0.7,
      photos: "saloon",
    });
    K.lamp(b, 0, UP + 2.6, -9, "pendant", gas, 0.75, 7, {
      ceil: UP + 3.1,
      shade: "paint_green",
      lightOpts: { box: AP },
    });
    K.loot(ctx, "safe", -4.1, UP, -16.8, HP, {
      loot: "safe",
      owner: "settlers",
      name: "O'Rourke Family Safe",
      tag: "safe",
      lock: K.regLock({
        id: "pev_lk_mcs_safe",
        label: "O'Rourke Family Safe",
        kind: "safe",
        code: "1854",
        hint: "Deck's back-office teletype.",
      }),
    });
    K.loot(ctx, "scrip_stash", -4.1, UP, -30.3, HP, {
      owner: "settlers",
      name: "Deck's Tip Jar",
    });
    K.loot(ctx, "bed", 1.8, UP, -12, 0, {
      name: "Spare Cot (Deck says it's fine)",
    });

    // ================================================= CELLAR
    const CB = [-4.6, CY - 0.2, -21.1, 4.6, -0.2, -1.9];
    K.room(b, ctx, {
      x0: -4.5,
      z0: -21,
      x1: 4.5,
      z1: -2,
      y: CY,
      h: 2.9,
      floor: "concrete",
      fc: [0.45, 0.42, 0.38],
      wall: "brick_red",
      wc: [0.55, 0.4, 0.34],
      ceil: "wood",
      cc: [0.32, 0.26, 0.2],
      trim: false,
    });
    // cask racks (horizontal barrels on cradles) along both walls
    for (const sx of [-1, 1])
      for (let k = 0; k < 8; k++) {
        const z = -19.2 + k * 1.5,
          x = sx * 3.7;
        if (sx > 0 && z > -8) continue;
        if (sx < 0 && z < -17) continue; // the breach
        b.beam(
          "wood_dark",
          x - 0.6,
          CY + 0.2,
          z,
          x + 0.6,
          CY + 0.2,
          z,
          0.15,
          0.15,
          { tint: panel },
        );
        b.geo("wood", K.unitCyl(12), {
          x,
          y: CY + 0.7,
          z,
          sx: 0.5,
          sy: 1.1,
          sz: 0.5,
          rz: HP,
          tint: [0.55, 0.4, 0.26],
        });
        for (const e of [-0.35, 0.35])
          b.geo("rust", K.unitCyl(12), {
            x: x + e,
            y: CY + 0.7,
            z,
            sx: 0.52,
            sy: 0.06,
            sz: 0.52,
            rz: HP,
          });
        if (k % 2 === 0) {
          b.geo("wood", K.unitCyl(12), {
            x,
            y: CY + 1.65,
            z,
            sx: 0.45,
            sy: 1.0,
            sz: 0.45,
            rz: HP,
            tint: [0.5, 0.36, 0.24],
          });
        }
        b.col(x - 0.6, CY, z - 0.55, x + 0.6, CY + 2.1, z + 0.55, {});
      }
    // the brew kettle & mash tun (Deck brews light AND dark down here)
    b.cyl("copper", 2.8, CY, -5, 0.9, 0.9, 1.4, 16, {
      tint: [0.75, 0.46, 0.26],
    });
    b.geo("copper", K.sphereGeo(), {
      x: 2.8,
      y: CY + 1.4,
      z: -5,
      sx: 0.9,
      sy: 0.5,
      sz: 0.9,
      tint: [0.75, 0.46, 0.26],
    });
    b.pipe("copper", 2.8, CY + 1.85, -5, 2.8, -0.3, -5, 0.08, 6, {
      tint: [0.75, 0.46, 0.26],
    });
    b.cyl("wood", 0.6, CY, -4.4, 0.7, 0.7, 1.1, 14, {
      tint: [0.55, 0.4, 0.26],
    });
    b.pipe("copper", 1.9, CY + 0.9, -4.8, 1.2, CY + 1.0, -4.5, 0.05, 6, {
      tint: [0.75, 0.46, 0.26],
    });
    b.plate("lamp", 2.8, CY + 0.25, -4.08, 0, 1, 0.5, 0.2, null, {
      tint: [1, 0.4, 0.1],
    });
    b.light(2.4, CY + 0.6, -4, [1, 0.45, 0.15], 0.9, 4.5, { box: CB });
    b.glow(2.8, CY + 0.3, -3.9, [1, 0.4, 0.1], 1.3);
    b.col(1.9, CY, -5.9, 3.7, CY + 1.9, -4.1, {});
    b.col(-0.1, CY, -5.1, 1.3, CY + 1.1, -3.7, {});
    b.plate(
      "art",
      4.38,
      CY + 1.8,
      -6.5,
      -1,
      0,
      1.4,
      0.45,
      K.signCell("mcs_brew", "LIGHT · DARK · NOTHING ELSE", 384, 80, {
        bg: "#1c3a26",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
    );
    // crates, the coal bin and the hatch ladder at the street end
    for (let k = 0; k < 5; k++)
      b.box(
        "wood",
        -2.8 + (k % 3) * 0.7,
        CY + Math.floor(k / 3) * 0.6,
        -3.2,
        0.6,
        0.6,
        0.6,
        { yaw: r() * 0.2, tint: [0.6, 0.48, 0.34] },
      );
    b.col(-3.2, CY, -3.6, -0.8, CY + 1.2, -2.8, {});
    b.boxMM("concrete", -4.4, CY, -8.6, -2.6, CY + 0.8, -6.2, {
      tint: [0.4, 0.38, 0.35],
      faces: "nsewt",
    });
    for (let k = 0; k < 20; k++)
      b.geo("paint_black", K.sphereGeo(), {
        x: -3.5 + (r() - 0.5) * 1.6,
        y: CY + 0.8 + r() * 0.2,
        z: -7.4 + (r() - 0.5) * 2.2,
        s: 0.08 + r() * 0.08,
        tint: [0.08, 0.08, 0.08],
      });
    b.col(-4.4, CY, -8.6, -2.6, CY + 0.9, -6.2, {});
    const lx = 3.4,
      lz = -2.3;
    for (const s of [-0.22, 0.22])
      b.beam("rust", lx + s, CY, lz, lx + s, -0.1, lz, 0.05, 0.05);
    for (let yy = CY + 0.3; yy < -0.2; yy += 0.3)
      b.beam("rust", lx - 0.22, yy, lz, lx + 0.22, yy, lz, 0.03, 0.03);
    b.boxMM(
      "metal_dark",
      lx - 0.8,
      -0.35,
      lz - 0.6,
      lx + 0.8,
      -0.28,
      lz + 0.3,
      { tint: [0.3, 0.3, 0.28], faces: "b" },
    );
    b.light(lx, -0.6, lz, [0.6, 0.62, 0.55], 0.5, 3, { box: CB });
    // the giant roach breach (Cellar Dwellers) in the north-west corner
    b.boxMM("paint_black", -4.52, CY, -20.6, -4.48, CY + 1.5, -19.0, {
      tint: [0.02, 0.02, 0.02],
      faces: "e",
    });
    K.rubble(b, -3.6, CY, -19.8, 1.2, 0.6, { seed: 77 });
    for (let k = 0; k < 8; k++)
      b.hplate(
        "decal",
        -4 + r() * 3.5,
        CY + 0.012 + k * 0.0004,
        -20.5 + r() * 6,
        1,
        1,
        r() * 6,
        K.decal(k % 3 ? "roach" : "grime", 80 + k),
      );
    K.lamp(b, 0, CY + 2.5, -12, "bulb", gas, 0.7, 7, {
      ceil: CY + 2.9,
      lightOpts: { box: CB },
    });
    K.lamp(b, 0, CY + 2.5, -18.5, "bulb", gas, 0.3, 5, {
      ceil: CY + 2.9,
      lightOpts: { box: CB },
    });
    K.lamp(b, 0, CY + 2.5, -6, "bulb", gas, 0.6, 6, {
      ceil: CY + 2.9,
      lightOpts: { box: CB },
    });
    K.skel(ctx, -2.6, CY, -18.6, 1.1, "lying");
    K.loot(ctx, "crate", 3.6, CY, -7.0, 0, {
      kind: "plain",
      loot: "drinks",
      owner: "settlers",
      name: "Ale Crate",
    });
    K.loot(ctx, "footlocker", 0, CY, -15, 0, {
      loot: "footlocker",
      name: "Old Army Footlocker",
    });
    K.note(ctx, "pev_reel_mcs_2066", -2.3, CY + 0.03, -18.2, {
      type: "tape",
      name: 'Tape reel: "Wishbones, 1965"',
      title: "Recorded at the bar, Nov 1965",
      text: "[Bar noise. Glasses. Somebody singing badly.]\n\nDECK (twenty-odd years younger, hair still red): Alright, alright! Tradition! You eat the turkey, you hang the bone. When you come home from Vietnam, you take it down. Not before.\n\nFINNEGAN: And if we don't come home?\n\nDECK: Then it stays up there forever and I dust around it. Two lights, Finn?\n\nFINNEGAN: Two lights.\n\n[Twenty-three voices, counting wishbones onto the lamp. The tape runs out at nineteen.]",
    });
    // ================================================= doors & anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pev_mcs_in",
      pos: new THREE.Vector3(wx(DOOR_X), 1.3, wz(FZ + 0.45)),
      label: "O'Rourke's Old Ale House",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.4, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("orourkes")),
    });
    K.door(ctx, {
      id: "pev_mcs_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.3),
      label: "East 7th Street",
      verb: "Leave",
      target: { x: wx(DOOR_X), y: 0, z: wz(FZ + 1.9), yaw: PI },
    });
    K.door(ctx, {
      id: "pev_mcs_hatch_out",
      pos: new THREE.Vector3(OX + lx, OY + CY + 1.4, OZ + lz),
      label: "Cellar Hatch",
      verb: "Climb",
      target: { x: wx(HATCH.x), y: 0, z: wz(HATCH.z + 1.2), yaw: PI },
      onEnter: () =>
        K.safe("hatch unlock", () => {
          if (!G.isStub("locks") && G.locks.unlock)
            G.locks.unlock("pev_lk_mcs_hatch");
        }),
    });
    K.door(ctx, {
      id: "pev_mcs_hatch_in",
      pos: new THREE.Vector3(wx(HATCH.x), 0.4, wz(HATCH.z)),
      label: "O'Rourke's Cellar Hatch",
      verb: "Open",
      lock: K.regLock({
        id: "pev_lk_mcs_hatch",
        label: "O'Rourke's Cellar Hatch",
        kind: "door",
        key: "pev_mcs_cellar_key",
        hint: "Deck gives you the hatch key with the cellar job; leaving by the hatch from inside unlocks it.",
      }),
      target: { x: OX + lx, y: OY + CY, z: OZ + lz - 0.9, yaw: HP },
    }); // at the ladder foot, facing west down the cellar (the brew kettle is due north)
    K.anchor(ctx, "entrance", 0, 0, -1.4);
    K.anchor(ctx, "bartender", -3.625, 0, -6.2); // centred in the 0.65 m aisle between counter (x −3.3) and back bar (x −3.95)
    K.anchor(ctx, "merchant", -3.625, 0, -6.2);
    K.anchor(ctx, "npc1", -2.0, 0, -7.4); // Finnegan, at the bar
    K.anchor(ctx, "npc2", -0.3, 0, -17.8); // Abigail, back room long table
    K.anchor(ctx, "npc3", 3.3, 0, -9.0); // a regular
    K.anchor(ctx, "npc4", 0.1, 0, -3.3); // a dock worker
    K.anchor(ctx, "cook", -2.2, 0, -24.4);
    K.anchor(ctx, "stove", SX, 0, SZ);
    [
      [-1, CY, -19],
      [1.5, CY, -16],
      [-2, CY, -13],
      [2, CY, -10],
    ].forEach((p, i) => K.anchor(ctx, "roach" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "npc5", 1.45, 0, -15.3); // Harriet Vance once freed: far end of the long table, across from Abigail
    // hostile spawn spots (CONTRACT spawn1..6): ALL below stairs — cellar & cellar stair hall, where the
    // giant roach breach is. Never the bar room / back room: O'Rourke's is a friendly settlement.
    [
      [-2, CY, -18],
      [2, CY, -14],
      [-1, CY, -10],
      [3.4, CY, -25],
      [0.6, CY, -7.6],
      [-1.6, CY, -15.8],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    // friendly bar-room set: free patron seats (ambient/quest settlers) and the SAFE room box (no hostile spawns)
    [
      [2.4, -2.3],
      [2.4, -5.0],
      [-0.5, -10.8],
      [2.4, -11.8],
      [-0.25, -15.3],
      [1.45, -18.6],
    ].forEach((p, i) => K.anchor(ctx, "patron" + (i + 1), p[0], 0, p[1]));
    K.anchor(ctx, "safe", 0, 0, -6.5); // bar-room centre
    ctx.safeRooms = [
      {
        x0: O.x - 4.5,
        x1: O.x + 4.5,
        z0: O.z - 31,
        z1: O.z,
        y0: O.y - 0.5,
        y1: O.y + UP + 3.2,
      },
    ]; // bar, back room, kitchen, apartment
    K.anchor(ctx, "loot1", -4.1, UP, -16.8);
    K.anchor(ctx, "loot2", 3.6, CY, -7);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_orourkes_int";
  }

  /** Newspaper clipping cells (original headlines). */
  const HEADLINES = [
    "ALE HOUSE TURNS 110",
    "SOLDIERS SHIP OUT TO SAIGON",
    "MAYOR BANS NOTHING, ALE HOUSE UNIMPRESSED",
    "BERLIN CRISIS DEEPENS",
    "COOPER UNION ADDS ROBOTS",
    'TAMMANY BOSS "RE-ELECTED"',
    "LIGHT OR DARK? CITY DECIDES",
    "FIZZO COLA SHORTAGE",
    "CIVIL DEFENSE OPENS MANHATTAN SHELTERS",
    "FIRE AT 7th ST — ALE SAVED",
    "HOUDINI'S CUFFS STILL LOCKED",
    "CAT ELECTED ALDERMAN (UNOPPOSED)",
  ];
  function clipping(i) {
    const h = HEADLINES[i % HEADLINES.length];
    return K.paint("art", "mcs_clip_" + i, 128, 96, function (x, X, Y, W, Hh) {
      x.fillStyle =
        "rgb(" +
        (210 + ((i * 7) % 30)) +
        "," +
        (200 + ((i * 5) % 25)) +
        "," +
        (170 + ((i * 3) % 20)) +
        ")";
      x.fillRect(X, Y, W, Hh);
      x.fillStyle = "#1a1a1a";
      x.font = "bold 12px Georgia, serif";
      x.textAlign = "center";
      const words = h.split(" ");
      let line = "",
        yy = Y + 16;
      for (const w of words) {
        if ((line + w).length > 16) {
          x.fillText(line, X + W / 2, yy);
          yy += 14;
          line = "";
        }
        line += w + " ";
      }
      x.fillText(line, X + W / 2, yy);
      x.fillStyle = "rgba(40,40,40,0.5)";
      for (let k = 0; k < 6; k++) x.fillRect(X + 8, yy + 8 + k * 7, W - 16, 3);
      K.stains(x, X, Y, W, Hh, 4, i + 3, 0.5, [100, 70, 30]);
    });
  }
  function termDeck() {
    return {
      title: "O'ROURKE'S — BACK OFFICE",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nProperty of O'Rourke's Old Ale House — \"Be Good or Be Gone\"",
      lock: {
        id: "pev_lk_mcs_office",
        passcode: "SAWDUST",
        hint: "Ask Deck about the place; he'll tell you what the floor is made of.",
      },
      entries: [
        {
          title: "Ledger: Ward Tax Paid to Tammany",
          text: "Week 1: 40 scrip + 1 keg dark. Week 2: 40 scrip + 1 keg dark. Week 3: 60 scrip (\"inflation,\" says the Brave) + 1 keg dark + my good mustard.\n\nThe Boss drinks the dark himself. I've seen him. He doesn't even like dark. He does it because it's mine.",
        },
        {
          title: "Recipe: Light",
          text: "Malt, water, hops from the Beer Garden vines, yeast from the 1854 culture (DO NOT LET IT DIE — it survived the Civil War, Prohibition AND the bombs).\n\nIt is also, technically, the dark, with less roast. Don't tell anybody.",
        },
        {
          title: "Note to Self: Wishbones",
          text: "Nineteen bones on the lamp. Finn came home. Finn will not take his down. Says the man who hung it didn't come back, not really.\n\nI dust around it.",
        },
        {
          title: "Family Safe",
          learn: "pev_lk_mcs_safe",
          text: "Same combination as over the door, like Grandpa wanted: 1-8-5-4. If you are a Tammany Brave reading this: it is not.",
        },
        {
          title: "Open Family Safe",
          text: "The safe's bolts clunk back.",
          action: () => {
            EV.unlockTagged("mcs", "safe");
            K.notify("The O'Rourke family safe is unlocked.");
          },
        },
      ],
    };
  }

  // ==================================================================
  // DATA: items, quest, dialogues
  // ==================================================================
  function data() {
    K.defineItem({
      id: "pev_ale_light",
      type: "aid",
      name: "O'Rourke's Light Ale",
      weight: 0.5,
      value: 3,
      tags: ["drink", "alcohol"],
      mesh: "bottle_beer",
      sound: "drink",
      effects: { hp: 10, stamina: 10, duration: 150, attrs: { presence: 1 } },
      desc: "Pale, cloudy, cold-ish, brewed from an 1854 yeast culture that has outlived every empire it has ever met. Served in pairs. Always in pairs.",
    });
    K.defineItem({
      id: "pev_ale_dark",
      type: "aid",
      name: "O'Rourke's Dark Ale",
      weight: 0.5,
      value: 3,
      tags: ["drink", "alcohol"],
      mesh: "bottle_beer",
      sound: "drink",
      effects: { hp: 14, duration: 150, attrs: { brawn: 1 } },
      desc: "The same as the light, with more roast and more attitude. Leaves a moustache even on people who don't have one.",
    });
    K.defineItem({
      id: "pev_cheese_plate",
      type: "aid",
      name: "Cheese & Onions",
      weight: 0.5,
      value: 8,
      tags: ["food"],
      mesh: "food_box",
      sound: "eat",
      effects: { hpOverTime: [30, 10] },
      desc: "A slab of sharp cheddar, raw onion, saltines and a mustard hot enough to strip paint. The O'Rourke's lunch since before the Civil War.",
    });
    K.defineItem({
      id: "pev_mcs_cellar_key",
      type: "key",
      name: "O'Rourke's Hatch Key",
      weight: 0,
      value: 0,
      desc: "A small iron key on a bottle-opener ring. Opens the cellar hatch on East 7th Street.",
    });
    K.keyFrom("pev_mcs_cellar_key", 'Deck O\'Rourke — "Cellar Dwellers"');
    K.defineItem({
      id: "pev_orourke_stein",
      type: "misc",
      name: "O'Rourke's Pewter Stein",
      weight: 1,
      value: 160,
      tags: ["valuable", "unique"],
      desc: 'Deck\'s own stein, dented, engraved "BE GOOD OR BE GONE." Holding it, you feel honour-bound to be at least one of those things.',
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pev_cellar_dwellers",
        name: "Cellar Dwellers",
        giver: "Deck O'Rourke",
        location: "O'Rourke's Old Ale House",
        desc: "Giant roaches have chewed through the old coal tunnel into O'Rourke's cellar and are getting into the casks. Deck wants them gone before they find the yeast.",
        stages: [
          {
            id: "clear",
            text: "Kill the giant roaches in O'Rourke's cellar.",
            markers: [
              () => {
                const a = EV.anchor("mcs", "roach1");
                return a
                  ? {
                      x: a.x,
                      z: a.z,
                      y: a.y,
                      label: "Cellar",
                      interior: "orourkes",
                    }
                  : null;
              },
            ],
          },
          {
            id: "return",
            text: "Tell Deck the cellar is clear.",
            markers: [{ npc: "pev_deck", label: "Deck" }],
          },
        ],
        rewards: { xp: 120 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    const pour = (kind) => () => {
      const free = !EV.flag("mcs_first_round");
      if (!free) {
        if (K.scripCount() < 4) {
          EV.setFlag("mcs_broke", true);
          return;
        }
        K.scrip(-4);
      }
      EV.setFlag("mcs_first_round", true);
      EV.setFlag("mcs_broke", false);
      K.give(kind === "light" ? "pev_ale_light" : "pev_ale_dark", 2);
    };
    G.dialogue.register("pev_dlg_deck", {
      start: () => {
        if (
          q.active("pev_honest_graft") &&
          q.stage("pev_honest_graft") === "collect" &&
          !K.has("pev_tax_envelope")
        )
          return "tax";
        if (
          q.active("pev_honest_graft") &&
          q.stage("pev_honest_graft") === "return"
        )
          return "graft_done";
        if (
          q.active("pev_cellar_dwellers") &&
          q.stage("pev_cellar_dwellers") === "return"
        )
          return "cellar_done";
        return EV.flag("met_deck") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Deck O'Rourke",
          onEnter: () => EV.setFlag("met_deck", true),
          text: "Light or dark?",
          responses: [
            { text: "Light.", next: "light", action: pour("light") },
            { text: "Dark.", next: "dark", action: pour("dark") },
            { text: "What else have you got?", next: "else" },
            { text: "Just one, please.", next: "one" },
            { text: "Who are you?", next: "who" },
          ],
        },
        again: {
          speaker: "Deck O'Rourke",
          text: () =>
            q.done("pev_honest_graft") && EV.flag("graft_good")
              ? "Ah, the hero of the Fourth Ward. Light or dark? — kidding. I know. Two of each."
              : "Back again. Light or dark?",
          responses: [
            { text: "Light.", next: "light", action: pour("light") },
            { text: "Dark.", next: "dark", action: pour("dark") },
            { text: "Let's trade.", barter: true, end: true },
            { text: "Tell me about this place.", next: "history" },
            {
              text: "Heard you've got trouble with Tammany.",
              next: "tammany",
              cond: () => !q.started("pev_honest_graft"),
            },
            {
              text: "About Boss Croke...",
              next: "tammany_again",
              cond: () => q.active("pev_honest_graft"),
            },
            {
              text: "Anything else need doing?",
              next: "cellar",
              cond: () => !q.started("pev_cellar_dwellers"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        light: {
          speaker: "Deck O'Rourke",
          text: () =>
            EV.flag("mcs_broke")
              ? "Four scrip for two. You haven't got four scrip. Come back when you do — or sweep the sawdust, I'm not picky."
              : "Two lights. [He slides two mugs across the bar without looking.] First round for new faces is on the house. Every round after that is four scrip.",
          responses: [
            {
              text: "Why two?",
              next: "why_two",
              cond: () => !EV.flag("asked_two"),
            },
            { text: "Let's trade.", barter: true, end: true },
            { text: "Tell me about this place.", next: "history" },
            { text: "Thanks.", end: true },
          ],
        },
        dark: {
          speaker: "Deck O'Rourke",
          text: () =>
            EV.flag("mcs_broke")
              ? "Four scrip for two. Come back with four scrip. The dark isn't going anywhere. Neither am I. Neither is anybody, anymore."
              : "Two darks. [Thunk. Thunk.] There's a man who knows what he wants.",
          responses: [
            {
              text: "Why two?",
              next: "why_two",
              cond: () => !EV.flag("asked_two"),
            },
            { text: "Let's trade.", barter: true, end: true },
            { text: "Tell me about this place.", next: "history" },
            { text: "Thanks.", end: true },
          ],
        },
        else: {
          speaker: "Deck O'Rourke",
          text: "Light. Or dark.",
          responses: [
            { text: "Is there a difference?", next: "difference" },
            { text: "Light, then.", next: "light", action: pour("light") },
            { text: "Dark, then.", next: "dark", action: pour("dark") },
          ],
        },
        difference: {
          speaker: "Deck O'Rourke",
          text: "One's light. [Long pause.] One's dark. We've been pouring the same two ales since 1854, pal. Through a Civil War, Prohibition, the bombs, and a raider who asked for a white wine spritzer. Only one of those scared me.",
          responses: [
            { text: "Light.", next: "light", action: pour("light") },
            { text: "Dark.", next: "dark", action: pour("dark") },
          ],
        },
        one: {
          speaker: "Deck O'Rourke",
          text: "They come in twos. Like shoes. Like trouble. Like the Proctors over at Cooper Union — you ever see one of those alone, run.",
          responses: [
            { text: "Fine. Light.", next: "light", action: pour("light") },
            { text: "Fine. Dark.", next: "dark", action: pour("dark") },
          ],
        },
        why_two: {
          speaker: "Deck O'Rourke",
          onEnter: () => EV.setFlag("asked_two", true),
          text: "Saves me walking. Also, the first one's for you, and the second one's for whoever you should've brought. Everybody's got somebody they should've brought.",
          responses: [
            { text: "Tell me about this place.", next: "history" },
            { text: "Goodbye.", end: true },
          ],
        },
        who: {
          speaker: "Deck O'Rourke",
          text: "Declan O'Rourke. Deck. My family's poured here since John O'Rourke opened the doors in 1854. I was opening up the morning the bombs fell, Sunday, for the after-Mass crowd. Kept pouring. The radiation made me handsome, as you can see.",
          responses: [
            { text: "Tell me about this place.", next: "history" },
            { text: "Let's trade.", barter: true, end: true },
            { text: "Light, then.", next: "light", action: pour("light") },
          ],
        },
        history: {
          speaker: "Deck O'Rourke",
          learn: "pev_lk_mcs_office",
          text: "Sawdust on the floor — it's even the password on my office teletype, don't tell anybody — soaks up what you spill and what you bleed. Stove's older than the Brooklyn Bridge. Peter Cooper drank in the back room — that's his chair, don't sit in it. And the wishbones on the lamp... boys going to Vietnam in '65 hung 'em. You take yours down when you come home.",
          responses: [
            { text: "How many are still up there?", next: "wishbones" },
            { text: "Anything I can help with?", next: "help" },
            { text: "Goodbye.", end: true },
          ],
        },
        wishbones: {
          speaker: "Deck O'Rourke",
          text: "Nineteen. Ask Finnegan at the end of the bar about his. Actually — don't. Buy him a dark. He'll tell you anyway.",
          responses: [
            { text: "Anything I can help with?", next: "help" },
            { text: "Goodbye.", end: true },
          ],
        },
        help: {
          speaker: "Deck O'Rourke",
          text: "Two things eating me. The rats — roaches, actually — in my cellar. And the rats in Tammany Hall. The roaches at least don't send me a bill.",
          responses: [
            {
              text: "Tell me about the cellar.",
              next: "cellar",
              cond: () => !q.started("pev_cellar_dwellers"),
            },
            {
              text: "Tell me about Tammany.",
              next: "tammany",
              cond: () => !q.started("pev_honest_graft"),
            },
            { text: "Maybe later.", end: true },
          ],
        },
        cellar: {
          speaker: "Deck O'Rourke",
          text: "Roaches came up through the old coal tunnel and they're nosing at the casks. If they get into the 1854 yeast, that's a hundred and thirty-five years of ale gone. Clear 'em out, there's scrip and a case in it for you. Stairs are past the kitchen.",
          responses: [
            {
              text: "I'll handle it.",
              next: "cellar_ok",
              action: () => {
                q.start("pev_cellar_dwellers");
                if (EV.flag("mcs_roaches_clear"))
                  q.set("pev_cellar_dwellers", "return");
              },
            },
            { text: "Not right now.", end: true },
          ],
        },
        cellar_ok: {
          speaker: "Deck O'Rourke",
          text: "Here — the key to the street hatch, if you'd rather go in from outside. Mind the kettle. It's hot, and it's older than you.",
          onEnter: () => {
            if (!K.has("pev_mcs_cellar_key")) K.give("pev_mcs_cellar_key", 1);
          },
          responses: [{ text: "Right.", end: true }],
        },
        cellar_done: {
          speaker: "Deck O'Rourke",
          text: "Quiet down there? [He listens.] Quiet down there. You saved the yeast, pal. Here — sixty scrip, and a round for the house in your name. They'll drink to you. They'd drink to anybody, but still.",
          onEnter: () => {
            if (q.active("pev_cellar_dwellers")) {
              K.scrip(60);
              K.give("pev_ale_dark", 3);
              K.give("pev_ale_light", 3);
              q.complete("pev_cellar_dwellers");
            }
          },
          responses: [
            { text: "Cheers, Deck.", end: true },
            { text: "Let's trade.", barter: true, end: true },
          ],
        },
        tammany: {
          speaker: "Deck O'Rourke",
          text: 'Tammany Hall. Up on Union Square. An old crook who calls himself "Boss" Croke runs the old Wigwam like it\'s 1870 — him and his Braves. Every week they come in here for the "ward tax." Scrip, a keg of my dark, and my good mustard. The mustard\'s personal.',
          responses: [
            {
              text: "I'll go have a word with the Boss.",
              next: "tammany_yes",
              action: () => q.start("pev_honest_graft"),
            },
            {
              text: "[Trade 40] What's it worth to you?",
              check: { skill: "trade", value: 40 },
              next: "tammany_pay",
              failNext: "tammany_pay_fail",
            },
            { text: "Why not just pay?", next: "tammany_why" },
            { text: "Not my fight.", end: true },
          ],
        },
        tammany_why: {
          speaker: "Deck O'Rourke",
          text: "Because we were here before Tammany. We were here before the bombs. The day O'Rourke's pays a boss is the day we take the sawdust up. — Also, it's my mustard.",
          responses: [
            {
              text: "I'll go talk to him.",
              next: "tammany_yes",
              action: () => q.start("pev_honest_graft"),
            },
            { text: "Not my fight.", end: true },
          ],
        },
        tammany_pay: {
          speaker: "Deck O'Rourke",
          onEnter: () => EV.setFlag("graft_bonus", 75),
          text: "Ha! A negotiator. Fine: get him off my back and I'll add seventy-five scrip to whatever I was going to give you. Which was nothing. So, seventy-five scrip.",
          responses: [
            {
              text: "Deal.",
              next: "tammany_yes",
              action: () => q.start("pev_honest_graft"),
            },
          ],
        },
        tammany_pay_fail: {
          speaker: "Deck O'Rourke",
          text: "It's worth free ale and my undying respect, which, as an Irishman, lasts a very long time. So do the grudges.",
          responses: [
            {
              text: "Fine. I'll do it.",
              next: "tammany_yes",
              action: () => q.start("pev_honest_graft"),
            },
            { text: "Not my fight.", end: true },
          ],
        },
        tammany_yes: {
          speaker: "Deck O'Rourke",
          text: "Talk, shoot, or bribe — I don't care how. But the Boss is a talker; he's never lost an election because he's never had an opponent. Word is he keeps a black book of every dirty deal in his cellar strongroom. A man with a book like that is a man who can be persuaded.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        tammany_again: {
          speaker: "Deck O'Rourke",
          text: "Any luck with the Boss? He still breathing? He still collecting?",
          responses: [{ text: "Working on it.", end: true }],
        },
        tax: {
          speaker: "Deck O'Rourke",
          text: "You're here for the... [He looks at you. Long.] The Boss sent you. For the ward tax. You.",
          responses: [
            {
              text: "Nothing personal. Pay up.",
              next: "tax_paid",
              standing: -25,
              action: () => {
                K.give("pev_tax_envelope", 1);
                EV.setFlag("deck_betrayed", true);
              },
            },
            { text: "Changed my mind. Keep your scrip.", next: "tax_refuse" },
          ],
        },
        tax_paid: {
          speaker: "Deck O'Rourke",
          text: "[He counts out scrip into an envelope, slowly, and slaps it on the bar.] Hundred and fifty. There. Tell the Boss the mustard's off the table. And pal — it's four scrip for two, now. For you it's eight.",
          responses: [{ text: "...", end: true }],
        },
        tax_refuse: {
          speaker: "Deck O'Rourke",
          text: "Huh. [He pours two lights and pushes them over.] On the house. Now go tell the Boss where he can put his ward.",
          responses: [
            {
              text: "Cheers.",
              end: true,
              action: () => K.give("pev_ale_light", 2),
            },
          ],
        },
        graft_done: {
          speaker: "Deck O'Rourke",
          text: () =>
            EV.flag("boss_dead")
              ? "Boss Croke's dead? [He pours two darks. One for you, one he sets on the empty stool.] Good. Tammany's been dead since before the bombs. Somebody had to tell him."
              : "He's letting us be? No more ward tax? [He takes the mustard down from the high shelf and puts it back on the bar.] You don't know what this means. Well — you do. It means mustard.",
          responses: [{ text: "Glad I could help.", next: "graft_reward" }],
        },
        graft_reward: {
          speaker: "Deck O'Rourke",
          text: "Here. My own stein — been in the family since my great-granddad dented it on a Tammany alderman. And scrip. And you drink free here, forever. Well, you pay four scrip for two. But you pay them with dignity.",
          onEnter: () => finishGraftGood(),
          responses: [{ text: "Be good or be gone, Deck.", end: true }],
        },
      },
    });
    G.dialogue.register("pev_dlg_abigail", {
      start: () =>
        q.active("pev_right_makes_might") &&
        q.stage("pev_right_makes_might") === "return"
          ? "done"
          : q.done("pev_right_makes_might")
            ? "after"
            : EV.flag("met_abigail")
              ? "again"
              : "hello",
      nodes: {
        hello: {
          speaker: "Abigail Hewitt",
          onEnter: () => EV.setFlag("met_abigail", true),
          text: 'Shh. — Sorry. Forty years a librarian; the "shh" comes out on its own. Abigail Hewitt. I was head of circulation at Cooper Union, across the square. The day the bombs fell I stepped out for a drink. The only good decision I ever made, and it was two lights.',
          responses: [
            { text: "What happened at Cooper Union?", next: "what" },
            { text: "Why are you still here?", next: "why" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Abigail Hewitt",
          text: () =>
            q.active("pev_right_makes_might")
              ? "The Dean's office is on the second floor, east side. The lectern is in the Great Hall, in the basement. Please don't shoot the books."
              : "Back again? The exam is still running, you know. I can hear the Proctors on a quiet night.",
          responses: [
            {
              text: "What happened at Cooper Union?",
              next: "what",
              cond: () => !q.started("pev_right_makes_might"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        what: {
          speaker: "Abigail Hewitt",
          text: 'Ardent Robotics "partnered" with the school. Eleven robot Proctors to run examinations. When the sirens went, they did exactly what they were built for: nobody leaves during an exam. Two hundred students. The exam never ended. They\'re still sitting there, in the Great Hall. The robots are still proctoring.',
          responses: [
            { text: "How do I stop it?", next: "how" },
            { text: "That's horrible.", next: "horrible" },
          ],
        },
        horrible: {
          speaker: "Abigail Hewitt",
          text: "It's worse. They dressed the lead unit up as Abraham Lincoln for Founders' Day. It gives the speech — the real one, the one Lincoln gave in that hall in 1860 — and then it shoots anyone who talks.",
          responses: [{ text: "How do I stop it?", next: "how" }],
        },
        how: {
          speaker: "Abigail Hewitt",
          learn: "pev_lk_cu_panel",
          text: "The Dean had an override — a punch card. It opens the Great Hall and it can end the exam from the lectern. He kept it at his desk on the second floor. He's... still at his desk, I imagine. The Proctor panel by the stairs takes the faculty passcode, SEMINAR — that will at least lift the shutter. End the exam and let those kids go. Then maybe I can have my library back.",
          responses: [
            {
              text: "I'll end the exam.",
              next: "accept",
              action: () => {
                q.start("pev_right_makes_might");
                if (K.has("pev_cu_override_card"))
                  q.set(
                    "pev_right_makes_might",
                    EV.flag("cu_exam_over") ? "return" : "hall",
                  );
                else if (EV.flag("cu_exam_over"))
                  q.set("pev_right_makes_might", "return");
              },
            },
            {
              text: "[Wits 7] Is there another way past the Proctor panel?",
              check: { attr: "wits", value: 7 },
              next: "panel",
              failNext: "panel_fail",
            },
            { text: "Not now.", end: true },
          ],
        },
        panel: {
          speaker: "Abigail Hewitt",
          learn: "pev_lk_cu_panel",
          text: "The panel by the stairs? The faculty passcode was SEMINAR — all of us knew it, and the Dean never changed anything in his life. That lifts the shutter. The lectern only takes the Dean's card. Either way: end it. And if you see \"The Cooper Union Address, annotated\" on the Dean's desk, it's mine. Eleven million minutes overdue.",
          responses: [
            {
              text: "I'll end the exam.",
              next: "accept",
              action: () => q.start("pev_right_makes_might"),
            },
          ],
        },
        panel_fail: {
          speaker: "Abigail Hewitt",
          text: "Another way? Dear, I catalogued the terminals. I didn't understand them. Get the card.",
          responses: [
            {
              text: "I'll end the exam.",
              next: "accept",
              action: () => q.start("pev_right_makes_might"),
            },
          ],
        },
        accept: {
          speaker: "Abigail Hewitt",
          text: "Thank you. And — right makes might. Lincoln said it in that hall. I'd like it to be true again.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        why: {
          speaker: "Abigail Hewitt",
          text: "Where else? Deck keeps the stove lit and the ale honest, and nobody here shushes me back. Also, the back room has Peter Cooper's chair. I like to think he'd want the school open.",
          responses: [
            { text: "What happened at Cooper Union?", next: "what" },
            { text: "Goodbye.", end: true },
          ],
        },
        done: {
          speaker: "Abigail Hewitt",
          text: "You... it's over? The exam is over. [She takes off her glasses.] Eleven million minutes. I'm going to go back. I'm going to reshelve every book, and I'm going to hold a graduation for two hundred skeletons, and it's going to be beautiful.",
          responses: [{ text: "They earned it.", next: "reward" }],
        },
        reward: {
          speaker: "Abigail Hewitt",
          text: "Here. Your diploma. I made it myself. It says INCOMPLETE — everyone's does, it's the tradition now. And take these scrip; the library fines I've been owed since 1967 have finally come due.",
          onEnter: () => {
            K.give("pev_cu_diploma", 1);
            q.complete("pev_right_makes_might");
          },
          responses: [{ text: "Goodbye, Abigail.", end: true }],
        },
        after: {
          speaker: "Abigail Hewitt",
          text: "I went back. The Great Hall is quiet now. I read the Lincoln speech aloud to the empty chairs. Nobody told me to shh.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("pev_dlg_finnegan", {
      start: () => (EV.flag("finn_done") ? "after" : "hello"),
      nodes: {
        hello: {
          speaker: "Sgt. Finnegan",
          text: "Don't mind me. I'm just the ghost at the end of the bar. Sergeant Michael Finnegan, 3rd Infantry, Vietnam. Came home in '67. More or less.",
          responses: [
            { text: "Which wishbone is yours?", next: "bone" },
            {
              text: "[Buy him two darks — 4 scrip] Rough war?",
              cond: () => K.scripCount() >= 4,
              next: "story",
              action: () => {
                K.scrip(-4);
              },
            },
            { text: "Goodbye.", end: true },
          ],
        },
        bone: {
          speaker: "Sgt. Finnegan",
          text: "Third from the left, the crooked one. Deck says I take it down when I come home. I came home. But the kid who hung that bone — he didn't. He's still up there. So it stays.",
          responses: [
            {
              text: "[Persuasion 50] That kid made it home. He's drinking a dark right now. Take it down, Finn.",
              check: { skill: "persuasion", value: 50 },
              next: "down",
              failNext: "down_fail",
            },
            {
              text: "[Presence 6] Maybe take it down for the ones who can't.",
              check: { attr: "presence", value: 6 },
              next: "down",
              failNext: "down_fail",
            },
            { text: "Leave it, then.", next: "leave" },
          ],
        },
        story: {
          speaker: "Sgt. Finnegan",
          text: "Rough? We sweated in the paddies for two years for a war nobody ever explained, came home that February, and by March the sky up north was on fire. Twenty-three of us hung bones on that lamp in '65. Nineteen bones left up there. Four of us came home. I'm the only one still drinking.",
          responses: [
            { text: "Which wishbone is yours?", next: "bone" },
            { text: "I'm sorry.", end: true },
          ],
        },
        down: {
          speaker: "Sgt. Finnegan",
          text: "[He looks at the lamp for a long time. Then he reaches up — gently — and unhooks the crooked bone.] ...Huh. Lighter than I remembered. [He snaps it. Grins, a terrible gap-toothed grin.] I got the big half. Deck! Two lights. For the kid.",
          onEnter: () => {
            EV.setFlag("finn_done", true);
            K.standing(25, "Helped Finnegan home");
            K.xp(75, "The wishbone");
          },
          responses: [{ text: "Welcome home, Sergeant.", end: true }],
        },
        down_fail: {
          speaker: "Sgt. Finnegan",
          text: "Nice try, kid. Bone stays up. Now let me drink.",
          responses: [{ text: "Sorry.", end: true }],
        },
        leave: {
          speaker: "Sgt. Finnegan",
          text: "Yeah. Leave it.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        after: {
          speaker: "Sgt. Finnegan",
          text: "Eighteen bones on the lamp. First time I've counted 'em without my hands shaking. Buy you a light? No? I'll drink it for you.",
          responses: [{ text: "Goodbye, Finn.", end: true }],
        },
      },
    });
  }
  function finishGraftGood() {
    if (!K.q.active("pev_honest_graft")) return;
    EV.setFlag("graft_good", true);
    K.give("pev_orourke_stein", 1);
    K.scrip(150 + (EV.flag("graft_bonus") || 0));
    K.give("pev_ale_dark", 2);
    K.give("pev_ale_light", 2);
    K.standing(40, "Freed O'Rourke's from Tammany");
    K.q.complete("pev_honest_graft");
  }
  EV.mcsFinishGraftGood = finishGraftGood;

  // ==================================================================
  // SPAWN
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    const stock = K.stock(
      [
        ["pev_ale_light", 12],
        ["pev_ale_dark", 12],
        ["pev_cheese_plate", 6],
        ["beer", 4],
        ["whiskey", 2],
        ["purified_water", 4],
        ["fizzo_cola", 2],
        ["rally_tonic", 2],
      ],
      "merchant_food",
      3,
    );
    EV.spawnActor(ctx, {
      id: "pev_deck",
      type: "human",
      gender: "m",
      outfit: "merchant",
      name: "Deck O'Rourke",
      faction: "settlers",
      level: 9,
      essential: true,
      pos: v(A.bartender),
      yaw: -HP,
      ai: "merchant",
      home: "here",
      homeR: 1.6,
      dialogue: "pev_dlg_deck",
      voice: "settler",
      merchant: {
        scrip: EV.flag("deck_betrayed") ? 260 : 420,
        stock,
        restock: 2,
        priceMult: EV.flag("deck_betrayed") ? 2 : 1,
      },
      barks: [
        "Light or dark?",
        "Be good or be gone.",
        "Two at a time, pal. House rule since 1854.",
        "Mind the sawdust. It's load-bearing.",
      ],
    });
    EV.spawnActor(ctx, {
      id: "pev_tess",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Tess",
      faction: "settlers",
      level: 4,
      pos: v(A.cook),
      yaw: 0,
      ai: "wander",
      home: "here",
      homeR: 1.6,
      barks: [
        "Cheese and onions, coming up.",
        "Don't cry. It's the onions.",
        "Deck, we're low on mustard again.",
      ],
    });
    EV.spawnActor(ctx, {
      id: "pev_finnegan",
      type: "human",
      gender: "m",
      outfit: "combat_armor",
      name: "Sgt. Finnegan",
      faction: "settlers",
      level: 8,
      essential: true,
      pos: v(A.npc1),
      yaw: HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      dialogue: "pev_dlg_finnegan",
      voice: "settler",
      barks: ["Saigon. Never again.", "Two lights, Deck."],
    });
    EV.spawnActor(ctx, {
      id: "pev_abigail",
      type: "human",
      gender: "f",
      outfit: "lab_coat",
      name: "Abigail Hewitt",
      faction: "settlers",
      level: 5,
      essential: true,
      pos: v(A.npc2),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      dialogue: "pev_dlg_abigail",
      voice: "settler",
      barks: [
        "Shh.",
        "Right makes might.",
        "Eleven million minutes overdue...",
      ],
    });
    EV.spawnActor(ctx, {
      id: "pev_mcs_regular",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Regular",
      faction: "settlers",
      level: 3,
      pos: v(A.npc3),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Light.",
        "Dark.",
        "I been coming here since before it was cool. Which it never was.",
      ],
    });
    EV.spawnActor(ctx, {
      id: "pev_mcs_docker",
      type: "human",
      gender: "m",
      outfit: "settler",
      name: "Dock Worker",
      faction: "settlers",
      level: 3,
      pos: v(A.npc4),
      yaw: PI,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Tammany took my wages again. Took 'em \"for the widows.\" I'm not even married.",
      ],
    });
    const g = A.guard;
    EV.spawnActor(ctx, {
      id: "pev_sully",
      type: "human",
      gender: "m",
      outfit: "leather_armor",
      name: "Big Sully",
      faction: "settlers",
      level: 9,
      pos: v(g),
      yaw: PI,
      ai: "guard",
      home: "here",
      homeR: 1.5,
      weapon: K.itemExists("combat_shotgun")
        ? "combat_shotgun"
        : K.itemExists("baseball_bat")
          ? "baseball_bat"
          : undefined,
      barks: [
        "Be good or be gone.",
        "No Braves inside. You a Brave? You don't look like a Brave.",
        "Light or dark, that's the menu.",
      ],
    });
    EV.spawnActor(ctx, {
      id: "pev_mcs_gardener",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Beer Garden Settler",
      faction: "settlers",
      level: 3,
      pos: v(A.garden),
      ai: "wander",
      home: "here",
      homeR: 5,
    });
    EV.spawnActor(ctx, {
      id: "pev_mcs_gardener2",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Hop Picker",
      faction: "settlers",
      level: 3,
      pos: v(A.garden2),
      ai: "wander",
      home: "here",
      homeR: 4,
    });
    // the cellar roaches (until cleared)
    if (!EV.flag("mcs_roaches_clear")) {
      const ids = ["roach1", "roach2", "roach3", "roach4"];
      ids.forEach((n) =>
        EV.spawnActor(ctx, {
          id: "pev_mcs_" + n,
          type: "giant_roach",
          name: "Giant roach",
          faction: "creatures",
          level: 2,
          hostile: true,
          pos: v(A[n]),
          ai: "wander",
          home: "here",
          homeR: 3,
          noRespawn: true,
          onDeath: () => {
            const alive = ids.some((m) => {
              const a = G.actors.get && G.actors.get("pev_mcs_" + m);
              return a && !a.dead;
            });
            if (!alive) {
              EV.setFlag("mcs_roaches_clear", true);
              if (K.q.active("pev_cellar_dwellers")) {
                K.q.set("pev_cellar_dwellers", "return");
              }
            }
          },
        }),
      );
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  EV.define({
    id: "mcs",
    name: "O'Rourke's Old Ale House",
    interior: "orourkes",
    order: 20,
    lift: 4,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
  });
})();
