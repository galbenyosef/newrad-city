// play-inline-266 03 — box
// Lines 76-686 of readable/play-inline-266.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("gracie_ext", { grime: 0.4 });
    const b = S.b;
    const X0 = 306,
      X1 = 320,
      Z0 = -793,
      Z1 = -771; // main house (front = west face)
    const FY = 0.7,
      G1 = 4.3,
      G2 = 7.6; // floor, 1st floor top, eaves
    // ---------------- park ground ----------------
    b.box("grass", 292.1, 0, -799.9, 331.9, 0.06, -760.1, {
      segLen: 4,
      grime: 0.7,
    });
    b.box("dirt", 292.1, 0.06, -783.6, X0 - 3, 0.09, -780.4, {
      segLen: 3,
      grime: 0.6,
    }); // path from the gate
    b.box("sidewalk", 327.2, 0.06, -799.9, 331.9, 0.12, -760.1, {
      segLen: 4,
      grime: 0.5,
    }); // river promenade
    // promenade railing, lamps, benches (the river is just beyond)
    A.fence(
      S,
      [
        [331.6, -799.8],
        [331.6, -760.2],
      ],
      0.12,
      { h: 1.1, step: 0.2, finial: false },
    );
    for (let z = -796; z <= -764; z += 8)
      A.lampPost(S, 330.8, 0.12, z, {
        h: 3.8,
        lit: z === -780,
        color: 0xffd090,
      });
    for (const z of [-790, -772]) {
      b.box("wood", 329.4, 0.52, z - 1, 329.9, 0.58, z + 1, { seg: false });
      b.box("wood", 329.9, 0.58, z - 1, 330.0, 1.0, z + 1, { seg: false });
      for (const s of [-1, 1])
        b.box(
          "iron",
          329.4,
          0.12,
          z + s * 0.9 - 0.04,
          330.0,
          0.52,
          z + s * 0.9 + 0.04,
          { seg: false },
        );
    }
    // scrap palisade along the land side + gate (sheet metal, doors, car hoods on posts)
    const PZ = [
        [292.6, -799.6],
        [292.6, -784.2],
      ],
      PZ2 = [
        [292.6, -779.8],
        [292.6, -760.4],
      ];
    for (const seg of [PZ, PZ2]) {
      const [a, c] = seg,
        L = Math.abs(c[1] - a[1]),
        n = Math.floor(L / 1.3);
      for (let i = 0; i < n; i++) {
        const rn = P.rng("pal" + a[1] + i),
          z = a[1] + i * 1.3;
        b.box(
          ["corrugated", "rust", "wood_rotten", "metal", "corrugated"][i % 5],
          292.35,
          0,
          z,
          292.55 + rn() * 0.1,
          2.3 + rn() * 0.8,
          z + 1.35,
          { rz: (rn() - 0.5) * 0.08, seg: false, grime: 0.7 },
        );
        if (i % 3 === 0)
          b.box("wood_rotten", 292.6, 0, z - 0.08, 292.8, 3.0, z + 0.08, {
            seg: false,
          });
      }
      S.col(292.2, 0, Math.min(a[1], c[1]), 292.9, 2.6, Math.max(a[1], c[1]), {
        walkable: false,
      });
    }
    for (const z of [-784.3, -779.7]) {
      b.box("wood_rotten", 292.3, 0, z - 0.2, 292.9, 3.6, z + 0.2, {
        seg: false,
      });
      S.col(292.3, 0, z - 0.2, 292.9, 3.6, z + 0.2, { walkable: false });
    }
    b.box("wood_rotten", 292.3, 3.4, -784.5, 292.9, 3.7, -779.5, {
      seg: false,
    });
    D.sign(
      b,
      "gracie_gate",
      [
        "GRACIE MANSION",
        "SEAT OF THE CITY GOVERNMENT",
        "(TEMPORARY)",
        "Citizens Welcome · Guns Holstered",
      ],
      "wood",
      292.2,
      4.4,
      -782,
      4.2,
      1.5,
      -HP,
      { tw: 768, th: 280, bg: "#5a4a32", fg: "#f0e0b0" },
    );
    b.rod("wood_rotten", [292.6, 3.7, -783.9], [292.6, 5.2, -783.9], 0.05, 4);
    b.rod("wood_rotten", [292.6, 3.7, -780.1], [292.6, 5.2, -780.1], 0.05, 4);
    // sandbag post by the gate
    S.prop("sandbags", 295.5, 0.05, -786.5, HP, { count: 3 });
    S.prop("sandbags", 295.5, 0.05, -777.3, HP, { count: 3 });
    // ---------------- the house ----------------
    b.box("brick_red", X0, 0, Z0, X1, FY, Z1, { segLen: 3 });
    b.box("clapboard", X0, FY, Z0, X1, G2, Z1, { segLen: 2 });
    S.col(X0, 0, Z0, X1, G2, Z1, { walkable: false });
    const faces = {
      w: P.face(S, "w", Z0, Z1, X0),
      e: P.face(S, "e", Z0, Z1, X1),
      n: P.face(S, "n", X0, X1, Z0),
      s: P.face(S, "s", X0, X1, Z1),
    };
    for (const k in faces) {
      const F = faces[k];
      F.band("paint_white", FY - 0.05, FY + 0.25, 0, 0.06); // sill board
      F.band("paint_white", G1 - 0.1, G1 + 0.1, 0, 0.04);
      F.box("paint_white", -0.05, 0.2, FY, G2, 0, 0.12, { seg: false });
      F.box("paint_white", F.len - 0.2, F.len + 0.05, FY, G2, 0, 0.12, {
        seg: false,
      }); // corner boards
      F.band("paint_white", G2 - 0.35, G2, 0, 0.1); // frieze board
      F.box("paint_white", -0.4, F.len + 0.4, G2, G2 + 0.18, 0, 0.55, {
        seg: false,
      }); // soffit / eave
      const n = Math.max(2, Math.round(F.len / 2.8));
      for (let i = 0; i < n; i++) {
        const u = 1.4 + (i * (F.len - 2.8)) / (n - 1);
        if (k === "w" && Math.abs(u - F.len / 2) < 1.5) continue; // front door bay
        if (k === "e" && Math.abs(u - F.len / 2) < 1.2) continue; // river door bay
        for (const [y, h] of [
          [FY + 0.75, 2.4],
          [G1 + 0.55, 2.1],
        ]) {
          F.window(u, y, 1.05, h, {
            style: (u + y) % 7 < 1 ? "broken" : "lit",
            frame: "paint_white",
            sill: "paint_white",
            hood: "flat",
            hoodKey: "paint_white",
            mull: true,
          });
          for (const s of [-1, 1])
            F.box(
              "shutter_green",
              u + s * 0.58 - 0.26,
              u + s * 0.58 + 0.26,
              y,
              y + h,
              0.04,
              0.09,
              { seg: false },
            ); // shutters
          for (const s of [-1, 1])
            for (let q = 0; q < 8; q++)
              F.box(
                "paint_green",
                u + s * 0.58 - 0.22,
                u + s * 0.58 + 0.22,
                y + 0.15 + (q * h) / 8.4,
                y + 0.19 + (q * h) / 8.4,
                0.09,
                0.11,
                { seg: false, noAO: true },
              );
        }
      }
    }
    // front door (west): fanlight, sidelights, little pedimented portico on two columns
    const DZ = (Z0 + Z1) / 2;
    const FW = faces.w,
      u0 = FW.len / 2;
    FW.box("paint_white", u0 - 1.5, u0 + 1.5, FY, FY + 3.3, 0, 0.1, {
      seg: false,
    });
    FW.box("wood_dark", u0 - 0.6, u0 + 0.6, FY, FY + 2.5, 0.1, 0.14, {
      seg: false,
    });
    for (const s of [-1, 1])
      FW.box(
        "glass_dark",
        u0 + s * 0.95 - 0.25,
        u0 + s * 0.95 + 0.25,
        FY + 0.4,
        FY + 2.4,
        0.1,
        0.13,
        { seg: false },
      );
    FW.halfDisc("window_lit", u0, FY + 2.55, 0.75, 0.13);
    FW.arch("paint_white", u0, FY + 2.55, 0.75, 0.12, 0.08, 0.2);
    for (const s of [-1, 1])
      A.column(
        b,
        "paint_white",
        X0 - 2.2,
        FY,
        DZ + s * 1.4,
        3.2,
        0.14,
        "doric",
        { S },
      );
    b.box("paint_white", X0 - 2.6, FY + 3.2, DZ - 1.8, X0, FY + 3.5, DZ + 1.8, {
      seg: false,
    });
    const ped = new THREE.Shape();
    ped.moveTo(-1.9, 0);
    ped.lineTo(1.9, 0);
    ped.lineTo(0, 0.8);
    ped.closePath();
    b.extrude("paint_white", ped, 2.6, P.m4(X0 - 2.6, FY + 3.5, DZ, HP), {
      seg: false,
    });
    b.box("brick_red", X0 - 2.8, 0, DZ - 1.9, X0, FY, DZ + 1.9, { seg: false });
    S.col(X0 - 2.8, 0, DZ - 1.9, X0, FY, DZ + 1.9, { surface: "wood" });
    for (let i = 0; i < 3; i++) {
      b.box(
        "brick_red",
        X0 - 3.7 + i * 0.3,
        0,
        DZ - 1.2,
        X0 - 2.8,
        ((i + 1) * FY) / 3,
        DZ + 1.2,
        { seg: false },
      );
      S.col(
        X0 - 3.7 + i * 0.3,
        0,
        DZ - 1.2,
        X0 - 2.8,
        ((i + 1) * FY) / 3,
        DZ + 1.2,
      );
    }
    b.cyl("lamp_dim", X0 - 0.3, FY + 2.6, DZ - 1.2, 0.1, 0.08, 0.3, 6);
    S.glow(X0 - 0.4, FY + 2.75, DZ - 1.2, 0xffd090, 0.7);
    // veranda: wraps the river (east) side and the south end
    const VX = X1 + 3.2,
      VZ = Z1 + 3.2;
    b.box("wood", X1, FY - 0.15, Z0, VX, FY, Z1, { segLen: 2 });
    b.box("wood", X0, FY - 0.15, Z1, VX, FY, VZ, { segLen: 2 });
    b.box("brick_red", X1, 0, Z0, VX, FY - 0.15, Z1, {
      seg: false,
      c: 0x8a8a8a,
    });
    b.box("brick_red", X0, 0, Z1, VX, FY - 0.15, VZ, {
      seg: false,
      c: 0x8a8a8a,
    });
    S.col(X1, 0, Z0, VX, FY, Z1, { surface: "wood" });
    S.col(X0, 0, Z1, VX, FY, VZ, { surface: "wood" });
    const cols = [];
    for (let z = Z0 + 0.3; z <= VZ - 0.2; z += 2.6) cols.push([VX - 0.2, z]);
    for (let x = X0 + 0.3; x < VX - 1; x += 2.6) cols.push([x, VZ - 0.2]);
    for (const [x, z] of cols) {
      b.box("paint_white", x - 0.1, FY, z - 0.1, x + 0.1, G1 + 0.1, z + 0.1, {
        seg: false,
      });
      S.col(x - 0.1, FY, z - 0.1, x + 0.1, G1, z + 0.1, { walkable: false });
    }
    // railings between the columns (gaps for the steps)
    for (let i = 0; i < cols.length - 1; i++) {
      const a = cols[i],
        c = cols[i + 1];
      if (Math.abs(a[0] - c[0]) > 4 || Math.abs(a[1] - c[1]) > 4) continue;
      const mid = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
      if (Math.abs(mid[1] - DZ) < 1.6 && Math.abs(a[0] - (VX - 0.2)) < 0.1)
        continue; // river steps
      chippendale(S, a[0], a[1], c[0], c[1], FY, 0.95, "paint_white");
    }
    for (let i = 0; i < 4; i++) {
      b.box(
        "wood",
        VX + i * 0.3,
        0,
        DZ - 1.3,
        VX + 0.3 + i * 0.3,
        FY - ((i + 1) * FY) / 4 + 0.001,
        DZ + 1.3,
        { seg: false },
      );
      S.col(
        VX + i * 0.3,
        0,
        DZ - 1.3,
        VX + 0.3 + i * 0.3,
        FY - ((i + 1) * FY) / 4 + 0.001,
        DZ + 1.3,
      );
    }
    // veranda roof (low slope, shingles) on a beam
    b.box("paint_white", X1, G1 + 0.1, Z0, VX + 0.1, G1 + 0.4, Z0 + 0.25, {
      seg: false,
    });
    b.box("paint_white", VX - 0.3, G1 + 0.1, Z0, VX + 0.1, G1 + 0.4, VZ + 0.1, {
      seg: false,
    });
    b.box("paint_white", X0, G1 + 0.1, VZ - 0.3, VX + 0.1, G1 + 0.4, VZ + 0.1, {
      seg: false,
    });
    b.box(
      "shingle",
      X1 - 0.1,
      G1 + 0.35,
      Z0 - 0.3,
      VX + 0.5,
      G1 + 0.5,
      VZ + 0.5,
      { rz: -0.12, seg: false },
    );
    b.box("shingle", X0 - 0.3, G1 + 0.36, Z1, X1, G1 + 0.52, VZ + 0.5, {
      rx: 0.12,
      seg: false,
    });
    // porch life: rocking chairs, string lights, a hammock of parachute silk
    D.rockingChair(b, VX - 1.2, FY, DZ - 5, -HP);
    D.rockingChair(b, VX - 1.2, FY, DZ + 5, -HP + 0.3);
    for (let i = 0; i <= 16; i++) {
      const t = i / 16,
        x = X1 + 0.2 + (VX - X1 - 0.4) * 0.5,
        z = Z0 + 1 + t * (Z1 - Z0 - 2);
      const y = G1 - 0.3 - Math.sin(t * 8 * PI) * 0.12;
      b.sphere(i % 5 === 3 ? "glass_dark" : "lamp", x, y, z, 0.05, {
        ws: 5,
        hs: 4,
        noAO: true,
      });
      if (i % 4 === 1) S.glow(x, y, z, 0xffd080, 0.45);
    }
    // ---- roof: low hip, lattice balustrade on the deck, chimneys ----
    const roof = new THREE.CylinderGeometry(0.62, 1, 1, 4, 1, false);
    b.geo(
      "shingle",
      roof,
      P.m4(
        (X0 + X1) / 2,
        G2 + 0.18 + 1.2,
        (Z0 + Z1) / 2,
        PI / 4,
        0,
        0,
        (X1 - X0 + 1) * 0.707,
        2.4,
        (Z1 - Z0 + 1) * 0.707,
      ),
      { grime: 0.5 },
    );
    const RY = G2 + 0.18 + 2.4,
      RX0 = (X0 + X1) / 2 - (X1 - X0 + 1) * 0.31,
      RX1 = (X0 + X1) / 2 + (X1 - X0 + 1) * 0.31,
      RZ0 = (Z0 + Z1) / 2 - (Z1 - Z0 + 1) * 0.31,
      RZ1 = (Z0 + Z1) / 2 + (Z1 - Z0 + 1) * 0.31;
    b.box("roof_tar", RX0, RY - 0.05, RZ0, RX1, RY, RZ1, { seg: false });
    for (const [ax, az, bx, bz] of [
      [RX0, RZ0, RX1, RZ0],
      [RX1, RZ0, RX1, RZ1],
      [RX1, RZ1, RX0, RZ1],
      [RX0, RZ1, RX0, RZ0],
    ])
      chippendale(S, ax, az, bx, bz, RY, 0.8, "paint_white", { col: false });
    for (const [cx, cz] of [
      [X0 + 3, Z0 + 4],
      [X1 - 3, Z0 + 4],
      [X0 + 3, Z1 - 4],
      [X1 - 3, Z1 - 4],
    ])
      A.chimney(b, "brick_red", cx, G2, cz, 1.1, 0.7, 5.0, 2);
    // Wagner wing (north), same language, one-and-a-half storeys
    const WX0 = 308,
      WX1 = 318,
      WZ0 = -799.5,
      WZ1 = Z0;
    b.box("brick_red", WX0, 0, WZ0, WX1, FY, WZ1, { seg: false });
    b.box("clapboard", WX0, FY, WZ0, WX1, 6.2, WZ1, { segLen: 2 });
    S.col(WX0, 0, WZ0, WX1, 6.2, WZ1, { walkable: false });
    const FWn = P.face(S, "n", WX0, WX1, WZ0);
    for (let u = 1.6; u < FWn.len - 1; u += 2.3)
      FWn.window(u, FY + 0.8, 1.1, 3.4, {
        arch: true,
        style: "lit",
        frame: "paint_white",
        sill: "paint_white",
        mull: true,
      });
    for (const F of [
      P.face(S, "e", WZ0, WZ1, WX1),
      P.face(S, "w", WZ0, WZ1, WX0),
    ]) {
      F.window(F.len / 2, FY + 0.8, 1.1, 3.4, {
        arch: true,
        style: "lit",
        frame: "paint_white",
        sill: "paint_white",
      });
      F.box("paint_white", -0.4, F.len + 0.4, 6.2, 6.4, 0, 0.5, { seg: false });
    }
    FWn.box("paint_white", -0.4, FWn.len + 0.4, 6.2, 6.4, 0, 0.5, {
      seg: false,
    });
    b.geo(
      "shingle",
      new THREE.CylinderGeometry(0.001, 1, 1, 4, 1).rotateY(PI / 4),
      P.m4(
        (WX0 + WX1) / 2,
        6.4 + 1.1,
        (WZ0 + WZ1) / 2,
        0,
        0,
        0,
        (WX1 - WX0 + 0.8) * 0.707,
        2.2,
        (WZ1 - WZ0 + 0.8) * 0.707,
      ),
    );
    // ---- the settlement ----
    // vegetable plots (spuds, gnarlberry shrubs) with stakes and a scarecrow
    for (let r = 0; r < 4; r++) {
      const z = -797 + r * 2.2;
      b.box("dirt", 295, 0.06, z - 0.6, 303, 0.22, z + 0.6, {
        seg: false,
        grime: 0.7,
      });
      for (let x = 295.5; x < 302.8; x += 0.7) {
        const rn = P.rng("crop" + r + x);
        b.geo(
          "foliage",
          new THREE.ConeGeometry(0.22, 0.45 + rn() * 0.3, 5).translate(
            0,
            0.22,
            0,
          ),
          P.m4(x, 0.2, z + (rn() - 0.5) * 0.3, rn() * 3),
          { noAO: true },
        );
        if (r === 3 && rn() < 0.4)
          b.sphere("paint_red", x + 0.1, 0.45, z, 0.07, { ws: 5, hs: 4 });
      }
    }
    b.rod("wood_rotten", [299, 0, -792], [299, 2.3, -792], 0.05, 4);
    b.rod("wood_rotten", [298.2, 1.8, -792], [299.8, 1.8, -792], 0.04, 4);
    b.sphere("canvas_tent", 299, 2.35, -792, 0.2);
    b.box("fabric", 298.7, 1.1, -792.15, 299.3, 1.9, -791.85, { seg: false });
    b.cyl("canvas_tent", 299, 2.5, -792, 0.05, 0.28, 0.2, 8);
    // water pump + purifier tank, wind turbine
    b.cyl("rust", 298, 0.06, -766.5, 1.1, 1.1, 2.2, 12);
    b.cyl("metal", 298, 2.26, -766.5, 1.15, 1.15, 0.12, 12);
    S.col(296.9, 0, -767.6, 299.1, 2.3, -765.4, { walkable: false });
    b.rod("iron", [299.2, 1.4, -766.5], [300.4, 1.4, -766.5], 0.06, 6);
    b.box("iron", 300.3, 0.06, -766.8, 300.7, 1.0, -766.2, { seg: false });
    b.rod("iron", [300.5, 1.0, -766.5], [300.5, 1.6, -766.8], 0.03, 4);
    D.sign(
      b,
      "gracie_water",
      ["CLEAN WATER", "1 CAP A CUP · CITIZENS FREE"],
      "wood",
      298,
      1.4,
      -765.36,
      1.6,
      0.5,
      0,
      { tw: 512, th: 160, bg: "#4a5a6a", fg: "#e8f0f0" },
    );
    const TX = 302,
      TZ = -763;
    b.rod("iron", [TX - 0.6, 0, TZ - 0.6], [TX, 9, TZ], 0.07, 4);
    b.rod("iron", [TX + 0.6, 0, TZ - 0.6], [TX, 9, TZ], 0.07, 4);
    b.rod("iron", [TX, 0, TZ + 0.7], [TX, 9, TZ], 0.07, 4);
    for (let k = 1; k < 5; k++) {
      const y = k * 1.8,
        f = 1 - y / 9;
      b.rod(
        "iron",
        [TX - 0.6 * f, y, TZ - 0.6 * f],
        [TX + 0.6 * f, y, TZ - 0.6 * f],
        0.03,
        3,
      );
    }
    b.box("metal", TX - 0.25, 8.8, TZ - 0.4, TX + 0.25, 9.3, TZ + 0.6, {
      seg: false,
    });
    const rotor = new THREE.Group();
    rotor.position.set(TX, 9.05, TZ - 0.5);
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 2.4, 0.04).translate(0, 1.2, 0),
      P.mat("metal"),
    );
    for (let k = 0; k < 3; k++) {
      const bl = blade.clone();
      bl.rotation.z = (k * TAU) / 3;
      rotor.add(bl);
    }
    S.root.add(rotor);
    P.animate(TX, TZ, 160, (t) => {
      rotor.rotation.z = t * 1.6;
    });
    S.col(TX - 0.7, 0, TZ - 0.7, TX + 0.7, 9, TZ + 0.7, { walkable: false });
    // market stall + cook fire under a canvas awning
    b.box("canvas_tent", 296, 2.6, -775, 300, 2.66, -771.5, {
      rx: 0.08,
      seg: false,
    });
    for (const [x, z] of [
      [296.1, -774.9],
      [299.9, -774.9],
      [296.1, -771.6],
      [299.9, -771.6],
    ])
      b.rod("wood_rotten", [x, 0, z], [x, 2.65, z], 0.05, 4);
    // the city flag (blue · white · orange) on a pole in front of the house
    const flag = P.texMat(
      "ues_nycflag",
      P.canvasTex("ues_nycflag", 256, 160, (ctx, w, h) => {
        const cs = ["#27407a", "#ece6d6", "#d8742a"];
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = cs[i];
          ctx.fillRect((i * w) / 3, 0, w / 3 + 1, h);
        }
        ctx.strokeStyle = "#27407a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 26, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = "#27407a";
        ctx.font = "bold 12px serif";
        ctx.textAlign = "center";
        ctx.fillText("1625", w / 2, h / 2 + 4);
        const r = P.rng("flg");
        for (let i = 0; i < 400; i++) {
          ctx.fillStyle = "rgba(40,30,20," + r() * 0.25 + ")";
          ctx.fillRect(r() * w, r() * h, 2, 2);
        }
        ctx.clearRect(w - 30, 0, 30, 20);
        ctx.clearRect(w - 18, h - 30, 18, 30);
      }),
      { rough: 0.9, double: true, transparent: true, alphaTest: 0.3 },
    );
    A.flagpole(S, 300.5, 0.06, -782, 9, flag, { w: 2.0, fh: 1.25, phase: 0.8 });
    // Peter Pan statue (small bronze boy on a rocky pedestal) by the river path
    b.rock("granite_dark", 325.5, 0.6, -764.5, 1.0, { flat: 0.9 });
    D.figure(b, "bronze", 325.5, 1.3, -764.5, -HP + 0.4, 0.62, "arm");
    S.col(324.6, 0, -765.4, 326.4, 1.5, -763.6, { walkable: false });
    D.label(
      b,
      "gracie_pan",
      [
        "PETER PAN",
        "Bronze, 1928",
        '"The boy who wouldn\'t grow up."',
        "Neither did the Mayor.",
      ],
      325.5,
      0.6,
      -763.45,
      0.8,
      0.3,
      0,
      "label",
    );
    // trees of the park
    for (const [x, z, h] of [
      [296, -762, 7],
      [322, -798, 8],
      [326, -786, 6.5],
      [304, -798, 7.5],
      [318.5, -764, 6],
    ])
      A.tree(S, x, 0.06, z, { h, r: 0.22 });
    A.magnolia(S, 312, 0.06, -765, { h: 4.2, bloom: 0.45 });
    A.hedge(S, X0 - 0.9, Z0, X0 - 0.3, DZ - 2.3, 0.06, 0.9);
    A.hedge(S, X0 - 0.9, DZ + 2.3, X0 - 0.3, Z1, 0.06, 0.9);
    // props / NPC anchors
    S.prop("market_stall", 298, 0.06, -773.2, HP, {});
    S.prop("campfire", 297.2, 0.06, -777.6, 0, {});
    S.prop("workbench", 303, 0.06, -761.5, 0, {});
    S.prop("bed", 322.5, FY, -790, -HP, { name: "Veranda Cot", owned: false });
    S.anchor("exterior_entrance", X0 - 4.4, 0, DZ, HP);
    S.anchor("front", X0 - 8, 0, DZ, -HP);
    S.anchor("guard1", 294.5, 0, -786.5, -HP);
    S.anchor("guard2", 294.5, 0, -777.5, -HP);
    S.anchor("farmer", 300, 0, -791, PI);
    S.anchor("vendor_ext", 298.5, 0, -773.2, -HP);
    S.anchor("porch", VX - 1.4, FY, DZ, -HP);
    S.build({ shadow: true, lod: 300 });
    return { S, doorX: X0, doorZ: DZ, FY };
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
