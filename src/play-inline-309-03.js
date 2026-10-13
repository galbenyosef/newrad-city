// play-inline-309 03 — box
// Lines 173-521 of readable/play-inline-309.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("nyl_ext", { grime: 0.55 });
    const b = S.b;
    const rn = P.rng("nyl_ext");
    b.box("sidewalk", 210, 0, 2, 270, 0.06, 33, {
      segLen: 8,
      grime: 0.5,
      noAO: true,
    });
    // ---------------- base block with the ground-floor arcade ----------------
    b.box("limestone_dark", BX0, 0, BZ0, BX1, 40, BZ1, { segLen: 8 });
    S.col(BX0 - 0.4, 0, BZ0 - 0.4, BX1 + 0.4, 41.3, BZ1 + 0.4);
    const baseOpts = { winStart: 11.6, pierFrom: 10.6, bay: 2.9 };
    gothicFace(S, "s", BX0, BX1, BZ1, 0, 40, baseOpts);
    gothicFace(S, "n", BX0, BX1, BZ0, 0, 40, { winStart: 2.2 });
    gothicFace(S, "e", BZ0, BZ1, BX1, 0, 40, { winStart: 2.2 });
    gothicFace(S, "w", BZ0, BZ1, BX0, 0, 40, { winStart: 2.2 });
    // 23rd Street arcade: tall pointed arches, the central one the entrance
    const FS = P.face(S, "s", BX0, BX1, BZ1);
    FS.box("limestone", -0.4, FS.len + 0.4, 0, 10.6, 0, 0.9, { segLen: 4 });
    FS.box("limestone", -0.5, FS.len + 0.5, 10.6, 11.4, 0, 1.1, { seg: false });
    const nA = 9,
      aw = FS.len / nA;
    for (let i = 0; i < nA; i++) {
      const u = (i + 0.5) * aw,
        w = aw - 1.3,
        h = 8.6;
      const ash = P.archShape(w, h, w * 0.6);
      b.extrude(
        i === 4 ? "black_glass" : "paint_black",
        ash,
        0.05,
        FS.mat(u, 0, 0.12),
        { uv: "box", noAO: true },
      );
      const ring = P.archShape(w + 0.6, h + 0.35, w * 0.6 + 0.3);
      ring.holes.push(P.archShape(w, h, w * 0.6));
      b.extrude("limestone", ring, 0.35, FS.mat(u, 0, 0.9));
      // shopfront / door infill
      if (i === 4) {
        FS.box("bronze", u - w / 2 + 0.2, u + w / 2 - 0.2, 0, 4.4, 0.15, 0.3, {
          seg: false,
        });
        FS.box("paint_black", u - 1.2, u + 1.2, 0.05, 3.6, 0.3, 0.33, {
          seg: false,
          noAO: true,
        });
        for (const s of [-1, 1])
          FS.box(
            "bronze",
            u + s * 1.6 - 0.35,
            u + s * 1.6 + 0.35,
            0.05,
            3.5,
            0.3,
            0.6 + (s > 0 ? 0.6 : 0.1),
            { seg: false, ry: s * 0.3 },
          );
        // tracery transom over the doors
        for (let k = -2; k <= 2; k++)
          FS.box(
            "bronze",
            u + k * 0.5 - 0.04,
            u + k * 0.5 + 0.04,
            4.4,
            7.4,
            0.14,
            0.2,
            { seg: false },
          );
        const sign = P.texMat(
          "nyl_name",
          P.signTex(
            "nyl_name",
            ["NEW YORK LIFE INSURANCE COMPANY"],
            "engraved",
            1024,
            96,
            { bg: "#b9b09a", fg: "rgba(50,42,32,0.9)" },
          ),
          { rough: 0.9 },
        );
        FS.quad(sign, u, 10.1, 14, 0.8, 0.92);
      } else {
        FS.box(
          rn() < 0.4 ? "glass_broken" : "glass_dark",
          u - w / 2 + 0.3,
          u + w / 2 - 0.3,
          1.0,
          6.4,
          0.14,
          0.18,
          { seg: false, noAO: true },
        );
        FS.box("bronze", u - w / 2 + 0.2, u + w / 2 - 0.2, 0, 1.0, 0.12, 0.35, {
          seg: false,
        });
        if (i % 3 === 1)
          for (let k = 0; k < 4; k++)
            FS.box(
              "wood_rotten",
              u - w / 2 + 0.1,
              u + w / 2 - 0.1,
              1.3 + k * 1.2,
              1.6 + k * 1.2,
              0.2,
              0.26,
              { seg: false, rz: (rn() - 0.5) * 0.1 },
            );
      }
    }
    // ---------------- setbacks + tower ----------------
    towerBlock(S, 216, 5.5, 264, 29.5, 40, 56, { winStart: 41.2 });
    towerBlock(S, 222, 8, 258, 27, 56, 72, { winStart: 57.2 });
    towerBlock(S, 228, 10, 252, 25, 72, 94, {
      winStart: 73.2,
      cornerPinnacles: true,
      bay: 2.4,
    });
    // belvedere: open gothic arcade stage under the pyramid
    const TX0 = 231,
      TX1 = 249,
      TZ0 = 11,
      TZ1 = 24,
      TY0 = 94,
      TY1 = 101;
    b.box(
      "limestone_dark",
      TX0 + 1.2,
      TY0,
      TZ0 + 1.2,
      TX1 - 1.2,
      TY1,
      TZ1 - 1.2,
      { segLen: 4 },
    );
    for (const [sd, a0, a1, cc] of [
      ["s", TX0, TX1, TZ1],
      ["n", TX0, TX1, TZ0],
      ["e", TZ0, TZ1, TX1],
      ["w", TZ0, TZ1, TX0],
    ]) {
      const F = P.face(S, sd, a0, a1, cc);
      const m = Math.round(F.len / 2.2),
        w = F.len / m;
      for (let k = 0; k <= m; k++)
        F.box("limestone", k * w - 0.35, k * w + 0.35, TY0, TY1, -0.1, 0.5);
      for (let k = 0; k < m; k++) {
        const ring = P.archShape(w - 0.2, 1.6, 0.9);
        ring.holes.push(P.archShape(w - 0.7, 1.35, 0.75));
        S.b.extrude(
          "limestone",
          ring,
          0.3,
          F.mat((k + 0.5) * w, TY1 - 2.0, 0.1),
        );
      }
      F.box("limestone", -0.4, F.len + 0.4, TY1 - 0.4, TY1 + 0.4, -0.1, 0.7, {
        seg: false,
      });
      F.box("limestone", -0.2, F.len + 0.2, TY0, TY0 + 1.1, -0.1, 0.55, {
        seg: false,
      });
    }
    S.col(TX0, TY0, TZ0, TX1, TY1 + 0.4, TZ1);
    // ---------------- the GILDED PYRAMID ----------------
    const PCX = (TX0 + TX1) / 2,
      PCZ = (TZ0 + TZ1) / 2,
      PHX = (TX1 - TX0) / 2 + 0.4,
      PHZ = (TZ1 - TZ0) / 2 + 0.4,
      PY0 = TY1 + 0.4,
      PH = 17;
    b.geo("gold_tiles", pyramidGeo(PHX, PHZ, PH, false), P.m4(PCX, PY0, PCZ), {
      grime: 0.25,
      noAO: true,
    });
    NL.pyrWorld = { cx: PCX, cz: PCZ, hx: PHX, hz: PHZ, y0: PY0, h: PH };
    // hip ridges (bronze rolls) + base cornice
    for (const [sx, sz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      b.rod(
        "bronze",
        [PCX + sx * PHX, PY0, PCZ + sz * PHZ],
        [PCX, PY0 + PH, PCZ],
        0.12,
        5,
      );
    b.box(
      "limestone",
      PCX - PHX - 0.3,
      PY0 - 0.3,
      PCZ - PHZ - 0.3,
      PCX + PHX + 0.3,
      PY0 + 0.1,
      PCZ + PHZ + 0.3,
      { seg: false },
    );
    // torn-away tiles on the north-east face: dark voids with bared ribs
    const faceNE = (t0, t1, s0, s1) => {
      // point on the east face: along-edge s (0..1 from north to south), up t (0 base .. 1 apex)
      const pt = (s, t) => {
        const x = PCX + PHX * (1 - t),
          z = PCZ + (-PHZ + 2 * PHZ * s) * (1 - t),
          y = PY0 + PH * t;
        return new THREE.Vector3(x + 0.06, y, z);
      };
      const g = new THREE.BufferGeometry().setFromPoints([
        pt(s0, t0),
        pt(s1, t0),
        pt(s1, t1),
        pt(s0, t0),
        pt(s1, t1),
        pt(s0, t1),
      ]);
      g.computeVertexNormals();
      b.geo("paint_black", g, new THREE.Matrix4(), { noAO: true, grime: 0 });
      for (let k = 0; k < 4; k++) {
        const s = s0 + ((s1 - s0) * (k + 0.5)) / 4;
        const a = pt(s, t0),
          c = pt(s, t1);
        a.x += 0.1;
        c.x += 0.1;
        b.rod("rust", a, c, 0.06, 4);
      }
      const a = pt(s0, (t0 + t1) / 2),
        c = pt(s1, (t0 + t1) / 2);
      a.x += 0.12;
      c.x += 0.12;
      b.rod("rust", a, c, 0.05, 4);
    };
    faceNE(0.18, 0.42, 0.12, 0.38);
    faceNE(0.5, 0.62, 0.3, 0.48);
    // dormers (one per face, gothic lancets)
    for (const [dx, dz, ry] of [
      [0, 1, 0],
      [0, -1, PI],
      [1, 0, HP],
      [-1, 0, -HP],
    ]) {
      const t = 0.25,
        ex = PCX + dx * PHX * (1 - t),
        ez = PCZ + dz * PHZ * (1 - t),
        ey = PY0 + PH * t;
      const M = P.m4(ex, ey - 0.6, ez, ry);
      b.geo(
        "gold",
        new THREE.BoxGeometry(1.6, 2.6, 1.6).translate(0, 1.3, -0.4),
        M,
        { noAO: true },
      );
      b.geo(
        "gold_tiles",
        new THREE.ConeGeometry(1.2, 1.6, 4)
          .rotateY(PI / 4)
          .translate(0, 3.4, -0.4),
        M,
        { noAO: true },
      );
      b.geo(
        "paint_black",
        new THREE.BoxGeometry(0.7, 1.6, 0.05).translate(0, 1.3, 0.42),
        M,
        { noAO: true },
      );
    }
    // the lantern + finial
    const LY = PY0 + PH - 1.4;
    b.cyl("gold", PCX, LY, PCZ, 1.0, 1.15, 2.6, 8);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + PI / 8;
      b.box(
        "lamp_dim",
        PCX + Math.cos(a) * 1.02 - 0.18,
        LY + 0.8,
        PCZ + Math.sin(a) * 1.02 - 0.18,
        PCX + Math.cos(a) * 1.02 + 0.18,
        LY + 2.0,
        PCZ + Math.sin(a) * 1.02 + 0.18,
        { ry: -a, seg: false, noAO: true },
      );
    }
    b.cyl("gold", PCX, LY + 2.6, PCZ, 0.05, 1.25, 1.8, 8);
    b.sphere("gold", PCX, LY + 4.6, PCZ, 0.35, { ws: 10, hs: 8 });
    b.cyl("gold", PCX, LY + 4.9, PCZ, 0.02, 0.08, 2.4, 6);
    S.glow(PCX, LY + 1.4, PCZ, 0xffd890, 3.0, {
      dayFactor: 0.15,
      flicker: 0.1,
    });
    // pinnacle crowns on the setback corners
    for (const [x, z, y] of [
      [216, 5.5, 56],
      [264, 5.5, 56],
      [216, 29.5, 56],
      [264, 29.5, 56],
      [222, 8, 72],
      [258, 8, 72],
      [222, 27, 72],
      [258, 27, 72],
    ]) {
      b.box("limestone", x - 0.5, y + 1.3, z - 0.5, x + 0.5, y + 3.4, z + 0.5, {
        seg: false,
      });
      b.cyl("limestone", x, y + 3.4, z, 0.04, 0.6, 2.8, 4, { ry: PI / 4 });
    }
    // ---------------- den signs at the door ----------------
    const warn = P.texMat(
      "nyl_warn",
      P.signTex(
        "nyl_warn",
        ["BEAR", "DO NOT ENTER", "NOT KIDDING"],
        "raider",
        512,
        384,
        { fg: "#e8e0c8" },
      ),
      { transparent: true },
    );
    FS.quad(warn, FS.len / 2 - 5.2, 3.2, 3.2, 2.4, 0.95);
    const claw = P.texMat("nyl_claw", P.clawTex(), { transparent: true });
    FS.quad(claw, FS.len / 2 + 1.6, 2.0, 1.6, 1.6, 0.62);
    FS.quad(claw, FS.len / 2 - 1.8, 1.6, 1.3, 1.3, 0.62);
    const blood = P.texMat("nyl_blood", P.bloodTex(), { transparent: true });
    b.quad(blood, DOOR_X - 1.2, 0.075, BZ1 + 1.6, 2.6, 2.6, { rx: -HP });
    b.quad(blood, DOOR_X + 2.4, 0.075, BZ1 + 0.9, 1.6, 1.6, { rx: -HP });
    E.bones(b, DOOR_X, 0.06, BZ1 + 1.8, 2.2, 18);
    S.prop("skeleton", DOOR_X + 3.2, 0.06, BZ1 + 2.6, 2.4, {
      pose: "reaching",
    });
    E.pike(b, DOOR_X - 4.8, 0.06, BZ1 + 1.5, 2.0);
    S.prop("car", DOOR_X + 12, 0, BZ1 + 3.6, 1.45, {
      kind: "coupe",
      wreck: true,
      burnt: true,
      explodable: false,
    });
    // anchors
    S.anchor("ext_entrance", DOOR_X, 0, BZ1 + 2.6, PI);
    S.anchor("ext_pyramid", PCX, PY0 + PH, PCZ, 0);
    S.build({ shadow: true, lod: 340 });
    return { S, doorX: DOOR_X, doorZ: BZ1 };
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
