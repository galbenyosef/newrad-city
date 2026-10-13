// play-inline-85 10 — lot
// Lines 2173-2344 of readable/play-inline-85.pretty.js (statement-aligned).
  function buildWarehouse(lot, r) {
    const x0 = lot.x0,
      x1 = lot.x1,
      z0 = lot.z0,
      z1 = lot.z1;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const H = heightFor(lot, r);
    const fmat =
      "facade/warehouse/" + chunkVariant("warehouse", cx, cz, r() < 0.5);
    const tint = r.pick(TINTS.warehouse);
    const ruined = r() < 0.27;
    if (ruined) lot.ruined = true;
    const baseB = M.buf("concrete", cx, cz);
    M.box(baseB, x0 - 0.1, 0, z0 - 0.1, x1 + 0.1, 1.2, z1 + 0.1, {
      s: 3,
      c: [0.7, 0.68, 0.64],
      skip: 8 + 4,
    });
    if (ruined) {
      const keep = H * r.range(0.35, 0.7);
      facadeWalls(x0, z0, x1, z1, 1.2, keep, fmat, tint, { vBase: 1.2 });
      jaggedTop(x0, z0, x1, z1, keep, H, fmat, tint, r, { vBase: 1.2 });
      M.box3(x0, 0, z0, x1, H * 0.8, z1, { tag: "building" });
      M.rubblePile(cx, z1 + 3, r.range(4, 8), r.range(1.5, 3), r);
      return { h: H };
    }
    facadeWalls(x0, z0, x1, z1, 1.2, H, fmat, tint, { vBase: 1.2 });
    belt(x0, z0, x1, z1, H - 0.8, 0.15, 0.8, "brick_red", [0.7, 0.55, 0.45]);
    for (const [ax, az, bx, bz, nx, nz] of [
      [x0, z0, x1, z0, 0, -1],
      [x1, z0, x1, z1, 1, 0],
      [x1, z1, x0, z1, 0, 1],
      [x0, z1, x0, z0, -1, 0],
    ])
      M.graffitiWalls.push({ ax, az, bx, bz, nx, nz, y0: 1.4, y1: 4.5 });
    // loading dock on the longer street side with roll-up doors
    const side =
      x1 - x0 > z1 - z0 ? (r() < 0.5 ? "n" : "s") : r() < 0.5 ? "w" : "e";
    loadingDock(x0, z0, x1, z1, side, r);
    // roof: sawtooth or flat with water tower
    if (r() < 0.45 && x1 - x0 > 20) {
      const bs = M.buf("corrugated", cx, cz),
        bg = M.buf("glass_dirty", cx, cz);
      const teeth = Math.floor((x1 - x0) / 6);
      for (let i = 0; i < teeth; i++) {
        const tx0 = x0 + (i * (x1 - x0)) / teeth,
          tx1 = tx0 + (x1 - x0) / teeth;
        M.quad(
          bs,
          [tx0, H, z0 + 0.3],
          [tx0, H, z1 - 0.3],
          [tx1, H + 3, z1 - 0.3],
          [tx1, H + 3, z0 + 0.3],
          [-0.7, 0.7, 0],
          [0, 0, 6, 0, 6, 2, 0, 2],
          [0.75, 0.7, 0.62],
        );
        M.quad(
          bg,
          [tx1, H, z1 - 0.3],
          [tx1, H, z0 + 0.3],
          [tx1, H + 3, z0 + 0.3],
          [tx1, H + 3, z1 - 0.3],
          [1, 0, 0],
          [0, 0, 6, 0, 6, 1, 0, 1],
          [0.5, 0.55, 0.5],
        );
        M.tri(
          bs,
          [tx0, H, z0 + 0.3],
          [tx1, H + 3, z0 + 0.3],
          [tx1, H, z0 + 0.3],
          [0, 0, -1],
          [0, 0, 1, 1, 1, 0],
          [0.7, 0.65, 0.6],
        );
        M.tri(
          bs,
          [tx0, H, z1 - 0.3],
          [tx1, H, z1 - 0.3],
          [tx1, H + 3, z1 - 0.3],
          [0, 0, 1],
          [0, 0, 1, 0, 1, 1],
          [0.7, 0.65, 0.6],
        );
      }
      roof(x0, z0, x1, z1, H, { parapet: false });
    } else {
      roof(x0, z0, x1, z1, H, {
        parapet: 0.9,
        trim: "brick_red",
        trimC: [0.7, 0.55, 0.45],
      });
      rooftop(x0, z0, x1, z1, H, r, { tower: 0.5 });
    }
    // brick smokestack
    if (r() < 0.25) {
      const sx = x0 + 3 + r() * (x1 - x0 - 6),
        sz = z0 + 3 + r() * (z1 - z0 - 6);
      M.cyl(
        M.buf("brick_red", sx, sz),
        sx,
        H,
        sz,
        1.6,
        1.1,
        r.range(14, 26),
        12,
        { c: [0.85, 0.72, 0.62], s: 2.5 },
      );
    }
    M.box3(x0, 0, z0, x1, H, z1, { tag: "building" });
    return { h: H };
  }

  /** Collapsed lot: rubble mound with jagged wall stubs. */
  function buildCollapsed(lot, r) {
    const x0 = lot.x0 + 0.2,
      x1 = lot.x1 - 0.2,
      z0 = lot.z0 + 0.2,
      z1 = lot.z1 - 0.2;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const style =
      lot.district === "brooklyn"
        ? "warehouse"
        : r() < 0.5
          ? "apartment"
          : "office";
    const fmat = "facade/" + style + "/" + chunkVariant(style, cx, cz, false);
    const tint = M.mulc(r.pick(TINTS[style]), 0.85);
    const h = r.range(5, 16);
    jaggedTop(x0, z0, x1, z1, 0.2, h, fmat, tint, r, {});
    const mound = Math.min(x1 - x0, z1 - z0) * 0.45;
    M.rubblePile(cx, cz, mound, r.range(2, 4.5), r);
    M.box3(x0 + 1, 0, z0 + 1, x1 - 1, 1.2, z1 - 1, {
      tag: "rubble",
      surface: "rubble",
    });
    return { h };
  }

  // -------------------------------------------------------------------
  // Ground floor bands: storefronts, base windows, entrance canopies
  // -------------------------------------------------------------------
  function frontSides(lot) {
    return {
      n: lot.front.n || !!lot.faceN,
      s: lot.front.s || !!lot.faceS,
      e: lot.front.e,
      w: lot.front.w,
    };
  }
  function partyFaces(lot) {
    const f = frontSides(lot);
    // interior lot sides → blank brick party walls; rear (opposite a front) keeps windows
    const face = { n: "f", e: "f", s: "f", w: "f" };
    if (!f.e && !f.w) {
      face.e = "b";
      face.w = "b";
    } else if (!f.e) face.e = "b";
    else if (!f.w) face.w = "b";
    return face;
  }
  M.storefronts = [];
  M.graffitiWalls = [];
  /**
   * Storefront band along the street-facing sides (y 0..gf): pilasters,
   * bulkheads, recessed display glass, sign band with shop sign, awnings,
   * boarded / shuttered bays. Non-street sides get plain wall.
   */
