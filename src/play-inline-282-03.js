// play-inline-282 03 — box
// Lines 123-725 of readable/play-inline-282.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("es_ext", { grime: 0.55 });
    const b = S.b;
    // plinth / sidewalk inside the footprint
    b.box("sidewalk", X0 - 0.3, 0, Z0 - 0.3, X1 + 0.3, 0.04, Z1 + 0.3, {
      segLen: 8,
      grime: 0.5,
      noAO: true,
    });

    // ---------------- masses ----------------
    // tower: full up to 23 m, crown floors missing in the north-east (collapse)
    b.box("brick_tan", TX0, 0, Z0, X1, 23, Z1);
    b.box("brick_tan", TX0, 23, Z0 + 8, X1, TH, Z1);
    b.box("brick_tan", TX0, 23, Z0, X1 - 10, TH, Z0 + 8);
    S.col(TX0, 0, Z0, X1, TH, Z1);
    // auditorium + fly tower
    b.box("brick_brown", X0, 0, Z0, TX0, AH, Z1);
    b.box("brick_brown", X0, AH, Z0 + 2, X0 + 13, AH + 6.5, Z1 - 2);
    S.col(X0, 0, Z0, TX0, AH, Z1);
    S.col(X0, AH, Z0 + 2, X0 + 13, AH + 6.5, Z1 - 2);
    // roofs: tar, parapet copings, skylight hatch, vents
    b.box("roof_tar", X0 + 0.3, AH, Z0 + 0.3, TX0, AH + 0.12, Z1 - 0.3, {
      noAO: true,
    });
    b.box("roof_tar", TX0 + 0.3, TH, Z0 + 8.3, X1 - 0.3, TH + 0.12, Z1 - 0.3, {
      noAO: true,
    });
    for (const [x0, z0, x1, z1] of [
      [X0, Z0, TX0, Z0 + 0.4],
      [X0, Z1 - 0.4, TX0, Z1],
      [X0, Z0, X0 + 0.4, Z1],
    ])
      b.box("limestone", x0, AH, z0, x1, AH + 0.9, z1, { seg: false });
    for (let i = 0; i < 4; i++) {
      const x = X0 + 18 + i * 5;
      b.box("steel", x, AH, -345, x + 1.2, AH + 0.9, -343.8, { seg: false });
      b.box("rust", x - 0.1, AH + 0.9, -345.1, x + 1.3, AH + 1.0, -343.7, {
        seg: false,
      });
    }

    // ---------------- EAST FACADE (Eighth Avenue) ----------------
    const FE = P.face(S, "e", Z0, Z1, X1); // u = Z1 - z (u=0 south corner), len 32
    const uDoor = Z1 - DOOR_Z; // 16
    // rusticated terracotta base
    FE.box("limestone", 0, FE.len, 0, 5.4, 0, 0.35);
    for (let y = 0.9; y < 5.4; y += 0.9)
      FE.box("limestone", 0, FE.len, y - 0.04, y + 0.03, 0.33, 0.4, {
        seg: false,
        grime: 0.8,
      });
    FE.band("limestone", 5.3, 5.9, 0, 0.55);
    // piers: 8 bays of 4 m; corner piers wider
    for (let i = 0; i <= 8; i++) {
      const u = i * 4,
        w = i === 0 || i === 8 ? 0.9 : 0.45;
      FE.box(
        "limestone",
        Math.max(0, u - w),
        Math.min(FE.len, u + w),
        5.9,
        25.6,
        0,
        0.32,
        { segLen: 6 },
      );
    }
    // spandrels + windows (paired per bay), rows every 2.45 m
    const rows = [];
    for (let k = 0; k < 8; k++) rows.push({ y: 6.6 + k * 2.45, h: 1.75 });
    const bays = [];
    for (let i = 0; i < 8; i++)
      for (const s of [-0.95, 0.95]) bays.push(i * 4 + 2 + s);
    // leave the blade-sign bay area (u 14..18) with narrower glazing: still windows, the sign hangs in front
    P.windowGrid(
      FE,
      bays.filter((u) => u < FE.len - 8 || true),
      rows,
      {
        w: 1.3,
        frame: "iron",
        sill: "limestone",
        broken: 0.3,
        boarded: 0.06,
        seed: 3,
      },
    );
    for (let k = 0; k < 8; k++)
      FE.band(
        "terracotta",
        6.6 + k * 2.45 - 0.42,
        6.6 + k * 2.45 - 0.22,
        0.02,
        0.16,
        { ext: 0 },
      );
    // gothic crown: pointed arcade over the top floor + pinnacles above the piers
    FE.band("limestone", 25.6, 26.0, 0, 0.5);
    for (let i = 0; i < 8; i++) {
      const u = i * 4 + 2;
      if (u > FE.len - 10 && true) {
        /* collapsed NE corner: arches broken below */
      }
      K.gothicArch(FE, "limestone", u, 26.0, 1.5, 0.25, 0, 0.3);
      if (u < FE.len - 10) K.gothicFill(FE, "glass_dark", u, 26.0, 1.5, 0.05);
    }
    FE.box("limestone", 0, FE.len - 10, 26.0, TH + 0.9, 0, 0.12, {
      seg: false,
    });
    for (let i = 0; i <= 8; i++) {
      const u = i * 4;
      if (u > FE.len - 9) continue;
      const p = FE.pt(u, 0.35);
      K.pinnacle(b, "limestone", p[0], TH + 0.9, p[1], 0.3, 2.4);
    }
    FE.box("limestone", 0, FE.len - 10, TH + 0.6, TH + 0.95, 0, 0.5, {
      seg: false,
    });

    // storefronts either side of the entrance
    for (const [u0, u1] of [
      [1.2, 8.6],
      [23.4, 30.8],
    ]) {
      FE.box("wood_dark", u0, u1, 0.4, 0.8, 0.3, 0.55, { seg: false });
      FE.box(
        u0 < 10 ? "glass_broken" : "glass_dark",
        u0 + 0.1,
        u1 - 0.1,
        0.8,
        3.6,
        0.32,
        0.36,
        { seg: false },
      );
      for (let u = u0; u <= u1 + 0.01; u += (u1 - u0) / 3)
        FE.box("iron", u - 0.06, u + 0.06, 0.4, 3.8, 0.3, 0.5, { seg: false });
      FE.box("iron", u0, u1, 3.6, 3.8, 0.3, 0.5, { seg: false });
      // boarded half
      if (u0 > 10)
        for (let k = 0; k < 5; k++)
          FE.box(
            "wood_rotten",
            u0 + 0.3,
            u1 - 2.5,
            1.0 + k * 0.5,
            1.4 + k * 0.5,
            0.4,
            0.46,
            { seg: false, rz: 0.03 * (k - 2) },
          );
    }
    const shopA = P.texMat(
      "es_shopA",
      P.signTex("es_shopA", ["STAGE DELI"], "neon", 512, 96, { fg: "#ffb060" }),
      { emissive: 0.5 },
    );
    const shopB = P.texMat(
      "es_shopB",
      P.signTex(
        "es_shopB",
        ["GUS'S TV & RADIO REPAIR", "LONLY SALES & SERVICE"],
        "default",
        512,
        96,
        { bg: "#2a3a4a", fg: "#e8e0c0" },
      ),
    );
    FE.quad(shopA, 4.9, 4.4, 5.8, 0.9, 0.52);
    FE.quad(shopB, 27.1, 4.4, 6.4, 0.9, 0.52);
    // entrance: five pairs of brass-framed doors
    for (let k = -2; k <= 2; k++) {
      const u = uDoor + k * 1.9;
      FE.box("gold", u - 0.85, u + 0.85, 0, 3.0, 0.3, 0.42, { seg: false });
      FE.box(
        k === 0 ? "glass_dark" : k === 1 ? "glass_broken" : "glass_dark",
        u - 0.75,
        u + 0.75,
        0.1,
        2.85,
        0.42,
        0.45,
        { seg: false },
      );
      FE.box("gold", u - 0.03, u + 0.03, 0.1, 2.85, 0.44, 0.47, { seg: false });
    }
    FE.box("gold", uDoor - 5, uDoor + 5, 3.0, 3.25, 0.3, 0.5, { seg: false });
    FE.box("glass_dark", uDoor - 4.8, uDoor + 4.8, 3.25, 4.3, 0.33, 0.36, {
      seg: false,
    });

    // ---------------- the MARQUEE ----------------
    const mu0 = uDoor - 9,
      mu1 = uDoor + 9,
      my0 = 4.35,
      my1 = 6.55,
      md = 4.2;
    FE.box("stainless", mu0, mu1, my0, my1, 0.35, md, { seg: false });
    FE.box("iron", mu0 + 0.1, mu1 - 0.1, my0 - 0.12, my0, 0.4, md - 0.1, {
      seg: false,
    });
    // lettered faces (front, both sides)
    const mqF = P.texMat(
      "es_marquee",
      K.marqueeTex(
        "es_front",
        "ED SULLIVAN THEATER",
        ["CIVIL DEFENSE PRESENTS", "THE TOMORROW HOUR  LIVE TONITE"],
        { missing: 0.16 },
      ),
      { emissive: 0.55, rough: 0.5 },
    );
    const mqS = P.texMat(
      "es_marquee_s",
      K.marqueeTex("es_side", "STUDIO 50", ["NOW TAPING", "QUIET PLEASE"], {
        missing: 0.2,
      }),
      { emissive: 0.55, rough: 0.5 },
    );
    {
      const p = FE.pt(uDoor, md + 0.02);
      b.quad(
        mqF,
        p[0],
        (my0 + my1) / 2,
        p[1],
        mu1 - mu0 - 0.4,
        my1 - my0 - 0.3,
        { ry: FE.ry },
      );
    }
    for (const s of [-1, 1]) {
      const u = s < 0 ? mu0 - 0.02 : mu1 + 0.02,
        p = FE.pt(u, (md + 0.35) / 2);
      b.quad(mqS, p[0], (my0 + my1) / 2, p[1], md - 0.6, my1 - my0 - 0.3, {
        ry: s < 0 ? 0 : PI,
      });
    }
    // chaser bulbs top + bottom edge, underside bulb grid
    for (const y of [my1 + 0.06, my0 + 0.05]) {
      const a = FE.pt(mu0, md + 0.05),
        c = FE.pt(mu1, md + 0.05);
      K.bulbs(b, [a[0], y, a[1]], [c[0], y, c[1]], 0.32);
    }
    for (let d = 1.0; d < md - 0.2; d += 0.8) {
      const a = FE.pt(mu0 + 0.4, d),
        c = FE.pt(mu1 - 0.4, d);
      K.bulbs(b, [a[0], my0 - 0.15, a[1]], [c[0], my0 - 0.15, c[1]], 0.6, {
        dead: 0.45,
        r: 0.07,
      });
    }
    {
      const p = FE.pt(uDoor, 2.2);
      S.glow(p[0], my0 - 0.3, p[1], 0xffe0a8, 5.5);
    }
    for (const s of [-1, 1]) {
      const p = FE.pt(uDoor + s * 6, md);
      S.glow(p[0], my1 + 0.2, p[1], 0xffc8a0, 3.2);
    }
    // tie rods up to the facade
    for (const s of [-1, 1]) {
      const a = FE.pt(uDoor + s * 8, md - 0.3),
        c = FE.pt(uDoor + s * 8, 0.3);
      b.rod("iron", [a[0], my1, a[1]], [c[0], my1 + 3.4, c[1]], 0.05, 4);
    }
    // marquee letters fallen onto the sidewalk + rubble on top
    {
      const r = P.rng("esletters");
      for (let i = 0; i < 9; i++) {
        const p = FE.pt(uDoor - 7 + r() * 14, 1.5 + r() * 3);
        b.box(
          "paint_black",
          p[0] - 0.18,
          0.04,
          p[1] - 0.02,
          p[0] + 0.18,
          0.08,
          p[1] + 0.26,
          { ry: r() * 3, seg: false, noAO: true },
        );
      }
    }
    {
      const p = FE.pt(uDoor + 5, 2.5);
      D.rubble(S, p[0], my1, p[1], 1.2, { n: 4, scale: 0.6 });
    }

    // ---------------- the BLADE sign ----------------
    const bl = P.texMat(
      "es_blade",
      K.bladeTex("es", "ED SULLIVAN", { dead: [2, 7] }),
      { emissive: 0.85, rough: 0.5 },
    );
    const bu = uDoor,
      by0 = 7.2,
      by1 = 22.8,
      bd0 = 0.5,
      bd1 = 3.9;
    FE.box("stainless", bu - 0.32, bu + 0.32, by0, by1, bd0, bd1, {
      seg: false,
    });
    for (const s of [-1, 1]) {
      const p = FE.pt(bu + s * 0.33, (bd0 + bd1) / 2);
      b.quad(
        bl,
        p[0],
        (by0 + by1) / 2,
        p[1],
        bd1 - bd0 - 0.15,
        by1 - by0 - 0.2,
        { ry: s < 0 ? 0 : PI },
      );
    }
    {
      const a = FE.pt(bu, bd1 + 0.05);
      K.bulbs(b, [a[0], by0 + 0.2, a[1]], [a[0], by1 - 0.2, a[1]], 0.36);
    }
    FE.box(
      "stainless",
      bu - 0.45,
      bu + 0.45,
      by1,
      by1 + 0.5,
      bd0 - 0.2,
      bd1 + 0.2,
      { seg: false },
    );
    {
      const a = FE.pt(bu, bd1);
      b.cyl("stainless", a[0], by1 + 0.5, a[1], 0.1, 0.35, 0.7, 8);
      b.sphere("bulb", a[0], by1 + 1.3, a[1], 0.18, {
        noAO: true,
        noBake: true,
      });
    }
    for (let k = 0; k < 4; k++) {
      const y = by0 + 1 + k * 4.5,
        a = FE.pt(bu, 0.3),
        c = FE.pt(bu, bd0);
      b.rod("iron", [a[0], y, a[1]], [c[0], y, c[1]], 0.08, 4);
    }
    {
      const p = FE.pt(bu, (bd0 + bd1) / 2);
      for (let k = 0; k < 3; k++)
        S.glow(p[0], by0 + 2.5 + k * 5, p[1], 0xff5a3a, 3.4, {
          flicker: k === 1 ? 0.35 : 0,
        });
    }

    // ---------------- SOUTH FACADE (53rd Street) ----------------
    const FS = P.face(S, "s", X0, X1, Z1); // u = x - X0, len 59
    const tU = TX0 - X0; // 37.5
    FS.box("limestone", tU, FS.len, 0, 5.4, 0, 0.3);
    FS.band("limestone", 5.3, 5.8, 0, 0.45, { ext: 0 });
    const sBays = [];
    for (let u = tU + 2; u < FS.len - 1; u += 2.6) sBays.push(u);
    P.windowGrid(FS, sBays, rows, {
      w: 1.2,
      frame: "iron",
      sill: "limestone",
      broken: 0.28,
      boarded: 0.08,
      seed: 5,
    });
    for (let u = tU + 0.8; u < FS.len; u += 5.2)
      FS.box("limestone", u - 0.3, u + 0.3, 5.8, 25.6, 0, 0.25, { segLen: 6 });
    FS.band("limestone", 25.6, 26.0, 0, 0.45, { ext: 0 });
    for (let u = tU + 2.2; u < FS.len - 1; u += 4.4) {
      K.gothicArch(FS, "limestone", u, 26.0, 1.4, 0.22, 0, 0.25);
      K.gothicFill(FS, "glass_dark", u, 26.0, 1.4, 0.04);
    }
    FS.box("limestone", tU, FS.len, TH + 0.6, TH + 0.95, 0, 0.45, {
      seg: false,
    });
    for (let u = tU; u <= FS.len + 0.01; u += 4.3) {
      const p = FS.pt(Math.min(u, FS.len - 0.3), 0.3);
      K.pinnacle(b, "limestone", p[0], TH + 0.9, p[1], 0.28, 2.2);
    }
    // tower side ground floor: arched windows
    for (let u = tU + 3; u < FS.len - 2; u += 4.2)
      FS.window(u, 1.0, 1.8, 3.6, {
        arch: true,
        style: "boarded",
        frame: "iron",
        sill: "limestone",
        mull: false,
      });
    // auditorium side: plain brick, high arched windows, stage door, loading dock, fire escape, ghost ad
    FS.band("brick_red", AH - 1.2, AH - 0.9, 0, 0.25, { ext: 0 });
    for (let u = 4; u < tU - 2; u += 5.5)
      FS.window(u, 9.5, 1.6, 4.2, {
        arch: true,
        style: "dark",
        frame: "iron",
        sill: "limestone",
        mull: true,
      });
    const suU = STAGE_DOOR_X - X0; // 16
    FS.box("paint_green", suU - 0.7, suU + 0.7, 0, 2.4, 0.02, 0.1, {
      seg: false,
    });
    FS.box("limestone", suU - 0.95, suU + 0.95, 2.4, 2.65, 0, 0.2, {
      seg: false,
    });
    for (const s of [-1, 1])
      FS.box(
        "limestone",
        suU + s * 0.82 - 0.13,
        suU + s * 0.82 + 0.13,
        0,
        2.4,
        0,
        0.18,
        { seg: false },
      );
    FS.box("iron", suU - 1.3, suU + 1.3, 2.9, 3.0, 0, 1.4, { seg: false }); // canopy
    for (const s of [-1, 1]) {
      const a = FS.pt(suU + s * 1.2, 1.35),
        c = FS.pt(suU + s * 1.2, 0.05);
      b.rod("iron", [a[0], 2.95, a[1]], [c[0], 4.0, c[1]], 0.025, 3);
    }
    {
      const p = FS.pt(suU, 0.9);
      b.sphere("bulb", p[0], 2.75, p[1], 0.1, { noAO: true });
      S.glow(p[0], 2.7, p[1], 0xffe0a0, 1.6, { flicker: 0.4 });
    }
    const sd = P.texMat(
      "es_stagedoor",
      P.signTex(
        "es_stagedoor",
        ["STAGE DOOR", "Studio 50 · Artists & Crew Only"],
        "default",
        512,
        160,
        { bg: "#1c2a20", fg: "#e8dcb0" },
      ),
    );
    FS.quad(sd, suU, 3.35, 1.8, 0.56, 0.12);
    // loading dock
    FS.box("corrugated", 21, 26, 0, 4.2, 0.02, 0.12, { seg: false });
    FS.box("iron", 20.8, 26.2, 4.2, 4.45, 0, 0.3, { seg: false });
    FS.box("concrete", 20.5, 26.5, 0, 1.0, 0, 1.6, { seg: false });
    {
      const p0 = FS.pt(20.5, 0),
        p1 = FS.pt(26.5, 1.6);
      S.col(
        Math.min(p0[0], p1[0]),
        0,
        Math.min(p0[1], p1[1]),
        Math.max(p0[0], p1[0]),
        1.0,
        Math.max(p0[1], p1[1]),
      );
    }
    K.fireEscape(FS, 29, 33.5, 5.4, 3.0, 4, {});
    // painted ghost ad high on the auditorium wall
    try {
      if (!G.isStub("mats") && G.mats.billboard) {
        const bm = "tex:es_ghost1";
        const k = P.texMat("es_ghost1", G.mats.billboard("long_winter").map, {
          rough: 0.95,
        });
        void bm;
        FS.quad(k, 11, 13.2, 14, 5.2, 0.28, { grime: 0.5 });
      }
    } catch (e) {
      /* optional */
    }

    // ---------------- NORTH + WEST ----------------
    const FN = P.face(S, "n", X0, X1, Z0); // u = X1 - x
    const nBays = [];
    for (let u = 2; u < X1 - TX0 - 1; u += 2.6) nBays.push(u);
    P.windowGrid(FN, nBays, rows.slice(0, 7), {
      w: 1.2,
      frame: "iron",
      sill: "limestone",
      broken: 0.35,
      seed: 7,
    });
    FN.band("limestone", 5.3, 5.8, 0, 0.3, { ext: 0 });
    K.fireEscape(FN, X1 - TX0 - 9, X1 - TX0 - 4.5, 6.6, 2.45, 6, {});
    for (let u = X1 - TX0 + 4; u < FN.len - 3; u += 6)
      FN.window(u, 9.5, 1.6, 4.2, {
        arch: true,
        style: "dark",
        frame: "iron",
        sill: "limestone",
        mull: true,
      });
    try {
      if (!G.isStub("mats") && G.mats.billboard) {
        const k = P.texMat("es_ghost2", G.mats.billboard("fizzo_cola").map, {
          rough: 0.95,
        });
        FN.quad(k, X1 - TX0 + 18, 12.5, 13, 5, 0.28, { grime: 0.5 });
      }
    } catch (e) {
      /* optional */
    }
    const FW = P.face(S, "w", Z0, Z1, X0); // u = z - Z0
    const ghost = P.texMat(
      "es_ghost3",
      P.signTex("es_ghost3", ["ED SULLIVAN THEATRE"], "engraved", 1024, 128, {
        bg: "#6a4a36",
        fg: "rgba(230,220,190,0.55)",
      }),
      { rough: 1 },
    );
    FW.quad(ghost, FW.len / 2, AH + 3.5, 22, 2.6, 0.02);
    for (let u = 4; u < FW.len - 2; u += 6)
      FW.window(u, 3.0, 1.2, 2.2, {
        style: "boarded",
        frame: "iron",
        sill: "limestone",
        mull: false,
      });
    FW.box("paint_green", 14.6, 16.2, 0, 2.3, 0.02, 0.1, { seg: false });

    // ---------------- roof furniture ----------------
    K.waterTower(b, -146, TH + 0.1, -334, 2.1, 3.4, { legH: 2.8 });
    K.mast(b, -140, TH + 0.1, -338, 16, 1.1);
    for (const x of [-148, -140])
      b.box("brick_red", x - 0.6, TH, -330.4, x + 0.6, TH + 2.2, -329.2, {
        seg: false,
      });
    b.box("corrugated", -150, TH, -348, -144, TH + 3.2, -343, { seg: false }); // elevator bulkhead
    // ---------------- collapse (north-east crown) ----------------
    // exposed floor slabs + bent girders at the broken corner, heap of masonry on the sidewalk below
    for (let k = 0; k < 3; k++) {
      const y = 23 + k * 2.4;
      if (k < 2)
        b.box(
          "concrete",
          X1 - 10,
          y - 0.25,
          Z0 + 0.3,
          X1 - 3 - k * 2.5,
          y,
          Z0 + 8,
          { rz: -0.04 * k, seg: false },
        );
      for (let i = 0; i < 3; i++)
        b.rod(
          "rust",
          [X1 - 10 + i * 0.1, y, Z0 + 2 + i * 2.5],
          [X1 - 4 + i * 1.1, y + 1.4 - i * 0.6, Z0 + 1 + i * 2.8],
          0.1,
          4,
          { square: true },
        );
    }
    b.box("brick_tan", X1 - 10.3, 23, Z0, X1 - 10, TH - 1.2, Z0 + 8, {
      seg: false,
    });
    D.rubble(S, X1 + 3.5, 0, Z0 + 3, 4.2, {
      n: 18,
      slab: true,
      rebar: true,
      col: true,
      colH: 0.6,
    });
    D.rubble(S, X1 + 1.5, 0, Z0 + 8, 2.2, { n: 8 });
    // Civil Defense banner torn on the marquee side
    const ban = P.texMat(
      "es_banner",
      P.signTex(
        "es_banner",
        ["PREPARE FOR", "THE FUTURE!"],
        "banner",
        256,
        512,
        { bg: "#244a8a", fg: "#f4d04a", top: 0.2 },
      ),
      { double: true, rough: 1 },
    );
    for (const s of [-1, 1]) {
      const p = FE.pt(uDoor + s * 11.5, 0.45);
      b.quad(ban, p[0], 12.5, p[1], 1.6, 3.4, { ry: FE.ry });
    }
    // street-level posters in frames
    for (let i = 0; i < 2; i++) {
      const pk = P.texMat("es_poster" + i, posterTex(i), { rough: 0.9 });
      FE.quad(pk, i === 0 ? 10.05 : 21.95, 1.9, 1.1, 1.65, 0.46);
    }
    for (let i = 0; i < 4; i++) {
      const pk = P.texMat("es_poster" + i, posterTex(i), { rough: 0.9 });
      FS.quad(pk, tU + 5 + i * 4.2, 1.9, 1.1, 1.65, 0.32);
    }

    S.anchor("exterior_entrance", X1 + 2.4, 0, DOOR_Z, -HP);
    S.anchor("stage_door", STAGE_DOOR_X, 0, Z1 + 2.4, PI);
    S.build({ shadow: true, lod: 300 });
    return S;
  }

  // ===================================================================
  // INTERIOR (local coordinates; origin = INTERIORS.ed_sullivan.origin)
  // ===================================================================
  // Levels: lobby 0 · auditorium back 0 → rows down to -2.1 · camera floor -2.1 · stage & backstage -1.0 ·
  // basement -4.5 · upper (control room / balcony back) 6.5 · balcony front 4.6.
