// play-inline-481 01 — items
// Lines 23-355 of readable/play-inline-481.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const U = G.util;

  let registry = new Map(); // id -> container
  let pendingState = {}; // saved state for containers not created yet
  let corpseStates = new Map(); // stable actor id -> looted corpse state (saved; beats re-rolling on load)
  let initPhase = true; // containers created before the first reset are "static world"
  const usedIds = new Set();

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------
  /** Lock spec of a container (its `lock` object: {id, key?, code?, passcode?}), or null. */
  function lockSpec(c) {
    return c.lock && c.lock.id ? c.lock : null;
  }
  function isLocked(c) {
    const s = lockSpec(c);
    if (!s) return false;
    try {
      if (!G.isStub("locks") && G.locks.isOpen) return !G.locks.isOpen(s.id);
    } catch (e) {
      /* ignore */
    }
    return true;
  }
  // Belongings of factions that are hostile to the player (raider camps, Brute lairs, Continuity
  // outposts) are fair game: only friendly/neutral owners make it stealing.
  const HOSTILE_OWNERS = {
    raiders: 1,
    brutes: 1,
    maniacs: 1,
    creatures: 1,
    robots: 1,
    continuity: 1,
    none: 1,
  };
  function isOwnedByOther(owner) {
    if (!owner || owner === "player" || HOSTILE_OWNERS[owner]) return false;
    try {
      if (!G.isStub("combat") && G.combat.relation) {
        const r = G.combat.relation("player", owner);
        if (r === "hostile") return false;
      }
    } catch (e) {
      /* ignore */
    }
    return true;
  }
  function locationLevel(pos) {
    try {
      const l = G.LAYOUT.locationAt(pos.x, pos.z);
      return l ? l.level : null;
    } catch (e) {
      return null;
    }
  }
  function rollLevel(c) {
    const pl = G.rpg.level || 1;
    const ll = c.level || locationLevel(c.pos);
    if (!ll) return pl;
    return Math.max(1, Math.round(pl * 0.6 + ll * 0.4));
  }
  const nameOf = (id) => G.items.displayName(id);

  // ------------------------------------------------------------------
  // Container object
  // ------------------------------------------------------------------
  function makeContainer(opts) {
    const c = {
      id: null,
      name: opts.name || "Container",
      kind: opts.kind || opts.loot || "container",
      _items: new Map(),
      conds: new Map(),
      lock: opts.lock || null,
      locked: opts.locked || 0,
      owner: opts.owner || null,
      respawn: !!opts.respawn,
      loot: opts.loot || null,
      rolled: !opts.loot,
      day: G.time ? G.time.day : 1,
      level: opts.level || null,
      pos: new THREE.Vector3(),
      object3d: opts.object3d || null,
      isCorpse: !!opts.isCorpse,
      actor: opts.actor || null,
      static: initPhase && !opts.isCorpse,
      touched: false,
      verb: opts.verb || (opts.isCorpse ? "Search" : "Open"),
      onOpen: opts.onOpen || null,
      onTake: opts.onTake || null,
    };
    // `items` is a lazily-rolled Map: reading it (e.g. from the container UI) rolls the loot table first.
    Object.defineProperty(c, "items", {
      get() {
        ensureRolled(c);
        return c._items;
      },
      set(v) {
        c._items = v;
      },
      enumerable: true,
    });
    // explicit items
    for (const e of opts.items || [])
      addItem(c, G.items.canonicalId(e[0]), e[1], e[2]);

    c.count = (id) => c.items.get(G.items.canonicalId(id)) || 0;
    c.has = (id) => (c.items.get(G.items.canonicalId(id)) || 0) > 0;
    c.condition = (id) => {
      const a = c.conds.get(id);
      return a && a.length ? Math.max.apply(null, a) : 1;
    };
    c.isOwned = () => isOwnedByOther(c.owner);
    c.isEmpty = () => {
      ensureRolled(c);
      return c.items.size === 0;
    };
    c.list = () => {
      ensureRolled(c);
      const out = [];
      for (const [id, n] of c.items)
        out.push({
          id,
          count: n,
          def: G.items.get(id),
          condition: c.conds.has(id) ? c.condition(id) : undefined,
          conditions: c.conds.has(id) ? c.conds.get(id).slice() : undefined,
        });
      out.sort((a, b) =>
        a.id === "scrip"
          ? -1
          : b.id === "scrip"
            ? 1
            : (a.def ? a.def.name : a.id).localeCompare(
                b.def ? b.def.name : b.id,
              ),
      );
      return out;
    };
    c.weight = () => {
      let w = 0;
      for (const [id, n] of c.items) {
        const d = G.items.get(id);
        if (d) w += d.weight * n;
      }
      return Math.round(w * 10) / 10;
    };
    c.value = () => {
      let v = 0;
      for (const [id, n] of c.items) {
        const d = G.items.get(id);
        if (d) v += d.value * n;
      }
      return v;
    };
    /** Move n of id from the container to the player. Returns number moved. */
    c.take = (id, n, opts2) => {
      ensureRolled(c);
      id = G.items.canonicalId(id);
      const have = c.items.get(id) || 0;
      n = Math.min(n === undefined ? have : n, have);
      if (n <= 0) return 0;
      if (c.isOwned() && !(opts2 && opts2.noSteal)) {
        const d = G.items.get(id);
        stealCheck(c.owner, (d ? d.value : 1) * n, {
          pos: c.pos,
          name: d ? d.name : id,
          container: c,
        });
      }
      const conds = [];
      removeItem(c, id, n, conds); // the best units come out first
      G.inventory.add(id, n, {
        conds: conds.length ? conds : undefined,
        silent: !!(opts2 && opts2.silent),
      });
      c.touched = true;
      if (c.onTake) {
        try {
          c.onTake(id, n);
        } catch (e) {
          G.reportError("rpg:container.onTake", e);
        }
      }
      G.events.emit("containerChanged", c);
      return n;
    };
    /** Move n of id from the player into the container. Returns number moved. */
    c.put = (id, n) => {
      ensureRolled(c);
      id = G.items.canonicalId(id);
      if (!G.inventory.has(id)) return 0;
      const d = G.items.get(id);
      if (d && (d.quest || d.medallion)) {
        G.notify("You can't store quest items.");
        return 0;
      }
      n = Math.min(n === undefined ? 1 : n, G.inventory.count(id));
      if (n <= 0) return 0;
      const conds = [];
      n = G.inventory.remove(id, n, { outConds: conds });
      if (!n) return 0;
      addItem(c, id, n, conds.length ? conds : undefined);
      c.touched = true;
      if (!c.isCorpse) c.playerStored = true; // the stash is the player's now: no restock wipes it
      G.events.emit("containerChanged", c);
      return n;
    };
    /**
     * Take everything (R in the container UI). Returns number of stacks taken.
     * Stealing everything is ONE theft: one witness roll, one Standing change, one crime event.
     */
    c.takeAll = () => {
      ensureRolled(c);
      const entries = Array.from(c.items);
      if (!entries.length) return 0;
      if (c.isOwned() && !c.isCorpse) {
        let value = 0;
        for (const [id, n] of entries) {
          const d = G.items.get(id);
          value += (d ? d.value : 1) * n;
        }
        stealCheck(c.owner, value, {
          pos: c.pos,
          name: c.name,
          container: c,
          count: entries.length,
          all: true,
        });
      }
      let k = 0;
      for (const [id, n] of entries) {
        if (c.take(id, n, { noSteal: true }) > 0) k++;
      }
      if (k) G.sfx.play("pickup", { volume: 0.7 });
      return k;
    };
    c.open = () => open(c);
    c.rollNow = () => ensureRolled(c);
    return c;
  }
  /** Add n of id; cond = number | per-unit array | undefined (condition items default to pristine). */
  function addItem(c, id, n, cond) {
    if (!id || !(n > 0)) return;
    id = G.items.canonicalId(id);
    n = Math.floor(n);
    const have = c._items.get(id) || 0;
    const d = G.items.get(id);
    const tracked =
      (d && d.hasCondition) ||
      c.conds.has(id) ||
      (cond !== undefined && cond !== null);
    if (tracked) {
      const arr = c.conds.get(id) || [];
      while (arr.length < have) arr.push(1);
      for (let i = 0; i < n; i++) {
        let v = Array.isArray(cond) ? cond[Math.min(i, cond.length - 1)] : cond;
        v = typeof v === "number" && isFinite(v) ? U.clamp(v, 0, 1) : 1;
        arr.push(v);
      }
      arr.sort((a, b) => b - a);
      c.conds.set(id, arr);
    }
    c._items.set(id, have + n);
  }
  /** Remove n of id (best units first); their conditions are pushed into `out` when given. */
  function removeItem(c, id, n, out) {
    const have = c._items.get(id) || 0;
    const arr = c.conds.get(id);
    if (arr) {
      const taken = arr.splice(0, Math.min(n, arr.length));
      if (out) for (const v of taken) out.push(v);
    }
    if (have - n <= 0) {
      c._items.delete(id);
      c.conds.delete(id);
    } else c._items.set(id, have - n);
  }
  function ensureRolled(c) {
    if (c.rolled) return;
    c.rolled = true;
    if (c.loot) {
      const out = G.items.rollLoot(c.loot, rollLevel(c));
      for (const e of out) addItem(c, e[0], e[1], e[2]);
      // Rolled contents are now part of the world: keep them when props streams the
      // container out and back in (no loot re-rolling by walking away).
      c.touched = true;
    }
  }

  // ------------------------------------------------------------------
  // Fallback models (props normally supplies the object3d). Multi-part, bevel-ish,
  // grimed with the shared label atlas (48_art.js): one merged mesh + one shared
  // material per kind. Origin = floor centre, front = +Z.
  // ------------------------------------------------------------------
  const MODEL_GEO = new Map();
  let modelMat = null;
  const MODEL_ALIAS = {
    weapon_crate: "ammo_box",
    ammo: "ammo_box",
    military: "ammo_box",
    medical_cabinet: "first_aid",
    doctors_bag: "first_aid",
    medkit: "first_aid",
    luggage: "suitcase",
    raider_stash: "footlocker",
    wall_safe: "safe",
    workbench: "toolbox",
    tools: "toolbox",
    cryo_locker: "cryo_locker",
    office: "desk",
    file_cabinet: "file_cabinet",
    dresser: "dresser",
    trash: "trash_can",
    garbage: "trash_can",
    dumpster: "dumpster",
    register: "register",
    cash_register: "register",
    mailbox: "mailbox",
    duffle_bag: "duffle",
    duffel_bag: "duffle",
    icebox: "fridge",
    refrigerator: "fridge",
    cooler: "cooler",
    fizzo_cooler: "cooler",
    crate: "crate",
    generic: "crate",
    container: "crate",
  };
