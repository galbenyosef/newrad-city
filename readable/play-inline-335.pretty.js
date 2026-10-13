/* src/poi_eastvillage/10_cooper.js */
/* =====================================================================
 * NEW RAD CITY — poi_eastvillage / 10_cooper.js
 * THE COOPER UNION FOUNDATION BUILDING (Cooper Square) — hostile robots.
 *
 * EXTERIOR (site x 210..270, z 317..348, front on the south street):
 *   six-storey Italianate brownstone block — ground-floor arcade of round
 *   arches, rows of round-arched windows with keystones, string courses,
 *   a bracketed cornice, projecting central pavilion with COOPER UNION
 *   lettering, the rooftop observatory dome, the Ardent Robotics "Technical Academy"
 *   banners, the seated Peter Cooper statue in the forecourt.
 * INTERIOR (cell cooper_union): lobby with Peter Cooper's ROUND elevator
 *   shaft (built before elevators existed) and the sealed stair to the
 *   Great Hall → robotics workshop / machine shop (west), student lounge
 *   + main stair / Lecture Room 101 (east) → 2nd floor: library, chemistry
 *   lab, the Dean's office (override punch card) → basement: the GREAT
 *   HALL (Lincoln's 1860 speech; the robot "Professor Lincoln-Tron" still
 *   proctoring the final exam for a skeleton audience), backstage workshop
 *   (reward room) → back stairs up into the machine shop (loop).
 * Quest: "Right Makes Might" (giver: Abigail Hewitt at O'Rourke's).
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

  // exterior footprint
  const X0 = 214,
    X1 = 266,
    Z0 = 318,
    Z1 = 342,
    PZ = 343.2; // PZ: front of the central pavilion
  const PX0 = 233,
    PX1 = 247;
  const FL = [0, 5.5, 10, 14.5, 19]; // floor lines
  const CORN = 22.5,
    TOP = 23.4,
    PAR = 24.4;
  const DOOR_X = 240;
  // interior
  const F2 = 5.5,
    BY = -5.5;
  const SHUT = { x0: -2, x1: 2, z: -14 };

  // ==================================================================
  // ART CELLS
  // ==================================================================
  function ardentBanner() {
    return K.paint(
      "art",
      "cu_ardent_banner",
      256,
      768,
      function (x, X, Y, W, H) {
        x.fillStyle = "#1c3a5a";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#d8c070";
        x.fillRect(X + 10, Y + 10, W - 20, 6);
        x.fillRect(X + 10, Y + H - 16, W - 20, 6);
        x.strokeStyle = "#e8e0c8";
        x.lineWidth = 8;
        x.beginPath();
        x.arc(X + W / 2, Y + 150, 70, 0, 6.283);
        x.stroke();
        x.fillStyle = "#e8e0c8";
        x.font = "bold 64px Arial Black, sans-serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText("A", X + W / 2, Y + 152);
        x.font = "bold 40px Arial, sans-serif";
        x.fillText("ARDENT", X + W / 2, Y + 270);
        x.font = "bold 26px Arial, sans-serif";
        ["TECHNICAL", "ACADEMY", "", "COOPER", "UNION", "CAMPUS"].forEach(
          (t, i) => x.fillText(t, X + W / 2, Y + 340 + i * 40),
        );
        x.font = "italic 22px Georgia, serif";
        x.fillText("\"Tomorrow's", X + W / 2, Y + 620);
        x.fillText("Minds, Today's", X + W / 2, Y + 648);
        x.fillText('Machines"', X + W / 2, Y + 676);
        K.stains(x, X, Y, W, H, 14, 71, 0.5, [30, 20, 10]);
        K.streaks(x, X, Y, W, H, 20, 72, 0.4);
        // tears
        x.clearRect(X + W * 0.7, Y + H * 0.8, W * 0.3, H * 0.2);
      },
    );
  }
  function examScreen() {
    return K.paint(
      "neon",
      "cu_exam_screen",
      768,
      384,
      function (x, X, Y, W, H) {
        x.fillStyle = "#000";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#39ff7a";
        x.shadowColor = "#39ff7a";
        x.shadowBlur = 10;
        x.textAlign = "center";
        x.font = "bold 44px Courier New, monospace";
        x.fillText("FINAL EXAMINATION", X + W / 2, Y + 70);
        x.font = "bold 26px Courier New, monospace";
        x.fillText("CIVIL ENGINEERING 401 · SECTION B", X + W / 2, Y + 120);
        x.fillText("TIME REMAINING: 00:00:00", X + W / 2, Y + 190);
        x.fillText("OVERTIME: 11,571,840 MINUTES", X + W / 2, Y + 230);
        x.fillText("PENCILS DOWN.  PENCILS DOWN.", X + W / 2, Y + 290);
        x.font = "20px Courier New, monospace";
        x.fillText(
          "TRUANCY WILL RESULT IN EXPULSION  ·  PROCTOR SYSTEM v2.3",
          X + W / 2,
          Y + 345,
        );
        x.shadowBlur = 0;
        for (let yy = 0; yy < H; yy += 4) {
          x.fillStyle = "rgba(0,0,0,0.35)";
          x.fillRect(X, Y + yy, W, 2);
        }
      },
    );
  }
  function flagCell() {
    return K.paint("art", "cu_flag", 256, 160, function (x, X, Y, W, H) {
      for (let i = 0; i < 13; i++) {
        x.fillStyle = i % 2 ? "#e8e0d0" : "#8a2a22";
        x.fillRect(X, Y + (i * H) / 13, W, H / 13 + 1);
      }
      x.fillStyle = "#1e2e52";
      x.fillRect(X, Y, W * 0.42, (H * 7) / 13);
      x.fillStyle = "#e8e0d0";
      for (let j = 0; j < 5; j++)
        for (let i = 0; i < 6; i++) {
          x.beginPath();
          x.arc(X + 10 + i * 16 + (j % 2) * 8, Y + 9 + j * 16, 2.4, 0, 6.3);
          x.fill();
        }
      K.stains(x, X, Y, W, H, 8, 81, 0.5, [40, 30, 20]);
    });
  }
  function sealCell() {
    return K.paint("art", "cu_seal", 512, 512, function (x, X, Y, W, H) {
      x.fillStyle = "#b8ae98";
      x.fillRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H / 2;
      x.fillStyle = "#6a2a22";
      x.beginPath();
      x.arc(cx, cy, W * 0.46, 0, 6.3);
      x.fill();
      x.fillStyle = "#d8ceb4";
      x.beginPath();
      x.arc(cx, cy, W * 0.38, 0, 6.3);
      x.fill();
      x.fillStyle = "#2e3e52";
      x.beginPath();
      x.arc(cx, cy, W * 0.3, 0, 6.3);
      x.fill();
      x.fillStyle = "#e8dcb8";
      x.font = "bold 40px Georgia, serif";
      x.textAlign = "center";
      x.textBaseline = "middle";
      const txt =
        "THE COOPER UNION · FOR THE ADVANCEMENT OF SCIENCE AND ART · ";
      for (let i = 0; i < txt.length; i++) {
        const a = -PI / 2 + (i / txt.length) * PI * 2;
        x.save();
        x.translate(cx + Math.cos(a) * W * 0.42, cy + Math.sin(a) * W * 0.42);
        x.rotate(a + PI / 2);
        x.font = "bold 22px Georgia, serif";
        x.fillStyle = "#e8dcb8";
        x.fillText(txt[i], 0, 0);
        x.restore();
      }
      x.font = "bold 110px Georgia, serif";
      x.fillText("CU", cx, cy + 6);
      x.font = "bold 28px Georgia, serif";
      x.fillText("1859", cx, cy + 90);
      K.stains(x, X, Y, W, H, 20, 91, 0.5, [50, 40, 25]);
    });
  }
  function chalk(key, lines) {
    return K.paint("art", key, 512, 256, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      x.fillStyle = "rgba(235,235,225,0.85)";
      x.font = '22px "Comic Sans MS", "Segoe Print", cursive';
      x.textAlign = "left";
      lines.forEach((l, i) => x.fillText(l, X + 16, Y + 34 + i * 30));
      x.strokeStyle = "rgba(235,235,225,0.6)";
      x.lineWidth = 2;
      const r = K.rng(key);
      x.beginPath();
      x.moveTo(X + W * 0.62, Y + H * 0.7);
      for (let k = 0; k < 6; k++)
        x.lineTo(X + W * (0.62 + k * 0.06), Y + H * (0.7 - r() * 0.4));
      x.stroke();
    });
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  function exterior(ctx) {
    const b = K.builder({ name: "cu_ext", grime: 0.55 });
    const r = K.rng("cu_ext");
    const bs = [1.08, 0.86, 0.7]; // brownstone tint
    const trim = [1.18, 0.98, 0.8];
    const W = X1 - X0,
      D = Z1 - Z0;
    // walls
    b.face("brownstone", X0, 0, Z1, 1, 0, 0, 0, 1, 0, W, CORN, { tint: bs });
    b.face("brownstone", X1, 0, Z1, 0, 0, -1, 0, 1, 0, D, CORN, { tint: bs });
    b.face("brownstone", X0, 0, Z0, 0, 0, 1, 0, 1, 0, D, CORN, { tint: bs });
    b.face("brownstone", X1, 0, Z0, -1, 0, 0, 0, 1, 0, W, CORN, {
      tint: [0.66, 0.52, 0.44],
    });
    b.face("concrete_dark", X0, TOP, Z1, 1, 0, 0, 0, 0, -1, W, D, {
      uv: "top",
      tint: [0.45, 0.42, 0.4],
    });
    b.col(X0, 0, Z0, X1, PAR, Z1, { tag: "building" });
    // central pavilion (projects 1.2 m, rises to a taller parapet)
    b.boxMM("brownstone", PX0, 0, Z1, PX1, CORN, PZ, {
      tint: [0.82, 0.66, 0.55],
      faces: "sewt",
    });
    b.col(PX0, 0, Z1, PX1, PAR + 1.6, PZ, { tag: "building" });
    for (const qx of [PX0, PX1])
      for (let yy = 0.6; yy < CORN - 0.4; yy += 0.9) {
        const w = Math.round(yy / 0.9) % 2 ? 0.9 : 0.6;
        b.boxMM(
          "brownstone",
          qx - (qx === PX0 ? 0.08 : w - 0.08),
          yy,
          PZ - 0.4,
          qx + (qx === PX0 ? w - 0.08 : 0.08),
          yy + 0.8,
          PZ + 0.12,
          { tint: [0.74, 0.58, 0.48] },
        );
      }
    // plinth / water table
    b.boxMM("granite", X0 - 0.2, 0, Z1, X1 + 0.2, 0.6, Z1 + 0.25, {
      tint: [0.5, 0.46, 0.42],
    });
    b.boxMM("granite", PX0 - 0.2, 0, PZ, PX1 + 0.2, 0.6, PZ + 0.25, {
      tint: [0.5, 0.46, 0.42],
    });

    // --- south façade: 11 bays ---
    const NB = 11,
      BW = W / NB;
    const bayX = (k) => X0 + BW * (k + 0.5);
    const winState = () => {
      const u = r();
      return u < 0.28
        ? "broken"
        : u < 0.66
          ? "dark"
          : u < 0.78
            ? "boarded"
            : "glass";
    };
    for (let k = 0; k < NB; k++) {
      const x = bayX(k);
      const inPav = x > PX0 && x < PX1;
      const fz = inPav ? PZ : Z1;
      // ground-floor arcade: tall round arches between rusticated piers
      if (k === 5) {
        K.archWin(b, x, 0.02, fz, 0, 1, 3.6, 5.0, {
          state: "dark",
          surround: "brownstone",
          surroundTint: trim,
          fw: 0.3,
          depth: 0.3,
          sill: false,
          mullion: false,
        });
      } else {
        K.archWin(b, x, 0.6, fz, 0, 1, 3.0, 4.2, {
          state: k === 2 || k === 8 ? "boarded" : r() < 0.5 ? "broken" : "dark",
          surround: "brownstone",
          surroundTint: trim,
          fw: 0.26,
          depth: 0.28,
          sill: false,
        });
      }
      // upper floors: arched windows (2..4), shorter arched windows (5)
      for (let f = 1; f <= 3; f++)
        K.archWin(b, x, FL[f] + 0.9, fz, 0, 1, 1.7, 3.1, {
          state: winState(),
          surround: "brownstone",
          surroundTint: trim,
          paneTint: undefined,
        });
      K.archWin(b, x, FL[4] + 0.7, fz, 0, 1, 1.5, 2.3, {
        state: winState(),
        surround: "brownstone",
        surroundTint: trim,
        keystone: false,
      });
      // piers between bays (ground floor), with rustication grooves
      if (k < NB) {
        const px = X0 + BW * k;
        if (k > 0) {
          const pfz = px >= PX0 && px <= PX1 ? PZ : Z1;
          b.boxMM("brownstone", px - 0.5, 0.6, pfz, px + 0.5, 5.3, pfz + 0.3, {
            tint: trim,
          });
          for (let yy = 1.2; yy < 5.2; yy += 0.6)
            b.boxMM(
              "paint_black",
              px - 0.52,
              yy,
              pfz + 0.3,
              px + 0.52,
              yy + 0.04,
              pfz + 0.31,
              { tint: [0.2, 0.15, 0.12] },
            );
        }
      }
    }
    // the entrance: double doors + fanlight + lamps
    b.boxMM(
      "wood_dark",
      DOOR_X - 1.5,
      0,
      PZ + 0.02,
      DOOR_X + 1.5,
      3.3,
      PZ + 0.12,
      { tint: [0.35, 0.22, 0.14] },
    );
    b.boxMM(
      "wood_dark",
      DOOR_X - 0.04,
      0,
      PZ + 0.12,
      DOOR_X + 0.04,
      3.3,
      PZ + 0.2,
      { tint: [0.2, 0.12, 0.08] },
    );
    for (const s of [-1, 1]) {
      b.boxMM(
        "brass",
        DOOR_X + s * 0.3 - 0.03,
        1.1,
        PZ + 0.12,
        DOOR_X + s * 0.3 + 0.03,
        1.5,
        PZ + 0.2,
        {},
      );
      for (let yy = 0.5; yy < 3.2; yy += 0.9)
        b.boxMM(
          "wood_dark",
          DOOR_X + s * 0.75 - 0.6,
          yy,
          PZ + 0.12,
          DOOR_X + s * 0.75 + 0.6,
          yy + 0.7,
          PZ + 0.16,
          { tint: [0.28, 0.18, 0.11] },
        );
    }
    b.plate(
      "art",
      DOOR_X,
      2.2,
      PZ + 0.21,
      0,
      1,
      1.9,
      0.9,
      K.signCell("cu_exam_door", "EXAMINATION\nIN PROGRESS", 384, 180, {
        bg: "#e0b020",
        fg: "#1a1a1a",
        font: "Arial Black, sans-serif",
        border: "#1a1a1a",
      }),
    );
    for (const s of [-1, 1]) {
      b.cyl("black_iron", DOOR_X + s * 2.3, 3.2, PZ + 0.4, 0.18, 0.12, 0.5, 8);
      b.glow(DOOR_X + s * 2.3, 3.55, PZ + 0.45, [0.6, 0.75, 1], 1.2);
      b.geo("lamp", K.sphereGeo(), {
        x: DOOR_X + s * 2.3,
        y: 3.55,
        z: PZ + 0.4,
        s: 0.12,
        tint: [0.7, 0.85, 1],
      });
    }
    // steps up to the door
    for (let i = 0; i < 3; i++)
      b.boxMM(
        "granite",
        DOOR_X - 2.4 + i * 0.2,
        0,
        PZ + 1.2 - i * 0.4,
        DOOR_X + 2.4 - i * 0.2,
        0.15 * (i + 1),
        PZ + 1.6 - i * 0.4,
        { tint: [0.55, 0.52, 0.48] },
      );
    b.col(DOOR_X - 2.4, 0, PZ, DOOR_X + 2.4, 0.15, PZ + 1.6, { tag: "steps" });
    // string courses
    for (let f = 1; f <= 4; f++) {
      b.boxMM(
        "brownstone",
        X0 - 0.15,
        FL[f] - 0.05,
        Z1,
        PX0,
        FL[f] + 0.3,
        Z1 + 0.3,
        { tint: trim },
      );
      b.boxMM(
        "brownstone",
        PX1,
        FL[f] - 0.05,
        Z1,
        X1 + 0.15,
        FL[f] + 0.3,
        Z1 + 0.3,
        { tint: trim },
      );
      b.boxMM(
        "brownstone",
        PX0 - 0.15,
        FL[f] - 0.05,
        PZ,
        PX1 + 0.15,
        FL[f] + 0.3,
        PZ + 0.3,
        { tint: trim },
      );
      b.boxMM(
        "brownstone",
        X1,
        FL[f] - 0.05,
        Z0 - 0.15,
        X1 + 0.3,
        FL[f] + 0.3,
        Z1 + 0.15,
        { tint: trim },
      );
      b.boxMM(
        "brownstone",
        X0 - 0.3,
        FL[f] - 0.05,
        Z0 - 0.15,
        X0,
        FL[f] + 0.3,
        Z1 + 0.15,
        { tint: trim },
      );
    }
    // cornice + parapet
    K.cornice(b, X0, Z1, PX0, Z1, CORN, 0, 1, {
      mat: "brownstone",
      tint: trim,
      depth: 0.9,
      h: 0.9,
      brackets: 1.2,
    });
    K.cornice(b, PX1, Z1, X1, Z1, CORN, 0, 1, {
      mat: "brownstone",
      tint: trim,
      depth: 0.9,
      h: 0.9,
      brackets: 1.2,
    });
    K.cornice(b, PX0, PZ, PX1, PZ, CORN, 0, 1, {
      mat: "brownstone",
      tint: trim,
      depth: 0.9,
      h: 0.9,
      brackets: 1.2,
    });
    K.cornice(b, X1, Z1, X1, Z0, CORN, 1, 0, {
      mat: "brownstone",
      tint: trim,
      depth: 0.9,
      h: 0.9,
      brackets: 1.2,
    });
    K.cornice(b, X0, Z0, X0, Z1, CORN, -1, 0, {
      mat: "brownstone",
      tint: trim,
      depth: 0.9,
      h: 0.9,
      brackets: 1.2,
    });
    K.cornice(b, X1, Z0, X0, Z0, CORN, 0, -1, {
      mat: "brownstone",
      tint: [0.6, 0.48, 0.4],
      depth: 0.6,
      h: 0.9,
      brackets: 0,
    });
    b.boxMM("brownstone", X0, TOP, Z1 - 0.4, X1 - 7, PAR, Z1, { tint: trim }); // parapet (east end collapsed)
    b.boxMM("brownstone", X0, TOP, Z0, X0 + 0.4, PAR, Z1, { tint: trim });
    b.boxMM("brownstone", X0, TOP, Z0, X1, PAR, Z0 + 0.4, { tint: trim });
    // pavilion attic with the lettering
    b.boxMM("brownstone", PX0, TOP, Z1 - 0.4, PX1, PAR + 1.6, PZ, {
      tint: [0.82, 0.66, 0.55],
    });
    K.cornice(b, PX0, PZ, PX1, PZ, PAR + 1.4, 0, 1, {
      mat: "brownstone",
      tint: trim,
      depth: 0.4,
      h: 0.5,
      brackets: 0,
    });
    K.letters(b, DOOR_X, TOP + 1.05, PZ, 0, 1, 12.5, 1.25, "COOPER UNION", {
      fg: "#efe4c8",
      font: 'Georgia, "Times New Roman", serif',
    });
    K.letters(
      b,
      DOOR_X,
      FL[1] + 0.62,
      PZ + 0.3,
      0,
      1,
      13.2,
      0.5,
      "FOR THE ADVANCEMENT OF SCIENCE AND ART",
      { fg: "#e8dcc0", size: 0.62 },
    );
    // side lettering on the frieze band
    K.letters(
      b,
      (X0 + PX0) / 2,
      CORN - 0.55,
      Z1,
      0,
      1,
      14,
      0.7,
      "FOUNDATION BUILDING",
      { fg: "#dcd0b0", size: 0.6 },
    );
    K.letters(
      b,
      (PX1 + X1) / 2,
      CORN - 0.55,
      Z1,
      0,
      1,
      14,
      0.7,
      "ERECTED MDCCCLIX",
      { fg: "#dcd0b0", size: 0.6 },
    );

    // --- east / west façades: 5 bays ---
    for (const side of [-1, 1]) {
      const fx = side > 0 ? X1 : X0;
      for (let k = 0; k < 5; k++) {
        const z = Z0 + (D / 5) * (k + 0.5);
        K.archWin(b, fx, 0.6, z, side, 0, 2.6, 4.0, {
          state: r() < 0.5 ? "boarded" : "dark",
          surround: "brownstone",
          surroundTint: trim,
          fw: 0.24,
        });
        for (let f = 1; f <= 3; f++)
          K.archWin(b, fx, FL[f] + 0.9, z, side, 0, 1.7, 3.1, {
            state: winState(),
            surround: "brownstone",
            surroundTint: trim,
          });
        K.archWin(b, fx, FL[4] + 0.7, z, side, 0, 1.5, 2.3, {
          state: winState(),
          surround: "brownstone",
          surroundTint: trim,
          keystone: false,
        });
      }
    }
    // --- north (rear) façade: plain arched windows ---
    for (let k = 0; k < NB; k++) {
      const x = bayX(k);
      for (let f = 0; f <= 4; f++)
        K.archWin(
          b,
          x,
          FL[f] + (f ? 0.9 : 0.8),
          Z0,
          0,
          -1,
          1.6,
          f === 4 ? 2.2 : 3.0,
          {
            state: r() < 0.4 ? "boarded" : "dark",
            surround: "brownstone",
            surroundTint: [0.6, 0.48, 0.4],
            keystone: false,
          },
        );
    }

    // --- roof: the observatory drum & dome, Ardent antenna, skylights, water tank ---
    const OX = 240,
      OZ = 329;
    b.cyl("brownstone", OX, TOP, OZ, 3.4, 3.4, 3.0, 20, { tint: trim });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * PI * 2;
      K.archWin(
        b,
        OX + Math.cos(a) * 3.42,
        TOP + 0.6,
        OZ - Math.sin(a) * 3.42,
        Math.cos(a),
        -Math.sin(a),
        0.9,
        1.8,
        {
          state: "dark",
          surround: "brownstone",
          surroundTint: trim,
          fw: 0.12,
          depth: 0.12,
          keystone: false,
          sill: false,
          seg: 5,
        },
      );
    }
    b.cyl("brownstone", OX, TOP + 3.0, OZ, 3.7, 3.7, 0.35, 20, { tint: trim });
    b.geo("copper", K.sphereGeo(), {
      x: OX,
      y: TOP + 3.35,
      z: OZ,
      sx: 3.4,
      sy: 3.0,
      sz: 3.4,
      tint: [0.36, 0.6, 0.5],
    });
    b.boxMM(
      "paint_black",
      OX - 0.45,
      TOP + 3.6,
      OZ + 1.6,
      OX + 0.45,
      TOP + 6.1,
      OZ + 2.6,
      { tint: [0.05, 0.05, 0.05] },
    ); // open slit
    b.col(OX - 3.4, TOP, OZ - 3.4, OX + 3.4, TOP + 6.4, OZ + 3.4, {
      tag: "building",
    });
    // lattice antenna mast (Ardent relay)
    const AX = 222,
      AZ = 324;
    for (const [dx, dz] of [
      [-0.6, -0.6],
      [0.6, -0.6],
      [0.6, 0.6],
      [-0.6, 0.6],
    ])
      b.pipe(
        "rust",
        AX + dx,
        TOP,
        AZ + dz,
        AX + dx * 0.15,
        TOP + 13,
        AZ + dz * 0.15,
        0.05,
        4,
      );
    for (let yy = 1.5; yy < 13; yy += 1.6) {
      const f = 1 - yy / 15;
      b.boxMM(
        "rust",
        AX - 0.62 * f,
        TOP + yy,
        AZ - 0.62 * f,
        AX + 0.62 * f,
        TOP + yy + 0.06,
        AZ + 0.62 * f,
        { faces: "nsew" },
      );
    }
    b.geo("lamp", K.sphereGeo(), {
      x: AX,
      y: TOP + 13.3,
      z: AZ,
      s: 0.18,
      tint: [1, 0.15, 0.1],
    });
    b.glow(AX, TOP + 13.3, AZ, [1, 0.12, 0.08], 3.5);
    b.pipe("rust", AX, TOP + 12.5, AZ, AX + 2.5, TOP + 11, AZ + 1, 0.02, 3);
    b.cyl("metal", AX + 2.6, TOP + 10.2, AZ + 1, 0.8, 0.9, 0.3, 12, {
      tint: [0.6, 0.62, 0.6],
    }); // dish
    // skylight boxes & a water tank on stilts
    for (const sx of [228, 252]) {
      b.boxMM("metal_dark", sx - 2.5, TOP, 322, sx + 2.5, TOP + 0.9, 336, {
        tint: [0.4, 0.4, 0.4],
      });
      b.quad(
        "glass",
        [sx - 2.4, TOP + 0.91, 336],
        [sx + 2.4, TOP + 0.91, 336],
        [sx + 2.4, TOP + 1.6, 329],
        [sx - 2.4, TOP + 1.6, 329],
        { tint: [0.35, 0.45, 0.45] },
      );
    }
    for (const [dx, dz] of [
      [-1.2, -1.2],
      [1.2, -1.2],
      [1.2, 1.2],
      [-1.2, 1.2],
    ])
      b.pipe(
        "rust",
        258 + dx,
        TOP,
        322 + dz,
        258 + dx,
        TOP + 3,
        322 + dz,
        0.08,
        5,
      );
    b.cyl("wood_rotten", 258, TOP + 3, 322, 1.9, 1.9, 3.2, 14, {
      tint: [0.6, 0.5, 0.4],
    });
    b.cyl("wood_rotten", 258, TOP + 6.2, 322, 2.0, 0.2, 1.2, 14, {
      tint: [0.5, 0.42, 0.34],
    });
    // collapsed south-east roof corner: broken parapet, girders, rubble below
    for (let k = 0; k < 6; k++)
      b.box(
        "brownstone",
        X1 - 6.5 + k * 1.1,
        TOP - 0.3 - r() * 0.6,
        Z1 - 0.6 - r() * 3,
        1.0,
        0.4 + r() * 0.8,
        0.9,
        { yaw: r() * 0.6, tint: trim },
      );
    for (let k = 0; k < 4; k++)
      b.beam(
        "rust",
        X1 - 5 + k * 1.3,
        TOP - 1,
        Z1 - 4,
        X1 - 4.6 + k * 1.1,
        TOP + 1.5 + r(),
        Z1 - 0.5,
        0.18,
        0.28,
      );
    b.burn(X1 - 3, TOP - 2, Z1, 5, 0.8);
    b.burn(X0 + 12, 8, Z1, 4, 0.55);
    b.burn(DOOR_X + 6, 2.5, PZ, 3, 0.45);
    K.rubble(b, X1 - 2, 0, Z1 + 3, 2.6, 1.4, {
      seed: 7,
      mat: "rubble",
      tint: [0.72, 0.6, 0.52],
    });
    b.box("brownstone", X1 - 5.5, 0, Z1 + 3.6, 3.2, 0.9, 1.1, {
      yaw: 0.35,
      tint: trim,
    }); // fallen cornice block
    b.box("brownstone", X1 - 1.2, 0, Z1 + 5.4, 1.8, 0.7, 0.9, {
      yaw: -0.8,
      tint: trim,
    });
    // Ardent Robotics banners either side of the pavilion
    const ban = ardentBanner();
    for (const bx of [PX0 - 1.2, PX1 + 1.2]) {
      b.beam(
        "black_iron",
        bx,
        FL[4] - 0.2,
        Z1,
        bx,
        FL[4] - 0.2,
        Z1 + 1.1,
        0.06,
        0.06,
      );
      b.quad(
        "art",
        [bx - 0.9, FL[2] - 0.6, Z1 + 1.05],
        [bx + 0.9, FL[2] - 0.6, Z1 + 1.05],
        [bx + 0.9, FL[4] - 0.3, Z1 + 1.05],
        [bx - 0.9, FL[4] - 0.3, Z1 + 1.05],
        { rect: ban, tint: [0.9, 0.9, 0.9], grime: 0.2 },
      );
      b.quad(
        "fabric",
        [bx + 0.9, FL[2] - 0.6, Z1 + 1.04],
        [bx - 0.9, FL[2] - 0.6, Z1 + 1.04],
        [bx - 0.9, FL[4] - 0.3, Z1 + 1.04],
        [bx + 0.9, FL[4] - 0.3, Z1 + 1.04],
        { tint: [0.14, 0.24, 0.36], grime: 0.3 },
      );
    }
    // graffiti & robot scorch marks
    b.plate(
      "decal",
      222,
      2.2,
      Z1 + 0.31,
      0,
      1,
      4.2,
      1.1,
      K.tag("ROBOTS FLUNKED US ALL", "#e8e040", 512, 96, { rot: -0.03 }),
    );
    b.plate(
      "decal",
      257,
      1.6,
      Z1 + 0.31,
      0,
      1,
      2.8,
      1.0,
      K.tag("NO TRUANTS", "#e04030", 256, 96, { rot: 0.05 }),
    );
    for (let k = 0; k < 6; k++)
      b.plate(
        "decal",
        236 + r() * 10,
        1 + r() * 3,
        PZ + 0.32,
        0,
        1,
        0.8,
        0.8,
        K.decal("scorch", k),
      );

    // --- forecourt: paving, iron railings, the seated Peter Cooper statue ---
    b.boxMM("sidewalk", X0, 0, Z1, X1, 0.12, 348, {
      tint: [0.72, 0.7, 0.66],
      faces: "sewt",
    });
    b.col(X0, 0, Z1, X1, 0.12, 348, { tag: "floor", surface: "concrete" });
    const SX = 225,
      SZ = 345.4;
    b.boxMM("granite", SX - 1.6, 0.12, SZ - 1.2, SX + 1.6, 0.5, SZ + 1.2, {
      tint: [0.52, 0.5, 0.47],
    });
    b.boxMM("granite", SX - 1.25, 0.5, SZ - 0.9, SX + 1.25, 2.3, SZ + 0.9, {
      tint: [0.6, 0.58, 0.54],
    });
    b.boxMM("granite", SX - 1.4, 2.3, SZ - 1.05, SX + 1.4, 2.55, SZ + 1.05, {
      tint: [0.55, 0.53, 0.5],
    });
    K.letters(b, SX, 1.5, SZ + 0.9, 0, 1, 2.3, 0.45, "PETER COOPER", {
      fg: "#d8d0c0",
      size: 0.7,
    });
    K.statueFigure(b, SX, 2.55, SZ + 0.1, PI, {
      seated: true,
      scale: 1.25,
      tint: [0.36, 0.48, 0.4],
    });
    b.col(SX - 1.6, 0, SZ - 1.2, SX + 1.6, 4.8, SZ + 1.2, { tag: "statue" });
    K.railing(b, X0 + 0.3, 347.6, SX - 3, 347.6, 0.12, {
      h: 1.0,
      mat: "black_iron",
      handMat: "black_iron",
      step: 0.18,
    });
    K.railing(b, SX + 3, 347.6, PX0 - 2.8, 347.6, 0.12, {
      h: 1.0,
      mat: "black_iron",
      handMat: "black_iron",
      step: 0.18,
    });
    K.railing(b, PX1 + 2.8, 347.6, X1 - 6, 347.6, 0.12, {
      h: 1.0,
      mat: "black_iron",
      handMat: "black_iron",
      step: 0.18,
    });
    // Ardent charging pod by the door (the proctors' parking spot)
    const CPX = 250.5,
      CPZ = 344.4;
    b.boxMM("metal", CPX - 0.9, 0.12, CPZ - 0.7, CPX + 0.9, 2.6, CPZ + 0.7, {
      tint: [0.55, 0.6, 0.66],
      faces: "nsewt",
    });
    b.boxMM(
      "paint_black",
      CPX - 0.7,
      0.3,
      CPZ + 0.7,
      CPX + 0.7,
      2.3,
      CPZ + 0.72,
      { tint: [0.05, 0.05, 0.06] },
    );
    b.plate("lamp", CPX, 2.45, CPZ + 0.73, 0, 1, 1.4, 0.18, null, {
      tint: [0.3, 0.8, 1.0],
    });
    b.glow(CPX, 2.45, CPZ + 0.9, [0.3, 0.7, 1], 1.6);
    b.plate(
      "art",
      CPX,
      1.3,
      CPZ + 0.74,
      0,
      1,
      1.2,
      0.5,
      K.signCell("cu_pod", "PROCTOR UNIT\nCHARGING", 256, 110, {
        bg: "#1c3a5a",
        fg: "#e8e0c8",
        font: "Arial, sans-serif",
      }),
    );
    b.col(CPX - 0.9, 0, CPZ - 0.7, CPX + 0.9, 2.6, CPZ + 0.7, {
      tag: "prop",
      surface: "metal",
    });
    K.skel(ctx, CPX - 1.6, 0.12, CPZ + 1.1, 2.2, "reaching", { world: true });
    K.litter(b, X0 + 1, Z1 + 0.6, X1 - 1, 347.4, 0.12, 30, 311);
    for (let k = 0; k < 5; k++)
      b.hplate(
        "decal",
        X0 + 4 + r() * 44,
        0.135 + k * 0.001,
        Z1 + 1 + r() * 4,
        1.2,
        1.2,
        r() * 6,
        K.decal(k % 2 ? "scorch" : "grime", 40 + k),
      );

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_cooper_ext";
    K.anchor(ctx, "door", DOOR_X, 0.12, PZ + 1.8, false);
    K.anchor(ctx, "statue", SX, 0.12, SZ + 2, false);
    K.loot(ctx, "trash_can", X0 + 3, 0.12, 346.5, 0, {
      world: true,
      loot: "trash_can",
    });
    K.loot(ctx, "mailbox", X1 - 8, 0.12, 346.8, PI, {
      world: true,
      loot: "newspaper_box",
      name: "Newspaper Box",
    });
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "cu_int",
      off: O,
      lit: true,
      amb: [0.1, 0.1, 0.105],
      floors: [0, F2, BY, BY + 1],
      grime: 0.5,
    });
    const r = K.rng("cu_int");
    const cream = [0.95, 0.88, 0.72],
      panel = [0.42, 0.28, 0.18],
      cold = [0.75, 0.88, 1.0],
      warm = [1, 0.8, 0.55];

    // -------------------------------------------------- gaps (shared by rooms on the same wall line)
    K.gap(ctx, 0, 0, 2.4, 0, 3.4); // street doors (south wall of the lobby)
    K.gap(ctx, -8, -5, 2.2, 0, 2.8); // lobby ↔ robotics workshop
    K.gap(ctx, 8, -5, 2.2, 0, 2.8); // lobby ↔ student lounge
    K.gap(ctx, 0, -14, 4, 0, 3.2, { casing: false }); // lobby ↔ Great Hall stair (security shutter)
    K.gap(ctx, -16, -16, 2, 0, 2.6); // workshop ↔ machine shop
    K.gap(ctx, 12, -14, 1.6, 0, 2.6); // lounge ↔ lecture room
    K.gap(ctx, 0, -24, 3.6, BY, 3.0, { casing: false }); // stair → Great Hall
    K.gap(ctx, -18, -34, 1.6, BY, 2.6); // hall ↔ basement corridor
    K.gap(ctx, -18, -58, 1.6, BY, 2.4); // corridor ↔ backstage
    K.gap(ctx, -8, -54, 1.4, BY + 1, 2.4); // backstage ↔ stage
    K.gap(ctx, -22.6, -30, 2.6, BY, 2.6, { casing: false }); // corridor ↔ back stairwell
    K.gap(ctx, 6, -6, 2, F2, 2.8); // library ↔ chemistry lab
    K.gap(ctx, 6, -22, 1.4, F2, 2.4); // library ↔ dean's office
    K.gap(ctx, 10, -14, 1.4, F2, 2.4); // chem lab ↔ dean's office

    const LB = [-8.1, -0.3, -14.1, 8.1, 5.0, 0.1]; // lobby light box
    // ================================================= LOBBY
    K.room(b, ctx, {
      x0: -8,
      z0: -14,
      x1: 8,
      z1: 0,
      y: 0,
      h: 5.0,
      floor: "terrazzo",
      fc: [0.8, 0.78, 0.74],
      wall: "plaster",
      wc: cream,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.2,
      ceil: "tin",
      cc: [0.62, 0.6, 0.55],
      cornice: true,
    });
    b.hplate("art", 0, 0.012, -4.2, 4.2, 4.2, 0, sealCell()); // the seal set into the terrazzo
    for (const [cx, cz] of [
      [-4.5, -3.5],
      [4.5, -3.5],
      [-4.5, -10.5],
      [4.5, -10.5],
    ]) {
      K.column(b, cx, 0, cz, 0.22, 5.0, {
        kind: "iron",
        mat: "cast_iron",
        tint: [0.55, 0.55, 0.5],
      });
      b.col(cx - 0.25, 0, cz - 0.25, cx + 0.25, 5, cz + 0.25, {});
    }
    // Peter Cooper's round elevator shaft (1853 — before anyone had built an elevator to put in it)
    const EX = 0,
      EZ = -9,
      ER = 1.8;
    const gate0 = -HP - 0.5,
      gate1 = -HP + 0.5;
    K.ringWall(
      b,
      "brick_red",
      EX,
      EZ,
      ER,
      0,
      10.5,
      gate1,
      gate0 + PI * 2,
      18,
      false,
      { tint: [0.62, 0.42, 0.34] },
    );
    K.ringWall(
      b,
      "brick_red",
      EX,
      EZ,
      ER - 0.25,
      0,
      10.5,
      gate1,
      gate0 + PI * 2,
      18,
      true,
      { tint: [0.25, 0.18, 0.15], col: false },
    );
    b.face(
      "paint_black",
      EX - ER,
      0.01,
      EZ + ER,
      1,
      0,
      0,
      0,
      0,
      -1,
      ER * 2,
      ER * 2,
      { uv: "top", tint: [0.1, 0.1, 0.1] },
    );
    for (const yy of [0, F2]) {
      // gate: iron bars across the opening + brass surround
      const gx0 = EX + Math.cos(gate0) * ER,
        gz0 = EZ - Math.sin(gate0) * ER,
        gx1 = EX + Math.cos(gate1) * ER,
        gz1 = EZ - Math.sin(gate1) * ER;
      for (let k = 0; k <= 8; k++) {
        const t = k / 8,
          gx = gx0 + (gx1 - gx0) * t,
          gz = gz0 + (gz1 - gz0) * t;
        b.pipe("black_iron", gx, yy, gz, gx, yy + 2.6, gz, 0.018, 4);
      }
      b.beam("brass", gx0, yy + 2.65, gz0, gx1, yy + 2.65, gz1, 0.12, 0.1);
      b.beam("brass", gx0, yy + 1.3, gz0, gx1, yy + 1.3, gz1, 0.05, 0.04);
      b.col(
        Math.min(gx0, gx1),
        yy,
        Math.min(gz0, gz1) - 0.1,
        Math.max(gx0, gx1),
        yy + 2.7,
        Math.max(gz0, gz1) + 0.1,
        { walkable: false },
      );
    }
    // the car, stuck between the ground floor and the library
    b.boxMM("wood_dark", EX - 1.1, 3.4, EZ - 1.1, EX + 1.1, 5.9, EZ + 1.1, {
      tint: [0.45, 0.3, 0.2],
      faces: "nsewtb",
    });
    b.pipe("steel", EX, 5.9, EZ, EX, 10.5, EZ, 0.03, 4);
    b.plate(
      "art",
      EX,
      1.9,
      EZ + ER + 0.35,
      0,
      1,
      1.3,
      0.8,
      K.signCell(
        "cu_shaft_plaque",
        "THE ROUND SHAFT\nBuilt by Peter Cooper, 1853,\nbefore the passenger elevator\nwas invented. He was sure\nsomeone would invent one.",
        320,
        200,
        {
          bg: "#5a4020",
          fg: "#e8d8a8",
          font: "Georgia, serif",
          border: "#c8a050",
        },
      ),
    );
    b.boxMM(
      "brass",
      EX - 0.7,
      1.45,
      EZ + ER + 0.25,
      EX + 0.7,
      2.35,
      EZ + ER + 0.33,
      {},
    );
    // reception desk & a deactivated receptionist bot
    b.boxMM("wood_dark", -6.8, 0, -2.6, -3.2, 1.1, -1.6, { tint: panel });
    b.boxMM("marble", -6.9, 1.1, -2.7, -3.1, 1.16, -1.5, {
      tint: [0.8, 0.78, 0.74],
    });
    b.col(-6.9, 0, -2.7, -3.1, 1.16, -1.5, { tag: "counter" });
    b.geo("steel", K.sphereGeo(), {
      x: -5.2,
      y: 1.45,
      z: -2.1,
      s: 0.3,
      tint: [0.55, 0.58, 0.6],
    });
    b.pipe("steel", -5.2, 1.4, -2.1, -5.5, 1.2, -1.9, 0.03, 4);
    b.geo("lamp", K.sphereGeo(), {
      x: -5.1,
      y: 1.5,
      z: -1.82,
      s: 0.05,
      tint: [0.3, 0.3, 0.3],
    });
    b.plate(
      "art",
      -5,
      1.35,
      -1.49,
      0,
      1,
      1.4,
      0.3,
      K.signCell("cu_info", "INFORMATION", 256, 56, {
        bg: "#1c3a5a",
        fg: "#e8e0c8",
        font: "Arial, sans-serif",
      }),
    );
    // bulletin board & portraits
    b.boxMM("cloth_green", 1.2, 1.3, -0.14, 5.8, 2.6, -0.1, {
      tint: [0.35, 0.3, 0.2],
    });
    for (let k = 0; k < 9; k++)
      b.plate(
        "flat",
        1.6 + (k % 5) * 0.9 + r() * 0.2,
        1.55 + Math.floor(k / 5) * 0.55 + r() * 0.1,
        -0.16,
        0,
        -1,
        0.4 + r() * 0.2,
        0.45,
        null,
        { tint: [0.85, 0.82, 0.7] },
      );
    b.plate(
      "art",
      3.5,
      2.95,
      -0.14,
      0,
      -1,
      3.2,
      0.5,
      K.signCell("cu_finals", "WINTER FINALS · MAR 5–10, 1967", 512, 80, {
        bg: "#e8e0c8",
        fg: "#7a1a10",
        font: "Arial Black, sans-serif",
      }),
    );
    K.framed(b, -7.88, 2.9, -7.5, 1, 0, 1.1, 1.4, K.painting(2, 160, 200), {
      frame: "gold",
    });
    K.framed(b, 7.88, 2.9, -7.5, -1, 0, 1.1, 1.4, K.painting(10, 160, 200), {
      frame: "gold",
    });
    b.plate(
      "neon",
      0,
      3.9,
      -13.88,
      0,
      1,
      3.6,
      0.5,
      K.neonCell("cu_hall_neon", "THE GREAT HALL ↓", 512, 72, {
        color: "#ffb040",
        font: "Georgia, serif",
      }),
      { tint: [0.6, 0.6, 0.6] },
    );
    // Proctor access panel (terminal on the wall beside the shutter)
    K.terminal(
      ctx,
      "pev_term_cu_panel",
      3.0,
      1.2,
      -13.85,
      0,
      termPanel(),
      "wall",
    );
    b.boxMM("paint_yellow", 2.4, 0.8, -13.9, 3.6, 2.0, -13.86, {
      tint: [0.8, 0.6, 0.15],
    });
    // bust of Peter Cooper on a plinth, benches, a trophy case, the Ardent Robotics partnership banner
    b.boxMM("marble", -6.9, 0, -12.9, -5.9, 1.2, -11.9, {
      tint: [0.78, 0.76, 0.72],
    });
    b.col(-6.9, 0, -12.9, -5.9, 1.2, -11.9, {});
    b.geo("bronze", K.sphereGeo(), {
      x: -6.4,
      y: 1.62,
      z: -12.4,
      sx: 0.17,
      sy: 0.21,
      sz: 0.19,
      tint: [0.4, 0.46, 0.38],
    });
    b.geo("bronze", K.sphereGeo(), {
      x: -6.4,
      y: 1.47,
      z: -12.3,
      sx: 0.14,
      sy: 0.12,
      sz: 0.1,
      tint: [0.4, 0.46, 0.38],
    });
    b.box("bronze", -6.4, 1.2, -12.4, 0.5, 0.26, 0.3, {
      tint: [0.4, 0.46, 0.38],
    });
    for (const bz of [-6.5, -9.5]) {
      b.boxMM("oak", 6.6, 0.42, bz - 1.1, 7.6, 0.48, bz + 1.1, {
        tint: [0.55, 0.4, 0.28],
      });
      for (const e of [-0.9, 0.9])
        b.boxMM(
          "cast_iron",
          6.7,
          0,
          bz + e - 0.05,
          7.5,
          0.42,
          bz + e + 0.05,
          {},
        );
      b.boxMM("oak", 7.5, 0.48, bz - 1.1, 7.6, 1.0, bz + 1.1, {
        tint: [0.5, 0.36, 0.25],
      });
      b.col(6.6, 0, bz - 1.1, 7.6, 0.5, bz + 1.1, {});
    }
    b.boxMM("wood_dark", -7.9, 0, -9.8, -7.3, 2.2, -5.2, {
      tint: panel,
      faces: "nsewt",
    });
    b.quad(
      "glass_clear",
      [-7.29, 0.9, -5.2],
      [-7.29, 0.9, -9.8],
      [-7.29, 2.1, -9.8],
      [-7.29, 2.1, -5.2],
      { tint: [0.6, 0.7, 0.66] },
    );
    for (let k = 0; k < 5; k++) {
      b.cyl("gold", -7.6, 1.0, -5.8 - k * 0.9, 0.08, 0.12, 0.3, 8);
      b.geo("gold", K.sphereGeo(), {
        x: -7.6,
        y: 1.4,
        z: -5.8 - k * 0.9,
        s: 0.09,
      });
    }
    b.col(-7.9, 0, -9.8, -7.3, 2.2, -5.2, {});
    b.quad(
      "art",
      [4.4, 1.2, -13.86],
      [5.6, 1.2, -13.86],
      [5.6, 4.8, -13.86],
      [4.4, 4.8, -13.86],
      { rect: ardentBanner(), tint: [0.85, 0.85, 0.85] },
    );
    b.hplate("decal", -1.2, 0.014, -6.8, 1.8, 1.1, 0.4, K.decal("blood", 7));
    // wrecked lobby: rubble, knocked chairs, laser scorch, robot patrol tracks
    K.rubble(b, 6.2, 0, -12.2, 1.4, 0.8, { seed: 12 });
    K.chair(b, 2.5, 0, -2.0, 0.3, { fallen: true });
    K.chair(b, -2.2, 0, -5.5, 2.1, {});
    for (let k = 0; k < 8; k++)
      b.plate(
        "decal",
        -7.88 + (k % 2) * 15.76,
        1 + r() * 2.5,
        -1 - r() * 11,
        k % 2 ? -1 : 1,
        0,
        0.7,
        0.7,
        K.decal("scorch", 60 + k),
      );
    K.litter(b, -7.5, -13.5, 7.5, -0.5, 0, 22, 401);
    K.skel(ctx, 1.4, 0, -12.6, 0.4, "lying");
    // lights: cold emergency tubes + a flickering chandelier
    for (const lx of [-5.5, 5.5])
      K.lamp(b, lx, 4.1, -2.5, "globe", warm, 0.75, 8, {
        ceil: 5.0,
        size: 0.16,
        glowSize: 0.7,
        lightOpts: { box: LB },
      });
    K.lamp(b, 0, 4.2, -12.2, "globe", warm, 0.6, 7, {
      ceil: 5.0,
      size: 0.16,
      glowSize: 0.7,
      lightOpts: { box: LB },
    });
    K.lamp(b, -4.5, 4.7, -7, "tube", cold, 0.55, 6, {
      ceil: 5.0,
      len: 1.4,
      alongX: false,
      lightOpts: { box: LB },
    });
    K.lamp(b, 4.5, 4.7, -7, "tube", cold, 0, 0, {
      ceil: 5.0,
      len: 1.4,
      alongX: false,
      dead: true,
    });
    b.light(0, 2.5, -12.8, [1, 0.3, 0.15], 0.8, 5, { box: LB });
    b.glow(0, 3.5, -13.7, [1, 0.25, 0.1], 1.2);
    b.light(0, 2.4, -0.6, [0.8, 0.82, 0.75], 0.7, 6, { box: LB }); // grey daylight through the fanlight
    b.plate("lamp", 0, 4.2, -0.12, 0, -1, 2.4, 0.7, null, {
      tint: [0.35, 0.36, 0.33],
    });

    // ================================================= GREAT HALL STAIR (lobby → basement)
    K.room(b, ctx, {
      x0: -2,
      z0: -24,
      x1: 2,
      z1: -14,
      y: BY,
      h: 5.0 - BY,
      noFloor: true,
      floor: "terrazzo",
      wall: "plaster",
      wc: [0.72, 0.68, 0.6],
      ceil: "plaster",
      cc: [0.5, 0.48, 0.44],
      trim: false,
    });
    K.stairs(b, -1.9, -24, 1.9, -14, BY, 0, "+z", {
      mat: "marble",
      tint: [0.78, 0.76, 0.72],
      rail: "both",
      railMat: "brass",
      handMat: "brass",
    });
    K.lamp(b, 0, -0.6, -19, "globe", warm, 0.7, 7, {
      ceil: 5.0,
      size: 0.2,
      lightOpts: { box: [-2.1, BY, -24.1, 2.1, 5, -13.9] },
    });
    b.plate(
      "art",
      -1.88,
      1.5,
      -18,
      1,
      0,
      1.6,
      1.0,
      K.signCell(
        "cu_lincoln_plq",
        'On Feb. 27, 1860\nABRAHAM LINCOLN\nspoke in the Great Hall below:\n"Right makes might."',
        320,
        200,
        {
          bg: "#4a3a20",
          fg: "#e8d8a8",
          font: "Georgia, serif",
          border: "#c8a050",
        },
      ),
    );

    // ================================================= WEST: ROBOTICS WORKSHOP
    const W1B = [-24.1, -0.3, -16.1, -7.9, 5.0, 0.1];
    K.room(b, ctx, {
      x0: -24,
      z0: -16,
      x1: -8,
      z1: 0,
      y: 0,
      h: 5.0,
      floor: "concrete",
      fc: [0.6, 0.6, 0.58],
      wall: "tile",
      wc: [0.78, 0.8, 0.76],
      ceil: "concrete",
      cc: [0.5, 0.5, 0.48],
      trim: false,
    });
    // workbenches along the walls
    for (let k = 0; k < 3; k++) {
      const z = -3 - k * 4.6;
      const t = K.table(b, -22.9, 0, z, 1.2, 3.2, {
        mat: "metal",
        tint: [0.5, 0.52, 0.5],
        legMat: "metal",
      });
      b.boxMM("cloth_green", -23.95, 1.1, z - 1.6, -23.9, 2.6, z + 1.6, {
        tint: [0.4, 0.34, 0.24],
      }); // pegboard
      for (let i = 0; i < 7; i++)
        b.box(
          "steel",
          -23.85,
          1.3 + (i % 3) * 0.4,
          z - 1.3 + i * 0.4,
          0.05,
          0.25 + r() * 0.15,
          0.06,
          { tint: [0.6, 0.6, 0.6] },
        );
      // parts on the bench
      b.cyl("metal", -22.8, t, z - 0.8, 0.14, 0.14, 0.2, 8, {
        tint: [0.5, 0.55, 0.6],
      });
      b.box("paint_black", -22.8, t, z + 0.3, 0.45, 0.3, 0.35, {
        tint: [0.15, 0.15, 0.15],
      });
      b.pipe(
        "rust",
        -23.1,
        t + 0.05,
        z + 0.9,
        -22.5,
        t + 0.05,
        z + 1.2,
        0.025,
        4,
      );
    }
    // the dissected patrolman on the central table
    const dT = K.table(b, -15, 0, -8, 3.2, 1.6, {
      mat: "steel",
      tint: [0.55, 0.57, 0.58],
      legMat: "steel",
    });
    b.box("metal", -15.4, dT, -8, 0.9, 0.55, 0.7, { tint: [0.52, 0.58, 0.54] });
    b.geo("metal", K.sphereGeo(), {
      x: -14.1,
      y: dT + 0.25,
      z: -8,
      sx: 0.28,
      sy: 0.24,
      sz: 0.28,
      tint: [0.52, 0.58, 0.54],
    });
    b.geo("lamp", K.sphereGeo(), {
      x: -14.1,
      y: dT + 0.28,
      z: -7.76,
      s: 0.06,
      tint: [0.25, 0.25, 0.25],
    });
    for (let i = 0; i < 5; i++)
      b.pipe(
        "rubber",
        -15.4 + r() * 0.8,
        dT + 0.4,
        -8 + (r() - 0.5) * 0.6,
        -16.4 + r(),
        dT + 0.02,
        -8 + (r() - 0.5) * 1.2,
        0.015,
        4,
        { tint: [0.6, 0.15 + r() * 0.5, 0.1] },
      );
    b.cyl("metal", -16.4, dT, -7.6, 0.08, 0.08, 0.7, 6, {
      tint: [0.5, 0.55, 0.52],
    }); // detached arm
    // overhead gantry hoist with a dangling robot torso
    b.beam("rust", -23.8, 4.4, -8, -8.2, 4.4, -8, 0.25, 0.3);
    b.pipe("steel", -12, 4.3, -8, -12, 2.8, -8, 0.02, 4);
    b.cyl("paint_yellow", -12, 2.0, -8, 0.45, 0.4, 0.8, 10, {
      tint: [0.7, 0.55, 0.2],
    });
    b.geo("steel", K.sphereGeo(), { x: -12, y: 2.95, z: -8, s: 0.25 });
    // chalkboard: circuit diagram
    b.boxMM("chalkboard", -20, 1.0, -0.16, -12, 3.2, -0.1, {
      tint: [0.6, 0.65, 0.6],
    });
    b.plate(
      "decal",
      -16,
      2.1,
      -0.18,
      0,
      -1,
      7.6,
      2.0,
      chalk("cu_chalk_robot", [
        "PROCTOR SUBROUTINE v2.3",
        "  if (student.present && !exam.complete):",
        "     remain_seated()",
        "  if (student.absent): EXPEL",
        "",
        'NOTE: define "expel" more narrowly!! — Prof. H',
      ]),
    );
    // charging alcoves (three pods on the west wall)
    for (let k = 0; k < 3; k++) {
      const z = -13.8;
      const x = -21 + k * 2.4;
      b.boxMM("metal", x - 0.9, 0, z - 0.1, x + 0.9, 2.6, z + 0.7, {
        tint: [0.55, 0.6, 0.66],
        faces: "sewt",
      });
      b.boxMM("paint_black", x - 0.7, 0.2, z + 0.7, x + 0.7, 2.3, z + 0.71, {
        tint: [0.04, 0.04, 0.05],
      });
      b.plate("lamp", x, 2.45, z + 0.72, 0, 1, 1.3, 0.12, null, {
        tint: k === 1 ? [0.9, 0.2, 0.15] : [0.3, 0.8, 1.0],
      });
      b.glow(
        x,
        2.45,
        z + 0.85,
        k === 1 ? [0.8, 0.15, 0.1] : [0.25, 0.6, 0.9],
        1.0,
      );
      b.col(x - 0.9, 0, z - 0.1, x + 0.9, 2.6, z + 0.7, {});
    }
    K.terminal(
      ctx,
      "pev_term_cu_robotics",
      -22.9,
      0.76,
      -12.2,
      -HP,
      termRobotics(),
      "bare",
    );
    K.skel(ctx, -17.8, 0, -10.2, 1.2, "curled");
    K.note(ctx, "pev_note_cu_ta", -17.4, 0.02, -10.6, {
      name: "Crumpled Lab Report",
      title: 'Lab report (Grade: F — "EXPELLED")',
      text: 'LAB 7: Patrolman Behavioural Tuning\nStudent: D. Ikwu\n\nHypothesis: the Proctor units will release students once the exam timer runs out.\n\nResult: the timer ran out. They did not release us. The timer "ran out" by counting to zero and then continuing to count, which the Proctor classifies as "overtime." Overtime has no upper bound.\n\nConclusion: I would like to formally appeal my grade.\n\n[In red, stamped:] APPEAL DENIED. PENCILS DOWN.',
    });
    K.lamp(b, -16, 4.6, -4, "tube", cold, 0.8, 8, {
      ceil: 5,
      len: 1.8,
      lightOpts: { box: W1B },
    });
    K.lamp(b, -16, 4.6, -12, "tube", cold, 0.6, 8, {
      ceil: 5,
      len: 1.8,
      lightOpts: { box: W1B },
    });
    b.light(-21, 1.2, -13, [0.3, 0.7, 1], 0.6, 4, { box: W1B });
    K.litter(b, -23.5, -15.5, -8.5, -0.5, 0, 18, 402);
    K.loot(ctx, "toolbox", -9, 0, -15.2, 0, { loot: "toolbox" });
    K.loot(ctx, "crate", -9.2, 0, -1.2, 0.2, {
      kind: "teletype",
      loot: "electronics",
      name: "Ardent Parts Crate",
    });

    // ================================================= WEST: MACHINE SHOP (back stair top)
    const W2B = [-24.1, -0.3, -30.1, -7.9, 5.0, -15.9];
    K.room(b, ctx, {
      x0: -24,
      z0: -30,
      x1: -8,
      z1: -16,
      y: 0,
      h: 5.0,
      noFloor: true,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.62, 0.46, 0.38],
      ceil: "concrete",
      cc: [0.45, 0.44, 0.42],
      trim: false,
    });
    b.face("concrete", -21.2, 0, -16, 1, 0, 0, 0, 0, -1, 13.2, 14, {
      uv: "top",
      tint: [0.55, 0.54, 0.5],
    });
    b.face("concrete", -24, 0, -16, 1, 0, 0, 0, 0, -1, 2.8, 2, {
      uv: "top",
      tint: [0.55, 0.54, 0.5],
    });
    b.col(-21.2, -0.3, -30, -8, 0, -16, { tag: "floor" });
    b.col(-24, -0.3, -18, -21.2, 0, -16, { tag: "floor" });
    K.railing(b, -21.2, -29.9, -21.2, -18, 0, {
      h: 1.0,
      mat: "black_iron",
      handMat: "black_iron",
    });
    // lathes & a drill press
    for (let k = 0; k < 2; k++) {
      const x = -17 + k * 5,
        z = -27.6;
      b.boxMM("metal_dark", x - 1.6, 0, z - 0.5, x + 1.6, 0.9, z + 0.5, {
        tint: [0.3, 0.34, 0.32],
      });
      b.cyl("steel", x - 1.2, 0.9, z, 0.3, 0.3, 0.5, 10);
      b.pipe("steel", x - 1.1, 1.15, z, x + 1.3, 1.15, z, 0.05, 6);
      b.box("metal_dark", x + 1.3, 0.9, z, 0.4, 0.5, 0.5, {
        tint: [0.3, 0.34, 0.32],
      });
      b.col(x - 1.6, 0, z - 0.5, x + 1.6, 1.4, z + 0.5, {});
    }
    b.boxMM("metal_dark", -9.6, 0, -24, -8.4, 2.2, -23, {
      tint: [0.35, 0.3, 0.28],
    });
    b.col(-9.6, 0, -24, -8.4, 2.2, -23, {});
    // Peter Cooper's rolled-iron beam on display (he rolled the first I-beams for this building)
    b.boxMM("granite", -15.5, 0, -17.2, -10.5, 0.6, -16.4, {
      tint: [0.55, 0.52, 0.48],
    });
    b.boxMM("rust", -15.3, 0.6, -16.9, -10.7, 0.66, -16.7, {});
    b.boxMM("rust", -15.3, 0.66, -16.83, -10.7, 1.0, -16.77, {});
    b.boxMM("rust", -15.3, 1.0, -16.9, -10.7, 1.06, -16.7, {});
    b.col(-15.5, 0, -17.2, -10.5, 1.06, -16.4, {});
    b.plate(
      "art",
      -13,
      0.35,
      -16.38,
      0,
      1,
      2.2,
      0.4,
      K.signCell("cu_beam", "TRENTON IRON CO. — ROLLED 1858", 384, 64, {
        bg: "#3a2a1a",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    K.shelf(b, -8.4, 0, -20, -HP, 3.2, {
      mat: "metal",
      items: ["box", "can", "paint"],
      seed: 51,
    });
    K.lamp(b, -14, 4.2, -22, "cage", warm, 0.75, 8, {
      ceil: 5,
      lightOpts: { box: W2B },
    });
    K.lamp(b, -22.6, 4.2, -26, "cage", warm, 0.5, 6, {
      ceil: 5,
      lightOpts: { box: [-24.1, BY - 0.2, -30.1, -21.1, 5, -15.9] },
    });
    b.plate(
      "decal",
      -21.1,
      1.5,
      -24,
      1,
      0,
      2.2,
      0.8,
      K.tag("GREAT HALL ↓ BACK WAY", "#e8e040", 384, 96),
    );
    K.loot(ctx, "locker", -23.4, 0, -16.6, HP, {
      count: 2,
      loot: "locker",
      name: "Shop Lockers",
    });
    K.loot(ctx, "ammo_box", -12, 0, -29.3, 0, { loot: "ammo_box" });

    // ================================================= BACK STAIRWELL (machine shop ↓ basement corridor)
    K.room(b, ctx, {
      x0: -24,
      z0: -30,
      x1: -21.2,
      z1: -18,
      y: BY,
      h: -BY - 0.02,
      noFloor: true,
      noCeil: true,
      wall: "brick_red",
      wc: [0.5, 0.38, 0.32],
      trim: false,
    });
    K.stairs(b, -23.9, -30, -21.3, -18, BY, 0, "+z", {
      mat: "concrete",
      tint: [0.52, 0.5, 0.47],
      rail: "r",
      railMat: "rust",
      handMat: "rust",
    });

    // ================================================= EAST: STUDENT LOUNGE + MAIN STAIR
    const E1B = [7.9, -0.3, -14.1, 24.1, 5.0, 0.1];
    K.room(b, ctx, {
      x0: 8,
      z0: -14,
      x1: 24,
      z1: 0,
      y: 0,
      h: 5.0,
      noCeil: true,
      floor: "terrazzo",
      fc: [0.74, 0.72, 0.68],
      wall: "plaster",
      wc: [0.7, 0.78, 0.72],
      wain: "wood_dark",
      wainC: panel,
      ceil: "plaster",
    });
    b.face("plaster", 8, 5.0, -14, 1, 0, 0, 0, 0, 1, 13, 14, {
      uv: "top",
      tint: [0.55, 0.55, 0.52],
    });
    b.face("plaster", 21, 5.0, -14, 1, 0, 0, 0, 0, 1, 3, 1, {
      uv: "top",
      tint: [0.55, 0.55, 0.52],
    });
    b.face("plaster", 21, 5.0, -1.5, 1, 0, 0, 0, 0, 1, 3, 1.5, {
      uv: "top",
      tint: [0.55, 0.55, 0.52],
    });
    K.stairs(b, 21.2, -13, 23.85, -1.5, 0, F2, "-z", {
      mat: "marble",
      tint: [0.76, 0.74, 0.7],
      rail: "r",
      railMat: "brass",
      handMat: "mahogany",
    });
    b.plate(
      "art",
      20.4,
      1.8,
      -0.14,
      0,
      -1,
      1.8,
      0.45,
      K.signCell("cu_up", "2ND FLOOR · LIBRARY ↑", 384, 80, {
        bg: "#1c3a5a",
        fg: "#e8e0c8",
        font: "Arial, sans-serif",
      }),
    );
    // couches, coffee tables, vending machines
    K.sofa(b, 12.5, 0, -1.2, 3.0, 0, {
      mat: "leather",
      tint: [0.4, 0.3, 0.22],
    });
    K.sofa(b, 16.5, 0, -6.5, 2.4, HP, {
      mat: "leather",
      tint: [0.4, 0.3, 0.22],
    });
    K.table(b, 12.5, 0, -3.2, 1.6, 0.8, { h: 0.45, mat: "wood_dark" });
    K.skel(ctx, 12.0, 0.45, -1.3, PI, "seated");
    K.note(ctx, "pev_reel_cu_student", 12.8, 0.47, -3.0, {
      type: "tape",
      learn: "pev_lk_cu_dean",
      name: 'Tape reel: "Study Group, Session 9"',
      title: "Study group recording",
      text: '[Three voices. Pages turning.]\n\nMAYA: Okay. If the Proctors lock the doors at the start of the exam, and the exam never "ends"...\nDEV: Then we never leave. We know. We did this one.\nMAYA: No, listen. The Dean has an override. A punch card. He keeps it in his office on two.\nDEV: The Dean went home.\nMAYA: The Dean never went home. The Dean lives in his office. And his teletype word is STANDARDS — he says it in every lecture, he\'d never pick anything else.\n\n[Distant: a patrolman. "PENCILS. DOWN."]\n\nDEV: ...We should have gone to Columbia.',
    });
    for (let k = 0; k < 2; k++)
      K.loot(ctx, "fizzo_machine", 9.2, 0, -8.5 - k * 1.5, HP, {
        loot: "fizzo_machine",
      });
    K.framed(b, 16, 2.6, -13.88, 0, 1, 2.2, 1.4, K.painting(3, 240, 160), {
      frame: "wood_dark",
    });
    K.lamp(b, 14, 4.4, -7, "pendant", warm, 0.75, 8, {
      ceil: 5,
      shade: "paint_green",
      lightOpts: { box: E1B },
    });
    K.lamp(b, 22.5, 4.8, -7, "globe", warm, 0.5, 7, {
      ceil: 5.2,
      size: 0.18,
      lightOpts: { box: [20.9, -0.3, -14.1, 24.1, 10.5, 0.1] },
    });
    K.litter(b, 8.5, -13.5, 20.5, -0.5, 0, 16, 403);

    // ================================================= EAST: LECTURE ROOM 101
    const E2B = [7.9, -0.3, -30.1, 24.1, 5.0, -13.9];
    K.room(b, ctx, {
      x0: 8,
      z0: -30,
      x1: 24,
      z1: -14,
      y: 0,
      h: 5.0,
      floor: "wood",
      fc: [0.6, 0.5, 0.4],
      wall: "plaster",
      wc: cream,
      wain: "wood_dark",
      wainC: panel,
      ceil: "tin",
      cc: [0.6, 0.58, 0.54],
      surface: "wood",
    });
    b.boxMM("chalkboard", 8.12, 1.0, -27, 8.2, 3.4, -17, {
      tint: [0.6, 0.65, 0.6],
    });
    b.plate(
      "decal",
      8.22,
      2.2,
      -22,
      1,
      0,
      9.4,
      2.2,
      chalk("cu_chalk_101", [
        "CE 401 — FINAL",
        "1. Derive load on a rolled-iron I-beam.",
        "2. Why is the elevator shaft round?",
        '3. Explain: "right makes might" (show work)',
        "",
        "NO TALKING. NO LEAVING. NO EXCEPTIONS.",
      ]),
    );
    const pd = K.table(b, 10.2, 0, -22, 1.0, 2.4, { mat: "mahogany" });
    b.box("ceramic", 10.2, pd, -21.2, 0.1, 0.12, 0.1, {
      tint: [0.9, 0.9, 0.85],
    });
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 5; col++) {
        const x = 13 + row * 2.4,
          z = -27.5 + col * 2.6;
        K.table(b, x, 0, z, 0.7, 1.2, { mat: "oak", h: 0.74 });
        K.chair(b, x + 0.6, 0, z, -HP, { mat: "oak", fallen: r() < 0.1 });
        if (r() < 0.6)
          b.hplate(
            "flat",
            x + 0.05,
            0.745,
            z + (r() - 0.5) * 0.4,
            0.3,
            0.42,
            r() * 0.4,
            null,
            { tint: [0.9, 0.88, 0.8] },
          );
      }
    for (const [x, z] of [
      [13.6, -22.3],
      [18.4, -19.7],
      [20.8, -27.5],
    ])
      K.skel(ctx, x, 0, z, -HP, "seated");
    K.lamp(b, 16, 4.4, -18, "globe", warm, 0.55, 8, {
      ceil: 5,
      size: 0.2,
      lightOpts: { box: E2B },
    });
    K.lamp(b, 16, 4.4, -26, "globe", warm, 0, 0, {
      ceil: 5,
      size: 0.2,
      dead: true,
    });
    b.light(9.2, 2.4, -22, [0.7, 0.8, 0.7], 0.45, 5, { box: E2B });
    K.loot(ctx, "desk", 10.2, 0, -26.8, HP, {
      loot: "desk",
      name: "Professor's Desk",
    });

    // ================================================= 2ND FLOOR: LIBRARY
    const LIB = [-24.1, F2 - 0.3, -30.1, 6.1, F2 + 5, 0.1];
    K.room(b, ctx, {
      x0: -24,
      z0: -30,
      x1: 6,
      z1: 0,
      y: F2,
      h: 5.0,
      floor: "parquet",
      fc: [0.62, 0.52, 0.42],
      wall: "plaster",
      wc: [0.72, 0.66, 0.56],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.0,
      ceil: "plaster",
      cc: [0.5, 0.48, 0.44],
      cornice: true,
      surface: "wood",
    });
    // stacks: long rows of tall shelves
    for (let row = 0; row < 5; row++) {
      const z = -26 + row * 3.4;
      for (const x of [-20.5, -16.3]) {
        if (row === 2 && x === -16.3) continue;
        K.shelf(b, x, F2, z, 0, 3.8, {
          mat: "wood_dark",
          h: 3.0,
          d: 0.5,
          levels: 6,
          items: ["book", "book", "book", "box"],
          seed: 60 + row * 3 + (x > -18 ? 1 : 0),
        });
      }
    }
    // a toppled stack (domino'd into the next)
    b.box("wood_dark", -16.3, F2 + 0.3, -19.2, 3.8, 0.5, 3.0, {
      yaw: 0,
      tint: [0.4, 0.3, 0.22],
    });
    for (let k = 0; k < 40; k++)
      b.box(
        "flat",
        -18 + r() * 3.6,
        F2 + 0.02,
        -21 + r() * 3.4,
        0.2,
        0.05,
        0.28,
        {
          yaw: r() * 3,
          tint: r.pick([
            [0.5, 0.15, 0.1],
            [0.15, 0.25, 0.4],
            [0.2, 0.35, 0.2],
            [0.55, 0.45, 0.3],
          ]),
        },
      );
    b.col(-18.2, F2, -20.7, -14.4, F2 + 0.8, -17.7, {});
    // wall shelves
    K.shelf(b, -23.7, F2, -8, HP, 7.5, {
      mat: "wood_dark",
      h: 3.4,
      d: 0.45,
      levels: 6,
      items: ["book", "book", "book"],
      seed: 71,
    });
    K.shelf(b, -9, F2, -29.7, 0, 5.5, {
      mat: "wood_dark",
      h: 3.4,
      d: 0.45,
      levels: 6,
      items: ["book", "book", "box"],
      seed: 72,
    });
    // reading tables with green banker's lamps
    for (const [x, z] of [
      [-9.5, -6],
      [-9.5, -12],
      [-4, -18],
      [-4, -24],
    ]) {
      const t = K.table(b, x, F2, z, 2.6, 1.2, { mat: "oak" });
      for (const s of [-1, 1]) {
        K.chair(b, x - 0.6, F2, z + s * 0.85, s > 0 ? 0 : PI, { mat: "oak" });
        K.chair(b, x + 0.6, F2, z + s * 0.85, s > 0 ? 0 : PI, {
          mat: "oak",
          fallen: r() < 0.2,
        });
      }
      const lit = !(x === -4 && z === -24);
      b.box("brass", x, t, z, 0.12, 0.3, 0.12, {});
      b.geo("green_paint", K.sphereGeo(), {
        x,
        y: t + 0.34,
        z,
        sx: 0.28,
        sy: 0.08,
        sz: 0.12,
        tint: [0.2, 0.5, 0.3],
      });
      if (lit) {
        b.light(x, t + 0.3, z, [0.8, 1.0, 0.7], 0.8, 4.5, { box: LIB });
        b.glow(x, t + 0.25, z, [0.35, 0.6, 0.3], 0.8);
      }
      for (let k = 0; k < 3; k++)
        b.box(
          "flat",
          x + (r() - 0.5) * 2,
          t,
          z + (r() - 0.5) * 0.6,
          0.22,
          0.05,
          0.3,
          { yaw: r() * 3, tint: [0.5, 0.15, 0.1] },
        );
    }
    // card catalog
    for (let k = 0; k < 3; k++) {
      const x = 2.4 - k * 1.3;
      b.boxMM("oak", x - 0.6, F2, -0.75, x + 0.6, F2 + 1.4, -0.15, {
        tint: [0.65, 0.5, 0.34],
      });
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 5; j++)
          b.boxMM(
            "brass",
            x - 0.5 + i * 0.26,
            F2 + 0.2 + j * 0.25,
            -0.77,
            x - 0.4 + i * 0.26,
            F2 + 0.24 + j * 0.25,
            -0.75,
            {},
          );
      b.col(x - 0.6, F2, -0.75, x + 0.6, F2 + 1.4, -0.15, {});
    }
    for (let k = 0; k < 12; k++)
      b.hplate(
        "flat",
        -3 + r() * 5,
        F2 + 0.012 + k * 0.0004,
        -1.5 - r() * 3,
        0.1,
        0.14,
        r() * 6,
        null,
        { tint: [0.9, 0.86, 0.72] },
      );
    b.plate(
      "art",
      -9,
      F2 + 3.9,
      -29.85,
      0,
      1,
      4.2,
      0.6,
      K.signCell("cu_lib", "THE LIBRARY — SILENCE", 512, 72, {
        bg: "#2a1c12",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    // ceiling collapse: rubble mound and a broken skylight well
    K.rubble(b, -20, F2, -2.5, 2.2, 1.2, { seed: 22 });
    b.burn(-20, F2 + 4, -2, 4, 0.6);
    K.lamp(b, -12, F2 + 4.3, -15, "globe", warm, 0.45, 9, {
      ceil: F2 + 5,
      size: 0.22,
      lightOpts: { box: LIB },
    });
    b.light(-20, F2 + 4.6, -2.5, [0.7, 0.75, 0.7], 0.5, 6, { box: LIB });
    K.skel(ctx, -9.9, F2, -12.9, 0, "seated");
    K.note(ctx, "pev_note_cu_overdue", -9.2, F2 + 0.77, -12.2, {
      name: "Overdue Notice",
      title: "COOPER UNION LIBRARY — FINAL NOTICE",
      text: 'Borrower: Prof. A. Hewitt (Faculty, Library Sciences)\nItem: "The Cooper Union Address, 1860 — annotated facsimile"\nDue: March 6, 1967\n\nThis item is now 11,571,840 minutes overdue. A fine of $0.05 per day has accrued.\n\nThe library reminds all patrons that the end of the world is not an acceptable excuse.\n\n[Pencilled beneath:] Abigail — it\'s on the Dean\'s desk. He "borrowed" it for his speech. — M.',
    });
    K.loot(ctx, "file_cabinet", -23.4, F2, -28.6, HP, {
      loot: "file_cabinet",
      name: "Circulation Files",
    });
    K.loot(ctx, "crate", 4.8, F2, -28.8, 0.2, {
      kind: "plain",
      loot: "books",
      name: "Book Returns Bin",
    });

    // ================================================= 2ND FLOOR: CHEMISTRY LAB (stair arrives here)
    const CHB = [5.9, F2 - 0.3, -14.1, 24.1, F2 + 5, 0.1];
    K.room(b, ctx, {
      x0: 6,
      z0: -14,
      x1: 24,
      z1: 0,
      y: F2,
      h: 5.0,
      noFloor: true,
      floor: "checker",
      wall: "tile",
      wc: [0.82, 0.84, 0.8],
      ceil: "plaster",
      cc: [0.55, 0.55, 0.52],
      trim: false,
    });
    b.face("checker", 6, F2, 0, 1, 0, 0, 0, 0, -1, 15, 14, {
      uv: "top",
      tint: [0.7, 0.7, 0.66],
    });
    b.face("checker", 21, F2, -13, 1, 0, 0, 0, 0, -1, 3, 1, {
      uv: "top",
      tint: [0.7, 0.7, 0.66],
    });
    b.face("checker", 21, F2, 0, 1, 0, 0, 0, 0, -1, 3, 1.5, {
      uv: "top",
      tint: [0.7, 0.7, 0.66],
    });
    b.col(6, F2 - 0.5, -14, 21, F2, 0, { tag: "floor" });
    b.col(21, F2 - 0.5, -14, 24, F2, -13, { tag: "floor" });
    b.col(21, F2 - 0.5, -1.5, 24, F2, 0, { tag: "floor" });
    K.railing(b, 21, -13, 21, -1.5, F2, {
      h: 1.0,
      mat: "brass",
      handMat: "mahogany",
    });
    K.railing(b, 21, -1.5, 23.9, -1.5, F2, {
      h: 1.0,
      mat: "brass",
      handMat: "mahogany",
    });
    // lab benches (black tops) with glassware
    for (let k = 0; k < 3; k++) {
      const z = -3.5 - k * 3.6;
      b.boxMM("wood_dark", 9, F2, z - 0.6, 18, F2 + 0.9, z + 0.6, {
        tint: [0.35, 0.28, 0.2],
      });
      b.boxMM(
        "paint_black",
        8.95,
        F2 + 0.9,
        z - 0.65,
        18.05,
        F2 + 0.95,
        z + 0.65,
        { tint: [0.1, 0.1, 0.1] },
      );
      b.col(8.95, F2, z - 0.65, 18.05, F2 + 0.95, z + 0.65, { tag: "counter" });
      for (let i = 0; i < 9; i++) {
        const x = 9.5 + i * 0.95 + r() * 0.3,
          zz = z + (r() - 0.5) * 0.8;
        if (r() < 0.35) continue;
        const kind = r();
        if (kind < 0.4) {
          b.cyl("glass", x, F2 + 0.95, zz, 0.07, 0.03, 0.2, 8, {
            tint: r.pick([
              [0.4, 0.9, 0.5],
              [0.9, 0.5, 0.3],
              [0.5, 0.6, 0.9],
            ]),
          });
          b.cyl("glass", x, F2 + 1.15, zz, 0.02, 0.02, 0.12, 6);
        } else if (kind < 0.7)
          b.cyl("glass", x, F2 + 0.95, zz, 0.05, 0.05, 0.18, 8, {
            tint: [0.7, 0.75, 0.75],
          });
        else {
          b.pipe("steel", x, F2 + 0.95, zz, x, F2 + 1.45, zz, 0.01, 4);
          b.cyl("steel", x, F2 + 0.95, zz, 0.1, 0.1, 0.02, 8);
        }
      }
      b.pipe("brass", 13.5, F2 + 0.95, z, 13.5, F2 + 1.3, z, 0.02, 4); // gas tap
    }
    // fume hoods on the north wall
    for (let k = 0; k < 3; k++) {
      const x = 9 + k * 3.2;
      b.boxMM("metal", x - 1.3, F2, -13.9, x + 1.3, F2 + 0.9, -13.1, {
        tint: [0.6, 0.62, 0.6],
      });
      b.boxMM("metal", x - 1.3, F2 + 2.1, -13.9, x + 1.3, F2 + 2.7, -13.1, {
        tint: [0.6, 0.62, 0.6],
      });
      b.quad(
        "glass_clear",
        [x - 1.25, F2 + 0.9, -13.1],
        [x + 1.25, F2 + 0.9, -13.1],
        [x + 1.25, F2 + 2.1, -13.1],
        [x - 1.25, F2 + 2.1, -13.1],
        { tint: [0.6, 0.7, 0.66] },
      );
      b.col(x - 1.3, F2, -13.9, x + 1.3, F2 + 2.7, -13.1, {});
    }
    // periodic table
    b.plate(
      "art",
      6.14,
      F2 + 2.5,
      -7,
      1,
      0,
      3.6,
      2.0,
      K.paint("art", "cu_periodic", 512, 288, function (x, X, Y, W, H) {
        x.fillStyle = "#e8e0c8";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#1a1a1a";
        x.font = "bold 20px Arial";
        x.textAlign = "center";
        x.fillText(
          'PERIODIC TABLE OF THE ELEMENTS (incl. "Cooperium", Class of \'66)',
          X + W / 2,
          Y + 22,
        );
        const cols = ["#e8b0a0", "#a0c8e8", "#c8e8a0", "#e8e0a0", "#d0b0e8"],
          rr = K.rng("pt");
        for (let row = 0; row < 7; row++)
          for (let c = 0; c < 18; c++) {
            if (row === 0 && c > 0 && c < 17) continue;
            if ((row === 1 || row === 2) && c > 1 && c < 12) continue;
            x.fillStyle = cols[(c + row) % 5];
            x.fillRect(X + 8 + c * 27.5, Y + 36 + row * 34, 25, 31);
            x.fillStyle = "#222";
            x.font = "10px Arial";
            x.fillText(
              String.fromCharCode(
                65 + ((c * 7 + row * 3 + ((rr() * 5) | 0)) % 26),
              ) +
                (rr() < 0.5 ? String.fromCharCode(97 + ((rr() * 26) | 0)) : ""),
              X + 20 + c * 27.5,
              Y + 56 + row * 34,
            );
          }
        x.fillStyle = "#39c860";
        x.fillRect(X + 8 + 16 * 27.5, Y + 36 + 6 * 34, 25, 31);
        x.fillStyle = "#111";
        x.fillText("Nq", X + 20 + 16 * 27.5, Y + 56 + 6 * 34);
        K.stains(x, X, Y, W, H, 10, 5, 0.4);
      }),
    );
    // the toxic spill: a cracked carboy of something radioactive
    b.hplate("decal", 20, F2 + 0.013, -9, 3.2, 3.2, 0.4, K.decal("rad", 3));
    b.cyl("glass", 19.4, F2, -9.6, 0.3, 0.3, 0.45, 10, {
      tint: [0.4, 0.9, 0.3],
    });
    b.light(20, F2 + 0.5, -9, [0.4, 1.0, 0.35], 0.9, 5, { box: CHB });
    b.glow(20, F2 + 0.3, -9, [0.3, 0.8, 0.25], 2.4);
    ctx.radSpots = [{ x: 20, y: F2 + 0.3, z: -9, radius: 3.2, strength: 3 }];
    for (let k = 0; k < 8; k++)
      b.hplate(
        "flat",
        9 + r() * 9,
        F2 + 0.012 + k * 0.0004,
        -1 - r() * 11,
        0.08,
        0.14,
        r() * 6,
        null,
        { tint: [0.7, 0.8, 0.8] },
      );
    K.lamp(b, 12, F2 + 4.6, -5, "tube", cold, 0.8, 8, {
      ceil: F2 + 5,
      len: 1.8,
      lightOpts: { box: CHB },
    });
    K.lamp(b, 12, F2 + 4.6, -11, "tube", cold, 0.5, 7, {
      ceil: F2 + 5,
      len: 1.8,
      lightOpts: { box: CHB },
    });
    K.loot(ctx, "first_aid", 23.85, F2 + 1.3, -5, -HP, {
      loot: "medical_cabinet",
      name: "Lab Safety Cabinet",
    });
    K.loot(ctx, "footlocker", 7, F2, -1, 0, {
      loot: "chems",
      name: "Reagent Locker",
    });
    K.skel(ctx, 16.5, F2, -8, 0.8, "curled");

    // ================================================= 2ND FLOOR: DEAN'S OFFICE
    const DB = [5.9, F2 - 0.3, -30.1, 24.1, F2 + 5, -13.9];
    K.room(b, ctx, {
      x0: 6,
      z0: -30,
      x1: 24,
      z1: -14,
      y: F2,
      h: 5.0,
      floor: "carpet",
      fc: [0.5, 0.35, 0.3],
      wall: "wallpaper_green",
      wc: [0.62, 0.66, 0.52],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.3,
      ceil: "tin",
      cc: [0.55, 0.52, 0.46],
      cornice: true,
      surface: "carpet",
    });
    const dk = K.table(b, 18, F2, -24, 3.0, 1.4, { mat: "mahogany" });
    b.boxMM("mahogany", 16.6, F2, -24.6, 19.4, F2 + 0.72, -24.5, {
      tint: [0.4, 0.2, 0.14],
    });
    K.chair(b, 18, F2, -25.3, PI, { mat: "leather", tint: [0.3, 0.2, 0.14] });
    // the Dean, still at his desk — the override card is in his breast pocket too (no-skill route; the drawer needs Electronics 50)
    K.skel(ctx, 18, F2 + 0.02, -25.4, 0, "seated", {
      container: true,
      name: "The Dean",
      items: [["pev_cu_override_card", 1]],
      cond: () => !EV.flag("cu_card_taken"),
    });
    K.terminal(ctx, "pev_term_cu_dean", 17.2, dk, -24.2, 0, termDean(), "bare");
    b.box("brass", 19.2, dk, -24.2, 0.14, 0.34, 0.14, {});
    b.geo("green_paint", K.sphereGeo(), {
      x: 19.2,
      y: dk + 0.38,
      z: -24.2,
      sx: 0.28,
      sy: 0.08,
      sz: 0.12,
      tint: [0.2, 0.5, 0.3],
    });
    b.light(19, dk + 0.4, -24.1, [1, 0.9, 0.65], 0.9, 5, { box: DB });
    b.glow(19.2, dk + 0.3, -24.2, [0.6, 0.5, 0.3], 0.9);
    K.anchor(ctx, "override", 18.6, dk + 0.02, -23.7);
    // Peter Cooper portrait over the fireplace, bookshelves, a globe, the Dean's pneumatic tube
    b.boxMM("marble", 22.8, F2, -24.5, 23.9, F2 + 1.3, -21.5, {
      tint: [0.7, 0.68, 0.64],
    });
    b.boxMM("paint_black", 22.78, F2 + 0.15, -23.6, 22.8, F2 + 0.95, -22.4, {
      tint: [0.05, 0.05, 0.05],
    });
    b.col(22.8, F2, -24.5, 23.9, F2 + 1.3, -21.5, {});
    K.framed(
      b,
      23.88,
      F2 + 2.7,
      -23,
      -1,
      0,
      1.4,
      1.8,
      K.painting(18, 160, 200),
      { frame: "gold" },
    );
    K.shelf(b, 12, F2, -29.7, 0, 5, {
      mat: "mahogany",
      h: 3.2,
      d: 0.45,
      levels: 6,
      items: ["book", "book", "box"],
      seed: 81,
    });
    b.cyl("wood_dark", 9, F2, -27.5, 0.2, 0.28, 0.8, 8);
    b.geo("flat", K.sphereGeo(), {
      x: 9,
      y: F2 + 1.15,
      z: -27.5,
      s: 0.33,
      tint: [0.55, 0.62, 0.5],
    });
    K.sofa(b, 9, F2, -19, 2.6, HP, {
      mat: "leather",
      tint: [0.35, 0.22, 0.15],
    });
    b.pipe("brass", 6.15, F2, -16, 6.15, F2 + 5, -16, 0.08, 8);
    b.plate(
      "art",
      11,
      F2 + 3.2,
      -14.12,
      0,
      -1,
      3.4,
      0.55,
      K.signCell("cu_dean", "OFFICE OF THE DEAN", 512, 80, {
        bg: "#2a1c12",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, 15, F2 + 4.2, -21, "globe", warm, 0.55, 9, {
      ceil: F2 + 5,
      size: 0.2,
      lightOpts: { box: DB },
    });
    K.loot(ctx, "safe", 23.4, F2, -28.8, -HP, {
      loot: "safe",
      name: "The Dean's Safe",
      lock: K.regLock({
        id: "pev_lk_cu_dean_safe",
        label: "The Dean's Safe",
        kind: "safe",
        code: "1859",
        hint: "The Dean's teletype has the combination.",
      }),
    });
    K.loot(ctx, "file_cabinet", 6.6, F2, -29.2, HP, {
      loot: "file_cabinet",
      name: "Faculty Files",
    });

    // ================================================= BASEMENT: THE GREAT HALL
    const HB = [-18.1, BY - 0.2, -54.1, 18.1, -0.2, -23.9];
    K.room(b, ctx, {
      x0: -18,
      z0: -54,
      x1: 18,
      z1: -24,
      y: BY,
      h: 5.2,
      floor: "wood",
      fc: [0.55, 0.42, 0.32],
      wall: "plaster",
      wc: [0.8, 0.74, 0.62],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.1,
      ceil: "plaster",
      cc: [0.66, 0.62, 0.56],
      cornice: true,
      surface: "wood",
    });
    // cast-iron columns in two rows, ceiling ribs
    for (const cx of [-7, 7])
      for (const cz of [-29, -35, -41, -47]) {
        K.column(b, cx, BY, cz, 0.2, 5.2, {
          kind: "iron",
          mat: "cast_iron",
          tint: [0.8, 0.76, 0.66],
        });
        b.col(cx - 0.22, BY, cz - 0.22, cx + 0.22, -0.3, cz + 0.22, {});
      }
    for (const cz of [-29, -35, -41, -47])
      b.beam("plaster", -18, -0.55, cz, 18, -0.55, cz, 0.35, 0.5, {
        tint: [0.7, 0.66, 0.58],
      });
    for (const cx of [-7, 7])
      b.beam("plaster", cx, -0.55, -54, cx, -0.55, -24, 0.35, 0.5, {
        tint: [0.7, 0.66, 0.58],
      });
    // blind arches on the side walls
    for (const s of [-1, 1])
      for (const cz of [-32, -38, -44])
        K.archWin(b, s * 17.9, BY + 1.3, cz, -s, 0, 2.2, 3.2, {
          state: "dark",
          paneTint: [0.55, 0.5, 0.42],
          surround: "plaster",
          surroundTint: [0.72, 0.68, 0.6],
          mullion: false,
          keystone: true,
          sill: false,
        });
    // the stage
    b.boxMM("wood_dark", -12, BY, -54, 12, BY + 1, -47, {
      tint: [0.45, 0.32, 0.22],
      faces: "nsewt",
    });
    b.boxMM("wood", -12.05, BY + 0.94, -47.1, 12.05, BY + 1.02, -46.95, {
      tint: [0.55, 0.4, 0.28],
    });
    b.col(-12, BY, -54, 12, BY + 1, -47, { tag: "floor", surface: "wood" });
    K.stairs(b, -1.6, -47, 1.6, -45.4, BY, BY + 1, "-z", {
      mat: "wood",
      tint: [0.5, 0.36, 0.26],
    });
    for (const s of [-1, 1])
      K.stairs(
        b,
        s > 0 ? 12 : -13.6,
        -50.5,
        s > 0 ? 13.6 : -12,
        -48.5,
        BY,
        BY + 1,
        s > 0 ? "-x" : "+x",
        { mat: "wood", tint: [0.5, 0.36, 0.26] },
      );
    // lectern (where Lincoln stood)
    b.boxMM("mahogany", -0.45, BY + 1, -50.9, 0.45, BY + 2.1, -50.3, {
      tint: [0.45, 0.24, 0.16],
    });
    b.quad(
      "mahogany",
      [-0.55, BY + 2.1, -50.2],
      [0.55, BY + 2.1, -50.2],
      [0.55, BY + 2.35, -50.95],
      [-0.55, BY + 2.35, -50.95],
      { tint: [0.4, 0.22, 0.14] },
    );
    b.col(-0.45, BY + 1, -50.9, 0.45, BY + 2.1, -50.3, {});
    K.terminal(
      ctx,
      "pev_term_cu_lectern",
      0,
      BY + 2.12,
      -50.6,
      0,
      termLectern(),
      "bare",
    );
    // backdrop: RIGHT MAKES MIGHT banner, flags, the two portraits, the Proctor screen
    b.quad(
      "fabric",
      [-9, BY + 3.3, -53.85],
      [9, BY + 3.3, -53.85],
      [9, BY + 4.6, -53.85],
      [-9, BY + 4.6, -53.85],
      { tint: [0.55, 0.14, 0.1] },
    );
    K.letters(b, 0, BY + 3.95, -53.84, 0, 1, 16, 1.0, "RIGHT MAKES MIGHT", {
      fg: "#f0e0b0",
    });
    const fl = flagCell();
    for (const s of [-1, 1]) {
      b.pipe("brass", s * 10.5, BY + 1, -53, s * 10.5, BY + 4.8, -53, 0.03, 5);
      b.geo("gold", K.sphereGeo(), {
        x: s * 10.5,
        y: BY + 4.85,
        z: -53,
        s: 0.08,
      });
      b.quad(
        "fabric",
        [s * 10.5, BY + 3.2, -53],
        [s * 10.5 - s * 1.7, BY + 3.0, -52.9],
        [s * 10.5 - s * 1.7, BY + 4.2, -52.9],
        [s * 10.5, BY + 4.6, -53],
        { rect: fl, tint: [0.9, 0.88, 0.84], grime: 0.2 },
      );
      K.framed(
        b,
        s * 6.5,
        BY + 2.6,
        -53.88,
        0,
        1,
        1.8,
        2.2,
        K.painting(s > 0 ? 26 : 2, 160, 200),
        { frame: "gold" },
      );
    }
    b.boxMM("metal_dark", -2.6, BY + 1.3, -53.95, 2.6, BY + 3.1, -53.7, {
      tint: [0.25, 0.27, 0.26],
    });
    b.plate("neon", 0, BY + 2.2, -53.68, 0, 1, 4.9, 1.6, examScreen());
    b.light(0, BY + 2.4, -52.5, [0.35, 1, 0.5], 0.8, 7, { box: HB });
    b.glow(0, BY + 2.2, -53.2, [0.25, 0.7, 0.35], 4);
    // stage spotlights on the lectern
    for (const s of [-1, 1]) {
      b.cyl("black_iron", s * 3.5, -0.9, -45, 0.2, 0.25, 0.45, 8);
      b.glow(s * 3.5, -1.0, -45.3, [1, 0.95, 0.8], 1.2);
    }
    b.light(0, BY + 3.5, -49.5, [1, 0.95, 0.82], 1.3, 6.5, { box: HB });
    // the audience: rows of seats facing the stage — some still occupied
    for (let row = 0; row < 12; row++) {
      const z = -43 + row * 1.35;
      for (let s = -1; s <= 1; s += 2) {
        for (let i = 0; i < 10; i++) {
          const x = s * (1.6 + i * 0.72);
          if (Math.abs(Math.abs(x) - 7) < 0.45) continue;
          if (r() < 0.06) {
            K.chair(b, x, BY, z, r() * 6, { mat: "oak", fallen: true });
            continue;
          }
          b.box("oak", x, BY + 0.44, z, 0.5, 0.05, 0.48, {
            tint: [0.55, 0.4, 0.28],
          });
          b.box("oak", x, BY + 0.47, z + 0.24, 0.5, 0.5, 0.05, {
            tint: [0.5, 0.36, 0.25],
          });
          b.box("cast_iron", x - 0.23, BY, z, 0.04, 0.44, 0.44, {
            tint: [0.5, 0.48, 0.45],
          });
        }
        b.col(
          s > 0 ? 1.3 : -9.2 * 0.72 - 1.6 - 0.3,
          BY,
          z - 0.25,
          s > 0 ? 1.6 + 9 * 0.72 + 0.3 : -1.3,
          BY + 0.5,
          z + 0.3,
          { tag: "furniture", surface: "wood" },
        );
      }
    }
    const aud = [
      [-2.32, -43],
      [3.76, -40.3],
      [-5.2, -37.6],
      [2.32, -34.9],
      [-3.04, -32.2],
      [6.64, -38.95],
      [-1.6, -29.5],
    ];
    aud.forEach(([x, z], i) => {
      K.skel(ctx, x, BY + 0.02, z + 0.05, 0, "seated");
      b.hplate(
        "flat",
        x + 0.1,
        BY + 0.012 + i * 0.0003,
        z - 0.5,
        0.26,
        0.34,
        0.3,
        null,
        { tint: [0.9, 0.88, 0.8] },
      );
    });
    for (let k = 0; k < 40; k++)
      b.hplate(
        "flat",
        -15 + r() * 30,
        BY + 0.012 + k * 0.0002,
        -45 + r() * 20,
        0.24,
        0.32,
        r() * 6,
        null,
        { tint: [0.88, 0.86, 0.78] },
      );
    // chandeliers (ring of bulbs) — one fallen into the seats
    for (const cz of [-32, -40]) {
      b.pipe("black_iron", 0, -1.5, cz, 0, -0.3, cz, 0.015, 4);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * PI * 2;
        const x = Math.cos(a) * 0.9,
          z = cz + Math.sin(a) * 0.9;
        b.pipe("brass", 0, -1.5, cz, x, -1.8, z, 0.01, 3);
        if (i % 3)
          b.geo("lamp", K.sphereGeo(), { x, y: -1.8, z, s: 0.05, tint: warm });
      }
      b.cyl("brass", 0, -1.85, cz, 0.95, 0.95, 0.05, 16, { top: false });
      b.light(0, -1.9, cz, warm, 1.15, 13, { box: HB });
      b.glow(0, -1.8, cz, [0.7, 0.55, 0.35], 3);
    }
    // wall sconces between the blind arches (half of them still burn)
    for (const sx of [-1, 1])
      for (const cz of [-29, -35, -41, -47]) {
        const x = sx * 17.85,
          on = (cz + (sx > 0 ? 6 : 0)) % 12 !== 0;
        b.box("brass", x, BY + 2.6, cz, 0.12, 0.3, 0.12, {});
        b.pipe("brass", x, BY + 2.75, cz, x - sx * 0.3, BY + 2.95, cz, 0.02, 4);
        if (on) {
          b.geo("lamp", K.sphereGeo(), {
            x: x - sx * 0.32,
            y: BY + 3.02,
            z: cz,
            s: 0.07,
            tint: warm,
          });
          b.light(x - sx * 0.8, BY + 3.0, cz, warm, 0.7, 6, { box: HB });
          b.glow(x - sx * 0.32, BY + 3.02, cz, [0.7, 0.5, 0.3], 0.9);
        }
      }
    b.cyl("brass", 11, BY + 0.5, -36, 0.95, 0.95, 0.05, 16, { top: false });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 6.28;
      b.pipe(
        "brass",
        11,
        BY + 0.9,
        -36,
        11 + Math.cos(a) * 0.9,
        BY + 0.5,
        -36 + Math.sin(a) * 0.9,
        0.01,
        3,
      );
    }
    K.rubble(b, 11, BY, -36, 1.4, 0.5, { seed: 31 });
    b.light(-14, BY + 2.2, -25, [1, 0.3, 0.15], 0.6, 5, { box: HB });
    b.glow(-17.7, BY + 2.4, -34, [1, 0.25, 0.1], 0.8);
    b.glow(0, BY + 2.9, -24.2, [1, 0.25, 0.1], 0.8);
    K.litter(b, -17, -46, 17, -25, BY, 24, 404);

    // ================================================= BASEMENT CORRIDOR & BACKSTAGE (reward room)
    const BCB = [-24.1, BY - 0.2, -62.1, -17.9, BY + 3.6, -29.9];
    K.room(b, ctx, {
      x0: -24,
      z0: -62,
      x1: -18,
      z1: -30,
      y: BY,
      h: 3.5,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "brick_red",
      wc: [0.55, 0.42, 0.36],
      ceil: "concrete",
      cc: [0.38, 0.37, 0.35],
      trim: false,
    });
    b.pipe("rust", -23.8, BY + 3.1, -62, -23.8, BY + 3.1, -30, 0.1, 6);
    b.pipe("metal", -18.3, BY + 3.2, -62, -18.3, BY + 3.2, -30, 0.06, 6, {
      tint: [0.4, 0.45, 0.4],
    });
    K.lamp(b, -21, BY + 3.0, -38, "cage", warm, 0.6, 7, {
      ceil: BY + 3.5,
      lightOpts: { box: BCB },
    });
    K.lamp(b, -21, BY + 3.0, -54, "cage", [1, 0.3, 0.15], 0.6, 6, {
      ceil: BY + 3.5,
      lightOpts: { box: BCB },
    });
    b.plate(
      "art",
      -18.1,
      BY + 2.0,
      -46,
      -1,
      0,
      2.2,
      0.5,
      K.signCell("cu_stage_door", "STAGE DOOR · FACULTY ONLY", 384, 80, {
        bg: "#1a1a1a",
        fg: "#e8d8b0",
        font: "Arial, sans-serif",
      }),
    );
    K.loot(ctx, "locker", -23.4, BY, -44, HP, {
      count: 3,
      loot: "locker",
      name: "Janitor's Lockers",
    });
    const BKB = [-18.1, BY - 0.2, -62.1, -3.9, BY + 4.1, -53.9];
    K.room(b, ctx, {
      x0: -18,
      z0: -62,
      x1: -4,
      z1: -54,
      y: BY,
      h: 4.0,
      floor: "wood",
      fc: [0.5, 0.4, 0.3],
      wall: "brick_red",
      wc: [0.6, 0.45, 0.38],
      ceil: "wood",
      cc: [0.4, 0.32, 0.25],
      trim: false,
      surface: "wood",
    });
    K.stairs(b, -9, -56.8, -7, -54.1, BY, BY + 1, "+z", {
      mat: "wood",
      tint: [0.5, 0.36, 0.26],
      rail: "l",
      railMat: "black_iron",
      handMat: "mahogany",
    });
    // Peter Cooper's workshop: the Tom Thumb locomotive model on a workbench
    const wb = K.table(b, -13, BY, -60.9, 3.4, 1.2, {
      mat: "wood_dark",
      h: 0.9,
    });
    const lx = -13,
      lz = -60.9,
      ly = wb;
    b.boxMM(
      "black_iron",
      lx - 0.7,
      ly,
      lz - 0.2,
      lx + 0.7,
      ly + 0.08,
      lz + 0.2,
      {},
    );
    b.cyl("copper", lx - 0.1, ly + 0.08, lz, 0.16, 0.16, 0.5, 10, {
      tint: [0.7, 0.45, 0.25],
    }); // upright boiler
    b.pipe(
      "black_iron",
      lx - 0.1,
      ly + 0.58,
      lz,
      lx - 0.1,
      ly + 0.85,
      lz,
      0.05,
      6,
    );
    for (const s of [-1, 1])
      for (const e of [-0.45, 0.45])
        b.geo("black_iron", K.unitCyl(10), {
          x: lx + e,
          y: ly + 0.1,
          z: lz + s * 0.22,
          sx: 0.13,
          sy: 0.03,
          sz: 0.13,
          rx: HP,
        });
    b.boxMM(
      "wood",
      lx + 0.25,
      ly + 0.08,
      lz - 0.18,
      lx + 0.7,
      ly + 0.28,
      lz + 0.18,
      { tint: [0.6, 0.45, 0.3] },
    );
    K.anchor(ctx, "tom_thumb", lx + 0.5, ly + 0.02, lz + 0.35);
    b.plate(
      "art",
      -13,
      BY + 2.2,
      -61.88,
      0,
      1,
      2.6,
      1.2,
      K.signCell(
        "cu_tomthumb",
        '"TOM THUMB" — 1830\nThe first American-built\nsteam locomotive, by P. Cooper.\nIt lost its race to a horse.',
        384,
        180,
        {
          bg: "#e8dcc0",
          fg: "#3a2a1a",
          font: "Georgia, serif",
          border: "#6a4a2a",
        },
      ),
    );
    K.framed(
      b,
      -4.12,
      BY + 2.1,
      -58,
      -1,
      0,
      1.2,
      1.5,
      K.painting(34, 160, 200),
      { frame: "gold" },
    );
    for (let k = 0; k < 4; k++)
      b.box(
        "wood",
        -16.8 + (k % 2) * 0.9,
        BY + Math.floor(k / 2) * 0.8,
        -55,
        0.8,
        0.8,
        0.8,
        { yaw: r() * 0.3, tint: [0.6, 0.48, 0.34] },
      );
    b.col(-17.3, BY, -55.5, -15.3, BY + 1.6, -54.5, {});
    K.lamp(b, -12, BY + 3.4, -58, "pendant", warm, 0.85, 7, {
      ceil: BY + 4,
      shade: "paint_green",
      lightOpts: { box: BKB },
    });
    K.loot(ctx, "safe", -4.6, BY, -61.2, -HP, {
      loot: "safe",
      name: "Founder's Strongbox",
      lock: K.regLock({
        id: "pev_lk_cu_strongbox",
        label: "Founder's Strongbox",
        kind: "safe",
        code: "1830",
        hint: "Professor Hewitt's robotics-lab teletype mentions it.",
      }),
    });
    K.loot(ctx, "crate", -6.5, BY, -56, 0.3, {
      kind: "teletype",
      loot: "weapon_crate",
      name: "Confiscated Items (Students)",
    });
    K.note(ctx, "pev_note_cu_cooper", -12.2, wb + 0.01, -60.6, {
      name: "Letter from Peter Cooper (copy)",
      title: "A letter, framed, much reproduced",
      text: '"My feelings have been deeply interested in the great work of education… I have endeavoured to provide a place where the young may acquire knowledge free, as free as water or air."\n\n— P. Cooper, 1859 (paraphrased on the plaque the Dean had made in 1966, right above the tuition schedule)',
    });

    // ================================================= doors, anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pev_cu_in",
      pos: new THREE.Vector3(DOOR_X, 1.4, PZ + 0.45),
      label: "Cooper Union Foundation Building",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.6, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("cooper_union")),
    });
    K.door(ctx, {
      id: "pev_cu_out",
      pos: new THREE.Vector3(OX, OY + 1.4, OZ - 0.35),
      label: "Cooper Square",
      verb: "Leave",
      target: { x: DOOR_X, y: 0.12, z: PZ + 2.2, yaw: PI },
    });
    K.anchor(ctx, "entrance", 0, 0, -1.6);
    K.anchor(ctx, "boss", 0, BY + 1, -49.2);
    K.anchor(ctx, "proctor", -9, F2, -18);
    K.anchor(ctx, "hall", 0, BY, -38);
    [
      [-3.5, 0, -7],
      [-16, 0, -5],
      [16, 0, -22],
      [-10, BY, -36],
      [9.5, BY, -41],
      [-12, F2, -17],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", -4.6, BY, -61.2);
    K.anchor(ctx, "loot2", 23.4, F2, -28.8);
    K.anchor(ctx, "loot3", -12, 0, -29.3);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_cooper_int";

    // the security shutter (separate so it can roll up)
    const sb = K.builder({
      name: "cu_shutter",
      off: O,
      lit: true,
      amb: [0.1, 0.1, 0.1],
      grime: 0.4,
    });
    sb.light(0, 2, -12.5, [1, 0.5, 0.3], 0.7, 5);
    sb.boxMM(
      "corrugated",
      SHUT.x0,
      0,
      SHUT.z - 0.12,
      SHUT.x1,
      3.2,
      SHUT.z + 0.08,
      { tint: [0.6, 0.6, 0.56], faces: "nsewtb" },
    );
    for (let k = 0; k < 6; k++)
      sb.boxMM(
        k % 2 ? "paint_black" : "paint_yellow",
        SHUT.x0 + (k * 4) / 6,
        0.1,
        SHUT.z + 0.09,
        SHUT.x0 + ((k + 1) * 4) / 6,
        0.5,
        SHUT.z + 0.11,
        { tint: k % 2 ? [0.08, 0.08, 0.08] : [0.8, 0.6, 0.12] },
      );
    sb.plate(
      "art",
      0,
      1.8,
      SHUT.z + 0.1,
      0,
      1,
      2.6,
      0.9,
      K.signCell(
        "cu_shut_sign",
        "GREAT HALL SEALED\nEXAMINATION IN PROGRESS",
        384,
        130,
        {
          bg: "#e0b020",
          fg: "#1a1a1a",
          font: "Arial Black, sans-serif",
          border: "#1a1a1a",
        },
      ),
    );
    const shutter = sb.finish(ctx.intRoot);
    ctx.shutter = { obj: shutter, col: null, t: 0, opening: false };
  }

  function shutterClosed(ctx) {
    const s = ctx.shutter;
    if (!s) return;
    s.opening = false;
    s.t = 0;
    s.obj.position.y = 0;
    s.obj.visible = true;
    s.obj.traverse((o) => {
      if (o.isMesh || o.isPoints) {
        o.matrixAutoUpdate = true;
      }
    });
    if (!s.col)
      s.col = G.world.addBox(
        ctx.O.x + SHUT.x0,
        ctx.O.y,
        ctx.O.z + SHUT.z - 0.15,
        ctx.O.x + SHUT.x1,
        ctx.O.y + 3.2,
        ctx.O.z + SHUT.z + 0.15,
        { tag: "poi_eastvillage", surface: "metal", walkable: false },
      );
  }
  function openShutter(ctx, instant) {
    const s = ctx.shutter;
    if (!s) return;
    if (s.col) {
      K.safe("shutcol", () => G.world.removeCollider(s.col));
      s.col = null;
    }
    if (instant) {
      s.obj.visible = false;
      s.opening = false;
      return;
    }
    if (!s.opening && s.obj.visible) {
      s.opening = true;
      s.t = 0;
      K.sfx("cryo_door", K.world(ctx, 0, 1.5, SHUT.z));
    }
  }
  EV.cuOpenShutter = function (instant) {
    EV.setFlag("cu_shutter", true);
    const ctx = EV.ctxs.find((c) => c.id === "cooper");
    if (ctx) openShutter(ctx, instant);
    if (K.q.active("pev_right_makes_might")) {
      const st = K.q.stage("pev_right_makes_might");
      if (st === "enter" || st === "override")
        K.q.set("pev_right_makes_might", "hall");
    }
  };

  // ==================================================================
  // TERMINALS
  // ==================================================================
  function termPanel() {
    return {
      title: "PROCTOR ACCESS PANEL — GREAT HALL",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nPROCTOR SYSTEM v2.3 — CAMPUS SECURITY",
      lock: {
        id: "pev_lk_cu_panel",
        passcode: "SEMINAR",
        key: "pev_cu_override_card",
        hint: "Abigail Hewitt remembers the faculty passcode; the Dean's override card also works.",
      },
      entries: [
        {
          title: "Examination Status",
          text: 'EXAM: CE 401 FINAL, SECTION B\nSTATUS: IN PROGRESS\nSTUDENTS PRESENT: 211\nSTUDENTS RESPONDING: 0\nNOTE: Non-responsive students will be marked "ABSENT" and EXPELLED at the next roll call. Next roll call: continuous.',
        },
        {
          title: "Raise Security Shutter",
          text: "Shutter override accepted. Please proceed quietly. The examination is still in progress.",
          action: () => EV.cuOpenShutter(false),
          cond: () => !EV.flag("cu_shutter"),
        },
        {
          title: "Proctor Unit Roster",
          text: 'UNIT P-01 "PROFESSOR LINCOLN-TRON" — Great Hall lectern (lecture & proctoring)\nUNIT P-02 "PROCTOR" — Library (silence enforcement)\nUNITS P-03..P-11 — hallways (truancy enforcement)\n\nAll units report: ALL STUDENTS SEATED. ALL STUDENTS QUIET. EXCELLENT DISCIPLINE.',
        },
      ],
    };
  }
  function termRobotics() {
    return {
      title: "ROBOTICS LAB — PROF. W. HEWITT",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nCOOPER UNION / ARDENT ROBOTICS TECHNICAL ACADEMY",
      entries: [
        {
          title: "Grant Memo: Ardent Partnership",
          text: 'The Board is pleased to announce the Ardent Robotics Technical Academy partnership. In exchange for naming rights, Ardent will supply eleven Proctor-model units to manage examinations, freeing faculty for research.\n\nThe founding principle of Cooper Union — education "free as air and water" — is unchanged. Tuition, however, is now $4,100 per semester.',
        },
        {
          title: "Note: the Founder's Strongbox",
          learn: "pev_lk_cu_strongbox",
          text: "Facilities asked again. The founder's strongbox in the sub-basement still uses Peter Cooper's own combination: 1-8-3-0, the year of his Tom Thumb engine. Nobody has opened it since 1959. Nobody will.",
        },
        {
          title: "Log: The Lincoln Program",
          text: 'For the Founders\' Day gala I have loaded P-01 with the complete text of Lincoln\'s 1860 address, a stovepipe hat and a voice synthesizer. The students find it hilarious. The Dean finds it "on brand."\n\nMinor bug: when interrupted, P-01 restarts the speech from the beginning. When interrupted by weapons fire, P-01 considers this "heckling" and removes the heckler.',
        },
        {
          title: "Log: March 5, 1967",
          text: "Sirens. The Proctors locked down the building per exam protocol — \"no student may leave during an examination.\" I tried to override. The Dean has the only override card.\n\nThe Dean is in his office. The Dean will not open his door. I am going to O'Rourke's to wait this out. Abigail, my love, if you read this, I'm sorry about the ale, and about the scholarship exam on a Sunday. It was my idea.",
        },
      ],
    };
  }
  function termDean() {
    return {
      title: "OFFICE OF THE DEAN",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nCOOPER UNION — ADMINISTRATION",
      lock: {
        id: "pev_lk_cu_dean",
        passcode: "STANDARDS",
        hint: "The study-group tape reel in the student lounge.",
      },
      entries: [
        {
          title: "Founders' Day Speech (draft 14)",
          text: '"...and as Lincoln said in this very building: Let us have faith that right makes might. And as I say: let us have faith that the Ardent partnership makes budget."\n\n[Note: cut the budget line? — no, keep, Board will love it]',
        },
        {
          title: "Office Safe",
          learn: "pev_lk_cu_dean_safe",
          text: "Safe combination: the year of our founding, 1-8-5-9. Even I can remember 1859. — Office of the Dean",
        },
        {
          title: "Memo: Proctor Override",
          text: "The Proctor override is a punch card kept in my desk. It is the ONLY override. Do not ask for it. Do not ask where my desk is. My desk is here. I am always at my desk.\n\nThe card also works at the Great Hall lectern to END an examination early, which I will never do, because standards.",
        },
        {
          title: "Personal Log — Mar 5",
          text: "The students are panicking. The Proctors are keeping them seated, which is, frankly, the first time the Proctors have done exactly what I asked.\n\nI could end the exam. The card is right here. But if I end it early, the Board will say I lowered standards.\n\nI will wait until the time runs out. It's a three-hour exam. How long can three hours be?",
        },
        {
          title: "Unlock Desk Drawer",
          text: "The desk drawer clicks open.",
          action: () => {
            EV.setFlag("cu_drawer", true);
            K.notify("The Dean's desk drawer is unlocked.");
            spawnOverride();
          },
          cond: () => !EV.flag("cu_drawer"),
        },
      ],
      onUnlock: () => {
        EV.setFlag("cu_dean_unlocked", true);
      },
    };
  }
  function termLectern() {
    return {
      title: "GREAT HALL LECTERN — PROCTOR MASTER CONTROL",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE PROTOCOL\nPROCTOR SYSTEM v2.3 — MASTER",
      lock: {
        id: "pev_lk_cu_lectern",
        key: "pev_cu_override_card",
        hint: "Only the Dean's override punch card (his desk drawer) works at the lectern.",
      },
      entries: [
        {
          title: "Lecture Queue",
          text: '1. "Address at Cooper Institute", A. Lincoln, Feb 27 1860 (loop)\n2. Pencils down (loop)\n3. Pencils down (loop)',
        },
        {
          title: "END EXAMINATION",
          text: "EXAMINATION CE 401 HAS ENDED.\nTIME: 11,571,840 MINUTES (OVERTIME)\nAVERAGE GRADE: INCOMPLETE\n\nProctor units are returning to their charging pods. Thank you for choosing the Ardent Robotics Technical Academy.",
          action: () => endExam(),
          cond: () => !EV.flag("cu_exam_over"),
        },
        {
          title: "Grade Report",
          text: 'All 211 students: INCOMPLETE.\nComment (auto-generated): "Showed up. Stayed. Did not finish." ',
          cond: () => !!EV.flag("cu_exam_over"),
        },
      ],
    };
  }
  function spawnOverride() {
    if (EV.flag("cu_card_taken") || K.has("pev_cu_override_card")) return;
    const a = EV.anchor("cooper", "override");
    if (a)
      K.safe("card", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup(
            "pev_cu_override_card",
            1,
            { x: a.x, y: a.y, z: a.z },
            { static: false, keepY: true, noSave: true },
          );
      });
  }
  function endExam() {
    EV.setFlag("cu_exam_over", true);
    EV.cuOpenShutter(true);
    // every robot in the building powers down
    let n = 0;
    K.safe("shutdown", () => {
      if (G.isStub("actors") || !G.actors.list) return;
      const c = EV.ctxs.find((q) => q.id === "cooper");
      if (!c) return;
      for (const a of G.actors.list()) {
        if (!a || a.dead || a.faction !== "robots") continue;
        if (Math.abs(a.pos.x - c.O.x) > 170 || Math.abs(a.pos.z - c.O.z) > 170)
          continue;
        // no killer: combat treats a non-actor `source` string as an actor (killer.bark / enterCombat), which threw
        // after the first robot and left the rest of the Proctors hostile
        K.safe("shutdown1", () => a.kill({ silent: true }));
        n++;
      }
    });
    K.notify(
      n
        ? "The Proctor units power down. (" + n + ")"
        : "The Proctor system shuts down.",
    );
    K.xp(150, "Ended the examination");
    K.standing(20, "Ended the eternal exam");
    if (K.q.active("pev_right_makes_might"))
      K.q.set("pev_right_makes_might", "return");
  }

  // ==================================================================
  // DATA (items, quest) & SPAWN
  // ==================================================================
  function data() {
    K.defineItem({
      id: "pev_cu_override_card",
      type: "key",
      name: "Dean's Override Punch Card",
      weight: 0,
      value: 0,
      quest: true,
      desc: 'A stiff manila punch card, "PROCTOR MASTER OVERRIDE — DEAN ONLY" printed across the top. Works at the Proctor access panel and the Great Hall lectern.',
    });
    K.defineItem({
      id: "pev_abe_hat",
      type: "apparel",
      slot: "head",
      name: "Honest Abe's Stovepipe Hat",
      weight: 1,
      value: 180,
      attrs: { presence: 1, wits: 1 },
      skills: { persuasion: 5 },
      mesh: "hat_top",
      tags: ["apparel", "hat", "unique"],
      desc: "Seven inches of black silk, prised off a robot that thought it was the sixteenth President. Smells faintly of ozone. Four score and seven percent more persuasive.",
    });
    K.defineItem({
      id: "pev_tom_thumb",
      type: "misc",
      name: "Tom Thumb Locomotive Model",
      weight: 3,
      value: 320,
      tags: ["valuable", "unique"],
      desc: "Peter Cooper's own brass-and-copper model of the Tom Thumb, America's first home-built steam engine (1830). The real one lost a race to a horse. This one has never lost anything, because it has never raced.",
    });
    K.defineItem({
      id: "pev_cu_diploma",
      type: "misc",
      name: "Cooper Union Diploma (Incomplete)",
      weight: 0.2,
      value: 5,
      tags: ["unique"],
      desc: 'Hand-lettered by Abigail Hewitt on the back of a library card. "Awarded for ending the longest final examination in history. Grade: INCOMPLETE. Honors: Highest."',
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pev_right_makes_might",
        name: "Right Makes Might",
        giver: "Abigail Hewitt",
        location: "Cooper Union",
        desc: 'Abigail Hewitt, who was once Cooper Union\'s librarian, wants her school back. Since March 1967 the Ardent Robotics "Proctor" robots have kept the Foundation Building locked in an endless Sunday scholarship exam — and they expel truants with ray emitters.',
        stages: [
          {
            id: "enter",
            text: "Get into the Cooper Union Foundation Building on Cooper Square.",
            markers: [
              () => {
                const c = EV.ctxs.find((q) => q.id === "cooper");
                const a = c && c.anchors.door;
                return a ? { x: a.x, z: a.z, label: "Cooper Union" } : null;
              },
            ],
          },
          {
            id: "override",
            text: "Find the Dean's override punch card (Dean's office, second floor).",
            markers: [
              () => {
                const a = EV.anchor("cooper", "override");
                return a
                  ? {
                      x: a.x,
                      z: a.z,
                      y: a.y,
                      label: "Dean's Office",
                      interior: "cooper_union",
                    }
                  : null;
              },
            ],
          },
          {
            id: "hall",
            text: "Reach the Great Hall and end the examination at the lectern.",
            markers: [
              () => {
                const a = EV.anchor("cooper", "boss");
                return a
                  ? {
                      x: a.x,
                      z: a.z,
                      y: a.y,
                      label: "Great Hall Lectern",
                      interior: "cooper_union",
                    }
                  : null;
              },
            ],
          },
          {
            id: "return",
            text: "Tell Abigail Hewitt at O'Rourke's that the exam is over.",
            markers: [{ npc: "pev_abigail", label: "Abigail" }],
          },
        ],
        rewards: { xp: 300, scrip: 120, standing: 10 },
      });
    }
  }
  function spawn(ctx) {
    const A = ctx.anchors;
    // shutter state
    if (EV.flag("cu_shutter") || EV.flag("cu_exam_over"))
      openShutter(ctx, true);
    else shutterClosed(ctx);
    if (EV.flag("cu_drawer") && !EV.flag("cu_card_taken")) spawnOverride();
    if (!EV.flag("tom_thumb_taken"))
      K.safe("tt", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup(
            "pev_tom_thumb",
            1,
            { x: A.tom_thumb.x, y: A.tom_thumb.y, z: A.tom_thumb.z },
            { static: false, keepY: true, noSave: true },
          );
      });
    if (!EV.flag("cu_exam_over")) {
      // PROFESSOR LINCOLN-TRON (boss) on the stage + the library's silence enforcer
      if (!EV.flag("lincoln_dead")) {
        const a = EV.spawnActor(ctx, {
          id: "pev_lincolntron",
          type: "patrolman",
          name: "Professor Lincoln-Tron",
          faction: "robots",
          level: 8,
          hostile: true,
          hp: 260,
          dr: 20,
          damage: 1.3,
          pos: v(A.boss),
          yaw: 0,
          ai: "guard",
          home: "here",
          homeR: 6,
          noRespawn: true,
          aggroRange: 22,
          xp: 160,
          inventory: [
            ["pev_abe_hat", 1],
            ["ammo_dry_cell", 3],
          ],
          voice: "robot",
          barks: [
            "Four score and— HECKLER DETECTED.",
            "Let us have faith that right makes might!",
            "Pencils. Down.",
            "A house divided against itself cannot pass this exam.",
            "You are TARDY.",
          ],
          onDeath: () => {
            EV.setFlag("lincoln_dead", true);
            K.notify("Professor Lincoln-Tron has been expelled.");
          },
        });
        if (a) K.safe("hat", () => addStovepipe(a));
      }
      if (!EV.flag("proctor_dead")) {
        EV.spawnActor(ctx, {
          id: "pev_cu_proctor",
          type: "valet",
          name: "Proctor",
          faction: "robots",
          level: 6,
          hostile: true,
          pos: v(A.proctor),
          yaw: 0,
          ai: "patrol",
          patrol: [
            { x: A.proctor.x, z: A.proctor.z },
            { x: A.proctor.x + 8, z: A.proctor.z + 10 },
            { x: A.proctor.x - 6, z: A.proctor.z + 14 },
          ],
          noRespawn: true,
          voice: "robot",
          barks: [
            "SHHHHH.",
            "This is a LIBRARY.",
            "Your library card has EXPIRED. So will you.",
          ],
          onDeath: () => EV.setFlag("proctor_dead", true),
        });
      }
    }
    // radioactive spill in the chem lab (static source, re-added per game)
    ctx.radHandles = ctx.radHandles || [];
    if (!ctx.radHandles.length)
      for (const s of ctx.radSpots || [])
        K.safe("rad", () =>
          ctx.radHandles.push(
            G.world.addRadSource({
              x: s.x + ctx.O.x,
              y: s.y + ctx.O.y,
              z: s.z + ctx.O.z,
              radius: s.radius,
              strength: s.strength,
            }),
          ),
        );
  }
  function addStovepipe(a) {
    const head = a.char && a.char.parts && a.char.parts.head;
    if (!head) return;
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.6,
    });
    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.14, 0.34, 14),
      m,
    );
    crown.position.y = 0.3;
    const brim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.02, 16),
      m,
    );
    brim.position.y = 0.13;
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(0.152, 0.152, 0.05, 14),
      new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.8 }),
    );
    band.position.y = 0.17;
    g.add(crown, brim, band);
    head.add(g);
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  function update(dt, realDt, ctx) {
    const s = ctx.shutter;
    if (s && s.opening) {
      s.t += realDt;
      s.obj.position.y = Math.min(3.1, s.t * 1.2);
      if (s.t > 2.8) {
        s.opening = false;
        s.obj.visible = false;
      }
    }
  }
  function reset(ctx) {
    for (const h of ctx.radHandles || [])
      K.safe("unrad", () => G.world.removeRadSource(h));
    ctx.radHandles = [];
  }

  G.events.on("itemAdded", (id) => {
    if (id === "pev_cu_override_card") {
      EV.setFlag("cu_card_taken", true);
      if (!K.q.started("pev_right_makes_might"))
        K.q.start("pev_right_makes_might");
      if (K.q.active("pev_right_makes_might")) {
        const st = K.q.stage("pev_right_makes_might");
        if (st === "enter" || st === "override")
          K.q.set("pev_right_makes_might", "hall");
      }
    }
    if (id === "pev_tom_thumb") EV.setFlag("tom_thumb_taken", true);
  });
  G.events.on("doorTransition", (def) => {
    if (
      def &&
      def.id === "pev_cu_in" &&
      K.q.active("pev_right_makes_might") &&
      K.q.stage("pev_right_makes_might") === "enter"
    )
      K.q.set("pev_right_makes_might", "override");
  });

  EV.define({
    id: "cooper",
    name: "Cooper Union Foundation Building",
    interior: "cooper_union",
    order: 10,
    lift: 6,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
    reset,
  });
})();
