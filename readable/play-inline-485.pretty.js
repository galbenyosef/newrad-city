/* src/rpg/90_module.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — REGISTRATION, EVENT HOOKS,
 * STARTING KIT, SAVE/LOAD
 *
 * XP sources hooked here: locationDiscovered, actorKilled, questCompleted,
 * lockOpened / terminalUnlocked, speechCheck/skillCheck. Quest rewards are
 * paid by the quest engine itself (rpg only pays when q.rpgPaysRewards).
 * Skill practice (use-based growth) is fed from the same events: hits and
 * kills (Firearms / Melee / Explosives), aid (Medicine / Survival), repairs
 * and crafting (Mechanics / Survival), checks (Persuasion), trades (Trade),
 * exploring (Survival). Electronics grows through G.rpg.practice calls made
 * by the keypad / terminal screens.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;

  const R = () => G.rpg;
  let timers = { rad: 0, addict: 0, enc: 0, corpses: 10 };
  let wasOver = false;
  let firstReset = true;

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  function killerIsPlayer(killer) {
    if (!killer) return false;
    if (killer === "player" || killer === G.player) return true;
    if (
      typeof killer === "object" &&
      (killer.isPlayer ||
        killer.from === "player" ||
        killer.source === "player" ||
        killer.id === "player")
    )
      return true;
    return false;
  }
  /**
   * Was this (now dead) actor attacking the player on its own account? hostile() is false once
   * dead, so look at what survives death: a hostility override/frenzy, an active fight with the
   * player, or a faction at war with the player — but never if the player threw the first punch
   * (tracked by G.rpg's actorDamaged hook as _rpgPlayerStarted).
   */
  function wasAggressor(a) {
    if (!a || a._rpgPlayerStarted) return false;
    if (a._rpgSeenHostile || a.frenzied || a.hostOverride === true) return true;
    if (a.target === "player" && (a.inCombat || a.state === "combat"))
      return true;
    try {
      if (
        !G.isStub("combat") &&
        G.combat.relation &&
        G.combat.relation(a.faction, "player") === "hostile"
      )
        return true;
    } catch (e) {
      /* ignore */
    }
    return false;
  }

  // ------------------------------------------------------------------
  // Lifecycle events
  // ------------------------------------------------------------------
  G.events.on("reset", () => {
    if (firstReset) {
      firstReset = false;
      if (G.items._endInitPhase) G.items._endInitPhase();
    }
    R()._reset();
    G.inventory._reset();
    G.containers._reset();
    G.items._pickupsReset();
    wasOver = false;
    timers = { rad: 0, addict: 0, enc: 0, corpses: 10 };
  });

  G.events.on("newGame", (opts) => {
    opts = opts || {};
    const rpg = R();
    if (opts.attrs) rpg.setAttrs(opts.attrs);
    if (opts.difficulty) rpg.setDifficulty(opts.difficulty);
    if (opts.hardcore) rpg.setHardcore(true);
    giveStartingKit(opts);
    const P = G.player;
    rpg._recalc(true);
    if (P) {
      P.maxHp = rpg.maxHp();
      P.hp = P.maxHp;
      P.maxStamina = rpg.maxStamina();
      P.stamina = P.maxStamina;
    }
    G.events.emit("standingChanged", rpg.standing, 0, "newGame");
    G.events.emit("effectsChanged");
  });

  /** Cryo Unit C-9 wake-up kit. The weapons module supplies the service pistol definition. */
  function giveStartingKit(opts) {
    const inv = G.inventory;
    const s = { silent: true };
    inv.add("cryo_suit", 1, s);
    inv.equip("cryo_suit", s);
    // With the quest module present the VIGIL goggles (and a sidearm) are found in the
    // cryo lab as part of the opening. Without it, hand them out immediately.
    const story = !G.isStub("quests") && !opts.fullKit;
    if (!story) {
      inv.add("vigil_goggles", 1, s);
      inv.equip("vigil_goggles", s);
    }
    inv.add("rally_tonic", 3, s);
    inv.add("scrip", 32, s);
    inv.add("cinnamon_bun", 1, s);
    inv.add("fizzo_cola", 1, s);
    inv.add("iodine_tabs", 1, s);
    if (!opts.noStartWeapon && (!story || opts.startWeapon)) {
      const wid =
        opts.startWeapon ||
        ["winter_service_pistol", "pistol_10mm"].find((id) => G.items.get(id));
      const wdef = wid ? G.items.get(wid) : null;
      if (wdef && !inv.has(wid)) {
        inv.add(wid, 1, { silent: true, cond: 0.85 });
        const ammo = G.items.ammoFor(wdef);
        if (ammo && inv.count(ammo) < 24) inv.add(ammo, 36, s);
        inv.equip(wid, s);
      }
    }
  }

  // The quest module hands out its own story item for the goggles; fold it into the
  // real equippable VIGIL goggles so there is only ever one pair.
  G.events.on("itemAdded", (id) => {
    if (id !== "q_vigil_goggles") return;
    G.inventory.remove(id, G.inventory.count(id));
    if (!G.inventory.has("vigil_goggles"))
      G.inventory.add("vigil_goggles", 1, { silent: true });
    G.inventory.equip("vigil_goggles", { silent: true });
  });

  G.events.on("loaded", () => {
    R()._recalc(true);
    G.inventory._syncWeapon();
    G.events.emit("inventoryChanged");
    G.events.emit("effectsChanged");
    G.events.emit("standingChanged", R().standing, 0, "loaded");
  });

  // ------------------------------------------------------------------
  // XP sources
  // ------------------------------------------------------------------
  G.events.on("locationDiscovered", (l) => {
    if (!l || l.id === "cryo_c9") return;
    R().bumpStat("locations");
    R().practice("survival", 1.5, "explore");
    const base = l.type === "settlement" ? 15 : l.type === "landmark" ? 20 : 25;
    R().addXP(base + Math.round((l.level || 1) * 1.5), "Discovered " + l.name);
  });

  G.events.on("actorKilled", (actor, killer) => {
    if (!actor) return;
    const byPlayer = killerIsPlayer(killer);
    const rpg = R();
    const type = actor.type || (actor.def && actor.def.type) || "human";
    if (byPlayer) {
      const st = rpg._state().stats;
      st.kills[type] = (st.kills[type] || 0) + 1;
      st.totalKills++;
      const cls = rpg.classifyTarget(actor) || {};
      if (cls.robot) st.robotKills++;
      else if (cls.creature) st.creatureKills++;
      else st.humanKills++;
      const ws = actor._rpgLastSkill || null;
      if (ws) rpg.practice(ws, 1, "kill");
      const lvl = Math.max(
        1,
        actor.level || (actor.def && actor.def.level) || 1,
      );
      const base =
        actor.xp || (actor.def && actor.def.xp) || rpg.KILL_XP[type] || 10;
      rpg.addXP(Math.round(base * (1 + (lvl - 1) * 0.12)), "");
      try {
        actor._rpgKilledByPlayer = true;
      } catch (e) {
        /* ignore */
      }
      // Standing. An explicit actor/def standing value wins (positive = killing them was a good deed).
      // Otherwise killing a bystander is murder, unless they were already fighting you and you
      // didn't start it (self-defence costs nothing).
      let kd =
        actor.standing !== undefined
          ? actor.standing
          : actor.def && actor.def.standing;
      const fac = actor.faction;
      if (typeof kd === "number" && kd !== 0) {
        if (kd > 0 || !wasAggressor(actor)) rpg.addStanding(kd, "kill");
      } else if (
        rpg.INNOCENT_FACTIONS[fac] &&
        !(actor.def && (actor.def.hostile === true || actor.def.evil)) &&
        !wasAggressor(actor)
      ) {
        st.murders++;
        rpg.addStanding(-25, "murder");
      }
    }
  });
  function skillOfHit(info) {
    if (!info) return null;
    if (info.type === "explosive" || info.explosive) return "explosives";
    const wid = info.weaponId || (info.weapon && info.weapon.id);
    const sk = wid ? G.rpg.weaponSkill(wid) : null;
    if (sk) return sk;
    return info.type === "melee" ? "melee" : "firearms";
  }
  // Fight-starter tracking (see 30_rpg_core onActorDamaged) + practice from landed hits
  G.events.on("actorDamaged", (a, dmg, info) => {
    R()._onActorDamaged(a, dmg, info);
    if (
      !a ||
      !info ||
      (info.source !== "player" && info.source !== G.player) ||
      !(dmg > 0)
    )
      return;
    const sk = skillOfHit(info);
    if (!sk) return;
    try {
      a._rpgLastSkill = sk;
    } catch (e) {
      /* ignore */
    }
    R().practice(
      sk,
      sk === "melee" ? 0.3 : sk === "explosives" ? 0.35 : 0.15,
      "hit",
    );
    if (info.sneak) {
      R().practice("stealth", 1.5, "sneak attack");
      R().bumpStat("sneakAttacks");
    }
    if (info.crit) R().bumpStat("criticalHits");
  });
  G.events.on("weaponRepaired", () => R().practice("mechanics", 2, "repair"));
  G.events.on("vendorRepaired", () =>
    R().practice("trade", 0.5, "repair deal"),
  );
  G.events.on("itemCrafted", (id) => {
    const d = G.items.get(typeof id === "object" && id ? id.id : id);
    const food =
      d &&
      d.type === "aid" &&
      (d.tags.indexOf("food") >= 0 || d.tags.indexOf("drink") >= 0);
    R().practice(food ? "survival" : "mechanics", 1.5, "craft");
  });
  G.events.on("weaponModded", () => R().practice("mechanics", 1.5, "mod"));
  // (Trade practice comes from the barter screen itself: G.rpg.useSkill('trade', …))
  G.events.on("drankWater", () => R().practice("survival", 0.15, "water"));
  G.events.on("codeLearned", () => R().practice("electronics", 0.3, "code"));

  // The quest engine pays out q.rewards itself (XP via G.rpg.addXP). rpg only keeps
  // statistics — unless a quest explicitly asks rpg to pay (q.rpgPaysRewards = true).
  G.events.on("questCompleted", (q) => {
    if (!q) return;
    R().bumpStat("questsCompleted");
    if (!q.rpgPaysRewards || q._rpgRewarded) return;
    q._rpgRewarded = true;
    const rw = q.rewards || {};
    if (rw.xp) R().addXP(rw.xp, q.name ? "Quest: " + q.name : "Quest");
    const sc = rw.scrip;
    if (sc) G.inventory.addScrip(sc);
    if (Array.isArray(rw.items))
      for (const e of rw.items) {
        if (Array.isArray(e)) G.inventory.add(e[0], e[1] || 1);
        else if (typeof e === "string") G.inventory.add(e, 1);
        else if (e && e.id) G.inventory.add(e.id, e.count || e.n || 1);
      }
    const sd = rw.standing;
    if (sd) R().addStanding(sd, "quest");
    const tal = rw.talent;
    if (tal) R().grantTalent(tal);
  });

  G.events.on("lockOpened", (info) => {
    if (info && typeof info === "object" && info.byKey) return;
    R().addXP(5, "Lock opened");
  });
  G.events.on("terminalUnlocked", () => {
    R().addXP(8, "Terminal unlocked");
  });
  function onCheck(info) {
    if (!info) return;
    const ok = info.success !== undefined ? info.success : info.passed;
    const sk = info.skill ? G.rpg.skillName(info.skill) : "";
    const persuade =
      !info.skill || G.rpg.skillName(info.skill) === "Persuasion";
    if (ok) {
      R().bumpStat("checksPassed");
      R().addXP(
        10 + Math.round((info.value || info.need || 0) / 5),
        sk ? sk + " check" : "Check passed",
      );
      if (persuade) R().practice("persuasion", 2, "check");
    } else {
      R().bumpStat("checksFailed");
      if (persuade) R().practice("persuasion", 0.6, "check");
    }
  }
  G.events.on("skillCheck", onCheck);

  // ------------------------------------------------------------------
  // Save / load
  // ------------------------------------------------------------------
  G.save.register("rpg", {
    save: () => ({
      rpg: R()._serialize(),
      inv: G.inventory._serialize(),
      containers: G.containers._serialize(),
      pickups: G.items._pickupsSerialize(),
      merchants: G.rpg.merchants ? G.rpg.merchants._serialize() : null,
    }),
    load: (d) => {
      if (!d) return;
      R()._deserialize(d.rpg);
      G.inventory._deserialize(d.inv);
      G.containers._deserialize(d.containers);
      G.items._pickupsDeserialize(d.pickups);
      if (G.rpg.merchants) G.rpg.merchants._deserialize(d.merchants || null);
      R()._recalc(true);
    },
  });

  // ------------------------------------------------------------------
  // Module registration
  // ------------------------------------------------------------------
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
})();
