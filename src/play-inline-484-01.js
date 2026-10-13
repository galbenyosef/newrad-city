// play-inline-484 01 — rads
// Lines 18-182 of readable/play-inline-484.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;

  // Sips: small heal, a few rads. Survival skill scales the heal like food.
  const KINDS = {
    river: { name: "Water", hp: 5, rads: 10, thirst: 60 },
    sink: { name: "Sink", hp: 6, rads: 6, thirst: 70 },
    faucet: { name: "Faucet", hp: 6, rads: 6, thirst: 70 },
    toilet: { name: "Toilet", hp: 5, rads: 8, thirst: 60 },
    fountain: { name: "Fountain", hp: 6, rads: 5, thirst: 70 },
    hydrant: { name: "Fire Hydrant", hp: 7, rads: 6, thirst: 80 },
    pump: { name: "Water Pump", hp: 10, rads: 3, thirst: 100 },
    purified: { name: "Purified Water Tap", hp: 12, rads: 0, thirst: 120 },
  };

  function drinkWater(kind, opts) {
    opts = opts || {};
    const P = G.player;
    if (!P || P.alive === false) return false;
    const k = KINDS[kind] || KINDS.river;
    const R = G.rpg;
    const sk = R.skill ? R.skill("survival") : 15;
    const hp = Math.round(
      (opts.hp !== undefined ? opts.hp : k.hp) * (1 + sk / 200),
    );
    const rads = opts.rads !== undefined ? opts.rads : k.rads;
    if (P.heal) P.heal(hp);
    if (rads > 0 && R.addRadsDirect) R.addRadsDirect(rads);
    try {
      const st = R._state();
      if (st.needs && st.needs.on)
        st.needs.water = Math.max(
          0,
          st.needs.water - (opts.thirst !== undefined ? opts.thirst : k.thirst),
        );
      st.stats.waterSips = (st.stats.waterSips || 0) + 1;
    } catch (e) {
      /* ignore */
    }
    G.sfx.play("drink", { volume: 0.8 });
    G.events.emit("drankWater", kind, { hp, rads });
    G.events.emit("effectsChanged");
    return true;
  }

  // ------------------------------------------------------------------
  // Registered fixtures
  // ------------------------------------------------------------------
  const sources = [];
  function registerWaterSource(o) {
    if (
      !o ||
      !o.pos ||
      !G.world ||
      typeof G.world.addInteractable !== "function"
    )
      return null;
    const kind = KINDS[o.kind] ? o.kind : "sink";
    const pos = o.pos.isVector3
      ? o.pos.clone()
      : new THREE.Vector3(o.pos.x || 0, o.pos.y || 0, o.pos.z || 0);
    const src = { kind, pos, it: null, removed: false };
    src.it = G.world.addInteractable({
      pos,
      radius: o.radius || 0.55,
      priority: o.priority !== undefined ? o.priority : 0.3,
      range: o.range || 2.2,
      label: o.name || KINDS[kind].name,
      verb: "Drink",
      enabled: typeof o.enabled === "function" ? o.enabled : undefined,
      onInteract: () => drinkWater(kind),
    });
    src.remove = () => {
      if (src.removed) return;
      src.removed = true;
      try {
        G.world.removeInteractable(src.it);
      } catch (e) {
        /* ignore */
      }
      const i = sources.indexOf(src);
      if (i >= 0) sources.splice(i, 1);
    };
    sources.push(src);
    return src;
  }

  // ------------------------------------------------------------------
  // Open water (rivers / harbour): one interactable that follows the gaze
  // ------------------------------------------------------------------
  const riverPos = new THREE.Vector3();
  let riverOk = false,
    riverName = "Water";
  function waterName(x, z) {
    const L = G.LAYOUT;
    try {
      if (L.isManhattan(x + 160, z) || L.isManhattan(x + 320, z))
        return "Hudson River";
      if (L.isManhattan(x - 160, z) || L.isManhattan(x - 320, z))
        return "East River";
    } catch (e) {
      /* ignore */
    }
    return "Upper New York Bay";
  }
  let tRiver = 0;
  function updateRiver(realDt) {
    tRiver -= realDt;
    if (tRiver > 0) return;
    tRiver = 0.15;
    riverOk = false;
    const P = G.player,
      L = G.LAYOUT,
      W = G.world;
    if (
      !P ||
      !L ||
      !W ||
      ((P.fly || P.noclip) && !G.SHOT) ||
      G.state !== "play"
    )
      return;
    if (L.isInterior && L.isInterior(P.pos.x)) return;
    const wl = W.waterLevel !== undefined ? W.waterLevel : -1.2;
    if (P.pos.y - wl > 3.2) return; // too high above the water (bridges, tall piers)
    const f = P.forward || null;
    let fx = f ? f.x : -Math.sin(P.yaw || 0),
      fz = f ? f.z : -Math.cos(P.yaw || 0);
    const fl = Math.hypot(fx, fz) || 1;
    fx /= fl;
    fz /= fl;
    const reach = P.inWater || P.swimming ? 1.1 : 2.0;
    const x = P.pos.x + fx * reach,
      z = P.pos.z + fz * reach;
    if (L.isLand(x, z)) return;
    if (W.terrainHeight && W.terrainHeight(x, z) >= wl) return;
    riverPos.set(x, wl + 0.05, z);
    riverName = waterName(x, z);
    riverOk = true;
  }
  let riverIt = null;
  function ensureRiver() {
    if (riverIt || !G.world || typeof G.world.addInteractable !== "function")
      return;
    riverIt = G.world.addInteractable({
      getPos: () => (riverOk ? riverPos : null),
      radius: 1.3,
      priority: -0.5,
      range: 3.2,
      label: () => riverName,
      verb: "Drink",
      enabled: () => riverOk,
      onInteract: () => drinkWater("river"),
    });
  }

  G.rpg.drinkWater = drinkWater;
  G.rpg.registerWaterSource = registerWaterSource;
  G.rpg.waterSources = () => sources.slice();
  G.rpg.WATER_KINDS = KINDS;
  G.rpg._waterUpdate = function (realDt) {
    ensureRiver();
    updateRiver(realDt);
  };
