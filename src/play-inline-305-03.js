// play-inline-305 03 — tz1
// Lines 130-522 of readable/play-inline-305.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("dn_ext", { grime: 0.45 });
    const b = S.b;
    const rn = P.rng("dn_ext");
    // pavement apron
    b.box("sidewalk", 292, 0, -268, 330, 0.06, -237, {
      segLen: 8,
      grime: 0.5,
      noAO: true,
    });
    // ---------------- massing ----------------
    const TX0 = 297,
      TX1 = 321,
      TZ0 = -262,
      TZ1 = -238; // tower
    const DOOR_X = 309; // entrance centre on 42nd St
    const portalU = [DOOR_X - 4.2 - TX0, DOOR_X + 4.2 - TX0, 13.4];
    // tower core (russet spandrel brick behind the stripes)
    b.box("dn_spandrel", TX0, 0, TZ0, TX1, 86, TZ1, { segLen: 8 });
    S.col(TX0 - 0.35, 0, TZ0 - 0.35, TX1 + 0.35, 86, TZ1 + 0.35);
    stripeFace(S, "s", TX0, TX1, TZ1, 0, 86, {
      winStart: 5.6,
      portal: portalU,
    });
    stripeFace(S, "n", TX0, TX1, TZ0, 30, 86, { winStart: 31 });
    stripeFace(S, "w", TZ0, TZ1, TX0, 20, 86, { winStart: 20.9 });
    stripeFace(S, "e", TZ0, TZ1, TX1, 38, 86, { winStart: 38.9 });
    // setback
    b.box("dn_spandrel", 299, 86, -260, 319, 98, -240, { segLen: 8 });
    S.col(299 - 0.35, 86, -260 - 0.35, 319 + 0.35, 98, -240 + 0.35);
    const ne = (u, y) => false;
    void ne;
    stripeFace(S, "s", 299, 319, -240, 86, 98, { winStart: 86.9 });
    stripeFace(S, "n", 299, 319, -260, 86, 98, {
      winStart: 86.9,
      skip: (u, y) => u < 6 && y > 92,
    });
    stripeFace(S, "w", -260, -240, 299, 86, 98, { winStart: 86.9 });
    stripeFace(S, "e", -260, -240, 319, 86, 98, {
      winStart: 86.9,
      skip: (u, y) => u > 14 && y > 92,
    });
    // crown: L-shaped — its north-east quarter is gone
    b.box("dn_spandrel", 302, 98, -257, 310, 106, -243, { segLen: 8 });
    b.box("dn_spandrel", 310, 98, -250, 316, 106, -243, { segLen: 8 });
    b.box("dn_spandrel", 310, 98, -257, 316, 100.5, -250, { segLen: 8 });
    S.col(301.6, 98, -257.4, 310.4, 106, -242.6);
    S.col(310, 98, -250.4, 316.4, 106, -242.6);
    stripeFace(S, "s", 302, 316, -243, 98, 106, { winStart: 98.9 });
    stripeFace(S, "w", -257, -243, 302, 98, 106, { winStart: 98.9 });
    stripeFace(S, "n", 302, 316, -257, 98, 106, {
      winStart: 98.9,
      broken: (u, y1) => (u < 6.5 ? 100.2 + (u % 2) * 0.8 : 0),
      skip: (u, y) => u < 6.5,
    });
    stripeFace(S, "e", -257, -243, 316, 98, 106, {
      winStart: 98.9,
      broken: (u, y1) => (u > 6.5 ? 100.4 + (u % 2) : 0),
      skip: (u, y) => u > 6.5,
    });
    // exposed broken floor edges + girders in the missing quarter
    b.box("concrete_dark", 310, 98, -250.2, 316, 106, -249.9, {
      segLen: 3,
      grime: 0.8,
    });
    b.box("concrete_dark", 309.9, 98, -257, 310.2, 106, -250, {
      segLen: 3,
      grime: 0.8,
    });
    for (let i = 0; i < 4; i++)
      E.girder(
        b,
        [310.2 + i * 1.8, 103.2, -250],
        [310.2 + i * 1.6 + rn(), 103.2 - rn() * 1.6, -256.5 + rn() * 2],
        0.22,
      );
    for (let i = 0; i < 3; i++)
      E.girder(
        b,
        [310, 100.7 + i * 1.8, -251 - i * 2],
        [315.8 - rn() * 2, 100.7 + i * 1.6 - rn(), -251 - i * 2 + rn()],
        0.2,
      );
    for (let i = 0; i < 5; i++)
      E.girder(
        b,
        [310.5 + i * 1.3, 100.5, -250.5],
        [310.5 + i * 1.3 + (rn() - 0.5), 104 + rn() * 3.5, -250.6 - rn() * 1.5],
        0.16,
      );
    D.rubble(S, 313, 100.5, -254, 2.6, { n: 14, rebar: true });
    D.rubble(S, 304, 98.1, -258.6, 1.4, { n: 6 });
    // east wing
    b.box("dn_spandrel", 321, 0, -266, 329, 38, -238, { segLen: 8 });
    S.col(321, 0, -266.35, 329.35, 38, -237.65);
    stripeFace(S, "s", 321, 329, -238, 0, 38, { winStart: 5.6 });
    stripeFace(S, "e", -266, -238, 329, 0, 38, {
      winStart: 5.6,
      skip: (u, y) => y < 5 || (u > 11 && u < 17 && y < 6),
    });
    stripeFace(S, "n", 321, 329, -266, 0, 38, { winStart: 5.6 });
    b.box("dn_spandrel", 321, 38, -264, 327, 46, -240, { segLen: 8 });
    S.col(321, 38, -264.35, 327.35, 46, -239.65);
    stripeFace(S, "s", 321, 327, -240, 38, 46, { winStart: 38.9 });
    stripeFace(S, "e", -264, -240, 327, 38, 46, { winStart: 38.9 });
    stripeFace(S, "n", 321, 327, -264, 38, 46, { winStart: 38.9 });
    // west wing + rear block
    b.box("dn_spandrel", 293, 0, -266, 297, 20, -238, { segLen: 8 });
    S.col(292.65, 0, -266.35, 297, 20, -237.65);
    stripeFace(S, "s", 293, 297, -238, 0, 20, { winStart: 5.6, bay: 1.3 });
    stripeFace(S, "w", -266, -238, 293, 0, 20, { winStart: 5.6 });
    stripeFace(S, "n", 293, 297, -266, 0, 20, { winStart: 5.6, bay: 1.3 });
    b.box("dn_spandrel", 297, 0, -267, 321, 30, -262, { segLen: 8 });
    S.col(297, 0, -267.35, 321, 30, -262);
    stripeFace(S, "n", 297, 321, -267, 0, 30, { winStart: 5.6 });
    // roofs (tar + gravel) and rooftop clutter
    for (const r of [
      [299, -260, 319, -240, 86],
      [302, -257, 316, -243, 106],
      [321, -266, 327, -238, 38],
      [321, -264, 327, -240, 46],
      [293, -266, 297, -238, 20],
      [297, -267, 321, -262, 30],
      [297, -262, 321, -238, 86],
    ]) {
      b.box(
        "tar",
        r[0] + 0.2,
        r[4],
        r[1] + 0.2,
        r[2] - 0.2,
        r[4] + 0.08,
        r[3] - 0.2,
        { segLen: 6, noAO: true },
      );
    }
    // tower top: flat, bare — the piers are simply cut off (Hood's "unfinished" top)
    E.waterTower(b, 324, 46, -252, 0.9);
    E.mast(S, 306, 106, -252, 14, { w: 1.4, glow: 2.6 });
    for (let i = 0; i < 3; i++)
      b.rod(
        "iron",
        [306, 118.5 - i * 3, -252],
        [302.5 + i * 0.2, 106.1, -247 + i * 1.5],
        0.012,
        3,
        { noAO: true },
      );
    b.box("metal", 313, 106, -248, 315.4, 107.8, -245, { seg: false }); // mechanical house
    // ---------------- 42nd Street ground floor ----------------
    const FS = P.face(S, "s", TX0, TX1, TZ1);
    FS.box("granite_dark", -0.4, FS.len + 0.4, 0, 1.1, 0, 0.42, { seg: false });
    FS.box("limestone", -0.4, FS.len + 0.4, 4.4, 5.0, 0, 0.44, { seg: false });
    for (let k = 0; k < 16; k++) {
      const u = (k + 0.5) * 1.5;
      if (u > portalU[0] - 0.6 && u < portalU[1] + 0.6) continue;
      FS.box(
        k % 5 === 2 ? "glass_broken" : "glass_dark",
        u - 0.46,
        u + 0.46,
        1.2,
        4.2,
        0,
        0.06,
        { seg: false, noAO: true },
      );
      if (k % 4 === 1)
        FS.box("wood_rotten", u - 0.5, u + 0.5, 1.4, 3.8, 0.06, 0.1, {
          seg: false,
        });
    }
    // ---------------- the entrance portal ----------------
    const pu0 = portalU[0],
      pu1 = portalU[1],
      pm = (pu0 + pu1) / 2;
    // stepped limestone jambs (3 orders)
    for (let k = 0; k < 3; k++) {
      const inset = k * 0.45,
        dz = 0.9 - k * 0.3;
      FS.box(
        "limestone",
        pu0 + inset - 0.55,
        pu0 + inset,
        0,
        13.4 - k * 0.5,
        0,
        dz,
      );
      FS.box(
        "limestone",
        pu1 - inset,
        pu1 - inset + 0.55,
        0,
        13.4 - k * 0.5,
        0,
        dz,
      );
      FS.box(
        "limestone",
        pu0 + inset - 0.55,
        pu1 - inset + 0.55,
        13.4 - k * 0.5 - 0.55,
        13.4 - k * 0.5,
        0,
        dz,
      );
    }
    // the relief panel (sunburst over the tower, the crowd, THE JOURNAL)
    const relief = P.texMat("dn_relief", P.reliefTex(), { rough: 0.95 });
    FS.quad(relief, pm, 8.45, 5.6, 7.0, 0.1);
    FS.box("limestone", pu0 + 0.9, pu1 - 0.9, 4.75, 4.95, 0, 0.3, {
      seg: false,
    });
    // black glass & brass doors + transom
    FS.box("black_glass", pu0 + 1.0, pu1 - 1.0, 0, 4.75, -0.2, 0.02, {
      seg: false,
    });
    for (let k = 0; k < 3; k++) {
      const u = pu0 + 1.6 + k * ((pu1 - pu0 - 3.2) / 2);
      FS.box("brass", u - 0.75, u + 0.75, 0.05, 3.0, 0.02, 0.08, {
        seg: false,
      });
      FS.box("glass_dark", u - 0.62, u + 0.62, 0.3, 2.85, 0.08, 0.1, {
        seg: false,
      });
      FS.box("brass", u - 0.03, u + 0.03, 0.3, 2.85, 0.1, 0.13, { seg: false });
    }
    FS.box("brass", pu0 + 1.0, pu1 - 1.0, 3.1, 3.25, 0.02, 0.12, {
      seg: false,
    });
    for (let k = 0; k < 9; k++)
      FS.box(
        "brass",
        pu0 + 1.3 + k * 0.62,
        pu0 + 1.36 + k * 0.62,
        3.25,
        4.7,
        0.02,
        0.1,
        { seg: false },
      );
    // steps
    FS.box("granite", pu0 - 0.4, pu1 + 0.4, 0, 0.18, 0, 1.6, { seg: false });
    // ---------------- Daily Ruin dressing ----------------
    const ban = P.texMat(
      "dn_banner",
      P.signTex(
        "dn_banner",
        ["THE DAILY RUIN", "PRINTED ON THE FIRST JOURNAL'S OWN PRESSES"],
        "banner",
        1024,
        256,
        { bg: "#d8ccb0", fg: "#1a1612", top: 0.14 },
      ),
      { double: true, rough: 1 },
    );
    const bg = new THREE.PlaneGeometry(15, 3.6, 12, 1);
    {
      const p = bg.attributes.position;
      for (let v = 0; v < p.count; v++)
        p.setZ(v, Math.sin(((p.getX(v) + 7.5) / 15) * PI) * 0.25);
    }
    b.geo(ban, bg, P.m4(DOOR_X, 17.2, TZ1 + 0.55), {
      uv: "keep",
      noAO: true,
      grime: 0.2,
    });
    for (const s of [-1, 1])
      b.rod(
        "rust",
        [DOOR_X + s * 7.5, 19, TZ1 + 0.36],
        [DOOR_X + s * 7.5, 19, TZ1 + 0.7],
        0.03,
        3,
      );
    // amber scrap sign on the portal head
    const sign = P.texMat(
      "dn_sign",
      P.signTex(
        "dn_sign",
        ["THE DAILY RUIN · NEWS · TRADE · SAFE HAVEN"],
        "marquee",
        1024,
        96,
        { bg: "#1a120a", fg: "#ffcf80", maxW: 0.84 },
      ),
      { rough: 0.5, emissive: 0.75 },
    );
    b.box(
      "rust",
      DOOR_X - 5.2,
      13.6,
      TZ1 + 0.4,
      DOOR_X + 5.2,
      14.9,
      TZ1 + 0.75,
      { seg: false },
    );
    b.quad(sign, DOOR_X, 14.25, TZ1 + 0.77, 10.2, 1.05, { ry: 0 });
    for (let k = -9; k <= 9; k++)
      b.sphere(
        k % 5 === 3 ? "glass_dark" : "neon_amber",
        DOOR_X + k * 0.56,
        13.5,
        TZ1 + 0.8,
        0.06,
        { ws: 5, hs: 4 },
      );
    S.glow(DOOR_X, 14.2, TZ1 + 1.4, 0xffb050, 3.4, { dayFactor: 0.2 });
    S.glow(DOOR_X, 3.2, TZ1 + 1.2, 0xffd8a0, 2.0);
    // sandbag chicane + guard booth + newsstand
    E.sandbags(S, DOOR_X - 8.5, TZ1 + 1.6, DOOR_X - 4.8, TZ1 + 1.6, 0, 3);
    E.sandbags(S, DOOR_X + 4.8, TZ1 + 1.6, DOOR_X + 8.5, TZ1 + 1.6, 0, 3);
    E.sandbags(S, DOOR_X - 8.5, TZ1 + 1.6, DOOR_X - 8.9, TZ1 + 0.4, 0, 3);
    E.booth(S, DOOR_X - 10.6, 0, TZ1 + 1.4, 0, { w: 1.8, d: 1.4 });
    E.booth(S, DOOR_X + 11.2, 0, TZ1 + 1.5, 0, {
      w: 2.6,
      d: 1.4,
      key: "wood_rotten",
    });
    const nst = P.texMat(
      "dn_newsstand",
      P.signTex("dn_newsstand", ["NEWS · 1 SCRIP"], "poster", 512, 128, {
        bg: "#e8d8a8",
        fg: "#8a1a10",
      }),
      { rough: 0.9 },
    );
    b.quad(nst, DOOR_X + 11.2, 2.75, TZ1 + 2.33, 2.4, 0.6, { ry: 0 });
    for (let i = 0; i < 5; i++)
      b.box(
        "newsprint",
        DOOR_X + 10.1 + i * 0.45,
        1.0,
        TZ1 + 2.05,
        DOOR_X + 10.45 + i * 0.45,
        1.06 + (i % 3) * 0.05,
        TZ1 + 2.4,
        { seg: false },
      );
    S.prop("newsbox", DOOR_X - 6.2, 0.06, TZ1 + 2.6, PI);
    S.prop("newsbox", DOOR_X - 5.5, 0.06, TZ1 + 2.7, PI + 0.1);
    S.prop("newsbox", DOOR_X + 14.4, 0.06, TZ1 + 2.5, PI - 0.2);
    S.prop("barrel", DOOR_X + 6.2, 0.06, TZ1 + 3.1, 0, { burning: true });
    // string lights over the door
    for (let k = 0; k < 16; k++) {
      const x = DOOR_X - 7.5 + k;
      b.sphere(
        k % 5 === 2 ? "glass_dark" : "lamp",
        x,
        5.6 - Math.sin((k / 15) * PI) * 0.6,
        TZ1 + 0.9,
        0.06,
        { ws: 5, hs: 4 },
      );
    }
    // loading dock on the east wing (the pressroom's way out)
    const FE = P.face(S, "e", -266, -238, 329);
    FE.box("concrete", 11, 17, 0, 0.9, 0, 0.95, { seg: false });
    FE.box("corrugated", 11.6, 16.4, 0.9, 4.6, -0.05, 0.08, {
      seg: false,
      grime: 0.7,
    });
    FE.box("rust", 11.3, 16.7, 4.6, 5.0, 0, 0.4, { seg: false });
    const dock = P.texMat(
      "dn_docksign",
      P.signTex(
        "dn_docksign",
        ["PRESSROOM · LOADING DOCK", "DELIVERIES — KNOCK TWICE"],
        "poster",
        512,
        128,
        { bg: "#c8b890", fg: "#2a2016" },
      ),
      { rough: 0.9 },
    );
    FE.quad(dock, 14, 5.6, 4.4, 1.1, 0.42);
    S.glow(330.5, 4.9, -252, 0xffc880, 1.2);
    S.prop("crate", 330.2, 0.06, -256.5, 0.3, { kind: "plain" });
    S.prop("barrel", 330.4, 0.06, -247.2, 0);
    // anchors
    S.anchor("ext_entrance", DOOR_X, 0, TZ1 + 2.4, PI);
    S.anchor("ext_dock", 331.2, 0, -252, -HP);
    S.anchor("ext_guard1", DOOR_X - 6.8, 0, TZ1 + 3.2, PI);
    S.anchor("ext_guard2", DOOR_X + 7.2, 0, TZ1 + 3.4, PI);
    S.anchor("ext_newsie", DOOR_X + 11.2, 0, TZ1 + 3.3, PI);
    S.build({ shadow: true, lod: 320 });
    return { S, doorX: DOOR_X, doorZ: TZ1 };
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
