// play-inline-411 03 — tint
// Lines 42-1165 of readable/play-inline-411.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "bt_ext", grime: 0.5, seg: 6 });
    const r = K.rng("bt_ext");
    const { X0, X1, Z0, Z1, XC, LOG_Z, LOG_Y, BASE_H, SHAFT_H, COLO_H } = BT;
    const gran = [0.86, 0.84, 0.8],
      granD = [0.7, 0.68, 0.64];
    const PX0 = X0 + 3.5,
      PX1 = X1 - 3.5; // inner faces of the corner piers

    // ================================================= BASE (granite, 0..22)
    // corner piers (full depth of the loggia) + rustication grooves
    for (const [a, c] of [
      [X0, PX0],
      [PX1, X1],
    ]) {
      b.boxMM("granite_pale", a, 0, Z0, c, BASE_H, LOG_Z, {
        tint: gran,
        faces: "nsewt",
      });
      for (let y = 1.2; y < 8; y += 1.2)
        b.boxMM(
          "granite_dark",
          a - 0.02,
          y,
          Z0 - 0.02,
          c + 0.02,
          y + 0.06,
          LOG_Z,
          { tint: granD, faces: "nsew" },
        );
      b.col(a, 0, Z0, c, BASE_H, LOG_Z, { tag: "building" });
    }
    // base block behind the loggia (sides + back), plinth, attic windows via the tower texture
    K.fwall(b, "granite_pale", X0, LOG_Z, X0, Z1, 0, 6, -1, 0, { tint: gran });
    K.fwall(b, "granite_pale", X1, LOG_Z, X1, Z1, 0, 6, 1, 0, { tint: gran });
    K.fwall(b, "granite_pale", X0, Z1, X1, Z1, 0, 6, 0, 1, { tint: gran });
    K.fwall(b, "tower", X0, Z0, X0, Z1, 6, BASE_H - 6, -1, 0, { tint: gran });
    K.fwall(b, "tower", X1, Z0, X1, Z1, 6, BASE_H - 6, 1, 0, { tint: gran });
    K.fwall(b, "tower", X0, Z1, X1, Z1, 6, BASE_H - 6, 0, 1, { tint: gran });
    b.boxMM("granite_dark", X0 - 0.2, 0, Z0 - 0.2, X1 + 0.2, 0.7, Z1 + 0.2, {
      tint: granD,
      faces: "sewt",
    });
    b.col(X0, 0, LOG_Z, X1, BASE_H, Z1, { tag: "building" });
    // big arched ground-floor windows on the Nassau (west) and east sides, boarded
    for (const side of [-1, 1])
      for (let k = 0; k < 4; k++) {
        const x = side < 0 ? X0 : X1,
          z = LOG_Z + 3 + k * 4.6;
        K.window(b, x, 3.4, z, side, 0, 2.0, 4.2, {
          state: k === 1 ? "broken" : "boarded",
          surround: "granite_pale",
          surroundTint: gran,
          lintel: 0.5,
          lintelMat: "granite_pale",
          sillMat: "granite_pale",
        });
      }
    // loggia: steps, floor, back wall with the bronze doors, soffit
    K.stairs(b, PX0, Z0, PX1, Z0 + 1.6, 0, LOG_Y, "+z", {
      mat: "granite_pale",
      tint: gran,
      maxRise: 0.25,
    });
    b.boxMM("granite_pale", PX0, 0, Z0 + 1.6, PX1, LOG_Y, LOG_Z, {
      tint: gran.map((v) => v * 0.95),
      faces: "t",
    });
    b.col(PX0, 0, Z0 + 1.6, PX1, LOG_Y, LOG_Z, {
      tag: "floor",
      surface: "concrete",
    });
    K.fwall(
      b,
      "granite_pale",
      PX0,
      LOG_Z,
      PX1,
      LOG_Z,
      LOG_Y,
      17 - LOG_Y,
      0,
      -1,
      { tint: granD.map((v) => v * 0.82) },
    );
    b.face(
      "coffer",
      PX0,
      17,
      Z0 + 0.5,
      1,
      0,
      0,
      0,
      0,
      1,
      PX1 - PX0,
      LOG_Z - Z0 - 0.5,
      { uv: "top", tint: [0.7, 0.68, 0.64], grime: 0.4 },
    );
    // The lit banking hall seen through the bronze doors and window-wall. It is painted into the additive,
    // unlit neon atlas (toneMapped:false), so it reads as a warm interior glow in full daylight as well as at night.
    // Black means no light: the dark glass shows through there.
    const warm = (x, cx, cy, r0, r1, a, rgb) => {
      const g = x.createRadialGradient(cx, cy, r0, cx, cy, r1);
      g.addColorStop(0, "rgba(" + rgb + "," + a + ")");
      g.addColorStop(1, "rgba(" + rgb + ",0)");
      x.fillStyle = g;
      x.fillRect(cx - r1, cy - r1, r1 * 2, r1 * 2);
    };
    const hall = K.paint("neon", "bt_hall", 512, 428, function (x, X, Y, W, H) {
      const r = K.rng("bt_hall");
      x.fillStyle = "#000";
      x.fillRect(X, Y, W, H);
      let g = x.createLinearGradient(0, Y, 0, Y + H); // ambient: bright coffered ceiling, dim floor
      g.addColorStop(0, "rgb(150,104,50)");
      g.addColorStop(0.35, "rgb(122,82,38)");
      g.addColorStop(0.75, "rgb(70,46,20)");
      g.addColorStop(1, "rgb(44,28,12)");
      x.fillStyle = g;
      x.fillRect(X, Y, W, H);
      x.save();
      x.beginPath();
      x.rect(X, Y, W, H);
      x.clip();
      x.strokeStyle = "rgba(0,0,0,0.55)";
      x.lineWidth = 3; // coffer grid converging on the far wall
      const vx = X + W / 2,
        vy = Y + H * 0.5;
      for (let k = -6; k <= 6; k++) {
        x.beginPath();
        x.moveTo(X + W / 2 + k * W * 0.16, Y);
        x.lineTo(vx + k * W * 0.045, Y + H * 0.3);
        x.stroke();
      }
      for (let k = 0; k < 5; k++) {
        const t = Math.pow(k / 5, 1.6),
          yy = Y + H * 0.3 * t;
        x.beginPath();
        x.moveTo(X, yy);
        x.lineTo(X + W, yy);
        x.stroke();
      }
      x.fillStyle = "rgba(0,0,0,0.5)";
      x.fillRect(X, Y + H * 0.3, W, 5);
      for (const cx of [0.08, 0.3, 0.7, 0.92]) {
        // hall columns (dark marble silhouettes)
        const w = W * (cx < 0.2 || cx > 0.8 ? 0.07 : 0.04),
          px = X + W * cx - w / 2;
        x.fillStyle = "rgba(0,0,0,0.62)";
        x.fillRect(px, Y + H * 0.3, w, H * 0.7);
        x.fillStyle = "rgba(255,200,120,0.12)";
        x.fillRect(px + w * 0.15, Y + H * 0.3, w * 0.12, H * 0.7);
      }
      x.fillStyle = "rgba(0,0,0,0.35)"; // far wall: clock + tall windows
      for (let k = 0; k < 3; k++)
        x.fillRect(X + W * (0.4 + k * 0.08), Y + H * 0.36, W * 0.035, H * 0.16);
      warm(x, vx, Y + H * 0.33, 2, 16, 0.9, "255,236,190");
      x.fillStyle = "rgba(0,0,0,0.8)"; // teller counter with brass grilles
      x.fillRect(X, Y + H * 0.66, W, H * 0.12);
      x.fillStyle = "rgba(210,160,80,0.5)";
      x.fillRect(X, Y + H * 0.655, W, 3);
      x.strokeStyle = "rgba(200,150,70,0.45)";
      x.lineWidth = 2;
      for (let px = X + 8; px < X + W; px += 9) {
        x.beginPath();
        x.moveTo(px, Y + H * 0.56);
        x.lineTo(px, Y + H * 0.655);
        x.stroke();
      }
      x.fillStyle = "rgba(0,0,0,0.5)";
      for (let k = 0; k < 6; k++)
        x.fillRect(X + (W * (k + 0.5)) / 6 - 3, Y + H * 0.54, 6, H * 0.12);
      for (let k = 0; k < 6; k++) {
        const bx = X + (W * (k + 0.5)) / 6 + 18; // green banker's lamps on the counter
        warm(x, bx, Y + H * 0.645, 1, 14, 0.9, "120,255,150");
        x.fillStyle = "rgb(160,255,170)";
        x.fillRect(bx - 6, Y + H * 0.638, 12, 4);
      }
      x.fillStyle = "rgba(0,0,0,0.85)"; // a Valet teller hovering behind the grille
      const hx = X + W * 0.58,
        hy = Y + H * 0.5;
      x.beginPath();
      x.ellipse(hx, hy, 17, 14, 0, 0, Math.PI * 2);
      x.fill();
      x.fillRect(hx - 2, hy - 30, 4, 18);
      x.fillRect(hx - 22, hy - 26, 4, 14);
      x.fillRect(hx + 18, hy - 26, 4, 14);
      warm(x, hx, hy + 20, 2, 12, 0.8, "140,200,255");
      for (const [cx, cy, s] of [
        [0.3, 0.2, 1],
        [0.7, 0.2, 1],
        [0.5, 0.27, 0.55],
      ]) {
        // the two chandeliers the robots keep lit (+ one far away)
        const px = X + W * cx,
          py = Y + H * cy;
        warm(x, px, py, 4, 150 * s, 0.55, "255,190,110");
        x.strokeStyle = "rgba(0,0,0,0.6)";
        x.lineWidth = 2;
        x.beginPath();
        x.moveTo(px, Y);
        x.lineTo(px, py - 14 * s);
        x.stroke();
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2,
            ex = px + Math.cos(a) * 26 * s,
            ey = py + Math.sin(a) * 6 * s;
          warm(x, ex, ey, 1, 9 * s, 1, "255,240,200");
        }
        warm(x, px, py, 2, 30 * s, 1, "255,246,220");
      }
      x.fillStyle = "rgba(0,0,0,0.25)"; // dust / grime on the glass
      for (let k = 0; k < 260; k++)
        x.fillRect(X + r() * W, Y + r() * H, 1 + r() * 5, 1 + r() * 3);
      g = x.createLinearGradient(0, Y + H * 0.78, 0, Y + H); // polished floor catches the chandelier light
      g.addColorStop(0, "rgba(120,80,36,0.0)");
      g.addColorStop(0.4, "rgba(160,112,56,0.35)");
      g.addColorStop(1, "rgba(60,40,18,0)");
      x.fillStyle = g;
      x.fillRect(X, Y + H * 0.78, W, H * 0.22);
      x.restore();
    });
    const lobby = K.paint(
      "neon",
      "bt_lobby",
      256,
      320,
      function (x, X, Y, W, H) {
        x.fillStyle = "#000";
        x.fillRect(X, Y, W, H);
        const g = x.createLinearGradient(0, Y, 0, Y + H); // bronze vestibule, inner doors ajar, lit hall beyond
        g.addColorStop(0, "rgb(96,64,30)");
        g.addColorStop(0.5, "rgb(140,98,48)");
        g.addColorStop(1, "rgb(58,38,16)");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        x.save();
        x.beginPath();
        x.rect(X, Y, W, H);
        x.clip();
        x.fillStyle = "rgba(0,0,0,0.6)";
        x.fillRect(X, Y, W * 0.14, H);
        x.fillRect(X + W * 0.86, Y, W * 0.14, H);
        x.fillRect(X + W * 0.22, Y + H * 0.2, W * 0.2, H * 0.72);
        x.fillRect(X + W * 0.58, Y + H * 0.2, W * 0.2, H * 0.72);
        warm(x, X + W * 0.5, Y + H * 0.45, 4, W * 0.4, 0.8, "255,214,150");
        warm(x, X + W * 0.5, Y + H * 0.12, 2, 26, 1, "255,240,205");
        x.fillStyle = "rgba(0,0,0,0.45)";
        x.fillRect(X, Y + H * 0.46, W, 6); // push bar
        x.fillStyle = "rgba(210,160,80,0.4)";
        x.fillRect(X + W * 0.14, Y + H * 0.94, W * 0.72, 4);
        const r = K.rng("bt_lobby");
        x.fillStyle = "rgba(0,0,0,0.3)";
        for (let k = 0; k < 120; k++)
          x.fillRect(X + r() * W, Y + r() * H, 1 + r() * 4, 1 + r() * 3);
        x.restore();
      },
    );
    // the doors: bronze frame, three pairs of leaves, a two-storey bronze window-wall above
    b.boxMM(
      "bronze",
      XC - 5.2,
      LOG_Y,
      LOG_Z - 0.3,
      XC + 5.2,
      LOG_Y + 12.5,
      LOG_Z - 0.2,
      { tint: [0.45, 0.4, 0.3] },
    );
    for (let k = -1; k <= 1; k++) {
      const dx = XC + k * 3.4;
      b.boxMM(
        "glass",
        dx - 1.4,
        LOG_Y + 0.1,
        LOG_Z - 0.34,
        dx + 1.4,
        LOG_Y + 3.6,
        LOG_Z - 0.32,
        { tint: [0.26, 0.28, 0.26] },
      );
      b.plate("neon", dx, LOG_Y + 1.85, LOG_Z - 0.343, 0, -1, 2.7, 3.4, lobby, {
        tint: k === 0 ? [1.0, 0.92, 0.82] : [0.72, 0.64, 0.56],
        off: 0.0,
      });
      b.beam(
        "bronze",
        dx,
        LOG_Y + 0.1,
        LOG_Z - 0.36,
        dx,
        LOG_Y + 3.6,
        LOG_Z - 0.36,
        0.1,
        0.05,
        { tint: [0.5, 0.44, 0.3] },
      );
      b.beam(
        "brass",
        dx - 0.6,
        LOG_Y + 1.1,
        LOG_Z - 0.4,
        dx + 0.6,
        LOG_Y + 1.1,
        LOG_Z - 0.4,
        0.04,
        0.04,
      );
    }
    b.beam(
      "bronze",
      XC - 5.2,
      LOG_Y + 3.75,
      LOG_Z - 0.36,
      XC + 5.2,
      LOG_Y + 3.75,
      LOG_Z - 0.36,
      0.3,
      0.12,
      { tint: [0.5, 0.44, 0.3] },
    );
    for (let k = 0; k <= 8; k++)
      b.beam(
        "bronze",
        XC - 5.2 + k * 1.3,
        LOG_Y + 3.9,
        LOG_Z - 0.34,
        XC - 5.2 + k * 1.3,
        LOG_Y + 12.4,
        LOG_Z - 0.34,
        0.08,
        0.06,
        { tint: [0.45, 0.4, 0.28] },
      );
    for (let k = 1; k < 5; k++)
      b.beam(
        "bronze",
        XC - 5.2,
        LOG_Y + 3.9 + k * 1.7,
        LOG_Z - 0.34,
        XC + 5.2,
        LOG_Y + 3.9 + k * 1.7,
        LOG_Z - 0.34,
        0.06,
        0.06,
        { tint: [0.45, 0.4, 0.28] },
      );
    b.boxMM(
      "glass",
      XC - 5.1,
      LOG_Y + 3.9,
      LOG_Z - 0.335,
      XC + 5.1,
      LOG_Y + 12.4,
      LOG_Z - 0.325,
      { tint: [0.24, 0.26, 0.25] },
    );
    // the banking hall glows through the window-wall (the robots keep two chandeliers lit): warm emissive behind the glass
    b.plate("neon", XC, LOG_Y + 8.15, LOG_Z - 0.338, 0, -1, 10.2, 8.5, hall, {
      tint: [0.95, 0.9, 0.84],
      off: 0.0,
    });
    for (const [gx, gy] of [
      [XC - 2.2, LOG_Y + 9],
      [XC + 2.4, LOG_Y + 9],
    ])
      b.glow(gx, gy, LOG_Z - 0.6, [0.55, 0.4, 0.2], 3.2);
    b.glow(XC, LOG_Y + 2.2, LOG_Z - 0.9, [0.6, 0.42, 0.2], 4.0);
    // bronze sconces on the loggia piers, a flickering OPEN sign, the address plaque, the FDIC roundel
    for (const sx of [PX0 + 0.05, PX1 - 0.05]) {
      const nx = sx < XC ? 1 : -1;
      for (const sz of [Z0 + 4.5, LOG_Z - 2.5]) {
        b.box("bronze", sx + nx * 0.12, LOG_Y + 3.1, sz, 0.24, 0.5, 0.24, {
          tint: [0.5, 0.42, 0.28],
        });
        b.cyl("glass", sx + nx * 0.2, LOG_Y + 3.6, sz, 0.16, 0.2, 0.5, 8, {
          tint: [0.95, 0.78, 0.5],
        });
        b.geo("lamp", K.sphereGeo(), {
          x: sx + nx * 0.2,
          y: LOG_Y + 3.85,
          z: sz,
          s: 0.1,
          tint: [1, 0.78, 0.45],
        });
        b.glow(sx + nx * 0.25, LOG_Y + 3.85, sz, [0.9, 0.6, 0.3], 2.4);
      }
    }
    // the neon hangs in the intercolumniations (columns at x 152.9 / 157.6 / 162.4 / 167.1) so it reads from Wall Street
    b.plate(
      "neon",
      XC,
      LOG_Y + 4.55,
      LOG_Z - 0.45,
      0,
      -1,
      1.7,
      0.53,
      K.neonCell("bt_open", "OPEN", 256, 80, { color: "#ff5030" }),
      { tint: [1.3, 1.3, 1.3], off: 0.0 },
    );
    b.plate(
      "neon",
      XC - 4.6,
      LOG_Y + 4.55,
      LOG_Z - 0.45,
      0,
      -1,
      2.2,
      0.37,
      K.neonCell("bt_night", "NIGHT DEPOSIT", 384, 64, { color: "#40c0ff" }),
      { tint: [1.3, 1.3, 1.3], off: 0.0 },
    );
    b.glow(XC, LOG_Y + 4.55, LOG_Z - 0.7, [0.9, 0.3, 0.15], 1.6);
    b.glow(XC - 4.6, LOG_Y + 4.55, LOG_Z - 0.7, [0.2, 0.55, 0.9], 1.4);
    const plaque = K.paint(
      "art",
      "bt_plaque",
      256,
      192,
      function (x, X, Y, W, H) {
        x.fillStyle = "#5a4a2c";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#a88a52";
        x.lineWidth = 8;
        x.strokeRect(X + 6, Y + 6, W - 12, H - 12);
        x.fillStyle = "#e0c890";
        x.textAlign = "center";
        x.font = "bold 64px Georgia, serif";
        x.fillText("14", X + W / 2, Y + 80);
        x.font = "bold 26px Georgia, serif";
        x.fillText("WALL STREET", X + W / 2, Y + 120);
        x.font = "16px Georgia, serif";
        x.fillText("BANKERS TRUST COMPANY", X + W / 2, Y + 156);
        K.stains(x, X, Y, W, H, 6, 1401, 0.4, [40, 60, 40]);
      },
    );
    b.plate("art", PX0 - 0.02, 3.2, Z0 + 0.8, -1, 0, 1.2, 0.9, plaque, {
      off: 0.01,
    });
    b.plate(
      "art",
      PX1 - 1.0,
      LOG_Y + 2.2,
      LOG_Z - 0.2,
      0,
      -1,
      0.9,
      0.68,
      plaque,
      { off: 0.02 },
    );
    const fdic = K.paint("art", "bt_fdic", 256, 256, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H / 2;
      x.fillStyle = "#6a5634";
      x.beginPath();
      x.arc(cx, cy, W * 0.47, 0, PI * 2);
      x.fill();
      x.fillStyle = "#c8a860";
      x.beginPath();
      x.arc(cx, cy, W * 0.4, 0, PI * 2);
      x.fill();
      x.fillStyle = "#3a2a14";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.font = "bold 44px Georgia, serif";
      x.fillText("FDIC", cx, cy - 16);
      x.font = "bold 15px Georgia, serif";
      x.fillText("DEPOSITS INSURED", cx, cy + 20);
      x.fillText("U.S. GOVERNMENT", cx, cy + 42);
      K.stains(x, X, Y, W, H, 5, 1402, 0.35, [40, 60, 40]);
    });
    b.plate("art", XC, LOG_Y + 13.6, LOG_Z - 0.2, 0, -1, 2.4, 2.4, fdic, {
      off: 0.02,
    });
    // side bays of the loggia: tall bronze windows (dark) + Ardent guard booth
    for (const wx of [PX0 + 2.0, PX1 - 2.0])
      b.boxMM(
        "glass",
        wx - 1.3,
        LOG_Y + 1.0,
        LOG_Z - 0.25,
        wx + 1.3,
        LOG_Y + 9,
        LOG_Z - 0.2,
        { tint: [0.1, 0.12, 0.11] },
      );
    b.boxMM(
      "metal",
      PX0 + 0.4,
      LOG_Y,
      LOG_Z - 2.2,
      PX0 + 1.8,
      LOG_Y + 2.4,
      LOG_Z - 0.6,
      { tint: [0.6, 0.6, 0.55], faces: "nsewt" },
    );
    b.boxMM(
      "glass",
      PX0 + 0.5,
      LOG_Y + 1.1,
      LOG_Z - 2.25,
      PX0 + 1.7,
      LOG_Y + 2.1,
      LOG_Z - 2.2,
      { tint: [0.3, 0.34, 0.33] },
    );
    b.plate(
      "art",
      PX0 + 1.1,
      LOG_Y + 2.6,
      LOG_Z - 2.23,
      0,
      -1,
      1.3,
      0.3,
      K.signCell("bt_ardent", "ARDENT SECURITY", 256, 56, {
        bg: "#3a1e1a",
        fg: "#e8dcc0",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.01 },
    );
    b.col(PX0 + 0.4, LOG_Y, LOG_Z - 2.2, PX0 + 1.8, LOG_Y + 2.4, LOG_Z - 0.6, {
      tag: "furniture",
    });
    // four giant Ionic columns
    BT.cols = [];
    for (let i = 0; i < 4; i++) {
      const x = PX0 + ((PX1 - PX0) * (i + 0.5)) / 4;
      BT.cols.push(x);
      K.column(b, x, LOG_Y, Z0 + 2.4, 0.85, 16.0, {
        kind: "ionic",
        mat: "granite_pale",
        tint: gran.map((v) => v * (1.08 + r() * 0.05)),
        nFlutes: 24,
      });
      b.col(x - 0.8, LOG_Y, Z0 + 1.6, x + 0.8, 17, Z0 + 3.2, {
        tag: "column",
        walkable: false,
      });
    }
    // entablature with the name, attic storey, cornice
    b.boxMM("granite_pale", X0 - 0.1, 17, Z0 - 0.1, X1 + 0.1, 19.4, LOG_Z, {
      tint: gran,
      faces: "nsewb",
    });
    K.letters(
      b,
      XC,
      18.25,
      Z0 - 0.12,
      0,
      -1,
      16,
      1.25,
      "BANKERS TRUST COMPANY",
      {
        fg: "#d8d4c8",
        font: 'Georgia, "Times New Roman", serif',
        off: 0.02,
        tint: [0.9, 0.88, 0.84],
      },
    );
    b.boxMM(
      "granite_pale",
      X0 - 0.4,
      19.4,
      Z0 - 0.4,
      X1 + 0.4,
      20.0,
      Z1 + 0.4,
      { tint: gran.map((v) => v * 1.05), faces: "nsewtb" },
    );
    K.fwall(b, "tower", X0, Z0, X1, Z0, 20, BASE_H - 20, 0, -1, { tint: gran });
    b.boxMM(
      "granite_pale",
      X0 - 0.6,
      BASE_H - 0.3,
      Z0 - 0.6,
      X1 + 0.6,
      BASE_H + 0.4,
      Z1 + 0.6,
      { tint: gran, faces: "nsewtb" },
    );
    K.letters(b, (X0 + PX0) / 2, 12.6, Z0 - 0.03, 0, -1, 3.0, 2.6, "14", {
      fg: "#2a2620",
      off: 0.02,
      shadow: false,
    });

    // ================================================= SHAFT (22..86)
    const SX0 = X0 + 1,
      SX1 = X1 - 1,
      SZ0 = Z0 + 1,
      SZ1 = Z1 - 1;
    const ST = [0.84, 0.82, 0.78];
    K.fwall(
      b,
      "tower",
      SX0,
      SZ0,
      SX1,
      SZ0,
      BASE_H + 0.4,
      SHAFT_H - BASE_H - 0.4,
      0,
      -1,
      { tint: ST },
    );
    K.fwall(
      b,
      "tower",
      SX0,
      SZ1,
      SX1,
      SZ1,
      BASE_H + 0.4,
      SHAFT_H - BASE_H - 0.4,
      0,
      1,
      { tint: ST.map((v) => v * 0.94) },
    );
    K.fwall(
      b,
      "tower",
      SX0,
      SZ0,
      SX0,
      SZ1,
      BASE_H + 0.4,
      SHAFT_H - BASE_H - 0.4,
      -1,
      0,
      { tint: ST.map((v) => v * 0.97) },
    );
    // east face in two parts around the shell crater (x = SX1, z 826..834, y 56..66)
    const CRZ0 = 826,
      CRZ1 = 834,
      CRY0 = 56,
      CRY1 = 66;
    K.fwall(
      b,
      "tower",
      SX1,
      SZ0,
      SX1,
      SZ1,
      BASE_H + 0.4,
      CRY0 - BASE_H - 0.4,
      1,
      0,
      { tint: ST },
    );
    K.fwall(b, "tower", SX1, SZ0, SX1, SZ1, CRY1, SHAFT_H - CRY1, 1, 0, {
      tint: ST,
    });
    K.fwall(b, "tower", SX1, SZ0, SX1, CRZ0, CRY0, CRY1 - CRY0, 1, 0, {
      tint: ST,
    });
    K.fwall(b, "tower", SX1, CRZ1, SX1, SZ1, CRY0, CRY1 - CRY0, 1, 0, {
      tint: ST,
      uo: CRZ1 - SZ0,
    });
    // the crater: blackened cavity, broken floor slabs, dangling rebar, rubble on the ledge
    K.fwall(
      b,
      "paint_black",
      SX1 - 3,
      CRZ0,
      SX1 - 3,
      CRZ1,
      CRY0,
      CRY1 - CRY0,
      1,
      0,
      { tint: [0.05, 0.05, 0.05], grime: 0 },
    );
    for (const y of [CRY0, CRY0 + 3.4, CRY0 + 6.8]) {
      b.boxMM(
        "concrete",
        SX1 - 3,
        y - 0.3,
        CRZ0,
        SX1 - 0.1 - r() * 1.5,
        y,
        CRZ1,
        { tint: [0.55, 0.53, 0.5], faces: "nsewtb" },
      );
      for (let k = 0; k < 5; k++) {
        const z = CRZ0 + 0.5 + k * 1.7;
        b.pipe(
          "rust",
          SX1 - 0.4,
          y - 0.15,
          z,
          SX1 + 0.4 + r() * 0.6,
          y - 0.8 - r() * 1.4,
          z + (r() - 0.5),
          0.02,
          3,
        );
      }
    }
    for (const [z0, z1] of [
      [CRZ0 - 0.6, CRZ0],
      [CRZ1, CRZ1 + 0.6],
    ])
      b.boxMM("concrete", SX1 - 3, CRY0, z0, SX1, CRY1, z1, {
        tint: [0.4, 0.38, 0.35],
        faces: "nsewt",
      });
    b.boxMM("concrete", SX1 - 3, CRY1 - 0.4, CRZ0, SX1, CRY1, CRZ1, {
      tint: [0.4, 0.38, 0.35],
      faces: "b",
    });
    b.burn(SX1, (CRY0 + CRY1) / 2, (CRZ0 + CRZ1) / 2, 9, 0.85);
    b.burn(SX1, CRY1 + 6, (CRZ0 + CRZ1) / 2, 6, 0.5);
    for (let k = 0; k < 9; k++)
      b.box(
        r() < 0.5 ? "granite_pale" : "concrete",
        X1 - 0.4 - r() * 0.6,
        BASE_H + 0.4,
        823 + r() * 16,
        0.4 + r() * 0.7,
        0.3 + r() * 0.5,
        0.4 + r() * 0.6,
        { yaw: r() * 3, tint: [0.7, 0.68, 0.64] },
      );
    // corner piers and belt courses
    for (const [x, z] of [
      [SX0, SZ0],
      [SX1, SZ0],
      [SX0, SZ1],
      [SX1, SZ1],
    ])
      b.boxMM(
        "granite_pale",
        x - 0.7,
        BASE_H,
        z - 0.7,
        x + 0.7,
        SHAFT_H,
        z + 0.7,
        { tint: gran, faces: "nsew" },
      );
    for (const y of [38, 54, 70])
      b.boxMM(
        "granite_pale",
        SX0 - 0.25,
        y,
        SZ0 - 0.25,
        SX1 + 0.25,
        y + 0.45,
        SZ1 + 0.25,
        { tint: gran.map((v) => v * 1.05), faces: "nsewtb" },
      );
    b.col(SX0, BASE_H, SZ0, SX1, COLO_H, SZ1, { tag: "building" });
    // soot streaks down from the crater + a few broken-out bays
    b.boxMM(
      "granite_pale",
      SX0 - 0.6,
      SHAFT_H - 0.4,
      SZ0 - 0.6,
      SX1 + 0.6,
      SHAFT_H + 0.3,
      SZ1 + 0.6,
      { tint: gran, faces: "nsewtb" },
    );

    // ================================================= COLONNADE (86..98)
    const CX0 = SX0 + 2.2,
      CX1 = SX1 - 2.2,
      CZ0 = SZ0 + 2.2,
      CZ1 = SZ1 - 2.2;
    K.fwall(
      b,
      "tower",
      CX0,
      CZ0,
      CX1,
      CZ0,
      SHAFT_H + 0.3,
      COLO_H - SHAFT_H - 0.3,
      0,
      -1,
      { tint: [0.3, 0.3, 0.29] },
    );
    K.fwall(
      b,
      "tower",
      CX0,
      CZ1,
      CX1,
      CZ1,
      SHAFT_H + 0.3,
      COLO_H - SHAFT_H - 0.3,
      0,
      1,
      { tint: [0.28, 0.28, 0.27] },
    );
    K.fwall(
      b,
      "tower",
      CX0,
      CZ0,
      CX0,
      CZ1,
      SHAFT_H + 0.3,
      COLO_H - SHAFT_H - 0.3,
      -1,
      0,
      { tint: [0.29, 0.29, 0.28] },
    );
    K.fwall(
      b,
      "tower",
      CX1,
      CZ0,
      CX1,
      CZ1,
      SHAFT_H + 0.3,
      COLO_H - SHAFT_H - 0.3,
      1,
      0,
      { tint: [0.29, 0.29, 0.28] },
    );
    const colAt = (x, z) =>
      K.column(b, x, SHAFT_H + 0.3, z, 0.72, 9.6, {
        kind: "ionic",
        mat: "granite_pale",
        tint: gran.map((v) => v * 1.1),
        flutes: false,
      });
    const cxs = [],
      czs = [];
    for (let i = 0; i < 6; i++)
      cxs.push(SX0 + 0.4 + ((SX1 - SX0 - 0.8) * i) / 5);
    for (let i = 1; i < 4; i++)
      czs.push(SZ0 + 0.4 + ((SZ1 - SZ0 - 0.8) * i) / 4);
    for (const x of cxs) {
      colAt(x, SZ0 + 0.4);
      colAt(x, SZ1 - 0.4);
    }
    for (const z of czs) {
      colAt(SX0 + 0.4, z);
      colAt(SX1 - 0.4, z);
    }
    b.boxMM(
      "granite_pale",
      SX0 - 0.3,
      SHAFT_H + 9.9,
      SZ0 - 0.3,
      SX1 + 0.3,
      SHAFT_H + 10.9,
      SZ1 + 0.3,
      { tint: gran.map((v) => v * 1.08), faces: "nsewtb" },
    ); // architrave
    b.boxMM(
      "granite_pale",
      SX0 - 0.2,
      SHAFT_H + 10.9,
      SZ0 - 0.2,
      SX1 + 0.2,
      COLO_H - 0.4,
      SZ1 + 0.2,
      { tint: gran.map((v) => v * 0.9), faces: "nsewtb" },
    ); // frieze
    for (const [ax, az, bx, bz, nx, nz] of [
      [SX0, SZ0 - 0.2, SX1, SZ0 - 0.2, 0, -1],
      [SX0, SZ1 + 0.2, SX1, SZ1 + 0.2, 0, 1],
      [SX0 - 0.2, SZ0, SX0 - 0.2, SZ1, -1, 0],
      [SX1 + 0.2, SZ0, SX1 + 0.2, SZ1, 1, 0],
    ]) {
      const len = Math.hypot(bx - ax, bz - az),
        n = Math.floor(len / 0.7);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        b.box(
          "granite_pale",
          ax + (bx - ax) * t + nx * 0.12,
          COLO_H - 0.75,
          az + (bz - az) * t + nz * 0.12,
          nz ? 0.3 : 0.25,
          0.3,
          nx ? 0.3 : 0.25,
          { tint: gran },
        );
      }
    }
    b.boxMM(
      "granite_pale",
      SX0 - 0.7,
      COLO_H - 0.4,
      SZ0 - 0.7,
      SX1 + 0.7,
      COLO_H + 0.2,
      SZ1 + 0.7,
      { tint: gran.map((v) => v * 1.05), faces: "nsewtb" },
    );
    b.face(
      "granite_pale",
      SX0,
      SHAFT_H + 9.9,
      SZ0,
      1,
      0,
      0,
      0,
      0,
      1,
      SX1 - SX0,
      SZ1 - SZ0,
      { uv: "top", tint: [0.5, 0.5, 0.48] },
    );

    // ================================================= THE PYRAMID (24 steps) + lantern + mast
    // 24 steps, rise 0.56 over a 0.45 m run (≈ 0.6 × base tall): each a darker riser under a pale, overhanging tread
    // lip — the light/shadow banding makes the stepped pyramid read from Brooklyn
    const PW0 = SX1 - SX0 - 0.6,
      PD0 = SZ1 - SZ0 - 0.6,
      steps = 24,
      sh = 0.56;
    let top = COLO_H + 0.2;
    for (let i = 0; i < steps; i++) {
      const w = PW0 - ((PW0 - 3.2) * i) / (steps - 1),
        d = PD0 - ((PD0 - 2.6) * i) / (steps - 1);
      const t = 0.74 - r() * 0.04;
      b.box("granite_pale", XC, top, (SZ0 + SZ1) / 2, w, sh - 0.1, d, {
        tint: [t, t * 0.97, t * 0.93],
        faces: "nsew",
        grime: 0.45,
      });
      const tt = 1.04 - r() * 0.04;
      b.box(
        "granite_pale",
        XC,
        top + sh - 0.1,
        (SZ0 + SZ1) / 2,
        w + 0.12,
        0.1,
        d + 0.12,
        { tint: [tt, tt * 0.98, tt * 0.95], faces: "nsewt", grime: 0.28 },
      );
      top += sh;
    }
    const PZ = (SZ0 + SZ1) / 2;
    // lantern: little temple + cone + mast
    b.box("granite_pale", XC, top, PZ, 2.4, 1.6, 1.9, { tint: gran });
    for (const [dx, dz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      b.cyl(
        "granite_pale",
        XC + dx * 1.0,
        top + 1.6,
        PZ + dz * 0.75,
        0.16,
        0.14,
        1.6,
        8,
        { tint: gran },
      );
    b.box("granite_pale", XC, top + 3.2, PZ, 2.5, 0.35, 2.0, { tint: gran });
    b.cyl("granite_pale", XC, top + 3.55, PZ, 1.1, 0.1, 1.6, 4, { tint: gran });
    b.pipe("rust", XC, top + 5.1, PZ, XC, top + 12, PZ, 0.08, 5);
    for (const [ax, az] of [
      [-1.2, -1],
      [1.2, -1],
      [0, 1],
    ])
      b.pipe(
        "black_iron",
        XC,
        top + 10,
        PZ,
        XC + ax,
        top + 3.4,
        PZ + az,
        0.012,
        3,
      );
    b.pipe("rust", XC, top + 11, PZ, XC + 1.6, top + 12.4, PZ + 0.3, 0.05, 4); // bent dish arm
    BT.beacon = new THREE.Vector3(XC, top + 12.2, PZ);
    BT.roofTop = top;
    b.col(
      XC - PW0 / 2,
      COLO_H,
      PZ - PD0 / 2,
      XC + PW0 / 2,
      top + 1.6,
      PZ + PD0 / 2,
      { tag: "building" },
    );

    // ================================================= street dressing
    // a would-be robber crew that never got past the door
    K.litter(b, PX0 + 0.3, Z0 + 1.8, PX1 - 0.3, LOG_Z - 0.6, LOG_Y, 16, 2201);
    b.hplate(
      "decal",
      XC - 3,
      LOG_Y + 0.012,
      LOG_Z - 1.6,
      2.4,
      1.8,
      0.3,
      K.decal("scorch", 40),
    );
    b.hplate(
      "decal",
      XC + 2.5,
      LOG_Y + 0.013,
      LOG_Z - 2.6,
      1.6,
      1.4,
      1.1,
      K.decal("blood", 41),
    );
    b.plate(
      "art",
      X0 - 0.02,
      3.2,
      LOG_Z + 1.3,
      -1,
      0,
      1.4,
      2.0,
      K.signCell(
        "bt_poster",
        "YOUR SAVINGS\nARE SAFE\n\nFederally\nInsured\nDeposits",
        192,
        256,
        { bg: "#2a4a3a", fg: "#ece2c6", font: "Arial Black, sans-serif" },
      ),
      { off: 0.04 },
    );
    b.plate(
      "decal",
      X1 + 0.03,
      2.5,
      826,
      1,
      0,
      6,
      1.4,
      K.tag("THE ROBOTS ARE STILL OPEN", "#d02020", 512, 96, { size: 0.45 }),
      { off: 0.02 },
    );
    b.plate(
      "art",
      PX1 - 0.6,
      LOG_Y + 1.8,
      LOG_Z - 0.18,
      0,
      -1,
      1.0,
      1.4,
      K.signCell(
        "bt_hours",
        "BANKING HOURS\nMON–FRI\n9 – 3\n\nNIGHT DEPOSIT\n→",
        160,
        224,
        { bg: "#2a2a26", fg: "#d8c890", font: "Georgia, serif" },
      ),
      { off: 0.05 },
    );

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_bankers_trust_ext";

    // aircraft beacon: its own additive sprite, blinked in update
    const bm = new THREE.SpriteMaterial({
      map: K.glowTex(),
      color: 0xff2a18,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false,
    });
    const beacon = new THREE.Sprite(bm);
    beacon.scale.set(5, 5, 1);
    beacon.position.copy(BT.beacon);
    beacon.name = "bt_beacon";
    ctx.extRoot.add(beacon);
    ctx.beacon = beacon;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xff3020, toneMapped: false }),
    );
    bulb.position.copy(BT.beacon);
    ctx.extRoot.add(bulb);
    ctx.beaconBulb = bulb;

    K.anchor(ctx, "door", XC, LOG_Y, LOG_Z - 1.6, false);
    K.skel(ctx, XC - 3.2, LOG_Y, LOG_Z - 1.7, 0.4, "lying", { world: true });
    K.skel(ctx, XC + 2.8, LOG_Y, LOG_Z - 2.9, 2.6, "reaching", { world: true });
    K.loot(ctx, "duffle_bag", XC + 1.2, LOG_Y, LOG_Z - 1.9, 0.5, {
      world: true,
      loot: "duffle_bag",
      name: "Robber's Duffle Bag",
    });
    K.note(
      ctx,
      "pf3_note_heist",
      XC - 2.6,
      LOG_Y + 0.03,
      LOG_Z - 1.2,
      {
        name: "Heist Plan (bloodstained)",
        title: "THE JOB — 14 WALL",
        text: "CREW: me, Dutch, Lefty, the Professor\n\n1. Robots inside still think it's 1967. They let customers in during \"banking hours.\" Walk in like customers.\n2. Vault's downstairs. Time lock. Professor says the console in front of it takes a password, and the vault clerks kept it on a duty card down there. Or the big boss upstairs had an override code for the keypad.\n3. When the vault opens the clock starts. Grab the gold, GET OUT before it shuts. If it shuts with you inside, there's a vent (Dutch says). Dutch also said the robots would be slow.\n4. Split four ways.\n\n(the rest is blood)",
      },
      { world: true },
    );
  }

  // ------------------------------------------------------------------
