// play-inline-85 17 — lot
// Lines 3881-4124 of readable/play-inline-85.pretty.js (statement-aligned).
  function emitImpostor(lot, c0) {
    const cx = (lot.x0 + lot.x1) / 2,
      cz = (lot.z0 + lot.z1) / 2;
    const b = M.buf("my/farfacade", cx, cz, "imp");
    const tint = M.mulc(
      IMP_TINT[lot.kind] || [0.7, 0.7, 0.68],
      0.9 + M.hash(cx, cz, 7) * 0.2,
    );
    const tile = M.facadeTile();
    const roofC = M.mulc(tint, 0.45);
    for (let i = c0; i < M.colliders.length; i++) {
      const c = M.colliders[i];
      if (c.tag !== "building" && c.tag !== "rubble") continue;
      const h = c.maxY - c.minY;
      if (h < 2.5) continue;
      const x0 = c.bb.x0,
        x1 = c.bb.x1,
        z0 = c.bb.z0,
        z1 = c.bb.z1;
      if ((x1 - x0) * (z1 - z0) < 6) continue;
      const y0 = c.minY,
        y1 = c.maxY;
      const sides = [
        [x0, z0, x1, z0],
        [x1, z0, x1, z1],
        [x1, z1, x0, z1],
        [x0, z1, x0, z0],
      ];
      for (const s of sides) {
        const l = Math.hypot(s[2] - s[0], s[3] - s[1]);
        M.wall(
          b,
          s[0],
          s[1],
          s[2],
          s[3],
          y0,
          y1,
          0,
          l / tile.w,
          y0 / tile.h,
          y1 / tile.h,
          M.mulc(tint, y0 < 5 ? 0.7 : 0.95),
          tint,
        );
      }
      M.quad(
        b,
        [x0, y1, z0],
        [x1, y1, z0],
        [x1, y1, z1],
        [x0, y1, z1],
        [0, 1, 0],
        [0.01, 0.01, 0.02, 0.01, 0.02, 0.02, 0.01, 0.02],
        roofC,
      );
    }
    // crown silhouette (spires, masts, pyramids read on the far skyline)
    const cr = lot.crown;
    if (cr) {
      const uv = [0.01, 0.01, 0.02, 0.01, 0.02, 0.02, 0.01, 0.02];
      if (cr.kind === "pyramid") {
        const [a0, b0, a1, b1] = cr.base,
          ap = [cr.x, cr.y + cr.h, cr.z];
        M.tri(
          b,
          [a0, cr.y, b0],
          [a1, cr.y, b0],
          ap,
          [0, 0.6, -0.8],
          uv,
          [0.4, 0.62, 0.52],
        );
        M.tri(
          b,
          [a1, cr.y, b0],
          [a1, cr.y, b1],
          ap,
          [0.8, 0.6, 0],
          uv,
          [0.36, 0.56, 0.47],
        );
        M.tri(
          b,
          [a1, cr.y, b1],
          [a0, cr.y, b1],
          ap,
          [0, 0.6, 0.8],
          uv,
          [0.4, 0.62, 0.52],
        );
        M.tri(
          b,
          [a0, cr.y, b1],
          [a0, cr.y, b0],
          ap,
          [-0.8, 0.6, 0],
          uv,
          [0.36, 0.56, 0.47],
        );
      } else {
        if (cr.base) {
          const [a0, b0, a1, b1] = cr.base;
          M.box(b, a0, cr.by, b0, a1, cr.y, b1, {
            s: 100,
            c: M.mulc(tint, 0.9),
            skip: 8,
          });
        }
        M.cyl(b, cr.x, cr.y, cr.z, cr.r, 0.05, cr.h, 4, {
          c: [0.6, 0.6, 0.58],
        });
      }
    }
  }
  M.emitImpostor = emitImpostor;
  // internals shared with 41_fronts.js (polygon lots along Broadway / roundabouts)
  M._bld = {
    TINTS,
    TRIM_C,
    bay,
    shopSign,
    awning,
    heightFor,
    chunkVariant,
    TILE,
    lotOnLand,
    nearSettlement,
    IMP_TINT,
  };

  // -------------------------------------------------------------------
  // City build entry point
  // -------------------------------------------------------------------
  /**
   * Build every lot. Async: yields to the browser every `sliceMs` of work so no single task runs for
   * seconds (headless runs / slow machines stay responsive, the loading screen keeps updating).
   */
  M.buildCity = async function (yieldFn, sliceMs) {
    const lots = planLots();
    M.lots = lots;
    if (M.planFallenTowers) M.planFallenTowers(lots);
    let shellQuota = 0;
    const stats = {
      tower: 0,
      commercial: 0,
      apartment: 0,
      brownstone: 0,
      tenement: 0,
      warehouse: 0,
      collapsed: 0,
      shell: 0,
    };
    let tSlice = performance.now();
    for (let i = 0; i < lots.length; i++) {
      if (yieldFn && performance.now() - tSlice > (sliceMs || 120)) {
        await yieldFn(i / lots.length);
        tSlice = performance.now();
      }
      const lot = lots[i];
      const r = M.rng(
        "lot" + Math.round(lot.x0 * 10) + "," + Math.round(lot.z0 * 10),
      );
      // weathering state (own rng stream so the building shapes stay as designed)
      const rw = M.rng(
        "wx" + Math.round(lot.x0 * 10) + "," + Math.round(lot.z0 * 10),
      );
      lot.dirt = rw.range(0.7, 1.3);
      lot.burnt =
        rw() <
          (lot.kind === "tower" || lot.kind === "commercial" ? 0.27 : 0.18) &&
        !nearSettlement((lot.x0 + lot.x1) / 2, (lot.z0 + lot.z1) / 2);
      lot.shopSoot = lot.burnt || rw() < 0.3;
      M.curLot = lot;
      let kind = lot.kind;
      if (r() < (kind === "brownstone" ? 0.035 : 0.06) && kind !== "tower")
        kind = "collapsed";
      if (lot.fallen) kind = "collapsed"; // its shaft lies across the avenue (49_ruins.js)
      const lcx = (lot.x0 + lot.x1) / 2,
        lcz = (lot.z0 + lot.z1) / 2;
      for (const c of M.HEIGHT_CAPS || [])
        if (
          lcx > c.x0 &&
          lcx < c.x1 &&
          lcz > c.z0 &&
          lcz < c.z1 &&
          (kind === "tower" || kind === "apartment")
        )
          kind = "commercial";
      shellQuota += kind === "tenement" || kind === "commercial" ? 1 : 0;
      const c0 = M.colliders.length;
      if (
        (kind === "tenement" || kind === "commercial") &&
        shellQuota % 5 === 2 &&
        M.shells.length < 34
      ) {
        const res = buildShell(lot, r);
        if (res) {
          lot.h = res.h;
          lot.kind = "shell";
          stats.shell++;
          emitImpostor(lot, c0);
          continue;
        }
      }
      let res;
      switch (kind) {
        case "tower":
          res = buildTower(lot, r);
          break;
        case "commercial":
          res = buildCommercial(lot, r);
          break;
        case "apartment":
          res = buildApartment(lot, r);
          break;
        case "brownstone":
          res = buildBrownstone(lot, r);
          break;
        case "tenement":
          res = buildTenement(lot, r);
          break;
        case "warehouse":
          res = buildWarehouse(lot, r);
          break;
        default:
          res = buildCollapsed(lot, r);
          kind = "collapsed";
      }
      M.setXF(null);
      lot.h = res ? res.h : 0;
      lot.kind = kind;
      if (kind === "collapsed") lot.ruined = true;
      stats[kind] = (stats[kind] || 0) + 1;
      emitImpostor(lot, c0);
    }
    M.curLot = null;
    if (M.buildCutBlocks)
      Object.assign(stats, await M.buildCutBlocks(yieldFn, sliceMs));
    stats.ruined = lots.filter((l) => l.ruined).length;
    stats.burnt = lots.filter((l) => l.burnt).length;
    M.cityStats = stats;
    return stats;
  };
