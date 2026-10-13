/* src/poi_bridges/03_common.js */
/* =====================================================================
 * NEW RAD CITY — POI BRIDGES — 03_common.js
 * Shared runtime for the two bridge POIs:
 *   - interior cells (roots hidden unless the player is inside the cell,
 *     optional sub-roots toggled by a box test)
 *   - persistent module flags (saved under G.save key 'poi_bridges')
 *   - deferred registration of items / terminals / dialogues / quests at
 *     initDone (those modules have a higher init order than ours)
 *   - named NPC roster spawned on newGame / loaded (stable ids)
 *   - area triggers, glows, notes & tape reels, safe wrappers
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pbr) return;
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
  const TAU = Math.PI * 2;
  const U = G.util;
  // --- custom canvas textures (registered into the lib's CUSTOM_TEX so MAT_DEFS can use them) ---
  /** Guastavino tile vaulting: thin buff/salmon terracotta tiles laid in herringbone, lime joints, soot & damp. */
  function guastavinoDraw(ctx, w, h) {
    const r = U.rng(1909);
    ctx.fillStyle = "#9c8a6a";
    ctx.fillRect(0, 0, w, h); // joint colour
    const T = 32,
      L = 64; // tile short/long side (px); 512 px ≈ 8 × 16 tiles
    const tone = () => {
      const k = r();
      return k < 0.55
        ? [214, 196, 158]
        : k < 0.8
          ? [206, 172, 132]
          : k < 0.93
            ? [226, 212, 180]
            : [188, 150, 110];
    };
    // herringbone: alternating horizontal / vertical tiles on a stepped lattice
    for (let j = -2; j < h / T + 2; j++) {
      for (let i = -2; i < w / T + 2; i++) {
        const x = i * T * 2 + (j % 2) * T,
          y = j * T;
        const c1 = tone(),
          c2 = tone();
        const f = (c) =>
          "rgb(" +
          ((c[0] + (r() - 0.5) * 16) | 0) +
          "," +
          ((c[1] + (r() - 0.5) * 16) | 0) +
          "," +
          ((c[2] + (r() - 0.5) * 14) | 0) +
          ")";
        ctx.fillStyle = f(c1);
        ctx.fillRect(x + 2, y + 2, L - 4, T - 4); // horizontal tile
        ctx.fillStyle = f(c2);
        ctx.fillRect(x + 2, y + T + 2, T - 4, L - 4); // vertical tile
        // glaze sheen + edge shade
        ctx.fillStyle = "rgba(255,250,235,0.10)";
        ctx.fillRect(x + 3, y + 3, L - 10, 4);
        ctx.fillStyle = "rgba(40,28,12,0.12)";
        ctx.fillRect(x + 2, y + T - 5, L - 4, 3);
      }
    }
    // damp stains & soot blooms
    for (let i = 0; i < 40; i++) {
      const x = r() * w,
        y = r() * h,
        rr = 20 + r() * 90;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, "rgba(50,40,24," + (0.06 + r() * 0.16) + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = r() < 0.5 ? "rgba(20,14,8,0.3)" : "rgba(255,248,230,0.2)";
      ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
    }
    // a few missing tiles (dark holes)
    for (let i = 0; i < 2; i++) {
      ctx.fillStyle = "rgba(60,48,34,0.7)";
      ctx.fillRect(
        (((r() * w) / T) | 0) * T + 2,
        (((r() * h) / T) | 0) * T + 2,
        T - 4,
        T - 4,
      );
    }
  }
  /** Red quarry-tile floor: 30 cm squares, worn paths, grime in the joints. */
  function quarryDraw(ctx, w, h) {
    const r = U.rng(59);
    ctx.fillStyle = "#4a3226";
    ctx.fillRect(0, 0, w, h);
    const n = 8,
      s = w / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const k = r();
        const c =
          k < 0.6 ? [138, 72, 52] : k < 0.85 ? [120, 64, 46] : [150, 92, 64];
        ctx.fillStyle =
          "rgb(" +
          ((c[0] + (r() - 0.5) * 20) | 0) +
          "," +
          ((c[1] + (r() - 0.5) * 14) | 0) +
          "," +
          ((c[2] + (r() - 0.5) * 12) | 0) +
          ")";
        ctx.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
        if (r() < 0.12) {
          ctx.strokeStyle = "rgba(30,18,12,0.7)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(i * s + r() * s, j * s);
          ctx.lineTo(i * s + r() * s, j * s + s);
          ctx.stroke();
        }
      }
    for (let i = 0; i < 50; i++) {
      const x = r() * w,
        y = r() * h,
        rr = 10 + r() * 60;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, "rgba(30,22,14," + (0.08 + r() * 0.2) + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = "rgba(20,14,8," + r() * 0.3 + ")";
      ctx.fillRect(r() * w, r() * h, 1.4, 1.4);
    }
  }
  /** Riveted plate steel with paint peeling to rust (bridge members); tint via material colour. */
  function rivetDraw(ctx, w, h) {
    const r = U.rng(77);
    ctx.fillStyle = "#c8c8c0";
    ctx.fillRect(0, 0, w, h);
    // plate seams
    ctx.fillStyle = "rgba(40,40,36,0.45)";
    for (let y = 0; y < h; y += 128) ctx.fillRect(0, y, w, 3);
    for (let x = 0; x < w; x += 170) ctx.fillRect(x, 0, 3, h);
    // rivet rows along the seams
    for (let y = 0; y < h; y += 128)
      for (let x = 8; x < w; x += 16) {
        ctx.fillStyle = "rgba(255,255,250,0.35)";
        ctx.beginPath();
        ctx.arc(x, y + 9, 3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(30,30,26,0.4)";
        ctx.beginPath();
        ctx.arc(x + 1, y + 10, 3, 0, TAU);
        ctx.fill();
      }
    // peeling paint → rust blooms and run-off streaks
    for (let i = 0; i < 70; i++) {
      const x = r() * w,
        y = r() * h,
        rr = 6 + r() * 40;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, "rgba(120,58,24," + (0.35 + r() * 0.45) + ")");
      g.addColorStop(0.6, "rgba(110,60,30,0.2)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      if (r() < 0.6) {
        const sg = ctx.createLinearGradient(0, y, 0, y + 60 + r() * 120);
        sg.addColorStop(0, "rgba(110,52,20,0.45)");
        sg.addColorStop(1, "rgba(110,52,20,0)");
        ctx.fillStyle = sg;
        ctx.fillRect(x - 2, y, 3 + r() * 4, 180);
      }
    }
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle =
        r() < 0.5
          ? "rgba(20,20,18," + r() * 0.3 + ")"
          : "rgba(255,255,250," + r() * 0.2 + ")";
      ctx.fillRect(r() * w, r() * h, 1.5, 1.5);
    }
  }
  /** Rough-dressed granite pier masonry: big rusticated blocks. */
  function pierStoneDraw(ctx, w, h) {
    const r = U.rng(4);
    ctx.fillStyle = "#5c5a55";
    ctx.fillRect(0, 0, w, h);
    const rows = 4;
    for (let row = 0; row < rows; row++) {
      const bh = h / rows,
        cols = 2 + (row % 2),
        bw = w / cols,
        off = (row % 2) * bw * 0.5;
      for (let c = -1; c <= cols; c++) {
        const x0 = c * bw + off + 4,
          y0 = row * bh + 4,
          ww = bw - 8,
          hh = bh - 8;
        const v = 128 + (r() - 0.5) * 36;
        ctx.fillStyle =
          "rgb(" +
          (v | 0) +
          "," +
          ((v * 0.98) | 0) +
          "," +
          ((v * 0.93) | 0) +
          ")";
        ctx.fillRect(x0, y0, ww, hh);
        // rock-faced: noisy bumps
        for (let k = 0; k < 60; k++) {
          ctx.fillStyle =
            r() < 0.5 ? "rgba(255,255,250,0.08)" : "rgba(0,0,0,0.12)";
          ctx.beginPath();
          ctx.arc(x0 + r() * ww, y0 + r() * hh, 3 + r() * 12, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = "rgba(255,255,245,0.15)";
        ctx.fillRect(x0, y0, ww, 5);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(x0, y0 + hh - 6, ww, 6);
      }
    }
    for (let i = 0; i < 30; i++) {
      const x = r() * w;
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "rgba(30,26,20,0.12)");
      g.addColorStop(1, "rgba(30,26,20,0.02)");
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, 3 + r() * 8, h);
    }
  }
  /** Mutant gore / meat sacks: glistening red-brown with fat marbling. */
  function goreDraw(ctx, w, h) {
    const r = U.rng(666);
    ctx.fillStyle = "#5a1812";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      ctx.fillStyle =
        r() < 0.3
          ? "rgba(220,190,150," + (0.2 + r() * 0.3) + ")"
          : r() < 0.6
            ? "rgba(120,20,16,0.6)"
            : "rgba(30,6,4,0.5)";
      ctx.beginPath();
      ctx.ellipse(r() * w, r() * h, 3 + r() * 18, 2 + r() * 8, r() * 3, 0, TAU);
      ctx.fill();
    }
  }
  Object.assign(PF.CUSTOM_TEX || {}, {
    guastavino: [512, 512, guastavinoDraw],
    quarry: [256, 256, quarryDraw],
    rivet_plate: [512, 512, rivetDraw],
    pier_stone: [512, 512, pierStoneDraw],
    gore: [128, 128, goreDraw],
  });

  const MD = PF.MAT_DEFS;
  Object.assign(MD, {
    // Queensboro: pale grey-beige painted steel (the 1909 lattice), darker lacing, rusting
    qb_steel: {
      custom: "rivet_plate",
      prefer: "custom",
      color: 0x8c8a80,
      tint: 0x9a9888,
      rough: 0.72,
      metal: 0.35,
      uv: 4,
      bump: 0.25,
    },
    qb_steel_dk: {
      custom: "rivet_plate",
      prefer: "custom",
      color: 0x5e5d56,
      tint: 0x6a6960,
      rough: 0.75,
      metal: 0.35,
      uv: 3,
    },
    // Manhattan Bridge blue (weathered), and its rust-bleeding variant for the lower works
    mb_blue: {
      custom: "rivet_plate",
      prefer: "custom",
      color: 0x5a7ea0,
      tint: 0x6e9cc8,
      rough: 0.7,
      metal: 0.35,
      uv: 4,
      bump: 0.25,
    },
    mb_blue_dk: {
      custom: "rivet_plate",
      prefer: "custom",
      color: 0x3c5670,
      tint: 0x4a6a8e,
      rough: 0.72,
      metal: 0.35,
      uv: 3,
    },
    cable: {
      src: "metal_painted",
      color: 0x2e302e,
      tint: 0x3c3e3c,
      rough: 0.6,
      metal: 0.5,
      uv: 2,
    },
    pier_stone: {
      custom: "pier_stone",
      prefer: "custom",
      color: 0x8a8680,
      tint: 0xb8b4ac,
      rough: 0.95,
      uv: 4,
      bump: 1.1,
    },
    arch_stone: {
      custom: "limestone_fine",
      prefer: "custom",
      color: 0xc8c4b8,
      tint: 0xd8d4c8,
      rough: 0.9,
      uv: 3.2,
      bump: 0.5,
    },
    guastavino: {
      custom: "guastavino",
      prefer: "custom",
      color: 0xd4c098,
      tint: 0xf0e4c8,
      rough: 0.55,
      uv: 2.4,
      bump: 0.25,
    },
    quarry: {
      custom: "quarry",
      prefer: "custom",
      color: 0x8a4a34,
      tint: 0xd8b0a0,
      rough: 0.8,
      uv: 2.4,
    },
    gore: {
      custom: "gore",
      prefer: "custom",
      color: 0x5a1812,
      tint: 0xd08070,
      rough: 0.35,
      metal: 0.05,
      uv: 1.2,
    },
    meat: { color: 0x7a2a22, rough: 0.4, uv: 1, plain: true },
    brick_dark: {
      src: "brick_red",
      color: 0x5a3a2c,
      tint: 0x8a6a5a,
      rough: 0.95,
      uv: 3,
    },
    brass: { color: 0x9a7a3a, rough: 0.35, metal: 0.8, uv: 2, plain: true },
    oak: {
      src: "wood_planks",
      color: 0x6a4e30,
      tint: 0x9a7a54,
      rough: 0.7,
      uv: 2,
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
    lamp_green: {
      color: 0x70ff90,
      emissive: 0x30ff60,
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
    neon_pink: {
      color: 0xff70b0,
      emissive: 0xff3a90,
      emissiveIntensity: 2.4,
      rough: 0.5,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    flame: {
      color: 0xffc060,
      emissive: 0xffa030,
      emissiveIntensity: 3.0,
      rough: 1,
      uv: 1,
      plain: true,
      noShadow: true,
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
    tarp_blue: {
      src: "fabric",
      color: 0x2e4a66,
      tint: 0x4a6a8a,
      rough: 1,
      uv: 2,
    },
    tarp_olive: {
      src: "fabric",
      color: 0x4f5238,
      tint: 0x6a6e48,
      rough: 1,
      uv: 2,
    },
    tile_sub: { src: "tile_subway", color: 0xd8d4c8, rough: 0.5, uv: 2 },
    rail: {
      src: "metal_painted",
      color: 0x3a342c,
      tint: 0x5a5046,
      rough: 0.5,
      metal: 0.7,
      uv: 2,
    },
    sleeper: {
      src: "wood_rotten",
      color: 0x3e3226,
      tint: 0x6a5a48,
      rough: 1,
      uv: 2,
    },
    subway_car: {
      src: "metal_panel",
      color: 0x8a8c88,
      tint: 0xa8aaa4,
      rough: 0.55,
      metal: 0.55,
      uv: 3,
    },
    linen: {
      src: "fabric",
      color: 0xb8b0a0,
      tint: 0xe8e0d0,
      rough: 1,
      uv: 1.5,
    },
    glass_tr: {
      color: 0x9aaeb0,
      rough: 0.08,
      metal: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
  });
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
   * Axis-aligned wall with rectangular openings at any height (+ colliders).
   * axis 'x': runs along x from a0..a1, occupying z f0..f1. axis 'z': runs along z (a0..a1), occupying x f0..f1.
   * gaps: [{c, w, y0, h}] — c/w along the run, y0 absolute bottom. opts: {grime, noCollide, surface}
   */
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
