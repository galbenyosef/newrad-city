// play-inline-204 02 — safe
// Lines 18-362 of readable/play-inline-204.pretty.js (statement-aligned).
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
