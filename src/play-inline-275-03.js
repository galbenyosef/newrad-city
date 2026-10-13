// play-inline-275 03 — attic
// Lines 60-633 of readable/play-inline-275.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("sanremo_ext", { grime: 0.5 });
    const b = S.b;
    b.box("sidewalk", -187.9, 0, -899.9, -132.1, 0.03, -850.1, {
      segLen: 8,
      grime: 0.6,
      noAO: true,
    });
    // ---------- masses (U plan: east body + two west wings round a light court) ----------
    const masses = [
      [-170, Z0, X1, Z1],
      [X0, Z0, -170, Z0 + 17],
      [X0, Z1 - 17, -170, Z1],
    ];
    for (const [x0, z0, x1, z1] of masses) {
      b.box(
        "limestone_warm",
        x0 - 0.12,
        0,
        z0 - 0.12,
        x1 + 0.12,
        6.2,
        z1 + 0.12,
        { segLen: 6 },
      );
      b.box("brick_tan", x0, 6.2, z0, x1, BODY, z1, { segLen: 6 });
      S.col(x0, 0, z0, x1, BODY, z1);
    }
    // penthouse setback + towers
    b.box("brick_tan", -167, BODY, Z0 + 3, -137, PENT, Z1 - 3, { segLen: 6 });
    S.col(-167, BODY, Z0 + 3, -137, PENT, Z1 - 3);
    for (const [x0, z0, x1, z1] of [
      [X0 + 2, Z0 + 2, -172, Z0 + 15],
      [X0 + 2, Z1 - 15, -172, Z1 - 2],
    ]) {
      b.box("brick_tan", x0, BODY, z0, x1, BODY + 3.2, z1, { segLen: 6 });
      S.col(x0, BODY, z0, x1, BODY + 3.2, z1);
    }
    for (const tz of TZ) {
      b.box("brick_tan", TX - 7, BODY, tz - 7, TX + 7, TOWER, tz + 7, {
        segLen: 6,
      });
      S.col(TX - 7, 0, tz - 7, TX + 7, TOWER, tz + 7);
    }
    // ---------- facades ----------
    const facade = (side, a0, a1, c, o) => {
      o = o || {};
      const F = P.face(S, side, a0, a1, c);
      F.band("limestone_warm", 5.9, 6.5, 0, 0.35);
      F.band("limestone_warm", 16.6, 16.9, 0, 0.2);
      F.band("limestone_warm", 39.4, 39.7, 0, 0.2);
      F.cornice("limestone_warm", BODY - 1.2, 1.3, { step: 0.9 });
      // rustication on the base
      for (let y = 0.8; y < 5.8; y += 0.8)
        F.box("limestone_dark", 0, F.len, y - 0.035, y + 0.035, 0.1, 0.15, {
          seg: false,
          grime: 0.9,
        });
      // quoins at both ends
      for (const u of [0, F.len])
        for (let y = 6.4, i = 0; y < BODY - 1.5; y += 0.8, i++)
          F.box(
            "limestone_warm",
            u + (u === 0 ? 0 : -(i % 2 ? 0.9 : 1.5)),
            u + (u === 0 ? (i % 2 ? 0.9 : 1.5) : 0),
            y,
            y + 0.72,
            0,
            0.12,
            { seg: false },
          );
      const bays = [];
      for (let u = o.u0 || 1.8; u < F.len - (o.u1 || 1.6); u += 2.9)
        if (!(o.skip && o.skip(u))) bays.push(u);
      P.windowGrid(
        F,
        bays,
        ROWS.filter((R) => R.y < (o.maxY || BODY)),
        {
          sill: "limestone_warm",
          hoodKey: "limestone_warm",
          frame: "paint_cream",
          broken: 0.12,
          boarded: 0.05,
          lit: o.lit || 0.03,
          seed: o.seed,
          w: 1.1,
        },
      );
      // ground: tall arched windows in the base
      for (const u of bays)
        if (!(o.skipGround && o.skipGround(u)))
          F.window(u, 1.0, 1.2, 3.8, {
            arch: true,
            style: "dark",
            frame: "iron",
            sill: "limestone_warm",
            mull: true,
            keystone: "limestone_warm",
          });
      return F;
    };
    const towerSkip = (u) => false;
    facade("e", Z0, Z1, X1, {
      seed: 3,
      skipGround: (u) => Math.abs(u - 23) < 3.6,
      skip: (u) => Math.abs(u - 23) < 2,
      lit: 0.05,
    });
    facade("n", X0, X1, Z0, { seed: 5 });
    facade("s", X0, X1, Z1, { seed: 7 });
    facade("w", Z0, Z0 + 17, X0, { seed: 9, u0: 1.6 });
    facade("w", Z1 - 17, Z1, X0, { seed: 11, u0: 1.6 });
    facade("w", Z0 + 17, Z1 - 17, -170, { seed: 13, u0: 1.2, u1: 1.2 });
    facade("n", X0, -170, Z1 - 17, { seed: 15, u0: 1.4 });
    facade("s", X0, -170, Z0 + 17, { seed: 17, u0: 1.4 });
    void towerSkip;
    // setback terraces: balustrades + urns + penthouse windows (lit)
    for (const [x0, z0, x1, z1] of [
      [-169.6, Z0 + 0.4, X1 - 0.4, Z0 + 0.4],
      [-169.6, Z1 - 0.4, X1 - 0.4, Z1 - 0.4],
      [-169.6, Z0 + 0.4, -169.6, Z1 - 0.4],
    ])
      X.balustrade(S, x0, z0, x1, z1, BODY, {
        key: "limestone_warm",
        col: false,
        broken: 0.08,
      });
    X.balustrade(S, X1 - 0.4, Z0 + 14.4, X1 - 0.4, Z1 - 14.4, BODY, {
      key: "limestone_warm",
      col: false,
    });
    for (const [x, z] of [
      [-169.6, Z0 + 0.4],
      [-169.6, Z1 - 0.4],
      [X1 - 0.4, Z0 + 14.4],
      [X1 - 0.4, Z1 - 14.4],
    ])
      X.urn(b, x, BODY + 1.0, z, 0.9);
    for (const [side, a0, a1, c] of [
      ["e", Z0 + 3, Z1 - 3, -137],
      ["n", -167, -137, Z0 + 3],
      ["s", -167, -137, Z1 - 3],
      ["w", Z0 + 3, Z1 - 3, -167],
    ]) {
      const F = P.face(S, side, a0, a1, c);
      F.cornice("limestone_warm", PENT - 0.7, 0.7, { mods: false });
      const bays = [];
      for (let u = 2; u < F.len - 1.5; u += 3.2) bays.push(u);
      P.windowGrid(F, bays, [{ y: BODY + 1.2, h: 2.4, arch: true }], {
        sill: "limestone_warm",
        frame: "paint_cream",
        broken: 0.05,
        boarded: 0.05,
        lit: 0.55,
        seed: c,
        w: 1.4,
      });
    }
    // ---------- towers ----------
    for (let ti = 0; ti < 2; ti++) {
      const tz = TZ[ti];
      for (const [side, a0, a1, c] of [
        ["e", tz - 7, tz + 7, TX + 7],
        ["w", tz - 7, tz + 7, TX - 7],
        ["n", TX - 7, TX + 7, tz - 7],
        ["s", TX - 7, TX + 7, tz + 7],
      ]) {
        const F = P.face(S, side, a0, a1, c);
        for (const u of [0, F.len])
          for (let y = BODY, i = 0; y < TOWER - 0.5; y += 0.8, i++)
            F.box(
              "limestone_warm",
              u + (u === 0 ? 0 : -(i % 2 ? 0.9 : 1.5)),
              u + (u === 0 ? (i % 2 ? 0.9 : 1.5) : 0),
              y,
              y + 0.72,
              0,
              0.12,
              { seg: false },
            );
        const bays = [3.6, 7, 10.4];
        P.windowGrid(F, bays, TROWS, {
          sill: "limestone_warm",
          frame: "paint_cream",
          broken: 0.1,
          boarded: 0.05,
          lit: 0.12,
          seed: c + ti,
          w: 1.1,
        });
        F.band("limestone_warm", BODY - 0.1, BODY + 0.35, 0, 0.3);
        F.cornice("limestone_warm", TOWER - 0.4, 0.9, { step: 0.8 });
        // loggia stage (arched openings, dark voids)
        for (const u of [3.2, 7, 10.8]) {
          F.box(
            "glass_dark",
            u - 1.1,
            u + 1.1,
            TOWER + 0.6,
            TOWER + 2.8,
            -0.02,
            0.02,
            { seg: false },
          );
          F.halfDisc("glass_dark", u, TOWER + 2.8, 1.1, 0.02);
          F.arch("limestone_warm", u, TOWER + 2.8, 1.1, 0.25, 0, 0.25);
          for (const s of [-1, 1])
            F.box(
              "limestone_warm",
              u + s * 1.3 - 0.2,
              u + s * 1.3 + 0.2,
              TOWER + 0.5,
              TOWER + 2.8,
              0,
              0.35,
              { seg: false },
            );
        }
        F.cornice("limestone_warm", LOGGIA - 0.6, 0.7, { mods: false });
      }
      b.box(
        "brick_tan",
        TX - 6.9,
        TOWER,
        tz - 6.9,
        TX + 6.9,
        LOGGIA,
        tz + 6.9,
        { segLen: 4 },
      );
      // attic 13×13 with corner urns + balustrade walkway round the temple
      b.box(
        "limestone_warm",
        TX - 6.5,
        LOGGIA,
        tz - 6.5,
        TX + 6.5,
        ATTIC,
        tz + 6.5,
        { segLen: 4 },
      );
      b.box(
        "limestone_warm",
        TX - 6.8,
        ATTIC - 0.3,
        tz - 6.8,
        TX + 6.8,
        ATTIC,
        tz + 6.8,
        { seg: false },
      );
      S.col(TX - 7, TOWER, tz - 7, TX + 7, ATTIC, tz + 7, {
        surface: "concrete",
      });
      for (const [a, c2, e, f] of [
        [-6.3, -6.3, 6.3, -6.3],
        [-6.3, 6.3, 6.3, 6.3],
        [-6.3, -6.3, -6.3, 6.3],
        [6.3, -6.3, 6.3, 6.3],
      ])
        X.balustrade(S, TX + a, tz + c2, TX + e, tz + f, ATTIC, {
          key: "limestone_warm",
          h: 1.05,
        });
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        X.urn(b, TX + sx * 6.3, ATTIC + 1.05, tz + sz * 6.3, 1.1);
      b.box(
        "roof_tar",
        TX - 6.1,
        ATTIC,
        tz - 6.1,
        TX + 6.1,
        ATTIC + 0.03,
        tz + 6.1,
        { seg: false, grime: 0.7 },
      );
      // the temple
      const th = X.tholos(S, TX, ATTIC, tz, 3.4, 4.8, {
        cols: 10,
        lit: true,
        key: "limestone_warm",
        finial: "verdigris",
      });
      S.col(TX - 4.3, ATTIC, tz - 4.3, TX + 4.3, th.top - 3, tz + 4.3, {
        walkable: false,
      });
      void th;
    }
    // ---------- entrance portal (east / CPW) ----------
    {
      const F = P.face(S, "e", Z0, Z1, X1),
        uc = 23;
      F.box("limestone_warm", uc - 4, uc + 4, 0, 9.5, 0, 0.9);
      F.box("glass_dark", uc - 1.8, uc + 1.8, 0.02, 4.0, 0.9, 0.95, {
        seg: false,
      });
      F.arch("limestone_warm", uc, 4.0, 1.8, 0.6, 0.85, 1.3);
      F.halfDisc("glass_dark", uc, 4.0, 1.8, 0.93);
      F.box("bronze", uc - 1.7, uc + 1.7, 0.02, 3.4, 0.95, 1.02, {
        seg: false,
      });
      F.box("iron", uc - 0.03, uc + 0.03, 0.02, 3.4, 1.02, 1.05, {
        seg: false,
      });
      for (const s of [-1, 1]) {
        const p = F.pt(uc + s * 3.1, 1.3);
        b.lathe(
          "limestone_warm",
          [
            [0.001, 0],
            [0.45, 0],
            [0.42, 0.3],
            [0.32, 0.45],
            [0.3, 6.2],
            [0.4, 6.5],
            [0.5, 6.8],
            [0.001, 6.8],
          ],
          12,
          p[0],
          0,
          p[1],
        );
      }
      F.box("limestone_warm", uc - 4.2, uc + 4.2, 6.8, 7.8, 0.3, 1.9, {
        seg: false,
      });
      const sh = new THREE.Shape();
      sh.moveTo(-4.3, 0);
      sh.lineTo(4.3, 0);
      sh.absarc(0, 0, 4.3, 0, PI, false);
      sh.closePath();
      b.extrude("limestone_warm", sh, 0.5, F.mat(uc, 7.8, 0.4), { seg: false });
      const np = P.texMat(
        "sr_name",
        P.signTex("sr_name", ["THE  SAN  REMO"], "engraved", 1024, 128, {
          bg: "#d8ccb0",
          fg: "rgba(60,50,38,0.92)",
          spacing: 10,
        }),
        { rough: 0.9 },
      );
      F.quad(np, uc, 7.3, 7.2, 0.85, 1.92);
      const ad = P.texMat(
        "sr_addr",
        P.signTex(
          "sr_addr",
          ["145 · 146 CENTRAL PARK WEST"],
          "bronze",
          512,
          64,
        ),
        { transparent: true },
      );
      F.quad(ad, uc, 5.2, 3.6, 0.45, 0.96);
      // canopy
      F.box("bronze", uc - 2.6, uc + 2.6, 3.9, 4.15, 1.0, 5.2, { seg: false });
      for (const s of [-1, 1]) {
        const p = F.pt(uc + s * 2.4, 5.0);
        b.cyl("bronze", p[0], 0, p[1], 0.06, 0.08, 3.9, 6);
      }
      // commune banner + beacon lamps
      const ban = P.texMat(
        "sr_banner",
        P.signTex(
          "sr_banner",
          ["SAN REMO", "COMMUNE", "", "TRADERS", "WELCOME", "NO RAIDERS"],
          "banner",
          256,
          640,
          { bg: "#2a4a3a", fg: "#e8dcb8", size: 30, top: 0.08 },
        ),
        { double: true },
      );
      for (const s of [-1, 1]) F.quad(ban, uc + s * 5.6, 12, 2.2, 5.5, 0.14);
      for (const s of [-1, 1]) {
        const p = F.pt(uc + s * 4.4, 1.2);
        b.sphere("lamp_warm", p[0], 5.2, p[1], 0.22, { ws: 8, hs: 6 });
        S.glow(p[0], 5.2, p[1], 0xffc070, 1.1);
        b.rod("iron", [p[0], 4.6, p[1]], [p[0], 5.0, p[1]], 0.02, 3);
      }
      S.anchor("exterior_entrance", X1 + 3.2, 0, ZC, -HP);
      S.anchor("street", X1 + 6, 0, ZC + 8, -HP);
    }
    // ---------- settler fortifications at the door ----------
    {
      const x = X1 + 5.5;
      for (const [z0, z1] of [
        [ZC - 12, ZC - 3.2],
        [ZC + 3.2, ZC + 12],
      ]) {
        const n = Math.round((z1 - z0) / 1.25);
        for (let i = 0; i < n; i++) {
          const z = z0 + i * 1.25,
            r = P.rng(z * 3)();
          b.box(
            r < 0.5 ? "corrugated" : "rust",
            x - 0.06,
            0,
            z,
            x + 0.06,
            2.0 + r * 0.8,
            z + 1.3,
            { seg: false, rz: (r - 0.5) * 0.08 },
          );
          b.rod(
            "wood_rotten",
            [x + 0.15, 0, z + 0.6],
            [x + 0.15, 2.6, z + 0.6],
            0.06,
            4,
          );
        }
        S.col(x - 0.2, 0, z0, x + 0.2, 2.5, z1, { walkable: false });
      }
      for (const s of [-1, 1]) {
        b.rod(
          "wood_rotten",
          [x, 0, ZC + s * 3.2],
          [x, 3.6, ZC + s * 3.2],
          0.1,
          5,
        );
      }
      b.rod("wood_rotten", [x, 3.6, ZC - 3.3], [x, 3.6, ZC + 3.3], 0.08, 4);
      const gs = P.texMat(
        "sr_gate",
        P.signTex(
          "sr_gate",
          ["SAN REMO", "STATE YOUR BUSINESS"],
          "raider",
          512,
          160,
          { fg: "#e8e0c8" },
        ),
        { transparent: true, double: true },
      );
      b.quad(gs, x + 0.12, 3.1, ZC, 3.6, 1.1, { ry: HP });
      S.prop("sandbags", X1 + 3.8, 0, ZC - 4.6, 0, { curved: true });
      S.prop("sandbags", X1 + 3.8, 0, ZC + 4.6, PI, { curved: true });
      S.prop("barrel", X1 + 7, 0, ZC - 2.8, 0, { burning: true });
      S.glow(X1 + 7, 1.3, ZC - 2.8, 0xff9040, 1.4);
      S.prop("lamp", X1 + 7, 0, ZC + 2.8, 0, { kind: "lantern" });
      S.anchor("gate", x + 1.5, 0, ZC, -HP);
      S.anchor("guard_gate", X1 + 6.6, 0, ZC + 4, -HP);
    }
    // west light court: a dead garden
    b.box("dirt", X0, 0.01, Z0 + 17, -170, 0.06, Z1 - 17, {
      seg: false,
      grime: 0.7,
    });
    for (const [x, z] of [
      [-181, -878],
      [-176, -872],
      [-182, -869],
    ]) {
      const r = P.rng(x + z);
      b.rod(
        "wood_rotten",
        [x, 0, z],
        [x + r() - 0.5, 5, z + r() - 0.5],
        0.14,
        5,
        { rTop: 0.05 },
      );
      for (let k = 0; k < 5; k++)
        b.rod(
          "wood_rotten",
          [x, 2.5 + k * 0.5, z],
          [x + (r() - 0.5) * 3.5, 3.6 + k * 0.5, z + (r() - 0.5) * 3.5],
          0.04,
          3,
        );
    }
    // rooftop clutter: water tanks, antenna, the commune's rain catchers
    X.waterTower(b, -160, PENT, -870, { r: 1.8, h: 3, legs: 2.6 });
    for (let i = 0; i < 4; i++) {
      b.cyl("rust", -165 + i * 2.2, PENT, -858, 0.5, 0.5, 1.0, 10);
      b.cyl("canvas", -165 + i * 2.2, PENT + 1.0, -858, 0.9, 0.5, 0.25, 10, {
        open: true,
      });
    }
    b.rod("iron", [-150, PENT, -878], [-150, PENT + 12, -878], 0.06, 4);
    for (let k = 0; k < 4; k++)
      b.rod(
        "iron",
        [-150, PENT + 4 + k * 2.4, -878],
        [-148.6, PENT + 3.5 + k * 2.4, -878],
        0.02,
        3,
      );
    // the north-tower hatch (door back down to the commune)
    {
      const tz = TZ[0],
        hx = TX - 5.2,
        hz = tz;
      b.box(
        "metal",
        hx - 0.6,
        ATTIC,
        hz - 0.6,
        hx + 0.6,
        ATTIC + 0.15,
        hz + 0.6,
        { seg: false },
      );
      b.box(
        "metal",
        hx - 0.55,
        ATTIC + 0.1,
        hz - 0.62,
        hx + 0.55,
        ATTIC + 1.2,
        hz - 0.55,
        { seg: false, rx: -0.3 },
      );
      b.box(
        "roof_tar",
        hx - 0.45,
        ATTIC + 0.14,
        hz - 0.45,
        hx + 0.45,
        ATTIC + 0.16,
        hz + 0.45,
        { seg: false },
      );
      S.anchor("tower_hatch", hx, ATTIC, hz, 0);
      S.anchor("tower_arrive", hx + 0.2, ATTIC, hz + 1.4, PI); // on the walkway, facing along it (the temple wall is 0.7 m east)
      S.anchor("birdie", TX + 5.2, ATTIC, tz + 1.5, -HP);
      S.anchor("lookout", TX + 5.2, ATTIC, tz - 1.5, -HP);
      // Birdie's nest: sandbags, a cot, spotting scope
      b.box(
        "canvas",
        TX + 3.8,
        ATTIC,
        tz + 3.5,
        TX + 5.8,
        ATTIC + 0.35,
        tz + 5.9,
        { seg: false },
      );
      for (const dz of [-3.5, 3.5])
        b.box(
          "canvas",
          TX + 5.5,
          ATTIC,
          tz + dz - 0.9,
          TX + 6.2,
          ATTIC + 0.8,
          tz + dz + 0.9,
          { seg: false },
        );
      b.rod(
        "iron",
        [TX + 5.8, ATTIC, tz],
        [TX + 5.8, ATTIC + 1.3, tz],
        0.03,
        3,
      );
      b.cyl("iron", TX + 5.8, ATTIC + 1.3, tz, 0.06, 0.08, 0.5, 6, { rz: HP });
    }
    S.build({ shadow: true, lod: 320 });
    return S;
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
