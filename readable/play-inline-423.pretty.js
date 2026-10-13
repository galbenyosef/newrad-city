/* src/poi_harbor2/11_whitehall_interior.js */
/* =====================================================================
 * NEW RAD CITY — poi_harbor2 / 11_whitehall_interior.js
 * WHITEHALL FERRY TERMINAL — interior cell 'whitehall_terminal'
 * (origin 10200,0,1600, lifted +6 like every kit interior).
 *
 *  WAITING ROOM (x −18..18, z −10..10, 11 m, clerestory to 14):
 *   north: the street doors under five tall daylight arches · centre: the
 *   round INFORMATION kiosk with its four-faced clock — Big Bertha's counter
 *   now · south: SLIP 1 (open, to the ferry), SLIP 2 (accordion gate shut),
 *   SLIP 3 (boarded, water seeping under) and the split-flap DEPARTURES board
 *   frozen on the morning of the war · west: ticket windows (Fare-Bot,
 *   Brass Kowalski's guns, Doc Ferris) and the stair to the galleries ·
 *   east: newsstand; caravan camp on the floor (bedrolls, drum fire,
 *   laundry, pack saddles); rows of oak benches.
 *   GALLERIES (y 4.8): north lookout; east gallery = bunks + the Caravan
 *   Guild office (ledger terminal, route map, strongbox).
 *  M/V MARGARET CORBIN (z 30..62): the forward vestibule, the long passenger
 *   cabin (window benches, back-to-back benches, harbour views), the SLACK
 *   TIDE bar in the stern, the engine-room hatch → ENGINE ROOM (flooded until
 *   "Slack Water" is done: Gus's pump, twin diesels, pipe runs).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._ph2;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // Pew / bench with back: length along x, seat faces +z (dir 1) or −z (dir −1)
  function pew(b, x, y, z, len, dir, o) {
    o = o || {};
    const mat = o.mat || "oak",
      t = o.tint || [0.62, 0.46, 0.3];
    b.box(mat, x, y + 0.42, z, len, 0.06, 0.46, { tint: t, faces: "nsewtb" });
    b.box(mat, x, y + 0.48, z - dir * 0.24, len, 0.52, 0.06, {
      tint: t,
      faces: "nsewtb",
    });
    for (const e of [-1, 1])
      b.box(
        mat,
        x + e * (len / 2 - 0.03),
        y,
        z - dir * 0.02,
        0.06,
        0.78,
        0.52,
        { tint: t.map((v) => v * 0.85) },
      );
    for (let k = 1; k < Math.floor(len / 1.6); k++)
      b.box(
        "cast_iron",
        x - len / 2 + (k * len) / Math.floor(len / 1.6),
        y,
        z,
        0.05,
        0.42,
        0.4,
      );
    if (o.col !== false)
      b.col(x - len / 2, y, z - 0.3, x + len / 2, y + 0.5, z + 0.3, {
        tag: "furniture",
        surface: "wood",
      });
  }

  PV.whInterior = function (ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "wh_int",
      off: O,
      lit: true,
      amb: [0.1, 0.1, 0.105],
      floors: [0, 4.8, -3.4],
      grime: 0.5,
    });
    const r = K.rng("wh_int");
    const A = (name, x, y, z, yaw) => {
      const v = K.anchor(ctx, name, x, y, z);
      v.yaw = yaw || 0;
      return v;
    };
    const cream = [0.9, 0.86, 0.74],
      green = [0.62, 0.78, 0.66];
    const X0 = -18,
      X1 = 18,
      Z0 = -10,
      Z1 = 10,
      H = 11,
      GY = 4.8;
    const HALL = [X0 - 1, -4, Z0 - 1, X1 + 1, 15, Z1 + 1];

    // ================================================= WAITING ROOM shell
    K.gap(ctx, 0, Z0, 2.8, 0, 3.4); // street doors
    for (const x of [-12, 0, 12])
      K.gap(ctx, x, Z1, 4.0, 0, 5.0, { casing: false }); // slip gates
    K.room(b, ctx, {
      x0: X0,
      z0: Z0,
      x1: X1,
      z1: Z1,
      y: 0,
      h: H,
      floor: "terrazzo",
      fc: [0.86, 0.82, 0.74],
      wall: "plaster",
      wc: cream,
      wain: "glaze",
      wainH: 2.2,
      wainC: [0.96, 0.92, 0.8],
      noCeil: true,
      trimMat: "ferry_green",
      casingMat: "ferry_green",
    });
    // floor border inlay + the slip-way arrows painted on the terrazzo
    b.boxMM(
      "brass_old",
      X0 + 1.2,
      0.004,
      Z0 + 1.2,
      X1 - 1.2,
      0.012,
      Z0 + 1.35,
      { tint: [0.8, 0.66, 0.4] },
    );
    b.boxMM(
      "brass_old",
      X0 + 1.2,
      0.004,
      Z1 - 1.35,
      X1 - 1.2,
      0.012,
      Z1 - 1.2,
      { tint: [0.8, 0.66, 0.4] },
    );
    const arrow = K.paint("art", "ph2_wh_arrow", 128, 256, (x, X, Y, W, Hh) => {
      x.clearRect(X, Y, W, Hh);
      x.fillStyle = "rgba(210,170,60,0.75)";
      x.beginPath();
      x.moveTo(X + W / 2, Y + 8);
      x.lineTo(X + W - 10, Y + Hh * 0.4);
      x.lineTo(X + W * 0.66, Y + Hh * 0.4);
      x.lineTo(X + W * 0.66, Y + Hh - 8);
      x.lineTo(X + W * 0.34, Y + Hh - 8);
      x.lineTo(X + W * 0.34, Y + Hh * 0.4);
      x.lineTo(X + 10, Y + Hh * 0.4);
      x.closePath();
      x.fill();
      K.grain(x, X, Y, W, Hh, 60, 3);
    });
    for (const x of [-12, 0, 12])
      b.hplate("decal", x, 0.014, 7.2, 1.1, 2.2, PI, arrow);
    // ceiling with the clerestory opening (monitor x −13..13, z −4..4)
    const CX0 = -13,
      CX1 = 13,
      CZ0 = -4,
      CZ1 = 4,
      MH = 14;
    const ceil = (x0, z0, x1, z1) =>
      b.face("pressed", x0, H, z0, 1, 0, 0, 0, 0, 1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: green,
        grime: 0.3,
      });
    ceil(X0, Z0, X1, CZ0);
    ceil(X0, CZ1, X1, Z1);
    ceil(X0, CZ0, CX0, CZ1);
    ceil(CX1, CZ0, X1, CZ1);
    // monitor: glazed walls (daylight) + roof, trusses across the hall
    for (const [z, nz] of [
      [CZ0, 1],
      [CZ1, -1],
    ]) {
      b.quadN(
        "plaster",
        [CX0, H, z],
        [CX1, H, z],
        [CX1, H + 0.6, z],
        [CX0, H + 0.6, z],
        [0, 0, nz],
        { tint: cream },
      );
      for (let x = CX0 + 0.8; x < CX1 - 0.4; x += 1.6) {
        const broken = r() < 0.3;
        b.quadN(
          "lamp",
          [x - 0.7, H + 0.6, z],
          [x + 0.7, H + 0.6, z],
          [x + 0.7, MH - 0.3, z],
          [x - 0.7, MH - 0.3, z],
          [0, 0, nz],
          { tint: broken ? [0.75, 0.8, 0.82] : [0.46, 0.52, 0.5] },
        );
        b.box(
          "ferry_green",
          x + 0.8,
          H + 0.6,
          z + nz * 0.05,
          0.12,
          MH - H - 0.9,
          0.1,
          { tint: green },
        );
      }
      b.quadN(
        "plaster",
        [CX0, MH - 0.3, z],
        [CX1, MH - 0.3, z],
        [CX1, MH, z],
        [CX0, MH, z],
        [0, 0, nz],
        { tint: cream },
      );
    }
    for (const x of [CX0, CX1])
      b.quadN(
        "plaster",
        [x, H, CZ0],
        [x, H, CZ1],
        [x, MH, CZ1],
        [x, MH, CZ0],
        [x < 0 ? 1 : -1, 0, 0],
        { tint: cream },
      );
    b.face("pressed", CX0, MH, CZ0, 1, 0, 0, 0, 0, 1, CX1 - CX0, CZ1 - CZ0, {
      uv: "top",
      tint: green,
      grime: 0.3,
    });
    for (let x = X0 + 4.5; x < X1; x += 4.5) {
      b.beam("ferry_green", x, H - 0.35, Z0, x, H - 0.35, Z1, 0.3, 0.5, {
        tint: green,
      });
      for (let z = Z0 + 2; z < Z1; z += 4)
        b.beam("ferry_green", x, H - 0.6, z, x, H - 0.1, z + 2, 0.08, 0.08, {
          tint: green,
        });
    }
    // daylight: the monitor glass + the north arches
    for (let x = -10; x <= 10; x += 5)
      b.light(x, H + 1.5, 0, [0.72, 0.78, 0.82], 0.85, 15, { box: HALL });
    // north wall: the five arches (lit from the street) above the dado
    [-14.4, -7.2, 0, 7.2, 14.4].forEach((x, i) => {
      if (i === 2) {
        b.quadN(
          "lamp",
          [x - 2.2, 3.6, Z0 + 0.12],
          [x + 2.2, 3.6, Z0 + 0.12],
          [x + 2.2, 6.0, Z0 + 0.12],
          [x - 2.2, 6.0, Z0 + 0.12],
          [0, 0, 1],
          { tint: [0.62, 0.66, 0.64] },
        );
      } else
        K.archWin(b, x, 2.4, Z0 + 0.1, 0, 1, 3.8, 5.6, {
          state: i === 0 ? "boarded" : "lit",
          paneTint: [0.58, 0.62, 0.6],
          surround: "pressed",
          surroundTint: green,
          frame: "ferry_green",
          fw: 0.25,
          depth: 0.2,
          sill: true,
        });
      if (i !== 0)
        b.light(x, 4.5, Z0 + 1.5, [0.7, 0.74, 0.76], 0.55, 8, { box: HALL });
    });
    // street doors (inside face): green double doors, transom
    for (const e of [-1, 1])
      b.boxMM(
        "ferry_green",
        e < 0 ? -1.38 : 0.02,
        0,
        Z0 + 0.1,
        e < 0 ? -0.02 : 1.38,
        3.3,
        Z0 + 0.18,
        { tint: [0.56, 0.7, 0.6] },
      );
    b.plate(
      "art",
      0,
      3.75,
      Z0 + 0.12,
      0,
      1,
      2.4,
      0.4,
      K.signCell("wh_exit", "TO STREET · SOUTH FERRY PLAZA", 384, 64, {
        bg: "#1c2a24",
        fg: "#e8d8a8",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );

    // ================================================= galleries (north + east) with iron columns
    const gal = (x0, z0, x1, z1) => {
      b.boxMM("wood", x0, GY - 0.3, z0, x1, GY, z1, {
        tint: [0.62, 0.5, 0.38],
        faces: "nsewtb",
      });
      b.col(x0, GY - 0.3, z0, x1, GY, z1, { tag: "floor", surface: "wood" });
    };
    gal(X0, Z0, X1, -6.5);
    gal(14.5, -6.5, X1, Z1);
    K.railing(b, -15.9, -6.5, 14.5, -6.5, GY, {
      mat: "ferry_green",
      handMat: "mahogany",
      h: 1.05,
    });
    K.railing(b, 14.5, -6.5, 14.5, Z1 - 0.2, GY, {
      mat: "ferry_green",
      handMat: "mahogany",
      h: 1.05,
    });
    // gallery columns: symmetric about the street doors (x = 0) so the entrance axis stays open — a pair frames the doors
    const GCOLS = [-15.75, -11.25, -6.75, -2.25, 2.25, 6.75, 11.25, 14.5];
    for (const x of GCOLS)
      K.column(b, x, 0, -6.5, 0.16, GY - 0.3, {
        kind: "iron",
        mat: "ferry_green",
        tint: green,
      });
    for (let z = -2; z <= 10; z += 4)
      K.column(b, 14.5, 0, Math.min(z, 9.6), 0.16, GY - 0.3, {
        kind: "iron",
        mat: "ferry_green",
        tint: green,
      });
    for (const x of GCOLS)
      b.col(x - 0.25, 0, -6.75, x + 0.25, GY - 0.3, -6.25, {
        tag: "column",
        walkable: false,
      });
    for (let z = -2; z <= 10; z += 4)
      b.col(
        14.25,
        0,
        Math.min(z, 9.6) - 0.25,
        14.75,
        GY - 0.3,
        Math.min(z, 9.6) + 0.25,
        { tag: "column", walkable: false },
      );
    // stair along the west wall up to the north gallery
    K.stairs(b, X0 + 0.1, -6.5, X0 + 1.9, 2.4, 0, GY, "-z", {
      mat: "terrazzo",
      nosing: "brass_old",
      rail: "r",
      railMat: "ferry_green",
      tint: [0.8, 0.76, 0.7],
    });
    b.plate(
      "art",
      X0 + 0.12,
      1.9,
      3.3,
      1,
      0,
      1.2,
      0.35,
      K.signCell("wh_galsign", "GALLERY · CARAVAN GUILD", 384, 64, {
        bg: "#1c2a24",
        fg: "#e8d8a8",
        font: "Georgia, serif",
      }),
      { off: 0.03 },
    );
    // gallery lighting: pendant lamps under the gallery + on it
    for (let x = -12; x <= 12; x += 6) {
      K.lamp(b, x, GY - 0.9, -8.2, "pendant", [1, 0.8, 0.55], 0.55, 6, {
        ceil: GY - 0.3,
        lightOpts: { box: HALL },
      });
      K.lamp(b, x + 3, H - 1.4, -8.2, "globe", [1, 0.82, 0.6], 0.4, 6, {
        ceil: H,
        dead: x === 0,
        lightOpts: { box: HALL },
      });
    }

    // ================================================= information kiosk (Big Bertha)
    const KX = 0,
      KZ = -1.5,
      KR = 1.9;
    K.ringWall(
      b,
      "mahogany",
      KX,
      KZ,
      KR,
      0,
      1.1,
      -PI * 0.35,
      PI * 1.35,
      14,
      false,
      { tint: [0.55, 0.36, 0.24], col: false },
    );
    K.annulus(b, "marble", KX, 1.1, KZ, KR - 0.35, KR + 0.1, 14, true, {
      a0: -PI * 0.35,
      arc: PI * 1.7,
      tint: [0.8, 0.78, 0.72],
    });
    for (let k = 0; k < 8; k++) {
      const a = -PI * 0.35 + (k / 7) * PI * 1.7;
      b.pipe(
        "brass",
        KX + Math.cos(a) * KR,
        1.1,
        KZ - Math.sin(a) * KR,
        KX + Math.cos(a) * KR,
        2.5,
        KZ - Math.sin(a) * KR,
        0.035,
        6,
      );
    }
    for (let k = 0; k < 6; k++) {
      const a0 = -PI * 0.35 + (k / 6) * PI * 1.7,
        a1 = -PI * 0.35 + ((k + 1) / 6) * PI * 1.7;
      b.beam(
        "brass",
        KX + Math.cos(a0) * KR,
        1.8,
        KZ - Math.sin(a0) * KR,
        KX + Math.cos(a1) * KR,
        1.8,
        KZ - Math.sin(a1) * KR,
        0.03,
        0.03,
      );
    }
    b.cyl("mahogany", KX, 2.5, KZ, KR + 0.25, KR + 0.25, 0.3, 16, {
      tint: [0.5, 0.32, 0.2],
      bottom: true,
    });
    b.cyl("ferry_green", KX, 2.8, KZ, 0.7, 0.7, 1.0, 12, { tint: green });
    const kdial = K.paint("art", "ph2_wh_kdial", 128, 128, (x, X, Y, W, Hh) => {
      const cx = X + W / 2,
        cy = Y + Hh / 2;
      x.fillStyle = "#ece4cc";
      x.beginPath();
      x.arc(cx, cy, W * 0.47, 0, 6.3);
      x.fill();
      x.strokeStyle = "#2a2622";
      x.lineWidth = 3;
      x.stroke();
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * 6.283;
        x.fillStyle = "#2a2622";
        x.fillRect(
          cx + Math.cos(a) * W * 0.38 - 2,
          cy + Math.sin(a) * W * 0.38 - 2,
          5,
          5,
        );
      }
      x.strokeStyle = "#1a1a1a";
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(cx, cy);
      x.lineTo(cx - W * 0.22, cy - W * 0.04);
      x.stroke();
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(cx, cy);
      x.lineTo(cx - W * 0.14, cy - W * 0.34);
      x.stroke();
      K.stains(x, X, Y, W, Hh, 5, 471, 0.4, [60, 45, 25]);
    });
    for (let k = 0; k < 4; k++) {
      const a = k * HP,
        nx = Math.sin(a),
        nz = Math.cos(a);
      b.plate(
        "art",
        KX + nx * 0.71,
        3.3,
        KZ + nz * 0.71,
        nx,
        nz,
        0.8,
        0.8,
        kdial,
        { off: 0.01 },
      );
    }
    K.dome(b, "patina", KX, 3.8, KZ, 0.8, 0.5, 0, 12, 3, false, {
      tint: [0.5, 0.66, 0.56],
    });
    b.plate(
      "art",
      KX,
      2.65,
      KZ - KR - 0.26,
      0,
      -1,
      2.0,
      0.28,
      K.signCell("wh_info", "INFORMATION", 384, 56, {
        bg: "#1c2a24",
        fg: "#e8d8a8",
        font: "Georgia, serif",
      }),
      { off: 0.0 },
    );
    b.col(KX - KR, 0, KZ - KR, KX + KR, 1.1, KZ - 0.2, {
      tag: "counter",
      surface: "wood",
    });
    b.col(KX - KR, 0, KZ - 0.2, KX - KR + 0.35, 1.1, KZ + 1.3, {
      tag: "counter",
      surface: "wood",
    });
    b.col(KX + KR - 0.35, 0, KZ - 0.2, KX + KR, 1.1, KZ + 1.3, {
      tag: "counter",
      surface: "wood",
    });
    K.lamp(b, KX, 2.35, KZ, "bulb", [1, 0.84, 0.6], 0.8, 5, {
      ceil: 2.5,
      lightOpts: { box: HALL },
    });
    b.box("paint_black", KX + 0.8, 1.1, KZ - 1.2, 0.4, 0.3, 0.3); // cash box
    b.box("fabric", KX - 0.9, 1.1, KZ - 1.1, 0.45, 0.06, 0.32, {
      tint: [0.8, 0.76, 0.6],
      yaw: 0.3,
    }); // the ledger
    A("rosa", KX, 0, KZ + 0.2, 0);
    A("merchant", KX, 0, KZ + 0.2, 0);

    // ================================================= benches (face the slip gates)
    for (const side of [-1, 1])
      for (let k = 0; k < 5; k++) {
        const z = 1.6 + k * 1.5,
          x = side * 7.2;
        if (side > 0 && k === 3) {
          b.box("oak", x + 1.2, 0, z, 3.2, 0.5, 0.5, {
            yaw: 0.35,
            tint: [0.5, 0.38, 0.26],
          });
          continue;
        } // overturned
        pew(b, x, 0, z, 7.2, 1);
      }
    A("sit1", -8.5, 0.05, 3.1, PI);
    A("sit2", 6.2, 0.05, 1.6, PI);

    // ================================================= slip gates + departures board
    const gateSign = (i, t, bg, fg) =>
      K.signCell("wh_gate" + i, t, 384, 96, {
        bg,
        fg,
        font: "Georgia, serif",
        border: "#c8a040",
      });
    [-12, 0, 12].forEach((x, i) => {
      // arched top panel over each gate
      K.archWin(b, x, 5.0, Z1 - 0.1, 0, -1, 4.0, 2.4, {
        state: "lit",
        paneTint: [0.5, 0.55, 0.54],
        surround: "pressed",
        surroundTint: green,
        frame: "ferry_green",
        fw: 0.25,
        depth: 0.2,
        sill: false,
        keystone: false,
      });
      b.plate(
        "art",
        x,
        4.55,
        Z1 - 0.15,
        0,
        -1,
        3.4,
        0.7,
        gateSign(i, "SLIP " + (i + 1), "#1c2a24", "#f0dca0"),
        { off: 0.02 },
      );
      for (const e of [-1, 1])
        b.boxMM(
          "ferry_green",
          x + e * 2.0 - 0.15,
          0,
          Z1 - 0.3,
          x + e * 2.0 + 0.15,
          5.0,
          Z1,
          { tint: green },
        );
      if (i === 0) {
        // open gate: accordion folded to the sides, gangway glow beyond
        for (const e of [-1, 1])
          for (let k = 0; k < 6; k++)
            b.beam(
              "black_iron",
              x + e * (1.75 - k * 0.04),
              0.05,
              Z1 - 0.2,
              x + e * (1.75 - k * 0.04),
              3.3,
              Z1 - 0.2 + (k % 2) * 0.12,
              0.03,
              0.03,
            );
        b.quadN(
          "lamp",
          [x - 1.85, 0, Z1 + 0.4],
          [x + 1.85, 0, Z1 + 0.4],
          [x + 1.85, 5, Z1 + 0.4],
          [x - 1.85, 5, Z1 + 0.4],
          [0, 0, -1],
          { tint: [0.4, 0.34, 0.26] },
        );
        b.plate(
          "art",
          x + 2.6,
          2.0,
          Z1 - 0.15,
          0,
          -1,
          1.2,
          0.6,
          K.signCell("wh_slack", "THE SLACK TIDE\n→ aboard", 256, 128, {
            bg: "#2a1a24",
            fg: "#ffc0e0",
            font: "Georgia, serif",
            border: "#ff70c0",
          }),
          { off: 0.02 },
        );
        b.light(x, 2.5, Z1 - 1.5, [1, 0.72, 0.5], 0.6, 6, { box: HALL });
      } else {
        // closed accordion gate
        for (let k = 0; k <= 16; k++) {
          const xx = x - 1.85 + (k * 3.7) / 16;
          b.beam(
            "black_iron",
            xx,
            0.05,
            Z1 - 0.18 + (k % 2) * 0.1,
            xx,
            3.4,
            Z1 - 0.18 + (k % 2) * 0.1,
            0.03,
            0.03,
          );
        }
        for (let k = 0; k < 7; k++) {
          const xx = x - 1.85 + (k * 3.7) / 6;
          b.beam(
            "black_iron",
            xx - 0.25,
            0.3,
            Z1 - 0.14,
            xx + 0.25,
            3.2,
            Z1 - 0.14,
            0.025,
            0.025,
          );
          b.beam(
            "black_iron",
            xx + 0.25,
            0.3,
            Z1 - 0.14,
            xx - 0.25,
            3.2,
            Z1 - 0.14,
            0.025,
            0.025,
          );
        }
        b.beam(
          "black_iron",
          x - 1.9,
          3.4,
          Z1 - 0.15,
          x + 1.9,
          3.4,
          Z1 - 0.15,
          0.08,
          0.12,
        );
        b.quadN(
          "paint_black",
          [x - 1.85, 0, Z1 + 0.3],
          [x + 1.85, 0, Z1 + 0.3],
          [x + 1.85, 5, Z1 + 0.3],
          [x - 1.85, 5, Z1 + 0.3],
          [0, 0, -1],
          { tint: [0.03, 0.03, 0.03] },
        );
        b.col(x - 2, 0, Z1 - 0.3, x + 2, 5, Z1, {
          tag: "gate",
          surface: "metal",
          walkable: false,
        });
        if (i === 1) {
          b.pipe(
            "rust",
            x - 0.3,
            1.1,
            Z1 - 0.24,
            x + 0.3,
            1.2,
            Z1 - 0.24,
            0.03,
            4,
          );
          b.box("rust", x, 0.95, Z1 - 0.3, 0.14, 0.2, 0.08);
          b.plate(
            "art",
            x,
            1.9,
            Z1 - 0.3,
            0,
            -1,
            1.1,
            0.5,
            gateSign(9, "CLOSED\nAPRON DOWN", "#c8a030", "#1a1a1a"),
            { off: 0.01 },
          );
        } else {
          for (let k = 0; k < 5; k++)
            b.beam(
              "wood_rotten",
              x - 2.0,
              0.5 + k * 0.6 + r() * 0.2,
              Z1 - 0.35,
              x + 2.0,
              0.5 + k * 0.6 + r() * 0.2,
              Z1 - 0.35,
              0.28,
              0.05,
              { tint: [0.6, 0.5, 0.4] },
            );
          b.hplate(
            "decal",
            x,
            0.013,
            Z1 - 1.4,
            4.5,
            3,
            0.2,
            K.decal("puddle", 7),
          );
          b.hplate(
            "decal",
            x - 1,
            0.014,
            Z1 - 3.2,
            3,
            2.4,
            1.2,
            K.decal("puddle", 8),
          );
        }
      }
    });
    const board = K.paint(
      "art",
      "ph2_wh_departures_board",
      1024,
      320,
      (x, X, Y, W, Hh) => {
        x.fillStyle = "#121412";
        x.fillRect(X, Y, W, Hh);
        x.fillStyle = "#f0c040";
        x.font = 'bold 40px "Courier New", monospace';
        x.textBaseline = "middle";
        x.fillText("DEPARTURES", X + 30, Y + 34);
        x.fillText("MAR 5", X + W - 200, Y + 34);
        const rows = [
          ["9:30", "ST. GEORGE", "BOARDING"],
          ["9:45", "ST. GEORGE", "DEPARTED"],
          ["10:00", "ST. GEORGE", "CANCELLED"],
          ["10:15", "GOVERNORS IS.", "CANCELLED"],
          ["10:30", "ST. GEORGE", "CANCELLED"],
        ];
        rows.forEach((rw, i) => {
          const y = Y + 90 + i * 46;
          for (let c = 0; c < 26; c++) {
            x.fillStyle = "#1e221e";
            x.fillRect(X + 24 + c * 37, y - 18, 33, 38);
            x.fillStyle = "#0a0b0a";
            x.fillRect(X + 24 + c * 37, y, 33, 1.5);
          }
          x.fillStyle = i === 0 ? "#f8d060" : "#e8e0c8";
          x.fillText(rw[0], X + 32, y);
          x.fillText(rw[1], X + 250, y);
          x.fillStyle = rw[2] === "CANCELLED" ? "#f06040" : "#f8d060";
          x.fillText(rw[2], X + 680, y);
        });
        K.stains(x, X, Y, W, Hh, 10, 481, 0.35, [60, 50, 30]);
      },
    );
    b.boxMM("black_iron", -7.2, 6.6, Z1 - 0.35, 7.2, 9.6, Z1 - 0.05, {
      tint: [0.2, 0.2, 0.2],
    });
    b.plate("art", 0, 8.1, Z1 - 0.35, 0, -1, 14, 2.8, board, { off: 0.01 });
    b.glow(0, 8.1, Z1 - 0.6, [0.35, 0.25, 0.08], 6);
    b.light(0, 8, Z1 - 1.5, [1, 0.8, 0.4], 0.3, 7, { box: HALL });

    // ================================================= west: ticket windows (booths z 4.4..9.6)
    const BX = -15.6;
    b.boxMM("mahogany", BX - 0.1, 0, 4.2, BX + 0.1, 1.05, Z1, {
      tint: [0.52, 0.34, 0.22],
    });
    b.boxMM("marble", BX - 0.3, 1.05, 4.2, BX + 0.3, 1.12, Z1, {
      tint: [0.84, 0.8, 0.74],
    });
    b.boxMM("mahogany", BX - 0.1, 2.5, 4.2, BX + 0.1, 3.2, Z1, {
      tint: [0.52, 0.34, 0.22],
    });
    b.col(BX - 0.3, 0, 4.2, BX + 0.3, 3.2, Z1, {
      tag: "counter",
      surface: "wood",
      walkable: false,
    });
    for (let z = 4.4; z < Z1; z += 0.12)
      b.pipe("brass", BX, 1.12, z, BX, 2.5, z, 0.008, 3);
    for (const z of [4.2, 5.95, 7.7, Z1 - 0.05])
      b.boxMM("mahogany", X0, 0, z - 0.06, BX + 0.1, 3.2, z + 0.06, {
        tint: [0.46, 0.3, 0.2],
      });
    ["TICKETS", "BRASS & POWDER", "DOC FERRIS — MEDIC"].forEach((t, i) => {
      const z = 5.07 + i * 1.75;
      b.plate(
        "art",
        BX + 0.11,
        2.85,
        z,
        1,
        0,
        1.6,
        0.45,
        K.signCell("wh_booth" + i, t, 320, 80, {
          bg: i ? "#2a1a14" : "#1c2a24",
          fg: "#f0dca0",
          font: "Georgia, serif",
        }),
        { off: 0.0 },
      );
      b.box("wood", BX - 0.3, 1.12, z, 0.3, 0.02, 0.5, {
        tint: [0.6, 0.5, 0.36],
      }); // deal tray
      K.lamp(b, -16.8, 2.9, z, "bulb", [1, 0.8, 0.55], 0.45, 3.5, {
        ceil: 3.2,
        lightOpts: { box: [X0, 0, 4.2, BX, 3.2, Z1] },
      });
      if (i === 1) {
        K.shelf(b, -17.7, 0, z, HP, 1.5, {
          h: 2.3,
          d: 0.3,
          levels: 4,
          items: ["box", "can", "box"],
          col: false,
          mat: "wood_rotten",
          seed: 91,
        });
        b.box("rust", -16.9, 1.12, z - 0.4, 0.4, 0.2, 0.25);
      }
      if (i === 2) {
        K.shelf(b, -17.7, 0, z, HP, 1.5, {
          h: 2.3,
          d: 0.3,
          levels: 4,
          items: ["jar", "bottle", "box"],
          col: false,
          mat: "metal",
          seed: 92,
        });
        b.box("cloth_white", -16.9, 1.12, z + 0.4, 0.35, 0.18, 0.3, {
          tint: [0.85, 0.2, 0.18],
        });
      }
    });
    A("farebot", -16.7, 0, 5.07, -HP);
    A("brass", -16.7, 0, 6.82, -HP);
    A("doc", -16.7, 0, 8.57, -HP);
    // booth-back access door (staff) — behind the booths, a narrow corridor from the stair foot
    b.boxMM("mahogany", X0, 0, 4.14, X0 + 2.3, 3.2, 4.26, {
      tint: [0.46, 0.3, 0.2],
    });

    // ================================================= east: newsstand under the gallery
    const NX0 = 15,
      NZ0 = -3.4,
      NZ1 = 1.2;
    b.boxMM("ferry_green", NX0, 0, NZ0, NX0 + 0.25, 1.0, NZ1, { tint: green });
    b.boxMM("wood", NX0 - 0.1, 1.0, NZ0, NX0 + 0.45, 1.06, NZ1, {
      tint: [0.6, 0.46, 0.32],
    });
    b.col(NX0 - 0.1, 0, NZ0, NX0 + 0.45, 1.06, NZ1, {
      tag: "counter",
      surface: "wood",
    });
    for (let z = NZ0 + 0.3; z < NZ1; z += 0.34)
      for (let k = 0; k < 4; k++)
        b.box("flat", NX0 + 0.12, 1.07 + k * 0.012, z, 0.26, 0.012, 0.3, {
          yaw: (r() - 0.5) * 0.3,
          tint: r.pick([
            [0.8, 0.3, 0.2],
            [0.3, 0.5, 0.7],
            [0.9, 0.8, 0.4],
            [0.9, 0.9, 0.85],
          ]),
        });
    K.shelf(b, 17.6, 0, -1.1, -HP, 4.2, {
      h: 2.2,
      d: 0.35,
      levels: 5,
      items: ["book", "box", "book"],
      col: false,
      mat: "wood_rotten",
      seed: 93,
    });
    b.plate(
      "art",
      NX0 - 0.02,
      3.6,
      -1.1,
      -1,
      0,
      3.0,
      0.6,
      K.signCell("wh_news", "NEWS · SILVER TORCH · CANDY", 512, 96, {
        bg: "#e8d8b0",
        fg: "#8a1a14",
        font: "Impact, sans-serif",
      }),
      { off: 0.03 },
    );
    b.plate(
      "art",
      NX0 + 0.28,
      0.6,
      -1.1,
      -1,
      0,
      1.4,
      0.7,
      K.signCell(
        "wh_paper",
        "THE FIRST JOURNAL — MAR 5 1967\nCHINA TALKS COLLAPSE",
        320,
        160,
        { bg: "#e8e4d8", fg: "#1a1a1a", font: "Georgia, serif" },
      ),
      { off: 0.0 },
    );
    K.lamp(b, 16.3, 3.8, -1.1, "tube", [0.8, 0.9, 0.85], 0.4, 5, {
      ceil: GY - 0.3,
      alongX: false,
      len: 2.4,
      lightOpts: { box: HALL },
    });

    // ================================================= caravan camp on the NE floor
    const campY = 0;
    for (let k = 0; k < 5; k++) {
      const x = 5.5 + (k % 3) * 2.4,
        z = -8.6 + Math.floor(k / 3) * 2.4;
      b.box("canvas_green", x, campY, z, 1.9, 0.12, 0.85, {
        yaw: (r() - 0.5) * 0.5,
        tint: r.pick([
          [0.5, 0.56, 0.42],
          [0.6, 0.5, 0.38],
          [0.44, 0.46, 0.52],
        ]),
      });
      b.box("fabric", x - 0.7, campY + 0.1, z, 0.35, 0.18, 0.55, {
        tint: [0.7, 0.66, 0.56],
      });
    }
    b.cyl("rust", 9.6, 0, -4.4, 0.33, 0.33, 0.85, 10, {
      tint: [0.5, 0.36, 0.26],
    });
    b.burn(9.6, 1.0, -4.4, 1.2, 0.8);
    for (let k = 0; k < 6; k++)
      b.geo("lamp", K.sphereGeo(), {
        x: 9.6 + (r() - 0.5) * 0.3,
        y: 0.9,
        z: -4.4 + (r() - 0.5) * 0.3,
        s: 0.08 + r() * 0.06,
        tint: [1, 0.45, 0.12],
      });
    b.light(9.6, 1.4, -4.4, [1, 0.5, 0.2], 1.4, 7.5, { box: HALL });
    b.glow(9.6, 1.2, -4.4, [0.9, 0.4, 0.1], 2.2);
    b.pipe("black_iron", 9.2, 1.4, -4.4, 10, 1.4, -4.4, 0.012, 3);
    b.cyl("metal_dark", 9.6, 1.1, -4.4, 0.18, 0.16, 0.22, 8);
    K.crates(b, 12.6, 0, -8.8, 0.2, 3, { col: true, seed: 5 });
    K.crates(b, 4.2, 0, -5.2, -0.3, 2, { col: true, seed: 6 });
    for (let k = 0; k < 3; k++)
      b.box("leather", 11.8 + k * 0.4, 0, -6.2, 0.7, 0.35, 0.5, {
        yaw: 0.2 * k,
        tint: [0.5, 0.3, 0.2],
      }); // pack saddles
    // laundry line between two columns
    b.pipe("black_iron", 0, 2.6, -6.5, 4.5, 2.5, -6.5, 0.006, 3);
    for (let k = 0; k < 6; k++) {
      const x = 0.5 + k * 0.65;
      b.quadN(
        "fabric",
        [x, 2.5, -6.5],
        [x + 0.5, 2.5, -6.5],
        [x + 0.5, 1.7 + r() * 0.3, -6.5],
        [x, 1.8, -6.5],
        [0, 0, 1],
        {
          tint: r.pick([
            [0.8, 0.76, 0.66],
            [0.5, 0.56, 0.62],
            [0.7, 0.4, 0.3],
          ]),
          grime: 0.3,
        },
      );
      b.quadN(
        "fabric",
        [x + 0.5, 2.5, -6.5],
        [x, 2.5, -6.5],
        [x, 1.8, -6.5],
        [x + 0.5, 1.7, -6.5],
        [0, 0, -1],
        { tint: [0.6, 0.56, 0.5] },
      );
    }
    // caravan job board by the doors
    const jobs = K.paint("art", "ph2_wh_jobs", 512, 384, (x, X, Y, W, Hh) => {
      x.fillStyle = "#6a4a2e";
      x.fillRect(X, Y, W, Hh);
      const notes = [
        "GUARDS WANTED\nBronx run · 40 scrip\nsee Two-Horn",
        'LOST: 1 pack ox\nanswers to "Gerald"\none horn',
        "GUS NEEDS\nPUMP PARTS\nask on the Corbin",
        "NO CREDIT\n— Bertha",
        "EMPIRE STORES\nmarket day\nevery day",
      ];
      notes.forEach((n, i) => {
        const nx = X + 20 + (i % 3) * 165,
          ny = Y + 20 + Math.floor(i / 3) * 180;
        x.save();
        x.translate(nx + 70, ny + 70);
        x.rotate((i % 2 ? 1 : -1) * 0.06);
        x.fillStyle = i === 2 ? "#e8d890" : "#e8e2d0";
        x.fillRect(-70, -70, 140, 150);
        x.fillStyle = "#2a1a10";
        x.font = "bold 17px Georgia, serif";
        x.textAlign = "center";
        n.split("\n").forEach((l, k) => x.fillText(l, 0, -30 + k * 26));
        x.fillStyle = "#8a2a1a";
        x.beginPath();
        x.arc(0, -62, 5, 0, 6.3);
        x.fill();
        x.restore();
      });
    });
    b.boxMM("wood_dark", 4.0, 1.2, Z0 + 0.1, 6.4, 3.0, Z0 + 0.16, {
      tint: [0.5, 0.36, 0.24],
    });
    b.plate("art", 5.2, 2.1, Z0 + 0.17, 0, 1, 2.3, 1.7, jobs, { off: 0.0 });

    // ================================================= east gallery: bunks + Caravan Guild office
    for (let k = 0; k < 4; k++) {
      const z = -5.6 + k * 2.1;
      K.bed(b, 16.8, GY, z, HP, {
        w: 0.9,
        l: 1.9,
        tint: r.pick([
          [0.62, 0.58, 0.5],
          [0.52, 0.5, 0.44],
        ]),
      });
    }
    b.plate(
      "art",
      X1 - 0.12,
      GY + 2.4,
      -3.0,
      -1,
      0,
      1.6,
      0.4,
      K.signCell("wh_bunks", "BUNKS — 5 SCRIP / NIGHT", 384, 80, {
        bg: "#e0d6bc",
        fg: "#3a1e14",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    // office walls (x 14.5..18, z 4..10) with a door gap on the west side
    K.segWall(b, 14.5, 4, 14.5, Z1, GY, GY + 3.4, -1, {
      mat: "plaster",
      tint: cream,
      gaps: [{ t: 1.4, w: 1.1, y1: GY + 2.2 }],
      wain: "wood",
      wainC: [0.55, 0.4, 0.28],
      wainH: 1.0,
    });
    K.segWall(b, 14.5, 4, X1, 4, GY, GY + 3.4, 1, {
      mat: "plaster",
      tint: cream,
      both: true,
      wain: "wood",
      wainC: [0.55, 0.4, 0.28],
      wainH: 1.0,
    });
    b.face("plaster", 14.5, GY + 3.4, 4, 1, 0, 0, 0, 0, 1, X1 - 14.5, Z1 - 4, {
      uv: "top",
      tint: [0.7, 0.68, 0.62],
    });
    K.table(b, 16.6, GY, 7.6, 1.6, 0.8, {
      mat: "mahogany",
      tint: [0.5, 0.32, 0.2],
    });
    K.chair(b, 16.6, GY, 8.5, PI, { mat: "wood_dark" });
    b.box("fabric", 16.3, GY + 0.76, 7.5, 0.4, 0.05, 0.3, {
      tint: [0.8, 0.76, 0.62],
    });
    const routes = K.paint(
      "art",
      "ph2_wh_routes",
      512,
      384,
      (x, X, Y, W, Hh) => {
        x.fillStyle = "#d8cca8";
        x.fillRect(X, Y, W, Hh);
        x.strokeStyle = "#6a8aa0";
        x.lineWidth = 30;
        x.beginPath();
        x.moveTo(X + 120, Y);
        x.lineTo(X + 90, Y + Hh);
        x.stroke();
        x.beginPath();
        x.moveTo(X + 380, Y);
        x.lineTo(X + 420, Y + Hh);
        x.stroke();
        x.fillStyle = "#b0a080";
        x.beginPath();
        x.moveTo(X + 140, Y);
        x.lineTo(X + 360, Y);
        x.lineTo(X + 330, Y + Hh * 0.8);
        x.lineTo(X + 230, Y + Hh * 0.95);
        x.lineTo(X + 130, Y + Hh * 0.75);
        x.closePath();
        x.fill();
        x.strokeStyle = "#a02a1a";
        x.lineWidth = 4;
        x.setLineDash([10, 6]);
        x.beginPath();
        x.moveTo(X + 230, Y + Hh * 0.92);
        x.lineTo(X + 300, Y + Hh * 0.6);
        x.lineTo(X + 470, Y + Hh * 0.55);
        x.stroke();
        x.beginPath();
        x.moveTo(X + 230, Y + Hh * 0.92);
        x.lineTo(X + 250, Y + Hh * 0.4);
        x.lineTo(X + 280, Y + 10);
        x.stroke();
        x.setLineDash([]);
        x.fillStyle = "#2a1a10";
        x.font = "bold 18px Georgia, serif";
        x.fillText("WHITEHALL", X + 180, Y + Hh * 0.97);
        x.fillText("BRIDGES →", X + 380, Y + Hh * 0.5);
        x.fillText("BRONX ↑", X + 260, Y + 30);
        x.fillText("X  mutants", X + 200, Y + Hh * 0.35);
        K.stains(x, X, Y, W, Hh, 12, 491, 0.4, [60, 45, 25]);
      },
    );
    b.plate("art", X1 - 0.12, GY + 1.9, 7.2, -1, 0, 2.2, 1.6, routes, {
      off: 0.02,
    });
    K.lamp(b, 16.2, GY + 2.8, 7, "pendant", [1, 0.82, 0.58], 0.8, 5, {
      ceil: GY + 3.4,
      lightOpts: { box: [14.4, GY, 4, X1, GY + 3.5, Z1] },
    });
    b.light(16.4, GY + 2.6, -2.5, [0.9, 0.78, 0.6], 0.5, 7, {
      box: [14.4, GY, -6.6, X1, GY + 6, 4],
    });
    // north gallery: lookout chairs, a portrait of the ferry company president
    for (const x of [-8, -4.5, 3])
      K.chair(b, x, GY, -7.2, (r() - 0.5) * 0.6, { mat: "wood_dark" });
    K.framed(
      b,
      0,
      GY + 2.2,
      Z0 + 0.12,
      0,
      1,
      1.2,
      1.5,
      K.painting(12, 128, 160),
      { frame: "gold" },
    );

    // ================================================= clutter / decay
    K.clutter(b, -12, -5, 12, 0, 0, {
      n: 16,
      seed: 501,
      kinds: ["paper", "can", "glass", "box"],
    });
    K.clutter(b, X0 + 2.5, -9, -6, -7, 0, {
      n: 6,
      seed: 502,
      kinds: ["paper", "debris", "panel"],
    });
    b.hplate("decal", -3, 0.012, -3.5, 6, 5, 0.4, K.decal("grime", 11));
    b.hplate("decal", 8, 0.012, 5, 7, 6, 1.1, K.decal("grime", 12));
    b.plate(
      "decal",
      -9,
      1.4,
      Z1 - 0.12,
      0,
      -1,
      2.6,
      1.0,
      K.tag("RICHMOND 4EVER", "#3a8ad0", 256, 96),
      { off: 0.03 },
    );

    // ================================================= M/V MARGARET CORBIN (the ferry interior)
    buildFerry(ctx, b, A, r);

    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_whitehall_int";
    // engine-room flood water: its own mesh, hidden once the pumps run
    const wb = K.builder({
      name: "wh_flood",
      off: O,
      lit: true,
      amb: [0.14, 0.16, 0.14],
    });
    K.waterPlate(wb, -3.9, 33.2, 3.9, 47.8, -2.75);
    ctx.whFlood = wb.finish(ctx.intRoot);
    const FL = PV.wh.F,
      WH = PV.wh;

    // ================================================= doors & anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "ph2_wh_in",
      pos: ctx.anchors.door.clone(),
      label: "Whitehall Ferry Terminal",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 8.4, yaw: PI },
      onEnter: () => K.safe("disc", () => G.discover("whitehall_terminal")),
    });
    {
      const t = FL.w(0, WH.AY, WH.Z0 - 3.2);
      K.door(ctx, {
        id: "ph2_wh_out",
        pos: new THREE.Vector3(OX, OY + 1.3, OZ - 9.85),
        label: "South Ferry Plaza",
        verb: "Leave",
        target: { x: t.x, y: WH.AY + 0.05, z: t.z, yaw: FL.pyaw(0) },
      });
    }
    // slip 1 gate ↔ ferry vestibule
    K.door(ctx, {
      id: "ph2_wh_slip1",
      pos: new THREE.Vector3(OX - 12, OY + 1.3, OZ + Z1 - 0.2),
      label: "Slip 1 — M/V Margaret Corbin",
      verb: "Board",
      target: { x: OX, y: OY, z: OZ + 31.2, yaw: PI },
    });
    K.door(ctx, {
      id: "ph2_wh_gangway",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ + 30.15),
      label: "Gangway — Waiting Room",
      verb: "Go",
      target: { x: OX - 12, y: OY, z: OZ + Z1 - 1.4, yaw: 0 },
    });
    // ferry ↔ outside apron bridge (slip 1)
    {
      const t = FL.w(-12, WH.AY + 0.05, 33.5),
        p = FL.w(-12, WH.FERRY.deck + 1.7, 36.35); // arrival on the back quay below the boarding bridge (the bridge top is a 1.3 m ledge), facing along the quay away from the ferry
      K.door(ctx, {
        id: "ph2_wh_ferry_in",
        pos: p,
        label: "M/V Margaret Corbin",
        verb: "Board",
        target: { x: OX - 3.3, y: OY, z: OZ + 31.6, yaw: -HP },
        onEnter: () => K.safe("disc", () => G.discover("whitehall_terminal")),
      });
      K.door(ctx, {
        id: "ph2_wh_ferry_out",
        pos: new THREE.Vector3(OX - 4.05, OY + 1.3, OZ + 31.6),
        label: "Deck — Slip 1",
        verb: "Go out",
        target: { x: t.x, y: t.y, z: t.z, yaw: FL.pyaw(-HP / 2) },
      });
    }
    // engine-room hatch (down) / ladder (up)
    ctx.interactables.push(
      G.world.addInteractable({
        pos: new THREE.Vector3(OX + 2.4, OY + 0.4, OZ + 40),
        radius: 0.9,
        label: "Engine Room Hatch",
        verb: "Climb down",
        priority: 1,
        onInteract: () => {
          K.sfx("door_open", null);
          G.fadeTransition(() =>
            G.player.teleport(OX + 2.4, OY - 3.4, OZ + 41.4, PI),
          );
        },
      }),
    );
    ctx.interactables.push(
      G.world.addInteractable({
        pos: new THREE.Vector3(OX + 2.4, OY - 2.2, OZ + 40.1),
        radius: 0.9,
        label: "Ladder — Main Deck",
        verb: "Climb up",
        priority: 1,
        onInteract: () => {
          K.sfx("door_open", null);
          G.fadeTransition(() =>
            G.player.teleport(OX + 2.4, OY, OZ + 38.6, PI),
          );
        },
      }),
    );
    A("entrance", 0, 0, -8.4, PI);
    A("npc1", -8.5, 0.05, 3.1, PI);
    A("npc2", 6.2, 0.05, 1.6, PI);
    A("npc3", 9.4, 0, -5.4, 0);
    ["spawn1", "spawn2", "spawn3", "spawn4", "spawn5", "spawn6"].forEach(
      (n, i) => A(n, -10 + i * 4, 0, i % 2 ? -4 : 0.4, 0),
    );
    A("loot1", 16.8, GY, 9.3, PI);
    A("loot2", -17.4, 0, 9.2, HP);
    A("loot3", 0, 0, 58.6, PI);

    // ================================================= loot, notes, terminal
    K.loot(ctx, "safe", 17.6, GY, 9.3, -HP, {
      loot: "safe",
      name: "Caravan Guild Strongbox",
      lock: K.regLock({
        id: "ph2_lk_wh_strongbox",
        label: "Caravan Guild Strongbox",
        kind: "safe",
        code: "0505",
        hint: "The guild ledger teletype keeps the strongbox combination.",
      }),
    });
    // Big Bertha's chalk slate by the counter: the ledger passcode (she trusts her guards, not her memory)
    K.scrawlAt(
      K.world(ctx, 16.2, GY + 1.5, 8.6),
      "Chalk Slate",
      "LEDGER PW: DOCKAGE. Rub this off before the Two-Horn boys see it. — R.",
      "ph2_lk_wh_ledger",
    );
    K.loot(ctx, "footlocker", 16.8, GY, -4.3, -HP, { loot: "footlocker" });
    K.loot(ctx, "footlocker", 16.8, GY, 2.0, -HP, { loot: "footlocker" });
    K.loot(ctx, "cash_register", NX0 + 0.12, 1.06, -2.8, -HP, {});
    K.loot(ctx, "first_aid", X0 + 0.15, 1.5, -8.5, -HP, { loot: "first_aid" });
    K.loot(ctx, "ammo_box", -17.4, 0, 7.4, HP, { loot: "ammo_box" });
    K.loot(ctx, "duffle_bag", 7.6, 0, -8.8, 0.4, { loot: "duffle_bag" });
    K.loot(ctx, "mattress", 5.5, 0, -6.2, 0.1, {});
    K.terminal(
      ctx,
      "ph2_term_wh_ledger",
      16.6,
      GY + 0.76,
      7.25,
      -PI,
      termLedger(),
      "bare",
    );
    K.terminal(ctx, "ph2_term_wh_pa", -16.9, 1.12, 5.4, -HP, termPA(), "bare");
    K.note(ctx, "ph2_note_wh_richmond", 11.4, 0.02, 7.9, {
      type: "note",
      name: "Note: The Richmond",
      title: "The Richmond",
      text: "To whoever finds Danny's coat —\n\nWe were sleeping aboard the Richmond when the ice cracked her hull. Gus says she was rotten through, twenty years past saving. We got the kids out. We got the oxen out, God help us. We did not get Danny out.\n\nIf you are reading this on slip 3, please don't try the doors. She groans at night. Let her sleep.\n\n— M.",
    });
  };

  // ------------------------------------------------------------------
  // The Margaret Corbin: vestibule, passenger cabin, the Slack Tide, engine room
  // ------------------------------------------------------------------
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

  function termLedger() {
    return {
      title: "CARAVAN GUILD LEDGER",
      header:
        "WHITEHALL CARAVAN STAGE — DOCKAGE & ACCOUNTS\n(Kestrel teletype, formerly Dept. of Marine & Aviation)",
      lock: {
        id: "ph2_lk_wh_ledger",
        passcode: "DOCKAGE",
        hint: "Big Bertha chalked the passcode on the slate by her counter.",
      },
      entries: [
        {
          title: "Dockage — this week",
          text: "Crow's Hat Co. (Brooklyn): 4 pack oxen, 2 guards — PAID.\nTwo-Horn Traders (Bronx): 6 pack oxen, 3 guards — 12 scrip owing.\nSlate & Sons: route closed, raiders on Broadway. Refund? — NO. — R.",
        },
        {
          title: "Notes on the Corbin",
          text: "Tilly's bar brings in more than the bunks and the pen put together. If the Corbin goes down like the Richmond we lose the whole stern trade. Told Gus to fix it. Gus told me something anatomically unlikely. Find him a mechanic. Or a miracle.",
        },
        {
          title: "Empire Stores",
          text: 'Hattie Szabo\'s market under the bridges is buying everything we bring over. Her prices are fair, which is suspicious. Her scale is "certified," which is more suspicious. Somebody is skimming her cellar. Not my problem. Unless it becomes my problem.',
        },
        {
          title: "Security",
          text: "Shellback sign on the Battery again. Two more guards on nights. Nobody sleeps on the racks — I don't care how hot it is.",
        },
        {
          title: "Strongbox",
          learn: "ph2_lk_wh_strongbox",
          text: "Strongbox combination reset after the Slate & Sons business: 0-5-0-5. Fifth of May, the day this stage opened. — R.",
        },
      ],
    };
  }
  function termPA() {
    return {
      title: "PUBLIC ADDRESS CONSOLE",
      header:
        "DEPT. OF MARINE & AVIATION — WHITEHALL TERMINAL\nPA / ANNOUNCEMENT QUEUE",
      entries: [
        {
          title: "[Queued] 09:42",
          text: '"Attention passengers. Due to a CIVIL DEFENSE ADVISORY, the 10:00 boat to St. George is cancelled. Please remain calm and proceed to the nearest civil-defense shelter. The nearest civil-defense shelter is... [NOT FOUND]."',
        },
        {
          title: "[Queued] 09:46",
          text: '"This is a reminder that running in the terminal is prohibited."',
        },
        {
          title: "[Queued] 09:47",
          text: '"Attention all p—" [END OF RECORDING]',
        },
        {
          title: "Lost and Found",
          text: "1 umbrella (black). 1 briefcase (brown, locked). 1 child's shoe (red). 214 umbrellas (various).",
        },
      ],
    };
  }

  // Pumps: hide the engine-room water once Gus is happy
  PV.whPumps = function () {
    const c = PV.ctxs && PV.ctxs.find((q) => q.id === "whitehall_terminal");
    if (c && c.whFlood) c.whFlood.visible = false;
  };
  PV.whUpdate = function (dt, realDt, ctx) {
    if (ctx.whFlood && ctx.inside) ctx.whFlood.visible = !PV.flag("wh_pumps");
  };
})();
