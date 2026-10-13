// play-inline-344 03 — tint
// Lines 340-1984 of readable/play-inline-344.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "pd_ext", grime: 0.55, seg: 4 });
    const r = K.rng("pd_ext");

    // ---------- walls (faces per band) ----------
    const band = (mat, ax, az, ux, uz, len, y0, y1, tint) =>
      b.face(mat, ax, y0, az, ux, 0, uz, 0, 1, 0, len, y1 - y0, { tint });
    const wallBands = (ax, az, ux, uz, len) => {
      band("granite", ax, az, ux, uz, len, 0, 1.2, [0.55, 0.53, 0.5]);
      band("rustic", ax, az, ux, uz, len, 1.2, G1, RUST_T);
      band("limestone", ax, az, ux, uz, len, G1, ROOF, LIME);
    };
    // front wings (z = ZW, facing +z): face U axis must be +x for a +z normal
    wallBands(X0, ZW, 1, 0, PX0 - X0);
    wallBands(PX1, ZW, 1, 0, X1 - PX1);
    // west (x = X0, facing −x — the Centre Street prow): U = +z
    wallBands(X0, ZBW, 0, 1, ZW - ZBW);
    // east (x = X1, facing +x): U = −z
    wallBands(X1, ZW, 0, -1, ZW - ZB);
    // back: the slanted wedge wall from (X1, ZB) to (X0, ZBW), facing north-north-west
    wallBands(X1, ZB, BU[0], BU[1], BL);
    // roof (trapezoid)
    b.quadGrid(
      "concrete_dark",
      [X0, ROOF, ZW],
      [X1, ROOF, ZW],
      [X1, ROOF, ZB],
      [X0, ROOF, ZBW],
      { uv: "top", tint: [0.45, 0.43, 0.4], seg: 6 },
    );
    // plinth ledge + ground-floor string course + main cornice + attic cornice (all four sides)
    const ring = (y, h, out, mat, tint) => {
      b.boxMM(mat, X0 - out, y, ZW - 0.1, PX0, y + h, ZW + out, { tint });
      b.boxMM(mat, PX1, y, ZW - 0.1, X1 + out, y + h, ZW + out, { tint });
      b.box(
        mat,
        (X0 + X1) / 2 + BN[0] * (out / 2 - 0.05),
        y,
        (ZB + ZBW) / 2 + BN[1] * (out / 2 - 0.05),
        BL + out * 2,
        h,
        out + 0.1,
        { tint, yaw: BYAW },
      );
      b.boxMM(mat, X0 - out, y, ZBW - out, X0 + 0.1, y + h, ZW + out, { tint });
      b.boxMM(mat, X1 - 0.1, y, ZB, X1 + out, y + h, ZW + out, { tint });
    };
    ring(1.05, 0.25, 0.25, "granite", [0.5, 0.48, 0.45]);
    ring(G1 - 0.35, 0.45, 0.3, "limestone", LIME_D);
    ring(G2 - 0.1, 0.35, 0.35, "limestone", LIME);
    ring(G2 + 0.25, 0.5, 0.65, "limestone", LIME_D); // big modillion cornice
    for (let x = X0 + 0.6; x < X1; x += 0.9) {
      if (x > PX0 - 0.4 && x < PX1 + 0.4) continue;
      b.box("limestone", x, G2 + 0.1, ZW + 0.3, 0.22, 0.18, 0.5, {
        tint: LIME_D,
      });
    }
    for (let z = ZBW + 0.6; z < ZW; z += 0.9)
      b.box("limestone", X0 - 0.3, G2 + 0.1, z, 0.5, 0.18, 0.22, {
        tint: LIME_D,
      }); // modillions on the Centre St front
    ring(ROOF - 0.3, 0.3, 0.2, "limestone", LIME_D);
    // colliders: block minus the loggia recess
    b.col(X0, 0, ZBW, X1, ROOF, LZ, { tag: "building" });
    // the wedge: an oriented slab along the slanted wall + stepped fill of the triangle behind it
    b.ocol(
      (X0 + X1) / 2 - BN[0] * 0.6,
      (ZB + ZBW) / 2 - BN[1] * 0.6,
      BL,
      1.2,
      0,
      ROOF,
      BYAW,
      { tag: "building" },
    );
    for (let x = X0; x < X1 - 0.01; x += 3)
      b.col(x, 0, zb(x) - 0.05, Math.min(X1, x + 3), ROOF, ZBW, {
        tag: "building",
      });
    b.col(X0, 0, LZ, LX0, ROOF, ZW, { tag: "building" });
    b.col(LX1, 0, LZ, X1, ROOF, ZW, { tag: "building" });
    b.col(LX0, G1, LZ, LX1, ROOF, ZW, { tag: "building" });

    // ---------- façades ----------
    const fb = (a, bb, n) => {
      const out = [];
      for (let i = 0; i < n; i++) out.push(a + ((bb - a) * (i + 0.5)) / n);
      return out;
    };
    facade(
      b,
      { axis: "x", line: ZW, n: [0, 1], bays: fb(X0, PX0, 4), pedHoods: true },
      r,
    );
    facade(
      b,
      { axis: "x", line: ZW, n: [0, 1], bays: fb(PX1, X1, 4), pedHoods: true },
      r,
    );
    facade(
      b,
      { axis: "z", line: X0, n: [-1, 0], bays: fb(ZBW, ZW, 4), pedHoods: true },
      r,
    );
    facade(b, { axis: "z", line: X1, n: [1, 0], bays: fb(ZB, ZW, 6) }, r);
    facade(b, { seg: [X1, ZB, X0, ZBW], n: BN, bays: fb(0, 1, 12) }, r);

    // ---------- central pavilion ----------
    // side cheeks (x = PX0 / PX1, from ZW to ZF) and upper wall (behind the colonnade, z = ZW)
    for (const [x, n] of [
      [PX0, -1],
      [PX1, 1],
    ]) {
      const ux = 0,
        uz = n < 0 ? 1 : -1,
        ax = x,
        az = n < 0 ? ZW : ZF;
      b.face("rustic", ax, 0, az, ux, 0, uz, 0, 1, 0, ZF - ZW, G1, {
        tint: RUST_T,
      });
      b.face(
        "limestone",
        ax,
        G1,
        az,
        ux,
        0,
        uz,
        0,
        1,
        0,
        ZF - ZW,
        ROOF + 2.2 - G1,
        { tint: LIME },
      );
    }
    b.face(
      "limestone",
      PX0,
      G1,
      ZW,
      1,
      0,
      0,
      0,
      1,
      0,
      PX1 - PX0,
      ROOF + 2.2 - G1,
      { tint: LIME },
    ); // upper wall behind the colonnade
    b.col(PX0, 0, ZW, LX0, G1, ZF, { tag: "building" });
    b.col(LX1, 0, ZW, PX1, G1, ZF, { tag: "building" });
    // front of the pavilion outside the loggia (x PX0..LX0, LX1..PX1) at z = ZF
    for (const [a0, a1] of [
      [PX0, LX0],
      [LX1, PX1],
    ]) {
      b.face("granite", a0, 0, ZF, 1, 0, 0, 0, 1, 0, a1 - a0, 1.2, {
        tint: [0.55, 0.53, 0.5],
      });
      b.face("rustic", a0, 1.2, ZF, 1, 0, 0, 0, 1, 0, a1 - a0, G1 - 1.2, {
        tint: RUST_T,
      });
      K.archWin(b, (a0 + a1) / 2, 2.4, ZF, 0, 1, 1.5, 3.6, {
        state: "boarded",
        surround: "limestone",
        surroundTint: LIME,
        inset: 0.2,
      });
      K.window(b, (a0 + a1) / 2, 11, ZW, 0, 1, 1.5, 3.4, {
        state: "broken",
        surround: "limestone",
        surroundTint: LIME_D,
        lintel: 0.3,
        inset: 0.2,
      });
    }
    // loggia: three arches in the rusticated front
    const nA = 3,
      pier = 1.3,
      aw = (LX1 - LX0 - pier * (nA + 1)) / nA,
      spring = LY + 3.4;
    for (let i = 0; i <= nA; i++) {
      const px = LX0 + i * (pier + aw);
      b.boxMM("rustic", px, 0, LZ, px + pier, G1, ZF, { tint: RUST_T });
      b.boxMM(
        "granite",
        px - 0.05,
        0,
        ZF - 0.05,
        px + pier + 0.05,
        LY + 0.4,
        ZF + 0.15,
        { tint: [0.5, 0.48, 0.45] },
      );
      b.boxMM(
        "limestone",
        px - 0.1,
        spring - 0.3,
        LZ + 0.4,
        px + pier + 0.1,
        spring,
        ZF + 0.12,
        { tint: LIME_D },
      ); // impost
      b.col(px, 0, LZ, px + pier, G1, ZF, { tag: "building" });
    }
    for (let i = 0; i < nA; i++) {
      const cx = LX0 + pier + aw / 2 + i * (pier + aw);
      b.geo("rustic", spandrelGeo(aw, G1 - spring), {
        x: cx,
        y: spring,
        z: ZF,
        tint: RUST_T,
      });
      b.geo("rustic", spandrelGeo(aw, G1 - spring), {
        x: cx,
        y: spring,
        z: LZ + 0.6,
        ry: PI,
        tint: [0.6, 0.57, 0.52],
      });
      // barrel soffit of the arch (voussoir ring + keystone with a lion mask)
      for (let k = 0; k <= 10; k++) {
        const a = (k / 10) * PI,
          px = cx + Math.cos(a) * (aw / 2),
          py = spring + Math.sin(a) * (aw / 2);
        b.box("limestone", px, py - 0.18, ZF - 0.5, 0.42, 0.36, 1.2, {
          tint: k === 5 ? LIME : LIME_D,
          yaw: 0,
        });
      }
      b.box("limestone", cx, spring + aw / 2 - 0.1, ZF + 0.05, 0.6, 0.8, 0.3, {
        tint: LIME,
      });
      b.geo("bronze", K.sphereGeo(), {
        x: cx,
        y: spring + aw / 2 + 0.2,
        z: ZF + 0.22,
        sx: 0.2,
        sy: 0.22,
        sz: 0.1,
        tint: [0.4, 0.34, 0.24],
      });
    }
    // loggia interior: floor, ceiling (coffered), back wall with the doors
    b.face(
      "marble",
      LX0,
      LY,
      ZF - 2.6 + 0.001,
      1,
      0,
      0,
      0,
      0,
      -1,
      LX1 - LX0,
      ZF - 2.6 - LZ,
      { uv: "top", tint: [0.7, 0.66, 0.6] },
    );
    b.col(LX0, 0, LZ, LX1, LY, ZF - 2.6, { tag: "floor", surface: "concrete" });
    b.face("coffer", LX0, G1 - 0.3, LZ, 1, 0, 0, 0, 0, 1, LX1 - LX0, ZF - LZ, {
      uv: "top",
      tint: [0.72, 0.68, 0.6],
    });
    b.face("rustic", LX0, LY, LZ, 1, 0, 0, 0, 1, 0, LX1 - LX0, G1 - LY, {
      tint: [0.7, 0.66, 0.6],
    });
    K.stairs(b, LX0 + 0.05, ZF - 2.6, LX1 - 0.05, ZF, 0.12, LY, "-z", {
      mat: "granite",
      tint: [0.6, 0.58, 0.55],
      grime: 0.5,
    });
    // main doors (bronze, with transom grille) — the interior link is a teleport door (11_police_interior.js)
    b.boxMM("limestone", 157.4, LY, LZ, 162.6, LY + 5.0, LZ + 0.25, {
      tint: LIME,
    });
    // round 2: a readable glazed bronze pair + grilled transom, the rotunda's light behind the glass, and
    // two wall lamps on emergency power, so the one working door in the loggia reads from Worth Street
    K.doorway(b, 160, LY, LZ + 0.25, 0, 1, {
      w: 3.0,
      h: 3.5,
      transom: 0.85,
      mat: "bronze",
      frame: "granite",
      frameTint: [0.66, 0.64, 0.6],
      frameW: 0.24,
      glow: [0.95, 0.85, 0.65],
      glowI: 0.4,
      lamps: true,
      lampCol: [1, 0.82, 0.55],
    });
    b.col(157.4, LY, LZ, 162.6, LY + 5.0, LZ + 0.25, { tag: "building" });
    b.plate("art", 160, LY + 5.4, LZ + 0.27, 0, 1, 2.2, 0.9, plaque());
    // side (blind) doors
    for (const dx of [-5, 5]) {
      b.boxMM(
        "wood_dark",
        160 + dx - 0.9,
        LY,
        LZ + 0.02,
        160 + dx + 0.9,
        LY + 3.2,
        LZ + 0.12,
        { tint: [0.35, 0.25, 0.18] },
      );
      for (let k = 0; k < 3; k++)
        b.beam(
          "wood_rotten",
          160 + dx - 1.1,
          LY + 0.8 + k * 0.9,
          LZ + 0.16,
          160 + dx + 1.1,
          LY + 1.0 + k * 0.85,
          LZ + 0.16,
          0.22,
          0.04,
          { tint: [0.6, 0.5, 0.4] },
        );
    }
    // hanging lanterns in the arches (one still glowing on emergency power)
    for (let i = 0; i < nA; i++) {
      const cx = LX0 + pier + aw / 2 + i * (pier + aw);
      K.lamp(b, cx, G1 - 1.4, ZF - 1.4, "cage", [1, 0.7, 0.35], 0, 0, {
        ceil: G1 - 0.3,
        dead: i !== 1,
        glowSize: 1.2,
      });
      b.pipe(
        "black_iron",
        cx,
        G1 - 1.3,
        ZF - 1.4,
        cx,
        G1 - 0.3,
        ZF - 1.4,
        0.02,
        4,
      );
    }

    // ---------- red curfew warning lamps on the loggia piers (pools of red light at night) ----------
    for (const lx of [LX0 + 0.65, LX1 - 0.65]) {
      b.box("metal_dark", lx, G1 - 1.9, ZF + 0.1, 0.34, 0.12, 0.3, {
        tint: [0.25, 0.25, 0.25],
      });
      b.geo("lamp", K.sphereGeo(), {
        x: lx,
        y: G1 - 1.66,
        z: ZF + 0.18,
        sx: 0.16,
        sy: 0.2,
        sz: 0.16,
        tint: [1, 0.12, 0.08],
      });
      b.glow(lx, G1 - 1.66, ZF + 0.55, [1, 0.12, 0.06], 1.3);
    }
    // ---------- Patrolman charging pods flanking the doors ----------
    for (const px of [154.2, 165.8])
      patrolmanPod(b, px, LY, LZ + 0.9, px < 160 ? 0.25 : -0.25, px < 160);

    // ---------- colonnade, frieze, pediment ----------
    const colZ = ZF - 0.6;
    b.boxMM("limestone", PX0, G1, ZW, PX1, G1 + 0.35, ZF + 0.15, {
      tint: LIME_D,
    }); // balcony slab on the loggia
    b.face(
      "concrete_dark",
      PX0,
      G1 + 0.36,
      ZF,
      1,
      0,
      0,
      0,
      0,
      -1,
      PX1 - PX0,
      ZF - ZW,
      { uv: "top", tint: [0.5, 0.48, 0.45] },
    );
    b.col(PX0, G1, ZW, PX1, G1 + 0.35, ZF, { tag: "roof" });
    K.balustrade(b, PX0 + 0.3, ZF - 0.1, PX1 - 0.3, ZF - 0.1, G1 + 0.35, {
      h: 0.95,
      ped: 3,
      tint: LIME,
      col: false,
    });
    for (let i = 0; i < 6; i++)
      K.column(b, 150.5 + i * 3.8, G1 + 0.35, colZ, G2 - G1 - 0.35, 0.46, {
        tint: LIME,
        capTint: LIME_D,
        fluted: true,
      });
    // piano-nobile windows between the columns
    for (let i = 0; i < 5; i++) {
      const x = 152.4 + i * 3.8;
      K.window(b, x, 10.4, ZW, 0, 1, 1.6, 3.2, {
        state: i === 2 ? "dark" : r() < 0.5 ? "broken" : "glass",
        surround: "limestone",
        surroundTint: LIME_D,
        lintel: 0.3,
        inset: 0.2,
      });
      K.window(b, x, 14.5, ZW, 0, 1, 1.5, 2.2, {
        state: r() < 0.5 ? "broken" : "dark",
        surround: "limestone",
        surroundTint: LIME_D,
        inset: 0.2,
      });
    }
    // entablature
    b.boxMM(
      "limestone",
      PX0 - 0.3,
      G2,
      ZW - 0.1,
      PX1 + 0.3,
      G2 + 0.5,
      ZF + 0.1,
      { tint: LIME_D },
    ); // architrave
    b.boxMM(
      "limestone",
      PX0 - 0.3,
      G2 + 0.5,
      ZW - 0.1,
      PX1 + 0.3,
      G2 + 1.5,
      ZF,
      { tint: LIME },
    ); // frieze
    b.plate("art", 160, G2 + 1.0, ZF + 0.01, 0, 1, 18, 0.8, frieze());
    b.boxMM(
      "limestone",
      PX0 - 0.6,
      G2 + 1.5,
      ZW - 0.1,
      PX1 + 0.6,
      G2 + 1.9,
      ZF + 0.5,
      { tint: LIME_D },
    ); // cornice
    for (let x = PX0 - 0.3; x <= PX1 + 0.3; x += 0.8)
      b.box("limestone", x, G2 + 1.35, ZF + 0.25, 0.2, 0.18, 0.45, {
        tint: LIME_D,
      });
    K.pediment(
      b,
      160,
      G2 + 1.9,
      ZW,
      PX1 - PX0 + 1.0,
      4.4,
      0,
      1,
      ZF - ZW + 0.4,
      { tint: LIME, tympanum: tympanum(), roof: "lead" },
    );
    b.col(PX0, G2, ZW, PX1, G2 + 1.9, ZF + 0.5, { tag: "building" });
    // pavilion attic behind the pediment
    b.boxMM("limestone", PX0, ROOF, ZW - 6, PX1, ROOF + 2.2, ZW, {
      tint: LIME,
      faces: "nsewt",
    });
    // tattered flag on the pediment apex
    b.pipe(
      "black_iron",
      160,
      G2 + 6.2,
      ZF - 0.2,
      160,
      G2 + 12.5,
      ZF - 0.2,
      0.06,
      6,
    );
    b.geo("gold", K.sphereGeo(), {
      x: 160,
      y: G2 + 12.6,
      z: ZF - 0.2,
      s: 0.14,
    });
    b.quad(
      "fabric",
      [160.05, G2 + 12.3, ZF - 0.2],
      [163.6, G2 + 11.9, ZF - 0.05],
      [163.3, G2 + 10.4, ZF],
      [160.05, G2 + 10.6, ZF - 0.2],
      { tint: [0.7, 0.35, 0.3] },
    );
    b.quad(
      "fabric",
      [163.6, G2 + 11.9, ZF - 0.05],
      [160.05, G2 + 12.3, ZF - 0.2],
      [160.05, G2 + 10.6, ZF - 0.2],
      [163.3, G2 + 10.4, ZF],
      { tint: [0.55, 0.3, 0.26] },
    );
    b.hplate("decal", 161.4, G2 + 11.8, ZF - 0.12, 0.9, 0.7, 0, null, {
      tint: [0.2, 0.25, 0.5],
    });

    // ---------- CURFEW banner between the middle columns + PA horns ----------
    b.plate("art", 160, 13.2, colZ + 0.52, 0, 1, 3.0, 3.6, banner(), {
      tint: [0.95, 0.9, 0.85],
    });
    b.pipe(
      "black_iron",
      158.3,
      15.1,
      colZ + 0.5,
      161.7,
      15.1,
      colZ + 0.5,
      0.03,
      4,
    );
    for (const hx of [PX0 + 0.6, PX1 - 0.6]) {
      b.pipe(
        "black_iron",
        hx,
        G1 + 4,
        ZF - 0.2,
        hx,
        G1 + 6.2,
        ZF - 0.2,
        0.05,
        5,
      );
      for (const a of [-0.5, 0.5]) {
        const dx = Math.sin(a) * 0.9,
          dz = Math.cos(a) * 0.9;
        b.geo(
          "metal_dark",
          new THREE.CylinderGeometry(0.34, 0.07, 0.9, 10, 1, true),
          {
            x: hx + dx * 0.5,
            y: G1 + 6.0,
            z: ZF - 0.2 + dz * 0.5,
            rx: HP,
            ry: a,
            tint: [0.45, 0.45, 0.42],
          },
        );
      }
    }

    // ---------- corner pavilions (raised attics, balustrades, urns, searchlights) ----------
    const CP = 8.6;
    for (const [cx0, cz0] of [
      [X1 - CP, ZW - CP],
      [X1 - CP, ZB],
    ]) {
      b.boxMM("limestone", cx0, ROOF, cz0, cx0 + CP, ROOF + 2.4, cz0 + CP, {
        tint: LIME,
      });
      b.boxMM(
        "limestone",
        cx0 - 0.3,
        ROOF + 2.4,
        cz0 - 0.3,
        cx0 + CP + 0.3,
        ROOF + 2.8,
        cz0 + CP + 0.3,
        { tint: LIME_D },
      );
      K.balustrade(
        b,
        cx0 + 0.3,
        cz0 + 0.3,
        cx0 + CP - 0.3,
        cz0 + 0.3,
        ROOF + 2.8,
        { h: 0.9, ped: 0, col: false, tint: LIME },
      );
      K.balustrade(
        b,
        cx0 + 0.3,
        cz0 + CP - 0.3,
        cx0 + CP - 0.3,
        cz0 + CP - 0.3,
        ROOF + 2.8,
        { h: 0.9, ped: 0, col: false, tint: LIME },
      );
      for (const [ux, uz] of [
        [0.4, 0.4],
        [CP - 0.4, 0.4],
        [0.4, CP - 0.4],
        [CP - 0.4, CP - 0.4],
      ])
        K.urn(b, cx0 + ux, ROOF + 3.7, cz0 + uz, 1.2, { tint: LIME_D });
      // oculus on the attic front
      const front = cz0 > 560;
      b.geo("paint_black", new THREE.CircleGeometry(0.6, 12), {
        x: cx0 + CP / 2,
        y: ROOF + 1.2,
        z: front ? cz0 + CP + 0.01 : cz0 - 0.01,
        ry: front ? 0 : PI,
        tint: [0.05, 0.05, 0.05],
      });
      b.geo("limestone", new THREE.TorusGeometry(0.7, 0.12, 5, 14), {
        x: cx0 + CP / 2,
        y: ROOF + 1.2,
        z: front ? cz0 + CP + 0.05 : cz0 - 0.05,
        tint: LIME_D,
      });
      // searchlight
      const sx = cx0 + CP / 2,
        sz = cz0 + CP / 2,
        sy = ROOF + 2.8;
      b.cyl("metal_dark", sx, sy, sz, 0.35, 0.45, 0.5, 8, {
        tint: [0.3, 0.3, 0.3],
      });
      for (const s of [-1, 1])
        b.beam(
          "metal_dark",
          sx + s * 0.5,
          sy + 0.5,
          sz,
          sx + s * 0.5,
          sy + 1.4,
          sz,
          0.08,
          0.08,
          { tint: [0.3, 0.3, 0.3] },
        );
      b.geo(
        "metal",
        new THREE.CylinderGeometry(0.62, 0.55, 0.9, 12, 1, false),
        {
          x: sx,
          y: sy + 1.3,
          z: sz,
          rx: HP - 0.35,
          ry: front ? 0 : PI,
          tint: [0.42, 0.42, 0.4],
        },
      );
      b.geo("glass", new THREE.CircleGeometry(0.58, 12), {
        x: sx,
        y: sy + 1.46,
        z: sz + (front ? 0.43 : -0.43),
        rx: -0.35 * (front ? 1 : -1),
        ry: front ? 0 : PI,
        tint: [0.6, 0.62, 0.55],
      });
      b.glow(sx, sy + 1.5, sz + (front ? 0.5 : -0.5), [1, 0.95, 0.8], 1.8); // the lamp still burns (night landmark)
    }
    // roof balustrade along the front wings and the sides
    K.balustrade(b, X0 + CP, ZW - 0.3, PX0, ZW - 0.3, ROOF, {
      h: 0.95,
      ped: 4.4,
      col: false,
      tint: LIME,
    });
    K.balustrade(b, PX1, ZW - 0.3, X1 - CP, ZW - 0.3, ROOF, {
      h: 0.95,
      ped: 4.4,
      col: false,
      tint: LIME,
    });
    K.balustrade(b, X1 - 0.3, ZB + CP, X1 - 0.3, ZW - CP, ROOF, {
      h: 0.95,
      ped: 4,
      col: false,
      tint: LIME,
    });
    {
      // parapet along the slanted back wall, between the prow pavilion and the NE pavilion
      const xa = X0 + CP,
        xb = X1 - CP,
        len = ((xb - xa) * BL) / (X1 - X0),
        xm = (xa + xb) / 2;
      b.box(
        "limestone",
        xm - BN[0] * 0.2,
        ROOF,
        zb(xm) - BN[1] * 0.2,
        len,
        1.0,
        0.4,
        { tint: LIME_D, yaw: BYAW },
      );
    }

    // ---------- the Centre Street PROW PAVILION: attic storey, clock aedicule, low verdigris dome ----------
    {
      const x0 = X0,
        x1 = X0 + CP,
        z0 = ZBW,
        z1 = ZW,
        cz = (z0 + z1) / 2,
        cx = (x0 + x1) / 2,
        AT = ROOF + 3.4;
      b.boxMM("limestone", x0, ROOF, z0, x1, AT, z1, { tint: LIME });
      b.boxMM(
        "limestone",
        x0 - 0.35,
        AT,
        z0 - 0.35,
        x1 + 0.35,
        AT + 0.45,
        z1 + 0.35,
        { tint: LIME_D },
      );
      for (let z = z0 + 0.4; z < z1 - 0.2; z += 0.8)
        b.box("limestone", x0 - 0.22, AT - 0.2, z, 0.4, 0.18, 0.2, {
          tint: LIME_D,
        }); // modillions
      // oculi on the north & south faces of the attic
      for (const [z, n] of [
        [z0 - 0.01, -1],
        [z1 + 0.01, 1],
      ]) {
        b.geo("paint_black", new THREE.CircleGeometry(0.7, 14), {
          x: cx,
          y: ROOF + 1.7,
          z,
          ry: n > 0 ? 0 : PI,
          tint: [0.05, 0.05, 0.05],
        });
        b.geo("limestone", new THREE.TorusGeometry(0.82, 0.14, 5, 16), {
          x: cx,
          y: ROOF + 1.7,
          z: z + n * 0.04,
          tint: LIME_D,
        });
      }
      // clock aedicule on the Centre Street face: paired pilasters, a broken segmental pediment, the clock (stopped at 9:47)
      for (const dz of [-3.1, -2.3, 2.3, 3.1])
        b.box("limestone", x0 - 0.2, ROOF, cz + dz, 0.4, AT - ROOF, 0.5, {
          tint: LIME_D,
        });
      b.geo("limestone", new THREE.CylinderGeometry(1.75, 1.75, 0.3, 24), {
        x: x0 - 0.12,
        y: ROOF + 1.75,
        z: cz,
        rz: HP,
        tint: LIME_D,
      });
      b.plate("art", x0 - 0.3, ROOF + 1.75, cz, -1, 0, 3.0, 3.0, clockFace());
      for (const s of [-1, 1])
        b.quadN(
          "limestone",
          [x0 - 0.5, AT + 0.45, cz + s * 3.4],
          [x0 - 0.5, AT + 1.5, cz + s * 1.6],
          [x0 + 0.3, AT + 1.5, cz + s * 1.6],
          [x0 + 0.3, AT + 0.45, cz + s * 3.4],
          [-0.3, 1, 0],
          { tint: LIME },
        );
      b.box("limestone", x0 - 0.1, AT + 0.45, cz, 0.6, 1.5, 1.1, {
        tint: LIME,
      }); // cartouche in the broken pediment
      b.geo("gold", K.sphereGeo(), {
        x: x0 - 0.42,
        y: AT + 1.2,
        z: cz,
        sx: 0.08,
        sy: 0.4,
        sz: 0.34,
        tint: [0.7, 0.55, 0.28],
      });
      // corner urns
      for (const [ux, uz] of [
        [x0 + 0.4, z0 + 0.4],
        [x1 - 0.4, z0 + 0.4],
        [x0 + 0.4, z1 - 0.4],
        [x1 - 0.4, z1 - 0.4],
      ])
        K.urn(b, ux, AT + 0.45, uz, 1.25, { tint: LIME_D });
      // low dome on a short drum (the real building's end pavilions carry exactly this)
      const DY2 = AT + 0.45;
      b.cyl("limestone", cx, DY2, cz, 3.3, 3.3, 1.5, 28, {
        tint: LIME,
        top: false,
      });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * PI * 2 + PI / 8;
        K.archWin(
          b,
          cx + Math.cos(a) * 3.31,
          DY2 + 0.25,
          cz + Math.sin(a) * 3.31,
          Math.cos(a),
          Math.sin(a),
          0.6,
          1.0,
          {
            state: "dark",
            surround: "limestone",
            surroundTint: LIME_D,
            sill: false,
            inset: 0.08,
          },
        );
      }
      b.cyl("limestone", cx, DY2 + 1.5, cz, 3.6, 3.5, 0.35, 28, {
        tint: LIME_D,
      });
      K.dome(b, cx, DY2 + 1.85, cz, 3.45, 2.5, {
        mat: "patina",
        ribs: 8,
        ribMat: "patina",
        ribTint: [0.62, 0.8, 0.72],
        seg: 28,
        rows: 7,
      });
      b.cyl("limestone", cx, DY2 + 4.25, cz, 0.7, 0.7, 0.3, 12, {
        tint: LIME_D,
      });
      b.cyl("gold", cx, DY2 + 4.55, cz, 0.45, 0.2, 0.9, 10, {
        tint: [0.75, 0.58, 0.28],
      });
      b.geo("gold", K.sphereGeo(), {
        x: cx,
        y: DY2 + 5.6,
        z: cz,
        s: 0.22,
        tint: [0.85, 0.66, 0.3],
      });
      b.col(x0, ROOF, z0, x1, AT + 0.45, z1, { tag: "building" });
      // a small searchlight on the prow's dome base, sweeping Centre Street
      const sx = x1 - 0.9,
        sz = z0 + 1.0,
        sy = AT + 0.45;
      b.cyl("metal_dark", sx, sy, sz, 0.3, 0.38, 0.4, 8, {
        tint: [0.3, 0.3, 0.3],
      });
      b.geo(
        "metal",
        new THREE.CylinderGeometry(0.5, 0.45, 0.75, 12, 1, false),
        {
          x: sx,
          y: sy + 0.9,
          z: sz,
          rx: HP - 0.35,
          ry: -HP,
          tint: [0.42, 0.42, 0.4],
        },
      );
      b.glow(sx - 0.45, sy + 1.05, sz, [1, 0.95, 0.8], 1.6);
    }

    // ---------- THE DOME ----------
    const DY = ROOF;
    b.boxMM(
      "limestone",
      DC.x - 8.4,
      DY,
      DC.z - 8.4,
      DC.x + 8.4,
      DY + 3.6,
      DC.z + 8.4,
      { tint: LIME },
    ); // podium
    b.boxMM(
      "limestone",
      DC.x - 8.7,
      DY + 3.6,
      DC.z - 8.7,
      DC.x + 8.7,
      DY + 4.0,
      DC.z + 8.7,
      { tint: LIME_D },
    );
    const DR = 6.8,
      DRUM0 = DY + 4.0,
      DRUM1 = DRUM0 + 7.0;
    b.cyl("limestone", DC.x, DRUM0, DC.z, DR, DR, DRUM1 - DRUM0, 32, {
      tint: LIME,
      top: false,
    });
    b.cyl("limestone", DC.x, DRUM0, DC.z, DR + 1.25, DR + 1.25, 0.5, 32, {
      tint: LIME_D,
    }); // peristyle floor
    for (let k = 0; k < 16; k++) {
      // peristyle columns
      const a = (k / 16) * PI * 2 + PI / 16;
      K.column(
        b,
        DC.x + Math.cos(a) * (DR + 0.85),
        DRUM0 + 0.5,
        DC.z + Math.sin(a) * (DR + 0.85),
        DRUM1 - DRUM0 - 0.5,
        0.26,
        { tint: LIME, capTint: LIME_D, plinth: false, seg: 8 },
      );
    }
    b.cyl("limestone", DC.x, DRUM1, DC.z, DR + 1.3, DR + 1.3, 0.8, 32, {
      tint: LIME_D,
    }); // entablature ring
    b.cyl("limestone", DC.x, DRUM1 + 0.8, DC.z, DR + 1.5, DR + 0.6, 0.35, 32, {
      tint: LIME,
    });
    for (let k = 0; k < 8; k++) {
      // drum windows
      const a = (k / 8) * PI * 2,
        nx = Math.cos(a),
        nz = Math.sin(a);
      K.archWin(
        b,
        DC.x + nx * (DR + 0.02),
        DRUM0 + 1.4,
        DC.z + nz * (DR + 0.02),
        nx,
        nz,
        1.3,
        3.6,
        {
          state: k % 3 ? "dark" : "broken",
          surround: "limestone",
          surroundTint: LIME_D,
          sill: false,
          inset: 0.12,
        },
      );
    }
    b.cyl("limestone", DC.x, DRUM1 + 1.15, DC.z, DR + 0.3, DR, 0.9, 32, {
      tint: LIME_D,
    }); // attic ring
    const DOME0 = DRUM1 + 2.05;
    K.dome(b, DC.x, DOME0, DC.z, DR + 0.1, 6.4, {
      mat: "patina",
      ribs: 16,
      ribMat: "patina",
      ribTint: [0.62, 0.8, 0.72],
      seg: 32,
      rows: 10,
    });
    for (let k = 0; k < 4; k++) {
      // lucarnes
      const a = k * HP + PI / 4,
        nx = Math.cos(a),
        nz = Math.sin(a),
        rr = (DR + 0.1) * Math.cos(0.5),
        yy = DOME0 + 6.4 * Math.sin(0.5);
      b.box("patina", DC.x + nx * rr, yy - 0.2, DC.z + nz * rr, 1.1, 1.3, 1.1, {
        yaw: -a,
        tint: [0.7, 0.85, 0.78],
      });
      b.geo("paint_black", new THREE.CircleGeometry(0.34, 10), {
        x: DC.x + nx * (rr + 0.56),
        y: yy + 0.45,
        z: DC.z + nz * (rr + 0.56),
        ry: K.facing(nx, nz),
        tint: [0.05, 0.05, 0.05],
      });
    }
    // lantern
    const LT0 = DOME0 + 6.2;
    b.cyl("limestone", DC.x, LT0, DC.z, 1.7, 1.7, 0.4, 16, { tint: LIME_D });
    b.cyl("paint_black", DC.x, LT0 + 0.4, DC.z, 1.05, 1.05, 2.3, 12, {
      tint: [0.06, 0.06, 0.05],
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      b.cyl(
        "gold",
        DC.x + Math.cos(a) * 1.35,
        LT0 + 0.4,
        DC.z + Math.sin(a) * 1.35,
        0.1,
        0.1,
        2.3,
        6,
        { tint: [0.75, 0.58, 0.28] },
      );
    }
    b.cyl("gold", DC.x, LT0 + 2.7, DC.z, 1.6, 1.5, 0.3, 16, {
      tint: [0.75, 0.58, 0.28],
    });
    b.geo("gold", K.hemiGeo(16, 6), {
      x: DC.x,
      y: LT0 + 3.0,
      z: DC.z,
      sx: 1.4,
      sy: 1.1,
      sz: 1.4,
      tint: [0.72, 0.56, 0.28],
    });
    b.geo("gold", K.sphereGeo(), {
      x: DC.x,
      y: LT0 + 4.35,
      z: DC.z,
      s: 0.3,
      tint: [0.85, 0.66, 0.3],
    });
    b.pipe("gold", DC.x, LT0 + 4.1, DC.z, DC.x, LT0 + 5.4, DC.z, 0.05, 5);
    b.col(DC.x - 8.4, DY, DC.z - 8.4, DC.x + 8.4, DY + 4.0, DC.z + 8.4, {
      tag: "building",
    });
    b.col(DC.x - DR, DRUM0, DC.z - DR, DC.x + DR, DOME0 + 5, DC.z + DR, {
      tag: "building",
    });
    b.glow(DC.x, LT0 + 1.4, DC.z, [0.5, 0.35, 0.18], 3); // a fire someone keeps in the lantern

    // ---------- police radio mast (back roof) ----------
    {
      const mx = 181,
        mz = 548,
        m0 = ROOF + 2.8,
        m1 = m0 + 13;
      for (const [dx, dz] of [
        [-0.8, -0.8],
        [0.8, -0.8],
        [0.8, 0.8],
        [-0.8, 0.8],
      ])
        b.beam(
          "rust",
          mx + dx,
          m0,
          mz + dz,
          mx + dx * 0.2,
          m1,
          mz + dz * 0.2,
          0.08,
          0.08,
          { tint: [0.6, 0.35, 0.25] },
        );
      for (let y = m0 + 1; y < m1; y += 1.4) {
        const s = 1 - ((y - m0) / (m1 - m0)) * 0.8;
        b.beam(
          "rust",
          mx - 0.8 * s,
          y,
          mz - 0.8 * s,
          mx + 0.8 * s,
          y + 1.2,
          mz + 0.8 * s,
          0.05,
          0.05,
        );
        b.beam(
          "rust",
          mx + 0.8 * s,
          y,
          mz - 0.8 * s,
          mx - 0.8 * s,
          y + 1.2,
          mz + 0.8 * s,
          0.05,
          0.05,
        );
      }
      b.pipe("metal", mx, m1, mz, mx, m1 + 3, mz, 0.05, 5);
      b.geo("lamp", K.sphereGeo(), {
        x: mx,
        y: m1 + 3.1,
        z: mz,
        s: 0.18,
        tint: [1, 0.15, 0.1],
      });
      b.glow(mx, m1 + 3.1, mz, [1, 0.12, 0.08], 3.5);
      for (const [y, l] of [
        [m1 - 2, 2.2],
        [m1 - 5, 1.6],
      ])
        b.beam("metal", mx - l, y, mz, mx + l, y, mz, 0.06, 0.06);
    }
    // roof clutter: vents, a collapsed skylight, water tank
    for (const [vx, vz] of [
      [143, 558],
      [147, 566],
      [175, 548],
      [184, 562],
    ]) {
      b.cyl("metal", vx, ROOF, vz, 0.5, 0.5, 1.4, 8, {
        tint: [0.45, 0.43, 0.4],
      });
      b.cyl("metal", vx, ROOF + 1.4, vz, 0.8, 0.2, 0.4, 8);
    }
    {
      const tx = 172,
        tz = 551.5; // water tank (clear of the slanted back wall)
      b.cyl("wood", tx, ROOF + 2.5, tz, 1.8, 1.8, 3.2, 12, {
        tint: [0.5, 0.4, 0.3],
      });
      for (const [lx, lz] of [
        [-1.3, -1.3],
        [1.3, -1.3],
        [-1.3, 1.3],
        [1.3, 1.3],
      ])
        b.beam(
          "rust",
          tx + lx,
          ROOF,
          tz + lz,
          tx + lx,
          ROOF + 2.5,
          tz + lz,
          0.12,
          0.12,
        );
      b.geo("rust", K.hemiGeo(12, 4), {
        x: tx,
        y: ROOF + 5.7,
        z: tz,
        sx: 1.9,
        sy: 0.7,
        sz: 1.9,
      });
    }

    // ---------- posters, graffiti, grime ----------
    const P = (t, x, y, z, nx, nz, w, h) =>
      b.plate("art", x, y, z, nx, nz, w, h, t, { off: 0.03 });
    P(
      poster(
        "wanted",
        "WANTED\nFOR CURFEW\nVIOLATION",
        "#e0d4b0",
        "#2a2018",
        "REWARD 50 SCRIP",
      ),
      139,
      3.2,
      ZW + 0.02,
      0,
      1,
      1.2,
      1.6,
    );
    P(
      poster(
        "report",
        "REPORT\nRED\nACTIVITY",
        "#c82a20",
        "#f0e4c8",
        "KEEP NEW YORK FREE",
      ),
      176,
      3.0,
      ZW + 0.02,
      0,
      1,
      1.2,
      1.6,
    );
    P(
      poster(
        "patrolman",
        "PATROLMAN\nYOUR FRIENDLY\nPATROLMAN",
        "#2a4a6a",
        "#f0d890",
        "NYPD · ARDENT",
      ),
      150.6,
      3.1,
      ZF + 0.02,
      0,
      1,
      1.1,
      1.5,
    );
    P(
      poster(
        "curfew2",
        "CURFEW\n9 PM",
        "#e8dcc0",
        "#b8261e",
        "BY ORDER OF THE COMMISSIONER",
      ),
      X0 - 0.02,
      3.3,
      557.4,
      -1,
      0,
      1.2,
      1.6,
    );
    P(
      poster(
        "wanted2",
        "WANTED\nALIVE",
        "#e0d4b0",
        "#2a2018",
        "CITIZEN #4471-B",
      ),
      X0 - 0.02,
      3.2,
      563,
      -1,
      0,
      1.1,
      1.5,
    );
    b.plate(
      "decal",
      145,
      4.6,
      ZW + 0.03,
      0,
      1,
      4,
      1.3,
      K.tag("THE LAW IS METAL NOW", "#d8d040", 512, 128),
    );
    b.plate(
      "decal",
      X1 + 0.03,
      3.0,
      556,
      1,
      0,
      3.4,
      1.2,
      K.tag("NO CURFEW", "#e03030", 256, 96),
    );
    b.plate(
      "decal",
      170.5,
      2.8,
      ZF + 0.03,
      0,
      1,
      1.5,
      1.5,
      K.decal("scorch", 3),
    );
    for (let k = 0; k < 6; k++)
      b.burn(X0 + r() * (X1 - X0), 2 + r() * 14, ZW, 3 + r() * 3, 0.45);
    b.burn(186, 6, ZW, 6, 0.7);
    b.burn(X1, 12, 548, 7, 0.6);

    // ---------- sidewalk dressing (inside the kerb line) ----------
    for (const [sx0, sx1] of [
      [149, 151.6],
      [168.4, 171],
    ]) {
      b.boxMM("fabric", sx0, 0.12, ZF + 0.3, sx1, 0.9, ZF + 1.2, {
        tint: [0.55, 0.5, 0.36],
      });
      b.col(sx0, 0, ZF + 0.3, sx1, 0.9, ZF + 1.2, { tag: "sandbags" });
    }
    for (const x of [150.3, 169.7]) {
      b.boxMM("fabric", x - 1.2, 0.9, ZF + 0.35, x + 1.2, 1.3, ZF + 1.15, {
        tint: [0.5, 0.46, 0.33],
      });
    }
    b.plate(
      "art",
      150.3,
      1.6,
      ZF + 1.22,
      0,
      1,
      1.6,
      0.5,
      K.signCell("pc_pd_chk", "CHECKPOINT · HALT", 256, 64, {
        bg: "#e8d8a0",
        fg: "#1a1a1a",
        font: '"Arial Black", sans-serif',
      }),
    );

    // ---------- the POLICE GARDEN: the fenced triangle at the narrow end of the wedge (as at 240 Centre St) ----------
    {
      const GY = 0.16,
        FX0 = 130.6,
        FZ0 = 542.5,
        FX1 = 187.2; // fence line: north (Canal St side) + west (Centre St)
      const GATE0 = 134.0,
        GATE1 = 136.4;
      // soil & dead turf over the whole triangle, grime and leaf litter
      b.quadGrid(
        "dirt",
        [FX0 + 0.4, GY, zb(FX0 + 0.4) - 0.15],
        [FX1, GY, zb(FX1) - 0.15],
        [FX1, GY, FZ0 + 0.4],
        [FX0 + 0.4, GY, FZ0 + 0.4],
        { uv: "top", tint: [0.46, 0.42, 0.32], seg: 8 },
      );
      for (let k = 0; k < 18; k++) {
        const gx = FX0 + 1 + r() * 40,
          gz = FZ0 + 0.8 + r() * Math.max(0.5, zb(gx) - FZ0 - 1.6);
        b.hplate(
          "decal",
          gx,
          GY + 0.01 + k * 0.0005,
          gz,
          1.4 + r() * 2,
          1.4 + r() * 2,
          r() * 6,
          K.decal(k % 3 ? "grime" : "puddle", 300 + k),
        );
      }
      b.col(FX0, 0, FZ0, FX1, GY, ZBW, { tag: "floor", surface: "dirt" });
      // granite coping + wrought-iron fence with spear finials (north run with the gate, west run to the building corner)
      const fenceRun = (ax, az, bx, bz) => {
        const len = Math.hypot(bx - ax, bz - az),
          ux = (bx - ax) / len,
          uz = (bz - az) / len,
          yaw = Math.atan2(-uz, ux);
        b.box("granite", (ax + bx) / 2, 0, (az + bz) / 2, len, 0.4, 0.42, {
          yaw,
          tint: [0.55, 0.53, 0.5],
        });
        b.box(
          "granite",
          (ax + bx) / 2,
          0.4,
          (az + bz) / 2,
          len + 0.1,
          0.06,
          0.5,
          { yaw, tint: [0.5, 0.48, 0.45] },
        );
        const Y0 = 0.46,
          Y1 = 2.2;
        b.beam("black_iron", ax, Y0 + 0.12, az, bx, Y0 + 0.12, bz, 0.05, 0.05);
        b.beam("black_iron", ax, Y1 - 0.18, az, bx, Y1 - 0.18, bz, 0.05, 0.05);
        const n = Math.max(1, Math.round(len / 0.14));
        for (let k = 0; k <= n; k++) {
          const t = k / n,
            x = ax + (bx - ax) * t,
            z = az + (bz - az) * t;
          if (r() < 0.03) continue; // a few bars missing
          b.pipe("black_iron", x, Y0, z, x, Y1, z, 0.013, 4);
          b.cyl("black_iron", x, Y1, z, 0.03, 0.0, 0.12, 4, { top: false }); // spear point
        }
        for (let k = 0, m = Math.max(1, Math.round(len / 2.4)); k <= m; k++) {
          // posts with ball finials
          const t = k / m,
            x = ax + (bx - ax) * t,
            z = az + (bz - az) * t;
          b.box("black_iron", x, Y0, z, 0.09, Y1 - Y0 + 0.05, 0.09, { yaw });
          b.geo("black_iron", K.sphereGeo(), { x, y: Y1 + 0.1, z, s: 0.07 });
        }
        b.ocol((ax + bx) / 2, (az + bz) / 2, len, 0.45, 0, Y1, yaw, {
          tag: "fence",
          walkable: false,
        });
      };
      fenceRun(FX0, FZ0, GATE0, FZ0);
      fenceRun(GATE1, FZ0, FX1, FZ0);
      fenceRun(FX0, FZ0 + 0.2, FX0, ZBW - 0.2);
      // gate piers + one leaf standing open, one shut
      for (const gx of [GATE0 - 0.2, GATE1 + 0.2]) {
        b.box("granite", gx, 0, FZ0, 0.55, 2.5, 0.55, {
          tint: [0.55, 0.53, 0.5],
        });
        b.box("granite", gx, 2.5, FZ0, 0.7, 0.14, 0.7, {
          tint: [0.5, 0.48, 0.45],
        });
        b.geo("granite", K.sphereGeo(), {
          x: gx,
          y: 2.84,
          z: FZ0,
          s: 0.2,
          tint: [0.55, 0.53, 0.5],
        });
        b.col(gx - 0.28, 0, FZ0 - 0.28, gx + 0.28, 2.6, FZ0 + 0.28, {
          tag: "fence",
          walkable: false,
        });
      }
      {
        const hx = GATE0 + 0.1,
          len = 1.1,
          a = 1.25; // open leaf, swung into the garden
        for (let k = 0; k <= 8; k++) {
          const t = k / 8,
            x = hx + Math.cos(a) * len * t,
            z = FZ0 + Math.sin(a) * len * t;
          b.pipe("black_iron", x, 0.2, z, x, 1.9, z, 0.013, 4);
          b.cyl("black_iron", x, 1.9, z, 0.03, 0, 0.12, 4, { top: false });
        }
        b.beam(
          "black_iron",
          hx,
          0.35,
          FZ0,
          hx + Math.cos(a) * len,
          0.35,
          FZ0 + Math.sin(a) * len,
          0.04,
          0.04,
        );
        b.beam(
          "black_iron",
          hx,
          1.75,
          FZ0,
          hx + Math.cos(a) * len,
          1.75,
          FZ0 + Math.sin(a) * len,
          0.04,
          0.04,
        );
      }
      b.plate(
        "art",
        GATE1 + 0.2,
        1.7,
        FZ0 - 0.29,
        0,
        -1,
        0.5,
        0.62,
        K.signCell(
          "pc_pd_garden",
          "POLICE\nGARDEN\nCLOSED AT\nSUNSET",
          128,
          160,
          {
            bg: "#2a3a2a",
            fg: "#e8e0c8",
            font: "Georgia, serif",
            border: "#c8b070",
          },
        ),
      );
      // dead plane trees
      for (const [tx, tz, h] of [
        [141, 547.4, 7.5],
        [162.5, 545.2, 6],
        [176, 543.9, 4.5],
      ]) {
        b.cyl("wood_dark", tx, GY, tz, 0.34, 0.15, h, 7, {
          tint: [0.34, 0.3, 0.24],
        });
        const rr = K.rng(tx * 5 + tz);
        for (let k = 0; k < 7; k++) {
          const a = rr() * PI * 2,
            y0 = h * (0.4 + rr() * 0.5),
            l = 1.2 + rr() * 2.2;
          b.beam(
            "wood_dark",
            tx,
            y0,
            tz,
            tx + Math.cos(a) * l,
            y0 + 0.6 + rr() * 1.3,
            tz + Math.sin(a) * l * 0.6,
            0.09,
            0.09,
            { tint: [0.3, 0.26, 0.2] },
          );
        }
        b.cyl("granite", tx, GY, tz, 0.8, 0.8, 0.12, 12, {
          tint: [0.5, 0.48, 0.45],
        }); // tree-pit ring
        b.col(tx - 0.3, 0, tz - 0.3, tx + 0.3, h, tz + 0.3, { tag: "tree" });
      }
      // dead box hedges along the fence
      for (let x = FX0 + 1.4; x < FX1 - 4; x += 1.7) {
        if (x > GATE0 - 1 && x < GATE1 + 1) continue;
        if (r() < 0.3) continue;
        b.geo("wood_rotten", K.sphereGeo(), {
          x,
          y: GY + 0.35,
          z: FZ0 + 0.85,
          sx: 0.8,
          sy: 0.55,
          sz: 0.5,
          tint: [0.4, 0.36, 0.24],
        });
      }
      for (let z = FZ0 + 1.6; z < ZBW - 1; z += 1.7)
        if (r() > 0.3)
          b.geo("wood_rotten", K.sphereGeo(), {
            x: FX0 + 0.85,
            y: GY + 0.35,
            z,
            sx: 0.5,
            sy: 0.55,
            sz: 0.8,
            tint: [0.4, 0.36, 0.24],
          });
      // the Patrolmen's Memorial: an empty granite pedestal, its bronze patrolman toppled in the weeds
      {
        const mx = 135,
          mz = 548.6;
        b.box("granite", mx, GY, mz, 1.6, 0.3, 1.6, {
          tint: [0.5, 0.48, 0.45],
        });
        b.box("granite", mx, GY + 0.3, mz, 1.1, 1.8, 1.1, {
          tint: [0.58, 0.56, 0.52],
        });
        b.box("granite", mx, GY + 2.1, mz, 1.3, 0.2, 1.3, {
          tint: [0.52, 0.5, 0.47],
        });
        b.plate(
          "art",
          mx,
          GY + 1.25,
          mz - 0.56,
          0,
          -1,
          0.9,
          0.6,
          K.signCell(
            "pc_pd_memorial_ext",
            "TO THE FINEST\nWHO KEPT\nTHE PEACE\n1845 – 1967",
            192,
            128,
            { bg: "#5a4a2a", fg: "#d8c088", font: "Georgia, serif" },
          ),
        );
        b.col(mx - 0.8, 0, mz - 0.8, mx + 0.8, GY + 2.3, mz + 0.8, {
          tag: "statue",
        });
        const fx = mx + 2.2,
          fz = mz - 0.6,
          BR = [0.3, 0.42, 0.36]; // the fallen bronze (verdigris) patrolman
        b.pipe(
          "patina",
          fx - 0.9,
          GY + 0.22,
          fz,
          fx + 0.35,
          GY + 0.22,
          fz + 0.1,
          0.2,
          8,
          { tint: BR },
        ); // torso
        for (const s of [-0.12, 0.12])
          b.pipe(
            "patina",
            fx + 0.35,
            GY + 0.16,
            fz + s,
            fx + 1.3,
            GY + 0.14,
            fz + s * 1.6,
            0.1,
            6,
            { tint: BR },
          ); // legs
        b.pipe(
          "patina",
          fx - 0.7,
          GY + 0.3,
          fz + 0.2,
          fx - 0.2,
          GY + 0.6,
          fz + 0.5,
          0.08,
          6,
          { tint: BR },
        ); // raised arm (baton)
        b.pipe(
          "patina",
          fx - 0.2,
          GY + 0.6,
          fz + 0.5,
          fx - 0.15,
          GY + 1.0,
          fz + 0.75,
          0.04,
          5,
          { tint: [0.22, 0.3, 0.26] },
        );
        b.geo("patina", K.sphereGeo(), {
          x: fx - 1.2,
          y: GY + 0.24,
          z: fz - 0.05,
          s: 0.17,
          tint: BR,
        }); // head
        b.cyl("patina", fx - 1.38, GY + 0.1, fz - 0.05, 0.19, 0.17, 0.12, 10, {
          tint: [0.24, 0.32, 0.28],
        }); // helmet-cap, rolled off
        b.col(fx - 1.4, 0, fz - 0.3, fx + 1.4, GY + 0.5, fz + 0.4, {
          tag: "statue",
        });
      }
      // a park bench (a skeleton still sits on it) and two iron lamp standards, one still lit
      {
        const bx = 150,
          bz = 547.3;
        b.box("black_iron", bx - 0.8, GY, bz, 0.08, 0.45, 0.5);
        b.box("black_iron", bx + 0.8, GY, bz, 0.08, 0.45, 0.5);
        for (let k = 0; k < 3; k++)
          b.box("wood", bx, GY + 0.43, bz - 0.15 + k * 0.14, 1.8, 0.04, 0.1, {
            tint: [0.45, 0.36, 0.26],
          });
        for (let k = 0; k < 2; k++)
          b.box("wood", bx, GY + 0.62 + k * 0.16, bz + 0.25, 1.8, 0.1, 0.04, {
            tint: [0.45, 0.36, 0.26],
          });
        b.col(bx - 0.9, 0, bz - 0.28, bx + 0.9, GY + 0.47, bz + 0.3, {
          tag: "bench",
        });
        K.skel(ctx, bx + 0.2, GY + 0.45, bz, PI, "sitting", { world: true });
      }
      for (const [lx, lz, lit] of [
        [146, 544.2, true],
        [168, 544.6, false],
      ]) {
        b.cyl("black_iron", lx, GY, lz, 0.14, 0.06, 3.6, 8, {
          tint: [0.25, 0.24, 0.22],
        });
        b.cyl("black_iron", lx, GY, lz, 0.2, 0.2, 0.5, 8, {
          tint: [0.25, 0.24, 0.22],
        });
        b.geo(lit ? "lamp" : "glass", K.sphereGeo(), {
          x: lx,
          y: GY + 3.85,
          z: lz,
          s: 0.28,
          tint: lit ? [1, 0.82, 0.5] : [0.5, 0.52, 0.5],
        });
        if (lit) b.glow(lx, GY + 3.85, lz, [1, 0.75, 0.4], 2.2);
        b.col(lx - 0.15, 0, lz - 0.15, lx + 0.15, 3.6, lz + 0.15, {
          tag: "lamp",
        });
      }
      K.rubble(b, 181, GY, 543.6, 0.9, 0.6, { seed: 1561, col: false });
      K.loot(ctx, "trash_can", 131.9, GY, 551.5, 0, { world: true });
    }

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_police_ext";
    K.anchor(ctx, "door", 160, LY, LZ + 1.4, false);
    K.anchor(ctx, "steps", 160, 0.12, ZF + 1.8, false);
    K.anchor(ctx, "enforcer", 156.2, LY, LZ + 1.8, false); // clear of the charging pod and the door surround
    K.loot(ctx, "car", 135.2, 0.12, 575.6, HP + 0.08, {
      world: true,
      kind: "police",
      wreck: true,
    });
    K.loot(ctx, "car", 186.4, 0.12, 540.3, -HP + 0.3, {
      world: true,
      kind: "police",
      burnt: true,
      wreck: true,
    });
    K.loot(ctx, "jersey_barrier", 176, 0.12, 575, 0, { world: true });
    K.loot(ctx, "barrel", 172.4, 0.12, 574.2, 0, {
      world: true,
      burning: true,
      container: false,
    });
    K.skel(ctx, 147.2, 0.12, 574.4, 0.4, "reaching", { world: true });
  }

  /** Patrolman charging pod: plinth, back panel, curved glass front, lamp cap. */
