// play-inline-369 11 — key
// Lines 3208-3214 of readable/play-inline-369.pretty.js (statement-aligned).
  P.LIFT = { club_52: 5 }; // the basement / wine cellar (y −4) must stay ≥ 0
  P.I = (key) => {
    const o = G.LAYOUT.INTERIORS[key].origin;
    const l = P.LIFT[key] || 0;
    return l ? { x: o.x, y: (o.y || 0) + l, z: o.z } : o;
  };
  P.site_ = (id) => G.LAYOUT.getSite(id);
