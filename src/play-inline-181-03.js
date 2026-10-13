// play-inline-181 03 — cz1
// Lines 363-660 of readable/play-inline-181.pretty.js (statement-aligned).
  function buildExterior(rec) {
    const s = K.site("bellevue");
    const b = K.builder("bv_ext", { grime: 0.6 });
    const glows = K.glowSet("bv_ext");
    const X0 = s.x0,
      X1 = s.x1,
      Z0 = s.z0,
      Z1 = s.z1; // 292..330, 47..78
    const trim = 0xd8ccb0;
    const cx = (X0 + X1) / 2; // 311
    const CZ1 = Z1 - 10; // centre block front (68)
    // centre block + wings
    K.block(b, "bv_brick", X0 + 10, Z0, X1 - 10, CZ1, 0, 30, {
      roof: "concrete_dark",
      col: true,
    });
    for (const w of [
      [X0, X0 + 10],
      [X1 - 10, X1],
    ]) {
      K.block(b, "bv_brick", w[0], Z0, w[1], Z1 - 0.5, 0, 26.4, {
        roof: "concrete_dark",
        col: true,
      });
      K.band(b, "limestone", w[0], Z0, w[1], Z1 - 0.5, 25.6, 0.9, 0.4, {
        tint: trim,
      });
      K.band(b, "limestone", w[0], Z0, w[1], Z1 - 0.5, 3.4, 0.4, 0.15, {
        tint: trim,
      });
      for (const qx of [w[0], w[1]])
        for (let y = 0; y < 26; y += 1.4)
          b.box("limestone", qx, y, Z1 - 0.9, 1.0, 0.7, 1.0, { tint: trim });
      // 3D window surrounds: limestone sills + flat-arch lintels with keystones (the pavilion's McKim-style trim)
      K.reveals(b, "bv_brick", w[0], Z0, w[1], Z1 - 0.5, 0, 26.4, {
        tint: trim,
        proj: 0.12,
        keystone: true,
        maxY: 25.4,
        skip: (x, z, y, f) =>
          (f === "s" && y < 3) ||
          (f === "e" && Math.abs(z - (Z0 + 10)) < 3.2 && y < 5) ||
          (z < CZ1 - 0.5 &&
            ((f === "e" && Math.abs(x - (X0 + 10)) < 0.2) ||
              (f === "w" && Math.abs(x - (X1 - 10)) < 0.2))),
      }); // hidden against the centre block
    }
    K.reveals(b, "bv_brick", X0 + 10, Z0, X1 - 10, CZ1, 0, 30, {
      faces: "sn",
      tint: trim,
      proj: 0.12,
      keystone: true,
      maxY: 29,
      skip: (x, z, y, f) => f === "s" && Math.abs(x - cx) < 5.4,
    });
    K.band(b, "limestone", X0 + 10, Z0, X1 - 10, CZ1, 29.2, 1.0, 0.45, {
      tint: trim,
    });
    // wing roofs: water tank + mechanicals (west), bulkhead + vents (east)
    K.roofKit(b, X0 + 0.4, Z0 + 0.5, X0 + 9.6, Z1 - 1, 26.42, "bv_roof_w", {
      bulkhead: false,
      n: 2,
    });
    K.roofKit(b, X1 - 9.6, Z0 + 0.5, X1 - 0.4, Z1 - 1, 26.42, "bv_roof_e", {
      tower: false,
      n: 2,
    });
    K.band(b, "granite", X0, Z0, X1, Z1 - 0.5, 0, 1.2, 0.2, {
      tint: 0x8a8278,
      faces: "nsewt",
    });
    // central pavilion: projecting frontispiece, pediment, entrance portal, cupola
    b.box("bv_brick", cx, 0, CZ1 + 0.8, 9.6, 32, 1.6, { seg: 7 });
    for (const sx of [-4.2, 4.2])
      b.box("limestone", cx + sx, 0, CZ1 + 1.7, 0.9, 30, 0.4, { tint: trim });
    b.prism(
      "limestone",
      [
        [cx - 5.2, CZ1 + 1.8],
        [cx + 5.2, CZ1 + 1.8],
        [cx + 5.2, CZ1],
        [cx - 5.2, CZ1],
      ],
      32,
      32.6,
      { tint: trim },
    );
    {
      const p = [
        [cx - 5.2, 32.6],
        [cx + 5.2, 32.6],
        [cx, 35.6],
      ];
      b.quad(
        "limestone",
        [p[0][0], p[0][1], CZ1 + 1.8],
        [p[1][0], p[1][1], CZ1 + 1.8],
        [p[2][0], p[2][1], CZ1 + 1.8],
        [p[2][0], p[2][1], CZ1 + 1.8],
        { tint: trim },
      );
      b.beam(
        "limestone",
        p[0][0],
        p[0][1],
        CZ1 + 1.2,
        p[2][0],
        p[2][1],
        CZ1 + 1.2,
        0.5,
        { d: 1.4, tint: trim },
      );
      b.beam(
        "limestone",
        p[1][0],
        p[1][1],
        CZ1 + 1.2,
        p[2][0],
        p[2][1],
        CZ1 + 1.2,
        0.5,
        { d: 1.4, tint: trim },
      );
    }
    b.cyl("limestone", cx, 30.2, (Z0 + CZ1) / 2, 2.6, 2.4, 2.4, 8, {
      tint: trim,
    });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * PI * 2;
      b.cyl(
        "limestone",
        cx + Math.cos(a) * 2.1,
        32.6,
        (Z0 + CZ1) / 2 + Math.sin(a) * 2.1,
        0.16,
        0.16,
        2.6,
        6,
        { tint: trim },
      );
    }
    b.cyl("copper", cx, 35.2, (Z0 + CZ1) / 2, 2.6, 0.3, 2.8, 8, {
      tint: 0x5a8a74,
    });
    b.cyl("copper", cx, 32.6, (Z0 + CZ1) / 2, 1.6, 1.6, 2.6, 8, {
      tint: 0x2a2a28,
    });
    // portal: steps, limestone surround, iron-bound door
    b.stairs("granite", cx, CZ1 + 4.6, 0, -1, 5, 2.2, 0, 1.0, 3, {
      tint: 0x9a948c,
      solid: true,
    });
    K.slab(b, "granite", cx - 2.8, CZ1 + 1.6, cx + 2.8, CZ1 + 2.4, 1.0, {
      th: 1.0,
      tint: 0x9a948c,
      faces: "tnsew",
    });
    b.box("limestone", cx, 1.0, CZ1 + 1.62, 4.2, 4.6, 0.3, {
      tint: trim,
      faces: "nsewt",
    });
    b.box("black", cx, 1.0, CZ1 + 1.79, 2.2, 3.2, 0.02, {
      faces: "s",
      grime: 0,
    });
    b.box("wood_rotten", cx, 1.0, CZ1 + 1.82, 2.2, 3.2, 0.06, {
      tint: 0x4a3a2a,
      faces: "s",
    });
    for (let k = 0; k < 3; k++)
      b.box("black_metal", cx, 1.4 + k * 1.1, CZ1 + 1.87, 2.3, 0.1, 0.04, {
        faces: "s",
      });
    b.panel("atlas_paint", cx, 5.2, CZ1 + 1.8, 3.8, 0.6, 0, {
      rect: K.paint("bv_admit", 900, 140),
      grime: 0.4,
    });
    // wrought-iron fence along the street with the arched gate
    const FZ = Z1 - 0.4;
    for (let x = X0 + 10.3; x < X1 - 10.2; x += 0.22) {
      if (Math.abs(x - cx) < 2.1) continue;
      b.beam("black_metal", x, 0.3, FZ, x, 2.6, FZ, 0.035);
      b.geo("black_metal", T.cone4, { x, y: 2.7, z: FZ, s: 0.05, sy: 0.18 });
    }
    for (const y of [0.5, 2.3])
      for (const seg of [
        [X0 + 10.2, cx - 2.1],
        [cx + 2.1, X1 - 10.2],
      ])
        b.beam("black_metal", seg[0], y, FZ, seg[1], y, FZ, 0.05);
    K.colBox(X0 + 10.2, 0, FZ - 0.1, cx - 2.1, 2.6, FZ + 0.1, {
      surface: "metal",
    });
    K.colBox(cx + 2.1, 0, FZ - 0.1, X1 - 10.2, 2.6, FZ + 0.1, {
      surface: "metal",
    });
    for (const px of [cx - 2.4, cx + 2.4]) {
      b.box("brick_red", px, 0, FZ, 0.7, 3.4, 0.7, { tint: 0x7a4232 });
      b.box("limestone", px, 3.4, FZ, 0.9, 0.25, 0.9, { tint: trim });
      b.geo("glass_base", T.sphereLo, {
        x: px,
        y: 3.95,
        z: FZ,
        s: 0.3,
        tint: 0xd8e0c0,
        grime: 0.4,
      });
      K.colBox(px - 0.35, 0, FZ - 0.35, px + 0.35, 3.4, FZ + 0.35, {
        surface: "concrete",
      });
    }
    // arched iron sign over the gate
    const gr = K.paint("bv_gate", 1024, 200);
    b.panel("atlas_paint", cx, 4.7, FZ, 5.0, 1.0, 0, {
      rect: gr,
      grime: 0.2,
      both: true,
    });
    // gate leaves: one hanging open
    for (let k = 0; k < 9; k++)
      b.beam(
        "black_metal",
        cx - 2.0 + k * 0.1,
        0.3,
        FZ + k * 0.2,
        cx - 2.0 + k * 0.1,
        2.5,
        FZ + k * 0.2,
        0.03,
      );
    b.beam("black_metal", cx - 2.0, 2.4, FZ, cx - 1.2, 2.4, FZ + 1.6, 0.04);
    // Brute dressing: gore bags on the fence, meat hooks, scrap barricade, graffiti
    for (const gx of [cx - 5, cx + 4, cx + 7]) {
      b.beam("black_metal", gx, 2.6, FZ, gx, 2.1, FZ + 0.1, 0.03);
      b.geo("flesh", T.sphereLo, {
        x: gx,
        y: 1.7,
        z: FZ + 0.18,
        sx: 0.32,
        sy: 0.45,
        sz: 0.3,
        tint: 0x6a3a2a,
      });
    }
    const nh = K.paint("bv_nohumies", 512, 160);
    b.panel("atlas_paint", X0 + 5, 4.2, Z1 - 0.52, 6, 1.9, 0, {
      rect: nh,
      grime: 0,
    });
    F.sandbags(b, cx - 4, 0, CZ1 + 6, 0.2, 3, 3);
    F.sandbags(b, cx + 4.5, 0, CZ1 + 5.5, -0.3, 3, 3);
    for (let k = 0; k < 4; k++)
      F.bed(b, cx + 5.5, 0.1 + k * 0.05, CZ1 + 3 + k * 0.1, 0.3 + k * 0.4, {
        hospital: true,
        sheetTint: 0x8a7a62,
      });
    F.debris(b, X0 + 13, 0, Z1 - 3, 1.8, 10);
    b.burn(X0 + 10, 12, CZ1, 6, 0.7);
    b.burn(X1 - 5, 18, Z1 - 1, 7, 0.6);
    // red cross lightbox over the east wing & ambulance bay door (east face)
    b.box("hosp_white", X1 - 5, 8, Z1 - 0.3, 2.2, 2.2, 0.3, { tint: 0xd8d8d0 });
    b.box("paint_red", X1 - 5, 8.75, Z1 - 0.12, 1.6, 0.7, 0.02, {
      faces: "s",
      tint: 0xa82018,
    });
    b.box("paint_red", X1 - 5, 8.3, Z1 - 0.12, 0.6, 1.6, 0.02, {
      faces: "s",
      tint: 0xa82018,
    });
    const BZ = Z0 + 10;
    b.box("corrugated", X1 + 0.05, 0, BZ, 0.1, 3.8, 4.4, { tint: 0x7a7a70 });
    b.box("limestone", X1 + 0.2, 3.8, BZ, 0.4, 0.5, 5.2, { tint: trim });
    b.panel("atlas_paint", X1 + 0.12, 4.8, BZ, 4, 0.55, HP, {
      rect: K.paint("bv_pharmacy", 256, 96),
      grime: 0.5,
    });
    glows.add(X1 - 5, 8.4, Z1 + 0.2, 0xff5040, "m");
    for (const px of [cx - 2.4, cx + 2.4])
      glows.add(px, 3.95, FZ, 0xd8f0c0, "s");
    b.finish(rec.root, { lod: 1200 });
    glows.finish(rec.root, {
      dayOpacity: 0.2,
      nightOpacity: 0.9,
      flicker: 0.3,
    });
    rec.anchor("entrance", cx, 0, Z1 + 2, PI);
    rec.anchor("gate", cx, 0, FZ + 1, PI);
    return {
      doorPos: new THREE.Vector3(cx, 2.4, CZ1 + 2.0),
      outside: { x: cx, y: 1.0, z: CZ1 + 3.2, yaw: PI },
      bayDoor: new THREE.Vector3(X1 + 0.4, 1.6, BZ),
      bayOutside: { x: X1 + 2.5, y: 0, z: BZ, yaw: -HP },
    };
  }

  // ------------------------------------------------------------------
  // INTERIOR
  // ------------------------------------------------------------------
