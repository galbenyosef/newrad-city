/* src/poi_roosevelt/03_common.js */
/* =====================================================================
 * NEW RAD CITY — POI ROOSEVELT — 03_common.js
 * Shared runtime for the Roosevelt Island POIs (island, Octagon, Renwick):
 *   - interior cells (roots hidden unless the player is inside the cell,
 *     optional sub-roots toggled by a box test)
 *   - persistent module flags (saved under G.save key 'poi_roosevelt')
 *   - deferred registration of items / terminals / dialogues / quests at
 *     initDone (those modules have a higher init order than ours)
 *   - named NPC roster spawned on newGame / loaded (stable ids)
 *   - area triggers, glows, notes & tape reels, safe wrappers
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pr) return;
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
  PR.glowQ = [];
  PR.glow = function (pos, color, size, parent, opts) {
    const rec = {
      pos: pos.clone ? pos.clone() : V3(pos.x, pos.y, pos.z),
      color,
      size,
      parent: parent || null,
      opts: opts || {},
    };
    if (!PR.makeGlow(rec)) PR.glowQ.push(rec);
    return rec;
  };
  PR.makeGlow = function (rec) {
    if (!PR.live("fx") || typeof G.fx.glowSprite !== "function") return false;
    return !!PR.safe("glow", () => {
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
  PR.pickupQ = [];
  PR.pickup = function (id, n, pos, opts) {
    PR.pickupQ.push({
      id,
      n: n || 1,
      pos: pos.clone ? pos.clone() : V3(pos.x, pos.y, pos.z),
      opts: opts || {},
    });
  };
  PR.spawnPickups = function () {
    if (!PR.live("items") || typeof G.items.spawnPickup !== "function") return;
    for (const p of PR.pickupQ)
      PR.safe("pickup:" + p.id, () =>
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
  PR.propQ = [];
  PR.prop = function (type, opts) {
    PR.propQ.push({ type, opts });
  };
  PR.spawnProps = function () {
    for (const p of PR.propQ) PR.spawnProp(p.type, p.opts);
  };

  // -------------------------------------------------------------------
  // Custom interactables with a label that can change (switches, nests...)
  // -------------------------------------------------------------------
  PR.use = function (def) {
    return PR.safe("interactable", () =>
      G.world.addInteractable(
        Object.assign({ radius: 0.8, range: 2.8, priority: 1 }, def),
      ),
    );
  };
  /** Interior load door with stable id. */
  PR.door = function (def) {
    return PR.safe("door", () =>
      G.world.addDoor(Object.assign({ radius: 1.3 }, def)),
    );
  };

  // -------------------------------------------------------------------
  // Custom materials for this module (added to the lib's table)
  // -------------------------------------------------------------------
  const MD = PR.MAT_DEFS;
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
      src: "metal_painted",
      color: 0xd0ccc0,
      tint: 0xece8dc,
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
    net: { src: "chainlink", color: 0x6a6450, tint: 0x9a9070, rough: 1, uv: 1 },
  });

  // -------------------------------------------------------------------
  // Stained glass & custom textures
  // -------------------------------------------------------------------
  const TAU = Math.PI * 2;
  /** Leaded stained-glass lancet (uv 0..1). variant picks the palette / motif. */
  PR.stainedTex = function (variant) {
    return PR.canvasTex(
      "pr_stained_" + variant,
      256,
      512,
      (ctx, w, h) => {
        const r = PR.rng(900 + variant * 31);
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
  PR.stainedKey = function (variant, glow) {
    return PR.texMat(
      "stained_" + variant + "_" + (glow || 1),
      PR.stainedTex(variant),
      {
        emissive: glow || 1.0,
        rough: 0.4,
        noShadow: true,
        side: THREE.DoubleSide,
      },
    );
  };
  /** A pointed-arch (lancet) shape in XY: width w, height h, spring at h - w*k. */
  PR.lancetShape = function (w, h, k) {
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
  PR.shapeGeo = function (shape, segs) {
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
  PR.lancetWindow = function (b, x, y, z, ry, w, h, opts) {
    opts = opts || {};
    const fk = opts.frame || "limestone";
    const fw = opts.frameW || 0.22;
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const out = opts.out === undefined ? 0.05 : opts.out;
    if (opts.glass) {
      const g = PR.shapeGeo(PR.lancetShape(w, h, opts.k), 8);
      b.add(opts.glass, g, {
        m: PR.m4(x - s * 0.02, y, z - c * 0.02, ry),
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
  PR.wall = function (b, key, axis, a0, a1, f0, f1, y0, y1, gaps, opts) {
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
            PR.colMM(p, ya, f0, q, yb, f1, {
              walkable: false,
              surface: opts.surface,
            });
        } else {
          b.boxMM(key, f0, ya, p, f1, yb, q, { grime: opts.grime, segLen: 4 });
          if (!opts.noCollide)
            PR.colMM(f0, ya, p, f1, yb, q, {
              walkable: false,
              surface: opts.surface,
            });
        }
      }
    }
  };
  /** Standalone mesh with a shared module material (adds the white vertex colour the materials expect). */
  PR.mesh = function (key, geo) {
    const n = geo.attributes.position.count;
    const c = new Float32Array(n * 3).fill(1);
    geo.setAttribute("color", new THREE.BufferAttribute(c, 3));
    const m = new THREE.Mesh(geo, PR.mat(key));
    m.castShadow = false;
    m.receiveShadow = true;
    return m;
  };
  /** Readable plaque: interactable that shows text. */
  PR.readable = function (pos, title, text, verb) {
    PR.use({
      pos,
      radius: 0.6,
      range: 2.6,
      label: title,
      verb: verb || "Read",
      onInteract() {
        G.notify(title + " — " + text, { duration: 10 });
        PR.sfx("ui_click");
      },
    });
  };
  /** Candle cluster (emissive flames + one glow). */
  PR.candles = function (b, x, y, z, n, seed, parent) {
    const r = PR.rng(seed || x * 3 + z * 5);
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
    PR.glow(V3(x, y + 0.3, z), 0xffb060, 0.9, parent, {
      intensity: 1.2,
      flicker: 0.25,
    });
  };
})();
