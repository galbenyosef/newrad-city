// play-inline-177 03 — the
// Lines 367-717 of readable/play-inline-177.pretty.js (statement-aligned).
  function buildExterior(rec) {
    const s = K.site("msg");
    const b = K.builder("msg_ext", { grime: 0.6 });
    const glows = K.glowSet("msg_ext");
    const X0 = s.x0,
      X1 = s.x1,
      Z0 = s.z0,
      Z1 = s.z1; // -190..-130, -314..-281
    const cz = (Z0 + Z1) / 2,
      FX = X1; // front on Eighth Avenue (east)
    // main block
    K.block(b, "msg_brick", X0, Z0, X1 - 0.6, Z1, 7, 21, {
      roof: "concrete_dark",
      col: false,
    });
    K.block(b, "wa_stone", X0, Z0, X1 - 0.6, Z1, 0, 7, {
      roof: false,
      col: false,
    });
    K.colBox(X0, 0, Z0, X1, 22, Z1, { surface: "concrete" });
    K.band(b, "limestone", X0, Z0, X1 - 0.6, Z1, 6.8, 0.5, 0.3);
    K.band(b, "limestone", X0, Z0, X1 - 0.6, Z1, 20.3, 1.2, 0.5);
    b.box(
      "limestone",
      (X0 + X1) / 2,
      21.5,
      cz,
      X1 - X0 + 0.6,
      1.4,
      Z1 - Z0 + 0.6,
      { faces: "nsewt", tint: 0xcfc4ac },
    );
    // giant pilasters across the Eighth Avenue front — on the window grid's bay boundaries — and real 3D
    // window surrounds (stone sills + lintels, hooded base windows) on every face
    K.reveals(b, "msg_brick", X0, Z0, X1 - 0.6, Z1, 7, 21, {
      tint: 0xc8bca0,
      proj: 0.12,
      maxY: 20.2,
      piers: {
        mat: "limestone",
        tint: 0xd6ccb4,
        w: 1.0,
        d: 0.5,
        y0: 7,
        y1: 20.3,
        skip: (x, z, f) => f !== "e",
      },
    });
    K.reveals(b, "wa_stone", X0, Z0, X1 - 0.6, Z1, 0, 7, {
      faces: "nsw",
      tint: 0xd8d0bc,
      proj: 0.16,
      hood: "cornice",
    });
    // name carved into the attic
    const nr = K.paint("msg_name", 1400, 160);
    b.panel("atlas_paint", FX + 0.35, 21.9, cz, 24, 1.1, HP, {
      rect: nr,
      grime: 0.3,
    });
    // arena barrel roof
    const RX0 = X0 + 4,
      RX1 = X1 - 8;
    for (let i = 0; i < 12; i++) {
      const a0 = (PI * i) / 12,
        a1 = (PI * (i + 1)) / 12,
        R = (Z1 - Z0 - 6) / 2;
      const p0 = [cz + Math.cos(a0) * R, 22.6 + Math.sin(a0) * R * 0.35],
        p1 = [cz + Math.cos(a1) * R, 22.6 + Math.sin(a1) * R * 0.35];
      b.quad(
        "corrugated",
        [RX0, p0[1], p0[0]],
        [RX1, p0[1], p0[0]],
        [RX1, p1[1], p1[0]],
        [RX0, p1[1], p1[0]],
        {
          tint: i % 5 === 2 ? 0x6a4a36 : 0x5e5a52,
          grime: 0.6,
          rect: [0, 0, (RX1 - RX0) / 2, 2],
        },
      );
    }
    b.box(
      "brick_brown",
      (RX0 + RX1) / 2,
      22.6,
      cz,
      RX1 - RX0,
      0.4,
      Z1 - Z0 - 6,
      { faces: "nsew" },
    );
    // round 2: the roof read as a flat brown slab from the air — add the exposed bowstring ribs every 6 m,
    // the glazed crown monitor (clerestory skylight strip, mostly smashed) and rust-streaked gable ends
    {
      const R = (Z1 - Z0 - 6) / 2,
        RISE = 0.35;
      const arcY = (a) => 22.6 + Math.sin(a) * R * RISE + 0.12,
        arcZ = (a) => cz + Math.cos(a) * R;
      for (let x = RX0 + 3; x < RX1 - 1; x += 6)
        for (let i = 0; i < 12; i++) {
          const a0 = (PI * i) / 12,
            a1 = (PI * (i + 1)) / 12;
          b.beam("rust", x, arcY(a0), arcZ(a0), x, arcY(a1), arcZ(a1), 0.26, {
            tint: 0x5a4030,
          });
        }
      const CYr = 22.6 + R * RISE; // crown
      b.box(
        "black_metal",
        (RX0 + RX1) / 2,
        CYr - 0.1,
        cz,
        RX1 - RX0 - 4,
        1.3,
        3.4,
        { faces: "nsew", tint: 0x2a2826 },
      );
      for (const sg of [-1, 1])
        b.box(
          sg < 0 ? "glass_broken" : "glass",
          (RX0 + RX1) / 2,
          CYr + 0.1,
          cz + sg * 1.72,
          RX1 - RX0 - 4.4,
          0.9,
          0.02,
          { grime: 0.6, faces: sg < 0 ? "n" : "s" },
        );
      b.box(
        "corrugated",
        (RX0 + RX1) / 2,
        CYr + 1.2,
        cz,
        RX1 - RX0 - 3.6,
        0.08,
        4.2,
        { faces: "tb", tint: 0x5e5a52 },
      );
      for (let x = RX0 + 3; x < RX1 - 2; x += 3)
        b.box("black_metal", x, CYr + 0.1, cz, 0.1, 1.1, 3.5, {
          tint: 0x2a2826,
        });
      // gable ends (west and east edge of the barrel): brick lunette infill so the arch doesn't show sky through it
      for (const gx of [RX0, RX1]) {
        const pts = [];
        for (let i = 0; i <= 12; i++) {
          const a = (PI * i) / 12;
          pts.push([arcZ(a), arcY(a) - 0.12]);
        }
        for (let i = 0; i < 12; i++)
          b.quad(
            "brick_brown",
            [gx, 22.6, pts[i][0]],
            [gx, 22.6, pts[i + 1][0]],
            [gx, pts[i + 1][1], pts[i + 1][0]],
            [gx, pts[i][1], pts[i][0]],
            { tint: 0x7a5040, double: true },
          );
      }
    }
    // flat roof strip behind the Eighth Avenue parapet: water tank, HVAC, vents (visible over the marquee)
    K.roofKit(b, X1 - 8, Z0 + 1.5, X1 - 0.8, Z1 - 1.5, 22.92, "msg_roof", {
      bulkhead: false,
      n: 2,
    });
    // collapsed hole in the roof (dark gap + twisted trusses)
    b.box("black", RX0 + 12, 27.5, cz - 2, 6, 0.05, 5, {
      faces: "t",
      grime: 0,
    });
    for (let k = 0; k < 4; k++)
      b.beam(
        "rust",
        RX0 + 9 + k * 2,
        28.2,
        cz - 4,
        RX0 + 10 + k * 2,
        25,
        cz + 1,
        0.2,
      );
    // round 2: cast-iron fire escapes on the 49th / 50th Street faces (landings just under the window sills;
    // the brick façade's window grid is 3.4 m bays × 3.6 m floors, so escapes span two bays on bay boundaries)
    for (const u of [5, 12])
      F.fireEscape(
        b,
        X0 + 3.4 * u,
        Z1 + 0.15,
        0,
        1,
        6.4,
        [7.8, 11.4, 15.0, 18.6],
      );
    for (const u of [4, 11])
      F.fireEscape(
        b,
        X1 - 0.6 - 3.4 * u,
        Z0 - 0.15,
        0,
        -1,
        6.4,
        [7.8, 11.4, 15.0, 18.6],
      );
    // ---- the MARQUEE ----
    const MZ0 = Z0 + 3,
      MZ1 = Z1 - 3,
      MW = MZ1 - MZ0,
      MY = 4.3,
      MH = 2.4;
    b.box("black_metal", FX + 1.6, MY, cz, 3.2, MH, MW, { tint: 0x2a2620 });
    const mt = K.litPaint("msg_marquee_top", 1536, 160),
      mb = K.litPaint("msg_marquee", 1536, 256),
      ms = K.litPaint("msg_marquee_side", 512, 256);
    b.panel("atlas_lit", FX + 3.22, MY + 1.75, cz, MW - 0.4, 1.1, HP, {
      rect: mt,
      grime: 0,
    });
    b.panel("atlas_lit", FX + 3.22, MY + 0.62, cz, MW - 0.4, 1.1, HP, {
      rect: mb,
      grime: 0,
    });
    for (const sgn of [-1, 1])
      b.panel(
        "atlas_lit",
        FX + 1.6,
        MY + 1.2,
        cz + sgn * (MW / 2 + 0.02),
        3.0,
        2.2,
        sgn > 0 ? 0 : PI,
        { rect: ms, grime: 0 },
      );
    b.box("bronze", FX + 1.6, MY + MH, cz, 3.4, 0.25, MW + 0.3, {
      tint: 0x6a5030,
    });
    // soffit bulbs
    for (let z = MZ0 + 1; z < MZ1; z += 1.5)
      for (const dx of [0.6, 2.6]) {
        b.geo("lamp_amber", T.sphereLo, {
          x: FX + dx,
          y: MY - 0.05,
          z,
          s: 0.09,
          grime: 0,
        });
        if ((z * 3 + dx) % 3 < 1.5)
          glows.add(FX + dx, MY - 0.1, z, 0xffc070, "s");
      }
    for (let z = MZ0 + 2; z < MZ1; z += 4)
      glows.add(FX + 3.4, MY + 1.2, z, 0xffd080, "m");
    // tie rods
    for (const z of [MZ0 + 2, MZ1 - 2])
      b.beam("black_metal", FX + 3, MY + MH, z, FX, MY + MH + 3.5, z, 0.08);
    // entrance doors (five bronze & glass pairs)
    for (let k = -2; k <= 2; k++) {
      const z = cz + k * 4.2;
      b.box("bronze", FX + 0.05, 0, z, 0.15, 3.2, 2.6, { tint: 0x7a5a30 });
      b.box(k === 0 ? "black" : "glass", FX + 0.14, 0.3, z, 0.02, 2.6, 2.1, {
        faces: "e",
        grime: 0.3,
      });
      if (k !== 0)
        for (let j = 0; j < 4; j++)
          b.box("wood_rotten", FX + 0.2, 0.4 + j * 0.65, z, 0.06, 0.22, 2.4, {
            yaw: 0,
            rz: 0.05,
            tint: 0x7a6248,
          });
    }
    // posters on the front piers
    for (let i = 0; i < 4; i++) {
      const r = K.paint("msg_poster" + i, 256, 384);
      b.panel(
        "atlas_paint",
        FX + 0.24,
        2.0,
        cz + (i < 2 ? -10.5 - i * 4.2 : 10.5 + (i - 2) * 4.2) + 2.1,
        0.9,
        1.35,
        HP,
        { rect: r, grime: 0.4 },
      );
    }
    // "THE PIT" settlement sign hung over the central door, scrap barricade wings, guard nest, burning barrels
    const ps = K.paint("msg_pitsign", 700, 260);
    b.panel("atlas_paint", FX + 3.4, MY - 0.9, cz, 3.4, 1.25, HP, {
      rect: ps,
      grime: 0.3,
    });
    for (const sgn of [-1, 1]) {
      const z0 = cz + sgn * 5.5,
        z1 = cz + sgn * 15;
      for (let k = 0; k < 7; k++) {
        const z = z0 + ((z1 - z0) * k) / 7;
        b.box(
          k % 2 ? "corrugated" : "rust",
          FX + 7.2,
          0,
          z,
          0.2,
          2.2 + (k % 3) * 0.3,
          Math.abs(z1 - z0) / 7 + 0.3,
          { yaw: ((k % 2) - 0.5) * 0.12, tint: k % 2 ? 0x8a7a62 : 0x8a5a3a },
        );
      }
      K.colBox(FX + 7.0, 0, Math.min(z0, z1), FX + 7.4, 2.4, Math.max(z0, z1), {
        surface: "metal",
      });
      b.beam("wood", FX + 7.2, 0, z0, FX + 7.2, 3.4, z0, 0.18);
    }
    F.sandbags(b, FX + 6, 0, cz + 17.5, 0.4, 3, 3);
    b.box("wood", FX + 6.2, 3.2, cz + 17, 2.8, 0.15, 2.4, { tint: 0x7a6248 });
    for (const dz of [-1, 1])
      b.beam("wood", FX + 5, 0, cz + 17 + dz, FX + 5, 3.2, cz + 17 + dz, 0.14);
    // string lights across the entrance
    const pts = b.cable(
      "black_metal",
      FX + 7.2,
      3.4,
      cz - 5.5,
      FX + 7.2,
      3.4,
      cz + 5.5,
      0.6,
      0.02,
      10,
    );
    for (const p of pts) glows.add(p[0], p[1] - 0.1, p[2], 0xffd090, "s");
    // rubble & litter against the side walls
    F.debris(b, X0 + 3, 0, Z0 - 1.5, 2.2, 10);
    F.debris(b, X0 + 20, 0, Z1 + 1.2, 1.8, 8);
    b.burn(FX, 18, cz - 12, 6, 0.6);
    b.finish(rec.root, { lod: 1200 });
    glows.finish(rec.root, {
      dayOpacity: 0.45,
      nightOpacity: 1,
      flicker: 0.15,
    });
    rec.anchor("entrance", FX + 4.5, 0, cz, -HP);
    rec.anchor("guard1", FX + 6, 0, cz + 7, -HP);
    rec.anchor("guard2", FX + 6, 0, cz - 7, -HP);
    return {
      doorPos: new THREE.Vector3(FX + 0.4, 1.6, cz),
      outside: { x: FX + 3.2, y: 0, z: cz, yaw: -HP },
    };
  }

  // ------------------------------------------------------------------
  // INTERIOR
  // ------------------------------------------------------------------
