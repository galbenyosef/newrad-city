// play-inline-265 03 — box
// Lines 41-669 of readable/play-inline-265.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("cooper_ext", { grime: 0.55 });
    const b = S.b;
    const X0 = 150,
      X1 = 172,
      Z0 = -866,
      Z1 = -836; // house footprint (front = west face at X0)
    const B0 = 1.3,
      GF = 6.2,
      F1 = 10.6,
      F2 = 14.6,
      COR = 15.6; // basement top, floor tops, cornice top
    // ---------------- grounds ----------------
    b.box("dirt", 130.1, 0, -869.9, 150, 0.05, -830.1, {
      segLen: 5,
      grime: 0.7,
    });
    b.box("grass", 132, 0.05, -868, 147.5, 0.1, -853.5, {
      segLen: 3,
      grime: 0.7,
    });
    b.box("grass", 132, 0.05, -848.5, 147.5, 0.1, -832, {
      segLen: 3,
      grime: 0.7,
    });
    b.box("granite", 130.1, 0.05, -853.3, X0, 0.1, -848.7, {
      segLen: 3,
      grime: 0.6,
    }); // path gate → canopy
    b.box("sidewalk", X0, 0, -869.9, 189.9, 0.05, -866, {
      segLen: 5,
      grime: 0.6,
    });
    b.box("brick_red", X0, 0, -836, 189.9, 0.12, -830.1, {
      segLen: 3,
      grime: 0.6,
    }); // south terrace (brick paved)
    b.box("concrete_dark", X1, 0, -866, 189.9, 0.06, -836, {
      segLen: 5,
      grime: 0.8,
    }); // service yard
    // Fifth Avenue railing on a brick dwarf wall with limestone piers
    b.box("brick_flemish", 130.4, 0, -869.6, 131.0, 0.7, -853.4, { segLen: 3 });
    b.box("brick_flemish", 130.4, 0, -848.6, 131.0, 0.7, -830.4, { segLen: 3 });
    b.box("ashlar", 130.3, 0.7, -869.7, 131.1, 0.8, -853.3, { seg: false });
    b.box("ashlar", 130.3, 0.7, -848.7, 131.1, 0.8, -830.3, { seg: false });
    S.col(130.4, 0, -869.6, 131.0, 0.8, -853.4, { walkable: false });
    S.col(130.4, 0, -848.6, 131.0, 0.8, -830.4, { walkable: false });
    A.fence(
      S,
      [
        [130.7, -869.4],
        [130.7, -853.5],
      ],
      0.8,
      { h: 1.6, bent: 0.06 },
    );
    A.fence(
      S,
      [
        [130.7, -848.5],
        [130.7, -830.6],
      ],
      0.8,
      { h: 1.6, gaps: 0.05 },
    );
    A.fence(
      S,
      [
        [130.9, -830.5],
        [X0, -830.5],
      ],
      0.1,
      { h: 2.0 },
    );
    for (const z of [-869.5, -853.2, -848.8, -830.5]) {
      b.box("ashlar", 130.2, 0, z - 0.4, 131.2, 2.8, z + 0.4, { seg: false });
      b.sphere("ashlar", 130.7, 3.05, z, 0.3, { ws: 10, hs: 8 });
      S.col(130.2, 0, z - 0.4, 131.2, 2.8, z + 0.4, { walkable: false });
    }
    D.sign(
      b,
      "coop_plaque",
      [
        "COOPER-HEWITT MUSEUM",
        "The Smithsonian Institution's",
        "National Museum of Design",
        "CARNEGIE MANSION · 1902",
      ],
      "brass",
      130.18,
      1.7,
      -854.6,
      0.95,
      0.62,
      -HP,
      { tw: 512, th: 336 },
    );
    // raider barricade across the gateway: car hoods, doors, pallets and a gate of chain-link
    for (let i = 0; i < 6; i++) {
      const rn = P.rng("coopbar" + i),
        z = -853 + i * 0.75;
      b.box(
        ["corrugated", "rust", "wood_rotten", "metal"][i % 4],
        132.2 + rn() * 0.3,
        0,
        z,
        132.35 + rn() * 0.3,
        1.6 + rn() * 1.1,
        z + 0.85,
        {
          rz: (rn() - 0.5) * 0.2,
          ry: (rn() - 0.5) * 0.3,
          seg: false,
          grime: 0.8,
        },
      );
    }
    S.col(132.1, 0, -853.2, 132.8, 2.4, -851.2, { walkable: false }); // leaves a gap at the south end
    b.box("rust", 132.3, 0, -851.1, 132.4, 2.2, -848.8, {
      rz: 0.35,
      seg: false,
    }); // swung-open scrap door
    for (const z of [-854.2, -847.6]) {
      // skull pikes
      b.rod("wood_rotten", [132.8, 0, z], [132.8, 2.6, z], 0.04, 4);
      b.sphere("bone", 132.8, 2.72, z, 0.13, { sy: 1.15 });
      b.box("paint_black", 132.72, 2.7, z + 0.05, 132.78, 2.76, z + 0.12, {
        seg: false,
        noAO: true,
      });
    }
    D.sign(
      b,
      "coop_raider1",
      ["NOW SHOWING:", "YOUR INSIDES"],
      "raider",
      132.1,
      2.0,
      -852.2,
      2.2,
      0.9,
      -HP,
      { tw: 512, th: 210 },
    );

    // garden: dead trees, the terrace pergola, overgrown beds
    A.tree(S, 137, 0.1, -862, { h: 8.5, r: 0.28 });
    A.tree(S, 143, 0.1, -842, { h: 7.5, r: 0.24 });
    A.magnolia(S, 137.5, 0.1, -838, { h: 4.6, bloom: 0.3 });
    A.hedge(S, 147.8, -865, 149.4, -854, 0.05, 0.9);
    A.hedge(S, 147.8, -847.8, 149.4, -838, 0.05, 0.9);
    // Arthur Ross terrace: brick piers + timber pergola, dead wisteria
    for (let x = X0 + 1; x <= X1 + 12; x += 4)
      for (const z of [-834.8, -831.4]) {
        b.box("brick_flemish", x - 0.3, 0.12, z - 0.3, x + 0.3, 2.9, z + 0.3, {
          seg: false,
        });
        S.col(x - 0.3, 0, z - 0.3, x + 0.3, 2.9, z + 0.3, { walkable: false });
      }
    for (let x = X0 + 1; x <= X1 + 12; x += 1.0)
      b.box("wood_rotten", x - 0.08, 2.9, -835.3, x + 0.08, 3.1, -830.9, {
        seg: false,
      });
    for (const z of [-834.8, -831.4])
      b.box("wood_rotten", X0 + 0.5, 2.9, z - 0.12, X1 + 12.5, 3.2, z + 0.12, {
        seg: false,
      });
    for (let i = 0; i < 22; i++) {
      const rn = P.rng("wist" + i),
        x = X0 + 1 + rn() * 32;
      b.rod(
        "wood_rotten",
        [x, 0.12, -834.8 + (rn() < 0.5 ? 0 : 3.4)],
        [x + (rn() - 0.5) * 2, 3.0, -833.1 + (rn() - 0.5) * 3],
        0.03,
        3,
        { noAO: true },
      );
    }
    // raider camp on the terrace: tents, fire, cages
    for (const [x, ry] of [
      [X0 + 6, 0.2],
      [X0 + 13, -0.3],
    ]) {
      b.geo(
        "canvas_tent",
        new THREE.ConeGeometry(1.6, 2.2, 4, 1, true).translate(0, 1.1, 0),
        P.m4(x, 0.12, -833, ry + PI / 4),
        { noAO: true, grime: 0.7 },
      );
    }
    // ---------------- the house ----------------
    b.box("rustic", X0, 0, Z0, X1, B0, Z1, { segLen: 3 }); // rusticated basement
    b.box("brick_flemish", X0, B0, Z0, X1, F2, Z1, { segLen: 3 });
    S.col(X0, 0, Z0, X1, COR, Z1, { walkable: false });
    const faces = {
      w: P.face(S, "w", Z0, Z1, X0),
      e: P.face(S, "e", Z0, Z1, X1),
      n: P.face(S, "n", X0, X1, Z0),
      s: P.face(S, "s", X0, X1, Z1),
    };
    for (const k in faces) {
      const F = faces[k];
      F.band("ashlar", B0 - 0.1, B0 + 0.35, 0, 0.25); // water table
      F.band("ashlar", GF - 0.15, GF + 0.3, 0, 0.18); // string courses
      F.band("ashlar", F2 - 0.1, F2 + 0.35, 0, 0.22);
      F.cornice("ashlar", F2 + 0.25, 0.95, { step: 0.7 });
      // limestone quoins at both corners
      for (let y = B0 + 0.2, i = 0; y < F2 - 0.3; y += 0.62, i++)
        for (const u of [0, F.len])
          F.box(
            "ashlar",
            u + (u ? -(i % 2 ? 0.9 : 0.6) : 0),
            u + (u ? 0 : i % 2 ? 0.9 : 0.6),
            y,
            y + 0.5,
            -0.02,
            0.06,
            { seg: false },
          );
      const n = Math.max(2, Math.round(F.len / 3.6)),
        main = k === "w";
      for (let i = 0; i < n; i++) {
        const u = 1.8 + (i * (F.len - 3.6)) / (n - 1);
        if (main && Math.abs(u - F.len / 2) < 2.2) continue; // entrance bay
        const rn = P.rng("coopwin" + k + i);
        const st = () =>
          rn() < 0.2 ? "broken" : rn() < 0.12 ? "boarded" : "dark";
        F.window(u, 0.35, 0.9, 0.7, {
          style: "boarded",
          frame: "iron",
          sill: false,
          mull: false,
        }); // basement grilles
        F.window(u, B0 + 0.9, 1.4, 3.4, {
          style: st(),
          frame: "paint_white",
          sill: "ashlar",
          hood: i % 2 && main ? "pediment" : "cornice",
          hoodKey: "ashlar",
          keystone: "ashlar",
        });
        F.window(u, GF + 0.8, 1.3, 2.9, {
          style: st(),
          frame: "paint_white",
          sill: "ashlar",
          hood: "flat",
          hoodKey: "ashlar",
        });
        F.window(u, F1 + 0.7, 1.2, 2.3, {
          style: st(),
          frame: "paint_white",
          sill: "ashlar",
        });
        // limestone surrounds (ears)
        F.box("ashlar", u - 0.95, u + 0.95, B0 + 0.75, B0 + 0.9, 0, 0.12, {
          seg: false,
        });
      }
    }
    // balustrade on the cornice + roof: slate hip, dormers, chimney stacks
    const RY = COR + 0.25;
    A.balustrade(
      S,
      [
        [X0 + 0.2, Z0 + 0.2],
        [X0 + 0.2, Z1 - 0.2],
        [X1 - 0.2, Z1 - 0.2],
        [X1 - 0.2, Z0 + 0.2],
        [X0 + 0.2, Z0 + 0.2],
      ],
      RY,
      { h: 0.85, col: false, broken: 0.07 },
    );
    const roof = new THREE.CylinderGeometry(0.6, 1, 1, 4, 1, false);
    b.geo(
      "slate",
      roof,
      P.m4(
        (X0 + X1) / 2,
        RY + 1.9,
        (Z0 + Z1) / 2,
        PI / 4,
        0,
        0,
        (X1 - X0 - 2.4) * 0.707,
        3.8,
        (Z1 - Z0 - 2.4) * 0.707,
      ),
      { grime: 0.5 },
    );
    b.box(
      "slate",
      X0 + 6.5,
      RY + 3.75,
      Z0 + 5.5,
      X1 - 6.5,
      RY + 3.85,
      Z1 - 5.5,
      { seg: false },
    );
    for (let i = 0; i < 5; i++) {
      // dormers on the Fifth Avenue slope
      const z = Z0 + 5 + i * 5,
        x = X0 + 2.6;
      b.box(
        "paint_white",
        x - 0.8,
        RY + 0.5,
        z - 0.8,
        x + 0.9,
        RY + 2.3,
        z + 0.8,
        { seg: false },
      );
      b.box(
        i === 2 ? "glass_broken" : "glass_dark",
        x - 0.82,
        RY + 0.8,
        z - 0.5,
        x - 0.8,
        RY + 2.0,
        z + 0.5,
        { seg: false, noAO: true },
      );
      const dr = new THREE.CylinderGeometry(0.001, 1, 1, 4, 1).rotateY(PI / 4);
      b.geo("copper", dr, P.m4(x, RY + 2.3, z, 0, 0, 0, 1.3, 0.8, 1.2));
    }
    for (const [cx, cz] of [
      [X0 + 5, Z0 + 1.4],
      [X1 - 5, Z0 + 1.4],
      [X0 + 5, Z1 - 1.4],
      [X1 - 5, Z1 - 1.4],
      [X1 - 1.4, (Z0 + Z1) / 2],
    ])
      A.chimney(b, "brick_flemish", cx, RY - 0.2, cz, 1.8, 1.0, 4.8, 3);
    // ---------------- the canopy (glass & copper marquise over the entrance) ----------------
    const DZ = (Z0 + Z1) / 2,
      CX1 = X0 - 5.2;
    const FW = faces.w;
    b.box("ashlar", X0 - 0.3, 0, DZ - 2.4, X0 + 0.05, GF + 0.4, DZ + 2.4, {
      seg: false,
    }); // stone frontispiece
    b.box(
      "ashlar",
      X0 - 0.6,
      GF + 0.4,
      DZ - 2.7,
      X0 + 0.05,
      GF + 0.9,
      DZ + 2.7,
      { seg: false },
    );
    for (const s of [-1, 1])
      A.column(
        b,
        "ashlar",
        X0 - 0.55,
        B0,
        DZ + s * 1.9,
        GF - B0 + 0.4,
        0.26,
        "doric",
        { col: false },
      );
    // steps up to the raised ground floor
    for (let i = 0; i < 5; i++) {
      const y = ((i + 1) * B0) / 5;
      b.box(
        "granite",
        X0 - 3.2 + i * 0.55,
        0,
        DZ - 1.8,
        X0 - 2.65 + i * 0.55 + 0.02,
        y,
        DZ + 1.8,
        { seg: false },
      );
      S.col(
        X0 - 3.2 + i * 0.55,
        0,
        DZ - 1.8,
        X0 - 2.65 + i * 0.55 + 0.02,
        y,
        DZ + 1.8,
      );
    }
    b.box("granite", X0 - 0.45, 0, DZ - 1.8, X0, B0, DZ + 1.8, { seg: false });
    S.col(X0 - 0.45, 0, DZ - 1.8, X0, B0, DZ + 1.8);
    // double doors, ironwork transom
    b.box(
      "paint_black",
      X0 - 0.06,
      B0,
      DZ - 1.2,
      X0 + 0.02,
      B0 + 3.5,
      DZ + 1.2,
      { seg: false },
    );
    for (const s of [-1, 1]) {
      b.box(
        "wood_dark",
        X0 - 0.1,
        B0,
        DZ + (s < 0 ? -1.1 : 0.03),
        X0 - 0.04,
        B0 + 3.0,
        DZ + (s < 0 ? -0.03 : 1.1),
        { seg: false },
      );
      b.box(
        "glass_dark",
        X0 - 0.11,
        B0 + 1.4,
        DZ + s * 0.55 - 0.3,
        X0 - 0.1,
        B0 + 2.7,
        DZ + s * 0.55 + 0.3,
        { seg: false, noAO: true },
      );
    }
    for (let k = 0; k < 7; k++)
      b.box(
        "verdigris",
        X0 - 0.12,
        B0 + 3.05,
        DZ - 1.1 + k * 0.36,
        X0 - 0.08,
        B0 + 3.45,
        DZ - 1.05 + k * 0.36,
        { seg: false, noAO: true },
      );
    // canopy frame: 4 slender posts, curved ribs, glass roof sloping to the street, cresting
    const CY = B0 + 3.9;
    for (const z of [DZ - 2.4, DZ + 2.4]) {
      b.cyl("verdigris", CX1 + 0.3, 0, z, 0.07, 0.1, CY, 8);
      S.col(CX1 + 0.22, 0, z - 0.08, CX1 + 0.38, CY, z + 0.08, {
        walkable: false,
      });
      b.cyl("verdigris", CX1 + 0.3, 0, z, 0.16, 0.2, 0.4, 8);
      b.lathe(
        "verdigris",
        [
          [0.001, 0],
          [0.12, 0],
          [0.16, 0.2],
          [0.05, 0.35],
          [0.001, 0.4],
        ],
        8,
        CX1 + 0.3,
        CY,
        z,
      );
    }
    for (let i = 0; i <= 6; i++) {
      const z = DZ - 2.5 + (i * 5) / 6;
      const pts = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        pts.push([
          X0 - 0.1 - t * (X0 - 0.1 - CX1),
          CY + 0.5 - t * 0.6 + Math.sin(t * PI) * 0.35,
          z,
        ]);
      }
      for (let k = 0; k < 8; k++)
        b.rod("verdigris", pts[k], pts[k + 1], 0.045, 4, { noAO: true });
      if (i % 3 === 0)
        for (let k = 1; k < 8; k += 2)
          b.rod("verdigris", pts[k], [pts[k][0], CY - 0.1, z], 0.02, 3, {
            noAO: true,
          });
    }
    for (let k = 0; k < 8; k++) {
      const t0 = k / 8,
        t1 = (k + 1) / 8;
      const x0 = X0 - 0.1 - t0 * (X0 - 0.1 - CX1),
        x1 = X0 - 0.1 - t1 * (X0 - 0.1 - CX1);
      const y0 = CY + 0.5 - t0 * 0.6 + Math.sin(t0 * PI) * 0.35 + 0.05,
        y1 = CY + 0.5 - t1 * 0.6 + Math.sin(t1 * PI) * 0.35 + 0.05;
      const L = Math.hypot(x1 - x0, y1 - y0),
        ang = Math.atan2(y1 - y0, x1 - x0);
      if (k !== 5)
        b.boxC(
          "glass_green",
          (x0 + x1) / 2,
          (y0 + y1) / 2 - 0.015,
          DZ,
          L,
          0.03,
          5.0,
          { rz: ang, seg: false, noAO: true },
        );
    }
    b.box(
      "verdigris",
      CX1 - 0.05,
      CY - 0.2,
      DZ - 2.55,
      CX1 + 0.1,
      CY + 0.35,
      DZ + 2.55,
      { seg: false },
    ); // fascia
    for (let k = 0; k < 13; k++) {
      const z = DZ - 2.4 + k * 0.4;
      b.lathe(
        "verdigris",
        [
          [0.001, 0],
          [0.04, 0],
          [0.02, 0.2],
          [0.06, 0.28],
          [0.001, 0.4],
        ],
        5,
        CX1 + 0.02,
        CY + 0.35,
        z,
        { noAO: true },
      );
    }
    // raider lookout nest on the canopy (sandbags + corrugated shield)
    for (let k = 0; k < 4; k++)
      b.box(
        "canvas_tent",
        CX1 + 0.4 + (k % 2) * 0.1,
        CY + 0.6 + Math.floor(k / 2) * 0.25,
        DZ - 1.6 + k * 0.4,
        CX1 + 1.2,
        CY + 0.85 + Math.floor(k / 2) * 0.25,
        DZ - 1.1 + k * 0.4,
        { seg: false, grime: 0.8 },
      );
    b.box(
      "corrugated",
      CX1 + 0.2,
      CY + 0.5,
      DZ + 0.4,
      CX1 + 0.3,
      CY + 1.9,
      DZ + 2.2,
      { rz: 0.1, seg: false },
    );
    // museum banners from the facade (two, one torn) + raider tag
    for (const [z, torn] of [
      [DZ - 7.3, false],
      [DZ + 7.3, true],
    ]) {
      const bk = P.texMat(
        "ues_coop_banner",
        P.signTex(
          "coop_banner",
          ["COOPER", "HEWITT", "STREAMLINE!", "The Shape of Tomorrow"],
          "banner",
          256,
          768,
          { bg: "#1c2c4c", fg: "#f0d060", top: 0.08 },
        ),
        { rough: 0.95, double: true },
      );
      b.quad(bk, X0 - 0.45, GF + 2.2, z, 1.3, torn ? 3.0 : 3.9, {
        ry: -HP,
        uvRect: torn ? [0, 0.23, 1, 1] : undefined,
      });
      b.rod("iron", [X0, GF + 4.25, z], [X0 - 0.6, GF + 4.25, z], 0.03, 4);
    }
    D.sign(
      b,
      "coop_decorator",
      ["THE DECORATOR", "IS IN"],
      "raider",
      X0 - 0.33,
      5.7,
      DZ,
      3.0,
      1.1,
      -HP,
      { fg: "#e03a2a", tw: 512, th: 188 },
    );
    // lamp standards either side of the path (one lit by the raiders, a lantern hung on it)
    A.lampPost(S, X0 - 7, 0.1, DZ - 3.0, {
      h: 3.6,
      lit: true,
      color: 0xffb070,
      i: 0.9,
    });
    A.lampPost(S, X0 - 7, 0.1, DZ + 3.0, { h: 3.6, broken: true });
    // back: service yard, cellar hatch, coal chute
    b.box("rust", X1, 0, -852.2, X1 + 1.8, 0.7, -849.8, {
      rz: -0.35,
      seg: false,
    }); // slanted cellar doors
    b.box("ashlar", X1, 0, -852.4, X1 + 2.0, 0.25, -849.6, { seg: false });
    S.col(X1, 0, -852.4, X1 + 2.0, 0.5, -849.6);
    D.sign(
      b,
      "coop_coal",
      ["COAL"],
      "engraved",
      X1 + 0.02,
      1.2,
      -845,
      0.8,
      0.3,
      HP,
      { tw: 256, th: 96 },
    );
    D.rubble(S, X1 + 6, 0.06, -858, 2.2, { rebar: true, col: true });
    // props outside (spawned at initDone)
    S.prop("barrel", 134, 0.05, -855, 0, { burning: true });
    S.prop("barrel", X0 - 6, 0.12, -833.5, 0, { burning: true });
    S.prop("sandbags", 133.6, 0.05, -845.5, HP, { count: 3 });
    S.prop("skeleton", 140, 0.1, -851, 1.2, { pose: "lying" });
    S.prop("mattress", X0 + 10, 0.12, -833.2, 0.2, {});
    S.prop("car", 120.5, 0.05, -842, 0.05, { kind: "sedan", burnt: true });
    S.anchor("exterior_entrance", X0 - 3.6, 0, DZ, HP);
    S.anchor("front", X0 - 12, 0, DZ, -HP);
    S.anchor("cellar_exit", X1 + 3.2, 0, -851, -HP);
    S.build({ shadow: true, lod: 300 });
    return { S, doorX: X0, doorZ: DZ, B0, cellar: { x: X1 + 0.9, z: -851 } };
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
