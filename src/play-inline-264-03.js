// play-inline-264 03 — box
// Lines 44-796 of readable/play-inline-264.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("frick_ext", { grime: 0.5 });
    const b = S.b;
    const X0 = 146,
      X1 = 186,
      Z0 = -548,
      Z1 = -512;
    const GF = 7.0,
      UF = 12.0,
      ENT = 13.2; // ground-floor top, upper-floor top, entablature top
    // ---------------- ground ----------------
    b.box("granite", 130.1, 0, -511, 189.9, 0.06, -500.1, {
      segLen: 6,
      grime: 0.55,
    }); // forecourt setts
    b.box("dirt", 146, 0, -559.9, 189.9, 0.05, -548, { segLen: 6, grime: 0.6 }); // north service yard
    b.box("sidewalk", 186, 0, -548, 189.9, 0.05, -511, {
      segLen: 6,
      grime: 0.5,
    }); // Park Ave strip
    // raised Fifth Avenue garden terrace
    const TY = 1.25;
    b.box("rustic", 130.6, 0, -559.6, 131.6, TY, -511.2, { segLen: 3 }); // retaining wall
    b.box("rustic", 131.6, 0, -559.6, 146, TY, -558.6, { segLen: 3 });
    b.box("dirt", 131.6, 0, -558.6, 146, TY - 0.08, -511.2, {
      segLen: 4,
      grime: 0.7,
    });
    b.box("grass", 131.6, TY - 0.08, -558.6, 146, TY, -511.2, {
      segLen: 3,
      grime: 0.6,
    });
    b.box("rustic", 131.6, 0, -512.2, 146, TY, -511.2, { segLen: 3 });
    S.col(130.6, 0, -559.6, 146, TY, -511.2, { surface: "grass" });
    A.balustrade(
      S,
      [
        [131.1, -511.6],
        [131.1, -527.6],
      ],
      TY,
      { h: 0.9, broken: 0.08 },
    );
    A.balustrade(
      S,
      [
        [131.1, -532.4],
        [131.1, -559.1],
        [145.6, -559.1],
      ],
      TY,
      { h: 0.9, broken: 0.05 },
    );
    A.balustrade(
      S,
      [
        [131.8, -511.6],
        [145.6, -511.6],
      ],
      TY,
      { h: 0.9 },
    );
    // gated stair up from Fifth Avenue (5 steps)
    for (let i = 0; i < 5; i++) {
      const y = ((i + 1) * TY) / 5;
      b.box(
        "ashlar",
        129.2 + i * 0.3,
        0,
        -532.4,
        129.5 + i * 0.3 + 0.01,
        y,
        -527.6,
        { seg: false },
      );
      S.col(129.2 + i * 0.3, 0, -532.4, 129.5 + i * 0.3 + 0.01, y, -527.6);
    }
    for (const z of [-527.4, -532.6]) {
      b.box("rustic", 129.1, 0, z - 0.4, 131.7, TY + 1.6, z + 0.4, {
        seg: false,
      });
      A.urn(b, "ashlar", 130.4, TY + 1.6, z, 0.9);
      S.col(129.1, 0, z - 0.4, 131.7, TY + 1.6, z + 0.4, { walkable: false });
    }
    // magnolias, clipped box and a lawn gone to seed
    A.magnolia(S, 136.5, TY, -551.5, { h: 5.2, blooms: 16 });
    A.magnolia(S, 138.5, TY, -519.5, { h: 4.6, blooms: 12 });
    A.tree(S, 140.5, TY, -538.5, { h: 7.5, r: 0.22 });
    A.hedge(S, 143.6, -557.5, 145.4, -514, TY, 0.8, { col: true });
    for (let i = 0; i < 26; i++) {
      const rn = P.rng("fg" + i);
      b.box(
        "grass",
        132 + rn() * 11,
        TY,
        -558 + rn() * 45,
        132.3 + rn() * 11,
        TY + 0.25 + rn() * 0.35,
        -557.6 + rn() * 45,
        { seg: false, noAO: true, ry: rn() * 3 },
      );
    }
    // wrecked gallery attendant (Valet shell) face down in the lawn
    b.sphere("chrome", 139, TY + 0.35, -531, 0.55, {
      ws: 12,
      hs: 8,
      noAO: true,
      rz: 0.6,
    });
    b.rod("chrome", [139, TY + 0.6, -531], [140.2, TY + 0.2, -530.2], 0.04, 5);
    b.rod("chrome", [139, TY + 0.6, -531], [138.1, TY + 0.1, -529.8], 0.04, 5);
    b.sphere("glass_dark", 140.25, TY + 0.2, -530.15, 0.1, { ws: 6, hs: 4 });
    b.cyl("rust", 139.3, TY, -531.6, 0.22, 0.3, 0.35, 8, { rx: 1.2 });

    // ---------------- the house ----------------
    // main mass (split so the ruined north-east corner can be open to the sky)
    b.box("ashlar", X0, 0, Z0, X1, 0.7, Z1, { segLen: 3 });
    b.box("rustic", X0, 0.7, Z0, X1, GF - 0.9, Z1, { segLen: 3 });
    b.box("ashlar", X0, GF - 0.9, Z0 + 8, X1, ENT, Z1, { segLen: 3 });
    b.box("ashlar", X0, GF - 0.9, Z0, X1 - 9, ENT, Z0 + 8, { segLen: 3 });
    b.box("ashlar", X1 - 9, GF - 0.9, Z0, X1, GF + 1.8, Z0 + 8, { segLen: 3 }); // NE corner: burnt, roof & upper floor gone
    for (let i = 0; i < 7; i++) {
      const rn = P.rng("necorner" + i);
      b.box(
        "ashlar",
        X1 - 9 + i * 1.3,
        GF + 1.8,
        Z0 - 0.02,
        X1 - 8.2 + i * 1.3,
        GF + 1.8 + rn() * 3.6,
        Z0 + 0.5,
        { seg: false, grime: 0.9 },
      );
      b.box(
        "ashlar",
        X1 - 0.5,
        GF + 1.8,
        Z0 + i * 1.15,
        X1 + 0.02,
        GF + 1.8 + rn() * 3.2,
        Z0 + 1.1 + i * 1.15,
        { seg: false, grime: 0.9 },
      );
    }
    for (let i = 0; i < 6; i++)
      b.box(
        "wood_rotten",
        X1 - 8.6 + i * 1.5,
        GF + 2.6 + (i % 2) * 0.4,
        Z0 + 0.4,
        X1 - 8.35 + i * 1.5,
        GF + 2.9 + (i % 2) * 0.4,
        Z0 + 7.6,
        { seg: false, rx: ((i % 3) - 1) * 0.15, grime: 0.95 },
      );
    S.col(X0, 0, Z0, X1, ENT, Z1, { walkable: false });

    // ---- south (70th Street forecourt) front ----
    const FS = P.face(S, "s", X0, X1, Z1);
    FS.box("granite_dark", -0.1, FS.len + 0.1, 0, 0.7, 0, 0.25, { seg: false });
    FS.band("ashlar", GF - 0.9, GF - 0.55, 0, 0.3); // string course
    FS.band("ashlar", UF, UF + 0.7, 0, 0.18); // frieze
    FS.cornice("ashlar", UF + 0.55, 1.1, { step: 0.75 });
    const bays = [2.6, 6.8, 11.0, 15.2, 20, 24.8, 29.0, 33.2, 37.4];
    for (let i = 0; i < bays.length; i++) {
      const u = bays[i],
        inPorch = u > 14 && u < 26;
      if (i < bays.length - 1)
        A.pilaster(FS, "ashlar", (u + bays[i + 1]) / 2, 0.7, 0.7, UF, 0.28, {
          ionic: true,
        });
      if (!inPorch)
        FS.window(u, 1.3, 1.9, 4.3, {
          style: i % 3 === 1 ? "broken" : i === 7 ? "boarded" : "dark",
          frame: "wood_dark",
          sill: "ashlar",
          hood: "cornice",
          hoodKey: "ashlar",
        });
      FS.window(u, GF + 0.6, 1.6, 2.7, {
        style: i === 2 || i === 6 ? "broken" : "dark",
        frame: "wood_dark",
        sill: "ashlar",
        hood: "flat",
        hoodKey: "ashlar",
      });
      // balustered apron under the upper windows
      for (let k = -2; k <= 2; k++)
        FS.box(
          "ashlar",
          u + k * 0.3 - 0.05,
          u + k * 0.3 + 0.05,
          GF - 0.5,
          GF + 0.45,
          0.05,
          0.2,
          { seg: false },
        );
    }
    // entrance porch: 4 Ionic columns, entablature, balustraded terrace
    const PX0 = X0 + 13.2,
      PX1 = X0 + 26.8,
      PZ = Z1 + 3.2;
    b.box("granite_dark", PX0 - 0.6, 0, Z1, PX1 + 0.6, 0.23, PZ + 0.9, {
      seg: false,
    });
    b.box("ashlar", PX0 - 0.3, 0.23, Z1, PX1 + 0.3, 0.46, PZ + 0.5, {
      seg: false,
    });
    S.col(PX0 - 0.6, 0, Z1, PX1 + 0.6, 0.23, PZ + 0.9);
    S.col(PX0 - 0.3, 0, Z1, PX1 + 0.3, 0.46, PZ + 0.5);
    for (const x of [PX0 + 0.6, PX0 + 4.6, PX1 - 4.6, PX1 - 0.6])
      A.column(b, "ashlar", x, 0.46, PZ - 0.2, GF - 0.46, 0.36, "ionic", { S });
    for (const x of [PX0 + 0.6, PX1 - 0.6])
      b.box("ashlar", x - 0.45, 0.46, Z1, x + 0.45, GF, Z1 + 0.4, {
        seg: false,
      }); // responds
    b.box("ashlar", PX0 - 0.3, GF, Z1, PX1 + 0.3, GF + 0.55, PZ + 0.35, {
      seg: false,
    });
    b.box(
      "ashlar",
      PX0 - 0.45,
      GF + 0.55,
      Z1,
      PX1 + 0.45,
      GF + 0.85,
      PZ + 0.5,
      { seg: false },
    );
    A.balustrade(
      S,
      [
        [PX0, PZ + 0.1],
        [PX1, PZ + 0.1],
      ],
      GF + 0.85,
      { h: 0.85, col: false },
    );
    for (const x of [PX0, PX1])
      A.balustrade(
        S,
        [
          [x, Z1 + 0.3],
          [x, PZ + 0.1],
        ],
        GF + 0.85,
        { h: 0.85, col: false, posts: false },
      );
    // the name on the porch frieze
    D.sign(
      b,
      "frick_name",
      ["THE FRICK COLLECTION"],
      "engraved",
      (PX0 + PX1) / 2,
      GF + 0.27,
      PZ + 0.36,
      11.5,
      0.5,
      0,
      {
        bg: "#c9c0aa",
        fg: "rgba(50,42,30,0.95)",
        spacing: 14,
        tw: 1024,
        th: 64,
      },
    );
    // front door: double oak doors, bronze grille transom
    const DX = (PX0 + PX1) / 2;
    b.box("paint_black", DX - 1.5, 0.46, Z1 - 0.05, DX + 1.5, 4.6, Z1 + 0.02, {
      seg: false,
    });
    for (const s of [-1, 1]) {
      b.box(
        "wood_dark",
        DX + (s < 0 ? -1.35 : 0.04),
        0.46,
        Z1 + 0.02,
        DX + (s < 0 ? -0.04 : 1.35),
        3.7,
        Z1 + 0.1,
        { seg: false },
      );
      for (let k = 0; k < 3; k++)
        b.box(
          "wood_oak",
          DX + s * 0.7 - 0.45,
          0.8 + k * 0.95,
          Z1 + 0.1,
          DX + s * 0.7 + 0.45,
          1.6 + k * 0.95,
          Z1 + 0.14,
          { seg: false, noAO: true },
        );
      b.sphere("bronze", DX + s * 0.18, 1.9, Z1 + 0.16, 0.06, { ws: 6, hs: 4 });
    }
    for (let k = 0; k < 9; k++)
      b.box(
        "bronze",
        DX - 1.3 + k * 0.325,
        3.75,
        Z1 + 0.05,
        DX - 1.25 + k * 0.325,
        4.5,
        Z1 + 0.09,
        { seg: false, noAO: true },
      );
    b.box("ashlar", DX - 1.9, 0.46, Z1, DX - 1.5, 4.9, Z1 + 0.3, {
      seg: false,
    });
    b.box("ashlar", DX + 1.5, 0.46, Z1, DX + 1.9, 4.9, Z1 + 0.3, {
      seg: false,
    });
    b.box("ashlar", DX - 2.0, 4.6, Z1, DX + 2.0, 5.2, Z1 + 0.4, { seg: false });
    // two porch lanterns (one still burning on a scavenged cell — the robots keep it lit)
    for (const s of [-1, 1]) {
      const lx = DX + s * 2.4;
      b.rod("iron", [lx, 3.3, Z1 + 0.05], [lx, 3.3, Z1 + 0.45], 0.03, 4);
      b.cyl(
        s < 0 ? "lamp_dim" : "glass_broken",
        lx,
        3.0,
        Z1 + 0.5,
        0.14,
        0.1,
        0.45,
        6,
      );
      b.cyl("iron", lx, 3.45, Z1 + 0.5, 0.05, 0.17, 0.12, 6);
      if (s < 0) S.glow(lx, 3.2, Z1 + 0.6, 0xffd090, 0.9);
    }
    D.poster(b, "frick_hours", DX - 3.2, 1.9, Z1 + 0.03, 0, 1.1);
    D.poster(b, "frick_robot", DX + 3.2, 1.9, Z1 + 0.03, 0, 1.1);

    // ---- west (Fifth Avenue garden) front: end pavilions + blind-arcaded gallery wing ----
    const FW = P.face(S, "w", Z0, Z1, X0);
    FW.box("granite_dark", -0.1, FW.len + 0.1, 0, 0.7, 0, 0.25, { seg: false });
    FW.band("ashlar", UF, UF + 0.7, 0, 0.18);
    FW.cornice("ashlar", UF + 0.55, 1.1, { step: 0.75 });
    for (const [u0, u1] of [
      [0, 7],
      [29, 36],
    ]) {
      // end pavilions project 0.8 m
      FW.box("ashlar", u0, u1, 0.7, UF + 0.55, 0, 0.8, { segLen: 3 });
      FW.box("rustic", u0, u1, 0.7, GF - 0.9, 0.8, 0.85, { segLen: 3 });
      const u = (u0 + u1) / 2;
      FW.window(u, 1.3, 2.0, 4.3, {
        style: "dark",
        frame: "wood_dark",
        sill: "ashlar",
        hood: "pediment",
        hoodKey: "ashlar",
        d: 0.82,
      });
      FW.window(u, GF + 0.6, 1.7, 2.8, {
        style: u0 ? "broken" : "dark",
        frame: "wood_dark",
        sill: "ashlar",
        hood: "flat",
        hoodKey: "ashlar",
        d: 0.82,
      });
      for (const uu of [u0 + 0.5, u1 - 0.5])
        FW.box("ashlar", uu - 0.4, uu + 0.4, 0.7, UF, 0.8, 1.0, { seg: false });
    }
    for (let i = 0; i < 5; i++) {
      // gallery: blind arched niches with garlands
      const u = 9.6 + i * 4.2;
      FW.window(u, 1.9, 2.1, 6.4, {
        arch: true,
        style: i === 3 ? "broken" : "dark",
        frame: "wood_dark",
        sill: "ashlar",
        mull: true,
        keystone: "ashlar",
      });
      FW.box("ashlar_dark", u - 1.35, u + 1.35, 1.6, 7.3, 0.0, 0.04, {
        seg: false,
      });
      FW.box("ashlar", u - 1.65, u - 1.3, 1.3, 7.4, 0, 0.42, { seg: false });
      FW.box("ashlar", u + 1.3, u + 1.65, 1.3, 7.4, 0, 0.42, { seg: false });
      FW.arch("ashlar", u, 7.4, 1.3, 0.38, 0, 0.42);
      FW.box("ashlar", u - 1.55, u + 1.55, 1.3, 1.6, 0, 0.35, { seg: false });
      FW.box("ashlar", u - 0.2, u + 0.2, 8.5, 9.2, 0.25, 0.45, { seg: false }); // keystone
      for (let k = 0; k < 7; k++) {
        const a = k / 6;
        FW.box(
          "ashlar",
          u - 1.5 + a * 3 - 0.12,
          u - 1.5 + a * 3 + 0.12,
          10.2 - Math.sin(a * PI) * 0.6,
          10.45 - Math.sin(a * PI) * 0.6,
          0.1,
          0.32,
          { seg: false },
        );
      } // swag
      A.pilaster(FW, "ashlar", u + 2.1, 0.7, 0.7, UF, 0.28, { ionic: true });
      if (i === 0)
        A.pilaster(FW, "ashlar", u - 2.1, 0.7, 0.7, UF, 0.28, { ionic: true });
    }
    // museum banners on the gallery wall (seen from Fifth Avenue across the park)
    for (const [u, t] of [
      [11.7, ["THE FRICK", "COLLECTION"]],
      [24.3, ["OLD MASTERS", "FIFTH AVE", "AT 70TH"]],
    ]) {
      const bk = P.texMat(
        "ues_frick_banner_" + u,
        P.signTex("frick_banner_" + u, t, "banner", 256, 640, {
          bg: "#7a1e1a",
          fg: "#ecdcb8",
          top: 0.1,
          emblem: (ctx, w, h) => {
            ctx.strokeStyle = "#d8b060";
            ctx.lineWidth = 6;
            ctx.strokeRect(14, 14, w - 28, h - 28);
            ctx.fillStyle = "#d8b060";
            ctx.beginPath();
            ctx.arc(w / 2, h * 0.72, 40, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "#7a1e1a";
            ctx.font = "bold 50px serif";
            ctx.textAlign = "center";
            ctx.fillText("F", w / 2, h * 0.745);
          },
        }),
        { rough: 0.95, double: true },
      );
      const p = FW.pt(u, 0.55);
      b.quad(bk, p[0], 7.2, p[1], 1.5, 3.8, { ry: -HP });
      FW.box("iron", u - 0.85, u + 0.85, 9.15, 9.22, 0.3, 0.6, { seg: false });
    }

    // ---- east (Park Avenue) + north (service) fronts ----
    const FE = P.face(S, "e", Z0, Z1, X1),
      FN = P.face(S, "n", X0, X1, Z0);
    for (const F of [FE, FN]) {
      F.box("granite_dark", 0, F.len, 0, 0.7, 0, 0.2, { seg: false });
      F.band("ashlar", GF - 0.9, GF - 0.55, 0, 0.25);
      const n = Math.floor(F.len / 4.4);
      for (let i = 0; i < n; i++) {
        const u = 2.2 + (i * (F.len - 4.4)) / (n - 1);
        const burnt = (F === FN && u < 9) || (F === FE && u > F.len - 9);
        F.window(u, 1.4, 1.6, 3.8, {
          style: burnt ? "broken" : i % 4 === 2 ? "boarded" : "dark",
          frame: "wood_dark",
          sill: "ashlar",
          hood: "flat",
          hoodKey: "ashlar",
        });
        if (!burnt)
          F.window(u, GF + 0.6, 1.4, 2.5, {
            style: i % 3 === 0 ? "broken" : "dark",
            frame: "wood_dark",
            sill: "ashlar",
          });
      }
    }
    FE.cornice("ashlar", UF + 0.55, 0.9, { mods: false });
    // FN cornice only over the intact part
    b.box("ashlar", X0 - 0.2, UF + 0.55, Z0 - 0.9, X1 - 9, UF + 1.4, Z0, {
      seg: false,
    });
    // service door (north) + garage door
    b.box("rust", X0 + 16, 0, Z0 - 0.08, X0 + 20, 3.2, Z0, { seg: false });
    for (let k = 0; k < 8; k++)
      b.box(
        "iron",
        X0 + 16,
        0.2 + k * 0.38,
        Z0 - 0.12,
        X0 + 20,
        0.24 + k * 0.38,
        Z0 - 0.08,
        { seg: false, noAO: true },
      );

    // ---- roof: balustrade + urns, slate mansard, skylights, lantern, chimneys ----
    const RY = ENT;
    A.balustrade(
      S,
      [
        [X0 + 0.4, Z1 - 0.4],
        [X1 - 0.4, Z1 - 0.4],
      ],
      RY,
      { h: 0.9, urns: true, urnS: 0.75, col: false },
    );
    A.balustrade(
      S,
      [
        [X0 + 0.4, Z0 + 8],
        [X0 + 0.4, Z1 - 0.4],
      ],
      RY,
      { h: 0.9, urns: true, urnS: 0.75, col: false, broken: 0.1 },
    );
    A.balustrade(
      S,
      [
        [X1 - 0.4, Z0 + 8],
        [X1 - 0.4, Z1 - 0.4],
      ],
      RY,
      { h: 0.9, urns: true, urnS: 0.75, col: false },
    );
    A.balustrade(
      S,
      [
        [X0 + 0.4, Z0 + 0.4],
        [X1 - 9.4, Z0 + 0.4],
      ],
      RY,
      { h: 0.9, urns: false, col: false, broken: 0.25 },
    );
    b.box("roof_tar", X0 + 0.5, RY, Z0 + 0.5, X1 - 0.5, RY + 0.1, Z1 - 0.5, {
      segLen: 6,
    });
    // mansard band (sloped slate) inside the balustrade
    for (const [x0, z0, x1, z1, rx, rz] of [
      [X0 + 1.2, Z1 - 3.2, X1 - 1.2, Z1 - 1.2, -0.5, 0],
      [X0 + 1.2, Z0 + 9, X0 + 3.2, Z1 - 1.2, 0, 0.5],
      [X1 - 3.2, Z0 + 9, X1 - 1.2, Z1 - 1.2, 0, -0.5],
    ]) {
      b.box("slate", x0, RY + 0.1, z0, x1, RY + 1.6, z1, {
        rx,
        rz,
        seg: false,
      });
    }
    // Garden Court lantern: hipped glass roof on an iron frame
    const LX0 = X0 + 13,
      LX1 = X0 + 31,
      LZ0 = Z0 + 11,
      LZ1 = Z1 - 8;
    b.box("ashlar", LX0 - 0.4, RY, LZ0 - 0.4, LX1 + 0.4, RY + 1.2, LZ1 + 0.4, {
      seg: false,
    });
    const lg = new THREE.CylinderGeometry(0.72, 1, 1, 4, 1, true);
    b.geo(
      "glass_green",
      lg,
      P.m4(
        (LX0 + LX1) / 2,
        RY + 2.4,
        (LZ0 + LZ1) / 2,
        PI / 4,
        0,
        0,
        (LX1 - LX0) * 0.707,
        2.4,
        (LZ1 - LZ0) * 0.707,
      ),
      { noAO: true },
    );
    b.box(
      "glass_green",
      LX0 + 2.8,
      RY + 3.55,
      LZ0 + 2,
      LX1 - 2.8,
      RY + 3.62,
      LZ1 - 2,
      { seg: false, noAO: true },
    );
    for (let i = 0; i <= 6; i++) {
      const x = LX0 + (i * (LX1 - LX0)) / 6;
      b.rod(
        "iron",
        [x, RY + 1.2, LZ0],
        [LX0 + 2.8 + (i * (LX1 - LX0 - 5.6)) / 6, RY + 3.6, LZ0 + 2],
        0.05,
        4,
      );
      b.rod(
        "iron",
        [x, RY + 1.2, LZ1],
        [LX0 + 2.8 + (i * (LX1 - LX0 - 5.6)) / 6, RY + 3.6, LZ1 - 2],
        0.05,
        4,
      );
    }
    // West Gallery ridge skylight
    b.box("ashlar", X0 + 2, RY, Z0 + 9, X0 + 9, RY + 0.8, Z1 - 3, {
      seg: false,
    });
    for (const s of [-1, 1])
      b.box(
        "glass_green",
        X0 + 5.5 + s * 1.7 - 1.7,
        RY + 0.8,
        Z0 + 9.3,
        X0 + 5.5 + s * 1.7 + 1.7,
        RY + 0.86,
        Z1 - 3.3,
        { rz: -s * 0.5, seg: false, noAO: true },
      );
    for (const [cx, cz] of [
      [X0 + 11, Z0 + 3],
      [X0 + 11, Z1 - 3],
      [X1 - 5, Z1 - 3],
      [X0 + 34, Z0 + 12],
    ])
      A.chimney(b, "ashlar", cx, RY, cz, 1.4, 0.8, 2.4, 3);
    // the burnt corner: charred joists, fallen roof slabs in the service yard
    D.rubble(S, X1 - 4, 0.05, Z0 - 4.5, 3.2, {
      rebar: true,
      slab: true,
      col: true,
      colH: 0.6,
    });
    D.rubble(S, X1 - 11, 0.05, Z0 - 3.2, 1.6, { key: "ashlar" });
    for (let i = 0; i < 3; i++)
      b.box(
        "wood_rotten",
        X1 - 8 + i * 1.8,
        0.1,
        Z0 - 7 + i * 0.6,
        X1 - 7.7 + i * 1.8,
        0.5,
        Z0 - 2.4 + i * 0.6,
        { ry: 0.4 * i - 0.3, rz: 0.2, seg: false, grime: 0.9 },
      );
    A.urn(b, "ashlar", X0 + 8, 0.05, Z1 + 5.2, 0.8, { rz: 1.5, ry: 0.4 }); // an urn fell off the roof
    A.tree(S, X0 + 30, 0.05, Z0 - 6.5, { h: 8, r: 0.25 });

    // ---------------- forecourt: fence, gate piers, planters ----------------
    const FZ = -500.9;
    A.fence(
      S,
      [
        [131, FZ],
        [161.4, FZ],
      ],
      0.06,
      { h: 2.1, bent: 0.05 },
    );
    A.fence(
      S,
      [
        [170.6, FZ],
        [189.3, FZ],
      ],
      0.06,
      { h: 2.1, gaps: 0.04 },
    );
    A.fence(
      S,
      [
        [130.6, -511],
        [130.6, FZ],
      ],
      0.06,
      { h: 2.1 },
    );
    for (const x of [161.4, 170.6]) {
      b.box("rustic", x - 0.55, 0, FZ - 0.55, x + 0.55, 2.9, FZ + 0.55, {
        seg: false,
      });
      b.box("ashlar", x - 0.7, 2.9, FZ - 0.7, x + 0.7, 3.15, FZ + 0.7, {
        seg: false,
      });
      A.urn(b, "ashlar", x, 3.15, FZ, 1.0);
      S.col(x - 0.55, 0, FZ - 0.55, x + 0.55, 3.2, FZ + 0.55, {
        walkable: false,
      });
    }
    // gate leaves: one hanging open, one torn off and lying in the court
    b.rod("iron", [161.9, 0.2, FZ], [165.6, 0.2, FZ + 2.4], 0.03, 4);
    b.rod("iron", [161.9, 2.0, FZ], [165.6, 2.0, FZ + 2.4], 0.03, 4);
    for (let k = 0; k <= 16; k++) {
      const t = k / 16;
      b.rod(
        "iron",
        [161.9 + 3.7 * t, 0.05, FZ + 2.4 * t],
        [161.9 + 3.7 * t, 2.25, FZ + 2.4 * t],
        0.012,
        3,
        { noAO: true },
      );
    }
    for (let k = 0; k <= 16; k++)
      b.rod(
        "iron",
        [166.4 + k * 0.23, 0.08, -503.4],
        [166.2 + k * 0.23, 0.12, -505.6],
        0.012,
        3,
        { noAO: true },
      );
    D.sign(
      b,
      "frick_plaque",
      [
        "THE FRICK COLLECTION",
        "HENRY CLAY FRICK HOUSE · 1914",
        "OPEN TO THE PUBLIC",
      ],
      "brass",
      161.4,
      1.9,
      FZ + 0.57,
      0.9,
      0.5,
      0,
      { tw: 512, th: 280 },
    );
    D.sign(
      b,
      "frick_warn",
      ["PRIVATE COLLECTION", "TRESPASSERS WILL", "BE CATALOGUED"],
      "raider",
      170.6,
      1.7,
      FZ + 0.57,
      1.0,
      0.7,
      0,
      { fg: "#e8d060", tw: 512, th: 360 },
    );
    for (const x of [140, 152, 180]) {
      b.box("ashlar", x - 0.8, 0.06, -506.8, x + 0.8, 0.7, -505.2, {
        seg: false,
      });
      b.box("dirt", x - 0.7, 0.7, -506.7, x + 0.7, 0.74, -505.3, {
        seg: false,
      });
      A.tree(S, x, 0.74, -506, { h: 2.6, r: 0.07, n: 3, depth: 1 });
    }
    D.rubble(S, 150, 0.06, -503, 1.2);
    D.papers(b, 172, 0.07, -506, 3, 14);
    // lamp posts on the forecourt (dead)
    A.lampPost(S, 146.5, 0.06, -502.3, { h: 4, broken: true });
    A.lampPost(S, 185.5, 0.06, -502.3, { h: 4 });

    // props / containers outside
    S.prop("skeleton", DX - 2.6, 0.46, Z1 + 1.4, 0.3, { pose: "sitting" });
    S.prop("barrel", 186.8, 0.05, -530, 0, {});
    S.prop("car", 176, 0.05, -505.8, HP + 0.12, { kind: "coupe", wreck: true });
    S.prop("mailbox", 131.8, 0.05, -507, HP, {});
    S.anchor("exterior_entrance", DX, 0.46, Z1 + 2.2, PI);
    S.anchor("front", DX, 0, Z1 + 6.5, PI);
    S.anchor("garden", 138, TY, -540, -HP);
    S.build({ shadow: true, lod: 300 });
    return { S, doorX: DX, doorZ: Z1 };
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
