// play-inline-454 10 — templates
// Lines 2597-2647 of readable/play-inline-454.pretty.js (statement-aligned).
  L.getTemplate = function (key, buildFn) {
    let t = L.templates.get(key);
    if (t) {
      L.templates.delete(key);
      L.templates.set(key, t);
      return t;
    } // bump to most-recent
    t = buildFn();
    t.users = 0;
    t.key = key;
    L.templates.set(key, t);
    if (L.templates.size > L.MAX_TEMPLATES) L.evictTemplates();
    return t;
  };
  L.disposeTemplate = function (t) {
    const seen = new Set();
    for (const g of [t.geometry].concat(t.lods || []))
      if (g && !seen.has(g)) {
        seen.add(g);
        g.dispose();
      }
    for (const list of t.perBone || []) for (const g of list) g.dispose();
    if (L.faceTexDrop) {
      try {
        L.faceTexDrop(t);
      } catch (e) {
        /* ignore */
      }
    }
    if (t.faceTex) {
      try {
        t.faceTex.dispose();
      } catch (e) {
        /* ignore */
      }
      t.faceTex = null;
    }
    t.disposed = true;
  };
  L.evictTemplates = function () {
    for (const [k, t] of L.templates) {
      if (L.templates.size <= L.MAX_TEMPLATES) break;
      if (t.users > 0) continue;
      L.templates.delete(k);
      L.disposeTemplate(t);
    }
  };

  // Builders register here: L.builders[type] = (opts, rng) → {tpl, info}
  L.builders = {};
  L.infos = {};
