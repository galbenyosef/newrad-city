/* src/poi_ues/30_gracie.js */
/* =====================================================================
 * NEW RAD CITY — POI UPPER EAST SIDE · 30 Gracie Mansion
 *
 * EXTERIOR (site x 292..332, z -800..-760, in Carl Schurz Park on the
 *   East River): the 1799 Federal-style country house — pale yellow
 *   clapboard, white trim, dark green louvred shutters, six-over-six
 *   sashes, a fanlit front door under a small portico, the long veranda
 *   on slender columns wrapping the river side with its Chinese-
 *   Chippendale railing, a low hipped roof ringed by a lattice
 *   balustrade, four tall chimneys, and the later Wagner wing. Around
 *   it: the friendly settlement — scrap palisade + gate on the land
 *   side, sandbag post, vegetable plots, water pump & purifier, a wind
 *   turbine, market stall, string lights, the city flag, the river
 *   promenade (John Finley Walk) with benches and lamps, and the little
 *   bronze Peter Pan statue.
 * INTERIOR (cell 'gracie_mansion', origin 7800,0,0): Front Hall
 *   (diagonal black & white marble checkerboard, stair), the Mayor's
 *   Parlour & Study, the Dining Room with its scenic wallpaper (now the
 *   settlement canteen), the old sitting room turned general store,
 *   the Wagner Ballroom (town meeting hall — the polling place), and
 *   upstairs the Mayor's bedroom, the clinic and the settlers' dorm.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._ues) return;
  const P = G._ues,
    D = P.dress,
    A = P.arch;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  /** Chinese-Chippendale railing panel run along a line (X lattice between rails). */
  function chippendale(S, ax, az, bx, bz, y, h, key, o) {
    o = o || {};
    const b = S.b,
      L = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.round(L / 0.9));
    const ang = Math.atan2(bz - az, bx - ax);
    b.rod(key, [ax, y + h, az], [bx, y + h, bz], 0.04, 4, {
      square: true,
      r2: 0.06,
    });
    b.rod(key, [ax, y + 0.1, az], [bx, y + 0.1, bz], 0.035, 4, {
      square: true,
      r2: 0.05,
    });
    for (let i = 0; i < n; i++) {
      const t0 = i / n,
        t1 = (i + 1) / n;
      const p0 = [ax + (bx - ax) * t0, az + (bz - az) * t0],
        p1 = [ax + (bx - ax) * t1, az + (bz - az) * t1];
      b.rod(key, [p0[0], y + 0.1, p0[1]], [p1[0], y + h, p1[1]], 0.02, 3, {
        square: true,
      });
      b.rod(key, [p0[0], y + h, p0[1]], [p1[0], y + 0.1, p1[1]], 0.02, 3, {
        square: true,
      });
      b.rod(key, [p0[0], y + 0.1, p0[1]], [p0[0], y + h, p0[1]], 0.025, 3, {
        square: true,
      });
    }
    if (o.col !== false)
      S.colR((ax + bx) / 2, (az + bz) / 2, L, 0.12, y, y + h, -ang, {
        walkable: false,
      });
  }
  P.chippendale = chippendale;

  // ===================================================================
  // EXTERIOR
  // ===================================================================
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
  function buildInterior() {
    const O = P.I("gracie_mansion");
    const S = P.site("gracie_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x8a7a60,
      ambI: 0.42,
      interiorKey: "gracie_mansion",
    });
    const b = S.b;
    const H = 4.0,
      UY = 4.4,
      UH = 3.4,
      UT = UY + UH;
    const DOOR = (a, w) => [a - (w || 1.6) / 2, a + (w || 1.6) / 2, 0, 2.7];
    const w2X = (z, x0, x1, hN, hS, kN, kS, holes, y0) =>
      A.wall2X(S, z, x0, x1, y0 || 0, hN, hS, kN, kS, holes, {
        frame: "paint_white",
      });
    const w2Z = (x, z0, z1, hW, hE, kW, kE, holes, y0) =>
      A.wall2Z(S, x, z0, z1, y0 || 0, hW, hE, kW, kE, holes, {
        frame: "paint_white",
      });
    const trim = (x0, z0, x1, z1, y, h) => {
      const e = 0.21;
      for (const [yy, hh, d, k] of [
        [y, 0.18, 0.04, "paint_white"],
        [y + 0.85, 0.06, 0.04, "paint_white"],
        [y + h - 0.22, 0.22, 0.08, "paint_white"],
      ]) {
        b.box(k, x0 + e, yy, z0 + e, x1 - e, yy + hh, z0 + e + d, {
          seg: false,
          noAO: true,
        });
        b.box(k, x0 + e, yy, z1 - e - d, x1 - e, yy + hh, z1 - e, {
          seg: false,
          noAO: true,
        });
        b.box(k, x0 + e, yy, z0 + e, x0 + e + d, yy + hh, z1 - e, {
          seg: false,
          noAO: true,
        });
        b.box(k, x1 - e - d, yy, z0 + e, x1 - e, yy + hh, z1 - e, {
          seg: false,
          noAO: true,
        });
      }
    };
    // ---------------- floors & ceilings (ground) ----------------
    S.floor("checker", -3.5, 0, 3.5, 14, 0); // Front Hall (diagonal checker)
    S.floor("parquet", -12, 0, -3.5, 14, 0, { surface: "wood" });
    S.floor("parquet", 3.5, 0, 12, 14, 0, { surface: "wood" });
    S.floor("parquet", 12, -3, 28, 14, 0, { surface: "wood" }); // Wagner ballroom
    for (const [x0, z0, x1, z1] of [
      [-12, 0, -3.5, 14],
      [3.5, 0, 12, 14],
    ])
      S.ceil("plaster_cream", x0, z0, x1, z1, H, { col: true });
    S.ceil("plaster_cream", 12, -3, 28, 14, 5.4, { col: true });
    // ---------------- walls (ground) ----------------
    // perimeter walls, finished per room and per storey
    for (const [z, segs] of [
      [
        14,
        [
          [-12.2, -3.5, "wallpaper_green", "plaster"],
          [-3.5, 3.5, "plaster_cream", "plaster_cream"],
          [3.5, 12.2, "zuber", "wallpaper"],
        ],
      ],
      [
        0,
        [
          [-12.2, -3.5, "wood_oak", "wallpaper_rose"],
          [-3.5, 3.5, "plaster_cream", "plaster_cream"],
          [3.5, 12.2, "plaster", "wallpaper"],
        ],
      ],
    ]) {
      for (const [x0, x1, kLo, kHi] of segs) {
        const door = x0 < 0 && x1 > 0 ? [[-0.9, 0.9, 0, 2.8]] : [];
        S.wallX(kLo, z, x0, x1, 0, H, 0.4, door);
        S.wallX(kHi, z, x0, x1, H, UT, 0.4, []);
      }
    }
    S.wallZ("wood_oak", -12, 0, 7, 0, H, 0.4, []);
    S.wallZ("wallpaper_green", -12, 7, 14, 0, H, 0.4, []);
    S.wallZ("wallpaper_rose", -12, 0, 7, H, UT, 0.4, []);
    S.wallZ("plaster", -12, 7, 14, H, UT, 0.4, []);
    S.wallZ("wallpaper", 11.9, 0, 14, H, UT, 0.2, []);
    w2Z(-3.5, 0, 14, H, H, "wallpaper_green", "plaster_cream", [
      DOOR(3.5),
      DOOR(10.5),
    ]);
    w2Z(3.5, 0, 14, H, H, "plaster_cream", "zuber", [DOOR(3.5), DOOR(10.5)]);
    w2X(7, -12, -3.5, H, H, "wood_oak", "wallpaper_green", [DOOR(-7.7, 1.8)]); // Study | Parlour
    w2X(7, 3.5, 12, H, H, "plaster", "zuber", [DOOR(7.7, 1.8)]); // Store | Dining
    w2Z(12, 0, 7, H, 5.4, "plaster", "plaster_cream", []);
    w2Z(12, 7, 14, H, 5.4, "zuber", "plaster_cream", [DOOR(10.5, 2.2)]); // Dining ↔ Ballroom
    S.wallZ("plaster_cream", 12.1, -3, 0, 0, 5.4, 0.2, []);
    S.wallX("plaster_cream", -3, 11.8, 28.2, 0, 5.4, 0.4, []);
    S.wallX("plaster_cream", 14, 12, 28.2, 0, 5.4, 0.4, []);
    S.wallZ("plaster_cream", 28, -3, 14, 0, 5.4, 0.4, [
      [4, 6, 0.9, 3.4],
      [8, 10, 0.9, 3.4],
    ]);
    for (const z of [5, 9]) {
      b.box("window_lit", 28.18, 0.9, z - 1, 28.2, 3.4, z + 1, {
        seg: false,
        noAO: true,
        noBake: true,
      });
      b.box("paint_white", 28.1, 0.8, z - 1.1, 28.3, 0.9, z + 1.1, {
        seg: false,
      });
    }
    S.col(27.8, 0.9, 4, 28.2, 3.4, 6, { walkable: false });
    S.col(27.8, 0.9, 8, 28.2, 3.4, 10, { walkable: false });

    // ---------------- FRONT HALL + stair ----------------
    trim(-3.5, 0, 3.5, 14, 0, H);
    S.stairs("wood_oak", -2.5, 12.6, "n", 1.6, 0, UY, {
      run: 0.28,
      rail: "wood_dark",
      railSides: [1],
      nosing: "carpet_red",
    });
    const SL = Math.ceil(UY / 0.24) * 0.28; // 19 steps
    const sTop = 12.6 - SL;
    S.floor("parquet", -1.7, 0, 3.5, 14, UY, { t: 0.35, surface: "wood" });
    S.floor("parquet", -3.5, 0, -1.7, sTop, UY, { t: 0.35, surface: "wood" });
    S.floor("parquet", -3.5, 12.6, -1.7, 14, UY, { t: 0.35, surface: "wood" });
    A.balustrade(
      S,
      [
        [-1.7, sTop + 0.2],
        [-1.7, 12.6],
        [-3.4, 12.6],
      ],
      UY,
      { key: "paint_white", h: 0.95, posts: false, step: 0.18 },
    );
    b.box(
      "wood_dark",
      -1.7 - 0.05,
      UY + 0.9,
      sTop,
      -1.7 + 0.05,
      UY + 1.0,
      12.6,
      { seg: false },
    );
    D.chandelier(S, 0.8, H - 0.5, 7, 0.55, {
      tiers: 1,
      lr: 8,
      li: 0.8,
      chain: 0.4,
    });
    b.box("wood_dark", 2.6, 0, 9.5, 3.3, 0.85, 11.5, { seg: false });
    b.box("glass", 3.28, 1.2, 9.6, 3.3, 2.8, 11.4, { seg: false, noAO: true }); // hall table + mirror
    D.sign(
      b,
      "gracie_hall",
      ["OFFICE OF THE MAYOR →", "CANTEEN · STORE →", "TOWN HALL (BALLROOM) →"],
      "wood",
      3.28,
      2.3,
      4,
      1.5,
      0.7,
      -HP,
      { tw: 512, th: 240, bg: "#3a2c1c", fg: "#f0e0b0" },
    );
    D.master(b, -3.28, 2.2, 3.5, 1.1, 1.4, HP, 12);
    S.anchor("entrance", 0, 0, 12.4, 0);
    S.anchor("hall", 0.5, 0, 7, 0);

    // ---------------- MAYOR'S STUDY (x -12..-3.5, z 0..7) ----------------
    trim(-12, 0, -3.5, 7, 0, H);
    for (const x of [-10.6, -8.2])
      D.bookcase(b, x, 0, 0.35, 0, { w: 2.2, h: 2.5, shelves: 5 });
    D.fireplace(b, S, -11.8, 0, 3.5, HP, { key: "marble", lit: true });
    D.master(b, -11.78, 2.7, 3.5, 1.1, 0.9, HP, 8);
    b.box("wood_dark", -8.8, 0, 3.3, -6.6, 0.78, 4.5, { seg: false });
    S.col(-8.8, 0, 3.3, -6.6, 0.8, 4.5, { walkable: false }); // the mayor's desk
    D.chair(b, -7.7, 0, 2.6, 0, { seat: "leather", arms: true });
    for (const x of [-8.2, -7.2]) D.chair(b, x, 0, 5.6, PI, { seat: "velvet" });
    b.box("paper", -8.4, 0.78, 3.6, -7.9, 0.8, 4.0, { seg: false });
    b.cyl("gold", -7.1, 0.78, 3.7, 0.06, 0.08, 0.12, 6);
    // city seal on the wall + flags
    const seal = P.texMat(
      "ues_seal",
      P.canvasTex(
        "ues_seal",
        256,
        256,
        (ctx, w, h) => {
          ctx.fillStyle = "#e8dcb8";
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2 - 4, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#27407a";
          ctx.lineWidth = 10;
          ctx.stroke();
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2 - 26, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#27407a";
          ctx.font = "bold 20px serif";
          ctx.textAlign = "center";
          ctx.save();
          ctx.translate(w / 2, h / 2);
          for (let i = 0; i < 20; i++) {
            const a = -PI * 0.9 + (i * PI * 0.9) / 10;
            ctx.save();
            ctx.rotate(a + HP);
            ctx.fillText(
              "SIGILLUM CIVITATIS NOVI EBORACI"[i] || "",
              0,
              -w / 2 + 34,
            );
            ctx.restore();
          }
          ctx.restore();
          ctx.fillStyle = "#6a4a2a";
          for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.translate(w / 2, h / 2 + 10);
            ctx.rotate(i * HP + PI / 4);
            ctx.fillRect(-4, -46, 8, 46);
            ctx.restore();
          }
          ctx.fillStyle = "#27407a";
          ctx.font = "bold 24px serif";
          ctx.fillText("1625", w / 2, h - 44);
        },
        { clamp: true },
      ),
      { rough: 0.7 },
    );
    b.quad(seal, -5.5, 2.6, 0.22, 1.1, 1.1, { ry: 0 });
    for (const x of [-6.6, -4.4]) {
      b.cyl("gold", x, 0, 0.6, 0.02, 0.02, 2.4, 5);
      b.box("flag_red", x, 1.6, 0.55, x + 0.7, 2.3, 0.57, {
        seg: false,
        noAO: true,
        c: x < -5 ? 0x5a70c0 : 0xffffff,
      });
    }
    D.rug(b, -10.5, 1.5, -5, 6, 0.01, "carpet_red");
    S.anchor("mayor", -7.7, 0, 2.3, PI);
    S.anchor("study", -7.7, 0, 6, 0);
    // ---------------- PARLOUR (x -12..-3.5, z 7..14) ----------------
    trim(-12, 7, -3.5, 14, 0, H);
    D.sofa(b, -10.8, 0, 10.5, HP, { fabric: "fabric", w: 2.4 });
    D.sofa(b, -7.5, 0, 13.1, PI, { fabric: "velvet", w: 2.0 });
    D.table(b, -8.4, 0, 10.4, { r: 0.55, top: "wood_dark", leg: "wood_dark" });
    D.piano(b, -6, 0, 8.2, PI, {});
    D.master(b, -11.78, 2.3, 10.5, 1.6, 1.1, HP, 4);
    D.chandelier(S, -7.7, H - 0.5, 10.5, 0.6, {
      tiers: 1,
      lr: 8,
      li: 0.8,
      chain: 0.4,
    });
    S.prop("radio", -11.6, 0.85, 8, HP, { station: "rfm" });
    S.anchor("parlour", -8, 0, 11.5, 0);
    // ---------------- STORE (x 3.5..12, z 0..7) ----------------
    trim(3.5, 0, 12, 7, 0, H);
    b.box("wood", 5, 0, 3.8, 10.5, 1.05, 4.6, { segLen: 2 });
    b.box("wood_dark", 4.9, 1.05, 3.7, 10.6, 1.12, 4.7, { seg: false });
    S.col(5, 0, 3.8, 10.5, 1.1, 4.6, { walkable: false });
    for (let x = 4.5; x < 11.5; x += 2.2) {
      b.box("wood", x, 0, 0.3, x + 2, 2.6, 0.8, { seg: false });
      for (let sh = 0; sh < 4; sh++) {
        b.box(
          "wood_dark",
          x,
          0.4 + sh * 0.6,
          0.3,
          x + 2,
          0.44 + sh * 0.6,
          0.8,
          { seg: false },
        );
        for (let k = 0; k < 5; k++) {
          const rn = P.rng("shelf" + x + sh + k);
          if (rn() < 0.35) continue;
          b.box(
            ["crate", "paint_red", "rust", "paint_blue", "paper"][
              Math.floor(rn() * 5)
            ],
            x + 0.15 + k * 0.38,
            0.44 + sh * 0.6,
            0.4,
            x + 0.45 + k * 0.38,
            0.62 + sh * 0.6 + rn() * 0.1,
            0.7,
            { seg: false, noAO: true },
          );
        }
      }
    }
    D.sign(
      b,
      "gracie_store",
      ["VANE'S EMPORIUM", "Est. 1981 · No Credit · No Refunds · No Kidding"],
      "wood",
      7.75,
      3.2,
      0.24,
      3.6,
      0.7,
      0,
      { tw: 1024, th: 200, bg: "#2a4a3a", fg: "#f0e0b0" },
    );
    b.cyl("lamp", 7.75, H - 0.6, 3.5, 0.15, 0.3, 0.3, 8, { open: true });
    S.light(7.75, H - 0.8, 3.5, 0xffd8a0, 7, 0.9);
    S.glow(7.75, H - 0.7, 3.5, 0xffd8a0, 0.6);
    S.anchor("merchant", 7.75, 0, 2.9, 0);
    // ---------------- DINING ROOM → CANTEEN (x 3.5..12, z 7..14, scenic wallpaper) ----------------
    trim(3.5, 7, 12, 14, 0, H);
    D.bar(b, 5, 11, 0, 8.5, 7.25, { wood: "wood_dark", top: "marble_dark" });
    S.col(5, 0, 7.9, 11, 1.1, 8.5, { walkable: false });
    D.table(b, 6, 0, 11.6, { r: 0.6, top: "wood", leg: "iron" });
    D.table(b, 9.6, 0, 11.8, { r: 0.6, top: "wood", leg: "iron" });
    for (const [x, z, ry] of [
      [6, 10.7, 0],
      [6, 12.5, PI],
      [9.6, 10.9, 0],
      [9.6, 12.7, PI],
      [5.1, 11.6, HP],
    ])
      D.chair(b, x, 0, z, ry, { seat: "wood", wood: "wood_dark" });
    D.candles(S, 6, 0.75, 11.6, 3, { r: 4, i: 0.6 });
    D.candles(S, 9.6, 0.75, 11.8, 2, { r: 4, i: 0.6 });
    b.cyl("rust", 4.2, 0, 8.2, 0.35, 0.35, 0.9, 10);
    S.light(4.2, 1.2, 8.2, 0xff9a50, 5, 0.8);
    D.sign(
      b,
      "gracie_menu",
      [
        "TODAY:",
        "Burrow Rat Stew ... 8",
        "Spud Hash ... 5",
        "Purified Water ... 1",
        "Mayor's Punch ... ask",
      ],
      "label",
      11.78,
      2.0,
      11.3,
      1.2,
      0.95,
      -HP,
      { tw: 400, th: 316 },
    );
    S.anchor("bartender", 8, 0, 7.8, PI);
    S.anchor("canteen", 8, 0, 11.5, 0);
    // ---------------- WAGNER BALLROOM (x 12..28, z -3..14): town hall + polling place ----------------
    const e = 0.21;
    for (const [yy, hh] of [
      [0, 0.2],
      [5.4 - 0.3, 0.3],
    ]) {
      b.box("gold", 12 + e, yy, -3 + e, 28 - e, yy + hh, -3 + e + 0.08, {
        seg: false,
        noAO: true,
      });
      b.box("gold", 12 + e, yy, 14 - e - 0.08, 28 - e, yy + hh, 14 - e, {
        seg: false,
        noAO: true,
      });
    }
    D.chandelier(S, 17, 4.8, 5.5, 0.9, {
      tiers: 2,
      lr: 11,
      li: 0.9,
      chain: 0.5,
    });
    D.chandelier(S, 23, 4.8, 5.5, 0.9, {
      tiers: 2,
      lr: 11,
      li: 0.9,
      chain: 0.5,
      broken: true,
    });
    for (let x = 14; x < 27; x += 3.2)
      for (const z of [-2.78, 13.78])
        b.box("gold", x - 0.08, 0.3, z - 0.02, x + 0.08, 5.0, z + 0.02, {
          seg: false,
          noAO: true,
        });
    // podium on a low stage at the east end, rows of mismatched chairs
    b.box("wood_dark", 24, 0, -1.5, 27.6, 0.45, 12.5, { segLen: 2 });
    S.col(24, 0, -1.5, 27.6, 0.45, 12.5, { surface: "wood" });
    for (let i = 0; i < 2; i++) {
      b.box(
        "wood_dark",
        23.4 + i * 0.3,
        0,
        4,
        23.7 + i * 0.3,
        (i + 1) * 0.22,
        7,
        { seg: false },
      );
      S.col(23.4 + i * 0.3, 0, 4, 23.7 + i * 0.3, (i + 1) * 0.22, 7);
    }
    b.box("wood_oak", 25.2, 0.45, 5, 26.2, 1.6, 6, { seg: false });
    S.col(25.2, 0.45, 5, 26.2, 1.6, 6, { walkable: false });
    const podSeal = P.texMat("ues_seal", null);
    b.quad(podSeal, 25.18, 1.1, 5.5, 0.6, 0.6, { ry: -HP });
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 8; c++) {
        const rn = P.rng("bch" + r + c);
        if (rn() < 0.12) continue;
        D.chair(
          b,
          21.5 - r * 1.5,
          0,
          0.6 + c * 1.45,
          -HP + (rn() - 0.5) * 0.3,
          {
            seat: ["velvet", "fabric", "leather", "wood"][Math.floor(rn() * 4)],
            wood: rn() < 0.5 ? "wood_dark" : "metal",
            toppled: rn() < 0.05,
          },
        );
      }
    D.poster(b, "vote_1", 12.25, 2.3, 1, HP, 1.2);
    D.poster(b, "vote_2", 12.25, 2.3, 3.2, HP, 1.2);
    D.poster(b, "vote_3", 27.75, 2.6, 11.2, -HP, 1.2);
    D.poster(b, "mayor", 27.75, 2.6, 0.5, -HP, 1.2);
    // election board (chalk tallies)
    D.sign(
      b,
      "gracie_board",
      [
        "CITY OF NEW YORK — MUNICIPAL ELECTION",
        "Last held: Nov. 2, 1965",
        "Next: WHEN THE MACHINE COMES HOME",
        "Registered citizens: 112 (and 1 dog)",
      ],
      "label",
      20,
      2.4,
      -2.77,
      4.2,
      1.4,
      0,
      { tw: 900, th: 300, bg: "#28302a" },
    );
    S.anchor("ballot", 25.6, 0.45, 9.5, -HP);
    S.anchor("podium", 25.7, 0.45, 5.5, -HP);
    S.anchor("challenger", 22.5, 0, 11.8, -HP + 0.4);
    S.anchor("clerk", 14, 0, 11.5, HP);
    S.anchor("ballroom", 18, 0, 5.5, -HP);
    b.box("wood", 13, 0, 10.5, 14.8, 0.8, 12.6, { seg: false });
    S.col(13, 0, 10.5, 14.8, 0.8, 12.6, { walkable: false }); // registration table
    b.box("paper", 13.3, 0.8, 10.8, 14.4, 0.82, 11.6, {
      seg: false,
      noAO: true,
    });

    // ---------------- UPSTAIRS (UY 4.4): Mayor's bedroom, clinic, dorm ----------------
    S.ceil("plaster_cream", -12, 0, 12, 14, UT, { col: true });
    S.floor("parquet", -12, 0, -3.5, 14, UY, { t: 0.35, surface: "wood" });
    S.floor("parquet", 3.5, 0, 12, 14, UY, { t: 0.35, surface: "wood" });
    w2Z(
      -3.5,
      0,
      14,
      UH,
      UH,
      "wallpaper_rose",
      "plaster_cream",
      [DOOR(3.5), DOOR(10.5)],
      UY,
    );
    w2Z(3.5, 0, 14, UH, UH, "plaster_cream", "wallpaper", [DOOR(7, 2)], UY);
    w2X(7, -12, -3.5, UH, UH, "wallpaper_rose", "plaster", [], UY);
    trim(-3.5, 0, 3.5, 14, UY, UH);
    // Mayor's bedroom (north-west)
    D.bed(b, -9, UY, 3.2, HP, { w: 1.6, posts: true, canopy: "velvet" });
    D.master(b, -11.78, UY + 1.9, 5.5, 0.8, 1.0, HP, 11);
    b.box("wood_dark", -5.2, UY, 0.4, -4.0, UY + 1.8, 1.2, { seg: false });
    S.anchor("mayor_bed", -8, UY, 4.5, 0);
    // Clinic (south-west)
    for (const z of [8.4, 12.2])
      D.bed(b, -10.3, UY, z, HP, {
        w: 1.0,
        cover: "fabric_white",
        wood: "metal",
      });
    b.box("metal", -6, UY, 13, -4, UY + 0.9, 13.6, { seg: false });
    S.col(-6, UY, 13, -4, UY + 0.9, 13.6, { walkable: false });
    D.sign(
      b,
      "gracie_clinic",
      [
        "CLINIC",
        "Dr. B. Ogunleye · Stitches, Chems, Rad Scrub",
        "PAY WHAT YOU CAN (CAN MORE)",
      ],
      "wood",
      -7.7,
      UY + 2.5,
      7.25,
      2.6,
      0.6,
      0,
      { tw: 900, th: 208, bg: "#e8e0cc", fg: "#8a1e18" },
    );
    b.sphere("lamp", -7.5, UT - 0.3, 10.5, 0.12, { ws: 6, hs: 4 });
    S.light(-7.5, UT - 0.6, 10.5, 0xeaf0ff, 7, 0.9);
    S.glow(-7.5, UT - 0.3, 10.5, 0xe0e8ff, 0.5);
    S.anchor("doctor", -6.5, UY, 11, -HP);
    // Settlers' dorm (east)
    for (let i = 0; i < 4; i++)
      D.bed(
        b,
        5.2 + (i % 2) * 5.1,
        UY,
        2.5 + Math.floor(i / 2) * 7.2,
        i % 2 ? -HP : HP,
        {
          w: 1.0,
          cover: ["fabric", "velvet", "fabric_pink", "paint_blue"][i],
          wood: "wood_dark",
        },
      );
    for (const z of [5.2, 12.5])
      S.prop("footlocker", 11.4, UY, z, HP, {
        loot: "footlocker",
        owner: "settlers",
        name: "Settler's Footlocker",
      });
    b.sphere("lamp_dim", 7.75, UT - 0.3, 7, 0.1, { ws: 6, hs: 4 });
    S.light(7.75, UT - 0.6, 7, 0xffc880, 8, 0.7);
    S.anchor("dorm", 7.75, UY, 7, 0);
    S.anchor("upstairs", 0, UY, 4, 0);
    // generic settler spots
    S.anchor("npc1", 20, 0, 3, PI);
    S.anchor("npc2", -8.5, 0, 12.5, 0);
    S.anchor("npc3", 9.5, UY, 9.5, 0);
    return S;
  }

  function dressInterior(S) {
    const UY = 4.4;
    S.prop("terminal", -8.2, 0.78, 3.9, PI, {
      terminalId: "ues_gracie_mayor",
      mount: "bare",
    });
    S.prop("terminal", 13.9, 0.8, 11.9, -HP, {
      terminalId: "ues_gracie_rolls",
      mount: "bare",
    });
    S.prop("safe", -4.0, 1.1, 1.2, HP, {
      loot: "safe",
      locked: 0,
      lock: P.LOCKS.gracie_treasury,
      owner: "settlers",
      name: "City Treasury",
      items: [["scrip", 250]],
    });
    S.prop("file_cabinet", -11.5, 0, 6.3, -HP, {
      loot: "file_cabinet",
      owner: "settlers",
      name: "Municipal Records",
    });
    S.prop("first_aid", -11.8, UY + 1.3, 12.2, -HP, { owner: "settlers" });
    S.prop("fridge", 11.3, 0, 13.2, HP, {
      loot: "fridge",
      owner: "settlers",
      name: "Canteen Icebox",
    });
    S.prop("cash_register", 9.6, 1.12, 4.1, 0, { owner: "settlers" });
    S.pickup("ues_note_gracie_minutes", 1, -7.4, 0.8, 3.95);
    S.pickup("ues_reel_gracie_1967", 1, -9.9, 1.02, 10.3);
    S.pickup("purified_water", 2, 10.6, 1.12, 8.2);
  }

  P.addBuilder(
    "gracie_mansion",
    function () {
      const EX = buildExterior(),
        E = EX.S;
      const I = buildInterior();
      dressInterior(I);
      I.build({ interior: true });
      P.addInterior("gracie_mansion", I.root);
      const O = P.I("gracie_mansion");
      E.door(
        EX.doorX - 0.2,
        EX.FY + 1.3,
        EX.doorZ,
        "Gracie Mansion",
        { x: O.x, y: O.y, z: O.z + 12.4, yaw: 0 },
        {
          radius: 1.6,
          onEnter: () => P.safe("disc", () => G.discover("gracie_mansion")),
        },
      );
      I.door(
        0,
        1.4,
        13.75,
        "Carl Schurz Park",
        { x: EX.doorX - 4.4, y: 0, z: EX.doorZ + 1.5, yaw: HP },
        { verb: "Exit", radius: 1.4 },
      ); // just off the front steps, clear of the flagpole (300.5, -782)
      // back (river) door → the veranda
      I.door(
        0,
        1.4,
        0.25,
        "Veranda",
        { x: 320.9, y: EX.FY, z: EX.doorZ, yaw: -HP },
        { verb: "Exit", radius: 1.4 },
      );
      E.door(
        320.15,
        EX.FY + 1.3,
        EX.doorZ,
        "Gracie Mansion",
        { x: O.x, y: O.y, z: O.z + 1.6, yaw: PI },
        { radius: 1.4 },
      );
      P.register("gracie_mansion", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "gracie_mansion",
        anchors: Object.assign({}, E.anchors, I.anchors),
        noCombatBoss: true,
      });
    },
    30,
  );
})();
