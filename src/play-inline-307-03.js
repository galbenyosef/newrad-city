// play-inline-307 03 — atop
// Lines 278-860 of readable/play-inline-307.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("tc_ext", { grime: 0.5 });
    const b = S.b;
    const rn = P.rng("tc_ext");
    // ---------------- the terrace (retaining walls) ----------------
    const PX0 = 293,
      PX1 = 329,
      PZ0 = -177.5,
      PZ1 = -147.5,
      SX0 = 297.6,
      SX1 = 304.4,
      SZ = -153.15;
    b.box("granite_dark", PX0, 0, PZ0, PX1, TY, SZ, { segLen: 4 });
    b.box("granite_dark", PX0, 0, SZ, SX0, TY, PZ1, { segLen: 4 });
    b.box("granite_dark", SX1, 0, SZ, PX1, TY, PZ1, { segLen: 4 });
    S.col(PX0, 0, PZ0, PX1, TY, SZ);
    S.col(PX0, 0, SZ, SX0, TY, PZ1);
    S.col(SX1, 0, SZ, PX1, TY, PZ1);
    // rustication + blind arches on the street faces
    const FW = P.face(S, "w", PZ0, PZ1, PX0),
      FSo = P.face(S, "s", PX0, PX1, PZ1),
      FE = P.face(S, "e", PZ0, PZ1, PX1);
    for (const F of [FW, FSo, FE]) {
      for (let y = 0.6; y < TY; y += 0.6)
        F.box("granite", 0, F.len, y - 0.03, y + 0.03, -0.02, 0.03, {
          seg: false,
          grime: 0.8,
        });
      F.box("limestone", -0.2, F.len + 0.2, TY - 0.35, TY, 0, 0.35, {
        seg: false,
      });
      for (let u = 3; u < F.len - 2; u += 4.2) {
        if (F === FSo && u + PX0 > SX0 - 1.5 && u + PX0 < SX1 + 1.5) continue;
        F.box("granite_dark", u - 1.2, u + 1.2, 0, 2.2, -0.12, 0.0, {
          seg: false,
        });
        F.arch("limestone", u, 2.2, 1.2, 0.22, 0, 0.12);
        F.halfDisc("granite_dark", u, 2.2, 1.2, -0.1);
      }
    }
    // stone balustrade along the terrace edges (south + west) and the stair cheeks
    const bal = (pts) =>
      S.rail("limestone", pts, TY, 1.0, {
        baluster: true,
        r: 0.09,
        step: 0.32,
      });
    bal([
      [PX0 + 0.2, SZ + 5.5],
      [PX0 + 0.2, -165.2],
    ]);
    bal([
      [PX0 + 0.2, PZ1 - 0.2],
      [SX0 - 0.1, PZ1 - 0.2],
    ]);
    bal([
      [SX1 + 0.1, PZ1 - 0.2],
      [AX0 - 0.5, PZ1 - 0.2],
    ]);
    // the grand stair up from the street
    S.stairs(
      "granite",
      (SX0 + SX1) / 2,
      PZ1 + 0.02,
      "n",
      SX1 - SX0 - 0.2,
      0,
      TY,
      { nosing: "limestone" },
    );
    for (const x of [SX0 + 0.05, SX1 - 0.05]) {
      b.box("limestone", x - 0.25, 0, SZ, x + 0.25, TY + 1.0, PZ1, {
        seg: false,
      });
      S.col(x - 0.25, 0, SZ, x + 0.25, TY + 1.0, PZ1, { walkable: false });
      b.cyl("limestone", x, TY + 1.0, SZ + 0.2, 0.3, 0.3, 0.3, 8);
      b.sphere("limestone", x, TY + 1.55, SZ + 0.2, 0.25, { ws: 8, hs: 6 });
    }
    // lamp posts at the stair head (one still burning)
    for (const [x, lit] of [
      [SX0 - 0.8, true],
      [SX1 + 0.8, false],
    ]) {
      b.cyl("iron", x, TY, SZ - 0.6, 0.08, 0.12, 3.6, 6);
      b.cyl(
        lit ? "lamp_dim" : "glass_dark",
        x,
        TY + 3.6,
        SZ - 0.6,
        0.18,
        0.12,
        0.4,
        6,
      );
      b.cyl("iron", x, TY + 4.0, SZ - 0.6, 0.02, 0.24, 0.3, 6);
      if (lit) S.glow(x, TY + 3.8, SZ - 0.6, 0xffc880, 1.4, { flicker: 0.3 });
    }
    // ---------------- the greens (court) ----------------
    b.box("dirt", PX0 + 0.3, TY, SZ + 0.2, AX0 - 0.3, TY + 0.06, BZ1 - 0.3, {
      segLen: 4,
      noAO: true,
    });
    b.box("grass", 296, TY + 0.06, -163.5, 310.5, TY + 0.1, -157.5, {
      segLen: 4,
      noAO: true,
    });
    S.rail(
      "iron",
      [
        [296, -163.5],
        [310.5, -163.5],
        [310.5, -157.5],
        [296, -157.5],
        [296, -163.5],
      ],
      TY + 0.06,
      0.9,
      { r: 0.02, step: 0.18, col: true },
    );
    for (const [tx, tz] of [
      [299, -161],
      [307, -160],
    ]) {
      b.cyl("bark", tx, TY, tz, 0.16, 0.26, 4.5, 7);
      for (let i = 0; i < 6; i++) {
        const a = rn() * TAU,
          L = 1.2 + rn() * 1.6;
        b.rod(
          "bark",
          [tx, TY + 2.5 + rn() * 1.8, tz],
          [tx + Math.cos(a) * L, TY + 4 + rn() * 1.8, tz + Math.sin(a) * L],
          0.06,
          4,
          { rTop: 0.02 },
        );
      }
    }
    // raider camp on the greens: lean-to tarps, fire, mattresses, tires
    for (const [x, z, ry] of [
      [295.5, -155.8, 0.3],
      [308.5, -154.8, -0.4],
    ]) {
      const M = P.m4(x, TY, z, ry);
      b.geo(
        "fabric",
        new THREE.BoxGeometry(3.0, 0.04, 2.4)
          .rotateX(0.55)
          .translate(0, 1.35, 0),
        M,
        { grime: 0.7 },
      );
      for (const s of [-1, 1])
        b.geo(
          "wood_rotten",
          new THREE.CylinderGeometry(0.04, 0.05, 2.2, 5).translate(
            s * 1.4,
            1.1,
            -0.9,
          ),
          M,
        );
      E.mattress(b, x, TY + 0.06, z, ry);
    }
    S.prop("campfire", 302.2, TY + 0.06, -156.8, 0, { spit: true });
    S.prop("barrel", 311.2, TY + 0.06, -150.2, 0, { burning: true });
    S.prop("barrel", 294.2, TY + 0.06, -164.2, 0, { burning: true });
    for (let i = 0; i < 4; i++)
      b.torus(
        "rubber",
        304 + i * 0.3,
        TY + 0.14 + i * 0.22,
        -150.5,
        0.34,
        0.12,
        TAU,
        { rx: HP, ts: 12, rs: 6 },
      );
    // scrap gate across the stair head + skull pikes
    for (let i = 0; i < 5; i++)
      b.box(
        i % 2 ? "corrugated" : "rust",
        SX0 + i * 1.36,
        TY,
        SZ - 0.9,
        SX0 + i * 1.36 + 1.3,
        TY + 2.2 + (i % 3) * 0.3,
        SZ - 0.8,
        { seg: false, rz: (rn() - 0.5) * 0.08, grime: 0.8 },
      );
    b.box("rust", SX0 + 2.1, TY, SZ - 1.0, SX0 + 4.7, TY + 0.1, SZ - 0.7, {
      seg: false,
    });
    // (the gate stands half open — the middle panels are pushed aside)
    for (const x of [SX0 - 0.6, SX1 + 0.6, 296, 309])
      E.pike(b, x, TY, SZ - 1.4 - (x > 305 ? 0.3 : 0), 2.4);
    E.cage(b, 293.8, TY + 5.2, -151, { bones: true, chain: 0.4 });
    b.rod("rust", [293.2, TY, -151], [293.2, TY + 5.3, -151], 0.07, 5);
    b.rod("rust", [293.2, TY + 5.25, -151], [293.9, TY + 5.25, -151], 0.05, 4);
    const gsign = P.texMat(
      "tc_gsign",
      P.signTex(
        "tc_gsign",
        ["THE TUDOR COURT", "KNEEL OR BLEED"],
        "raider",
        512,
        192,
        { fg: "#d02a1e" },
      ),
      { transparent: true },
    );
    b.quad(gsign, (SX0 + SX1) / 2, TY + 1.7, SZ - 0.76, 3.6, 1.35, { ry: 0 });
    const ssign = P.texMat(
      "tc_ssign",
      P.signTex(
        "tc_ssign",
        ["TOLL: 20 SCRIP", "OR YOUR TEETH"],
        "raider",
        512,
        192,
        { fg: "#e8d8b0" },
      ),
      { transparent: true },
    );
    b.quad(ssign, SX1 + 1.8, 2.2, PZ1 + 0.02, 2.2, 0.85, { ry: 0 });
    // ---------------- Windsor wing (B) ----------------
    b.box("tudor_brick", BX0, TY, BZ0, BX1, BTOP, BZ1, { segLen: 6 });
    S.col(BX0, TY, BZ0, BX1, BTOP + 0.9, BZ1);
    tudorFace(S, "s", BX0, BX1, BZ1, TY, BTOP, {
      courses: [TY + 3.4, TY + 12.9, BTOP - 3.2],
      winStart: TY + 4.4,
    });
    tudorFace(S, "w", BZ0, BZ1, BX0, TY, BTOP, {
      courses: [TY + 3.4, TY + 12.9, BTOP - 3.2],
    });
    tudorFace(S, "n", BX0, BX1, BZ0, TY, BTOP, {
      courses: [TY + 3.4, TY + 12.9, BTOP - 3.2],
    });
    // ground-floor pointed windows on the court side
    const FBs = P.face(S, "s", BX0, BX1, BZ1);
    for (let u = 2.4; u < FBs.len - 1.5; u += 3.2)
      pointedWindow(FBs, u, TY + 0.6, 1.2, 2.6, {
        glass: "stained",
        rise: 0.7,
      });
    // the second (smaller) TUDOR CITY sign on the wing roof, facing south
    const neon2 = P.texMat("tc_neon2", P.neonLetterTex("TUDOR CITY", [2, 7]), {
      emissive: 1.6,
      transparent: true,
      alphaTest: 0.05,
      depthWrite: false,
    });
    for (let i = 0; i < 6; i++) {
      const x = 296 + i * 3;
      b.rod(
        "iron",
        [x, BTOP + 0.9, BZ1 - 1.2],
        [x, BTOP + 4.6, BZ1 - 1.2],
        0.04,
        4,
      );
      b.rod(
        "iron",
        [x, BTOP + 0.9, BZ1 - 2.8],
        [x, BTOP + 4.6, BZ1 - 1.25],
        0.03,
        3,
      );
    }
    b.box(
      "iron",
      295.5,
      BTOP + 1.6,
      BZ1 - 1.26,
      311.5,
      BTOP + 1.7,
      BZ1 - 1.14,
      { seg: false },
    );
    b.box(
      "iron",
      295.5,
      BTOP + 4.4,
      BZ1 - 1.26,
      311.5,
      BTOP + 4.5,
      BZ1 - 1.14,
      { seg: false },
    );
    b.quad(neon2, 303.5, BTOP + 3.05, BZ1 - 1.1, 16, 3.0, { ry: 0 });
    E.waterTower(b, 298, BTOP + 0.9, -171, 1.0);
    for (const [x, z] of [
      [306, -172],
      [309, -169.5],
    ]) {
      b.box(
        "tudor_brick",
        x - 0.6,
        BTOP,
        z - 0.9,
        x + 0.6,
        BTOP + 3.2,
        z + 0.9,
        { seg: false },
      );
      b.box(
        "limestone",
        x - 0.7,
        BTOP + 3.2,
        z - 1.0,
        x + 0.7,
        BTOP + 3.4,
        z + 1.0,
        { seg: false },
      );
    }
    // collapsed parapet corner (south-west) — rubble fan on the terrace below
    D.rubble(S, 294.6, TY + 0.06, -163.4, 1.8, {
      n: 10,
      slab: true,
      slabKey: "limestone",
      rebar: true,
      col: true,
    });
    // ---------------- Tudor Tower (A) ----------------
    b.box("tudor_brick", AX0, TY, AZ0, AX1, ATOP, AZ1, { segLen: 6 });
    S.col(AX0, TY, AZ0, AX1, ATOP, AZ1);
    const courses = [TY + 3.4, TY + 16.2, TY + 35.4, ATOP - 3.2];
    tudorFace(S, "s", AX0, AX1, AZ1, TY, ATOP, { courses, winStart: TY + 4.4 });
    tudorFace(S, "e", AZ0, AZ1, AX1, TY, ATOP, { courses });
    tudorFace(S, "n", AX0, AX1, AZ0, TY, ATOP, { courses });
    tudorFace(S, "w", AZ0, AZ1, AX0, TY, ATOP, {
      courses,
      winStart: TY + 4.4,
      skip: (u, y) =>
        (y < BTOP + 1 && u < 11.2) ||
        (y < TY + 10 && Math.abs(u - (ENT_Z - AZ0)) < 2.4),
    });
    // lobby: pointed stained-glass windows on the tower's south + west faces
    const FAs = P.face(S, "s", AX0, AX1, AZ1),
      FAw = P.face(S, "w", AZ0, AZ1, AX0);
    for (let u = 2.2; u < FAs.len - 1.5; u += 3.0)
      pointedWindow(FAs, u, TY + 0.7, 1.3, 3.0, {
        glass: "stained",
        rise: 0.8,
      });
    // the lobby portal: limestone Tudor arch, oak doors, heraldic panel, stained window above
    const eu = ENT_Z - AZ0; // u along the west face (from the north end)
    FAw.box("limestone", eu - 2.2, eu + 2.2, TY, TY + 5.6, 0, 0.6);
    const pa = archShape(2.4, 3.6, 0.9);
    FAw.S.b.extrude("wood_dark", pa, 0.08, FAw.mat(eu, TY, 0.6), { uv: "box" });
    const pr = archShape(3.2, 4.2, 1.1);
    pr.holes.push(archShape(2.4, 3.6, 0.9));
    FAw.S.b.extrude("limestone", pr, 0.3, FAw.mat(eu, TY - 0.001, 0.6));
    FAw.box("iron", eu - 0.05, eu + 0.05, TY + 0.1, TY + 3.1, 0.66, 0.72, {
      seg: false,
    });
    for (const s of [-1, 1])
      FAw.box(
        "iron",
        eu + s * 0.35 - 0.08,
        eu + s * 0.35 + 0.08,
        TY + 1.3,
        TY + 1.5,
        0.66,
        0.74,
        { seg: false },
      );
    pointedWindow(FAw, eu, TY + 6.2, 2.0, 3.4, {
      glass: "stained",
      rise: 1.0,
      d: 0.02,
    });
    const crest = P.texMat(
      "tc_crest",
      P.signTex("tc_crest", ["TUDOR", "TOWER"], "engraved", 256, 128, {
        bg: "#c8bca4",
      }),
      { rough: 0.9 },
    );
    FAw.quad(crest, eu, TY + 4.9, 1.8, 0.8, 0.62);
    S.glow(AX0 - 1.2, TY + 3.0, ENT_Z, 0xffc070, 1.6, { flicker: 0.2 });
    // raider banners ("KNEEL") on the tower
    for (const [u, y] of [
      [eu - 4.5, TY + 9],
      [eu + 3.6, TY + 12],
      [eu - 6.0, TY + 22],
    ]) {
      const bgeo = new THREE.PlaneGeometry(2.2, 4.4, 1, 6);
      {
        const p = bgeo.attributes.position;
        for (let v = 0; v < p.count; v++)
          p.setZ(v, Math.sin(p.getY(v) * 1.3 + u) * 0.08);
      }
      FAw.S.b.geo("tapestry", bgeo, FAw.mat(u, y, 0.16), {
        uv: "keep",
        noAO: true,
      });
      FAw.box("wood_rotten", u - 1.3, u + 1.3, y + 2.2, y + 2.32, 0.05, 0.25, {
        seg: false,
      });
    }
    // corner turrets (NE / SE / SW) rising above the parapet
    turret(S, AX1 - 0.2, AZ1 - 0.2, ATOP - 18, ATOP + 5.2, 1.25);
    turret(S, AX1 - 0.2, AZ0 + 0.2, ATOP - 18, ATOP + 5.2, 1.25);
    turret(S, AX0 + 0.2, AZ1 - 0.2, ATOP - 18, ATOP + 5.2, 1.25);
    turret(S, BX0 + 0.2, BZ1 - 0.2, BTOP - 12, BTOP + 3.6, 1.0);
    // ---------------- the walkable tower roof + gabled penthouse ----------------
    b.box(
      "tar",
      AX0 + 0.2,
      ATOP - 0.05,
      AZ0 + 0.2,
      AX1 - 0.2,
      ATOP + 0.02,
      AZ1 - 0.2,
      { segLen: 4, noAO: true },
    );
    // parapet colliders (the visual crenellation comes from tudorFace)
    S.col(AX0, ATOP, AZ0, AX0 + 0.3, ATOP + 1.2, AZ1, { walkable: false });
    S.col(AX1 - 0.3, ATOP, AZ0, AX1, ATOP + 1.2, AZ1, { walkable: false });
    S.col(AX0, ATOP, AZ0, AX1, ATOP + 1.2, AZ0 + 0.3, { walkable: false });
    S.col(AX0, ATOP, AZ1 - 0.3, AX1, ATOP + 1.2, AZ1, { walkable: false });
    const PHX0 = 317,
      PHX1 = 325,
      PHZ0 = -173,
      PHZ1 = -163;
    b.box("tudor_brick", PHX0, ATOP, PHZ0, PHX1, ATOP + 3.4, PHZ1, {
      segLen: 3,
    });
    S.col(PHX0, ATOP, PHZ0, PHX1, ATOP + 3.4, PHZ1, { walkable: false });
    gableRoof(
      S,
      PHX0 - 0.3,
      PHZ0 - 0.3,
      PHX1 + 0.3,
      PHZ1 + 0.3,
      ATOP + 3.4,
      3.6,
      true,
    );
    const FP = P.face(S, "w", PHZ0, PHZ1, PHX0);
    FP.box("wood_dark", 4.1, 5.9, ATOP, ATOP + 2.4, 0, 0.08, { seg: false });
    FP.box("limestone", 3.9, 6.1, ATOP + 2.4, ATOP + 2.65, 0, 0.14, {
      seg: false,
    });
    for (const u of [1.6, 8.4])
      FP.window(u, ATOP + 1.0, 0.9, 1.5, {
        style: "dark",
        frame: "limestone",
        sill: "limestone",
        mull: true,
      });
    for (const [x, z] of [
      [326.4, -160.2],
      [313.6, -174.6],
    ]) {
      b.box(
        "tudor_brick",
        x - 0.7,
        ATOP,
        z - 0.7,
        x + 0.7,
        ATOP + 3.6,
        z + 0.7,
        { seg: false },
      );
      b.box(
        "limestone",
        x - 0.8,
        ATOP + 3.6,
        z - 0.8,
        x + 0.8,
        ATOP + 3.8,
        z + 0.8,
        { seg: false },
      );
      S.col(x - 0.7, ATOP, z - 0.7, x + 0.7, ATOP + 3.8, z + 0.7, {
        walkable: false,
      });
    }
    // roof clutter: raider lookout (sandbags + mattress), crates, the breaker box
    E.sandbags(S, 313.6, -160.2, 316.4, -160.2, ATOP, 3);
    E.mattress(b, 322.2, ATOP + 0.02, -160.6, HP);
    S.prop("footlocker", 326.4, ATOP, -170.5, -HP, {
      loot: "footlocker",
      name: "Lookout's Footlocker",
    });
    b.box("metal", 316.2, ATOP + 0.9, -175.7, 317.6, ATOP + 2.3, -175.5, {
      seg: false,
    });
    b.box(
      "paint_black",
      316.5,
      ATOP + 1.2,
      -175.5,
      317.3,
      ATOP + 2.0,
      -175.45,
      { seg: false, noAO: true },
    );
    TC.breakerPos = S.W(316.9, ATOP + 1.5, -175.2);
    b.rod(
      "iron",
      [316.9, ATOP + 2.3, -175.6],
      [313.4, ATOP + 3.5, -175.2],
      0.03,
      3,
    );
    // ---------------- THE SIGN: steel frame + neon letters (facing west) ----------------
    const SGX = 313.2,
      SGZ0 = -174.4,
      SGZ1 = -159.6,
      SGY0 = ATOP + 1.4,
      SGY1 = ATOP + 8.2;
    for (let z = SGZ0; z <= SGZ1 + 0.01; z += (SGZ1 - SGZ0) / 6) {
      b.rod("iron", [SGX, ATOP, z], [SGX, SGY1, z], 0.06, 4);
      b.rod("iron", [SGX + 2.2, ATOP, z], [SGX, SGY1 - 0.6, z], 0.045, 4);
      b.rod("iron", [SGX + 2.2, ATOP, z], [SGX, ATOP + 3.2, z], 0.035, 3);
    }
    for (const y of [SGY0, (SGY0 + SGY1) / 2, SGY1])
      b.box("iron", SGX - 0.05, y - 0.06, SGZ0, SGX + 0.05, y + 0.06, SGZ1, {
        seg: false,
      });
    S.col(SGX - 0.1, ATOP, SGZ0, SGX + 2.3, SGY1, SGZ1, { walkable: false });
    // two letter planes: the full "lit" sign and the half-dead one (80_content toggles them)
    const signGeo = () =>
      new THREE.PlaneGeometry(SGZ1 - SGZ0 + 0.6, SGY1 - SGY0 - 0.4);
    const mkSign = (key, tex) => {
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        emissive: 0xffffff,
        emissiveMap: tex,
        emissiveIntensity: 1.8,
        transparent: true,
        alphaTest: 0.05,
        depthWrite: false,
        side: THREE.DoubleSide,
        color: 0xffffff,
      });
      const mesh = new THREE.Mesh(signGeo(), m);
      mesh.position.set(SGX - 0.12, (SGY0 + SGY1) / 2 + 0.2, (SGZ0 + SGZ1) / 2);
      mesh.rotation.y = -HP;
      mesh.name = key;
      mesh.renderOrder = 2;
      return mesh;
    };
    TC.signLit = mkSign("tc_sign_lit", P.neonLetterTex("TUDOR CITY", []));
    TC.signDim = mkSign(
      "tc_sign_dim",
      P.neonLetterTex("TUDOR CITY", [1, 2, 3, 7, 8]),
    );
    TC.signLit.visible = false;
    S._extra = [TC.signLit, TC.signDim];
    TC.signGlows = [];
    // lettering glow sprites (dim state uses the lit subset)
    TC.glowSpots = [];
    for (let i = 0; i < 10; i++) {
      const z = SGZ1 - 0.9 - (i * (SGZ1 - SGZ0 - 1.8)) / 9;
      TC.glowSpots.push({
        pos: S.W(SGX - 0.8, (SGY0 + SGY1) / 2, z),
        dead: [1, 2, 3, 7, 8].indexOf(i) >= 0,
      });
    }
    // anchors
    S.anchor("ext_entrance", AX0 - 2.4, TY, ENT_Z, HP);
    S.anchor("ext_stairs", (SX0 + SX1) / 2, 0, PZ1 + 3, PI);
    S.anchor("ext_roof", 315.2, ATOP, -166, HP);
    S.anchor("ext_breaker", 316.9, ATOP, -174.4, 0);
    S.anchor("ext_guard1", SX0 + 1.2, TY, SZ - 2.2, PI);
    S.anchor("ext_guard2", 309.6, TY, -157.6, PI);
    S.build({ shadow: true, lod: 320 });
    for (const o of S._extra) S.root.add(o);
    return {
      S,
      doorX: AX0,
      doorZ: ENT_Z,
      roofDoor: { x: PHX0 - 0.1, y: ATOP + 1.4, z: -168 },
    };
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
