// play-inline-148 11 — pois
// Lines 3346-3404 of readable/play-inline-148.pretty.js (statement-aligned).
  P.register = function (id, rec) {
    if (!G.pois || G.pois.__stub) G.pois = {};
    G.pois[id] = Object.assign({ id, owner: "poi_uptown" }, rec);
    if (typeof G.pois.getAnchor !== "function") {
      G.pois.getAnchor = function (idOrKey, name) {
        const scan = (p) => {
          if (!p || typeof p !== "object" || !p.anchors) return null;
          const v = p.anchors[name];
          if (!v) return null;
          const c = v.clone();
          c.yaw = v.yaw || 0;
          return c;
        };
        const direct = G.pois[idOrKey];
        const a = scan(direct);
        if (a) return a;
        for (const k in G.pois) {
          const p = G.pois[k];
          if (
            p &&
            typeof p === "object" &&
            (p.interiorKey === idOrKey || p.id === idOrKey)
          ) {
            const r = scan(p);
            if (r) return r;
          }
        }
        return null;
      };
    }
    return G.pois[id];
  };
  P.anchor = (poiId, name) => {
    const p = G.pois && G.pois[poiId];
    const v = p && p.anchors ? p.anchors[name] : null;
    if (!v) return null;
    const c = v.clone();
    c.yaw = v.yaw || 0;
    return c;
  };
  /** Interior root visibility registry. */
  P.addInterior = function (key, root) {
    const o = G.LAYOUT.INTERIORS[key].origin;
    P.interiors.push({ key, root, ox: o.x, oz: o.z });
  };
  P.animate = function (x, z, r, fn) {
    P.animators.push({ c: { x, z }, r2: r * r, fn });
  };
  P.inCell = function (key, pos) {
    const I = G.LAYOUT.INTERIORS[key];
    if (!I) return false;
    pos = pos || (G.player && G.player.pos);
    if (!pos) return false;
    return (
      Math.abs(pos.x - I.origin.x) < 170 && Math.abs(pos.z - I.origin.z) < 170
    );
  };
  P.I = (key) => G.LAYOUT.INTERIORS[key].origin;
  P.site_ = (id) => G.LAYOUT.getSite(id);
