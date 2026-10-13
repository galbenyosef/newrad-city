// play-inline-191 04 — boxmm
// Lines 1017-1185 of readable/play-inline-191.pretty.js (statement-aligned).
  function i7top(f) {
    return GF + (f + 1) * FH <= TOP - 3.4;
  }

  /**
   * Side (avenue) and rear elevations: punched sash windows with limestone lintels on every floor, a rusticated
   * base course with shop windows at the front corners, black zig-zag fire escapes, and a faded painted ghost sign
   * on the windowless upper rear of the west wall. All in the authoring frame (the builder flips it).
   */
  function sideElevations(b, r) {
    const trim = [0.9, 0.86, 0.78];
    const winState = (f) => {
      const u = r();
      return u < 0.16
        ? "boarded"
        : u < 0.34
          ? "broken"
          : f <= 3 && u > 0.86
            ? "lit"
            : "glass";
    };
    const zs = [];
    for (let i = 0; i < 7; i++) zs.push(Z0 + 3 + (i * (Z1 - Z0 - 6)) / 6);
    const collapsedTop = TOP - 5;
    // --- base course + string courses on both sides
    for (const [x, nx, top] of [
      [X0, -1, TOP],
      [X1, 1, collapsedTop],
    ]) {
      b.boxMM("limestone", x, GF - 0.45, Z0, x + nx * 0.4, GF, Z1, {
        tint: [0.85, 0.8, 0.7],
      });
      b.boxMM("brick_brown", x, 0, Z0, x + nx * 0.25, 0.7, Z1, {
        tint: [0.55, 0.45, 0.38],
      });
      for (let f = 1; f < NF; f++) {
        const y = GF + f * FH;
        if (y > top - 0.5) break;
        b.boxMM("limestone", x, y - 0.1, Z0, x + nx * 0.12, y + 0.06, Z1, {
          tint: trim,
        });
      }
      // ground floor: two big shop windows at the front corner, a service door, boarded rear
      K.window(b, x, 2.3, Z0 + 4.2, nx, 0, 4.6, 2.9, {
        state: nx < 0 ? "broken" : "boarded",
        sill: false,
        frame: "paint_green",
        reveal: "brick_brown",
        inset: 0.22,
      });
      K.window(b, x, 2.3, Z0 + 10.2, nx, 0, 4.6, 2.9, {
        state: "boarded",
        sill: false,
        frame: "paint_green",
        reveal: "brick_brown",
        inset: 0.22,
      });
      b.boxMM("paint_green", x, 0, Z1 - 7.2, x + nx * 0.1, 2.5, Z1 - 5.8, {
        tint: [0.3, 0.38, 0.3],
      }); // service door
      b.boxMM("limestone", x, 2.5, Z1 - 7.4, x + nx * 0.18, 2.72, Z1 - 5.6, {
        tint: trim,
      });
      b.plate(
        "decal",
        x + nx * 0.05,
        1.5,
        Z1 - 11.5,
        nx,
        0,
        3.0,
        1.1,
        K.tag(
          nx < 0 ? "SID & NANCY 4EVR" : "ART IS NOT DEAD",
          nx < 0 ? "#e04040" : "#40c0e0",
          256,
          96,
          { rot: -0.05 },
        ),
      );
      // upper floors
      for (let f = 0; f < NF; f++) {
        const y0 = GF + f * FH;
        if (y0 + FH > top - 0.3) break;
        zs.forEach((wz, i) => {
          if (nx < 0 && f >= 6 && i >= 3) return; // the ghost-sign wall (west, upper rear)
          K.window(b, x, y0 + 1.5, wz, nx, 0, 1.1, 1.95, {
            state: winState(f),
            lintel: 0.22,
            trimTint: trim,
            frame: "paint_cream",
            reveal: "brick_red",
          });
        });
      }
      // fire escape over windows 1–2
      const fyMax = nx < 0 ? NF : 6;
      const ys = [];
      for (let f = 0; f < fyMax; f++) ys.push(GF + f * FH + 0.12);
      K.fireEscape(b, x, (zs[1] + zs[2]) / 2, nx, 0, 6.2, ys, {
        seed: nx < 0 ? 5 : 6,
      });
    }
    // --- the painted ghost sign (west wall, floors 7–9, rear half)
    K.ghostSign(
      b,
      X0,
      GF + 7.5 * FH,
      (zs[3] + Z1) / 2 + 0.6,
      -1,
      0,
      Z1 - zs[3] - 1.2,
      FH * 2.8,
      ["HOTEL CHELSEA", "500 ROOMS · 400 BATHS", "ABSOLUTELY FIREPROOF"],
      {
        key: "chelsea_ghost",
        fg: "rgba(238,228,200,0.8)",
        bg: "rgba(60,40,32,0.35)",
      },
    );
    // --- rear elevation (26th Street): paired windows per bay, fire escapes on bays 1 and 5, a bricked-up base
    for (let i = 0; i < 8; i++) {
      const cx = X0 + i * BAYW + BAYW / 2;
      K.window(b, cx, 2.4, Z1, 0, 1, 2.2, 2.4, {
        state: i % 3 === 1 ? "boarded" : "dark",
        sill: false,
        reveal: "brick_brown",
        inset: 0.16,
      });
      for (let f = 0; f < NF; f++) {
        const y0 = GF + f * FH;
        for (const s of [-1, 1])
          K.window(b, cx + s * WIN_OFF, y0 + 1.5, Z1, 0, 1, 1.1, 1.95, {
            state: winState(f),
            lintel: 0.2,
            trimTint: trim,
            frame: "paint_cream",
            reveal: "brick_red",
          });
      }
      if (i === 1 || i === 5) {
        const ys = [];
        for (let f = 0; f < NF; f++) ys.push(GF + f * FH + 0.12);
        K.fireEscape(b, cx, Z1, 0, 1, 6.0, ys, { seed: 10 + i });
      }
    }
    for (let f = 1; f < NF; f++)
      b.boxMM(
        "limestone",
        X0,
        GF + f * FH - 0.1,
        Z1,
        X1,
        GF + f * FH + 0.06,
        Z1 + 0.12,
        { tint: [0.8, 0.76, 0.68] },
      );
    b.boxMM("limestone", X0, GF - 0.45, Z1, X1, GF, Z1 + 0.4, {
      tint: [0.8, 0.76, 0.68],
    });
    b.boxMM("metal", X0, TOP - 0.3, Z1, X1, TOP + 0.35, Z1 + 0.5, {
      tint: [0.33, 0.29, 0.25],
    }); // rear cornice
    K.rubble(b, X1 - 8, 0, Z1 + 1.4, 2.2, 0.9, { seed: 44, col: false });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
