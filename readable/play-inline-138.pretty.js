/* src/landmarks_b/30_downtown_interior.js */
/* =====================================================================
 * LANDMARKS B — DOWNTOWN INTERIORS (walk-in, baked-light batches):
 *  • Flatiron Trading Post: the covered market lane on the ground floor
 *    (the Prow bar, Caldwell & Daughters, Gus's Guns, chem/junk stalls,
 *    Doc Kwan's clinic, workshop, food court, string lights) + its
 *    merchant/NPC anchors and props.
 *  • City Hall rotunda: marble floor, ring of columns, coffered saucer
 *    dome with a lamp-lit oculus, cantilevered stair, the Mayor's desk,
 *    the Mayor's terminal.
 *  • NYSE trading floor ("The Exchange"): trading posts with CRT rings,
 *    ticker bands, the Boss's throne, bell podium, cages, the fence's
 *    stall, the Boss's safe.
 * Called from the exterior builders in 30_downtown.js through
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
  // the Exchange boss's safe: keypad code scratched on the back of his throne (read it → learnCode)
  const EXCHANGE_SAFE = {
    id: "lb_exchange_boss_safe",
    label: "The Boss's Safe (the Exchange)",
    code: "1929",
    kind: "safe",
    hint: "Scratched into the back of the Boss's throne on the trading floor",
    learnedFrom: "Scratches on the Boss's throne, the Exchange",
  };

  // =====================================================================
  // FLATIRON — the Trading Post (ground-floor market street)
  // =====================================================================
  LB.interiors.flatiron = {
    /** ctx: {root, anchors, P (footprint), inner (inset footprint), doors (edge → openings), H_BASE}. */
    market(ctx) {
      const K = LB.kit,
        D = LB.dress;
      const { anchors, P, inner, doors, H_BASE } = ctx;
      const bi = (ctx.bi = LB.batch("flatiron_int"));
      bi.ground = 0;
      bi.aoH = 2.5;
      const LN0 = 127,
        LN1 = 133; // the market lane (kept clear)
      bi.setLights(
        [
          { x: 137, y: 3.4, z: 101, color: 0xffb060, r: 12, i: 1.0 }, // bar lamps
          { x: 136, y: 3.4, z: 113, color: 0xffc070, r: 12, i: 0.9 }, // Caldwell stall
          { x: 145, y: 3.2, z: 130, color: 0xffd090, r: 14, i: 1.0 }, // string lights over the lane
          { x: 137, y: 3.2, z: 130, color: 0xffd090, r: 12, i: 0.8 },
          { x: 155, y: 3.2, z: 130, color: 0xffd090, r: 12, i: 0.8 },
          { x: 150, y: 3.4, z: 120, color: 0xffc070, r: 11, i: 0.8 }, // Gus's guns
          { x: 160, y: 3.3, z: 142, color: 0xe8f4ff, r: 12, i: 1.0 }, // clinic (cool fluorescent)
          { x: 140, y: 3.4, z: 142, color: 0xffb060, r: 12, i: 0.8 }, // workshop
          { x: 149, y: 3.2, z: 144, color: 0xffc070, r: 10, i: 0.7 },
          { x: 141, y: 3.2, z: 118, color: 0xffc070, r: 10, i: 0.7 },
        ],
        0xc8b494,
        0.42,
      );
      K.prism(bi, "tile_floor", inner, -0.1, 0.05, { grime: 0.6, noAO: true });
      // ceiling (pressed tin, painted cream) + interior lining (wallpaper over a dark wood dado) with the same openings
      {
        // pressed-tin ceiling, painted cream (a downward-facing polygon)
        const sh = new THREE.Shape();
        sh.moveTo(inner[0][0], inner[0][1]);
        for (let i = 1; i < inner.length; i++)
          sh.lineTo(inner[i][0], inner[i][1]);
        sh.closePath();
        const cg = new THREE.ShapeGeometry(sh);
        cg.rotateX(Math.PI / 2);
        const n = cg.attributes.normal;
        if (n.getY(0) > 0) {
          cg.index.array.reverse();
          cg.index.needsUpdate = true;
          for (let i = 0; i < n.count; i++) n.setY(i, -1);
        }
        bi.add("panel", cg, {
          m: LB.m4(0, H_BASE - 0.1, 0),
          grime: 0.35,
          noAO: true,
          c: 0xe0d8c0,
          uvScale: 1.2,
        });
        for (let x = 133; x < 172; x += 3.2) {
          // exposed joists, clipped to the triangle (diagonal east wall ↔ south wall)
          const za = Math.max(95.6, 93.7 + (x - 135.2) / 0.7016 + 1.3),
            zb = 148.2;
          if (zb - za > 1)
            bi.box(
              "rotten",
              x,
              H_BASE - 0.42,
              (za + zb) / 2,
              0.22,
              0.3,
              zb - za,
              { seg: false, grime: 0.5 },
            );
        }
      }
      const lin = K.offsetPoly(P, -0.72);
      for (let i = 0; i < lin.length; i++) {
        const p = lin[i],
          q = lin[(i + 1) % lin.length];
        const dx = q[0] - p[0],
          dz = q[1] - p[1],
          len = Math.hypot(dx, dz);
        if (len < 0.5) continue;
        // project the facade's door openings (measured along the outer edge) onto this lining edge
        const po = P[i],
          qo = P[(i + 1) % P.length],
          lo = Math.hypot(qo[0] - po[0], qo[1] - po[1]);
        const proj = (t) => {
          const wx = po[0] + ((qo[0] - po[0]) * t) / lo,
            wz = po[1] + ((qo[1] - po[1]) * t) / lo;
          return ((wx - p[0]) * dx + (wz - p[1]) * dz) / len;
        };
        const ry = Math.atan2(-dz, dx),
          gaps = (doors[i] || [])
            .map((gp) => [proj(gp[0]), proj(gp[1])])
            .sort((a, c) => a[0] - c[0]);
        let cur = 0;
        const spans = [];
        for (const g of gaps) {
          spans.push([cur, g[0] - 0.2]);
          cur = g[1] + 0.2;
        }
        spans.push([cur, len]);
        for (const [a, c] of spans) {
          if (c - a < 0.1) continue;
          const m = (a + c) / 2,
            cx = p[0] + (dx / len) * m,
            cz = p[1] + (dz / len) * m;
          bi.box("rotten", cx, 0, cz, c - a, 1.1, 0.04, {
            ry,
            seg: false,
            grime: 0.6,
          });
          bi.box("wallpaper", cx, 1.1, cz, c - a, H_BASE - 1.2, 0.03, {
            ry,
            seg: false,
            grime: 0.5,
          });
        }
      }
      // --- the Prow bar (north tip) ---
      bi.boxMM("planks", 133.2, 0, 104.2, 139.5, 1.1, 105.0, { grime: 0.5 });
      bi.boxMM("rust", 133.1, 1.1, 104.1, 139.6, 1.16, 105.1, { seg: false });
      LB.colMM(133.2, 0, 104.2, 139.5, 1.12, 105.0, { walkable: false });
      D.shelf(bi, 134.3, 0, 99.2, 0.62, 2.4, 3, 31);
      for (const x of [134.5, 136.3, 138.1]) {
        bi.cyl("iron", x, 0, 106.0, 0.05, 0.08, 0.72, 6, { hSeg: 1 });
        bi.cyl("awning_red", x, 0.72, 106.0, 0.24, 0.24, 0.08, 10, { hSeg: 1 });
      }
      const barK = LB.texMat(
        "flatiron_bar",
        LB.signTex(
          "flatiron_bar",
          ["THE PROW", "BAR & GRILL"],
          "neon",
          512,
          192,
          { fg: "#40c8ff" },
        ),
        { emissive: 1.5, noShadow: true },
      );
      bi.quad(barK, 136.4, 3.25, 103.6, 2.6, 0.95, { ry: 0 });
      for (const x of [134.8, 138.0]) {
        bi.cyl("iron", x, 3.4, 104.6, 0.01, 0.01, 1.1, 4, { hSeg: 1 });
        bi.sphere("lamp", x, 3.35, 104.6, 0.14, { noAO: true, grime: 0 });
        LB.glows.push({ pos: V(x, 3.35, 104.6), color: 0xffb060, size: 0.8 });
      }
      anchors.bar = LB.anchor(136.4, 0, 102.6, Math.PI); // bartender behind the counter, facing the room (south)
      // --- Caldwell & Daughters convoy supply (west wall, north of the lane) ---
      D.stall(bi, 134.6, 114, Math.PI / 2, 5.2, 2.6, {
        goods: "cans",
        sign: "CALDWELL & DAUGHTERS",
        signStyle: "enamel",
        signColors: { bg: "#2c3e2a", fg: "#e8d8a0" },
        awning: "awning_green",
        seed: 41,
      });
      anchors.merchant1 = LB.anchor(134.6, 0, 114, -Math.PI / 2);
      anchors.supply = anchors.merchant1.clone();
      anchors.supply.yaw = -Math.PI / 2;
      D.crates(bi, 133.2, 0, 108.4, 3, 42);
      D.crates(bi, 134.1, 0, 108.9, 2, 43);
      // pack-ox hitching rail (no oxen — yet) + trough
      bi.box("rotten", 139.5, 0.9, 110, 0.12, 0.12, 4.0, { seg: false });
      for (const z of [108.1, 111.9])
        bi.box("rotten", 139.5, 0, z, 0.14, 1.0, 0.14, { seg: false });
      bi.box("rotten", 139.9, 0, 110, 0.7, 0.45, 2.6, { seg: false });
      // --- Gus's Guns (north side of the lane, against the diagonal wall) ---
      D.stall(bi, 151.2, 120.5, -0.62, 4.6, 2.4, {
        goods: "guns",
        sign: "GUS'S GUNS & AMMO",
        seed: 44,
        awning: "stripe_red",
      });
      anchors.merchant2 = LB.anchor(
        151.2,
        0,
        120.5,
        LB.yawTo(151.2, 120.5, 151.2 - 0.58, 120.5 + 0.81),
      );
      anchors.shop = anchors.merchant2.clone();
      anchors.shop.yaw = anchors.merchant2.yaw;
      D.crates(bi, 144.2, 0, 118.2, 2, 45);
      D.crates(bi, 143.3, 0, 117.6, 1, 46);
      // --- chem & junk stalls along the west wall south of the lane ---
      D.stall(bi, 134.6, 138.0, Math.PI / 2, 4.0, 2.4, {
        goods: "bottles",
        sign: "MEDS · FIZZO · WATER",
        seed: 47,
        awning: "stripe_red",
      });
      D.stall(bi, 134.6, 144.6, Math.PI / 2, 4.0, 2.4, {
        goods: "junk",
        sign: "JUNK = SCRIP",
        seed: 48,
      });
      anchors.stall1 = LB.anchor(134.6, 0, 138.0, -Math.PI / 2);
      // --- Doc Kwan's clinic (south-east corner) ---
      bi.boxMM("panel", 156, 0, 138.6, 163, 1.05, 139.3, {
        seg: false,
        grime: 0.5,
      });
      LB.colMM(156, 0, 138.6, 163, 1.1, 139.3, { walkable: false });
      for (const [x, z] of [
        [160.5, 145.6],
        [165.5, 145.6],
      ]) {
        bi.box("iron", x, 0.4, z, 2.0, 0.08, 0.9, { seg: false });
        bi.box("fabric", x, 0.48, z, 1.9, 0.14, 0.85, {
          seg: false,
          c: 0xd8d0c0,
        });
        for (const dx of [-0.9, 0.9])
          bi.box("iron", x + dx, 0, z, 0.05, 0.42, 0.85, { seg: false });
      }
      bi.box("paint_cream", 157.2, 0, 146.8, 1.2, 1.9, 0.5, { seg: false });
      bi.box("paint_red", 157.2, 1.2, 146.54, 0.5, 0.5, 0.02, { seg: false }); // med cabinet with a red cross panel
      D.fluoro(bi, 159.5, 3.9, 142, 0, 2.2, true, H_BASE - 0.1);
      const clK = LB.texMat(
        "flatiron_clinic",
        LB.signTex(
          "flatiron_clinic",
          ["CLINIC", "DOC KWAN — TONIC · RAD FLUSH"],
          "enamel",
          512,
          160,
          { bg: "#e8e0d0", fg: "#a82a22" },
        ),
      );
      bi.quad(clK, 159.5, 3.0, 138.5, 2.6, 0.8, { ry: Math.PI });
      anchors.doctor = LB.anchor(159.5, 0, 140.4, 0);
      anchors.clinic = anchors.doctor.clone();
      anchors.clinic.yaw = 0;
      // --- workshop corner (workbench spawned by props) + generator humming along ---
      bi.box("panel", 143.5, 0, 146.8, 1.8, 1.3, 1.2, {
        seg: false,
        grime: 0.7,
      });
      bi.cyl("rust", 143.5, 1.3, 146.8, 0.12, 0.12, 1.2, 6, { hSeg: 1 });
      LB.col(143.5, 146.8, 1.8, 1.2, 0, 1.3, 0, {
        walkable: false,
        surface: "metal",
      });
      D.cable(
        bi,
        [
          V(143.5, 1.2, 146.2),
          V(145, 3.9, 140),
          V(150, 4.0, 131),
          V(156, 3.9, 128),
        ],
        0.4,
      );
      // tables & chairs in the lane-side "food court"
      for (const [x, z] of [
        [141, 124.5],
        [150, 136.4],
        [142, 136],
      ]) {
        bi.cyl("rotten", x, 0, z, 0.08, 0.1, 0.9, 6, { hSeg: 1 });
        bi.cyl("rotten", x, 0.9, z, 0.6, 0.6, 0.06, 10, { hSeg: 1 });
        for (let k = 0; k < 3; k++)
          D.chair(
            bi,
            x + Math.cos(k * 2.1) * 0.95,
            0,
            z + Math.sin(k * 2.1) * 0.95,
            -k * 2.1 - Math.PI / 2,
            k === 2 && x === 150,
          );
        LB.col(x, z, 1.2, 1.2, 0, 0.95, 0, { walkable: false });
      }
      // string lights zig-zagging over the market lane
      for (let k = 0; k < 5; k++) {
        const x0 = 132 + k * 4.9;
        D.stringLights(
          bi,
          V(x0, 3.9, k % 2 ? LN0 - 1.5 : LN1 + 1.5),
          V(x0 + 4.9, 3.9, k % 2 ? LN1 + 1.5 : LN0 - 1.5),
          0.5,
          10,
        );
      }
      // hanging lanterns elsewhere
      for (const [x, z] of [
        [137, 118],
        [150, 131],
        [141, 143],
        [149, 144],
      ]) {
        bi.cyl("iron", x, 3.3, z, 0.02, 0.02, 1.2, 4, { hSeg: 1 });
        bi.sphere("lamp", x, 3.2, z, 0.16, { noAO: true, grime: 0 });
        LB.glows.push({ pos: V(x, 3.2, z), color: 0xffc070, size: 0.9 });
      }
      D.papers(bi, 146, 0.05, 130, 4, 14, 49);
      anchors.soda_machine = LB.anchor(135.5, 0, 106.6, -Math.PI / 2);
      anchors.terminal = LB.anchor(137.5, 0, 146.9, Math.PI);
      anchors.office = anchors.terminal.clone();
      anchors.office.yaw = Math.PI;
      anchors.market = LB.anchor(145, 0, 130, 0);
    },
    /** After the exterior batch is built (ctx.g = landmark group). */
    finish(ctx) {
      const { anchors } = ctx;
      anchors.spawn1 = LB.anchor(140, 0, 120);
      anchors.spawn2 = LB.anchor(155, 0, 140);
      ctx.bi.build(ctx.g);
      LB.onReady.push(() => {
        LB.spawnProp("fizzo_machine", {
          x: 134.9,
          y: 0,
          z: 106.6,
          yaw: -Math.PI / 2 + Math.PI,
        });
        LB.spawnProp("workbench", { x: 146.8, y: 0, z: 147.4, yaw: Math.PI });
        LB.spawnProp("first_aid", { x: 162.5, y: 1.2, z: 147.6, yaw: Math.PI });
      });
    },
  };

  // =====================================================================
  // CITY HALL — the walk-in rotunda
  // =====================================================================
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
  LB.interiors.nyse = {
    /** ctx: {root, anchors, X0, X1, XC, ZF, ZB (hall walls), H (hall height)}. */
    floor(ctx) {
      const K = LB.kit,
        D = LB.dress;
      const { anchors, X0, X1, XC, ZF, ZB, H } = ctx;
      const bi = (ctx.bi = LB.batch("nyse_floor"));
      bi.ground = 0;
      bi.aoH = 3;
      const IX0 = X0 + 1.2,
        IX1 = X1 - 1.2,
        IZ0 = ZF + 1.2,
        IZ1 = ZB - 1.2;
      bi.setLights(
        [
          { x: XC - 6, y: 1.4, z: 824.5, color: 0xff9a40, r: 12, i: 1.1 },
          { x: XC + 7, y: 1.4, z: 839.5, color: 0xff9a40, r: 12, i: 1.1 }, // burning barrels
          { x: XC - 7, y: 12.0, z: 831, color: 0xffd8a0, r: 17, i: 0.9 },
          { x: XC + 7, y: 12.0, z: 831, color: 0xffd8a0, r: 17, i: 0.9 }, // work lamps
          { x: XC, y: 12.0, z: 826, color: 0xffd8a0, r: 14, i: 0.7 },
          { x: XC, y: 5, z: 834.5, color: 0x60ff90, r: 9, i: 0.5 },
          { x: XC - 7, y: 5, z: 827.5, color: 0x60ff90, r: 7, i: 0.4 },
          { x: XC + 7, y: 5, z: 827.5, color: 0x60ff90, r: 7, i: 0.4 },
          { x: IX0 + 1.5, y: 9, z: 831.5, color: 0xffc070, r: 9, i: 0.6 }, // bell podium lamp
        ],
        0xc8b8a0,
        0.22,
      );
      bi.boxMM("planks", IX0, 0, IZ0, IX1, 0.06, IZ1, {
        grime: 0.6,
        noAO: true,
        uvScale: 3,
      });
      LB.colMM(X0, -0.5, ZF, X1, 0.06, ZB);
      // interior lining: dark panelled dado + plaster above, coffered ceiling grid
      for (const [x0, z0, x1, z1] of [
        [IX0, IZ0, IX1, IZ0 + 0.05],
        [IX0, IZ1 - 0.05, IX1, IZ1],
        [IX0, IZ0, IX0 + 0.05, IZ1],
        [IX1 - 0.05, IZ0, IX1, IZ1],
      ]) {
        const isDoorWall = z0 === IZ0 && z1 === IZ0 + 0.05;
        if (isDoorWall) {
          bi.boxMM("rotten", x0, 0, z0, XC - 1.8, 2.4, z1, { seg: false });
          bi.boxMM("rotten", XC + 1.8, 0, z0, x1, 2.4, z1, { seg: false });
          bi.boxMM("plaster", x0, 3.1, z0, x1, H - 3, z1, { grime: 0.5 });
          bi.boxMM("plaster", x0, 2.4, z0, XC - 1.8, 3.1, z1, { seg: false });
          bi.boxMM("plaster", XC + 1.8, 2.4, z0, x1, 3.1, z1, { seg: false });
        } else {
          bi.boxMM("rotten", x0, 0, z0, x1, 2.4, z1, {
            seg: false,
            grime: 0.6,
          });
          bi.boxMM("plaster", x0, 2.4, z0, x1, H - 3, z1, { grime: 0.5 });
        }
      }
      bi.boxMM("plaster", IX0, H - 3.05, IZ0, IX1, H - 3, IZ1, { grime: 0.3 });
      for (let x = IX0 + 2.5; x < IX1; x += 3.4)
        bi.box("marble", x, H - 3.8, (IZ0 + IZ1) / 2, 0.5, 0.8, IZ1 - IZ0, {
          seg: false,
          grime: 0.3,
        });
      for (let z = IZ0 + 2.5; z < IZ1; z += 3.4)
        bi.box("marble", XC, H - 3.8, z, IX1 - IX0, 0.8, 0.5, {
          seg: false,
          grime: 0.3,
        });
      // scrolling stock ticker bands (seamless: the canvas holds exactly one cycle of quotes)
      const TK = (() => {
        const items = [
          ["SCRIP", "▲", "0.02"],
          ["RALLY TONIC", "▼", "4.50"],
          ["RUSH", "▲", "12.00"],
          ["PURIFIED H2O", "▲", "9.75"],
          ["OX HIDE", "▼", "1.10"],
          ["CIVIL DEFENSE", "▼", "0.00"],
          ["FIZZO", "▲", "3.33"],
          ["PRUSSIAN BLUE", "▲", "7.40"],
          ["RECOILLESS RD", "▼", "88.00"],
          ["BISCUIT", "▲", "∞"],
        ];
        const mc = document.createElement("canvas").getContext("2d");
        mc.font = 'bold 34px "Courier New", monospace';
        let wTot = 0;
        for (const it of items)
          wTot +=
            mc.measureText(it[0] + " ").width +
            mc.measureText(it[1] + it[2] + "    ").width;
        const W = Math.ceil(wTot);
        const tex = LB.canvasTex("lb_ticker2", W, 64, (ctx, w, h) => {
          ctx.fillStyle = "#050805";
          ctx.fillRect(0, 0, w, h);
          ctx.font = 'bold 34px "Courier New", monospace';
          ctx.textBaseline = "middle";
          let x = 0;
          for (const it of items) {
            ctx.fillStyle = "#e8c860";
            ctx.fillText(it[0], x, h / 2);
            x += ctx.measureText(it[0] + " ").width;
            ctx.fillStyle = it[1] === "▲" ? "#50ff70" : "#ff5040";
            ctx.fillText(it[1] + it[2], x, h / 2);
            x += ctx.measureText(it[1] + it[2] + "    ").width;
          }
        });
        return {
          key: LB.texMat("nyse_ticker2", tex, {
            emissive: 1.4,
            noShadow: true,
          }),
          W,
        };
      })();
      const TKH = 1.3,
        tkLen = IX1 - IX0 - 0.4;
      for (const zz of [IZ0 + 0.1, IZ1 - 0.1])
        bi.quad(TK.key, XC, 9, zz, tkLen, TKH, {
          ry: zz < 830 ? 0 : Math.PI,
          us: tkLen / ((TK.W / 64) * TKH),
          grime: 0,
          noAO: true,
        });
      // trading posts: counter ring, a mast carrying a ring of CRT monitors, cables, paper everywhere
      const post = (x, z, seed) => {
        bi.cyl("paint_cream", x, 0, z, 2.2, 2.3, 1.15, 20, {
          hSeg: 1,
          grime: 0.6,
        });
        bi.cyl("rotten", x, 1.15, z, 2.45, 2.45, 0.1, 20, { hSeg: 1 });
        bi.cyl("iron", x, 1.25, z, 0.22, 0.22, 3.4, 8, { hSeg: 1 });
        bi.cyl("paint_cream", x, 4.3, z, 2.7, 2.7, 1.05, 16, {
          hSeg: 1,
          open: true,
          grime: 0.7,
        });
        bi.cyl("panel", x, 5.35, z, 2.75, 2.75, 0.08, 16, { hSeg: 1 });
        bi.cyl("panel", x, 4.22, z, 2.75, 2.75, 0.08, 16, { hSeg: 1 });
        const r = LB.rng(seed);
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU;
          bi.quad(
            r() < 0.45 ? "screen" : "glass_dark",
            x + Math.sin(a) * 2.72,
            4.82,
            z + Math.cos(a) * 2.72,
            1.15,
            0.72,
            { ry: a, noAO: true, grime: 0 },
          );
        }
        for (let i = 0; i < 5; i++) {
          const a = r() * TAU;
          D.monitor(
            bi,
            x + Math.sin(a) * 1.8,
            1.25,
            z + Math.cos(a) * 1.8,
            a,
            r() < 0.4,
          );
        }
        D.cable(
          bi,
          [V(x, 5.4, z), V(x + (r() - 0.5) * 8, H - 3.2, z + (r() - 0.5) * 6)],
          1.2,
        );
        LB.col(x, z, 4.4, 4.4, 0, 1.3, 0, {
          walkable: false,
          surface: "metal",
        });
      };
      post(XC - 7, 827.5, 1);
      post(XC, 834.5, 2);
      post(XC + 7, 827.5, 3);
      // the Boss's throne on the centre post: car seats, a gas-station sign as a backrest, skulls & a hoard of gilt plates
      bi.box("paint_red", XC, 1.25, 834.5, 1.3, 0.45, 1.1, {
        seg: false,
        grime: 0.6,
      });
      bi.box("paint_red", XC, 1.7, 835.05, 1.3, 1.5, 0.25, {
        rx: -0.12,
        seg: false,
        grime: 0.6,
      });
      for (const s of [-0.75, 0.75])
        bi.box("chrome", XC + s, 1.25, 834.5, 0.2, 0.75, 1.0, { seg: false });
      bi.quad(LB.brandMat("hi_octane"), XC, 3.4, 835.25, 2.6, 1.3, {
        ry: Math.PI,
        rz: 0.08,
      });
      // the safe combination, scratched into the back of the backrest (faces the Boss's safe)
      const scK = LB.texMat(
        "nyse_throne_scrawl",
        LB.graffitiTex(
          "throne_scrawl",
          ["SAFE 1929", "LIKE THE CRASH"],
          512,
          256,
          { color: "#e8e0c8", drips: false },
        ),
        { transparent: true },
      );
      bi.quad(scK, XC, 2.3, 835.36, 1.1, 0.55, { grime: 0, noAO: true });
      for (let i = 0; i < 3; i++)
        bi.sphere("bone", XC - 1 + i, 3.3 + (i % 2) * 0.3, 835.2, 0.16, {
          sx: 1,
          sy: 1.1,
          sz: 1.2,
        });
      for (let i = 0; i < 18; i++)
        bi.cyl(
          "gilt",
          XC - 3.2 + Math.sin(i) * 1.3,
          0.06 + (i % 3) * 0.1,
          838.8 + Math.cos(i * 1.7) * 0.9,
          0.35,
          0.4,
          0.12,
          10,
          { hSeg: 1 },
        );
      // the bell podium balcony on the west wall (closing bell, still rung for raider auctions)
      const BPY = 6.5;
      bi.boxMM("marble", IX0, BPY - 0.4, 829, IX0 + 2.6, BPY, 834, {
        seg: false,
      });
      K.balustrade(
        bi,
        "marble",
        [
          [IX0 + 2.5, 829],
          [IX0 + 2.5, 834],
        ],
        BPY,
        1.0,
        {},
      );
      for (const z of [829.3, 833.7])
        bi.box("marble", IX0 + 1.2, BPY - 1.6, z, 2.3, 1.2, 0.4, {
          seg: false,
        });
      bi.box("iron", IX0 + 0.6, BPY, 831.5, 0.12, 2.2, 0.12, { seg: false });
      bi.box("iron", IX0 + 0.6, BPY + 2.2, 831.5, 0.12, 0.12, 1.2, {
        seg: false,
      });
      bi.lathe(
        "gilt",
        [
          [0.05, 0],
          [0.3, 0.05],
          [0.42, 0.4],
          [0.4, 0.6],
          [0.12, 0.72],
        ],
        12,
        IX0 + 0.6,
        BPY + 1.35,
        831.5,
        { rx: Math.PI },
      );
      const bellK = LB.texMat(
        "nyse_bell",
        LB.signTex(
          "nyse_bell",
          ["AUCTION TODAY", "LOT 1: YOU"],
          "raider",
          512,
          192,
          { bg: "#4a463c" },
        ),
      );
      bi.quad(bellK, IX0 + 2.62, BPY - 0.9, 831.5, 2.2, 0.8, {
        ry: Math.PI / 2,
      });
      anchors.bell = LB.anchor(IX0 + 1.5, BPY, 831.5, -Math.PI / 2);
      // Round 2: the podium was unreachable (no floor collider, no way up). The raiders built an L-shaped scrap stair:
      // along the front wall (west-bound, from x 10.2) to a landing in the SW corner, then north up the west wall to the
      // podium's south end. Solid stepped mass (corrugated sheet risers over scrap fill, steel treads) = solid colliders.
      LB.colMM(IX0, BPY - 0.4, 829, IX0 + 2.6, BPY, 834, { surface: "wood" });
      LB.colWall(IX0 + 2.55, 829, IX0 + 2.55, 834, 0.25, BPY, BPY + 1.0, {
        walkable: false,
      });
      {
        const LY = 2.6,
          ZA = IZ0 + 0.15,
          ZBs = IZ0 + 1.25,
          XL0 = IX0 + 0.15,
          XL1 = IX0 + 1.4,
          XS = 10.2;
        const step = (x0, z0, x1, z1, top) => {
          bi.boxMM("corrugated", x0, 0, z0, x1, top - 0.06, z1, { grime: 0.7 });
          bi.boxMM(
            "steel",
            x0 - 0.02,
            top - 0.06,
            z0 - 0.02,
            x1 + 0.02,
            top,
            z1 + 0.02,
            { seg: false, grime: 0.5 },
          );
          LB.colMM(x0, 0, z0, x1, top, z1, { surface: "metal" });
        };
        // flight 1: along the front wall, rising westward to the landing
        const n1 = 10,
          r1 = (XS - XL1) / n1;
        for (let i = 0; i < n1; i++)
          step(XS - r1 * (i + 1), ZA, XS - r1 * i, ZBs, (LY * (i + 1)) / n1);
        // landing (SW corner)
        step(XL0, ZA, XL1, ZBs + 0.2, LY);
        // flight 2: north up the west wall to the podium
        const Z2 = ZBs + 0.2,
          n2 = 14,
          r2 = (829 - Z2) / n2;
        for (let i = 0; i < n2; i++)
          step(
            XL0,
            Z2 + r2 * i,
            XL1,
            Z2 + r2 * (i + 1),
            LY + ((BPY - LY) * (i + 1)) / n2,
          );
        // hand rails on the open sides (+ colliders), a few scrap props
        const rail = (ax, az, ay, bx2, bz, by) => {
          bi.beam(
            "iron",
            V(ax, ay + 1.0, az),
            V(bx2, by + 1.0, bz),
            0.05,
            0.05,
          );
          for (let k = 0; k <= 3; k++) {
            const t = k / 3;
            bi.box(
              "iron",
              ax + (bx2 - ax) * t,
              ay + (by - ay) * t,
              az + (bz - az) * t,
              0.05,
              1.0,
              0.05,
              { seg: false },
            );
          }
        };
        rail(
          XS - r1 * 1.5,
          ZBs + 0.06,
          (LY * 1.5) / n1,
          XL1 + 0.05,
          ZBs + 0.06,
          LY,
        );
        LB.colWall(
          XS - r1 * 1.5,
          ZBs + 0.08,
          XL1 + 0.3,
          ZBs + 0.08,
          0.12,
          0,
          LY + 1.0,
          { walkable: false },
        );
        rail(XL1 + 0.06, Z2 + 0.3, LY, XL1 + 0.06, 829, BPY);
        LB.colWall(XL1 + 0.08, Z2 + 0.3, XL1 + 0.08, 829, 0.12, 0, BPY + 1.0, {
          walkable: false,
        });
        bi.beam(
          "iron",
          V(XL1 + 0.06, BPY + 1.0, 829.05),
          V(IX0 + 2.55, BPY + 1.0, 829.05),
          0.05,
          0.05,
        );
        bi.box("iron", IX0 + 2.5, BPY, 829.05, 0.05, 1.0, 0.05, { seg: false });
        LB.colWall(
          XL1 + 0.1,
          829.05,
          IX0 + 2.55,
          829.05,
          0.15,
          BPY,
          BPY + 1.0,
          { walkable: false },
        );
        const tag = LB.texMat(
          "nyse_stair_tag",
          LB.signTex("nyse_stair_tag", ["BIDDERS ONLY ▲"], "raider", 256, 96, {
            bg: "#4a463c",
          }),
        );
        bi.quad(tag, XS - 1.2, 1.2, ZBs + 0.03, 1.6, 0.6, { ry: 0 });
      }
      // cages, mattresses, overturned chairs, paper drifts, burning barrels, lamps
      for (const [x, z] of [
        [IX0 + 2.2, 840],
        [IX1 - 2.2, 840],
      ]) {
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * TAU;
          bi.box(
            "iron",
            x + Math.cos(a) * 1.3,
            0.06,
            z + Math.sin(a) * 1.3,
            0.06,
            2.6,
            0.06,
            { seg: false },
          );
        }
        bi.cyl("iron", x, 2.66, z, 1.4, 1.4, 0.1, 10, { hSeg: 1 });
        LB.col(x, z, 2.6, 2.6, 0, 2.7, 0, { walkable: false });
      }
      LB.skeleton(bi, IX1 - 2.2, 0.1, 840, 0.5);
      for (let i = 0; i < 4; i++)
        D.mattress(
          bi,
          IX1 - 1.2,
          0.06,
          823.5 + i * 2.3,
          Math.PI / 2 + (i % 2) * 0.2,
        );
      const cr = LB.rng("nyse_chairs");
      for (let i = 0; i < 12; i++)
        D.chair(
          bi,
          XC + (cr() - 0.5) * 20,
          0.06,
          823 + cr() * 17,
          cr() * TAU,
          cr() < 0.6,
          cr() < 0.5 ? "rotten" : "iron",
        );
      D.papers(bi, XC - 5, 0.06, 831, 5, 40, 11);
      D.papers(bi, XC + 5, 0.06, 836, 4, 30, 12);
      D.papers(bi, XC + 2, 0.06, 824, 3, 20, 13);
      LB.barrel(bi, XC - 6, 0.06, 824.5, { fire: true });
      LB.barrel(bi, XC + 7, 0.06, 839.5, { fire: true });
      for (const [x, z] of [
        [XC - 7, 831],
        [XC + 7, 831],
        [XC, 826],
      ]) {
        bi.cyl("iron", x, 12.8, z, 0.02, 0.02, H - 3 - 12.8, 4, { hSeg: 1 });
        bi.cyl("iron", x, 12.4, z, 0.1, 0.45, 0.4, 8, { hSeg: 1 });
        bi.sphere("lamp", x, 12.35, z, 0.22, { noAO: true, grime: 0 });
        LB.glows.push({ pos: V(x, 12.3, z), color: 0xffd8a0, size: 2.4 });
      }
      D.rubble(bi, IX1 - 3, 0.06, IZ0 + 2.5, 1.2, 6, 21);
      // merchant stall inside the doors (the Exchange's fence) + the ledger desk by the throne
      D.stall(bi, IX0 + 3.2, 824.5, Math.PI / 2, 3.6, 2.4, {
        goods: "guns",
        sign: "BUY · SELL · NO REFUNDS",
        seed: 5,
      });
      anchors.merchant1 = LB.anchor(IX0 + 3.1, 0.06, 824.5, -Math.PI / 2);
      bi.box("rotten", XC + 3.4, 0.06, 837.8, 1.8, 0.8, 0.9, { seg: false });
      D.papers(bi, XC + 3.4, 0.87, 837.8, 0.6, 6, 14);
      LB.col(XC + 3.4, 837.8, 1.8, 0.9, 0, 0.86, 0, { walkable: false });
      anchors.ledger = LB.anchor(XC + 3.4, 0.9, 837.8, 0);
      anchors.boss = LB.anchor(XC, 1.3, 834.4, 0); // on the throne, facing the doors (north)
      anchors.trading_floor = LB.anchor(XC, 0.06, 825.5, Math.PI);
      anchors.spawn1 = LB.anchor(XC - 8, 0, 823.5);
      anchors.spawn2 = LB.anchor(XC + 8, 0, 823.5);
      anchors.spawn3 = LB.anchor(IX0 + 3, 0, 836);
      anchors.spawn4 = LB.anchor(IX1 - 3, 0, 835.5);
      anchors.loot = LB.anchor(XC - 3.2, 0.1, 838.8);
      anchors.desk = anchors.ledger.clone();
      ctx.TK = TK;
    },
    /** After the exterior batch is built (ctx.g = landmark group). */
    attach(ctx) {
      const { XC } = ctx;
      ctx.bi.build(ctx.g);
      const tkMat = LB.mat(ctx.TK.key);
      LB.animate(V(XC, 0, 830), 120, (t) => {
        if (tkMat && tkMat.map) tkMat.map.offset.x = (t * 0.035) % 1;
      });
    },
    /** Inside the landmark's initDone hook, between the fort turrets and the forecourt footlocker. */
    props(ctx) {
      const { XC } = ctx;
      LB.registerLock(EXCHANGE_SAFE);
      LB.spawnProp("safe", {
        x: XC - 4.5,
        y: 0.06,
        z: 840.8,
        yaw: 0,
        loot: "raider_boss",
        owner: "raiders",
        name: "The Boss's Safe",
        lock: EXCHANGE_SAFE,
      });
      LB.plaque(
        V(XC, 2.3, 835.6),
        "Scratches on the Throne",
        'Scratched into the back of the Boss\'s throne: "SAFE 1929 — LIKE THE CRASH. TOUCH IT AN DIE."',
        () =>
          LB.learnCode(
            EXCHANGE_SAFE.id,
            "Scratched on the Boss's throne, the Exchange",
          ),
      );
    },
  };
})();
