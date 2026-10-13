// play-inline-548 04 — pos
// Lines 765-1725 of readable/play-inline-548.pretty.js (statement-aligned).
  const lib = {
    DEFS,
    STATE,
    TRIGGERS,
    DIALOGUES,
    TERMINALS,
    ENDINGS,
    markerCache: new Map(), // resolved {anchor, fallback} marker specs
    npcs: {}, // stable npc id -> actor (current session)
    npcDefs: [], // roster entries {id, spawn()}
    pickups: {}, // pickupKey -> handle
    world: {}, // static things built once (terminals...)
    hintsShown: {},
    V3,
    rng: G.util.rng(1201),

    // ---- phase hooks ----
    hook(phase, fn) {
      (HOOKS[phase] = HOOKS[phase] || []).push(fn);
    },
    run(phase, arg) {
      for (const fn of HOOKS[phase] || []) safe("hook:" + phase, () => fn(arg));
    },

    // ---- quest / dialogue / terminal registration ----
    quest: defineQuest,
    dialogue(id, tree) {
      DIALOGUES.set(id, tree);
      if (!G.isStub("dialogue") && G.dialogue.register)
        safe("dlg:" + id, () => G.dialogue.register(id, tree));
      return id;
    },
    terminal(id, def) {
      TERMINALS.set(id, def);
      if (!G.isStub("terminals") && G.terminals.register)
        safe("term:" + id, () => G.terminals.register(id, def));
      return id;
    },
    ending: defineEnding,
    registerAll() {
      if (!G.isStub("dialogue") && G.dialogue.register)
        for (const [id, t] of DIALOGUES)
          safe("dlg:" + id, () => G.dialogue.register(id, t));
      if (!G.isStub("terminals") && G.terminals.register)
        for (const [id, t] of TERMINALS)
          safe("term:" + id, () => G.terminals.register(id, t));
    },

    // ---- flags shortcuts ----
    flag,
    setFlag,
    incFlag,
    allFlags() {
      return JSON.parse(JSON.stringify(FLAGS));
    },
    once(name) {
      if (FLAGS["once_" + name]) return false;
      FLAGS["once_" + name] = true;
      return true;
    },

    // ---- feedback ----
    notify(text, opts) {
      safe("notify", () => G.notify(text, opts));
    },
    sfx(name, opts) {
      if (!G.isStub("sfx")) safe("sfx", () => G.sfx.play(name, opts));
    },
    news(text) {
      if (!G.isStub("radio") && G.radio.addNews)
        safe("news", () => G.radio.addNews(text));
      lib.incFlag("news_count");
    },
    /** Contextual tutorial hint (shown once per game). */
    hint(key, text, delay) {
      if (lib.hintsShown[key] || FLAGS["hint_" + key]) return;
      lib.hintsShown[key] = true;
      FLAGS["hint_" + key] = true;
      // Hints are queued so two never stack on screen (one tutorial card at a time).
      const show = () => {
        const now = G.time.elapsed,
          wait = Math.max(0, (lib.hintBusyUntil || 0) - now);
        if (wait > 0.05) {
          lib.later(wait, show);
          return;
        }
        lib.hintBusyUntil = now + 7.5;
        lib.notify(text, { tutorial: true, hint: true, duration: 7 });
      };
      if (delay) lib.later(delay, show);
      else show();
    },

    // ---- items / inventory ----
    /** Resolve the first existing item id from candidates (ids or /regex/ on name). */
    item() {
      const c = Array.prototype.slice.call(arguments).flat();
      if (G.isStub("items") || !G.items.get)
        return typeof c[0] === "string" ? c[0] : null;
      for (const x of c) {
        if (typeof x === "string") {
          if (G.items.get(x)) return x;
        } else if (x instanceof RegExp && G.items.all) {
          const d = G.items
            .all()
            .find((it) => x.test(it.name) || x.test(it.id));
          if (d) return d.id;
        }
      }
      return null;
    },
    defineItem(def) {
      if (G.isStub("items") || !G.items.define) return null;
      return safe("define:" + def.id, () => G.items.define(def));
    },
    has(id, n) {
      if (G.isStub("inventory") || !id) return false;
      return (safe("count", () => G.inventory.count(id)) || 0) >= (n || 1);
    },
    count(id) {
      if (G.isStub("inventory") || !id) return 0;
      return safe("count", () => G.inventory.count(id)) || 0;
    },
    /** give(idOrCandidates, n, silent) */
    give(id, n, silent) {
      const rid = Array.isArray(id) ? lib.item(id) : id;
      if (!rid || G.isStub("inventory")) return false;
      if (rid === "scrip") return lib.giveScrip(n);
      if (!G.isStub("items") && G.items.get && !G.items.get(rid)) return false;
      safe("give:" + rid, () =>
        G.inventory.add(rid, n || 1, silent ? { silent: true } : undefined),
      );
      return true;
    },
    take(id, n) {
      if (!id || G.isStub("inventory")) return false;
      if (!lib.has(id, n || 1)) return false;
      safe("take", () => G.inventory.remove(id, n || 1));
      return true;
    },

    // ---- currency: federal ration scrip (paper notes) ----
    /** The item id the currency is stored under. */
    scripId() {
      return "scrip";
    },
    /** The player's scrip. */
    scrip() {
      if (G.isStub("inventory")) return 0;
      return (
        safe("scrip", () => {
          const I = G.inventory;
          if (typeof I.scrip === "function") return I.scrip();
          return I.count(lib.scripId());
        }) || 0
      );
    },
    /** Give (n > 0) or take (n < 0) scrip. */
    giveScrip(n) {
      if (G.isStub("inventory") || !n) return false;
      safe("scrip", () => {
        const I = G.inventory;
        if (typeof I.addScrip === "function") I.addScrip(n);
        else if (n > 0) I.add(lib.scripId(), n);
        else I.remove(lib.scripId(), -n);
      });
      if (n < 0) lib.notify(-n + " scrip handed over.");
      else lib.sfx("pickup_scrip");
      return true;
    },
    /** Pay n scrip if the player has it (false + a message otherwise). */
    pay(n) {
      if (lib.scrip() < n) {
        lib.notify("You don't have enough scrip.");
        lib.sfx("ui_error");
        return false;
      }
      lib.giveScrip(-n);
      lib.sfx("barter_trade");
      return true;
    },
    equipped(id) {
      return (
        !G.isStub("inventory") &&
        !!safe("isEquipped", () => G.inventory.isEquipped(id))
      );
    },

    // ---- rpg ----
    /** The hero's name, always read at runtime (never hard-code it in text). */
    heroName() {
      return (
        (G.HERO && G.HERO.name) || (G.player && G.player.name) || "Eli Wayte"
      );
    },
    xp(n, reason) {
      if (!G.isStub("rpg") && G.rpg.addXP)
        safe("xp", () => G.rpg.addXP(n, reason));
      else lib.notify("+" + n + " XP");
    },
    /** Standing (the city's opinion of the hero): + good deeds, - bad ones. */
    standing(n, reason) {
      n = Number(n) || 0;
      if (!n) return;
      if (!G.isStub("rpg")) {
        safe("standing", () => {
          if (typeof G.rpg.addStanding === "function")
            G.rpg.addStanding(n, reason || "");
        });
      }
      lib.incFlag("standing_acc", n);
    },
    standingValue() {
      if (!G.isStub("rpg")) {
        const v = G.rpg.standing;
        if (typeof v === "number") return v;
      }
      return Number(FLAGS.standing_acc) || 0;
    },
    /**
     * Standing tier 0 (best: Trusted) … 2 (neutral) … 4 (worst: Feared). Uses rpg's own
     * standingTier() so endings and NPC reactions always agree with the goggles STATUS title.
     */
    standingTier() {
      if (!G.isStub("rpg")) {
        const f = G.rpg.standingTier;
        if (typeof f === "function") {
          const t = safe("standingTier", () => f.call(G.rpg));
          if (typeof t === "number") return t;
        }
      }
      const k = lib.standingValue();
      return k >= 750 ? 0 : k >= 250 ? 1 : k > -250 ? 2 : k > -750 ? 3 : 4;
    },
    standingTitle() {
      if (G.isStub("rpg")) return "";
      const f = G.rpg.standingTitle;
      return typeof f === "function"
        ? safe("standingTitle", () => f.call(G.rpg)) || ""
        : "";
    },
    /** Attribute 1–10: brawn, reflex, grit, wits, senses, presence (5 when rpg is missing). */
    attr(key) {
      const k = String(key || "").toLowerCase();
      if (G.isStub("rpg")) return 5;
      const v = safe("attr", () => {
        if (typeof G.rpg.attr === "function") {
          const x = G.rpg.attr(k);
          if (typeof x === "number" && !isNaN(x)) return x;
        }
        return G.rpg.attributes && G.rpg.attributes[k];
      });
      return typeof v === "number" && !isNaN(v) && v > 0 ? v : 5;
    },
    /** Skill 0–100: firearms, melee, explosives, medicine, mechanics, electronics, stealth, persuasion, trade, survival. */
    skill(id) {
      if (G.isStub("rpg") || !G.rpg.skill) return 25;
      const v = safe("skill", () =>
        G.rpg.skill(String(id || "").toLowerCase()),
      );
      return typeof v === "number" && !isNaN(v) ? v : 0;
    },
    level() {
      return (!G.isStub("rpg") && G.rpg.level) || 1;
    },
    healFull() {
      const P = G.player;
      if (!P) return;
      P.heal(P.maxHp);
      P.rads = 0;
      G.events.emit("radsChanged", 0, 0);
      if (!G.isStub("rpg") && G.rpg.cureLimbs)
        safe("limbs", () => G.rpg.cureLimbs());
      lib.sfx("inject");
    },
    removeRads(n) {
      const P = G.player;
      P.rads = Math.max(0, P.rads - (n === undefined ? 1e9 : n));
      G.events.emit("radsChanged", P.rads, 0);
    },

    // ---- world queries ----
    inInterior() {
      return G.player && G.player.pos.x >= IXM();
    },
    near(x, z, r) {
      const p = G.player.pos;
      return Math.hypot(p.x - x, p.z - z) <= r;
    },
    dist(x, z) {
      const p = G.player.pos;
      return Math.hypot(p.x - x, p.z - z);
    },
    site(id) {
      return G.LAYOUT.getSite(id);
    },
    siteCenter(id) {
      const s = G.LAYOUT.getSite(id);
      return s ? { x: (s.x0 + s.x1) / 2, z: (s.z0 + s.z1) / 2 } : null;
    },
    loc(id) {
      return G.LAYOUT.getLocation(id);
    },

    /**
     * Landmark anchor lookup: tries each name in order on G.landmarks, then
     * returns the fallback (resolved to a free, grounded spot).
     */
    anchor(siteId, names, fallback, opts) {
      names = [].concat(names || []);
      // Memoised: anchors and static colliders never move, and the fallback path is a
      // spiral search (up to ~200 collider queries + ground raycasts). `los` checks and
      // explicit {noCache} lookups bypass the cache.
      const ck =
        opts && (opts.los || opts.noCache)
          ? null
          : siteId +
            "|" +
            names.join(",") +
            "|" +
            (fallback
              ? fallback.x +
                "," +
                fallback.z +
                "," +
                (fallback.y === undefined ? "" : fallback.y)
              : "-") +
            "|" +
            ((opts && opts.maxR) || "");
      if (ck && anchorCache.has(ck)) {
        const c = anchorCache.get(ck);
        return c ? Object.assign({}, c) : null;
      }
      let out = null;
      // Landmarks first, then the POI registry (interiors: tudor_city, waldorf …), the map (cryo_c9 …)
      // and the main story's lair module (site 'lair').
      const getters = [];
      if (!G.isStub("landmarks") && G.landmarks.getAnchor)
        getters.push((n) => G.landmarks.getAnchor(siteId, n));
      // (a landmark site keeps its old behaviour: only its own anchors, then the fallback)
      const isLandmark =
        !G.isStub("landmarks") &&
        !!G.landmarks[siteId] &&
        typeof G.landmarks[siteId] === "object";
      if (
        !isLandmark &&
        !G.isStub("pois") &&
        G.pois &&
        typeof G.pois.getAnchor === "function"
      )
        getters.push((n) => G.pois.getAnchor(siteId, n));
      if (
        !isLandmark &&
        siteId === "cryo_c9" &&
        !G.isStub("map") &&
        G.map &&
        typeof G.map.getAnchor === "function"
      )
        getters.push((n) => G.map.getAnchor(siteId, n));
      if (
        siteId === "lair" &&
        G.lair &&
        (typeof G.lair.getAnchor === "function" ||
          typeof G.lair.anchor === "function")
      ) {
        // the lair module's own anchor names, with the story's names as aliases
        const AL = {
          m61_shaft: "waldorf_arrival",
          bulkhead: "bulkhead_arrival",
          handcar_spur: "spur_arrival",
          platform: "platform_mid",
          candles_hall: "hall_centre",
          candle_r: "r_candle",
          candle_pod7: "pod7_candle",
          drill_crew: "drill",
        };
        const get = (n) =>
          typeof G.lair.getAnchor === "function"
            ? G.lair.getAnchor(n)
            : G.lair.anchor(n);
        getters.push((n) => get(n) || (AL[n] ? get(AL[n]) : null));
      }
      outer: for (const n of names) {
        for (const get of getters) {
          const a = safe("anchor", () => get(n));
          if (a && isFinite(a.x) && isFinite(a.z)) {
            out = {
              x: a.x,
              y: a.y || 0,
              z: a.z,
              anchored: true,
              name: n,
              yaw: a.yaw || 0,
            };
            break outer;
          }
        }
      }
      if (!out && fallback)
        out = lib.freeSpot(fallback.x, fallback.z, fallback.y, opts);
      if (ck && worldBuilt)
        anchorCache.set(ck, out ? Object.assign({}, out) : null);
      return out;
    },

    /**
     * Is a cylinder at (x,y,z) blocked by colliders?  stepTol: colliders whose top is
     * at most this far above y are treated as walkable (default 0.45 = a stair step;
     * NPC placement passes 0.15 so kerbs, planters and sandbags count as obstacles).
     */
    blocked(x, y, z, r, stepTol) {
      const W = G.world;
      r = r || 0.4;
      const tol = stepTol === undefined ? 0.45 : stepTol;
      const cs = W.query(x - r - 0.5, z - r - 0.5, x + r + 0.5, z + r + 0.5);
      for (const c of cs) {
        if (c.maxY <= y + tol || c.minY >= y + 1.7) continue;
        if (W.pointInCollider(c, x, z, r)) return true;
      }
      return false;
    },
    /**
     * Find a free, grounded spot near (x,z). Spirals outwards up to maxR.
     * opts: {y (reference height), maxR, los: {x,y,z} must see, radius}
     * Pass 1 is strict: the spot must be on the reference floor itself (±0.35 m) and
     * clear of anything taller than a kerb — no NPCs standing in planters or on desks.
     * Pass 2 (only if pass 1 finds nothing) accepts steps/raised floors as before.
     */
    freeSpot(x, z, y, opts) {
      opts = opts || {};
      const W = G.world;
      const hasY = y !== undefined && y !== null;
      const maxR = opts.maxR || 14;
      const mk = (strict) => (px, pz) => {
        // Off the land mask only with an explicit height (a pier deck, a ship, a jetty): the
        // spot must then be a real walkable surface above the water line.
        const land = px >= IXM() || !G.LAYOUT || G.LAYOUT.isLand(px, pz);
        if (!land && !hasY) return null;
        // Without an explicit height we want street / floor level, never a rooftop or car roof.
        const base = hasY ? y : px >= IXM() ? 0 : W.terrainHeight(px, pz);
        const gy = W.groundHeight(px, pz, base + 0.6, 0.3);
        if (Math.abs(gy - base) > (strict ? 0.35 : 1.6)) return null;
        if (px < IXM() && gy < W.waterLevel + (land ? -0.2 : 0.3)) return null;
        if (lib.blocked(px, gy, pz, opts.radius || 0.45, strict ? 0.15 : 0.45))
          return null;
        if (opts.los) {
          const a = V3(px, gy + 1.2, pz),
            b = V3(opts.los.x, (opts.los.y || 0) + 1.2, opts.los.z);
          if (!W.lineOfSight(a, b)) return null;
        }
        return gy;
      };
      for (const strict of [true, false]) {
        const ok = mk(strict);
        let g = ok(x, z);
        if (g !== null) return { x, y: g, z };
        for (let r = 0.8; r <= maxR; r += 0.8) {
          const n = Math.max(6, Math.round(r * 5));
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2 + r;
            const px = x + Math.cos(a) * r,
              pz = z + Math.sin(a) * r;
            g = ok(px, pz);
            if (g !== null) return { x: px, y: g, z: pz };
          }
        }
      }
      // give up gracefully: raw point on the ground
      const b0 = hasY ? y : x >= IXM() ? 0 : W.terrainHeight(x, z);
      return { x, y: W.groundHeight(x, z, b0 + 0.6, 0.3), z, forced: true };
    },

    /** Door lookups. */
    doors() {
      return (G.world && G.world.doors) || [];
    },
    /** The door inside Cryo Unit C-9 (top of the service stair) that leads out to LAYOUT.cryoExit. */
    cryoExitDoor() {
      const ex = G.LAYOUT.cryoExit,
        I = G.LAYOUT.INTERIORS && G.LAYOUT.INTERIORS.cryo_c9;
      if (!ex || !I) return null;
      const o = I.origin;
      let best = null,
        bd = 1e9;
      for (const d of lib.doors()) {
        const t = d.def && d.def.target,
          p = d.def && d.def.pos;
        if (!t || !p) continue;
        if (p.x < IXM() || Math.hypot(p.x - o.x, p.z - o.z) > 260) continue;
        const dd = Math.hypot(t.x - ex.x, t.z - ex.z);
        if (dd < 60 && dd < bd) {
          bd = dd;
          best = d;
        }
      }
      return best;
    },
    /** Exterior door whose target lies inside the given interior cell. */
    doorInto(interiorKey) {
      const o =
        G.LAYOUT.INTERIORS[interiorKey] &&
        G.LAYOUT.INTERIORS[interiorKey].origin;
      if (!o) return null;
      for (const d of lib.doors()) {
        const t = d.def && d.def.target,
          p = d.def && d.def.pos;
        if (t && p && p.x < IXM() && Math.hypot(t.x - o.x, t.z - o.z) < 200)
          return d;
      }
      return null;
    },

    // ---- actors ----
    npc(id) {
      const a = lib.npcs[id];
      if (a && !a._removed) return a;
      if (!G.isStub("actors") && G.actors.get) {
        const b = safe("actors.get", () => G.actors.get(id));
        if (b) {
          lib.npcs[id] = b;
          return b;
        }
      }
      return null;
    },
    alive(id) {
      const a = lib.npc(id);
      return !!a && !a.dead;
    },
    isDead(id) {
      return !!FLAGS["dead_" + id];
    },
    /**
     * Spawn a named NPC (idempotent per stable id). def is a G.actors.spawn def
     * plus {at:{site, anchors:[..], fallback:{x,z,y?}, los?}} for placement.
     */
    spawnNPC(def) {
      if (G.isStub("actors") || !G.actors.spawn) return null;
      if (def.skip) return null;
      // Stable ids: combat restores saved state (position, hostility, corpse + loot) on spawn.
      const existing = safe(
        "actors.get",
        () => G.actors.get && G.actors.get(def.id),
      );
      if (existing && !existing.removed && !existing._removed) {
        lib.npcs[def.id] = existing;
        return existing;
      }
      let pos = def.pos;
      if (def.at) {
        const at = def.at;
        pos = at.site
          ? lib.anchor(at.site, at.anchors, at.fallback, {
              los: at.los,
              maxR: at.maxR,
            })
          : lib.freeSpot(at.fallback.x, at.fallback.z, at.fallback.y, {
              los: at.los,
              maxR: at.maxR,
            });
      }
      if (!pos) return null;
      const spawnDef = Object.assign({}, def);
      delete spawnDef.at;
      spawnDef.pos = { x: pos.x, y: pos.y || 0, z: pos.z };
      if (spawnDef.home === "here")
        spawnDef.home = { x: pos.x, z: pos.z, r: def.homeR || 4 };
      if (spawnDef.merchant && spawnDef.merchant.stock)
        spawnDef.merchant = Object.assign({}, spawnDef.merchant, {
          stock: lib.resolveStock(spawnDef.merchant.stock),
        });
      if (spawnDef.inventory)
        spawnDef.inventory = lib.resolveStock(spawnDef.inventory);
      if (spawnDef.weapon && Array.isArray(spawnDef.weapon))
        spawnDef.weapon = lib.item(spawnDef.weapon) || undefined;
      const a = safe("spawn:" + def.id, () => G.actors.spawn(spawnDef));
      if (a) {
        lib.npcs[def.id] = a;
        a.questNpc = true;
        // Killed earlier (older save without combat state): keep them dead, corpse lootable.
        if (FLAGS["dead_" + def.id] && !a.dead && a.kill)
          safe("restoreDead", () => a.kill({ silent: true, restore: true }));
        if (def.lookYaw !== undefined) a.yaw = def.lookYaw;
      }
      return a;
    },
    /** stock: [[idOrCandidates, n], ...] → only resolvable ids. */
    resolveStock(stock) {
      const out = [];
      for (const s of stock || []) {
        const id =
          Array.isArray(s[0]) || s[0] instanceof RegExp
            ? lib.item(s[0])
            : lib.item(s[0]);
        if (id) out.push([id, s[1] || 1]);
      }
      return out;
    },
    removeNPC(id) {
      const a = lib.npc(id);
      if (!a) return;
      if (!G.isStub("actors") && G.actors.remove)
        safe("remove", () => G.actors.remove(a));
      a._removed = true;
      delete lib.npcs[id];
    },
    say(id, text, dur) {
      const a = lib.npc(id);
      if (a && a.say && !a.dead) safe("say", () => a.say(text, dur));
    },
    hostile(id, v) {
      const a = lib.npc(id);
      if (a && a.setHostile && !a.dead)
        safe("hostile", () => a.setHostile(v !== false));
    },
    /**
     * Faction truce / hostility.
     *  - GLOBAL (x undefined): changes the player↔faction relation city-wide through
     *    G.combat.setRelation (saved by combat). Use only for real allegiance changes
     *    (joining the Iron Covenant makes the Continuity hostile everywhere, etc.).
     *  - LOCAL, hostile=false: registers a truce ZONE (see truceZone) — only actors of
     *    that faction inside the radius stand down; patrols elsewhere stay hostile.
     *  - LOCAL, hostile=true: ends overlapping truce zones and turns the actors in the
     *    radius hostile. Never touches the global relation.
     * opts (local truces): {id, cond()} — a cond'd zone lifts itself when cond() is false.
     */
    factionTruce(faction, x, z, r, hostile, opts) {
      if (x === undefined) {
        if (!G.isStub("combat") && G.combat.setRelation)
          safe("relation", () =>
            G.combat.setRelation(
              "player",
              faction,
              hostile ? "hostile" : "neutral",
            ),
          );
        let n = 0;
        for (const a of lib.actorsOf(faction)) {
          if (!a.setHostile) continue;
          // per-actor overrides would shadow the new relation: clear them (keep quest-scripted ones)
          safe("truce", () => a.setHostile(hostile ? true : undefined));
          delete a.questTruce;
          n++;
        }
        for (const id in truceZones())
          if (truceZones()[id].faction === faction && hostile)
            lib.endTruce(id, false);
        return n;
      }
      if (!hostile) {
        const id =
          (opts && opts.id) ||
          faction + "@" + Math.round(x) + "," + Math.round(z);
        lib.truceZone(id, { faction, x, z, r, cond: opts && opts.cond });
        return applyTruceZone(id, TRUCE_LIVE.get(id) || truceZones()[id]);
      }
      // local hostility: lift any truce zone that covers this area, then aggro the locals
      const zs = truceZones();
      for (const id in zs) {
        const t = zs[id];
        if (t.faction === faction && Math.hypot(t.x - x, t.z - z) < t.r + r)
          lib.endTruce(id, false);
      }
      for (const [id, t] of TRUCE_LIVE)
        if (t.faction === faction && Math.hypot(t.x - x, t.z - z) < t.r + r)
          lib.endTruce(id, false);
      let n = 0;
      for (const a of lib.actorsOf(faction)) {
        if (Math.hypot(a.pos.x - x, a.pos.z - z) > r || !a.setHostile) continue;
        delete a.questTruce;
        safe("hostile", () => a.setHostile(true));
        n++;
      }
      return n;
    },
    /** Live actors of a faction. */
    actorsOf(faction) {
      if (G.isStub("actors") || !G.actors.list) return [];
      return (safe("list", () => G.actors.list()) || []).filter(
        (a) => a && !a.dead && a.faction === faction && a.pos,
      );
    },
    /**
     * Register (or refresh) a local truce zone. Zones without `cond` are persistent
     * (saved in flags); zones with `cond` live in memory and are re-registered by the
     * content that owns them. Poll: truced actors are tagged `a.questTruce = id`.
     */
    truceZone(id, def) {
      if (def.cond) {
        TRUCE_LIVE.set(id, Object.assign({ id }, def));
        return;
      }
      const zs = truceZones();
      zs[id] = { faction: def.faction, x: def.x, z: def.z, r: def.r };
    },
    /** Lift a truce zone: its actors fall back to the normal faction relation. */
    endTruce(id, keepZone) {
      const t = TRUCE_LIVE.get(id) || truceZones()[id];
      if (t) revertTruceZone(id);
      if (!keepZone) {
        TRUCE_LIVE.delete(id);
        delete truceZones()[id];
      }
    },
    /** Teleport an NPC (fade-free) */
    moveNPC(id, pos) {
      const a = lib.npc(id);
      if (!a || a.dead) return;
      const p = pos.x !== undefined ? pos : null;
      if (!p) return;
      a.pos.set(p.x, p.y || 0, p.z);
      if (a.home) {
        a.home.x = p.x;
        a.home.z = p.z;
      }
    },
    startDialogue(dlgId, actorId) {
      if (G.isStub("dialogue") || !G.dialogue.start) return false;
      const a = actorId ? lib.npc(actorId) : null;
      safe("dlgstart", () => G.dialogue.start(dlgId, a));
      return true;
    },

    // ---- world objects ----
    /** Spawn a terminal (props module, or a small procedural fallback). */
    spawnTerminal(terminalId, pos, yaw) {
      if (!pos) return null;
      let h = null;
      // Anchors sitting on a desk/console (well above the floor) get a desk-top terminal.
      const floorY = G.world.groundHeight(
        pos.x,
        pos.z,
        (pos.y || 0) - 0.6,
        0.1,
      );
      const onDesk = (pos.y || 0) - floorY > 0.4;
      if (!G.isStub("props") && G.props.spawn)
        h = safe("props.terminal", () =>
          G.props.spawn("terminal", {
            x: pos.x,
            y: pos.y || 0,
            z: pos.z,
            yaw: yaw || 0,
            terminalId,
            mount: onDesk ? "desk" : undefined,
            persistent: true,
          }),
        );
      if (!h) h = fallbackTerminal(terminalId, pos, yaw || 0);
      lib.world["term_" + terminalId] = {
        pos: V3(pos.x, (pos.y || 0) + 1.1, pos.z),
        handle: h,
      };
      return h;
    },
    termPos(terminalId) {
      const t = lib.world["term_" + terminalId];
      return t ? t.pos : null;
    },
    /** Spawn a prop through props (defensive). */
    prop(type, opts) {
      if (G.isStub("props") || !G.props.spawn) return null;
      return safe("props." + type, () => G.props.spawn(type, opts));
    },
    /** Place a world pickup once per game (key = persistent flag). */
    pickup(key, itemId, n, pos) {
      if (FLAGS["got_" + key]) return null;
      const id = Array.isArray(itemId) ? lib.item(itemId) : itemId;
      if (!id) return null;
      pos = lib.unburyPickup(pos);
      let h = null;
      if (!G.isStub("items") && G.items.spawnPickup)
        h = safe("spawnPickup:" + id, () =>
          G.items.spawnPickup(id, n || 1, V3(pos.x, pos.y || 0, pos.z), {
            static: false,
            noSave: true,
            keepY: pos.y !== undefined,
          }),
        );
      if (!h) h = fallbackPickup(key, id, n || 1, pos);
      lib.pickups[key] = { id, pos, handle: h };
      lib.dyn(h);
      return h;
    },

    /**
     * Quest items are placed at landmark anchors ('safe', 'loot', 'footlocker'…) where a solid prop often
     * stands: the item then sat INSIDE the safe / crate / counter and could never be focused (every line of
     * sight hits the box) — e.g. Wendell's ring, the NYPL books, two medallions. Lift an enclosed item onto
     * the top of what encloses it (up to 1.5 m), else put it on the floor beside it.
     */
    unburyPickup(pos) {
      const W = G.world;
      if (!pos || !W || !W.query || !worldBuilt) return pos;
      const floor = pos.x >= IXM() ? 0 : W.terrainHeight(pos.x, pos.z);
      const y0 =
        pos.y !== undefined
          ? pos.y
          : W.groundHeight(pos.x, pos.z, floor + 0.6, 0.3);
      let enc = null;
      for (const c of W.query(
        pos.x - 0.2,
        pos.z - 0.2,
        pos.x + 0.2,
        pos.z + 0.2,
      )) {
        if (
          c.minY <= y0 + 0.05 &&
          c.maxY > y0 + 0.1 &&
          W.pointInCollider(c, pos.x, pos.z, 0.04)
        ) {
          if (!enc || c.maxY > enc.maxY) enc = c;
        }
      }
      if (!enc) return pos;
      // where the player would stand to reach it
      const f = lib.freeSpot(pos.x, pos.z, Math.min(y0, enc.minY + 0.05), {
        maxR: 3,
        radius: 0.25,
      });
      const stand = f && !f.forced ? f.y : Math.min(y0, enc.minY);
      const top = W.groundHeight(pos.x, pos.z, enc.maxY + 0.3, 0.1);
      // on top of it only while that stays below eye level (an item above the eye is hidden by the box itself)
      if (
        top > y0 + 0.05 &&
        top - stand <= 1.3 &&
        !lib.blocked(pos.x, top, pos.z, 0.08, 0.02)
      )
        return { x: pos.x, y: top + 0.02, z: pos.z };
      return f && !f.forced ? { x: f.x, y: f.y, z: f.z } : pos;
    },
    /** Register a dynamic world object (prop/pickup handle) to be removed on reset. */
    dyn(h) {
      if (h) DYN.push(h);
      return h;
    },

    // ---- triggers ----
    /**
     * Proximity trigger: {id, x,z,r | pos(): {x,z}, interior?, cond?(), fire(), once=true, y?, dy?}
     * Fires while the player is within r (checked 5×/s). once-triggers persist via flags.
     */
    trigger(def) {
      if (def.once === undefined) def.once = true;
      TRIGGERS.push(def);
      return def;
    },

    // ---- counters for kill/collect objectives ----
    counter(name) {
      return Number(FLAGS["cnt_" + name]) || 0;
    },
    bump(name, n) {
      return lib.incFlag("cnt_" + name, n || 1);
    },

    /** Fade + teleport the player (ferries, elevators, scripted moves). */
    travel(x, y, z, yaw, midFn) {
      G.fadeTransition(() => {
        G.player.teleport(x, y, z, yaw);
        if (midFn) safe("travel", midFn);
      }, 0.6);
    },
    /**
     * Scripted delays in GAME time (ticked from update with dt, so they pause with the
     * goggles menu, dialogue, menus and loading screens) and cancelled on reset / load.
     * tag (optional) lets other code ask whether something is pending (hasPending).
     */
    later(sec, fn, tag) {
      LATER.push({
        t: Math.max(0, sec || 0),
        fn,
        tag: tag || null,
        gen: lib.gen,
      });
    },
    hasPending(tag) {
      return LATER.some((e) => e.tag === tag && e.gen === lib.gen);
    },
    /**
     * A tiny camera-script runner driven from update() (never requestAnimationFrame):
     * step(e, t) receives eased 0..1 progress; freezes the player while running and
     * always unfreezes (also on reset). Pauses with the game.
     */
    cinematic(dur, step, done) {
      if (CINE && CINE.done) safe("cine", CINE.done);
      CINE = { t: 0, dur: Math.max(0.01, dur), step, done, gen: lib.gen };
      if (G.player) G.player.frozen = true;
    },
    cineActive() {
      return !!CINE;
    },
    /** Counter refresh ("2/3 roaches"): HUD line + quest-log refresh WITHOUT the quest jingle. */
    refresh(id) {
      const v = view(id);
      if (!v || !v.active) return;
      G.events.emit("questCounter", v);
      if (v.stageText) lib.notify(v.stageText, { sub: v.name, quiet: true });
    },
    /** Full-screen colour wash (cosmetic DOM overlay; removed on reset). */
    overlay(color, fadeIn, hold, fadeOut, maxOpacity) {
      if (G.SMOKE) return null;
      const el = document.createElement("div");
      el.style.cssText =
        "position:fixed;inset:0;background:" +
        color +
        ";opacity:" +
        (fadeIn ? 0 : maxOpacity || 1) +
        ";pointer-events:none;z-index:870;transition:opacity " +
        (fadeIn || fadeOut || 1) +
        "s ease-in-out";
      document.body.appendChild(el);
      OVERLAYS.push(el);
      // a world-timed wash must never sit over a menu: gone as soon as the game leaves play / cutscene
      const onState = (st) => {
        if (st !== "play" && st !== "cutscene") kill();
      };
      const kill = () => {
        G.events.off("state", onState);
        const i = OVERLAYS.indexOf(el);
        if (i >= 0) OVERLAYS.splice(i, 1);
        el.remove();
      };
      G.events.on("state", onState);
      if (fadeIn) {
        void el.offsetWidth;
        el.style.opacity = String(maxOpacity || 0.92);
      }
      lib.later((fadeIn || 0) + (hold || 0), () => {
        el.style.transition = "opacity " + (fadeOut || 1) + "s ease-in-out";
        el.style.opacity = "0";
      });
      lib.later((fadeIn || 0) + (hold || 0) + (fadeOut || 1) + 0.3, kill);
      return el;
    },
    gen: 0,
    completeSilently,
    /**
     * The VIGIL goggles item: rpg's real equippable 'vigil_goggles' when it exists,
     * else the quest fallback 'q_vigil_goggles' (apparel, slot 'eyes', defined in 10_items.js).
     */
    gogglesId() {
      if (!G.isStub("items") && G.items.get && G.items.get("vigil_goggles"))
        return "vigil_goggles";
      return "q_vigil_goggles";
    },
    /** Hand over the VIGIL goggles and put them on (sets flag got_goggles: the goggles gate lifts). */
    giveGoggles(silent) {
      FLAGS.got_goggles = true;
      const id = lib.gogglesId();
      if (!G.isStub("inventory")) {
        if (!lib.has(id)) lib.give(id, 1, silent !== false);
        if (G.inventory.equip)
          safe("equipGoggles", () =>
            G.inventory.equip(id, { silent: true, force: true }),
          );
      }
      G.events.emit("questFlag", "got_goggles", true);
    },
  };
  // Marker internals for the quest audit (75_audit.js) and debug tooling.
