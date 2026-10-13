// play-inline-85 09 — facen
// Lines 1912-2172 of readable/play-inline-85.pretty.js (statement-aligned).
  function buildBrownstone(lot, r) {
    const x0 = lot.x0 + 0.08,
      x1 = lot.x1 - 0.08,
      z0 = lot.z0,
      z1 = lot.z1;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const floors = r.int(3, 5);
    const flH = 3.4,
      pY = 1.5; // parlour floor raised
    const H = pY + floors * flH;
    const faceN = !!lot.faceN;
    const fz = faceN ? z0 : z1; // street facade z
    const nz = faceN ? -1 : 1;
    const setbackZ = faceN ? z0 + 0.0 : z1 - 0.0;
    void setbackZ;
    const brick = r() < 0.55;
    const fmat =
      "facade/brownstone/" + chunkVariant("brownstone", cx, cz, r() < 0.5);
    const tint = r.pick(TINTS.brownstone);
    const face = {
      n: faceN ? "f" : "f",
      s: faceN ? "f" : "f",
      e: lot.front.e ? "f" : "b",
      w: lot.front.w ? "f" : "b",
    };
    // basement/areaway band
    const bb = M.buf(brick ? "brick_red" : "stone_limestone", cx, cz);
    const bc = brick ? [0.9, 0.85, 0.8] : [0.78, 0.66, 0.56];
    M.box(bb, x0, 0, z0, x1, pY, z1, { s: 2.5, c: bc, skip: 8 + 4 });
    facadeWalls(x0, z0, x1, z1, pY, H, fmat, tint, {
      vBase: pY,
      face,
      blank: "brick_red",
    });
    // cornice with brackets on the street side only
    const sides = { n: faceN, s: !faceN, e: false, w: false };
    const cb = M.buf("metal_painted", cx, cz);
    const ccol = r.pick([
      [0.35, 0.3, 0.27],
      [0.5, 0.45, 0.38],
      [0.25, 0.27, 0.26],
      [0.6, 0.55, 0.48],
    ]);
    M.box(
      cb,
      x0 - 0.02,
      H - 0.9,
      fz - (faceN ? 0.7 : -0.0),
      x1 + 0.02,
      H - 0.2,
      fz + (faceN ? 0 : 0.7),
      { s: 1.5, c: ccol },
    );
    const bd = M.buf("metal_painted", cx, cz, "detail");
    for (let t = 0.12; t < 0.95; t += 0.25) {
      const px = x0 + (x1 - x0) * t;
      M.box(
        bd,
        px - 0.1,
        H - 1.5,
        fz + (faceN ? -0.55 : 0),
        px + 0.1,
        H - 0.9,
        fz + (faceN ? 0 : 0.55),
        { s: 1, c: M.mulc(ccol, 0.8) },
      );
    }
    void sides;
    roof(x0, z0, x1, z1, H, {
      parapet: 0.5,
      trim: "brick_red",
      trimC: [0.75, 0.6, 0.5],
    });
    // chimneys
    const ch = M.buf("brick_red", cx, cz, "detail");
    for (let i = 0; i < r.int(1, 2); i++) {
      const px = x0 + 0.6 + r() * (x1 - x0 - 1.8),
        pz = z0 + 1 + r() * (z1 - z0 - 3);
      M.box(ch, px, H, pz, px + 0.7, H + r.range(1.2, 2.2), pz + 1.1, {
        s: 2,
        c: [0.8, 0.7, 0.62],
      });
    }
    // stoop: stairs from sidewalk up to the parlour door on one side of the facade
    const doorLeft = r() < 0.5;
    const sw = 1.7;
    const sx0 = doorLeft ? x0 + 0.35 : x1 - 0.35 - sw,
      sx1 = sx0 + sw;
    const steps = 7,
      runD = 2.8;
    const sb = M.buf("stone_limestone", cx, cz);
    const stoopC = brick ? [0.75, 0.72, 0.68] : [0.62, 0.5, 0.42];
    // step i=0 is at the STREET end (lowest); the top step meets the parlour door at the facade
    for (let i = 0; i < steps; i++) {
      const y1 = (pY * (i + 1)) / steps;
      const d0 = (runD * i) / steps;
      if (faceN)
        M.box(
          sb,
          sx0,
          0,
          fz - runD + d0,
          sx1,
          y1,
          fz - runD + d0 + runD / steps + 0.02,
          { s: 1, c: stoopC },
        );
      else
        M.box(
          sb,
          sx0,
          0,
          fz + runD - d0 - runD / steps - 0.02,
          sx1,
          y1,
          fz + runD - d0,
          { s: 1, c: stoopC },
        );
    }
    // stoop landing & cheek walls
    if (faceN) {
      M.box(sb, sx0 - 0.25, 0, fz - runD, sx0, pY + 0.2, fz, {
        s: 1,
        c: M.mulc(stoopC, 0.9),
      });
      M.box(sb, sx1, 0, fz - runD, sx1 + 0.25, pY + 0.2, fz, {
        s: 1,
        c: M.mulc(stoopC, 0.9),
      });
    } else {
      M.box(sb, sx0 - 0.25, 0, fz, sx0, pY + 0.2, fz + runD, {
        s: 1,
        c: M.mulc(stoopC, 0.9),
      });
      M.box(sb, sx1, 0, fz, sx1 + 0.25, pY + 0.2, fz + runD, {
        s: 1,
        c: M.mulc(stoopC, 0.9),
      });
    }
    // iron handrails
    const hb = M.buf("metal_painted", cx, cz, "detail");
    for (const sx of [sx0 - 0.12, sx1 + 0.12])
      M.beam(hb, sx, pY + 1.1, fz, sx, 1.0, fz + nz * runD, 0.05, 0.05, {
        c: [0.2, 0.2, 0.2],
      });
    // door (dark recess with frame)
    const dx0 = sx0 + 0.25,
      dx1 = sx1 - 0.25;
    const db = M.buf("wood_planks", cx, cz);
    const dz0 = faceN ? fz - 0.07 : fz + 0.01,
      dz1 = faceN ? fz - 0.01 : fz + 0.07;
    M.box(db, dx0, pY, dz0, dx1, pY + 2.6, dz1, {
      s: 1.5,
      c: r() < 0.5 ? [0.4, 0.28, 0.2] : [0.25, 0.25, 0.3],
    });
    M.box(
      M.buf("stone_limestone", cx, cz),
      dx0 - 0.2,
      pY + 2.6,
      faceN ? fz - 0.25 : fz,
      dx1 + 0.2,
      pY + 3.0,
      faceN ? fz : fz + 0.25,
      { s: 1, c: TRIM_C },
    );
    // areaway fence in front of the basement
    const fb = M.buf("metal_painted", cx, cz, "detail");
    const ax0 = doorLeft ? sx1 + 0.3 : x0 + 0.2,
      ax1 = doorLeft ? x1 - 0.2 : sx0 - 0.3;
    if (ax1 - ax0 > 1) {
      const fzz = fz + nz * 1.4;
      M.beam(fb, ax0, 1.0, fzz, ax1, 1.0, fzz, 0.04, 0.04, {
        c: [0.2, 0.2, 0.2],
      });
      for (let px = ax0; px <= ax1; px += 0.3)
        M.vbar(fb, px, fzz, 0, 1.12, 0.03, 0, nz, [0.2, 0.2, 0.2], true);
      M.ocol((ax0 + ax1) / 2, fzz, ax1 - ax0, 0.1, 0, 1.1, 0, { tag: "fence" });
      // garbage cans / debris in the areaway
      if (r() < 0.5)
        M.cyl(
          M.buf("metal_panel", cx, cz, "detail"),
          ax0 + 0.5,
          0,
          fz + nz * 0.6,
          0.3,
          0.28,
          0.8,
          8,
          { c: [0.5, 0.5, 0.45], capTop: true },
        );
    }
    // stoop collider (walkable steps as boxes)
    for (let i = 0; i < steps; i++) {
      const y1 = (pY * (i + 1)) / steps; // lowest at the street, rising to the door
      const d0 = (runD * i) / steps,
        d1 = d0 + runD / steps;
      const zA = faceN ? fz - runD + d0 : fz + runD - d1,
        zB = faceN ? fz - runD + d1 : fz + runD - d0;
      M.box3(sx0, 0, zA, sx1, y1, zB, { tag: "stairs", surface: "concrete" });
    }
    if (r() < 0.12)
      fireEscapesFor(lot, x0, z0, x1, z1, pY + flH, H - 1, flH, r, true);
    M.box3(x0, 0, z0, x1, H, z1, { tag: "building" });
    // occasional collapsed rowhouse
    return { h: H };
  }

  /** Walk-up tenement: storefront + 5-6 floors + fire escape. */
  function buildTenement(lot, r) {
    const x0 = lot.x0 + 0.1,
      x1 = lot.x1 - 0.1,
      z0 = lot.z0 + (lot.front.n || lot.faceN ? 0 : 0.1),
      z1 = lot.z1 - (lot.front.s || lot.faceS ? 0 : 0.1);
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const floors = r.int(4, 6);
    const gf = 4.5,
      flH = 3.3;
    const H = gf + floors * flH;
    const fmat =
      "facade/apartment/" + chunkVariant("apartment", cx, cz, r() < 0.5);
    const tint = r.pick(TINTS.apartment);
    const face = partyFaces(lot);
    storefrontBand(lot, x0, z0, x1, z1, gf, {
      style: "shop",
      r,
      faceN: lot.faceN,
      faceS: lot.faceS,
    });
    facadeWalls(x0, z0, x1, z1, gf, H, fmat, tint, {
      vBase: gf,
      face,
      blank: "brick_red",
    });
    cornice(
      x0,
      z0,
      x1,
      z1,
      H - 0.9,
      0.7,
      0.9,
      "metal_painted",
      [0.45, 0.42, 0.38],
      { brackets: true, sides: frontSides(lot) },
    );
    roof(x0, z0, x1, z1, H, {
      parapet: 0.6,
      trim: "brick_red",
      trimC: [0.75, 0.6, 0.5],
    });
    rooftop(x0, z0, x1, z1, H, r, { tower: 0.35 });
    if (r() < 0.85)
      fireEscapesFor(lot, x0, z0, x1, z1, gf + 0.6, H - 1.2, flH, r, true);
    if (r() < 0.4) randomHoles(x0, z0, x1, z1, 6, H - 3, 1, r, face);
    M.box3(x0, 0, z0, x1, H, z1, { tag: "building" });
    return { h: H };
  }

  /** Brooklyn warehouse: brick hulk, loading docks, sawtooth roofs, chimneys. */
