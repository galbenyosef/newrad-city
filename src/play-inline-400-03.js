// play-inline-400 03 — tint
// Lines 303-1430 of readable/play-inline-400.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "ce_ext", grime: 0.5, seg: 6 });
    const d = K.builder({ name: "ce_ext_detail", grime: 0.6 });
    const beacon = K.builder({ name: "ce_beacon", grime: 0 });
    const avia = K.builder({ name: "ce_avia", grime: 0 });
    const r = K.rng("ce_ext");

    // ---------------- forecourt paving + steps ----------------
    b.face("granite", 160, 0.02, 257, 1, 0, 0, 0, 0, -1, 30, 26, {
      uv: "top",
      tint: [0.55, 0.54, 0.52],
    });

    // ---------------- granite base (0..8.5) with arched bays ----------------
    const GB = 8.5;
    const sides = [
      [X0, Z1, X1, Z1, 0, 1, 7],
      [X1, Z1, X1, Z0, 1, 0, 6],
      [X1, Z0, X0, Z0, 0, -1, 7],
      [X0, Z0, X0, Z1, -1, 0, 6],
    ];
    for (const [ax, az, bx, bz, nx, nz, bays] of sides) {
      const len = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / len,
        uz = (bz - az) / len;
      const cross = [-uz, 0, ux];
      if (cross[0] * nx + cross[2] * nz > 0)
        b.face("granite", ax, 0, az, ux, 0, uz, 0, 1, 0, len, GB, {
          tint: GRAN,
        });
      else
        b.face("granite", bx, 0, bz, -ux, 0, -uz, 0, 1, 0, len, GB, {
          tint: GRAN,
        });
      const bw = len / bays;
      for (let i = 0; i < bays; i++) {
        const t = (i + 0.5) * bw,
          cx = ax + ux * t,
          cz = az + uz * t;
        if (nz === 1 && Math.abs(cx - DOOR.x) < bw * 0.6) continue; // portal bay
        K.archWin(b, cx, 1.2, cz, nx, nz, bw * 0.55, 6.0, {
          state: r() < 0.5 ? "boarded" : r() < 0.5 ? "broken" : "dark",
          surround: "granite",
          surroundTint: GRAN.map((v) => v * 1.15),
          fw: 0.3,
          depth: 0.25,
        });
      }
      b.beam(
        "granite",
        ax + nx * 0.2,
        GB - 0.3,
        az + nz * 0.2,
        bx + nx * 0.2,
        GB - 0.3,
        bz + nz * 0.2,
        0.4,
        0.6,
        { tint: GRAN.map((v) => v * 1.1) },
      );
    }
    b.col(X0, 0, Z0, X1, BH, Z1, { tag: "building" });

    // rusticated granite: deep horizontal joints across the base (between the arches)
    for (const [ax, az, bx, bz, nx, nz] of sides)
      for (let y = 1.0; y < GB - 1.2; y += 0.95) {
        b.beam(
          "granite",
          ax + nx * 0.03,
          y,
          az + nz * 0.03,
          bx + nx * 0.03,
          y,
          bz + nz * 0.03,
          0.06,
          0.07,
          { tint: GRAN.map((v) => v * 0.55), grime: 0.2 },
        );
      }

    // ---------------- office floors (8.5..36): 7 window floors + a two-storey colonnade crown ----------------
    const hole = (x, y, z) => x > 184 && z < 240 && y > 24; // blast damage at the north-east corner
    const COL0 = 29.2; // colonnade band 29.2..35
    for (const [ax, az, bx, bz, nx, nz, bays] of [
      [X0, Z1, X1, Z1, 0, 1, 9],
      [X1, Z1, X1, Z0, 1, 0, 8],
      [X1, Z0, X0, Z0, 0, -1, 9],
      [X0, Z0, X0, Z1, -1, 0, 8],
    ]) {
      officeFace(b, r, ax, az, bx, bz, nx, nz, GB, COL0, bays, 3.45, hole, {
        glowChance: 0.05,
        d,
      });
      // colonnade crown: recessed dark loggia wall, ledge + balustrade, a column in front of every pier, entablature
      const len = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / len,
        uz = (bz - az) / len,
        bw = len / bays;
      b.beam("limestone", ax, COL0 - 0.2, az, bx, COL0 - 0.2, bz, 1.9, 0.45, {
        tint: LIME.map((v) => v * 1.02),
      });
      const cross = [-uz, 0, ux];
      const recess = (u) =>
        cross[0] * nx + cross[2] * nz > 0
          ? [ax, az, ux, uz]
          : [bx, bz, -ux, -uz];
      const [rx0, rz0, rux, ruz] = recess();
      b.face(
        "limestone",
        rx0 - nx * 0.9,
        COL0 + 0.25,
        rz0 - nz * 0.9,
        rux,
        0,
        ruz,
        0,
        1,
        0,
        len,
        BH - 1.2 - COL0 - 0.25,
        { tint: LIME.map((v) => v * 0.55) },
      );
      for (let i = 0; i < bays; i++) {
        const t = (i + 0.5) * bw,
          cx = ax + ux * t,
          cz = az + uz * t;
        if (hole(cx, 31, cz)) continue;
        b.plate(
          r() < 0.3 ? "glass" : "paint_black",
          cx - nx * 0.85,
          COL0 + 3.1,
          cz - nz * 0.85,
          nx,
          nz,
          bw - 1.1,
          4.4,
          null,
          { off: 0, tint: [0.05, 0.05, 0.055] },
        );
      }
      balustrade(
        d,
        ax + nx * 0.55,
        az + nz * 0.55,
        bx + nx * 0.55,
        bz + nz * 0.55,
        COL0 + 0.25,
        { h: 0.95 },
      );
      for (let i = 0; i <= bays; i++) {
        const t = i * bw,
          px = ax + ux * t + nx * 0.45,
          pz = az + uz * t + nz * 0.45;
        if (hole(px, 31, pz)) continue;
        K.column(b, px, COL0 + 0.25, pz, 0.34, BH - 1.2 - COL0 - 0.25, {
          kind: "ionic",
          mat: "limestone",
          tint: LIME,
          flutes: false,
        });
      }
      b.beam(
        "limestone",
        ax + nx * 0.05,
        BH - 1.2,
        az + nz * 0.05,
        bx + nx * 0.05,
        BH - 1.2,
        bz + nz * 0.05,
        2.0,
        0.4,
        { tint: LIME.map((v) => v * 0.97) },
      );
    }
    // solid corner pavilions frame the colonnade
    for (const [qx, qz] of [
      [X0, Z0],
      [X1, Z1],
      [X0, Z1],
    ])
      b.box("limestone", qx, COL0 - 0.2, qz, 2.2, BH - 1.2 - COL0 + 0.2, 2.2, {
        tint: LIME.map((v) => v * 1.02),
      });
    // the blast hole: blackened, girders bent out, a slab hanging
    b.burn(188, 30, 234, 6, 0.85);
    b.boxMM("paint_black", 185.2, 25, Z0 - 0.05, 189.05, 34.6, 233.5, {
      tint: [0.02, 0.02, 0.02],
      faces: "ne",
    });
    for (let k = 0; k < 6; k++) {
      const y = 26 + k * 1.6;
      b.beam(
        "rust",
        185 + r() * 3,
        y,
        Z0 + 0.5,
        186 + r() * 4,
        y + (r() - 0.5) * 2,
        Z0 - 1.5 - r() * 2,
        0.2,
        0.3,
        { tint: [0.45, 0.3, 0.22] },
      );
    }
    b.box("concrete", 187.5, 23.5, Z0 - 1.2, 3.2, 0.35, 2.2, {
      yaw: 0.3,
      tint: [0.6, 0.58, 0.54],
    });
    // main cornice at the setback + a roof balustrade with corner urns
    K.cornice(b, X0, Z1, X1, Z1, BH - 1, 0, 1, {
      mat: "limestone",
      tint: LIME,
      depth: 1.2,
      h: 1.1,
      brackets: 1.4,
    });
    K.cornice(b, X1, Z1, X1, Z0, BH - 1, 1, 0, {
      mat: "limestone",
      tint: LIME,
      depth: 1.2,
      h: 1.1,
      brackets: 1.4,
    });
    K.cornice(b, X1, Z0, X0, Z0, BH - 1, 0, -1, {
      mat: "limestone",
      tint: LIME,
      depth: 1.2,
      h: 1.1,
      brackets: 1.4,
    });
    K.cornice(b, X0, Z0, X0, Z1, BH - 1, -1, 0, {
      mat: "limestone",
      tint: LIME,
      depth: 1.2,
      h: 1.1,
      brackets: 1.4,
    });
    b.face("concrete_dark", X0, BH, Z1, 1, 0, 0, 0, 0, -1, X1 - X0, Z1 - Z0, {
      uv: "top",
      tint: [0.4, 0.4, 0.38],
    });
    balustrade(d, X0 + 0.3, Z1 - 0.3, X1 - 0.3, Z1 - 0.3, BH, { h: 1.1 });
    balustrade(d, X1 - 0.3, Z1 - 0.3, X1 - 0.3, Z0 + 0.3, BH, { h: 1.1 });
    balustrade(d, X0 + 0.3, Z0 + 0.3, X0 + 0.3, Z1 - 0.3, BH, { h: 1.1 });
    for (const [ux2, uz2] of [
      [X0 + 0.6, Z1 - 0.6],
      [X1 - 0.6, Z1 - 0.6],
      [X0 + 0.6, Z0 + 0.6],
    ]) {
      b.box("limestone", ux2, BH, uz2, 1.0, 1.4, 1.0, { tint: LIME });
      b.cyl("limestone", ux2, BH + 1.4, uz2, 0.3, 0.5, 0.9, 8, { tint: LIME });
      b.geo("limestone", K.sphereGeo(), {
        x: ux2,
        y: BH + 2.45,
        z: uz2,
        s: 0.26,
        tint: LIME,
      });
    }
    // roof clutter on the setback: vents, a rooftop antenna mast with dead dishes
    for (const [vx, vz] of [
      [165, 250],
      [186, 250],
      [166, 236],
    ]) {
      b.boxMM(
        "metal_dark",
        vx - 0.8,
        BH,
        vz - 0.6,
        vx + 0.8,
        BH + 1.4,
        vz + 0.6,
        { tint: [0.35, 0.36, 0.34] },
      );
      b.cyl("metal_dark", vx, BH + 1.4, vz, 0.35, 0.35, 0.6, 8, {
        tint: [0.3, 0.3, 0.28],
      });
    }
    b.cyl("metal_dark", 185.5, BH, 250.5, 0.1, 0.06, 9, 6, {
      tint: [0.3, 0.3, 0.3],
    });
    b.geo(
      "metal",
      new THREE.SphereGeometry(0.9, 10, 5, 0, PI * 2, 0, PI / 2.4),
      { x: 185.5, y: BH + 6.5, z: 250.1, rx: -1.2, tint: [0.6, 0.6, 0.56] },
    );

    // ---------------- the grand portal ----------------
    const PW = 5.2;
    b.boxMM(
      "granite",
      DOOR.x - PW / 2 - 0.9,
      0,
      Z1,
      DOOR.x + PW / 2 + 0.9,
      GB + 1.2,
      Z1 + 0.7,
      { tint: GRAN.map((v) => v * 1.1), faces: "sewt" },
    );
    for (let i = 0; i < 10; i++) {
      const a0 = (PI * i) / 10,
        a1 = (PI * (i + 1)) / 10;
      b.beam(
        "granite",
        DOOR.x + Math.cos(a0) * (PW / 2 + 0.3),
        4.2 + Math.sin(a0) * (PW / 2 + 0.3),
        Z1 + 0.75,
        DOOR.x + Math.cos(a1) * (PW / 2 + 0.3),
        4.2 + Math.sin(a1) * (PW / 2 + 0.3),
        Z1 + 0.75,
        0.6,
        0.3,
        { tint: i % 2 ? GRAN : GRAN.map((v) => v * 1.25) },
      );
    }
    b.boxMM(
      "paint_black",
      DOOR.x - PW / 2,
      0,
      Z1 + 0.71,
      DOOR.x + PW / 2,
      4.2,
      Z1 + 0.72,
      { tint: [0.03, 0.03, 0.03] },
    );
    for (let i = 0; i < 12; i++) {
      const a0 = (PI * i) / 12,
        a1 = (PI * (i + 1)) / 12,
        C = [DOOR.x, 4.2, Z1 + 0.715],
        A = [
          DOOR.x + (Math.cos(a0) * PW) / 2,
          4.2 + (Math.sin(a0) * PW) / 2,
          Z1 + 0.715,
        ],
        B = [
          DOOR.x + (Math.cos(a1) * PW) / 2,
          4.2 + (Math.sin(a1) * PW) / 2,
          Z1 + 0.715,
        ];
      b.quadN("paint_black", C, A, B, B, [0, 0, 1], {
        tint: [0.03, 0.03, 0.03],
      });
    }
    // bronze doors + transom grille
    // (brighter bronze + glazed upper panels lit red by the lobby's emergency lamp, push bars, kick plates:
    //  the entrance has to read as a DOOR from across 15th Street, not a black arch)
    const BRZ = [0.66, 0.52, 0.3];
    b.boxMM(
      "granite",
      DOOR.x - 1.45,
      0,
      Z1 + 0.72,
      DOOR.x + 1.45,
      3.55,
      Z1 + 0.74,
      { tint: GRAN.map((v) => v * 0.8) },
    );
    for (const s of [-1, 1]) {
      const xa = Math.min(DOOR.x + s * 0.04, DOOR.x + s * 1.3),
        xb = Math.max(DOOR.x + s * 0.04, DOOR.x + s * 1.3);
      b.boxMM("bronze", xa, 0, Z1 + 0.74, xb, 3.4, Z1 + 0.82, { tint: BRZ });
      b.boxMM(
        "bronze",
        xa + 0.14,
        0.25,
        Z1 + 0.82,
        xb - 0.14,
        1.25,
        Z1 + 0.87,
        { tint: BRZ.map((v) => v * 1.18) },
      ); // lower panel
      b.boxMM(
        "lamp",
        xa + 0.16,
        1.55,
        Z1 + 0.822,
        xb - 0.16,
        3.15,
        Z1 + 0.826,
        { tint: [0.34, 0.07, 0.05] },
      ); // glass, red-lit from inside
      b.boxMM(
        "bronze",
        (xa + xb) / 2 - 0.025,
        1.55,
        Z1 + 0.826,
        (xa + xb) / 2 + 0.025,
        3.15,
        Z1 + 0.85,
        { tint: BRZ },
      ); // glazing bar
      b.boxMM("bronze", xa + 0.1, 1.3, Z1 + 0.82, xb - 0.1, 1.5, Z1 + 0.86, {
        tint: BRZ.map((v) => v * 1.1),
      }); // mid rail
      b.boxMM("brass", xa + 0.12, 1.05, Z1 + 0.9, xb - 0.12, 1.1, Z1 + 0.95, {
        tint: [0.82, 0.66, 0.36],
      }); // push bar
      b.boxMM("brass", xa + 0.05, 0.02, Z1 + 0.82, xb - 0.05, 0.22, Z1 + 0.84, {
        tint: [0.7, 0.56, 0.32],
      }); // kick plate
    }
    b.boxMM("lamp", DOOR.x - 1.3, 0.0, Z1 + 0.8, DOOR.x + 1.3, 0.02, Z1 + 0.9, {
      tint: [0.4, 0.08, 0.05],
    }); // light under the door
    // two bronze lanterns on the jambs, still fed by Transformer B (dim, flickerless)
    for (const s of [-1, 1]) {
      const lx = DOOR.x + s * (PW / 2 + 0.45);
      b.boxMM("bronze", lx - 0.08, 3.0, Z1 + 0.7, lx + 0.08, 3.12, Z1 + 1.1, {
        tint: BRZ,
      });
      b.cyl("bronze", lx, 2.55, Z1 + 1.12, 0.2, 0.14, 0.12, 8, { tint: BRZ });
      b.cyl("lamp", lx, 2.67, Z1 + 1.12, 0.15, 0.17, 0.4, 8, {
        tint: [1, 0.78, 0.46],
      });
      b.cyl("bronze", lx, 3.07, Z1 + 1.12, 0.05, 0.22, 0.14, 8, { tint: BRZ });
      b.glow(lx, 2.87, Z1 + 1.2, [1, 0.72, 0.4], 1.6);
    }
    for (let k = -4; k <= 4; k++)
      b.beam(
        "bronze",
        DOOR.x + k * 0.5,
        3.5,
        Z1 + 0.76,
        DOOR.x + k * 0.55,
        3.5 + Math.sqrt(Math.max(0, 6.5 - (k * 0.55) ** 2)) * 0.95,
        Z1 + 0.76,
        0.06,
        0.06,
        { tint: [0.45, 0.36, 0.2] },
      );
    b.col(
      DOOR.x - PW / 2 - 0.9,
      0,
      Z1,
      DOOR.x - PW / 2 + 0.1,
      GB,
      Z1 + 0.75,
      {},
    );
    b.col(
      DOOR.x + PW / 2 - 0.1,
      0,
      Z1,
      DOOR.x + PW / 2 + 0.9,
      GB,
      Z1 + 0.75,
      {},
    );
    for (let i = 0; i < 3; i++) {
      b.boxMM(
        "granite",
        DOOR.x - PW / 2 - 1.5 + i * 0.001,
        0,
        Z1 + 0.75 + i * 0.4,
        DOOR.x + PW / 2 + 1.5,
        0.45 - i * 0.15,
        Z1 + 1.15 + i * 0.4,
        { tint: GRAN },
      );
      b.col(
        DOOR.x - PW / 2 - 1.5,
        0,
        Z1 + 0.75 + i * 0.4,
        DOOR.x + PW / 2 + 1.5,
        0.45 - i * 0.15,
        Z1 + 1.15 + i * 0.4,
        { tag: "steps" },
      );
    }
    // the frieze: FIVE BOROUGHS POWER COMPANY (letters missing)
    const frieze = K.paint(
      "art",
      "ce_frieze",
      1024,
      72,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        x.fillStyle = "#6a5a38";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.font = 'bold 50px Georgia, "Times New Roman", serif';
        const txt = "FIVE  BOROUGHS  POWER  COMPANY  OF  NEW  YORK";
        const missing = new Set([3, 11, 16, 17, 27, 38]);
        let px = X + 20;
        const step = (W - 40) / txt.length;
        for (let i = 0; i < txt.length; i++) {
          if (!missing.has(i))
            x.fillText(txt[i], px + step / 2, Y + H / 2 + (i === 21 ? 8 : 0));
          px += step;
        }
      },
    );
    b.plate("art", CX, GB + 0.55, Z1 + 0.72, 0, 1, 22, 1.5, frieze, {
      off: 0.02,
    });
    K.letters(b, DOOR.x, 5.1, Z1 + 0.77, 0, 1, 3.8, 0.5, "4  IRVING  PLACE", {
      fg: "#b89850",
      font: "Georgia, serif",
      off: 0.01,
    });
    // bronze lanterns either side of the portal (dead)
    for (const s of [-1, 1]) {
      const x = DOOR.x + s * (PW / 2 + 1.3);
      b.beam("bronze", x, 3.4, Z1 + 0.7, x, 3.4, Z1 + 1.3, 0.06, 0.06, {
        tint: [0.4, 0.32, 0.18],
      });
      b.cyl("bronze", x, 2.7, Z1 + 1.3, 0.22, 0.3, 0.8, 8, {
        tint: [0.4, 0.32, 0.18],
      });
      b.cyl("glass", x, 2.8, Z1 + 1.3, 0.2, 0.26, 0.55, 8, {
        tint: [0.3, 0.3, 0.28],
      });
    }

    // ---------------- THE TOWER ----------------
    const tx0 = CX - TW / 2,
      tx1 = CX + TW / 2,
      tz0 = CZ - TW / 2,
      tz1 = CZ + TW / 2;
    const TS0 = BH,
      TS1 = 58; // shaft
    const FACES4 = [
      [tx0, tz1, tx1, tz1, 0, 1],
      [tx1, tz1, tx1, tz0, 1, 0],
      [tx1, tz0, tx0, tz0, 0, -1],
      [tx0, tz0, tx0, tz1, -1, 0],
    ];
    for (const [ax, az, bx, bz, nx, nz] of FACES4)
      officeFace(b, r, ax, az, bx, bz, nx, nz, TS0, TS1, 4, 3.6, null, {
        pier: 0.7,
        pierDepth: 0.5,
        arch: true,
        glowChance: 0.08,
      });
    b.col(tx0, TS0, tz0, tx1, 78, tz1, { tag: "building" });
    // corner quoins up the shaft (stepped, rusticated every other course)
    for (const [qx, qz] of [
      [tx0, tz0],
      [tx1, tz0],
      [tx1, tz1],
      [tx0, tz1],
    ]) {
      b.box("limestone", qx, TS0, qz, 1.3, TS1 - TS0 + 0.6, 1.3, {
        tint: LIME.map((v) => v * 1.03),
      });
      for (let y = TS0 + 0.8; y < TS1; y += 1.6)
        b.box("limestone", qx, y, qz, 1.5, 0.8, 1.5, {
          tint: LIME.map((v) => v * 0.98),
        });
    }
    // ---- clock stage (58..68): 5.5 m dials inside square bronze-edged frames, a pediment over each, obelisks at the corners
    const CS0 = TS1,
      CS1 = 68;
    b.boxMM(
      "limestone",
      tx0 - 0.6,
      CS0,
      tz0 - 0.6,
      tx1 + 0.6,
      CS0 + 0.7,
      tz1 + 0.6,
      { tint: LIME, faces: "nsewtb" },
    );
    b.boxMM(
      "limestone",
      tx0 - 0.4,
      CS0 - 0.5,
      tz0 - 0.4,
      tx1 + 0.4,
      CS0,
      tz1 + 0.4,
      { tint: LIME.map((v) => v * 0.92), faces: "nsewb" },
    );
    for (const [ax, az, bx, bz, nx, nz] of FACES4) {
      const len = TW,
        ux = (bx - ax) / len,
        uz = (bz - az) / len;
      const cross = [-uz, 0, ux];
      if (cross[0] * nx + cross[2] * nz > 0)
        b.face(
          "limestone",
          ax,
          CS0 + 0.7,
          az,
          ux,
          0,
          uz,
          0,
          1,
          0,
          len,
          CS1 - CS0 - 0.7,
          { tint: LIME },
        );
      else
        b.face(
          "limestone",
          bx,
          CS0 + 0.7,
          bz,
          -ux,
          0,
          -uz,
          0,
          1,
          0,
          len,
          CS1 - CS0 - 0.7,
          { tint: LIME },
        );
    }
    const dial = K.clockCell("ce_day", {
      hour: 9,
      minute: 47,
      roman: false,
      face: "#f0ead8",
      ring: "#3a3020",
    });
    const litDial = K.clockCell("ce_lit", {
      lit: true,
      hour: 9,
      minute: 47,
      roman: false,
      glowIn: "#f8f0d0",
      glowOut: "#c8b070",
    });
    const faces = [
      [CX, tz1, 0, 1],
      [tx1, CZ, 1, 0],
      [CX, tz0, 0, -1],
      [tx0, CZ, -1, 0],
    ];
    const yc = (CS0 + CS1) / 2 + 0.2;
    for (const [x, z, nx, nz] of faces) {
      const rx = nz,
        rz = -nx,
        yaw = Math.atan2(nx, nz);
      // square frame: two pilasters + lintel + sill, then a triangular pediment breaking the skyline
      for (const s2 of [-1, 1])
        K.pilaster(
          b,
          x + rx * s2 * 4.3,
          CS0 + 0.7,
          z + rz * s2 * 4.3,
          nx,
          nz,
          1.0,
          CS1 - CS0 - 0.7,
          { mat: "limestone", tint: LIME.map((v) => v * 1.04), depth: 0.4 },
        );
      b.box(
        "limestone",
        x + nx * 0.2,
        CS1 - 0.9,
        z + nz * 0.2,
        9.6,
        0.9,
        0.45,
        { yaw, tint: LIME.map((v) => v * 1.04) },
      );
      b.quadN(
        "limestone",
        [x - rx * 5 + nx * 0.45, CS1, z - rz * 5 + nz * 0.45],
        [x + rx * 5 + nx * 0.45, CS1, z + rz * 5 + nz * 0.45],
        [x + nx * 0.45, CS1 + 2.4, z + nz * 0.45],
        [x + nx * 0.45, CS1 + 2.4, z + nz * 0.45],
        [nx, 0, nz],
        { tint: LIME.map((v) => v * 0.98) },
      );
      for (const s2 of [-1, 1])
        b.quadN(
          "limestone",
          [x + rx * s2 * 5 + nx * 0.45, CS1, z + rz * s2 * 5 + nz * 0.45],
          [x + rx * s2 * 5 - nx * 1.5, CS1, z + rz * s2 * 5 - nz * 1.5],
          [x - nx * 1.5, CS1 + 2.4, z - nz * 1.5],
          [x + nx * 0.45, CS1 + 2.4, z + nz * 0.45],
          [rx * s2 * 0.4 + nx * 0.1, 0.9, rz * s2 * 0.4 + nz * 0.1],
          { tint: LIME.map((v) => v * 0.9) },
        );
      b.geo("bronze", new THREE.TorusGeometry(2.95, 0.26, 6, 36), {
        x: x + nx * 0.16,
        y: yc,
        z: z + nz * 0.16,
        ry: yaw,
        tint: [0.36, 0.44, 0.34],
      });
      b.geo("limestone", new THREE.TorusGeometry(3.35, 0.2, 5, 36), {
        x: x + nx * 0.1,
        y: yc,
        z: z + nz * 0.1,
        ry: yaw,
        tint: LIME.map((v) => v * 0.9),
      });
      b.plate("art", x, yc, z, nx, nz, 5.8, 5.8, dial, { off: 0.06 });
      beacon.plate("neon", x, yc, z, nx, nz, 5.8, 5.8, litDial, {
        off: 0.09,
        tint: [1, 0.92, 0.7],
      });
      beacon.glow(x + nx * 1.2, yc, z + nz * 1.2, [1, 0.85, 0.55], 9);
      // carved spandrel rosettes at the frame corners
      for (const [su, sv] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.geo("limestone", K.sphereGeo(), {
          x: x + rx * su * 3.4 + nx * 0.1,
          y: yc + sv * 3.4,
          z: z + rz * su * 3.4 + nz * 0.1,
          s: 0.32,
          sy: 0.32,
          tint: LIME.map((v) => v * 0.95),
        });
    }
    for (const [qx, qz] of [
      [tx0, tz0],
      [tx1, tz0],
      [tx1, tz1],
      [tx0, tz1],
    ]) {
      // corner obelisks
      b.box("limestone", qx, CS1 - 0.2, qz, 1.4, 1.0, 1.4, { tint: LIME });
      b.cyl("limestone", qx, CS1 + 0.8, qz, 0.55, 0.18, 3.6, 4, {
        tint: LIME.map((v) => v * 1.03),
      });
      b.geo("bronze", K.sphereGeo(), {
        x: qx,
        y: CS1 + 4.55,
        z: qz,
        s: 0.22,
        tint: [0.36, 0.46, 0.36],
      });
    }
    // ---- loggia (68..78): open colonnade of paired Ionic columns round a dark core, balustrade between them
    const LG0 = CS1 + 0.3,
      LG1 = 78;
    b.boxMM(
      "limestone",
      tx0 - 0.4,
      LG0 - 0.3,
      tz0 - 0.4,
      tx1 + 0.4,
      LG0 + 0.4,
      tz1 + 0.4,
      { tint: LIME, faces: "nsewtb" },
    );
    b.boxMM(
      "limestone",
      CX - 3.8,
      LG0 + 0.4,
      CZ - 3.8,
      CX + 3.8,
      LG1,
      CZ + 3.8,
      { tint: LIME.map((v) => v * 0.45) },
    );
    for (const [x, z, nx, nz] of faces) {
      // dark arched niche in each core face (the lantern stair)
      K.archWin(
        b,
        x - nx * (TW / 2 - 3.8),
        LG0 + 0.6,
        z - nz * (TW / 2 - 3.8),
        nx,
        nz,
        2.2,
        5.2,
        {
          state: "dark",
          surround: "limestone",
          surroundTint: LIME.map((v) => v * 0.7),
          mullion: false,
          sill: false,
        },
      );
    }
    for (let i = 0; i < 4; i++)
      for (let k = 0; k < 4; k++) {
        const t = -TW / 2 + 1 + (k * (TW - 2)) / 3;
        const pts = [
          [CX + t, tz1 - 0.9],
          [tx1 - 0.9, CZ - t],
          [CX - t, tz0 + 0.9],
          [tx0 + 0.9, CZ + t],
        ];
        const [px, pz] = pts[i];
        const [nx, nz] = [
          [0, 1],
          [1, 0],
          [0, -1],
          [-1, 0],
        ][i];
        for (const s2 of k === 0 || k === 3 ? [0] : [-0.45, 0.45]) {
          K.column(
            b,
            px + nz * s2,
            LG0 + 0.4,
            pz - nx * s2,
            0.34,
            LG1 - LG0 - 1.6,
            { kind: "ionic", mat: "limestone", tint: LIME, flutes: false },
          );
        }
        if (k < 3) {
          const t2 = t + (TW - 2) / 6;
          const q = [
            [CX + t2, tz1 - 0.9],
            [tx1 - 0.9, CZ - t2],
            [CX - t2, tz0 + 0.9],
            [tx0 + 0.9, CZ + t2],
          ][i];
          balustrade(
            b,
            q[0] - nz * 1.1,
            q[1] + nx * 1.1,
            q[0] + nz * 1.1,
            q[1] - nx * 1.1,
            LG0 + 0.4,
            { h: 0.9, step: 0.4 },
          );
        }
      }
    // entablature + cornice over the loggia
    b.boxMM(
      "limestone",
      tx0 - 0.5,
      LG1 - 1.2,
      tz0 - 0.5,
      tx1 + 0.5,
      LG1 - 0.2,
      tz1 + 0.5,
      { tint: LIME.map((v) => v * 0.96), faces: "nsewtb" },
    );
    b.boxMM(
      "limestone",
      tx0 - 0.9,
      LG1 - 0.2,
      tz0 - 0.9,
      tx1 + 0.9,
      LG1 + 0.4,
      tz1 + 0.9,
      { tint: LIME, faces: "nsewtb" },
    );
    beacon.light(CX, LG0 + 3, CZ, [1, 0.9, 0.7], 1, 12);
    for (const [x, z] of [
      [CX, tz1 - 1.5],
      [tx1 - 1.5, CZ],
      [CX, tz0 + 1.5],
      [tx0 + 1.5, CZ],
    ]) {
      beacon.glow(x, LG0 + 2.5, z, [1, 0.88, 0.6], 7);
      beacon.glow(x, LG0 + 6, z, [1, 0.8, 0.5], 5);
    }
    // floodlit loggia core (warm panels read as light spilling between the columns at night)
    for (const [x, z, nx, nz] of faces)
      beacon.plate(
        "lamp",
        x - nx * (TW / 2 - 3.85),
        (LG0 + LG1) / 2,
        z - nz * (TW / 2 - 3.85),
        nx,
        nz,
        7.4,
        LG1 - LG0 - 1.4,
        null,
        { off: 0.03, tint: [0.75, 0.6, 0.38] },
      );
    // ---- stepped pyramid (78..87) with urns on every step
    const PY0 = LG1 + 0.4;
    for (let st = 0; st < 4; st++) {
      const w = TW - 0.6 - st * 2.7,
        y = PY0 + st * 2.1;
      b.boxMM(
        "limestone",
        CX - w / 2,
        y,
        CZ - w / 2,
        CX + w / 2,
        y + 2.1,
        CZ + w / 2,
        { tint: LIME.map((v) => v * (0.97 - st * 0.03)) },
      );
      b.boxMM(
        "limestone",
        CX - w / 2 - 0.15,
        y + 1.85,
        CZ - w / 2 - 0.15,
        CX + w / 2 + 0.15,
        y + 2.1,
        CZ + w / 2 + 0.15,
        { tint: LIME, faces: "nsewtb" },
      );
      if (st < 3)
        for (const [sx, sz] of [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ]) {
          const ux2 = CX + sx * (w / 2 - 0.5),
            uz2 = CZ + sz * (w / 2 - 0.5);
          b.cyl("limestone", ux2, y + 2.1, uz2, 0.28, 0.42, 0.7, 8, {
            tint: LIME,
          });
          b.cyl("bronze", ux2, y + 2.8, uz2, 0.12, 0.02, 0.5, 6, {
            tint: [0.34, 0.44, 0.34],
          });
        }
    }
    // ---- the lantern (87..97): verdigris bronze drum, eight colonnettes round the glass, ribbed dome, obelisk finial
    const LB = PY0 + 8.4;
    b.cyl("bronze", CX, LB - 0.6, CZ, 2.3, 2.1, 0.6, 16, {
      tint: [0.3, 0.42, 0.34],
    });
    b.cyl("bronze", CX, LB, CZ, 1.95, 1.8, 1.0, 16, {
      tint: [0.3, 0.42, 0.34],
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2,
        px = CX + Math.cos(a) * 1.6,
        pz = CZ + Math.sin(a) * 1.6;
      b.cyl("bronze", px, LB + 1, pz, 0.16, 0.12, 3.6, 6, {
        tint: [0.3, 0.42, 0.34],
      });
      b.box("bronze", px, LB + 4.5, pz, 0.4, 0.3, 0.4, {
        yaw: -a,
        tint: [0.32, 0.44, 0.35],
      });
    }
    b.cyl("glass", CX, LB + 1, CZ, 1.4, 1.3, 3.6, 12, {
      tint: [0.25, 0.28, 0.26],
      top: false,
    });
    b.cyl("bronze", CX, LB + 4.6, CZ, 2.0, 2.0, 0.4, 16, {
      tint: [0.3, 0.42, 0.34],
    });
    b.geo(
      "bronze",
      new THREE.SphereGeometry(1.8, 16, 6, 0, PI * 2, 0, PI / 2),
      { x: CX, y: LB + 5.0, z: CZ, sy: 0.9, tint: [0.3, 0.42, 0.34] },
    );
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      b.pipe(
        "bronze",
        CX + Math.cos(a) * 1.8,
        LB + 5.0,
        CZ + Math.sin(a) * 1.8,
        CX + Math.cos(a) * 0.4,
        LB + 6.5,
        CZ + Math.sin(a) * 0.4,
        0.07,
        4,
        { tint: [0.4, 0.52, 0.4] },
      );
    }
    b.cyl("bronze", CX, LB + 6.4, CZ, 0.45, 0.35, 0.6, 8, {
      tint: [0.3, 0.42, 0.34],
    });
    b.cyl("bronze", CX, LB + 7.0, CZ, 0.28, 0.03, 3.2, 4, {
      tint: [0.3, 0.42, 0.34],
    });
    beacon.geo(
      "lamp",
      new THREE.CylinderGeometry(1.25, 1.15, 3.4, 12, 1, true),
      { x: CX, y: LB + 2.8, z: CZ, tint: [1, 0.95, 0.8] },
    );
    beacon.glow(CX, LB + 2.8, CZ, [1, 0.92, 0.7], 22);
    beacon.glow(CX, LB + 2.8, CZ, [1, 0.8, 0.5], 9);
    // the Tower of Light: a soft shaft of light climbing from the lantern into the sky (additive neon cone)
    const shaft = K.paint(
      "neon",
      "ce_shaft",
      64,
      256,
      function (x, X, Y, W, H) {
        const g = x.createLinearGradient(0, Y + H, 0, Y);
        g.addColorStop(0, "rgba(255,236,190,0.55)");
        g.addColorStop(0.25, "rgba(255,226,170,0.22)");
        g.addColorStop(0.7, "rgba(255,220,160,0.06)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        x.fillStyle = "#000";
        x.fillRect(X, Y, W, H);
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
      },
    );
    beacon.geo(
      K.atlasMat("neon", shaft),
      new THREE.CylinderGeometry(9, 1.3, 140, 14, 1, true).translate(0, 70, 0),
      {
        x: CX,
        y: LB + 6,
        z: CZ,
        uv: "rect",
        rect: shaft,
        tint: [0.7, 0.62, 0.48],
      },
    );
    ctx.lanternPos = new THREE.Vector3(CX, LB + 2.8, CZ);
    // aviation lamp on the finial
    avia.geo("lamp", K.sphereGeo(), {
      x: CX,
      y: LB + 10.4,
      z: CZ,
      s: 0.22,
      tint: [1, 0.12, 0.08],
    });
    avia.glow(CX, LB + 10.4, CZ, [1, 0.1, 0.05], 3.5);
    b.cyl("black_iron", CX, LB + 10.1, CZ, 0.06, 0.06, 0.3, 6);

    // ---------------- street: downed lines, a sparking pole transformer ----------------
    const POLE = { x: 160.8, z: 256.4 };
    b.cyl("wood_rotten", POLE.x, 0, POLE.z, 0.16, 0.13, 9.5, 8, {
      tint: [0.35, 0.28, 0.22],
    });
    b.beam(
      "wood_rotten",
      POLE.x - 1.4,
      8.8,
      POLE.z,
      POLE.x + 1.4,
      8.8,
      POLE.z,
      0.14,
      0.14,
      { tint: [0.35, 0.28, 0.22] },
    );
    b.cyl("metal_dark", POLE.x + 0.35, 7.0, POLE.z, 0.32, 0.32, 1.0, 10, {
      tint: [0.35, 0.38, 0.36],
    });
    for (const s of [-1.2, 0, 1.2])
      b.cyl("ceramic", POLE.x + s, 8.9, POLE.z, 0.05, 0.08, 0.18, 6, {
        tint: [0.7, 0.62, 0.5],
      });
    b.col(POLE.x - 0.2, 0, POLE.z - 0.2, POLE.x + 0.2, 9.5, POLE.z + 0.2, {
      tag: "pole",
      walkable: false,
    });
    for (let k = 0; k < 3; k++) {
      const s = -1.2 + k * 1.2;
      let px = POLE.x + s,
        py = 8.9,
        pz = POLE.z;
      for (let i = 1; i <= 8; i++) {
        const t = i / 8,
          nx2 = POLE.x + s + 6 * t + k,
          ny = 8.9 * (1 - t) * (1 - t) + 0.05,
          nz2 = POLE.z - 3 * t * (k + 1) * 0.7;
        d.pipe("rubber", px, py, pz, nx2, ny, nz2, 0.02, 3);
        px = nx2;
        py = ny;
        pz = nz2;
      }
    }
    ctx.sparkPos = new THREE.Vector3(POLE.x + 0.35, 7.2, POLE.z + 0.3);
    b.hplate(
      "decal",
      POLE.x + 2,
      0.03,
      POLE.z - 1.5,
      2.4,
      2.4,
      0.2,
      K.decal("scorch", 5),
    );
    K.rubble(b, 187.5, 0, 230.2, 2.0, 1.2, {
      seed: 5,
      tint: [0.8, 0.78, 0.72],
    });
    b.plate(
      "decal",
      X0 - 0.03,
      2.4,
      246,
      -1,
      0,
      4,
      1.4,
      K.tag("THE MACHINES KEEP THE LIGHTS", "#d8d0c0", 420, 110),
    );
    b.plate(
      "art",
      X1 + 0.03,
      3.2,
      250,
      1,
      0,
      1.4,
      1.8,
      K.signCell(
        "ce_danger",
        "DANGER\nHIGH VOLTAGE\n\nAUTHORISED\nROBOTS ONLY",
        180,
        230,
        {
          bg: "#e0c030",
          fg: "#1a1a1a",
          font: "Arial Black, sans-serif",
          border: "#1a1a1a",
        },
      ),
    );
    K.litter(d, 160.5, 255.5, 189.5, 256.8, 0.03, 16, 3301);

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_five_boro_tower_ext";
    const det = d.finish(ctx.extRoot);
    det.name = "poi_five_boro_detail";
    try {
      G.world.addLOD(det, 220);
    } catch (e) {
      /* optional */
    }
    ctx.litGroup = beacon.finish(ctx.extRoot);
    ctx.litGroup.visible = false;
    ctx.aviaGroup = avia.finish(ctx.extRoot);

    K.anchor(ctx, "door", DOOR.x, 0, Z1 + 2.3, false);
    K.anchor(ctx, "crown", CX, LB, CZ, false);
    K.anchor(ctx, "pole", POLE.x, 0, POLE.z, false);
    K.loot(ctx, "car", 182, 0, 259.4, 1.57, { world: true });
    K.loot(ctx, "jersey_barrier", 170, 0, 257.4, 0, { world: true });
    K.skel(ctx, 184.5, 0.45, 256.9, 2.8, "lying", { world: true });
  }

