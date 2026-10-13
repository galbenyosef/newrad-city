// play-inline-204 03 — def
// Lines 363-553 of readable/play-inline-204.pretty.js (statement-aligned).
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
