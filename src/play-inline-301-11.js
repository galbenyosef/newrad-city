// play-inline-301 11 — key
// Lines 2936-2942 of readable/play-inline-301.pretty.js (statement-aligned).
  P.LIFT = { journal_bldg: 7 }; // the pressroom (y −6) must stay ≥ 0
  P.I = (key) => {
    const o = G.LAYOUT.INTERIORS[key].origin;
    const l = P.LIFT[key] || 0;
    return l ? { x: o.x, y: (o.y || 0) + l, z: o.z } : o;
  };
  P.site_ = (id) => G.LAYOUT.getSite(id);
