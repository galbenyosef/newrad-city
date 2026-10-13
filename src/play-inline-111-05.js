// play-inline-111 05 — math
// Lines 759-1721 of readable/play-inline-111.pretty.js (statement-aligned).
  function lobby(rec) {
    lobbyMaterials();
    const O = G.LAYOUT.INTERIORS.empire_lobby.origin;
    const ox = O.x,
      oz = O.z;
    const b = K.builder("esb_lobby", { grime: 0.22 });
    const fxb = K.builder("esb_lobby_fx", { grime: 0 });
    const glows = K.glowSet("esb_lobby");
    const spill = K.spillSet("esb_lobby"),
      refl = K.reflSet("esb_lobby");
    const P = K.parts,
      T = K.T;
    const X0 = ox - 22,
      X1 = ox + 22,
      Z0 = oz - 7,
      Z1 = oz + 7,
      H = 11;
    const fixtures = [];
    const M = "esb_marble",
      MD = 0x6a3a1e; // dark (base / frames) tint of the same marble
    // ---------------- floor ----------------
    b.boxMM("esb_floor", X0 - 8, -0.3, Z0 - 8, X1, 0.02, Z1 + 8, {
      faces: "t",
      grime: 0.18,
    });
    // ---------------- walls (3 archways each side into the elevator bays) ----------------
    const archs = [
      { at: 10, w: 4, h: 6.5, arch: true },
      { at: 22, w: 4, h: 6.5, arch: true },
      { at: 34, w: 4, h: 6.5, arch: true },
    ];
    b.wall(M, X0, Z0, X1, Z0, 0, H, 0.6, archs, {});
    b.wall(
      M,
      X1,
      Z1,
      X0,
      Z1,
      0,
      H,
      0.6,
      archs.map((a) => ({ ...a, at: 44 - a.at })),
      {},
    );
    b.wall(M, X1, Z0, X1, Z1, 0, H, 0.8, [{ at: 7, w: 5, h: 7.5 }], {});
    b.wall(M, X0, Z1, X0, Z0, 0, H, 0.8, [], {});
    // side-wall dressing, per wall: s = +1 north wall (inner face z = Z0 + 0.3, facing +z), -1 south wall
    const PIL = [6.4, 13.6, 18.4, 25.6, 30.4, 37.6],
      ELEV = [16, 28];
    for (const sgn of [1, -1]) {
      const zi = sgn > 0 ? Z0 + 0.3 : Z1 - 0.3,
        face = sgn > 0 ? 0 : Math.PI,
        n = sgn; // n: +z or -z into the hall
      const inArch = (x) =>
        archs.some((a) => Math.abs(x - (X0 + a.at)) < a.w / 2 + 0.05);
      // dark marble skirting + bronze cap, broken at the arches
      let segStart = X0 + 0.4;
      const bounds = [];
      const gaps = archs
        .map((a) => [X0 + a.at - a.w / 2, X0 + a.at + a.w / 2])
        .concat(ELEV.map((p) => [X0 + p - 1.28, X0 + p + 1.28]))
        .sort((a, c) => a[0] - c[0]);
      for (const gp of gaps) {
        bounds.push([segStart, gp[0]]);
        segStart = gp[1];
      }
      bounds.push([segStart, X1 - 0.4]);
      for (const bd of bounds) {
        b.boxMM(
          M,
          bd[0],
          0,
          Math.min(zi, zi + n * 0.08),
          bd[1],
          0.55,
          Math.max(zi, zi + n * 0.08),
          { tint: MD, grime: 0.3 },
        );
        b.boxMM(
          "esb_bronze",
          bd[0],
          0.55,
          Math.min(zi, zi + n * 0.1),
          bd[1],
          0.62,
          Math.max(zi, zi + n * 0.1),
          { grime: 0.1 },
        );
        // deco frieze above the arch heads
        if (bd[1] - bd[0] < 0.05) continue;
        for (let x = bd[0]; x < bd[1] - 0.05; x += 4) {
          const x2 = Math.min(bd[1], x + 4);
          b.panel(
            "esb_sheet",
            (x + x2) / 2,
            7.55,
            zi + n * 0.02,
            x2 - x,
            0.5,
            face,
            {
              rect: [
                SHEET.frieze[0],
                SHEET.frieze[1],
                SHEET.frieze[0] +
                  ((SHEET.frieze[2] - SHEET.frieze[0]) * (x2 - x)) / 4,
                SHEET.frieze[3],
              ],
            },
          );
        }
      }
      for (const p of ELEV)
        b.panel("esb_sheet", X0 + p, 7.55, zi + n * 0.02, 2.56, 0.5, face, {
          rect: [
            SHEET.frieze[0],
            SHEET.frieze[1],
            SHEET.frieze[0] + (SHEET.frieze[2] - SHEET.frieze[0]) * 0.64,
            SHEET.frieze[3],
          ],
        });
      b.boxMM(
        "esb_gold",
        X0 + 0.4,
        7.22,
        Math.min(zi, zi + n * 0.06),
        X1 - 0.4,
        7.3,
        Math.max(zi, zi + n * 0.06),
        { grime: 0.05 },
      );
      b.boxMM(
        "esb_gold",
        X0 + 0.4,
        7.8,
        Math.min(zi, zi + n * 0.06),
        X1 - 0.4,
        7.88,
        Math.max(zi, zi + n * 0.06),
        { grime: 0.05 },
      );
      // slim aluminium mullions between the book-matched slabs
      for (let x = X0 + 1.8; x < X1 - 0.5; x += 3.6)
        if (
          !inArch(x) &&
          !PIL.some((p) => Math.abs(X0 + p - x) < 0.8) &&
          !ELEV.some((p) => Math.abs(X0 + p - x) < 1.5)
        )
          b.boxMM(
            "esb_alu",
            x - 0.03,
            0.62,
            Math.min(zi, zi + n * 0.04),
            x + 0.03,
            7.22,
            Math.max(zi, zi + n * 0.04),
            { grime: 0.05 },
          );
      // arch surrounds: aluminium architrave ring + radiating sunburst grille in the lunette
      for (const a of archs) {
        const ax = X0 + a.at,
          hw = a.w / 2,
          spring = a.h - hw;
        const ring = new THREE.Shape();
        ring.moveTo(-hw - 0.28, 0);
        ring.lineTo(-hw - 0.28, spring);
        ring.absarc(0, spring, hw + 0.28, Math.PI, 0, true);
        ring.lineTo(hw + 0.28, 0);
        ring.lineTo(hw, 0);
        ring.lineTo(hw, spring);
        ring.absarc(0, spring, hw, 0, Math.PI, false);
        ring.lineTo(-hw, 0);
        ring.lineTo(-hw - 0.28, 0);
        b.extrude("esb_alu", ring, 0.1, {
          x: ax,
          y: 0,
          z: zi + n * 0.05,
          ry: 0,
          curveSegments: 16,
          grime: 0.05,
        });
        b.box("esb_alu", ax, spring - 0.06, zi - n * 0.3, a.w, 0.12, 0.08, {
          grime: 0.05,
        });
        for (let k = 1; k < 12; k++) {
          const ang = (Math.PI * k) / 12;
          b.beam(
            "esb_gold",
            ax + Math.cos(ang) * 0.35,
            spring + Math.sin(ang) * 0.35,
            zi - n * 0.3,
            ax + Math.cos(ang) * (hw - 0.05),
            spring + Math.sin(ang) * (hw - 0.05),
            zi - n * 0.3,
            0.045,
            { grime: 0 },
          );
        }
        b.cyl(
          "esb_gold",
          ax,
          spring - 0.02,
          zi - n * 0.3,
          0.36,
          0.36,
          0.06,
          12,
          { arc0: 0, arc: Math.PI, grime: 0 },
        );
      }
      // fluted pilasters (between the arches) with stepped aluminium capitals and deco uplight sconces
      for (const p of PIL) {
        const x = X0 + p,
          z = zi + n * 0.25;
        b.box(M, x, 0, z, 1.1, 10.0, 0.5, { grime: 0.2 });
        for (const fl of [-0.3, -0.1, 0.1, 0.3])
          b.box(M, x + fl, 0.8, zi + n * 0.52, 0.08, 8.6, 0.06, {
            tint: 0xd8b088,
            grime: 0.1,
          });
        b.box(M, x, 0, z + n * 0.02, 1.3, 0.62, 0.62, {
          tint: MD,
          grime: 0.25,
        });
        for (let k = 0; k < 3; k++)
          b.box(
            "esb_alu",
            x,
            9.4 + k * 0.2,
            z + n * 0.03 * k,
            1.2 + k * 0.2,
            0.2,
            0.56 + k * 0.08,
            { grime: 0.05 },
          );
        // sconce: aluminium half-bowl with a glowing rim, throwing a fan of light up the pilaster
        const sz = zi + n * 0.56;
        b.cyl("esb_alu", x, 5.6, sz, 0.14, 0.42, 0.42, 10, {
          arc0: sgn > 0 ? Math.PI : 0,
          arc: Math.PI,
          top: false,
          grime: 0,
        });
        b.cyl("lit_warm", x, 6.0, sz, 0.4, 0.4, 0.03, 10, {
          arc0: sgn > 0 ? Math.PI : 0,
          arc: Math.PI,
          tint: 0xffe2b0,
        });
        fxb.panel("esb_wash", x, 7.6, zi + n * 0.575, 1.9, 3.2, face, {
          tint: 0x8a6a3e,
        });
        glows.add(x, 6.15, zi + n * 0.8, 0xffd8a0, "m");
        spill.add(x, sz + n * 0.6, 0xffc080, 1.8, { y: 0.04, i: 0.22 });
      }
      // elevator doors on the hall walls: bronze leaves, aluminium jamb + fan head, floor dial
      for (const p of ELEV) {
        const x = X0 + p,
          zf = zi + n * 0.02;
        b.panel("esb_sheet", x, 1.65, zf, 2.0, 3.3, face, {
          rect: [
            SHEET.door[0],
            SHEET.door[1],
            SHEET.door[2],
            SHEET.door[1] + (SHEET.door[3] - SHEET.door[1]) * 0.75,
          ],
        });
        b.panel("esb_sheet", x, 4.05, zf, 1.6, 0.8, face, {
          rect: [
            SHEET.door[0],
            SHEET.door[1] + (SHEET.door[3] - SHEET.door[1]) * 0.75,
            SHEET.door[2],
            SHEET.door[3],
          ],
        });
        for (const dx2 of [-1.15, 1.15])
          b.box("esb_alu", x + dx2, 0, zi + n * 0.08, 0.26, 3.5, 0.16, {
            grime: 0.05,
          });
        b.box("esb_alu", x, 3.35, zi + n * 0.08, 2.56, 0.18, 0.18, {
          grime: 0.05,
        });
        b.box("esb_bronze", x, 4.5, zi + n * 0.07, 2.2, 0.12, 0.14, {
          grime: 0.05,
        });
        glows.add(x, 4.1, zi + n * 0.35, 0xffc070, "s");
        refl.add(x, zi + n * 0.3, 2.2, 0xc89050, 1.4, { i: 0.35, y: 0.05 });
      }
      // end bays: directory board (north, by the relief) / brass mail chute (south); near the entrance: fire-alarm & a torn banner
      const ex2 = X0 + 3.2;
      if (sgn > 0) {
        b.panel("esb_sheet", ex2, 2.9, zi + n * 0.05, 1.3, 2.6, face, {
          rect: SHEET.directory,
        });
        b.boxMM(
          "esb_alu",
          ex2 - 0.72,
          1.55,
          Math.min(zi, zi + n * 0.1),
          ex2 + 0.72,
          4.25,
          Math.max(zi, zi + n * 0.1),
          { faces: "tb", grime: 0 },
        );
        glows.add(ex2, 4.35, zi + n * 0.3, 0xfff0d0, "s");
      } else {
        b.panel("esb_sheet", ex2, 1.3, zi + n * 0.34, 0.8, 0.8, face, {
          rect: SHEET.mailbox,
        });
        b.box("esb_bronze", ex2, 0.9, zi + n * 0.17, 0.82, 0.82, 0.32, {
          grime: 0.1,
        });
        b.box("esb_bronze", ex2, 1.72, zi + n * 0.05, 0.12, 5.4, 0.1, {
          grime: 0.05,
        });
      }
      // cove ledge along the top of the wall: hidden uplight trough washes the gold ceiling
      b.boxMM(
        "esb_alu",
        X0 + 0.4,
        H - 1.25,
        Math.min(zi, zi + n * 0.95),
        X1 - 0.4,
        H - 1.05,
        Math.max(zi, zi + n * 0.95),
        { grime: 0.05 },
      );
      b.boxMM(
        M,
        X0 + 0.4,
        H - 1.05,
        Math.min(zi + n * 0.85, zi + n * 0.95),
        X1 - 0.4,
        H - 0.8,
        Math.max(zi + n * 0.85, zi + n * 0.95),
        { tint: MD, grime: 0.1 },
      );
      b.boxMM(
        "lit_warm",
        X0 + 0.6,
        H - 1.05,
        Math.min(zi + n * 0.3, zi + n * 0.55),
        X1 - 0.6,
        H - 0.98,
        Math.max(zi + n * 0.3, zi + n * 0.55),
        { faces: "t", tint: 0xffe0a8 },
      );
      for (let x = X0 + 2; x < X1 - 1; x += 4) {
        spill.add(x, zi + n * 1.6, 0xffc070, 2.6, {
          y: H - 0.03,
          i: 0.38,
          sx: 2.6,
          sz: 2.2,
        });
        glows.add(x, H - 0.85, zi + n * 0.45, 0xffd090, "m");
      }
    }
    // ---------------- ceiling: three gold-leaf coffers between deep stepped beams ----------------
    const CW = (X1 - X0) / 3;
    for (let k = 0; k < 3; k++) {
      const x = X0 + k * CW;
      b.quad(
        "esb_ceiling",
        [x, H, Z0 + 1],
        [x + CW, H, Z0 + 1],
        [x + CW, H, Z1 - 1],
        [x, H, Z1 - 1],
        { rect: [0, 0, 1, 1] },
      );
      spill.add(x + CW / 2, oz, 0xffe0a0, 6.2, { y: H - 0.03, i: 0.16 });
    }
    b.boxMM("esb_ceiling", X0, H - 0.02, Z0, X1, H, Z0 + 1, {
      faces: "b",
      uv: "rect",
      rect: [0.02, 0.02, 0.98, 0.05],
    });
    b.boxMM("esb_ceiling", X0, H - 0.02, Z1 - 1, X1, H, Z1, {
      faces: "b",
      uv: "rect",
      rect: [0.02, 0.95, 0.98, 0.98],
    });
    for (let k = 1; k < 3; k++) {
      const x = X0 + k * CW;
      b.box("esb_gold", x, H - 0.9, oz, 0.5, 0.9, 14, { grime: 0.05 });
      b.box("esb_alu", x, H - 0.55, oz, 0.9, 0.55, 14, { grime: 0.05 });
      b.box("esb_gold", x, H - 0.3, oz, 1.3, 0.3, 14, { grime: 0.05 });
    }
    b.box("esb_gold", X1 - 0.5, H - 0.6, oz, 1.0, 0.6, 14, { grime: 0.05 });
    b.boxMM("plaster", X0, H, Z0, X1, H + 0.3, Z1, { faces: "t" });
    // ---------------- the aluminium relief (west wall) ----------------
    const RX = X0 + 0.4,
      RY = 5.6,
      RZ = oz,
      RW = 8.4,
      RH = 8.0,
      rb = RY - RH / 2; // panel centre / size
    b.boxMM(
      "esb_marble_r",
      RX,
      rb,
      RZ - RW / 2,
      RX + 0.12,
      rb + RH,
      RZ + RW / 2,
      { faces: "e", tint: 0x4a2412, grime: 0.15 },
    );
    for (const e of [
      [rb - 0.25, rb, -RW / 2 - 0.25, RW / 2 + 0.25],
      [rb + RH, rb + RH + 0.25, -RW / 2 - 0.25, RW / 2 + 0.25],
      [rb, rb + RH, -RW / 2 - 0.25, -RW / 2],
      [rb, rb + RH, RW / 2, RW / 2 + 0.25],
    ])
      b.boxMM("esb_alu_r", RX, e[0], RZ + e[2], RX + 0.3, e[1], RZ + e[3], {
        grime: 0.03,
      });
    for (const e of [
      [rb - 0.45, rb - 0.25],
      [rb + RH + 0.25, rb + RH + 0.45],
    ])
      b.boxMM(
        "esb_gold_r",
        RX,
        e[0],
        RZ - RW / 2 - 0.45,
        RX + 0.22,
        e[1],
        RZ + RW / 2 + 0.45,
        { grime: 0.03 },
      );
    // sunburst: rays from behind the mooring mast out to the frame (alternating aluminium / gold)
    const SY = 7.8,
      sx0 = RX + 0.16;
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * Math.PI * 2,
        ca = Math.cos(a),
        sa = Math.sin(a);
      let tMax = 99;
      if (Math.abs(ca) > 1e-3)
        tMax = Math.min(tMax, (RW / 2 - 0.1) / Math.abs(ca));
      if (sa > 1e-3) tMax = Math.min(tMax, (rb + RH - 0.1 - SY) / sa);
      if (sa < -1e-3) tMax = Math.min(tMax, (SY - rb - 0.1) / -sa);
      b.beam(
        k % 2 ? "esb_alu_r" : "esb_gold_r",
        sx0,
        SY + sa * 0.95,
        RZ + ca * 0.95,
        sx0,
        SY + sa * tMax,
        RZ + ca * tMax,
        k % 2 ? 0.05 : 0.09,
        { d: 0.05, grime: 0 },
      );
    }
    b.geo("esb_gold_r", T.cyl12, {
      x: RX + 0.2,
      y: SY,
      z: RZ,
      rz: Math.PI / 2,
      sx: 0.9,
      sy: 0.08,
      sz: 0.9,
      grime: 0,
    });
    b.geo("esb_alu_r", T.torus, {
      x: RX + 0.25,
      y: SY,
      z: RZ,
      ry: Math.PI / 2,
      s: 1.15,
      grime: 0,
    });
    // the tower in stepped aluminium, standing proud of the panel, with vertical fins
    const tiers = [
      [rb + 0.1, 3.3, 4.6, 0.46],
      [3.3, 5.9, 3.2, 0.56],
      [5.9, 6.7, 2.4, 0.62],
      [6.7, 7.2, 1.8, 0.66],
      [7.2, 7.6, 1.2, 0.7],
      [7.6, 8.0, 0.74, 0.74],
      [8.0, 8.7, 0.42, 0.76],
      [8.7, 9.2, 0.2, 0.78],
    ];
    for (const t of tiers) {
      b.boxMM(
        "esb_alu_r",
        RX,
        t[0],
        RZ - t[2] / 2,
        RX + t[3],
        t[1],
        RZ + t[2] / 2,
        { grime: 0.02 },
      );
      for (let z = -t[2] / 2 + 0.12; z < t[2] / 2 - 0.05; z += 0.2)
        b.boxMM(
          "esb_gold_r",
          RX + t[3],
          t[0] + 0.05,
          RZ + z - 0.018,
          RX + t[3] + 0.03,
          t[1] - 0.05,
          RZ + z + 0.018,
          { grime: 0 },
        );
      b.boxMM(
        "esb_gold_r",
        RX,
        t[1] - 0.06,
        RZ - t[2] / 2 - 0.04,
        RX + t[3] + 0.04,
        t[1],
        RZ + t[2] / 2 + 0.04,
        { grime: 0 },
      );
    }
    b.beam("esb_alu_r", RX + 0.6, 9.2, RZ, RX + 0.6, rb + RH - 0.05, RZ, 0.07, {
      grime: 0,
    });
    b.panel("esb_sheet", RX + 0.34, rb + RH + 0.9, RZ, 4.8, 0.8, Math.PI / 2, {
      rect: SHEET.name,
    });
    b.panel("esb_sheet", RX + 0.3, 2.2, RZ + 3.1, 1.3, 1.3, Math.PI / 2, {
      rect: SHEET.daub,
    }); // the Brutes' claim, daubed on the panel
    // spotlight on the relief: gold fixture on the first beam, visible dusty cone, hot-spot, floor reflection, real light
    const FX = X0 + CW - 0.2,
      FY = H - 1.1;
    b.cyl("esb_gold", FX, FY, RZ, 0.28, 0.2, 0.5, 10, { grime: 0 });
    b.geo("lit_warm", T.sphereLo, {
      x: FX - 0.12,
      y: FY - 0.05,
      z: RZ,
      s: 0.2,
      tint: 0xfff2d8,
    });
    glows.add(FX - 0.25, FY - 0.08, RZ, 0xfff0d0, "l");
    shaft(
      fxb,
      [FX - 0.2, FY - 0.1, RZ],
      [RX + 0.5 - FX, RY + 0.4 - FY, 0],
      Math.hypot(RX + 0.5 - FX, RY + 0.4 - FY) - 0.4,
      0.2,
      3.4,
      0x5a4c38,
    );
    fxb.panel("esb_hot", RX + 1.0, RY + 0.6, RZ, 9.5, 10.5, Math.PI / 2, {
      tint: 0x948468,
    });
    fxb.panel("esb_hot", RX + 1.05, SY, RZ, 3.6, 3.6, Math.PI / 2, {
      tint: 0x7a6044,
    });
    refl.add(RX + 0.6, RZ, 5.5, 0xffe2b8, 5.0, { len: 9, i: 0.55, y: 0.05 });
    refl.add(RX + 0.6, RZ, 8.3, 0xffc860, 1.6, { len: 12, i: 0.45, y: 0.05 });
    spill.add(RX + 3, RZ, 0xffe0b0, 4.2, { y: 0.04, i: 0.3, sx: 3.6, sz: 5.2 });
    fixtures.push([
      RX + 2.2,
      RY + 1,
      RZ,
      0xfff0d8,
      { intensity: 1.6, range: 12, glow: false },
    ]);
    // information desk (half-round, marble with aluminium bands and a gold rail), two deco desk lamps
    const deskX = X0 + 5.2;
    b.cyl(M, deskX, 0, oz, 2.6, 2.6, 1.1, 20, {
      arc0: -Math.PI / 2,
      arc: Math.PI,
      tint: 0x8a5230,
      grime: 0.15,
    });
    for (const y of [0.1, 0.5, 0.9])
      b.cyl("esb_alu", deskX, y, oz, 2.63, 2.63, 0.06, 20, {
        arc0: -Math.PI / 2,
        arc: Math.PI,
        top: false,
        grime: 0,
      });
    b.cyl("esb_gold", deskX, 1.1, oz, 2.72, 2.72, 0.07, 20, {
      arc0: -Math.PI / 2,
      arc: Math.PI,
      grime: 0,
    });
    b.boxMM(M, deskX - 0.3, 0, oz - 2.6, deskX, 1.1, oz + 2.6, {
      tint: 0x8a5230,
      grime: 0.15,
    });
    K.colBox(deskX - 0.3, 0, oz - 2.6, deskX + 2.7, 1.1, oz + 2.6, {
      surface: "wood",
    });
    for (const dz of [-2.0, 2.0]) {
      b.cyl("esb_alu", deskX + 0.9, 1.17, oz + dz, 0.12, 0.08, 0.45, 8, {
        grime: 0,
      });
      b.cyl("lit_warm", deskX + 0.9, 1.6, oz + dz, 0.2, 0.26, 0.24, 8, {
        tint: 0xffe0b0,
      });
      glows.add(deskX + 0.9, 1.72, oz + dz, 0xffd8a0, "m");
    }
    // ---------------- deco lanterns: four tiered aluminium-and-frosted-glass pendants on the axis ----------------
    for (const lxr of [11, 19, 27, 35]) {
      const x = X0 + lxr,
        z = oz;
      b.beam("esb_bronze", x, H, z, x, 9.95, z, 0.05, { grime: 0 });
      b.cyl("esb_alu", x, 9.82, z, 0.62, 0.34, 0.14, 8, {
        grime: 0,
        yaw: Math.PI / 8,
      });
      const tiersL = [
        [9.2, 9.82, 0.56],
        [8.62, 9.2, 0.46],
        [8.16, 8.62, 0.34],
      ];
      for (const tl of tiersL) {
        b.cyl("lit_warm", x, tl[0], z, tl[2], tl[2], tl[1] - tl[0], 8, {
          tint: 0xffe8c4,
          yaw: Math.PI / 8,
        });
        b.cyl(
          "esb_alu",
          x,
          tl[0] - 0.03,
          z,
          tl[2] + 0.04,
          tl[2] + 0.04,
          0.06,
          8,
          { grime: 0, yaw: Math.PI / 8 },
        );
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          b.box(
            "esb_alu",
            x + Math.cos(a) * (tl[2] + 0.02),
            tl[0],
            z - Math.sin(a) * (tl[2] + 0.02),
            0.05,
            tl[1] - tl[0],
            0.05,
            { grime: 0 },
          );
        }
      }
      b.geo("esb_gold", T.cone8, {
        x,
        y: 7.96,
        z,
        rx: Math.PI,
        sx: 0.2,
        sy: 0.4,
        sz: 0.2,
        grime: 0,
      });
      glows.add(x, 9.0, z, 0xffd9a0, "l");
      glows.add(x, 9.5, z, 0xffe8c0, "m");
      glows.add(x, 8.4, z, 0xffe8c0, "m");
      spill.add(x, z, 0xffd090, 5.2, { y: 0.04, i: 0.3 });
      spill.add(x, z, 0xffe0b0, 2.8, { y: H - 0.03, i: 0.3 });
      refl.add(x, z, 9.0, 0xffe0b0, 1.3, { len: 11, i: 0.7, y: 0.05 });
      shaft(fxb, [x, 8.0, z], [0, -1, 0], 7.9, 0.45, 2.3, 0x3a3022);
      fixtures.push([
        x,
        8.7,
        z,
        0xffd9a0,
        { intensity: 1.3, range: 13, glow: false },
      ]);
    }
    // ---------------- entrance vestibule (east): sealed by the interactable door ----------------
    b.panel("glass_broken", X1 - 0.5, 3.75, oz, 5, 7.5, -Math.PI / 2);
    K.colBox(X1 - 0.7, 0, oz - 2.6, X1 + 0.4, H, oz + 2.6, {
      surface: "metal",
    });
    for (const dz of [-2.5, -1.25, 0, 1.25, 2.5])
      b.box("esb_bronze", X1 - 0.56, 0, oz + dz, 0.14, 7.5, 0.14, {
        grime: 0.2,
      });
    for (const y of [0, 2.7, 3.2, 7.35])
      b.box("esb_bronze", X1 - 0.56, y, oz, 0.16, 0.15, 5.1, { grime: 0.2 });
    for (const dz of [-1.25, 1.25]) {
      b.cyl("esb_bronze", X1 - 1.2, 0, oz + dz, 0.62, 0.62, 2.6, 12, {
        arc0: Math.PI / 2,
        arc: Math.PI,
        grime: 0.2,
      });
      b.cyl("esb_bronze", X1 - 1.2, 2.55, oz + dz, 0.66, 0.66, 0.12, 12, {
        arc0: Math.PI / 2,
        arc: Math.PI,
        grime: 0.1,
      });
    }
    K.colBox(X1 - 1.9, 0, oz - 2, X1 - 0.6, 2.6, oz + 2, { surface: "metal" });
    b.panel("lit_warm", X1 - 0.52, 5.2, oz, 4.6, 3.6, -Math.PI / 2, {
      tint: 0x7a7058,
    }); // grimy daylight in the transom
    for (let k = 1; k < 8; k++)
      b.box(
        "esb_bronze",
        X1 - 0.55,
        3.4,
        oz - 2.3 + k * 0.575,
        0.06,
        3.6,
        0.05,
        { grime: 0.1 },
      );
    glows.add(X1 - 1.4, 5.0, oz, 0xfff0d0, "l");
    b.panel("atlas_paint", X1 - 0.45, 9.1, oz, 6, 0.75, -Math.PI / 2, {
      rect: K.paint("esb_sign", 1024, 128),
    });
    // dusty daylight shafts from the transom, slanting down the hall
    for (const dz of [-1.5, 0, 1.5])
      shaft(
        fxb,
        [X1 - 0.7, 5.6, oz + dz],
        [-1, -0.34, dz * 0.02],
        15,
        0.7,
        1.6,
        0x2e2a22,
      );
    spill.add(X1 - 13, oz, 0xfff0d0, 3.2, { y: 0.04, i: 0.22, sx: 4.5, sz: 3 });
    refl.add(X1 - 0.8, oz, 5.2, 0xfff0d8, 3.6, { len: 12, i: 0.4, y: 0.05 });
    // ---------------- elevator bays (north & south) ----------------
    const bay = (zWall, dir) => {
      const zb = zWall + dir * 7;
      b.boxMM(
        M,
        X0 + 6,
        0,
        Math.min(zWall, zb) - 0.3,
        X0 + 6.6,
        7.5,
        Math.max(zWall, zb) + 0.3,
        { grime: 0.2 },
      );
      b.boxMM(
        M,
        X1 - 6.6,
        0,
        Math.min(zWall, zb) - 0.3,
        X1 - 6,
        7.5,
        Math.max(zWall, zb) + 0.3,
        { grime: 0.2 },
      );
      K.colBox(
        X0 + 6,
        0,
        Math.min(zWall, zb),
        X0 + 6.6,
        7.5,
        Math.max(zWall, zb),
      );
      K.colBox(
        X1 - 6.6,
        0,
        Math.min(zWall, zb),
        X1 - 6,
        7.5,
        Math.max(zWall, zb),
      );
      b.wall(M, X0 + 6, zb, X1 - 6, zb, 0, 7.5, 0.6, [], {});
      b.boxMM(
        "esb_ceiling",
        X0 + 6,
        7.5,
        Math.min(zWall, zb),
        X1 - 6,
        7.8,
        Math.max(zWall, zb),
        { faces: "b", uv: "rect", rect: [0.3, 0.3, 0.7, 0.45] },
      );
      b.boxMM(
        "esb_floor",
        X0 + 6,
        0.02,
        Math.min(zWall, zb),
        X1 - 6,
        0.04,
        Math.max(zWall, zb),
        { faces: "t", grime: 0.25 },
      );
      const zf = zb - dir * 0.32,
        face = dir > 0 ? Math.PI : 0;
      for (let x = X0 + 9; x < X1 - 8; x += 4.5) {
        b.panel("esb_sheet", x, 1.65, zf, 1.9, 3.3, face, {
          rect: [
            SHEET.door[0],
            SHEET.door[1],
            SHEET.door[2],
            SHEET.door[1] + (SHEET.door[3] - SHEET.door[1]) * 0.75,
          ],
        });
        b.panel("esb_sheet", x, 3.75, zf, 1.4, 0.7, face, {
          rect: [
            SHEET.door[0],
            SHEET.door[1] + (SHEET.door[3] - SHEET.door[1]) * 0.75,
            SHEET.door[2],
            SHEET.door[3],
          ],
        });
        for (const dx2 of [-1.08, 1.08])
          b.box("esb_alu", x + dx2, 0, zf - dir * 0.06, 0.22, 3.45, 0.14, {
            grime: 0.05,
          });
        b.box("esb_alu", x, 3.3, zf - dir * 0.06, 2.4, 0.16, 0.14, {
          grime: 0.05,
        });
        glows.add(x, 4.2, zb - dir * 0.5, 0xffc070, "s");
      }
      for (let x = X0 + 11; x < X1 - 8; x += 9) {
        b.panel("lit_warm", x, 5.5, zb - dir * 0.34, 0.6, 1.0, face);
        glows.add(x, 5.5, zb - dir * 0.7, 0xffc880, "m");
        fxb.panel("esb_wash", x, 6.6, zb - dir * 0.33, 1.4, 1.8, face, {
          tint: 0x6a5230,
        });
      }
    };
    bay(Z0, -1);
    bay(Z1, 1);
    // ---------------- Brute squat (kept off the axis so the relief reads down the hall) ----------------
    for (const gx of [-12, -6, 2, 9, 15])
      P.meatBag(b, ox + gx, H, oz + (gx % 2 ? 4.6 : -4.6), { len: 3.2 });
    P.cage(b, ox - 10, oz + 4.2, 2, 2.5, {});
    P.cage(b, ox - 13, oz + 4.2, 2, 2.5, {});
    for (const m of [
      [-2, -4.5, 0.2],
      [0, -4.2, 1.4],
      [5, 4.5, 0.4],
      [-15, -4.8, 1.2],
    ])
      P.mattress(b, ox + m[0], 0.02, oz + m[1], m[2]);
    P.barrel(b, ox + 3, 0, oz + 3.2, "fire", { glows, collide: true });
    spill.add(ox + 3, oz + 3.2, 0xff7a28, 3.2, { y: 0.04, i: 0.45 });
    refl.add(ox + 3, oz + 3.2, 1.4, 0xff8a30, 1.2, { len: 4, i: 0.6, y: 0.05 });
    P.scrapWall(b, X1 - 5, Z0 + 1, X1 - 5, oz - 3, 2.4, { seed: 51 });
    P.scrapWall(b, X1 - 5, oz + 3, X1 - 5, Z1 - 1, 2.4, { seed: 52 });
    P.rubblePile(b, ox + 8, oz - 4, 1.8, 1.1, { seed: 53 });
    for (let k = 0; k < 6; k++)
      P.skeleton(b, ox - 16 + k * 2.2, 0.03, oz - 5 + (k % 2) * 9.5, k * 1.3);
    P.crate(b, ox - 18, 0, oz - 5, 1.0, 0.2);
    P.crate(b, ox - 18, 1.0, oz - 5, 0.8, 0.5);
    P.crate(b, ox - 16.6, 0, oz - 5.4, 0.9, 0.9);
    b.burn(ox + 3, 0.5, oz + 3.2, 4, 0.45);
    b.finish(rec.root, { cast: false });
    fxb.finish(rec.root, { cast: false, receive: false });
    glows.finish(rec.root, { interior: true, nightOpacity: 0.9 });
    spill.finish(rec.root, { interior: true, night: 1 });
    refl.finish(rec.root, { interior: true, night: 1, wet: 0 });
    // dust motes drifting through the light (one Points draw call, only animated while you're in here)
    {
      const N = 220,
        pos = new Float32Array(N * 3),
        seed = [],
        rr = K.rng(1937);
      for (let i = 0; i < N; i++) {
        seed.push([
          X0 + 2 + rr() * 40,
          0.5 + rr() * 9.5,
          oz + (rr() - 0.5) * 11,
          rr() * 6.28,
        ]);
        pos[i * 3] = seed[i][0];
        pos[i * 3 + 1] = seed[i][1];
        pos[i * 3 + 2] = seed[i][2];
      }
      const g2 = new THREE.BufferGeometry();
      g2.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const pm = new THREE.PointsMaterial({
        size: 0.05,
        map: K.glowTex(),
        color: 0xffe6b8,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.55,
        sizeAttenuation: true,
      });
      const motes = new THREE.Points(g2, pm);
      motes.name = "lma_esb_dust";
      motes.frustumCulled = false;
      rec.root.add(motes);
      K.animate((dt, t) => {
        const cam = G.camera;
        if (!cam || cam.position.x < G.LAYOUT.INTERIOR_X_MIN) {
          motes.visible = false;
          return;
        }
        motes.visible = true;
        for (let i = 0; i < N; i++) {
          const s0 = seed[i];
          pos[i * 3] = s0[0] + Math.sin(t * 0.13 + s0[3]) * 0.8;
          pos[i * 3 + 1] = 0.5 + ((s0[1] - t * 0.05 + 20) % 9.5);
          pos[i * 3 + 2] = s0[2] + Math.cos(t * 0.11 + s0[3] * 1.7) * 0.8;
        }
        g2.attributes.position.needsUpdate = true;
      });
    }
    // real (borrowed) pools of light for the nearest lanterns / the relief spot (atmosphere's fixture pool)
    try {
      if (!G.isStub("atmos") && G.atmos && G.atmos.addFixtureLight)
        for (const f of fixtures)
          G.atmos.addFixtureLight(
            new THREE.Vector3(f[0], f[1], f[2]),
            f[3],
            f[4],
          );
    } catch (e) {
      G.reportError("landmarks_a:esb_fixtures", e);
    }

    // --- doors ---
    const deckT = rec.anchors.deck_elevator;
    // (the exit sits on the face of the revolving drums: the drum collider X1-1.9…X1-0.6 hid a door placed behind it
    //  from the interaction line-of-sight test, so the lobby could not be left — round 2 door audit)
    G.world.addDoor({
      pos: new THREE.Vector3(X1 - 2.0, 1.6, oz),
      radius: 1.4,
      label: "Fifth Avenue",
      verb: "Exit to",
      target: { x: 112.4, y: 0, z: -72.5, yaw: -Math.PI / 2 },
      sound: "door_open",
    });
    // outside → lobby
    G.world.addDoor({
      pos: new THREE.Vector3(110.9, 1.6, -72.5),
      label: "Empire State Building — Lobby",
      verb: "Enter",
      target: { x: X1 - 3.4, y: 0, z: oz, yaw: Math.PI / 2 },
      sound: "door_open",
    });
    // express elevator (south bay, first door) ↔ observation deck
    const elevX = X0 + 9,
      elevZ = Z1 + 7 - 0.9;
    G.world.addDoor({
      pos: new THREE.Vector3(elevX, 1.6, elevZ),
      label: "Express Elevator — 86th Floor Observatory",
      verb: "Ride",
      target: { x: deckT.x + 1.2, y: DECK_Y, z: deckT.z, yaw: -Math.PI / 2 },
      sound: "door_open",
    });
    G.world.addDoor({
      pos: new THREE.Vector3(86.4, DECK_Y + 1.6, -72.5),
      label: "Elevator — Lobby",
      verb: "Ride",
      target: { x: elevX, y: 0, z: elevZ - 1.4, yaw: 0 },
      sound: "door_open",
    });
    const ir = K.paint("observatory_sign", 512, 96);
    const s2 = K.builder("esb_lobby_sign", { grime: 0 });
    s2.panel("atlas_paint", elevX, 4.3, elevZ + 0.52, 2.4, 0.45, Math.PI, {
      rect: ir,
    });
    s2.finish(rec.root, { cast: false });

    rec.anchor("lobby_entrance", X1 - 3.4, 0, oz, Math.PI / 2);
    rec.anchor("lobby_boss", X0 + 9, 0, oz, -Math.PI / 2);
    rec.anchor("lobby_spawn1", ox - 4, 0, oz - 3, 0);
    rec.anchor("lobby_spawn2", ox + 6, 0, oz + 3, 0);
    rec.anchor("lobby_spawn3", ox - 12, 0, oz, 0);
    rec.anchor("terminal", deskX + 1.0, 1.1, oz + 0.5, -Math.PI / 2);
    rec.anchor("lobby_loot", X0 + 2, 0, oz - 5, 0);
    rec.anchor("elevator", elevX, 0, elevZ - 1.4, 0);
  }

