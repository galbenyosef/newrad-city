// play-inline-351 03 — state
// Lines 373-396 of readable/play-inline-351.pretty.js (statement-aligned).
  G.save.register("poi_civic", {
    save: () => JSON.parse(JSON.stringify(PC.state)),
    load: (d) => {
      PC.state = Object.assign(DEFAULT_STATE(), d || {});
      for (const ctx of CTX) each(ctx, "loaded");
    },
  });
  PC.state = DEFAULT_STATE();
  /** Persistent flag helpers. */
  PC.flag = (k) => PC.state[k];
  PC.setFlag = (k, v) => {
    PC.state[k] = v;
  };

  G.registerModule({
    name: "poi_civic",
    order: 29,
    init() {
      const t0 = performance.now();
      buildAll();
      PC.initMs = Math.round(performance.now() - t0);
    },
    update,
  });
