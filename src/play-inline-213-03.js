// play-inline-213 03 — math
// Lines 127-792 of readable/play-inline-213.pretty.js (statement-aligned).
  function buildEllis(root) {
    const b = PH.batch("ellis_ext");
    b.ground = 0;
    b.aoH = 4;
    const anchors = {};
    const r = PH.rng("ellis");

    // ---------------- central pavilion ----------------
    // Rusticated limestone base, brick body, bands, cornice, parapet
    b.boxMM("limestone", X0 - 0.15, 0, Z0 - 0.15, X1 + 0.15, 1.3, Z1 + 0.15, {
      grime: 0.7,
    });
    for (let y = 0.33; y < 1.3; y += 0.33)
      band(b, X0, Z0, X1, Z1, y, 0.04, 0.2, "concrete_dark");
    b.boxMM("brick", X0, 1.3, Z0, X1, H, Z1, { grime: 0.55, segLen: 4 });
    band(b, X0, Z0, X1, Z1, 7.6, 0.7, 0.14);
    band(b, X0, Z0, X1, Z1, H - 0.2, 0.5, 0.3);
    band(b, X0, Z0, X1, Z1, H + 0.3, 0.35, 0.55); // projecting cornice
    band(b, X0, Z0, X1, Z1, H + 0.65, 1.1, 0.05); // parapet
    band(b, X0, Z0, X1, Z1, H + 1.75, 0.2, 0.15); // coping
    PH.colMM(X0, 0, Z0, X1, H + 2, Z1, { walkable: false });
    // corner quoins of the pavilion (between the towers' faces the corners are hidden, so only mid-wall pilasters)
    for (const x of [-524, -516]) {
      for (let y = 8.3; y < H - 0.2; y += 0.75)
        b.box("limestone", x, y, Z0 - 0.1, 0.9, 0.62, 0.3, {
          seg: false,
          grime: 0.5,
        });
    }
    // hipped roof (slate-dark) with a collapsed bay & exposed rafters, skylight ridge
    hipRoof(
      b,
      "roof",
      X0 + 0.5,
      Z0 + 0.5,
      X1 - 0.5,
      Z1 - 0.5,
      H + 0.8,
      5.5,
      0.2,
    );
    for (let k = 0; k < 7; k++)
      b.beam(
        "rotten",
        PH.v3(-514 + k * 1.2, H + 1, Z1 - 1),
        PH.v3(-514 + k * 1.2, H + 4.6, Z1 - 7),
        0.18,
        0.24,
      );
    b.boxMM("shadow", -514.5, H + 0.9, Z1 - 8, -506, H + 1.0, Z1 - 1, {
      noAO: true,
    });
    // roof ridge lantern (skylight over the Registry Room)
    b.boxMM("copper", -528, H + 5.9, 1087.2, -512, H + 6.3, 1089.3, {
      seg: false,
    });
    for (let x = -527; x <= -513; x += 2)
      b.box("glass", x, H + 5.4, 1088.25, 1.6, 0.6, 2.2, {
        seg: false,
        grime: 0.3,
      });

    // ---------------- front (north) facade ----------------
    const ryN = Math.PI; // outward -z
    // three giant arched Registry Room windows
    for (const [lx, kind] of [
      [-528, "glass"],
      [-520, "broken"],
      [-512, "glass"],
    ]) {
      PH.window(b, lx, Z0 - 0.02, ryN, 0, 9.0, 5.4, 9.8, kind, {
        arch: true,
        ft: 0.45,
        mull: "iron",
        paneZ: 0.03,
      });
      // spandrel carving: cartouche + eagle above each arch
      b.box("limestone", lx, 18.8, Z0 - 0.2, 2.2, 1.0, 0.35, { seg: false });
      const wing = new THREE.Shape();
      wing.moveTo(0, 0);
      wing.quadraticCurveTo(0.8, 0.35, 1.5, 1.1);
      wing.quadraticCurveTo(0.9, 0.8, 0.1, 0.3);
      wing.closePath();
      for (const s of [-1, 1])
        b.extrude("limestone", wing, 0.18, {
          m: PH.m4(
            lx + s * 0.2,
            19.0,
            Z0 - 0.45,
            s > 0 ? Math.PI : 0,
            0,
            0,
            s,
            1,
            1,
          ),
        });
      b.sphere("limestone", lx, 19.9, Z0 - 0.35, 0.28, {});
    }
    // ground floor arcade: grand entrance + two arched windows each side
    for (const [lx, w, h, y0, kind] of [
      [-528.5, 2.6, 4.2, 1.6, "boarded"],
      [-524.2, 2.2, 4.2, 1.6, "glass"],
      [-515.8, 2.2, 4.2, 1.6, "broken"],
      [-511.5, 2.6, 4.2, 1.6, "glass"],
    ]) {
      PH.window(b, lx, Z0 - 0.02, ryN, 0, y0, w, h, kind, {
        arch: true,
        mull: "iron",
        paneZ: 0.03,
      });
    }
    // entrance: deep arched portal with double doors
    b.extrude("limestone", PH.archRing(4.2, 6.2, 0.6), 0.9, {
      m: PH.m4(DOOR.x, 0, Z0 - 0.75, Math.PI),
    });
    b.box("limestone", DOOR.x, 6.0, Z0 - 0.95, 0.9, 1.1, 0.5, { seg: false });
    b.geo(
      "shadow",
      new THREE.ShapeGeometry(PH.archShape(4.2, 6.2), 12),
      PH.m4(DOOR.x, 0, Z0 + 0.1, Math.PI),
    );
    for (const s of [-1, 1]) {
      b.box("wood_dark", DOOR.x + s * 1.02, 0, Z0 - 0.05, 1.9, 4.2, 0.12, {
        seg: false,
      });
      for (let k = 0; k < 3; k++)
        b.box(
          "bronze",
          DOOR.x + s * 1.02,
          0.6 + k * 1.3,
          Z0 - 0.13,
          1.4,
          0.9,
          0.04,
          { seg: false },
        );
    }
    b.box("glass", DOOR.x, 4.3, Z0 - 0.06, 4.0, 1.7, 0.05, { seg: false });
    // engraved name band over the entrance (period lettering)
    const nameK = PH.signMat(
      "ellis_name",
      ["UNITED STATES IMMIGRATION STATION"],
      "engraved",
      1024,
      96,
      { bg: "#b8ae98" },
    );
    b.quad(nameK, -520, 7.95, Z0 - 0.16, 14, 1.0, { ry: Math.PI });

    // ---------------- side & back facades (pavilion) ----------------
    // back (south): three arched windows, smaller
    for (const lx of [-526, -520, -514])
      PH.window(
        b,
        lx,
        Z1 + 0.02,
        0,
        0,
        9.5,
        4.0,
        8.2,
        r() < 0.4 ? "boarded" : "glass",
        { arch: true, mull: "iron", paneZ: 0.03 },
      );
    for (const lx of [-527, -523, -517, -513])
      PH.window(
        b,
        lx,
        Z1 + 0.02,
        0,
        0,
        2.0,
        1.8,
        3.4,
        r() < 0.5 ? "broken" : "glass",
        { arch: true, rise: 0.4, paneZ: 0.03 },
      );

    // ---------------- towers ----------------
    const TOP = 27.2;
    for (const [tx, tz] of TOWERS) {
      const x0 = tx - TS,
        x1 = tx + TS,
        z0 = tz - TS,
        z1 = tz + TS;
      b.boxMM("limestone", x0 - 0.15, 0, z0 - 0.15, x1 + 0.15, 1.3, z1 + 0.15, {
        grime: 0.7,
      });
      b.boxMM("brick", x0, 1.3, z0, x1, TOP, z1, { grime: 0.5, segLen: 4 });
      for (const [cx, cz, ax, az] of [
        [x0, z0, -1, -1],
        [x1, z0, 1, -1],
        [x0, z1, -1, 1],
        [x1, z1, 1, 1],
      ])
        quoins(b, cx + ax * 0.08, cz + az * 0.08, 1.3, TOP, -ax, -az);
      band(b, x0, z0, x1, z1, 7.6, 0.7, 0.16);
      band(b, x0, z0, x1, z1, 14.2, 0.45, 0.16);
      band(b, x0, z0, x1, z1, H - 0.2, 0.5, 0.3);
      band(b, x0, z0, x1, z1, TOP - 0.4, 0.6, 0.35);
      // belfry stage (limestone) with louvered arched openings
      b.boxMM(
        "limestone",
        x0 + 0.3,
        TOP + 0.2,
        z0 + 0.3,
        x1 - 0.3,
        TOP + 3.4,
        z1 - 0.3,
        { grime: 0.45 },
      );
      for (const [ry, fx, fz] of [
        [Math.PI, tx, z0 + 0.28],
        [0, tx, z1 - 0.28],
        [-Math.PI / 2, x0 + 0.28, tz],
        [Math.PI / 2, x1 - 0.28, tz],
      ]) {
        PH.window(b, fx, fz, ry, 0, TOP + 0.6, 1.8, 2.5, "dark", {
          arch: true,
          ft: 0.2,
          paneZ: 0.03,
        });
        for (let k = 0; k < 4; k++) {
          const [lx2, lz2] = PH.rot(fx, fz, ry, 0, -0.05);
          b.box("copper", lx2, TOP + 0.9 + k * 0.42, lz2, 1.7, 0.08, 0.12, {
            ry,
            rx: 0.5,
            seg: false,
          });
        }
        // tower windows: narrow arched, three levels
        const bfx = fx + Math.sin(ry) * 0.3,
          bfz = fz + Math.cos(ry) * 0.3; // main brick shaft face (the belfry is inset 0.3)
        for (const y0 of [2.2, 9.0, 15.2])
          PH.window(
            b,
            bfx,
            bfz,
            ry,
            0,
            y0,
            1.2,
            3.2,
            r() < 0.3 ? "boarded" : r() < 0.5 ? "broken" : "glass",
            { arch: true, ft: 0.18, paneZ: 0.03 },
          );
      }
      b.boxMM(
        "limestone",
        x0 + 0.1,
        TOP + 3.4,
        z0 + 0.1,
        x1 - 0.1,
        TOP + 3.8,
        z1 - 0.1,
        { seg: false },
      );
      // balustrade around the dome base
      for (let k = 0; k < 20; k++) {
        const t = k / 20,
          side = (k / 5) | 0,
          u = (t * 4 - side) * (2 * TS - 0.6) - (TS - 0.3);
        const [bx, bz] =
          side === 0
            ? [tx + u, z0 + 0.35]
            : side === 1
              ? [x1 - 0.35, tz + u]
              : side === 2
                ? [tx - u, z1 - 0.35]
                : [x0 + 0.35, tz - u];
        b.cyl("limestone", bx, TOP + 3.8, bz, 0.09, 0.13, 0.7, 6, { hSeg: 1 });
      }
      // copper dome with lantern (bulbous cupola), weathered verdigris
      const D0 = TOP + 3.8;
      b.lathe(
        "copper",
        [
          [3.0, 0],
          [3.25, 0.5],
          [3.3, 1.2],
          [3.1, 2.1],
          [2.55, 3.1],
          [1.7, 4.0],
          [0.95, 4.6],
          [0.7, 4.9],
          [0.7, 5.0],
        ],
        24,
        tx,
        D0,
        tz,
        { grime: 0.35 },
      );
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.rod(
          "copper",
          PH.v3(tx + Math.cos(a) * 3.28, D0 + 0.5, tz + Math.sin(a) * 3.28),
          PH.v3(tx + Math.cos(a) * 0.95, D0 + 4.6, tz + Math.sin(a) * 0.95),
          0.07,
          4,
        );
      }
      b.cyl("limestone", tx, D0 + 5.0, tz, 0.72, 0.72, 1.6, 8, { hSeg: 1 });
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * TAU + Math.PI / 4;
        b.box(
          "shadow",
          tx + Math.cos(a) * 0.66,
          D0 + 5.25,
          tz + Math.sin(a) * 0.66,
          0.3,
          1.0,
          0.08,
          { ry: -a + Math.PI / 2, seg: false, noAO: true },
        );
      }
      b.lathe(
        "copper",
        [
          [0.85, 0],
          [0.8, 0.2],
          [0.35, 0.8],
          [0.12, 1.2],
          [0.05, 2.6],
        ],
        12,
        tx,
        D0 + 6.6,
        tz,
        {},
      );
      b.sphere("bronze", tx, D0 + 7.9, tz, 0.14, {});
      PH.colMM(x0, 0, z0, x1, D0 + 5, z1, { walkable: false });
    }

    // ---------------- wings ----------------
    for (const [wx0, wz0, wx1, wz1] of WINGS) {
      b.boxMM(
        "limestone",
        wx0 - 0.15,
        0,
        wz0 - 0.15,
        wx1 + 0.15,
        1.3,
        wz1 + 0.15,
        { grime: 0.7 },
      );
      b.boxMM("brick", wx0, 1.3, wz0, wx1, WING_H, wz1, {
        grime: 0.55,
        segLen: 4,
      });
      band(b, wx0, wz0, wx1, wz1, 5.6, 0.5, 0.12);
      band(b, wx0, wz0, wx1, wz1, 10.4, 0.4, 0.12);
      band(b, wx0, wz0, wx1, wz1, WING_H - 0.1, 0.45, 0.35);
      const outer = wx0 < -540 ? wx0 : wx1;
      for (const cz of [wz0, wz1])
        quoins(
          b,
          outer + (outer === wx0 ? 0.08 : -0.08),
          cz + (cz === wz0 ? 0.08 : -0.08),
          1.3,
          WING_H,
          outer === wx0 ? 1 : -1,
          cz === wz0 ? 1 : -1,
        );
      hipRoof(b, "roof", wx0, wz0, wx1, wz1, WING_H + 0.35, 4.2, 0.5);
      PH.colMM(wx0, 0, wz0, wx1, WING_H + 1, wz1, { walkable: false });
      // windows: 3 storeys × 4 bays on the long faces, 3 on the ends
      for (const [face, ry, fx, fz, len, axis] of [
        ["n", Math.PI, (wx0 + wx1) / 2, wz0 - 0.02, wx1 - wx0, "x"],
        ["s", 0, (wx0 + wx1) / 2, wz1 + 0.02, wx1 - wx0, "x"],
        [
          "end",
          outer === wx0 ? -Math.PI / 2 : Math.PI / 2,
          outer + (outer === wx0 ? -0.02 : 0.02),
          (wz0 + wz1) / 2,
          wz1 - wz0,
          "z",
        ],
      ]) {
        const n = face === "end" ? 4 : 4;
        for (let i = 0; i < n; i++) {
          const lx = ((i + 0.5) / n) * len - len / 2;
          for (const [y0, h, arch] of [
            [2.0, 2.9, true],
            [6.6, 3.0, false],
            [11.2, 2.7, false],
          ]) {
            const roll = r();
            const kind =
              roll < 0.25
                ? "boarded"
                : roll < 0.55
                  ? "broken"
                  : roll < 0.62
                    ? "winlit"
                    : "glass";
            if (kind === "winlit") {
              PH.window(b, fx, fz, ry, lx, y0, 1.5, h, "dark", {
                arch,
                rise: 0.35,
                paneZ: 0.02,
              });
              const [qx, qz] = PH.rot(fx, fz, ry, lx, 0.035);
              b.quad("winlit", qx, y0 + h / 2 - 0.1, qz, 1.4, h - 0.3, { ry });
            } else
              PH.window(b, fx, fz, ry, lx, y0, 1.5, h, kind, {
                arch,
                rise: 0.35,
                paneZ: 0.03,
              });
          }
        }
      }
      // wing ruin: the east wing's roof partly collapsed, soot above windows
      if (wx0 > -520) {
        b.boxMM(
          "shadow",
          wx0 + 3,
          WING_H + 0.4,
          wz0 + 4,
          wx1 - 2,
          WING_H + 0.5,
          wz1 - 3,
          { noAO: true },
        );
        for (let k = 0; k < 6; k++)
          b.beam(
            "rotten",
            PH.v3(wx0 + 3 + k * 1.5, WING_H + 0.5, wz0 + 3),
            PH.v3(wx0 + 3.5 + k * 1.5, WING_H + 2.6 - (k % 2), (wz0 + wz1) / 2),
            0.16,
            0.22,
          );
        for (let k = 0; k < 8; k++)
          b.rock(
            "brick",
            wx0 + 2 + r() * 9,
            0.2,
            wz0 - 1.5 - r() * 2.5,
            0.4 + r() * 0.5,
            { rough: 0.3 },
          );
      }
    }

    // ---------------- ferry canopy (glass & iron) ----------------
    const CZ0 = Z0 - 9,
      CZ1 = Z0 - 0.4;
    for (const x of [-524.5, -515.5])
      for (let z = CZ0; z <= CZ1 - 1; z += 2.9) {
        b.cyl("iron", x, 0, z, 0.1, 0.13, 4.6, 8, { hSeg: 1 });
        b.cyl("iron", x, 0, z, 0.2, 0.2, 0.4, 8, { hSeg: 1 });
        PH.col(x, z, 0.3, 0.3, 0, 4.6, 0, { walkable: false });
      }
    for (let z = CZ0; z <= CZ1; z += 1.45)
      b.box("iron", -520, 4.6, z, 9.6, 0.12, 0.1, { seg: false });
    for (const x of [-524.5, -520, -515.5])
      b.boxMM("iron", x - 0.06, 4.6, CZ0, x + 0.06, 4.9, CZ1, { seg: false });
    for (let z = CZ0; z < CZ1 - 1; z += 1.45)
      for (const s of [-1, 1]) {
        if (r() < 0.35) continue; // missing panes
        b.box(
          "glass",
          -520 + s * 2.25,
          4.75 + (s > 0 ? 0 : 0),
          z + 0.72,
          4.4,
          0.04,
          1.35,
          { rz: s * 0.08, seg: false, grime: 0.6 },
        );
      }
    // hanging sign under the canopy (the settlement's name)
    const regK = PH.signMat(
      "ellis_registry",
      ["THE REGISTRY", "ALL ARRIVALS PROCESSED — NO PAPERS NEEDED"],
      "enamel",
      768,
      256,
      { bg: "#1c3a4a" },
    );
    b.quad(regK, -520, 3.45, CZ0 + 0.3, 4.8, 1.6, { ry: Math.PI });
    b.quad(regK, -520, 3.45, CZ0 + 0.32, 4.8, 1.6, { ry: 0 });
    for (const s of [-1, 1])
      b.rod(
        "iron",
        PH.v3(-520 + s * 2.2, 4.6, CZ0 + 0.31),
        PH.v3(-520 + s * 2.2, 4.25, CZ0 + 0.31),
        0.02,
        4,
      );

    // ---------------- forecourt: settlement dressing ----------------
    // scrap & sandbag gate line with a proper gate
    PH.scrapWall(b, -540, 1064, -524.2, 1064, 2.6);
    PH.scrapWall(b, -515.8, 1064, -500, 1064, 2.6);
    for (const x of [-524, -516]) {
      b.box("rust", x, 0, 1064, 0.45, 4.4, 0.45, { seg: false });
      PH.col(x, 1064, 0.5, 0.5, 0, 4.4, 0, { walkable: false });
    }
    b.box("rust", -520, 4.1, 1064, 8.6, 0.35, 0.3, { seg: false });
    const gateK = PH.signMat(
      "ellis_gate",
      ["WELCOME TO AMERICA", "(AGAIN)"],
      "raider",
      768,
      256,
      { bg: "#5a6a5e", fg: "#e8dcb0" },
    );
    b.quad(gateK, -520, 5.0, 1063.8, 6.6, 1.6, { ry: Math.PI });
    for (const [x0, x1] of [
      [-540, -534],
      [-506, -500],
    ])
      PH.sandbags(b, x0, 1062.8, x1, 1062.8, 3);
    // queue rails (the old immigrant queue pens), luggage, benches
    for (let k = 0; k < 4; k++)
      PH.railing(
        b,
        [
          [-531 + k * 2.2, 1068],
          [-531 + k * 2.2, 1076],
        ],
        0,
        1.0,
        "iron",
        { collide: false, postStep: 2 },
      );
    for (let i = 0; i < 16; i++) {
      const x = -512 + r() * 8,
        z = 1067 + r() * 8;
      const big = r() < 0.4;
      b.box(
        big ? "leather" : "fabric",
        x,
        0,
        z,
        big ? 0.9 : 0.6,
        big ? 0.55 : 0.4,
        big ? 0.55 : 0.35,
        {
          ry: r() * 3,
          seg: false,
          c: [0x8a6a4a, 0x5a6a7a, 0x9a8a6a, 0x6a4a3a][i % 4],
        },
      );
    }
    PH.col(-508, 1071, 8, 8, 0, 0.5, 0, {});
    // flag pole
    b.cyl("iron", -536, 0, 1068, 0.07, 0.11, 14, 6, { hSeg: 2 });
    b.sphere("bronze", -536, 14.05, 1068, 0.15, {});
    const flagK = PH.texMat("ellis_flag", flagTex(), { double: true });
    b.quad(flagK, -534.3, 12.6, 1068, 3.4, 1.9, { ry: 0.05 });
    PH.col(-536, 1068, 0.3, 0.3, 0, 14, 0, { walkable: false });
    // lamp posts (lit at night) by the gate
    for (const [x, z] of [
      [-526, 1062],
      [-514, 1062],
      [-526, 1074],
      [-514, 1074],
    ]) {
      b.cyl("iron", x, 0, z, 0.08, 0.12, 3.6, 6, { hSeg: 1 });
      b.sphere("lamp", x, 3.8, z, 0.24, { ws: 10, hs: 8, noAO: true });
      PH.col(x, z, 0.25, 0.25, 0, 3.6, 0, { walkable: false });
      PH.onReady.push(() =>
        PH.safe("glow", () => {
          if (!G.isStub("fx") && G.fx.glowSprite)
            G.fx.glowSprite(PH.v3(x, 3.8, z), 0xffcf8a, 1.4, {
              intensity: 1.2,
              dayFactor: 0.15,
            });
        }),
      );
    }
    // burning barrels
    for (const [x, z] of [
      [-523, 1060.5],
      [-517, 1060.5],
    ]) {
      b.cyl("rust", x, 0, z, 0.3, 0.3, 0.9, 10, { hSeg: 1 });
      PH.col(x, z, 0.6, 0.6, 0, 0.9, 0, { walkable: false });
      PH.onReady.push(() =>
        PH.safe("fire", () => {
          if (!G.isStub("fx") && G.fx.fire) G.fx.fire(PH.v3(x, 0.95, z), 0.6);
        }),
      );
    }
    // a plaque by the door
    b.box("bronze", -526.5, 1.2, Z0 - 0.1, 1.2, 0.8, 0.06, { seg: false });
    PH.readable(
      PH.v3(-526.5, 1.6, Z0 - 0.4),
      "Ellis Island Plaque",
      '"Through this station passed twelve million hopes, 1892–1954. After 1967 the burned and the homeless began arriving too — and they, it turned out, needed papers even less."',
    );

    anchors.entrance = PH.anchor(DOOR.x, 0, Z0 - 2.5, 0);
    anchors.gate = PH.anchor(-520, 0, 1062, 0);
    anchors.gate1 = PH.anchor(-522.8, 0, 1061.5, 0);
    anchors.gate2 = PH.anchor(-517.2, 0, 1061.5, 0);
    anchors.flag = PH.anchor(-536, 0, 1069, 0);
    anchors.canopy = PH.anchor(-520, 0, 1074, 0);

    // ---------------- ferry slip + the sunken ferryboat "Ellis Island" ----------------
    for (let k = 0; k < 9; k++)
      for (const x of [-540, -522])
        b.cyl("rotten", x, -5, 998 + k * 4.2, 0.28, 0.3, 6.2, 7, {
          hSeg: 2,
          ground: -1.2,
        });
    for (const x of [-540, -522])
      b.boxMM("rotten", x - 0.3, 0.5, 998, x + 0.3, 0.9, 1033, {
        seg: false,
        ground: -1.2,
      });
    buildFerry(b, PH.m4(-531, -2.4, 1012, 0.03, 0.04, -0.14));
    try {
      G.world.addRadSource({
        x: -531,
        y: 0,
        z: 1012,
        radius: 12,
        strength: 1.5,
      });
    } catch (e) {
      /* */
    }

    // ---------------- harbor skiff landing at the east boat ramp ----------------
    const L = G.LAYOUT;
    const rx = L.ELLIS.x + L.ELLIS.r - 1,
      rz = L.ELLIS.z + 8;
    buildSkiff(b, PH.m4(rx + 6.5, -1.05, rz + 4.2, Math.PI / 2 + 0.08));
    b.cyl("rotten", rx + 1.2, -2, rz + 3.6, 0.2, 0.22, 3.1, 6, { hSeg: 1 });
    b.rod(
      "rope",
      PH.v3(rx + 1.2, 0.9, rz + 3.6),
      PH.v3(rx + 4.5, -0.4, rz + 4.2),
      0.03,
      4,
    );
    // sign post
    b.box("rotten", rx - 2.5, 0, rz + 5.2, 0.14, 2.8, 0.14, { seg: false });
    const skK = PH.signMat(
      "ellis_skiff",
      ["HARBOR SKIFF", "◂ BATTERY PARK"],
      "enamel",
      512,
      192,
      { bg: "#1c3c52" },
    );
    b.quad(skK, rx - 2.5, 2.6, rz + 5.3, 1.9, 0.72, { ry: Math.PI / 2 });
    b.quad(skK, rx - 2.5, 2.6, rz + 5.1, 1.9, 0.72, { ry: -Math.PI / 2 });
    PH.col(rx - 2.5, rz + 5.2, 0.2, 0.2, 0, 2.8, 0, { walkable: false });
    anchors.skiff = PH.anchor(rx - 3, 0, rz, -Math.PI / 2);
    PH.ELLIS.skiffDoor = PH.v3(rx + 2.8, 0.6, rz + 3.8);
    PH.ELLIS.arrive = { x: rx - 3.5, y: 0.05, z: rz + 1, yaw: Math.PI / 2 };

    const g = b.build(root);
    g.name = "ellis_island";
    return anchors;
  }

  /** Double-ended ferryboat (1904), half sunk & listing. Local: length along Z. */
