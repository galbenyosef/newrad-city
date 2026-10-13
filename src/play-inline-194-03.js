// play-inline-194 03 — blk
// Lines 321-651 of readable/play-inline-194.pretty.js (statement-aligned).
  function streetFacade(b, r, blk, side, H) {
    const z = blk.z0,
      cx = (blk.x0 + blk.x1) / 2,
      w = blk.x1 - blk.x0;
    const green = [0.3, 0.58, 0.42],
      redT = [0.55, 0.12, 0.1];
    // small shop windows either side of the big storefront
    for (const dx of [-7.6, 7.6]) {
      K.window(b, cx + dx, 1.6, z, 0, -1, 3.6, 2.6, {
        state: r() < 0.5 ? "broken" : "glass",
        sill: false,
        frame: "paint_red",
        surround: "paint_red",
        surroundTint: redT,
        inset: 0.18,
      });
      b.boxMM(
        "corrugated",
        cx + dx - 1.8,
        2.0,
        z - 0.24,
        cx + dx + 1.8,
        2.9,
        z - 0.2,
        { tint: [0.6, 0.55, 0.45] },
      );
    }
    // full-width canopy (tiles on top, red rafters beneath), upturned corners
    const x0 = blk.x0 + 0.4,
      x1 = blk.x1 - 0.4,
      yT = 6.0,
      yE = 5.1,
      dz = 1.7;
    b.quadN(
      "rooftile",
      [x0, yT, z],
      [x1, yT, z],
      [x1 + 0.3, yE, z - dz],
      [x0 - 0.3, yE, z - dz],
      [0, 1, -0.6],
      { tint: green, grime: 0.4 },
    );
    b.quadN(
      "paint_red",
      [x0, yT - 0.07, z],
      [x1, yT - 0.07, z],
      [x1 + 0.3, yE - 0.07, z - dz],
      [x0 - 0.3, yE - 0.07, z - dz],
      [0, -1, 0.6],
      { tint: [0.42, 0.1, 0.07], grime: 0.3 },
    );
    b.beam(
      "paint_red",
      x0 - 0.3,
      yE - 0.1,
      z - dz,
      x1 + 0.3,
      yE - 0.1,
      z - dz,
      0.14,
      0.2,
      { tint: [0.65, 0.14, 0.1] },
    );
    b.beam(
      "rooftile",
      x0 - 0.3,
      yT + 0.05,
      z - 0.05,
      x1 + 0.3,
      yT + 0.05,
      z - 0.05,
      0.2,
      0.2,
      { tint: [green[0] * 0.8, green[1] * 0.8, green[2] * 0.8] },
    );
    for (const [ex, sx] of [
      [x0 - 0.3, -1],
      [x1 + 0.3, 1],
    ]) {
      b.beam(
        "rooftile",
        ex,
        yE,
        z - dz,
        ex + sx * 0.4,
        yE + 0.55,
        z - dz - 0.45,
        0.18,
        0.12,
        { tint: green },
      );
      b.cyl(
        "gold",
        ex + sx * 0.4,
        yE + 0.55,
        z - dz - 0.45,
        0.06,
        0.02,
        0.3,
        5,
      );
    }
    for (let x = x0 + 0.9; x < x1; x += 1.9)
      K.lamp(b, x, 4.55, z - dz + 0.15, "lantern", [1, 0.35, 0.2], 0, 0, {
        ceil: yE - 0.1,
        size: 0.3,
        glowSize: 1.2,
      });
    // upper storeys: lacquered windows (and a painted band between floors)
    const nW = Math.max(3, Math.floor(w / 3.3));
    for (const wy of [8.0, 11.0]) {
      if (wy + 1 > H) continue;
      for (let k = 0; k < nW; k++) {
        const wx = blk.x0 + ((k + 0.5) * w) / nW;
        K.window(b, wx, wy, z, 0, -1, 1.2, 1.8, {
          state: r() < 0.3 ? "boarded" : r() < 0.5 ? "broken" : "glass",
          frame: "paint_green",
          lintel: 0.15,
          trimTint: [0.7, 0.66, 0.58],
          reveal: "brick_tan",
        });
      }
    }
    b.boxMM("paint_red", blk.x0, 6.5, z - 0.12, blk.x1, 6.75, z, {
      tint: redT,
    });
    b.boxMM("paint_red", blk.x0, 9.45, z - 0.1, blk.x1, 9.6, z, { tint: redT });
    // vertical signboard on the outer corner (perpendicular to the façade)
    const vx = side > 0 ? blk.x0 + 1.4 : blk.x1 - 1.4;
    b.boxMM("paint_black", vx - 0.12, 6.9, z - 1.5, vx + 0.12, 12.2, z, {});
    const key = "ct_street_vb" + (side > 0 ? "w" : "e");
    for (const s of [-1, 1])
      b.plate(
        "art",
        vx + s * 0.13,
        9.55,
        z - 0.75,
        s,
        0,
        1.3,
        5.1,
        vboard(
          key,
          6,
          side > 0 ? "#7a1a12" : "#1a1a1a",
          side > 0 ? "#f0d060" : "#e03020",
          "#c8a040",
        ),
        { off: 0.01 },
      );
    for (const y of [7.4, 11.6])
      b.beam("black_iron", vx, y, z - 1.5, vx, y + 0.5, z, 0.04, 0.04);
    b.glow(
      vx,
      9.5,
      z - 1.4,
      side > 0 ? [0.9, 0.5, 0.2] : [0.9, 0.2, 0.15],
      3.0,
    );
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  /**
   * The avenue (outer) and Canal St (rear) faces of a flanking block: Chinatown tenement walls — sash windows on
   * the upper floors, rolled-down shop shutters with hand-painted signs at street level, zig-zag fire escapes,
   * a painted ghost sign. They used to be blank brick. (blk = WEST/EAST, side = +1 west block / −1 east block)
   */
  function outerFacades(b, r, blk, side, H) {
    const ox = side > 0 ? blk.x0 : blk.x1,
      nx = -side; // outer avenue face
    const len = blk.z1 - blk.z0;
    const nBay = Math.floor(len / 5.2);
    const floors = [5.6, 9.6];
    for (let k = 0; k < nBay; k++) {
      const zc = blk.z0 + ((k + 0.5) * len) / nBay;
      if (k === 0) continue; // the corner bay belongs to the street façade
      // ground: roll-down shutter + painted board
      K.window(b, ox, 1.6, zc, nx, 0, 3.4, 2.7, {
        state: "dark",
        sill: false,
        frame: "paint_red",
        surround: "paint_red",
        surroundTint: [0.5, 0.12, 0.1],
        inset: 0.16,
      });
      b.boxMM(
        "corrugated",
        ox + nx * 0.17,
        0.25,
        zc - 1.7,
        ox + nx * 0.21,
        2.9,
        zc + 1.7,
        {
          tint: r.pick([
            [0.62, 0.56, 0.45],
            [0.5, 0.52, 0.5],
            [0.6, 0.45, 0.35],
          ]),
        },
      );
      if (k % 2)
        b.plate(
          "decal",
          ox + nx * 0.23,
          1.5,
          zc,
          nx,
          0,
          2.8,
          1.0,
          K.tag(
            r.pick([
              "CLOSED",
              "NO RADS HERE",
              "DRAGON RETURNS",
              "福",
              "KEEP OUT",
            ]),
            r.pick(["#e8d040", "#e04030", "#f0f0e0"]),
            256,
            96,
            { rot: (r() - 0.5) * 0.1 },
          ),
        );
      for (const wy of floors)
        for (const dz of [-1.2, 1.2])
          K.window(b, ox, wy, zc + dz, nx, 0, 1.0, 1.7, {
            state:
              r() < 0.3
                ? "boarded"
                : r() < 0.45
                  ? "broken"
                  : r() < 0.55
                    ? "lit"
                    : "glass",
            frame: "paint_green",
            lintel: 0.15,
            trimTint: [0.7, 0.66, 0.58],
            reveal: "brick_tan",
          });
    }
    // fire escapes over two bays + a painted ghost sign high on the blank end
    K.fireEscape(
      b,
      ox,
      blk.z0 + (1.5 * len) / nBay + (len / nBay) * 0.5,
      nx,
      0,
      5.6,
      [4.5, 8.5, 12.1],
      { seed: 70 + side },
    );
    K.ghostSign(
      b,
      ox,
      10.0,
      blk.z0 + ((nBay - 0.9) * len) / nBay,
      nx,
      0,
      (len / nBay) * 1.6,
      3.0,
      side > 0
        ? ["GOLDEN LOTUS TRADING CO.", "IMPORTERS · TEAS · SILKS"]
        : ["CANAL ST. FISH", "WHOLESALE · RETAIL"],
      { key: "ct_ghost" + side, bg: "rgba(90,24,18,0.45)" },
    );
    // string courses on the outer face
    for (const y of [4.6, 8.6])
      b.boxMM(
        "paint_red",
        ox,
        y - 0.08,
        blk.z0,
        ox + nx * 0.12,
        y + 0.08,
        blk.z1,
        { tint: [0.45, 0.14, 0.1] },
      );
    // rear (Canal St) face: upper windows + a fire escape
    const rz = blk.z1,
      rlen = blk.x1 - blk.x0;
    for (let x = blk.x0 + 2.4; x < blk.x1 - 1.5; x += 3.6) {
      for (const wy of floors)
        K.window(b, x, wy, rz, 0, 1, 1.0, 1.7, {
          state: r() < 0.35 ? "boarded" : "glass",
          frame: "paint_green",
          lintel: 0.15,
          trimTint: [0.7, 0.66, 0.58],
          reveal: "brick_tan",
        });
      K.window(b, x, 1.6, rz, 0, 1, 2.2, 2.4, {
        state: r() < 0.5 ? "boarded" : "dark",
        sill: false,
        reveal: "brick_tan",
        inset: 0.14,
      });
    }
    K.fireEscape(b, blk.x0 + rlen * 0.5, rz, 0, 1, 5.2, [4.5, 8.5], {
      seed: 80 + side,
    });
  }

  /** Cornice ring (red lacquer, 0.3 m proud on the lane & street) + a 0.9 m brick parapet round a block's roof. */
  function roofRing(b, blk, side, H, brickT) {
    const red = [0.45, 0.12, 0.1],
      lane = side > 0 ? "e" : "w";
    const out = (e) => (e === "n" || e === lane ? 0.3 : 0.1);
    const edges = [
      ["n", blk.x0, blk.z0 - out("n"), blk.x1, blk.z0 + 0.35],
      ["s", blk.x0, blk.z1 - 0.35, blk.x1, blk.z1 + out("s")],
      ["w", blk.x0 - out("w"), blk.z0, blk.x0 + 0.35, blk.z1],
      ["e", blk.x1 - 0.35, blk.z0, blk.x1 + out("e"), blk.z1],
    ];
    for (const [, x0, z0, x1, z1] of edges) {
      b.boxMM("paint_red", x0, H - 0.1, z0, x1, H + 0.3, z1, { tint: red });
      b.boxMM(
        "brick_tan",
        Math.max(x0, blk.x0),
        H + 0.3,
        Math.max(z0, blk.z0),
        Math.min(x1, blk.x1),
        H + 1.1,
        Math.min(z1, blk.z1),
        { tint: brickT.map((v) => v * 0.9) },
      );
    }
  }
  /** Tar roof clutter on a flanking block: water tank on a stand, stair bulkhead, vent stacks, laundry, a rooftop pigeon coop. */
