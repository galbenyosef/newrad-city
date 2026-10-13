// play-inline-318 03 — ctx
// Lines 367-399 of readable/play-inline-318.pretty.js (statement-aligned).
  G.events.on("reset", () => {
    clearLoot();
    PH.state = DEFAULT_STATE();
    for (const ctx of CTX) {
      ctx.actors = [];
      if (ctx.def.reset) K.safe("reset " + ctx.id, () => ctx.def.reset(ctx));
    }
  });
  G.save.register("poi_herald", {
    save: () => JSON.parse(JSON.stringify(PH.state)),
    load: (d) => {
      PH.state = Object.assign(DEFAULT_STATE(), d || {});
      for (const ctx of CTX)
        if (ctx.def.loaded) K.safe("load " + ctx.id, () => ctx.def.loaded(ctx));
    },
  });
  PH.state = DEFAULT_STATE();
  /** Per-POI persistent flag helpers. */
  PH.flag = (k) => PH.state[k];
  PH.setFlag = (k, v) => {
    PH.state[k] = v;
  };

  G.registerModule({
    name: "poi_herald",
    order: 29,
    init() {
      const t0 = performance.now();
      buildAll();
      PH.initMs = Math.round(performance.now() - t0);
    },
    update,
  });
