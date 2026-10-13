// play-inline-402 07 — ctx
// Lines 1598-1651 of readable/play-inline-402.pretty.js (statement-aligned).
  PV.define({
    id: "jefferson_market",
    name: "Jefferson Market Courthouse",
    interior: "jefferson_market",
    order: 10,
    lift: 5,
    build(ctx) {
      PV.EXT.jm(ctx);
      PV.INT.jm(ctx);
    },
    data: dataOnce,
    spawn: spawnJM,
    update: updateAll,
    reset() {
      setCellOpen(false);
    },
  });
  PV.define({
    id: "bedfords",
    name: "Bedford's",
    interior: "bedfords",
    order: 20,
    lift: 4,
    build(ctx) {
      PV.EXT.ch(ctx);
      PV.INT.ch(ctx);
    },
    data: dataOnce,
    spawn: spawnCH,
  });
  PV.define({
    id: "five_boro_tower",
    name: "Five Boroughs Tower of Light",
    interior: "five_boro_tower",
    order: 30,
    lift: 7,
    build(ctx) {
      PV.EXT.ce(ctx);
      PV.INT.ce(ctx);
    },
    data: dataOnce,
    spawn: spawnCE,
    reset(ctx) {
      if (ctx.regulatorGroup) ctx.regulatorGroup.visible = true;
      if (ctx.lensGroup) ctx.lensGroup.visible = false;
    },
  });
  // saves from before the main story: mirror the Tower of Light's mode into the main-story flag
  G.events.on("loaded", () =>
    setTimeout(() => {
      const m = PV.flag("ce_mode");
      if (m && !K.qflag("ms_tower_light")) K.setQFlag("ms_tower_light", m);
    }, 0),
  );
