// play-inline-134 03 — the
// Lines 38-1873 of readable/play-inline-134.pretty.js (statement-aligned).
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
