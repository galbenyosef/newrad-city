// play-inline-336 03 — tint
// Lines 242-880 of readable/play-inline-336.pretty.js (statement-aligned).
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
