// play-inline-87 04 — lot
// Lines 885-933 of readable/play-inline-87.pretty.js (statement-aligned).
  M.buildCutBlocks = async function (yieldFn, sliceMs) {
    const lots = planPieces();
    M.cutLots = lots;
    let t = performance.now(),
      n = 0;
    for (const lot of lots) {
      if (yieldFn && performance.now() - t > (sliceMs || 120)) {
        await yieldFn(1);
        t = performance.now();
      }
      const r = M.rng(
        "cutlot" + Math.round(lot.x0 * 10) + "," + Math.round(lot.z0 * 10),
      );
      const rw = M.rng(
        "cutwx" + Math.round(lot.x0 * 10) + "," + Math.round(lot.z0 * 10),
      );
      lot.dirt = rw.range(0.7, 1.3);
      lot.burnt =
        rw() < 0.2 &&
        !M._bld.nearSettlement((lot.x0 + lot.x1) / 2, (lot.z0 + lot.z1) / 2);
      lot.shopSoot = lot.burnt || rw() < 0.3;
      M.curLot = lot;
      try {
        const res = buildCutLot(lot, r);
        lot.h = res.h;
        n++;
      } catch (e) {
        G.reportError("map:cutlot", e);
      }
      M.curLot = null;
    }
    // self-check: a polygon lot must never overlap a generic rect building (blocks are claimed whole)
    let overlap = 0;
    for (const lot of lots)
      for (const g of M.lots || []) {
        if (
          g.x1 <= lot.x0 ||
          g.x0 >= lot.x1 ||
          g.z1 <= lot.z0 ||
          g.z0 >= lot.z1
        )
          continue;
        const c = M.clipRect(lot.poly, g.x0, g.z0, g.x1, g.z1);
        if (c && Math.abs(M.polyArea(c)) > 1) overlap++;
      }
    if (overlap)
      console.warn("[map] cut lots overlapping generic lots:", overlap);
    return { wedge: n, cutBlocks: claimed.length, cutOverlapGeneric: overlap };
  };
