// play-inline-145 02 — anchors
// Lines 15-67 of readable/play-inline-145.pretty.js (statement-aligned).
  const LB = G._lb;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  LB.interiors.belvedere = {
    /** ctx: {anchors, H0 (hall floor)}; ctx.b = the landmark batch (the hall shares it). */
    hall(ctx) {
      const { anchors, H0, b } = ctx;
      b.boxMM("planks", -30, H0, -711, -26, H0 + 0.9, -709.5, { seg: false });
      LB.colMM(-30, H0, -711, -26, H0 + 0.9, -709.5, { walkable: false });
      b.cyl("chrome", -28.5, H0 + 0.9, -710.2, 0.3, 0.35, 0.45, 10, {
        hSeg: 1,
      });
      b.cyl("glass_dark", -27.2, H0 + 0.9, -710.2, 0.15, 0.15, 0.7, 8, {
        hSeg: 1,
      });
      b.box("iron", -17.5, H0 + 0.4, -710, 2.0, 0.1, 0.9, { seg: false });
      b.box("fabric", -17.5, H0 + 0.5, -710, 1.9, 0.15, 0.85, { seg: false });
      for (let i = 0; i < 5; i++)
        b.sphere("bone", -20 + i * 0.4, H0 + 0.15, -708 + (i % 2) * 0.5, 0.18, {
          sx: 1.6,
          sy: 0.6,
        });
      anchors.interior = LB.anchor(-23, H0, -706, 0);
      anchors.terminal = LB.anchor(-28.5, H0, -708.6, 0);
    },
    spawn(ctx) {
      const { anchors, H0 } = ctx;
      anchors.spawn3 = V(-25, H0, -705);
    },
    finish(ctx) {
      const { anchors, H0 } = ctx;
      anchors.boss = anchors.interior.clone();
      anchors.note1 = LB.anchor(-25.5, H0, -707.6, 0); // on the floor by the weather desk (quests: ranger's log)
      anchors.loot1 = LB.anchor(-16, H0, -707.4, Math.PI); // the footlocker
      LB.onReady.push(() => {
        LB.spawnProp("terminal", {
          x: -28.5,
          y: H0 + 0.9,
          z: -710.2,
          yaw: 0,
          terminalId: "belvedere_weather",
        });
        LB.spawnProp("footlocker", {
          x: -16,
          y: H0,
          z: -708.5,
          yaw: Math.PI,
          loot: "footlocker",
          name: "Park Ranger Footlocker",
        });
      });
    },
  };
