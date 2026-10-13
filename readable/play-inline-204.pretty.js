/* src/poi_financial/03_common.js */
/* =====================================================================
 * NEW RAD CITY — POI FINANCIAL — 03_common.js
 * Shared runtime for the four Financial-District POIs:
 *   - interior cells (roots hidden unless the player is inside the cell,
 *     optional sub-roots toggled by a box test)
 *   - persistent module flags (saved under G.save key 'poi_financial')
 *   - deferred registration of items / terminals / dialogues / quests at
 *     initDone (those modules have a higher init order than ours)
 *   - named NPC roster spawned on newGame / loaded (stable ids)
 *   - area triggers, glows, notes & tape reels, safe wrappers
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pf) return;
  const PF = G._pf;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  PF.V3 = V3;

  // -------------------------------------------------------------------
  // Safe call helper
  // -------------------------------------------------------------------
  PF.safe = function (tag, fn) {
    try {
      return fn();
    } catch (e) {
      try {
        G.reportError("poi_financial:" + tag, e);
      } catch (e2) {
        console.warn(e);
      }
      return undefined;
    }
  };
  PF.live = (ns) => {
    try {
      return !G.isStub(ns);
    } catch (e) {
      return false;
    }
  };

  // -------------------------------------------------------------------
  // Interior cells
  // -------------------------------------------------------------------
  PF.cells = PF.cells || {};
  /** Get/create an interior cell record {key, origin, root, subs:[{obj, test(p)}]}. */
  PF.cell = function (key) {
    if (PF.cells[key]) return PF.cells[key];
    const def = G.LAYOUT.INTERIORS[key];
    const o = def ? def.origin : { x: 0, y: 0, z: 0 };
    const root = new THREE.Group();
    root.name = "pf_cell_" + key;
    root.visible = false;
    G.scene.add(root);
    const c = { key, origin: { x: o.x, y: o.y, z: o.z }, root, subs: [] };
    PF.cells[key] = c;
    return c;
  };
  /** Sub-root inside a cell, visible only while test(p) is true (p = camera world pos). */
  PF.subRoot = function (cell, name, test) {
    const g = new THREE.Group();
    g.name = "pf_sub_" + name;
    cell.root.add(g);
    cell.subs.push({ obj: g, test });
    return g;
  };
  const _cam = new THREE.Vector3();
  PF.updateCells = function () {
    let p = null;
    if (G.camera) {
      G.camera.getWorldPosition(_cam);
      p = _cam;
    }
    if (!p && G.player) p = G.player.pos;
    if (!p) return;
    for (const k in PF.cells) {
      const c = PF.cells[k];
      const inside =
        Math.abs(p.x - c.origin.x) < 170 && Math.abs(p.z - c.origin.z) < 170;
      if (c.root.visible !== inside) c.root.visible = inside;
      if (inside)
        for (const s of c.subs) {
          const v = !!s.test(p);
          if (s.obj.visible !== v) s.obj.visible = v;
        }
    }
  };
  /** Is the player currently inside the given interior cell? */
  PF.inCell = function (key) {
    const c = PF.cells[key];
    const p = G.player && G.player.pos;
    return !!(
      c &&
      p &&
      Math.abs(p.x - c.origin.x) < 170 &&
      Math.abs(p.z - c.origin.z) < 170
    );
  };

  // -------------------------------------------------------------------
  // Flags (module save state)
  // -------------------------------------------------------------------
  PF.flags = {};
  PF.flagDefaults = {};
  PF.flag = (k) => PF.flags[k];
  PF.setFlag = function (k, v) {
    PF.flags[k] = v === undefined ? true : v;
    for (const fn of PF.flagWatch) {
      try {
        fn(k, PF.flags[k]);
      } catch (e) {
        G.reportError("poi_financial:flag", e);
      }
    }
  };
  PF.flagWatch = [];
  PF.resetFlags = function () {
    PF.flags = JSON.parse(JSON.stringify(PF.flagDefaults));
  };

  // -------------------------------------------------------------------
  // Lifecycle hook lists (run by 90_main.js)
  // -------------------------------------------------------------------
  PF.onInitDone = PF.onInitDone || []; // register items/terminals/dialogues/quests, spawn persistent props
  PF.onNewGame = PF.onNewGame || [];
  PF.onReset = PF.onReset || [];
  PF.onLoaded = PF.onLoaded || [];
  PF.updaters = PF.updaters || []; // fn(dt, realDt) every frame while the world runs
  PF.saveHooks = PF.saveHooks || {};

  // -------------------------------------------------------------------
  // Deferred registrations (G.items / G.terminals / G.dialogue / G.quests)
  // -------------------------------------------------------------------
  PF.itemDefs = [];
  PF.termDefs = [];
  PF.dlgDefs = [];
  PF.questDefs = [];
  PF.item = (def) => {
    PF.itemDefs.push(def);
    return def.id;
  };
  PF.terminal = (id, def) => {
    PF.termDefs.push([id, def]);
    return id;
  };
  PF.dialogue = (id, tree) => {
    PF.dlgDefs.push([id, tree]);
    return id;
  };
  PF.quest = (def) => {
    PF.questDefs.push(def);
    return def.id;
  };
  PF.registerContent = function () {
    if (PF.live("items") && G.items.define)
      for (const d of PF.itemDefs)
        PF.safe("item:" + d.id, () =>
          G.items.define(typeof d.build === "function" ? d.build() : d),
        );
    if (PF.live("terminals") && G.terminals.register)
      for (const [id, d] of PF.termDefs)
        PF.safe("term:" + id, () => G.terminals.register(id, d));
    if (PF.live("dialogue") && G.dialogue.register)
      for (const [id, t] of PF.dlgDefs)
        PF.safe("dlg:" + id, () => G.dialogue.register(id, t));
    if (PF.live("quests") && G.quests.define)
      for (const q of PF.questDefs)
        PF.safe("quest:" + q.id, () => G.quests.define(q));
  };

  // -------------------------------------------------------------------
  // Quest helpers (all defensive)
  // -------------------------------------------------------------------
  const Q = () => (PF.live("quests") ? G.quests : null);
  PF.q = {
    start(id, opts) {
      const q = Q();
      return q ? PF.safe("qstart", () => q.start(id, opts)) : false;
    },
    stage(id) {
      const q = Q();
      return q ? PF.safe("qstage", () => q.stage(id)) : null;
    },
    set(id, st) {
      const q = Q();
      return q ? PF.safe("qset", () => q.setStage(id, st)) : false;
    },
    done(id) {
      const q = Q();
      return q ? PF.safe("qdone", () => q.complete(id)) : false;
    },
    active(id) {
      const q = Q();
      return q ? !!PF.safe("qactive", () => q.isActive(id)) : false;
    },
    complete(id) {
      const q = Q();
      return q ? !!PF.safe("qcomplete", () => q.isComplete(id)) : false;
    },
    started(id) {
      const q = Q();
      if (!q) return false;
      return !!PF.safe("qstarted", () =>
        q.isStarted ? q.isStarted(id) : q.isActive(id) || q.isComplete(id),
      );
    },
    /** Advance to `st` only if the quest is currently at one of `from` (array or string). */
    advance(id, from, st) {
      const cur = PF.q.stage(id);
      const f = Array.isArray(from) ? from : [from];
      if (PF.q.active(id) && f.indexOf(cur) >= 0) return PF.q.set(id, st);
      return false;
    },
  };

  // -------------------------------------------------------------------
  // Player helpers
  // -------------------------------------------------------------------
  PF.inv = {
    count(id) {
      return PF.live("inventory")
        ? PF.safe("invcount", () => G.inventory.count(id)) || 0
        : 0;
    },
    add(id, n, opts) {
      if (PF.live("inventory"))
        PF.safe("invadd", () => G.inventory.add(id, n || 1, opts));
    },
    remove(id, n) {
      if (PF.live("inventory"))
        PF.safe("invrem", () => G.inventory.remove(id, n || 1));
    },
    /** Federal ration scrip in the pack. */
    scrip() {
      const I = PF.live("inventory") ? G.inventory : null;
      return I
        ? PF.safe("scrip", () => (I.scrip ? I.scrip() : I.count("scrip"))) || 0
        : 0;
    },
    addScrip(n) {
      const I = PF.live("inventory") ? G.inventory : null;
      if (I)
        PF.safe("addscrip", () =>
          I.addScrip
            ? I.addScrip(n)
            : n >= 0
              ? I.add("scrip", n)
              : I.remove("scrip", -n),
        );
    },
    pay(n) {
      if (PF.inv.scrip() < n) return false;
      PF.inv.addScrip(-n);
      return true;
    },
  };
  PF.xp = (n, why) => {
    if (PF.live("rpg") && G.rpg.addXP) PF.safe("xp", () => G.rpg.addXP(n, why));
  };
  PF.standing = (n, why) => {
    if (PF.live("rpg") && G.rpg.addStanding)
      PF.safe("standing", () => G.rpg.addStanding(n, why));
  };
  PF.skill = (id) =>
    PF.live("rpg") && G.rpg.skill
      ? PF.safe("skill", () => G.rpg.skill(id)) || 0
      : 0;
  PF.sfx = (name, pos, o) => {
    try {
      return G.sfx.play(name, Object.assign({ pos }, o || {}));
    } catch (e) {
      return null;
    }
  };
  PF.news = (text) => {
    try {
      if (PF.live("radio") && G.radio.addNews) G.radio.addNews(text);
    } catch (e) {
      /* optional */
    }
  };

  // -------------------------------------------------------------------
  // Locks: keys, codes and passcodes (G.locks; specs registered at initDone).
  // Every lock is declared with PF.regLock next to the thing it guards; its
  // unlock (key item, note, tape reel, terminal entry, dialogue line, wall
  // scrawl) is placed in this module and taught declaratively (`learn` on item
  // defs / terminal entries / dialogue nodes) or via PF.codeReadable.
  // -------------------------------------------------------------------
  PF._locks = PF._locks || [];
  PF._learnSrc = PF._learnSrc || [];
  PF._keySrc = PF._keySrc || [];
  let locksLive = false;
  const regNow = (s) => {
    if (PF.live("locks") && G.locks.register)
      PF.safe("lock:" + s.id, () => G.locks.register(s));
  };
  /** Declare a lock spec {id, label, key?, code?, passcode?, hint, kind?}; returns the spec (pass it inline as `lock:`). */
  PF.regLock = function (spec) {
    if (!spec || !spec.id) return spec;
    if (!PF._locks.some((s) => s.id === spec.id)) PF._locks.push(spec);
    if (locksLive) regNow(spec);
    return spec;
  };
  PF.lockSpec = (id) => PF._locks.find((s) => s.id === id) || null;
  /** The player found the code / passcode for lockId (scripted sources; items, terminals and dialogue use `learn`). */
  PF.learn = (lockId, src) => {
    if (PF.live("locks") && G.locks.learn)
      PF.safe("learn:" + lockId, () => G.locks.learn(lockId, src));
  };
  PF.lockIsOpen = (id) =>
    PF.live("locks") && G.locks.isOpen
      ? !!PF.safe("lockIsOpen", () => G.locks.isOpen(id))
      : false;
  /** Interact with a lock: G.locks handles key / keypad / passcode; key-only fallback while the registry is absent. */
  PF.lockOpen = function (spec, onOpen) {
    if (typeof spec === "string") spec = PF.lockSpec(spec) || { id: spec };
    if (PF.live("locks") && G.locks.open) {
      PF.safe("lockOpen:" + spec.id, () => G.locks.open(spec, onOpen));
      return;
    }
    if (spec.key && PF.inv.count(spec.key) > 0) {
      onOpen();
      return;
    }
    PF.sfx("door_locked");
    try {
      G.notify("Locked.");
    } catch (e) {
      /* ignore */
    }
  };
  /** Declare (for G.locks.audit) where a code is learned / a key is handed over by script. */
  PF.learnFrom = (lockId, label) => {
    PF._learnSrc.push([lockId, label]);
  };
  PF.keyFrom = (itemId, label) => {
    PF._keySrc.push([itemId, label]);
  };
  /** A readable thing (wall scrawl, tag, plaque) that teaches a code. pos: world Vector3. Builds at once. */
  PF.codeReadable = function (pos, label, text, lockId) {
    if (lockId) PF.learnFrom(lockId, "readable: " + label);
    return PF.use({
      pos,
      radius: 0.6,
      range: 2.4,
      label,
      verb: "Read",
      onInteract() {
        try {
          G.notify(label + " — " + text);
        } catch (e) {
          /* ignore */
        }
        PF.sfx("ui_click");
        if (lockId) PF.learn(lockId, label);
      },
    });
  };
  G.events.on("initDone", () => {
    locksLive = true;
    PF._locks.forEach(regNow);
    if (!PF.live("locks")) return;
    for (const [id, l] of PF._learnSrc)
      PF.safe(
        "learnsrc",
        () => G.locks.learnableFrom && G.locks.learnableFrom(id, l),
      );
    for (const [it, l] of PF._keySrc)
      PF.safe(
        "keysrc",
        () => G.locks.obtainableFrom && G.locks.obtainableFrom(it, l),
      );
  });

  // -------------------------------------------------------------------
  // Named NPC roster (spawned on newGame and after every load)
  // -------------------------------------------------------------------
  PF.npcDefs = [];
  PF.npcs = {};
  /** def: G.actors.spawn def with a stable `id`; optional `when()` gate, `after(actor)` hook. */
  PF.npc = function (def) {
    PF.npcDefs.push(def);
    return def.id;
  };
  PF.getNpc = function (id) {
    const a = PF.npcs[id];
    if (a && !a.removed && !a._removed) return a;
    if (PF.live("actors") && G.actors.get) {
      const b = PF.safe("actors.get", () => G.actors.get(id));
      if (b) {
        PF.npcs[id] = b;
        return b;
      }
    }
    return null;
  };
  PF.spawnNpc = function (def) {
    if (!PF.live("actors") || !G.actors.spawn) return null;
    const ex = PF.getNpc(def.id);
    if (ex) return ex;
    const d = Object.assign({}, def);
    delete d.when;
    delete d.after;
    delete d.lookYaw;
    const a = PF.safe("spawn:" + def.id, () => G.actors.spawn(d));
    if (a) {
      PF.npcs[def.id] = a;
      if (def.lookYaw !== undefined) a.yaw = def.lookYaw;
      if (def.after) PF.safe("after:" + def.id, () => def.after(a));
    }
    return a;
  };
  PF.spawnRoster = function () {
    for (const def of PF.npcDefs) {
      if (def.when && !PF.safe("when:" + def.id, def.when)) continue;
      PF.spawnNpc(def);
    }
  };
  PF.say = (id, text, dur) => {
    const a = PF.getNpc(id);
    if (a && !a.dead && a.say) PF.safe("say", () => a.say(text, dur || 4));
  };

  // -------------------------------------------------------------------
  // Area triggers (checked 5×/s while the world runs)
  // -------------------------------------------------------------------
  PF.triggers = [];
  /** box: {x0,x1,y0,y1,z0,z1}; fn() fires when the player is inside and cond() (optional) holds; once unless repeat. */
  PF.trigger = function (box, fn, opts) {
    const t = Object.assign({ box, fn, fired: false }, opts || {});
    PF.triggers.push(t);
    return t;
  };
  let trigT = 0;
  PF.updaters.push(function (dt) {
    trigT -= dt;
    if (trigT > 0) return;
    trigT = 0.2;
    const p = G.player && G.player.pos;
    if (!p) return;
    for (const t of PF.triggers) {
      if (t.fired && !t.repeat) continue;
      const b = t.box;
      if (p.x < b.x0 || p.x > b.x1 || p.z < b.z0 || p.z > b.z1) {
        if (t.repeat) t.inside = false;
        continue;
      }
      if (b.y0 !== undefined && (p.y < b.y0 || p.y > b.y1)) {
        if (t.repeat) t.inside = false;
        continue;
      }
      if (t.cond && !PF.safe("trig:cond", t.cond)) continue;
      if (t.repeat && t.inside) continue;
      t.inside = true;
      t.fired = true;
      PF.safe("trig", t.fn);
    }
  });
  PF.onReset.push(() => {
    for (const t of PF.triggers) {
      t.fired = false;
      t.inside = false;
    }
  });

  // -------------------------------------------------------------------
  // Glow sprites (fake light) — parented so they hide with the cell
  // -------------------------------------------------------------------
  PF.glowQ = [];
  PF.glow = function (pos, color, size, parent, opts) {
    const rec = {
      pos: pos.clone ? pos.clone() : V3(pos.x, pos.y, pos.z),
      color,
      size,
      parent: parent || null,
      opts: opts || {},
    };
    if (!PF.makeGlow(rec)) PF.glowQ.push(rec);
    return rec;
  };
  PF.makeGlow = function (rec) {
    if (!PF.live("fx") || typeof G.fx.glowSprite !== "function") return false;
    return !!PF.safe("glow", () => {
      const o = Object.assign({}, rec.opts);
      if (rec.parent) o.parent = rec.parent;
      const s = G.fx.glowSprite(rec.pos, rec.color, rec.size, o);
      if (s && s.isObject3D && !s.parent) (rec.parent || G.scene).add(s);
      rec.sprite = s;
      return true;
    });
  };

  // -------------------------------------------------------------------
  // Static world pickups (notes, tape reels, uniques) — spawned at initDone
  // -------------------------------------------------------------------
  PF.pickupQ = [];
  PF.pickup = function (id, n, pos, opts) {
    PF.pickupQ.push({
      id,
      n: n || 1,
      pos: pos.clone ? pos.clone() : V3(pos.x, pos.y, pos.z),
      opts: opts || {},
    });
  };
  PF.spawnPickups = function () {
    if (!PF.live("items") || typeof G.items.spawnPickup !== "function") return;
    for (const p of PF.pickupQ)
      PF.safe("pickup:" + p.id, () =>
        G.items.spawnPickup(
          p.id,
          p.n,
          p.pos,
          Object.assign({ static: true }, p.opts),
        ),
      );
  };

  // -------------------------------------------------------------------
  // Persistent props (containers, terminals, lamps...) — spawned at initDone
  // -------------------------------------------------------------------
  PF.propQ = [];
  PF.prop = function (type, opts) {
    PF.propQ.push({ type, opts });
  };
  PF.spawnProps = function () {
    for (const p of PF.propQ) PF.spawnProp(p.type, p.opts);
  };

  // -------------------------------------------------------------------
  // Custom interactables with a label that can change (switches, nests...)
  // -------------------------------------------------------------------
  PF.use = function (def) {
    return PF.safe("interactable", () =>
      G.world.addInteractable(
        Object.assign({ radius: 0.8, range: 2.8, priority: 1 }, def),
      ),
    );
  };
  /** Interior load door with stable id. */
  PF.door = function (def) {
    return PF.safe("door", () =>
      G.world.addDoor(Object.assign({ radius: 1.3 }, def)),
    );
  };

  // -------------------------------------------------------------------
  // Custom materials for this module (added to the lib's table)
  // -------------------------------------------------------------------
  const MD = PF.MAT_DEFS;
  Object.assign(MD, {
    brownstone_t: {
      src: "stone_brownstone",
      custom: "sandstone",
      color: 0x9e7a6a,
      tint: 0xf0c8b4,
      rough: 0.95,
      uv: 3,
    },
    brownstone_dk: {
      src: "stone_brownstone",
      custom: "sandstone",
      color: 0x6a4c40,
      tint: 0xb89080,
      rough: 0.95,
      uv: 3,
    },
    cobble: { src: "cobblestone", color: 0x6a645a, rough: 0.95, uv: 3 },
    brick_tan: { src: "brick_tan", color: 0xa0805a, rough: 0.95, uv: 3 },
    brick_white: { src: "brick_white", color: 0xc8c0b0, rough: 0.95, uv: 3 },
    brick_fed: {
      src: "brick_red",
      color: 0x8a4a34,
      tint: 0xd09070,
      rough: 0.95,
      uv: 2.6,
    },
    slate: {
      src: "granite",
      color: 0x3c3e40,
      tint: 0x55585c,
      rough: 0.85,
      uv: 2,
    },
    fed_stone: {
      custom: "buffstone",
      prefer: "custom",
      color: 0xb8a282,
      tint: 0xd8ccb0,
      rough: 0.9,
      uv: 3.5,
      bump: 0.8,
    },
    fed_rust: {
      custom: "granite_ashlar",
      prefer: "custom",
      color: 0x9a8c74,
      tint: 0xc0b090,
      rough: 0.92,
      uv: 2.4,
      bump: 1.0,
    },
    vault_steel: {
      src: "metal_scratched",
      color: 0x8a8e90,
      tint: 0xb8bcbe,
      rough: 0.35,
      metal: 0.8,
      uv: 3,
    },
    vault_dark: {
      src: "metal_panel",
      color: 0x3a3e40,
      tint: 0x5a5e62,
      rough: 0.5,
      metal: 0.6,
      uv: 3,
    },
    goldbar: {
      color: 0xd4a23a,
      emissive: 0x5a3a08,
      emissiveIntensity: 0.5,
      rough: 0.28,
      metal: 0.75,
      uv: 1,
      plain: true,
    },
    brass: { color: 0x9a7a3a, rough: 0.35, metal: 0.8, uv: 2, plain: true },
    white_paint: {
      src: "metal_painted",
      color: 0xc8c4b8,
      tint: 0xe8e4d8,
      rough: 0.7,
      metal: 0.1,
      uv: 3,
    },
    hull_black: {
      src: "metal_painted",
      color: 0x1c1c1e,
      tint: 0x2c2c2e,
      rough: 0.6,
      metal: 0.4,
      uv: 3,
    },
    hull_red: {
      src: "metal_painted",
      color: 0x7a2018,
      tint: 0x9a3020,
      rough: 0.65,
      metal: 0.35,
      uv: 3,
    },
    hull_white: {
      src: "paint_cream",
      color: 0xd0ccc0,
      tint: 0xf2eee4,
      rough: 0.65,
      metal: 0.2,
      uv: 3,
    },
    deck_wood: {
      src: "wood_planks",
      color: 0x7a6a50,
      tint: 0xa89a80,
      rough: 0.9,
      uv: 2,
    },
    mahogany: {
      src: "wood_planks",
      color: 0x4a2a1a,
      tint: 0x7a4a34,
      rough: 0.6,
      uv: 2,
    },
    oak: {
      src: "wood_planks",
      color: 0x6a4e30,
      tint: 0x9a7a54,
      rough: 0.7,
      uv: 2,
    },
    plaster_w: {
      src: "plaster_stained",
      color: 0xb8b0a0,
      tint: 0xe0d8c8,
      rough: 0.95,
      uv: 4,
    },
    // kept-up painted plaster (settlements that sweep their floors): smooth stucco, tinted per room
    plaster_clean: {
      custom: "stucco",
      prefer: "custom",
      color: 0xd8d0bc,
      tint: 0xe6dcc4,
      rough: 0.9,
      uv: 5,
    },
    plaster_blue: {
      custom: "stucco",
      prefer: "custom",
      color: 0x9aa8a4,
      tint: 0xa6b6b4,
      rough: 0.9,
      uv: 5,
    },
    wallpaper_g: {
      src: "wallpaper",
      color: 0x5a6a50,
      tint: 0x8a9a78,
      rough: 0.95,
      uv: 2.5,
    },
    tile_sub: { src: "tile_subway", color: 0xd8d4c8, rough: 0.5, uv: 2 },
    tar: { src: "roof_tar", color: 0x2a2a28, rough: 0.95, uv: 5 },
    copper: {
      src: "copper_patina",
      color: 0x5f9884,
      rough: 0.8,
      metal: 0.2,
      uv: 4,
      custom: "verdigris",
      tint: 0xb8d8cc,
    },
    rope: { src: "burlap", color: 0x8a7a58, tint: 0xb0a080, rough: 1, uv: 0.5 },
    moss: {
      src: "grass_dead",
      color: 0x4a5a30,
      tint: 0x6a7a44,
      rough: 1,
      uv: 3,
    },
    egg: {
      color: 0xc8c49a,
      emissive: 0x6a8a20,
      emissiveIntensity: 0.35,
      rough: 0.35,
      uv: 1,
      plain: true,
    },
    slime: {
      color: 0x3a4a1a,
      emissive: 0x2a4a08,
      emissiveIntensity: 0.4,
      rough: 0.2,
      metal: 0.1,
      uv: 2,
      plain: true,
    },
    laser: {
      color: 0xff3020,
      emissive: 0xff1808,
      emissiveIntensity: 3.0,
      rough: 1,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    candle: { color: 0xf0e8d0, rough: 0.8, uv: 1, plain: true },
    flame: {
      color: 0xffc060,
      emissive: 0xffa030,
      emissiveIntensity: 3.0,
      rough: 1,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    lamp_warm: {
      color: 0xffe0a0,
      emissive: 0xffc070,
      emissiveIntensity: 2.0,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    lamp_blue: {
      color: 0x90c0ff,
      emissive: 0x4080ff,
      emissiveIntensity: 1.8,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    velvet: {
      src: "fabric",
      color: 0x5a1a1c,
      tint: 0x8a2a2a,
      rough: 1,
      uv: 1.5,
    },
    linen: {
      src: "fabric",
      color: 0xb8b0a0,
      tint: 0xe8e0d0,
      rough: 1,
      uv: 1.5,
    },
    money: {
      src: "paper",
      color: 0x7a9070,
      tint: 0x9ab890,
      rough: 1,
      uv: 0.5,
      noShadow: true,
    },
    fish: {
      color: 0x9aa4a0,
      emissive: 0x1a2020,
      emissiveIntensity: 0.4,
      rough: 0.3,
      metal: 0.25,
      uv: 1,
      plain: true,
    },
    fish_dark: { color: 0x4a5048, rough: 0.5, metal: 0.1, uv: 1, plain: true },
    slush: {
      src: "concrete",
      color: 0x9aa09c,
      tint: 0xb8c0bc,
      rough: 0.25,
      uv: 2,
    },
    net: { src: "chainlink", color: 0x6a6450, tint: 0x9a9070, rough: 1, uv: 1 },
  });

  // -------------------------------------------------------------------
  // Stained glass & custom textures
  // -------------------------------------------------------------------
  const TAU = Math.PI * 2;
  /** Leaded stained-glass lancet (uv 0..1). variant picks the palette / motif. */
  PF.stainedTex = function (variant) {
    return PF.canvasTex(
      "pf_stained_" + variant,
      256,
      512,
      (ctx, w, h) => {
        const r = PF.rng(900 + variant * 31);
        const pal = [
          ["#1a3a8a", "#2a5ac0", "#b02820", "#e0b030", "#2a8a4a", "#6a2a8a"],
          ["#8a1a1a", "#c03020", "#e0a020", "#1a4a9a", "#e8d8a0", "#3a7a3a"],
          ["#1a4a6a", "#3a8aa0", "#d0a030", "#8a2a4a", "#2a2a7a", "#c8c060"],
        ][variant % 3];
        ctx.fillStyle = "#101010";
        ctx.fillRect(0, 0, w, h);
        // random quarry panes
        const cell = 22;
        for (let y = 0; y < h; y += cell)
          for (let x = 0; x < w; x += cell) {
            const c = pal[Math.floor(r() * pal.length)];
            ctx.fillStyle = c;
            ctx.globalAlpha = 0.55 + r() * 0.45;
            ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
          }
        ctx.globalAlpha = 1;
        // central figure medallions (abstract saints / symbols)
        const meds = [
          [w / 2, h * 0.22, 70],
          [w / 2, h * 0.55, 80],
          [w / 2, h * 0.83, 60],
        ];
        meds.forEach(([cx, cy, rr], i) => {
          ctx.fillStyle = "#0c0c0c";
          ctx.beginPath();
          ctx.arc(cx, cy, rr + 6, 0, TAU);
          ctx.fill();
          const g = ctx.createRadialGradient(cx, cy - rr * 0.3, 4, cx, cy, rr);
          g.addColorStop(0, pal[(i + 3) % pal.length]);
          g.addColorStop(1, pal[i % pal.length]);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, TAU);
          ctx.fill();
          // figure: halo + robe silhouette
          ctx.fillStyle = "#e8c860";
          ctx.beginPath();
          ctx.arc(cx, cy - rr * 0.45, rr * 0.28, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#f0e0c0";
          ctx.beginPath();
          ctx.arc(cx, cy - rr * 0.45, rr * 0.16, 0, TAU);
          ctx.fill();
          ctx.fillStyle = pal[(i + 1) % pal.length];
          ctx.beginPath();
          ctx.moveTo(cx - rr * 0.45, cy + rr * 0.8);
          ctx.quadraticCurveTo(
            cx,
            cy - rr * 0.4,
            cx + rr * 0.45,
            cy + rr * 0.8,
          );
          ctx.fill();
          ctx.strokeStyle = "#0a0a0a";
          ctx.lineWidth = 4;
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * TAU;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
            ctx.stroke();
          }
        });
        // lead cames
        ctx.strokeStyle = "#080808";
        ctx.lineWidth = 3;
        for (let y = 0; y < h; y += cell) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        for (let x = 0; x < w; x += cell) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        // grime and broken panes
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = "rgba(20,16,10," + (0.1 + r() * 0.3) + ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            10 + r() * 40,
            8 + r() * 30,
            r() * 3,
            0,
            TAU,
          );
          ctx.fill();
        }
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = "#050505";
          const x = Math.floor((r() * w) / cell) * cell,
            y = Math.floor((r() * h) / cell) * cell;
          ctx.fillRect(x, y, cell, cell);
        }
      },
      { clamp: true },
    );
  };
  /** Material key for a stained-glass texture (emissive so it glows in the dark nave). */
  PF.stainedKey = function (variant, glow) {
    return PF.texMat(
      "stained_" + variant + "_" + (glow || 1),
      PF.stainedTex(variant),
      {
        emissive: glow || 1.0,
        rough: 0.4,
        noShadow: true,
        side: THREE.DoubleSide,
      },
    );
  };
  /** A pointed-arch (lancet) shape in XY: width w, height h, spring at h - w*k. */
  PF.lancetShape = function (w, h, k) {
    const sh = new THREE.Shape();
    const spring = h - w * (k || 0.85);
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(w / 2, spring);
    sh.quadraticCurveTo(w / 2, h - w * 0.12, 0, h);
    sh.quadraticCurveTo(-w / 2, h - w * 0.12, -w / 2, spring);
    sh.closePath();
    return sh;
  };
  /** Shape geometry with uvs normalised to 0..1 over its bounding box. */
  PF.shapeGeo = function (shape, segs) {
    const g = new THREE.ShapeGeometry(shape, segs || 6);
    g.computeBoundingBox();
    const bb = g.boundingBox,
      uv = g.attributes.uv,
      p = g.attributes.position;
    for (let i = 0; i < p.count; i++)
      uv.setXY(
        i,
        (p.getX(i) - bb.min.x) / (bb.max.x - bb.min.x || 1),
        (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y || 1),
      );
    return g;
  };
  /**
   * Pointed-arch opening frame (voussoirs) + optional glazing on a wall.
   * (x,y,z) = bottom centre on the wall face, ry = facing, w/h opening, depth = reveal depth.
   * opts: {glass: materialKey, frame: key, frameW, sill}
   */
  PF.lancetWindow = function (b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const fk = opts.frame || "limestone";
    const fw = opts.frameW || 0.22;
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const out = opts.out === undefined ? 0.05 : opts.out;
    if (opts.glass) {
      const g = PF.shapeGeo(PF.lancetShape(w, h, opts.k), 8);
      b.add(opts.glass, g, {
        m: PF.m4(x - s * 0.02, y, z - c * 0.02, ry),
        uv: "keep",
        grime: 0.05,
        noAO: true,
      });
    }
    // frame: two jambs + curved arch approximated by segments
    const spring = h - w * (opts.k || 0.85);
    const P = (lx, ly, lz) =>
      new THREE.Vector3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    for (const sg of [-1, 1])
      b.beam(
        fk,
        P(sg * (w / 2 + fw / 2), 0, out),
        P(sg * (w / 2 + fw / 2), spring, out),
        fw,
        fw,
        { twist: ry, grime: 0.4 },
      );
    const N = 6;
    for (const sg of [-1, 1]) {
      let prev = null;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        // quadratic from (±w/2, spring) via (±w/2, h - w*0.12) to (0, h)
        const ax = sg * (w / 2 + fw / 2),
          ay = spring,
          bx = sg * (w / 2 + fw / 2),
          by = h - w * 0.12 + fw * 0.4,
          cx = 0,
          cy = h + fw * 0.5;
        const px = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * bx + t * t * cx,
          py = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * by + t * t * cy;
        const cur = P(px, py, out);
        if (prev) b.beam(fk, prev, cur, fw, fw, { grime: 0.4 });
        prev = cur;
      }
    }
    if (opts.mullion)
      b.beam(
        fk,
        P(0, 0, out * 0.5),
        P(0, spring + (h - spring) * 0.6, out * 0.5),
        0.08,
        0.08,
        {},
      );
    if (opts.sill !== false)
      b.box(
        fk,
        x + s * out,
        y - 0.18,
        z + c * out,
        w + fw * 2 + 0.2,
        0.18,
        0.35,
        { ry, seg: false, grime: 0.4 },
      );
  };
  /**
   * Axis-aligned wall with rectangular openings at any height (+ colliders).
   * axis 'x': runs along x from a0..a1, occupying z f0..f1. axis 'z': runs along z (a0..a1), occupying x f0..f1.
   * gaps: [{c, w, y0, h}] — c/w along the run, y0 absolute bottom. opts: {grime, noCollide, surface}
   */
  // grey street daylight seen through door lites / transoms from inside (emissive, never lit by baked lights)
  PF.MAT_DEFS.daylight = {
    color: 0x8a9082,
    emissive: 0xc8ccb4,
    emissiveIntensity: 0.75,
    rough: 0.3,
    uv: 1,
    plain: true,
    noShadow: true,
  };
  /**
   * Street door seen from INSIDE, filling a wall opening (so the exit reads as a door, not a hole into the void):
   * two panelled leaves with glazed upper lites and a transom, all showing grey daylight.
   * (x, y, z) = bottom centre of the opening on the wall's inner face; ry turns the face toward the room
   * (ry 0 faces +Z, PI faces -Z, HP faces -X... same convention as PF.m4). o: {key, frame, lites, transom}
   */
  PF.exitDoor = function (b, x, y, z, ry, w, h, o) {
    o = o || {};
    const key = o.key || "oak",
      frame = o.frame || key;
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const P = (lx, ly, lz) =>
      V3(x + lx * c + lz * s, y + ly, z - lx * s + lz * c);
    const box = (k, lx, ly, lz, bw, bh, bd, op) => {
      const p = P(lx, ly, lz);
      b.box(
        k,
        p.x,
        p.y,
        p.z,
        bw,
        bh,
        bd,
        Object.assign({ ry, seg: false }, op || {}),
      );
    };
    const quad = (k, lx, ly, lz, qw, qh) => {
      const p = P(lx, ly, lz);
      b.quad(k, p.x, p.y, p.z, qw, qh, { ry, noAO: true, grime: 0 });
    };
    const tH = o.transom === false ? 0 : Math.min(0.7, h * 0.18);
    const dH = h - tH;
    // daylight backing behind everything (fills the opening; the leaves sit in front of it)
    quad("daylight", 0, h / 2, -0.12, w, h);
    // frame
    box(frame, -w / 2 + 0.06, 0, 0, 0.12, h, 0.2);
    box(frame, w / 2 - 0.06, 0, 0, 0.12, h, 0.2);
    box(frame, 0, h - 0.1, 0, w, 0.12, 0.2);
    if (tH) {
      box(frame, 0, dH - 0.06, 0, w, 0.14, 0.2);
      const n = Math.max(2, Math.round(w / 0.5));
      for (let i = 1; i < n; i++)
        box(frame, -w / 2 + (i * w) / n, dH, -0.02, 0.04, tH - 0.1, 0.05);
    }
    // leaves: lower solid panels, upper glazed lites with muntins
    const lw = (w - 0.24) / 2;
    for (const sd of [-1, 1]) {
      const cx = sd * (lw / 2 + 0.01);
      const liteY0 = dH * 0.5,
        liteH = dH * 0.42;
      box(key, cx, 0, 0.0, lw, liteY0, 0.07, { grime: 0.5 }); // lower leaf
      box(key, cx, liteY0 + liteH, 0.0, lw, dH - 0.08 - liteY0 - liteH, 0.07, {
        grime: 0.5,
      }); // top rail
      box(key, cx - lw / 2 + 0.06, liteY0, 0.0, 0.12, liteH, 0.07);
      box(key, cx + lw / 2 - 0.06, liteY0, 0.0, 0.12, liteH, 0.07);
      if (o.lites !== false) {
        box(key, cx, liteY0 + liteH / 2 - 0.02, 0.02, lw - 0.2, 0.04, 0.03);
        box(key, cx, liteY0, 0.02, 0.04, liteH, 0.03);
      } else quad(key, cx, liteY0 + liteH / 2, 0.0, lw - 0.2, liteH);
      box(key, cx, 0.2, 0.05, lw - 0.24, liteY0 - 0.4, 0.03, { grime: 0.6 }); // raised lower panel
      box("brass", sd * 0.1, dH * 0.46, 0.07, 0.04, 0.34, 0.04); // pull handles
    }
    // a crack of daylight under the doors
    quad("daylight", 0, 0.02, 0.05, w - 0.3, 0.04);
  };

  PF.wall = function (b, key, axis, a0, a1, f0, f1, y0, y1, gaps, opts) {
    opts = opts || {};
    gaps = gaps || [];
    const cuts = [a0, a1];
    for (const g of gaps) {
      cuts.push(
        Math.max(a0, Math.min(a1, g.c - g.w / 2)),
        Math.max(a0, Math.min(a1, g.c + g.w / 2)),
      );
    }
    cuts.sort((p, q) => p - q);
    for (let i = 0; i < cuts.length - 1; i++) {
      const p = cuts[i],
        q = cuts[i + 1];
      if (q - p < 0.02) continue;
      const mid = (p + q) / 2;
      const holes = gaps
        .filter((g) => mid > g.c - g.w / 2 && mid < g.c + g.w / 2)
        .map((g) => [g.y0, g.y0 + g.h])
        .sort((u, v) => u[0] - v[0]);
      let y = y0;
      const spans = [];
      for (const h of holes) {
        if (h[0] > y + 0.02) spans.push([y, Math.min(h[0], y1)]);
        y = Math.max(y, h[1]);
      }
      if (y < y1 - 0.02) spans.push([y, y1]);
      for (const [ya, yb] of spans) {
        if (yb - ya < 0.02) continue;
        if (axis === "x") {
          b.boxMM(key, p, ya, f0, q, yb, f1, { grime: opts.grime, segLen: 4 });
          if (!opts.noCollide)
            PF.colMM(p, ya, f0, q, yb, f1, {
              walkable: false,
              surface: opts.surface,
            });
        } else {
          b.boxMM(key, f0, ya, p, f1, yb, q, { grime: opts.grime, segLen: 4 });
          if (!opts.noCollide)
            PF.colMM(f0, ya, p, f1, yb, q, {
              walkable: false,
              surface: opts.surface,
            });
        }
      }
    }
  };
  /** Standalone mesh with a shared module material (adds the white vertex colour the materials expect). */
  PF.mesh = function (key, geo) {
    const n = geo.attributes.position.count;
    const c = new Float32Array(n * 3).fill(1);
    geo.setAttribute("color", new THREE.BufferAttribute(c, 3));
    const m = new THREE.Mesh(geo, PF.mat(key));
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  };
  /** Readable plaque: interactable that shows text. */
  /**
   * Live flames (G.fx.fire: flame billboards, embers, crackle, optional flickering pool light) for hearths,
   * cook-fires and burning barrels. Created at initDone; the static 'fire' geometry stays as the ember bed.
   * PF.fires (pushed by PF.barrel({fire:true})) is consumed here too.
   */
  PF.fireQ = [];
  PF.fireAt = function (pos, scale, opts) {
    PF.fireQ.push({
      pos: pos.clone ? pos.clone() : V3(pos.x, pos.y, pos.z),
      scale: scale || 0.5,
      opts: opts || {},
    });
  };
  PF.startFires = function () {
    if (!PF.live("fx") || typeof G.fx.fire !== "function") return;
    for (const p of (PF.fires || []).splice(0))
      PF.fireQ.push({ pos: p.clone().setY(p.y - 0.15), scale: 0.45, opts: {} });
    for (const f of PF.fireQ.splice(0))
      PF.safe("fire", () =>
        G.fx.fire(f.pos, f.scale, Object.assign({ lod: 90 }, f.opts)),
      );
  };
  PF.readable = function (pos, title, text, verb) {
    PF.use({
      pos,
      radius: 0.6,
      range: 2.6,
      label: title,
      verb: verb || "Read",
      onInteract() {
        G.notify(title + " — " + text, { duration: 10 });
        PF.sfx("ui_click");
      },
    });
  };
  /** Candle cluster (emissive flames + one glow). */
  PF.candles = function (b, x, y, z, n, seed, parent) {
    const r = PF.rng(seed || x * 3 + z * 5);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = r() * 0.18,
        hh = 0.08 + r() * 0.22;
      const cx = x + Math.cos(a) * d,
        cz = z + Math.sin(a) * d;
      b.cyl("candle", cx, y, cz, 0.022, 0.026, hh, 6, { hSeg: 1, grime: 0.2 });
      b.sphere("flame", cx, y + hh + 0.03, cz, 0.018, {
        ws: 4,
        hs: 3,
        sy: 2,
        noAO: true,
        grime: 0,
      });
    }
    PF.glow(V3(x, y + 0.3, z), 0xffb060, 0.9, parent, {
      intensity: 1.2,
      flicker: 0.25,
    });
  };
})();
