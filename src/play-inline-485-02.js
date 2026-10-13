// play-inline-485 02 — rpg
// Lines 335-429 of readable/play-inline-485.pretty.js (statement-aligned).
  G.registerModule({
    name: "rpg",
    order: 40,
    init() {
      // Warm the most common pickup geometries so the first loot drop doesn't hitch.
      try {
        ["rally_tonic", "scrip", "fizzo_cola", "golden_plain_jerky"].forEach(
          (id) => G.items.createItemModel(id),
        );
      } catch (e) {
        /* ignore */
      }
    },
    update(dt, realDt) {
      G.items._pickupsUpdate(realDt);
      if (G.rpg.merchants && G.state !== "menu")
        G.rpg.merchants._update(realDt);
      if (G.rpg._talentHooksUpdate && G.state === "play")
        G.rpg._talentHooksUpdate(realDt);
      if (G.rpg._waterUpdate) {
        try {
          G.rpg._waterUpdate(realDt);
        } catch (e) {
          G.reportError("rpg:water", e);
          G.rpg._waterUpdate = null;
        }
      }
      if (dt <= 0) return;
      const rpg = R();
      rpg._updateEffects(dt);
      if (rpg._updateSway) rpg._updateSway(dt);
      rpg._updateNeeds(dt);
      timers.rad -= dt;
      timers.addict -= dt;
      timers.enc -= dt;
      timers.corpses -= dt;
      if (timers.rad <= 0) {
        timers.rad = 0.5;
        rpg._checkRadTier();
      }
      if (timers.enc <= 0) {
        timers.enc = 0.5;
        const over = rpg.isOverencumbered();
        if (over && !wasOver)
          G.notify("You are carrying too much to be able to run.", {
            kind: "encumbrance",
          });
        if (over !== wasOver) G.events.emit("effectsChanged");
        wasOver = over;
      }
      if (timers.addict <= 0) {
        timers.addict = 5;
        rpg._updateAddictions();
      }
      if (timers.corpses <= 0) {
        timers.corpses = 10;
        try {
          G.containers.pruneCorpses();
        } catch (e) {
          G.reportError("rpg:pruneCorpses", e);
        }
      }
    },
  });

  // Developer helpers (console): G.rpg.dev.giveAll(), .level(10), .kit()
  G.rpg.dev = {
    level(n) {
      const need = R().xpForLevel(n) - R().xp;
      if (need > 0) R().addXP(need, "dev");
      return R().level;
    },
    giveAll(type) {
      for (const d of G.items.all())
        if (!type || d.type === type)
          if (!d.medallion)
            G.inventory.add(d.id, d.type === "ammo" ? 50 : 1, { silent: true });
      return G.inventory.list().length;
    },
    skills(n) {
      for (const k of R().SKILLS)
        R().boostSkill(k, n === undefined ? 100 : n, "silent");
      return R().skills;
    },

    kit() {
      giveStartingKit({});
    },
    roll(table, level) {
      return G.items
        .rollLoot(table, level || R().level)
        .map((e) => e[0] + " x" + e[1])
        .join(", ");
    },
  };
