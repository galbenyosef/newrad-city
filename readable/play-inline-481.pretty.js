/* src/rpg/60_containers.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — CONTAINERS, CORPSE LOOT, STEALING
 *                                                   (G.containers)
 *
 * G.containers.create({object3d?, pos, name, items?:[[id,n,cond?]], loot?:tableId,
 *     lock?:{id, key?, code?, passcode?, hint?}, owner?:faction, respawn?:bool, kind?, level?, id?,
 *     model?:false, collider?:bool}) → container
 *   Locks go through the shared G.locks registry (REBRAND §5: keys, keypad codes, passcodes;
 *   there is no lock picking).
 * container: { id, name, kind, items: Map id→count, conds: Map id→[per-unit cond], lock, owner, pos,
 *              take(id,n), put(id,n), takeAll(), count(id), list(), weight(), value(),
 *              isOwned(), isEmpty(), open(), condition(id) (best unit) }
 * Weapons/apparel keep one condition per unit, exactly like the player's inventory.
 * G.containers.fromActor(actor) → corpse container (cached per actor)
 * G.containers.open(container), get(id), list(), remove(c), stealCheck(owner, value, info)
 * G.containers.createModel(kind) → Object3D fallback model
 *
 * Loot tables are rolled lazily the first time a container is opened, at
 * a level blended between the player's level and the location's level.
 * ===================================================================== */
