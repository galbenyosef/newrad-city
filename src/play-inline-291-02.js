// play-inline-291 02 — def
// Lines 18-370 of readable/play-inline-291.pretty.js (statement-aligned).
  const PM = G._pm2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  PM.V3 = V3;

  // -------------------------------------------------------------------
  // Safe call helper
  // -------------------------------------------------------------------
  PM.safe = function (tag, fn) {
    try {
      return fn();
    } catch (e) {
      try {
        G.reportError("poi_midtown2:" + tag, e);
      } catch (e2) {
        console.warn(e);
      }
      return undefined;
    }
  };
  PM.live = (ns) => {
    try {
      return !G.isStub(ns);
    } catch (e) {
      return false;
    }
  };

  // -------------------------------------------------------------------
  // Interior cells
  // -------------------------------------------------------------------
  PM.cells = PM.cells || {};
  /** Get/create an interior cell record {key, origin, root, subs:[{obj, test(p)}]}. */
  PM.cell = function (key) {
    if (PM.cells[key]) return PM.cells[key];
    const def = G.LAYOUT.INTERIORS[key];
    const o = def ? def.origin : { x: 0, y: 0, z: 0 };
    const root = new THREE.Group();
    root.name = "pm2_cell_" + key;
    root.visible = false;
    G.scene.add(root);
    const c = { key, origin: { x: o.x, y: o.y, z: o.z }, root, subs: [] };
    PM.cells[key] = c;
    return c;
  };
  /** Sub-root inside a cell, visible only while test(p) is true (p = camera world pos). */
  PM.subRoot = function (cell, name, test) {
    const g = new THREE.Group();
    g.name = "pm2_sub_" + name;
    cell.root.add(g);
    cell.subs.push({ obj: g, test });
    return g;
  };
  const _cam = new THREE.Vector3();
  PM.updateCells = function () {
    let p = null;
    if (G.camera) {
      G.camera.getWorldPosition(_cam);
      p = _cam;
    }
    if (!p && G.player) p = G.player.pos;
    if (!p) return;
    for (const k in PM.cells) {
      const c = PM.cells[k];
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
  PM.inCell = function (key) {
    const c = PM.cells[key];
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
  PM.flags = {};
  PM.flagDefaults = {};
  PM.flag = (k) => PM.flags[k];
  PM.setFlag = function (k, v) {
    PM.flags[k] = v === undefined ? true : v;
    for (const fn of PM.flagWatch) {
      try {
        fn(k, PM.flags[k]);
      } catch (e) {
        G.reportError("poi_midtown2:flag", e);
      }
    }
  };
  PM.flagWatch = [];
  PM.resetFlags = function () {
    PM.flags = JSON.parse(JSON.stringify(PM.flagDefaults));
  };

  // -------------------------------------------------------------------
  // Lifecycle hook lists (run by 90_main.js)
  // -------------------------------------------------------------------
  PM.onInitDone = PM.onInitDone || []; // register items/terminals/dialogues/quests, spawn persistent props
  PM.onNewGame = PM.onNewGame || [];
  PM.onReset = PM.onReset || [];
  PM.onLoaded = PM.onLoaded || [];
  PM.updaters = PM.updaters || []; // fn(dt, realDt) every frame while the world runs
  PM.saveHooks = PM.saveHooks || {};

  // -------------------------------------------------------------------
  // Deferred registrations (G.items / G.terminals / G.dialogue / G.quests)
  // -------------------------------------------------------------------
  PM.itemDefs = [];
  PM.termDefs = [];
  PM.dlgDefs = [];
  PM.questDefs = [];
  PM.item = (def) => {
    PM.itemDefs.push(def);
    return def.id;
  };
  PM.terminal = (id, def) => {
    PM.termDefs.push([id, def]);
    return id;
  };
  PM.dialogue = (id, tree) => {
    PM.dlgDefs.push([id, tree]);
    return id;
  };
  PM.quest = (def) => {
    PM.questDefs.push(def);
    return def.id;
  };
  PM.registerContent = function () {
    if (PM.live("items") && G.items.define)
      for (const d of PM.itemDefs)
        PM.safe("item:" + d.id, () =>
          G.items.define(typeof d.build === "function" ? d.build() : d),
        );
    if (PM.live("terminals") && G.terminals.register)
      for (const [id, d] of PM.termDefs)
        PM.safe("term:" + id, () => G.terminals.register(id, d));
    if (PM.live("dialogue") && G.dialogue.register)
      for (const [id, t] of PM.dlgDefs)
        PM.safe("dlg:" + id, () => G.dialogue.register(id, t));
    if (PM.live("quests") && G.quests.define)
      for (const q of PM.questDefs)
        PM.safe("quest:" + q.id, () => G.quests.define(q));
  };

  // -------------------------------------------------------------------
  // Quest helpers (all defensive)
  // -------------------------------------------------------------------
  const Q = () => (PM.live("quests") ? G.quests : null);
  PM.q = {
    start(id, opts) {
      const q = Q();
      return q ? PM.safe("qstart", () => q.start(id, opts)) : false;
    },
    stage(id) {
      const q = Q();
      return q ? PM.safe("qstage", () => q.stage(id)) : null;
    },
    set(id, st) {
      const q = Q();
      return q ? PM.safe("qset", () => q.setStage(id, st)) : false;
    },
    done(id) {
      const q = Q();
      return q ? PM.safe("qdone", () => q.complete(id)) : false;
    },
    active(id) {
      const q = Q();
      return q ? !!PM.safe("qactive", () => q.isActive(id)) : false;
    },
    complete(id) {
      const q = Q();
      return q ? !!PM.safe("qcomplete", () => q.isComplete(id)) : false;
    },
    started(id) {
      const q = Q();
      if (!q) return false;
      return !!PM.safe("qstarted", () =>
        q.isStarted ? q.isStarted(id) : q.isActive(id) || q.isComplete(id),
      );
    },
    /** Advance to `st` only if the quest is currently at one of `from` (array or string). */
    advance(id, from, st) {
      const cur = PM.q.stage(id);
      const f = Array.isArray(from) ? from : [from];
      if (PM.q.active(id) && f.indexOf(cur) >= 0) return PM.q.set(id, st);
      return false;
    },
  };

  // -------------------------------------------------------------------
  // Player helpers
  // -------------------------------------------------------------------
  PM.inv = {
    count(id) {
      return PM.live("inventory")
        ? PM.safe("invcount", () => G.inventory.count(id)) || 0
        : 0;
    },
    add(id, n, opts) {
      if (PM.live("inventory"))
        PM.safe("invadd", () => G.inventory.add(id, n || 1, opts));
    },
    remove(id, n) {
      if (PM.live("inventory"))
        PM.safe("invrem", () => G.inventory.remove(id, n || 1));
    },
    scrip() {
      return PM.live("inventory")
        ? PM.safe("scrip", () => G.inventory.scrip()) || 0
        : 0;
    },
    addScrip(n) {
      if (PM.live("inventory"))
        PM.safe("addscrip", () => G.inventory.addScrip(n));
    },
    pay(n) {
      if (PM.inv.scrip() < n) return false;
      PM.inv.addScrip(-n);
      return true;
    },
  };
  PM.xp = (n, why) => {
    if (PM.live("rpg") && G.rpg.addXP) PM.safe("xp", () => G.rpg.addXP(n, why));
  };
  PM.standing = (n, why) => {
    if (PM.live("rpg") && G.rpg.addStanding)
      PM.safe("standing", () => G.rpg.addStanding(n, why));
  };
  PM.skill = (id) =>
    PM.live("rpg") && G.rpg.skill
      ? PM.safe("skill", () => G.rpg.skill(id)) || 0
      : 0;
  PM.sfx = (name, pos, o) => {
    try {
      return G.sfx.play(name, Object.assign({ pos }, o || {}));
    } catch (e) {
      return null;
    }
  };
  PM.news = (text) => {
    try {
      if (PM.live("radio") && G.radio.addNews) G.radio.addNews(text);
    } catch (e) {
      /* optional */
    }
  };

  // -------------------------------------------------------------------
  // Named NPC roster (spawned on newGame and after every load)
  // -------------------------------------------------------------------
  PM.npcDefs = [];
  PM.npcs = {};
  /** def: G.actors.spawn def with a stable `id`; optional `when()` gate, `after(actor)` hook. */
  PM.npc = function (def) {
    PM.npcDefs.push(def);
    return def.id;
  };
  PM.getNpc = function (id) {
    const a = PM.npcs[id];
    if (a && !a.removed && !a._removed) return a;
    if (PM.live("actors") && G.actors.get) {
      const b = PM.safe("actors.get", () => G.actors.get(id));
      if (b) {
        PM.npcs[id] = b;
        return b;
      }
    }
    return null;
  };
  PM.spawnNpc = function (def) {
    if (!PM.live("actors") || !G.actors.spawn) return null;
    const ex = PM.getNpc(def.id);
    if (ex) return ex;
    const d = Object.assign({}, def);
    delete d.when;
    delete d.after;
    delete d.lookYaw;
    const a = PM.safe("spawn:" + def.id, () => G.actors.spawn(d));
    if (a) {
      PM.npcs[def.id] = a;
      if (def.lookYaw !== undefined) a.yaw = def.lookYaw;
      if (def.after) PM.safe("after:" + def.id, () => def.after(a));
    }
    return a;
  };
  PM.spawnRoster = function () {
    for (const def of PM.npcDefs) {
      if (def.when && !PM.safe("when:" + def.id, def.when)) continue;
      PM.spawnNpc(def);
    }
  };
  PM.say = (id, text, dur) => {
    const a = PM.getNpc(id);
    if (a && !a.dead && a.say) PM.safe("say", () => a.say(text, dur || 4));
  };

  // -------------------------------------------------------------------
  // Area triggers (checked 5×/s while the world runs)
  // -------------------------------------------------------------------
  PM.triggers = [];
  /** box: {x0,x1,y0,y1,z0,z1}; fn() fires when the player is inside and cond() (optional) holds; once unless repeat. */
  PM.trigger = function (box, fn, opts) {
    const t = Object.assign({ box, fn, fired: false }, opts || {});
    PM.triggers.push(t);
    return t;
  };
  let trigT = 0;
  PM.updaters.push(function (dt) {
    trigT -= dt;
    if (trigT > 0) return;
    trigT = 0.2;
    const p = G.player && G.player.pos;
    if (!p) return;
    for (const t of PM.triggers) {
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
      if (t.cond && !PM.safe("trig:cond", t.cond)) continue;
      if (t.repeat && t.inside) continue;
      t.inside = true;
      t.fired = true;
      PM.safe("trig", t.fn);
    }
  });
  PM.onReset.push(() => {
    for (const t of PM.triggers) {
      t.fired = false;
      t.inside = false;
    }
  });

  // -------------------------------------------------------------------
  // Glow sprites (fake light) — parented so they hide with the cell
  // -------------------------------------------------------------------
