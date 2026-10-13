// play-inline-348 03 — tint
// Lines 171-1236 of readable/play-inline-348.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "sp_ext", grime: 0.6, seg: 4 });
    const r = K.rng("sp_ext");

    // ================= NAVE BOX =================
    const wall = (ax, az, ux, uz, len, h, mat, tint) =>
      b.face(mat, ax, 0, az, ux, 0, uz, 0, 1, 0, len, h, { tint });
    wall(CX0, CZ0, 0, 1, CZF - CZ0, EAVE, "fieldstone", STONE); // west (normal −x)
    wall(CX1, CZF, 0, -1, CZF - CZ0, EAVE, "fieldstone", STONE); // east (+x)
    // front gable wall (z = CZF, +z): rectangle + gable triangle
    wall(
      CX0 - 0.6,
      CZF,
      1,
      0,
      MID - 2.1 - (CX0 - 0.6),
      EAVE,
      "fieldstone",
      [0.8, 0.72, 0.62],
    );
    wall(
      MID + 2.1,
      CZF,
      1,
      0,
      CX1 + 0.6 - (MID + 2.1),
      EAVE,
      "fieldstone",
      [0.8, 0.72, 0.62],
    );
    b.quadN(
      "fieldstone",
      [CX0 - 0.6, EAVE, CZF],
      [CX1 + 0.6, EAVE, CZF],
      [MID, RIDGE + 0.8, CZF],
      [MID, RIDGE + 0.8, CZF],
      [0, 0, 1],
      { tint: [0.8, 0.72, 0.62] },
    );
    b.boxMM("fieldstone", CX0 - 0.6, 0, CZF - 1.0, CX0, EAVE, CZF, {
      tint: STONE_D,
    });
    b.boxMM("fieldstone", CX1, 0, CZF - 1.0, CX1 + 0.6, EAVE, CZF, {
      tint: STONE_D,
    });
    // gable coping (raking parapet) + apex cross
    for (const s of [-1, 1])
      b.beam(
        "limestone",
        MID + (s * (CX1 - CX0 + 1.4)) / 2,
        EAVE - 0.2,
        CZF + 0.05,
        MID,
        RIDGE + 1.0,
        CZF + 0.05,
        0.9,
        0.4,
        { tint: [0.7, 0.66, 0.58] },
      );
    b.boxMM(
      "limestone",
      MID - 0.12,
      RIDGE + 1.0,
      CZF - 0.1,
      MID + 0.12,
      RIDGE + 3.4,
      CZF + 0.14,
      { tint: [0.68, 0.64, 0.56] },
    );
    b.boxMM(
      "limestone",
      MID - 0.7,
      RIDGE + 2.4,
      CZF - 0.1,
      MID + 0.7,
      RIDGE + 2.64,
      CZF + 0.14,
      { tint: [0.68, 0.64, 0.56] },
    );
    // roof: two slate slopes + gable fill at the apse end
    const rs = (x0, x1, y0) =>
      b.quadN(
        "slate",
        [x0, y0, CZ0 - 0.3],
        [x0, y0, CZF + 0.2],
        [MID, RIDGE, CZF + 0.2],
        [MID, RIDGE, CZ0 - 0.3],
        [x0 < MID ? -1 : 1, 1, 0],
        { tint: [0.8, 0.82, 0.85] },
      );
    rs(CX0 - 0.7, CX0 - 0.7, EAVE - 0.4);
    rs(CX1 + 0.7, CX1 + 0.7, EAVE - 0.4);
    b.quadN(
      "fieldstone",
      [CX0, EAVE, CZ0],
      [CX1, EAVE, CZ0],
      [MID, RIDGE, CZ0],
      [MID, RIDGE, CZ0],
      [0, 0, -1],
      { tint: STONE_D },
    );
    b.beam(
      "lead",
      CX0 - 0.7,
      EAVE - 0.4,
      CZ0 - 0.3,
      CX0 - 0.7,
      EAVE - 0.4,
      CZF + 0.2,
      0.3,
      0.3,
      { tint: [0.4, 0.4, 0.4] },
    );
    b.beam(
      "lead",
      CX1 + 0.7,
      EAVE - 0.4,
      CZ0 - 0.3,
      CX1 + 0.7,
      EAVE - 0.4,
      CZF + 0.2,
      0.3,
      0.3,
      { tint: [0.4, 0.4, 0.4] },
    );
    b.beam("lead", MID, RIDGE, CZ0 - 0.3, MID, RIDGE, CZF + 0.2, 0.25, 0.25, {
      tint: [0.35, 0.35, 0.36],
    });
    // a hole in the roof (bomb damage): dark patch + charred rafters
    b.quadN(
      "paint_black",
      [CX1 - 3.2, 16.4, 467],
      [CX1 - 3.2, 16.4, 471.5],
      [MID + 2.4, 19.2, 471.5],
      [MID + 2.4, 19.2, 467],
      [1, 1, 0],
      { tint: [0.03, 0.03, 0.03], grime: 0 },
    );
    for (let z = 467.4; z < 471.5; z += 0.9)
      b.beam("wood_dark", CX1 - 0.4, EAVE, z, MID, RIDGE - 0.2, z, 0.15, 0.2, {
        tint: [0.15, 0.12, 0.1],
      });
    b.col(CX0, 0, CZ0, CX1, EAVE, CZF - 1.2, { tag: "building" });
    b.col(CX0 - 0.6, 0, CZF - 1.2, MID - 2.1, EAVE, CZF, { tag: "building" });
    b.col(MID + 2.1, 0, CZF - 1.2, CX1 + 0.6, EAVE, CZF, { tag: "building" });
    b.col(MID - 2.1, 7.4, CZF - 1.2, MID + 2.1, EAVE, CZF, { tag: "building" });
    b.col(MID - 2.1, 0, CZF - 1.3, MID + 2.1, 7.4, CZF - 1.15, {
      tag: "building",
    });
    // ================= APSE (half-octagon, north) =================
    const AR = 5.6,
      AC = { x: MID, z: CZ0 };
    for (let k = 0; k < 4; k++) {
      const a0 = PI + (k * PI) / 4,
        a1 = a0 + PI / 4;
      const p0 = [AC.x + Math.cos(a0) * AR, AC.z + Math.sin(a0) * AR],
        p1 = [AC.x + Math.cos(a1) * AR, AC.z + Math.sin(a1) * AR];
      const am = (a0 + a1) / 2;
      b.quadN(
        "fieldstone",
        [p0[0], 0, p0[1]],
        [p1[0], 0, p1[1]],
        [p1[0], EAVE - 1.5, p1[1]],
        [p0[0], EAVE - 1.5, p0[1]],
        [Math.cos(am), 0, Math.sin(am)],
        { tint: STONE },
      );
      b.quadN(
        "slate",
        [p0[0] + Math.cos(am) * 0.5, EAVE - 1.8, p0[1] + Math.sin(am) * 0.5],
        [p1[0] + Math.cos(am) * 0.5, EAVE - 1.8, p1[1] + Math.sin(am) * 0.5],
        [AC.x, RIDGE - 2.5, AC.z],
        [AC.x, RIDGE - 2.5, AC.z],
        [Math.cos(am), 1, Math.sin(am)],
        { tint: [0.8, 0.82, 0.85] },
      );
      const wm = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      K.lancet(b, wm[0], 4, wm[1], Math.cos(am), Math.sin(am), 1.3, 5.2, {
        rect: K.stainedGlass("art", "apse" + k, 128, 384, 20 + k),
        mat: "art",
        frameTint: [0.7, 0.66, 0.58],
      });
    }
    b.col(AC.x - AR, 0, AC.z - AR, AC.x + AR, EAVE - 1.5, AC.z, {
      tag: "building",
    });

    // ================= SIDES: buttresses + lancets =================
    const BAYS = 5,
      bayL = (CZF - 1.2 - CZ0) / BAYS;
    for (const [x, n] of [
      [CX0, -1],
      [CX1, 1],
    ]) {
      for (let i = 0; i <= BAYS; i++) {
        const z = CZ0 + i * bayL;
        b.boxMM(
          "fieldstone",
          n < 0 ? x - 1.2 : x,
          0,
          z - 0.45,
          n < 0 ? x : x + 1.2,
          EAVE - 2.4,
          z + 0.45,
          { tint: STONE_D },
        );
        b.quadN(
          "limestone",
          [x + n * 1.2, EAVE - 2.4, z - 0.45],
          [x + n * 1.2, EAVE - 2.4, z + 0.45],
          [x, EAVE - 1.2, z + 0.45],
          [x, EAVE - 1.2, z - 0.45],
          [n, 1, 0],
          { tint: [0.66, 0.62, 0.55] },
        );
        b.col(
          n < 0 ? x - 1.2 : x,
          0,
          z - 0.45,
          n < 0 ? x : x + 1.2,
          EAVE - 2.4,
          z + 0.45,
          { tag: "building" },
        );
      }
      for (let i = 0; i < BAYS; i++) {
        const z = CZ0 + (i + 0.5) * bayL;
        const broken = (i === 2 && n > 0) || (i === 4 && n < 0);
        K.lancet(
          b,
          x + n * 0.02,
          3.2,
          z,
          n,
          0,
          1.8,
          7.2,
          broken
            ? {
                mat: "paint_black",
                tint: [0.03, 0.03, 0.03],
                frameTint: [0.62, 0.58, 0.5],
              }
            : {
                rect: K.stainedGlass(
                  "art",
                  "side" + i + (n > 0 ? "e" : "w"),
                  128,
                  448,
                  i * 3 + (n > 0 ? 1 : 0),
                ),
                mat: "art",
                frameTint: [0.7, 0.66, 0.58],
              },
        );
        if (broken)
          for (let k = 0; k < 3; k++)
            b.quadN(
              "glass",
              [x + n * 0.05, 3.2 + k * 0.4, z - 0.6 + k * 0.3],
              [x + n * 0.05, 3.2 + k * 0.4, z - 0.3 + k * 0.3],
              [x + n * 0.05, 4.2 + k * 0.5, z - 0.4 + k * 0.3],
              [x + n * 0.05, 4.2 + k * 0.5, z - 0.5 + k * 0.3],
              [n, 0, 0],
              { tint: [0.6, 0.4, 0.3] },
            );
      }
      b.beam(
        "limestone",
        x + n * 0.1,
        EAVE - 0.3,
        CZ0,
        x + n * 0.1,
        EAVE - 0.3,
        CZF,
        0.35,
        0.3,
        { tint: [0.68, 0.64, 0.56] },
      ); // eaves course
    }
    // side door (sacristy, east) — boarded
    b.boxMM("wood_dark", CX1 + 0.02, 0, 461, CX1 + 0.12, 2.6, 462.6, {
      tint: [0.35, 0.25, 0.18],
    });
    for (let k = 0; k < 3; k++)
      b.beam(
        "wood_rotten",
        CX1 + 0.18,
        0.5 + k * 0.8,
        460.8,
        CX1 + 0.18,
        0.7 + k * 0.8,
        462.8,
        0.04,
        0.2,
        { tint: [0.55, 0.45, 0.35] },
      );

    // ================= FRONT (Grand Street) =================
    // corner & inner buttresses with pinnacles
    for (const bx of [CX0 - 0.6, MID - 5.2, MID + 5.2, CX1 + 0.6]) {
      const w = bx === CX0 - 0.6 || bx === CX1 + 0.6 ? 1.6 : 1.1;
      b.boxMM(
        "fieldstone",
        bx - w / 2,
        0,
        CZF,
        bx + w / 2,
        EAVE + 1.2,
        CZF + 0.9,
        { tint: STONE_D },
      );
      b.col(bx - w / 2, 0, CZF, bx + w / 2, EAVE, CZF + 0.9, {
        tag: "building",
      });
      for (let k = 0; k < 3; k++)
        b.boxMM(
          "limestone",
          bx - w / 2 - 0.05,
          3 + k * 4,
          CZF - 0.05,
          bx + w / 2 + 0.05,
          3.25 + k * 4,
          CZF + 0.95,
          { tint: [0.66, 0.62, 0.55] },
        );
      if (w > 1.2) {
        b.cyl("limestone", bx, EAVE + 1.2, CZF + 0.45, 0.55, 0.05, 3.2, 4, {
          tint: [0.66, 0.62, 0.55],
        });
        b.geo("limestone", K.sphereGeo(), {
          x: bx,
          y: EAVE + 4.5,
          z: CZF + 0.45,
          s: 0.16,
          tint: [0.66, 0.62, 0.55],
        });
      }
    }
    // the portal: an opening in the front wall (pointed, w 4.2, spring 4.6, apex 8.6), a 1.15 m deep recess with
    // stepped orders of limestone voussoirs, the wooden doors and a tympanum at the back
    const PW = 3.6,
      OW = 4.2,
      OS = 4.6,
      OA = OS + OW * 0.95,
      RZ = CZF - 1.15;
    const ring = (w, spring, z, bw) => {
      let prev = null;
      for (let i = 0; i <= 12; i++) {
        const s = i < 6.5 ? -1 : 1,
          t = s < 0 ? i / 6 : (12 - i) / 6;
        const q = K.ptArc(t);
        const p = [MID + s * q[0] * w, spring + w * 0.95 * q[1], z];
        if (prev)
          b.beam(
            "limestone",
            prev[0],
            prev[1],
            prev[2],
            p[0],
            p[1],
            p[2],
            bw,
            0.26,
            { tint: [0.7, 0.66, 0.58] },
          );
        prev = p;
      }
      for (const s of [-1, 1])
        b.boxMM(
          "limestone",
          MID + (s * w) / 2 - bw / 2,
          0,
          z - 0.13,
          MID + (s * w) / 2 + bw / 2,
          spring,
          z + 0.13,
          { tint: [0.7, 0.66, 0.58] },
        );
    };
    ring(OW + 0.1, OS, CZF - 0.95, 0.24);
    ring(OW + 0.55, OS + 0.1, CZF - 0.45, 0.3);
    ring(OW + 1.1, OS + 0.2, CZF + 0.12, 0.34);
    // wall around the opening (the full-width face above was replaced by these pieces)
    const sp = new THREE.Shape();
    sp.moveTo(-OW / 2, 0);
    for (let i = 1; i <= 10; i++) {
      const q = K.ptArc(i / 10);
      sp.lineTo(-q[0] * OW, q[1] * OW * 0.95);
    }
    for (let i = 9; i >= 0; i--) {
      const q = K.ptArc(i / 10);
      sp.lineTo(q[0] * OW, q[1] * OW * 0.95);
    }
    sp.lineTo(OW / 2, EAVE - OS);
    sp.lineTo(-OW / 2, EAVE - OS);
    sp.lineTo(-OW / 2, 0);
    b.geo("fieldstone", new THREE.ShapeGeometry(sp), {
      x: MID,
      y: OS,
      z: CZF + 0.002,
      tint: [0.8, 0.72, 0.62],
    });
    for (const s of [-1, 1]) {
      b.face(
        "fieldstone",
        MID + (s * OW) / 2,
        0,
        s < 0 ? CZF : RZ,
        0,
        0,
        s < 0 ? -1 : 1,
        0,
        1,
        0,
        CZF - RZ,
        OS,
        { tint: [0.6, 0.55, 0.48] },
      ); // jamb faces
    }
    for (let i = 0; i < 10; i++) {
      const q0 = K.ptArc(i / 10),
        q1 = K.ptArc((i + 1) / 10);
      for (const s of [-1, 1])
        b.quadN(
          "fieldstone",
          [MID + s * q0[0] * OW, OS + q0[1] * OW * 0.95, RZ],
          [MID + s * q1[0] * OW, OS + q1[1] * OW * 0.95, RZ],
          [MID + s * q1[0] * OW, OS + q1[1] * OW * 0.95, CZF],
          [MID + s * q0[0] * OW, OS + q0[1] * OW * 0.95, CZF],
          [-s, -1, 0],
          { tint: [0.5, 0.45, 0.4] },
        );
    }
    // doors + tympanum on the recess back wall
    b.boxMM("fieldstone", MID - OW / 2, 0, RZ - 0.05, MID + OW / 2, 3.9, RZ, {
      tint: [0.45, 0.4, 0.36],
    });
    // round 2: panelled oak leaves with iron strap hinges and ring pulls, in a limestone frame (readable from Grand St)
    K.doorway(b, MID, FLOOR, RZ, 0, 1, {
      w: PW - 0.1,
      h: 3.9 - FLOOR,
      transom: 0,
      mat: "wood_dark",
      tint: [1.0, 0.82, 0.66],
      kick: "black_iron",
      glass: false,
      handles: "ring",
      straps: 3,
      frame: "limestone",
      frameTint: [0.6, 0.57, 0.52],
      frameW: 0.2,
      proud: 0.1,
    });
    K.lancet(b, MID, 3.9, RZ, 0, 1, OW, OA - 3.9, {
      mat: "fieldstone",
      tint: [0.55, 0.5, 0.44],
      tracery: false,
      inset: 0.001,
    });
    b.plate(
      "art",
      MID,
      5.6,
      RZ + 0.04,
      0,
      1,
      1.6,
      1.0,
      K.signCell("pc_sp_ihs", "IHS", 192, 120, {
        bg: "#5a4a3a",
        fg: "#d8b060",
        font: "Georgia, serif",
        border: "#d8b060",
      }),
    );
    b.boxMM("limestone", MID - 2.4, 0, RZ, MID + 2.4, FLOOR + 0.02, CZF + 0.9, {
      tint: [0.6, 0.58, 0.54],
    });
    // the great window over the portal (in the gable)
    K.lancet(b, MID, 9.4, CZF + 0.02, 0, 1, 2.8, 5.8, {
      rect: K.stainedGlass("art", "front", 192, 448, 7),
      mat: "art",
      frameTint: [0.7, 0.66, 0.58],
    });
    {
      const rr = rose("art");
      b.geo(K.atlasMat("art", rr), new THREE.CircleGeometry(1.2, 20), {
        x: MID,
        y: 17.3,
        z: CZF + 0.03,
        uv: "rect",
        rect: rr,
        tint: [0.95, 0.95, 0.95],
      });
    }
    b.geo("limestone", new THREE.TorusGeometry(1.3, 0.16, 5, 20), {
      x: MID,
      y: 17.3,
      z: CZF + 0.08,
      tint: [0.7, 0.66, 0.58],
    });
    for (const s of [-1, 1]) {
      K.lancet(b, MID + s * 7.6, 2.4, CZF + 0.02, 0, 1, 1.4, 4.2, {
        rect: K.stainedGlass("art", "fs" + s, 128, 384, 11 + s),
        mat: "art",
        frameTint: [0.7, 0.66, 0.58],
      });
      K.lancet(b, MID + s * 7.6, 8.2, CZF + 0.02, 0, 1, 1.2, 3.4, {
        mat: "paint_black",
        tint: [0.05, 0.05, 0.05],
        frameTint: [0.66, 0.62, 0.55],
      });
    }
    // ================= BELL-COTE on the apex (empty) =================
    {
      const by = RIDGE - 1.6,
        bz = CZF - 1.0;
      b.boxMM(
        "fieldstone",
        MID - 1.3,
        by,
        bz - 0.5,
        MID + 1.3,
        by + 1.4,
        bz + 0.5,
        { tint: STONE_D },
      );
      for (const s of [-1, 1])
        b.boxMM(
          "fieldstone",
          MID + s * 1.05 - 0.25,
          by + 1.4,
          bz - 0.5,
          MID + s * 1.05 + 0.25,
          by + 3.6,
          bz + 0.5,
          { tint: STONE_D },
        );
      K.lancet(b, MID, by + 1.4, bz + 0.52, 0, 1, 1.6, 2.2, {
        mat: "paint_black",
        tint: [0.04, 0.04, 0.04],
        tracery: false,
      });
      K.lancet(b, MID, by + 1.4, bz - 0.52, 0, -1, 1.6, 2.2, {
        mat: "paint_black",
        tint: [0.04, 0.04, 0.04],
        tracery: false,
      });
      b.boxMM(
        "fieldstone",
        MID - 1.4,
        by + 3.6,
        bz - 0.6,
        MID + 1.4,
        by + 3.9,
        bz + 0.6,
        { tint: STONE_D },
      );
      b.quadN(
        "slate",
        [MID - 1.5, by + 3.9, bz + 0.65],
        [MID + 1.5, by + 3.9, bz + 0.65],
        [MID, by + 5.3, bz],
        [MID, by + 5.3, bz],
        [0, 1, 1],
        {},
      );
      b.quadN(
        "slate",
        [MID + 1.5, by + 3.9, bz - 0.65],
        [MID - 1.5, by + 3.9, bz - 0.65],
        [MID, by + 5.3, bz],
        [MID, by + 5.3, bz],
        [0, 1, -1],
        {},
      );
      b.beam(
        "wood_dark",
        MID - 0.8,
        by + 3.3,
        bz,
        MID + 0.8,
        by + 3.3,
        bz,
        0.14,
        0.14,
        { tint: [0.25, 0.18, 0.12] },
      ); // empty headstock
      b.pipe(
        "rust",
        MID,
        by + 3.25,
        bz,
        MID - 0.2,
        by + 2.0,
        bz + 0.1,
        0.02,
        3,
      ); // dangling rope/chain
    }

    // ================= CHURCHYARD WALL =================
    const WH = 3.8;
    const bwall = (ax, az, bx, bz, gaps) => {
      const len = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / len,
        uz = (bz - az) / len;
      const segs = [];
      let t = 0;
      for (const g of (gaps || []).sort((p, q) => p.t - q.t)) {
        segs.push([t, g.t - g.w / 2]);
        t = g.t + g.w / 2;
      }
      segs.push([t, len]);
      for (const [a, c] of segs) {
        if (c - a < 0.05) continue;
        const cx = ax + (ux * (a + c)) / 2,
          cz = az + (uz * (a + c)) / 2,
          yaw = Math.atan2(-uz, ux);
        const hh = WH + (r() - 0.5) * 0.2;
        b.box("brick_red", cx, 0, cz, c - a, hh, 0.5, { yaw, tint: BRICK });
        b.box("limestone", cx, hh, cz, c - a + 0.1, 0.18, 0.62, {
          yaw,
          tint: [0.6, 0.57, 0.52],
        });
        b.ocol(cx, cz, c - a, 0.5, 0, hh + 0.2, yaw, { tag: "wall" });
        for (let p = a + 3.5; p < c - 1; p += 4) {
          const px = ax + ux * p,
            pz = az + uz * p;
          b.box("brick_red", px, 0, pz, 0.7, hh + 0.35, 0.72, {
            yaw,
            tint: [0.66, 0.52, 0.44],
          });
        }
      }
      for (const g of gaps || [])
        for (const s of [-1, 1]) {
          const t0 = g.t + s * (g.w / 2 + 0.3),
            px = ax + ux * t0,
            pz = az + uz * t0;
          b.box("brick_red", px, 0, pz, 0.8, WH + 0.9, 0.8, {
            yaw: Math.atan2(-uz, ux),
            tint: [0.62, 0.5, 0.42],
          });
          b.geo("limestone", K.sphereGeo(), {
            x: px,
            y: WH + 1.2,
            z: pz,
            s: 0.3,
            tint: [0.6, 0.57, 0.52],
          });
          b.col(px - 0.4, 0, pz - 0.4, px + 0.4, WH + 0.9, pz + 0.4, {
            tag: "wall",
          });
        }
    };
    bwall(SX0, SZ0, SX1, SZ0); // Houston St side
    bwall(SX0, SZ0, SX0, SZ1, [{ t: 20, w: 3.2 }]); // Bowery side (west gate)
    bwall(SX1, SZ0, SX1, SZ1, [{ t: 21, w: 3.2 }]); // east side gate
    bwall(SX0, SZ1, CX0 - 1.4, SZ1, [{ t: 7.2, w: 3.2 }]); // Grand St, west yard gate
    bwall(CX1 + 1.4, SZ1, SX1, SZ1, [{ t: 12, w: 3.2 }]); // Grand St, east yard gate
    // iron gates (one hanging open)
    for (const [gx, gz, yaw, open] of [
      [SX0 + 7.2, SZ1, 0, true],
      [CX1 + 13.4, SZ1, 0, false],
      [SX0, SZ0 + 20, HP, false],
      [SX1, SZ0 + 21, HP, true],
    ]) {
      const c = Math.cos(yaw + (open ? 1.2 : 0)),
        s = Math.sin(yaw + (open ? 1.2 : 0));
      const ox = gx - Math.cos(yaw) * 1.5,
        oz = gz + Math.sin(yaw) * 1.5;
      for (let k = 0; k <= 12; k++) {
        const t = (k / 12) * 2.9,
          px = ox + c * t,
          pz = oz - s * t;
        b.cyl(
          "black_iron",
          px,
          0,
          pz,
          0.02,
          0.02,
          2.6 + Math.sin((k / 12) * PI) * 0.5,
          4,
          { tint: [0.2, 0.19, 0.18], top: false },
        );
      }
      b.beam(
        "black_iron",
        ox,
        0.3,
        oz,
        ox + c * 2.9,
        0.3,
        oz - s * 2.9,
        0.04,
        0.04,
      );
      b.beam(
        "black_iron",
        ox,
        2.3,
        oz,
        ox + c * 2.9,
        2.3,
        oz - s * 2.9,
        0.04,
        0.04,
      );
      if (!open)
        b.ocol(gx, gz, 3.0, 0.1, 0, 2.6, yaw, { tag: "gate", walkable: false });
    }

    // Sister Agnes keeps oil lanterns burning on the piers of the two open gates (night: warm pools that say
    // "friendly trader inside"), and a hand-painted board by the east gate
    const lantern = (px, py, pz, nx, nz) => {
      const lx = px + nx * 0.55,
        lz = pz + nz * 0.55;
      b.beam(
        "black_iron",
        px + nx * 0.4,
        py + 0.25,
        pz + nz * 0.4,
        lx,
        py + 0.25,
        lz,
        0.04,
        0.04,
      );
      b.pipe("black_iron", lx, py + 0.25, lz, lx, py - 0.05, lz, 0.01, 3);
      b.box("black_iron", lx, py - 0.45, lz, 0.22, 0.04, 0.22);
      b.box("black_iron", lx, py - 0.08, lz, 0.26, 0.06, 0.26);
      b.geo("lamp", K.sphereGeo(), {
        x: lx,
        y: py - 0.26,
        z: lz,
        sx: 0.09,
        sy: 0.14,
        sz: 0.09,
        tint: [1, 0.66, 0.3],
      });
      for (const [ex, ez] of [
        [-0.1, -0.1],
        [0.1, -0.1],
        [-0.1, 0.1],
        [0.1, 0.1],
      ])
        b.box("black_iron", lx + ex, py - 0.43, lz + ez, 0.015, 0.36, 0.015);
      b.glow(lx, py - 0.26, lz, [1, 0.62, 0.28], 1.6);
    };
    for (const s of [-1, 1]) lantern(SX1, WH + 0.5, SZ0 + 21 + s * 1.9, 1, 0); // east side gate (to Agnes)
    for (const s of [-1, 1]) lantern(SX0 + 7.2 + s * 1.9, WH + 0.5, SZ1, 0, 1); // Grand St west yard gate
    b.plate(
      "art",
      SX1 + 0.27,
      1.9,
      SZ0 + 21 + 3.4,
      1,
      0,
      1.3,
      0.9,
      K.signCell(
        "pc_sp_trade",
        "SANCTUARY\nTRADE · HOLY WATER\nRALLY TONIC →",
        256,
        176,
        {
          bg: "#d8ccb0",
          fg: "#3a2a1a",
          font: "Georgia, serif",
          border: "#6a4a2a",
        },
      ),
      { off: 0.02 },
    );

    // ================= GRAVEYARD =================
    const yards = [
      [SX0 + 0.8, SZ0 + 0.8, CX0 - 1.6, SZ1 - 0.8],
      [CX1 + 1.6, SZ0 + 0.8, SX1 - 0.8, SZ1 - 0.8],
      [CX0 - 1.6, SZ0 + 0.8, CX1 + 1.6, CZ0 - AR - 0.4],
    ];
    for (const [x0, z0, x1, z1] of yards) {
      b.hplate(
        "dirt",
        (x0 + x1) / 2,
        0.14,
        (z0 + z1) / 2,
        x1 - x0,
        z1 - z0,
        0,
        null,
        { tint: [0.5, 0.46, 0.38] },
      );
      for (let k = 0; k < 16; k++)
        b.hplate(
          "decal",
          x0 + r() * (x1 - x0),
          0.15 + k * 0.001,
          z0 + r() * (z1 - z0),
          1.5 + r() * 2,
          1.5 + r() * 2,
          r() * 6,
          K.decal("grime", k + 120),
        );
    }
    // headstones in rough rows (west & east yards), plus crosses and obelisks
    const stones = (x0, z0, x1, z1, seed) => {
      const rr = K.rng(seed);
      for (let z = z0 + 1.2; z < z1 - 1; z += 2.1)
        for (let x = x0 + 1; x < x1 - 0.6; x += 1.7) {
          if (rr() < 0.25) continue;
          const px = x + (rr() - 0.5) * 0.5,
            pz = z + (rr() - 0.5) * 0.4,
            tilt = (rr() - 0.5) * 0.25,
            k = rr();
          const tint = [
            0.55 + rr() * 0.2,
            0.53 + rr() * 0.18,
            0.5 + rr() * 0.15,
          ];
          if (k < 0.55) {
            b.box("granite", px, 0.1, pz, 0.7, 0.9 + rr() * 0.4, 0.14, {
              yaw: tilt,
              tint,
            });
            b.geo(
              "granite",
              new THREE.CylinderGeometry(0.35, 0.35, 0.14, 10, 1, false, 0, PI),
              { x: px, y: 1.05 + 0.1, z: pz, rx: HP, ry: tilt, rz: 0, tint },
            );
          } else if (k < 0.8) {
            b.box("limestone", px, 0.1, pz, 0.12, 1.4, 0.12, {
              yaw: tilt,
              tint,
            });
            b.box("limestone", px, 0.95, pz, 0.6, 0.12, 0.12, {
              yaw: tilt,
              tint,
            });
          } else if (k < 0.9) {
            b.box("granite", px, 0.1, pz, 0.6, 0.5, 0.6, { tint });
            b.cyl("granite", px, 0.6, pz, 0.22, 0.05, 2.2, 4, { tint });
          } else {
            b.box("granite", px, 0.1, pz, 0.8, 0.12, 0.5, {
              yaw: tilt + 1.2,
              tint,
            });
          } // fallen
          if (k < 0.9)
            b.col(px - 0.35, 0, pz - 0.2, px + 0.35, 1.0, pz + 0.2, {
              tag: "grave",
            });
        }
    };
    stones(SX0 + 1, SZ0 + 1, CX0 - 2.2, SZ1 - 5, "sp_w");
    stones(CX1 + 9, SZ0 + 1, SX1 - 1, SZ1 - 10, "sp_e");
    // family mausoleum (west yard, north end) — sealed
    {
      const mx = 218,
        mz = 457;
      b.boxMM("granite", mx - 2.4, 0, mz - 2, mx + 2.4, 3.2, mz + 2, {
        tint: [0.55, 0.53, 0.5],
      });
      b.quadN(
        "granite",
        [mx - 2.6, 3.2, mz + 2.2],
        [mx + 2.6, 3.2, mz + 2.2],
        [mx, 4.4, mz + 2.2],
        [mx, 4.4, mz + 2.2],
        [0, 0, 1],
        { tint: [0.5, 0.48, 0.45] },
      );
      b.quadN(
        "granite",
        [mx - 2.6, 3.2, mz + 2.2],
        [mx, 4.4, mz + 2.2],
        [mx, 4.4, mz - 2.2],
        [mx - 2.6, 3.2, mz - 2.2],
        [-1, 2, 0],
        { tint: [0.5, 0.48, 0.45] },
      );
      b.quadN(
        "granite",
        [mx + 2.6, 3.2, mz - 2.2],
        [mx, 4.4, mz - 2.2],
        [mx, 4.4, mz + 2.2],
        [mx + 2.6, 3.2, mz + 2.2],
        [1, 2, 0],
        { tint: [0.5, 0.48, 0.45] },
      );
      for (const s of [-1, 1])
        K.column(b, mx + s * 1.6, 0, mz + 2.2, 3.2, 0.2, {
          order: "doric",
          tint: [0.6, 0.58, 0.54],
          plinth: false,
          seg: 8,
        });
      b.boxMM("black_iron", mx - 0.8, 0, mz + 2.01, mx + 0.8, 2.4, mz + 2.08, {
        tint: [0.22, 0.2, 0.19],
      });
      b.plate(
        "art",
        mx,
        2.85,
        mz + 2.1,
        0,
        1,
        2.4,
        0.4,
        K.signCell("pc_sp_maus", "KIERNAN", 256, 48, {
          bg: "#6a6660",
          fg: "#2a2824",
          font: "Georgia, serif",
        }),
      );
      b.col(mx - 2.4, 0, mz - 2, mx + 2.4, 3.2, mz + 2.2, { tag: "building" });
    }
    // dead trees
    for (const [tx, tz, h] of [
      [222, 470, 7],
      [214.5, 462, 5.5],
      [262, 456.5, 8],
      [256, 478, 6],
    ]) {
      b.cyl("wood_dark", tx, 0, tz, 0.32, 0.14, h, 7, {
        tint: [0.28, 0.22, 0.18],
      });
      const rr = K.rng(tx * 7 + tz);
      for (let k = 0; k < 6; k++) {
        const a = rr() * PI * 2,
          y0 = h * (0.45 + rr() * 0.45),
          l = 1.2 + rr() * 2;
        b.beam(
          "wood_dark",
          tx,
          y0,
          tz,
          tx + Math.cos(a) * l,
          y0 + 0.6 + rr() * 1.2,
          tz + Math.sin(a) * l,
          0.09,
          0.09,
          { tint: [0.26, 0.2, 0.16] },
        );
      }
      b.col(tx - 0.3, 0, tz - 0.3, tx + 0.3, h, tz + 0.3, { tag: "tree" });
    }
    // Sister Agnes's lean-to against the east churchyard wall + candles & a shrine
    {
      const lx = 264.5,
        lz = 474;
      b.quad(
        "fabric",
        [SX1 - 0.3, 3.0, lz - 2.6],
        [SX1 - 0.3, 3.0, lz + 2.6],
        [lx - 1.6, 1.7, lz + 2.6],
        [lx - 1.6, 1.7, lz - 2.6],
        { tint: [0.5, 0.45, 0.36] },
      );
      b.quad(
        "fabric",
        [lx - 1.6, 1.7, lz - 2.6],
        [lx - 1.6, 1.7, lz + 2.6],
        [SX1 - 0.3, 3.0, lz + 2.6],
        [SX1 - 0.3, 3.0, lz - 2.6],
        { tint: [0.4, 0.36, 0.3] },
      );
      for (const z of [lz - 2.5, lz + 2.5])
        b.pipe("wood", lx - 1.6, 0, z, lx - 1.6, 1.75, z, 0.05, 5, {
          tint: [0.45, 0.35, 0.25],
        });
      b.boxMM("fabric", lx - 1.2, 0.12, lz - 1.8, lx + 0.9, 0.35, lz + 0.2, {
        tint: [0.45, 0.4, 0.32],
      });
      b.boxMM("wood", lx - 2.6, 0.12, lz + 1.2, lx - 1.9, 1.1, lz + 2.2, {
        tint: [0.45, 0.35, 0.25],
      }); // crate altar
      b.box("wood_dark", lx - 2.25, 1.1, lz + 1.7, 0.06, 0.8, 0.06, {
        tint: [0.3, 0.2, 0.14],
      });
      b.box("wood_dark", lx - 2.25, 1.6, lz + 1.7, 0.4, 0.06, 0.06, {
        tint: [0.3, 0.2, 0.14],
      });
      for (let k = 0; k < 9; k++) {
        const cx = lx - 2.5 + (k % 3) * 0.25,
          cz = lz + 1.35 + Math.floor(k / 3) * 0.3;
        b.cyl("wax", cx, 1.1, cz, 0.035, 0.035, 0.06 + (k % 4) * 0.05, 6);
        b.glow(cx, 1.2 + (k % 4) * 0.05, cz, [1, 0.6, 0.25], 0.35);
      }
      b.plate(
        "art",
        SX1 - 0.28,
        2.2,
        lz + 3.6,
        -1,
        0,
        2.2,
        0.9,
        K.signCell(
          "pc_sp_sanct",
          "SANCTUARY\nPRAY OR LEAVE · NO GUNS",
          384,
          150,
          { bg: "#d8ccb0", fg: "#3a2a1a", font: "Georgia, serif" },
        ),
      );
      b.col(lx - 1.7, 0, lz - 2.7, SX1, 1.8, lz - 2.4, {});
      K.anchor(ctx, "agnes", lx - 3.0, 0.12, lz + 0.3, false);
      K.anchor(ctx, "agnes_fire", lx - 3.4, 0.12, lz - 2.4, false);
    }
    b.plate(
      "decal",
      CX0 - 0.62,
      2.4,
      476,
      -1,
      0,
      2.8,
      1.0,
      K.tag("THE DEAD WALK HERE", "#d8d0b8", 512, 128, {
        font: "Georgia, serif",
      }),
    );
    b.plate(
      "decal",
      MID + 6.6,
      1.8,
      CZF + 0.92,
      0,
      1,
      2.0,
      0.8,
      K.tag("MANIACS INSIDE", "#e03030", 256, 96),
    );
    for (let k = 0; k < 8; k++)
      b.burn(
        CX0 + r() * (CX1 - CX0),
        2 + r() * 10,
        r() < 0.5 ? CZF : CZ0 + r() * 20,
        3 + r() * 3,
        0.4,
      );
    K.rubble(b, CX1 + 2.4, 0, 469, 1.6, 1.1, { seed: 71 });

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_stpat_ext";
    K.anchor(ctx, "door", MID, FLOOR, CZF + 0.6, false);
    K.loot(ctx, "campfire", 261.1, 0.12, 471.6, 0, { world: true, pot: true });
    K.loot(ctx, "footlocker", 266.4, 0.12, 476.5, -HP, {
      world: true,
      name: "Sister Agnes's Chest",
      owner: "pc_sp_agnes",
      loot: "footlocker",
    });
    K.skel(ctx, 236.4, 0.12, 486.2, 1.2, "reaching", { world: true });
    K.loot(ctx, "car", 211.6, 0.12, 486.4, HP + 0.1, {
      world: true,
      kind: "taxi",
      wreck: true,
    }); // west of the yard gate (x 215.9..219.1)
  }

  /** Distant proxy: nave, gable, slate roof, apse, buttress rhythm, lancets as dark slots, yard walls. */
