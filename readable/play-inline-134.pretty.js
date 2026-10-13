/* src/landmarks_b/10_liberty.js */
/* =====================================================================
 * LANDMARKS B — STATUE OF LIBERTY (Liberty Island) + pedestal interior.
 *
 * Island (r=55) → granite sea wall, lawns, promenade, pier + skiff ferry.
 * Fort Wood   → 11-point granite star fort (solid, walkable top) with a
 *               grand stair facing Manhattan.
 * Pedestal    → stepped foundation, rusticated base, die with portals,
 *               loggia + walkable balcony (reached from the interior),
 *               attic with state discs, cornice.
 * The statue  → sculpted from lathe/sphere/cone/box primitives: folded
 *               robe, head & crown with 7 rays, raised torch arm with the
 *               gilded flame & gallery, tablet arm, feet & broken shackle.
 *               Verdigris patina material.
 * Continuity camp → landed twin-rotor Rotorcraft, tents, sandbag nests,
 *               floodlights, radar dish, flags, Checkpoint Liberty gate,
 *               Sky-Eye drone cradle, searchlights. The Continuity is the
 *               remnant federal government (still living in 1967).
 * The pedestal interior (INTERIORS.liberty_pedestal) and its doors are in
 * 10_liberty_interior.js (called via LB.interiorPart).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._lb) return;
  const LB = G._lb;
  const U = G.util;
  const TAU = Math.PI * 2;

  const TORCH = { x: -6.15, z: -0.3 }; // torch handle axis in the statue's local frame (see buildStatue)
  const LIB_TURRETS = []; // props turret handles (filled at initDone)
  // STATUE_S: the sculpt is modelled at 1:1 of this pedestal's 48 m; scaled up 20 % so at gameplay distances she reads
  // at least as tall as pedestal + fort (the real heel-to-torch 46 m vs 47 m base looks short on screen because the
  // flame and the raised arm are thin, and the eye compares masses, not tips).
  const STATUE_S = 1.3; // round 1 revise: +8 % more (1.2 → 1.3) so she holds her own over the taller fort

  LB.addBuilder(
    "statue_of_liberty",
    function (LB, site, root) {
      const L = G.LAYOUT;
      const C = { x: L.LIBERTY.x, z: L.LIBERTY.z };
      const R_ISLAND = L.LIBERTY.r;
      // Island frame: local +Z points toward Battery Park (the "front").
      const bp = { x: -60, z: 975 };
      const FRONT = Math.atan2(bp.x - C.x, bp.z - C.z); // THREE rotation.y mapping local +Z → dir
      const F = LB.m4(C.x, 0, C.z, FRONT);
      const W = (lx, lz) => LB.rot(C.x, C.z, FRONT, lx, lz);
      const yawFacing = (dx, dz) => Math.atan2(-dx, -dz); // player yaw looking along world dir
      const fwd = (ry) => [Math.sin(ry), Math.cos(ry)];

      const b = LB.batch("liberty");
      b.ground = 0;
      b.aoH = 3;
      const anchors = {};
      const A = (name, lx, y, lz) => {
        const [x, z] = W(lx, lz);
        anchors[name] = new THREE.Vector3(x, y, z);
      };

      // ------------------------------------------------------------------
      // Island ground, sea wall, promenade
      // ------------------------------------------------------------------
      b.frame(F);
      const lawn = new THREE.CircleGeometry(R_ISLAND - 2, 48);
      lawn.rotateX(-Math.PI / 2);
      b.add("grass", lawn, { m: LB.m4(0, 0.04, 0), grime: 0.3, noAO: true });
      const walk = new THREE.RingGeometry(33.5, 41, 48, 1);
      walk.rotateX(-Math.PI / 2);
      b.add("sidewalk", walk, { m: LB.m4(0, 0.07, 0), grime: 0.5, noAO: true });
      // sea wall ring (granite blocks) + coping
      // Round 1 revise: the sea wall now stands 2.5 m clear of the harbour (was 2.1, read as a disc on the water): dark
      // wet-stained granite face with a pale limestone coping band (a crisp bright rim line from Battery Park) and a
      // riprap apron of boulders at the waterline; the wall drops to deck height only at the pier.
      const nWall = 88,
        SW = 1.3;
      for (let i = 0; i < nWall; i++) {
        const a0 = (i / nWall) * TAU,
          a1 = ((i + 1) / nWall) * TAU,
          am = (a0 + a1) / 2;
        const rr = R_ISLAND - 1,
          atPier = Math.abs(U.wrapAngle(am)) < 0.06;
        const len = 2 * rr * Math.sin((a1 - a0) / 2) + 0.1,
          top = atPier ? 0.45 : SW;
        b.box(
          "granite",
          Math.sin(am) * rr,
          -4,
          Math.cos(am) * rr,
          len,
          4 + top,
          2.2,
          { ry: am, grime: 0.9, ground: -1.2, aoH: 2.6, c: 0xb0aaa0 },
        );
        if (!atPier)
          b.box(
            "limestone",
            Math.sin(am) * (rr + 0.1),
            top,
            Math.cos(am) * (rr + 0.1),
            len,
            0.3,
            2.5,
            { ry: am, seg: false, grime: 0.35 },
          );
        if (i % 3 === 0)
          b.rock(
            "rock",
            Math.sin(am + 0.02) * (rr + 2.2),
            -1.5,
            Math.cos(am + 0.02) * (rr + 2.2),
            1.3 + (i % 5) * 0.25,
            { flat: 0.6, seed: i * 5.1, grime: 0.7, ground: -1.2 },
          );
      }
      // perimeter railing (iron) on the sea wall — gap at the pier (local angle 0)
      b.frame(null);
      {
        let run = [];
        for (let i = 0; i <= 64; i++) {
          const a = (i / 64) * TAU;
          if (Math.abs(U.wrapAngle(a)) < 0.07) {
            if (run.length > 1) LB.railing(b, run, SW + 0.3, 1.0, "iron");
            run = [];
            continue;
          }
          run.push(
            W(Math.sin(a) * (R_ISLAND - 0.6), Math.cos(a) * (R_ISLAND - 0.6)),
          );
        }
        if (run.length > 1) LB.railing(b, run, SW + 0.3, 1.0, "iron");
      }
      // a ring of dead elms and oaks on the lawn between the walk and the sea wall (the island's tree line gives it volume
      // and a skyline from the water instead of a bare plate), with lamp posts on the walk
      if (LB.parkTree) {
        const rt = LB.rng("liberty_trees");
        for (let i = 0; i < 26; i++) {
          const a = ((i + 0.5) / 26) * TAU + (rt() - 0.5) * 0.1;
          if (Math.abs(U.wrapAngle(a)) < 0.4) continue;
          const rr = 45 + rt() * 5,
            [x, z] = W(Math.sin(a) * rr, Math.cos(a) * rr);
          LB.parkTree(b, x, z, {
            kind: LB.treeMix(rt, [0.5, 0.35, 0.1, 0.05, 0]),
            h: 8 + rt() * 5,
            lean: rt() * 0.12,
            leanDir: FRONT + a,
            seed: 900 + i,
            collide: true,
          });
        }
        for (let i = 0; i < 12; i++) {
          const a = ((i + 0.25) / 12) * TAU;
          if (Math.abs(U.wrapAngle(a)) < 0.3) continue;
          const [x, z] = W(Math.sin(a) * 42, Math.cos(a) * 42);
          LB.lampPost(b, x, 0.07, z, i % 4 === 1);
        }
      }
      b.frame(F);
      // colliders: sea-wall ring keeps the player on the island (walkable top at 0.95 for balance)
      for (let i = 0; i < 28; i++) {
        const a0 = (i / 28) * TAU + (0.5 / 28) * TAU;
        if (Math.abs(U.wrapAngle(a0)) < 0.12) continue; // pier opening
        const [x, z] = W(
          Math.sin(a0) * (R_ISLAND - 0.6),
          Math.cos(a0) * (R_ISLAND - 0.6),
        );
        LB.col(
          x,
          z,
          2 * R_ISLAND * Math.sin(Math.PI / 28) + 0.6,
          0.5,
          -2,
          SW + 1.3,
          FRONT + a0,
          { walkable: false },
        );
      }

      // ------------------------------------------------------------------
      // Fort Wood — 11-point star (solid, walkable top at FORT_H)
      // ------------------------------------------------------------------
      // Real Fort Wood (1811) is a crisp 11-point granite star whose points reach far past the pedestal; the points here
      // are ~16 m deep (R1−R0) so the star reads from the harbour and from the air, not as a round drum.
      const R1 = 37,
        R0 = 21,
        NPT = 11,
        FORT_H = 8.0; // round 1 revise: 6.5 → 8 m so the star stands clear of the rim
      const starPts = [];
      for (let i = 0; i < NPT * 2; i++) {
        const a = (i / (NPT * 2)) * TAU;
        const r = i % 2 ? R0 : R1;
        starPts.push([Math.sin(a) * r, Math.cos(a) * r]);
      }
      // rotate star so that a re-entrant angle faces +Z (front stair)
      const starRot = Math.PI / NPT;
      const sp = starPts.map((p) => {
        const c = Math.cos(starRot),
          s = Math.sin(starRot);
        return [p[0] * c + p[1] * s, -p[0] * s + p[1] * c];
      });
      /** Star polygon grown outward by d metres (every vertex moved along its radial direction, scaled so edges stay parallel). */
      const starOff = (d) =>
        sp.map((p, i) => {
          const r = Math.hypot(p[0], p[1]);
          const k = (r + d * (i % 2 ? 1.35 : 1.9)) / r;
          return [p[0] * k, p[1] * k];
        });
      const extrudeStar = (poly, key, y0, h, opts) => {
        const sh = new THREE.Shape();
        sh.moveTo(poly[0][0], -poly[0][1]);
        for (let i = 1; i < poly.length; i++)
          sh.lineTo(poly[i][0], -poly[i][1]);
        sh.closePath();
        const g = new THREE.ExtrudeGeometry(sh, {
          depth: h,
          bevelEnabled: false,
        });
        g.rotateX(-Math.PI / 2);
        g.translate(0, y0, 0);
        b.add(key, g, opts);
      };
      // coursed granite ashlar walls (own canvas texture: big blocks with bevelled joints), a battered plinth at the
      // foot, a projecting cordon under the coping, and the parapet with a coping cap
      // Tonal read from low angles (round 1 revise): dark, weather-stained battered walls; a pale limestone cap band +
      // parapet so every one of the 11 points is outlined by a bright line against the dark wall below it.
      extrudeStar(sp, "granite_block", 0, FORT_H, {
        grime: 0.8,
        aoH: 3.5,
        c: 0x9a948c,
      });
      extrudeStar(starOff(0.95), "granite_dark", -0.4, 1.4, {
        grime: 0.9,
        aoH: 1.2,
      }); // battered plinth, 2 steps
      extrudeStar(starOff(0.5), "granite_dark", 1.0, 1.4, {
        grime: 0.85,
        aoH: 1.2,
      });
      extrudeStar(starOff(0.28), "granite_dark", 2.4, 0.22, { grime: 0.6 }); // cordon
      extrudeStar(starOff(0.3), "limestone", FORT_H - 1.15, 0.95, {
        grime: 0.3,
      }); // pale cap band
      for (let i = 0; i < sp.length; i++) {
        const p = sp[i],
          q = sp[(i + 1) % sp.length];
        const dx = q[0] - p[0],
          dz = q[1] - p[1],
          len = Math.hypot(dx, dz);
        const ry = Math.atan2(-dz, dx);
        // inward normal (towards centre)
        let nx = -dz / len,
          nz = dx / len;
        const mx = (p[0] + q[0]) / 2,
          mz = (p[1] + q[1]) / 2;
        if (nx * -mx + nz * -mz < 0) {
          nx = -nx;
          nz = -nz;
        }
        // parapet + coping cap (stops short of the vertices so the joints mitre cleanly)
        b.box(
          "limestone",
          mx + nx * 0.4,
          FORT_H,
          mz + nz * 0.4,
          len - 0.3,
          0.85,
          0.6,
          { ry, seg: false, grime: 0.35 },
        );
        b.box(
          "granite_dark",
          mx + nx * 0.4,
          FORT_H + 0.85,
          mz + nz * 0.4,
          len - 0.1,
          0.14,
          0.78,
          { ry, seg: false, grime: 0.6 },
        );
        // musket loops / gun embrasures: splayed dark slots in every face (skip the front notch faces with the stair)
        const front = i >= sp.length - 2; // sp[21] is the front notch (local +Z)
        if (!front) {
          for (const t of [0.34, 0.66]) {
            const ex = p[0] + dx * t - nx * 0.03,
              ez = p[1] + dz * t - nz * 0.03;
            b.quad("glass_broken", ex, 4.4, ez, 0.42, 1.25, {
              ry: Math.atan2(-nx, -nz),
              noAO: true,
              grime: 0,
            });
            b.box(
              "granite_dark",
              ex - nx * 0.08,
              3.7,
              ez - nz * 0.08,
              1.2,
              0.18,
              0.2,
              { ry, seg: false },
            ); // sill
            b.box(
              "granite_dark",
              ex - nx * 0.08,
              5.05,
              ez - nz * 0.08,
              1.0,
              0.3,
              0.2,
              { ry, seg: false },
            ); // lintel block
          }
        }
        // walls-foot rubble & fallen coping stones
        if (i % 3 === 0)
          b.rock(
            "rubble",
            mx - nx * 1.6,
            0.2,
            mz - nz * 1.6,
            0.9 + (i % 5) * 0.2,
            { flat: 0.5, seed: i * 3.3 },
          );
        if (i % 4 === 1)
          b.box("granite", mx - nx * 1.4, 0, mz - nz * 1.4, 1.6, 0.55, 0.7, {
            ry: ry + 0.4,
            seg: false,
            grime: 0.8,
          });
      }
      // fort colliders: run-length fill of the star polygon (walkable top)
      LB.fillPoly(sp, C.x, C.z, FRONT, 0, FORT_H, 1.5, { surface: "concrete" });
      // Grand stair: one long monumental flight up the front notch, arriving at the re-entrant angle
      b.frame(null);
      {
        const s0 = R1 + 3.5,
          s1 = R0 + 0.6;
        const [sx, sz] = W(0, s0);
        LB.stairs(
          b,
          "granite",
          sx,
          sz,
          FRONT + Math.PI,
          5,
          s0 - s1,
          0,
          FORT_H,
          { cheeks: "granite_dark", base: -0.1 },
        );
        // landing into the fort top
        const [lx, lz] = W(0, R0 - 1.2);
        b.box("granite", lx, 0, lz, 5, FORT_H, 4, { ry: FRONT });
        LB.col(lx, lz, 5, 4, 0, FORT_H, FRONT);
      }
      b.frame(F);
      // fort-top paving
      const topDisk = new THREE.CircleGeometry(R0 - 0.2, 44);
      topDisk.rotateX(-Math.PI / 2);
      b.add("sidewalk", topDisk, {
        m: LB.m4(0, FORT_H + 0.02, 0),
        grime: 0.6,
        noAO: true,
      });
      // Main story (mq06): the SALLY PORT — a small iron door in a granite portal on the fort face east of the grand stair,
      // the casemates' old side gate. Private Teague keeps the night watch here; a whispered "A dimanche" gets it unbolted
      // (src/quests/60_finale.js). Visual only (the fort stays solid); anchors side_gate / sally_port stand in front of it.
      {
        let iRe = -1,
          best = -1e9;
        for (let i = 1; i < sp.length; i += 2)
          if (sp[i][1] > best) {
            best = sp[i][1];
            iRe = i;
          }
        const A0 = sp[(iRe + 1) % sp.length],
          P0 = sp[(iRe + 2) % sp.length]; // the outer face of the point beside the stair notch
        const t = 0.45,
          gx = A0[0] + (P0[0] - A0[0]) * t,
          gz = A0[1] + (P0[1] - A0[1]) * t;
        let nx = P0[1] - A0[1],
          nz = -(P0[0] - A0[0]);
        const nl = Math.hypot(nx, nz);
        nx /= nl;
        nz /= nl;
        if (nx * gx + nz * gz < 0) {
          nx = -nx;
          nz = -nz;
        }
        const ry = Math.atan2(nx, nz),
          out = 0.95 * 1.6; // the plinth's outer face sits ~1.5 m proud of the star line here
        const px = gx + nx * (out - 0.2),
          pz = gz + nz * (out - 0.2);
        b.box("granite_dark", px, 0, pz, 3.0, 3.4, 1.4, {
          ry,
          seg: false,
          grime: 0.8,
        }); // the portal block
        b.box(
          "limestone",
          px + nx * 0.72,
          3.25,
          pz + nz * 0.72,
          3.2,
          0.3,
          0.3,
          { ry, seg: false, grime: 0.4 },
        ); // lintel
        b.box("rust", px + nx * 0.71, 0.05, pz + nz * 0.71, 1.5, 2.5, 0.1, {
          ry,
          seg: false,
          grime: 0.7,
        }); // the iron door
        for (const s2 of [-1, 1])
          for (const y of [0.4, 2.1])
            b.box(
              "iron",
              px + nx * 0.78 + nz * s2 * 0.0,
              y,
              pz + nz * 0.78 - nx * s2 * 0.0,
              1.45,
              0.12,
              0.05,
              { ry, seg: false },
            ); // strap hinges
        b.box("iron", px + nx * 0.8, 2.95, pz + nz * 0.8, 0.25, 0.3, 0.25, {
          ry,
          seg: false,
        }); // lantern housing
        b.box(
          "lamp_amber",
          px + nx * 0.93,
          2.98,
          pz + nz * 0.93,
          0.14,
          0.18,
          0.02,
          { ry, seg: false, noAO: true, grime: 0 },
        );
        const spK = LB.texMat(
          "liberty_sallyport",
          LB.signTex(
            "liberty_sallyport",
            ["SALLY PORT", "NO ADMITTANCE · BY ORDER"],
            "enamel",
            512,
            160,
            { bg: "#1a2230", fg: "#e8dcb8" },
          ),
        );
        b.quad(
          spK,
          px + nx * 0.72 - nz * 1.15,
          1.6,
          pz + nz * 0.72 + nx * 1.15,
          0.7,
          0.22,
          { ry },
        );
        {
          const [wx, wz] = W(px, pz);
          LB.col(wx, wz, 3.0, 1.4, 0, 3.4, FRONT + ry, { walkable: false });
        }
        A("side_gate", px + nx * 2.4, 0, pz + nz * 2.4);
        A("sally_port", px + nx * 1.6, 0, pz + nz * 1.6);
        anchors.side_gate.yaw = anchors.sally_port.yaw = yawFacing(
          -Math.sin(FRONT + ry),
          -Math.cos(FRONT + ry),
        ); // facing the door
      }

      // ------------------------------------------------------------------
      // Pedestal
      // ------------------------------------------------------------------
      const PY = FORT_H;
      // Round 1 proportions: the real monument is fort → a massive stepped granite FOUNDATION (a truncated pyramid,
      // ~20 m) → the pedestal proper (~27 m) → the statue (~46 m). The foundation is now 12 m of four battered tiers
      // (was 8 m of low steps) and the die correspondingly shorter, so the pedestal no longer reads as a slim tower.
      const steps = [
        [12.6, 0, 3.2],
        [11.9, 3.2, 6.2],
        [11.2, 6.2, 9.2],
        [10.5, 9.2, 12],
      ];
      for (const s of steps) {
        const g = new THREE.CylinderGeometry(
          s[0] * Math.SQRT2 - 0.35,
          s[0] * Math.SQRT2,
          s[2] - s[1] - 0.25,
          4,
          1,
        ).toNonIndexed();
        g.rotateY(Math.PI / 4);
        g.deleteAttribute("normal"); // flat-shaded battered slab
        b.add("granite_block", g, {
          m: LB.m4(0, PY + (s[1] + s[2] - 0.25) / 2, 0),
          grime: 0.65,
          aoH: 3,
        });
        b.box(
          "granite_dark",
          0,
          PY + s[2] - 0.25,
          0,
          (s[0] - 0.25) * 2 + 0.3,
          0.25,
          (s[0] - 0.25) * 2 + 0.3,
          { seg: false, grime: 0.5 },
        );
      }
      const baseY = PY + 12; // 18.5
      // rusticated base course (block rows)
      b.box("granite", 0, baseY, 0, 19, 4.5, 19, { segLen: 3, grime: 0.55 });
      for (let k = 0; k < 4; k++)
        for (const sgn of [-1, 1]) {
          b.box(
            "granite_dark",
            0,
            baseY + 0.9 + k * 1.05,
            sgn * 9.52,
            19.05,
            0.08,
            0.1,
            { seg: false },
          );
          b.box(
            "granite_dark",
            sgn * 9.52,
            baseY + 0.9 + k * 1.05,
            0,
            0.1,
            0.08,
            19.05,
            { seg: false },
          );
        }
      b.box("granite", 0, baseY + 4.5, 0, 19.8, 0.5, 19.8, { seg: false });
      // die
      const dieY = baseY + 5; // 19.5
      const DIE = 8.6,
        DIE_H = 12;
      b.box("granite", 0, dieY, 0, DIE * 2, DIE_H, DIE * 2, {
        segLen: 4,
        grime: 0.6,
      });
      for (let f = 0; f < 4; f++) {
        const ry = (f * Math.PI) / 2;
        const [fx, fz] = fwd(ry);
        const px = -fz,
          pz = fx; // along-face axis
        // corner quoin piers
        for (const s of [-1, 1])
          b.box(
            "granite",
            fx * (DIE + 0.2) + px * s * (DIE - 1.2),
            dieY,
            fz * (DIE + 0.2) + pz * s * (DIE - 1.2),
            2.4,
            DIE_H,
            0.6,
            { ry, segLen: 4 },
          );
        // central projecting portico with pilasters + pediment + blind arched portal
        b.box(
          "granite",
          fx * (DIE + 0.45),
          dieY,
          fz * (DIE + 0.45),
          7.6,
          DIE_H - 1.5,
          0.9,
          { ry, segLen: 4 },
        );
        for (const s of [-1.5, -0.5, 0.5, 1.5])
          b.box(
            "granite_dark",
            fx * (DIE + 1.0) + px * s * 2.2,
            dieY + 1.0,
            fz * (DIE + 1.0) + pz * s * 2.2,
            0.8,
            DIE_H - 3.0,
            0.3,
            { ry, seg: false },
          );
        const archDepth = DIE + 0.93;
        b.quad(
          "glass_broken",
          fx * archDepth,
          dieY + 4.9,
          fz * archDepth,
          2.6,
          5.8,
          { ry, uv: "box" },
        );
        const arch = new THREE.RingGeometry(1.3, 1.9, 12, 1, 0, Math.PI);
        b.add("granite_dark", arch, {
          m: LB.m4(
            fx * (archDepth + 0.05),
            dieY + 7.8,
            fz * (archDepth + 0.05),
            ry,
          ),
          grime: 0.4,
        });
        // triangular pediment above portal
        const ped = new THREE.Shape();
        ped.moveTo(-4.2, 0);
        ped.lineTo(4.2, 0);
        ped.lineTo(0, 1.8);
        ped.closePath();
        const pg = new THREE.ExtrudeGeometry(ped, {
          depth: 1.1,
          bevelEnabled: false,
        });
        b.add("granite", pg, {
          m: LB.m4(
            fx * (DIE - 0.05),
            dieY + DIE_H - 1.5,
            fz * (DIE - 0.05),
            ry,
          ),
        });
        // loggia (balcony level) columns on each face
        for (let c = 0; c < 5; c++) {
          const s = -6.4 + c * 3.2;
          b.cyl(
            "granite",
            fx * (DIE - 0.3) + px * s,
            dieY + DIE_H + 0.3,
            fz * (DIE - 0.3) + pz * s,
            0.42,
            0.48,
            4.6,
            10,
            { hSeg: 2 },
          );
        }
        // attic discs (the state shields)
        for (let c = 0; c < 10; c++) {
          const s = -6.75 + c * 1.5;
          const disc = new THREE.CylinderGeometry(0.55, 0.55, 0.25, 12);
          disc.rotateX(Math.PI / 2);
          b.add("granite_dark", disc, {
            m: LB.m4(
              fx * 8.35 + px * s,
              dieY + DIE_H + 7.1,
              fz * 8.35 + pz * s,
              ry,
            ),
          });
        }
      }
      // balcony slab + balustrade, loggia inner wall, attic, cornice
      const balY = dieY + DIE_H + 0.3; // 35.8
      b.box("granite", 0, balY - 0.3, 0, 21, 0.3, 21, { seg: false });
      for (let f = 0; f < 4; f++)
        for (let c = 0; c < 9; c++) {
          // corbels under the balcony
          const ry = (f * Math.PI) / 2;
          const [fx, fz] = fwd(ry);
          const s = -8 + c * 2;
          b.box(
            "granite_dark",
            fx * 9.4 + -fz * s,
            balY - 1.1,
            fz * 9.4 + fx * s,
            0.5,
            0.8,
            1.6,
            { ry, seg: false },
          );
        }
      b.box("granite", 0, balY, 0, 14.6, 5.0, 14.6, { segLen: 3 });
      b.quad("glass_dark", 0, balY + 2.1, 7.32, 2.2, 3.4, { uv: "box" }); // balcony door (front)
      for (let f = 0; f < 4; f++) {
        const ry = (f * Math.PI) / 2;
        const [fx, fz] = fwd(ry);
        b.box("granite", fx * 10.33, balY + 0.9, fz * 10.33, 21, 0.18, 0.4, {
          ry,
          seg: false,
        });
        b.box("granite", fx * 10.33, balY, fz * 10.33, 21, 0.12, 0.4, {
          ry,
          seg: false,
        });
        for (let c = 0; c < 26; c++) {
          const s = -10 + c * 0.8;
          b.cyl(
            "granite",
            fx * 10.33 + -fz * s,
            balY + 0.12,
            fz * 10.33 + fx * s,
            0.1,
            0.14,
            0.78,
            6,
            { hSeg: 1 },
          );
        }
      }
      const atticY = balY + 5.0;
      b.box("granite", 0, atticY, 0, 17.8, 1.0, 17.8, { seg: false });
      b.box("granite", 0, atticY + 1.0, 0, 16.6, 5.2, 16.6, { segLen: 3 });
      b.box("granite_dark", 0, atticY + 6.2, 0, 17.6, 0.6, 17.6, {
        seg: false,
      });
      b.box("granite", 0, atticY + 6.8, 0, 16.0, 0.8, 16.0, { seg: false });
      const TOP = atticY + 7.6; // ~48.4

      // Pedestal colliders
      b.frame(null);
      {
        const [x, z] = W(0, 0);
        for (const s of steps)
          LB.col(x, z, s[0] * 2, s[0] * 2, PY, PY + s[2], FRONT);
        LB.col(x, z, 19.8, 19.8, baseY, dieY, FRONT);
        LB.col(
          x,
          z,
          (DIE + 1.3) * 2,
          (DIE + 1.3) * 2,
          dieY,
          balY - 0.3,
          FRONT,
          { walkable: false },
        );
        LB.col(x, z, 21, 21, balY - 0.4, balY, FRONT); // balcony floor
        LB.col(x, z, 14.6, 14.6, balY, TOP, FRONT, { walkable: false });
        for (let f = 0; f < 4; f++)
          for (let c = 0; c < 5; c++) {
            const ry = (f * Math.PI) / 2;
            const [fx, fz] = fwd(ry);
            const s = -6.4 + c * 3.2;
            const [cx, cz] = W(
              fx * (DIE - 0.3) + -fz * s,
              fz * (DIE - 0.3) + fx * s,
            );
            LB.col(cx, cz, 0.9, 0.9, balY, balY + 4.6, FRONT + ry, {
              walkable: false,
            });
          }
        for (let f = 0; f < 4; f++) {
          const ry = (f * Math.PI) / 2;
          const [fx, fz] = fwd(ry);
          const [px, pz] = W(fx * 10.33, fz * 10.33);
          LB.col(px, pz, 21.2, 0.45, balY, balY + 1.1, FRONT + ry, {
            walkable: false,
          });
        }
        // statue body (for bullets/raycasts)
        LB.col(
          x,
          z,
          9 * STATUE_S,
          9 * STATUE_S,
          TOP,
          TOP + 34 * STATUE_S,
          FRONT,
          { walkable: false, surface: "metal" },
        );
      }
      b.frame(F);
      // entrance pavilion with the arched portal on the front face (fort-top level)
      // Round 2: a real recessed portal instead of a flat arch decal — a projecting rusticated frame (jamb piers,
      // voussoired round arch with keystone, spandrels, its own cornice) 0.8 m deep, so the doors sit in a shadowed
      // reveal; riveted double iron doors (the Continuity cut the chain, a leaf stands ajar), a gridded fanlight, a caged
      // work lamp; the pavilion gains an attic carrying the inscription. The door interactable (local z 14.7, placed by
      // 10_liberty_interior.js) now sits inside the reveal and the exit spot (z 18.5) is 3.2 m clear of the frame.
      b.box("granite", 0, PY, 13.2, 7, 6.1, 2.6, { segLen: 3 });
      b.box("granite_dark", 0, PY + 6.1, 13.2, 7.6, 0.35, 3.0, { seg: false });
      b.box("granite", 0, PY + 6.45, 13.2, 7, 1.35, 2.6, {
        seg: false,
        grime: 0.5,
      }); // attic (inscription)
      b.box("granite_dark", 0, PY + 7.8, 13.2, 7.7, 0.45, 3.1, {
        seg: false,
        grime: 0.45,
      });
      {
        const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
        const SPR = PY + 3.3,
          RI = 1.45,
          RO = 2.3,
          FZ0 = 14.5,
          FD = 0.8;
        for (const sx of [-1, 1]) {
          // jamb piers with channelled joints + plinths
          b.box(
            "granite",
            sx * (RI + (RO - RI) / 2),
            PY,
            FZ0 + FD / 2,
            RO - RI,
            SPR - PY,
            FD,
            { seg: false, grime: 0.55 },
          );
          b.box(
            "granite_dark",
            sx * (RI + (RO - RI) / 2),
            PY,
            FZ0 + FD / 2 + 0.05,
            RO - RI + 0.25,
            0.55,
            FD + 0.1,
            { seg: false, grime: 0.8 },
          );
          for (let y = PY + 0.95; y < SPR - 0.2; y += 0.6)
            b.box(
              "granite_dark",
              sx * (RI + (RO - RI) / 2),
              y,
              FZ0 + FD + 0.005,
              RO - RI + 0.02,
              0.05,
              0.02,
              { seg: false, grime: 0.1 },
            );
          b.box(
            "granite_dark",
            sx * (RI + (RO - RI) / 2),
            SPR - 0.25,
            FZ0 + FD / 2,
            RO - RI + 0.2,
            0.25,
            FD + 0.12,
            { seg: false },
          ); // impost
        }
        const ring = new THREE.Shape();
        ring.absarc(0, 0, RO, 0, Math.PI, false);
        ring.lineTo(-RI, 0);
        ring.absarc(0, 0, RI, Math.PI, 0, true);
        ring.lineTo(RO, 0);
        b.add(
          "granite",
          new THREE.ExtrudeGeometry(ring, {
            depth: FD,
            bevelEnabled: false,
            curveSegments: 14,
          }),
          { m: LB.m4(0, SPR, FZ0), grime: 0.45 },
        );
        const spand = new THREE.Shape();
        spand.moveTo(-RO, 0);
        spand.lineTo(-RO, 2.75);
        spand.lineTo(RO, 2.75);
        spand.lineTo(RO, 0);
        spand.absarc(0, 0, RO, 0, Math.PI, false);
        b.add(
          "granite",
          new THREE.ExtrudeGeometry(spand, {
            depth: FD - 0.1,
            bevelEnabled: false,
            curveSegments: 14,
          }),
          { m: LB.m4(0, SPR, FZ0), grime: 0.5 },
        );
        for (let k = 1; k < 9; k++) {
          // voussoir joints
          const a = (k / 9) * Math.PI,
            ca = Math.cos(a),
            sa = Math.sin(a),
            rm = (RI + RO) / 2;
          b.box(
            "granite_dark",
            ca * rm,
            SPR + sa * rm - 0.02,
            FZ0 + FD + 0.005,
            RO - RI,
            0.04,
            0.02,
            { rz: a, seg: false, grime: 0.1 },
          );
        }
        b.box(
          "granite",
          0,
          SPR + RI - 0.1,
          FZ0 + FD / 2 + 0.08,
          0.62,
          RO - RI + 0.3,
          FD + 0.16,
          { seg: false, grime: 0.4 },
        ); // keystone
        b.box(
          "granite_dark",
          0,
          SPR + 2.75,
          FZ0 + FD / 2 + 0.1,
          2 * RO + 0.5,
          0.32,
          FD + 0.45,
          { seg: false, grime: 0.4 },
        ); // frame cornice
        // reveal soffit + jamb returns (dark: the doors read as set back into the mass)
        for (const sx of [-1, 1])
          b.box(
            "granite_dark",
            sx * (RI - 0.02),
            PY,
            FZ0 + FD / 2,
            0.04,
            SPR - PY,
            FD,
            { seg: false, grime: 0.9 },
          );
        // fanlight: dark glass behind a radial iron grille
        b.add("glass_dark", new THREE.CircleGeometry(RI, 14, 0, Math.PI), {
          m: LB.m4(0, SPR, FZ0 + 0.03),
          uv: "box",
          noAO: true,
          grime: 0.1,
        });
        for (let k = 1; k < 6; k++) {
          const a = (k / 6) * Math.PI;
          b.beam(
            "iron",
            V3(0, SPR, FZ0 + 0.06),
            V3(Math.cos(a) * RI, SPR + Math.sin(a) * RI, FZ0 + 0.06),
            0.035,
            0.035,
          );
        }
        b.add("iron", new THREE.RingGeometry(0.42, 0.5, 10, 1, 0, Math.PI), {
          m: LB.m4(0, SPR, FZ0 + 0.07),
          grime: 0.2,
        });
        b.box("iron", 0, SPR - 0.08, FZ0 + 0.05, 2 * RI, 0.16, 0.1, {
          seg: false,
        }); // transom bar
        // riveted double iron doors: left leaf shut, right leaf pulled ajar ~25° into the reveal, darkness behind
        b.quad(
          "concrete_dark",
          0,
          PY + (SPR - PY) / 2,
          FZ0 + 0.02,
          2 * RI,
          SPR - PY,
          { c: 0x0e0d0b, grime: 0, noAO: true },
        ); // the dark beyond
        const leaf = (hx, ang) => {
          const LW = RI - 0.02,
            LH = SPR - PY - 0.1,
            m = LB.m4(hx, PY + 0.02, FZ0 + 0.06, ang);
          const add = (key, geo, lx, ly, lz) => {
            geo.translate(lx, ly, lz);
            b.add(key, geo, { m, grime: 0.6 });
          };
          const sx = hx < 0 ? 1 : -1; // leaf extends from its hinge toward the centre line
          add(
            "rust",
            new THREE.BoxGeometry(LW, LH, 0.1),
            (sx * LW) / 2,
            LH / 2,
            0,
          );
          for (const py of [0.55, 1.75])
            add(
              "iron",
              new THREE.BoxGeometry(LW - 0.3, 0.95, 0.05),
              (sx * LW) / 2,
              py + 0.45,
              0.07,
            ); // raised panels
          add(
            "iron",
            new THREE.BoxGeometry(LW, 0.12, 0.06),
            (sx * LW) / 2,
            1.35,
            0.08,
          ); // lock rail
          for (let i = 0; i < 7; i++)
            for (const py of [0.08, LH - 0.1])
              add(
                "iron",
                new THREE.BoxGeometry(0.06, 0.06, 0.04),
                sx * (0.12 + (i * (LW - 0.24)) / 6),
                py,
                0.08,
              ); // rivets
          add(
            "chrome",
            new THREE.BoxGeometry(0.05, 0.28, 0.08),
            sx * (LW - 0.18),
            1.3,
            0.11,
          ); // pull handle
        };
        leaf(-RI + 0.01, 0);
        leaf(RI - 0.01, 0.45);
        // the cut chain hanging from the left leaf's handle, padlock on the step
        b.beam(
          "rust",
          V3(-0.18, PY + 1.42, FZ0 + 0.2),
          V3(-0.25, PY + 0.75, FZ0 + 0.28),
          0.03,
          0.03,
        );
        b.box("iron", 0.45, PY + 0.02, FZ0 + 0.9, 0.12, 0.1, 0.06, {
          ry: 0.6,
          seg: false,
        });
        // caged work lamp over the keystone + worn threshold
        b.box("iron", 0, SPR + 2.05, FZ0 + FD + 0.25, 0.36, 0.42, 0.36, {
          seg: false,
        });
        b.sphere("lamp", 0, SPR + 2.2, FZ0 + FD + 0.3, 0.12, {
          ws: 6,
          hs: 4,
          noAO: true,
          grime: 0,
        });
        b.box("granite_dark", 0, PY, FZ0 + 0.55, 2 * RO + 0.4, 0.12, 1.3, {
          seg: false,
          grime: 0.9,
        });
        b.frame(null);
        {
          const [lx, lz] = W(0, FZ0 + FD + 0.35);
          LB.glows.push({
            pos: new THREE.Vector3(lx, SPR + 2.2, lz),
            color: 0xffd090,
            size: 2.6,
          });
        }
        for (const sx of [-1, 1]) {
          const [x, z] = W(sx * (RI + (RO - RI) / 2), FZ0 + FD / 2);
          LB.col(x, z, RO - RI + 0.25, FD + 0.1, PY, SPR + 2.75, FRONT, {
            walkable: false,
          });
        }
        b.frame(F);
      }
      b.frame(null);
      {
        const [x, z] = W(0, 13.2);
        LB.col(x, z, 7, 2.6, PY, PY + 8.25, FRONT, { walkable: false });
      }
      b.frame(F);
      // inscription on the pavilion attic
      const sigK = LB.texMat(
        "liberty_portal",
        LB.signTex(
          "liberty_portal",
          ["LIBERTY ENLIGHTENING THE WORLD"],
          "engraved",
          1024,
          96,
          { size: 56 },
        ),
      );
      b.quad(sigK, 0, PY + 7.12, 14.52, 6.6, 0.62, {});
      // Continuity banners hanging from the attic: slate-navy field, a domed-capitol seal in a double ring, the motto
      // and the year the Continuity still lives in
      const contBanner = LB.texMat(
        "continuity_banner",
        LB.canvasTex("lb_continuity_banner", 256, 768, (ctx, w, h) => {
          ctx.fillStyle = "#1a2230";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#c9b27a";
          ctx.lineWidth = 6;
          ctx.strokeRect(12, 12, w - 24, h - 24);
          const cx = w / 2,
            cy = 215;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.arc(cx, cy, 88, 0, TAU);
          ctx.stroke();
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, 72, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = "#d8ceb0";
          ctx.beginPath();
          ctx.arc(cx, cy + 10, 34, Math.PI, TAU);
          ctx.fill(); // dome
          ctx.fillRect(cx - 3, cy - 46, 6, 24); // lantern spire
          ctx.fillRect(cx - 46, cy + 10, 92, 7); // drum
          for (let i = 0; i < 7; i++)
            ctx.fillRect(cx - 42 + i * 13.3, cy + 20, 5, 24); // colonnade
          ctx.fillRect(cx - 52, cy + 44, 104, 8); // steps
          ctx.fillStyle = "#9a2a24";
          ctx.fillRect(40, 340, w - 80, 14);
          ctx.fillStyle = "#d8ceb0";
          ctx.fillRect(40, 358, w - 80, 6);
          ctx.fillStyle = "#d8ceb0";
          ctx.font = "bold 38px Georgia, serif";
          ctx.textAlign = "center";
          ctx.fillText("CONTINUITY", w / 2, 430);
          ctx.font = "bold 22px Georgia, serif";
          ctx.fillText("THE REPUBLIC", w / 2, 500);
          ctx.fillText("ENDURES", w / 2, 530);
          ctx.fillStyle = "#c9b27a";
          ctx.font = "bold 26px Georgia, serif";
          ctx.fillText("MCMLXVII", w / 2, 640);
          const r = U.rng(9);
          for (let i = 0; i < 40; i++) {
            ctx.fillStyle = "rgba(80,70,50," + r() * 0.3 + ")";
            ctx.fillRect(r() * w, r() * h, 3 + r() * 30, 3 + r() * 60);
          }
        }),
        { side: THREE.DoubleSide, noShadow: true },
      );
      for (let f = 0; f < 4; f++) {
        const ry = (f * Math.PI) / 2;
        const [fx, fz] = fwd(ry);
        for (const s of [-4.8, 4.8]) {
          b.quad(
            contBanner,
            fx * (DIE + 0.35) + -fz * s,
            dieY + 6.2,
            fz * (DIE + 0.35) + fx * s,
            2.4,
            7.2,
            { ry, grime: 0.1, noAO: true },
          );
        }
      }

      // ------------------------------------------------------------------
      // THE STATUE (local frame on top of the pedestal)
      // ------------------------------------------------------------------
      const SF = new THREE.Matrix4().multiplyMatrices(
        F,
        LB.m4(0, TOP, 0, -0.25, 0, 0, STATUE_S, STATUE_S, STATUE_S),
      );
      b.frame(SF);
      buildStatue(b);
      // plinth under her feet
      b.box("granite", 0, -0.2, 0, 11.5, 0.8, 11.5, { seg: false });
      b.frame(F);

      // ------------------------------------------------------------------
      // Pier + skiff ferry to Battery Park
      // ------------------------------------------------------------------
      const PIER0 = R_ISLAND - 2,
        PIER1 = R_ISLAND + 16;
      b.box("planks", 0, 0.2, (PIER0 + PIER1) / 2, 4.2, 0.3, PIER1 - PIER0, {
        grime: 0.6,
        ground: -1.2,
      });
      for (let z = PIER0 + 1; z <= PIER1; z += 3)
        for (const x of [-1.9, 1.9])
          b.cyl("rotten", x, -5, z, 0.2, 0.22, 5.9, 6, {
            hSeg: 2,
            ground: -1.2,
          });
      b.frame(null);
      {
        const [x, z] = W(0, (PIER0 + PIER1) / 2);
        LB.col(x, z, 4.2, PIER1 - PIER0, -3, 0.5, FRONT, { surface: "wood" });
      }
      b.frame(F);
      buildSkiff(b, LB.m4(3.6, -1.0, PIER1 - 3, 0.1));
      const ferrySign = LB.texMat(
        "liberty_ferry",
        LB.signTex(
          "liberty_ferry",
          ["HARBOR SKIFF", "BATTERY PARK  ▸"],
          "enamel",
          512,
          192,
          { bg: "#1c3c52" },
        ),
      );
      b.box("rotten", -1.8, 0.4, PIER1 - 1.2, 0.18, 2.6, 0.18, { seg: false });
      b.quad(ferrySign, -1.8, 2.7, PIER1 - 1.08, 2.0, 0.75, {});
      A("dock", 0, 0.5, PIER1 - 2);
      {
        const [dx, dz] = W(1.8, PIER1 - 2.5);
        LB.ferryLiberty = { pos: new THREE.Vector3(dx, 1.0, dz) };
        const [bx2, bz2] = W(0, PIER1 - 6); // stand on the pier, facing the statue
        LB.libertyArrive = {
          x: bx2,
          y: 0.5,
          z: bz2,
          yaw: yawFacing(C.x - bx2, C.z - bz2),
        };
      }

      // ------------------------------------------------------------------
      // Continuity camp
      // ------------------------------------------------------------------
      b.frame(null);
      buildRotorcraft(
        b,
        new THREE.Matrix4().multiplyMatrices(
          F,
          LB.m4(0, 0.05, -44, Math.PI / 2 + 0.2),
        ),
      );
      {
        const [x, z] = W(0, -44);
        LB.col(x, z, 3.2, 13, 0, 3.6, FRONT + Math.PI / 2 + 0.2, {
          surface: "metal",
        });
      }
      b.frame(F);
      A("rotorcraft", 0, 0.2, -38.5);
      // tents (olive-drab A-frame) on the side lawns
      const crateAt = (lx, y, lz, s, ry) => {
        b.box("gunmetal", lx, y, lz, s, s * 0.8, s * 1.2, {
          ry: ry || 0,
          seg: false,
          grime: 0.4,
        });
        b.box(
          "paint_cream",
          lx,
          y + s * 0.3,
          lz,
          s + 0.02,
          0.1,
          s * 1.2 + 0.02,
          { ry: ry || 0, seg: false },
        );
        b.frame(null);
        const w = W(lx, lz);
        LB.col(
          w[0],
          w[1],
          s * 1.2 + 0.1,
          s * 1.2 + 0.1,
          y,
          y + s * 0.8,
          FRONT + (ry || 0),
          { surface: "metal" },
        );
        b.frame(F);
      };
      const tentAt = (lx, lz, ry) => {
        const t = new THREE.Shape();
        t.moveTo(-2.4, 0);
        t.lineTo(2.4, 0);
        t.lineTo(0, 2.6);
        t.closePath();
        const g = new THREE.ExtrudeGeometry(t, {
          depth: 5,
          bevelEnabled: false,
        });
        g.translate(0, 0, -2.5);
        b.add("tent", g, { m: LB.m4(lx, 0.05, lz, ry), grime: 0.5 });
        b.box("iron", lx, 0, lz, 0.08, 2.7, 0.08, { seg: false });
        b.frame(null);
        const [x, z] = W(lx, lz);
        LB.col(x, z, 4.6, 5, 0, 2.2, FRONT + ry, {
          walkable: false,
          surface: "dirt",
        });
        b.frame(F);
      };
      tentAt(-43, -10, 0.3);
      tentAt(-45, 4, 0.1);
      tentAt(43, -12, -0.3);
      tentAt(46, 2, -0.1);
      A("spawn1", -40, 0.1, -3);
      A("spawn2", 40, 0.1, -5);
      A("spawn3", -8, 0.1, 40);
      A("spawn4", 8, 0.1, 40);
      A("spawn5", -15, FORT_H + 0.1, 16);
      A("spawn6", 15, FORT_H + 0.1, -16);
      // sandbag nests flanking the stair base + at the fort top
      b.frame(null);
      const sbag = (ax, az, bx, bz, y, rows) => {
        const p = W(ax, az),
          q = W(bx, bz);
        LB.sandbags(b, p[0], p[1], q[0], q[1], rows || 3, { y: y || 0 });
      };
      sbag(-8, 44, -4, 47.5);
      sbag(8, 44, 4, 47.5);
      sbag(-9, 40, -8, 44);
      sbag(9, 40, 8, 44);
      sbag(-5, 20.5, -2.5, 21.5, FORT_H, 2);
      sbag(5, 20.5, 2.5, 21.5, FORT_H, 2);
      sbag(-30, -30, -26, -34);
      sbag(30, -30, 26, -34);
      b.frame(F);
      // auto-turrets sit in the fort-top sandbag nests covering the grand stair (not the pier: the skiff lands ~44 m
      // out of their 38 m range, with cover on the lawn), facing the harbour.
      A("turret1", -4.2, FORT_H, 19.4);
      A("turret2", 4.2, FORT_H, 19.4);
      anchors.turret1.yaw = anchors.turret2.yaw = FRONT + Math.PI; // actor convention: facing local +Z (the stair)
      // cover between the pier head and the stair foot: crate stacks & a sandbag arc
      crateAt(-5.5, 0, 54, 1.4, 0.3);
      crateAt(-5.2, 1.12, 54.2, 1.1, 0.6);
      crateAt(5.8, 0, 51.5, 1.4, -0.2);
      {
        const p = W(-2, 49.5),
          q = W(2.5, 50.5);
        b.frame(null);
        LB.sandbags(b, p[0], p[1], q[0], q[1], 3);
        b.frame(F);
      }
      // Checkpoint Liberty at the top of the stair: two gate posts with amber lamps, a raised boom and the gate board
      for (const s of [-3, 3]) {
        b.box("gunmetal", s, FORT_H, R0 - 2.5, 0.6, 3.2, 0.6, { seg: false });
        b.cyl("lamp_amber", s, FORT_H + 3.2, R0 - 2.5, 0.22, 0.22, 0.3, 8, {
          hSeg: 1,
        });
      }
      b.box("stripe_red", -2.62, FORT_H + 1.1, R0 - 2.2, 0.16, 3.6, 0.16, {
        seg: false,
      }); // boom, raised
      b.box("stripe_cream", -2.62, FORT_H + 1.7, R0 - 2.2, 0.17, 0.5, 0.17, {
        seg: false,
      });
      b.box("stripe_cream", -2.62, FORT_H + 2.9, R0 - 2.2, 0.17, 0.5, 0.17, {
        seg: false,
      });
      b.box("gunmetal", 0, FORT_H + 3.5, R0 - 2.5, 6.6, 0.14, 0.3, {
        seg: false,
      });
      {
        const cpK = LB.texMat(
          "liberty_checkpoint",
          LB.signTex(
            "liberty_checkpoint",
            [
              "CHECKPOINT LIBERTY",
              "CONTINUITY OF GOVERNMENT · PRESENT YOUR PAPERS",
            ],
            "enamel",
            1024,
            160,
            { bg: "#1a2230", fg: "#e8dcb8" },
          ),
        );
        b.quad(cpK, 0, FORT_H + 4.05, R0 - 2.34, 5.8, 0.9, {});
        const ntK = LB.texMat(
          "liberty_notice",
          LB.signTex(
            "liberty_notice",
            ["NOTICE", "BY ORDER OF THE", "ACTING PRESIDENT"],
            "enamel",
            256,
            320,
            { bg: "#e8e0c8", fg: "#1a2230" },
          ),
        );
        b.quad(ntK, 3, FORT_H + 1.5, R0 - 2.19, 0.5, 0.62, {});
        b.frame(null);
        const [nx, nz] = W(3, R0 - 1.9);
        LB.plaque(
          new THREE.Vector3(nx, FORT_H + 1.4, nz),
          "Continuity Notice",
          '"BY ORDER OF ACTING PRESIDENT MARSH. The national emergency declared in 1967 remains in force; the date on this island is 1967 until the emergency ends. Civilians will present identity papers or a Long Winter service card at the gate. Do not approach, address or feed the Sky-Eye drones. Looting of federal property is treason. — Office of the Provost, Liberty Island"',
        );
        b.frame(F);
      }
      // Sky-Eye drone cradle (fort top, west): a mast with two docking rings, a charge lamp and a stencilled board
      {
        const DX = -17,
          DZ = 3;
        b.box("gunmetal", DX, FORT_H, DZ, 0.32, 3.4, 0.32, { seg: false });
        b.box("gunmetal", DX - 0.9, FORT_H + 2.3, DZ, 1.8, 0.12, 0.12, {
          seg: false,
        });
        b.box("gunmetal", DX + 0.9, FORT_H + 3.1, DZ, 1.8, 0.12, 0.12, {
          seg: false,
        });
        b.add("iron", new THREE.TorusGeometry(0.42, 0.05, 6, 16), {
          m: LB.m4(DX - 1.6, FORT_H + 2.42, DZ, 0, Math.PI / 2),
        });
        b.add("iron", new THREE.TorusGeometry(0.42, 0.05, 6, 16), {
          m: LB.m4(DX + 1.6, FORT_H + 3.22, DZ, 0, Math.PI / 2),
        });
        b.cyl("lamp_amber", DX, FORT_H + 3.4, DZ, 0.12, 0.12, 0.2, 8, {
          hSeg: 1,
        });
        const dcK = LB.texMat(
          "liberty_cradle",
          LB.signTex(
            "liberty_cradle",
            ["SKY-EYE CRADLE", "KEEP CLEAR"],
            "enamel",
            512,
            192,
            { bg: "#2e2a1e", fg: "#ffb347" },
          ),
        );
        b.quad(dcK, DX, FORT_H + 1.5, DZ + 0.17, 1.2, 0.45, {});
        b.frame(null);
        const [cx, cz] = W(DX, DZ);
        LB.col(cx, cz, 0.5, 0.5, FORT_H, FORT_H + 3.4, FRONT, {
          walkable: false,
          surface: "metal",
        });
        b.frame(F);
      }
      // floodlight towers on fort points
      const floodAt = (ang) => {
        const lx = Math.sin(ang) * (R1 - 5),
          lz = Math.cos(ang) * (R1 - 5);
        b.box("gunmetal", lx, FORT_H, lz, 0.25, 7, 0.25, { seg: false });
        b.box("gunmetal", lx, FORT_H + 7, lz, 1.4, 0.8, 0.6, {
          ry: ang,
          seg: false,
        });
        b.quad(
          "lamp",
          lx + Math.sin(ang) * 0.31,
          FORT_H + 7.4,
          lz + Math.cos(ang) * 0.31,
          1.2,
          0.6,
          { ry: ang },
        );
        const w = W(lx + Math.sin(ang) * 0.6, lz + Math.cos(ang) * 0.6);
        LB.glows.push({
          pos: new THREE.Vector3(w[0], FORT_H + 7.4, w[1]),
          color: 0xfff4d8,
          size: 5,
        });
      };
      const TIP = (3 * Math.PI) / NPT;
      floodAt(TIP);
      floodAt(-TIP);
      floodAt(Math.PI - TIP);
      floodAt(Math.PI + TIP);
      // crates, generator, antenna mast, radio console on the fort top
      const crate = (lx, y, lz, s, ry) => {
        b.box("gunmetal", lx, y, lz, s, s * 0.8, s * 1.2, {
          ry: ry || 0,
          seg: false,
          grime: 0.4,
        });
        b.box(
          "paint_cream",
          lx,
          y + s * 0.3,
          lz,
          s + 0.02,
          0.1,
          s * 1.2 + 0.02,
          { ry: ry || 0, seg: false },
        );
      };
      crate(-16, FORT_H, -8, 1.3, 0.2);
      crate(-16, FORT_H + 1.04, -8, 1.1, 0.5);
      crate(-18, FORT_H, -6, 1.2, 0.1);
      crate(17, FORT_H, 7, 1.3, -0.3);
      crate(38, 0, -20, 1.4, 0.4);
      crate(-38, 0, 14, 1.4, -0.2);
      crate(-36.5, 0, 15.5, 1.2, 0.2);
      // generator
      b.box("gunmetal", 16, FORT_H, -9, 2.4, 1.6, 1.4, { ry: 0.3, seg: false });
      b.cyl("iron", 16.8, FORT_H + 1.6, -9.2, 0.12, 0.12, 1.4, 6, { hSeg: 1 });
      A("generator", 16, FORT_H, -7);
      // radar dish (animated) on the back of the fort top
      const radar = new THREE.Group();
      {
        const rb = LB.batch("liberty_radar");
        rb.lathe(
          "gunmetal",
          [
            [0.01, 0],
            [1.2, 0.35],
            [2.2, 0.9],
            [2.5, 1.2],
          ],
          18,
          0,
          0,
          0,
          { rx: Math.PI / 2 - 0.5 },
        );
        rb.cyl("iron", 0, -0.2, 0.9, 0.05, 0.05, 1.6, 5, {
          rx: Math.PI / 2 - 0.5,
        });
        rb.build(radar);
        const [rx, rz] = W(-12, -18);
        radar.position.set(rx, FORT_H + 4.4, rz);
        root.add(radar);
        b.box("gunmetal", -12, FORT_H, -18, 0.6, 4.2, 0.6, { seg: false });
        LB.animate(radar.position, 400, (t) => {
          radar.rotation.y = t * 0.6;
        });
      }
      // national flag on a pole (animated cloth)
      const flag = makeFlag(LB.flagTex(0), 5.4, 3.0);
      {
        const [fx, fz] = W(8, 17);
        b.frame(null);
        b.cyl("iron", fx, FORT_H, fz, 0.08, 0.12, 12, 8, { hSeg: 2 });
        b.sphere("gilt", fx, FORT_H + 12.1, fz, 0.2, {});
        flag.position.set(fx, FORT_H + 11.8, fz);
        flag.rotation.y = FRONT;
        root.add(flag);
        b.frame(F);
      }
      // searchlight beams (additive cones, visible at night)
      const beams = [];
      for (const ang of [(3 * Math.PI) / NPT, (-3 * Math.PI) / NPT]) {
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0xfff6d0,
          transparent: true,
          opacity: 0.0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
          fog: false,
          vertexColors: true,
        });
        const g = new THREE.ConeGeometry(7, 140, 20, 6, true);
        g.translate(0, -70, 0);
        g.rotateX(-Math.PI / 2);
        {
          // fade the beam out along its length (apex bright → far end invisible)
          const p = g.attributes.position,
            col = new Float32Array(p.count * 3);
          for (let i = 0; i < p.count; i++) {
            const k = Math.pow(Math.max(0, 1 - p.getZ(i) / 140), 1.6);
            col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = k;
          }
          g.setAttribute("color", new THREE.BufferAttribute(col, 3));
        }
        const beam = new THREE.Mesh(g, beamMat);
        const [bx3, bz3] = W(
          Math.sin(ang) * (R1 - 5),
          Math.cos(ang) * (R1 - 5),
        );
        beam.position.set(bx3, FORT_H + 7.4, bz3);
        beam.rotation.order = "YXZ";
        beam.userData.base = FRONT + ang;
        beam.renderOrder = 5;
        root.add(beam);
        beams.push(beam);
      }
      LB.animate(new THREE.Vector3(C.x, 0, C.z), 1400, (t) => {
        const h = G.time.hour;
        const night =
          h < 6 || h > 19.5 ? 1 : h < 7 ? 7 - h : h > 18.5 ? h - 18.5 : 0;
        beams.forEach((bm, i) => {
          bm.visible = night > 0.02;
          bm.material.opacity = 0.22 * Math.min(1, night);
          bm.rotation.y = bm.userData.base + Math.sin(t * 0.23 + i * 2.1) * 0.9;
          bm.rotation.x = -0.18 + Math.sin(t * 0.17 + i) * 0.08;
        });
      });
      // litter + rubble + skeletons on the lawn
      const r = LB.rng("liberty_debris");
      for (let i = 0; i < 26; i++) {
        const a = r() * TAU,
          rr = 36 + r() * 15;
        b.rock(
          "rubble",
          Math.sin(a) * rr,
          0,
          Math.cos(a) * rr,
          0.4 + r() * 0.8,
          { flat: 0.45, seed: i },
        );
      }
      for (let i = 0; i < 5; i++) {
        const a = r() * TAU,
          rr = 38 + r() * 12;
        LB.skeleton(b, Math.sin(a) * rr, 0.06, Math.cos(a) * rr, r() * TAU);
      }
      for (let i = 0; i < 9; i++) {
        const a = r() * TAU,
          rr = 42 + r() * 9;
        if (
          Math.abs(U.wrapAngle(a)) < 0.3 ||
          Math.abs(U.wrapAngle(a - Math.PI)) < 0.5
        )
          continue;
        LB.deadTree(
          b,
          Math.sin(a) * rr,
          0,
          Math.cos(a) * rr,
          5 + r() * 4,
          i * 7,
        );
      }
      // historical plaque at the stair foot
      b.box("granite_dark", -3.5, 0, R1 + 5.5, 0.9, 1.1, 0.4, { seg: false });
      const plaqueK = LB.texMat(
        "liberty_plaque",
        LB.signTex(
          "liberty_plaque",
          ["LIBERTY ISLAND", "NATIONAL MONUMENT", "Rededicated July 4, 1966"],
          "bronze",
          512,
          320,
        ),
      );
      b.quad(plaqueK, -3.5, 0.85, R1 + 5.72, 0.8, 0.5, { rx: -0.35 });
      b.frame(null);
      {
        const [x, z] = W(-3.5, R1 + 5.9);
        LB.plaque(
          new THREE.Vector3(x, 1.0, z),
          "Liberty Island Plaque",
          '"A gift of friendship from the people of France, 1886. Friendship suspended, 1967. Rededicated July 4, 1966 by the Office of Civic Morale; held since the Bombing by the Continuity of Government in trust for the Acting President. Visitors expressing un-American sentiments inside the crown will be escorted out through the nearest window."',
        );
      }

      // Pedestal portal & balcony: the street <-> interior doors (portal → hall, balcony → upper gallery) are placed by
      // 10_liberty_interior.js; the exterior keeps the arrival spots in front of them.
      let outYaw = 0;
      {
        const [dx, dz] = W(0, 14.7);
        const [ox, oz] = W(0, 18.5);
        outYaw = yawFacing(ox - dx, oz - dz);
        anchors.entrance = new THREE.Vector3(ox, FORT_H, oz);
        // balcony (exterior, front) arrival point
        const [bx, bz] = W(0, 9.5);
        anchors.balcony = new THREE.Vector3(bx, balY, bz);
        LB.interiorPart("statue_of_liberty", "doors", {
          W,
          yawFacing,
          FORT_H,
          balY,
        });
        const [cx2, cz2] = W(4.8, 9.5);
        anchors.boss = new THREE.Vector3(cx2, balY, cz2);
        anchors.torch = new THREE.Vector3(TORCH.x, 44.8, TORCH.z).applyMatrix4(
          SF,
        );
        anchors.torch.y = TOP + 43.6 * STATUE_S;
        anchors.fort_top = (() => {
          const w = W(0, 20);
          return new THREE.Vector3(w[0], FORT_H, w[1]);
        })();
        anchors.commander = anchors.fort_top.clone();
      }

      const group = b.build(root);
      group.name = "statue_of_liberty";

      // flame flicker & crown windows at night via material emissive tweak
      const goldMat = LB.mat("gold");
      // By day the flame is gilded metal (sun glints, no self-glow — a glowing blob read as a lamp bulb); from dusk the
      // gold ramps up to a flickering beacon over the harbour.
      const nightF = () => {
        const hr = G.time && isFinite(G.time.hour) ? G.time.hour : 12;
        return hr < 5.5
          ? 1
          : hr < 7.5
            ? (7.5 - hr) / 2
            : hr > 20
              ? 1
              : hr > 18
                ? (hr - 18) / 2
                : 0;
      };
      LB.animate(new THREE.Vector3(C.x, 0, C.z), 2500, (t) => {
        const n = nightF();
        goldMat.emissiveIntensity =
          (0.12 + 0.78 * n) *
          (1 + (Math.sin(t * 7.3) * 0.07 + Math.sin(t * 13.1) * 0.05) * n);
      });
      LB.glows.push({
        pos: new THREE.Vector3(TORCH.x, 45.4, TORCH.z).applyMatrix4(SF),
        color: 0xffb040,
        size: 11,
        opts: { dayFactor: 0.0, intensity: 1.5, flicker: 0.25 },
      });
      // flickering additive flame halo (reads at night from Battery Park; hidden by day so the gilding shows)
      {
        const ft = LB.canvasTex("lb_flame_halo", 128, 256, (ctx, w, h) => {
          const g = ctx.createRadialGradient(
            w / 2,
            h * 0.62,
            2,
            w / 2,
            h * 0.55,
            w * 0.62,
          );
          g.addColorStop(0, "rgba(255,245,200,1)");
          g.addColorStop(0.25, "rgba(255,190,80,0.85)");
          g.addColorStop(0.6, "rgba(255,110,20,0.3)");
          g.addColorStop(1, "rgba(255,80,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(w / 2, 0);
          ctx.bezierCurveTo(w * 0.95, h * 0.45, w, h * 0.9, w / 2, h);
          ctx.bezierCurveTo(0, h * 0.9, w * 0.05, h * 0.45, w / 2, 0);
          ctx.fill();
        });
        const sm2 = new THREE.SpriteMaterial({
          map: ft,
          color: 0xffc070,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          fog: false,
        });
        const halo = new THREE.Sprite(sm2);
        halo.position.copy(
          new THREE.Vector3(TORCH.x, 45.4, TORCH.z).applyMatrix4(SF),
        );
        halo.scale.set(4.2 * STATUE_S, 7.2 * STATUE_S, 1);
        halo.renderOrder = 5;
        root.add(halo);
        LB.animate(halo.position, 2500, (t) => {
          const hr = G.time && isFinite(G.time.hour) ? G.time.hour : 12;
          const night =
            hr < 6
              ? 1
              : hr < 7.5
                ? (7.5 - hr) / 1.5
                : hr > 20
                  ? 1
                  : hr > 18.5
                    ? (hr - 18.5) / 1.5
                    : 0;
          halo.visible = night > 0.02;
          if (!halo.visible) return;
          const f =
            0.8 +
            Math.sin(t * 9.1) * 0.08 +
            Math.sin(t * 23.7) * 0.06 +
            Math.sin(t * 4.3) * 0.06;
          sm2.opacity = night * f;
          halo.scale.set(
            4.2 * STATUE_S * (0.95 + 0.05 * Math.sin(t * 6.3)),
            7.2 * STATUE_S * f,
            1,
          );
        });
      }
      // Continuity air-warning beacon on the torch gallery (blinking red)
      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 8, 6),
        new THREE.MeshBasicMaterial({ color: 0xff2a1a }),
      );
      {
        const sp2 = new THREE.Vector3(
          TORCH.x - 2.62,
          43.7,
          TORCH.z,
        ).applyMatrix4(SF);
        beacon.position.copy(sp2);
        root.add(beacon);
        LB.animate(beacon.position, 3000, (t) => {
          beacon.visible = t % 1.6 < 0.35;
        });
      }

      // Interior: the pedestal hall (INTERIORS.liberty_pedestal) — 10_liberty_interior.js
      LB.interiorPart("statue_of_liberty", "hall", { root, anchors });

      anchors.pier = anchors.dock.clone();
      anchors.landing = anchors.dock.clone();
      anchors.dock.yaw =
        anchors.pier.yaw =
        anchors.landing.yaw =
          yawFacing(C.x - anchors.dock.x, C.z - anchors.dock.z);
      anchors.boss.yaw =
        anchors.balcony.yaw =
        anchors.fort_top.yaw =
          FRONT + Math.PI; // looking out over the harbour (local +Z)
      anchors.entrance.yaw = outYaw;
      const entry = LB.register("statue_of_liberty", group, anchors, [
        "liberty",
      ]);
      // ---- defenses API (quests / combat) ----
      let defMode = "auto";
      // quest flags owned by src/quests: stand down when allied with the commander, back to faction relations on a fight
      const QF = {
        ally: "crane_ally",
        fight: "crane_fight",
        hostile: "con_hostile",
      }; // quest flags set by src/quests
      function applyDefenses() {
        for (const h of LIB_TURRETS) {
          const t = h && h.record && h.record.turret;
          if (!t) continue;
          t.hostileToPlayer = defMode === "auto" ? null : !!defMode;
        }
      }
      entry.turrets = LIB_TURRETS;
      /** true = always hostile, false = stand down (e.g. allied with the Continuity), 'auto' = faction relation. */
      entry.setDefenses = function (mode) {
        defMode = mode === undefined ? "auto" : mode;
        applyDefenses();
        G.events.emit("libertyDefenses", defMode);
      };
      G.events.on("questFlag", (name, v) => {
        if (name === QF.ally && v) entry.setDefenses(false);
        else if ((name === QF.hostile || name === QF.fight) && v)
          entry.setDefenses("auto");
      });
      // lifecycle: defenses return to faction-driven on reset; the stand-down survives save/load (derived again from
      // the quest flags when an old save has no landmarks_b block)
      LB.onReset.push(() => {
        defMode = "auto";
        applyDefenses();
      });
      LB.onNewGame.push(() => {
        defMode = "auto";
        applyDefenses();
      });
      let loadedDef = false;
      LB.saveHooks.liberty = {
        save: () => ({ def: defMode }),
        load: (d) => {
          if (d && d.def !== undefined) {
            defMode = d.def;
            loadedDef = true;
          }
        },
      };
      LB.onReset.push(() => {
        loadedDef = false;
      });
      LB.onLoaded.push(() => {
        if (!loadedDef) {
          const qf = (n) => {
            try {
              return !G.isStub("quests") && G.quests.flag
                ? !!G.quests.flag(n)
                : false;
            } catch (e) {
              return false;
            }
          };
          defMode =
            qf(QF.ally) && !qf(QF.hostile) && !qf(QF.fight) ? false : "auto";
        }
        applyDefenses();
      });

      // runtime: skiff doors (need Battery Park pier location) + props
      LB.onReady.push(() => {
        // Continuity auto-turrets (props). Hostility follows combat.relation('continuity','player') unless a quest overrides
        // it via G.landmarks.statue_of_liberty.setDefenses(true|false|'auto') or the stand-down / hostility quest flags.
        LIB_TURRETS.length = 0;
        for (const t of [anchors.turret1, anchors.turret2]) {
          const slot = LIB_TURRETS.length;
          const topts = {
            x: t.x,
            y: t.y,
            z: t.z,
            yaw: FRONT + Math.PI,
            faction: "continuity",
            continuity: true,
            hp: 110,
            range: 38,
          }; // facing the stair (local +Z)
          const h = LB.spawnProp("turret", topts, (nh) => {
            LIB_TURRETS[slot] = nh;
            applyDefenses();
          });
          LIB_TURRETS.push(h);
        }
        applyDefenses();
        LB.interiorPart("statue_of_liberty", "props", { anchors }); // pedestal-hall containers & command terminal
      });
    },
    10,
  );

  // ====================================================================
  // Statue sculpture (local frame: base at y=0, facing +Z, her right = -X)
  //
  // Built from parametric surfaces (LB.surface / LB.organicTube) with
  // welded normals and per-vertex cavity occlusion:
  //   • stola  — superellipse body section (broad shoulders, narrow waist)
  //              with meandering vertical folds, the advancing right knee,
  //              the straight left leg and the pooling hem;
  //   • palla  — the heavy mantle: a band that crosses the front diagonally
  //              from the right hip up to the left shoulder and falls down
  //              the whole back in deep vertical folds, with rolled edges;
  //   • arms   — raised right arm with the loose sleeve bunched & flared at
  //              the elbow (bare forearm, fist around the torch), bent left
  //              arm under the mantle cradling the keystone tablet;
  //   • head   — one displaced ellipsoid (brow, sockets & heavy lids, Greek
  //              nose, lips, chin, jaw taper, wavy hair) + bun, diadem crown
  //              with windows and seven faceted rays.
  // ====================================================================
  function buildStatue(b) {
    const V = "verdigris";
    const n0 = (b.parts.get(V) || []).length; // everything added in V from here on gets the patina pass at the end
    const o = { grime: 0, aoH: 5, ground: -2, uv: "keep" }; // cavity AO comes from the surfaces themselves (aoMul)
    const sm = LB.smooth;
    const gauss = (x, s) => Math.exp(-(x * x) / (s * s));
    const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const cr = (p0, p1, p2, p3, t) => {
      const t2 = t * t,
        t3 = t2 * t;
      return (
        0.5 *
        (2 * p1 +
          (-p0 + p2) * t +
          (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
          (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
      );
    };

    /** Fold profile: -1 at a sharp crease, rising steeply to broad rounded ridges (+1). */
    const crease = (x) => 2 * Math.sqrt(0.5 + 0.5 * Math.sin(x)) - 1;
    /**
     * Patina run-off on the copper skin (post-pass on a finished geometry's vertex colours, world space): long vertical
     * streaks — darker blue-green where rain runs, a paler mint bloom beside them, and a brown-copper tint where the
     * patina is thin (undersides, deep creases).
     */
    const patina = (g, amt) => {
      if (!g || !g.attributes.color) return g;
      amt = amt === undefined ? 1 : amt;
      const P = g.attributes.position,
        Cc = g.attributes.color,
        N = g.attributes.normal;
      for (let i = 0; i < P.count; i++) {
        const x = P.getX(i),
          y = P.getY(i),
          z = P.getZ(i);
        const hcoord = x * 0.83 + z * 0.56;
        const run =
          Math.max(0, U.noise2(hcoord * 2.3, y * 0.035 + 1.7) - 0.5) * 2.4; // dark rain runs
        const bloom =
          Math.max(0, U.noise2(hcoord * 1.1 + 9.2, y * 0.02) - 0.55) * 2.0; // pale mint bloom
        const under = N ? Math.max(0, -N.getY(i)) : 0; // thin patina below overhangs
        const kr = 1 - 0.34 * run + 0.1 * bloom + 0.18 * under,
          kg = 1 - 0.22 * run + 0.12 * bloom - 0.1 * under,
          kb = 1 - 0.12 * run + 0.1 * bloom - 0.28 * under;
        const f = amt;
        Cc.setXYZ(
          i,
          Cc.getX(i) * (1 + (kr - 1) * f),
          Cc.getY(i) * (1 + (kg - 1) * f),
          Cc.getZ(i) * (1 + (kb - 1) * f),
        );
      }
      Cc.needsUpdate = true;
      return g;
    };
    // ---- body section profile: [y, A (half width, x), B (half depth, z), zc (centre z), n (superellipse exponent)]
    const PROF = [
      [0.0, 6.0, 5.0, -0.75, 2.0],
      [1.2, 5.75, 4.6, -0.5, 2.0],
      [3.5, 5.4, 4.25, -0.3, 2.0],
      [7.0, 5.15, 4.0, -0.12, 2.0],
      [11.0, 5.0, 3.85, 0.0, 2.1],
      [14.0, 4.85, 3.7, 0.02, 2.2],
      [17.0, 4.55, 3.45, 0.05, 2.2],
      [20.0, 4.8, 3.55, 0.12, 2.35],
      [22.6, 5.12, 3.45, 0.06, 2.7],
      [24.3, 5.05, 3.15, 0.0, 3.0],
      [25.5, 4.35, 2.85, 0.0, 2.7],
      [26.25, 3.0, 2.3, 0.05, 2.3],
      [26.8, 1.72, 1.66, 0.1, 2.0],
      [27.5, 1.36, 1.38, 0.14, 2.0],
      [29.2, 1.2, 1.2, 0.18, 2.0],
    ];
    const Y_TOP = PROF[PROF.length - 1][0];
    function section(y) {
      let i = 0;
      while (i < PROF.length - 2 && PROF[i + 1][0] < y) i++;
      const a = PROF[Math.max(0, i - 1)],
        p = PROF[i],
        q = PROF[i + 1],
        c = PROF[Math.min(PROF.length - 1, i + 2)];
      const t = Math.max(0, Math.min(1, (y - p[0]) / (q[0] - p[0])));
      return [
        cr(a[1], p[1], q[1], c[1], t),
        cr(a[2], p[2], q[2], c[2], t),
        cr(a[3], p[3], q[3], c[3], t),
        cr(a[4], p[4], q[4], c[4], t),
      ];
    }
    /** Smooth body point (no folds) at angle th (0 = front +z, +π/2 = her left +x) and height y. Returns [x, z, r, zc]. */
    function bodyXZ(th, y) {
      const [A, B, zc, n] = section(y);
      const s = Math.sin(th),
        c = Math.cos(th),
        e = 2 / n;
      let x = A * Math.sign(s) * Math.pow(Math.abs(s), e),
        z = B * Math.sign(c) * Math.pow(Math.abs(c), e);
      // contrapposto: hips swing to her left, the raised right shoulder lifts & swells toward the arm
      x += 0.28 * gauss(y - 13, 4.5);
      const rs = gauss(y - 25.2, 1.1) * sm(0.2, 0.9, -s);
      x -= rs * 0.55;
      z += rs * 0.1;
      // bust
      const bust =
        gauss(y - 20.8, 1.5) *
        (gauss(wrapA(th - 0.42), 0.32) + gauss(wrapA(th + 0.42), 0.32)) *
        0.32;
      const r = Math.hypot(x, z) || 1e-3;
      x *= 1 + bust / r;
      z *= 1 + bust / r;
      return [x, z + zc, r + bust, zc];
    }
    // stola fold field (radial metres) + its cavity term
    function stolaFold(th, y) {
      const low = 1 - sm(13, 22, y);
      const ph = 0.55 * Math.sin(y * 0.19 + th * 2);
      // hammered-copper drapery: broad rounded ridges and narrow, knife-sharp creases (sqrt-shaped profile)
      let d =
        low *
        (0.4 * crease(9 * th + ph * 3) +
          0.16 * crease(15 * th - y * 0.11 + 1.3) +
          0.06 * Math.sin(23 * th + y * 0.23) -
          0.1);
      if (y < 2.2) d *= 1 + (2.2 - y) * 0.35; // hem pools on the plinth
      // fine chest pleats (front, under the neckline)
      const chest =
        sm(18.5, 21, y) * (1 - sm(24, 25.6, y)) * sm(-0.1, 0.8, Math.cos(th));
      d += chest * 0.07 * Math.sin(27 * th + 0.4);
      if (d < 0) d *= 1.35; // deeper valleys, rounder ridges
      // advancing right knee & the straight left shin
      d += 0.6 * gauss(wrapA(th + 0.38), 0.34) * gauss(y - 10.3, 2.5);
      d +=
        0.3 *
        gauss(wrapA(th - 0.4), 0.26) *
        (y < 10.5 ? 1 : gauss(y - 10.5, 2.2));
      return d;
    }
    const STOLA_ENV = (y) => (1 - sm(13, 22, y)) * 0.5 + (y < 2.2 ? 0.25 : 0);

    // ---- STOLA (inner robe): full closed surface, hem to neck ----
    const NU = 168;
    const stola = LB.surface(
      (u, v, out) => {
        const th = u * TAU,
          y = v * Y_TOP;
        const [x, z, r, zc] = bodyXZ(th, y);
        const d = stolaFold(th, y);
        const k = 1 + d / r;
        out.set(x * k, y, zc + (z - zc) * k);
        if (y < 3) out.z -= (3 - y) * 0.22 * (Math.cos(th) < 0 ? 1 : 0.35); // hem sweeps back behind the trailing right foot
        return 0.5 + 0.5 * sm(-0.34, 0.16, d);
      },
      NU,
      80,
      { wrap: true, us: 5, vs: 5 },
    );
    b.add(V, stola, o);
    // hem underside cap (closes the bottom so the plinth never shows through)
    b.add(
      V,
      new THREE.CircleGeometry(5.6, 24),
      Object.assign({}, o, {
        m: LB.m4(0, 0.03, -0.6, 0, Math.PI / 2, 0, 1.08, 0.9, 1),
      }),
    );

    // ---- PALLA (mantle): band between lower edge Lo(th) and upper edge Up(th) ----
    // control points around the body (th, lower, upper) — front diagonal, left shoulder, the whole back.
    const MC = [
      [-Math.PI, 2.4, 26.0],
      [-2.3, 3.6, 25.4],
      [-1.75, 7.5, 21.5],
      [-1.3, 11.0, 16.8],
      [-0.85, 11.8, 14.6],
      [-0.4, 10.4, 16.4],
      [0.0, 9.0, 18.8],
      [0.45, 7.8, 21.8],
      [0.95, 5.8, 24.6],
      [1.55, 4.2, 25.9],
      [2.3, 3.0, 26.0],
    ];
    function mantleEdges(th) {
      const n = MC.length;
      let i = 0;
      while (i < n - 1 && MC[i + 1][0] <= th) i++;
      const p = MC[i],
        q = i + 1 < n ? MC[i + 1] : [MC[0][0] + TAU, MC[0][1], MC[0][2]];
      const a = MC[(i - 1 + n) % n],
        c = MC[(i + 2) % n];
      const t = (th - p[0]) / (q[0] - p[0]);
      return [cr(a[1], p[1], q[1], c[1], t), cr(a[2], p[2], q[2], c[2], t)];
    }
    function mantleFold(th, y, w) {
      const F = sm(-0.15, 0.7, Math.cos(th)); // 1 on the front, 0 on back & sides
      const swag =
        Math.sin(w * Math.PI * 4.2 + th * 1.3) * 0.2 * (1 - sm(0.75, 1, w)) +
        Math.sin(w * Math.PI * 9 + 1) * 0.05;
      const vert =
        0.3 * crease(7 * th + 0.7 + y * 0.03) +
        0.13 * crease(13 * th + y * 0.16) +
        0.06 * Math.sin(21 * th - y * 0.2) -
        0.08;
      let d = F * swag + (1 - F) * vert * (1 - sm(22, 26, y) * 0.7);
      if (d < 0) d *= 1.3;
      return d;
    }
    function mantlePoint(th, w, out, extra) {
      const [lo, up] = mantleEdges(wrapA(th));
      const y = lo + (up - lo) * w;
      const [x, z, r, zc] = bodyXZ(th, y);
      const thick =
        (0.34 + (extra || 0)) *
          (w < 0.06 ? 0.8 + (0.2 * w) / 0.06 : 1) *
          (1 - sm(0.8, 1.0, w) * 0.85) +
        STOLA_ENV(y) * (1 - sm(0.85, 1, w));
      const d = mantleFold(th, y, w) * (1 - sm(0.9, 1, w));
      const k = 1 + (thick + d) / r;
      out.set(x * k, y, zc + (z - zc) * k);
      return d;
    }
    const mantle = LB.surface(
      (u, v, out) => {
        const th = u * TAU - Math.PI;
        const d = mantlePoint(th, v, out, 0);
        return (0.5 + 0.5 * sm(-0.32, 0.18, d)) * (0.88 + 0.12 * v);
      },
      NU,
      48,
      { wrap: true, us: 5, vs: 4 },
    );
    b.add(V, mantle, o);
    // rolled edges: the long diagonal roll across the front (upper edge) and the hanging lower hem
    const edgePts = (wv, th0, th1, n, extra) => {
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const th = th0 + ((th1 - th0) * i) / n;
        const p = new THREE.Vector3();
        mantlePoint(th, wv, p, extra);
        pts.push(p);
      }
      return pts;
    };
    b.add(
      V,
      LB.organicTube(
        edgePts(0.93, -1.55, 1.15, 16, 0.12),
        (t) => 0.42 * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, t * 1.15))),
        {
          radial: 10,
          seg: 40,
          disp: (t, a) => 0.05 * Math.sin(t * 60 + a * 2),
        },
      ),
      Object.assign({}, o),
    );
    b.add(
      V,
      LB.organicTube(
        edgePts(0.0, -Math.PI + 0.02, Math.PI - 0.02, 36, 0.05),
        () => 0.3,
        { radial: 8, seg: 96, disp: (t) => 0.06 * Math.sin(t * 90) },
      ),
      Object.assign({}, o),
    );
    // a heavy fold of the mantle hanging from the left forearm down her left side
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(5.6, 18.4, 1.2),
          new THREE.Vector3(6.05, 14.5, 0.6),
          new THREE.Vector3(6.1, 10.0, 0.1),
          new THREE.Vector3(5.7, 6.2, -0.4),
        ],
        (t) => 0.95 - t * 0.35,
        { radial: 12, seg: 18, disp: (t, a) => 0.16 * Math.sin(a * 4 + t * 3) },
      ),
      Object.assign({}, o),
    );

    // ---- feet, sandals, broken shackle & chain ----
    const foot = (x, z, ry, len, lift) => {
      b.sphere(
        V,
        x,
        0.42 + lift,
        z,
        1,
        Object.assign({}, o, {
          sx: 0.95,
          sy: 0.5,
          sz: len,
          ry,
          ws: 14,
          hs: 8,
          uv: "box",
        }),
      );
      for (let k = 0; k < 5; k++) {
        // toes
        const tx =
            x + Math.sin(ry) * (len * 0.85) + Math.cos(ry) * (-0.55 + k * 0.27),
          tz =
            z + Math.cos(ry) * (len * 0.85) - Math.sin(ry) * (-0.55 + k * 0.27);
        b.sphere(
          V,
          tx,
          0.26 + lift * 0.6,
          tz,
          0.17 - Math.abs(k - 1) * 0.015,
          Object.assign({}, o, { sz: 1.5, ry, ws: 8, hs: 6, uv: "box" }),
        );
      }
      b.box(V, x, 0.62 + lift, z + Math.cos(ry) * 0.2, 1.7, 0.1, 0.18, {
        ry,
        seg: false,
        grime: 0.1,
      }); // sandal strap
    };
    foot(1.7, 4.7, 0.12, 1.55, 0); // left foot forward
    b.sphere(
      V,
      -2.2,
      1.0,
      -5.9,
      1,
      Object.assign({}, o, { sx: 0.9, sy: 0.75, sz: 1.2, rx: -0.5, uv: "box" }),
    ); // right heel, lifted
    for (let i = 0; i < 8; i++) {
      const ring = new THREE.TorusGeometry(0.34, 0.1, 6, 12);
      b.add(
        V,
        ring,
        Object.assign({}, o, {
          uv: "box",
          m: LB.m4(
            3.1 + i * 0.48,
            0.13 + (i % 2) * 0.12,
            4.4 - i * 0.22 + (i > 4 ? (i - 4) * 0.4 : 0),
            i * 0.9,
            i % 2 ? Math.PI / 2 : 0.2,
          ),
        }),
      );
    }
    b.add(
      V,
      new THREE.TorusGeometry(0.75, 0.22, 8, 16, Math.PI * 1.55),
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(-1.2, 0.3, 5.0, 0.4, Math.PI / 2 - 0.1),
      }),
    ); // snapped shackle

    // ---- RIGHT ARM (raised): sleeve bunched & flared at the elbow, bare forearm, fist on the torch ----
    const TX = -6.15,
      TZ = -0.3; // torch handle axis
    const slv = [
      new THREE.Vector3(-4.1, 23.6, 0.25),
      new THREE.Vector3(-4.85, 26.6, 0.1),
      new THREE.Vector3(-5.45, 29.8, -0.12),
      new THREE.Vector3(-5.72, 32.2, -0.25),
    ];
    const slvR = (t) =>
      1.62 + 0.18 * Math.sin(t * Math.PI) + sm(0.55, 1, t) * 0.55;
    b.add(
      V,
      LB.organicTube(slv, slvR, {
        radial: 16,
        seg: 22,
        disp: (t, a) =>
          (0.2 * Math.sin(a * 6 + t * 5) + 0.07 * Math.sin(a * 13 - t * 9)) *
          sm(0.05, 0.4, t),
        ao: (t, a) => 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(a * 6 + t * 5)),
      }),
      o,
    );
    // inside of the flared sleeve mouth (flipped, dark) + thick rolled rim
    const slvIn = [slv[2].clone().lerp(slv[3], 0.2), slv[3].clone()];
    b.add(
      V,
      LB.organicTube(slvIn, (t) => slvR(0.85 + t * 0.15) - 0.16, {
        radial: 16,
        seg: 4,
        flip: true,
        ao: () => 0.35,
      }),
      o,
    );
    {
      const dir = new THREE.Vector3().subVectors(slv[3], slv[2]).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        dir,
      );
      const rim = new THREE.TorusGeometry(slvR(1) - 0.05, 0.2, 8, 22);
      LB.deform(rim, (v) => {
        const a = Math.atan2(v.y, v.x);
        v.x *= 1 + 0.05 * Math.sin(a * 6);
        v.y *= 1 + 0.05 * Math.sin(a * 6);
        v.z += 0.12 * Math.sin(a * 6);
      });
      b.add(
        V,
        rim,
        Object.assign({}, o, {
          m: new THREE.Matrix4().compose(slv[3], q, new THREE.Vector3(1, 1, 1)),
        }),
      );
    }
    // drapery hanging from the underside of the raised sleeve toward her head
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(-4.6, 29.5, 0.9),
          new THREE.Vector3(-4.0, 27.4, 1.1),
          new THREE.Vector3(-3.4, 25.6, 1.3),
        ],
        (t) => 0.75 - t * 0.3,
        { radial: 10, seg: 10, disp: (t, a) => 0.12 * Math.sin(a * 3 + t * 4) },
      ),
      o,
    );
    // bare forearm (slight muscle swell) and wrist
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(-5.6, 31.2, -0.2),
          new THREE.Vector3(-5.85, 33.6, -0.26),
          new THREE.Vector3(-6.05, 35.6, -0.3),
          new THREE.Vector3(TX, 36.7, TZ),
        ],
        (t) => 0.98 + 0.1 * Math.sin(t * Math.PI * 0.8) - t * 0.3,
        { radial: 14, seg: 16 },
      ),
      Object.assign({}, o, { grime: 0.1 }),
    );
    // fist: palm mass + four curled fingers wrapped around the handle + thumb
    b.sphere(
      V,
      TX + 0.05,
      37.45,
      TZ - 0.12,
      1,
      Object.assign({}, o, {
        sx: 0.95,
        sy: 1.2,
        sz: 0.85,
        ws: 14,
        hs: 10,
        uv: "box",
      }),
    );
    for (let k = 0; k < 4; k++) {
      const fg = new THREE.TorusGeometry(
        0.66,
        0.235 - k * 0.012,
        7,
        12,
        Math.PI * 1.2,
      );
      b.add(
        V,
        fg,
        Object.assign({}, o, {
          uv: "box",
          m: LB.m4(
            TX,
            36.95 + k * 0.43,
            TZ,
            0.35 + Math.PI * 0.2,
            Math.PI / 2,
            0,
          ),
        }),
      );
    }
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(TX + 0.55, 37.3, TZ - 0.4),
          new THREE.Vector3(TX + 0.75, 37.9, TZ + 0.1),
          new THREE.Vector3(TX + 0.45, 38.3, TZ + 0.55),
        ],
        (t) => 0.26 - t * 0.06,
        { radial: 8, seg: 6 },
      ),
      o,
    );
    // torch: handle with rings, cup, gallery with railing, gilded flame
    b.cyl(
      V,
      TX,
      36.4,
      TZ,
      0.5,
      0.42,
      4.0,
      14,
      Object.assign({}, o, { uv: "box" }),
    );
    for (const yy of [39.0, 39.8])
      b.add(
        V,
        new THREE.TorusGeometry(0.52, 0.11, 6, 16),
        Object.assign({}, o, {
          uv: "box",
          m: LB.m4(TX, yy, TZ, 0, Math.PI / 2),
        }),
      );
    b.lathe(
      V,
      [
        [0.5, 0],
        [0.75, 0.25],
        [1.2, 0.7],
        [1.75, 1.45],
        [2.0, 1.95],
        [2.12, 2.25],
      ],
      22,
      TX,
      40.3,
      TZ,
      Object.assign({}, o, {
        uv: "box",
        deform: (v) => {
          const a = Math.atan2(v.x, v.z);
          const k = 1 + 0.04 * Math.sin(a * 12) * sm(0.3, 1.8, v.y);
          v.x *= k;
          v.z *= k;
        },
      }),
    );
    b.add(
      V,
      new THREE.CylinderGeometry(2.7, 2.6, 0.2, 28, 1),
      Object.assign({}, o, { uv: "box", m: LB.m4(TX, 42.55, TZ) }),
    );
    b.add(
      V,
      new THREE.TorusGeometry(2.62, 0.06, 4, 32),
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(TX, 43.55, TZ, 0, Math.PI / 2),
      }),
    );
    b.add(
      V,
      new THREE.TorusGeometry(2.62, 0.04, 4, 32),
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(TX, 43.05, TZ, 0, Math.PI / 2),
      }),
    );
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * TAU;
      b.box(
        V,
        TX + Math.sin(a) * 2.62,
        42.65,
        TZ + Math.cos(a) * 2.62,
        0.07,
        0.9,
        0.07,
        { seg: false, grime: 0.1 },
      );
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      b.beam(
        V,
        new THREE.Vector3(TX + Math.sin(a) * 1.0, 41.4, TZ + Math.cos(a) * 1.0),
        new THREE.Vector3(
          TX + Math.sin(a) * 2.5,
          42.55,
          TZ + Math.cos(a) * 2.5,
        ),
        0.1,
        0.1,
        { grime: 0.1 },
      );
    }
    // gilded flame (gold-leaf): a tall pointed tear-drop core with five twisting licks that sharpen
    // toward a tip blown slightly leeward, wrapped by seven upright flat tongues — a flame silhouette, not a bulb.
    const FY = 42.65,
      FH = 5.9;
    b.lathe(
      "gold",
      [
        [0.82, 0],
        [1.08, 0.4],
        [1.14, 1.0],
        [1.02, 1.9],
        [0.8, 2.8],
        [0.56, 3.7],
        [0.32, 4.5],
        [0.13, 5.25],
        [0.01, FH],
      ],
      30,
      TX,
      FY,
      TZ,
      {
        grime: 0,
        noAO: true,
        uv: "box",
        sx: 1.18,
        sy: 1.18, // round 1 revise: flame +18 % for long-range readability
        deform: (v) => {
          const h = v.y / FH;
          const tw = v.y * 0.5; // twist grows with height
          const th = Math.atan2(v.x, v.z) + tw;
          const lobe =
            1 +
            0.34 *
              Math.pow(Math.max(0, Math.sin(th * 5)), 1.6) *
              sm(0.05, 0.35, h) -
            0.12 * sm(0.1, 0.4, h) +
            0.06 * Math.sin(th * 11 - v.y * 2);
          const r = Math.hypot(v.x, v.z) * lobe;
          const a = Math.atan2(v.x, v.z) + tw * 0.3;
          v.x = Math.sin(a) * r + Math.sin(h * 2.6) * 0.3 * h * h; // S-lean in the wind
          v.z = Math.cos(a) * r - 0.12 * h * h;
        },
      },
    );
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + 0.3,
        h = 3.1 + ((i * 5) % 7) * 0.36,
        bulge = 0.3 + (i % 3) * 0.1;
      const pg = new THREE.SphereGeometry(1, 10, 14);
      LB.deform(pg, (v) => {
        const t = (v.y + 1) / 2; // 0 base → 1 tip
        const w =
          Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.95)), 0.7) *
          (1 - t * 0.6);
        v.x *= 0.78 * w;
        v.z *= 0.26 * w; // flat tongue, widest low down
        v.y = t * h;
        v.x += Math.sin(t * 3.4) * 0.45 * t; // S-curl
        v.z += Math.sin(Math.PI * t) * bulge - t * t * 1.0; // bellies out, tip licks in toward the axis
      });
      b.add("gold", pg, {
        m: LB.m4(
          TX + Math.sin(a) * 1.18,
          FY + 0.05,
          TZ + Math.cos(a) * 1.18,
          a + Math.PI * 0.08,
          0,
          0,
          1.18,
        ),
        grime: 0,
        noAO: true,
        uv: "box",
      });
    }
    // ---- LEFT ARM (under the mantle) + the tablet ----
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(4.1, 25.0, 0.2),
          new THREE.Vector3(5.2, 23.4, 0.3),
          new THREE.Vector3(5.75, 21.4, 0.55),
          new THREE.Vector3(5.95, 19.8, 0.85),
        ],
        (t) => 1.55 - t * 0.25,
        {
          radial: 14,
          seg: 16,
          disp: (t, a) => 0.14 * Math.sin(a * 5 + t * 6),
          ao: (t, a) => 0.72 + 0.28 * (0.5 + 0.5 * Math.sin(a * 5 + t * 6)),
        },
      ),
      o,
    );
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(5.95, 19.9, 0.8),
          new THREE.Vector3(5.9, 19.2, 1.7),
          new THREE.Vector3(5.55, 18.8, 2.5),
          new THREE.Vector3(5.2, 18.7, 3.0),
        ],
        (t) => 1.15 - t * 0.38,
        {
          radial: 12,
          seg: 10,
          disp: (t, a) => 0.08 * Math.sin(a * 7) * (1 - t),
        },
      ),
      o,
    );
    b.sphere(
      V,
      5.1,
      18.55,
      3.2,
      1,
      Object.assign({}, o, {
        sx: 0.75,
        sy: 0.55,
        sz: 0.95,
        ws: 12,
        hs: 8,
        uv: "box",
      }),
    );
    const TM = LB.m4(5.55, 22.1, 2.05, -0.45, -0.2, 0.1);
    for (let k = 0; k < 4; k++) {
      // fingers curling around the tablet's bottom corner
      b.add(
        V,
        new THREE.CapsuleGeometry(0.16, 0.7, 3, 6),
        Object.assign({}, o, {
          uv: "box",
          m: new THREE.Matrix4().multiplyMatrices(
            TM,
            LB.m4(-1.3 + k * 0.34, -3.75, 0.52, 0, Math.PI / 2 - 0.3, 0),
          ),
        }),
      );
    }
    // keystone tablet (wider at the top) with a raised border
    {
      const ks = new THREE.Shape();
      ks.moveTo(-2.0, -3.7);
      ks.lineTo(2.0, -3.7);
      ks.lineTo(2.25, 3.7);
      ks.lineTo(-2.25, 3.7);
      ks.closePath();
      const tg = new THREE.ExtrudeGeometry(ks, {
        depth: 0.6,
        bevelEnabled: true,
        bevelSize: 0.1,
        bevelThickness: 0.1,
        bevelSegments: 1,
      });
      tg.translate(0, 0, -0.3);
      b.add(V, tg, Object.assign({}, o, { uv: "box", m: TM }));
      const bs = new THREE.Shape();
      bs.moveTo(-2.0, -3.7);
      bs.lineTo(2.0, -3.7);
      bs.lineTo(2.25, 3.7);
      bs.lineTo(-2.25, 3.7);
      bs.closePath();
      const hole = new THREE.Path();
      hole.moveTo(-1.72, -3.4);
      hole.lineTo(1.72, -3.4);
      hole.lineTo(1.94, 3.4);
      hole.lineTo(-1.94, 3.4);
      hole.closePath();
      bs.holes.push(hole);
      b.add(
        V,
        new THREE.ExtrudeGeometry(bs, { depth: 0.14, bevelEnabled: false }),
        Object.assign({}, o, {
          uv: "box",
          m: new THREE.Matrix4().multiplyMatrices(TM, LB.m4(0, 0, 0.38)),
        }),
      );
      const tabK = LB.texMat(
        "liberty_tablet",
        LB.canvasTex("lb_tablet", 256, 512, (ctx, w, h) => {
          const vt = LB.verdigrisTex().image;
          ctx.drawImage(vt, 0, 0, w, h);
          ctx.fillStyle = "rgba(28,52,44,0.85)";
          ctx.textAlign = "center";
          ctx.font = 'bold 46px "Times New Roman", serif';
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText("JULY IV", 0, -30);
          ctx.fillText("MDCCLXXVI", 0, 34);
          ctx.restore();
        }),
      );
      b.add(tabK, new THREE.PlaneGeometry(3.9, 6.9), {
        m: new THREE.Matrix4().multiplyMatrices(TM, LB.m4(0, 0, 0.415)),
        uv: "keep",
        grime: 0.1,
      });
    }

    // ---- NECK, HEAD & HAIR (one displaced ellipsoid) ----
    const HC = new THREE.Vector3(0, 30.5, 0.3),
      HR = [1.92, 2.45, 2.1];
    b.add(
      V,
      LB.organicTube(
        [
          new THREE.Vector3(0, 26.9, 0.05),
          new THREE.Vector3(0, 28.1, 0.18),
          new THREE.Vector3(0, 29.1, 0.3),
        ],
        (t) => 1.28 - t * 0.12,
        { radial: 16, seg: 6 },
      ),
      o,
    );
    // robe neckline: a soft rolled collar where the stola meets the neck
    {
      const col = new THREE.TorusGeometry(1.62, 0.26, 8, 28);
      LB.deform(col, (v) => {
        const a = Math.atan2(v.y, v.x);
        v.z += 0.08 * Math.sin(a * 7);
      });
      b.add(
        V,
        col,
        Object.assign({}, o, {
          uv: "box",
          m: LB.m4(0, 26.75, 0.16, 0, Math.PI / 2 + 0.08, 0, 1, 1.04, 1),
        }),
      );
    }
    const headDeform = (v) => {
      // v on the unit sphere (SphereGeometry radius 1) → displaced & later scaled by HR
      const x = v.x,
        y = v.y,
        z = v.z;
      let d = 0;
      const front = sm(0.25, 0.75, z);
      d += 0.13 * gauss(y - 0.2, 0.08) * gauss(x, 0.5) * front; // brow ridge
      for (const sx of [-0.31, 0.31]) {
        d -= 0.17 * gauss(x - sx, 0.13) * gauss(y - 0.07, 0.09) * front; // eye sockets
        d += 0.08 * gauss(x - sx, 0.09) * gauss(y - 0.05, 0.05) * front; // heavy lids / eyeballs
        d += 0.05 * gauss(x - sx * 1.45, 0.16) * gauss(y + 0.14, 0.14) * front; // cheekbones
      }
      d +=
        0.28 *
        gauss(x, 0.07) *
        sm(0.17, -0.02, y) *
        sm(-0.31, -0.19, y) *
        front *
        (0.45 + 0.55 * sm(0.14, -0.22, y)); // straight Greek nose
      d += 0.09 * gauss(x, 0.15) * gauss(y + 0.27, 0.05) * front; // nostril wings
      d += 0.07 * gauss(x, 0.2) * gauss(y + 0.37, 0.035) * front; // upper lip
      d -= 0.07 * gauss(x, 0.19) * gauss(y + 0.415, 0.022) * front; // mouth line
      d += 0.07 * gauss(x, 0.17) * gauss(y + 0.46, 0.035) * front; // lower lip
      d += 0.11 * gauss(x, 0.24) * gauss(y + 0.66, 0.1) * front; // chin
      d -= 0.05 * gauss(x, 0.3) * gauss(y + 0.56, 0.05) * front; // mentolabial groove
      // hair: everything above the hairline and around the back sits proud, with combed waves
      const hairline =
        sm(0.28, 0.42, y + (1 - front) * 0.6) *
        (1 - front * sm(0.4, 0.2, y) * 0);
      const hairMask = Math.max(
        sm(0.3, 0.42, y),
        (1 - front) * sm(-0.55, -0.1, y + 0.1 * Math.abs(x)),
      );
      const th = Math.atan2(x, z);
      d +=
        hairMask *
        (0.09 +
          0.035 * Math.sin(th * 16 + y * 7) +
          0.02 * Math.sin(th * 31 - y * 11));
      void hairline;
      v.multiplyScalar(1 + d);
      // jaw taper & flatter face plane
      if (y < -0.2) {
        const k = 1 - 0.17 * sm(-0.2, -0.9, y) * (0.5 + 0.5 * front);
        v.x *= k;
      }
      if (z > 0.5) v.z -= (z - 0.5) * 0.18;
    };
    // cavity occlusion for the face (per-vertex aoMul): the verdigris is nearly uniform, so without it the sculpted
    // features vanish under flat daylight. Sockets, the shadow under brow/nose/lower lip, the mouth line, the hair
    // grooves and the jaw underside darken; nose ridge, brow, cheekbones and lids catch a little extra light.
    const headAO = (x, y, z) => {
      const front = sm(0.25, 0.75, z);
      let a = 1;
      for (const sx of [-0.31, 0.31]) {
        a -= 0.55 * gauss(x - sx, 0.12) * gauss(y - 0.06, 0.08) * front; // eye sockets
        a += 0.18 * gauss(x - sx, 0.07) * gauss(y - 0.04, 0.035) * front; // lids catch light
        a -= 0.3 * gauss(x - sx * 0.55, 0.06) * gauss(y - 0.02, 0.09) * front; // inner corners beside the nose
        a += 0.1 * gauss(x - sx * 1.45, 0.14) * gauss(y + 0.12, 0.1) * front; // cheekbones
        a -= 0.22 * gauss(x - sx * 0.62, 0.1) * gauss(y + 0.33, 0.06) * front; // nasolabial folds
      }
      a +=
        0.14 * gauss(x, 0.05) * sm(0.15, -0.05, y) * sm(-0.3, -0.18, y) * front; // nose ridge
      a -= 0.45 * gauss(x, 0.13) * gauss(y + 0.25, 0.035) * front; // under the nose
      a -= 0.55 * gauss(x, 0.17) * gauss(y + 0.415, 0.022) * front; // mouth line
      a -= 0.3 * gauss(x, 0.16) * gauss(y + 0.52, 0.035) * front; // under the lower lip
      a -=
        0.25 * gauss(y - 0.16, 0.05) * gauss(x, 0.5) * front * sm(0.2, 0.6, z); // brow shadow line
      if (y < -0.55) a -= 0.35 * sm(-0.55, -0.95, y) * (1 - front * 0.5); // under the jaw
      const hairMask = Math.max(
        sm(0.3, 0.42, y),
        (1 - front) * sm(-0.55, -0.1, y + 0.1 * Math.abs(x)),
      );
      const th = Math.atan2(x, z);
      a -= hairMask * 0.3 * Math.max(0, -Math.sin(th * 16 + y * 7)); // combed hair grooves
      return Math.max(0.3, Math.min(1.15, a));
    };
    {
      const hg = new THREE.SphereGeometry(1, 56, 42);
      const hp = hg.attributes.position,
        ao = new Float32Array(hp.count),
        hv = new THREE.Vector3();
      for (let i = 0; i < hp.count; i++) {
        hv.set(hp.getX(i), hp.getY(i), hp.getZ(i));
        ao[i] = headAO(hv.x, hv.y, hv.z);
        headDeform(hv);
        hp.setXYZ(i, hv.x, hv.y, hv.z);
      }
      LB.weldNormals(hg);
      hg.setAttribute("aoMul", new THREE.BufferAttribute(ao, 1));
      b.add(
        V,
        hg,
        Object.assign({}, o, {
          m: LB.m4(HC.x, HC.y, HC.z, 0, 0, 0, HR[0], HR[1], HR[2]),
          grime: 0.05,
          uv: "box",
          uvScale: 3,
        }),
      );
    }
    // hair knot at the nape + locks over the ears
    b.sphere(
      V,
      0,
      29.35,
      -1.35,
      1,
      Object.assign({}, o, {
        sx: 1.55,
        sy: 1.2,
        sz: 1.15,
        ws: 18,
        hs: 12,
        uv: "box",
        deform: (v) => {
          const a = Math.atan2(v.x, v.y);
          v.multiplyScalar(1 + 0.08 * Math.sin(a * 9));
        },
      }),
    );
    for (const sx of [-1, 1])
      b.sphere(
        V,
        sx * 1.55,
        29.9,
        0.0,
        1,
        Object.assign({}, o, {
          sx: 0.42,
          sy: 0.85,
          sz: 0.75,
          ws: 10,
          hs: 8,
          uv: "box",
        }),
      );

    // ---- CROWN: diadem band with windows, rim mouldings, seven faceted rays ----
    const CZ0 = 0.18;
    const band = new THREE.CylinderGeometry(2.08, 2.2, 1.0, 36, 1, true);
    b.add(
      V,
      band,
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(0, 32.35, CZ0, 0, 0, 0, 1, 1, 1.12),
      }),
    );
    b.add(
      V,
      new THREE.TorusGeometry(2.14, 0.13, 6, 36),
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(0, 32.86, CZ0, 0, Math.PI / 2, 0, 1, 1.12, 1),
      }),
    );
    b.add(
      V,
      new THREE.TorusGeometry(2.27, 0.12, 6, 36),
      Object.assign({}, o, {
        uv: "box",
        m: LB.m4(0, 31.86, CZ0, 0, Math.PI / 2, 0, 1, 1.12, 1),
      }),
    );
    for (let i = 0; i < 13; i++) {
      const a = -1.1 + i * (2.2 / 12);
      b.quad(
        "window_lit",
        Math.sin(a) * 2.22,
        32.36,
        CZ0 + Math.cos(a) * 2.22 * 1.12,
        0.26,
        0.44,
        { ry: a, noAO: true, grime: 0 },
      );
      b.box(
        V,
        Math.sin(a + 0.085) * 2.24,
        32.1,
        CZ0 + Math.cos(a + 0.085) * 2.24 * 1.12,
        0.06,
        0.55,
        0.08,
        { ry: a, seg: false, grime: 0 },
      ); // mullions
    }
    // seven rays: long, needle-sharp square spikes (a 4-sided lathe: stout socket, fast taper, long slender blade) fanning
    // out and up from the diadem — the centre ray tallest and steepest, the outer pair almost level
    for (let i = 0; i < 7; i++) {
      const a = -1.5 + i * 0.5,
        off = Math.abs(i - 3);
      const len = 5.0 + (i === 3 ? 0.5 : 0) - off * 0.15; // round 1 revise: +22 % so the crown reads at harbour range
      const ray = new THREE.LatheGeometry(
        [
          [0.001, -0.05],
          [0.46, -0.05],
          [0.42, 0.3],
          [0.29, len * 0.28],
          [0.16, len * 0.62],
          [0.001, len],
        ].map((p) => new THREE.Vector2(p[0], p[1])),
        4,
      );
      ray.rotateY(Math.PI / 4);
      ray.scale(1, 1, 0.72); // flattened blade: broad face to the front
      const rayF = ray.toNonIndexed();
      rayF.computeVertexNormals(); // flat facets: crisp arrises catch the light
      const dir = new THREE.Vector3(
        Math.sin(a) * 0.86,
        0.62 - off * 0.09,
        Math.cos(a) * 0.86 * 1.08,
      ).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir,
      );
      q.multiply(
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), a),
      ); // blade face turned outward
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(Math.sin(a) * 2.05, 32.75, CZ0 + Math.cos(a) * 2.2),
        q,
        new THREE.Vector3(1, 1, 1),
      );
      b.add(V, rayF, Object.assign({}, o, { uv: "box", m }));
      b.sphere(
        V,
        Math.sin(a) * 2.1,
        32.72,
        CZ0 + Math.cos(a) * 2.28,
        0.28,
        Object.assign({}, o, { uv: "box", ws: 8, hs: 6 }),
      ); // ray socket boss
    }
    // patina pass over every copper piece of the statue
    const vs = b.parts.get(V) || [];
    for (let i = n0; i < vs.length; i++) patina(vs[i], 0.85);
  }

  // ====================================================================
  // Waving flag (plane with per-frame vertex displacement)
  // ====================================================================
  // The wave runs in the vertex shader (one shared time uniform, analytic normals), so a flag costs no CPU per frame.
  // opts.hang: hanging banner (amplitude grows downward from the top edge) instead of a pole flag (grows along x).
  G._lb.flagTime = G._lb.flagTime || { value: 0 };
  function makeFlag(tex, w, h, opts) {
    opts = opts || {};
    const geo = new THREE.PlaneGeometry(
      w,
      h,
      opts.hang ? 16 : 14,
      opts.hang ? 10 : 6,
    );
    geo.translate(w / 2, -h / 2, 0);
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      side: THREE.DoubleSide,
      roughness: 0.95,
    });
    const P = {
      uLbT: G._lb.flagTime,
      uLbF: {
        value: new THREE.Vector4(
          w,
          h,
          opts.amp || (opts.hang ? 0.25 : 0.35),
          opts.hang ? 1 : 0,
        ),
      },
      uLbS: {
        value: new THREE.Vector3(
          opts.freq || (opts.hang ? 0.7 : 1.3),
          opts.speed || (opts.hang ? 1.1 : 3.2),
          opts.hang ? 0 : 0.3,
        ),
      },
    };
    mat.onBeforeCompile = function (sh) {
      Object.assign(sh.uniforms, P);
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
uniform float uLbT; uniform vec4 uLbF; uniform vec3 uLbS;
float lbWave(vec2 q) {
  float k = uLbF.w > 0.5 ? clamp(-q.y / uLbF.y, 0.0, 1.0) : clamp(q.x / uLbF.x, 0.0, 1.0);
  float a = sin(q.x * uLbS.x - uLbT * uLbS.y + q.y * 0.3) * uLbF.z * k;
  float b = sin(q.x * (uLbS.x * 2.2) - uLbT * (uLbS.y * 1.6)) * uLbF.z * 0.24 * (uLbF.w > 0.5 ? 1.0 : k);
  return a + b;
}`,
        )
        .replace(
          "#include <beginnormal_vertex>",
          `float lbZ = lbWave(position.xy);
float lbZx = lbWave(position.xy + vec2(0.05, 0.0)), lbZy = lbWave(position.xy + vec2(0.0, 0.05));
vec3 objectNormal = normalize(vec3(-(lbZx - lbZ) / 0.05, -(lbZy - lbZ) / 0.05, 1.0));
#ifdef USE_TANGENT
vec3 objectTangent = vec3(tangent.xyz);
#endif`,
        )
        .replace(
          "#include <begin_vertex>",
          `vec3 transformed = vec3(position);
transformed.z += lbZ;
if (uLbF.w < 0.5) { float kk = clamp(position.x / uLbF.x, 0.0, 1.0); transformed.y -= kk * kk * 0.3; }`,
        );
    };
    mat.customProgramCacheKey = () => "lb_flag_v1";
    mat.userData.shared = true;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = false; // the depth pass would not wave; flags are thin anyway
    mesh.receiveShadow = true;
    mesh.frustumCulled = true;
    geo.boundingSphere = null;
    geo.computeBoundingSphere();
    geo.boundingSphere.radius += (opts.amp || 0.4) + 0.3;
    mesh.userData.wave = function () {
      /* GPU-driven — kept for API compatibility */
    };
    return mesh;
  }
  G._lb.makeFlag = makeFlag;

  // ====================================================================
  // Continuity Rotorcraft: a tandem twin-rotor transport helicopter (boxy
  // hull with a rounded roof, glazed nose, low forward and tall aft rotor
  // pylons with three-blade rotors, sponson tanks, four wheels, the rear
  // loading ramp lowered). Nose at local +Z.
  // ====================================================================
  function buildRotorcraft(b, M) {
    const add = (key, geo, m, extra) =>
      b.add(
        key,
        geo,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.45 },
          extra || {},
        ),
      );
    const K = "gunmetal";
    add(K, new THREE.BoxGeometry(2.6, 1.7, 11.4), LB.m4(0, 1.75, -0.4)); // hull
    const roof = new THREE.CylinderGeometry(
      1.3,
      1.3,
      11.4,
      14,
      1,
      false,
      Math.PI / 2,
      Math.PI,
    );
    roof.rotateX(Math.PI / 2);
    add(K, roof, LB.m4(0, 2.6, -0.4, 0, 0, 0, 1, 0.5, 1)); // rounded roof
    const nose = new THREE.CylinderGeometry(0.9, 1.35, 1.6, 12, 1);
    nose.rotateX(Math.PI / 2);
    add(K, nose, LB.m4(0, 1.95, 6.1, 0, 0, 0, 1, 0.85, 1)); // tapered nose
    add(
      "glass_dark",
      new THREE.BoxGeometry(2.0, 0.85, 0.08),
      LB.m4(0, 2.5, 6.25, 0, -0.65),
      { noAO: true },
    ); // windscreen
    for (const sx of [-1, 1]) {
      add(
        "glass_dark",
        new THREE.BoxGeometry(0.06, 0.6, 1.3),
        LB.m4(sx * 1.31, 2.25, 4.9),
        { noAO: true },
      ); // cockpit side glass
      add(
        "glass_dark",
        new THREE.PlaneGeometry(1.4, 1.5),
        LB.m4(sx * 1.31, 1.75, 2.6, (sx * Math.PI) / 2),
        { uv: "keep", noAO: true },
      ); // open side door
      add(K, new THREE.BoxGeometry(0.5, 0.7, 6.0), LB.m4(sx * 1.5, 1.25, -0.6)); // sponson tank
      add(
        "paint_cream",
        new THREE.CircleGeometry(0.5, 20),
        LB.m4(sx * 1.32, 2.05, -3.0, (sx * Math.PI) / 2),
        { uv: "keep", noAO: true },
      ); // roundel
      add(
        K,
        new THREE.CircleGeometry(0.3, 20),
        LB.m4(sx * 1.335, 2.05, -3.0, (sx * Math.PI) / 2),
        { uv: "keep", noAO: true },
      );
      const eng = new THREE.CylinderGeometry(0.4, 0.4, 2.0, 10);
      eng.rotateX(Math.PI / 2);
      add(K, eng, LB.m4(sx * 0.95, 3.5, -5.0)); // engine pods on the aft pylon
    }
    add(K, new THREE.BoxGeometry(1.2, 0.8, 1.8), LB.m4(0, 3.1, 4.4)); // forward pylon (low)
    add(K, new THREE.BoxGeometry(1.4, 2.0, 3.2), LB.m4(0, 3.3, -4.8)); // aft pylon (tall)
    const rotor = (z, y, a0) => {
      add(
        "iron",
        new THREE.CylinderGeometry(0.22, 0.28, 0.5, 8),
        LB.m4(0, y, z),
      );
      for (let k = 0; k < 3; k++) {
        const bl = new THREE.BoxGeometry(0.38, 0.06, 5.6);
        bl.translate(0, 0, 2.8);
        add("iron", bl, LB.m4(0, y + 0.2, z, a0 + (k * TAU) / 3, -0.03));
      }
    };
    rotor(4.4, 3.6, 0.3);
    rotor(-4.8, 4.45, 0.9);
    for (const [gx, gz] of [
      [-1.15, 3.6],
      [1.15, 3.6],
      [-1.3, -3.8],
      [1.3, -3.8],
    ]) {
      // wheeled landing gear
      add("iron", new THREE.BoxGeometry(0.14, 0.7, 0.14), LB.m4(gx, 0.55, gz));
      const w = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 12);
      w.rotateZ(Math.PI / 2);
      add("tire", w, LB.m4(gx + Math.sign(gx) * 0.12, 0.42, gz));
    }
    add(
      K,
      new THREE.BoxGeometry(2.2, 0.12, 2.6),
      LB.m4(0, 0.5, -7.2, 0, -0.32),
    ); // rear ramp, lowered
    add(
      "glass_dark",
      new THREE.PlaneGeometry(2.2, 1.6),
      LB.m4(0, 1.75, -6.12, Math.PI),
      { uv: "keep", noAO: true },
    ); // dark hold
  }

  // ====================================================================
  // Harbor skiff (rowboat with outboard motor) — used by both piers
  // ====================================================================
  function buildSkiff(b, M) {
    const add = (key, geo, m) =>
      b.add(key, geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    const hull = new THREE.SphereGeometry(
      1,
      12,
      8,
      0,
      TAU,
      Math.PI / 2,
      Math.PI / 2,
    );
    hull.scale(1.1, 0.7, 3.0);
    add("paint_teal", hull, LB.m4(0, 0.8, 0));
    add("rotten", new THREE.BoxGeometry(2.0, 0.06, 0.4), LB.m4(0, 0.7, 0.4));
    add("rotten", new THREE.BoxGeometry(1.8, 0.06, 0.4), LB.m4(0, 0.7, -1.4));
    add("iron", new THREE.BoxGeometry(0.4, 0.7, 0.5), LB.m4(0, 1.0, -3.0));
    add(
      "iron",
      new THREE.CylinderGeometry(0.05, 0.05, 1.2, 5),
      LB.m4(0, 0.3, -3.1),
    );
  }
  G._lb.buildSkiff = buildSkiff;
})();
