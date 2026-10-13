/* src/poi_eastvillage/30_tammany.js */
/* =====================================================================
 * NEW RAD CITY — poi_eastvillage / 30_tammany.js
 * TAMMANY HALL (44 Union Square East, 1929) — raider political machine.
 *
 * EXTERIOR (site x 210..270, z 272..303): neo-Georgian block in red
 *   Flemish-bond brick on a rusticated limestone base; the colossal
 *   columned portico facing Union Square (west) with TAMMANY HALL on the
 *   frieze and a pediment; tall 12-pane sash windows; balustrade; steep
 *   hipped slate roof with dormers and chimneys. Raider "Braves" have
 *   hung the Tammany Tiger and RE-ELECT BOSS CROKE banners, built a scrap
 *   barricade and a searchlight; a coal-chute hatch on 14th Street.
 * INTERIOR (cell tammany_hall): lobby → the Wigwam (double-height meeting
 *   hall with horseshoe galleries, rostrum, the tally board: CROKE 4,211 /
 *   OPPONENT 0) → west wing (ward office, patronage office, west stair) →
 *   east wing (grand stair, the Tiger Club) → 2nd floor (Sachems' council
 *   room, archive, the secretary, BOSS CROKE's office overlooking the hall)
 *   → cellar (the ledger strongroom, holding cells for "uncooperative voters",
 *   the ballot-printing room, the coal room with the chute to the street).
 * Quest: "Honest Graft" (from Deck at O'Rourke's) — speech, bribe,
 *   blackmail (the Black Book), betrayal or bullets.
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

  const X0 = 212,
    X1 = 268,
    Z0 = 274,
    Z1 = 301;
  const BASE = 5,
    ENT = 15.5,
    BAL = 17,
    ROOF = 17.6,
    RIDGE = 23.4;
  const PZ0 = 280,
    PZ1 = 295,
    PX = 209.4; // west portico
  const DOOR_Z = 287.5;
  const CHUTE = { x: 263, z: 302.2 };
  // interior levels
  const U2 = 5.0,
    CY = -4.0,
    GH = 4.7;
  const VAULT = { x: -18, z: -24 };

  // ==================================================================
  // ART
  // ==================================================================
  function tigerCell() {
    return K.paint("art", "tam_tiger", 512, 512, function (x, X, Y, W, H) {
      x.fillStyle = "#1a1410";
      x.fillRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H * 0.54;
      x.fillStyle = "#d8701c";
      x.beginPath();
      x.ellipse(cx, cy, W * 0.38, H * 0.36, 0, 0, 6.3);
      x.fill();
      for (const s of [-1, 1]) {
        x.beginPath();
        x.moveTo(cx + s * W * 0.3, cy - H * 0.22);
        x.lineTo(cx + s * W * 0.4, cy - H * 0.45);
        x.lineTo(cx + s * W * 0.17, cy - H * 0.32);
        x.fill();
      }
      x.fillStyle = "#f0e0c0";
      x.beginPath();
      x.ellipse(cx, cy + H * 0.12, W * 0.2, H * 0.16, 0, 0, 6.3);
      x.fill();
      x.strokeStyle = "#140c08";
      x.lineWidth = 12;
      for (const s of [-1, 1])
        for (let k = 0; k < 3; k++) {
          x.beginPath();
          x.moveTo(cx + s * W * (0.36 - k * 0.02), cy - H * 0.1 + k * H * 0.09);
          x.lineTo(
            cx + s * W * (0.22 - k * 0.02),
            cy - H * 0.06 + k * H * 0.08,
          );
          x.stroke();
        }
      for (let k = 0; k < 3; k++) {
        x.beginPath();
        x.moveTo(cx - W * 0.06 + k * W * 0.06, cy - H * 0.33);
        x.lineTo(cx - W * 0.03 + k * W * 0.03, cy - H * 0.18);
        x.stroke();
      }
      x.fillStyle = "#e8d020";
      for (const s of [-1, 1]) {
        x.beginPath();
        x.ellipse(
          cx + s * W * 0.12,
          cy - H * 0.05,
          W * 0.06,
          H * 0.035,
          s * 0.2,
          0,
          6.3,
        );
        x.fill();
        x.fillStyle = "#100a06";
        x.beginPath();
        x.ellipse(
          cx + s * W * 0.12,
          cy - H * 0.05,
          W * 0.015,
          H * 0.03,
          0,
          0,
          6.3,
        );
        x.fill();
        x.fillStyle = "#e8d020";
      }
      x.fillStyle = "#100a06";
      x.beginPath();
      x.moveTo(cx - W * 0.05, cy + H * 0.05);
      x.lineTo(cx + W * 0.05, cy + H * 0.05);
      x.lineTo(cx, cy + H * 0.1);
      x.fill();
      x.fillStyle = "#7a1010";
      x.beginPath();
      x.ellipse(cx, cy + H * 0.2, W * 0.1, H * 0.06, 0, 0, PI);
      x.fill();
      x.fillStyle = "#f8f0e0";
      for (const s of [-1, 1]) {
        x.beginPath();
        x.moveTo(cx + s * W * 0.07, cy + H * 0.19);
        x.lineTo(cx + s * W * 0.05, cy + H * 0.27);
        x.lineTo(cx + s * W * 0.03, cy + H * 0.19);
        x.fill();
      }
      x.fillStyle = "#e8dcb8";
      x.font = "bold 44px Georgia, serif";
      x.textAlign = "center";
      x.fillText("TAMMANY", cx, Y + 56);
      x.font = "bold 30px Arial Black, sans-serif";
      x.fillStyle = "#d02020";
      x.fillText("BRAVES", cx, Y + H - 22);
      K.stains(x, X, Y, W, H, 16, 11, 0.5, [20, 12, 8]);
      K.streaks(x, X, Y, W, H, 20, 12, 0.35);
    });
  }
  function voteBanner(key, l1, l2) {
    return K.paint("art", key, 768, 192, function (x, X, Y, W, H) {
      x.fillStyle = "#e8e0cc";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#8a1a14";
      x.fillRect(X, Y, W, H * 0.16);
      x.fillRect(X, Y + H * 0.84, W, H * 0.16);
      x.fillStyle = "#1e2e52";
      for (let k = 0; k < 9; k++) {
        x.beginPath();
        x.arc(X + 40 + k * 86, Y + H * 0.08, 7, 0, 6.3);
        x.fill();
      }
      x.fillStyle = "#1e2e52";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.font = "bold 62px Georgia, serif";
      x.fillText(l1, X + W / 2, Y + H * 0.42, W * 0.94);
      x.fillStyle = "#8a1a14";
      x.font = "italic bold 30px Georgia, serif";
      x.fillText(l2, X + W / 2, Y + H * 0.7, W * 0.9);
      K.stains(x, X, Y, W, H, 14, 21, 0.5, [40, 30, 15]);
      K.streaks(x, X, Y, W, H, 16, 22, 0.4);
    });
  }
  function tallyBoard() {
    return K.paint("art", "tam_tally", 512, 320, function (x, X, Y, W, H) {
      x.fillStyle = "#23302a";
      x.fillRect(X, Y, W, H);
      x.fillStyle = "#e8e8dc";
      x.font = "bold 34px Georgia, serif";
      x.textAlign = "center";
      x.fillText("FOURTH WARD — RESULTS", X + W / 2, Y + 44);
      x.font = 'bold 30px "Courier New", monospace';
      x.textAlign = "left";
      x.fillText("CROKE ........ 4,211", X + 40, Y + 120);
      x.fillText("OPPONENT ........  0", X + 40, Y + 170);
      x.fillText("TURNOUT ....... 312%", X + 40, Y + 220);
      x.font = "italic 22px Georgia, serif";
      x.fillText('"The people have spoken." — the Boss', X + 40, Y + 280);
      K.stains(x, X, Y, W, H, 8, 31, 0.3, [200, 200, 190]);
    });
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  function exterior(ctx) {
    const b = K.builder({ name: "tam_ext", grime: 0.55 });
    const r = K.rng("tam_ext");
    const brick = [1.0, 0.9, 0.86],
      lime = [0.9, 0.86, 0.78],
      limeD = [0.78, 0.74, 0.66];
    const W = X1 - X0,
      D = Z1 - Z0;
    // --- body: rusticated limestone base + brick upper storeys ---
    const faces = [
      [X0, Z1, 1, 0, 0, W, 0, 1],
      [X1, Z1, 0, 0, -1, D, 1, 0],
      [X0, Z0, 0, 0, 1, D, -1, 0],
      [X1, Z0, -1, 0, 0, W, 0, -1],
    ];
    for (const [ox, oz, ux, uy, uz, len] of faces) {
      b.face("limestone", ox, 0, oz, ux, uy, uz, 0, 1, 0, len, BASE, {
        tint: lime,
      });
      b.face("flemish", ox, BASE, oz, ux, uy, uz, 0, 1, 0, len, ENT - BASE, {
        tint: brick,
      });
    }
    b.col(X0, 0, Z0, X1, BAL + 0.8, Z1, { tag: "building" });
    // rustication grooves on the base + water table
    for (const [ox, oz, ux, uz, len, nx, nz] of faces.map((f) => [
      f[0],
      f[1],
      f[2],
      f[4],
      f[5],
      f[6],
      f[7],
    ])) {
      for (let yy = 0.9; yy < BASE - 0.2; yy += 0.75)
        b.boxMM(
          "paint_black",
          Math.min(ox, ox + ux * len) - (nx < 0 ? 0.02 : 0),
          yy,
          Math.min(oz, oz + uz * len) - (nz < 0 ? 0.02 : 0),
          Math.max(ox, ox + ux * len) + (nx > 0 ? 0.02 : 0),
          yy + 0.05,
          Math.max(oz, oz + uz * len) + (nz > 0 ? 0.02 : 0),
          {
            tint: [0.35, 0.33, 0.3],
            faces: nx > 0 ? "e" : nx < 0 ? "w" : nz > 0 ? "s" : "n",
          },
        );
    }
    b.boxMM(
      "limestone",
      X0 - 0.25,
      BASE - 0.1,
      Z0 - 0.25,
      X1 + 0.25,
      BASE + 0.35,
      Z1 + 0.25,
      { tint: limeD, faces: "nsewt" },
    );
    b.boxMM("granite", X0 - 0.2, 0, Z0 - 0.2, X1 + 0.2, 0.7, Z1 + 0.2, {
      tint: [0.5, 0.48, 0.45],
      faces: "nsew",
    });
    // entablature (architrave + frieze + cornice), balustrade
    b.boxMM(
      "limestone",
      X0 - 0.15,
      ENT,
      Z0 - 0.15,
      X1 + 0.15,
      ENT + 1.1,
      Z1 + 0.15,
      { tint: lime, faces: "nsew" },
    );
    K.cornice(b, X0, Z1, X1, Z1, ENT + 1.1, 0, 1, {
      mat: "limestone",
      tint: lime,
      depth: 0.7,
      h: 0.6,
      brackets: 0.9,
    });
    K.cornice(b, X1, Z1, X1, Z0, ENT + 1.1, 1, 0, {
      mat: "limestone",
      tint: lime,
      depth: 0.7,
      h: 0.6,
      brackets: 0.9,
    });
    K.cornice(b, X0, Z0, X0, Z1, ENT + 1.1, -1, 0, {
      mat: "limestone",
      tint: lime,
      depth: 0.7,
      h: 0.6,
      brackets: 0.9,
    });
    K.cornice(b, X1, Z0, X0, Z0, ENT + 1.1, 0, -1, {
      mat: "limestone",
      tint: limeD,
      depth: 0.5,
      h: 0.6,
      brackets: 0,
    });
    const balus = (ax, az, bx, bz) => {
      const len = Math.hypot(bx - ax, bz - az),
        n = Math.floor(len / 0.32);
      b.beam("limestone", ax, BAL + 0.08, az, bx, BAL + 0.08, bz, 0.4, 0.16, {
        tint: lime,
      });
      b.beam("limestone", ax, BAL + 0.95, az, bx, BAL + 0.95, bz, 0.45, 0.14, {
        tint: lime,
      });
      for (let i = 0; i <= n; i++) {
        const t = i / n,
          x = ax + (bx - ax) * t,
          z = az + (bz - az) * t;
        if (i % 12 === 0)
          b.box("limestone", x, BAL, z, 0.45, 1.0, 0.45, { tint: lime });
        else {
          b.cyl("limestone", x, BAL + 0.16, z, 0.07, 0.11, 0.35, 6, {
            tint: lime,
          });
          b.cyl("limestone", x, BAL + 0.51, z, 0.11, 0.07, 0.36, 6, {
            tint: lime,
          });
        }
      }
    };
    b.boxMM("concrete_dark", X0, BAL - 0.4, Z0, X1, BAL, Z1, {
      tint: [0.4, 0.38, 0.36],
      faces: "t",
    });
    balus(X0 + 0.1, Z1 - 0.1, X1 - 12, Z1 - 0.1);
    balus(X1 - 0.1, Z1 - 0.1, X1 - 0.1, Z0 + 8);
    balus(X0 + 0.1, Z0 + 0.1, X0 + 0.1, Z1 - 0.1);
    balus(X0 + 0.1, Z0 + 0.1, X1 - 0.1, Z0 + 0.1);
    // --- the steep hipped slate roof, dormers, chimneys ---
    const e0x = X0 + 1.2,
      e1x = X1 - 1.2,
      e0z = Z0 + 1.2,
      e1z = Z1 - 1.2,
      hz = (e0z + e1z) / 2,
      rise = RIDGE - ROOF;
    const run = (e1z - e0z) / 2,
      r0x = e0x + run,
      r1x = e1x - run;
    b.quadN(
      "slate",
      [e0x, ROOF, e1z],
      [e1x, ROOF, e1z],
      [r1x, RIDGE, hz],
      [r0x, RIDGE, hz],
      [0, 0.6, 0.8],
      { tint: [0.8, 0.82, 0.86] },
    );
    b.quadN(
      "slate",
      [e1x, ROOF, e0z],
      [e0x, ROOF, e0z],
      [r0x, RIDGE, hz],
      [r1x, RIDGE, hz],
      [0, 0.6, -0.8],
      { tint: [0.75, 0.77, 0.8] },
    );
    b.quadN(
      "slate",
      [e0x, ROOF, e0z],
      [e0x, ROOF, e1z],
      [r0x, RIDGE, hz],
      [r0x, RIDGE, hz],
      [-0.8, 0.6, 0],
      { tint: [0.78, 0.8, 0.84] },
    );
    b.quadN(
      "slate",
      [e1x, ROOF, e1z],
      [e1x, ROOF, e0z],
      [r1x, RIDGE, hz],
      [r1x, RIDGE, hz],
      [0.8, 0.6, 0],
      { tint: [0.78, 0.8, 0.84] },
    );
    b.beam("copper", r0x, RIDGE + 0.05, hz, r1x, RIDGE + 0.05, hz, 0.25, 0.18, {
      tint: [0.35, 0.58, 0.48],
    });
    for (const [ax, az] of [
      [e0x, e0z],
      [e0x, e1z],
      [e1x, e0z],
      [e1x, e1z],
    ])
      b.beam(
        "copper",
        ax,
        ROOF,
        az,
        ax < 240 ? r0x : r1x,
        RIDGE,
        hz,
        0.2,
        0.15,
        { tint: [0.35, 0.58, 0.48] },
      );
    b.col(e0x, ROOF - 0.6, e0z, e1x, ROOF + 2.5, e1z, { tag: "roof" });
    const slopeY = (dz) => ROOF + rise * (1 - dz / run); // height at distance dz from the ridge line
    for (const dx of [222, 232, 248, 258])
      for (const side of [1, -1]) {
        const fz = side > 0 ? e1z - 1.4 : e0z + 1.4; // dormer front
        const y0 = slopeY(Math.abs(fz - hz)) - 0.2,
          bz = fz - side * 2.6;
        b.boxMM(
          "paint_white",
          dx - 0.95,
          y0,
          Math.min(fz, bz),
          dx + 0.95,
          y0 + 1.9,
          Math.max(fz, bz),
          { tint: [0.75, 0.72, 0.66], faces: side > 0 ? "sewt" : "newt" },
        );
        K.sash(b, dx, y0 + 0.3, fz, 0, side, 0.9, 1.2, {
          state: r() < 0.5 ? "dark" : "broken",
          cols: 2,
          rows: 2,
          surround: "paint_white",
          surroundTint: [0.8, 0.78, 0.72],
          lintel: 0.1,
        });
        b.quadN(
          "slate",
          [dx - 1.1, y0 + 1.9, fz + side * 0.1],
          [dx, y0 + 2.6, fz + side * 0.1],
          [dx, y0 + 2.6, bz],
          [dx - 1.1, y0 + 1.9, bz],
          [-0.6, 0.8, 0],
          { tint: [0.7, 0.72, 0.76] },
        );
        b.quadN(
          "slate",
          [dx + 1.1, y0 + 1.9, fz + side * 0.1],
          [dx, y0 + 2.6, fz + side * 0.1],
          [dx, y0 + 2.6, bz],
          [dx + 1.1, y0 + 1.9, bz],
          [0.6, 0.8, 0],
          { tint: [0.7, 0.72, 0.76] },
        );
        b.quadN(
          "paint_white",
          [dx - 0.95, y0 + 1.9, fz],
          [dx + 0.95, y0 + 1.9, fz],
          [dx, y0 + 2.55, fz],
          [dx, y0 + 2.55, fz],
          [0, 0, side],
          { tint: [0.75, 0.72, 0.66] },
        );
      }
    for (const [cx, cz] of [
      [228, 279.5],
      [252, 279.5],
      [228, 295.5],
      [252, 295.5],
    ]) {
      b.boxMM(
        "flemish",
        cx - 0.8,
        ROOF,
        cz - 0.5,
        cx + 0.8,
        RIDGE + 1.6,
        cz + 0.5,
        { tint: brick },
      );
      b.boxMM(
        "limestone",
        cx - 0.9,
        RIDGE + 1.6,
        cz - 0.6,
        cx + 0.9,
        RIDGE + 1.8,
        cz + 0.6,
        { tint: lime },
      );
      for (const s of [-0.4, 0.4])
        b.cyl("rust", cx + s, RIDGE + 1.8, cz, 0.12, 0.12, 0.5, 6);
    }
    // collapsed north-east roof corner
    b.quadN(
      "paint_black",
      [e1x - 9, ROOF + 0.3, e0z + 0.5],
      [e1x - 1, ROOF + 0.3, e0z + 0.5],
      [e1x - 3, ROOF + 2.4, e0z + 5],
      [e1x - 8, ROOF + 2.6, e0z + 5],
      [0, 0.6, -0.8],
      { tint: [0.04, 0.04, 0.04] },
    );
    for (let k = 0; k < 5; k++)
      b.beam(
        "rust",
        e1x - 8.5 + k * 1.7,
        ROOF + 0.2,
        e0z + 0.4,
        e1x - 8 + k * 1.5,
        ROOF + 2.2 + r(),
        e0z + 4.5,
        0.15,
        0.22,
      );
    b.burn(X1 - 5, RIDGE - 3, Z0 + 3, 6, 0.8);

    // --- south façade (14th Street): 11 bays, central pavilion with pilasters ---
    const NB = 11,
      BW = W / NB;
    for (let k = 0; k < NB; k++) {
      const x = X0 + BW * (k + 0.5);
      K.archWin(b, x, 1.1, Z1, 0, 1, 1.8, 3.2, {
        state: r() < 0.4 ? "boarded" : "dark",
        surround: "limestone",
        surroundTint: lime,
        fw: 0.2,
        keystone: true,
      });
      K.sash(b, x, BASE + 1.0, Z1, 0, 1, 1.7, 3.6, {
        state: r() < 0.25 ? "broken" : r() < 0.6 ? "dark" : "boarded",
        cols: 3,
        rows: 4,
        lintel: 0.4,
      });
      K.sash(b, x, BASE + 6.3, Z1, 0, 1, 1.5, 2.5, {
        state: r() < 0.3 ? "broken" : "dark",
        cols: 3,
        rows: 3,
        lintel: 0.3,
      });
      // stone balconette under the tall windows
      if (k >= 4 && k <= 6) {
        b.boxMM(
          "limestone",
          x - 1.1,
          BASE + 0.75,
          Z1,
          x + 1.1,
          BASE + 0.9,
          Z1 + 0.5,
          { tint: lime },
        );
        for (let i = 0; i < 7; i++)
          b.cyl(
            "limestone",
            x - 0.9 + i * 0.3,
            BASE + 0.9,
            Z1 + 0.4,
            0.05,
            0.05,
            0.5,
            5,
            { tint: lime },
          );
        b.beam(
          "limestone",
          x - 1.1,
          BASE + 1.45,
          Z1 + 0.4,
          x + 1.1,
          BASE + 1.45,
          Z1 + 0.4,
          0.12,
          0.1,
          { tint: lime },
        );
      }
    }
    for (const px of [X0 + BW * 4, X0 + BW * 7, X0 + 0.5, X1 - 0.5])
      K.pilaster(b, px, BASE + 0.35, Z1, 0, 1, 0.8, ENT - BASE - 0.35, {
        mat: "limestone",
        tint: lime,
        depth: 0.25,
      });
    K.letters(
      b,
      (X0 + X1) / 2,
      ENT + 0.55,
      Z1 + 0.16,
      0,
      1,
      26,
      0.8,
      "SOCIETY OF TAMMANY · COLUMBIAN ORDER · MDCCLXXXIX",
      { fg: "#5a5248", size: 0.62, shadow: false },
    );
    // coal chute hatch on the sidewalk (east end)
    b.boxMM(
      "metal_dark",
      CHUTE.x - 0.8,
      0.01,
      Z1 + 0.3,
      CHUTE.x + 0.8,
      0.9,
      Z1 + 1.4,
      { tint: [0.3, 0.28, 0.26], faces: "sewt" },
    );
    b.quad(
      "rust",
      [CHUTE.x - 0.8, 0.9, Z1 + 1.4],
      [CHUTE.x + 0.8, 0.9, Z1 + 1.4],
      [CHUTE.x + 0.8, 0.95, Z1 + 0.3],
      [CHUTE.x - 0.8, 0.95, Z1 + 0.3],
      {},
    );
    b.plate(
      "decal",
      CHUTE.x,
      1.6,
      Z1 + 0.02,
      0,
      1,
      1.8,
      0.6,
      K.tag("COAL", "#e8e8e0", 192, 72, { rot: 0 }),
    );
    b.col(CHUTE.x - 0.8, 0, Z1, CHUTE.x + 0.8, 0.95, Z1 + 1.4, {});
    // --- north & east façades (plainer) ---
    for (let k = 0; k < NB; k++) {
      const x = X0 + BW * (k + 0.5);
      K.sash(b, x, BASE + 1.0, Z0, 0, -1, 1.7, 3.6, {
        state: r() < 0.5 ? "boarded" : "dark",
        cols: 3,
        rows: 4,
      });
      K.sash(b, x, BASE + 6.3, Z0, 0, -1, 1.5, 2.5, {
        state: "dark",
        cols: 3,
        rows: 3,
      });
      K.archWin(b, x, 1.1, Z0, 0, -1, 1.6, 3.0, {
        state: "boarded",
        surround: "limestone",
        surroundTint: lime,
        fw: 0.18,
      });
    }
    for (let k = 0; k < 5; k++) {
      const z = Z0 + (D / 5) * (k + 0.5);
      K.sash(b, X1, BASE + 1.0, z, 1, 0, 1.7, 3.6, {
        state: r() < 0.4 ? "broken" : "dark",
        cols: 3,
        rows: 4,
      });
      K.sash(b, X1, BASE + 6.3, z, 1, 0, 1.5, 2.5, {
        state: "dark",
        cols: 3,
        rows: 3,
      });
      K.archWin(b, X1, 1.1, z, 1, 0, 1.6, 3.0, {
        state: "boarded",
        surround: "limestone",
        surroundTint: lime,
        fw: 0.18,
      });
    }

    // --- WEST FAÇADE & THE PORTICO (Union Square) ---
    // side bays of the west front
    for (const z of [276.5, 298.5]) {
      K.sash(b, X0, BASE + 1.0, z, -1, 0, 1.7, 3.6, {
        state: "dark",
        cols: 3,
        rows: 4,
        lintel: 0.4,
      });
      K.sash(b, X0, BASE + 6.3, z, -1, 0, 1.5, 2.5, {
        state: "broken",
        cols: 3,
        rows: 3,
      });
      K.archWin(b, X0, 1.1, z, -1, 0, 1.8, 3.2, {
        state: "boarded",
        surround: "limestone",
        surroundTint: lime,
        fw: 0.2,
      });
    }
    // behind the columns: three arched doorways, three tall windows, three square windows
    for (const z of [283.5, DOOR_Z, 291.5]) {
      K.archWin(b, X0, 0.9, z, -1, 0, 2.2, 3.8, {
        state: z === DOOR_Z ? "lit" : "dark",
        paneTint: z === DOOR_Z ? [0.55, 0.3, 0.12] : undefined,
        surround: "limestone",
        surroundTint: lime,
        fw: 0.28,
        mullion: z !== DOOR_Z,
      });
      K.sash(b, X0, BASE + 1.0, z, -1, 0, 1.9, 4.0, {
        state: r() < 0.5 ? "dark" : "broken",
        cols: 3,
        rows: 4,
        lintel: 0.45,
      });
      K.sash(b, X0, BASE + 6.6, z, -1, 0, 1.6, 2.3, {
        state: "dark",
        cols: 3,
        rows: 3,
      });
    }
    // the door itself: studded double doors, raider-reinforced
    b.boxMM(
      "wood_dark",
      X0 - 0.12,
      0.9,
      DOOR_Z - 1.0,
      X0 - 0.02,
      3.6,
      DOOR_Z + 1.0,
      { tint: [0.28, 0.16, 0.1] },
    );
    for (let k = 0; k < 4; k++)
      b.boxMM(
        "rust",
        X0 - 0.16,
        1.2 + k * 0.7,
        DOOR_Z - 1.05,
        X0 - 0.12,
        1.35 + k * 0.7,
        DOOR_Z + 1.05,
        {},
      );
    // podium, steps, four colossal Ionic columns, entablature, pediment
    b.boxMM("limestone", PX - 0.4, 0, PZ0, X0, 0.9, PZ1, { tint: limeD });
    for (let i = 0; i < 4; i++)
      b.boxMM(
        "granite",
        PX - 0.4 - (i + 1) * 0.42,
        0,
        PZ0 + 1 + i * 0.1,
        PX - 0.4 - i * 0.42,
        0.9 - i * 0.225,
        PZ1 - 1 - i * 0.1,
        { tint: [0.6, 0.58, 0.54] },
      );
    b.col(PX - 0.4, 0, PZ0, X0, 0.9, PZ1, { tag: "steps" });
    for (let i = 0; i < 4; i++)
      b.col(
        PX - 0.4 - (i + 1) * 0.42,
        0,
        PZ0 + 1,
        PX - 0.4 - i * 0.42,
        0.9 - i * 0.225,
        PZ1 - 1,
        { tag: "steps" },
      );
    const colZ = [281.4, 285.8, 289.2, 293.6];
    for (const z of colZ) {
      K.column(b, PX + 0.55, 0.9, z, 0.55, ENT - 0.9, {
        kind: "ionic",
        mat: "limestone",
        tint: lime,
      });
      b.col(PX, 0.9, z - 0.6, PX + 1.1, ENT, z + 0.6, {
        tag: "column",
        walkable: false,
      });
    }
    for (const z of [PZ0 + 0.1, PZ1 - 0.1])
      K.pilaster(b, X0, 0.9, z, -1, 0, 1.0, ENT - 0.9, {
        mat: "limestone",
        tint: lime,
        depth: 0.3,
      });
    b.boxMM("limestone", PX - 0.2, ENT, PZ0, X0, ENT + 1.2, PZ1, {
      tint: lime,
    });
    b.boxMM("limestone", PX - 0.2, ENT - 0.1, PZ0, X0, ENT, PZ1, {
      tint: limeD,
      faces: "b",
    });
    K.letters(
      b,
      PX - 0.21,
      ENT + 0.6,
      (PZ0 + PZ1) / 2,
      -1,
      0,
      12.5,
      0.95,
      "TAMMANY HALL",
      { fg: "#3a342c", size: 0.78, shadow: false, weather: true },
    );
    K.cornice(b, PX - 0.2, PZ1, PX - 0.2, PZ0, ENT + 1.2, -1, 0, {
      mat: "limestone",
      tint: lime,
      depth: 0.6,
      h: 0.5,
      brackets: 0.8,
    });
    // pediment (with the Braves' tiger painted in the tympanum)
    const PY = ENT + 1.7,
      PT = PY + 3.0;
    b.quadN(
      "limestone",
      [PX - 0.3, PY, PZ0 - 0.2],
      [PX - 0.3, PY, PZ1 + 0.2],
      [PX - 0.3, PT, (PZ0 + PZ1) / 2],
      [PX - 0.3, PT, (PZ0 + PZ1) / 2],
      [-1, 0, 0],
      { tint: lime },
    );
    b.quadN(
      "art",
      [PX - 0.35, PY + 0.2, 285.5],
      [PX - 0.35, PY + 0.2, 289.5],
      [PX - 0.35, PY + 2.6, 289.5],
      [PX - 0.35, PY + 2.6, 285.5],
      [-1, 0, 0],
      { rect: tigerCell(), tint: [0.9, 0.9, 0.9], grime: 0.2 },
    );
    b.beam(
      "limestone",
      PX - 0.5,
      PY + 0.05,
      PZ0 - 0.4,
      PX - 0.5,
      PT + 0.05,
      (PZ0 + PZ1) / 2,
      0.3,
      0.4,
      { tint: lime },
    );
    b.beam(
      "limestone",
      PX - 0.5,
      PY + 0.05,
      PZ1 + 0.4,
      PX - 0.5,
      PT + 0.05,
      (PZ0 + PZ1) / 2,
      0.3,
      0.4,
      { tint: lime },
    );
    b.quadN(
      "slate",
      [PX - 0.3, PY, PZ0 - 0.2],
      [PX - 0.3, PT, (PZ0 + PZ1) / 2],
      [X0 + 1.5, PT, (PZ0 + PZ1) / 2],
      [X0 + 1.5, PY, PZ0 - 0.2],
      [0, 0.9, -0.4],
      { tint: [0.7, 0.72, 0.76] },
    );
    b.quadN(
      "slate",
      [PX - 0.3, PT, (PZ0 + PZ1) / 2],
      [PX - 0.3, PY, PZ1 + 0.2],
      [X0 + 1.5, PY, PZ1 + 0.2],
      [X0 + 1.5, PT, (PZ0 + PZ1) / 2],
      [0, 0.9, 0.4],
      { tint: [0.7, 0.72, 0.76] },
    );
    K.letters(b, X0, 3.9 + 0.9, DOOR_Z, -1, 0, 1.9, 0.3, "44", {
      fg: "#d8c890",
      size: 0.8,
    });

    // --- raider dressing: banners, bunting, tiger, barricade, searchlight ---
    const ban1 = voteBanner(
      "tam_ban1",
      "RE-ELECT BOSS CROKE",
      "HE GETS THINGS DONE — 19 TERMS & COUNTING",
    );
    const ban2 = voteBanner(
      "tam_ban2",
      "VOTE EARLY · VOTE OFTEN",
      "the Fourth Ward thanks you for your support",
    );
    // banner between the middle columns
    b.quadN(
      "art",
      [PX + 0.2, 7.0, colZ[1] + 0.5],
      [PX + 0.2, 7.0, colZ[2] - 0.5],
      [PX + 0.2, 13.2, colZ[2] - 0.5],
      [PX + 0.2, 13.2, colZ[1] + 0.5],
      [-1, 0, 0],
      { rect: tigerCell(), tint: [0.9, 0.9, 0.9], grime: 0.2 },
    );
    b.quadN(
      "art",
      [X0 - 0.05, 12.2, 297.5],
      [X0 - 0.05, 12.2, 301.2],
      [X0 - 0.05, 13.4, 301.2],
      [X0 - 0.05, 13.4, 297.5],
      [-1, 0, 0],
      { rect: ban2, tint: [0.85, 0.85, 0.85] },
    );
    b.quadN(
      "art",
      [X0 + 16, 12.0, Z1 + 0.25],
      [X0 + 30, 12.0, Z1 + 0.25],
      [X0 + 30, 15.3, Z1 + 0.25],
      [X0 + 16, 15.3, Z1 + 0.25],
      [0, 0, 1],
      { rect: ban1, tint: [0.9, 0.9, 0.9] },
    );
    for (const bx of [X0 + 16, X0 + 30])
      b.pipe("rust", bx, 12, Z1 + 0.3, bx, 15.3, Z1 + 0.3, 0.03, 4);
    // tattered bunting swags along the south balustrade
    for (let k = 0; k < 10; k++) {
      const xa = X0 + 3 + k * 5,
        xb = xa + 5,
        cols = [
          [0.6, 0.15, 0.12],
          [0.85, 0.82, 0.74],
          [0.16, 0.22, 0.4],
        ];
      for (let s = 0; s < 3; s++) {
        const y = BAL - 0.3 - s * 0.25;
        b.quadN(
          "fabric",
          [xa, y, Z1 + 0.45],
          [xb, y, Z1 + 0.45],
          [xb - 1.2, y - 0.7, Z1 + 0.5],
          [xa + 1.2, y - 0.7, Z1 + 0.5],
          [0, 0, 1],
          { tint: cols[s], grime: 0.3 },
        );
      }
    }
    // graffiti
    b.plate(
      "decal",
      X0 + 8,
      2.0,
      Z1 + 0.03,
      0,
      1,
      5,
      1.2,
      K.tag("BRAVES TURF", "#e04030", 384, 96),
    );
    b.plate(
      "decal",
      X0 + 36,
      2.3,
      Z1 + 0.03,
      0,
      1,
      5.5,
      1.1,
      K.tag("VOTE EARLY VOTE OFTEN", "#f0e040", 512, 96, { rot: 0.03 }),
    );
    b.plate(
      "decal",
      X0 - 0.03,
      2.6,
      277,
      -1,
      0,
      3.5,
      1.0,
      K.tag("NO VOTE NO LIFE", "#e8e8e0", 384, 96),
    );
    // scrap barricade across the portico steps, with a gate gap at the door
    for (let z = PZ0 - 4; z < PZ1 + 4; z += 1.5) {
      if (Math.abs(z + 0.75 - DOOR_Z) < 1.8) continue;
      const h = 1.8 + r() * 0.8;
      b.box(
        r() < 0.5 ? "corrugated" : "rust",
        205.2,
        0,
        z + 0.75,
        0.12,
        h,
        1.55,
        {
          yaw: (r() - 0.5) * 0.1,
          tint: r.pick([
            [0.65, 0.55, 0.45],
            [0.5, 0.45, 0.4],
            [0.6, 0.3, 0.22],
          ]),
        },
      );
      if (r() < 0.4) {
        b.pipe("rust", 205.2, h, z + 0.75, 205.1, h + 0.9, z + 0.8, 0.03, 4);
        b.geo("bone", K.sphereGeo(), {
          x: 205.1,
          y: h + 0.95,
          z: z + 0.8,
          sx: 0.12,
          sy: 0.14,
          sz: 0.13,
          tint: [0.85, 0.8, 0.66],
        });
      }
    }
    b.col(205.0, 0, PZ0 - 4, 205.4, 2.2, DOOR_Z - 1.8, { walkable: false });
    b.col(205.0, 0, DOOR_Z + 1.8, 205.4, 2.2, PZ1 + 4, { walkable: false });
    for (const pz of [DOOR_Z - 1.8, DOOR_Z + 1.8])
      b.pipe("rust", 205.2, 0, pz, 205.2, 3.2, pz, 0.08, 6);
    b.beam(
      "rust",
      205.2,
      3.1,
      DOOR_Z - 1.8,
      205.2,
      3.1,
      DOOR_Z + 1.8,
      0.12,
      0.12,
    );
    b.plate(
      "art",
      205.1,
      3.6,
      DOOR_Z,
      -1,
      0,
      3.2,
      0.7,
      K.signCell("tam_gate", "THE WIGWAM — CONSTITUENTS ONLY", 512, 110, {
        bg: "#1a1410",
        fg: "#d8701c",
        font: "Arial Black, sans-serif",
        border: "#d8701c",
      }),
    );
    // the searchlight on the south-west balustrade corner
    b.cyl("metal_dark", X0 + 1.5, BAL + 1.0, Z1 - 1.5, 0.35, 0.35, 0.5, 8);
    b.geo("metal", K.unitCyl(12), {
      x: X0 + 1.2,
      y: BAL + 1.9,
      z: Z1 - 1.2,
      sx: 0.55,
      sy: 0.8,
      sz: 0.55,
      rx: 1.1,
      ry: -0.8,
      tint: [0.4, 0.42, 0.4],
    });
    b.glow(X0 + 0.9, BAL + 2.1, Z1 - 0.8, [1, 0.95, 0.8], 3.5);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_tammany_ext";
    K.anchor(ctx, "door", X0 - 2.6, 0.9, DOOR_Z, false);
    K.loot(ctx, "barrel", 206.6, 0, DOOR_Z - 3.5, 0, {
      world: true,
      burning: true,
    });
    K.loot(ctx, "barrel", 206.6, 0, DOOR_Z + 3.5, 0, {
      world: true,
      burning: true,
    });
    K.loot(ctx, "sandbags", 207.2, 0, PZ0 - 2, HP, { world: true });
    K.loot(ctx, "sandbags", 207.2, 0, PZ1 + 2, HP, { world: true });
    K.loot(ctx, "crate", X0 + 20, 0, Z1 + 1.2, 0.2, {
      world: true,
      kind: "plain",
      loot: "raider_stash",
      name: "Ballot Box (stuffed)",
    });
    K.skel(ctx, 207.8, 0, DOOR_Z + 6.5, 1.3, "lying", { world: true });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "tam_int",
      off: O,
      lit: true,
      amb: [0.1, 0.085, 0.07],
      floors: [0, U2, CY, 1.2],
      grime: 0.55,
    });
    const r = K.rng("tam_int");
    const warm = [1, 0.75, 0.45],
      fire = [1, 0.5, 0.2],
      cream = [0.9, 0.84, 0.7],
      panel = [0.4, 0.24, 0.14];
    const HALL = [-14.1, -0.3, -37.1, 14.1, 10, -8.9];

    // ---------------------------------------------- gaps
    K.gap(ctx, 0, 0, 2.2, 0, 3.2); // front doors
    K.gap(ctx, 0, -9, 3.2, 0, 3.4); // lobby → the Wigwam
    K.gap(ctx, -14, -4.5, 1.8, 0, 2.7); // lobby ↔ ward office
    K.gap(ctx, 14, -4.5, 1.8, 0, 2.7); // lobby ↔ grand stair
    K.gap(ctx, -19, -12, 1.4, 0, 2.4); // ward office ↔ patronage office
    K.gap(ctx, -19, -24, 1.4, 0, 2.4); // patronage office ↔ records room (west door into the hall)
    K.gap(ctx, -14, -30, 1.6, 0, 2.6); // records room ↔ hall
    K.gap(ctx, 17, -12, 1.6, 0, 2.6); // grand stair ↔ Tiger Club
    K.gap(ctx, 14, -24, 1.8, 0, 2.7); // Tiger Club ↔ hall
    K.gap(ctx, 14, -11, 1.4, U2, 2.4); // upstairs landing ↔ east gallery
    K.gap(ctx, 14, -30, 1.4, U2, 2.4); // Boss's office ↔ east gallery ("the Boss's box")
    K.gap(ctx, -14, -16, 1.4, U2, 2.4); // west gallery ↔ council room
    K.gap(ctx, 17, -12, 1.4, U2, 2.4); // upstairs landing ↔ secretary (different storey from the ground gap on this line)
    K.gap(ctx, 19, -24, 1.4, U2, 2.4); // secretary ↔ Boss's office
    K.gap(ctx, -19, -20, 1.4, U2, 2.4); // council room ↔ archive
    K.gap(ctx, 14, -31.5, 1.6, CY, 2.4); // coal room ↔ ballot room
    K.gap(ctx, 0, -26, 1.6, CY, 2.4); // ballot room ↔ cells
    K.gap(ctx, -14, -18, 1.6, CY, 2.4); // cells ↔ west stair foot
    K.gap(ctx, VAULT.x, VAULT.z, 1.6, CY, 2.3, { casing: false }); // west stair foot ↔ VAULT

    // ================================================= LOBBY
    const LB = [-14.1, -0.3, -9.1, 14.1, GH, 0.1];
    K.room(b, ctx, {
      x0: -14,
      z0: -9,
      x1: 14,
      z1: 0,
      y: 0,
      h: GH,
      floor: "marble",
      fc: [0.82, 0.8, 0.76],
      wall: "plaster",
      wc: cream,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.3,
      ceil: "tin",
      cc: [0.6, 0.55, 0.46],
      cornice: true,
    });
    for (const cx of [-8, -4, 4, 8]) {
      K.column(b, cx, 0, -4.5, 0.3, GH, {
        kind: "doric",
        mat: "marble",
        tint: [0.78, 0.76, 0.72],
      });
      b.col(cx - 0.35, 0, -4.85, cx + 0.35, GH, -4.15, {});
    }
    b.hplate(
      "art",
      0,
      0.012,
      -4.5,
      3.6,
      3.6,
      0,
      K.paint("art", "tam_seal", 384, 384, function (x, X, Y, Wd, Hd) {
        x.fillStyle = "#b8ae98";
        x.fillRect(X, Y, Wd, Hd);
        const cx = X + Wd / 2,
          cy = Y + Hd / 2;
        x.fillStyle = "#1e2e52";
        x.beginPath();
        x.arc(cx, cy, Wd * 0.46, 0, 6.3);
        x.fill();
        x.fillStyle = "#c8a050";
        x.beginPath();
        x.arc(cx, cy, Wd * 0.4, 0, 6.3);
        x.fill();
        x.fillStyle = "#1e2e52";
        x.font = "bold 34px Georgia, serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("SOCIETY OF", cx, cy - 60);
        x.fillText("TAMMANY", cx, cy - 18);
        x.font = "bold 26px Georgia, serif";
        x.fillText("1789", cx, cy + 30);
        x.font = "italic 20px Georgia, serif";
        x.fillText('"Honest Graft"', cx, cy + 70);
        K.stains(x, X, Y, Wd, Hd, 16, 41, 0.5, [50, 40, 25]);
      }),
    );
    // coat check counter, portraits of the Grand Sachems, the raider barricade of ballot boxes
    b.boxMM("mahogany", 9.5, 0, -8.8, 13.9, 1.1, -7.6, {
      tint: [0.45, 0.22, 0.14],
    });
    b.col(9.5, 0, -8.8, 13.9, 1.1, -7.6, {});
    b.plate(
      "art",
      11.7,
      2.6,
      -8.86,
      0,
      1,
      1.8,
      0.4,
      K.signCell("tam_coat", "COAT CHECK", 256, 56, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    for (let k = 0; k < 6; k++) {
      const x = -11.5 + k * 4.6;
      if (Math.abs(x) < 2) continue;
      K.framed(
        b,
        x,
        2.9,
        -8.88,
        0,
        1,
        0.9,
        1.15,
        K.painting(2 + (k % 4) * 8, 128, 160),
        { frame: "gold" },
      );
    }
    for (let k = 0; k < 14; k++)
      b.box(
        "wood",
        -3 + (k % 7) * 0.9 + r() * 0.2,
        Math.floor(k / 7) * 0.55,
        -1.8 + (r() - 0.5) * 0.3,
        0.6,
        0.55,
        0.45,
        { yaw: (r() - 0.5) * 0.3, tint: [0.62, 0.5, 0.34] },
      );
    b.col(-3.4, 0, -2.2, 3.4, 1.1, -1.4, {});
    b.plate(
      "decal",
      0,
      0.8,
      -1.35,
      0,
      1,
      3.4,
      0.6,
      K.tag("BALLOT BOX WALL", "#f0e040", 384, 72),
    );
    // a voting booth with its last voter
    b.boxMM("metal", -12.6, 0, -3.2, -11.2, 2.2, -1.6, {
      tint: [0.5, 0.52, 0.5],
      faces: "nwet",
    });
    b.quad(
      "cloth_red",
      [-12.55, 0.4, -1.6],
      [-11.25, 0.4, -1.6],
      [-11.25, 2.1, -1.6],
      [-12.55, 2.1, -1.6],
      { tint: [0.5, 0.18, 0.14] },
    );
    b.col(-12.6, 0, -3.2, -11.2, 2.2, -2.9, {});
    K.skel(ctx, -11.9, 0, -2.5, 0, "lying");
    K.note(ctx, "pev_note_tam_ballot", -11.6, 0.02, -2.1, {
      name: "Unmarked Ballot",
      title: "Fourth Ward — Official Ballot (1967)",
      text: 'FOR ALDERMAN, FOURTH WARD (vote for one):\n\n[X] A. CROKE (Tammany)\n[ ] (no other candidates)\n\nThe X was pre-printed.\n\nIn pencil, in the margin: "I came in here to write in my own name. Took me forty minutes to find the booth. The sirens started while I was still looking for a pencil. Figures."',
    });
    for (const lx of [-8, 8])
      K.lamp(b, lx, 3.9, -2, "globe", warm, 0.7, 8, {
        ceil: GH,
        size: 0.16,
        glowSize: 0.7,
        lightOpts: { box: LB },
      });
    b.light(0, 2.2, -1, fire, 0.8, 6, { box: LB });
    K.litter(b, -13.5, -8.5, 13.5, -0.5, 0, 24, 601);

    // ================================================= THE WIGWAM (meeting hall)
    K.room(b, ctx, {
      x0: -14,
      z0: -37,
      x1: 14,
      z1: -9,
      y: 0,
      h: 10,
      floor: "parquet",
      fc: [0.62, 0.5, 0.38],
      wall: "plaster",
      wc: [0.86, 0.8, 0.66],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.4,
      ceil: "tin",
      cc: [0.62, 0.56, 0.46],
      cornice: true,
      surface: "wood",
    });
    // galleries (horseshoe at y = U2) on slender columns
    const galY = U2;
    b.boxMM("wood_dark", -14, galY - 0.35, -34, -10.5, galY, -9, {
      tint: panel,
      faces: "nsewtb",
    });
    b.boxMM("wood_dark", 10.5, galY - 0.35, -34, 14, galY, -9, {
      tint: panel,
      faces: "nsewtb",
    });
    b.boxMM("wood_dark", -10.5, galY - 0.35, -12.5, 10.5, galY, -9, {
      tint: panel,
      faces: "nsewtb",
    });
    b.face("carpet", -14, galY + 0.005, -9, 1, 0, 0, 0, 0, -1, 3.5, 25, {
      uv: "top",
      tint: [0.6, 0.3, 0.26],
    });
    b.face("carpet", 10.5, galY + 0.005, -9, 1, 0, 0, 0, 0, -1, 3.5, 25, {
      uv: "top",
      tint: [0.6, 0.3, 0.26],
    });
    b.face("carpet", -10.5, galY + 0.005, -9, 1, 0, 0, 0, 0, -1, 21, 3.5, {
      uv: "top",
      tint: [0.6, 0.3, 0.26],
    });
    b.col(-14, galY - 0.35, -34, -10.5, galY, -9, {
      tag: "floor",
      surface: "carpet",
    });
    b.col(10.5, galY - 0.35, -34, 14, galY, -9, {
      tag: "floor",
      surface: "carpet",
    });
    b.col(-10.5, galY - 0.35, -12.5, 10.5, galY, -9, {
      tag: "floor",
      surface: "carpet",
    });
    // gallery fronts: panelled parapet + brass rail
    const gf = (ax, az, bx, bz) => {
      b.boxMM(
        "wood_dark",
        Math.min(ax, bx) - 0.06,
        galY - 0.6,
        Math.min(az, bz) - 0.06,
        Math.max(ax, bx) + 0.06,
        galY + 0.95,
        Math.max(az, bz) + 0.06,
        { tint: [0.45, 0.28, 0.17] },
      );
      b.beam("brass", ax, galY + 1.0, az, bx, galY + 1.0, bz, 0.08, 0.06);
      b.col(
        Math.min(ax, bx) - 0.08,
        galY,
        Math.min(az, bz) - 0.08,
        Math.max(ax, bx) + 0.08,
        galY + 1.05,
        Math.max(az, bz) + 0.08,
        { walkable: false },
      );
    };
    gf(-10.5, -34, -10.5, -12.5);
    gf(10.5, -34, 10.5, -12.5);
    gf(-10.5, -12.5, 10.5, -12.5);
    gf(-14, -34, -10.5, -34);
    gf(10.5, -34, 14, -34);
    for (let z = -32; z <= -14; z += 6)
      for (const x of [-10.8, 10.8]) {
        K.column(b, x, 0, z, 0.16, galY - 0.35, {
          kind: "iron",
          mat: "cast_iron",
          tint: [0.7, 0.62, 0.45],
          base: false,
        });
        b.col(x - 0.2, 0, z - 0.2, x + 0.2, galY, z + 0.2, {});
      }
    for (const x of [-6, 0, 6]) {
      K.column(b, x, 0, -12.8, 0.16, galY - 0.35, {
        kind: "iron",
        mat: "cast_iron",
        tint: [0.7, 0.62, 0.45],
        base: false,
      });
      b.col(x - 0.2, 0, -13, x + 0.2, galY, -12.6, {});
    }
    // gallery bunting & banners
    for (let k = 0; k < 7; k++) {
      const za = -33 + k * 3,
        zb = za + 3;
      for (const sx of [-1, 1])
        b.quadN(
          "fabric",
          [sx * 10.42, galY + 0.8, za],
          [sx * 10.42, galY + 0.8, zb],
          [sx * 10.46, galY - 0.1, zb - 0.9],
          [sx * 10.46, galY - 0.1, za + 0.9],
          [-sx, 0, 0],
          {
            tint:
              k % 3 === 0
                ? [0.6, 0.15, 0.12]
                : k % 3 === 1
                  ? [0.85, 0.82, 0.74]
                  : [0.16, 0.22, 0.4],
            grime: 0.3,
          },
        );
    }
    // the rostrum
    b.boxMM("wood_dark", -9, 0, -37, 9, 1.2, -31, {
      tint: panel,
      faces: "nsewt",
    });
    b.boxMM("parquet", -9, 1.2, -37, 9, 1.21, -31, {
      tint: [0.6, 0.48, 0.36],
      faces: "t",
    });
    b.col(-9, 0, -37, 9, 1.2, -31, { tag: "floor", surface: "wood" });
    K.stairs(b, -1.8, -31, 1.8, -29.2, 0, 1.2, "-z", {
      mat: "wood",
      tint: [0.5, 0.34, 0.22],
      rail: "both",
      railMat: "brass",
      handMat: "brass",
    });
    b.boxMM("mahogany", -0.8, 1.2, -33.3, 0.8, 2.4, -32.6, {
      tint: [0.45, 0.22, 0.14],
    });
    b.col(-0.8, 1.2, -33.3, 0.8, 2.4, -32.6, {});
    b.plate("art", 0, 1.9, -32.58, 0, 1, 1.0, 0.8, tigerCell());
    // giant tiger banner behind the rostrum, flanked by flags; the tally board
    b.quad(
      "art",
      [-4, 2.4, -36.85],
      [4, 2.4, -36.85],
      [4, 9.4, -36.85],
      [-4, 9.4, -36.85],
      { rect: tigerCell(), tint: [0.95, 0.95, 0.95] },
    );
    b.beam("brass", -4.3, 9.5, -36.8, 4.3, 9.5, -36.8, 0.06, 0.06);
    const fl = K.paint("art", "tam_flag", 256, 160, function (x, X, Y, Wd, Hd) {
      for (let i = 0; i < 13; i++) {
        x.fillStyle = i % 2 ? "#e8e0d0" : "#8a2a22";
        x.fillRect(X, Y + (i * Hd) / 13, Wd, Hd / 13 + 1);
      }
      x.fillStyle = "#1e2e52";
      x.fillRect(X, Y, Wd * 0.42, (Hd * 7) / 13);
      K.stains(x, X, Y, Wd, Hd, 8, 51, 0.5);
    });
    for (const s of [-1, 1]) {
      b.pipe("brass", s * 6.5, 1.2, -36, s * 6.5, 5.6, -36, 0.03, 5);
      b.quad(
        "fabric",
        [s * 6.5, 3.8, -36],
        [s * 6.5 - s * 1.8, 3.6, -35.9],
        [s * 6.5 - s * 1.8, 4.9, -35.9],
        [s * 6.5, 5.3, -36],
        { rect: fl, tint: [0.9, 0.88, 0.84] },
      );
    }
    b.boxMM("wood_dark", 5, 1.4, -36.95, 8.8, 3.9, -36.85, { tint: panel });
    b.plate("art", 6.9, 2.65, -36.84, 0, 1, 3.6, 2.3, tallyBoard());
    b.quad(
      "art",
      [-13.86, 6.4, -18],
      [-13.86, 6.4, -30],
      [-13.86, 8.4, -30],
      [-13.86, 8.4, -18],
      {
        rect: voteBanner(
          "tam_ban3",
          "BOSS CROKE FOR ALDERMAN",
          "the only name you need to know",
        ),
        tint: [0.85, 0.85, 0.85],
      },
    );
    b.quad(
      "art",
      [13.86, 6.4, -30],
      [13.86, 6.4, -18],
      [13.86, 8.4, -18],
      [13.86, 8.4, -30],
      {
        rect: voteBanner(
          "tam_ban4",
          "A VOTE FOR CROKE",
          "is a vote you already cast",
        ),
        tint: [0.85, 0.85, 0.85],
      },
    );
    // folding chairs in rows, many kicked over; a raider camp in the middle
    for (let row = 0; row < 8; row++)
      for (let i = 0; i < 12; i++) {
        const x = -8.8 + i * 1.6 + (i >= 6 ? 0.8 : 0),
          z = -28 + row * 1.9;
        if (Math.abs(x) < 3 && z > -20 && z < -14) continue;
        K.chair(b, x, 0, z, (r() - 0.5) * 0.4, {
          mat: "metal",
          seatMat: "wood",
          tint: [0.4, 0.4, 0.38],
          fallen: r() < 0.3,
        });
      }
    // the camp: burning barrel (prop), mattresses, a stolen voting machine used as a table
    b.boxMM("metal_dark", -1.2, 0, -18.4, 1.2, 1.0, -17.2, {
      tint: [0.3, 0.32, 0.3],
    });
    b.col(-1.2, 0, -18.4, 1.2, 1.0, -17.2, {});
    for (let k = 0; k < 10; k++)
      b.box(
        "flat",
        -1.1 + (k % 5) * 0.45,
        1.0,
        -18.2 + Math.floor(k / 5) * 0.5,
        0.35,
        0.02,
        0.3,
        { tint: [0.9, 0.88, 0.8] },
      );
    b.light(0, 1.6, -15.5, fire, 1.3, 9, { box: HALL });
    b.glow(0, 1.2, -15.5, [1, 0.5, 0.2], 2.4);
    // the fallen chandelier
    b.cyl("brass", -6, 0.1, -24, 1.5, 1.5, 0.08, 18, { top: false });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2;
      b.pipe(
        "brass",
        -6,
        1.4,
        -24,
        -6 + Math.cos(a) * 1.4,
        0.15,
        -24 + Math.sin(a) * 1.4,
        0.015,
        3,
      );
    }
    K.rubble(b, -6, 0, -24, 1.8, 0.5, { seed: 61 });
    b.pipe("black_iron", -6, 10, -24, -5.5, 7.5, -24.3, 0.02, 4);
    // lighting: the remaining chandelier, footlights on the rostrum, fire light
    b.pipe("black_iron", 4, 8.2, -22, 4, 10, -22, 0.02, 4);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2,
        x = 4 + Math.cos(a) * 1.3,
        z = -22 + Math.sin(a) * 1.3;
      b.pipe("brass", 4, 8.3, -22, x, 7.9, z, 0.012, 3);
      if (i % 4)
        b.geo("lamp", K.sphereGeo(), { x, y: 7.95, z, s: 0.06, tint: warm });
    }
    b.cyl("brass", 4, 7.85, -22, 1.35, 1.35, 0.06, 18, { top: false });
    b.light(4, 7.5, -22, warm, 0.9, 14, { box: HALL });
    b.glow(4, 7.9, -22, [0.8, 0.55, 0.3], 3.5);
    for (let k = 0; k < 7; k++) {
      const x = -7.5 + k * 2.5;
      b.geo("lamp", K.sphereGeo(), {
        x,
        y: 1.25,
        z: -31.1,
        s: 0.05,
        tint: k % 3 ? warm : [0.3, 0.3, 0.3],
      });
    }
    b.light(0, 2.5, -33, warm, 1.0, 7, { box: HALL });
    for (const sx of [-1, 1])
      for (const z of [-30, -20]) {
        b.light(sx * 12, galY + 2.5, z, warm, 0.5, 6, { box: HALL });
        b.glow(sx * 13.8, galY + 2.6, z, [0.7, 0.5, 0.3], 0.8);
        b.box("brass", sx * 13.85, galY + 2.4, z, 0.12, 0.3, 0.12, {});
      }
    K.litter(b, -13.5, -30, 13.5, -9.5, 0, 34, 602);
    for (let k = 0; k < 8; k++)
      b.hplate(
        "decal",
        -12 + r() * 24,
        0.012 + k * 0.0004,
        -30 + r() * 20,
        1.2,
        1.2,
        r() * 6,
        K.decal(k % 3 ? "grime" : "blood", 90 + k),
      );

    // ================================================= WEST WING (ground): ward office, patronage office, records room + west stair
    const WB = [-24.1, -0.3, -37.1, -13.9, GH, 0.1];
    K.room(b, ctx, {
      x0: -24,
      z0: -12,
      x1: -14,
      z1: 0,
      y: 0,
      h: GH,
      floor: "wood",
      fc: [0.55, 0.42, 0.3],
      wall: "wallpaper_green",
      wc: [0.7, 0.72, 0.58],
      wain: "wood_dark",
      wainC: panel,
      ceil: "tin",
      cc: [0.55, 0.5, 0.42],
      surface: "wood",
    });
    for (let k = 0; k < 3; k++) {
      const z = -2.5 - k * 3.4;
      const t = K.table(b, -21.5, 0, z, 1.6, 0.9, { mat: "wood_dark" });
      K.chair(b, -21.5, 0, z + 0.8, 0, { mat: "wood_dark", fallen: k === 1 });
      b.box("flat", -21.2, t, z, 0.3, 0.02, 0.4, { tint: [0.9, 0.88, 0.8] });
    }
    b.plate(
      "art",
      -14.12,
      3.0,
      -8,
      -1,
      0,
      3.4,
      0.6,
      K.signCell("tam_ward", "FOURTH WARD · SEE YOUR CAPTAIN", 512, 90, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    b.plate(
      "art",
      -23.88,
      2.2,
      -6,
      1,
      0,
      2.0,
      1.4,
      K.paint("art", "tam_wardmap", 256, 180, function (x, X, Y, Wd, Hd) {
        x.fillStyle = "#e8dcc0";
        x.fillRect(X, Y, Wd, Hd);
        x.strokeStyle = "#6a4a2a";
        x.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          x.beginPath();
          x.moveTo(X + 10 + i * 30, Y + 10);
          x.lineTo(X + 10 + i * 30, Y + Hd - 10);
          x.stroke();
        }
        for (let j = 0; j < 6; j++) {
          x.beginPath();
          x.moveTo(X + 10, Y + 10 + j * 30);
          x.lineTo(X + Wd - 10, Y + 10 + j * 30);
          x.stroke();
        }
        x.fillStyle = "rgba(160,30,20,0.6)";
        x.fillRect(X + 70, Y + 40, 120, 90);
        x.fillStyle = "#2a1a0a";
        x.font = "bold 16px Georgia";
        x.fillText("4th WARD — ALL CROKE", X + 40, Y + Hd - 12);
      }),
    );
    K.lamp(b, -19, 3.9, -6, "pendant", warm, 0.75, 7, {
      ceil: GH,
      shade: "paint_green",
      lightOpts: { box: WB },
    });
    K.loot(ctx, "file_cabinet", -23.5, 0, -11.2, HP, {
      loot: "file_cabinet",
      name: "Voter Rolls",
    });
    K.room(b, ctx, {
      x0: -24,
      z0: -24,
      x1: -14,
      z1: -12,
      y: 0,
      h: GH,
      noFloor: true,
      floor: "wood",
      wall: "wallpaper_green",
      wc: [0.68, 0.7, 0.56],
      wain: "wood_dark",
      wainC: panel,
      ceil: "tin",
      cc: [0.55, 0.5, 0.42],
      surface: "wood",
    });
    // patronage office floor with the west stair hole (x −24..−21, z −21.5..−13)
    b.face("wood", -21, 0, -12, 1, 0, 0, 0, 0, -1, 7, 12, {
      uv: "top",
      tint: [0.55, 0.42, 0.3],
    });
    b.face("wood", -24, 0, -21.5, 1, 0, 0, 0, 0, -1, 3, 2.5, {
      uv: "top",
      tint: [0.55, 0.42, 0.3],
    });
    b.face("wood", -24, 0, -12, 1, 0, 0, 0, 0, -1, 3, 1, {
      uv: "top",
      tint: [0.55, 0.42, 0.3],
    });
    b.col(-21, -0.3, -24, -14, 0, -12, { tag: "floor", surface: "wood" });
    b.col(-24, -0.3, -24, -21, 0, -21.5, { tag: "floor", surface: "wood" });
    b.col(-24, -0.3, -13, -21, 0, -12, { tag: "floor", surface: "wood" });
    K.railing(b, -21, -21.5, -21, -13, 0, {
      h: 1.0,
      mat: "black_iron",
      handMat: "mahogany",
    });
    K.railing(b, -24, -13, -21, -13, 0, {
      h: 1.0,
      mat: "black_iron",
      handMat: "mahogany",
    });
    K.stairs(b, -23.9, -21.5, -21.1, -13, CY, 0, "-z", {
      mat: "concrete",
      tint: [0.55, 0.52, 0.48],
      rail: "r",
      railMat: "black_iron",
      handMat: "mahogany",
    });
    const pdesk = K.table(b, -17.5, 0, -18, 2.4, 1.2, { mat: "mahogany" });
    K.chair(b, -17.5, 0, -18.9, PI, {
      mat: "leather",
      tint: [0.3, 0.18, 0.12],
    });
    for (let k = 0; k < 6; k++)
      b.box(
        "flat",
        -18.3 + k * 0.3,
        pdesk,
        -17.8 + (r() - 0.5) * 0.3,
        0.22,
        0.05 + r() * 0.1,
        0.3,
        { yaw: r() * 0.4, tint: [0.88, 0.85, 0.75] },
      );
    K.terminal(
      ctx,
      "pev_term_tam_patronage",
      -16.6,
      pdesk,
      -18.2,
      0,
      termPatronage(),
      "bare",
    );
    b.plate(
      "art",
      -14.12,
      3.0,
      -18,
      -1,
      0,
      3.4,
      0.6,
      K.signCell("tam_patronage", "PATRONAGE · JOBS · FAVORS", 512, 90, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, -17.5, 3.9, -18, "pendant", warm, 0.8, 7, {
      ceil: GH,
      shade: "paint_green",
      lightOpts: { box: WB },
    });
    K.skel(ctx, -15.4, 0, -22.8, 2.3, "seated");
    K.loot(ctx, "safe", -14.6, 0, -13, -HP, {
      wall: false,
      loot: "safe",
      name: "Patronage Safe",
      lock: K.regLock({
        id: "pev_lk_tam_patronage_safe",
        label: "Patronage Safe",
        kind: "safe",
        code: "1868",
        hint: "The patronage office teletype keeps the safe combination.",
      }),
    });
    K.room(b, ctx, {
      x0: -24,
      z0: -37,
      x1: -14,
      z1: -24,
      y: 0,
      h: GH,
      floor: "wood",
      fc: [0.5, 0.4, 0.3],
      wall: "plaster_stained",
      wc: [0.7, 0.62, 0.5],
      ceil: "plaster",
      cc: [0.5, 0.46, 0.4],
      surface: "wood",
    });
    for (let k = 0; k < 4; k++)
      K.shelf(b, -23.7, 0, -26 - k * 2.6, HP, 2.4, {
        mat: "metal",
        h: 2.4,
        items: ["box", "box", "book"],
        seed: 70 + k,
      });
    K.lamp(b, -19, 3.9, -31, "bulb", warm, 0.6, 7, {
      ceil: GH,
      lightOpts: { box: WB },
    });
    b.plate(
      "decal",
      -14.12,
      1.6,
      -34,
      -1,
      0,
      2.6,
      0.8,
      K.tag("BRAVES ONLY", "#e04030", 256, 96),
    );
    K.loot(ctx, "file_cabinet", -15, 0, -36.4, 0, {
      loot: "file_cabinet",
      name: "Election Records",
    });
    K.loot(ctx, "footlocker", -22, 0, -36.2, 0, {
      loot: "raider_stash",
      name: "Brave's Footlocker",
    });

    // ================================================= EAST WING (ground): grand stair hall, the Tiger Club
    const EB = [13.9, -0.3, -37.1, 24.1, GH, 0.1];
    K.room(b, ctx, {
      x0: 14,
      z0: -12,
      x1: 24,
      z1: 0,
      y: 0,
      h: GH,
      noCeil: true,
      floor: "marble",
      fc: [0.8, 0.78, 0.74],
      wall: "plaster",
      wc: cream,
      wain: "wood_dark",
      wainC: panel,
      ceil: "tin",
    });
    b.face("tin", 14, GH, -12, 1, 0, 0, 0, 0, 1, 7, 12, {
      uv: "top",
      tint: [0.55, 0.5, 0.42],
    });
    b.face("tin", 21, GH, -12, 1, 0, 0, 0, 0, 1, 3, 1.5, {
      uv: "top",
      tint: [0.55, 0.5, 0.42],
    });
    K.stairs(b, 21.1, -10.5, 23.85, -0.5, 0, U2, "-z", {
      mat: "marble",
      tint: [0.8, 0.78, 0.74],
      rail: "r",
      railMat: "brass",
      handMat: "mahogany",
      nosing: "brass",
    });
    K.framed(b, 14.12, 2.6, -8, 1, 0, 1.4, 1.8, K.painting(26, 160, 200), {
      frame: "gold",
    });
    K.lamp(b, 17.5, 3.8, -6, "globe", warm, 0.7, 8, {
      ceil: GH,
      size: 0.18,
      lightOpts: { box: EB },
    });
    K.room(b, ctx, {
      x0: 14,
      z0: -37,
      x1: 24,
      z1: -12,
      y: 0,
      h: GH,
      noFloor: true,
      floor: "carpet",
      wall: "wallpaper",
      wc: [0.65, 0.3, 0.24],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.2,
      ceil: "tin",
      cc: [0.45, 0.4, 0.32],
      surface: "carpet",
    });
    // club floor with the east (cellar) stair hole x 21..24, z −34..−26
    b.face("carpet", 14, 0, -12, 1, 0, 0, 0, 0, -1, 7, 25, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.face("carpet", 21, 0, -12, 1, 0, 0, 0, 0, -1, 3, 14, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.face("carpet", 21, 0, -34, 1, 0, 0, 0, 0, -1, 3, 3, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.col(14, -0.3, -37, 21, 0, -12, { tag: "floor", surface: "carpet" });
    b.col(21, -0.3, -26, 24, 0, -12, { tag: "floor", surface: "carpet" });
    b.col(21, -0.3, -37, 24, 0, -34, { tag: "floor", surface: "carpet" });
    K.railing(b, 21, -34, 21, -26, 0, {
      h: 1.0,
      mat: "brass",
      handMat: "mahogany",
    });
    K.railing(b, 21, -34, 23.9, -34, 0, {
      h: 1.0,
      mat: "brass",
      handMat: "mahogany",
    });
    K.stairs(b, 21.1, -34, 23.9, -26, CY, 0, "+z", {
      mat: "concrete",
      tint: [0.5, 0.48, 0.45],
      rail: "l",
      railMat: "black_iron",
      handMat: "mahogany",
    });
    // the Tiger Club: bar, billiard table, poker table, a stuffed-looking tiger rug
    b.boxMM("mahogany", 14.2, 0, -35.6, 18.6, 1.1, -34.8, {
      tint: [0.45, 0.22, 0.14],
    });
    b.col(14.2, 0, -35.6, 18.6, 1.1, -34.8, { tag: "counter" });
    b.boxMM("mahogany", 14.1, 0, -36.9, 18.6, 2.6, -36.4, {
      tint: [0.36, 0.18, 0.1],
    });
    for (let k = 0; k < 18; k++)
      b.cyl(
        "glass",
        14.4 + k * 0.23,
        1.3 + (k % 2) * 0.6,
        -36.6,
        0.04,
        0.04,
        0.24,
        6,
        {
          tint: r.pick([
            [0.3, 0.45, 0.25],
            [0.5, 0.3, 0.12],
            [0.75, 0.7, 0.5],
          ]),
        },
      );
    for (const yy of [1.25, 1.85])
      b.boxMM("mahogany", 14.1, yy, -36.9, 18.6, yy + 0.04, -36.3, {
        tint: [0.4, 0.2, 0.12],
      });
    b.boxMM("wood_dark", 16.2, 0.75, -24.9, 19.8, 0.95, -23.1, {
      tint: [0.38, 0.22, 0.12],
    });
    b.boxMM("felt", 16.35, 0.95, -24.75, 19.65, 0.97, -23.25, {
      tint: [0.2, 0.42, 0.24],
    });
    for (const [lx, lz] of [
      [16.4, -24.8],
      [19.6, -24.8],
      [16.4, -23.2],
      [19.6, -23.2],
    ])
      b.box("wood_dark", lx, 0, lz, 0.18, 0.75, 0.18, {
        tint: [0.35, 0.2, 0.12],
      });
    for (let k = 0; k < 7; k++)
      b.geo("flat", K.sphereGeo(), {
        x: 17 + r() * 2.2,
        y: 1.0,
        z: -24.5 + r() * 1.1,
        s: 0.03,
        tint: r.pick([
          [0.9, 0.85, 0.2],
          [0.7, 0.1, 0.1],
          [0.1, 0.2, 0.6],
          [0.9, 0.9, 0.85],
        ]),
      });
    b.col(16.2, 0, -24.9, 19.8, 0.97, -23.1, { tag: "furniture" });
    K.lamp(b, 18, 1.8, -24, "pendant", warm, 0.9, 5, {
      ceil: GH,
      shade: "paint_green",
      lightOpts: { box: EB },
    });
    const pk = K.roundTable(b, 17.5, 0, -17, 0.8, {
      mat: "wood_dark",
      cloth: [0.2, 0.42, 0.24],
    });
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * PI * 2;
      K.chair(
        b,
        17.5 + Math.cos(a) * 1.3,
        0,
        -17 + Math.sin(a) * 1.3,
        -a - HP,
        { mat: "wood_dark" },
      );
    }
    for (let k = 0; k < 12; k++)
      b.box(
        "flat",
        17.5 + (r() - 0.5) * 1,
        pk,
        -17 + (r() - 0.5) * 1,
        0.06,
        0.02,
        0.09,
        { yaw: r() * 3, tint: [0.9, 0.9, 0.85] },
      );
    b.hplate("art", 20, 0.013, -18.5, 2.6, 1.8, 0.3, tigerCell());
    K.framed(b, 23.88, 2.6, -20, -1, 0, 1.2, 1.6, K.painting(10, 160, 200), {
      frame: "gold",
    });
    K.lamp(b, 17.5, 2.6, -17, "pendant", warm, 0.85, 6, {
      ceil: GH,
      shade: "paint_green",
      lightOpts: { box: EB },
    });
    b.light(16.4, 2.2, -35.5, warm, 0.7, 5, { box: EB });
    K.loot(ctx, "cash_register", 17.8, 1.1, -35.2, 0, {
      loot: "cash_register",
      name: "Club Till",
    });
    K.loot(ctx, "fridge", 23.4, 0, -35.8, -HP, {
      loot: "drinks",
      name: "Club Icebox",
    });

    // ================================================= SECOND FLOOR
    const UB = [-24.1, U2 - 0.3, -37.1, 24.1, U2 + 4, 0.1];
    // east: landing (stair hole), secretary, Boss's office
    K.room(b, ctx, {
      x0: 14,
      z0: -12,
      x1: 24,
      z1: 0,
      y: U2,
      h: 3.8,
      noFloor: true,
      floor: "carpet",
      wall: "wallpaper",
      wc: [0.7, 0.62, 0.5],
      wain: "wood_dark",
      wainC: panel,
      ceil: "plaster",
      cc: [0.55, 0.5, 0.44],
      surface: "carpet",
    });
    b.face("carpet", 14, U2, 0, 1, 0, 0, 0, 0, -1, 7, 12, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.face("carpet", 21, U2, -10.5, 1, 0, 0, 0, 0, -1, 3, 1.5, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.face("carpet", 21, U2, 0, 1, 0, 0, 0, 0, -1, 3, 0.5, {
      uv: "top",
      tint: [0.55, 0.22, 0.2],
    });
    b.col(14, U2 - 0.3, -12, 21, U2, 0, { tag: "floor", surface: "carpet" });
    b.col(21, U2 - 0.3, -12, 24, U2, -10.5, {
      tag: "floor",
      surface: "carpet",
    });
    b.col(21, U2 - 0.3, -0.5, 24, U2, 0, { tag: "floor", surface: "carpet" });
    K.railing(b, 21, -10.5, 21, -0.5, U2, {
      h: 1.0,
      mat: "brass",
      handMat: "mahogany",
    });
    K.lamp(b, 18, U2 + 3.2, -6, "globe", warm, 0.6, 7, {
      ceil: U2 + 3.8,
      size: 0.16,
      lightOpts: { box: UB },
    });
    b.plate(
      "art",
      14.12,
      U2 + 2.0,
      -6,
      1,
      0,
      2.6,
      0.5,
      K.signCell("tam_boss_arrow", "THE BOSS WILL SEE YOU →", 512, 90, {
        bg: "#1a1410",
        fg: "#d8701c",
        font: "Georgia, serif",
      }),
    );
    // secretary / anteroom
    K.room(b, ctx, {
      x0: 14,
      z0: -24,
      x1: 24,
      z1: -12,
      y: U2,
      h: 3.8,
      floor: "carpet",
      fc: [0.5, 0.22, 0.2],
      wall: "wallpaper",
      wc: [0.72, 0.64, 0.52],
      wain: "wood_dark",
      wainC: panel,
      ceil: "plaster",
      cc: [0.55, 0.5, 0.44],
      surface: "carpet",
    });
    const sd = K.table(b, 19, U2, -18, 2.0, 1.0, { mat: "mahogany" });
    b.box("paint_black", 18.6, sd, -18, 0.5, 0.25, 0.4, {
      tint: [0.15, 0.15, 0.15],
    }); // typewriter
    K.terminal(
      ctx,
      "pev_term_tam_secretary",
      19.7,
      sd,
      -18.1,
      0,
      termSecretary(),
      "bare",
    );
    // Mrs. Kelly's desk blotter: the appointments teletype passcode, underlined twice
    K.scrawlAt(
      K.world(ctx, 18.9, sd + 0.1, -18.6),
      "Secretary's Blotter",
      'Doodles of tigers. In the corner, underlined twice: "NEW TELETYPE WORD — WIGWAM. The Boss says I may not write it down. — M.K."',
      "pev_lk_tam_secretary",
    );
    K.anchor(ctx, "vault_key", 18.2, sd + 0.02, -17.7);
    for (let k = 0; k < 4; k++)
      K.chair(b, 15, U2, -14 - k * 1.2, HP, {
        mat: "leather",
        tint: [0.35, 0.2, 0.14],
      });
    b.plate(
      "art",
      15.5,
      U2 + 2.2,
      -23.88,
      0,
      1,
      2.4,
      0.5,
      K.signCell("tam_waiting", "PETITIONERS WAIT HERE", 384, 80, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, 19, U2 + 2.4, -18, "pendant", warm, 0.8, 6, {
      ceil: U2 + 3.8,
      shade: "paint_green",
      lightOpts: { box: UB },
    });
    K.skel(ctx, 15.1, U2, -15.2, HP, "seated");
    // THE BOSS'S OFFICE
    const BO = [13.9, U2 - 0.3, -37.1, 24.1, U2 + 4, -23.9];
    K.room(b, ctx, {
      x0: 14,
      z0: -37,
      x1: 24,
      z1: -24,
      y: U2,
      h: 3.8,
      floor: "parquet",
      fc: [0.6, 0.45, 0.32],
      wall: "wallpaper_green",
      wc: [0.6, 0.64, 0.5],
      wain: "mahogany",
      wainC: [0.45, 0.22, 0.14],
      wainH: 1.3,
      ceil: "tin",
      cc: [0.6, 0.55, 0.45],
      cornice: true,
      surface: "wood",
    });
    const bd = K.table(b, 20.5, U2, -32.5, 3.2, 1.5, { mat: "mahogany" });
    b.boxMM("mahogany", 19, U2, -33.2, 22, U2 + 0.72, -33.1, {
      tint: [0.42, 0.2, 0.12],
    });
    K.chair(b, 20.5, U2, -33.6, PI, { mat: "leather", tint: [0.4, 0.14, 0.1] });
    b.box("brass", 21.6, bd, -32.4, 0.14, 0.34, 0.14, {});
    b.geo("green_paint", K.sphereGeo(), {
      x: 21.6,
      y: bd + 0.38,
      z: -32.4,
      sx: 0.28,
      sy: 0.08,
      sz: 0.12,
      tint: [0.2, 0.5, 0.3],
    });
    b.light(21.4, bd + 0.4, -32.2, [1, 0.9, 0.65], 0.9, 5, { box: BO });
    b.glow(21.6, bd + 0.3, -32.4, [0.6, 0.5, 0.3], 0.9);
    b.cyl("glass", 19.6, bd, -32.2, 0.05, 0.05, 0.14, 8, {
      tint: [0.35, 0.2, 0.08],
    });
    b.cyl("glass", 19.8, bd, -32.3, 0.05, 0.05, 0.14, 8, {
      tint: [0.35, 0.2, 0.08],
    }); // two darks — Deck's
    b.cyl("ceramic", 19.3, bd, -32.6, 0.12, 0.1, 0.03, 10);
    b.pipe("flat", 19.3, bd + 0.05, -32.6, 19.45, bd + 0.05, -32.5, 0.012, 4, {
      tint: [0.5, 0.35, 0.2],
    }); // ashtray + cigar
    K.terminal(
      ctx,
      "pev_term_tam_boss",
      19.9,
      bd,
      -32.8,
      0,
      termBoss(),
      "bare",
    );
    b.hplate("art", 20.5, U2 + 0.013, -30, 3.0, 2.0, 0, tigerCell());
    K.framed(
      b,
      20.5,
      U2 + 2.4,
      -36.88,
      0,
      1,
      1.6,
      2.0,
      K.painting(18, 160, 200),
      { frame: "gold" },
    );
    for (const x of [16, 25 - 1.2])
      K.framed(
        b,
        x,
        U2 + 2.3,
        -36.88,
        0,
        1,
        0.8,
        1.0,
        K.painting(34 + ((x | 0) % 3), 128, 160),
        { frame: "gold" },
      );
    b.cyl("wood_dark", 15.2, U2, -35.8, 0.2, 0.28, 0.8, 8);
    b.geo("flat", K.sphereGeo(), {
      x: 15.2,
      y: U2 + 1.15,
      z: -35.8,
      s: 0.33,
      tint: [0.55, 0.62, 0.5],
    });
    K.shelf(b, 23.7, U2, -30, -HP, 4, {
      mat: "mahogany",
      h: 2.6,
      items: ["book", "book", "box"],
      seed: 88,
    });
    K.sofa(b, 16, U2, -27, 2.4, HP, { mat: "leather", tint: [0.4, 0.14, 0.1] });
    // the window over the Wigwam (the Boss's box): opening in the west wall to the east gallery
    K.lamp(b, 19, U2 + 3.2, -28, "globe", warm, 0.6, 8, {
      ceil: U2 + 3.8,
      size: 0.2,
      lightOpts: { box: BO },
    });
    K.anchor(ctx, "boss", 20.5, U2, -31.2);
    K.anchor(ctx, "bodyguard", 16.2, U2, -29.5);
    K.loot(ctx, "safe", 23.4, U2, -36.3, -HP, {
      loot: "safe",
      name: "The Boss's Personal Safe",
      tag: "bosssafe",
      lock: K.regLock({
        id: "pev_lk_tam_boss_safe",
        label: "The Boss's Personal Safe",
        kind: "safe",
        code: "1102",
        hint: "The Boss's own teletype opens it — and names Election Day.",
      }),
    });
    // west: council room + archive (reached via the west gallery)
    K.room(b, ctx, {
      x0: -24,
      z0: -20,
      x1: -14,
      z1: 0,
      y: U2,
      h: 3.8,
      floor: "parquet",
      fc: [0.55, 0.42, 0.3],
      wall: "wallpaper",
      wc: [0.7, 0.62, 0.5],
      wain: "wood_dark",
      wainC: panel,
      ceil: "tin",
      cc: [0.55, 0.5, 0.42],
      cornice: true,
      surface: "wood",
    });
    const ct = K.table(b, -19, U2, -10, 1.6, 12, { mat: "mahogany" });
    for (let k = 0; k < 6; k++)
      for (const s of [-1, 1])
        K.chair(b, -19 + s * 1.1, U2, -15 + k * 2, s > 0 ? HP : -HP, {
          mat: "leather",
          tint: [0.4, 0.14, 0.1],
          fallen: r() < 0.15,
        });
    K.chair(b, -19, U2, -16.6, PI, { mat: "leather", tint: [0.5, 0.12, 0.08] });
    for (let k = 0; k < 8; k++)
      K.framed(
        b,
        -23.88,
        U2 + 2.2,
        -2 - k * 2.2,
        1,
        0,
        0.8,
        1.0,
        K.painting(2 + k * 8, 128, 160),
        { frame: "gold" },
      );
    b.plate(
      "art",
      -19,
      U2 + 3.1,
      -0.14,
      0,
      -1,
      4.4,
      0.5,
      K.signCell(
        "tam_sachems",
        "THE GRAND SACHEMS OF THE SOCIETY OF TAMMANY",
        768,
        80,
        { bg: "#1a1410", fg: "#c8a050", font: "Georgia, serif" },
      ),
    );
    for (let k = 0; k < 5; k++)
      b.box("flat", -19 + (r() - 0.5) * 1, ct, -14 + k * 2.2, 0.3, 0.02, 0.4, {
        yaw: r(),
        tint: [0.9, 0.88, 0.8],
      });
    K.lamp(b, -19, U2 + 3.0, -6, "globe", warm, 0.6, 8, {
      ceil: U2 + 3.8,
      size: 0.16,
      lightOpts: { box: UB },
    });
    K.lamp(b, -19, U2 + 3.0, -14, "globe", warm, 0.5, 7, {
      ceil: U2 + 3.8,
      size: 0.16,
      lightOpts: { box: UB },
    });
    K.room(b, ctx, {
      x0: -24,
      z0: -37,
      x1: -14,
      z1: -20,
      y: U2,
      h: 3.8,
      floor: "wood",
      fc: [0.5, 0.4, 0.3],
      wall: "plaster_stained",
      wc: [0.7, 0.62, 0.5],
      ceil: "plaster",
      cc: [0.5, 0.46, 0.4],
      surface: "wood",
    });
    for (let k = 0; k < 5; k++)
      K.shelf(b, -23.7, U2, -22.5 - k * 2.8, HP, 2.6, {
        mat: "wood_dark",
        h: 3.0,
        items: ["book", "box", "book"],
        seed: 90 + k,
      });
    b.boxMM("cast_iron", -18.5, U2, -33.5, -16.5, U2 + 1.6, -31.5, {
      tint: [0.3, 0.28, 0.26],
    });
    b.cyl("cast_iron", -17.5, U2 + 1.6, -32.5, 0.5, 0.5, 0.3, 12);
    b.col(-18.5, U2, -33.5, -16.5, U2 + 1.9, -31.5, {}); // ballot printing press
    b.plate(
      "art",
      -14.12,
      U2 + 2.2,
      -29,
      -1,
      0,
      2.4,
      0.6,
      K.signCell("tam_archive", "ARCHIVE — ELECTIONS 1854–1967", 384, 90, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, -19, U2 + 3.0, -28, "bulb", warm, 0.6, 7, {
      ceil: U2 + 3.8,
      lightOpts: { box: UB },
    });
    K.note(ctx, "pev_note_tam_plunkitt", -17.2, U2 + 1.62, -32.3, {
      name: "Printing Plate Proof",
      title: "Proof sheet, Fourth Ward ballot (1967)",
      text: 'PROOF — PLEASE CHECK BEFORE PRINTING 40,000 COPIES\n\n[X] CROKE\n\nNote from the printer: "Mr. Croke, the X is already printed on the ballot. Is that... legal?"\nReply, in blue pencil: "It\'s efficient. Print it."\nSecond note: "There are more ballots than people in the ward."\nReply: "There are more people in the ward than you think. Some of them are in Green-Wood Cemetery. They vote very reliably."',
    });
    K.loot(ctx, "file_cabinet", -15, U2, -36.4, 0, {
      loot: "file_cabinet",
      name: "Sealed Election Returns",
    });

    // ================================================= CELLAR
    const CB = [-24.1, CY - 0.2, -37.1, 24.1, -0.2, -11.9];
    // coal room (east stair foot) + chute
    K.room(b, ctx, {
      x0: 14,
      z0: -37,
      x1: 24,
      z1: -26,
      y: CY,
      h: 3.7,
      noFloor: true,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.5, 0.36, 0.3],
      ceil: "concrete",
      cc: [0.3, 0.28, 0.26],
      noCeil: true,
      trim: false,
    });
    b.face("concrete", 14, CY, -26, 1, 0, 0, 0, 0, -1, 7, 11, {
      uv: "top",
      tint: [0.3, 0.28, 0.26],
    });
    b.face("concrete", 21, CY, -34, 1, 0, 0, 0, 0, -1, 3, 3, {
      uv: "top",
      tint: [0.3, 0.28, 0.26],
    });
    b.col(14, CY - 0.3, -37, 21, CY, -26, { tag: "floor" });
    b.col(21, CY - 0.3, -37, 24, CY, -34, { tag: "floor" });
    b.face("concrete", 14, -0.3, -37, 1, 0, 0, 0, 0, 1, 7, 11, {
      uv: "top",
      tint: [0.3, 0.28, 0.26],
    });
    for (let k = 0; k < 30; k++)
      b.geo("paint_black", K.sphereGeo(), {
        x: 15.5 + r() * 3,
        y: CY + r() * 0.8,
        z: -35.5 + r() * 3,
        s: 0.1 + r() * 0.15,
        tint: [0.08, 0.08, 0.08],
      });
    b.col(15, CY, -36.5, 19, CY + 0.9, -32, {});
    b.boxMM("metal_dark", 23.4, CY + 1.4, -30.5, 24, CY + 3.4, -28.5, {
      tint: [0.3, 0.28, 0.26],
    });
    b.quad(
      "rust",
      [23.4, CY + 1.4, -28.5],
      [23.4, CY + 1.4, -30.5],
      [21.8, CY + 0.2, -30.5],
      [21.8, CY + 0.2, -28.5],
      { tint: [0.5, 0.4, 0.3] },
    ); // chute slide
    b.plate(
      "decal",
      23.88,
      CY + 2.2,
      -27,
      -1,
      0,
      1.6,
      0.6,
      K.tag("COAL CHUTE ↑", "#e8e8e0", 192, 72),
    );
    K.lamp(b, 18, CY + 3.2, -30, "cage", warm, 0.6, 7, {
      ceil: -0.3,
      lightOpts: { box: CB },
    });
    // ballot room (under the hall, north)
    K.room(b, ctx, {
      x0: -14,
      z0: -37,
      x1: 14,
      z1: -26,
      y: CY,
      h: 3.7,
      floor: "concrete",
      fc: [0.45, 0.42, 0.38],
      wall: "brick_red",
      wc: [0.55, 0.4, 0.34],
      ceil: "concrete",
      cc: [0.34, 0.32, 0.3],
      trim: false,
    });
    for (let k = 0; k < 18; k++) {
      const x = -12 + (k % 9) * 2.6,
        z = k < 9 ? -35.8 : -33.6;
      b.box("wood", x, CY, z, 1.1, 0.8 + (k % 3) * 0.4, 0.9, {
        yaw: (r() - 0.5) * 0.2,
        tint: [0.6, 0.5, 0.34],
      });
      b.plate(
        "art",
        x,
        CY + 0.5,
        z + 0.46,
        0,
        1,
        0.8,
        0.3,
        K.signCell("tam_crate", "BALLOTS (MARKED)", 192, 64, {
          bg: "#c8b890",
          fg: "#8a1a10",
          font: "Arial, sans-serif",
        }),
      );
    }
    b.col(-13, CY, -36.5, 11, CY + 1.6, -33, {});
    for (let k = 0; k < 40; k++)
      b.hplate(
        "flat",
        -12 + r() * 24,
        CY + 0.012 + k * 0.0002,
        -32 + r() * 5,
        0.2,
        0.3,
        r() * 6,
        null,
        { tint: [0.88, 0.85, 0.75] },
      );
    b.boxMM("metal_dark", 2, CY, -29.5, 5, CY + 1.3, -27.5, {
      tint: [0.3, 0.32, 0.3],
    });
    b.col(2, CY, -29.5, 5, CY + 1.3, -27.5, {});
    b.plate(
      "art",
      3.5,
      CY + 1.6,
      -27.48,
      0,
      1,
      2.2,
      0.4,
      K.signCell("tam_vm", 'VOTING MACHINE — "ADJUSTED"', 384, 70, {
        bg: "#1a1a1a",
        fg: "#e8d8b0",
        font: "Arial, sans-serif",
      }),
    );
    for (const x of [-8, 0, 8])
      K.lamp(b, x, CY + 3.2, -31, "bulb", warm, 0.6, 7, {
        ceil: CY + 3.7,
        lightOpts: { box: CB },
      });
    // holding cells (for "uncooperative voters")
    K.room(b, ctx, {
      x0: -14,
      z0: -26,
      x1: 14,
      z1: -12,
      y: CY,
      h: 3.7,
      floor: "concrete",
      fc: [0.42, 0.4, 0.37],
      wall: "celltile",
      wc: [0.7, 0.72, 0.62],
      ceil: "concrete",
      cc: [0.34, 0.32, 0.3],
      trim: false,
    });
    // cells along the south wall (z −16..−12), bars at z = −16
    for (let k = 0; k < 5; k++) {
      const cx0 = -12 + k * 5.2,
        cx1 = cx0 + 4.4;
      K.segWall(b, cx1, -16, cx1, -12, CY, CY + 3.7, 1, {
        mat: "celltile",
        tint: [0.6, 0.62, 0.54],
        trim: false,
        both: true,
      });
      const doorX = cx0 + 3.4;
      for (let x = cx0 + 0.1; x < cx1; x += 0.22) {
        if (Math.abs(x - doorX) < 0.55) continue;
        b.pipe("black_iron", x, CY, -16, x, CY + 2.8, -16, 0.018, 4);
      }
      b.beam("black_iron", cx0, CY + 2.8, -16, cx1, CY + 2.8, -16, 0.1, 0.08);
      b.beam("black_iron", cx0, CY + 0.1, -16, cx1, CY + 0.1, -16, 0.08, 0.06);
      b.col(cx0, CY, -16.1, doorX - 0.55, CY + 2.9, -15.9, { walkable: false });
      b.col(doorX + 0.55, CY, -16.1, cx1, CY + 2.9, -15.9, { walkable: false });
      b.boxMM("metal", cx0 + 0.2, CY, -13, cx0 + 2.2, CY + 0.45, -12.2, {
        tint: [0.4, 0.4, 0.38],
      });
      if (k !== 3)
        K.skel(
          ctx,
          cx0 + 1.2,
          CY + 0.45,
          -12.6,
          r() * 3,
          k % 2 ? "curled" : "lying",
        );
    }
    K.anchor(ctx, "captive", -12 + 3 * 5.2 + 1.8, CY, -13.6);
    ctx.harrietCellX = -12 + 3 * 5.2 + 3.4;
    b.plate(
      "art",
      0,
      CY + 3.0,
      -25.88,
      0,
      1,
      4.4,
      0.5,
      K.signCell(
        "tam_cells",
        "UNCOOPERATIVE VOTERS — PLEASE RECONSIDER",
        768,
        80,
        { bg: "#1a1410", fg: "#d8701c", font: "Arial, sans-serif" },
      ),
    );
    for (const x of [-8, 0, 8])
      K.lamp(b, x, CY + 3.2, -19, "cage", [0.85, 0.9, 0.8], 0.55, 7, {
        ceil: CY + 3.7,
        lightOpts: { box: CB },
      });
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -12 + r() * 24,
        CY + 0.012 + k * 0.0004,
        -24 + r() * 7,
        1.1,
        1.1,
        r() * 6,
        K.decal(k % 2 ? "blood" : "grime", 110 + k),
      );
    // west stair foot (strongroom antechamber)
    K.room(b, ctx, {
      x0: -24,
      z0: -24,
      x1: -14,
      z1: -12,
      y: CY,
      h: -CY,
      noFloor: true,
      noCeil: true,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.5, 0.36, 0.3],
      trim: false,
    });
    b.face("concrete", -24, CY, -12, 1, 0, 0, 0, 0, -1, 10, 12, {
      uv: "top",
      tint: [0.42, 0.4, 0.37],
    });
    b.col(-24, CY - 0.3, -24, -14, CY, -12, { tag: "floor" });
    b.face("concrete", -21, -0.3, -24, 1, 0, 0, 0, 0, 1, 7, 12, {
      uv: "top",
      tint: [0.3, 0.28, 0.26],
    });
    K.lamp(b, -17, CY + 3.2, -19, "cage", [1, 0.3, 0.15], 0.6, 6, {
      ceil: -0.3,
      lightOpts: { box: CB },
    });
    b.plate(
      "art",
      -18,
      CY + 2.8,
      -23.86,
      0,
      1,
      3.0,
      0.45,
      K.signCell("tam_vault_sign", "THE WIGWAM VAULT — BOSS ONLY", 512, 76, {
        bg: "#1a1410",
        fg: "#c8a050",
        font: "Georgia, serif",
      }),
    );
    K.terminal(
      ctx,
      "pev_term_tam_vault",
      -15.8,
      CY + 1.3,
      -23.86,
      0,
      termVault(),
      "wall",
    );
    // THE VAULT (reward room)
    const VB = [-24.1, CY - 0.2, -37.1, -13.9, -0.2, -23.9];
    K.room(b, ctx, {
      x0: -24,
      z0: -37,
      x1: -14,
      z1: -24,
      y: CY,
      h: 3.4,
      floor: "marble",
      fc: [0.6, 0.58, 0.54],
      wall: "metal",
      wc: [0.55, 0.58, 0.56],
      ceil: "metal",
      cc: [0.4, 0.42, 0.4],
      trim: false,
      surface: "metal",
    });
    b.boxMM("mahogany", -19.6, CY, -35.2, -18.4, CY + 1.2, -34.4, {
      tint: [0.45, 0.22, 0.14],
    });
    b.quad(
      "mahogany",
      [-19.7, CY + 1.2, -34.3],
      [-18.3, CY + 1.2, -34.3],
      [-18.3, CY + 1.45, -35.2],
      [-19.7, CY + 1.45, -35.2],
      { tint: [0.42, 0.2, 0.12] },
    );
    b.col(-19.6, CY, -35.2, -18.4, CY + 1.2, -34.4, {});
    K.anchor(ctx, "ledger", -19, CY + 1.36, -34.8);
    b.light(-19, CY + 3.0, -34.5, [1, 0.85, 0.55], 1.1, 5, { box: VB });
    b.glow(-19, CY + 3.2, -34.5, [0.8, 0.6, 0.3], 1.2);
    b.cyl("black_iron", -19, CY + 3.1, -34.5, 0.3, 0.1, 0.3, 8, { top: false });
    for (let k = 0; k < 8; k++)
      b.box(
        "gold",
        -23 + (k % 4) * 0.35,
        CY + 0.9 + Math.floor(k / 4) * 0.12,
        -30,
        0.3,
        0.1,
        0.14,
        { tint: [0.95, 0.75, 0.3] },
      );
    b.boxMM("metal", -23.9, CY, -31, -21.5, CY + 0.9, -29, {
      tint: [0.5, 0.52, 0.5],
    });
    b.col(-23.9, CY, -31, -21.5, CY + 0.9, -29, {});
    for (let k = 0; k < 12; k++)
      b.box(
        "flat",
        -16 + (k % 4) * 0.4,
        CY + 0.9 + Math.floor(k / 4) * 0.08,
        -35.5,
        0.34,
        0.07,
        0.16,
        { tint: [0.55, 0.65, 0.5] },
      ); // old-world money bricks
    b.boxMM("metal", -16.8, CY, -36.2, -14.2, CY + 0.9, -34.8, {
      tint: [0.5, 0.52, 0.5],
    });
    b.col(-16.8, CY, -36.2, -14.2, CY + 0.9, -34.8, {});
    for (let k = 0; k < 20; k++) {
      const x = -23.7 + (k % 5) * 0.5,
        z = -26 - Math.floor(k / 5) * 0.4;
      b.boxMM(
        "metal_dark",
        x,
        CY + 1.2 + (k % 3) * 0.5,
        -24.2,
        x + 0.45,
        CY + 1.6 + (k % 3) * 0.5,
        -24.12,
        { tint: [0.4, 0.42, 0.4] },
      );
      void z;
    } // deposit boxes
    b.boxMM("metal", -21.5, CY + 2.2, -36.95, -16.5, CY + 2.9, -36.9, {
      tint: [0.6, 0.55, 0.4],
    });
    b.plate(
      "art",
      -19,
      CY + 2.55,
      -36.88,
      0,
      1,
      4.6,
      0.55,
      K.signCell(
        "tam_plunkitt",
        '"I SEEN MY OPPORTUNITIES AND I TOOK \'EM."',
        768,
        90,
        { bg: "#1a1410", fg: "#c8a050", font: "Georgia, serif" },
      ),
    );
    K.loot(ctx, "safe", -14.6, CY, -36.2, -HP, {
      loot: "safe",
      name: "Slush Fund",
      lock: K.regLock({
        id: "pev_lk_tam_slush",
        label: "Slush Fund",
        kind: "safe",
        code: "1789",
        hint: "A Brave scratched the combination into the coal-room brick.",
      }),
    });
    K.scrawlAt(
      K.world(ctx, -13.8, CY + 1.4, -35.4),
      "Scratched Brick",
      'Scratched into the whitewash with a nail: "SLUSH = YEAR WE WAS FOUNDED. 1789. Don\'t tell Kelly." Somebody has added, in better handwriting: "Kelly knows."',
      "pev_lk_tam_slush",
    );
    K.loot(ctx, "ammo_box", -23.3, CY, -33.5, HP, {
      large: true,
      loot: "weapon_crate",
      name: "Braves' Armory",
    });
    K.loot(ctx, "crate", -22.5, CY, -36.2, 0.2, {
      kind: "military",
      loot: "weapon_crate",
      name: "Election Day Supplies",
    });

    // ================================================= doors, anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    // arrival beside the ballot-box barricade (x ±3.4, z −2.2..−1.4, right behind the doors), facing into the lobby
    K.door(ctx, {
      id: "pev_tam_in",
      pos: new THREE.Vector3(X0 - 0.3, 2.2, DOOR_Z),
      label: "Tammany Hall",
      verb: "Enter",
      target: { x: OX - 4.4, y: OY, z: OZ - 1.2, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("tammany_hall")),
    });
    K.door(ctx, {
      id: "pev_tam_out",
      pos: new THREE.Vector3(OX, OY + 1.4, OZ - 0.3),
      label: "Union Square East",
      verb: "Leave",
      target: { x: X0 - 3.4, y: 0.9, z: DOOR_Z, yaw: HP },
    });
    // the coal chute: padlocked from the street (a coal-man's tag gives the combination); climbing out from inside unlocks it
    K.door(ctx, {
      id: "pev_tam_chute_in",
      pos: new THREE.Vector3(CHUTE.x, 1.1, Z1 + 1.0),
      label: "Tammany Coal Chute",
      verb: "Climb In",
      lock: K.regLock({
        id: "pev_lk_tam_chute",
        label: "Tammany Coal Chute",
        kind: "door",
        code: "4140",
        hint: "The coal company's delivery tag wired to the hatch.",
      }),
      target: { x: OX + 20.5, y: OY + CY, z: OZ - 29.5, yaw: HP },
    });
    K.scrawlAt(
      new THREE.Vector3(CHUTE.x + 0.7, 0.6, Z1 + 1.2),
      "Coal Delivery Tag",
      'A tin tag wired to the hatch: "CONSOLIDATED COAL — DELIVERIES MON & THU — PADLOCK 4-1-4-0 — RETURN TAG TO DRIVER." Nobody returned the tag.',
      "pev_lk_tam_chute",
    );
    K.door(ctx, {
      id: "pev_tam_chute_out",
      pos: new THREE.Vector3(OX + 23.3, OY + CY + 1.6, OZ - 29.5),
      label: "Coal Chute (14th Street)",
      verb: "Climb Out",
      target: { x: CHUTE.x, y: 0, z: Z1 + 2.6, yaw: PI },
      onEnter: () =>
        K.safe("chute unlock", () => {
          if (!G.isStub("locks") && G.locks.unlock)
            G.locks.unlock("pev_lk_tam_chute");
        }),
    });
    K.anchor(ctx, "entrance", -4.4, 0, -1.2); // = the arrival spot (the centre is the ballot-box barricade)
    K.anchor(ctx, "rostrum", 0, 1.2, -34.2); // behind the lectern (z −33.3..−32.6), not inside it
    K.anchor(ctx, "strongroom", VAULT.x, CY, VAULT.z + 1.5);
    [
      [-6, 0, -4],
      [-5, 0, -22],
      [7, 0, -17],
      [18, 0, -20],
      [-18.5, 0, -8],
      [0, CY, -31],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", -19, CY, -34);
    K.anchor(ctx, "loot2", 23.4, U2, -36.3);
    K.anchor(ctx, "loot3", -14.6, 0, -13);
    ctx.combatBoss = new THREE.Vector3(OX - 17, OY + CY, OZ - 18); // the "precinct captain" combat puts on the strongroom
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_tammany_int";

    // ---- the strongroom door (round, swings open) + Harriet's cell door: separate so they can move ----
    const vb = K.builder({
      name: "tam_vaultdoor",
      off: { x: 0, y: 0, z: 0 },
      lit: true,
      amb: [0.2, 0.2, 0.2],
      grime: 0.3,
    });
    vb.light(0.8, 2.4, 2.0, [1, 0.5, 0.3], 0.9, 6);
    vb.geo("steel", K.unitCyl(24), {
      x: 0.8,
      y: 1.15,
      z: 0,
      sx: 1.2,
      sy: 0.35,
      sz: 1.2,
      rx: HP,
      tint: [0.62, 0.64, 0.62],
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      vb.geo("steel", K.unitCyl(8), {
        x: 0.8 + Math.cos(a) * 1.0,
        y: 1.15 + Math.sin(a) * 1.0,
        z: 0.2,
        sx: 0.07,
        sy: 0.12,
        sz: 0.07,
        rx: HP,
        tint: [0.5, 0.52, 0.5],
      });
    }
    vb.geo("brass", K.unitCyl(6), {
      x: 0.8,
      y: 1.15,
      z: 0.25,
      sx: 0.08,
      sy: 0.25,
      sz: 0.08,
      rx: HP,
    });
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * PI * 2;
      vb.beam(
        "brass",
        0.8,
        1.15,
        0.35,
        0.8 + Math.cos(a) * 0.45,
        1.15 + Math.sin(a) * 0.45,
        0.35,
        0.05,
        0.05,
      );
    }
    const vdoor = vb.finish(null);
    const pivot = new THREE.Group();
    pivot.position.set(O.x + VAULT.x - 0.8, O.y + CY, O.z + VAULT.z + 0.2);
    pivot.add(vdoor);
    ctx.intRoot.add(pivot);
    ctx.vaultDoor = { pivot, col: null, t: 0, opening: false };
    const cb = K.builder({
      name: "tam_celldoor",
      off: { x: 0, y: 0, z: 0 },
      lit: true,
      amb: [0.2, 0.2, 0.2],
      grime: 0.3,
    });
    cb.light(0.5, 2.2, 1.5, [0.85, 0.9, 0.8], 0.7, 5);
    for (let x = 0.05; x <= 1.06; x += 0.2)
      cb.pipe("black_iron", x, 0, 0, x, 2.8, 0, 0.018, 4);
    cb.beam("black_iron", 0, 1.4, 0, 1.1, 1.4, 0, 0.06, 0.05);
    cb.beam("black_iron", 0, 2.75, 0, 1.1, 2.75, 0, 0.06, 0.05);
    cb.box("brass", 1.0, 1.2, 0.04, 0.12, 0.2, 0.08, {});
    const cdoor = cb.finish(null);
    const cpivot = new THREE.Group();
    cpivot.position.set(O.x + ctx.harrietCellX - 0.55, O.y + CY, O.z - 16);
    cpivot.add(cdoor);
    ctx.intRoot.add(cpivot);
    ctx.cellDoor = { pivot: cpivot, col: null };
    // interactables: strongroom door & Harriet's cell door
    K.safe("vaultint", () =>
      G.world.addInteractable({
        pos: new THREE.Vector3(
          O.x + VAULT.x,
          O.y + CY + 1.2,
          O.z + VAULT.z + 0.4,
        ),
        radius: 1.0,
        label: "Tammany Strongroom",
        verb: "Open",
        priority: 1,
        locked: () => (EV.flag("tam_vault_open") ? null : "Locked"),
        enabled: () => !EV.flag("tam_vault_open"),
        onInteract: () => tryVault(ctx),
      }),
    );
    K.safe("cellint", () =>
      G.world.addInteractable({
        pos: new THREE.Vector3(
          O.x + ctx.harrietCellX,
          O.y + CY + 1.2,
          O.z - 15.8,
        ),
        radius: 0.8,
        label: "Cell Door",
        verb: "Open",
        priority: 1,
        locked: () => (EV.flag("harriet_cell_open") ? null : "Locked"),
        enabled: () => !EV.flag("harriet_cell_open"),
        onInteract: () => tryCell(ctx),
      }),
    );
  }

  // ------------------------------------------------------------------ movable doors
  function setVault(ctx, open, instant) {
    const v = ctx.vaultDoor;
    if (!v) return;
    if (!open) {
      v.opening = false;
      v.t = 0;
      v.pivot.rotation.y = 0;
      if (!v.col)
        v.col = G.world.addBox(
          ctx.O.x + VAULT.x - 0.85,
          ctx.O.y + CY,
          ctx.O.z + VAULT.z - 0.2,
          ctx.O.x + VAULT.x + 0.85,
          ctx.O.y + CY + 2.4,
          ctx.O.z + VAULT.z + 0.45,
          { tag: "poi_eastvillage", surface: "metal", walkable: false },
        );
      return;
    }
    if (v.col) {
      K.safe("vcol", () => G.world.removeCollider(v.col));
      v.col = null;
    }
    if (instant) {
      v.pivot.rotation.y = -1.9;
      v.opening = false;
    } else {
      v.opening = true;
      v.t = 0;
      K.sfx("cryo_door", K.world(ctx, VAULT.x, CY + 1.2, VAULT.z));
    }
  }
  function setCell(ctx, open) {
    const c = ctx.cellDoor;
    if (!c) return;
    if (!open) {
      c.pivot.rotation.y = 0;
      if (!c.col)
        c.col = G.world.addBox(
          ctx.O.x + ctx.harrietCellX - 0.55,
          ctx.O.y + CY,
          ctx.O.z - 16.1,
          ctx.O.x + ctx.harrietCellX + 0.55,
          ctx.O.y + CY + 2.9,
          ctx.O.z - 15.9,
          { tag: "poi_eastvillage", surface: "metal", walkable: false },
        );
      return;
    }
    if (c.col) {
      K.safe("ccol", () => G.world.removeCollider(c.col));
      c.col = null;
    }
    c.pivot.rotation.y = 1.4;
  }
  function openVault(ctx) {
    EV.setFlag("tam_vault_open", true);
    setVault(ctx, true, false);
    K.xp(50, "Opened the Wigwam strongroom");
    if (K.q.active("pev_honest_graft")) EV.setFlag("heard_ledger", true);
  }
  // the strongroom and the cells share the Wigwam key (the Boss's ring, or the spare in his secretary's drawer);
  // the Boss's teletype and the time-lock console can also release the strongroom
  const VAULT_LOCK = K.regLock({
    id: "pev_lk_tam_vault",
    label: "Tammany Strongroom",
    kind: "door",
    key: "pev_tam_vault_key",
    hint: "Boss Croke carries the Wigwam key; a spare sits in his secretary's drawer (her teletype unlocks it).",
  });
  const CELL_LOCK = K.regLock({
    id: "pev_lk_tam_cell",
    label: "Cell Door (Harriet Vance)",
    kind: "door",
    key: "pev_tam_vault_key",
    hint: "The Wigwam key fits the cellar cells too.",
  });
  function tryVault(ctx) {
    if (EV.flag("tam_vault_open")) return;
    K.lockOpen(VAULT_LOCK, () => {
      K.notify("The Wigwam key turns in the strongroom lock.");
      openVault(ctx);
    });
  }
  function tryCell(ctx) {
    if (EV.flag("harriet_cell_open")) return;
    const open = () => {
      EV.setFlag("harriet_cell_open", true);
      setCell(ctx, true);
      K.sfx("door_open", K.world(ctx, ctx.harrietCellX, CY + 1, -16));
    };
    K.lockOpen(CELL_LOCK, () => {
      K.notify("The Wigwam key fits the cell lock too.");
      open();
    });
  }
  EV.tamOpenVault = function () {
    const c = EV.ctxs.find((q) => q.id === "tammany");
    if (c && !EV.flag("tam_vault_open")) openVault(c);
  };

  // ==================================================================
  // TERMINALS
  // ==================================================================
  function termPatronage() {
    return {
      title: "FOURTH WARD — PATRONAGE OFFICE",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nSOCIETY OF TAMMANY — CONSTITUENT SERVICES",
      entries: [
        {
          title: "Jobs Available (1967)",
          text: "Sanitation inspector (no inspection required) — $14,000/yr\nBridge toll collector, Brooklyn (keep 10%) — $9,000/yr + 10%\nDeputy assistant to the Deputy Commissioner of Deputies — $22,000/yr\n\nApplicants must present: (1) proof of residence, (2) proof of voting, (3) an envelope.",
        },
        {
          title: "Memo from the Boss",
          text: "Plunkitt said it best: there's honest graft and there's dishonest graft. Honest graft is when you know the city is about to buy a lot, so you buy it first. Dishonest graft is when you get caught.\n\nWe do not get caught. — A.C.\n\nP.S. Kelly: my personal teletype answers to PLUNKITT. Stop asking.",
          learn: "pev_lk_tam_boss_term",
        },
        {
          title: "Office Safe",
          learn: "pev_lk_tam_patronage_safe",
          text: "Patronage safe combination: 1-8-6-8, the year the Hall moved to 14th Street. Change it after the election. (We never change it after the election.)",
        },
        {
          title: "Operations Since the Bombing",
          text: "Braves on the payroll: 14 (as of this week; 11 after Tuesday's \"misunderstanding\" with the Iron Covenant).\nWard tax collected: O'Rourke's (weekly, grudging), the Beer Garden (in hops), Katz's (pending roach removal).\nOpposition: 1 (H. Vance — detained pending \"reconsideration,\" cellar block).",
        },
      ],
    };
  }
  function termSecretary() {
    return {
      title: "OFFICE OF THE GRAND SACHEM — APPOINTMENTS",
      header:
        'KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\n"The Boss Will See You Now" (maybe)',
      lock: {
        id: "pev_lk_tam_secretary",
        passcode: "WIGWAM",
        hint: "Mrs. Kelly wrote it on her desk blotter.",
      },
      entries: [
        {
          title: "Today's Appointments",
          text: "9:00  Captain of the Braves (ward tax)\n9:15  Man from O'Rourke's (declined; the mustard is personal)\n9:30  H. Vance, opposition candidate (moved to cellar)\n10:00 Anyone with a gun (always make time for anyone with a gun)",
        },
        {
          title: "Key Custody Log",
          text: "Strongroom key: Boss's ring. Spare: secretary's desk, top drawer, under the stamps. DO NOT TELL THE BOSS THERE IS A SPARE.",
        },
        {
          title: "Unlock Desk Drawer",
          text: "The top drawer slides open. Under a sheet of three-cent stamps: a heavy brass key.",
          action: () => {
            EV.setFlag("tam_drawer", true);
            spawnKey();
          },
          cond: () => !EV.flag("tam_drawer"),
        },
      ],
    };
  }
  function termBoss() {
    return {
      title: "A. CROKE — PERSONAL",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nPROPERTY OF THE GRAND SACHEM. KEEP OUT. THIS MEANS YOU, KELLY.",
      lock: {
        id: "pev_lk_tam_boss_term",
        passcode: "PLUNKITT",
        hint: "The Boss left his passcode in a memo on the patronage-office teletype.",
      },
      entries: [
        {
          title: "The Black Book",
          learn: ["pev_lk_tam_boss_safe", "pev_lk_tam_timelock"],
          text: "Every favor, every envelope, every dead man who voted since 1951 is in the book. The book is in the strongroom. The strongroom is under the Wigwam. The time lock opens on Election Day — November 2, 1-1-0-2, the same as my safe, because a man should remember Election Day. Without the book I'm an old man in a nice suit. With the book I'm the Boss.",
        },
        {
          title: "Ward Tax: O'Rourke's",
          text: "Deck pays. Deck always pays. I don't need his scrip — I need him to pay. A ward is a ward.\n\n(I don't even like the dark.)",
        },
        {
          title: "On Harriet Vance",
          text: 'She ran against me. Nobody runs against me. Kept her in the cellar for six weeks so she can "reconsider." She has not reconsidered. She has, however, organized the other prisoners into a union. I respect it. I hate it, but I respect it.',
        },
        {
          title: "Open Strongroom Lock",
          text: "Strongroom bolts retracting... The door swings open with a groan.",
          action: () => EV.tamOpenVault(),
          cond: () => !EV.flag("tam_vault_open"),
        },
        {
          title: "Open Personal Safe",
          text: "The safe clicks.",
          action: () => {
            EV.unlockTagged("tammany", "bosssafe");
            K.notify("The Boss's safe is unlocked.");
          },
        },
      ],
    };
  }
  function termVault() {
    return {
      title: "WIGWAM STRONGROOM — TIME LOCK",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nMOSLER SAFE CO. TIME-LOCK INTERFACE",
      lock: {
        id: "pev_lk_tam_timelock",
        passcode: "1102",
        hint: "Election Day — the Boss's teletype says when that is.",
      },
      entries: [
        {
          title: "Time Lock Status",
          text: "TIME LOCK: ENGAGED\nNEXT OPENING: ELECTION DAY\n(ELECTION DAY IS WHEN THE BOSS SAYS IT IS.)",
        },
        {
          title: "Override Time Lock",
          text: "Override accepted.",
          action: () => EV.tamOpenVault(),
          cond: () => !EV.flag("tam_vault_open"),
        },
      ],
    };
  }
  function spawnKey() {
    if (EV.flag("tam_key_taken") || K.has("pev_tam_vault_key")) return;
    const a = EV.anchor("tammany", "vault_key");
    if (a)
      K.safe("key", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup(
            "pev_tam_vault_key",
            1,
            { x: a.x, y: a.y, z: a.z },
            { static: false, keepY: true, noSave: true },
          );
      });
  }

  // ==================================================================
  // DATA: items, quest, dialogues
  // ==================================================================
  function data() {
    K.defineItem({
      id: "pev_tam_ledger",
      type: "misc",
      name: "The Black Book",
      weight: 1,
      value: 0,
      quest: true,
      desc: 'A fat leather ledger, gilt-edged, "A.C." on the spine. Every favor, bribe, patronage job and dead voter in the Fourth Ward since 1951, in the Boss\'s own tidy hand. Dynamite, bound in calfskin.',
    });
    K.keyFrom(
      "pev_tam_vault_key",
      "spare key in the secretary's drawer (appointments teletype)",
    );
    K.defineItem({
      id: "pev_tam_vault_key",
      type: "key",
      name: "Wigwam Key",
      weight: 0,
      value: 0,
      desc: 'A heavy brass key stamped "S.O.T. — WIGWAM." It opens the strongroom and fits the cells in the cellar. Everything in Tammany Hall opens with the same key, if you know who to ask.',
    });
    K.defineItem({
      id: "pev_tax_envelope",
      type: "misc",
      name: "Ward Tax Envelope",
      weight: 0,
      value: 150,
      quest: true,
      desc: "A fat envelope with 150 scrip in it and \"FOURTH WARD — O'ROURKE'S\" in Deck's angry handwriting. It still smells of onions.",
    });
    K.defineItem({
      id: "pev_tiger_pin",
      type: "apparel",
      slot: "eyes",
      name: "Tammany Tiger Pin",
      weight: 0,
      value: 120,
      attrs: { presence: 1 },
      skills: { trade: 10 },
      tags: ["apparel", "unique"],
      mesh: "badge",
      desc: "A gold tiger lapel pin. Wear it and every merchant in the Fourth Ward knows who you work for. They'll give you a discount. They will not give you a smile.",
    });
    K.defineItem({
      id: "pev_croke_derby",
      type: "apparel",
      slot: "head",
      name: "Boss Croke's Derby",
      weight: 1,
      value: 150,
      attrs: { presence: 1 },
      skills: { persuasion: 10 },
      mesh: "hat_bowler",
      tags: ["apparel", "hat", "unique"],
      desc: "A black bowler hat, the brim worn shiny by forty years of tipping it to voters. It fits any head. It has fit many.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pev_honest_graft",
        name: "Honest Graft",
        giver: "Deck O'Rourke",
        location: "Tammany Hall",
        desc: "Boss Aloysius Croke — an old ward boss who still runs Tammany Hall on Union Square like it's 1870 — squeezes O'Rourke's Old Ale House for a weekly \"ward tax.\" Deck O'Rourke wants it stopped. The Boss would rather you worked for him.",
        stages: [
          {
            id: "talk",
            text: "Deal with Boss Croke at Tammany Hall.",
            markers: [
              () => {
                const a = EV.anchor("tammany", "boss");
                return a
                  ? {
                      x: a.x,
                      z: a.z,
                      y: a.y,
                      label: "Boss Croke",
                      interior: "tammany_hall",
                    }
                  : null;
              },
            ],
          },
          {
            id: "tg_ledger",
            text: "(Optional) Find the Boss's Black Book in the Tammany strongroom.",
            sideObjective: true,
            optional: true,
            showIf: () =>
              !!EV.flag("heard_ledger") && K.q.active("pev_honest_graft"),
            doneIf: () => K.has("pev_tam_ledger") || !!EV.flag("ledger_used"),
          },
          {
            id: "tg_harriet",
            text: "(Optional) Free Harriet Vance from the Tammany cellar.",
            sideObjective: true,
            optional: true,
            showIf: () =>
              !!EV.flag("heard_harriet") && K.q.active("pev_honest_graft"),
            doneIf: () => !!EV.flag("harriet_free"),
          },
          {
            id: "collect",
            text: "Collect the ward tax from Deck O'Rourke.",
            markers: [{ npc: "pev_deck", label: "Deck" }],
          },
          {
            id: "deliver",
            text: "Bring the ward tax to Boss Croke.",
            markers: [{ npc: "pev_croke", label: "Boss Croke" }],
          },
          {
            id: "return",
            text: "Tell Deck O'Rourke the ward tax is finished.",
            markers: [{ npc: "pev_deck", label: "Deck" }],
          },
        ],
        rewards: { xp: 350 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    const toReturn = () => {
      if (q.active("pev_honest_graft")) q.set("pev_honest_graft", "return");
      else if (!q.done("pev_honest_graft")) {
        q.start("pev_honest_graft");
        q.set("pev_honest_graft", "return");
      }
    };
    const exempt = (why) => {
      EV.setFlag("mcs_exempt", why || true);
      K.xp(100, "The ward tax is lifted");
      toReturn();
    };
    const hostile = () => EV.tamAnger("heckler");
    const scrip = () => K.scripCount();
    G.dialogue.register("pev_dlg_croke", {
      start: () => {
        if (EV.flag("mcs_exempt")) return "after";
        if (
          q.active("pev_honest_graft") &&
          q.stage("pev_honest_graft") === "deliver" &&
          K.has("pev_tax_envelope")
        )
          return "deliver";
        return EV.flag("met_croke") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Boss Croke",
          onEnter: () => EV.setFlag("met_croke", true),
          text: "Well, well, well! A constituent! Sit, sit — mind the tiger, he bites. Aloysius Croke, Grand Sachem of the Society of Tammany, Alderman for the Fourth Ward since 1951. Re-elected nineteen times — eleven of them since I died a little. Unopposed. Which is the best kind of opposed. What can the Machine do for you?",
          responses: [
            {
              text: "I'm here about O'Rourke's.",
              next: "mcs",
              cond: () =>
                q.active("pev_honest_graft") &&
                ["talk", "tg_ledger", "tg_harriet"].indexOf(
                  q.stage("pev_honest_graft"),
                ) >= 0,
            },
            { text: "Who are you, really?", next: "who" },
            { text: "Your Braves shot at me on the way in.", next: "braves" },
            {
              text: "Got any work?",
              next: "job",
              cond: () =>
                !q.started("pev_honest_graft") ||
                q.stage("pev_honest_graft") === "talk",
            },
            { text: "I've come to shut your machine down.", next: "threat" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Boss Croke",
          text: "Back again! The Wigwam's doors are always open. For a price. The price is voting for me. You've already voted for me — I checked.",
          responses: [
            {
              text: "About O'Rourke's...",
              next: "mcs",
              cond: () =>
                q.active("pev_honest_graft") &&
                ["talk", "tg_ledger", "tg_harriet"].indexOf(
                  q.stage("pev_honest_graft"),
                ) >= 0,
            },
            {
              text: "I've read your Black Book.",
              next: "blackmail",
              cond: () => K.has("pev_tam_ledger"),
            },
            {
              text: "Got any work?",
              next: "job",
              cond: () =>
                !q.started("pev_honest_graft") ||
                q.stage("pev_honest_graft") === "talk",
            },
            { text: "I've come to shut your machine down.", next: "threat" },
            { text: "Goodbye.", end: true },
          ],
        },
        who: {
          speaker: "Boss Croke",
          text: "A public servant, kid. Before the bombs I was a ward boss — you want a job, a permit, a pothole filled, a cousin out of the Tombs, you come to Croke. After the bombs... well. People still want things. Somebody has to be the one they come to. [He smiles. Most of his lips are gone. It's still a politician's smile.]",
          responses: [
            { text: 'And the "ward tax"?', next: "tax" },
            { text: "Back to business.", next: "again" },
          ],
        },
        tax: {
          speaker: "Boss Croke",
          text: "Protection. Sanitation. Representation. Every business in the Fourth Ward pays a little into the widows' fund. I'm the widows' fund. It's honest graft, kid — as a wise man on this very block once said: \"I seen my opportunities and I took 'em.\"",
          responses: [{ text: "Back to business.", next: "again" }],
        },
        braves: {
          speaker: "Boss Croke",
          text: "Did they! Overzealous. The Braves are... enthusiastic about the democratic process. You got past them, which makes you either a voter or a problem. Let's find out which.",
          responses: [{ text: "Back to business.", next: "again" }],
        },
        mcs: {
          speaker: "Boss Croke",
          onEnter: () => EV.setFlag("heard_ledger", true),
          text: "Ah. The ale house. Deck sent you? Deck pays the ward tax like every business in the Fourth Ward — a few scrip, a keg of dark, and his very good mustard. He's been complaining for thirty years. It's a tradition. Like the wishbones.",
          responses: [
            {
              text: "[Persuasion 60] Your own voters drink at O'Rourke's. Squeeze it dry and you lose the Fourth Ward.",
              check: { skill: "persuasion", value: 60 },
              next: "exempt_speech",
              failNext: "mcs_fail",
            },
            {
              text: "[Trade 50] Let me buy O'Rourke's out. 200 scrip, and the tax is gone for good.",
              cond: () => scrip() >= 200,
              check: { skill: "trade", value: 50 },
              next: "exempt_bribe",
              failNext: "bribe_fail",
            },
            {
              text: "I've read your Black Book.",
              next: "blackmail",
              cond: () => K.has("pev_tam_ledger"),
            },
            { text: "What would it take?", next: "job" },
            { text: "Then we do this the hard way.", next: "fight" },
          ],
        },
        mcs_fail: {
          speaker: "Boss Croke",
          text: "Voters? Kid, the voters don't decide elections here. I decide elections here. The voters decide which bar to drink at afterward. Try again when you've got something I want.",
          responses: [
            { text: "What would it take?", next: "job" },
            { text: "Then we do this the hard way.", next: "fight" },
            { text: "I'll be back.", end: true },
          ],
        },
        exempt_speech: {
          speaker: "Boss Croke",
          text: "[He stares. He drums his fingers on the desk. Then he laughs, a long wet smoker's laugh.] You know, kid, you've got a future in politics. Fine. O'Rourke's is off the books. Tell Deck the Wigwam sends its regards — and that he can keep his damn mustard.",
          onEnter: () => exempt("speech"),
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        exempt_bribe: {
          speaker: "Boss Croke",
          text: "Two hundred scrip for a lifetime exemption? [He counts. Recounts.] Kid, that's the worst deal I've ever taken, and I once traded a Brooklyn ward for a sandwich. Done. O'Rourke's is clean.",
          onEnter: () => {
            K.scrip(-200);
            exempt("bribe");
          },
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        bribe_fail: {
          speaker: "Boss Croke",
          text: "Two hundred? For a whole ale house, forever? Kid, I charge more than that to not look at a building. No.",
          responses: [
            { text: "What would it take?", next: "job" },
            { text: "I'll be back.", end: true },
          ],
        },
        blackmail: {
          speaker: "Boss Croke",
          text: "[The smile goes.] Where did you — that's — [He lowers his voice.] Every deal since '51 is in that book. The aldermen. The Braves. The Iron Covenant's quartermaster. You hand that to the wrong people and the whole Machine comes down. ...What do you want?",
          responses: [
            {
              text: "Leave O'Rourke's alone. Forever. I keep the book as insurance.",
              next: "bm_keep",
              action: () => EV.setFlag("ledger_used", true),
            },
            {
              text: "Leave O'Rourke's alone, and I'll sell you the book back. 300 scrip.",
              next: "bm_sell",
            },
            {
              text: "[Persuasion 75] Step down. Leave the Wigwam. Let the East Village have a real election.",
              check: { skill: "persuasion", value: 75 },
              next: "resign",
              failNext: "resign_fail",
            },
          ],
        },
        bm_keep: {
          speaker: "Boss Croke",
          text: "Insurance. [He sags into his chair.] You're a Tammany man after all, kid, you just don't know it yet. Fine. O'Rourke's is off the books. Now get out of my office before I start liking you.",
          onEnter: () => exempt("ledger"),
          responses: [{ text: "Be good or be gone, Boss.", end: true }],
        },
        bm_sell: {
          speaker: "Boss Croke",
          text: "Three hundred — and O'Rourke's. [He slides a stack of scrip across the desk and holds out his hand for the book, fingers trembling.] Pleasure. Truly. Don't come back.",
          onEnter: () => {
            K.take("pev_tam_ledger", 1);
            K.scrip(300);
            EV.setFlag("ledger_used", true);
            exempt("ledger_sold");
          },
          responses: [{ text: "Goodbye, Boss.", end: true }],
        },
        resign: {
          speaker: "Boss Croke",
          text: "[A long silence. Then he stands, straightens his tie, and takes his derby off the hook.] Nineteen terms. Thirty-eight years. Not a bad run. Tell Deck... tell him the dark was always better. I'll be in Florida. I hear it's still there. [He puts the derby on your head, pats it twice, and walks out.]",
          onEnter: () => {
            EV.setFlag("boss_resigned", true);
            EV.setFlag("ledger_used", true);
            K.give("pev_croke_derby", 1);
            K.standing(30, "Ended Tammany Hall");
            exempt("resigned");
            EV.crokeLeave();
          },
          responses: [{ text: "Goodbye, Boss.", end: true }],
        },
        resign_fail: {
          speaker: "Boss Croke",
          text: "Step down? Kid, I've outlived the Republic. I'll outlive you. Take O'Rourke's — take it, it's yours — but the Wigwam stays mine.",
          onEnter: () => {
            EV.setFlag("ledger_used", true);
            exempt("ledger");
          },
          responses: [{ text: "We'll see.", end: true }],
        },
        job: {
          speaker: "Boss Croke",
          text: "Every ward needs a captain. Deck owes me this week's tax — a hundred and fifty scrip. He doesn't like my Braves; maybe he'll like you. Collect it, bring it here, and you keep a slice. That's honest graft, kid. First rung on the ladder.",
          responses: [
            {
              text: "Consider it done.",
              next: "job_yes",
              action: () => {
                q.start("pev_honest_graft");
                q.set("pev_honest_graft", "collect");
              },
            },
            { text: "I don't shake down bartenders.", next: "job_no" },
          ],
        },
        job_yes: {
          speaker: "Boss Croke",
          text: "Attaboy. And kid — if Deck gives you any lip, remind him who fixed his liquor license in 1952. (It was me. It's always me.)",
          responses: [{ text: "Right.", end: true }],
        },
        job_no: {
          speaker: "Boss Croke",
          text: "Principles! How refreshing. Nobody's had those in this building since 1929. Well, the door's over there, principles and all.",
          responses: [
            {
              text: "About O'Rourke's...",
              next: "mcs",
              cond: () => q.active("pev_honest_graft"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        deliver: {
          speaker: "Boss Croke",
          text: "[He weighs the envelope, sniffs it.] Onions. That's Deck, alright. Hundred and fifty — you're a natural. Here's your cut, and a little something for the lapel. Welcome to the Machine, kid.",
          onEnter: () => {
            if (!K.has("pev_tax_envelope")) return;
            K.take("pev_tax_envelope", 1);
            K.scrip(200);
            K.give("pev_tiger_pin", 1);
            K.standing(-50, "Collected Tammany's ward tax");
            EV.setFlag("graft_evil", true);
            K.q.complete("pev_honest_graft");
          },
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        threat: {
          speaker: "Boss Croke",
          text: "Shut it down? [He chuckles.] Kid, Tammany's been \"shut down\" by reformers, newspapers, the governor, the FBI and an atomic war. We're still here. You've got nothing on me.",
          responses: [
            {
              text: "I've got your Black Book.",
              next: "blackmail",
              cond: () => K.has("pev_tam_ledger"),
            },
            { text: "I've got a gun.", next: "fight" },
            { text: "Fair point. Goodbye.", end: true },
          ],
        },
        fight: {
          speaker: "Boss Croke",
          text: "BRAVES! We have a HECKLER!",
          onEnter: () => {
            EV.setFlag("croke_angry", true);
            setTimeout(hostile, 50);
          },
          responses: [{ text: "[Attack]", end: true }],
        },
        after: {
          speaker: "Boss Croke",
          text: "You again. You cost me a keg of dark a week and my good mood. I'll remember you on Election Day. Everybody votes on Election Day, kid. Even the ones who don't know it.",
          responses: [{ text: "Goodbye, Boss.", end: true }],
        },
      },
    });
    G.dialogue.register("pev_dlg_harriet", {
      start: () =>
        EV.flag("harriet_free")
          ? "free"
          : EV.flag("harriet_cell_open")
            ? "open"
            : "hello",
      nodes: {
        hello: {
          speaker: "Harriet Vance",
          onEnter: () => EV.setFlag("heard_harriet", true),
          text: 'You\'re not a Brave. — Harriet Vance. I ran against Croke for Alderman. First opponent in thirty-eight years. He counted the ballots, I got zero — including mine — and then he put me in here to "reconsider." I have not reconsidered.',
          responses: [
            { text: "I'll get you out.", next: "out" },
            { text: "Why run against him?", next: "why" },
            { text: "Good luck with that.", end: true },
          ],
        },
        why: {
          speaker: "Harriet Vance",
          text: "Because somebody has to. The Braves shake down every stall from Union Square to Houston. O'Rourke's pays in ale and mustard. The Beer Garden pays in hops. People are scared of him because nobody's ever voted against him and lived to brag about it. I'd like to brag about it.",
          responses: [{ text: "I'll get you out.", next: "out" }],
        },
        out: {
          speaker: "Harriet Vance",
          text: "The cell key's on the Boss's ring — or pick it, if you've got the hands. Get me out and I'll make my way to O'Rourke's. Deck will hide me. Then we'll see about an election.",
          responses: [{ text: "Hang on.", end: true }],
        },
        open: {
          speaker: "Harriet Vance",
          text: "The door's open. [She steps out, blinking.] You know how long I've been staring at that door? Thank you. I'm going to O'Rourke's. And then I'm going to win.",
          responses: [
            {
              text: "Go. I'll cover you.",
              next: "free",
              action: () => freeHarriet(),
            },
          ],
        },
        free: {
          speaker: "Harriet Vance",
          text: () =>
            EV.flag("boss_resigned") || EV.flag("boss_dead")
              ? "The Wigwam's empty. The Fourth Ward's having a real election for the first time in thirty-eight years. I'm going to lose it gracefully, or win it loudly."
              : "Vote Vance. Tell your friends. Tell your enemies. Tell the dead — they vote here, apparently.",
          responses: [{ text: "Good luck, Harriet.", end: true }],
        },
      },
    });
  }
  function freeHarriet() {
    if (EV.flag("harriet_free")) return;
    EV.setFlag("harriet_free", true);
    K.standing(40, "Freed Harriet Vance");
    K.xp(100, "Freed the opposition");
    K.notify("Harriet Vance heads for O'Rourke's.");
    const a =
      !G.isStub("actors") && G.actors.get && G.actors.get("pev_harriet");
    if (a && !a.dead)
      K.safe("hmove", () => {
        const m = EV.anchor("mcs", "npc5");
        G.actors.remove(a);
        if (m) spawnHarrietAtMcs();
      });
    K.safe("news", () => {
      if (!G.isStub("radio") && G.radio.addNews)
        G.radio.addNews(
          "Election news from the East Village, folks: Harriet Vance, the only person in thirty-eight years to run against Boss Croke of Tammany Hall, is out of Croke's cellar and back on the campaign trail. Somebody sprang her. The Boss is not amused. The rest of us are delighted.",
        );
    });
  }
  function spawnHarrietAtMcs() {
    const c = EV.ctxs.find((x) => x.id === "mcs");
    if (!c) return;
    // her own seat (O'Rourke's npc5: the far end of the back-room long table, across from Abigail — never npc2, Abigail's chair)
    const p = c.anchors.npc5;
    if (!p) return;
    EV.spawnActor(c, {
      id: "pev_harriet",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Harriet Vance",
      faction: "settlers",
      level: 5,
      essential: true,
      pos: { x: p.x, y: p.y, z: p.z },
      yaw: HP,
      ai: "sit",
      home: { x: p.x, z: p.z, r: 0.4 },
      dialogue: "pev_dlg_harriet",
      barks: [
        "Vote Vance!",
        "First opponent in thirty-eight years. Remember the name.",
      ],
    });
  }
  EV.crokeLeave = function () {
    const a = !G.isStub("actors") && G.actors.get && G.actors.get("pev_croke");
    if (a && !a.dead)
      K.safe("leave", () => {
        K.notify("Boss Croke walks out of Tammany Hall.");
        setTimeout(() => K.safe("rm", () => G.actors.remove(a)), 1500);
      });
    const h =
      !G.isStub("actors") && G.actors.get && G.actors.get("pev_tam_heeler");
    if (h && !h.dead)
      K.safe("leave2", () =>
        setTimeout(() => K.safe("rm2", () => G.actors.remove(h)), 1500),
      );
  };

  // ==================================================================
  // THE MACHINE: a NEUTRAL faction until Croke is crossed
  // ------------------------------------------------------------------
  // Tammany is a political machine, not a raider den: its Braves shake the
  // ward down but let voters walk in, so "Honest Graft" can be settled with
  // speech, bribes, blackmail or betrayal (FO3's Tenpenny Tower / NV's
  // Freeside Kings model). Everyone in the hall — Croke, the Ward Heeler and
  // the Braves combat's population puts in the cell for the 'tammany_hall'
  // location (group id 'tammany_hall') — is moved into the 'tammany'
  // faction (combat's relation() is 'neutral' for any unlisted pair, so they
  // neither attack the player nor the settlers/Harriet) and kept non-hostile
  // until the 'croke_angry' flag is set: Croke's "BRAVES!" line, the player
  // attacking any Brave (combat's factionAngered), or killing one.
  // (Core request filed in NOTES.md: make the LOCATION itself non-hostile.)
  // ==================================================================
  const TAM_FACTION = "tammany";
  const TAM_GROUP = "tammany_hall";
  let tamT = 0;
  function tamAngry() {
    return !!EV.flag("croke_angry");
  }
  function isTam(a) {
    return (
      !!a &&
      (a._pevTam ||
        a.group === TAM_GROUP ||
        a.id === "pev_croke" ||
        a.id === "pev_tam_heeler")
    );
  }
  function tamClaim(a, angry) {
    if (!a._pevTam) {
      a._pevTam = true;
      a.faction = TAM_FACTION;
      if (
        a.group === TAM_GROUP &&
        a.id !== "pev_croke" &&
        a.id !== "pev_tam_heeler"
      ) {
        const td =
          G.__cmb && G.__cmb.typeDef
            ? K.safe("td", () => G.__cmb.typeDef(a.type))
            : null;
        a.name = td && td.boss ? "Tammany Precinct Captain" : "Tammany Brave";
        if (!a.customBarks)
          a.customBarks = [
            "Vote early, vote often.",
            "Wipe your feet, voter.",
            "The Boss is in session.",
            "You registered? Doesn't matter. You are now.",
          ];
      }
    }
    if (a.hostOverride !== angry) a.setHostile(angry);
  }
  function tamScan() {
    if (G.isStub("actors") || !G.actors.list) return;
    const angry = tamAngry();
    K.safe("tamScan", () => {
      for (const a of G.actors.list())
        if (a && !a.dead && isTam(a)) tamClaim(a, angry);
    });
  }
  /** Croke is crossed: the whole Machine turns on the player (idempotent). */
  EV.tamAnger = function (why) {
    if (!tamAngry()) {
      EV.setFlag("croke_angry", why || true);
      K.notify("Tammany Hall is hostile.");
    }
    tamScan();
  };
  G.events.on("factionAngered", (f) => {
    if (f === TAM_FACTION) K.safe("tamAnger", () => EV.tamAnger("attacked"));
  });
  G.events.on("actorKilled", (a, killer) => {
    if (!a || !a._pevTam || tamAngry()) return;
    const byPlayer =
      killer === "player" ||
      killer === G.player ||
      (killer &&
        (killer.isPlayer ||
          killer.faction === "player" ||
          killer.following === "player"));
    if (byPlayer) K.safe("tamKill", () => EV.tamAnger("killed"));
  });

  // ==================================================================
  // SPAWN / UPDATE
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    setVault(ctx, !!EV.flag("tam_vault_open"), true);
    setCell(ctx, !!EV.flag("harriet_cell_open"));
    if (EV.flag("tam_drawer") && !EV.flag("tam_key_taken")) spawnKey();
    if (!EV.flag("ledger_taken"))
      K.safe("ledger", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup(
            "pev_tam_ledger",
            1,
            { x: A.ledger.x, y: A.ledger.y, z: A.ledger.z },
            { static: false, keepY: true, noSave: true },
          );
      });
    if (!EV.flag("boss_dead") && !EV.flag("boss_resigned")) {
      EV.spawnActor(ctx, {
        id: "pev_croke",
        type: "human",
        gender: "m",
        outfit: "merchant",
        name: "Boss Croke",
        faction: TAM_FACTION,
        hostile: tamAngry(),
        level: 10,
        hp: 240,
        pos: v(A.boss),
        yaw: 0,
        ai: "guard",
        home: "here",
        homeR: 2.5,
        dialogue: "pev_dlg_croke",
        voice: "settler",
        noRespawn: true,
        xp: 200,
        weapon: K.itemExists("44_magnum")
          ? "44_magnum"
          : K.itemExists("10mm_pistol")
            ? "10mm_pistol"
            : undefined,
        inventory: [
          ["pev_tam_vault_key", 1],
          ["pev_croke_derby", 1],
          ["scrip", 180],
        ],
        barks: [
          "Vote early, vote often!",
          "I seen my opportunities and I took 'em.",
          "Every ward needs a captain, kid.",
          "The widows' fund thanks you.",
        ],
        onDeath: () => {
          EV.setFlag("boss_dead", true);
          K.notify("Boss Croke is dead. Tammany Hall has lost its Sachem.");
          if (
            K.q.active("pev_honest_graft") &&
            ["talk", "tg_ledger", "tg_harriet", "collect", "deliver"].indexOf(
              K.q.stage("pev_honest_graft"),
            ) >= 0
          ) {
            EV.setFlag("mcs_exempt", "dead");
            K.q.set("pev_honest_graft", "return");
          }
        },
      });
      EV.spawnActor(ctx, {
        id: "pev_tam_heeler",
        type: "human",
        gender: "m",
        outfit: "raider_heavy",
        name: "Ward Heeler",
        faction: TAM_FACTION,
        hostile: tamAngry(),
        level: 9,
        pos: v(A.bodyguard),
        yaw: -HP,
        ai: "guard",
        home: "here",
        homeR: 2,
        noRespawn: true,
        weapon: K.itemExists("combat_shotgun") ? "combat_shotgun" : undefined,
        barks: [
          "The Boss is busy.",
          "Hands where I can see 'em, voter.",
          "You got an appointment?",
        ],
      });
    }
    if (!EV.flag("harriet_free")) {
      EV.spawnActor(ctx, {
        id: "pev_harriet",
        type: "human",
        gender: "f",
        outfit: "settler",
        name: "Harriet Vance",
        faction: "settlers",
        level: 5,
        essential: true,
        pos: v(A.captive),
        yaw: 0,
        ai: "static",
        home: "here",
        homeR: 0.5,
        dialogue: "pev_dlg_harriet",
        barks: ["Hey! You! Not a Brave, are you?", "Vote Vance!"],
      });
    } else spawnHarrietAtMcs();
    tamScan();
  }
  function update(dt, realDt, ctx) {
    tamT -= realDt;
    if (tamT <= 0) {
      tamT = 1;
      tamScan();
    }
    const v2 = ctx.vaultDoor;
    if (v2 && v2.opening) {
      v2.t += realDt;
      v2.pivot.rotation.y = -Math.min(1.9, v2.t * 0.8);
      if (v2.t > 2.4) v2.opening = false;
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  G.events.on("itemAdded", (id) => {
    if (id === "pev_tam_ledger") {
      EV.setFlag("ledger_taken", true);
      EV.setFlag("heard_ledger", true);
    }
    if (id === "pev_tam_vault_key") EV.setFlag("tam_key_taken", true);
    if (
      id === "pev_tax_envelope" &&
      K.q.active("pev_honest_graft") &&
      K.q.stage("pev_honest_graft") === "collect"
    )
      K.q.set("pev_honest_graft", "deliver");
  });

  EV.define({
    id: "tammany",
    name: "Tammany Hall",
    interior: "tammany_hall",
    order: 30,
    lift: 5,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
  });
})();
