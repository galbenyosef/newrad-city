// play-inline-346 04 — tint
// Lines 1264-1599 of readable/play-inline-346.pretty.js (statement-aligned).
  function civicFame(b, x, y, z) {
    const gold = [0.82, 0.62, 0.3],
      dark = [0.6, 0.45, 0.22];
    b.cyl("gold", x, y, z, 0.9, 0.9, 0.6, 10, { tint: dark }); // globe-ish pedestal
    b.geo("gold", K.sphereGeo(), {
      x,
      y: y + 0.9,
      z,
      sx: 1.0,
      sy: 0.5,
      sz: 1.0,
      tint: dark,
    });
    b.cyl("gold", x, y + 1.2, z, 0.95, 0.42, 3.2, 12, { tint: gold }); // robe
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * PI * 2;
      b.beam(
        "gold",
        x + Math.cos(a) * 0.85,
        y + 1.3,
        z + Math.sin(a) * 0.85,
        x + Math.cos(a) * 0.4,
        y + 4.2,
        z + Math.sin(a) * 0.4,
        0.12,
        0.1,
        { tint: dark },
      );
    } // folds
    b.cyl("gold", x, y + 4.4, z, 0.42, 0.48, 1.3, 10, { tint: gold }); // torso
    b.geo("gold", K.sphereGeo(), {
      x,
      y: y + 6.0,
      z,
      sx: 0.28,
      sy: 0.34,
      sz: 0.3,
      tint: gold,
    }); // head
    b.cyl("gold", x, y + 6.3, z, 0.34, 0.36, 0.28, 10, { tint: dark }); // mural crown
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * PI * 2;
      b.box(
        "gold",
        x + Math.cos(a) * 0.3,
        y + 6.58,
        z + Math.sin(a) * 0.3,
        0.12,
        0.2,
        0.12,
        { tint: dark },
      );
    }
    // right arm raised with the laurel branch, left arm down to the shield
    b.pipe("gold", x + 0.4, y + 5.4, z, x + 0.75, y + 6.6, z + 0.1, 0.1, 6, {
      tint: gold,
    });
    b.pipe(
      "gold",
      x + 0.75,
      y + 6.6,
      z + 0.1,
      x + 0.8,
      y + 7.5,
      z + 0.15,
      0.08,
      6,
      { tint: gold },
    );
    for (let k = 0; k < 6; k++)
      b.geo("gold", K.sphereGeo(), {
        x: x + 0.8 + (k % 2 ? 0.12 : -0.1),
        y: y + 7.5 + k * 0.12,
        z: z + 0.15,
        sx: 0.12,
        sy: 0.05,
        sz: 0.06,
        rz: k % 2 ? 0.6 : -0.6,
        tint: dark,
      });
    b.pipe("gold", x - 0.4, y + 5.4, z, x - 0.7, y + 4.3, z + 0.2, 0.09, 6, {
      tint: gold,
    });
    b.geo("gold", new THREE.CylinderGeometry(0.55, 0.55, 0.08, 14), {
      x: x - 0.85,
      y: y + 3.6,
      z: z + 0.35,
      rz: HP,
      ry: 0.3,
      tint: dark,
    });
    b.glow(x, y + 4, z, [0.9, 0.7, 0.35], 1.5);
  }

  /**
   * Distant proxy (drawn beyond def.detail): same silhouette, flat textured faces, ~2 k tris and a handful
   * of draw calls instead of ~110 k tris / ~30 calls. Shares the slab texture so the swap is quiet.
   */
  function farProxy(ctx) {
    const b = K.builder({
      name: "mb_far",
      grime: 0.4,
      seg: 60,
      shadows: false,
    });
    const wall = (mat, ax, az, ux, uz, len, y0, y1, tint) =>
      b.face(mat, ax, y0, az, ux, 0, uz, 0, 1, 0, len, y1 - y0, {
        tint,
        seg: 60,
      });
    const ring4 = (mat, x0, z0, x1, z1, y0, y1, tint) => {
      wall(mat, x1, z0, -1, 0, x1 - x0, y0, y1, tint);
      wall(mat, x0, z1, 1, 0, x1 - x0, y0, y1, tint);
      wall(mat, x0, z0, 0, 1, z1 - z0, y0, y1, tint);
      wall(mat, x1, z1, 0, -1, z1 - z0, y0, y1, tint);
    };
    // base (with the arch as a dark slot through it and the colonnade recess on Chambers St)
    wall("ashlar", AX0, ZN, -1, 0, AX0 - X0, 0, B1, GRAN);
    wall("ashlar", X1, ZN, -1, 0, X1 - AX1, 0, B1, GRAN);
    wall("ashlar", AX1, ZN, -1, 0, AX1 - AX0, ASP + AR, B1, GRAN);
    wall("ashlar", X0, ZN, 0, 1, ZS - ZN, 0, B1, GRAN);
    wall("ashlar", X1, ZS, 0, -1, ZS - ZN, 0, B1, GRAN);
    wall("ashlar", X0, ZC, 1, 0, AX0 - X0, 0, B1, [0.4, 0.39, 0.37]);
    wall("ashlar", AX1, ZC, 1, 0, X1 - AX1, 0, B1, [0.4, 0.39, 0.37]);
    wall("ashlar", AX0, ZS, 1, 0, AX1 - AX0, ASP + AR, B1, GRAN);
    wall(
      "paint_black",
      AX1,
      ZN + 0.6,
      -1,
      0,
      AX1 - AX0,
      0,
      ASP + AR,
      [0.06, 0.06, 0.06],
    ); // the passage reads as a dark slot
    wall(
      "paint_black",
      AX0,
      ZS - 0.6,
      1,
      0,
      AX1 - AX0,
      0,
      ASP + AR,
      [0.06, 0.06, 0.06],
    );
    for (const [a0, a1] of [
      [X0 + 2, AX0 - 2.2],
      [AX1 + 2.2, X1 - 2],
    ]) {
      const n = Math.round((a1 - a0) / 3.3);
      for (let k = 0; k <= n; k++)
        b.cyl(
          "limestone",
          a0 + 0.9 + (k * (a1 - a0 - 1.8)) / n,
          0.9,
          ZS - 1.6,
          0.62,
          0.62,
          B1 - 3.1,
          6,
          { tint: LIME, top: false, rows: 1 },
        );
    }
    b.boxMM("limestone", X0 - 0.4, B1 - 2.2, ZN - 0.4, X1 + 0.4, B1, ZS + 0.6, {
      tint: LIME_D,
      faces: "nsewb",
      seg: 60,
    });
    // slab (C plan) — flat muni_bays faces
    const sl = (ax, az, ux, uz, len) =>
      wall("muni_bays", ax, az, ux, uz, len, B1, S1, [0.9, 0.88, 0.83]);
    sl(CX0, ZN, -1, 0, CX0 - X0);
    sl(X1, ZN, -1, 0, X1 - CX1);
    sl(CX1, CZ1, -1, 0, CX1 - CX0);
    sl(CX0, CZ1, 0, -1, CZ1 - ZN);
    sl(CX1, ZN, 0, 1, CZ1 - ZN);
    sl(X0, ZS, 1, 0, X1 - X0);
    sl(X0, ZN, 0, 1, ZS - ZN);
    sl(X1, ZS, 0, -1, ZS - ZN);
    for (const [x0, z0, x1, z1] of [
      [X0, ZN, CX0, ZS],
      [CX1, ZN, X1, ZS],
      [CX0, CZ1, CX1, ZS],
    ]) {
      b.boxMM(
        "limestone",
        x0 - 0.9,
        S1 - 0.8,
        z0 - 0.9,
        x1 + 0.9,
        S1,
        z1 + 0.9,
        { tint: LIME_D, faces: "nsewtb", seg: 60 },
      );
      b.boxMM(
        "limestone",
        x0 - 0.5,
        S1,
        z0 - 0.5,
        x1 + 0.5,
        S1 + 1.1,
        z1 + 0.5,
        { tint: LIME, faces: "nsew", seg: 60 },
      );
    }
    b.face(
      "concrete_dark",
      CX0,
      B1 + 0.02,
      CZ1,
      1,
      0,
      0,
      0,
      0,
      -1,
      CX1 - CX0,
      CZ1 - ZN,
      { uv: "top", tint: [0.36, 0.35, 0.33], seg: 60 },
    );
    // tier, lanterns, tower, cupola, Civic Fame
    ring4("muni_bays", TX0, TZ0, TX1, TZ1, S1, T1, [0.88, 0.86, 0.81]);
    b.boxMM(
      "limestone",
      TX0 - 0.7,
      T1 - 0.6,
      TZ0 - 0.7,
      TX1 + 0.7,
      T1,
      TZ1 + 0.7,
      { tint: LIME_D, faces: "nsewt", seg: 60 },
    );
    for (const [cx, cz] of [
      [TX0 + 2, TZ0 + 2],
      [TX1 - 2, TZ0 + 2],
      [TX0 + 2, TZ1 - 2],
      [TX1 - 2, TZ1 - 2],
    ]) {
      b.boxMM(
        "limestone",
        cx - 1.9,
        T1,
        cz - 1.9,
        cx + 1.9,
        T1 + 8.8,
        cz + 1.9,
        { tint: LIME, faces: "nsewt" },
      );
      b.cyl("patina", cx, T1 + 8.8, cz, 1.4, 0.05, 4.2, 6, {
        tint: [0.85, 0.95, 0.9],
        rows: 1,
      });
    }
    const CX = ACX,
      CZ = TCZ,
      D0 = T1 + 8.8,
      DR = 5.4,
      C0 = D0 + 9.2,
      L0 = C0 + 4.8;
    b.boxMM("limestone", CX - 8, T1, CZ - 8, CX + 8, D0, CZ + 8, {
      tint: LIME,
      faces: "nsewt",
    });
    b.cyl("paint_black", CX, D0, CZ, DR - 0.5, DR - 0.5, 8.2, 10, {
      tint: [0.14, 0.14, 0.13],
      rows: 1,
      top: false,
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      b.cyl(
        "limestone",
        CX + Math.cos(a) * DR,
        D0,
        CZ + Math.sin(a) * DR,
        0.34,
        0.34,
        7.8,
        4,
        { tint: LIME, rows: 1, top: false },
      );
    }
    b.cyl("limestone", CX, D0 + 7.8, CZ, DR + 0.9, DR + 0.9, 1.4, 12, {
      tint: LIME_D,
      rows: 1,
    });
    b.cyl("limestone", CX, C0, CZ, DR - 1.0, DR - 1.2, 1.8, 10, {
      tint: LIME,
      rows: 1,
      top: false,
    });
    K.dome(b, CX, C0 + 1.8, CZ, DR - 1.1, 3.2, {
      mat: "patina",
      seg: 12,
      rows: 4,
    });
    b.cyl("paint_black", CX, L0, CZ, 1.1, 1.0, 2.2, 6, {
      tint: [0.1, 0.1, 0.09],
      rows: 1,
    });
    b.cyl("gold", CX, L0 + 2.2, CZ, 1.4, 0.9, 0.9, 8, {
      tint: [0.7, 0.55, 0.28],
      rows: 1,
    });
    b.cyl("gold", CX, L0 + 3.1, CZ, 0.9, 0.42, 4.4, 8, {
      tint: [0.82, 0.62, 0.3],
      rows: 1,
    });
    b.geo("gold", K.sphereGeo(), {
      x: CX,
      y: L0 + 9.1,
      z: CZ,
      sx: 0.3,
      sy: 0.38,
      sz: 0.3,
      tint: [0.82, 0.62, 0.3],
    });
    b.cyl("gold", CX, L0 + 7.5, CZ, 0.36, 0.36, 1.7, 5, {
      tint: [0.82, 0.62, 0.3],
      rows: 1,
    });
    b.glow(CX, L0 + 5, CZ, [0.9, 0.7, 0.35], 1.5);
    return b.finish(null);
  }

  PC.define({
    id: "municipal_building",
    name: "Manhattan Municipal Building",
    interior: "municipal_building",
    order: 20,
    lod: 1500,
    detail: 300,
  });
  PC.part("municipal_building", { ext: exterior, far: farProxy });
