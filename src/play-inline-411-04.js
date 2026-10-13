// play-inline-411 04 — ctx
// Lines 1166-1199 of readable/play-inline-411.pretty.js (statement-aligned).
  let blinkT = 0;
  function update(dt, realDt, ctx) {
    if (ctx.beacon && ctx.extRoot && ctx.extRoot.visible) {
      blinkT += realDt;
      const on = blinkT % 1.6 < 0.35;
      ctx.beacon.visible = on;
      ctx.beaconBulb.material.color.setHex(on ? 0xff3020 : 0x3a0a08);
    }
    if (PV.btUpdate) PV.btUpdate(dt, realDt, ctx);
  }

  PV.define({
    id: "bankers_trust",
    name: "Bankers Trust Building",
    interior: "bankers_trust",
    order: 20,
    build(ctx) {
      exterior(ctx);
      if (PV.btInterior) PV.btInterior(ctx);
    },
    data(ctx) {
      if (PV.btData) PV.btData(ctx);
    },
    spawn(ctx) {
      if (PV.btSpawn) PV.btSpawn(ctx);
    },
    reset(ctx) {
      if (PV.btReset) PV.btReset(ctx);
    },
    loaded(ctx) {
      if (PV.btLoaded) PV.btLoaded(ctx);
    },
    update,
  });
