// play-inline-152 03 — box
// Lines 146-830 of readable/play-inline-152.pretty.js (statement-aligned).
  function buildExterior() {
    const S = P.site("dakota_ext", { grime: 0.5 });
    const b = S.b;
    const X0 = -186,
      X1 = -134,
      Z0 = -638,
      Z1 = -594,
      CX0 = -172,
      CX1 = -148,
      CZ0 = -626,
      CZ1 = -606,
      H = 27,
      RT = 35;
    const PZ0 = -618.5,
      PZ1 = -613.5,
      AR = 2.5,
      AS = 4.3; // carriage passage
    // ground paving + courtyard cobbles
    b.box("sidewalk", -187.9, 0, -639.9, -132.1, 0.03, -592.1, {
      segLen: 8,
      grime: 0.6,
      noAO: true,
    });
    // ---- wings (visual) ----
    const wingBoxes = [
      [X0, Z0, CX0, Z1],
      [CX0, Z0, CX1, CZ0],
      [CX0, CZ1, CX1, Z1], // west, north, south
      [CX1, Z0, X1, PZ0],
      [CX1, PZ1, X1, Z1], // east wing split by the passage
    ];
    for (const [x0, z0, x1, z1] of wingBoxes) {
      b.box("brownstone", x0, 0, z0, x1, 4.3, z1);
      b.box("brick_buff", x0, 4.3, z0, x1, H, z1);
      S.col(x0, 0, z0, x1, H, z1);
    }
    b.box("brick_buff", CX1, AS + AR, PZ0, X1, H, PZ1);
    S.col(CX1, AS + AR, PZ0, X1, H, PZ1);
    // carriage passage: arched ceiling, arch rings, gates, lamps
    b.inside(
      "brownstone",
      new THREE.CylinderGeometry(AR, AR, X1 - CX1, 14, 1, true, 0, PI).rotateZ(
        HP,
      ),
      P.m4((CX1 + X1) / 2, AS, (PZ0 + PZ1) / 2),
      {},
    );
    for (const s of [-1, 1])
      b.box(
        "brownstone",
        CX1,
        0,
        s < 0 ? PZ0 : PZ1 - 0.01,
        X1,
        AS,
        s < 0 ? PZ0 + 0.01 : PZ1,
        { seg: false },
      );
    for (const [side, c] of [
      ["e", X1],
      ["w", CX1],
    ]) {
      const F = P.face(S, side, PZ0 - 3, PZ1 + 3, c);
      const uc = F.len / 2;
      const sh = new THREE.Shape();
      sh.moveTo(-AR, 0);
      sh.lineTo(-AR, AR);
      sh.lineTo(AR, AR);
      sh.lineTo(AR, 0);
      sh.absarc(0, 0, AR, 0, PI, false);
      b.extrude("brick_buff", sh, 1.0, F.mat(uc, AS, -1.0));
      F.arch("brownstone", uc, AS, AR, 0.7, 0, 0.35);
      F.box(
        "brownstone",
        uc - 0.4,
        uc + 0.4,
        AS + AR - 0.2,
        AS + AR + 0.9,
        0,
        0.5,
      );
      for (const s2 of [-1, 1])
        F.box(
          "brownstone",
          uc + s2 * (AR + 0.35) - 0.35,
          uc + s2 * (AR + 0.35) + 0.35,
          0,
          AS,
          0,
          0.4,
        );
    }
    // iron gates half open at the street end
    for (const s of [-1, 1]) {
      const hz = s < 0 ? PZ0 : PZ1,
        ang = 0.75;
      for (let i = 0; i < 8; i++) {
        const L = 0.15 + i * 0.3,
          px = X1 + 0.15 + Math.sin(ang) * L,
          pz = hz - s * Math.cos(ang) * L;
        b.rod("iron", [px, 0, pz], [px, 3.2, pz], 0.022, 4);
        b.cyl("gold", px, 3.2, pz, 0.0, 0.05, 0.18, 4);
      }
      for (const yy of [0.3, 1.6, 3.0])
        b.rod(
          "iron",
          [X1 + 0.15, yy, hz],
          [X1 + 0.15 + Math.sin(ang) * 2.3, yy, hz - s * Math.cos(ang) * 2.3],
          0.03,
          4,
        );
    }
    for (const s of [-1, 1]) {
      b.rod(
        "iron",
        [(CX1 + X1) / 2, AS + AR, (PZ0 + PZ1) / 2],
        [(CX1 + X1) / 2 + s * 3, AS + AR - 0.4, (PZ0 + PZ1) / 2],
        0.02,
        3,
      );
    }
    b.sphere("lamp_dim", (CX1 + X1) / 2, AS + AR - 1.2, (PZ0 + PZ1) / 2, 0.35, {
      ws: 8,
      hs: 6,
    });
    b.rod(
      "iron",
      [(CX1 + X1) / 2, AS + AR - 0.9, (PZ0 + PZ1) / 2],
      [(CX1 + X1) / 2, AS + AR, (PZ0 + PZ1) / 2],
      0.02,
      3,
    );
    // sentry box beside the arch (bronze-green)
    {
      const sx = -133.1,
        sz = PZ0 - 2.2;
      b.box("verdigris", sx - 0.7, 0, sz - 0.7, sx + 0.7, 2.4, sz + 0.7, {
        seg: false,
      });
      b.cyl("verdigris", sx, 2.4, sz, 0.05, 1.0, 1.0, 4, { ry: PI / 4 });
      b.box("glass_dark", sx + 0.69, 1.1, sz - 0.4, sx + 0.72, 2.0, sz + 0.4, {
        seg: false,
      });
      S.col(sx - 0.7, 0, sz - 0.7, sx + 0.7, 2.4, sz + 0.7, {
        walkable: false,
      });
    }
    // name plate
    const np = P.texMat(
      "dak_name",
      P.signTex("dak_name", ["THE DAKOTA"], "engraved", 512, 96, {
        bg: "#7a5646",
        fg: "rgba(230,210,170,0.9)",
        spacing: 6,
      }),
      { rough: 0.9 },
    );
    b.quad(np, X1 + 0.42, AS + AR + 1.35, (PZ0 + PZ1) / 2, 3.6, 0.6, {
      ry: HP,
    });

    // ---- facades ----
    const rows = [
      { y: 5.0, h: 2.3 },
      { y: 8.4, h: 2.3 },
      { y: 11.8, h: 2.3, hood: "pediment" },
      { y: 15.2, h: 2.3 },
      { y: 18.6, h: 2.3 },
      { y: 22.0, h: 2.6, arch: true },
    ];
    const facade = (side, a0, a1, c, o) => {
      o = o || {};
      const F = P.face(S, side, a0, a1, c);
      F.band("brownstone", 4.1, 4.5, 0, 0.4);
      F.band("brownstone", 11.1, 11.4, 0, 0.25);
      F.band("brownstone", 18.1, 18.4, 0, 0.25);
      F.cornice("brownstone", 26.1, 0.9, { step: 0.7 });
      const n = Math.round(F.len / 4);
      const bays = [];
      for (let i = 0; i < n; i++) {
        const u = ((i + 0.5) * F.len) / n;
        if (o.skip && o.skip(u)) continue;
        bays.push(u);
      }
      P.windowGrid(F, bays, rows, {
        sill: "brownstone",
        hoodKey: "brownstone",
        frame: "paint_white",
        broken: 0.22,
        boarded: 0.1,
        lit: o.lit || 0,
        seed: o.seed,
      });
      // ground floor windows in the rusticated base
      for (const u of bays)
        if (!(o.skipGround && o.skipGround(u)))
          F.window(u, 1.1, 1.1, 2.0, {
            style: "dark",
            frame: "iron",
            sill: "brownstone",
            mull: false,
          });
      // rustication joints
      for (let y = 0.9; y < 4.1; y += 0.9)
        F.box("brownstone", 0, F.len, y - 0.04, y + 0.04, 0.01, 0.06, {
          seg: false,
          grime: 0.9,
        });
      // iron balconies on the 6th & 7th floors (central bays)
      if (o.balc !== false)
        for (const u of bays) {
          if (Math.abs(u - F.len / 2) > 7 || Math.abs(u - F.len / 2) < 2)
            continue;
          for (const y of [18.4, 21.8]) {
            F.box("brownstone", u - 1.1, u + 1.1, y - 0.15, y, 0, 0.9, {
              seg: false,
            });
            F.box("iron", u - 1.1, u + 1.1, y + 0.95, y + 1.0, 0.85, 0.9, {
              seg: false,
            });
            for (let k = -5; k <= 5; k++)
              F.box(
                "iron",
                u + k * 0.2 - 0.015,
                u + k * 0.2 + 0.015,
                y,
                y + 0.95,
                0.86,
                0.89,
                { seg: false },
              );
          }
        }
      return F;
    };
    const FE = facade("e", Z0, Z1, X1, {
      skipGround: (u) => Math.abs(u - 22) < 4,
      lit: 0.04,
      seed: 3,
    });
    facade("w", Z0, Z1, X0, { seed: 5 });
    facade("n", X0, X1, Z0, { seed: 7 });
    facade("s", X0, X1, Z1, { seed: 9, lit: 0.04 });
    // courtyard facades (plainer)
    for (const [side, a0, a1, c] of [
      ["w", CZ0, CZ1, CX1],
      ["e", CZ0, CZ1, CX0],
      ["s", CX0, CX1, CZ0],
      ["n", CX0, CX1, CZ1],
    ]) {
      const F = P.face(S, side, a0, a1, c);
      F.band("brownstone", 4.1, 4.4, 0, 0.3);
      F.cornice("brownstone", 26.2, 0.6, { mods: false });
      const n = Math.round(F.len / 4),
        bays = [];
      for (let i = 0; i < n; i++) bays.push(((i + 0.5) * F.len) / n);
      P.windowGrid(
        F,
        bays.filter((u) => !(side === "w" && Math.abs(u - F.len / 2) < 3.5)),
        rows,
        {
          sill: "brownstone",
          frame: "paint_white",
          broken: 0.3,
          boarded: 0.12,
          seed: c,
        },
      );
    }
    // ---- roofs: mansards on every wing, corner pavilions with pyramid roofs ----
    mansard(
      b,
      "slate",
      (X0 + CX0) / 2,
      (Z0 + Z1) / 2,
      Z1 - Z0,
      CX0 - X0,
      false,
      H,
      RT,
      2.2,
    );
    mansard(
      b,
      "slate",
      (CX1 + X1) / 2,
      (Z0 + Z1) / 2,
      Z1 - Z0,
      X1 - CX1,
      false,
      H,
      RT,
      2.2,
    );
    mansard(
      b,
      "slate",
      (CX0 + CX1) / 2,
      (Z0 + CZ0) / 2,
      CX1 - CX0,
      CZ0 - Z0,
      true,
      H,
      RT,
      2.2,
    );
    mansard(
      b,
      "slate",
      (CX0 + CX1) / 2,
      (CZ1 + Z1) / 2,
      CX1 - CX0,
      Z1 - CZ1,
      true,
      H,
      RT,
      2.2,
    );
    for (const [px, pz] of [
      [X0, Z0],
      [X1, Z0],
      [X0, Z1],
      [X1, Z1],
    ]) {
      const cx = px + (px < -160 ? 4.5 : -4.5),
        cz = pz + (pz < -616 ? 4.5 : -4.5);
      b.box(
        "brick_buff",
        cx - 4.6,
        H - 0.4,
        cz - 4.6,
        cx + 4.6,
        H + 2.4,
        cz + 4.6,
      );
      b.box(
        "brownstone",
        cx - 5.3,
        H + 1.6,
        cz - 5.3,
        cx + 5.3,
        H + 2.6,
        cz + 5.3,
        { seg: false },
      );
      b.cyl("slate", cx, H + 2.6, cz, 0.3, 7.4, 9.5, 4, {
        ry: PI / 4,
        hSeg: 2,
      });
      b.cyl("verdigris", cx, H + 12.0, cz, 0.05, 0.35, 2.4, 6);
      b.sphere("verdigris", cx, H + 12.4, cz, 0.35, { ws: 8, hs: 6 });
      b.rod("iron", [cx, H + 12.6, cz], [cx, H + 16.5, cz], 0.04, 4);
      // pavilion dormers (one per outer side)
      for (const [nx, nz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const ex = cx + nx * 3.9,
          ez = cz + nz * 3.9;
        b.box(
          "slate",
          ex - (nz ? 0.8 : 0.9),
          H + 3.2,
          ez - (nx ? 0.8 : 0.9),
          ex + (nz ? 0.8 : 0.9),
          H + 5.2,
          ez + (nx ? 0.8 : 0.9),
          { seg: false },
        );
        b.box(
          "glass_dark",
          ex + nx * 0.9 - (nz ? 0.5 : 0.02),
          H + 3.5,
          ez + nz * 0.9 - (nx ? 0.5 : 0.02),
          ex + nx * 0.9 + (nz ? 0.5 : 0.02),
          H + 4.9,
          ez + nz * 0.9 + (nx ? 0.5 : 0.02),
          { seg: false },
        );
        b.cyl("brownstone", ex, H + 5.2, ez, 0.05, 1.05, 0.9, 4, {
          ry: PI / 4,
        });
      }
      S.col(cx - 5.1, 0, cz - 5.1, cx + 5.1, H + 2.6, cz + 5.1);
    }
    // dormers on the outer slopes + big central gables
    const slopeDormers = (side, a0, a1, c) => {
      const F = P.face(S, side, a0, a1, c);
      const n = Math.round(F.len / 4);
      for (let i = 0; i < n; i++) {
        const u = ((i + 0.5) * F.len) / n;
        if (u < 10 || u > F.len - 10 || Math.abs(u - F.len / 2) < 4) continue;
        dormer(b, F, u, H + 0.7, -0.6, {
          style: (i * 7) % 5 === 0 ? "broken" : "dark",
        });
        dormer(b, F, u, H + 4.1, -3.1, { style: "dark" });
      }
      // central gable
      const uc = F.len / 2;
      const sh = new THREE.Shape();
      sh.moveTo(-4, 0);
      sh.lineTo(4, 0);
      sh.lineTo(4, 3);
      sh.lineTo(2.2, 3);
      sh.lineTo(2.2, 5.2);
      sh.lineTo(0, 9.5);
      sh.lineTo(-2.2, 5.2);
      sh.lineTo(-2.2, 3);
      sh.lineTo(-4, 3);
      sh.closePath();
      b.extrude("brick_buff", sh, 1.2, F.mat(uc, H, -1.0));
      F.box("brownstone", uc - 4.2, uc + 4.2, H + 2.9, H + 3.25, -1.0, 0.4, {
        seg: false,
      });
      F.window(uc - 1.8, H + 0.6, 1.2, 2.0, {
        style: "dark",
        frame: "paint_white",
        sill: "brownstone",
        d: 0.22,
      });
      F.window(uc + 1.8, H + 0.6, 1.2, 2.0, {
        style: "broken",
        frame: "paint_white",
        sill: "brownstone",
        d: 0.22,
      });
      const cp = F.pt(uc, 0.24);
      b.torus("brownstone", cp[0], H + 5.6, cp[1], 0.8, 0.14, TAU, {
        ry: F.ry,
        ts: 16,
        rs: 4,
      });
      b.cyl("glass_dark", cp[0], H + 5.6, cp[1], 0.78, 0.78, 0.05, 14, {
        rx: HP,
        ry: F.ry,
      });
      const tp = F.pt(uc, -0.4);
      b.cyl("verdigris", tp[0], H + 9.5, tp[1], 0.04, 0.3, 2.0, 6);
      b.sphere("verdigris", tp[0], H + 11.6, tp[1], 0.22, { ws: 6, hs: 5 });
    };
    slopeDormers("e", Z0, Z1, X1);
    slopeDormers("w", Z0, Z1, X0);
    slopeDormers("n", X0, X1, Z0);
    slopeDormers("s", X0, X1, Z1);
    // chimney stacks
    for (const [x, z] of [
      [-179, -616],
      [-141, -610],
      [-160, -632],
      [-160, -600],
      [-179, -600],
      [-141, -628],
    ]) {
      b.box("brick_buff", x - 0.9, H + 3, z - 0.5, x + 0.9, RT + 3.2, z + 0.5);
      b.box(
        "brownstone",
        x - 1.05,
        RT + 3.2,
        z - 0.65,
        x + 1.05,
        RT + 3.5,
        z + 0.65,
        { seg: false },
      );
      for (const dx of [-0.5, 0, 0.5])
        b.cyl("terracotta", x + dx, RT + 3.5, z, 0.14, 0.16, 0.6, 6);
    }
    // collapsed section of the north-east roof: charred rafters
    b.box("rubble", -152, H + 0.2, -637, -146, H + 1.4, -630, {
      seg: false,
      rz: 0.2,
    });
    for (let i = 0; i < 7; i++)
      b.rod(
        "wood_rotten",
        [-152 + i * 0.9, H + 1, -636],
        [-151 + i * 0.9, RT - 1 - (i % 3), -632],
        0.09,
        4,
        { square: true },
      );
    // ---- the moat railing along CPW + lamps ----
    b.box("brownstone", -133.0, 0, Z0, -132.4, 0.5, PZ0 - 3, { seg: false });
    b.box("brownstone", -133.0, 0, PZ1 + 3, -132.4, 0.5, Z1, { seg: false });
    S.col(-133.0, 0, Z0, -132.4, 1.6, PZ0 - 3, { walkable: false });
    S.col(-133.0, 0, PZ1 + 3, -132.4, 1.6, Z1, { walkable: false });
    b.box("concrete_dark", -134, 0.005, Z0, -133.0, 0.02, PZ0 - 3, {
      seg: false,
      grime: 0.9,
    });
    b.box("concrete_dark", -134, 0.005, PZ1 + 3, -133.0, 0.02, Z1, {
      seg: false,
      grime: 0.9,
    });
    for (let z = Z0 + 0.2; z < Z1; z += 0.3) {
      if (z > PZ0 - 3 && z < PZ1 + 3) continue;
      b.rod("iron", [-132.7, 0.5, z], [-132.7, 1.6, z], 0.018, 4);
      if (Math.round(z / 0.3) % 10 === 0) {
        b.box("iron", -132.85, 0.5, z - 0.12, -132.55, 1.75, z + 0.12, {
          seg: false,
        });
        b.sphere("gold", -132.7, 1.85, z, 0.1, { ws: 6, hs: 4 });
      }
    }
    for (const z of [Z0 + 0.3, PZ0 - 3.2, PZ1 + 3.2, Z1 - 0.3])
      b.rod(
        "iron",
        [-132.7, 1.55, z < -616 ? Math.min(z, PZ0 - 3) : Math.max(z, PZ1 + 3)],
        [-132.7, 1.55, z],
        0.02,
        3,
      );
    b.rod("iron", [-132.7, 1.55, Z0 + 0.2], [-132.7, 1.55, PZ0 - 3], 0.025, 4);
    b.rod("iron", [-132.7, 1.55, PZ1 + 3], [-132.7, 1.55, Z1 - 0.2], 0.025, 4);
    for (const z of [PZ0 - 3.3, PZ1 + 3.3]) {
      b.cyl("iron", -132.7, 0.5, z, 0.08, 0.12, 3.6, 8);
      b.sphere("lamp_dim", -132.7, 4.3, z, 0.3, { ws: 8, hs: 6 });
      S.glow(-132.7, 4.3, z, 0xffc880, 0.9);
    }
    // ---- courtyard: cobbles, dry fountain beds, dead trees, a wrecked carriage-car ----
    b.box("granite_dark", CX0, 0.01, CZ0, CX1, 0.05, CZ1, {
      segLen: 4,
      grime: 0.8,
    });
    for (const [x, z] of [
      [-165, -620],
      [-155, -620],
      [-165, -612],
      [-155, -612],
    ]) {
      b.box("brownstone", x - 2.2, 0, z - 1.6, x + 2.2, 0.6, z + 1.6, {
        seg: false,
      });
      b.box("dirt", x - 2.0, 0.6, z - 1.4, x + 2.0, 0.65, z + 1.4, {
        seg: false,
      });
      S.col(x - 2.2, 0, z - 1.6, x + 2.2, 0.6, z + 1.6);
      const r = P.rng(x * 3 + z);
      b.rod(
        "wood_rotten",
        [x, 0.6, z],
        [x + (r() - 0.5), 4.5, z + (r() - 0.5)],
        0.12,
        5,
        { rTop: 0.05 },
      );
      for (let k = 0; k < 5; k++)
        b.rod(
          "wood_rotten",
          [x + (r() - 0.5) * 0.4, 2.5 + k * 0.4, z],
          [x + (r() - 0.5) * 3, 3.5 + k * 0.5, z + (r() - 0.5) * 3],
          0.04,
          3,
        );
    }
    b.cyl("brownstone", -160, 0, -616, 1.8, 2.0, 0.7, 16);
    b.cyl("concrete_dark", -160, 0.7, -616, 1.6, 1.6, 0.02, 16);
    b.lathe(
      "brownstone",
      [
        [0.001, 0],
        [0.3, 0],
        [0.2, 0.8],
        [0.9, 1.3],
        [0.95, 1.45],
        [0.001, 1.45],
      ],
      12,
      -160,
      0.7,
      -616,
    );
    S.col(-161.9, 0, -617.9, -158.1, 0.7, -614.1);
    // graffiti on the passage wall
    const gr = P.texMat(
      "dak_graf",
      P.signTex(
        "dak_graf",
        ["DONT GO UP", "SHE SINGS AT NIGHT"],
        "raider",
        512,
        256,
        { fg: "#d8d0b0" },
      ),
      { transparent: true },
    );
    b.quad(gr, -141, 2.2, PZ0 + 0.03, 3.2, 1.6, { ry: 0 });
    // courtyard entrance door (north-west corner, west wing inner face)
    const FD = P.face(S, "e", CZ0, CZ1, CX0);
    const du = CZ1 - -622; // u runs from z = CZ1 northward
    FD.box("brownstone", du - 1.4, du + 1.4, 0, 3.4, 0, 0.35);
    FD.box("wood_dark", du - 0.9, du + 0.9, 0, 2.8, 0.3, 0.4);
    FD.box("glass_dark", du - 0.6, du + 0.6, 1.4, 2.5, 0.4, 0.42, {
      seg: false,
    });
    FD.box("brownstone", du - 1.6, du + 1.6, 3.4, 3.8, 0, 0.7, { seg: false });
    D.sconce(S, CX0 + 0.3, 2.6, -620, -HP, {
      dark: false,
      r: 4,
      i: 0.4,
      size: 0.4,
    });
    // the residents' entrance must read from the carriage arch: granite step, an iron-and-glass marquise on tie rods,
    // twin lamps under it and a brass name plate beside the door
    FD.box("granite_dark", du - 1.5, du + 1.5, 0, 0.14, 0, 1.1, { seg: false });
    FD.box("iron", du - 1.9, du + 1.9, 3.95, 4.05, 0, 1.7, { seg: false });
    FD.box("glass_dark", du - 1.8, du + 1.8, 4.05, 4.08, 0.05, 1.62, {
      seg: false,
    });
    FD.box("iron", du - 1.9, du + 1.9, 3.75, 4.05, 1.62, 1.72, { seg: false });
    for (const s2 of [-1, 1]) {
      const a = FD.pt(du + s2 * 1.7, 0.05),
        c = FD.pt(du + s2 * 1.7, 1.65);
      b.rod("iron", [a[0], 5.4, a[1]], [c[0], 4.05, c[1]], 0.025, 4);
      const l = FD.pt(du + s2 * 1.2, 1.3);
      b.rod("iron", [l[0], 3.95, l[1]], [l[0], 3.6, l[1]], 0.015, 3);
      b.sphere("lamp_dim", l[0], 3.45, l[1], 0.16, { ws: 8, hs: 6 });
      S.glow(l[0], 3.45, l[1], 0xffc880, 0.6);
    }
    {
      const pl = P.texMat(
        "dak_resplate",
        P.signTex(
          "dak_resplate",
          ["THE DAKOTA", "Residents"],
          "brass",
          384,
          192,
        ),
        { metal: 0.6, rough: 0.4 },
      );
      FD.quad(pl, du + 1.95, 1.6, 0.62, 0.31, 0.36);
    }
    // service door (north inner face of the courtyard): the servants' stair from the basement and the 3rd floor
    // comes down here — barred from inside until the player leaves that way (loop-back exit, see the interior file)
    {
      const FSV = P.face(S, "s", CX0, CX1, CZ0);
      const SVX = -160,
        su = SVX - CX0; // centred on the lane between the planters (clear walk out)
      FSV.box("brownstone", su - 1.2, su + 1.2, 0, 2.9, 0, 0.3);
      FSV.box("iron", su - 0.7, su + 0.7, 0, 2.4, 0.28, 0.36);
      for (const y of [0.45, 1.2, 1.95])
        FSV.box("rust", su - 0.72, su + 0.72, y - 0.06, y + 0.06, 0.36, 0.4, {
          seg: false,
        });
      FSV.box("brownstone", su - 1.35, su + 1.35, 2.9, 3.15, 0, 0.5, {
        seg: false,
      });
      FSV.box("granite_dark", su - 1.0, su + 1.0, 0, 0.15, 0, 0.6, {
        seg: false,
      });
      const svs = P.texMat(
        "dak_service",
        P.signTex(
          "dak_service",
          ["SERVICE", "Tradesmen · Deliveries", "STAFF ONLY"],
          "label",
          384,
          192,
          { bg: "#d8ccb0" },
        ),
        { rough: 0.9 },
      );
      FSV.quad(svs, su + 1.6, 1.7, 0.7, 0.35, 0.33);
      b.box("iron", SVX - 0.2, 3.2, CZ0 + 0.3, SVX + 0.2, 3.3, CZ0 + 0.7, {
        seg: false,
      });
      b.sphere("lamp_dim", SVX, 3.05, CZ0 + 0.6, 0.12, { ws: 8, hs: 6 });
      S.glow(SVX, 3.05, CZ0 + 0.6, 0xffc880, 0.45);
      S.anchor("service_door", SVX, 0, CZ0 + 1.8, PI);
    }
    S.anchor("courtyard", -160, 0, -610, 0);
    S.anchor("exterior_entrance", -170.4, 0, -622, -HP);
    S.anchor("street", -131.5, 0, -616, -HP);
    S.build({ shadow: true, lod: 260 });
    return S;
  }

  // ===================================================================
  // Registration: right after the exterior is built, 20_dakota_interior.js
  // (P.interiorBuilders.dakota) builds the interior cell, the street<->interior doors
  // and registers the G.pois entry (see P.finishSite in 00_kit.js).
  // ===================================================================
