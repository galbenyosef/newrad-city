// play-inline-138 03 — math
// Lines 354-709 of readable/play-inline-138.pretty.js (statement-aligned).
  LB.interiors.city_hall = {
    /** ctx: {root, anchors, CX, FY (floor), ZB, ZF (back / front wall z), CP0, CP1 (central pavilion x)}. */
    rotunda(ctx) {
      const K = LB.kit;
      const { root, anchors, CX, FY, ZB, ZF, CP0, CP1 } = ctx;
      // ---- the rotunda interior (lit batch): marble floor, ring of columns, coffered dome with a lamp-lit oculus,
      //      the cantilevered stair, the Mayor's desk and portraits of forgotten mayors
      const D = LB.dress;
      const bi = (ctx.bi = LB.batch("city_hall_int"));
      bi.ground = FY;
      bi.aoH = 2.5;
      const RZ = 602,
        RIX0 = CP0 + 0.8,
        RIX1 = CP1 - 0.8,
        RIZ0 = ZB + 0.8,
        RIZ1 = ZF - 0.8;
      bi.setLights(
        [
          { x: CX, y: FY + 4.4, z: RZ, color: 0xffe0b0, r: 13, i: 0.85 }, // oculus lamp
          ...[
            [RIX0 + 0.6, RZ],
            [RIX1 - 0.6, RZ],
            [CX, RIZ0 + 0.6],
          ].map(([x, z]) => ({
            x,
            y: FY + 3.2,
            z,
            color: 0xffcf90,
            r: 7,
            i: 0.5,
          })), // wall sconces
          {
            x: CX + 3.8,
            y: FY + 1.6,
            z: 596.8,
            color: 0x70ff9a,
            r: 5,
            i: 0.45,
          }, // terminal glow
          { x: CX - 5.5, y: FY + 2.5, z: 608.6, color: 0xffc070, r: 6, i: 0.5 }, // desk lamp by the doors
        ],
        0xd0c8b8,
        0.2,
      );
      for (const [x, z, ry] of [
        [RIX0 + 0.1, RZ, Math.PI / 2],
        [RIX1 - 0.1, RZ, -Math.PI / 2],
        [CX, RIZ0 + 0.1, 0],
      ]) {
        bi.box("gilt", x, FY + 2.8, z, 0.3, 0.12, 0.3, { ry, seg: false });
        bi.sphere(
          "lamp",
          x + Math.sin(ry) * 0.2,
          FY + 3.1,
          z + Math.cos(ry) * 0.2,
          0.13,
          { noAO: true, grime: 0 },
        );
        LB.glows.push({
          pos: V(x + Math.sin(ry) * 0.25, FY + 3.1, z + Math.cos(ry) * 0.25),
          color: 0xffcf90,
          size: 0.8,
        });
      }
      bi.boxMM("marble_floor", RIX0, FY - 0.05, RIZ0, RIX1, FY + 0.02, RIZ1, {
        grime: 0.5,
        noAO: true,
      });
      for (const [x0, z0, x1, z1] of [
        [RIX0, RIZ0, RIX1, RIZ0 + 0.04],
        [RIX0, RIZ0, RIX0 + 0.04, RIZ1],
        [RIX1 - 0.04, RIZ0, RIX1, RIZ1],
        [RIX0, RIZ1 - 0.04, CX - 1.7, RIZ1],
        [CX + 1.7, RIZ1 - 0.04, RIX1, RIZ1],
      ]) {
        bi.boxMM("marble", x0, FY, z0, x1, FY + 1.0, z1, {
          seg: false,
          grime: 0.5,
        });
        bi.boxMM("plaster", x0, FY + 1.0, z0, x1, FY + 6.2, z1, {
          seg: false,
          grime: 0.3,
          c: 0xf2ecdc,
        });
      }
      bi.boxMM(
        "plaster",
        CX - 1.7,
        FY + 4.2,
        RIZ1 - 0.04,
        CX + 1.7,
        FY + 6.2,
        RIZ1,
        { seg: false, c: 0xe8e0c8 },
      );
      // flat ceiling at the entablature line with an elliptical opening for the saucer dome
      const CY0 = FY + 4.6;
      {
        const sh = new THREE.Shape();
        sh.moveTo(RIX0, RIZ0);
        sh.lineTo(RIX1, RIZ0);
        sh.lineTo(RIX1, RIZ1);
        sh.lineTo(RIX0, RIZ1);
        sh.closePath();
        const h = new THREE.Path();
        h.absellipse(CX, RZ, 5.5, 5.5 * 0.93, 0, TAU, true);
        sh.holes.push(h);
        const cg = new THREE.ShapeGeometry(sh, 24);
        cg.rotateX(Math.PI / 2);
        bi.add("plaster", cg, {
          m: LB.m4(0, CY0, 0),
          grime: 0.25,
          c: 0xf2ecdc,
        });
      }
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU;
        K.column(
          bi,
          "marble",
          CX + Math.cos(a) * 5.0,
          FY,
          RZ + Math.sin(a) * 4.6,
          4.5,
          0.24,
          {},
        );
      }
      const dome = LB.surface(
        (u, v, out) => {
          const th = u * TAU,
            rho = 5.5 * Math.cos(((v * Math.PI) / 2) * 0.8),
            y = 1.45 * Math.sin(((v * Math.PI) / 2) * 0.8);
          const cof = Math.sin(th * 12) * Math.sin(v * Math.PI * 3);
          const k = cof > 0.4 ? -0.1 : 0;
          out.set(
            CX + Math.sin(th) * (rho - k) * 1.0,
            CY0 + y,
            RZ + Math.cos(th) * (rho - k) * 0.93,
          );
          return cof > 0.4 ? 0.75 : 1;
        },
        40,
        10,
        { wrap: true, flip: true, us: 5, vs: 2 },
      );
      bi.add("plaster", dome, { uv: "keep", grime: 0.3, c: 0xece4d0 });
      bi.add("marble", new THREE.TorusGeometry(5.5, 0.09, 5, 40), {
        m: LB.m4(CX, CY0 - 0.02, RZ, 0, Math.PI / 2, 0, 1, 0.93, 1),
      });
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        bi.beam(
          "marble",
          V(CX + Math.sin(a) * 5.4, CY0, RZ + Math.cos(a) * 5.4 * 0.93),
          V(CX + Math.sin(a) * 1.9, CY0 + 1.3, RZ + Math.cos(a) * 1.9 * 0.93),
          0.16,
          0.12,
        );
      } // dome ribs
      const ocl = new THREE.CircleGeometry(1.7, 20);
      ocl.rotateX(Math.PI / 2);
      bi.add("lamp", ocl, {
        m: LB.m4(CX, CY0 + 1.45 * Math.sin((Math.PI / 2) * 0.8) - 0.02, RZ),
        grime: 0,
        noAO: true,
      });
      LB.glows.push({ pos: V(CX, CY0 + 1.1, RZ), color: 0xffe8c0, size: 4 });
      // the cantilevered stair (round 2: floating marble treads over a continuous curved soffit ribbon with an iron
      // balustrade + mahogany handrail on the open side, instead of 14 floor-to-step marble blocks
      // that read as a ring of pillars). Decorative: its foot carries landmark_interiors' "Grand Staircase" door.
      {
        const NST = 14,
          A0 = Math.PI * 0.9,
          DA = (Math.PI * 1.1) / 18,
          RS = 6.3,
          EZ = 6.0 / 6.3,
          RIN = RS - 0.8,
          ROUT = RS + 0.8;
        const P = (r, a, y) => [
          CX + Math.cos(a) * r,
          y,
          RZ + Math.sin(a) * r * EZ,
        ];
        const topAt = (i) => FY + 0.48 + i * 0.3;
        for (let i = 0; i < NST; i++) {
          const a = A0 + i * DA,
            top = topAt(i);
          bi.box(
            "marble",
            CX + Math.cos(a) * RS,
            top - 0.16,
            RZ + Math.sin(a) * RS * EZ,
            1.6,
            0.16,
            0.8,
            { ry: -a, seg: false, grime: 0.35 },
          );
          bi.box(
            "marble_dark",
            CX + Math.cos(a) * RS,
            top - 0.2,
            RZ + Math.sin(a) * RS * EZ,
            1.64,
            0.05,
            0.84,
            { ry: -a, seg: false, grime: 0.3 },
          ); // nosing shadow line
          LB.col(
            CX + Math.cos(a) * RS,
            RZ + Math.sin(a) * RS * EZ,
            1.6,
            0.7,
            FY,
            top,
            -a,
            { walkable: false },
          );
        }
        // soffit ribbon + both string faces (both windings)
        const N = 42,
          a1 = A0 + (NST - 1) * DA + DA * 0.5,
          a0 = A0 - DA * 0.5,
          pos = [],
          idx = [];
        for (let k = 0; k <= N; k++) {
          const t = k / N,
            a = a0 + (a1 - a0) * t,
            yT = FY + 0.32 + (topAt(NST - 1) - FY - 0.32) * t,
            yB = Math.max(FY + 0.02, yT - 0.42);
          pos.push(
            ...P(RIN, a, yT - 0.17),
            ...P(ROUT, a, yT - 0.17),
            ...P(RIN, a, yB),
            ...P(ROUT, a, yB),
          );
          if (k < N) {
            const o = k * 4,
              n = o + 4;
            idx.push(
              o + 2,
              o + 3,
              n + 2,
              o + 3,
              n + 3,
              n + 2,
              o,
              o + 2,
              n,
              o + 2,
              n + 2,
              n,
              o + 1,
              n + 1,
              o + 3,
              o + 3,
              n + 1,
              n + 3,
            );
          }
        }
        for (const flip of [false, true]) {
          const g = new THREE.BufferGeometry();
          g.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(pos.slice(), 3),
          );
          g.setIndex(flip ? idx.slice().reverse() : idx.slice());
          g.computeVertexNormals();
          bi.add("plaster", g, { grime: 0.3, noAO: true, c: 0xf0e8d6 });
        }
        // balustrade: two iron balusters per tread on the open (inner) edge + a continuous mahogany handrail
        const rail = [];
        for (let i = 0; i < NST; i++)
          for (const f of [-0.25, 0.25]) {
            const a = A0 + (i + f) * DA,
              top = topAt(i),
              [x, , z] = P(RIN + 0.12, a, 0);
            bi.box("iron", x, top, z, 0.035, 0.92, 0.035, { seg: false });
            if (f > 0) rail.push(V(x, top + 0.95, z));
          }
        // (no newel post: landmark_interiors' brass stanchions + dropped velvet rope stand at the stair foot)
        {
          const [x, , z] = P(RIN + 0.12, A0 - DA * 0.25, 0);
          rail.unshift(V(x, topAt(0) + 0.95, z));
        }
        for (let k = 0; k < rail.length - 1; k++)
          bi.beam("rotten", rail[k], rail[k + 1], 0.07, 0.06, {
            c: 0x5a3322,
            grime: 0.3,
          });
        // a strip of worn red runner up the treads
        for (let i = 0; i < NST; i += 1) {
          const a = A0 + i * DA;
          bi.box(
            "fabric",
            CX + Math.cos(a) * RS,
            topAt(i),
            RZ + Math.sin(a) * RS * EZ,
            0.9,
            0.012,
            0.8,
            { ry: -a, seg: false, c: 0x6a1c18, grime: 0.6 },
          );
        }
      }
      // portraits of forgotten mayors, a toppled flag stand, the Mayor's desk, papers everywhere
      D.painting(bi, 1, RIX0 + 0.05, FY + 3.2, 598, 1.4, 1.8, Math.PI / 2);
      D.painting(bi, 7, RIX1 - 0.05, FY + 3.2, 598, 1.8, 1.4, -Math.PI / 2);
      D.painting(bi, 0, RIX1 - 0.05, FY + 3.2, 606, 1.8, 1.4, -Math.PI / 2);
      bi.box("rotten", CX - 5.5, FY, 608.2, 2.2, 0.8, 1.0, {
        seg: false,
        grime: 0.6,
      });
      bi.cyl("chrome", CX - 5.0, FY + 0.8, 608.2, 0.08, 0.15, 0.5, 8, {
        hSeg: 1,
      });
      bi.sphere("lamp", CX - 5.0, FY + 1.35, 608.2, 0.12, {
        noAO: true,
        grime: 0,
      });
      LB.col(CX - 5.5, 608.2, 2.2, 1.0, FY, FY + 0.8, 0, { walkable: false });
      D.chair(bi, CX - 5.5, FY, 609.3, Math.PI, false);
      bi.beam(
        "iron",
        V(CX + 5.8, FY + 0.1, 608.6),
        V(CX + 4.1, FY + 0.3, 606.2),
        0.05,
      );
      D.papers(bi, CX, FY + 0.02, 603, 4.2, 28, 61);
      D.rubble(bi, CX + 4.8, FY + 0.02, 597.2, 0.7, 4, 62);
      anchors.desk = LB.anchor(CX - 5.5, FY, 609.4, 0);
      bi.build(root);
      anchors.rotunda = LB.anchor(CX, FY, 603, 0);
      anchors.terminal = LB.anchor(CX + 3.8, FY, 596.2, 0);
      anchors.spawn1 = V(CX - 3, FY, 600);
      anchors.spawn2 = V(CX + 3, FY, 606);
    },
    finish(ctx) {
      const { anchors, FY } = ctx;
      anchors.boss = anchors.rotunda.clone();
      LB.onReady.push(() => {
        LB.spawnProp("terminal", {
          x: anchors.terminal.x,
          y: FY,
          z: anchors.terminal.z,
          yaw: 0,
          terminalId: "city_hall_mayor",
        });
      });
    },
  };

  // =====================================================================
  // NYSE — the trading floor
  // =====================================================================
