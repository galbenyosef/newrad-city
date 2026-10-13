// play-inline-438 07 — ctx
// Lines 1372-1416 of readable/play-inline-438.pretty.js (statement-aligned).
  function dataOnce() {
    if (dataDone) return;
    dataDone = true;
    K.safe("items", items);
    K.safe("quests", quests);
    K.safe("terminals", terminals);
    K.safe("dialogues", dialogues);
    K.safe("hooks", worldHooks);
  }
  PK.define({
    id: "cp_zoo_arsenal",
    name: "Central Park Zoo & Arsenal",
    interior: "cp_zoo_arsenal",
    order: 10,
    lift: 5.0,
    build(ctx) {
      PK.EXT.zoo(ctx);
      PK.INT.zoo(ctx);
    },
    data: dataOnce,
    spawn: spawnZoo,
    update: updateAll,
    reset(ctx) {
      clockT = 0;
      lastHour = -1;
      if (ctx.foodGroup) ctx.foodGroup.visible = false;
      if (ctx.clockRing) ctx.clockRing.rotation.y = 0;
    },
  });
  PK.define({
    id: "tavern_on_green",
    name: "Tavern on the Green",
    interior: "tavern_on_green",
    order: 20,
    lift: 3.6,
    build(ctx) {
      PK.EXT.tavern(ctx);
      PK.INT.tavern(ctx);
    },
    data: dataOnce,
    spawn(ctx) {
      spawnTavern(ctx);
      spawnTavernOutside(ctx);
    },
  });
