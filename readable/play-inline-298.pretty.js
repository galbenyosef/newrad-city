/* src/poi_midtown2/30_morgan.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN 2 — THE MORGAN LIBRARY
 * Exterior (site x 130..190, z -133..-102, facing 36th Street to the
 * south): McKim, Mead & White's 1906 marble palazzo — a low windowless
 * block of pale pink marble, Ionic corner pilasters, a deep entablature
 * and balustrade, the recessed Palladian loggia with paired columns, a
 * great arch and bronze doors, the two stone lionesses on the steps, a
 * fenced front lawn; the 1928 Annex (east) with its inscription and
 * J. P. Morgan Jr.'s brownstone (west).
 * Interior (INTERIORS.morgan_library, main floor lifted +5 m over the
 * basement stacks): the domed Rotunda (painted dome, mosaic floor) → the
 * East Room — a three-tier walnut library with bronze balconies, painted
 * ceiling, fireplace & tapestry, a secret bookcase hiding the spiral
 * stair to the upper tiers → the North Room (librarian's office: the
 * vault combination) → the West Room (Morgan's red study, stained glass)
 * → the steel vault → down to the rare-book stacks (Maniacs,
 * glowing sludge) → the Rare Book Vault (the Gutenberg Bible, boss) →
 * back up a service stair into the East Room.
 * Hostile: Maniacs, boss DEWEY (Maniac Bruiser).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pm2) return;
  const PM = G._pm2;
  const K = PM.kit,
    D = PM.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const FZ = -107.5; // McKim building front
  const MX0 = 143,
    MX1 = 177,
    MH = 11.6; // McKim building x range, cornice top
  const PL = 1.3; // plinth / portico floor height
  const MY = 5.0,
    BY = 0.4; // interior: main floor, basement floor
  const T2 = 4.4,
    T3 = 8.4,
    EC = 13.4; // East Room tiers + ceiling (relative to MY)

  Object.assign(PM.flagDefaults, {
    morgan_bookcase: false,
    morgan_dewey_dead: false,
    morgan_combo: false,
  });

  // ===================================================================
  // EXTERIOR
  // ===================================================================
  function ionic(b, key, x, y, z, h, r) {
    b.box(key, x, y, z, r * 2.6, r * 0.45, r * 2.6, { seg: false, grime: 0.5 });
    b.cyl(key, x, y + r * 0.45, z, r * 1.15, r * 1.25, r * 0.3, 16, {
      hSeg: 1,
    });
    const sh = h - r * 0.75 - r * 0.9;
    b.cyl(key, x, y + r * 0.75, z, r * 0.86, r, sh, 20, {
      hSeg: Math.max(2, Math.round(sh / 2)),
      grime: 0.45,
    });
    b.box(key, x, y + h - r * 0.9, z, r * 2.5, r * 0.5, r * 1.8, {
      seg: false,
    }); // echinus/abacus block
    for (const sg of [-1, 1])
      b.cyl(
        key,
        x + sg * r * 1.15,
        y + h - r * 0.62,
        z,
        r * 0.36,
        r * 0.36,
        r * 1.9,
        10,
        { hSeg: 1, rx: HP },
      ); // volutes
    b.box(key, x, y + h - r * 0.35, z, r * 2.7, r * 0.35, r * 2.7, {
      seg: false,
    });
    PM.col(x, z, r * 2.2, r * 2.2, y, y + h, 0, { walkable: false });
  }
  /** Reclining lioness on a pedestal (facing ry). */
  function lioness(b, x, y, z, ry, broken) {
    const M = PM.m4(x, y, z, ry);
    const add = (g, m, k) =>
      b.add(k || "limestone", g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.55,
      });
    add(
      new THREE.CapsuleGeometry(0.42, 1.3, 4, 10),
      PM.m4(0, 0.5, -0.2, 0, HP, 0),
    ); // body, lying
    add(
      new THREE.SphereGeometry(0.46, 10, 8),
      PM.m4(0, 0.55, -0.85, 0, 0, 0, 1, 0.85, 1.1),
    ); // haunch
    add(
      new THREE.CapsuleGeometry(0.13, 0.7, 3, 6),
      PM.m4(-0.22, 0.14, 0.55, 0, HP, 0),
    ); // forepaws
    add(
      new THREE.CapsuleGeometry(0.13, 0.7, 3, 6),
      PM.m4(0.22, 0.14, 0.55, 0, HP, 0),
    );
    add(
      new THREE.CapsuleGeometry(0.1, 0.9, 3, 6),
      PM.m4(0.35, 0.12, -1.2, 0.6, HP, 0),
    ); // tail
    if (!broken) {
      add(
        new THREE.SphereGeometry(0.3, 10, 8),
        PM.m4(0, 1.05, 0.62, 0, 0, 0, 0.95, 1.05, 1.1),
      ); // head, raised
      add(new THREE.BoxGeometry(0.26, 0.2, 0.3), PM.m4(0, 0.97, 0.88)); // muzzle
      for (const sg of [-1, 1])
        add(
          new THREE.ConeGeometry(0.07, 0.12, 5),
          PM.m4(sg * 0.17, 1.33, 0.56),
        );
      add(
        new THREE.CylinderGeometry(0.2, 0.3, 0.4, 8),
        PM.m4(0, 0.8, 0.5, 0, -0.5, 0),
      ); // neck
    } else {
      add(
        new THREE.CylinderGeometry(0.2, 0.3, 0.3, 8),
        PM.m4(0, 0.78, 0.5, 0, -0.5, 0),
      );
      b.rock(
        "limestone",
        x + Math.sin(ry) * 0.9 + 0.6,
        y - 1.05,
        z + Math.cos(ry) * 0.9,
        0.28,
        { seed: 4 },
      ); // the head, fallen
    }
    b.box("limestone", x, y - 0.95, z, 1.3, 0.95, 2.6, {
      ry,
      seg: false,
      grime: 0.5,
    });
    PM.col(x, z, 1.3, 2.6, y - 0.95, y + 1.2, ry, { walkable: false });
  }
  function buildExterior(site, root) {
    const b = PM.batch("morgan_ext");
    b.ground = 0;
    b.aoH = 3.5;
    const r = PM.rng("morgan_ext");
    const A = {};
    const back = site.z0 + 1;
    // lawn & path
    b.boxMM("grass", site.x0 + 12, -0.1, FZ, site.x1 - 1, 0.08, site.z1 - 0.6, {
      grime: 0.7,
    });
    b.boxMM("sidewalk", 155.5, -0.1, FZ, 164.5, 0.1, site.z1 - 0.6, {
      grime: 0.6,
    });
    b.boxMM("sidewalk", site.x0, -0.1, site.z1 - 0.8, site.x1, 0.07, site.z1, {
      grime: 0.6,
    });

    // ---------------- McKim building ----------------
    const cx = (MX0 + MX1) / 2;
    b.boxMM("granite", MX0 - 0.3, 0, back, MX1 + 0.3, PL, FZ + 0.4, {
      grime: 0.55,
    }); // plinth
    b.boxMM("pink_marble", MX0, PL, back, cx - 6, 9.6, FZ, { grime: 0.45 });
    b.boxMM("pink_marble", cx + 6, PL, back, MX1, 9.6, FZ, { grime: 0.45 });
    b.boxMM("pink_marble", cx - 6, PL, back, cx + 6, 9.6, FZ - 3.2, {
      grime: 0.45,
    }); // loggia back wall
    PM.colMM(MX0 - 0.3, 0, back, MX1 + 0.3, MH + 1.4, FZ - 3.2, {
      walkable: false,
    });
    PM.colMM(MX0 - 0.3, 0, FZ - 3.2, cx - 6, MH + 1.4, FZ + 0.4, {
      walkable: false,
    });
    PM.colMM(cx + 6, 0, FZ - 3.2, MX1 + 0.3, MH + 1.4, FZ + 0.4, {
      walkable: false,
    });
    // loggia floor (walkable at plinth height) & its side walls
    b.boxMM("marble_white", cx - 6, 0, FZ - 3.2, cx + 6, PL + 0.02, FZ + 0.4, {
      grime: 0.5,
    });
    PM.colMM(cx - 6, 0, FZ - 3.2, cx + 6, PL, FZ + 0.4, {});
    // entablature + frieze + cornice + balustrade (full width)
    b.boxMM("pink_marble", MX0 - 0.1, 9.6, back, MX1 + 0.1, 10.6, FZ + 0.15, {
      grime: 0.4,
    });
    b.boxMM("limestone", MX0 - 0.2, 10.6, back, MX1 + 0.2, 11.0, FZ + 0.3, {
      seg: false,
      grime: 0.35,
    });
    for (let x = MX0; x <= MX1; x += 0.55)
      b.box("limestone", x, 10.62, FZ + 0.34, 0.2, 0.2, 0.12, { seg: false }); // dentils
    b.boxMM(
      "pink_marble",
      MX0 - 0.6,
      11.0,
      back - 0.4,
      MX1 + 0.6,
      MH,
      FZ + 0.75,
      { seg: false, grime: 0.4 },
    );
    K.balustrade(
      b,
      "pink_marble",
      [
        [MX0, FZ + 0.3],
        [MX1, FZ + 0.3],
      ],
      MH,
      1.15,
      { urns: true },
    );
    K.balustrade(
      b,
      "pink_marble",
      [
        [MX0, FZ + 0.3],
        [MX0, back + 1],
      ],
      MH,
      1.15,
      {},
    );
    K.balustrade(
      b,
      "pink_marble",
      [
        [MX1, FZ + 0.3],
        [MX1, back + 1],
      ],
      MH,
      1.15,
      {},
    );
    // corner pilasters (paired) and flank panels with relief roundels
    for (const px of [MX0 + 0.7, MX0 + 2.1, MX1 - 2.1, MX1 - 0.7]) {
      b.box("pink_marble", px, PL, FZ + 0.12, 1.0, 9.6 - PL - 0.6, 0.3, {
        seg: false,
        grime: 0.4,
      });
      b.box("pink_marble", px, 9.0, FZ + 0.16, 1.3, 0.6, 0.4, { seg: false });
      for (const sg of [-1, 1])
        b.cyl(
          "pink_marble",
          px + sg * 0.55,
          9.15,
          FZ + 0.25,
          0.16,
          0.16,
          0.3,
          8,
          { hSeg: 1, rx: HP },
        );
    }
    for (const sx of [MX0 + 7.2, MX1 - 7.2]) {
      b.boxMM(
        "pink_marble",
        sx - 3.4,
        2.8,
        FZ - 0.25,
        sx + 3.4,
        8.6,
        FZ + 0.02,
        { seg: false, c: 0xd8c0b0, grime: 0.6 },
      ); // recessed panel
      b.boxMM("limestone", sx - 3.6, 8.6, FZ - 0.1, sx + 3.6, 8.9, FZ + 0.18, {
        seg: false,
      });
      b.boxMM("limestone", sx - 3.6, 2.5, FZ - 0.1, sx + 3.6, 2.8, FZ + 0.18, {
        seg: false,
      });
      b.cyl("bronze_patina", sx, 6.2, FZ - 0.2, 1.3, 1.3, 0.28, 24, {
        hSeg: 1,
        rx: HP,
      }); // roundel
      b.lathe(
        "bronze_patina",
        [
          [0.01, 0],
          [0.9, 0.02],
          [0.7, 0.18],
          [0.3, 0.3],
          [0.01, 0.34],
        ],
        16,
        sx,
        6.2,
        FZ + 0.05,
        { rx: HP },
      );
      b.add("limestone", new THREE.TorusGeometry(1.45, 0.14, 6, 24), {
        m: PM.m4(sx, 6.2, FZ - 0.05),
      });
      // swag garland under the roundel
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        b.sphere(
          "limestone",
          sx - 1.6 + t * 3.2,
          4.4 - Math.sin(t * PI) * 0.5,
          FZ + 0.05,
          0.18,
          { ws: 6, hs: 4 },
        );
      }
    }
    // the loggia: paired Ionic columns + blocks + the great arch with coffered soffit, bronze doors
    for (const x of [cx - 5.3, cx - 4.0, cx + 4.0, cx + 5.3])
      ionic(b, "marble_white", x, PL, FZ - 0.5, 5.6, 0.36);
    for (const sg of [-1, 1])
      b.boxMM(
        "pink_marble",
        cx + sg * 3.4 - (sg > 0 ? 0 : 2.6),
        PL + 5.6,
        FZ - 1.1,
        cx + sg * 3.4 + (sg > 0 ? 2.6 : 0),
        PL + 6.4,
        FZ + 0.05,
        { seg: false, grime: 0.4 },
      );
    {
      const R = 3.4,
        ay = PL + 6.4;
      for (let k = 0; k <= 12; k++) {
        const a = (k / 12) * PI;
        b.box(
          "pink_marble",
          cx + Math.cos(a) * (R + 0.3),
          ay + Math.sin(a) * (R + 0.3) - 0.3,
          FZ - 0.35,
          0.7,
          0.62,
          0.8,
          { rz: a - HP, seg: false, grime: 0.4 },
        );
      }
      b.box("marble_white", cx, ay + R + 0.1, FZ - 0.25, 0.7, 0.9, 0.9, {
        seg: false,
      }); // keystone
      // spandrels (fill between arch and entablature)
      for (const sg of [-1, 1]) {
        const sh = new THREE.Shape();
        sh.moveTo(0, 0);
        sh.lineTo(sg * (R + 0.7), 0);
        sh.lineTo(sg * (R + 0.7), R + 0.8);
        sh.lineTo(0, R + 0.8);
        sh.absarc(0, 0, R + 0.62, HP, sg > 0 ? 0 : PI, sg > 0);
        const g = new THREE.ExtrudeGeometry(sh, {
          depth: 0.6,
          bevelEnabled: false,
          curveSegments: 10,
        });
        b.add("pink_marble", g, { m: PM.m4(cx, ay, FZ - 0.9), grime: 0.4 });
      }
      // coffered barrel soffit
      for (let k = 0; k < 10; k++) {
        const a0 = (k / 10) * PI;
        b.box(
          "marble_white",
          cx + Math.cos(a0 + PI / 20) * (R - 0.05),
          ay + Math.sin(a0 + PI / 20) * (R - 0.05),
          FZ - 1.8,
          0.14,
          1.05,
          2.8,
          { rz: a0 + PI / 20 - HP, seg: false, grime: 0.6 },
        );
      }
      const soff = new THREE.CylinderGeometry(R, R, 2.9, 20, 1, true, -HP, PI);
      soff.rotateX(-HP);
      b.add("pink_marble", PM.invertGeo(soff), {
        m: PM.m4(cx, ay, FZ - 1.75, 0, 0, 0),
        grime: 0.6,
        c: 0xc8b0a0,
      });
      b.boxMM(
        "pink_marble",
        cx - 3.6,
        PL,
        FZ - 3.3,
        cx + 3.6,
        ay + R + 0.9,
        FZ - 3.15,
        { seg: false },
      );
      // lunette window over the doors (dark) + bronze doors
      const lun = PM.shapeGeo(
        (() => {
          const sh = new THREE.Shape();
          sh.moveTo(-2.2, 0);
          sh.lineTo(2.2, 0);
          sh.absarc(0, 0, 2.2, 0, PI, false);
          return sh;
        })(),
        12,
      );
      b.add("glass_dark", lun, {
        m: PM.m4(cx, PL + 5.4, FZ - 3.12),
        uv: "keep",
        noAO: true,
      });
      for (let k = 1; k < 6; k++) {
        const a = (k / 6) * PI;
        b.beam(
          "bronze",
          V3(cx, PL + 5.4, FZ - 3.08),
          V3(cx + Math.cos(a) * 2.2, PL + 5.4 + Math.sin(a) * 2.2, FZ - 3.08),
          0.06,
          0.06,
          {},
        );
      }
      b.boxMM("bronze", cx - 1.6, PL, FZ - 3.14, cx + 1.6, PL + 4.8, FZ - 3.0, {
        seg: false,
        grime: 0.5,
      });
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 4; j++)
          b.box(
            "bronze_patina",
            cx - 0.8 + i * 1.6,
            PL + 0.5 + j * 1.1,
            FZ - 2.98,
            1.2,
            0.85,
            0.06,
            { seg: false },
          );
      b.boxMM(
        "marble_white",
        cx - 2.1,
        PL,
        FZ - 3.1,
        cx - 1.6,
        PL + 5.3,
        FZ - 2.9,
        { seg: false },
      );
      b.boxMM(
        "marble_white",
        cx + 1.6,
        PL,
        FZ - 3.1,
        cx + 2.1,
        PL + 5.3,
        FZ - 2.9,
        { seg: false },
      );
      b.boxMM(
        "marble_white",
        cx - 2.1,
        PL + 4.8,
        FZ - 3.1,
        cx + 2.1,
        PL + 5.4,
        FZ - 2.9,
        { seg: false },
      );
    }
    // entrance steps down to the lawn path, flanked by the lionesses
    for (let k = 0; k < 4; k++) {
      b.boxMM(
        "granite",
        cx - 4.5,
        0,
        FZ + 0.4 + k * 0.42,
        cx + 4.5,
        PL - k * 0.33,
        FZ + 0.82 + k * 0.42,
        { seg: false, grime: 0.5 },
      );
      PM.colMM(
        cx - 4.5,
        0,
        FZ + 0.4 + k * 0.42,
        cx + 4.5,
        PL - k * 0.33,
        FZ + 0.82 + k * 0.42,
        {},
      );
    }
    lioness(b, cx - 5.6, 1.0, FZ + 1.6, 0, false);
    lioness(b, cx + 5.6, 1.0, FZ + 1.6, 0, true);
    // ---------------- the 1928 Annex (east) ----------------
    {
      const x0 = MX1 + 0.6,
        x1 = site.x1 - 1,
        H = 10;
      b.boxMM("granite", x0, 0, back, x1, 1.0, FZ - 0.8, { grime: 0.55 });
      b.boxMM("pink_marble", x0, 1.0, back, x1, H, FZ - 1.0, { grime: 0.5 });
      b.boxMM(
        "limestone",
        x0 - 0.3,
        H - 0.1,
        back,
        x1 + 0.2,
        H + 0.5,
        FZ - 0.5,
        { seg: false },
      );
      PM.colMM(x0, 0, back, x1, H + 0.5, FZ - 0.8, { walkable: false });
      const ins = PM.texMat(
        "pm2_morgan_ins",
        PM.signTex(
          "morgan_ins",
          ["THE PIERPONT MORGAN LIBRARY"],
          "engraved",
          1024,
          96,
          { bg: "#d8c4b4", fg: "rgba(60,40,30,0.85)" },
        ),
        { rough: 0.8 },
      );
      b.quad(ins, (x0 + x1) / 2, H - 1.0, FZ - 0.98, x1 - x0 - 0.6, 0.7, {
        ry: 0,
      });
      b.boxMM(
        "bronze",
        (x0 + x1) / 2 - 1.1,
        1.0,
        FZ - 1.08,
        (x0 + x1) / 2 + 1.1,
        4.2,
        FZ - 0.98,
        { seg: false },
      );
      for (const x of [x0 + 1.5, x1 - 1.5])
        b.quad("glass_dark", x, 5.4, FZ - 0.98, 1.3, 2.6, {
          ry: 0,
          noAO: true,
        });
    }
    // ---------------- J. P. Morgan Jr. House (brownstone, west) ----------------
    {
      const x0 = site.x0 + 1,
        x1 = MX0 - 0.8,
        H = 17;
      const p = [
        [x0, back],
        [x1, back],
        [x1, FZ + 0.5],
        [x0, FZ + 0.5],
      ];
      K.prismBands(b, "brownstone_t", p, 0, H, 4.2, { grime: 0.55 });
      PM.colMM(x0, 0, back, x1, H, FZ + 0.5, { walkable: false });
      b.boxMM(
        "brownstone_dk",
        x0 - 0.3,
        H - 0.9,
        FZ + 0.3,
        x1 + 0.3,
        H,
        FZ + 1.1,
        { seg: false },
      );
      for (let x = x0; x < x1; x += 0.8)
        b.box("brownstone_dk", x + 0.4, H - 1.3, FZ + 0.85, 0.25, 0.4, 0.4, {
          seg: false,
        });
      K.polyWindows(b, p, {
        y0: 3.8,
        floors: 4,
        floorH: 3.2,
        w: 1.1,
        h: 2.1,
        spacing: 2.4,
        frameKey: "brownstone_dk",
        sill: true,
        lintel: true,
        broken: 0.35,
        boarded: 0.2,
        seed: 61,
        skipEdge: (i) => i !== 2,
        margin: 1.2,
      });
      // stoop
      for (let k = 0; k < 7; k++) {
        b.boxMM(
          "brownstone_dk",
          x1 - 3.6,
          0,
          FZ + 0.5 + k * 0.36,
          x1 - 1.6,
          2.4 - k * 0.34,
          FZ + 0.86 + k * 0.36,
          { seg: false },
        );
        PM.colMM(
          x1 - 3.6,
          0,
          FZ + 0.5 + k * 0.36,
          x1 - 1.6,
          2.4 - k * 0.34,
          FZ + 0.86 + k * 0.36,
          {},
        );
      }
      b.boxMM("planks", x1 - 3.4, 2.4, FZ + 0.45, x1 - 1.8, 5.0, FZ + 0.52, {
        seg: false,
        grime: 0.8,
      });
      PM.railing(
        b,
        [
          [x1 - 3.7, FZ + 3.0, 0],
          [x1 - 3.7, FZ + 0.6, 2.4],
        ],
        0,
        0.9,
        "iron",
      );
    }
    // ---------------- front lawn: iron fence with gate, urns, dead shrubs; the settlers' warning ----------------
    {
      const fz = site.z1 - 0.9;
      const fence = (xa, xb) => {
        b.boxMM("granite", xa, 0, fz - 0.2, xb, 0.5, fz + 0.2, { seg: false });
        b.boxMM("iron", xa, 1.8, fz - 0.03, xb, 1.86, fz + 0.03, {
          seg: false,
        });
        b.boxMM("iron", xa, 0.6, fz - 0.03, xb, 0.66, fz + 0.03, {
          seg: false,
        });
        for (let x = xa + 0.1; x < xb; x += 0.16) {
          b.box("iron", x, 0.5, fz, 0.025, 1.45, 0.025, { seg: false });
          b.add("iron", new THREE.ConeGeometry(0.03, 0.12, 4), {
            m: PM.m4(x, 2.0, fz),
          });
        }
        PM.colMM(xa, 0, fz - 0.2, xb, 2.0, fz + 0.2, { walkable: false });
      };
      fence(MX0 - 0.3, cx - 3.2);
      fence(cx + 3.2, MX1 + 0.3);
      for (const x of [cx - 3.2, cx + 3.2]) {
        b.box("granite", x, 0, fz, 0.6, 2.3, 0.6, { seg: false });
        b.sphere("granite", x, 2.5, fz, 0.25, {});
        PM.col(x, fz, 0.6, 0.6, 0, 2.3, 0, { walkable: false });
      }
      // one gate leaf hanging open, the other fallen
      for (let k = 0; k < 10; k++)
        b.box(
          "iron",
          cx - 3.0 + Math.sin(-1.2) * 0 + k * 0.1 * Math.cos(1.2),
          0.2,
          fz + k * 0.1 * Math.sin(1.2) + 0.1,
          0.025,
          1.7,
          0.025,
          { seg: false },
        );
      b.boxMM("iron", cx + 0.4, 0.02, fz - 2.2, cx + 3.1, 0.08, fz - 0.6, {
        seg: false,
      });
      const warn = PM.texMat(
        "pm2_morgan_warn",
        PM.signTex(
          "morgan_warn",
          ["MANIACS INSIDE", "DO NOT ENTER", "NOT EVEN FOR BOOKS"],
          "raider",
          512,
          256,
          { bg: "#c8c0a8", fg: "#8a1a14" },
        ),
      );
      b.quad(warn, cx - 5.5, 1.25, fz + 0.06, 1.6, 0.8, { ry: 0, rz: 0.06 });
      for (const x of [cx - 10, cx + 10]) {
        b.box("granite", x, 0, FZ + 2.5, 0.8, 0.8, 0.8, { seg: false });
        b.lathe(
          "granite",
          [
            [0.05, 0],
            [0.3, 0.1],
            [0.45, 0.5],
            [0.25, 0.75],
            [0.35, 0.85],
            [0.02, 0.9],
          ],
          10,
          x,
          0.8,
          FZ + 2.5,
          {},
        );
        PM.col(x, FZ + 2.5, 0.8, 0.8, 0, 1.7, 0, { walkable: false });
      }
      for (let i = 0; i < 6; i++)
        b.rock(
          "moss",
          MX0 + 2 + r() * 10,
          0.2,
          FZ + 1.5 + r() * 2.5,
          0.4 + r() * 0.3,
          { flat: 0.6, seed: i },
        );
      for (let i = 0; i < 6; i++)
        b.rock(
          "moss",
          MX1 - 2 - r() * 10,
          0.2,
          FZ + 1.5 + r() * 2.5,
          0.4 + r() * 0.3,
          { flat: 0.6, seed: i + 9 },
        );
      PM.deadTree(b, MX0 + 5, 0, FZ + 3.2, 5, 67);
      PM.deadTree(b, MX1 - 4, 0, FZ + 3.6, 4.5, 68);
    }
    PM.skeleton(b, cx + 1.2, PL + 0.02, FZ - 1.5, 2.3);
    D.papers(b, cx, PL + 0.02, FZ - 1.2, 2.4, 14, 69);
    D.papers(b, cx + 3, 0.1, FZ + 3, 2, 10, 70);
    b.build(root);
    A.door = PM.anchor(cx, PL, FZ - 1.6, PI);
    PM.readable(
      V3(cx - 6.8, 1.9, FZ + 0.35),
      "The Morgan Library",
      "Built 1902–06 by McKim, Mead & White to hold the collection of J. Pierpont Morgan: three Gutenberg Bibles, medieval manuscripts, letters, music and drawings. Its first director, Belle da Costa Greene, bought and guarded it with legendary ferocity. The building has no windows on the street. It was not built to be looked into.",
    );
    return A;
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
  function buildInterior(cell) {
    const O = cell.origin;
    const oy = O.y;
    const b = PM.batch("morgan_int");
    const F = PM.frame(O.x, oy, O.z, b);
    const { X, Z, P, A: AN, W } = F;
    const root = cell.root;
    const r = PM.rng("morgan_int");
    const A = {};
    b.ground = oy + BY;
    b.aoH = 3;
    b.grime = 0.35;
    const m = (y) => MY + y; // main-floor relative height helper

    // ---------------- lights ----------------
    const L = [];
    const lamp = (x, y, z, col, rad, i) =>
      L.push({ x: X(x), y: oy + y, z: Z(z), color: col, r: rad, i });
    lamp(0, m(9), 0, 0xffe8c0, 11, 0.8);
    lamp(0, m(2.8), 8, 0xffd090, 6, 0.5); // rotunda (oculus), vestibule
    lamp(16, m(3), 0, 0xffb060, 12, 0.8);
    lamp(24.5, m(1.2), 0, 0xff7a30, 9, 1.1); // East Room floor + fireplace embers
    lamp(10, m(3.2), -6, 0x90b070, 8, 0.45);
    lamp(16, m(T2 + 2.5), -8, 0xffc070, 9, 0.6);
    lamp(16, m(T2 + 2.5), 8.3, 0xffc070, 9, 0.55);
    lamp(16, m(T3 + 2.5), -8, 0xffd8a0, 9, 0.55);
    lamp(16, m(T3 + 2.5), 8.3, 0xffd8a0, 9, 0.5);
    lamp(16, m(EC - 1), 0, 0xd8d0b8, 14, 0.5);
    lamp(24.3, m(2), 7.3, 0xffa050, 5, 0.6);
    lamp(24.3, m(T2 + 2), 7.3, 0xffa050, 5, 0.5);
    lamp(24.3, m(T3 + 2), 7.3, 0xffa050, 5, 0.5);
    lamp(-16, m(3.2), 0, 0xff9a60, 12, 0.8);
    lamp(-25, m(3), -3, 0xc080ff, 7, 0.6);
    lamp(-25, m(3), 4, 0x60a0ff, 7, 0.6);
    lamp(-16, m(1.2), 8, 0xff7a30, 6, 0.9); // study (stained glass tints)
    lamp(0, m(3), -12, 0xd8e8c0, 9, 0.7); // North Room (green desk lamp)
    lamp(-20, m(2.6), -14.5, 0xffc070, 6, 0.6); // vault room
    for (const [x, z, col] of [
      [-18, -22, 0xd8f0d8],
      [-6, -16, 0xd8f0d8],
      [6, -24, 0x80ff60],
      [0, -8, 0xd8f0d8],
      [18, -14, 0xd8f0d8],
      [-14, -28, 0xd8f0d8],
    ])
      lamp(x, BY + 3.4, z, col, 9, 0.6);
    lamp(16, BY + 3, -25, 0x80ff60, 9, 0.9);
    lamp(20, BY + 2, -27, 0xffc070, 5, 0.6); // the vault (green rad-leak light) + lectern candles
    b.setLights(L, 0x8a7a68, 0.1);

    // ================= SHELLS =================
    // main floor slab (y = MY) over the stacks, holes for the two basement stairs
    F.slab(
      "marble_floor",
      -26,
      -20,
      26,
      13,
      MY,
      [
        [-21, -18, -19, -10.6],
        [18.1, -9, 19.9, -4],
      ],
      { th: 0.4, under: "concrete" },
    );
    // walls of the main floor: outer box, rooms
    const WALLK = "pink_marble";
    W(WALLK, "x", -26.4, 26.4, 12.8, 13.2, MY, m(8), [
      { c: 0, w: 2.6, y0: MY, h: 3.2 },
    ]); // south
    W(WALLK, "z", -20, 13.2, -26.4, -26, MY, m(9), []); // west
    W(WALLK, "z", -9.4, 9.4, 26, 26.4, MY, m(EC), []); // east (East Room)
    // vestibule (x -3..3, z 6..13) and the rotunda (x -6..6, z -6..6)
    W(WALLK, "z", 6, 13, -3.2, -3, MY, m(5), []);
    W(WALLK, "z", 6, 13, 3, 3.2, MY, m(5), []);
    F.box("marble_white", -3.2, m(5), 6, 3.2, m(5.3), 13, { seg: false });
    W(WALLK, "x", -6.2, 6.2, 5.8, 6.2, MY, m(10), [
      { c: 0, w: 2.8, y0: MY, h: 3.6 },
    ]);
    W(WALLK, "x", -6.2, 6.2, -6.2, -5.8, MY, m(10), [
      { c: 0, w: 2.2, y0: MY, h: 3.0 },
    ]);
    W(WALLK, "z", -9.2, 9.2, -6.2, -5.8, MY, m(10), [
      { c: 0, w: 3.0, y0: MY, h: 4.0 },
    ]);
    W(WALLK, "z", -9.2, 9.2, 5.8, 6.2, MY, m(EC), [
      { c: 0, w: 3.0, y0: MY, h: 4.0 },
    ]);
    // walls between rooms outside the rotunda (fill the corridors)
    W(WALLK, "x", -26, -6, 8.8, 9.2, MY, m(9), []);
    W(WALLK, "x", 6, 26.4, 8.8, 9.2, MY, m(EC), []); // S walls of West & East rooms
    W(WALLK, "x", -26, -6, -9.2, -8.8, MY, m(9), [
      { c: -19.75, w: 2.5, y0: MY, h: 2.6 },
    ]); // N wall of West Room (vault door)
    W(WALLK, "x", 6, 26.4, -9.2, -8.8, MY, m(EC), []); // N wall of East Room
    F.box("cream_plaster", -26, m(9), -9, -6, m(9.3), 9, { seg: false }); // study ceiling (coffers added later)
    F.box("cream_plaster", -3, m(5.3), 6, 3, m(5.4), 13, { seg: false });

    // ================= VESTIBULE & ROTUNDA =================
    A.entrance = AN(0, MY, 10.8, 0);
    A.exit_door = P(0, m(1.4), 12.6);
    F.box("bronze", -1.3, MY, 12.7, 1.3, m(3.2), 12.8, { seg: false });
    for (const x of [-2.6, 2.6]) {
      b.cyl("marble_green", X(x), oy + MY, Z(8.5), 0.25, 0.25, 4.6, 14, {
        hSeg: 2,
      });
      PM.col(X(x), Z(8.5), 0.5, 0.5, oy + MY, oy + m(4.6), 0, {
        walkable: false,
      });
    }
    F.box("mosaic", -6, MY + 0.005, -6, 6, MY + 0.02, 6, {
      seg: false,
      grime: 0.6,
    });
    // paired columns in the corners (green cipollino), niches with busts
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        for (const d of [0, 1]) {
          const x = sx * (4.6 - d * 0.0) - (d ? sx * 0 : 0),
            z = sz * (4.6 - d * 1.1);
          b.cyl(
            "marble_green",
            X(sx * (4.6 - d * 1.1)),
            oy + MY,
            Z(sz * 4.6),
            0.28,
            0.3,
            6.0,
            16,
            { hSeg: 2 },
          );
          b.box(
            "gilt_dull",
            X(sx * (4.6 - d * 1.1)),
            oy + m(6.0),
            Z(sz * 4.6),
            0.8,
            0.35,
            0.8,
            { seg: false },
          );
          PM.col(
            X(sx * (4.6 - d * 1.1)),
            Z(sz * 4.6),
            0.6,
            0.6,
            oy + MY,
            oy + m(6),
            0,
            { walkable: false },
          );
          void x;
          void z;
        }
      }
    for (const [x, z, ry] of [
      [-5.75, -2.5, HP],
      [-5.75, 2.5, HP],
      [5.75, -2.5, -HP],
      [5.75, 2.5, -HP],
    ]) {
      b.box("marble_white", X(x), oy + MY, Z(z), 0.5, 1.2, 0.5, { seg: false });
      b.sphere("marble_white", X(x), oy + m(1.5), Z(z), 0.2, { sy: 1.2 });
      b.cyl("marble_white", X(x), oy + m(1.2), Z(z), 0.12, 0.25, 0.3, 8, {
        hSeg: 1,
      });
      void ry;
    }
    // entablature ring + the painted dome with its oculus
    F.box("gilt_dull", -6, m(6.2), -6, 6, m(6.6), -5.7, { seg: false });
    F.box("gilt_dull", -6, m(6.2), 5.7, 6, m(6.6), 6, { seg: false });
    F.box("gilt_dull", -6, m(6.2), -6, -5.7, m(6.6), 6, { seg: false });
    F.box("gilt_dull", 5.7, m(6.2), -6, 6, m(6.6), 6, { seg: false });
    F.box(WALLK, -6, m(10), -6, 6, m(10.3), 6, { seg: false });
    {
      const dk = PM.texMat("pm2_dome", PM.domeTex(), { rough: 0.85, vc: true });
      const dome = new THREE.SphereGeometry(5.6, 24, 10, 0, TAU, 0, HP * 0.92);
      b.add(dk, PM.invertGeo(dome), {
        m: PM.m4(X(0), oy + m(6.6), Z(0), 0, 0, 0, 1, 0.55, 1),
        uv: "keep",
        grime: 0.2,
        noAO: true,
      });
      b.cyl("sky_glow", X(0), oy + m(9.6), Z(0), 0.5, 0.5, 0.05, 16, {
        hSeg: 1,
        noAO: true,
      });
      // pendentives to square the circle
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.box(
          "gilt_dull",
          X(sx * 5.3),
          oy + m(6.6),
          Z(sz * 5.3),
          1.2,
          0.9,
          1.2,
          { ry: PI / 4, seg: false },
        );
    }
    PM.glow(P(0, 9.6 + MY - 0.4, 0), 0xfff0d0, 2.0, root, { intensity: 1.0 });
    // a toppled reading stand and papers; bloody drag marks toward the East Room
    D.papers(b, X(1.5), oy + MY + 0.02, Z(1), 3, 18, 201);
    PM.skeleton(b, X(-2.5), oy + MY + 0.03, Z(-2.5), 0.7);
    A.rotunda = AN(0, MY, 0, 0);

    // ================= EAST ROOM (x 6..26, z -9..9): three-tier library =================
    F.box("carpet", 6.2, MY + 0.01, -8.8, 25.8, MY + 0.03, 8.8, {
      seg: false,
      c: 0x8a3030,
    });
    // stair tower (secret spiral) in the SE corner: x 22.4..26, z 5.4..9
    const TX0 = 22.4,
      TZ0 = 5.4,
      SC = { x: 24.25, z: 7.25 };
    W(WALLK, "x", TX0, 26, TZ0 - 0.2, TZ0, MY, m(EC), []);
    W(WALLK, "z", TZ0, 8.8, TX0 - 0.2, TX0, MY, m(EC), [
      { c: 7.1, w: 2.2, y0: MY, h: 2.6 },
      { c: 8.1, w: 1.2, y0: m(T2), h: 2.6 },
      { c: 8.1, w: 1.2, y0: m(T3), h: 2.6 },
    ]);
    // walkways (tier 2 & 3): north (z -9..-7.7), south (z 7.7..9, x 6..22.4), west (x 6..7.3), east-north (x 24.7..26, z -9..-3)
    const walk = (y) => {
      const th = 0.3;
      F.box("walnut", 6, y - th, -8.8, 26, y, -7.7, { seg: false });
      F.col(6, y - th, -8.8, 26, y, -7.7, { surface: "wood" });
      F.box("walnut", 6, y - th, 7.7, TX0, y, 8.8, { seg: false });
      F.col(6, y - th, 7.7, TX0, y, 8.8, { surface: "wood" });
      F.box("walnut", 6.2, y - th, -7.7, 7.3, y, 7.7, { seg: false });
      F.col(6.2, y - th, -7.7, 7.3, y, 7.7, { surface: "wood" });
      F.box("walnut", 24.7, y - th, -7.7, 25.8, y, -3, { seg: false });
      F.col(24.7, y - th, -7.7, 25.8, y, -3, { surface: "wood" });
      // bronze railings along the open edges
      F.rail(
        [
          [7.3, 7.7],
          [7.3, -7.7],
          [24.7, -7.7],
          [24.7, -3],
          [25.8, -3],
        ],
        y,
        1.0,
        "bronze",
      );
      F.rail(
        [
          [7.3, 7.7],
          [TX0, 7.7],
        ],
        y,
        1.0,
        "bronze",
      );
      // brackets under the walkway edge
      for (let x = 8; x < 24.5; x += 2) {
        b.box("walnut", X(x), oy + y - 0.8, Z(-7.8), 0.12, 0.5, 0.3, {
          seg: false,
        });
        if (x < TX0 - 0.5)
          b.box("walnut", X(x), oy + y - 0.8, Z(7.8), 0.12, 0.5, 0.3, {
            seg: false,
          });
      }
    };
    walk(m(T2));
    walk(m(T3));
    // bookcases on all three tiers
    const tiers = [
      [MY, m(4.1)],
      [m(T2), m(T2 + 3.7)],
      [m(T3), m(T3 + 3.6)],
    ];
    tiers.forEach(([y0, y1], ti) => {
      PM.bookcase(b, X(6.25), Z(-8.6), X(25.75), Z(-8.6), oy + y0, oy + y1, 0, {
        depth: 0.4,
        collide: false,
      }); // north wall
      PM.bookcase(
        b,
        X(6.25),
        Z(8.6),
        X(TX0 - 0.25),
        Z(8.6),
        oy + y0,
        oy + y1,
        PI,
        { depth: 0.4, collide: false },
      ); // south wall
      if (ti === 0) {
        PM.bookcase(
          b,
          X(6.25),
          Z(-8.3),
          X(6.25),
          Z(-1.6),
          oy + y0,
          oy + y1,
          HP,
          { depth: 0.4, collide: false },
        );
        PM.bookcase(b, X(6.25), Z(1.6), X(6.25), Z(8.3), oy + y0, oy + y1, HP, {
          depth: 0.4,
          collide: false,
        });
      } else
        PM.bookcase(
          b,
          X(6.25),
          Z(-8.3),
          X(6.25),
          Z(8.3),
          oy + y0,
          oy + y1,
          HP,
          { depth: 0.4, collide: false },
        );
      PM.bookcase(
        b,
        X(25.75),
        Z(-8.3),
        X(25.75),
        Z(-3.2),
        oy + y0,
        oy + y1,
        -HP,
        { depth: 0.4, collide: false },
      );
      PM.bookcase(
        b,
        X(TX0 - 0.2),
        Z(TZ0 + 0.2),
        X(TX0 - 0.2),
        Z(ti === 0 ? 6.0 : 7.5),
        oy + y0,
        oy + y1,
        -HP,
        { depth: 0.3, collide: false },
      );
      PM.bookcase(
        b,
        X(TX0),
        Z(TZ0 - 0.2),
        X(25.8),
        Z(TZ0 - 0.2),
        oy + y0,
        oy + y1,
        PI,
        { depth: 0.3, collide: false },
      );
    });
    // the painted ceiling: cove lunettes + coffered zodiac panels
    {
      const mk = PM.muralKey();
      F.box("walnut", 6, m(EC), -9, 26, m(EC + 0.3), 9, { seg: false });
      for (let i = 0; i < 5; i++)
        for (let j = 0; j < 4; j++) {
          const x = 8 + i * 4,
            z = -6.75 + j * 4.5;
          b.quad(mk, X(x), oy + m(EC) - 0.02, Z(z), 3.4, 3.4, {
            rx: HP,
            uvRect: PM.muralRect(4 + ((i + j) % 4)),
            noAO: true,
            grime: 0.2,
          });
          F.box(
            "gilt_dull",
            x - 2,
            EC + MY - 0.25,
            z - 2.25,
            x + 2,
            EC + MY - 0.02,
            z - 2.1,
            { seg: false },
          );
          F.box(
            "gilt_dull",
            x - 2.05,
            EC + MY - 0.25,
            z - 2.25,
            x - 1.9,
            EC + MY - 0.02,
            z + 2.25,
            { seg: false },
          );
        }
      for (let i = 0; i < 5; i++) {
        b.quad(mk, X(8 + i * 4), oy + m(12.7), Z(-8.35), 3.2, 1.3, {
          ry: 0,
          uvRect: PM.muralRect(i % 4),
          noAO: true,
        });
        if (8 + i * 4 < TX0 - 1)
          b.quad(mk, X(8 + i * 4), oy + m(12.7), Z(8.35), 3.2, 1.3, {
            ry: PI,
            uvRect: PM.muralRect((i + 2) % 4),
            noAO: true,
          });
      }
    }
    // fireplace (east wall centre) and the tapestry above it
    {
      F.solid("marble_white", 24.8, MY, -2.6, 26, m(3.4), 2.6);
      F.box("iron", 24.7, MY, -1.6, 24.82, m(2.3), 1.6, {
        seg: false,
        c: 0x1a1410,
      });
      F.box("marble_green", 24.5, m(3.4), -3, 26, m(3.7), 3, { seg: false });
      b.box("fire", X(25.2), oy + MY + 0.02, Z(0), 0.6, 0.18, 1.6, {
        seg: false,
        noAO: true,
      });
      PM.glow(P(25, MY + 0.5, 0), 0xff6a20, 1.8, root, {
        intensity: 1.3,
        flicker: 0.5,
      });
      const tk = PM.texMat("pm2_tapestry", PM.tapestryTex(), {
        rough: 1,
        vc: true,
      });
      b.quad(tk, X(25.9), oy + m(8.4), Z(0), 5.8, 7.6, { ry: -HP });
      F.box("iron", 25.85, m(12.25), -3.1, 25.95, m(12.35), 3.1, {
        seg: false,
      });
    }
    // floor furniture: Gutenberg vitrines (empty!), long table with green lamps, globe, armchairs
    for (const [x, z] of [
      [11, -3.5],
      [11, 3.5],
      [16, -4.5],
    ]) {
      PM.vitrine(b, X(x), oy + MY, Z(z), 1.6, 1.0, 0.5, 0);
      b.box("velvet", X(x), oy + m(0.9), Z(z), 1.2, 0.05, 0.7, { seg: false });
    }
    b.quad(
      PM.labelKey(
        "morgan_gut",
        [
          "THE GUTENBERG BIBLE",
          "Mainz, c. 1455 · Paper · Vol. I",
          "REMOVED TO THE RARE BOOK VAULT",
          "FOR SAFEKEEPING — 4 MAR. 1967 · B.G.",
        ],
        "label",
        512,
        256,
      ),
      X(11),
      oy + m(1.45),
      Z(-2.98),
      0.8,
      0.4,
      { ry: 0, rx: -0.5 },
    );
    F.solid("walnut", 14.5, MY, -0.6, 21.5, m(0.78), 0.6);
    for (const x of [15.8, 18, 20.2]) {
      b.cyl("brass", X(x), oy + m(0.78), Z(0), 0.02, 0.02, 0.35, 5, {
        hSeg: 1,
      });
      b.cyl("lamp_green", X(x), oy + m(1.1), Z(0), 0.12, 0.2, 0.12, 8, {
        hSeg: 1,
        noAO: true,
      });
      PM.glow(P(x, 1.05 + MY, 0), 0x90ff90, 0.8, root, { intensity: 0.9 });
    }
    for (let i = 0; i < 6; i++)
      D.chair(
        b,
        X(15.5 + i * 1.2),
        oy + MY,
        Z(i % 2 ? 1.1 : -1.1),
        i % 2 ? PI : 0,
        r() < 0.3,
        "walnut",
      );
    D.papers(b, X(18), oy + m(0.79), Z(0), 1.2, 8, 211);
    b.cyl("walnut", X(21), oy + MY, Z(4.5), 0.08, 0.3, 0.9, 8, { hSeg: 1 });
    b.sphere("paint_cream", X(21), oy + m(1.35), Z(4.5), 0.45, { c: 0xc8b890 });
    b.add("brass", new THREE.TorusGeometry(0.5, 0.025, 4, 20), {
      m: PM.m4(X(21), oy + m(1.35), Z(4.5), 0, 0.4, 0),
    });
    PM.armchair(b, X(9), oy + MY, Z(6.5), PI - 0.4, "leather_red");
    PM.armchair(b, X(13), oy + MY, Z(6.8), PI + 0.3, "leather_red");
    PM.nest(b, X(9.5), oy + MY + 0.02, Z(-6.5), 0.5);
    PM.bonePile(b, X(10.5), oy + MY, Z(-5.5), 1.0, 14, 212);
    // books pulled off the shelves in drifts
    for (let i = 0; i < 40; i++)
      b.box(
        r() < 0.5 ? "leather_red" : "leather_brown",
        X(7.5 + r() * 16),
        oy + MY + 0.04,
        Z((r() < 0.5 ? -7.6 : 7.3) + (r() - 0.5)),
        0.22,
        0.05 + r() * 0.04,
        0.3,
        { ry: r() * TAU, seg: false },
      );
    // the basement service stair emerging in the north-east of the room, with a railing
    F.rail(
      [
        [18.1, -8.5],
        [18.1, -4],
      ],
      MY,
      1.0,
      "bronze",
    );
    F.rail(
      [
        [19.9, -8.5],
        [19.9, -4],
      ],
      MY,
      1.0,
      "bronze",
    );
    A.east_room = AN(14, MY, 3, 0);
    A.upper_tier = AN(16, m(T3), -8.2, PI);
    A.middle_tier = AN(12, m(T2), 8.2, 0);
    // the secret bookcase (pivots) hides the spiral stair tower — see builder
    A.secret_case = AN(TX0 - 0.1, MY, 6.0, 0);
    // spiral stair inside the tower: flight 1 floor → tier 2 (one full turn), flight 2 → tier 3
    {
      const cxs = X(SC.x),
        czs = Z(SC.z);
      b.cyl("bronze", cxs, oy + MY, czs, 0.14, 0.14, T3 + 1.2, 10, { hSeg: 4 });
      const flight = (y0, y1, n, a0) => {
        for (let i = 1; i <= n; i++) {
          const top = y0 + ((y1 - y0) * i) / n,
            a = a0 + (i / n) * TAU;
          const mx = cxs + Math.cos(a) * 0.8,
            mz = czs - Math.sin(a) * 0.8;
          b.box("walnut", mx, oy + top - 0.08, mz, 1.35, 0.08, 0.55, {
            ry: a,
            seg: false,
          });
          PM.col(mx, mz, 1.35, 0.55, oy + top - 0.25, oy + top, a, {
            surface: "wood",
          });
        }
      };
      flight(MY, m(T2), 15, PI + 0.35);
      flight(m(T2), m(T3), 14, PI + 0.35);
      // landings at the tower's west openings
      for (const y of [T2, T3]) {
        F.box("walnut", TX0, m(y) - 0.25, 6.3, 23.0, m(y), 8.8, { seg: false });
        F.col(TX0, m(y) - 0.25, 6.3, 23.0, m(y), 8.8, { surface: "wood" });
      }
      F.box("walnut", TX0, m(EC) - 0.5, TZ0, 26, m(EC), 8.8, { seg: false });
      PM.candles(b, X(25.6), oy + MY + 0.02, Z(8.5), 3, 221, root);
    }

    // ================= NORTH ROOM (librarian's office, x -6..6, z -20..-6) =================
    W(WALLK, "z", -20, -6, -6.2, -5.8, MY, m(6), []);
    W(WALLK, "z", -20, -6, 5.8, 6.2, MY, m(6), []);
    W(WALLK, "x", -6.2, 6.2, -20.2, -19.8, MY, m(6), []);
    F.box("cream_plaster", -6, m(6), -20, 6, m(6.3), -6, { seg: false });
    F.box("carpet", -5.8, MY + 0.01, -19.8, 5.8, MY + 0.03, -6.2, {
      seg: false,
      c: 0x3a4a3a,
    });
    F.solid("walnut", -2, MY, -15.6, 2, m(0.8), -14.4);
    b.cyl("lamp_green", X(-1.2), oy + m(1.1), Z(-15.2), 0.14, 0.22, 0.14, 8, {
      hSeg: 1,
      noAO: true,
    });
    PM.glow(P(-1.2, MY + 1.05, -15.2), 0x90ff90, 0.9, root, { intensity: 1.0 });
    D.papers(b, X(0.5), oy + m(0.81), Z(-15), 0.8, 7, 231);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 6; j++)
        F.box(
          "oak",
          -5.8,
          MY + 0.2 + j * 0.3,
          -18.8 + i * 0.9,
          -5.35,
          MY + 0.48 + j * 0.3,
          -18.0 + i * 0.9,
          { seg: false, c: 0xa07048 },
        ); // card catalogue
    PM.bookcase(b, X(-4), Z(-19.75), X(4), Z(-19.75), oy + MY, oy + m(3.2), 0, {
      depth: 0.4,
    });
    // the librarian at her post, forever
    {
      D.chair(b, X(0), oy + MY, Z(-16.3), 0, false, "leather_brown");
      const sk = PM.m4(X(0), oy + m(0.5), Z(-16.2), PI);
      const add = (g, mm) =>
        b.add("bone", g, {
          m: new THREE.Matrix4().multiplyMatrices(sk, mm),
          grime: 0.4,
        });
      add(new THREE.SphereGeometry(0.11, 7, 5), PM.m4(0, 0.95, 0.15, 0, 0.6));
      for (let i = 0; i < 5; i++)
        add(
          new THREE.TorusGeometry(0.13, 0.012, 3, 8, PI),
          PM.m4(0, 0.55 + i * 0.07, 0, 0, 0.1, 0),
        );
      add(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4), PM.m4(0, 0.6, -0.05));
      for (const sx of [-0.12, 0.12]) {
        add(
          new THREE.CylinderGeometry(0.02, 0.02, 0.45, 4),
          PM.m4(sx, 0.25, 0.25, 0, HP),
        );
        add(
          new THREE.CylinderGeometry(0.018, 0.018, 0.4, 4),
          PM.m4(sx * 1.4, 0.55, 0.25, 0, 1.2),
        );
      }
      b.box("fabric", X(0), oy + m(0.5), Z(-16.2), 0.5, 0.6, 0.35, {
        seg: false,
        c: 0x2a2a3a,
        grime: 0.7,
      });
    }
    A.north_terminal = AN(1.2, m(0.8), -14.9, PI);
    A.combo_note = AN(-0.35, m(0.82), -14.7, 0);
    A.north_room = AN(0, MY, -9, 0);
    b.quad(
      PM.labelKey(
        "morgan_north",
        [
          "THE NORTH ROOM",
          "Office of the Director",
          "Knock. Then wait. Then leave.",
        ],
        "brass",
        512,
        200,
      ),
      X(1.9),
      oy + m(2.6),
      Z(-6.25),
      1.0,
      0.4,
      { ry: PI },
    );

    // ================= WEST ROOM (Morgan's study, x -26..-6, z -9..9) =================
    {
      // wainscot + red silk damask walls
      F.box("walnut_panel", -25.95, MY, -8.75, -25.8, m(1.4), 8.75, {
        seg: false,
      });
      F.box("damask", -25.99, m(1.4), -8.8, -25.96, m(7.6), 8.8, {
        seg: false,
        grime: 0.3,
      });
      for (const [z, ry] of [
        [-8.75, 0],
        [8.75, PI],
      ]) {
        F.box("walnut_panel", -25.9, MY, z - 0.1, -6.1, m(1.4), z + 0.1, {
          seg: false,
        });
        F.box(
          "damask",
          -25.9,
          m(1.4),
          z - (ry ? -0.07 : 0.07) - 0.03,
          -6.1,
          m(7.6),
          z - (ry ? -0.07 : 0.07) + 0.03,
          { seg: false, grime: 0.3 },
        );
      }
      F.box("walnut_panel", -6.25, MY, -8.8, -6.15, m(1.4), 8.8, {
        seg: false,
      });
      F.box("damask", -6.21, m(1.4), -8.8, -6.18, m(7.6), -1.6, { seg: false });
      F.box("damask", -6.21, m(1.4), 1.6, -6.18, m(7.6), 8.8, { seg: false });
      F.box("walnut", -26, m(7.6), -9, -6, m(9), 9, { seg: false });
      // carved coffered ceiling: grid of beams with painted panels
      for (let x = -25; x <= -7; x += 2.25)
        F.box("walnut", x - 0.12, m(8.4), -9, x + 0.12, m(9), 9, {
          seg: false,
        });
      for (let z = -8; z <= 8; z += 2.25)
        F.box("walnut", -26, m(8.45), z - 0.12, -6, m(9), z + 0.12, {
          seg: false,
        });
      F.box("gilt_dull", -26, m(8.95), -9, -6, m(9), 9, { seg: false });
      // stained glass (west wall): three tall lancets glowing
      for (const [z, v] of [
        [-4, 0],
        [0, 1],
        [4, 2],
      ]) {
        const k = PM.stainedKey(v, 1.2);
        b.quad(k, X(-25.9), oy + m(4.6), Z(z), 1.5, 3.4, { ry: HP });
        F.box("walnut", -25.95, m(2.8), z - 0.9, -25.85, m(6.4), z - 0.78, {
          seg: false,
        });
        F.box("walnut", -25.95, m(2.8), z + 0.78, -25.85, m(6.4), z + 0.9, {
          seg: false,
        });
        PM.glow(
          P(-25.5, 4.6 + MY, z),
          [0xc080ff, 0xffb060, 0x60a0ff][v],
          2.2,
          root,
          { intensity: 0.7 },
        );
      }
      // Morgan's great desk, his chair, reading chairs, the fireplace and a portrait
      F.solid("walnut", -18, MY, -2.2, -13.6, m(0.8), -0.4);
      F.box("leather_red", -17.8, m(0.8), -2.0, -13.8, m(0.82), -0.6, {
        seg: false,
      });
      PM.tableLamp(b, X(-17.4), oy + m(0.82), Z(-1.8), root);
      PM.armchair(b, X(-15.8), oy + MY, Z(-3.2), 0, "leather_red");
      PM.armchair(b, X(-12.4), oy + MY, Z(3.6), PI + 0.5, "leather_red");
      PM.armchair(b, X(-19.4), oy + MY, Z(3.6), PI - 0.5, "leather_red");
      D.papers(b, X(-15.8), oy + m(0.83), Z(-1.3), 0.9, 8, 241);
      F.solid("marble_white", -18.4, MY, 8.2, -13.2, m(3.2), 8.8);
      F.box("iron", -17.2, MY, 8.1, -14.4, m(2.0), 8.2, {
        seg: false,
        c: 0x1a1410,
      });
      b.box("fire", X(-15.8), oy + MY + 0.02, Z(8.4), 2.2, 0.15, 0.4, {
        seg: false,
        noAO: true,
      });
      PM.glow(P(-15.8, MY + 0.4, 8.2), 0xff6a20, 1.5, root, {
        intensity: 1.2,
        flicker: 0.5,
      });
      D.painting(b, 1, X(-15.8), oy + m(5.2), Z(8.6), 2.2, 2.8, PI, {
        frame: "gilt",
      });
      for (let i = 0; i < 3; i++)
        PM.bookcase(
          b,
          X(-25.7),
          Z(-8.4 + i * 1.3 + (i > 1 ? 11.2 : 0)),
          X(-25.7),
          Z(-7.3 + i * 1.3 + (i > 1 ? 11.2 : 0)),
          oy + MY,
          oy + m(1.4),
          HP,
          { depth: 0.35 },
        );
      PM.bookcase(b, X(-11), Z(-8.6), X(-7), Z(-8.6), oy + MY, oy + m(2.2), 0, {
        depth: 0.4,
      });
      PM.vitrine(b, X(-9.5), oy + MY, Z(4.5), 1.4, 0.9, 0.5, 0.3);
      b.box("paint_cream", X(-9.5), oy + m(0.92), Z(4.5), 0.5, 0.06, 0.35, {
        ry: 0.5,
        seg: false,
      }); // an open manuscript
      PM.nest(b, X(-22), oy + MY + 0.02, Z(6), 0.9);
      PM.bonePile(b, X(-21), oy + MY, Z(4.5), 0.9, 12, 242);
      A.study = AN(-16, MY, 2, 0);
      A.study_safe = AN(-7.1, MY, -8.3, PI);
    }
    // the vault room (x -24..-15.5, z -20..-9): Morgan's steel treasure vault, stair down
    {
      W("vault_dark", "z", -20, -9, -24.2, -24, MY, m(4), []);
      W("vault_dark", "z", -20, -9, -15.4, -15.2, MY, m(4), []);
      W("vault_dark", "x", -24.2, -15.2, -20.2, -20, MY, m(4), []);
      F.box("vault_dark", -24.2, m(4), -20.2, -15.2, m(4.3), -9, {
        seg: false,
      });
      for (let i = 0; i < 3; i++) {
        F.box(
          "iron",
          -23.9,
          MY,
          -19.6 + i * 3.2,
          -23.5,
          m(3.2),
          -17.6 + i * 3.2,
          { seg: false },
        );
        for (let k = 0; k < 4; k++)
          F.box(
            "iron",
            -23.9,
            m(0.3 + k * 0.8),
            -19.6 + i * 3.2,
            -23.3,
            m(0.34 + k * 0.8),
            -17.6 + i * 3.2,
            { seg: false },
          );
      }
      for (let i = 0; i < 6; i++)
        b.box(
          r() < 0.5 ? "crate" : "leather_brown",
          X(-23.6),
          oy + m(0.34 + (i % 4) * 0.8),
          Z(-19.2 + i * 1.5),
          0.4,
          0.3,
          0.5,
          { seg: false },
        );
      PM.stairs(b, "granite", X(-20), Z(-17.8), 0, 1.8, 7.0, oy + BY, oy + MY, {
        base: oy + BY - 0.1,
      });
      F.rail(
        [
          [-21.05, -10.8],
          [-21.05, -18],
        ],
        MY,
        1.0,
        "iron",
      );
      F.rail(
        [
          [-18.95, -10.8],
          [-18.95, -18],
        ],
        MY,
        1.0,
        "iron",
      );
      F.rail(
        [
          [-21.05, -18],
          [-18.95, -18],
        ],
        MY,
        1.0,
        "iron",
      );
      b.quad(
        PM.labelKey(
          "morgan_vault",
          [
            "J. P. MORGAN — PRIVATE VAULT",
            "Stacks access below",
            "Authorised staff only",
          ],
          "brass",
          512,
          200,
        ),
        X(-18.3),
        oy + m(2.9),
        Z(-9.2),
        1.0,
        0.4,
        { ry: PI },
      );
      A.vault_room = AN(-17, MY, -12, 0);
      A.vault_door = AN(-21.0, MY, -9.0, 0);
    }

    // ================= THE STACKS (basement, y = BY, x -26..26, z -30..-4) =================
    {
      F.slab("concrete", -26, -30, 26, -4, BY, [], { th: 0.4 });
      F.box("concrete", -26.4, MY - 0.4, -30.4, 26.4, MY, -20, { seg: false });
      W("concrete_dark", "z", -30, -4, -26.4, -26, BY, MY - 0.4, []);
      W("concrete_dark", "z", -30, -4, 26, 26.4, BY, MY - 0.4, []);
      W("concrete_dark", "x", -26.4, 26.4, -30.4, -30, BY, MY - 0.4, []);
      W("concrete_dark", "x", -26.4, 26.4, -4.4, -4, BY, MY - 0.4, []);
      // compact shelving rows (double-sided book cases), aisles E-W
      const row = (x0, x1, z) => {
        PM.bookcase(
          b,
          X(x0),
          Z(z + 0.25),
          X(x1),
          Z(z + 0.25),
          oy + BY,
          oy + BY + 2.6,
          0,
          { depth: 0.25, books: "books_dark", frame: "steel", collide: false },
        );
        PM.bookcase(
          b,
          X(x1),
          Z(z - 0.25),
          X(x0),
          Z(z - 0.25),
          oy + BY,
          oy + BY + 2.6,
          PI,
          { depth: 0.25, books: "books_dark", frame: "steel", collide: false },
        );
        PM.colMM(X(x0), oy + BY, Z(z - 0.5), X(x1), oy + BY + 2.7, Z(z + 0.5), {
          walkable: false,
        });
      };
      for (const z of [-26, -22]) {
        row(-25, -15, z);
        row(-12, -2, z);
      }
      for (const z of [-18, -14]) {
        row(-25, -22, z);
        row(-18, -15, z);
        row(-12, -2, z);
      }
      for (const z of [-14, -10]) {
        row(1, 8, z);
      }
      row(-12, -2, -8);
      row(-25, -22.2, -8);
      // toppled shelf & book drifts, carts
      b.box("steel", X(-6), oy + BY + 0.3, Z(-20), 6, 0.5, 2.6, {
        rz: 0.1,
        rx: 1.25,
        seg: false,
      });
      for (let i = 0; i < 60; i++)
        b.box(
          r() < 0.5 ? "leather_red" : "leather_brown",
          X(-25 + r() * 48),
          oy + BY + 0.03,
          Z(-29 + r() * 24),
          0.22,
          0.05 + r() * 0.05,
          0.3,
          { ry: r() * TAU, seg: false },
        );
      for (const [x, z] of [
        [-13.5, -12],
        [0, -24],
        [12, -9],
      ]) {
        b.box("steel", X(x), oy + BY + 0.2, Z(z), 1.2, 0.05, 0.6, {
          seg: false,
        });
        b.box("steel", X(x), oy + BY + 0.8, Z(z), 1.2, 0.05, 0.6, {
          seg: false,
        });
        for (const sx of [-0.55, 0.55])
          b.box("steel", X(x + sx), oy + BY, Z(z), 0.04, 1.0, 0.55, {
            seg: false,
          });
      }
      // fluorescent tubes (some dead) and hanging cables
      for (const [x, z, lit] of [
        [-18, -24, 1],
        [-6, -16, 0],
        [-18, -12, 1],
        [6, -24, 1],
        [0, -8, 1],
        [18, -14, 0],
        [-14, -28, 1],
        [12, -18, 1],
      ])
        D.fluoro(b, X(x), oy + MY - 1.0, Z(z), 0, 1.4, !!lit, oy + MY - 0.4);
      // the glowing sludge: a ruptured pipe feeding a green pool (radiation)
      F.box("goo", 2, BY + 0.02, -28, 10, BY + 0.06, -21, {
        seg: false,
        noAO: true,
      });
      b.cyl("rust", X(9.5), oy + MY - 0.9, Z(-24), 0.25, 0.25, 12, 10, {
        hSeg: 2,
        rx: HP,
      });
      b.box(
        "lamp_green",
        X(9.5),
        oy + BY + 0.1,
        Z(-24.2),
        0.15,
        MY - BY - 1.1,
        0.1,
        { seg: false, noAO: true },
      );
      PM.glow(P(6, BY + 0.4, -24.5), 0x60ff40, 3.5, root, {
        intensity: 1.0,
        flicker: 0.1,
      });
      try {
        G.world.addRadSource({
          x: X(6),
          y: oy + BY,
          z: Z(-24.5),
          radius: 6,
          strength: 3,
        });
      } catch (e) {
        /* core */
      }
      PM.nest(b, X(-20), oy + BY + 0.02, Z(-28.5), 0.2);
      PM.nest(b, X(-8), oy + BY + 0.02, Z(-28.8), -0.2);
      PM.bonePile(b, X(-14), oy + BY, Z(-28.6), 1.2, 22, 251);
      PM.skeleton(b, X(4), oy + BY + 0.03, Z(-16), 1.9);
      b.quad(
        PM.labelKey(
          "morgan_stacks",
          [
            "STACK LEVEL B",
            "Rare Book Vault →",
            "Fire doors must remain CLOSED",
          ],
          "label",
          512,
          256,
        ),
        X(-2.5),
        oy + BY + 2.2,
        Z(-4.45),
        1.2,
        0.6,
        { ry: PI },
      );
      A.stacks_w = AN(-19, BY, -20, 0);
      A.stacks_c = AN(-7, BY, -24, 0);
      A.stacks_e = AN(18, BY, -12, 0);
      // service stair back up into the East Room
      PM.stairs(b, "concrete", X(19), Z(-11), PI, 1.8, 7.0, oy + BY, oy + MY, {
        base: oy + BY - 0.1,
      });
      void 0;
    }
    // ================= RARE BOOK VAULT (x 12..24, z -30..-19) =================
    {
      W("vault_steel", "z", -30, -19, 11.8, 12.2, BY, MY - 0.4, [
        { c: -24.5, w: 2.4, y0: BY, h: 2.8 },
      ]);
      W("vault_steel", "x", 12, 26, -19.2, -18.8, BY, MY - 0.4, []);
      F.box("vault_dark", 12.2, BY + 0.01, -30, 26, BY + 0.03, -19.2, {
        seg: false,
      });
      // the round vault door, swung open and jammed (decor), wheel
      b.cyl(
        "vault_steel",
        X(11.4),
        oy + BY + 1.5,
        Z(-26.3),
        1.5,
        1.5,
        0.45,
        24,
        { hSeg: 1, rz: HP, ry: -1.2 },
      );
      b.add("iron", new THREE.TorusGeometry(0.5, 0.06, 6, 16), {
        m: PM.m4(X(11.0), oy + BY + 1.5, Z(-26.6), -1.2 + HP),
      });
      // steel shelving with boxed manuscripts
      for (let i = 0; i < 3; i++) {
        F.box(
          "vault_steel",
          13 + i * 4,
          BY,
          -29.8,
          15.6 + i * 4,
          BY + 3,
          -29.3,
          { seg: false },
        );
        for (let k = 0; k < 4; k++)
          F.box(
            "vault_steel",
            13 + i * 4,
            BY + 0.4 + k * 0.7,
            -29.8,
            15.6 + i * 4,
            BY + 0.44 + k * 0.7,
            -29.1,
            { seg: false },
          );
        for (let k = 0; k < 10; k++)
          b.box(
            r() < 0.5 ? "crate" : "paint_cream",
            X(13.3 + i * 4 + r() * 2),
            oy + BY + 0.44 + Math.floor(r() * 4) * 0.7,
            Z(-29.5),
            0.35,
            0.28,
            0.4,
            { seg: false },
          );
      }
      PM.colMM(X(12.2), oy + BY, Z(-30), X(26), oy + BY + 3, Z(-29), {
        walkable: false,
      });
      // the lectern with the Bible under a glass bell, candles around it
      F.box("marble_white", 18.2, BY, -25.2, 20.2, BY + 0.3, -23.2, {
        seg: false,
      });
      b.box("walnut", X(19.2), oy + BY + 0.3, Z(-24.2), 0.5, 0.9, 0.5, {
        seg: false,
      });
      b.box("walnut", X(19.2), oy + BY + 1.2, Z(-24.2), 0.8, 0.08, 0.6, {
        rx: -0.3,
        seg: false,
      });
      b.cyl(
        "glass_dark",
        X(19.2),
        oy + BY + 1.25,
        Z(-24.2),
        0.45,
        0.5,
        0.7,
        14,
        { hSeg: 1, open: true, noAO: true },
      );
      PM.col(X(19.2), Z(-24.2), 1.0, 1.0, oy + BY, oy + BY + 1.9, 0, {
        walkable: false,
      });
      for (const [dx, dz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        PM.candles(
          b,
          X(19.2 + dx * 1.1),
          oy + BY + 0.3,
          Z(-24.2 + dz * 1.1),
          2,
          dx * 7 + dz,
          root,
        );
      A.bible = AN(19.2, BY + 1.36, -24.1, 0);
      A.boss = AN(21.5, BY, -21.5, PI);
      A.vault_loot = AN(24.8, BY, -27.5, -HP);
      PM.bonePile(b, X(23), oy + BY, Z(-20.5), 1.2, 18, 261);
      b.quad(
        PM.labelKey(
          "morgan_rbv",
          [
            "RARE BOOK VAULT",
            "NO FOOD · NO DRINK · NO FLAME",
            "NO EXCEPTIONS",
            "— B. da C. Greene",
          ],
          "brass",
          512,
          256,
        ),
        X(12.25),
        oy + BY + 2.6,
        Z(-22),
        1.2,
        0.6,
        { ry: HP },
      );
    }

    b.build(root);
    return A;
  }

  // ===================================================================
  // CONTENT: items, terminal, notes
  // ===================================================================
  PM.item({
    id: "pm2_gutenberg",
    type: "misc",
    quest: true,
    name: "Gutenberg Bible (Morgan copy, Vol. I)",
    weight: 6,
    value: 1000,
    desc: "Printed in Mainz around 1455 — one of the first books made with movable type, and one of three the Morgan owned. The pages are sound. A radioactive glow clings faintly to the binding.",
  });
  PM.item({
    id: "pm2_morgan_combo",
    type: "key",
    name: "Vault Combination (index card)",
    weight: 0,
    value: 0,
    learn: "pm2_morgan_vault",
    desc: 'A library index card in a precise hand: "MORGAN VAULT — 12 · 04 · 37. Burn after reading. (Do NOT burn the library.) — B.G."',
  });
  PM.item({
    id: "pm2_morgan_glasses",
    type: "apparel",
    slot: "eyes",
    name: "Morgan's Reading Spectacles",
    weight: 0,
    value: 150,
    attrs: { wits: 1 },
    skills: { electronics: 5 },
    desc: "Gold pince-nez left on the highest tier of the East Room. The world looks smaller and better organised through them. +1 Wits, +5 Electronics.",
  });
  PM.item({
    id: "pm2_reel_greene",
    type: "tape",
    name: 'Tape reel: "The Director, Mar. 4"',
    title: "Director's Dictation — March 4, 1967",
    text: '[A clipped, amused voice.]\n\nMemo to the trustees. The Civil Defense gentleman has again requested the Bibles "for safekeeping underground". I have again declined. He asked what I intend to do if the bombs fall. I told him I intend to be in the Rare Book Vault with the door shut, which is more than can be said for his.\n\nThe Bibles go down to the vault tonight. The combination is on a card in my desk, in the only place no one ever looks: under a book.\n\nIf anyone finds this: the collection is not for sale. It never was. Read it.\n\n[End of dictation.]',
  });
  PM.item({
    id: "pm2_note_page",
    type: "note",
    name: "A Page of Blank Verse",
    title: "Found in the East Room, tucked into a ledger",
    text: "Three tiers of books and none of them read\nSince the lights went out and the readers went dead.\nThe Maniacs are the only patrons now —\nthey shelve by screaming. I don't know how.\n\n— left by a scavenger who did not come back for it",
  });

  PM.terminal("pm2_term_morgan", {
    title: "PIERPONT MORGAN LIBRARY — DIRECTOR'S TELELINK",
    header: "Office of the Director · Collections Security",
    lock: PM.LOCKS.morgan_term,
    entries: [
      {
        title: "Mr. Morgan's safe",
        learn: "pm2_morgan_safe",
        text: "The study safe keeps Mr. Morgan's own combination, 1-9-0-6 — the year the library was finished. My dictation tapes are in it.",
      },
      {
        title: "Collections log — Mar 4, 1967",
        text: "Gutenberg Bibles (3): removed from East Room vitrines to the Rare Book Vault, Stack Level B.\nAccess: through Mr. Morgan's private vault in the West Room.\nVault combination held by the Director.\n\nCivil Defense representative escorted from the premises (twice).",
      },
      {
        title: "Staff notice: the stacks",
        text: "The ventilation in Stack Level B has been making a noise like breathing. Maintenance says it is the pipes. Maintenance has not been down there since Tuesday.",
      },
      {
        title: "Staff notice: the East Room",
        text: "Reminder: the hidden staircase in the East Room (south-east corner, third bookcase) is for staff only. It is not a secret. It is a staircase. Please stop pretending to be in a novel.",
      },
      {
        title: "Release West Room vault lock",
        text: "Time lock on the private vault: DISENGAGED.\n\nThe Director would like to remind whoever is reading this that she is watching.",
        action() {
          PM.setFlag("morgan_combo", true);
          PM.unlockDoor("pm2_morgan_vault");
          G.notify("The West Room vault door unlocks with a heavy clunk.");
        },
      },
    ],
  });

  // ===================================================================
  // BUILDER
  // ===================================================================
  PM.addBuilder(
    "morgan_library",
    function (PM2, site, root) {
      const ext = buildExterior(site, root);
      const cell = PM.cell("morgan_library");
      const int = buildInterior(cell);
      const O = cell.origin;
      PM.door({
        id: "pm2_morgan_enter",
        pos: V3((MX0 + MX1) / 2, PL + 1.6, FZ - 2.8),
        label: "The Morgan Library",
        verb: "Enter",
        radius: 1.5,
        target: {
          x: int.entrance.x,
          y: int.entrance.y + 0.05,
          z: int.entrance.z,
          yaw: 0,
        },
        sound: "door_open",
      });
      PM.door({
        id: "pm2_morgan_exit",
        pos: int.exit_door,
        label: "Madison Avenue",
        verb: "Exit",
        radius: 1.4,
        target: { x: ext.door.x, y: ext.door.y + 0.05, z: ext.door.z, yaw: PI },
        sound: "door_open",
      });
      // the secret bookcase: pivots on its centre to reveal the spiral stair tower
      {
        const mesh = new THREE.Group();
        const bk = new THREE.BoxGeometry(2.1, 2.55, 0.3);
        const addPart = (key, geo, x, y, z) => {
          const n = geo.attributes.position.count;
          geo.setAttribute(
            "color",
            new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3),
          );
          const uv = geo.attributes.uv;
          for (let i = 0; i < uv.count; i++)
            uv.setXY(i, (uv.getX(i) * 2.1) / 1.2, (uv.getY(i) * 2.55) / 1.2);
          const mm = new THREE.Mesh(geo, PM.mat(key));
          mm.position.set(x, y, z);
          mesh.add(mm);
        };
        addPart("walnut", bk, 0, 1.275, 0);
        addPart("books", new THREE.BoxGeometry(1.9, 2.3, 0.04), 0, 1.25, -0.17);
        addPart("books", new THREE.BoxGeometry(1.9, 2.3, 0.04), 0, 1.25, 0.17);
        PM.swingDoor({
          id: "pm2_morgan_bookcase",
          x: O.x + 22.3,
          y: O.y + MY,
          z: O.z + 7.1,
          ry: HP,
          w: 2.2,
          h: 2.6,
          t: 0.3,
          mesh,
          pivot: "centre",
          openAngle: 1.35,
          label: "Suspicious Bookcase",
          parent: cell.root,
          sound: "door_open",
          onOpen: () => {
            if (!PM.flag("morgan_bookcase")) {
              PM.setFlag("morgan_bookcase", true);
              PM.xp(25, "Found the hidden stair");
              G.notify(
                "The bookcase swings aside. A spiral stair climbs into the dark.",
              );
            }
          },
        });
      }
      // the West Room vault door (round steel): the combination card / its code, or the Director's teletype release
      {
        const mesh = new THREE.Group();
        const disc = new THREE.CylinderGeometry(1.25, 1.25, 0.35, 24);
        disc.rotateX(HP);
        const mk = (key, g, x, y, z) => {
          const n = g.attributes.position.count;
          g.setAttribute(
            "color",
            new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3),
          );
          const mm = new THREE.Mesh(g, PM.mat(key));
          mm.position.set(x, y, z);
          mesh.add(mm);
        };
        mk("vault_steel", disc, 1.25, 1.3, 0);
        mk("iron", new THREE.TorusGeometry(0.45, 0.05, 6, 16), 1.25, 1.3, 0.22);
        for (let k = 0; k < 3; k++) {
          const g = new THREE.BoxGeometry(0.9, 0.06, 0.06);
          g.rotateZ((k * PI) / 3);
          mk("iron", g, 1.25, 1.3, 0.22);
        }
        mk(
          "brass",
          new THREE.CylinderGeometry(0.12, 0.12, 0.1, 10).rotateX(HP),
          0.6,
          1.3,
          0.22,
        );
        PM.swingDoor({
          id: "pm2_morgan_vault",
          x: O.x - 21.0,
          y: O.y + MY,
          z: O.z - 9.0,
          ry: 0,
          w: 2.5,
          h: 2.6,
          t: 0.4,
          mesh,
          openAngle: 1.45,
          lock: PM.LOCKS.morgan_vault,
          label: "Morgan's Private Vault",
          parent: cell.root,
          sound: "cryo_door",
        });
      }
      const all = Object.assign({}, int, { exterior_entrance: ext.door });
      all.spawn1 = int.rotunda;
      all.spawn2 = int.east_room;
      all.spawn3 = int.study;
      all.spawn4 = int.stacks_w;
      all.spawn5 = int.stacks_c;
      all.spawn6 = int.stacks_e;
      all.loot1 = int.vault_loot;
      all.loot2 = int.upper_tier;
      all.loot3 = int.study_safe;
      all.terminal = int.north_terminal;
      PM.register("morgan_library", root, all, {
        interiorRoot: cell.root,
        interiorKey: "morgan_library",
      });

      // props & pickups
      PM.prop("terminal", {
        x: int.north_terminal.x,
        y: int.north_terminal.y,
        z: int.north_terminal.z,
        yaw: PI,
        terminalId: "pm2_term_morgan",
        id: "pm2_morgan_term",
        name: "Director's Terminal",
      });
      PM.prop("safe", {
        x: int.study_safe.x,
        y: int.study_safe.y + 0.6,
        z: int.study_safe.z + 0.1,
        yaw: PI,
        locked: 0,
        lock: PM.LOCKS.morgan_safe,
        loot: "wall_safe",
        items: [
          ["pm2_reel_greene", 1],
          ["old_dollars", 8],
        ],
        id: "pm2_morgan_study_safe",
        name: "Mr. Morgan's Safe",
      });
      PM.prop("footlocker", {
        x: int.vault_loot.x,
        y: int.vault_loot.y,
        z: int.vault_loot.z,
        yaw: -HP,
        loot: "wall_safe",
        items: [
          ["gold_bar", 1],
          ["book_popular_circuits", 1],
          ["rally_tonic", 2],
          ["prussian_blue", 1],
        ],
        id: "pm2_morgan_vault_chest",
        name: "Rare Book Vault Strongbox",
      });
      PM.prop("footlocker", {
        x: O.x - 17,
        y: O.y + MY,
        z: O.z - 19.3,
        yaw: 0,
        loot: "luggage",
        id: "pm2_morgan_treasure",
        name: "Morgan's Curio Chest",
      });
      PM.prop("desk", {
        x: O.x + 12,
        y: O.y + MY + T3,
        z: O.z + 8.2,
        yaw: 0,
        loot: "books",
        id: "pm2_morgan_tier_desk",
        name: "Reading Desk",
      });
      PM.prop("first_aid", {
        x: O.x + 25.7,
        y: O.y + BY + 1.4,
        z: O.z - 8,
        yaw: -HP,
        loot: "first_aid",
        id: "pm2_morgan_stacks_aid",
        name: "First Aid Box",
      });
      PM.prop("file_cabinet", {
        x: O.x + 4.8,
        y: O.y + MY,
        z: O.z - 19.2,
        yaw: 0,
        loot: "file_cabinet",
        id: "pm2_morgan_files",
        name: "Acquisitions Files",
      });
      PM.pickup("pm2_gutenberg", 1, V3(int.bible.x, int.bible.y, int.bible.z));
      PM.pickup(
        "pm2_morgan_combo",
        1,
        V3(int.combo_note.x, int.combo_note.y, int.combo_note.z),
      );
      PM.pickup(
        "pm2_morgan_glasses",
        1,
        V3(O.x + 16, O.y + MY + T3 + 0.05, O.z - 8.1),
      );
      PM.pickup(
        "book_bellevue_manual",
        1,
        V3(O.x + 9, O.y + MY + T2 + 0.05, O.z + 8.2),
      );
      PM.pickup("pm2_note_page", 1, V3(O.x + 20.4, O.y + MY + 0.82, O.z + 0.2));
      PM.pickup("prussian_blue", 1, V3(O.x - 13, O.y + BY + 0.05, O.z - 12));

      // hostiles: named Maniacs + Dewey, the night librarian (a Maniac Bruiser)
      const MAN = {
        type: "maniac",
        faction: "maniacs",
        hostile: true,
        ai: "guard",
        noRespawn: true,
      };
      const at = (a, dx, dz) => ({
        x: a.x + (dx || 0),
        y: a.y + 0.05,
        z: a.z + (dz || 0),
      });
      PM.npc(
        Object.assign({}, MAN, {
          id: "pm2_morgan_dewey",
          type: "maniac_bruiser",
          name: "Dewey, the Night Librarian",
          level: 10,
          hp: 320,
          pos: at(int.boss),
          yaw: PI,
          home: { x: int.boss.x, z: int.boss.z, r: 6 },
          when: () => !PM.flag("morgan_dewey_dead"),
          barks: ["Shhhhhh...", "[a low, rattling hiss]"],
          onDeath: () => {
            PM.setFlag("morgan_dewey_dead", true);
          },
        }),
      );
      PM.npc(
        Object.assign({}, MAN, {
          id: "pm2_morgan_borrower",
          name: "The Borrower",
          level: 6,
          pos: at(int.east_room, 3, -3),
          home: { x: int.east_room.x, z: int.east_room.z, r: 7 },
        }),
      );
      PM.npc(
        Object.assign({}, MAN, {
          id: "pm2_morgan_overdue",
          name: "Overdue",
          level: 6,
          pos: at(int.stacks_c),
          home: { x: int.stacks_c.x, z: int.stacks_c.z, r: 8 },
        }),
      );
      PM.npc(
        Object.assign({}, MAN, {
          id: "pm2_morgan_latefee",
          name: "Late Fee",
          level: 5,
          pos: at(int.study, -3, 3),
          home: { x: int.study.x, z: int.study.z, r: 6 },
        }),
      );
      PM.npc(
        Object.assign({}, MAN, {
          id: "pm2_morgan_reader",
          name: "Silent Reader",
          level: 6,
          pos: at(int.upper_tier, 2, 0.3),
          home: { x: int.upper_tier.x, z: int.upper_tier.z, r: 5 },
        }),
      );
    },
    30,
  );
})();
