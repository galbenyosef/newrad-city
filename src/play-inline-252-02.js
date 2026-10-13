// play-inline-252 02 — def
// Lines 18-367 of readable/play-inline-252.pretty.js (statement-aligned).
  const PF = G._pbr;
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
        G.reportError("poi_bridges:" + tag, e);
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
    root.name = "pbr_cell_" + key;
    root.visible = false;
    G.scene.add(root);
    const c = { key, origin: { x: o.x, y: o.y, z: o.z }, root, subs: [] };
    PF.cells[key] = c;
    return c;
  };
  /** Sub-root inside a cell, visible only while test(p) is true (p = camera world pos). */
  PF.subRoot = function (cell, name, test) {
    const g = new THREE.Group();
    g.name = "pbr_sub_" + name;
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
        G.reportError("poi_bridges:flag", e);
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
    scrip() {
      return PF.live("inventory")
        ? PF.safe("scrip", () => G.inventory.scrip()) || 0
        : 0;
    },
    addScrip(n) {
      if (PF.live("inventory"))
        PF.safe("addscrip", () => G.inventory.addScrip(n));
    },
    pay(n) {
      if (PF.inv.scrip() < n) return false;
      PF.inv.addScrip(-n);
      return true;
    },
  };
  PF.anchorOf = function (poi, name) {
    try {
      return G.pois.getAnchor(poi, name);
    } catch (e) {
      return null;
    }
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
