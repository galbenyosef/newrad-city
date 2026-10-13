// play-inline-150 03 — box
// Lines 84-859 of readable/play-inline-150.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("amnh_ext", { grime: 0.55 });
    const b = S.b;
    // forecourt paving & lawn strips
    b.box("sidewalk", -187.9, 0, -779.9, -132.1, 0.03, -690.1, {
      segLen: 8,
      grime: 0.6,
      noAO: true,
    });

    // ---------- main block A ----------
    b.box("granite_dark", -178, 0, -744, -146, 5.5, -700);
    b.box("limestone", -178, 5.5, -744, -146, 22, -700);
    S.col(-178, 0, -744, -146, 22, -700);
    const FA = P.face(S, "e", -744, -700, -146);
    FA.band("granite_dark", 5.3, 5.8, 0, 0.35);
    FA.band("limestone", 12.4, 12.8, 0, 0.25);
    FA.cornice("limestone", 20.6, 0.9);
    for (const u of [3, 7, 37, 41]) {
      FA.window(u, 1.4, 1.4, 2.0, {
        frame: "iron",
        style: "dark",
        sill: "granite_dark",
        mull: false,
      });
      FA.window(u, 7.0, 2.0, 4.6, {
        arch: true,
        frame: "paint_white",
        style: (u * 7) % 3 === 0 ? "broken" : "dark",
        sill: "limestone",
        keystone: "limestone",
      });
      FA.window(u, 14.2, 1.8, 4.2, {
        arch: true,
        frame: "paint_white",
        style: u === 41 ? "boarded" : "dark",
        sill: "limestone",
        keystone: "limestone",
      });
    }
    parapet(S, -178, -744, -146, -700, 22, "limestone");
    // barrel-vaulted copper roof over the memorial hall
    b.geo(
      "verdigris",
      new THREE.CylinderGeometry(7.5, 7.5, 28, 18, 1, true, 0, PI)
        .rotateZ(HP)
        .scale(1, 0.55, 1),
      P.m4(-162, 22, -722),
      {},
    );
    for (const x of [-175, -168, -162, -156, -149])
      b.torus("copper", x, 22, -722, 7.55, 0.12, PI, {
        ry: HP,
        sy: 0.55,
        ts: 14,
        rs: 4,
      });
    b.box("copper", -176.2, 22, -722.3, -147.8, 26.3, -721.7, { seg: false });

    // ---------- Roosevelt Memorial pavilion B ----------
    const ZC = -722,
      AW = 3.5,
      TER = 2.4;
    b.box("limestone", -146, 0, -734, -141, 27, ZC - AW); // north pier
    b.box("limestone", -146, 0, ZC + AW, -141, 27, -710); // south pier
    b.box("limestone", -146, 0, ZC - AW, -144.5, 27, ZC + AW); // back wall
    b.box("limestone", -144.5, TER + 9.5 + AW, ZC - AW, -141, 27, ZC + AW); // over the arch
    S.col(-146, 0, -734, -141, 27, ZC - AW);
    S.col(-146, 0, ZC + AW, -141, 27, -710);
    S.col(-146, 0, ZC - AW, -144.5, 27, ZC + AW);
    S.col(-144.5, TER + 9.5, ZC - AW, -141, 27, ZC + AW);
    const FB = P.face(S, "e", -734, -710, -141);
    const uC = FB.len / 2; // arch centre (u runs from z=-710 northward)
    // spandrels + voussoirs of the great arch
    {
      const sh = new THREE.Shape();
      sh.moveTo(-AW, 0);
      sh.lineTo(-AW, AW);
      sh.lineTo(AW, AW);
      sh.lineTo(AW, 0);
      sh.absarc(0, 0, AW, 0, PI, false);
      b.extrude("limestone", sh, 3.5, FB.mat(uC, TER + 9.5, -3.5));
      FB.arch("limestone_dark", uC, TER + 9.5, AW, 0.75, 0, 0.35);
      FB.box(
        "limestone_dark",
        uC - 0.5,
        uC + 0.5,
        TER + 9.5 + AW - 0.2,
        TER + 9.5 + AW + 1.1,
        0,
        0.55,
      ); // keystone
      // coffered soffit (ribs)
      for (let i = 0; i <= 6; i++) {
        const a = (PI * i) / 6;
        b.box(
          "limestone_dark",
          -144.5,
          TER + 9.5 + Math.sin(a) * AW - 0.12,
          ZC + Math.cos(a) * AW - 0.12,
          -141,
          TER + 9.5 + Math.sin(a) * AW + 0.05,
          ZC + Math.cos(a) * AW + 0.12,
          { seg: false },
        );
      }
      b.inside(
        "limestone",
        new THREE.CylinderGeometry(AW, AW, 3.5, 16, 1, true, 0, PI).rotateZ(HP),
        P.m4(-142.75, TER + 9.5, ZC),
        {},
      );
      // imposts
      for (const s of [-1, 1])
        FB.box(
          "limestone_dark",
          uC + s * AW - 0.3,
          uC + s * AW + 0.3,
          TER + 9.2,
          TER + 9.6,
          -0.1,
          0.4,
        );
    }
    // recess: great bronze doors + transom grille
    b.box("bronze", -144.62, TER, ZC - 1.6, -144.45, TER + 5.2, ZC + 1.6, {
      seg: false,
    });
    for (let i = -3; i <= 3; i++)
      b.box(
        "bronze",
        -144.5,
        TER + 5.4,
        ZC + i * 0.48 - 0.04,
        -144.4,
        TER + 9.4,
        ZC + i * 0.48 + 0.04,
        { seg: false },
      );
    b.box(
      "glass_dark",
      -144.55,
      TER + 5.4,
      ZC - AW + 0.1,
      -144.52,
      TER + 9.5 + AW - 0.2,
      ZC + AW - 0.1,
      { seg: false },
    );
    for (const s of [-1, 1])
      b.box(
        "bronze",
        -144.45,
        TER + 2.3,
        ZC + s * 0.08 - 0.02,
        -144.3,
        TER + 2.6,
        ZC + s * 0.08 + 0.02,
        { seg: false },
      );
    // attic & inscription
    FB.cornice("limestone", 26.1, 0.7, { mods: false });
    FB.band("limestone_dark", 19.2, 19.7, 0, 0.3);
    const insc = P.texMat(
      "amnh_insc",
      P.signTex("amnh_insc", ["THEODORE ROOSEVELT"], "engraved", 1024, 96, {
        bg: "#b8ae96",
        spacing: 8,
      }),
      { rough: 0.9 },
    );
    FB.quad(insc, uC, 23.4, 16, 1.5, 0.03);
    const insc2 = P.texMat(
      "amnh_insc2",
      P.signTex(
        "amnh_insc2",
        ["TRUTH · KNOWLEDGE · VISION"],
        "engraved",
        1024,
        64,
        { bg: "#b8ae96", spacing: 4 },
      ),
      { rough: 0.9 },
    );
    FB.quad(insc2, uC, 21.3, 12, 0.75, 0.03);
    // pier windows + niches
    for (const s of [-1, 1]) {
      FB.window(uC + s * 8.4, 12.5, 1.6, 3.4, {
        arch: true,
        frame: "iron",
        style: "dark",
        sill: "limestone",
        mull: false,
      });
      FB.box(
        "limestone_dark",
        uC + s * 8.4 - 1.4,
        uC + s * 8.4 + 1.4,
        3.6,
        3.9,
        0,
        0.3,
      );
    }
    // ---------- terrace + stairs + plinth ----------
    b.box("granite", -141, 0, -737, -137, TER, -707);
    b.box("granite", -144.5, 0, ZC - AW, -141, TER, ZC + AW);
    S.col(-141, 0, -737, -137, TER, -707, { surface: "concrete" });
    S.col(-144.5, 0, ZC - AW, -141, TER, ZC + AW);
    for (const zc of [-732, -712]) {
      S.stairs("granite", -132.7, zc, "w", 10, 0, TER, { run: 0.43 });
      for (const s of [-1, 1]) {
        b.box(
          "granite_dark",
          -137,
          0,
          zc + s * 5 - 0.35,
          -132.6,
          1.0,
          zc + s * 5 + 0.35,
          { rz: 0 },
        );
        S.col(-137, 0, zc + s * 5 - 0.35, -132.6, 1.0, zc + s * 5 + 0.35, {
          walkable: false,
        });
      }
      // bronze lamp standards on the cheek walls
      for (const s of [-1, 1]) {
        b.cyl("bronze", -133.2, 1.0, zc + s * 5, 0.09, 0.14, 3.0, 8);
        b.sphere("lamp_dim", -133.2, 4.2, zc + s * 5, 0.28, { ws: 8, hs: 6 });
        S.glow(-133.2, 4.2, zc + s * 5, 0xffd090, 0.9);
      }
    }
    // balustrade along the terrace edge (between the stair flights, behind the plinth)
    S.rail(
      "limestone",
      [
        [-137.2, -727],
        [-137.2, -717],
      ],
      TER,
      1.0,
      { baluster: true, step: 0.35 },
    );
    S.rail(
      "limestone",
      [
        [-137.2, -737],
        [-141, -737],
      ],
      TER,
      1.0,
      { baluster: true, step: 0.35 },
    );
    S.rail(
      "limestone",
      [
        [-137.2, -707],
        [-141, -707],
      ],
      TER,
      1.0,
      { baluster: true, step: 0.35 },
    );
    // plinth + equestrian group
    b.box("granite", -136.6, 0, ZC - 3.5, -132.6, 3.2, ZC + 3.5);
    b.box("granite_dark", -136.8, 3.2, ZC - 3.7, -132.4, 3.55, ZC + 3.7, {
      seg: false,
    });
    b.box("granite_dark", -136.8, 0, ZC - 3.7, -132.4, 0.5, ZC + 3.7, {
      seg: false,
    });
    S.col(-136.8, 0, ZC - 3.7, -132.4, 3.55, ZC + 3.7, { walkable: false });
    const plq = P.texMat(
      "amnh_plinth",
      P.signTex(
        "amnh_plinth",
        ["THEODORE ROOSEVELT", "1858 · 1919"],
        "engraved",
        512,
        160,
        { bg: "#8a8680" },
      ),
      { rough: 0.9 },
    );
    b.quad(plq, -132.58, 2.2, ZC, 3.2, 1.0, { ry: HP });
    D.horse(b, "bronze", -134.6, 3.55, ZC, HP, 1.45, { stride: true });
    D.figure(b, "bronze", -134.9, 3.55 + 1.45 * 1.42, ZC, HP, 1.45, "rider", {
      hat: "bronze",
    });
    D.figure(b, "bronze", -133.6, 3.55, ZC - 1.9, HP, 1.35, "stand", {
      robe: true,
    });
    D.figure(b, "bronze", -133.6, 3.55, ZC + 1.9, HP, 1.35, "stand");
    // ---------- colossal Ionic columns + statues ----------
    for (const dz of [-9.6, -5.6, 5.6, 9.6]) {
      const z = ZC + dz,
        x = -139.6;
      b.box("granite", x - 1.1, TER, z - 1.1, x + 1.1, TER + 2.4, z + 1.1);
      b.box(
        "limestone",
        x - 1.2,
        TER + 2.4,
        z - 1.2,
        x + 1.2,
        TER + 2.7,
        z + 1.2,
        { seg: false },
      );
      b.lathe(
        "limestone",
        [
          [0.001, 0],
          [0.98, 0],
          [0.98, 0.18],
          [0.88, 0.3],
          [0.9, 0.42],
          [0.8, 0.55],
          [0.001, 0.55],
        ],
        20,
        x,
        TER + 2.7,
        z,
      );
      b.cyl("limestone", x, TER + 3.25, z, 0.7, 0.8, 12.0, 20, { hSeg: 4 });
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * TAU;
        b.box(
          "limestone_dark",
          x + Math.cos(a) * 0.74 - 0.04,
          TER + 3.4,
          z + Math.sin(a) * 0.74 - 0.04,
          x + Math.cos(a) * 0.74 + 0.04,
          TER + 15.1,
          z + Math.sin(a) * 0.74 + 0.04,
          { seg: false, grime: 0.7 },
        );
      }
      // Ionic capital: echinus, abacus, volutes
      b.cyl("limestone", x, TER + 15.25, z, 0.9, 0.72, 0.35, 16);
      b.box(
        "limestone",
        x - 1.0,
        TER + 15.6,
        z - 1.0,
        x + 1.0,
        TER + 15.95,
        z + 1.0,
        { seg: false },
      );
      for (const s of [-1, 1])
        b.cyl("limestone", x, TER + 15.3, z + s * 0.82, 0.32, 0.32, 2.0, 12, {
          rz: HP,
        });
      S.col(x - 1.1, TER, z - 1.1, x + 1.1, TER + 16, z + 1.1, {
        walkable: false,
      });
      // explorer statue on the entablature
      D.figure(
        b,
        "limestone_dark",
        x + 0.2,
        20.1,
        z,
        HP,
        1.7,
        dz < 0 ? (dz < -7 ? "arm" : "stand") : dz > 7 ? "stand" : "arm",
        {
          robe: dz === -5.6 || dz === 9.6,
          hat: dz === 5.6 ? "limestone_dark" : undefined,
          grime: 0.6,
        },
      );
      b.box("limestone", x - 0.8, 19.7, z - 0.8, x + 0.8, 20.1, z + 0.8, {
        seg: false,
      });
    }
    // entablature carried by the columns
    b.box("limestone", -141, TER + 15.95, -734, -138.4, TER + 17.3, -710);
    b.box(
      "limestone_dark",
      -141,
      TER + 16.9,
      -734.4,
      -138.1,
      TER + 17.3,
      -709.6,
      { seg: false },
    );
    // museum banners hanging between the column pairs
    const bn1 = P.texMat(
      "amnh_bn1",
      P.signTex(
        "amnh_bn1",
        ["DINOSAURS!", "TERRIBLE", "LIZARDS"],
        "banner",
        256,
        1024,
        { bg: "#8a2a1e", emblem: bannerEmblem("dino"), top: 0.06 },
      ),
      { double: true, rough: 1 },
    );
    const bn2 = P.texMat(
      "amnh_bn2",
      P.signTex(
        "amnh_bn2",
        ["HAYDEN", "PLANETARIUM", "SEE THE", "STARS"],
        "banner",
        256,
        1024,
        { bg: "#1e3a6a", emblem: bannerEmblem("planet"), top: 0.06 },
      ),
      { double: true, rough: 1 },
    );
    b.quad(bn1, -138.6, 13.2, ZC - 7.6, 1.8, 7.0, { ry: HP });
    b.quad(bn2, -138.6, 12.4, ZC + 7.6, 1.8, 7.0, { ry: HP, rz: 0.05 });
    for (const z of [ZC - 7.6, ZC + 7.6])
      b.rod("iron", [-138.6, 16.8, z - 1], [-138.6, 16.8, z + 1], 0.04, 4);

    // ---------- 77th Street wing (Romanesque, pink granite) ----------
    b.box("granite_pink", -186, 0, -700, -134, 18, -692);
    S.col(-186, 0, -700, -134, 18, -692);
    const FE = P.face(S, "s", -186, -134, -692);
    FE.band("granite_dark", 0, 1.2, 0, 0.4);
    FE.band("granite_pink", 5.6, 6.0, 0, 0.3);
    FE.band("granite_pink", 11.6, 12.0, 0, 0.3);
    FE.cornice("granite_pink", 17.2, 0.8, { step: 0.6 });
    // central arched portal
    FE.arch("granite_dark", 26, 4.2, 2.6, 0.9, 0, 0.6);
    FE.box("glass_dark", 23.4, 28.6, 0, 6.8, -0.05, 0.02, { seg: false });
    FE.halfDisc("glass_dark", 26, 4.2, 2.6, 0.03);
    for (const s of [-1, 1]) {
      FE.box(
        "granite_dark",
        26 + s * 3.1 - 0.5,
        26 + s * 3.1 + 0.5,
        0,
        4.4,
        0,
        0.8,
      );
    }
    // arcaded windows
    for (let u = 12.2; u < 41; u += 3.2) {
      if (Math.abs(u - 26) < 3.6) continue;
      FE.window(u, 2.0, 1.4, 3.0, {
        arch: true,
        frame: "iron",
        style: u % 2 < 1 ? "broken" : "dark",
        sill: "granite_pink",
        mull: false,
      });
      FE.window(u, 7.0, 1.6, 3.9, {
        arch: true,
        frame: "iron",
        style: "dark",
        sill: "granite_pink",
        keystone: "granite_dark",
      });
      FE.window(u, 12.8, 1.0, 2.8, {
        arch: true,
        frame: "iron",
        style: "dark",
        sill: false,
        mull: false,
      });
    }
    // central gable over the portal
    {
      const sh = new THREE.Shape();
      sh.moveTo(-6.5, 0);
      sh.lineTo(6.5, 0);
      sh.lineTo(0, 6.5);
      sh.closePath();
      b.extrude("granite_pink", sh, 1.2, FE.mat(26, 18, -1.0));
      FE.window(26, 19.4, 1.6, 2.6, {
        arch: true,
        frame: "iron",
        style: "dark",
        sill: false,
        mull: false,
        d: 0.22,
      });
      const nm = P.texMat(
        "amnh_name",
        P.signTex(
          "amnh_name",
          ["AMERICAN MUSEUM OF NATURAL HISTORY"],
          "engraved",
          1024,
          64,
          { bg: "#b08a7c", spacing: 3 },
        ),
        { rough: 0.9 },
      );
      FE.quad(nm, 26, 16.2, 22, 1.0, 0.05);
    }
    // slate roof ridge
    b.geo(
      "slate",
      new THREE.BoxGeometry(52, 5.66, 5.66, 8, 1, 1)
        .rotateX(PI / 4)
        .scale(1, 0.75, 1),
      P.m4(-160, 18, -696),
      {},
    );
    // round turrets with conical roofs
    for (const tx of [-180, -140]) {
      const tz = -694;
      b.cyl("granite_pink", tx, 0, tz, 3.6, 3.8, 26, 20, { hSeg: 6 });
      b.cyl("granite_dark", tx, 0, tz, 3.95, 3.95, 1.2, 20);
      for (const y of [8.5, 17.5, 25.6])
        b.cyl("granite_pink", tx, y, tz, 3.85, 3.85, 0.4, 20);
      b.cyl("slate", tx, 26, tz, 0.1, 4.2, 9, 20, { hSeg: 3 });
      b.cyl("copper", tx, 34.8, tz, 0.05, 0.25, 2.2, 6);
      b.sphere("copper", tx, 35.2, tz, 0.28, { ws: 8, hs: 6 });
      for (let k = 0; k < 5; k++) {
        const a = HP + (k - 2) * 0.62,
          px = tx + Math.cos(a) * 3.62,
          pz = tz + Math.sin(a) * 3.62;
        for (const y of [10, 19.5]) {
          b.box(
            "glass_dark",
            px - 0.45,
            y,
            pz - 0.08,
            px + 0.45,
            y + 2.6,
            pz + 0.08,
            { ry: -a + HP, seg: false },
          );
        }
      }
      S.col(tx - 3.7, 0, tz - 3.7, tx + 3.7, 26, tz + 3.7, { walkable: false });
    }
    const FEe = P.face(S, "e", -700, -692, -134);
    FEe.cornice("granite_pink", 17.2, 0.8, { mods: false });
    for (const y of [2, 7, 12.8])
      FEe.window(4, y, 1.5, y > 12 ? 2.6 : 3.4, {
        arch: true,
        frame: "iron",
        style: "dark",
        sill: "granite_pink",
        mull: false,
      });
    // ---------- north + west wings (limestone) ----------
    b.box("granite_dark", -186, 0, -752, -146, 3.5, -744);
    b.box("limestone", -186, 3.5, -752, -146, 18, -744);
    b.box("granite_dark", -186, 0, -744, -178, 3.5, -700);
    b.box("limestone", -186, 3.5, -744, -178, 18, -700);
    S.col(-186, 0, -752, -146, 18, -744);
    S.col(-186, 0, -744, -178, 18, -700);
    const FF = P.face(S, "e", -752, -744, -146);
    for (const u of [2, 6]) {
      FF.window(u, 5.5, 1.8, 3.6, {
        arch: true,
        frame: "paint_white",
        style: "dark",
        sill: "limestone",
      });
      FF.window(u, 11.5, 1.6, 3.0, {
        frame: "paint_white",
        style: "broken",
        sill: "limestone",
        hood: "cornice",
      });
    }
    FF.cornice("limestone", 17.2, 0.6);
    parapet(S, -186, -752, -146, -744, 18, "limestone");
    const FN = P.face(S, "n", -186, -146, -752);
    for (let u = 3; u < 40; u += 4.2) {
      FN.window(u, 5.5, 1.8, 3.6, {
        arch: true,
        frame: "paint_white",
        style: u > 20 && u < 26 ? "boarded" : "dark",
        sill: "limestone",
      });
      FN.window(u, 11.5, 1.6, 3.0, {
        frame: "paint_white",
        style: "dark",
        sill: "limestone",
        hood: "cornice",
      });
    }
    FN.cornice("limestone", 17.2, 0.6);
    // collapsed north-east corner: broken parapet + rubble spill
    D.rubble(S, -144, 0, -748, 3.6, {
      n: 16,
      slab: true,
      rebar: true,
      scale: 1.4,
    });
    D.rubble(S, -137, 0, -741, 2.4, { n: 9, slab: true, scale: 1.2 });
    D.rubble(S, -136, TER, -735, 1.2, { n: 5 });
    b.cyl("limestone", -136.5, 0.8, -744.5, 0.8, 0.8, 1.6, 16, {
      rz: HP,
      ry: 0.4,
    }); // toppled column drum

    // ---------- Rose Center (glass cube + Hayden sphere) ----------
    const RX0 = -182,
      RX1 = -150,
      RZ0 = -779,
      RZ1 = -753,
      RH = 24;
    const SC = new THREE.Vector3(-166, 12.5, -766),
      SR = 10.5;
    b.box("granite_dark", RX0, 0, RZ0, RX1, 0.6, RZ1);
    S.col(RX0, 0, RZ0, RX1, RH, RZ1, { walkable: false });
    const rr = P.rng("rose");
    const glassWall = (side, a0, a1, c) => {
      const F = P.face(S, side, a0, a1, c);
      const nu = Math.round(F.len / 2.7),
        nv = 8;
      for (let i = 0; i < nu; i++)
        for (let j = 0; j < nv; j++) {
          const u = ((i + 0.5) * F.len) / nu,
            y = 0.6 + ((j + 0.5) * (RH - 0.6)) / nv;
          const broken = rr() < 0.14;
          if (!broken)
            F.quad(
              rr() < 0.8 ? "glass_tint" : "glass",
              u,
              y,
              F.len / nu - 0.06,
              (RH - 0.6) / nv - 0.06,
              0.0,
              { uv: "box", grime: 0.6 },
            );
        }
      for (let i = 0; i <= nu; i++)
        F.box(
          "steel",
          (i * F.len) / nu - 0.07,
          (i * F.len) / nu + 0.07,
          0.6,
          RH,
          0,
          0.35,
          { seg: false },
        );
      for (let j = 0; j <= nv; j++)
        F.box(
          "steel",
          0,
          F.len,
          0.6 + (j * (RH - 0.6)) / nv - 0.06,
          0.6 + (j * (RH - 0.6)) / nv + 0.06,
          0,
          0.2,
          { seg: false },
        );
      return F;
    };
    glassWall("e", RZ0, RZ1, RX1);
    glassWall("w", RZ0, RZ1, RX0);
    glassWall("s", RX0, RX1, RZ1);
    glassWall("n", RX0, RX1, RZ0);
    for (let i = 0; i <= 12; i++)
      b.box(
        "steel",
        RX0 + (i * (RX1 - RX0)) / 12 - 0.08,
        RH - 0.3,
        RZ0,
        RX0 + (i * (RX1 - RX0)) / 12 + 0.08,
        RH,
        RZ1,
        { seg: false },
      );
    for (let j = 0; j <= 10; j++)
      b.box(
        "steel",
        RX0,
        RH - 0.3,
        RZ0 + (j * (RZ1 - RZ0)) / 10 - 0.08,
        RX1,
        RH,
        RZ0 + (j * (RZ1 - RZ0)) / 10 + 0.08,
        { seg: false },
      );
    b.box("glass_tint", RX0, RH - 0.05, RZ0, RX1, RH, RZ1, {
      seg: false,
      grime: 0.8,
    });
    b.box(
      "paint_white",
      RX0 + 0.5,
      0.6,
      RZ0 + 0.5,
      RX1 - 0.5,
      0.65,
      RZ1 - 0.5,
      { segLen: 6 },
    );
    // the sphere
    {
      const g = new THREE.SphereGeometry(SR, 40, 26);
      b.geo("sphere_white", g, P.m4(SC.x, SC.y, SC.z), { grime: 0.35 });
      for (let k = -3; k <= 3; k++) {
        const y = SC.y + (k * SR) / 4;
        const rr2 =
          Math.sqrt(Math.max(0, SR * SR - ((k * SR) / 4) ** 2)) + 0.03;
        b.torus("steel", SC.x, y, SC.z, rr2, 0.05, TAU, {
          rx: HP,
          ts: 32,
          rs: 3,
        });
      }
      for (let k = 0; k < 8; k++)
        b.torus("steel", SC.x, SC.y, SC.z, SR + 0.03, 0.05, TAU, {
          ry: (k / 8) * PI,
          ts: 40,
          rs: 3,
        });
      // missing panels (dark holes)
      for (let k = 0; k < 7; k++) {
        const a = rr() * TAU,
          e = (rr() - 0.3) * 1.2;
        b.sphere(
          "paint_black",
          SC.x + Math.cos(a) * Math.cos(e) * (SR + 0.02),
          SC.y + Math.sin(e) * (SR + 0.02),
          SC.z + Math.sin(a) * Math.cos(e) * (SR + 0.02),
          1.0,
          { sy: 0.9, sx: 1, sz: 1, ws: 8, hs: 6 },
        );
      }
      // tripod legs
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * TAU + 0.5;
        b.rod(
          "steel",
          [SC.x + Math.cos(a) * 6.5, 0.6, SC.z + Math.sin(a) * 6.5],
          [
            SC.x + Math.cos(a) * 3.5,
            SC.y - SR * 0.85,
            SC.z + Math.sin(a) * 3.5,
          ],
          0.35,
          8,
        );
      }
    }
    // door & signage on the east glass wall
    b.box("steel", RX1, 0, -768, RX1 + 0.4, 3.4, -764, { seg: false });
    b.box("glass_dark", RX1 + 0.4, 0.6, -767.5, RX1 + 0.45, 3.0, -764.5, {
      seg: false,
    });
    b.box("steel", RX1, 3.4, -769, RX1 + 2.2, 3.7, -763, { seg: false });
    const hs = P.texMat(
      "amnh_hayden",
      P.signTex("amnh_hayden", ["HAYDEN PLANETARIUM"], "bronze", 1024, 96),
      { transparent: true, metal: 0.6, rough: 0.4 },
    );
    b.quad(hs, RX1 + 0.5, 5.0, -766, 9, 0.85, { ry: HP });
    // chained doors + "barred" plank
    // the bar plank is its own tiny mesh: 10_amnh_interior.js hides it once the door has been opened from inside
    {
      const pb = new P.Batch("amnh_roseplank", { grime: 0.6 });
      pb.box("wood_rotten", RX1 + 0.5, 1.3, -768, RX1 + 0.6, 1.55, -764, {
        seg: false,
        rx: 0.08,
      });
      pb.box("rust", RX1 + 0.45, 1.2, -766.4, RX1 + 0.65, 1.65, -766.2, {
        seg: false,
      });
      P.amnhRosePlank = pb.build(S.root);
    }
    S.anchor("exterior_entrance", -139.2, TER, -722, -HP);
    S.anchor("rose_entrance", -147.2, 0, -766, -HP);
    S.anchor("statue", -134.6, 3.55, -722, -HP);
    S.build({ shadow: true, lod: 260 });
    return S;
  }
  /** Solid parapet + coping around a rectangle roof. */
