// play-inline-138 02 — anchors
// Lines 22-353 of readable/play-inline-138.pretty.js (statement-aligned).
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
