/* src/poi_civic/20_municipal.js */
/* =====================================================================
 * NEW RAD CITY — poi_civic / 20_municipal.js
 * MANHATTAN MUNICIPAL BUILDING — EXTERIOR (site municipal_building:
 * x 130..190, z 587..620; Worth Street north, Chambers Street south —
 * the Brooklyn Bridge approach beyond — Centre Street west).
 *
 * McKim, Mead & White's 1914 colossus, compressed: a granite base with a
 * screen of giant Corinthian columns along Chambers Street and the great
 * TRIUMPHAL ARCH through the middle of the building (a real street-level
 * passage from Worth St to Chambers St, coffered barrel vault), a tall
 * limestone slab of punched windows, a set-back tier with four corner
 * lanterns, the colonnaded central tower and cupola, and CIVIC FAME — the
 * gilded copper giantess with her crown of turrets — on top.
 * Ruin dressing: the brutes have walled the arch with stacked
 * car wrecks and filing cabinets dragged out of the Hall of Records,
 * hung cages from the vault, burn records in oil drums, and painted
 * their opinions of paperwork on the columns.
 * The street ↔ interior door (bronze doors inside the arch) lives in
 * 21_municipal_interior.js.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PC = G._pc;
  const K = PC.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const X0 = 130.2,
    X1 = 189.8,
    ZN = 587.2,
    ZS = 618.2;
  const AX0 = 154.5,
    AX1 = 165.5,
    ACX = 160,
    AR = 5.5,
    ASP = 8.2; // arch passage (spring y, radius)
  const ZC = 614.6; // base wall behind the south colonnade
  const B1 = 16.4; // top of the base (entablature)
  const S1 = 62; // top of the slab
  // C plan: the slab wraps a light court open to Worth St (north), over the roof of the base
  const CX0 = 143.4,
    CX1 = 176.6,
    CZ1 = 596.2;
  // set-back tier over the south bar of the C, and the tower on it
  const TX0 = 141,
    TX1 = 179,
    TZ0 = 597.2,
    TZ1 = 614.2,
    T1 = S1 + 14.4,
    TCZ = 605.7;
  const BAY_D = 0.5; // depth of the window reveals
  PC.MUNI = {
    X0,
    X1,
    ZN,
    ZS,
    AX0,
    AX1,
    ACX,
    AR,
    ASP,
    CX0,
    CX1,
    CZ1,
    S1,
    B1,
    TX0,
    TX1,
    TZ0,
    TZ1,
    T1,
    TCZ,
  };

  const GRAN = [0.62, 0.6, 0.56],
    LIME = [0.86, 0.83, 0.76],
    LIME_D = [0.72, 0.69, 0.62];

  // slab façade texture: 4 bays × 4 floors per tile (8.8 m × 14.4 m)
  K.addCustom(
    "muni_bays",
    function (x, S, r) {
      x.fillStyle = "#c8c0ac";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 1400; i++) {
        const v = r();
        x.fillStyle =
          v < 0.5 ? "rgba(80,72,60,0.12)" : "rgba(255,250,235,0.12)";
        x.fillRect(r() * S, r() * S, 2, 2);
      }
      const B = S / 4;
      for (let bx = 0; bx < 4; bx++) {
        // pilaster strips between bays
        x.fillStyle = "rgba(235,228,210,0.55)";
        x.fillRect(bx * B, 0, 10, S);
        x.fillStyle = "rgba(60,54,44,0.35)";
        x.fillRect(bx * B + 10, 0, 3, S);
      }
      for (let fy = 0; fy < 4; fy++)
        for (let bx = 0; bx < 4; bx++) {
          const X = bx * B,
            Y = fy * B;
          const wx = X + B * 0.3,
            ww = B * 0.4,
            wy = Y + B * 0.18,
            wh = B * 0.6;
          x.fillStyle = "#4a4438";
          x.fillRect(wx - 5, wy - 5, ww + 10, wh + 10); // reveal
          const v = r();
          if (v < 0.42) {
            const g = x.createLinearGradient(wx, wy, wx + ww, wy + wh);
            g.addColorStop(0, "#6a7672");
            g.addColorStop(0.5, "#2c3432");
            g.addColorStop(1, "#141a19");
            x.fillStyle = g;
            x.fillRect(wx, wy, ww, wh);
            x.fillStyle = "rgba(210,220,200,0.16)";
            x.beginPath();
            x.moveTo(wx, wy + wh * 0.35);
            x.lineTo(wx + ww * 0.7, wy);
            x.lineTo(wx + ww, wy);
            x.lineTo(wx, wy + wh * 0.6);
            x.fill();
          } else if (v < 0.78) {
            x.fillStyle = "#0c0b0a";
            x.fillRect(wx, wy, ww, wh);
            x.fillStyle = "rgba(120,130,125,0.5)";
            for (let k = 0; k < 2; k++) {
              const px = wx + r() * ww;
              x.beginPath();
              x.moveTo(px - 6, wy);
              x.lineTo(px + 8, wy);
              x.lineTo(px + r() * 5, wy + 10 + r() * 26);
              x.fill();
            }
          } else if (v < 0.88) {
            x.fillStyle = "#6a5640";
            x.fillRect(wx, wy, ww, wh);
            for (let k = 0; k < 4; k++) {
              x.fillStyle = k % 2 ? "#7a654a" : "#58473a";
              x.fillRect(wx, wy + (k * wh) / 4, ww, wh / 4 - 2);
            }
          } else {
            x.fillStyle = "#20282a";
            x.fillRect(wx, wy, ww, wh);
            x.fillStyle = r() < 0.5 ? "#b8a27a" : "#6a5a4a";
            x.fillRect(wx, wy, ww, wh * (0.2 + r() * 0.5));
          }
          x.fillStyle = "#3a342a";
          x.fillRect(wx + ww / 2 - 2, wy, 4, wh);
          x.fillRect(wx, wy + wh * 0.55, ww, 3); // mullion/transom
          x.fillStyle = "#ddd4bc";
          x.fillRect(wx - 9, wy + wh + 4, ww + 18, 7); // sill
          const g2 = x.createLinearGradient(0, wy + wh, 0, wy + wh + B * 0.45);
          g2.addColorStop(0, "rgba(35,28,20,0.4)");
          g2.addColorStop(1, "rgba(35,28,20,0)");
          x.fillStyle = g2;
          x.fillRect(wx + ww * 0.15, wy + wh + 10, ww * 0.7, B * 0.45);
          x.fillStyle = "rgba(80,70,55,0.35)";
          x.fillRect(X, Y + B - 3, B, 3); // floor line
        }
      K.stains(x, 0, 0, S, S, 28, 1701, 0.35, [60, 50, 35]);
      K.streaks(x, 0, 0, S, S, 50, 1702, 0.26);
    },
    { tile: [8.8, 14.4], rough: 0.85, size: 1024 },
  );

  const inscription = () =>
    K.signCell("pc_mb_inscr", "MANHATTAN · MUNICIPAL · BUILDING", 1024, 96, {
      bg: "#b8b09c",
      fg: "#3a342a",
      font: 'Georgia, "Times New Roman", serif',
    });
  const relief = () =>
    K.paint("art", "pc_mb_relief", 256, 160, function (x, X, Y, W, H) {
      x.fillStyle = "#a8a08e";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#8e8676";
      // a winged Victory holding a wreath (low relief)
      x.beginPath();
      x.ellipse(X + W * 0.5, Y + H * 0.55, W * 0.08, H * 0.32, 0.1, 0, PI * 2);
      x.fill();
      x.beginPath();
      x.arc(X + W * 0.52, Y + H * 0.2, W * 0.05, 0, PI * 2);
      x.fill();
      for (const s of [-1, 1]) {
        x.beginPath();
        x.moveTo(X + W * 0.5, Y + H * 0.35);
        x.quadraticCurveTo(
          X + W * (0.5 + s * 0.35),
          Y + H * 0.05,
          X + W * (0.5 + s * 0.45),
          Y + H * 0.3,
        );
        x.quadraticCurveTo(
          X + W * (0.5 + s * 0.25),
          Y + H * 0.35,
          X + W * 0.5,
          Y + H * 0.5,
        );
        x.fill();
      }
      x.strokeStyle = "#8e8676";
      x.lineWidth = 5;
      x.beginPath();
      x.arc(X + W * 0.72, Y + H * 0.3, 14, 0, PI * 2);
      x.stroke();
      K.stains(x, X, Y, W, H, 10, 1703, 0.4, [50, 40, 30]);
      K.streaks(x, X, Y, W, H, 10, 1704, 0.3);
    });

  /** Inward barrel vault along z (half cylinder, spring at y, radius r, centre x). */
  function barrel(b, cx, y, r, z0, z1, mat, tint, seg) {
    K.vault(b, {
      axis: "z",
      from: z0,
      to: z1,
      c: cx,
      r,
      y,
      h: r,
      mat,
      tint,
      seg: seg || 14,
    });
  }
  K.barrelZ = barrel;

  /**
   * Recessed window-bay façade (muni_bays cells 2.2 m × 3.6 m, aligned with the texture):
   * face plane = limestone grille (piers + spandrels), glazing set back BAY_D, 4 reveals per window.
   * Origin (ax, az), U = (ux, uz) along the wall for len metres; normal = (−uz, ux). Windows whose head
   * would pass yTop are left solid (attic zone).
   */
  function bays(b, ax, az, ux, uz, len, y0, y1, yTop, tint) {
    const nx = -uz,
      nz = ux,
      D = BAY_D;
    const P = (a, y, d) => [ax + ux * a + nx * d, y, az + uz * a + nz * d];
    b.face(
      "muni_bays",
      ax - nx * D,
      y0,
      az - nz * D,
      ux,
      0,
      uz,
      0,
      1,
      0,
      len,
      y1 - y0,
      { tint },
    );
    const cols = [];
    for (let j = 0; ; j++) {
      const a0 = j * 2.2 + 0.62,
        a1 = j * 2.2 + 1.58;
      if (a1 > len - 0.35) break;
      cols.push([a0, a1]);
    }
    const rows = [];
    for (let m = Math.ceil(y0 / 3.6); ; m++) {
      const w0 = m * 3.6 + 0.75,
        w1 = m * 3.6 + 2.99;
      if (w1 > yTop) break;
      if (w0 >= y0 + 0.4) rows.push([w0, w1]);
    }
    const LIMEF = [tint[0] * 0.95, tint[1] * 0.93, tint[2] * 0.88];
    const front = (a0, a1, ya, yb) => {
      if (a1 - a0 > 1e-3 && yb - ya > 1e-3)
        b.face(
          "limestone",
          P(a0, 0, 0)[0],
          ya,
          P(a0, 0, 0)[2],
          ux,
          0,
          uz,
          0,
          1,
          0,
          a1 - a0,
          yb - ya,
          { tint: LIMEF, uo: a0, seg: 8 },
        );
    };
    // piers (full height) between window columns
    let t = 0;
    for (const [a0, a1] of cols) {
      front(t, a0, y0, y1);
      t = a1;
    }
    front(t, len, y0, y1);
    if (!rows.length) {
      for (const [a0, a1] of cols) front(a0, a1, y0, y1);
      return;
    }
    for (const [a0, a1] of cols) {
      // spandrels between the windows of this column
      let y = y0;
      for (const [w0, w1] of rows) {
        front(a0, a1, y, w0);
        y = w1;
      }
      front(a0, a1, y, y1);
      for (const [w0, w1] of rows) {
        const J = [0.62, 0.6, 0.55],
          S = [0.9, 0.87, 0.8],
          H = [0.34, 0.32, 0.3];
        b.quadN(
          "limestone",
          P(a0, w0, 0),
          P(a0, w0, -D),
          P(a0, w1, -D),
          P(a0, w1, 0),
          [ux, 0, uz],
          { tint: J },
        ); // jambs
        b.quadN(
          "limestone",
          P(a1, w0, 0),
          P(a1, w0, -D),
          P(a1, w1, -D),
          P(a1, w1, 0),
          [-ux, 0, -uz],
          { tint: J },
        );
        b.quadN(
          "limestone",
          P(a0, w0, 0),
          P(a1, w0, 0),
          P(a1, w0, -D),
          P(a0, w0, -D),
          [0, 1, 0],
          { tint: S },
        ); // sill
        b.quadN(
          "limestone",
          P(a0, w1, 0),
          P(a1, w1, 0),
          P(a1, w1, -D),
          P(a0, w1, -D),
          [0, -1, 0],
          { tint: H },
        ); // head (in shadow)
      }
    }
    // giant piers every fourth bay (the building's vertical rhythm), proud of the grille
    for (let a = 4.4; a < len - 1; a += 8.8) {
      const c0 = P(a - 0.34, 0, 0),
        c1 = P(a + 0.34, 0, 0.28);
      b.boxMM(
        "limestone",
        Math.min(c0[0], c1[0]),
        y0,
        Math.min(c0[2], c1[2]),
        Math.max(c0[0], c1[0]),
        yTop + 0.3,
        Math.max(c0[2], c1[2]),
        { tint, faces: "nsew" },
      );
    }
  }

  function exterior(ctx) {
    const b = K.builder({ name: "mb_ext", grime: 0.55, seg: 5 });
    const r = K.rng("mb_ext");
    /** Horizontal band (y0..y1) projecting `out` around the C-shaped slab outline. */
    const cring = (y0, y1, out, tint) => {
      b.boxMM("limestone", X0 - out, y0, ZN - out, CX0 + out, y1, ZS + out, {
        tint,
        faces: "nsewtb",
      });
      b.boxMM("limestone", CX1 - out, y0, ZN - out, X1 + out, y1, ZS + out, {
        tint,
        faces: "nsewtb",
      });
      b.boxMM("limestone", CX0 + out, y0, CZ1 - out, CX1 - out, y1, ZS + out, {
        tint,
        faces: "nswtb",
      });
    };

    // ================= BASE (y 0 .. B1) =================
    const baseFace = (ax, az, ux, uz, len) => {
      b.face("granite", ax, 0, az, ux, 0, uz, 0, 1, 0, len, 1.4, {
        tint: [0.5, 0.48, 0.45],
      });
      b.face("ashlar", ax, 1.4, az, ux, 0, uz, 0, 1, 0, len, B1 - 1.4, {
        tint: GRAN,
      });
    };
    // north (Worth St): two wings either side of the arch (U = −x for a −z normal)
    baseFace(AX0, ZN, -1, 0, AX0 - X0);
    baseFace(X1, ZN, -1, 0, X1 - AX1);
    // west / east
    baseFace(X0, ZN, 0, 1, ZS - ZN);
    baseFace(X1, ZS, 0, -1, ZS - ZN);
    // south: recessed wall behind the colonnade (z = ZC) and corner piers
    baseFace(X0 + 2, ZC, 1, 0, AX0 - X0 - 2);
    baseFace(AX1, ZC, 1, 0, X1 - 2 - AX1);
    for (const [p0, p1] of [
      [X0, X0 + 2],
      [X1 - 2, X1],
    ]) {
      baseFace(p0, ZS, 1, 0, p1 - p0);
      b.face(
        "ashlar",
        p0 === X0 ? p1 : p0,
        0,
        p0 === X0 ? ZS : ZC,
        0,
        0,
        p0 === X0 ? -1 : 1,
        0,
        1,
        0,
        ZS - ZC,
        B1,
        { tint: GRAN },
      );
    }
    // arch pylons on the south front (the arch projects to ZS)
    baseFace(AX0 - 2.2, ZS, 1, 0, 2.2);
    baseFace(AX1, ZS, 1, 0, 2.2);
    for (const [px, sgn] of [
      [AX0 - 2.2, -1],
      [AX1 + 2.2, 1],
    ])
      b.face(
        "ashlar",
        px,
        0,
        sgn < 0 ? ZC : ZS,
        0,
        0,
        sgn < 0 ? 1 : -1,
        0,
        1,
        0,
        ZS - ZC,
        B1,
        { tint: GRAN },
      );
    // windows in the base: 3 floors on N/E/W, 2 behind the colonnade
    const baseWin = (x, z, nx, nz, floors) => {
      for (let f = 0; f < floors; f++) {
        const y = 3.2 + f * 4.4;
        K.window(b, x, y + 1.3, z, nx, nz, 1.7, 2.6, {
          state: r() < 0.5 ? "broken" : r() < 0.6 ? "dark" : "boarded",
          surround: "limestone",
          surroundTint: LIME_D,
          lintel: 0.3,
          frame: "paint_black",
          inset: 0.22,
        });
      }
    };
    for (let x = X0 + 3; x < AX0 - 2; x += 4.2) baseWin(x, ZN, 0, -1, 3);
    for (let x = AX1 + 3; x < X1 - 2; x += 4.2) baseWin(x, ZN, 0, -1, 3);
    for (let z = ZN + 3; z < ZS - 2; z += 4.3) {
      baseWin(X0, z, -1, 0, 3);
      baseWin(X1, z, 1, 0, 3);
    }
    for (let x = X0 + 4.5; x < AX0 - 3; x += 4.2) baseWin(x, ZC, 0, 1, 2);
    for (let x = AX1 + 3.5; x < X1 - 3; x += 4.2) baseWin(x, ZC, 0, 1, 2);
    // base entablature ring (y B1−2.2 .. B1) with the south frieze, projecting over the colonnade
    b.boxMM(
      "limestone",
      X0 - 0.3,
      B1 - 2.2,
      ZN - 0.3,
      X1 + 0.3,
      B1 - 1.5,
      ZS + 0.3,
      { tint: LIME_D, faces: "nsewb" },
    );
    b.boxMM(
      "limestone",
      X0 - 0.2,
      B1 - 1.5,
      ZN - 0.2,
      X1 + 0.2,
      B1 - 0.4,
      ZS + 0.2,
      { tint: LIME, faces: "nsew" },
    );
    b.boxMM("limestone", X0 - 0.6, B1 - 0.4, ZN - 0.6, X1 + 0.6, B1, ZS + 0.6, {
      tint: LIME_D,
      faces: "nsewb",
    });
    b.plate("art", ACX, B1 - 0.95, ZS + 0.21, 0, 1, 30, 1.0, inscription());
    b.face(
      "concrete_dark",
      X0 + 2,
      B1 - 2.2,
      ZC,
      1,
      0,
      0,
      0,
      0,
      1,
      X1 - X0 - 4,
      ZS - ZC,
      { uv: "top", tint: [0.4, 0.38, 0.35] },
    ); // colonnade soffit (faces down)
    // colonnade: giant Corinthian columns on a stylobate
    b.boxMM("granite", X0 + 2, 0, ZC, AX0 - 2.2, 0.9, ZS, {
      tint: [0.52, 0.5, 0.47],
    });
    b.boxMM("granite", AX1 + 2.2, 0, ZC, X1 - 2, 0.9, ZS, {
      tint: [0.52, 0.5, 0.47],
    });
    for (const [a0, a1] of [
      [X0 + 2, AX0 - 2.2],
      [AX1 + 2.2, X1 - 2],
    ]) {
      for (let k = 0; k < 3; k++)
        b.boxMM(
          "granite",
          a0,
          0,
          ZS - 0.1 + k * 0.0,
          a1,
          0.3 * (k + 1),
          ZS - k * 0.4,
          { tint: [0.55, 0.53, 0.5] },
        );
      b.col(a0, 0, ZC, a1, 0.9, ZS - 0.8, {
        tag: "stairs",
        surface: "concrete",
      });
      b.col(a0, 0, ZS - 0.8, a1, 0.6, ZS - 0.4, {
        tag: "stairs",
        surface: "concrete",
      });
      b.col(a0, 0, ZS - 0.4, a1, 0.3, ZS, {
        tag: "stairs",
        surface: "concrete",
      });
      const n = Math.round((a1 - a0) / 3.3);
      for (let k = 0; k <= n; k++) {
        const cx = a0 + 0.9 + (k * (a1 - a0 - 1.8)) / n;
        K.column(b, cx, 0.9, ZS - 1.6, B1 - 2.2 - 0.9, 0.62, {
          tint: LIME,
          capTint: LIME_D,
          fluted: true,
          seg: 12,
        });
        b.col(cx - 0.62, 0.9, ZS - 2.22, cx + 0.62, B1 - 2.2, ZS - 0.98, {
          tag: "column",
        });
      }
    }
    // colliders (base blocks around the passage & the colonnade recess)
    b.col(X0, 0, ZN, AX0, B1, ZC, { tag: "building" });
    b.col(AX1, 0, ZN, X1, B1, ZC, { tag: "building" });
    b.col(X0, 0, ZC, X0 + 2, B1, ZS, { tag: "building" });
    b.col(X1 - 2, 0, ZC, X1, B1, ZS, { tag: "building" });
    b.col(AX0 - 2.2, 0, ZC, AX0, B1, ZS, { tag: "building" });
    b.col(AX1, 0, ZC, AX1 + 2.2, B1, ZS, { tag: "building" });

    // ================= THE ARCH & PASSAGE =================
    const top = ASP + AR;
    // passage side walls, vault, floor paving
    for (const [x, n] of [
      [AX0, 1],
      [AX1, -1],
    ])
      b.face(
        "ashlar",
        x,
        0,
        n > 0 ? ZS : ZN,
        0,
        0,
        n > 0 ? -1 : 1,
        0,
        1,
        0,
        ZS - ZN,
        ASP,
        { tint: [0.5, 0.48, 0.45] },
      );
    barrel(b, ACX, ASP, AR, ZN, ZS, "coffer", [0.62, 0.58, 0.5], 16);
    for (let z = ZN + 2; z < ZS; z += 4.5) {
      // transverse ribs
      let prev = null;
      for (let i = 0; i <= 12; i++) {
        const a = (i / 12) * PI,
          p = [
            ACX + Math.cos(a) * (AR - 0.12),
            ASP + Math.sin(a) * (AR - 0.12),
            z,
          ];
        if (prev)
          b.beam(
            "limestone",
            prev[0],
            prev[1],
            prev[2],
            p[0],
            p[1],
            p[2],
            0.5,
            0.25,
            { tint: LIME_D },
          );
        prev = p;
      }
    }
    b.face("sidewalk", AX0, 0.06, ZS, 1, 0, 0, 0, 0, -1, AX1 - AX0, ZS - ZN, {
      uv: "top",
      tint: [0.55, 0.53, 0.5],
    });
    b.col(AX0, -0.3, ZN, AX1, 0.06, ZS, { tag: "floor", surface: "concrete" });
    b.col(AX0 - 0.1, 0, ZN, AX0, B1, ZS, { tag: "building" });
    b.col(AX1, 0, ZN, AX1 + 0.1, B1, ZS, { tag: "building" });
    b.col(AX0, top, ZN, AX1, B1, ZS, { tag: "building" });
    // arch fronts (south + north): spandrels, voussoir ring, keystone, Victories
    for (const [z, n] of [
      [ZS, 1],
      [ZN, -1],
    ]) {
      const ry = n > 0 ? 0 : PI;
      b.geo("ashlar", K.spandrelGeo(AX1 - AX0, B1 - 2.2 - ASP), {
        x: ACX,
        y: ASP,
        z: z + n * 0.01,
        ry,
        tint: GRAN,
      });
      for (let k = 0; k <= 12; k++) {
        const a = (k / 12) * PI,
          px = ACX + Math.cos(a) * (AR + 0.3),
          py = ASP + Math.sin(a) * (AR + 0.3);
        b.box(
          "limestone",
          px,
          py - 0.35,
          z + n * 0.15,
          k === 6 ? 0.9 : 0.6,
          k === 6 ? 1.5 : 0.7,
          0.4,
          { yaw: 0, tint: k === 6 ? LIME : LIME_D },
        );
      }
      for (const s of [-1, 1])
        b.plate(
          "art",
          ACX + s * 4.4,
          ASP + 4.6,
          z + n * 0.05,
          0,
          n,
          3.0,
          1.9,
          relief(),
          { tint: [0.9, 0.88, 0.82] },
        );
      for (const s of [-1, 1]) {
        b.boxMM(
          "limestone",
          ACX + s * AR - 0.5,
          ASP - 0.4,
          z - (n > 0 ? 0.3 : -0.3) - 0.3,
          ACX + s * AR + 0.5,
          ASP,
          z + n * 0.35,
          { tint: LIME_D },
        );
      } // imposts
    }
    // bronze doors into the lobby (east wall of the passage) + lamp brackets
    const DZ = 603;
    b.boxMM("limestone", AX1 - 0.3, 0, DZ - 2.7, AX1, 5.6, DZ + 2.7, {
      tint: LIME,
    });
    b.col(AX1 - 0.34, 0, DZ - 2.7, AX1, 5.6, DZ + 2.7, { tag: "building" });
    // round 2: a readable bronze pair (panels, grilled glazing, transom, push bars) between two lit wall lamps,
    // with the brutes' fire glowing through the glass — the way in must read from the arch mouths
    K.doorway(b, AX1 - 0.3, 0.06, DZ, -1, 0, {
      w: 3.0,
      h: 3.4,
      transom: 0.8,
      mat: "bronze",
      frame: "granite",
      frameTint: [0.7, 0.68, 0.64],
      glow: [1, 0.55, 0.25],
      glowI: 0.5,
      lamps: true,
      lampCol: [1, 0.78, 0.5],
    });
    b.plate(
      "art",
      AX1 - 0.32,
      5.0,
      DZ,
      -1,
      0,
      3.2,
      0.5,
      K.signCell("pc_mb_door", "OFFICES · HALL OF RECORDS", 512, 64, {
        bg: "#3a342a",
        fg: "#d8c088",
        font: "Georgia, serif",
      }),
    );
    b.plate(
      "art",
      AX0 + 0.03,
      4.5,
      DZ,
      1,
      0,
      3.2,
      0.5,
      K.signCell("pc_mb_door2", "SUBWAY · BROOKLYN BRIDGE ↓", 512, 64, {
        bg: "#1a1a1a",
        fg: "#e8e0c8",
        font: "Arial, sans-serif",
      }),
    );
    for (const z of [DZ - 7, DZ + 7])
      for (const x of [AX0 + 0.35, AX1 - 0.35]) {
        b.box("bronze", x, 4.2, z, 0.3, 0.5, 0.3, { tint: [0.35, 0.28, 0.2] });
        b.geo("glass", K.sphereGeo(), {
          x: x + (x < ACX ? 0.35 : -0.35),
          y: 4.5,
          z,
          s: 0.28,
          tint: [0.4, 0.42, 0.38],
        });
      }
    K.anchor(ctx, "door", AX1 - 1.4, 0.06, DZ, false);

    // ================= SLAB (y B1 .. S1): C plan around a north light court =================
    // Real recessed window bays: a limestone grille (piers + spandrels) on the face plane, the
    // glazing (muni_bays cells) set back BAY_D behind it, with jamb / sill / head reveals.
    const slab = (ax, az, ux, uz, len) =>
      bays(b, ax, az, ux, uz, len, B1, S1, S1 - 3.4, [0.95, 0.93, 0.88]);
    slab(CX0, ZN, -1, 0, CX0 - X0); // north face, west wing
    slab(X1, ZN, -1, 0, X1 - CX1); // north face, east wing
    slab(CX1, CZ1, -1, 0, CX1 - CX0); // court back wall (south bar, facing north)
    slab(CX0, CZ1, 0, -1, CZ1 - ZN); // court: west wing's east face
    slab(CX1, ZN, 0, 1, CZ1 - ZN); // court: east wing's west face
    slab(X0, ZS, 1, 0, X1 - X0); // south (Chambers St)
    slab(X0, ZN, 0, 1, ZS - ZN); // west (Centre St)
    slab(X1, ZS, 0, -1, ZS - ZN); // east
    b.col(X0, B1, ZN, CX0, S1, ZS, { tag: "building" });
    b.col(CX1, B1, ZN, X1, S1, ZS, { tag: "building" });
    b.col(CX0, B1, CZ1, CX1, S1, ZS, { tag: "building" });
    // court floor = the roof of the base (tar, puddles, a skylight over the arch, vents, a dead pigeon coop)
    b.face(
      "concrete_dark",
      CX0,
      B1 + 0.02,
      CZ1,
      1,
      0,
      0,
      0,
      0,
      -1,
      CX1 - CX0,
      CZ1 - ZN,
      { uv: "top", tint: [0.36, 0.35, 0.33] },
    );
    b.col(CX0, B1 - 0.3, ZN, CX1, B1 + 0.02, CZ1, {
      tag: "roof",
      surface: "concrete",
    });
    b.boxMM("limestone", CX0, B1, ZN - 0.6, CX1, B1 + 1.1, ZN, {
      tint: LIME_D,
    }); // parapet on Worth St
    b.boxMM(
      "glass",
      AX0 + 1,
      B1 + 0.02,
      ZN + 1.2,
      AX1 - 1,
      B1 + 0.9,
      CZ1 - 1.4,
      { tint: [0.25, 0.3, 0.3], faces: "nsewt" },
    );
    for (const [vx, vz] of [
      [CX0 + 4, ZN + 3],
      [CX1 - 5, ZN + 5.5],
      [CX0 + 9, CZ1 - 2],
    ]) {
      b.cyl("metal", vx, B1, vz, 0.6, 0.6, 1.6, 8, { tint: [0.45, 0.43, 0.4] });
      b.cyl("metal", vx, B1 + 1.6, vz, 0.9, 0.25, 0.4, 8);
    }
    b.boxMM(
      "wood_rotten",
      CX1 - 8,
      B1,
      CZ1 - 3.4,
      CX1 - 4.5,
      B1 + 2.2,
      CZ1 - 1,
      { tint: [0.5, 0.42, 0.34] },
    );
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        CX0 + 2 + r() * (CX1 - CX0 - 4),
        B1 + 0.03 + k * 0.001,
        ZN + 1 + r() * (CZ1 - ZN - 2),
        2 + r() * 2,
        2 + r() * 2,
        r() * 6,
        K.decal(k % 2 ? "grime" : "scorch", k + 60),
      );
    // limestone string courses at two floor lines (in the spandrel band, so they never cut a window)
    for (const y of [32.4, 46.8]) cring(y - 0.2, y + 0.15, 0.15, LIME_D);
    // top: attic storey + great cornice + dentils, all following the C plan
    cring(S1 - 3, S1 - 2.6, 0.2, LIME_D);
    cring(S1 - 0.8, S1, 1.0, LIME_D);
    for (let x = X0 - 0.6; x <= X1 + 0.6; x += 1.1) {
      b.box("limestone", x, S1 - 1.2, ZS + 0.6, 0.28, 0.4, 0.7, {
        tint: LIME_D,
      });
      if (x < CX0 + 0.6 || x > CX1 - 0.6)
        b.box("limestone", x, S1 - 1.2, ZN - 0.6, 0.28, 0.4, 0.7, {
          tint: LIME_D,
        });
      else
        b.box("limestone", x, S1 - 1.2, CZ1 - 0.6, 0.28, 0.4, 0.7, {
          tint: LIME_D,
        });
    }
    for (const [x0, z0, x1, z1] of [
      [X0, ZN, CX0, ZS],
      [CX1, ZN, X1, ZS],
      [CX0, CZ1, CX1, ZS],
    ])
      b.face("concrete_dark", x0, S1, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.42, 0.4, 0.38],
      });
    K.balustrade(b, X0 - 0.6, ZS + 0.6, X1 + 0.6, ZS + 0.6, S1, {
      h: 1.1,
      ped: 4.4,
      col: false,
      tint: LIME,
    });
    K.balustrade(b, X0 - 0.6, ZN - 0.6, CX0 + 0.6, ZN - 0.6, S1, {
      h: 1.1,
      ped: 4.4,
      col: false,
      tint: LIME,
    });
    K.balustrade(b, CX1 - 0.6, ZN - 0.6, X1 + 0.6, ZN - 0.6, S1, {
      h: 1.1,
      ped: 4.4,
      col: false,
      tint: LIME,
    });
    K.balustrade(b, CX0 + 0.6, CZ1 - 0.6, CX1 - 0.6, CZ1 - 0.6, S1, {
      h: 1.1,
      ped: 4.4,
      col: false,
      tint: LIME,
    });

    // ================= TIER 1 (set back over the south bar) + corner lanterns =================
    const tier = (ax, az, ux, uz, len) =>
      bays(b, ax, az, ux, uz, len, S1, T1, T1 - 0.9, [0.93, 0.91, 0.86]);
    tier(TX1, TZ0, -1, 0, TX1 - TX0);
    tier(TX0, TZ1, 1, 0, TX1 - TX0);
    tier(TX0, TZ0, 0, 1, TZ1 - TZ0);
    tier(TX1, TZ1, 0, -1, TZ1 - TZ0);
    b.boxMM(
      "limestone",
      TX0 - 0.7,
      T1 - 0.6,
      TZ0 - 0.7,
      TX1 + 0.7,
      T1,
      TZ1 + 0.7,
      { tint: LIME_D, faces: "nsewtb" },
    );
    b.face(
      "concrete_dark",
      TX0,
      T1,
      TZ1,
      1,
      0,
      0,
      0,
      0,
      -1,
      TX1 - TX0,
      TZ1 - TZ0,
      { uv: "top", tint: [0.42, 0.4, 0.38] },
    );
    for (const [cx, cz] of [
      [TX0 + 2, TZ0 + 2],
      [TX1 - 2, TZ0 + 2],
      [TX0 + 2, TZ1 - 2],
      [TX1 - 2, TZ1 - 2],
    ]) {
      b.boxMM("limestone", cx - 2, T1, cz - 2, cx + 2, T1 + 4, cz + 2, {
        tint: LIME,
      });
      for (let k = 0; k < 4; k++) {
        const a = k * HP + PI / 4;
        K.column(
          b,
          cx + Math.cos(a) * 1.4,
          T1 + 4,
          cz + Math.sin(a) * 1.4,
          4.2,
          0.2,
          { tint: LIME, plinth: false, seg: 6 },
        );
      }
      b.boxMM(
        "paint_black",
        cx - 1.0,
        T1 + 4,
        cz - 1.0,
        cx + 1.0,
        T1 + 8.2,
        cz + 1.0,
        { tint: [0.08, 0.08, 0.08] },
      );
      b.boxMM(
        "limestone",
        cx - 1.8,
        T1 + 8.2,
        cz - 1.8,
        cx + 1.8,
        T1 + 8.8,
        cz + 1.8,
        { tint: LIME_D },
      );
      b.cyl("patina", cx, T1 + 8.8, cz, 1.4, 0.05, 4.2, 8, {
        tint: [0.85, 0.95, 0.9],
      });
      b.geo("gold", K.sphereGeo(), {
        x: cx,
        y: T1 + 13.1,
        z: cz,
        s: 0.22,
        tint: [0.8, 0.62, 0.3],
      });
    }
    // ================= CENTRAL TOWER, colonnaded drum, cupola, CIVIC FAME =================
    const CX = ACX,
      CZ = TCZ;
    b.boxMM("limestone", CX - 8, T1, CZ - 8, CX + 8, T1 + 8, CZ + 8, {
      tint: LIME,
    });
    for (const [nx, nz] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ])
      for (const t of [-4, 0, 4])
        K.archWin(
          b,
          CX + nx * 8 + (nz ? t : 0),
          T1 + 1.5,
          CZ + nz * 8 + (nx ? t : 0),
          nx,
          nz,
          1.8,
          5.0,
          {
            state: "dark",
            surround: "limestone",
            surroundTint: LIME_D,
            sill: false,
            inset: 0.15,
          },
        );
    b.boxMM(
      "limestone",
      CX - 8.6,
      T1 + 8,
      CZ - 8.6,
      CX + 8.6,
      T1 + 8.8,
      CZ + 8.6,
      { tint: LIME_D },
    );
    for (const [ux, uz] of [
      [-7.6, -7.6],
      [7.6, -7.6],
      [-7.6, 7.6],
      [7.6, 7.6],
    ])
      K.urn(b, CX + ux, T1 + 8.8, CZ + uz, 1.6, { tint: LIME_D });
    const D0 = T1 + 8.8,
      DR = 5.4;
    b.cyl("limestone", CX, D0, CZ, DR + 1.4, DR + 1.4, 0.6, 24, {
      tint: LIME_D,
    });
    b.cyl("paint_black", CX, D0 + 0.6, CZ, DR - 0.6, DR - 0.6, 7.2, 16, {
      tint: [0.1, 0.1, 0.09],
    });
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * PI * 2;
      K.column(
        b,
        CX + Math.cos(a) * DR,
        D0 + 0.6,
        CZ + Math.sin(a) * DR,
        7.2,
        0.3,
        { tint: LIME, capTint: LIME_D, plinth: false, seg: 8 },
      );
    }
    b.cyl("limestone", CX, D0 + 7.8, CZ, DR + 0.8, DR + 0.8, 1.0, 24, {
      tint: LIME_D,
    });
    b.cyl("limestone", CX, D0 + 8.8, CZ, DR + 1.0, DR + 0.4, 0.4, 24, {
      tint: LIME,
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      K.urn(
        b,
        CX + Math.cos(a) * (DR + 0.5),
        D0 + 9.2,
        CZ + Math.sin(a) * (DR + 0.5),
        0.9,
        { tint: LIME_D },
      );
    }
    const C0 = D0 + 9.2;
    b.cyl("limestone", CX, C0, CZ, DR - 1.0, DR - 1.2, 1.8, 20, { tint: LIME });
    K.dome(b, CX, C0 + 1.8, CZ, DR - 1.1, 3.2, {
      mat: "patina",
      ribs: 12,
      ribMat: "gold",
      ribTint: [0.7, 0.55, 0.3],
      seg: 24,
      rows: 8,
    });
    const L0 = C0 + 4.8;
    b.cyl("limestone", CX, L0, CZ, 1.5, 1.5, 0.4, 12, { tint: LIME_D });
    b.cyl("paint_black", CX, L0 + 0.4, CZ, 0.9, 0.9, 1.8, 10, {
      tint: [0.08, 0.08, 0.08],
    });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * PI * 2;
      b.cyl(
        "gold",
        CX + Math.cos(a) * 1.15,
        L0 + 0.4,
        CZ + Math.sin(a) * 1.15,
        0.08,
        0.08,
        1.8,
        5,
        { tint: [0.75, 0.58, 0.28] },
      );
    }
    b.cyl("gold", CX, L0 + 2.2, CZ, 1.4, 0.9, 0.9, 12, {
      tint: [0.7, 0.55, 0.28],
    });
    civicFame(b, CX, L0 + 3.1, CZ);
    b.col(TX0, S1, TZ0, TX1, T1, TZ1, { tag: "building" });
    b.col(CX - 8, T1, CZ - 8, CX + 8, D0 + 9, CZ + 8, { tag: "building" });

    // ================= Ruin dressing: the brute barricade in the arch =================
    // stacked filing cabinets & car bodies across the passage (gap in the middle), cages, burning drums
    for (const [x0, x1] of [
      [AX0 + 0.1, ACX - 1.6],
      [ACX + 1.6, AX1 - 0.1],
    ]) {
      const z = 612.5;
      for (let x = x0; x < x1 - 0.4; x += 0.55)
        for (let k = 0; k < 3 + (((x * 7) | 0) % 2); k++)
          b.box(
            "metal",
            x + 0.27,
            0.06 + k * 1.3,
            z + (r() - 0.5) * 0.3,
            0.5,
            1.28,
            0.7,
            {
              yaw: (r() - 0.5) * 0.3,
              tint: r.pick([
                [0.42, 0.46, 0.4],
                [0.5, 0.5, 0.46],
                [0.36, 0.4, 0.44],
              ]),
            },
          );
      b.col(x0, 0, z - 0.45, x1, 3.2, z + 0.45, { tag: "barricade" });
      b.beam("rust", x0, 3.6, z, x1, 3.2, z + 0.1, 0.12, 0.12);
      for (let x = x0 + 0.3; x < x1; x += 0.9)
        b.beam(
          "rust",
          x,
          3.1,
          z,
          x + 0.1,
          4.2 + r() * 0.8,
          z - 0.3,
          0.05,
          0.05,
        ); // spikes
    }
    b.plate(
      "decal",
      ACX - 3.2,
      2.6,
      613.0,
      0,
      1,
      2.8,
      1.1,
      K.tag("NO PAPERS NO ENTRY", "#e03030", 512, 128),
    );
    b.plate(
      "decal",
      ACX + 3.4,
      2.2,
      613.0,
      0,
      1,
      2.6,
      1.0,
      K.tag("FILL FORM IN BLOOD", "#e8d040", 512, 128),
    );
    b.plate(
      "decal",
      X0 + 6,
      3.6,
      ZC + 0.03,
      0,
      1,
      3.4,
      1.2,
      K.tag("HUMANS = FORM 27B", "#e03030", 512, 128),
    );
    for (const [x, z] of [
      [ACX - 2.8, 607],
      [ACX + 2.6, 596],
    ]) {
      b.pipe("black_iron", x, ASP + AR - 0.4, z, x, 6.2, z, 0.02, 3);
      b.cyl("black_iron", x, 3.9, z, 0.55, 0.55, 2.2, 8, {
        top: false,
        tint: [0.3, 0.28, 0.26],
      });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * PI * 2;
        b.beam(
          "black_iron",
          x + Math.cos(a) * 0.55,
          3.9,
          z + Math.sin(a) * 0.55,
          x + Math.cos(a) * 0.55,
          6.1,
          z + Math.sin(a) * 0.55,
          0.03,
          0.03,
        );
      }
      b.cyl("black_iron", x, 6.1, z, 0.6, 0.1, 0.3, 8);
    }
    for (let k = 0; k < 10; k++)
      b.hplate(
        "decal",
        AX0 + 1 + r() * 9,
        0.075 + k * 0.001,
        590 + r() * 26,
        1.2 + r(),
        1.2 + r(),
        r() * 6,
        K.decal(k % 3 ? "scorch" : "blood", k + 80),
      );
    K.litter(b, AX0 + 0.5, 589, AX1 - 0.5, 616, 0.06, 40, 81);
    for (let k = 0; k < 30; k++)
      b.hplate(
        "flat",
        AX0 + 1 + r() * 9,
        0.08 + k * 0.0006,
        594 + r() * 18,
        0.3,
        0.22,
        r() * 6,
        null,
        { tint: [0.78, 0.74, 0.62] },
      );
    b.burn(ACX, 3, 612.5, 5, 0.6);
    b.burn(ACX, 11, ZS, 7, 0.4);
    for (let k = 0; k < 8; k++)
      b.burn(
        X0 + r() * (X1 - X0),
        20 + r() * 40,
        r() < 0.5 ? ZS : ZN,
        4 + r() * 6,
        0.35,
      );
    // meat hooks under the colonnade
    for (let x = X0 + 5; x < AX0 - 3; x += 5.5) {
      b.pipe("black_iron", x, B1 - 2.2, ZS - 3, x, B1 - 4.2, ZS - 3, 0.015, 3);
      b.geo("meat", K.sphereGeo(), {
        x,
        y: B1 - 4.7,
        z: ZS - 3,
        sx: 0.28,
        sy: 0.55,
        sz: 0.24,
        tint: [0.45, 0.2, 0.15],
      });
    }

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_municipal_ext";
    K.anchor(ctx, "arch_s", ACX, 0.06, ZS + 1.5, false);
    K.anchor(ctx, "arch_n", ACX, 0.06, ZN - 1.5, false);
    K.anchor(ctx, "arch_guard", ACX + 0.6, 0.06, 609, false);
    // mq01 (main story): the Chambers Street watchers. Brother Taper stands on the far sidewalk, east of the arch, watching
    // the doors; Rose's warning shot comes from the roofline across the street; her spent casing lands by the south kerb.
    K.anchor(ctx, "chambers_watch", ACX + 15, 0.06, ZS + 13.2, false);
    K.anchor(ctx, "chambers_shot", ACX - 12, 18, ZS + 24, false);
    K.anchor(ctx, "chambers_casing", ACX - 9.5, 0.06, ZS + 12.8, false);
    K.loot(ctx, "barrel", ACX - 1.2, 0.06, 610.8, 0, {
      world: true,
      burning: true,
      container: false,
    });
    K.loot(ctx, "barrel", ACX + 1.3, 0.06, 614.2, 0, {
      world: true,
      burning: true,
      container: false,
    });
    K.loot(ctx, "car", AX0 - 3.5, 0.12, 619.8, 0.12, {
      world: true,
      kind: "bus",
      wreck: true,
      burnt: true,
    });
    K.loot(ctx, "car", X1 - 5, 0.12, 585.4, PI - 0.2, {
      world: true,
      kind: "coupe",
      wreck: true,
    });
    K.loot(ctx, "sandbags", ACX - 3.6, 0.06, 616.8, 0, {
      world: true,
      curved: true,
    });
    K.skel(ctx, ACX - 3.8, 0.06, 601, 1.9, "lying", { world: true });
    K.skel(ctx, ACX + 3.9, 0.06, 590.5, 0.3, "reaching", { world: true });
  }

  /** Civic Fame: gilded copper figure (~7.5 m) with a turreted crown, laurel branch raised, shield at her side. */
  function civicFame(b, x, y, z) {
    const gold = [0.82, 0.62, 0.3],
      dark = [0.6, 0.45, 0.22];
    b.cyl("gold", x, y, z, 0.9, 0.9, 0.6, 10, { tint: dark }); // globe-ish pedestal
    b.geo("gold", K.sphereGeo(), {
      x,
      y: y + 0.9,
      z,
      sx: 1.0,
      sy: 0.5,
      sz: 1.0,
      tint: dark,
    });
    b.cyl("gold", x, y + 1.2, z, 0.95, 0.42, 3.2, 12, { tint: gold }); // robe
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * PI * 2;
      b.beam(
        "gold",
        x + Math.cos(a) * 0.85,
        y + 1.3,
        z + Math.sin(a) * 0.85,
        x + Math.cos(a) * 0.4,
        y + 4.2,
        z + Math.sin(a) * 0.4,
        0.12,
        0.1,
        { tint: dark },
      );
    } // folds
    b.cyl("gold", x, y + 4.4, z, 0.42, 0.48, 1.3, 10, { tint: gold }); // torso
    b.geo("gold", K.sphereGeo(), {
      x,
      y: y + 6.0,
      z,
      sx: 0.28,
      sy: 0.34,
      sz: 0.3,
      tint: gold,
    }); // head
    b.cyl("gold", x, y + 6.3, z, 0.34, 0.36, 0.28, 10, { tint: dark }); // mural crown
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * PI * 2;
      b.box(
        "gold",
        x + Math.cos(a) * 0.3,
        y + 6.58,
        z + Math.sin(a) * 0.3,
        0.12,
        0.2,
        0.12,
        { tint: dark },
      );
    }
    // right arm raised with the laurel branch, left arm down to the shield
    b.pipe("gold", x + 0.4, y + 5.4, z, x + 0.75, y + 6.6, z + 0.1, 0.1, 6, {
      tint: gold,
    });
    b.pipe(
      "gold",
      x + 0.75,
      y + 6.6,
      z + 0.1,
      x + 0.8,
      y + 7.5,
      z + 0.15,
      0.08,
      6,
      { tint: gold },
    );
    for (let k = 0; k < 6; k++)
      b.geo("gold", K.sphereGeo(), {
        x: x + 0.8 + (k % 2 ? 0.12 : -0.1),
        y: y + 7.5 + k * 0.12,
        z: z + 0.15,
        sx: 0.12,
        sy: 0.05,
        sz: 0.06,
        rz: k % 2 ? 0.6 : -0.6,
        tint: dark,
      });
    b.pipe("gold", x - 0.4, y + 5.4, z, x - 0.7, y + 4.3, z + 0.2, 0.09, 6, {
      tint: gold,
    });
    b.geo("gold", new THREE.CylinderGeometry(0.55, 0.55, 0.08, 14), {
      x: x - 0.85,
      y: y + 3.6,
      z: z + 0.35,
      rz: HP,
      ry: 0.3,
      tint: dark,
    });
    b.glow(x, y + 4, z, [0.9, 0.7, 0.35], 1.5);
  }

  /**
   * Distant proxy (drawn beyond def.detail): same silhouette, flat textured faces, ~2 k tris and a handful
   * of draw calls instead of ~110 k tris / ~30 calls. Shares the slab texture so the swap is quiet.
   */
  function farProxy(ctx) {
    const b = K.builder({
      name: "mb_far",
      grime: 0.4,
      seg: 60,
      shadows: false,
    });
    const wall = (mat, ax, az, ux, uz, len, y0, y1, tint) =>
      b.face(mat, ax, y0, az, ux, 0, uz, 0, 1, 0, len, y1 - y0, {
        tint,
        seg: 60,
      });
    const ring4 = (mat, x0, z0, x1, z1, y0, y1, tint) => {
      wall(mat, x1, z0, -1, 0, x1 - x0, y0, y1, tint);
      wall(mat, x0, z1, 1, 0, x1 - x0, y0, y1, tint);
      wall(mat, x0, z0, 0, 1, z1 - z0, y0, y1, tint);
      wall(mat, x1, z1, 0, -1, z1 - z0, y0, y1, tint);
    };
    // base (with the arch as a dark slot through it and the colonnade recess on Chambers St)
    wall("ashlar", AX0, ZN, -1, 0, AX0 - X0, 0, B1, GRAN);
    wall("ashlar", X1, ZN, -1, 0, X1 - AX1, 0, B1, GRAN);
    wall("ashlar", AX1, ZN, -1, 0, AX1 - AX0, ASP + AR, B1, GRAN);
    wall("ashlar", X0, ZN, 0, 1, ZS - ZN, 0, B1, GRAN);
    wall("ashlar", X1, ZS, 0, -1, ZS - ZN, 0, B1, GRAN);
    wall("ashlar", X0, ZC, 1, 0, AX0 - X0, 0, B1, [0.4, 0.39, 0.37]);
    wall("ashlar", AX1, ZC, 1, 0, X1 - AX1, 0, B1, [0.4, 0.39, 0.37]);
    wall("ashlar", AX0, ZS, 1, 0, AX1 - AX0, ASP + AR, B1, GRAN);
    wall(
      "paint_black",
      AX1,
      ZN + 0.6,
      -1,
      0,
      AX1 - AX0,
      0,
      ASP + AR,
      [0.06, 0.06, 0.06],
    ); // the passage reads as a dark slot
    wall(
      "paint_black",
      AX0,
      ZS - 0.6,
      1,
      0,
      AX1 - AX0,
      0,
      ASP + AR,
      [0.06, 0.06, 0.06],
    );
    for (const [a0, a1] of [
      [X0 + 2, AX0 - 2.2],
      [AX1 + 2.2, X1 - 2],
    ]) {
      const n = Math.round((a1 - a0) / 3.3);
      for (let k = 0; k <= n; k++)
        b.cyl(
          "limestone",
          a0 + 0.9 + (k * (a1 - a0 - 1.8)) / n,
          0.9,
          ZS - 1.6,
          0.62,
          0.62,
          B1 - 3.1,
          6,
          { tint: LIME, top: false, rows: 1 },
        );
    }
    b.boxMM("limestone", X0 - 0.4, B1 - 2.2, ZN - 0.4, X1 + 0.4, B1, ZS + 0.6, {
      tint: LIME_D,
      faces: "nsewb",
      seg: 60,
    });
    // slab (C plan) — flat muni_bays faces
    const sl = (ax, az, ux, uz, len) =>
      wall("muni_bays", ax, az, ux, uz, len, B1, S1, [0.9, 0.88, 0.83]);
    sl(CX0, ZN, -1, 0, CX0 - X0);
    sl(X1, ZN, -1, 0, X1 - CX1);
    sl(CX1, CZ1, -1, 0, CX1 - CX0);
    sl(CX0, CZ1, 0, -1, CZ1 - ZN);
    sl(CX1, ZN, 0, 1, CZ1 - ZN);
    sl(X0, ZS, 1, 0, X1 - X0);
    sl(X0, ZN, 0, 1, ZS - ZN);
    sl(X1, ZS, 0, -1, ZS - ZN);
    for (const [x0, z0, x1, z1] of [
      [X0, ZN, CX0, ZS],
      [CX1, ZN, X1, ZS],
      [CX0, CZ1, CX1, ZS],
    ]) {
      b.boxMM(
        "limestone",
        x0 - 0.9,
        S1 - 0.8,
        z0 - 0.9,
        x1 + 0.9,
        S1,
        z1 + 0.9,
        { tint: LIME_D, faces: "nsewtb", seg: 60 },
      );
      b.boxMM(
        "limestone",
        x0 - 0.5,
        S1,
        z0 - 0.5,
        x1 + 0.5,
        S1 + 1.1,
        z1 + 0.5,
        { tint: LIME, faces: "nsew", seg: 60 },
      );
    }
    b.face(
      "concrete_dark",
      CX0,
      B1 + 0.02,
      CZ1,
      1,
      0,
      0,
      0,
      0,
      -1,
      CX1 - CX0,
      CZ1 - ZN,
      { uv: "top", tint: [0.36, 0.35, 0.33], seg: 60 },
    );
    // tier, lanterns, tower, cupola, Civic Fame
    ring4("muni_bays", TX0, TZ0, TX1, TZ1, S1, T1, [0.88, 0.86, 0.81]);
    b.boxMM(
      "limestone",
      TX0 - 0.7,
      T1 - 0.6,
      TZ0 - 0.7,
      TX1 + 0.7,
      T1,
      TZ1 + 0.7,
      { tint: LIME_D, faces: "nsewt", seg: 60 },
    );
    for (const [cx, cz] of [
      [TX0 + 2, TZ0 + 2],
      [TX1 - 2, TZ0 + 2],
      [TX0 + 2, TZ1 - 2],
      [TX1 - 2, TZ1 - 2],
    ]) {
      b.boxMM(
        "limestone",
        cx - 1.9,
        T1,
        cz - 1.9,
        cx + 1.9,
        T1 + 8.8,
        cz + 1.9,
        { tint: LIME, faces: "nsewt" },
      );
      b.cyl("patina", cx, T1 + 8.8, cz, 1.4, 0.05, 4.2, 6, {
        tint: [0.85, 0.95, 0.9],
        rows: 1,
      });
    }
    const CX = ACX,
      CZ = TCZ,
      D0 = T1 + 8.8,
      DR = 5.4,
      C0 = D0 + 9.2,
      L0 = C0 + 4.8;
    b.boxMM("limestone", CX - 8, T1, CZ - 8, CX + 8, D0, CZ + 8, {
      tint: LIME,
      faces: "nsewt",
    });
    b.cyl("paint_black", CX, D0, CZ, DR - 0.5, DR - 0.5, 8.2, 10, {
      tint: [0.14, 0.14, 0.13],
      rows: 1,
      top: false,
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      b.cyl(
        "limestone",
        CX + Math.cos(a) * DR,
        D0,
        CZ + Math.sin(a) * DR,
        0.34,
        0.34,
        7.8,
        4,
        { tint: LIME, rows: 1, top: false },
      );
    }
    b.cyl("limestone", CX, D0 + 7.8, CZ, DR + 0.9, DR + 0.9, 1.4, 12, {
      tint: LIME_D,
      rows: 1,
    });
    b.cyl("limestone", CX, C0, CZ, DR - 1.0, DR - 1.2, 1.8, 10, {
      tint: LIME,
      rows: 1,
      top: false,
    });
    K.dome(b, CX, C0 + 1.8, CZ, DR - 1.1, 3.2, {
      mat: "patina",
      seg: 12,
      rows: 4,
    });
    b.cyl("paint_black", CX, L0, CZ, 1.1, 1.0, 2.2, 6, {
      tint: [0.1, 0.1, 0.09],
      rows: 1,
    });
    b.cyl("gold", CX, L0 + 2.2, CZ, 1.4, 0.9, 0.9, 8, {
      tint: [0.7, 0.55, 0.28],
      rows: 1,
    });
    b.cyl("gold", CX, L0 + 3.1, CZ, 0.9, 0.42, 4.4, 8, {
      tint: [0.82, 0.62, 0.3],
      rows: 1,
    });
    b.geo("gold", K.sphereGeo(), {
      x: CX,
      y: L0 + 9.1,
      z: CZ,
      sx: 0.3,
      sy: 0.38,
      sz: 0.3,
      tint: [0.82, 0.62, 0.3],
    });
    b.cyl("gold", CX, L0 + 7.5, CZ, 0.36, 0.36, 1.7, 5, {
      tint: [0.82, 0.62, 0.3],
      rows: 1,
    });
    b.glow(CX, L0 + 5, CZ, [0.9, 0.7, 0.35], 1.5);
    return b.finish(null);
  }

  PC.define({
    id: "municipal_building",
    name: "Manhattan Municipal Building",
    interior: "municipal_building",
    order: 20,
    lod: 1500,
    detail: 300,
  });
  PC.part("municipal_building", { ext: exterior, far: farProxy });
})();
