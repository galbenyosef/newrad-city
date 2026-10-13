// play-inline-196 03 — ctx
// Lines 368-392 of readable/play-inline-196.pretty.js (statement-aligned).
  G.save.register("poi_village", {
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
    name: "poi_village",
    order: 27,
    init() {
      const t0 = performance.now();
      buildAll();
      PV.initMs = Math.round(performance.now() - t0);
    },
    update,
  });
