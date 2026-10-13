// play-inline-142 04 — the
// Lines 450-961 of readable/play-inline-142.pretty.js (statement-aligned).
  LB.metParkSide = function (b, root, P) {
    const K = LB.kit;
    const { XB, XW, Z0, Z1, PZ0, PZ1, FY, t0, wingH, DX1, anchors } = P;
    const ZM = (PZ0 + PZ1) / 2;
    let tWmin = t0;
    for (let z = Z0; z <= Z1; z += 7)
      for (const x of [51, 54, 57]) tWmin = Math.min(tWmin, LB.terrain(x, z));
    const yLow = tWmin - 1.2;
    const XG = 55.6; // west face of the glass wings' podium (site edge x 55)

    // ---- podium extension under the north glass wing & the centre pavilion (rusticated, walkable ledge at FY) ----
    b.boxMM("met_ashlar", XG, yLow, Z0, XB, FY, PZ1, {
      grime: 0.75,
      segLen: 3,
      aoH: 2.5,
    });
    LB.colMM(XG, yLow, Z0, XB, FY, PZ1);
    for (let y = yLow + 1.95; y < FY - 0.2; y += 0.75)
      b.boxMM("concrete_dark", XG - 0.02, y - 0.04, Z0, XG, y + 0.04, PZ1, {
        seg: false,
        grime: 0.2,
      });
    b.boxMM("limestone", XG - 0.25, FY - 0.3, Z0, XG + 0.2, FY, PZ1, {
      seg: false,
      grime: 0.5,
    });

    // =================================================================
    // NORTH GLASS WING (1966 project, unfinished) — raking glass wall + the Temple of Dendur hall
    // =================================================================
    const SZ0 = Z0 + 1.2,
      SZ1 = PZ0 - 1.2; // glass between the stone end walls
    const GX0 = 56.0,
      GX1 = 61.4,
      GH = 15.4; // foot / head of the raking glass
    const RY = FY + GH; // hall roof (underside)
    // stone end walls (pier + wall back to the wing) with a coped top following the rake
    for (const [za, zb] of [
      [Z0, SZ0],
      [SZ1, PZ0],
    ]) {
      b.boxMM("met_ashlar", XG, FY, za, DX1, FY + wingH, zb, {
        grime: 0.55,
        segLen: 4,
      });
      LB.colMM(XG, FY, za, DX1, FY + wingH, zb, { walkable: false });
      b.boxMM(
        "limestone",
        XG - 0.3,
        FY + wingH - 0.7,
        za - 0.2,
        DX1,
        FY + wingH,
        zb + 0.2,
        { seg: false, grime: 0.4 },
      );
      b.boxMM(
        "limestone",
        XG - 0.2,
        FY,
        za - 0.1,
        XG + 0.6,
        FY + 1.2,
        zb + 0.1,
        { seg: false, grime: 0.7 },
      );
    }
    // hall roof slab + fascia over the glass head; roof edge steel
    b.boxMM("met_ashlar", GX1 - 0.3, RY, SZ0, DX1, FY + wingH - 0.2, SZ1, {
      grime: 0.45,
    });
    b.boxMM("limestone", GX1 - 0.9, RY - 0.2, SZ0, GX1 + 0.6, RY + 0.8, SZ1, {
      seg: false,
      grime: 0.5,
    });
    LB.colMM(GX1 - 0.3, RY, SZ0, DX1, FY + wingH, SZ1, { walkable: false });
    // the raking curtain wall: 14 × 8 panes, a blown-in breach low down near the south end
    const NU = 14,
      NV = 8,
      cw = (SZ1 - SZ0) / NU;
    const BR = { u0: 9, u1: 11 };
    const hole = (iu, iv) =>
      (iu >= BR.u0 &&
        iu <= BR.u1 &&
        iv <= (iu === 10 ? 3 : iu === 9 ? 1 : 2)) ||
      (iu === 8 && iv === 0);
    glazing(
      b,
      V(GX0, FY + 0.35, SZ0),
      V(GX0, FY + 0.35, SZ1),
      V(GX1, RY, SZ0),
      V(GX1, RY, SZ1),
      V(-1, 0.35, 0),
      {
        nu: NU,
        nv: NV,
        hole,
        broken: 0.22,
        missing: 0.1,
        mullion: 0.13,
        seed: 41,
      },
    );
    // granite curb at the glass foot (broken through at the breach)
    const zBr0 = SZ0 + BR.u0 * cw,
      zBr1 = SZ0 + (BR.u1 + 1) * cw;
    for (const [za, zb] of [
      [SZ0, zBr0 - cw],
      [zBr1, SZ1],
    ]) {
      b.boxMM("granite", GX0 - 0.35, FY - 0.05, za, GX0 + 0.35, FY + 0.4, zb, {
        seg: false,
        grime: 0.6,
      });
      LB.colMM(GX0 - 0.5, FY - 0.5, za, GX0 + 0.5, FY + 4.5, zb, {
        walkable: false,
      });
    }
    // snapped, bent mullions hanging into the breach
    {
      const rb = LB.rng("met_breach");
      for (let k = 0; k < 7; k++) {
        const z = zBr0 + rb() * (zBr1 - zBr0),
          v = 0.3 + rb() * 0.35,
          y = FY + 0.35 + GH * v,
          x = GX0 + (GX1 - GX0) * v;
        b.beam(
          "iron",
          V(x, y, z),
          V(x - 0.4 - rb() * 1.1, y - 1.2 - rb() * 1.8, z + (rb() - 0.5) * 1.6),
          0.12,
          0.2,
          { grime: 0.3 },
        );
      }
    }
    // rubble spill out of the breach: walkable heap from the lawn up to the hall floor
    const zBm = (zBr0 + zBr1) / 2,
      tB = LB.terrain(51, zBm);
    anchors.breach = LB.anchor(50.5, tB, zBm, -Math.PI / 2);
    if (FY - tB > 0.25)
      LB.stairs(
        b,
        "rubble",
        50.4,
        zBm,
        Math.PI / 2,
        5.2,
        GX0 - 50.4 - 0.1,
        tB,
        FY,
        { base: tB - 0.4, grime: 0.9, noCollide: false },
      );
    {
      const rr = LB.rng("met_spill");
      for (let k = 0; k < 16; k++) {
        const x = 49 + rr() * 9.5,
          z = zBm + (rr() - 0.5) * 8.5,
          s = 0.3 + rr() * 0.7;
        const y =
          x > GX0
            ? FY
            : tB + (FY - tB) * Math.max(0, (x - 50.4) / (GX0 - 50.4));
        if (rr() < 0.45)
          b.box(
            rr() < 0.5 ? "met_ashlar" : "limestone",
            x,
            y - 0.15,
            z,
            s * 2.2,
            s * 0.6,
            s * 1.4,
            {
              ry: rr() * TAU,
              rz: (rr() - 0.5) * 0.5,
              rx: (rr() - 0.5) * 0.3,
              seg: false,
              grime: 0.8,
            },
          );
        else b.rock("rubble", x, y - 0.1, z, s, { flat: 0.55, seed: 300 + k });
      }
      // big broken masonry heaped along both flanks of the spill so it reads as a debris cone, not a stair
      for (let k = 0; k < 12; k++) {
        const x = 50.2 + (k % 6) * 1.0 + rr() * 0.5,
          side = k < 6 ? -1 : 1,
          z = zBm + side * (2.3 + rr() * 1.0);
        const y =
          tB + (FY - tB) * Math.max(0, Math.min(1, (x - 50.4) / (GX0 - 50.4)));
        b.rock("rubble", x, y - 0.35, z, 0.75 + rr() * 0.55, {
          flat: 0.55,
          seed: 500 + k,
          grime: 0.6,
        });
      }
      for (let k = 0; k < 6; k++)
        b.rock(
          "rubble",
          50.9 + k * 0.85,
          tB + ((FY - tB) * (k + 0.5)) / 6.5 - 0.1,
          zBm + (rr() - 0.5) * 3.4,
          0.35 + rr() * 0.3,
          { flat: 0.5, seed: 520 + k, grime: 0.6 },
        );
      // glass shards glittering on the lawn and the hall floor
      for (let k = 0; k < 40; k++) {
        const x = 50 + rr() * 12,
          z = zBm + (rr() - 0.5) * 11,
          y = x > GX0 ? FY + 0.05 : LB.terrain(x, z) + 0.04;
        b.quad("glass_dark", x, y, z, 0.2 + rr() * 0.5, 0.15 + rr() * 0.4, {
          rx: -Math.PI / 2,
          rz: rr() * TAU,
          noAO: true,
          grime: 0,
        });
      }
      // a fallen glazing panel lying on the grass (mullion frame + a few panes)
      glazing(
        b,
        V(47.2, tB + 0.12, zBm - 4.5),
        V(47.2, tB + 0.12, zBm - 0.3),
        V(50.3, tB + 0.35, zBm - 4.5),
        V(50.3, tB + 0.35, zBm - 0.3),
        V(0, 1, 0),
        { nu: 2, nv: 2, broken: 0.5, missing: 0.4, mullion: 0.12, seed: 9 },
      );
      LB.skeleton(b, 52.2, LB.terrain(52.2, zBm + 3.6) + 0.06, zBm + 3.6, 2.1);
    }

    // ---- the Temple of Dendur hall behind the glass (walk-in, baked light, temple, reflecting pool, looters' camp,
    //      hall anchors & props): 55_met_park_interior.js
    LB.interiorPart("met", "dendur", {
      root,
      anchors,
      FY,
      GX0,
      GX1,
      SZ0,
      SZ1,
      RY,
      DX1,
      zBr0,
      zBm,
    });

    // =================================================================
    // CENTRE PAVILION (unfinished in 1967) — low stone pavilion under a glass pyramid, with the
    // 1880 red-brick Victorian-Gothic façade exposed behind it
    // =================================================================
    const LX0 = 56.0,
      LX1 = 68.0,
      LZ0 = PZ0 + 0.5,
      LZ1 = PZ1 - 0.5,
      LH = 8.0;
    b.boxMM("met_ashlar", LX0, FY, LZ0, LX1, FY + LH, LZ1, {
      grime: 0.55,
      segLen: 3,
    });
    LB.colMM(LX0, FY, LZ0, LX1, FY + LH, LZ1, { walkable: false });
    // plinth, slit windows, a deep cornice band
    b.boxMM(
      "limestone",
      LX0 - 0.3,
      FY,
      LZ0 - 0.3,
      LX0 + 0.2,
      FY + 0.9,
      LZ1 + 0.3,
      { seg: false, grime: 0.7 },
    );
    for (let z = LZ0 + 2.2; z < LZ1 - 1.5; z += 3.1) {
      b.quad(
        Math.abs(z - ZM) < 1.6 ? "glass_broken" : "glass_dark",
        LX0 - 0.02,
        FY + 4.0,
        z,
        0.7,
        4.8,
        { ry: -Math.PI / 2, uv: "box", noAO: true },
      );
      b.box("limestone", LX0 - 0.1, FY + 1.5, z, 0.2, 0.2, 1.2, { seg: false });
    }
    b.boxMM(
      "limestone",
      LX0 - 0.5,
      FY + LH - 0.9,
      LZ0 - 0.5,
      LX1,
      FY + LH,
      LZ1 + 0.5,
      { seg: false, grime: 0.45 },
    );
    glassHip(b, LX0 + 0.5, LX1 - 0.3, LZ0 + 0.5, LZ1 - 0.5, FY + LH, 6.2, {
      seed: 57,
      broken: 0.24,
      missing: 0.05,
      pane: 1.9,
    });
    // the old museum: brick block with polychrome granite bands, lancets, a rose-window gable and pinnacles
    const BX = 68.0,
      BH = 21;
    b.boxMM("brick", BX, FY, PZ0, 80, FY + BH, PZ1, { grime: 0.55, segLen: 4 });
    LB.colMM(BX, FY, PZ0, 80, FY + BH, PZ1, { walkable: false });
    for (const y of [FY + LH + 1.2, FY + LH + 7.8, FY + BH - 1.1])
      b.boxMM("granite", BX - 0.18, y, PZ0, BX, y + 0.45, PZ1, {
        seg: false,
        grime: 0.4,
      });
    for (let i = 0; i < 7; i++) {
      const z = ZM + (i - 3) * 4.2,
        y = FY + LH + 2.2,
        w = 1.5,
        h = 4.9;
      K.lancet(
        b,
        i === 3 ? "glass_broken" : i % 3 === 1 ? "glass_broken" : "glass_dark",
        "granite",
        BX - 0.03,
        y,
        z,
        w,
        h,
        -Math.PI / 2,
      );
      // pointed hood moulding in granite + a sill
      const spring = h - w * 0.8;
      for (const sg of [-1, 1])
        b.beam(
          "granite",
          V(BX - 0.1, y + spring, z + sg * (w / 2 + 0.2)),
          V(BX - 0.1, y + h + 0.3, z),
          0.24,
          0.2,
          { grime: 0.3 },
        );
      b.box("granite", BX - 0.15, y - 0.2, z, 0.3, 0.2, w + 0.5, {
        seg: false,
      });
    }
    // gable with the rose window
    K.pediment(b, "brick", BX + 0.5, FY + BH, ZM, 15, 5.2, 1.0, Math.PI / 2, {
      corniceKey: "granite",
    });
    b.add("glass_dark", new THREE.CircleGeometry(1.5, 20), {
      m: LB.m4(BX - 0.02, FY + BH + 2.1, ZM, -Math.PI / 2),
      uv: "box",
      noAO: true,
    });
    b.add("granite", new THREE.RingGeometry(1.5, 1.95, 24, 1), {
      m: LB.m4(BX - 0.04, FY + BH + 2.1, ZM, -Math.PI / 2),
      grime: 0.3,
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      b.beam(
        "granite",
        V(BX - 0.05, FY + BH + 2.1, ZM),
        V(BX - 0.05, FY + BH + 2.1 + Math.cos(a) * 1.5, ZM + Math.sin(a) * 1.5),
        0.1,
        0.08,
      );
    }
    for (const z of [PZ0 + 0.8, PZ1 - 0.8])
      K.pinnacle(b, "granite", BX + 0.4, FY + BH, z, 1.0, 4.6, {});

    // =================================================================
    // SOUTH WING — classical park elevation + north-light sawtooth roof
    // =================================================================
    facade(b, [XB, PZ1], [0, 1], [-1, 0], Z1 - PZ1, FY, wingH, yLow, {
      seed: 11,
    });
    facade(
      b,
      [XB, Z1],
      [1, 0],
      [0, 1],
      XW - XB - 0.6,
      FY,
      wingH,
      Math.min(yLow, t0 - 1),
      { seed: 12, balustrade: true },
    );
    // north end elevation of the north wing (Dendur hall wall + the wing behind it)
    facade(
      b,
      [XW - 0.6, Z0],
      [-1, 0],
      [0, -1],
      XW - 0.6 - XG,
      FY,
      wingH,
      Math.min(yLow, t0 - 1),
      { seed: 13 },
    );
    // sawtooth skylights: vertical north-facing glazing + copper-clad slopes
    const RT = FY + wingH;
    for (let z = PZ1 + 2.2; z < Z1 - 3.4; z += 3.6) {
      glazing(
        b,
        V(61, RT, z),
        V(96, RT, z),
        V(61, RT + 1.7, z),
        V(96, RT + 1.7, z),
        V(0, 0, -1),
        {
          nu: 18,
          nv: 1,
          broken: 0.28,
          missing: 0.08,
          mullion: 0.08,
          seed: Math.round(z),
        },
      );
      const g = new THREE.BufferGeometry();
      const A = [61, RT + 1.7, z],
        Bq = [96, RT + 1.7, z],
        Cq = [96, RT, z + 3.4],
        Dq = [61, RT, z + 3.4];
      g.setAttribute(
        "position",
        new THREE.BufferAttribute(
          new Float32Array([...A, ...Cq, ...Bq, ...A, ...Dq, ...Cq]),
          3,
        ),
      );
      g.computeVertexNormals();
      b.add("copper_roof", g, { grime: 0.5 });
      for (const x of [61, 96]) {
        const tg = new THREE.BufferGeometry();
        tg.setAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array([x, RT, z, x, RT + 1.7, z, x, RT, z + 3.4]),
            3,
          ),
        );
        tg.computeVertexNormals();
        b.add("copper_roof", tg, { grime: 0.5 });
        const tg2 = new THREE.BufferGeometry();
        tg2.setAttribute(
          "position",
          new THREE.BufferAttribute(
            new Float32Array([x, RT, z, x, RT, z + 3.4, x, RT + 1.7, z]),
            3,
          ),
        );
        tg2.computeVertexNormals();
        b.add("copper_roof", tg2, { grime: 0.5 });
      }
    }
    // north wing: glazed lantern skylight over the galleries
    {
      const x0 = 80,
        x1 = 95,
        z0 = Z0 + 5,
        z1 = PZ0 - 5,
        h = 1.6;
      b.boxMM(
        "met_ashlar",
        x0 - 0.4,
        RT,
        z0 - 0.4,
        x1 + 0.4,
        RT + 0.5,
        z1 + 0.4,
        { seg: false, grime: 0.5 },
      );
      const yb = RT + 0.5;
      glazing(
        b,
        V(x0, yb, z0),
        V(x0, yb, z1),
        V(x0, yb + h, z0),
        V(x0, yb + h, z1),
        V(-1, 0, 0),
        { nu: 12, nv: 1, broken: 0.25, mullion: 0.07, seed: 61 },
      );
      glazing(
        b,
        V(x1, yb, z1),
        V(x1, yb, z0),
        V(x1, yb + h, z1),
        V(x1, yb + h, z0),
        V(1, 0, 0),
        { nu: 12, nv: 1, broken: 0.25, mullion: 0.07, seed: 62 },
      );
      glazing(
        b,
        V(x1, yb, z0),
        V(x0, yb, z0),
        V(x1, yb + h, z0),
        V(x0, yb + h, z0),
        V(0, 0, -1),
        { nu: 8, nv: 1, broken: 0.25, mullion: 0.07, seed: 63 },
      );
      glazing(
        b,
        V(x0, yb, z1),
        V(x1, yb, z1),
        V(x0, yb + h, z1),
        V(x1, yb + h, z1),
        V(0, 0, 1),
        { nu: 8, nv: 1, broken: 0.25, mullion: 0.07, seed: 64 },
      );
      glassHip(b, x0, x1, z0, z1, yb + h, 3.2, {
        seed: 65,
        broken: 0.3,
        missing: 0.04,
        pane: 1.9,
      });
    }
  };
