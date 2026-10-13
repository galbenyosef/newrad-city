// play-inline-481 05 — actor
// Lines 1203-1540 of readable/play-inline-481.pretty.js (statement-aligned).
  const TYPE_LOOT = {
    raider: "raider",
    human: "settler",
    maniac: "maniac",
    maniac_bruiser: "maniac_bruiser",
    brute: "brute",
    colossus: "colossus",
    ripjaw: "ripjaw",
    giant_roach: "giant_roach",
    burrow_rat: "burrow_rat",
    gasfly: "gasfly",
    shellback: "shellback",
    shellback_matriarch: "shellback_matriarch",
    dog: "dog",
    patrolman: "patrolman",
    valet: "valet",
    valet_m: "valet",
    sky_eye: "sky_eye",
    bulwark: "bulwark",
    continuity_soldier: "continuity_soldier",
    covenant_warden: "covenant_warden",
  };
  const FACTION_LOOT = {
    raiders: "raider",
    continuity: "continuity",
    covenant: "covenant",
    settlers: "settler",
    brutes: "brute",
    robots: "robot",
    maniacs: "maniac",
    creatures: "creature",
  };
  // Outfit worn by an NPC → apparel item dropped on the corpse
  const OUTFIT_ITEM = {
    raider: ["raider_spiked_leathers", "raider_duster", "raider_scrap_plate"],
    raider_heavy: ["raider_chain_harness", "metal_armor"],
    settler: ["patched_workwear", "old_world_casualwear"],
    drifter: ["biker_leathers", "hired_gun_fatigues", "drifter_coat"],
    merchant: ["merchant_outfit"],
    doctor: ["doctor_scrubs"],
    combat_armor: ["combat_armor"],
    leather_armor: ["leather_armor"],
    survivor_layers: ["survivor_layers"],
    glowkeeper_robes: ["glowkeeper_robes"],
    lab_coat: ["lab_coat"],
    cryo_suit: ["cryo_suit"],
    director_suit: ["director_suit"],
    covenant_exo_rig: ["exo_rig_mk1"],
    continuity_exo_rig: ["exo_rig_mk3"],
    dj: ["old_world_formalwear"],
  };
  const CREATURE_TYPES =
    /roach|burrow_rat|gasfly|shellback|ripjaw|dog|hound|ash_bear|stinger|coyote|pack_ox/;

  function actorInventoryEntries(inv) {
    const out = [];
    if (!inv) return out;
    if (inv instanceof Map) {
      for (const [id, n] of inv)
        out.push([id, typeof n === "object" ? n.count || 1 : n]);
      return out;
    }
    if (Array.isArray(inv)) {
      for (const e of inv) {
        if (Array.isArray(e)) out.push([e[0], e[1] || 1, e[2]]);
        else if (e && e.id) out.push([e.id, e.count || e.n || 1, e.condition]);
        else if (typeof e === "string") out.push([e, 1]);
      }
      return out;
    }
    if (inv.items instanceof Map) return actorInventoryEntries(inv.items);
    if (typeof inv === "object") {
      for (const id in inv)
        if (typeof inv[id] === "number") out.push([id, inv[id]]);
    }
    return out;
  }

  /** Actors that come back after a save/load or a stream-out (named NPCs with a def id). */
  function isPersistentActor(a) {
    return !!(
      a &&
      a.id &&
      (a.stableId === true || (a.def && a.def.id && a.def.id === a.id))
    );
  }

  /**
   * Corpse container for a dead actor. Loot is rolled ONCE per corpse: the container is cached on
   * the actor, its state survives the corpse being pruned (actor._rpgCorpseState) and, for named
   * actors, save/load (corpseStates, keyed by actor id) — no loot → save → load → loot again.
   */
  function fromActor(actor) {
    if (!actor) return null;
    const cached = actor._rpgContainer;
    if (cached && registry.get(cached.id) === cached) return cached;
    const def = actor.def || {};
    const type = actor.type || def.type || "";
    const c = makeContainer({
      name: actor.name || G.items.displayName(type) || "Body",
      isCorpse: true,
      actor,
      verb: "Search",
      owner: null,
    });
    c.id = "corpse_" + (actor.id || U.randomId("a"));
    try {
      const p =
        actor.pos ||
        (actor.char && actor.char.root && actor.char.root.position);
      if (p) c.pos.set(p.x, p.y + 0.4, p.z);
    } catch (e) {
      /* ignore */
    }
    const saved =
      actor._rpgCorpseState ||
      (isPersistentActor(actor) ? corpseStates.get(actor.id) : null);
    if (saved) {
      applyState(c, saved);
      return registerCorpse(c, actor);
    }
    const level = Math.max(1, actor.level || def.level || G.rpg.level || 1);
    // 1) explicit inventory. If the actor carries a built inventory array (combat module
    //    rolls weapon + ammo + loot at spawn), it is authoritative: no extra rolls.
    const authoritative = Array.isArray(actor.inventory);
    for (const e of actorInventoryEntries(actor.inventory || def.inventory)) {
      const d = G.items.get(e[0]);
      // dropped weapons are worn: give them a battered condition
      const cond =
        e[2] !== undefined
          ? e[2]
          : d && d.hasCondition
            ? Math.round((0.2 + Math.random() * 0.5) * 100) / 100
            : undefined;
      addItem(c, e[0], e[1], cond);
    }
    // 2) equipped weapon (+ a little ammo), damaged
    const wid = authoritative
      ? null
      : typeof actor.weaponId === "string"
        ? actor.weaponId
        : typeof actor.weapon === "string"
          ? actor.weapon
          : def.weapon;
    const wdef = typeof wid === "string" ? G.items.get(wid) : null;
    if (wdef && wdef.type === "weapon" && !wdef.noDrop) {
      if (!c.items.has(wdef.id))
        addItem(
          c,
          wdef.id,
          1,
          Math.round((0.2 + Math.random() * 0.5) * 100) / 100,
        );
      const ammo = G.items.ammoFor(wdef);
      if (ammo && !c.items.has(ammo))
        addItem(
          c,
          ammo,
          Math.max(
            1,
            Math.round(
              (3 + Math.random() * 12) *
                G.rpg.lootAmmoMult() *
                (G.items.get(ammo).value > 10 ? 0.2 : 1),
            ),
          ),
        );
    }
    // 3) worn outfit (humans only)
    let outfit =
      actor.outfit || def.outfit || (actor.char && actor.char.outfit);
    if (outfit && OUTFIT_ITEM[outfit] && !CREATURE_TYPES.test(type)) {
      const list = OUTFIT_ITEM[outfit];
      const oid =
        list[(U.hashStr(String(actor.id || type)) >>> 0) % list.length];
      if (G.items.get(oid) && Math.random() < 0.85)
        addItem(
          c,
          oid,
          1,
          Math.round((0.15 + Math.random() * 0.45) * 100) / 100,
        );
    }
    // 4) loot table (explicit, or by type / faction)
    const fac = actor.faction;
    const table = authoritative
      ? null
      : def.loot || actor.loot || TYPE_LOOT[type] || FACTION_LOOT[fac] || null;
    if (table && G.items.lootTable(table)) {
      const seed = U.hashStr(String(actor.id || "") + ":" + G.time.day) >>> 0;
      for (const e of G.items.rollLoot(table, level, seed))
        addItem(c, e[0], e[1], e[2]);
    }
    // 5) merchants carry their scrip
    const purse = actor.merchant && actor.merchant.scrip;
    if (purse && !c.items.has("scrip"))
      addItem(c, "scrip", Math.round(purse * 0.5));
    return registerCorpse(c, actor);
  }
  function registerCorpse(c, actor) {
    c.rolled = true;
    c.take = wrapCorpseTake(c, c.take);
    c.createdAt = G.time ? G.time.real : 0;
    actor._rpgContainer = c;
    delete actor._rpgCorpseState;
    registry.set(c.id, c);
    if (isPersistentActor(actor)) corpseStates.set(actor.id, stateOf(c));
    // keep the saved snapshot current whenever the player moves things in/out
    const sync = () => {
      if (isPersistentActor(actor) && actor._rpgContainer === c)
        corpseStates.set(actor.id, stateOf(c));
    };
    const take = c.take,
      put = c.put;
    c.take = (id, n, o) => {
      const k = take(id, n, o);
      if (k) sync();
      return k;
    };
    c.put = (id, n) => {
      const k = put(id, n);
      if (k) sync();
      return k;
    };
    pruneCorpses();
    return c;
  }

  // ------------------------------------------------------------------
  // Corpse housekeeping: corpse containers must not pin despawned actors (and their
  // character meshes) in memory, nor slow down list()/near() as kills pile up.
  // ------------------------------------------------------------------
  const MAX_CORPSES = 64;
  function dropCorpse(c) {
    registry.delete(c.id);
    const a = c.actor;
    if (a && a._rpgContainer === c) {
      try {
        delete a._rpgContainer;
        // the body may still be lying there: remember what's left on it (no re-roll on the next search)
        if (!a.removed && !a.disposed) a._rpgCorpseState = stateOf(c);
        if (isPersistentActor(a)) corpseStates.set(a.id, stateOf(c));
      } catch (e) {
        /* ignore */
      }
    }
    c.actor = null;
  }
  /** Unregister corpses whose actor was removed, looted-empty corpses far from the player, and the oldest beyond the cap. */
  function pruneCorpses() {
    const P = G.player;
    const corpses = [];
    for (const c of registry.values()) {
      if (!c.isCorpse) continue;
      const a = c.actor;
      if (!a || a.removed || a.disposed) {
        dropCorpse(c);
        continue;
      }
      if (a.pos && typeof a.pos.x === "number")
        c.pos.set(a.pos.x, (a.pos.y || 0) + 0.4, a.pos.z); // ragdolls move
      const far = P
        ? Math.hypot(c.pos.x - P.pos.x, c.pos.z - P.pos.z) > 150
        : false;
      if (far && c._items.size === 0) {
        dropCorpse(c);
        continue;
      }
      corpses.push(c);
    }
    if (corpses.length > MAX_CORPSES) {
      corpses.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      for (let i = 0; i < corpses.length - MAX_CORPSES; i++)
        dropCorpse(corpses[i]);
    }
  }

  function wrapCorpseTake(c, take) {
    // Taking from the dead is never theft. Pickpocketing the living is: combat (Actor.pickpocket →
    // c.onTake) rolls detection and turns the victim hostile; rpg adds the quiet Standing cost of
    // theft here, once per item taken, exactly like an unseen container theft.
    return (id, n, o) => {
      const got = take(id, n, Object.assign({}, o || {}, { noSteal: true }));
      if (
        got > 0 &&
        c.pickpocket &&
        c.actor &&
        !c.actor.dead &&
        isOwnedByOther(c.owner)
      ) {
        const d = G.items.get(id);
        G.rpg.bumpStat("itemsStolen", 1);
        G.rpg.addStanding(
          -Math.max(
            1,
            Math.min(10, Math.round(((d ? d.value : 1) * got) / 20)),
          ),
          "pickpocket",
        );
      }
      return got;
    };
  }

  // ------------------------------------------------------------------
  // Save / reset
  // ------------------------------------------------------------------
  function stateOf(c) {
    const items = [];
    for (const [id, n] of c._items) {
      const a = c.conds.get(id);
      if (!a || !a.length) {
        items.push([id, n]);
        continue;
      }
      const same = a.every((v) => v === a[0]);
      items.push([
        id,
        n,
        same
          ? Math.round(a[0] * 1000) / 1000
          : a.map((v) => Math.round(v * 1000) / 1000),
      ]);
    }
    const st = { items, rolled: c.rolled, locked: c.locked, day: c.day };
    if (c.playerStored) st.ps = 1;
    return st;
  }
  function applyState(c, s) {
    c._items = new Map();
    c.conds = new Map();
    for (const e of s.items || []) addItem(c, e[0], e[1], e[2]);
    c.rolled = s.rolled !== undefined ? s.rolled : true;
    c.locked = s.locked || 0;
    c.day = s.day || 1;
    c.playerStored = !!s.ps;
    c.touched = true;
  }
