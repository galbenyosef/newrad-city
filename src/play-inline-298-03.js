// play-inline-298 03 — seg
// Lines 149-731 of readable/play-inline-298.pretty.js (statement-aligned).
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
