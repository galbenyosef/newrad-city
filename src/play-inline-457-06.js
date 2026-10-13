// play-inline-457 06 — out
// Lines 1299-1366 of readable/play-inline-457.pretty.js (statement-aligned).
  H.grimePaint = function (face) {
    const burnSide = face.burn === "R" ? 1 : face.burn === "L" ? -1 : 0;
    const k = face.noScab ? 0.6 : 1;
    return function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
      const n1 = L.noise3(wx * 9, wy * 9, wz * 9),
        n2 = L.noise3(wx * 27 + 7, wy * 27, wz * 27);
      if (n1 > 0.66) {
        const g = 1 - 0.18 * k;
        out[0] *= g;
        out[1] *= g * 0.97;
        out[2] *= g * 0.94;
      } // ground-in dirt
      else if (n1 < 0.26) {
        out[0] *= 0.95;
        out[1] *= 0.93;
        out[2] *= 0.91;
      } // grey-brown dust
      if (n2 > 0.84 && !face.noScab) {
        out[0] = out[0] * 0.7 + 0.12;
        out[1] *= 0.62;
        out[2] *= 0.6;
      } // scabbed scratches
      if (
        burnSide &&
        x * burnSide > 0.02 &&
        L.noise3(wx * 5 + 3, wy * 5, wz * 5) > 0.5
      ) {
        out[0] = out[0] * 0.75 + 0.2;
        out[1] = out[1] * 0.7 + 0.08;
        out[2] = out[2] * 0.7 + 0.07;
      } // old burn
    };
  };
  H.raiderPaint = function (seed) {
    const mode = seed % 3;
    return function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
      // war paint: black band across the eyes, or red handprint streaks
      if (nz < -0.3) {
        if (mode === 0 && Math.abs(y - 0.12) < 0.018) {
          out[0] *= 0.18;
          out[1] *= 0.16;
          out[2] *= 0.16;
        }
        if (mode === 1 && Math.sin(x * 160) > 0.3 && y < 0.14 && y > 0.02) {
          out[0] = 0.45;
          out[1] *= 0.2;
          out[2] *= 0.18;
        }
        if (mode === 2 && Math.abs(x) < 0.012) {
          out[0] *= 0.2;
          out[1] *= 0.2;
          out[2] *= 0.2;
        }
      }
    };
  };
  H.agePaint = function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
    if (L.noise3(wx * 40, wy * 40, wz * 40) > 0.7) {
      out[0] *= 0.9;
      out[1] *= 0.86;
      out[2] *= 0.84;
    }
  };

  /**
   * Hair via "hairline shells": an inflated skull sphere whose vertices
   * below a style-specific hairline collapse inside the skull.
   */
