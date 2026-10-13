/* src/landmarks_b/50_uptown_interior.js */
/* =====================================================================
 * LANDMARKS B — UPTOWN MUSEUM INTERIORS (walk-in, baked-light batches):
 *  • The Met — Great Hall: marble floor, three coffered saucer domes with
 *    lit oculi, transverse arches on piers, the walkable west balcony with
 *    twin stairs, info desk, standard lamps, paintings, arms & armour, the
 *    Project Long Winter exhibit, Patrolman robot pods, decay; hall anchors,
 *    the security terminal and the curatorial safe (keypad; the code is on
 *    the registrar's memo under the info-desk glass).
 *  • The Guggenheim — lobby & reflecting pool, the walkable spiral ramp
 *    (ribbon surface, soffit, solid parapet, colliders) and top landing,
 *    exhibits on the ramp, the wrecked Valet docent; anchors, loot.
 * Called from the exterior builders in 50_uptown.js through
 * LB.interiorPart(siteId, part, ctx); ctx carries the exterior frame.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._lb) return;
  const LB = G._lb;
  const TAU = Math.PI * 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // the Met's curatorial safe (balcony, south end): keypad code on the registrar's memo at the info desk
  const MET_SAFE = {
    id: "lb_met_curatorial_safe",
    label: "Curatorial Safe (the Met)",
    code: "1870",
    kind: "safe",
    hint: "The registrar's memo under the glass of the Great Hall info desk",
    learnedFrom: "Registrar's memo, Met Great Hall",
  };

  // =====================================================================
  // THE MET — Great Hall
  // =====================================================================
  LB.interiors.met = Object.assign(LB.interiors.met || {}, {
    /** ctx: {root, anchors, XF (east facade plane), PZ0, PZ1, ZM (central pavilion z), FY (hall floor), CEIL,
     *  banners, bannerKey (the facade's exhibit banners)}. */
    hall(ctx) {
      const K = LB.kit,
        D = LB.dress;
      const { anchors, XF, PZ0, PZ1, ZM, FY, CEIL, banners, bannerKey } = ctx;
      const bi = (ctx.bi = LB.batch("met_hall"));
      bi.ground = FY;
      bi.aoH = 3;
      const HX0 = 81.2,
        HX1 = XF - 1.2,
        HZ0 = PZ0 + 1.2,
        HZ1 = PZ1 - 1.2,
        HXC = (HX0 + HX1) / 2;
      const DOMES = [ZM - 11.33, ZM, ZM + 11.33],
        ARCHZ = [ZM - 5.67, ZM + 5.67];
      const BAL = FY + 8.5,
        BALX = HX0 + 4.0; // west balcony level & depth
      bi.setLights(
        [
          ...DOMES.map((z) => ({
            x: HXC,
            y: CEIL + 2,
            z,
            color: 0xf0e6d0,
            r: 17,
            i: 0.42,
          })), // oculus daylight
          {
            x: HXC + 4,
            y: FY + 2.6,
            z: ZM - 7,
            color: 0xffc47a,
            r: 11,
            i: 0.55,
          }, // standard lamps
          {
            x: HXC + 4,
            y: FY + 2.6,
            z: ZM + 7,
            color: 0xffc47a,
            r: 11,
            i: 0.55,
          },
          { x: HX0 + 2, y: BAL + 2.5, z: ZM, color: 0xffcf90, r: 10, i: 0.5 }, // balcony lanterns
          {
            x: HX0 + 2,
            y: BAL + 2.5,
            z: ZM - 11,
            color: 0xffcf90,
            r: 9,
            i: 0.45,
          },
          {
            x: HX0 + 2,
            y: BAL + 2.5,
            z: ZM + 11,
            color: 0xffcf90,
            r: 9,
            i: 0.45,
          },
          { x: 97, y: FY + 3, z: PZ1 - 11.5, color: 0xa8e0f0, r: 7, i: 0.45 }, // Long Winter exhibit glow
        ],
        0xd8d0c0,
        0.12,
      );
      bi.boxMM("marble_floor", HX0, FY - 0.02, HZ0, HX1, FY + 0.04, HZ1, {
        grime: 0.45,
        noAO: true,
      });
      // ceiling plane with three dome openings (faces down)
      {
        const sh = new THREE.Shape();
        sh.moveTo(HX0, HZ0);
        sh.lineTo(HX1, HZ0);
        sh.lineTo(HX1, HZ1);
        sh.lineTo(HX0, HZ1);
        sh.closePath();
        for (const z of DOMES) {
          const h = new THREE.Path();
          h.absarc(HXC, z, 5.2, 0, TAU, true);
          sh.holes.push(h);
        }
        const cg = new THREE.ShapeGeometry(sh, 24);
        cg.rotateX(Math.PI / 2); // shape (x, z) → XZ plane, facing -Y
        bi.add("plaster", cg, {
          m: LB.m4(0, CEIL, 0),
          grime: 0.35,
          uvScale: 3,
        });
      }
      // saucer domes: coffered inner surfaces rising 3.6 m above the ceiling, bronze-lit oculi
      for (const z of DOMES) {
        const dome = LB.surface(
          (u, v, out) => {
            const th = u * TAU,
              rho = 5.2 * Math.cos(((v * Math.PI) / 2) * 0.86),
              y = 3.6 * Math.sin(((v * Math.PI) / 2) * 0.86);
            const cof = Math.sin(th * 16) * Math.sin(v * Math.PI * 4);
            const k = cof > 0.35 ? -0.12 : 0; // coffers
            out.set(
              HXC + Math.sin(th) * (rho - k),
              CEIL + y + k * 0.4,
              z + Math.cos(th) * (rho - k),
            );
            return cof > 0.35 ? 0.72 : 1;
          },
          48,
          12,
          { wrap: true, flip: true, us: 6, vs: 2 },
        );
        bi.add("plaster", dome, { uv: "keep", grime: 0.3, c: 0xe8e0cc });
        for (const [rr, yy] of [
          [5.2, 0],
          [4.2, 2.2],
          [2.7, 3.2],
        ])
          bi.add("limestone", new THREE.TorusGeometry(rr, 0.16, 5, 40), {
            m: LB.m4(HXC, CEIL + yy, z, 0, Math.PI / 2),
          });
        const oc = new THREE.CircleGeometry(1.0, 20);
        oc.rotateX(Math.PI / 2);
        bi.add("lamp", oc, {
          m: LB.m4(HXC, CEIL + 3.55, z),
          grime: 0,
          noAO: true,
        });
        LB.glows.push({ pos: V(HXC, CEIL + 3.2, z), color: 0xfff0d0, size: 5 });
      }
      // transverse arches between the domes, springing from massive piers
      for (const z of ARCHZ) {
        const span = HX1 - HX0,
          spring = FY + 12.5,
          rise = CEIL - 0.9 - spring;
        const R = ((span * span) / 4 + rise * rise) / (2 * rise),
          cy = spring + rise - R,
          ang = Math.asin(span / 2 / R);
        const sh = new THREE.Shape();
        sh.moveTo(HX0, spring);
        sh.lineTo(HX0, CEIL + 0.02);
        sh.lineTo(HX1, CEIL + 0.02);
        sh.lineTo(HX1, spring);
        sh.absarc(HXC, cy, R, Math.PI / 2 - ang, Math.PI / 2 + ang, false);
        const ag = new THREE.ExtrudeGeometry(sh, {
          depth: 1.6,
          bevelEnabled: false,
          curveSegments: 18,
        });
        ag.translate(0, 0, -0.8);
        bi.add("limestone", ag, { m: LB.m4(0, 0, z), grime: 0.35 });
        for (const x of [HX0 + 1.2, HX1 - 1.2]) {
          bi.box("limestone", x, FY, z, 2.4, spring - FY, 2.2, { grime: 0.45 });
          bi.box("limestone", x, spring - 0.6, z, 2.9, 0.6, 2.7, {
            seg: false,
          }); // impost
          bi.box("limestone", x, FY, z, 2.8, 1.0, 2.6, {
            seg: false,
            grime: 0.55,
          }); // base
          LB.col(x, z, 2.6, 2.4, FY, CEIL, 0, { walkable: false });
        }
      }
      // side walls: blind arches with dark gallery openings + a continuous cornice at the balcony line
      for (const zw of [HZ0 + 0.02, HZ1 - 0.02]) {
        const face = zw < ZM ? 0 : Math.PI,
          dz = face === 0 ? 1 : -1;
        for (const x of [90.5, 97.2]) {
          bi.quad("glass_broken", x, FY + 4.5, zw + dz * 0.01, 4.4, 9, {
            ry: face,
            uv: "box",
            grime: 0.4,
          });
          bi.add(
            "limestone",
            new THREE.RingGeometry(2.2, 2.9, 14, 1, 0, Math.PI),
            { m: LB.m4(x, FY + 9, zw + dz * 0.03, face), grime: 0.3 },
          );
          for (const sx of [-2.6, 2.6])
            bi.box("limestone", x + sx, FY, zw + dz * 0.25, 0.6, 9.2, 0.5, {
              seg: false,
              grime: 0.4,
            });
        }
        bi.box(
          "limestone",
          (HX0 + HX1) / 2,
          BAL + 0.1,
          zw + dz * 0.3,
          HX1 - HX0,
          0.5,
          0.6,
          { seg: false },
        );
      }
      // ---- west balcony (walkable) with balustrade, corbels, reached by twin stairs along the side walls
      bi.boxMM("marble", HX0, BAL - 0.45, HZ0, BALX, BAL, HZ1, { grime: 0.35 });
      LB.colMM(HX0, BAL - 0.45, HZ0, BALX, BAL, HZ1, { surface: "concrete" });
      for (let z = HZ0 + 1; z < HZ1; z += 2.2)
        bi.box("limestone", BALX - 0.3, BAL - 1.3, z, 0.6, 0.85, 0.5, {
          seg: false,
        });
      const STW = 2.8; // stair width
      const stairX0 = BALX + 11.0; // foot of each stair (east end)
      K.balustrade(
        bi,
        "marble",
        [
          [BALX + 0.2, HZ0 + STW + 0.2],
          [BALX + 0.2, HZ1 - STW - 0.2],
        ],
        BAL,
        1.0,
        { urns: true, collide: true },
      );
      for (const [zs, zSide] of [
        [HZ0 + STW / 2 + 0.05, HZ0 + STW + 0.2],
        [HZ1 - STW / 2 - 0.05, HZ1 - STW - 0.2],
      ]) {
        LB.stairs(
          bi,
          "marble",
          stairX0,
          zs,
          -Math.PI / 2,
          STW,
          11.0,
          FY + 0.04,
          BAL,
          { base: FY - 0.1, maxRise: 0.34 },
        );
        // open-side balustrade following the stair slope (visual) + a solid stringer wall below it
        for (let i = 0; i <= 11; i++) {
          const x = stairX0 - i,
            y = FY + (BAL - FY) * Math.min(1, i / 11);
          bi.box("marble", x, y, zSide, 0.12, 1.0, 0.12, { seg: false });
        }
        const len = Math.hypot(11.0, BAL - FY);
        bi.add("marble", new THREE.BoxGeometry(len, 0.3, 0.35), {
          m: LB.m4(
            (stairX0 + BALX) / 2,
            (FY + BAL) / 2 + 1.0,
            zSide,
            0,
            0,
            Math.atan2(BAL - FY, 11.0),
          ),
        });
        for (let i = 0; i < 11; i += 2) {
          const x = stairX0 - i - 0.5,
            h = FY + ((BAL - FY) * (i + 1)) / 11 + 1.05;
          LB.col(x, zSide, 2.05, 0.3, FY, h, 0, { walkable: false });
        }
      }
      // ---- dressing: info desk, standard lamps, paintings, armour on the balcony, the Long Winter exhibit ----
      bi.cyl("marble", HXC, FY, ZM, 3.4, 3.4, 1.1, 8, { hSeg: 1 });
      bi.cyl("rotten", HXC, FY + 1.1, ZM, 3.6, 3.6, 0.1, 8, { hSeg: 1 });
      bi.lathe(
        "bronze",
        [
          [0.3, 0],
          [0.9, 0.4],
          [1.1, 1.3],
          [0.7, 1.9],
          [0.9, 2.2],
        ],
        12,
        HXC,
        FY + 1.2,
        ZM,
        {},
      );
      for (let i = 0; i < 9; i++) {
        const a = i * 0.7;
        LB.deadTree(
          bi,
          HXC + Math.cos(a) * 0.4,
          FY + 3.2,
          ZM + Math.sin(a) * 0.4,
          1.2,
          i * 3,
        );
      } // dead flower arrangement
      LB.col(HXC, ZM, 6.4, 6.4, FY, FY + 1.2, 0, { walkable: false });
      for (let i = 0; i < 3; i++)
        D.monitor(bi, HXC - 1.2 + i * 1.2, FY + 1.2, ZM + 2.2, 0, i === 1);
      anchors.info_desk = LB.anchor(HXC, FY, ZM + 4.2, 0);
      bi.box("paper", HXC + 1.5, FY + 1.2, ZM - 1.6, 0.42, 0.012, 0.3, {
        ry: 0.3,
        seg: false,
        grime: 0.3,
      }); // the registrar's memo
      for (const [x, z] of [
        [HXC + 4, ZM - 7],
        [HXC + 4, ZM + 7],
        [HXC - 4, ZM - 7],
        [HXC - 4, ZM + 7],
      ]) {
        bi.cyl("bronze", x, FY, z, 0.35, 0.45, 0.25, 10, { hSeg: 1 });
        bi.cyl("bronze", x, FY + 0.25, z, 0.07, 0.09, 2.4, 8, { hSeg: 1 });
        bi.sphere("lamp", x, FY + 2.75, z, 0.32, {
          ws: 10,
          hs: 8,
          noAO: true,
          grime: 0,
        });
        LB.glows.push({ pos: V(x, FY + 2.75, z), color: 0xffcf8a, size: 2.6 });
        LB.col(x, z, 0.6, 0.6, FY, FY + 2.9, 0, { walkable: false });
      }
      // paintings: under the balcony (west wall) and up on the balcony wall
      [
        [ZM - 8.8, 0],
        [ZM - 2.6, 1],
        [ZM + 2.6, 7],
        [ZM + 8.8, 2],
      ].forEach(([z, idx]) =>
        D.painting(bi, idx, HX0 + 0.05, FY + 3.6, z, 3.2, 2.4, Math.PI / 2),
      );
      [
        [ZM - 13, 3],
        [ZM - 8.9, 6],
        [ZM, 0],
        [ZM + 8.9, 1],
        [ZM + 13, 7],
      ].forEach(([z, idx]) =>
        D.painting(bi, idx, HX0 + 0.05, BAL + 3.0, z, 2.6, 2.0, Math.PI / 2),
      );
      // arms & armour on the balcony
      const knight = (x, y, z, ry) => {
        bi.box("marble", x, y, z, 1.0, 0.6, 1.0, { seg: false });
        bi.cyl("chrome", x, y + 0.6, z, 0.26, 0.2, 0.9, 10, { hSeg: 1 });
        bi.cyl("chrome", x, y + 1.5, z, 0.34, 0.28, 0.7, 10, { hSeg: 1 });
        bi.sphere("chrome", x, y + 2.4, z, 0.21, { sy: 1.25, ws: 10, hs: 8 });
        bi.box("iron", x, y + 2.4, z + Math.cos(ry) * 0.2, 0.3, 0.05, 0.05, {
          ry,
          seg: false,
        }); // visor slit
        bi.beam(
          "chrome",
          V(x + 0.34, y + 2.0, z),
          V(x + 0.42, y + 1.2, z + 0.2),
          0.1,
        );
        bi.beam("iron", V(x - 0.45, y + 0.6, z), V(x - 0.4, y + 3.1, z), 0.04); // halberd
        bi.box("iron", x - 0.42, y + 2.9, z, 0.05, 0.4, 0.3, { seg: false });
        LB.col(x, z, 1.0, 1.0, y, y + 2.7, 0, { walkable: false });
      };
      for (const z of [ZM - 11, ZM - 3.5, ZM + 3.5, ZM + 11])
        knight(HX0 + 1.4, BAL, z, Math.PI / 2);
      // balcony lanterns (wall brackets)
      for (const z of [ZM - 11, ZM, ZM + 11]) {
        bi.box("iron", HX0 + 0.25, BAL + 2.4, z, 0.5, 0.06, 0.06, {
          seg: false,
        });
        bi.cyl("lamp", HX0 + 0.5, BAL + 2.0, z, 0.14, 0.18, 0.4, 6, {
          hSeg: 1,
          noAO: true,
          grime: 0,
        });
        LB.glows.push({
          pos: V(HX0 + 0.5, BAL + 2.2, z),
          color: 0xffcf90,
          size: 1.6,
        });
      }
      // exhibition banner hanging from the balcony
      bi.quad(bannerKey(banners[0], 0), BALX + 0.1, BAL - 3.3, ZM, 2.4, 6.2, {
        ry: Math.PI / 2,
        grime: 0.05,
        noAO: true,
      });
      // Project Long Winter exhibit (south-east corner of the hall): a display wall and a cutaway sleeper pod on a plinth
      // (grey-white padded shell, frosted window, orange collar ring)
      const lwK = LB.texMat(
        "met_long_winter",
        LB.signTex(
          "met_long_winter",
          ["PROJECT LONG WINTER", "SLEEP TODAY · WAKE TO TOMORROW"],
          "enamel",
          512,
          192,
          { bg: "#2a3a4a", fg: "#f0a050" },
        ),
      );
      bi.boxMM("paint_cream", 94.5, FY, PZ1 - 9, 100.5, FY + 3.2, PZ1 - 8.6, {
        seg: false,
      });
      bi.quad(lwK, 97.5, FY + 2.3, PZ1 - 9.02, 5, 1.8, { ry: Math.PI });
      bi.cyl("granite_dark", 97.5, FY, PZ1 - 11.5, 1.2, 1.2, 0.2, 18, {
        hSeg: 1,
      });
      bi.cyl("lamp_ice", 97.5, FY + 0.2, PZ1 - 11.5, 0.9, 0.9, 0.04, 16, {
        hSeg: 1,
        noAO: true,
        grime: 0,
      });
      bi.add("paint_cream", new THREE.CapsuleGeometry(0.55, 1.3, 6, 14), {
        m: LB.m4(97.5, FY + 1.42, PZ1 - 11.5),
        grime: 0.4,
      });
      bi.add("paint_orange", new THREE.TorusGeometry(0.58, 0.07, 6, 18), {
        m: LB.m4(97.5, FY + 1.95, PZ1 - 11.5, 0, Math.PI / 2),
        grime: 0.3,
      });
      bi.add("lamp_ice", new THREE.PlaneGeometry(0.5, 0.8), {
        m: LB.m4(97.5, FY + 1.45, PZ1 - 12.07, Math.PI),
        uv: "keep",
        noAO: true,
        grime: 0,
      }); // frosted window (faces the hall)
      LB.col(97.5, PZ1 - 11.5, 1.4, 1.4, FY, FY + 2.6, 0, { walkable: false });
      LB.colMM(94.5, FY, PZ1 - 9, 100.5, FY + 3.2, PZ1 - 8.6, {
        walkable: false,
      });
      // Patrolman robot charging pods flanking the doors (the robot curators' base)
      for (const z of [ZM - 4.2, ZM + 4.2]) {
        const PX = HX1 - 3.2;
        bi.cyl("paint_cream", PX, FY, z, 0.8, 0.9, 0.28, 12, { hSeg: 1 });
        bi.cyl("glass_dark", PX, FY + 0.28, z, 0.75, 0.75, 2.3, 12, {
          hSeg: 1,
          open: true,
          thetaStart: Math.PI * 0.2,
          thetaLen: Math.PI * 1.3,
        });
        bi.cyl("paint_cream", PX, FY + 2.58, z, 0.85, 0.8, 0.3, 12, {
          hSeg: 1,
        });
        bi.sphere("lamp_amber", PX, FY + 2.98, z, 0.13, {});
        LB.col(PX, z, 1.6, 1.6, FY, FY + 2.9, 0, {
          walkable: false,
          surface: "metal",
        });
      }
      // decay: collapsed coffer chunks, rubble, papers, a skeleton docent, toppled stanchions
      D.rubble(bi, HXC + 2.5, FY + 0.04, ZM + 11.5, 1.6, 9, 11);
      D.rubble(bi, HXC - 6, FY + 0.04, ZM - 12.5, 1.0, 6, 12);
      D.papers(bi, HXC + 3, FY + 0.04, ZM + 1, 4, 22, 5);
      LB.skeleton(bi, 95, FY + 0.05, ZM - 6, 1.1);
      for (let i = 0; i < 5; i++) {
        const x = HXC + 6 + i * 1.3,
          z = ZM - 2.5;
        bi.cyl("chrome", x, FY, z, 0.12, 0.16, 0.95, 8, {
          hSeg: 1,
          rx: i === 2 ? 1.4 : 0,
        });
      }
      D.chair(bi, HXC - 3, FY + 0.04, ZM + 3.5, 0.6, true, "rotten");
      Object.assign(ctx, { HX0, HX1, HXC, BAL });
    },
    /** Hall anchors (after the exterior's entrance / steps anchors). */
    hallAnchors(ctx) {
      const { anchors, FY, ZM, HX0, HXC, BAL } = ctx;
      anchors.great_hall = LB.anchor(HXC, FY, ZM - 4, -Math.PI / 2);
      anchors.curator = LB.anchor(HXC - 2, FY, ZM + 7, -Math.PI / 2);
      anchors.balcony = LB.anchor(HX0 + 2.6, BAL, ZM, -Math.PI / 2);
      anchors.armory = LB.anchor(HX0 + 2.6, BAL, ZM - 6, -Math.PI / 2);
      anchors.spawn1 = LB.anchor(88, FY, -664);
      anchors.spawn2 = LB.anchor(98, FY, -646);
    },
    /** After the exterior batch is built (ctx.g = landmark group). */
    finish(ctx) {
      const { anchors, PZ1, ZM, FY, HX0, HX1, HXC, BAL } = ctx;
      anchors.spawn5 = LB.anchor(HX0 + 2.6, BAL, ZM + 8, -Math.PI / 2);
      anchors.boss = anchors.balcony.clone();
      anchors.boss.yaw = anchors.balcony.yaw;
      anchors.terminal = LB.anchor(97.5, FY, PZ1 - 13, Math.PI);
      anchors.pod1 = LB.anchor(HX1 - 3.2, FY, ZM - 4.2, -Math.PI / 2);
      anchors.pod2 = LB.anchor(HX1 - 3.2, FY, ZM + 4.2, -Math.PI / 2);
      ctx.bi.build(ctx.g);
      LB.onReady.push(() => {
        LB.spawnProp("terminal", {
          x: 97.5,
          y: FY,
          z: PZ1 - 13,
          yaw: Math.PI,
          terminalId: "met_security",
        });
        LB.registerLock(MET_SAFE);
        LB.spawnProp("safe", {
          x: HX0 + 0.6,
          y: BAL,
          z: ZM + 12.5,
          yaw: Math.PI / 2,
          name: "Curatorial Safe",
          lock: MET_SAFE,
          items: [
            ["scrip", 160],
            ["old_dollars", 8],
            ["gold_bar", 1],
            ["souvenir_statue", 1],
            ["rally_tonic", 2],
            ["ammo_10mm", 24],
          ],
        });
        LB.plaque(
          V(HXC + 1.5, FY + 1.3, ZM - 1.6),
          "Registrar's Memo",
          'Typed, under the desk glass: "Curatorial safe (balcony, south end): the combination is reset to the year of our founding, 1870, so that nobody forgets it again. — R. Halvorsen, Registrar, March 1967"',
          () => LB.learnCode(MET_SAFE.id, "Registrar's memo, Met Great Hall"),
        );
      });
    },
  });

  // =====================================================================
  // THE GUGGENHEIM — lobby + spiral ramp
  // =====================================================================
  LB.interiors.guggenheim = {
    /** ctx: {root, anchors, CX, CZ, t0, B0, BSTEP, BH, BANDS, R0, DR, FLARE, ROOF, rBand, ENTRY_A, ENTRY_W} (drum frame). */
    ramp(ctx) {
      const {
        CX,
        CZ,
        t0,
        B0,
        BSTEP,
        BH,
        BANDS,
        FLARE,
        ROOF,
        rBand,
        ENTRY_A,
        ENTRY_W,
      } = ctx;
      /** interior wall radius at local height y (follows the bands, minus the shell thickness) */
      const rWall = (y) => {
        if (y <= B0) return 11.15;
        const f = Math.min(BANDS - 1, (y - B0) / BSTEP);
        const i = Math.floor(f),
          k = f - i;
        const a = rBand(i) + FLARE * Math.min(1, (k * BSTEP) / BH);
        return a - 0.55;
      };
      const R_IN0 = 8.0,
        R_IN1 = 9.6,
        TOP = 25.2,
        TURNS = 3.25;
      // ---- interior (baked daylight from the skylight + work lamps) ----
      const bi = (ctx.bi = LB.batch("guggenheim_int"));
      bi.ground = t0;
      bi.aoH = 2.5;
      bi.setLights(
        [
          { x: CX, y: t0 + ROOF - 1, z: CZ, color: 0xdfe8e0, r: 34, i: 0.55 }, // skylight daylight
          { x: CX, y: t0 + 8, z: CZ, color: 0xe8e4d8, r: 16, i: 0.25 },
          { x: CX - 9, y: t0 + 2.6, z: CZ + 1, color: 0xffc070, r: 9, i: 0.5 }, // lobby work lamp
        ],
        0xc8ccc0,
        0.16,
      );
      // inner wall (inward-facing): upper part follows the bands; the ground storey leaves the entrance open
      const wallProf = [];
      for (let y = ROOF; y > B0 + 0.3; y -= 0.9)
        wallProf.push([rWall(y) + 0.05, y]);
      wallProf.push([rWall(B0 + 0.01) + 0.05, B0 + 0.01], [11.1, B0 - 0.02]); // close the joint with the ground storey wall
      bi.lathe("stucco", wallProf, 72, CX, t0, CZ, { grime: 0.3, c: 0xece4d2 });
      bi.lathe(
        "stucco",
        [
          [11.1, B0],
          [11.1, 0.05],
        ],
        64,
        CX,
        t0,
        CZ,
        {
          grime: 0.35,
          c: 0xe8e0cc,
          phiStart: Math.PI / 2 - ENTRY_A + ENTRY_W,
          phiLen: TAU - 2 * ENTRY_W,
        },
      );
      // lintel over the entrance gap (inside face) + reveals
      for (let k = 0; k < 6; k++) {
        const a0 = ENTRY_A - ENTRY_W + (k / 6) * 2 * ENTRY_W,
          a1 = a0 + (2 * ENTRY_W) / 6,
          am = (a0 + a1) / 2;
        const len = 2 * 11.1 * Math.sin(ENTRY_W / 6) + 0.05;
        bi.box(
          "stucco",
          CX + Math.cos(am) * 11.05,
          t0 + 3.0,
          CZ + Math.sin(am) * 11.05,
          len,
          B0 - 3.0 + 0.05,
          0.45,
          { ry: -am + Math.PI / 2, seg: false, c: 0xe8e0cc },
        );
      }
      for (const sg of [-1, 1]) {
        const a = ENTRY_A + sg * ENTRY_W;
        bi.box(
          "stucco",
          CX + Math.cos(a) * 11.1,
          t0,
          CZ + Math.sin(a) * 11.1,
          0.45,
          3.0,
          0.5,
          { ry: -a + Math.PI / 2, seg: false, c: 0xe8e0cc },
        );
      }
      const floor = new THREE.CircleGeometry(11.1, 48);
      floor.rotateX(-Math.PI / 2);
      bi.add("terrazzo", floor, {
        m: LB.m4(CX, t0 + 0.06, CZ),
        grime: 0.5,
        noAO: true,
      });
      bi.lathe(
        "marble",
        [
          [3.2, 0],
          [3.4, 0.45],
          [3.1, 0.5],
        ],
        32,
        CX,
        t0,
        CZ,
        {},
      );
      bi.cyl("goo", CX, t0 + 0.1, CZ, 3.1, 3.1, 0.25, 24, { hSeg: 1 });
      try {
        G.world.addRadSource({
          x: CX,
          y: t0 + 0.4,
          z: CZ,
          radius: 5,
          strength: 0.8,
        });
      } catch (e) {
        /* core */
      }
      LB.col(CX, CZ, 6.2, 6.2, t0, t0 + 0.5, 0, { surface: "concrete" });
      // ---- the spiral ramp: widening ribbon that meets the (flaring) outer wall ----
      const segN = Math.round(TURNS * 56);
      const rampY = (t) => t0 + 0.06 + t * TOP;
      const angAt = (t) => ENTRY_A + 0.45 + t * TURNS * TAU; // begins just past the entrance
      const rIn = (t) => R_IN0 + (R_IN1 - R_IN0) * t;
      const rOut = (t) => rWall(rampY(t) - t0 + 0.5) - 0.05;
      const pos = [],
        idx = [],
        idxU = [];
      for (let i = 0; i <= segN; i++) {
        const t = i / segN,
          a = angAt(t),
          y = rampY(t),
          ri = rIn(t),
          ro = rOut(t);
        const ci = Math.cos(a),
          si = Math.sin(a);
        pos.push(
          CX + ci * ri,
          y,
          CZ + si * ri,
          CX + ci * ro,
          y,
          CZ + si * ro,
          CX + ci * ri,
          y - 0.5,
          CZ + si * ri,
          CX + ci * ro,
          y - 0.9,
          CZ + si * ro,
        );
        if (i < segN) {
          const o = i * 4,
            n = o + 4;
          idx.push(o, n, o + 1, o + 1, n, n + 1); // walking surface (normal up)
          idxU.push(o + 2, o + 3, n + 2, o + 3, n + 3, n + 2); // soffit
          idxU.push(o, o + 2, n, o + 2, n + 2, n); // inner edge
        }
      }
      const ramp = new THREE.BufferGeometry();
      ramp.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      ramp.setIndex(idx);
      ramp.computeVertexNormals();
      bi.add("terrazzo", ramp, { grime: 0.45, noAO: true });
      const rampU = new THREE.BufferGeometry();
      rampU.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      rampU.setIndex(idxU);
      rampU.computeVertexNormals();
      bi.add("stucco", rampU, { grime: 0.3, noAO: true, c: 0xe4dcc8 }); // smooth white soffit & ramp edge
      const rampU2 = rampU.clone();
      rampU2.index.array.reverse();
      rampU2.index.needsUpdate = true;
      rampU2.computeVertexNormals();
      bi.add("stucco", rampU2, { grime: 0.3, noAO: true, c: 0xe4dcc8 }); // (winding-agnostic)
      // solid curved parapet (the famous smooth white balustrade) along the inner edge + ramp colliders
      const parapet = [],
        pidx = [];
      for (let i = 0; i <= segN; i++) {
        const t = i / segN,
          a = angAt(t),
          y = rampY(t),
          ri = rIn(t);
        const ci = Math.cos(a),
          si = Math.sin(a);
        for (const [rr, yy] of [
          [ri - 0.02, y - 0.5],
          [ri - 0.02, y + 1.0],
          [ri + 0.12, y + 1.08],
          [ri + 0.28, y + 1.0],
          [ri + 0.28, y],
        ])
          parapet.push(CX + ci * rr, yy, CZ + si * rr);
        if (i < segN) {
          const o = i * 5,
            n = o + 5;
          for (let k = 0; k < 4; k++)
            pidx.push(o + k, o + k + 1, n + k, o + k + 1, n + k + 1, n + k);
        }
      }
      const pg = new THREE.BufferGeometry();
      pg.setAttribute("position", new THREE.Float32BufferAttribute(parapet, 3));
      pg.setIndex(pidx);
      pg.computeVertexNormals();
      bi.add("stucco", pg, { grime: 0.25, noAO: true, c: 0xf2ead8 });
      const pg2 = pg.clone();
      pg2.index.array.reverse();
      pg2.index.needsUpdate = true;
      pg2.computeVertexNormals();
      bi.add("stucco", pg2, { grime: 0.25, noAO: true, c: 0xf2ead8 }); // both faces (winding-agnostic)
      for (let i = 0; i < segN; i++) {
        const tA = i / segN,
          tB = (i + 1) / segN,
          cm = (tA + tB) / 2,
          am = angAt(cm);
        const ri = rIn(cm),
          ro = rOut(cm),
          rm = (ri + ro) / 2;
        const top = (rampY(tA) + rampY(tB)) / 2;
        const tang = -am + Math.PI / 2; // local X along the tangent
        LB.col(
          CX + Math.cos(am) * rm,
          CZ + Math.sin(am) * rm,
          2 * rm * Math.sin((Math.PI * TURNS) / segN) + 0.14,
          ro - ri,
          top - 0.45,
          top,
          tang,
          { surface: "concrete" },
        );
        LB.col(
          CX + Math.cos(am) * (ri + 0.12),
          CZ + Math.sin(am) * (ri + 0.12),
          2 * ri * Math.sin((Math.PI * TURNS) / segN) + 0.08,
          0.34,
          top,
          top + 1.05,
          tang,
          { walkable: false },
        );
      }
      // top landing continuing past the ramp's end, parapets
      const topY = rampY(1),
        aEnd = angAt(1),
        LAND = 1.6,
        rIT = rIn(1),
        rOT = rOut(1);
      for (let k = 0; k < 8; k++) {
        const a0 = aEnd + (LAND * k) / 8,
          a1 = aEnd + (LAND * (k + 1)) / 8,
          am = (a0 + a1) / 2;
        const seg = new THREE.RingGeometry(rIT, rOT, 2, 1, 0, a1 - a0);
        seg.rotateX(-Math.PI / 2);
        bi.add("terrazzo", seg, {
          m: LB.m4(CX, topY + 0.02, CZ, -a1),
          grime: 0.45,
          noAO: true,
        });
        const rm = (rIT + rOT) / 2;
        LB.col(
          CX + Math.cos(am) * rm,
          CZ + Math.sin(am) * rm,
          2 * rm * Math.sin(LAND / 16) + 0.3,
          rOT - rIT,
          topY - 0.4,
          topY,
          -am + Math.PI / 2,
          { surface: "concrete" },
        );
        const px = CX + Math.cos(am) * (rIT + 0.12),
          pz = CZ + Math.sin(am) * (rIT + 0.12),
          len = 2 * rIT * Math.sin(LAND / 16) + 0.1;
        bi.box("stucco", px, topY, pz, len, 1.05, 0.3, {
          ry: -am + Math.PI / 2,
          seg: false,
          grime: 0.25,
          c: 0xf2ead8,
        });
        LB.col(px, pz, len, 0.34, topY, topY + 1.05, -am + Math.PI / 2, {
          walkable: false,
        });
      }
      {
        const ae = aEnd + LAND,
          rm = (rIT + rOT) / 2;
        bi.box(
          "stucco",
          CX + Math.cos(ae) * rm,
          topY,
          CZ + Math.sin(ae) * rm,
          0.3,
          1.05,
          rOT - rIT,
          { ry: -ae + Math.PI / 2, seg: false, c: 0xf2ead8 },
        );
        LB.col(
          CX + Math.cos(ae) * rm,
          CZ + Math.sin(ae) * rm,
          0.34,
          rOT - rIT,
          topY,
          topY + 1.05,
          -ae + Math.PI / 2,
          { walkable: false },
        );
      }
      Object.assign(ctx, {
        rWall,
        rampY,
        angAt,
        rIn,
        rOut,
        topY,
        aEnd,
        rIT,
        rOT,
      });
    },
    exhibits(ctx) {
      const D = LB.dress;
      const {
        anchors,
        CX,
        CZ,
        t0,
        rWall,
        rampY,
        angAt,
        rIn,
        rOut,
        topY,
        aEnd,
        rIT,
        rOT,
      } = ctx;
      const bi = ctx.bi;
      // exhibits: abstract canvases on the wall, sculptures on plinths, museum benches & a toppled Valet robot
      for (let k = 1; k < 16; k++) {
        const t = k / 16,
          a = angAt(t) + 0.04,
          y = rampY(t);
        const rr = rWall(y - t0 + 1.8) - 0.02;
        D.painting(
          bi,
          [4, 5, 4, 5, 6, 0, 4, 5, 3, 4, 5, 2, 4, 5, 7][k - 1],
          CX + Math.cos(a) * rr,
          y + 1.9,
          CZ + Math.sin(a) * rr,
          1.9,
          1.5,
          Math.atan2(-Math.cos(a), -Math.sin(a)),
          { frame: "iron" },
        );
      }
      for (let k = 1; k < 7; k++) {
        const t = k / 7 + 0.03,
          a = angAt(t),
          y = rampY(t),
          rr = (rIn(t) + rOut(t)) / 2 + 0.6;
        const px = CX + Math.cos(a) * rr,
          pz = CZ + Math.sin(a) * rr;
        bi.box("marble", px, y, pz, 0.8, 0.95, 0.8, { seg: false });
        if (k % 3 === 0) {
          bi.add("bronze", new THREE.TorusKnotGeometry(0.45, 0.12, 48, 6), {
            m: LB.m4(px, y + 1.6, pz, k),
            uv: "box",
          });
        } else
          bi.rock(k % 2 ? "bronze" : "chrome", px, y + 1.45, pz, 0.45, {
            rough: 0.9,
            sy: 1.5,
            detail: 1,
          });
        LB.col(px, pz, 0.8, 0.8, y, y + 2.1, 0, { walkable: false });
      }
      for (const [dx, dz, ry] of [
        [-6.5, 3.5, 0.5],
        [-6.5, -3.5, -0.5],
      ]) {
        bi.box("rotten", CX + dx, t0 + 0.4, CZ + dz, 2.2, 0.1, 0.6, {
          ry,
          seg: false,
        });
        for (const s2 of [-0.9, 0.9])
          bi.box(
            "iron",
            CX + dx + Math.cos(ry) * s2,
            t0,
            CZ + dz - Math.sin(ry) * s2,
            0.08,
            0.4,
            0.5,
            { ry, seg: false },
          );
      }
      // wrecked Valet docent toppled in the lobby: barrel torso, box head with a slot lens, one jointed arm, wheel base
      {
        const hx = CX + 4.5,
          hz = CZ + 5.5,
          hy = t0 + 0.42,
          ry = 0.4,
          ca = Math.cos(ry),
          sa = Math.sin(ry);
        const P = (lx, ly, lz) =>
          V(hx + ca * lx + sa * lz, hy + ly, hz - sa * lx + ca * lz);
        const tor = new THREE.CylinderGeometry(0.4, 0.42, 1.1, 12);
        tor.rotateZ(Math.PI / 2);
        bi.add("chrome", tor, { m: LB.m4(hx, hy, hz, ry), grime: 0.5 });
        bi.add("paint_cream", new THREE.BoxGeometry(0.42, 0.4, 0.4), {
          m: LB.m4(P(0.78, 0, 0).x, hy - 0.02, P(0.78, 0, 0).z, ry, 0, 0.3),
          grime: 0.5,
        });
        bi.add("glass_dark", new THREE.BoxGeometry(0.04, 0.08, 0.3), {
          m: LB.m4(P(1.0, 0, 0).x, hy + 0.04, P(1.0, 0, 0).z, ry, 0, 0.3),
        });
        const base = new THREE.CylinderGeometry(0.28, 0.2, 0.3, 10);
        base.rotateZ(Math.PI / 2);
        bi.add("rust", base, {
          m: LB.m4(P(-0.7, 0, 0).x, hy - 0.1, P(-0.7, 0, 0).z, ry),
        });
        bi.beam("iron", P(0.2, 0.25, 0.3), P(0.35, -0.05, 0.75), 0.05);
        bi.beam("iron", P(0.35, -0.05, 0.75), P(0.7, -0.35, 0.95), 0.045);
        bi.sphere(
          "iron",
          P(0.7, -0.35, 0.95).x,
          t0 + 0.08,
          P(0.7, -0.35, 0.95).z,
          0.08,
          {},
        );
        LB.col(hx, hz, 1.1, 1.1, t0, t0 + 1.1, 0, {
          walkable: false,
          surface: "metal",
        });
      }
      const skK = LB.texMat(
        "gugg_notice",
        LB.signTex(
          "gugg_notice",
          ["PLEASE BEGIN YOUR VISIT", "AT THE TOP"],
          "enamel",
          512,
          160,
          { bg: "#1a1a1a", fg: "#e8e0c8" },
        ),
      );
      bi.quad(skK, CX - 10.3, t0 + 2.2, CZ + 2.6, 2.2, 0.7, {
        ry: Math.PI / 2,
      });
      LB.skeleton(bi, CX - 5, t0 + 0.08, CZ + 6, 2.2);
      LB.skeleton(
        bi,
        CX + Math.cos(angAt(0.6)) * 10.3,
        rampY(0.6) + 0.02,
        CZ + Math.sin(angAt(0.6)) * 10.3,
        0.4,
      );
      D.papers(bi, CX - 4, t0 + 0.06, CZ - 3, 3, 16, 7);
      D.rubble(bi, CX + 7, t0 + 0.06, CZ - 5, 1.1, 6, 3);
      // anchors
      anchors.atrium = LB.anchor(CX - 6, t0 + 0.06, CZ - 2, -Math.PI / 2);
      const aMid = angAt(0.5),
        rMid = (rIn(0.5) + rOut(0.5)) / 2;
      anchors.ramp_mid = LB.anchor(
        CX + Math.cos(aMid) * rMid,
        rampY(0.5),
        CZ + Math.sin(aMid) * rMid,
        0,
      );
      const aTop = aEnd + 0.8,
        rTop = (rIT + rOT) / 2;
      anchors.top = LB.anchor(
        CX + Math.cos(aTop) * rTop,
        topY,
        CZ + Math.sin(aTop) * rTop,
        LB.yawTo(
          CX + Math.cos(aTop) * rTop,
          CZ + Math.sin(aTop) * rTop,
          CX,
          CZ,
        ),
      );
      anchors.boss = anchors.top.clone();
      anchors.boss.yaw = anchors.top.yaw;
      anchors.loot = LB.anchor(
        CX + Math.cos(aEnd + 1.4) * rTop,
        topY,
        CZ + Math.sin(aEnd + 1.4) * rTop,
        0,
      );
      anchors.spawn1 = LB.anchor(CX + 4, t0, CZ + 5);
      anchors.spawn2 = anchors.ramp_mid.clone();
    },
    /** After the exterior batch is built (ctx.g = landmark group). */
    finish(ctx) {
      const { anchors } = ctx;
      ctx.bi.build(ctx.g);
      LB.onReady.push(() => {
        const a = anchors.loot;
        LB.spawnProp("ammo_box", {
          x: a.x,
          y: a.y,
          z: a.z,
          yaw: 0,
          loot: "ammo",
        });
      });
    },
  };
})();
