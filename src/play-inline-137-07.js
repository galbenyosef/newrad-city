// play-inline-137 07 — math
// Lines 2060-2883 of readable/play-inline-137.pretty.js (statement-aligned).
  LB.addBuilder(
    "city_hall",
    function (LB, site, root) {
      const K = LB.kit;
      const b = LB.batch("city_hall");
      b.ground = 0;
      b.aoH = 3;
      const anchors = {};
      const CX = 80,
        ZF = 612; // building centre x, south facade z
      const W0 = 56,
        W1 = 104,
        ZB = 592; // extents
      const H1 = 12.5; // two storeys
      // podium steps across the front
      for (let i = 0; i < 4; i++) {
        b.boxMM(
          "marble",
          W0 - 1 + i * 0.3,
          0,
          ZB - 1,
          W1 + 1 - i * 0.3,
          0.3 * (i + 1),
          ZF + 6 - i * 0.6,
          { grime: 0.5 },
        );
        LB.colMM(
          W0 - 1 + i * 0.3,
          0,
          ZB - 1,
          W1 + 1 - i * 0.3,
          0.3 * (i + 1),
          ZF + 6 - i * 0.6,
        );
      }
      const FY = 1.2;
      // ---- wings & end pavilions: solid marble masses (+ attic parapet); the elevations are modelled by chElev()
      const DMG0 = 98.4,
        DMG1 = 102.8; // shell burst through the east pavilion's upper storey & roofline
      const wing = (x0, x1, z1, gap) => {
        b.boxMM("marble", x0, FY, ZB, x1, FY + H1, z1, {
          grime: 0.45,
          segLen: 4,
        });
        LB.colMM(x0, FY, ZB, x1, FY + H1 + 0.6, z1, { walkable: false });
        const px0 = x0 - 0.35,
          px1 = x1 + 0.35,
          pz0 = ZB - 0.35,
          pz1 = z1 + 0.35,
          y0 = FY + H1,
          y1 = y0 + 0.6;
        if (!gap) {
          b.boxMM("marble", px0, y0, pz0, px1, y1, pz1, {
            seg: false,
            grime: 0.4,
          });
          return;
        }
        b.boxMM("marble", px0, y0, pz0, px1, y1, pz1 - 3.2, {
          seg: false,
          grime: 0.4,
        });
        b.boxMM("marble", px0, y0, pz1 - 3.2, gap[0], y1, pz1, {
          seg: false,
          grime: 0.5,
        });
        b.boxMM("marble", gap[1], y0, pz1 - 3.2, px1, y1, pz1, {
          seg: false,
          grime: 0.5,
        });
        b.boxMM(
          "concrete_dark",
          gap[0],
          y0 - 0.3,
          pz1 - 3.2,
          gap[1],
          y0 + 0.08,
          z1 - 0.2,
          { seg: false, grime: 1 },
        ); // burnt-out roof
      };
      wing(W0, 64, ZF + 1.5);
      wing(96, W1, ZF + 1.5, [DMG0, DMG1]); // end pavilions project 1.5 m
      wing(64, 72, ZF);
      wing(88, 96, ZF);
      // elevations: arched ground-floor windows between Ionic pilasters, pedimented upper windows between Corinthian
      // pilasters, two entablatures + modillioned cornice (front), same order without pediments on the sides & rear
      chElev(b, [W0, ZF + 1.5], [1, 0], [0, 1], 8, 3, { FY, seed: 11 });
      chElev(b, [64, ZF], [1, 0], [0, 1], 8, 3, { FY, seed: 12 });
      chElev(b, [88, ZF], [1, 0], [0, 1], 8, 3, { FY, seed: 13 });
      chElev(b, [96, ZF + 1.5], [1, 0], [0, 1], 8, 3, {
        FY,
        seed: 14,
        breach: [DMG0 - 96, DMG1 - 96],
      });
      chElev(b, [W0, ZF + 1.5], [0, -1], [-1, 0], ZF + 1.5 - ZB, 7, {
        FY,
        seed: 15,
      });
      chElev(b, [W1, ZB], [0, 1], [1, 0], ZF + 1.5 - ZB, 7, { FY, seed: 16 });
      chElev(b, [W1, ZB], [-1, 0], [0, -1], W1 - W0, 15, {
        FY,
        seed: 17,
        plain: true,
      });
      // balustrade + urns on the roofline (broken where the shell came through)
      const BY = FY + H1 + 0.6;
      K.balustrade(
        b,
        "marble",
        [
          [W0 - 0.3, ZF + 1.8],
          [64, ZF + 1.8],
          [64, ZF + 0.3],
          [96, ZF + 0.3],
          [96, ZF + 1.8],
          [DMG0 - 0.3, ZF + 1.8],
        ],
        BY,
        1.0,
        { urns: true },
      );
      K.balustrade(
        b,
        "marble",
        [
          [DMG1 + 0.4, ZF + 1.8],
          [W1 + 0.3, ZF + 1.8],
        ],
        BY,
        1.0,
        { urns: true },
      );
      K.balustrade(
        b,
        "marble",
        [
          [W0 - 0.3, ZB - 0.3],
          [W1 + 0.3, ZB - 0.3],
        ],
        BY,
        1.0,
        {},
      );
      K.balustrade(
        b,
        "marble",
        [
          [W0 - 0.3, ZB - 0.3],
          [W0 - 0.3, ZF + 1.8],
        ],
        BY,
        1.0,
        {},
      );
      K.balustrade(
        b,
        "marble",
        [
          [W1 + 0.3, ZB - 0.3],
          [W1 + 0.3, ZF + 1.8],
        ],
        BY,
        1.0,
        {},
      );
      // central pavilion: walk-in rotunda at ground level, portico, upper floor
      const CP0 = 72,
        CP1 = 88;
      K.room(
        b,
        "marble",
        CP0,
        ZB,
        CP1,
        ZF,
        FY,
        FY + 6.2,
        0.8,
        [{ side: "s", c: CX, w: 3.2, h: 4.2 }],
        { grime: 0.4 },
      );
      b.boxMM("marble", CP0, FY + 6.2, ZB, CP1, FY + H1 + 0.6, ZF, {
        grime: 0.4,
      });
      LB.colMM(CP0, FY + 6.2, ZB, CP1, FY + H1 + 0.6, ZF, { walkable: false });
      // ---- the walk-in rotunda (lit batch, the Mayor's desk, rotunda anchors): 30_downtown_interior.js
      const ix = { root, anchors, CX, FY, ZB, ZF, CP0, CP1 };
      LB.interiorPart("city_hall", "rotunda", ix);
      // portico: 8 columns across, entablature, pediment-less balustrade (City Hall has none), clock cupola
      K.colonnade(
        b,
        "marble",
        CP0 + 0.8,
        ZF + 3.2,
        CP1 - 0.8,
        ZF + 3.2,
        FY,
        5.8,
        8,
        0.32,
        {},
      );
      b.boxMM("marble", CP0, FY + 5.8, ZF, CP1, FY + 6.6, ZF + 4, {
        seg: false,
        grime: 0.35,
      });
      LB.colMM(CP0, FY + 5.8, ZF, CP1, FY + 6.6, ZF + 4);
      K.colonnade(
        b,
        "marble",
        CP0 + 0.8,
        ZF + 3.2,
        CP1 - 0.8,
        ZF + 3.2,
        FY + 6.6,
        5.4,
        8,
        0.28,
        { collide: false },
      );
      b.boxMM("marble", CP0, FY + 12.0, ZF, CP1, FY + 12.9, ZF + 4, {
        seg: false,
        grime: 0.35,
      });
      K.balustrade(
        b,
        "marble",
        [
          [CP0, ZF + 3.8],
          [CP1, ZF + 3.8],
        ],
        FY + 12.9,
        0.9,
        { urns: true },
      );
      // loggia back wall: the arched main door between two blind arches (lower), three arched windows (upper),
      // pilaster responds behind every column, a coffered soffit under the balcony slab
      {
        const arch = (x, ySpring, ra, depth) => {
          const sh = new THREE.Shape();
          sh.absarc(0, 0, ra + 0.26, 0, Math.PI, false);
          sh.lineTo(-ra, 0);
          sh.absarc(0, 0, ra, Math.PI, 0, true);
          sh.lineTo(ra + 0.26, 0);
          b.add(
            "marble",
            new THREE.ExtrudeGeometry(sh, {
              depth: depth || 0.18,
              bevelEnabled: false,
              curveSegments: 7,
            }),
            { m: LB.m4(x, ySpring, ZF), grime: 0.35 },
          );
          b.box("marble", x, ySpring + ra - 0.1, ZF + 0.12, 0.4, 0.52, 0.26, {
            seg: false,
            grime: 0.3,
          }); // keystone
        };
        b.add("glass_dark", new THREE.CircleGeometry(1.6, 12, 0, Math.PI), {
          m: LB.m4(CX, FY + 4.2, ZF + 0.02),
          uv: "box",
          noAO: true,
          grime: 0.1,
        });
        for (let k = -2; k <= 2; k++)
          b.box(
            "iron",
            CX + k * 0.4,
            FY + 4.2,
            ZF + 0.04,
            0.05,
            Math.sqrt(Math.max(0, 1.6 * 1.6 - k * 0.4 * (k * 0.4))),
            0.03,
            { seg: false, grime: 0 },
          );
        arch(CX, FY + 4.2, 1.6);
        for (const dx of [-5.2, 5.2]) {
          b.quad("planks", CX + dx, FY + 2.5, ZF + 0.02, 2.2, 3.4, {
            uv: "box",
            noAO: true,
          });
          b.add("glass_dark", new THREE.CircleGeometry(1.1, 10, 0, Math.PI), {
            m: LB.m4(CX + dx, FY + 4.2, ZF + 0.02),
            uv: "box",
            noAO: true,
            grime: 0.1,
          });
          for (const sd of [-1, 1])
            b.box(
              "marble",
              CX + dx + sd * 1.22,
              FY + 0.8,
              ZF + 0.08,
              0.24,
              3.4,
              0.16,
              { seg: false },
            );
          arch(CX + dx, FY + 4.2, 1.1);
        }
        for (const dx of [-5.2, 0, 5.2]) {
          const g2 = dx === 0 ? "glass_broken" : "glass_dark";
          b.quad(g2, CX + dx, FY + 8.6, ZF + 0.02, 1.9, 2.8, {
            uv: "box",
            noAO: true,
          });
          b.add(g2, new THREE.CircleGeometry(0.95, 10, 0, Math.PI), {
            m: LB.m4(CX + dx, FY + 10.0, ZF + 0.02),
            uv: "box",
            noAO: true,
            grime: 0.1,
          });
          arch(CX + dx, FY + 10.0, 0.95, 0.14);
          b.box("marble", CX + dx, FY + 7.0, ZF + 0.15, 2.6, 0.2, 0.3, {
            seg: false,
          });
        }
        for (let i = 0; i < 8; i++) {
          const x = CP0 + 0.8 + ((CP1 - CP0 - 1.6) * i) / 7;
          b.box("marble", x, FY, ZF + 0.12, 0.62, 5.8, 0.24, {
            seg: false,
            grime: 0.4,
          });
          b.box("marble", x, FY + 6.6, ZF + 0.1, 0.55, 5.4, 0.2, {
            seg: false,
            grime: 0.35,
          });
        }
        for (let i = 0; i < 7; i++)
          b.boxMM(
            "marble",
            CP0 + 1.0 + i * 2.05,
            FY + 5.62,
            ZF + 0.3,
            CP0 + 2.7 + i * 2.05,
            FY + 5.8,
            ZF + 3.7,
            { seg: false, grime: 0.6 },
          );
        // Mayoral Security loudhailers on the portico
        for (const sx of [-1, 1]) {
          b.box("iron", CX + sx * 7.2, FY + 5.0, ZF + 3.4, 0.1, 0.8, 0.1, {
            seg: false,
          });
          b.cyl(
            "paint_cream",
            CX + sx * 7.2,
            FY + 5.0,
            ZF + 3.75,
            0.32,
            0.08,
            0.7,
            8,
            { hSeg: 1, rx: Math.PI / 2, open: true },
          );
        }
      }
      // cupola (the 1812 design, the silhouette that reads across the park): square attic base with a balustrade,
      // clock stage with a pediment on every face, Corinthian peristyle round the drum, ribbed copper dome, lantern,
      // and Justice (weathered bronze, scales raised, sword lowered).
      const CY = FY + H1 + 0.6,
        CZ = 602;
      b.boxMM("marble", CX - 4.7, CY, CZ - 4.7, CX + 4.7, CY + 3.2, CZ + 4.7, {
        grime: 0.4,
      });
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.box("marble", CX + sx * 4.55, CY, CZ + sz * 4.55, 0.95, 3.2, 0.95, {
          seg: false,
          grime: 0.35,
        });
      b.boxMM(
        "marble",
        CX - 5.0,
        CY + 3.2,
        CZ - 5.0,
        CX + 5.0,
        CY + 3.55,
        CZ + 5.0,
        { seg: false, grime: 0.4 },
      );
      K.balustrade(
        b,
        "marble",
        [
          [CX - 4.75, CZ - 4.75],
          [CX + 4.75, CZ - 4.75],
          [CX + 4.75, CZ + 4.75],
          [CX - 4.75, CZ + 4.75],
          [CX - 4.75, CZ - 4.75],
        ],
        CY + 3.55,
        0.8,
        { urns: true },
      );
      const C2 = CY + 3.55; // clock stage
      b.boxMM("marble", CX - 3.5, C2, CZ - 3.5, CX + 3.5, C2 + 4.4, CZ + 3.5, {
        grime: 0.35,
      });
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.box("marble", CX + sx * 3.45, C2, CZ + sz * 3.45, 0.75, 4.4, 0.75, {
          seg: false,
          grime: 0.3,
        });
      b.boxMM(
        "marble",
        CX - 3.9,
        C2 + 4.4,
        CZ - 3.9,
        CX + 3.9,
        C2 + 4.75,
        CZ + 3.9,
        { seg: false, grime: 0.4 },
      );
      const clockK = LB.texMat(
        "cityhall_clock",
        LB.canvasTex("lb_clock", 256, 256, (ctx, w, h) => {
          ctx.fillStyle = "#d8d0b8";
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2 - 4, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#2a2418";
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.fillStyle = "#2a2418";
          ctx.font = "bold 26px Georgia";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const nums = [
            "XII",
            "I",
            "II",
            "III",
            "IIII",
            "V",
            "VI",
            "VII",
            "VIII",
            "IX",
            "X",
            "XI",
          ];
          nums.forEach((n, i) => {
            const a = (i / 12) * TAU - Math.PI / 2;
            ctx.fillText(n, w / 2 + Math.cos(a) * 96, h / 2 + Math.sin(a) * 96);
          });
          // hands frozen at 9:47 (the hour the bombs fell, give or take)
          ctx.lineWidth = 9;
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2);
          ctx.lineTo(
            w / 2 + Math.cos((9.78 / 12) * TAU - Math.PI / 2) * 60,
            h / 2 + Math.sin((9.78 / 12) * TAU - Math.PI / 2) * 60,
          );
          ctx.stroke();
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2);
          ctx.lineTo(
            w / 2 + Math.cos((47 / 60) * TAU - Math.PI / 2) * 86,
            h / 2 + Math.sin((47 / 60) * TAU - Math.PI / 2) * 86,
          );
          ctx.stroke();
          ctx.fillStyle = "rgba(60,50,30,0.25)";
          ctx.fillRect(0, h * 0.55, w, h * 0.45);
        }),
        { transparent: true },
      );
      for (let f = 0; f < 4; f++) {
        const ry = (f * Math.PI) / 2,
          s = Math.sin(ry),
          c = Math.cos(ry);
        b.quad(clockK, CX + s * 3.53, C2 + 2.2, CZ + c * 3.53, 2.6, 2.6, {
          ry,
          grime: 0.1,
        });
        b.add("marble", new THREE.TorusGeometry(1.36, 0.12, 4, 20), {
          m: LB.m4(CX + s * 3.56, C2 + 2.2, CZ + c * 3.56, ry),
          grime: 0.3,
        });
        K.pediment(
          b,
          "marble",
          CX + s * 3.3,
          C2 + 5.25,
          CZ + c * 3.3,
          7.0,
          1.15,
          0.6,
          ry,
          {},
        );
      }
      const C3 = C2 + 4.75; // peristyle
      b.cyl("marble", CX, C3, CZ, 3.9, 4.0, 0.4, 24, { hSeg: 1 });
      b.cyl("marble", CX, C3 + 0.4, CZ, 2.6, 2.6, 3.9, 16, {
        hSeg: 1,
        grime: 0.5,
      });
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        b.quad(
          "glass_dark",
          CX + Math.sin(a) * 2.62,
          C3 + 2.2,
          CZ + Math.cos(a) * 2.62,
          1.0,
          2.4,
          { ry: a, noAO: true },
        );
      }
      for (let i = 0; i < 12; i++) {
        const a = ((i + 0.5) / 12) * TAU;
        K.column(
          b,
          "marble",
          CX + Math.cos(a) * 3.4,
          C3 + 0.4,
          CZ + Math.sin(a) * 3.4,
          3.9,
          0.19,
          { collide: false },
        );
      }
      b.cyl("marble", CX, C3 + 4.3, CZ, 3.72, 3.62, 0.7, 24, {
        hSeg: 1,
        grime: 0.35,
      });
      b.cyl("marble", CX, C3 + 5.0, CZ, 3.95, 3.95, 0.25, 24, { hSeg: 1 });
      b.cyl("marble", CX, C3 + 5.25, CZ, 3.1, 3.3, 0.8, 24, {
        hSeg: 1,
        grime: 0.4,
      });
      const DY = C3 + 6.05,
        DR = 3.1; // ribbed copper dome
      b.sphere("copper_roof", CX, DY, CZ, DR, {
        phiLen: Math.PI / 2,
        ws: 24,
        hs: 8,
        sy: 0.95,
      });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        for (let k = 0; k < 4; k++) {
          const e0 = (((k / 4) * Math.PI) / 2) * 0.92,
            e1 = ((((k + 1) / 4) * Math.PI) / 2) * 0.92,
            R = DR + 0.04;
          b.beam(
            "copper_roof",
            V(
              CX + Math.cos(a) * R * Math.cos(e0),
              DY + R * 0.95 * Math.sin(e0),
              CZ + Math.sin(a) * R * Math.cos(e0),
            ),
            V(
              CX + Math.cos(a) * R * Math.cos(e1),
              DY + R * 0.95 * Math.sin(e1),
              CZ + Math.sin(a) * R * Math.cos(e1),
            ),
            0.16,
            0.12,
            { grime: 0.2 },
          );
        }
      }
      const LY = DY + DR * 0.95 - 0.25; // lantern
      b.cyl("marble", CX, LY, CZ, 1.05, 1.15, 0.3, 12, { hSeg: 1 });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        b.cyl(
          "marble",
          CX + Math.cos(a) * 0.82,
          LY + 0.3,
          CZ + Math.sin(a) * 0.82,
          0.09,
          0.1,
          1.3,
          6,
          { hSeg: 1 },
        );
      }
      b.cyl("glass_dark", CX, LY + 0.3, CZ, 0.66, 0.66, 1.3, 8, { hSeg: 1 });
      b.cyl("marble", CX, LY + 1.6, CZ, 1.08, 0.98, 0.25, 12, { hSeg: 1 });
      b.sphere("copper_roof", CX, LY + 1.85, CZ, 0.98, {
        phiLen: Math.PI / 2,
        ws: 12,
        hs: 4,
        sy: 0.9,
      });
      b.cyl("copper_roof", CX, LY + 2.6, CZ, 0.32, 0.5, 0.45, 8, { hSeg: 1 });
      // Justice (faces the park): robe, torso, head, scales raised in her left hand, sword lowered in her right
      const JY = LY + 3.05,
        jb = "bronze";
      b.lathe(
        jb,
        [
          [0.46, 0],
          [0.44, 0.25],
          [0.36, 0.9],
          [0.27, 1.4],
          [0.22, 1.58],
          [0.001, 1.6],
        ],
        10,
        CX,
        JY,
        CZ,
        { grime: 0.3 },
      );
      b.cyl(jb, CX, JY + 1.5, CZ, 0.2, 0.25, 0.62, 8, { hSeg: 1 });
      b.box(jb, CX, JY + 1.98, CZ, 0.62, 0.16, 0.26, { seg: false });
      b.cyl(jb, CX, JY + 2.1, CZ, 0.07, 0.08, 0.14, 6, { hSeg: 1 });
      b.sphere(jb, CX, JY + 2.34, CZ, 0.15, { ws: 8, hs: 6 });
      b.beam(
        jb,
        V(CX - 0.28, JY + 2.02, CZ),
        V(CX - 0.72, JY + 2.5, CZ + 0.08),
        0.09,
        0.09,
      );
      b.beam(
        jb,
        V(CX - 1.05, JY + 2.56, CZ + 0.08),
        V(CX - 0.4, JY + 2.56, CZ + 0.08),
        0.04,
        0.04,
      );
      for (const sx of [-1.02, -0.43]) {
        b.beam(
          jb,
          V(CX + sx, JY + 2.56, CZ + 0.08),
          V(CX + sx, JY + 2.2, CZ + 0.08),
          0.015,
          0.015,
        );
        b.cyl(jb, CX + sx, JY + 2.14, CZ + 0.08, 0.13, 0.05, 0.07, 8, {
          hSeg: 1,
        });
      }
      b.beam(
        jb,
        V(CX + 0.28, JY + 2.02, CZ),
        V(CX + 0.46, JY + 1.45, CZ + 0.12),
        0.09,
        0.09,
      );
      b.beam(
        jb,
        V(CX + 0.47, JY + 1.5, CZ + 0.14),
        V(CX + 0.52, JY + 0.55, CZ + 0.3),
        0.06,
        0.02,
      );
      b.beam(
        jb,
        V(CX + 0.36, JY + 1.46, CZ + 0.13),
        V(CX + 0.6, JY + 1.46, CZ + 0.13),
        0.04,
        0.04,
      ); // cross-guard
      LB.colMM(CX - 5, CY, CZ - 5, CX + 5, JY + 2.6, CZ + 5, {
        walkable: false,
      });
      // flagpoles in front of the steps (one tattered flag left; the other halyard slapping an empty pole)
      for (const [fx, hasFlag] of [
        [CX - 12, true],
        [CX + 12, false],
      ]) {
        const fz = ZF + 9;
        b.cyl("granite", fx, 0, fz, 0.55, 0.65, 0.6, 8, { hSeg: 1 });
        b.cyl("iron", fx, 0.6, fz, 0.07, 0.12, 12, 8, { hSeg: 2 });
        b.sphere("bronze", fx, 12.7, fz, 0.16, { ws: 8, hs: 6 });
        LB.col(fx, fz, 1.1, 1.1, 0, 12.6, 0, { walkable: false });
        if (hasFlag) {
          const fl = LB.makeFlag ? LB.makeFlag(LB.flagTex(1), 3.2, 1.8) : null;
          if (fl) {
            fl.position.set(fx, 12.4, fz);
            fl.rotation.y = 0;
            root.add(fl);
          }
        } else
          b.beam(
            "iron",
            V(fx + 0.1, 12.4, fz),
            V(fx + 0.3, 5.5, fz + 0.2),
            0.02,
            0.02,
          );
      }
      // ---- City Hall Park: paths, fountain, lawns, trees, lamps, benches
      b.boxMM("sidewalk", 51, 0, ZF + 2.4, 109, 0.06, site.z1 - 1, {
        grime: 0.5,
        noAO: true,
      });
      for (const [x0, z0, x1, z1] of [
        [52, 622, 72, 634],
        [88, 622, 108, 634],
        [52, 646, 72, 660],
        [88, 646, 108, 660],
      ])
        b.boxMM("grass", x0, 0.06, z0, x1, 0.12, z1, {
          grime: 0.4,
          noAO: true,
        });
      K.fountain(b, CX, 0.06, 640, 7.5, { key: "granite" });
      b.cyl("granite", CX, 0.06, 640, 1.0, 1.4, 2.0, 12, { hSeg: 1 });
      b.lathe(
        "granite",
        [
          [0.2, 0],
          [2.2, 0.3],
          [2.4, 0.55],
          [0.4, 0.6],
        ],
        16,
        CX,
        2.0,
        640,
        {},
      );
      b.cyl("goo", CX, 0.25, 640, 6.9, 6.9, 0.12, 24, { hSeg: 1 });
      LB.col(CX, 640, 2.8, 2.8, 0, 2.6, 0, { walkable: false });
      const r = LB.rng("cityhall_park");
      for (let i = 0; i < 10; i++) {
        const x = 53 + r() * 54,
          z = 622 + r() * 38;
        if (Math.abs(x - CX) < 11 && Math.abs(z - 640) < 11) continue;
        if (Math.abs(x - CX) < 4) continue;
        if (
          (x > 97 && z > 650) ||
          (Math.abs(Math.abs(x - CX) - 12) < 2.5 && z < 625)
        )
          continue; // billboard, flagpoles
        LB.deadTree(b, x, 0.1, z, 6 + r() * 4, i * 5 + 3);
      }
      for (const [x, z] of [
        [74, 626],
        [86, 626],
        [74, 654],
        [86, 654],
        [66, 640],
        [94, 640],
      ])
        LB.lampPost(b, x, 0.06, z, false);
      for (const [x, z, ry] of [
        [66, 628, 0],
        [94, 628, 0],
        [70, 652, Math.PI],
        [90, 652, Math.PI],
      ])
        LB.bench(b, x, 0.06, z, ry);
      // Patrolman robot charging pods flanking the portico (Mayoral Security)
      for (const x of [CP0 - 1.8, CP1 + 1.8]) {
        b.cyl("paint_cream", x, FY, ZF + 2.2, 0.9, 1.0, 0.3, 12, { hSeg: 1 });
        b.cyl("glass_dark", x, FY + 0.3, ZF + 2.2, 0.85, 0.85, 2.4, 12, {
          hSeg: 1,
          open: true,
          thetaStart: -Math.PI * 0.35,
          thetaLen: Math.PI * 1.3,
        });
        b.cyl("paint_cream", x, FY + 2.7, ZF + 2.2, 0.95, 0.9, 0.35, 12, {
          hSeg: 1,
        });
        b.sphere("lamp_red", x, FY + 3.15, ZF + 2.2, 0.15, {});
        LB.col(x, ZF + 2.2, 1.8, 1.8, FY, FY + 3, 0, {
          walkable: false,
          surface: "metal",
        });
      }
      const secK = LB.texMat(
        "cityhall_sec",
        LB.signTex(
          "cityhall_sec",
          ["MAYORAL SECURITY ZONE", "LOITERERS WILL BE PROTECTED"],
          "enamel",
          768,
          160,
          { bg: "#2d3b4a" },
        ),
      );
      b.quad(secK, CX, FY + 6.2, ZF + 4.04, 3.84, 0.8, { noAO: true }); // on the portico frieze, facing the park
      anchors.entrance = LB.anchor(CX, FY, ZF + 5, Math.PI);
      anchors.pod1 = LB.anchor(CP0 - 1.8, FY, ZF + 3.8, Math.PI);
      anchors.pod2 = LB.anchor(CP1 + 1.8, FY, ZF + 3.8, Math.PI); // the Patrolmen face the park
      LB.billboard(
        b,
        "burger_brigade",
        103.5,
        0.06,
        656.5,
        Math.PI * 0.25,
        10,
        4.6,
        4.5,
      ); // park SE corner, faces Centre St × Fulton (off the City Hall axis)
      anchors.fountain = V(CX, 0, 630);
      anchors.spawn3 = V(62, 0, 645);
      anchors.spawn4 = V(98, 0, 648);
      LB.interiorPart("city_hall", "finish", ix); // boss anchor in the rotunda, the Mayor's terminal at initDone
      const g = b.build(root);
      g.name = "city_hall";
      LB.register("city_hall", g, anchors);
      LB.plaque(
        V(CX - 3, 1.4, ZF + 3.8),
        "City Hall Plaque",
        '"Seat of municipal government since 1812. Office hours suspended the morning of the Bombing, 1967. Please take a number. Now serving: 000."',
      );
    },
    32,
  );

  // =====================================================================
  // NYSE — "The Exchange" raider fortress with a walk-in trading floor
  // =====================================================================
