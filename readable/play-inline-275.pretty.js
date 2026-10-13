/* src/poi_uws/20_sanremo.js */
/* =====================================================================
 * NEW RAD CITY — POI UPPER WEST SIDE · 20 The San Remo
 *
 * EXTERIOR (site x -188..-132, z -900..-850; entrance on the east face,
 * Central Park West): Emery Roth's 1930 twin-towered apartment house —
 * a buff-brick U-plan block on a rusticated limestone base, quoined
 * corners, string courses, a heavy cornice and balustraded setback
 * terraces, and the two towers on the park frontage, each crowned by a
 * loggia stage, an attic with urns and a round Corinthian temple
 * (tholos) with a lantern. Settled: sandbags and scrap gate at the door,
 * the commune banner, lit penthouse windows, the tower beacons — and
 * Birdie, the commune's sniper, on the north tower's walkway.
 * INTERIOR (cell 'san_remo', origin 7800,0,1200):
 *   lobby (y 0): doorman's desk, checkpoint, mailboxes, notice board,
 *   generator room powering the one working elevator.
 *   elevator → PENTHOUSE COMMUNE (y 40): great room (refectory table,
 *   cook drum, string lights, piano), conservatory garden (the seed quest),
 *   Mercer's trading post in the library, Doc Halloway's clinic,
 *   Adeline's office, dormitory, pantry, and the tower stair up to the
 *   north tower lookout (exterior).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._uw) return;
  const P = G._uw,
    D = P.dress,
    X = P.parts;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  const X0 = -186,
    X1 = -134,
    Z0 = -898,
    Z1 = -852,
    ZC = -875;
  const BODY = 50,
    PENT = 56,
    TOWER = 70,
    LOGGIA = 74,
    ATTIC = 77.5;
  const TX = -141,
    TZ = [-891, -859]; // tower centres (14×14, flush with the park front)
  const ROWS = [];
  for (let i = 0; i < 13; i++)
    ROWS.push({
      y: 7.2 + i * 3.2,
      h: 1.9,
      hood: i === 0 ? "pediment" : i === 12 ? "cornice" : undefined,
    });
  const TROWS = [];
  for (let i = 0; i < 4; i++) TROWS.push({ y: 57.2 + i * 3.2, h: 1.9 });

  // ===================================================================
  // EXTERIOR
  // ===================================================================
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
  const PY = 40; // penthouse floor (local)
  function buildInterior() {
    const O = P.I("san_remo");
    const S = P.site("sanremo_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x625a4c,
      ambI: 0.34,
      interiorKey: "san_remo",
    });
    const b = S.b;
    // ------------------------------------------------------------------
    // LOBBY (y 0): x -10..10, z -6..16
    // ------------------------------------------------------------------
    const H = 5.2;
    S.room({
      x0: -10,
      z0: -6,
      x1: 10,
      z1: 16,
      y: 0,
      h: H,
      wall: "wood_oak",
      floor: "marble",
      ceil: "plaster_cream",
      trim: "bronze",
      holes: {
        s: [[-1.3, 1.3, 0, 3.4]],
        e: [[-3.5, 1.5, 0, 3]],
        w: [[4, 7, 0, 3]],
      },
      frame: "limestone_warm",
      surface: "concrete",
    });
    b.box("marble_green", -9.8, 0.005, -5.8, 9.8, 0.012, -5.2, {
      seg: false,
      noAO: true,
    });
    D.rug(b, -1.6, -3, 1.6, 15, 0.01, "carpet_red");
    // coffered ceiling beams + arcade pilasters
    for (let z = -4; z < 16; z += 3)
      b.box("wood_dark", -10, H - 0.5, z - 0.15, 10, H - 0.08, z + 0.15, {
        seg: false,
      });
    for (const x of [-9.8, 9.8])
      for (let z = -3; z < 16; z += 4) {
        b.box(
          "limestone_warm",
          x - 0.2,
          0,
          z - 0.3,
          x + 0.2,
          H - 0.5,
          z + 0.3,
          { seg: false },
        );
      }
    // chandeliers
    D.chandelier(S, 0, H - 1.1, 2, 0.8, {
      tiers: 2,
      chain: 0.9,
      li: 0.95,
      lr: 10,
    });
    D.chandelier(S, 0, H - 1.1, 11, 0.8, {
      tiers: 2,
      chain: 0.9,
      li: 0.95,
      lr: 10,
    });
    // elevator bank (north wall z=-6): the working car (lit) + a boarded one
    for (const [ex, live] of [
      [-2.2, true],
      [2.2, false],
    ]) {
      b.box("brass", ex - 1.0, 0, -5.82, ex + 1.0, 3.3, -5.76, { seg: false });
      b.box("brass", ex - 0.75, 0, -5.78, ex - 0.02, 2.7, -5.7, { seg: false });
      b.box("brass", ex + 0.02, 0, -5.78, ex + 0.75, 2.7, -5.7, { seg: false });
      b.cyl("brass", ex, 3.45, -5.78, 0.3, 0.3, 0.04, 14, {
        rx: HP,
        noAO: true,
      });
      if (live) {
        b.sphere("lamp_warm", ex, 3.45, -5.72, 0.06, { ws: 6, hs: 4 });
        S.glow(ex, 3.45, -5.6, 0xffc070, 0.35);
        b.box("lamp_warm", ex + 1.1, 1.3, -5.78, ex + 1.2, 1.45, -5.7, {
          seg: false,
        });
      } else
        for (let i = 0; i < 3; i++)
          b.box(
            "wood_rotten",
            ex - 0.9,
            0.5 + i * 0.9,
            -5.72,
            ex + 0.9,
            0.72 + i * 0.9,
            -5.65,
            { seg: false, rz: (i - 1) * 0.08 },
          );
    }
    const el = P.texMat(
      "sr_elev",
      P.signTex(
        "sr_elev",
        ["ELEVATOR → PENTHOUSE", "COMMUNE MEMBERS & GUESTS"],
        "plain",
        512,
        96,
        { bg: "#2a4a3a", fg: "#e8dcb8" },
      ),
      {},
    );
    b.quad(el, -2.2, 3.95, -5.74, 2.2, 0.42, {});
    S.anchor("elevator_lobby", -2.2, 0, -3.6, PI);
    // doorman's desk + checkpoint
    b.box("wood_dark", 3.5, 0, 9.5, 7.5, 1.1, 10.3, { seg: false });
    b.box("marble", 3.45, 1.1, 9.45, 7.55, 1.16, 10.35, { seg: false });
    S.col(3.5, 0, 9.5, 7.5, 1.16, 10.3, { walkable: false });
    S.prop("terminal", 6.4, 1.16, 9.9, PI, {
      terminalId: "uw_sr_lobby",
      mount: "bare",
    });
    S.prop("radio", 4.4, 1.16, 9.8, PI, {});
    D.chair(b, 5.5, 0, 8.8, PI, { seat: "leather" });
    S.anchor("gus", 5.5, 0, 8.6, PI);
    for (const [x, z, ry] of [
      [-4.5, 7.5, 0],
      [-6, 7.5, 0],
      [4, 5.2, 0.3],
    ])
      S.prop("sandbags", x, 0, z, ry, {});
    S.prop("lamp", -3.2, 0, 7.9, 0, { kind: "floor" });
    S.light(-3.2, 1.8, 7.9, 0xffd8a0, 6, 0.7);
    // mailboxes + notice board
    for (let i = 0; i < 10; i++)
      for (let j = 0; j < 4; j++)
        b.box(
          "brass",
          -9.8,
          0.6 + j * 0.38,
          9 + i * 0.52,
          -9.72,
          0.92 + j * 0.38,
          9.45 + i * 0.52,
          { seg: false, noAO: true },
        );
    const nb = P.texMat(
      "sr_notice",
      P.signTex(
        "sr_notice",
        [
          "COMMUNE NOTICES",
          "Water ration: 2 cups",
          "Night watch: Birdie + ?",
          "SEEDS WANTED — ask Adeline",
          "Toby, come home. — B.",
        ],
        "label",
        512,
        400,
      ),
      {},
    );
    b.quad(nb, 9.78, 1.8, 3.5, 1.5, 1.2, { ry: -HP });
    S.pickup("uw_note_sr_notice", 1, 9.6, 1.1, 5.2);
    // lounge (west): couches, card table, radio
    D.sofa(b, -7, 0, 2, HP, { fabric: "velvet" });
    D.table(b, -5.4, 0, 0, { r: 0.5, top: "wood_dark", leg: "wood_dark" });
    D.chair(b, -4.6, 0, -0.8, 0.8);
    D.chair(b, -6.1, 0, -0.9, -0.6);
    for (let i = 0; i < 5; i++)
      b.box(
        "paper",
        -5.6 + i * 0.1,
        0.76,
        -0.1 + (i % 2) * 0.1,
        -5.5 + i * 0.1,
        0.765,
        0.05 + (i % 2) * 0.1,
        { seg: false, noAO: true },
      );
    // west door → stair (closed)
    b.box("wood_dark", -10.2, 0, 4.2, -10.1, 2.9, 6.8, { seg: false });
    const cl = P.texMat(
      "sr_stairs",
      P.signTex(
        "sr_stairs",
        ["STAIRS", "COLLAPSED AT 4", "USE THE ELEVATOR"],
        "raider",
        256,
        192,
        { fg: "#e8d8a8" },
      ),
      { transparent: true },
    );
    b.quad(cl, -10.02, 1.7, 5.5, 1.5, 1.1, { ry: HP });
    S.col(-10.3, 0, 4, -10, 3, 7, { walkable: false });
    // generator room (east) x 10..18, z -6..4
    S.room({
      x0: 10,
      z0: -6,
      x1: 18,
      z1: 4,
      y: 0,
      h: 4.2,
      wall: "brick_red",
      floor: "concrete",
      ceil: "concrete",
      skip: "w",
      surface: "concrete",
    });
    {
      const gx = 14.5,
        gz = -2.5;
      b.box("metal", gx - 1.6, 0, gz - 1, gx + 1.6, 1.6, gz + 1, {
        seg: false,
      });
      b.cyl("paint_green", gx - 0.7, 1.6, gz, 0.55, 0.55, 1.1, 12);
      b.cyl("paint_green", gx + 0.7, 1.6, gz, 0.55, 0.55, 1.1, 12);
      for (let i = 0; i < 6; i++)
        b.torus(
          "iron",
          gx + (i < 3 ? -0.7 : 0.7),
          1.8 + (i % 3) * 0.35,
          gz,
          0.57,
          0.03,
          TAU,
          { rx: HP, ts: 16, rs: 3 },
        );
      b.box("glow_green", gx - 0.3, 1.1, gz + 1.0, gx + 0.3, 1.4, gz + 1.03, {
        seg: false,
      });
      for (let i = 0; i < 4; i++)
        b.rod(
          "rubber",
          [gx + 1.5, 1.2, gz + (i - 1.5) * 0.25],
          [17.8, 3.8, gz + (i - 1.5) * 0.25],
          0.03,
          4,
        );
      b.rod("rubber", [17.8, 3.8, -2.5], [17.8, 3.8, 3.5], 0.08, 4);
      S.col(gx - 1.6, 0, gz - 1, gx + 1.6, 2.7, gz + 1, { walkable: false });
      S.light(gx, 2.8, gz + 1.5, 0x80ffa0, 7, 0.8);
      S.glow(gx, 1.25, gz + 1.1, 0x60ff80, 0.6);
      S.anchor("generator", gx, 0, gz + 2.2, PI);
    }
    S.prop("workbench", 16.8, 0, 2.6, PI, {});
    S.prop("toolbox", 11, 0, 3.2, PI, { loot: "toolbox" });
    b.box("lamp_cool", 13, 4.1, 0.5, 15, 4.15, 0.8, { seg: false });
    S.light(14, 3.6, 0.6, 0xd0e8ff, 7, 0.6);
    S.light(0, 3.5, 14, 0xffd8a0, 7, 0.6);
    S.anchor("entrance", 0, 0, 13.5, 0);
    S.anchor("npc3", -6.2, 0, 1.5, HP);

    // ------------------------------------------------------------------
    // PENTHOUSE COMMUNE (y 40)
    // ------------------------------------------------------------------
    const Y = PY,
      HH = 4.2;
    // vestibule (arrival) x -3..3, z 16..22
    S.room({
      x0: -3,
      z0: 16,
      x1: 3,
      z1: 22,
      y: Y,
      h: 3.4,
      wall: "marble",
      floor: "marble",
      ceil: "plaster_cream",
      skip: "n",
      trim: "bronze",
      surface: "concrete",
    });
    b.box("brass", -1.0, Y, 21.78, 1.0, Y + 3.0, 21.84, { seg: false });
    b.box("brass", -0.75, Y, 21.7, -0.02, Y + 2.7, 21.8, { seg: false });
    b.box("brass", 0.02, Y, 21.7, 0.75, Y + 2.7, 21.8, { seg: false });
    D.sconce(S, -2.85, Y + 2.3, 19, HP, { r: 4, i: 0.6 });
    D.sconce(S, 2.85, Y + 2.3, 19, -HP, { r: 4, i: 0.6 });
    S.anchor("penthouse_arrive", 0, Y, 19.2, 0);
    // GREAT ROOM x -20..20, z -4..16
    S.room({
      x0: -20,
      z0: -4,
      x1: 20,
      z1: 16,
      y: Y,
      h: HH,
      wall: "plaster_cream",
      floor: "parquet",
      ceil: "plaster_cream",
      trim: "wood_dark",
      surface: "wood",
      holes: {
        s: [
          [-3, 3, 0, 3.4],
          [-15, -13, 0, 2.7],
          [10, 12, 0, 2.7],
        ],
        n: [
          [-13, -11, 0, 2.7],
          [1, 3, 0, 2.7],
          [13, 15, 0, 2.7],
        ],
        e: [
          [-2.5, 1.5, 0.5, 3.6],
          [1.5, 3.5, 0, 3.0],
          [3.5, 13.5, 0.5, 3.6],
        ],
      },
      frame: "wood_dark",
    });
    // east glazing into the conservatory (French doors + mullions)
    for (let z = -2.5; z <= 13.5; z += 2)
      b.box("wood_dark", 19.85, Y + 0.5, z - 0.06, 20.15, Y + 3.6, z + 0.06, {
        seg: false,
      });
    b.box("wood_dark", 19.85, Y + 3.5, -2.5, 20.15, Y + 3.62, 13.5, {
      seg: false,
    });
    // big fireplace (west wall)
    D.fireplace(b, S, -19.8, Y, 6, HP, { key: "marble", lit: true });
    D.rug(b, -17, 1, -9, 11, Y + 0.01, "carpet_red");
    D.sofa(b, -13.5, Y, 6, -HP, { fabric: "velvet", w: 2.4 });
    D.sofa(b, -16, Y, 2.4, 0, { fabric: "fabric" });
    D.sofa(b, -16, Y, 9.6, PI, { fabric: "fabric" });
    D.piano(b, -16.5, Y, -1.8, PI * 0.2);
    // refectory table (salvaged doors on sawhorses) + benches
    {
      const x0 = -6,
        x1 = 10,
        z = 5;
      b.box("wood_dark", x0, Y + 0.72, z - 0.6, x1, Y + 0.8, z + 0.6, {
        segLen: 2,
      });
      for (let x = x0 + 0.6; x < x1; x += 3.6)
        for (const s of [-1, 1])
          b.rod("wood", [x, Y, z + s * 0.45], [x + 0.2, Y + 0.72, z], 0.04, 4, {
            square: true,
          });
      for (const s of [-1, 1]) {
        b.box(
          "wood",
          x0 + 0.3,
          Y + 0.42,
          z + s * 1.05 - 0.18,
          x1 - 0.3,
          Y + 0.48,
          z + s * 1.05 + 0.18,
          { seg: false },
        );
        for (let x = x0 + 1; x < x1; x += 3)
          b.box(
            "wood",
            x - 0.05,
            Y,
            z + s * 1.05 - 0.12,
            x + 0.05,
            Y + 0.42,
            z + s * 1.05 + 0.12,
            { seg: false },
          );
      }
      S.col(x0, Y, z - 0.6, x1, Y + 0.8, z + 0.6, { walkable: false });
      const r = P.rng("table");
      for (let i = 0; i < 14; i++) {
        const px = x0 + 0.5 + r() * (x1 - x0 - 1),
          pz = z + (r() - 0.5) * 0.9;
        b.cyl(
          r() < 0.5 ? "steel" : "paint_cream",
          px,
          Y + 0.8,
          pz,
          0.12,
          0.1,
          0.05,
          8,
          { noAO: true },
        );
      }
      for (let i = 0; i < 6; i++)
        b.cyl(
          "glass",
          x0 + 1 + i * 2.5,
          Y + 0.8,
          z + 0.3,
          0.035,
          0.04,
          0.22,
          6,
          { noAO: true },
        );
      D.candles(S, 2, Y + 0.8, 5, 3, { r: 5, i: 0.6 });
    }
    // cook drum + pot
    S.prop("campfire", 6, Y, 12.5, 0, { pot: true });
    S.light(6, Y + 1.0, 12.5, 0xff9a40, 7, 0.9);
    S.glow(6, Y + 0.6, 12.5, 0xff8a30, 1.0);
    S.prop("fridge", 11.5, Y, 15.3, PI, { loot: "fridge" });
    // string lights across the room
    for (const [a, c] of [
      [
        [-18, -3],
        [18, 15],
      ],
      [
        [-18, 15],
        [18, -3],
      ],
      [
        [-18, 6],
        [18, 6],
      ],
    ]) {
      const n = 14;
      for (let i = 0; i <= n; i++) {
        const t = i / n,
          x = a[0] + (c[0] - a[0]) * t,
          z = a[1] + (c[1] - a[1]) * t,
          y = Y + HH - 0.35 - Math.sin(t * PI) * 0.5;
        if (i < n) {
          const t2 = (i + 1) / n;
          b.rod(
            "rubber",
            [x, y, z],
            [
              a[0] + (c[0] - a[0]) * t2,
              Y + HH - 0.35 - Math.sin(t2 * PI) * 0.5,
              a[1] + (c[1] - a[1]) * t2,
            ],
            0.008,
            3,
            { noAO: true },
          );
        }
        b.sphere(
          i % 4 === 1 ? "glass_dark" : "lamp_warm",
          x,
          y - 0.06,
          z,
          0.05,
          { ws: 5, hs: 4, noAO: true },
        );
        if (i % 3 === 0) S.glow(x, y - 0.06, z, 0xffc070, 0.35);
      }
    }
    S.light(-8, Y + 3.2, 6, 0xffc890, 12, 0.8);
    S.light(8, Y + 3.2, 6, 0xffc890, 12, 0.8);
    S.light(0, Y + 3.2, 13, 0xffc890, 8, 0.5);
    S.light(0, Y + 3.2, -1, 0xffc890, 8, 0.5);
    D.papers(b, -4, Y, 12, 2, 6);
    S.anchor("great_room", 0, Y, 9, 0);
    S.anchor("npc1", -6, Y, 7.2, PI);
    S.anchor("npc2", 8.2, Y, 12.2, -HP);
    // CONSERVATORY (garden) x 20..28, z -4..16 — glass east wall + roof, painted view beyond
    {
      const cx0 = 20,
        cx1 = 28,
        cz0 = -4,
        cz1 = 16;
      S.floor("tile", cx0, cz0, cx1, cz1, Y, { t: 0.3, surface: "concrete" });
      S.wallX("brick_tan", cz0, cx0, cx1, Y, Y + 5.5, 0.3, [[23, 25, 0, 2.7]], {
        frame: "limestone_warm",
      });
      S.wallX("brick_tan", cz1, cx0, cx1, Y, Y + 5.5, 0.3, []);
      // glass wall (east): steel mullions, some panes broken, colliders
      for (let z = cz0; z <= cz1 + 0.01; z += 2)
        b.box("steel", cx1 - 0.08, Y, z - 0.06, cx1 + 0.08, Y + 5.5, z + 0.06, {
          seg: false,
        });
      for (let z = cz0; z < cz1; z += 2)
        for (let k = 0; k < 3; k++) {
          const br = P.rng(z * 5 + k)() < 0.2;
          b.box(
            br ? "glass_broken" : "glass",
            cx1 - 0.02,
            Y + 0.4 + k * 1.7,
            z + 0.06,
            cx1 + 0.02,
            Y + 2.0 + k * 1.7,
            z + 1.94,
            { seg: false, noAO: true, noBake: true },
          );
        }
      b.box("steel", cx1 - 0.1, Y, cz0, cx1 + 0.1, Y + 0.4, cz1, {
        seg: false,
      });
      S.col(cx1 - 0.1, Y, cz0, cx1 + 0.1, Y + 5.5, cz1, { walkable: false });
      // glass roof (pitched) + sky plane
      for (let z = cz0; z <= cz1 + 0.01; z += 2)
        b.rod("steel", [cx0, Y + 5.5, z], [cx1, Y + 4.4, z], 0.05, 4, {
          square: true,
        });
      b.box("glass", cx0, Y + 4.9, cz0, cx1, Y + 4.95, cz1, {
        rz: -0.14,
        seg: false,
        noAO: true,
        noBake: true,
      });
      b.box("wood_dark", cx0 - 0.2, Y + HH, cz0, cx0 + 0.2, Y + 5.6, cz1, {
        seg: false,
      });
      // planters (dead until the seeds come) + tools
      for (const [x0, z0, x1, z1] of [
        [21, -2.5, 27, -1],
        [21, 1, 27, 2.5],
        [21, 4.5, 27, 6],
        [21, 8, 27, 9.5],
        [21, 11.5, 27, 13],
      ])
        X.farmBed(S, x0, z0, x1, z1, Y, { density: 1.2 });
      b.cyl("steel", 20.8, Y, 14.8, 0.3, 0.25, 0.7, 10);
      b.cyl("steel", 20.8, Y + 0.7, 14.8, 0.02, 0.02, 1.2, 4);
      for (let i = 0; i < 3; i++)
        b.cyl("paint_green", 22 + i * 0.6, Y, 15.2, 0.15, 0.13, 0.3, 8, {
          noAO: true,
        });
      S.light(24, Y + 4, 6, 0xd8e0c0, 14, 0.9);
      S.anchor("nia", 22.6, Y, 3.5, -HP);
      S.anchor("garden", 24, Y, 6, 0);
      P.srGarden = { x0: cx0 + O.x, z0: cz0 + O.z, y: Y + O.y };
    }
    // the painted view: Central Park at dusk, the ruined skyline beyond
    b.quad("backdrop_park", 44, Y + 7, 6, 80, 22, {
      ry: -HP,
      noBake: true,
      grime: 0,
    });
    b.quad("backdrop_park", 30, Y + 16, 6, 60, 60, {
      rx: HP,
      noBake: true,
      grime: 0,
      uvRect: [0.35, 0.86, 0.65, 0.99],
    });
    // TOWER STAIR (north of the conservatory) x 20..28, z -12..-4
    {
      S.floor("concrete", 20, -12, 28, -4, Y, { t: 0.3 });
      S.wallX("brick_tan", -12, 20, 28, Y, Y + 8.5, 0.3, []);
      S.wallZ("brick_tan", 20, -12, -4, Y + HH, Y + 8.5, 0.3, []);
      S.wallZ("brick_tan", 28, -12, -4, Y, Y + 8.5, 0.3, []);
      S.ceil("concrete", 20, -12, 28, -4, Y + 8.5);
      S.stairs("concrete", 26, -5, "n", 2.4, Y, Y + 4.0, {
        run: 0.32,
        nosing: "steel",
        rail: "iron",
        railSides: [-1],
      });
      S.floor("concrete", 24.6, -12, 27.8, -10.7, Y + 4.0, { t: 0.3 });
      S.floor("concrete", 20.2, -12, 24.6, -9, Y + 4.0, { t: 0.3 });
      S.rail(
        "iron",
        [
          [20.2, -9],
          [24.6, -9],
          [24.6, -10.7],
        ],
        Y + 4.0,
        1.0,
        { r: 0.03 },
      );
      b.box("metal", 20.16, Y + 4, -11.2, 20.22, Y + 6.3, -9.8, { seg: false });
      b.box("lamp_red", 20.2, Y + 6.5, -10.65, 20.3, Y + 6.65, -10.35, {
        seg: false,
      });
      S.glow(20.3, Y + 6.58, -10.5, 0xff6040, 0.4);
      const ts = P.texMat(
        "sr_tower",
        P.signTex(
          "sr_tower",
          ["NORTH TOWER", "LOOKOUT — KNOCK FIRST"],
          "plain",
          256,
          96,
          { bg: "#2a4a3a", fg: "#e8dcb8" },
        ),
        {},
      );
      b.quad(ts, 20.2, Y + 6.9, -10.5, 1.0, 0.38, { ry: HP });
      S.light(23, Y + 7, -8, 0xffd8a0, 8, 0.5);
      S.anchor("tower_stair_top", 21.4, Y + 4, -10.5, -HP); // arrive facing away from the hatch door (x 20.2), onto the landing
    }
    // NORTH WING: trading post (library) x -20..-4, clinic x -4..8, office x 8..20; z -24..-4
    S.room({
      x0: -20,
      z0: -24,
      x1: -4,
      z1: -4,
      y: Y,
      h: HH,
      wall: "wood_oak",
      floor: "parquet",
      ceil: "plaster_cream",
      skip: "s",
      trim: "wood_dark",
      surface: "wood",
      holes: { e: [[-16, -14, 0, 2.7]] },
      frame: "wood_dark",
    });
    S.room({
      x0: -4,
      z0: -24,
      x1: 8,
      z1: -4,
      y: Y,
      h: HH,
      wall: "tile_white",
      floor: "tile",
      ceil: "plaster_cream",
      skip: "sw",
      surface: "concrete",
      holes: { e: [[-16, -14, 0, 2.7]] },
      frame: "paint_white",
    });
    S.room({
      x0: 8,
      z0: -24,
      x1: 20,
      z1: -4,
      y: Y,
      h: HH,
      wall: "wallpaper_green",
      floor: "carpet_red",
      ceil: "plaster_cream",
      skip: "sw",
      trim: "wood_dark",
      surface: "carpet",
    });
    // trading post
    for (let i = 0; i < 4; i++)
      D.bookcase(b, -19.6, Y, -21.5 + i * 2.2, HP, {
        w: 1.9,
        h: 2.8,
        empty: 0.35,
      });
    for (let i = 0; i < 4; i++)
      D.bookcase(b, -17 + i * 2.2, Y, -23.6, 0, { w: 1.9, h: 2.8, empty: 0.4 });
    S.prop("market_stall", -12, Y, -11, 0, { sign: 1 });
    b.box("wood_dark", -15, Y, -9.4, -9, Y + 1.05, -8.6, { seg: false });
    b.box("wood_oak", -15.1, Y + 1.05, -9.5, -8.9, Y + 1.1, -8.5, {
      seg: false,
    });
    S.col(-15, Y, -9.4, -9, Y + 1.1, -8.6, { walkable: false });
    S.prop("cash_register", -10, Y + 1.1, -9, PI, {});
    for (let i = 0; i < 5; i++)
      S.prop(
        "crate",
        -7 + (i % 2) * 1.1,
        Y + Math.floor(i / 2) * 0.8,
        -22.5 + (i % 3) * 1.2,
        i * 0.3,
        { kind: i % 2 ? "fizzo" : "army" },
      );
    S.prop("fizzo_machine", -5, Y, -14, -HP, {});
    S.light(-12, Y + 3.5, -14, 0xffd8a0, 10, 0.8);
    S.glow(-12, Y + 3.8, -14, 0xffd8a0, 0.6);
    b.box(
      "lamp_warm",
      -12.5,
      Y + HH - 0.1,
      -14.5,
      -11.5,
      Y + HH - 0.05,
      -13.5,
      { seg: false },
    );
    S.anchor("mercer", -12, Y, -10.2, 0);
    // clinic
    for (let i = 0; i < 3; i++) {
      D.bed(b, -2.6 + i * 3.4, Y, -21.5, 0, {
        w: 1.0,
        cover: "fabric_white",
        wood: "steel",
      });
      b.rod(
        "steel",
        [-1.6 + i * 3.4, Y, -20.3],
        [-1.6 + i * 3.4, Y + 1.9, -20.3],
        0.02,
        4,
      );
      b.box(
        "glass",
        -1.72 + i * 3.4,
        Y + 1.5,
        -20.36,
        -1.48 + i * 3.4,
        Y + 1.85,
        -20.24,
        { seg: false },
      );
    }
    S.prop("first_aid", 7.6, Y + 1.3, -15, -HP, {
      loot: "medical_cabinet",
      owner: "settlers",
    });
    S.prop("file_cabinet", -3.5, Y, -8, HP, {
      loot: "field_surgery_kit",
      owner: "settlers",
      name: "Medical Supplies",
    });
    D.table(b, 2, Y, -10, { rect: [1.6, 0.8], top: "steel", leg: "steel" });
    b.box("lamp_cool", 0, Y + HH - 0.1, -15, 4, Y + HH - 0.05, -14.6, {
      seg: false,
    });
    S.light(2, Y + 3.4, -14, 0xe0f0ff, 10, 0.9);
    const rc = P.texMat(
      "sr_clinic",
      P.signTex(
        "sr_clinic",
        ["+ CLINIC", "Doc Halloway · Mon–Sun"],
        "plain",
        256,
        96,
        { bg: "#e8e4d8", fg: "#8a1a1a" },
      ),
      {},
    );
    b.quad(rc, 2, Y + 2.9, -4.17, 1.2, 0.45, { ry: PI });
    S.anchor("doc", 2, Y, -11.5, 0);
    // office
    S.prop("desk", 14, Y, -21.5, 0, {
      loot: "desk",
      owner: "settlers",
      name: "Adeline's Desk",
    });
    S.prop("terminal", 13.4, Y + 0.78, -21.7, 0, {
      terminalId: "uw_sr_office",
      mount: "bare",
    });
    D.chair(b, 14, Y, -22.6, 0, { seat: "leather" });
    const map = P.texMat(
      "sr_map",
      P.signTex(
        "sr_map",
        [
          "MANHATTAN",
          "— safe",
          "— raiders (Bellamy's)",
          "— Maniacs (Ansonia)",
          "— ??? (Dakota)",
        ],
        "label",
        512,
        512,
        { bg: "#c8b890" },
      ),
      {},
    );
    b.quad(map, 19.82, Y + 2.1, -14, 2.4, 2.4, { ry: -HP });
    D.bookcase(b, 8.4, Y, -12, HP, { w: 2.2 });
    D.sofa(b, 16, Y, -8, PI, { fabric: "leather" });
    S.prop("radio", 18.8, Y + 0.8, -21.8, 0, {});
    b.box("wood_dark", 18.2, Y, -22.3, 19.6, Y + 0.8, -21.3, { seg: false });
    D.sconce(S, 8.25, Y + 2.3, -18, HP, { r: 6, i: 0.7 });
    S.light(14, Y + 3.3, -14, 0xffd8a0, 9, 0.6);
    S.anchor("adeline", 14, Y, -19.8, PI);
    // SOUTH WING: dormitory x -20..-3, pantry x 3..20; z 16..24
    S.room({
      x0: -20,
      z0: 16,
      x1: -3,
      z1: 24,
      y: Y,
      h: HH,
      wall: "wallpaper",
      floor: "parquet",
      ceil: "plaster_cream",
      skip: "ne",
      surface: "wood",
    });
    S.room({
      x0: 3,
      z0: 16,
      x1: 20,
      z1: 24,
      y: Y,
      h: HH,
      wall: "tile_white",
      floor: "tile",
      ceil: "plaster_cream",
      skip: "nw",
      surface: "concrete",
    });
    S.wallZ("wallpaper", -3, 22, 24, Y, Y + HH, 0.3, []);
    S.wallZ("tile_white", 3, 22, 24, Y, Y + HH, 0.3, []);
    S.wallX("marble", 24, -3, 3, Y, Y + HH, 0.3, []);
    for (let i = 0; i < 5; i++) {
      S.prop(i % 2 ? "mattress" : "bed", -18.5 + i * 3.2, Y, 22.3, 0, {});
      S.prop("footlocker", -18.5 + i * 3.2, Y, 20.2, PI, {
        loot: "footlocker",
        owner: "settlers",
      });
    }
    b.box("lamp_warm", -12, Y + HH - 0.1, 19.8, -10, Y + HH - 0.05, 20.2, {
      seg: false,
    });
    S.light(-11, Y + 3.2, 20, 0xffd8a0, 9, 0.5);
    S.anchor("toby_home", -8, Y, 19, PI);
    S.anchor("dorm", -11, Y, 19, PI);
    for (let i = 0; i < 4; i++) S.prop("shelf", 5 + i * 3, Y, 23.4, PI, {});
    S.container("Commune Pantry", 12, Y + 0.8, 22.8, {
      loot: "grocery_shelf",
      owner: "settlers",
      radius: 1.4,
    });
    S.prop("barrel", 18.5, Y, 17.5, 0, {});
    b.cyl("steel", 18.5, Y + 1.0, 17.5, 0.35, 0.35, 0.6, 10);
    b.rod("steel", [18.5, Y + 1.6, 17.5], [18.5, Y + 2.4, 18.3], 0.03, 4);
    S.light(11, Y + 3.2, 20, 0xe8f0ff, 9, 0.5);
    S.anchor("pantry", 11, Y, 19, 0);
    S.anchor("merchant", -12, Y, -10.2, 0);

    S.build({ interior: true });
    // the garden once the Stokes seeds are planted (hidden until then)
    {
      const gb = new P.Batch("sr_garden_alive", {
        ox: O.x,
        oy: O.y,
        oz: O.z,
        lit: true,
        ambient: 0x625a4c,
        ambI: 0.34,
      });
      gb.light(24, Y + 4, 6, 0xd8e0c0, 14, 0.9);
      const fake = { b: gb, col: () => null };
      for (const [x0, z0, x1, z1] of [
        [21, -2.5, 27, -1],
        [21, 1, 27, 2.5],
        [21, 4.5, 27, 6],
        [21, 8, 27, 9.5],
        [21, 11.5, 27, 13],
      ])
        X.farmBed(fake, x0, z0, x1, z1, Y + 0.02, {
          alive: true,
          density: 5,
          cropsOnly: true,
        });
      const grp = gb.build(S.root);
      grp.visible = false;
      P.srGardenAlive = grp;
    }
    P.addInterior("san_remo", S.root);
    return S;
  }

  P.addBuilder(
    "san_remo",
    function () {
      const E = buildExterior();
      const I = buildInterior();
      const O = P.I("san_remo");
      const ia = I.anchors,
        ea = E.anchors;
      E.door(
        X1 + 1.1,
        1.5,
        ZC,
        "The San Remo",
        { x: ia.entrance.x, y: ia.entrance.y, z: ia.entrance.z, yaw: 0 },
        {
          radius: 1.6,
          id: "uw_sr_front",
          onEnter: () => P.safe("disc", () => G.discover("san_remo")),
        },
      );
      I.door(
        0,
        1.4,
        15.8,
        "Central Park West",
        {
          x: ea.exterior_entrance.x,
          y: 0,
          z: ea.exterior_entrance.z,
          yaw: -HP,
        },
        { verb: "Exit", radius: 1.4, id: "uw_sr_front_in" },
      );
      I.door(
        -2.2,
        1.4,
        -5.6,
        "Elevator — Penthouse Commune",
        {
          x: ia.penthouse_arrive.x,
          y: ia.penthouse_arrive.y,
          z: ia.penthouse_arrive.z,
          yaw: 0,
        },
        {
          verb: "Ride",
          radius: 1.4,
          id: "uw_sr_elev_up",
          sound: "hum_electric",
        },
      );
      I.door(
        0,
        PY + 1.4,
        21.6,
        "Elevator — Lobby",
        { x: ia.elevator_lobby.x, y: 0, z: ia.elevator_lobby.z, yaw: PI },
        {
          verb: "Ride",
          radius: 1.4,
          id: "uw_sr_elev_down",
          sound: "hum_electric",
        },
      );
      I.door(
        20.3,
        PY + 4 + 1.3,
        -10.5,
        "North Tower — Lookout",
        {
          x: ea.tower_arrive.x,
          y: ea.tower_arrive.y,
          z: ea.tower_arrive.z,
          yaw: PI,
        },
        { radius: 1.3, id: "uw_sr_tower_up" },
      );
      E.door(
        ea.tower_hatch.x,
        ea.tower_hatch.y + 0.6,
        ea.tower_hatch.z,
        "Hatch — Commune Stair",
        {
          x: ia.tower_stair_top.x,
          y: ia.tower_stair_top.y,
          z: ia.tower_stair_top.z,
          yaw: -HP,
        },
        { verb: "Climb Down", radius: 1.3, id: "uw_sr_tower_down" },
      );
      P.register("san_remo", {
        root: E.root,
        interiorRoot: I.root,
        interiorKey: "san_remo",
        anchors: Object.assign({}, E.anchors, I.anchors),
      });
      void O;
    },
    20,
  );
})();
