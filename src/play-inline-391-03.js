// play-inline-391 03 — ctx
// Lines 367-400 of readable/play-inline-391.pretty.js (statement-aligned).
  G.events.on("reset", () => {
    clearLoot();
    PV.state = DEFAULT_STATE();
    for (const ctx of CTX) {
      ctx.actors = [];
      for (const D of ctx.swingDoors || []) K.safe("door reset", D.reset);
      if (ctx.def.reset) K.safe("reset " + ctx.id, () => ctx.def.reset(ctx));
    }
  });
  G.save.register("poi_penn", {
    save: () => JSON.parse(JSON.stringify(PV.state)),
    load: (d) => {
      PV.state = Object.assign(DEFAULT_STATE(), d || {});
      for (const ctx of CTX)
        if (ctx.def.loaded) K.safe("load " + ctx.id, () => ctx.def.loaded(ctx));
    },
  });
  PV.state = DEFAULT_STATE();
  /** Per-POI persistent flag helpers. */
  PV.flag = (k) => PV.state[k];
  PV.setFlag = (k, v) => {
    PV.state[k] = v;
  };

  G.registerModule({
    name: "poi_penn",
    order: 29,
    init() {
      const t0 = performance.now();
      buildAll();
      PV.initMs = Math.round(performance.now() - t0);
    },
    update,
  });
