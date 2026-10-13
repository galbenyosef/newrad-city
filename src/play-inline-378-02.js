// play-inline-378 02 — push
// Lines 14-39 of readable/play-inline-378.pretty.js (statement-aligned).
  const P = G._m3;

  P.onBuilt.push(() => {
    for (const it of P.interiors) it.root.visible = false;
  });
  P.onInitDone.push(() => {
    P.safe("voidGuard", () => {
      if (!G.poiVoidGuard) return;
      const doors = (G.world.doors || []).reduce((a, d) => {
        const f = d.def || d;
        if (f.pos) a.push(f.pos);
        if (f.target) a.push(f.target);
        return a;
      }, []);
      for (const it of P.interiors)
        G.poiVoidGuard(it.ox, it.oz, { parent: it.root, doors });
    });
  });
  P.preUpdate.push((pp) => {
    if (pp)
      for (const it of P.interiors) {
        const vis =
          Math.abs(pp.x - it.ox) < 170 && Math.abs(pp.z - it.oz) < 170;
        if (it.root.visible !== vis) it.root.visible = vis;
      }
  });
