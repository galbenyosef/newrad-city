// play-inline-274 03 — box
// Lines 197-1015 of readable/play-inline-274.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("ansonia_ext", { grime: 0.55 });
    const b = S.b;
    // paving
    b.box("sidewalk", -187.9, 0, -539.9, -132.1, 0.03, -490.1, {
      segLen: 8,
      grime: 0.6,
      noAO: true,
    });
    // ---------- main mass ----------
    b.box(
      "limestone_warm",
      X0 - 0.15,
      0,
      Z0 - 0.15,
      X1 + 0.15,
      BASE,
      Z1 + 0.15,
      { segLen: 6 },
    );
    b.box("terracotta_cream", X0, BASE, Z0, X1, CORN, Z1, { segLen: 6 });
    S.col(X0, 0, Z0, X1, TOPW, Z1);
    // rustication grooves on the base
    for (let y = 0.9; y < BASE - 0.4; y += 0.9) {
      b.box(
        "limestone_dark",
        X0 - 0.2,
        y - 0.04,
        Z0 - 0.2,
        X1 + 0.2,
        y + 0.04,
        Z0 - 0.12,
        { seg: false, grime: 0.9 },
      );
      b.box(
        "limestone_dark",
        X0 - 0.2,
        y - 0.04,
        Z1 + 0.12,
        X1 + 0.2,
        y + 0.04,
        Z1 + 0.2,
        { seg: false, grime: 0.9 },
      );
      b.box("limestone_dark", X0 - 0.2, y - 0.04, Z0, X0 - 0.12, y + 0.04, Z1, {
        seg: false,
        grime: 0.9,
      });
      b.box("limestone_dark", X1 + 0.12, y - 0.04, Z0, X1 + 0.2, y + 0.04, Z1, {
        seg: false,
        grime: 0.9,
      });
    }
    // ---------- corner towers ----------
    TOW.forEach(([tx, tz], ti) => {
      b.cyl("limestone_warm", tx, 0, tz, TR + 0.15, TR + 0.2, BASE, 28);
      for (let y = 0.9; y < BASE - 0.4; y += 0.9)
        b.torus("limestone_dark", tx, y, tz, TR + 0.18, 0.05, TAU, {
          rx: HP,
          ts: 32,
          rs: 3,
        });
      b.cyl("terracotta_cream", tx, BASE, tz, TR, TR, CORN - BASE, 28);
      b.cyl("limestone_warm", tx, BASE - 0.1, tz, TR + 0.35, TR + 0.3, 0.5, 28);
      // cornice ring + frieze
      b.cyl("limestone_warm", tx, CORN - 0.6, tz, TR + 0.25, TR + 0.1, 0.6, 28);
      b.cyl("limestone_warm", tx, CORN, tz, TR + 0.7, TR + 0.35, 0.8, 28);
      b.cyl(
        "limestone_warm",
        tx,
        CORN + 0.8,
        tz,
        TR + 0.75,
        TR + 0.75,
        0.4,
        28,
      );
      // windows round the tower (outward 270°)
      const out = Math.atan2(tz - ZC, tx - XC);
      for (let k = 0; k < 7; k++) {
        const a = out - 1.95 + k * 0.65;
        ROWS.forEach((R, ri) => {
          const q = P.rng(ti * 100 + k * 13 + ri)();
          const style = q < 0.22 ? "broken" : q < 0.3 ? "boarded" : "dark";
          if (ti === 0 && ri >= 6 && k >= 2 && k <= 4) return; // blasted section (NW tower)
          X.cylWindow(b, tx, tz, TR, a, R.y, 1.1, R.h + (R.arch ? 0.4 : 0), {
            style,
            frame: "limestone_warm",
            hood: ri % 3 === 2,
          });
        });
        // ground-floor tower windows (arched shop windows)
        X.cylWindow(b, tx, tz, TR + 0.15, a, 1.2, 1.3, 3.8, {
          style: k % 3 === 1 ? "boarded" : "dark",
          frame: "iron",
        });
      }
      // wraparound balconies
      for (const y of [18.45, 31.85])
        X.cylBalcony(S, tx, tz, TR, out - 2.1, out + 2.1, y - 0.15, {
          slab: "limestone_warm",
        });
      // drum with oculi + dome
      b.cyl("terracotta_cream", tx, TOPW, tz, 4.7, 4.9, 4.6, 24);
      b.cyl("limestone_warm", tx, TOPW + 4.4, tz, 5.0, 4.9, 0.45, 24);
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.torus(
          "limestone_warm",
          tx + Math.cos(a) * 4.85,
          TOPW + 2.3,
          tz + Math.sin(a) * 4.85,
          0.75,
          0.14,
          TAU,
          { ry: -a + HP, ts: 14, rs: 4 },
        );
        b.cyl(
          k === 3 ? "window_lit" : "glass_dark",
          tx + Math.cos(a) * 4.83,
          TOPW + 2.3,
          tz + Math.sin(a) * 4.83,
          0.7,
          0.7,
          0.06,
          12,
          { rx: HP, ry: -a + HP },
        );
      }
      X.dome(b, tx, TOPW + 4.85, tz, 4.35, 7.4, {
        oculi: 4,
        trim: "limestone_warm",
        lantern: 1.0,
        spire: 3,
        broken: ti === 0 ? 0.28 : 0,
      });
      S.colR(tx, tz, TR * 1.75, TR * 1.75, 0, TOPW, 0, { walkable: false });
      S.colR(tx, tz, 8.6, 8.6, TOPW, TOPW + 6, 0, { walkable: false });
    });
    // ---------- facades ----------
    const facade = (side, a0, a1, c, o) => {
      o = o || {};
      const F = P.face(S, side, a0, a1, c);
      F.band("limestone_warm", BASE - 0.3, BASE + 0.25, 0, 0.45);
      F.band("limestone_warm", 18.15, 18.4, 0, 0.25);
      F.band("limestone_warm", 31.55, 31.8, 0, 0.25);
      F.cornice("limestone_warm", CORN, 1.1, { step: 0.8 });
      F.band("limestone_warm", CORN + 0.85, TOPW, 0, 0.6);
      const bays = [];
      const skip = o.skip || (() => false);
      for (let u = 10.8; u < F.len - 10.4; u += 3.1) if (!skip(u)) bays.push(u);
      P.windowGrid(F, bays, ROWS, {
        sill: "limestone_warm",
        hoodKey: "limestone_warm",
        frame: "paint_white",
        broken: 0.22,
        boarded: 0.08,
        lit: 0,
        seed: o.seed,
      });
      // balconies (continuous iron) on 5th & 9th floor lines
      for (const y of [18.45, 31.85]) {
        F.box("limestone_warm", 9.8, F.len - 9.8, y - 0.15, y + 0.02, 0, 0.9, {
          seg: false,
        });
        F.box("iron", 9.8, F.len - 9.8, y + 0.95, y + 1.0, 0.85, 0.9, {
          seg: false,
        });
        for (let u = 10; u < F.len - 9.8; u += 0.22)
          if (!skip(u))
            F.box("iron", u - 0.012, u + 0.012, y, y + 0.95, 0.86, 0.89, {
              seg: false,
            });
        for (let u = 10.5; u < F.len - 10; u += 3.1)
          if (!skip(u))
            F.box(
              "limestone_warm",
              u - 0.15,
              u + 0.15,
              y - 0.55,
              y - 0.15,
              0.1,
              0.8,
              { seg: false },
            );
      }
      // arched ground-floor shopfronts
      for (let u = 11.5; u < F.len - 11; u += 4.2) {
        if (o.skipGround && o.skipGround(u)) continue;
        const r = P.rng(u * 3 + c)();
        F.window(u, 0.6, 3.0, 5.2, {
          arch: true,
          style: r < 0.35 ? "boarded" : "dark",
          frame: "iron",
          sill: "limestone_warm",
          mull: true,
          keystone: "limestone_warm",
        });
        F.arch("limestone_warm", u, 0.6 + 5.2 - 1.5, 1.6, 0.35, 0, 0.3);
      }
      return F;
    };
    const FE = facade("e", Z0, Z1, X1, {
      seed: 3,
      skip: (u) => Math.abs(u - 23) < 4.2,
      skipGround: (u) => Math.abs(u - 23) < 5,
    });
    const FW = facade("w", Z0, Z1, X0, {
      seed: 5,
      skip: (u) => Math.abs(u - 23) < 4.2,
      skipGround: (u) => Math.abs(u - 23) < 3,
    });
    facade("n", X0, X1, Z0, { seed: 7 });
    const FS = facade("s", X0, X1, Z1, { seed: 9 });
    void FW;
    void FS;
    // ---------- round bays on the long fronts ----------
    for (const [bx, sgn] of [
      [X1 - 1.6, 1],
      [X0 + 1.6, -1],
    ]) {
      const bz = ZC,
        R = 3.4;
      b.cyl("terracotta_cream", bx, BASE, bz, R, R, CORN - BASE, 22);
      b.cyl("limestone_warm", bx, CORN - 0.2, bz, R + 0.55, R + 0.2, 0.9, 22);
      const out = sgn > 0 ? 0 : PI;
      for (let k = 0; k < 5; k++) {
        const a = out - 1.1 + k * 0.55;
        ROWS.forEach((R2, ri) =>
          X.cylWindow(b, bx, bz, R, a, R2.y, 1.0, R2.h + (R2.arch ? 0.4 : 0), {
            style: P.rng(k * 7 + ri + bx)() < 0.25 ? "broken" : "dark",
            frame: "limestone_warm",
            hood: ri % 3 === 2,
          }),
        );
      }
      for (const y of [18.45, 31.85])
        X.cylBalcony(S, bx, bz, R, out - 1.35, out + 1.35, y - 0.15, {
          slab: "limestone_warm",
        });
      b.cyl("terracotta_cream", bx, TOPW, bz, 2.9, 3.0, 2.2, 18);
      X.dome(b, bx, TOPW + 2.2, bz, 2.7, 4.6, {
        oculi: 0,
        lantern: 0.6,
        spire: 2,
      });
      S.colR(bx, bz, R * 1.6, R * 1.6, 0, TOPW + 3, 0, { walkable: false });
    }
    // ---------- entrance portal (east / CPW) ----------
    {
      const F = FE,
        uc = 23;
      F.box("limestone_warm", uc - 3.6, uc + 3.6, 0, BASE + 0.3, 0, 1.1); // portal block
      F.box("glass_dark", uc - 1.7, uc + 1.7, 0.02, 3.2, 1.1, 1.16, {
        seg: false,
      });
      F.arch("limestone_warm", uc, 3.2, 1.7, 0.55, 1.05, 1.45);
      F.halfDisc("glass_dark", uc, 3.2, 1.7, 1.13);
      for (let i = -3; i <= 3; i++) {
        const a = PI / 2 + i * 0.22;
        F.box(
          "iron",
          uc + Math.cos(a) * 1.7 - 0.02,
          uc + Math.cos(a) * 1.7 + 0.02,
          3.2,
          3.2 + Math.sin(a) * 1.7,
          1.13,
          1.17,
          { seg: false },
        );
      }
      // doors: bronze & glass, one hanging open
      F.box("bronze", uc - 1.6, uc - 0.05, 0.02, 3.0, 1.12, 1.2, {
        seg: false,
      });
      F.box("glass_dark", uc - 1.35, uc - 0.3, 0.9, 2.7, 1.2, 1.22, {
        seg: false,
      });
      {
        const p = F.pt(uc + 0.1, 1.2);
        b.box("bronze", p[0], 0.02, p[1], p[0] + 1.5, 3.0, p[1] + 0.08, {
          ry: 0.9,
          seg: false,
        });
      }
      // columns flanking + pediment
      for (const s of [-1, 1]) {
        const p = F.pt(uc + s * 2.9, 1.5);
        b.lathe(
          "limestone_warm",
          [
            [0.001, 0],
            [0.42, 0],
            [0.4, 0.3],
            [0.3, 0.45],
            [0.28, 5.5],
            [0.38, 5.8],
            [0.46, 6.1],
            [0.001, 6.1],
          ],
          12,
          p[0],
          0,
          p[1],
        );
      }
      F.box("limestone_warm", uc - 3.8, uc + 3.8, 6.1, 6.9, 0.3, 2.1, {
        seg: false,
      });
      const sh = new THREE.Shape();
      sh.moveTo(-4, 0);
      sh.lineTo(4, 0);
      sh.lineTo(0, 1.6);
      sh.closePath();
      b.extrude("limestone_warm", sh, 1.8, F.mat(uc, 6.9, 0.3), { seg: false });
      const np = P.texMat(
        "ans_name",
        P.signTex("ans_name", ["THE  ANSONIA"], "engraved", 1024, 128, {
          bg: "#d8ccb0",
          fg: "rgba(60,50,38,0.92)",
          spacing: 10,
        }),
        { rough: 0.9 },
      );
      F.quad(np, uc, 6.5, 6.8, 0.8, 2.12);
      // cast-iron & glass marquee canopy on chains
      F.box("iron", uc - 3.2, uc + 3.2, 4.3, 4.55, 1.2, 4.6, { seg: false });
      F.box("glass_dark", uc - 3.0, uc + 3.0, 4.55, 4.6, 1.3, 4.4, {
        seg: false,
      });
      const cn = P.texMat(
        "ans_canopy",
        P.signTex(
          "ans_canopy",
          ["THE ANSONIA  ·  APARTMENT HOTEL"],
          "gilt",
          1024,
          64,
        ),
        { rough: 0.5 },
      );
      F.quad(cn, uc, 4.42, 6.2, 0.22, 4.62);
      for (const s of [-1, 1]) {
        const a = F.pt(uc + s * 3, 4.5),
          c = F.pt(uc + s * 3, 1.2);
        b.rod("iron", [a[0], 4.55, a[1]], [c[0], 6.6, c[1]], 0.03, 4);
      }
      for (const s of [-1, 1]) {
        const p = F.pt(uc + s * 3.9, 1.6);
        b.cyl("iron", p[0], 0, p[1], 0.06, 0.1, 3.8, 6);
        b.sphere("lamp_dim", p[0], 4.0, p[1], 0.26, { ws: 8, hs: 6 });
        S.glow(p[0], 4.0, p[1], 0xffc880, 0.9);
      }
      const p = F.pt(uc, 1.0);
      S.anchor("exterior_entrance", p[0] + 1.6, 0, p[1], -HP);
      S.anchor("street", X1 + 4, 0, ZC + 6, -HP);
      // sandbag nest + barricade debris at the door
      S.prop("sandbags", X1 + 3.4, 0, ZC - 4.5, HP, { curved: true });
      S.prop("barrel", X1 + 2.2, 0, ZC + 4.2, 0, { burning: false });
    }
    // service door on the west (boarded)
    {
      const F = P.face(S, "w", Z0, Z1, X0),
        uc = 23;
      F.box("limestone_warm", uc - 2.2, uc + 2.2, 0, 4.2, 0, 0.9);
      F.box("wood_rotten", uc - 1.3, uc + 1.3, 0.02, 3.2, 0.9, 0.95, {
        seg: false,
      });
      for (let i = 0; i < 4; i++)
        F.box(
          "wood_rotten",
          uc - 1.6,
          uc + 1.6,
          0.5 + i * 0.75,
          0.75 + i * 0.75,
          0.95,
          1.02,
          { seg: false, rz: 0.1 * (i % 2 ? 1 : -1) },
        );
      const gr = P.texMat(
        "ans_graf",
        P.signTex(
          "ans_graf",
          ["MANIACS INSIDE", "DONT FEED THE SEALS"],
          "raider",
          512,
          256,
          { fg: "#d8d0b0" },
        ),
        { transparent: true },
      );
      F.quad(gr, uc + 5, 2.3, 4, 2, 0.05);
      S.anchor("service_door", X0 - 1.5, 0, ZC, HP);
    }
    // ---------- mansard with two dormer tiers ----------
    const INS = 3.5;
    for (const [side, a0, a1, c] of [
      ["e", Z0, Z1, X1],
      ["w", Z0, Z1, X0],
      ["n", X0, X1, Z0],
      ["s", X0, X1, Z1],
    ]) {
      const F = P.face(S, side, a0, a1, c);
      P.mansardSide(S, F, 8.6, F.len - 8.6, TOPW, DECK, INS, "slate");
      for (let u = 11.2; u < F.len - 11; u += 3.1) {
        if ((side === "e" || side === "w") && Math.abs(u - 23) < 4) continue;
        dormer(S, F, u, TOPW + 0.5, -0.25, {
          style: P.rng(u + c)() < 0.2 ? "broken" : "dark",
        });
        if (Math.round(u / 3.1) % 2 === 0)
          dormer(S, F, u, TOPW + 3.6, -INS * 0.52 - 0.1, { style: "dark" });
      }
    }
    S.col(X0 + 2.6, TOPW, Z0 + 2.6, X1 - 2.6, DECK, Z1 - 2.6, {
      surface: "concrete",
    });
    // blasted section of the NW tower (charred hole, rebar, debris on the balcony below)
    {
      const [tx, tz] = TOW[0];
      const a = Math.atan2(tz - ZC, tx - XC);
      b.sphere(
        "rubble",
        tx + Math.cos(a) * (TR - 0.3),
        33,
        tz + Math.sin(a) * (TR - 0.3),
        2.6,
        { sx: 0.5, sy: 1.6, sz: 1.2, ry: -a, ws: 8, hs: 6 },
      );
      b.sphere(
        "roof_tar",
        tx + Math.cos(a) * (TR + 0.05),
        33,
        tz + Math.sin(a) * (TR + 0.05),
        2.2,
        { sx: 0.25, sy: 1.5, sz: 1.1, ry: -a, ws: 8, hs: 6 },
      );
      for (let i = 0; i < 8; i++) {
        const r = P.rng(i + 77);
        b.rod(
          "rust",
          [tx + Math.cos(a) * TR, 29 + r() * 7, tz + Math.sin(a) * TR],
          [
            tx + Math.cos(a) * (TR + 0.5 + r()),
            29 + r() * 8,
            tz + Math.sin(a) * (TR + 0.5 + r()) + (r() - 0.5),
          ],
          0.02,
          3,
        );
      }
      D.rubble(
        S,
        tx + Math.cos(a) * (TR + 2.2),
        0,
        tz + Math.sin(a) * (TR + 2.2),
        2.4,
        { n: 12, slab: true, rebar: true, col: true },
      );
    }
    // street clutter
    D.rubble(S, X1 + 2.5, 0, Z0 + 14, 1.6, { n: 7 });
    D.papers(b, X1 + 3, 0.03, ZC + 10, 3, 16);
    S.prop("car", X1 + 6.5, 0, ZC + 14, 0.05, {});
    S.prop("lamp", X1 + 1.2, 0, Z0 + 12, 0, { kind: "floor" });

    // ===================================================================
    // ROOF DECK — the Stokes rooftop farm (walkable)
    // ===================================================================
    const DY = DECK;
    b.box(
      "roof_tar",
      X0 + INS - 0.2,
      DY - 0.1,
      Z0 + INS - 0.2,
      X1 - INS + 0.2,
      DY + 0.02,
      Z1 - INS + 0.2,
      { segLen: 6, grime: 0.7 },
    );
    // iron railing round the deck edge (between the tower drums)
    const RIN = INS - 0.05;
    const rails = [
      [
        [X0 + 9.3, Z0 + RIN],
        [X1 - 9.3, Z0 + RIN],
      ],
      [
        [X0 + 9.3, Z1 - RIN],
        [X1 - 9.3, Z1 - RIN],
      ],
      [
        [X0 + RIN, Z0 + 9.3],
        [X0 + RIN, ZC - 3.6],
      ],
      [
        [X0 + RIN, ZC + 3.6],
        [X0 + RIN, Z1 - 9.3],
      ],
      [
        [X1 - RIN, Z0 + 9.3],
        [X1 - RIN, ZC - 3.6],
      ],
      [
        [X1 - RIN, ZC + 3.6],
        [X1 - RIN, Z1 - 9.3],
      ],
    ];
    for (const seg of rails)
      S.rail("iron", seg, DY, 1.05, { r: 0.03, step: 0.5 });
    // plank walkways
    b.box("wood_planks", XC - 1, DY + 0.02, Z0 + 6, XC + 1, DY + 0.07, Z1 - 6, {
      seg: false,
      grime: 0.5,
    });
    b.box("wood_planks", X0 + 9, DY + 0.02, ZC - 1, X1 - 9, DY + 0.07, ZC + 1, {
      seg: false,
      grime: 0.5,
    });
    // raised beds (dead crops) in four quadrants
    for (const [x0, z0, x1, z1] of [
      [-178, -526, -163, -523.8],
      [-178, -521, -163, -518.8],
      [-157, -521, -141, -518.8],
      [-178, -512, -163, -509.8],
      [-178, -507.5, -163, -505.3],
      [-147, -512, -139, -509.8],
    ])
      X.farmBed(S, x0, z0, x1, z1, DY, { density: 2.2 });
    // scarecrow in a cryo suit
    {
      const x = -168,
        z = -513;
      b.rod("wood_rotten", [x, DY, z], [x, DY + 2.3, z], 0.05, 4);
      b.rod(
        "wood_rotten",
        [x - 0.8, DY + 1.8, z],
        [x + 0.8, DY + 1.8, z],
        0.04,
        4,
      );
      D.figure(b, "canvas", x, DY + 0.3, z, 0.3, 1, "dance", { grime: 0.6 });
      b.sphere("canvas", x, DY + 2.25, z, 0.2, { ws: 8, hs: 6 });
      b.cyl("hay", x, DY + 2.35, z, 0.05, 0.35, 0.18, 8);
    }
    // chicken coops (sheds + wire runs)
    for (const [cx, cz] of [
      [-151, -511],
      [-151, -506],
    ]) {
      b.box(
        "wood_rotten",
        cx - 1.6,
        DY,
        cz - 1.0,
        cx + 1.6,
        DY + 1.8,
        cz + 1.0,
        { seg: false },
      );
      b.cyl("corrugated", cx, DY + 1.8, cz, 0.05, 2.1, 0.8, 4, {
        ry: PI / 4,
        sz: 0.65,
      });
      b.box(
        "dirt",
        cx - 1.5,
        DY + 0.8,
        cz + 1.0,
        cx + 1.5,
        DY + 0.82,
        cz + 1.02,
        { seg: false },
      );
      for (let i = 0; i < 5; i++)
        b.box(
          "hay",
          cx - 1.3 + i * 0.6,
          DY,
          cz - 0.9,
          cx - 0.9 + i * 0.6,
          DY + 0.15,
          cz - 0.5,
          { seg: false, noAO: true },
        );
      S.col(cx - 1.6, DY, cz - 1.0, cx + 1.6, DY + 2.4, cz + 1.0, {
        walkable: false,
      });
    }
    // goat pen (fence + skeletons)
    {
      const x0 = -174,
        x1 = -167,
        z0 = -503,
        z1 = -498;
      for (const [a, c] of [
        [
          [x0, z0],
          [x1, z0],
        ],
        [
          [x1, z0],
          [x1, z1],
        ],
        [
          [x0, z1],
          [x1, z1],
        ],
        [
          [x0, z0],
          [x0, z1 - 1.5],
        ],
      ])
        S.rail("wood_rotten", [a, c], DY, 1.1, { r: 0.04, step: 1.2 });
      b.box("hay", x0 + 0.5, DY, z0 + 0.5, x0 + 2, DY + 0.4, z0 + 1.5, {
        seg: false,
      });
      D.skeleton(b, {
        pts: [
          [x0 + 2.5, DY + 0.25, z0 + 2],
          [x0 + 3.2, DY + 0.3, z0 + 2.3],
          [x0 + 3.9, DY + 0.35, z0 + 2.2],
        ],
        n: 10,
        v: 0.07,
        ribs: [0.3, 0.8],
        ribLen: 0.45,
        mount: false,
        skull: {
          len: 0.3,
          h: 0.14,
          w: 0.14,
          horns: [
            { x: -0.06, y: 0.1, z: 0.05, r: 0.03, l: 0.25 },
            { x: 0.06, y: 0.1, z: 0.05, r: 0.03, l: 0.25 },
          ],
        },
        floor: DY,
      });
    }
    // smashed greenhouse (steel & glass frame) — the seed bank lives here
    {
      const gx0 = -157,
        gx1 = -147,
        gz0 = -533,
        gz1 = -526;
      for (let x = gx0; x <= gx1 + 0.01; x += 2) {
        b.rod("steel", [x, DY, gz0], [x, DY + 2.4, gz0], 0.04, 4);
        b.rod("steel", [x, DY, gz1], [x, DY + 2.4, gz1], 0.04, 4);
        b.rod(
          "steel",
          [x, DY + 2.4, gz0],
          [x, DY + 3.4, (gz0 + gz1) / 2],
          0.035,
          4,
        );
        b.rod(
          "steel",
          [x, DY + 2.4, gz1],
          [x, DY + 3.4, (gz0 + gz1) / 2],
          0.035,
          4,
        );
      }
      for (const z of [gz0, gz1])
        b.rod("steel", [gx0, DY + 2.4, z], [gx1, DY + 2.4, z], 0.035, 4);
      b.rod(
        "steel",
        [gx0, DY + 3.4, (gz0 + gz1) / 2],
        [gx1, DY + 3.4, (gz0 + gz1) / 2],
        0.04,
        4,
      );
      for (let x = gx0; x < gx1; x += 2)
        if (P.rng(x)() < 0.4)
          b.box(
            "glass",
            x + 0.05,
            DY + 2.45,
            gz0 + 0.1,
            x + 1.95,
            DY + 2.5,
            gz0 + 1.8,
            { rx: -0.55, seg: false, noAO: true },
          );
      D.shards(b, (gx0 + gx1) / 2, DY + 0.03, (gz0 + gz1) / 2, 4, 30);
      b.box(
        "wood_rotten",
        gx0 + 0.5,
        DY,
        gz0 + 0.4,
        gx1 - 0.5,
        DY + 0.9,
        gz0 + 1.3,
        { seg: false },
      ); // potting bench
      for (let i = 0; i < 9; i++)
        b.lathe(
          "terracotta",
          [
            [0.001, 0],
            [0.1, 0],
            [0.14, 0.18],
            [0.001, 0.18],
          ],
          8,
          gx0 + 1 + i * 0.95,
          DY + 0.9,
          gz0 + 0.85,
          { noAO: true },
        );
      S.col(gx0 + 0.5, DY, gz0 + 0.4, gx1 - 0.5, DY + 0.9, gz0 + 1.3, {
        walkable: false,
      });
      S.anchor("seedbank", gx1 - 1.4, DY, gz1 - 2.3, 0); // quest marker: standing spot in front of the strongbox (its lid faces -z)
      // the seed bank strongbox (welded steel, green paint, a brass plate)
      {
        const sx = gx1 - 1.4,
          sz = gz1 - 1.2;
        b.box(
          "paint_green",
          sx - 0.55,
          DY,
          sz - 0.35,
          sx + 0.55,
          DY + 0.7,
          sz + 0.35,
          { seg: false },
        );
        b.box(
          "steel",
          sx - 0.6,
          DY + 0.7,
          sz - 0.4,
          sx + 0.6,
          DY + 0.78,
          sz + 0.4,
          { seg: false },
        );
        for (const dx of [-0.35, 0.35])
          b.box(
            "brass",
            sx + dx - 0.08,
            DY + 0.35,
            sz - 0.39,
            sx + dx + 0.08,
            DY + 0.5,
            sz - 0.35,
            { seg: false },
          );
        S.col(sx - 0.6, DY, sz - 0.4, sx + 0.6, DY + 0.78, sz + 0.4, {
          walkable: false,
        });
        S.container("Stokes Seed Bank", sx, DY + 0.5, sz - 0.4, {
          items: [
            ["uw_seed_bank", 1],
            ["scrip", 40],
            ["uw_greens", 2],
          ],
          locked: 0,
          lock: P.LOCKS.ans_seedbank,
          radius: 1.0,
          respawn: false,
        });
      }
      S.anchor("greenhouse", (gx0 + gx1) / 2, DY, (gz0 + gz1) / 2, 0);
      S.prop("terminal", gx0 + 2.2, DY + 0.9, gz0 + 0.85, 0, {
        terminalId: "uw_ans_farm",
        mount: "bare",
      });
    }
    // water tower + roof bulkhead (stair house with the door back inside)
    X.waterTower(b, -170, DY, -530, { r: 2.0, h: 3.4, legs: 3.0 });
    S.col(-172, DY, -532, -168, DY + 7, -528, { walkable: false });
    const BH = { x0: XC - 3, x1: XC + 3, z0: Z1 - 11, z1: Z1 - 6.5 };
    b.box("brick_tan", BH.x0, DY, BH.z0, BH.x1, DY + 3.4, BH.z1);
    b.box(
      "limestone_warm",
      BH.x0 - 0.2,
      DY + 3.4,
      BH.z0 - 0.2,
      BH.x1 + 0.2,
      DY + 3.7,
      BH.z1 + 0.2,
      { seg: false },
    );
    b.box("wood_dark", XC - 0.7, DY, BH.z0 - 0.06, XC + 0.7, DY + 2.3, BH.z0, {
      seg: false,
    });
    const rs = P.texMat(
      "ans_roof_sign",
      P.signTex(
        "ans_roof_sign",
        ["STOKES FARM", "RESIDENTS ONLY"],
        "plain",
        256,
        128,
        { bg: "#e6dcc0", fg: "#3a2a1a" },
      ),
      {},
    );
    b.quad(rs, XC, DY + 2.7, BH.z0 - 0.07, 1.2, 0.6, { ry: PI });
    S.col(BH.x0, DY, BH.z0, BH.x1, DY + 3.7, BH.z1, { walkable: false });
    S.anchor("roof_door", XC, DY, BH.z0 - 1.4, 0);
    S.glow(XC, DY + 2.6, BH.z0 - 0.3, 0xffc070, 0.5);
    b.sphere("lamp_dim", XC, DY + 2.6, BH.z0 - 0.25, 0.12, { ws: 6, hs: 5 });
    // Maniac nest + Stokes's rocking chair by the coops
    D.rockingChair(b, -165, DY, -506, PI * 0.8);
    S.prop("mattress", -146, DY, -501, 0.2, {});
    S.prop("skeleton", -161.5, DY, -527, 0.7, { pose: "lying" });
    S.anchor("boss_roof", -152, DY, -516, 0);
    S.anchor("boss", -152, DY, -516, 0);
    S.anchor("rooftop", XC, DY, ZC, 0);
    S.build({ shadow: true, lod: 300 });
    return S;
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
