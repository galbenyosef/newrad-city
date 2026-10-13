/* src/poi_harbor/10_ellis_ext.js */
/* =====================================================================
 * POI_HARBOR — Ellis Island Immigration Station (exterior) + harbor skiff
 * French Renaissance main building (1900): Flemish-bond red brick with
 * limestone quoins, bands and arches; four copper-domed towers framing the
 * central pavilion with its three giant arched Registry Room windows; long
 * lower wings; the glass-and-iron ferry canopy; the sunken ferryboat
 * "Ellis Island" in the slip.  Now: THE REGISTRY, a survivor settlement.
 * The map module still builds a small placeholder station here — our
 * pavilion & towers are laid out to fully enclose it (see NOTES.md).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._pharbor) return;
  const PH = G._pharbor;
  const TAU = Math.PI * 2;

  // Footprint (world)
  const X0 = -539,
    X1 = -501,
    Z0 = 1079,
    Z1 = 1097.5; // central pavilion
  const H = 20; // pavilion eaves
  const TOWERS = [
    [-535.5, 1082],
    [-504.5, 1082],
    [-535.5, 1094],
    [-504.5, 1094],
  ];
  const TS = 3.5; // tower half size
  const WING_H = 15;
  const WINGS = [
    [-552, 1081, -539, 1096],
    [-501, 1081, -488, 1096],
  ];
  const DOOR = { x: -520, z: Z0 };
  PH.ELLIS = { DOOR, X0, X1, Z0, Z1 };

  /** Quoins (alternating long/short limestone blocks) up a vertical corner edge. */
  function quoins(b, x, z, y0, y1, ax, az) {
    // (ax,az): the two outward axes of the corner (signs)
    let k = 0;
    for (let y = y0; y < y1 - 0.3; y += 0.75, k++) {
      const long = k % 2 === 0;
      const lx = long ? 1.1 : 0.6,
        lz = long ? 0.6 : 1.1;
      b.box(
        "limestone",
        x - ax * (lx / 2 - 0.06),
        y,
        z - az * (lz / 2 - 0.06),
        lx,
        0.62,
        lz,
        { seg: false, grime: 0.55 },
      );
    }
  }
  /** Horizontal limestone band around a rectangle. */
  function band(b, x0, z0, x1, z1, y, h, out, key) {
    const o = out || 0.12;
    b.boxMM(key || "limestone", x0 - o, y, z0 - o, x1 + o, y + h, z0 + 0.3, {
      seg: false,
      grime: 0.5,
    });
    b.boxMM(key || "limestone", x0 - o, y, z1 - 0.3, x1 + o, y + h, z1 + o, {
      seg: false,
      grime: 0.5,
    });
    b.boxMM(key || "limestone", x0 - o, y, z0, x0 + 0.3, y + h, z1, {
      seg: false,
      grime: 0.5,
    });
    b.boxMM(key || "limestone", x1 - 0.3, y, z0, x1 + o, y + h, z1, {
      seg: false,
      grime: 0.5,
    });
  }
  /** Hipped roof over a rectangle (eave y, ridge rise). */
  function hipRoof(b, key, x0, z0, x1, z1, y, rise, over) {
    over = over || 0.6;
    const ax0 = x0 - over,
      ax1 = x1 + over,
      az0 = z0 - over,
      az1 = z1 + over;
    const w = ax1 - ax0,
      d = az1 - az0;
    const inset = Math.min(w, d) / 2;
    const rx0 = ax0 + inset,
      rx1 = ax1 - inset,
      rz0 = az0 + inset,
      rz1 = az1 - inset;
    const P = (x, yy, z) => new THREE.Vector3(x, yy, z);
    const top = y + rise;
    const tri = (a, bb, c) => {
      const g = new THREE.BufferGeometry().setFromPoints([a, bb, c]);
      g.computeVertexNormals();
      b.add(key, g, { grime: 0.6 });
    };
    const quad = (a, bb, c, d2) => {
      tri(a, bb, c);
      tri(a, c, d2);
    };
    const ridgeA =
      w >= d ? P(rx0, top, (az0 + az1) / 2) : P((ax0 + ax1) / 2, top, rz0);
    const ridgeB =
      w >= d ? P(rx1, top, (az0 + az1) / 2) : P((ax0 + ax1) / 2, top, rz1);
    const c00 = P(ax0, y, az0),
      c10 = P(ax1, y, az0),
      c11 = P(ax1, y, az1),
      c01 = P(ax0, y, az1);
    if (w >= d) {
      quad(c00, ridgeA, ridgeB, c10); // north (faces -z) — winding for outward normal
      quad(c11, ridgeB, ridgeA, c01); // south
      tri(c01, ridgeA, c00); // west
      tri(c10, ridgeB, c11); // east
    } else {
      quad(c01, ridgeB, ridgeA, c00);
      quad(c10, ridgeA, ridgeB, c11);
      tri(c00, ridgeA, c10);
      tri(c11, ridgeB, c01);
    }
  }

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
  function buildFerry(b, M) {
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.8,
            ground: -1.2,
          },
          o || {},
        ),
      );
    const hull = new THREE.CapsuleGeometry(4.2, 26, 4, 12);
    hull.rotateX(Math.PI / 2);
    hull.scale(1.25, 0.55, 1);
    add("rust", hull, PH.m4(0, 1.2, 0), { c: 0x8a7a70 });
    add("paint_black", new THREE.BoxGeometry(10.8, 0.6, 30), PH.m4(0, 2.6, 0));
    add("paint_white", new THREE.BoxGeometry(8.6, 2.6, 22), PH.m4(0, 4.2, 0), {
      c: 0xc8c0b0,
    });
    for (let k = 0; k < 10; k++)
      for (const s of [-1, 1])
        add(
          "shadow",
          new THREE.PlaneGeometry(1.1, 1.0),
          PH.m4(s * 4.31, 4.4, -9.5 + k * 2.1, (s * Math.PI) / 2),
        );
    add("paint_cream", new THREE.BoxGeometry(9.4, 0.25, 23), PH.m4(0, 5.6, 0));
    for (const zz of [-8, 8]) {
      add(
        "paint_cream",
        new THREE.BoxGeometry(3.4, 2.0, 2.6),
        PH.m4(0, 6.8, zz),
        { c: 0xc8c0b0 },
      );
      add("glass", new THREE.BoxGeometry(3.5, 0.7, 2.7), PH.m4(0, 7.3, zz));
      add("rust", new THREE.BoxGeometry(3.8, 0.2, 3.0), PH.m4(0, 7.9, zz));
    }
    add(
      "paint_black",
      new THREE.CylinderGeometry(0.9, 1.0, 4.0, 12),
      PH.m4(0, 7.4, 0),
      { c: 0x6a4a3a },
    );
    const nameK = PH.signMat(
      "ferry_name",
      ["ELLIS ISLAND"],
      "engraved",
      512,
      96,
      { bg: "#2a2a28", fg: "#c8c0a0" },
    );
    for (const s of [-1, 1])
      add(
        nameK,
        new THREE.PlaneGeometry(5, 0.8),
        PH.m4(s * 5.3, 2.55, 0, (s * Math.PI) / 2),
        { uv: "keep", grime: 0.1, noAO: true },
      );
  }

  /** Small outboard skiff (wooden) at local origin, length along Z. */
  function buildSkiff(b, M) {
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.6,
            ground: -1.2,
          },
          o || {},
        ),
      );
    const hull = new THREE.CylinderGeometry(
      1.1,
      0.7,
      5.6,
      10,
      1,
      true,
      0,
      Math.PI,
    );
    hull.rotateZ(Math.PI);
    hull.rotateX(Math.PI / 2);
    hull.scale(1, 0.7, 1);
    add("wood", hull, PH.m4(0, 0.75, 0), { c: 0x7a6a58 });
    add(
      "paint_teal",
      new THREE.BoxGeometry(2.2, 0.14, 5.4),
      PH.m4(0, 0.78, 0),
      {},
    );
    add("wood", new THREE.BoxGeometry(1.8, 0.1, 0.4), PH.m4(0, 0.55, 0.6));
    add("wood", new THREE.BoxGeometry(1.8, 0.1, 0.4), PH.m4(0, 0.55, -1.2));
    add(
      "paint_black",
      new THREE.BoxGeometry(0.4, 0.55, 0.45),
      PH.m4(0, 1.0, -2.8),
    );
    add(
      "rust",
      new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6),
      PH.m4(0, 0.4, -2.95),
    );
    add("rust", new THREE.BoxGeometry(0.5, 0.35, 0.5), PH.m4(0, 0.45, 2.2));
  }
  PH.buildSkiff = buildSkiff;

  function flagTex() {
    return PH.canvasTex("ph_flag", 512, 288, (ctx, w, h) => {
      const sh = h / 13;
      for (let i = 0; i < 13; i++) {
        ctx.fillStyle = i % 2 ? "#d8d0bc" : "#8a2a24";
        ctx.fillRect(0, i * sh, w, sh + 1);
      }
      const cw = w * 0.42,
        ch = sh * 7;
      ctx.fillStyle = "#26345a";
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = "#e0d8c4";
      for (let i = 0; i < 13; i++) {
        const a = (i / 13) * TAU - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(
          cw / 2 + Math.cos(a) * ch * 0.34,
          ch / 2 + Math.sin(a) * ch * 0.34,
          ch * 0.05,
          0,
          TAU,
        );
        ctx.fill();
      }
      const r = PH.rng("flag");
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = "rgba(40,30,20," + (0.05 + r() * 0.2) + ")";
        ctx.beginPath();
        ctx.ellipse(
          r() * w,
          r() * h,
          10 + r() * 50,
          6 + r() * 30,
          r() * 3,
          0,
          TAU,
        );
        ctx.fill();
      }
      ctx.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.arc(w - r() * 60, r() * h, 6 + r() * 20, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    });
  }

  // -------------------------------------------------------------------
  // Battery Park side: skiff pier with a boarding stile over the promenade railing
  // -------------------------------------------------------------------
  function buildBatteryPier(root) {
    const L = G.LAYOUT;
    const b = PH.batch("battery_skiff_pier");
    // shoreline point on the SW edge of the Battery (between Castle Clinton and the old Pier A)
    let sx = -160,
      sz = 950;
    for (let t = 0; t < 60; t++) {
      const z = 930 + t * 0.5;
      if (!L.isManhattan(sx, z)) {
        sz = z - 0.2;
        break;
      }
    }
    const nx = -Math.SQRT1_2,
      nz = Math.SQRT1_2; // outward (water) direction
    const ry = Math.atan2(nx, nz); // local +Z = outward
    const P = (lx, lz) => PH.rot(sx, sz, ry, lx, lz);
    const DECK = 0.45,
      LEN = 22,
      W = 3.2;
    // deck (planks) on pilings, from 3 m inland (over the promenade stile) out to LEN
    {
      const [cx, cz] = P(0, 1 + LEN / 2);
      b.box("wood", cx, DECK - 0.3, cz, W, 0.3, LEN, {
        ry,
        grime: 0.6,
        ground: -1.2,
      });
      PH.col(cx, cz, W, LEN, -3, DECK, ry, { surface: "wood" });
      for (let lz = 2; lz <= LEN + 1; lz += 3)
        for (const s of [-1, 1]) {
          const [px, pz] = P(s * (W / 2 - 0.15), lz);
          b.cyl("rotten", px, -5, pz, 0.2, 0.22, 5.8, 6, {
            hSeg: 2,
            ground: -1.2,
          });
        }
      // rope rails
      for (const s of [-1, 1]) {
        const pts = [];
        for (let lz = 2; lz <= LEN + 1; lz += 4) {
          const [px, pz] = P(s * (W / 2 - 0.1), lz);
          pts.push([px, pz]);
        }
        PH.railing(b, pts, DECK, 1.0, "rotten", { postStep: 4, r: 0.05 });
      }
    }
    // stile: steps up from the promenade (land side), a small platform over the iron railing, steps down to the deck
    {
      const [ax, az] = P(0, -3.4);
      PH.stairs(b, "wood", ax, az, ry, 1.8, 1.6, 0.05, 1.3, {
        maxRise: 0.3,
        rails: "rotten",
      });
      const [px, pz] = P(0, -1.8 + 1.1);
      b.box("wood", px, 0, pz, 1.8, 1.3, 2.2, { ry, grime: 0.5 });
      PH.col(px, pz, 1.8, 2.2, 0, 1.3, ry, { surface: "wood" });
      const [dx, dz] = P(0, 0.3);
      PH.stairs(b, "wood", dx, dz, ry, 1.8, 1.2, 1.3, DECK, { maxRise: 0.3 });
    }
    // skiff moored at the pier head, booth & sign
    const [kx, kz] = P(W / 2 + 1.3, LEN - 3);
    buildSkiff(b, PH.m4(kx, -1.05, kz, ry + 0.06));
    const [bx, bz] = P(-W / 2 + 0.2, 3.5);
    b.box("panel", bx, DECK, bz, 1.6, 2.4, 1.6, { ry, grime: 0.6 });
    b.box("paint_teal", bx, DECK + 2.4, bz, 2.0, 0.18, 2.0, { ry, seg: false });
    const signK = PH.signMat(
      "battery_ellis_skiff",
      ["HARBOR SKIFF", "ELLIS ISLAND ▸ THE REGISTRY"],
      "enamel",
      512,
      192,
      { bg: "#2a4a3a" },
    );
    const [qx, qz] = P(-W / 2 + 0.2, 2.68);
    b.quad(signK, qx, DECK + 1.7, qz, 1.5, 0.56, { ry: ry + Math.PI });
    PH.col(bx, bz, 1.6, 1.6, DECK, DECK + 2.6, ry, { walkable: false });
    const g = b.build(root);
    g.name = "battery_ellis_skiff";
    const [ex, ez] = P(W / 2 - 0.2, LEN - 3);
    const [ax2, az2] = P(0, LEN - 5);
    PH.BATTERY = {
      skiffDoor: PH.v3(ex, DECK + 0.8, ez),
      arrive: {
        x: ax2,
        y: DECK + 0.05,
        z: az2,
        yaw: ry /* face out along the pier? no: face inland */ + 0,
      },
    };
    // arrival faces inland (back toward the Battery): actor yaw facing -outward
    PH.BATTERY.arrive.yaw = PH.yawTo(ax2, az2, sx, sz);
    return {
      skiff: PH.anchor(ax2, DECK, az2, 0),
      stile: PH.anchor(sx, 0, sz, 0),
    };
  }

  PH.addBuilder(
    "ellis_ext",
    function () {
      const root = new THREE.Group();
      root.name = "poi_ellis_island";
      G.scene.add(root);
      const anchors = buildEllis(root);
      const bp = buildBatteryPier(root);
      anchors.battery_skiff = bp.skiff;
      PH.ellisExt = { root, anchors };
      // harbor skiff doors: Battery Park seawall pier <-> Ellis Island boat ramp
      try {
        const E = PH.ELLIS,
          B = PH.BATTERY;
        G.world.addDoor({
          id: "ph_skiff_to_ellis",
          pos: B.skiffDoor,
          label: "Harbor Skiff to Ellis Island",
          verb: "Ride",
          radius: 1.6,
          target: E.arrive,
          sound: "door_open",
          onEnter: () =>
            G.notify(
              "The skiff putters across the Upper Bay toward the copper domes of Ellis Island...",
            ),
        });
        G.world.addDoor({
          id: "ph_skiff_to_battery",
          pos: E.skiffDoor,
          label: "Harbor Skiff to Battery Park",
          verb: "Ride",
          radius: 1.6,
          target: B.arrive,
          sound: "door_open",
          onEnter: () =>
            G.notify("The skiff noses back into the Battery seawall."),
        });
      } catch (e) {
        PH.safe("skiff doors", () => {
          throw e;
        });
      }
    },
    10,
  );
})();
