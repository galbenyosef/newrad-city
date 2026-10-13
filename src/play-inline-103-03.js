// play-inline-103 03 — cached
// Lines 898-942 of readable/play-inline-103.pretty.js (statement-aligned).
  let cached = null,
    ready = false,
    stale = false;
  G.map.getMapImage = function () {
    if (!cached) {
      try {
        cached = M.drawMapImage();
        stale = !ready;
      } catch (e) {
        G.reportError("map:getMapImage", e);
        cached = M.canvas(CW, CH);
      }
    }
    return cached;
  };
  try {
    G.events.on("initDone", () => {
      ready = true;
      if (cached && stale) {
        try {
          M.drawMapImage(cached);
          stale = false;
        } catch (e) {
          G.reportError("map:getMapImage", e);
        }
      }
    });
  } catch (e) {
    ready = true;
  }
  G.map.worldToMap = function (x, z) {
    const t = transform();
    return {
      u: (t.ox + (x - t.W.minX) * t.s) / CW,
      v: (t.oy + (z - t.W.minZ) * t.s) / CH,
    };
  };
  G.map.mapToWorld = function (u, v) {
    const t = transform();
    return {
      x: (u * CW - t.ox) / t.s + t.W.minX,
      z: (v * CH - t.oy) / t.s + t.W.minZ,
    };
  };
  G.map.mapSize = { width: CW, height: CH };
