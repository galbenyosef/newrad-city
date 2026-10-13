// play-inline-629 03 — tofixed
// Lines 315-394 of readable/play-inline-629.pretty.js (statement-aligned).
  function draw(realDt) {
    if (!on || !el) return;
    acc += realDt;
    frames++;
    worst = Math.max(worst, realDt);
    if (acc < 0.5) return;
    const fps = frames / acc,
      s = R.stats,
      r = G.renderer;
    let scale = 1;
    try {
      scale = G.atmos.renderScale ? G.atmos.renderScale() : 1;
    } catch (e) {
      /* ignore */
    }
    el.textContent =
      "FPS " +
      fps.toFixed(0) +
      "  worst " +
      (worst * 1000).toFixed(0) +
      " ms\n" +
      "calls " +
      r.info.render.calls +
      "  tris " +
      (r.info.render.triangles / 1e6).toFixed(2) +
      "M\n" +
      "units " +
      s.units +
      "  hidden occ " +
      s.hidden.occ +
      " size " +
      s.hidden.size +
      " int " +
      s.hidden.int +
      " dist " +
      s.hidden.dist +
      "\n" +
      "occluders " +
      s.rasterOccluders +
      "/" +
      s.occluders +
      "  cull " +
      (s.cullAvg || 0).toFixed(2) +
      " ms (occ " +
      (s.occMs || 0).toFixed(2) +
      ")\n" +
      (R.hlod
        ? "hlod " +
          R.hlod.stats.shown +
          "/" +
          R.hlod.stats.far +
          " far of " +
          R.hlod.stats.ready +
          " cells  D " +
          R.hlod.stats.D +
          " m\n"
        : "") +
      "quality " +
      (RP.getQuality ? RP.getQuality() : "?") +
      "  px " +
      r.getPixelRatio().toFixed(2) +
      "  scale " +
      scale.toFixed(2) +
      "  programs " +
      (r.info.programs ? r.info.programs.length : 0);
    acc = 0;
    frames = 0;
    worst = 0;
  }

  R.addSystem({
    name: "overlay",
    order: 90,
    init() {
      if (R.QS.get("perf") === "1" || R.opts.debug) RP.overlay(true);
    },
    update(dt, realDt) {
      draw(realDt || 0);
    },
  });
