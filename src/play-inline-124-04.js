// play-inline-124 04 — math
// Lines 413-1691 of readable/play-inline-124.pretty.js (statement-aligned).
  function build(rec) {
    const b = K.builder("stpat_shell", { grime: 0.5 });
    const d = K.builder("stpat_detail", { grime: 0.5 });
    const glows = K.glowSet("stpat");
    const green = K.glowSet("stpat_sun");
    const P = K.parts;
    const M = "marble",
      MT = 0xe6e2d8;
    b.burn(140, 38, -352, 6, 0.6)
      .burn(186, 10, -341, 6, 0.6)
      .burn(150, 20, -332, 5, 0.4);

    // ---- aisle outer walls (north & south) ----
    for (const z of [AISLE.z0, AISLE.z1]) {
      const zz = z < ZC ? z + 0.5 : z - 0.5;
      b.boxMM(M, NAVE.x0, 0, zz - 0.5, TRAN.x0, AISLE.h, zz + 0.5, {
        tint: MT,
      });
      b.boxMM(M, TRAN.x1, 0, zz - 0.5, NAVE.x1, AISLE.h, zz + 0.5, {
        tint: MT,
      });
      K.colBox(NAVE.x0, 0, zz - 0.5, TRAN.x0, AISLE.h, zz + 0.5);
      K.colBox(TRAN.x1, 0, zz - 0.5, NAVE.x1, AISLE.h, zz + 0.5);
      const face = z < ZC ? Math.PI : 0;
      for (let x = NAVE.x0 + 3; x < NAVE.x1 - 1; x += 4.6) {
        if (x > TRAN.x0 - 1.5 && x < TRAN.x1 + 1.5) continue;
        b.panel(
          "stained",
          x,
          5.8,
          zz + (z < ZC ? -0.52 : 0.52),
          1.9,
          5.6,
          face,
        );
        b.panel(
          "stained",
          x,
          5.8,
          zz + (z < ZC ? 0.52 : -0.52),
          1.9,
          5.6,
          face + Math.PI,
        );
        // buttress pier + pinnacle + flying buttress up to the clerestory
        const bz = z < ZC ? z - 0.7 : z + 0.7;
        b.boxMM(M, x + 2.0, 0, bz - 0.8, x + 2.9, AISLE.h + 2, bz + 0.8, {
          tint: MT,
          grime: 0.55,
        });
        d.geo(M, K.T.cone4, {
          x: x + 2.45,
          y: AISLE.h + 3.2,
          z: bz,
          ry: Math.PI / 4,
          sx: 0.6,
          sy: 2.4,
          sz: 0.6,
          tint: MT,
        });
        const nz = z < ZC ? NAVE.z0 : NAVE.z1;
        b.beam(M, x + 2.45, AISLE.h + 1.2, bz, x + 2.45, NAVE.h - 3, nz, 0.45, {
          d: 0.6,
          tint: MT,
        });
        K.colBox(x + 2.0, 0, bz - 0.8, x + 2.9, AISLE.h + 2, bz + 0.8);
      }
    }
    // aisle lean-to roofs + ceilings
    for (const s of [
      [AISLE.z0, NAVE.z0],
      [AISLE.z1, NAVE.z1],
    ]) {
      const zOut = s[0],
        zIn = s[1],
        zm = (zOut + zIn) / 2,
        run = Math.abs(zIn - zOut),
        tilt = Math.atan2(3, run) * (zOut < ZC ? -1 : 1);
      for (const seg of [
        [NAVE.x0, TRAN.x0],
        [TRAN.x1, NAVE.x1],
      ]) {
        b.geo("slate", K.T.box, {
          x: (seg[0] + seg[1]) / 2,
          y: AISLE.h + 1.5,
          z: zm,
          rx: tilt,
          sx: seg[1] - seg[0],
          sy: 0.3,
          sz: run + 1.2,
        });
      }
    }
    // ---- nave clerestory walls on arcades of clustered piers ----
    for (const z of [NAVE.z0, NAVE.z1]) {
      for (const seg of [
        [NAVE.x0, TRAN.x0],
        [TRAN.x1, NAVE.x1],
      ]) {
        b.boxMM(M, seg[0], AISLE.h - 1, z - 0.4, seg[1], NAVE.h, z + 0.4, {
          tint: MT,
          faces: "nsewtb",
        });
        K.colBox(seg[0], AISLE.h - 1, z - 0.4, seg[1], NAVE.h, z + 0.4);
        for (let x = seg[0] + 2.5; x < seg[1] - 1; x += 4.6) {
          b.panel(
            "stained",
            x + 2.3,
            15,
            z + (z < ZC ? -0.42 : 0.42),
            1.4,
            4.2,
            z < ZC ? Math.PI : 0,
          );
          b.panel(
            "stained",
            x + 2.3,
            15,
            z + (z < ZC ? 0.42 : -0.42),
            1.4,
            4.2,
            z < ZC ? 0 : Math.PI,
          );
        }
      }
    }
    // nave gable roof + ribbed ceiling
    const gable = (x0, x1, zc, halfW, y0, rise, alongZ) => {
      const sh = new THREE.Shape();
      sh.moveTo(-halfW - 0.8, 0);
      sh.lineTo(halfW + 0.8, 0);
      sh.lineTo(0, rise);
      sh.lineTo(-halfW - 0.8, 0);
      if (!alongZ)
        b.extrude("slate", sh, x1 - x0, {
          x: (x0 + x1) / 2,
          y: y0,
          z: zc,
          ry: Math.PI / 2,
          grime: 0.4,
        });
      else
        b.extrude("slate", sh, x1 - x0, {
          x: zc,
          y: y0,
          z: (x0 + x1) / 2,
          ry: 0,
          grime: 0.4,
        });
    };
    gable(NAVE.x0, TRAN.x0, ZC, 5.5, NAVE.h, 8, false);
    gable(TRAN.x1, NAVE.x1, ZC, 5.5, NAVE.h, 8, false);
    gable(TRAN.z0, TRAN.z1, (TRAN.x0 + TRAN.x1) / 2, 4, NAVE.h, 8, true);
    // ---- transept end walls (with lancets) and side walls ----
    for (const z of [TRAN.z0, TRAN.z1]) {
      const zz = z < ZC ? z + 0.5 : z - 0.5;
      b.boxMM(M, TRAN.x0 - 0.5, 0, zz - 0.5, TRAN.x1 + 0.5, NAVE.h, zz + 0.5, {
        tint: MT,
      });
      K.colBox(TRAN.x0 - 0.5, 0, zz - 0.5, TRAN.x1 + 0.5, NAVE.h, zz + 0.5);
      const face = z < ZC ? Math.PI : 0;
      for (const dx of [-2, 0, 2]) {
        b.panel(
          "stained",
          (TRAN.x0 + TRAN.x1) / 2 + dx,
          dx ? 9 : 11,
          zz + (z < ZC ? -0.52 : 0.52),
          1.6,
          dx ? 8 : 11,
          face,
        );
        b.panel(
          "stained",
          (TRAN.x0 + TRAN.x1) / 2 + dx,
          dx ? 9 : 11,
          zz + (z < ZC ? 0.52 : -0.52),
          1.6,
          dx ? 8 : 11,
          face + Math.PI,
        );
      }
      // gable end triangle
      const sh = new THREE.Shape();
      sh.moveTo(-4.8, 0);
      sh.lineTo(4.8, 0);
      sh.lineTo(0, 8);
      sh.lineTo(-4.8, 0);
      b.extrude(M, sh, 1.0, {
        x: (TRAN.x0 + TRAN.x1) / 2,
        y: NAVE.h,
        z: zz,
        tint: MT,
      });
      for (const px of [TRAN.x0 - 0.5, TRAN.x1 + 0.5])
        d.geo(M, K.T.cone4, {
          x: px,
          y: NAVE.h + 2.5,
          z: zz,
          ry: Math.PI / 4,
          sx: 0.7,
          sy: 5,
          sz: 0.7,
          tint: MT,
        });
    }
    for (const x of [TRAN.x0, TRAN.x1])
      for (const zr of [
        [TRAN.z0 + 1, AISLE.z0],
        [AISLE.z1, TRAN.z1 - 1],
      ]) {
        b.boxMM(M, x - 0.5, 0, zr[0], x + 0.5, NAVE.h, zr[1], { tint: MT });
        K.colBox(x - 0.5, 0, zr[0], x + 0.5, NAVE.h, zr[1]);
        b.panel(
          "stained",
          x + (x === TRAN.x0 ? -0.52 : 0.52),
          8,
          (zr[0] + zr[1]) / 2,
          1.6,
          6,
          x === TRAN.x0 ? -Math.PI / 2 : Math.PI / 2,
        );
      }

    // ---- apse (half-octagon) ----
    const apR = 6,
      apx = NAVE.x1,
      apts = [];
    for (let k = 0; k <= 4; k++) {
      const a = -Math.PI / 2 + (k * Math.PI) / 4;
      apts.push([apx + Math.cos(a) * apR, ZC + Math.sin(a) * apR]);
    }
    for (let k = 0; k < 4; k++) {
      const a = apts[k],
        c = apts[k + 1];
      b.wall(M, a[0], a[1], c[0], c[1], 0, 16, 0.9, [], { tint: MT });
      const mx = (a[0] + c[0]) / 2,
        mz = (a[1] + c[1]) / 2,
        ang = Math.atan2(mx - apx, mz - ZC);
      b.panel(
        "stained",
        mx + Math.sin(ang) * 0.47,
        8,
        mz + Math.cos(ang) * 0.47,
        1.6,
        7,
        ang,
      );
      b.panel(
        "stained",
        mx - Math.sin(ang) * 0.47,
        8,
        mz - Math.cos(ang) * 0.47,
        1.6,
        7,
        ang + Math.PI,
      );
      d.geo(M, K.T.cone4, {
        x: a[0],
        y: 17.5,
        z: a[1],
        ry: Math.PI / 4,
        sx: 0.6,
        sy: 3.5,
        sz: 0.6,
        tint: MT,
      });
    }
    b.geo(
      "slate",
      new THREE.ConeGeometry(apR + 0.8, 7, 8, 1, false, 0, Math.PI),
      { x: apx, y: 19.5, z: ZC, ry: 0 },
    );
    b.boxMM(
      M,
      NAVE.x1 - 0.5,
      AISLE.h - 1,
      NAVE.z0,
      NAVE.x1 + 0.3,
      NAVE.h,
      NAVE.z0 + 0.1,
      { tint: MT },
    );
    // east wall pieces bridging the aisles to the apse
    for (const zr of [
      [AISLE.z0 + 1, ZC - apR],
      [ZC + apR, AISLE.z1 - 1],
    ]) {
      b.boxMM(M, NAVE.x1 - 0.5, 0, zr[0], NAVE.x1 + 0.5, AISLE.h, zr[1], {
        tint: MT,
      });
      K.colBox(NAVE.x1 - 0.5, 0, zr[0], NAVE.x1 + 0.5, AISLE.h, zr[1]);
    }
    // ---- nave interior structure (floor, aisle/nave/apse ceilings, arcades, ribs): 80_st_patricks_interior.js ----
    const ctx = {
      rec,
      b,
      d,
      glows,
      green,
      P,
      M,
      MT,
      ZC,
      NAVE,
      AISLE,
      TRAN,
      apR,
      apx,
    };
    K.interior("st_patricks:nave", ctx);

    // ---- west front: twin towers, portal, rose window, gable ----
    const towers = [
      [-356, -347.5],
      [-335.5, -327],
    ];
    for (const t of towers) {
      b.boxMM(M, 132, 0, t[0], 141, 34, t[1], { tint: MT, grime: 0.55 });
      K.colBox(132, 0, t[0], 141, 34, t[1]);
      // corner buttresses (stepped)
      for (const cx of [141])
        for (const cz of t) {
          const ox = cx === 132 ? -0.35 : 0.35,
            oz =
              cz < ZC - 5 ? -0.35 : cz > ZC + 5 ? 0.35 : cz < ZC ? 0.35 : -0.35;
          b.boxMM(
            M,
            cx + ox - 0.85,
            0,
            cz + oz - 0.85,
            cx + ox + 0.85,
            30,
            cz + oz + 0.85,
            { tint: 0xdcd8ce, grime: 0.55 },
          );
          d.geo(M, K.T.cone4, {
            x: cx,
            y: 36,
            z: cz,
            ry: Math.PI / 4,
            sx: 0.8,
            sy: 6,
            sz: 0.8,
            tint: MT,
          });
        }
      // lancets on the tower faces
      for (const y of [12, 22])
        b.panel(
          "glass_broken",
          (132 + 141) / 2,
          y + 6,
          t[0] < ZC ? t[0] - 0.02 : t[1] + 0.02,
          1.4,
          5,
          t[0] < ZC ? Math.PI : 0,
        );
      // west-face lancets: paired lights under a hood mould (lower) and a tall belfry lancet with louvres (upper)
      const tc = (t[0] + t[1]) / 2;
      for (const dz of [-0.75, 0.75])
        b.panel("stained", 131.97, 15.2, tc + dz, 1.2, 5.2, -Math.PI / 2, {
          tint: 0x808080,
        });
      b.wall(
        M,
        131.82,
        tc - 2.1,
        131.82,
        tc + 2.1,
        12.4,
        19.6,
        0.3,
        [{ at: 2.1, w: 3.2, h: 6.2, pointed: true }],
        { tint: MT, collide: false },
      );
      d.beam(M, 131.9, 12.6, tc, 131.9, 16.4, tc, 0.18, { tint: MT });
      b.panel("stained", 131.97, 26.6, tc, 1.8, 6.4, -Math.PI / 2, {
        tint: 0x5a5a5a,
      });
      b.wall(
        M,
        131.82,
        tc - 1.7,
        131.82,
        tc + 1.7,
        23.2,
        31.0,
        0.3,
        [{ at: 1.7, w: 2.4, h: 7.0, pointed: true }],
        { tint: MT, collide: false },
      );
      for (let y = 24.2; y < 28.6; y += 0.55)
        d.box("slate", 131.9, y, tc, 0.12, 0.08, 1.8, { tint: 0x3a3a3a });
      // string courses across the tower front
      for (const y of [11.2, 22.6, 33.3])
        b.boxMM(M, 131.62, y, t[0] + 0.9, 132, y + 0.35, t[1] - 0.9, {
          tint: 0xd8d2c4,
          grime: 0.55,
        });
      // belfry lantern + spire
      const cx = 136.5,
        cz = (t[0] + t[1]) / 2;
      b.cyl(M, cx, 34, cz, 3.9, 3.6, 4.5, 8, { tint: MT, yaw: Math.PI / 8 });
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4 + Math.PI / 8;
        b.panel(
          "glass_broken",
          cx + Math.cos(a) * 3.66,
          36.2,
          cz - Math.sin(a) * 3.66,
          1.2,
          3,
          a + Math.PI / 2 - Math.PI / 2 + Math.PI / 2,
        );
      }
      // lantern parapet: pierced gablets + corner pinnacles ring the base of the spire
      for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4 + Math.PI / 8,
          gx = cx + Math.cos(a) * 3.55,
          gz = cz - Math.sin(a) * 3.55;
        const gs = new THREE.Shape();
        gs.moveTo(-1.2, 0);
        gs.lineTo(1.2, 0);
        gs.lineTo(0, 3.2);
        gs.lineTo(-1.2, 0);
        b.extrude(M, gs, 0.3, {
          x: gx,
          y: 38.5,
          z: gz,
          ry: a + Math.PI / 2,
          tint: MT,
          grime: 0.45,
        });
        const pa = a + Math.PI / 8,
          px = cx + Math.cos(pa) * 3.9,
          pz = cz - Math.sin(pa) * 3.9;
        b.cyl(M, px, 38.5, pz, 0.32, 0.28, 2.2, 6, { tint: MT });
        d.geo(M, K.T.cone4, {
          x: px,
          y: 42.2,
          z: pz,
          ry: Math.PI / 4,
          sx: 0.36,
          sy: 3.2,
          sz: 0.36,
          tint: MT,
        });
      }
      // octagonal spire as tall as the tower beneath it, banded with tracery rings and lined with crockets
      const SP0 = 38.5,
        SPH = 36,
        SR = 3.4;
      b.cyl(M, cx, SP0, cz, SR, 0.18, SPH, 8, {
        tint: 0xd8d2c4,
        yaw: Math.PI / 8,
        grime: 0.5,
        rows: 8,
      });
      for (const f of [0.22, 0.47, 0.72]) {
        const rr = SR * (1 - f) + 0.12;
        b.cyl(M, cx, SP0 + SPH * f, cz, rr + 0.05, rr, 0.5, 8, {
          tint: 0xcfc8b8,
          yaw: Math.PI / 8,
          grime: 0.4,
        });
      }
      for (let j = 0; j < 8; j++) {
        const a = (j * Math.PI) / 4 + Math.PI / 8;
        for (let y = SP0 + 2; y < SP0 + SPH - 3; y += 2.3) {
          const rr = SR * (1 - (y - SP0) / SPH) + 0.08;
          d.geo(M, K.T.cone4, {
            x: cx + Math.cos(a) * rr,
            y,
            z: cz - Math.sin(a) * rr,
            rz: 0,
            ry: -a,
            rx: 0.5,
            s: 0.22,
            sy: 0.55,
            tint: MT,
          });
        }
      }
      // finial: ball, cross
      b.geo(M, K.T.sphereLo, {
        x: cx,
        y: SP0 + SPH + 0.2,
        z: cz,
        s: 0.35,
        tint: MT,
      });
      b.cyl("bronze", cx, SP0 + SPH + 0.4, cz, 0.08, 0.08, 2.4, 6, {});
      b.box("bronze", cx, SP0 + SPH + 1.9, cz, 0.08, 0.08, 1.1, {});
    }
    // ================= WEST FRONT =================
    // centre wall (x 132..133) with the inner portal opening; the gable over the gallery carries blind tracery
    b.wall(
      M,
      132.5,
      -347.5,
      132.5,
      -335.5,
      0,
      30,
      1.0,
      [{ at: 6, w: 4.6, h: 9.8, pointed: true }],
      { tint: MT },
    );
    const GR = 6.4; // gable rise
    const gsh = new THREE.Shape();
    gsh.moveTo(-6, 0);
    gsh.lineTo(6, 0);
    gsh.lineTo(0, GR);
    gsh.lineTo(-6, 0);
    b.extrude(M, gsh, 1.0, {
      x: 132.5,
      y: 30,
      z: ZC,
      ry: Math.PI / 2,
      tint: MT,
    });
    {
      // tracery layer standing proud of the gable: three stepped lancets + an oculus (where the sun disc hangs)
      const tr = new THREE.Shape();
      tr.moveTo(-5.6, 0);
      tr.lineTo(5.6, 0);
      tr.lineTo(0, GR - 0.35);
      tr.lineTo(-5.6, 0);
      const lanc = (cx, w, h) => {
        const p = new THREE.Path();
        p.moveTo(cx - w / 2, 0.5);
        p.lineTo(cx + w / 2, 0.5);
        p.lineTo(cx + w / 2, 0.5 + h - w * 0.8);
        p.quadraticCurveTo(cx + w / 2, 0.5 + h - w * 0.2, cx, 0.5 + h);
        p.quadraticCurveTo(
          cx - w / 2,
          0.5 + h - w * 0.2,
          cx - w / 2,
          0.5 + h - w * 0.8,
        );
        p.lineTo(cx - w / 2, 0.5);
        return p;
      };
      tr.holes.push(lanc(-2.6, 1.0, 2.2), lanc(2.6, 1.0, 2.2));
      const oc = new THREE.Path();
      oc.absarc(0, 2.6, 1.25, 0, Math.PI * 2, true);
      tr.holes.push(oc);
      b.extrude(M, tr, 0.3, {
        x: 131.85,
        y: 30.05,
        z: ZC,
        ry: Math.PI / 2,
        tint: 0xdcd6c8,
        curveSegments: 14,
      });
      // raking copings with crockets + finial cross
      for (const sd of [-1, 1]) {
        const L = Math.hypot(6, GR),
          ang = Math.atan2(GR, 6);
        b.beam(M, 131.75, 30, ZC + sd * 6.1, 131.75, 30 + GR + 0.1, ZC, 0.4, {
          d: 0.5,
          tint: MT,
        });
        for (let t = 0.8; t < L - 0.5; t += 0.9) {
          const f = t / L;
          d.geo(M, K.T.cone4, {
            x: 131.7,
            y: 30 + GR * f + 0.45,
            z: ZC + sd * 6.1 * (1 - f),
            ry: Math.PI / 4,
            rz: -sd * (Math.PI / 2 - ang) * 0.5,
            sx: 0.2,
            sy: 0.55,
            sz: 0.2,
            tint: MT,
          });
        }
      }
      d.box(M, 131.8, 30 + GR, ZC, 0.25, 1.9, 0.25, { tint: MT });
      d.box(M, 131.8, 30 + GR + 1.1, ZC, 0.25, 0.25, 1.1, { tint: MT });
      // gable-base pinnacles
      for (const sd of [-1, 1]) {
        b.box(M, 131.7, 30, ZC + sd * 6.35, 0.7, 2.6, 0.7, { tint: MT });
        d.geo(M, K.T.cone4, {
          x: 131.7,
          y: 34.1,
          z: ZC + sd * 6.35,
          ry: Math.PI / 4,
          sx: 0.55,
          sy: 3.0,
          sz: 0.55,
          tint: MT,
        });
      }
    }
    // gallery (pierced arcade balustrade on a corbel table) between the rose and the gable
    b.wall(
      M,
      131.72,
      ZC - 6,
      131.72,
      ZC + 6,
      26.9,
      28.5,
      0.3,
      Array.from({ length: 10 }, (_, i) => ({
        at: 1.05 + i * 1.1,
        w: 0.62,
        h: 1.05,
        y: 0.2,
        pointed: true,
      })),
      { tint: MT, collide: false },
    );
    b.boxMM(M, 131.45, 28.5, ZC - 6.1, 132, 28.75, ZC + 6.1, {
      tint: 0xd8d2c4,
    });
    b.boxMM(M, 131.5, 26.65, ZC - 6.1, 132, 26.9, ZC + 6.1, { tint: 0xd8d2c4 });
    for (let z = ZC - 5.8; z <= ZC + 5.85; z += 0.72)
      d.box(M, 131.62, 26.35, z, 0.25, 0.3, 0.3, { tint: 0xcfc8b8 });

    // ---- central portal: five receding pointed orders with colonettes, bronze doors, tympanum, wimperg ----
    const PO = [
      // [x centre, thickness, opening w, opening h, jamb]  outermost first; the centre wall itself is order 4
      [130.95, 0.45, 7.0, 11.6, 1.0],
      [131.4, 0.45, 6.2, 11.0, 0.9],
      [131.8, 0.35, 5.4, 10.4, 0.7],
    ];
    for (const o of PO) {
      const hw = o[2] / 2 + o[4];
      b.wall(
        M,
        o[0],
        ZC - hw,
        o[0],
        ZC + hw,
        0,
        o[3] + 0.35,
        o[1],
        [{ at: hw, w: o[2], h: o[3], pointed: true }],
        { tint: o === PO[0] ? 0xe0dbcf : MT, grime: 0.5 },
      );
    }
    b.wall(
      M,
      133.2,
      ZC - 2.6,
      133.2,
      ZC + 2.6,
      0,
      9.4,
      0.4,
      [{ at: 2.6, w: 3.8, h: 9.1, pointed: true }],
      { tint: 0xcfc8b8 },
    );
    // colonettes (roll mouldings) in every jamb step, with capitals at the springing and bases on the plinth
    const orders = PO.concat([[132.5, 1.0, 4.6, 9.8, 0]]);
    for (const o of orders) {
      const spring = o[3] - o[2] * 0.85;
      for (const sd of [-1, 1]) {
        const cz = ZC + sd * (o[2] / 2 + 0.04),
          cx = o[0] - o[1] / 2 + 0.05;
        b.cyl(M, cx, 0.5, cz, 0.15, 0.15, spring - 0.8, 8, {
          tint: 0xe4e0d4,
          grime: 0.4,
        });
        b.box(M, cx, 0, cz, 0.42, 0.5, 0.42, { tint: 0xcfc8b8 });
        b.box(M, cx, spring - 0.3, cz, 0.44, 0.32, 0.44, { tint: 0xd8d2c4 });
        d.geo(M, K.T.cone4, {
          x: cx,
          y: spring - 0.45,
          z: cz,
          rx: Math.PI,
          ry: Math.PI / 4,
          sx: 0.28,
          sy: 0.3,
          sz: 0.28,
          tint: 0xd8d2c4,
        });
      }
    }
    // tympanum over a carved lintel (the doorway below stays open)
    d.box(M, 133.1, 6.2, ZC, 0.5, 0.45, 3.9, { tint: 0xd8d2c4 });
    d.panel("atlas_paint", 132.95, 7.9, ZC, 3.8, 2.9, -Math.PI / 2, {
      rect: K.paint("stpat_tymp", 256, 160),
    });
    // bronze doors swung inward (each leaf 1.9 × 6.1, figure panels on both faces)
    const dr = K.paint("stpat_door", 128, 256);
    for (const sd of [-1, 1]) {
      const th = 1.15,
        hz = ZC + sd * 1.9,
        dirx = Math.sin(th),
        dirz = -sd * Math.cos(th);
      const cx = 133.35 + dirx * 0.95,
        cz = hz + dirz * 0.95,
        yaw = Math.atan2(-dirz, dirx);
      d.box("bronze", cx, 0.05, cz, 1.9, 6.1, 0.12, { yaw, grime: 0.3 });
      d.panel("atlas_paint", cx, 3.1, cz, 1.84, 6.0, yaw, {
        rect: dr,
        both: true,
        off: 0.065,
      });
      K.colRot(cx, cz, 1.9, 0.14, 0, 6.1, yaw, { surface: "metal" });
    }
    // wimperg: pointed gable over the portal with a recessed trefoil field, crockets and flanking pinnacles
    {
      const WB = 11.2,
        WR = 4.4,
        WH = 5.4;
      const out = new THREE.Shape();
      out.moveTo(-WH, 0);
      out.lineTo(WH, 0);
      out.lineTo(0, WR);
      out.lineTo(-WH, 0);
      const hole = new THREE.Path();
      hole.moveTo(-WH + 0.9, 0.35);
      hole.lineTo(0, WR - 0.75);
      hole.lineTo(WH - 0.9, 0.35);
      hole.lineTo(-WH + 0.9, 0.35);
      out.holes.push(hole);
      b.extrude(M, out, 0.45, {
        x: 130.8,
        y: WB,
        z: ZC,
        ry: Math.PI / 2,
        tint: 0xe4dfd2,
      });
      const fld = new THREE.Shape();
      fld.moveTo(-WH + 0.9, 0.35);
      fld.lineTo(WH - 0.9, 0.35);
      fld.lineTo(0, WR - 0.75);
      fld.lineTo(-WH + 0.9, 0.35);
      const tf = new THREE.Path();
      tf.absarc(0, 1.35, 0.75, 0, Math.PI * 2, true);
      fld.holes.push(tf);
      b.extrude(M, fld, 0.2, {
        x: 131.15,
        y: WB,
        z: ZC,
        ry: Math.PI / 2,
        tint: 0xcfc8b8,
      });
      for (const sd of [-1, 1]) {
        const L = Math.hypot(WH, WR),
          ang = Math.atan2(WR, WH);
        for (let t = 0.6; t < L - 0.3; t += 0.75) {
          const f = t / L;
          d.geo(M, K.T.cone4, {
            x: 130.7,
            y: WB + WR * f + 0.35,
            z: ZC + sd * WH * (1 - f),
            ry: Math.PI / 4,
            rz: -sd * (Math.PI / 2 - ang) * 0.5,
            sx: 0.16,
            sy: 0.45,
            sz: 0.16,
            tint: MT,
          });
        }
        // flanking pinnacle on the façade plane
        b.box(M, 130.95, 0, ZC + sd * 5.15, 0.75, 13.2, 0.75, {
          tint: 0xe0dbcf,
        });
        for (const f of [
          [0, 0.5],
          [0.5, 0],
        ]) {
          const gs = new THREE.Shape();
          gs.moveTo(-0.45, 0);
          gs.lineTo(0.45, 0);
          gs.lineTo(0, 0.9);
          gs.lineTo(-0.45, 0);
          b.extrude(M, gs, 0.12, {
            x: 130.95 - f[0] * 0.8,
            y: 13.2,
            z: ZC + sd * 5.15 - f[1] * 0.8 * sd * 0,
            ry: f[0] ? Math.PI / 2 : 0,
            tint: MT,
          });
        }
        d.geo(M, K.T.cone4, {
          x: 130.95,
          y: 15.4,
          z: ZC + sd * 5.15,
          ry: Math.PI / 4,
          sx: 0.5,
          sy: 4.2,
          sz: 0.5,
          tint: MT,
        });
        K.colBox(
          130.55,
          0,
          ZC + sd * 5.15 - 0.4,
          131.35,
          13.2,
          ZC + sd * 5.15 + 0.4,
        );
      }
      d.box(M, 130.75, WB + WR - 0.1, ZC, 0.2, 1.3, 0.2, { tint: MT });
      d.box(M, 130.75, WB + WR + 0.75, ZC, 0.2, 0.2, 0.9, { tint: MT });
    }
    // ---- tower portals (sealed): three receding orders, bronze doors, small wimpergs ----
    for (const tc of [-351.75, -331.25]) {
      const TO = [
        [131.1, 0.45, 3.6, 7.8, 0.75],
        [131.66, 0.68, 2.9, 7.3, 0.6],
      ];
      for (const o of TO) {
        const hw = o[2] / 2 + o[4];
        b.wall(
          M,
          o[0],
          tc - hw,
          o[0],
          tc + hw,
          0,
          o[3] + 0.35,
          o[1],
          [{ at: hw, w: o[2], h: o[3], pointed: true }],
          { tint: MT, grime: 0.5 },
        );
      }
      for (const o of TO) {
        const spring = o[3] - o[2] * 0.85;
        for (const sd of [-1, 1]) {
          const cz = tc + sd * (o[2] / 2 + 0.03),
            cx = o[0] - o[1] / 2 + 0.05;
          b.cyl(M, cx, 0.4, cz, 0.12, 0.12, spring - 0.6, 8, {
            tint: 0xe4e0d4,
          });
          b.box(M, cx, spring - 0.25, cz, 0.36, 0.26, 0.36, { tint: 0xd8d2c4 });
          b.box(M, cx, 0, cz, 0.34, 0.4, 0.34, { tint: 0xcfc8b8 });
        }
      }
      d.panel("atlas_paint", 131.96, 2.55, tc, 2.4, 5.0, -Math.PI / 2, {
        rect: dr,
      });
      d.box("bronze", 131.9, 5.05, tc, 0.12, 0.3, 2.9, { grime: 0.3 });
      d.panel("atlas_paint", 131.95, 6.05, tc, 2.5, 1.7, -Math.PI / 2, {
        rect: K.paint("stpat_tymp", 256, 160),
      });
      const out = new THREE.Shape();
      out.moveTo(-2.9, 0);
      out.lineTo(2.9, 0);
      out.lineTo(0, 2.6);
      out.lineTo(-2.9, 0);
      const hl = new THREE.Path();
      hl.moveTo(-2.1, 0.25);
      hl.lineTo(0, 2.05);
      hl.lineTo(2.1, 0.25);
      hl.lineTo(-2.1, 0.25);
      out.holes.push(hl);
      b.extrude(M, out, 0.35, {
        x: 130.95,
        y: 8.0,
        z: tc,
        ry: Math.PI / 2,
        tint: 0xe4dfd2,
      });
      d.box(M, 130.95, 10.5, tc, 0.18, 0.9, 0.18, { tint: MT });
    }
    // ---- deep stepped buttresses on the façade plane, with set-offs and pinnacles ----
    for (const bz of [-356.2, -347.5, -335.5, -326.8]) {
      const W = 1.6,
        st = [
          [0, 11, 2.3],
          [11, 22.4, 1.65],
          [22.4, 31.5, 1.05],
        ];
      for (let i = 0; i < st.length; i++) {
        const s0 = st[i];
        b.boxMM(M, 132 - s0[2], s0[0], bz - W / 2, 132, s0[1], bz + W / 2, {
          tint: 0xdcd8ce,
          grime: 0.55,
        });
        K.colBox(132 - s0[2], s0[0], bz - W / 2, 132, s0[1], bz + W / 2);
        const nxt = st[i + 1] ? st[i + 1][2] : 0.3;
        const wedge = new THREE.Shape();
        wedge.moveTo(-s0[2], 0);
        wedge.lineTo(-nxt, 0);
        wedge.lineTo(-nxt, 0.95);
        wedge.lineTo(-s0[2], 0);
        b.extrude(M, wedge, W, {
          x: 132,
          y: s0[1],
          z: bz,
          ry: 0,
          tint: 0xd4cec2,
          grime: 0.6,
        });
        // gablet on the front of each set-off
        const gb = new THREE.Shape();
        gb.moveTo(-W / 2, 0);
        gb.lineTo(W / 2, 0);
        gb.lineTo(0, 0.9);
        gb.lineTo(-W / 2, 0);
        b.extrude(M, gb, 0.12, {
          x: 132 - s0[2] + 0.04,
          y: s0[1] - 0.05,
          z: bz,
          ry: Math.PI / 2,
          tint: MT,
        });
      }
      // crowning pinnacle cluster
      b.box(M, 131.45, 31.5, bz, 0.8, 3.0, 0.8, { tint: MT });
      d.geo(M, K.T.cone4, {
        x: 131.45,
        y: 36.4,
        z: bz,
        ry: Math.PI / 4,
        sx: 0.62,
        sy: 4.4,
        sz: 0.62,
        tint: MT,
      });
      for (const dz of [-0.55, 0.55])
        d.geo(M, K.T.cone4, {
          x: 131.0,
          y: 34.2,
          z: bz + dz,
          ry: Math.PI / 4,
          sx: 0.22,
          sy: 1.6,
          sz: 0.22,
          tint: MT,
        });
    }
    // ---- the rose window (raised above the portal gable) ----
    const RY = 20.4;
    b.panel("rose", 131.95, RY, ZC, 7.6, 7.6, -Math.PI / 2);
    b.panel("rose", 133.05, RY, ZC, 7.6, 7.6, Math.PI / 2);
    b.geo(M, K.T.torus, {
      x: 131.9,
      y: RY,
      z: ZC,
      ry: Math.PI / 2,
      s: 3.9,
      tint: MT,
    });
    b.geo(M, K.T.torusThick, {
      x: 131.85,
      y: RY,
      z: ZC,
      ry: Math.PI / 2,
      s: 0.7,
      tint: MT,
    });
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      d.beam(
        M,
        131.84,
        RY + Math.sin(a) * 0.85,
        ZC + Math.cos(a) * 0.85,
        131.84,
        RY + Math.sin(a) * 3.7,
        ZC + Math.cos(a) * 3.7,
        0.09,
        { d: 0.12, tint: MT, grime: 0.3 },
      );
    }
    // deep pointed-arch hood framing the rose
    for (let k = 0; k < 3; k++) {
      const hw = 4.3 + k * 0.35,
        xk = 131.8 - k * 0.22;
      d.beam(M, xk, 15.9, ZC - hw, xk, 21.1, ZC - hw, 0.35, { tint: MT });
      d.beam(M, xk, 15.9, ZC + hw, xk, 21.1, ZC + hw, 0.35, { tint: MT });
      d.beam(M, xk, 21.1, ZC - hw, xk, 26.1 + k * 0.25, ZC, 0.35, { tint: MT });
      d.beam(M, xk, 26.1 + k * 0.25, ZC, xk, 21.1, ZC + hw, 0.35, { tint: MT });
    }
    b.boxMM(M, 131.5, 15.6, ZC - 4.9, 132, 15.9, ZC + 4.9, { tint: 0xd8d2c4 });
    P.sunDisc(d, 131.5, 32.65, ZC, 1.15, -Math.PI / 2, { glows: green });
    // Glowkeeper banners hung between the towers and on the tower faces
    for (const bz of [-351.75, -331.25]) {
      b.panel("atlas_paint", 131.5, 17.6, bz, 2.5, 6.25, -Math.PI / 2, {
        rect: K.paint("glowkeeper_banner", 256, 640),
      });
      d.beam("rust", 131.5, 20.8, bz - 1.4, 131.5, 20.8, bz + 1.4, 0.05);
    }
    b.panel("atlas_paint", 129.66, 2.2, -347.5, 1.5, 0.75, -Math.PI / 2, {
      rect: K.paint("glowkeeper_graffiti", 512, 256),
    });
    // steps up to a landing that runs into the portal, then one step down into the narthex
    // pale marble treads with bright worn nosings over shadowed risers (reads as stone steps, not a dark slab),
    // granite cheek blocks at both ends, candle offerings of the faithful on the landing
    for (let i = 0; i < 3; i++) {
      const sx = 127.6 + i,
        top = 0.15 * (i + 1);
      b.boxMM(M, sx, 0, ZC - 5.1, sx + 1.0, top, ZC + 5.1, {
        faces: "nstw",
        tint: 0xcbc4b2,
        grime: 0.55,
      });
      b.boxMM(
        M,
        sx - 0.05,
        top - 0.05,
        ZC - 5.1,
        sx + 0.14,
        top + 0.012,
        ZC + 5.1,
        { faces: "nstw", tint: 0xf4efe2, grime: 0.12 },
      );
      b.boxMM("granite", sx, 0, ZC - 5.1, sx + 0.02, top - 0.05, ZC + 5.1, {
        faces: "w",
        tint: 0x6a665e,
        grime: 0.6,
      });
    }
    K.colStairs(127.6, ZC, 1, 0, 10.2, 3.0, 0, 0.45, 3);
    for (const s2 of [-1, 1]) {
      b.boxMM(
        "granite",
        127.4,
        0,
        s2 < 0 ? ZC - 5.7 : ZC + 5.1,
        130.6,
        0.75,
        s2 < 0 ? ZC - 5.1 : ZC + 5.7,
        { tint: 0x8a867c, grime: 0.6 },
      );
      K.colBox(
        127.4,
        0,
        s2 < 0 ? ZC - 5.7 : ZC + 5.1,
        130.6,
        0.75,
        s2 < 0 ? ZC - 5.1 : ZC + 5.7,
        { surface: "concrete" },
      );
    }
    b.boxMM(M, 130.6, 0, ZC - 3.4, 133.4, 0.45, ZC + 3.4, {
      tint: 0xc4bcaa,
      grime: 0.5,
    });
    b.boxMM(M, 130.55, 0.4, ZC - 3.4, 130.75, 0.462, ZC + 3.4, {
      tint: 0xf4efe2,
      grime: 0.12,
    });
    for (let k = 0; k < 9; k++) {
      const cz = ZC - 2.8 + k * 0.7 + (k % 2) * 0.12,
        cx = 130.9 + (k % 3) * 0.18;
      d.cyl("lit_warm", cx, 0.45, cz, 0.035, 0.035, 0.1 + (k % 3) * 0.05, 6, {
        tint: 0xffc070,
      });
      if (k % 3 === 1) glows.add(cx, 0.62 + (k % 3) * 0.05, cz, 0xffb050, "s");
    }
    K.colBox(130.6, 0, ZC - 3.4, 133.4, 0.45, ZC + 3.4, {
      surface: "concrete",
    });
    b.boxMM("granite", 133.4, 0, ZC - 1.9, 133.9, 0.24, ZC + 1.9, {
      tint: 0x9a968c,
      grime: 0.5,
    });
    K.colBox(133.4, 0, ZC - 1.9, 133.9, 0.24, ZC + 1.9, {
      surface: "concrete",
    });

    // ---- narthex ceiling + interior (pews, altar, the Sacrament warhead, anchors): 80_st_patricks_interior.js ----
    K.interior("st_patricks", ctx);

    // ---- outside dressing ----
    P.rubblePile(d, 186, -352, 2.5, 1.2, { seed: 91 });
    P.barrel(d, 128.5, 0, -347, "hazard", { glows: green, collide: true });
    P.barrel(d, 128.5, 0, -336, "hazard", { glows: green, collide: true });
    G.world.addRadSource({
      x: 128.5,
      y: 0.8,
      z: -347,
      radius: 2,
      strength: 0.4,
    });
    for (const lp of [
      [129, -354],
      [129, -329],
    ])
      P.lampPost(d, green, lp[0], lp[1], 4.5, { color: 0xffc060 });

    // ---- THE KINDLING GARDEN (main story, mq18): the Glowkeepers' yard of "old names" on the north side, between the
    // north transept and the apse. Each stone is a name laid down when its owner took the Light (the Rule of the Kindling:
    // "the old name is laid beneath a stone") — they read like graves; the ground under them was never dug.
    {
      const KG = { x0: 169.2, x1: 183.4, z0: -358.4, z1: -352.2 };
      const kcx = (KG.x0 + KG.x1) / 2,
        kcz = (KG.z0 + KG.z1) / 2;
      // gravel bed with a dead-grass margin, a low iron fence with a gate on the west (from the transept path)
      b.boxMM("dirt", KG.x0, -0.05, KG.z0, KG.x1, 0.03, KG.z1, {
        faces: "t",
        tint: 0x8a8274,
        grime: 0.6,
      });
      b.boxMM(
        "grass",
        KG.x0 + 0.3,
        0.031,
        KG.z0 + 0.3,
        KG.x1 - 0.3,
        0.035,
        KG.z0 + 0.9,
        { faces: "t", tint: 0x8a8460, grime: 0.7 },
      );
      const fence = (ax, az, bx, bz) => {
        d.beam("black_metal", ax, 0.85, az, bx, 0.85, bz, 0.04);
        d.beam("black_metal", ax, 0.15, az, bx, 0.15, bz, 0.04);
        const n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / 0.25));
        for (let k = 0; k <= n; k++) {
          const t = k / n,
            px = ax + (bx - ax) * t,
            pz = az + (bz - az) * t;
          d.beam(
            "black_metal",
            px,
            0,
            pz,
            px,
            0.98 + (k % 2) * 0.06,
            pz,
            0.025,
          );
        }
        K.colRot(
          (ax + bx) / 2,
          (az + bz) / 2,
          Math.hypot(bx - ax, bz - az),
          0.1,
          0,
          1.0,
          -Math.atan2(bz - az, bx - ax),
          { walkable: false },
        );
      };
      fence(KG.x0, KG.z0, KG.x1, KG.z0); // street side (north)
      fence(KG.x1, KG.z0, KG.x1, KG.z1); // apse side (east)
      fence(KG.x0, KG.z1, KG.x1 - 2.2, KG.z1); // church side (south), a gap at the east end
      fence(KG.x0, KG.z0, KG.x0, kcz - 0.9);
      fence(KG.x0, kcz + 0.9, KG.x0, KG.z1); // west, with the gate gap
      for (const gz of [kcz - 0.9, kcz + 0.9]) {
        d.box("granite", KG.x0, 0, gz, 0.3, 1.3, 0.3, { grime: 0.5 });
        d.geo("lit_warm", K.T.sphereLo, {
          x: KG.x0,
          y: 1.42,
          z: gz,
          s: 0.13,
          tint: 0xffc070,
        });
        glows.add(KG.x0, 1.42, gz, 0xffb040, "s");
      }
      // the gate board
      const brd = K.storyPaints.kg_board();
      d.beam(
        "wood_dark",
        KG.x0 - 0.6,
        0,
        kcz + 1.4,
        KG.x0 - 0.6,
        1.9,
        kcz + 1.4,
        0.07,
      );
      d.panel(
        "storyp",
        KG.x0 - 0.62,
        1.55,
        kcz + 1.4,
        0.96,
        0.64,
        -Math.PI / 2,
        { rect: brd, both: true },
      );
      // the stones: rows of small upright granite slabs, inscribed (one rect per distinct name; the rest weathered blank)
      const NAMES = [
        [
          "the_eleven",
          ["THE ELEVEN", "5 · III · 1968", "THE SUN DOES NOT CHOOSE"],
          41,
        ],
        ["dunne", ["MARGARET DUNNE", "KINDLED 1969"], 42],
        ["vaccaro", ["THEO VACCARO", "KINDLED 1970"], 43],
        ["fenwick", ["LUCILLE FENWICK", "KINDLED 1972"], 44],
        ["ortega", ["SAMUEL ORTEGA", "KINDLED 1974"], 45],
        ["przybylski", ["HELEN PRZYBYLSKI", "KINDLED 1978"], 46],
        ["grimes", ["WALTER GRIMES", "KINDLED 1981"], 47],
        ["nameless", ["A NAME", "SHE WOULD NOT SAY", "KINDLED 1985"], 48],
      ].map((n) => K.storyPaints.kg_stone(n[0], n[1], n[2]));
      const nicoleR = K.storyPaints.kg_stone(
        "nicole",
        ["NICOLE MEAD", "KINDLED", "5 · III · 1968"],
        49,
      );
      const blankR = K.storyPaints.kg_stone("blank", ["", ""], 50);
      const rs = K.rng(1968);
      let ni = 0,
        stoneN = null;
      for (let row = 0; row < 3; row++)
        for (let col = 0; col < 9; col++) {
          const sx = KG.x0 + 1.4 + col * 1.45 + (row % 2) * 0.35,
            sz = KG.z0 + 1.55 + row * 1.6;
          if (sx > KG.x1 - 0.8) continue;
          const isNicole = row === 1 && col === 4;
          const w = 0.5 + rs() * 0.12,
            h = 0.55 + rs() * 0.2,
            yaw = (rs() - 0.5) * 0.12;
          d.box("granite", sx, 0, sz, w, h, 0.13, {
            yaw,
            grime: 0.55 + rs() * 0.3,
            tint: isNicole ? 0x9a968c : 0x8a867c,
          });
          const rect = isNicole
            ? nicoleR
            : rs() < 0.55 && ni < NAMES.length
              ? NAMES[ni++]
              : blankR;
          d.panel(
            "storyp",
            sx + Math.sin(yaw) * 0.068,
            h * 0.55,
            sz + Math.cos(yaw) * 0.068,
            w * 0.9,
            h * 0.6,
            yaw,
            { rect },
          );
          K.colBox(sx - w / 2, 0, sz - 0.08, sx + w / 2, h, sz + 0.08, {
            surface: "concrete",
          });
          // candle stubs in front of some stones (and always before hers: somebody keeps it lit)
          if (isNicole || rs() < 0.35) {
            const cz = sz + 0.28,
              cx = sx + (rs() - 0.5) * 0.2;
            d.cyl(
              "bone",
              cx,
              0.03,
              cz,
              0.045,
              0.035,
              isNicole ? 0.16 : 0.06 + rs() * 0.06,
              8,
              { grime: 0.3 },
            );
            if (isNicole) {
              d.cyl("bone", cx + 0.12, 0.03, cz + 0.05, 0.04, 0.032, 0.09, 8, {
                grime: 0.3,
              });
              glows.add(cx, 0.24, cz, 0xffb050, "s");
            }
          }
          if (isNicole) stoneN = { x: sx, z: sz, yaw };
        }
      if (stoneN) {
        rec.anchor("kindling_stone", stoneN.x, 0, stoneN.z + 0.75, 0); // stand here, facing the stone (north)
        rec.anchor("kindling_stone_base", stoneN.x, 0, stoneN.z + 0.3, 0);
      }
      rec.anchor("kindling_garden", KG.x0 - 1.4, 0, kcz, -Math.PI / 2); // outside the gate, facing in (east)
      rec.anchor("kindling_garden_in", KG.x0 + 0.9, 0, kcz, -Math.PI / 2);
    }

    // ---- anchors ----
    rec.anchor("entrance", 127, 0, ZC, Math.PI / 2);
    rec.anchor("portal", 134, 0, ZC, Math.PI / 2);
    rec.anchor("guard1", 130, 0, ZC - 4, Math.PI / 2);
    rec.anchor("guard2", 130, 0, ZC + 4, Math.PI / 2);
    rec.anchor("rose_window", 131, 17.5, ZC, Math.PI / 2);
    rec.anchor("spire", 136.5, 75, -351.75, 0);

    b.finish(rec.root);
    d.finish(rec.root, { lod: 260 });
    glows.finish(rec.root, { dayOpacity: 0.55, nightOpacity: 1 });
    green.finish(rec.root, { dayOpacity: 0.6, nightOpacity: 1, flicker: 0.15 });
    const st = K.mat("stained"),
      rm = K.mat("rose");
    K.animate((dt, t, night) => {
      st.emissiveIntensity = 0.35 + 0.35 * night;
      rm.emissiveIntensity = 0.3 + 0.45 * night + 0.05 * Math.sin(t * 2);
    });
  }

