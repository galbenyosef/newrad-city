/* src/poi_midtown3/90_main_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI MIDTOWN 3 · 90 module registration — interior
 *   init      interior roots start hidden
 *   initDone  void guard on both interior cells (95_voidguard_interior.js)
 *   update    interior roots visible only while the player is inside their
 *             cell (±170 m)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._m3) return;
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
})();
