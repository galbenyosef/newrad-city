// play-inline-390 04 — flick
// Lines 2392-2407 of readable/play-inline-390.pretty.js (statement-aligned).
  let t = 0,
    flick = 1,
    nextF = 0;
  PV.hoInteriorUpdate = function (dt, realDt, ctx) {
    if (!ctx.inside || !ctx.neonMesh) return;
    t += realDt;
    if (t > nextF) {
      flick = Math.random() < 0.18 ? 0.15 + Math.random() * 0.3 : 1;
      nextF =
        t +
        (flick < 1 ? 0.05 + Math.random() * 0.12 : 0.4 + Math.random() * 2.5);
    }
    const m = ctx.neonMesh.material;
    m.opacity = flick;
    m.color.setScalar(flick);
  };
