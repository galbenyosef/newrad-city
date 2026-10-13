// play-inline-600 02 — model
// Lines 355-378 of readable/play-inline-600.pretty.js (statement-aligned).
  H.itemRender = function (def, id, cachedOnly) {
    if (!def) return null;
    id = id || def.id;
    const col = H.tint().c;
    const key = id + "|" + col;
    if (CACHE.has(key)) return CACHE.get(key);
    if (cachedOnly) return undefined;
    if (R.failed > 3 || !setup()) return null;
    let url = null;
    const model = buildModel(def, id);
    if (model) {
      try {
        url = renderItem(model, col);
      } catch (e) {
        R.failed++;
        H.warnOnce("itemrender", e);
        url = null;
      }
      if (model.dispose) model.dispose();
    }
    CACHE.set(key, url);
    return url;
  };
  H.itemRenderClear = () => CACHE.clear();
