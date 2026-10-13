// play-inline-346 02 — fillstyle
// Lines 27-369 of readable/play-inline-346.pretty.js (statement-aligned).
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