(function () {
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
  function modelKind(kind) {
    kind = String(kind || "crate");
    if (MODEL_ALIAS[kind]) return MODEL_ALIAS[kind];
    if (BUILD[kind]) return kind;
    if (/fridge|refrig/.test(kind)) return "fridge";
    if (/cool/.test(kind)) return "cooler";
    if (/desk/.test(kind)) return "desk";
    if (/cabinet|filing/.test(kind)) return "file_cabinet";
    if (/locker/.test(kind)) return "locker";
    if (/safe/.test(kind)) return "safe";
    if (/ammo|weapon|military/.test(kind)) return "ammo_box";
    if (/aid|medic|doctor/.test(kind)) return "first_aid";
    if (/trash|garbage/.test(kind)) return "trash_can";
    if (/mail/.test(kind)) return "mailbox";
    if (/tool/.test(kind)) return "toolbox";
    if (/foot|trunk|chest|stash/.test(kind)) return "footlocker";
    if (/brief|suit|luggage/.test(kind)) return "suitcase";
    return "crate";
  }
  const CHROME = 0xc8c8c0,
    STEEL = 0x6a6c6a,
    DARK = 0x2a2a2a;
  const BUILD = {
    /** Old-world "Frost-O-Matic" refrigerator: rounded crown, two doors, chrome latch handle, Fizzo decal, feet. */
    fridge(k) {
      const W = 0.76,
        D = 0.68,
        H = 1.46,
        col = 0xd8d2bc;
      const R = 0.13; // rounded top edges (front & back), like a '50s icebox
      k.boxL(W, H - R, D, col, "grime_rust", "all", 0, 0.06 + (H - R) / 2, 0);
      k.boxL(W, R, D - 2 * R, col, "grime", "all", 0, 0.06 + H - R / 2, 0);
      for (const z of [-(D / 2 - R), D / 2 - R]) {
        k.cylL(R, R, W, col, "grime", 0, 0.06 + H - R, z, 16, 0, Math.PI / 2);
        k.cyl(
          R - 0.002,
          R - 0.002,
          W,
          0xcfc9b3,
          0,
          0.06 + H - R,
          z,
          16,
          0,
          Math.PI / 2,
        ); // closes the ends
      }
      // doors (slightly proud), shut line, freezer door above
      k.boxL(
        W - 0.04,
        H * 0.66,
        0.03,
        col,
        "grime",
        "z",
        0,
        0.06 + H * 0.36,
        D / 2 + 0.012,
      );
      k.boxL(
        W - 0.04,
        H * 0.3,
        0.03,
        col,
        "grime",
        "z",
        0,
        0.06 + H * 0.84,
        D / 2 + 0.012,
      );
      k.box(W - 0.02, 0.012, 0.035, 0x5a5850, 0, 0.06 + H * 0.69, D / 2 + 0.01);
      // chrome latch handles (standoffs + bar)
      for (const [y0, len] of [
        [0.06 + H * 0.52, 0.34],
        [0.06 + H * 0.84, 0.16],
      ]) {
        k.box(0.035, len, 0.03, CHROME, W / 2 - 0.1, y0, D / 2 + 0.06);
        k.box(
          0.025,
          0.03,
          0.05,
          CHROME,
          W / 2 - 0.1,
          y0 + len / 2 - 0.02,
          D / 2 + 0.04,
        );
        k.box(
          0.025,
          0.03,
          0.05,
          CHROME,
          W / 2 - 0.1,
          y0 - len / 2 + 0.02,
          D / 2 + 0.04,
        );
      }
      // hinges, badge, Fizzo Cola sticker, kick plate, feet
      for (const y of [
        0.06 + H * 0.1,
        0.06 + H * 0.6,
        0.06 + H * 0.75,
        0.06 + H * 0.96,
      ])
        k.cyl(0.012, 0.012, 0.06, CHROME, -W / 2 + 0.03, y, D / 2 + 0.02, 8);
      k.planeL(
        0.22,
        0.07,
        0xffffff,
        "fridge_badge",
        0,
        0.06 + H * 0.76,
        D / 2 + 0.03,
      );
      k.planeL(
        0.2,
        0.2,
        0xffffff,
        "fizzo_logo",
        -0.12,
        0.06 + H * 0.46,
        D / 2 + 0.029,
        0.12,
      );
      k.boxL(
        W - 0.04,
        0.07,
        0.02,
        0x3a3a38,
        "vent",
        "z",
        0,
        0.1,
        D / 2 + 0.005,
      );
      for (const x of [-W / 2 + 0.07, W / 2 - 0.07])
        for (const z of [-D / 2 + 0.07, D / 2 - 0.07])
          k.cyl(0.03, 0.025, 0.06, DARK, x, 0.03, z, 8);
    },
    /** Fizzo Cola cooler chest: green body, white lid, chrome corners & drop handles. */
    cooler(k) {
      k.boxL(0.62, 0.42, 0.4, 0x1f7a4a, "grime_rust", "all", 0, 0.23, 0);
      k.boxL(0.64, 0.07, 0.42, 0xece6d8, "grime", "all", 0, 0.475, 0);
      k.planeL(0.26, 0.26, 0xffffff, "fizzo_logo", 0, 0.24, 0.201);
      for (const x of [-0.3, 0.3])
        for (const z of [-0.19, 0.19])
          k.box(0.04, 0.44, 0.04, CHROME, x, 0.24, z);
      for (const x of [-0.33, 0.33]) {
        k.box(0.02, 0.02, 0.18, CHROME, x, 0.34, 0);
        k.box(0.02, 0.05, 0.02, CHROME, x, 0.36, -0.08);
        k.box(0.02, 0.05, 0.02, CHROME, x, 0.36, 0.08);
      }
      k.box(0.08, 0.05, 0.03, CHROME, 0, 0.45, 0.215);
      k.box(0.6, 0.02, 0.38, 0x1a1a1a, 0, 0.01, 0);
    },
    /** Steel office desk: slab top, 3-drawer pedestal, modesty panel, legs. */
    desk(k) {
      const W = 1.4,
        D = 0.72,
        H = 0.76,
        col = 0x7a8074;
      k.boxL(W, 0.04, D, 0x5a5e56, "grime_dark", "all", 0, H - 0.02, 0);
      k.boxL(W - 0.04, 0.01, D - 0.04, 0x3c4a3c, "grime", "y", 0, H + 0.003, 0); // linoleum inlay
      k.boxL(
        0.44,
        H - 0.06,
        D - 0.06,
        col,
        "grime",
        "all",
        W / 2 - 0.25,
        (H - 0.06) / 2 + 0.02,
        0,
      ); // pedestal
      for (let i = 0; i < 3; i++) {
        const y = 0.14 + i * 0.22;
        k.boxL(
          0.4,
          0.19,
          0.02,
          col,
          "drawer",
          "z",
          W / 2 - 0.25,
          y,
          D / 2 - 0.02,
        );
        k.box(0.12, 0.018, 0.03, CHROME, W / 2 - 0.25, y + 0.03, D / 2 + 0.005);
      }
      k.boxL(
        W - 0.5,
        0.42,
        0.02,
        col,
        "grime",
        "all",
        -0.2,
        H - 0.26,
        -D / 2 + 0.05,
      ); // modesty panel
      k.boxL(
        0.03,
        H - 0.06,
        D - 0.1,
        col,
        "grime",
        "all",
        -W / 2 + 0.04,
        (H - 0.06) / 2 + 0.02,
        0,
      ); // side panel
      k.box(0.5, 0.1, 0.02, col, -0.25, H - 0.1, D / 2 - 0.05); // pencil drawer
      k.box(0.1, 0.014, 0.02, CHROME, -0.25, H - 0.1, D / 2 - 0.035);
      k.box(0.04, 0.02, 0.1, DARK, -W / 2 + 0.04, 0.01, D / 2 - 0.1);
      k.box(0.46, 0.02, D - 0.06, DARK, W / 2 - 0.25, 0.01, 0);
      // clutter: a typewriter-ish block and a stack of paper
      k.boxL(
        0.3,
        0.1,
        0.24,
        0x3a3a38,
        "grime_dark",
        "all",
        -0.3,
        H + 0.05,
        -0.08,
      );
      k.box(0.26, 0.03, 0.06, 0xe8e0c8, -0.3, H + 0.11, -0.16);
      k.boxL(
        0.2,
        0.03,
        0.26,
        0xffffff,
        "paper",
        "y",
        0.3,
        H + 0.015,
        0.08,
        0.2,
      );
    },
    file_cabinet(k) {
      const col = 0x6c7068;
      k.boxL(0.5, 1.32, 0.64, col, "grime", "all", 0, 0.66, 0);
      for (let i = 0; i < 4; i++) {
        const y = 0.18 + i * 0.32;
        k.boxL(0.46, 0.29, 0.02, col, "drawer", "z", 0, y, 0.325);
        k.box(0.14, 0.02, 0.03, CHROME, 0, y + 0.05, 0.345);
      }
      k.box(0.52, 0.02, 0.66, 0x4a4c48, 0, 1.33, 0);
    },
    dresser(k) {
      k.boxL(0.9, 0.86, 0.48, 0x9a7a58, "wood", "all", 0, 0.47, 0);
      for (let r = 0; r < 3; r++)
        for (let q = 0; q < (r === 2 ? 2 : 1); q++) {
          const w = r === 2 ? 0.4 : 0.82,
            x = r === 2 ? (q ? 0.21 : -0.21) : 0,
            y = 0.2 + r * 0.26;
          k.boxL(w, 0.22, 0.02, 0xa8886a, "wood", "z", x, y, 0.245);
          k.box(0.08, 0.02, 0.025, 0xc0a060, x, y, 0.262);
        }
      k.box(0.94, 0.03, 0.52, 0x6a4a30, 0, 0.915, 0);
      for (const x of [-0.4, 0.4])
        for (const z of [-0.2, 0.2])
          k.cyl(0.025, 0.018, 0.04, 0x4a3020, x, 0.02, z, 8);
    },
    /** Army ammo can: olive steel, stencilled lot number, clamp latch and folding handle. */
    ammo_box(k) {
      k.boxL(0.58, 0.3, 0.3, 0xffffff, "ammo", "zZ", 0, 0.17, 0);
      k.boxL(0.58, 0.3, 0.3, 0x6a7248, "olive", "xXyY", 0, 0.17, 0);
      k.boxL(0.6, 0.05, 0.32, 0x565e3a, "olive", "all", 0, 0.345, 0);
      k.box(0.6, 0.02, 0.32, 0x3a3f26, 0, 0.02, 0);
      k.box(0.06, 0.08, 0.03, 0x4a5030, -0.29, 0.3, 0.1);
      k.cyl(0.012, 0.012, 0.06, 0x3a3a30, -0.3, 0.34, 0.1, 8); // clamp latch
      k.box(0.24, 0.016, 0.03, DARK, 0, 0.385, 0);
      k.box(0.016, 0.03, 0.03, DARK, -0.11, 0.37, 0);
      k.box(0.016, 0.03, 0.03, DARK, 0.11, 0.37, 0);
      for (const x of [-0.2, 0.2])
        k.box(0.1, 0.012, 0.31, 0x565e3a, x, 0.26, 0); // pressed ribs
    },
    /** Wall first-aid box: white steel case, red cross, piano hinge, latch; mounting plate behind. */
    first_aid(k) {
      k.boxL(0.5, 0.42, 0.04, 0x9a9a92, "grime", "all", 0, 0.23, -0.1); // mounting plate
      k.boxL(0.44, 0.38, 0.14, 0xf0eee6, "grime", "xXyY", 0, 0.23, -0.01);
      k.boxL(0.44, 0.38, 0.02, 0xffffff, "redcross", "z", 0, 0.23, 0.07);
      k.cyl(0.008, 0.008, 0.38, CHROME, -0.225, 0.23, 0.07, 8); // piano hinge
      k.box(0.04, 0.06, 0.025, CHROME, 0.2, 0.23, 0.085); // latch
      for (const [x, y] of [
        [-0.23, 0.44],
        [0.23, 0.44],
        [-0.23, 0.02],
        [0.23, 0.02],
      ])
        k.cyl(0.01, 0.01, 0.02, DARK, x, y, -0.07, 6, Math.PI / 2);
    },
    footlocker(k) {
      k.boxL(0.84, 0.36, 0.44, 0x4a5a36, "olive", "all", 0, 0.2, 0);
      k.boxL(0.86, 0.06, 0.46, 0x3e4c2c, "olive", "all", 0, 0.39, 0);
      k.planeL(0.18, 0.12, 0xffffff, "stencil_no", -0.22, 0.2, 0.222);
      for (const x of [-0.41, 0.41])
        for (const z of [-0.21, 0.21]) {
          k.box(0.05, 0.42, 0.05, 0xa08a50, x, 0.21, z);
        }
      k.box(0.09, 0.11, 0.025, 0xb09a50, 0, 0.33, 0.235);
      k.cyl(0.012, 0.012, 0.03, DARK, 0, 0.31, 0.25, 8, Math.PI / 2);
      for (const x of [-0.44, 0.44]) {
        k.box(0.02, 0.03, 0.14, DARK, x, 0.26, 0);
      }
      k.box(0.82, 0.02, 0.42, 0x2a2a22, 0, 0.01, 0);
    },
    suitcase(k) {
      k.boxL(0.62, 0.2, 0.42, 0x6a4a2a, "grime_dark", "all", 0, 0.1, 0);
      k.box(0.64, 0.02, 0.44, 0x4a3018, 0, 0.1, 0);
      k.box(0.16, 0.03, 0.03, DARK, 0, 0.1, 0.23);
      k.box(0.03, 0.04, 0.02, 0xc0a050, -0.14, 0.13, 0.22);
      k.box(0.03, 0.04, 0.02, 0xc0a050, 0.14, 0.13, 0.22);
      for (const x of [-0.3, 0.3])
        for (const z of [-0.2, 0.2])
          k.sph(0.02, 0xc0a050, x, 0.2, z, 1, 1, 1, 6);
    },
    briefcase(k) {
      k.boxL(0.46, 0.34, 0.1, 0x3a2414, "grime_dark", "all", 0, 0.18, 0);
      k.box(0.47, 0.02, 0.11, 0x2a180c, 0, 0.3, 0);
      k.box(0.14, 0.03, 0.03, DARK, 0, 0.365, 0);
      k.box(0.03, 0.03, 0.02, 0xc0a050, -0.12, 0.3, 0.055);
      k.box(0.03, 0.03, 0.02, 0xc0a050, 0.12, 0.3, 0.055);
    },
    /** Floor safe: heavy dark steel, recessed door, combination dial, lever handle, hinges. */
    safe(k) {
      k.boxL(0.6, 0.66, 0.56, 0x3a3e40, "grime_dark", "all", 0, 0.35, 0);
      k.boxL(0.5, 0.54, 0.03, 0x464a4c, "grime_dark", "z", 0, 0.35, 0.285);
      k.discL(0.075, 0xffffff, "dial", 0.08, 0.42, 0.306, Math.PI / 2, 0, 20);
      k.cyl(0.08, 0.08, 0.02, 0x2a2a2a, 0.08, 0.42, 0.295, 20, Math.PI / 2);
      k.cyl(0.012, 0.012, 0.03, CHROME, -0.1, 0.34, 0.31, 8, Math.PI / 2);
      k.box(0.03, 0.16, 0.025, CHROME, -0.1, 0.3, 0.32);
      for (const y of [0.2, 0.5])
        k.cyl(0.018, 0.018, 0.08, 0x2a2a2a, -0.26, y, 0.29, 8);
      k.boxL(0.14, 0.04, 0.005, 0xffffff, "fridge_badge", "z", 0, 0.58, 0.301);
      k.box(0.64, 0.03, 0.6, 0x1a1a1a, 0, 0.015, 0);
    },
    toolbox(k) {
      k.boxL(0.52, 0.22, 0.24, 0xffffff, "toolbox", "zZ", 0, 0.11, 0);
      k.boxL(0.52, 0.22, 0.24, 0xb02a1a, "grime_rust", "xXyY", 0, 0.11, 0);
      k.boxL(0.54, 0.05, 0.26, 0x9a2414, "grime_rust", "all", 0, 0.245, 0);
      k.box(0.3, 0.025, 0.03, DARK, 0, 0.32, 0);
      k.box(0.025, 0.07, 0.025, DARK, -0.14, 0.29, 0);
      k.box(0.025, 0.07, 0.025, DARK, 0.14, 0.29, 0);
      k.box(0.04, 0.04, 0.02, CHROME, -0.2, 0.22, 0.13);
      k.box(0.04, 0.04, 0.02, CHROME, 0.2, 0.22, 0.13);
    },
    /** Tall steel locker: louvred vents, number plate, latch handle, padlock hasp. */
    locker(k, cryo) {
      const col = cryo ? 0xd0d4d0 : 0x5c6a5c;
      k.boxL(0.52, 1.84, 0.5, col, "grime", "xXyYZ", 0, 0.94, 0);
      k.boxL(0.47, 1.76, 0.02, col, "grime", "z", 0, 0.94, 0.255);
      k.boxL(0.34, 0.2, 0.012, col, "vent", "z", 0, 1.6, 0.268);
      k.boxL(0.34, 0.2, 0.012, col, "vent", "z", 0, 0.3, 0.268);
      k.box(0.03, 0.2, 0.035, CHROME, 0.18, 0.98, 0.275);
      k.box(0.05, 0.03, 0.03, CHROME, 0.18, 1.1, 0.275);
      k.box(0.03, 0.05, 0.012, 0x8a8a80, 0.18, 0.86, 0.27);
      if (cryo) k.planeL(0.14, 0.14, 0xffffff, "civdef", 0, 1.3, 0.27);
      else
        k.boxL(0.1, 0.05, 0.005, 0xffffff, "stencil_no", "z", 0, 1.36, 0.268);
      k.box(0.54, 0.04, 0.52, 0x2a2a2a, 0, 0.02, 0);
      k.box(0.54, 0.02, 0.52, 0x3a3a3a, 0, 1.87, 0);
    },
    cryo_locker(k) {
      BUILD.locker(k, true);
    },
    /** NYC Sanitation wire-free steel can with lid. */
    trash_can(k) {
      k.cylL(0.26, 0.23, 0.78, 0xffffff, "trash", 0, 0.41, 0, 18);
      k.cyl(0.235, 0.235, 0.02, 0x3a3a38, 0, 0.02, 0, 18);
      k.cyl(0.275, 0.275, 0.05, 0x6a6c68, 0, 0.8, 0, 18);
      k.cyl(0.24, 0.27, 0.07, 0x6a6c68, 0, 0.86, 0, 18);
      k.box(0.14, 0.03, 0.03, 0x4a4a48, 0, 0.91, 0);
      for (const a of [0, Math.PI])
        k.box(
          0.03,
          0.03,
          0.12,
          0x4a4a48,
          Math.sin(a) * 0.27,
          0.66,
          Math.cos(a) * 0.27,
          a + Math.PI / 2,
        );
      k.torus(0.255, 0.012, 0x5a5c58, 0, 0.25, 0, Math.PI / 2);
      k.torus(0.265, 0.012, 0x5a5c58, 0, 0.58, 0, Math.PI / 2);
    },
    dumpster(k) {
      k.boxL(1.8, 1.1, 1.0, 0x2e5a3a, "grime_rust", "all", 0, 0.65, 0);
      k.boxL(
        1.84,
        0.08,
        1.04,
        0x234a2e,
        "grime_dark",
        "all",
        0,
        1.24,
        0.02,
        0,
        -0.08,
      );
      for (const x of [-0.7, 0.7])
        for (const z of [-0.4, 0.4]) {
          k.cyl(0.07, 0.07, 0.05, DARK, x, 0.07, z, 10, Math.PI / 2);
          k.box(0.06, 0.08, 0.06, DARK, x, 0.12, z);
        }
      k.box(1.9, 0.06, 0.06, 0x234a2e, 0, 0.9, 0.52);
    },
    /** NYC corner mailbox (the blue USPS-style one). */
    mailbox(k) {
      k.boxL(0.46, 0.8, 0.5, 0xffffff, "mail", "z", 0, 0.62, 0);
      k.boxL(0.46, 0.8, 0.5, 0x2a4a8a, "grime", "xXYZ", 0, 0.62, 0);
      k.cylL(
        0.25,
        0.25,
        0.46,
        0x2a4a8a,
        "grime",
        0,
        1.02,
        0,
        16,
        0,
        Math.PI / 2,
      );
      k.boxL(
        0.34,
        0.06,
        0.2,
        0x1e3a70,
        "grime_dark",
        "all",
        0,
        1.1,
        0.2,
        0,
        -0.35,
      );
      for (const x of [-0.2, 0.2])
        for (const z of [-0.22, 0.22])
          k.box(0.05, 0.22, 0.05, 0x1e3a70, x, 0.11, z);
    },
    register(k) {
      k.boxL(0.4, 0.14, 0.4, 0x3a3a38, "grime_dark", "all", 0, 0.07, 0);
      k.boxL(
        0.36,
        0.16,
        0.26,
        0x6a4a2a,
        "register",
        "y",
        0,
        0.2,
        0.04,
        0,
        -0.35,
      );
      k.boxL(0.3, 0.12, 0.12, 0xb8a060, "grime", "all", 0, 0.32, -0.12);
      k.box(0.24, 0.06, 0.02, 0x1a1a1a, 0, 0.34, -0.055);
    },
    duffle(k) {
      k.cylL(
        0.17,
        0.17,
        0.7,
        0x4a5a36,
        "olive",
        0,
        0.16,
        0,
        14,
        0,
        Math.PI / 2,
      );
      k.sph(0.17, 0x4a5a36, -0.35, 0.16, 0, 0.25, 1, 1, 10);
      k.sph(0.17, 0x4a5a36, 0.35, 0.16, 0, 0.25, 1, 1, 10);
      k.box(0.5, 0.02, 0.04, DARK, 0, 0.33, 0);
      k.torus(0.08, 0.012, DARK, 0, 0.36, 0, 0);
    },
    /** Wooden supply crate: planks, darker frame boards, stencil. */
    crate(k) {
      k.boxL(0.62, 0.52, 0.52, 0xb89468, "wood", "all", 0, 0.26, 0);
      for (const y of [0.03, 0.49]) {
        k.boxL(0.64, 0.06, 0.54, 0x8a6a44, "wood", "all", 0, y, 0);
      }
      for (const x of [-0.29, 0.29])
        for (const z of [-0.24, 0.24])
          k.boxL(0.06, 0.52, 0.06, 0x7a5a38, "wood", "all", x, 0.26, z);
      k.planeL(0.26, 0.2, 0xffffff, "stencil_no", 0, 0.28, 0.262);
    },
  };
  function geoFor(kind) {
    const mk = modelKind(kind);
    if (MODEL_GEO.has(mk)) return MODEL_GEO.get(mk);
    let g = null;
    try {
      const k = G.items._art.kit();
      BUILD[mk](k);
      g = k.build();
    } catch (e) {
      G.reportError("rpg:containerModel:" + mk, e);
      g = new THREE.BoxGeometry(0.6, 0.5, 0.5);
      g.translate(0, 0.25, 0);
    }
    MODEL_GEO.set(mk, g);
    return g;
  }
  function createModel(kind) {
    if (!modelMat) {
      const atlas = G.items._art ? G.items._art.texture() : null;
      modelMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.72,
        metalness: 0.28,
        map: atlas || null,
      });
      modelMat.userData.shared = true;
    }
    const m = new THREE.Mesh(geoFor(kind || "crate"), modelMat);
    const mk = modelKind(kind);
    // only big pieces cast shadows (budget: no shadows on small props)
    m.castShadow =
      /fridge|locker|desk|file_cabinet|dresser|dumpster|mailbox|safe|trash/.test(
        mk,
      );
    m.receiveShadow = true;
    m.name = "container:" + mk;
    return m;
  }

  // ------------------------------------------------------------------
  // Creation / registry
  // ------------------------------------------------------------------
  /**
   * Stable container id. Owners should pass `id` (props passes its site/prop id). Without one the id
   * is derived from what the container IS and WHERE: kind + position (10 cm) + facing, so the same
   * container gets the same id whatever order things stream in. A clash is reported, then suffixed.
   */
  const warnedIds = new Set();
  function makeId(opts, pos) {
    let base = opts.id;
    if (!base) {
      const kind = String(opts.kind || opts.loot || opts.name || "box").replace(
        /\W+/g,
        "_",
      );
      const h =
        U.hashStr(
          kind +
            "|" +
            Math.round(pos.x * 10) +
            "|" +
            Math.round(pos.y * 10) +
            "|" +
            Math.round(pos.z * 10) +
            "|" +
            Math.round((opts.yaw || 0) * 100),
        ) >>> 0;
      base =
        "c_" +
        kind +
        "_" +
        Math.round(pos.x) +
        "_" +
        Math.round(pos.z) +
        "_" +
        h.toString(36);
    }
    let id = base,
      n = 1;
    if (usedIds.has(id) && !warnedIds.has(base)) {
      warnedIds.add(base);
      console.warn(
        '[rpg] containers: duplicate container id "' +
          base +
          '" — pass a unique opts.id so saved contents map to the right container',
      );
    }
    while (usedIds.has(id)) id = base + "_" + ++n;
    usedIds.add(id);
    return id;
  }

  function create(opts) {
    opts = opts || {};
    const c = makeContainer(opts);
    // position: explicit pos, else the object's bounding box centre
    let obj = opts.object3d || null;
    if (!obj && opts.model !== false && opts.pos && G.scene) {
      obj = createModel(opts.kind || opts.loot || "crate");
      obj.position.set(
        opts.pos.x,
        opts.pos.y !== undefined
          ? opts.pos.y
          : G.world.groundHeight(opts.pos.x, opts.pos.z, 2),
        opts.pos.z,
      );
      if (opts.yaw) obj.rotation.y = opts.yaw;
      G.scene.add(obj);
      c.ownsModel = true;
      if (
        opts.collider !== false &&
        /locker|safe|desk|file_cabinet|dresser|fridge|dumpster|mailbox|trash_can/.test(
          modelKind(opts.kind || opts.loot),
        )
      ) {
        try {
          c.collider = G.world.addFromObject(obj, {
            tag: "container",
            surface: "metal",
          });
        } catch (e) {
          /* ignore */
        }
      }
    }
    c.object3d = obj;
    if (obj) {
      obj.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(obj);
      if (!box.isEmpty()) {
        box.getCenter(c.pos);
        c.pos.y = Math.min(
          box.max.y - 0.05,
          box.min.y + Math.max(0.3, (box.max.y - box.min.y) * 0.6),
        );
      } else obj.getWorldPosition(c.pos);
    }
    if (opts.pos && (!obj || opts.object3d)) {
      if (!obj)
        c.pos.set(
          opts.pos.x,
          opts.pos.y !== undefined ? opts.pos.y + 0.4 : 0.4,
          opts.pos.z,
        );
    }
    c.id = makeId(opts, c.pos);
    if (!c.isCorpse) c._pristine = stateOf(c); // untouched state (loot not yet rolled) for new games
    // saved state for this container?
    if (pendingState[c.id]) {
      applyState(c, pendingState[c.id]);
      delete pendingState[c.id];
    }
    if (opts.interact !== false && !c.isCorpse) {
      c.interactable = G.world.addInteractable({
        getPos: () => c.pos,
        radius: opts.radius || 0.6,
        priority: 0.3,
        range: 2.6,
        label: () => c.name,
        verb: () => (c.isOwned() ? "Steal from" : c.verb),
        locked: () => (isLocked(c) ? "Locked" : null),
        stealing: () => c.isOwned(),
        container: c,
        onInteract: () => open(c),
      });
    }
    registry.set(c.id, c);
    return c;
  }

  /** Unregister a container (props stream them in/out). Touched state is kept so re-creating it restores contents. */
  function remove(c) {
    if (!c) return;
    if (!c.isCorpse && c.touched && registry.get(c.id) === c)
      pendingState[c.id] = stateOf(c);
    if (c.interactable) G.world.removeInteractable(c.interactable);
    if (c.ownsModel && c.object3d && c.object3d.parent)
      c.object3d.parent.remove(c.object3d);
    if (c.collider) G.world.removeCollider(c.collider);
    registry.delete(c.id);
    usedIds.delete(c.id);
  }

  // ------------------------------------------------------------------
  // Opening / locks
  // ------------------------------------------------------------------
  function unlock(c, how) {
    c.locked = 0;
    c.touched = true;
    const sp = lockSpec(c);
    try {
      if (sp && !G.isStub("locks") && G.locks.unlock)
        G.locks.unlock(sp.id, how);
    } catch (e) {
      /* ignore */
    }
    G.events.emit("containerUnlocked", c, how);
  }
  function open(c) {
    if (!c) return false;
    // The container screen (ui_interact) routes locks through G.locks itself; without it, do it here.
    const uiOpens = !G.isStub("ui") && G.ui.openContainer;
    if (!uiOpens && isLocked(c)) {
      const sp = lockSpec(c);
      if (!G.isStub("locks") && G.locks.open) {
        G.locks.open(
          Object.assign({ kind: "container", label: c.name }, sp),
          () => {
            unlock(c, "lock");
            setTimeout(() => open(c), 50);
          },
        );
        return false;
      }
      if (sp.key && G.inventory.has(sp.key)) {
        unlock(c, "key");
        G.notify("Unlocked with " + nameOf(sp.key) + ".");
      } else {
        G.sfx.play("door_locked");
        G.notify("It's locked.");
        return false;
      }
    }
    ensureRolled(c);
    // respawn: non-player containers restock after a few days; the old contents are replaced
    // by a fresh roll (never piled on top).
    // A container the player has used as a stash is left alone.
    if (c.respawn && c.loot && !c.playerStored && G.time.day - c.day >= 3) {
      c.day = G.time.day;
      c._items = new Map();
      c.conds = new Map();
      const out = G.items.rollLoot(c.loot, rollLevel(c));
      for (const e of out) addItem(c, e[0], e[1], e[2]);
    }
    c.touched = true;
    G.sfx.play("container_open", { pos: c.pos, volume: 0.8 });
    if (c.onOpen) {
      try {
        c.onOpen(c);
      } catch (e) {
        G.reportError("rpg:container.onOpen", e);
      }
    }
    G.events.emit("containerOpened", c);
    if (!G.isStub("ui") && G.ui.openContainer) {
      G.ui.openContainer(c);
      return true;
    }
    // Fallback without the container UI: take everything
    if (c.items.size === 0) {
      G.notify(c.isCorpse ? "There is nothing on the body." : "It's empty.");
      return true;
    }
    c.takeAll();
    return true;
  }

  // ------------------------------------------------------------------
  // Stealing
  // ------------------------------------------------------------------
  /** Evaluate a theft from `owner` worth `value` scrip. Returns true if the player was caught. */
  function stealCheck(owner, value, info) {
    info = info || {};
    if (!isOwnedByOther(owner)) return false;
    G.rpg.bumpStat("itemsStolen", Math.max(1, info.count || 1));
    const P = G.player;
    let caught = false,
      witness = null;
    try {
      if (!G.isStub("actors") && G.actors.list) {
        const hidden =
          !G.isStub("combat") &&
          G.combat.detection &&
          G.combat.detection() === "hidden";
        const stealthed = G.rpg.isStealthed();
        const eye = new THREE.Vector3();
        for (const a of G.actors.list()) {
          if (!a || a.dead || a.faction !== owner) continue;
          if (a.hostile && a.hostile()) continue;
          const d = Math.hypot(a.pos.x - P.pos.x, a.pos.z - P.pos.z);
          if (d > 22) continue;
          // facing check (~120° view cone), skipped when very close
          if (d > 3) {
            const fx = -Math.sin(a.yaw || 0),
              fz = -Math.cos(a.yaw || 0);
            const tx = (P.pos.x - a.pos.x) / d,
              tz = (P.pos.z - a.pos.z) / d;
            if (fx * tx + fz * tz < -0.3) continue;
          }
          eye.set(a.pos.x, a.pos.y + 1.6, a.pos.z);
          const target = new THREE.Vector3(P.pos.x, P.pos.y + 1.2, P.pos.z);
          if (
            !G.world.lineOfSight(eye, target, {
              ignoreTags: ["actor", "interactable_self", "container"],
            })
          )
            continue;
          // sneaking: Stealth skill vs distance
          if ((P.sneaking && hidden) || stealthed) {
            const chance = Math.max(
              0.05,
              0.9 - G.rpg.sneakBonus() / 120 - d / 40,
            );
            if (Math.random() > chance) continue;
          }
          caught = true;
          witness = a;
          break;
        }
      }
    } catch (e) {
      G.reportError("rpg:stealCheck", e);
    }
    const standingLoss = Math.max(
      1,
      Math.min(10, Math.round((value || 1) / 20)),
    );
    if (caught) {
      G.notify("You were caught stealing!", { kind: "crime" });
      G.sfx.play("sneak_detected");
      G.rpg.addStanding(-Math.max(5, standingLoss * 2), "stealing");
      try {
        if (witness && !witness.essential && witness.setHostile)
          witness.setHostile(true);
        if (witness && witness.say)
          witness.say(
            [
              "Thief!",
              "Hey! That's not yours!",
              "Put that back, sleeper!",
              "Guards! We got a thief!",
            ][Math.floor(Math.random() * 4)],
          );
      } catch (e) {
        /* ignore */
      }
      G.events.emit("crime", { type: "theft", owner, value, witness, info });
    } else {
      G.rpg.addStanding(-standingLoss, "stealing");
      G.events.emit("crime", {
        type: "theft",
        owner,
        value,
        witness: null,
        info,
      });
    }
    return caught;
  }

  // ------------------------------------------------------------------
  // Corpse loot
  // ------------------------------------------------------------------
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
  function serialize() {
    const out = {};
    for (const [id, c] of registry)
      if (c.touched && !c.isCorpse) out[id] = stateOf(c);
    // keep state of containers that were saved but not (re)created this session
    for (const id in pendingState) if (!out[id]) out[id] = pendingState[id];
    // named actors' corpses (bounded: newest 256)
    const corpses = {};
    for (const c of registry.values())
      if (c.isCorpse && c.actor && isPersistentActor(c.actor))
        corpseStates.set(c.actor.id, stateOf(c));
    const ids = Array.from(corpseStates.keys()).slice(-256);
    for (const id of ids) corpses[id] = corpseStates.get(id);
    if (ids.length) out.__corpses = corpses;
    return out;
  }
  /**
   * New game / before load: corpses are dropped; every other container goes back to
   * its pristine state (owners such as props/quests remove their dynamic ones themselves).
   */
  function reset() {
    initPhase = false;
    pendingState = {};
    corpseStates = new Map();
    for (const c of Array.from(registry.values())) {
      if (c.isCorpse) {
        registry.delete(c.id);
        continue;
      }
      if (c._pristine) applyState(c, c._pristine);
      c.touched = false;
    }
  }
  function deserialize(d) {
    pendingState = {};
    corpseStates = new Map(Object.entries((d && d.__corpses) || {}));
    for (const id in d || {}) {
      if (id === "__corpses") continue;
      const c = registry.get(id);
      if (c) applyState(c, d[id]);
      else pendingState[id] = d[id];
    }
  }

  G.containers = {
    create,
    fromActor,
    open,
    remove,
    stealCheck,
    createModel,
    modelKind,
    isStealing: isOwnedByOther,
    isLocked,
    lockSpec,
    pruneCorpses,
    get: (id) => registry.get(id) || null,
    list: () => Array.from(registry.values()),
    near: (pos, r) =>
      Array.from(registry.values()).filter(
        (c) => Math.hypot(c.pos.x - pos.x, c.pos.z - pos.z) <= r,
      ),
    _serialize: serialize,
    _deserialize: deserialize,
    _reset: reset,
  };
})();
