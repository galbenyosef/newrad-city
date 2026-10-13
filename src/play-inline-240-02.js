// play-inline-240 02 — def
// Lines 18-370 of readable/play-inline-240.pretty.js (statement-aligned).
  const PR = G._pr;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  PR.V3 = V3;

  // -------------------------------------------------------------------
  // Safe call helper
  // -------------------------------------------------------------------
  PR.safe = function (tag, fn) {
    try {
      return fn();
    } catch (e) {
      try {
        G.reportError("poi_roosevelt:" + tag, e);
      } catch (e2) {
        console.warn(e);
      }
      return undefined;
    }
  };
  PR.live = (ns) => {
    try {
      return !G.isStub(ns);
    } catch (e) {
      return false;
    }
  };

  // -------------------------------------------------------------------
  // Interior cells
  // -------------------------------------------------------------------
  PR.cells = PR.cells || {};
  /** Get/create an interior cell record {key, origin, root, subs:[{obj, test(p)}]}. */
  PR.cell = function (key) {
    if (PR.cells[key]) return PR.cells[key];
    const def = G.LAYOUT.INTERIORS[key];
    const o = def ? def.origin : { x: 0, y: 0, z: 0 };
    const root = new THREE.Group();
    root.name = "pr_cell_" + key;
    root.visible = false;
    G.scene.add(root);
    const c = { key, origin: { x: o.x, y: o.y, z: o.z }, root, subs: [] };
    PR.cells[key] = c;
    return c;
  };
  /** Sub-root inside a cell, visible only while test(p) is true (p = camera world pos). */
  PR.subRoot = function (cell, name, test) {
    const g = new THREE.Group();
    g.name = "pr_sub_" + name;
    cell.root.add(g);
    cell.subs.push({ obj: g, test });
    return g;
  };
  const _cam = new THREE.Vector3();
  PR.updateCells = function () {
    let p = null;
    if (G.camera) {
      G.camera.getWorldPosition(_cam);
      p = _cam;
    }
    if (!p && G.player) p = G.player.pos;
    if (!p) return;
    for (const k in PR.cells) {
      const c = PR.cells[k];
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
  PR.inCell = function (key) {
    const c = PR.cells[key];
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
  PR.flags = {};
  PR.flagDefaults = {};
  PR.flag = (k) => PR.flags[k];
  PR.setFlag = function (k, v) {
    PR.flags[k] = v === undefined ? true : v;
    for (const fn of PR.flagWatch) {
      try {
        fn(k, PR.flags[k]);
      } catch (e) {
        G.reportError("poi_roosevelt:flag", e);
      }
    }
  };
  PR.flagWatch = [];
  PR.resetFlags = function () {
    PR.flags = JSON.parse(JSON.stringify(PR.flagDefaults));
  };

  // -------------------------------------------------------------------
  // Lifecycle hook lists (run by 90_main.js)
  // -------------------------------------------------------------------
  PR.onInitDone = PR.onInitDone || []; // register items/terminals/dialogues/quests, spawn persistent props
  PR.onNewGame = PR.onNewGame || [];
  PR.onReset = PR.onReset || [];
  PR.onLoaded = PR.onLoaded || [];
  PR.updaters = PR.updaters || []; // fn(dt, realDt) every frame while the world runs
  PR.saveHooks = PR.saveHooks || {};

  // -------------------------------------------------------------------
  // Deferred registrations (G.items / G.terminals / G.dialogue / G.quests)
  // -------------------------------------------------------------------
  PR.itemDefs = [];
  PR.termDefs = [];
  PR.dlgDefs = [];
  PR.questDefs = [];
  PR.item = (def) => {
    PR.itemDefs.push(def);
    return def.id;
  };
  PR.terminal = (id, def) => {
    PR.termDefs.push([id, def]);
    return id;
  };
  PR.dialogue = (id, tree) => {
    PR.dlgDefs.push([id, tree]);
    return id;
  };
  PR.quest = (def) => {
    PR.questDefs.push(def);
    return def.id;
  };
  PR.registerContent = function () {
    if (PR.live("items") && G.items.define)
      for (const d of PR.itemDefs)
        PR.safe("item:" + d.id, () =>
          G.items.define(typeof d.build === "function" ? d.build() : d),
        );
    if (PR.live("terminals") && G.terminals.register)
      for (const [id, d] of PR.termDefs)
        PR.safe("term:" + id, () => G.terminals.register(id, d));
    if (PR.live("dialogue") && G.dialogue.register)
      for (const [id, t] of PR.dlgDefs)
        PR.safe("dlg:" + id, () => G.dialogue.register(id, t));
    if (PR.live("quests") && G.quests.define)
      for (const q of PR.questDefs)
        PR.safe("quest:" + q.id, () => G.quests.define(q));
  };

  // -------------------------------------------------------------------
  // Quest helpers (all defensive)
  // -------------------------------------------------------------------
  const Q = () => (PR.live("quests") ? G.quests : null);
  PR.q = {
    start(id, opts) {
      const q = Q();
      return q ? PR.safe("qstart", () => q.start(id, opts)) : false;
    },
    stage(id) {
      const q = Q();
      return q ? PR.safe("qstage", () => q.stage(id)) : null;
    },
    set(id, st) {
      const q = Q();
      return q ? PR.safe("qset", () => q.setStage(id, st)) : false;
    },
    done(id) {
      const q = Q();
      return q ? PR.safe("qdone", () => q.complete(id)) : false;
    },
    active(id) {
      const q = Q();
      return q ? !!PR.safe("qactive", () => q.isActive(id)) : false;
    },
    complete(id) {
      const q = Q();
      return q ? !!PR.safe("qcomplete", () => q.isComplete(id)) : false;
    },
    started(id) {
      const q = Q();
      if (!q) return false;
      return !!PR.safe("qstarted", () =>
        q.isStarted ? q.isStarted(id) : q.isActive(id) || q.isComplete(id),
      );
    },
    /** Advance to `st` only if the quest is currently at one of `from` (array or string). */
    advance(id, from, st) {
      const cur = PR.q.stage(id);
      const f = Array.isArray(from) ? from : [from];
      if (PR.q.active(id) && f.indexOf(cur) >= 0) return PR.q.set(id, st);
      return false;
    },
  };

  // -------------------------------------------------------------------
  // Player helpers
  // -------------------------------------------------------------------
  PR.inv = {
    count(id) {
      return PR.live("inventory")
        ? PR.safe("invcount", () => G.inventory.count(id)) || 0
        : 0;
    },
    add(id, n, opts) {
      if (PR.live("inventory"))
        PR.safe("invadd", () => G.inventory.add(id, n || 1, opts));
    },
    remove(id, n) {
      if (PR.live("inventory"))
        PR.safe("invrem", () => G.inventory.remove(id, n || 1));
    },
    scrip() {
      return PR.live("inventory")
        ? PR.safe("scrip", () => G.inventory.scrip()) || 0
        : 0;
    },
    addScrip(n) {
      if (PR.live("inventory"))
        PR.safe("addscrip", () => G.inventory.addScrip(n));
    },
    pay(n) {
      if (PR.inv.scrip() < n) return false;
      PR.inv.addScrip(-n);
      return true;
    },
  };
  PR.xp = (n, why) => {
    if (PR.live("rpg") && G.rpg.addXP) PR.safe("xp", () => G.rpg.addXP(n, why));
  };
  PR.standing = (n, why) => {
    if (PR.live("rpg") && G.rpg.addStanding)
      PR.safe("standing", () => G.rpg.addStanding(n, why));
  };
  PR.skill = (id) =>
    PR.live("rpg") && G.rpg.skill
      ? PR.safe("skill", () => G.rpg.skill(id)) || 0
      : 0;
  PR.sfx = (name, pos, o) => {
    try {
      return G.sfx.play(name, Object.assign({ pos }, o || {}));
    } catch (e) {
      return null;
    }
  };
  PR.news = (text) => {
    try {
      if (PR.live("radio") && G.radio.addNews) G.radio.addNews(text);
    } catch (e) {
      /* optional */
    }
  };

  // -------------------------------------------------------------------
  // Named NPC roster (spawned on newGame and after every load)
  // -------------------------------------------------------------------
  PR.npcDefs = [];
  PR.npcs = {};
  /** def: G.actors.spawn def with a stable `id`; optional `when()` gate, `after(actor)` hook. */
  PR.npc = function (def) {
    PR.npcDefs.push(def);
    return def.id;
  };
  PR.getNpc = function (id) {
    const a = PR.npcs[id];
    if (a && !a.removed && !a._removed) return a;
    if (PR.live("actors") && G.actors.get) {
      const b = PR.safe("actors.get", () => G.actors.get(id));
      if (b) {
        PR.npcs[id] = b;
        return b;
      }
    }
    return null;
  };
  PR.spawnNpc = function (def) {
    if (!PR.live("actors") || !G.actors.spawn) return null;
    const ex = PR.getNpc(def.id);
    if (ex) return ex;
    const d = Object.assign({}, def);
    delete d.when;
    delete d.after;
    delete d.lookYaw;
    const a = PR.safe("spawn:" + def.id, () => G.actors.spawn(d));
    if (a) {
      PR.npcs[def.id] = a;
      if (def.lookYaw !== undefined) a.yaw = def.lookYaw;
      if (def.after) PR.safe("after:" + def.id, () => def.after(a));
    }
    return a;
  };
  PR.spawnRoster = function () {
    for (const def of PR.npcDefs) {
      if (def.when && !PR.safe("when:" + def.id, def.when)) continue;
      PR.spawnNpc(def);
    }
  };
  PR.say = (id, text, dur) => {
    const a = PR.getNpc(id);
    if (a && !a.dead && a.say) PR.safe("say", () => a.say(text, dur || 4));
  };

  // -------------------------------------------------------------------
  // Area triggers (checked 5×/s while the world runs)
  // -------------------------------------------------------------------
  PR.triggers = [];
  /** box: {x0,x1,y0,y1,z0,z1}; fn() fires when the player is inside and cond() (optional) holds; once unless repeat. */
  PR.trigger = function (box, fn, opts) {
    const t = Object.assign({ box, fn, fired: false }, opts || {});
    PR.triggers.push(t);
    return t;
  };
  let trigT = 0;
  PR.updaters.push(function (dt) {
    trigT -= dt;
    if (trigT > 0) return;
    trigT = 0.2;
    const p = G.player && G.player.pos;
    if (!p) return;
    for (const t of PR.triggers) {
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
      if (t.cond && !PR.safe("trig:cond", t.cond)) continue;
      if (t.repeat && t.inside) continue;
      t.inside = true;
      t.fired = true;
      PR.safe("trig", t.fn);
    }
  });
  PR.onReset.push(() => {
    for (const t of PR.triggers) {
      t.fired = false;
      t.inside = false;
    }
  });

  // -------------------------------------------------------------------
  // Glow sprites (fake light) — parented so they hide with the cell
  // -------------------------------------------------------------------
