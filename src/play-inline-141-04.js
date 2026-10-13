// play-inline-141 04 — math
// Lines 544-1060 of readable/play-inline-141.pretty.js (statement-aligned).
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
