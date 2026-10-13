// play-inline-283 03 — box
// Lines 119-702 of readable/play-inline-283.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("ly_ext", { grime: 0.5 });
    const b = S.b;
    b.box("sidewalk", X0 - 0.3, 0, Z0 - 0.3, X1 + 0.3, 0.04, Z1 + 0.3, {
      segLen: 8,
      grime: 0.5,
      noAO: true,
    });
    // ---------------- masses ----------------
    const FD = 4.5; // depth of the front block (limestone)
    const HB = 18; // cornice line
    b.box("limestone", TX0, 0, Z1 - FD, TX1, 6.7, Z1);
    b.box("limestone", TX0 + 3.2, 6.7, Z1 - FD, TX1 - 3.2, HB, Z1 - 0.9); // recessed loggia wall
    b.box("limestone", TX0, 6.7, Z1 - FD, TX0 + 3.2, HB, Z1); // side pavilions
    b.box("limestone", TX1 - 3.2, 6.7, Z1 - FD, TX1, HB, Z1);
    b.box("brick_red", TX0, 0, Z0, TX1, 20, Z1 - FD); // auditorium
    b.box("brick_red", TX0 + 2, 20, Z0, TX1 - 2, 27, Z0 + 11); // fly tower (north)
    S.col(TX0, 0, Z0, TX1, 20, Z1);
    S.col(TX0 + 2, 20, Z0, TX1 - 2, 27, Z0 + 11);
    b.box("roof_tar", TX0 + 0.3, 20, Z0 + 11, TX1 - 0.3, 20.12, Z1 - FD, {
      noAO: true,
    });
    // neighbours
    b.box("brick_brown", X0, 0, Z0, TX0, 15.5, Z1);
    S.col(X0, 0, Z0, TX0, 15.5, Z1);
    b.box("brick_tan", TX1, 0, Z0, X1, 17.5, Z1);
    S.col(TX1, 0, Z0, X1, 17.5, Z1);
    b.box("roof_tar", X0 + 0.2, 15.5, Z0 + 0.2, TX0 - 0.2, 15.62, Z1 - 0.2, {
      noAO: true,
    });
    b.box("roof_tar", TX1 + 0.2, 17.5, Z0 + 0.2, X1 - 0.2, 17.62, Z1 - 0.2, {
      noAO: true,
    });

    // ---------------- THE FRONT (south) ----------------
    const F = P.face(S, "s", TX0, TX1, Z1); // u = x - TX0, len 30
    const uD = DOOR_X - TX0; // 15
    // rusticated base (0..6)
    F.box("limestone", 0, F.len, 0, 6.2, 0, 0.45);
    for (let y = 0.8; y < 6; y += 0.8)
      F.box("limestone_dark", 0, F.len, y - 0.05, y + 0.02, 0.43, 0.5, {
        seg: false,
        grime: 0.9,
      });
    F.band("limestone", 6.0, 6.7, 0, 0.8);
    // three arched entrances
    for (const k of [-1, 0, 1]) {
      const u = uD + k * 5.2;
      F.box("wood_dark", u - 1.5, u + 1.5, 0, 3.4, 0.4, 0.5, { seg: false });
      F.box(
        k === 0 ? "glass_dark" : "glass_dark",
        u - 1.35,
        u + 1.35,
        0.15,
        3.3,
        0.5,
        0.53,
        { seg: false },
      );
      F.box("gold", u - 0.04, u + 0.04, 0.15, 3.3, 0.53, 0.56, { seg: false });
      F.halfDisc("glass_dark", u, 3.4, 1.5, 0.5);
      F.arch("limestone", u, 3.4, 1.5, 0.45, 0.3, 0.75);
      F.box("limestone", u - 0.25, u + 0.25, 4.6, 5.3, 0.6, 0.85, {
        seg: false,
      }); // keystone
      for (const s of [-1, 1])
        F.box(
          "limestone",
          u + s * 1.7 - 0.2,
          u + s * 1.7 + 0.2,
          0,
          3.4,
          0.4,
          0.8,
          { seg: false },
        );
    }
    // side doors (boarded) + lamps
    for (const u of [2.2, F.len - 2.2]) {
      F.box("wood_rotten", u - 0.8, u + 0.8, 0, 2.6, 0.4, 0.5, { seg: false });
      for (let k = 0; k < 3; k++)
        F.box(
          "wood_rotten",
          u - 1.0,
          u + 1.0,
          0.6 + k * 0.7,
          0.85 + k * 0.7,
          0.5,
          0.56,
          { seg: false, rz: 0.1 * (k - 1) },
        );
    }
    // marquee over the three doors (bulb border, lettered front)
    const m0 = uD - 9,
      m1 = uD + 9,
      my0 = 4.25,
      my1 = 5.55,
      md = 3.2;
    F.box("iron", m0, m1, my0, my1, 0.8, md, { seg: false });
    F.box("gold", m0 - 0.05, m1 + 0.05, my1, my1 + 0.12, 0.8, md + 0.05, {
      seg: false,
    });
    const mq = P.texMat(
      "ly_marquee",
      K.marqueeTex(
        "ly_front",
        "LYCEUM",
        ["THE LYCEUM PLAYERS PRESENT", "OUR GLOWING TOWN  NIGHTLY"],
        { missing: 0.05, neon: "#ffd070" },
      ),
      { emissive: 0.6, rough: 0.5 },
    );
    {
      const p = F.pt(uD, md + 0.02);
      b.quad(mq, p[0], (my0 + my1) / 2, p[1], m1 - m0 - 0.3, my1 - my0 - 0.1, {
        ry: 0,
      });
    }
    for (const y of [my1 + 0.2, my0 - 0.05]) {
      const a = F.pt(m0, md + 0.04),
        c = F.pt(m1, md + 0.04);
      K.bulbs(b, [a[0], y, a[1]], [c[0], y, c[1]], 0.3, { dead: 0.12 });
    }
    for (let d = 1.3; d < md; d += 0.7) {
      const a = F.pt(m0 + 0.5, d),
        c = F.pt(m1 - 0.5, d);
      K.bulbs(b, [a[0], my0 - 0.1, a[1]], [c[0], my0 - 0.1, c[1]], 0.7, {
        dead: 0.2,
      });
    }
    for (const s of [-1, 1]) {
      const a = F.pt(uD + s * 8, md - 0.2),
        c = F.pt(uD + s * 8, 0.8);
      b.rod("iron", [a[0], my1, a[1]], [c[0], my1 + 2.5, c[1]], 0.04, 4);
    }
    {
      const p = F.pt(uD, 1.8);
      S.glow(p[0], my0 - 0.3, p[1], 0xffd8a0, 5.2);
    }
    // giant order: six Corinthian columns on pedestals before a recessed glazed loggia (6.7..16)
    F.box("limestone", 3.5, F.len - 3.5, 6.7, 16, -0.9, -0.6); // loggia back wall (recessed)
    for (let i = 0; i < 5; i++) {
      const u = 6.2 + i * 4.4;
      F.window(u, 8.0, 2.8, 6.8, {
        style: i === 2 ? "lit" : i === 4 ? "broken" : "dark",
        frame: "iron",
        sill: "limestone",
        mull: true,
        d: -0.88,
        arch: true,
        keystone: "limestone",
      });
    }
    F.box("limestone", 3.5, F.len - 3.5, 6.7, 7.2, -0.9, 0.9, { seg: false }); // loggia floor / balustrade base
    for (let u = 4; u < F.len - 4; u += 0.45)
      F.box("limestone", u - 0.08, u + 0.08, 7.2, 8.0, 0.55, 0.75, {
        seg: false,
      });
    F.box("limestone", 3.5, F.len - 3.5, 8.0, 8.2, 0.45, 0.85, { seg: false });
    for (let i = 0; i < 6; i++) {
      const u = 3.9 + i * 4.44,
        p = F.pt(u, 1.2);
      b.box(
        "limestone",
        p[0] - 0.8,
        6.7,
        p[1] - 0.8,
        p[0] + 0.8,
        7.9,
        p[1] + 0.8,
        { seg: false },
      ); // pedestal
      b.lathe(
        "limestone",
        [
          [0.001, 0],
          [0.7, 0],
          [0.7, 0.15],
          [0.6, 0.3],
          [0.001, 0.3],
        ],
        14,
        p[0],
        7.9,
        p[1],
      ); // base
      b.cyl("limestone", p[0], 8.2, p[1], 0.48, 0.56, 6.6, 16, { hSeg: 4 }); // shaft
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * TAU;
        b.box(
          "limestone_dark",
          p[0] + Math.cos(a) * 0.53 - 0.03,
          8.3,
          p[1] + Math.sin(a) * 0.53 - 0.03,
          p[0] + Math.cos(a) * 0.53 + 0.03,
          14.7,
          p[1] + Math.sin(a) * 0.53 + 0.03,
          { seg: false, noAO: true },
        );
      }
      // Corinthian capital: bell + acanthus rows + volutes + abacus
      b.lathe(
        "limestone",
        [
          [0.001, 0],
          [0.5, 0],
          [0.62, 0.35],
          [0.78, 0.8],
          [0.001, 0.8],
        ],
        14,
        p[0],
        14.8,
        p[1],
      );
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.box(
          "limestone",
          p[0] + Math.cos(a) * 0.6 - 0.12,
          14.9,
          p[1] + Math.sin(a) * 0.6 - 0.12,
          p[0] + Math.cos(a) * 0.6 + 0.12,
          15.35,
          p[1] + Math.sin(a) * 0.6 + 0.12,
          { ry: a, rx: 0.3, seg: false },
        );
      }
      for (const s of [-1, 1])
        b.sphere("limestone", p[0] + s * 0.62, 15.5, p[1] + 0.55, 0.16, {
          ws: 8,
          hs: 6,
        });
      b.box(
        "limestone",
        p[0] - 0.95,
        15.6,
        p[1] - 0.95,
        p[0] + 0.95,
        15.85,
        p[1] + 0.95,
        { seg: false },
      );
      S.col(p[0] - 0.6, 6.7, p[1] - 0.6, p[0] + 0.6, 16, p[1] + 0.6, {
        walkable: false,
      });
    }
    // entablature: architrave, LYCEUM frieze, cornice with modillions
    F.box("limestone", 0, F.len, 15.85, 16.5, 0, 2.0, { seg: false });
    F.box("limestone", 0, F.len, 16.5, 17.4, 0, 1.85, { seg: false });
    const nm = P.texMat(
      "ly_name",
      P.signTex("ly_name", ["L Y C E U M"], "engraved", 1024, 96, {
        bg: "#c8bea6",
        fg: "rgba(50,42,30,0.9)",
        spacing: 22,
      }),
      { rough: 0.9 },
    );
    {
      const p = F.pt(uD, 1.87);
      b.quad(nm, p[0], 16.95, p[1], 16, 0.8, { ry: 0 });
    }
    {
      const Fc = P.face(S, "s", TX0, TX1, Z1 + 1.85);
      Fc.cornice("limestone", 17.4, 0.9, { step: 0.7, ext: 0.3 });
    }
    // side pavilions (quoins + stacked windows)
    for (const [u0, u1] of [
      [0, 3.2],
      [F.len - 3.2, F.len],
    ]) {
      for (let y = 6.7; y < 15.8; y += 0.9)
        F.box("limestone", u0, u1, y, y + 0.8, 0.45, 0.6, { seg: false });
      F.window((u0 + u1) / 2, 9.0, 1.3, 2.6, {
        style: "dark",
        frame: "iron",
        sill: "limestone",
        hood: "pediment",
        hoodKey: "limestone",
        mull: true,
        d: 0.62,
      });
      F.window((u0 + u1) / 2, 12.8, 1.2, 1.9, {
        style: "boarded",
        frame: "iron",
        sill: "limestone",
        mull: false,
        d: 0.62,
      });
    }
    // steep slate mansard + oeil-de-boeuf dormers + copper cresting
    P.mansard(
      b,
      "slate",
      (TX0 + TX1) / 2,
      Z1 - 3.2,
      F.len - 0.6,
      6.4,
      true,
      18.3,
      24.6,
      1.4,
      { crest: "verdigris" },
    );
    b.box("slate", TX0 + 0.3, 18.3, Z1 - 6.4, TX0 + 0.8, 24.6, Z1 - 0.1, {
      seg: false,
    });
    b.box("slate", TX1 - 0.8, 18.3, Z1 - 6.4, TX1 - 0.3, 24.6, Z1 - 0.1, {
      seg: false,
    });
    for (let i = 0; i < 3; i++) {
      const x = TX0 + 7.5 + i * 7.5,
        z = Z1 - 0.9;
      b.box("limestone", x - 1.2, 18.6, z - 1.2, x + 1.2, 21.2, z + 0.45, {
        seg: false,
      });
      b.torus("verdigris", x, 20.0, z + 0.48, 0.8, 0.14, TAU, {
        ts: 20,
        rs: 6,
      });
      b.cyl(
        i === 1 ? "window_lit" : "glass_dark",
        x,
        20.0,
        z + 0.4,
        0.72,
        0.72,
        0.05,
        16,
        { rx: HP, noAO: true },
      );
      b.geo(
        "slate",
        new THREE.ConeGeometry(1.4, 1.2, 4).rotateY(PI / 4),
        P.m4(x, 21.8, z - 0.4, 0, 0, 0, 1, 1, 0.9),
        { noAO: true },
      );
    }
    // brick flank of the auditorium (east/west) above the neighbours + side exits
    const FWa = P.face(S, "w", Z0, Z1 - FD, TX0),
      FEa = P.face(S, "e", Z0, Z1 - FD, TX1);
    for (const Fa of [FWa, FEa]) {
      Fa.band("limestone", 19.4, 20.2, 0, 0.3, { ext: 0 });
      for (let u = 3; u < Fa.len - 2; u += 5)
        Fa.window(u, 16.2, 1.3, 2.5, {
          arch: true,
          style: "dark",
          frame: "iron",
          sill: "limestone",
          mull: false,
        });
    }
    const FNa = P.face(S, "n", TX0, TX1, Z0);
    const ghost = P.texMat(
      "ly_ghost",
      P.signTex(
        "ly_ghost",
        ["LYCEUM THEATRE — STAGE ENTRANCE"],
        "engraved",
        1024,
        96,
        { bg: "#6e3a2a", fg: "rgba(230,220,190,0.5)" },
      ),
      { rough: 1 },
    );
    FNa.quad(ghost, FNa.len / 2, 22, 22, 1.6, 0.02);
    FNa.box(
      "paint_green",
      FNa.len / 2 - 0.7,
      FNa.len / 2 + 0.7,
      0,
      2.4,
      0.02,
      0.12,
      { seg: false },
    );

    // ---------------- neighbours ----------------
    // west: "Madame Zelda's — Costumes & Wigs" (4 storeys, brownstone-ish)
    const FWn = P.face(S, "s", X0, TX0, Z1);
    FWn.box("wood_dark", 1.0, FWn.len - 1.0, 0, 3.8, 0, 0.3, { seg: false });
    FWn.box("glass_broken", 1.3, FWn.len - 3.3, 0.8, 3.4, 0.3, 0.34, {
      seg: false,
    });
    FWn.box("wood_dark", FWn.len - 3.0, FWn.len - 1.4, 0, 2.6, 0.3, 0.4, {
      seg: false,
    });
    const zs = P.texMat(
      "ly_zelda",
      P.signTex(
        "ly_zelda",
        ["MADAME ZELDA", "Costumes · Wigs · Theatrical Supply"],
        "gilt",
        512,
        128,
      ),
      { rough: 0.6 },
    );
    FWn.quad(zs, FWn.len / 2, 4.3, FWn.len - 1.5, 0.9, 0.32);
    P.windowGrid(
      FWn,
      [2.6, 6.5, 10.4],
      [
        { y: 5.4, h: 2.0 },
        { y: 8.6, h: 2.0 },
        { y: 11.8, h: 2.0 },
      ],
      {
        w: 1.3,
        frame: "paint_white",
        sill: "limestone",
        hood: "cornice",
        hoodKey: "limestone",
        broken: 0.3,
        seed: 11,
      },
    );
    FWn.cornice("limestone", 14.8, 0.6, { mods: false });
    K.fireEscape(FWn, 5, 9.5, 5.2, 3.2, 3, {});
    // east corner: "The Green Room" bar (the troupe's watering hole) on Eighth Avenue
    const FEn = P.face(S, "s", TX1, X1, Z1);
    FEn.box("paint_green", 0.8, FEn.len - 0.6, 0, 3.8, 0, 0.3, { seg: false });
    FEn.box("glass_dark", 1.1, FEn.len - 3.6, 0.9, 3.3, 0.3, 0.34, {
      seg: false,
    });
    FEn.box("wood_dark", FEn.len - 3.2, FEn.len - 1.6, 0, 2.6, 0.3, 0.4, {
      seg: false,
    });
    const gr = P.texMat(
      "ly_greenroom",
      P.signTex("ly_greenroom", ["THE GREEN ROOM"], "neon", 512, 96, {
        fg: "#8aff9a",
      }),
      { emissive: 1.1 },
    );
    FEn.quad(gr, FEn.len / 2 - 1, 4.4, 6.4, 1.1, 0.33);
    {
      const p = FEn.pt(FEn.len / 2 - 1, 0.8);
      S.glow(p[0], 4.4, p[1], 0x8aff9a, 2.6, { flicker: 0.2 });
    }
    P.windowGrid(
      FEn,
      [2.4, 6.2, 10.0, 13.0].filter((u) => u < FEn.len - 1),
      [
        { y: 5.4, h: 2.0 },
        { y: 8.6, h: 2.0 },
        { y: 11.8, h: 2.0 },
        { y: 14.8, h: 1.8 },
      ],
      { w: 1.3, frame: "iron", sill: "limestone", broken: 0.3, seed: 13 },
    );
    const FEe = P.face(S, "e", Z0, Z1, X1);
    P.windowGrid(
      FEe,
      [3, 7, 11, 15, 19, 23, 27],
      [
        { y: 5.4, h: 2.0 },
        { y: 8.6, h: 2.0 },
        { y: 11.8, h: 2.0 },
        { y: 14.8, h: 1.8 },
      ],
      {
        w: 1.3,
        frame: "iron",
        sill: "limestone",
        broken: 0.35,
        boarded: 0.1,
        seed: 17,
      },
    );
    FEe.box("paint_green", 0, 10, 0, 3.8, 0, 0.3, { seg: false });
    try {
      if (!G.isStub("mats") && G.mats.billboard) {
        const k = P.texMat(
          "ly_ghostad",
          G.mats.billboard("prairie_root_beer").map,
          { rough: 0.95 },
        );
        FEe.quad(k, 20, 9, 9, 4.5, 0.05);
      }
    } catch (e) {
      /* optional */
    }
    K.waterTower(b, -137, 17.6, -258, 1.9, 3.0, { legH: 2.5 });
    K.waterTower(b, -183, 15.6, -262, 1.7, 2.8, { legH: 2.2 });
    for (const x of [-186, -181])
      b.box("brick_red", x - 0.5, 15.5, -246, x + 0.5, 17.4, -245, {
        seg: false,
      });

    // ---------------- the troupe's dressing of the street front ----------------
    // the troupe's painted banners hang from the side pavilions
    for (const [u, k] of [
      [1.6, 0],
      [F.len - 1.6, 1],
    ]) {
      const ban = P.texMat(
        "ly_banner" + k,
        P.signTex(
          "ly_banner" + k,
          k ? ["NIGHTLY", "ALL", "WELCOME"] : ["OUR", "GLOWING", "TOWN"],
          "banner",
          256,
          640,
          { bg: "#d8ccb0", fg: "#1e5a2a", top: 0.12 },
        ),
        { double: true, rough: 1 },
      );
      const g = new THREE.PlaneGeometry(2.2, 5.6, 1, 8);
      const p = g.attributes.position;
      for (let v = 0; v < p.count; v++)
        p.setZ(v, Math.sin(p.getY(v) * 0.9) * 0.08);
      const pp = F.pt(u, 0.66);
      b.geo(ban, g, P.m4(pp[0], 11.4, pp[1]), {
        uv: "keep",
        noAO: true,
        grime: 0.25,
      });
      for (const y of [8.6, 14.2]) {
        const a = F.pt(u - 1.2, 0.64),
          c = F.pt(u + 1.2, 0.64);
        b.rod("rust", [a[0], y, a[1]], [c[0], y, c[1]], 0.03, 3);
      }
    }
    // string lights zig-zag between the columns
    for (let i = 0; i < 5; i++) {
      const ua = 3.9 + i * 4.44,
        ub = ua + 4.44,
        n = 9;
      for (let k = 0; k <= n; k++) {
        const t = k / n,
          u = ua + (ub - ua) * t,
          p = F.pt(u, 1.8);
        b.sphere(
          k % 4 === 3
            ? "glass_dark"
            : ["bulb", "neon_green", "neon_yellow", "neon_red"][k % 4],
          p[0],
          7.3 - Math.sin(t * PI) * 0.7,
          p[1],
          0.07,
          { ws: 5, hs: 4, noAO: true, noBake: true },
        );
      }
    }
    for (let i = 0; i < 3; i++) {
      const p = F.pt(8 + i * 7, 2.2);
      S.glow(p[0], 6.8, p[1], 0xd8ffb0, 1.8);
    }
    // sandbag chicane + guard's post by the door, posters in frames, a burning barrel
    for (const s of [-1, 1]) {
      const p = F.pt(uD + s * 6.8, 2.6);
      for (let k = 0; k < 6; k++)
        b.box(
          "fabric",
          p[0] - 0.9 + (k % 3) * 0.6,
          k >> 1 > 1 ? 0.6 : k >= 3 ? 0.3 : 0,
          p[1] - 0.3,
          p[0] - 0.35 + (k % 3) * 0.6,
          k >= 3 ? 0.58 : 0.28,
          p[1] + 0.3,
          { seg: false, grime: 0.6, c: 0xb8a888 },
        );
      S.col(p[0] - 1, 0, p[1] - 0.35, p[0] + 1, 0.9, p[1] + 0.35, {
        walkable: false,
      });
    }
    for (let i = 0; i < 3; i++) {
      const pk = P.texMat("ly_poster" + i, playPoster(i), { rough: 0.9 });
      F.quad(pk, [4.6, 25.4, 6.0][i], 2.2, 1.1, 1.65, 0.52);
    }
    S.prop("barrel", TX0 + 2.5, 0, Z1 + 2.5, 0, { burning: true });

    S.anchor("exterior_entrance", DOOR_X, 0, Z1 + 3.2, PI);
    S.anchor("guard_ext", DOOR_X + 6.8, 0, Z1 + 4.0, PI);
    S.build({ shadow: true, lod: 300 });
    return S;
  }

  // ===================================================================
  // INTERIOR (local; entrance on the south wall z=30, stage to the north)
  // Levels: lobby/orchestra back 0 → rows down to -1.9 · stage -0.8 · box 2.6 · balcony aisle 4.5 · fly gallery 5.4
  // ===================================================================
